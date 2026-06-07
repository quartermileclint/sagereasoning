'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { authFetch } from '@/lib/auth-fetch'
import type { User } from '@supabase/supabase-js'

/**
 * Gap 5 — Oikeiosis Extension Tracking
 *
 * Quarterly reflections on expanding the moral circle.
 * Philodoxia flag automatically set when reputational return = yes.
 *
 * Done criteria:
 * - Quarterly prompt delivered on schedule
 * - Reflection form live with required fields
 * - Philodoxia flag applied automatically when reputational return = yes
 * - Stage progression view renders across quarters
 * - Cross-reference to passion log functional
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

const STAGES = [
  { id: 'self', label: 'Self', description: 'Concern for own character and virtue' },
  { id: 'household', label: 'Household', description: 'Family, close friends, those in daily life' },
  { id: 'community', label: 'Community', description: 'Neighbours, colleagues, local community' },
  { id: 'humanity', label: 'Humanity', description: 'Fellow citizens, strangers, those far away' },
  { id: 'cosmic', label: 'Cosmic', description: 'All rational beings, the whole of nature' },
] as const

const STAGE_COLORS: Record<string, string> = {
  self: '#b85c38',
  household: '#9b7d4a',
  community: '#7d9468',
  humanity: '#5b7fa5',
  cosmic: '#7b6fa5',
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
  const [reflections, setReflections] = useState<OikeiosisReflection[]>([])
  const [progression, setProgression] = useState<StageProgression[]>([])
  const [showProgression, setShowProgression] = useState(false)

  // Form state
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

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        window.location.href = '/auth'
        return
      }
      setUser(user)
      await fetchReflections()
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!stage || !actionDescription.trim() || submitting) return
    setSubmitting(true)
    setSubmitResult(null)

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

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center text-sage-500 font-body">Loading oikeiosis tracker...</div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-semibold text-sage-900 mb-1">
            Oikeiosis Extension
          </h1>
          <p className="font-body text-sage-500">
            Quarterly reflection: expanding the circle of concern from self outward.
          </p>
        </div>
        <button
          onClick={async () => {
            setShowProgression(!showProgression)
            if (!showProgression && progression.length === 0) await fetchProgression()
          }}
          className="font-body text-sm text-sage-500 hover:text-sage-700 transition-colors"
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
                <span className="font-body text-[10px] text-sage-500 mt-1">{s.label}</span>
              </div>
              {i < STAGES.length - 1 && (
                <div className="w-4 h-px bg-sage-200 mx-1" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Quarterly prompt banner */}
      {isPromptDay && !showForm && (
        <div className="bg-sage-50 border border-sage-300 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-display text-sm font-medium text-sage-800">
                Quarterly reflection — Q{getCurrentQuarter()} {getCurrentYear()}
              </span>
              <p className="font-body text-xs text-sage-600 mt-1">
                What actions have you taken this quarter that extended concern beyond the household circle?
              </p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-sage-500 text-white font-display text-sm rounded hover:bg-sage-600 transition-colors"
            >
              Reflect
            </button>
          </div>
        </div>
      )}

      {/* Stage progression view */}
      {showProgression && (
        <div className="bg-white border border-sage-200 rounded-lg p-5 mb-6">
          <h3 className="font-display text-sm font-medium text-sage-700 mb-3">Stage Progression</h3>
          {progression.length === 0 ? (
            <p className="font-body text-sm text-sage-500">No data yet — complete quarterly reflections to see progression.</p>
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
                        <div className="font-body text-[10px] text-sage-500">{d.stage}</div>
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
                  <div className="font-body text-[9px] text-sage-400 mt-0.5 leading-tight">{s.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Action description */}
          <div className="mb-4">
            <label className="font-display text-sm font-medium text-sage-600 block mb-1">
              Action taken
              <span className="font-body text-xs text-sage-400 ml-2">
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
              <span className="font-body text-xs text-sage-400 ml-2">
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
                      : 'border-sage-200 text-sage-500 hover:border-sage-300'
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
              onClick={() => setShowForm(false)}
              className="font-body text-sm text-sage-400 hover:text-sage-600"
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
          onClick={() => setShowForm(true)}
          className="w-full border-2 border-dashed border-sage-200 rounded-lg p-4 text-center font-body text-sm text-sage-400 hover:border-sage-400 hover:text-sage-600 transition-colors mb-6"
        >
          + New quarterly reflection
        </button>
      )}

      {/* Reflections feed */}
      <div className="space-y-3 mt-6">
        <h2 className="font-display text-lg font-medium text-sage-800">
          Past Reflections
          {reflections.length > 0 && (
            <span className="font-body text-sm text-sage-400 ml-2">({reflections.length})</span>
          )}
        </h2>

        {reflections.length === 0 ? (
          <div className="bg-sage-50 border border-sage-200 rounded-lg p-8 text-center">
            <p className="font-body text-sage-500">
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
                  <span className="font-body text-xs text-sage-400">
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
  )
}
