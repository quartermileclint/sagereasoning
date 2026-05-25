/**
 * http-client.ts — thin fetch wrapper for the whole-system harness.
 *
 * Captures HTTP status + parsed JSON body for every call. Used ONLY by the
 * LIVE run path (founder-performed against the standing TEST env). Build-only
 * mode never calls these — it runs the bridge tsx step against a synthetic
 * fixture, so no network and no secrets are involved.
 *
 * Per-endpoint auth (verified by code-read 2026-05-24, diagnostic-certain):
 *   - POST /api/reason             → header  X-Api-Key: <api key>     (agent-dev surface)
 *   - POST /api/accreditation/[id] → header  Authorization: Bearer sr_assent_<token>
 *   - GET  /api/public-key         → no auth (public)
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

/** GET /api/public-key (public) — confirm the env serves the TEST key
 *  (guards the "false 403" trap: a prod key here means the env is mis-set). */
export async function getPublicKey<T = unknown>(baseUrl: string): Promise<HttpResult<T>> {
  const res = await fetch(`${stripTrailingSlash(baseUrl)}/api/public-key`, { method: 'GET' })
  return readResult<T>(res)
}
