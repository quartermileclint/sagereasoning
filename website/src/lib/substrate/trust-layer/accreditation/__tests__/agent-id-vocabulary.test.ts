/**
 * agent-id-vocabulary.test.ts — CI-12 (mechanism-correction M3, 2026-06-13).
 *
 * Plain-assertion script run with: npx tsx <this file>   (no Supabase import
 * chain — runs bare, no --env-file needed).
 *
 * What it proves:
 *   1. The K1 canonical form `namespace:name@version` is accepted (including
 *      the ADR's fork form with parens + inner colon).
 *   2. The legacy `agent_*` form is accepted BYTE-IDENTICALLY to the original
 *      isValidAgentId regex — no previously-readable id loses readability.
 *   3. Free-form ids are rejected — including `p1-comparison-leg-b-agent`,
 *      the exact FX-11 repro (the P1 leg-B id that wrote 200 and read 400).
 *   4. THE CI-12 INVARIANT: write-accepted ⇒ read-accepted, by construction —
 *      the public GET's isValidAgentId, the POST boundary, and the A10 mint
 *      validation all resolve to the same isAcceptedAgentId. Asserted both
 *      behaviourally (over the corpus) and structurally (the mint validator's
 *      verdict matches the read validator's verdict for every corpus id).
 */

import {
  isAcceptedAgentId,
  isCanonicalAgentId,
  isLegacyAgentId,
  AGENT_ID_FORMAT_MESSAGE,
} from '../agent-id-vocabulary'
import { isValidAgentId } from '../accreditation-record'
import { validateMintInput } from '../../../../../app/api/admin/accreditation-credentials/validation'

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

// ============================================================================
// 1. K1 canonical form — accepted
// ============================================================================

const CANONICAL_ACCEPTED = [
  'acme:support-bot@v1',           // the documented example
  'you:name@v1',                   // K1 ADR case table — own agent
  'publisher:name@v2',             // K1 ADR case table — downloaded agent
  'you:fork-of(publisher:name)@v1', // K1 ADR case table — fork form
  'sagereasoning:leg-b@v1',        // the M3 TEST-leg shape
  'acme:bot@sha256.0a1b2c3d',      // content-hash version (K1 coarse granularity)
  'a:b@c',                         // minimal
  'ACME:Support-Bot@V1',           // case-insensitive (lowercase is convention)
  'ns.dotted:name_under@1.2.3',    // dots/underscores in tokens
]

for (const id of CANONICAL_ACCEPTED) {
  assert(isCanonicalAgentId(id), `canonical accepted: ${id}`)
  assert(isAcceptedAgentId(id), `vocabulary accepts: ${id}`)
}

// ============================================================================
// 2. Legacy form — accepted, byte-identical to the original regex
// ============================================================================

const LEGACY_ACCEPTED = [
  'agent_test_v1',
  'agent_acme_v1',
  'AGENT_ACME_V1',     // the original regex was /i
  'agent_x',
  'agent_smoke_test_2026',
]

const ORIGINAL_REGEX = /^agent_[a-z0-9_]+$/i

for (const id of LEGACY_ACCEPTED) {
  assert(isLegacyAgentId(id), `legacy accepted: ${id}`)
  assert(isAcceptedAgentId(id), `vocabulary accepts legacy: ${id}`)
}

// Byte-identity of the legacy acceptor with the pre-CI-12 read regex, probed
// across edge shapes (accepted AND rejected sides).
const LEGACY_EDGE_PROBE = [
  'agent_test_v1', 'agent_', 'agent_-x', 'agent_x-y', 'Agent_ok',
  'agentx', 'agent__double', 'agent_ümlaut', 'agent_x ', ' agent_x',
]
for (const id of LEGACY_EDGE_PROBE) {
  assert(
    isLegacyAgentId(id) === ORIGINAL_REGEX.test(id),
    `legacy acceptor byte-identical to original regex for: ${JSON.stringify(id)}`,
  )
}

// ============================================================================
// 3. Free-form ids — rejected (write AND read)
// ============================================================================

const REJECTED = [
  'p1-comparison-leg-b-agent', // THE FX-11 repro — must never write again
  '',
  '   ',
  'agent-hyphenated',          // hyphen breaks the legacy form
  'no-colon-or-prefix',
  'ns:name',                   // canonical without @version
  'ns:name@',                  // empty version
  ':name@v1',                  // empty namespace
  'ns:@v1',                    // empty name
  'ns:name@v1@v2',             // double @
  'ns:na me@v1',               // whitespace inside
  'ns:name@v1\n',              // trailing control char
  `${'n'.repeat(65)}:name@v1`, // namespace over the 64-char cap
]

for (const id of REJECTED) {
  assert(!isAcceptedAgentId(id), `vocabulary rejects: ${JSON.stringify(id)}`)
}

// ============================================================================
// 4. THE CI-12 INVARIANT — write-accepted ⇒ read-accepted
// ============================================================================

const CORPUS = [...CANONICAL_ACCEPTED, ...LEGACY_ACCEPTED, ...REJECTED]

// (a) The public GET's validator IS the shared validator (delegation).
for (const id of CORPUS) {
  assert(
    isValidAgentId(id) === isAcceptedAgentId(id),
    `read validator ≡ shared validator for: ${JSON.stringify(id)}`,
  )
}

// (b) The A10 mint boundary's verdict matches the read validator's verdict —
//     a credential can never be minted bound to an unreadable id.
for (const id of CORPUS) {
  if (id.trim() !== id || id.trim() === '') continue // mint trims; skip whitespace shapes
  const mint = validateMintInput({ agent_id: id, purpose: 'sage_assent_write' })
  assert(
    mint.ok === isValidAgentId(id),
    `mint boundary ≡ read validator for: ${JSON.stringify(id)}`,
  )
  if (!mint.ok && id !== '') {
    assert(
      mint.error === AGENT_ID_FORMAT_MESSAGE,
      `mint rejection carries the shared message for: ${JSON.stringify(id)}`,
    )
  }
}

// (c) The FX-11 repro, stated end-to-end: the leg-B id can no longer be
//     minted, and remains unreadable — consistently rejected on BOTH sides
//     (instead of write-200/read-400).
const FX11 = 'p1-comparison-leg-b-agent'
assert(!validateMintInput({ agent_id: FX11, purpose: 'sage_assent_write' }).ok, 'FX-11 id: mint rejects')
assert(!isValidAgentId(FX11), 'FX-11 id: read rejects (unchanged)')

// ============================================================================
// RESULT
// ============================================================================

console.log(`\n${passed} passed, ${failed} failed`)
if (failed > 0) {
  console.error('\nFailures:')
  for (const f of failures) console.error(`  - ${f}`)
  process.exit(1)
}
