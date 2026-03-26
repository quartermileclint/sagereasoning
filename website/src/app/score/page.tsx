'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { authFetch } from '@/lib/auth-fetch'
import { trackEvent } from '@/lib/analytics'
import { VIRTUES, getAlignmentTier } from '@/lib/stoic-brain'
import type { User } from '@supabase/supabase-js'

/** Stamp threshold — matches the practice calendar and milestone system */
const STAMP_THRESHOLD = 70

type StorageMode = 'cloud' | 'local' | null

interface LocalScore {
  id: string
  timestamp: string
  action: string
  context: string
  intendedOutcome: string
  result: ScoreResult
}

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

const VIRTUE_BY_NAME = Object.fromEntries(VIRTUES.map(v => [v.name, v]))

// ─── Local storage helpers ───
function getLocalScores(userId: string): LocalScore[] {
  try {
    const raw = localStorage.getItem(`action_scores_local_${userId}`)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function saveLocalScore(userId: string, score: LocalScore) {
  try {
    const scores = getLocalScores(userId)
    scores.unshift(score)
    localStorage.setItem(`action_scores_local_${userId}`, JSON.stringify(scores.slice(0, 100)))
  } catch { /* storage full */ }
}

export default function ScoreActionPage() {
  const [user, setUser] = useState<User | null>(null)
  const [storageMode, setStorageMode] = useState<StorageMode>(null)
  const [showSetup, setShowSetup] = useState(false)
  const [action, setAction] = useState('')
  const [context, setContext] = useState('')
  const [intendedOutcome, setIntendedOutcome] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ScoreResult | null>(null)
  const [saved, setSaved] = useState(false)
  const [rescoringGrowth, setRescoringGrowth] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const u = data.user
      setUser(u)
      if (u) {
        const savedMode = localStorage.getItem(`action_storage_${u.id}`) as StorageMode
        if (savedMode === 'cloud' || savedMode === 'local') {
          setStorageMode(savedMode)
        } else {
          setShowSetup(true)
        }
      }
    })
  }, [])

  function handleStorageChoice(mode: 'cloud' | 'local') {
    if (!user) return
    setStorageMode(mode)
    localStorage.setItem(`action_storage_${user.id}`, mode)
    setShowSetup(false)
  }

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

      if (user) {
        if (storageMode === 'local') {
          saveLocalScore(user.id, {
            id: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
            action,
            context,
            intendedOutcome,
            result: scoreResult,
          })
          setSaved(true)
        } else if (storageMode === 'cloud') {
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
      }
    } catch {
      alert('Scoring failed. Please try again.')
    }

    setLoading(false)
  }

  const handleScoreGrowthAction = () => {
    if (!result) return
    setRescoringGrowth(true)
    setAction(result.growth_action)
    setIntendedOutcome('To act with greater virtue in this situation')
    setResult(null)
    setSaved(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const tier = result ? getAlignmentTier(result.total_score) : null
  const earnsStamp = result ? result.total_score >= STAMP_THRESHOLD : false
  const strongestVirtue = result?.strength ? VIRTUE_BY_NAME[result.strength] : null

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'SageReasoning — Score an Action',
    description: 'Score any action against the four Stoic cardinal virtues and receive a sage alignment rating.',
    url: 'https://www.sagereasoning.com/score',
    applicationCategory: 'LifestyleApplication',
    operatingSystem: 'Any',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    provider: { '@type': 'Organization', name: 'SageReasoning', url: 'https://www.sagereasoning.com' },
  }

  // ─── Storage Setup Screen ───
  if (showSetup && user) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="text-center mb-10">
          <h1 className="font-display text-3xl md:text-4xl font-medium text-sage-800 mb-3">Score an Action</h1>
          <p className="font-body text-sage-600">Before you begin — where should your scored actions be saved?</p>
        </div>

        <div className="bg-white/60 border border-sage-200 rounded-lg p-8 mb-6">
          <p className="font-body text-sage-600 mb-6">
            When you score an action you describe the situation, your reasoning, and your intentions.
            This is personal information. Choose how you would like it stored:
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            <button
              onClick={() => handleStorageChoice('cloud')}
              className="text-left border-2 border-sage-200 rounded-lg p-6 hover:border-sage-400 transition-colors group"
            >
              <div className="flex items-center gap-3 mb-3">
                <svg className="w-6 h-6 text-sage-500 group-hover:text-sage-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                </svg>
                <span className="font-display text-lg font-medium text-sage-800">Cloud Storage</span>
              </div>
              <p className="font-body text-sm text-sage-600 mb-3">
                Your scored actions are saved to your account. Access your full history from the dashboard on any device.
              </p>
              <ul className="font-body text-xs text-sage-500 space-y-1">
                <li>+ Full history on your dashboard</li>
                <li>+ Syncs across devices</li>
                <li>+ Feeds your virtue trend analysis</li>
              </ul>
            </button>

            <button
              onClick={() => handleStorageChoice('local')}
              className="text-left border-2 border-sage-200 rounded-lg p-6 hover:border-sage-400 transition-colors group"
            >
              <div className="flex items-center gap-3 mb-3">
                <svg className="w-6 h-6 text-sage-500 group-hover:text-sage-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span className="font-display text-lg font-medium text-sage-800">Local Only</span>
              </div>
              <p className="font-body text-sm text-sage-600 mb-3">
                Your action descriptions stay on this device only — never stored on our servers.
                Only anonymous score statistics are logged.
              </p>
              <ul className="font-body text-xs text-sage-500 space-y-1">
                <li>+ Maximum privacy for your actions</li>
                <li>+ Up to 100 entries stored locally</li>
                <li>- Only accessible on this device</li>
                <li>- Clearing browser data removes entries</li>
              </ul>
            </button>
          </div>

          <p className="font-body text-xs text-sage-400 mt-6 text-center">
            You can change this preference anytime by clearing your browser data for this site.
          </p>
        </div>
      </div>
    )
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

        {/* Storage mode badge */}
        {user && storageMode && (
          <div className="flex items-center justify-between pb-2 border-b border-sage-100">
            <span className="inline-flex items-center gap-1.5 font-body text-xs text-sage-500">
              {storageMode === 'local' ? (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Local storage — your action descriptions stay on this device
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                  </svg>
                  Cloud storage — scores saved to your account
                </>
              )}
            </span>
          </div>
        )}

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
          <div className="bg-white/60 border border-sage-200 rounded-lg p-8 text-center">
            <div className="inline-flex items-center justify-center w-32 h-32 rounded-full border-4 mb-4" style={{ borderColor: tier.color }}>
              <div>
                <p className="font-display text-4xl font-bold" style={{ color: tier.color }}>{result.total_score}</p>
                <p className="font-body text-xs text-sage-600">out of 100</p>
              </div>
            </div>
            <h2 className="font-display text-2xl font-medium text-sage-800 mb-1">{tier.label}</h2>
            <p className="font-body text-sage-600 text-sm">{tier.description}</p>

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
                  <span className="font-body text-sm text-sage-400">Score 70+ to earn a stamp</span>
                </div>
              )}
            </div>

            {saved && (
              <p className="mt-4 text-sm text-sage-500 font-body italic">
                {storageMode === 'local' ? 'Score saved to this device.' : 'Score saved to your profile.'}
              </p>
            )}
          </div>

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

          <div className="bg-white/60 border border-sage-200 rounded-lg p-8 space-y-4">
            {/* Zeus header — ancient advice */}
            <div className="flex items-center gap-3 pb-3 border-b border-sage-100">
              <img src="/images/Zeus.PNG" alt="The Sage" className="w-14 h-14 object-contain rounded-full border-2 border-amber-200 bg-amber-50/50 drop-shadow-sm" />
              <div>
                <p className="font-display text-sm font-medium text-amber-800">Ancient Advice*</p>
                <p className="font-body text-xs text-sage-500">Stoic virtue analysis from the Sage Brain</p>
              </div>
            </div>
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

          {!earnsStamp && result.growth_action && (
            <div className="bg-sage-50/80 border-2 border-sage-300 rounded-lg p-8 space-y-5">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-16 h-16 rounded-full border-2 border-amber-200 bg-amber-50/50 flex items-center justify-center overflow-hidden">
                  <img src="/images/Zeus.PNG" alt="The Sage" className="w-14 h-14 object-contain" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-display text-lg font-medium text-sage-800">What a Sage Might Consider</h3>
                    <span className="font-body text-xs text-amber-700 italic">(ancient advice*)</span>
                  </div>
                  <p className="font-body text-sage-700 leading-relaxed">{result.growth_action}</p>
                </div>
              </div>

              <div className="flex items-center gap-6 pt-3 border-t border-sage-200">
                <div className="flex-1 text-center">
                  <p className="font-body text-xs text-sage-400 mb-1">Your action</p>
                  <p className="font-display text-2xl font-bold text-sage-400">{result.total_score}</p>
                  <div className="w-10 h-10 rounded-lg border border-sage-200 bg-white/50 flex items-center justify-center mx-auto mt-2">
                    {strongestVirtue ? (
                      <img src={strongestVirtue.icon} alt="" className="w-7 h-7 opacity-20 grayscale" />
                    ) : <span className="text-sage-200">—</span>}
                  </div>
                  <p className="font-body text-xs text-sage-300 mt-1">No stamp</p>
                </div>

                <div className="flex-shrink-0">
                  <svg className="w-8 h-8 text-sage-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>

                <div className="flex-1 text-center">
                  <p className="font-body text-xs text-sage-500 mb-1">Growth action</p>
                  <p className="font-display text-2xl font-bold" style={{ color: result.growth_action_projected_score >= STAMP_THRESHOLD ? '#7d9468' : '#B2AC88' }}>
                    ~{result.growth_action_projected_score}
                  </p>
                  <div
                    className="w-10 h-10 rounded-lg border-2 flex items-center justify-center mx-auto mt-2"
                    style={result.growth_action_projected_score >= STAMP_THRESHOLD && strongestVirtue ? {
                      borderColor: strongestVirtue.color, backgroundColor: strongestVirtue.color + '10',
                    } : { borderColor: '#d1cdb8', backgroundColor: '#fafaf5' }}
                  >
                    {result.growth_action_projected_score >= STAMP_THRESHOLD && strongestVirtue ? (
                      <img src={strongestVirtue.icon} alt="" className="w-7 h-7 drop-shadow-sm" />
                    ) : <span className="text-sage-300">—</span>}
                  </div>
                  <p className="font-body text-xs mt-1" style={{ color: result.growth_action_projected_score >= STAMP_THRESHOLD ? '#7d9468' : '#B2AC88' }}>
                    {result.growth_action_projected_score >= STAMP_THRESHOLD ? 'Stamp earned' : 'Closer to stamp'}
                  </p>
                </div>
              </div>

              <button
                onClick={handleScoreGrowthAction}
                className="w-full py-3 bg-sage-400 text-white font-display text-base rounded hover:bg-sage-500 transition-colors"
              >
                Score This Growth Action Instead
              </button>

              <p className="font-body text-xs text-sage-400 text-center italic leading-relaxed">
                The stamp marks the action — it is not the reason for it.
                Virtue is its own reward; the calendar simply records your practice.
              </p>
            </div>
          )}

          {earnsStamp && result.growth_action && (
            <div className="bg-white/60 border border-sage-200 rounded-lg p-8">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-16 h-16 rounded-full border-2 border-amber-200 bg-amber-50/50 flex items-center justify-center overflow-hidden">
                  <img src="/images/Zeus.PNG" alt="The Sage" className="w-14 h-14 object-contain" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-display text-base font-medium text-sage-800">The Sage Path Forward</h3>
                    <span className="font-body text-xs text-amber-700 italic">(ancient advice*)</span>
                  </div>
                  <p className="font-body text-sage-600 leading-relaxed text-sm">{result.growth_action}</p>
                  <p className="font-body text-xs text-sage-400 mt-3 italic">
                    There is always a higher expression of virtue. The sage never stops progressing.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Ancient advice footnote */}
          <div className="pt-4 border-t border-sage-100">
            <p className="font-body text-xs text-sage-400 italic">
              * ancient advice does not consider your legal or personal obligations.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
