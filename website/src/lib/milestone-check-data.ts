/**
 * milestone-check-data.ts — pure assembly of V3MilestoneCheckData from raw store rows.
 *
 * Extracted from POST /api/milestones so the arithmetic is directly unit-testable
 * without a Supabase client (the AE-2 `buildLoopFoldIdentity` precedent — a route's
 * derivation expression that is only source-grep-pinned is not actually tested).
 *
 * This module is deliberately I/O-free and dependency-light: it imports ONLY types
 * from './milestones'. No Supabase, no env, no clock, no stoic-brain specifier — so
 * a test importing it runs bare (`npx tsx`, no --env-file) and it stays safe to reuse
 * from a measurement-neutrality-guarded surface later.
 *
 * Phase 0 of the human practice-reminders build plan
 * (operations/reminders-2026-07/2026-07-26-practice-reminders-HUMAN-build-plan.md §5).
 */

import type { V3MilestoneCheckData } from './milestones'

/** One evaluation row, as selected by the milestones route. */
export type EvaluationRow = V3MilestoneCheckData['evaluations'][number]

/** One journal_entries row — only the two columns the milestone checks need. */
export interface JournalRow {
  day_number: number
  created_at: string
}

const MS_PER_DAY = 1000 * 60 * 60 * 24

/**
 * Journal Phase 1 is days 1–7 inclusive.
 *
 * Authoritative source: `journal-content.ts` (`PHASES[0]`, "Foundations", days 1–7),
 * restated verbatim in the `foundation_layer` milestone description ("Completed
 * Phase 1 of the journal (Days 1–7)").
 *
 * Keyed on `day_number`, NOT `phase_number`, deliberately: POST /api/journal writes
 * `phase_number: phase_number || 1` with no cross-check against `day_number`, so a
 * client that omits the field silently stamps phase 1 on any day. `day_number` is
 * range-CHECKed in the schema and carries UNIQUE(user_id, day_number).
 */
export const JOURNAL_PHASE_1_DAYS: readonly number[] = [1, 2, 3, 4, 5, 6, 7]

/**
 * The largest gap, in whole days, between any two chronologically consecutive
 * timestamps. Returns null when fewer than two usable timestamps are supplied.
 *
 * WHY MAX GAP, AND NOT "DAYS SINCE NOW":
 *
 * Both consumers of this figure are "resumed after an absence" milestones —
 * `returning_practitioner` ("Returned after 7+ days away AND evaluated an action")
 * and `journal_return` ("Resumed journaling after a 7+ day gap"). Each claims that
 * a return *happened*, so the honest measure is the gap that a subsequent entry
 * closed, not the time a practitioner has currently been absent.
 *
 * A days-since-now reading would award "Returning Practitioner" to someone who has
 * NOT returned — and would fire for every lapsed user on the dashboard catch-up
 * call. That contradicts the milestone's own second clause.
 *
 * Max-gap (rather than only the most recent pair) is what makes the retroactive
 * catch-up honest: a practitioner who returned after a 10-day absence six months
 * ago genuinely earned the milestone, and the record still supports it. It is also
 * monotone — once true, always true — which matches an append-only award ledger.
 *
 * Input order is irrelevant (the function sorts); unusable timestamps are dropped.
 *
 * The non-string guard is load-bearing, not defensive noise: `created_at` is
 * nullable on `action_evaluations_v3` (`TIMESTAMPTZ DEFAULT NOW()`, no NOT NULL),
 * and `new Date(null).getTime()` is `0` — a FINITE value, not NaN. Without the
 * guard a single null timestamp would read as 1970 and fabricate a ~20,000-day
 * gap, falsely awarding `returning_practitioner`. (`undefined` and `''` do yield
 * NaN and would have been caught; `null` alone slips through.)
 */
export function maxConsecutiveGapDays(timestamps: readonly string[]): number | null {
  const times = timestamps
    .filter((t): t is string => typeof t === 'string' && t.length > 0)
    .map((t) => new Date(t).getTime())
    .filter((t) => Number.isFinite(t))
    .sort((a, b) => a - b)

  if (times.length < 2) return null

  let maxGap = 0
  for (let i = 1; i < times.length; i++) {
    const gap = Math.floor((times[i] - times[i - 1]) / MS_PER_DAY)
    if (gap > maxGap) maxGap = gap
  }
  return maxGap
}

/**
 * True when every one of journal days 1–7 has an entry.
 *
 * Deliberately NOT `count >= 7`: a practitioner with days 1,2,3,5,8,9,10 has seven
 * entries but has not completed Phase 1.
 */
export function isJournalPhase1Complete(dayNumbers: readonly number[]): boolean {
  const present = new Set(dayNumbers)
  return JOURNAL_PHASE_1_DAYS.every((d) => present.has(d))
}

/** Raw rows, as fetched by the route, before assembly. */
export interface MilestoneSourceRows {
  earnedMilestoneIds: string[]
  hasBaseline: boolean
  senecanGrade?: V3MilestoneCheckData['senecanGrade']
  /** Any order — the builder sorts. */
  evaluations: EvaluationRow[]
  reflectionCount: number
  /** Any order; may be empty. */
  journalEntries: JournalRow[]
}

/**
 * Assemble the check-data `checkNewMilestones` consumes.
 *
 * ORDERING CONTRACT (previously undocumented and un-enforced): two predicates in
 * `checkNewMilestones` — `consistent_deliberate` (`slice(0, 5)`) and
 * `passion_reduction` (`slice(0, 5)` vs `slice(5, 10)`) — assume `evaluations` is
 * sorted created_at DESCENDING, but that function never sorts; it trusts its caller.
 * A caller that supplied ASC order would silently check the OLDEST five and invert
 * the passion comparison, with no type or runtime error. This builder therefore
 * sorts DESC itself, so the contract is guaranteed here rather than assumed from a
 * query's `.order()` clause that a later edit could change.
 */
export function buildV3MilestoneCheckData(rows: MilestoneSourceRows): V3MilestoneCheckData {
  const evaluations = [...rows.evaluations].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  const journalEntries = rows.journalEntries

  return {
    earnedMilestoneIds: rows.earnedMilestoneIds,
    hasBaseline: rows.hasBaseline,
    senecanGrade: rows.senecanGrade,
    evaluations,
    reflectionCount: rows.reflectionCount,
    daysSinceLastAction: maxConsecutiveGapDays(evaluations.map((e) => e.created_at)),
    journalEntriesCompleted: journalEntries.length,
    journalPhase1Complete: isJournalPhase1Complete(journalEntries.map((j) => j.day_number)),
    daysSinceLastJournalEntry: maxConsecutiveGapDays(journalEntries.map((j) => j.created_at)),
  }
}
