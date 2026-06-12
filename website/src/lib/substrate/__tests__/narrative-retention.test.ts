/**
 * narrative-retention.test.ts — M1 CI-1 + CI-17 pure-logic tests (no DB, no LLM).
 *
 * Run via: `npx tsx website/src/lib/substrate/__tests__/narrative-retention.test.ts`
 * (plain-assertion script per CLAUDE.md conventions; no Jest. No --env-file
 * needed — nothing in the import chain constructs a Supabase client at module
 * load, and the encryption key is provisioned in-process below.)
 *
 * COVERAGE:
 *   DG — shouldDeferProse decision matrix, including the election-5 structural
 *        distress guard (distress_signal === true → deferral unavailable, no
 *        matter what was requested).
 *   EN — R17b encryption round-trip via the SR-12/ADR-ENCRYPTION-WIRING-01
 *        column-pair shape (ciphertext TEXT + meta JSONB plain object — KG7).
 *   UW — unwrapAssessment: signed wrapper → bare; bare → unchanged.
 *   RT — computeRetainUntil honours election 4a (90 days).
 *   CN — constants match the approved elections.
 *
 * DB-touching behaviour (pending insert → waitUntil completion → retained row;
 * sweep; purge; deletion) is exercised against the TEST Supabase project in
 * the M1 Step-7 live-run leg — deliberately NOT mocked here.
 */

import * as crypto from 'crypto'

// R17b key provisioned in-process BEFORE any encrypt call (read at call time
// by server-encryption.ts). Never a real key.
if (!process.env.MENTOR_ENCRYPTION_KEY) {
  process.env.MENTOR_ENCRYPTION_KEY = crypto.randomBytes(32).toString('hex')
}

import {
  isL3DeferEnabled,
  shouldDeferProse,
  unwrapAssessment,
  computeRetainUntil,
  buildEncryptedColumns,
  decryptColumns,
  NARRATIVE_RETENTION_DAYS,
  PENDING_STALE_MINUTES,
  MAX_GENERATION_ATTEMPTS,
  type RetainableAssessment,
} from '../narrative-retention'
import type { Layer2Assessment } from '../../translation-sandwich/layer2-mechanisms'

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
// DG — shouldDeferProse decision matrix (election 5 — the Critical guard)
// ============================================================================

assert(
  'DG-1 flag off → never defer (even when requested, no distress)',
  shouldDeferProse({ deferRequested: true, flagEnabled: false, distressSignal: undefined }) === false
)
assert(
  'DG-2 not requested → never defer (flag on)',
  shouldDeferProse({ deferRequested: false, flagEnabled: true, distressSignal: undefined }) === false
)
assert(
  'DG-3 STRUCTURAL DISTRESS GUARD: distress_signal=true → deferral unavailable regardless of request + flag',
  shouldDeferProse({ deferRequested: true, flagEnabled: true, distressSignal: true }) === false
)
assert(
  'DG-4 requested + flag on + no distress signal (undefined) → defer',
  shouldDeferProse({ deferRequested: true, flagEnabled: true, distressSignal: undefined }) === true
)
assert(
  'DG-5 requested + flag on + distress_signal=false (explicit) → defer',
  shouldDeferProse({ deferRequested: true, flagEnabled: true, distressSignal: false }) === true
)

// Flag reader is call-time (election 1) — flipping env flips the answer with
// no re-import.
const savedFlag = process.env.SUBSTRATE_L3_DEFER_ENABLED
delete process.env.SUBSTRATE_L3_DEFER_ENABLED
assert('DG-6 isL3DeferEnabled() false when unset', isL3DeferEnabled() === false)
process.env.SUBSTRATE_L3_DEFER_ENABLED = 'true'
assert('DG-7 isL3DeferEnabled() true when "true" (call-time read)', isL3DeferEnabled() === true)
process.env.SUBSTRATE_L3_DEFER_ENABLED = 'false'
assert('DG-8 isL3DeferEnabled() false when "false"', isL3DeferEnabled() === false)
if (savedFlag === undefined) delete process.env.SUBSTRATE_L3_DEFER_ENABLED
else process.env.SUBSTRATE_L3_DEFER_ENABLED = savedFlag

// ============================================================================
// EN — R17b encryption round-trip (column-pair shape; KG7)
// ============================================================================

const intimateObject = {
  philosophical_reflection:
    'You were drawn to report the defect before examining whether the impulse served the work.',
  evidence: 'verbatim input fragment — the R7 class that mandates R17b',
  nested: { passions: ['epithumia'], proximity: 'deliberate' },
}
const cols = buildEncryptedColumns(intimateObject)

assert('EN-1 ciphertext is a non-empty base64 string', typeof cols.ciphertext === 'string' && cols.ciphertext.length > 0)
assert('EN-2 ciphertext does not contain the plaintext', !cols.ciphertext.includes('verbatim input fragment'))
assert(
  'EN-3 meta is a PLAIN OBJECT with iv/authTag/algorithm/version (KG7 — never pre-stringified)',
  typeof cols.encryption_meta === 'object' &&
    cols.encryption_meta !== null &&
    !Array.isArray(cols.encryption_meta) &&
    typeof cols.encryption_meta.iv === 'string' &&
    typeof cols.encryption_meta.authTag === 'string' &&
    cols.encryption_meta.algorithm === 'AES-256-GCM' &&
    typeof cols.encryption_meta.version === 'number'
)

const roundTripped = decryptColumns<typeof intimateObject>(cols.ciphertext, cols.encryption_meta)
assert(
  'EN-4 round-trip preserves the object byte-for-byte',
  JSON.stringify(roundTripped) === JSON.stringify(intimateObject)
)

const cols2 = buildEncryptedColumns(intimateObject)
assert('EN-5 fresh IV per encryption (no IV reuse)', cols.encryption_meta.iv !== cols2.encryption_meta.iv)

// ============================================================================
// UW — unwrapAssessment
// ============================================================================

// A structurally-minimal stand-in; unwrapAssessment only discriminates on the
// signed-wrapper shape, never reads assessment internals.
const bareStandIn = { version: 'layer2-assessment-v1', decision: 'ALLOW' } as unknown as Layer2Assessment
const signedStandIn = {
  assessment: bareStandIn,
  signature: 'base64-signature-bytes',
  key_id: 'substrate-layer2-test',
} as unknown as RetainableAssessment

assert('UW-1 bare assessment passes through unchanged', unwrapAssessment(bareStandIn) === bareStandIn)
assert('UW-2 signed wrapper unwraps to the inner assessment', unwrapAssessment(signedStandIn) === bareStandIn)

// ============================================================================
// RT / CN — retention arithmetic + elected constants
// ============================================================================

const from = new Date('2026-06-12T00:00:00.000Z')
const until = computeRetainUntil(from)
assert(
  'RT-1 retain_until = created_at + 90 days exactly (election 4a)',
  until.getTime() - from.getTime() === 90 * 24 * 60 * 60 * 1000
)

assert('CN-1 NARRATIVE_RETENTION_DAYS = 90 (election 4a, SR-12 precedent)', NARRATIVE_RETENTION_DAYS === 90)
assert('CN-2 PENDING_STALE_MINUTES = 10 (sweep staleness threshold)', PENDING_STALE_MINUTES === 10)
assert('CN-3 MAX_GENERATION_ATTEMPTS = 3', MAX_GENERATION_ATTEMPTS === 3)

// ============================================================================
// Report
// ============================================================================

console.log(`\n${passCount} passed, ${failCount} failed`)
if (failCount > 0) {
  console.log('\nFailures:')
  for (const f of failures) console.log(`  - ${f}`)
  process.exit(1)
}
