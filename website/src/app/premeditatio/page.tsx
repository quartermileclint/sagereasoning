'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { authFetch } from '@/lib/auth-fetch'
import type { User } from '@supabase/supabase-js'

/**
 * Premeditatio — "Preparing for Adversity"
 *
 * Two exercise modes on the one surface:
 *
 * 1. Weekly reflection (Gap 3): scheduled Monday reflection targeting avoidance
 *    and catastrophising — anticipated event, false impression, correct judgement.
 *
 * 2. Prepare a disposition (Remaining Principles #7-human): the premeditatio-as-tool
 *    — name a future adversity, apply the control filter (what IS / is NOT up to me),
 *    identify the virtue the scenario calls for, and record a prepared disposition
 *    ("not a plan; a disposition") the later reflection can return to.
 *
 * Entries flagged generic by the quality gate can be revised IN PLACE (an edit
 * updates the same row rather than re-entering everything or creating a duplicate).
 *
 * Both modes POST to /api/mentor/premeditatio (a human-only route; it never touches
 * /api/reason, the signed assessment, or the substrate engine).
 */

const VIRTUE_DOMAINS = [
  { value: 'wisdom', label: 'Wisdom (phronesis)' },
  { value: 'justice', label: 'Justice (dikaiosyne)' },
  { value: 'courage', label: 'Courage (andreia)' },
  { value: 'temperance', label: 'Temperance (sophrosyne)' },
] as const

interface PremeditEntry {
  id: string
  entry_kind: string | null
  anticipated_event: string
  false_impression: string | null
  correct_judgement: string | null
  within_control: string | null
  outside_control: string | null
  virtue_domain: string | null
  virtue_response: string | null
  prepared_disposition: string | null
  is_generic: boolean
  linked_passion_event_id: string | null
  avoidance_behaviour_tag: string | null
  behaviour_changed: boolean
  prompt_sent_at: string | null
  created_at: string
}

interface EngagementData {
  month_start: string
  responses_count: number
  quality_responses: number
  behaviours_changed: number
}

type Mode = 'weekly' | 'prepared'

export default function PremeditatioPage() {
  const [_user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [entries, setEntries] = useState<PremeditEntry[]>([])
  const [engagement, setEngagement] = useState<EngagementData[]>([])
  const [showEngagement, setShowEngagement] = useState(false)

  // Which exercise the form and prompts are set to.
  const [mode, setMode] = useState<Mode>('weekly')

  // Form state
  const [showForm, setShowForm] = useState(false)
  // When set, the form is REVISING an existing entry (PATCH) rather than creating one.
  const [editingId, setEditingId] = useState<string | null>(null)
  const [anticipatedEvent, setAnticipatedEvent] = useState('')
  // Weekly-reflection fields
  const [falseImpression, setFalseImpression] = useState('')
  const [correctJudgement, setCorrectJudgement] = useState('')
  const [avoidanceTag, setAvoidanceTag] = useState('')
  // Prepared-disposition fields
  const [withinControl, setWithinControl] = useState('')
  const [outsideControl, setOutsideControl] = useState('')
  const [virtueDomain, setVirtueDomain] = useState('')
  const [virtueResponse, setVirtueResponse] = useState('')
  const [preparedDisposition, setPreparedDisposition] = useState('')

  const [submitting, setSubmitting] = useState(false)
  const [submitResult, setSubmitResult] = useState<{
    type: 'success' | 'error' | 'warning'
    text: string
  } | null>(null)

  const isEditing = editingId !== null

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        window.location.href = '/auth'
        return
      }
      setUser(user)
      await fetchEntries()
      setLoading(false)
    }
    load()
  }, [])

  const fetchEntries = useCallback(async () => {
    const res = await authFetch('/api/mentor/premeditatio?view=feed&limit=50')
    if (res.ok) {
      const data = await res.json()
      setEntries(data.entries)
    }
  }, [])

  const fetchEngagement = useCallback(async () => {
    const res = await authFetch('/api/mentor/premeditatio?view=engagement')
    if (res.ok) {
      const data = await res.json()
      setEngagement(data.data)
    }
  }, [])

  function resetForm() {
    setEditingId(null)
    setAnticipatedEvent('')
    setFalseImpression('')
    setCorrectJudgement('')
    setAvoidanceTag('')
    setWithinControl('')
    setOutsideControl('')
    setVirtueDomain('')
    setVirtueResponse('')
    setPreparedDisposition('')
  }

  function openNewForm() {
    resetForm()
    setSubmitResult(null)
    setShowForm(true)
  }

  function startEdit(entry: PremeditEntry) {
    setMode(entry.entry_kind === 'prepared_disposition' ? 'prepared' : 'weekly')
    setAnticipatedEvent(entry.anticipated_event || '')
    setFalseImpression(entry.false_impression || '')
    setCorrectJudgement(entry.correct_judgement || '')
    setAvoidanceTag(entry.avoidance_behaviour_tag || '')
    setWithinControl(entry.within_control || '')
    setOutsideControl(entry.outside_control || '')
    setVirtueDomain(entry.virtue_domain || '')
    setVirtueResponse(entry.virtue_response || '')
    setPreparedDisposition(entry.prepared_disposition || '')
    setEditingId(entry.id)
    setSubmitResult(null)
    setShowForm(true)
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const weeklyValid =
    anticipatedEvent.trim() && falseImpression.trim() && correctJudgement.trim()
  const preparedValid =
    anticipatedEvent.trim() &&
    withinControl.trim() &&
    outsideControl.trim() &&
    virtueResponse.trim() &&
    preparedDisposition.trim()
  const formValid = mode === 'weekly' ? weeklyValid : preparedValid

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!formValid || submitting) return
    setSubmitting(true)
    setSubmitResult(null)

    try {
      const content =
        mode === 'weekly'
          ? {
              entry_kind: 'weekly_reflection',
              anticipated_event: anticipatedEvent.trim(),
              false_impression: falseImpression.trim(),
              correct_judgement: correctJudgement.trim(),
              avoidance_behaviour_tag: avoidanceTag.trim() || undefined,
            }
          : {
              entry_kind: 'prepared_disposition',
              anticipated_event: anticipatedEvent.trim(),
              within_control: withinControl.trim(),
              outside_control: outsideControl.trim(),
              virtue_domain: virtueDomain || undefined,
              virtue_response: virtueResponse.trim(),
              prepared_disposition: preparedDisposition.trim(),
            }

      const res = editingId
        ? await authFetch('/api/mentor/premeditatio', {
            method: 'PATCH',
            body: JSON.stringify({ id: editingId, ...content }),
          })
        : await authFetch('/api/mentor/premeditatio', {
            method: 'POST',
            body: JSON.stringify(content),
          })

      if (res.ok) {
        const data = await res.json()
        if (data.quality_gate?.is_generic) {
          // Keep the form open + populated so it can be revised in place. Point
          // editingId at the row (just-created on POST, or the same on PATCH) so
          // the next submit updates it rather than creating a duplicate.
          if (data.entry?.id) setEditingId(data.entry.id)
          setSubmitResult({ type: 'warning', text: data.quality_gate.message })
          await fetchEntries()
        } else {
          setSubmitResult({
            type: 'success',
            text:
              mode === 'weekly'
                ? 'Premeditatio recorded. Quality gate passed.'
                : 'Prepared disposition recorded. Quality gate passed.',
          })
          resetForm()
          setShowForm(false)
          await fetchEntries()
        }
      } else {
        const err = await res.json()
        setSubmitResult({ type: 'error', text: err.error || 'Failed to save' })
      }
    } catch {
      setSubmitResult({ type: 'error', text: 'Network error — please try again' })
    }
    setSubmitting(false)
  }

  async function markBehaviourChanged(entryId: string) {
    try {
      const res = await authFetch('/api/mentor/premeditatio', {
        method: 'PATCH',
        body: JSON.stringify({ id: entryId, behaviour_changed: true }),
      })
      if (res.ok) {
        await fetchEntries()
      }
    } catch {
      // Silent fail — non-critical
    }
  }

  function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
  }

  // Check if it's Monday (the weekly prompt day)
  const isPromptDay = new Date().getDay() === 1

  function switchMode(next: Mode) {
    if (next === mode || isEditing) return
    setMode(next)
    setSubmitResult(null)
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div role="status" className="text-center text-sage-600 font-body">Loading…</div>
      </div>
    )
  }

  const tabBase = 'px-4 py-1.5 rounded-md font-display text-sm transition-colors'
  const tabActive = 'bg-sage-500 text-white'
  const tabInactive = 'text-sage-600 hover:text-sage-700'

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-sage-900 mb-1">
            Preparing for Adversity
          </h1>
          <p className="font-body text-sage-600">
            {mode === 'weekly'
              ? 'Weekly practice: anticipate what’s ahead, identify the false impression, hold the correct judgement in advance.'
              : 'Prepare a disposition: name an adversity, separate what is up to you from what is not, and settle in advance the virtue it calls for.'}
          </p>
          {/* Courage (the lion) — the virtue this practice trains. Literal <img> +
              literal path only: this page is boundary-guarded and must not import
              brand-display (one-hop stoic-brain rule). */}
          <img
            src="/images/lionlogo.PNG"
            alt="Courage (andreia) — the lion"
            className="w-full max-w-[240px] h-auto mt-4 drop-shadow-md"
          />
        </div>
        <button
          onClick={async () => {
            setShowEngagement(!showEngagement)
            if (!showEngagement && engagement.length === 0) await fetchEngagement()
          }}
          className="font-body text-sm text-sage-600 hover:text-sage-700 transition-colors shrink-0 ml-4"
        >
          {showEngagement ? 'Hide stats' : 'Engagement'}
        </button>
      </div>

      {/* Mode toggle (locked while revising an existing entry) */}
      <div className="inline-flex items-center rounded-lg border border-sage-200 bg-white p-0.5 mb-6" role="tablist" aria-label="Exercise mode">
        <button
          role="tab"
          aria-selected={mode === 'weekly'}
          disabled={isEditing}
          onClick={() => switchMode('weekly')}
          className={`${tabBase} ${mode === 'weekly' ? tabActive : tabInactive} ${isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          Weekly reflection
        </button>
        <button
          role="tab"
          aria-selected={mode === 'prepared'}
          disabled={isEditing}
          onClick={() => switchMode('prepared')}
          className={`${tabBase} ${mode === 'prepared' ? tabActive : tabInactive} ${isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          Prepare a disposition
        </button>
      </div>

      {/* Monday prompt banner (weekly mode only) */}
      {mode === 'weekly' && isPromptDay && !showForm && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-display text-sm font-medium text-amber-800">
                Monday — Premeditatio prompt
              </span>
              <p className="font-body text-xs text-amber-600 mt-1">
                What specific situation lies ahead this week? Name it. Prepare for it.
              </p>
            </div>
            <button
              onClick={openNewForm}
              className="px-4 py-2 bg-amber-600 text-white font-display text-sm rounded hover:bg-amber-700 transition-colors"
            >
              Respond
            </button>
          </div>
        </div>
      )}

      {/* Engagement stats */}
      {showEngagement && (
        <div className="bg-white border border-sage-200 rounded-lg p-5 mb-6">
          <h3 className="font-display text-sm font-medium text-sage-700 mb-3">Monthly Engagement</h3>
          {engagement.length === 0 ? (
            <p className="font-body text-sm text-sage-600">No data yet.</p>
          ) : (
            <div className="space-y-2">
              {engagement.map((month) => (
                <div key={month.month_start} className="flex items-center justify-between">
                  <span className="font-body text-sm text-sage-600">
                    {new Date(month.month_start).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
                  </span>
                  <div className="flex items-center gap-4 font-body text-xs text-sage-600">
                    <span>{month.responses_count} responses</span>
                    <span>{month.quality_responses} quality</span>
                    <span className={month.behaviours_changed > 0 ? 'text-green-600 font-medium' : ''}>
                      {month.behaviours_changed} behaviours changed
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Submit result message */}
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

      {/* Entry Form */}
      {showForm ? (
        <form onSubmit={handleSubmit} className="bg-white border border-sage-200 rounded-lg p-6 mb-6">
          {mode === 'weekly' ? (
            <>
              <h2 className="font-display text-lg font-medium text-sage-800 mb-4">
                {isEditing ? 'Revise Your Premeditatio' : 'This Week’s Premeditatio'}
              </h2>

              {/* Anticipated event */}
              <div className="mb-4">
                <label className="font-display text-sm font-medium text-sage-600 block mb-1">
                  Anticipated event
                  <span className="font-body text-xs text-sage-600 ml-2">
                    A specific upcoming situation — not a general aspiration
                  </span>
                </label>
                <textarea
                  value={anticipatedEvent}
                  onChange={(e) => setAnticipatedEvent(e.target.value)}
                  placeholder="Example: Thursday's performance review with my manager about Q1 targets"
                  rows={3}
                  className="w-full border border-sage-200 rounded-lg p-3 font-body text-sm text-sage-800 placeholder:text-sage-300 focus:outline-none focus:ring-2 focus:ring-sage-300 resize-y"
                  required
                />
              </div>

              {/* False impression */}
              <div className="mb-4">
                <label className="font-display text-sm font-medium text-sage-600 block mb-1">
                  False impression
                  <span className="font-body text-xs text-sage-600 ml-2">
                    The false impression most likely to arise
                  </span>
                </label>
                <textarea
                  value={falseImpression}
                  onChange={(e) => setFalseImpression(e.target.value)}
                  placeholder="Example: That criticism of my work means I am not valued or respected"
                  rows={3}
                  className="w-full border border-sage-200 rounded-lg p-3 font-body text-sm text-sage-800 placeholder:text-sage-300 focus:outline-none focus:ring-2 focus:ring-sage-300 resize-y"
                  required
                />
              </div>

              {/* Correct judgement */}
              <div className="mb-4">
                <label className="font-display text-sm font-medium text-sage-600 block mb-1">
                  Correct judgement
                  <span className="font-body text-xs text-sage-600 ml-2">
                    The judgement to hold in advance
                  </span>
                </label>
                <textarea
                  value={correctJudgement}
                  onChange={(e) => setCorrectJudgement(e.target.value)}
                  placeholder="Example: Feedback on performance is a preferred indifferent. My character is not at stake in this meeting."
                  rows={3}
                  className="w-full border border-sage-200 rounded-lg p-3 font-body text-sm text-sage-800 placeholder:text-sage-300 focus:outline-none focus:ring-2 focus:ring-sage-300 resize-y"
                  required
                />
              </div>

              {/* Avoidance tag (optional) */}
              <div className="mb-6">
                <label className="font-display text-sm font-medium text-sage-600 block mb-1">
                  Avoidance behaviour tag
                  <span className="font-body text-xs text-sage-600 ml-2">
                    Optional — tag a behaviour you&apos;ve been avoiding
                  </span>
                </label>
                <input
                  type="text"
                  value={avoidanceTag}
                  onChange={(e) => setAvoidanceTag(e.target.value)}
                  placeholder="e.g., difficult conversations, public speaking, asking for help"
                  className="w-full border border-sage-200 rounded-lg p-3 font-body text-sm text-sage-800 placeholder:text-sage-300 focus:outline-none focus:ring-2 focus:ring-sage-300"
                />
              </div>
            </>
          ) : (
            <>
              <h2 className="font-display text-lg font-medium text-sage-800 mb-1">
                {isEditing ? 'Revise Your Prepared Disposition' : 'Prepare a Disposition'}
              </h2>
              <p className="font-body text-xs text-sage-600 mb-4">
                The result is not a plan. It is a prepared disposition — the stance you have
                already settled before the situation arrives.
              </p>

              {/* The adversity */}
              <div className="mb-4">
                <label className="font-display text-sm font-medium text-sage-600 block mb-1">
                  The adversity ahead
                  <span className="font-body text-xs text-sage-600 ml-2">
                    A specific future situation you want to prepare for
                  </span>
                </label>
                <textarea
                  value={anticipatedEvent}
                  onChange={(e) => setAnticipatedEvent(e.target.value)}
                  placeholder="Example: Presenting the project results next month when the outcome is uncertain"
                  rows={3}
                  className="w-full border border-sage-200 rounded-lg p-3 font-body text-sm text-sage-800 placeholder:text-sage-300 focus:outline-none focus:ring-2 focus:ring-sage-300 resize-y"
                  required
                />
              </div>

              {/* Control filter */}
              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="font-display text-sm font-medium text-sage-600 block mb-1">
                    What is up to me
                    <span className="font-body text-xs text-sage-600 ml-2">Within my control</span>
                  </label>
                  <textarea
                    value={withinControl}
                    onChange={(e) => setWithinControl(e.target.value)}
                    placeholder="My preparation, my honesty, my composure, the effort I bring"
                    rows={4}
                    className="w-full border border-sage-200 rounded-lg p-3 font-body text-sm text-sage-800 placeholder:text-sage-300 focus:outline-none focus:ring-2 focus:ring-sage-300 resize-y"
                    required
                  />
                </div>
                <div>
                  <label className="font-display text-sm font-medium text-sage-600 block mb-1">
                    What is not up to me
                    <span className="font-body text-xs text-sage-600 ml-2">Outside my control</span>
                  </label>
                  <textarea
                    value={outsideControl}
                    onChange={(e) => setOutsideControl(e.target.value)}
                    placeholder="How others react, the final decision, the outcome itself"
                    rows={4}
                    className="w-full border border-sage-200 rounded-lg p-3 font-body text-sm text-sage-800 placeholder:text-sage-300 focus:outline-none focus:ring-2 focus:ring-sage-300 resize-y"
                    required
                  />
                </div>
              </div>

              {/* Virtue */}
              <div className="mb-4">
                <label className="font-display text-sm font-medium text-sage-600 block mb-1">
                  The virtue this calls for
                  <span className="font-body text-xs text-sage-600 ml-2">Optional — the cardinal virtue at stake</span>
                </label>
                <select
                  value={virtueDomain}
                  onChange={(e) => setVirtueDomain(e.target.value)}
                  className="w-full border border-sage-200 rounded-lg p-3 font-body text-sm text-sage-800 focus:outline-none focus:ring-2 focus:ring-sage-300 bg-white"
                >
                  <option value="">— select (optional) —</option>
                  {VIRTUE_DOMAINS.map((v) => (
                    <option key={v.value} value={v.value}>{v.label}</option>
                  ))}
                </select>
              </div>

              {/* Virtue response */}
              <div className="mb-4">
                <label className="font-display text-sm font-medium text-sage-600 block mb-1">
                  How you will embody it
                  <span className="font-body text-xs text-sage-600 ml-2">The virtue response the scenario asks of you</span>
                </label>
                <textarea
                  value={virtueResponse}
                  onChange={(e) => setVirtueResponse(e.target.value)}
                  placeholder="Example: Meet the questions with honest, measured answers — courage is speaking plainly whatever the reception."
                  rows={3}
                  className="w-full border border-sage-200 rounded-lg p-3 font-body text-sm text-sage-800 placeholder:text-sage-300 focus:outline-none focus:ring-2 focus:ring-sage-300 resize-y"
                  required
                />
              </div>

              {/* Prepared disposition */}
              <div className="mb-6">
                <label className="font-display text-sm font-medium text-sage-600 block mb-1">
                  Your prepared disposition
                  <span className="font-body text-xs text-sage-600 ml-2">
                    Not a plan — the stance you have already settled
                  </span>
                </label>
                <textarea
                  value={preparedDisposition}
                  onChange={(e) => setPreparedDisposition(e.target.value)}
                  placeholder="Example: I will bring my full effort and let the result be what it is. My worth is not on the table — only whether I act well."
                  rows={3}
                  className="w-full border border-sage-200 rounded-lg p-3 font-body text-sm text-sage-800 placeholder:text-sage-300 focus:outline-none focus:ring-2 focus:ring-sage-300 resize-y"
                  required
                />
              </div>
            </>
          )}

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                resetForm()
                setShowForm(false)
              }}
              className="font-body text-sm text-sage-600 hover:text-sage-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!formValid || submitting}
              className="px-6 py-2 bg-sage-500 text-white font-display text-sm rounded hover:bg-sage-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting
                ? 'Saving...'
                : isEditing
                ? 'Save changes'
                : mode === 'weekly'
                ? 'Submit Premeditatio'
                : 'Save Prepared Disposition'}
            </button>
          </div>
        </form>
      ) : !(mode === 'weekly' && isPromptDay) && (
        <button
          onClick={openNewForm}
          className="w-full border-2 border-dashed border-sage-200 rounded-lg p-4 text-center font-body text-sm text-sage-600 hover:border-sage-400 hover:text-sage-600 transition-colors mb-6"
        >
          {mode === 'weekly' ? '+ New premeditatio (off-schedule)' : '+ Prepare a disposition'}
        </button>
      )}

      {/* Entries feed */}
      <div className="space-y-4">
        <h2 className="font-display text-lg font-medium text-sage-800">
          Past Entries
          {entries.length > 0 && (
            <span className="font-body text-sm text-sage-600 ml-2">({entries.length})</span>
          )}
        </h2>

        {entries.length === 0 ? (
          <div className="bg-sage-50 border border-sage-200 rounded-lg p-8 text-center">
            <p className="font-body text-sage-600">
              No premeditatio entries yet. The weekly prompt arrives on Monday mornings, or
              prepare a disposition any time.
            </p>
          </div>
        ) : (
          entries.map((entry) => {
            const isPrepared = entry.entry_kind === 'prepared_disposition'
            const virtueLabel = entry.virtue_domain
              ? VIRTUE_DOMAINS.find((v) => v.value === entry.virtue_domain)?.label ?? entry.virtue_domain
              : null
            return (
              <div key={entry.id} className="bg-white border border-sage-200 rounded-lg overflow-hidden">
                <div className="px-5 py-3 border-b border-sage-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-body text-xs text-sage-600">
                      {formatDate(entry.created_at)}
                    </span>
                    <span className="text-xs font-body px-2 py-0.5 rounded-full bg-sage-100 text-sage-600">
                      {isPrepared ? 'Prepared disposition' : 'Weekly reflection'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {entry.is_generic && (
                      <>
                        <span className="text-xs font-body px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">
                          Generic
                        </span>
                        <button
                          onClick={() => startEdit(entry)}
                          className="text-xs font-body px-2 py-0.5 rounded-full border border-amber-300 text-amber-700 hover:bg-amber-50 transition-colors"
                        >
                          Revise
                        </button>
                      </>
                    )}
                    {entry.avoidance_behaviour_tag && (
                      <span className="text-xs font-body px-2 py-0.5 rounded-full bg-sage-100 text-sage-600">
                        {entry.avoidance_behaviour_tag}
                      </span>
                    )}
                    {entry.behaviour_changed ? (
                      <span className="text-xs font-body px-2 py-0.5 rounded-full bg-green-50 text-green-700">
                        Behaviour changed
                      </span>
                    ) : entry.avoidance_behaviour_tag ? (
                      <button
                        onClick={() => markBehaviourChanged(entry.id)}
                        className="text-xs font-body px-2 py-0.5 rounded-full border border-sage-200 text-sage-600 hover:border-green-300 hover:text-green-600 transition-colors"
                      >
                        Mark changed
                      </button>
                    ) : null}
                  </div>
                </div>

                {isPrepared ? (
                  <div className="divide-y divide-sage-50">
                    <div className="px-5 py-3">
                      <div className="font-display text-xs font-medium text-sage-600 uppercase tracking-wider mb-1">
                        The Adversity Ahead
                      </div>
                      <p className="font-body text-sm text-sage-800">{entry.anticipated_event}</p>
                    </div>
                    <div className="grid sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-sage-50">
                      <div className="px-5 py-3">
                        <div className="font-display text-xs font-medium text-sage-600 uppercase tracking-wider mb-1">
                          Up To Me
                        </div>
                        <p className="font-body text-sm text-sage-800">{entry.within_control}</p>
                      </div>
                      <div className="px-5 py-3">
                        <div className="font-display text-xs font-medium text-sage-600 uppercase tracking-wider mb-1">
                          Not Up To Me
                        </div>
                        <p className="font-body text-sm text-sage-800">{entry.outside_control}</p>
                      </div>
                    </div>
                    <div className="px-5 py-3">
                      <div className="font-display text-xs font-medium text-sage-600 uppercase tracking-wider mb-1">
                        Virtue Response{virtueLabel ? ` — ${virtueLabel}` : ''}
                      </div>
                      <p className="font-body text-sm text-sage-800">{entry.virtue_response}</p>
                    </div>
                    <div className="px-5 py-3 bg-sage-50/40">
                      <div className="font-display text-xs font-medium text-sage-700 uppercase tracking-wider mb-1">
                        Prepared Disposition
                      </div>
                      <p className="font-body text-sm text-sage-800">{entry.prepared_disposition}</p>
                    </div>
                  </div>
                ) : (
                  <div className="divide-y divide-sage-50">
                    <div className="px-5 py-3">
                      <div className="font-display text-xs font-medium text-sage-600 uppercase tracking-wider mb-1">
                        Anticipated Event
                      </div>
                      <p className="font-body text-sm text-sage-800">{entry.anticipated_event}</p>
                    </div>
                    <div className="px-5 py-3 bg-amber-50/30">
                      <div className="font-display text-xs font-medium text-amber-700/60 uppercase tracking-wider mb-1">
                        False Impression
                      </div>
                      <p className="font-body text-sm text-sage-800">{entry.false_impression}</p>
                    </div>
                    <div className="px-5 py-3">
                      <div className="font-display text-xs font-medium text-sage-600 uppercase tracking-wider mb-1">
                        Correct Judgement
                      </div>
                      <p className="font-body text-sm text-sage-800">{entry.correct_judgement}</p>
                    </div>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
