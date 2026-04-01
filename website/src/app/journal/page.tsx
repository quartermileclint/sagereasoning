'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { trackEvent } from '@/lib/analytics'
import { JOURNAL_ENTRIES, PHASES, TOTAL_JOURNAL_DAYS, getJournalEntry, getPhaseForDay } from '@/lib/journal-content'
import type { User } from '@supabase/supabase-js'
import { authFetch } from '@/lib/auth-fetch'

type StorageMode = 'cloud' | 'local' | null

interface JournalProgress {
  currentDay: number
  completedDays: number[]
  streak: number
  storageMode: StorageMode
}

interface LocalEntry {
  day: number
  text: string
  completedAt: string
}

const VIRTUE_COLORS: Record<string, string> = {
  wisdom: '#7d9468',
  justice: '#5b7fa5',
  courage: '#b85c38',
  temperance: '#6b8f71',
}

export default function JournalPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [storageMode, setStorageMode] = useState<StorageMode>(null)
  const [showSetup, setShowSetup] = useState(false)
  const [currentDay, setCurrentDay] = useState(1)
  const [completedDays, setCompletedDays] = useState<number[]>([])
  const [reflectionText, setReflectionText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [viewingDay, setViewingDay] = useState<number | null>(null)
  const [pastEntry, setPastEntry] = useState<string | null>(null)
  const [showCurriculum, setShowCurriculum] = useState(false)

  // ─── Load user and journal state ───
  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        window.location.href = '/auth'
        return
      }
      setUser(user)

      // Check if user has a storage preference saved
      const savedMode = localStorage.getItem(`journal_storage_${user.id}`) as StorageMode
      if (savedMode) {
        setStorageMode(savedMode)
        await loadProgress(user.id, savedMode)
      } else {
        // Check if they have any cloud entries (returning user)
        const { count } = await supabase
          .from('journal_entries')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)

        if (count && count > 0) {
          setStorageMode('cloud')
          localStorage.setItem(`journal_storage_${user.id}`, 'cloud')
          await loadProgress(user.id, 'cloud')
        } else {
          // Check local storage
          const localEntries = getLocalEntries(user.id)
          if (localEntries.length > 0) {
            setStorageMode('local')
            localStorage.setItem(`journal_storage_${user.id}`, 'local')
            loadLocalProgress(user.id)
          } else {
            setShowSetup(true)
          }
        }
      }
      setLoading(false)
    }
    load()
  }, [])

  // ─── Local storage helpers ───
  function getLocalEntries(userId: string): LocalEntry[] {
    try {
      const raw = localStorage.getItem(`journal_entries_${userId}`)
      return raw ? JSON.parse(raw) : []
    } catch { return [] }
  }

  function saveLocalEntry(userId: string, day: number, text: string) {
    const entries = getLocalEntries(userId)
    entries.push({ day, text, completedAt: new Date().toISOString() })
    localStorage.setItem(`journal_entries_${userId}`, JSON.stringify(entries))
  }

  function loadLocalProgress(userId: string) {
    const entries = getLocalEntries(userId)
    const days = entries.map(e => e.day).sort((a, b) => a - b)
    setCompletedDays(days)
    setCurrentDay(days.length > 0 ? Math.max(...days) + 1 : 1)
  }

  // ─── Cloud progress loader ───
  async function loadProgress(userId: string, mode: StorageMode) {
    if (mode === 'local') {
      loadLocalProgress(userId)
      return
    }

    const { data } = await supabase
      .from('journal_entries')
      .select('day_number, created_at')
      .eq('user_id', userId)
      .order('day_number', { ascending: true })

    if (data) {
      const days = data.map(d => d.day_number)
      setCompletedDays(days)
      const nextDay = days.length > 0 ? Math.max(...days) + 1 : 1
      setCurrentDay(Math.min(nextDay, TOTAL_JOURNAL_DAYS))
    }
  }

  // ─── Storage setup choice ───
  function handleStorageChoice(mode: 'cloud' | 'local') {
    if (!user) return
    setStorageMode(mode)
    localStorage.setItem(`journal_storage_${user.id}`, mode)
    setShowSetup(false)
    setCurrentDay(1)
    trackEvent({ event_type: 'journal_entry_completed' as any, metadata: { action: 'setup', storage_mode: mode } })
  }

  // ─── Submit journal entry ───
  async function handleSubmit() {
    if (!user || !reflectionText.trim() || submitting) return
    setSubmitting(true)

    const dayToSubmit = viewingDay || currentDay

    try {
      if (storageMode === 'cloud') {
        // Save to Supabase
        const res = await authFetch('/api/journal', {
          method: 'POST',
          body: JSON.stringify({
            day_number: dayToSubmit,
            phase_number: getPhaseForDay(dayToSubmit)?.number || 1,
            reflection_text: reflectionText.trim(),
          }),
        })

        if (!res.ok) {
          const err = await res.json()
          alert(err.error || 'Failed to save entry')
          setSubmitting(false)
          return
        }
      } else {
        // Save locally
        saveLocalEntry(user.id, dayToSubmit, reflectionText.trim())

        // Still record completion flag on server for calendar stamps
        await authFetch('/api/journal', {
          method: 'POST',
          body: JSON.stringify({
            day_number: dayToSubmit,
            phase_number: getPhaseForDay(dayToSubmit)?.number || 1,
            reflection_text: '__local__', // flag: text stored locally
          }),
        })
      }

      // Update state
      const newCompleted = [...completedDays, dayToSubmit].sort((a, b) => a - b)
      setCompletedDays(newCompleted)
      setCurrentDay(Math.min(dayToSubmit + 1, TOTAL_JOURNAL_DAYS))
      setSubmitted(true)
      setViewingDay(null)

      trackEvent({ event_type: 'journal_entry_completed' as any, metadata: { day: dayToSubmit, phase: getPhaseForDay(dayToSubmit)?.number } })
    } catch (err) {
      alert('Failed to save. Please try again.')
    }
    setSubmitting(false)
  }

  // ─── View a past entry ───
  async function viewPastEntry(day: number) {
    if (!user) return

    if (storageMode === 'local') {
      const entries = getLocalEntries(user.id)
      const entry = entries.find(e => e.day === day)
      setPastEntry(entry?.text || null)
    } else {
      const { data } = await supabase
        .from('journal_entries')
        .select('reflection_text')
        .eq('user_id', user.id)
        .eq('day_number', day)
        .single()

      setPastEntry(data?.reflection_text === '__local__' ? '(Stored locally on the device where you wrote it)' : data?.reflection_text || null)
    }
    setViewingDay(day)
    setSubmitted(false)
    setReflectionText('')
  }

  // ─── Start a new (uncompleted) entry ───
  function startEntry(day: number) {
    setViewingDay(null)
    setPastEntry(null)
    setCurrentDay(day)
    setReflectionText('')
    setSubmitted(false)
  }

  // ─── Loading state ───
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center text-sage-500 font-body">Loading your journal...</div>
      </div>
    )
  }

  // ─── Storage Setup Screen ───
  if (showSetup) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="font-display text-3xl font-semibold text-sage-900 mb-3">The Path of Progress</h1>
          <p className="font-body text-sage-600 text-lg">A 55-day Stoic journal for self-examination and growth</p>
        </div>

        <div className="bg-white border border-sage-200 rounded-lg p-8 mb-8">
          <h2 className="font-display text-xl font-medium text-sage-800 mb-2">Before you begin</h2>
          <p className="font-body text-sage-600 mb-6">
            This journal will ask you to reflect honestly on your life, your beliefs, and your character.
            That kind of honesty requires trust. Choose how you would like your written reflections stored:
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Cloud option */}
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
                Your reflections are saved securely to your account. You can access them from any device and
                review past entries anytime.
              </p>
              <ul className="font-body text-xs text-sage-500 space-y-1">
                <li>+ Syncs across devices</li>
                <li>+ Full history always available</li>
                <li>+ Calendar stamps and milestones</li>
              </ul>
            </button>

            {/* Local option */}
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
                Your written reflections stay on this device only — never sent to our servers.
                We only record that you completed each day, for calendar stamps.
              </p>
              <ul className="font-body text-xs text-sage-500 space-y-1">
                <li>+ Maximum privacy for your reflections</li>
                <li>+ Calendar stamps still work</li>
                <li>- Only accessible on this device</li>
                <li>- Clearing browser data removes entries</li>
              </ul>
            </button>
          </div>

          <p className="font-body text-xs text-sage-400 mt-6 text-center">
            You can change this later in your journal settings. Your entries are never scored or shared.
          </p>
        </div>

        {/* Preview of what's ahead */}
        <div className="bg-sage-50 border border-sage-200 rounded-lg p-6">
          <h3 className="font-display text-lg font-medium text-sage-800 mb-4">What to expect</h3>
          <div className="space-y-3">
            {PHASES.map(phase => (
              <div key={phase.number} className="flex items-start gap-3">
                <span className="font-display text-sm font-medium text-sage-400 w-16 shrink-0">
                  Phase {phase.number}
                </span>
                <div>
                  <span className="font-display text-sm font-medium text-sage-800">{phase.title}</span>
                  <span className="font-body text-sm text-sage-500 ml-2">({phase.days})</span>
                </div>
              </div>
            ))}
          </div>
          <p className="font-body text-sm text-sage-500 mt-4">
            55 days. One entry per day. Each day: read a teaching, reflect in writing.
          </p>
        </div>
      </div>
    )
  }

  // ─── Active entry ───
  const activeDay = viewingDay || currentDay
  const entry = getJournalEntry(activeDay)
  const phase = getPhaseForDay(activeDay)
  const isCompleted = completedDays.includes(activeDay)
  const isViewingPast = viewingDay !== null && completedDays.includes(viewingDay)
  const completionPercent = Math.round((completedDays.length / TOTAL_JOURNAL_DAYS) * 100)
  const allComplete = completedDays.length >= TOTAL_JOURNAL_DAYS

  // ─── Calculate streak ───
  const today = new Date().toISOString().slice(0, 10)
  // Streak would be computed from the calendar stamps — simplified here

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-semibold text-sage-900 mb-1">The Path of Progress</h1>
          <p className="font-body text-sage-500">
            {storageMode === 'local' ? (
              <span className="inline-flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Local storage — your reflections stay on this device
              </span>
            ) : (
              <span>Your reflections are saved to your account</span>
            )}
          </p>
        </div>
        <button
          onClick={() => setShowCurriculum(!showCurriculum)}
          className="font-body text-sm text-sage-500 hover:text-sage-700 transition-colors"
        >
          {showCurriculum ? 'Hide map' : 'View curriculum'}
        </button>
      </div>

      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="font-body text-sm text-sage-600">
            Day {completedDays.length} of {TOTAL_JOURNAL_DAYS} completed
          </span>
          <span className="font-body text-sm text-sage-500">{completionPercent}%</span>
        </div>
        <div className="h-2 bg-sage-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-sage-500 rounded-full transition-all duration-500"
            style={{ width: `${completionPercent}%` }}
          />
        </div>
        {phase && (
          <p className="font-body text-xs text-sage-400 mt-1">
            Phase {phase.number}: {phase.title}
          </p>
        )}
      </div>

      {/* Curriculum map (collapsible) */}
      {showCurriculum && (
        <div className="bg-white border border-sage-200 rounded-lg p-6 mb-8">
          <h3 className="font-display text-lg font-medium text-sage-800 mb-4">Curriculum Map</h3>
          {PHASES.map(p => {
            const [startStr, endStr] = p.days.split('–').map(Number)
            const phaseDays = Array.from({ length: endStr - startStr + 1 }, (_, i) => startStr + i)
            return (
              <div key={p.number} className="mb-4">
                <div className="font-display text-sm font-medium text-sage-700 mb-2">
                  Phase {p.number}: {p.title}
                  <span className="font-body text-xs text-sage-400 ml-2">Days {p.days}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {phaseDays.map(d => {
                    const done = completedDays.includes(d)
                    const isCurrent = d === currentDay && !viewingDay
                    const entryData = getJournalEntry(d)
                    return (
                      <button
                        key={d}
                        onClick={() => done ? viewPastEntry(d) : d <= currentDay ? startEntry(d) : null}
                        disabled={d > currentDay && !done}
                        className={`w-8 h-8 rounded text-xs font-body flex items-center justify-center transition-colors ${
                          done
                            ? 'bg-sage-500 text-white hover:bg-sage-600 cursor-pointer'
                            : isCurrent
                            ? 'bg-sage-200 text-sage-800 ring-2 ring-sage-400'
                            : d <= currentDay
                            ? 'bg-sage-100 text-sage-500 hover:bg-sage-200 cursor-pointer'
                            : 'bg-sage-50 text-sage-300 cursor-not-allowed'
                        }`}
                        title={entryData?.title || `Day ${d}`}
                      >
                        {d}
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* All complete state */}
      {allComplete && !viewingDay ? (
        <div className="bg-white border border-sage-200 rounded-lg p-8 text-center">
          <div className="text-4xl mb-4">&#x1F33F;</div>
          <h2 className="font-display text-2xl font-medium text-sage-800 mb-3">The Path Continues</h2>
          <p className="font-body text-sage-600 max-w-lg mx-auto mb-6">
            You have completed all 55 days of The Path of Progress. The person making progress never arrives — they continue.
            Review your past entries anytime by opening the curriculum map above.
          </p>

          {/* V3 Completion Assessment: Progress Dimensions */}
          <div className="bg-sage-50 border border-sage-200 rounded-lg p-6 max-w-lg mx-auto mb-6 text-left">
            <h3 className="font-display text-sm font-medium text-sage-700 mb-3">Self-Assessment: Four Dimensions of Progress</h3>
            <p className="font-body text-xs text-sage-500 mb-4">
              Reflect on where you stand across the four dimensions the Stoics used to measure moral progress.
            </p>
            <div className="space-y-3">
              <div>
                <span className="font-display text-xs font-medium text-sage-600">1. Reduction of Passions</span>
                <p className="font-body text-xs text-sage-500">Are fewer passions operative? Are they less intense than when you started?</p>
              </div>
              <div>
                <span className="font-display text-xs font-medium text-sage-600">2. Quality of Judgement</span>
                <p className="font-body text-xs text-sage-500">Is your understanding of what is genuinely good, bad, and indifferent more accurate?</p>
              </div>
              <div>
                <span className="font-display text-xs font-medium text-sage-600">3. Stability of Disposition</span>
                <p className="font-body text-xs text-sage-500">Does your commitment to virtue hold under pressure? How quickly do you recover after setbacks?</p>
              </div>
              <div>
                <span className="font-display text-xs font-medium text-sage-600">4. Expanding Circles of Concern</span>
                <p className="font-body text-xs text-sage-500">Are you increasingly taking account of obligations beyond yourself?</p>
              </div>
            </div>
          </div>

          <p className="font-body text-sm text-sage-500 italic">
            &ldquo;Waste no more time arguing about what a good man should be. Be one.&rdquo; — Marcus Aurelius
          </p>
        </div>
      ) : entry ? (
        <>
          {/* Entry card */}
          <div className="bg-white border border-sage-200 rounded-lg overflow-hidden mb-6">
            {/* Day header */}
            <div className="px-6 py-4 border-b border-sage-100 flex items-center justify-between">
              <div>
                <span className="font-display text-sm font-medium" style={{ color: entry.virtue ? VIRTUE_COLORS[entry.virtue] : '#78350F' }}>
                  Day {entry.day}
                </span>
                <h2 className="font-display text-xl font-medium text-sage-900">{entry.title}</h2>
              </div>
              {entry.virtue && (
                <span
                  className="font-body text-xs px-2 py-1 rounded-full"
                  style={{
                    color: VIRTUE_COLORS[entry.virtue],
                    backgroundColor: VIRTUE_COLORS[entry.virtue] + '15',
                  }}
                >
                  {entry.virtue.charAt(0).toUpperCase() + entry.virtue.slice(1)}
                </span>
              )}
            </div>

            {/* READ section */}
            <div className="px-6 py-5 bg-sage-50/50 border-b border-sage-100">
              <div className="font-display text-xs font-medium text-sage-400 uppercase tracking-wider mb-2">Read</div>
              <p className="font-body text-sage-800 leading-relaxed">{entry.teaching}</p>
            </div>

            {/* REFLECT section */}
            <div className="px-6 py-5" style={{ backgroundColor: '#FEF3C720' }}>
              <div className="font-display text-xs font-medium uppercase tracking-wider mb-2" style={{ color: '#78350F' }}>Reflect</div>
              <p className="font-body text-sage-700 leading-relaxed italic">{entry.question}</p>
            </div>
          </div>

          {/* Writing area or past entry view */}
          {isViewingPast && pastEntry ? (
            <div className="bg-white border border-sage-200 rounded-lg p-6 mb-6">
              <div className="flex items-center justify-between mb-3">
                <span className="font-display text-sm font-medium text-sage-500">Your reflection</span>
                <button
                  onClick={() => { setViewingDay(null); setPastEntry(null); setReflectionText('') }}
                  className="font-body text-sm text-sage-400 hover:text-sage-600"
                >
                  Back to current day
                </button>
              </div>
              <p className="font-body text-sage-700 whitespace-pre-wrap">{pastEntry}</p>
            </div>
          ) : !isCompleted ? (
            <div className="bg-white border border-sage-200 rounded-lg p-6 mb-6">
              {submitted ? (
                <div className="text-center py-8">
                  <div className="text-2xl mb-3">&#x2713;</div>
                  <h3 className="font-display text-lg font-medium text-sage-800 mb-2">Entry saved</h3>
                  <p className="font-body text-sage-500 mb-4">
                    Day {activeDay} complete. A calendar stamp has been earned for today.
                  </p>
                  {activeDay < TOTAL_JOURNAL_DAYS && (
                    <p className="font-body text-sm text-sage-400">
                      Day {activeDay + 1} will be available tomorrow.
                    </p>
                  )}
                </div>
              ) : (
                <>
                  <label className="font-display text-sm font-medium text-sage-600 block mb-2">
                    Your reflection
                  </label>
                  <textarea
                    value={reflectionText}
                    onChange={(e) => setReflectionText(e.target.value)}
                    placeholder="Take your time. Write honestly. No one scores this."
                    rows={10}
                    className="w-full border border-sage-200 rounded-lg p-4 font-body text-sage-800 placeholder:text-sage-300 focus:outline-none focus:ring-2 focus:ring-sage-300 resize-y"
                  />
                  <div className="flex items-center justify-between mt-4">
                    <span className="font-body text-xs text-sage-400">
                      {reflectionText.trim().split(/\s+/).filter(Boolean).length} words
                    </span>
                    <button
                      onClick={handleSubmit}
                      disabled={!reflectionText.trim() || submitting}
                      className="px-6 py-2 bg-sage-500 text-white font-display text-sm rounded hover:bg-sage-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? 'Saving...' : 'Complete Entry'}
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="text-center py-4">
              <button
                onClick={() => { setViewingDay(null); setPastEntry(null) }}
                className="font-body text-sm text-sage-400 hover:text-sage-600"
              >
                Back to current day
              </button>
            </div>
          )}
        </>
      ) : null}

      {/* Navigation between days */}
      {!allComplete && (
        <div className="flex justify-between items-center text-sm font-body">
          <button
            onClick={() => {
              const prev = activeDay - 1
              if (prev >= 1) {
                completedDays.includes(prev) ? viewPastEntry(prev) : startEntry(prev)
              }
            }}
            disabled={activeDay <= 1}
            className="text-sage-400 hover:text-sage-600 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            &larr; Previous day
          </button>
          <button
            onClick={() => {
              const next = activeDay + 1
              if (next <= currentDay) {
                completedDays.includes(next) ? viewPastEntry(next) : startEntry(next)
              }
            }}
            disabled={activeDay >= currentDay}
            className="text-sage-400 hover:text-sage-600 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Next day &rarr;
          </button>
        </div>
      )}
    </div>
  )
}
