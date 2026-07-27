'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { authFetch } from '@/lib/auth-fetch'
import SuggestedPracticeCard from '@/components/SuggestedPracticeCard'
import type { SuggestedPractice } from '@/lib/practice-sequence'
import type { User } from '@supabase/supabase-js'

/**
 * The View From Above (the cosmopolitan perspective) — Remaining Principles #9,
 * with the fate-acceptance reframe (#13) folded in.
 *
 * A Zone-2 grief/catastrophising calibration exercise: name a concern that feels
 * overwhelming, step back through three temporal expansions (one year / ten years
 * / your whole life) and one spatial expansion (the widest circle you can
 * genuinely inhabit), meet it with the fate-acceptance reframe, then write a
 * recalibrated reading of its actual magnitude. The tool does not minimise. It
 * calibrates.
 *
 * Entries the gate flags (minimised, or magnitude unchanged) can be revised IN
 * PLACE (an edit updates the same row rather than re-entering or duplicating).
 *
 * Human-only. It POSTs to /api/mentor/view-from-above; it never touches
 * /api/reason, the signed assessment, or the substrate engine.
 */

type CalibrationQuality = 'calibrated' | 'minimised' | 'unchanged' | null

interface ViewEntry {
  id: string
  concern: string
  expansion_one_year: string | null
  expansion_ten_years: string | null
  expansion_whole_life: string | null
  expansion_widest_circle: string | null
  fate_acceptance: string | null
  recalibrated_reading: string
  calibration_quality: CalibrationQuality
  created_at: string
}

export default function ViewFromAbovePage() {
  const [_user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [entries, setEntries] = useState<ViewEntry[]>([])

  // Form state
  const [showForm, setShowForm] = useState(false)
  // When set, the form is REVISING an existing entry (PATCH) rather than creating one.
  const [editingId, setEditingId] = useState<string | null>(null)
  const [concern, setConcern] = useState('')
  const [oneYear, setOneYear] = useState('')
  const [tenYears, setTenYears] = useState('')
  const [wholeLife, setWholeLife] = useState('')
  const [widestCircle, setWidestCircle] = useState('')
  const [fateAcceptance, setFateAcceptance] = useState('')
  const [recalibratedReading, setRecalibratedReading] = useState('')
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
    const res = await authFetch('/api/mentor/view-from-above?view=feed&limit=50')
    if (res.ok) {
      const data = await res.json()
      setEntries(data.entries)
    }
  }, [])

  function resetForm() {
    setEditingId(null)
    setConcern('')
    setOneYear('')
    setTenYears('')
    setWholeLife('')
    setWidestCircle('')
    setFateAcceptance('')
    setRecalibratedReading('')
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

  function startEdit(entry: ViewEntry) {
    setConcern(entry.concern || '')
    setOneYear(entry.expansion_one_year || '')
    setTenYears(entry.expansion_ten_years || '')
    setWholeLife(entry.expansion_whole_life || '')
    setWidestCircle(entry.expansion_widest_circle || '')
    setFateAcceptance(entry.fate_acceptance || '')
    setRecalibratedReading(entry.recalibrated_reading || '')
    setEditingId(entry.id)
    setSubmitResult(null)
    // startEdit does not route through resetForm — a suggestion still
    // attached to the entry just left must not follow onto a different entry.
    setSuggestion(null)
    setShowForm(true)
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const formValid = concern.trim() && recalibratedReading.trim()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!formValid || submitting) return
    setSubmitting(true)
    setSubmitResult(null)
    setSuggestion(null)

    try {
      const content = {
        concern: concern.trim(),
        recalibrated_reading: recalibratedReading.trim(),
        expansion_one_year: oneYear.trim() || undefined,
        expansion_ten_years: tenYears.trim() || undefined,
        expansion_whole_life: wholeLife.trim() || undefined,
        expansion_widest_circle: widestCircle.trim() || undefined,
        fate_acceptance: fateAcceptance.trim() || undefined,
      }

      const res = editingId
        ? await authFetch('/api/mentor/view-from-above', {
            method: 'PATCH',
            body: JSON.stringify({ id: editingId, ...content }),
          })
        : await authFetch('/api/mentor/view-from-above', {
            method: 'POST',
            body: JSON.stringify(content),
          })

      if (res.ok) {
        const data = await res.json()
        setSuggestion(data.suggested_practice ?? null)
        if (data.quality_gate?.calibrates === false) {
          // Keep the form open + populated so it can be revised in place. Point
          // editingId at the row (just-created on POST, or the same on PATCH) so
          // the next submit updates it rather than creating a duplicate.
          if (data.entry?.id) setEditingId(data.entry.id)
          setSubmitResult({ type: 'warning', text: data.quality_gate.message })
          await fetchEntries()
        } else {
          setSubmitResult({ type: 'success', text: 'View from above recorded.' })
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
          The View From Above
        </h1>
        <p className="font-body text-sage-600">
          When a concern fills the whole horizon, step back and see it in scale. Look at it
          from one year on, from ten years, from the whole of your life — then from the widest
          view you can honestly hold. The point is not to make it small. It is to see it at the
          size it actually has.
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
          <SuggestedPracticeCard suggestion={suggestion} currentPracticeId="view-from-above" />
        </div>
      )}

      {/* Entry Form */}
      {showForm ? (
        <form onSubmit={handleSubmit} className="bg-white border border-sage-200 rounded-lg p-6 mb-6">
          <h2 className="font-display text-lg font-medium text-sage-800 mb-4">
            {isEditing ? 'Revise the View' : 'Take the View From Above'}
          </h2>

          {/* Concern */}
          <div className="mb-5">
            <label className="font-display text-sm font-medium text-sage-600 block mb-1">
              The concern that feels overwhelming
              <span className="font-body text-xs text-sage-600 ml-2">Required</span>
            </label>
            <textarea
              value={concern}
              onChange={(e) => setConcern(e.target.value)}
              placeholder="Name what is weighing on you right now — the loss, the fear, the difficulty that feels larger than everything else."
              rows={3}
              className="w-full border border-sage-200 rounded-lg p-3 font-body text-sm text-sage-800 placeholder:text-sage-300 focus:outline-none focus:ring-2 focus:ring-sage-300 resize-y"
              required
            />
          </div>

          {/* The expansions — guided, optional */}
          <div className="mb-2 mt-6">
            <div className="font-display text-xs font-medium text-sage-500 uppercase tracking-wider mb-3">
              Step back — the expansions <span className="normal-case font-body text-sage-400">(optional; take the ones that help)</span>
            </div>
          </div>

          <div className="mb-4">
            <label className="font-display text-sm font-medium text-sage-600 block mb-1">
              How does this look in one year?
            </label>
            <textarea
              value={oneYear}
              onChange={(e) => setOneYear(e.target.value)}
              placeholder="Picture yourself a year from now. What place does this hold then?"
              rows={2}
              className="w-full border border-sage-200 rounded-lg p-3 font-body text-sm text-sage-800 placeholder:text-sage-300 focus:outline-none focus:ring-2 focus:ring-sage-300 resize-y"
            />
          </div>

          <div className="mb-4">
            <label className="font-display text-sm font-medium text-sage-600 block mb-1">
              And in ten years?
            </label>
            <textarea
              value={tenYears}
              onChange={(e) => setTenYears(e.target.value)}
              placeholder="Ten years on — what remains of it?"
              rows={2}
              className="w-full border border-sage-200 rounded-lg p-3 font-body text-sm text-sage-800 placeholder:text-sage-300 focus:outline-none focus:ring-2 focus:ring-sage-300 resize-y"
            />
          </div>

          <div className="mb-4">
            <label className="font-display text-sm font-medium text-sage-600 block mb-1">
              In the context of your whole life
            </label>
            <textarea
              value={wholeLife}
              onChange={(e) => setWholeLife(e.target.value)}
              placeholder="Set it against the full span of your life — everything you have already met, and everything still to come."
              rows={2}
              className="w-full border border-sage-200 rounded-lg p-3 font-body text-sm text-sage-800 placeholder:text-sage-300 focus:outline-none focus:ring-2 focus:ring-sage-300 resize-y"
            />
          </div>

          <div className="mb-4">
            <label className="font-display text-sm font-medium text-sage-600 block mb-1">
              From the widest circle you can genuinely inhabit
            </label>
            <textarea
              value={widestCircle}
              onChange={(e) => setWidestCircle(e.target.value)}
              placeholder="Step back to the widest view you can honestly hold — your community, all people, the whole of things. How does it appear from there?"
              rows={2}
              className="w-full border border-sage-200 rounded-lg p-3 font-body text-sm text-sage-800 placeholder:text-sage-300 focus:outline-none focus:ring-2 focus:ring-sage-300 resize-y"
            />
          </div>

          {/* Fate-acceptance reframe (#13) */}
          <div className="mb-6 mt-6 border-t border-sage-100 pt-5">
            <label className="font-display text-sm font-medium text-sage-600 block mb-1">
              What would accepting it look like?
              <span className="font-body text-xs text-sage-600 ml-2">Optional</span>
            </label>
            <p className="font-body text-xs text-sage-500 mb-2">
              This is not dismissal — the grief is real. But is your quarrel with what happened,
              or with the fact that it happened at all? To accept is to stop resisting that it is
              part of the way things are, without pretending it does not matter.
            </p>
            <textarea
              value={fateAcceptance}
              onChange={(e) => setFateAcceptance(e.target.value)}
              placeholder="What would it be to meet this as part of the order of things — to hold it, rather than to fight that it occurred?"
              rows={3}
              className="w-full border border-sage-200 rounded-lg p-3 font-body text-sm text-sage-800 placeholder:text-sage-300 focus:outline-none focus:ring-2 focus:ring-sage-300 resize-y"
            />
          </div>

          {/* Recalibrated reading */}
          <div className="mb-6">
            <label className="font-display text-sm font-medium text-sage-600 block mb-1">
              The concern, at its actual size
              <span className="font-body text-xs text-sage-600 ml-2">Required</span>
            </label>
            <textarea
              value={recalibratedReading}
              onChange={(e) => setRecalibratedReading(e.target.value)}
              placeholder="Now read it again. Not smaller than it is, not larger — the size it actually has. What is it, really?"
              rows={4}
              className="w-full border border-sage-200 rounded-lg p-3 font-body text-sm text-sage-800 placeholder:text-sage-300 focus:outline-none focus:ring-2 focus:ring-sage-300 resize-y"
              required
            />
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
              {submitting ? 'Saving...' : isEditing ? 'Save changes' : 'Save the View'}
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={openNewForm}
          className="w-full border-2 border-dashed border-sage-200 rounded-lg p-4 text-center font-body text-sm text-sage-600 hover:border-sage-400 hover:text-sage-600 transition-colors mb-6"
        >
          + Take the view from above
        </button>
      )}

      {/* Entries feed */}
      <div className="space-y-4">
        <h2 className="font-display text-lg font-medium text-sage-800">
          Past Views
          {entries.length > 0 && (
            <span className="font-body text-sm text-sage-600 ml-2">({entries.length})</span>
          )}
        </h2>

        {entries.length === 0 ? (
          <div className="bg-sage-50 border border-sage-200 rounded-lg p-8 text-center">
            <p className="font-body text-sage-600">
              No views yet. When a concern feels larger than everything else, name it here and
              step back to see it in scale.
            </p>
          </div>
        ) : (
          entries.map((entry) => {
            const flagged =
              entry.calibration_quality === 'minimised' || entry.calibration_quality === 'unchanged'
            return (
              <div key={entry.id} className="bg-white border border-sage-200 rounded-lg overflow-hidden">
                <div className="px-5 py-3 border-b border-sage-100 flex items-center justify-between">
                  <span className="font-body text-xs text-sage-600">
                    {formatDate(entry.created_at)}
                  </span>
                  {flagged && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-body px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">
                        {entry.calibration_quality === 'minimised' ? 'Minimised, not calibrated' : 'Magnitude unchanged'}
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
                      The Concern
                    </div>
                    <p className="font-body text-sm text-sage-800">{entry.concern}</p>
                  </div>
                  {entry.fate_acceptance && (
                    <div className="px-5 py-3">
                      <div className="font-display text-xs font-medium text-sage-600 uppercase tracking-wider mb-1">
                        Accepting It
                      </div>
                      <p className="font-body text-sm text-sage-800">{entry.fate_acceptance}</p>
                    </div>
                  )}
                  <div className="px-5 py-3 bg-sage-50/40">
                    <div className="font-display text-xs font-medium text-sage-700 uppercase tracking-wider mb-1">
                      At Its Actual Size
                    </div>
                    <p className="font-body text-sm text-sage-800">{entry.recalibrated_reading}</p>
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
