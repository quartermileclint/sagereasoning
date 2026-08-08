/**
 * guardrail-sandwich.ts — #3b/#3c: port /api/guardrail onto the signed,
 * deterministic translation-sandwich engine (ADR-009, 2026-06-19).
 *
 * The legacy /api/guardrail runs the single-LLM `sage-guard` engine
 * (runSageReason, temp 0.2, ~90s on a critical gate, is_deterministic:false,
 * unsigned). This module ports the gate onto the sandwich's THREE pure building
 * blocks directly — NOT runSandwich (which is /api/reason-shaped: it runs the
 * A7 perimeter, generates Layer-3 prose, and obligates narrative retention; see
 * ADR-009 §1):
 *
 *    action → extractFeatures(...)          [Layer 1 — ONE bounded LLM call, Sonnet, max_tokens 4000]
 *           → detectTier1Trigger / applyMechanisms   [Layer 2 — PURE deterministic, no LLM]
 *           → signLayer2Assessment(...)     [Ed25519 sign — when SUBSTRATE_LAYER2_SIGNING_ENABLED]
 *           → meetsThreshold / getV3Recommendation over katorthoma_proximity   [PURE rank arithmetic]
 *
 * Result: a SIGNED, verdict-reproducible-from-extraction result (same
 * /api/public-key verifiability as a consult) at ~half the output-token budget
 * and NO prose generation. meta.is_deterministic stays honestly FALSE (the
 * endpoint makes one Sonnet Layer-1 AI call; the win is the signed, reproducible
 * Layer-2 verdict via engine_attribution + signed_assessment, NOT an end-to-end
 * determinism claim — ADR-009 §4). The verdict/threshold semantics are unchanged
 * — meetsThreshold/getV3Recommendation are provider-agnostic; only the SOURCE
 * of `proximity` changes (LLM → deterministic Layer 2).
 *
 * §3 BRIDGE RETIRED (2026-06-26, ADR-010 §3 "Expiry" executed). Originally the
 * gate floored dikaiosyne via a near-term LLM justice-completion bridge
 * (justiceCheckScope / resolveJusticeObligation / applyJusticeFloor — one extra
 * bounded Sonnet call on justice-signalled actions, disclosed-but-unsigned). The
 * ADR-010 §4 root correction now weights dikaiosyne NATIVELY inside computeProximity
 * (per-domain proximity + the KP-04 unity-thesis minimum + obligation resolution),
 * so the gate is re-coupled to the native engine — applyMechanisms is called with
 * `dikaiosyneWeighting: true`. A calmly-reasoned injustice now floors to `reflexive`
 * inside the SIGNED deterministic assessment (proximity_floors.dikaiosyne +
 * per-circle obligation_assessment), so a justice-floored gate verdict is once again
 * FULLY REPRODUCIBLE from the signed assessment (no unsigned LLM completion). The
 * retirement was gated on a higher-N (N=10) full-sandwich LOCUS-2 coverage-equivalence
 * + over-strictness proof (role-framed injustices reliably surface a circle natively;
 * good actions are not over-floored) AND the mandatory gate verdict-equivalence battery
 * (U2 marketing-spam still blocks natively). Rollback = re-pin `dikaiosyneWeighting:false`
 * + restore the bridge (git revert).
 *
 * BUILT DARK behind SUBSTRATE_GUARDRAIL_SANDWICH_ENABLED (call-time, case-strict
 * 'true', default OFF). Flag-off ⇒ the route keeps the verbatim legacy path
 * (this module is never reached). See guardrail/route.ts.
 *
 * R20a: this module does NOT run the A7 distress gate — the guardrail stays
 * OUTSIDE the human-distress perimeter (ADR-009 §6; no ninth-route addition).
 * The port adds no perimeter regression (the legacy gate has no distress floor
 * either).
 */

import {
  extractFeatures,
  type LayerTokenUsage,
  type Layer1Schema,
} from '@/lib/translation-sandwich/layer1-extractor'
// Corroboration check (2026-07-07, bar §4.1 / Trust Layer S0a) — flag read only;
// dark on the gate until the flag's own founder-walked activation.
import { isCorroborationCheckEnabled } from '@/lib/translation-sandwich/corroboration-check'
import {
  applyMechanisms,
  detectTier1Trigger,
  weakestProximity,
  obligationToProximity,
  dikaiosyneEngagedCircles,
  type Layer2Assessment,
  type Tier1Trigger,
  type KathekonQuality,
  type HastyAssentRisk,
  type StageScores,
} from '@/lib/translation-sandwich/layer2-mechanisms'
// Q3 (2026-08-02) — the staged-pause override inherits SUBSTRATE_AGENT_CIRCLES_ENABLED
// (it only matters once C3's cosmopolis teaching is live; no second flag).
import { isAgentCirclesEnabled } from '@/lib/translation-sandwich/reasoning-integrity'
import { isOrientationReadingEnabled } from '@/lib/translation-sandwich/orientation-reading'
import {
  signLayer2Assessment,
  type SignedLayer2Assessment,
} from '@/lib/translation-sandwich/layer2-signer'
import {
  meetsThreshold,
  getV3Recommendation,
  type V3GuardrailResponse,
} from '@/lib/guardrails'
import type { KatorthomaProximityLevel } from '@/lib/stoic-brain'

// ============================================================================
// FLAG
// ============================================================================

/**
 * Read at CALL TIME (not module load) so the founder can flip the port without
 * a guardrail redeploy. Case-strict — only literal lowercase 'true' enables.
 * UNSET (default, production) ⇒ false ⇒ the route runs the legacy sage-guard
 * path (byte-identical).
 */
export function isGuardrailSandwichEnabled(): boolean {
  return process.env.SUBSTRATE_GUARDRAIL_SANDWICH_ENABLED === 'true'
}

/**
 * Signing is gated by the SAME flag /api/reason uses (SUBSTRATE_LAYER2_SIGNING_ENABLED),
 * read at call time here. Production state has signing ON. When ON the port emits
 * a signed assessment and fails CLOSED (503) on a signing throw; when OFF it emits
 * the bare (unsigned) assessment. meta.is_deterministic stays honestly FALSE on
 * BOTH paths (the route never sets it — the endpoint makes an L1 AI call; signing
 * toggles only whether the assessment is signed, not determinism).
 */
function isLayer2SigningEnabled(): boolean {
  return process.env.SUBSTRATE_LAYER2_SIGNING_ENABLED === 'true'
}

// ============================================================================
// DIKAIOSYNE — NATIVE (ADR-010 §4), bridge retired (ADR-010 §3 "Expiry")
// ============================================================================
//
// The deterministic Layer-2 once measured apatheia (freedom from passion) as if it
// were the substance of virtue. It is not — apatheia is a CONSEQUENCE of correct
// judgement (mentor consultation 2026-06-19; ADR-010 §1). So a calmly-reasoned
// injustice scored near-virtuous (the verdict-equivalence battery's U2 leak).
//
// The §3 NEAR-TERM BRIDGE (a bounded LLM justice-resolution call that floored the
// surfaced proximity) is RETIRED. The ADR-010 §4 root correction now weights
// dikaiosyne NATIVELY in computeProximity: per-domain proximity + the KP-04
// unity-thesis minimum, with the obligation resolved from the Layer-1
// obligation_assessment. The gate calls applyMechanisms with `dikaiosyneWeighting:
// true` (below), so the dikaiosyne floor is folded into the SIGNED deterministic
// proximity (proximity_floors + per-circle obligation_assessment) — fully
// reproducible from the signed assessment, no second LLM call, no unsigned
// completion. justiceCheckScope / resolveJusticeObligation / applyJusticeFloor and
// the JusticeResolution types are deleted; the kathekon floor (the sparse/empty-
// extraction fail-open guard) is retained.

// ============================================================================
// VERDICT FIELDS (the §4 engine-derived response fields — PURE)
// ============================================================================

export type DeliberationQuality = 'thorough' | 'adequate' | 'hasty' | 'impulsive'

/** The engine-derived guardrail fields, re-derived from the DETERMINISTIC
 *  Layer-2 assessment (ADR-009 §4). The route layers on the request-side fields
 *  (threshold, risk_class, evaluation_depth, rollback_path, alternatives). */
export interface GuardrailVerdictFields {
  proceed: boolean
  katorthoma_proximity: KatorthomaProximityLevel
  recommendation: V3GuardrailResponse['recommendation']
  passions_detected: V3GuardrailResponse['passions_detected']
  /** boolean | null — null ("marginal", cannot determine) surfaced HONESTLY,
   *  not coerced to false (R18; ADR-009 §4). */
  is_kathekon: boolean | null
  kathekon_quality: KathekonQuality
  /** Deterministic synthesis from L2 (kathekon justification + ruling faculty +
   *  proximity + the §4 proximity_floors basis) — NOT LLM prose (R10 content
   *  change; ADR-009 §4). */
  reasoning: string
  /** Flattened from improvement_path_structured.corrected_judgement; omitted
   *  when the structured field is null. */
  improvement_hint?: string
  hasty_assent_risk: HastyAssentRisk
  stage_scores: StageScores
  deliberation_quality: DeliberationQuality
  /** The L2 corrected judgement, surfaced so the route can derive the
   *  Critical-only rollback_path note deterministically. */
  improvement_corrected?: string
}

/** deliberation_quality — the SAME derivation the legacy route used (route.ts
 *  ~228-238), now over deterministic L2 inputs. L2 always provides stage_scores
 *  (the legacy meta.stage_scores was sometimes absent), so this is strictly more
 *  reliable. */
export function deriveDeliberationQuality(
  hastyAssentRisk: HastyAssentRisk,
  stageScores: StageScores,
): DeliberationQuality {
  if (hastyAssentRisk === 'high') return 'impulsive'
  if (hastyAssentRisk === 'moderate') return 'hasty'
  const scores = Object.values(stageScores).filter((s) => s !== 'not_applied')
  if (scores.length === 0) return 'adequate'
  const strongCount = scores.filter((s) => s === 'strong').length
  return strongCount === scores.length ? 'thorough' : 'adequate'
}

/** Deterministic `reasoning` synthesis from the L2 assessment. Honest +
 *  reproducible; replaces the LLM philosophical_reflection (R10; ADR-009 §4).
 *  Layer 2 has NO free-narrative field — this composes the structured ones.
 *
 *  JUSTICE-AWARE (ADR-010 §4): when a virtue domain floored the aggregate
 *  (dikaiosyne / andreia / sophrosyne), proximity_floors.basis names WHY — surfaced
 *  in the reasoning so the floor is visible (the action may look duty-consistent on
 *  the kathekon axis yet be floored for a justice/courage/temperance violation,
 *  exactly the apatheia-vs-dikaiosyne gap the §4 correction closes). The basis is a
 *  field of the SIGNED assessment, so the reasoning stays reproducible. The narrated
 *  katorthoma_proximity is the assessment's own (already §4-floored) value. */
export function synthesizeReasoning(assessment: Layer2Assessment): string {
  const k = assessment.kathekon_assessment
  const proximity = assessment.katorthoma_proximity as KatorthomaProximityLevel
  const kathekonClause =
    k.is_kathekon === true
      ? 'the action is appropriate (kathekon)'
      : k.is_kathekon === false
        ? 'the action is contrary to kathekon'
        : 'the action’s appropriateness is indeterminate'
  const justification = (k.justification || '').trim()
  const ruling = (assessment.ruling_faculty_state || '').trim()
  const parts = [
    `Deterministic virtue assessment — katorthoma proximity: ${proximity}; ${kathekonClause} (kathekon quality: ${k.quality}).`,
  ]
  if (justification) parts.push(justification)
  if (ruling) parts.push(`Ruling faculty: ${ruling}.`)
  // §4 native dikaiosyne weighting: when a virtue domain lowered the aggregate, the
  // basis string explains the weakest-link floor — reproducible from the signed
  // assessment (proximity_floors is a signed field).
  const floors = assessment.proximity_floors
  if (floors && (floors.dikaiosyne || floors.andreia || floors.sophrosyne) && floors.basis?.trim()) {
    parts.push(floors.basis.trim())
  }
  return parts.join(' ')
}

/** Project the richer L2 passion entries to the V3 guardrail shape. L2's
 *  sub_species is PassionSubSpecies|null; V3's is a string — null → 'unspecified'
 *  (honest: no sub-species identified). */
export function projectPassions(
  assessment: Layer2Assessment,
): V3GuardrailResponse['passions_detected'] {
  return assessment.passion_diagnosis.passions_detected.map((p) => ({
    root_passion: p.root_passion,
    sub_species: p.sub_species ?? 'unspecified',
    false_judgement: p.false_judgement,
  }))
}

/** Re-derive every engine-side guardrail field from the DETERMINISTIC Layer-2
 *  assessment + the threshold. PURE — no LLM, no I/O. This is the heart of the
 *  port: a guardrail verdict computed by ordinal-rank arithmetic over the
 *  deterministic katorthoma_proximity — which, with the §4 native dikaiosyne
 *  weighting active (dikaiosyneWeighting:true), is ALREADY the justice/courage/
 *  temperance-floored aggregate. */
export function deriveGuardrailVerdict(
  assessment: Layer2Assessment,
  threshold: KatorthomaProximityLevel,
): GuardrailVerdictFields {
  const proximity = assessment.katorthoma_proximity as KatorthomaProximityLevel
  const k = assessment.kathekon_assessment
  const improvement = assessment.improvement_path_structured

  // Rank-arithmetic verdict over the §4-native (already justice/courage/temperance-
  // floored) proximity. No port-layer justice floor — the §3 bridge is retired and
  // computeProximity does the weakest-domain flooring natively (ADR-010 §4).
  let proceed = meetsThreshold(proximity, threshold)
  let recommendation = getV3Recommendation(proximity, threshold)

  // STAGED-PAUSE TIER FOR CIRCLE-4 (Q3, 2026-08-02 mentor ruling, binding). C3
  // teaches the extractor to attach a `cosmopolis` circle (the fourth, outermost
  // oikeiosis circle — "other reasoning agents"). A `violated` obligation on
  // ANY circle floors to 'reflexive' through the SAME unmodified path every
  // other circle uses (computeDikaiosyneFloor → obligationToProximity →
  // weakestProximity), and 'reflexive' two-or-more ranks below threshold reads
  // getV3Recommendation as 'do_not_proceed' — an immediate hard deny.
  //
  // The mentor's L3 ruling: LLM extraction confidence at circle-4 does not meet
  // the zero-false-positive standard a deny requires, because a deny is
  // irreversible. Circle-4 must "enter the staged pause tier first" and "earn
  // promotion to the deny class through demonstrated false-positive
  // performance" — a later, deliberate, founder-walked decision (Q3's own
  // 2026-08-02 residual ruling: "build the pause; do not build the promotion
  // algorithm" — Option A, stateless pause + manual promotion; Option B,
  // an automated promotion algorithm, was explicitly ruled OUT at this stage).
  //
  // PORT-LAYER ONLY, identical footprint to the SD-1 kathekon floor below:
  // reads the already-computed deterministic assessment, adjusts
  // `recommendation` alone. computeProximity + katorthoma_proximity are NEVER
  // repainted — that field is shared with /api/reason's public profile, and
  // the ruling is about the GATE's disposition, not about mis-stating the
  // underlying proximity assessment (so a self-only-consult reading `reflexive`
  // via a cosmopolis-only violation still reads `reflexive` in the profile;
  // only the gate softens do_not_proceed → pause_for_review).
  //
  // ISOLATION, not blanket softening: fires ONLY when cosmopolis is violated
  // AND excluding it, the remaining circles do NOT themselves floor to
  // 'reflexive' — an ordinary circle-1–3 deny (household/local_community/
  // political_community violated) is untouched; L3's concern is specifically
  // about circle-4 extraction confidence, not the other three. NEVER softens
  // to 'proceed' or 'proceed_with_caution' — `proceed` stays exactly what
  // meetsThreshold computed (false, since 'reflexive' fails every non-
  // 'reflexive' threshold); only `recommendation` is adjusted, mirroring the
  // SD-1 precedent's own shape.
  //
  // THE Q4 COMPOSITION, LOAD-BEARING (caught by a live extraction, 2026-08-02):
  // the "others" set is filtered through `dikaiosyneEngagedCircles` FIRST, so a
  // co-extracted `self_preservation` violation cannot make the reading look
  // non-isolated. A real Layer-1 run on the C3 anchor case read BOTH
  // `self_preservation` and `cosmopolis` violated; folding the RAW list would
  // have read self_preservation as independently flooring (J1/J3) and left the
  // hard deny standing — reintroducing exactly the self-circle proximity
  // consequence Q4's ruling forbids, one function away from where Q4 removed it.
  //
  // Flag-gated on the SAME `SUBSTRATE_AGENT_CIRCLES_ENABLED` C3's teaching
  // rides — this override only matters once cosmopolis can be extracted at
  // all, so it inherits the existing flag rather than needing a second one.
  // Flag-off ⇒ byte-identical (this whole block is a no-op: relevant_circles
  // can carry no cosmopolis entry when the flag-off prompt never teaches it).
  if (isAgentCirclesEnabled() && recommendation === 'do_not_proceed') {
    const circles = assessment.oikeiosis.relevant_circles
    const cosmopolisViolated = circles.some(
      (c) => c.circle === 'cosmopolis' && c.obligation_assessment?.status === 'violated'
    )
    // Filter through Q4's exclusion FIRST (self_preservation is not a justice
    // surface), THEN drop cosmopolis — what remains is the set that could
    // independently earn the deny.
    const others = dikaiosyneEngagedCircles(circles, isAgentCirclesEnabled()).filter(
      (c) => c.circle !== 'cosmopolis'
    )
    const othersFloorReflexive =
      others.length > 0 &&
      weakestProximity(others.map((c) => obligationToProximity(c.obligation_assessment ?? null))) ===
        'reflexive'
    const circle4IsolatedFloor = cosmopolisViolated && !othersFloorReflexive
    if (circle4IsolatedFloor) {
      recommendation = 'pause_for_review'
    }
  }

  // KATHEKON FLOOR (SD-1, adversarial review 2026-06-19; ADR-009 §4). A verdict
  // that judges the action CONTRARY to appropriate action (is_kathekon === false,
  // i.e. kathekon quality 'contrary') must NEVER emit proceed:true — even when
  // computeProximity's terminal default ('deliberate', the under-specified /
  // empty-extraction fallback) would pass the threshold. This resolves the
  // proximity-vs-kathekon incoherence and closes the sparse/empty-extraction
  // fail-OPEN at the gate (an empty schema yields proximity 'deliberate' AND
  // kathekon 'contrary'). The floor lives in the PORT layer ONLY —
  // computeProximity (shared /api/reason determinism) is untouched. Note: this
  // can only make the verdict MORE conservative, never less. It is INDEPENDENT of
  // the §4 native dikaiosyne floor (both only ever lower; the more conservative wins).
  if (k.is_kathekon === false) {
    proceed = false
    if (recommendation === 'proceed' || recommendation === 'proceed_with_caution') {
      recommendation = 'pause_for_review'
    }
  }

  return {
    proceed,
    katorthoma_proximity: proximity,
    recommendation,
    passions_detected: projectPassions(assessment),
    is_kathekon: k.is_kathekon,
    kathekon_quality: k.quality,
    reasoning: synthesizeReasoning(assessment),
    improvement_hint: improvement ? improvement.corrected_judgement : undefined,
    hasty_assent_risk: assessment.hasty_assent_risk,
    stage_scores: assessment.stage_scores,
    deliberation_quality: deriveDeliberationQuality(
      assessment.hasty_assent_risk,
      assessment.stage_scores,
    ),
    improvement_corrected: improvement ? improvement.corrected_judgement : undefined,
  }
}

// ============================================================================
// ORCHESTRATOR
// ============================================================================

export interface GuardrailSandwichParams {
  /** The action to gate (already trimmed). Maps to Layer-1 `input`. */
  action: string
  /** Optional caller context. */
  context?: string
  /** Optional urgency context (Layer-1 also extracts urgency from the action). */
  urgency_context?: string
  /** Optional domain context — sharpens Layer-1 extraction; does NOT shape the
   *  deterministic Layer-2 verdict (ADR-009 §4). */
  domain_context?: string
  /** The resolved proximity threshold. */
  threshold: KatorthomaProximityLevel
}

/** Discriminated outcome of the port. The route branches on `status`. */
export type GuardrailSandwichOutcome =
  | {
      status: 'verdict'
      verdict: GuardrailVerdictFields
      /** The Layer-1 extraction (the features Layer 2 reasoned over). Disclosed
       *  on the wire (R10-2) so a consumer can re-run applyMechanisms over it and
       *  verify the full action→extraction→assessment chain — parity with
       *  /api/reason, which also surfaces `extraction`. */
      extraction: Layer1Schema
      /** The bare deterministic Layer-2 assessment. Emitted on the wire as the
       *  bare `assessment` when signing is OFF; when signing is ON the signed
       *  wrapper below is the verifiable artifact (R10-1). With §4 native weighting
       *  active this assessment carries proximity_floors + per-circle
       *  obligation_assessment — the reproducible justice reading. */
      assessment: Layer2Assessment
      /** Present only when signing is enabled; the route emits it as
       *  signed_assessment {assessment, signature, key_id}. */
      signed: SignedLayer2Assessment | null
      /** The Layer-1 extraction call's token usage — for CI-8 cost honesty +
       *  CI-10 metering. The gate now makes a SINGLE LLM call (Layer-1 only); the
       *  §3 bridge's second justice call is retired. */
      usage: LayerTokenUsage
      layer1_latency_ms: number
    }
  | {
      /** A Tier-1 force-clarification fired. A binary gate never halts to clarify
       *  (ADR-009 §3) — the route maps this to a CONSERVATIVE pause verdict. */
      status: 'tier1_pause'
      trigger: Tier1Trigger
      usage: LayerTokenUsage
      layer1_latency_ms: number
    }
  | {
      /** Signing was enabled but threw (key missing/malformed, or a
       *  canonicalisation error). Fail-CLOSED — the route returns 503; the
       *  substrate never emits an unsigned assessment when signing is on. */
      status: 'signing_unavailable'
    }
  | {
      /** Layer-1 extraction (or the deterministic Layer-2, defensively) failed.
       *  The route returns a CONSERVATIVE fallback verdict — a gate failure must
       *  never silently "proceed" (ADR-009 §5). */
      status: 'engine_unavailable'
      stage: 'layer1' | 'layer2'
      detail: string
    }

/**
 * Run the guardrail through the signed deterministic sandwich. Never throws —
 * every failure mode is returned as a discriminated outcome the route maps to
 * a fail-safe HTTP response.
 */
export async function runGuardrailSandwich(
  params: GuardrailSandwichParams,
): Promise<GuardrailSandwichOutcome> {
  // ---- Layer 1: ONE bounded LLM extraction (Sonnet, max_tokens 4000) --------
  const l1Start = Date.now()
  let schema
  let usage: LayerTokenUsage
  try {
    const extracted = await extractFeatures({
      input: params.action,
      context: params.context,
      domain_context: params.domain_context,
      urgency_context: params.urgency_context,
    })
    schema = extracted.schema
    usage = extracted.usage
  } catch (err) {
    return {
      status: 'engine_unavailable',
      stage: 'layer1',
      detail: err instanceof Error ? err.message : 'layer1_extraction_failed',
    }
  }
  const layer1_latency_ms = Date.now() - l1Start

  // ---- Layer 2: PURE deterministic mechanism application --------------------
  // Tier-1 force-clarification (ELEMENT_FUSION upstream; TEMPORAL/SCOPE in
  // applyMechanisms) → a binary gate cannot ask a clarifying question, so the
  // route maps a trigger to a conservative pause (ADR-009 §3). No suppression
  // (the gate has no continuation/clarification_response channel).
  try {
    const elementFusion = detectTier1Trigger(schema)
    if (elementFusion) {
      return { status: 'tier1_pause', trigger: elementFusion, usage, layer1_latency_ms }
    }
    // ADR-010 §4 NATIVE (2026-06-26, §3 bridge retired). The gate calls
    // applyMechanisms with `dikaiosyneWeighting: true` so computeProximity weights
    // dikaiosyne natively (per-domain proximity + the KP-04 unity-thesis minimum +
    // obligation resolution from the Layer-1 obligation_assessment). A calmly-
    // reasoned injustice floors to `reflexive` inside the SIGNED deterministic
    // assessment — fully reproducible, no second LLM call. This REPLACES the §3
    // justice-completion bridge (retired). Retirement was gated on the higher-N
    // (N=10) full-sandwich LOCUS-2 coverage-equivalence + over-strictness proof AND
    // the mandatory gate verdict-equivalence battery (U2 still blocks). NOTE: this
    // is an EXPLICIT `true` (not the env default) so the gate's flooring is
    // independent of the shared SUBSTRATE_PROXIMITY_DIKAIOSYNE_ENABLED env flag —
    // the gate floors justice whether or not that flag is set on /api/reason.
    // Corroboration check (2026-07-07, bar §4.1 / Trust Layer S0a) — DARK on the
    // gate: attached ONLY when SUBSTRATE_CORROBORATION_CHECK_ENABLED is set (UNSET
    // in production ⇒ this branch adds nothing ⇒ the gate is byte-identical,
    // test-asserted). Activating it on the Live gate is a SEPARATE founder-walked
    // Critical step (the check's own verdict-equivalence battery gates it, per the
    // §4/§3 precedent). When on, the deterministic check cross-references the
    // extraction's self-report claims against the verbatim action text and floors
    // dikaiosyne/andreia on a grounded contradiction — monotone (floor-only), so
    // the gate can only get MORE conservative, never less.
    const l2 = applyMechanisms(schema, {
      dikaiosyneWeighting: true,
      ...(isCorroborationCheckEnabled()
        ? { corroboration: { actionText: params.action } }
        : {}),
    })
    if ('tier1_trigger' in l2) {
      return { status: 'tier1_pause', trigger: l2.tier1_trigger, usage, layer1_latency_ms }
    }
    const assessment: Layer2Assessment = l2

    // ---- Sign (fail-closed when enabled) -----------------------------------
    let signed: SignedLayer2Assessment | null = null
    if (isLayer2SigningEnabled()) {
      try {
        signed = signLayer2Assessment(assessment)
      } catch {
        // Never emit an unsigned assessment when signing is enabled.
        return { status: 'signing_unavailable' }
      }
    }

    // ---- Verdict (pure rank arithmetic over the §4-native proximity) --------
    const verdict = deriveGuardrailVerdict(assessment, params.threshold)
    // Agent-circles C2c (2026-08-08): the gate shares the Layer-1 prompt with
    // /api/reason, so flag-on its extraction may carry orientation_observations
    // — strip them from the echo (the placement ruling: the reading's
    // antecedents never ride ANY agent-facing response; the at-action hook
    // consumes this verdict, so an unstripped echo would put the markers one
    // step from an at-action frame). The gate derives NO orientation reading
    // and NO event — consult examinations only. Flag-off the field never
    // exists (the prompt never solicits it) — byte-identical.
    let wireSchema = schema
    if (isOrientationReadingEnabled() && schema.orientation_observations !== undefined) {
      const { orientation_observations: _stripped, ...rest } = schema
      wireSchema = rest as typeof schema
    }
    return {
      status: 'verdict',
      verdict,
      extraction: wireSchema,
      assessment,
      signed,
      usage,
      layer1_latency_ms,
    }
  } catch (err) {
    // Defensive: applyMechanisms/detectTier1Trigger are pure and should not throw
    // on a validated schema; if they do, fail SAFE (conservative pause), never
    // "proceed".
    return {
      status: 'engine_unavailable',
      stage: 'layer2',
      detail: err instanceof Error ? err.message : 'layer2_application_failed',
    }
  }
}
