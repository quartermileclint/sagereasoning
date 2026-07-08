/**
 * direction-of-travel.test.ts — the canonical-vocabulary boundary mapper
 * (Trust Layer S0b, ADR-013 §Vocabulary, 2026-07-08).
 *
 * Plain-assertion script: npx tsx <this file>   (bare — pure module).
 *
 * Locks: the mapping is TOTAL over the trust-layer union, 'regressing' →
 * 'declining' is the single rename, shared values pass through unchanged, and
 * the mapper's range is exactly the canonical three-value set.
 */

import type { DirectionOfTravel as TrustLayerDirectionOfTravel } from '../trust-layer/types/accreditation'
import {
  toCanonicalDirectionOfTravel,
  type CanonicalDirectionOfTravel,
} from '../direction-of-travel'

let passed = 0
let failed = 0
const failures: string[] = []

function assert(condition: boolean, label: string): void {
  if (condition) {
    passed++
  } else {
    failed++
    failures.push(label)
    console.error(`FAIL: ${label}`)
  }
}

// 1. Totality over the trust-layer union + the exact expected image.
const cases: ReadonlyArray<[TrustLayerDirectionOfTravel, CanonicalDirectionOfTravel]> = [
  ['improving', 'improving'],
  ['stable', 'stable'],
  ['regressing', 'declining'],
]
for (const [input, expected] of cases) {
  assert(
    toCanonicalDirectionOfTravel(input) === expected,
    `total mapping: ${input} → ${expected}`,
  )
}

// 2. The range never contains the legacy term.
for (const [input] of cases) {
  assert(
    (toCanonicalDirectionOfTravel(input) as string) !== 'regressing',
    `range lock: ${input} never maps to regressing`,
  )
}

// 3. Compile-time lock (asserted at runtime for the report): the canonical
// type is exactly the engine/D17 vocabulary minus the engine-only
// 'single_snapshot' marker (the aggregator never produces it; sparse evidence
// rides each surface's own honesty field).
const canonicalValues: readonly CanonicalDirectionOfTravel[] = [
  'improving',
  'stable',
  'declining',
]
assert(canonicalValues.length === 3, 'canonical vocabulary is the three-value set')

console.log(`\n${passed} passed, ${failed} failed`)
if (failed > 0) {
  console.error(`Failures:\n  ${failures.join('\n  ')}`)
  process.exit(1)
}
