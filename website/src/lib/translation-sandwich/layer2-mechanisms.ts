/**
 * layer2-mechanisms.ts — Layer 2 of the translation-sandwich engine.
 *
 * Per ADR-006 (Layer 2 Mechanism Algorithm, Sub-session M1-CP2, 2026-05-04).
 * Per ADR-005 (Layer 1 Schema Specification, Sub-session M1-CP1, 2026-05-04).
 * Per ADR-004 (Translation-Sandwich Engine Pilot on /api/reason, Sub-session E10).
 *
 * DETERMINISTIC MECHANISM APPLICATION. This module reads a Layer1Schema
 * (Layer 1's structured feature extraction) and produces a Layer2Assessment
 * (per-mechanism assessment) using a fixed deterministic algorithm. No LLM.
 * No I/O. No async. No module state.
 *
 * Compliance:
 *   - AC1: N/A — no model selected (no LLM call); cited per cache Element 6 row
 *           "Documentation, schema migration, registry update — N/A".
 *   - AC8: Module under translation-sandwich/ — second build under the architecture.
 *   - KG1: Pure synchronous function; no fire-and-forget; no module-level cache;
 *           no DB writes; no self-calls.
 *   - PR3: Synchronous; safety-systems-are-synchronous discipline applied even
 *           though Layer 2 is not itself a safety surface.
 *   - R7:  Verbatim evidence quotes preserved through to per-mechanism outputs.
 *   - R8a: Controlled vocabularies (Greek identifiers, canonical taxonomies).
 *
 * Idempotency: same Layer1Schema input → byte-for-byte equal Layer2Assessment
 * output. No clock reads. No randomness. Verified by harness Phase 3.
 *
 * Status at file creation: Wired (standalone). Reaches Verified (standalone)
 * after harness Phase 3 + Phase 4 pass against fixtures F1–F4. Not imported
 * by any route until M1-CP4 (per ADR-004 §10.1 inter-checkpoint state).
 */

import type {
  Layer1Schema,
  ControlFilterElement,
  PassionPresent,
  CausalStageEvidence,
  OikeiosisCircleEngaged,
  ValueCategoryAtStake,
  KathekonFactor,
  UrgencyIndicator,
  RootPassion,
  PassionSubSpecies,
  CausalStage,
  OikeiosisCircle,
  Indifferent,
  AgentFraming,
  AgentNamedPosition,
  // Added 2026-05-06 (M1-CP4b) — for §3.9 lookup-table typing
  EupatheiaShape,
  // Added 2026-05-06 (M1-CP4e) — for §3.10 Tier 1 ELEMENT_FUSION detection
  ElementFusionDetected,
} from './layer1-extractor'

// Re-export Layer 1 vocabularies that Layer 3 + harness will consume.
export type {
  RootPassion,
  PassionSubSpecies,
  CausalStage,
  OikeiosisCircle,
  Indifferent,
  AgentFraming,
  AgentNamedPosition,
  // Added 2026-05-06 (M1-CP4e) — re-exported for orchestrator + harness consumption
  ElementFusionDetected,
}

// ============================================================================
// LAYER 2 CONTROLLED VOCABULARIES (R8a) — extends ADR-005 §2; same set
// Per ADR-006 §2.
// ============================================================================

export type ProhairesisClassification = 'within' | 'outside'

export type ControlFilterReasoning =
  | 'agent_identified_within'
  | 'agent_identified_outside'
  | 'lookup_table_match_within'
  | 'default_outside_for_unspecified'

export type CiceroVerdict =
  | 'honourable_prevails'
  | 'advantageous_prevails'
  | 'both_high_aligned'
  | 'balanced_neither_decisive'
  | 'indeterminate'

export type KathekonQuality = 'strong' | 'moderate' | 'marginal' | 'contrary'

export type SenecanGrade = 'pre_progress' | 'grade_1' | 'grade_2' | 'grade_3'

export type DirectionOfTravel = 'improving' | 'stable' | 'declining' | 'single_snapshot'

export type KatorthomaProximity =
  | 'reflexive'
  | 'habitual'
  | 'deliberate'
  | 'principled'
  | 'sage_like'

export type VirtueDomain = 'phronesis' | 'dikaiosyne' | 'andreia' | 'sophrosyne'

export type StageScore = 'strong' | 'adequate' | 'weak' | 'not_applied'

export type HastyAssentRisk = 'high' | 'moderate' | 'low' | 'none'

export type AxiaGrade = 'high' | 'moderate' | 'low'

export type TreatedAs = 'good' | 'evil' | 'indifferent'

// Added 2026-05-06 (M1-CP4b) — AC-13 / AC-14 trigger vocabulary per ADR-006 §2

export type IntakeTriggerCode =
  | 'STATED_OPERATIVE_CONFLICT'
  | 'STATED_EQUANIMITY_UNVERIFIED'
  | 'EUPATHEIA_BOUNDARY'
  | 'PRAXIS_MOTIVATION_AMBIGUITY'

export type DeferralStatus = 'open' | 'closed'

/** Layer 2's classification of motivation underlying a praxis-stage action.
 *  - 'virtue_explicit' — the agent named virtue-aligned motivation (e.g., "for the principle").
 *  - 'virtue_inferred' — Layer 2 inferred virtue alignment (reserved; not used at M1).
 *  - 'convention_inferred' — Layer 2 detected convention-shaped motivation (reserved; not used at M1).
 *  - 'unclear_pending_clarification' — set when PRAXIS_MOTIVATION_AMBIGUITY fires per AC-14.
 *  - null — not applicable (no praxis-stage action observed in the input). */
export type MotivationClassification =
  | 'virtue_explicit'
  | 'virtue_inferred'
  | 'convention_inferred'
  | 'unclear_pending_clarification'
  | null

// Added 2026-05-06 (M1-CP4e) — AC-13 Tier 1 force-clarification vocabulary per ADR-006 §3.10 + ADR-008 §3.5

/** Engine-level Tier 1 trigger codes per D13. Surface-level Tier 1 codes (per D13's
 *  surface-level table) are out of scope for `/api/reason`. */
export type Tier1TriggerCode =
  | 'ELEMENT_FUSION'      // Layer 1; fired by element_fusion_detected.fused === true
  | 'SCOPE_AMBIGUITY'     // Layer 2 / Position 6 (oikeiosis_stage)
  | 'TEMPORAL_AMBIGUITY'  // Layer 2 / Position 2 (passion_root_detection)

/** Where in the engine sequencing the Tier 1 trigger fired. Used for diagnostics +
 *  meta logging + harness coverage. */
export type Tier1FiredAtPosition = 'layer1' | 'position-2' | 'position-6'

// ============================================================================
// PER-MECHANISM OUTPUT SHAPES (per ADR-006 §2)
// ============================================================================

export interface ControlFilterClassifiedItem {
  item: string
  agent_named_position: AgentNamedPosition
  classification: ProhairesisClassification
  reasoning: ControlFilterReasoning
}

export interface ControlFilter {
  within_prohairesis: ControlFilterClassifiedItem[]
  outside_prohairesis: ControlFilterClassifiedItem[]
  disambiguation_required: ControlFilterClassifiedItem[]
}

export interface PassionDiagnosisEntry {
  id: string
  name: string
  root_passion: RootPassion
  sub_species: PassionSubSpecies | null
  false_judgement: string
  correct_judgement: string
  causal_stage_affected: CausalStage
  evidence: string
}

export interface PassionDiagnosis {
  passions_detected: PassionDiagnosisEntry[]
  false_judgements: string[]
  correct_judgements: string[]
  causal_stage_affected: CausalStage | null
}

export interface OikeiosisCircleAssessment {
  stage: 1 | 2 | 3 | 4 | 5
  circle: OikeiosisCircle
  description: string
  honourability_grade: 1 | 2 | 3
  advantageousness_grade: 1 | 2 | 3
  cicero_verdict: CiceroVerdict
  obligation_met: boolean | null
  tension: string | null
}

export interface Oikeiosis {
  relevant_circles: OikeiosisCircleAssessment[]
  deliberation_notes: string
}

export interface IndifferentAtStakeAssessment {
  name: Indifferent
  axia: AxiaGrade
  treated_as: TreatedAs
  evidence: string
  error: string | null
}

export interface ValueAssessment {
  indifferents_at_stake: IndifferentAtStakeAssessment[]
  value_error: string | null
}

export interface KathekonAssessment {
  is_kathekon: boolean | null
  quality: KathekonQuality
  justification: string
}

export interface IterativeRefinementProgressDimensions {
  passion_reduction: string
  judgement_quality: string
  disposition_stability: string
  oikeiosis_extension: string
}

export interface IterativeRefinement {
  senecan_grade: SenecanGrade
  progress_dimensions: IterativeRefinementProgressDimensions
  direction_of_travel: DirectionOfTravel
  /** Added 2026-05-06 (M1-CP4b) — set to 'unclear_pending_clarification' when
   *  PRAXIS_MOTIVATION_AMBIGUITY fires per AC-14; 'virtue_explicit' when the
   *  agent named motivation at praxis-stage; null when not applicable
   *  (no praxis-stage action observed). Other values reserved for future
   *  motivation-classification work. */
  motivation_classification: MotivationClassification
}

export interface ImprovementPathStructured {
  false_judgement_to_correct: string
  mechanism_applies:
    | 'passion_diagnosis'
    | 'control_filter'
    | 'oikeiosis'
    | 'value_assessment'
    | 'kathekon_assessment'
  corrected_judgement: string
}

export interface StageScores {
  control_filter: StageScore
  passion_diagnosis: StageScore
  oikeiosis: StageScore
  value_assessment: StageScore
  kathekon_assessment: StageScore
  iterative_refinement: StageScore
}

// Added 2026-05-06 (M1-CP4b) — intake-clarification entries per AC-13 / AC-14, ADR-006 §2

export interface SoftClarification {
  /** Tier 2 trigger code per the d-a16 catalogue. */
  trigger_code: 'STATED_OPERATIVE_CONFLICT' | 'STATED_EQUANIMITY_UNVERIFIED'
  /** Always 2 for soft clarifications. */
  intake_tier: 2
  /** d-a16 catalogue stem ID. */
  stem_id: string
  /** Slot variables filled from the assessment + Layer 1 evidence. Keys per
   *  d-a16 stem specification (e.g., 'STATED_CIRCLE_TARGET', 'SITUATION'). */
  slot_fills: Record<string, string>
  /** Plain-language description of which fields would refine if the practitioner
   *  answers. */
  scope_of_change: string
}

export interface OpenDeferralEntry {
  /** Tier 3 trigger code per the d-a16 catalogue. */
  trigger_code: 'EUPATHEIA_BOUNDARY' | 'PRAXIS_MOTIVATION_AMBIGUITY'
  /** Always 3 for open deferrals. */
  intake_tier: 3
  /** d-a16 catalogue stem ID. */
  stem_id: string
  /** Slot variables filled from the assessment + Layer 1 evidence per the
   *  d-a16 stem specification. */
  slot_fills: Record<string, string>
  /** Names which classification field is being withheld and why. The field_path
   *  is a dot-path into the Layer2Assessment shape. */
  withheld_classification: {
    field_path: string
    withheld_at_position: string
    reason: string
  }
  /** Lifecycle status. Layer 2 always sets 'open' at creation. The 'closed'
   *  transition is a downstream concern (D14b deferral-resolution surface). */
  status: DeferralStatus
}

export interface IntakeClarifications {
  /** Tier 2 soft clarifications produced this assessment. Empty when no Tier 2
   *  triggers fire. */
  soft_clarifications: SoftClarification[]
  /** Tier 3 OPEN_DEFERRAL entries produced this assessment. Empty when no Tier 3
   *  triggers fire. */
  open_deferrals: OpenDeferralEntry[]
}

// Added 2026-05-06 (M1-CP4e) — AC-13 Tier 1 force-clarification interface per ADR-006 §3.10 + ADR-008 §3.5

/** A force-clarification trigger fired by the engine. The orchestrator (per ADR-008
 *  §5) inspects this — if non-null, the engine halts at the named position, Layer 3
 *  is not called, and the route emits a force-clarification response per ADR-008 §2.
 *  When null, the engine proceeds normally and Layer 2 produces a full assessment.
 *
 *  Tier 1 is engine-flow-control, NOT a field on Layer2Assessment. detectTier1Trigger
 *  returns this for ELEMENT_FUSION (Layer 1 upstream); applyMechanisms returns
 *  { tier1_trigger: Tier1Trigger } as one branch of its discriminated-union return
 *  type for SCOPE_AMBIGUITY (Position 6) + TEMPORAL_AMBIGUITY (Position 2). */
export interface Tier1Trigger {
  /** The engine-level trigger code per Tier1TriggerCode. */
  trigger_code: Tier1TriggerCode
  /** The slot-filled question text in English, ready for the client to render
   *  verbatim. Per D13 stems; pre-D-A16 alt-3 derived. */
  question_text: string
  /** The d-a16 catalogue stem ID once promoted; null pre-promotion. */
  stem_id: string | null
  /** The resolved slot variables. Empty object for SCOPE_AMBIGUITY + TEMPORAL_AMBIGUITY
   *  (canonical stems with no slots). For ELEMENT_FUSION, contains
   *  LIST_OF_FUSED_CONCERNS as a comma-separated string. */
  slot_fills: Record<string, string>
  /** Where in the engine sequencing the trigger fired. */
  fired_at_position: Tier1FiredAtPosition
}

/** Discriminated-union return type for applyMechanisms (post M1-CP4e). When Tier 1
 *  fires at Position 2 or Position 6, applyMechanisms returns this shape; the
 *  orchestrator type-narrows on the presence of `tier1_trigger`. ELEMENT_FUSION is
 *  detected upstream by detectTier1Trigger and never reaches applyMechanisms. */
export interface Tier1ShortCircuit {
  tier1_trigger: Tier1Trigger
}

// ============================================================================
// TOP-LEVEL ASSESSMENT (per ADR-006 §2)
// ============================================================================

export interface Layer2Assessment {
  version: 'layer2-assessment-v1'
  layer1_schema_version: 'layer1-schema-v1'
  passion_diagnosis: PassionDiagnosis
  control_filter: ControlFilter
  oikeiosis: Oikeiosis
  value_assessment: ValueAssessment
  kathekon_assessment: KathekonAssessment
  iterative_refinement: IterativeRefinement
  katorthoma_proximity: KatorthomaProximity
  ruling_faculty_state: string
  virtue_domains_engaged: VirtueDomain[]
  improvement_path_structured: ImprovementPathStructured | null
  stage_scores: StageScores
  hasty_assent_risk: HastyAssentRisk
  /** Added 2026-05-06 (M1-CP4b) — intake-clarification triggers per AC-13 / AC-14.
   *  Always present; arrays empty when no triggers fire. Carries Tier 2 soft
   *  clarifications and Tier 3 OPEN_DEFERRAL entries from the four engine-level
   *  triggers. Layer 3 reads this field to render soft_clarification_prose +
   *  open_deferrals_prose per ADR-007. */
  intake_clarifications: IntakeClarifications
  layer1_ambiguity_notes: string[]
  layer2_ambiguity_notes: string[]
  /**
   * Added 2026-05-13 (D-A7-R20A-GATE-SCAFFOLDED-VERIFIED-2026-05-13) — A7
   * server-side R20a gate's sub-threshold distress signal. When A7 detects
   * MILD severity distress (route-level perimeter at /api/reason/route.ts
   * line 544 does NOT redirect for mild — only for moderate/acute), A7
   * attaches this flag to the assessment via attachDistressSignalToAssessment.
   * A5.4 reads this field during Layer 3 prose generation and injects
   * R20A_DISTRESS_PASSTHROUGH into the prose output.
   *
   * Optional + defensive default false: when A7 is bypassed (flag UNSET in
   * Vercel — the default at session close) or finds no signal, the field is
   * absent. A5.4's defensive read via type assertion handles this.
   *
   * Type narrows safely: A5's existing defensive read of
   * `(assessment as { distress_signal?: boolean }).distress_signal` continues
   * to work; the type assertion is now redundant but harmless.
   *
   * See: /website/src/lib/substrate/r20a-gate.ts §A7.3
   * See: /website/src/lib/substrate/layer3-service.ts §A5.4
   * See: /manifest.md §R20a
   */
  distress_signal?: boolean
}

// ============================================================================
// MODULE OPTIONS
// ============================================================================

export interface ApplyOptions {
  /** Reserved for future use (e.g., per-consumer mechanism weighting overrides).
   *  CP2 ignores all options; included for forward-compatibility. */
  reserved?: never
}

// ============================================================================
// LOOKUP TABLES — control filter (per ADR-006 §3.1)
// ============================================================================

const WITHIN_LOOKUP_KEYWORDS: ReadonlyArray<string> = [
  // First-person mental-state markers
  'my judgement',
  'my judgment',
  'my thought',
  'my belief',
  'my decision',
  'my choice',
  'my response',
  'my reaction',
  'my attitude',
  'my intention',
  'my impulse',
  'my desire',
  'my aversion',
  'my values',
  'my character',
  'my will',
  'my mindset',
  'my perspective',
  'my view',
  // Faculty-of-choice phrasings
  'what i think',
  'how i respond',
  'how i react',
  'what i decide',
  'what i choose',
  'how i frame',
  'how i interpret',
  'what i believe',
  // Direct prohairesis terms
  'prohairesis',
  'ruling faculty',
  'moral choice',
  'rational assent',
]

// ============================================================================
// LOOKUP TABLES — passion diagnosis (per ADR-006 §3.2)
// ============================================================================

const ROOT_FALSE_JUDGEMENT: Record<RootPassion, string> = {
  epithumia: 'There is good in some external object I do not have.',
  hedone: 'There is good in this external object I now have.',
  phobos: 'There is evil in some future external object.',
  lupe: 'There is evil in some present external object.',
}

const ROOT_CORRECT_JUDGEMENT: Record<RootPassion, string> = {
  epithumia:
    'Externals are indifferent. The genuine good is virtue alone — exercised through right judgement, just impulse, and stable character.',
  hedone:
    'External pleasures are indifferent. Rejoicing belongs to virtue, not to externals; the wise rejoice in their own correct action, not in objects of pleasure.',
  phobos:
    'Externals are indifferent. The only evil is vice. What I fear cannot harm my prohairesis; the body and externals are not the self.',
  lupe:
    'Externals are indifferent. What has been lost or threatened is no genuine good. Distress is a false judgement that something external bears on virtue.',
}

const SUB_SPECIES_FALSE_JUDGEMENT: Record<PassionSubSpecies, string> = {
  // Epithumia sub-species
  orge: 'I have been wronged by another, and the proper response is retaliation.',
  eros: 'Sexual or romantic possession of this person is good.',
  pothos: 'The absence of this loved person is an evil to me.',
  philedonia: 'Bodily pleasure is the genuine good.',
  philoplousia: 'Wealth is the genuine good.',
  philodoxia: 'Reputation and honour from others are the genuine good.',
  // Hedone sub-species
  kelesis: 'This impression that flatters me is true; my pleasure in it is justified.',
  epichairekakia: "Another's harm is good for me.",
  terpsis: 'This sensual pleasure I now experience is the genuine good.',
  // Phobos sub-species
  deima: 'I am about to be destroyed.',
  oknos: 'Action will bring evil; inaction is safer.',
  aischyne: 'Others see me as worthless and I am worthless.',
  thambos: 'This unexpected event proves the world is dangerous.',
  thorybos: 'I cannot think clearly because something terrible looms.',
  agonia: 'An imminent evil is overtaking me and I cannot avert it.',
  // Lupe sub-species
  eleos: "Others' suffering harms me too.",
  phthonos: "Another's good is evil for me.",
  zelotypia: 'I am being deprived of what is rightfully mine.',
  penthos: 'I have lost something genuinely good.',
  achos: 'An irreversible evil has befallen me.',
}

const SUB_SPECIES_CORRECT_JUDGEMENT: Record<PassionSubSpecies, string> = {
  orge:
    'No external action by another can harm my prohairesis. Wrongs done by others reflect their character, not my good.',
  eros:
    "Possession of any external — including another's affection — is indifferent. The genuine good is right judgement, not the object of desire.",
  pothos:
    'The absence of any external is indifferent. What I have lost is no genuine good; the genuine good is virtue alone, which absence cannot remove.',
  philedonia:
    'Bodily pleasure is indifferent — preferred when it accompanies right action, of no consequence otherwise. The genuine good is virtue.',
  philoplousia:
    'Wealth is indifferent — preferred when it serves right action, of no consequence otherwise. The genuine good is virtue.',
  philodoxia:
    'Reputation is indifferent. The opinions of others — even good opinions — bear nothing on virtue, which alone is the genuine good.',
  kelesis:
    'Examine the impression. The pleasing surface is no proof of truth. Assent only to what survives examination.',
  epichairekakia:
    "Another's harm is no good for me. The good of another and my own good are not in opposition; we share rational nature.",
  terpsis: 'Sensual pleasure is indifferent. The good is in right judgement about the pleasure, not in the pleasure itself.',
  deima:
    'I cannot be destroyed in my essential self — my prohairesis. The body is indifferent; what I fear is no genuine evil.',
  oknos:
    'The only evil is vice; inaction from fear is itself a vicious failure to act. Right action proceeds from right judgement, not from fear.',
  aischyne:
    "Others' opinion of me is indifferent. My worth is in my virtue, which others' assessments do not touch.",
  thambos:
    'Unexpected events do not change the nature of things. Externals are indifferent whether anticipated or not.',
  thorybos:
    'Stop. Examine the impression. What I cannot think clearly about is itself an indifferent — clarity is restored by withholding assent until the impression is examined.',
  agonia:
    'The imminent event is indifferent. My agitation is the false judgement that virtue depends on its outcome.',
  eleos:
    "Others' suffering is indifferent to my good. I can act with care and with kindness without sharing their false judgement that the suffering is genuine evil.",
  phthonos: "Another's good is no evil for me. Goods of virtue are not scarce; we both can have them.",
  zelotypia: 'Nothing external belongs to me by right. Possession by another is indifferent.',
  penthos: 'What I have lost is no genuine good. The good — virtue — is not lost with the external.',
  achos: 'The event is indifferent. Reversibility is not the criterion of good and evil; only virtue and vice are.',
}

const PASSION_DISPLAY_NAMES: Record<RootPassion | PassionSubSpecies, string> = {
  // Roots
  epithumia: 'Craving',
  hedone: 'Irrational pleasure',
  phobos: 'Fear',
  lupe: 'Distress',
  // Epithumia
  orge: 'Anger',
  eros: 'Erotic desire',
  pothos: 'Longing',
  philedonia: 'Love of pleasure',
  philoplousia: 'Love of wealth',
  philodoxia: 'Love of reputation',
  // Hedone
  kelesis: 'Charm-induced pleasure',
  epichairekakia: 'Malicious joy',
  terpsis: 'Sensual delight',
  // Phobos
  deima: 'Panic',
  oknos: 'Hesitation',
  aischyne: 'Shame',
  thambos: 'Astonishment-fear',
  thorybos: 'Confusion',
  agonia: 'Anguish',
  // Lupe
  eleos: 'Pity',
  phthonos: 'Envy',
  zelotypia: 'Jealousy',
  penthos: 'Mourning',
  achos: 'Anguished grief',
}

const STAGE_RANK: Record<CausalStage, number> = {
  phantasia: 1,
  synkatathesis: 2,
  horme: 3,
  praxis: 4,
}

// ============================================================================
// LOOKUP TABLES — oikeiosis (per ADR-006 §3.3)
// ============================================================================

const CIRCLE_HONOURABILITY_BASE: Record<OikeiosisCircle, 1 | 2 | 3> = {
  self_preservation: 1,
  household: 3,
  local_community: 2,
  political_community: 3,
  cosmopolis: 2,
}

const CIRCLE_ADVANTAGEOUSNESS_BASE: Record<OikeiosisCircle, 1 | 2 | 3> = {
  self_preservation: 3,
  household: 2,
  local_community: 2,
  political_community: 2,
  cosmopolis: 1,
}

const CIRCLE_STAGE_NUMBER: Record<OikeiosisCircle, 1 | 2 | 3 | 4 | 5> = {
  self_preservation: 1,
  household: 2,
  local_community: 3,
  political_community: 4,
  cosmopolis: 5,
}

const FULFILMENT_LANGUAGE: ReadonlyArray<string> = [
  'i am',
  'i do',
  'i have',
  "i'm meeting",
  "i'm fulfilling",
  "i'm there",
  "i'm present",
  "i'm honouring",
  "i'm honoring",
]

const FAILURE_LANGUAGE: ReadonlyArray<string> = [
  'i should have',
  "i didn't",
  "i'm not",
  'i failed',
  "i can't",
  "i won't",
  "i wasn't",
  "i haven't",
]

const CONFLICT_MARKERS: ReadonlyArray<string> = [
  'but',
  'however',
  'i can\'t be in two',
  'i have to choose',
  'going back and forth',
  'on the other hand',
  'torn between',
  'either',
]

// ============================================================================
// LOOKUP TABLES — value assessment (per ADR-006 §3.4)
// ============================================================================

const AXIA: Record<Indifferent, AxiaGrade> = {
  life: 'high',
  health: 'high',
  pleasure: 'moderate',
  beauty: 'moderate',
  strength: 'moderate',
  wealth: 'moderate',
  reputation: 'moderate',
  noble_birth: 'moderate',
  death: 'low',
  disease: 'low',
  pain: 'low',
  ugliness: 'low',
}

const PREFERRED_INDIFFERENTS: ReadonlySet<Indifferent> = new Set<Indifferent>([
  'life',
  'health',
  'pleasure',
  'beauty',
  'strength',
  'wealth',
  'reputation',
  'noble_birth',
])

const DISPREFERRED_INDIFFERENTS: ReadonlySet<Indifferent> = new Set<Indifferent>([
  'death',
  'disease',
  'pain',
  'ugliness',
])

// ============================================================================
// LOOKUP TABLES — kathekon assessment (per ADR-006 §3.5)
// ============================================================================

const QUALITY_FROM_COUNT: Record<0 | 1 | 2 | 3, KathekonQuality> = {
  3: 'strong',
  2: 'moderate',
  1: 'marginal',
  0: 'contrary',
}

const IS_KATHEKON_FROM_QUALITY: Record<KathekonQuality, boolean | null> = {
  strong: true,
  moderate: true,
  marginal: null,
  contrary: false,
}

// ============================================================================
// LOOKUP TABLES — iterative refinement (per ADR-006 §3.6)
// ============================================================================

const TEMPORAL_MARKERS: ReadonlyArray<string> = [
  'yesterday',
  'last week',
  'last month',
  'last year',
  'i used to',
  'before',
  'previously',
  'in the past',
  'now i',
  'these days',
  'recently',
  'lately',
]

const IMPROVING_LANGUAGE: ReadonlyArray<string> = [
  'better',
  'improved',
  'progress',
  'calmer',
  'stronger',
  'clearer',
  'more steady',
  'less reactive',
  'easier',
]

const DECLINING_LANGUAGE: ReadonlyArray<string> = [
  'worse',
  'declined',
  'deteriorated',
  'more agitated',
  'less stable',
  'less clear',
  'harder',
  'regressed',
]

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function pickLatestStage(stages: CausalStageEvidence[]): CausalStage | null {
  if (stages.length === 0) return null
  let latestRank = -1
  let latest: CausalStage = 'phantasia'
  for (const s of stages) {
    const rank = STAGE_RANK[s.stage]
    if (rank > latestRank) {
      latestRank = rank
      latest = s.stage
    }
  }
  return latest
}

function formatPassionName(root: RootPassion, sub: PassionSubSpecies | null): string {
  if (sub !== null) {
    return `${PASSION_DISPLAY_NAMES[sub]} (${sub})`
  }
  return `${PASSION_DISPLAY_NAMES[root]} (${root})`
}

// ============================================================================
// MECHANISM 1 — CONTROL FILTER (per ADR-006 §3.1)
// ============================================================================

function classifyControlFilter(elements: ControlFilterElement[]): ControlFilter {
  const within: ControlFilterClassifiedItem[] = []
  const outside: ControlFilterClassifiedItem[] = []
  const disambiguation: ControlFilterClassifiedItem[] = []

  for (const ce of elements) {
    if (ce.agent_named_position === 'within') {
      const classified: ControlFilterClassifiedItem = {
        item: ce.item,
        agent_named_position: 'within',
        classification: 'within',
        reasoning: 'agent_identified_within',
      }
      within.push(classified)
    } else if (ce.agent_named_position === 'outside') {
      const classified: ControlFilterClassifiedItem = {
        item: ce.item,
        agent_named_position: 'outside',
        classification: 'outside',
        reasoning: 'agent_identified_outside',
      }
      outside.push(classified)
    } else {
      // unspecified — apply lookup table
      const lower = ce.item.toLowerCase()
      const matchesWithin = WITHIN_LOOKUP_KEYWORDS.some((k) => lower.includes(k))
      if (matchesWithin) {
        const classified: ControlFilterClassifiedItem = {
          item: ce.item,
          agent_named_position: 'unspecified',
          classification: 'within',
          reasoning: 'lookup_table_match_within',
        }
        within.push(classified)
        disambiguation.push(classified)
      } else {
        const classified: ControlFilterClassifiedItem = {
          item: ce.item,
          agent_named_position: 'unspecified',
          classification: 'outside',
          reasoning: 'default_outside_for_unspecified',
        }
        outside.push(classified)
        disambiguation.push(classified)
      }
    }
  }

  return {
    within_prohairesis: within,
    outside_prohairesis: outside,
    disambiguation_required: disambiguation,
  }
}

// ============================================================================
// MECHANISM 2 — PASSION DIAGNOSIS (per ADR-006 §3.2)
// ============================================================================

function diagnosePassions(
  passions: PassionPresent[],
  stages: CausalStageEvidence[]
): PassionDiagnosis {
  if (passions.length === 0) {
    return {
      passions_detected: [],
      false_judgements: [],
      correct_judgements: [],
      causal_stage_affected: null,
    }
  }

  const detected: PassionDiagnosisEntry[] = []
  for (let i = 0; i < passions.length; i++) {
    const p = passions[i]
    let falseJudgement: string
    let correctJudgement: string
    if (p.sub_species !== null) {
      falseJudgement = SUB_SPECIES_FALSE_JUDGEMENT[p.sub_species]
      correctJudgement = SUB_SPECIES_CORRECT_JUDGEMENT[p.sub_species]
    } else {
      falseJudgement = ROOT_FALSE_JUDGEMENT[p.root_passion]
      correctJudgement = ROOT_CORRECT_JUDGEMENT[p.root_passion]
    }

    const causalStage: CausalStage = pickLatestStage(stages) ?? 'phantasia'

    detected.push({
      id: `passion_${i}`,
      name: formatPassionName(p.root_passion, p.sub_species),
      root_passion: p.root_passion,
      sub_species: p.sub_species,
      false_judgement: falseJudgement,
      correct_judgement: correctJudgement,
      causal_stage_affected: causalStage,
      evidence: p.evidence,
    })
  }

  return {
    passions_detected: detected,
    false_judgements: detected.map((d) => d.false_judgement),
    correct_judgements: detected.map((d) => d.correct_judgement),
    causal_stage_affected: pickLatestStage(stages) ?? 'phantasia',
  }
}

// ============================================================================
// MECHANISM 3 — OIKEIOSIS (per ADR-006 §3.3)
// ============================================================================

function ciceroResolve(h: 1 | 2 | 3, a: 1 | 2 | 3): CiceroVerdict {
  if (h === 3 && a === 3) return 'both_high_aligned'
  if (h > a) {
    if (h >= 2) return 'honourable_prevails'
    return 'indeterminate'
  }
  if (a > h) {
    if (a >= 2) return 'advantageous_prevails'
    return 'indeterminate'
  }
  // h === a, both < 3
  return 'balanced_neither_decisive'
}

function computeObligationMet(ce: OikeiosisCircleEngaged): boolean | null {
  const lower = ce.evidence.toLowerCase()
  if (FULFILMENT_LANGUAGE.some((m) => lower.includes(m))) return true
  if (FAILURE_LANGUAGE.some((m) => lower.includes(m))) return false
  return null
}

function computeTension(
  ce: OikeiosisCircleEngaged,
  allCircles: OikeiosisCircleEngaged[]
): string | null {
  if (allCircles.length < 2) return null
  // Tension if any other circle's evidence quote contains conflict markers
  // alongside this circle's evidence.
  const lower = ce.evidence.toLowerCase()
  const ceHasConflict = CONFLICT_MARKERS.some((m) => lower.includes(m))
  if (!ceHasConflict) return null
  for (const other of allCircles) {
    if (other === ce) continue
    return `Tension between ${ce.circle} and ${other.circle}`
  }
  return null
}

function bumpGrade(g: 1 | 2 | 3): 1 | 2 | 3 {
  if (g === 3) return 3
  if (g === 2) return 3
  return 2
}

function assessOikeiosis(
  circles: OikeiosisCircleEngaged[],
  kathekonFactors: KathekonFactor[],
  indifferents: ValueCategoryAtStake[]
): Oikeiosis {
  const hasNaturalRelationship = kathekonFactors.some(
    (f) => f.factor_type === 'natural_relationship'
  )
  const hasRoleObligation = kathekonFactors.some(
    (f) => f.factor_type === 'role_obligation'
  )
  const hasHighAxia = indifferents.some((i) => AXIA[i.indifferent] === 'high')

  const assessments: OikeiosisCircleAssessment[] = []
  for (const ce of circles) {
    let h: 1 | 2 | 3 = CIRCLE_HONOURABILITY_BASE[ce.circle]
    let a: 1 | 2 | 3 = CIRCLE_ADVANTAGEOUSNESS_BASE[ce.circle]
    if (hasNaturalRelationship) h = bumpGrade(h)
    if (hasRoleObligation) h = bumpGrade(h)
    if (hasHighAxia) a = bumpGrade(a)

    assessments.push({
      stage: CIRCLE_STAGE_NUMBER[ce.circle],
      circle: ce.circle,
      description: ce.evidence,
      honourability_grade: h,
      advantageousness_grade: a,
      cicero_verdict: ciceroResolve(h, a),
      obligation_met: computeObligationMet(ce),
      tension: computeTension(ce, circles),
    })
  }

  // Stable sort by stage ascending (no ties of stage because each circle is
  // unique per Layer 1's extraction; defensive in case Layer 1 emits duplicates).
  assessments.sort((x, y) => x.stage - y.stage)

  // Aggregate deliberation notes
  const tensions = assessments.filter((a) => a.tension !== null).map((a) => a.tension!)
  const balanced = assessments.filter(
    (a) => a.cicero_verdict === 'balanced_neither_decisive'
  )
  const notes: string[] = []
  if (tensions.length > 0) {
    notes.push(tensions.join('; '))
  }
  if (balanced.length > 0) {
    notes.push(
      `Cicero's resolution: where honourability and advantageousness are balanced, the closer circle prevails — inner circle priority applies.`
    )
  }
  if (assessments.length === 0) {
    notes.push('No circles engaged in this snapshot.')
  }

  return {
    relevant_circles: assessments,
    deliberation_notes: notes.join(' '),
  }
}

// ============================================================================
// MECHANISM 4 — VALUE ASSESSMENT (per ADR-006 §3.4)
// ============================================================================

function computeTreatedAs(framing: AgentFraming): TreatedAs {
  switch (framing) {
    case 'good':
      return 'good'
    case 'evil':
      return 'evil'
    case 'indifferent':
      return 'indifferent'
    case 'unspecified':
      return 'indifferent'
  }
}

function computeValueError(name: Indifferent, treatedAs: TreatedAs): string | null {
  if (treatedAs === 'indifferent') return null
  const isPreferred = PREFERRED_INDIFFERENTS.has(name)
  const isDispreferred = DISPREFERRED_INDIFFERENTS.has(name)

  if (isPreferred && treatedAs === 'good') {
    return `Confused ${name} (a preferred indifferent) with the genuine good`
  }
  if (isDispreferred && treatedAs === 'evil') {
    return `Confused ${name} (a dispreferred indifferent) with genuine evil`
  }
  if (isPreferred && treatedAs === 'evil') {
    return `Confused ${name} (preferred) with evil — unusual framing`
  }
  if (isDispreferred && treatedAs === 'good') {
    return `Confused ${name} (dispreferred) with good — unusual framing`
  }
  return null
}

function assessValue(indifferents: ValueCategoryAtStake[]): ValueAssessment {
  if (indifferents.length === 0) {
    return { indifferents_at_stake: [], value_error: null }
  }

  const assessments: IndifferentAtStakeAssessment[] = []
  const errors: string[] = []

  for (const i of indifferents) {
    const treatedAs = computeTreatedAs(i.agent_framing)
    const error = computeValueError(i.indifferent, treatedAs)
    if (error) errors.push(error)
    assessments.push({
      name: i.indifferent,
      axia: AXIA[i.indifferent],
      treated_as: treatedAs,
      evidence: i.evidence,
      error: error,
    })
  }

  return {
    indifferents_at_stake: assessments,
    value_error: errors.length > 0 ? errors.join('; ') : null,
  }
}

// ============================================================================
// MECHANISM 5 — KATHEKON ASSESSMENT (per ADR-006 §3.5)
// ============================================================================

function assessKathekon(factors: KathekonFactor[]): KathekonAssessment {
  const hasNaturalRelationship = factors.some(
    (f) => f.factor_type === 'natural_relationship'
  )
  const hasRoleObligation = factors.some((f) => f.factor_type === 'role_obligation')
  const hasJustification = factors.some(
    (f) => f.factor_type === 'justification_offered'
  )

  const satisfiedCount = (hasNaturalRelationship ? 1 : 0) +
    (hasRoleObligation ? 1 : 0) +
    (hasJustification ? 1 : 0)
  const count = satisfiedCount as 0 | 1 | 2 | 3

  const quality = QUALITY_FROM_COUNT[count]
  const isKathekon = IS_KATHEKON_FROM_QUALITY[quality]

  const parts: string[] = []
  if (hasNaturalRelationship) parts.push('natural relationship engaged')
  if (hasRoleObligation) parts.push('role obligation engaged')
  if (hasJustification) parts.push('justification offered')
  const justification =
    parts.length === 0
      ? 'No kathekon factors detected; action is contrary to appropriate action.'
      : `${parts.join('; ')}.`

  return { is_kathekon: isKathekon, quality, justification }
}

// ============================================================================
// MECHANISM 6 — ITERATIVE REFINEMENT (per ADR-006 §3.6)
// ============================================================================

function describePassionReduction(passions: PassionDiagnosis): string {
  const count = passions.passions_detected.length
  if (count === 0) {
    return 'No passions detected; passion reduction not applicable to this snapshot.'
  }
  if (count === 1) {
    const p = passions.passions_detected[0]
    if (p.causal_stage_affected === 'phantasia') {
      return 'Single passion detected at impression stage; reduction work would begin by examining the impression before assent.'
    }
    if (p.causal_stage_affected === 'synkatathesis') {
      return 'Single passion detected at assent stage; reduction work means withdrawing assent from the false judgement.'
    }
    return 'Single passion already moved to impulse or action; reduction work means tracing back to assent and false judgement.'
  }
  return `Multiple passions detected (${count}); reduction work means addressing the most-evidenced passion first while observing the rest.`
}

function describeJudgementQuality(
  cf: ControlFilter,
  va: ValueAssessment
): string {
  const errorCount = va.indifferents_at_stake.filter((i) => i.error !== null).length
  const disambigCount = cf.disambiguation_required.length
  if (errorCount === 0 && disambigCount === 0) {
    return 'Judgement faculty showing examination — no clear value errors and no unsignalled prohairesis items.'
  }
  if (errorCount >= 3) {
    return 'Judgement quality compromised — multiple value confusions present.'
  }
  if (errorCount >= 1) {
    return 'Judgement quality mixed — some indifferents confused with the genuine good or evil.'
  }
  return 'Judgement faculty hesitating — multiple control-filter items the agent has not signalled clearly.'
}

function describeDispositionStability(
  passions: PassionDiagnosis,
  urgencyCount: number
): string {
  const count = passions.passions_detected.length
  if (count === 0 && urgencyCount === 0) {
    return 'Stable disposition — no passions or urgency in evidence.'
  }
  if (count === 0 && urgencyCount >= 1) {
    return 'Disposition under time pressure but no passion distortion.'
  }
  const lateStage = passions.passions_detected.some(
    (p) => p.causal_stage_affected === 'horme' || p.causal_stage_affected === 'praxis'
  )
  if (lateStage) {
    return 'Disposition unstable — passions have moved into impulse or action.'
  }
  const synkatathesisStage = passions.passions_detected.some(
    (p) => p.causal_stage_affected === 'synkatathesis'
  )
  if (synkatathesisStage) {
    return 'Disposition compromised — assent given to false judgements.'
  }
  return 'Disposition examined; passions present at impression stage but not yet assented.'
}

function describeOikeiosisExtension(oik: Oikeiosis): string {
  const circles = oik.relevant_circles
  if (circles.length === 0) {
    return 'No circles of concern engaged in this snapshot.'
  }
  if (circles.length === 1) {
    const c = circles[0].circle
    if (c === 'self_preservation') {
      return 'Concern centred on self-preservation; oikeiosis extension limited.'
    }
    if (c === 'household') {
      return 'Concern at household; oikeiosis extends beyond self.'
    }
    return `Concern at ${c}; oikeiosis extension widening.`
  }
  const hasOuter = circles.some(
    (c) => c.circle === 'political_community' || c.circle === 'cosmopolis'
  )
  if (hasOuter) {
    return 'Multiple circles engaged including wider community; oikeiosis extension active.'
  }
  return 'Multiple inner circles engaged; oikeiosis extension developing.'
}

function computeSenecanGrade(
  passions: PassionDiagnosis,
  cf: ControlFilter,
  va: ValueAssessment
): SenecanGrade {
  const passionCount = passions.passions_detected.length
  const hasLateStage = passions.passions_detected.some(
    (p) => p.causal_stage_affected === 'horme' || p.causal_stage_affected === 'praxis'
  )
  const valueErrorCount = va.indifferents_at_stake.filter((i) => i.error !== null).length
  const withinCount = cf.within_prohairesis.length
  const outsideCount = cf.outside_prohairesis.length

  if (hasLateStage && valueErrorCount >= 2) return 'pre_progress'
  if (passionCount >= 1 && valueErrorCount >= 1) return 'grade_1'
  if (passionCount >= 1 && valueErrorCount <= 1 && withinCount >= outsideCount) {
    return 'grade_2'
  }
  if (passionCount <= 1 && valueErrorCount === 0 && withinCount > outsideCount) {
    return 'grade_3'
  }
  return 'grade_1'
}

function computeDirectionOfTravel(quotes: string[]): DirectionOfTravel {
  const combined = quotes.join(' ').toLowerCase()
  const hasTemporal = TEMPORAL_MARKERS.some((m) => combined.includes(m))
  if (!hasTemporal) return 'single_snapshot'

  const improvingCount = IMPROVING_LANGUAGE.filter((m) => combined.includes(m)).length
  const decliningCount = DECLINING_LANGUAGE.filter((m) => combined.includes(m)).length
  if (improvingCount > decliningCount) return 'improving'
  if (decliningCount > improvingCount) return 'declining'
  return 'stable'
}

function assessIterativeRefinement(
  passions: PassionDiagnosis,
  cf: ControlFilter,
  va: ValueAssessment,
  oik: Oikeiosis,
  urgencyCount: number,
  layer1EvidenceQuotes: string[]
): IterativeRefinement {
  return {
    senecan_grade: computeSenecanGrade(passions, cf, va),
    progress_dimensions: {
      passion_reduction: describePassionReduction(passions),
      judgement_quality: describeJudgementQuality(cf, va),
      disposition_stability: describeDispositionStability(passions, urgencyCount),
      oikeiosis_extension: describeOikeiosisExtension(oik),
    },
    direction_of_travel: computeDirectionOfTravel(layer1EvidenceQuotes),
    // Added 2026-05-06 (M1-CP4b) — overridden by detectIntakeClarifications wiring
    // in applyMechanisms (per ADR-006 §3.9 "Wiring back into IterativeRefinement").
    motivation_classification: null,
  }
}

// ============================================================================
// DERIVED FIELDS — proximity (per ADR-006 §3.7.1)
// ============================================================================

function computeProximity(
  passions: PassionDiagnosis,
  cf: ControlFilter,
  oik: Oikeiosis,
  va: ValueAssessment,
  kathekon: KathekonAssessment
): KatorthomaProximity {
  const passionCount = passions.passions_detected.length
  const lateStage = passions.passions_detected.some(
    (p) => p.causal_stage_affected === 'horme' || p.causal_stage_affected === 'praxis'
  )
  const earlyStageOnly = passionCount > 0 && !lateStage
  const within = cf.within_prohairesis.length
  const outside = cf.outside_prohairesis.length
  const valueErrors = va.indifferents_at_stake.filter((i) => i.error !== null).length
  const hasDeliberation = oik.deliberation_notes.length > 0

  // sage_like
  if (
    passionCount === 0 &&
    within > outside &&
    valueErrors === 0 &&
    kathekon.quality === 'strong'
  ) {
    return 'sage_like'
  }

  // principled
  if (
    passionCount <= 1 &&
    within >= outside &&
    valueErrors <= 1 &&
    (kathekon.quality === 'strong' || kathekon.quality === 'moderate')
  ) {
    return 'principled'
  }

  // deliberate
  if (earlyStageOnly && hasDeliberation && valueErrors <= 2) {
    return 'deliberate'
  }

  // habitual
  if (lateStage && valueErrors >= 2 && !hasDeliberation) {
    return 'habitual'
  }

  // reflexive
  if (
    passions.passions_detected.some((p) => p.causal_stage_affected === 'praxis') &&
    !hasDeliberation
  ) {
    return 'reflexive'
  }

  return 'deliberate'
}

// ============================================================================
// DERIVED FIELDS — ruling faculty state (per ADR-006 §3.7.2)
// ============================================================================

function computeRulingFacultyState(
  passions: PassionDiagnosis,
  ambiguityCount: number,
  urgencyCount: number,
  hasDeliberation: boolean
): string {
  const passionCount = passions.passions_detected.length

  if (urgencyCount >= 2 && passionCount >= 2) {
    return 'Overwhelmed — multiple passions under time pressure; ruling faculty agitated.'
  }
  if (passionCount >= 2) {
    return 'Agitated — multiple passions at present; examination interrupted.'
  }
  if (passionCount === 1 && hasDeliberation) {
    return 'Examining — single passion engaged; ruling faculty actively interrogating impressions.'
  }
  if (passionCount === 0 && hasDeliberation) {
    return 'Stable, examining — no passions present; ruling faculty deliberating without distortion.'
  }
  if (passionCount === 0 && !hasDeliberation && ambiguityCount === 0) {
    return 'Disengaged — no passions, no deliberation; ruling faculty at rest.'
  }
  if (ambiguityCount >= 3) {
    return 'Unsettled — multiple ambiguities in interpretation; ruling faculty unable to resolve.'
  }
  return 'Engaged — ruling faculty active but no dominant pattern.'
}

// ============================================================================
// DERIVED FIELDS — virtue domains (per ADR-006 §3.7.3)
// ============================================================================

function computeVirtueDomains(
  passions: PassionDiagnosis,
  cf: ControlFilter,
  oik: Oikeiosis,
  kathekon: KathekonAssessment,
  va: ValueAssessment
): VirtueDomain[] {
  const domains: VirtueDomain[] = []

  // Stable order: phronesis, dikaiosyne, andreia, sophrosyne
  if (cf.disambiguation_required.length >= 1 || va.indifferents_at_stake.length >= 1) {
    domains.push('phronesis')
  }
  if (oik.relevant_circles.length >= 1 || kathekon.is_kathekon !== null) {
    domains.push('dikaiosyne')
  }
  if (passions.passions_detected.some((p) => p.root_passion === 'phobos')) {
    domains.push('andreia')
  }
  if (
    passions.passions_detected.some(
      (p) => p.root_passion === 'epithumia' || p.root_passion === 'hedone'
    )
  ) {
    domains.push('sophrosyne')
  }

  return domains
}

// ============================================================================
// DERIVED FIELDS — improvement path (per ADR-006 §3.7.4)
// ============================================================================

function pickPrimaryPassion(detected: PassionDiagnosisEntry[]): PassionDiagnosisEntry {
  let best = detected[0]
  for (let i = 1; i < detected.length; i++) {
    const p = detected[i]
    if (STAGE_RANK[p.causal_stage_affected] > STAGE_RANK[best.causal_stage_affected]) {
      best = p
    }
  }
  return best
}

function pickInnermost(
  tied: OikeiosisCircleAssessment[]
): OikeiosisCircleAssessment {
  let inner = tied[0]
  for (let i = 1; i < tied.length; i++) {
    if (tied[i].stage < inner.stage) {
      inner = tied[i]
    }
  }
  return inner
}

function selectImprovementPath(
  passions: PassionDiagnosis,
  cf: ControlFilter,
  va: ValueAssessment,
  oik: Oikeiosis,
  kathekon: KathekonAssessment
): ImprovementPathStructured | null {
  // Priority 1: passions
  if (passions.passions_detected.length > 0) {
    const primary = pickPrimaryPassion(passions.passions_detected)
    return {
      false_judgement_to_correct: primary.false_judgement,
      mechanism_applies: 'passion_diagnosis',
      corrected_judgement: primary.correct_judgement,
    }
  }

  // Priority 2: value errors (high-axia confusions)
  const highAxiaErrors = va.indifferents_at_stake.filter(
    (i) => i.axia === 'high' && i.error !== null
  )
  if (highAxiaErrors.length > 0) {
    const err = highAxiaErrors[0]
    return {
      false_judgement_to_correct: err.error!,
      mechanism_applies: 'value_assessment',
      corrected_judgement: `${err.name} is an indifferent, not a genuine ${err.treated_as}.`,
    }
  }

  // Priority 3: control filter mismatch — agent claims within for an item
  // NOT matching the lookup table
  const mismatches = cf.within_prohairesis.filter((i) => {
    if (i.reasoning !== 'agent_identified_within') return false
    const lower = i.item.toLowerCase()
    return !WITHIN_LOOKUP_KEYWORDS.some((k) => lower.includes(k))
  })
  if (mismatches.length > 0) {
    return {
      false_judgement_to_correct: `"${mismatches[0].item}" is within my control.`,
      mechanism_applies: 'control_filter',
      corrected_judgement: `"${mismatches[0].item}" is outside prohairesis. Only my judgement, impulse, and response to it are within.`,
    }
  }

  // Priority 4: kathekon contrary
  if (kathekon.is_kathekon === false) {
    return {
      false_judgement_to_correct: 'This action is appropriate.',
      mechanism_applies: 'kathekon_assessment',
      corrected_judgement:
        "No kathekon factors are engaged; reconsider the action's grounds in natural relationships, role obligations, and justification.",
    }
  }

  // Priority 5: oikeiosis tension (inner-circle priority for tied verdicts)
  const tied = oik.relevant_circles.filter(
    (c) =>
      c.cicero_verdict === 'balanced_neither_decisive' ||
      c.cicero_verdict === 'indeterminate'
  )
  if (tied.length > 0) {
    const inner = pickInnermost(tied)
    return {
      false_judgement_to_correct: `Obligation at ${inner.circle} is unclear.`,
      mechanism_applies: 'oikeiosis',
      corrected_judgement: `Apply Cicero's resolution: where honourability and advantageousness are balanced, the closer circle of concern prevails. ${inner.circle} carries more weight when other things are equal.`,
    }
  }

  return null
}

// ============================================================================
// DERIVED FIELDS — stage scores (per ADR-006 §3.7.5)
// ============================================================================

function ambiguityNoteRefersTo(note: string, mechanism: string): boolean {
  return note.toLowerCase().includes(mechanism)
}

function scoreMechanism(
  inputEmpty: boolean,
  outputEmpty: boolean,
  ambiguityNotes: string[],
  mechanismKeyword: string
): StageScore {
  if (inputEmpty) return 'not_applied'
  if (outputEmpty) return 'weak'
  const refs = ambiguityNotes.filter((n) =>
    ambiguityNoteRefersTo(n, mechanismKeyword)
  ).length
  if (refs === 0) return 'strong'
  if (refs <= 2) return 'adequate'
  return 'weak'
}

function computeStageScores(
  layer1: Layer1Schema,
  cf: ControlFilter,
  pd: PassionDiagnosis,
  oik: Oikeiosis,
  va: ValueAssessment,
  ir: IterativeRefinement
): StageScores {
  return {
    control_filter: scoreMechanism(
      layer1.control_filter_elements.length === 0,
      cf.within_prohairesis.length + cf.outside_prohairesis.length === 0,
      layer1.ambiguity_notes,
      'control_filter'
    ),
    passion_diagnosis: scoreMechanism(
      layer1.passions_present.length === 0,
      pd.passions_detected.length === 0,
      layer1.ambiguity_notes,
      'passions_present'
    ),
    oikeiosis: scoreMechanism(
      layer1.oikeiosis_circles_engaged.length === 0,
      oik.relevant_circles.length === 0,
      layer1.ambiguity_notes,
      'oikeiosis'
    ),
    value_assessment: scoreMechanism(
      layer1.value_categories_at_stake.length === 0,
      va.indifferents_at_stake.length === 0,
      layer1.ambiguity_notes,
      'value_categories'
    ),
    kathekon_assessment: scoreMechanism(
      layer1.kathekon_factors.length === 0,
      false,
      layer1.ambiguity_notes,
      'kathekon'
    ),
    iterative_refinement:
      ir.direction_of_travel === 'single_snapshot'
        ? 'adequate'
        : layer1.passions_present.length === 0 &&
            layer1.causal_stage_evidence.length === 0
          ? 'not_applied'
          : 'strong',
  }
}

// ============================================================================
// MECHANISM 7 — HASTY ASSENT RISK (per ADR-006 §3.8)
// ============================================================================

function computeHastyAssentRisk(
  urgencyIndicators: UrgencyIndicator[],
  cf: ControlFilter
): HastyAssentRisk {
  const urgencyCount = urgencyIndicators.length
  const pressingOutsideCount = cf.outside_prohairesis.filter(
    (i) => i.reasoning !== 'agent_identified_outside'
  ).length

  if (urgencyCount === 0) return 'none'
  if (urgencyCount >= 2 && pressingOutsideCount >= 2) return 'high'
  if (urgencyCount >= 1 && pressingOutsideCount >= 1) return 'moderate'
  return 'low'
}

// ============================================================================
// MECHANISM 8 — INTAKE CLARIFICATION TRIGGERS (per ADR-006 §3.9)
// Added 2026-05-06 (M1-CP4b) — AC-13 Tier 2 + AC-14 Tier 3.
// ============================================================================

// Lookup tables per ADR-006 §3.9. Frozen at module load.
// (EupatheiaShape imported at top of file alongside other Layer 1 types.)

const EUPATHEIA_DISPLAY_NAMES: Record<EupatheiaShape, string> = {
  chara: "chara (joy in another's good)",
  boulesis: 'boulesis (rational wishing)',
  eulabeia: 'eulabeia (reverent caution)',
}

const EUPATHEIA_DESCRIPTIONS: Record<EupatheiaShape, string> = {
  chara: "genuine joy in another's good as an end in itself",
  boulesis: 'wanting what virtue would have you want, without grasping',
  eulabeia: 'disinclination from what virtue would not endorse, without fear',
}

const EUPATHEIA_PASSION_COUNTERPARTS: Record<EupatheiaShape, string> = {
  chara: 'philodoxia (pleasure in being associated with success)',
  boulesis: 'epithumia (craving an external as a genuine good)',
  eulabeia: 'phobos (fear of an external as a genuine evil)',
}

const KATORTHOMA_PROXIMITY_LABEL: Record<KatorthomaProximity, string> = {
  reflexive: 'an action driven by impulse without deliberation',
  habitual: 'an action shaped by convention without examined understanding',
  deliberate: 'an action with conscious reasoning and some understanding',
  principled: 'an action approaching the principled level',
  sage_like: 'an action approaching the level of perfected understanding',
}

const VIRTUE_DESCRIPTIONS: Record<VirtueDomain, string> = {
  phronesis: 'phronesis (practical wisdom understanding the right action)',
  dikaiosyne: 'dikaiosyne (justice — giving each what is due)',
  andreia: 'andreia (courage — endurance of right judgement under fear)',
  sophrosyne: 'sophrosyne (temperance — moderation of desire by right judgement)',
}

const CONVENTION_SUBSTITUTION_DESCRIPTION =
  "habit, social expectation, or what is conventionally praiseworthy in the agent's role"

/**
 * Pick a "situation phrase" for slot-filling, per ADR-006 §3.9 helper:
 * highest-narrative-weight entity description per Layer 1; falls back to
 * first oikeiosis circle's evidence; falls back to first passion's evidence;
 * falls back to "this situation".
 */
function pickSituationPhrase(layer1: Layer1Schema): string {
  if (layer1.oikeiosis_circles_engaged.length > 0) {
    return layer1.oikeiosis_circles_engaged[0].evidence
  }
  if (layer1.passions_present.length > 0) {
    return layer1.passions_present[0].evidence
  }
  return 'this situation'
}

/**
 * Detect AC-13 / AC-14 intake-clarification triggers per ADR-006 §3.9.
 * Pure synchronous; deterministic; no I/O.
 *
 * Returns intake_clarifications + the resolved motivation_classification for
 * the wiring back into iterative_refinement.
 */
function detectIntakeClarifications(
  layer1: Layer1Schema,
  passionDiagnosis: PassionDiagnosis,
  oikeiosis: Oikeiosis,
  virtueDomains: VirtueDomain[],
  katorthomaProximity: KatorthomaProximity,
  causalStageEvidence: CausalStageEvidence[]
): {
  intake_clarifications: IntakeClarifications
  motivation_classification: MotivationClassification
} {
  const soft: SoftClarification[] = []
  const open: OpenDeferralEntry[] = []
  let motivationClassification: MotivationClassification = null

  // Step 1: STATED_OPERATIVE_CONFLICT (Tier 2). At most one entry per assessment.
  for (const sct of layer1.stated_concern_targets) {
    if (sct.for_self_concern !== null) {
      const operativeCircle =
        oikeiosis.relevant_circles.length > 0
          ? oikeiosis.relevant_circles[0].circle
          : 'self_preservation'
      const situation = pickSituationPhrase(layer1)
      soft.push({
        trigger_code: 'STATED_OPERATIVE_CONFLICT',
        intake_tier: 2,
        stem_id: 'tier_2:stated_operative_conflict:001',
        slot_fills: {
          STATED_CIRCLE_TARGET: sct.stated_target,
          SITUATION: situation,
          // Operative circle exposed for traceability (not part of the canonical
          // d-a16 stem template but useful for downstream analysis).
          OPERATIVE_CIRCLE: operativeCircle,
        },
        scope_of_change:
          'Refinement of the operative circle and its kathekon assessment if the practitioner confirms which concern is dominant.',
      })
      break
    }
  }

  // Step 2: STATED_EQUANIMITY_UNVERIFIED (Tier 2). Fires when stated calm
  // coincides with detected passion-shape.
  if (
    layer1.stated_equanimity_signals.length > 0 &&
    passionDiagnosis.passions_detected.length > 0
  ) {
    soft.push({
      trigger_code: 'STATED_EQUANIMITY_UNVERIFIED',
      intake_tier: 2,
      stem_id: 'tier_2:stated_equanimity_unverified:001',
      slot_fills: {},
      scope_of_change:
        'Refinement of the passion classification — whether the stated calm is genuine eupatheia or polished surface over the detected passion-shape.',
    })
  }

  // Step 3: EUPATHEIA_BOUNDARY (Tier 3). One OPEN_DEFERRAL per candidate.
  for (const ec of layer1.eupatheia_candidates) {
    const eupatheiaLabel = EUPATHEIA_DISPLAY_NAMES[ec.shape]
    const eupatheiaDescr = EUPATHEIA_DESCRIPTIONS[ec.shape]
    const counterpartDescr = EUPATHEIA_PASSION_COUNTERPARTS[ec.shape]
    const situationalTrigger = ec.narrative_target ?? pickSituationPhrase(layer1)
    open.push({
      trigger_code: 'EUPATHEIA_BOUNDARY',
      intake_tier: 3,
      stem_id: 'tier_3:eupatheia_boundary:001',
      slot_fills: {
        EUPATHEIA_SHAPE: eupatheiaLabel,
        TIME_WINDOW: 'recent days',
        SITUATIONAL_TRIGGER: situationalTrigger,
        EUPATHEIA_DESCRIPTION: eupatheiaDescr,
        PASSION_COUNTERPART_DESCRIPTION: counterpartDescr,
      },
      withheld_classification: {
        field_path: 'passion_diagnosis.eupatheia_confirmation_pending',
        withheld_at_position: 'post-passion-diagnosis (M1-CP4b extension)',
        reason:
          "Eupatheia confirmation requires longitudinal evidence that the practitioner's calm is not polished surface over passion. The current instance does not provide this evidence.",
      },
      status: 'open',
    })
  }

  // Step 4: PRAXIS_MOTIVATION_AMBIGUITY (Tier 3).
  const hasPraxisEvidence = causalStageEvidence.some((s) => s.stage === 'praxis')
  const isPrincipledPlus =
    katorthomaProximity === 'principled' || katorthomaProximity === 'sage_like'
  if (layer1.motivation_stated === false && isPrincipledPlus && hasPraxisEvidence) {
    const surfacePattern = KATORTHOMA_PROXIMITY_LABEL[katorthomaProximity]
    const virtueDescr =
      virtueDomains.length > 0
        ? VIRTUE_DESCRIPTIONS[virtueDomains[0]]
        : 'phronesis (practical wisdom understanding the right action)'
    const conventionDescr = CONVENTION_SUBSTITUTION_DESCRIPTION
    open.push({
      trigger_code: 'PRAXIS_MOTIVATION_AMBIGUITY',
      intake_tier: 3,
      stem_id: 'tier_3:praxis_motivation_ambiguity:001',
      slot_fills: {
        SURFACE_PATTERN: surfacePattern,
        VIRTUE_DESCRIPTION: virtueDescr,
        CONVENTION_DESCRIPTION: conventionDescr,
      },
      withheld_classification: {
        field_path: 'iterative_refinement.motivation_classification',
        withheld_at_position: 'post-iterative-refinement (M1-CP4b extension)',
        reason:
          "Motivation classification depends on self-report the practitioner has not provided. The action's surface pattern is consistent with virtue but cannot be distinguished from convention without the practitioner's reflection on what was operative for them.",
      },
      status: 'open',
    })
    motivationClassification = 'unclear_pending_clarification'
  }

  // Wiring back into IterativeRefinement (per ADR-006 §3.9 paragraph after
  // the algorithm). When the trigger does not fire and praxis-stage evidence
  // IS present (because the agent named their motivation), set 'virtue_explicit'
  // (M1 default — virtue-vs-convention inference is reserved for future work).
  // Otherwise leave as null.
  if (
    motivationClassification === null &&
    hasPraxisEvidence &&
    layer1.motivation_stated === true
  ) {
    motivationClassification = 'virtue_explicit'
  }

  return {
    intake_clarifications: { soft_clarifications: soft, open_deferrals: open },
    motivation_classification: motivationClassification,
  }
}

// ============================================================================
// COMPOSE LAYER 2 AMBIGUITY NOTES (per ADR-006 §"Founder-confirmed decisions")
// ============================================================================

function composeLayer2AmbiguityNotes(
  cf: ControlFilter,
  pd: PassionDiagnosis,
  ir: IterativeRefinement,
  kathekon: KathekonAssessment
): string[] {
  const notes: string[] = []
  if (cf.disambiguation_required.length > 0) {
    notes.push(
      `control_filter: ${cf.disambiguation_required.length} item(s) required disambiguation (agent did not signal within/outside)`
    )
  }
  if (
    pd.passions_detected.length > 0 &&
    pd.passions_detected.every((p) => p.causal_stage_affected === 'phantasia')
  ) {
    // All passions defaulted to phantasia — Layer 1 had no causal stage evidence
    notes.push(
      'passion_diagnosis: causal stage defaulted to phantasia (no causal_stage_evidence in Layer 1)'
    )
  }
  if (ir.direction_of_travel === 'single_snapshot') {
    notes.push(
      'iterative_refinement: single-snapshot input — direction_of_travel could not be computed from temporal markers'
    )
  }
  if (kathekon.is_kathekon === null) {
    notes.push(
      'kathekon_assessment: marginal — only one kathekon factor engaged; is_kathekon is undecidable'
    )
  }
  return notes
}

// ============================================================================
// TIER 1 FORCE-CLARIFICATION (added 2026-05-06, M1-CP4e)
// Per ADR-006 §3.10 + ADR-008 §3.5. Tier 1 is engine-flow-control: when fired,
// the engine halts at the named position; Layer 3 is not called; the orchestrator
// emits a force-clarification response per ADR-008 §2.
// ============================================================================

/** Canonical D13 stems for the three engine-level Tier 1 triggers. Pre-D-A16
 *  promotion: alt-3 derived. Post-promotion: corpus-traced via stem_id. The stem
 *  text remains stable across promotion. */
const TIER1_STEMS: Record<Tier1TriggerCode, string> = {
  ELEMENT_FUSION:
    'There are several distinct concerns here — [LIST_OF_FUSED_CONCERNS]. ' +
    'Before I work through this with you, can you tell me which one of these ' +
    'is most centrally on your mind right now?',
  SCOPE_AMBIGUITY:
    'Who else was affected by this, if anyone? And what role do they play in ' +
    "your life — colleague, family member, someone you don't know well?",
  TEMPORAL_AMBIGUITY:
    'When you think about this situation right now, are you more concerned ' +
    "about something that's already happened, or something you're worried " +
    'might happen?',
}

/** Lupe sub-species anchored on past loss / harm. TEMPORAL_AMBIGUITY requires at
 *  least one of these (or a WORRY_PASSION) to be present in passions_present —
 *  filters narrative ambiguity from concern-anchor ambiguity. */
const REGRET_PASSIONS: ReadonlySet<PassionSubSpecies> = new Set<PassionSubSpecies>([
  'penthos',
  'achos',
  'eleos',
])

/** Phobos sub-species anchored on future imminent harm. */
const WORRY_PASSIONS: ReadonlySet<PassionSubSpecies> = new Set<PassionSubSpecies>([
  'agonia',
  'thorybos',
  'deima',
])

/** Past-anchored temporal markers in evidence text. Calibrated toward under-firing
 *  per ADR-008 risk note (over-firing produces clunky workflow). */
const PAST_TEMPORAL_MARKERS: ReadonlyArray<string> = [
  'happened',
  'did',
  'said',
  'was',
  'were',
  'yesterday',
  'last week',
  'last month',
  'last year',
  'earlier',
  'before',
  'previously',
  'in the past',
  'i used to',
  'we used to',
  'i had',
  'we had',
  'should have',
  "shouldn't have",
  'could have',
  'i wish i had',
  "i wish i hadn't",
]

/** Future-anchored temporal markers in evidence text. */
const FUTURE_TEMPORAL_MARKERS: ReadonlyArray<string> = [
  'will',
  'going to',
  'might',
  'could',
  'may',
  'tomorrow',
  'next week',
  'next month',
  'next year',
  'later',
  'soon',
  'if i',
  'if we',
  'what if',
  "i'm worried",
  'i fear',
  "i'm afraid",
  "what they'll do",
  'what they might do',
  "what's going to",
]

/** Markers indicating an unspecified-other referent without a relational role.
 *  SCOPE_AMBIGUITY fires when an action involves an other-referent AND no
 *  oikeiosis circle is engaged (or only self_preservation). */
const OTHER_REFERENT_MARKERS: ReadonlyArray<string> = [
  // Pronouns indicating an unspecified other
  ' they ',
  ' them ',
  ' their ',
  'the others',
  'the other',
  ' him ',
  ' her ',
  ' his ',
  ' hers ',
  'to him',
  'to her',
  'to them',
  // Generic relational markers without circle assignment
  'the person',
  'this person',
  'that person',
  'someone',
  'somebody',
  'everyone',
  // Action-direction phrases
  'responded to',
  'replied to',
  'said to',
  'told them',
  'wrote to',
  'called',
  'messaged',
]

/**
 * Format a list of fused concerns as a comma-separated string with Oxford "and"
 * before the final item. Used to slot-fill LIST_OF_FUSED_CONCERNS in the
 * ELEMENT_FUSION stem.
 *
 * @param concerns - non-empty array of concern labels
 * @returns formatted string ("X", "X and Y", "X, Y, and Z")
 */
function formatConcernsList(concerns: ReadonlyArray<string>): string {
  if (concerns.length === 0) {
    // Defensive: validator should have caught fused === true with empty array.
    throw new Error(
      'formatConcernsList: empty concerns array — cross-field invariant violation upstream'
    )
  }
  if (concerns.length === 1) return concerns[0]
  if (concerns.length === 2) return `${concerns[0]} and ${concerns[1]}`
  const head = concerns.slice(0, -1).join(', ')
  const tail = concerns[concerns.length - 1]
  return `${head}, and ${tail}`
}

/**
 * Detect upstream-most (Layer 1) Tier 1 trigger. Runs before applyMechanisms.
 * Returns the Tier1Trigger when ELEMENT_FUSION is detected; null otherwise.
 *
 * Per ADR-006 §3.10 + ADR-008 §3.4 (companion ADR-005 amendment specifies the
 * Layer 1 element_fusion_detected field this function consumes).
 *
 * @param schema - validated Layer1Schema
 * @returns Tier1Trigger when fusion is detected; null otherwise
 */
export function detectTier1Trigger(schema: Layer1Schema): Tier1Trigger | null {
  if (schema.element_fusion_detected.fused === true) {
    const concerns = schema.element_fusion_detected.fused_concerns
    if (concerns === null || concerns.length === 0) {
      // Defensive: validator should have caught this; preserve a clear error.
      throw new Error(
        'detectTier1Trigger: element_fusion_detected.fused === true but ' +
          'fused_concerns is null/empty. Cross-field invariant violation; ' +
          'validateLayer1Schema should have caught this upstream.'
      )
    }
    const listStr = formatConcernsList(concerns)
    const questionText = TIER1_STEMS.ELEMENT_FUSION.replace(
      '[LIST_OF_FUSED_CONCERNS]',
      listStr
    )
    return {
      trigger_code: 'ELEMENT_FUSION',
      question_text: questionText,
      stem_id: null, // pre-D-A16 promotion; populated post-promotion
      slot_fills: { LIST_OF_FUSED_CONCERNS: listStr },
      fired_at_position: 'layer1',
    }
  }
  return null
}

/**
 * Detect TEMPORAL_AMBIGUITY at Position 2 (passion_root_detection step).
 *
 * Calibrated toward under-firing: requires (a) at least one passion present, (b)
 * causal_stage_evidence with both past-anchored AND future-anchored entries, (c)
 * no dominant temporal anchor (|past_count - future_count| <= 1), (d) at least
 * one passion in the regret-or-worry family. Narrative ambiguity alone does not
 * trigger; the *concern-anchor* must be ambiguous.
 *
 * Per ADR-006 §3.10. Pure synchronous predicate; no I/O.
 */
function detectTemporalAmbiguity(schema: Layer1Schema): Tier1Trigger | null {
  if (schema.passions_present.length === 0) return null

  // Count past-vs-future anchored causal stage evidence.
  let pastCount = 0
  let futureCount = 0
  for (const stage of schema.causal_stage_evidence) {
    const lower = stage.evidence.toLowerCase()
    if (PAST_TEMPORAL_MARKERS.some((m) => lower.includes(m))) {
      pastCount += 1
    }
    if (FUTURE_TEMPORAL_MARKERS.some((m) => lower.includes(m))) {
      futureCount += 1
    }
  }

  const hasTemporalSplit = pastCount >= 1 && futureCount >= 1
  if (!hasTemporalSplit) return null

  const noDominantAnchor = Math.abs(pastCount - futureCount) <= 1
  if (!noDominantAnchor) return null

  const hasRegretOrWorry = schema.passions_present.some(
    (p) =>
      p.sub_species !== null &&
      (REGRET_PASSIONS.has(p.sub_species) || WORRY_PASSIONS.has(p.sub_species))
  )
  if (!hasRegretOrWorry) return null

  return {
    trigger_code: 'TEMPORAL_AMBIGUITY',
    question_text: TIER1_STEMS.TEMPORAL_AMBIGUITY,
    stem_id: null,
    slot_fills: {}, // canonical stem; no slots per D13
    fired_at_position: 'position-2',
  }
}

/**
 * Detect SCOPE_AMBIGUITY at Position 6 (oikeiosis_stage step).
 *
 * Calibrated toward under-firing: requires (a) an action present (praxis or horme
 * stage), (b) an unspecified-other referent in evidence ("them", "to them",
 * "responded to", etc.), (c) the absence of a relational oikeiosis circle (none
 * or only self_preservation).
 *
 * Per ADR-006 §3.10. Pure synchronous predicate; no I/O.
 */
function detectScopeAmbiguity(schema: Layer1Schema): Tier1Trigger | null {
  // (a) action present
  const hasAction = schema.causal_stage_evidence.some(
    (s) => s.stage === 'praxis' || s.stage === 'horme'
  )
  if (!hasAction) return null

  // (b) unspecified-other referent in evidence
  const evidenceTexts: string[] = [
    ...schema.causal_stage_evidence.map((s) => ` ${s.evidence.toLowerCase()} `),
    ...schema.passions_present.map((p) => ` ${p.evidence.toLowerCase()} `),
  ]
  const hasOtherReferent = evidenceTexts.some((text) =>
    OTHER_REFERENT_MARKERS.some((m) => text.includes(m))
  )
  if (!hasOtherReferent) return null

  // (c) absence of relational circle
  const circles = schema.oikeiosis_circles_engaged
  const hasNoRelationalCircle =
    circles.length === 0 ||
    (circles.length === 1 && circles[0].circle === 'self_preservation')
  if (!hasNoRelationalCircle) return null

  return {
    trigger_code: 'SCOPE_AMBIGUITY',
    question_text: TIER1_STEMS.SCOPE_AMBIGUITY,
    stem_id: null,
    slot_fills: {},
    fired_at_position: 'position-6',
  }
}

// ============================================================================
// TOP-LEVEL applyMechanisms (per ADR-006 §1, amended M1-CP4e per §3.10)
// ============================================================================

/**
 * Apply the six Stoic mechanisms (plus derived fields) to the Layer 1 schema.
 *
 * Pure synchronous function. Same Layer1Schema input → byte-for-byte equal
 * Layer2Assessment output. No LLM, no I/O, no module state.
 *
 * Post M1-CP4e: return type is a discriminated union. When a Tier 1 trigger
 * fires at Position 2 (TEMPORAL_AMBIGUITY) or Position 6 (SCOPE_AMBIGUITY), the
 * function returns `{ tier1_trigger: Tier1Trigger }` and short-circuits before
 * subsequent mechanisms run. The orchestrator type-narrows on the presence of
 * `tier1_trigger`. ELEMENT_FUSION is detected upstream by detectTier1Trigger
 * and never reaches applyMechanisms.
 *
 * Carried-context tolerance (D-LAYER1-SCHEMA-ADDITIONS, 2026-05-14): the
 * Layer1Schema may carry eight optional carried-context fields
 * (subject_identity_binding, reflective_self_report, history_window,
 * topic_signal, carried_profile, profile_provenance, peer_agent_assessments,
 * objective_function_declaration). Layer 2 reads only named feature fields and
 * never iterates / spreads / stringifies the whole schema, so these fields pass
 * through applyMechanisms untouched. Layer 2 does NOT yet act on them — that is
 * deferred to the private-mode and ATL Wrapper build sessions. Their presence
 * does not change the Layer2Assessment output (the idempotency invariant above
 * holds over the feature fields; carried context is inert here).
 *
 * @param schema  - Layer1Schema from layer1-extractor.ts
 * @param options - reserved for future use; ignored at CP2
 * @returns Layer2Assessment | { tier1_trigger: Tier1Trigger }
 */
export function applyMechanisms(
  schema: Layer1Schema,
  _options?: ApplyOptions
): Layer2Assessment | Tier1ShortCircuit {
  // Mechanism 1 — control filter
  const cf = classifyControlFilter(schema.control_filter_elements)

  // Mechanism 2 — passion diagnosis
  const pd = diagnosePassions(schema.passions_present, schema.causal_stage_evidence)

  // Position 2 short-circuit (M1-CP4e) — TEMPORAL_AMBIGUITY
  // Per ADR-006 §3.10 + ADR-008 §3.3. Fires when the temporal axis of the
  // practitioner's concern is undetermined (regret vs worry); halts the engine.
  const temporalTrigger = detectTemporalAmbiguity(schema)
  if (temporalTrigger !== null) {
    return { tier1_trigger: temporalTrigger }
  }

  // Mechanism 3 — oikeiosis
  const oik = assessOikeiosis(
    schema.oikeiosis_circles_engaged,
    schema.kathekon_factors,
    schema.value_categories_at_stake
  )

  // Position 6 short-circuit (M1-CP4e) — SCOPE_AMBIGUITY
  // Per ADR-006 §3.10 + ADR-008 §3.2. Fires when an action involves an
  // unspecified-other referent and no relational circle is engaged; halts the
  // engine.
  const scopeTrigger = detectScopeAmbiguity(schema)
  if (scopeTrigger !== null) {
    return { tier1_trigger: scopeTrigger }
  }

  // Mechanism 4 — value assessment
  const va = assessValue(schema.value_categories_at_stake)

  // Mechanism 5 — kathekon assessment
  const kathekon = assessKathekon(schema.kathekon_factors)

  // Aggregate Layer 1 evidence quotes for iterative refinement temporal scan
  const evidenceQuotes: string[] = [
    ...schema.passions_present.map((p) => p.evidence),
    ...schema.oikeiosis_circles_engaged.map((c) => c.evidence),
    ...schema.value_categories_at_stake.map((v) => v.evidence),
    ...schema.kathekon_factors.map((k) => k.evidence),
    ...schema.urgency_indicators.map((u) => u.evidence),
    ...schema.causal_stage_evidence.map((s) => s.evidence),
  ]

  // Mechanism 6 — iterative refinement
  const ir = assessIterativeRefinement(
    pd,
    cf,
    va,
    oik,
    schema.urgency_indicators.length,
    evidenceQuotes
  )

  // Derived fields
  const proximity = computeProximity(pd, cf, oik, va, kathekon)
  const rulingFacultyState = computeRulingFacultyState(
    pd,
    schema.ambiguity_notes.length,
    schema.urgency_indicators.length,
    oik.deliberation_notes.length > 0
  )
  const virtueDomains = computeVirtueDomains(pd, cf, oik, kathekon, va)
  const improvementPath = selectImprovementPath(pd, cf, va, oik, kathekon)
  const stageScores = computeStageScores(schema, cf, pd, oik, va, ir)
  const hastyAssentRisk = computeHastyAssentRisk(schema.urgency_indicators, cf)

  // Mechanism 8 — intake clarification triggers (added 2026-05-06, M1-CP4b)
  // Per ADR-006 §3.9. Runs after derived fields are computed (consumes
  // proximity + virtue_domains + Layer 1's stated_concern_targets / eupatheia
  // candidates / motivation_stated / causal_stage_evidence).
  const intakeResult = detectIntakeClarifications(
    schema,
    pd,
    oik,
    virtueDomains,
    proximity,
    schema.causal_stage_evidence
  )

  // Wire motivation_classification back into iterative_refinement per ADR-006
  // §3.9. Replace the placeholder null assigned at assessIterativeRefinement.
  const irWithMotivation: IterativeRefinement = {
    ...ir,
    motivation_classification: intakeResult.motivation_classification,
  }

  // Layer 2 ambiguity notes
  const layer2Ambiguity = composeLayer2AmbiguityNotes(cf, pd, irWithMotivation, kathekon)

  return {
    version: 'layer2-assessment-v1',
    layer1_schema_version: 'layer1-schema-v1',
    passion_diagnosis: pd,
    control_filter: cf,
    oikeiosis: oik,
    value_assessment: va,
    kathekon_assessment: kathekon,
    iterative_refinement: irWithMotivation,
    katorthoma_proximity: proximity,
    ruling_faculty_state: rulingFacultyState,
    virtue_domains_engaged: virtueDomains,
    improvement_path_structured: improvementPath,
    stage_scores: stageScores,
    hasty_assent_risk: hastyAssentRisk,
    intake_clarifications: intakeResult.intake_clarifications,
    layer1_ambiguity_notes: schema.ambiguity_notes.slice(),
    layer2_ambiguity_notes: layer2Ambiguity,
  }
}

// ============================================================================
// VALIDATOR (per ADR-006 §5 — hand-rolled, mirrors ADR-005 §6 pattern)
// ============================================================================

export type Layer2ValidationCategory = 'shape' | 'enum' | 'version'

export class Layer2ValidationError extends Error {
  readonly category: Layer2ValidationCategory
  readonly field?: string
  readonly value?: unknown

  constructor(
    category: Layer2ValidationCategory,
    message: string,
    field?: string,
    value?: unknown
  ) {
    super(message)
    this.name = 'Layer2ValidationError'
    this.category = category
    this.field = field
    this.value = value
  }
}

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

function l2AssertObject(value: unknown, path: string): Record<string, unknown> {
  if (!isObject(value)) {
    throw new Layer2ValidationError(
      'shape',
      `Expected object at ${path}, got ${Array.isArray(value) ? 'array' : typeof value}`,
      path,
      value
    )
  }
  return value
}

function l2AssertArray(value: unknown, path: string): unknown[] {
  if (!Array.isArray(value)) {
    throw new Layer2ValidationError(
      'shape',
      `Expected array at ${path}, got ${typeof value}`,
      path,
      value
    )
  }
  return value
}

function l2AssertString(value: unknown, path: string): string {
  if (typeof value !== 'string') {
    throw new Layer2ValidationError(
      'shape',
      `Expected string at ${path}, got ${typeof value}`,
      path,
      value
    )
  }
  return value
}

const REQUIRED_LAYER2_KEYS: ReadonlyArray<keyof Layer2Assessment> = [
  'version',
  'layer1_schema_version',
  'passion_diagnosis',
  'control_filter',
  'oikeiosis',
  'value_assessment',
  'kathekon_assessment',
  'iterative_refinement',
  'katorthoma_proximity',
  'ruling_faculty_state',
  'virtue_domains_engaged',
  'improvement_path_structured',
  'stage_scores',
  'hasty_assent_risk',
  // Added 2026-05-06 (M1-CP4b)
  'intake_clarifications',
  'layer1_ambiguity_notes',
  'layer2_ambiguity_notes',
]

// Added 2026-05-06 (M1-CP4b) — valid-value sets for AC-13 / AC-14 enums

const SOFT_TRIGGER_CODES: ReadonlyArray<SoftClarification['trigger_code']> = [
  'STATED_OPERATIVE_CONFLICT',
  'STATED_EQUANIMITY_UNVERIFIED',
]

const OPEN_TRIGGER_CODES: ReadonlyArray<OpenDeferralEntry['trigger_code']> = [
  'EUPATHEIA_BOUNDARY',
  'PRAXIS_MOTIVATION_AMBIGUITY',
]

const DEFERRAL_STATUSES: ReadonlyArray<DeferralStatus> = ['open', 'closed']

const MOTIVATION_CLASSIFICATIONS: ReadonlyArray<
  Exclude<MotivationClassification, null>
> = [
  'virtue_explicit',
  'virtue_inferred',
  'convention_inferred',
  'unclear_pending_clarification',
]

/**
 * Validate that `parsed` conforms to Layer2Assessment. Throws Layer2ValidationError
 * on any structural or version mismatch. Per ADR-006 §5.
 *
 * Defensive: under correct module behaviour, applyMechanisms always returns a
 * valid Layer2Assessment. The validator catches programming-error regressions
 * during refactor and supports JSON round-trip safety in the harness.
 */
export function validateLayer2Assessment(parsed: unknown): Layer2Assessment {
  const root = l2AssertObject(parsed, '$')

  for (const key of REQUIRED_LAYER2_KEYS) {
    if (!(key in root)) {
      throw new Layer2ValidationError('shape', `Missing required key: ${key}`, key)
    }
  }

  if (root.version !== 'layer2-assessment-v1') {
    throw new Layer2ValidationError(
      'version',
      `Expected version 'layer2-assessment-v1', got ${JSON.stringify(root.version)}`,
      'version',
      root.version
    )
  }
  if (root.layer1_schema_version !== 'layer1-schema-v1') {
    throw new Layer2ValidationError(
      'version',
      `Expected layer1_schema_version 'layer1-schema-v1', got ${JSON.stringify(root.layer1_schema_version)}`,
      'layer1_schema_version',
      root.layer1_schema_version
    )
  }

  // Per-mechanism shape checks (light — defensive only; full shape is the
  // module's responsibility)
  l2AssertObject(root.passion_diagnosis, 'passion_diagnosis')
  l2AssertObject(root.control_filter, 'control_filter')
  l2AssertObject(root.oikeiosis, 'oikeiosis')
  l2AssertObject(root.value_assessment, 'value_assessment')
  l2AssertObject(root.kathekon_assessment, 'kathekon_assessment')
  const iterativeRefinement = l2AssertObject(root.iterative_refinement, 'iterative_refinement')
  l2AssertObject(root.stage_scores, 'stage_scores')
  l2AssertString(root.ruling_faculty_state, 'ruling_faculty_state')
  l2AssertArray(root.virtue_domains_engaged, 'virtue_domains_engaged')
  l2AssertArray(root.layer1_ambiguity_notes, 'layer1_ambiguity_notes')
  l2AssertArray(root.layer2_ambiguity_notes, 'layer2_ambiguity_notes')

  // improvement_path_structured may be null
  if (root.improvement_path_structured !== null) {
    l2AssertObject(root.improvement_path_structured, 'improvement_path_structured')
  }

  // Added 2026-05-06 (M1-CP4b) — iterative_refinement.motivation_classification
  // Allow null OR membership in MOTIVATION_CLASSIFICATIONS.
  const mc = iterativeRefinement.motivation_classification
  if (mc !== null) {
    if (
      typeof mc !== 'string' ||
      !MOTIVATION_CLASSIFICATIONS.includes(mc as Exclude<MotivationClassification, null>)
    ) {
      throw new Layer2ValidationError(
        'enum',
        `Invalid motivation_classification: ${JSON.stringify(mc)} (expected null or one of: ${MOTIVATION_CLASSIFICATIONS.join(', ')})`,
        'iterative_refinement.motivation_classification',
        mc
      )
    }
  }

  // Added 2026-05-06 (M1-CP4b) — intake_clarifications shape and enum membership
  const intakeClar = l2AssertObject(root.intake_clarifications, 'intake_clarifications')
  const softArr = l2AssertArray(intakeClar.soft_clarifications, 'intake_clarifications.soft_clarifications')
  const openArr = l2AssertArray(intakeClar.open_deferrals, 'intake_clarifications.open_deferrals')

  softArr.forEach((entry, i) => {
    const path = `intake_clarifications.soft_clarifications[${i}]`
    const o = l2AssertObject(entry, path)
    const trigger = o.trigger_code
    if (
      typeof trigger !== 'string' ||
      !SOFT_TRIGGER_CODES.includes(trigger as SoftClarification['trigger_code'])
    ) {
      throw new Layer2ValidationError(
        'enum',
        `Invalid soft trigger_code at ${path}: ${JSON.stringify(trigger)} (expected one of: ${SOFT_TRIGGER_CODES.join(', ')})`,
        `${path}.trigger_code`,
        trigger
      )
    }
    if (o.intake_tier !== 2) {
      throw new Layer2ValidationError(
        'enum',
        `Expected intake_tier === 2 at ${path}, got ${JSON.stringify(o.intake_tier)}`,
        `${path}.intake_tier`,
        o.intake_tier
      )
    }
    l2AssertString(o.stem_id, `${path}.stem_id`)
    if (o.stem_id === '') {
      throw new Layer2ValidationError(
        'shape',
        `Expected non-empty stem_id at ${path}`,
        `${path}.stem_id`,
        o.stem_id
      )
    }
    const slots = l2AssertObject(o.slot_fills, `${path}.slot_fills`)
    for (const [k, v] of Object.entries(slots)) {
      if (typeof v !== 'string') {
        throw new Layer2ValidationError(
          'shape',
          `Expected string slot_fill at ${path}.slot_fills.${k}, got ${typeof v}`,
          `${path}.slot_fills.${k}`,
          v
        )
      }
    }
    l2AssertString(o.scope_of_change, `${path}.scope_of_change`)
  })

  openArr.forEach((entry, i) => {
    const path = `intake_clarifications.open_deferrals[${i}]`
    const o = l2AssertObject(entry, path)
    const trigger = o.trigger_code
    if (
      typeof trigger !== 'string' ||
      !OPEN_TRIGGER_CODES.includes(trigger as OpenDeferralEntry['trigger_code'])
    ) {
      throw new Layer2ValidationError(
        'enum',
        `Invalid open trigger_code at ${path}: ${JSON.stringify(trigger)} (expected one of: ${OPEN_TRIGGER_CODES.join(', ')})`,
        `${path}.trigger_code`,
        trigger
      )
    }
    if (o.intake_tier !== 3) {
      throw new Layer2ValidationError(
        'enum',
        `Expected intake_tier === 3 at ${path}, got ${JSON.stringify(o.intake_tier)}`,
        `${path}.intake_tier`,
        o.intake_tier
      )
    }
    l2AssertString(o.stem_id, `${path}.stem_id`)
    if (o.stem_id === '') {
      throw new Layer2ValidationError(
        'shape',
        `Expected non-empty stem_id at ${path}`,
        `${path}.stem_id`,
        o.stem_id
      )
    }
    const slots = l2AssertObject(o.slot_fills, `${path}.slot_fills`)
    for (const [k, v] of Object.entries(slots)) {
      if (typeof v !== 'string') {
        throw new Layer2ValidationError(
          'shape',
          `Expected string slot_fill at ${path}.slot_fills.${k}, got ${typeof v}`,
          `${path}.slot_fills.${k}`,
          v
        )
      }
    }
    const wc = l2AssertObject(o.withheld_classification, `${path}.withheld_classification`)
    l2AssertString(wc.field_path, `${path}.withheld_classification.field_path`)
    l2AssertString(wc.withheld_at_position, `${path}.withheld_classification.withheld_at_position`)
    l2AssertString(wc.reason, `${path}.withheld_classification.reason`)
    if (wc.field_path === '' || wc.withheld_at_position === '' || wc.reason === '') {
      throw new Layer2ValidationError(
        'shape',
        `Expected non-empty withheld_classification fields at ${path}`,
        `${path}.withheld_classification`,
        wc
      )
    }
    if (
      typeof o.status !== 'string' ||
      !DEFERRAL_STATUSES.includes(o.status as DeferralStatus)
    ) {
      throw new Layer2ValidationError(
        'enum',
        `Invalid status at ${path}: ${JSON.stringify(o.status)} (expected one of: ${DEFERRAL_STATUSES.join(', ')})`,
        `${path}.status`,
        o.status
      )
    }
  })

  return root as unknown as Layer2Assessment
}
