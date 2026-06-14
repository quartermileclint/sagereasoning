/**
 * Verification tests for the structured mentor observation contract.
 *
 * These test the validation logic that prevents contaminated (raw LLM text)
 * observations from reaching the database. The validation is the primary
 * data quality gate — if it passes bad data, the entire refactor fails.
 *
 * Run: npx tsx <this file>
 */

import {
  validateMentorObservation,
  VALID_CATEGORIES,
  VALID_CONFIDENCE_LEVELS,
  type MentorObservationInput,
  type ValidationResult,
} from '../mentor-observation-logger'

let passed = 0
let failed = 0
const failures: string[] = []

function assert(condition: boolean, label: string): void {
  if (condition) { passed++ } else { failed++; failures.push(label); console.error('FAIL: ' + label) }
}

// ─── Helper ─────────────────────────────────────────────────────────

function validInput(overrides: Partial<MentorObservationInput> = {}): MentorObservationInput {
  return {
    date: '2026-04-13',
    observation: 'Founder consistently avoids naming fear as a passion — possible andreia blind spot that recurs across multiple reflection sessions.',
    category: 'reasoning_pattern',
    confidence: 'medium',
    source_context: 'evening_reflection',
    ...overrides,
  }
}

function expectValid(result: ValidationResult, label: string): void {
  assert(Object.is(result.valid, true), label + ': result.valid === true')
  assert(result.errors.length === 0, label + ': result.errors has length 0')
}

function expectInvalid(result: ValidationResult, label: string, errorFragment?: string): void {
  assert(Object.is(result.valid, false), label + ': result.valid === false')
  assert(result.errors.length > 0, label + ': result.errors.length > 0')
  if (errorFragment) {
    assert(result.errors.some(e => e.includes(errorFragment)), label + ': some error includes "' + errorFragment + '"')
  }
}

// ─── Valid observations ─────────────────────────────────────────────

// validateMentorObservation — valid inputs: accepts a well-formed third-person observation
expectValid(
  validateMentorObservation(validInput()),
  'valid inputs: accepts a well-formed third-person observation'
)

// validateMentorObservation — valid inputs: accepts all valid categories
for (const category of VALID_CATEGORIES) {
  expectValid(
    validateMentorObservation(validInput({ category })),
    'valid inputs: accepts category "' + category + '"'
  )
}

// validateMentorObservation — valid inputs: accepts all valid confidence levels
for (const confidence of VALID_CONFIDENCE_LEVELS) {
  expectValid(
    validateMentorObservation(validInput({ confidence })),
    'valid inputs: accepts confidence "' + confidence + '"'
  )
}

// validateMentorObservation — valid inputs: accepts observations at minimum length (50 chars)
{
  const obs = 'Founder showed consistent pattern of avoiding difficult conversations.'
  assert(obs.length >= 50, 'valid inputs: min-length fixture is >= 50 chars')
  expectValid(
    validateMentorObservation(validInput({ observation: obs })),
    'valid inputs: accepts observation at minimum length (50 chars)'
  )
}

// validateMentorObservation — valid inputs: accepts observations at maximum length (500 chars)
{
  const obs = 'A'.repeat(500)
  expectValid(
    validateMentorObservation(validInput({ observation: obs })),
    'valid inputs: accepts observation at maximum length (500 chars)'
  )
}

// ─── First-person mentor language rejection ─────────────────────────

const contaminatedExamples = [
  'I noticed the founder seems afraid of public speaking and community engagement events.',
  'You should work on courage more deliberately in the coming weeks of practice.',
  'Your tendency to avoid difficult conversations shows a pattern of phobos.',
  'I think this reflects a deeper issue with how the founder approaches risk.',
  'You are showing improvement in catching passions before acting on them reflexively.',
  'I would recommend focusing on the andreia dimension going forward now.',
  'My observation is that the founder struggles with philodoxia in product work.',
  'Let me note that the founder has been avoiding self-examination this week.',
  "I'd push back on this — the founder is rationalising a fear-based decision pattern.",
  'You could try approaching the community engagement with more deliberate reasoning.',
  'You seem to be making progress on catching false judgements before assenting to them.',
  'You need to examine the underlying false judgement more carefully in reflection.',
  'You have shown a recurring pattern of avoiding conversations about andreia.',
  'I believe the founder is underestimating the role of philodoxia in decisions.',
]

// validateMentorObservation — rejects first-person mentor language
for (const observation of contaminatedExamples) {
  // Pad short observations to meet minimum length
  const padded = observation.length < 50
    ? observation + ' ' + 'x'.repeat(50 - observation.length)
    : observation
  expectInvalid(
    validateMentorObservation(validInput({ observation: padded })),
    'rejects first-person mentor language: "' + observation + '"',
    'first-person mentor language'
  )
}

// ─── Valid third-person observations that should pass ────────────────

const goodExamples = [
  'Founder consistently avoids naming fear as a passion — possible andreia blind spot across sessions.',
  'Recurring pattern: philodoxia surfaces when product decisions involve public-facing features or positioning.',
  'Growing capacity to catch false judgements before acting on them — pre-assent rate improving.',
  'Founder named the false judgement in real time for the first time during this reflection session today.',
  'Divergence between stated values (justice first) and observed behaviour (revenue optimisation) noted.',
  'The reflection showed awareness of phobos but rationalised it as prudence — a common early-stage pattern.',
  'Passion intensity appears lower when the founder journals within 24 hours of the triggering event.',
  'Oikeiosis extension stalled at community stage — actions remain directed at household circle only.',
]

// validateMentorObservation — accepts correct third-person observations
for (const observation of goodExamples) {
  expectValid(
    validateMentorObservation(validInput({ observation })),
    'accepts correct third-person observation: "' + observation + '"'
  )
}

// ─── Date validation ────────────────────────────────────────────────

// validateMentorObservation — date validation: rejects invalid date format
expectInvalid(
  validateMentorObservation(validInput({ date: '13/04/2026' })),
  'date validation: rejects invalid date format',
  'date format'
)

// validateMentorObservation — date validation: rejects empty date
expectInvalid(
  validateMentorObservation(validInput({ date: '' })),
  'date validation: rejects empty date',
  'date format'
)

// validateMentorObservation — date validation: accepts valid YYYY-MM-DD
expectValid(
  validateMentorObservation(validInput({ date: '2026-01-01' })),
  'date validation: accepts valid YYYY-MM-DD'
)

// ─── Length validation ──────────────────────────────────────────────

// validateMentorObservation — length validation: rejects too-short observations
expectInvalid(
  validateMentorObservation(validInput({ observation: 'Too short.' })),
  'length validation: rejects too-short observations',
  'too short'
)

// validateMentorObservation — length validation: rejects too-long observations.
// Reconciled 2026-06-13 (closes task_d8be6b33): the validator drift surfaced
// when this Jest file was first run during the Jest→tsx conversion (Jest was
// never installed, so it had never executed). The validator had drifted to a
// max of 1000 while the binding DB CHECK on mentor_observations_structured.
// observation caps at 500 (50–500 chars), so 501–1000 observations passed
// validation then failed at insert. The validator is now aligned to 500, and
// this assertion (which always expected rejection at 501, matching the DB) is
// re-enabled and passes.
expectInvalid(
  validateMentorObservation(validInput({ observation: 'A'.repeat(501) })),
  'length validation: rejects too-long observations',
  'too long'
)

// ─── Category and confidence validation ─────────────────────────────

// validateMentorObservation — enum validation: rejects invalid category
expectInvalid(
  validateMentorObservation(validInput({ category: 'random_thing' as any })),
  'enum validation: rejects invalid category',
  'Invalid category'
)

// validateMentorObservation — enum validation: rejects invalid confidence
expectInvalid(
  validateMentorObservation(validInput({ confidence: 'very_high' as any })),
  'enum validation: rejects invalid confidence',
  'Invalid confidence'
)

// validateMentorObservation — enum validation: rejects empty source_context
expectInvalid(
  validateMentorObservation(validInput({ source_context: '' })),
  'enum validation: rejects empty source_context',
  'source_context is required'
)

console.log('\n' + passed + ' passed, ' + failed + ' failed')
if (failed > 0) {
  console.error('\nFailures:')
  for (const f of failures) console.error('  - ' + f)
  process.exit(1)
}
