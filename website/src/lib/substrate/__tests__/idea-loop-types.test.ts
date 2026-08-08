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

  // Empty window ⇒ confidently novel.
  const c4 = assessStructuralNovelty(
    { targetCircle: 2, initialClassification: { kind: 'virtue_domain', domains: ['sophrosyne'] } },
    [],
  )
  assert(c4.novel === true && c4.confidence === 1, '§2.7 empty window ⇒ novel at full confidence')

  // Saturated: 6+ matches ⇒ confidently NOT novel.
  const saturated = Array.from({ length: 6 }, () => row('household', ['sophrosyne']))
  const c5 = assessStructuralNovelty(
    { targetCircle: 2, initialClassification: { kind: 'virtue_domain', domains: ['sophrosyne'] } },
    saturated,
  )
  assert(c5.novel === false && c5.confidence === 1, '§2.8 saturated ⇒ not novel, full confidence')

  // Friction candidate (no circle, preferred_indifferent): unassessable —
  // novel:true at confidence 0, never a manufactured basis.
  const c6 = assessStructuralNovelty(
    { initialClassification: { kind: 'preferred_indifferent' } },
    window,
  )
  assert(c6.novel === true && c6.confidence === 0, '§2.9 friction candidate ⇒ honest zero-confidence (no structural axis to assess)')

  // Monotone confidence away from the floor (both directions).
  const counts = [0, 1, 2, 3, 4, 5, 6]
  const conf = counts.map((n) =>
    assessStructuralNovelty(
      { targetCircle: 2, initialClassification: { kind: 'virtue_domain', domains: ['andreia'] } },
      Array.from({ length: n }, () => row('household', ['andreia'])),
    ).confidence,
  )
  assert(conf[0] === 1 && conf[1] > conf[2] && conf[2] > conf[3] && conf[3] === 0 && conf[4] < conf[5] && conf[5] < conf[6], '§2.10 confidence is monotone distance-from-the-floor')
}

// ============================================================================
// §3 Darkness pins — no live path imports this module
// ============================================================================
{
  const importers: string[] = []
  const roots = ['../../../app/api', '../..']
  void roots // enumerated below via targeted greps instead of a tree walk
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
  assert(importers.length === 0, `§3.1 INV: no live path imports idea-loop-types (dark/unconsumed) — found: ${importers.join(', ')}`)
}

console.log(`\nidea-loop-types battery: ${passed} passed, ${failed} failed`)
if (failed > 0) {
  console.error('FAILURES:\n - ' + failures.join('\n - '))
  process.exit(1)
}
