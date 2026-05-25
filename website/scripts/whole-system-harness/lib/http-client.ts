/**
 * http-client.ts — thin fetch wrapper for the whole-system harness.
 *
 * Captures HTTP status + parsed JSON body for every call. Used ONLY by the
 * LIVE run path (founder-performed against the standing TEST env). Build-only
 * mode never calls these — it runs the bridge tsx step against a synthetic
 * fixture, so no network and no secrets are involved.
 *
 * Per-endpoint auth (verified by code-read 2026-05-24 / 2026-05-25, diagnostic-certain):
 *   - POST /api/reason             → header  X-Api-Key: <api key>     (agent-dev surface)
 *   - POST /api/accreditation/[id] → header  Authorization: Bearer sr_assent_<token>
 *   - POST /api/calling            → header  Authorization: Bearer sr_assent_<token>  (D-6 reuse)
 *   - POST /api/practice/reflect   → header  Authorization: Bearer sr_assent_<token>  (SR-14 reuse)
 *   - GET  /api/public-key         → no auth (public)
 *
 * postCalling / postReflect were added 2026-05-25 for the L1–L6 build (founder
 * "clean scenarios first" election). Both reuse the SAME A10 sr_assent_ bearer
 * credential as the accreditation write path — verified against the route files
 * /api/calling/route.ts (verifyCallingToken) and /api/practice/reflect/route.ts
 * (verifyReflectToken): both call validateSageAssentWriteToken UNSCOPED.
 *
 * Uses the global fetch built into Node 22 — no dependency added (PR15).
 */

export interface HttpResult<T = unknown> {
  status: number
  ok: boolean
  body: T | null
  rawText: string
}

function stripTrailingSlash(url: string): string {
  return url.replace(/\/+$/, '')
}

async function readResult<T>(res: Response): Promise<HttpResult<T>> {
  const rawText = await res.text()
  let body: T | null = null
  try {
    body = rawText ? (JSON.parse(rawText) as T) : null
  } catch {
    body = null
  }
  return { status: res.status, ok: res.ok, body, rawText }
}

async function postJson<T = unknown>(
  url: string,
  payload: unknown,
  headers: Record<string, string>
): Promise<HttpResult<T>> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(payload),
  })
  return readResult<T>(res)
}

/** POST /api/reason with the API-key (X-Api-Key) auth path. */
export function postReason<T = unknown>(
  baseUrl: string,
  apiKey: string,
  payload: { input: string; context?: string; domain_context?: string; depth?: string }
): Promise<HttpResult<T>> {
  return postJson<T>(`${stripTrailingSlash(baseUrl)}/api/reason`, payload, {
    'X-Api-Key': apiKey,
  })
}

/** POST /api/accreditation/[agent_id] with the sr_assent_ bearer write token. */
export function postAccreditation<T = unknown>(
  baseUrl: string,
  assentToken: string,
  agentId: string,
  body: unknown
): Promise<HttpResult<T>> {
  return postJson<T>(
    `${stripTrailingSlash(baseUrl)}/api/accreditation/${encodeURIComponent(agentId)}`,
    body,
    { Authorization: `Bearer ${assentToken}` }
  )
}

/**
 * POST /api/calling with the sr_assent_ bearer (D-6 reuse, UNSCOPED).
 *
 * Body shape (parseCallingBody): { session_id, agent_id, response?, agent_card_url? }.
 * Omit `response` to open / re-fetch a session; supply it to answer the last
 * surfaced question. The endpoint is kill-switched behind SAGE_CALLING_ENABLED
 * (503 when off) — checked BEFORE auth.
 */
export function postCalling<T = unknown>(
  baseUrl: string,
  assentToken: string,
  body: {
    session_id: string
    agent_id: string
    response?: string
    agent_card_url?: string
  }
): Promise<HttpResult<T>> {
  return postJson<T>(`${stripTrailingSlash(baseUrl)}/api/calling`, body, {
    Authorization: `Bearer ${assentToken}`,
  })
}

/**
 * POST /api/practice/reflect with the sr_assent_ bearer (SR-14 reuse, UNSCOPED).
 *
 * Body shape (parseReflectBody): { session_id, agent_id, response?, session_summary?,
 * safety_signal?, acts_blocked? }. On the FIRST call (no `response`) session_summary
 * is REQUIRED. Supply `response` to answer the last surfaced step. The endpoint is
 * kill-switched behind SAGE_REFLECT_ENABLED (503 when off) — checked BEFORE auth.
 */
export function postReflect<T = unknown>(
  baseUrl: string,
  assentToken: string,
  body: {
    session_id: string
    agent_id: string
    response?: string
    session_summary?: unknown
    safety_signal?: unknown
    acts_blocked?: unknown
  }
): Promise<HttpResult<T>> {
  return postJson<T>(`${stripTrailingSlash(baseUrl)}/api/practice/reflect`, body, {
    Authorization: `Bearer ${assentToken}`,
  })
}

/** GET /api/public-key (public) — confirm the env serves the TEST key
 *  (guards the "false 403" trap: a prod key here means the env is mis-set). */
export async function getPublicKey<T = unknown>(baseUrl: string): Promise<HttpResult<T>> {
  const res = await fetch(`${stripTrailingSlash(baseUrl)}/api/public-key`, { method: 'GET' })
  return readResult<T>(res)
}
