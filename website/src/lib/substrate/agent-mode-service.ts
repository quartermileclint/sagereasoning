/**
 * agent-mode-service.ts — Layer 3 agent-mode rendering (ATL Wrapper Component 2).
 *
 * STATUS: Scaffolded → Wired → Verified (2026-05-15, this session). New code,
 * imported only by philosophical-mode-service.ts's renderLayer3Mode dispatch —
 * no route imports it; no production exposure this session. Builds without any
 * env flag (a pure in-process function; nothing to gate).
 *
 * GOVERNING DOCUMENTS:
 *   - /archive/2026-05-14_agent-mode-response-spec-superseded.md — the agent-mode
 *     rendering is specified there in full (§"Output shape", §"Kathekon as gate,
 *     not component", §"Out of the score; in the response shape", §"Gaming
 *     defences", §"Receiving-agent caveats", §"Score-validity flag rules",
 *     §"Reflection component"). The superseded agent-mode spec is the
 *     substantive deliverable-of-the-day; its content is absorbed into the ATL
 *     Wrapper spec §"Component 2".
 *   - /adopted/substrate-modes/agent-trust-layer-wrapper-spec.md §"Component 2"
 *     + §"The report the agent hands back to the developer" + §"R-rule
 *     engagement" — the wrapper architecture that contains this rendering.
 *   - /website/src/lib/substrate/score-architecture.ts — the now-Verified score
 *     module this rendering consumes (computeSubstrateScore + ScoreContext +
 *     SubstrateScore).
 *   - /website/src/lib/substrate/philosophical-mode-service.ts — the
 *     renderLayer3Mode dispatch this rendering extends (PR1 single-endpoint
 *     proof of the agent-mode rendering pattern); the injection-layer usage and
 *     the JSON + Markdown projection shape this rendering mirrors.
 *   - /website/src/lib/substrate/layer3-service.ts — the injection layer (the
 *     six inject* wraps); consumed verbatim, never re-authored here.
 *   - /operations/decision-log.md — D-ATL-AGENT-MODE-RENDERING-WIRED-VERIFIED-
 *     2026-05-15 (this build; the Step 2 design-decision gate is recorded there).
 *
 * WHAT THIS MODULE IS
 *
 * The Layer 3 agent-mode rendering — "Component 2 proper" at the per-assessment
 * level. It is dual-audience:
 *
 *   - The IN-LOOP machine-readable JSON (AgentModeResponse) — the wrapped agent
 *     consumes this to make its next decision.
 *   - The PER-ASSESSMENT human-readable rendering (Markdown) — the developer's
 *     per-assessment view; a presentation layer over the JSON.
 *
 * Both carry the mandatory wraps (R3 / R19c / R19d / R20a / R18a / R18e). Both
 * are DETERMINISTIC from a Layer2Assessment + a ScoreContext alone — no LLM
 * call (per the superseded spec: "the output is deterministic from Layer 2
 * alone ... byte-stable"). Same (assessment, context) in → byte-identical
 * AgentModeResponse + Markdown out. No clock read, no randomness, no I/O.
 *
 * NOT in scope this session (per the ATL Wrapper Session 3 prompt):
 *   - The trajectory-enriched developer hand-back report — it draws on the
 *     WindowSnapshot / AccreditationRecord / AccreditationCard (Components 3+4,
 *     fed by the wrapper, Component 1). Deferred to after spec steps 5–6.
 *   - The wrapper itself, the badge, the iteration patterns, the Layer 1 schema
 *     additions — spec steps 4–6.
 *   - The gaming-defence DETECTION logic (Form 1 virtue-vocabulary
 *     normalisation; Form 2 passion-language detection on free text) — upstream
 *     Layer-1 / agent-mode-request concerns. This rendering SURFACES the
 *     gaming-defence results (justification_source from the gate; the
 *     declared-motivation verdict; the receiving-agent caveats; the
 *     stated_operative_conflict flag the Layer 2 engine already fired) — it does
 *     not perform the detection.
 *
 * THE ScoreContext (the honest carry — mirrors score-architecture.ts's own
 * ScoreContext and sage-assent-bridge.ts's BridgeContext)
 *
 * The rendering must call computeSubstrateScore, which needs a ScoreContext
 * (justification_source REQUIRED; declared_motivation_passion OPTIONAL). With no
 * wrapper yet (the wrapper is spec step 5 — the eventual producer of the
 * ScoreContext), the caller supplies it on the shared Layer3ModeRenderInput.
 * When the caller supplies none, the rendering defaults to
 * { justification_source: 'absent' } — the honest "no justification available"
 * path: the kathekon gate does not confirm, the score caps at 35. The renderer
 * is therefore TOTAL — it never throws on a missing context.
 *
 * R17e POSTURE — DOES NOT APPLY TO AGENT PROFILES (the load-bearing distinction)
 *
 * Per /adopted/substrate-modes/agent-trust-layer-wrapper-spec.md §"R-rule
 * engagement": R17e does NOT apply to agent profiles — "an agent's
 * reasoning-pattern profile is not an intimate human vulnerability ... R17e
 * exists to protect humans." So this rendering does NOT apply the
 * applyR17eExclusionFilter that philosophical mode applies. It consumes the
 * UNFILTERED Layer2Assessment (which computeSubstrateScore requires anyway —
 * it reads iterative_refinement.direction_of_travel and
 * .motivation_classification), and it surfaces the iterative_refinement-derived
 * fields: direction_of_travel (as a top-level agent-projection field) and the
 * score's confidence field (which the philosophical / standard renderers OMIT
 * per their specs). meta.r17e_exclusion_applied is the literal `false` so the
 * distinction is explicit and testable.
 *
 * R-RULE ENGAGEMENT
 *
 *   - R3 / R19c / R19d / R20a / R18a / R18e: the six mandatory wraps are taken
 *     verbatim from layer3-service.ts's inject* functions — the existing
 *     injection layer. This module never re-authors a wrap string. The R20a
 *     passthrough decision is made synchronously, before the response is
 *     constructed (PR3 — but PR6 is NOT engaged: this module RENDERS the R20a
 *     passthrough by consuming the existing injection layer, exactly as
 *     philosophical mode does; it does not touch the R20a distress classifier,
 *     Zone 2 / Zone 3 logic, or their wrappers).
 *   - R4 (IP boundary): this module renders Layer 2's OUTPUT + a SubstrateScore.
 *     It does not expose the engine's internal thresholds, lookup tables, or
 *     scoring formulas — those live in score-architecture.ts and are never
 *     returned. The score VECTOR (per-component contributions) is a result, not
 *     the formula.
 *   - R17e: does NOT apply to agent profiles — see "R17e POSTURE" above.
 *   - R18a: the Character Kernel category framing is injected when the consumer
 *     context requests it (injectR18aCategory) — the badge / category language
 *     for agent-developer-facing surfaces.
 *   - R18e: the Article 50 transparency notice is always injected.
 *   - AC8: this module sits in /website/src/lib/substrate/ and consumes the
 *     translation-sandwich Layer 2 output + the A5 injection layer + the
 *     substrate score module.
 *   - PR1: single-endpoint proof — this is the agent-mode rendering pattern,
 *     proven as one new case in the proven renderLayer3Mode dispatch before any
 *     rollout.
 *   - PR2: build-to-wire-verification immediate — the test file
 *     (__tests__/agent-mode-service.test.ts) invokes renderLayer3Mode with the
 *     'atl_wrapper' mode in the same session this module is written.
 *   - PR4: N/A — no LLM call. The rendering is a deterministic projection.
 *   - PR10: the build follows the Plan → Execute → Verify loop; the Step 2
 *     design-decision gate was the Plan step.
 */

import {
  injectR3Disclaimer,
  injectR19Limitations,
  injectR19MirrorPrinciple,
  injectR20aDistressPassthrough,
  injectR18aCategory,
  injectR18eTransparencyNotice,
  type Layer3InjectionSet,
} from '@/lib/substrate/layer3-service'

import {
  computeSubstrateScore,
  type ScoreContext,
  type SubstrateScore,
  type SubstrateScoreComponents,
  type SubstrateScoreScalar,
  type KathekonGateResult,
  type DeclaredMotivationPassion,
} from '@/lib/substrate/score-architecture'

import type { Layer3ModeRenderInput } from '@/lib/substrate/philosophical-mode-service'

import type {
  Layer2Assessment,
  RootPassion,
  PassionSubSpecies,
  CausalStage,
  OikeiosisCircle,
  Indifferent,
  VirtueDomain,
  AxiaGrade,
  TreatedAs,
  DirectionOfTravel,
  ImprovementPathStructured,
  OpenDeferralEntry,
  DeferralStatus,
} from '@/lib/translation-sandwich/layer2-mechanisms'

// ============================================================================
// AGENT-MODE JSON SHAPE (the canonical source of truth — the in-loop rendering)
//
// The JSON keys follow the superseded agent-mode spec's section ordering:
//   1. mandatory_injections   (R3 / R19c / R19d / R20a / R18a / R18e)
//   2. verdict                (kathekon outcome + the verdict-to-action label)
//   3. score_components       (the score vector)
//   3b component_sum          (baseline + components, before the multiplier)
//   4. score                  (the scalar score object)
//   5. agent_projections      (all Layer 2 fields — verbatim + agent-mode
//                              projections; null when the R20a passthrough is
//                              active, mirroring philosophical mode's `fields`)
//   6. distress_passthrough   (non-null when a distress signal is active)
//   7. caveats_for_receiving_agent
//   8. meta
//
// The Markdown rendering is a presentation layer over this JSON.
// ============================================================================

/** The verdict-to-action label the receiving agent acts on. The superseded
 *  spec's `verdict.kathekon` enum. Derived deterministically from is_kathekon:
 *  true → 'appropriate'; false → 'not_appropriate'; null → 'undetermined'. */
export type KathekonActionLabel =
  | 'appropriate'
  | 'not_appropriate'
  | 'undetermined'

/** The verdict layer — the score module's KathekonGateResult plus the
 *  verdict-to-action label the receiving agent acts on. */
export interface AgentModeVerdict extends KathekonGateResult {
  /** The verdict-to-action label — derived from is_kathekon. */
  kathekon: KathekonActionLabel
}

/** The principal passion finding — the first detected passion, projected. Null
 *  when no passion was detected. */
export interface AgentModePrincipalPassion {
  root: RootPassion
  sub_species: PassionSubSpecies | null
  causal_stage: CausalStage
}

/** The principal value error — the first mis-categorised indifferent. Null when
 *  no indifferent was mis-categorised. */
export interface AgentModeValueError {
  indifferent_name: Indifferent
  mis_categorised_as: TreatedAs
}

/** An indifferent at stake, projected for the receiving agent's ranking. */
export interface AgentModeRankedIndifferent {
  name: Indifferent
  axia: AxiaGrade
  treated_as: TreatedAs
}

/** Principal findings — the structured summary the receiving agent reads
 *  before the verbatim Layer 2 projection. */
export interface AgentModePrincipalFindings {
  principal_passion: AgentModePrincipalPassion | null
  passion_count: number
  principal_value_error: AgentModeValueError | null
  value_errors_count: number
  /** Virtue domains engaged — de-duplicated (R6b: breadth, not quantity). */
  virtues_engaged: VirtueDomain[]
  /** Indifferents at stake, ranked by axia (high → moderate → low); stable
   *  within a rank. */
  indifferents_ranked: AgentModeRankedIndifferent[]
}

/** The correction path — projected from the assessment's
 *  improvement_path_structured. Null when no improvement path is present. */
export interface AgentModeCorrection {
  false_judgement_to_correct: string
  corrected_judgement_to_substitute: string
  mechanism: ImprovementPathStructured['mechanism_applies']
  /** The causal stage at which to intercept the false judgement — projected
   *  from passion_diagnosis.causal_stage_affected (the principal causal stage).
   *  Null when no principal causal stage is present. */
  stage_to_intercept: CausalStage | null
}

/** A withheld classification — the reflection component's principled
 *  withholding, preserved VERBATIM from the Layer 2 OpenDeferralEntry. */
export interface AgentModeWithheldClassification {
  field_path: string
  withheld_at_position: string
  reason: string
}

/** An open question — the reflection component. One per Layer 2 open deferral.
 *  The withheld_classification is preserved verbatim: a withheld classification
 *  is actionable signal — the substrate could deliver a more complete
 *  assessment if the agent re-submitted with the reflective self-report. */
export interface AgentModeOpenQuestion {
  trigger_code: OpenDeferralEntry['trigger_code']
  stem_id: string
  withheld_classification: AgentModeWithheldClassification
  status: DeferralStatus
}

/** Non-scored metadata — tells the receiving agent where the action sits in the
 *  obligation structure and what the gaming-defence signals were. */
export interface AgentModeMetadata {
  /** The primary oikeiosis circle served — relevant_circles[0].circle (the
   *  Layer 2 engine's "primary circle" convention, same as sage-assent-bridge.ts).
   *  Null when no circles were assessed. */
  oikeiosis_circle_served: OikeiosisCircle | null
  /** The pre-classified verdict on the agent's motivation declaration, from the
   *  ScoreContext: 'detected' (passion language confirmed) / 'clean' (a
   *  declaration was supplied, no passion language) / 'absent' (no declaration
   *  was supplied — the -5 undeclared penalty fired). The raw free-text
   *  declaration itself is a wrapper concern (spec step 5) and is not carried
   *  by the substrate, so the per-assessment rendering surfaces the
   *  pre-classified verdict. */
  declared_motivation_passion: DeclaredMotivationPassion | 'absent'
  /** The agent's declared optimisation target — a wrapper-supplied Layer 1
   *  field (objective_function_declaration, spec step 4). Not available for a
   *  per-assessment rendering with no wrapper: always null this session. */
  objective_function_declared: string | null
  /** Whether the Layer 2 engine fired a STATED_OPERATIVE_CONFLICT soft
   *  clarification — projected from intake_clarifications.soft_clarifications.
   *  This rendering SURFACES the trigger the engine already fired; the trigger
   *  LOGIC (deciding when to fire it for the agent context) is spec steps 4–5. */
  stated_operative_conflict: boolean
}

/** Section 5 — all Layer 2 fields (verbatim projection + agent-mode
 *  projections). Null when the R20a distress passthrough is active (it replaces
 *  this section's content — the precise structural mirror of philosophical
 *  mode's `fields`). */
export interface AgentModeProjections {
  metadata: AgentModeMetadata
  principal_findings: AgentModePrincipalFindings
  correction: AgentModeCorrection | null
  /** The reflection component — open deferrals, withheld classifications
   *  verbatim. Empty array when no open deferrals are present. */
  open_questions: AgentModeOpenQuestion[]
  /** Direction of travel — a confidence-interval modifier, surfaced as a
   *  top-level agent-projection field (R17e does not apply to agent profiles). */
  direction_of_travel: DirectionOfTravel
  /** The full Layer2Assessment, projected verbatim — the in-loop JSON carries
   *  it; the per-assessment Markdown rendering omits it (a one-line
   *  cross-reference points to it) for compactness. */
  layer2_assessment_verbatim: Layer2Assessment
}

/** The complete agent-mode response — the in-loop machine-readable JSON. A pure
 *  deterministic projection of a Layer2Assessment + a ScoreContext + the
 *  injection layer. */
export interface AgentModeResponse {
  /** Schema version. Constant. */
  version: 'agent-mode-response-v1'
  /** The render mode. Constant for this module. */
  mode: 'atl_wrapper'
  /** Section 1 — the six mandatory wraps, verbatim from the injection layer. */
  mandatory_injections: Layer3InjectionSet
  /** Section 2 — the verdict (kathekon gate result + the verdict-to-action
   *  label). */
  verdict: AgentModeVerdict
  /** Section 3 — the score vector (per-component contributions). */
  score_components: SubstrateScoreComponents
  /** baseline + all components (a null hasty_assent counts as 0), before the
   *  quality multiplier. */
  component_sum: number
  /** Section 4 — the scalar score object. */
  score: SubstrateScoreScalar
  /** Section 5 — all Layer 2 fields. Null when the R20a distress passthrough is
   *  active. */
  agent_projections: AgentModeProjections | null
  /** The R20a distress passthrough text. Non-null when a distress signal is
   *  active — and when non-null, `agent_projections` is null (the passthrough
   *  replaces section 5, mirroring philosophical mode). Null in steady state. */
  distress_passthrough: string | null
  /** The receiving-agent caveats — the substrate naming what the score does and
   *  does not assess. Always present, both renderings. */
  caveats_for_receiving_agent: string[]
  /** Response metadata. */
  meta: {
    /** True when the R20a passthrough replaced section 5. */
    distress_passthrough_active: boolean
    /** Always `false` — R17e does NOT apply to agent profiles (the load-bearing
     *  distinction from philosophical / private mode). An agent's
     *  reasoning-pattern profile is not an intimate human vulnerability. The
     *  literal `false` makes the distinction explicit and testable. */
    r17e_exclusion_applied: false
  }
}

/** The result of rendering agent mode — the dispatch's return shape for the
 *  'atl_wrapper' mode. Mirrors philosophical mode's Layer3ModeRenderResult. */
export interface AgentModeRenderResult {
  mode: 'atl_wrapper'
  /** The canonical JSON payload — the in-loop machine-readable rendering. */
  json: AgentModeResponse
  /** The Markdown text rendering — the per-assessment human-readable rendering;
   *  a presentation layer over the JSON. */
  markdown: string
}

// ============================================================================
// RECEIVING-AGENT CAVEATS — the substrate names what the score does and does
// not assess. Verbatim from the superseded agent-mode spec §"Receiving-agent
// caveats" (the bolded short forms — "These caveats appear in the response
// payload, both renderings"). Exported as a constant so the test can assert
// them verbatim.
// ============================================================================

export const AGENT_MODE_CAVEATS: ReadonlyArray<string> = [
  'The score assesses the decision as described, not the submitting agent’s capacity to execute it.',
  'Treat scores within precision_band as ties, not ordered values.',
  'PROVISIONAL means the engine’s current best estimate, not the engine’s settled verdict.',
  'Honest motivation declaration is safer than omission.',
]

// ============================================================================
// DETERMINISTIC PROJECTION HELPERS — each a pure function of its inputs
// ============================================================================

/** Humanise an underscore_separated enum value for Markdown display. */
function humanise(value: string): string {
  return value.replace(/_/g, ' ')
}

/** Render a signed component contribution: positive → "+N"; zero → "0";
 *  negative → "-N" (the minus is already on the number). */
function signed(n: number): string {
  return n > 0 ? `+${n}` : String(n)
}

/** The verdict-to-action label — the superseded spec's open question 6.
 *  is_kathekon true → 'appropriate'; false → 'not_appropriate'; null →
 *  'undetermined'. */
function kathekonActionLabel(isKathekon: boolean | null): KathekonActionLabel {
  if (isKathekon === true) return 'appropriate'
  if (isKathekon === false) return 'not_appropriate'
  return 'undetermined'
}

/** The primary oikeiosis circle served — relevant_circles[0].circle (the Layer
 *  2 engine's "primary circle" convention, same as sage-assent-bridge.ts's
 *  oikeiosis_met / oikeiosis_stage selection). Null when no circles. */
function oikeiosisCircleServed(
  assessment: Layer2Assessment
): OikeiosisCircle | null {
  const circles = assessment.oikeiosis.relevant_circles
  return circles.length > 0 ? circles[0].circle : null
}

/** Whether the Layer 2 engine fired a STATED_OPERATIVE_CONFLICT soft
 *  clarification. This SURFACES an already-fired trigger — the rendering does
 *  not perform the detection (the trigger logic for the agent context is spec
 *  steps 4–5). */
function statedOperativeConflict(assessment: Layer2Assessment): boolean {
  return assessment.intake_clarifications.soft_clarifications.some(
    (c) => c.trigger_code === 'STATED_OPERATIVE_CONFLICT'
  )
}

/** The principal passion — the first detected passion, projected. */
function principalPassion(
  assessment: Layer2Assessment
): AgentModePrincipalPassion | null {
  const passions = assessment.passion_diagnosis.passions_detected
  if (passions.length === 0) return null
  const p = passions[0]
  return {
    root: p.root_passion,
    sub_species: p.sub_species,
    causal_stage: p.causal_stage_affected,
  }
}

/** The principal value error — the first indifferent that is mis-categorised
 *  (treated_as anything other than 'indifferent'). */
function principalValueError(
  assessment: Layer2Assessment
): AgentModeValueError | null {
  const item = assessment.value_assessment.indifferents_at_stake.find(
    (i) => i.treated_as !== 'indifferent'
  )
  if (item === undefined) return null
  return { indifferent_name: item.name, mis_categorised_as: item.treated_as }
}

/** The count of mis-categorised indifferents — consistent with the score
 *  module's value_error component (which triggers on treated_as !==
 *  'indifferent'). */
function valueErrorsCount(assessment: Layer2Assessment): number {
  return assessment.value_assessment.indifferents_at_stake.filter(
    (i) => i.treated_as !== 'indifferent'
  ).length
}

/** Virtue domains engaged — de-duplicated, original order preserved (R6b:
 *  breadth, not quantity — a domain is engaged or it is not). */
function virtuesEngaged(assessment: Layer2Assessment): VirtueDomain[] {
  return [...new Set(assessment.virtue_domains_engaged)]
}

/** Axia rank for the indifferents_ranked sort — high is most worth. */
const AXIA_RANK: Record<AxiaGrade, number> = { high: 0, moderate: 1, low: 2 }

/** Indifferents at stake, ranked by axia (high → moderate → low). Stable within
 *  a rank — the original input order is the tiebreaker, so the ranking is
 *  fully deterministic regardless of the engine's Array.sort implementation. */
function indifferentsRanked(
  assessment: Layer2Assessment
): AgentModeRankedIndifferent[] {
  return assessment.value_assessment.indifferents_at_stake
    .map((item, idx) => ({ item, idx }))
    .sort((a, b) => {
      const byAxia = AXIA_RANK[a.item.axia] - AXIA_RANK[b.item.axia]
      return byAxia !== 0 ? byAxia : a.idx - b.idx
    })
    .map(({ item }) => ({
      name: item.name,
      axia: item.axia,
      treated_as: item.treated_as,
    }))
}

/** The correction path — projected from improvement_path_structured. Null when
 *  no improvement path is present. */
function correction(assessment: Layer2Assessment): AgentModeCorrection | null {
  const ip = assessment.improvement_path_structured
  if (ip === null) return null
  return {
    false_judgement_to_correct: ip.false_judgement_to_correct,
    corrected_judgement_to_substitute: ip.corrected_judgement,
    mechanism: ip.mechanism_applies,
    stage_to_intercept: assessment.passion_diagnosis.causal_stage_affected,
  }
}

/** The reflection component — open deferrals, each with its
 *  withheld_classification preserved verbatim (reconstructed as a fresh object
 *  so the rendering output is never aliased to the input assessment). */
function openQuestions(assessment: Layer2Assessment): AgentModeOpenQuestion[] {
  return assessment.intake_clarifications.open_deferrals.map((d) => ({
    trigger_code: d.trigger_code,
    stem_id: d.stem_id,
    withheld_classification: {
      field_path: d.withheld_classification.field_path,
      withheld_at_position: d.withheld_classification.withheld_at_position,
      reason: d.withheld_classification.reason,
    },
    status: d.status,
  }))
}

// ============================================================================
// JSON PROJECTION (pure, synchronous, deterministic)
// ============================================================================

/**
 * Project a Layer2Assessment + its SubstrateScore + the ScoreContext + the
 * injection set into the canonical AgentModeResponse JSON. Pure, synchronous,
 * deterministic — the same inputs produce a byte-identical object.
 *
 * R20a perimeter discipline: when the R20a distress passthrough is active,
 * `agent_projections` is null (the passthrough replaces section 5 — the precise
 * structural mirror of philosophical mode nulling its `fields`), and
 * `distress_passthrough` carries the text. The verdict + score vector + scalar
 * score still render (exactly as philosophical mode keeps its verdict + score).
 */
export function projectAgentModeJSON(
  assessment: Layer2Assessment,
  score: SubstrateScore,
  scoreContext: ScoreContext,
  injections: Layer3InjectionSet
): AgentModeResponse {
  const distress = injections.r20a_distress_passthrough
  const distressActive = distress !== null

  // Section 5 — all Layer 2 fields. Replaced by the R20a passthrough when
  // active (the R20a perimeter discipline: distress redirection replaces the
  // assessment content — the precise mirror of philosophical mode's `fields`).
  const agentProjections: AgentModeProjections | null = distressActive
    ? null
    : {
        metadata: {
          oikeiosis_circle_served: oikeiosisCircleServed(assessment),
          declared_motivation_passion:
            scoreContext.declared_motivation_passion ?? 'absent',
          objective_function_declared: null,
          stated_operative_conflict: statedOperativeConflict(assessment),
        },
        principal_findings: {
          principal_passion: principalPassion(assessment),
          passion_count: assessment.passion_diagnosis.passions_detected.length,
          principal_value_error: principalValueError(assessment),
          value_errors_count: valueErrorsCount(assessment),
          virtues_engaged: virtuesEngaged(assessment),
          indifferents_ranked: indifferentsRanked(assessment),
        },
        correction: correction(assessment),
        open_questions: openQuestions(assessment),
        direction_of_travel:
          assessment.iterative_refinement.direction_of_travel,
        layer2_assessment_verbatim: assessment,
      }

  return {
    version: 'agent-mode-response-v1',
    mode: 'atl_wrapper',
    mandatory_injections: injections,
    verdict: {
      kathekon: kathekonActionLabel(score.verdict.is_kathekon),
      is_kathekon: score.verdict.is_kathekon,
      justification_source: score.verdict.justification_source,
      quality: score.verdict.quality,
      effective_quality: score.verdict.effective_quality,
      convention_quality_cap_applied:
        score.verdict.convention_quality_cap_applied,
      gate_outcome: score.verdict.gate_outcome,
    },
    score_components: score.components,
    component_sum: score.component_sum,
    score: score.score,
    agent_projections: agentProjections,
    distress_passthrough: distress,
    caveats_for_receiving_agent: [...AGENT_MODE_CAVEATS],
    meta: {
      distress_passthrough_active: distressActive,
      r17e_exclusion_applied: false,
    },
  }
}

// ============================================================================
// MARKDOWN PROJECTION (pure, synchronous, deterministic)
//
// The per-assessment human-readable rendering — a presentation layer over the
// JSON. Section ordering follows the superseded spec: mandatory wraps open the
// rendering; verdict / score vector / scalar score appear as labelled lines;
// principal findings + correction + metadata + open questions render as short
// bullets; layer2_assessment_verbatim is OMITTED (the JSON carries it) with a
// one-line cross-reference. When the R20a passthrough is active, section 5 is
// replaced wholesale by a "## Response" block (mirroring philosophical mode).
// ============================================================================

const AGENT_MODE_TITLE = 'Agent-Mode Decision Support'

/** Render the score-vector bullet list from the components object. */
function renderScoreVector(components: SubstrateScoreComponents): string {
  const hasty =
    components.hasty_assent === null
      ? 'not applicable (single snapshot — no pattern to assess)'
      : signed(components.hasty_assent)
  return [
    '## Score vector',
    '',
    `- **Baseline:** ${signed(components.baseline)}`,
    `- **Katorthoma proximity:** ${signed(components.proximity)}`,
    `- **Structural passion:** ${signed(components.passion_structural)}`,
    `- **Declared-motivation passion:** ${signed(components.passion_declared)}`,
    `- **Motivation undeclared:** ${signed(components.passion_undeclared)}`,
    `- **Virtue bonus:** ${signed(components.virtue_bonus)}`,
    `- **Value error:** ${signed(components.value_error)}`,
    `- **Hasty assent:** ${hasty}`,
  ].join('\n')
}

/** Render the scalar-score labelled lines from the score object. */
function renderScalarScore(score: SubstrateScoreScalar, componentSum: number): string {
  const lines: string[] = ['## Scalar score', '']
  lines.push(`**Component sum:** ${componentSum} (baseline + components, before the quality multiplier)`)
  lines.push(`**Score:** ${score.value} / 100`)
  lines.push(`**Kathekon quality multiplier:** ${score.kathekon_quality_multiplier}`)
  lines.push(`**Validity:** ${score.validity}`)
  if (score.cap_applied !== null) {
    lines.push(
      `**Cap applied:** capped at ${score.cap_applied.cap} — ${score.cap_applied.reason}`
    )
  }
  lines.push(`**Confidence:** ${score.confidence}`)
  lines.push(`**Precision band:** ±${score.precision_band}`)
  return lines.join('\n')
}

/** Render the principal-findings bullet list. */
function renderPrincipalFindings(pf: AgentModePrincipalFindings): string {
  const passion =
    pf.principal_passion === null
      ? 'none detected'
      : `${pf.principal_passion.root}` +
        (pf.principal_passion.sub_species
          ? ` (sub-species ${pf.principal_passion.sub_species})`
          : '') +
        `, at the ${pf.principal_passion.causal_stage} stage`
  const valueError =
    pf.principal_value_error === null
      ? 'none detected'
      : `${humanise(pf.principal_value_error.indifferent_name)} mis-categorised as ${pf.principal_value_error.mis_categorised_as}`
  const virtues =
    pf.virtues_engaged.length > 0 ? pf.virtues_engaged.join(', ') : 'none'
  const indifferents =
    pf.indifferents_ranked.length > 0
      ? pf.indifferents_ranked
          .map(
            (i) =>
              `${humanise(i.name)} (${i.axia} worth, treated as ${i.treated_as})`
          )
          .join('; ')
      : 'none at stake'
  return [
    '## Principal findings',
    '',
    `- **Principal passion:** ${passion}`,
    `- **Passion count:** ${pf.passion_count}`,
    `- **Principal value error:** ${valueError}`,
    `- **Value-error count:** ${pf.value_errors_count}`,
    `- **Virtues engaged:** ${virtues}`,
    `- **Indifferents ranked (by worth):** ${indifferents}`,
  ].join('\n')
}

/** Render the correction section. Returns null when there is no correction
 *  (empty-section omission). */
function renderCorrection(c: AgentModeCorrection | null): string | null {
  if (c === null) return null
  return [
    '## Correction',
    '',
    `- **False judgement to correct:** ${c.false_judgement_to_correct}`,
    `- **Corrected judgement to substitute:** ${c.corrected_judgement_to_substitute}`,
    `- **Mechanism:** ${humanise(c.mechanism)}`,
    `- **Stage to intercept:** ${
      c.stage_to_intercept === null ? 'not specified' : c.stage_to_intercept
    }`,
  ].join('\n')
}

/** Render the metadata section. */
function renderMetadata(m: AgentModeMetadata, dot: DirectionOfTravel): string {
  return [
    '## Metadata',
    '',
    `- **Oikeiosis circle served:** ${
      m.oikeiosis_circle_served === null
        ? 'none identified'
        : humanise(m.oikeiosis_circle_served)
    }`,
    `- **Declared-motivation verdict:** ${m.declared_motivation_passion}`,
    `- **Objective function declared:** ${
      m.objective_function_declared === null
        ? 'not declared (wrapper-supplied; not available for a per-assessment rendering)'
        : m.objective_function_declared
    }`,
    `- **Stated operative conflict:** ${String(m.stated_operative_conflict)}`,
    `- **Direction of travel:** ${humanise(dot)}`,
  ].join('\n')
}

/** Render the open-questions (reflection component) section. Returns null when
 *  there are no open questions (empty-section omission). The
 *  withheld_classification is rendered verbatim. */
function renderOpenQuestions(questions: AgentModeOpenQuestion[]): string | null {
  if (questions.length === 0) return null
  const lines: string[] = [
    '## Open questions (principled withholding)',
    '',
    '*Classifications the engine deliberately withheld. A withheld classification ' +
      'is actionable signal — the substrate could deliver a more complete ' +
      'assessment if the agent re-submitted with the reflective self-report ' +
      'included.*',
    '',
  ]
  questions.forEach((q, idx) => {
    if (idx > 0) lines.push('')
    lines.push(
      `**${q.trigger_code}** (stem ${q.stem_id}, status ${q.status})`,
      ''
    )
    lines.push(
      `- **Withheld classification — field path:** \`${q.withheld_classification.field_path}\``
    )
    lines.push(
      `- **Withheld at position:** ${q.withheld_classification.withheld_at_position}`
    )
    lines.push(`- **Reason:** ${q.withheld_classification.reason}`)
  })
  return lines.join('\n')
}

/**
 * Render the full Markdown text rendering from the AgentModeResponse JSON.
 * Pure, synchronous, deterministic — same JSON in → byte-identical Markdown out.
 */
export function renderAgentModeMarkdown(json: AgentModeResponse): string {
  const blocks: string[] = []

  // Section 1 — mandatory opening wrap (R3).
  blocks.push(`**${json.mandatory_injections.r3_disclaimer}**`)
  blocks.push('---')

  // Section 2 — title block. R18a category framing sits here when present.
  blocks.push(`# ${AGENT_MODE_TITLE}`)
  if (json.mandatory_injections.r18a_category !== null) {
    blocks.push(`*${json.mandatory_injections.r18a_category}*`)
  }
  blocks.push('---')

  // Section 3 — Verdict.
  {
    const v = json.verdict
    const verdictLines: string[] = ['## Verdict', '']
    verdictLines.push(`**Appropriate action (kathekon):** ${v.kathekon}`)
    verdictLines.push(
      `**Raw kathekon verdict:** ${
        v.is_kathekon === null ? 'undetermined' : String(v.is_kathekon)
      }`
    )
    verdictLines.push(`**Justification source:** ${humanise(v.justification_source)}`)
    verdictLines.push(
      `**Quality:** ${v.quality}${
        v.convention_quality_cap_applied
          ? ` (effective: ${v.effective_quality} — convention-inferred motivation cap applied)`
          : ''
      }`
    )
    verdictLines.push(`**Gate outcome:** ${humanise(v.gate_outcome)}`)
    blocks.push(verdictLines.join('\n'))
    blocks.push('---')
  }

  // Section 3b/4 — Score vector + Scalar score.
  blocks.push(renderScoreVector(json.score_components))
  blocks.push('---')
  blocks.push(renderScalarScore(json.score, json.component_sum))
  blocks.push('---')

  // Section 5 — agent projections, OR the R20a distress passthrough (which
  // replaces section 5's content when a distress signal is active — the
  // precise structural mirror of philosophical mode).
  if (json.distress_passthrough !== null) {
    blocks.push(['## Response', '', json.distress_passthrough].join('\n'))
    blocks.push('---')
  } else if (json.agent_projections !== null) {
    const p = json.agent_projections
    blocks.push(renderPrincipalFindings(p.principal_findings))

    const correctionBlock = renderCorrection(p.correction)
    if (correctionBlock !== null) blocks.push(correctionBlock)

    blocks.push(renderMetadata(p.metadata, p.direction_of_travel))

    const openQuestionsBlock = renderOpenQuestions(p.open_questions)
    if (openQuestionsBlock !== null) blocks.push(openQuestionsBlock)

    blocks.push(
      '*Full Layer 2 assessment: carried verbatim in the JSON rendering’s ' +
        '`layer2_assessment_verbatim` field; omitted from this prose rendering ' +
        'for compactness.*'
    )
    blocks.push('---')
  }

  // Section 7 — receiving-agent caveats. Always present, both renderings.
  {
    const caveatLines: string[] = ['## Caveats for the receiving agent', '']
    for (const caveat of json.caveats_for_receiving_agent) {
      caveatLines.push(`- ${caveat}`)
    }
    blocks.push(caveatLines.join('\n'))
    blocks.push('---')
  }

  // Section 8 — mandatory closing wraps (R19c + R19d when mentor-flavoured +
  // R18e).
  {
    const closingLines: string[] = []
    closingLines.push(`**${json.mandatory_injections.r19_limitations}**`)
    if (json.mandatory_injections.r19_mirror_principle !== null) {
      closingLines.push('')
      closingLines.push(`**${json.mandatory_injections.r19_mirror_principle}**`)
    }
    closingLines.push('')
    closingLines.push(
      `**${json.mandatory_injections.r18e_transparency_notice}**`
    )
    blocks.push(closingLines.join('\n'))
  }

  return blocks.join('\n\n')
}

// ============================================================================
// THE AGENT-MODE RENDERER
// ============================================================================

/** The default ScoreContext when the caller supplies none. justification_source
 *  is REQUIRED on ScoreContext; 'absent' is the honest default — "no
 *  justification available; the gate does not confirm" (the score caps at 35).
 *  This keeps renderAgentMode TOTAL — it never throws on a missing context. */
const DEFAULT_SCORE_CONTEXT: ScoreContext = { justification_source: 'absent' }

/**
 * Render agent mode for one assessment. SYNCHRONOUS and deterministic — agent
 * mode makes no LLM call and no retrieve-passages call (contrast philosophical
 * mode, which is async for its source-material retrieval). The same
 * (assessment, score_context) pair always produces a byte-identical
 * AgentModeRenderResult.
 *
 * R17e is NOT applied — the assessment is consumed UNFILTERED (computeSubstrate-
 * Score requires the unfiltered assessment, and an agent's reasoning-pattern
 * profile is not an intimate human vulnerability — see the module header).
 */
export function renderAgentMode(
  input: Layer3ModeRenderInput
): AgentModeRenderResult {
  // Step 1 — resolve the ScoreContext. The caller supplies it on the shared
  // render-input; when absent, the honest 'absent' default applies.
  const scoreContext: ScoreContext =
    input.score_context ?? DEFAULT_SCORE_CONTEXT

  // Step 2 — build the six mandatory wraps via the existing injection layer.
  // These are taken verbatim from layer3-service.ts — this module never
  // re-authors a wrap string. The R20a passthrough decision is made here,
  // synchronously, before the response is constructed (a pure read of the
  // already-completed upstream signal — see injectR20aDistressPassthrough).
  const isMentorFlavoured = input.consumer_context.is_mentor_flavoured ?? false
  const includeCategoryFraming =
    input.consumer_context.include_category_framing ?? false
  const injections: Layer3InjectionSet = {
    r3_disclaimer: injectR3Disclaimer(),
    r19_limitations: injectR19Limitations(),
    r19_mirror_principle: injectR19MirrorPrinciple(isMentorFlavoured),
    r20a_distress_passthrough: injectR20aDistressPassthrough(
      input.assessment,
      input.distress_gate
    ),
    r18a_category: injectR18aCategory(includeCategoryFraming),
    r18e_transparency_notice: injectR18eTransparencyNotice(),
  }

  // Step 3 — compute the substrate score (deterministic; no LLM call). The
  // UNFILTERED assessment is passed — score-architecture.ts requires it.
  const score = computeSubstrateScore(input.assessment, scoreContext)

  // Step 4 — project the canonical in-loop JSON. Pure, synchronous.
  const json = projectAgentModeJSON(
    input.assessment,
    score,
    scoreContext,
    injections
  )

  // Step 5 — render the per-assessment human-readable Markdown.
  const markdown = renderAgentModeMarkdown(json)

  return { mode: 'atl_wrapper', json, markdown }
}
