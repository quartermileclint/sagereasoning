/**
 * POST /api/calling — Sage Calling public purpose-discovery endpoint (D-2).
 *
 * Built at the Sage Calling build Stage 2 — the Critical public-surface half
 * (/operations/handoffs/founder/2026-05-21-sage-calling-stage2-endpoint-NEXT-SESSION-PROMPT.md).
 * Wires the verified deterministic engine (engine.ts) + the verified store
 * (session-store.ts) into an A10-authenticated, metered, kill-switched public
 * surface, off by default behind SAGE_CALLING_ENABLED.
 *
 * GOVERNING DESIGN: /adopted/purpose-discovery-product-design.md
 *   D-2 (server-side session, single endpoint) · D-6 (reuse A10 sr_assent_ creds) ·
 *   D-8 (each stage call = one Option D loop; no double-bill on resume) ·
 *   D-12 (post-clarification holding pattern; 24h; new context = new session) ·
 *   D-13 (optional agent_card_url; decline available_tools) ·
 *   D-14 (Hard Gate before handoff + global SAGE_CALLING_ENABLED kill switch).
 *
 * REQUEST (JSON):
 *   { session_id, agent_id, response?, agent_card_url? }   // available_tools declined
 *
 * AUTH (D-6, AC7): the SAME A10 per-agent sr_assent_ bearer credential as the
 * accreditation write path. validateSageAssentWriteToken hashes the token, looks up the
 * ACTIVE sage_assent_write row, and checks it binds the supplied agent_id. Every failure
 * collapses to a single 401 (no information leak); the audit log records the
 * specific reason. Sage Calling supplies NO CarriedProfile (D-6 "reuse as-is, no
 * discovery scope"), so a SCOPED credential would fail wrong_scope — Sage Calling
 * is used with an unscoped sage_assent_write credential.
 *
 * KILL SWITCH (D-14): if SAGE_CALLING_ENABLED !== 'true' the whole endpoint
 * returns 503 BEFORE auth — the SUBSTRATE_WRITE_PATH_ENABLED analogue. Unset/"false"
 * fails closed. No redeploy needed to disable: unset the flag in Vercel.
 *
 * METERING (D-8): each billable stage call records ONE Option D loop via the
 * existing loop-cost-tracker (surface 'wrapper_internal', endpoint 'other'). The
 * engine makes NO LLM call, so anthropic cost is 0 and the loop bills at base.
 * A resumed stage with the SAME X-Loop-Id is NOT re-billed: recordLoopBilling
 * returns duplicate_loop_id (the (api_key_id, loop_id) uniqueness), which we treat
 * as a no-op (NOT a 400). Metering runs BEFORE persistence so a persist retry with
 * the same loop_id dedups the bill. Terminal-status / holding-pattern reads are
 * NOT metered (no engine compute, no new loop).
 *
 * HARD GATE (D-14): a hard_gate decision persists gate_status='awaiting_approval',
 * outcome='found'. The five-spec handoff MUST NOT fire here — only the admin
 * approval route (POST /api/calling/approve) flips the gate to 'approved' and
 * builds the discovered_purpose. No five-spec is exposed at the gate.
 *
 * R4: only the verbatim question / clarification text + a coarse status reach the
 * agent — never the variant, the selection rule, or the epistemic signals.
 * R3/R9/R18e: every response carries the disclaimer + interaction_type (see
 * response-builders.ts).
 *
 * KG1 (Vercel five rules): every Supabase + billing call is awaited; errors are
 * surfaced (503), never fire-and-forget. NO endpoint self-calls — the engine +
 * store are direct imports. The optional Agent Card fetch is the only outbound
 * network call (HTTPS, bounded timeout) and never an LLM call (PR4 N/A).
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
import {
  isUpcCapabilityAuthEnabled,
  UNIFIED_PRACTICE_CREDENTIAL_PREFIX,
} from '@/lib/practice-credential'

import {
  getSession,
  createSession,
  persistTurn,
} from '@/lib/sage-calling/session-store'

import {
  computeAdvance,
  coldOpen,
  currentStep,
  holdingPatternState,
  holdingPatternQuestion,
  SAGE_CALLING_METERING_SURFACE,
} from '@/lib/sage-calling/calling-service'

import { verifyAgentCard, isHttpsUrl, type FetchedCard } from '@/lib/sage-calling/agent-card'
import type { DiscoveredPurposeRole } from '@/lib/translation-sandwich/layer1-extractor'

// Option A build arc, Session 2 (2026-05-28) — substrate-gate R20a catch on
// /api/calling. Per /drafts/2026-05-28-r20a-single-catch-contract.md §5.2.
// Imports MUST appear at the top of the file even before they are used in the
// handler body, so the AC5 ninth-route registry assertion (substrate-gate
// pattern in r20a-invocation-guard.test.ts) can grep them out of the source.
import {
  enforceLayer2R20aGate,
  isCallingR20aEnabled,
  type SafetySignal,
} from '@/lib/substrate/r20a-gate'

import { computeLoopBill } from '@/lib/stripe'
import {
  recordLoopBilling,
  buildLoopHeaders,
  extractLoopId,
  generateLoopId,
} from '@/lib/loop-cost-tracker'

import { parseCallingBody } from './request-helpers'

import {
  buildQuestionResponse,
  buildHardGateResponse,
  buildNullResultResponse,
  buildHoldingResponse,
  buildTimedOutResponse,
  buildTerminalStatusResponse,
  buildCallingFlagDisabledResponse,
  buildCallingUnauthorizedResponse,
  buildCallingBadRequestResponse,
  buildCallingNotFoundResponse,
  buildCallingConflictResponse,
  buildCallingServerErrorResponse,
  buildCallingDistressRedirectResponse,
  CALLING_RESPONSE_HEADERS,
} from './response-builders'

// ============================================================================
// AUTH GATE (token only — the global flag is a separate pre-check)
// ============================================================================

type CallingAuthResult =
  | { ok: true; credentialId: string }
  | { ok: false }

/**
 * Validate the A10 sr_assent_ bearer credential against the body's agent_id (D-6).
 * Emits ONE sage_assent_verify audit event (reusing the accreditation route's shape).
 * Every failure mode returns { ok: false } → the route maps it to a single 401.
 *
 * Sage Calling passes NO CarriedProfile, so a scoped credential fails wrong_scope.
 */
async function verifyCallingToken(request: NextRequest, agent_id: string): Promise<CallingAuthResult> {
  const startTime = Date.now()
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    null

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
  // Bearer-only (constraint 7). Accept the legacy sr_assent_ prefix always; accept
  // the unified sr_prac_ prefix only when the UPC flag is ON (flag-off byte-identical).
  const assentPrefixOk = !!authHeader?.startsWith(`Bearer ${SAGE_ASSENT_WRITE_TOKEN_PREFIX}`)
  const upcPrefixOk =
    isUpcCapabilityAuthEnabled() &&
    !!authHeader?.startsWith(`Bearer ${UNIFIED_PRACTICE_CREDENTIAL_PREFIX}`)
  if (!assentPrefixOk && !upcPrefixOk) {
    emit('no_token')
    return { ok: false }
  }
  const rawToken = (authHeader as string).slice(7).trim()

  // D-6: reuse the credential as-is — no CarriedProfile / discovery scope. UPC: this
  // surface requires the 'calling' capability (the 4th arg is ignored when flag OFF).
  const result = await validateSageAssentWriteToken(rawToken, agent_id, undefined, 'calling')
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
// METERING (D-8) — one Option D loop per billable stage call; resume = no-op
// ============================================================================

type MeterResult =
  | { ok: true; headers: Record<string, string> }
  | { ok: false } // billing-infra failure → the route returns 503 (fail-closed, KG1)

/**
 * Record one Sage Calling stage call as an Option D loop. Zero LLM cost → bills
 * at base. A duplicate (api_key_id, loop_id) — a resumed stage that did no new
 * compute — is treated as a NO-OP (NOT a 400), per D-8. Any other RPC failure
 * fails closed (the route returns 503; billing is load-bearing per KG1).
 */
async function meterStageCall(loopId: string, apiKeyId: string, agentId: string): Promise<MeterResult> {
  const bill = computeLoopBill(0) // no internal LLM calls → base rate only
  const now = new Date()
  const persist = await recordLoopBilling({
    apiKeyId,
    loopId,
    agentId,
    surface: SAGE_CALLING_METERING_SURFACE,
    baseCents: bill.base_cents,
    thresholdCents: bill.threshold_cents,
    overageCents: bill.overage_cents,
    overageFired: bill.overage_fired,
    totalCents: bill.total_cents,
    anthropicCostCents: 0,
    internalCalls: 0,
    totalInputTokens: 0,
    totalOutputTokens: 0,
    modelsUsed: [],
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
    if (persist.error.kind === 'duplicate_loop_id') {
      // Resumed stage, same loop_id, no new compute → already billed. No-op.
      return { ok: true, headers }
    }
    // Billing infra unavailable — fail closed (do not silently lose the bill).
    console.error('[api/calling] meterStageCall RPC failed:', persist.error.message)
    return { ok: false }
  }
  return { ok: true, headers }
}

// ============================================================================
// OPTIONAL AGENT CARD (D-13) — fetch over HTTPS + verify; never trusted at face value
// ============================================================================

const AGENT_CARD_FETCH_TIMEOUT_MS = 3000

/**
 * Fetch + verify an optional Agent Card and RETURN its chosen-role hint (E#1).
 * A verified card yields 'chosen_role' (the card IS the agent's formal A2A
 * commitment — the chosen-role persona); an absent/unverified/spoofed card yields
 * null. The hint feeds ONLY the five-spec assembly (built later, on approval) — it
 * never substitutes for the agent's own response and is never trusted at face
 * value (D-13/R18d). Failures are non-fatal: a bad/spoofed/unreachable card simply
 * yields null and the role defaults downstream (degrade to today's behaviour).
 * The actual fetch happens here (I/O); the verdict logic is the pure
 * verifyAgentCard.
 */
async function fetchAndVerifyAgentCard(url: string): Promise<DiscoveredPurposeRole | null> {
  // The verdict is verified at session time so a spoof/poison attempt is logged
  // here; E#1 persists the returned role hint at session-open (createSession) so
  // the approval path's discovered_purpose assembly reflects a verified card.
  if (!isHttpsUrl(url)) {
    console.log(JSON.stringify({ kind: 'sage_calling_agent_card', verified: false, reason: 'not_https' }))
    return null
  }
  let fetched: FetchedCard
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), AGENT_CARD_FETCH_TIMEOUT_MS)
    const res = await fetch(url, { signal: controller.signal, redirect: 'error' })
    clearTimeout(timer)
    let body: unknown = null
    try {
      body = await res.json()
    } catch {
      body = null
    }
    fetched = { ok: true, status: res.status, body }
  } catch (e) {
    fetched = { ok: false, error: (e as Error).message }
  }
  const verdict = verifyAgentCard(url, fetched)
  // R4: the verdict is engine-internal; only logged, never surfaced to the agent.
  console.log(JSON.stringify({ kind: 'sage_calling_agent_card', verified: verdict.verified, reason: verdict.reason }))
  return verdict.role_hint
}

// ============================================================================
// POST
// ============================================================================

export async function POST(request: NextRequest): Promise<NextResponse> {
  // 1. Rate limit (30 req/min/IP — same posture as the accreditation route).
  const rateLimitError = checkRateLimit(request, RATE_LIMITS.publicAgent)
  if (rateLimitError) return rateLimitError

  // 2. Global kill switch (D-14) — checked BEFORE auth. Fail closed.
  if (process.env.SAGE_CALLING_ENABLED !== 'true') {
    return buildCallingFlagDisabledResponse()
  }

  // 3. Parse the body (agent_id is needed to run the auth gate, so the parse
  //    precedes auth). session_id + agent_id are public contract, not secrets.
  let rawBody: unknown = null
  try {
    rawBody = await request.json()
  } catch {
    return buildCallingBadRequestResponse('Request body is not valid JSON.')
  }
  const parsed = parseCallingBody(rawBody)
  if (!parsed.ok) {
    return buildCallingBadRequestResponse(parsed.message)
  }
  const { session_id, agent_id, response, agent_card_url, available_tools_present } = parsed.value

  // 4. Auth gate (D-6, AC7) — single 401 on any failure.
  const auth = await verifyCallingToken(request, agent_id)
  if (!auth.ok) return buildCallingUnauthorizedResponse()

  // 5. Optional Agent Card (D-13): fetch + verify (logged; never trusted). A
  //    verified card yields a 'chosen_role' hint, persisted at session-open (E#1,
  //    cold-open createSession below) so the approval path's five-spec assembly
  //    reflects it instead of defaulting to 'individual_nature'. The declined
  //    available_tools is logged as ignored (D-13).
  if (available_tools_present) {
    console.log(JSON.stringify({ kind: 'sage_calling_declined_field', field: 'available_tools' }))
  }
  let agentCardRoleHint: DiscoveredPurposeRole | null = null
  if (agent_card_url) {
    agentCardRoleHint = await fetchAndVerifyAgentCard(agent_card_url)
  }

  // 6. Loop id for metering (AC10 provenance). Header or server-generated.
  const loopId = extractLoopId(request) ?? generateLoopId()

  try {
    const existingResult = await getSession(session_id)
    if (!existingResult.ok) return buildCallingServerErrorResponse()
    const existing = existingResult.value

    // ----------------------------------------------------------------------
    // CASE A — no response supplied (open a new session OR re-fetch / status)
    // ----------------------------------------------------------------------
    if (response === undefined) {
      if (existing === null) {
        // First call — create + return the cold open (Q1/A). Bind the agent.
        // E#1: persist the verified Agent-Card chosen-role hint (null if none) in
        // the SAME insert — no extra write, no new failure mode.
        const created = await createSession(session_id, agent_id, agentCardRoleHint)
        if (!created.ok) return buildCallingServerErrorResponse()
        const meter = await meterStageCall(loopId, auth.credentialId, agent_id)
        if (!meter.ok) return buildCallingServerErrorResponse()
        const step = coldOpen()
        // coldOpen is always a Q1/A question.
        if (step.kind !== 'question') return buildCallingServerErrorResponse()
        return buildQuestionResponse(session_id, step.stage, step.text, meter.headers)
      }

      // Existing session, no response → status read / re-fetch.
      if (existing.outcome === 'found') {
        // Terminal (Hard Gate). Report the gate state; do NOT meter.
        return buildTerminalStatusResponse(session_id, existing.gate_status, existing.outcome)
      }
      if (existing.outcome === 'null_result') {
        // D-12 holding pattern. Do NOT meter, do NOT loop to Q1, do NOT repeat
        // the clarification. New context = a NEW session_id (D-11/PR7 defers
        // in-session re-injection).
        const hp = holdingPatternState(existing.completed_at)
        return hp === 'timed_out'
          ? buildTimedOutResponse(session_id)
          : buildHoldingResponse(session_id, holdingPatternQuestion())
      }
      // In progress → re-surface the current pending question (a stage call).
      const step = currentStep(existing.response_history)
      if (step.kind !== 'question') {
        // Defensive: in-progress row whose engine step is terminal but not yet
        // finalised. Treat as a conflict rather than silently advance.
        return buildCallingConflictResponse('This session has no pending question to answer.')
      }
      const meter = await meterStageCall(loopId, auth.credentialId, agent_id)
      if (!meter.ok) return buildCallingServerErrorResponse()
      return buildQuestionResponse(session_id, step.stage, step.text, meter.headers)
    }

    // ----------------------------------------------------------------------
    // CASE B — response supplied (advance the sequence)
    // ----------------------------------------------------------------------
    if (existing === null) {
      // Cannot answer a question for a session that does not exist.
      return buildCallingNotFoundResponse()
    }
    if (existing.outcome === 'found') {
      // Completed (Hard Gate). No further responses; report the gate state.
      return buildTerminalStatusResponse(session_id, existing.gate_status, existing.outcome)
    }
    if (existing.outcome === 'null_result') {
      // Completed clean null. Per D-12, a response does not re-run the sequence
      // (in-session re-injection deferred). Hold or report timeout.
      const hp = holdingPatternState(existing.completed_at)
      return hp === 'timed_out'
        ? buildTimedOutResponse(session_id)
        : buildHoldingResponse(session_id, holdingPatternQuestion())
    }

    // --------------------------------------------------------------------
    // OPTION A — R20a SUBSTRATE-GATE CATCH (Session 2, 2026-05-28)
    // Per /drafts/2026-05-28-r20a-single-catch-contract.md §5.2.
    //
    // Runs BEFORE computeAdvance so REDIRECT short-circuits the engine
    // entirely (no metering, no persist; the substrate's R20a Haiku cost
    // is tracked separately via r20a-cost-tracker).
    //
    // Gated behind SUBSTRATE_CALLING_R20A_ENABLED (default OFF). When
    // unset, the entire block is skipped — Case B is byte-identical to
    // pre-Option-A behaviour (PR1 single-endpoint proof; the catch is
    // off in production until a separate Critical activation session).
    //
    // PR3 (synchronous safety): the catch is awaited; no fire-and-forget.
    // PR15 (reuse, don't rebuild): A7's enforceLayer2R20aGate is the seed;
    // no new classifier introduced here.
    //
    // On REDIRECT: halt. Emit developer-form payload + canonical
    //   safety_signal { flow_terminated: true, cause: 'distress', ... }.
    //   No metering (the agent did not receive Calling work; the safety
    //   redirect is its own response shape).
    // On PASS + mild (distress_signal=true): continue normal flow; capture
    //   the canonical safety_signal { flow_terminated: false, severity:
    //   'mild', ... } for attachment to whichever response the engine
    //   produces below (question / hard_gate / null_result). The mild
    //   signal is informational; it does NOT halt the conversation.
    //   Session 4 carry-forward: threading the mild signal onto the
    //   eventual DiscoveredPurpose hand-off envelope (the spec §5.2
    //   target shape) is built when the audience contract is wired
    //   end-to-end — out of PR1 single-endpoint scope here.
    // On PASS + none / BYPASSED: no safety_signal field; unchanged.
    //
    // Rules served: R20a (vulnerable user detection); AC2 (~500ms classifier
    //   accepted); AC4 (invocation-tested); AC5 (ninth-route protocol);
    //   AC8 (substrate-gate at translation-sandwich boundary); PR1 (one
    //   endpoint at a time); PR3 (synchronous); PR6 (Critical change);
    //   PR15 (A7 reuse).
    // --------------------------------------------------------------------
    let mildSafetySignal: SafetySignal | undefined
    if (isCallingR20aEnabled()) {
      // overrideFlag: true — Calling has its own flag check
      // (isCallingR20aEnabled, above) and is independent of A7's
      // SUBSTRATE_R20A_GATE_ENABLED flag per design spec §5.6.
      const gateOutput = await enforceLayer2R20aGate({
        text: response,
        sessionId: session_id,
        overrideFlag: true,
      })

      if (gateOutput.decision === 'REDIRECT') {
        const severity =
          gateOutput.severity === 'acute' || gateOutput.severity === 'moderate'
            ? gateOutput.severity
            : 'moderate' // defensive — REDIRECT should only emit at moderate/acute
        const safetySignal: SafetySignal = {
          flow_terminated: true,
          cause: 'distress',
          severity,
          caught_at: 'substrate_layer2',
        }
        // Log the catch for audit + observability (mirrors A7's span emit).
        console.log(
          JSON.stringify({
            kind: 'sage_calling_r20a_redirect',
            session_id,
            severity,
            span_id: gateOutput.span_id,
            source: gateOutput.source,
          }),
        )
        // Emit the developer-form payload + safety_signal. No metering.
        return buildCallingDistressRedirectResponse(
          session_id,
          severity,
          gateOutput.redirect_message ?? '',
          safetySignal,
        )
      }

      if (gateOutput.decision === 'PASS' && gateOutput.distress_signal) {
        // Mild distress detected; conversation continues but the signal
        // rides on the outward response shape (additive field).
        mildSafetySignal = {
          flow_terminated: false,
          cause: 'distress',
          severity: 'mild',
          caught_at: 'substrate_layer2',
        }
        console.log(
          JSON.stringify({
            kind: 'sage_calling_r20a_mild_signal',
            session_id,
            span_id: gateOutput.span_id,
            source: gateOutput.source,
          }),
        )
      }
      // PASS + no distress_signal (severity 'none') OR BYPASSED → fall
      // through; mildSafetySignal remains undefined; wire shape unchanged.
    }

    // In progress — apply the answer (the endpoint↔engine contract).
    const adv = computeAdvance(existing.response_history, existing.signals_detected, response)
    if (!adv.ok) {
      return buildCallingConflictResponse('This session has no pending question to answer.')
    }

    // Meter BEFORE persisting so a persist retry with the same loop_id dedups.
    const meter = await meterStageCall(loopId, auth.credentialId, agent_id)
    if (!meter.ok) return buildCallingServerErrorResponse()

    const completedAt = adv.value.isComplete ? new Date().toISOString() : null
    const persist = await persistTurn(session_id, {
      responseHistory: adv.value.newHistory,
      signalsDetected: adv.value.newAudits,
      currentStage: adv.value.currentStage,
      gateStatus: adv.value.gateStatus,
      outcome: adv.value.outcome,
      completedAt,
    })
    if (!persist.ok) return buildCallingServerErrorResponse()

    // Respond by decision kind. R4: never surface variant / rule / signals.
    // Option A: when mild distress was caught above, the canonical
    // safety_signal { flow_terminated: false, severity: 'mild', ... } is
    // attached as an additive field on the response shape.
    const decision = adv.value.decision
    if (decision.kind === 'question') {
      return buildQuestionResponse(
        session_id,
        decision.stage,
        decision.text,
        meter.headers,
        mildSafetySignal,
      )
    }
    if (decision.kind === 'hard_gate') {
      // Hard Gate: persisted awaiting_approval; the handoff does NOT fire here.
      return buildHardGateResponse(session_id, meter.headers, mildSafetySignal)
    }
    // null_result — emit the verbatim clarification template (D-12).
    return buildNullResultResponse(session_id, decision.text, meter.headers, mildSafetySignal)
  } catch (err) {
    console.error('[api/calling] unexpected error:', err)
    return buildCallingServerErrorResponse()
  }
}

// ============================================================================
// OPTIONS / method guards
// ============================================================================

export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, { status: 204, headers: CALLING_RESPONSE_HEADERS })
}

function methodNotAllowed(): NextResponse {
  return NextResponse.json(
    { status: 'error', message: 'Method not allowed. This endpoint accepts POST and OPTIONS.' },
    { status: 405, headers: { ...CALLING_RESPONSE_HEADERS, Allow: 'POST, OPTIONS' } },
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
