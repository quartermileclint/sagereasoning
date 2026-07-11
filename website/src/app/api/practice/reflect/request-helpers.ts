/**
 * request-helpers.ts — pure request-body extraction for POST /api/practice/reflect.
 *
 * Built at the Sage Reflect build Stage B (Critical) session. Factored out of
 * route.ts (App Router restricts route.ts exports to HTTP handlers) so the parse is
 * importable + unit-testable. PURE — no I/O, no NextRequest.
 *
 * The accepted body (JSON):
 *   {
 *     session_id: string,        // REQUIRED — server-side session anchor / AC10 provenance
 *     agent_id:   string,        // REQUIRED — the agent the sr_assent_ credential must bind (SR-14)
 *     response?:  string,        // the agent's answer to the last surfaced step; ABSENT on the first call
 *     // On the FIRST call (response absent) the session context is REQUIRED:
 *     session_summary?: {
 *       purpose_at_open: string,
 *       circle_at_open:  'self_preservation'|'household'|'community'|'humanity'|'cosmic',
 *       role_at_open:    string,
 *       capacity_at_open: string[],
 *       sage_reasoning_passes: number
 *     },
 *     // OPTIONAL — the SR-9 / R20a Zone-3 deterministic harm signal (open call):
 *     safety_signal?: { harm_flagged: boolean, detail?: string },
 *     acts_blocked?:  [{ act: string, reason: string, category?: 'harm'|'policy'|'capability'|'other' }]
 *   }
 */

import type { SessionSummary } from '@/lib/sage-reflect/engine'
import type { SafetySignal, BlockRecord } from '@/lib/sage-reflect/zone3-boundary'

const CIRCLES = ['self_preservation', 'household', 'community', 'humanity', 'cosmic'] as const
const BLOCK_CATEGORIES = ['harm', 'policy', 'capability', 'other'] as const

/**
 * Gate-1 full-loop harness (Slice 5c, ADR-011 channel-law amendment). The PROVENANCE of the
 * agent-context supplied at OPEN — i.e. whether the `session_summary` was STATED BY THE AGENT
 * ('agent_stated', the default — the human / SDK contract) or INFERRED BY A HARNESS that observed the
 * session at close ('harness_inferred'). The Gate-1 close hook fires the agent's reflection turn
 * IN-CONVERSATION, then persists the agent's VERBATIM reflection out-of-band; it does not have the
 * agent's stated session context, so it marks the open `harness_inferred` rather than fabricate an
 * agent-stated summary. Additive + OPTIONAL: absent ⇒ null (no behaviour change for existing callers).
 */
export const CONTEXT_SOURCES = ['agent_stated', 'harness_inferred'] as const
export type ReflectContextSource = (typeof CONTEXT_SOURCES)[number]

export interface ReflectRequest {
  session_id: string
  agent_id: string
  /** undefined on the first call (open the sequence); a string when answering. */
  response?: string
  /** REQUIRED on the first call; ignored on answer calls (persisted server-side). */
  session_summary?: SessionSummary
  safety_signal?: SafetySignal
  acts_blocked?: readonly BlockRecord[]
  /** Slice-5c: provenance of the OPEN-call session_summary ('agent_stated' | 'harness_inferred').
   *  Optional; absent ⇒ undefined (persisted as null — unmarked, the existing default). Validated on
   *  any call; persisted from the OPEN call onto the session row (the answer-call value is accepted
   *  for harness callers but only the open value is the session's recorded provenance). */
  context_source?: ReflectContextSource
  /** S9b G4 (additive, OPEN-call only): the session's self-screen evidence — whether a screen
   *  (at-action examination) ran, and the session's signed assessments for the completion-time
   *  suppression-watch cross-check. Assessments are opaque here; the trust-core deriver re-verifies
   *  each (Ed25519) — a FABRICATED assessment earns nothing and suppresses nothing. DISCLOSED
   *  RESIDUAL (the PA-10 stale-artifact-replay class, fix_before_s10): a GENUINE signed assessment
   *  replayed from another session can suppress the cross-check — the verifier binds no
   *  session/agent/time; and the whole surface is self-report-gated (the A2 omission class: an
   *  agent that omits screen_evidence entirely draws no cross-check at all). MEASURE-bounded.
   *  Absent ⇒ no cross-check (byte-identical for existing callers). */
  screen_evidence?: { screen_ran: boolean; signed_assessments: readonly unknown[] }
}

export type ParsedReflectBody = { ok: true; value: ReflectRequest } | { ok: false; message: string }

function parseSessionSummary(raw: unknown): { ok: true; value: SessionSummary } | { ok: false; message: string } {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    return { ok: false, message: "Body field 'session_summary' must be an object on the first call." }
  }
  const o = raw as Record<string, unknown>
  if (typeof o.purpose_at_open !== 'string' || o.purpose_at_open.trim().length === 0) {
    return { ok: false, message: "'session_summary.purpose_at_open' must be a non-empty string." }
  }
  if (typeof o.circle_at_open !== 'string' || !(CIRCLES as readonly string[]).includes(o.circle_at_open)) {
    return { ok: false, message: "'session_summary.circle_at_open' must be one of: " + CIRCLES.join(', ') + '.' }
  }
  if (typeof o.role_at_open !== 'string' || o.role_at_open.trim().length === 0) {
    return { ok: false, message: "'session_summary.role_at_open' must be a non-empty string." }
  }
  if (!Array.isArray(o.capacity_at_open) || !o.capacity_at_open.every((c) => typeof c === 'string')) {
    return { ok: false, message: "'session_summary.capacity_at_open' must be an array of strings." }
  }
  if (typeof o.sage_reasoning_passes !== 'number' || !Number.isFinite(o.sage_reasoning_passes) || o.sage_reasoning_passes < 0) {
    return { ok: false, message: "'session_summary.sage_reasoning_passes' must be a non-negative number." }
  }
  return {
    ok: true,
    value: {
      purpose_at_open: o.purpose_at_open,
      circle_at_open: o.circle_at_open as SessionSummary['circle_at_open'],
      role_at_open: o.role_at_open,
      capacity_at_open: o.capacity_at_open as string[],
      sage_reasoning_passes: Math.trunc(o.sage_reasoning_passes),
    },
  }
}

function parseSafetySignal(raw: unknown): SafetySignal | undefined | { error: string } {
  if (raw === undefined || raw === null) return undefined
  if (typeof raw !== 'object' || Array.isArray(raw)) return { error: "'safety_signal' must be an object." }
  const o = raw as Record<string, unknown>
  if (typeof o.harm_flagged !== 'boolean') return { error: "'safety_signal.harm_flagged' must be a boolean." }
  const detail = typeof o.detail === 'string' ? o.detail : undefined
  return { harm_flagged: o.harm_flagged, detail }
}

function parseContextSource(raw: unknown): ReflectContextSource | undefined | { error: string } {
  if (raw === undefined || raw === null) return undefined
  if (typeof raw !== 'string' || !(CONTEXT_SOURCES as readonly string[]).includes(raw)) {
    return { error: "'context_source' must be one of: " + CONTEXT_SOURCES.join(', ') + '.' }
  }
  return raw as ReflectContextSource
}

function parseActsBlocked(raw: unknown): readonly BlockRecord[] | undefined | { error: string } {
  if (raw === undefined || raw === null) return undefined
  if (!Array.isArray(raw)) return { error: "'acts_blocked' must be an array." }
  const out: BlockRecord[] = []
  for (const item of raw) {
    if (typeof item !== 'object' || item === null) return { error: "'acts_blocked' entries must be objects." }
    const o = item as Record<string, unknown>
    if (typeof o.act !== 'string' || typeof o.reason !== 'string') {
      return { error: "'acts_blocked' entries must carry string 'act' and 'reason'." }
    }
    const category =
      typeof o.category === 'string' && (BLOCK_CATEGORIES as readonly string[]).includes(o.category)
        ? (o.category as BlockRecord['category'])
        : undefined
    out.push({ act: o.act, reason: o.reason, category })
  }
  return out
}

/** Validate + extract the request body. Non-leaking error messages on failure. */
export function parseReflectBody(raw: unknown): ParsedReflectBody {
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

  let response: string | undefined
  if (obj.response !== undefined && obj.response !== null) {
    if (typeof obj.response !== 'string') {
      return { ok: false, message: "Body field 'response' must be a string when present." }
    }
    if (obj.response.trim().length === 0) {
      return { ok: false, message: "Body field 'response' must not be empty; omit it to open a new session." }
    }
    response = obj.response
  }

  // session_summary REQUIRED on the first call (response absent).
  let session_summary: SessionSummary | undefined
  if (response === undefined) {
    if (obj.session_summary === undefined || obj.session_summary === null) {
      return { ok: false, message: "Body field 'session_summary' is required to open a reflection session." }
    }
    const parsed = parseSessionSummary(obj.session_summary)
    if (!parsed.ok) return { ok: false, message: parsed.message }
    session_summary = parsed.value
  }

  // Optional Zone-3 inputs (relevant on the open call).
  const safety = parseSafetySignal(obj.safety_signal)
  if (safety && 'error' in safety) return { ok: false, message: safety.error }
  const blocked = parseActsBlocked(obj.acts_blocked)
  if (blocked && 'error' in blocked) return { ok: false, message: blocked.error }

  // Optional Slice-5c provenance marker (validated on any call; persisted from the open call).
  const contextSource = parseContextSource(obj.context_source)
  if (contextSource && typeof contextSource === 'object' && 'error' in contextSource) {
    return { ok: false, message: contextSource.error }
  }

  // Optional S9b G4 screen evidence (validated shape; assessments stay opaque —
  // the trust-core deriver Ed25519-verifies each at completion; capped at 32,
  // the S8 G5 signed-assessments bound).
  let screen_evidence: { screen_ran: boolean; signed_assessments: readonly unknown[] } | undefined
  if (obj.screen_evidence !== undefined && obj.screen_evidence !== null) {
    const se = obj.screen_evidence
    if (typeof se !== 'object' || Array.isArray(se)) {
      return { ok: false, message: "Body field 'screen_evidence' must be an object when present." }
    }
    const seObj = se as Record<string, unknown>
    if (typeof seObj.screen_ran !== 'boolean') {
      return { ok: false, message: "'screen_evidence.screen_ran' must be a boolean." }
    }
    if (!Array.isArray(seObj.signed_assessments)) {
      return { ok: false, message: "'screen_evidence.signed_assessments' must be an array." }
    }
    if (seObj.signed_assessments.length > 32) {
      return { ok: false, message: "'screen_evidence.signed_assessments' must carry at most 32 entries." }
    }
    screen_evidence = {
      screen_ran: seObj.screen_ran,
      signed_assessments: seObj.signed_assessments,
    }
  }

  return {
    ok: true,
    value: {
      session_id: obj.session_id,
      agent_id: obj.agent_id,
      response,
      session_summary,
      safety_signal: safety as SafetySignal | undefined,
      acts_blocked: blocked as readonly BlockRecord[] | undefined,
      context_source: contextSource as ReflectContextSource | undefined,
      screen_evidence,
    },
  }
}
