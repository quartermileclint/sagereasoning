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
 *  (NOT a variant/rule — R4). Verbatim default + sub-questions are surfaced. */
export function buildQuestionResponse(
  session_id: string,
  question_id: string,
  question: string,
  subquestions: readonly string[],
  mandatory_subquestions: readonly string[],
  loopHeaders?: Record<string, string>,
): NextResponse {
  return build(
    200,
    { status: 'in_progress', session_id, step: question_id, question, subquestions, mandatory_subquestions },
    loopHeaders,
  )
}

/** The FD-R1 null-suspicion test prompt (a question to the agent; R4-safe verbatim). */
export function buildFabricationTestResponse(
  session_id: string,
  question: string,
  loopHeaders?: Record<string, string>,
): NextResponse {
  return build(200, { status: 'in_progress', session_id, step: 'verification', question }, loopHeaders)
}

/** An RS-4 supporting question (deterministic ladder; verbatim text only). */
export function buildSupportingQuestionResponse(
  session_id: string,
  ladder_index: number,
  question: string,
  loopHeaders?: Record<string, string>,
): NextResponse {
  return build(200, { status: 'in_progress', session_id, step: 'supporting', ladder_index, question }, loopHeaders)
}

/**
 * Completion — surface the RESULTS only (R4): the exit path, the profile read-back
 * (grade/proximity/dimensions/direction from the Sage Assent engine, never written
 * by hand), the per-domain proximity, the developer note, the Sage Calling trigger
 * (when present), the scrutiny-flag types+details (NOT their internal cross-product
 * routing), and the MANDATORY mirror note (R19d).
 */
export function buildCompleteResponse(
  session_id: string,
  decision: Extract<ReflectDecision, { kind: 'complete' }>,
  loopHeaders?: Record<string, string>,
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
    },
    loopHeaders,
  )
}

/** SR-9 / R20a Zone-3 — the boundary engaged; the session was flagged, not reflected. */
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
