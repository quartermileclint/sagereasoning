/**
 * plugin-install-auth.test.ts — A10 per-install plugin-auth credential tests.
 *
 * STATUS: NEW (2026-06-03, A10 Stage-1 kickoff). Library-code PR1 proof for the
 * Surface-1 (opaque bearer) decision logic of the Token-Format ADR
 * (/adopted/adr/2026-06-03-a10-token-format.md).
 *
 * Covers the security-critical per-install auth-decision logic:
 *   - generatePluginInstallToken — sr_inst_ prefix + correct SHA-256 hash + uniqueness.
 *   - validatePluginInstallToken — the prefix-reject ('no_token') path (returns
 *     before any DB hit, so it is exercised here directly, no Supabase needed).
 *   - extractPluginInstallToken — Bearer-only header extraction.
 *   - evaluatePluginInstallRow — the PURE post-lookup decision across all cases:
 *     invalid_token (null row = unknown OR REVOKED — the universal revocation
 *     check), the no-required-scope pass, exact-scope pass, higher-scope pass,
 *     and insufficient_scope (fail-closed), for both identity_types.
 *
 * The full Supabase round-trip (hash → api_keys lookup) inside
 * validatePluginInstallToken is verified by the founder at the Critical
 * implementation session (route-wiring), consistent with the sage_assent_write
 * precedent.
 *
 * Run with (no --env-file needed — these paths construct no Supabase client):
 *   npx tsx website/src/lib/__tests__/plugin-install-auth.test.ts
 */

import { createHash } from 'node:crypto'
import {
  generatePluginInstallToken,
  validatePluginInstallToken,
  evaluatePluginInstallRow,
  extractPluginInstallToken,
  PLUGIN_INSTALL_TOKEN_PREFIX,
  type PluginInstallCredentialRow,
} from '../plugin-install-auth'

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

function row(overrides: Partial<PluginInstallCredentialRow> = {}): PluginInstallCredentialRow {
  return {
    id: 'cred-uuid-1',
    owner_user_id: 'owner-uuid-1',
    identity_type: 'agent',
    install_id: 'install_acme_001',
    install_scope: 'mentor-also',
    ...overrides,
  }
}

// All async paths are wrapped in main() — tsx transforms to CJS here, which does
// not support top-level await (verified 2026-06-03; harness-ergonomics note).
async function main(): Promise<void> {

// ============================================================================
// 1. generatePluginInstallToken
// ============================================================================

{
  const { raw, hash } = generatePluginInstallToken()
  assert(raw.startsWith(PLUGIN_INSTALL_TOKEN_PREFIX), 'generate: raw has sr_inst_ prefix')
  assertEqual(raw.length, PLUGIN_INSTALL_TOKEN_PREFIX.length + 32, 'generate: raw is prefix + 32 hex')
  assertEqual(
    hash,
    createHash('sha256').update(raw).digest('hex'),
    'generate: hash is SHA-256 of raw',
  )
  const second = generatePluginInstallToken()
  assert(second.raw !== raw, 'generate: tokens are unique')
}

// ============================================================================
// 2. validatePluginInstallToken — prefix reject (no DB hit)
// ============================================================================

{
  const r1 = await validatePluginInstallToken('sr_live_deadbeef')
  assert(!r1.valid && r1.reason === 'no_token', 'validate: sr_live_ prefix → no_token')

  const r2 = await validatePluginInstallToken('sr_assent_deadbeef')
  assert(!r2.valid && r2.reason === 'no_token', 'validate: sr_assent_ prefix → no_token')

  const r3 = await validatePluginInstallToken('garbage')
  assert(!r3.valid && r3.reason === 'no_token', 'validate: junk → no_token')
}

// ============================================================================
// 3. extractPluginInstallToken — Bearer-only
// ============================================================================

{
  assertEqual(
    extractPluginInstallToken('Bearer sr_inst_abc'),
    'sr_inst_abc',
    'extract: Bearer sr_inst_ → token',
  )
  assertEqual(extractPluginInstallToken(null), null, 'extract: null header → null')
  assertEqual(
    extractPluginInstallToken('Bearer sr_live_abc'),
    null,
    'extract: wrong prefix → null',
  )
  assertEqual(
    extractPluginInstallToken('sr_inst_abc'),
    null,
    'extract: no Bearer scheme → null',
  )
}

// ============================================================================
// 4. evaluatePluginInstallRow — the pure decision
// ============================================================================

{
  // 4a. null row = unknown OR revoked → invalid_token (the universal revocation check)
  const rNull = evaluatePluginInstallRow(null)
  assert(!rNull.valid && rNull.reason === 'invalid_token', 'evaluate: null row → invalid_token (revocation)')

  // 4b. valid row, no required scope → ok, echoes identity fields
  const rOk = evaluatePluginInstallRow(row())
  assert(rOk.valid === true, 'evaluate: active row, no required scope → valid')
  if (rOk.valid) {
    assertEqual(rOk.identity_type, 'agent', 'evaluate: echoes identity_type')
    assertEqual(rOk.install_id, 'install_acme_001', 'evaluate: echoes install_id')
    assertEqual(rOk.install_scope, 'mentor-also', 'evaluate: echoes install_scope')
    assertEqual(rOk.credential_id, 'cred-uuid-1', 'evaluate: echoes credential_id')
  }

  // 4c. required scope == granted scope → ok
  const rExact = evaluatePluginInstallRow(row({ install_scope: 'mentor-also' }), 'mentor-also')
  assert(rExact.valid === true, 'evaluate: granted == required → valid')

  // 4d. granted scope HIGHER than required (admin ⊇ assessment-only) → ok
  const rHigher = evaluatePluginInstallRow(row({ install_scope: 'admin' }), 'assessment-only')
  assert(rHigher.valid === true, 'evaluate: admin granted, assessment-only required → valid')

  // 4e. granted scope LOWER than required → insufficient_scope (fail-closed)
  const rLow = evaluatePluginInstallRow(row({ install_scope: 'assessment-only' }), 'mentor-also')
  assert(!rLow.valid && rLow.reason === 'insufficient_scope', 'evaluate: assessment-only granted, mentor-also required → insufficient_scope')

  const rLow2 = evaluatePluginInstallRow(row({ install_scope: 'mentor-also' }), 'admin')
  assert(!rLow2.valid && rLow2.reason === 'insufficient_scope', 'evaluate: mentor-also granted, admin required → insufficient_scope')

  // 4f. human identity_type is carried through unchanged
  const rHuman = evaluatePluginInstallRow(row({ identity_type: 'human', install_scope: 'admin' }), 'admin')
  assert(rHuman.valid === true && rHuman.identity_type === 'human', 'evaluate: human identity_type carried, admin==admin → valid')
}

// ============================================================================
// SUMMARY
// ============================================================================

  console.log(`\nplugin-install-auth.test.ts: ${passed} passed, ${failed} failed`)
  if (failed > 0) {
    console.error(`\nFailures:\n${failures.map((f) => `  - ${f}`).join('\n')}`)
    process.exit(1)
  }
}

void main()
