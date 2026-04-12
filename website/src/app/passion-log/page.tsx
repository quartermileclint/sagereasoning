'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { authFetch } from '@/lib/auth-fetch'
import type { User } from '@supabase/supabase-js'

/**
 * Gap 2 — Passion Log + Classification
 *
 * Tracks passion events with user self-diagnosis and LLM classification.
 * Displays comparison, intensity trends, and pre-assent catch rate.
 *
 * Done criteria:
 * - Entry form live with four required fields
 * - LLM classification endpoint live and returning structured response
 * - Comparison display renders user vs engine diagnosis
 * - Trend view renders intensity over time per passion type
 * - Pre/post-assent catch rate calculated and displayed
 * - Classification accuracy trackable across entries
 */

interface PassionEvent {
  id: string
  passion_type: string
  intensity: number
  caught_before_assent: boolean
  false_judgement: string
  description: string | null
  llm_classified_type: string | null
  llm_confidence: number | null
  classification_match: boolean | null
  created_at: string
}

interface WeeklyCatchRate {
  week_start: string
  total_events: number
  pre_assent_events: number
  pre_assent_catch_rate_pct: number
}

interface IntensityTrend {
  passion_type: string
  week_start: string
  avg_intensity: number
  event_count: number
}

interface ClassificationAccuracy {
  classified_count: number
  match_count: number
  match_rate_pct: number | null
}

// Passion taxonomy with families
const PASSION_FAMILIES: Record<string, { label: string; color: string; types: string[] }> = {
  epithumia: {
    label: 'Epithumia (irrational desire)',
    color: '#b85c38',
    types: ['philodoxia', 'orge', 'pothos', 'philedonia', 'philoplousia', 'eros'],
  },
  phobos: {
    label: 'Phobos (irrational fear)',
    color: '#5b7fa5',
    types: ['agonia', 'oknos', 'aischyne', 'deima', 'thambos', 'thorybos'],
  },
  lupe: {
    label: 'Lupe (irrational grief)',
    color: '#6b8f71',
    types: ['penthos', 'phthonos', 'zelotypia', 'eleos', 'achos'],
  },
  hedone: {
    label: 'Hedone (irrational pleasure)',
    color: '#9b7d4a',
    types: ['kelesis', 'epichairekakia', 'terpsis'],
  },
}

const PASSION_LABELS: Record<string, string> = {
  philodoxia: 'Philodoxia (love of honour)',
  orge: 'Orge (anger)',
  pothos: 'Pothos (longing)',
  philedonia: 'Philedonia (love of pleasure)',
  philoplousia: 'Philoplousia (love of wealth)',
  eros: 'Eros (erotic love)',
  agonia: 'Agonia (anxiety)',
  oknos: 'Oknos (hesitation/avoidance)',
  aischyne: 'Aischyne (shame)',
  deima: 'Deima (terror)',
  thambos: 'Thambos (shock)',
  thorybos: 'Thorybos (inner turmoil)',
  penthos: 'Penthos (grief)',
  phthonos: 'Phthonos (envy)',
  zelotypia: 'Zelotypia (jealousy)',
  eleos: 'Eleos (pity)',
  achos: 'Achos (distress)',
  kelesis: 'Kelesis (enchantment)',
  epichairekakia: 'Epichairekakia (malicious joy)',
  terpsis: 'Terpsis (delight in wrong)',
}

type ViewMode = 'log' | 'trends' | 'catch-rate'

export default function PassionLogPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeView, setActiveView] = useState<ViewMode>('log')

  // Feed state
  const [events, setEvents] = useState<PassionEvent[]>([])
  const [totalEvents, setTotalEvents] = useState(0)
  const [accuracy, setAccuracy] = useState<ClassificationAccuracy | null>(null)

  // Trend state
  const [trends, setTrends] = useState<IntensityTrend[]>([])
  const [catchRateData, setCatchRateData] = useState<WeeklyCatchRate[]>([])

  // Form state
  const [showForm, setShowForm] = useState(true)
  const [passionType, setPassionType] = useState('')
  const [intensity, setIntensity] = useState(3)
  const [caughtBefore, setCaughtBefore] = useState(false)
  const [falseJudgement, setFalseJudgement] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [classifying, setClassifying] = useState(false)
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [classificationResult, setClassificationResult] = useState<{
    classified_type: string
    confidence: number
    match: boolean
    reasoning: string
  } | null>(null)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        window.location.href = '/auth'
        return
      }
      setUser(user)
      await Promise.all([fetchFeed(), fetchAccuracy()])
      setLoading(false)
    }
    load()
  }, [])

  const fetchFeed = useCallback(async () => {
    const res = await authFetch('/api/mentor/passion-log?view=feed&limit=50')
    if (res.ok) {
      const data = await res.json()
      setEvents(data.events)
      setTotalEvents(data.total)
    }
  }, [])

  const fetchAccuracy = useCallback(async () => {
    const res = await authFetch('/api/mentor/passion-log?view=accuracy')
    if (res.ok) {
      const data = await res.json()
      setAccuracy(data.data)
    }
  }, [])

  const fetchTrends = useCallback(async () => {
    const res = await authFetch('/api/mentor/passion-log?view=trends')
    if (res.ok) {
      const data = await res.json()
      setTrends(data.data)
    }
  }, [])

  const fetchCatchRate = useCallback(async () => {
    const res = await authFetch('/api/mentor/passion-log?view=catch-rate')
    if (res.ok) {
      const data = await res.json()
      setCatchRateData(data.data)
    }
  }, [])

  async function handleViewChange(view: ViewMode) {
    setActiveView(view)
    if (view === 'trends' && trends.length === 0) await fetchTrends()
    if (view === 'catch-rate' && catchRateData.length === 0) await fetchCatchRate()
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!passionType || !falseJudgement.trim() || submitting) return
    setSubmitting(true)
    setSubmitMessage(null)
    setClassificationResult(null)

    try {
      const res = await authFetch('/api/mentor/passion-log', {
        method: 'POST',
        body: JSON.stringify({
          passion_type: passionType,
          intensity,
          caught_before_assent: caughtBefore,
          false_judgement: falseJudgement.trim(),
          description: description.trim() || undefined,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setSubmitMessage({ type: 'success', text: 'Passion event logged.' })

        // Now classify if there's a description
        if (description.trim()) {
          setClassifying(true)
          try {
            const classifyRes = await authFetch('/api/mentor/passion-classify', {
              method: 'POST',
              body: JSON.stringify({
                description: description.trim(),
                user_diagnosis: passionType,
                event_id: data.event.id,
              }),
            })
            if (classifyRes.ok) {
              const classData = await classifyRes.json()
              setClassificationResult(classData)
            }
          } catch {
            // Non-fatal — classification is supplementary
          }
          setClassifying(false)
        }

        setShowForm(false)
        await Promise.all([fetchFeed(), fetchAccuracy()])
      } else {
        const err = await res.json()
        setSubmitMessage({ type: 'error', text: err.error || 'Failed to log event' })
      }
    } catch {
      setSubmitMessage({ type: 'error', text: 'Network error — please try again' })
    }
    setSubmitting(false)
  }

  function resetForm() {
    setPassionType('')
    setIntensity(3)
    setCaughtBefore(false)
    setFalseJudgement('')
    setDescription('')
    setClassificationResult(null)
    setSubmitMessage(null)
    setShowForm(true)
  }

  function getFamilyForType(type: string): string {
    for (const [family, data] of Object.entries(PASSION_FAMILIES)) {
      if (data.types.includes(type)) return family
    }
    return 'epithumia'
  }

  function getFamilyColor(type: string): string {
    const family = getFamilyForType(type)
    return PASSION_FAMILIES[family]?.color || '#666'
  }

  function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center text-sage-500 font-body">Loading passion log...</div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-sage-900 mb-1">
          Passion Log
        </h1>
        <p className="font-body text-sage-500">
          Track passion events. Build the feedback loop that makes the synkatathesis gap visible.
        </p>
      </div>

      {/* Stats bar */}
      {totalEvents > 0 && (
        <div className="grid grid-cols-4 gap-3 mb-6">
          <div className="bg-white border border-sage-200 rounded-lg p-3 text-center">
            <div className="font-display text-xl font-semibold text-sage-900">{totalEvents}</div>
            <div className="font-body text-xs text-sage-500">Events</div>
          </div>
          <div className="bg-white border border-sage-200 rounded-lg p-3 text-center">
            <div className="font-display text-xl font-semibold text-sage-900">
              {events.filter(e => e.caught_before_assent).length}
            </div>
            <div className="font-body text-xs text-sage-500">Pre-assent</div>
          </div>
          <div className="bg-white border border-sage-200 rounded-lg p-3 text-center">
            <div className="font-display text-xl font-semibold text-sage-900">
              {accuracy?.match_rate_pct !== null && accuracy?.match_rate_pct !== undefined
                ? `${accuracy.match_rate_pct}%`
                : '—'}
            </div>
            <div className="font-body text-xs text-sage-500">Classifier match</div>
          </div>
          <div className="bg-white border border-sage-200 rounded-lg p-3 text-center">
            <div className="font-display text-xl font-semibold text-sage-900">
              {catchRateData.length > 0
                ? `${catchRateData[catchRateData.length - 1].pre_assent_catch_rate_pct}%`
                : '—'}
            </div>
            <div className="font-body text-xs text-sage-500">Catch rate (latest)</div>
          </div>
        </div>
      )}

      {/* View tabs */}
      <div className="flex gap-1 mb-6 bg-sage-50 rounded-lg p-1">
        {[
          { id: 'log' as const, label: 'Event Log' },
          { id: 'trends' as const, label: 'Intensity Trends' },
          { id: 'catch-rate' as const, label: 'Catch Rate' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleViewChange(tab.id)}
            className={`flex-1 px-4 py-2 rounded-md font-display text-sm transition-colors ${
              activeView === tab.id
                ? 'bg-white text-sage-900 shadow-sm'
                : 'text-sage-500 hover:text-sage-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ─── Log View ─── */}
      {activeView === 'log' && (
        <>
          {/* Entry Form */}
          {showForm ? (
            <form onSubmit={handleSubmit} className="bg-white border border-sage-200 rounded-lg p-6 mb-6">
              <h2 className="font-display text-lg font-medium text-sage-800 mb-4">Log Passion Event</h2>

              {/* Passion type selector */}
              <div className="mb-4">
                <label className="font-display text-sm font-medium text-sage-600 block mb-2">
                  Passion type
                  <span className="font-body text-xs text-sage-400 ml-2">Your self-diagnosis</span>
                </label>
                <select
                  value={passionType}
                  onChange={(e) => setPassionType(e.target.value)}
                  className="w-full border border-sage-200 rounded-lg p-3 font-body text-sm text-sage-800 focus:outline-none focus:ring-2 focus:ring-sage-300 bg-white"
                  required
                >
                  <option value="">Select passion type...</option>
                  {Object.entries(PASSION_FAMILIES).map(([family, data]) => (
                    <optgroup key={family} label={data.label}>
                      {data.types.map((type) => (
                        <option key={type} value={type}>
                          {PASSION_LABELS[type] || type}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              {/* Intensity */}
              <div className="mb-4">
                <label className="font-display text-sm font-medium text-sage-600 block mb-2">
                  Intensity: {intensity}/5
                </label>
                <input
                  type="range"
                  min={1}
                  max={5}
                  step={1}
                  value={intensity}
                  onChange={(e) => setIntensity(parseInt(e.target.value))}
                  className="w-full accent-sage-500"
                />
                <div className="flex justify-between font-body text-xs text-sage-400 mt-1">
                  <span>Mild</span>
                  <span>Moderate</span>
                  <span>Strong</span>
                  <span>Intense</span>
                  <span>Overwhelming</span>
                </div>
              </div>

              {/* Caught before/after assent */}
              <div className="mb-4">
                <label className="font-display text-sm font-medium text-sage-600 block mb-2">
                  Caught before or after assent?
                </label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setCaughtBefore(true)}
                    className={`flex-1 py-2 px-4 rounded-lg border-2 font-body text-sm transition-colors ${
                      caughtBefore
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-sage-200 text-sage-500 hover:border-sage-300'
                    }`}
                  >
                    Before assent
                  </button>
                  <button
                    type="button"
                    onClick={() => setCaughtBefore(false)}
                    className={`flex-1 py-2 px-4 rounded-lg border-2 font-body text-sm transition-colors ${
                      !caughtBefore
                        ? 'border-amber-500 bg-amber-50 text-amber-700'
                        : 'border-sage-200 text-sage-500 hover:border-sage-300'
                    }`}
                  >
                    After assent
                  </button>
                </div>
              </div>

              {/* False judgement */}
              <div className="mb-4">
                <label className="font-display text-sm font-medium text-sage-600 block mb-1">
                  False judgement
                  <span className="font-body text-xs text-sage-400 ml-2">What drove it?</span>
                </label>
                <textarea
                  value={falseJudgement}
                  onChange={(e) => setFalseJudgement(e.target.value)}
                  placeholder="What false judgement was operating? What did you treat as good/bad that isn't?"
                  rows={3}
                  className="w-full border border-sage-200 rounded-lg p-3 font-body text-sm text-sage-800 placeholder:text-sage-300 focus:outline-none focus:ring-2 focus:ring-sage-300 resize-y"
                  required
                />
              </div>

              {/* Description (for LLM classification) */}
              <div className="mb-6">
                <label className="font-display text-sm font-medium text-sage-600 block mb-1">
                  Description
                  <span className="font-body text-xs text-sage-400 ml-2">Optional — enables LLM classification</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what happened in your own words. The engine will classify the passion and compare with your self-diagnosis."
                  rows={3}
                  className="w-full border border-sage-200 rounded-lg p-3 font-body text-sm text-sage-800 placeholder:text-sage-300 focus:outline-none focus:ring-2 focus:ring-sage-300 resize-y"
                />
              </div>

              {submitMessage && (
                <div className={`mb-4 p-3 rounded-lg text-sm font-body ${
                  submitMessage.type === 'success'
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {submitMessage.text}
                </div>
              )}

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!passionType || !falseJudgement.trim() || submitting}
                  className="px-6 py-2 bg-sage-500 text-white font-display text-sm rounded hover:bg-sage-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Saving...' : 'Log Event'}
                </button>
              </div>
            </form>
          ) : (
            <div className="mb-6">
              {/* Classification result */}
              {classificationResult && (
                <div className="bg-white border border-sage-200 rounded-lg p-5 mb-4">
                  <h3 className="font-display text-sm font-medium text-sage-700 mb-3">Engine Classification</h3>
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <div className="font-body text-xs text-sage-400 mb-1">Your diagnosis</div>
                      <div className="font-display text-sm font-medium" style={{ color: getFamilyColor(passionType) }}>
                        {PASSION_LABELS[passionType] || passionType}
                      </div>
                    </div>
                    <div>
                      <div className="font-body text-xs text-sage-400 mb-1">Engine classification</div>
                      <div className="font-display text-sm font-medium" style={{ color: getFamilyColor(classificationResult.classified_type) }}>
                        {PASSION_LABELS[classificationResult.classified_type] || classificationResult.classified_type}
                      </div>
                    </div>
                  </div>
                  <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-body ${
                    classificationResult.match
                      ? 'bg-green-50 text-green-700'
                      : 'bg-amber-50 text-amber-700'
                  }`}>
                    {classificationResult.match ? 'Match' : 'Mismatch — diagnostic data'}
                    <span className="text-sage-400 ml-1">
                      ({Math.round(classificationResult.confidence * 100)}% confidence)
                    </span>
                  </div>
                  <p className="font-body text-xs text-sage-500 mt-2">{classificationResult.reasoning}</p>
                </div>
              )}

              {classifying && (
                <div className="bg-white border border-sage-200 rounded-lg p-4 mb-4 text-center">
                  <span className="font-body text-sm text-sage-500">Classifying passion...</span>
                </div>
              )}

              <button
                onClick={resetForm}
                className="w-full border-2 border-dashed border-sage-200 rounded-lg p-4 text-center font-body text-sm text-sage-400 hover:border-sage-400 hover:text-sage-600 transition-colors"
              >
                + Log new event
              </button>
            </div>
          )}

          {/* Event feed */}
          <div className="space-y-3">
            {events.length === 0 ? (
              <div className="bg-sage-50 border border-sage-200 rounded-lg p-8 text-center">
                <p className="font-body text-sage-500">
                  No passion events logged yet. Start tracking to build the feedback loop.
                </p>
              </div>
            ) : (
              events.map((event) => (
                <div key={event.id} className="bg-white border border-sage-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="font-display text-sm font-medium"
                        style={{ color: getFamilyColor(event.passion_type) }}
                      >
                        {PASSION_LABELS[event.passion_type] || event.passion_type}
                      </span>
                      <span className={`text-xs font-body px-2 py-0.5 rounded-full ${
                        event.caught_before_assent
                          ? 'bg-green-50 text-green-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}>
                        {event.caught_before_assent ? 'Pre-assent' : 'Post-assent'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Intensity dots */}
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div
                            key={i}
                            className={`w-2 h-2 rounded-full ${
                              i <= event.intensity ? 'bg-sage-500' : 'bg-sage-200'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="font-body text-xs text-sage-400">
                        {formatDate(event.created_at)}
                      </span>
                    </div>
                  </div>
                  <p className="font-body text-sm text-sage-700 mb-1">{event.false_judgement}</p>

                  {/* Classification comparison */}
                  {event.llm_classified_type && (
                    <div className="mt-2 pt-2 border-t border-sage-100 flex items-center gap-2">
                      <span className="font-body text-xs text-sage-400">Engine:</span>
                      <span
                        className="font-body text-xs font-medium"
                        style={{ color: getFamilyColor(event.llm_classified_type) }}
                      >
                        {PASSION_LABELS[event.llm_classified_type] || event.llm_classified_type}
                      </span>
                      <span className={`text-xs font-body px-1.5 py-0.5 rounded ${
                        event.classification_match
                          ? 'bg-green-50 text-green-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}>
                        {event.classification_match ? 'Match' : 'Mismatch'}
                      </span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* ─── Trends View ─── */}
      {activeView === 'trends' && (
        <div className="space-y-4">
          <h2 className="font-display text-lg font-medium text-sage-800">
            Intensity Trends by Passion Type
          </h2>
          {trends.length === 0 ? (
            <div className="bg-sage-50 border border-sage-200 rounded-lg p-8 text-center">
              <p className="font-body text-sage-500">
                Not enough data yet. Log passion events to see intensity trends over time.
              </p>
            </div>
          ) : (
            <div className="bg-white border border-sage-200 rounded-lg p-5">
              {/* Group by passion type */}
              {Object.entries(
                trends.reduce((acc, t) => {
                  if (!acc[t.passion_type]) acc[t.passion_type] = []
                  acc[t.passion_type].push(t)
                  return acc
                }, {} as Record<string, IntensityTrend[]>)
              ).map(([type, data]) => (
                <div key={type} className="mb-6 last:mb-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="font-display text-sm font-medium"
                      style={{ color: getFamilyColor(type) }}
                    >
                      {PASSION_LABELS[type] || type}
                    </span>
                    <span className="font-body text-xs text-sage-400">
                      ({data.reduce((sum, d) => sum + d.event_count, 0)} events)
                    </span>
                  </div>
                  {/* Simple bar chart */}
                  <div className="flex items-end gap-1 h-16">
                    {data.map((week) => (
                      <div key={week.week_start} className="flex-1 flex flex-col items-center">
                        <div
                          className="w-full rounded-t"
                          style={{
                            height: `${(week.avg_intensity / 5) * 100}%`,
                            backgroundColor: getFamilyColor(type),
                            opacity: 0.7,
                            minHeight: '4px',
                          }}
                        />
                        <span className="font-body text-[10px] text-sage-400 mt-1">
                          {new Date(week.week_start).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── Catch Rate View ─── */}
      {activeView === 'catch-rate' && (
        <div className="space-y-4">
          <div>
            <h2 className="font-display text-lg font-medium text-sage-800">
              Pre-Assent Catch Rate
            </h2>
            <p className="font-body text-xs text-sage-500 mt-1">
              Operational signal: the real proof Gap 2 is working.
              Baseline ~20% — target trajectory: at or above 35% by week 12.
            </p>
          </div>
          {catchRateData.length === 0 ? (
            <div className="bg-sage-50 border border-sage-200 rounded-lg p-8 text-center">
              <p className="font-body text-sage-500">
                Not enough data yet. Log passion events to see catch rate trends.
              </p>
            </div>
          ) : (
            <div className="bg-white border border-sage-200 rounded-lg p-5">
              {/* Weekly bars */}
              <div className="space-y-3">
                {catchRateData.map((week) => (
                  <div key={week.week_start}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-body text-xs text-sage-500">
                        Week of {new Date(week.week_start).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                      </span>
                      <span className="font-body text-xs text-sage-500">
                        {week.pre_assent_events}/{week.total_events} events
                      </span>
                    </div>
                    <div className="relative h-6 bg-sage-100 rounded-full overflow-hidden">
                      {/* Target line at 35% */}
                      <div
                        className="absolute top-0 bottom-0 w-px bg-sage-400 z-10"
                        style={{ left: '35%' }}
                      />
                      {/* Baseline at 20% */}
                      <div
                        className="absolute top-0 bottom-0 w-px bg-sage-300 z-10 border-dashed"
                        style={{ left: '20%' }}
                      />
                      {/* Actual bar */}
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          week.pre_assent_catch_rate_pct >= 35
                            ? 'bg-green-500'
                            : week.pre_assent_catch_rate_pct >= 20
                            ? 'bg-amber-500'
                            : 'bg-red-400'
                        }`}
                        style={{ width: `${Math.min(week.pre_assent_catch_rate_pct, 100)}%` }}
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 font-display text-xs font-medium text-sage-700">
                        {week.pre_assent_catch_rate_pct}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              {/* Legend */}
              <div className="flex items-center gap-4 mt-4 pt-3 border-t border-sage-100">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-px bg-sage-300" />
                  <span className="font-body text-[10px] text-sage-400">Baseline (20%)</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-px bg-sage-400" />
                  <span className="font-body text-[10px] text-sage-400">Target (35%)</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
