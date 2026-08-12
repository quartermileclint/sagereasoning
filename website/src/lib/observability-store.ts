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
 * PostgREST "Could not find the table ... in the schema cache") but NOT a
 * missing-COLUMN error (Postgres 42703 / PostgREST PGRST204) — the documented
 * false-benign trap (memory `missing-table-benign-guards-load-bearing-writes`).
 *
 * 2026-08-10 hardening: the message-only form of this check was NOT actually
 * safe against the trap it names in its own comment — a real Postgres 42703
 * message is shaped `column "foo" of relation "bar" does not exist`, which
 * contains BOTH "relation" and "does not exist" as substrings and would have
 * matched the table-not-found regex. Confirmed by adversarial review + direct
 * mutation-test reproduction, not merely by inspection. Now takes the full
 * error object (code + message) and applies the SAME code-first, /column/i-
 * guarded pattern already used by the sibling stores (e.g.
 * agent-assessment-history-store.ts's isMissingTableError) — checked here
 * FIRST, before either substring form, so a column-shaped message can never
 * fall through to the table-shaped regex regardless of its wording.
 */
function isMissingTableError(error: { code?: string; message?: string } | null | undefined): boolean {
  if (!error) return false
  if (error.code === '42703' || error.code === 'PGRST204') return false
  const message = error.message ?? ''
  if (/column/i.test(message)) return false
  if (error.code === '42P01' || error.code === 'PGRST205') return true
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
      if (!isMissingTableError(error)) {
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
      if (!isMissingTableError(error)) {
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

// ══════════════════════════════════════════════════════════════════════════
// RETENTION SWEEP (C-1) — the enforcement half of the 90-day retain_until
// ══════════════════════════════════════════════════════════════════════════
//
// Both tables above have carried a `retain_until` column AND an index on it
// since their P-GL migrations (idx_route_errors_retain_until,
// idx_throttle_events_retain_until) — the schema has always declared the
// retention intent. Nothing enforced it: the 2026-08-01 regrounding audit
// found the declared-but-unenforced gap (C-1), and neither table is reachable
// by the user-JWT data-rights paths (both are service-role-only, and
// throttle_events holds only a hashed IP), so this sweep is their ONLY
// deletion mechanism.
//
// Mirrors purgeExpiredTrajectory (agent-assessment-history-store.ts) exactly:
// a bounded, indexed DELETE; missing-table-benign so it is safe on a
// deployment where a migration has not landed; fail-HONEST, never fail-closed
// — a cron has no user-facing response to protect, so a failed DELETE is
// reported in the JSON rather than thrown.
//
// The flag lives here rather than in the route so the route stays a thin
// wrapper, matching the trajectory precedent (isTrajectorySweepEnabled).

export const OBSERVABILITY_SWEEP_ENV_VAR = 'SUBSTRATE_OBSERVABILITY_SWEEP_ENABLED'

/**
 * True only when the flag is the exact string 'true'. Unset/other ⇒ the sweep
 * route reports { flag_enabled: false } and does NO DB work. Read at call time
 * (mirrors every sibling flag) so a test can set and unset it in-process.
 */
export function isObservabilitySweepEnabled(): boolean {
  return process.env[OBSERVABILITY_SWEEP_ENV_VAR] === 'true'
}

// Neither table has a generic `id` column — route_errors' primary key is
// error_id, throttle_events' is throttle_id (see their migrations' §1). A
// hardcoded .select('id') compiles to `DELETE ... RETURNING id`, which
// Postgres rejects wholesale when the column doesn't exist — fail-honest
// (nothing is deleted, the error is surfaced), never a wrong/partial delete,
// but it also means the sweep could never delete anything until fixed. Found
// live 2026-08-12 at first activation smoke; the fake test client's
// select(_cols) ignored its argument entirely, so no battery could have
// caught it — closed by PK_COLUMN below, not just the symptom.
const PK_COLUMN: Record<'route_errors' | 'throttle_events', string> = {
  route_errors: 'error_id',
  throttle_events: 'throttle_id',
}

/** Shared purge body — the two exports below differ only in table name. */
async function purgeExpired(
  table: 'route_errors' | 'throttle_events',
  fnName: string,
  client?: SupabaseClient,
): Promise<{ deleted: number; error: string | null }> {
  try {
    const db = client ?? getAdminClient()
    // No service-role credentials on this deployment — honest, not silent, and
    // NOT reported as a successful zero-row purge.
    if (!db) return { deleted: 0, error: `${fnName}: admin client unavailable` }
    const { data, error } = await db
      .from(table)
      .delete()
      .lt('retain_until', new Date().toISOString())
      .select(PK_COLUMN[table])
    if (error) {
      // Table not migrated on this deployment → nothing to purge, benign no-op.
      // Deliberately the same narrow table-only classifier the writers use: a
      // missing COLUMN must surface as a real error, never as a false "purged".
      if (isMissingTableError(error)) return { deleted: 0, error: null }
      return { deleted: 0, error: `${fnName}: ${error.message}` }
    }
    return { deleted: (data as unknown[] | null)?.length ?? 0, error: null }
  } catch (e) {
    // 2026-08-10 hardening (adversarial review): `(e as Error).message` is
    // unsafe — a real rejection can carry `undefined`/`null`/a non-Error value
    // (e.g. `Promise.reject()` with no argument, or a thrown string), and
    // accessing `.message` on it throws a FRESH error from inside this catch
    // block, which nothing above wraps — it would have escaped uncaught,
    // exactly the fail-CLOSED behaviour this function exists to avoid.
    // Confirmed by direct reproduction. Matches the sibling writers' pattern.
    return { deleted: 0, error: `${fnName} threw: ${e instanceof Error ? e.message : String(e)}` }
  }
}

/** DELETE every route_errors row past its retain_until. Indexed; fail-honest. */
export async function purgeExpiredRouteErrors(
  client?: SupabaseClient,
): Promise<{ deleted: number; error: string | null }> {
  return purgeExpired('route_errors', 'purgeExpiredRouteErrors', client)
}

/** DELETE every throttle_events row past its retain_until. Indexed; fail-honest. */
export async function purgeExpiredThrottleEvents(
  client?: SupabaseClient,
): Promise<{ deleted: number; error: string | null }> {
  return purgeExpired('throttle_events', 'purgeExpiredThrottleEvents', client)
}

// Exposed for tests.
export const __test = { isMissingTableError, truncate, hashIp }
