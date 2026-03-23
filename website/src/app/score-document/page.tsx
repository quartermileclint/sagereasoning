'use client'

import { useState } from 'react'

interface DocumentResult {
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

export default function ScoreDocumentPage() {
  const [title, setTitle] = useState('')
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<DocumentResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0

  async function handleScore() {
    if (wordCount < 20) {
      setError('Document must be at least 20 words.')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch('/api/score-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.trim(), title: title.trim() || undefined }),
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

  function handleCopyEmbed() {
    if (result?.embed_html) {
      navigator.clipboard.writeText(result.embed_html)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const virtues = result
    ? [
        { name: 'Wisdom', score: result.wisdom_score, weight: '30%' },
        { name: 'Justice', score: result.justice_score, weight: '25%' },
        { name: 'Courage', score: result.courage_score, weight: '25%' },
        { name: 'Temperance', score: result.temperance_score, weight: '20%' },
      ]
    : []

  return (
    <div className="min-h-screen py-16 px-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-display text-4xl text-sage-900 mb-3">Score a Document</h1>
          <p className="font-body text-sage-600 max-w-xl mx-auto">
            Assess any written content against the four Stoic virtues. Receive a score,
            a virtue breakdown, and an embeddable badge you can publish with your work.
          </p>
        </div>

        {/* Input Form */}
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
                placeholder="e.g. My Company Policy on Ethical AI"
                className="w-full px-4 py-3 border border-sage-300 rounded-lg font-body text-sage-800 focus:outline-none focus:ring-2 focus:ring-sage-400"
              />
            </div>

            <div>
              <label htmlFor="text" className="block font-body text-sage-700 text-sm mb-1">
                Document Text
              </label>
              <textarea
                id="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste your document content here..."
                rows={14}
                className="w-full px-4 py-3 border border-sage-300 rounded-lg font-body text-sage-800 focus:outline-none focus:ring-2 focus:ring-sage-400 resize-y"
              />
              <div className="flex justify-between mt-1">
                <span className="font-body text-xs text-sage-400">
                  {wordCount} words {wordCount > 0 && wordCount < 20 && '(minimum 20)'}
                </span>
                <span className="font-body text-xs text-sage-400">
                  Max ~8,000 words scored
                </span>
              </div>
            </div>

            {error && (
              <p className="font-body text-red-600 text-sm">{error}</p>
            )}

            <button
              onClick={handleScore}
              disabled={loading || wordCount < 20}
              className="w-full py-3 bg-sage-800 text-white font-display text-lg rounded-lg hover:bg-sage-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Scoring...' : 'Score This Document'}
            </button>

            {loading && (
              <p className="font-body text-sage-500 text-sm text-center animate-pulse">
                Analysing content against the four cardinal virtues...
              </p>
            )}
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="space-y-8">
            <div className={`rounded-xl border-2 p-8 ${tierBg[result.alignment_tier] || 'bg-gray-50 border-gray-200'}`}>
              {/* Score Header */}
              <div className="text-center mb-8">
                {title && (
                  <h2 className="font-display text-xl text-sage-800 mb-1">{title}</h2>
                )}
                <div className="flex items-center justify-center gap-4 mt-3">
                  <span className="text-5xl font-display font-bold text-sage-900">
                    {result.total_score}
                  </span>
                  <span className={`text-xl font-display font-medium capitalize ${tierColors[result.alignment_tier] || 'text-gray-600'}`}>
                    {result.alignment_tier}
                  </span>
                </div>
              </div>

              {/* Virtue Bars */}
              <div className="space-y-3 mb-8">
                {virtues.map((v) => (
                  <div key={v.name} className="flex items-center gap-3">
                    <span className="font-body text-sage-700 w-28 text-sm">
                      {v.name} <span className="text-sage-400">({v.weight})</span>
                    </span>
                    <div className="flex-1 bg-white/60 rounded-full h-4 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-sage-600 transition-all duration-700"
                        style={{ width: `${v.score}%` }}
                      />
                    </div>
                    <span className="font-body text-sage-800 text-sm w-8 text-right">
                      {v.score}
                    </span>
                  </div>
                ))}
              </div>

              {/* Reasoning */}
              <div className="bg-white/50 rounded-lg p-4 mb-6">
                <p className="font-body text-sage-700 text-sm italic">{result.reasoning}</p>
              </div>

              <div className="text-xs font-body text-sage-400 text-center">
                {result.word_count.toLocaleString()} words · Scored {new Date(result.scored_at).toLocaleDateString()}
              </div>
            </div>

            {/* Embeddable Badge */}
            <div className="bg-sage-50 rounded-xl border border-sage-200 p-6">
              <h3 className="font-display text-lg text-sage-800 mb-3">Embed This Score</h3>
              <p className="font-body text-sage-600 text-sm mb-4">
                Add this badge to your document, README, website, or publication.
                Readers who click it will see the full virtue breakdown.
              </p>

              {/* Badge Preview */}
              <div className="bg-white rounded-lg p-4 mb-4 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={result.badge_url}
                  alt={`Stoic Score: ${result.total_score}`}
                  height={28}
                />
              </div>

              {/* Embed Code */}
              <div className="relative">
                <pre className="bg-sage-900 text-sage-100 rounded-lg p-4 text-xs font-mono overflow-x-auto">
                  {result.embed_html}
                </pre>
                <button
                  onClick={handleCopyEmbed}
                  className="absolute top-2 right-2 px-3 py-1 bg-sage-700 text-white text-xs rounded hover:bg-sage-600 transition-colors"
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>

              {/* Markdown version */}
              <details className="mt-4">
                <summary className="font-body text-sage-600 text-sm cursor-pointer hover:text-sage-800">
                  Markdown version
                </summary>
                <pre className="bg-sage-900 text-sage-100 rounded-lg p-4 text-xs font-mono overflow-x-auto mt-2">
                  {`[![Stoic Score: ${result.total_score}](${result.badge_url})](${result.badge_url.replace('/api/badge/', '/score/')})`}
                </pre>
              </details>
            </div>

            {/* Score Another */}
            <div className="text-center">
              <button
                onClick={() => {
                  setResult(null)
                  setText('')
                  setTitle('')
                }}
                className="px-6 py-3 bg-sage-800 text-white font-display rounded-lg hover:bg-sage-700 transition-colors"
              >
                Score Another Document
              </button>
            </div>
          </div>
        )}

        {/* For AI Agents */}
        <div className="mt-16 border-t border-sage-200 pt-8">
          <h2 className="font-display text-2xl text-sage-800 mb-4">For AI Agents &amp; Developers</h2>
          <div className="bg-sage-50 rounded-lg p-6 font-body text-sage-700 text-sm space-y-3">
            <p><strong>POST</strong> <code className="bg-sage-200 px-1 rounded">/api/score-document</code></p>
            <pre className="bg-sage-900 text-sage-100 rounded p-3 text-xs overflow-x-auto">{`{
  "text": "Your document content here...",
  "title": "Optional Title"
}`}</pre>
            <p>Returns: virtue scores, alignment tier, reasoning, badge URL, and embed HTML.</p>
            <p>CORS enabled. No authentication required.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
