'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { authFetch } from '@/lib/auth-fetch'
import { trackEvent } from '@/lib/analytics'
import { VIRTUES, getAlignmentTier } from '@/lib/stoic-brain'
import type { User } from '@supabase/supabase-js'

/** Stamp threshold — matches the practice calendar and milestone system */
const STAMP_THRESHOLD = 70

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
  growth_action: string
  growth_action_projected_score: number
}

// Quick lookup for virtue metadata by name (e.g. "Wisdom" → virtue object)
const VIRTUE_BY_NAME = Object.fromEntries(VIRTUES.map(v => [v.name, v]))

export default function ScoreActionPage() {
  const [user, setUser] = useState<User | null>(null)
  const [action, setAction] = useState('')
  const [context, setContext] = useState('')
  const [intendedOutcome, setIntendedOutcome] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ScoreResult | null>(null)
  const [saved, setSaved] = useState(false)
  // Track whether the user chose to re-score with the growth action
  const [rescoringGrowth, setRescoringGrowth] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
  }, [])

  const handleScore = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)
    setSaved(false)
    setRescoringGrowth(false)

    try {
      const response = await authFetch('/api/score', {
        method: 'POST',
        body: JSON.stringify({ action, context, intendedOutcome }),
      })

      if (!response.ok) throw new Error('Scoring failed')

      const scoreResult: ScoreResult = await response.json()
      setResult(scoreResult)

      trackEvent({ event_type: 'score_action', metadata: { total_score: scoreResult.total_score, sage_alignment: scoreResult.sage_alignment } })

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

  /** Pre-fill the form with the growth action suggestion so the user can score it properly */
  const handleScoreGrowthAction = () => {
    if (!result) return
    setRescoringGrowth(true)
    // Pre-fill the action field with the growth suggestion, keep context
    setAction(result.growth_action)
    setIntendedOutcome('To act with greater virtue in this situation')
    setResult(null)
    setSaved(false)
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const tier = result ? getAlignmentTier(result.total_score) : null
  const earnsStamp = result ? result.total_score >= STAMP_THRESHOLD : false
  const strongestVirtue = result?.strength ? VIRTUE_BY_NAME[result.strength] : null

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'SageReasoning — Score an Action',
    description: 'Score any action against the four Stoic cardinal virtues (Wisdom, Justice, Courage, Temperance) and receive a sage alignment rating with personalised guidance.',
    url: 'https://www.sagereasoning.com/score',
    applicationCategory: 'LifestyleApplication',
    operatingSystem: 'Any',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    featureList: [
      'Score actions against four cardinal Stoic virtues',
      'Receive weighted alignment score (0-100)',
      'Get personalised improvement path',
      'Identify your strongest and weakest virtue expression',
      'Preview your practice calendar stamp',
      'See the sage growth path alternative',
      'Save score history when signed in',
    ],
    provider: {
      '@type': 'Organization',
      name: 'SageReasoning',
      url: 'https://www.sagereasoning.com',
    },
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="text-center mb-12">
        <h1 className="font-display text-3xl md:text-4xl font-medium text-sage-800 mb-3">Score an Action</h1>
        <p className="font-body text-sage-700 max-w-xl mx-auto">
          Describe an action you took (or plan to take) and receive a Stoic virtue analysis
          with your Sage alignment score.
        </p>
      </div>

      <form onSubmit={handleScore} className="bg-white/60 border border-sage-200 rounded-lg p-8 space-y-6 mb-12">
        {/* Show hint when re-scoring with growth action */}
        {rescoringGrowth && (
          <div className="bg-sage-50 border border-sage-200 rounded-lg px-5 py-4">
            <p className="font-body text-sm text-sage-700">
              The growth action has been pre-filled below. Feel free to refine it in your own words
              before scoring — the more specific you are, the more accurate the score.
            </p>
          </div>
        )}

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
          {loading ? 'Analysing against Stoic virtues...' : (rescoringGrowth ? 'Score the Growth Action' : 'Score This Action')}
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
          {/* Overall score + Stamp preview */}
          <div className="bg-white/60 border border-sage-200 rounded-lg p-8 text-center">
            <div className="inline-flex items-center justify-center w-32 h-32 rounded-full border-4 mb-4" style={{ borderColor: tier.color }}>
              <div>
                <p className="font-display text-4xl font-bold" style={{ color: tier.color }}>{result.total_score}</p>
                <p className="font-body text-xs text-sage-600">out of 100</p>
              </div>
            </div>
            <h2 className="font-display text-2xl font-medium text-sage-800 mb-1">{tier.label}</h2>
            <p className="font-body text-sage-600 text-sm">{tier.description}</p>

            {/* Stamp preview */}
            <div className="mt-6 pt-5 border-t border-sage-100">
              <p className="font-display text-sm text-sage-500 mb-3">Calendar Stamp</p>
              {earnsStamp && strongestVirtue ? (
                <div className="inline-flex flex-col items-center gap-2">
                  <div
                    className="w-16 h-16 rounded-xl border-2 flex items-center justify-center"
                    style={{ borderColor: strongestVirtue.color, backgroundColor: strongestVirtue.color + '10' }}
                  >
                    <img src={strongestVirtue.icon} alt={strongestVirtue.name} className="w-11 h-11 drop-shadow-sm" />
                  </div>
                  <span className="font-display text-sm font-medium" style={{ color: strongestVirtue.color }}>
                    {strongestVirtue.name} stamp earned
                  </span>
                </div>
              ) : (
                <div className="inline-flex flex-col items-center gap-2">
                  <div className="w-16 h-16 rounded-xl border-2 border-sage-200 bg-sage-50/50 flex items-center justify-center">
                    {strongestVirtue ? (
                      <img src={strongestVirtue.icon} alt={strongestVirtue.name} className="w-11 h-11 opacity-20 grayscale" />
                    ) : (
                      <span className="font-display text-2xl text-sage-200">?</span>
                    )}
                  </div>
                  <span className="font-body text-sm text-sage-400">
                    Score 70+ to earn a stamp
                  </span>
                </div>
              )}
            </div>

            {saved && (
              <p className="mt-4 text-sm text-sage-500 font-body italic">Score saved to your profile.</p>
            )}
          </div>

          {/* Virtue breakdown */}
          <div className="grid md:grid-cols-2 gap-4">
            {VIRTUES.map((virtue) => {
              const score = result[`${virtue.id}_score` as keyof ScoreResult] as number
              return (
                <div key={virtue.id} className="bg-white/60 border border-sage-200 rounded-lg p-5 flex items-center gap-4">
                  <img src={virtue.icon} alt={virtue.name} className="w-16 h-16 drop-shadow-sm" />
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

          {/* Growth Action — shown when below stamp threshold */}
          {!earnsStamp && result.growth_action && (
            <div className="bg-sage-50/80 border-2 border-sage-300 rounded-lg p-8 space-y-5">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-sage-200/50 flex items-center justify-center">
                  <img src="/images/sagelogosmall.PNG" alt="Sage" className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-medium text-sage-800 mb-2">What a Sage Might Consider</h3>
                  <p className="font-body text-sage-700 leading-relaxed">{result.growth_action}</p>
                </div>
              </div>

              {/* Projected stamp comparison */}
              <div className="flex items-center gap-6 pt-3 border-t border-sage-200">
                {/* Current action result */}
                <div className="flex-1 text-center">
                  <p className="font-body text-xs text-sage-400 mb-1">Your action</p>
                  <p className="font-display text-2xl font-bold text-sage-400">{result.total_score}</p>
                  <div className="w-10 h-10 rounded-lg border border-sage-200 bg-white/50 flex items-center justify-center mx-auto mt-2">
                    {strongestVirtue ? (
                      <img src={strongestVirtue.icon} alt="" className="w-7 h-7 opacity-20 grayscale" />
                    ) : (
                      <span className="text-sage-200">—</span>
                    )}
                  </div>
                  <p className="font-body text-xs text-sage-300 mt-1">No stamp</p>
                </div>

                {/* Arrow */}
                <div className="flex-shrink-0">
                  <svg className="w-8 h-8 text-sage-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>

                {/* Growth action projection */}
                <div className="flex-1 text-center">
                  <p className="font-body text-xs text-sage-500 mb-1">Growth action</p>
                  <p className="font-display text-2xl font-bold" style={{ color: result.growth_action_projected_score >= STAMP_THRESHOLD ? '#7d9468' : '#B2AC88' }}>
                    ~{result.growth_action_projected_score}
                  </p>
                  <div
                    className="w-10 h-10 rounded-lg border-2 flex items-center justify-center mx-auto mt-2"
                    style={result.growth_action_projected_score >= STAMP_THRESHOLD && strongestVirtue ? {
                      borderColor: strongestVirtue.color,
                      backgroundColor: strongestVirtue.color + '10',
                    } : {
                      borderColor: '#d1cdb8',
                      backgroundColor: '#fafaf5',
                    }}
                  >
                    {result.growth_action_projected_score >= STAMP_THRESHOLD && strongestVirtue ? (
                      <img src={strongestVirtue.icon} alt="" className="w-7 h-7 drop-shadow-sm" />
                    ) : (
                      <span className="text-sage-300">—</span>
                    )}
                  </div>
                  <p className="font-body text-xs mt-1" style={{ color: result.growth_action_projected_score >= STAMP_THRESHOLD ? '#7d9468' : '#B2AC88' }}>
                    {result.growth_action_projected_score >= STAMP_THRESHOLD ? 'Stamp earned' : 'Closer to stamp'}
                  </p>
                </div>
              </div>

              {/* Re-score button */}
              <button
                onClick={handleScoreGrowthAction}
                className="w-full py-3 bg-sage-400 text-white font-display text-base rounded hover:bg-sage-500 transition-colors"
              >
                Score This Growth Action Instead
              </button>

              {/* Stoic reminder */}
              <p className="font-body text-xs text-sage-400 text-center italic leading-relaxed">
                The stamp marks the action — it is not the reason for it.
                Virtue is its own reward; the calendar simply records your practice.
              </p>
            </div>
          )}

          {/* When stamp IS earned — still show growth action if available, but as encouragement */}
          {earnsStamp && result.growth_action && (
            <div className="bg-white/60 border border-sage-200 rounded-lg p-8">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-sage-100 flex items-center justify-center">
                  <img src="/images/sagelogosmall.PNG" alt="Sage" className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-display text-base font-medium text-sage-800 mb-1">The Sage Path Forward</h3>
                  <p className="font-body text-sage-600 leading-relaxed text-sm">{result.growth_action}</p>
                  <p className="font-body text-xs text-sage-400 mt-3 italic">
                    There is always a higher expression of virtue. The sage never stops progressing.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
