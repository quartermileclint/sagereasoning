import { practiceById, type PracticeStep, type StagePractices } from '@/lib/practice-sequence'

export type StagePracticesListVariant = 'full' | 'compact'

/**
 * StagePracticesList — the ONE rendering of "the practices a stage's
 * condition calls for, or its note in their place" (practice reminders,
 * human plan Phase 3). Shared by `/stages/<slug>` (`variant="full"`) and
 * MilestonesDisplay's stage detail panel (`variant="compact"`).
 *
 * STRUCTURALLY UNABLE TO GATE ON PREREQUISITES OR EARNED-STATE (Step M
 * verdict 2: "no prerequisite gating"). This component's props carry ONLY a
 * `StagePractices` entry — no earned flag, no milestone id, nothing to
 * condition rendering on. Extracted after this session's own adversarial
 * review found that the PRIOR inline version — living inside
 * `MilestonesDisplay`, which DOES have `earnedIds`/`selectedMilestone` in
 * scope — was guarded only by a source-text pin checking that
 * `earnedIds.has(selectedMilestone)` did not appear near the practice-links
 * block. A plausible, non-adversarial refactor (hoisting that check into a
 * named variable a few lines above) would have silently reintroduced gating
 * while defeating the pin. A component that structurally cannot see
 * earned-state makes the property true by construction: reintroducing
 * gating here would require changing this component's own prop signature,
 * which is a visible, reviewable change — not a refactor that can hide.
 *
 * Renders NOTHING beyond the practices-or-note content itself — no heading,
 * no outer border. Callers keep their own surrounding structure, which
 * genuinely differs between the two ('Practices for this stage' + a
 * colour-tinted top border on the Stage page; a small unheaded link list
 * inside an existing detail panel on the dashboard) — unifying THAT would be
 * forcing two different contexts into one shape for no real gain.
 */
export default function StagePracticesList({
  stagePractices,
  variant,
}: {
  stagePractices: StagePractices
  variant: StagePracticesListVariant
}) {
  const practices = stagePractices.practices
    .map((id) => practiceById(id))
    .filter((p): p is PracticeStep => p !== null)

  if (practices.length === 0) {
    if (!stagePractices.note) return null
    return variant === 'compact' ? (
      <p className="font-body text-xs text-sage-500 italic mt-3">{stagePractices.note}</p>
    ) : (
      <p className="font-body text-sm text-sage-700 italic">{stagePractices.note}</p>
    )
  }

  if (variant === 'compact') {
    return (
      <div className="mt-3 space-y-1.5">
        {practices.map((p) => (
          <a
            key={p.id}
            href={p.href}
            className="block font-display text-xs text-sage-600 underline hover:text-sage-800"
          >
            {p.name} →
          </a>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {practices.map((p) => (
        <div key={p.id}>
          <a
            href={p.href}
            className="font-display text-base font-semibold text-sage-800 underline decoration-sage-300 hover:decoration-sage-600"
          >
            {p.name}
          </a>
          <p className="font-body text-sm text-sage-600 mt-1">{p.doorbell}</p>
        </div>
      ))}
    </div>
  )
}
