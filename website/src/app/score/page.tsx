'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { authFetch } from '@/lib/auth-fetch'
import { trackEvent } from '@/lib/analytics'
import {
  VIRTUE_EXPRESSIONS,
  PROXIMITY_LEVELS,
  ROOT_PASSIONS,
  OIKEIOSIS_STAGES,
  EVALUATIVE_DISCLAIMER,
  type KatorthomaProximityLevel,
} from '@/lib/stoic-brain'
import type { User } from '@supabase/supabase-js'

// ─── V3 Result Types (derived from scoring.json outputs) ───

interface PassionDetected {
  id: string
  name: string
  root_passion: string
}

interface V3EvaluationResult {
  control_filter: {
    within_prohairesis: string[]
    outside_prohairesis: string[]
  }
  kathekon_assessment: {
    is_kathekon: boolean
    quality: 'strong' | 'moderate' | 'marginal' | 'contrary'
  }
  passion_diagnosis: {
    passions_detected: PassionDetected[]
    false_judgements: string[]
    causal_stage_affected: string
  }
  virtue_quality: {
    katorthoma_proximity: KatorthomaProximityLevel
    ruling_faculty_state: string
    virtue_domains_engaged: string[]
  }
  improvement_path: string
  oikeiosis_context: string
  philosophical_reflection: string
  disclaimer: string
}

type StorageMode = 'cloud' | 'local' | null

// Proximity level display config — derived from scoring.json levels
const PROXIMITY_DISPLAY: Record<KatorthomaProximityLevel, { color: string; icon: string }> = {
  reflexive: { color: '#9e3a3a', icon: '○' },
  habitual: { color: '#c4843a', icon: '◔' },
  deliberate: { color: '#B2AC88', icon: '◑' },
  principled: { color: '#7d9468', icon: '◕' },
  sage_like: { color: '#4d6040', icon: '●' },
}

// Kathekon quality display
// R8c: English-only labels for user-facing display
const KATHEKON_DISPLAY: Record<string, { label: string; color: string }> = {
  strong: { label: 'Strong Appropriate Action', color: '#4d6040' },
  moderate: { label: 'Moderate Appropriate Action', color: '#7d9468' },
  marginal: { label: 'Marginal Appropriate Action', color: '#B2AC88' },
  contrary: { label: 'Contrary to Appropriate Action', color: '#9e3a3a' },
}

// R8c: Map root passion IDs (Greek, R8a data layer) to English display names
const ROOT_PASSION_ENGLISH: Record<string, string> = {
  epithumia: 'Craving',
  hedone: 'Irrational Pleasure',
  phobos: 'Fear',
  lupe: 'Distress',
}

// R8c: English-only proximity level names (data layer uses Greek/technical)
const PROXIMITY_ENGLISH: Record<KatorthomaProximityLevel, string> = {
  reflexive: 'Reflexive',
  habitual: 'Habitual',
  deliberate: 'Deliberate',
  principled: 'Principled',
  sage_like: 'Sage-Like',
}

export default function ScoreActionPage() {
  const [user, setUser] = useState<User | null>(null)
  const [storageMode, setStorageMode] = useState<StorageMode>(null)
  const [showSetup, setShowSetup] = useState(false)

  // V3 input fields — derived from what the 4-stage evaluation needs
  const [action, setAction] = useState('')
  const [context, setContext] = useState('')
  const [relationships, setRelationships] = useState('')
  const [emotionalState, setEmotionalState] = useState('')

  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<V3EvaluationResult | null>(null)
  const [saved, setSaved] = useState(false)

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

  const handleEvaluate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)
    setSaved(false)

    try {
      const response = await authFetch('/api/score', {
        method: 'POST',
        body: JSON.stringify({
          action,
          context,
          relationships,
          emotional_state: emotionalState,
        }),
      })

      if (!response.ok) throw new Error('Evaluation failed')

      const evalResult: V3EvaluationResult = await response.json()
      setResult(evalResult)

      trackEvent({
        event_type: 'evaluate_action',
        metadata: {
          katorthoma_proximity: evalResult.virtue_quality.katorthoma_proximity,
          passions_count: evalResult.passion_diagnosis.passions_detected.length,
          is_kathekon: evalResult.kathekon_assessment.is_kathekon,
        },
      })

      // Save result
      if (user && storageMode === 'cloud') {
        const { error } = await supabase.from('action_evaluations_v3').insert({
          user_id: user.id,
          action_description: action,
          context,
          relationships,
          emotional_state: emotionalState,
          katorthoma_proximity: evalResult.virtue_quality.katorthoma_proximity,
          is_kathekon: evalResult.kathekon_assessment.is_kathekon,
          kathekon_quality: evalResult.kathekon_assessment.quality,
          passions_detected: evalResult.passion_diagnosis.passions_detected,
          false_judgements: evalResult.passion_diagnosis.false_judgements,
          ruling_faculty_state: evalResult.virtue_quality.ruling_faculty_state,
          philosophical_reflection: evalResult.philosophical_reflection,
          improvement_path: evalResult.improvement_path,
          evaluated_by: 'claude-api-v3',
        })
        if (!error) setSaved(true)
      } else if (user && storageMode === 'local') {
        setSaved(true)
      }
    } catch {
      alert('Evaluation failed. Please try again.')
    }

    setLoading(false)
  }

  const proximityLevel = result
    ? PROXIMITY_LEVELS.find(l => l.id === result.virtue_quality.katorthoma_proximity)
    : null
  const proximityDisplay = result
    ? PROXIMITY_DISPLAY[result.virtue_quality.katorthoma_proximity]
    : null

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'SageReasoning — Evaluate an Action',
    description: 'Evaluate any action through the Stoic 4-stage evaluation sequence: control filter, appropriate action assessment, passion identification, and right action proximity.',
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
          <h1 className="font-display text-3xl md:text-4xl font-medium text-sage-800 mb-3">Evaluate an Action</h1>
          <p className="font-body text-sage-600">Before you begin — where should your evaluations be saved?</p>
        </div>

        <div className="bg-white/60 border border-sage-200 rounded-lg p-8 mb-6">
          <p className="font-body text-sage-600 mb-6">
            When you evaluate an action you describe the situation, your reasoning, and your relationships.
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
                Your evaluations are saved to your account. Track your philosophical progress over time.
              </p>
              <ul className="font-body text-xs text-sage-500 space-y-1">
                <li>+ Full history on your dashboard</li>
                <li>+ Track passion reduction over time</li>
                <li>+ Feeds your progress dimensions</li>
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
              </p>
              <ul className="font-body text-xs text-sage-500 space-y-1">
                <li>+ Maximum privacy</li>
                <li>- Only accessible on this device</li>
                <li>- Clearing browser data removes entries</li>
              </ul>
            </button>
          </div>
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
        <h1 className="font-display text-3xl md:text-4xl font-medium text-sage-800 mb-3">Evaluate an Action</h1>
        <p className="font-body text-sage-700 max-w-xl mx-auto">
          Describe an action and receive a philosophical evaluation through the Stoic 4-stage sequence:
          control filter, appropriate action assessment, passion identification,
          and right action proximity.
        </p>
      </div>

      {/* ─── V3 Input Form (P3.1) ─── */}
      <form onSubmit={handleEvaluate} className="bg-white/60 border border-sage-200 rounded-lg p-8 space-y-6 mb-12">

        {user && storageMode && (
          <div className="flex items-center justify-between pb-2 border-b border-sage-100">
            <span className="inline-flex items-center gap-1.5 font-body text-xs text-sage-500">
              {storageMode === 'local' ? (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Local storage — your descriptions stay on this device
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                  </svg>
                  Cloud storage — evaluations saved to your account
                </>
              )}
            </span>
          </div>
        )}

        {/* Required: Action description */}
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

        {/* Optional: Context */}
        <div>
          <label className="block font-display text-sm font-medium text-sage-700 mb-1">
            Context <span className="text-sage-400 font-normal">(what was the situation?)</span>
          </label>
          <textarea
            rows={2}
            value={context}
            onChange={(e) => setContext(e.target.value)}
            className="w-full px-4 py-3 border border-sage-300 rounded bg-white font-body text-sage-900 focus:outline-none focus:ring-2 focus:ring-sage-400"
            placeholder="e.g. In a team meeting where others stayed silent..."
          />
        </div>

        {/* V3-specific: Relationships / oikeiosis context */}
        <div>
          <label className="block font-display text-sm font-medium text-sage-700 mb-1">
            Who is affected? <span className="text-sage-400 font-normal">(your relationships and roles)</span>
          </label>
          <textarea
            rows={2}
            value={relationships}
            onChange={(e) => setRelationships(e.target.value)}
            className="w-full px-4 py-3 border border-sage-300 rounded bg-white font-body text-sage-900 focus:outline-none focus:ring-2 focus:ring-sage-400"
            placeholder="e.g. My colleague (peer), the team (community), the client who was affected..."
          />
          <p className="font-body text-xs text-sage-400 mt-1">
            Circles of concern: self → household → community → humanity → cosmic order
          </p>
        </div>

        {/* V3-specific: Emotional state for passion diagnosis */}
        <div>
          <label className="block font-display text-sm font-medium text-sage-700 mb-1">
            What were you feeling? <span className="text-sage-400 font-normal">(helps identify passions at work)</span>
          </label>
          <textarea
            rows={2}
            value={emotionalState}
            onChange={(e) => setEmotionalState(e.target.value)}
            className="w-full px-4 py-3 border border-sage-300 rounded bg-white font-body text-sage-900 focus:outline-none focus:ring-2 focus:ring-sage-400"
            placeholder="e.g. Frustrated, anxious about the outcome, wanting recognition..."
          />
        </div>

        <button
          type="submit"
          disabled={loading || !action}
          className="w-full py-3 bg-sage-400 text-white font-display text-lg rounded hover:bg-sage-500 transition-colors disabled:opacity-50"
        >
          {loading ? 'Evaluating through 4-stage sequence...' : 'Evaluate This Action'}
        </button>

        {!user && (
          <p className="text-center font-body text-sm text-sage-500">
            <a href="/auth" className="underline text-sage-700">Sign in</a> to save evaluations to your profile.
          </p>
        )}
      </form>

      {/* ─── V3 Output Display (P3.2) ─── */}
      {result && proximityLevel && proximityDisplay && (
        <div className="space-y-6">

          {/* Katorthoma Proximity — the primary result */}
          <div className="bg-white/60 border border-sage-200 rounded-lg p-8 text-center">
            <p className="font-body text-sm text-sage-500 mb-2">Right Action Proximity</p>
            <div className="inline-flex items-center justify-center w-28 h-28 rounded-full border-4 mb-4" style={{ borderColor: proximityDisplay.color }}>
              <span className="font-display text-4xl" style={{ color: proximityDisplay.color }}>
                {proximityDisplay.icon}
              </span>
            </div>
            <h2 className="font-display text-2xl font-medium text-sage-800 mb-1">
              {PROXIMITY_ENGLISH[result.virtue_quality.katorthoma_proximity]}
            </h2>
            <p className="font-body text-sage-600 text-sm max-w-md mx-auto">{proximityLevel.description}</p>

            {/* Proximity scale visualization */}
            <div className="flex items-center justify-center gap-1 mt-6 pt-4 border-t border-sage-100">
              {PROXIMITY_LEVELS.map((level) => {
                const display = PROXIMITY_DISPLAY[level.id]
                const isActive = level.id === result.virtue_quality.katorthoma_proximity
                return (
                  <div key={level.id} className="flex flex-col items-center gap-1" style={{ opacity: isActive ? 1 : 0.3 }}>
                    <div
                      className="w-10 h-2 rounded-full"
                      style={{ backgroundColor: display.color }}
                    />
                    <span className="font-body text-[10px] text-sage-500">{PROXIMITY_ENGLISH[level.id]}</span>
                  </div>
                )
              })}
            </div>

            {saved && (
              <p className="mt-4 text-sm text-sage-500 font-body italic">
                Evaluation saved{storageMode === 'local' ? ' to this device' : ' to your profile'}.
              </p>
            )}
          </div>

          {/* Stage 1: Prohairesis Filter */}
          <div className="bg-white/60 border border-sage-200 rounded-lg p-6">
            <h3 className="font-display text-base font-medium text-sage-800 mb-3 flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-sage-100 text-sage-600 font-display text-xs">1</span>
              Control Filter
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="font-display text-xs text-sage-500 mb-2">Within your moral choice</p>
                <ul className="space-y-1">
                  {result.control_filter.within_prohairesis.map((item, i) => (
                    <li key={i} className="font-body text-sm text-sage-700 flex items-start gap-2">
                      <span className="text-sage-400 mt-0.5">+</span> {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="font-display text-xs text-sage-500 mb-2">Outside your moral choice</p>
                <ul className="space-y-1">
                  {result.control_filter.outside_prohairesis.map((item, i) => (
                    <li key={i} className="font-body text-sm text-sage-500 flex items-start gap-2">
                      <span className="text-sage-300 mt-0.5">–</span> {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Stage 2: Kathekon Assessment */}
          <div className="bg-white/60 border border-sage-200 rounded-lg p-6">
            <h3 className="font-display text-base font-medium text-sage-800 mb-3 flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-sage-100 text-sage-600 font-display text-xs">2</span>
              Appropriate Action
            </h3>
            {(() => {
              const kDisplay = KATHEKON_DISPLAY[result.kathekon_assessment.quality] || KATHEKON_DISPLAY.moderate
              return (
                <div className="flex items-center gap-3">
                  <span
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full font-display text-sm font-medium text-white"
                    style={{ backgroundColor: kDisplay.color }}
                  >
                    {result.kathekon_assessment.is_kathekon ? '✓' : '✗'} {kDisplay.label}
                  </span>
                </div>
              )
            })()}
            {result.oikeiosis_context && (
              <p className="font-body text-sm text-sage-600 mt-3">{result.oikeiosis_context}</p>
            )}
          </div>

          {/* Stage 3: Passion Identification (R6d: diagnostic, not punitive) */}
          <div className="bg-white/60 border border-sage-200 rounded-lg p-6">
            <h3 className="font-display text-base font-medium text-sage-800 mb-3 flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-sage-100 text-sage-600 font-display text-xs">3</span>
              Passions Identified
              <span className="font-body text-xs text-sage-400 font-normal ml-1">(philosophical self-knowledge)</span>
            </h3>

            {result.passion_diagnosis.passions_detected.length === 0 ? (
              <p className="font-body text-sm text-sage-600 italic">No passions detected — the action appears free from distortion by false judgement.</p>
            ) : (
              <div className="space-y-3">
                {result.passion_diagnosis.passions_detected.map((passion, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-sage-50/50 rounded">
                    <span className="font-display text-sm font-medium text-sage-700">{passion.name}</span>
                    <span className="font-body text-xs text-sage-400 mt-0.5">({ROOT_PASSION_ENGLISH[passion.root_passion] || passion.root_passion})</span>
                  </div>
                ))}

                {result.passion_diagnosis.false_judgements.length > 0 && (
                  <div className="pt-3 border-t border-sage-100">
                    <p className="font-display text-xs text-sage-500 mb-2">False judgements identified</p>
                    {result.passion_diagnosis.false_judgements.map((fj, i) => (
                      <p key={i} className="font-body text-sm text-sage-700 mb-1">• {fj}</p>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Stage 4: Virtue Domains Engaged */}
          <div className="bg-white/60 border border-sage-200 rounded-lg p-6">
            <h3 className="font-display text-base font-medium text-sage-800 mb-3 flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-sage-100 text-sage-600 font-display text-xs">4</span>
              Unified Virtue Assessment
            </h3>
            <div className="flex flex-wrap gap-2 mb-3">
              {VIRTUE_EXPRESSIONS.map((v) => {
                const isEngaged = result.virtue_quality.virtue_domains_engaged.includes(v.id)
                return (
                  <span
                    key={v.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-display text-xs"
                    style={{
                      backgroundColor: isEngaged ? '#f0efe6' : '#fafaf8',
                      color: isEngaged ? '#4a5a3a' : '#b8b4a0',
                      border: `1px solid ${isEngaged ? '#c5c0a8' : '#e8e6dc'}`,
                    }}
                  >
                    {v.name}
                  </span>
                )
              })}
            </div>
            <p className="font-body text-sm text-sage-600">{result.virtue_quality.ruling_faculty_state}</p>
          </div>

          {/* Philosophical Reflection + Improvement Path */}
          <div className="bg-white/60 border border-sage-200 rounded-lg p-8 space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-sage-100">
              <img src="/images/Zeus.PNG" alt="The Sage" className="w-14 h-14 object-contain rounded-full border-2 border-amber-200 bg-amber-50/50 drop-shadow-sm" />
              <div>
                <p className="font-display text-sm font-medium text-amber-800">Philosophical Reflection</p>
                <p className="font-body text-xs text-sage-500">Stoic evaluation from the Sage Brain</p>
              </div>
            </div>
            <p className="font-body text-sage-700 leading-relaxed">{result.philosophical_reflection}</p>

            {result.improvement_path && (
              <div className="pt-3 border-t border-sage-100">
                <h4 className="font-display text-sm font-medium text-sage-700 mb-2">Path Forward</h4>
                <p className="font-body text-sage-600 leading-relaxed">{result.improvement_path}</p>
              </div>
            )}
          </div>

          {/* R3: Disclaimer */}
          <div className="pt-4 border-t border-sage-100">
            <p className="font-body text-xs text-sage-400 italic">
              {EVALUATIVE_DISCLAIMER}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
