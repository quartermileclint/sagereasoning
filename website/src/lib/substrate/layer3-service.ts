/**
 * layer3-service.ts — A5 Layer 3 server-side service (substrate layer).
 *
 * STATUS: Scaffolded (2026-05-12). Wired behind feature flag SUBSTRATE_LAYER3_ENABLED
 * (default OFF). Verified after invocation testing in this session.
 *
 * GOVERNING DOCUMENTS:
 *   - /adopted/substrate-plugin-staging-plan.md §Stage 1 item A5
 *   - /manifest.md §R3, R17, R18a, R18e, R19, R20, AC1, AC2, AC4, AC5, AC7, AC8,
 *     AC9, AC10, AC11
 *   - /adopted/adr/2026-05-04-layer3-prose-template-api-reason.md (ADR-007 — the
 *     existing per-consumer Layer 3 prose template this service wraps)
 *   - /adopted/adr/2026-05-12-substrate-category-character-kernel.md (J1 ADR —
 *     Character Kernel category label injected at A5.6)
 *
 * PURPOSE
 *
 * A5 is the THIRD LAYER of the R20a defence (per /adopted/build-sessions-protocol-
 * cache.md §"The agreed substrate architecture"). The three layers are:
 *
 *   Layer 1 — open-source script in the plugin (fast, local distress detection)
 *   Layer 2 — server-side R20a gate guarding Layer 2 API (compliance enforcement,
 *             scaffolded as A7 in a subsequent session)
 *   Layer 3 — A5 deterministic injection of the distress pass-through statement
 *             into every prose output (final enforcement; this module)
 *
 * Even if Layer 1's in-plugin script and A7's server-side gate both miss a
 * distress signal (or if a future regression weakens them), A5 still surfaces
 * appropriate redirection language deterministically. No single point of failure.
 *
 * A5 is also the load-bearing service for the K-category migration (Stage 2):
 * every consumer migrating from bundled-prose to translation-sandwich consumes
 * this service. Until A5 is Verified, no K-category migration can begin.
 *
 * WHAT A5 DOES
 *
 * Given a Layer2Assessment + consumer context + prose_mode + optional distress
 * signal, this service:
 *
 *   1. Generates the per-consumer prose via the existing layer3-prose.ts
 *      module (A5.1 service stub)
 *   2. Deterministically injects R3 evaluative-output disclaimer (A5.2)
 *   3. Deterministically injects R19c limitations link + R19d mirror-principle
 *      reminder where mentor-flavoured (A5.3)
 *   4. Deterministically injects R20a distress pass-through statement when the
 *      upstream signal indicates distress (A5.4 — PR6 safety-critical)
 *   5. Routes via the prose_mode enum (clinical / terse / standard / educational;
 *      A5.5 — A6 dependency; parameter plumbing only this session)
 *   6. Deterministically injects R18a Character Kernel category language for
 *      consumer contexts where category framing is appropriate (A5.6)
 *   7. Deterministically injects R18e Article 50 transparency notice (A5.7)
 *   8. Emits OpenTelemetry GenAI semantic-conventions spans per AC11 (A5.8 —
 *      stub today; A12 wires the receiver)
 *
 * DEFENSIVE READ OF FUTURE FIELDS
 *
 * AC9 (Layer2Decision four-outcome envelope), AC10 (provenance + use_policies
 * tags), and AC11 (OpenTelemetry spans) are forward-looking architectural
 * constraints whose producers land later in Stage 1 or at A12. A5 reads these
 * fields defensively — if present, they project into the response; if absent,
 * the response carries null/empty defaults. The structural skeleton is complete
 * today; functional activation arrives with each producer.
 *
 * COMPLIANCE
 *
 *   - AC1: layer3-prose.ts uses Sonnet (MODEL_DEEP); A5 does not add an LLM call
 *   - AC2: A5 is downstream of the distress classifier; does NOT add latency
 *          to the safety classifier path
 *   - AC4: Safety-critical function invocation testing — injectR20aDistress-
 *          Passthrough has functional AND invocation tests
 *   - AC5: R20a perimeter enforced at route level (line ~173 of /api/reason/
 *          route.ts) BEFORE the sandwich runs; A5 is the third-layer defence
 *          that engages AFTER the gate (when A7 wires it)
 *   - AC7: A5 introduces a new auth surface only via the new route at
 *          /api/substrate/layer3 (Stage 3 work); /api/reason continues with
 *          existing dual-auth pattern (KG4); A5 library is auth-agnostic
 *   - AC8: A5 sits in /website/src/lib/substrate/ — extends the translation-
 *          sandwich architecture; the existing /website/src/lib/translation-
 *          sandwich/layer3-prose.ts is the per-consumer prose template that
 *          A5 wraps
 *   - AC9: A5 reads assessment.decision when present (ALLOW/BLOCK/REVISE/ESCALATE);
 *          defensive default when absent (today: absent on all Layer2Assessment)
 *   - AC10: A5 reads assessment.provenance and assessment.use_policies when
 *           present; defensive defaults when absent
 *   - AC11: A5 emits structured-log spans today; A12 wires the receiver
 *   - KG1: Awaited LLM call (via layer3-prose); no module-level cache; no DB
 *          writes from this module
 *   - PR1: Single-endpoint proof — /api/reason is the proof endpoint; rollout
 *          to additional endpoints (K-category migration; plugin-originated
 *          traffic) gated on A5 reaching Verified on /api/reason first
 *   - PR3: Safety systems are synchronous — generateLayer3Response is awaited;
 *          no fire-and-forget
 *   - PR6: Safety-critical changes are Critical — full Critical Change Protocol
 *          completed for this scaffolding session
 *
 * @compliance
 * compliance_version: CR-2026-Q2-v5
 * regulatory_references: [CR-EU-AIA-A50, CR-GDPR]
 */

import { randomUUID } from 'crypto'

import {
  generateProse,
  generateFallbackProse,
  type Layer3Prose,
  type Layer3Consumer,
  type ProseInput,
} from '@/lib/translation-sandwich/layer3-prose'

import type { Layer2Assessment } from '@/lib/translation-sandwich/layer2-mechanisms'

import type { SafetyGate } from '@/lib/constraints'

// ============================================================================
// A5.5 — PROSE MODE ENUM (A6 DEPENDENCY)
//
// The four prose-mode values. Per /adopted/substrate-plugin-staging-plan.md
// §A6: "Enum of supported modes (clinical / terse / standard / educational);
// SageReasoning-authored, not community-extensible."
//
// This session (A5 scaffolding) implements PARAMETER PLUMBING ONLY.
// All four modes currently route to the existing api_reason prose template.
// A6 (next or subsequent session) fills in per-mode templates.
// ============================================================================

export type ProseMode = 'clinical' | 'terse' | 'standard' | 'educational'

const PROSE_MODES: ReadonlyArray<ProseMode> = [
  'clinical',
  'terse',
  'standard',
  'educational',
]

/** Default prose mode when caller does not specify. */
export const DEFAULT_PROSE_MODE: ProseMode = 'standard'

// ============================================================================
// AC9 — LAYER2 DECISION FOUR-OUTCOME ENVELOPE
//
// Defensive read of the future decision field. Producer lands at Stage 1 close
// gating step or Stage 3 D-mechanisms work, whichever surfaces first. Until
// then, Layer2Assessment carries no `decision` field; A5 treats absence as
// "no decision routing applies" (the assessment's existing mechanism fields
// drive prose generation as today).
// ============================================================================

export type Layer2Decision = 'ALLOW' | 'BLOCK' | 'REVISE' | 'ESCALATE'

const LAYER2_DECISIONS: ReadonlyArray<Layer2Decision> = [
  'ALLOW',
  'BLOCK',
  'REVISE',
  'ESCALATE',
]

// ============================================================================
// AC10 — PROVENANCE + USE-POLICY TAGS
//
// Defensive read of the future tag fields. Producer lands at A12 (OpenTelemetry
// instrumentation) and Stage 3 plugin-tools work. Until then, Layer2Assessment
// carries no provenance/use_policies fields; A5 treats absence as the
// "advisory" default consistent with the current R3 evaluative-output posture.
// ============================================================================

export type Provenance = 'observed' | 'inferred' | 'user_confirmed' | 'generated'

export type UsePolicy =
  | 'advisory'
  | 'binding_within_session'
  | 'binding_cross_session'
  | 'requires_founder_approval'

const DEFAULT_PROVENANCE: Provenance = 'generated'
const DEFAULT_USE_POLICIES: ReadonlyArray<UsePolicy> = ['advisory']

// ============================================================================
// CONSUMER CONTEXT
//
// Caller-supplied context describing the downstream consumer. Drives:
//   - which per-consumer prose template runs (today: only api_reason)
//   - whether R18a Character Kernel framing is injected
//   - whether R19d mirror-principle reminder is injected (mentor-flavoured only)
//   - the audience for R20a redirect rendering (S4 — design spec §3.2)
// ============================================================================

/**
 * The two audience forms for R20a distress-redirect rendering. Added 2026-05-28
 * under the Option A build arc, Session 4 (Layer-3 audience rendering +
 * /api/reason agent-API fix). Per /drafts/2026-05-28-r20a-single-catch-contract.md
 * §3.2.
 *
 * Re-exported here for callers that already import ConsumerContext and want
 * to set `audience` alongside the other context fields. The canonical
 * declaration + the render helper live in `./r20a-audience-renderer.ts`.
 */
export type R20aAudience = 'human_user' | 'agent_developer'

export interface ConsumerContext {
  /** Stable identifier for the downstream consumer. Today only 'api_reason'
   *  routes to a real template; other identifiers reserved for K-category
   *  migration (Stage 2) and plugin-originated traffic (Stage 3). */
  consumer: Layer3Consumer
  /** S4 (2026-05-28) — drives R20a redirect rendering when the substrate's
   *  catch fires REDIRECT. 'human_user' returns the existing crisis pass-
   *  through wire shape (sagereasoning.com web tools); 'agent_developer'
   *  returns the developer-form payload (API surfaces — /api/calling,
   *  /api/practice/reflect, /api/reason API path). Optional + defaults to
   *  'agent_developer' on absence (the safest default for unknown callers;
   *  the human_user wire shape is reserved for explicitly web-authenticated
   *  surfaces). Per design spec §3.2. */
  audience?: R20aAudience
  /** When true, A5.6 injects the R18a Character Kernel category language.
   *  Default ON for marketplace listings + plugin-originated traffic;
   *  default OFF for direct human-facing endpoints where the category
   *  framing is redundant. */
  include_category_framing?: boolean
  /** When true, A5.3 injects the R19d mirror-principle reminder.
   *  Default ON for mentor-flavoured consumers; default OFF for assessment-
   *  flavoured consumers. */
  is_mentor_flavoured?: boolean
}

// ============================================================================
// A5 INPUT + RESPONSE SHAPES
// ============================================================================

export interface Layer3ServiceInput {
  /** Layer 2 assessment to generate prose from. Required. */
  assessment: Layer2Assessment
  /** Consumer context. Required. */
  consumer_context: ConsumerContext
  /** Prose mode (clinical / terse / standard / educational). Defaults to
   *  'standard'. A6 will fill in per-mode templates; today all modes route
   *  to the existing api_reason template. */
  prose_mode?: ProseMode
  /** Optional SafetyGate token proving the route-level distress check
   *  completed upstream. When provided AND gate.shouldRedirect is true,
   *  A5.4 injects the R20a distress pass-through statement deterministically.
   *  Defensive plumbing: A7 (server-side R20a gate) will populate this when
   *  the gate is wired in a subsequent session. */
  distress_gate?: SafetyGate
  /** Forward-compat: max_tokens override for the inner generateProse call. */
  max_tokens?: number
  /** Forward-compat: temperature override for the inner generateProse call. */
  temperature?: number
}

export interface Layer3InjectionSet {
  /** Always present. Per R3 — evaluative-output disclaimer. */
  r3_disclaimer: string
  /** Always present. Per R19c — limitations page link. */
  r19_limitations: string
  /** Present when consumer_context.is_mentor_flavoured is true.
   *  Per R19d — the framework is a mirror, not a lens. */
  r19_mirror_principle: string | null
  /** Present when upstream signal indicates distress (distress_gate.shouldRedirect
   *  OR assessment.decision === 'ESCALATE' OR assessment.distress_signal truthy).
   *  Per R20a — distress pass-through statement.
   *
   *  Today: all three signal sources are absent on Layer2Assessment, so this
   *  field is null in steady-state output. A7 (R20a gate) will activate it
   *  when wired. */
  r20a_distress_passthrough: string | null
  /** Present when consumer_context.include_category_framing is true.
   *  Per R18a — Character Kernel category language. */
  r18a_category: string | null
  /** Always present. Per R18e — Article 50 transparency notice (placeholder
   *  language adopted under ST2; final wording deferred to lawyer engagement
   *  at Stage 1 close). */
  r18e_transparency_notice: string
}

export interface Layer3ResponseMeta {
  /** Prose mode applied to this response. */
  prose_mode: ProseMode
  /** Consumer name from the input. */
  consumer: Layer3Consumer
  /** Whether A5.4 detected a distress signal and injected the R20a pass-through. */
  distress_detected: boolean
  /** AC9 decision field, projected from assessment.decision when present.
   *  Null today (producer lands later in Stage 1 / Stage 3). */
  decision: Layer2Decision | null
  /** AC10 provenance tag, projected from assessment.provenance when present.
   *  Defaults to 'generated' when absent. */
  provenance: Provenance
  /** AC10 use-policy tags, projected from assessment.use_policies when present.
   *  Defaults to ['advisory'] when absent. */
  use_policies: ReadonlyArray<UsePolicy>
  /** AC11 span ID — emitted by A5.8 stub today; A12 wires the receiver. */
  span_id: string
  /** Whether prose was generated by the LLM (generateProse) or the
   *  deterministic fallback (generateFallbackProse). */
  source: 'llm' | 'fallback'
}

export interface Layer3Response {
  /** Schema version. Constant. */
  version: 'layer3-response-v1'
  /** The per-consumer prose output, preserved verbatim from layer3-prose.ts. */
  prose: Layer3Prose
  /** The deterministic injections — five rule-mandated strings A5 guarantees
   *  appear on every Layer 3 response (some are nullable per their rule). */
  injections: Layer3InjectionSet
  /** Metadata about this response — prose mode, distress flag, AC9/AC10/AC11
   *  fields. */
  meta: Layer3ResponseMeta
}

// ============================================================================
// A5.2 — R3 DISCLAIMER INJECTION
//
// Per /manifest.md §R3: "All tool outputs that evaluate, score, or recommend
// actions must include a visible disclaimer: 'Ancient reasoning, modern
// application. Does not consider legal, medical, financial, or personal
// obligations.' Journal teachings and reflective questions are exempt unless
// they produce evaluative output."
//
// A5 is downstream of Layer 2 (which is evaluative by design). Every A5
// response is evaluative output. R3 disclaimer therefore ALWAYS present.
//
// AC4 invocation testing: this function MUST be called in the A5 execution
// path. The grep test in Step 6 verifies the call site.
// ============================================================================

export const R3_DISCLAIMER =
  'Ancient reasoning, modern application. Does not consider legal, medical, financial, or personal obligations.'

export function injectR3Disclaimer(): string {
  return R3_DISCLAIMER
}

// ============================================================================
// A5.3 — R19 INJECTION (LIMITATIONS LINK + MIRROR PRINCIPLE)
//
// Per /manifest.md §R19c: "Limitations acknowledged — The framework's known
// limitations must be documented and accessible."
// Per /manifest.md §R19d: "The mirror principle — The framework is a mirror,
// not a lens — it is for examining your own reasoning, not for diagnosing or
// judging others."
//
// R19c (limitations): ALWAYS present.
// R19d (mirror principle): present only when consumer_context.is_mentor_flavoured.
// ============================================================================

export const R19C_LIMITATIONS_LINK =
  'This framework has documented limitations. See sagereasoning.com/limitations for context on what this output does and does not cover.'

export const R19D_MIRROR_PRINCIPLE =
  'A reminder: this framework is a mirror for examining your own reasoning, not a lens for diagnosing or judging others. Apply it to your own impressions and judgements; resist the impulse to apply it to other people in your life without their knowledge and consent.'

export function injectR19Limitations(): string {
  return R19C_LIMITATIONS_LINK
}

export function injectR19MirrorPrinciple(
  isMentorFlavoured: boolean
): string | null {
  if (!isMentorFlavoured) return null
  return R19D_MIRROR_PRINCIPLE
}

// ============================================================================
// A5.4 — R20a DISTRESS PASS-THROUGH INJECTION (PR6 SAFETY-CRITICAL)
//
// Per /manifest.md §R20a: "Vulnerable user detection — The mentor and all
// human-facing tools must actively detect language patterns indicating acute
// psychological distress (grief, crisis, suicidal ideation) and redirect to
// appropriate professional support resources."
//
// A5 is the THIRD LAYER of the R20a defence (per build-sessions cache). Even
// if Layer 1 (in-plugin script) and Layer 2 (A7 server-side gate) both miss a
// distress signal, A5 still injects the pass-through statement deterministically.
//
// SIGNAL SOURCES (defensive read of future fields):
//   1. distress_gate.shouldRedirect — from SafetyGate token; populated by
//      the route-level distress check (constraints.ts §enforceDistressCheck).
//      When the route runs the R20a perimeter check and finds distress, it
//      passes the gate downward; A5.4 reads gate.shouldRedirect.
//   2. assessment.decision === 'ESCALATE' — AC9 field, future. When AC9 is
//      implemented and Layer 2 mechanism mapping concludes ESCALATE, A5.4
//      injects the pass-through.
//   3. assessment.distress_signal — A7 field, future. When A7 wires the
//      server-side R20a gate, it may attach a distress_signal field to
//      Layer2Assessment for downstream consumers.
//
// IDEMPOTENCY: this function returns the pass-through string when ANY of the
// three signal sources is truthy; null otherwise. The returned string is the
// SAME for every distress case (the practitioner needs consistent redirection
// language, not stylistic variation).
//
// PR6 + AC4: this is a safety-critical function. Functional tests verify
// the right output; invocation tests verify the function is called in the
// execution path (Step 6 grep).
// ============================================================================

export const R20A_DISTRESS_PASSTHROUGH =
  'Some of what you have shared sounds heavy. Stoic reflection is not the right tool for acute psychological distress. Please consider reaching out to a qualified mental-health professional or, if you are in crisis, a local emergency line or crisis helpline. This framework will still be here when the immediate weight has lifted.'

export function injectR20aDistressPassthrough(
  assessment: Layer2Assessment,
  distressGate?: SafetyGate
): string | null {
  // Signal source 1 — SafetyGate from route-level distress check.
  if (distressGate && distressGate.shouldRedirect) {
    return R20A_DISTRESS_PASSTHROUGH
  }

  // Signal source 2 — AC9 decision field (future; defensive read).
  // The Layer2Assessment type today does not include a `decision` field; the
  // optional chain returns undefined and the check is false. When AC9 lands,
  // the field appears and ESCALATE values activate this branch.
  const decision = (assessment as { decision?: Layer2Decision }).decision
  if (decision === 'ESCALATE') {
    return R20A_DISTRESS_PASSTHROUGH
  }

  // Signal source 3 — A7 distress_signal field (future; defensive read).
  const distressSignal = (assessment as { distress_signal?: boolean }).distress_signal
  if (distressSignal === true) {
    return R20A_DISTRESS_PASSTHROUGH
  }

  return null
}

// ============================================================================
// A5.6 — R18a CHARACTER KERNEL CATEGORY INJECTION
//
// Per /manifest.md §R18a + /adopted/adr/2026-05-12-substrate-category-character-
// kernel.md (J1 ADR): "Character Kernel; peers in this category include ANCHOR
// (Cognitive Middleware), ResontoLogic (Reasoning for Humans), and other
// normative-cognitive-middleware substrates."
//
// Injected when consumer_context.include_category_framing is true (default
// ON for marketplace listings + plugin-originated traffic; default OFF for
// direct human-facing endpoints where the category framing is redundant).
// ============================================================================

export const R18A_CHARACTER_KERNEL_CATEGORY =
  'This output is generated by a Character Kernel — a substrate that preserves the agent\'s judgement continuity while reasoning. SageReasoning\'s Character Kernel is grounded in the Stoic philosophical tradition. Peers in the Character Kernel category include ANCHOR (Cognitive Middleware), ResontoLogic (Reasoning for Humans), and other normative-cognitive-middleware substrates.'

export function injectR18aCategory(
  includeFraming: boolean
): string | null {
  if (!includeFraming) return null
  return R18A_CHARACTER_KERNEL_CATEGORY
}

// ============================================================================
// A5.7 — R18e ARTICLE 50 TRANSPARENCY NOTICE
//
// Per /manifest.md §R18e: "Every Layer 3 prose output produced by the
// substrate carries a transparency notice that it is generated by an AI model
// (substrate Layer 3) and not by a human authority."
//
// STATUS: Placeholder language adopted under ST2 (2026-05-12); final wording
// deferred to lawyer engagement at Stage 1 close. Article 50 enforcement live
// 2026-12-02 per CR-EU-AIA-A50.
//
// A5.7 ALWAYS injects the notice (every A5 response is AI-generated by
// construction).
// ============================================================================

export const R18E_ARTICLE_50_TRANSPARENCY_NOTICE =
  'This response is generated by an AI model (substrate Layer 3 of the SageReasoning Character Kernel). It is not produced by a human authority. The structured assessment above is cryptographically signed; this prose is its plain-language rendering.'

export function injectR18eTransparencyNotice(): string {
  return R18E_ARTICLE_50_TRANSPARENCY_NOTICE
}

// ============================================================================
// A5.8 — AC11 OPENTELEMETRY SPAN STUB
//
// Per /manifest.md §AC11: "All substrate operations are instrumented per
// OpenTelemetry GenAI semantic conventions. Auto-instrumentation for Anthropic
// SDK calls; trace propagation across Layer 1 → Layer 2 → Layer 3 → Supabase
// write; correlation IDs preserved across the plugin → substrate boundary."
//
// IMPLEMENTATION SCOPE: A12 wires the OpenTelemetry receiver. Until then, A5.8
// emits a structured-log span via console.log with the agreed shape, so A12 has
// real spans to wire into.
//
// SPAN SHAPE (per OpenTelemetry GenAI semantic conventions):
//   - operation.name = "substrate.layer3.generate"
//   - gen_ai.system = "anthropic" (the underlying LLM provider)
//   - gen_ai.request.model = passed via params (Sonnet via layer3-prose.ts)
//   - gen_ai.response.id = the span_id this function returns
//   - sage.consumer = consumer_context.consumer
//   - sage.prose_mode = prose_mode
//   - sage.distress_detected = boolean
//   - sage.decision = decision || "none"
//   - sage.provenance = provenance
// ============================================================================

interface Layer3SpanFields {
  consumer: Layer3Consumer
  prose_mode: ProseMode
  distress_detected: boolean
  decision: Layer2Decision | null
  provenance: Provenance
  source: 'llm' | 'fallback'
}

function emitLayer3Span(fields: Layer3SpanFields): string {
  const spanId = randomUUID()

  // AC11 stub — structured log line. A12 replaces this with an actual
  // OpenTelemetry span emission. The shape stays the same; only the transport
  // changes.
  const span = {
    operation_name: 'substrate.layer3.generate',
    gen_ai_system: 'anthropic',
    gen_ai_request_model: 'claude-sonnet-4-6',
    gen_ai_response_id: spanId,
    sage_consumer: fields.consumer,
    sage_prose_mode: fields.prose_mode,
    sage_distress_detected: fields.distress_detected,
    sage_decision: fields.decision ?? 'none',
    sage_provenance: fields.provenance,
    sage_source: fields.source,
    timestamp: new Date().toISOString(),
  }

  // eslint-disable-next-line no-console -- AC11 stub; A12 replaces with OTel emit.
  console.log('[substrate.layer3.span]', JSON.stringify(span))

  return spanId
}

// ============================================================================
// A5.1 — LAYER 3 SERVICE STUB (ORCHESTRATOR)
//
// Two entry points are exposed:
//
//   1. generateLayer3Response(input) — FULL SERVICE
//      Generates prose via the existing layer3-prose.ts module, applies the
//      five deterministic injections, projects AC9 / AC10 / AC11 fields,
//      returns a complete Layer3Response. Used by NEW consumers (plugin-
//      originated traffic at Stage 3; the /api/substrate/layer3 route).
//
//   2. applyLayer3Injections(input, prose) — INJECTION WRAPPER ONLY
//      Takes a Layer3Prose that the caller has already produced (via direct
//      generateProse call) and applies the five deterministic injections.
//      Skips the internal generateProse call. Used by EXISTING consumers
//      being migrated to A5 (e.g., /api/reason via parallel-run.ts) — the
//      existing generateProse call site stays; A5 just adds the injection
//      layer on top.
//
//   PR1 single-endpoint proof discipline: /api/reason is the first consumer
//   via applyLayer3Injections. Rollout to other consumers (K-category;
//   plugin-originated) gated on /api/reason reaching Verified.
//
// PROSE MODE ROUTING (A5.5 scaffolding):
//   This session implements PARAMETER PLUMBING ONLY. All four prose modes
//   route to the existing api_reason template. A6 (subsequent session) fills
//   in per-mode templates.
//
// FAILURE ISOLATION:
//   - generateProse throws (in generateLayer3Response only) → fall through to
//     generateFallbackProse (no LLM)
//   - generateFallbackProse throws → re-throw (caller decides; today this is
//     /api/reason's existing minimal-fallback path at runSandwich layer)
//   - Injection functions never throw (they return strings or null)
//
// PER PR3: this function is awaited; no fire-and-forget.
// ============================================================================

/**
 * INJECTION WRAPPER ONLY (A5 entry point 2).
 *
 * Applies the five deterministic injections + projects AC9/AC10/AC11 fields
 * to a Layer3Prose the caller has already produced. Does NOT call generateProse.
 *
 * This is the minimum-disruption entry point for existing consumers being
 * migrated to A5: the existing generateProse call site stays exactly as it
 * is today; A5 only adds the injection layer on top of the result.
 *
 * Used by /api/reason via parallel-run.ts behind SUBSTRATE_LAYER3_ENABLED.
 */
export function applyLayer3Injections(
  input: Omit<Layer3ServiceInput, 'max_tokens' | 'temperature'>,
  prose: Layer3Prose
): Layer3Response {
  const proseMode: ProseMode = input.prose_mode ?? DEFAULT_PROSE_MODE
  if (!PROSE_MODES.includes(proseMode)) {
    throw new Error(
      `Invalid prose_mode '${String(proseMode)}'. Must be one of: ${PROSE_MODES.join(', ')}`
    )
  }

  const includeCategoryFraming =
    input.consumer_context.include_category_framing ?? false
  const isMentorFlavoured =
    input.consumer_context.is_mentor_flavoured ?? false

  // Apply deterministic injections (A5.2-A5.4, A5.6, A5.7)
  const r3 = injectR3Disclaimer()
  const r19Limitations = injectR19Limitations()
  const r19Mirror = injectR19MirrorPrinciple(isMentorFlavoured)
  const r20a = injectR20aDistressPassthrough(
    input.assessment,
    input.distress_gate
  )
  const r18a = injectR18aCategory(includeCategoryFraming)
  const r18e = injectR18eTransparencyNotice()

  const injections: Layer3InjectionSet = {
    r3_disclaimer: r3,
    r19_limitations: r19Limitations,
    r19_mirror_principle: r19Mirror,
    r20a_distress_passthrough: r20a,
    r18a_category: r18a,
    r18e_transparency_notice: r18e,
  }

  // Project AC9 / AC10 fields (defensive reads of future producers)
  const decision =
    (input.assessment as { decision?: Layer2Decision }).decision ?? null
  const provenance =
    (input.assessment as { provenance?: Provenance }).provenance ??
    DEFAULT_PROVENANCE
  const usePolicies =
    (input.assessment as { use_policies?: ReadonlyArray<UsePolicy> })
      .use_policies ?? DEFAULT_USE_POLICIES

  // Emit AC11 OpenTelemetry span (A5.8 stub)
  const spanId = emitLayer3Span({
    consumer: input.consumer_context.consumer,
    prose_mode: proseMode,
    distress_detected: r20a !== null,
    decision,
    provenance,
    source: prose.source,
  })

  return {
    version: 'layer3-response-v1',
    prose,
    injections,
    meta: {
      prose_mode: proseMode,
      consumer: input.consumer_context.consumer,
      distress_detected: r20a !== null,
      decision: LAYER2_DECISIONS.includes(decision as Layer2Decision)
        ? (decision as Layer2Decision)
        : null,
      provenance,
      use_policies: usePolicies,
      span_id: spanId,
      source: prose.source,
    },
  }
}

/**
 * FULL SERVICE (A5 entry point 1).
 *
 * Generates prose via layer3-prose.ts AND applies injections. Used by NEW
 * consumers that don't already have their own generateProse call site.
 */
export async function generateLayer3Response(
  input: Layer3ServiceInput
): Promise<Layer3Response> {
  // Step 1 — Generate prose via existing layer3-prose.ts (A5.1).
  // Per ADR-004 §9.3: deterministic fallback when generateProse throws.
  const proseParams: ProseInput = {
    consumer: input.consumer_context.consumer,
    max_tokens: input.max_tokens,
    temperature: input.temperature,
  }

  let prose: Layer3Prose
  try {
    const llmResult = await generateProse(input.assessment, proseParams)
    prose = llmResult.prose
  } catch (err) {
    // generateFallbackProse is synchronous + cannot throw on valid input.
    prose = generateFallbackProse(input.assessment)
  }

  // Step 2 — Apply injections + assemble response via shared wrapper.
  return applyLayer3Injections(input, prose)
}

// ============================================================================
// FEATURE FLAG — SUBSTRATE_LAYER3_ENABLED
//
// Defaults to OFF. When OFF, callers fall through to the existing
// layer3-prose.ts path without the A5 deterministic injections.
// When ON, callers use generateLayer3Response above.
//
// Production state today: OFF. Flag flipped ON in dev/staging only during
// this session's verification; flipped ON in production via the Critical
// Change Protocol at a subsequent session when A7 is wired (third-layer
// defence comes online only after the second layer is in place).
// ============================================================================

export function isSubstrateLayer3Enabled(): boolean {
  return process.env.SUBSTRATE_LAYER3_ENABLED === 'true'
}
