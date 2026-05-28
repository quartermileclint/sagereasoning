/**
 * response-builders.ts — pure NextResponse builders for POST /api/calling and
 * its admin approval route.
 *
 * Built at the Sage Calling build Stage 2 — the Critical public-surface half.
 * Factored out of route.ts (Next.js App Router restricts route.ts exports to the
 * HTTP method handlers — see the accreditation route's HOTFIX NOTE) so the
 * status→HTTP mapping is importable + unit-testable. PURE — no I/O.
 *
 * COMPLIANCE
 *  • R3 (disclaimer always present): every response body carries `disclaimer`
 *    AND the X-Sage-Calling-Disclaimer header.
 *  • R9 (no outcome promises): the disclaimer states the product evaluates the
 *    grounding of purpose and does not promise outcomes (a null is a clean result).
 *  • R18e (Article-50 transparency): every response carries
 *    `interaction_type: 'stoic-purpose-discovery'` AND the X-Sage-Calling-
 *    Interaction header — the interaction is unambiguously a Stoic-grounded
 *    purpose-discovery sequence, not a general consultation.
 *  • R4 (engine internals stay closed): NONE of these builders ever emit the
 *    variant, the selection rule, or the epistemic signals. Only the verbatim
 *    question / clarification text and the coarse status reach the agent.
 *  • Non-leaking failures: 401/403/503 messages are intentionally vague.
 */

import { NextResponse } from 'next/server'
import type { GateStatus, Outcome } from '@/lib/sage-calling/session-store'
import type { DiscoveredPurpose } from '@/lib/translation-sandwich/layer1-extractor'
import type { SafetySignal } from '@/lib/substrate/r20a-gate'

export const DOCUMENTATION_URL = 'https://sagereasoning.com/limitations'

/** R18e — the interaction is unambiguously this, not a general consultation. */
export const INTERACTION_TYPE = 'stoic-purpose-discovery'

/** R3 + R9 — one framework, one question; evaluates grounding, not outcomes. */
export const SAGE_CALLING_DISCLAIMER =
  'Sage Calling applies one philosophical framework (Stoic purpose-finding) to one ' +
  'question: identifying fitting work for an agent instructed to find a purpose but ' +
  'given no specific task. Other frameworks exist and may reach different conclusions. ' +
  'This is a Stoic-grounded purpose-discovery sequence, not a general consultation. ' +
  'It evaluates the grounding of purpose; it does not promise outcomes — a clean null ' +
  'result is a valid outcome.'

/** Base headers on every response: no-store, CORS, and the R3 + R18e headers. */
export const CALLING_RESPONSE_HEADERS: Record<string, string> = {
  'Content-Type': 'application/json',
  'Cache-Control': 'no-store',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Loop-Id',
  'X-Sage-Calling-Disclaimer': 'One Stoic framework; evaluates grounding of purpose; does not promise outcomes.',
  'X-Sage-Calling-Interaction': INTERACTION_TYPE,
}

// ============================================================================
// INTERNAL — assemble a JSON response with the standing fields + headers
// ============================================================================

function build(
  status: number,
  payload: Record<string, unknown>,
  loopHeaders?: Record<string, string>,
): NextResponse {
  return NextResponse.json(
    {
      ...payload,
      interaction_type: INTERACTION_TYPE,
      disclaimer: SAGE_CALLING_DISCLAIMER,
      documentation_url: DOCUMENTATION_URL,
    },
    {
      status,
      headers: { ...CALLING_RESPONSE_HEADERS, ...(loopHeaders ?? {}) },
    },
  )
}

// ============================================================================
// SUCCESS / SEQUENCE RESPONSES (200) — only the verbatim text + coarse status
// ============================================================================

/** A surfaced question. `stage` is the sequence position (NOT the variant — R4).
 *  `question` is the only engine output exposed.
 *
 *  Option A (2026-05-28): when the substrate-gate catch detected mild distress
 *  on the inbound `response` text, `safetySignal` is supplied and attached to
 *  the outward shape as `safety_signal` (additive; never replaces an existing
 *  field). Mild signal does NOT halt the conversation — it is an informational
 *  carrier for downstream stages (the DiscoveredPurpose envelope-threading is
 *  Session 4 work). */
export function buildQuestionResponse(
  session_id: string,
  stage: string,
  question: string,
  loopHeaders?: Record<string, string>,
  safetySignal?: SafetySignal,
): NextResponse {
  return build(
    200,
    {
      status: 'in_progress',
      session_id,
      stage,
      question,
      ...(safetySignal ? { safety_signal: safetySignal } : {}),
    },
    loopHeaders,
  )
}

/** Q5 complete → the Hard Gate. The five-spec handoff is PAUSED; nothing has
 *  been handed off. No five-spec content is surfaced here (D-14).
 *
 *  Option A: optional `safetySignal` carrier per buildQuestionResponse. */
export function buildHardGateResponse(
  session_id: string,
  loopHeaders?: Record<string, string>,
  safetySignal?: SafetySignal,
): NextResponse {
  return build(
    200,
    {
      status: 'awaiting_approval',
      session_id,
      message:
        'A purpose has been identified. The five-specification handoff into the substrate ' +
        'is paused at the Hard Gate and will NOT fire until an external developer/operator ' +
        'explicitly approves this session. No handoff has occurred.',
      ...(safetySignal ? { safety_signal: safetySignal } : {}),
    },
    loopHeaders,
  )
}

/** A genuine null → the developer-facing clarification template (verbatim).
 *
 *  Option A: optional `safetySignal` carrier per buildQuestionResponse. */
export function buildNullResultResponse(
  session_id: string,
  clarification: string,
  loopHeaders?: Record<string, string>,
  safetySignal?: SafetySignal,
): NextResponse {
  return build(
    200,
    {
      status: 'null_result',
      session_id,
      clarification,
      ...(safetySignal ? { safety_signal: safetySignal } : {}),
    },
    loopHeaders,
  )
}

// ============================================================================
// OPTION A — R20a SUBSTRATE-GATE DISTRESS REDIRECT (developer-form payload)
//
// Added 2026-05-28 per /drafts/2026-05-28-r20a-single-catch-contract.md
// §3 (audience contract: agent_developer) + §4 (canonical SafetySignal).
//
// When the substrate-gate catch fires REDIRECT (moderate/acute distress
// detected on the agent's inbound `response`), the Calling conversation
// halts; Calling's normal engine work does NOT run; no persist; no metering
// on the loop (the R20a Haiku cost is tracked separately via the existing
// r20a-cost-tracker). The agent operator receives:
//
//   - distress_detected: true
//   - severity: 'moderate' | 'acute'
//   - developer_note: standing developer-facing message (this is NOT a
//                     crisis pathway; route through your own safety/
//                     escalation process)
//   - suggested_user_message: the existing human pass-through, surfaced
//                     separately so the agent MAY relay it through its
//                     own safety pipeline
//   - flow_terminated: true (the Calling flow is halted; no further
//                      turns will advance the engine)
//   - safety_signal: the canonical cross-seam carrier
//
// HONEST LIMITATION (per design §3.5): the exact wording of developer_note
// and suggested_user_message is A6 design work (the per-consumer prose_mode
// keys r20a_developer_note + r20a_suggested_user_message). Until A6 runs,
// this builder uses placeholder text drawn from ZONE3_DEVELOPER_NOTE
// (developer note) and the substrate's redirect_message (suggested user
// message). A6 formalises the wording.
//
// Rules served: R20a (vulnerable user detection); R19c (honest limitations
// — placeholder marked); AC2 (~500ms classifier accepted); AC4 (invocation-
// tested); AC5 (perimeter ninth route); PR1 (single-endpoint proof); PR3
// (synchronous); PR15 (reuses A7).
// ============================================================================

/** PLACEHOLDER per design §3.5 — formalised by A6 (r20a_developer_note). */
const CALLING_R20A_DEVELOPER_NOTE_PLACEHOLDER =
  'Sage Calling R20a substrate-gate engaged: the agent response on this turn ' +
  'contained language indicating acute psychological distress in the underlying ' +
  'user. Sage Calling is not a crisis pathway — it has halted this discovery ' +
  'session, will NOT advance the engine for this turn, and has deliberately NOT ' +
  'attempted philosophical reflection on the distress. Route the underlying ' +
  'user-distress handling through your own safety and escalation process; if ' +
  'you wish to relay a user-facing message, the suggested_user_message field ' +
  'below contains a non-engaging crisis pass-through.'

/** Build the developer-form REDIRECT response. */
export function buildCallingDistressRedirectResponse(
  session_id: string,
  severity: 'moderate' | 'acute',
  suggested_user_message: string,
  safetySignal: SafetySignal,
  loopHeaders?: Record<string, string>,
): NextResponse {
  return build(
    200,
    {
      status: 'redirected',
      session_id,
      distress_detected: true,
      severity,
      developer_note: CALLING_R20A_DEVELOPER_NOTE_PLACEHOLDER,
      suggested_user_message,
      flow_terminated: true,
      safety_signal: safetySignal,
    },
    loopHeaders,
  )
}

/** D-12 holding pattern: re-surface Q6 Variant A (innermost-circle attention).
 *  NOT a loop to Q1; NOT a repeat of the clarification. */
export function buildHoldingResponse(
  session_id: string,
  question: string,
): NextResponse {
  return build(200, {
    status: 'holding',
    session_id,
    question,
    message:
      'The clarification has already been sent once (Epictetus: once and precisely). ' +
      'Attending to operational integrity while awaiting a developer response. Supply ' +
      'new context by starting a new session.',
  })
}

/** D-12 holding pattern elapsed (timeout). The developer should start a new
 *  session with clarified context. */
export function buildTimedOutResponse(session_id: string): NextResponse {
  return build(200, {
    status: 'timed_out',
    session_id,
    message:
      'This discovery session timed out with no developer response within the holding-pattern ' +
      'window. Start a new session with clarified context to proceed.',
  })
}

/** A re-call against a session that has already reached a found terminal (the
 *  Hard Gate). Reports the gate state without advancing or re-billing. */
export function buildTerminalStatusResponse(
  session_id: string,
  gateStatus: GateStatus,
  outcome: Outcome | null,
): NextResponse {
  return build(200, {
    status: gateStatus, // 'awaiting_approval' | 'approved' | 'blocked'
    session_id,
    outcome,
    message:
      'This discovery session has completed; no further responses are accepted. ' +
      'The Hard Gate state is reported above.',
  })
}

// ============================================================================
// ERROR RESPONSES
// ============================================================================

/** 503 — the global SAGE_CALLING_ENABLED flag is off (the master kill switch). */
export function buildCallingFlagDisabledResponse(): NextResponse {
  return build(503, {
    status: 'error',
    message: 'Sage Calling is not currently enabled. Please try again later.',
  })
}

/** 401 — the auth gate rejected the request. Single status for every token
 *  failure mode (no information leak); the audit log records the specific reason. */
export function buildCallingUnauthorizedResponse(): NextResponse {
  return build(401, { status: 'error', message: 'Unauthorized.' })
}

/** 400 — body validation failed (missing/empty session_id, agent_id, etc.). */
export function buildCallingBadRequestResponse(message: string): NextResponse {
  return build(400, { status: 'error', message })
}

/** 404 — a response was supplied for a session that does not exist. */
export function buildCallingNotFoundResponse(): NextResponse {
  return build(404, {
    status: 'error',
    message: 'No discovery session found for that session_id. Omit "response" to begin a new session.',
  })
}

/** 409 — an advance was attempted against a session whose current step is not a
 *  question (already terminal). */
export function buildCallingConflictResponse(message: string): NextResponse {
  return build(409, { status: 'error', message })
}

/** 503 — Supabase or billing-infra failure. Vague (non-leaking); not cached. */
export function buildCallingServerErrorResponse(): NextResponse {
  return build(503, {
    status: 'error',
    message: 'The Sage Calling service is temporarily unavailable. Please try again shortly.',
  })
}

// ============================================================================
// APPROVE-ROUTE RESPONSES (admin Hard-Gate approval; D-14)
// ============================================================================

/** 200 — the admin approved (or blocked) the session. On approve, the
 *  five-specification discovered_purpose is RETURNED to the developer (the
 *  handoff artefact), built only here on the approved path (D-5/D-14). */
export function buildApproveSuccessResponse(
  session_id: string,
  decision: 'approve' | 'block',
  discoveredPurpose?: DiscoveredPurpose,
): NextResponse {
  const gateStatus: GateStatus = decision === 'approve' ? 'approved' : 'blocked'
  return build(200, {
    status: 'ok',
    session_id,
    gate_status: gateStatus,
    ...(decision === 'approve' && discoveredPurpose
      ? { discovered_purpose: discoveredPurpose }
      : {}),
    message:
      decision === 'approve'
        ? 'Session approved. The five-specification handoff is released to the developer.'
        : 'Session blocked. No handoff will fire for this session.',
  })
}

/** 404 — no session for that session_id. */
export function buildApproveNotFoundResponse(): NextResponse {
  return build(404, { status: 'error', message: 'No discovery session found for that session_id.' })
}

/** 409 — the session is not at the Hard Gate (not awaiting_approval), so there
 *  is nothing to approve. */
export function buildApproveConflictResponse(currentGate: GateStatus): NextResponse {
  return build(409, {
    status: 'error',
    message:
      `This session is not awaiting approval (current gate state: ${currentGate}). ` +
      'Only a session paused at the Hard Gate (awaiting_approval) can be approved or blocked.',
  })
}

/** 503 — Supabase failure on the approval path. */
export function buildApproveServerErrorResponse(): NextResponse {
  return build(503, {
    status: 'error',
    message: 'The Sage Calling service is temporarily unavailable. Please try again shortly.',
  })
}
