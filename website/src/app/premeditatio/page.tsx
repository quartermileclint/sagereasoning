'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { authFetch } from '@/lib/auth-fetch'
import type { User } from '@supabase/supabase-js'

/**
 * Gap 3 — Premeditatio Scheduling
 *
 * Scheduled Monday morning reflections targeting avoidance and catastrophising.
 * Three required fields per response. Quality gate flags generic responses.
 *
 * Done criteria:
 * - Weekly Monday prompt delivered (mechanism confirmed)
 * - Response form live with three required fields
 * - Quality gate flags generic responses
 * - Cross-reference to passion log entry functional
 * - Engagement metric tracked and queryable
 */

interface PremeditEntry {
  id: string
  anticipated_event: string
  false_impression: string
  correct_judgement: string
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

export default function PremeditatioPage() {
  const [_user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [entries, setEntries] = useState<PremeditEntry[]>([])
  const [engagement, setEngagement] = useState<EngagementData[]>([])
  const [showEngagement, setShowEngagement] = useState(false)

  // Form state
  const [showForm, setShowForm] = useState(false)
  const [anticipatedEvent, setAnticipatedEvent] = useState('')
  const [falseImpression, setFalseImpression] = useState('')
  const [correctJudgement, setCorrectJudgement] = useState('')
  const [avoidanceTag, setAvoidanceTag] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitResult, setSubmitResult] = useState<{
    type: 'success' | 'error' | 'warning'
    text: string
  } | null>(null)

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!anticipatedEvent.trim() || !falseImpression.trim() || !correctJudgement.trim() || submitting) return
    setSubmitting(true)
    setSubmitResult(null)

    try {
      const res = await authFetch('/api/mentor/premeditatio', {
        method: 'POST',
        body: JSON.stringify({
          anticipated_event: anticipatedEvent.trim(),
          false_impression: falseImpression.trim(),
          correct_judgement: correctJudgement.trim(),
          avoidance_behaviour_tag: avoidanceTag.trim() || undefined,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        if (data.quality_gate?.is_generic) {
          setSubmitResult({
            type: 'warning',
            text: data.quality_gate.message,
          })
        } else {
          setSubmitResult({
            type: 'success',
            text: 'Premeditatio recorded. Quality gate passed.',
          })
        }
        setAnticipatedEvent('')
        setFalseImpression('')
        setCorrectJudgement('')
        setAvoidanceTag('')
        setShowForm(false)
        await fetchEntries()
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

  // Check if it's Monday (prompt day)
  const isPromptDay = new Date().getDay() === 1

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center text-sage-500 font-body">Loading premeditatio...</div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-semibold text-sage-900 mb-1">
            Premeditatio Malorum
          </h1>
          <p className="font-body text-sage-500">
            Weekly practice: anticipate what&apos;s ahead, identify the false impression,
            hold the correct judgement in advance.
          </p>
        </div>
        <button
          onClick={async () => {
            setShowEngagement(!showEngagement)
            if (!showEngagement && engagement.length === 0) await fetchEngagement()
          }}
          className="font-body text-sm text-sage-500 hover:text-sage-700 transition-colors"
        >
          {showEngagement ? 'Hide stats' : 'Engagement'}
        </button>
      </div>

      {/* Monday prompt banner */}
      {isPromptDay && !showForm && (
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
              onClick={() => setShowForm(true)}
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
            <p className="font-body text-sm text-sage-500">No data yet.</p>
          ) : (
            <div className="space-y-2">
              {engagement.map((month) => (
                <div key={month.month_start} className="flex items-center justify-between">
                  <span className="font-body text-sm text-sage-600">
                    {new Date(month.month_start).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
                  </span>
                  <div className="flex items-center gap-4 font-body text-xs text-sage-500">
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
          <h2 className="font-display text-lg font-medium text-sage-800 mb-4">
            This Week&apos;s Premeditatio
          </h2>

          {/* Anticipated event */}
          <div className="mb-4">
            <label className="font-display text-sm font-medium text-sage-600 block mb-1">
              Anticipated event
              <span className="font-body text-xs text-sage-400 ml-2">
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
              <span className="font-body text-xs text-sage-400 ml-2">
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
              <span className="font-body text-xs text-sage-400 ml-2">
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
              <span className="font-body text-xs text-sage-400 ml-2">
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

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="font-body text-sm text-sage-400 hover:text-sage-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!anticipatedEvent.trim() || !falseImpression.trim() || !correctJudgement.trim() || submitting}
              className="px-6 py-2 bg-sage-500 text-white font-display text-sm rounded hover:bg-sage-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Saving...' : 'Submit Premeditatio'}
            </button>
          </div>
        </form>
      ) : !isPromptDay && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full border-2 border-dashed border-sage-200 rounded-lg p-4 text-center font-body text-sm text-sage-400 hover:border-sage-400 hover:text-sage-600 transition-colors mb-6"
        >
          + New premeditatio (off-schedule)
        </button>
      )}

      {/* Entries feed */}
      <div className="space-y-4">
        <h2 className="font-display text-lg font-medium text-sage-800">
          Past Entries
          {entries.length > 0 && (
            <span className="font-body text-sm text-sage-400 ml-2">({entries.length})</span>
          )}
        </h2>

        {entries.length === 0 ? (
          <div className="bg-sage-50 border border-sage-200 rounded-lg p-8 text-center">
            <p className="font-body text-sage-500">
              No premeditatio entries yet. The weekly prompt arrives on Monday mornings.
            </p>
          </div>
        ) : (
          entries.map((entry) => (
            <div key={entry.id} className="bg-white border border-sage-200 rounded-lg overflow-hidden">
              <div className="px-5 py-3 border-b border-sage-100 flex items-center justify-between">
                <span className="font-body text-xs text-sage-400">
                  {formatDate(entry.created_at)}
                </span>
                <div className="flex items-center gap-2">
                  {entry.is_generic && (
                    <span className="text-xs font-body px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">
                      Generic — revise
                    </span>
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
                      className="text-xs font-body px-2 py-0.5 rounded-full border border-sage-200 text-sage-500 hover:border-green-300 hover:text-green-600 transition-colors"
                    >
                      Mark changed
                    </button>
                  ) : null}
                </div>
              </div>

              <div className="divide-y divide-sage-50">
                <div className="px-5 py-3">
                  <div className="font-display text-xs font-medium text-sage-400 uppercase tracking-wider mb-1">
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
                  <div className="font-display text-xs font-medium text-sage-400 uppercase tracking-wider mb-1">
                    Correct Judgement
                  </div>
                  <p className="font-body text-sm text-sage-800">{entry.correct_judgement}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
