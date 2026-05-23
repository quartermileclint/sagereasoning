/**
 * route.test.ts — A10 credential admin endpoint tests.
 *
 * STATUS: NEW (2026-05-21, A10 build — D-ATL-A10-BUILD-WIRED-VERIFIED-2026-05-21).
 *
 * WHAT THIS COVERS: the PURE mint-input validation (validateMintInput) — the
 * testable seam of the POST handler. All branches: malformed body, missing
 * agent_id, wrong purpose, label defaulting, scope enum membership (valid +
 * invalid), and the scope-params-persist path's normalisation.
 *
 * WHAT THIS DOES NOT COVER (verified by the founder's post-deploy smoke tests,
 * Step 10.6–10.8 — consistent with how the write-path build verified its POST
 * handler, since the handler's mint/revoke flow hits Supabase + requireAdmin
 * and mocking that in plain tsx is more friction than value):
 *   - non-admin → 401 (requireAdmin against ADMIN_USER_ID)
 *   - successful mint returns the raw token once + writes a credential_audit row
 *   - duplicate (owner, agent_id) → 409 (the partial unique index)
 *   - revoke sets is_active=false + revoked_at + writes a credential_audit row
 *
 * Run with (no --env-file needed — validation.ts constructs no Supabase client):
 *   npx tsx website/src/app/api/admin/accreditation-credentials/__tests__/route.test.ts
 */

import {
  validateMintInput,
  VALID_IDENTITY_MODELS,
  VALID_PATH_POSTURES,
} from '../validation'

// ============================================================================
// TEST HARNESS
// ============================================================================

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

function assertEqual<T>(actual: T, expected: T, label: string): void {
  const ok = actual === expected
  if (!ok) {
    console.error(
      `FAIL: ${label}\n  expected: ${JSON.stringify(expected)}\n  actual:   ${JSON.stringify(actual)}`,
    )
  }
  assert(ok, label)
}

// ============================================================================
// validateMintInput
// ============================================================================

function testMalformedBody(): void {
  assert(!validateMintInput(null).ok, 'VMI-1 null body → not ok')
  assert(!validateMintInput('string').ok, 'VMI-2 non-object body → not ok')
}

function testMissingAgentId(): void {
  const r = validateMintInput({ purpose: 'sage_assent_write' })
  assert(!r.ok, 'VMI-3 missing agent_id → not ok')
  if (!r.ok) assert(r.error.includes('agent_id'), 'VMI-4 error names agent_id')

  const blank = validateMintInput({ agent_id: '   ', purpose: 'sage_assent_write' })
  assert(!blank.ok, 'VMI-5 blank agent_id → not ok')
}

function testWrongPurpose(): void {
  const missing = validateMintInput({ agent_id: 'agent_acme_v1' })
  assert(!missing.ok, 'VMI-6 missing purpose → not ok')

  const wrong = validateMintInput({ agent_id: 'agent_acme_v1', purpose: 'ecosystem' })
  assert(!wrong.ok, 'VMI-7 purpose=ecosystem → not ok')
  if (!wrong.ok) assert(wrong.error.includes('sage_assent_write'), 'VMI-8 error names sage_assent_write')
}

function testValidMinimal(): void {
  const r = validateMintInput({ agent_id: 'agent_acme_v1', purpose: 'sage_assent_write' })
  assert(r.ok, 'VMI-9 minimal valid input → ok')
  if (r.ok) {
    assertEqual(r.value.agent_id, 'agent_acme_v1', 'VMI-10 agent_id trimmed/passed through')
    assertEqual(r.value.label, 'agent_acme_v1', 'VMI-11 label defaults to agent_id')
    assertEqual(r.value.scope_downstream_identity_model, null, 'VMI-12 identity scope defaults null')
    assertEqual(r.value.scope_path_posture, null, 'VMI-13 path scope defaults null')
  }
}

function testLabelOverride(): void {
  const r = validateMintInput({ agent_id: 'agent_acme_v1', purpose: 'sage_assent_write', label: 'CI bot' })
  assert(r.ok && r.value.label === 'CI bot', 'VMI-14 explicit label preserved')
}

function testValidWithScope(): void {
  const r = validateMintInput({
    agent_id: 'agent_acme_v1',
    purpose: 'sage_assent_write',
    scope_downstream_identity_model: 'vendor_framework',
    scope_path_posture: 'endorsed',
  })
  assert(r.ok, 'VMI-15 valid input with scope params → ok')
  if (r.ok) {
    assertEqual(r.value.scope_downstream_identity_model, 'vendor_framework', 'VMI-16 identity scope persists')
    assertEqual(r.value.scope_path_posture, 'endorsed', 'VMI-17 path scope persists')
  }
}

function testInvalidScopeEnums(): void {
  const badId = validateMintInput({
    agent_id: 'agent_acme_v1',
    purpose: 'sage_assent_write',
    scope_downstream_identity_model: 'not_a_real_model',
  })
  assert(!badId.ok, 'VMI-18 invalid identity-model enum → not ok')

  const badPath = validateMintInput({
    agent_id: 'agent_acme_v1',
    purpose: 'sage_assent_write',
    scope_path_posture: 'not_a_real_posture',
  })
  assert(!badPath.ok, 'VMI-19 invalid path-posture enum → not ok')
}

function testEnumVocabulariesIntact(): void {
  // Guards against accidental drift from the substrate's canonical vocab.
  assertEqual(VALID_IDENTITY_MODELS.length, 7, 'VMI-20 7 identity-model values')
  assertEqual(VALID_PATH_POSTURES.length, 4, 'VMI-21 4 path-posture values')
  assert(VALID_IDENTITY_MODELS.includes('mcp_server'), 'VMI-22 identity models include mcp_server')
  assert(VALID_PATH_POSTURES.includes('ambiguous'), 'VMI-23 path postures include ambiguous')
}

// ============================================================================
// RUNNER
// ============================================================================

function run(): void {
  testMalformedBody()
  testMissingAgentId()
  testWrongPurpose()
  testValidMinimal()
  testLabelOverride()
  testValidWithScope()
  testInvalidScopeEnums()
  testEnumVocabulariesIntact()

  console.log('')
  console.log(`Total: ${passed + failed}  Pass: ${passed}  Fail: ${failed}`)
  if (failed > 0) {
    console.error('')
    console.error('Failures:')
    for (const f of failures) console.error(`  - ${f}`)
    process.exit(1)
  }
}

run()
