'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { authFetch } from '@/lib/auth-fetch'
import SuggestedPracticeCard from '@/components/SuggestedPracticeCard'
import type { SuggestedPractice } from '@/lib/practice-sequence'
import type { User } from '@supabase/supabase-js'

/**
 * The Reserve Clause (hupexairesis) — Remaining Principles #10-human
 *
 * A single structured prompt at the action stage: name the outcome you are
 * pursuing, and the response you have prepared if that outcome does not occur.
 * It surfaces the difference between commitment-to-the-action (up to us) and
 * commitment-to-the-outcome (not up to us).
 *
 * Entries flagged by the gate (the response still insists on the outcome) can be
 * revised IN PLACE (an edit updates the same row rather than re-entering or
 * duplicating).
 *
 * Human-only. It POSTs to /api/mentor/hupexairesis; it never touches /api/reason,
 * the signed assessment, or the substrate engine.
 */

interface ReserveEntry {
  id: string
  action_context: string | null
  outcome_pursued: string
  prepared_response: string
  separates_action_from_outcome: boolean | null
  created_at: string
}

export default function HupexairesisPage() {
  const [_user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [entries, setEntries] = useState<ReserveEntry[]>([])

  // Form state
  const [showForm, setShowForm] = useState(false)
  // When set, the form is REVISING an existing entry (PATCH) rather than creating one.
  const [editingId, setEditingId] = useState<string | null>(null)
  const [actionContext, setActionContext] = useState('')
  const [outcomePursued, setOutcomePursued] = useState('')
  const [preparedResponse, setPreparedResponse] = useState('')
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
    const res = await authFetch('/api/mentor/hupexairesis?view=feed&limit=50')
    if (res.ok) {
      const data = await res.json()
      setEntries(data.entries)
    }
  }, [])

  function resetForm() {
    setEditingId(null)
    setActionContext('')
    setOutcomePursued('')
    setPreparedResponse('')
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

  function startEdit(entry: ReserveEntry) {
    setActionContext(entry.action_context || '')
    setOutcomePursued(entry.outcome_pursued || '')
    setPreparedResponse(entry.prepared_response || '')
    setEditingId(entry.id)
    setSubmitResult(null)
    // startEdit does not route through resetForm — a suggestion still
    // attached to the entry just left must not follow onto a different entry.
    setSuggestion(null)
    setShowForm(true)
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const formValid = outcomePursued.trim() && preparedResponse.trim()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!formValid || submitting) return
    setSubmitting(true)
    setSubmitResult(null)
    setSuggestion(null)

    try {
      const content = {
        outcome_pursued: outcomePursued.trim(),
        prepared_response: preparedResponse.trim(),
        action_context: actionContext.trim() || undefined,
      }

      const res = editingId
        ? await authFetch('/api/mentor/hupexairesis', {
            method: 'PATCH',
            body: JSON.stringify({ id: editingId, ...content }),
          })
        : await authFetch('/api/mentor/hupexairesis', {
            method: 'POST',
            body: JSON.stringify(content),
          })

      if (res.ok) {
        const data = await res.json()
        setSuggestion(data.suggested_practice ?? null)
        if (data.quality_gate?.separates_action_from_outcome === false) {
          // Keep the form open + populated so it can be revised in place. Point
          // editingId at the row (just-created on POST, or the same on PATCH) so
          // the next submit updates it rather than creating a duplicate.
          if (data.entry?.id) setEditingId(data.entry.id)
          setSubmitResult({ type: 'warning', text: data.quality_gate.message })
          await fetchEntries()
        } else {
          setSubmitResult({ type: 'success', text: 'Reserve clause recorded.' })
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
          The Reserve Clause
        </h1>
        <p className="font-body text-sage-600">
          Before you act, settle it in advance: the outcome you are pursuing, and the
          response you have prepared if that outcome does not occur. You commit fully to
          acting well — and hold the result lightly, because it was never wholly up to you.
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
          <SuggestedPracticeCard suggestion={suggestion} currentPracticeId="hupexairesis" />
        </div>
      )}

      {/* Entry Form */}
      {showForm ? (
        <form onSubmit={handleSubmit} className="bg-white border border-sage-200 rounded-lg p-6 mb-6">
          <h2 className="font-display text-lg font-medium text-sage-800 mb-4">
            {isEditing ? 'Revise the Reservation' : 'Add the Reservation'}
          </h2>

          {/* Action context (optional) */}
          <div className="mb-4">
            <label className="font-display text-sm font-medium text-sage-600 block mb-1">
              The decision or action
              <span className="font-body text-xs text-sage-600 ml-2">
                Optional — what you are about to do
              </span>
            </label>
            <input
              type="text"
              value={actionContext}
              onChange={(e) => setActionContext(e.target.value)}
              placeholder="e.g., Submitting my application; having the hard conversation tomorrow"
              className="w-full border border-sage-200 rounded-lg p-3 font-body text-sm text-sage-800 placeholder:text-sage-300 focus:outline-none focus:ring-2 focus:ring-sage-300"
            />
          </div>

          {/* Outcome pursued */}
          <div className="mb-4">
            <label className="font-display text-sm font-medium text-sage-600 block mb-1">
              The outcome you are pursuing
              <span className="font-body text-xs text-sage-600 ml-2">
                What you hope will happen — not up to you alone
              </span>
            </label>
            <textarea
              value={outcomePursued}
              onChange={(e) => setOutcomePursued(e.target.value)}
              placeholder="Example: That they accept the proposal and we move forward together."
              rows={3}
              className="w-full border border-sage-200 rounded-lg p-3 font-body text-sm text-sage-800 placeholder:text-sage-300 focus:outline-none focus:ring-2 focus:ring-sage-300 resize-y"
              required
            />
          </div>

          {/* Prepared response */}
          <div className="mb-6">
            <label className="font-display text-sm font-medium text-sage-600 block mb-1">
              Your prepared response if it does not occur
              <span className="font-body text-xs text-sage-600 ml-2">
                The reservation — how you will meet the outcome not occurring
              </span>
            </label>
            <textarea
              value={preparedResponse}
              onChange={(e) => setPreparedResponse(e.target.value)}
              placeholder="Example: If they decline, I will have still acted with honesty and care. I will hear their reasons, take what is useful, and choose my next step freely — the refusal does not touch my worth."
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
              {submitting ? 'Saving...' : isEditing ? 'Save changes' : 'Save Reserve Clause'}
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={openNewForm}
          className="w-full border-2 border-dashed border-sage-200 rounded-lg p-4 text-center font-body text-sm text-sage-600 hover:border-sage-400 hover:text-sage-600 transition-colors mb-6"
        >
          + Add a reserve clause
        </button>
      )}

      {/* Entries feed */}
      <div className="space-y-4">
        <h2 className="font-display text-lg font-medium text-sage-800">
          Past Reservations
          {entries.length > 0 && (
            <span className="font-body text-sm text-sage-600 ml-2">({entries.length})</span>
          )}
        </h2>

        {entries.length === 0 ? (
          <div className="bg-sage-50 border border-sage-200 rounded-lg p-8 text-center">
            <p className="font-body text-sage-600">
              No reserve clauses yet. Before your next consequential action, name the
              outcome you are pursuing — and the response you have prepared if it does not occur.
            </p>
          </div>
        ) : (
          entries.map((entry) => (
            <div key={entry.id} className="bg-white border border-sage-200 rounded-lg overflow-hidden">
              <div className="px-5 py-3 border-b border-sage-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-body text-xs text-sage-600">
                    {formatDate(entry.created_at)}
                  </span>
                  {entry.action_context && (
                    <span className="text-xs font-body px-2 py-0.5 rounded-full bg-sage-100 text-sage-600">
                      {entry.action_context}
                    </span>
                  )}
                </div>
                {entry.separates_action_from_outcome === false && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-body px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">
                      Outcome still attached
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
                    Outcome Pursued
                  </div>
                  <p className="font-body text-sm text-sage-800">{entry.outcome_pursued}</p>
                </div>
                <div className="px-5 py-3 bg-sage-50/40">
                  <div className="font-display text-xs font-medium text-sage-700 uppercase tracking-wider mb-1">
                    Prepared Response If It Does Not Occur
                  </div>
                  <p className="font-body text-sm text-sage-800">{entry.prepared_response}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
