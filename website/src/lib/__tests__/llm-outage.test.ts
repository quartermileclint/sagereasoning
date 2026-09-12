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
 *
 * O-1 (2026-09-12) — the provider ACCOUNT-BLOCK class. Fixtures below mirror
 * the @anthropic-ai/sdk 0.80 error shape read from its src/core/error.ts:
 * numeric `.status`, the parsed body on `.error`, `.name` left as 'Error',
 * the class carried by `.constructor.name`, and the thrown message composed as
 * `${status} ${JSON.stringify(body)}`. The account-block fixture is the LIVE
 * shape (94 production route_errors rows, 2026-09-12T06:07Z–08:27Z, read back
 * by a read-only query in the O-1 session), verbatim.
 *   ACC — classifyLlmError reads the live 400 usage-limit shape, the documented
 *         402 billing_error shape, and the credit-balance 400 as account_block;
 *         isLlmOutage stays FALSE on all of them (deliberate — no Retry-After:30).
 *   BND — the boundary: our own 'billing' errors and bare status objects stay
 *         `none` (provenance gate); a param-shaped 400 / a 401 are
 *         provider_rejection; a rate-limit 429 stays transient; the hypothetical
 *         429-carrying-usage-limit-wording is the one disclosed divergence.
 *   PAR — parity: for every fixture except that divergence,
 *         isLlmOutage(e) === (classifyLlmError(e).kind === 'transient_outage').
 *   STO — recordRouteError (fake client): error_type now carries the SDK class
 *         name; context.provider_error is written on every row; caller context
 *         is preserved and never clobbered; is_llm_outage is a passthrough.
 *
 * Mutation record (session 2026-09-12, both passes): every DISCRIMINATING O-1
 * pin was shown red under at least one named mutation of the fix — the table is
 * in `D-LLM-OUTAGE-CLASSIFIER-ACCOUNT-BLOCK-2026-09-12`. Six pins are property
 * or self-check pins that ride alongside a discriminating sibling and are NOT
 * independently mutation-killed, by design: ACC-0 (fixture self-check), ACC-2
 * and ACC-3 (properties of the account_block result that a provider_rejection
 * fallback would also satisfy — ACC-1 carries the discrimination), BND-11
 * (non-object inputs), STO-12 and STO-13 (direct unit checks of two pure
 * helpers). PR19 fold, 2026-09-12.
 */

import * as fs from 'fs'
import * as path from 'path'
import {
  isLlmOutage,
  llmOutageResponse,
  classifyLlmError,
  isProviderAccountBlock,
  LLM_ERROR_NOTES,
  providerAccountBlockResponse,
  providerAccountBlockPayload,
  retryAfterSecondsFor,
  PROVIDER_ACCOUNT_BLOCK_CODE,
  PROVIDER_ACCOUNT_BLOCK_MESSAGES,
  RETRY_AFTER_MAX_SECONDS,
} from '../llm-outage'
import { __test, recordRouteError } from '../observability-store'

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

// ═══════════════════════════════════════════════════════════════════════════
// O-1 fixtures — SDK-faithful error classes. A computed-key class expression
// takes its `.name` from the key, so `.constructor.name` reads e.g.
// 'BadRequestError' exactly as the real SDK class does (self-checked below).
// ═══════════════════════════════════════════════════════════════════════════
type SdkErrorCtor = new (status: number | undefined, body: unknown, message?: string) => Error & {
  status: number | undefined
  error: unknown
}
function makeSdkErrorClass(name: string): SdkErrorCtor {
  return {
    [name]: class extends Error {
      status: number | undefined
      error: unknown
      constructor(status: number | undefined, body: unknown, message?: string) {
        // Mirror of APIError.makeMessage: `${status} ${JSON.stringify(body)}`,
        // `${status} status code (no body)`, or the bare message.
        super(
          message ??
            (status && body ? `${status} ${JSON.stringify(body)}` : status ? `${status} status code (no body)` : 'Connection error.'),
        )
        this.status = status
        this.error = body
      }
    },
  }[name]
}
const SdkAPIError = makeSdkErrorClass('APIError')
const SdkBadRequestError = makeSdkErrorClass('BadRequestError')
const SdkAuthenticationError = makeSdkErrorClass('AuthenticationError')
const SdkRateLimitError = makeSdkErrorClass('RateLimitError')
const SdkInternalServerError = makeSdkErrorClass('InternalServerError')
const SdkAPIConnectionError = makeSdkErrorClass('APIConnectionError')

const apiBody = (type: string, message: string) => ({ type: 'error', error: { type, message }, request_id: 'req_test' })

// THE LIVE SHAPE (verbatim, 2026-09-12): HTTP 400 invalid_request_error.
const LIVE_USAGE_LIMIT_MESSAGE =
  'You have reached your specified API usage limits. You will regain access on 2026-10-01 at 00:00 UTC.'
const liveUsageLimit = () => new SdkBadRequestError(400, apiBody('invalid_request_error', LIVE_USAGE_LIMIT_MESSAGE))

console.log('ACC — classifyLlmError: the provider account block')
assert('ACC-0 fixture self-check: computed-key class carries the SDK class name', SdkBadRequestError.name === 'BadRequestError' && liveUsageLimit().constructor.name === 'BadRequestError' && liveUsageLimit().name === 'Error')
{
  const c = classifyLlmError(liveUsageLimit())
  assert('ACC-1 live 400 usage-limit shape → account_block', c.kind === 'account_block')
  assert('ACC-2 … retriable === false', c.retriable === false)
  assert('ACC-3 … status 400 + api_error_type invalid_request_error', c.status === 400 && c.api_error_type === 'invalid_request_error')
  assert('ACC-4 … regain_at parsed to 2026-10-01T00:00:00Z', c.regain_at === '2026-10-01T00:00:00Z')
  assert('ACC-5 isProviderAccountBlock(live) === true', isProviderAccountBlock(liveUsageLimit()))
  // DELIBERATE, not a gap: an account block must NOT reach llmOutageResponse
  // (503 + Retry-After: 30) — no retry clears a spend limit. The response
  // path is left exactly as it was; the log carries the class instead.
  assert('ACC-6 isLlmOutage(live) === false — the block never earns Retry-After:30', !isLlmOutage(liveUsageLimit()))
  assert('ACC-10 note is the constant account_block note and names the spend limit', c.note === LLM_ERROR_NOTES.account_block && /spend limit/.test(c.note ?? ''))
}
{
  const c = classifyLlmError(new SdkAPIError(402, apiBody('billing_error', 'Billing problem.')))
  assert('ACC-7 documented 402 billing_error (base APIError) → account_block', c.kind === 'account_block' && c.api_error_type === 'billing_error' && c.status === 402)
}
assert('ACC-8 body-less 402 under SDK provenance → account_block', classifyLlmError(new SdkAPIError(402, undefined)).kind === 'account_block')
{
  const c = classifyLlmError(new SdkBadRequestError(400, apiBody('invalid_request_error', 'Your credit balance is too low to access the Anthropic API. Please go to Plans & Billing to upgrade or purchase credits.')))
  assert('ACC-9 400 credit-balance wording → account_block, regain_at null', c.kind === 'account_block' && c.regain_at === null)
}

console.log('BND — the boundary between the classes')
// Our own code can throw account-block VOCABULARY (the cost-health evaluator
// talks about a monthly spend limit) — the provenance gate is what keeps such
// a throw out of the account_block class. Mutation-verified: dropping the
// gate turns this red.
assert('BND-1 our own Error("cost-health: monthly spend limit exceeded") → none (no provenance)', classifyLlmError(new Error('cost-health: monthly spend limit exceeded')).kind === 'none')
assert('BND-2 bare { status:400, message:"spend limit reached" } → none (no provenance — precision)', classifyLlmError({ status: 400, message: 'spend limit reached' }).kind === 'none')
{
  const c = classifyLlmError(new SdkBadRequestError(400, apiBody('invalid_request_error', 'max_tokens: must be a positive integer')))
  assert('BND-3 param-shaped SDK 400 → provider_rejection (not account_block), retriable false', c.kind === 'provider_rejection' && c.retriable === false && c.status === 400)
}
{
  const c = classifyLlmError(new SdkAuthenticationError(401, apiBody('authentication_error', 'invalid x-api-key')))
  assert('BND-4 SDK 401 → provider_rejection, status 401', c.kind === 'provider_rejection' && c.status === 401 && c.api_error_type === 'authentication_error')
}
{
  const e = new SdkRateLimitError(429, apiBody('rate_limit_error', "This request would exceed your organization's rate limit of 50 requests per minute."))
  const c = classifyLlmError(e)
  assert('BND-5 rate-limit 429 → transient_outage; isLlmOutage true (no regression)', c.kind === 'transient_outage' && c.retriable === true && isLlmOutage(e))
}
{
  // THE DISCLOSED DIVERGENCE (hypothetical shape, not observed live): a 429
  // whose body carries the usage-limit wording. The log records the block;
  // the untouched response path would still say retry-in-30 via the
  // RateLimitError name hint. Recorded as a residual, not fixed here.
  const e = new SdkRateLimitError(429, apiBody('rate_limit_error', LIVE_USAGE_LIMIT_MESSAGE))
  assert('BND-6 429 carrying usage-limit wording → kind account_block while isLlmOutage stays true (disclosed divergence)', classifyLlmError(e).kind === 'account_block' && isLlmOutage(e))
}
{
  const c = classifyLlmError(new SdkInternalServerError(529, apiBody('overloaded_error', 'Overloaded')))
  assert('BND-7 529 overloaded → transient_outage, regain_at null', c.kind === 'transient_outage' && c.regain_at === null && c.status === 529)
}
{
  const c = classifyLlmError(new SdkAPIConnectionError(undefined, undefined))
  assert('BND-8 APIConnectionError (no status, no body) → transient_outage, status null', c.kind === 'transient_outage' && c.status === null)
}
{
  const hostile = { get status(): number { throw new Error('boom') }, message: 'x' }
  let threw = false
  let kind = ''
  try { kind = classifyLlmError(hostile).kind } catch { threw = true }
  assert('BND-9 hostile getter → none, never throws', !threw && kind === 'none')
}
{
  const e = new SdkRateLimitError(429, apiBody('rate_limit_error', "This request would exceed your organization's usage limit for this model."))
  assert('BND-10 generic "usage limit" wording on a 429 stays transient (vocabulary is deliberately narrow)', classifyLlmError(e).kind === 'transient_outage')
}
assert('BND-11 null / undefined / string → none', classifyLlmError(null).kind === 'none' && classifyLlmError(undefined).kind === 'none' && classifyLlmError('boom').kind === 'none')
// PR19 fold (2026-09-12): the 402 disjunct was the one branch NOT behind the
// provenance gate — a bare `{ status: 402 }` from anywhere read as "check your
// Anthropic spend limit". Now gated like every other disjunct.
assert('BND-12 bare { status: 402 } → none (no provenance; the 402 branch is gated)', classifyLlmError({ status: 402 }).kind === 'none' && classifyLlmError({ status: 402, message: 'unrelated' }).kind === 'none')
assert('BND-12b a plain Error carrying status 402 (ctor "Error") → none', classifyLlmError(Object.assign(new Error('Payment Required'), { status: 402 })).kind === 'none')
// PR19 fold (2026-09-12): the repo's own cognitive-os PermissionDeniedError
// shares an SDK class name and sets `this.name`; the SDK never sets `.name`,
// so the generic-name test is what tells them apart — even when the in-repo
// class carries an incidental numeric status.
{
  class PermissionDeniedError extends Error {
    status = 402
    constructor() { super('Cognitive OS permission denied: x may not write y'); this.name = 'PermissionDeniedError' }
  }
  assert('BND-13 an in-repo class sharing an SDK name but setting .name (status 402) → none', classifyLlmError(new PermissionDeniedError()).kind === 'none')
}
{
  const SdkPermissionDeniedError = makeSdkErrorClass('PermissionDeniedError')
  const c = classifyLlmError(new SdkPermissionDeniedError(403, undefined))
  assert('BND-14 the SDK-shaped PermissionDeniedError (name "Error", status 403, no body) → provider_rejection', c.kind === 'provider_rejection' && c.status === 403)
}
{
  // Provenance form (b) is "an SDK STATUS-error instance": an SDK-named,
  // generic-`.name` error with NO numeric status is not one (the SDK's only
  // status-less classes are the connection/abort errors, which never carry
  // block vocabulary) — so its vocabulary is not trusted either.
  const e = new SdkBadRequestError(undefined, undefined, 'spend limit reached')
  assert('BND-15 SDK-named, generic-name error with NO status carrying block vocabulary → none (provenance needs a numeric status)', classifyLlmError(e).kind === 'none')
}

console.log('PAR — isLlmOutage ⇔ kind === transient_outage (every fixture but BND-6)')
{
  const fixtures: unknown[] = [
    new APIConnectionError('boom'), new APIConnectionTimeoutError('slow'), new InternalServerError('overloaded'),
    new RateLimitError('slow down'), { status: 503 }, { status: 502 }, { status: 504 }, { status: 529 }, { status: 408 },
    new Error('fetch failed'), new Error('Connection error.'), new Error('read ETIMEDOUT'),
    new Error('cannot read properties of undefined'), new BadRequestError('bad input'), null, undefined, 'boom',
    { status: 500 }, { status: 429 }, new OverloadedError('overloaded'),
    liveUsageLimit(), new SdkAPIError(402, apiBody('billing_error', 'Billing problem.')), new SdkAPIError(402, undefined),
    new Error('cost-health: monthly spend limit exceeded'), { status: 400, message: 'spend limit reached' },
    new SdkBadRequestError(400, apiBody('invalid_request_error', 'max_tokens: must be a positive integer')),
    new SdkAuthenticationError(401, apiBody('authentication_error', 'invalid x-api-key')),
    new SdkRateLimitError(429, apiBody('rate_limit_error', 'rate limit of 50 requests per minute')),
    new SdkInternalServerError(529, apiBody('overloaded_error', 'Overloaded')),
    new SdkAPIConnectionError(undefined, undefined),
    { status: 402 }, Object.assign(new Error('Payment Required'), { status: 402 }),
    new (makeSdkErrorClass('PermissionDeniedError'))(403, undefined),
  ]
  let agree = 0
  for (const f of fixtures) if (isLlmOutage(f) === (classifyLlmError(f).kind === 'transient_outage')) agree++
  // The floor equals the array's exact length by design — it guards silent
  // shrinkage of the fixture set, not headroom.
  assert(`PAR-1 parity holds on all ${fixtures.length} fixtures (agree=${agree})`, agree === fixtures.length && fixtures.length === 33)
}

console.log('SRC — no caller claims the store\'s context key')
{
  // The store spreads caller context LAST, so a caller-supplied `provider_error`
  // would win; pin that no caller supplies one, so the store's classification is
  // what the log actually carries. Scans every non-test .ts/.tsx under src/app
  // and src/lib except the two O-1 modules themselves.
  const root = path.join(__dirname, '..', '..')
  const hits: string[] = []
  const walk = (d: string) => {
    for (const ent of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, ent.name)
      if (ent.isDirectory()) { if (ent.name !== 'node_modules' && ent.name !== '__tests__') walk(p); continue }
      if (!/\.(ts|tsx)$/.test(ent.name)) continue
      if (p.endsWith('observability-store.ts') || p.endsWith('llm-outage.ts')) continue
      if (/provider_error/.test(fs.readFileSync(p, 'utf-8'))) hits.push(path.relative(root, p))
    }
  }
  walk(path.join(root, 'app'))
  walk(path.join(root, 'lib'))
  assert(`SRC-1 no caller under src/app or src/lib supplies context.provider_error (hits: ${hits.join(', ') || 'none'})`, hits.length === 0)
}


// ══════════════════════════════════════════════════════════════════════════
// O-2 (2026-09-12) — the account-block RESPONSE, and its wiring at every site.
//   RTY  — retryAfterSecondsFor: derived only from a real future instant.
//   PAY  — providerAccountBlockPayload: the one wire-shape definition.
//   MSG  — the human/agent register split (AC5) is real, not cosmetic.
//   WIRE — source pins: every call site branches on the block, BEFORE the
//          outage branch, with the audience its own callers actually have.
// ══════════════════════════════════════════════════════════════════════════

console.log('RTY — Retry-After is derived, capped, or absent')
{
  const now = Date.parse('2026-09-12T00:00:00Z')
  assert('RTY-1 no regain_at → no header value at all (silence, not a guess)', retryAfterSecondsFor(null, now) === null)
  assert('RTY-2 unparseable regain_at → null', retryAfterSecondsFor('not-a-date', now) === null)
  assert('RTY-3 a past instant → null (a stale block earns no header)', retryAfterSecondsFor('2026-09-11T00:00:00Z', now) === null)
  assert('RTY-4 an instant exactly now → null (never 0)', retryAfterSecondsFor('2026-09-12T00:00:00Z', now) === null)
  assert('RTY-5 two hours away → 7200 seconds, uncapped', retryAfterSecondsFor('2026-09-12T02:00:00Z', now) === 7200)
  // The LIVE block: 2026-09-12 → 2026-10-01 is ~19 days. Uncapped that is
  // 1,641,600s — a number no client honours. Capped; the body keeps the truth.
  assert(`RTY-6 the live 19-day block is capped at ${RETRY_AFTER_MAX_SECONDS}s`, retryAfterSecondsFor('2026-10-01T00:00:00Z', now) === RETRY_AFTER_MAX_SECONDS)
  assert('RTY-7 the cap is 24h', RETRY_AFTER_MAX_SECONDS === 86_400)
}

console.log('PAY — the single wire-shape definition')
{
  const p = providerAccountBlockPayload(liveUsageLimit(), 'agent')
  assert('PAY-1 status 503 (not 402: the caller is not the one with the billing problem)', p.status === 503)
  // Compared as a plain string: tsc narrows p.body.error to the literal type and
  // rejects the second comparison as provably-disjoint. That narrowing IS the
  // guarantee at compile time, but the pin must still hold at RUNTIME (the
  // constant could be edited), so the widening keeps a real check rather than
  // deleting one tsc thinks is redundant.
  assert('PAY-2 error code is distinct from the transient one', p.body.error === PROVIDER_ACCOUNT_BLOCK_CODE && String(p.body.error) !== 'ai_temporarily_unavailable')
  assert('PAY-3 retriable:false is on the wire, machine-readable', p.body.retriable === false)
  assert('PAY-4 regain_at carries the provider-stated instant UNCAPPED', p.body.regain_at === '2026-10-01T00:00:00Z')
  assert('PAY-5 a Retry-After IS present for the live block (capped, from the instant)', p.headers['Retry-After'] === String(RETRY_AFTER_MAX_SECONDS))
  // The credit-balance shape carries no "regain access on" instant.
  const noInstant = providerAccountBlockPayload(new SdkBadRequestError(400, apiBody('invalid_request_error', 'Your credit balance is too low to access the API.')), 'agent')
  assert('PAY-6 no instant → regain_at null AND no Retry-After header at all', noInstant.body.regain_at === null && !('Retry-After' in noInstant.headers))
  assert('PAY-7 a message is ALWAYS present — reflect/page.tsx renders body.message and would otherwise show the raw code', typeof p.body.message === 'string' && (p.body.message as string).length > 40)
}

console.log('MSG — the audience split is substantive')
{
  const human = PROVIDER_ACCOUNT_BLOCK_MESSAGES.human
  const agent = PROVIDER_ACCOUNT_BLOCK_MESSAGES.agent
  assert('MSG-1 the two registers actually differ', human !== agent)
  // A practitioner is not the operator: our billing vocabulary is not theirs.
  assert('MSG-2 the human message leaks no operator vocabulary', !/spend limit|billing|provider console|credit balance|regain_at/i.test(human))
  assert('MSG-3 the human message says it is not about what they wrote', /not a problem with what you wrote/i.test(human))
  assert('MSG-4 the human message does not invite an immediate retry', /will not help/i.test(human) && !/try again in a moment/i.test(human))
  // A developer's agent can act on precision.
  assert('MSG-5 the agent message names the account-level cause and regain_at', /account-level/i.test(agent) && /regain_at/.test(agent))
  assert('MSG-6 neither message is the internal LOG note verbatim', human !== LLM_ERROR_NOTES.account_block && agent !== LLM_ERROR_NOTES.account_block)
}

console.log('WIRE — every call site, from source')
{
  const root = path.join(__dirname, '..', '..')

  // ── PR19 (2026-09-12), the systemic finding, and it is the reason every read
  // below goes through `stripComments`. Every WIRE pin matches raw file text.
  // A COMMENT reproducing the expected literal satisfies the pin exactly as well
  // as the live statement does — so an edit that deletes the real code and
  // leaves a comment quoting it passes. The reviewer demonstrated this against
  // 6 of the WIRE pins, INCLUDING the two hardened moments earlier after
  // mutation M9 survived. That is not a merely adversarial scenario in this
  // codebase: comments here quote field names constantly, and this session's
  // own SRC-1 pin fired on a comment of mine for precisely that reason.
  // Stripping is the general repair; anchoring individual pins harder was not.
  //
  // The stripper is deliberately string-aware: these route files contain URLs
  // ('https://...'), so a naive `//`-to-end-of-line strip would corrupt live
  // code and could turn a pin silently green. Pinned below by STRIP-1..3.
  function stripComments(src: string): string {
    let out = ''
    let i = 0
    let quote: string | null = null
    while (i < src.length) {
      const c = src[i]
      const next = src[i + 1]
      if (quote) {
        if (c === '\\') { out += c + (next ?? ''); i += 2; continue }
        if (c === quote) quote = null
        out += c; i++; continue
      }
      if (c === "'" || c === '"' || c === '`') { quote = c; out += c; i++; continue }
      if (c === '/' && next === '/') { while (i < src.length && src[i] !== '\n') i++; continue }
      if (c === '/' && next === '*') { i += 2; while (i < src.length && !(src[i] === '*' && src[i + 1] === '/')) i++; i += 2; continue }
      out += c; i++
    }
    return out
  }
  assert('STRIP-1 line comments are removed', stripComments("const a = 1 // engine_error: decoy\nconst b = 2").indexOf('decoy') === -1)
  assert('STRIP-2 block comments are removed', stripComments('a /* engine_error: decoy */ b').indexOf('decoy') === -1)
  assert('STRIP-3 a URL inside a string SURVIVES (a naive stripper would eat the rest of the line)', stripComments("const u = 'https://x.test/a'\nconst keep = 1").includes("https://x.test/a") && stripComments("const u = 'https://x.test/a'\nconst keep = 1").includes('keep'))

  const read = (rel: string) => stripComments(fs.readFileSync(path.join(root, rel), 'utf-8'))

  // The eleven llmOutageResponse call sites, with the audience each one's own
  // callers actually have (requireAuth → a practitioner; validateApiKey → an
  // agent). `sites` is the exact count, so a silently-dropped branch is caught.
  // `style` is the branch SHAPE at that site: 'inline' is the one-line
  // `if (outage) return llmOutageResponse(...)`; 'guarded' is /api/reason's
  // multi-line `if (outage) { ... }` outer catch, which needs loop headers
  // computed first. The distinction is a fact about the existing code, not a
  // concession — the ordering property below is checked for BOTH shapes.
  const WIRED: { rel: string; audience: 'human' | 'agent'; sites: number; style: 'inline' | 'guarded' }[] = [
    { rel: 'app/api/score-decision/route.ts', audience: 'human', sites: 1, style: 'inline' },
    { rel: 'app/api/reflect/route.ts', audience: 'human', sites: 1, style: 'inline' },
    { rel: 'app/api/score-scenario/route.ts', audience: 'human', sites: 2, style: 'inline' },
    { rel: 'app/api/score-conversation/route.ts', audience: 'human', sites: 1, style: 'inline' },
    { rel: 'app/api/mentor/passion-classify/route.ts', audience: 'human', sites: 1, style: 'inline' },
    { rel: 'app/api/mentor/private/reflect/route.ts', audience: 'human', sites: 1, style: 'inline' },
    { rel: 'app/api/score-iterate/route.ts', audience: 'agent', sites: 1, style: 'inline' },
    { rel: 'app/api/evaluate/route.ts', audience: 'human', sites: 1, style: 'inline' },
    { rel: 'app/api/score/route.ts', audience: 'human', sites: 1, style: 'inline' },
    { rel: 'app/api/score-social/route.ts', audience: 'human', sites: 1, style: 'inline' },
    { rel: 'app/api/reason/route.ts', audience: 'agent', sites: 1, style: 'guarded' },
  ]
  const OUTAGE_BRANCH = 'if (outage) return llmOutageResponse'
  let importOk = 0, countOk = 0, orderOk = 0, audienceOk = 0, statusOk = 0
  const problems: string[] = []
  for (const { rel, audience, sites, style } of WIRED) {
    const src = read(rel)
    if (/isProviderAccountBlock/.test(src) && /providerAccountBlockResponse/.test(src)) importOk++
    else problems.push(`${rel}: not wired`)

    const outageMarker = style === 'inline' ? OUTAGE_BRANCH : 'if (outage) {'
    const blockMarker = style === 'inline' ? 'if (accountBlock) return providerAccountBlockResponse' : 'if (accountBlock) {'
    const outageSites = src.split(outageMarker).length - 1
    const blockSites = src.split(blockMarker).length - 1
    if (outageSites === sites && blockSites === sites) countOk++
    else problems.push(`${rel}: outage=${outageSites} block=${blockSites} expected=${sites}`)

    // ORDERING, the load-bearing property: on the one shape where the two
    // classes overlap (§BND-6 — a 429 carrying usage-limit wording) whichever
    // branch runs first decides the response, and only the block branch is
    // right there. Pinned structurally: the block branch must be the line
    // IMMEDIATELY above every outage branch, so a later edit that separates
    // them or reorders them turns this red.
    let ordered: boolean
    if (style === 'inline') {
      const segments = src.split(outageMarker)
      ordered = segments.length - 1 === sites
      for (let i = 0; i < segments.length - 1; i++) {
        const priorLines = segments[i].split('\n')
        const prev = priorLines[priorLines.length - 2] ?? ''
        if (!/if \(accountBlock\) return providerAccountBlockResponse\(/.test(prev)) ordered = false
      }
    } else {
      // Guarded shape: the block branch must OPEN before the outage branch and
      // must return, so control never falls through to the outage branch.
      const bi = src.indexOf(blockMarker)
      const oi = src.indexOf(outageMarker)
      const between = bi >= 0 && oi > bi ? src.slice(bi, oi) : ''
      ordered = bi >= 0 && oi > bi && /return providerAccountBlockResponse\(/.test(between)
    }
    if (ordered) orderOk++
    else problems.push(`${rel}: block branch does not precede-and-return before the outage branch`)

    // PR19 (2026-09-12) — a REAL hole, not just vacuity, and the sharpest finding
    // of the review. The first cut excluded only the literals
    // `providerAccountBlockResponse(error, 'agent'` and `(err, 'agent'`, so
    // RENAMING the catch variable at a site and swapping its audience passed
    // clean: the reviewer demonstrated `score-scenario`'s scoring catch serving
    // the AGENT register — operator vocabulary and regain_at — to a route this
    // very table declares human. That is the AC5 audience-leak class the R20a
    // rendering work exists to prevent. Now matched by SHAPE over ANY variable
    // name, and the positive count is over the same call shape rather than a
    // bare `, 'human'` substring a decoy could inflate.
    const audCallRe = new RegExp(`providerAccountBlockResponse\\(\\s*[^,()]+,\\s*'${audience}'`, 'g')
    const otherAud = audience === 'human' ? 'agent' : 'human'
    const wrongCallRe = new RegExp(`providerAccountBlockResponse\\(\\s*[^,()]+,\\s*'${otherAud}'`, 'g')
    const audUses = (src.match(audCallRe) ?? []).length
    const wrongUses = (src.match(wrongCallRe) ?? []).length
    if (audUses === sites && wrongUses === 0) audienceOk++
    else problems.push(`${rel}: audience '${audience}' expected ${sites}, got ${audUses}, wrong-audience calls ${wrongUses}`)

    // The LOGGED status must follow the SERVED status, or the error log
    // reports 500 for a response that was 503.
    if (src.includes('statusCode: accountBlock || outage ? 503 : 500') || rel === 'app/api/reason/route.ts') statusOk++
    else problems.push(`${rel}: logged statusCode not widened to the block`)
  }
  assert(`WIRE-1 all ${WIRED.length} llmOutageResponse routes import and call the block branch`, importOk === WIRED.length)
  assert('WIRE-2 block-branch count equals outage-branch count at every route', countOk === WIRED.length)
  assert('WIRE-3 the block branch precedes the outage branch at EVERY site (§BND-6 overlap)', orderOk === WIRED.length)
  assert('WIRE-4 each route passes the audience its own auth mode implies', audienceOk === WIRED.length)
  assert('WIRE-5 the logged statusCode follows the served one', statusOk === WIRED.length)
  if (problems.length) console.error('    WIRE problems: ' + problems.join(' | '))

  // Non-vacuity: the table must name routes that exist and really do call the
  // outage helper — an empty or stale table would make WIRE-1..5 pass hollow.
  const allCallers = (() => {
    const hits: string[] = []
    const walk = (d: string) => {
      for (const ent of fs.readdirSync(d, { withFileTypes: true })) {
        const q = path.join(d, ent.name)
        if (ent.isDirectory()) { if (ent.name !== 'node_modules' && ent.name !== '__tests__') walk(q); continue }
        if (!/\.ts$/.test(ent.name)) continue
        if (/llmOutageResponse\(/.test(fs.readFileSync(q, 'utf-8'))) hits.push(path.relative(root, q).split(path.sep).join('/'))
      }
    }
    walk(path.join(root, 'app'))
    return hits.sort()
  })()
  const named = WIRED.map((w) => w.rel).sort()
  assert(`WIRE-6 the table is the COMPLETE set of llmOutageResponse callers (found: ${allCallers.length})`, JSON.stringify(allCallers) === JSON.stringify(named))

  // /api/practice/discernment — a bespoke 503, not llmOutageResponse.
  const disc = read('app/api/practice/discernment/handler.ts')
  assert('WIRE-7 discernment POST returns the block response before its vague 503', /if \(accountBlock\) return providerAccountBlockResponse\(e, 'agent', corsHeaders\(\)\)\n    return json\(\{ error: 'service error' \}, 503\)/.test(disc))
  assert('WIRE-8 discernment passes corsHeaders explicitly — json() adds them, the shared helper does not', disc.split("providerAccountBlockResponse(e, 'agent', corsHeaders())").length - 1 === 2)

  // /api/guardrail — THE logging gap (both halves) plus the fail-closed decision.
  const guard = read('app/api/guardrail/route.ts')
  assert('WIRE-9 guardrail imports logRouteError (it had NO log call on any path)', /import \{ logRouteError \} from '@\/lib\/observability-store'/.test(guard))
  assert('WIRE-10 guardrail logs on all three failure paths: signing, engine, outer catch', guard.split('logRouteError({').length - 1 === 3)
  assert("WIRE-11 guardrail's outer catch logs BEFORE returning its 500", /logRouteError\(\{[\s\S]{0,400}?stage: 'route_outer_catch'[\s\S]{0,200}?\}\)\n    return NextResponse\.json\(\n      \{ error: 'Internal server error' \}/.test(guard))
  // The mirror-image decision: the gate keeps its 200 + proceed:false.
  // WIRE-12/13 are ANCHORED TO THE RESPONSE BODY, not merely to the presence of
  // the identifier. A first cut tested /engine_error: engineErrorCode/ against
  // the whole file and passed while the body had stopped naming the block —
  // because the same text also appears in the logRouteError context two lines
  // above. Mutation M9 survived on exactly that, and these are the repair: each
  // pin now requires the code to reach the field the CALLER reads, anchored on
  // its neighbouring body key so a log-line match cannot satisfy it.
  assert('WIRE-12 guardrail STILL returns 200/proceed:false on an account block (a gate must not become client-side fail-open)', !/providerAccountBlockResponse/.test(guard) && /engine_error: engineErrorCode,\n          assessment_status: 'engine_unavailable',/.test(guard))
  assert("WIRE-13 the block code is computed from the classifier and rides the EXISTING field — no new wire field", /const engineErrorCode = isProviderAccountBlock\(outcome\.error_cause\)\n\s*\? 'provider_account_block'/.test(guard) && !/provider_block:|regain_at:/.test(guard))
  assert('WIRE-13b the gate also says WHY in its reasoning prose, not only in an enum', /engineErrorCode === 'provider_account_block'\n\s*\? 'The reasoning engine could not evaluate this action: the model provider refused/.test(guard))

  // guardrail-sandwich — without error_cause the classifier is blind here.
  const sandwich = read('lib/guardrail-sandwich.ts')
  assert('WIRE-14 both engine_unavailable returns carry error_cause (detail alone classifies as `none`)', sandwich.split('error_cause: err,').length - 1 === 2)
  assert('WIRE-15 the outcome TYPE declares error_cause, so a third return site cannot omit it', /error_cause: unknown/.test(sandwich))

  // /api/reason — Branch 2 is the live path; the outer catch is not.
  const reason = read('app/api/reason/route.ts')
  assert('WIRE-16 reason Branch 2 breaks the R3 masking for the block class only', /if \(isProviderAccountBlock\(sandwichResult\.error_cause\)\)/.test(reason))
  assert('WIRE-17 the block response goes through respond(), so the loop ledger is not bypassed', /return await respond\(\{\s*body: blockPayload\.body,\s*status: blockPayload\.status,/.test(reason))
  assert('WIRE-18 an account block is NOT billed (isBillable false), unlike the masked-200 sibling', /isBillable: false,\n        \}\)\n      \}\n      logRouteError\(\{/.test(reason))
  assert('WIRE-19 the masked-200 path for every OTHER cause is untouched', /body: buildMinimalFallback\(sandwichResult\.error\),\n        status: 200,[\s\S]{0,160}isBillable: true,/.test(reason))

  // The client that would otherwise call a billing block a bug.
  const client = read('app/private-mentor/page.tsx')
  assert('WIRE-20 private-mentor branches on the new code (it would otherwise say "Something went wrong")', /data\?\.error === 'ai_unavailable_provider_account'/.test(client))
  assert('WIRE-21 … and renders the route message, never the raw machine code', /data\?\.message \?\?/.test(client))

  // Two more pages throw `new Error(data.error)` and render err.message
  // verbatim, so a bare machine code reached the practitioner. Pre-existing for
  // the transient code; O-2 adds a second one, so both now prefer the sentence.
  // Pinned because nothing else would notice a revert.
  for (const page of ['app/score-social/page.tsx', 'app/scenarios/page.tsx']) {
    assert(`WIRE-22 ${page} prefers the route's sentence over its machine code`, /throw new Error\(data\.message \|\| data\.error \|\|/.test(read(page)))
  }
}

// Async body-shape check + STO + summary (tsx cjs transform forbids top-level await).
;(async () => {
  const body = (await res.json()) as { error?: string }
  assert('RES-5 body error code', body.error === 'ai_temporarily_unavailable')

  console.log('STO — recordRouteError row shape (fake client)')
  type Row = Record<string, unknown> & { context: Record<string, unknown> & { provider_error?: Record<string, unknown> } }
  function makeFakeClient(outcome: { error?: { code?: string; message: string } | null } = {}) {
    const rows: { table: string; row: Row }[] = []
    const client = {
      from(table: string) {
        return { insert(row: Row) { rows.push({ table, row }); return Promise.resolve({ error: outcome.error ?? null }) } }
      },
    }
    return { client: client as unknown as Parameters<typeof recordRouteError>[1], rows }
  }
  {
    const { client, rows } = makeFakeClient()
    const r = await recordRouteError({ route: '/api/reason', method: 'POST', error: liveUsageLimit(), statusCode: 200, isLlmOutage: false, context: { fallback_reason: 'layer1_throw', masked_fallback: true } }, client)
    const row = rows[0]?.row
    assert('STO-0 insert reached route_errors and reported ok', r.ok && rows.length === 1 && rows[0].table === 'route_errors')
    assert("STO-1 error_type carries the SDK class name ('BadRequestError'), not the generic 'Error'", row?.error_type === 'BadRequestError')
    const pe = row?.context?.provider_error
    assert('STO-2 context.provider_error = account_block / 400 / invalid_request_error / regain_at / retriable false / note', pe?.kind === 'account_block' && pe?.status === 400 && pe?.api_error_type === 'invalid_request_error' && pe?.regain_at === '2026-10-01T00:00:00Z' && pe?.retriable === false && pe?.note === LLM_ERROR_NOTES.account_block)
    assert('STO-3 is_llm_outage is the caller\'s passthrough (false here) — the store never overrides it', row?.is_llm_outage === false)
    assert('STO-4 caller context preserved alongside provider_error', row?.context?.fallback_reason === 'layer1_throw' && row?.context?.masked_fallback === true)
    assert('STO-8 provider_error never carries the provider message text', pe !== undefined && !JSON.stringify(pe).includes('You have reached') && !JSON.stringify(pe).includes('req_test'))
    assert('STO-9 the message column still carries the SDK message (unchanged)', typeof row?.message === 'string' && (row.message as string).startsWith('400 {'))
  }
  {
    const { client, rows } = makeFakeClient()
    await recordRouteError({ route: '/api/score', error: new Error('cannot read properties of undefined'), statusCode: 500, isLlmOutage: false }, client)
    const row = rows[0]?.row
    assert("STO-5 plain Error → error_type 'Error', provider_error exactly { kind: 'none' }", row?.error_type === 'Error' && JSON.stringify(row?.context?.provider_error) === JSON.stringify({ kind: 'none' }))
  }
  {
    const { client, rows } = makeFakeClient()
    await recordRouteError({ route: '/api/score', error: new RateLimitError('slow down'), statusCode: 503, isLlmOutage: true }, client)
    const row = rows[0]?.row
    assert('STO-3b is_llm_outage true passthrough + provider_error transient_outage on a RateLimitError', row?.is_llm_outage === true && row?.context?.provider_error?.kind === 'transient_outage' && row?.error_type === 'RateLimitError')
  }
  {
    class Layer1ValidationError extends Error { constructor(m: string) { super(m); this.name = 'Layer1ValidationError' } }
    const { client, rows } = makeFakeClient()
    await recordRouteError({ route: '/api/practice/discernment', error: new Layer1ValidationError('Invalid enum value'), statusCode: 503 }, client)
    const row = rows[0]?.row
    assert("STO-6 a class that sets its own .name keeps it ('Layer1ValidationError'); is_llm_outage defaults false", row?.error_type === 'Layer1ValidationError' && row?.is_llm_outage === false && row?.context?.provider_error?.kind === 'none')
  }
  {
    const { client, rows } = makeFakeClient()
    await recordRouteError({ route: '/api/x', error: liveUsageLimit(), statusCode: 500, context: { provider_error: { kind: 'caller_says_so' } } }, client)
    assert('STO-7 a caller-supplied provider_error is kept as supplied (never clobbered)', rows[0]?.row?.context?.provider_error?.kind === 'caller_says_so')
  }
  {
    const { client, rows } = makeFakeClient({ error: { code: '42P01', message: 'relation "public.route_errors" does not exist' } })
    let threw = false
    let r: { ok: boolean } = { ok: true }
    try { r = await recordRouteError({ route: '/api/x', error: new Error('x'), statusCode: 500 }, client) } catch { threw = true }
    assert('STO-10 missing-table error → { ok:false }, no throw (benign path preserved through the new seam)', !threw && r.ok === false && rows.length === 1)
  }
  {
    // No client and no env ⇒ ok:false without touching the network. Env is
    // cleared in-process so a --env-file run can never turn this into a real insert.
    const savedUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const savedKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    delete process.env.NEXT_PUBLIC_SUPABASE_URL
    delete process.env.SUPABASE_SERVICE_ROLE_KEY
    const r = await recordRouteError({ route: '/api/x', error: new Error('x'), statusCode: 500 })
    if (savedUrl !== undefined) process.env.NEXT_PUBLIC_SUPABASE_URL = savedUrl
    if (savedKey !== undefined) process.env.SUPABASE_SERVICE_ROLE_KEY = savedKey
    assert('STO-11 no injected client + no env → { ok:false } (one-arg signature still valid)', r.ok === false)
  }
  {
    // The outer catch: a client that THROWS (not one that returns an error
    // object — that is STO-10's path) must still resolve { ok:false } without
    // throwing into the caller. Mutation-verified: a rethrow in the outer
    // catch turns this red.
    const throwingClient = { from() { return { insert() { return Promise.reject(new Error('socket hang up')) } } } } as unknown as Parameters<typeof recordRouteError>[1]
    let threw = false
    let r: { ok: boolean } = { ok: true }
    const savedWarn = console.warn
    console.warn = () => {}
    try { r = await recordRouteError({ route: '/api/x', error: new Error('x'), statusCode: 500 }, throwingClient) } catch { threw = true } finally { console.warn = savedWarn }
    assert('STO-14 a client whose insert throws → { ok:false }, never throws into the caller', !threw && r.ok === false)
  }
  {
    const { errorTypeOf, providerErrorContext } = __test
    assert('STO-12 errorTypeOf: non-Error values report typeof', errorTypeOf('s') === 'string' && errorTypeOf(42) === 'number' && errorTypeOf(null) === 'object')
    assert('STO-13 providerErrorContext omits null-valued keys, keeps kind', JSON.stringify(providerErrorContext({ kind: 'none', retriable: null, status: null, api_error_type: null, regain_at: null, note: null })) === '{"kind":"none"}')
  }

  console.log('BLK — the response a caller actually receives')
  {
    const res503 = providerAccountBlockResponse(liveUsageLimit(), 'human')
    const b = (await res503.json()) as Record<string, unknown>
    assert('BLK-1 status 503', res503.status === 503)
    assert('BLK-2 body error code is the account-block one', b.error === PROVIDER_ACCOUNT_BLOCK_CODE)
    assert('BLK-3 body message is the HUMAN register for a human audience', b.message === PROVIDER_ACCOUNT_BLOCK_MESSAGES.human)
    assert('BLK-4 retriable:false and regain_at on the wire', b.retriable === false && b.regain_at === '2026-10-01T00:00:00Z')
    assert('BLK-5 Retry-After present and capped, never 30', res503.headers.get('Retry-After') === String(RETRY_AFTER_MAX_SECONDS) && res503.headers.get('Retry-After') !== '30')
    const agentRes = providerAccountBlockResponse(liveUsageLimit(), 'agent', { 'X-Loop-Id': 'abc' })
    const ab = (await agentRes.json()) as Record<string, unknown>
    assert('BLK-6 the agent audience gets the agent message', ab.message === PROVIDER_ACCOUNT_BLOCK_MESSAGES.agent)
    assert('BLK-7 extraHeaders merge, exactly as llmOutageResponse does', agentRes.headers.get('X-Loop-Id') === 'abc' && agentRes.headers.get('Retry-After') === String(RETRY_AFTER_MAX_SECONDS))
    // O-1 disclosed residual #1, now CLOSED at the response layer: the
    // hypothetical 429 carrying usage-limit wording classifies as a block AND
    // reads as an outage, and before O-2 it would have received Retry-After: 30.
    // With the block branch first at every site, it receives this instead.
    const overlap = new SdkRateLimitError(429, apiBody('rate_limit_error', 'You have reached your specified API usage limits.'))
    assert('BLK-8 §BND-6 overlap: it IS both classes (the divergence is real, not theoretical)', isProviderAccountBlock(overlap) && isLlmOutage(overlap))
    const overlapRes = providerAccountBlockResponse(overlap, 'agent')
    assert('BLK-9 … and the block response, not Retry-After:30, is what the ordering delivers', overlapRes.status === 503 && overlapRes.headers.get('Retry-After') === null)
    const legacy = llmOutageResponse()
    assert('BLK-10 the transient response is UNCHANGED — Retry-After:30 still means "come back soon"', legacy.status === 503 && legacy.headers.get('Retry-After') === '30')
  }

  console.log(`\n${passCount} passed, ${failCount} failed`)
  if (failCount > 0) process.exit(1)
})()
