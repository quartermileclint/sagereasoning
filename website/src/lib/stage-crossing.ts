/**
 * stage-crossing.ts — resolves a `POST /api/milestones` response's
 * `new_milestones` list into at most one stage-crossing card to show.
 *
 * Practice reminders, human plan Phase 3 (`operations/reminders-2026-07/
 * 2026-07-26-practice-reminders-HUMAN-build-plan.md` §8), REVISED 2026-07-27
 * by a bound mentor verdict on the simultaneous-crossing question.
 *
 * WHY THIS IS NOT INSIDE practice-sequence.ts. That module is zero-import (see
 * its own header) because it sits at hop one of /welcome's guarded graph. This
 * module reads MILESTONE ids, which live in `milestones.ts` — a file
 * practice-sequence.ts must not import, and which /welcome does not need. This
 * module is imported only by the two surfaces a stage crossing can first
 * become visible on — the score-result view and the dashboard's milestone
 * panel — neither of which is in /welcome's graph.
 *
 * THE SIMULTANEOUS-CROSSING QUESTION, AND THE BOUND VERDICT THAT REPLACED THIS
 * FILE'S ORIGINAL "HIGHEST RANK WINS" LOGIC. Ordinarily a single evaluation
 * crosses at most one stage. The exception is a RETROACTIVE catch-up (Phase 0:
 * "awards retroactively from stored data") — an existing practitioner's first
 * post-Phase-0 milestone check can award SEVERAL `stage_*` ids in one
 * response, one per level ANY past evaluation ever reached. This is not a
 * rare edge case: since `POST /api/milestones` had no caller anywhere before
 * Phase 0, it is what almost every practitioner with a multi-level evaluation
 * history will see on their FIRST post-Phase-3 dashboard visit or evaluation.
 *
 * The original build showed the HIGHEST-ranked crossing in that case — this
 * session's own extrapolation from Phase 2's "one suggestion, never a menu"
 * verdict, not a mentor verdict. Adversarial review named it an open question
 * rather than a settled reading, and a targeted mentor consultation
 * (`operations/reminders-2026-07/2026-07-27-phase3-tiebreak-mentor-verdict-
 * verbatim.md`, binding) rejected it outright: "the highest-ranked crossing
 * does not name a current condition. It names a historical high point… It is
 * not a mirror. It is a trophy." Lowest-rank was rejected too (the mirrored
 * failure), and silence was rejected as "withholding orientation from the
 * practitioners who have earned the most context."
 *
 * THE ADOPTED ANSWER, implemented here: DISCLOSE THE PLURALITY, and name the
 * stage matching the practitioner's MOST RECENT EVALUATION — never the
 * highest ever reached. "The most recent evaluation is the best available
 * signal for current condition. The highest ever reached is a historical fact
 * about range." This is why `mostRecentEvaluationLevel` is now a REQUIRED
 * second input: the ranking-only `new_milestones` array can no longer answer
 * the question on its own.
 *
 * A DELIBERATE FURTHER-CONSERVATIVE READING, beyond the verdict's literal
 * words, recorded as a build decision: the named "current condition" must
 * ALSO be among the ids `new_milestones` reports as genuinely NEW this check
 * — not merely equal to the most recent evaluation's level. If a practitioner's
 * most-recent-evaluation level was already credited in some earlier check
 * (so it is not "new" today), naming it again would either repeat an
 * already-shown card (violating the one-shot design the whole mechanism rests
 * on) or announce a "shift" that is not actually news this check. In that
 * narrow case this resolver returns null — silence, not a stale claim.
 *
 * PURE. No I/O, no clock — the caller supplies both inputs directly.
 *
 * Run (from website/):
 *   npx tsx src/lib/__tests__/stage-crossing.test.ts
 */

import { MILESTONE_MAP } from './milestones'
import { stagePracticesBySlug, type ProximityLevel, type StagePractices } from './practice-sequence'

export interface StageCrossingResolution {
  /** The stage matching the practitioner's most recent evaluation — never the highest ever reached. */
  stage: StagePractices
  /**
   * True when this check's `new_milestones` contained MORE than one stage
   * crossing — i.e., the practitioner's history genuinely moved through more
   * than one condition before this moment, even though only `stage` (the
   * current one) is named. Callers use this to choose the plurality-disclosure
   * copy over the single-crossing form.
   */
  isPlural: boolean
}

/**
 * @param newMilestoneIds verbatim from a `/api/milestones` POST response's
 * `new_milestones` field. May contain non-stage ids, unknown ids, duplicates,
 * or be empty — all tolerated, none of them throw.
 * @param mostRecentEvaluationLevel the practitioner's most recent evaluation's
 * proximity level — the CURRENT-CONDITION signal the mentor verdict requires.
 * `null` when unknown (no evaluation on record, or the caller could not read
 * one) — the honest answer in that case is silence, never a guess.
 */
export function resolveNewlyEarnedStage(
  newMilestoneIds: readonly string[],
  mostRecentEvaluationLevel: ProximityLevel | null
): StageCrossingResolution | null {
  if (!mostRecentEvaluationLevel) return null

  const newlyEarnedStages: StagePractices[] = []
  for (const id of newMilestoneIds) {
    const pageSlug = MILESTONE_MAP[id]?.pageSlug
    if (!pageSlug) continue // not one of the five stage milestones

    const stage = stagePracticesBySlug(pageSlug)
    if (!stage) continue // defensive: a drifted slug should never happen (pinned)
    if (newlyEarnedStages.some((s) => s.level === stage.level)) continue // dedupe by DISTINCT stage — a duplicated id should never inflate isPlural (defensive: the live route is idempotent and should never actually produce a duplicate id)

    newlyEarnedStages.push(stage)
  }

  if (newlyEarnedStages.length === 0) return null

  const currentStage = newlyEarnedStages.find((s) => s.level === mostRecentEvaluationLevel)
  if (!currentStage) return null // the current condition is not among today's genuinely-new crossings — silence, not a stale claim

  return { stage: currentStage, isPlural: newlyEarnedStages.length > 1 }
}
