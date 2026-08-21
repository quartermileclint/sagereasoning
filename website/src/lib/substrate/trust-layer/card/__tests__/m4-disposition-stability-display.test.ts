/**
 * m4-disposition-stability-display.test.ts — M-4 obligation 1, display half
 * (2026-08-21). Run: npx tsx website/src/lib/substrate/trust-layer/card/__tests__/m4-disposition-stability-display.test.ts
 *
 * Pins the two agent-facing display sites the mentor ruling names:
 *   - accreditation-card.ts's buildDimensionIndicators (via buildAccreditationCard)
 *   - agent-hand-back-report.ts's renderGradeSection
 *
 * disposition_stability must be OMITTED at `principled` and `sage_like`
 * proximity, and PRESENT, unchanged, at `reflexive`/`habitual`/`deliberate`.
 */
import { buildAccreditationCard } from '../accreditation-card'
import {
  createAccreditationRecord,
  buildAccreditationPayload,
  PROXIMITY_TO_GRADE,
} from '../../accreditation/accreditation-record'
import { renderGradeSection } from '../../../agent-hand-back-report'
import type { KatorthomaProximityLevel, DimensionScores } from '../../types/accreditation'

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

const FULL_DIMENSIONS: DimensionScores = {
  passion_reduction: 'established',
  judgement_quality: 'established',
  disposition_stability: 'established',
  oikeiosis_extension: 'established',
}

function fixtureRecord(proximity: KatorthomaProximityLevel) {
  return createAccreditationRecord({
    agent_id: `test:m4-display@${proximity}`,
    starting_grade: PROXIMITY_TO_GRADE[proximity],
    starting_proximity: proximity,
    starting_dimensions: FULL_DIMENSIONS,
  })
}

// ============================================================================
console.log('\n§1 — accreditation-card.ts: buildAccreditationCard\'s dimensions array')
// ============================================================================
for (const proximity of ['reflexive', 'habitual', 'deliberate'] as const) {
  const card = buildAccreditationCard(fixtureRecord(proximity))
  check(
    `§1 ${proximity}: disposition_stability IS present (still a live gate input)`,
    card.dimensions.some(d => d.id === 'disposition_stability')
  )
  check(`§1 ${proximity}: all four dimensions present`, card.dimensions.length === 4)
}
for (const proximity of ['principled', 'sage_like'] as const) {
  const card = buildAccreditationCard(fixtureRecord(proximity))
  check(
    `§1 ${proximity}: disposition_stability is ABSENT (retired from display at the top rung)`,
    !card.dimensions.some(d => d.id === 'disposition_stability')
  )
  check(`§1 ${proximity}: exactly three dimensions remain`, card.dimensions.length === 3)
  check(
    `§1 ${proximity}: the other three dimensions are still present, unchanged`,
    ['passion_reduction', 'judgement_quality', 'oikeiosis_extension'].every(id =>
      card.dimensions.some(d => d.id === id)
    )
  )
}

// ============================================================================
console.log('\n§2 — agent-hand-back-report.ts: renderGradeSection\'s dimension-levels bullet')
// ============================================================================
for (const proximity of ['reflexive', 'habitual', 'deliberate'] as const) {
  const payload = buildAccreditationPayload(fixtureRecord(proximity))
  const section = renderGradeSection(payload)
  check(
    `§2 ${proximity}: the bullet includes "disposition_stability:"`,
    section.includes('disposition_stability:')
  )
}
for (const proximity of ['principled', 'sage_like'] as const) {
  const payload = buildAccreditationPayload(fixtureRecord(proximity))
  const section = renderGradeSection(payload)
  check(
    `§2 ${proximity}: the bullet OMITS "disposition_stability:"`,
    !section.includes('disposition_stability:')
  )
  check(
    `§2 ${proximity}: the other three dimensions are still named`,
    section.includes('passion_reduction:') &&
      section.includes('judgement_quality:') &&
      section.includes('oikeiosis_extension:')
  )
}

// ============================================================================
console.log(`\n${passed} passed, ${failed} failed`)
if (failed > 0) process.exit(1)
