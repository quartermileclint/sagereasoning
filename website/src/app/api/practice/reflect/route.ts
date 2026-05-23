/**
 * POST /api/practice/reflect — Sage Reflect post-action reflection endpoint (SR-13).
 *
 * Built at the Sage Reflect build Stage B (Critical) session. Wires the VERIFIED
 * deterministic engine (sage-reflect/engine.ts) + store (session-store.ts) + the
 * translation-sandwich (reflect-extractor.ts) + the SR-9/R20a Zone-3 boundary
 * (zone3-boundary.ts) + the Sage Assent feed (sage-assent-feed.ts) into an
 * A10-authenticated, metered, kill-switched public surface — OFF by default behind
 * SAGE_REFLECT_ENABLED. Orchestration lives in sage-reflect/reflect-service.ts;
 * this route is auth + flag + metering + parse + response-mapping (mirrors the
 * Sage Calling route — PR1/PR15 reuse of the proven pattern).
 *
 * GOVERNING DESIGN: /adopted/sage-reflect-product-design.md
 *   SR-13 (route + global SAGE_REFLECT_ENABLED kill switch; 503 until flipped) ·
 *   SR-14 (reuse A10 sr_assent_ creds, UNSCOPED) · SR-9 (Zone-3 boundary at open) ·
 *   SR-6 (deterministic control flow + Sonnet Layer-1 Q1–Q4) · SR-4 (Sage Assent feed).
 *
 * AUTH (SR-14, AC7): the SAME A10 per-agent sr_assent_ bearer credential as Sage
 * Calling, UNSCOPED (no CarriedProfile). validateSageAssentWriteToken hashes the token,
 * looks up the ACTIVE sage_assent_write row, and checks it binds the body's agent_id. Every
 * failure collapses to a single 401 (no info leak); the audit log records the reason.
 *
 * KILL SWITCH (SR-13): if SAGE_REFLECT_ENABLED !== 'true' the endpoint returns 503
 * BEFORE auth. Unset/"false" fails closed. No redeploy needed to disable.
 *
 * METERING (R5): each billable stage call records ONE Option-D loop. Q1–Q4 answers
 * carry the Sonnet extraction cost; Q5/Q6/FD-R1/RS-4 + the open call cost 0 (base
 * rate). Metering runs AFTER the (≤1) extraction and BEFORE the persist (via the
 * service's meter callback) so a billing failure is safely retryable. A resumed
 * stage with the same X-Loop-Id dedups (duplicate_loop_id → no-op).
 *
 * R4: only the verbatim question text + a coarse status (+ at completion the
 * profile read-back + the mirror note) reach the agent — never the engine rules,
 * the FD thresholds, the response-shape classifier, or the scrutiny cross-routing.
 * R3/R9/R18e: every response carries the disclaimer + interaction_type (builders).
 *
 * KG1: every Supabase + billing call is awaited; failures fail closed (503). The
 * engine + store + extractor + feed are DIRECT imports — no endpoint self-calls.
 */

import { NextRequest, NextResponse } from 'next/server'

import {
  checkRateLimit,
  RATE_LIMITS,
  validateSageAssentWriteToken,
  logSageAssentVerifyEvent,
  SAGE_ASSENT_WRITE_TOKEN_PREFIX,
  type SageAssentVerifyEvent,
} from '@/lib/security'

import { computeLoopBill } from '@/lib/stripe'
import { recordLoopBilling, buildLoopHeaders, extractLoopId, generateLoopId } from '@/lib/loop-cost-tracker'
import { incrementReflectCostMicrocents, centsToMicrocents } from '@/lib/sage-reflect/reflect-cost-tracker'
import { MODEL_DEEP } from '@/lib/model-config'

import { getSession } from '@/lib/sage-reflect/session-store'
import {
  openReflection,
  answerReflection,
  peekReflection,
  type MeterFn,
  type ServiceResult,
} from '@/lib/sage-reflect/reflect-service'

import { parseReflectBody } from './request-helpers'
import {
  buildQuestionResponse,
  buildFabricationTestResponse,
  buildSupportingQuestionResponse,
  buildCompleteResponse,
  buildZone3Response,
  buildReflectFlagDisabledResponse,
  buildReflectUnauthorizedResponse,
  buildReflectBadRequestResponse,
  buildReflectNotFoundResponse,
  buildReflectConflictResponse,
  buildReflectServerErrorResponse,
  REFLECT_RESPONSE_HEADERS,
} from './response-builders'

/** Metering surface — same Option-D surface as Sage Calling (wrapper-internal). */
const REFLECT_METERING_SURFACE = 'wrapper_internal' as const

// ============================================================================
// AUTH GATE (SR-14) — token only; the global flag is a separate pre-check
// ============================================================================

type ReflectAuthResult = { ok: true; credentialId: string } | { ok: false }

async function verifyReflectToken(request: NextRequest, agent_id: string): Promise<ReflectAuthResult> {
  const startTime = Date.now()
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? request.headers.get('x-real-ip') ?? null

  const emit = (
    outcome: SageAssentVerifyEvent['outcome'],
    fields: { credential_id?: string | null; scope_downstream_identity_model?: string | null; scope_path_posture?: string | null } = {},
  ): void => {
    logSageAssentVerifyEvent({
      kind: 'sage_assent_verify',
      agent_id,
      outcome,
      credential_id: fields.credential_id ?? null,
      scope_downstream_identity_model: fields.scope_downstream_identity_model ?? null,
      scope_path_posture: fields.scope_path_posture ?? null,
      supplied_downstream_identity_model: null,
      supplied_path_posture: null,
      ip,
      elapsed_ms: Date.now() - startTime,
      timestamp: new Date().toISOString(),
    })
  }

  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith(`Bearer ${SAGE_ASSENT_WRITE_TOKEN_PREFIX}`)) {
    emit('no_token')
    return { ok: false }
  }
  const rawToken = authHeader.slice(7).trim()

  // SR-14: reuse the credential as-is — UNSCOPED (no CarriedProfile).
  const result = await validateSageAssentWriteToken(rawToken, agent_id, undefined)
  if (!result.valid) {
    emit(result.reason)
    return { ok: false }
  }
  emit('ok', {
    credential_id: result.credential_id,
    scope_downstream_identity_model: result.scope_downstream_identity_model,
    scope_path_posture: result.scope_path_posture,
  })
  return { ok: true, credentialId: result.credential_id }
}

// ============================================================================
// METER FACTORY (R5) — one Option-D loop per billable stage call
// ============================================================================

function makeMeter(loopId: string, apiKeyId: string, agentId: string): MeterFn {
  return async (rawCostCents: number) => {
    // The increment_api_usage RPC stores INTEGER cents — round at the billing
    // boundary (loop-cost-tracker convention). A sub-cent Layer-1 cost rounds to 0,
    // billing the loop at base rate (the Sage Calling posture). `rawCostCents > 0`
    // still records that an LLM call happened (internalCalls / modelsUsed).
    const costCents = Math.round(rawCostCents)
    const calledModel = rawCostCents > 0
    const bill = computeLoopBill(costCents)
    const now = new Date()
    const persist = await recordLoopBilling({
      apiKeyId,
      loopId,
      agentId,
      surface: REFLECT_METERING_SURFACE,
      baseCents: bill.base_cents,
      thresholdCents: bill.threshold_cents,
      overageCents: bill.overage_cents,
      overageFired: bill.overage_fired,
      totalCents: bill.total_cents,
      anthropicCostCents: costCents,
      internalCalls: calledModel ? 1 : 0,
      totalInputTokens: 0,
      totalOutputTokens: 0,
      modelsUsed: calledModel ? [MODEL_DEEP] : [],
      endpoint: 'other',
      year: now.getUTCFullYear(),
      month: now.getUTCMonth() + 1,
      day: now.getUTCDate(),
    })
    const headers = buildLoopHeaders({
      loopId,
      overageFired: bill.overage_fired,
      overageCents: bill.overage_cents,
      totalCents: bill.total_cents,
    })
    if (!persist.ok) {
      if (persist.error.kind === 'duplicate_loop_id') return { ok: true, headers } // resume — no double-bill
      console.error('[api/practice/reflect] meter RPC failed:', persist.error.message)
      return { ok: false }
    }
    // A2 (R5, PR7): record the MICROCENT-precise cost for the cost-health metric,
    // decoupled from the (unchanged) integer-cents bill above. Fail-soft — never
    // blocks the response. Reached only after the bill persists and NOT on a resume
    // (the duplicate_loop_id case returns early above), so no double-count. Base /
    // deterministic stages cost 0 → centsToMicrocents(0) = 0 → no-op write.
    if (calledModel) {
      await incrementReflectCostMicrocents(centsToMicrocents(rawCostCents), {
        surface: REFLECT_METERING_SURFACE,
        year: now.getUTCFullYear(),
        month: now.getUTCMonth() + 1,
      })
    }
    return { ok: true, headers }
  }
}

// ============================================================================
// SERVICE RESULT → HTTP
// ============================================================================

function respond(session_id: string, result: ServiceResult): NextResponse {
  if (!result.ok) {
    if (result.code === 'not_found') return buildReflectNotFoundResponse()
    if (result.code === 'conflict') return buildReflectConflictResponse('This reflection session has no pending question to answer.')
    // Surface the specific server-error reason to Vercel logs (observability):
    // 'extraction failed: …' (Layer-1 Sonnet), 'decrypt failed: …', 'metering failed',
    // or a store error. The client still gets the vague non-leaking 503 (R4).
    console.error('[api/practice/reflect] server error:', result.error)
    return buildReflectServerErrorResponse()
  }
  const { decision, loop_headers } = result.value
  switch (decision.kind) {
    case 'question':
      return buildQuestionResponse(session_id, decision.question, decision.text, decision.subquestions, decision.mandatory_subquestions, loop_headers)
    case 'fabrication_test':
      return buildFabricationTestResponse(session_id, decision.text, loop_headers)
    case 'supporting_question':
      return buildSupportingQuestionResponse(session_id, decision.ladder_index, decision.text, loop_headers)
    case 'complete':
      return buildCompleteResponse(session_id, decision, loop_headers)
    case 'zone3_blocked':
      return buildZone3Response(session_id, decision.developer_note, loop_headers)
  }
}

// ============================================================================
// POST
// ============================================================================

export async function POST(request: NextRequest): Promise<NextResponse> {
  // 1. Rate limit.
  const rateLimitError = checkRateLimit(request, RATE_LIMITS.publicAgent)
  if (rateLimitError) return rateLimitError

  // 2. Global kill switch (SR-13) — BEFORE auth. Fail closed.
  if (process.env.SAGE_REFLECT_ENABLED !== 'true') {
    return buildReflectFlagDisabledResponse()
  }

  // 3. Parse body (agent_id needed for auth, so parse precedes auth).
  let rawBody: unknown = null
  try {
    rawBody = await request.json()
  } catch {
    return buildReflectBadRequestResponse('Request body is not valid JSON.')
  }
  const parsed = parseReflectBody(rawBody)
  if (!parsed.ok) return buildReflectBadRequestResponse(parsed.message)
  const { session_id, agent_id, response, session_summary, safety_signal, acts_blocked } = parsed.value

  // 4. Auth gate (SR-14, AC7) — single 401 on any failure.
  const auth = await verifyReflectToken(request, agent_id)
  if (!auth.ok) return buildReflectUnauthorizedResponse()

  // 5. Loop id for metering (AC10 provenance).
  const loopId = extractLoopId(request) ?? generateLoopId()
  const meter = makeMeter(loopId, auth.credentialId, agent_id)

  try {
    // ----- No response: open a new session OR re-fetch an in-progress one -----
    if (response === undefined) {
      const existing = await getSession(session_id)
      if (!existing.ok) return buildReflectServerErrorResponse()

      if (existing.value === null) {
        // First call — session_summary is guaranteed by the parser here.
        if (!session_summary) return buildReflectBadRequestResponse("Body field 'session_summary' is required to open a reflection session.")
        const result = await openReflection(
          { session_id, agent_id, session_summary, safety_signal, acts_blocked },
          undefined,
          meter,
        )
        return respond(session_id, result)
      }

      // Existing session, no response → re-fetch (no meter; pure read).
      const peek = await peekReflection(session_id)
      if (!peek.ok) return peek.code === 'not_found' ? buildReflectNotFoundResponse() : buildReflectServerErrorResponse()
      if (peek.status === 'complete') {
        return buildReflectConflictResponse('This reflection session is complete; no further responses are accepted.')
      }
      // Re-surface the pending step (no loop headers — not billed).
      return respond(session_id, { ok: true, value: { decision: peek.decision, billable_cost_cents: 0, loop_headers: {} } })
    }

    // ----- Response supplied: advance the sequence -----
    const result = await answerReflection(session_id, response, undefined, meter)
    return respond(session_id, result)
  } catch (err) {
    console.error('[api/practice/reflect] unexpected error:', err)
    return buildReflectServerErrorResponse()
  }
}

// ============================================================================
// OPTIONS / method guards
// ============================================================================

export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, { status: 204, headers: REFLECT_RESPONSE_HEADERS })
}

function methodNotAllowed(): NextResponse {
  return NextResponse.json(
    { status: 'error', message: 'Method not allowed. This endpoint accepts POST and OPTIONS.' },
    { status: 405, headers: { ...REFLECT_RESPONSE_HEADERS, Allow: 'POST, OPTIONS' } },
  )
}

export async function GET(): Promise<NextResponse> {
  return methodNotAllowed()
}
export async function PUT(): Promise<NextResponse> {
  return methodNotAllowed()
}
export async function DELETE(): Promise<NextResponse> {
  return methodNotAllowed()
}
export async function PATCH(): Promise<NextResponse> {
  return methodNotAllowed()
}
