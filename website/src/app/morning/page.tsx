'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { authFetch } from '@/lib/auth-fetch'
import type { User } from '@supabase/supabase-js'

/**
 * Morning Preparation (the morning examination) — Remaining Principles #8.
 *
 * The Stoic orientation of the ruling faculty (hegemonikon) before the day's
 * impressions arrive — Marcus Aurelius's morning preparation. Three questions:
 * the roles active today and the appropriate actions they generate; the
 * impressions likely to arrive and which risk hasty assent; the virtue response
 * to have prepared. The three answers are the daily orientation record — the
 * morning pole that completes the daily practice alongside the evening review.
 *
 * Entries the gate flags as a vague aspiration (rather than a concrete, anchored
 * disposition) can be revised IN PLACE (an edit updates the same row rather than
 * re-entering or duplicating).
 *
 * Human-only. It POSTs to /api/mentor/morning; it never touches /api/reason, the
 * signed assessment, or the substrate engine, and it never imports the reflect
 * engine — the "the evening assesses whether the morning intention held" pairing
 * is conceptual, not a code coupling.
 */

type PreparationQuality = 'prepared' | 'vague' | null

interface MorningEntry {
  id: string
  roles_active: string
  expected_impressions: string
  prepared_virtue_response: string
  preparation_quality: PreparationQuality
  created_at: string
}

export default function MorningPreparationPage() {
  const [_user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [entries, setEntries] = useState<MorningEntry[]>([])

  // Form state
  const [showForm, setShowForm] = useState(false)
  // When set, the form is REVISING an existing entry (PATCH) rather than creating one.
  const [editingId, setEditingId] = useState<string | null>(null)
  const [rolesActive, setRolesActive] = useState('')
  const [expectedImpressions, setExpectedImpressions] = useState('')
  const [preparedResponse, setPreparedResponse] = useState('')
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
    const res = await authFetch('/api/mentor/morning?view=feed&limit=50')
    if (res.ok) {
      const data = await res.json()
      setEntries(data.entries)
    }
  }, [])

  function resetForm() {
    setEditingId(null)
    setRolesActive('')
    setExpectedImpressions('')
    setPreparedResponse('')
  }

  function openNewForm() {
    resetForm()
    setSubmitResult(null)
    setShowForm(true)
  }

  function startEdit(entry: MorningEntry) {
    setRolesActive(entry.roles_active || '')
    setExpectedImpressions(entry.expected_impressions || '')
    setPreparedResponse(entry.prepared_virtue_response || '')
    setEditingId(entry.id)
    setSubmitResult(null)
    setShowForm(true)
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const formValid = rolesActive.trim() && expectedImpressions.trim() && preparedResponse.trim()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!formValid || submitting) return
    setSubmitting(true)
    setSubmitResult(null)

    try {
      const content = {
        roles_active: rolesActive.trim(),
        expected_impressions: expectedImpressions.trim(),
        prepared_virtue_response: preparedResponse.trim(),
      }

      const res = editingId
        ? await authFetch('/api/mentor/morning', {
            method: 'PATCH',
            body: JSON.stringify({ id: editingId, ...content }),
          })
        : await authFetch('/api/mentor/morning', {
            method: 'POST',
            body: JSON.stringify(content),
          })

      if (res.ok) {
        const data = await res.json()
        if (data.quality_gate?.prepared === false) {
          // Keep the form open + populated so it can be revised in place. Point
          // editingId at the row (just-created on POST, or the same on PATCH) so
          // the next submit updates it rather than creating a duplicate.
          if (data.entry?.id) setEditingId(data.entry.id)
          setSubmitResult({ type: 'warning', text: data.quality_gate.message })
          await fetchEntries()
        } else {
          setSubmitResult({ type: 'success', text: 'Morning preparation recorded.' })
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
          Morning Preparation
        </h1>
        <p className="font-body text-sage-600">
          Before the day&apos;s impressions arrive, orient the ruling faculty. Name the roles
          you carry today and what each asks of you; the impressions you expect to meet, and
          which are most likely to pull a hasty assent; and the response you want ready when they
          come. The morning declares the intention; the evening will ask whether it held.
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

      {/* Entry Form */}
      {showForm ? (
        <form onSubmit={handleSubmit} className="bg-white border border-sage-200 rounded-lg p-6 mb-6">
          <h2 className="font-display text-lg font-medium text-sage-800 mb-4">
            {isEditing ? 'Revise the Preparation' : "Prepare for the Day"}
          </h2>

          {/* Roles active today */}
          <div className="mb-5">
            <label className="font-display text-sm font-medium text-sage-600 block mb-1">
              What roles are active today, and what do they ask of you?
              <span className="font-body text-xs text-sage-600 ml-2">Required</span>
            </label>
            <p className="font-body text-xs text-sage-500 mb-2">
              The roles you carry into this day — colleague, parent, friend, citizen — and the
              appropriate action (kathekon) each one generates.
            </p>
            <textarea
              value={rolesActive}
              onChange={(e) => setRolesActive(e.target.value)}
              placeholder="Today I am a colleague on a hard review, a parent this evening, a neighbour… what does each ask of me?"
              rows={3}
              className="w-full border border-sage-200 rounded-lg p-3 font-body text-sm text-sage-800 placeholder:text-sage-300 focus:outline-none focus:ring-2 focus:ring-sage-300 resize-y"
              required
            />
          </div>

          {/* Expected impressions */}
          <div className="mb-5">
            <label className="font-display text-sm font-medium text-sage-600 block mb-1">
              What impressions do you expect — and which risk a hasty assent?
              <span className="font-body text-xs text-sage-600 ml-2">Required</span>
            </label>
            <p className="font-body text-xs text-sage-500 mb-2">
              The impressions likely to arrive today, and the ones most apt to be granted before
              they are examined — the provocation, the flattery, the fear.
            </p>
            <textarea
              value={expectedImpressions}
              onChange={(e) => setExpectedImpressions(e.target.value)}
              placeholder="I expect pushback that will feel like an attack; praise that will tempt me to overreach… which of these will I assent to too quickly?"
              rows={3}
              className="w-full border border-sage-200 rounded-lg p-3 font-body text-sm text-sage-800 placeholder:text-sage-300 focus:outline-none focus:ring-2 focus:ring-sage-300 resize-y"
              required
            />
          </div>

          {/* Prepared virtue response */}
          <div className="mb-6">
            <label className="font-display text-sm font-medium text-sage-600 block mb-1">
              What virtue response do you want to have prepared?
              <span className="font-body text-xs text-sage-600 ml-2">Required</span>
            </label>
            <p className="font-body text-xs text-sage-500 mb-2">
              Not &quot;be virtuous&quot; — the specific stance you will hold when a named impression
              arrives. Anchor it to one of the roles or impressions above.
            </p>
            <textarea
              value={preparedResponse}
              onChange={(e) => setPreparedResponse(e.target.value)}
              placeholder="When the reviewer pushes back, I will pause and examine the impression before defending — treating the objection as information, not as a threat."
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
              {submitting ? 'Saving...' : isEditing ? 'Save changes' : 'Save the Preparation'}
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={openNewForm}
          className="w-full border-2 border-dashed border-sage-200 rounded-lg p-4 text-center font-body text-sm text-sage-600 hover:border-sage-400 hover:text-sage-600 transition-colors mb-6"
        >
          + Prepare for the day
        </button>
      )}

      {/* Entries feed */}
      <div className="space-y-4">
        <h2 className="font-display text-lg font-medium text-sage-800">
          Past Preparations
          {entries.length > 0 && (
            <span className="font-body text-sm text-sage-600 ml-2">({entries.length})</span>
          )}
        </h2>

        {entries.length === 0 ? (
          <div className="bg-sage-50 border border-sage-200 rounded-lg p-8 text-center">
            <p className="font-body text-sage-600">
              No preparations yet. Before the day begins, take a moment to orient the ruling
              faculty — the roles you carry, the impressions you expect, the response you want ready.
            </p>
          </div>
        ) : (
          entries.map((entry) => {
            const flagged = entry.preparation_quality === 'vague'
            return (
              <div key={entry.id} className="bg-white border border-sage-200 rounded-lg overflow-hidden">
                <div className="px-5 py-3 border-b border-sage-100 flex items-center justify-between">
                  <span className="font-body text-xs text-sage-600">
                    {formatDate(entry.created_at)}
                  </span>
                  {flagged && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-body px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">
                        A general aspiration, not yet anchored
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
                      Roles Today
                    </div>
                    <p className="font-body text-sm text-sage-800">{entry.roles_active}</p>
                  </div>
                  <div className="px-5 py-3">
                    <div className="font-display text-xs font-medium text-sage-600 uppercase tracking-wider mb-1">
                      Expected Impressions
                    </div>
                    <p className="font-body text-sm text-sage-800">{entry.expected_impressions}</p>
                  </div>
                  <div className="px-5 py-3 bg-sage-50/40">
                    <div className="font-display text-xs font-medium text-sage-700 uppercase tracking-wider mb-1">
                      Prepared Response
                    </div>
                    <p className="font-body text-sm text-sage-800">{entry.prepared_virtue_response}</p>
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
