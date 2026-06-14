/**
 * public-key-route.test.ts — plain-assertion invariant tests for /api/public-key.
 *
 * Per /adopted/ADR-A4-key-management.md §Decision 2 (four env vars; fail-safe
 * partial-state). Mirrors the testing pattern used by
 * layer2-canonical-json.test.ts and layer2-signer.test.ts (both written at A3).
 *
 * Run: npx tsx <this file>
 *
 * Coverage:
 *   - Scenario 1: no rotation in progress (four env vars unset) → previous=null
 *   - Scenario 2: rotation in progress (all four env vars set) → previous populated
 *   - Scenario 3: partial state (one of four unset) → fail-safe to null (4 sub-cases,
 *                  one per env var)
 *   - Scenario 4: 503 fail-closed when current public key env var is unset
 *   - Scenario 5: rotation_overlap_until mirrors previous.retires_at exactly
 *   - Scenario 6: env vars read at call time (not at module load)
 *
 * Compliance:
 *   - AC4: invocation testing for the public-key endpoint contract; the route
 *           is invoked via the GET handler in each test; assertions confirm the
 *           contract.
 *   - PR6: tests run before any deploy of the route extension to confirm the
 *           fail-safe posture is preserved across all four env-var combinations.
 */

import { GET } from '../route'

let passed = 0
let failed = 0
const failures: string[] = []

function assert(condition: boolean, label: string): void {
  if (condition) {
    passed++
  } else {
    failed++
    failures.push(label)
    console.error('FAIL: ' + label)
  }
}

// Capture the original env so each test can restore baseline cleanly.
const originalEnv = { ...process.env }

// Canonical test values. Test PEMs are NOT real keys — they are placeholders
// for env-var-shape testing. Real key generation happens at the rotation
// runbook's Step 1 (rehearsed at session Step 6).
const TEST_CURRENT_PUBLIC_KEY_PEM =
  '-----BEGIN PUBLIC KEY-----\nMCowBQYDK2VwAyEATESTcurrentkeyplaceholderforroutetestonly==\n-----END PUBLIC KEY-----'
const TEST_CURRENT_KEY_ID = 'substrate-layer2-test-current'
const TEST_CURRENT_ISSUED_AT = '2026-05-10T04:45:15.516Z'

const TEST_PREVIOUS_PUBLIC_KEY_PEM =
  '-----BEGIN PUBLIC KEY-----\nMCowBQYDK2VwAyEATESTpreviouskeyplaceholderforroutetestonly==\n-----END PUBLIC KEY-----'
const TEST_PREVIOUS_KEY_ID = 'substrate-layer2-test-previous'
const TEST_PREVIOUS_ISSUED_AT = '2026-02-01T00:00:00.000Z'
const TEST_PREVIOUS_RETIRES_AT = '2026-10-06T00:00:00.000Z'

/** Set the current-key env vars to canonical test values. */
function setCurrentKeyEnv() {
  process.env.SUBSTRATE_LAYER2_PUBLIC_KEY = TEST_CURRENT_PUBLIC_KEY_PEM
  process.env.SUBSTRATE_LAYER2_KEY_ID = TEST_CURRENT_KEY_ID
  process.env.SUBSTRATE_LAYER2_KEY_ISSUED_AT = TEST_CURRENT_ISSUED_AT
}

/** Set all four previous-key env vars to canonical test values. */
function setAllPreviousKeyEnv() {
  process.env.SUBSTRATE_LAYER2_PREVIOUS_PUBLIC_KEY = TEST_PREVIOUS_PUBLIC_KEY_PEM
  process.env.SUBSTRATE_LAYER2_PREVIOUS_KEY_ID = TEST_PREVIOUS_KEY_ID
  process.env.SUBSTRATE_LAYER2_PREVIOUS_KEY_ISSUED_AT = TEST_PREVIOUS_ISSUED_AT
  process.env.SUBSTRATE_LAYER2_PREVIOUS_KEY_RETIRES_AT = TEST_PREVIOUS_RETIRES_AT
}

/** Unset all four previous-key env vars. */
function unsetAllPreviousKeyEnv() {
  delete process.env.SUBSTRATE_LAYER2_PREVIOUS_PUBLIC_KEY
  delete process.env.SUBSTRATE_LAYER2_PREVIOUS_KEY_ID
  delete process.env.SUBSTRATE_LAYER2_PREVIOUS_KEY_ISSUED_AT
  delete process.env.SUBSTRATE_LAYER2_PREVIOUS_KEY_RETIRES_AT
}

/**
 * beforeEach equivalent: restore baseline env before each test, unset all
 * previous-key vars, and unset all current-key vars (so each block starts from
 * a clean no-key baseline, exactly as the original Jest beforeEach did).
 */
function resetEnv() {
  process.env = { ...originalEnv }
  unsetAllPreviousKeyEnv()
  delete process.env.SUBSTRATE_LAYER2_PUBLIC_KEY
  delete process.env.SUBSTRATE_LAYER2_KEY_ID
  delete process.env.SUBSTRATE_LAYER2_KEY_ISSUED_AT
}

async function run() {
  // ==========================================================================
  // Scenario 1: no rotation in progress (steady state)
  // ==========================================================================
  {
    resetEnv()
    setCurrentKeyEnv()
    // No previous-key env vars set.

    const response = await GET()
    assert(Object.is(response.status, 200), 'Scenario 1 — no rotation: status 200')
    const body = await response.json()

    assert(Object.is(body.key_id, TEST_CURRENT_KEY_ID), 'Scenario 1 — no rotation: key_id is current key id')
    assert(Object.is(body.algorithm, 'Ed25519'), 'Scenario 1 — no rotation: algorithm Ed25519')
    assert(
      Object.is(body.public_key_pem, TEST_CURRENT_PUBLIC_KEY_PEM),
      'Scenario 1 — no rotation: public_key_pem is current pem'
    )
    assert(Object.is(body.issued_at, TEST_CURRENT_ISSUED_AT), 'Scenario 1 — no rotation: issued_at is current')
    assert(body.previous === null, 'Scenario 1 — no rotation: previous is null')
    assert(body.rotation_overlap_until === null, 'Scenario 1 — no rotation: rotation_overlap_until is null')
  }

  // ==========================================================================
  // Scenario 2: rotation in progress (overlap window active)
  // ==========================================================================
  {
    resetEnv()
    setCurrentKeyEnv()
    setAllPreviousKeyEnv()

    const response = await GET()
    assert(Object.is(response.status, 200), 'Scenario 2 — rotation in progress: status 200')
    const body = await response.json()

    // Current-key fields preserved.
    assert(Object.is(body.key_id, TEST_CURRENT_KEY_ID), 'Scenario 2 — rotation in progress: key_id is current')
    assert(
      Object.is(body.public_key_pem, TEST_CURRENT_PUBLIC_KEY_PEM),
      'Scenario 2 — rotation in progress: public_key_pem is current'
    )
    assert(
      Object.is(body.issued_at, TEST_CURRENT_ISSUED_AT),
      'Scenario 2 — rotation in progress: issued_at is current'
    )

    // Previous-key block populated with all four fields.
    assert(body.previous !== null, 'Scenario 2 — rotation in progress: previous not null')
    assert(
      Object.is(body.previous.key_id, TEST_PREVIOUS_KEY_ID),
      'Scenario 2 — rotation in progress: previous.key_id'
    )
    assert(
      Object.is(body.previous.public_key_pem, TEST_PREVIOUS_PUBLIC_KEY_PEM),
      'Scenario 2 — rotation in progress: previous.public_key_pem'
    )
    assert(
      Object.is(body.previous.issued_at, TEST_PREVIOUS_ISSUED_AT),
      'Scenario 2 — rotation in progress: previous.issued_at'
    )
    assert(
      Object.is(body.previous.retires_at, TEST_PREVIOUS_RETIRES_AT),
      'Scenario 2 — rotation in progress: previous.retires_at'
    )

    // rotation_overlap_until mirrors previous.retires_at exactly.
    assert(
      Object.is(body.rotation_overlap_until, TEST_PREVIOUS_RETIRES_AT),
      'Scenario 2 — rotation in progress: rotation_overlap_until mirrors retires_at'
    )
  }

  // ==========================================================================
  // Scenario 3: partial state (fail-safe per A4 ADR Decision 2)
  // Four sub-cases, one per env var unset.
  // ==========================================================================

  // Scenario 3a — SUBSTRATE_LAYER2_PREVIOUS_PUBLIC_KEY unset → previous=null
  {
    resetEnv()
    setCurrentKeyEnv()
    setAllPreviousKeyEnv()
    delete process.env.SUBSTRATE_LAYER2_PREVIOUS_PUBLIC_KEY

    const response = await GET()
    assert(Object.is(response.status, 200), 'Scenario 3a — partial state: status 200')
    const body = await response.json()

    assert(body.previous === null, 'Scenario 3a — partial state: previous is null')
    assert(body.rotation_overlap_until === null, 'Scenario 3a — partial state: rotation_overlap_until is null')
  }

  // Scenario 3b — SUBSTRATE_LAYER2_PREVIOUS_KEY_ID unset → previous=null
  {
    resetEnv()
    setCurrentKeyEnv()
    setAllPreviousKeyEnv()
    delete process.env.SUBSTRATE_LAYER2_PREVIOUS_KEY_ID

    const response = await GET()
    assert(Object.is(response.status, 200), 'Scenario 3b — partial state: status 200')
    const body = await response.json()

    assert(body.previous === null, 'Scenario 3b — partial state: previous is null')
    assert(body.rotation_overlap_until === null, 'Scenario 3b — partial state: rotation_overlap_until is null')
  }

  // Scenario 3c — SUBSTRATE_LAYER2_PREVIOUS_KEY_ISSUED_AT unset → previous=null
  {
    resetEnv()
    setCurrentKeyEnv()
    setAllPreviousKeyEnv()
    delete process.env.SUBSTRATE_LAYER2_PREVIOUS_KEY_ISSUED_AT

    const response = await GET()
    assert(Object.is(response.status, 200), 'Scenario 3c — partial state: status 200')
    const body = await response.json()

    assert(body.previous === null, 'Scenario 3c — partial state: previous is null')
    assert(body.rotation_overlap_until === null, 'Scenario 3c — partial state: rotation_overlap_until is null')
  }

  // Scenario 3d — SUBSTRATE_LAYER2_PREVIOUS_KEY_RETIRES_AT unset → previous=null
  {
    resetEnv()
    setCurrentKeyEnv()
    setAllPreviousKeyEnv()
    delete process.env.SUBSTRATE_LAYER2_PREVIOUS_KEY_RETIRES_AT

    const response = await GET()
    assert(Object.is(response.status, 200), 'Scenario 3d — partial state: status 200')
    const body = await response.json()

    assert(body.previous === null, 'Scenario 3d — partial state: previous is null')
    assert(body.rotation_overlap_until === null, 'Scenario 3d — partial state: rotation_overlap_until is null')
  }

  // Scenario 3e — empty-string env vars treated as unset (fail-safe)
  {
    resetEnv()
    setCurrentKeyEnv()
    setAllPreviousKeyEnv()
    process.env.SUBSTRATE_LAYER2_PREVIOUS_PUBLIC_KEY = ''

    const response = await GET()
    assert(Object.is(response.status, 200), 'Scenario 3e — empty-string treated as unset: status 200')
    const body = await response.json()

    assert(body.previous === null, 'Scenario 3e — empty-string treated as unset: previous is null')
    assert(
      body.rotation_overlap_until === null,
      'Scenario 3e — empty-string treated as unset: rotation_overlap_until is null'
    )
  }

  // ==========================================================================
  // Scenario 4: 503 fail-closed when current public key env var is unset
  // (preserves A3 behaviour; A4 must not regress it)
  // ==========================================================================
  {
    resetEnv()
    // No current-key env vars set; previous-key state irrelevant for this test.

    const response = await GET()
    assert(Object.is(response.status, 503), 'Scenario 4 — current key unset: status 503')
    const body = await response.json()

    assert(
      Object.is(body.error, 'substrate_public_key_unavailable'),
      'Scenario 4 — current key unset: error substrate_public_key_unavailable'
    )
  }

  // ==========================================================================
  // Scenario 5: env vars read at call time (not at module load)
  // Tests that changing env between calls is reflected in subsequent responses.
  // ==========================================================================
  {
    resetEnv()
    setCurrentKeyEnv()

    // First call — no rotation.
    const response1 = await GET()
    const body1 = await response1.json()
    assert(body1.previous === null, 'Scenario 5 — read at call time: first call previous is null')

    // Set previous-key env between calls.
    setAllPreviousKeyEnv()

    // Second call — rotation in progress.
    const response2 = await GET()
    const body2 = await response2.json()
    assert(body2.previous !== null, 'Scenario 5 — read at call time: second call previous not null')
    assert(
      Object.is(body2.previous.key_id, TEST_PREVIOUS_KEY_ID),
      'Scenario 5 — read at call time: second call previous.key_id'
    )

    // Unset previous-key env again.
    unsetAllPreviousKeyEnv()

    // Third call — back to no rotation.
    const response3 = await GET()
    const body3 = await response3.json()
    assert(body3.previous === null, 'Scenario 5 — read at call time: third call previous is null')
  }

  // ==========================================================================
  // Response-shape invariants preserved at A4
  // ==========================================================================

  // A3 contract: response always carries all six top-level fields
  {
    resetEnv()
    setCurrentKeyEnv()
    setAllPreviousKeyEnv()

    const response = await GET()
    const body = await response.json()

    // All six fields present.
    assert('key_id' in body, 'A3 contract: response has key_id')
    assert('algorithm' in body, 'A3 contract: response has algorithm')
    assert('public_key_pem' in body, 'A3 contract: response has public_key_pem')
    assert('issued_at' in body, 'A3 contract: response has issued_at')
    assert('rotation_overlap_until' in body, 'A3 contract: response has rotation_overlap_until')
    assert('previous' in body, 'A3 contract: response has previous')

    // Algorithm is canonical.
    assert(Object.is(body.algorithm, 'Ed25519'), 'A3 contract: algorithm is canonical Ed25519')
  }

  // A3 contract: Cache-Control header preserved on 200 responses
  {
    resetEnv()
    setCurrentKeyEnv()

    const response = await GET()
    const cacheControl = response.headers.get('Cache-Control')
    assert(
      Object.is(cacheControl, 'public, max-age=3600, s-maxage=3600'),
      'A3 contract: Cache-Control header preserved on 200'
    )
  }

  // afterAll equivalent: restore original env after the suite.
  process.env = originalEnv

  console.log('\n' + passed + ' passed, ' + failed + ' failed')
  if (failed > 0) {
    console.error('\nFailures:')
    for (const f of failures) console.error('  - ' + f)
    process.exit(1)
  }
}

run()
