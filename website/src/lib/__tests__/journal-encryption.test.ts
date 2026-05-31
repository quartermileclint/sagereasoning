/**
 * journal-encryption.test.ts — Round-trip + shape invariants for the R17b
 * realtime-journal encrypt/decrypt helpers (journal-encryption.ts).
 *
 * Plain-assertion tsx script (no Jest). Self-contained: sets a fresh per-run
 * test key inline (never the production key) BEFORE the first encrypt call —
 * server-encryption reads MENTOR_ENCRYPTION_KEY lazily at call time, so this
 * works despite ESM import hoisting. No Supabase import → run with plain:
 *
 *   npx tsx src/lib/__tests__/journal-encryption.test.ts
 *
 * Validates:
 *   1. Round-trip: encrypt {impression,assent,action} → decrypt → original.
 *   2. entry_meta shape: typeof === 'object' (KG7), algorithm/version correct.
 *   3. resolveJournalProse handles the encrypted shape.
 *   4. resolveJournalProse falls back to legacy plaintext columns.
 *   5. resolveJournalProse surfaces _decryption_error on a tampered ciphertext
 *      rather than throwing (one bad row never breaks the whole read).
 *
 * Rules served: R17b, R17f, KG7.
 */

// Fresh 64-hex (32-byte) test key. Set BEFORE importing the helpers' callees.
process.env.MENTOR_ENCRYPTION_KEY = Array.from({ length: 32 }, () =>
  Math.floor(Math.random() * 256).toString(16).padStart(2, '0'),
).join('')

import {
  encryptJournalProse,
  decryptJournalProse,
  resolveJournalProse,
  type JournalProse,
} from '../journal-encryption'

let passed = 0
let failed = 0
function check(name: string, cond: boolean): void {
  if (cond) {
    passed++
    console.log(`  ✓ ${name}`)
  } else {
    failed++
    console.error(`  ✗ ${name}`)
  }
}

const sample: JournalProse = {
  impression: 'A colleague took credit for my work in the meeting.',
  assent: 'I judged it as a grave injustice that diminishes me.',
  action: 'I stayed silent, then vented to a friend afterward.',
}

console.log('journal-encryption — round-trip + shape')

// 1. Round-trip
const enc = encryptJournalProse(sample)
const dec = decryptJournalProse(enc)
check('round-trip impression', dec.impression === sample.impression)
check('round-trip assent', dec.assent === sample.assent)
check('round-trip action', dec.action === sample.action)

// 2. Storage shape (KG7 + algorithm/version)
check('ciphertext is a non-empty string', typeof enc.ciphertext === 'string' && enc.ciphertext.length > 0)
check('ciphertext is not the plaintext', !enc.ciphertext.includes('colleague'))
check('meta is a plain object (KG7)', typeof enc.meta === 'object' && enc.meta !== null)
check('meta.algorithm = AES-256-GCM', enc.meta.algorithm === 'AES-256-GCM')
check('meta.version = 1', enc.meta.version === 1)
check('meta has iv + authTag', typeof enc.meta.iv === 'string' && typeof enc.meta.authTag === 'string')

// 3. resolveJournalProse — encrypted shape
const resolvedEnc = resolveJournalProse({
  entry_ciphertext: enc.ciphertext,
  entry_meta: enc.meta,
  impression: null,
  assent: null,
  action: null,
})
check('resolve(encrypted) decrypts impression', resolvedEnc.impression === sample.impression)
check('resolve(encrypted) no _decryption_error', resolvedEnc._decryption_error === undefined)

// 4. resolveJournalProse — legacy plaintext fallback
const resolvedLegacy = resolveJournalProse({
  entry_ciphertext: null,
  entry_meta: null,
  impression: 'legacy impression',
  assent: 'legacy assent',
  action: 'legacy action',
})
check('resolve(legacy) returns plaintext impression', resolvedLegacy.impression === 'legacy impression')
check('resolve(legacy) returns plaintext action', resolvedLegacy.action === 'legacy action')

// 5. Tampered ciphertext → surfaced error, not a throw
const tampered = resolveJournalProse({
  entry_ciphertext: enc.ciphertext.slice(0, -4) + 'AAAA',
  entry_meta: enc.meta,
})
check('resolve(tampered) surfaces _decryption_error', typeof tampered._decryption_error === 'string')

console.log(`\n${passed} passed, ${failed} failed`)
if (failed > 0) process.exit(1)
