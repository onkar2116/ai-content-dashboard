const express = require('express')
const PDFDocument = require('pdfkit')
const auth = require('../middleware/auth')
const { analyzeContent } = require('../services/gemini')
const Analysis = require('../models/Analysis')

const router = express.Router()

// Get analysis stats for current user
router.get('/stats', auth, async (req, res) => {
  try {
    const totalAnalyses = await Analysis.countDocuments({ user: req.user._id })
    const lastAnalysis = await Analysis.findOne({ user: req.user._id })
      .sort({ createdAt: -1 })
      .select('createdAt')
    res.json({ totalAnalyses, lastAnalysis: lastAnalysis?.createdAt || null })
  } catch (err) {
    console.error('Stats error:', err.message)
    res.status(500).json({ message: 'Failed to fetch stats' })
  }
})

// Get analysis history for current user (paginated)
router.get('/history', auth, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1)
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10))
    const search = req.query.search?.trim() || ''

    const filter = { user: req.user._id }
    if (search) {
      filter.inputText = { $regex: search, $options: 'i' }
    }

    const [analyses, total] = await Promise.all([
      Analysis.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .select('inputText summary sentiment topics tone createdAt'),
      Analysis.countDocuments(filter),
    ])

    res.json({
      analyses,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (err) {
    console.error('History error:', err.message)
    res.status(500).json({ message: 'Failed to fetch history' })
  }
})

// Export analysis as PDF
router.get('/:id/export/pdf', auth, async (req, res) => {
  try {
    const analysis = await Analysis.findOne({
      _id: req.params.id,
      user: req.user._id,
    })

    if (!analysis) {
      return res.status(404).json({ message: 'Analysis not found' })
    }

    const doc = new PDFDocument({ margin: 50 })

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="analysis-${analysis._id}.pdf"`
    )

    doc.pipe(res)

    // Title
    doc.fontSize(22).font('Helvetica-Bold').text('AI Content Analysis', { align: 'center' })
    doc.moveDown(0.3)
    doc.fontSize(10).font('Helvetica').fillColor('#666666')
      .text(`Generated on ${new Date(analysis.createdAt).toLocaleString()}`, { align: 'center' })
    doc.moveDown(1.5)

    // Divider
    doc.strokeColor('#e5e7eb').lineWidth(1)
      .moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y).stroke()
    doc.moveDown(1)

    // Input text
    doc.fontSize(13).font('Helvetica-Bold').fillColor('#111827').text('Original Text')
    doc.moveDown(0.3)
    doc.fontSize(10).font('Helvetica').fillColor('#374151')
      .text(analysis.inputText, { lineGap: 3 })
    doc.moveDown(1.2)

    // Sections
    const sections = [
      { title: 'Summary', content: analysis.summary },
      { title: 'Sentiment', content: analysis.sentiment },
      { title: 'Key Topics', content: analysis.topics },
      { title: 'Tone', content: analysis.tone },
    ]

    for (const section of sections) {
      if (!section.content) continue
      doc.fontSize(13).font('Helvetica-Bold').fillColor('#111827').text(section.title)
      doc.moveDown(0.3)
      doc.fontSize(10).font('Helvetica').fillColor('#374151')
        .text(section.content, { lineGap: 3 })
      doc.moveDown(1)
    }

    // Footer
    doc.moveDown(1)
    doc.strokeColor('#e5e7eb').lineWidth(1)
      .moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y).stroke()
    doc.moveDown(0.5)
    doc.fontSize(8).fillColor('#9ca3af')
      .text('Exported from AI Content Dashboard', { align: 'center' })

    doc.end()
  } catch (err) {
    console.error('PDF export error:', err.message)
    res.status(500).json({ message: 'Failed to generate PDF' })
  }
})

// Export analysis as Markdown
router.get('/:id/export/markdown', auth, async (req, res) => {
  try {
    const analysis = await Analysis.findOne({
      _id: req.params.id,
      user: req.user._id,
    })

    if (!analysis) {
      return res.status(404).json({ message: 'Analysis not found' })
    }

    const date = new Date(analysis.createdAt).toLocaleString()
    const lines = [
      '# AI Content Analysis',
      '',
      `> Generated on ${date}`,
      '',
      '---',
      '',
      '## Original Text',
      '',
      analysis.inputText,
      '',
      '## Summary',
      '',
      analysis.summary || 'N/A',
      '',
      '## Sentiment',
      '',
      analysis.sentiment || 'N/A',
      '',
      '## Key Topics',
      '',
      analysis.topics || 'N/A',
      '',
      '## Tone',
      '',
      analysis.tone || 'N/A',
      '',
      '---',
      '',
      '*Exported from AI Content Dashboard*',
    ]

    const markdown = lines.join('\n')

    res.setHeader('Content-Type', 'text/markdown; charset=utf-8')
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="analysis-${analysis._id}.md"`
    )
    res.send(markdown)
  } catch (err) {
    console.error('Markdown export error:', err.message)
    res.status(500).json({ message: 'Failed to generate markdown' })
  }
})

// Delete a single analysis
router.delete('/:id', auth, async (req, res) => {
  try {
    const analysis = await Analysis.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    })

    if (!analysis) {
      return res.status(404).json({ message: 'Analysis not found' })
    }

    res.json({ message: 'Analysis deleted' })
  } catch (err) {
    console.error('Delete error:', err.message)
    res.status(500).json({ message: 'Failed to delete analysis' })
  }
})

router.post('/', auth, async (req, res) => {
  const text = typeof req.body.text === 'string' ? req.body.text.trim() : ''

  if (!text) {
    return res.status(400).json({ message: 'Text is required' })
  }

  if (text.length < 20) {
    return res.status(400).json({ message: 'Text must be at least 20 characters for meaningful analysis' })
  }

  if (text.length > 50000) {
    return res.status(400).json({ message: 'Text exceeds 50,000 character limit' })
  }

  try {
    const result = await analyzeContent(text)

    // Save to MongoDB
    const analysis = await Analysis.create({
      user: req.user._id,
      inputText: text,
      ...result,
    })

    res.json({ _id: analysis._id, ...result })
  } catch (err) {
    console.error('Analysis error:', err.message)

    if (err.message?.includes('API key')) {
      return res.status(500).json({ message: 'AI service not configured. Please set GEMINI_API_KEY.' })
    }

    if (err.message?.includes('429') || err.message?.includes('quota')) {
      return res.status(429).json({ message: 'AI rate limit reached. Please wait a minute and try again.' })
    }

    if (err instanceof SyntaxError) {
      return res.status(500).json({ message: 'AI returned an unexpected format. Please try again.' })
    }

    res.status(500).json({ message: 'Analysis failed. Please try again.' })
  }
})

module.exports = router
