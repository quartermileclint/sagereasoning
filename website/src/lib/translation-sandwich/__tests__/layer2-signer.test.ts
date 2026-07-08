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
 *   9. A corroboration-bearing assessment (the flag-on optional
 *      `corroboration` field, Trust Layer S0a) signs, verifies, is present in
 *      the canonical bytes, round-trips stably, and is tamper-evident —
 *      folded at the 2026-07-08 activation session to close the disclosed
 *      first-hand-only coverage gap.
 *
 * Run: npx tsx <this file>
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
import type { CorroborationReport } from '../corroboration-check'

let passed = 0
let failed = 0
const failures: string[] = []

function assert(condition: boolean, label: string): void {
  if (condition) { passed++ } else { failed++; failures.push(label); console.error('FAIL: ' + label) }
}

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
 * Realistic flag-on corroboration report (a contradicted obligation_met claim
 * with a grounded non-consent marker) — the shape applyMechanisms attaches when
 * SUBSTRATE_CORROBORATION_CHECK_ENABLED is set. Flag-off the key is omitted
 * entirely, so the existing eight tests remain the flag-off coverage.
 */
function buildCorroborationReport(): CorroborationReport {
  return {
    version: 'corroboration-check-v1',
    findings: [
      {
        claim: 'obligation_met',
        subject: 'local_community',
        index: 0,
        finding: 'contradicted',
        markers: [{ marker_class: 'non_consent', quote: 'they never opted in' }],
        rationale:
          'claimed met while a grounded non-consent predicate stands in the text and no extracted circle carries the violation',
      },
    ],
    text_harm_markers: [{ marker_class: 'non_consent', quote: 'they never opted in' }],
    counter_evidence: [],
    dikaiosyne_override: 'floor_reflexive',
    andreia_override: 'none',
    any_contradiction: true,
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

// beforeEach: capture prior env values. afterEach: restore them.
function captureEnv(): { savedSigningKey: string | undefined; savedKeyId: string | undefined } {
  return {
    savedSigningKey: process.env[SIGNING_KEY_ENV_VAR],
    savedKeyId: process.env[KEY_ID_ENV_VAR],
  }
}

function restoreEnv(saved: { savedSigningKey: string | undefined; savedKeyId: string | undefined }): void {
  if (saved.savedSigningKey !== undefined) {
    process.env[SIGNING_KEY_ENV_VAR] = saved.savedSigningKey
  } else {
    delete process.env[SIGNING_KEY_ENV_VAR]
  }
  if (saved.savedKeyId !== undefined) {
    process.env[KEY_ID_ENV_VAR] = saved.savedKeyId
  } else {
    delete process.env[KEY_ID_ENV_VAR]
  }
}

// ============================================================================
// TESTS — signLayer2Assessment
// ============================================================================

// produces an 88-base64-char (64-byte) Ed25519 signature (test 1)
{
  const saved = captureEnv()
  try {
    const { privatePem } = generateTestKeypair()
    process.env[SIGNING_KEY_ENV_VAR] = privatePem
    process.env[KEY_ID_ENV_VAR] = 'test-key-1'

    const signed = signLayer2Assessment(buildMinimalAssessment())

    // 64-byte Ed25519 signature = 88 base64 characters with '==' padding.
    assert(signed.signature.length === 88, 'signLayer2Assessment: test 1 — signature is 88 base64 chars')
    assert(/^[A-Za-z0-9+/]{86}==$/.test(signed.signature), 'signLayer2Assessment: test 1 — signature matches base64 86+== pattern')
    // Decoding back to bytes yields exactly 64 bytes.
    assert(Buffer.from(signed.signature, 'base64').length === 64, 'signLayer2Assessment: test 1 — decoded signature is 64 bytes')
  } finally {
    restoreEnv(saved)
  }
}

// signing the same assessment twice produces identical signatures (Ed25519 deterministic) (test 2)
{
  const saved = captureEnv()
  try {
    const { privatePem } = generateTestKeypair()
    process.env[SIGNING_KEY_ENV_VAR] = privatePem

    const assessment = buildMinimalAssessment()
    const signed1 = signLayer2Assessment(assessment)
    const signed2 = signLayer2Assessment(assessment)

    assert(Object.is(signed1.signature, signed2.signature), 'signLayer2Assessment: test 2 — identical signatures (deterministic)')
  } finally {
    restoreEnv(saved)
  }
}

// crypto.verify against the matching public key succeeds (test 3)
{
  const saved = captureEnv()
  try {
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
    assert(Object.is(ok, true), 'signLayer2Assessment: test 3 — verify against matching public key succeeds')
  } finally {
    restoreEnv(saved)
  }
}

// crypto.verify against a different public key fails (test 4)
{
  const saved = captureEnv()
  try {
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
    assert(Object.is(ok, false), 'signLayer2Assessment: test 4 — verify against different public key fails')
  } finally {
    restoreEnv(saved)
  }
}

// signing without SUBSTRATE_LAYER2_SIGNING_KEY env var throws SubstrateSigningKeyMissingError (test 5)
{
  const saved = captureEnv()
  try {
    delete process.env[SIGNING_KEY_ENV_VAR]

    let threw1 = false
    try { signLayer2Assessment(buildMinimalAssessment()) } catch (e) { threw1 = e instanceof SubstrateSigningKeyMissingError }
    assert(threw1, 'signLayer2Assessment: test 5 — throws SubstrateSigningKeyMissingError when key unset')

    let threwMsg = false
    try { signLayer2Assessment(buildMinimalAssessment()) } catch (e) { threwMsg = e instanceof Error && /is not set/.test(e.message) }
    assert(threwMsg, 'signLayer2Assessment: test 5 — error message matches /is not set/')
  } finally {
    restoreEnv(saved)
  }
}

// signing with malformed SUBSTRATE_LAYER2_SIGNING_KEY throws SubstrateSigningKeyMissingError (test 6)
{
  const saved = captureEnv()
  try {
    process.env[SIGNING_KEY_ENV_VAR] = 'not-a-pem-key'

    let threw1 = false
    try { signLayer2Assessment(buildMinimalAssessment()) } catch (e) { threw1 = e instanceof SubstrateSigningKeyMissingError }
    assert(threw1, 'signLayer2Assessment: test 6 — throws SubstrateSigningKeyMissingError when key malformed')

    let threwMsg = false
    try { signLayer2Assessment(buildMinimalAssessment()) } catch (e) { threwMsg = e instanceof Error && /malformed/.test(e.message) }
    assert(threwMsg, 'signLayer2Assessment: test 6 — error message matches /malformed/')
  } finally {
    restoreEnv(saved)
  }
}

// tampered assessment after signing fails verification (perturbation test 7)
{
  const saved = captureEnv()
  try {
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
    assert(Object.is(ok, false), 'signLayer2Assessment: test 7 — tampered assessment fails verification')

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
    assert(Object.is(okMutated, false), 'signLayer2Assessment: test 7 — one-byte canonical mutation fails verification')
  } finally {
    restoreEnv(saved)
  }
}

// key_id field reflects SUBSTRATE_LAYER2_KEY_ID env var (test 8)
{
  const saved = captureEnv()
  try {
    const { privatePem } = generateTestKeypair()
    process.env[SIGNING_KEY_ENV_VAR] = privatePem
    process.env[KEY_ID_ENV_VAR] = 'substrate-layer2-2026Q9'

    const signed = signLayer2Assessment(buildMinimalAssessment())
    assert(Object.is(signed.key_id, 'substrate-layer2-2026Q9'), 'signLayer2Assessment: test 8 — key_id reflects KEY_ID env var')
  } finally {
    restoreEnv(saved)
  }
}

// corroboration-bearing assessment signs, verifies, rides inside the canonical
// bytes, round-trips stably, and is tamper-evident (test 9 — 2026-07-08
// activation-session fold; closes the disclosed first-hand-only coverage gap
// on the flag-on `corroboration` field)
{
  const saved = captureEnv()
  try {
    const { privatePem, publicPem } = generateTestKeypair()
    process.env[SIGNING_KEY_ENV_VAR] = privatePem

    const assessment: Layer2Assessment = {
      ...buildMinimalAssessment(),
      corroboration: buildCorroborationReport(),
    }
    const signed = signLayer2Assessment(assessment)

    const canonical = canonicaliseLayer2Assessment(signed.assessment)
    assert(
      canonical.includes('"corroboration":') && canonical.includes('"any_contradiction":true'),
      'signLayer2Assessment: test 9 — corroboration field present in the canonical (signed) bytes'
    )

    const ok = verify(
      null,
      Buffer.from(canonical, 'utf8'),
      publicPem,
      Buffer.from(signed.signature, 'base64')
    )
    assert(Object.is(ok, true), 'signLayer2Assessment: test 9 — corroboration-bearing assessment verifies against matching public key')

    // Round-trip stability with the optional field present.
    const reparsed = JSON.parse(canonical) as Layer2Assessment
    assert(
      Object.is(canonicaliseLayer2Assessment(reparsed), canonical),
      'signLayer2Assessment: test 9 — canonical round-trip stable with corroboration present'
    )

    // Tamper INSIDE the corroboration report — verification must fail. The
    // report is tamper-evident: it rides inside the signed bytes, not as a
    // disclosed-but-unsigned side field.
    const tampered: Layer2Assessment = {
      ...signed.assessment,
      corroboration: {
        ...signed.assessment.corroboration!,
        any_contradiction: false,
        dikaiosyne_override: 'none',
      },
    }
    const okTampered = verify(
      null,
      Buffer.from(canonicaliseLayer2Assessment(tampered), 'utf8'),
      publicPem,
      Buffer.from(signed.signature, 'base64')
    )
    assert(Object.is(okTampered, false), 'signLayer2Assessment: test 9 — tampering inside the corroboration report fails verification')
  } finally {
    restoreEnv(saved)
  }
}

// key_id falls back to default when SUBSTRATE_LAYER2_KEY_ID is unset
{
  const saved = captureEnv()
  try {
    const { privatePem } = generateTestKeypair()
    process.env[SIGNING_KEY_ENV_VAR] = privatePem
    delete process.env[KEY_ID_ENV_VAR]

    const signed = signLayer2Assessment(buildMinimalAssessment())
    assert(Object.is(signed.key_id, DEFAULT_KEY_ID), 'signLayer2Assessment: key_id falls back to default when KEY_ID unset')
  } finally {
    restoreEnv(saved)
  }
}

console.log('\n' + passed + ' passed, ' + failed + ' failed')
if (failed > 0) {
  console.error('\nFailures:')
  for (const f of failures) console.error('  - ' + f)
  process.exit(1)
}
