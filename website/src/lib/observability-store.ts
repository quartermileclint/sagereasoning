import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { createHash } from 'node:crypto'
import { waitUntil } from '@vercel/functions'

/**
 * Observability store (P-GL, 2026-07-20) — two append-only, service-role-only,
 * fail-soft writers:
 *   • recordRouteError   (#5) → public.route_errors   — queryable prod error store
 *   • recordThrottleEvent (#8) → public.throttle_events — rate-limit visibility
 *
 * Design posture (mirrors substrate-audit-writer.ts):
 *   - Lazy service-role client; no import-time DB side effect.
 *   - NEVER throws into the caller's request path (both are observability, not
 *     correctness). Any error is swallowed + logged; the return is { ok:false }.
 *   - MISSING-TABLE-BENIGN: until the founder-walked migration lands, an insert
 *     errors with "relation does not exist" / a PostgREST table-not-found — we
 *     classify that as benign (skip, no loud warn), so the writers ship inert-
 *     safe and ACTIVATE simply by applying the migration (one founder step, no
 *     flag). Only a genuine failure logs a warn.
 *   - The sync log*() wrappers schedule the write via waitUntil (@vercel/
 *     functions — KG1-safe: the write completes after the response is flushed,
 *     never blocking it), with a best-effort fallback outside a request context.
 *
 * PII: route_errors captures error metadata only (route/method/type/message/
 * stack/status) — NEVER request bodies or user content; callers must keep
 * `context` PII-free. throttle_events stores a SHA-256 IP hash (not the raw IP)
 * and a credential id (not the raw key). Both tables are service-role-only (RLS
 * on, no policy) with 90-day retention.
 */

const RETAIN_DAYS = 90

let _adminClient: SupabaseClient | null = null

function getAdminClient(): SupabaseClient | null {
  if (_adminClient) return _adminClient
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  _adminClient = createClient(url, key)
  return _adminClient
}

/**
 * A missing TABLE (pre-migration) — NOT a missing column. We match the two
 * table-not-found forms (Postgres 42P01 "relation ... does not exist" and
 * PostgREST "Could not find the table ... in the schema cache") but NOT the
 * bare "schema cache" phrasing that a missing-COLUMN error (PGRST204) also
 * carries — a false-benign column classification is the documented trap. Since
 * these writers insert a fixed row shape into tables this module owns, column
 * drift cannot occur once the migration lands.
 */
function isMissingTableError(message: string): boolean {
  const m = message.toLowerCase()
  return (
    (m.includes('relation') && m.includes('does not exist')) ||
    m.includes('could not find the table')
  )
}

function truncate(value: string | null | undefined, max: number): string | null {
  if (value == null) return null
  return value.length > max ? value.slice(0, max) : value
}

function retainUntil(): string {
  return new Date(Date.now() + RETAIN_DAYS * 24 * 60 * 60 * 1000).toISOString()
}

// ───────────────────────── #5 route_errors ─────────────────────────

export interface RouteErrorParams {
  /** The route path, e.g. '/api/score'. */
  route: string
  /** HTTP method, e.g. 'POST'. */
  method?: string
  /** The thrown value from the route's catch block. */
  error: unknown
  /** The HTTP status the route returned in response (500 or 503). */
  statusCode: number
  /** Whether the error was classified as an upstream LLM outage (#10). */
  isLlmOutage?: boolean
  /** Small, PII-FREE structured extras. Never request bodies / user content. */
  context?: Record<string, unknown>
}

export async function recordRouteError(params: RouteErrorParams): Promise<{ ok: boolean }> {
  try {
    const admin = getAdminClient()
    if (!admin) return { ok: false }

    const err = params.error
    const isErr = err instanceof Error
    const row = {
      route: truncate(params.route, 300),
      method: truncate(params.method ?? null, 12),
      error_type: truncate(
        isErr ? err.name || err.constructor?.name || 'Error' : typeof err,
        120
      ),
      message: truncate(isErr ? err.message : typeof err === 'string' ? err : null, 2000),
      stack: truncate(isErr ? err.stack ?? null : null, 4000),
      status_code: params.statusCode,
      is_llm_outage: params.isLlmOutage ?? false,
      context: params.context ?? null,
      retain_until: retainUntil(),
    }

    const { error } = await admin.from('route_errors').insert(row)
    if (error) {
      if (!isMissingTableError(error.message)) {
        console.warn('[observability] route_errors insert failed (non-fatal): ' + error.message)
      }
      return { ok: false }
    }
    return { ok: true }
  } catch (e) {
    console.warn(
      '[observability] route_errors write threw (non-fatal): ' +
        (e instanceof Error ? e.message : String(e))
    )
    return { ok: false }
  }
}

/** Sync, non-blocking wrapper for route catch blocks. */
export function logRouteError(params: RouteErrorParams): void {
  try {
    waitUntil(recordRouteError(params))
  } catch {
    // Outside a request context (tests / non-Vercel) — best-effort, never blocks.
    void recordRouteError(params)
  }
}

// ───────────────────────── #8 throttle_events ─────────────────────────

export interface ThrottleEventParams {
  /** The rate-limit category, e.g. 'scoring', 'data-rights', 'api-key-quota'. */
  category: string
  /** Which limiter fired. */
  limiter: 'ip' | 'api_key_monthly' | 'api_key_daily'
  /** Raw client IP — HASHED before storage (never stored raw). IP limiter only. */
  ip?: string | null
  /** The credential id (NOT the raw key). Quota limiters only. */
  credentialRef?: string | null
  /** The gated endpoint, when known. */
  endpoint?: string | null
  /** The limit value that was exceeded. */
  limitValue?: number | null
  /** The window in seconds (IP limiter). */
  windowSeconds?: number | null
}

function hashIp(ip: string): string {
  return createHash('sha256').update(ip).digest('hex').slice(0, 16)
}

export async function recordThrottleEvent(params: ThrottleEventParams): Promise<{ ok: boolean }> {
  try {
    const admin = getAdminClient()
    if (!admin) return { ok: false }

    const row = {
      category: truncate(params.category, 60),
      limiter: params.limiter,
      ip_hash: params.ip ? hashIp(params.ip) : null,
      credential_ref: truncate(params.credentialRef ?? null, 120),
      endpoint: truncate(params.endpoint ?? null, 120),
      limit_value: params.limitValue ?? null,
      window_seconds: params.windowSeconds ?? null,
      retain_until: retainUntil(),
    }

    const { error } = await admin.from('throttle_events').insert(row)
    if (error) {
      if (!isMissingTableError(error.message)) {
        console.warn('[observability] throttle_events insert failed (non-fatal): ' + error.message)
      }
      return { ok: false }
    }
    return { ok: true }
  } catch (e) {
    console.warn(
      '[observability] throttle_events write threw (non-fatal): ' +
        (e instanceof Error ? e.message : String(e))
    )
    return { ok: false }
  }
}

/** Sync, non-blocking wrapper for the 429 return points in security.ts. */
export function logThrottleEvent(params: ThrottleEventParams): void {
  try {
    waitUntil(recordThrottleEvent(params))
  } catch {
    void recordThrottleEvent(params)
  }
}

// Exposed for tests.
export const __test = { isMissingTableError, truncate, hashIp }
