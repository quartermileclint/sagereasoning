/**
 * abuse-detector.test.ts — A19 request_velocity_anomaly unit proof (PR1 single
 * detector).
 *
 * Plain-assertion tsx script (house pattern — no Jest). Supabase-free AND
 * config-free (the detector is pure; thresholds are passed in), so it runs with
 * plain tsx — no --env-file:
 *   cd website && npx tsx src/lib/abuse-detection/__tests__/abuse-detector.test.ts
 *
 * Proves the per-identity request-velocity detector:
 *  - a clear burst trips at/above N x the identity's other-window mean,
 *  - it is silent below the threshold (no false positive on flat traffic),
 *  - it honours the min-prior-windows guard (a new identity cannot trip it),
 *  - it honours the absolute-floor guard (no firing on near-zero noise),
 *  - the baseline EXCLUDES the busiest window (a single burst can't dilute itself),
 *  - the emitted shape matches the AbuseSignal contract the endpoint persists.
 */
import { detectRequestVelocityAnomaly } from '../abuse-detector'

const N = 3.0
const MIN_PRIOR = 5
const FLOOR = 5

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

// 1 — Clear burst trips (5 prior windows @5 + 1 window @50 => baseline 5, multiple 10x).
const a1 = detectRequestVelocityAnomaly({
  agentId: 'id-burst', windowCount: 6, totalRequests: 75, maxWindowRequests: 50,
  multiplier: N, minPriorWindows: MIN_PRIOR, absoluteFloorRequests: FLOOR,
})
check('clear burst -> signal', a1 !== null)
check('signal_type = request_velocity_anomaly', a1?.signal_type === 'request_velocity_anomaly')
check('scope = agentId', a1?.scope === 'id-burst')
check('severity = warning', a1?.severity === 'warning')
check('observed_value = busiest window (50)', a1?.observed_value === 50)
check('multiple ~ 10', a1 !== null && Math.abs(a1.multiple - 10) < 1e-9)
check('threshold_value = baseline*N (15)', a1?.threshold_value === 15)
check('message names A19 + identity', !!a1 && a1.message.includes('A19 ABUSE SIGNAL') && a1.message.includes('id-burst'))
check('details.prior_windows = 5', a1?.details.prior_windows === 5)

// 2 — Flat-normal identity -> no signal (6 windows @8 => baseline 8, multiple 1x).
const a2 = detectRequestVelocityAnomaly({
  agentId: 'id-flat', windowCount: 6, totalRequests: 48, maxWindowRequests: 8,
  multiplier: N, minPriorWindows: MIN_PRIOR, absoluteFloorRequests: FLOOR,
})
check('flat-normal -> no signal (no false positive)', a2 === null)

// 3 — Just below threshold -> no signal (5 prior @10 + 1 @29 => baseline 10, 2.9x < 3x).
const a3 = detectRequestVelocityAnomaly({
  agentId: 'id-below', windowCount: 6, totalRequests: 79, maxWindowRequests: 29,
  multiplier: N, minPriorWindows: MIN_PRIOR, absoluteFloorRequests: FLOOR,
})
check('2.9x (below 3x) -> no signal', a3 === null)

// 4 — Exactly at threshold -> signal (5 prior @10 + 1 @30 => baseline 10, exactly 3x).
const a4 = detectRequestVelocityAnomaly({
  agentId: 'id-exact', windowCount: 6, totalRequests: 80, maxWindowRequests: 30,
  multiplier: N, minPriorWindows: MIN_PRIOR, absoluteFloorRequests: FLOOR,
})
check('exactly 3x -> signal (>= boundary)', a4 !== null)
check('exact multiple = 3', a4 !== null && Math.abs(a4.multiple - 3) < 1e-9)

// 5 — Insufficient history -> no signal (only 4 prior windows < MIN_PRIOR=5, despite a huge burst).
const a5 = detectRequestVelocityAnomaly({
  agentId: 'id-new', windowCount: 5, totalRequests: 54, maxWindowRequests: 50,
  multiplier: N, minPriorWindows: MIN_PRIOR, absoluteFloorRequests: FLOOR,
})
check('insufficient prior windows -> no signal', a5 === null)

// 6 — Absolute floor guard: candidate below floor -> no signal (busiest window only 4 < FLOOR=5).
const a6 = detectRequestVelocityAnomaly({
  agentId: 'id-tiny', windowCount: 6, totalRequests: 9, maxWindowRequests: 4,
  multiplier: N, minPriorWindows: MIN_PRIOR, absoluteFloorRequests: FLOOR,
})
check('candidate below floor -> no signal', a6 === null)

// 7 — Absolute floor guard: baseline below floor -> no signal (busiest 50, but 5 prior @1 => mean 1 < FLOOR).
//     Protects against a low-traffic identity with one busy window tripping on a ~0 baseline.
const a7 = detectRequestVelocityAnomaly({
  agentId: 'id-lowbase', windowCount: 6, totalRequests: 55, maxWindowRequests: 50,
  multiplier: N, minPriorWindows: MIN_PRIOR, absoluteFloorRequests: FLOOR,
})
check('baseline below floor -> no signal (no div-by-~0 trip)', a7 === null)

// 8 — Baseline EXCLUDES the busiest window: 5 prior @6 (=30) + busiest @60 => total 90.
//     If the busiest were wrongly included, baseline would be 90/6=15 => 4x; correct
//     baseline is 30/5=6 => 10x. Assert the 10x (exclusion) behaviour.
const a8 = detectRequestVelocityAnomaly({
  agentId: 'id-excl', windowCount: 6, totalRequests: 90, maxWindowRequests: 60,
  multiplier: N, minPriorWindows: MIN_PRIOR, absoluteFloorRequests: FLOOR,
})
check('baseline excludes the busiest window (multiple = 10, not 4)', a8 !== null && Math.abs(a8.multiple - 10) < 1e-9)

console.log(`\n${passed} passed, ${failed} failed`)
if (failed > 0) process.exit(1)
