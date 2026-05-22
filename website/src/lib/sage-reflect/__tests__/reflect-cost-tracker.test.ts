/**
 * reflect-cost-tracker.test.ts — A2 (PR7) microcent cost-health precision tests.
 *
 * Run (no Supabase, no env — pure arithmetic over the conversion helpers + the
 * extractor's usageToCents; neither constructs a client at module load):
 *   npx tsx src/lib/sage-reflect/__tests__/reflect-cost-tracker.test.ts
 *
 * Coverage:
 *   INV  — the A2 invariant: Σ microcents ÷ 10000 == Σ per-call usageToCents
 *          (no precision lost vs. the per-call rounding the bill applies).
 *   SUB  — the gap A2 closes: a sub-cent pass rounds to 0 INTEGER cents (so
 *          loop_billing_events records 0) yet records > 0 microcents (cost truth).
 *   ACC  — nextCumulativeMicrocents accumulates BigInt-exactly across a pass.
 *   EDGE — centsToMicrocents clamps 0 / negative / non-finite to 0 (no-op writes).
 *
 * Exit code 0 = all pass. Does NOT exercise the Supabase read/write (that is the
 * founder-side live verification in the session close).
 */

import { usageToCents, type ExtractorTokenUsage } from '../reflect-extractor'
import {
  centsToMicrocents,
  microcentsToCents,
  nextCumulativeMicrocents,
} from '../reflect-cost-tracker'

let passCount = 0
let failCount = 0
const failures: string[] = []
function assert(label: string, condition: boolean, detail?: string): void {
  if (condition) {
    passCount++
    console.log(`PASS  ${label}`)
  } else {
    failCount++
    const msg = detail ? `${label} — ${detail}` : label
    failures.push(msg)
    console.log(`FAIL  ${msg}`)
  }
}

// A realistic ≤4-Layer-1 pass (typical Sonnet Q1–Q4 token counts; each call's
// usageToCents is sub-cent, which is exactly the case the integer bill loses).
const PASS_USAGES: ExtractorTokenUsage[] = [
  { input_tokens: 800, output_tokens: 150 },
  { input_tokens: 1200, output_tokens: 300 },
  { input_tokens: 500, output_tokens: 90 },
  { input_tokens: 300, output_tokens: 40 },
]

// ── INV: Σ microcents ÷ 10000 == Σ usageToCents ───────────────────────────────
const perCallCents = PASS_USAGES.map(usageToCents)
const sumCents = perCallCents.reduce((a, b) => a + b, 0)
const perCallMicrocents = perCallCents.map(centsToMicrocents)
const sumMicrocents = perCallMicrocents.reduce((a, b) => a + b, 0)
assert(
  'INV  Σ microcents ÷ 10000 equals Σ per-call usageToCents (no precision lost)',
  Math.abs(microcentsToCents(sumMicrocents) - sumCents) < 1e-9,
  `microcents/10000=${microcentsToCents(sumMicrocents)} vs sumCents=${sumCents}`,
)
// And each microcents recovers the integer sonnet microcents exactly (input*3 + output*15).
assert(
  'INV  per-call microcents == input*3 + output*15 (exact integer recovery)',
  perCallMicrocents.every(
    (mc, i) => mc === PASS_USAGES[i].input_tokens * 3 + PASS_USAGES[i].output_tokens * 15,
  ),
  JSON.stringify(perCallMicrocents),
)

// ── SUB: sub-cent pass rounds to 0 integer cents but records > 0 microcents ────
const subCentUsage: ExtractorTokenUsage = { input_tokens: 100, output_tokens: 10 } // 300 + 150 = 450 microcents = 0.045 cents
const subCents = usageToCents(subCentUsage)
assert(
  'SUB  a sub-cent call rounds to 0 INTEGER cents (the bill records 0)',
  Math.round(subCents) === 0,
  `Math.round(${subCents}) = ${Math.round(subCents)}`,
)
assert(
  'SUB  the same call records > 0 microcents (cost truth preserved)',
  centsToMicrocents(subCents) === 450,
  `centsToMicrocents(${subCents}) = ${centsToMicrocents(subCents)}`,
)

// ── ACC: BigInt accumulation across the pass matches the summed microcents ─────
let cumulative = BigInt(0)
for (const mc of perCallMicrocents) cumulative = nextCumulativeMicrocents(cumulative, mc)
assert(
  'ACC  nextCumulativeMicrocents accumulates to the summed microcents (BigInt-exact)',
  cumulative === BigInt(sumMicrocents),
  `cumulative=${cumulative} vs sum=${sumMicrocents}`,
)
// Fractional / clamped additions never corrupt the BigInt.
assert(
  'ACC  fractional addition is rounded, negative is clamped to 0',
  nextCumulativeMicrocents(BigInt(100), 4.6) === BigInt(105) &&
    nextCumulativeMicrocents(BigInt(100), -50) === BigInt(100),
)

// ── EDGE: clamp 0 / negative / non-finite to 0 (no-op writes) ──────────────────
assert('EDGE centsToMicrocents(0) === 0', centsToMicrocents(0) === 0)
assert('EDGE centsToMicrocents(-1) === 0', centsToMicrocents(-1) === 0)
assert('EDGE centsToMicrocents(NaN) === 0', centsToMicrocents(NaN) === 0)
assert('EDGE centsToMicrocents(Infinity) === 0', centsToMicrocents(Infinity) === 0)
assert('EDGE microcentsToCents round-trips a whole cent', microcentsToCents(10000) === 1)

console.log(`\n${passCount} pass / ${failCount} fail`)
if (failCount > 0) {
  console.log('\nFailures:')
  failures.forEach((f) => console.log(`  - ${f}`))
  process.exit(1)
}
process.exit(0)
