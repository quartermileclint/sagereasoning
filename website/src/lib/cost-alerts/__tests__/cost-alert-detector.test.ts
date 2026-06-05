/**
 * cost-alert-detector.test.ts — A13 D5 unit proof (PR1 single-rule).
 *
 * Plain-assertion tsx script (house pattern — no Jest). Supabase-free AND
 * stripe-free (the detector is pure; thresholds are passed in), so it runs with
 * plain tsx — no --env-file:
 *   cd website && npx tsx src/lib/cost-alerts/__tests__/cost-alert-detector.test.ts
 *
 * Proves the per-identity cost-anomaly detector:
 *  - trips at/above N x the identity's other-loop mean,
 *  - is silent below the threshold,
 *  - honours the min-prior-loops + absolute-floor guards (false-positive protection).
 */
import { detectPerIdentityAnomaly } from '../cost-alert-detector'

const N = 2.0
const MIN_PRIOR = 5
const FLOOR = 1

let passed = 0
let failed = 0
function check(name: string, cond: boolean) {
  if (cond) {
    passed++
    console.log(`  PASS: ${name}`)
  } else {
    failed++
    console.error(`  FAIL: ${name}`)
  }
}

// 1 — Clear spike trips (5 prior @3 + 1 @30 => baseline 3, multiple 10x).
const a1 = detectPerIdentityAnomaly({
  agentId: 'id-spike', loopCount: 6, totalCostCents: 45, maxLoopCostCents: 30,
  multiplier: N, minPriorLoops: MIN_PRIOR, absoluteFloorCents: FLOOR,
})
check('clear spike -> alert', a1 !== null)
check('detector_type = per_identity_anomaly', a1?.detector_type === 'per_identity_anomaly')
check('scope = agentId', a1?.scope === 'id-spike')
check('severity = warning', a1?.severity === 'warning')
check('observed_value = max loop (30)', a1?.observed_value === 30)
check('multiple ~ 10', a1 !== null && Math.abs(a1.multiple - 10) < 1e-9)
check('message names R5 + identity', !!a1 && a1.message.includes('R5 ALERT') && a1.message.includes('id-spike'))

// 2 — Flat-normal identity -> no alert (6 @3 => baseline 3, multiple 1x).
const a2 = detectPerIdentityAnomaly({
  agentId: 'id-normal', loopCount: 6, totalCostCents: 18, maxLoopCostCents: 3,
  multiplier: N, minPriorLoops: MIN_PRIOR, absoluteFloorCents: FLOOR,
})
check('flat-normal -> no alert (no false positive)', a2 === null)

// 3 — Insufficient history: loopCount 5 => priorCount 4 < 5, even with a big spike.
const a3 = detectPerIdentityAnomaly({
  agentId: 'id-young', loopCount: 5, totalCostCents: 42, maxLoopCostCents: 30,
  multiplier: N, minPriorLoops: MIN_PRIOR, absoluteFloorCents: FLOOR,
})
check('insufficient history -> no alert', a3 === null)

// 4 — Exactly at threshold (baseline 5, max 10 => 2.0x) -> alert (>= is inclusive).
const a4 = detectPerIdentityAnomaly({
  agentId: 'id-edge', loopCount: 6, totalCostCents: 35, maxLoopCostCents: 10,
  multiplier: N, minPriorLoops: MIN_PRIOR, absoluteFloorCents: FLOOR,
})
check('exactly 2.0x -> alert (boundary inclusive)', a4 !== null && Math.abs(a4.multiple - 2.0) < 1e-9)

// 5 — Just below threshold (baseline 5, max 9 => 1.8x) -> no alert.
const a5 = detectPerIdentityAnomaly({
  agentId: 'id-just-under', loopCount: 6, totalCostCents: 34, maxLoopCostCents: 9,
  multiplier: N, minPriorLoops: MIN_PRIOR, absoluteFloorCents: FLOOR,
})
check('just below 2.0x -> no alert', a5 === null)

// 6 — Near-zero baseline guard (5 prior @0 + 1 @10): baseline 0 < floor -> no alert.
const a6 = detectPerIdentityAnomaly({
  agentId: 'id-zero-base', loopCount: 6, totalCostCents: 10, maxLoopCostCents: 10,
  multiplier: N, minPriorLoops: MIN_PRIOR, absoluteFloorCents: FLOOR,
})
check('near-zero baseline -> no alert (floor guard)', a6 === null)

// 7 — Candidate below floor (all zero): max 0 -> no alert.
const a7 = detectPerIdentityAnomaly({
  agentId: 'id-tiny', loopCount: 6, totalCostCents: 0, maxLoopCostCents: 0,
  multiplier: N, minPriorLoops: MIN_PRIOR, absoluteFloorCents: FLOOR,
})
check('candidate below floor -> no alert', a7 === null)

console.log(`\n${passed} passed / ${failed} failed`)
if (failed > 0) process.exit(1)
