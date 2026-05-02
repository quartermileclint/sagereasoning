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
 * Run: npx jest encryption-helpers --no-coverage
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

// Generate a fresh test key per test run. NOT the production key; the test
// key never leaves the test process. 32 bytes = 64 hex characters per the
// server-encryption.ts contract.
const TEST_KEY = Array.from({ length: 32 }, () =>
  Math.floor(Math.random() * 256).toString(16).padStart(2, '0'),
).join('')

beforeAll(() => {
  process.env.MENTOR_ENCRYPTION_KEY = TEST_KEY
})

afterAll(() => {
  delete process.env.MENTOR_ENCRYPTION_KEY
})

describe('encryption-helpers — generic helpers', () => {
  test('encryptForStorage returns the expected shape for string input', () => {
    const result = encryptForStorage('plaintext input')
    expect(typeof result).toBe('object')
    expect(typeof result.ciphertext).toBe('string')
    expect(typeof result.meta).toBe('object')
    expect(typeof result.meta.iv).toBe('string')
    expect(typeof result.meta.authTag).toBe('string')
    expect(result.meta.algorithm).toBe('AES-256-GCM')
    expect(result.meta.version).toBe(1)
  })

  test('encryptForStorage returns the expected shape for object input', () => {
    const result = encryptForStorage({ foo: 'bar', n: 42 })
    expect(typeof result).toBe('object')
    expect(typeof result.ciphertext).toBe('string')
    expect(typeof result.meta).toBe('object')
    expect(result.meta.algorithm).toBe('AES-256-GCM')
  })

  test('round-trip on a string preserves plaintext exactly', () => {
    const input = 'arbitrary plaintext with unicode: 日本語 + emoji 🌿'
    const encrypted = encryptForStorage(input)
    const decrypted = decryptFromStorage(encrypted)
    expect(decrypted).toBe(input)
  })

  test('round-trip on an object preserves JSON-equivalence', () => {
    const input = {
      trigger_code: 'EUPATHEIA_BOUNDARY',
      slot_fills: { variable_a: 'value a', variable_b: 42 },
      list: [1, 2, 3],
      flag: true,
    }
    const encrypted = encryptForStorage(input)
    const decryptedString = decryptFromStorage(encrypted)
    const decrypted = JSON.parse(decryptedString)
    expect(decrypted).toEqual(input)
  })

  test('two encryptions of identical input produce different ciphertext (fresh IV per call)', () => {
    const input = 'same plaintext'
    const a = encryptForStorage(input)
    const b = encryptForStorage(input)
    expect(a.ciphertext).not.toBe(b.ciphertext)
    expect(a.meta.iv).not.toBe(b.meta.iv)
  })
})

describe('encryption-helpers — KG7 shape invariants', () => {
  test('meta is a plain object, not a JSON string scalar (KG7 — load-bearing)', () => {
    // KG7: JSONB columns accept JSON string scalars containing array- or
    // object-shaped strings. The Supabase client does NOT unwrap them on
    // insert. The discipline: pass plain objects, never JSON.stringify.
    // This test enforces that helper-returned meta is itself a plain object.
    const result = encryptForStorage('some plaintext')
    expect(typeof result.meta).toBe('object')
    expect(result.meta).not.toBeNull()
    // Specifically: meta should NOT be a JSON-stringified version of itself.
    // If a future maintainer wraps meta in JSON.stringify, this test fails:
    expect(typeof result.meta as string).not.toBe('string')
    // The keys are real object keys, accessible via dot notation:
    expect(result.meta.iv).toBeDefined()
    expect(result.meta.authTag).toBeDefined()
    expect(result.meta.algorithm).toBeDefined()
    expect(result.meta.version).toBeDefined()
  })

  test('algorithm is the exact string AES-256-GCM', () => {
    const result = encryptForStorage('x')
    expect(result.meta.algorithm).toBe('AES-256-GCM')
  })

  test('version is the integer 1 (rotation-ready placeholder)', () => {
    const result = encryptForStorage('x')
    expect(result.meta.version).toBe(1)
  })
})

describe('encryption-helpers — D14b named wrappers', () => {
  test('encryptDeferralPayload + decryptDeferralPayload round-trip preserves the object', () => {
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
    expect(decrypted).toEqual(payload)
  })

  test('decryptDeferralPayload throws on tampered auth tag (AES-GCM auth-tag check)', () => {
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
    expect(() => decryptDeferralPayload(tampered)).toThrow()
  })
})
