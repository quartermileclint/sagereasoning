/**
 * abuse-detector-structural.test.ts — A19 structural-detector unit proof
 * (PR1 surface rollout: systematic_enumeration + rapid_input_variation).
 *
 * Plain-assertion tsx script (house pattern — no Jest). Supabase-free AND
 * config-free (the detectors are pure; thresholds are passed in), so it runs
 * with plain tsx — no --env-file:
 *   cd website && npx tsx src/lib/abuse-detection/__tests__/abuse-detector-structural.test.ts
 *
 * Both detectors read STRUCTURAL counts derived from masked_context
 * (input_char_count) ONLY — never raw text (R3 / R17). Detection-only.
 *
 * Proves:
 *  systematic_enumeration (breadth)
 *   - a high distinct-size fraction over enough volume trips,
 *   - below the volume floor is silent (a new/low-volume identity can't trip it),
 *   - a low distinct fraction is silent (organic repeated use),
 *   - the distinct-ratio threshold is an at/above boundary,
 *  rapid_input_variation (temporal churn)
 *   - many large successive jumps in a busy window trips,
 *   - below the window floor is silent,
 *   - a low churn fraction is silent,
 *   - the variation-ratio threshold is an at/above boundary,
 *  and that both emit the AbuseSignal shape the endpoint persists.
 */
import {
  detectSystematicEnumeration,
  detectRapidInputVariation,
} from '../abuse-detector'

// Defaults mirror abuse-thresholds.ts (passed in explicitly; PROVISIONAL there).
const ENUM_MIN = 20
const ENUM_RATIO = 0.9
const VAR_MIN_WINDOW = 10
const VAR_RATIO = 0.8

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

// ── systematic_enumeration ────────────────────────────────────────────────

// 1 — Clear sweep: 20 requests, all 20 sizes distinct (1.0 >= 0.9) -> signal.
const e1 = detectSystematicEnumeration({
  agentId: 'id-sweep', totalRequests: 20, distinctInputSizes: 20,
  minRequests: ENUM_MIN, distinctRatioThreshold: ENUM_RATIO,
})
check('sweep (100% distinct over floor) -> signal', e1 !== null)
check('signal_type = systematic_enumeration', e1?.signal_type === 'systematic_enumeration')
check('scope = agentId', e1?.scope === 'id-sweep')
check('severity = warning', e1?.severity === 'warning')
check('observed_value = distinct sizes (20)', e1?.observed_value === 20)
check('multiple ~ 1.0 (distinct fraction)', e1 !== null && Math.abs(e1.multiple - 1) < 1e-9)
check('message names A19 + identity', !!e1 && e1.message.includes('A19 ABUSE SIGNAL') && e1.message.includes('id-sweep'))

// 2 — Below the volume floor -> no signal (19 < 20), despite 100% distinct.
const e2 = detectSystematicEnumeration({
  agentId: 'id-thin', totalRequests: 19, distinctInputSizes: 19,
  minRequests: ENUM_MIN, distinctRatioThreshold: ENUM_RATIO,
})
check('below volume floor -> no signal', e2 === null)

// 3 — Organic repeated use -> no signal (30 requests, 15 distinct = 0.5 < 0.9).
const e3 = detectSystematicEnumeration({
  agentId: 'id-organic', totalRequests: 30, distinctInputSizes: 15,
  minRequests: ENUM_MIN, distinctRatioThreshold: ENUM_RATIO,
})
check('low distinct fraction -> no signal (no false positive)', e3 === null)

// 4 — Exactly at the ratio threshold -> signal (20 requests, 18 distinct = 0.9).
const e4 = detectSystematicEnumeration({
  agentId: 'id-exact', totalRequests: 20, distinctInputSizes: 18,
  minRequests: ENUM_MIN, distinctRatioThreshold: ENUM_RATIO,
})
check('exactly 0.9 distinct -> signal (>= boundary)', e4 !== null)
check('threshold_value = ceil(0.9*20) = 18', e4?.threshold_value === 18)

// ── rapid_input_variation ─────────────────────────────────────────────────

// 5 — Fuzzing burst: busiest window 10 reqs, 9/9 successive pairs are large jumps (1.0 >= 0.8).
const v1 = detectRapidInputVariation({
  agentId: 'id-fuzz', busiestWindowRequests: 10, largeVariationCount: 9,
  minWindowRequests: VAR_MIN_WINDOW, variationRatioThreshold: VAR_RATIO,
})
check('fuzz burst (100% churn over floor) -> signal', v1 !== null)
check('signal_type = rapid_input_variation', v1?.signal_type === 'rapid_input_variation')
check('scope = agentId', v1?.scope === 'id-fuzz')
check('observed_value = large jumps (9)', v1?.observed_value === 9)
check('multiple ~ 1.0 (churn fraction)', v1 !== null && Math.abs(v1.multiple - 1) < 1e-9)
check('message names A19 + identity', !!v1 && v1.message.includes('A19 ABUSE SIGNAL') && v1.message.includes('id-fuzz'))

// 6 — Below the window floor -> no signal (9 < 10), despite high churn.
const v2 = detectRapidInputVariation({
  agentId: 'id-quiet', busiestWindowRequests: 9, largeVariationCount: 8,
  minWindowRequests: VAR_MIN_WINDOW, variationRatioThreshold: VAR_RATIO,
})
check('below window floor -> no signal', v2 === null)

// 7 — Gentle variation -> no signal (10 reqs, 3/9 large jumps = 0.33 < 0.8).
const v3 = detectRapidInputVariation({
  agentId: 'id-gentle', busiestWindowRequests: 10, largeVariationCount: 3,
  minWindowRequests: VAR_MIN_WINDOW, variationRatioThreshold: VAR_RATIO,
})
check('low churn fraction -> no signal (no false positive)', v3 === null)

// 8 — Exactly at the ratio threshold -> signal (11 reqs => 10 pairs, 8 large = 0.8).
const v4 = detectRapidInputVariation({
  agentId: 'id-exact2', busiestWindowRequests: 11, largeVariationCount: 8,
  minWindowRequests: VAR_MIN_WINDOW, variationRatioThreshold: VAR_RATIO,
})
check('exactly 0.8 churn -> signal (>= boundary)', v4 !== null)
check('threshold_value = ceil(0.8*10) = 8', v4?.threshold_value === 8)
check('successive_pairs = 10 (N-1)', v4?.details.successive_pairs === 10)

console.log(`\n${passed} passed, ${failed} failed`)
if (failed > 0) process.exit(1)
