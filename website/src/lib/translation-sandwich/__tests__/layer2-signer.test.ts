/**
 * layer2-signer.test.ts — Round-trip + invariant tests for signLayer2Assessment.
 *
 * Per /adopted/ADR-layer2-signing-infrastructure.md Decision 1 + Decision 2.
 * The eight tests cover the six items named in the next-session prompt's
 * Step 6 plus the perturbation test the prompt names explicitly:
 *
 *   1. Signing produces an 88-base64-char (64-byte) Ed25519 signature.
 *   2. Signing the same assessment twice produces identical signatures
 *      (Ed25519 is deterministic).
 *   3. crypto.verify against the matching public key succeeds.
 *   4. crypto.verify against a different public key fails.
 *   5. Signing without SUBSTRATE_LAYER2_SIGNING_KEY env var throws
 *      SubstrateSigningKeyMissingError.
 *   6. Signing with malformed SUBSTRATE_LAYER2_SIGNING_KEY throws
 *      SubstrateSigningKeyMissingError.
 *   7. Tampered assessment after signing fails verification (perturbation
 *      test — confirms canonical-JSON discipline catches single-byte
 *      mutations as expected).
 *   8. key_id field reflects SUBSTRATE_LAYER2_KEY_ID env var.
 *
 * Run: npx jest layer2-signer --no-coverage
 *
 * Rules served:
 *   - PR1: round-trip + perturbation tests are the verification step the
 *           founder runs before the production deploy.
 *   - PR3: synchronous tests; no async, no I/O.
 *   - PR6: safety-critical surface — these tests catch regressions in the
 *           cryptographic implementation.
 *
 * Test isolation: each test that sets env vars restores the prior values in
 * an afterEach hook. The production env vars are NOT used in tests; a fresh
 * keypair is generated per test run.
 */

import { generateKeyPairSync, verify } from 'node:crypto'

import {
  signLayer2Assessment,
  SubstrateSigningKeyMissingError,
  SUBSTRATE_LAYER2_SIGNER_CONFIG,
} from '../layer2-signer'
import { canonicaliseLayer2Assessment } from '../layer2-canonical-json'
import type { Layer2Assessment } from '../layer2-mechanisms'

// ============================================================================
// FIXTURES
// ============================================================================

/**
 * Minimal-shape Layer2Assessment factory. Mirrors the canonical-JSON tests'
 * fixture; kept local to this file to avoid coupling test files.
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

/**
 * Generate a fresh Ed25519 keypair for tests. Returns PEM-encoded strings
 * suitable for setting as the SUBSTRATE_LAYER2_SIGNING_KEY env var.
 */
function generateTestKeypair(): { privatePem: string; publicPem: string } {
  const { privateKey, publicKey } = generateKeyPairSync('ed25519')
  const privatePem = privateKey.export({ type: 'pkcs8', format: 'pem' }).toString()
  const publicPem = publicKey.export({ type: 'spki', format: 'pem' }).toString()
  return { privatePem, publicPem }
}

// ============================================================================
// SETUP / TEARDOWN
// ============================================================================

const { SIGNING_KEY_ENV_VAR, KEY_ID_ENV_VAR, DEFAULT_KEY_ID } = SUBSTRATE_LAYER2_SIGNER_CONFIG

let savedSigningKey: string | undefined
let savedKeyId: string | undefined

beforeEach(() => {
  savedSigningKey = process.env[SIGNING_KEY_ENV_VAR]
  savedKeyId = process.env[KEY_ID_ENV_VAR]
})

afterEach(() => {
  if (savedSigningKey !== undefined) {
    process.env[SIGNING_KEY_ENV_VAR] = savedSigningKey
  } else {
    delete process.env[SIGNING_KEY_ENV_VAR]
  }
  if (savedKeyId !== undefined) {
    process.env[KEY_ID_ENV_VAR] = savedKeyId
  } else {
    delete process.env[KEY_ID_ENV_VAR]
  }
})

// ============================================================================
// TESTS
// ============================================================================

describe('signLayer2Assessment', () => {
  it('produces an 88-base64-char (64-byte) Ed25519 signature (test 1)', () => {
    const { privatePem } = generateTestKeypair()
    process.env[SIGNING_KEY_ENV_VAR] = privatePem
    process.env[KEY_ID_ENV_VAR] = 'test-key-1'

    const signed = signLayer2Assessment(buildMinimalAssessment())

    // 64-byte Ed25519 signature = 88 base64 characters with '==' padding.
    expect(signed.signature).toHaveLength(88)
    expect(signed.signature).toMatch(/^[A-Za-z0-9+/]{86}==$/)
    // Decoding back to bytes yields exactly 64 bytes.
    expect(Buffer.from(signed.signature, 'base64')).toHaveLength(64)
  })

  it('signing the same assessment twice produces identical signatures (Ed25519 deterministic) (test 2)', () => {
    const { privatePem } = generateTestKeypair()
    process.env[SIGNING_KEY_ENV_VAR] = privatePem

    const assessment = buildMinimalAssessment()
    const signed1 = signLayer2Assessment(assessment)
    const signed2 = signLayer2Assessment(assessment)

    expect(signed1.signature).toBe(signed2.signature)
  })

  it('crypto.verify against the matching public key succeeds (test 3)', () => {
    const { privatePem, publicPem } = generateTestKeypair()
    process.env[SIGNING_KEY_ENV_VAR] = privatePem

    const assessment = buildMinimalAssessment()
    const signed = signLayer2Assessment(assessment)

    const canonical = canonicaliseLayer2Assessment(signed.assessment)
    const ok = verify(
      null,
      Buffer.from(canonical, 'utf8'),
      publicPem,
      Buffer.from(signed.signature, 'base64')
    )
    expect(ok).toBe(true)
  })

  it('crypto.verify against a different public key fails (test 4)', () => {
    const { privatePem } = generateTestKeypair()
    const { publicPem: differentPublicPem } = generateTestKeypair()
    process.env[SIGNING_KEY_ENV_VAR] = privatePem

    const signed = signLayer2Assessment(buildMinimalAssessment())

    const canonical = canonicaliseLayer2Assessment(signed.assessment)
    const ok = verify(
      null,
      Buffer.from(canonical, 'utf8'),
      differentPublicPem,
      Buffer.from(signed.signature, 'base64')
    )
    expect(ok).toBe(false)
  })

  it('signing without SUBSTRATE_LAYER2_SIGNING_KEY env var throws SubstrateSigningKeyMissingError (test 5)', () => {
    delete process.env[SIGNING_KEY_ENV_VAR]

    expect(() => signLayer2Assessment(buildMinimalAssessment())).toThrow(SubstrateSigningKeyMissingError)
    expect(() => signLayer2Assessment(buildMinimalAssessment())).toThrow(/is not set/)
  })

  it('signing with malformed SUBSTRATE_LAYER2_SIGNING_KEY throws SubstrateSigningKeyMissingError (test 6)', () => {
    process.env[SIGNING_KEY_ENV_VAR] = 'not-a-pem-key'

    expect(() => signLayer2Assessment(buildMinimalAssessment())).toThrow(SubstrateSigningKeyMissingError)
    expect(() => signLayer2Assessment(buildMinimalAssessment())).toThrow(/malformed/)
  })

  it('tampered assessment after signing fails verification (perturbation test 7)', () => {
    const { privatePem, publicPem } = generateTestKeypair()
    process.env[SIGNING_KEY_ENV_VAR] = privatePem

    const assessment = buildMinimalAssessment()
    const signed = signLayer2Assessment(assessment)

    // Tamper one field. The signed `assessment` carries the new value; the
    // signature was produced over the original. Verification must fail.
    const tampered: Layer2Assessment = {
      ...signed.assessment,
      ruling_faculty_state: 'TAMPERED',
    }

    const canonical = canonicaliseLayer2Assessment(tampered)
    const ok = verify(
      null,
      Buffer.from(canonical, 'utf8'),
      publicPem,
      Buffer.from(signed.signature, 'base64')
    )
    expect(ok).toBe(false)

    // And: a one-byte mutation of the canonical bytes (not via the
    // assessment) also fails verification — confirms the signature is over
    // the canonical bytes, not over an internal hash that happens to collide.
    const originalCanonical = canonicaliseLayer2Assessment(signed.assessment)
    const mutatedCanonical = originalCanonical.slice(0, -1) + (originalCanonical.slice(-1) === '}' ? ']' : '}')
    const okMutated = verify(
      null,
      Buffer.from(mutatedCanonical, 'utf8'),
      publicPem,
      Buffer.from(signed.signature, 'base64')
    )
    expect(okMutated).toBe(false)
  })

  it('key_id field reflects SUBSTRATE_LAYER2_KEY_ID env var (test 8)', () => {
    const { privatePem } = generateTestKeypair()
    process.env[SIGNING_KEY_ENV_VAR] = privatePem
    process.env[KEY_ID_ENV_VAR] = 'substrate-layer2-2026Q9'

    const signed = signLayer2Assessment(buildMinimalAssessment())
    expect(signed.key_id).toBe('substrate-layer2-2026Q9')
  })

  it('key_id falls back to default when SUBSTRATE_LAYER2_KEY_ID is unset', () => {
    const { privatePem } = generateTestKeypair()
    process.env[SIGNING_KEY_ENV_VAR] = privatePem
    delete process.env[KEY_ID_ENV_VAR]

    const signed = signLayer2Assessment(buildMinimalAssessment())
    expect(signed.key_id).toBe(DEFAULT_KEY_ID)
  })
})
