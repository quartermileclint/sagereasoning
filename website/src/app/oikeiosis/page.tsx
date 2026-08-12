'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { authFetch } from '@/lib/auth-fetch'
import type { User } from '@supabase/supabase-js'
import CadenceBanner from '@/components/CadenceBanner'
import SuggestedPracticeCard from '@/components/SuggestedPracticeCard'
import type { SuggestedPractice } from '@/lib/practice-sequence'

/**
 * Expanding Your Circle of Concern — the oikeiosis surface.
 *
 * Two modes on one page:
 *
 *  - Circle-extension PRACTICE (Remaining Principles #6, with the cosmopolitan
 *    obligation check #15 folded in). The active exercise the mentor named as the
 *    missing generative half: name a current decision, mark the circle you are
 *    reasoning from, extend your reasoning to a wider circle, and notice what
 *    changes in the action assessment. When the extension reaches the fourth
 *    circle (all rational beings), the cosmopolitan obligation check asks which
 *    obligations of world-citizenship — justice, mutual aid, honest dealing — that
 *    circle generates and whether the current action engages any. This is a
 *    PRACTICE that builds the disposition the diagnostic measures — it produces no
 *    verdict. (POSTs to /api/mentor/oikeiosis/extension.)
 *
 *  - Quarterly REFLECTION (Gap 5, the pre-existing diagnostic — unchanged). A
 *    quarterly reflection on which circle your actions have extended concern to,
 *    with the philodoxia flag when reputational return was a factor. (POSTs to
 *    /api/mentor/oikeiosis.)
 *
 * Human-only. Neither mode touches /api/reason, the signed assessment, or the
 * substrate engine.
 */

interface OikeiosisReflection {
  id: string
  quarter: number
  year: number
  stage: string
  action_description: string
  reputational_return: string | null
  philodoxia_flagged: boolean
  linked_passion_event_id: string | null
  created_at: string
}

interface StageProgression {
  year: number
  quarter: number
  stage: string
  action_count: number
  flagged_count: number
  genuine_count: number
}

interface CircleExtensionEntry {
  id: string
  situation: string
  current_circle: string
  extended_circle: string
  extended_reasoning: string
  assessment_shift: string
  cosmopolitan_obligations: string[] | null
  cosmopolitan_note: string | null
  created_at: string
}

// The `id` values round-trip to the API (stage / current_circle / extended_circle) —
// `self_preservation` is the canonical underlying vocabulary per the mentor's C15
// ruling (2026-08-12); `self` remains only as the human-readable display label.
const STAGES = [
  { id: 'self_preservation', label: 'Self', description: 'Concern for own character and virtue' },
  { id: 'household', label: 'Household', description: 'Family, close friends, those in daily life' },
  { id: 'community', label: 'Community', description: 'Neighbours, colleagues, local community' },
  { id: 'humanity', label: 'Humanity', description: 'Fellow citizens, strangers, those far away' },
  { id: 'cosmic', label: 'Cosmic', description: 'All rational beings, the whole of nature' },
] as const

const STAGE_COLORS: Record<string, string> = {
  self_preservation: '#b85c38',
  household: '#9b7d4a',
  community: '#7d9468',
  humanity: '#5b7fa5',
  cosmic: '#7b6fa5',
}

// Circle rank, self → outward (mirrors the route's CIRCLE_RANK).
const CIRCLE_RANK: Record<string, number> = {
  self_preservation: 1, household: 2, community: 3, humanity: 4, cosmic: 5,
}
// #15 — the cosmopolitan obligation check applies once the extension reaches the
// fourth circle (all rational beings) or wider.
const COSMOPOLITAN_MIN_RANK = CIRCLE_RANK.humanity

// The Stoic obligations of world-citizenship (#15). Practitioner-selected.
const COSMOPOLITAN_OBLIGATIONS = [
  { value: 'justice', label: 'Justice', desc: 'To give what is due — to deal fairly with them' },
  { value: 'mutual_aid', label: 'Mutual aid', desc: 'To help in their need, as you would a neighbour' },
  { value: 'honest_dealing', label: 'Honest dealing', desc: 'To be truthful — no deception, no exploitation' },
] as const

function circleLabel(id: string): string {
  return STAGES.find((s) => s.id === id)?.label || id
}

function getCurrentQuarter(): number {
  return Math.ceil((new Date().getMonth() + 1) / 3)
}

function getCurrentYear(): number {
  return new Date().getFullYear()
}

export default function OikeiosisPage() {
  const [_user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Which mode is on screen. The circle-extension practice is the primary,
  // generative exercise; the quarterly reflection (the diagnostic) is one tab away.
  const [mode, setMode] = useState<'practice' | 'diagnostic'>('practice')

  // ─── Quarterly reflection (diagnostic) — pre-existing, unchanged ───────────
  const [reflections, setReflections] = useState<OikeiosisReflection[]>([])
  const [progression, setProgression] = useState<StageProgression[]>([])
  const [showProgression, setShowProgression] = useState(false)

  // Quarterly form state
  const [showForm, setShowForm] = useState(false)
  const [stage, setStage] = useState('')
  const [actionDescription, setActionDescription] = useState('')
  const [reputationalReturn, setReputationalReturn] = useState<string>('')
  const [quarter, setQuarter] = useState(getCurrentQuarter())
  const [year, setYear] = useState(getCurrentYear())
  const [submitting, setSubmitting] = useState(false)
  const [submitResult, setSubmitResult] = useState<{
    type: 'success' | 'error' | 'warning'
    text: string
  } | null>(null)
  // Phase 2 (the in-session trigger, quarterly reflection only — the
  // circle-extension practice is gate-free and carries no vetted row): at most
  // one suggestion per save; absent field ⇒ nothing renders (honest silence).
  const [suggestion, setSuggestion] = useState<SuggestedPractice | null>(null)

  // ─── Circle-extension practice (#6 + #15) — new ────────────────────────────
  const [extensions, setExtensions] = useState<CircleExtensionEntry[]>([])
  const [showExtForm, setShowExtForm] = useState(false)
  const [editingExtId, setEditingExtId] = useState<string | null>(null)
  const [situation, setSituation] = useState('')
  const [currentCircle, setCurrentCircle] = useState('')
  const [extendedCircle, setExtendedCircle] = useState('')
  const [extendedReasoning, setExtendedReasoning] = useState('')
  const [assessmentShift, setAssessmentShift] = useState('')
  const [cosmoObligations, setCosmoObligations] = useState<string[]>([])
  const [cosmoNote, setCosmoNote] = useState('')
  const [extSubmitting, setExtSubmitting] = useState(false)
  const [extSubmitResult, setExtSubmitResult] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)

  const isEditingExt = editingExtId !== null

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        window.location.href = '/auth'
        return
      }
      setUser(user)
      await Promise.all([fetchReflections(), fetchExtensions()])
      setLoading(false)
    }
    load()
  }, [])

  const fetchReflections = useCallback(async () => {
    const res = await authFetch('/api/mentor/oikeiosis?view=feed')
    if (res.ok) {
      const data = await res.json()
      setReflections(data.reflections)
    }
  }, [])

  const fetchProgression = useCallback(async () => {
    const res = await authFetch('/api/mentor/oikeiosis?view=progression')
    if (res.ok) {
      const data = await res.json()
      setProgression(data.data)
    }
  }, [])

  const fetchExtensions = useCallback(async () => {
    const res = await authFetch('/api/mentor/oikeiosis/extension?view=feed&limit=50')
    if (res.ok) {
      const data = await res.json()
      setExtensions(data.entries)
    }
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!stage || !actionDescription.trim() || submitting) return
    setSubmitting(true)
    setSubmitResult(null)
    setSuggestion(null)

    try {
      const res = await authFetch('/api/mentor/oikeiosis', {
        method: 'POST',
        body: JSON.stringify({
          quarter,
          year,
          stage,
          action_description: actionDescription.trim(),
          reputational_return: reputationalReturn || undefined,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setSuggestion(data.suggested_practice ?? null)
        if (data.philodoxia_warning) {
          setSubmitResult({ type: 'warning', text: data.philodoxia_warning })
        } else {
          setSubmitResult({ type: 'success', text: 'Reflection recorded.' })
        }
        setStage('')
        setActionDescription('')
        setReputationalReturn('')
        setShowForm(false)
        await fetchReflections()
      } else {
        const err = await res.json()
        setSubmitResult({ type: 'error', text: err.error || 'Failed to save' })
      }
    } catch {
      setSubmitResult({ type: 'error', text: 'Network error — please try again' })
    }
    setSubmitting(false)
  }

  // Check if it's the first Sunday of the quarter (prompt day)
  function isQuarterlyPromptDay(): boolean {
    const now = new Date()
    const month = now.getMonth()
    const quarterStartMonth = Math.floor(month / 3) * 3
    // First Sunday of the quarter's first month
    if (month !== quarterStartMonth) return false
    if (now.getDay() !== 0) return false
    if (now.getDate() > 7) return false
    return true
  }

  const isPromptDay = isQuarterlyPromptDay()

  // ─── Circle-extension practice handlers ────────────────────────────────────

  // Circles wider than the currently-selected one (the only valid extension targets).
  const widerCircles = STAGES.filter(
    (s) => currentCircle && CIRCLE_RANK[s.id] > CIRCLE_RANK[currentCircle]
  )
  const cosmopolitanApplies =
    !!extendedCircle && CIRCLE_RANK[extendedCircle] >= COSMOPOLITAN_MIN_RANK

  const extFormValid =
    situation.trim() &&
    currentCircle &&
    extendedCircle &&
    CIRCLE_RANK[extendedCircle] > CIRCLE_RANK[currentCircle] &&
    extendedReasoning.trim() &&
    assessmentShift.trim()

  function resetExtForm() {
    setEditingExtId(null)
    setSituation('')
    setCurrentCircle('')
    setExtendedCircle('')
    setExtendedReasoning('')
    setAssessmentShift('')
    setCosmoObligations([])
    setCosmoNote('')
  }

  function openNewExtForm() {
    resetExtForm()
    setExtSubmitResult(null)
    setShowExtForm(true)
  }

  function selectCurrentCircle(id: string) {
    setCurrentCircle(id)
    // If the chosen extension is no longer wider than the new current circle, clear it.
    if (extendedCircle && CIRCLE_RANK[extendedCircle] <= CIRCLE_RANK[id]) {
      setExtendedCircle('')
      setCosmoObligations([])
      setCosmoNote('')
    }
  }

  function selectExtendedCircle(id: string) {
    setExtendedCircle(id)
    // The cosmopolitan check only applies from the fourth circle outward.
    if (CIRCLE_RANK[id] < COSMOPOLITAN_MIN_RANK) {
      setCosmoObligations([])
      setCosmoNote('')
    }
  }

  function toggleObligation(value: string) {
    setCosmoObligations((prev) =>
      prev.includes(value) ? prev.filter((o) => o !== value) : [...prev, value]
    )
  }

  function startExtEdit(entry: CircleExtensionEntry) {
    setSituation(entry.situation || '')
    setCurrentCircle(entry.current_circle || '')
    setExtendedCircle(entry.extended_circle || '')
    setExtendedReasoning(entry.extended_reasoning || '')
    setAssessmentShift(entry.assessment_shift || '')
    setCosmoObligations(entry.cosmopolitan_obligations || [])
    setCosmoNote(entry.cosmopolitan_note || '')
    setEditingExtId(entry.id)
    setExtSubmitResult(null)
    setShowExtForm(true)
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleExtSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!extFormValid || extSubmitting) return
    setExtSubmitting(true)
    setExtSubmitResult(null)

    try {
      const content = {
        situation: situation.trim(),
        current_circle: currentCircle,
        extended_circle: extendedCircle,
        extended_reasoning: extendedReasoning.trim(),
        assessment_shift: assessmentShift.trim(),
        cosmopolitan_obligations: cosmopolitanApplies && cosmoObligations.length > 0 ? cosmoObligations : undefined,
        cosmopolitan_note: cosmopolitanApplies && cosmoNote.trim() ? cosmoNote.trim() : undefined,
      }

      const res = editingExtId
        ? await authFetch('/api/mentor/oikeiosis/extension', {
            method: 'PATCH',
            body: JSON.stringify({ id: editingExtId, ...content }),
          })
        : await authFetch('/api/mentor/oikeiosis/extension', {
            method: 'POST',
            body: JSON.stringify(content),
          })

      if (res.ok) {
        setExtSubmitResult({ type: 'success', text: 'Circle-extension practice recorded.' })
        resetExtForm()
        setShowExtForm(false)
        await fetchExtensions()
      } else {
        const err = await res.json()
        setExtSubmitResult({ type: 'error', text: err.error || 'Failed to save' })
      }
    } catch {
      setExtSubmitResult({ type: 'error', text: 'Network error — please try again' })
    }
    setExtSubmitting(false)
  }

  function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div role="status" className="text-center text-sage-600 font-body">Loading…</div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-sage-900 mb-1">
          Expanding Your Circle of Concern
        </h1>
        <p className="font-body text-sage-600">
          The practice of drawing the wider circles inward — treating those far off as closely as
          those near — and the quarterly reflection that measures where your concern has reached.
        </p>
        {/* Justice (the scales) — the virtue the circles serve. Literal <img> +
            literal path only: this page is boundary-guarded and must not import
            brand-display (one-hop stoic-brain rule). */}
        <img
          src="/images/scaleslogo.PNG"
          alt="Justice (dikaiosyne) — the scales"
          className="w-full max-w-[240px] h-auto mt-4 drop-shadow-md"
        />
      </div>

      {/* Mode toggle */}
      <div className="flex gap-1 mb-6 bg-sage-50 border border-sage-200 rounded-lg p-1 w-fit">
        <button
          onClick={() => setMode('practice')}
          className={`px-4 py-2 rounded font-display text-sm transition-colors ${
            mode === 'practice'
              ? 'bg-white text-sage-800 shadow-sm'
              : 'text-sage-600 hover:text-sage-700'
          }`}
        >
          Circle-extension practice
        </button>
        <button
          onClick={() => setMode('diagnostic')}
          className={`px-4 py-2 rounded font-display text-sm transition-colors ${
            mode === 'diagnostic'
              ? 'bg-white text-sage-800 shadow-sm'
              : 'text-sage-600 hover:text-sage-700'
          }`}
        >
          Quarterly reflection
        </button>
      </div>

      {/* ═══ Circle-extension practice (#6 + #15) ═══════════════════════════ */}
      {mode === 'practice' && (
        <div>
          <div className="bg-white border border-sage-200 rounded-lg p-5 mb-6">
            <p className="font-body text-sm text-sage-700">
              Take a decision or situation you are facing now. Notice which circle you are reasoning
              from — then deliberately reason from a wider one. The exercise does not change the
              facts of the relationship; it changes the felt weight of obligation, so that the
              recognition of a shared humanity carries the same force as the bond of kinship. It
              does not produce a verdict. It is a practice.
            </p>
          </div>

          {/* Submit result message */}
          {extSubmitResult && (
            <div className={`mb-6 p-4 rounded-lg text-sm font-body ${
              extSubmitResult.type === 'success'
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {extSubmitResult.text}
            </div>
          )}

          {/* Entry form */}
          {showExtForm ? (
            <form onSubmit={handleExtSubmit} className="bg-white border border-sage-200 rounded-lg p-6 mb-6">
              <h2 className="font-display text-lg font-medium text-sage-800 mb-4">
                {isEditingExt ? 'Revise the practice' : 'Extend the circle'}
              </h2>

              {/* Situation */}
              <div className="mb-5">
                <label className="font-display text-sm font-medium text-sage-600 block mb-1">
                  The decision or situation
                  <span className="font-body text-xs text-sage-600 ml-2">Required</span>
                </label>
                <textarea
                  value={situation}
                  onChange={(e) => setSituation(e.target.value)}
                  placeholder="A decision or situation you are facing now — something with a choice of action in it."
                  rows={3}
                  className="w-full border border-sage-200 rounded-lg p-3 font-body text-sm text-sage-800 placeholder:text-sage-300 focus:outline-none focus:ring-2 focus:ring-sage-300 resize-y"
                  required
                />
              </div>

              {/* Current circle */}
              <div className="mb-5">
                <label className="font-display text-sm font-medium text-sage-600 block mb-2">
                  Which circle are you reasoning from now?
                  <span className="font-body text-xs text-sage-600 ml-2">Whose concerns are driving your reasoning</span>
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {STAGES.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => selectCurrentCircle(s.id)}
                      className={`py-3 px-2 rounded-lg border-2 text-center transition-colors ${
                        currentCircle === s.id
                          ? 'border-current shadow-sm'
                          : 'border-sage-200 hover:border-sage-300'
                      }`}
                      style={currentCircle === s.id ? { borderColor: STAGE_COLORS[s.id], color: STAGE_COLORS[s.id] } : undefined}
                    >
                      <div className="font-display text-xs font-medium">{s.label}</div>
                      <div className="font-body text-[9px] text-sage-600 mt-0.5 leading-tight">{s.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Extended circle */}
              <div className="mb-5">
                <label className="font-display text-sm font-medium text-sage-600 block mb-2">
                  Now extend outward — reason from a wider circle
                  <span className="font-body text-xs text-sage-600 ml-2">Draw a wider circle inward</span>
                </label>
                {!currentCircle ? (
                  <p className="font-body text-sm text-sage-500 italic">Choose the circle you are reasoning from first.</p>
                ) : widerCircles.length === 0 ? (
                  <p className="font-body text-sm text-sage-500 italic">
                    The cosmic circle is already the widest — choose an inner circle above to extend outward from.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {widerCircles.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => selectExtendedCircle(s.id)}
                        className={`py-2 px-3 rounded-lg border-2 text-center transition-colors ${
                          extendedCircle === s.id
                            ? 'border-current shadow-sm'
                            : 'border-sage-200 hover:border-sage-300'
                        }`}
                        style={extendedCircle === s.id ? { borderColor: STAGE_COLORS[s.id], color: STAGE_COLORS[s.id] } : undefined}
                      >
                        <div className="font-display text-xs font-medium">{s.label}</div>
                        <div className="font-body text-[9px] text-sage-600 mt-0.5 leading-tight">{s.description}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Extended reasoning */}
              <div className="mb-5">
                <label className="font-display text-sm font-medium text-sage-600 block mb-1">
                  Reason from {extendedCircle ? `the ${circleLabel(extendedCircle).toLowerCase()} circle` : 'the wider circle'}
                  <span className="font-body text-xs text-sage-600 ml-2">Required</span>
                </label>
                <textarea
                  value={extendedReasoning}
                  onChange={(e) => setExtendedReasoning(e.target.value)}
                  placeholder="Reason about this situation from the wider circle. What do the people there need? How does the situation look from their standpoint, given the same weight as those closest to you?"
                  rows={4}
                  className="w-full border border-sage-200 rounded-lg p-3 font-body text-sm text-sage-800 placeholder:text-sage-300 focus:outline-none focus:ring-2 focus:ring-sage-300 resize-y"
                  required
                />
              </div>

              {/* Assessment shift */}
              <div className="mb-5">
                <label className="font-display text-sm font-medium text-sage-600 block mb-1">
                  What changes in your sense of the right action?
                  <span className="font-body text-xs text-sage-600 ml-2">Required</span>
                </label>
                <textarea
                  value={assessmentShift}
                  onChange={(e) => setAssessmentShift(e.target.value)}
                  placeholder="When the circle expands, does the fitting action look different? What shifts — and what holds?"
                  rows={3}
                  className="w-full border border-sage-200 rounded-lg p-3 font-body text-sm text-sage-800 placeholder:text-sage-300 focus:outline-none focus:ring-2 focus:ring-sage-300 resize-y"
                  required
                />
              </div>

              {/* Cosmopolitan obligation check (#15) — only from the fourth circle outward */}
              {cosmopolitanApplies && (
                <div className="mb-6 mt-6 border-t border-sage-100 pt-5">
                  <div className="font-display text-sm font-medium text-sage-700 mb-1">
                    The obligations of world-citizenship
                  </div>
                  <p className="font-body text-xs text-sage-500 mb-3">
                    You have extended to the circle of all rational beings. The Stoic claim is
                    stronger than &ldquo;care about distant others&rdquo;: they are fellow citizens of the world
                    city, and citizenship generates real obligations — justice, mutual aid, honest
                    dealing — that apply to them as fully as to a neighbour. Which does this circle
                    generate, and are any engaged by the action you are weighing?
                  </p>
                  <div className="flex flex-col gap-2 mb-4">
                    {COSMOPOLITAN_OBLIGATIONS.map((o) => {
                      const checked = cosmoObligations.includes(o.value)
                      return (
                        <button
                          key={o.value}
                          type="button"
                          onClick={() => toggleObligation(o.value)}
                          className={`flex items-start gap-3 py-2 px-3 rounded-lg border-2 text-left transition-colors ${
                            checked
                              ? 'border-sage-400 bg-sage-50'
                              : 'border-sage-200 hover:border-sage-300'
                          }`}
                        >
                          <span
                            className={`mt-0.5 flex-shrink-0 w-4 h-4 rounded border flex items-center justify-center ${
                              checked ? 'bg-sage-500 border-sage-500 text-white' : 'border-sage-300'
                            }`}
                            aria-hidden="true"
                          >
                            {checked ? '✓' : ''}
                          </span>
                          <span>
                            <span className="font-display text-sm font-medium text-sage-800 block">{o.label}</span>
                            <span className="font-body text-xs text-sage-600">{o.desc}</span>
                          </span>
                        </button>
                      )
                    })}
                  </div>
                  <label className="font-display text-sm font-medium text-sage-600 block mb-1">
                    What do you owe them here?
                    <span className="font-body text-xs text-sage-600 ml-2">Optional</span>
                  </label>
                  <textarea
                    value={cosmoNote}
                    onChange={(e) => setCosmoNote(e.target.value)}
                    placeholder="Name what the current action owes to those in this circle — and whether it honours or fails that obligation."
                    rows={3}
                    className="w-full border border-sage-200 rounded-lg p-3 font-body text-sm text-sage-800 placeholder:text-sage-300 focus:outline-none focus:ring-2 focus:ring-sage-300 resize-y"
                  />
                </div>
              )}

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    resetExtForm()
                    setShowExtForm(false)
                  }}
                  className="font-body text-sm text-sage-600 hover:text-sage-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!extFormValid || extSubmitting}
                  className="px-6 py-2 bg-sage-500 text-white font-display text-sm rounded hover:bg-sage-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {extSubmitting ? 'Saving...' : isEditingExt ? 'Save changes' : 'Save the practice'}
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={openNewExtForm}
              className="w-full border-2 border-dashed border-sage-200 rounded-lg p-4 text-center font-body text-sm text-sage-600 hover:border-sage-400 hover:text-sage-600 transition-colors mb-6"
            >
              + Extend the circle
            </button>
          )}

          {/* Practice feed */}
          <div className="space-y-4 mt-6">
            <h2 className="font-display text-lg font-medium text-sage-800">
              Past Practice
              {extensions.length > 0 && (
                <span className="font-body text-sm text-sage-600 ml-2">({extensions.length})</span>
              )}
            </h2>

            {extensions.length === 0 ? (
              <div className="bg-sage-50 border border-sage-200 rounded-lg p-8 text-center">
                <p className="font-body text-sage-600">
                  No practice yet. When you face a decision, extend the circle you are reasoning from
                  and notice what changes.
                </p>
              </div>
            ) : (
              extensions.map((entry) => (
                <div key={entry.id} className="bg-white border border-sage-200 rounded-lg overflow-hidden">
                  <div className="px-5 py-3 border-b border-sage-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-display text-xs font-medium" style={{ color: STAGE_COLORS[entry.current_circle] }}>
                        {circleLabel(entry.current_circle)}
                      </span>
                      <span className="font-body text-xs text-sage-400" aria-hidden="true">→</span>
                      <span className="font-display text-xs font-medium" style={{ color: STAGE_COLORS[entry.extended_circle] }}>
                        {circleLabel(entry.extended_circle)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-body text-xs text-sage-600">{formatDate(entry.created_at)}</span>
                      <button
                        onClick={() => startExtEdit(entry)}
                        className="text-xs font-body px-2 py-0.5 rounded-full border border-sage-300 text-sage-600 hover:bg-sage-50 transition-colors"
                      >
                        Revise
                      </button>
                    </div>
                  </div>

                  <div className="divide-y divide-sage-50">
                    <div className="px-5 py-3">
                      <div className="font-display text-xs font-medium text-sage-600 uppercase tracking-wider mb-1">
                        The Situation
                      </div>
                      <p className="font-body text-sm text-sage-800">{entry.situation}</p>
                    </div>
                    <div className="px-5 py-3 bg-sage-50/40">
                      <div className="font-display text-xs font-medium text-sage-700 uppercase tracking-wider mb-1">
                        What Changed
                      </div>
                      <p className="font-body text-sm text-sage-800">{entry.assessment_shift}</p>
                    </div>
                    {entry.cosmopolitan_obligations && entry.cosmopolitan_obligations.length > 0 && (
                      <div className="px-5 py-3">
                        <div className="font-display text-xs font-medium text-sage-600 uppercase tracking-wider mb-1">
                          Obligations of Citizenship
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {entry.cosmopolitan_obligations.map((o) => (
                            <span key={o} className="text-xs font-body px-2 py-0.5 rounded-full bg-sage-100 text-sage-700">
                              {COSMOPOLITAN_OBLIGATIONS.find((c) => c.value === o)?.label || o}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ═══ Quarterly reflection (the pre-existing diagnostic) ═════════════ */}
      {mode === 'diagnostic' && (
        <div>
          <div className="flex items-start justify-between mb-6">
            <p className="font-body text-sm text-sage-600">
              A quarterly reflection on which circle your actions have extended concern to — with an
              honest note on whether reputation was a factor.
            </p>
            <button
              onClick={async () => {
                setShowProgression(!showProgression)
                if (!showProgression && progression.length === 0) await fetchProgression()
              }}
              className="font-body text-sm text-sage-600 hover:text-sage-700 transition-colors whitespace-nowrap ml-4"
            >
              {showProgression ? 'Hide progression' : 'Stage progression'}
            </button>
          </div>

          {/* Stage circles visualisation */}
          <div className="bg-white border border-sage-200 rounded-lg p-5 mb-6">
            <div className="flex items-center justify-center gap-0">
              {STAGES.map((s, i) => (
                <div key={s.id} className="flex items-center">
                  <div
                    className="flex flex-col items-center"
                    style={{ minWidth: i === 0 ? '60px' : `${60 + i * 20}px` }}
                  >
                    <div
                      className="rounded-full flex items-center justify-center font-display text-xs text-white"
                      style={{
                        width: `${28 + i * 10}px`,
                        height: `${28 + i * 10}px`,
                        backgroundColor: STAGE_COLORS[s.id],
                        opacity: 0.8,
                      }}
                    >
                      {reflections.filter(r => r.stage === s.id).length || ''}
                    </div>
                    <span className="font-body text-[10px] text-sage-600 mt-1">{s.label}</span>
                  </div>
                  {i < STAGES.length - 1 && (
                    <div className="w-4 h-px bg-sage-200 mx-1" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Quarterly prompt banner.
              Practice reminders Phase 4 (plan §9): folded onto the shared
              CadenceBanner so every cadence prompt in the product looks the same.
              RESTYLE ONLY — `isQuarterlyPromptDay()` and the handler below are
              untouched, so when this appears and what it does are unchanged. */}
          {isPromptDay && !showForm && (
            <CadenceBanner
              title={`Quarterly reflection — Q${getCurrentQuarter()} ${getCurrentYear()}`}
              line="What actions have you taken this quarter that extended concern beyond the household circle?"
              className="mb-6"
            >
              <button
                onClick={() => { setSuggestion(null); setShowForm(true) }}
                className="px-4 py-2 bg-sage-500 text-white font-display text-sm rounded hover:bg-sage-600 transition-colors"
              >
                Reflect
              </button>
            </CadenceBanner>
          )}

          {/* Stage progression view */}
          {showProgression && (
            <div className="bg-white border border-sage-200 rounded-lg p-5 mb-6">
              <h3 className="font-display text-sm font-medium text-sage-700 mb-3">Stage Progression</h3>
              {progression.length === 0 ? (
                <p className="font-body text-sm text-sage-600">No data yet — complete quarterly reflections to see progression.</p>
              ) : (
                <div className="space-y-3">
                  {/* Group by year/quarter */}
                  {Object.entries(
                    progression.reduce((acc, p) => {
                      const key = `Q${p.quarter} ${p.year}`
                      if (!acc[key]) acc[key] = []
                      acc[key].push(p)
                      return acc
                    }, {} as Record<string, StageProgression[]>)
                  ).map(([period, data]) => (
                    <div key={period}>
                      <div className="font-display text-xs font-medium text-sage-600 mb-1">{period}</div>
                      <div className="flex gap-2">
                        {data.map((d) => (
                          <div
                            key={d.stage}
                            className="flex-1 rounded-lg p-2 text-center"
                            style={{ backgroundColor: STAGE_COLORS[d.stage] + '15' }}
                          >
                            <div className="font-display text-sm font-medium" style={{ color: STAGE_COLORS[d.stage] }}>
                              {d.action_count}
                            </div>
                            <div className="font-body text-[10px] text-sage-600">{d.stage}</div>
                            {d.flagged_count > 0 && (
                              <div className="font-body text-[9px] text-amber-600 mt-0.5">
                                {d.flagged_count} flagged
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Submit result */}
          {submitResult && (
            <div className={`mb-6 p-4 rounded-lg text-sm font-body ${
              submitResult.type === 'success'
                ? 'bg-green-50 text-green-700 border border-green-200'
                : submitResult.type === 'warning'
                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {submitResult.text}
            </div>
          )}

          {/* Phase 2: the in-session suggestion — absent field, nothing renders. */}
          {suggestion && (
            <div className="mb-6">
              <SuggestedPracticeCard suggestion={suggestion} currentPracticeId="oikeiosis" />
            </div>
          )}

          {/* Entry Form */}
          {showForm ? (
            <form onSubmit={handleSubmit} className="bg-white border border-sage-200 rounded-lg p-6 mb-6">
              <h2 className="font-display text-lg font-medium text-sage-800 mb-4">
                Quarterly Reflection — Q{quarter} {year}
              </h2>

              {/* Quarter/Year selector */}
              <div className="flex gap-4 mb-4">
                <div className="w-24">
                  <label className="font-display text-sm font-medium text-sage-600 block mb-1">Quarter</label>
                  <select
                    value={quarter}
                    onChange={(e) => setQuarter(parseInt(e.target.value))}
                    className="w-full border border-sage-200 rounded-lg p-2 font-body text-sm bg-white"
                  >
                    {[1, 2, 3, 4].map((q) => (
                      <option key={q} value={q}>Q{q}</option>
                    ))}
                  </select>
                </div>
                <div className="w-28">
                  <label className="font-display text-sm font-medium text-sage-600 block mb-1">Year</label>
                  <input
                    type="number"
                    value={year}
                    onChange={(e) => setYear(parseInt(e.target.value))}
                    min={2024}
                    max={2100}
                    className="w-full border border-sage-200 rounded-lg p-2 font-body text-sm"
                  />
                </div>
              </div>

              {/* Stage selector */}
              <div className="mb-4">
                <label className="font-display text-sm font-medium text-sage-600 block mb-2">
                  Oikeiosis stage
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {STAGES.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setStage(s.id)}
                      className={`py-3 px-2 rounded-lg border-2 text-center transition-colors ${
                        stage === s.id
                          ? 'border-current shadow-sm'
                          : 'border-sage-200 hover:border-sage-300'
                      }`}
                      style={stage === s.id ? { borderColor: STAGE_COLORS[s.id], color: STAGE_COLORS[s.id] } : undefined}
                    >
                      <div className="font-display text-xs font-medium">{s.label}</div>
                      <div className="font-body text-[9px] text-sage-600 mt-0.5 leading-tight">{s.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Action description */}
              <div className="mb-4">
                <label className="font-display text-sm font-medium text-sage-600 block mb-1">
                  Action taken
                  <span className="font-body text-xs text-sage-600 ml-2">
                    Specific actions, not intentions
                  </span>
                </label>
                <textarea
                  value={actionDescription}
                  onChange={(e) => setActionDescription(e.target.value)}
                  placeholder="Describe a specific action you took that extended concern to this circle. Not an intention — something you did."
                  rows={4}
                  className="w-full border border-sage-200 rounded-lg p-3 font-body text-sm text-sage-800 placeholder:text-sage-300 focus:outline-none focus:ring-2 focus:ring-sage-300 resize-y"
                  required
                />
              </div>

              {/* Reputational return */}
              <div className="mb-6">
                <label className="font-display text-sm font-medium text-sage-600 block mb-2">
                  Was there reputational return?
                  <span className="font-body text-xs text-sage-600 ml-2">
                    Honest assessment — this distinguishes genuine extension from philodoxia
                  </span>
                </label>
                <div className="flex gap-3">
                  {[
                    { value: 'no', label: 'No', desc: 'Genuine — no reputational return' },
                    { value: 'partial', label: 'Partial', desc: 'Some recognition but not primary motive' },
                    { value: 'yes', label: 'Yes', desc: 'Reputational return was a factor' },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setReputationalReturn(opt.value)}
                      className={`flex-1 py-2 px-3 rounded-lg border-2 text-center transition-colors ${
                        reputationalReturn === opt.value
                          ? opt.value === 'yes'
                            ? 'border-amber-500 bg-amber-50 text-amber-700'
                            : opt.value === 'no'
                            ? 'border-green-500 bg-green-50 text-green-700'
                            : 'border-sage-400 bg-sage-50 text-sage-700'
                          : 'border-sage-200 text-sage-600 hover:border-sage-300'
                      }`}
                    >
                      <div className="font-display text-sm font-medium">{opt.label}</div>
                      <div className="font-body text-[10px] mt-0.5">{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => { setSuggestion(null); setShowForm(false) }}
                  className="font-body text-sm text-sage-600 hover:text-sage-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!stage || !actionDescription.trim() || submitting}
                  className="px-6 py-2 bg-sage-500 text-white font-display text-sm rounded hover:bg-sage-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Saving...' : 'Record Reflection'}
                </button>
              </div>
            </form>
          ) : !isPromptDay && (
            <button
              onClick={() => { setSuggestion(null); setShowForm(true) }}
              className="w-full border-2 border-dashed border-sage-200 rounded-lg p-4 text-center font-body text-sm text-sage-600 hover:border-sage-400 hover:text-sage-600 transition-colors mb-6"
            >
              + New quarterly reflection
            </button>
          )}

          {/* Reflections feed */}
          <div className="space-y-3 mt-6">
            <h2 className="font-display text-lg font-medium text-sage-800">
              Past Reflections
              {reflections.length > 0 && (
                <span className="font-body text-sm text-sage-600 ml-2">({reflections.length})</span>
              )}
            </h2>

            {reflections.length === 0 ? (
              <div className="bg-sage-50 border border-sage-200 rounded-lg p-8 text-center">
                <p className="font-body text-sage-600">
                  No reflections yet. The quarterly prompt arrives on the first Sunday of each quarter.
                </p>
              </div>
            ) : (
              reflections.map((r) => (
                <div key={r.id} className="bg-white border border-sage-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="font-display text-sm font-medium"
                        style={{ color: STAGE_COLORS[r.stage] }}
                      >
                        {STAGES.find(s => s.id === r.stage)?.label || r.stage}
                      </span>
                      <span className="font-body text-xs text-sage-600">
                        Q{r.quarter} {r.year}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {r.philodoxia_flagged && (
                        <span className="text-xs font-body px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">
                          Philodoxia flagged
                        </span>
                      )}
                      {r.reputational_return === 'no' && (
                        <span className="text-xs font-body px-2 py-0.5 rounded-full bg-green-50 text-green-700">
                          Genuine
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="font-body text-sm text-sage-700">{r.action_description}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
