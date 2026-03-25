'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { VIRTUES } from '@/lib/stoic-brain'

interface DayActivity {
  type: 'action' | 'reflection'
  description?: string
  total_score: number
  virtues_demonstrated: string[]
}

interface DayData {
  virtues: string[]
  activities: DayActivity[]
}

interface CalendarData {
  month: string
  days: Record<string, DayData>
}

interface PracticeCalendarProps {
  userId: string
}

// Virtue metadata for quick lookup
const VIRTUE_MAP = Object.fromEntries(VIRTUES.map(v => [v.id, v]))

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

  // Count active practice days this month
  const activeDays = calendarData ? Object.keys(calendarData.days).length : 0

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
              ? `${activeDays} day${activeDays !== 1 ? 's' : ''} of practice this month`
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
      <div className="grid grid-cols-7 gap-1 mb-1">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
          <div key={d} className="text-center font-display text-xs text-sage-400 py-2">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="flex gap-2">
            {VIRTUES.map((v, i) => (
              <img
                key={v.id}
                src={v.icon}
                alt={v.name}
                className="w-6 h-6 opacity-40"
                style={{ animation: `pulse 1.5s ease-in-out ${i * 0.2}s infinite` }}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-1">
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

            return (
              <button
                key={day}
                onClick={() => dayData ? setSelectedDay(isSelected ? null : dayStr) : undefined}
                className={`
                  aspect-square rounded-lg border transition-all duration-200 relative flex flex-col items-center justify-center gap-0.5 p-1
                  ${isToday ? 'border-sage-400 ring-1 ring-sage-300' : 'border-transparent'}
                  ${isSelected ? 'bg-sage-100 border-sage-400 shadow-sm' : ''}
                  ${dayData ? 'hover:bg-sage-50 cursor-pointer' : 'cursor-default'}
                  ${isFuture ? 'opacity-40' : ''}
                `}
                disabled={!dayData}
                aria-label={`${monthNames[month]} ${day}${dayData ? ` - ${dayData.virtues.length} virtues practiced` : ''}`}
              >
                {/* Day number */}
                <span className={`font-display text-xs leading-none ${isToday ? 'text-sage-700 font-bold' : dayData ? 'text-sage-700' : 'text-sage-300'}`}>
                  {day}
                </span>

                {/* Virtue logos for active days */}
                {dayData && dayData.virtues.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-px mt-0.5">
                    {dayData.virtues.map(virtueId => {
                      const virtue = VIRTUE_MAP[virtueId]
                      if (!virtue) return null
                      return (
                        <img
                          key={virtueId}
                          src={virtue.icon}
                          alt={virtue.name}
                          title={virtue.name}
                          className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                          style={{
                            filter: 'none',
                            transition: 'transform 0.2s ease',
                          }}
                        />
                      )
                    })}
                  </div>
                )}
              </button>
            )
          })}
        </div>
      )}

      {/* Virtue legend */}
      <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-sage-100">
        {VIRTUES.map(v => (
          <div key={v.id} className="flex items-center gap-1.5">
            <img src={v.icon} alt={v.name} className="w-4 h-4" />
            <span className="font-body text-xs" style={{ color: v.color }}>{v.name}</span>
          </div>
        ))}
      </div>

      {/* Selected day detail panel */}
      {selectedDayData && selectedDay && (
        <div className="mt-4 pt-4 border-t border-sage-200">
          <div className="flex items-center gap-2 mb-3">
            <h3 className="font-display text-sm font-medium text-sage-800">
              {new Date(selectedDay + 'T12:00:00').toLocaleDateString('en-AU', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })}
            </h3>
            <div className="flex gap-1">
              {selectedDayData.virtues.map(virtueId => {
                const virtue = VIRTUE_MAP[virtueId]
                return virtue ? (
                  <img key={virtueId} src={virtue.icon} alt={virtue.name} className="w-5 h-5" />
                ) : null
              })}
            </div>
          </div>

          <div className="space-y-2">
            {selectedDayData.activities.map((activity, i) => (
              <div key={i} className="flex items-start gap-3 bg-sage-50/50 rounded px-3 py-2">
                {/* Activity type icon */}
                <span className="font-body text-xs text-sage-400 w-16 flex-shrink-0 pt-0.5">
                  {activity.type === 'action' ? 'Action' : 'Reflection'}
                </span>

                {/* Description */}
                <div className="flex-1 min-w-0">
                  {activity.description && (
                    <p className="font-body text-sm text-sage-700 truncate">{activity.description}</p>
                  )}
                  {/* Virtue logos for this specific activity */}
                  <div className="flex gap-1 mt-1">
                    {activity.virtues_demonstrated.map(virtueId => {
                      const virtue = VIRTUE_MAP[virtueId]
                      return virtue ? (
                        <div key={virtueId} className="flex items-center gap-1">
                          <img src={virtue.icon} alt={virtue.name} className="w-3.5 h-3.5" />
                          <span className="font-body text-xs" style={{ color: virtue.color }}>{virtue.name}</span>
                        </div>
                      ) : null
                    })}
                  </div>
                </div>

                {/* Score */}
                <span className="font-display text-sm font-bold text-sage-700 flex-shrink-0">
                  {activity.total_score}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pulse animation for loading state */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.15); }
        }
      `}</style>
    </div>
  )
}
