/**
 * provenance-contract.test.ts — unit tests for validateWriteProvenance (the
 * STRUCTURAL shape validator for the signed-provenance write contract).
 *
 * Run via: `npx tsx website/src/app/api/accreditation/[agent_id]/__tests__/provenance-contract.test.ts`
 * (plain-assertion script; no Jest. provenance-contract.ts imports only a TYPE
 * (erased at runtime), so NO --env-file and NO Supabase chain is loaded.)
 *
 * These tests cover SHAPE only — no cryptography. Cryptographic verification is
 * layer2-verifier.test.ts's job. The two steps are deliberately separate (a
 * 400/422 "bad shape" concern vs a 403 "no examination" concern).
 *
 * COVERAGE
 *   ACCEPT
 *     ACCEPT-1  one well-formed signed assessment → ok, length 1
 *     ACCEPT-2  multiple well-formed signed assessments → ok, length preserved
 *   REJECT (each returns ok:false + a message)
 *     REJECT-1   null
 *     REJECT-2   not an object (string)
 *     REJECT-3   missing signed_assessments
 *     REJECT-4   signed_assessments not an array
 *     REJECT-5   empty array (must carry at least one)
 *     REJECT-6   element missing signature
 *     REJECT-7   element signature is an empty string
 *     REJECT-8   element signature is not a string
 *     REJECT-9   element assessment is not an object
 *     REJECT-10  element missing key_id
 *     REJECT-11  element key_id is an empty string
 *     REJECT-12  one good element + one bad element → rejected (names the index)
 *
 * Exit code 0 = all pass. Non-zero = failures printed.
 */

import { validateWriteProvenance } from '../provenance-contract'

// ============================================================================
// Test runner — plain assertions; exit code reports pass/fail
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

/** Assert the validation rejected with a non-empty message. */
function assertRejected(label: string, raw: unknown): void {
  const r = validateWriteProvenance(raw)
  assert(
    label,
    r.ok === false && typeof r.message === 'string' && r.message.length > 0,
    r.ok ? 'expected ok:false, got ok:true' : 'message missing/empty',
  )
}

// ============================================================================
// Fixtures
// ============================================================================

/** A structurally-valid signed assessment (shape only — the assessment body
 *  need not be a full Layer2Assessment for the STRUCTURAL check). */
function goodElement(keyId = 'k1') {
  return { assessment: { version: 'layer2-assessment-v1' }, signature: 'AAAA', key_id: keyId }
}

// ============================================================================
// ACCEPT
// ============================================================================

;(() => {
  const r = validateWriteProvenance({ signed_assessments: [goodElement()] })
  assert('ACCEPT-1  one well-formed element → ok', r.ok === true)
  assert(
    'ACCEPT-1b length 1',
    r.ok === true && r.provenance.signed_assessments.length === 1,
  )

  const r2 = validateWriteProvenance({
    signed_assessments: [goodElement('k1'), goodElement('k2'), goodElement('k3')],
  })
  assert(
    'ACCEPT-2  three well-formed elements → ok, length 3',
    r2.ok === true && r2.provenance.signed_assessments.length === 3,
  )
})()

// ============================================================================
// REJECT
// ============================================================================

assertRejected('REJECT-1   null', null)
assertRejected('REJECT-2   string (not an object)', 'provenance')
assertRejected('REJECT-3   missing signed_assessments', {})
assertRejected('REJECT-4   signed_assessments not an array', { signed_assessments: 'nope' })
assertRejected('REJECT-5   empty array', { signed_assessments: [] })
assertRejected('REJECT-6   element missing signature', {
  signed_assessments: [{ assessment: {}, key_id: 'k1' }],
})
assertRejected('REJECT-7   element signature empty string', {
  signed_assessments: [{ assessment: {}, signature: '', key_id: 'k1' }],
})
assertRejected('REJECT-8   element signature not a string', {
  signed_assessments: [{ assessment: {}, signature: 123, key_id: 'k1' }],
})
assertRejected('REJECT-9   element assessment not an object', {
  signed_assessments: [{ assessment: 'nope', signature: 'AAAA', key_id: 'k1' }],
})
assertRejected('REJECT-10  element missing key_id', {
  signed_assessments: [{ assessment: {}, signature: 'AAAA' }],
})
assertRejected('REJECT-11  element key_id empty string', {
  signed_assessments: [{ assessment: {}, signature: 'AAAA', key_id: '' }],
})
assertRejected('REJECT-12  one good + one bad element', {
  signed_assessments: [goodElement(), { assessment: {}, signature: 'AAAA' }],
})

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
