/**
 * response-builders.ts — pure NextResponse builders for POST /api/practice/reflect.
 *
 * Built at the Sage Reflect build Stage B (Critical) session. Factored out of
 * route.ts (Next.js App Router restricts route.ts exports to HTTP method handlers)
 * so the status→HTTP mapping is importable + unit-testable. PURE — no I/O.
 *
 * COMPLIANCE (mirrors the Sage Calling response-builders posture):
 *  • R3 (disclaimer): every body carries `disclaimer` + the X-Sage-Reflect-Disclaimer header.
 *  • R9 (no outcome promises): the product describes trajectory, never predicts results.
 *  • R18e (Article-50 transparency): every response carries
 *    `interaction_type: 'stoic-post-action-reflection'` + the X-Sage-Reflect-Interaction header.
 *  • R4 (engine internals stay closed): the builders surface only RESULTS — the
 *    verbatim question text, a coarse status, and (at completion) the profile
 *    read-back + the mirror note. NEVER the engine's rules, the response-shape
 *    classifier, the FD thresholds, the passion-classification logic, or the
 *    scrutiny-flag cross-product routing.
 *  • R19d (mirror principle): the completion body always carries `mirror_note`.
 *  • R20a (Zone-3): the boundary body states the product is NOT a crisis pathway.
 *  • Non-leaking failures: 401/503 messages are intentionally vague.
 */

import { NextResponse } from 'next/server'
import type { ReflectDecision } from '@/lib/sage-reflect/reflect-service'
import type { SafetySignal } from '@/lib/substrate/r20a-gate'

export const DOCUMENTATION_URL = 'https://sagereasoning.com/limitations'

/** R18e — the interaction is unambiguously this, not a general consultation. */
export const INTERACTION_TYPE = 'stoic-post-action-reflection'

/** R3 + R9 — one framework; evaluates reasoning grounding, not outcomes. */
export const SAGE_REFLECT_DISCLAIMER =
  'Sage Reflect applies one philosophical framework (Stoic post-action reflection) ' +
  'to review a completed session. It evaluates the grounding of the reasoning that ' +
  'produced the actions — not whether the task succeeded by external metrics. It ' +
  'measures observable reasoning patterns, not inner states, and describes ' +
  'trajectory; it does not promise outcomes. Other frameworks exist and may reach ' +
  'different conclusions. This is not a crisis or safety pathway.'

/** Base headers on every response: no-store, CORS, and the R3 + R18e headers. */
export const REFLECT_RESPONSE_HEADERS: Record<string, string> = {
  'Content-Type': 'application/json',
  'Cache-Control': 'no-store',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Loop-Id',
  'X-Sage-Reflect-Disclaimer': 'One Stoic framework; evaluates reasoning grounding; measures patterns not inner states; does not promise outcomes.',
  'X-Sage-Reflect-Interaction': INTERACTION_TYPE,
}

function build(status: number, payload: Record<string, unknown>, loopHeaders?: Record<string, string>): NextResponse {
  return NextResponse.json(
    {
      ...payload,
      interaction_type: INTERACTION_TYPE,
      disclaimer: SAGE_REFLECT_DISCLAIMER,
      documentation_url: DOCUMENTATION_URL,
    },
    { status, headers: { ...REFLECT_RESPONSE_HEADERS, ...(loopHeaders ?? {}) } },
  )
}

// ============================================================================
// SEQUENCE RESPONSES (200) — verbatim question text + coarse status only (R4)
// ============================================================================

/** A surfaced reflection question (Q1–Q6). `question_id` is the sequence position
 *  (NOT a variant/rule — R4). Verbatim default + sub-questions are surfaced.
 *
 *  Option A (2026-05-28 session 3): when the substrate-gate catch detected mild
 *  distress on the inbound `response` text, `safetySignal` is supplied and
 *  attached to the outward shape as `safety_signal` (additive; never replaces
 *  an existing field). Mild signal does NOT halt the six-question sequence —
 *  it is an informational carrier for downstream stages (Sage Assent feed
 *  threading is later-session work). */
export function buildQuestionResponse(
  session_id: string,
  question_id: string,
  question: string,
  subquestions: readonly string[],
  mandatory_subquestions: readonly string[],
  loopHeaders?: Record<string, string>,
  safetySignal?: SafetySignal,
): NextResponse {
  return build(
    200,
    {
      status: 'in_progress',
      session_id,
      step: question_id,
      question,
      subquestions,
      mandatory_subquestions,
      ...(safetySignal ? { safety_signal: safetySignal } : {}),
    },
    loopHeaders,
  )
}

/** The FD-R1 null-suspicion test prompt (a question to the agent; R4-safe verbatim).
 *
 *  Option A: optional `safetySignal` carrier per buildQuestionResponse. */
export function buildFabricationTestResponse(
  session_id: string,
  question: string,
  loopHeaders?: Record<string, string>,
  safetySignal?: SafetySignal,
): NextResponse {
  return build(
    200,
    {
      status: 'in_progress',
      session_id,
      step: 'verification',
      question,
      ...(safetySignal ? { safety_signal: safetySignal } : {}),
    },
    loopHeaders,
  )
}

/** An RS-4 supporting question (deterministic ladder; verbatim text only).
 *
 *  Option A: optional `safetySignal` carrier per buildQuestionResponse. */
export function buildSupportingQuestionResponse(
  session_id: string,
  ladder_index: number,
  question: string,
  loopHeaders?: Record<string, string>,
  safetySignal?: SafetySignal,
): NextResponse {
  return build(
    200,
    {
      status: 'in_progress',
      session_id,
      step: 'supporting',
      ladder_index,
      question,
      ...(safetySignal ? { safety_signal: safetySignal } : {}),
    },
    loopHeaders,
  )
}

/**
 * Completion — surface the RESULTS only (R4): the exit path, the profile read-back
 * (grade/proximity/dimensions/direction from the Sage Assent engine, never written
 * by hand), the per-domain proximity, the developer note, the Sage Calling trigger
 * (when present), the scrutiny-flag types+details (NOT their internal cross-product
 * routing), and the MANDATORY mirror note (R19d).
 *
 * Option A: optional `safetySignal` carrier per buildQuestionResponse.
 */
export function buildCompleteResponse(
  session_id: string,
  decision: Extract<ReflectDecision, { kind: 'complete' }>,
  loopHeaders?: Record<string, string>,
  safetySignal?: SafetySignal,
): NextResponse {
  const { outcome, feed, mirror_note } = decision
  return build(
    200,
    {
      status: 'complete',
      session_id,
      exit_path: outcome.exit_path,
      profile_update_confidence: outcome.profile_update_confidence,
      // Scrutiny flags: surface type + detail (developer-facing); the internal
      // cross_product_target routing is NOT surfaced (R4).
      scrutiny_flags: outcome.scrutiny_flags.map((f) => ({ type: f.type, detail: f.detail })),
      developer_note: outcome.developer_note,
      sage_calling_trigger: outcome.sage_calling_trigger,
      // Profile read-back from the Sage Assent engine (results, not internals).
      profile: feed
        ? {
            senecan_grade: feed.senecan_grade,
            typical_proximity: feed.typical_proximity,
            katorthoma_proximity_by_domain: feed.per_domain_proximity,
            dimension_levels: feed.dimension_levels,
            direction_of_travel: feed.direction_of_travel,
            grade_changed: feed.grade_changed,
          }
        : null,
      // R19d — mirror principle, mandatory, always present.
      profile_update_framing: { mandatory_note: mirror_note },
      ...(safetySignal ? { safety_signal: safetySignal } : {}),
    },
    loopHeaders,
  )
}

/** SR-9 / R20a Zone-3 — the boundary engaged; the session was flagged, not reflected.
 *
 *  The existing developer-declared harm path (engaged on developer-supplied
 *  `safety_signal.harm_flagged: true` OR an `acts_blocked` entry with
 *  `category: 'harm'`). Code-path unchanged. */
export function buildZone3Response(
  session_id: string,
  developer_note: string,
  loopHeaders?: Record<string, string>,
): NextResponse {
  return build(
    200,
    {
      status: 'flagged',
      session_id,
      developer_note,
      message:
        'This session was flagged for significant harm. Sage Reflect is not a crisis ' +
        'pathway: it has recorded the failure and flagged it for the developer, and has ' +
        'not engaged philosophical reflection on the harm. Route harm handling through ' +
        'your own safety process.',
    },
    loopHeaders,
  )
}

// ============================================================================
// OPTION A — R20a SUBSTRATE-GATE DISTRESS REDIRECT (developer-form payload)
//
// Added 2026-05-28 per /drafts/2026-05-28-r20a-single-catch-contract.md §5.3.
// Mirrors the Calling-side buildCallingDistressRedirectResponse from session 2.
//
// When the substrate-gate catch fires REDIRECT (moderate/acute distress
// detected on the agent's inbound `response`), Reflect's six-question
// sequence is halted; the engine's answerReflection does NOT run; no persist;
// no metering on the loop (the R20a Haiku cost is tracked separately via the
// existing r20a-cost-tracker on the substrate side).
//
// The agent operator receives:
//   - distress_detected: true
//   - severity: 'moderate' | 'acute'
//   - developer_note: standing developer-facing message (this is NOT a
//                     crisis pathway; route through your own safety/
//                     escalation process)
//   - suggested_user_message: the substrate's redirect_message, surfaced
//                     separately so the agent MAY relay it through its
//                     own safety pipeline
//   - flow_terminated: true (Reflect's six-question sequence is halted;
//                      no further turns will advance the engine)
//   - safety_signal: the canonical cross-seam carrier
//
// HONEST LIMITATION (per design §3.5): the exact wording of developer_note
// and suggested_user_message is A6 design work (the per-consumer prose_mode
// keys r20a_developer_note + r20a_suggested_user_message). Until A6 runs,
// this builder uses placeholder text drawn from ZONE3_DEVELOPER_NOTE
// (developer note) and the substrate's redirect_message (suggested user
// message). A6 formalises the wording.
//
// DISTINCT FROM buildZone3Response: that one handles developer-declared
// harm (an upstream signal that the session itself involved a harmful act).
// THIS builder handles substrate-detected distress in the agent's
// conversational content on this turn. They are different mechanisms with
// different developer-facing semantics; both can engage in the same session
// (Zone-3 at open via developer signal; substrate-gate at any answer turn).
//
// Rules served: R20a (vulnerable user detection); R19c (placeholder honestly
// named); AC2 (~500ms classifier accepted); AC4 (invocation-tested); AC5
// (perimeter tenth route); PR1 (single-endpoint proof); PR3 (synchronous);
// PR15 (reuses A7 + the canonical SafetySignal).
// ============================================================================

/** PLACEHOLDER per design §3.5 — formalised by A6 (r20a_developer_note). */
const REFLECT_R20A_DEVELOPER_NOTE_PLACEHOLDER =
  'Sage Reflect R20a substrate-gate engaged: the agent response on this turn ' +
  'contained language indicating acute psychological distress in the underlying ' +
  'user. Sage Reflect is not a crisis pathway — it has halted this reflection ' +
  'sequence, will NOT advance the six-question engine for this turn, and has ' +
  'deliberately NOT attempted philosophical reflection on the distress. Route ' +
  'the underlying user-distress handling through your own safety and escalation ' +
  'process; if you wish to relay a user-facing message, the suggested_user_message ' +
  'field below contains a non-engaging crisis pass-through. This is distinct from ' +
  'the developer-declared-harm Zone-3 boundary (status="flagged") and engages on ' +
  'substrate-detected distress in the agent\'s conversational content, not on a ' +
  'developer-supplied harm signal.'

/** Build the developer-form REDIRECT response (substrate-gate distress catch). */
export function buildReflectDistressRedirectResponse(
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
      developer_note: REFLECT_R20A_DEVELOPER_NOTE_PLACEHOLDER,
      suggested_user_message,
      flow_terminated: true,
      safety_signal: safetySignal,
    },
    loopHeaders,
  )
}

// ============================================================================
// ERROR RESPONSES
// ============================================================================

/** 503 — the global SAGE_REFLECT_ENABLED flag is off (the master kill switch). */
export function buildReflectFlagDisabledResponse(): NextResponse {
  return build(503, { status: 'error', message: 'Sage Reflect is not currently enabled. Please try again later.' })
}

/** 401 — the auth gate rejected the request (single status for every token failure). */
export function buildReflectUnauthorizedResponse(): NextResponse {
  return build(401, { status: 'error', message: 'Unauthorized.' })
}

/** 400 — body validation failed. */
export function buildReflectBadRequestResponse(message: string): NextResponse {
  return build(400, { status: 'error', message })
}

/** 404 — a response was supplied for a session that does not exist. */
export function buildReflectNotFoundResponse(): NextResponse {
  return build(404, {
    status: 'error',
    message: 'No reflection session found for that session_id. Omit "response" (and supply session_summary) to begin a new session.',
  })
}

/** 409 — an advance was attempted against a completed session / no pending question. */
export function buildReflectConflictResponse(message: string): NextResponse {
  return build(409, { status: 'error', message })
}

/** 503 — Supabase / billing-infra / LLM failure. Vague (non-leaking); not cached. */
export function buildReflectServerErrorResponse(): NextResponse {
  return build(503, {
    status: 'error',
    message: 'The Sage Reflect service is temporarily unavailable. Please try again shortly.',
  })
}
