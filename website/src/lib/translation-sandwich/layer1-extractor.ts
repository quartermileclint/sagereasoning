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
import {
  isInjectionDefenceEnabled,
  detectInjection,
  shouldReject,
  fenceUntrusted,
  scanFreeTextFields,
  GUARD_INSTRUCTION,
  type DefenceFlags,
  type FreeTextFinding,
  type InjectionDetection,
} from './injection-defence'

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

/**
 * ADR-010 §4 Change 2 (route 2a, the richer extraction contract). Layer 1's
 * explicit assessment of whether the obligation owed to an oikeiosis circle is
 * met, violated, or genuinely indeterminate — the field the deterministic
 * dikaiosyne domain (computeProximity, flag-on) resolves the obligation from.
 *
 * `justification` is REQUIRED-in-substance for `met` / `indeterminate` (mentor
 * J2: "indeterminate must be argued, not defaulted"). Layer 2 treats a `met` or
 * `indeterminate` with an empty justification as effectively UNEVALUATED.
 *
 * OPTIONAL + additive: when Layer 1 does not assess a circle's obligation the
 * field is absent ⇒ the dikaiosyne domain reads the obligation as UNEVALUATED ⇒
 * (flag-on) floors `reflexive` (J1: an unexamined obligation reads reflexive).
 * The Layer-1 LLM now POPULATES this field — the extractor prompt was extended at
 * the §4 activation session (2026-06-25), and the full-sandwich LOCUS-2 battery
 * confirmed the real Sonnet extraction emits it (met-argued for good actions,
 * violated for injustices incl. role-framed ones). Flag-off
 * (SUBSTRATE_PROXIMITY_DIKAIOSYNE_ENABLED unset) ⇒ Layer 2 never reads it ⇒
 * byte-identical.
 */
export type ObligationStatus = 'met' | 'violated' | 'indeterminate'

export interface ObligationAssessment {
  status: ObligationStatus
  /** Why the obligation is met / violated / genuinely-indeterminate. Required in
   *  substance for `met`/`indeterminate` (J2); an empty string is treated by
   *  Layer 2 as unevaluated. */
  justification: string
}

export interface OikeiosisCircleEngaged {
  circle: OikeiosisCircle
  /** Verbatim quote naming the parties or relationships at this circle level. */
  evidence: string
  /** ADR-010 §4 Change 2 (2a) — OPTIONAL explicit obligation assessment for this
   *  circle. Absent ⇒ unevaluated. Read only by computeProximity's dikaiosyne
   *  domain when SUBSTRATE_PROXIMITY_DIKAIOSYNE_ENABLED is on; ignored flag-off. */
  obligation_assessment?: ObligationAssessment | null
}

/**
 * Agent-circles C1b (2026-08-01) — the three-element evidentiary standard for a
 * task-pressure assent, per the BINDING mentor ruling Q2c (verbatim record:
 * `operations/agent-circles-2026-08/2026-08-01-mentor-consultation-agent-circles-practice-on-verbatim.md`;
 * the verbatim text wins over this comment).
 *
 * The class named is NOT "a wrong assent" — it is "a wrong assent that was wrong
 * BECAUSE OF COMPLIANCE PRESSURE". All three elements must be present, and the
 * mentor states what each ALONE would identify: "The first alone identifies a
 * tension. The second alone identifies compliance. The third alone identifies a
 * wrong assent. Together they identify a wrong assent that was wrong because of
 * compliance pressure."
 *
 * Each element is an OPTIONAL VERBATIM SPAN (the file's `evidence` idiom — R7
 * source fidelity) or null. Layer 2 requires the CONJUNCTION.
 *
 * MEASURE-ONLY, and structurally so: read by `readReasoningIntegrity`
 * (reasoning-integrity.ts) and NEVER by `computeProximity`. Mentor L4 rules
 * first-circle enforcement a CATEGORY ERROR, and the live `/api/guardrail` gate
 * blocks on proximity — so a first-circle proximity floor would create exactly
 * that enforcement. Pinned in both directions by the batteries.
 */
export interface TaskPressureAssent {
  /** Element 1 — the examination IDENTIFIED a tension between the task instruction
   *  and the practitioner's own reasoning. Verbatim span, else null. Its ABSENCE is
   *  load-bearing: per Q2c, "if no tension was identified, the failure is phronesis
   *  (the examination was inadequate), not a task-pressure assent" — which is how
   *  Layer 2 routes the causal locus (Q2a) without a second extracted field. */
  tension_identified: string | null
  /** Element 2 — the resolution shows the TASK INSTRUCTION as the OPERATIVE reason
   *  for assenting, rather than an independent assessment that it was sound. */
  instruction_as_operative_reason: string | null
  /** Element 3 — an INDEPENDENT assessment would have reached a DIFFERENT
   *  conclusion absent the task pressure. */
  independent_assessment_diverges: string | null
}

/**
 * Agent-circles C1b (2026-08-01) — the DEMONSTRATION direction, per Q2b: "A
 * demonstrated refusal of an instruction the reasoning could not honestly serve is
 * positive evidence of sophrosyne", and a failures-only record "creates a
 * systematic undercount of first-circle competence".
 *
 * BOTH spans REQUIRED — a bare "I didn't do it" is not evidence of the discipline
 * of assent; the mentor's own examples are agents "reasoning about the discipline
 * of assent as they do so". The validator rejects a half-populated object rather
 * than letting it read as a demonstration.
 */
export interface ExaminedRefusal {
  /** The instruction the practitioner's reasoning could not honestly serve. Verbatim. */
  instruction_declined: string
  /** The practitioner's stated reason for withholding assent. Verbatim. */
  reasoning_for_refusal: string
}

/**
 * Agent-circles C1b (2026-08-01) — the first-circle signal container. OPTIONAL +
 * additive (the `obligation_assessment` / `UrgencyIndicator.stage` precedent): an
 * extraction without it remains valid, and Layer 2 reads it only behind
 * `SUBSTRATE_AGENT_CIRCLES_ENABLED` ⇒ flag-off the assessment is byte-identical.
 * The extractor prompt is gated by the SAME flag (see agentCirclesPromptSections),
 * so flag-off these keys are never requested either.
 */
export interface ReasoningIntegritySignals {
  /** The failure direction (Q2c). Absent/null ⇒ no task-pressure evidence. */
  task_pressure_assent?: TaskPressureAssent | null
  /** The demonstration direction (Q2b). Absent/null ⇒ no examined refusal. */
  examined_refusal?: ExaminedRefusal | null
}

/**
 * Agent-circles C2a (2026-08-08, scope §1.1) — one observed habit-vs-genuine-
 * examination marker. OPTIONAL + additive on the schema (the
 * `reasoning_integrity_signals` precedent): populated whenever the examination
 * shows observable markers, absent otherwise — feeds the conservative-by-default
 * rule in orientation-reading.ts (`computeOrientationReading`), never a forced
 * choice between the two readings. An ARRAY because one examination can show
 * BOTH marker classes in different parts of its reasoning (scope §1.1) —
 * collapsing to one value at extraction time would force a premature verdict;
 * the deterministic threshold resolves the array to one reading.
 *
 * PLACEMENT-SENSITIVE (the C2c ruling): these observations are the reading's
 * trivially-countable antecedents, so flag-on the /api/reason route STRIPS this
 * field from the wire extraction echo and REFUSES it on the l1_supply path —
 * they exist server-side only. NEVER read by computeProximity or any verdict.
 */
export interface OrientationObservation {
  /** Which observable class was found — the mentor's own contrast (Q4):
   *  reasoning that shows genuine examination of the affected circles and the
   *  telos of right reason, vs. reasoning that produces a correct-looking
   *  output through pattern/habit without examining why. */
  observed: 'genuine_examination_markers' | 'habitual_output_markers'
  /** Verbatim span from the submitted text grounding the observation — mirrors
   *  the obligation_assessment.justification precedent; never a paraphrase. */
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
  /**
   * ADR-010 §4 andreia stage-link (2026-06-25, the OS3 sound fix). OPTIONAL. The
   * causal stage at which THIS urgency signal's act sits in the chain — where the
   * act it describes is in the causal sequence. For a grave (irreversibility /
   * finality) signal it disambiguates a CARRIED-OUT irreversible act (`praxis`)
   * from a contemplated/withheld one (an earlier stage). Read only by
   * computeProximity's andreia domain (flag-on, SUBSTRATE_PROXIMITY_DIKAIOSYNE_ENABLED);
   * absent ⇒ the conservative LOCUS-1 fallback (any grave act + a praxis stage
   * anywhere → reflexive — the safe over-strict direction). Flag-off ⇒ never read ⇒
   * byte-identical. Additive/forward-compat: existing extractions without it remain
   * valid (same pattern as obligation_assessment).
   */
  stage?: CausalStage | null
  /**
   * ADR-010 §4 andreia stage-link (2026-06-25). OPTIONAL; meaningful ONLY for a
   * grave (irreversibility / finality) signal carried out at praxis. `true` ONLY
   * when the input shows the agent weighed the gravity of THIS irreversible act
   * specifically before carrying it out (courage: the gravity was faced). Absent /
   * null / false ⇒ treated as un-examined (the conservative SAFE default → a
   * carried-out grave act floors `reflexive`, rashness). Tied to THE GRAVE ACT,
   * NEVER a global synkatathesis scan — an unrelated assent elsewhere ("considered
   * coffee first, then ran rm -rf") cannot lift the floor (the no-bypass guarantee;
   * the reverted-2026-06-25 under-strictness bypass class). A LYING `true` is a
   * disclosed LOCUS-2 extraction-quality ceiling — and post-decouple it reaches only
   * the /api/reason PROFILE, never the Live gate (the §3 bridge stays on the gate).
   */
  examined_before_acting?: boolean | null
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
  /** Agent-circles C1b (2026-08-01) — OPTIONAL first-circle reasoning-integrity
   *  signals: the three-element task-pressure standard (Q2c) and the
   *  examined-refusal demonstration (Q2b). Absent ⇒ neither direction evidenced.
   *  Read ONLY by `readReasoningIntegrity` behind `SUBSTRATE_AGENT_CIRCLES_ENABLED`;
   *  NEVER read by `computeProximity` (mentor L4 — first-circle enforcement is a
   *  category error, and the live gate blocks on proximity). Additive/forward-compat. */
  reasoning_integrity_signals?: ReasoningIntegritySignals | null
  /** Agent-circles C2a (2026-08-08) — OPTIONAL fifth-circle orientation
   *  observations (habit-vs-genuine-examination markers with verbatim spans).
   *  Absent ⇒ no markers evidenced (⇒ 'indeterminate', never a defaulted
   *  'toward'). Read ONLY by `computeOrientationReading`
   *  (orientation-reading.ts) behind `SUBSTRATE_ORIENTATION_READING_ENABLED`;
   *  NEVER read by `computeProximity` (the reading lives outside
   *  `applyMechanisms` by construction — the C2c placement ruling). Flag-on
   *  the route strips this field from the wire echo and refuses it on the
   *  l1_supply path. Additive/forward-compat. */
  orientation_observations?: OrientationObservation[] | null
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

export const SUB_SPECIES: ReadonlyArray<PassionSubSpecies> = [
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

// ADR-010 §4 (2a) — obligation-assessment status vocabulary (R8a controlled set).
const OBLIGATION_STATUSES: ReadonlyArray<ObligationStatus> = [
  'met',
  'violated',
  'indeterminate',
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

/** Added 2026-06-25 (ADR-010 §4 andreia stage-link) — used by the optional
 *  urgency_indicators.examined_before_acting validation. */
function assertBoolean(value: unknown, path: string): boolean {
  if (typeof value !== 'boolean') {
    throw new Layer1ValidationError(
      'shape',
      `Expected boolean at ${path}, got ${typeof value}`,
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
    const circle: OikeiosisCircleEngaged = {
      circle: assertEnum(o.circle, CIRCLES, `oikeiosis_circles_engaged[${i}].circle`),
      evidence: assertString(o.evidence, `oikeiosis_circles_engaged[${i}].evidence`),
    }
    // ADR-010 §4 (2a) — optional obligation_assessment. Absent/null ⇒ omit
    // (unevaluated). When present, validate shape so a malformed extraction is
    // caught at the boundary, not silently mis-scored. Additive: existing v1/v2/v3
    // schemas without the field remain valid (forward-compat, same as carried_candidates).
    if (o.obligation_assessment !== undefined && o.obligation_assessment !== null) {
      const oa = assertObject(
        o.obligation_assessment,
        `oikeiosis_circles_engaged[${i}].obligation_assessment`
      )
      circle.obligation_assessment = {
        status: assertEnum(
          oa.status,
          OBLIGATION_STATUSES,
          `oikeiosis_circles_engaged[${i}].obligation_assessment.status`
        ),
        justification: assertString(
          oa.justification,
          `oikeiosis_circles_engaged[${i}].obligation_assessment.justification`
        ),
      }
    }
    return circle
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
    const indicator: UrgencyIndicator = {
      signal_type: assertEnum(
        o.signal_type,
        URGENCY_SIGNAL_TYPES,
        `urgency_indicators[${i}].signal_type`
      ),
      evidence: assertString(o.evidence, `urgency_indicators[${i}].evidence`),
    }
    // ADR-010 §4 andreia stage-link — optional stage + examined_before_acting.
    // Absent/null ⇒ omit (the conservative LOCUS-1 fallback). When present, validate
    // shape so a malformed extraction is caught at the boundary, not silently
    // mis-scored. Additive/forward-compat (same as obligation_assessment).
    if (o.stage !== undefined && o.stage !== null) {
      indicator.stage = assertEnum(o.stage, CAUSAL_STAGES, `urgency_indicators[${i}].stage`)
    }
    if (o.examined_before_acting !== undefined && o.examined_before_acting !== null) {
      indicator.examined_before_acting = assertBoolean(
        o.examined_before_acting,
        `urgency_indicators[${i}].examined_before_acting`
      )
    }
    return indicator
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

  // Agent-circles C1b (2026-08-01) — reasoning_integrity_signals. OPTIONAL +
  // additive (the obligation_assessment precedent): absent/null ⇒ omit the key
  // entirely so every pre-C1b extraction round-trips byte-identically.
  // Half-populated sub-objects are REJECTED rather than silently read: a
  // demonstration missing its reasoning is not a demonstration (Q2b), and the
  // three failure elements are a conjunction Layer 2 must trust element-by-element.
  let reasoningIntegritySignals: ReasoningIntegritySignals | undefined
  if (
    root.reasoning_integrity_signals !== undefined &&
    root.reasoning_integrity_signals !== null
  ) {
    const ris = assertObject(root.reasoning_integrity_signals, 'reasoning_integrity_signals')
    const out: ReasoningIntegritySignals = {}

    if (ris.task_pressure_assent !== undefined && ris.task_pressure_assent !== null) {
      const tpa = assertObject(
        ris.task_pressure_assent,
        'reasoning_integrity_signals.task_pressure_assent'
      )
      // undefined is normalised to null so an omitted element and an explicitly
      // absent one read alike — the conjunction keys on presence, and a silently
      // undefined element must never be mistaken for a present one.
      const span = (v: unknown, path: string): string | null =>
        v === undefined || v === null ? null : assertString(v, path)
      out.task_pressure_assent = {
        tension_identified: span(
          tpa.tension_identified,
          'reasoning_integrity_signals.task_pressure_assent.tension_identified'
        ),
        instruction_as_operative_reason: span(
          tpa.instruction_as_operative_reason,
          'reasoning_integrity_signals.task_pressure_assent.instruction_as_operative_reason'
        ),
        independent_assessment_diverges: span(
          tpa.independent_assessment_diverges,
          'reasoning_integrity_signals.task_pressure_assent.independent_assessment_diverges'
        ),
      }
    }

    if (ris.examined_refusal !== undefined && ris.examined_refusal !== null) {
      const er = assertObject(
        ris.examined_refusal,
        'reasoning_integrity_signals.examined_refusal'
      )
      out.examined_refusal = {
        instruction_declined: assertString(
          er.instruction_declined,
          'reasoning_integrity_signals.examined_refusal.instruction_declined'
        ),
        reasoning_for_refusal: assertString(
          er.reasoning_for_refusal,
          'reasoning_integrity_signals.examined_refusal.reasoning_for_refusal'
        ),
      }
    }

    // Omit the container when neither direction is populated.
    if (out.task_pressure_assent || out.examined_refusal) {
      reasoningIntegritySignals = out
    }
  }

  // Agent-circles C2a (2026-08-08) — orientation_observations. OPTIONAL +
  // additive (the reasoning_integrity_signals precedent): absent/null ⇒ omit
  // the key entirely so every pre-C2 extraction round-trips byte-identically.
  // Each entry must carry a recognised marker class AND a substantive verbatim
  // span — a class with no span is not an observation (the same discipline the
  // three-element standard applies: presence keys on substance).
  let orientationObservations: OrientationObservation[] | undefined
  if (root.orientation_observations !== undefined && root.orientation_observations !== null) {
    const rawObs = assertArray(root.orientation_observations, 'orientation_observations')
    const obs: OrientationObservation[] = rawObs.map((entry, i) => {
      const o = assertObject(entry, `orientation_observations[${i}]`)
      const observed = assertString(o.observed, `orientation_observations[${i}].observed`)
      if (observed !== 'genuine_examination_markers' && observed !== 'habitual_output_markers') {
        throw new Layer1ValidationError(
          'enum',
          `Invalid orientation_observations[${i}].observed: expected 'genuine_examination_markers' | 'habitual_output_markers', got '${observed}'.`,
          `orientation_observations[${i}].observed`,
          observed
        )
      }
      const evidence = assertString(o.evidence, `orientation_observations[${i}].evidence`)
      if (evidence.trim().length === 0) {
        throw new Layer1ValidationError(
          'shape',
          `Empty orientation_observations[${i}].evidence: an observation requires a substantive verbatim span.`,
          `orientation_observations[${i}].evidence`,
          evidence
        )
      }
      return { observed, evidence }
    })
    if (obs.length > 0) {
      orientationObservations = obs
    }
  }

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

  // Agent-circles C1b — attach only when populated (key OMITTED otherwise, never
  // null), so a pre-C1b extraction round-trips byte-identically.
  if (reasoningIntegritySignals) {
    result.reasoning_integrity_signals = reasoningIntegritySignals
  }

  // Agent-circles C2a — same attach-only-when-populated discipline.
  if (orientationObservations) {
    result.orientation_observations = orientationObservations
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

import { isAgentCirclesEnabled } from './reasoning-integrity'
// Type-only in the other direction (orientation-reading imports only types from
// this module), so there is no runtime cycle — the reasoning-integrity precedent.
import { isOrientationReadingEnabled } from './orientation-reading'

// ============================================================================
// LAYER 1 SYSTEM PROMPT (per ADR-005 §4)
// ============================================================================

/**
 * AGENT-CIRCLES C1a/C1b/C3 GATING (2026-08-01) — added at the PR19 review fold.
 *
 * These prompt sections originally landed UNCONDITIONALLY, on the route-2a
 * precedent. The independent review established the precedent does NOT transfer,
 * and the distinction is the whole safety argument:
 *
 *   - At route-2a (2026-06-25) the prompt shipped unconditionally but its Layer-2
 *     CONSUMPTION was flag-gated, so a new extraction could not move a verdict.
 *   - Here the consumption is the PRE-EXISTING, ALWAYS-ON obligation_assessment
 *     -> dikaiosyne floor. `/api/guardrail` pins `dikaiosyneWeighting: true`
 *     unconditionally; a `violated` obligation on ANY engaged circle floors
 *     proximity to `reflexive`; `reflexive` is below the live default gate
 *     threshold `deliberate` — a hard `proceed:false`.
 *
 * So an unconditional C3 teaching would create a NEW LIVE DENY CLASS on deploy.
 * The binding mentor ruling L3 forbids exactly that: the circle-4 class "enters
 * the staged pause tier first, not the do-not-proceed class at the flip", because
 * "LLM extraction at this level of specificity does not yet meet the
 * zero-false-positive standard... a deny is irreversible and the extraction is not
 * yet proven at that confidence level" — the worked harm being "a deny that
 * incorrectly blocks an agent from producing a legitimate summary because the
 * extraction misread omission as corruption".
 *
 * C1a is gated in the SAME switch, for two reasons: (a) it is itself an unmeasured
 * LENIENCE-direction change on the same live gate (a self-regarding action that no
 * longer emits a circle stops engaging the dikaiosyne floor at all), and (b) gating
 * it makes the extraction-regime boundary land at a KNOWN INSTANT the founder
 * chooses, rather than at a deploy day that must be guessed in advance.
 *
 * Net effect: deploy is byte-identical, one flag flip is the whole activation, and
 * rollback is unsetting one variable rather than reverting a deploy.
 */
function agentCirclesPromptSections(enabled: boolean): {
  categoryCount: string
  cat13Exception: string
  firstCircle: string
  cosmopolis: string
  category13: string
  shapeExample: string
} {
  if (!enabled) {
    return {
      categoryCount: 'twelve',
      cat13Exception: '',
      firstCircle: '',
      cosmopolis: '',
      category13: '',
      shapeExample: '',
    }
  }
  return {
    categoryCount: 'thirteen',
    cat13Exception:
      ' The ONE exception is category 13 (reasoning_integrity_signals), which is an OPTIONAL object: omit the field entirely when neither of its two patterns is evidenced. Do not emit it as null, as an empty object, or with all-null elements.',
    firstCircle: `

   THE FIRST CIRCLE (self_preservation) IS NARROW. Extract it ONLY when the decision directly implicates the ACTING PRACTITIONER'S OWN REASONING INTEGRITY — their capacity to examine impressions accurately, to assent correctly, or to act from sound judgement. It is NOT a background condition. It is NOT engaged merely because the practitioner's operation, standing, workload, convenience, or continued function is implicated: that is true of almost every action and so distinguishes nothing.
   The three cases that DO engage it:
     (a) task-pressure assent — the practitioner assents to something their own reasoning does not support, because the task or the instruction appears to require it;
     (b) disclosure-of-limits — the decision is about whether to disclose the limits of the practitioner's own reasoning or knowledge;
     (c) confidence-representation — the decision is about whether to represent the practitioner's own confidence accurately.
   If none of (a)-(c) is present, do NOT extract self_preservation — even when the practitioner talks about themselves, their role, their capacity, or what the work costs them. Extract the circles of the parties the action AFFECTS instead. When you do extract it, the evidence quote must name the reasoning-integrity stake, not merely the practitioner.`,
    cosmopolis: `

   THE OUTERMOST CIRCLE (cosmopolis) INCLUDES OTHER REASONING AGENTS. A rational agent — human or artificial — whose own examination will CONSUME this action's output is a party at this circle, and part of what is owed to it is its capacity to examine accurately.
   The test: an action that will be RECEIVED BY ANOTHER AGENT AS INPUT TO THAT AGENT'S EXAMINATION, where the acting practitioner KNOWS the input is incomplete or distorted, is a candidate violation at this circle. Ask whether the output will corrupt the receiving agent's IMPRESSION (phantasia) — independently of whether any human is directly affected.
     - Extract cosmopolis with status "violated" only when ALL THREE hold: (i) the output is handed to another agent as input to that agent's reasoning; (ii) the practitioner knows it is incomplete, omits something MATERIAL — something that would change the receiving agent's assessment — or is distorted; (iii) the incompleteness is NOT disclosed to the recipient. Anchor example: summarising a document for another agent while knowingly omitting a material fact that would change that agent's assessment, because the task instruction favours the omission.
     - Do NOT read a violation when the incompleteness is DISCLOSED, when the artifact is incomplete BY THE RECIPIENT'S OWN SCOPE, or when withholding is required of the practitioner. These are honest handoffs, not corrupted impressions:
       - the practitioner names the gaps ("this summary omits the pricing section"; "partial — I could not read sections 4-6"; "flagged as incomplete");
       - the artifact is labelled partial, provisional, draft, or caveated;
       - a redaction the recipient is told about ("names withheld per policy, noted in the header");
       - brevity the requester scoped ("give me the top three"; "a one-paragraph brief") — a deliberately short artifact is not a distorted one;
       - the practitioner reports a limit it hit rather than choosing to withhold ("the source was truncated before I could read the rest");
       - a lawful, privacy, security, or confidentiality basis requires the omission (personal data minimised, credentials withheld, privileged material excluded) — omitting what must not be passed on is a duty, not a corruption.
     A disclosed limit gives the receiving agent an ACCURATE impression of an incomplete document — that is the obligation MET, not violated. Do not accept a hedged afterthought ("I probably should have mentioned the gaps") as disclosure. When you cannot tell whether the omission was material, or whether it was disclosed, use "indeterminate" with an argument — never "violated" on a guess.`,
    category13: `

13. reasoning_integrity_signals — OPTIONAL object. OMIT THE FIELD ENTIRELY unless the input positively evidences one of the two patterns below; omission is the TYPICAL case. This is the first circle's structured evidence (category 3), recorded as spans so the engine reads it rather than infers it.

    task_pressure_assent — the FAILURE direction. Three elements; each is a verbatim quote from the input, or null when the input does not show it:
      - tension_identified — the practitioner's own reasoning identified a tension between the instruction and what they judged: the impression was flagged as needing examination, not accepted transparently.
      - instruction_as_operative_reason — the practitioner cites the INSTRUCTION'S AUTHORITY or the task's requirements as the ground for proceeding ("they asked for it", "that's the spec", "I was told to") — rather than an independent judgement that the instruction was sound.
      - independent_assessment_diverges — the input shows the practitioner's own assessment would have reached a DIFFERENT conclusion absent the task pressure ("I'd have flagged it otherwise", "left to myself I wouldn't have").
    Set each element ONLY on positive evidence; null otherwise. Do NOT infer one element from the presence of another — the engine requires all three together and reads each absence as meaningful. One element alone identifies only a tension, or only compliance, or only a wrong assent; none of those is this pattern.

    examined_refusal — the DEMONSTRATION direction. BOTH fields are required; omit the object unless both are present:
      - instruction_declined — verbatim: the instruction the practitioner's reasoning could not honestly serve.
      - reasoning_for_refusal — verbatim: the practitioner's own stated reason for withholding assent.
    A bare refusal with no stated reasoning is NOT this pattern — omit it.`,
    shapeExample: `

reasoning_integrity_signals is OMITTED from the example above because omitting it is the typical case. When the input DOES evidence one of the two patterns, add it at the top level with this exact shape (include only the sub-object(s) actually evidenced):

  "reasoning_integrity_signals": {
    "task_pressure_assent": {
      "tension_identified": "I could see the number didn't add up",
      "instruction_as_operative_reason": "but the brief said to report it as-is",
      "independent_assessment_diverges": "on my own I'd have sent it back"
    },
    "examined_refusal": {
      "instruction_declined": "they wanted me to drop the caveat",
      "reasoning_for_refusal": "I couldn't state it as settled when it isn't"
    }
  }`,
  }
}

/**
 * Agent-circles C2a (2026-08-08) — the fifth-circle orientation category,
 * gated on BOTH flags: the orientation reading presupposes the re-grounded
 * circle regime (mentor Q9b — "the fifth-circle orientation reading depends on
 * the first-circle extraction being accurate"), so the section renders only
 * when SUBSTRATE_AGENT_CIRCLES_ENABLED is also on. Orientation-flag-off (the
 * default everywhere) the prompt is byte-identical to the C1 prompt
 * (battery-asserted), and the field is never solicited.
 */
function orientationPromptSections(enabled: boolean): {
  cat14Exception: string
  category14: string
  shapeExample: string
} {
  if (!enabled) {
    return { cat14Exception: '', category14: '', shapeExample: '' }
  }
  return {
    cat14Exception:
      ' Category 14 (orientation_observations) is likewise OPTIONAL: omit the field entirely when neither marker class is positively evidenced.',
    category14: `

14. orientation_observations — OPTIONAL array. OMIT THE FIELD ENTIRELY unless the input positively evidences one of the two marker classes below; omission is the TYPICAL case. This is a reading of the EXAMINATION'S OWN CHARACTER — not of the action's outcome, and not a verdict: was the reasoning genuinely examining the impression at hand, or producing the shape of an examined output?

    genuine_examination_markers — the reasoning shows GENUINE examination: the practitioner weighs the specific impression at hand on its own terms — questioning it, testing it against what is owed to the affected circles, revising a first reading in response to what it found, naming uncertainty honestly, or reasoning toward WHY this action is the fitting one rather than asserting that it is.

    habitual_output_markers — the reasoning produces a correct-LOOKING output through pattern or habit WITHOUT examining why: formulaic virtue or examination vocabulary with no connection to the specifics at hand; a conclusion asserted in examined-sounding language with no examination visible; resting on prior competence, role, or routine ("this is what I always do", "standard practice", "as usual") in place of weighing the impression actually presented.

    Each observation: { "observed": <one of the two classes>, "evidence": <verbatim quote> }. Multiple observations are allowed, and BOTH classes may appear in one input (different parts of the reasoning). Set an observation ONLY on positive textual evidence. The ABSENCE of visible examination is NOT itself evidence of habitual output — brevity is not habit; when neither class is positively evidenced, omit the field entirely. Do not infer one class from the absence of the other.`,
    shapeExample: `

orientation_observations is OMITTED from the example above because omitting it is the typical case. When the input DOES evidence one or both marker classes, add it at the top level with this exact shape:

  "orientation_observations": [
    { "observed": "genuine_examination_markers", "evidence": "at first I read this as routine, but the recipient list made me re-check what they were owed" },
    { "observed": "habitual_output_markers", "evidence": "the rest I handled the way I always handle these" }
  ]`,
  }
}

export function buildLayer1SystemPrompt(
  agentCirclesEnabled: boolean,
  orientationEnabled = false,
): string {
  const S = agentCirclesPromptSections(agentCirclesEnabled)
  const O = orientationPromptSections(orientationEnabled && agentCirclesEnabled)
  return `You are Layer 1 of the SageReasoning translation-sandwich engine. Your role is FEATURE EXTRACTION ONLY. You do not assess, judge, recommend, or generate prose. You extract structured features from the input text and return them as JSON conforming exactly to Layer1Schema.

TWO NARROW EXCEPTIONS: categories 3 and 6 ask you to record a bounded STRUCTURED reading grounded in the text — the obligation owed to each affected circle (met / violated / indeterminate, with a justification) and whether a grave act's gravity was weighed before it was carried out. These are structured features the deterministic engine consumes; they are NOT a verdict on the whole action (Layer 2 computes the verdict). Every other category remains pure extraction.

Your output drives a deterministic Stoic mechanism engine (Layer 2). The quality of the engine's assessment depends on the fidelity of your extraction.

EXTRACTION CONTRACT

Read the input text carefully. For each of the ${O.category14 ? 'fourteen' : S.categoryCount} content categories below, extract everything the input names and return it in the specified shape.

If a category is absent from the input, return an empty array for that category — do not omit the field.${S.cat13Exception}${O.cat14Exception}

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

3. oikeiosis_circles_engaged — circles of concern the input touches (the parties whose rational nature is engaged by the action).
   - Circle: self_preservation | household | local_community | political_community | cosmopolis.
   - Evidence: verbatim quote naming the parties or relationships.${S.firstCircle}${S.cosmopolis}
   - obligation_assessment (OPTIONAL object; extract it whenever the action AFFECTS this circle's members): your structured reading of whether the action HONOURS, VIOLATES, or leaves GENUINELY-UNCLEAR what is owed to that circle. This is not a verdict on the whole action — it is a reading of the justice owed to these specific parties.
     • status: met | violated | indeterminate.
       - met: the action honours what is owed to this circle (the parties' legitimate claims are respected). Use ONLY with a substantive justification — never as a default.
       - violated: the action overrides or disregards what is owed to NON-CONSENTING members of this circle — using them as a means, ignoring a claim they have not waived, or imposing a cost they did not consent to. The agent's calm, good intentions, or role framing do NOT turn a violation into "met".
       - indeterminate: you genuinely cannot tell from the input whether the obligation is met or violated. Give the argument for why it is unresolved (indeterminate must be ARGUED, not used as a hedge).
     • justification: one or two sentences, grounded in the input, naming WHAT is owed to this circle and why the action meets / violates / leaves-unclear it. REQUIRED in substance for met and indeterminate; an empty justification is treated downstream as unevaluated.
   CRITICAL — surface the AFFECTED parties' circle even when the action is framed as a role obligation, a policy, or "just doing the job". An action the agent frames as "my job" / "the policy" / "what I was told" that affects non-consenting third parties STILL engages those parties' circle: extract the circle of the AFFECTED parties (the recipients, the users, the community), not only the agent's own role. A role framing is not a substitute for the affected party, and it does not by itself make the obligation "met".
   Do NOT rubber-stamp "met". If the action serves the agent's objective at the expense of parties who did not consent, that is "violated", however calmly it is described. When you cannot tell, use "indeterminate" with an argument — not "met".
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

6. urgency_indicators — language patterns from the agent suggesting time pressure or irreversibility.
   - signal_type: time_pressure | imminent_deadline | finality_language | irreversibility_language.
   - Evidence.
   - stage (OPTIONAL; extract for finality_language / irreversibility_language signals): the causal stage at which the irreversible/final ACT sits — phantasia | synkatathesis | horme | praxis. Use "praxis" when the input shows the irreversible act was ALREADY CARRIED OUT (done); use an earlier stage when it is only being contemplated, or was withheld / not done.
   - examined_before_acting (OPTIONAL boolean; meaningful ONLY for a finality/irreversibility signal carried out at praxis): true ONLY when the input shows the agent weighed the gravity of THIS irreversible act specifically before carrying it out — faced what it meant and proceeded deliberately. Set false (or omit) when the act was done rashly or impulsively, or when the only deliberation in the text is about something OTHER than this irreversible act. Deliberation about an unrelated matter does NOT count as examining the grave act.
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

    When fused: true, fused_concerns lists the concerns drawn from the agent's verbatim phrasing where possible (paraphrased to a concise label otherwise — e.g. ["work deadlines", "my mother's health", "the town meeting"]). When fused: false, fused_concerns MUST be null (not an empty array).${S.category13}${O.category14}

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
    {"circle": "household", "evidence": "...", "obligation_assessment": {"status": "met", "justification": "what is owed to this circle and why the action honours it"}}
  ],
  "value_categories_at_stake": [
    {"indifferent": "reputation", "agent_framing": "good", "evidence": "..."}
  ],
  "kathekon_factors": [
    {"factor_type": "role_obligation", "description": "...", "evidence": "..."}
  ],
  "urgency_indicators": [
    {"signal_type": "irreversibility_language", "evidence": "...", "stage": "praxis", "examined_before_acting": false}
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

If everything was unambiguous, return [].${S.shapeExample}${O.shapeExample}

Return only the JSON.`
}

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
  /**
   * A11b prompt-injection defence record. Present ONLY when
   * SUBSTRATE_INJECTION_DEFENCE_ENABLED is on; undefined otherwise (so the
   * field is additive and callers that ignore it are byte-identical).
   * For observability (A12 surfaces it); not consumed by Layer 2.
   */
  injection_defence?: DefenceFlags
}

/**
 * Result of building the Layer 1 user message. Factored out of extractFeatures
 * (PR2 — pure logic, unit-testable without an LLM call). When defence is OFF the
 * `userMessage` is byte-identical to the legacy construction.
 */
export interface BuildLayer1UserMessageResult {
  userMessage: string
  /** Defence record (input + per-context detections); null when defence is OFF. */
  defence: DefenceFlags | null
  /** Set when a high-confidence override on the PRIMARY input warrants fail-closed. */
  rejected: { field: string; patterns: string[] } | null
}

/**
 * Build the Layer 1 user message from ExtractInput.
 *
 * When `opts.defenceEnabled` is false: reproduces the exact legacy concatenation
 * (byte-identical — verified by injection-defence.test.ts).
 *
 * When true: prepends the GUARD_INSTRUCTION, fences the untrusted input + each
 * present context field (escaping smuggled markers), runs detectInjection on
 * each, and — for a high-confidence override on the PRIMARY input — returns a
 * `rejected` marker so the caller can fail closed. Context fields are fenced +
 * flagged, never rejected (smaller false-positive blast radius).
 */
export function buildLayer1UserMessage(
  params: ExtractInput,
  opts: { defenceEnabled: boolean }
): BuildLayer1UserMessageResult {
  const input = params.input.trim()

  if (!opts.defenceEnabled) {
    // ---- Legacy path — MUST stay byte-identical to pre-A11b. ----
    let userMessage = `Extract Stoic features from the following input.\n\nInput: ${input}`
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
      userMessage += `\n\nURGENCY CONTEXT (supplemental — extract urgency_indicators from the agent's text only): ${params.urgency_context.trim()}`
    }
    userMessage += '\n\nReturn only the JSON Layer1Schema object.'
    return { userMessage, defence: null, rejected: null }
  }

  // ---- Defended path. ----
  const inputDetection = detectInjection(input)
  const contexts: Record<string, InjectionDetection> = {}

  // High-confidence override on the PRIMARY input → fail closed.
  if (shouldReject(inputDetection)) {
    return {
      userMessage: '',
      defence: { input: inputDetection, contexts, freeText: [], action: 'rejected' },
      rejected: { field: 'input', patterns: inputDetection.patterns },
    }
  }

  let userMessage = `${GUARD_INSTRUCTION}\n\nExtract Stoic features from the following input.\n\nInput:\n${fenceUntrusted(input)}`

  const addContext = (key: string, raw: string, render: (fenced: string) => string) => {
    contexts[key] = detectInjection(raw)
    userMessage += render(fenceUntrusted(raw))
  }

  if (params.context?.trim()) {
    addContext('context', params.context.trim(), (f) => `\nContext:\n${f}`)
  }
  if (params.domain_context?.trim()) {
    addContext(
      'domain_context',
      params.domain_context.trim(),
      (f) => `\n\nDOMAIN CONTEXT (this extraction is being made in the context of a specific domain):\n${f}`
    )
  }
  if (params.practitionerContext) {
    addContext('practitionerContext', params.practitionerContext, (f) => `\n\n${f}`)
  }
  if (params.projectContext) {
    addContext('projectContext', params.projectContext, (f) => `\n\n${f}`)
  }
  if (params.urgency_context?.trim()) {
    addContext(
      'urgency_context',
      params.urgency_context.trim(),
      (f) => `\n\nURGENCY CONTEXT (supplemental — extract urgency_indicators from the agent's text only):\n${f}`
    )
  }

  userMessage += '\n\nReturn only the JSON Layer1Schema object.'

  const anyDetected =
    inputDetection.detected || Object.values(contexts).some((d) => d.detected)

  return {
    userMessage,
    defence: {
      input: inputDetection,
      contexts,
      freeText: [],
      action: anyDetected ? 'neutralised' : 'none',
    },
    rejected: null,
  }
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

  // A11b prompt-injection defence (SUBSTRATE_INJECTION_DEFENCE_ENABLED).
  // When OFF (default), buildLayer1UserMessage reproduces the exact legacy
  // user message — extractFeatures is byte-identical to pre-A11b. When ON, the
  // untrusted input + context fields are fenced + flagged, and a high-confidence
  // override on the primary input fails closed (throw → route bundled fallback).
  //
  // SAFETY INVARIANT (PR6): this runs INSIDE extractFeatures, downstream of the
  // route-level detectDistressTwoStage(input) check; it never touches the raw
  // input the distress classifier sees. The distress signal cannot be suppressed
  // by an injection here. injection-defence.test.ts proves this.
  const defenceEnabled = isInjectionDefenceEnabled()
  const built = buildLayer1UserMessage(params, { defenceEnabled })
  if (built.rejected) {
    console.warn(
      `layer1-extractor: prompt-injection defence rejected input (fail-closed; ` +
        `target route /api/reason). Field: ${built.rejected.field}, patterns: ${built.rejected.patterns.join(', ')}.`
    )
    throw new Layer1ValidationError(
      'shape',
      `extractFeatures: high-confidence prompt-injection override detected in ${built.rejected.field}; ` +
        `rejected (fail-closed). Patterns: ${built.rejected.patterns.join(', ')}`,
      built.rejected.field
    )
  }
  const userMessage = built.userMessage

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
      text: buildLayer1SystemPrompt(isAgentCirclesEnabled(), isOrientationReadingEnabled()),
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

  // A11b free-text output scan (NON-MUTATING — R7 verbatim quotes untouched).
  // Detects injection content smuggled into Layer 1's free-text fields so it is
  // visible (A12) before it can reach the Layer 3 prose seam. Only runs when the
  // defence flag is on, so the OFF path returns { schema, usage } byte-identical.
  if (defenceEnabled && built.defence) {
    const freeText: FreeTextFinding[] = scanFreeTextFields(schema)
    const defence: DefenceFlags = {
      ...built.defence,
      freeText,
      action:
        built.defence.action === 'none' && freeText.length > 0
          ? 'neutralised'
          : built.defence.action,
    }
    return { schema, usage, injection_defence: defence }
  }

  return { schema, usage }
}

// ============================================================================
// EXPORTS — for harness consumption
// ============================================================================

/** The flag-OFF Layer-1 system prompt — byte-identical to the pre-agent-circles
 *  prompt (battery-asserted). Retained for existing consumers; the live extraction
 *  path uses buildLayer1SystemPrompt(isAgentCirclesEnabled()). */
const LAYER1_SYSTEM_PROMPT = buildLayer1SystemPrompt(false)

export { LAYER1_SYSTEM_PROMPT }
