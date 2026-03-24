'use client'

import { useState } from 'react'

interface FlaggedClause {
  clause_summary: string
  concern: string
  severity: 'high' | 'medium' | 'low'
}

interface PolicyResult {
  total_score: number
  wisdom_score: number
  justice_score: number
  courage_score: number
  temperance_score: number
  alignment_tier: string
  reasoning: string
  word_count: number
  badge_url: string
  embed_html: string
  scored_at: string
  mode: string
  flagged_clauses: FlaggedClause[]
}

const tierColors: Record<string, string> = {
  sage: 'text-emerald-700',
  progressing: 'text-green-600',
  aware: 'text-amber-600',
  misaligned: 'text-orange-600',
  contrary: 'text-red-700',
}

const tierBg: Record<string, string> = {
  sage: 'bg-emerald-50 border-emerald-200',
  progressing: 'bg-green-50 border-green-200',
  aware: 'bg-amber-50 border-amber-200',
  misaligned: 'bg-orange-50 border-orange-200',
  contrary: 'bg-red-50 border-red-200',
}

const severityColors: Record<string, string> = {
  high: 'bg-red-100 border-red-300 text-red-800',
  medium: 'bg-amber-100 border-amber-300 text-amber-800',
  low: 'bg-yellow-50 border-yellow-200 text-yellow-800',
}

export default function ScorePolicyPage() {
  const [title, setTitle] = useState('')
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<PolicyResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0

  async function handleScore() {
    if (wordCount < 20) { setError('Document must be at least 20 words.'); return }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch('/api/score-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.trim(), title: title.trim() || undefined, mode: 'policy' }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Scoring failed')
      }

      const data = await res.json()
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  // Policy mode uses adjusted weights
  const virtues = result ? [
    { name: 'Wisdom', score: result.wisdom_score, weight: '20%' },
    { name: 'Justice', score: result.justice_score, weight: '35%' },
    { name: 'Courage', score: result.courage_score, weight: '15%' },
    { name: 'Temperance', score: result.temperance_score, weight: '30%' },
  ] : []

  return (
    <div className="min-h-screen py-16 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="font-display text-4xl text-sage-900 mb-3">Review a Contract or Policy</h1>
          <p className="font-body text-sage-600 max-w-xl mx-auto">
            Score legal documents, terms of service, or company policies against Stoic virtue.
            Justice and temperance are weighted more heavily — because fairness and proportionality
            are what matter most in governance.
          </p>
        </div>

        {!result && (
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block font-body text-sage-700 text-sm mb-1">
                Document Title <span className="text-sage-400">(optional)</span>
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Employment Agreement — Acme Corp"
                className="w-full px-4 py-3 border border-sage-300 rounded-lg font-body text-sage-800 focus:outline-none focus:ring-2 focus:ring-sage-400"
              />
            </div>

            <div>
              <label htmlFor="text" className="block font-body text-sage-700 text-sm mb-1">Policy / Contract Text</label>
              <textarea
                id="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste your contract, terms of service, or policy document here..."
                rows={14}
                className="w-full px-4 py-3 border border-sage-300 rounded-lg font-body text-sage-800 focus:outline-none focus:ring-2 focus:ring-sage-400 resize-y"
              />
              <div className="flex justify-between mt-1">
                <span className="font-body text-xs text-sage-400">{wordCount} words {wordCount > 0 && wordCount < 20 && '(minimum 20)'}</span>
                <span className="font-body text-xs text-sage-400">Max ~8,000 words scored</span>
              </div>
            </div>

            {error && <p className="font-body text-red-600 text-sm">{error}</p>}

            <button
              onClick={handleScore}
              disabled={loading || wordCount < 20}
              className="w-full py-3 bg-sage-800 text-white font-display text-lg rounded-lg hover:bg-sage-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Reviewing...' : 'Review This Policy'}
            </button>

            {loading && (
              <p className="font-body text-sage-500 text-sm text-center animate-pulse">
                Analysing fairness, proportionality, and ethical quality...
              </p>
            )}
          </div>
        )}

        {result && (
          <div className="space-y-8">
            <div className={`rounded-xl border-2 p-8 ${tierBg[result.alignment_tier] || 'bg-gray-50 border-gray-200'}`}>
              <div className="text-center mb-8">
                {title && <h2 className="font-display text-xl text-sage-800 mb-1">{title}</h2>}
                <div className="flex items-center justify-center gap-4 mt-3">
                  <span className="text-5xl font-display font-bold text-sage-900">{result.total_score}</span>
                  <span className={`text-xl font-display font-medium capitalize ${tierColors[result.alignment_tier] || 'text-gray-600'}`}>
                    {result.alignment_tier}
                  </span>
                </div>
              </div>

              <div className="space-y-3 mb-8">
                {virtues.map((v) => (
                  <div key={v.name} className="flex items-center gap-3">
                    <span className="font-body text-sage-700 w-28 text-sm">{v.name} <span className="text-sage-400">({v.weight})</span></span>
                    <div className="flex-1 bg-white/60 rounded-full h-4 overflow-hidden">
                      <div className="h-full rounded-full bg-sage-600 transition-all duration-700" style={{ width: `${v.score}%` }} />
                    </div>
                    <span className="font-body text-sage-800 text-sm w-8 text-right">{v.score}</span>
                  </div>
                ))}
              </div>

              <div className="bg-white/50 rounded-lg p-4">
                <p className="font-body text-sage-700 text-sm italic">{result.reasoning}</p>
              </div>
            </div>

            {/* Flagged Clauses */}
            {result.flagged_clauses && result.flagged_clauses.length > 0 && (
              <div>
                <h3 className="font-display text-xl text-sage-800 mb-4">Flagged Clauses</h3>
                <div className="space-y-3">
                  {result.flagged_clauses.map((clause, i) => (
                    <div key={i} className={`rounded-lg border p-4 ${severityColors[clause.severity] || 'bg-gray-50 border-gray-200'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-display text-sm font-medium">{clause.clause_summary}</span>
                        <span className="text-xs font-body uppercase font-medium">{clause.severity}</span>
                      </div>
                      <p className="font-body text-sm">{clause.concern}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Badge */}
            <div className="bg-sage-50 rounded-xl border border-sage-200 p-6">
              <h3 className="font-display text-lg text-sage-800 mb-3">Embed This Score</h3>
              <div className="bg-white rounded-lg p-4 mb-4 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={result.badge_url} alt={`Stoic Score: ${result.total_score}`} height={28} />
              </div>
              <pre className="bg-sage-900 text-sage-100 rounded-lg p-4 text-xs font-mono overflow-x-auto">
                {result.embed_html}
              </pre>
            </div>

            <div className="text-center">
              <button
                onClick={() => { setResult(null); setText(''); setTitle('') }}
                className="px-6 py-3 bg-sage-800 text-white font-display rounded-lg hover:bg-sage-700 transition-colors"
              >
                Review Another Policy
              </button>
            </div>
          </div>
        )}

        <div className="mt-16 border-t border-sage-200 pt-8">
          <h2 className="font-display text-2xl text-sage-800 mb-4">For AI Agents &amp; Developers</h2>
          <div className="bg-sage-50 rounded-lg p-6 font-body text-sage-700 text-sm space-y-3">
            <p><strong>POST</strong> <code className="bg-sage-200 px-1 rounded">/api/score-document</code></p>
            <pre className="bg-sage-900 text-sage-100 rounded p-3 text-xs overflow-x-auto">{`{
  "text": "Your contract text here...",
  "title": "Employment Agreement",
  "mode": "policy"
}`}</pre>
            <p>The <code className="bg-sage-200 px-1 rounded">mode: "policy"</code> flag shifts weights toward justice (35%) and temperance (30%), and returns flagged clauses.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
