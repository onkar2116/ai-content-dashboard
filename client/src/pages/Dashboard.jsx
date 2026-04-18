import { useState, useEffect, useCallback } from 'react'
import api from '../lib/api'
import { useAuth } from '../context/AuthContext'

function downloadFile(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

function Dashboard() {
  const { user } = useAuth()
  const [text, setText] = useState('')
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isRateLimit, setIsRateLimit] = useState(false)
  const [stats, setStats] = useState({ totalAnalyses: 0, lastAnalysis: null })

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0
  const charCount = text.length

  useEffect(() => {
    api.get('/api/analyze/stats')
      .then(({ data }) => setStats(data))
      .catch(() => {})
  }, [results])

  const handleAnalyze = async () => {
    const trimmed = text.trim()
    if (!trimmed) return

    if (trimmed.length < 20) {
      setError('Text must be at least 20 characters for meaningful analysis.')
      return
    }

    setLoading(true)
    setError('')
    setIsRateLimit(false)
    setResults(null)

    try {
      const { data } = await api.post('/api/analyze', { text: trimmed })
      setResults(data)
    } catch (err) {
      const msg = err.response?.data?.message || 'Analysis failed. Please try again.'
      setError(msg)
      setIsRateLimit(!!err.response?.data?.isRateLimit)
    } finally {
      setLoading(false)
    }
  }

  const handleClear = () => {
    setText('')
    setResults(null)
    setError('')
    setIsRateLimit(false)
  }

  const handleExport = useCallback(async (format) => {
    if (!results?._id) return
    try {
      const res = await api.get(`/api/analyze/${results._id}/export/${format}`, {
        responseType: 'blob',
      })
      const ext = format === 'pdf' ? 'pdf' : 'md'
      downloadFile(res.data, `analysis.${ext}`)
    } catch {
      setError(`Failed to export as ${format.toUpperCase()}`)
    }
  }, [results])

  const timeAgo = (dateStr) => {
    if (!dateStr) return 'Never'
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'Just now'
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    return `${Math.floor(hrs / 24)}d ago`
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Welcome Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Welcome back, {user?.name?.split(' ')[0] || 'there'}
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Paste any content below to get AI-powered insights.</p>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
            </svg>
          }
          label="Total Analyses"
          value={stats.totalAnalyses}
        />
        <StatCard
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          }
          label="Last Analysis"
          value={timeAgo(stats.lastAnalysis)}
        />
        <StatCard
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
            </svg>
          }
          label="Words"
          value={wordCount.toLocaleString()}
        />
        <StatCard
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
            </svg>
          }
          label="Characters"
          value={charCount.toLocaleString()}
        />
      </div>

      {/* Text Input Area */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-indigo-500 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
            </svg>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Content Input</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-400 dark:text-gray-500">
            <span>{wordCount} words</span>
            <span>{charCount} / 50,000</span>
          </div>
        </div>

        <div className="p-4">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste your article, blog post, email, or any text here for AI-powered analysis..."
            rows={8}
            maxLength={50000}
            className="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50 rounded-lg p-4 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 resize-none text-sm leading-relaxed"
          />
          {text.trim().length > 0 && text.trim().length < 20 && (
            <p className="text-xs text-amber-600 dark:text-amber-500 mt-1 px-1">Minimum 20 characters needed for analysis ({20 - text.trim().length} more)</p>
          )}
        </div>

        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-200 dark:border-gray-800">
          <button
            onClick={handleClear}
            disabled={!text.trim() && !results}
            className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            Clear
          </button>
          <button
            onClick={handleAnalyze}
            disabled={loading || text.trim().length < 20}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-colors"
          >
            {loading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Analyzing...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
                </svg>
                Analyze Content
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className={`flex items-center gap-3 p-4 rounded-xl animate-fade-in ${isRateLimit ? 'bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/50' : 'bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800/50'}`}>
          {isRateLimit ? (
            <svg className="w-5 h-5 text-amber-500 dark:text-amber-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-red-500 dark:text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
            </svg>
          )}
          <p className={`text-sm ${isRateLimit ? 'text-amber-700 dark:text-amber-300' : 'text-red-700 dark:text-red-300'}`}>{error}</p>
        </div>
      )}

      {/* Skeleton Loader */}
      {loading && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-indigo-500 dark:text-indigo-400 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Analyzing your content...</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {['indigo', 'emerald', 'amber', 'violet'].map((color) => (
              <SkeletonCard key={color} accentColor={color} />
            ))}
          </div>
        </div>
      )}

      {/* Results Display */}
      {results && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-500 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Analysis Results</h3>
            </div>
            {results._id && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleExport('pdf')}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                  PDF
                </button>
                <button
                  onClick={() => handleExport('markdown')}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                  Markdown
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ResultCard
              title="Summary"
              content={results.summary}
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                </svg>
              }
              accentColor="indigo"
              delay={0}
            />
            <ResultCard
              title="Sentiment"
              content={results.sentiment}
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 0 1-6.364 0M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Z" />
                </svg>
              }
              accentColor="emerald"
              delay={1}
            />
            <ResultCard
              title="Key Topics"
              content={results.topics}
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6Z" />
                </svg>
              }
              accentColor="amber"
              delay={2}
            />
            <ResultCard
              title="Tone"
              content={results.tone}
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 1 1 0-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 0 1-1.44-4.282m3.102.069a18.03 18.03 0 0 1-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 0 1 8.835 2.535M10.34 6.66a23.847 23.847 0 0 0 8.835-2.535m0 0A23.74 23.74 0 0 0 18.795 3m.38 1.125a23.91 23.91 0 0 1 1.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 0 0 1.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 0 1 0 3.46" />
                </svg>
              }
              accentColor="violet"
              delay={3}
            />
          </div>
        </div>
      )}

      {/* Empty State */}
      {!results && !loading && !error && (
        <div className="text-center py-12 px-6">
          <svg className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-700 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={0.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
          </svg>
          <h3 className="text-gray-400 dark:text-gray-500 font-medium mb-1">No analysis yet</h3>
          <p className="text-gray-400 dark:text-gray-600 text-sm">Paste some text above and click Analyze to get started.</p>
        </div>
      )}
    </div>
  )
}

const accentStyles = {
  indigo: {
    bg: 'bg-indigo-50 dark:bg-indigo-500/10',
    border: 'border-indigo-200 dark:border-indigo-500/20',
    icon: 'text-indigo-500 dark:text-indigo-400',
    title: 'text-indigo-600 dark:text-indigo-400',
    skeleton: 'bg-indigo-200 dark:bg-indigo-500/20',
  },
  emerald: {
    bg: 'bg-emerald-50 dark:bg-emerald-500/10',
    border: 'border-emerald-200 dark:border-emerald-500/20',
    icon: 'text-emerald-500 dark:text-emerald-400',
    title: 'text-emerald-600 dark:text-emerald-400',
    skeleton: 'bg-emerald-200 dark:bg-emerald-500/20',
  },
  amber: {
    bg: 'bg-amber-50 dark:bg-amber-500/10',
    border: 'border-amber-200 dark:border-amber-500/20',
    icon: 'text-amber-500 dark:text-amber-400',
    title: 'text-amber-600 dark:text-amber-400',
    skeleton: 'bg-amber-200 dark:bg-amber-500/20',
  },
  violet: {
    bg: 'bg-violet-50 dark:bg-violet-500/10',
    border: 'border-violet-200 dark:border-violet-500/20',
    icon: 'text-violet-500 dark:text-violet-400',
    title: 'text-violet-600 dark:text-violet-400',
    skeleton: 'bg-violet-200 dark:bg-violet-500/20',
  },
}

function SkeletonCard({ accentColor }) {
  const style = accentStyles[accentColor] || accentStyles.indigo

  return (
    <div className={`rounded-xl p-5 border ${style.bg} ${style.border} animate-pulse`}>
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-5 h-5 rounded ${style.skeleton}`} />
        <div className={`h-4 w-20 rounded ${style.skeleton}`} />
      </div>
      <div className="space-y-2">
        <div className={`h-3 w-full rounded ${style.skeleton}`} />
        <div className={`h-3 w-4/5 rounded ${style.skeleton}`} />
        <div className={`h-3 w-3/5 rounded ${style.skeleton}`} />
      </div>
    </div>
  )
}

function ResultCard({ title, content, icon, accentColor, delay = 0 }) {
  const style = accentStyles[accentColor] || accentStyles.indigo

  return (
    <div
      className={`rounded-xl p-5 border ${style.bg} ${style.border} animate-slide-up`}
      style={{ animationDelay: `${delay * 100}ms` }}
    >
      <div className="flex items-center gap-2 mb-3">
        <span className={style.icon}>{icon}</span>
        <h3 className={`text-sm font-semibold uppercase tracking-wide ${style.title}`}>
          {title}
        </h3>
      </div>
      <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{content}</p>
    </div>
  )
}

function StatCard({ icon, label, value }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800 flex items-center gap-3">
      <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-indigo-500 dark:text-indigo-400 shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-lg font-semibold text-gray-900 dark:text-white leading-tight">{value}</p>
        <p className="text-xs text-gray-500">{label}</p>
      </div>
    </div>
  )
}

export default Dashboard
