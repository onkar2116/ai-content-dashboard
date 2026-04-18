import { useState, useEffect, useCallback } from 'react'
import api from '../lib/api'

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

function History() {
  const [analyses, setAnalyses] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ total: 0, pages: 1 })
  const [expanded, setExpanded] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)

  const fetchHistory = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page, limit: 10 })
      if (search) params.set('search', search)
      const { data } = await api.get(`/api/analyze/history?${params}`)
      setAnalyses(data.analyses)
      setPagination(data.pagination)
    } catch {
      setAnalyses([])
    } finally {
      setLoading(false)
    }
  }, [page, search])

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
    setSearch(searchInput)
  }

  const handleClearSearch = () => {
    setSearchInput('')
    setSearch('')
    setPage(1)
  }

  const handleDelete = async (id) => {
    if (deleting) return
    if (confirmDelete !== id) {
      setConfirmDelete(id)
      return
    }
    setConfirmDelete(null)
    setDeleting(id)
    try {
      await api.delete(`/api/analyze/${id}`)
      setAnalyses((prev) => prev.filter((a) => a._id !== id))
      setPagination((prev) => ({ ...prev, total: prev.total - 1 }))
      if (expanded === id) setExpanded(null)
    } catch {
      // silent fail
    } finally {
      setDeleting(null)
    }
  }

  const handleExport = async (id, format) => {
    try {
      const res = await api.get(`/api/analyze/${id}/export/${format}`, {
        responseType: 'blob',
      })
      const ext = format === 'pdf' ? 'pdf' : 'md'
      downloadFile(res.data, `analysis.${ext}`)
    } catch {
      // silent fail
    }
  }

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'Just now'
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    const days = Math.floor(hrs / 24)
    if (days < 30) return `${days}d ago`
    return new Date(dateStr).toLocaleDateString()
  }

  const truncate = (str, len = 120) =>
    str && str.length > len ? str.slice(0, len) + '...' : str

  const sentimentColor = (s) => {
    if (!s) return 'text-gray-400'
    const lower = s.toLowerCase()
    if (lower.startsWith('positive')) return 'text-emerald-600 dark:text-emerald-400'
    if (lower.startsWith('negative')) return 'text-red-600 dark:text-red-400'
    if (lower.startsWith('mixed')) return 'text-amber-600 dark:text-amber-400'
    return 'text-blue-600 dark:text-blue-400'
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Analysis History</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Browse and search your past content analyses.</p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by content text..."
            className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg pl-10 pr-4 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors"
        >
          Search
        </button>
        {search && (
          <button
            type="button"
            onClick={handleClearSearch}
            className="px-4 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 transition-colors"
          >
            Clear
          </button>
        )}
      </form>

      {/* Search info */}
      {search && !loading && (
        <p className="text-sm text-gray-500">
          {pagination.total} result{pagination.total !== 1 ? 's' : ''} for "{search}"
        </p>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 animate-pulse">
              <div className="flex items-center justify-between mb-3">
                <div className="h-4 w-32 bg-gray-200 dark:bg-gray-800 rounded" />
                <div className="h-3 w-16 bg-gray-200 dark:bg-gray-800 rounded" />
              </div>
              <div className="space-y-2">
                <div className="h-3 w-full bg-gray-200 dark:bg-gray-800 rounded" />
                <div className="h-3 w-3/4 bg-gray-200 dark:bg-gray-800 rounded" />
              </div>
              <div className="flex gap-2 mt-3">
                <div className="h-6 w-20 bg-gray-200 dark:bg-gray-800 rounded-full" />
                <div className="h-6 w-24 bg-gray-200 dark:bg-gray-800 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Analysis Cards */}
      {!loading && analyses.length > 0 && (
        <div className="space-y-3">
          {analyses.map((analysis) => {
            const isExpanded = expanded === analysis._id
            return (
              <div
                key={analysis._id}
                className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden transition-all hover:border-gray-300 dark:hover:border-gray-700"
              >
                {/* Card Header - always visible */}
                <button
                  onClick={() => setExpanded(isExpanded ? null : analysis._id)}
                  className="w-full text-left p-5 cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                        {isExpanded ? analysis.inputText : truncate(analysis.inputText)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-gray-400 dark:text-gray-600">{timeAgo(analysis.createdAt)}</span>
                      <svg
                        className={`w-4 h-4 text-gray-400 dark:text-gray-600 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                      </svg>
                    </div>
                  </div>

                  {/* Tags row */}
                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 ${sentimentColor(analysis.sentiment)}`}>
                      {analysis.sentiment?.split('—')[0]?.split('–')[0]?.trim() || 'N/A'}
                    </span>
                    {analysis.topics?.split(',').slice(0, 3).map((topic, i) => (
                      <span key={i} className="text-xs text-gray-500 px-2.5 py-0.5 rounded-full bg-gray-100/50 dark:bg-gray-800/50">
                        {topic.trim()}
                      </span>
                    ))}
                  </div>
                </button>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t border-gray-200 dark:border-gray-800 p-5 space-y-4 animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <DetailCard
                        label="Summary"
                        content={analysis.summary}
                        accentColor="indigo"
                      />
                      <DetailCard
                        label="Sentiment"
                        content={analysis.sentiment}
                        accentColor="emerald"
                      />
                      <DetailCard
                        label="Key Topics"
                        content={analysis.topics}
                        accentColor="amber"
                      />
                      <DetailCard
                        label="Tone"
                        content={analysis.tone}
                        accentColor="violet"
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-2">
                      <span className="text-xs text-gray-400 dark:text-gray-600">
                        {new Date(analysis.createdAt).toLocaleString()}
                      </span>
                      <div className="flex flex-wrap items-center gap-1">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleExport(analysis._id, 'pdf') }}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                          </svg>
                          PDF
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleExport(analysis._id, 'markdown') }}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                          </svg>
                          MD
                        </button>
                      {confirmDelete === analysis._id ? (
                        <>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(analysis._id) }}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors cursor-pointer"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); setConfirmDelete(null) }}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDelete(analysis._id)
                          }}
                          disabled={deleting === analysis._id}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/50 disabled:opacity-50 rounded-lg transition-colors cursor-pointer"
                        >
                          {deleting === analysis._id ? (
                            <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                          ) : (
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                            </svg>
                          )}
                          Delete
                        </button>
                      )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Empty State */}
      {!loading && analyses.length === 0 && (
        <div className="text-center py-16 px-6">
          <svg className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-700 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={0.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
          <h3 className="text-gray-400 dark:text-gray-500 font-medium mb-1">
            {search ? 'No matching analyses' : 'No history yet'}
          </h3>
          <p className="text-gray-400 dark:text-gray-600 text-sm">
            {search
              ? 'Try a different search term.'
              : 'Analyses you run from the dashboard will appear here.'}
          </p>
        </div>
      )}

      {/* Pagination */}
      {!loading && pagination.pages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-sm text-gray-500 dark:text-gray-600">
            Page {pagination.page} of {pagination.pages} ({pagination.total} total)
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-1.5 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
              disabled={page >= pagination.pages}
              className="px-3 py-1.5 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

const accentMap = {
  indigo: 'border-indigo-200 dark:border-indigo-500/20 bg-indigo-50 dark:bg-indigo-500/5',
  emerald: 'border-emerald-200 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/5',
  amber: 'border-amber-200 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-500/5',
  violet: 'border-violet-200 dark:border-violet-500/20 bg-violet-50 dark:bg-violet-500/5',
}

const labelMap = {
  indigo: 'text-indigo-600 dark:text-indigo-400',
  emerald: 'text-emerald-600 dark:text-emerald-400',
  amber: 'text-amber-600 dark:text-amber-400',
  violet: 'text-violet-600 dark:text-violet-400',
}

function DetailCard({ label, content, accentColor }) {
  return (
    <div className={`rounded-lg p-4 border ${accentMap[accentColor] || accentMap.indigo}`}>
      <h4 className={`text-xs font-semibold uppercase tracking-wide mb-2 ${labelMap[accentColor] || labelMap.indigo}`}>
        {label}
      </h4>
      <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{content || 'N/A'}</p>
    </div>
  )
}

export default History
