'use client'

import { useState, useEffect, useRef } from 'react'
import { authFetch } from '@/lib/auth-fetch'
import { PRACTICE_SEQUENCE, PRACTICE_MODULE_COPY } from '@/lib/practice-sequence'

/**
 * PracticeSequenceModule — the dashboard's "Your practice" module.
 *
 * Practice reminders, human plan Phase 1 — the SEQUENCE trigger
 * (`operations/reminders-2026-07/2026-07-26-practice-reminders-HUMAN-build-plan.md` §6):
 * "the default path before enough practitioner context exists to personalise it."
 *
 * RENDERS FOR EVERY SIGNED-IN PRACTITIONER, including one with zero evaluations —
 * it is mounted ABOVE the dashboard's `evaluations.length > 0` gate. That gate is
 * the reason a brand-new practitioner previously saw nothing at all here, which is
 * precisely the practitioner the sequence exists for.
 *
 * WHAT IT DELIBERATELY DOES NOT DO (plan §11): no percentages, no "N of M", no
 * completion bar, no streaks, no badge. The mirror principle — "the reminder
 * reflects the time back to the practitioner. It does not reflect the quality of
 * what they do with it." The route returns per-practice counts; this component
 * does not render them, because a tally is a score.
 *
 * HONEST STATES. Three, not two. A practice is Met, Not yet, or — when its read
 * failed — SHOWN WITH NO STATE AT ALL. Rendering a failed read as "Not yet" would
 * tell a practitioner they have not done something they may well have done. Every
 * doorbell still links out in that case: a status outage must not take the
 * practices away.
 */

interface PracticeStatus {
  id: string
  step: number
  tracked: boolean
  status: 'ok' | 'unavailable'
  met: boolean | null
  last_used_at: string | null
}

interface StatusResponse {
  practices?: PracticeStatus[]
  next_in_sequence?: string | null
  next_basis?: 'first_unmet' | 'all_met' | 'indeterminate'
}

interface PracticeSequenceModuleProps {
  userId: string
}

function formatDate(iso: string | null): string | null {
  if (!iso) return null
  const t = Date.parse(iso)
  if (!Number.isFinite(t)) return null
  return new Date(t).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function PracticeSequenceModule({ userId }: PracticeSequenceModuleProps) {
  const [status, setStatus] = useState<StatusResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadFailed, setLoadFailed] = useState(false)
  // Guards against React Strict Mode's deliberate double-invoke in development,
  // which would otherwise spend two of the route's rate budget per mount.
  const ranForUser = useRef<string | null>(null)

  useEffect(() => {
    if (ranForUser.current === userId) return
    ranForUser.current = userId

    async function load() {
      setLoading(true)
      setLoadFailed(false)
      try {
        // authFetch, never a bare fetch — the route authenticates via
        // `Authorization: Bearer` only, so a headerless fetch 401s
        // unconditionally (the Phase 0 MilestonesDisplay defect).
        const res = await authFetch('/api/mentor/practice-status')
        if (res.ok) {
          setStatus((await res.json()) as StatusResponse)
        } else {
          setLoadFailed(true)
        }
      } catch {
        setLoadFailed(true)
      }
      setLoading(false)
    }
    load()
  }, [userId])

  const byId = new Map((status?.practices ?? []).map((p) => [p.id, p]))
  const nextId = status?.next_in_sequence ?? null
  const allMet = status?.next_basis === 'all_met'

  // A TOTAL read outage still returns HTTP 200 — the route degrades per-table
  // rather than failing the request, which is right for a partial failure but
  // means `loadFailed` (set only on a network/HTTP error) never fires when every
  // table is down. The practitioner would then get a stateless list with no
  // explanation, and the copy written for exactly this case would be
  // unreachable. So the outage is derived from the payload too. Found by the
  // adversarial review.
  const tracked = PRACTICE_SEQUENCE.filter((s) => s.tracked)
  const trackedStatuses = tracked.map((s) => byId.get(s.id)).filter(Boolean) as PracticeStatus[]
  const allUnavailable =
    trackedStatuses.length > 0 && trackedStatuses.every((p) => p.status === 'unavailable')
  const showOutage = loadFailed || allUnavailable

  const prerequisite = PRACTICE_SEQUENCE.find((s) => !s.tracked)

  return (
    <div className="bg-white/60 border border-sage-200 rounded-lg p-8">
      <h2 className="font-display text-xl font-medium text-sage-800 mb-2">
        {PRACTICE_MODULE_COPY.heading}
      </h2>
      <p className="font-body text-sm text-sage-600 mb-6 max-w-2xl">
        {PRACTICE_MODULE_COPY.intro}
      </p>

      {!loading && showOutage && (
        <p className="font-body text-sm text-amber-700 bg-amber-50/60 border border-amber-200 rounded px-4 py-3 mb-6">
          {PRACTICE_MODULE_COPY.loadFailed}
        </p>
      )}

      {/* The prerequisite orientation. Set apart deliberately: it is not one more
          tool, it is the ground the tools assume — and it is a reading, so there
          is no row anywhere that could mark it done. */}
      {prerequisite && (
        <div className="bg-sage-100/60 border border-sage-200 rounded-lg p-5 mb-6">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <a
              href={prerequisite.href}
              className="font-display text-base font-semibold text-sage-800 underline decoration-sage-300 hover:decoration-sage-600"
            >
              {prerequisite.name}
            </a>
            <span className="font-body text-xs text-sage-500 italic">
              {PRACTICE_MODULE_COPY.untrackedNote}
            </span>
          </div>
          <p className="font-body text-sm text-sage-700 mt-1">{prerequisite.doorbell}</p>
        </div>
      )}

      <ol className="space-y-3">
        {tracked.map((step) => {
          const p = byId.get(step.id)
          const unavailable = !p || p.status === 'unavailable'
          const met = !unavailable && p.met === true
          const isNext = !loading && nextId === step.id
          const lastUsed = formatDate(p?.last_used_at ?? null)

          return (
            <li
              key={step.id}
              className={
                isNext
                  ? 'border-l-4 border-sage-400 bg-sage-50/70 rounded-r-lg pl-4 pr-4 py-3'
                  : 'border-l-4 border-transparent pl-4 pr-4 py-3'
              }
            >
              {isNext && (
                <p className="font-display text-xs uppercase tracking-wide text-sage-600 mb-1">
                  {PRACTICE_MODULE_COPY.nextLabel}
                </p>
              )}
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <a
                  href={step.href}
                  className="font-display text-base font-semibold text-sage-800 underline decoration-sage-300 hover:decoration-sage-600"
                >
                  {step.name}
                </a>
                {/* No state at all while loading, and none when the read failed —
                    silence is the honest rendering, never a fabricated "Not yet". */}
                {!loading && !unavailable && (
                  <span
                    className={
                      met
                        ? 'font-body text-xs text-sage-600 whitespace-nowrap'
                        : 'font-body text-xs text-sage-400 whitespace-nowrap'
                    }
                  >
                    {met
                      ? `${PRACTICE_MODULE_COPY.metLabel}${lastUsed ? ` · ${lastUsed}` : ''}`
                      : PRACTICE_MODULE_COPY.notYetLabel}
                  </span>
                )}
              </div>
              <p className="font-body text-sm text-sage-600 mt-1">{step.doorbell}</p>
            </li>
          )
        })}
      </ol>

      {!loading && allMet && (
        <p className="font-body text-sm text-sage-600 mt-6 pt-5 border-t border-sage-100">
          {PRACTICE_MODULE_COPY.allMet}
        </p>
      )}
    </div>
  )
}
