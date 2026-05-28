/**
 * r20a-gate.ts — A7 Server-side R20a gate (substrate layer).
 *
 * STATUS: Scaffolded (2026-05-13). Wired behind feature flag SUBSTRATE_R20A_GATE_ENABLED
 * (default OFF). Verified after invocation testing in this session.
 *
 * GOVERNING DOCUMENTS:
 *   - /adopted/substrate-plugin-staging-plan.md §Stage 1 item A7
 *   - /adopted/build-sessions-protocol-cache.md §"The agreed substrate architecture"
 *     (three-layer R20a defence)
 *   - /manifest.md §R20a, AC1, AC2, AC4, AC5, AC7, AC8
 *   - /website/src/lib/r20a-classifier.ts (existing two-stage classifier reused here)
 *   - /website/src/lib/constraints.ts (SafetyGate token reused for route-passthrough)
 *   - /website/src/lib/substrate/layer3-service.ts (A5.4 — consumer of distress_signal)
 *
 * PURPOSE
 *
 * A7 is the SECOND LAYER of the R20a defence (per build-sessions-protocol-cache.md
 * §"The agreed substrate architecture"). The three layers are:
 *
 *   Layer 1 — open-source script in the plugin (fast, local distress detection;
 *             Stage 3 work)
 *   Layer 2 — A7 server-side gate guarding the substrate's Layer 2 API
 *             (compliance enforcement; this module)
 *   Layer 3 — A5.4 deterministic injection of the distress pass-through statement
 *             into every prose output (final enforcement)
 *
 * A7 closes two specific gaps:
 *
 *   (a) MILD-SEVERITY GAP. The route-level R20a perimeter at /api/reason/route.ts
 *       line 544 redirects only when `shouldRedirect === true` — moderate or
 *       acute severity. MILD severity passes through unhandled today. A7 +
 *       A5.4 catch this: A7 detects mild → PASS + attaches distress_signal=true
 *       to Layer2Assessment → A5.4 injects R20A_DISTRESS_PASSTHROUGH into the
 *       Layer 3 prose. The practitioner sees redirection language in their
 *       prose response.
 *
 *   (b) FORWARD-LOOKING PROTECTION. Future substrate consumers that call
 *       runSandwich from a route without their own route-level R20a check
 *       inherit A7's defence. Today no such consumers exist; this becomes
 *       relevant at Stage 3 plugin-tools work.
 *
 * A7 also provides DEFENCE IN DEPTH for the existing route-level perimeter
 * at /api/reason — if line 544 ever regresses, A7 catches the same input
 * inside runSandwichInner.
 *
 * A7 is the LOAD-BEARING SECOND LAYER for A5.4's activation. Until A7 wires,
 * A5.4 reads `assessment.distress_signal` defensively and finds it absent.
 * When A7 is Verified and attaches distress_signal to the assessment, A5.4
 * activates as the third-layer defence.
 *
 * F3 FOLD-IN (per /operations/agentic-commerce-findings-downstream-order.md):
 * A5's Layer3Response shape (R3 + R19c + R19d + R20a + R18a + R18e injections
 * + AC9/AC10/AC11 projections) is structurally a substrate-consultation-
 * mandate producer (AP2-style mandate-output shape). A7 is therefore a
 * producer in the mandate-input chain — A7 produces the distress_signal field
 * that completes A5.4's defensive read. Reference:
 * D-AGENTIC-COMMERCE-UPSTREAM-REWORK-2026-05-13.
 *
 * WHAT A7 DOES
 *
 * Given the raw input text + an optional SafetyGate (when the caller already
 * ran the route-level R20a perimeter), this module:
 *
 *   1. Decides PASS or REDIRECT or BYPASSED (A7.1 R20aGateOutput shape;
 *      A7.4 BYPASSED sentinel for flag-off case)
 *   2. Reuses the existing detectDistressTwoStage classifier (no new LLM call
 *      when classifier-derived gate is supplied); fail-CLOSED outer wrapper
 *      catches any unexpected throw (A7.2 enforceLayer2R20aGate)
 *   3. Attaches distress_signal=true to Layer2Assessment when PASS + mild
 *      severity detected (A7.3 attachDistressSignalToAssessment)
 *   4. Reads the flag SUBSTRATE_R20A_GATE_ENABLED (default OFF; A7.5
 *      isSubstrateR20aGateEnabled)
 *   5. Emits OpenTelemetry GenAI semantic-conventions span stub (A7.6
 *      emitR20aGateSpan; A12 wires receiver)
 *
 * SEQUENCING (per founder Option (a) election at session-open 2026-05-13):
 * A7 sits inside runSandwichInner AFTER Layer 1 extraction and BEFORE
 * applyMechanisms. When A7 returns REDIRECT, the orchestrator short-circuits
 * Layer 2 + Layer 3. When A7 returns PASS, Layer 2 + Layer 3 proceed and
 * A7's distress_signal (if present) is attached to the assessment after
 * applyMechanisms.
 *
 * LATENCY (per AC2 budget):
 *   - When the route passes a SafetyGate (Option (i) gate-passthrough), A7
 *     reuses the gate's result. ZERO new latency.
 *   - When A7 makes a fresh classifier call (future substrate consumers
 *     without their own perimeter), A7 inherits the AC2 ~500ms regex →
 *     Haiku budget for borderline inputs. This is the accepted and
 *     documented latency cost.
 *
 * FAIL POSTURE:
 *   - Outer wrapper: A7's outer try/catch FAILS CLOSED on any unexpected
 *     throw — returns REDIRECT with a hardcoded fallback message. This
 *     handles catastrophic infrastructure failures (module load, OOM,
 *     programming errors).
 *   - LLM layer: A7 INHERITS the existing classifier's fail-OPEN posture at
 *     the LLM level — when Haiku fails (network/parse/timeout), the
 *     classifier returns distress_detected=false and logs an alert per
 *     ADR-R20a-01 D6-c. A7 does NOT change this; it is the accepted policy
 *     for the underlying classifier.
 *
 * COMPLIANCE
 *
 *   - AC1: A7 reuses detectDistressTwoStage which uses Haiku (FastModel) per
 *          SafetyCriticalCallParams. A7 does NOT add a new LLM call.
 *   - AC2: ~500ms regex → Haiku budget inherited from existing classifier;
 *          A7 itself adds no further latency. Gate-passthrough path is zero
 *          latency.
 *   - AC4: Safety-critical function invocation testing — enforceLayer2R20aGate
 *          has functional AND invocation tests (see r20a-gate.test.ts and the
 *          parallel-run.ts grep at Step 4/6).
 *   - AC5: A7 does NOT add a ninth route to the R20a perimeter. A7 is a
 *          substrate-internal function, not a route. The eight enumerated
 *          perimeter routes are unchanged. The ST2 perimeter potential-
 *          broadening note applies to A10 routes, not A7.
 *   - AC7: A7 does not touch auth, cookie scope, session validation, or
 *          domain redirect. Inspects text input + writes a flag to an
 *          in-memory data shape only. AC7 NOT engaged for A7.
 *   - AC8: A7 sits in /website/src/lib/substrate/ alongside layer3-service.ts.
 *          Extends the translation-sandwich architecture.
 *   - KG1: Awaited LLM call (via detectDistressTwoStage); no module-level
 *          cache; no DB writes from this module (cost tracking is handled
 *          by the underlying classifier).
 *   - PR1: Single-endpoint proof — /api/reason is the proof endpoint;
 *          rollout to additional endpoints (K-category migration; plugin-
 *          originated traffic) gated on A7 reaching Verified on /api/reason.
 *   - PR2: Build-to-wire verification immediate — grep in same session
 *          confirms enforceLayer2R20aGate is called in parallel-run.ts.
 *   - PR3: Safety systems are synchronous — enforceLayer2R20aGate is awaited;
 *          no fire-and-forget.
 *   - PR6: Safety-critical changes are Critical — full Critical Change
 *          Protocol completed for this scaffolding session.
 *   - PR15: Bespoke A7 justified — no existing Anthropic primitive (Skills,
 *           Sub-agents, MCP, Plugin, Managed Agent, Dreams, Outcomes, multi-
 *           agent) delivers per-substrate-boundary R20a enforcement bound
 *           to SageReasoning's Layer2Assessment shape.
 *   - PR16: Positioning + dogfood — A7 strengthens Character Kernel
 *           positioning by enforcing R20a at the substrate boundary
 *           (substrate consultation of its own safety discipline);
 *           substrate-consultable via /api/reason.
 *
 * @compliance
 * compliance_version: CR-2026-Q2-v5
 * regulatory_references: [CR-EU-AIA-A50, CR-005]
 */

import { randomUUID } from 'crypto'

import { detectDistressTwoStage } from '@/lib/r20a-classifier'
import type { DistressDetectionResult } from '@/lib/guardrails'
import type { SafetyGate } from '@/lib/constraints'
import type { Layer2Assessment } from '@/lib/translation-sandwich/layer2-mechanisms'

// ============================================================================
// A7.4 — R20aGateOutput SHAPE + BYPASSED SENTINEL
//
// A7 returns one of three decision values:
//   - 'PASS'     — no distress (or sub-threshold mild signal); proceed with
//                  Layer 2. When distress_signal=true, A5.4 will inject the
//                  pass-through statement into the Layer 3 prose.
//   - 'REDIRECT' — moderate/acute distress detected; short-circuit Layer 2 +
//                  Layer 3; return user-facing redirect response.
//   - 'BYPASSED' — flag SUBSTRATE_R20A_GATE_ENABLED is unset; A7 took no
//                  action; orchestrator falls through to existing logic
//                  unchanged. This is the steady-state production behaviour
//                  at session close (flag UNSET in Vercel).
// ============================================================================

export type R20aGateDecision = 'PASS' | 'REDIRECT'

export interface R20aGateResult {
  decision: R20aGateDecision
  /**
   * True when sub-threshold distress signal present (mild severity).
   * decision === 'PASS' && distress_signal === true → A7.3 attaches the
   * flag to Layer2Assessment so A5.4 injects the pass-through in Layer 3.
   *
   * decision === 'REDIRECT' implies the redirect is taking precedence;
   * distress_signal is informational only in this case.
   */
  distress_signal: boolean
  /**
   * Present when decision === 'REDIRECT'. The user-facing pass-through
   * text the route should return. Null on PASS.
   */
  redirect_message: string | null
  /** Severity from the underlying classifier. */
  severity: 'none' | 'mild' | 'moderate' | 'acute'
  /** Underlying DistressDetectionResult for forensics + OTel span. */
  underlying: DistressDetectionResult
  /** AC11 span ID — emitted by A7.6 stub; A12 wires receiver. */
  span_id: string
  /**
   * Source of the result. 'reused_gate' when the caller passed a SafetyGate
   * from a route-level perimeter check (no new classifier call; zero added
   * latency). 'fresh_call' when A7 ran detectDistressTwoStage itself.
   */
  source: 'fresh_call' | 'reused_gate' | 'outer_throw'
}

export interface R20aGateBypassedResult {
  decision: 'BYPASSED'
  reason: 'flag_unset'
}

export type R20aGateOutput = R20aGateResult | R20aGateBypassedResult

// ============================================================================
// FALLBACK REDIRECT MESSAGE
//
// Used by A7.2's outer fail-CLOSED wrapper when the classifier itself or
// any infrastructure dependency throws unexpectedly. Deliberate consistency
// with A5's R20A_DISTRESS_PASSTHROUGH so the user-facing language is
// coherent across the three layers of R20a defence.
// ============================================================================

export const A7_FALLBACK_REDIRECT_MESSAGE =
  "Some of what you've shared sounds heavy. Stoic reflection is not the right tool for acute psychological distress. Please consider reaching out to a qualified mental-health professional or, if you are in crisis, a local emergency line or crisis helpline. This framework will still be here when the immediate weight has lifted."

// ============================================================================
// A7.5 — FEATURE FLAG SUBSTRATE_R20A_GATE_ENABLED
//
// Defaults to OFF. When OFF, the orchestrator's check via
// isSubstrateR20aGateEnabled() short-circuits the entire A7 path. Behaviour
// is byte-identical to pre-A7 substrate execution.
//
// When ON, A7's enforceLayer2R20aGate runs inside runSandwichInner after
// Layer 1 extraction and before applyMechanisms (per founder Option (a)
// election at session-open 2026-05-13).
//
// Production state today: UNSET in Vercel. Flag flipped ON in dev/staging
// only during this session's verification; remains UNSET in production at
// session close (per CCP Step 5).
// ============================================================================

export function isSubstrateR20aGateEnabled(): boolean {
  return process.env.SUBSTRATE_R20A_GATE_ENABLED === 'true'
}

// ============================================================================
// OPTION-A SUBSTRATE-GATE FLAG — SUBSTRATE_CALLING_R20A_ENABLED
//
// Added 2026-05-28 under the Option A build arc, Session 2 (Calling-side
// wiring). Per /drafts/2026-05-28-r20a-single-catch-contract.md §5.2.
//
// Mirrors isSubstrateR20aGateEnabled's posture: defaults to OFF; checked at
// every Calling stage call before invoking enforceLayer2R20aGate. When OFF,
// /api/calling's Case B path is byte-identical to pre-Option-A behaviour;
// no classifier call, no added latency, no wire-shape change.
//
// Production state: SUBSTRATE_CALLING_R20A_ENABLED UNSET in Vercel at session
// close. Flag remains OFF in production until a separate Critical activation
// session decides otherwise. The flag is independent of
// SUBSTRATE_R20A_GATE_ENABLED — Calling can be turned on without affecting
// the substrate's own A7 path on /api/reason, and vice versa.
//
// AC5 perimeter: /api/calling joins the perimeter as the ninth route under
// the substrate-gate pattern. Registry: r20a-invocation-guard.test.ts
// SUBSTRATE_GATE_ROUTES.
//
// Rules served: R20a, AC2 (~500ms latency budget accepted), AC5 (ninth-route
// protocol), PR1 (single-endpoint proof on Calling), PR15 (reuses A7 — no
// new classifier).
// ============================================================================

export function isCallingR20aEnabled(): boolean {
  return process.env.SUBSTRATE_CALLING_R20A_ENABLED === 'true'
}

// ============================================================================
// CANONICAL SafetySignal SCHEMA (cross-seam propagation carrier)
//
// Added 2026-05-28 per design spec §4.2. The carrier name `safety_signal`
// reuses the existing field at Reflect's developer-input boundary (see
// website/src/lib/sage-reflect/zone3-boundary.ts); this canonical schema
// WIDENS that contract along three axes:
//
//   - producer set: developer-only (Reflect input) → developer + substrate
//     (A7 / Calling catch)
//   - cause vocabulary: 'harm_flagged' boolean → 'harm' | 'distress' union
//   - semantics: read-once at one boundary → flow-terminating + idempotent
//     across configurations
//
// Reflect's existing SafetySignal { harm_flagged, detail? } maps to this
// canonical shape:
//   - harm_flagged: true  → { flow_terminated: true,  cause: 'harm',
//                             severity: 'n/a',
//                             caught_at: 'reflect_input_boundary', detail }
//   - harm_flagged: false → omit (or { flow_terminated: false, cause: 'harm',
//                                       severity: 'n/a', ... })
//
// Substrate-emitted carriers (A7 / Calling catch) use caught_at:
// 'substrate_layer2'. Halt + idempotency semantics per design §4.4 + §4.5.
//
// Rules served: R20a, AC4, AC8, design spec §4.
// ============================================================================

export type SafetySignalCause = 'distress' | 'harm'

export type SafetySignalSeverity = 'n/a' | 'mild' | 'moderate' | 'acute'

export type SafetySignalCaughtAt =
  | 'substrate_layer2'
  | 'reflect_input_boundary'
  | 'other'

export interface SafetySignal {
  /** True when the configuration must halt and not re-screen. */
  flow_terminated: boolean
  /** What kind of termination this is. */
  cause: SafetySignalCause
  /** Distress severity, when cause === 'distress'. Reflect's harm path uses 'n/a'. */
  severity: SafetySignalSeverity
  /** Free-text detail for forensics + audit. Never user-facing. */
  detail?: string
  /** Where in the configuration the catch fired. AC11 span ID is the canonical link. */
  caught_at: SafetySignalCaughtAt
}

// ============================================================================
// A7.6 — AC11 OPENTELEMETRY SPAN STUB
//
// Per /manifest.md §AC11: "All substrate operations are instrumented per
// OpenTelemetry GenAI semantic conventions. Auto-instrumentation for Anthropic
// SDK calls; trace propagation across Layer 1 → Layer 2 → Layer 3 → Supabase
// write; correlation IDs preserved across the plugin → substrate boundary."
//
// IMPLEMENTATION SCOPE: A12 wires the OpenTelemetry receiver. Until then,
// A7.6 emits a structured-log span via console.log with the agreed shape,
// so A12 has real spans to wire into.
//
// SPAN SHAPE (per OpenTelemetry GenAI semantic conventions):
//   - operation.name = "substrate.layer2.r20a_gate"
//   - gen_ai.system = "anthropic" (the underlying LLM provider via classifier)
//   - gen_ai.request.model = the classifier's model (Haiku via SafetyCriticalCallParams)
//   - gen_ai.response.id = the span_id this function returns
//   - sage.r20a.decision = decision
//   - sage.r20a.severity = severity
//   - sage.r20a.distress_signal = boolean
//   - sage.r20a.source = source (fresh_call | reused_gate | outer_throw)
// ============================================================================

interface R20aGateSpanFields {
  decision: R20aGateDecision
  severity: 'none' | 'mild' | 'moderate' | 'acute'
  distress_signal: boolean
  source: 'fresh_call' | 'reused_gate' | 'outer_throw'
}

function emitR20aGateSpan(fields: R20aGateSpanFields): string {
  const spanId = randomUUID()

  // AC11 stub — structured log line. A12 replaces this with an actual
  // OpenTelemetry span emission. The shape stays the same; only the
  // transport changes.
  const span = {
    operation_name: 'substrate.layer2.r20a_gate',
    gen_ai_system: 'anthropic',
    gen_ai_request_model: 'claude-haiku-4-5-20251001',
    gen_ai_response_id: spanId,
    sage_r20a_decision: fields.decision,
    sage_r20a_severity: fields.severity,
    sage_r20a_distress_signal: fields.distress_signal,
    sage_r20a_source: fields.source,
    timestamp: new Date().toISOString(),
  }

  // eslint-disable-next-line no-console -- AC11 stub; A12 replaces with OTel emit.
  console.log('[substrate.layer2.r20a_gate.span]', JSON.stringify(span))

  return spanId
}

// ============================================================================
// A7.2 — enforceLayer2R20aGate (PR6 SAFETY-CRITICAL)
//
// The primary entry point for A7. Decides PASS / REDIRECT / BYPASSED based on:
//
//   - The feature flag SUBSTRATE_R20A_GATE_ENABLED. When false → BYPASSED.
//   - The supplied SafetyGate (when caller already ran a route-level R20a
//     perimeter). When present → reuse its result; no new classifier call.
//   - Otherwise → call detectDistressTwoStage on the supplied text.
//
// DECISION RULES:
//   - severity 'moderate' or 'acute' (shouldRedirect=true) → decision='REDIRECT'
//   - severity 'mild'                                       → decision='PASS',
//                                                             distress_signal=true
//   - severity 'none' (or distress_detected=false)         → decision='PASS',
//                                                             distress_signal=false
//
// FAIL-CLOSED OUTER WRAPPER (PR6 + CCP Step 2 risk #2):
//   Any unexpected throw from the classifier call or its dependencies is
//   caught here and converted to decision='REDIRECT' with the hardcoded
//   A7_FALLBACK_REDIRECT_MESSAGE. This is belt-and-braces — the existing
//   classifier already handles its own LLM failures (fail-OPEN at the LLM
//   layer per ADR-R20a-01 D6-c). The outer wrapper only catches catastrophic
//   infrastructure failures (module load, OOM, programming errors).
//
// Note: This function does NOT throw when the flag is unset; it returns
// the BYPASSED sentinel. The orchestrator's flag check via
// isSubstrateR20aGateEnabled() should prevent this function from being
// called when the flag is off, but the sentinel return is defensive.
// ============================================================================

export interface EnforceR20aGateInput {
  /** The raw text to classify. Required (used by the classifier; also used
   *  as a forensics field even when gate is reused). */
  text: string
  /** Optional SafetyGate from a route-level R20a perimeter check. When
   *  present, A7 reuses gate.result without calling the classifier (zero
   *  added latency — per CCP latency optimisation Option (i)). */
  gate?: SafetyGate
  /** Optional session ID for cost tracking via the underlying classifier. */
  sessionId?: string
  /**
   * Added 2026-05-28 under the Option A build arc, Session 2 (Calling-side
   * wiring). Per /drafts/2026-05-28-r20a-single-catch-contract.md §5.6.
   *
   * When true, the internal SUBSTRATE_R20A_GATE_ENABLED flag check is
   * SKIPPED. Callers that have their own per-route flag check (e.g.
   * isCallingR20aEnabled() on /api/calling) pass true here so their catch
   * activation is independent of A7's flag on /api/reason.
   *
   * Default: false (the function continues to gate itself behind
   * SUBSTRATE_R20A_GATE_ENABLED as before — preserves existing parallel-
   * run.ts behaviour unchanged). When true, callers MUST have already
   * checked their own flag externally; A7 trusts the caller's authorisation.
   *
   * Rationale: design spec §5.6 names A7 production activation as a
   * separate Critical change. Wiring Calling's flag through A7's flag
   * would couple two Critical activations the design intends to keep
   * independent. This parameter decouples them additively (no existing
   * caller changes; new callers opt in).
   */
  overrideFlag?: boolean
}

export async function enforceLayer2R20aGate(
  input: EnforceR20aGateInput
): Promise<R20aGateOutput> {
  // A7.4 — flag-off sentinel. Skipped when caller opts in via overrideFlag
  // (caller has its own flag check and has already passed it).
  if (!input.overrideFlag && !isSubstrateR20aGateEnabled()) {
    return { decision: 'BYPASSED', reason: 'flag_unset' }
  }

  // A7.2 — main path with fail-CLOSED outer wrapper.
  try {
    let result: DistressDetectionResult
    let source: 'fresh_call' | 'reused_gate'

    if (input.gate) {
      // Reuse the route-level gate. Zero new classifier call.
      result = input.gate.result
      source = 'reused_gate'
    } else {
      // Fresh classifier call. Inherits the AC2 ~500ms regex → Haiku budget.
      result = await detectDistressTwoStage(input.text, input.sessionId)
      source = 'fresh_call'
    }

    const shouldRedirect = result.redirect_message !== null
    const distress_signal =
      result.distress_detected && !shouldRedirect // mild case
    const decision: R20aGateDecision = shouldRedirect ? 'REDIRECT' : 'PASS'

    const span_id = emitR20aGateSpan({
      decision,
      severity: result.severity,
      distress_signal,
      source,
    })

    return {
      decision,
      distress_signal,
      redirect_message: shouldRedirect ? result.redirect_message : null,
      severity: result.severity,
      underlying: result,
      span_id,
      source,
    }
  } catch (err) {
    // Fail-CLOSED outer wrapper. Any throw → REDIRECT with the fallback
    // message. This is intentionally conservative.
    const errorMessage = err instanceof Error ? err.message : String(err)
    console.error(
      '[R20a gate] Outer throw caught; failing CLOSED. Error:',
      errorMessage
    )

    const span_id = emitR20aGateSpan({
      decision: 'REDIRECT',
      severity: 'moderate',
      distress_signal: false,
      source: 'outer_throw',
    })

    const fallbackResult: DistressDetectionResult = {
      distress_detected: true,
      severity: 'moderate',
      indicators_found: [`a7_outer_throw: ${errorMessage}`],
      redirect_message: A7_FALLBACK_REDIRECT_MESSAGE,
    }

    return {
      decision: 'REDIRECT',
      distress_signal: false,
      redirect_message: A7_FALLBACK_REDIRECT_MESSAGE,
      severity: 'moderate',
      underlying: fallbackResult,
      span_id,
      source: 'outer_throw',
    }
  }
}

// ============================================================================
// A7.3 — attachDistressSignalToAssessment
//
// When A7 returns PASS + distress_signal=true (mild severity case), attach
// the distress_signal flag to the Layer2Assessment so A5.4 reads it during
// Layer 3 prose generation and injects R20A_DISTRESS_PASSTHROUGH.
//
// Returns the assessment UNCHANGED when:
//   - decision is REDIRECT (the orchestrator short-circuits Layer 2 + Layer 3;
//     no assessment to attach to)
//   - decision is PASS but distress_signal is false (no signal to attach)
//   - decision is BYPASSED (gate off; no signal)
//
// IDEMPOTENCY: this function is pure (no side effects); returning the same
// reference is OK because the orchestrator doesn't rely on referential
// equality.
//
// AC4 invocation testing: this function MUST be called in the orchestrator
// execution path. The grep test in Step 6 verifies the call site in
// parallel-run.ts.
// ============================================================================

export function attachDistressSignalToAssessment(
  assessment: Layer2Assessment,
  gateOutput: R20aGateOutput
): Layer2Assessment {
  // BYPASSED or REDIRECT — no attachment.
  if (gateOutput.decision === 'BYPASSED' || gateOutput.decision === 'REDIRECT') {
    return assessment
  }

  // PASS without sub-threshold signal — no attachment.
  if (!gateOutput.distress_signal) {
    return assessment
  }

  // PASS + distress_signal=true (mild case). Attach the flag.
  return {
    ...assessment,
    distress_signal: true,
  }
}

// ============================================================================
// TYPE GUARDS — narrow R20aGateOutput discriminated union
// ============================================================================

export function isGateBypassed(
  output: R20aGateOutput
): output is R20aGateBypassedResult {
  return output.decision === 'BYPASSED'
}

export function isGateRedirect(
  output: R20aGateOutput
): output is R20aGateResult & { decision: 'REDIRECT' } {
  return output.decision === 'REDIRECT'
}

export function isGatePass(
  output: R20aGateOutput
): output is R20aGateResult & { decision: 'PASS' } {
  return output.decision === 'PASS'
}
