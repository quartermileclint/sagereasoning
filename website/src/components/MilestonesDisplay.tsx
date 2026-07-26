'use client'

import { useState, useEffect, useRef } from 'react'
import { MILESTONE_DEFINITIONS, MILESTONE_MAP } from '@/lib/milestones'
import { authFetch } from '@/lib/auth-fetch'

interface EarnedMilestone {
  milestone_id: string
  earned_at: string
}

interface MilestonesDisplayProps {
  userId: string
}

export default function MilestonesDisplay({ userId }: MilestonesDisplayProps) {
  const [earned, setEarned] = useState<EarnedMilestone[]>([])
  const [loading, setLoading] = useState(true)
  const [loadFailed, setLoadFailed] = useState(false)
  const [selectedMilestone, setSelectedMilestone] = useState<string | null>(null)
  // Guards the award+read pair against React Strict Mode's deliberate double-invoke
  // in development (which would otherwise spend 4 of the shared 15/min rate budget
  // per mount). Keyed on userId so a genuine user change still re-runs.
  const ranForUser = useRef<string | null>(null)

  useEffect(() => {
    if (ranForUser.current === userId) return
    ranForUser.current = userId

    async function awardThenFetch() {
      setLoading(true)
      setLoadFailed(false)

      // Award first, read second — deliberately sequential. The POST is what
      // actually grants milestones (Phase 0: nothing called it before), and a
      // parallel or fire-and-forget POST would usually lose the race against
      // this GET, leaving a freshly-earned milestone invisible until reload.
      // A failure here is tolerated: showing the already-earned record is still
      // better than showing nothing.
      try {
        await authFetch('/api/milestones', { method: 'POST' })
      } catch {
        // Non-fatal — fall through to the read.
      }

      // authFetch, never a bare fetch: /api/milestones authenticates via
      // `Authorization: Bearer` ONLY. A headerless fetch 401s unconditionally —
      // which is exactly what this component did before Phase 0, silently
      // rendering an empty grid that was indistinguishable from a new user's.
      try {
        const res = await authFetch('/api/milestones')
        if (res.ok) {
          const data = await res.json()
          setEarned(data.milestones || [])
        } else {
          setLoadFailed(true)
        }
      } catch {
        setLoadFailed(true)
      }

      setLoading(false)
    }
    awardThenFetch()
  }, [userId])

  const earnedIds = new Set(earned.map(m => m.milestone_id))
  const earnedCount = earnedIds.size
  const totalCount = MILESTONE_DEFINITIONS.length

  if (loading) {
    return (
      <div className="bg-white/60 border border-sage-200 rounded-lg p-8">
        <h2 className="font-display text-xl font-medium text-sage-800 mb-4">Virtue Milestones</h2>
        <p className="font-body text-sm text-sage-500">Loading milestones...</p>
      </div>
    )
  }

  return (
    <div className="bg-white/60 border border-sage-200 rounded-lg p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-xl font-medium text-sage-800">Virtue Milestones</h2>
          {/* Honest states: a failed read must not render as "none earned" — the
              two were indistinguishable before Phase 0, which is how the silent
              401 survived unnoticed. */}
          <p className="font-body text-sm text-sage-500 mt-1">
            {loadFailed
              ? 'Your milestones could not be loaded just now. Refresh to try again.'
              : earnedCount > 0
                ? `${earnedCount} of ${totalCount} milestones earned`
                : 'Milestones mark demonstrated understanding of stoic virtue'}
          </p>
        </div>
      </div>

      {/* Milestone grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {MILESTONE_DEFINITIONS.map(milestone => {
          const isEarned = earnedIds.has(milestone.id)
          const earnedData = earned.find(e => e.milestone_id === milestone.id)
          const isSelected = selectedMilestone === milestone.id

          return (
            <button
              key={milestone.id}
              onClick={() => setSelectedMilestone(isSelected ? null : milestone.id)}
              className={`
                relative flex flex-col items-center p-4 rounded-lg border-2 transition-all duration-300
                ${isEarned
                  ? 'border-sage-300 bg-sage-50/80 hover:shadow-md cursor-pointer'
                  : 'border-sage-100 bg-white/30 cursor-pointer hover:bg-sage-50/30'
                }
                ${isSelected ? 'shadow-md ring-1 ring-sage-400' : ''}
              `}
            >
              <img
                src={milestone.icon}
                alt={milestone.name}
                className={`w-16 h-auto mb-2 transition-all duration-500 drop-shadow-sm ${
                  isEarned ? '' : 'grayscale opacity-25'
                }`}
              />
              <span className={`font-display text-sm text-center leading-tight ${
                isEarned ? 'text-sage-800 font-medium' : 'text-sage-400'
              }`}>
                {milestone.name}
              </span>
              {isEarned && earnedData && (
                <span className="font-body text-[10px] text-sage-500 mt-1">
                  {new Date(earnedData.earned_at).toLocaleDateString('en-AU', {
                    day: 'numeric', month: 'short',
                  })}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Selected milestone detail */}
      {selectedMilestone && MILESTONE_MAP[selectedMilestone] && (
        <div className="mt-5 pt-5 border-t border-sage-200">
          <div className="flex items-start gap-4">
            <img
              src={MILESTONE_MAP[selectedMilestone].icon}
              alt={MILESTONE_MAP[selectedMilestone].name}
              className={`w-24 sm:w-28 h-auto flex-shrink-0 drop-shadow-md ${
                earnedIds.has(selectedMilestone) ? '' : 'grayscale opacity-40'
              }`}
            />
            <div>
              <h3 className="font-display text-lg font-medium text-sage-800">
                {MILESTONE_MAP[selectedMilestone].name}
              </h3>
              <p className="font-body text-sm text-sage-600 mt-1">
                {MILESTONE_MAP[selectedMilestone].description}
              </p>
              {MILESTONE_MAP[selectedMilestone].quote && (
                <p className="font-body text-sm text-sage-500 italic mt-3">
                  {MILESTONE_MAP[selectedMilestone].quote}
                </p>
              )}
              {earnedIds.has(selectedMilestone) ? (
                <p className="font-display text-xs text-sage-500 mt-2">
                  Earned {new Date(earned.find(e => e.milestone_id === selectedMilestone)!.earned_at).toLocaleDateString('en-AU', {
                    day: 'numeric', month: 'long', year: 'numeric',
                  })}
                </p>
              ) : (
                <p className="font-display text-xs text-sage-400 mt-2">Not yet earned</p>
              )}
              {MILESTONE_MAP[selectedMilestone].pageSlug && (
                <a
                  href={`/stages/${MILESTONE_MAP[selectedMilestone].pageSlug}`}
                  className="inline-block mt-3 font-display text-xs text-sage-600 underline hover:text-sage-800"
                >
                  {earnedIds.has(selectedMilestone)
                    ? `Visit ${MILESTONE_MAP[selectedMilestone].name} →`
                    : `View ${MILESTONE_MAP[selectedMilestone].name} →`}
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
