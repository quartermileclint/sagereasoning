'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { VIRTUE_DISPLAY } from '@/lib/stoic-brain'
import { PROXIMITY_COLORS, ROOT_PASSION_ENGLISH, resolvePassionImage } from '@/lib/brand-display'

/**
 * FIELD NAMES HERE MUST MATCH src/app/api/practice-calendar/route.ts EXACTLY.
 *
 * They didn't (2026-08-02 fix): this interface named `strongest_virtue` and
 * `virtues_demonstrated` — fields the API has never returned (it returns
 * `strongest_domain` and `virtue_domains_engaged`, matching the DB column
 * name used everywhere else in the codebase, e.g. /score's
 * `virtue_quality.virtue_domains_engaged`). Every active day's strongest-virtue
 * lookup silently resolved to nothing, so it rendered as a bare, clickable grey
 * number indistinguishable from an empty day — and clicking it threw on
 * `activity.virtues_demonstrated.map(...)` (undefined), which is exactly what
 * produced an application-error page instead of the day's detail.
 */
interface DayActivity {
  type: 'action' | 'reflection' | 'journal'
  description?: string
  katorthoma_proximity: 'reflexive' | 'habitual' | 'deliberate' | 'principled' | 'sage_like'
  virtue_domains_engaged: string[]
  // A union, not one shape — action_evaluations_v3 rows carry {id, name,
  // root_passion}; reflections rows carry {sub_species, root_passion,
  // false_judgement}, no id/name at all. Must match
  // src/app/api/practice-calendar/route.ts's DayActivity type EXACTLY (see
  // practice-calendar-api-contract.test.ts).
  passions_detected?: Array<{
    id?: string
    name?: string
    sub_species?: string
    root_passion: string
    false_judgement?: string
  }>
}

interface DayData {
  virtues: string[]
  strongest_domain: string | null
  stamp_earned: boolean
  // A day can be genuinely active with no proximity contribution at all — a
  // journal-only day, for instance. The API types this as nullable; this
  // interface previously didn't, which is fine for the button branches below
  // (they check dayData/strongestVirtue first) but was a latent type lie.
  best_proximity: 'reflexive' | 'habitual' | 'deliberate' | 'principled' | 'sage_like' | null
  activities: DayActivity[]
}

interface CalendarData {
  month: string
  days: Record<string, DayData>
}

interface PracticeCalendarProps {
  userId: string
}

// Proximity label mapping for display
const PROXIMITY_LABELS: Record<string, string> = {
  reflexive: 'Reflexive',
  habitual: 'Habitual',
  deliberate: 'Deliberate',
  principled: 'Principled',
  sage_like: 'Sage-Like',
}

// Was `activity.type === 'action' ? 'Action' : 'Reflection'` — a two-way
// ternary against a three-value type, so every journal entry was mislabelled
// "Reflection" in the day-detail panel.
const ACTIVITY_TYPE_LABEL: Record<DayActivity['type'], string> = {
  action: 'Action',
  reflection: 'Reflection',
  journal: 'Journal',
}

// PROXIMITY_COLORS is now imported from stoic-brain.ts — the single canonical
// palette (brand-2026-07 proposal §2.1/§2.4). Previously an independent copy
// (whose principled/deliberate values were, in fact, identical by accident).

// Virtue metadata for quick lookup
const VIRTUE_MAP = Object.fromEntries(VIRTUE_DISPLAY.map(v => [v.id, v]))

export default function PracticeCalendar({ userId }: PracticeCalendarProps) {
  const [currentDate, setCurrentDate] = useState(() => new Date())
  const [calendarData, setCalendarData] = useState<CalendarData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedDay, setSelectedDay] = useState<string | null>(null)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth() // 0-indexed
  const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`

  useEffect(() => {
    async function fetchCalendar() {
      setLoading(true)

      // Get session token for auth
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token

      const res = await fetch(`/api/practice-calendar?user_id=${userId}&month=${monthStr}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })

      if (res.ok) {
        const data = await res.json()
        setCalendarData(data)
      }
      setLoading(false)
    }

    fetchCalendar()
  }, [userId, monthStr])

  // Calendar grid calculations
  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)
  const daysInMonth = lastDayOfMonth.getDate()
  const startDayOfWeek = firstDayOfMonth.getDay() // 0 = Sunday

  // Shift to Monday start: Mon=0, Tue=1, ... Sun=6
  const startOffset = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1

  const today = new Date()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ]

  function navigateMonth(delta: number) {
    setSelectedDay(null)
    setCurrentDate(prev => {
      const d = new Date(prev)
      d.setMonth(d.getMonth() + delta)
      return d
    })
  }

  function getDayStr(day: number): string {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

  function getDayData(day: number): DayData | null {
    if (!calendarData) return null
    return calendarData.days[getDayStr(day)] || null
  }

  // Count active practice days and stamped days this month
  const activeDays = calendarData ? Object.keys(calendarData.days).length : 0
  const stampedDays = calendarData
    ? Object.values(calendarData.days).filter(d => d.stamp_earned).length
    : 0

  // Selected day details
  const selectedDayData = selectedDay && calendarData ? calendarData.days[selectedDay] : null

  return (
    <div className="bg-white/60 border border-sage-200 rounded-lg p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-xl font-medium text-sage-800">Practice Calendar</h2>
          <p className="font-body text-sm text-sage-500 mt-1">
            {activeDays > 0
              ? `${stampedDays} stamp${stampedDays !== 1 ? 's' : ''} earned from ${activeDays} day${activeDays !== 1 ? 's' : ''} of practice`
              : 'Your virtue practice will appear here'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigateMonth(-1)}
            className="w-8 h-8 flex items-center justify-center border border-sage-200 rounded hover:bg-sage-50 transition-colors text-sage-600"
            aria-label="Previous month"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="font-display text-lg text-sage-800 w-40 text-center">
            {monthNames[month]} {year}
          </span>
          <button
            onClick={() => navigateMonth(1)}
            className="w-8 h-8 flex items-center justify-center border border-sage-200 rounded hover:bg-sage-50 transition-colors text-sage-600"
            aria-label="Next month"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 gap-1.5 mb-1.5">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
          <div key={d} className="text-center font-display text-xs text-sage-400 py-2">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="flex gap-3">
            {VIRTUE_DISPLAY.map((v, i) => (
              <img
                key={v.id}
                src={v.icon}
                alt={v.name}
                className="w-10 h-10 opacity-40"
                style={{ animation: `calPulse 1.5s ease-in-out ${i * 0.2}s infinite` }}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-1.5">
          {/* Empty cells before first day */}
          {Array.from({ length: startOffset }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}

          {/* Day cells */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1
            const dayStr = getDayStr(day)
            const dayData = getDayData(day)
            const isToday = dayStr === todayStr
            const isSelected = dayStr === selectedDay
            const isFuture = new Date(year, month, day) > today
            const strongestVirtue = dayData?.strongest_domain ? VIRTUE_MAP[dayData.strongest_domain] : null
            const hasStamp = dayData?.stamp_earned ?? false
            const proximityLabel = dayData?.best_proximity ? PROXIMITY_LABELS[dayData.best_proximity] : ''
            // A day can be genuinely active (a reflection or a journal entry)
            // with no virtue domain to badge it — reflections don't tag virtue
            // domains, and journal entries never did. Without this, such a day
            // rendered identically to an empty one: a bare grey number, clickable
            // but visually indistinguishable from nothing-happened. This is
            // exactly the "grey square" a practitioner would have no reason to
            // click.
            const hasActivityWithoutBadge = !!dayData && !strongestVirtue

            return (
              <button
                key={day}
                onClick={() => dayData ? setSelectedDay(isSelected ? null : dayStr) : undefined}
                className={`
                  aspect-square rounded-lg border-2 transition-all duration-200 relative flex items-center justify-center p-0.5
                  ${isToday && !dayData ? 'border-sage-300 bg-sage-50/50' : ''}
                  ${isToday && dayData ? 'ring-2 ring-sage-400 ring-offset-1' : ''}
                  ${isSelected ? 'shadow-md scale-105' : ''}
                  ${dayData && !isSelected ? 'hover:scale-105 hover:shadow-sm cursor-pointer' : ''}
                  ${!dayData ? 'border-transparent cursor-default' : ''}
                  ${hasActivityWithoutBadge ? 'border-sage-200 bg-sage-50/50' : ''}
                  ${isFuture ? 'opacity-30' : ''}
                `}
                style={dayData && strongestVirtue ? {
                  borderColor: hasStamp ? strongestVirtue.color : (strongestVirtue.color + '60'),
                  backgroundColor: hasStamp ? (strongestVirtue.color + '10') : (strongestVirtue.color + '06'),
                } : undefined}
                disabled={!dayData}
                aria-label={`${monthNames[month]} ${day}${strongestVirtue ? ` - ${strongestVirtue.name}${hasStamp ? ` (stamp earned - ${proximityLabel})` : ''}` : hasActivityWithoutBadge ? ' - practice recorded' : ''}`}
              >
                {/* Stamped day: full-colour virtue logo */}
                {dayData && strongestVirtue && hasStamp ? (
                  <div className="relative w-full h-full flex items-center justify-center">
                    <img
                      src={strongestVirtue.icon}
                      alt={strongestVirtue.name}
                      title={`${strongestVirtue.name} stamp — ${proximityLabel}`}
                      className="w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 drop-shadow-sm"
                    />
                    <span className="absolute top-0 left-0.5 font-display text-[10px] leading-none font-bold" style={{ color: strongestVirtue.color }}>
                      {day}
                    </span>
                  </div>
                ) : dayData && strongestVirtue && !hasStamp ? (
                  /* Active day without stamp: muted icon + proximity hint */
                  <div className="relative w-full h-full flex items-center justify-center">
                    <img
                      src={strongestVirtue.icon}
                      alt={strongestVirtue.name}
                      title={`Practiced but below stamp threshold (${proximityLabel})`}
                      className="w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 opacity-30 grayscale"
                    />
                    <span className="absolute top-0 left-0.5 font-display text-[10px] leading-none font-medium text-sage-400">
                      {day}
                    </span>
                  </div>
                ) : hasActivityWithoutBadge ? (
                  /* Active day with no virtue badge (a reflection or journal
                     entry — neither tags a virtue domain): a small dot marks it
                     as clickable rather than leaving it identical to an empty
                     day. Click reveals what was recorded, incl. any passion
                     images, in the detail panel below. */
                  <div className="relative w-full h-full flex items-center justify-center" title="Practice recorded — click to view">
                    <span className="font-display text-sm text-sage-600 font-medium">{day}</span>
                    <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-sage-400" aria-hidden="true" />
                  </div>
                ) : (
                  /* Inactive day: just the date number */
                  <span className={`font-display text-sm ${isToday ? 'text-sage-700 font-bold' : 'text-sage-300'}`}>
                    {day}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      )}

      {/* Virtue legend */}
      <div className="flex items-center justify-center gap-6 mt-5 pt-4 border-t border-sage-100">
        {VIRTUE_DISPLAY.map(v => (
          <div key={v.id} className="flex items-center gap-2">
            <img src={v.icon} alt={v.name} className="w-6 h-6" />
            <span className="font-body text-sm" style={{ color: v.color }}>{v.name}</span>
          </div>
        ))}
      </div>

      {/* Selected day detail panel */}
      {selectedDayData && selectedDay && (
        <div className="mt-5 pt-5 border-t border-sage-200">
          <div className="flex items-center gap-3 mb-4">
            {selectedDayData.strongest_domain && VIRTUE_MAP[selectedDayData.strongest_domain] && (
              <img
                src={VIRTUE_MAP[selectedDayData.strongest_domain].icon}
                alt={VIRTUE_MAP[selectedDayData.strongest_domain].name}
                className="w-10 h-10"
              />
            )}
            <div>
              <h3 className="font-display text-base font-medium text-sage-800">
                {new Date(selectedDay + 'T12:00:00').toLocaleDateString('en-AU', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                })}
              </h3>
              {selectedDayData.strongest_domain && VIRTUE_MAP[selectedDayData.strongest_domain] && (
                <p className="font-body text-sm" style={{ color: VIRTUE_MAP[selectedDayData.strongest_domain].color }}>
                  Strongest virtue: {VIRTUE_MAP[selectedDayData.strongest_domain].name}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            {selectedDayData.activities.map((activity, i) => (
              <div key={i} className="flex items-start gap-3 bg-sage-50/50 rounded-lg px-4 py-3">
                {/* Activity type */}
                <span className="font-body text-xs text-sage-400 w-16 flex-shrink-0 pt-0.5">
                  {ACTIVITY_TYPE_LABEL[activity.type]}
                </span>

                {/* Description + passion images + virtue logos */}
                <div className="flex-1 min-w-0">
                  {activity.description && (
                    <p className="font-body text-sm text-sage-700 truncate">{activity.description}</p>
                  )}

                  {/* Passion images — what the evaluation/reflection actually
                      diagnosed that day. Was fetched by the API and discarded
                      before 2026-08-02; never rendered here at all. */}
                  {activity.passions_detected && activity.passions_detected.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-1.5">
                      {activity.passions_detected.map((passion, pi) => {
                        const img = resolvePassionImage(passion)
                        if (!img) return null
                        // `name` exists on action-evaluation passions, not on
                        // reflection passions (which carry `sub_species`
                        // instead) — fall back rather than showing "undefined".
                        const label = passion.name || passion.sub_species || 'passion'
                        return (
                          <div key={pi} className="flex items-center gap-1" title={`${label} (${ROOT_PASSION_ENGLISH[passion.root_passion] || passion.root_passion})`}>
                            <img src={img} alt={label} className="w-8 h-auto" />
                          </div>
                        )
                      })}
                    </div>
                  )}

                  <div className="flex gap-2 mt-1.5">
                    {activity.virtue_domains_engaged.map(virtueId => {
                      const virtue = VIRTUE_MAP[virtueId]
                      return virtue ? (
                        <div key={virtueId} className="flex items-center gap-1">
                          <img src={virtue.icon} alt={virtue.name} className="w-5 h-5" />
                          <span className="font-body text-xs" style={{ color: virtue.color }}>{virtue.name}</span>
                        </div>
                      ) : null
                    })}
                  </div>
                </div>

                {/* Proximity label with color coding */}
                <div className="flex-shrink-0 flex flex-col items-center gap-1">
                  <span className="font-display text-xs font-bold text-sage-600">
                    {PROXIMITY_LABELS[activity.katorthoma_proximity]}
                  </span>
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: PROXIMITY_COLORS[activity.katorthoma_proximity] }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pulse animation for loading state */}
      <style jsx>{`
        @keyframes calPulse {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.15); }
        }
      `}</style>
    </div>
  )
}
