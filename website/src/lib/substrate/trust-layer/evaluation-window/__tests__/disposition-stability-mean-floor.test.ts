/**
 * disposition-stability-mean-floor.test.ts
 *
 * Regression battery for the M-4 mean-floor correction (mentor ruling
 * 2026-08-17, binding; verbatim at
 * operations/trust-layer-2026-07/2026-08-17-mentor-ruling-M4-return-verbatim.md).
 *
 * THE DEFECT: `computeDispositionStability` computed `mean` and used it only to
 * derive variance. Thirty identical readings at ANY proximity level — including
 * thirty `reflexive` — gave stddev 0 and therefore `advanced` at confidence 1.0.
 * Consistently poor reasoning certified as an advanced disposition.
 *
 * THE RULING: "before certifying advanced on this dimension, require that the
 * mean of the readings meets an adequate floor, not merely that the variance is
 * low… low variance on a poor mean must not certify as advanced." Floor value
 * delegated to the builder; founder set it at `principled` (rank 3).
 *
 * SCOPE DISCIPLINE — what this battery deliberately does NOT assert:
 *   - It does not assert the dimension is absent from agent-facing surfaces.
 *     That is a separate M-4 obligation with its own coverage.
 *   - It does not assert anything about the PERTURBATION defect, which is NOT
 *     fixed and is the reason the dimension is retired rather than repaired.
 *   - It does not touch `describeDispositionStability` in layer2-mechanisms.ts.
 *     That is an unrelated function that happens to share the name and lives
 *     INSIDE the signed Layer-2 assessment; changing it would break signature
 *     canonicalisation while fixing nothing here.
 *
 * The function under test is not exported, so every case drives the real
 * `computeWindowSnapshot` entry point — the same path production uses.
 *
 * Run: npx tsx src/lib/substrate/trust-layer/evaluation-window/__tests__/disposition-stability-mean-floor.test.ts
 */

import {
  computeWindowSnapshot,
  ADVANCED_MEAN_FLOOR,
} from '../window-aggregator'
import { DEFAULT_WINDOW_CONFIG } from '../../types/evaluation'
import type { EvaluatedAction } from '../../types/evaluation'
import type { KatorthomaProximityLevel } from '../../types/accreditation'
import { PROXIMITY_RANK } from '../../accreditation/accreditation-record'

let passCount = 0
let failCount = 0
const failures: string[] = []

function assert(name: string, condition: boolean, detail?: string): void {
  if (condition) {
    passCount++
    console.log(`  PASS  ${name}`)
  } else {
    failCount++
    failures.push(`${name}${detail ? ` — ${detail}` : ''}`)
    console.log(`  FAIL  ${name}${detail ? ` — ${detail}` : ''}`)
  }
}

function action(proximity: KatorthomaProximityLevel, i: number): EvaluatedAction {
  return {
    receipt_id: `r${i}`,
    agent_id: 'test:mean-floor@v1',
    evaluated_at: new Date(Date.UTC(2026, 0, 1 + i)).toISOString(),
    proximity,
    is_kathekon: true,
    kathekon_quality: 'moderate',
    passions_detected: [],
    virtue_domains_engaged: ['phronesis'],
    oikeiosis_met: true,
    oikeiosis_stage: 'household',
    ruling_faculty_state: 'stable',
    skill_id: 'test',
    candidates_considered: 2,
  }
}

/** N identical readings at one level — the exact shape the ruling names. */
function uniform(proximity: KatorthomaProximityLevel, n = 30): EvaluatedAction[] {
  return Array.from({ length: n }, (_, i) => action(proximity, i))
}

function stabilityOf(actions: EvaluatedAction[]) {
  const snap = computeWindowSnapshot('test:mean-floor@v1', actions, actions.length, DEFAULT_WINDOW_CONFIG)
  return snap.dimension_detail.disposition_stability
}

function main(): void {
  console.log('\n=== §1  The demonstrated defect: uniform readings by level ===\n')

  // Every one of these has stddev EXACTLY 0 — maximal "stability". Pre-fix,
  // all five returned `advanced`. Post-fix, only those whose mean meets the
  // floor may.
  const expectations: [KatorthomaProximityLevel, boolean][] = [
    ['reflexive', false],   // mean 0 — the headline case from the ruling
    ['habitual', false],    // mean 1
    ['deliberate', false],  // mean 2 — still below floor
    ['principled', true],   // mean 3 — exactly at the floor, must pass
    ['sage_like', true],    // mean 4
  ]

  for (const [proximity, shouldBeAdvanced] of expectations) {
    const d = stabilityOf(uniform(proximity))
    const mean = PROXIMITY_RANK[proximity]
    assert(
      `1.${proximity}  30× ${proximity} (mean ${mean}, stddev 0) → ${shouldBeAdvanced ? 'advanced' : 'NOT advanced'}`,
      (d.level === 'advanced') === shouldBeAdvanced,
      `got level='${d.level}'`
    )
  }

  console.log('\n=== §2  Non-vacuity: the test would fail without the fix ===\n')

  // If this battery is to mean anything, the capped cases must be ones the
  // PRE-FIX code would genuinely have certified `advanced`. Pre-fix the sole
  // condition was `stddev < 0.4`. Assert that condition genuinely holds for a
  // capped case — otherwise §1 passes for the wrong reason (e.g. the fixture
  // never reached the advanced branch at all) and would keep passing if the
  // fix were reverted.
  const reflexive = uniform('reflexive')
  const ranks = reflexive.map(a => PROXIMITY_RANK[a.proximity])
  const mean = ranks.reduce((a, b) => a + b, 0) / ranks.length
  const stddev = Math.sqrt(ranks.reduce((acc, r) => acc + (r - mean) ** 2, 0) / ranks.length)

  assert(
    '2.1  the capped fixture DOES satisfy the pre-fix condition (stddev < 0.4)',
    stddev < 0.4,
    `stddev=${stddev}`
  )
  assert(
    '2.2  …and fails ONLY on the new mean condition',
    mean < ADVANCED_MEAN_FLOOR,
    `mean=${mean} floor=${ADVANCED_MEAN_FLOOR}`
  )

  console.log('\n=== §3  The cap is disclosed, not silent ===\n')

  const capped = stabilityOf(uniform('deliberate'))
  assert(
    '3.1  a capped reading is certified `established`, not demoted further',
    capped.level === 'established',
    `got '${capped.level}'`
  )
  assert(
    '3.2  its indicators SAY the level was capped by the mean',
    capped.indicators.some(i => /below the standard required to certify an advanced/i.test(i)),
    `indicators=${JSON.stringify(capped.indicators)}`
  )
  assert(
    '3.3  it still records that consistency was observed',
    capped.indicators.some(i => /highly consistent/i.test(i)),
    `indicators=${JSON.stringify(capped.indicators)}`
  )

  console.log('\n=== §4  Boundary: the floor is inclusive ===\n')

  // `principled` sits exactly ON the floor. A `>` rather than `>=` would
  // silently deny every genuinely advanced disposition that is not sage_like.
  assert(
    '4.1  mean exactly === ADVANCED_MEAN_FLOOR certifies advanced',
    stabilityOf(uniform('principled')).level === 'advanced'
  )
  assert(
    '4.2  ADVANCED_MEAN_FLOOR is the founder-set principled rank (3)',
    ADVANCED_MEAN_FLOOR === PROXIMITY_RANK.principled,
    `floor=${ADVANCED_MEAN_FLOOR} principled=${PROXIMITY_RANK.principled}`
  )

  console.log('\n=== §5  No regression on the variance branches ===\n')

  // Alternating reflexive/sage_like: stddev 2.0 — far above every threshold.
  // The mean is 2.0, but the mean must not affect anything below `advanced`.
  const alternating = Array.from({ length: 30 }, (_, i) =>
    action(i % 2 === 0 ? 'reflexive' : 'sage_like', i)
  )
  assert(
    '5.1  high variance still reads `emerging` (mean floor changes nothing here)',
    stabilityOf(alternating).level === 'emerging',
    `got '${stabilityOf(alternating).level}'`
  )

  // A high-mean, moderate-variance set must be unaffected by the floor.
  const mixedHigh = Array.from({ length: 30 }, (_, i) =>
    action(i % 3 === 0 ? 'deliberate' : 'sage_like', i)
  )
  const mh = stabilityOf(mixedHigh)
  assert(
    '5.2  a high-mean mixed set is graded by variance alone, not capped',
    mh.level !== 'advanced' ? mh.level === 'established' || mh.level === 'developing' : true,
    `got '${mh.level}'`
  )

  assert(
    '5.3  under-5-action guard still short-circuits to emerging',
    stabilityOf(uniform('sage_like', 4)).level === 'emerging',
    `got '${stabilityOf(uniform('sage_like', 4)).level}'`
  )

  console.log('')
  console.log(`Total: ${passCount + failCount}  Pass: ${passCount}  Fail: ${failCount}`)
  if (failCount > 0) {
    console.log('')
    console.log('FAILURES:')
    for (const f of failures) console.log(`  - ${f}`)
  }
}

main()
process.exit(failCount === 0 ? 0 : 1)
