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
// S4 (D-R20A-OPTIONA-S4-AUDIENCE-RENDERING-WIRED-2026-05-28): the
// distress-redirect builder below is refactored to a thin wrapper over the
// audience-correct render helper. Per /drafts/2026-05-28-r20a-single-catch-
// contract.md §3.3 — the helper is the single source of truth for the
// agent_developer wire shape; the per-surface placeholder constant is retired
// and the developer_note text is now the formalised R20A_DEVELOPER_NOTE_DEFAULT.
import { renderR20aRedirectResponse } from '@/lib/substrate/r20a-audience-renderer'

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
// Added 2026-05-28 (S2 — Calling-side wiring) per /drafts/2026-05-28-r20a-
// single-catch-contract.md §3 (audience contract: agent_developer) + §4
// (canonical SafetySignal).
//
// S4 REFACTOR (2026-05-28, D-R20A-OPTIONA-S4-AUDIENCE-RENDERING-WIRED-2026-05-28):
// This builder is now a thin wrapper over the audience-correct render helper
// renderR20aRedirectResponse (in /website/src/lib/substrate/r20a-audience-
// renderer.ts). The helper is the single source of truth for the agent_developer
// wire shape; this builder only adds Calling's surface-specific fields
// (session_id, interaction_type, disclaimer, documentation_url via the build()
// helper) and standing headers.
//
// The per-surface placeholder constant CALLING_R20A_DEVELOPER_NOTE_PLACEHOLDER
// is RETIRED; the developer_note text is now sourced from the formalised
// R20A_DEVELOPER_NOTE_DEFAULT prose-mode key (per design §3.5; A6 wording
// drafted in S4 and surfaced for founder review).
//
// When the substrate-gate catch fires REDIRECT (moderate/acute distress
// detected on the agent's inbound `response`), the Calling conversation
// halts; Calling's normal engine work does NOT run; no persist; no metering
// on the loop (the R20a Haiku cost is tracked separately via the existing
// r20a-cost-tracker). The agent operator receives:
//
//   - status: 'redirected'
//   - distress_detected: true
//   - severity: 'moderate' | 'acute'
//   - developer_note: R20A_DEVELOPER_NOTE_DEFAULT (the formalised audience-
//                     correct standing string from the render helper)
//   - suggested_user_message: the substrate's existing redirect_message
//                     (resource-list-included), surfaced separately so the
//                     agent MAY relay it through its own safety pipeline
//   - flow_terminated: true
//   - safety_signal: the canonical cross-seam carrier
//   - session_id: Calling-specific
//   - interaction_type: 'stoic-purpose-discovery' (Calling-specific via build())
//   - disclaimer, documentation_url: standing (via build())
//
// Wire-shape change vs S2: the developer_note text changes from the per-surface
// placeholder to the shared R20A_DEVELOPER_NOTE_DEFAULT. Structurally
// identical otherwise (same field set, same types, same status).
//
// Rules served: R20a (vulnerable user detection); R19c (placeholder retired —
// formalised wording in place); AC2 (~500ms classifier accepted); AC4
// (invocation-tested); AC5 (perimeter unchanged at 10 routes — existing
// surface modified); PR1 (single-endpoint proof complete); PR3 (synchronous);
// PR15 (reuses A7 + the canonical SafetySignal + the new render helper — no
// primitive rebuilt).
// ============================================================================

/** Build the developer-form REDIRECT response. Thin wrapper over the
 *  audience-correct render helper. */
export function buildCallingDistressRedirectResponse(
  session_id: string,
  severity: 'moderate' | 'acute',
  suggested_user_message: string,
  safetySignal: SafetySignal,
  loopHeaders?: Record<string, string>,
): NextResponse {
  // Render via the audience-correct helper. The helper returns the
  // R20aAgentDeveloperRedirectPayload shape (status, distress_detected,
  // severity, developer_note, suggested_user_message, flow_terminated,
  // safety_signal). Calling's session_id is merged in; the build() helper
  // adds the standing fields (interaction_type, disclaimer, documentation_url)
  // and standing headers.
  const payload = renderR20aRedirectResponse({
    audience: 'agent_developer',
    severity,
    redirect_message: suggested_user_message,
    safetySignal,
  })
  return build(
    200,
    {
      session_id,
      ...payload,
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
