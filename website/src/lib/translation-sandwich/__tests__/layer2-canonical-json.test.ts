/**
 * layer2-canonical-json.test.ts — Determinism + invariant tests for the
 * canonical-JSON helper that the Layer 2 signer uses.
 *
 * Per /adopted/ADR-layer2-signing-infrastructure.md Decision 2 + Open Question 4
 * (Choice 2(a) elected at session-open). The signer module's correctness
 * depends on this helper producing the same byte sequence on signer and
 * verifier; these tests assert that contract.
 *
 * Run: npx jest layer2-canonical-json --no-coverage
 *
 * Rules served:
 *   - PR1: round-trip + invariant tests are the verification step the founder
 *           runs before the production deploy.
 *   - PR3: synchronous; no async, no I/O.
 *   - PR6: safety-critical-adjacent — canonical-JSON drift would silently
 *           break verification of already-issued signatures.
 *
 * The seven tests cover the six items named in the next-session prompt's
 * Step 5 plus a Decision-3-style Infinity test (round-trip stability is the
 * sixth):
 *   1. Empty/minimal assessment produces stable canonical output.
 *   2. Reordering input object keys produces identical canonical output.
 *   3. Nested arrays preserve order.
 *   4. NaN throws Layer2CanonicalisationError.
 *   5. Infinity throws Layer2CanonicalisationError.
 *   6. undefined property throws Layer2CanonicalisationError.
 *   7. Round-trip stability: canonicalise(JSON.parse(canonical)) === canonical.
 */

import {
  canonicaliseLayer2Assessment,
  Layer2CanonicalisationError,
} from '../layer2-canonical-json'
import type { Layer2Assessment } from '../layer2-mechanisms'

// ============================================================================
// FIXTURES
// ============================================================================

/**
 * Minimal-shape Layer2Assessment factory. Every required field present, every
 * array empty, every enum value at its neutral default. The tests focus on the
 * canonicalisation algorithm's behaviour, not on schema realism.
 */
function buildMinimalAssessment(): Layer2Assessment {
  return {
    version: 'layer2-assessment-v1',
    layer1_schema_version: 'layer1-schema-v1',
    passion_diagnosis: {
      passions_detected: [],
      false_judgements: [],
      correct_judgements: [],
      causal_stage_affected: null,
    },
    control_filter: {
      within_prohairesis: [],
      outside_prohairesis: [],
      disambiguation_required: [],
    },
    oikeiosis: {
      relevant_circles: [],
      deliberation_notes: '',
    },
    value_assessment: {
      indifferents_at_stake: [],
      value_error: null,
    },
    kathekon_assessment: {
      is_kathekon: null,
      quality: 'marginal',
      justification: '',
    },
    iterative_refinement: {
      senecan_grade: 'pre_progress',
      progress_dimensions: {
        passion_reduction: '',
        judgement_quality: '',
        disposition_stability: '',
        oikeiosis_extension: '',
      },
      direction_of_travel: 'single_snapshot',
      motivation_classification: null,
    },
    katorthoma_proximity: 'reflexive',
    ruling_faculty_state: '',
    virtue_domains_engaged: [],
    improvement_path_structured: null,
    stage_scores: {
      control_filter: 'not_applied',
      passion_diagnosis: 'not_applied',
      oikeiosis: 'not_applied',
      value_assessment: 'not_applied',
      kathekon_assessment: 'not_applied',
      iterative_refinement: 'not_applied',
    },
    hasty_assent_risk: 'none',
    intake_clarifications: {
      soft_clarifications: [],
      open_deferrals: [],
    },
    layer1_ambiguity_notes: [],
    layer2_ambiguity_notes: [],
  }
}

// ============================================================================
// TESTS
// ============================================================================

describe('canonicaliseLayer2Assessment', () => {
  it('produces stable canonical output for the minimal assessment (test 1)', () => {
    const assessment = buildMinimalAssessment()
    const out1 = canonicaliseLayer2Assessment(assessment)
    const out2 = canonicaliseLayer2Assessment(assessment)
    expect(out1).toBe(out2)
    // Sanity: parses back to a valid object structurally equal to the input.
    expect(JSON.parse(out1)).toEqual(assessment)
  })

  it('produces identical canonical output regardless of input property insertion order (test 2)', () => {
    const a = buildMinimalAssessment()
    // Construct a second assessment with the same values but with the property
    // insertion order reversed at the top level. The nested objects retain
    // their original insertion order — sufficient to demonstrate that
    // canonicalisation does not depend on top-level ordering.
    const b: Layer2Assessment = {
      layer2_ambiguity_notes: a.layer2_ambiguity_notes,
      layer1_ambiguity_notes: a.layer1_ambiguity_notes,
      intake_clarifications: a.intake_clarifications,
      hasty_assent_risk: a.hasty_assent_risk,
      stage_scores: a.stage_scores,
      improvement_path_structured: a.improvement_path_structured,
      virtue_domains_engaged: a.virtue_domains_engaged,
      ruling_faculty_state: a.ruling_faculty_state,
      katorthoma_proximity: a.katorthoma_proximity,
      iterative_refinement: a.iterative_refinement,
      kathekon_assessment: a.kathekon_assessment,
      value_assessment: a.value_assessment,
      oikeiosis: a.oikeiosis,
      control_filter: a.control_filter,
      passion_diagnosis: a.passion_diagnosis,
      layer1_schema_version: a.layer1_schema_version,
      version: a.version,
    }
    expect(canonicaliseLayer2Assessment(a)).toBe(canonicaliseLayer2Assessment(b))
  })

  it('preserves array order for nested arrays (test 3)', () => {
    const a = buildMinimalAssessment()
    const withArrays: Layer2Assessment = {
      ...a,
      layer1_ambiguity_notes: ['z', 'a', 'm'],
      virtue_domains_engaged: ['phronesis', 'andreia', 'dikaiosyne'],
    }
    const out = canonicaliseLayer2Assessment(withArrays)
    expect(out).toContain('"layer1_ambiguity_notes":["z","a","m"]')
    expect(out).toContain('"virtue_domains_engaged":["phronesis","andreia","dikaiosyne"]')
    // Negative: alphabetised array would have been ["a","m","z"]; the helper
    // must NOT sort arrays.
    expect(out).not.toContain('["a","m","z"]')
  })

  it('throws Layer2CanonicalisationError on NaN (test 4)', () => {
    const tampered = {
      foo: NaN,
    } as unknown as Layer2Assessment
    expect(() => canonicaliseLayer2Assessment(tampered)).toThrow(Layer2CanonicalisationError)
    expect(() => canonicaliseLayer2Assessment(tampered)).toThrow(/Non-finite number/)
  })

  it('throws Layer2CanonicalisationError on Infinity (test 5)', () => {
    const positiveInfinity = { foo: Infinity } as unknown as Layer2Assessment
    const negativeInfinity = { foo: -Infinity } as unknown as Layer2Assessment
    expect(() => canonicaliseLayer2Assessment(positiveInfinity)).toThrow(Layer2CanonicalisationError)
    expect(() => canonicaliseLayer2Assessment(negativeInfinity)).toThrow(Layer2CanonicalisationError)
  })

  it('throws Layer2CanonicalisationError on undefined property values (test 6)', () => {
    const tampered = {
      foo: undefined,
    } as unknown as Layer2Assessment
    expect(() => canonicaliseLayer2Assessment(tampered)).toThrow(Layer2CanonicalisationError)
    expect(() => canonicaliseLayer2Assessment(tampered)).toThrow(/undefined/)
  })

  it('round-trip stability: canonicalising the JSON.parse of canonical output equals canonical output (test 7)', () => {
    const a = buildMinimalAssessment()
    const canonical1 = canonicaliseLayer2Assessment(a)
    const reparsed = JSON.parse(canonical1) as Layer2Assessment
    const canonical2 = canonicaliseLayer2Assessment(reparsed)
    expect(canonical1).toBe(canonical2)
  })

  it('normalises -0 to 0', () => {
    const tampered = { foo: -0 } as unknown as Layer2Assessment
    const out = canonicaliseLayer2Assessment(tampered)
    // The canonical form of -0 must be the same as 0; otherwise signatures
    // would differ across signer/verifier where one side received -0 from
    // arithmetic and the other received 0 from a JSON parse.
    expect(out).toBe('{"foo":0}')
  })

  it('JSON.stringifies string keys + values to handle escapes', () => {
    const tampered = { 'a"b': 'c\nd' } as unknown as Layer2Assessment
    const out = canonicaliseLayer2Assessment(tampered)
    expect(out).toBe('{"a\\"b":"c\\nd"}')
  })
})
