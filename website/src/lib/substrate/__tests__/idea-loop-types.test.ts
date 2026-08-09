/**
 * idea-loop-types.test.ts — the C2(iii) structural-novelty battery + the
 * approved-type invariants (agent-circles, 2026-08-08).
 *
 * Plain-assertion script: npx tsx <this file>. Hermetic — pure module, no env.
 */

import { readFileSync } from 'fs'
import { join } from 'path'
import {
  createOikeiosisGap,
  assessStructuralNovelty,
  type GeneratedCandidate,
  type NoveltyHistoryRow,
} from '../idea-loop-types'
import { EVIDENCE_FLOOR } from '../trajectory-delta'

let passed = 0
let failed = 0
const failures: string[] = []
function assert(condition: boolean, label: string): void {
  if (condition) passed++
  else {
    failed++
    failures.push(label)
    console.error(`FAIL: ${label}`)
  }
}

function row(stage: string | null, domains: string[]): NoveltyHistoryRow {
  return { oikeiosis_stage: stage, virtue_domains_engaged: domains }
}

// ============================================================================
// §1 createOikeiosisGap — the current+1 construction-time invariant
// ============================================================================
{
  const gap = createOikeiosisGap(3, 'serve the wider project community')
  assert(gap.targetCircle === 4, '§1.1 target is ALWAYS current+1')
  assert(gap.schema === 'idea-loop-oikeiosis-gap-v1', '§1.2 schema tag')
  let threw = false
  try {
    createOikeiosisGap(5, 'x')
  } catch {
    threw = true
  }
  assert(threw, '§1.3 circle 5 has no next circle (the telos is never a target)')
}

// ============================================================================
// §2 assessStructuralNovelty — floor reuse + matching + honesty
// ============================================================================
{
  assert(EVIDENCE_FLOOR === 3, '§2.1 the REUSED floor is trajectory-delta\'s own 3 (never re-derived)')

  const window: NoveltyHistoryRow[] = [
    row('local_community', ['phronesis', 'dikaiosyne']),
    row('local_community', ['dikaiosyne', 'phronesis']), // set-equal, order differs
    row('local_community', ['phronesis']),
    row('political_community', ['phronesis', 'dikaiosyne']), // rank 3 too
    row('cosmopolis', ['phronesis', 'dikaiosyne']),
    row(null, ['phronesis', 'dikaiosyne']), // unmappable — never matches
  ]

  // Candidate at circle 3 with {phronesis,dikaiosyne}: matches rows 1,2,4 = 3
  // occurrences ⇒ NOT novel (count === floor).
  const c1 = assessStructuralNovelty(
    { targetCircle: 3, initialClassification: { kind: 'virtue_domain', domains: ['phronesis', 'dikaiosyne'] } },
    window,
  )
  assert(c1.novel === false, '§2.2 at the floor ⇒ not novel')
  assert(c1.confidence === 0, '§2.3 boundary count ⇒ lowest confidence')

  // Order-insensitive set equality (row 2's reversed domains counted).
  const c2 = assessStructuralNovelty(
    { targetCircle: 3, initialClassification: { kind: 'virtue_domain', domains: ['dikaiosyne', 'phronesis'] } },
    window,
  )
  assert(c2.novel === c1.novel, '§2.4 domain order never changes the verdict')

  // Circle 4 with the same domains: 1 occurrence ⇒ novel.
  const c3 = assessStructuralNovelty(
    { targetCircle: 4, initialClassification: { kind: 'virtue_domain', domains: ['phronesis', 'dikaiosyne'] } },
    window,
  )
  assert(c3.novel === true, '§2.5 below the floor ⇒ novel')
  assert(c3.confidence > 0 && c3.confidence < 1, '§2.6 near-floor confidence is partial')

  // Empty window — AMENDED 2026-08-09 per the fresh scope's Q-C ruling: a
  // starved window must NEVER read as a confident result (the pre-ruling
  // behaviour here was novel at confidence 1.0 — explicitly rejected by the
  // mentor as "a false impression of evidential strength").
  const c4 = assessStructuralNovelty(
    { targetCircle: 2, initialClassification: { kind: 'virtue_domain', domains: ['sophrosyne'] } },
    [],
  )
  assert(
    c4.novel === true && c4.confidence === 0 && c4.basis === 'insufficient_history',
    '§2.7 empty window ⇒ novel with ZERO confidence + insufficient_history basis (Q-C ruled)',
  )

  // The ruled wiring detail: the basis check reads TOTAL window size, not the
  // matching-row count. A POPULATED window (≥ floor rows) with ZERO matching
  // rows is the genuinely-novel case — full curve confidence, NO basis field.
  const c4b = assessStructuralNovelty(
    { targetCircle: 2, initialClassification: { kind: 'virtue_domain', domains: ['sophrosyne'] } },
    window, // 6 rows, none matching circle-2/sophrosyne
  )
  assert(
    c4b.novel === true && c4b.confidence === 1 && c4b.basis === undefined,
    '§2.7b populated-but-non-matching window ⇒ genuinely novel at curve confidence, NOT insufficient_history',
  )

  // A below-floor-but-non-empty window is starved too (total size, not zero).
  const c4c = assessStructuralNovelty(
    { targetCircle: 2, initialClassification: { kind: 'virtue_domain', domains: ['sophrosyne'] } },
    [row('household', ['sophrosyne']), row('household', ['sophrosyne'])], // 2 < floor
  )
  assert(
    c4c.novel === true && c4c.confidence === 0 && c4c.basis === 'insufficient_history',
    '§2.7c two-row window (below floor) ⇒ insufficient_history even with matching rows',
  )

  // Saturated: 6+ matches ⇒ confidently NOT novel.
  const saturated = Array.from({ length: 6 }, () => row('household', ['sophrosyne']))
  const c5 = assessStructuralNovelty(
    { targetCircle: 2, initialClassification: { kind: 'virtue_domain', domains: ['sophrosyne'] } },
    saturated,
  )
  assert(c5.novel === false && c5.confidence === 1, '§2.8 saturated ⇒ not novel, full confidence')

  // Friction candidate (no circle, preferred_indifferent): unassessable —
  // novel:true at confidence 0, never a manufactured basis. Surfaced UNCHANGED
  // by the Q-C amendment (ruled): no basis field, even on a starved window
  // (the axes-free branch precedes the starvation check).
  const c6 = assessStructuralNovelty(
    { initialClassification: { kind: 'preferred_indifferent' } },
    window,
  )
  assert(c6.novel === true && c6.confidence === 0 && c6.basis === undefined, '§2.9 friction candidate ⇒ honest zero-confidence (no structural axis to assess), no basis field')
  const c6b = assessStructuralNovelty(
    { initialClassification: { kind: 'preferred_indifferent' } },
    [], // starved window too — friction branch still wins (surfaced unchanged)
  )
  assert(c6b.novel === true && c6b.confidence === 0 && c6b.basis === undefined, '§2.9b friction candidate on a starved window ⇒ still the unchanged friction outcome')

  // Monotone confidence away from the floor (both directions) — AMENDED
  // 2026-08-09: matching-count monotonicity is now asserted over POPULATED
  // windows (each padded to ≥ floor total rows with non-matching rows), since
  // a window whose TOTAL size is below the floor is the starved case (Q-C).
  const pad = Array.from({ length: 3 }, () => row('cosmopolis', ['phronesis']))
  const counts = [0, 1, 2, 3, 4, 5, 6]
  const conf = counts.map((n) =>
    assessStructuralNovelty(
      { targetCircle: 2, initialClassification: { kind: 'virtue_domain', domains: ['andreia'] } },
      [...pad, ...Array.from({ length: n }, () => row('household', ['andreia']))],
    ).confidence,
  )
  assert(conf[0] === 1 && conf[1] > conf[2] && conf[2] > conf[3] && conf[3] === 0 && conf[4] < conf[5] && conf[5] < conf[6], '§2.10 confidence is monotone distance-from-the-floor (populated windows)')
}

// ============================================================================
// §3 Darkness pins — no LIVE/MEASURED path imports this module. AMENDED
// 2026-08-09: the module is now consumed by exactly ONE route — the DARK
// /api/practice/fresh handler (SUBSTRATE_FRESH_ENABLED unset ⇒ 503, zero
// work) — so the pin now asserts (a) the measured/live paths stay clean AND
// (b) the fresh handler genuinely is the consumer (wiring non-vacuity).
// ============================================================================
{
  const importers: string[] = []
  const files = [
    '../../../app/api/reason/route.ts',
    '../../guardrail-sandwich.ts',
    '../trust-core/derive-trust-events.ts',
    '../trust-core/emission-hooks.ts',
    '../practice-suggestion.ts',
  ]
  for (const f of files) {
    const src = readFileSync(join(__dirname, f), 'utf8')
    if (src.includes('idea-loop-types')) importers.push(f)
  }
  assert(importers.length === 0, `§3.1 INV: no live/measured path imports idea-loop-types — found: ${importers.join(', ')}`)

  const freshHandler = readFileSync(
    join(__dirname, '../../../app/api/practice/fresh/handler.ts'),
    'utf8',
  )
  assert(
    freshHandler.includes("from '@/lib/substrate/idea-loop-types'") &&
      freshHandler.includes('assessStructuralNovelty'),
    '§3.2 INV: the dark fresh handler is the module\'s consumer (wiring pin, non-vacuous)',
  )
  assert(
    freshHandler.includes("process.env.SUBSTRATE_FRESH_ENABLED === 'true'"),
    '§3.3 INV: the fresh consumer is flag-gated (dark by default)',
  )
}

// ============================================================================
// §4 Q6 seventh cycleOutcome value ('terminated_by_timeout') — landed at the
// fresh build (2026-08-09), per the ruled follow-up. Compile-time: the union
// accepts it; runtime: assignment round-trips.
// ============================================================================
{
  const outcome: GeneratedCandidate['cycleOutcome'] = 'terminated_by_timeout'
  assert(outcome === 'terminated_by_timeout', '§4.1 cycleOutcome accepts the Q6 seventh value')
}

console.log(`\nidea-loop-types battery: ${passed} passed, ${failed} failed`)
if (failed > 0) {
  console.error('FAILURES:\n - ' + failures.join('\n - '))
  process.exit(1)
}
