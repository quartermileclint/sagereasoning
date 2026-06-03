/**
 * route.test.ts — A10 plugin-install credential admin endpoint tests.
 *
 * STATUS: NEW (2026-06-03, A10 Critical implementation — staging-plan session 12).
 *
 * WHAT THIS COVERS: the PURE mint-input validation (validatePluginInstallMintInput)
 * — the testable seam of the POST handler. All branches: malformed body, wrong
 * purpose, missing/invalid identity_type, missing install_id, invalid
 * install_scope, label defaulting, and the valid path for both identity_types.
 *
 * WHAT THIS DOES NOT COVER (verified by the founder's post-deploy smoke tests,
 * consistent with the accreditation route precedent — the handler's mint/revoke
 * flow hits Supabase + requireAdmin and mocking that in plain tsx is more
 * friction than value):
 *   - non-admin → 401 (requireAdmin against ADMIN_USER_ID)
 *   - successful mint returns the raw sr_inst_ token once + writes credential_audit
 *   - duplicate active install_id → 409 (the partial unique index, step 6b)
 *   - revoke sets is_active=false + revoked_at + writes credential_audit
 *
 * Run with (no --env-file needed — validation.ts's only import is a type-only
 * import, erased at runtime; it constructs no Supabase client):
 *   npx tsx website/src/app/api/admin/plugin-install-credentials/__tests__/route.test.ts
 */

import {
  validatePluginInstallMintInput,
  VALID_IDENTITY_TYPES,
  VALID_INSTALL_SCOPES,
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

// A valid body factory.
function body(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    purpose: 'plugin_install',
    identity_type: 'agent',
    install_id: 'install_acme_001',
    install_scope: 'mentor-also',
    ...overrides,
  }
}

// ============================================================================
// validatePluginInstallMintInput
// ============================================================================

// Sanity on the exported vocabularies.
assertEqual(VALID_IDENTITY_TYPES.length, 2, 'vocab: two identity_types')
assertEqual(VALID_INSTALL_SCOPES.length, 3, 'vocab: three install_scopes')

// 1. Malformed body → error.
{
  const r = validatePluginInstallMintInput(null)
  assert(!r.ok, 'null body → not ok')
  const r2 = validatePluginInstallMintInput('not-an-object')
  assert(!r2.ok, 'string body → not ok')
}

// 2. Wrong / missing purpose → error.
{
  const r = validatePluginInstallMintInput(body({ purpose: 'sage_assent_write' }))
  assert(!r.ok, 'wrong purpose → not ok')
  const r2 = validatePluginInstallMintInput(body({ purpose: undefined }))
  assert(!r2.ok, 'missing purpose → not ok')
}

// 3. identity_type — missing / invalid → error; both valid values pass.
{
  const rMissing = validatePluginInstallMintInput(body({ identity_type: undefined }))
  assert(!rMissing.ok, 'missing identity_type → not ok')
  const rBad = validatePluginInstallMintInput(body({ identity_type: 'robot' }))
  assert(!rBad.ok, 'invalid identity_type → not ok')

  const rHuman = validatePluginInstallMintInput(body({ identity_type: 'human' }))
  assert(rHuman.ok, 'identity_type human → ok')
  const rAgent = validatePluginInstallMintInput(body({ identity_type: 'agent' }))
  assert(rAgent.ok, 'identity_type agent → ok')
}

// 4. install_id — missing / blank / whitespace → error; trimmed on success.
{
  const rMissing = validatePluginInstallMintInput(body({ install_id: undefined }))
  assert(!rMissing.ok, 'missing install_id → not ok')
  const rBlank = validatePluginInstallMintInput(body({ install_id: '   ' }))
  assert(!rBlank.ok, 'whitespace-only install_id → not ok')

  const rTrim = validatePluginInstallMintInput(body({ install_id: '  install_x  ' }))
  assert(rTrim.ok, 'padded install_id → ok')
  if (rTrim.ok) assertEqual(rTrim.value.install_id, 'install_x', 'install_id trimmed')
}

// 5. install_scope — missing / invalid → error; each valid scope passes.
{
  const rMissing = validatePluginInstallMintInput(body({ install_scope: undefined }))
  assert(!rMissing.ok, 'missing install_scope → not ok')
  const rBad = validatePluginInstallMintInput(body({ install_scope: 'superuser' }))
  assert(!rBad.ok, 'invalid install_scope → not ok')

  for (const scope of VALID_INSTALL_SCOPES) {
    const r = validatePluginInstallMintInput(body({ install_scope: scope }))
    assert(r.ok, `install_scope ${scope} → ok`)
  }
}

// 6. label — defaults to install_id when absent/blank; trimmed when present.
{
  const rDefault = validatePluginInstallMintInput(body({ label: undefined, install_id: 'install_y' }))
  assert(rDefault.ok, 'no label → ok')
  if (rDefault.ok) assertEqual(rDefault.value.label, 'install_y', 'label defaults to install_id')

  const rBlank = validatePluginInstallMintInput(body({ label: '   ', install_id: 'install_z' }))
  assert(rBlank.ok, 'blank label → ok')
  if (rBlank.ok) assertEqual(rBlank.value.label, 'install_z', 'blank label → defaults to install_id')

  const rLabel = validatePluginInstallMintInput(body({ label: '  Acme prod  ' }))
  assert(rLabel.ok, 'explicit label → ok')
  if (rLabel.ok) assertEqual(rLabel.value.label, 'Acme prod', 'explicit label trimmed')
}

// 7. Full valid input echoes the normalised value.
{
  const r = validatePluginInstallMintInput(body())
  assert(r.ok, 'full valid input → ok')
  if (r.ok) {
    assertEqual(r.value.identity_type, 'agent', 'echoes identity_type')
    assertEqual(r.value.install_id, 'install_acme_001', 'echoes install_id')
    assertEqual(r.value.install_scope, 'mentor-also', 'echoes install_scope')
  }
}

// ============================================================================
// SUMMARY
// ============================================================================

console.log(`\nplugin-install-credentials/route.test.ts: ${passed} passed, ${failed} failed`)
if (failed > 0) {
  console.error(`\nFailures:\n${failures.map((f) => `  - ${f}`).join('\n')}`)
  process.exit(1)
}
