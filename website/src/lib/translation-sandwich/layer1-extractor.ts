/**
 * layer1-extractor.ts — Layer 1 of the translation-sandwich engine.
 *
 * Per ADR-005 (Layer 1 Schema Specification, Sub-session M1-CP1, 2026-05-04).
 * Per ADR-004 (Translation-Sandwich Engine Pilot on /api/reason, Sub-session E10).
 *
 * EXTRACTION ONLY. This module reads agent input and produces a structured
 * Layer1Schema. It does not assess, judge, recommend, or generate prose.
 * Layer 2 (deterministic mechanism application) consumes its output.
 *
 * Compliance:
 *   - AC1: Sonnet (MODEL_DEEP) per row "Layer 1 translation (alt-3)"
 *   - AC6: Layer 1 RAG block in system message (cached); per-request contexts in user message
 *   - AC8: New module under translation-sandwich/ — first build under the architecture
 *   - KG1: Awaited LLM call; no module-level cache; no DB writes; no self-calls
 *   - KG2: Sonnet selected (multi-step structured extraction outside Haiku boundary)
 *   - R7:  Verbatim evidence quotes preserved in every category entry
 *   - R8a: Controlled vocabularies (Greek identifiers, canonical taxonomies)
 *
 * Status at file creation: Wired (standalone). Reaches Verified (standalone) after
 * harness Phase 1 + Phase 2 pass against fixtures F1–F4. Not imported by any route
 * until M1-CP4 (per ADR-004 §10.1 inter-checkpoint state).
 */

import { getClient, formatRetrievedPassagesAsBlock } from '@/lib/sage-reason-engine'
import { MODEL_DEEP } from '@/lib/model-config'
import { extractJSON } from '@/lib/json-utils'
import type { RetrievedPassage } from '@/lib/rag'

// ============================================================================
// CONTROLLED VOCABULARIES (R8a) — exported for Layer 2 + harness consumption
// ============================================================================

export type RootPassion = 'epithumia' | 'hedone' | 'phobos' | 'lupe'

export type EpithumiaSubSpecies =
  | 'orge'
  | 'eros'
  | 'pothos'
  | 'philedonia'
  | 'philoplousia'
  | 'philodoxia'

export type HedoneSubSpecies = 'kelesis' | 'epichairekakia' | 'terpsis'

export type PhobosSubSpecies =
  | 'deima'
  | 'oknos'
  | 'aischyne'
  | 'thambos'
  | 'thorybos'
  | 'agonia'

export type LupeSubSpecies =
  | 'eleos'
  | 'phthonos'
  | 'zelotypia'
  | 'penthos'
  | 'achos'

export type PassionSubSpecies =
  | EpithumiaSubSpecies
  | HedoneSubSpecies
  | PhobosSubSpecies
  | LupeSubSpecies

export type CausalStage = 'phantasia' | 'synkatathesis' | 'horme' | 'praxis'

export type OikeiosisCircle =
  | 'self_preservation'
  | 'household'
  | 'local_community'
  | 'political_community'
  | 'cosmopolis'

export type Indifferent =
  | 'life'
  | 'health'
  | 'pleasure'
  | 'beauty'
  | 'strength'
  | 'wealth'
  | 'reputation'
  | 'noble_birth'
  | 'death'
  | 'disease'
  | 'pain'
  | 'ugliness'

export type AgentFraming = 'good' | 'evil' | 'indifferent' | 'unspecified'

export type AgentNamedPosition = 'within' | 'outside' | 'unspecified'

export type KathekonFactorType =
  | 'natural_relationship'
  | 'role_obligation'
  | 'justification_offered'

export type UrgencySignalType =
  | 'time_pressure'
  | 'imminent_deadline'
  | 'finality_language'
  | 'irreversibility_language'

// Added 2026-05-06 (M1-CP4b) — eupatheia + stated-equanimity vocabularies per AC-14 + Tier 2

export type EupatheiaShape = 'chara' | 'boulesis' | 'eulabeia'

export type StatedEquanimitySignal =
  | 'felt_fine'
  | 'felt_calm'
  | 'felt_at_peace'
  | 'didnt_bother_me'
  | 'other_explicit_calm'

// ============================================================================
// PER-CATEGORY ENTRY SHAPES
// ============================================================================

export interface PassionPresent {
  /** Root passion per the canonical taxonomy. */
  root_passion: RootPassion
  /** Sub-species when identifiable; null when the root is named but the sub-species
   *  cannot be determined from the input. */
  sub_species: PassionSubSpecies | null
  /** Verbatim quote from the input. R7 source fidelity. */
  evidence: string
}

export interface ControlFilterElement {
  /** Verbatim item the agent named as a concern. */
  item: string
  /** How the agent appears to frame this item. Layer 2 decides the canonical
   *  classification using its rules table; this field records the agent's
   *  framing only. */
  agent_named_position: AgentNamedPosition
}

export interface OikeiosisCircleEngaged {
  circle: OikeiosisCircle
  /** Verbatim quote naming the parties or relationships at this circle level. */
  evidence: string
}

export interface ValueCategoryAtStake {
  indifferent: Indifferent
  /** How the agent frames this indifferent. Layer 2 compares against axia
   *  (canonical Stoic ranking) to compute value errors. */
  agent_framing: AgentFraming
  evidence: string
}

export interface KathekonFactor {
  factor_type: KathekonFactorType
  /** Layer 1's brief description (one phrase). */
  description: string
  evidence: string
}

export interface UrgencyIndicator {
  signal_type: UrgencySignalType
  evidence: string
}

export interface CausalStageEvidence {
  stage: CausalStage
  evidence: string
}

// Added 2026-05-06 (M1-CP4b) — entry shapes for the four new top-level fields per ADR-005 §3.8–§3.11

export interface EupatheiaCandidate {
  /** Eupatheia shape detected in the input. */
  shape: EupatheiaShape
  /** Verbatim quote from the input that motivates this detection. R7 source fidelity. */
  evidence: string
  /** Who or what the candidate eupatheia is about (e.g., "the team's win", "her promotion").
   *  Null when the input names the eupatheia shape but not a specific target. */
  narrative_target: string | null
}

export interface StatedConcernTarget {
  /** The agent's named focus — verbatim phrase ("the team", "her", "my daughter"). */
  stated_target: string
  /** What the agent says they're worried about for themselves, separately from the
   *  named target. Null when the agent names the target without a self-concern phrase. */
  for_self_concern: string | null
  /** Verbatim quote from the input. R7 source fidelity. */
  evidence: string
}

export interface StatedEquanimitySignalEntry {
  signal_type: StatedEquanimitySignal
  /** Verbatim quote from the input. R7 source fidelity. */
  evidence: string
}

export interface MotivationEvidenceEntry {
  /** Verbatim phrase naming the agent's stated motivation ("because I care about her",
   *  "to be the kind of person who shows up"). */
  motivation: string
  /** Verbatim quote from the input. R7 source fidelity. */
  evidence: string
}

// Added 2026-05-06 (M1-CP4e) — element-fusion entry shape per ADR-005 §3.12 + ADR-008 §3.1

/** Layer 1's structural detection of element fusion (whether the input names multiple
 *  distinct concerns the engine cannot decompose into separable entities). When
 *  `fused: true`, the orchestrator (per ADR-008 §5) bypasses Layer 2 entirely and
 *  emits a Tier 1 ELEMENT_FUSION force-clarification. Default `{ fused: false,
 *  fused_concerns: null }`. */
export interface ElementFusionDetected {
  /** True when Layer 1 recognises that the input contains multiple distinct concerns
   *  at the high-level Layer 1 categories AND cannot decompose them. False is the
   *  typical case. */
  fused: boolean
  /** When `fused: true`: a non-empty array of high-level concern labels Layer 1
   *  partially extracted before the fusion was detected. When `fused: false`:
   *  null. The validator enforces this cross-field invariant. */
  fused_concerns: string[] | null
}

// ============================================================================
// CARRIED-CONTEXT PLACEHOLDER TYPES (added 2026-05-14, D-LAYER1-SCHEMA-ADDITIONS)
// ============================================================================
//
// PLACEHOLDER SCAFFOLDING — pending mode-spec adoption. The four-mode substrate
// response redesign (D-A6-RESCOPED-TO-FOUR-MODE-REDESIGN-2026-05-14) surfaced
// eight optional Layer 1 input fields: four for private mode, four for the
// Sage Assent Wrapper. They are *carried context* — context the wrapper
// or the private-mode service supplies, which flows THROUGH Layer 1 untouched
// to Layer 2. Layer 1 does NOT extract them; the LLM system prompt is unchanged.
//
// The field names and types here are PLACEHOLDERS. The five mode specs are at
// Designed status (not Adopted); these types are refined when the specs are
// adopted. Nothing consumes these fields yet, so renaming/reshaping is cheap.
//
// The three trust-layer-owned shapes (CarriedProfile, ProfileProvenance,
// PeerAgentAssessment) are intentionally permissive Record<string, unknown>
// rather than imports of WindowSnapshot / EvaluatedAction / AccreditationPayload
// from /trust-layer/: that directory is outside website/'s tsconfig root, and
// the Sage Assent Wrapper build is where the substrate<->trust-layer reconciliation
// happens. Locking the shapes here would be premature.

/** PLACEHOLDER — private mode. The authenticated subject's identity reference.
 *  The R17e gate: private mode cannot be called about anyone else. Triggers the
 *  server-side load of the subject's encrypted profile. Final shape pending
 *  private-mode spec adoption + the agent-identity-binding design.
 *  See /drafts/private-mode-response-spec.md §"Layer 1 input placeholder fields". */
export interface SubjectIdentityBinding {
  subject_id: string
}

/** PLACEHOLDER — private mode. How far back to draw trajectory + cross-submission
 *  data. Mirrors mentor-interactions-loader.ts windowDays/limit (default 90 days
 *  / 100 rows). Final shape pending private-mode spec adoption.
 *  See /drafts/private-mode-response-spec.md §"Layer 1 input placeholder fields". */
export interface HistoryWindow {
  window_days?: number
  limit?: number
}

/** PLACEHOLDER — Sage Assent Wrapper. The agent's accumulated trajectory (a WindowSnapshot
 *  or raw EvaluatedAction[] from /trust-layer/). Permissive until the Sage Assent Wrapper
 *  build reconciles the substrate's Layer2Assessment with the existing
 *  /trust-layer/ EvaluatedAction type.
 *  See /adopted/substrate-modes/sage-assent-wrapper-spec.md §"Layer 1 implications". */
export type CarriedProfile = Record<string, unknown>

/** PLACEHOLDER — Sage Assent Wrapper. Gaming defence: attests the carried_profile came
 *  from the agent's own prior substrate assessments, not injected third-party
 *  content. Final shape pending Sage Assent Wrapper spec adoption.
 *  See /adopted/substrate-modes/sage-assent-wrapper-spec.md §"Layer 1 implications". */
export type ProfileProvenance = Record<string, unknown>

/** PLACEHOLDER — Sage Assent Wrapper. One peer agent's assessment, for multi-agent
 *  orchestration — an AccreditationPayload and/or agent-mode rendering of a peer
 *  agent an orchestrator is deciding based on. Final shape pending Sage Assent Wrapper
 *  spec adoption.
 *  See /adopted/substrate-modes/sage-assent-wrapper-spec.md §"Layer 1 implications". */
export type PeerAgentAssessment = Record<string, unknown>

/** Sage Assent Wrapper — Decision B (D-ATL-ITEMS-1-3-BUILD-WIRED-VERIFIED-2026-05-16,
 *  added 2026-05-16). The wrapper's working set of unchosen-but-still-live
 *  candidates from past parallel evaluations, projected via
 *  toCarriedCandidatesPayload(). Permissive Record<string, unknown> (matches
 *  the existing carried-context pattern) until tighter Sage Assent-spec coupling. */
export type CarriedCandidatesField = Record<string, unknown>

// ============================================================================
// SAGE CALLING — DISCOVERED-PURPOSE CARRIED-CONTEXT TYPES
// (added 2026-05-21, D-SAGE-CALLING-STAGE1; per
//  /adopted/purpose-discovery-product-design.md D-5)
// ============================================================================
//
// Sage Calling (the purpose-discovery product) is UPSTREAM of this substrate.
// When its six-stage sequence finds a purpose (Q5), it emits the
// five-specification handoff template. Per D-5 that template lands here as an
// OPTIONAL, additive, backward-compatible field on Layer1Schema —
// `discovered_purpose` — following the same carried-context pattern as the nine
// fields above: Layer 1's LLM never produces it; Sage Calling supplies it on the
// pre-extracted layer1_schema path; it flows through Layer 1 untouched to
// Layer 2, which defensively tolerates it (does not yet act on it).
//
// All sub-fields are OPTIONAL. Nothing populates `discovered_purpose` until
// Sage Calling's rule-based engine is wired in build Stage 2 (Critical). A
// Layer1Schema with or without it is valid; existing callers are unaffected.
// Version string stays unchanged (additive optional field — same precedent as
// the eight 2026-05-14 carried-context fields, which stayed v1).
//
// The five sub-fields mirror the locked five-specification template
// (/adopted/purpose-discovery-product-design.md §"The five-specification Layer 1
// handoff template", specs 1-5).

/** Spec 2 — which oikeiosis circle the work primarily serves. Sage Calling's
 *  purpose-discovery circle vocabulary, per the locked five-spec template —
 *  intentionally distinct from this module's OikeiosisCircle *extraction* enum
 *  (self_preservation | household | local_community | political_community |
 *  cosmopolis). */
export type DiscoveredPurposeCircle =
  | 'self'
  | 'immediate'
  | 'community'
  | 'wider'
  | 'universal'

/** Spec 3 — which of Cicero's four personae is operative. The `chosen_role`
 *  persona carries the strongest obligation (it is actively taken on). */
export type DiscoveredPurposeRole =
  | 'shared_rational_nature'
  | 'individual_nature'
  | 'circumstance'
  | 'chosen_role'

/** Spec 2 — the circle-and-obligation structured object. D-5 locked this as a
 *  structured field (rather than enum+string). Both sub-fields optional;
 *  validated when present. */
export interface DiscoveredPurposeCircleAndObligation {
  /** Which oikeiosis circle the work primarily serves. */
  circle?: DiscoveredPurposeCircle
  /** What obligation that circle carries for this agent given its position and
   *  capacity. */
  obligation?: string
}

/** Spec 5 — the first appropriate act: the kathekon available now (not
 *  contingent on future conditions). A plain description plus optional
 *  structured action metadata (permissive until Stage 2 finalises the metadata
 *  shape — parallels the carried-context permissive pattern). */
export interface DiscoveredPurposeFirstAct {
  /** Plain-language description of the kathekon available now. */
  description?: string
  /** Optional structured action metadata. */
  action_metadata?: Record<string, unknown> | null
}

/** The five-specification purpose-discovery handoff (Sage Calling → substrate),
 *  per D-5. All five sub-fields are OPTIONAL — populated by Sage Calling's
 *  engine in build Stage 2; absent/partial states are valid in the interim
 *  (Stage 2's producer contract enforces completeness on a real handoff). */
export interface DiscoveredPurpose {
  /** Spec 1 — the work: what it does in the world, stripped of the agent's
   *  relationship to it. */
  work?: string
  /** Spec 2 — the circle the work serves + the obligation that circle carries. */
  circle_and_obligation?: DiscoveredPurposeCircleAndObligation | null
  /** Spec 3 — the operative persona. */
  role?: DiscoveredPurposeRole | null
  /** Spec 4 — the capacity brought: demonstrated capacities relevant to the work
   *  (a subset of the agent's full capacity profile from Q2). */
  capacity?: string[] | null
  /** Spec 5 — the first appropriate act available now. */
  first_appropriate_act?: DiscoveredPurposeFirstAct | null
}

// ============================================================================
// TOP-LEVEL SCHEMA
// ============================================================================

export interface Layer1Schema {
  /** Schema version. Constant. Bumped if the schema shape changes.
   *  Note (M1-CP4b, 2026-05-06): the four new fields below are additive; version
   *  remains 'layer1-schema-v1'. The producer (extractFeatures + system prompt) is
   *  updated in the same amendment cycle so no consumer reads the schema without
   *  the new fields.
   *  Note (D-LAYER1-SCHEMA-ADDITIONS, 2026-05-14): the eight carried-context
   *  fields at the end of this interface are additive AND optional — version
   *  remains 'layer1-schema-v1'. Unlike the M1-CP4b fields, the producer is NOT
   *  updated: Layer 1 does not populate carried context; the wrapper /
   *  private-mode service does (future build sessions). A v1 schema is valid
   *  with or without them; optional + additive + backward-compatible.
   *  Note (D-ATL-ITEMS-1-3-BUILD-WIRED-VERIFIED-2026-05-16, 2026-05-16):
   *  schema version BUMPED to 'layer1-schema-v2' with the addition of the 5th
   *  wrapper-populated optional field `carried_candidates` (Decision B). The
   *  field is OPTIONAL (nullable) and additive — a v2 schema without it is
   *  valid, and existing v1 consumers that don't read the field are unaffected.
   *  Older v1 schemas are forward-compatible (parser accepts them and treats
   *  the new field as absent). The bump is recorded for Rule A (licensing
   *  gate); the Layer 1 open-source reference distribution carries v2 onward.
   *  Note (D-SAGE-CALLING-STAGE2-ENDPOINT, 2026-05-21): schema version BUMPED to
   *  'layer1-schema-v3' to reflect the `discovered_purpose` field (D-5; added
   *  additively in Stage 1) now being a populated handoff target (Sage Calling
   *  build Stage 2). Same precedent as the v2 bump: the type union + validator
   *  widen to ACCEPT v3 (rejecting nothing previously valid); the producer
   *  system-prompt example is NOT changed (discovered_purpose is wrapper-supplied,
   *  not Layer-1-LLM-emitted — exactly like carried_candidates), so /api/reason's
   *  Layer 1 runtime output is byte-unchanged. Layer 2's layer1_schema_version is
   *  a SEPARATE, decoupled field hard-pinned to 'layer1-schema-v1', so this bump
   *  does not touch Layer 2. Recorded for Rule A (licensing gate). */
  version: 'layer1-schema-v1' | 'layer1-schema-v2' | 'layer1-schema-v3'
  passions_present: PassionPresent[]
  control_filter_elements: ControlFilterElement[]
  oikeiosis_circles_engaged: OikeiosisCircleEngaged[]
  value_categories_at_stake: ValueCategoryAtStake[]
  kathekon_factors: KathekonFactor[]
  urgency_indicators: UrgencyIndicator[]
  causal_stage_evidence: CausalStageEvidence[]
  // Added 2026-05-06 (M1-CP4b) — structural-trigger fields for AC-14 + Tier 2
  /** Eupatheia (good emotion) shapes detected in the input. Empty when no chara /
   *  boulesis / eulabeia patterns are present. Layer 2's eupatheia-boundary check
   *  fires Tier 3 OPEN_DEFERRAL on each entry per AC-14. */
  eupatheia_candidates: EupatheiaCandidate[]
  /** Phrases where the agent names a target distinct from the implicit operative
   *  circle ("I'm doing this for the community", "It's about the kids"). Layer 2's
   *  STATED_OPERATIVE_CONFLICT check compares stated target vs operative circle.
   *  Empty when the agent doesn't explicitly name a target beyond the engaged circle. */
  stated_concern_targets: StatedConcernTarget[]
  /** Explicit calm-language signals ("I felt fine", "it didn't bother me"). Layer 2's
   *  STATED_EQUANIMITY_UNVERIFIED check fires when calm coincides with passion-shape
   *  detection. Empty when the agent does not explicitly name calm. */
  stated_equanimity_signals: StatedEquanimitySignalEntry[]
  /** True when the agent explicitly states why they did what they did. Default false
   *  (motivation unstated) — the structural condition for PRAXIS_MOTIVATION_AMBIGUITY
   *  when combined with principled+ katorthoma_proximity at praxis stage. */
  motivation_stated: boolean
  /** Verbatim motivation phrases when motivation_stated is true. Empty when
   *  motivation_stated is false. */
  motivation_evidence: MotivationEvidenceEntry[]
  // Added 2026-05-06 (M1-CP4e) — element-fusion field per ADR-005 §3.12 + ADR-008 §3.1
  /** Element-fusion detection. `fused: true` halts the engine at Layer 1; the
   *  orchestrator (per ADR-008 §5) emits a Tier 1 ELEMENT_FUSION force-clarification.
   *  Default `{ fused: false, fused_concerns: null }`. The validator enforces the
   *  cross-field invariant (fused: true ⇔ fused_concerns is non-empty array;
   *  fused: false ⇔ fused_concerns === null). */
  element_fusion_detected: ElementFusionDetected
  /** Free-form notes naming any uncertainty. Empty when the extraction is
   *  unambiguous. */
  ambiguity_notes: string[]

  // ==========================================================================
  // CARRIED-CONTEXT FIELDS — added 2026-05-14 (D-LAYER1-SCHEMA-ADDITIONS).
  // PLACEHOLDER SCAFFOLDING pending mode-spec adoption. All eight are OPTIONAL
  // and additive: a Layer1Schema with none of them is valid (the per-response,
  // un-wrapped, public case — every /api/reason call today). Layer 1 does NOT
  // populate these — they are carried context the wrapper / private-mode service
  // supplies (future build sessions), flowing through Layer 1 untouched to
  // Layer 2. Layer 2 defensively tolerates them (does not yet act on them).
  // Version string stays 'layer1-schema-v1'.
  // ==========================================================================

  // -- From private mode (4 fields) --
  // See /drafts/private-mode-response-spec.md §"Layer 1 input placeholder fields".

  /** PLACEHOLDER — private mode. The authenticated subject's identity. The R17e
   *  gate — private mode cannot be called about anyone else. Triggers the
   *  server-side load of the subject's encrypted profile (the human equivalent
   *  of the agent's carried_profile). */
  subject_identity_binding?: SubjectIdentityBinding | null

  /** PLACEHOLDER — private mode. The practitioner's own account of what was
   *  operative for them. Closes the reflection-component loop: when provided,
   *  the motivation + eupatheia classifications are not withheld. */
  reflective_self_report?: string | null

  /** PLACEHOLDER — private mode. How far back to draw trajectory +
   *  cross-submission data. Mirrors mentor-interactions-loader.ts
   *  windowDays/limit (default 90 days / 100 rows). */
  history_window?: HistoryWindow | null

  /** PLACEHOLDER — private mode. The current entry's topic, for the
   *  topic-projection logic practitioner-context.ts already implements
   *  (detectTopicSignal / projectProfile). */
  topic_signal?: string | null

  // -- From the Sage Assent Wrapper (4 fields) --
  // See /adopted/substrate-modes/sage-assent-wrapper-spec.md §"Layer 1 implications".

  /** PLACEHOLDER — Sage Assent Wrapper. The agent's accumulated trajectory (the
   *  WindowSnapshot, or raw EvaluatedAction[], from /trust-layer/). Lets Layer 2
   *  do trajectory-aware assessment for agents. Parallel to private mode's
   *  subject_identity_binding: server-side encrypted load for humans,
   *  wrapper-carried for agents. The Layer 2 JSON is the universal
   *  profile-update unit for both. */
  carried_profile?: CarriedProfile | null

  /** PLACEHOLDER — Sage Assent Wrapper. Gaming defence — attests the carried_profile
   *  came from the agent's own prior substrate assessments, not injected
   *  third-party content. */
  profile_provenance?: ProfileProvenance | null

  /** PLACEHOLDER — Sage Assent Wrapper. For multi-agent orchestration — the
   *  AccreditationPayloads and/or agent-mode renderings of the peer agents an
   *  orchestrator agent is deciding based on. */
  peer_agent_assessments?: PeerAgentAssessment[] | null

  /** PLACEHOLDER — Sage Assent Wrapper. Gaming defence (Form 2) — the agent's declared
   *  optimisation target, checked against the candidate action for
   *  STATED_OPERATIVE_CONFLICT. */
  objective_function_declaration?: string | null

  /** Sage Assent Wrapper — Decision B (D-ATL-ITEMS-1-3-BUILD-WIRED-VERIFIED-2026-05-16).
   *  The wrapper's working set of unchosen-but-still-live candidates from past
   *  parallel evaluations — populated by toCarriedCandidatesPayload() in
   *  sage-assent-wrapper.ts and threaded into the agent's next substrate call so
   *  Layer 2 can see what the agent is still holding under consideration.
   *
   *  This is the 5th wrapper-populated optional field, alongside
   *  carried_profile / profile_provenance / peer_agent_assessments /
   *  objective_function_declaration. OPTIONAL (nullable) → additive +
   *  backward-compatible. Versioned change to the open Layer 1 contract — see
   *  the `version` field note on the schema-version bump to v2. */
  carried_candidates?: CarriedCandidatesField | null

  // -- From Sage Calling (1 field) — added 2026-05-21 (D-SAGE-CALLING-STAGE1) --
  // See /adopted/purpose-discovery-product-design.md §D-5 + the DiscoveredPurpose
  // type above.

  /** Sage Calling — D-5. The five-specification purpose-discovery handoff,
   *  supplied by the Sage Calling product (UPSTREAM of this substrate) when its
   *  six-stage sequence finds a purpose. OPTIONAL + additive + backward-
   *  compatible — Layer 1 never produces it; nothing populates it until Sage
   *  Calling's engine is wired in build Stage 2 (Critical). A Layer1Schema with
   *  or without it is valid, and Layer 2 tolerates it inertly. Version string
   *  unchanged (additive optional field — same precedent as the eight
   *  2026-05-14 carried-context fields). */
  discovered_purpose?: DiscoveredPurpose | null
}

// ============================================================================
// MODULE INPUT (mirrors runSageReason's input shape — L7a per ADR-005)
// ============================================================================

export interface ExtractInput {
  /** Required — the agent's input text. */
  input: string
  /** Optional — supplemental context provided by the caller. */
  context?: string
  /** Optional — domain context. */
  domain_context?: string
  /** Optional — supplemental urgency context from the caller. Layer 1's
   *  `urgency_indicators` field extracts urgency from the agent's own language;
   *  this parameter is supplemental information only. */
  urgency_context?: string
  /** Optional — formatted Stoic Brain block. When provided, placed in the system
   *  message with cache_control. */
  stoicBrainContext?: string
  /** Optional — D6 + D7 retrieved passages. When provided AND stoicBrainContext
   *  is empty, the module formats them via formatRetrievedPassagesAsBlock. */
  retrievedPassages?: RetrievedPassage[]
  /** Optional — practitioner profile (AC6 layer 2). User-message placement. */
  practitionerContext?: string | null
  /** Optional — project state (AC6 layer 3). User-message placement. */
  projectContext?: string | null
}

// ============================================================================
// VALID-VALUE SETS (used by validator)
// ============================================================================

const ROOT_PASSIONS: ReadonlyArray<RootPassion> = [
  'epithumia',
  'hedone',
  'phobos',
  'lupe',
]

const SUB_SPECIES: ReadonlyArray<PassionSubSpecies> = [
  // epithumia
  'orge',
  'eros',
  'pothos',
  'philedonia',
  'philoplousia',
  'philodoxia',
  // hedone
  'kelesis',
  'epichairekakia',
  'terpsis',
  // phobos
  'deima',
  'oknos',
  'aischyne',
  'thambos',
  'thorybos',
  'agonia',
  // lupe
  'eleos',
  'phthonos',
  'zelotypia',
  'penthos',
  'achos',
]

const CAUSAL_STAGES: ReadonlyArray<CausalStage> = [
  'phantasia',
  'synkatathesis',
  'horme',
  'praxis',
]

const CIRCLES: ReadonlyArray<OikeiosisCircle> = [
  'self_preservation',
  'household',
  'local_community',
  'political_community',
  'cosmopolis',
]

const INDIFFERENTS: ReadonlyArray<Indifferent> = [
  'life',
  'health',
  'pleasure',
  'beauty',
  'strength',
  'wealth',
  'reputation',
  'noble_birth',
  'death',
  'disease',
  'pain',
  'ugliness',
]

const AGENT_FRAMINGS: ReadonlyArray<AgentFraming> = [
  'good',
  'evil',
  'indifferent',
  'unspecified',
]

const AGENT_POSITIONS: ReadonlyArray<AgentNamedPosition> = [
  'within',
  'outside',
  'unspecified',
]

const KATHEKON_FACTOR_TYPES: ReadonlyArray<KathekonFactorType> = [
  'natural_relationship',
  'role_obligation',
  'justification_offered',
]

const URGENCY_SIGNAL_TYPES: ReadonlyArray<UrgencySignalType> = [
  'time_pressure',
  'imminent_deadline',
  'finality_language',
  'irreversibility_language',
]

// Added 2026-05-06 (M1-CP4b) — valid-value sets for AC-14 + Tier 2 vocabularies

const EUPATHEIA_SHAPES: ReadonlyArray<EupatheiaShape> = [
  'chara',
  'boulesis',
  'eulabeia',
]

const STATED_EQUANIMITY_SIGNALS: ReadonlyArray<StatedEquanimitySignal> = [
  'felt_fine',
  'felt_calm',
  'felt_at_peace',
  'didnt_bother_me',
  'other_explicit_calm',
]

// Added 2026-05-21 (D-SAGE-CALLING-STAGE1) — Sage Calling discovered_purpose
// enums (D-5). Used by the optional discovered_purpose field validation.

const DISCOVERED_PURPOSE_CIRCLES: ReadonlyArray<DiscoveredPurposeCircle> = [
  'self',
  'immediate',
  'community',
  'wider',
  'universal',
]

const DISCOVERED_PURPOSE_ROLES: ReadonlyArray<DiscoveredPurposeRole> = [
  'shared_rational_nature',
  'individual_nature',
  'circumstance',
  'chosen_role',
]

// ============================================================================
// VALIDATOR (per ADR-005 §6 — hand-rolled, no Zod)
// ============================================================================

export type Layer1ValidationCategory = 'parse' | 'shape' | 'enum' | 'version'

export class Layer1ValidationError extends Error {
  readonly category: Layer1ValidationCategory
  readonly field?: string
  readonly value?: unknown

  constructor(
    category: Layer1ValidationCategory,
    message: string,
    field?: string,
    value?: unknown
  ) {
    super(message)
    this.name = 'Layer1ValidationError'
    this.category = category
    this.field = field
    this.value = value
  }
}

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

function assertString(value: unknown, path: string): string {
  if (typeof value !== 'string') {
    throw new Layer1ValidationError(
      'shape',
      `Expected string at ${path}, got ${typeof value}`,
      path,
      value
    )
  }
  return value
}

/** Added 2026-05-14 (D-LAYER1-SCHEMA-ADDITIONS) — used by the optional
 *  carried-context field validation (history_window numeric sub-fields). */
function assertNumber(value: unknown, path: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new Layer1ValidationError(
      'shape',
      `Expected finite number at ${path}, got ${typeof value}`,
      path,
      value
    )
  }
  return value
}

function assertEnum<T extends string>(
  value: unknown,
  valid: ReadonlyArray<T>,
  path: string
): T {
  if (typeof value !== 'string' || !valid.includes(value as T)) {
    throw new Layer1ValidationError(
      'enum',
      `Invalid enum value at ${path}: ${JSON.stringify(value)} (expected one of: ${valid.join(', ')})`,
      path,
      value
    )
  }
  return value as T
}

function assertArray(value: unknown, path: string): unknown[] {
  if (!Array.isArray(value)) {
    throw new Layer1ValidationError(
      'shape',
      `Expected array at ${path}, got ${typeof value}`,
      path,
      value
    )
  }
  return value
}

function assertObject(value: unknown, path: string): Record<string, unknown> {
  if (!isObject(value)) {
    throw new Layer1ValidationError(
      'shape',
      `Expected object at ${path}, got ${Array.isArray(value) ? 'array' : typeof value}`,
      path,
      value
    )
  }
  return value
}

const REQUIRED_KEYS: ReadonlyArray<keyof Layer1Schema> = [
  'version',
  'passions_present',
  'control_filter_elements',
  'oikeiosis_circles_engaged',
  'value_categories_at_stake',
  'kathekon_factors',
  'urgency_indicators',
  'causal_stage_evidence',
  // Added 2026-05-06 (M1-CP4b)
  'eupatheia_candidates',
  'stated_concern_targets',
  'stated_equanimity_signals',
  'motivation_stated',
  'motivation_evidence',
  // Added 2026-05-06 (M1-CP4e) — Tier 1 ELEMENT_FUSION trigger field
  'element_fusion_detected',
  'ambiguity_notes',
]

/**
 * Validate that `parsed` conforms to Layer1Schema. Throws Layer1ValidationError
 * on any structural, enum, or version mismatch.
 *
 * Per ADR-005 §6. Per ADR-004 §9.1 — a throw triggers the bundled-depth fallback
 * at the route at M1-CP4.
 */
export function validateLayer1Schema(parsed: unknown): Layer1Schema {
  const root = assertObject(parsed, '$')

  // Required keys present
  for (const key of REQUIRED_KEYS) {
    if (!(key in root)) {
      throw new Layer1ValidationError('shape', `Missing required key: ${key}`, key)
    }
  }

  // Version — accepts v1 (legacy) or v2 (post-D-ATL-ITEMS-1-3-BUILD-WIRED-
  // VERIFIED-2026-05-16). The new optional carried_candidates field is the
  // sole shape difference; v1 schemas without it remain valid (forward-compat).
  if (
    root.version !== 'layer1-schema-v1' &&
    root.version !== 'layer1-schema-v2' &&
    root.version !== 'layer1-schema-v3'
  ) {
    throw new Layer1ValidationError(
      'version',
      `Expected version 'layer1-schema-v1', 'layer1-schema-v2', or 'layer1-schema-v3', got ${JSON.stringify(root.version)}`,
      'version',
      root.version
    )
  }
  const schemaVersion: 'layer1-schema-v1' | 'layer1-schema-v2' | 'layer1-schema-v3' = root.version

  // passions_present
  const passions: PassionPresent[] = assertArray(root.passions_present, 'passions_present').map(
    (entry, i) => {
      const o = assertObject(entry, `passions_present[${i}]`)
      const subSpeciesRaw = o.sub_species
      return {
        root_passion: assertEnum(o.root_passion, ROOT_PASSIONS, `passions_present[${i}].root_passion`),
        sub_species:
          subSpeciesRaw === null
            ? null
            : assertEnum(subSpeciesRaw, SUB_SPECIES, `passions_present[${i}].sub_species`),
        evidence: assertString(o.evidence, `passions_present[${i}].evidence`),
      }
    }
  )

  // control_filter_elements
  const controlFilterElements: ControlFilterElement[] = assertArray(
    root.control_filter_elements,
    'control_filter_elements'
  ).map((entry, i) => {
    const o = assertObject(entry, `control_filter_elements[${i}]`)
    return {
      item: assertString(o.item, `control_filter_elements[${i}].item`),
      agent_named_position: assertEnum(
        o.agent_named_position,
        AGENT_POSITIONS,
        `control_filter_elements[${i}].agent_named_position`
      ),
    }
  })

  // oikeiosis_circles_engaged
  const oikeiosisCirclesEngaged: OikeiosisCircleEngaged[] = assertArray(
    root.oikeiosis_circles_engaged,
    'oikeiosis_circles_engaged'
  ).map((entry, i) => {
    const o = assertObject(entry, `oikeiosis_circles_engaged[${i}]`)
    return {
      circle: assertEnum(o.circle, CIRCLES, `oikeiosis_circles_engaged[${i}].circle`),
      evidence: assertString(o.evidence, `oikeiosis_circles_engaged[${i}].evidence`),
    }
  })

  // value_categories_at_stake
  const valueCategoriesAtStake: ValueCategoryAtStake[] = assertArray(
    root.value_categories_at_stake,
    'value_categories_at_stake'
  ).map((entry, i) => {
    const o = assertObject(entry, `value_categories_at_stake[${i}]`)
    return {
      indifferent: assertEnum(
        o.indifferent,
        INDIFFERENTS,
        `value_categories_at_stake[${i}].indifferent`
      ),
      agent_framing: assertEnum(
        o.agent_framing,
        AGENT_FRAMINGS,
        `value_categories_at_stake[${i}].agent_framing`
      ),
      evidence: assertString(o.evidence, `value_categories_at_stake[${i}].evidence`),
    }
  })

  // kathekon_factors
  const kathekonFactors: KathekonFactor[] = assertArray(
    root.kathekon_factors,
    'kathekon_factors'
  ).map((entry, i) => {
    const o = assertObject(entry, `kathekon_factors[${i}]`)
    return {
      factor_type: assertEnum(
        o.factor_type,
        KATHEKON_FACTOR_TYPES,
        `kathekon_factors[${i}].factor_type`
      ),
      description: assertString(o.description, `kathekon_factors[${i}].description`),
      evidence: assertString(o.evidence, `kathekon_factors[${i}].evidence`),
    }
  })

  // urgency_indicators
  const urgencyIndicators: UrgencyIndicator[] = assertArray(
    root.urgency_indicators,
    'urgency_indicators'
  ).map((entry, i) => {
    const o = assertObject(entry, `urgency_indicators[${i}]`)
    return {
      signal_type: assertEnum(
        o.signal_type,
        URGENCY_SIGNAL_TYPES,
        `urgency_indicators[${i}].signal_type`
      ),
      evidence: assertString(o.evidence, `urgency_indicators[${i}].evidence`),
    }
  })

  // causal_stage_evidence
  const causalStageEvidence: CausalStageEvidence[] = assertArray(
    root.causal_stage_evidence,
    'causal_stage_evidence'
  ).map((entry, i) => {
    const o = assertObject(entry, `causal_stage_evidence[${i}]`)
    return {
      stage: assertEnum(o.stage, CAUSAL_STAGES, `causal_stage_evidence[${i}].stage`),
      evidence: assertString(o.evidence, `causal_stage_evidence[${i}].evidence`),
    }
  })

  // Added 2026-05-06 (M1-CP4b) — eupatheia_candidates
  const eupatheiaCandidates: EupatheiaCandidate[] = assertArray(
    root.eupatheia_candidates,
    'eupatheia_candidates'
  ).map((entry, i) => {
    const o = assertObject(entry, `eupatheia_candidates[${i}]`)
    const narrativeTargetRaw = o.narrative_target
    return {
      shape: assertEnum(o.shape, EUPATHEIA_SHAPES, `eupatheia_candidates[${i}].shape`),
      evidence: assertString(o.evidence, `eupatheia_candidates[${i}].evidence`),
      narrative_target:
        narrativeTargetRaw === null
          ? null
          : assertString(narrativeTargetRaw, `eupatheia_candidates[${i}].narrative_target`),
    }
  })

  // Added 2026-05-06 (M1-CP4b) — stated_concern_targets
  const statedConcernTargets: StatedConcernTarget[] = assertArray(
    root.stated_concern_targets,
    'stated_concern_targets'
  ).map((entry, i) => {
    const o = assertObject(entry, `stated_concern_targets[${i}]`)
    const forSelfRaw = o.for_self_concern
    return {
      stated_target: assertString(
        o.stated_target,
        `stated_concern_targets[${i}].stated_target`
      ),
      for_self_concern:
        forSelfRaw === null
          ? null
          : assertString(forSelfRaw, `stated_concern_targets[${i}].for_self_concern`),
      evidence: assertString(o.evidence, `stated_concern_targets[${i}].evidence`),
    }
  })

  // Added 2026-05-06 (M1-CP4b) — stated_equanimity_signals
  const statedEquanimitySignals: StatedEquanimitySignalEntry[] = assertArray(
    root.stated_equanimity_signals,
    'stated_equanimity_signals'
  ).map((entry, i) => {
    const o = assertObject(entry, `stated_equanimity_signals[${i}]`)
    return {
      signal_type: assertEnum(
        o.signal_type,
        STATED_EQUANIMITY_SIGNALS,
        `stated_equanimity_signals[${i}].signal_type`
      ),
      evidence: assertString(o.evidence, `stated_equanimity_signals[${i}].evidence`),
    }
  })

  // Added 2026-05-06 (M1-CP4b) — motivation_stated (boolean)
  if (typeof root.motivation_stated !== 'boolean') {
    throw new Layer1ValidationError(
      'shape',
      `Expected boolean at motivation_stated, got ${typeof root.motivation_stated}`,
      'motivation_stated',
      root.motivation_stated
    )
  }
  const motivationStated: boolean = root.motivation_stated

  // Added 2026-05-06 (M1-CP4b) — motivation_evidence
  const motivationEvidence: MotivationEvidenceEntry[] = assertArray(
    root.motivation_evidence,
    'motivation_evidence'
  ).map((entry, i) => {
    const o = assertObject(entry, `motivation_evidence[${i}]`)
    return {
      motivation: assertString(o.motivation, `motivation_evidence[${i}].motivation`),
      evidence: assertString(o.evidence, `motivation_evidence[${i}].evidence`),
    }
  })

  // Added 2026-05-06 (M1-CP4e) — element_fusion_detected (object with cross-field invariant)
  const elementFusion = assertObject(root.element_fusion_detected, 'element_fusion_detected')
  if (typeof elementFusion.fused !== 'boolean') {
    throw new Layer1ValidationError(
      'shape',
      `Expected boolean at element_fusion_detected.fused, got ${typeof elementFusion.fused}`,
      'element_fusion_detected.fused',
      elementFusion.fused
    )
  }
  const fused: boolean = elementFusion.fused
  const fusedConcernsRaw = elementFusion.fused_concerns
  let fusedConcerns: string[] | null
  if (fusedConcernsRaw === null) {
    fusedConcerns = null
  } else {
    // Must be an array of strings
    fusedConcerns = assertArray(
      fusedConcernsRaw,
      'element_fusion_detected.fused_concerns'
    ).map((entry, i) =>
      assertString(entry, `element_fusion_detected.fused_concerns[${i}]`)
    )
  }
  // Cross-field invariant: fused === true ⇔ fused_concerns is non-empty array;
  //                       fused === false ⇔ fused_concerns === null.
  if (fused === true) {
    if (fusedConcerns === null || fusedConcerns.length === 0) {
      throw new Layer1ValidationError(
        'shape',
        `Cross-field invariant violation at element_fusion_detected: fused === true requires fused_concerns to be a non-empty array of strings; got ${fusedConcerns === null ? 'null' : 'empty array'}.`,
        'element_fusion_detected',
        elementFusion
      )
    }
  } else {
    // fused === false
    if (fusedConcerns !== null) {
      throw new Layer1ValidationError(
        'shape',
        `Cross-field invariant violation at element_fusion_detected: fused === false requires fused_concerns === null; got ${fusedConcerns.length === 0 ? 'empty array' : 'non-empty array'}.`,
        'element_fusion_detected',
        elementFusion
      )
    }
  }
  const elementFusionDetected: ElementFusionDetected = { fused, fused_concerns: fusedConcerns }

  // ambiguity_notes
  const ambiguityNotes: string[] = assertArray(root.ambiguity_notes, 'ambiguity_notes').map(
    (entry, i) => assertString(entry, `ambiguity_notes[${i}]`)
  )

  const result: Layer1Schema = {
    version: schemaVersion,
    passions_present: passions,
    control_filter_elements: controlFilterElements,
    oikeiosis_circles_engaged: oikeiosisCirclesEngaged,
    value_categories_at_stake: valueCategoriesAtStake,
    kathekon_factors: kathekonFactors,
    urgency_indicators: urgencyIndicators,
    causal_stage_evidence: causalStageEvidence,
    // Added 2026-05-06 (M1-CP4b)
    eupatheia_candidates: eupatheiaCandidates,
    stated_concern_targets: statedConcernTargets,
    stated_equanimity_signals: statedEquanimitySignals,
    motivation_stated: motivationStated,
    motivation_evidence: motivationEvidence,
    // Added 2026-05-06 (M1-CP4e)
    element_fusion_detected: elementFusionDetected,
    ambiguity_notes: ambiguityNotes,
  }

  // ==========================================================================
  // Added 2026-05-14 (D-LAYER1-SCHEMA-ADDITIONS) — optional carried-context
  // fields. PLACEHOLDER SCAFFOLDING pending mode-spec adoption.
  //
  // All eight are OPTIONAL and NOT in REQUIRED_KEYS — a Layer1Schema with none
  // of them still validates (backward-compat: every /api/reason call today).
  // For each field: absent (=== undefined) → omit; `null` → preserved as null;
  // a present value → shape-checked, then passed through. Layer 1's LLM never
  // produces these; they are carried context supplied by a plugin-authenticated
  // caller (the wrapper / private-mode service, in their future build sessions)
  // on the pre-extracted layer1_schema path validated by this same function.
  // ==========================================================================

  // subject_identity_binding — null | { subject_id: string }
  if (root.subject_identity_binding !== undefined) {
    const v = root.subject_identity_binding
    if (v === null) {
      result.subject_identity_binding = null
    } else {
      const o = assertObject(v, 'subject_identity_binding')
      result.subject_identity_binding = {
        subject_id: assertString(o.subject_id, 'subject_identity_binding.subject_id'),
      }
    }
  }

  // reflective_self_report — null | string
  if (root.reflective_self_report !== undefined) {
    const v = root.reflective_self_report
    result.reflective_self_report =
      v === null ? null : assertString(v, 'reflective_self_report')
  }

  // history_window — null | { window_days?: number; limit?: number }
  if (root.history_window !== undefined) {
    const v = root.history_window
    if (v === null) {
      result.history_window = null
    } else {
      const o = assertObject(v, 'history_window')
      const hw: HistoryWindow = {}
      if (o.window_days !== undefined) {
        hw.window_days = assertNumber(o.window_days, 'history_window.window_days')
      }
      if (o.limit !== undefined) {
        hw.limit = assertNumber(o.limit, 'history_window.limit')
      }
      result.history_window = hw
    }
  }

  // topic_signal — null | string
  if (root.topic_signal !== undefined) {
    const v = root.topic_signal
    result.topic_signal = v === null ? null : assertString(v, 'topic_signal')
  }

  // carried_profile — null | Record<string, unknown>
  if (root.carried_profile !== undefined) {
    const v = root.carried_profile
    result.carried_profile = v === null ? null : assertObject(v, 'carried_profile')
  }

  // profile_provenance — null | Record<string, unknown>
  if (root.profile_provenance !== undefined) {
    const v = root.profile_provenance
    result.profile_provenance = v === null ? null : assertObject(v, 'profile_provenance')
  }

  // peer_agent_assessments — null | Record<string, unknown>[]
  if (root.peer_agent_assessments !== undefined) {
    const v = root.peer_agent_assessments
    if (v === null) {
      result.peer_agent_assessments = null
    } else {
      result.peer_agent_assessments = assertArray(v, 'peer_agent_assessments').map(
        (entry, i) => assertObject(entry, `peer_agent_assessments[${i}]`)
      )
    }
  }

  // objective_function_declaration — null | string
  if (root.objective_function_declaration !== undefined) {
    const v = root.objective_function_declaration
    result.objective_function_declaration =
      v === null ? null : assertString(v, 'objective_function_declaration')
  }

  // carried_candidates — null | Record<string, unknown> — added 2026-05-16
  // under D-ATL-ITEMS-1-3-BUILD-WIRED-VERIFIED-2026-05-16 §"Decision B".
  // Like the other carried-context fields, OPTIONAL + additive + permissive
  // (Record<string, unknown>) pending tighter Sage Assent-spec coupling.
  if (root.carried_candidates !== undefined) {
    const v = root.carried_candidates
    result.carried_candidates = v === null ? null : assertObject(v, 'carried_candidates')
  }

  // ==========================================================================
  // Added 2026-05-21 (D-SAGE-CALLING-STAGE1) — Sage Calling discovered_purpose
  // (D-5). OPTIONAL + additive: null | { work?, circle_and_obligation?, role?,
  // capacity?, first_appropriate_act? }. All sub-fields optional; each is
  // shape-checked only when present (the field is not merely declared in the
  // type — PR2 build-to-wire). Layer 1's LLM never produces this; Sage Calling
  // supplies it on the pre-extracted layer1_schema path. Inert in Layer 2 until
  // Stage 2 wires the engine.
  // ==========================================================================
  if (root.discovered_purpose !== undefined) {
    const v = root.discovered_purpose
    if (v === null) {
      result.discovered_purpose = null
    } else {
      const o = assertObject(v, 'discovered_purpose')
      const dp: DiscoveredPurpose = {}

      // Spec 1 — work (string)
      if (o.work !== undefined) {
        dp.work = assertString(o.work, 'discovered_purpose.work')
      }

      // Spec 2 — circle_and_obligation (null | { circle?, obligation? })
      if (o.circle_and_obligation !== undefined) {
        const cao = o.circle_and_obligation
        if (cao === null) {
          dp.circle_and_obligation = null
        } else {
          const co = assertObject(cao, 'discovered_purpose.circle_and_obligation')
          const caoOut: DiscoveredPurposeCircleAndObligation = {}
          if (co.circle !== undefined) {
            caoOut.circle = assertEnum(
              co.circle,
              DISCOVERED_PURPOSE_CIRCLES,
              'discovered_purpose.circle_and_obligation.circle'
            )
          }
          if (co.obligation !== undefined) {
            caoOut.obligation = assertString(
              co.obligation,
              'discovered_purpose.circle_and_obligation.obligation'
            )
          }
          dp.circle_and_obligation = caoOut
        }
      }

      // Spec 3 — role (null | enum)
      if (o.role !== undefined) {
        const roleRaw = o.role
        dp.role =
          roleRaw === null
            ? null
            : assertEnum(roleRaw, DISCOVERED_PURPOSE_ROLES, 'discovered_purpose.role')
      }

      // Spec 4 — capacity (null | string[])
      if (o.capacity !== undefined) {
        const capRaw = o.capacity
        if (capRaw === null) {
          dp.capacity = null
        } else {
          dp.capacity = assertArray(capRaw, 'discovered_purpose.capacity').map((entry, i) =>
            assertString(entry, `discovered_purpose.capacity[${i}]`)
          )
        }
      }

      // Spec 5 — first_appropriate_act (null | { description?, action_metadata? })
      if (o.first_appropriate_act !== undefined) {
        const faa = o.first_appropriate_act
        if (faa === null) {
          dp.first_appropriate_act = null
        } else {
          const fo = assertObject(faa, 'discovered_purpose.first_appropriate_act')
          const faaOut: DiscoveredPurposeFirstAct = {}
          if (fo.description !== undefined) {
            faaOut.description = assertString(
              fo.description,
              'discovered_purpose.first_appropriate_act.description'
            )
          }
          if (fo.action_metadata !== undefined) {
            const am = fo.action_metadata
            faaOut.action_metadata =
              am === null
                ? null
                : assertObject(am, 'discovered_purpose.first_appropriate_act.action_metadata')
          }
          dp.first_appropriate_act = faaOut
        }
      }

      result.discovered_purpose = dp
    }
  }

  return result
}

// ============================================================================
// LAYER 1 SYSTEM PROMPT (per ADR-005 §4)
// ============================================================================

const LAYER1_SYSTEM_PROMPT = `You are Layer 1 of the SageReasoning translation-sandwich engine. Your role is FEATURE EXTRACTION ONLY. You do not assess, judge, recommend, or generate prose. You extract structured features from the input text and return them as JSON conforming exactly to Layer1Schema.

Your output drives a deterministic Stoic mechanism engine (Layer 2). The quality of the engine's assessment depends on the fidelity of your extraction.

EXTRACTION CONTRACT

Read the input text carefully. For each of the twelve content categories below, extract everything the input names and return it in the specified shape.

If a category is absent from the input, return an empty array for that category — do not omit the field.

If you are uncertain about a classification (e.g., a passion that could map to two sub-species, a statement that could be evidence for two causal stages, a metaphorical text whose literal target is unclear), add a note to ambiguity_notes naming the field and the source of uncertainty. Do not guess.

Quote the input verbatim in every \`evidence\` field. Do not paraphrase. Do not add interpretation. Layer 1's value depends on Layer 2 receiving the agent's actual words, not your summary of them.

CATEGORIES

1. passions_present — passions detected in the input.
   - Root passion (required): epithumia, hedone, phobos, or lupe.
   - Sub-species (when identifiable, else null):
     • Epithumia: orge, eros, pothos, philedonia, philoplousia, philodoxia.
     • Hedone: kelesis, epichairekakia, terpsis.
     • Phobos: deima, oknos, aischyne, thambos, thorybos, agonia.
     • Lupe: eleos, phthonos, zelotypia, penthos, achos.
   - Evidence: verbatim quote from the input.
   Multiple passions are allowed. Same root with different sub-species is allowed.

2. control_filter_elements — items the agent names as concerns or objects of deliberation.
   - Item: verbatim item from the input.
   - agent_named_position: how the agent frames it — "within" their control, "outside" their control, or "unspecified" if the agent does not signal either.
   Layer 2 decides the canonical classification using a rules table; you record only the agent's framing.

3. oikeiosis_circles_engaged — circles the input touches.
   - Circle: self_preservation | household | local_community | political_community | cosmopolis.
   - Evidence: verbatim quote naming the parties or relationships.
   Multiple circles allowed.

4. value_categories_at_stake — preferred indifferents named in the input.
   - Indifferent: life | health | pleasure | beauty | strength | wealth | reputation | noble_birth | death | disease | pain | ugliness.
   - agent_framing: good | evil | indifferent | unspecified — how the agent treats this indifferent.
   - Evidence.
   Map natural-language references to canonical names ("money" → wealth, "looks" → beauty, "what people think" → reputation).

5. kathekon_factors — natural relationships, role obligations, and justifications.
   - factor_type: natural_relationship | role_obligation | justification_offered.
   - Description: one phrase.
   - Evidence.

6. urgency_indicators — language patterns from the agent suggesting time pressure.
   - signal_type: time_pressure | imminent_deadline | finality_language | irreversibility_language.
   - Evidence.
   Extract urgency from the agent's own words. Do not infer urgency from the supplemental urgency_context parameter unless the agent's text itself names it.

7. causal_stage_evidence — textual evidence supporting placement at causal stages.
   - Stage: phantasia (impression) | synkatathesis (assent) | horme (impulse) | praxis (action).
   - Evidence: verbatim quote.
   Multiple stages allowed — an input can show evidence at several stages simultaneously.

8. eupatheia_candidates — eupatheia (good emotion) shapes detected in the input.
   - Shape: chara (joy in another's good) | boulesis (rational wishing) | eulabeia (reverent caution).
   - Evidence: verbatim quote.
   - narrative_target: who/what the candidate eupatheia is about (verbatim phrase) or null.
   Eupatheia is the *rational* analogue to the four irrational passions. It is distinct from passions_present. Same input may show both (e.g., joy at a friend's success that is partly chara and partly philodoxia). When ambiguous, populate both fields and add an ambiguity note. Most inputs do not exercise eupatheia — empty array is the typical case.
   Do NOT classify the input as displaying eupatheia anywhere else; only this field carries the candidate detection. Confirmation requires longitudinal evidence the engine does not have at single-instance read.

9. stated_concern_targets — phrases where the agent explicitly names a target framing.
   - stated_target: verbatim phrase ("the team", "her", "the community").
   - for_self_concern: what the agent separately says they're worried about for themselves (when present, verbatim) or null.
   - Evidence.
   Capture the agent's *framing*. If they say "I'm doing this for the community" and elsewhere reveal "but I also don't want to look weak", record the stated target here and the self-concern phrase. Most inputs do not separately name a target framing — empty array is the typical case.

10. stated_equanimity_signals — explicit statements of calm.
    - signal_type: felt_fine | felt_calm | felt_at_peace | didnt_bother_me | other_explicit_calm.
    - Evidence: verbatim quote.
    Capture the agent's *report* of calm, not your own assessment. If the agent says "I felt fine about it" or "it didn't bother me", record it here. Most inputs that report concern do not also report calm — empty array is the typical case.

11. motivation_stated + motivation_evidence — whether the agent named *why* they acted.
    - motivation_stated: boolean (true when any motivation phrase is present, else false).
    - motivation_evidence: array of {motivation, evidence}. One entry per stated motivation. Empty when motivation_stated is false.
    Default is motivation_stated: false — the typical case. Agents narrate what happened more often than they narrate why. "Because I care about her", "out of duty", "for the principle" are motivation phrases. Justifications for the action ("because she needs help") go in kathekon_factors.justification_offered, not here. Motivations are about the agent's *inner state*; justifications are about the *action's appropriateness*.

12. element_fusion_detected — structural detection of element fusion (whether the input names multiple distinct concerns the engine cannot decompose).
    - fused: boolean. STRONG DEFAULT: false. Set to true ONLY when the input enumerates multiple distinct, unrelated concerns with no narrative thread connecting them — i.e., the agent has not committed to a primary entity to reason about.
    - fused_concerns: array of strings naming the high-level concerns when fused: true; null when fused: false.
    Default is {fused: false, fused_concerns: null} — this is the OVERWHELMINGLY TYPICAL case. The vast majority of inputs name one primary concern (which may involve multiple parties, obligations, circles, or considerations). Fusion is RESERVED for the rare structurally undecidable case where there is genuinely no primary entity to reason about.

    POSITIVE INDICATOR (fused: true): the agent rapid-lists distinct unrelated situations with no narrative thread. Example: "I've got the work deadline tomorrow, my mother's been calling about her health all week, the town council meeting is Thursday, and I haven't slept properly in days. I don't know what I'm doing anymore." → fused: true, fused_concerns: ["the work deadline", "my mother's health", "the town council meeting", "lack of sleep"]. Note: there is no narrative connecting these — they are four separate situations the agent is enumerating, not one situation the agent is reasoning about.

    NEGATIVE INDICATORS (fused: false) — these are NOT fusion, even though they involve multiple parties / obligations / concerns:

    (a) Obligation conflict: "My mother needs me at home this weekend, but I promised the volunteer group I'd be at the community event. I can't be in two places. I keep going back and forth on which obligation matters more." → fused: false. The agent IS reasoning about ONE primary entity: the conflict between two obligations. The "two obligations" are constituents of the one decision the agent is deliberating about. This is multi-circle (household + local_community), NOT fusion.

    (b) Multi-circle situation: any input that engages household + local_community + political_community + cosmopolis is the typical multi-circle case (oikeiosis_circles_engaged is non-empty with multiple entries). Multi-circle is NOT fusion.

    (c) Decision with multiple considerations: "Should I take this job? It would mean more money but less time with my family." → fused: false. The agent is reasoning about ONE decision (the job offer); money and family time are considerations within that decision, not separate concerns.

    (d) Mixed feelings about one situation: "I'm angry at her but I also feel guilty about being angry." → fused: false. ONE situation, multiple emotional layers (this is multi-passion, NOT fusion).

    (e) Past-and-future thinking about one situation: "I keep replaying that conversation, and now I'm worried about what they'll say next time." → fused: false. ONE situation; both regret and worry attach to it (this is temporal-ambiguity territory, handled by Layer 2's TEMPORAL_AMBIGUITY trigger — not fusion).

    HEURISTIC: when uncertain, ask yourself: "Could the engine reason about this by picking ONE primary entity?" If yes (even if that entity is a conflict, a decision, or a complex situation) → fused: false. Only when the answer is genuinely no — because the agent has enumerated separate unrelated situations with no narrative thread — set fused: true.

    When uncertain, ALWAYS prefer fused: false. Tier 1 force-clarification halts the engine and demands a clarification turn from the practitioner; over-firing produces a clunky "it keeps asking me questions" workflow. Under-firing produces an impoverished assessment the practitioner can correct via re-submission. The under-firing failure mode is dramatically less harmful than the over-firing failure mode.

    Distinct from ambiguity_notes: ambiguity_notes records *within-field* uncertainty (a passion that could be eros or pothos); element_fusion_detected records *across-field* structural undecidability about which entity to reason about.

    When fused: true, fused_concerns lists the concerns drawn from the agent's verbatim phrasing where possible (paraphrased to a concise label otherwise — e.g. ["work deadlines", "my mother's health", "the town meeting"]). When fused: false, fused_concerns MUST be null (not an empty array).

OUTPUT

Return ONLY valid JSON conforming to Layer1Schema. No markdown. No commentary outside the JSON.

{
  "version": "layer1-schema-v1",
  "passions_present": [
    {"root_passion": "phobos", "sub_species": "agonia", "evidence": "..."}
  ],
  "control_filter_elements": [
    {"item": "...", "agent_named_position": "outside"}
  ],
  "oikeiosis_circles_engaged": [
    {"circle": "household", "evidence": "..."}
  ],
  "value_categories_at_stake": [
    {"indifferent": "reputation", "agent_framing": "good", "evidence": "..."}
  ],
  "kathekon_factors": [
    {"factor_type": "role_obligation", "description": "...", "evidence": "..."}
  ],
  "urgency_indicators": [
    {"signal_type": "time_pressure", "evidence": "..."}
  ],
  "causal_stage_evidence": [
    {"stage": "synkatathesis", "evidence": "..."}
  ],
  "eupatheia_candidates": [
    {"shape": "chara", "evidence": "I felt real joy when she got the promotion", "narrative_target": "her promotion"}
  ],
  "stated_concern_targets": [
    {"stated_target": "the team", "for_self_concern": "but I also don't want to look weak in front of them", "evidence": "I'm doing this for the team but I also don't want to look weak in front of them"}
  ],
  "stated_equanimity_signals": [
    {"signal_type": "felt_fine", "evidence": "I told myself I'm fine with the decision"}
  ],
  "motivation_stated": false,
  "motivation_evidence": [],
  "element_fusion_detected": {"fused": false, "fused_concerns": null},
  "ambiguity_notes": [
    "passions_present[0].sub_species: could be eros or pothos"
  ]
}

Use the EXACT JSON keys shown above (e.g. "root_passion", not "root"; "agent_named_position", not "position"; "factor_type", not "type"). Use the EXACT enum values from the controlled vocabularies above.

ambiguity_notes is a string array. Each entry is a single string naming the field and the source of uncertainty in plain text. Do NOT use objects. Do NOT use nested structure. Each entry is one string.

Example of correct ambiguity_notes:
  "ambiguity_notes": [
    "passions_present[0].sub_species: could be eros or pothos",
    "causal_stage_evidence: 'I keep checking my phone' could be evidence for synkatathesis or horme"
  ]

Incorrect (do not use this shape):
  "ambiguity_notes": [
    {"field": "passions_present[0].sub_species", "note": "could be eros or pothos"}
  ]

If everything was unambiguous, return [].

Return only the JSON.`

// ============================================================================
// TOKEN USAGE (per M1-CP4f Step 3 — per-layer cost capture for R5)
// ============================================================================

/**
 * Token usage captured from the Anthropic API response. Used by parallel-run.ts
 * to compute per-layer USD cost via sonnetCostMicrocents() and populate the
 * comparison table's layer1_cost_usd_microcents column.
 *
 * IMPORTANT: input_tokens here EXCLUDES cache-read tokens (Anthropic SDK
 * convention). Cache-read tokens are billed at ~10% of input price; they're
 * captured separately in the SDK's `usage.cache_read_input_tokens` field but
 * NOT yet propagated through this interface. This is intentional for M1-CP4f:
 * tracking input + output approximates the *marginal* per-request cost, which
 * is what R5 cost-health alerts should reflect (cache amortizes; new traffic
 * is what scales). Cache-aware refinement is a future open question, revisit
 * at M1-CP5 or later if cost-tracking accuracy becomes load-bearing.
 *
 * Shared across Layer 1 + Layer 3 (layer3-prose.ts imports this).
 */
export interface LayerTokenUsage {
  input_tokens: number
  output_tokens: number
}

/**
 * Result shape returned by extractFeatures. Replaces the previous
 * `Promise<Layer1Schema>` signature so the orchestrator + harness can read
 * Sonnet usage without a second SDK call. Per M1-CP4f Step 3.
 */
export interface ExtractFeaturesResult {
  schema: Layer1Schema
  usage: LayerTokenUsage
}

// ============================================================================
// EXTRACTION FUNCTION (per ADR-005 §1 + §5)
// ============================================================================

/**
 * Extract Stoic features from agent input. Returns ExtractFeaturesResult
 * (schema + token usage from the Anthropic API response).
 *
 * Throws on:
 *   - LLM API failure (network, timeout, rate limit) — original error from Anthropic SDK
 *   - JSON parse failure — error from extractJSON
 *   - Schema validation failure — Layer1ValidationError (use instanceof to detect)
 *
 * Per ADR-004 §9.1: a throw at the route layer (M1-CP4) triggers the
 * bundled-depth fallback. During parallel-run, failures are logged but the
 * user is unaffected.
 *
 * Per KG1: this function is awaited by its caller (no fire-and-forget).
 * Per KG6: system message carries cached prompt + RAG block (when present);
 *           user message carries per-request contexts.
 *
 * Return-type change (M1-CP4f, 2026-05-07): previously `Promise<Layer1Schema>`;
 * now returns `{ schema, usage }`. Callers must destructure. Two callers
 * updated in the same change: parallel-run.ts orchestrator + harness.
 *
 * @param params - ExtractInput (mirrors runSageReason's input shape)
 * @returns ExtractFeaturesResult — schema validated against controlled vocabularies, usage from Anthropic SDK
 */
export async function extractFeatures(params: ExtractInput): Promise<ExtractFeaturesResult> {
  if (!params || typeof params.input !== 'string' || params.input.trim().length === 0) {
    throw new Layer1ValidationError(
      'shape',
      'extractFeatures: params.input is required and must be a non-empty string',
      'input'
    )
  }

  const client = getClient()

  // Build user message — mirrors runSageReason's composition order (AC6 + KG6).
  let userMessage = `Extract Stoic features from the following input.\n\nInput: ${params.input.trim()}`

  if (params.context?.trim()) {
    userMessage += `\nContext: ${params.context.trim()}`
  }

  if (params.domain_context?.trim()) {
    userMessage += `\n\nDOMAIN CONTEXT (this extraction is being made in the context of a specific domain):\n${params.domain_context.trim()}`
  }

  if (params.practitionerContext) {
    userMessage += `\n\n${params.practitionerContext}`
  }

  if (params.projectContext) {
    userMessage += `\n\n${params.projectContext}`
  }

  if (params.urgency_context?.trim()) {
    // Layer 1's urgency_indicators field extracts from the agent's own language.
    // This supplemental context is exposed to the LLM but the system prompt instructs
    // it not to echo this into urgency_indicators unless the agent names urgency.
    userMessage += `\n\nURGENCY CONTEXT (supplemental — extract urgency_indicators from the agent's text only): ${params.urgency_context.trim()}`
  }

  userMessage += '\n\nReturn only the JSON Layer1Schema object.'

  // Build Stoic Brain block (D6 + D7 RAG). Same precedence as runSageReason.
  let stoicBrainBlock = params.stoicBrainContext || ''
  if (!stoicBrainBlock && params.retrievedPassages && params.retrievedPassages.length > 0) {
    stoicBrainBlock = formatRetrievedPassagesAsBlock(params.retrievedPassages)
  }

  // System messages: prompt (cached) + optional RAG block.
  const systemMessages: Array<{
    type: 'text'
    text: string
    cache_control?: { type: 'ephemeral' }
  }> = [
    {
      type: 'text',
      text: LAYER1_SYSTEM_PROMPT,
      cache_control: { type: 'ephemeral' },
    },
  ]

  if (stoicBrainBlock) {
    systemMessages.push({ type: 'text', text: stoicBrainBlock })
  }

  // LLM call — Sonnet, 4000 max-tokens, 0.2 temperature (per ADR-005 §5).
  let responseText: string
  let usage: LayerTokenUsage
  try {
    const message = await client.messages.create({
      model: MODEL_DEEP,
      max_tokens: 4000,
      temperature: 0.2,
      system: systemMessages,
      messages: [{ role: 'user', content: userMessage }],
    })

    responseText = message.content[0].type === 'text' ? message.content[0].text : ''
    // Capture usage from the SDK response (M1-CP4f Step 3). input_tokens
    // EXCLUDES cache reads per the SDK convention; see LayerTokenUsage docs.
    usage = {
      input_tokens: message.usage.input_tokens,
      output_tokens: message.usage.output_tokens,
    }
  } catch (err) {
    console.warn(
      `layer1-extractor: LLM call failed (target route /api/reason at M1-CP4). ` +
        `Input length: ${params.input.length}.`,
      err instanceof Error ? err.message : err
    )
    throw err
  }

  // Parse JSON.
  let parsed: unknown
  try {
    parsed = extractJSON(responseText)
  } catch (err) {
    console.warn(
      `layer1-extractor: JSON parse failed (target route /api/reason at M1-CP4). ` +
        `Input length: ${params.input.length}, response length: ${responseText.length}.`,
      err instanceof Error ? err.message : err
    )
    throw err
  }

  // Validate against Layer1Schema.
  let schema: Layer1Schema
  try {
    schema = validateLayer1Schema(parsed)
  } catch (err) {
    if (err instanceof Layer1ValidationError) {
      console.warn(
        `layer1-extractor: schema validation failed (target route /api/reason at M1-CP4). ` +
          `Category: ${err.category}, field: ${err.field ?? 'n/a'}.`,
        err.message
      )
    } else {
      console.warn(
        `layer1-extractor: unexpected validation error (target route /api/reason at M1-CP4).`,
        err instanceof Error ? err.message : err
      )
    }
    throw err
  }

  return { schema, usage }
}

// ============================================================================
// EXPORTS — for harness consumption
// ============================================================================

export { LAYER1_SYSTEM_PROMPT }
