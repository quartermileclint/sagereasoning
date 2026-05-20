/**
 * request-helpers.ts — pure request-body extraction helpers for the
 * /api/accreditation/[agent_id] write path (A10 build, 2026-05-21).
 *
 * Factored out of route.ts (which may only export HTTP method handlers — see
 * route.ts's HOTFIX NOTE) so they are importable + unit-testable, mirroring how
 * the pure response-builders were factored into ./response-builders.ts.
 *
 * Both functions are PURE (no I/O, no request object) — extractWriteExtras takes
 * the already-read X-Loop-Id header value rather than the NextRequest, so it can
 * be exercised directly in tests.
 */

/**
 * Extract the CarriedProfile scope subset (downstream_identity_model +
 * path_posture) from the already-parsed request body, for the auth-gate scope
 * check. Returns undefined when the body or profile is malformed or carries
 * neither field — validateAtlWriteToken then fails closed for any scoped
 * credential.
 */
export function extractCarriedProfileForAuth(
  rawBody: unknown,
): { downstream_identity_model?: string; path_posture?: string } | undefined {
  if (typeof rawBody !== 'object' || rawBody === null) return undefined
  const profile = (rawBody as Record<string, unknown>).profile
  if (typeof profile !== 'object' || profile === null) return undefined
  const p = profile as Record<string, unknown>
  const dim = typeof p.downstream_identity_model === 'string' ? p.downstream_identity_model : undefined
  const pp = typeof p.path_posture === 'string' ? p.path_posture : undefined
  if (dim === undefined && pp === undefined) return undefined
  return { downstream_identity_model: dim, path_posture: pp }
}

/**
 * Extract per-write extras for persistence. loop_id (Decision 2 — forensic JOIN
 * traceability to loop_billing_events) comes from the X-Loop-Id header value
 * (primary, per §Option D billing) or a top-level body.loop_id fallback. A10
 * does NOT write loop_billing_events itself; this only stamps the trace id onto
 * the agent_accreditation row.
 *
 * @param headerLoopId  the X-Loop-Id header value (or null), read by the caller
 * @param rawBody       the already-parsed request body
 */
export function extractWriteExtras(
  headerLoopId: string | null,
  rawBody: unknown,
): { loop_id?: string | null } {
  let bodyLoopId: string | null = null
  if (typeof rawBody === 'object' && rawBody !== null) {
    const v = (rawBody as Record<string, unknown>).loop_id
    if (typeof v === 'string') bodyLoopId = v
  }
  return { loop_id: headerLoopId ?? bodyLoopId ?? null }
}
