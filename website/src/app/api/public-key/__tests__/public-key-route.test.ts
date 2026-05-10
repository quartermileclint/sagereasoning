/**
 * public-key-route.test.ts — Jest-style invariant tests for /api/public-key.
 *
 * Per /adopted/ADR-A4-key-management.md §Decision 2 (four env vars; fail-safe
 * partial-state). Mirrors the testing pattern used by
 * layer2-canonical-json.test.ts and layer2-signer.test.ts (both written at A3).
 *
 * Status at file creation: ready-to-run when Jest is configured. Jest is not
 * currently in package.json devDependencies (F-series stewardship debt logged
 * at A3 close §"Stewardship findings"). Interim verification at A4 is via the
 * three production scenarios in Step 10 + the type-check at Step 7.
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

beforeEach(() => {
  // Restore baseline env before each test.
  process.env = { ...originalEnv }
  unsetAllPreviousKeyEnv()
  delete process.env.SUBSTRATE_LAYER2_PUBLIC_KEY
  delete process.env.SUBSTRATE_LAYER2_KEY_ID
  delete process.env.SUBSTRATE_LAYER2_KEY_ISSUED_AT
})

afterAll(() => {
  // Restore original env after the suite.
  process.env = originalEnv
})

describe('/api/public-key — A4 Decision 2 contract', () => {
  // ==========================================================================
  // Scenario 1: no rotation in progress (steady state)
  // ==========================================================================

  test('Scenario 1 — no rotation: previous and rotation_overlap_until are both null', async () => {
    setCurrentKeyEnv()
    // No previous-key env vars set.

    const response = await GET()
    expect(response.status).toBe(200)
    const body = await response.json()

    expect(body.key_id).toBe(TEST_CURRENT_KEY_ID)
    expect(body.algorithm).toBe('Ed25519')
    expect(body.public_key_pem).toBe(TEST_CURRENT_PUBLIC_KEY_PEM)
    expect(body.issued_at).toBe(TEST_CURRENT_ISSUED_AT)
    expect(body.previous).toBeNull()
    expect(body.rotation_overlap_until).toBeNull()
  })

  // ==========================================================================
  // Scenario 2: rotation in progress (overlap window active)
  // ==========================================================================

  test('Scenario 2 — rotation in progress: previous block populated; rotation_overlap_until matches retires_at', async () => {
    setCurrentKeyEnv()
    setAllPreviousKeyEnv()

    const response = await GET()
    expect(response.status).toBe(200)
    const body = await response.json()

    // Current-key fields preserved.
    expect(body.key_id).toBe(TEST_CURRENT_KEY_ID)
    expect(body.public_key_pem).toBe(TEST_CURRENT_PUBLIC_KEY_PEM)
    expect(body.issued_at).toBe(TEST_CURRENT_ISSUED_AT)

    // Previous-key block populated with all four fields.
    expect(body.previous).not.toBeNull()
    expect(body.previous.key_id).toBe(TEST_PREVIOUS_KEY_ID)
    expect(body.previous.public_key_pem).toBe(TEST_PREVIOUS_PUBLIC_KEY_PEM)
    expect(body.previous.issued_at).toBe(TEST_PREVIOUS_ISSUED_AT)
    expect(body.previous.retires_at).toBe(TEST_PREVIOUS_RETIRES_AT)

    // rotation_overlap_until mirrors previous.retires_at exactly.
    expect(body.rotation_overlap_until).toBe(TEST_PREVIOUS_RETIRES_AT)
  })

  // ==========================================================================
  // Scenario 3: partial state (fail-safe per A4 ADR Decision 2)
  // Four sub-cases, one per env var unset.
  // ==========================================================================

  test('Scenario 3a — partial state: SUBSTRATE_LAYER2_PREVIOUS_PUBLIC_KEY unset → previous=null', async () => {
    setCurrentKeyEnv()
    setAllPreviousKeyEnv()
    delete process.env.SUBSTRATE_LAYER2_PREVIOUS_PUBLIC_KEY

    const response = await GET()
    expect(response.status).toBe(200)
    const body = await response.json()

    expect(body.previous).toBeNull()
    expect(body.rotation_overlap_until).toBeNull()
  })

  test('Scenario 3b — partial state: SUBSTRATE_LAYER2_PREVIOUS_KEY_ID unset → previous=null', async () => {
    setCurrentKeyEnv()
    setAllPreviousKeyEnv()
    delete process.env.SUBSTRATE_LAYER2_PREVIOUS_KEY_ID

    const response = await GET()
    expect(response.status).toBe(200)
    const body = await response.json()

    expect(body.previous).toBeNull()
    expect(body.rotation_overlap_until).toBeNull()
  })

  test('Scenario 3c — partial state: SUBSTRATE_LAYER2_PREVIOUS_KEY_ISSUED_AT unset → previous=null', async () => {
    setCurrentKeyEnv()
    setAllPreviousKeyEnv()
    delete process.env.SUBSTRATE_LAYER2_PREVIOUS_KEY_ISSUED_AT

    const response = await GET()
    expect(response.status).toBe(200)
    const body = await response.json()

    expect(body.previous).toBeNull()
    expect(body.rotation_overlap_until).toBeNull()
  })

  test('Scenario 3d — partial state: SUBSTRATE_LAYER2_PREVIOUS_KEY_RETIRES_AT unset → previous=null', async () => {
    setCurrentKeyEnv()
    setAllPreviousKeyEnv()
    delete process.env.SUBSTRATE_LAYER2_PREVIOUS_KEY_RETIRES_AT

    const response = await GET()
    expect(response.status).toBe(200)
    const body = await response.json()

    expect(body.previous).toBeNull()
    expect(body.rotation_overlap_until).toBeNull()
  })

  test('Scenario 3e — empty-string env vars treated as unset (fail-safe)', async () => {
    setCurrentKeyEnv()
    setAllPreviousKeyEnv()
    process.env.SUBSTRATE_LAYER2_PREVIOUS_PUBLIC_KEY = ''

    const response = await GET()
    expect(response.status).toBe(200)
    const body = await response.json()

    expect(body.previous).toBeNull()
    expect(body.rotation_overlap_until).toBeNull()
  })

  // ==========================================================================
  // Scenario 4: 503 fail-closed when current public key env var is unset
  // (preserves A3 behaviour; A4 must not regress it)
  // ==========================================================================

  test('Scenario 4 — current public key env var unset: 503 substrate_public_key_unavailable', async () => {
    // No current-key env vars set; previous-key state irrelevant for this test.

    const response = await GET()
    expect(response.status).toBe(503)
    const body = await response.json()

    expect(body.error).toBe('substrate_public_key_unavailable')
  })

  // ==========================================================================
  // Scenario 5: env vars read at call time (not at module load)
  // Tests that changing env between calls is reflected in subsequent responses.
  // ==========================================================================

  test('Scenario 5 — env vars read at call time: setting previous-key env between calls flips response shape', async () => {
    setCurrentKeyEnv()

    // First call — no rotation.
    const response1 = await GET()
    const body1 = await response1.json()
    expect(body1.previous).toBeNull()

    // Set previous-key env between calls.
    setAllPreviousKeyEnv()

    // Second call — rotation in progress.
    const response2 = await GET()
    const body2 = await response2.json()
    expect(body2.previous).not.toBeNull()
    expect(body2.previous.key_id).toBe(TEST_PREVIOUS_KEY_ID)

    // Unset previous-key env again.
    unsetAllPreviousKeyEnv()

    // Third call — back to no rotation.
    const response3 = await GET()
    const body3 = await response3.json()
    expect(body3.previous).toBeNull()
  })

  // ==========================================================================
  // Response-shape invariants preserved at A4
  // ==========================================================================

  test('A3 contract: response always carries all six top-level fields', async () => {
    setCurrentKeyEnv()
    setAllPreviousKeyEnv()

    const response = await GET()
    const body = await response.json()

    // All six fields present.
    expect(body).toHaveProperty('key_id')
    expect(body).toHaveProperty('algorithm')
    expect(body).toHaveProperty('public_key_pem')
    expect(body).toHaveProperty('issued_at')
    expect(body).toHaveProperty('rotation_overlap_until')
    expect(body).toHaveProperty('previous')

    // Algorithm is canonical.
    expect(body.algorithm).toBe('Ed25519')
  })

  test('A3 contract: Cache-Control header preserved on 200 responses', async () => {
    setCurrentKeyEnv()

    const response = await GET()
    const cacheControl = response.headers.get('Cache-Control')
    expect(cacheControl).toBe('public, max-age=3600, s-maxage=3600')
  })
})
