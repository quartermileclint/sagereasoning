/**
 * SuggestedPracticeCard — the ONE rendering of an in-session suggestion
 * (practice reminders, human plan Phase 2; Step M vetted).
 *
 * Purely presentational. The line arrives fully pre-authored from
 * `practice-sequence.ts` (the locked mapping); this component adds NOTHING to
 * it — no heading, no framing, no verdict. It renders the line, offers the
 * doorbell link, and stops.
 *
 * THE SAME-TOOL CASE: the aischyne row suggests the passion log revisited —
 * from the passion log itself. A navigation link pointing at the page the
 * practitioner is already on would be a loop, so when `currentPracticeId`
 * matches the suggestion's target the card renders the invitation line alone.
 * "A same-tool revisit renders as an invitation line on the entry, which is
 * still a doorbell."
 *
 * Imports ONLY the zero-import practice-sequence module, so every page that
 * mounts this stays clean under its boundary suite's one-hop follow.
 */
import { practiceById, type PracticeId, type SuggestedPractice } from '@/lib/practice-sequence'

export default function SuggestedPracticeCard({
  suggestion,
  currentPracticeId,
}: {
  suggestion: SuggestedPractice
  /** The practice page this card renders on, when it is one. */
  currentPracticeId?: PracticeId
}) {
  const target = practiceById(suggestion.practice_id)
  const showLink = target !== null && suggestion.practice_id !== currentPracticeId
  return (
    <div
      className="mt-3 bg-white/60 border border-sage-200 rounded-lg p-4"
      data-suggestion-basis={suggestion.basis}
    >
      <p className="font-body text-sm text-sage-700">{suggestion.line}</p>
      {showLink && (
        <a
          href={suggestion.href}
          className="inline-block mt-2 font-display text-sm text-sage-700 underline decoration-sage-300 underline-offset-4 hover:text-sage-900"
        >
          {target.name} →
        </a>
      )}
    </div>
  )
}
