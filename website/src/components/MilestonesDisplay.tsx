'use client'

import { useState, useEffect, useRef } from 'react'
import { MILESTONE_DEFINITIONS, MILESTONE_MAP } from '@/lib/milestones'
import { authFetch } from '@/lib/auth-fetch'
import { stagePracticesBySlug, type ProximityLevel, type StagePractices } from '@/lib/practice-sequence'
import { resolveNewlyEarnedStage, type StageCrossingResolution } from '@/lib/stage-crossing'
import StageCrossingCard from './StageCrossingCard'
import StagePracticesList from './StagePracticesList'

interface EarnedMilestone {
  milestone_id: string
  earned_at: string
}

interface MilestonesDisplayProps {
  userId: string
  /**
   * The practitioner's most recent evaluation's proximity level — REQUIRED,
   * not optional, so a caller cannot forget to supply the current-condition
   * signal the mentor's simultaneous-crossing verdict (2026-07-27) requires.
   * `dashboard/page.tsx` already holds this (its own `evaluations`, sorted
   * newest-first) — pass `evaluations[0]?.katorthoma_proximity ?? null` rather
   * than have this component re-fetch data its parent already has (the
   * PracticeSequenceModule/DailyRhythmStrip precedent this codebase already
   * follows, for the same reason: avoid doubling a shared rate-limit bucket's
   * consumption to re-fetch bytes already in hand). `null` when unknown — the
   * honest answer is then silence, never a guess (see `stage-crossing.ts`).
   */
  mostRecentProximity: ProximityLevel | null
}

export default function MilestonesDisplay({ userId, mostRecentProximity }: MilestonesDisplayProps) {
  const [earned, setEarned] = useState<EarnedMilestone[]>([])
  const [loading, setLoading] = useState(true)
  const [loadFailed, setLoadFailed] = useState(false)
  const [selectedMilestone, setSelectedMilestone] = useState<string | null>(null)
  // Practice reminders, human plan Phase 3 (the stage-crossing trigger) — the
  // earn moment. Populated ONLY from THIS component's own award call's
  // response (see practice-sequence.ts's Phase 3 section header for why
  // score/page.tsx independently does the same rather than this being the
  // sole surface: whichever request actually observes the crossing shows it).
  const [stageCrossing, setStageCrossing] = useState<StageCrossingResolution | null>(null)
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
        const postRes = await authFetch('/api/milestones', { method: 'POST' })
        // Phase 3 — the POST response IS Phase 0's newly-earned list. A parse
        // failure here must not block the read below, so this stays inside the
        // same try/catch as the award call rather than getting its own.
        //
        // The mentor's simultaneous-crossing verdict (2026-07-27) requires the
        // practitioner's MOST RECENT evaluation's level as the current-condition
        // signal — never the highest of whatever new_milestones reports. This
        // component does not fetch that itself; it is supplied by the parent
        // (see the mostRecentProximity prop's own header).
        if (postRes.ok) {
          const postData = await postRes.json().catch(() => null)
          const resolution = postData?.new_milestones
            ? resolveNewlyEarnedStage(postData.new_milestones, mostRecentProximity)
            : null
          if (resolution) setStageCrossing(resolution)
        }
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
  }, [userId, mostRecentProximity])

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

  // Practice reminders, human plan Phase 3, item 3 — a stage milestone's detail
  // panel additionally shows the practices its condition calls for (or, for The
  // Inner Fire, its note in their place), beside the existing Stage-page link.
  // Always shown, earned or not (Step M verdict 2: no prerequisite gating) — a
  // practitioner may be curious about a stage they have not reached yet, and
  // nothing here is locked. Rendered via StagePracticesList, which structurally
  // cannot gate on earned-state (see that component's own header) — this
  // derivation only resolves WHICH stage's practices to show, never whether.
  const selectedStagePractices: StagePractices | null =
    selectedMilestone && MILESTONE_MAP[selectedMilestone]?.pageSlug
      ? stagePracticesBySlug(MILESTONE_MAP[selectedMilestone].pageSlug!)
      : null

  return (
    <>
      {/* Practice reminders, human plan Phase 3 — the earn moment. Rendered as
          a sibling, not nested, so the parent's spacing utility (dashboard's
          space-y-8) applies between it and the milestones panel below.

          DISCLOSED, ACCEPTED RESIDUAL (found by adversarial review): the
          award POST and the read GET below are two separate requests. If the
          award succeeds (setting stageCrossing) but the SUBSEQUENT read
          fails, this card announces a fresh crossing in the same render
          where the grid below shows its own "could not be loaded" outage
          banner with every tile — including the one just earned — greyed
          out. Not misleading (both statements are independently honest: a
          crossing genuinely was just observed; the grid genuinely could not
          confirm it), but visually inconsistent. Low-frequency (needs a
          success-then-failure split across two calls seconds apart) and
          self-resolving (a reload re-reads correctly). RECONFIRMED, not
          merely carried forward: asked to act on this at the founder's own
          discretion, the explicit recommendation was to leave it exactly as
          disclosed — silently dropping the one-shot notification here (the
          only alternative fix) costs more than the low-severity, self-
          resolving problem it would solve. */}
      {stageCrossing && <StageCrossingCard stage={stageCrossing.stage} isPlural={stageCrossing.isPlural} />}

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
                {/* Phase 3, item 3 — the practices this stage calls for.
                    StagePracticesList has no access to earned-state at all
                    (see its own header) — no prerequisite gating is
                    structural here, not merely a source-text pin's absence. */}
                {selectedStagePractices && (
                  <StagePracticesList stagePractices={selectedStagePractices} variant="compact" />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
