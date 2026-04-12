/**
 * Verification tests for the structured mentor observation contract.
 *
 * These test the validation logic that prevents contaminated (raw LLM text)
 * observations from reaching the database. The validation is the primary
 * data quality gate — if it passes bad data, the entire refactor fails.
 *
 * Run: npx jest --testPathPattern=mentor-observation-logger
 */

import {
  validateMentorObservation,
  VALID_CATEGORIES,
  VALID_CONFIDENCE_LEVELS,
  type MentorObservationInput,
  type ValidationResult,
} from '../mentor-observation-logger'

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

function expectValid(result: ValidationResult) {
  expect(result.valid).toBe(true)
  expect(result.errors).toHaveLength(0)
}

function expectInvalid(result: ValidationResult, errorFragment?: string) {
  expect(result.valid).toBe(false)
  expect(result.errors.length).toBeGreaterThan(0)
  if (errorFragment) {
    expect(result.errors.some(e => e.includes(errorFragment))).toBe(true)
  }
}

// ─── Valid observations ─────────────────────────────────────────────

describe('validateMentorObservation — valid inputs', () => {
  test('accepts a well-formed third-person observation', () => {
    expectValid(validateMentorObservation(validInput()))
  })

  test('accepts all valid categories', () => {
    for (const category of VALID_CATEGORIES) {
      expectValid(validateMentorObservation(validInput({ category })))
    }
  })

  test('accepts all valid confidence levels', () => {
    for (const confidence of VALID_CONFIDENCE_LEVELS) {
      expectValid(validateMentorObservation(validInput({ confidence })))
    }
  })

  test('accepts observations at minimum length (50 chars)', () => {
    const obs = 'Founder showed consistent pattern of avoiding difficult conversations.'
    expect(obs.length).toBeGreaterThanOrEqual(50)
    expectValid(validateMentorObservation(validInput({ observation: obs })))
  })

  test('accepts observations at maximum length (500 chars)', () => {
    const obs = 'A'.repeat(500)
    expectValid(validateMentorObservation(validInput({ observation: obs })))
  })
})

// ─── First-person mentor language rejection ─────────────────────────

describe('validateMentorObservation — rejects first-person mentor language', () => {
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

  test.each(contaminatedExamples)(
    'rejects: "%s"',
    (observation) => {
      // Pad short observations to meet minimum length
      const padded = observation.length < 50
        ? observation + ' ' + 'x'.repeat(50 - observation.length)
        : observation
      expectInvalid(
        validateMentorObservation(validInput({ observation: padded })),
        'first-person mentor language'
      )
    }
  )
})

// ─── Valid third-person observations that should pass ────────────────

describe('validateMentorObservation — accepts correct third-person observations', () => {
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

  test.each(goodExamples)(
    'accepts: "%s"',
    (observation) => {
      expectValid(validateMentorObservation(validInput({ observation })))
    }
  )
})

// ─── Date validation ────────────────────────────────────────────────

describe('validateMentorObservation — date validation', () => {
  test('rejects invalid date format', () => {
    expectInvalid(validateMentorObservation(validInput({ date: '13/04/2026' })), 'date format')
  })

  test('rejects empty date', () => {
    expectInvalid(validateMentorObservation(validInput({ date: '' })), 'date format')
  })

  test('accepts valid YYYY-MM-DD', () => {
    expectValid(validateMentorObservation(validInput({ date: '2026-01-01' })))
  })
})

// ─── Length validation ──────────────────────────────────────────────

describe('validateMentorObservation — length validation', () => {
  test('rejects too-short observations', () => {
    expectInvalid(
      validateMentorObservation(validInput({ observation: 'Too short.' })),
      'too short'
    )
  })

  test('rejects too-long observations', () => {
    expectInvalid(
      validateMentorObservation(validInput({ observation: 'A'.repeat(501) })),
      'too long'
    )
  })
})

// ─── Category and confidence validation ─────────────────────────────

describe('validateMentorObservation — enum validation', () => {
  test('rejects invalid category', () => {
    expectInvalid(
      validateMentorObservation(validInput({ category: 'random_thing' as any })),
      'Invalid category'
    )
  })

  test('rejects invalid confidence', () => {
    expectInvalid(
      validateMentorObservation(validInput({ confidence: 'very_high' as any })),
      'Invalid confidence'
    )
  })

  test('rejects empty source_context', () => {
    expectInvalid(
      validateMentorObservation(validInput({ source_context: '' })),
      'source_context is required'
    )
  })
})
