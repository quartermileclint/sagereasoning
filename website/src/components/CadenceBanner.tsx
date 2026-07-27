import type { ReactNode } from 'react'

/**
 * CadenceBanner — the one visual form every cadence prompt in the product takes.
 *
 * Practice reminders, human plan Phase 4 (`operations/reminders-2026-07/
 * 2026-07-26-practice-reminders-HUMAN-build-plan.md` §9): "the Monday and
 * quarterly banners folded in visually."
 *
 * Three prompts had grown up separately and looked it — premeditatio's Monday
 * banner, oikeiosis's quarterly banner, and now the daily rhythm's not-yet
 * poles. They say the same kind of thing (a cadence has come round; here is the
 * door) and now they look the same saying it.
 *
 * PRESENTATIONAL ONLY, and that boundary is the point. It owns no cadence logic,
 * reads no clock, holds no state and fetches nothing. Each caller keeps its own
 * "is it time?" test exactly as it was — premeditatio still asks whether it is
 * Monday, oikeiosis still asks whether it is the first Sunday of the quarter —
 * so this change is a restyle and provably cannot alter when a banner appears.
 *
 * THE ACTION IS `children`, deliberately. The existing banners drive page-local
 * state through their own handlers (`openNewForm`, `setShowForm`); the rhythm
 * strip uses plain links. Taking the action as children rather than as an
 * `onClick` prop means no caller has to restructure its handlers to adopt this,
 * which is what keeps the restyle behaviour-preserving.
 *
 * THE LANGUAGE RULE (plan §1, mentor verbatim): "reminders that prompt the
 * practitioner to begin are appropriate scaffolding. Reminders that tell the
 * practitioner what to think, how to feel, or what conclusion to reach are doing
 * the work instead of them." Every string rendered here arrives from the caller,
 * pre-authored; this component adds no words of its own.
 */

export type CadenceTone = 'sage' | 'amber'

const TONE_CLASSES: Record<CadenceTone, { shell: string; title: string; line: string }> = {
  sage: {
    shell: 'bg-sage-50 border-sage-300',
    title: 'text-sage-800',
    line: 'text-sage-600',
  },
  amber: {
    shell: 'bg-amber-50 border-amber-200',
    title: 'text-amber-800',
    line: 'text-amber-600',
  },
}

interface CadenceBannerProps {
  /** What has come round. A name, not an instruction. */
  title: string
  /** The doorbell line — one sentence inviting a beginning, then stopping. */
  line: string
  /** Defaults to `sage`; `amber` preserves premeditatio's existing appearance. */
  tone?: CadenceTone
  /** The action: a button wired to the caller's own handler, or a link. */
  children?: ReactNode
  className?: string
}

export default function CadenceBanner({
  title,
  line,
  tone = 'sage',
  children,
  className = '',
}: CadenceBannerProps) {
  const t = TONE_CLASSES[tone]

  return (
    <div className={`${t.shell} border rounded-lg p-4 ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <span className={`font-display text-sm font-medium ${t.title}`}>{title}</span>
          <p className={`font-body text-xs ${t.line} mt-1`}>{line}</p>
        </div>
        {children}
      </div>
    </div>
  )
}
