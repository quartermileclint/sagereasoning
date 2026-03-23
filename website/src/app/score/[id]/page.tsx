'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

interface ScoreDetail {
  id: string
  title: string | null
  total_score: number
  wisdom_score: number
  justice_score: number
  courage_score: number
  temperance_score: number
  alignment_tier: string
  reasoning: string
  word_count: number
  created_at: string
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

export default function ScoreDetailPage() {
  const params = useParams()
  const [score, setScore] = useState<ScoreDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchScore() {
      try {
        const res = await fetch(`/api/score-document/${params.id}`)
        if (!res.ok) throw new Error('Score not found')
        const data = await res.json()
        setScore(data)
      } catch {
        setError('This score could not be found.')
      } finally {
        setLoading(false)
      }
    }
    if (params.id) fetchScore()
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse font-body text-sage-600">Loading score...</div>
      </div>
    )
  }

  if (error || !score) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center font-body">
          <p className="text-sage-700 text-lg">{error || 'Score not found'}</p>
          <a href="/" className="text-sage-600 underline mt-4 inline-block">Back to SageReasoning</a>
        </div>
      </div>
    )
  }

  const virtues = [
    { name: 'Wisdom', score: score.wisdom_score, weight: '30%' },
    { name: 'Justice', score: score.justice_score, weight: '25%' },
    { name: 'Courage', score: score.courage_score, weight: '25%' },
    { name: 'Temperance', score: score.temperance_score, weight: '20%' },
  ]

  return (
    <div className="min-h-screen py-16 px-6">
      <div className="max-w-2xl mx-auto">
        <div className={`rounded-xl border-2 p-8 ${tierBg[score.alignment_tier] || 'bg-gray-50 border-gray-200'}`}>
          {/* Header */}
          <div className="text-center mb-8">
            <p className="font-body text-sage-500 text-sm uppercase tracking-wider mb-2">
              Stoic Document Score
            </p>
            {score.title && (
              <h1 className="font-display text-2xl text-sage-900 mb-2">{score.title}</h1>
            )}
            <div className="flex items-center justify-center gap-4 mt-4">
              <span className="text-5xl font-display font-bold text-sage-900">
                {score.total_score}
              </span>
              <span className={`text-xl font-display font-medium capitalize ${tierColors[score.alignment_tier] || 'text-gray-600'}`}>
                {score.alignment_tier}
              </span>
            </div>
          </div>

          {/* Virtue Breakdown */}
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
            <p className="font-body text-sage-700 text-sm italic">{score.reasoning}</p>
          </div>

          {/* Meta */}
          <div className="flex justify-between text-xs font-body text-sage-400">
            <span>{score.word_count.toLocaleString()} words</span>
            <span>Scored {new Date(score.created_at).toLocaleDateString()}</span>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-10">
          <p className="font-body text-sage-600 mb-4">
            Score your own documents against Stoic virtue.
          </p>
          <a
            href="/score-document"
            className="inline-block px-6 py-3 bg-sage-800 text-white font-display rounded-lg hover:bg-sage-700 transition-colors"
          >
            Score a Document
          </a>
        </div>

        {/* What is this */}
        <div className="mt-12 text-center">
          <p className="font-body text-sage-500 text-sm">
            Powered by <a href="/" className="underline hover:text-sage-700">SageReasoning</a> — the Stoic Brain for humans and AI agents.
          </p>
        </div>
      </div>
    </div>
  )
}
