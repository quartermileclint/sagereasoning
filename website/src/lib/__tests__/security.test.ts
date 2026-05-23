/**
 * security.test.ts — A10 per-agent write-credential validation tests.
 *
 * STATUS: NEW (2026-05-21, A10 build — D-ATL-A10-BUILD-WIRED-VERIFIED-2026-05-21).
 *
 * Covers the security-critical A10 auth-decision logic (Decisions A + E + 3a):
 *   - generateSageAssentWriteToken — sr_assent_ prefix + correct SHA-256 hash + uniqueness.
 *   - validateSageAssentWriteToken — the prefix-reject ('no_token') path (returns
 *     before any DB hit, so it is exercised here directly).
 *   - evaluateSageAssentWriteRow — the PURE post-lookup decision across all six cases:
 *     invalid_token (null row = unknown OR revoked), wrong_agent, wrong_scope
 *     (identity + path, including fail-closed on a scoped credential with no
 *     supplied signal), ok-no-scope, ok-matching-scope.
 *
 * The full Supabase round-trip (hash → api_keys lookup) inside
 * validateSageAssentWriteToken is verified by the founder's post-deploy smoke tests
 * (Step 10), consistent with how the write-path build verified its POST handler.
 *
 * Run with (no --env-file needed — these paths construct no Supabase client):
 *   npx tsx website/src/lib/__tests__/security.test.ts
 */

import { createHash } from 'node:crypto'
import {
  generateSageAssentWriteToken,
  validateSageAssentWriteToken,
  evaluateSageAssentWriteRow,
  SAGE_ASSENT_WRITE_TOKEN_PREFIX,
  type SageAssentCredentialRow,
} from '../security'

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

function row(overrides: Partial<SageAssentCredentialRow> = {}): SageAssentCredentialRow {
  return {
    id: 'cred-uuid-1',
    agent_id: 'agent_acme_v1',
    owner_user_id: 'owner-uuid-1',
    scope_downstream_identity_model: null,
    scope_path_posture: null,
    ...overrides,
  }
}

// ============================================================================
// generateSageAssentWriteToken
// ============================================================================

function testGenerateToken(): void {
  const { raw, hash } = generateSageAssentWriteToken()
  assert(raw.startsWith(SAGE_ASSENT_WRITE_TOKEN_PREFIX), 'GEN-1 raw token starts with sr_assent_ prefix')
  assertEqual(
    raw.length,
    SAGE_ASSENT_WRITE_TOKEN_PREFIX.length + 32,
    'GEN-2 raw token is prefix + 32 hex chars',
  )
  assertEqual(
    hash,
    createHash('sha256').update(raw).digest('hex'),
    'GEN-3 hash is SHA-256 of the raw token',
  )
  const second = generateSageAssentWriteToken()
  assert(second.raw !== raw, 'GEN-4 two mints produce different tokens')
}

// ============================================================================
// validateSageAssentWriteToken — prefix-reject path (no DB)
// ============================================================================

async function testPrefixReject(): Promise<void> {
  const r1 = await validateSageAssentWriteToken('not_a_token', 'agent_acme_v1')
  assert(!r1.valid && r1.reason === 'no_token', 'PFX-1 non-prefixed token → no_token')

  const r2 = await validateSageAssentWriteToken('sr_live_deadbeef', 'agent_acme_v1')
  assert(!r2.valid && r2.reason === 'no_token', 'PFX-2 sr_live_ token rejected (wrong prefix) → no_token')

  const r3 = await validateSageAssentWriteToken('', 'agent_acme_v1')
  assert(!r3.valid && r3.reason === 'no_token', 'PFX-3 empty token → no_token')
}

// ============================================================================
// evaluateSageAssentWriteRow — the pure decision
// ============================================================================

function testInvalidToken(): void {
  const result = evaluateSageAssentWriteRow(null, 'agent_acme_v1')
  assert(!result.valid && result.reason === 'invalid_token', 'INV-1 null row (unknown/revoked) → invalid_token')
}

function testWrongAgent(): void {
  const result = evaluateSageAssentWriteRow(row({ agent_id: 'agent_acme_v1' }), 'agent_other_v1')
  assert(!result.valid && result.reason === 'wrong_agent', 'WAG-1 agent mismatch → wrong_agent')
}

function testWrongScope(): void {
  // Identity-model scope mismatch.
  const idMismatch = evaluateSageAssentWriteRow(
    row({ scope_downstream_identity_model: 'vendor_framework' }),
    'agent_acme_v1',
    { downstream_identity_model: 'browser_session' },
  )
  assert(!idMismatch.valid && idMismatch.reason === 'wrong_scope', 'WSC-1 identity-model mismatch → wrong_scope')

  // Path-posture scope mismatch.
  const pathMismatch = evaluateSageAssentWriteRow(
    row({ scope_path_posture: 'endorsed' }),
    'agent_acme_v1',
    { path_posture: 'unsanctioned' },
  )
  assert(!pathMismatch.valid && pathMismatch.reason === 'wrong_scope', 'WSC-2 path-posture mismatch → wrong_scope')

  // Scoped credential but NO supplied signal → fail closed.
  const missingSignal = evaluateSageAssentWriteRow(
    row({ scope_downstream_identity_model: 'vendor_framework' }),
    'agent_acme_v1',
    undefined,
  )
  assert(!missingSignal.valid && missingSignal.reason === 'wrong_scope', 'WSC-3 scoped credential + no supplied signal → wrong_scope (fail closed)')
}

function testOkNoScope(): void {
  const result = evaluateSageAssentWriteRow(row(), 'agent_acme_v1', undefined)
  assert(result.valid, 'OKNS-1 unscoped credential, matching agent → valid')
  if (result.valid) {
    assertEqual(result.credential_id, 'cred-uuid-1', 'OKNS-2 returns credential_id')
    assertEqual(result.owner_user_id, 'owner-uuid-1', 'OKNS-3 returns owner_user_id')
    assertEqual(result.scope_downstream_identity_model, null, 'OKNS-4 echoes null identity scope')
    assertEqual(result.scope_path_posture, null, 'OKNS-5 echoes null path scope')
  }
}

function testOkMatchingScope(): void {
  const result = evaluateSageAssentWriteRow(
    row({ scope_downstream_identity_model: 'vendor_framework', scope_path_posture: 'endorsed' }),
    'agent_acme_v1',
    { downstream_identity_model: 'vendor_framework', path_posture: 'endorsed' },
  )
  assert(result.valid, 'OKMS-1 scoped credential, matching CarriedProfile → valid')
  if (result.valid) {
    assertEqual(result.scope_downstream_identity_model, 'vendor_framework', 'OKMS-2 echoes identity scope')
    assertEqual(result.scope_path_posture, 'endorsed', 'OKMS-3 echoes path scope')
  }
}

// ============================================================================
// RUNNER
// ============================================================================

async function run(): Promise<void> {
  testGenerateToken()
  await testPrefixReject()
  testInvalidToken()
  testWrongAgent()
  testWrongScope()
  testOkNoScope()
  testOkMatchingScope()

  console.log('')
  console.log(`Total: ${passed + failed}  Pass: ${passed}  Fail: ${failed}`)
  if (failed > 0) {
    console.error('')
    console.error('Failures:')
    for (const f of failures) console.error(`  - ${f}`)
    process.exit(1)
  }
}

run().catch((err) => {
  console.error('Test runner error:', err)
  process.exit(1)
})
