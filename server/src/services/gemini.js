const { GoogleGenerativeAI } = require('@google/generative-ai')

let model = null

function getModel() {
  if (!model) {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL || 'gemini-2.5-flash-lite',
    })
  }
  return model
}

const PROMPT = `You are a content analysis AI. Analyze the following text and return a JSON object with exactly these 4 fields:

1. "summary" — A concise 2-3 sentence summary of the content.
2. "sentiment" — The overall sentiment. Start with one word (Positive, Negative, Neutral, or Mixed), then a brief explanation of why. Example: "Positive — The text expresses enthusiasm and optimism about the product launch."
3. "topics" — The 3-5 main topics or themes, as a comma-separated string. Example: "Machine Learning, Healthcare, Data Privacy"
4. "tone" — The writing tone/style. Start with one word (Formal, Informal, Academic, Conversational, Persuasive, Informative, etc.), then a brief explanation. Example: "Persuasive — The author uses compelling arguments and emotional appeals."

IMPORTANT: Return ONLY valid JSON, no markdown, no code fences, no extra text.

Text to analyze:
`

const TIMEOUT_MS = 30000

const analyzeContent = async (text) => {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const result = await getModel().generateContent({
      contents: [{ role: 'user', parts: [{ text: PROMPT + text }] }],
    }, { signal: controller.signal })

    const response = result.response.text()

    // Clean response in case Gemini wraps it in code fences
    const cleaned = response
      .replace(/```json\s*/gi, '')
      .replace(/```\s*/g, '')
      .trim()

    const parsed = JSON.parse(cleaned)

    return {
      summary: parsed.summary || '',
      sentiment: parsed.sentiment || '',
      topics: parsed.topics || '',
      tone: parsed.tone || '',
    }
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error('AI analysis timed out. Please try again with shorter text.')
    }
    throw err
  } finally {
    clearTimeout(timeout)
  }
}

module.exports = { analyzeContent }
