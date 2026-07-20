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
