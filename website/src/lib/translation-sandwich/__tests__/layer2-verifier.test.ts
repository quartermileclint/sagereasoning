/**
 * layer2-verifier.test.ts — unit tests for verifyLayer2Signature (the verify
 * counterpart to signLayer2Assessment).
 *
 * Run via: `npx tsx website/src/lib/translation-sandwich/__tests__/layer2-verifier.test.ts`
 * (plain-assertion script; no Jest — mirrors sage-assent-bridge.test.ts /
 * the A5 / A7 verification pattern. layer2-verifier imports only the
 * canonicaliser + types, so NO --env-file is needed; this test sets the
 * verification-key env vars itself.)
 *
 * COVERAGE
 *   GENUINE / CURRENT KEY
 *     VALID-1  genuine signature, current key → { valid:true, matched:'current' }
 *     VALID-2  the returned key_id is the signed key_id
 *     DET-1    verifying the same signed object twice is deterministic
 *
 *   ROTATION OVERLAP (A4 previous-key window)
 *     ROT-1    signed under previous key, all four PREVIOUS_* set, not expired → valid, matched:'previous'
 *     ROT-2    previous key present but overlap expired (retires_at in the past) → expired_key_id
 *     ROT-3    partial PREVIOUS_* env (2 of 4) → previous ignored → unknown_key_id
 *
 *   KEY SELECTION FAILURES
 *     UNKNOWN-1  signed.key_id matches neither current nor previous → unknown_key_id
 *
 *   CRYPTOGRAPHIC FAILURES
 *     MISMATCH-1  tampered assessment (post-sign) → signature_mismatch
 *     MISMATCH-2  wrong public key, same key_id → signature_mismatch
 *
 *   SIGNATURE SHAPE
 *     SIG-1  non-base64 / too-short signature → malformed_signature
 *     SIG-2  valid base64 but wrong byte length (32) → malformed_signature
 *
 *   VERIFIER CONFIG
 *     KEYUNAVAIL-1   SUBSTRATE_LAYER2_PUBLIC_KEY unset → verifier_key_unavailable
 *     KEYMALFORMED-1 SUBSTRATE_LAYER2_PUBLIC_KEY not a PEM → verifier_key_malformed
 *
 *   PAYLOAD / INPUT
 *     CANON-1   genuine sig + key, but assessment carries NaN → uncanonicalisable_payload
 *     INPUT-1   null input → malformed_input
 *     INPUT-2   object missing signature → malformed_input
 *     INPUT-3   object with empty key_id → malformed_input
 *
 * Exit code 0 = all pass. Non-zero = failures printed.
 */

import { generateKeyPairSync } from 'node:crypto'

import {
  verifyLayer2Signature,
  SUBSTRATE_LAYER2_VERIFIER_CONFIG,
  type Layer2VerificationResult,
} from '../layer2-verifier'
import {
  signLayer2Assessment,
  SUBSTRATE_LAYER2_SIGNER_CONFIG,
  type SignedLayer2Assessment,
} from '../layer2-signer'
import type { Layer2Assessment } from '../layer2-mechanisms'

// ============================================================================
// Test runner — plain assertions; exit code reports pass/fail
// ============================================================================

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

/** Assert a result is invalid with the expected reason. */
function assertInvalid(
  label: string,
  result: Layer2VerificationResult,
  expectedReason: string,
): void {
  if (result.valid) {
    assert(label, false, `expected invalid (${expectedReason}), got valid`)
    return
  }
  assert(
    label,
    result.reason === expectedReason,
    `expected reason=${expectedReason}, actual reason=${result.reason}`,
  )
}

// ============================================================================
// Fixtures
// ============================================================================

/** Minimal-shape Layer2Assessment — copied from layer2-signer.test.ts /
 *  layer2-canonical-json.test.ts to avoid coupling test files. */
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

function generateTestKeypair(): { privatePem: string; publicPem: string } {
  const { privateKey, publicKey } = generateKeyPairSync('ed25519')
  const privatePem = privateKey.export({ type: 'pkcs8', format: 'pem' }).toString()
  const publicPem = publicKey.export({ type: 'spki', format: 'pem' }).toString()
  return { privatePem, publicPem }
}

const V = SUBSTRATE_LAYER2_VERIFIER_CONFIG
const S = SUBSTRATE_LAYER2_SIGNER_CONFIG

/** Delete every signer + verifier env var so each scenario starts clean. */
function resetEnv(): void {
  delete process.env[S.SIGNING_KEY_ENV_VAR]
  delete process.env[V.PUBLIC_KEY_ENV_VAR]
  delete process.env[V.KEY_ID_ENV_VAR] // shared with the signer
  delete process.env[V.PREVIOUS_PUBLIC_KEY_ENV_VAR]
  delete process.env[V.PREVIOUS_KEY_ID_ENV_VAR]
  delete process.env[V.PREVIOUS_KEY_ISSUED_AT_ENV_VAR]
  delete process.env[V.PREVIOUS_KEY_RETIRES_AT_ENV_VAR]
}

/** Sign an assessment under a given private key + key_id (sets env, signs,
 *  leaves the signing env in place for the caller to clear via resetEnv). */
function signWith(
  privatePem: string,
  keyId: string,
  assessment: Layer2Assessment,
): SignedLayer2Assessment {
  process.env[S.SIGNING_KEY_ENV_VAR] = privatePem
  process.env[V.KEY_ID_ENV_VAR] = keyId
  return signLayer2Assessment(assessment)
}

const ISO_FUTURE = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
const ISO_PAST = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

// ============================================================================
// GENUINE / CURRENT KEY
// ============================================================================

;(() => {
  resetEnv()
  const { privatePem, publicPem } = generateTestKeypair()
  const signed = signWith(privatePem, 'k1', buildMinimalAssessment())

  // Verify env: current key = the keypair we signed with, key_id 'k1'.
  resetEnv()
  process.env[V.PUBLIC_KEY_ENV_VAR] = publicPem
  process.env[V.KEY_ID_ENV_VAR] = 'k1'

  const r = verifyLayer2Signature(signed)
  assert('VALID-1  genuine signature, current key → valid', r.valid === true)
  assert(
    "VALID-1b matched is 'current'",
    r.valid === true && r.matched === 'current',
  )
  assert(
    'VALID-2  returned key_id equals the signed key_id',
    r.valid === true && r.key_id === 'k1',
  )

  const r2 = verifyLayer2Signature(signed)
  assert(
    'DET-1  verifying twice is deterministic (both valid)',
    r.valid === true && r2.valid === true,
  )
})()

// ============================================================================
// ROTATION OVERLAP (A4 previous-key window)
// ============================================================================

;(() => {
  // Sign under keypair A / key_id 'k1' (the soon-to-be-previous key).
  resetEnv()
  const A = generateTestKeypair()
  const signed = signWith(A.privatePem, 'k1', buildMinimalAssessment())

  // Rotate: current key is keypair B / 'k2'; previous slot = A / 'k1', not expired.
  resetEnv()
  const B = generateTestKeypair()
  process.env[V.PUBLIC_KEY_ENV_VAR] = B.publicPem
  process.env[V.KEY_ID_ENV_VAR] = 'k2'
  process.env[V.PREVIOUS_PUBLIC_KEY_ENV_VAR] = A.publicPem
  process.env[V.PREVIOUS_KEY_ID_ENV_VAR] = 'k1'
  process.env[V.PREVIOUS_KEY_ISSUED_AT_ENV_VAR] = ISO_PAST
  process.env[V.PREVIOUS_KEY_RETIRES_AT_ENV_VAR] = ISO_FUTURE

  const r = verifyLayer2Signature(signed)
  assert(
    "ROT-1  previous key in active overlap → valid, matched:'previous'",
    r.valid === true && r.matched === 'previous',
  )

  // Same config, but the overlap has expired.
  process.env[V.PREVIOUS_KEY_RETIRES_AT_ENV_VAR] = ISO_PAST
  assertInvalid('ROT-2  expired overlap → expired_key_id', verifyLayer2Signature(signed), 'expired_key_id')

  // Partial previous env (only 2 of 4) → previous ignored → unknown_key_id.
  resetEnv()
  process.env[V.PUBLIC_KEY_ENV_VAR] = B.publicPem
  process.env[V.KEY_ID_ENV_VAR] = 'k2'
  process.env[V.PREVIOUS_PUBLIC_KEY_ENV_VAR] = A.publicPem
  process.env[V.PREVIOUS_KEY_ID_ENV_VAR] = 'k1'
  // (issued_at + retires_at deliberately unset)
  assertInvalid('ROT-3  partial previous env → unknown_key_id', verifyLayer2Signature(signed), 'unknown_key_id')
})()

// ============================================================================
// KEY SELECTION FAILURE
// ============================================================================

;(() => {
  resetEnv()
  const { privatePem, publicPem } = generateTestKeypair()
  const signed = signWith(privatePem, 'k1', buildMinimalAssessment())

  // Current key id is something else, no previous → unknown_key_id.
  resetEnv()
  process.env[V.PUBLIC_KEY_ENV_VAR] = publicPem
  process.env[V.KEY_ID_ENV_VAR] = 'some-other-key-id'
  assertInvalid('UNKNOWN-1  key_id matches nothing → unknown_key_id', verifyLayer2Signature(signed), 'unknown_key_id')
})()

// ============================================================================
// CRYPTOGRAPHIC FAILURES
// ============================================================================

;(() => {
  resetEnv()
  const { privatePem, publicPem } = generateTestKeypair()
  const signed = signWith(privatePem, 'k1', buildMinimalAssessment())

  resetEnv()
  process.env[V.PUBLIC_KEY_ENV_VAR] = publicPem
  process.env[V.KEY_ID_ENV_VAR] = 'k1'

  // Tamper the assessment after signing — key_id + signature unchanged.
  const tampered: SignedLayer2Assessment = {
    ...signed,
    assessment: { ...signed.assessment, ruling_faculty_state: 'TAMPERED' },
  }
  assertInvalid('MISMATCH-1  tampered assessment → signature_mismatch', verifyLayer2Signature(tampered), 'signature_mismatch')

  // Wrong public key, same key_id.
  const { publicPem: otherPub } = generateTestKeypair()
  process.env[V.PUBLIC_KEY_ENV_VAR] = otherPub
  assertInvalid('MISMATCH-2  wrong public key, same key_id → signature_mismatch', verifyLayer2Signature(signed), 'signature_mismatch')
})()

// ============================================================================
// SIGNATURE SHAPE
// ============================================================================

;(() => {
  resetEnv()
  const { privatePem, publicPem } = generateTestKeypair()
  const signed = signWith(privatePem, 'k1', buildMinimalAssessment())

  resetEnv()
  process.env[V.PUBLIC_KEY_ENV_VAR] = publicPem
  process.env[V.KEY_ID_ENV_VAR] = 'k1'

  const sig1: SignedLayer2Assessment = { ...signed, signature: '@@@not-base64@@@' }
  assertInvalid('SIG-1  non-base64 / short signature → malformed_signature', verifyLayer2Signature(sig1), 'malformed_signature')

  const sig2: SignedLayer2Assessment = { ...signed, signature: Buffer.alloc(32).toString('base64') }
  assertInvalid('SIG-2  valid base64 but 32 bytes → malformed_signature', verifyLayer2Signature(sig2), 'malformed_signature')
})()

// ============================================================================
// VERIFIER CONFIG
// ============================================================================

;(() => {
  resetEnv()
  const { privatePem } = generateTestKeypair()
  const signed = signWith(privatePem, 'k1', buildMinimalAssessment())

  // No public key configured at all.
  resetEnv()
  assertInvalid('KEYUNAVAIL-1  public key unset → verifier_key_unavailable', verifyLayer2Signature(signed), 'verifier_key_unavailable')

  // Public key present but not a parseable PEM.
  resetEnv()
  process.env[V.PUBLIC_KEY_ENV_VAR] = 'not-a-pem-key'
  process.env[V.KEY_ID_ENV_VAR] = 'k1'
  assertInvalid('KEYMALFORMED-1  public key not a PEM → verifier_key_malformed', verifyLayer2Signature(signed), 'verifier_key_malformed')
})()

// ============================================================================
// PAYLOAD / INPUT
// ============================================================================

;(() => {
  resetEnv()
  const { privatePem, publicPem } = generateTestKeypair()
  const signed = signWith(privatePem, 'k1', buildMinimalAssessment())

  resetEnv()
  process.env[V.PUBLIC_KEY_ENV_VAR] = publicPem
  process.env[V.KEY_ID_ENV_VAR] = 'k1'

  // Genuine signature + key, but the assessment now carries a non-finite number.
  const nanAssessment = {
    ...signed.assessment,
    katorthoma_proximity: NaN as unknown as Layer2Assessment['katorthoma_proximity'],
  }
  const canonBad: SignedLayer2Assessment = { ...signed, assessment: nanAssessment }
  assertInvalid('CANON-1  NaN in assessment → uncanonicalisable_payload', verifyLayer2Signature(canonBad), 'uncanonicalisable_payload')

  // Malformed inputs.
  assertInvalid('INPUT-1  null → malformed_input', verifyLayer2Signature(null), 'malformed_input')
  assertInvalid(
    'INPUT-2  missing signature → malformed_input',
    verifyLayer2Signature({ assessment: {}, key_id: 'k1' }),
    'malformed_input',
  )
  assertInvalid(
    'INPUT-3  empty key_id → malformed_input',
    verifyLayer2Signature({ assessment: {}, signature: 'x', key_id: '' }),
    'malformed_input',
  )
})()

// ============================================================================
// REPORT
// ============================================================================

console.log('')
console.log(`Total: ${passCount + failCount}  Pass: ${passCount}  Fail: ${failCount}`)
if (failCount > 0) {
  console.log('\nFailures:')
  for (const f of failures) console.log(`  - ${f}`)
  process.exit(1)
}
