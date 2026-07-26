'use client'

import { useParams } from 'next/navigation'
import { STAGE_DISPLAY } from '@/lib/brand-display'

/**
 * The Five Stages of Practice — one dedicated page per stage.
 *
 * Source: brand-2026-07 proposal §2.2 (founder decision 2026-07-24) — "the
 * background colour is just for the page that reveals the stage image, we
 * will create one page for each stage and reveal it when milestones are
 * crossed."
 *
 * Access: visitable-but-inert (founder election, this session) — the page is
 * reachable by anyone who knows or is given the URL; the milestone gates only
 * whether a *link to it* is surfaced from MilestonesDisplay, not the page
 * itself. There is no locked/redirect state here by design.
 *
 * R1/R9: the Storm and the Worn Path describe difficult states — worded here,
 * as in milestones.ts, as honest recognition, not achievement-or-failure.
 */
export default function StagePage() {
  const params = useParams()
  const slug = typeof params.slug === 'string' ? params.slug : ''
  const stage = STAGE_DISPLAY.find(s => s.slug === slug)

  if (!stage) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-24 text-center">
        <p className="font-body text-sage-600">Unknown stage.</p>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 py-20"
      style={{ backgroundColor: `${stage.color}1a` }}
    >
      <div className="max-w-xl w-full text-center">
        {/* Width-driven (not a square box): the portrait art fills an
            iPhone-width viewport instead of letterboxing at ~157px. */}
        <img
          src={stage.image}
          alt={stage.name}
          className="w-full max-w-sm h-auto mx-auto mb-8 drop-shadow-xl"
        />
        <h1
          className="font-display text-3xl md:text-4xl font-medium mb-4"
          style={{ color: stage.color }}
        >
          {stage.name}
        </h1>
        <p className="font-body text-lg text-sage-800 leading-relaxed mb-6">
          {stage.description}
        </p>
        <p className="font-body text-sm text-sage-600 italic">
          The Five Stages are not a fixed ladder — practice does not move in one direction,
          and recognising where you stand today says nothing about tomorrow.
        </p>
      </div>
    </div>
  )
}
