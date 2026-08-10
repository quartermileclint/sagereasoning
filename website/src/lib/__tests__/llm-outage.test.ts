/**
 * llm-outage.test.ts — #10 honest-degradation classifier + #5/#8 observability
 * writer helpers (P-GL). Plain-assertion script per CLAUDE.md conventions.
 *
 * Run via: `npx tsx website/src/lib/__tests__/llm-outage.test.ts`
 * (No --env-file needed — observability-store constructs its Supabase client
 * lazily, and nothing here reaches it; NextResponse works under bare tsx.)
 *
 * COVERAGE:
 *   OUT — isLlmOutage classifies upstream outages true and bugs/4xx false,
 *         with the precision guard that a bare `status:500` does NOT trip.
 *   RES — llmOutageResponse returns a retriable 503, merges extra headers.
 *   OBS — observability-store pure helpers: isMissingTableError matches the
 *         table-not-found forms but NOT a missing-COLUMN error; truncate; hashIp.
 */

import { isLlmOutage, llmOutageResponse } from '../llm-outage'
import { __test } from '../observability-store'

let passCount = 0
let failCount = 0
function assert(name: string, condition: boolean) {
  if (condition) {
    passCount++
    console.log(`  ✓ ${name}`)
  } else {
    failCount++
    console.error(`  ✗ ${name}`)
  }
}

// Simulate the @anthropic-ai/sdk error shapes (numeric .status + a class name).
class APIConnectionError extends Error {}
class APIConnectionTimeoutError extends Error {}
class InternalServerError extends Error { status = 500 }
class RateLimitError extends Error { status = 429 }
class BadRequestError extends Error { status = 400 }

console.log('OUT — isLlmOutage')
assert('OUT-1 connection error (constructor name)', isLlmOutage(new APIConnectionError('boom')))
assert('OUT-2 connection timeout (constructor name)', isLlmOutage(new APIConnectionTimeoutError('slow')))
assert('OUT-3 InternalServerError (name + status 500)', isLlmOutage(new InternalServerError('overloaded')))
assert('OUT-4 RateLimitError (name + status 429)', isLlmOutage(new RateLimitError('slow down')))
assert('OUT-5 status 503', isLlmOutage({ status: 503 }))
assert('OUT-6 status 502', isLlmOutage({ status: 502 }))
assert('OUT-7 status 504', isLlmOutage({ status: 504 }))
assert('OUT-8 status 529 (overloaded)', isLlmOutage({ status: 529 }))
assert('OUT-9 status 408 (timeout)', isLlmOutage({ status: 408 }))
assert('OUT-10 message "fetch failed"', isLlmOutage(new Error('fetch failed')))
assert('OUT-11 message "connection error"', isLlmOutage(new Error('Connection error.')))
assert('OUT-12 message "ETIMEDOUT"', isLlmOutage(new Error('read ETIMEDOUT')))

// Negatives — genuine bugs / client errors must NOT read as an outage.
assert('OUT-13 plain Error is not an outage', !isLlmOutage(new Error('cannot read properties of undefined')))
assert('OUT-14 BadRequestError (400) is not an outage', !isLlmOutage(new BadRequestError('bad input')))
assert('OUT-15 null is not an outage', !isLlmOutage(null))
assert('OUT-16 undefined is not an outage', !isLlmOutage(undefined))
assert('OUT-17 string is not an outage', !isLlmOutage('boom'))
// PRECISION: a coincidental { status: 500 } with NO SDK name must NOT trip —
// only InternalServerError (which carries the name) does.
assert('OUT-18 bare { status: 500 } does NOT trip (precision)', !isLlmOutage({ status: 500 }))
assert('OUT-19 bare { status: 429 } does NOT trip (precision)', !isLlmOutage({ status: 429 }))
// constructor.name path with no status still trips.
class OverloadedError extends Error {}
assert('OUT-20 OverloadedError by name, no status', isLlmOutage(new OverloadedError('overloaded')))

console.log('RES — llmOutageResponse')
const res = llmOutageResponse()
assert('RES-1 status is 503', res.status === 503)
assert('RES-2 Retry-After header present', res.headers.get('Retry-After') === '30')
const resWithHeaders = llmOutageResponse({ 'X-Loop-Id': 'abc' })
assert('RES-3 extra headers merged', resWithHeaders.headers.get('X-Loop-Id') === 'abc')
assert('RES-4 extra-header response still 503', resWithHeaders.status === 503)

console.log('OBS — observability-store helpers')
const { isMissingTableError, truncate, hashIp } = __test
assert('OBS-1 "relation ... does not exist" is missing-table', isMissingTableError({ message: 'relation "public.route_errors" does not exist' }))
assert('OBS-2 PostgREST "could not find the table" is missing-table', isMissingTableError({ message: "Could not find the table 'public.throttle_events' in the schema cache" }))
// The documented trap, hardened 2026-08-10: a REAL Postgres 42703 message is
// shaped "column ... of relation ... does not exist" — it contains BOTH
// "relation" and "does not exist", which a message-only classifier would
// wrongly match as table-not-found. This fixture uses that realistic shape
// (not the bare "column ... does not exist" the pre-hardening test used,
// which happened to dodge the bug by not containing "relation" at all — a
// weaker fixture that let the original defect ship undetected).
assert(
  'OBS-3 missing COLUMN (realistic Postgres 42703 shape) is NOT missing-table',
  !isMissingTableError({ code: '42703', message: 'column "retain_until" of relation "route_errors" does not exist' }),
)
assert(
  'OBS-3b missing COLUMN by message alone (no code) is NOT missing-table',
  !isMissingTableError({ message: 'column "retain_until" of relation "route_errors" does not exist' }),
)
assert(
  'OBS-3c PostgREST PGRST204 column-not-found is NOT missing-table',
  !isMissingTableError({ code: 'PGRST204', message: "Could not find the 'retain_until' column of 'route_errors' in the schema cache" }),
)
assert('OBS-4 permission error is NOT missing-table', !isMissingTableError({ message: 'permission denied for table route_errors' }))
assert('OBS-4b null error is NOT missing-table (no throw)', !isMissingTableError(null))
assert('OBS-5 truncate long string', truncate('abcdefghij', 4) === 'abcd')
assert('OBS-6 truncate keeps short string', truncate('ab', 4) === 'ab')
assert('OBS-7 truncate null → null', truncate(null, 4) === null)
assert('OBS-8 hashIp is 16 hex chars', /^[0-9a-f]{16}$/.test(hashIp('203.0.113.9')))
assert('OBS-9 hashIp is deterministic', hashIp('203.0.113.9') === hashIp('203.0.113.9'))
assert('OBS-10 hashIp differs per IP', hashIp('203.0.113.9') !== hashIp('203.0.113.10'))

// Async body-shape check + summary (tsx cjs transform forbids top-level await).
;(async () => {
  const body = (await res.json()) as { error?: string }
  assert('RES-5 body error code', body.error === 'ai_temporarily_unavailable')
  console.log(`\n${passCount} passed, ${failCount} failed`)
  if (failCount > 0) process.exit(1)
})()
