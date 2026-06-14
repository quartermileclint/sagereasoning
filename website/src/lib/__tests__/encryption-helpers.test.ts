/**
 * encryption-helpers.test.ts — Round-trip + shape invariants for the
 * D14b encryption wrappers.
 *
 * PURPOSE: Pre-deploy validation per ADR-ENCRYPTION-WIRING-01 Action Item 5
 * (adapted Path A — pre-deploy unit tests + post-deploy SQL verification).
 * Replaces the original integration dry-run for Pattern B (production-only
 * Supabase). Validates:
 *
 *   1. Round-trip: encrypt → decrypt → original input (byte-for-byte).
 *   2. encryption_meta shape: typeof === 'object', not 'string' (KG7).
 *   3. algorithm = 'AES-256-GCM' and version = 1.
 *   4. Object payload round-trip via `encryptDeferralPayload` /
 *      `decryptDeferralPayload`.
 *   5. AES-GCM auth-tag tamper-detection (decrypt throws on tampered
 *      ciphertext).
 *
 * The full encrypt-write-read-decrypt round-trip against production Supabase
 * lands with Phase-2 pass-1's first real write (separate Critical session).
 *
 * Run: npx tsx <this file>
 *
 * Rules served: R17b, R17f, KG1 rule 2 (await DB writes — relevant at the
 * route layer, not here), KG7 (JSONB shape).
 */

import {
  encryptForStorage,
  decryptFromStorage,
  encryptDeferralPayload,
  decryptDeferralPayload,
  type EncryptedField,
} from '../encryption-helpers'
import { isDeepStrictEqual } from 'node:util'

let passed = 0
let failed = 0
const failures: string[] = []

function assert(condition: boolean, label: string): void {
  if (condition) { passed++ } else { failed++; failures.push(label); console.error('FAIL: ' + label) }
}

// Generate a fresh test key per test run. NOT the production key; the test
// key never leaves the test process. 32 bytes = 64 hex characters per the
// server-encryption.ts contract.
const TEST_KEY = Array.from({ length: 32 }, () =>
  Math.floor(Math.random() * 256).toString(16).padStart(2, '0'),
).join('')

// beforeAll
process.env.MENTOR_ENCRYPTION_KEY = TEST_KEY

// ── encryption-helpers — generic helpers ────────────────────────────

// encryptForStorage returns the expected shape for string input
{
  const label = 'generic helpers: encryptForStorage returns the expected shape for string input'
  const result = encryptForStorage('plaintext input')
  assert(typeof result === 'object', label + ' — result is object')
  assert(typeof result.ciphertext === 'string', label + ' — ciphertext is string')
  assert(typeof result.meta === 'object', label + ' — meta is object')
  assert(typeof result.meta.iv === 'string', label + ' — meta.iv is string')
  assert(typeof result.meta.authTag === 'string', label + ' — meta.authTag is string')
  assert(Object.is(result.meta.algorithm, 'AES-256-GCM'), label + ' — algorithm is AES-256-GCM')
  assert(Object.is(result.meta.version, 1), label + ' — version is 1')
}

// encryptForStorage returns the expected shape for object input
{
  const label = 'generic helpers: encryptForStorage returns the expected shape for object input'
  const result = encryptForStorage({ foo: 'bar', n: 42 })
  assert(typeof result === 'object', label + ' — result is object')
  assert(typeof result.ciphertext === 'string', label + ' — ciphertext is string')
  assert(typeof result.meta === 'object', label + ' — meta is object')
  assert(Object.is(result.meta.algorithm, 'AES-256-GCM'), label + ' — algorithm is AES-256-GCM')
}

// round-trip on a string preserves plaintext exactly
{
  const label = 'generic helpers: round-trip on a string preserves plaintext exactly'
  const input = 'arbitrary plaintext with unicode: 日本語 + emoji 🌿'
  const encrypted = encryptForStorage(input)
  const decrypted = decryptFromStorage(encrypted)
  assert(Object.is(decrypted, input), label)
}

// round-trip on an object preserves JSON-equivalence
{
  const label = 'generic helpers: round-trip on an object preserves JSON-equivalence'
  const input = {
    trigger_code: 'EUPATHEIA_BOUNDARY',
    slot_fills: { variable_a: 'value a', variable_b: 42 },
    list: [1, 2, 3],
    flag: true,
  }
  const encrypted = encryptForStorage(input)
  const decryptedString = decryptFromStorage(encrypted)
  const decrypted = JSON.parse(decryptedString)
  assert(isDeepStrictEqual(decrypted, input), label)
}

// two encryptions of identical input produce different ciphertext (fresh IV per call)
{
  const label = 'generic helpers: two encryptions of identical input produce different ciphertext (fresh IV per call)'
  const input = 'same plaintext'
  const a = encryptForStorage(input)
  const b = encryptForStorage(input)
  assert(!Object.is(a.ciphertext, b.ciphertext), label + ' — ciphertext differs')
  assert(!Object.is(a.meta.iv, b.meta.iv), label + ' — iv differs')
}

// ── encryption-helpers — KG7 shape invariants ───────────────────────

// meta is a plain object, not a JSON string scalar (KG7 — load-bearing)
{
  const label = 'KG7 shape invariants: meta is a plain object, not a JSON string scalar (KG7 — load-bearing)'
  // KG7: JSONB columns accept JSON string scalars containing array- or
  // object-shaped strings. The Supabase client does NOT unwrap them on
  // insert. The discipline: pass plain objects, never JSON.stringify.
  // This test enforces that helper-returned meta is itself a plain object.
  const result = encryptForStorage('some plaintext')
  assert(typeof result.meta === 'object', label + ' — meta is object')
  assert(result.meta !== null, label + ' — meta is not null')
  // Specifically: meta should NOT be a JSON-stringified version of itself.
  // If a future maintainer wraps meta in JSON.stringify, this test fails:
  assert(!Object.is(typeof result.meta as string, 'string'), label + ' — meta typeof is not string')
  // The keys are real object keys, accessible via dot notation:
  assert(result.meta.iv !== undefined, label + ' — meta.iv is defined')
  assert(result.meta.authTag !== undefined, label + ' — meta.authTag is defined')
  assert(result.meta.algorithm !== undefined, label + ' — meta.algorithm is defined')
  assert(result.meta.version !== undefined, label + ' — meta.version is defined')
}

// algorithm is the exact string AES-256-GCM
{
  const label = 'KG7 shape invariants: algorithm is the exact string AES-256-GCM'
  const result = encryptForStorage('x')
  assert(Object.is(result.meta.algorithm, 'AES-256-GCM'), label)
}

// version is the integer 1 (rotation-ready placeholder)
{
  const label = 'KG7 shape invariants: version is the integer 1 (rotation-ready placeholder)'
  const result = encryptForStorage('x')
  assert(Object.is(result.meta.version, 1), label)
}

// ── encryption-helpers — D14b named wrappers ────────────────────────

// encryptDeferralPayload + decryptDeferralPayload round-trip preserves the object
{
  const label = 'D14b named wrappers: encryptDeferralPayload + decryptDeferralPayload round-trip preserves the object'
  const payload = {
    trigger_code: 'PRAXIS_MOTIVATION_AMBIGUITY',
    narrative:
      'I considered the question and want to record my thinking.',
    structured: {
      deliberation: 'spent considerable time',
      outcome: 'remains uncertain',
    },
    timestamps: ['2026-05-02T08:00:00Z', '2026-05-02T20:30:00Z'],
  }
  const encrypted = encryptDeferralPayload(payload)
  const decrypted = decryptDeferralPayload<typeof payload>(encrypted)
  assert(isDeepStrictEqual(decrypted, payload), label)
}

// decryptDeferralPayload throws on tampered auth tag (AES-GCM auth-tag check)
{
  const label = 'D14b named wrappers: decryptDeferralPayload throws on tampered auth tag (AES-GCM auth-tag check)'
  const original = encryptDeferralPayload({ x: 1 })
  // Replace the auth tag with 16 zero bytes — guaranteed not to match the
  // real auth tag produced at encrypt time. Avoids base64-padding edge cases
  // that arise when tampering with very-short ciphertext suffixes.
  const tampered: EncryptedField = {
    ...original,
    meta: {
      ...original.meta,
      authTag: Buffer.alloc(16, 0).toString('base64'),
    },
  }
  let threw = false
  try { decryptDeferralPayload(tampered) } catch { threw = true }
  assert(threw, label)
}

// afterAll
delete process.env.MENTOR_ENCRYPTION_KEY

console.log('\n' + passed + ' passed, ' + failed + ' failed')
if (failed > 0) {
  console.error('\nFailures:')
  for (const f of failures) console.error('  - ' + f)
  process.exit(1)
}
