'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { authFetch } from '@/lib/auth-fetch'
import type { User } from '@supabase/supabase-js'

/**
 * Gap 1 — Real-Time Journal Feed
 *
 * Captures the live causal sequence (impression → assent → action)
 * before rationalisation sets in. Displays entries chronologically
 * with lag metrics.
 *
 * Done criteria:
 * - Entry form live with three required fields
 * - Timestamp captured on every entry
 * - Feed view renders chronologically
 * - Lag metric calculated and displayed
 * - At least one entry successfully created and retrieved via API
 */

interface JournalEntry {
  id: string
  impression: string
  assent: string
  action: string
  event_timestamp: string | null
  created_at: string
  lag_hours: number | null
}

interface LagStats {
  total_entries: number
  avg_lag_hours: number | null
  pct_under_24h: number | null
  first_entry: string | null
  latest_entry: string | null
}

export default function JournalFeedPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [stats, setStats] = useState<LagStats | null>(null)
  const [totalEntries, setTotalEntries] = useState(0)

  // Form state
  const [impression, setImpression] = useState('')
  const [assent, setAssent] = useState('')
  const [action, setAction] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [eventTime, setEventTime] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [showForm, setShowForm] = useState(true)

  // Load user and entries
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
    try {
      const res = await authFetch('/api/mentor/journal-feed?limit=50')
      if (res.ok) {
        const data = await res.json()
        setEntries(data.entries)
        setStats(data.stats)
        setTotalEntries(data.total)
      }
    } catch (err) {
      console.error('Failed to fetch entries:', err)
    }
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!impression.trim() || !assent.trim() || !action.trim() || submitting) return
    setSubmitting(true)
    setSubmitMessage(null)

    // Build event_timestamp from date + time if provided
    let eventTimestamp: string | undefined
    if (eventDate) {
      const timeStr = eventTime || '12:00'
      eventTimestamp = new Date(`${eventDate}T${timeStr}`).toISOString()
    }

    try {
      const res = await authFetch('/api/mentor/journal-feed', {
        method: 'POST',
        body: JSON.stringify({
          impression: impression.trim(),
          assent: assent.trim(),
          action: action.trim(),
          event_timestamp: eventTimestamp,
        }),
      })

      if (res.ok) {
        setImpression('')
        setAssent('')
        setAction('')
        setEventDate('')
        setEventTime('')
        setSubmitMessage({ type: 'success', text: 'Entry captured.' })
        setShowForm(false)
        await fetchEntries()
      } else {
        const err = await res.json()
        setSubmitMessage({ type: 'error', text: err.error || 'Failed to save entry' })
      }
    } catch {
      setSubmitMessage({ type: 'error', text: 'Network error — please try again' })
    }
    setSubmitting(false)
  }

  function formatLag(hours: number | null): string {
    if (hours === null) return '—'
    if (hours < 1) return `${Math.round(hours * 60)}m`
    if (hours < 24) return `${Math.round(hours)}h`
    return `${Math.round(hours / 24)}d`
  }

  function formatDate(iso: string): string {
    const d = new Date(iso)
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  function formatTime(iso: string): string {
    const d = new Date(iso)
    return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center text-sage-500 font-body">Loading journal feed...</div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-2xl font-semibold text-sage-900 mb-1">
          Real-Time Journal Feed
        </h1>
        <p className="font-body text-sage-500">
          Capture the causal sequence — impression, assent, action — before rationalisation sets in.
        </p>
      </div>

      {/* Lag Stats Banner */}
      {stats && stats.total_entries > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white border border-sage-200 rounded-lg p-4 text-center">
            <div className="font-display text-2xl font-semibold text-sage-900">
              {stats.total_entries}
            </div>
            <div className="font-body text-xs text-sage-500 mt-1">Total entries</div>
          </div>
          <div className="bg-white border border-sage-200 rounded-lg p-4 text-center">
            <div className="font-display text-2xl font-semibold text-sage-900">
              {stats.avg_lag_hours !== null ? formatLag(stats.avg_lag_hours) : '—'}
            </div>
            <div className="font-body text-xs text-sage-500 mt-1">Avg lag (event → record)</div>
          </div>
          <div className="bg-white border border-sage-200 rounded-lg p-4 text-center">
            <div className={`font-display text-2xl font-semibold ${
              stats.pct_under_24h !== null && stats.pct_under_24h >= 60
                ? 'text-green-700'
                : 'text-sage-900'
            }`}>
              {stats.pct_under_24h !== null ? `${stats.pct_under_24h}%` : '—'}
            </div>
            <div className="font-body text-xs text-sage-500 mt-1">
              Under 24h {stats.pct_under_24h !== null && stats.pct_under_24h >= 60 && '(target met)'}
            </div>
          </div>
        </div>
      )}

      {/* Entry Form */}
      {showForm ? (
        <form onSubmit={handleSubmit} className="bg-white border border-sage-200 rounded-lg p-6 mb-8">
          <h2 className="font-display text-lg font-medium text-sage-800 mb-4">
            New Entry
          </h2>

          {/* Impression */}
          <div className="mb-4">
            <label className="font-display text-sm font-medium text-sage-600 block mb-1">
              Impression
              <span className="font-body text-xs text-sage-400 ml-2">
                What appeared to be happening?
              </span>
            </label>
            <textarea
              value={impression}
              onChange={(e) => setImpression(e.target.value)}
              placeholder="Describe the impression as it appeared — what triggered this?"
              rows={3}
              className="w-full border border-sage-200 rounded-lg p-3 font-body text-sage-800 placeholder:text-sage-300 focus:outline-none focus:ring-2 focus:ring-sage-300 resize-y text-sm"
              required
            />
          </div>

          {/* Assent */}
          <div className="mb-4">
            <label className="font-display text-sm font-medium text-sage-600 block mb-1">
              Assent
              <span className="font-body text-xs text-sage-400 ml-2">
                What judgement did you make?
              </span>
            </label>
            <textarea
              value={assent}
              onChange={(e) => setAssent(e.target.value)}
              placeholder="What did you tell yourself was true? What judgement did you assent to?"
              rows={3}
              className="w-full border border-sage-200 rounded-lg p-3 font-body text-sage-800 placeholder:text-sage-300 focus:outline-none focus:ring-2 focus:ring-sage-300 resize-y text-sm"
              required
            />
          </div>

          {/* Action */}
          <div className="mb-4">
            <label className="font-display text-sm font-medium text-sage-600 block mb-1">
              Action
              <span className="font-body text-xs text-sage-400 ml-2">
                What did you do as a result?
              </span>
            </label>
            <textarea
              value={action}
              onChange={(e) => setAction(e.target.value)}
              placeholder="What action followed from the judgement? What did you actually do?"
              rows={3}
              className="w-full border border-sage-200 rounded-lg p-3 font-body text-sage-800 placeholder:text-sage-300 focus:outline-none focus:ring-2 focus:ring-sage-300 resize-y text-sm"
              required
            />
          </div>

          {/* Event timestamp */}
          <div className="mb-6 flex gap-4">
            <div className="flex-1">
              <label className="font-display text-sm font-medium text-sage-600 block mb-1">
                When did this happen?
                <span className="font-body text-xs text-sage-400 ml-2">Optional — enables lag tracking</span>
              </label>
              <input
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="w-full border border-sage-200 rounded-lg p-3 font-body text-sage-800 focus:outline-none focus:ring-2 focus:ring-sage-300 text-sm"
              />
            </div>
            <div className="w-32">
              <label className="font-display text-sm font-medium text-sage-600 block mb-1">Time</label>
              <input
                type="time"
                value={eventTime}
                onChange={(e) => setEventTime(e.target.value)}
                className="w-full border border-sage-200 rounded-lg p-3 font-body text-sage-800 focus:outline-none focus:ring-2 focus:ring-sage-300 text-sm"
              />
            </div>
          </div>

          {/* Submit message */}
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
              disabled={!impression.trim() || !assent.trim() || !action.trim() || submitting}
              className="px-6 py-2 bg-sage-500 text-white font-display text-sm rounded hover:bg-sage-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Saving...' : 'Capture Entry'}
            </button>
          </div>
        </form>
      ) : (
        <div className="mb-8">
          {submitMessage?.type === 'success' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4 flex items-center justify-between">
              <span className="font-body text-sm text-green-700">{submitMessage.text}</span>
              <button
                onClick={() => { setShowForm(true); setSubmitMessage(null) }}
                className="font-body text-sm text-sage-500 hover:text-sage-700"
              >
                New entry
              </button>
            </div>
          )}
          {!submitMessage && (
            <button
              onClick={() => setShowForm(true)}
              className="w-full border-2 border-dashed border-sage-200 rounded-lg p-4 text-center font-body text-sm text-sage-400 hover:border-sage-400 hover:text-sage-600 transition-colors"
            >
              + New entry
            </button>
          )}
        </div>
      )}

      {/* Feed */}
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-display text-lg font-medium text-sage-800">
            Feed
            {totalEntries > 0 && (
              <span className="font-body text-sm text-sage-400 ml-2">
                ({totalEntries} {totalEntries === 1 ? 'entry' : 'entries'})
              </span>
            )}
          </h2>
        </div>

        {entries.length === 0 ? (
          <div className="bg-sage-50 border border-sage-200 rounded-lg p-8 text-center">
            <p className="font-body text-sage-500">
              No entries yet. Capture your first impression → assent → action sequence above.
            </p>
          </div>
        ) : (
          entries.map((entry) => (
            <div key={entry.id} className="bg-white border border-sage-200 rounded-lg overflow-hidden">
              {/* Entry header with timestamps */}
              <div className="px-5 py-3 border-b border-sage-100 flex items-center justify-between">
                <div className="font-body text-xs text-sage-400">
                  Recorded {formatDate(entry.created_at)} at {formatTime(entry.created_at)}
                  {entry.event_timestamp && (
                    <span className="ml-3">
                      Event: {formatDate(entry.event_timestamp)} at {formatTime(entry.event_timestamp)}
                    </span>
                  )}
                </div>
                {entry.lag_hours !== null && (
                  <span className={`font-display text-xs font-medium px-2 py-0.5 rounded-full ${
                    entry.lag_hours < 24
                      ? 'bg-green-50 text-green-700'
                      : entry.lag_hours < 48
                      ? 'bg-yellow-50 text-yellow-700'
                      : 'bg-red-50 text-red-700'
                  }`}>
                    {formatLag(entry.lag_hours)} lag
                  </span>
                )}
              </div>

              {/* Three-part causal sequence */}
              <div className="divide-y divide-sage-50">
                <div className="px-5 py-3">
                  <div className="font-display text-xs font-medium text-sage-400 uppercase tracking-wider mb-1">
                    Impression
                  </div>
                  <p className="font-body text-sm text-sage-800 leading-relaxed">{entry.impression}</p>
                </div>
                <div className="px-5 py-3 bg-amber-50/30">
                  <div className="font-display text-xs font-medium text-amber-700/60 uppercase tracking-wider mb-1">
                    Assent
                  </div>
                  <p className="font-body text-sm text-sage-800 leading-relaxed">{entry.assent}</p>
                </div>
                <div className="px-5 py-3">
                  <div className="font-display text-xs font-medium text-sage-400 uppercase tracking-wider mb-1">
                    Action
                  </div>
                  <p className="font-body text-sm text-sage-800 leading-relaxed">{entry.action}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
