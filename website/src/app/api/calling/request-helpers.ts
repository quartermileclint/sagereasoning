/**
 * request-helpers.ts — pure request-body extraction for POST /api/calling.
 *
 * Built at the Sage Calling build Stage 2 — the Critical public-surface half.
 * Factored out of route.ts (which may only export HTTP method handlers — see
 * route.ts's HOTFIX NOTE, mirrored from the accreditation route) so the parse
 * is importable + unit-testable. PURE — no I/O, no NextRequest.
 *
 * The accepted body (JSON):
 *   {
 *     session_id:     string,    // REQUIRED — D-2 server-side session anchor / AC10 provenance
 *     agent_id:       string,    // REQUIRED — the agent identity the sr_assent_ credential must bind (D-6)
 *     response?:      string,    // the agent's answer to the last surfaced question; ABSENT on the first call
 *     agent_card_url?: string,   // OPTIONAL — D-13 verifiable A2A card (https only; fetched + verified by the route)
 *     // available_tools is DECLINED (D-13) — ignored if present (unverifiable; the MCP tool-poisoning vector)
 *   }
 */

export interface CallingRequest {
  session_id: string
  agent_id: string
  /** undefined on the first call (open the sequence); a string when answering. */
  response?: string
  /** undefined when not supplied. The route fetches + verifies it (D-13). */
  agent_card_url?: string
  /** True when the (declined) available_tools field was present — logged, never used. */
  available_tools_present: boolean
}

export type ParsedCallingBody =
  | { ok: true; value: CallingRequest }
  | { ok: false; message: string }

/**
 * Validate + extract the request body shape. Returns a typed CallingRequest or a
 * non-leaking error message. `session_id` and `agent_id` are required non-empty
 * strings; `response` and `agent_card_url` are optional strings. `available_tools`
 * is explicitly DECLINED — its presence is recorded so the route can log that it
 * was ignored, but it is never read.
 */
export function parseCallingBody(raw: unknown): ParsedCallingBody {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    return { ok: false, message: 'Request body must be a JSON object.' }
  }
  const obj = raw as Record<string, unknown>

  if (typeof obj.session_id !== 'string' || obj.session_id.trim().length === 0) {
    return { ok: false, message: "Body field 'session_id' must be a non-empty string." }
  }
  if (typeof obj.agent_id !== 'string' || obj.agent_id.trim().length === 0) {
    return { ok: false, message: "Body field 'agent_id' must be a non-empty string." }
  }

  // response — optional; when present must be a string. An explicitly empty
  // string is rejected (an answer must carry content); omit it to open / re-fetch.
  let response: string | undefined
  if (obj.response !== undefined && obj.response !== null) {
    if (typeof obj.response !== 'string') {
      return { ok: false, message: "Body field 'response' must be a string when present." }
    }
    if (obj.response.trim().length === 0) {
      return { ok: false, message: "Body field 'response' must not be empty; omit it to open or re-fetch." }
    }
    response = obj.response
  }

  // agent_card_url — optional; when present must be a string. Scheme (https) is
  // validated by the route's verifier (isHttpsUrl) before any fetch.
  let agent_card_url: string | undefined
  if (obj.agent_card_url !== undefined && obj.agent_card_url !== null) {
    if (typeof obj.agent_card_url !== 'string' || obj.agent_card_url.trim().length === 0) {
      return { ok: false, message: "Body field 'agent_card_url' must be a non-empty string when present." }
    }
    agent_card_url = obj.agent_card_url.trim()
  }

  return {
    ok: true,
    value: {
      session_id: obj.session_id,
      agent_id: obj.agent_id,
      response,
      agent_card_url,
      available_tools_present: obj.available_tools !== undefined,
    },
  }
}

// ============================================================================
// APPROVE-ROUTE BODY (admin Hard-Gate approval; D-14)
// ============================================================================

export interface ApproveRequest {
  session_id: string
  decision: 'approve' | 'block'
}

export type ParsedApproveBody =
  | { ok: true; value: ApproveRequest }
  | { ok: false; message: string }

/** Validate the admin approval body: { session_id, decision: 'approve'|'block' }. */
export function parseApproveBody(raw: unknown): ParsedApproveBody {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    return { ok: false, message: 'Request body must be a JSON object.' }
  }
  const obj = raw as Record<string, unknown>
  if (typeof obj.session_id !== 'string' || obj.session_id.trim().length === 0) {
    return { ok: false, message: "Body field 'session_id' must be a non-empty string." }
  }
  if (obj.decision !== 'approve' && obj.decision !== 'block') {
    return { ok: false, message: "Body field 'decision' must be 'approve' or 'block'." }
  }
  return { ok: true, value: { session_id: obj.session_id, decision: obj.decision } }
}
