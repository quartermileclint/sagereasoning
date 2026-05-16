/**
 * route.test.ts — tests for the public accreditation verification endpoint.
 *
 * STATUS: Verified (2026-05-16, this session).
 *
 * WHAT THIS TEST FILE COVERS (PR2 — invocation testing for safety-critical
 * functions extended to invocation testing for newly-wired routes):
 *
 *   - buildAccreditationResponse for all four AccreditationEndpointResponse
 *     status variants (ok / not_found / expired / error) — status code,
 *     headers, body shape, documentation_url injection.
 *   - buildCardResponse for both expired=true and expired=false.
 *   - buildServerErrorResponse — status 503, no-store cache header, body
 *     shape.
 *   - OPTIONS — CORS preflight returns 204 with the expected headers.
 *   - POST (and PUT/DELETE/PATCH by extension — they delegate to the same
 *     helper) — returns 405 with an Allow header.
 *
 * WHAT THIS TEST FILE DOES NOT COVER (Verified by founder's post-deploy URL
 * check per the Critical Change Protocol step 5):
 *
 *   - The end-to-end Supabase round-trip (GET → lookupAccreditationRecord →
 *     handleAccreditationLookup → buildAccreditationResponse). The
 *     lookupAccreditationRecord seam is a real Supabase call; mocking it in a
 *     tsx-run unit test is more friction than the value adds, given the
 *     post-deploy URL check exercises the full path. The discriminated-union
 *     mapping IS tested here — that is the route's own logic.
 *
 * Run with: npx tsx <this file>  (no env vars needed — no Supabase touched)
 */

import {
  buildAccreditationResponse,
  buildCardResponse,
  buildServerErrorResponse,
  OPTIONS,
  POST,
} from '../route'

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
// POST — method not allowed (PUT/DELETE/PATCH delegate to the same helper)
// ============================================================================

async function testPostNotAllowed(): Promise<void> {
  const response = await POST()
  assertEqual(response.status, 405, 'POST-1 POST → HTTP 405')
  assertEqual(
    response.headers.get('Allow'),
    'GET, OPTIONS',
    'POST-2 POST 405 carries Allow: GET, OPTIONS'
  )
  const body = await response.json()
  assertEqual(body.status, 'error', 'POST-3 POST 405 body.status === error')
  assert(
    typeof body.message === 'string' &&
      body.message.includes('Method not allowed'),
    'POST-4 POST 405 body.message names the disallowance'
  )
  assertEqual(
    body.documentation_url,
    EXPECTED_DOC_URL,
    'POST-5 POST 405 body.documentation_url present'
  )
}

// ============================================================================
// RUNNER
// ============================================================================

async function run(): Promise<void> {
  await testOkVariant()
  await testNotFoundVariant()
  await testExpiredVariant()
  await testErrorVariant()
  await testCardFresh()
  await testCardExpired()
  await testServerError()
  await testOptions()
  await testPostNotAllowed()

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
