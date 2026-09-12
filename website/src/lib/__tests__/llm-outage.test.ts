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

  console.log(`\n${passCount} passed, ${failCount} failed`)
  if (failCount > 0) process.exit(1)
})()
