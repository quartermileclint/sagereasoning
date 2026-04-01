'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

interface Passion {
  root_passion: string
  sub_species: string
  false_judgement: string
}

interface ScoreDetail {
  id: string
  title: string | null
  katorthoma_proximity: 'reflexive' | 'habitual' | 'deliberate' | 'principled' | 'sage_like'
  passions_detected: Passion[]
  virtue_domains_engaged: string[]
  is_kathekon: boolean
  kathekon_quality: string
  improvement_path: string
  reasoning: string
  word_count: number
  created_at: string
  disclaimer: string
}

const proximityColors: Record<string, string> = {
  sage_like: 'text-emerald-700',
  principled: 'text-teal-600',
  deliberate: 'text-amber-600',
  habitual: 'text-orange-600',
  reflexive: 'text-red-700',
}

const proximityBg: Record<string, string> = {
  sage_like: 'bg-emerald-50 border-emerald-200',
  principled: 'bg-teal-50 border-teal-200',
  deliberate: 'bg-amber-50 border-amber-200',
  habitual: 'bg-orange-50 border-orange-200',
  reflexive: 'bg-red-50 border-red-200',
}

const proximityLabel: Record<string, string> = {
  sage_like: 'Sage-Like',
  principled: 'Principled',
  deliberate: 'Deliberate',
  habitual: 'Habitual',
  reflexive: 'Reflexive',
}

export default function ScoreDetailPage() {
  const params = useParams()
  const [score, setScore] = useState<ScoreDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchScore() {
      try {
        const res = await fetch(`/api/score-document-v3/${params.id}`)
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

  return (
    <div className="min-h-screen py-16 px-6">
      <div className="max-w-2xl mx-auto">
        <div className={`rounded-xl border-2 p-8 ${proximityBg[score.katorthoma_proximity] || 'bg-gray-50 border-gray-200'}`}>
          {/* Header */}
          <div className="text-center mb-8">
            <p className="font-body text-sage-500 text-sm uppercase tracking-wider mb-2">
              Stoic Document Evaluation
            </p>
            {score.title && (
              <h1 className="font-display text-2xl text-sage-900 mb-4">{score.title}</h1>
            )}
            <div className="flex flex-col items-center gap-3 mt-4">
              <span className={`text-3xl font-display font-bold ${proximityColors[score.katorthoma_proximity] || 'text-gray-600'}`}>
                {proximityLabel[score.katorthoma_proximity]}
              </span>
              <p className="font-body text-sage-600 text-sm">
                Katorthoma Proximity Level
              </p>
            </div>
          </div>

          {/* Kathekon Quality Badge */}
          {score.is_kathekon && (
            <div className="bg-white/60 rounded-lg p-3 mb-6 text-center border border-sage-200">
              <p className="font-body text-sage-700 text-sm">
                <span className="font-semibold">Kathekon Quality:</span> {score.kathekon_quality}
              </p>
            </div>
          )}

          {/* Passions Detected */}
          {score.passions_detected && score.passions_detected.length > 0 && (
            <div className="mb-6">
              <h3 className="font-display text-sm font-semibold text-sage-900 mb-3 uppercase tracking-wide">
                Passions Detected
              </h3>
              <div className="space-y-2">
                {score.passions_detected.map((passion, idx) => (
                  <div key={idx} className="bg-white/40 rounded-lg p-3 border-l-2 border-sage-300">
                    <p className="font-body text-sage-800 text-sm">
                      <span className="font-semibold">{passion.root_passion}</span>
                    </p>
                    {passion.sub_species && (
                      <p className="font-body text-sage-600 text-xs mt-1">
                        Sub-species: {passion.sub_species}
                      </p>
                    )}
                    {passion.false_judgement && (
                      <p className="font-body text-sage-600 text-xs mt-1">
                        False judgment: {passion.false_judgement}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Virtue Domains Engaged */}
          {score.virtue_domains_engaged && score.virtue_domains_engaged.length > 0 && (
            <div className="mb-6">
              <h3 className="font-display text-sm font-semibold text-sage-900 mb-3 uppercase tracking-wide">
                Virtue Domains Engaged
              </h3>
              <div className="flex flex-wrap gap-2">
                {score.virtue_domains_engaged.map((domain, idx) => (
                  <span
                    key={idx}
                    className="inline-block bg-white/60 px-3 py-1 rounded-full font-body text-xs text-sage-700 border border-sage-200"
                  >
                    {domain}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Reasoning */}
          <div className="bg-white/50 rounded-lg p-4 mb-6">
            <h3 className="font-display text-xs font-semibold text-sage-900 mb-2 uppercase tracking-wide">
              Reasoning
            </h3>
            <p className="font-body text-sage-700 text-sm">{score.reasoning}</p>
          </div>

          {/* Improvement Path */}
          {score.improvement_path && (
            <div className="bg-white/50 rounded-lg p-4 mb-6">
              <h3 className="font-display text-xs font-semibold text-sage-900 mb-2 uppercase tracking-wide">
                Path to Improvement
              </h3>
              <p className="font-body text-sage-700 text-sm">{score.improvement_path}</p>
            </div>
          )}

          {/* Disclaimer */}
          {score.disclaimer && (
            <div className="bg-sage-50/50 rounded-lg p-3 mb-6 border-l-2 border-sage-300">
              <p className="font-body text-sage-600 text-xs italic">{score.disclaimer}</p>
            </div>
          )}

          {/* Meta */}
          <div className="flex justify-between text-xs font-body text-sage-400">
            <span>{score.word_count.toLocaleString()} words</span>
            <span>Evaluated {new Date(score.created_at).toLocaleDateString()}</span>
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
