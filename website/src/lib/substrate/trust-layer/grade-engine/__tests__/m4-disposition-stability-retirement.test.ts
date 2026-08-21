/**
 * m4-disposition-stability-retirement.test.ts — M-4 obligation 1 (2026-08-21).
 * Run: npx tsx website/src/lib/substrate/trust-layer/grade-engine/__tests__/m4-disposition-stability-retirement.test.ts
 *
 * Pins the mentor-ruled option (c): retire disposition_stability from
 * certifying `principled_to_sage_like` ONLY. The load-bearing property this
 * battery exists to prove — because a held, REJECTED patch implemented the
 * wrong (global) version of this exact change — is that the three lower
 * rungs (reflexive_to_habitual, habitual_to_deliberate, deliberate_to_principled)
 * are EXHAUSTIVELY, BYTE-BEHAVIOURALLY UNCHANGED across all 4^4 = 256
 * dimension-level combinations, while principled_to_sage_like becomes
 * structurally unreachable (0/256 pass, always, by construction — not a
 * calibration outcome).
 *
 * Adapted from the enumeration method in the held (never-shipped)
 * `2026-08-17-M4-retirement-HELD/rung-analysis.mjs`, now run against the REAL
 * exported functions rather than a hand-copied reimplementation of the ranks.
 */
import {
  dimensionsForThreshold,
  dimensionsMeetFloor,
  dimensionsMeetElevated,
} from '../grade-transition-engine'
import type { DimensionScores, DimensionLevel } from '../../types/accreditation'

let passed = 0
let failed = 0
function check(label: string, cond: boolean, extra?: string) {
  if (cond) {
    passed++
    console.log(`  PASS  ${label}`)
  } else {
    failed++
    console.log(`  FAIL  ${label}${extra ? ` — ${extra}` : ''}`)
  }
}

const LEVELS: DimensionLevel[] = ['emerging', 'developing', 'established', 'advanced']

const THRESHOLDS: Record<string, { min: DimensionLevel; count: number; elev: DimensionLevel }> = {
  reflexive_to_habitual: { min: 'emerging', count: 1, elev: 'developing' },
  habitual_to_deliberate: { min: 'developing', count: 2, elev: 'established' },
  deliberate_to_principled: { min: 'established', count: 3, elev: 'advanced' },
  principled_to_sage_like: { min: 'advanced', count: 4, elev: 'advanced' },
}

function allCombinations(): DimensionScores[] {
  const all: DimensionScores[] = []
  for (const a of LEVELS)
    for (const b of LEVELS)
      for (const c of LEVELS)
        for (const d of LEVELS)
          all.push({
            passion_reduction: a,
            judgement_quality: b,
            disposition_stability: c,
            oikeiosis_extension: d,
          })
  return all
}

function passesGate(levels: Record<string, DimensionLevel>, t: { min: DimensionLevel; count: number; elev: DimensionLevel }): boolean {
  return dimensionsMeetFloor(levels, t.min) && dimensionsMeetElevated(levels, t.count, t.elev)
}

const combos = allCombinations()

// ============================================================================
console.log('\n§1 — dimensionsForThreshold: rung-conditional, not global')
// ============================================================================
{
  const sample: DimensionScores = {
    passion_reduction: 'advanced',
    judgement_quality: 'advanced',
    disposition_stability: 'emerging',
    oikeiosis_extension: 'advanced',
  }
  check(
    '§1.1 at principled_to_sage_like, disposition_stability is REMOVED from the pool',
    !('disposition_stability' in dimensionsForThreshold(sample, 'principled_to_sage_like'))
  )
  check(
    '§1.2 at reflexive_to_habitual, all four dimensions are present, UNCHANGED',
    Object.keys(dimensionsForThreshold(sample, 'reflexive_to_habitual')).length === 4 &&
      dimensionsForThreshold(sample, 'reflexive_to_habitual').disposition_stability === 'emerging'
  )
  check(
    '§1.3 at habitual_to_deliberate, all four dimensions are present, UNCHANGED',
    Object.keys(dimensionsForThreshold(sample, 'habitual_to_deliberate')).length === 4
  )
  check(
    '§1.4 at deliberate_to_principled, all four dimensions are present, UNCHANGED',
    Object.keys(dimensionsForThreshold(sample, 'deliberate_to_principled')).length === 4
  )
  check(
    '§1.5 an unrecognised threshold key is treated as unaffected (defensive default)',
    Object.keys(dimensionsForThreshold(sample, 'some_unknown_key')).length === 4
  )
}

// ============================================================================
console.log('\n§2 — EXHAUSTIVE: the three lower rungs are byte-behaviourally UNCHANGED')
// ============================================================================
{
  for (const rung of ['reflexive_to_habitual', 'habitual_to_deliberate', 'deliberate_to_principled']) {
    const t = THRESHOLDS[rung]
    let mismatches = 0
    let passCount = 0
    for (const lv of combos) {
      const before = passesGate(lv, t) // the pre-fix behaviour: full 4-dim pool
      const after = passesGate(dimensionsForThreshold(lv, rung), t) // the fixed behaviour
      if (before !== after) mismatches++
      if (after) passCount++
    }
    check(
      `§2 ${rung}: 0/256 mismatches between pre-fix and post-fix pass/fail across every combination`,
      mismatches === 0,
      `${mismatches} mismatches found`
    )
    check(
      `§2 ${rung}: non-vacuity — some combinations genuinely pass (not a vacuously-false comparison)`,
      passCount > 0 && passCount < 256,
      `passCount=${passCount}`
    )
  }
}

// ============================================================================
console.log('\n§3 — principled_to_sage_like: structurally UNREACHABLE, by construction')
// ============================================================================
{
  const t = THRESHOLDS['principled_to_sage_like']
  let passCount = 0
  for (const lv of combos) {
    if (passesGate(dimensionsForThreshold(lv, 'principled_to_sage_like'), t)) passCount++
  }
  check(
    '§3.1 0/256 combinations pass principled_to_sage_like post-fix — even all-advanced-except-disposition_stability',
    passCount === 0,
    `passCount=${passCount}`
  )
  // The single most favourable case: everything else maxed out.
  const bestCase: DimensionScores = {
    passion_reduction: 'advanced',
    judgement_quality: 'advanced',
    disposition_stability: 'advanced', // even at its own max, it's excluded from the pool
    oikeiosis_extension: 'advanced',
  }
  check(
    '§3.2 even the best possible case (all four dimensions at advanced) fails principled_to_sage_like post-fix',
    !passesGate(dimensionsForThreshold(bestCase, 'principled_to_sage_like'), t)
  )
  check(
    '§3.3 non-vacuity — that SAME best-case combination WOULD have passed pre-fix (proves the fix genuinely changed something)',
    passesGate(bestCase, t) === true
  )
  check(
    '§3.4 elevated_dimension_count for principled_to_sage_like is untouched at 4 (never retuned — the named dishonest option)',
    t.count === 4
  )
}

// ============================================================================
console.log('\n§4 — non-vacuity: the pre-fix reading of the SAME rung would have allowed promotions')
// ============================================================================
{
  const t = THRESHOLDS['principled_to_sage_like']
  let preFixPassCount = 0
  for (const lv of combos) {
    if (passesGate(lv, t)) preFixPassCount++
  }
  check(
    '§4.1 the pre-fix (unfiltered) principled_to_sage_like check DID allow at least one combination through',
    preFixPassCount > 0,
    `preFixPassCount=${preFixPassCount}`
  )
}

// ============================================================================
console.log(`\n${passed} passed, ${failed} failed`)
if (failed > 0) process.exit(1)
