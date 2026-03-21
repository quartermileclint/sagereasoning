'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { VIRTUES, getAlignmentTier } from '@/lib/stoic-brain'
import type { User } from '@supabase/supabase-js'

interface ScoreResult {
  wisdom_score: number
  justice_score: number
  courage_score: number
  temperance_score: number
  total_score: number
  sage_alignment: string
  reasoning: string
  improvement_path: string
  strength: string
  growth_area: string
}

export default function ScoreActionPage() {
  const [user, setUser] = useState<User | null>(null)
  const [action, setAction] = useState('')
  const [context, setContext] = useState('')
  const [intendedOutcome, setIntendedOutcome] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ScoreResult | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
  }, [])

  const handleScore = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)
    setSaved(false)

    try {
      // Server-side Claude API scoring
      const response = await fetch('/api/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, context, intendedOutcome }),
      })

      if (!response.ok) {
        throw new Error('Scoring failed')
      }

      const scoreResult: ScoreResult = await response.json()
      setResult(scoreResult)

      // Save to Supabase if user is logged in
      if (user) {
        const { error } = await supabase.from('action_scores').insert({
          user_id: user.id,
          action_description: action,
          context,
          intended_outcome: intendedOutcome,
          wisdom_score: scoreResult.wisdom_score,
          justice_score: scoreResult.justice_score,
          courage_score: scoreResult.courage_score,
          temperance_score: scoreResult.temperance_score,
          total_score: scoreResult.total_score,
          sage_alignment: scoreResult.sage_alignment,
          reasoning: scoreResult.reasoning,
          improvement_path: scoreResult.improvement_path,
          strength: scoreResult.strength,
          growth_area: scoreResult.growth_area,
          scored_by: 'claude-api-v1',
        })
        if (!error) setSaved(true)
      }
    } catch {
      alert('Scoring failed. Please try again.')
    }

    setLoading(false)
  }

  const tier = result ? getAlignmentTier(result.total_score) : null

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <div className="text-center mb-12">
        <h1 className="font-display text-3xl md:text-4xl font-medium text-sage-800 mb-3">Score an Action</h1>
        <p className="font-body text-sage-700 max-w-xl mx-auto">
          Describe an action you took (or plan to take) and receive a Stoic virtue analysis
          with your Sage alignment score.
        </p>
      </div>

      <form onSubmit={handleScore} className="bg-white/60 border border-sage-200 rounded-lg p-8 space-y-6 mb-12">
        <div>
          <label className="block font-display text-sm font-medium text-sage-700 mb-1">
            What action did you take (or plan to take)?
          </label>
          <textarea
            required
            rows={3}
            value={action}
            onChange={(e) => setAction(e.target.value)}
            className="w-full px-4 py-3 border border-sage-300 rounded bg-white font-body text-sage-900 focus:outline-none focus:ring-2 focus:ring-sage-400"
            placeholder="e.g. I confronted my colleague about an unfair decision they made..."
          />
        </div>

        <div>
          <label className="block font-display text-sm font-medium text-sage-700 mb-1">
            Context (what was the situation?)
          </label>
          <textarea
            rows={2}
            value={context}
            onChange={(e) => setContext(e.target.value)}
            className="w-full px-4 py-3 border border-sage-300 rounded bg-white font-body text-sage-900 focus:outline-none focus:ring-2 focus:ring-sage-400"
            placeholder="e.g. In a team meeting where others stayed silent..."
          />
        </div>

        <div>
          <label className="block font-display text-sm font-medium text-sage-700 mb-1">
            What outcome did you intend?
          </label>
          <textarea
            rows={2}
            value={intendedOutcome}
            onChange={(e) => setIntendedOutcome(e.target.value)}
            className="w-full px-4 py-3 border border-sage-300 rounded bg-white font-body text-sage-900 focus:outline-none focus:ring-2 focus:ring-sage-400"
            placeholder="e.g. To ensure fair treatment and encourage honest dialogue..."
          />
        </div>

        <button
          type="submit"
          disabled={loading || !action}
          className="w-full py-3 bg-sage-400 text-white font-display text-lg rounded hover:bg-sage-500 transition-colors disabled:opacity-50"
        >
          {loading ? 'Analysing against Stoic virtues...' : 'Score This Action'}
        </button>

        {!user && (
          <p className="text-center font-body text-sm text-sage-500">
            <a href="/auth" className="underline text-sage-700">Sign in</a> to save scores to your profile.
          </p>
        )}
      </form>

      {/* Results */}
      {result && tier && (
        <div className="space-y-8">
          {/* Overall score */}
          <div className="bg-white/60 border border-sage-200 rounded-lg p-8 text-center">
            <div className="inline-flex items-center justify-center w-32 h-32 rounded-full border-4 mb-4" style={{ borderColor: tier.color }}>
              <div>
                <p className="font-display text-4xl font-bold" style={{ color: tier.color }}>{result.total_score}</p>
                <p className="font-body text-xs text-sage-600">out of 100</p>
              </div>
            </div>
            <h2 className="font-display text-2xl font-medium text-sage-800 mb-1">{tier.label}</h2>
            <p className="font-body text-sage-600 text-sm">{tier.description}</p>
            {saved && (
              <p className="mt-3 text-sm text-sage-500 font-body italic">Score saved to your profile.</p>
            )}
          </div>

          {/* Virtue breakdown */}
          <div className="grid md:grid-cols-2 gap-4">
            {VIRTUES.map((virtue) => {
              const score = result[`${virtue.id}_score` as keyof ScoreResult] as number
              return (
                <div key={virtue.id} className="bg-white/60 border border-sage-200 rounded-lg p-5 flex items-center gap-4">
                  <img src={virtue.icon} alt={virtue.name} className="w-12 h-12" />
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-display font-medium text-sage-800">{virtue.name}</span>
                      <span className="font-display text-lg font-bold" style={{ color: virtue.color }}>{score}</span>
                    </div>
                    <div className="w-full bg-sage-100 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all duration-1000"
                        style={{ width: `${score}%`, backgroundColor: virtue.color }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Reasoning */}
          <div className="bg-white/60 border border-sage-200 rounded-lg p-8 space-y-4">
            <div>
              <h3 className="font-display text-lg font-medium text-sage-800 mb-2">Reasoning</h3>
              <p className="font-body text-sage-700 leading-relaxed">{result.reasoning}</p>
            </div>
            <div>
              <h3 className="font-display text-lg font-medium text-sage-800 mb-2">Path to Growth</h3>
              <p className="font-body text-sage-700 leading-relaxed">{result.improvement_path}</p>
            </div>
            <div className="flex gap-6 pt-2">
              <div>
                <span className="font-display text-sm text-sage-500">Strength</span>
                <p className="font-display font-medium text-sage-800">{result.strength}</p>
              </div>
              <div>
                <span className="font-display text-sm text-sage-500">Growth area</span>
                <p className="font-display font-medium text-sage-800">{result.growth_area}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
