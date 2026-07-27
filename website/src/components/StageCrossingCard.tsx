'use client'

import { useState } from 'react'
import {
  practiceById,
  composeStageCrossingLine,
  composePluralStageCrossingLine,
  composeStagePageLinkLabel,
  STAGE_CROSSING_ORIENTATION_LINE,
  STAGE_CROSSING_COPY,
  type PracticeStep,
  type StagePractices,
} from '@/lib/practice-sequence'
import { PROXIMITY_COLORS } from '@/lib/brand-display'

/**
 * StageCrossingCard — the ONE rendering of a stage crossing (practice
 * reminders, human plan Phase 3; Step M vetted, REVISED 2026-07-27 by a bound
 * mentor verdict on the simultaneous-crossing question).
 *
 * Purely presentational, following SuggestedPracticeCard's precedent: the copy
 * arrives pre-authored from `practice-sequence.ts`; this component adds no
 * words of its own. Renders for a crossing already resolved by the caller
 * (`resolveNewlyEarnedStage`, `@/lib/stage-crossing`) from THAT caller's own
 * `POST /api/milestones` response.
 *
 * `isPlural` — REQUIRED, not optional, so a caller cannot forget to pass it.
 * True means today's check found MORE than one newly-earned stage crossing (a
 * retroactive catch-up); the card then discloses that plurality rather than
 * naming `stage` as if it were the practitioner's only condition — per the
 * bound verdict: "the highest-ranked crossing does not name a current
 * condition. It names a historical high point… It is not a mirror. It is a
 * trophy." `stage` itself is ALWAYS the practitioner's most-recent-evaluation
 * condition (resolved by the caller, never the highest ever reached) — this
 * component does not know or need to know that; it only renders what it is
 * given.
 *
 * DISMISSIBLE, NEVER REPEATED — WITHOUT ANY CLIENT-SIDE STORE. Dismissal is
 * plain component state, sufficient because the underlying signal is already
 * one-shot: `new_milestones` (Phase 0) is idempotent, so a given stage_* id
 * can appear in a POST response AT MOST ONCE across the practitioner's whole
 * history, on whichever surface's request happens to observe the crossing
 * first (see `practice-sequence.ts`'s Phase 3 section header for the found
 * race and the fix — this card is mounted on BOTH the score result view and
 * the dashboard's milestone panel for exactly that reason). No localStorage,
 * no schema change.
 *
 * NEVER A GRADE. The stage name is offered — Step M reversed the plan's
 * original omit-the-name draft: "the coyness reading is the right concern, and
 * it outweighs the protection concern here" — but as a description of a
 * condition ("This is The Worn Path"), never an achievement ("You have
 * reached The Worn Path"). No congratulation anywhere in this component.
 *
 * Imports only the zero-import practice-sequence module plus the UI-only
 * brand-display palette, so every page that mounts this stays within the
 * measurement-neutrality boundary.
 */
export default function StageCrossingCard({
  stage,
  isPlural,
}: {
  stage: StagePractices
  isPlural: boolean
}) {
  const [dismissed, setDismissed] = useState(false)
  if (dismissed) return null

  const practices = stage.practices
    .map((id) => practiceById(id))
    .filter((p): p is PracticeStep => p !== null)

  const line = isPlural ? composePluralStageCrossingLine(stage.stageName) : composeStageCrossingLine(stage.stageName)

  return (
    <div
      className="bg-white/60 border border-sage-200 rounded-lg p-6 mb-6"
      style={{ borderLeftWidth: '4px', borderLeftColor: PROXIMITY_COLORS[stage.level] }}
      data-stage-crossing={stage.stageSlug}
      data-stage-crossing-plural={isPlural}
    >
      <div className="flex items-start justify-between gap-4">
        <p className="font-display text-base text-sage-800">{line}</p>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="font-body text-xs text-sage-500 underline hover:text-sage-700 whitespace-nowrap flex-shrink-0"
        >
          {STAGE_CROSSING_COPY.dismissLabel}
        </button>
      </div>

      {practices.length > 0 ? (
        <div className="mt-4 space-y-3">
          {practices.map((p) => (
            <div key={p.id}>
              <a
                href={p.href}
                className="font-display text-sm font-semibold text-sage-800 underline decoration-sage-300 hover:decoration-sage-600"
              >
                {p.name}
              </a>
              <p className="font-body text-sm text-sage-600 mt-0.5">{p.doorbell}</p>
            </div>
          ))}
          <p className="font-body text-xs text-sage-500 italic mt-2">{STAGE_CROSSING_ORIENTATION_LINE}</p>
        </div>
      ) : (
        stage.note && <p className="font-body text-sm text-sage-600 mt-3">{stage.note}</p>
      )}

      <a
        href={`/stages/${stage.stageSlug}`}
        className="inline-block mt-4 font-display text-sm text-sage-700 underline decoration-sage-300 underline-offset-4 hover:text-sage-900"
      >
        {composeStagePageLinkLabel(stage.stageName)}
      </a>
    </div>
  )
}
