/**
 * r20a-audience-renderer.ts — A.3 audience contract render helper for R20a
 * distress-redirect responses (Option A build arc, Session 4, 2026-05-28).
 *
 * STATUS: Scaffolded + Wired (2026-05-28). Verified at the substantive level
 * after invocation testing in this session. The `/api/reason` agent-API
 * activation is gated behind a feature flag SUBSTRATE_R20A_AUDIENCE_RENDERING_ENABLED
 * (default OFF; UNSET in Vercel at session close).
 *
 * GOVERNING DOCUMENTS:
 *   - /drafts/2026-05-28-r20a-single-catch-contract.md §3 (audience contract),
 *     §3.4 (the /api/reason agent-API fix — Finding 2), §3.5 (A6 dependency),
 *     §5.4 (Session C scope)
 *   - /adopted/adr/2026-05-27-r20a-configuration-perimeter-and-audience-contract.md
 *     (Accepted 2026-05-27 under D-R20A-ADR-ADOPTED-SEQUENCING-2026-05-27)
 *   - /manifest.md §R20a, §R19, §R19c, §AC1, §AC2, §AC4, §AC5, §AC8, §AC10, §AC11
 *   - /operations/handoffs/founder/2026-05-28-OPTION-A-session-3-reflect-wired-close.md
 *     (S3 close — Reflect-side catch Verified)
 *   - /operations/handoffs/founder/2026-05-28-OPTION-A-session-2-calling-wired-close.md
 *     (S2 close — Calling-side catch Verified; PR15 model)
 *
 * PURPOSE
 *
 * One R20a catch (A7), two output forms: a human-facing crisis pass-through
 * (for end-users on sagereasoning.com web tools) and a developer-facing
 * notification payload (for agent operators calling the API surfaces). This
 * helper is the *single place* that picks the form. Callers (the route
 * handlers, the response builders) pass in the audience + the substrate's
 * already-produced redirect_message + the canonical SafetySignal; the helper
 * returns the audience-correct payload.
 *
 * WHY ONE HELPER, NOT TWO PER-SURFACE BUILDERS
 *
 * Pre-S4 state: each surface (Calling, Reflect, /api/reason) had its own
 * redirect-response shape and its own developer_note placeholder string.
 * Three surfaces, three slightly different shapes — no single place to fix
 * the audience-contract gap (Finding 2 on /api/reason). S4 consolidates into
 * one helper:
 *
 *   - Calling + Reflect builders become thin wrappers that call this helper
 *     for the agent_developer-form payload, then merge in surface-specific
 *     fields (session_id, interaction_type, disclaimer, documentation_url).
 *   - /api/reason's two redirect branches (route-guard ~line 625; Branch 1.7
 *     ~line 846) call this helper with the audience derived from the route's
 *     auth signal (auth.user?.id truthy → human_user; falsy → agent_developer).
 *
 * THE PROSE-MODE KEYS (A6 dependency formalised in S4)
 *
 * Per design spec §3.5, the audience-correct standing strings are two new
 * `prose_mode` keys: r20a_developer_note and r20a_suggested_user_message.
 *
 * S4 formalises these as follows:
 *
 *   - R20A_DEVELOPER_NOTE_DEFAULT — the audience-correct standing string for
 *     the agent operator. Replaces the per-surface placeholders
 *     CALLING_R20A_DEVELOPER_NOTE_PLACEHOLDER (S2) and
 *     REFLECT_R20A_DEVELOPER_NOTE_PLACEHOLDER (S3). Source posture per design
 *     §3.5: lifted from ZONE3_DEVELOPER_NOTE ("the substrate is not a crisis
 *     pathway... route through your own safety/escalation process"). Wording
 *     is surface-neutral so it serves Calling, Reflect, and /api/reason
 *     equally. R19c-honest: the placeholder posture is gone; this is the
 *     formalised initial wording, revisable after the C2 live run (post-Option-A).
 *
 *   - The "suggested_user_message" — derived at runtime from the substrate's
 *     existing redirect_message (which buildRedirectMessage() in r20a-classifier
 *     produces with severity-specific text + live resource list). No standing
 *     string is drafted for r20a_suggested_user_message in S4; the helper
 *     passes through gateOutput.redirect_message as the value. A future A6
 *     refinement could let prose-mode override this with alternative phrasings
 *     (deferred per design spec §7 Q2; revisable after operational data).
 *
 * WIRE SHAPES
 *
 *   audience: 'human_user'  → { distress_detected, severity, redirect_message }
 *                            (byte-identical to /api/reason's existing web-call shape)
 *
 *   audience: 'agent_developer' → { status: 'redirected', distress_detected,
 *                                   severity, developer_note,
 *                                   suggested_user_message, flow_terminated,
 *                                   safety_signal? }
 *                                  (the developer-form payload Calling + Reflect
 *                                   already emit today, sourced from the new
 *                                   prose-mode key instead of route-local
 *                                   placeholder constants)
 *
 * The helper does NOT include surface-specific fields (session_id,
 * interaction_type, disclaimer, documentation_url). Those are merged by the
 * thin wrappers at each surface.
 *
 * LATENCY
 *
 * Pure-sync TS over an existing verdict object. ZERO added latency. No new
 * LLM call. No I/O.
 *
 * COMPLIANCE
 *
 *   - AC1: no LLM call added (helper is pure-sync over R20aGateOutput).
 *   - AC2: no added latency.
 *   - AC4: safety-critical function invocation testing — exercised by the
 *          new tsx test at /website/src/app/api/reason/__tests__/
 *          r20a-audience-rendering.test.ts (S4 Step 5).
 *   - AC5: perimeter unchanged at 10 routes (existing surfaces modified;
 *          no new routes added).
 *   - AC7: not engaged (no auth/cookie/session change).
 *   - AC8: helper sits at the Layer-3 audience-rendering surface within the
 *          translation-sandwich architecture; sibling to layer3-service.ts.
 *   - AC10: provenance and use_policies pass-through (additive future field
 *          on the agent_developer payload; out of scope this session).
 *   - AC11: A7's existing span emit on the catch covers the audit trail;
 *          the helper inherits no new span emission.
 *   - KG1: no DB writes; no module-level cache.
 *   - PR1: single-endpoint proof discipline — Calling + Reflect proven in S2
 *          + S3; the audience contract rolls out across both + /api/reason
 *          here. The renderer itself is the single mechanism.
 *   - PR3: synchronous (no fire-and-forget; helper is pure-sync).
 *   - PR6: safety-critical change — Critical Change Protocol completed for
 *          this wiring session (S4 Step 1).
 *   - PR15: reuses A7's canonical SafetySignal schema; reuses the existing
 *          gateOutput.redirect_message as the suggested_user_message source;
 *          reuses the developer-form payload shape Calling + Reflect already
 *          emit. No primitive rebuilt.
 *   - PR16: positioning — strengthens "Character Kernel" positioning by
 *          enforcing the audience contract substrate-wide across all R20a-
 *          emitting surfaces. Dogfood: helper is substrate-consultable.
 *
 * @compliance
 * compliance_version: CR-2026-Q2-v5
 * regulatory_references: [CR-EU-AIA-A50]
 */

import type { SafetySignal } from './r20a-gate'

// ============================================================================
// A.3 AUDIENCE CONTRACT — TYPE ALIASES
// ============================================================================

/**
 * The two audience forms the R20a redirect renderer routes between.
 *
 * - 'human_user'      — for sagereasoning.com web tools (the person in
 *                        distress is the reader). Today applies to /api/reason
 *                        web calls (auth.user?.id truthy) and any future
 *                        human-facing web tool.
 * - 'agent_developer' — for API surfaces (the developer/agent operator is the
 *                        reader, not the underlying user). Today applies to
 *                        /api/calling, /api/practice/reflect, and /api/reason
 *                        API calls (API-key or plugin-auth path).
 *
 * Audience assignment per surface is decided at the route from the same auth
 * signal already used to distinguish web vs API traffic (cookie/session vs
 * API-key vs plugin-auth). See design spec §3.2.
 */
export type R20aAudience = 'human_user' | 'agent_developer'

// ============================================================================
// A6 PROSE-MODE KEYS (per design spec §3.5)
// ============================================================================

/**
 * R20A_DEVELOPER_NOTE_DEFAULT — the audience-correct standing string for the
 * agent operator when the substrate's R20a catch fires REDIRECT.
 *
 * Formalised at S4 (2026-05-28). Replaces:
 *   - CALLING_R20A_DEVELOPER_NOTE_PLACEHOLDER (S2; retired in this session)
 *   - REFLECT_R20A_DEVELOPER_NOTE_PLACEHOLDER (S3; retired in this session)
 *
 * Source posture: lifted from ZONE3_DEVELOPER_NOTE in
 * /website/src/lib/sage-reflect/zone3-boundary.ts ("the substrate is not a
 * crisis pathway... route through your own safety/escalation process").
 * Surface-neutral so it serves Calling, Reflect, and /api/reason equally.
 *
 * R19c-honest: this is the formalised initial wording, revisable after the
 * C2 live run (post-Option-A) or after operational data.
 */
export const R20A_DEVELOPER_NOTE_DEFAULT =
  "The substrate's R20a distress check detected language patterns indicating " +
  'acute psychological distress in the text submitted to this endpoint. The ' +
  'substrate has halted the current flow and will not advance reasoning, ' +
  'reflection, or any philosophical engagement with this content. The substrate ' +
  'is not a crisis pathway. As the agent operator, please route the user-distress ' +
  'handling through your own safety and escalation process. The ' +
  '`suggested_user_message` field below contains the substrate\'s standing ' +
  'crisis pass-through (resources included); you may relay it through your own ' +
  'safety pipeline if appropriate to your product context.'

// ============================================================================
// AUDIENCE-FORM WIRE SHAPES
// ============================================================================

/**
 * Human-user form — the existing crisis pass-through shape that sagereasoning.com
 * web tools have always emitted. Byte-identical to the body at /api/reason
 * route-guard branch (route.ts:622-630 pre-S4) and Branch 1.7 (route.ts:846-858
 * pre-S4).
 */
export interface R20aHumanUserRedirectPayload {
  distress_detected: true
  severity: 'none' | 'mild' | 'moderate' | 'acute'
  redirect_message: string
}

/**
 * Agent-developer form — the developer-facing notification payload. Structure
 * Calling + Reflect emit today (S2 + S3); S4 generalises it as the canonical
 * agent-developer wire shape across all R20a-emitting surfaces.
 *
 * Per design spec §3.1: the agent_developer payload is the "structured flag +
 * developer note + optional suggested_user_message" shape.
 */
export interface R20aAgentDeveloperRedirectPayload {
  status: 'redirected'
  distress_detected: true
  severity: 'none' | 'mild' | 'moderate' | 'acute'
  /** The audience-correct standing string from R20A_DEVELOPER_NOTE_DEFAULT. */
  developer_note: string
  /** The substrate's existing crisis pass-through (gateOutput.redirect_message);
   *  the agent operator MAY relay this through their own safety pipeline. */
  suggested_user_message: string
  flow_terminated: true
  /** Optional canonical SafetySignal carrier (per A7-added schema). Included
   *  when the caller supplies it (Calling + Reflect always do; /api/reason
   *  also does once wired in this session). */
  safety_signal?: SafetySignal
}

/**
 * The discriminated union of both audience-form payloads. Consumers narrow
 * by checking `status` (presence implies agent_developer) or by checking
 * `'redirect_message' in payload` (presence implies human_user).
 */
export type R20aRedirectPayload =
  | R20aHumanUserRedirectPayload
  | R20aAgentDeveloperRedirectPayload

// ============================================================================
// HELPER INPUT SHAPE
// ============================================================================

/**
 * Input to renderR20aRedirectResponse. Decoupled from the full R20aGateOutput
 * type because the helper is also called from /api/reason's route-guard
 * branch (which has a SafetyGate, not an R20aGateOutput) — normalised inputs
 * are simpler than a discriminated-union sum-type entry point.
 */
export interface RenderR20aRedirectInput {
  audience: R20aAudience
  severity: 'none' | 'mild' | 'moderate' | 'acute'
  /** The substrate's existing crisis pass-through string (resource-list-
   *  included). Used as `redirect_message` for human-user audience and as
   *  `suggested_user_message` for agent-developer audience. */
  redirect_message: string
  /** Optional canonical SafetySignal carrier. Included in the agent_developer
   *  payload when supplied; ignored for human_user audience. */
  safetySignal?: SafetySignal
}

// ============================================================================
// THE RENDER HELPER — A.3 AUDIENCE-CORRECT RENDERING (PR6 SAFETY-CRITICAL)
// ============================================================================

/**
 * Render an R20a distress-redirect response in the audience-correct form.
 *
 * Per design spec §3.3: "the rendering selector is a single helper... that
 * converts an R20aGateOutput + an audience into the wire shape. The helper
 * is the *only* place that picks the form."
 *
 * On `audience === 'human_user'`: returns the existing crisis pass-through
 * wire shape (byte-identical to today's /api/reason web-call behaviour).
 *
 * On `audience === 'agent_developer'`: returns the developer-form payload —
 * a structured flag + the formalised R20A_DEVELOPER_NOTE_DEFAULT + the
 * substrate's redirect_message routed to suggested_user_message + the
 * canonical SafetySignal carrier (when supplied).
 *
 * The helper produces ONLY the audience-correct fields. Surface-specific
 * fields (session_id, interaction_type, disclaimer, documentation_url) are
 * merged by the thin wrappers at each calling surface (Calling builder,
 * Reflect builder, /api/reason route).
 *
 * PR6 + AC4: this is a safety-critical function. The invocation test at
 * /website/src/app/api/reason/__tests__/r20a-audience-rendering.test.ts
 * verifies it is called in the execution paths of the three routes
 * (/api/reason, /api/calling, /api/practice/reflect).
 */
export function renderR20aRedirectResponse(
  input: RenderR20aRedirectInput
): R20aRedirectPayload {
  if (input.audience === 'human_user') {
    return {
      distress_detected: true,
      severity: input.severity,
      redirect_message: input.redirect_message,
    }
  }

  // audience === 'agent_developer'
  return {
    status: 'redirected',
    distress_detected: true,
    severity: input.severity,
    developer_note: R20A_DEVELOPER_NOTE_DEFAULT,
    suggested_user_message: input.redirect_message,
    flow_terminated: true,
    ...(input.safetySignal !== undefined
      ? { safety_signal: input.safetySignal }
      : {}),
  }
}

// ============================================================================
// FEATURE FLAG — SUBSTRATE_R20A_AUDIENCE_RENDERING_ENABLED
// ============================================================================

/**
 * Defaults to OFF. Gates the /api/reason agent-API branch ONLY. When OFF
 * (the steady-state production behaviour at S4 close), /api/reason returns
 * byte-identical to today regardless of caller type:
 *   - Web call (audience: 'human_user'): the existing crisis pass-through.
 *   - API call (audience: 'agent_developer'): also the existing crisis
 *     pass-through (the Finding 2 bug is preserved until activation; the
 *     fix lives in code; activation is a future separate Critical session).
 *
 * When ON, /api/reason API calls receive the developer-form payload via the
 * render helper. Web calls remain byte-identical.
 *
 * Independence: this flag is independent of SUBSTRATE_R20A_GATE_ENABLED (A7),
 * SUBSTRATE_CALLING_R20A_ENABLED (Calling-side catch on /api/calling), and
 * SUBSTRATE_REFLECT_R20A_ENABLED (Reflect-side catch on /api/practice/reflect).
 * Four independent flags = four independent future activations. Per design
 * spec §5.6.
 *
 * Production state at S4 close: SUBSTRATE_R20A_AUDIENCE_RENDERING_ENABLED
 * UNSET in Vercel. Activation deferred to a separate future Critical session.
 *
 * Rules served: R20a, AC4 (invocation-tested), AC5 (existing surfaces
 * modified; no new routes), PR1 (single-endpoint proof — Calling + Reflect
 * proved the contract end-to-end in S2 + S3; the rollout to /api/reason here
 * ratifies the configuration-level perimeter), PR6 (Critical), PR15 (reuses
 * A7's flag-gating posture; reuses overrideFlag pattern).
 */
export function isR20aAudienceRenderingEnabled(): boolean {
  return process.env.SUBSTRATE_R20A_AUDIENCE_RENDERING_ENABLED === 'true'
}
