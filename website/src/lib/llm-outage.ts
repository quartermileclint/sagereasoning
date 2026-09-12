import { NextResponse } from 'next/server'

/**
 * #10 (P-GL, 2026-07-20) — honest degradation on Anthropic/LLM outages.
 *
 * Duck-typed classifier: does this thrown error look like an UPSTREAM LLM outage
 * (connection failure, timeout, or a 5xx/429/529 from Anthropic) rather than a
 * genuine server bug? Deliberately does NOT import the @anthropic-ai/sdk error
 * classes — this stays a zero-dependency leaf usable from any route and unit-
 * testable without the SDK.
 *
 * The Anthropic SDK (@anthropic-ai/sdk ^0.80) throws typed errors carrying a
 * numeric `.status` and a class name (APIConnectionError / APIConnectionTimeout-
 * Error / InternalServerError / RateLimitError / APIError). The primary
 * `client.messages.create` call in runSageReason is NOT wrapped, so the raw SDK
 * error propagates to each route's outer catch; /api/evaluate and /api/reflect
 * call the client directly and propagate the same shapes.
 *
 * Precision note: a bare `status: 500` is treated as an outage ONLY when the
 * error's class name also matches (InternalServerError) — a coincidental
 * `{ status: 500 }` on some non-LLM object does not trip the classifier. The
 * pure-status set holds only the unambiguous upstream/connection codes.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * O-1 (2026-09-12) — a provider ACCOUNT BLOCK is not an outage.
 *
 * On 2026-09-12 the founder's Anthropic account hit its configured spend limit.
 * The SDK surfaced it as a `BadRequestError` (HTTP 400, body
 * `{"type":"error","error":{"type":"invalid_request_error","message":"You have
 * reached your specified API usage limits. You will regain access on 2026-10-01
 * at 00:00 UTC."}}`) — a status outside OUTAGE_STATUS, a class outside
 * OUTAGE_NAME_HINTS, a message without an outage hint. `isLlmOutage` therefore
 * read false, and every `route_errors` row the block produced said, in effect,
 * "our code". (Shape observed, not inferred: 94 production `route_errors` rows,
 * 2026-09-12T06:07Z–08:27Z, read back by a read-only query in the O-1 session;
 * the SDK's `APIError.generate` mapping was read from `src/core/error.ts`.)
 *
 * The category decision, argued in `D-LLM-OUTAGE-CLASSIFIER-ACCOUNT-BLOCK-
 * 2026-09-12`: `isLlmOutage` is DELIBERATELY NOT widened. It gates
 * `llmOutageResponse` — a 503 with `Retry-After: 30` — which is honest for a
 * transient upstream failure and actively misleading for an account block,
 * since no retry clears a spend limit until a human visits the provider
 * console. The account-block class is instead surfaced by `classifyLlmError`,
 * which the observability store uses to enrich every `route_errors` row with
 * `context.provider_error` — so the log can say "the provider refused us for an
 * account reason" without any route changing what it returns. The routes'
 * response-shape for an account block (today a generic 500 on the human tool
 * routes, a masked 200 on /api/reason, a 503 on discernment) is a named,
 * disclosed residual for a later route-edit session.
 *
 * `isLlmOutage` and `llmOutageResponse` below are byte-identical to their
 * pre-O-1 bodies (a static fact: at the O-1 commit both function bodies were
 * extracted and diffed against the pre-O-1 file — zero differences). Separately
 * and behaviourally, `__tests__/llm-outage.test.ts` §PAR pins that
 * `classifyLlmError`'s `transient_outage` kind tracks `isLlmOutage` on every
 * fixture except the one disclosed divergence (§BND-6).
 * ─────────────────────────────────────────────────────────────────────────────
 */

// Unambiguous upstream / gateway / overloaded / timeout HTTP codes.
const OUTAGE_STATUS = new Set([408, 502, 503, 504, 529])

// SDK error class names that always mean "upstream is unavailable / retriable".
const OUTAGE_NAME_HINTS = [
  'APIConnectionError',
  'APIConnectionTimeoutError',
  'InternalServerError', // Anthropic 5xx
  'RateLimitError', // Anthropic 429 — we are being throttled upstream
  'OverloadedError',
]

const OUTAGE_MESSAGE_HINTS = [
  'connection error',
  'timeout',
  'timed out',
  'overloaded',
  'econnreset',
  'econnrefused',
  'etimedout',
  'socket hang up',
  'fetch failed',
  'network error',
]

/**
 * True when `error` looks like a transient upstream LLM outage (not a bug).
 */
export function isLlmOutage(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false
  const e = error as {
    status?: unknown
    name?: unknown
    message?: unknown
    constructor?: { name?: string }
  }

  const status = typeof e.status === 'number' ? e.status : undefined
  if (status !== undefined && OUTAGE_STATUS.has(status)) return true

  // Check both the instance name and the constructor name — SDK subclasses may
  // leave `.name` as 'Error' while `.constructor.name` carries the real class.
  const nameSurface = `${typeof e.name === 'string' ? e.name : ''} ${e.constructor?.name ?? ''}`
  if (OUTAGE_NAME_HINTS.some((h) => nameSurface.includes(h))) return true

  const message = typeof e.message === 'string' ? e.message.toLowerCase() : ''
  if (message && OUTAGE_MESSAGE_HINTS.some((h) => message.includes(h))) return true

  return false
}

/**
 * The honest degraded response for an upstream LLM outage — a retriable 503,
 * not a raw 500. Distinguishable by the caller, no leaked internals.
 *
 * @param extraHeaders  optional headers to merge (e.g. the X-Loop-* metering
 *                      headers on /api/reason and /api/score-iterate).
 */
export function llmOutageResponse(extraHeaders?: Record<string, string>): NextResponse {
  return NextResponse.json(
    {
      error: 'ai_temporarily_unavailable',
      message: 'The reasoning service is temporarily unavailable. Please try again in a moment.',
    },
    { status: 503, headers: { 'Retry-After': '30', ...(extraHeaders ?? {}) } }
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// O-1 — the finer classification the log records (routes keep branching on
// `isLlmOutage` alone; nothing below changes any response).
// ═══════════════════════════════════════════════════════════════════════════

export type LlmErrorKind =
  /** The provider refused us for an ACCOUNT-level reason (spend/usage limit,
   *  billing, a disabled organisation). Retrying cannot clear it; a human must
   *  act in the provider console. NOT an outage. */
  | 'account_block'
  /** A transient upstream failure — exactly the class `isLlmOutage` reads. */
  | 'transient_outage'
  /** The provider answered with some other 4xx (a malformed request, a bad
   *  key, an unknown model, a payload too large). Not retriable as sent; the
   *  cause is usually on our side, but it is the PROVIDER speaking, not a
   *  throw inside our own code. */
  | 'provider_rejection'
  /** Not a provider error at all (or no evidence it is one). */
  | 'none'

export interface LlmErrorClassification {
  kind: LlmErrorKind
  /** true for transient_outage; false for account_block / provider_rejection; null for none. */
  retriable: boolean | null
  /** The provider's HTTP status when the error carries a numeric one. */
  status: number | null
  /** The API body's `error.type` (e.g. 'invalid_request_error') when present. */
  api_error_type: string | null
  /** ISO instant parsed from "You will regain access on YYYY-MM-DD at HH:MM UTC", when present. */
  regain_at: string | null
  /** A short, constant-per-kind human note for the log; null for `none`. */
  note: string | null
}

// The SDK's class names (src/core/error.ts, @anthropic-ai/sdk 0.80), matched
// EXACTLY against `.constructor.name` as one half of the provenance evidence
// (see hasProviderProvenance). `.name` stays 'Error' on every SDK class (none
// sets it) — which is the discriminator against an in-repo class that merely
// shares an SDK name: `src/lib/cognitive-os/permissions.ts` defines its own
// `PermissionDeniedError` and sets `this.name = 'PermissionDeniedError'`, so it
// fails the generic-name test (PR19 fold, 2026-09-12; pinned in §BND-13).
const SDK_CLASS_NAMES = [
  'AnthropicError',
  'APIError',
  'APIConnectionError',
  'APIConnectionTimeoutError',
  'APIUserAbortError',
  'BadRequestError',
  'AuthenticationError',
  'PermissionDeniedError',
  'NotFoundError',
  'ConflictError',
  'UnprocessableEntityError',
  'RateLimitError',
  'InternalServerError',
]

// Account-block vocabulary. Matched (lower-cased) against the API body's
// error.message and the thrown message (the SDK embeds the JSON body in it),
// but ONLY under provider provenance — see hasProviderProvenance. Kept
// specific on purpose: a generic 'usage limit' would also catch a per-minute
// rate-limit wording on a 429, which IS transient. The first entry is the
// shape observed live 2026-09-12; the rest are the documented billing shapes
// (a 400 "credit balance is too low", a disabled organisation).
const ACCOUNT_BLOCK_MESSAGE_HINTS = [
  'specified api usage limit',
  'regain access on',
  'spend limit',
  'spending limit',
  'credit balance',
  'purchase credits',
  'plans & billing',
  'plans and billing',
  'organization has been disabled',
  'organisation has been disabled',
  'account has been disabled',
]

// The API's documented billing shape — `402 billing_error`, "Billing or payment
// problem" (Anthropic API error-codes reference; SDK 0.80's `APIError.generate`
// has no 402 branch, so it surfaces as the base `APIError` with status 402).
// Not the shape observed live (that was a 400, see the header); covered as the
// documented one. Both are gated on provenance like the vocabulary — a bare
// `{ status: 402 }` from anywhere else must never read as an Anthropic block
// (PR19 fold, 2026-09-12; pinned in §BND-12).
const ACCOUNT_BLOCK_API_TYPES = new Set(['billing_error'])

export const LLM_ERROR_NOTES: Record<Exclude<LlmErrorKind, 'none'>, string> = {
  account_block:
    'Provider refused the request for an account-level reason (usage/spend limit, billing, or a disabled account). ' +
    'Retrying will not clear it; a human must act in the provider console — check the spend limit, not only the credit balance.',
  transient_outage:
    'Transient upstream outage (connection failure, timeout, overload, or a 5xx/429); retriable.',
  provider_rejection:
    'Provider rejected the request as sent (a 4xx that is neither an outage nor an account block); not retriable unchanged — usually a request-shape issue on our side.',
}

const REGAIN_RE = /regain access on (\d{4}-\d{2}-\d{2}) at (\d{2}:\d{2}) utc/i

type ErrorSurface = {
  status?: unknown
  name?: unknown
  message?: unknown
  error?: unknown
  constructor?: { name?: string }
}

/** The API body's `error.type`, when the SDK attached a parsed body. */
function apiErrorTypeOf(e: ErrorSurface): string | null {
  const body = e.error as { error?: { type?: unknown } } | undefined
  const t = body && typeof body === 'object' ? body.error?.type : undefined
  return typeof t === 'string' ? t : null
}

/** The API body's `error.message` plus the thrown message, lower-cased, for hint matching. */
function messageSurfaceOf(e: ErrorSurface): string {
  const body = e.error as { error?: { message?: unknown } } | undefined
  const inner = body && typeof body === 'object' && typeof body.error?.message === 'string' ? body.error.message : ''
  const outer = typeof e.message === 'string' ? e.message : ''
  return `${inner} ${outer}`.toLowerCase()
}

/**
 * Evidence the thrown value came from the Anthropic client. Without it, NO
 * status, API type or message vocabulary is trusted (every account_block and
 * provider_rejection disjunct sits behind it). Two forms:
 *   (a) the SDK attached its parsed response body — `.error` is an object
 *       (`client.ts` passes the parsed JSON as `error`; on a non-JSON body it
 *       passes undefined and the raw text becomes the message);
 *   (b) an SDK status-error instance: `.constructor.name` is EXACTLY one of the
 *       SDK's classes, `.name` is still the generic 'Error' (no SDK class sets
 *       it; an in-repo class that names itself after an HTTP error does — see
 *       SDK_CLASS_NAMES), and a numeric `.status` is present. This is what
 *       covers the body-less / non-JSON-body case.
 * `APIConnectionError` satisfies neither (no body, no status) — irrelevant,
 * since it is transient by `isLlmOutage` and never carries block vocabulary.
 */
function hasProviderProvenance(e: ErrorSurface): boolean {
  if (e.error !== null && typeof e.error === 'object') return true
  const ctor = e.constructor?.name
  const genericName = typeof e.name !== 'string' || e.name === 'Error'
  return (
    genericName &&
    typeof e.status === 'number' &&
    typeof ctor === 'string' &&
    SDK_CLASS_NAMES.includes(ctor)
  )
}

function parseRegainAt(messageSurface: string): string | null {
  const m = REGAIN_RE.exec(messageSurface)
  if (!m) return null
  const iso = `${m[1]}T${m[2]}:00Z`
  return Number.isNaN(Date.parse(iso)) ? null : iso
}

const NONE: LlmErrorClassification = {
  kind: 'none',
  retriable: null,
  status: null,
  api_error_type: null,
  regain_at: null,
  note: null,
}

/**
 * Classify a thrown error into the four kinds above. Pure; never throws (a
 * hostile object whose getters throw classifies as `none`). Order matters and
 * is deliberate:
 *
 *   1. account_block   — the most specific, message-evidenced class. Checked
 *                        FIRST so that a block signalled under an otherwise
 *                        "retriable" status (a hypothetical 429 carrying the
 *                        usage-limit wording) is still recorded as a block.
 *                        `isLlmOutage` is NOT consulted here, so on that
 *                        hypothetical shape the two disagree by design —
 *                        pinned in the battery (§BND) as a disclosed residual:
 *                        the response path would still say retry-in-30.
 *   2. transient_outage — exactly `isLlmOutage(error)`; never re-implemented.
 *   3. provider_rejection — provider provenance + a numeric 4xx status.
 *   4. none.
 */
export function classifyLlmError(error: unknown): LlmErrorClassification {
  try {
    if (!error || typeof error !== 'object') return NONE
    const e = error as ErrorSurface
    const status = typeof e.status === 'number' ? e.status : null
    const apiType = apiErrorTypeOf(e)
    const provenance = hasProviderProvenance(e)
    const messageSurface = messageSurfaceOf(e)

    // Every disjunct behind the provenance gate — a bare 402, or an `.error`
    // body carrying `billing_error`, is only trusted from the SDK's own error
    // shapes (the body branch of hasProviderProvenance already implies the
    // second disjunct; the gate is written explicitly so the invariant reads
    // off the page).
    const accountBlock =
      provenance &&
      (status === 402 ||
        (apiType !== null && ACCOUNT_BLOCK_API_TYPES.has(apiType)) ||
        ACCOUNT_BLOCK_MESSAGE_HINTS.some((h) => messageSurface.includes(h)))
    if (accountBlock) {
      return {
        kind: 'account_block',
        retriable: false,
        status,
        api_error_type: apiType,
        regain_at: parseRegainAt(messageSurface),
        note: LLM_ERROR_NOTES.account_block,
      }
    }

    if (isLlmOutage(error)) {
      return {
        kind: 'transient_outage',
        retriable: true,
        status,
        api_error_type: apiType,
        regain_at: null,
        note: LLM_ERROR_NOTES.transient_outage,
      }
    }

    if (provenance && status !== null && status >= 400 && status < 500) {
      return {
        kind: 'provider_rejection',
        retriable: false,
        status,
        api_error_type: apiType,
        regain_at: null,
        note: LLM_ERROR_NOTES.provider_rejection,
      }
    }

    return NONE
  } catch {
    return NONE
  }
}

/**
 * True when the provider refused us for an account-level reason. Intended for
 * a later route-level response branch (a 503 WITHOUT `Retry-After`, or with a
 * long one, and an honest error code) — no route calls it yet; that change
 * touches GUARD_RE files and is its own session.
 */
export function isProviderAccountBlock(error: unknown): boolean {
  return classifyLlmError(error).kind === 'account_block'
}
