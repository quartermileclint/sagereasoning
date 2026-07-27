'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { authFetch } from '@/lib/auth-fetch'
import SuggestedPracticeCard from '@/components/SuggestedPracticeCard'
import type { SuggestedPractice } from '@/lib/practice-sequence'
import type { User } from '@supabase/supabase-js'

/**
 * The Sage Compass — Remaining Principles #14 (the sage, sophos, as a regulative ideal).
 *
 * The Stoic practice of asking, before a difficult decision, "what would the sage
 * do?" The mentor is emphatic that this is not a vague aspiration but a STRUCTURED
 * imaginative exercise: identify the virtue the situation engages, identify what
 * complete and unified virtue would produce in that domain, and use it as the
 * orientation for the current action. "The exercise is not claiming to be the sage.
 * It is using the sage as a compass bearing."
 *
 * THE BINDING CONSTRAINT: "The distance is not a verdict. It is a developmental
 * orientation — the practitioner can see the direction of travel even when the
 * destination is far." So nothing here scores, ranks, or grades the distance. The
 * distance is the practitioner's own; the optional far/some-way/close reading is
 * theirs to choose, never computed. Only the COMPLETE EXPRESSION is gated, and only
 * for concreteness (the mentor's "this is not a vague aspiration").
 *
 * The compass is the positive complement to the passion diagnosis — the diagnosis
 * shows what pulls reasoning away from virtue, the compass shows what virtue would
 * look like here. That pairing is rendered as prose; it is NOT a code coupling.
 *
 * Human-only. It POSTs to /api/mentor/sage-compass; it never touches /api/reason,
 * the signed assessment, or the substrate engine.
 */

type Virtue = 'wisdom' | 'justice' | 'courage' | 'temperance'
type DistanceReading = 'far' | 'some_way' | 'close'
type ExpressionQuality = 'concrete' | 'vague' | null

const VIRTUE_OPTIONS: { value: Virtue; label: string; greek: string; hint: string }[] = [
  {
    value: 'wisdom',
    label: 'Wisdom',
    greek: 'phronesis',
    hint: 'Seeing the situation truly — what is actually the case, and what is actually up to you.',
  },
  {
    value: 'justice',
    label: 'Justice',
    greek: 'dikaiosyne',
    hint: 'What is owed to the others affected — fairness, honesty, the obligations of your roles.',
  },
  {
    value: 'courage',
    label: 'Courage',
    greek: 'andreia',
    hint: 'Holding to the good judgement under pressure, fear, cost, or the temptation to flinch.',
  },
  {
    value: 'temperance',
    label: 'Temperance',
    greek: 'sophrosyne',
    hint: 'Restraint before the pull of appetite, impatience, comfort, or wanting to be seen well.',
  },
]

const READING_OPTIONS: { value: DistanceReading; label: string }[] = [
  { value: 'far', label: 'A long way' },
  { value: 'some_way', label: 'Some way' },
  { value: 'close', label: 'Close' },
]

interface CompassEntry {
  id: string
  situation: string
  action_considered: string
  virtue_engaged: Virtue
  complete_expression: string
  distance: string
  distance_reading: DistanceReading | null
  expression_quality: ExpressionQuality
  created_at: string
}

export default function SageCompassPage() {
  const [_user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [entries, setEntries] = useState<CompassEntry[]>([])

  // Form state
  const [showForm, setShowForm] = useState(false)
  // When set, the form is REVISING an existing entry (PATCH) rather than creating one.
  const [editingId, setEditingId] = useState<string | null>(null)
  const [situation, setSituation] = useState('')
  const [actionConsidered, setActionConsidered] = useState('')
  const [virtue, setVirtue] = useState<Virtue | ''>('')
  const [completeExpression, setCompleteExpression] = useState('')
  const [distance, setDistance] = useState('')
  const [distanceReading, setDistanceReading] = useState<DistanceReading | ''>('')
  const [submitting, setSubmitting] = useState(false)
  const [submitResult, setSubmitResult] = useState<{
    type: 'success' | 'error' | 'warning'
    text: string
  } | null>(null)
  // Phase 2 (the in-session trigger): at most one suggestion per save; absent
  // field ⇒ nothing renders (honest silence).
  const [suggestion, setSuggestion] = useState<SuggestedPractice | null>(null)

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
    const res = await authFetch('/api/mentor/sage-compass?view=feed&limit=50')
    if (res.ok) {
      const data = await res.json()
      setEntries(data.entries)
    }
  }, [])

  function resetForm() {
    setEditingId(null)
    setSituation('')
    setActionConsidered('')
    setVirtue('')
    setCompleteExpression('')
    setDistance('')
    setDistanceReading('')
    // A suggestion is a response to THIS entry's diagnosis (Phase 2) — leaving
    // it standing once the form moves to a different or blank entry is a
    // stale, mis-attributed claim. Found by an independent adversarial review
    // after the first-hand review missed it; passion-log's resetForm already
    // did this, the other five wired pages did not.
    setSuggestion(null)
  }

  function openNewForm() {
    resetForm()
    setSubmitResult(null)
    setShowForm(true)
  }

  function startEdit(entry: CompassEntry) {
    setSituation(entry.situation || '')
    setActionConsidered(entry.action_considered || '')
    setVirtue(entry.virtue_engaged || '')
    setCompleteExpression(entry.complete_expression || '')
    setDistance(entry.distance || '')
    setDistanceReading(entry.distance_reading || '')
    setEditingId(entry.id)
    setSubmitResult(null)
    // startEdit does not route through resetForm — a suggestion still
    // attached to the entry just left must not follow onto a different entry.
    setSuggestion(null)
    setShowForm(true)
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const formValid =
    situation.trim() &&
    actionConsidered.trim() &&
    virtue &&
    completeExpression.trim() &&
    distance.trim()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!formValid || submitting) return
    setSubmitting(true)
    setSubmitResult(null)
    setSuggestion(null)

    try {
      const content = {
        situation: situation.trim(),
        action_considered: actionConsidered.trim(),
        virtue_engaged: virtue,
        complete_expression: completeExpression.trim(),
        distance: distance.trim(),
        distance_reading: distanceReading || null,
      }

      const res = editingId
        ? await authFetch('/api/mentor/sage-compass', {
            method: 'PATCH',
            body: JSON.stringify({ id: editingId, ...content }),
          })
        : await authFetch('/api/mentor/sage-compass', {
            method: 'POST',
            body: JSON.stringify(content),
          })

      if (res.ok) {
        const data = await res.json()
        setSuggestion(data.suggested_practice ?? null)
        if (data.quality_gate?.concrete === false) {
          // Keep the form open + populated so the EXPRESSION can be sharpened in
          // place. Point editingId at the row (just-created on POST, or the same on
          // PATCH) so the next submit updates it rather than creating a duplicate.
          if (data.entry?.id) setEditingId(data.entry.id)
          setSubmitResult({ type: 'warning', text: data.quality_gate.message })
          await fetchEntries()
        } else {
          setSubmitResult({ type: 'success', text: 'The bearing is recorded.' })
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

  function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  function virtueLabel(v: Virtue): string {
    const found = VIRTUE_OPTIONS.find((o) => o.value === v)
    return found ? `${found.label} (${found.greek})` : v
  }

  function readingLabel(r: DistanceReading): string {
    return READING_OPTIONS.find((o) => o.value === r)?.label ?? r
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
          The Sage Compass
        </h1>
        <p className="font-body text-sage-600">
          Before a difficult decision, ask what the sage would do — not as a claim to be one,
          but as a bearing to steer by. Name the virtue the situation engages, say what its
          complete expression would actually look like here, and mark the distance between
          that and the action you are considering.
        </p>
        {/* The logos flame — the bearing the compass steers by. Literal <img> +
            literal path only: this page is boundary-guarded and must not import
            brand-display (one-hop stoic-brain rule). */}
        <img
          src="/images/LOGOS.PNG"
          alt="The logos flame — the sage as a bearing, not a destination"
          className="w-full max-w-[240px] h-auto mt-4 drop-shadow-md"
        />
        <p className="font-body text-sm text-sage-500 mt-3">
          The distance is not a verdict. It is an orientation — you can see the direction of
          travel even when the destination is far. Where the{' '}
          <a href="/passion-log" className="underline hover:text-sage-700">Passion Log</a>{' '}
          shows what is pulling your reasoning away from virtue, the compass shows what virtue
          would look like here. Together they bracket the action from both sides.
        </p>
      </div>

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

      {/* Phase 2: the in-session suggestion — absent field, nothing renders. */}
      {suggestion && (
        <div className="mb-6">
          <SuggestedPracticeCard suggestion={suggestion} currentPracticeId="sage-compass" />
        </div>
      )}

      {/* Entry Form */}
      {showForm ? (
        <form onSubmit={handleSubmit} className="bg-white border border-sage-200 rounded-lg p-6 mb-6">
          <h2 className="font-display text-lg font-medium text-sage-800 mb-4">
            {isEditing ? 'Revise the Bearing' : 'Take a Bearing'}
          </h2>

          {/* Situation */}
          <div className="mb-5">
            <label htmlFor="compass-situation" className="font-display text-sm font-medium text-sage-600 block mb-1">
              What is the difficult decision before you?
              <span className="font-body text-xs text-sage-600 ml-2">Required</span>
            </label>
            <textarea
              id="compass-situation"
              value={situation}
              onChange={(e) => setSituation(e.target.value)}
              placeholder="A client has been under-billed for six months because of my error. They have not noticed."
              rows={3}
              className="w-full border border-sage-200 rounded-lg p-3 font-body text-sm text-sage-800 placeholder:text-sage-300 focus:outline-none focus:ring-2 focus:ring-sage-300 resize-y"
              required
            />
          </div>

          {/* Action considered */}
          <div className="mb-5">
            <label htmlFor="compass-action" className="font-display text-sm font-medium text-sage-600 block mb-1">
              What action are you considering?
              <span className="font-body text-xs text-sage-600 ml-2">Required</span>
            </label>
            <p className="font-body text-xs text-sage-500 mb-2">
              The action as you are actually contemplating it — not the one you think you
              ought to give. The bearing is only useful if it is taken from where you really are.
            </p>
            <textarea
              id="compass-action"
              value={actionConsidered}
              onChange={(e) => setActionConsidered(e.target.value)}
              placeholder="Quietly correct the rate going forward and say nothing about the six months."
              rows={2}
              className="w-full border border-sage-200 rounded-lg p-3 font-body text-sm text-sage-800 placeholder:text-sage-300 focus:outline-none focus:ring-2 focus:ring-sage-300 resize-y"
              required
            />
          </div>

          {/* Virtue engaged */}
          <div className="mb-5">
            <label id="compass-virtue-label" className="font-display text-sm font-medium text-sage-600 block mb-2">
              Which virtue is primarily engaged?
              <span className="font-body text-xs text-sage-600 ml-2">Required</span>
            </label>
            <div role="group" aria-labelledby="compass-virtue-label" className="grid gap-2 sm:grid-cols-2">
              {VIRTUE_OPTIONS.map((opt) => {
                const selected = virtue === opt.value
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setVirtue(opt.value)}
                    aria-pressed={selected}
                    className={`text-left border rounded-lg p-3 transition-colors ${
                      selected
                        ? 'border-sage-500 bg-sage-50'
                        : 'border-sage-200 hover:border-sage-400'
                    }`}
                  >
                    <img
                      src={
                        opt.value === 'wisdom' ? '/images/owllogo.PNG'
                        : opt.value === 'justice' ? '/images/scaleslogo.PNG'
                        : opt.value === 'courage' ? '/images/lionlogo.PNG'
                        : '/images/lotuslogo.PNG.png'
                      }
                      alt=""
                      aria-hidden="true"
                      className="w-16 h-auto mb-2"
                    />
                    <div className="font-display text-sm font-medium text-sage-800">
                      {opt.label}{' '}
                      <span className="font-body text-xs text-sage-500 italic">{opt.greek}</span>
                    </div>
                    <div className="font-body text-xs text-sage-500 mt-1">{opt.hint}</div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Complete expression — the gated field */}
          <div className="mb-5">
            <label htmlFor="compass-expression" className="font-display text-sm font-medium text-sage-600 block mb-1">
              What would that virtue&apos;s complete expression look like here?
              <span className="font-body text-xs text-sage-600 ml-2">Required</span>
            </label>
            <p className="font-body text-xs text-sage-500 mb-2">
              Not &quot;act with integrity&quot; — what complete understanding of this virtue would
              actually <em>produce</em> in this situation: the specific thing it would do, say,
              or refuse. This is the bearing.
            </p>
            <textarea
              id="compass-expression"
              value={completeExpression}
              onChange={(e) => setCompleteExpression(e.target.value)}
              placeholder="Tell the client today, name the full amount, absorb the loss without shading the explanation to protect my reputation — and treat their trust as the thing actually at stake."
              rows={4}
              className="w-full border border-sage-200 rounded-lg p-3 font-body text-sm text-sage-800 placeholder:text-sage-300 focus:outline-none focus:ring-2 focus:ring-sage-300 resize-y"
              required
            />
          </div>

          {/* Distance — never scored */}
          <div className="mb-5">
            <label htmlFor="compass-distance" className="font-display text-sm font-medium text-sage-600 block mb-1">
              What is the distance between that and the action you are considering?
              <span className="font-body text-xs text-sage-600 ml-2">Required</span>
            </label>
            <p className="font-body text-xs text-sage-500 mb-2">
              Name it honestly. This is not marked or judged — a long way to go is a true
              reading, not a failure. It is what tells you the direction of travel.
            </p>
            <textarea
              id="compass-distance"
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
              placeholder="A long way. Mine protects me and calls it discretion; the sage's protects them and accepts the cost. The gap is exactly my reluctance to be seen as careless."
              rows={3}
              className="w-full border border-sage-200 rounded-lg p-3 font-body text-sm text-sage-800 placeholder:text-sage-300 focus:outline-none focus:ring-2 focus:ring-sage-300 resize-y"
              required
            />
          </div>

          {/* Optional practitioner-selected reading */}
          <div className="mb-6">
            <label id="compass-reading-label" className="font-display text-sm font-medium text-sage-600 block mb-1">
              How far, as you read it?
              <span className="font-body text-xs text-sage-500 ml-2">Optional — your own reading</span>
            </label>
            <p className="font-body text-xs text-sage-500 mb-2">
              Yours to choose, and nothing computes it for you. Leave it blank if you would
              rather not characterise it.
            </p>
            <div role="group" aria-labelledby="compass-reading-label" className="flex flex-wrap gap-2">
              {READING_OPTIONS.map((opt) => {
                const selected = distanceReading === opt.value
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setDistanceReading(selected ? '' : opt.value)}
                    aria-pressed={selected}
                    className={`px-3 py-1.5 rounded-full border font-body text-sm transition-colors ${
                      selected
                        ? 'border-sage-500 bg-sage-50 text-sage-800'
                        : 'border-sage-200 text-sage-600 hover:border-sage-400'
                    }`}
                  >
                    {opt.label}
                  </button>
                )
              })}
            </div>
          </div>

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
              {submitting ? 'Saving...' : isEditing ? 'Save changes' : 'Set the Bearing'}
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={openNewForm}
          className="w-full border-2 border-dashed border-sage-200 rounded-lg p-4 text-center font-body text-sm text-sage-600 hover:border-sage-400 hover:text-sage-600 transition-colors mb-6"
        >
          + Take a bearing on a decision
        </button>
      )}

      {/* Entries feed */}
      <div className="space-y-4">
        <h2 className="font-display text-lg font-medium text-sage-800">
          Past Bearings
          {entries.length > 0 && (
            <span className="font-body text-sm text-sage-600 ml-2">({entries.length})</span>
          )}
        </h2>

        {entries.length === 0 ? (
          <div className="bg-sage-50 border border-sage-200 rounded-lg p-8 text-center">
            <p className="font-body text-sage-600">
              No bearings yet. When the next difficult decision comes, ask what complete virtue
              would do in that situation — and be honest about how far off you are.
            </p>
          </div>
        ) : (
          entries.map((entry) => {
            const flagged = entry.expression_quality === 'vague'
            return (
              <div key={entry.id} className="bg-white border border-sage-200 rounded-lg overflow-hidden">
                <div className="px-5 py-3 border-b border-sage-100 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-body text-xs text-sage-600">
                      {formatDate(entry.created_at)}
                    </span>
                    <span className="text-xs font-body px-2 py-0.5 rounded-full bg-sage-50 text-sage-700 border border-sage-200">
                      {virtueLabel(entry.virtue_engaged)}
                    </span>
                  </div>
                  {flagged && (
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-body px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">
                        A general ideal, not yet a bearing
                      </span>
                      <button
                        onClick={() => startEdit(entry)}
                        className="text-xs font-body px-2 py-0.5 rounded-full border border-amber-300 text-amber-700 hover:bg-amber-50 transition-colors"
                      >
                        Revise
                      </button>
                    </div>
                  )}
                </div>

                <div className="divide-y divide-sage-50">
                  <div className="px-5 py-3">
                    <div className="font-display text-xs font-medium text-sage-600 uppercase tracking-wider mb-1">
                      The Decision
                    </div>
                    <p className="font-body text-sm text-sage-800">{entry.situation}</p>
                  </div>
                  <div className="px-5 py-3">
                    <div className="font-display text-xs font-medium text-sage-600 uppercase tracking-wider mb-1">
                      Action Considered
                    </div>
                    <p className="font-body text-sm text-sage-800">{entry.action_considered}</p>
                  </div>
                  <div className="px-5 py-3 bg-sage-50/40">
                    <div className="font-display text-xs font-medium text-sage-700 uppercase tracking-wider mb-1">
                      The Bearing — Complete Virtue Here
                    </div>
                    <p className="font-body text-sm text-sage-800">{entry.complete_expression}</p>
                  </div>
                  <div className="px-5 py-3">
                    <div className="font-display text-xs font-medium text-sage-600 uppercase tracking-wider mb-1">
                      The Distance
                      {entry.distance_reading && (
                        <span className="ml-2 font-body text-xs normal-case tracking-normal text-sage-500">
                          — your reading: {readingLabel(entry.distance_reading)}
                        </span>
                      )}
                    </div>
                    <p className="font-body text-sm text-sage-800">{entry.distance}</p>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
