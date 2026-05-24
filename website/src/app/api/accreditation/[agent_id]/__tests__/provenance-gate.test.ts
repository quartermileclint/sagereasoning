/**
 * provenance-gate.test.ts — unit tests for enforceWriteProvenance (the R18f
 * credential-write gate that orchestrates the structural validator + the
 * Ed25519 verifier behind the SUBSTRATE_PROVENANCE_GATE_ENABLED kill-switch).
 *
 * Run via: `npx tsx website/src/app/api/accreditation/[agent_id]/__tests__/provenance-gate.test.ts`
 * (plain-assertion script; no Jest. The gate imports provenance-contract (type
 * only) + layer2-verifier (canonicaliser + types) — NEITHER touches Supabase,
 * so NO --env-file is required. The test sets its own env vars.)
 *
 * COVERAGE
 *   KILL-SWITCH (dark-deploy safety)
 *     OFF-1   flag unset → ok, enforced:false (even with no provenance present)
 *     OFF-2   flag 'false' → ok, enforced:false
 *     FLAG-1  isProvenanceGateEnabled reflects the env var
 *   ENABLED — VALID
 *     ON-VALID-1  genuine signed provenance + verifier key set → ok, enforced:true
 *     ON-MULTI-1  [forged, genuine] → ok (at least one verifies)
 *   ENABLED — REJECT
 *     ON-BADPROV-1  no `provenance` field → bad_provenance
 *     ON-BADPROV-2  empty signed_assessments → bad_provenance
 *     ON-NOEXAM-1   tampered (forged) assessment → no_examination
 *     ON-NOEXAM-2   unknown key_id (caller problem) → no_examination
 *     ON-VERIF-1    structurally valid, but verifier key unset → verifier_unavailable
 *
 * Exit code 0 = all pass. Non-zero = failures printed.
 */

import { generateKeyPairSync } from 'node:crypto'

import {
  enforceWriteProvenance,
  isProvenanceGateEnabled,
  PROVENANCE_GATE_ENV_VAR,
} from '../provenance-gate'
import {
  signLayer2Assessment,
  SUBSTRATE_LAYER2_SIGNER_CONFIG,
  type SignedLayer2Assessment,
} from '@/lib/translation-sandwich/layer2-signer'
import { SUBSTRATE_LAYER2_VERIFIER_CONFIG } from '@/lib/translation-sandwich/layer2-verifier'
import type { Layer2Assessment } from '@/lib/translation-sandwich/layer2-mechanisms'

// ============================================================================
// Test runner
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

// ============================================================================
// Fixtures
// ============================================================================

function buildMinimalAssessment(): Layer2Assessment {
  return {
    version: 'layer2-assessment-v1',
    layer1_schema_version: 'layer1-schema-v1',
    passion_diagnosis: { passions_detected: [], false_judgements: [], correct_judgements: [], causal_stage_affected: null },
    control_filter: { within_prohairesis: [], outside_prohairesis: [], disambiguation_required: [] },
    oikeiosis: { relevant_circles: [], deliberation_notes: '' },
    value_assessment: { indifferents_at_stake: [], value_error: null },
    kathekon_assessment: { is_kathekon: null, quality: 'marginal', justification: '' },
    iterative_refinement: {
      senecan_grade: 'pre_progress',
      progress_dimensions: { passion_reduction: '', judgement_quality: '', disposition_stability: '', oikeiosis_extension: '' },
      direction_of_travel: 'single_snapshot',
      motivation_classification: null,
    },
    katorthoma_proximity: 'reflexive',
    ruling_faculty_state: '',
    virtue_domains_engaged: [],
    improvement_path_structured: null,
    stage_scores: {
      control_filter: 'not_applied', passion_diagnosis: 'not_applied', oikeiosis: 'not_applied',
      value_assessment: 'not_applied', kathekon_assessment: 'not_applied', iterative_refinement: 'not_applied',
    },
    hasty_assent_risk: 'none',
    intake_clarifications: { soft_clarifications: [], open_deferrals: [] },
    layer1_ambiguity_notes: [],
    layer2_ambiguity_notes: [],
  }
}

function generateTestKeypair(): { privatePem: string; publicPem: string } {
  const { privateKey, publicKey } = generateKeyPairSync('ed25519')
  return {
    privatePem: privateKey.export({ type: 'pkcs8', format: 'pem' }).toString(),
    publicPem: publicKey.export({ type: 'spki', format: 'pem' }).toString(),
  }
}

const S = SUBSTRATE_LAYER2_SIGNER_CONFIG
const V = SUBSTRATE_LAYER2_VERIFIER_CONFIG

function resetEnv(): void {
  delete process.env[PROVENANCE_GATE_ENV_VAR]
  delete process.env[S.SIGNING_KEY_ENV_VAR]
  delete process.env[V.PUBLIC_KEY_ENV_VAR]
  delete process.env[V.KEY_ID_ENV_VAR]
  delete process.env[V.PREVIOUS_PUBLIC_KEY_ENV_VAR]
  delete process.env[V.PREVIOUS_KEY_ID_ENV_VAR]
  delete process.env[V.PREVIOUS_KEY_ISSUED_AT_ENV_VAR]
  delete process.env[V.PREVIOUS_KEY_RETIRES_AT_ENV_VAR]
}

/** Sign a minimal assessment under a fresh keypair; returns the signed object
 *  and the public PEM (to set as the verifier key). key_id 'k1'. */
function makeGenuine(): { signed: SignedLayer2Assessment; publicPem: string } {
  resetEnv()
  const { privatePem, publicPem } = generateTestKeypair()
  process.env[S.SIGNING_KEY_ENV_VAR] = privatePem
  process.env[V.KEY_ID_ENV_VAR] = 'k1'
  const signed = signLayer2Assessment(buildMinimalAssessment())
  return { signed, publicPem }
}

/** Wrap signed assessments into a POST-body-shaped object. */
function body(...signed: SignedLayer2Assessment[]) {
  return { kind: 'seed', profile: {}, provenance: { signed_assessments: signed } }
}

// ============================================================================
// KILL-SWITCH (dark-deploy safety)
// ============================================================================

;(() => {
  resetEnv()
  // Flag unset → gate OFF → ok regardless of body content (even garbage).
  const r1 = enforceWriteProvenance({ anything: true })
  assert('OFF-1  flag unset → ok, enforced:false', r1.ok === true && r1.enforced === false)

  process.env[PROVENANCE_GATE_ENV_VAR] = 'false'
  const r2 = enforceWriteProvenance({})
  assert("OFF-2  flag 'false' → ok, enforced:false", r2.ok === true && r2.enforced === false)
  assert('FLAG-1a isProvenanceGateEnabled false', isProvenanceGateEnabled() === false)

  process.env[PROVENANCE_GATE_ENV_VAR] = 'true'
  assert('FLAG-1b isProvenanceGateEnabled true', isProvenanceGateEnabled() === true)
})()

// ============================================================================
// ENABLED — VALID
// ============================================================================

;(() => {
  const { signed, publicPem } = makeGenuine()
  process.env[PROVENANCE_GATE_ENV_VAR] = 'true'
  process.env[V.PUBLIC_KEY_ENV_VAR] = publicPem
  process.env[V.KEY_ID_ENV_VAR] = 'k1'

  const r = enforceWriteProvenance(body(signed))
  assert('ON-VALID-1  genuine provenance → ok, enforced:true', r.ok === true && r.enforced === true)
  assert('ON-VALID-1b matched_key_id is k1', r.ok === true && r.matched_key_id === 'k1')

  // [forged, genuine] — at least one verifies.
  const forged: SignedLayer2Assessment = { ...signed, assessment: { ...signed.assessment, ruling_faculty_state: 'FORGED' } }
  const rMulti = enforceWriteProvenance(body(forged, signed))
  assert('ON-MULTI-1  [forged, genuine] → ok (one verifies)', rMulti.ok === true)
})()

// ============================================================================
// ENABLED — REJECT
// ============================================================================

;(() => {
  const { signed, publicPem } = makeGenuine()
  process.env[PROVENANCE_GATE_ENV_VAR] = 'true'
  process.env[V.PUBLIC_KEY_ENV_VAR] = publicPem
  process.env[V.KEY_ID_ENV_VAR] = 'k1'

  // No provenance field.
  const rNoProv = enforceWriteProvenance({ kind: 'seed', profile: {} })
  assert('ON-BADPROV-1  no provenance field → bad_provenance', rNoProv.ok === false && rNoProv.status === 'bad_provenance')

  // Empty array.
  const rEmpty = enforceWriteProvenance({ provenance: { signed_assessments: [] } })
  assert('ON-BADPROV-2  empty signed_assessments → bad_provenance', rEmpty.ok === false && rEmpty.status === 'bad_provenance')

  // Tampered (forged) assessment — valid shape, bad signature.
  const forged: SignedLayer2Assessment = { ...signed, assessment: { ...signed.assessment, ruling_faculty_state: 'FORGED' } }
  const rForged = enforceWriteProvenance(body(forged))
  assert('ON-NOEXAM-1  tampered assessment → no_examination', rForged.ok === false && rForged.status === 'no_examination')

  // Unknown key_id (caller problem, not operational): verifier key id differs.
  process.env[V.KEY_ID_ENV_VAR] = 'some-other-key'
  const rUnknown = enforceWriteProvenance(body(signed))
  assert('ON-NOEXAM-2  unknown key_id → no_examination', rUnknown.ok === false && rUnknown.status === 'no_examination')
})()

;(() => {
  // Verifier key entirely unset, but the gate is ON and provenance is well-formed
  // → operator misconfiguration → verifier_unavailable (NOT no_examination).
  const { signed } = makeGenuine()
  resetEnv()
  process.env[PROVENANCE_GATE_ENV_VAR] = 'true'
  // (no PUBLIC_KEY set)
  const r = enforceWriteProvenance(body(signed))
  assert('ON-VERIF-1  verifier key unset → verifier_unavailable', r.ok === false && r.status === 'verifier_unavailable')
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
