/**
 * cost-alert-detector.test.ts — A13 D5 + D4 unit proof (PR1 single-rule, then
 * surface rollout).
 *
 * Plain-assertion tsx script (house pattern — no Jest). Supabase-free AND
 * stripe-free (the detectors are pure; thresholds are passed in), so it runs with
 * plain tsx — no --env-file:
 *   cd website && npx tsx src/lib/cost-alerts/__tests__/cost-alert-detector.test.ts
 *
 * Proves both spike detectors:
 *  - D5 per-identity anomaly: trips at/above N x the identity's other-loop mean,
 *  - D4 per-call (global) spike: trips at/above N x the global other-loop mean,
 *  - both are silent below the threshold,
 *  - both honour the min-prior-loops + absolute-floor guards (false-positive
 *    protection).
 */
import {
  detectPerIdentityAnomaly,
  detectPerCallSpike,
  detectRevenueCostRatio,
  detectOpsMonthlyCap,
  detectRolling7DaySpike,
} from '../cost-alert-detector'

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

// ── D4 — per-call (global) cost spike (mirrors D5, scope 'global') ────────────
const N4 = 2.0
const MIN_PRIOR4 = 5
const FLOOR4 = 1

// 8 — Clear global spike trips (5 prior @3 + 1 @30 => baseline 3, multiple 10x).
const b1 = detectPerCallSpike({
  loopCount: 6, totalCostCents: 45, maxLoopCostCents: 30,
  multiplier: N4, minPriorLoops: MIN_PRIOR4, absoluteFloorCents: FLOOR4,
})
check('D4 clear global spike -> alert', b1 !== null)
check('D4 detector_type = per_call_spike', b1?.detector_type === 'per_call_spike')
check('D4 scope = global', b1?.scope === 'global')
check('D4 severity = warning', b1?.severity === 'warning')
check('D4 observed_value = max loop (30)', b1?.observed_value === 30)
check('D4 multiple ~ 10', b1 !== null && Math.abs(b1.multiple - 10) < 1e-9)
check('D4 message names R5', !!b1 && b1.message.includes('R5 ALERT'))

// 9 — Flat population -> no alert (6 @3 => baseline 3, multiple 1x).
const b2 = detectPerCallSpike({
  loopCount: 6, totalCostCents: 18, maxLoopCostCents: 3,
  multiplier: N4, minPriorLoops: MIN_PRIOR4, absoluteFloorCents: FLOOR4,
})
check('D4 flat population -> no alert (no false positive)', b2 === null)

// 10 — Insufficient history: loopCount 5 => priorCount 4 < 5, even with a big spike.
const b3 = detectPerCallSpike({
  loopCount: 5, totalCostCents: 42, maxLoopCostCents: 30,
  multiplier: N4, minPriorLoops: MIN_PRIOR4, absoluteFloorCents: FLOOR4,
})
check('D4 insufficient history -> no alert', b3 === null)

// 11 — Exactly at threshold (baseline 5, max 10 => 2.0x) -> alert (>= inclusive).
const b4 = detectPerCallSpike({
  loopCount: 6, totalCostCents: 35, maxLoopCostCents: 10,
  multiplier: N4, minPriorLoops: MIN_PRIOR4, absoluteFloorCents: FLOOR4,
})
check('D4 exactly 2.0x -> alert (boundary inclusive)', b4 !== null && Math.abs(b4.multiple - 2.0) < 1e-9)

// 12 — Just below threshold (baseline 5, max 9 => 1.8x) -> no alert.
const b5 = detectPerCallSpike({
  loopCount: 6, totalCostCents: 34, maxLoopCostCents: 9,
  multiplier: N4, minPriorLoops: MIN_PRIOR4, absoluteFloorCents: FLOOR4,
})
check('D4 just below 2.0x -> no alert', b5 === null)

// 13 — Near-zero baseline guard (5 prior @0 + 1 @10): baseline 0 < floor -> no alert.
const b6 = detectPerCallSpike({
  loopCount: 6, totalCostCents: 10, maxLoopCostCents: 10,
  multiplier: N4, minPriorLoops: MIN_PRIOR4, absoluteFloorCents: FLOOR4,
})
check('D4 near-zero baseline -> no alert (floor guard)', b6 === null)

// 14 — Candidate below floor (all zero): max 0 -> no alert.
const b7 = detectPerCallSpike({
  loopCount: 6, totalCostCents: 0, maxLoopCostCents: 0,
  multiplier: N4, minPriorLoops: MIN_PRIOR4, absoluteFloorCents: FLOOR4,
})
check('D4 candidate below floor -> no alert', b7 === null)

// ── D1 — revenue:cost ratio (global) ─────────────────────────────────────────
// 15 — Ratio below the 2.0x minimum -> alert (rev 100, cost 100 => 1.0x).
const c1 = detectRevenueCostRatio({ revenueCents: 100, llmCostCents: 100, minRatio: 2.0 })
check('D1 ratio below min -> alert', c1 !== null)
check('D1 detector_type = revenue_cost_ratio', c1?.detector_type === 'revenue_cost_ratio')
check('D1 scope = global', c1?.scope === 'global')
check('D1 observed_value = ratio (1.0)', c1 !== null && Math.abs(c1.observed_value - 1.0) < 1e-9)

// 16 — Ratio at/above the minimum -> no alert (rev 200, cost 100 => 2.0x).
const c2 = detectRevenueCostRatio({ revenueCents: 200, llmCostCents: 100, minRatio: 2.0 })
check('D1 ratio at threshold -> no alert', c2 === null)

// 17 — No cost yet -> no alert (ratio undefined; pre-revenue state).
const c3 = detectRevenueCostRatio({ revenueCents: 100, llmCostCents: 0, minRatio: 2.0 })
check('D1 no cost -> no alert', c3 === null)

// ── D2 — Sage Ops monthly cap (global) ───────────────────────────────────────
// 18 — Over the cap -> alert (ops 15000 > 10000 => 1.5x).
const d1 = detectOpsMonthlyCap({ opsCostCents: 15000, capCents: 10000 })
check('D2 over cap -> alert', d1 !== null)
check('D2 observed_value = ops spend (15000)', d1?.observed_value === 15000)
check('D2 multiple ~ 1.5', d1 !== null && Math.abs(d1.multiple - 1.5) < 1e-9)

// 19 — At/under the cap -> no alert (ops 10000 == cap).
const d2 = detectOpsMonthlyCap({ opsCostCents: 10000, capCents: 10000 })
check('D2 at cap -> no alert', d2 === null)

// ── D3 — rolling 7-day spike (global) ────────────────────────────────────────
// 20 — Today >= 2x prior average -> alert (100 vs avg 40 over 5 days => 2.5x).
const e1 = detectRolling7DaySpike({ todayCents: 100, priorAvgCents: 40, daysObserved: 5, minDaysObserved: 3, multiplier: 2.0 })
check('D3 spike -> alert', e1 !== null)
check('D3 detector_type = rolling_7day_spike', e1?.detector_type === 'rolling_7day_spike')
check('D3 multiple ~ 2.5', e1 !== null && Math.abs(e1.multiple - 2.5) < 1e-9)

// 21 — Below the multiplier -> no alert (50 vs avg 40 => 1.25x).
const e2 = detectRolling7DaySpike({ todayCents: 50, priorAvgCents: 40, daysObserved: 5, minDaysObserved: 3, multiplier: 2.0 })
check('D3 below threshold -> no alert', e2 === null)

// 22 — Cold start: fewer than min prior days -> no alert (2 < 3).
const e3 = detectRolling7DaySpike({ todayCents: 100, priorAvgCents: 10, daysObserved: 2, minDaysObserved: 3, multiplier: 2.0 })
check('D3 cold start -> no alert', e3 === null)

// 23 — Zero baseline -> no alert (avg 0 guard).
const e4 = detectRolling7DaySpike({ todayCents: 100, priorAvgCents: 0, daysObserved: 5, minDaysObserved: 3, multiplier: 2.0 })
check('D3 zero baseline -> no alert', e4 === null)

console.log(`\n${passed} passed / ${failed} failed`)
if (failed > 0) process.exit(1)
