/**
 * route.test.ts — tests for the accreditation verification + write endpoint.
 *
 * STATUS: Verified (2026-05-16; extended for the write-path build under
 * D-ATL-WRITE-PATH-BUILD-WIRED-VERIFIED-2026-05-16 — POST tests added; the
 * old "POST returns 405" test removed since POST is now a real handler).
 *
 * WHAT THIS TEST FILE COVERS (PR2 — invocation testing for safety-critical
 * functions extended to invocation testing for newly-wired routes):
 *
 *   GET-path response builders (existing):
 *   - buildAccreditationResponse for all four AccreditationEndpointResponse
 *     status variants (ok / not_found / expired / error) — status code,
 *     headers, body shape, documentation_url injection.
 *   - buildCardResponse for both expired=true and expired=false.
 *   - buildServerErrorResponse — status 503, no-store cache header, body
 *     shape.
 *
 *   POST-path response builders (added 2026-05-16):
 *   - buildWriteSuccessResponse → 200 + no-store cache + documentation_url.
 *   - buildWriteDisabledResponse → 503 + non-leaking message naming the
 *     inert state (pre-A10 feature-flag-gated stopgap).
 *   - buildWriteUnauthorizedResponse → 401 + "Unauthorized." (non-leaking).
 *   - buildWriteBadRequestResponse(message) → 400 + the supplied message.
 *   - buildWriteNotFoundResponse → 404 + message naming the seed/update
 *     disambiguation.
 *   - buildWriteConflictResponse → 409 + message naming the seed/update
 *     disambiguation.
 *
 *   Method handlers:
 *   - OPTIONS — CORS preflight returns 204 with the expected headers.
 *   - PUT / DELETE / PATCH — return 405 with Allow: 'GET, POST, OPTIONS'.
 *     (POST is REMOVED from the 405 set as of 2026-05-16 — POST is a real
 *     handler tested via the post-deploy URL check + the writer library's
 *     own unit tests in atl-accreditation-writer.test.ts.)
 *
 * WHAT THIS TEST FILE DOES NOT COVER (Verified by founder's post-deploy URL
 * check per the Critical Change Protocol step 5):
 *
 *   - The end-to-end Supabase round-trip on GET (GET →
 *     lookupAccreditationRecord → handleAccreditationLookup →
 *     buildAccreditationResponse). The discriminated-union mapping IS tested
 *     here — that is the route's own logic. Same posture as the original 6b
 *     build.
 *
 *   - The end-to-end POST request flow (POST → rate limit → auth gate →
 *     body validate → lookupAccreditationRecord → seedAccreditation /
 *     updateAccreditation → response). The handler is wired but its
 *     pre-flight lookup hits Supabase; mocking that in a plain-tsx test is
 *     more friction than value. The atl-accreditation-writer.test.ts file
 *     tests the writer library's persistence-layer invocation contract
 *     exhaustively; the route's responsibility is body validation +
 *     auth-gate-check + outcome → HTTP mapping, all of which are tested
 *     here via the response builders. The post-deploy URL check exercises
 *     the full request flow against the live route.
 *
 * Run with:
 *   npx tsx --env-file=.env.local \
 *     website/src/app/api/accreditation/[agent_id]/__tests__/route.test.ts
 *
 * The --env-file is required as of 2026-05-16 (write-path build). Prior to
 * this session the route test could run with a bare `npx tsx` — only the
 * response builders + the 405 method handlers were imported, none of which
 * touched Supabase. The write-path build added POST handler imports to
 * route.ts (seedAccreditation + updateAccreditation + lookupAccreditation-
 * Record), which transitively load supabase-server.ts. supabase-server.ts
 * constructs a Supabase client at module load (see CLAUDE.md's
 * "Running the substrate test suite" section), so any test importing the
 * route chain now needs --env-file=.env.local. The client is constructed
 * but never CALLED by this test — the assertions exercise only the pure
 * response builders + the still-405 method handlers, none of which invoke
 * the Supabase client. The end-to-end POST request flow (which does hit
 * Supabase) is verified by the founder's post-deploy URL check.
 */

import {
  buildAccreditationResponse,
  buildCardResponse,
  buildServerErrorResponse,
  buildWriteSuccessResponse,
  buildWriteDisabledResponse,
  buildWriteUnauthorizedResponse,
  buildWriteBadRequestResponse,
  buildWriteNotFoundResponse,
  buildWriteConflictResponse,
} from '../response-builders'

import { OPTIONS, PUT, DELETE, PATCH } from '../route'

import type { AccreditationEndpointResponse } from '@/lib/substrate/trust-layer/accreditation/public-endpoint'
import type {
  AccreditationRecord,
  AccreditationPayload,
} from '@/lib/substrate/trust-layer/types/accreditation'

// ============================================================================
// TEST HARNESS — minimal assertion helpers
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
      `FAIL: ${label}\n  expected: ${JSON.stringify(expected)}\n  actual:   ${JSON.stringify(actual)}`
    )
  }
  assert(ok, label)
}

// ============================================================================
// FIXTURES
// ============================================================================

const SAMPLE_PAYLOAD: AccreditationPayload = {
  agent_id: 'agent_test_v1',
  senecan_grade: 'grade_3',
  typical_proximity: 'deliberate',
  authority_level: 'guided',
  dimension_levels: {
    passion_reduction: 'developing',
    judgement_quality: 'established',
    disposition_stability: 'developing',
    oikeiosis_extension: 'emerging',
  },
  direction_of_travel: 'improving',
  evaluation_window: '100 actions',
  actions_evaluated: 47,
  grade_since: '2026-05-01T00:00:00.000Z',
  last_evaluation: '2026-05-16T00:00:00.000Z',
  passions_persisting: [],
  verification_url: 'https://sagereasoning.com/accreditation/agent_test_v1',
  disclaimer:
    'This accreditation evaluates reasoning quality against the Stoic ' +
    'philosophical framework. It does not promise outcomes or certify ' +
    'safety, ethics, or trustworthiness in any absolute sense.',
  // Added 2026-05-16 under D-ATL-ITEMS-1-3-BUILD-WIRED-VERIFIED-2026-05-16 §"Decision A".
  typical_deliberation_breadth: 'intuited',
  // Added 2026-05-16 under D-ATL-KATHEKON-ALIGNED-ALTERNATIVE-BUILD-WIRED-VERIFIED-2026-05-16 §"Decision C".
  typical_kathekon_quality: 'contrary',
}

const SAMPLE_RECORD: AccreditationRecord = {
  agent_id: 'agent_test_v1',
  senecan_grade: 'grade_3',
  typical_proximity: 'deliberate',
  authority_level: 'guided',
  dimension_levels: {
    passion_reduction: 'developing',
    judgement_quality: 'established',
    disposition_stability: 'developing',
    oikeiosis_extension: 'emerging',
  },
  direction_of_travel: 'improving',
  evaluation_window_size: 100,
  actions_evaluated: 47,
  grade_since: '2026-05-01T00:00:00.000Z',
  last_evaluation: '2026-05-16T00:00:00.000Z',
  passions_persisting: [],
  verification_url: 'https://sagereasoning.com/accreditation/agent_test_v1',
  expires_at: '2026-12-31T23:59:59.000Z',
  disclaimer: SAMPLE_PAYLOAD.disclaimer,
  created_at: '2026-05-01T00:00:00.000Z',
  updated_at: '2026-05-16T00:00:00.000Z',
  // Added 2026-05-16 under D-ATL-ITEMS-1-3-BUILD-WIRED-VERIFIED-2026-05-16 §"Decision A".
  typical_deliberation_breadth: 'intuited',
  // Added 2026-05-16 under D-ATL-KATHEKON-ALIGNED-ALTERNATIVE-BUILD-WIRED-VERIFIED-2026-05-16 §"Decision C".
  typical_kathekon_quality: 'contrary',
}

const EXPECTED_DOC_URL = 'https://sagereasoning.com/limitations'

// ============================================================================
// buildAccreditationResponse — the four discriminated variants
// ============================================================================

async function testOkVariant(): Promise<void> {
  const input: AccreditationEndpointResponse = {
    status: 'ok',
    data: SAMPLE_PAYLOAD,
  }
  const response = buildAccreditationResponse(input)
  assertEqual(response.status, 200, 'OK-1 ok variant → HTTP 200')
  assertEqual(
    response.headers.get('Access-Control-Allow-Origin'),
    '*',
    'OK-2 ok variant carries Access-Control-Allow-Origin: *'
  )
  assertEqual(
    response.headers.get('Cache-Control'),
    'public, max-age=300',
    'OK-3 ok variant carries Cache-Control: public, max-age=300'
  )
  assertEqual(
    response.headers.get('X-Accreditation-Disclaimer'),
    'Evaluates reasoning quality. Does not promise outcomes.',
    'OK-4 ok variant carries X-Accreditation-Disclaimer header'
  )
  const body = await response.json()
  assertEqual(body.status, 'ok', 'OK-5 ok variant body.status === ok')
  assertEqual(
    body.documentation_url,
    EXPECTED_DOC_URL,
    'OK-6 ok variant body.documentation_url === /limitations'
  )
  assert(
    body.data !== undefined && body.data.agent_id === 'agent_test_v1',
    'OK-7 ok variant body.data is the payload'
  )
  assertEqual(
    body.data.senecan_grade,
    'grade_3',
    'OK-8 ok variant body.data.senecan_grade preserved'
  )
}

async function testNotFoundVariant(): Promise<void> {
  const input: AccreditationEndpointResponse = {
    status: 'not_found',
    message: 'No accreditation record found for agent: agent_unknown',
  }
  const response = buildAccreditationResponse(input)
  assertEqual(response.status, 404, 'NF-1 not_found variant → HTTP 404')
  assertEqual(
    response.headers.get('Access-Control-Allow-Origin'),
    '*',
    'NF-2 not_found variant carries CORS header'
  )
  const body = await response.json()
  assertEqual(body.status, 'not_found', 'NF-3 not_found variant body.status === not_found')
  assert(
    typeof body.message === 'string' && body.message.length > 0,
    'NF-4 not_found variant body.message is non-empty'
  )
  assertEqual(
    body.documentation_url,
    EXPECTED_DOC_URL,
    'NF-5 not_found variant body.documentation_url present'
  )
}

async function testExpiredVariant(): Promise<void> {
  const input: AccreditationEndpointResponse = {
    status: 'expired',
    message: 'This accreditation has expired and requires re-evaluation.',
    data: SAMPLE_PAYLOAD,
  }
  const response = buildAccreditationResponse(input)
  assertEqual(
    response.status,
    200,
    'EX-1 expired variant → HTTP 200 (carries data — verifier inspects body.status)'
  )
  const body = await response.json()
  assertEqual(body.status, 'expired', 'EX-2 expired variant body.status === expired')
  assert(
    body.data !== undefined && body.data.agent_id === 'agent_test_v1',
    'EX-3 expired variant body.data is the (stale) payload'
  )
  assert(
    typeof body.message === 'string' && body.message.includes('expired'),
    'EX-4 expired variant body.message names expiry'
  )
  assertEqual(
    body.documentation_url,
    EXPECTED_DOC_URL,
    'EX-5 expired variant body.documentation_url present'
  )
}

async function testErrorVariant(): Promise<void> {
  const input: AccreditationEndpointResponse = {
    status: 'error',
    message: 'Invalid agent_id format. Expected: agent_{org}_{version}',
  }
  const response = buildAccreditationResponse(input)
  assertEqual(response.status, 400, 'ER-1 error variant → HTTP 400 (invalid agent_id)')
  const body = await response.json()
  assertEqual(body.status, 'error', 'ER-2 error variant body.status === error')
  assert(
    typeof body.message === 'string' && body.message.includes('Invalid'),
    'ER-3 error variant body.message describes the error'
  )
  assertEqual(
    body.documentation_url,
    EXPECTED_DOC_URL,
    'ER-4 error variant body.documentation_url present'
  )
}

// ============================================================================
// buildCardResponse — fresh + expired card
// ============================================================================

async function testCardFresh(): Promise<void> {
  const response = buildCardResponse(SAMPLE_RECORD, false)
  assertEqual(response.status, 200, 'CARD-1 fresh card → HTTP 200')
  const body = await response.json()
  assertEqual(body.status, 'ok', 'CARD-2 fresh card body.status === ok')
  assert(
    body.data !== undefined && body.data.agent_id === 'agent_test_v1',
    'CARD-3 fresh card body.data is the serialized card'
  )
  assert(
    typeof body.data.senecan_grade === 'string' &&
      body.data.senecan_grade.includes('Grade 3'),
    'CARD-4 fresh card body.data.senecan_grade is the human-readable label'
  )
  assertEqual(
    body.documentation_url,
    EXPECTED_DOC_URL,
    'CARD-5 fresh card body.documentation_url present'
  )
}

async function testCardExpired(): Promise<void> {
  const response = buildCardResponse(SAMPLE_RECORD, true)
  assertEqual(
    response.status,
    200,
    'CARDEX-1 expired card → HTTP 200 (carries data)'
  )
  const body = await response.json()
  assertEqual(
    body.status,
    'expired',
    'CARDEX-2 expired card body.status === expired'
  )
  assert(
    typeof body.message === 'string' && body.message.includes('expired'),
    'CARDEX-3 expired card body.message names expiry'
  )
  assert(
    body.data !== undefined && body.data.agent_id === 'agent_test_v1',
    'CARDEX-4 expired card body.data is the (stale) serialized card'
  )
  assertEqual(
    body.documentation_url,
    EXPECTED_DOC_URL,
    'CARDEX-5 expired card body.documentation_url present'
  )
}

// ============================================================================
// buildServerErrorResponse — Supabase throw → 503 + no-store
// ============================================================================

async function testServerError(): Promise<void> {
  const response = buildServerErrorResponse()
  assertEqual(response.status, 503, 'SE-1 server error → HTTP 503')
  assertEqual(
    response.headers.get('Cache-Control'),
    'no-store',
    'SE-2 server error carries Cache-Control: no-store (operators can fix + retry)'
  )
  const body = await response.json()
  assertEqual(body.status, 'error', 'SE-3 server error body.status === error')
  assert(
    typeof body.message === 'string' &&
      body.message.includes('temporarily unavailable'),
    'SE-4 server error body.message is the vague-but-actionable message'
  )
  assertEqual(
    body.documentation_url,
    EXPECTED_DOC_URL,
    'SE-5 server error body.documentation_url present'
  )
  // CORS still applies even on failure — a verifier hit by a 503 should see
  // the same CORS posture so the browser/agent surfaces the failure cleanly.
  assertEqual(
    response.headers.get('Access-Control-Allow-Origin'),
    '*',
    'SE-6 server error preserves CORS header'
  )
}

// ============================================================================
// OPTIONS — CORS preflight
// ============================================================================

async function testOptions(): Promise<void> {
  const response = await OPTIONS()
  assertEqual(response.status, 204, 'OPT-1 OPTIONS → HTTP 204')
  assertEqual(
    response.headers.get('Access-Control-Allow-Origin'),
    '*',
    'OPT-2 OPTIONS carries CORS Allow-Origin: *'
  )
  assertEqual(
    response.headers.get('Access-Control-Allow-Methods'),
    'GET, OPTIONS',
    'OPT-3 OPTIONS carries Allow-Methods: GET, OPTIONS'
  )
}

// ============================================================================
// WRITE-PATH RESPONSE BUILDERS — added 2026-05-16 (D-ATL-WRITE-PATH-BUILD-
// WIRED-VERIFIED-2026-05-16). Each builder is the testable seam for the POST
// handler's outcome → HTTP mapping. POST itself is exercised end-to-end by
// the founder's post-deploy URL check.
// ============================================================================

async function testWriteSuccess(): Promise<void> {
  const response = buildWriteSuccessResponse()
  assertEqual(response.status, 200, 'WSUCC-1 write success → HTTP 200')
  assertEqual(
    response.headers.get('Cache-Control'),
    'no-store',
    'WSUCC-2 write success carries Cache-Control: no-store (writes must not be cached)',
  )
  const body = await response.json()
  assertEqual(body.status, 'ok', 'WSUCC-3 write success body.status === ok')
  assertEqual(
    body.documentation_url,
    EXPECTED_DOC_URL,
    'WSUCC-4 write success body.documentation_url present',
  )
}

async function testWriteDisabled(): Promise<void> {
  const response = buildWriteDisabledResponse()
  assertEqual(response.status, 503, 'WDIS-1 write disabled → HTTP 503')
  assertEqual(
    response.headers.get('Cache-Control'),
    'no-store',
    'WDIS-2 write disabled carries Cache-Control: no-store',
  )
  const body = await response.json()
  assertEqual(body.status, 'error', 'WDIS-3 write disabled body.status === error')
  // Message must NOT leak which env var controls the gate — it should only
  // name the inert state.
  assert(
    typeof body.message === 'string' && body.message.includes('not yet enabled'),
    'WDIS-4 write disabled message names the inert state',
  )
  assert(
    !body.message.includes('SUBSTRATE_WRITE_PATH_ENABLED'),
    'WDIS-5 write disabled message does NOT leak the env var name',
  )
  assertEqual(
    body.documentation_url,
    EXPECTED_DOC_URL,
    'WDIS-6 write disabled body.documentation_url present',
  )
}

async function testWriteUnauthorized(): Promise<void> {
  const response = buildWriteUnauthorizedResponse()
  assertEqual(response.status, 401, 'WAUTH-1 write unauthorized → HTTP 401')
  assertEqual(
    response.headers.get('Cache-Control'),
    'no-store',
    'WAUTH-2 write unauthorized carries Cache-Control: no-store',
  )
  const body = await response.json()
  assertEqual(body.status, 'error', 'WAUTH-3 write unauthorized body.status === error')
  // Non-leaking message — the design names this specifically as Decision C's
  // structural constraint. Should not say WHY auth failed.
  assertEqual(
    body.message,
    'Unauthorized.',
    'WAUTH-4 write unauthorized message is the non-leaking "Unauthorized."',
  )
  assertEqual(
    body.documentation_url,
    EXPECTED_DOC_URL,
    'WAUTH-5 write unauthorized body.documentation_url present',
  )
}

async function testWriteBadRequest(): Promise<void> {
  const customMessage = "Body field 'kind' must be 'seed' or 'update'."
  const response = buildWriteBadRequestResponse(customMessage)
  assertEqual(response.status, 400, 'WBAD-1 write bad-request → HTTP 400')
  assertEqual(
    response.headers.get('Cache-Control'),
    'no-store',
    'WBAD-2 write bad-request carries Cache-Control: no-store',
  )
  const body = await response.json()
  assertEqual(body.status, 'error', 'WBAD-3 write bad-request body.status === error')
  assertEqual(
    body.message,
    customMessage,
    'WBAD-4 write bad-request message is the supplied message verbatim',
  )
  assertEqual(
    body.documentation_url,
    EXPECTED_DOC_URL,
    'WBAD-5 write bad-request body.documentation_url present',
  )
}

async function testWriteNotFound(): Promise<void> {
  const response = buildWriteNotFoundResponse()
  assertEqual(response.status, 404, 'WNF-1 write not-found → HTTP 404')
  const body = await response.json()
  assertEqual(body.status, 'error', 'WNF-2 write not-found body.status === error')
  assert(
    typeof body.message === 'string' && body.message.includes("'seed'"),
    'WNF-3 write not-found message names the seed/update disambiguation',
  )
  assertEqual(
    body.documentation_url,
    EXPECTED_DOC_URL,
    'WNF-4 write not-found body.documentation_url present',
  )
}

async function testWriteConflict(): Promise<void> {
  const response = buildWriteConflictResponse()
  assertEqual(response.status, 409, 'WCONF-1 write conflict → HTTP 409')
  const body = await response.json()
  assertEqual(body.status, 'error', 'WCONF-2 write conflict body.status === error')
  assert(
    typeof body.message === 'string' && body.message.includes("'update'"),
    'WCONF-3 write conflict message names the seed/update disambiguation',
  )
  assertEqual(
    body.documentation_url,
    EXPECTED_DOC_URL,
    'WCONF-4 write conflict body.documentation_url present',
  )
}

// ============================================================================
// PUT / DELETE / PATCH — method not allowed (POST removed from this set
// 2026-05-16; POST is now a real handler — see the file header).
// ============================================================================

async function testPutNotAllowed(): Promise<void> {
  const response = await PUT()
  assertEqual(response.status, 405, 'PUT-1 PUT → HTTP 405')
  assertEqual(
    response.headers.get('Allow'),
    'GET, POST, OPTIONS',
    'PUT-2 PUT 405 carries Allow: GET, POST, OPTIONS (POST now allowed)',
  )
  const body = await response.json()
  assertEqual(body.status, 'error', 'PUT-3 PUT 405 body.status === error')
  assert(
    typeof body.message === 'string' &&
      body.message.includes('Method not allowed'),
    'PUT-4 PUT 405 body.message names the disallowance',
  )
}

async function testDeleteNotAllowed(): Promise<void> {
  const response = await DELETE()
  assertEqual(response.status, 405, 'DEL-1 DELETE → HTTP 405')
  assertEqual(
    response.headers.get('Allow'),
    'GET, POST, OPTIONS',
    'DEL-2 DELETE 405 carries Allow: GET, POST, OPTIONS',
  )
}

async function testPatchNotAllowed(): Promise<void> {
  const response = await PATCH()
  assertEqual(response.status, 405, 'PATCH-1 PATCH → HTTP 405')
  assertEqual(
    response.headers.get('Allow'),
    'GET, POST, OPTIONS',
    'PATCH-2 PATCH 405 carries Allow: GET, POST, OPTIONS',
  )
}

// ============================================================================
// RUNNER
// ============================================================================

async function run(): Promise<void> {
  // GET-path response builders (existing).
  await testOkVariant()
  await testNotFoundVariant()
  await testExpiredVariant()
  await testErrorVariant()
  await testCardFresh()
  await testCardExpired()
  await testServerError()
  await testOptions()

  // POST-path response builders (added 2026-05-16).
  await testWriteSuccess()
  await testWriteDisabled()
  await testWriteUnauthorized()
  await testWriteBadRequest()
  await testWriteNotFound()
  await testWriteConflict()

  // Method-not-allowed handlers (POST removed; PUT/DELETE/PATCH remain).
  await testPutNotAllowed()
  await testDeleteNotAllowed()
  await testPatchNotAllowed()

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
