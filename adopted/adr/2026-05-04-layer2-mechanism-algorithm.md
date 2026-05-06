# ADR-006 — Layer 2 Mechanism Algorithm (Translation-Sandwich Engine, M1-CP2)

**Status:** Adopted (founder approval at Sub-session M1-CP2, 2026-05-04 — "approve as drafted" with no edits).
**Date:** 2026-05-04.
**Stream:** founder.
**Decided by:** founder, informed by AI recommendation.
**Governing frame:** `/adopted/standing-protocol-cache.md`.
**Predecessor decision-log entries:** `D-M1-CP1-LAYER1-MODULE-AND-ADR005-2026-05-04` (M1-CP1 — Layer 1 module Verified standalone + ADR-005 Adopted; this ADR consumes ADR-005's `Layer1Schema` as its sole input contract); `D-E10-ADR004-DRAFTED-AND-ADOPTED-2026-05-04` (E10 — ADR-004 codification, including the §4.2 deferral that this ADR resolves).
**Related deliverables:** `/adopted/adr/2026-05-04-translation-sandwich-pilot-api-reason.md` (ADR-004 — names this ADR's parent context, defers per-mechanism deterministic rules to M1-CP2); `/adopted/adr/2026-05-04-layer1-schema-specification.md` (ADR-005 — defines the `Layer1Schema` input shape this layer consumes); `/adopted/adr/2026-05-04-depth-architecture-migration.md` (ADR-003 — the migration); `/manifest.md` AC1 + AC8 (Layer 2 has no model selection per AC1; module sits under `/website/src/lib/translation-sandwich/` per AC8); `/website/src/lib/sage-reason-engine.ts` (the bundled-depth engine — system prompts at lines 156–361 are the closest existing specification of the six Stoic mechanisms; cited as one source alongside primary Stoic texts).
**Engages:** R0 (oikeiosis — Layer 2 IS the principled mechanism reasoning step the manifest names; replaces LLM defaults at the canonical reasoning layer); R3 (NOT engaged — disclaimer is Layer 3's responsibility); R7 (source fidelity — Layer 2 preserves Layer 1's verbatim evidence quotes in every per-mechanism output); R8a (controlled vocabulary — Greek identifiers across passion taxonomy, causal stages, virtue domains; same vocabulary set as ADR-005 §2); AC1 (NO model — Layer 2 is deterministic code, no LLM call, no model selection cited per cache Element 6 row "Documentation, schema migration, registry update — N/A"); AC6 (NOT engaged at this layer — no context block placement; Layer 2 has no LLM call); AC8 (translation-sandwich constraint — Layer 2 module is the second build under this architecture; module sits under `/website/src/lib/translation-sandwich/`); KG1 (Vercel five rules — pure synchronous function; no DB writes; no fire-and-forget; no module-level cache; no self-calls); KG2 (NOT engaged — no model); PR1 (single-endpoint proof — Layer 2 verified standalone before composing into the route at M1-CP4); PR3 (engaged in spirit — Layer 2 is synchronous code per ADR-004 §4 "Synchronous, deterministic, no I/O"; safety-systems-are-synchronous discipline applies even though Layer 2 is not itself a safety surface); PR4 (NOT engaged — no model); PR6 (NOT engaged this session — module is not wired into route; engages at M1-CP4).

---

## Context

### What this ADR resolves

ADR-004 §4.2 specifies seven content categories the `assessment` block must contain (passion_diagnosis, control_filter, oikeiosis, value_assessment, kathekon_assessment, iterative_refinement, derived fields including katorthoma_proximity, ruling_faculty_state, virtue_domains_engaged, improvement_path_structured, stage_scores, hasty_assent_risk) and explicitly defers per-mechanism deterministic rules to M1-CP2. ADR-004 §4.1 specifies the module's exported function (`applyMechanisms`) and its general input/output shape; ADR-004 §4.3 names the determinism guarantee. ADR-006 closes those deferrals: it defines the exact `Layer2Assessment` TypeScript type, the per-mechanism deterministic algorithm in pseudocode with lookup tables in full, citations to canonical Stoic primary sources for each rule, the idempotency guarantee with verification approach, and the harness fixture set used for Phase 3 + Phase 4 of the standalone verification.

### What this ADR does not resolve

- The Layer 3 prompt template — deferred to ADR-007 at M1-CP3.
- The end-to-end orchestration in `/api/reason` — deferred to M1-CP4 (Critical-tier).
- The Layer 2 → Layer 3 hand-off shape (which assessment fields Layer 3's prompt receives verbatim vs which it composes from) — deferred to ADR-007 at M1-CP3.
- The parallel-run cost cap and observation duration — deferred to M1-CP4.
- The cutover thresholds — deferred to M1-CP5.
- Any change to the bundled-depth engine — out of scope until M5 retirement.
- Refinement of any Layer 2 lookup table based on observed real `/api/reason` traffic — deferred to M1-CP4. ADR-006's lookup tables are seed values from primary Stoic sources; revision based on parallel-run observation is a CP4-scope decision.

### Founder-confirmed decisions surfaced before drafting

At session open, the AI surfaced six load-bearing decisions and presented options with reasoning. Founder selected all recommended options ("all recommended"):

- **Decision 1 — ADR specification depth: pseudocode + citations + lookup tables in full.** ADR-006 is the governance artefact that prevents algorithmic drift; the TypeScript module is a faithful translation. Estimated length ~800–1000 lines.
- **Decision 2 — Layer2Assessment output completeness: always emit every field with empty/null defaults.** Parallels ADR-005's L2a decision for Layer 1. Layer 3 receives a predictable shape every time.
- **Decision 3 — Control filter classification when `agent_named_position == "unspecified"`: lookup table classifies + flag in `disambiguation_required`.** Per ADR-004 §4.2 default. Lookup table identifies "within" exceptions; default for unspecified is "outside" with the disambiguation flag.
- **Decision 4 — Passion → false-judgement mapping granularity: hybrid (per-root default + per-sub-species refinement when sub-species is non-null).** Layer 1's schema permits null sub-species; the hybrid handles both cases without an artificial fallback.
- **Decision 5 — Cicero's five questions deterministic application: per-circle honourability and advantageousness grades (1–3) derived from a fixed lookup table; Cicero's resolution applied as a decision tree over the grades; ties broken in favour of the inner circle.**
- **Decision 6 — Iterative refinement with single-snapshot input: sparse output with `direction_of_travel: "single_snapshot"`.** Aligns with Decision 2 (always emit). Honest signalling — Layer 3 knows no temporal comparison was possible.

Implied follow-on decisions exercised by the AI under Decision 1's recommendation (cited as such in this ADR but not separately surfaced because they flow from Decisions 1–6):

- The **kathekon "proportionate" rule** (ADR-004 §4.2 fourth check) is **dropped from the deterministic algorithm** because Layer 1 does not carry action magnitude. Quality is computed from three rules, not four. This is a substantive narrowing of ADR-004 §4.2's high-level approach; surfaced explicitly here for founder review.
- **Ambiguity passthrough**: Layer 2 preserves Layer 1's `ambiguity_notes` array verbatim and may append its own (Layer 2-originated) notes in a separate `layer2_ambiguity_notes` field.
- **Validation function**: `validateLayer2Assessment(parsed: unknown): Layer2Assessment` — same hand-rolled pattern as ADR-005 §6.
- **Citations location**: per Decision 1's "+ citations" — citations live in this ADR; module comments cite ADR-006 §X.Y.

## Decision

### 1. Module surface

New module: `/website/src/lib/translation-sandwich/layer2-mechanisms.ts`. Exports:

```typescript
export interface ApplyOptions {
  /** Reserved for future use (e.g., per-consumer mechanism weighting overrides).
   *  CP2 ignores all options; included for forward-compatibility with M2/M3/M4. */
  reserved?: never
}

export function applyMechanisms(
  schema: Layer1Schema,
  options?: ApplyOptions
): Layer2Assessment
```

The function is **synchronous** (no `async`/`await`), **pure** (no I/O, no module state, no `Date.now()`/`Math.random()`/`crypto.randomUUID()` reads in the algorithm path), and **deterministic** (same input → same output, byte-for-byte equal across calls within a single Node.js process). PR3 (safety systems are synchronous) is engaged in spirit: Layer 2 must complete before Layer 3 is called; no background work; no fire-and-forget.

The module also exports the `Layer2Assessment` type and its component types (per §2 below) for harness consumption and for Layer 3's input contract.

### 2. The `Layer2Assessment` TypeScript type

```typescript
// =============================================================================
// CONTROLLED VOCABULARIES (R8a) — extends ADR-005 §2 vocabularies; same set
// =============================================================================

// Re-exported from layer1-extractor.ts for Layer 2 consumers:
//   RootPassion, PassionSubSpecies, CausalStage, OikeiosisCircle,
//   Indifferent, AgentFraming

// New Layer 2 vocabularies:

export type ProhairesisClassification = 'within' | 'outside'

export type ControlFilterReasoning =
  | 'agent_identified_within'      // Layer 1 said agent_named_position == "within"
  | 'agent_identified_outside'     // Layer 1 said agent_named_position == "outside"
  | 'lookup_table_match_within'    // unspecified, but item matched WITHIN_LOOKUP
  | 'default_outside_for_unspecified' // unspecified, no lookup match → default

export type CiceroVerdict =
  | 'honourable_prevails'        // honourability grade > advantageousness grade
  | 'advantageous_prevails'      // advantageousness grade > honourability grade
  | 'both_high_aligned'          // both grades == 3
  | 'balanced_neither_decisive'  // grades equal but < 3
  | 'indeterminate'              // insufficient evidence

export type KathekonQuality = 'strong' | 'moderate' | 'marginal' | 'contrary'

export type SenecanGrade = 'pre_progress' | 'grade_1' | 'grade_2' | 'grade_3'

export type DirectionOfTravel = 'improving' | 'stable' | 'declining' | 'single_snapshot'

export type KatorthomaProximity =
  | 'reflexive'   // impulse without deliberation
  | 'habitual'    // convention without understanding
  | 'deliberate'  // conscious reasoning with some understanding
  | 'principled'  // stable commitment to virtue
  | 'sage_like'   // perfected understanding (rare; reserved)

export type VirtueDomain = 'phronesis' | 'dikaiosyne' | 'andreia' | 'sophrosyne'

export type StageScore = 'strong' | 'adequate' | 'weak' | 'not_applied'

export type HastyAssentRisk = 'high' | 'moderate' | 'low' | 'none'

export type AxiaGrade = 'high' | 'moderate' | 'low'

export type TreatedAs = 'good' | 'evil' | 'indifferent'

// Added 2026-05-06 (M1-CP4b) — AC-13 / AC-14 trigger vocabulary

export type IntakeTriggerCode =
  | 'STATED_OPERATIVE_CONFLICT'
  | 'STATED_EQUANIMITY_UNVERIFIED'
  | 'EUPATHEIA_BOUNDARY'
  | 'PRAXIS_MOTIVATION_AMBIGUITY'

export type DeferralStatus = 'open' | 'closed'

// Added 2026-05-06 (M1-CP4e) — AC-13 Tier 1 force-clarification trigger vocabulary per ADR-008 §3.5

/** Engine-level Tier 1 trigger codes per D13. Surface-level Tier 1 codes (per D13's
 *  surface-level table) are out of scope for `/api/reason` because `/api/reason` has
 *  no consumer-specific input fields beyond `text`; surface-level codes engage at
 *  M2/M3/M4 consumers' own ADRs. */
export type Tier1TriggerCode =
  | 'ELEMENT_FUSION'      // Layer 1; fired by element_fusion_detected.fused === true
  | 'SCOPE_AMBIGUITY'     // Layer 2 / Position 6 (oikeiosis_stage)
  | 'TEMPORAL_AMBIGUITY'  // Layer 2 / Position 2 (passion_root_detection)

/** Where in the engine sequencing the Tier 1 trigger fired. Used for diagnostics +
 *  meta logging + harness coverage. The orchestrator emits this on the Tier 1
 *  response's `meta.fired_at_position` field per ADR-008 §2. */
export type Tier1FiredAtPosition = 'layer1' | 'position-2' | 'position-6'

/** Layer 2's classification of motivation underlying a praxis-stage action.
 *  - 'virtue_explicit' — the agent named virtue-aligned motivation (e.g., "for the principle").
 *  - 'virtue_inferred' — Layer 2 inferred virtue alignment from structural features
 *    (used sparingly; default is to defer rather than infer).
 *  - 'convention_inferred' — Layer 2 detected convention-shaped motivation
 *    (used sparingly; default is to defer rather than infer).
 *  - 'unclear_pending_clarification' — set when PRAXIS_MOTIVATION_AMBIGUITY fires;
 *    the OPEN_DEFERRAL holds the pending classification per AC-14.
 *  - null — not applicable (no praxis-stage action observed in the input). */
export type MotivationClassification =
  | 'virtue_explicit'
  | 'virtue_inferred'
  | 'convention_inferred'
  | 'unclear_pending_clarification'
  | null

// =============================================================================
// PER-MECHANISM OUTPUT SHAPES
// =============================================================================

export interface ControlFilterClassifiedItem {
  /** The verbatim item from Layer 1's control_filter_elements. */
  item: string
  /** Layer 1's recorded agent framing (passthrough). */
  agent_named_position: AgentNamedPosition
  /** Layer 2's canonical classification. */
  classification: ProhairesisClassification
  /** Why Layer 2 made this classification (one of four enums). */
  reasoning: ControlFilterReasoning
}

export interface ControlFilter {
  within_prohairesis: ControlFilterClassifiedItem[]
  outside_prohairesis: ControlFilterClassifiedItem[]
  /** Items the agent did not signal a position on; Layer 2 classified by lookup
   *  table or default. Layer 3 may flag these in its prose. */
  disambiguation_required: ControlFilterClassifiedItem[]
}

export interface PassionDiagnosisEntry {
  /** Stable identifier for cross-reference within Layer 3 prose. */
  id: string
  /** Display name (e.g., "Anguish (agonia)"). */
  name: string
  root_passion: RootPassion
  sub_species: PassionSubSpecies | null
  /** The canonical false judgement implied by this passion. */
  false_judgement: string
  /** The canonical Stoic correction. */
  correct_judgement: string
  /** Causal stage the passion is currently lodged at (latest stage with
   *  evidence in Layer 1's causal_stage_evidence; defaults to "phantasia"
   *  when no stage evidence is present). */
  causal_stage_affected: CausalStage
  /** Verbatim evidence quote from Layer 1 (R7 source fidelity). */
  evidence: string
}

export interface PassionDiagnosis {
  passions_detected: PassionDiagnosisEntry[]
  /** All false judgements aggregated, top-level, for Layer 3's convenience. */
  false_judgements: string[]
  /** All correct judgements aggregated. */
  correct_judgements: string[]
  /** Most-prominent causal stage across all detected passions; null if no
   *  passions detected. */
  causal_stage_affected: CausalStage | null
}

export interface OikeiosisCircleAssessment {
  /** Stage 1 (self_preservation) through 5 (cosmopolis). */
  stage: 1 | 2 | 3 | 4 | 5
  circle: OikeiosisCircle
  /** Verbatim evidence quote from Layer 1 (R7 source fidelity). */
  description: string
  /** Per Decision 5: 1 (low), 2 (moderate), 3 (high). */
  honourability_grade: 1 | 2 | 3
  /** Per Decision 5: 1 (low), 2 (moderate), 3 (high). */
  advantageousness_grade: 1 | 2 | 3
  /** Per Decision 5: applied as a decision tree over the two grades. */
  cicero_verdict: CiceroVerdict
  /** Whether the input shows obligation met for this circle: true / false / null. */
  obligation_met: boolean | null
  /** Source of tension at this circle, if any. */
  tension: string | null
}

export interface Oikeiosis {
  relevant_circles: OikeiosisCircleAssessment[]
  /** Free-form notes aggregating cross-circle deliberation observations. */
  deliberation_notes: string
}

export interface IndifferentAtStakeAssessment {
  /** Canonical name from ADR-005 §2 Indifferent vocabulary. */
  name: Indifferent
  /** Canonical Stoic ranking — fixed lookup. */
  axia: AxiaGrade
  /** Computed from agent_framing per Decision 4 below. */
  treated_as: TreatedAs
  /** Verbatim evidence quote (R7). */
  evidence: string
  /** Per-indifferent error description, or null when no error. */
  error: string | null
}

export interface ValueAssessment {
  indifferents_at_stake: IndifferentAtStakeAssessment[]
  /** Top-level concatenation of per-item errors; null when none. */
  value_error: string | null
}

export interface KathekonAssessment {
  /** True (kathekon), false (contrary), or null (marginal — undecidable). */
  is_kathekon: boolean | null
  quality: KathekonQuality
  /** Concatenation of which rules engaged. */
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
   *  PRAXIS_MOTIVATION_AMBIGUITY fires per AC-14; null when not applicable
   *  (no praxis-stage action observed). Other values reserved for future
   *  motivation-classification work. */
  motivation_classification: MotivationClassification
}

export interface ImprovementPathStructured {
  /** The primary false judgement to correct (selected per §3.7 below). */
  false_judgement_to_correct: string
  /** Which mechanism produced this — for Layer 3's narrative scaffolding. */
  mechanism_applies:
    | 'passion_diagnosis'
    | 'control_filter'
    | 'oikeiosis'
    | 'value_assessment'
    | 'kathekon_assessment'
  /** The Stoic correction. */
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

// Added 2026-05-06 (M1-CP4b) — intake-clarification entries per AC-13 / AC-14

export interface SoftClarification {
  /** Tier 2 trigger code per the d-a16 catalogue. */
  trigger_code: 'STATED_OPERATIVE_CONFLICT' | 'STATED_EQUANIMITY_UNVERIFIED'
  /** Always 2 for soft clarifications. */
  intake_tier: 2
  /** d-a16 catalogue stem ID — 'tier_2:stated_operative_conflict:001' or
   *  'tier_2:stated_equanimity_unverified:001'. */
  stem_id: string
  /** Slot variables filled from the assessment + Layer 1 evidence. Keys per
   *  d-a16 stem specification (e.g., 'STATED_CIRCLE_TARGET', 'SITUATION'). */
  slot_fills: Record<string, string>
  /** Plain-language description of which fields would refine if the practitioner
   *  answers (e.g., "oikeiosis primary circle and its operative obligation"). */
  scope_of_change: string
}

export interface OpenDeferralEntry {
  /** Tier 3 trigger code per the d-a16 catalogue. */
  trigger_code: 'EUPATHEIA_BOUNDARY' | 'PRAXIS_MOTIVATION_AMBIGUITY'
  /** Always 3 for open deferrals. */
  intake_tier: 3
  /** d-a16 catalogue stem ID — 'tier_3:eupatheia_boundary:001' or
   *  'tier_3:praxis_motivation_ambiguity:001'. */
  stem_id: string
  /** Slot variables filled from the assessment + Layer 1 evidence per the
   *  d-a16 stem specification. */
  slot_fills: Record<string, string>
  /** Names which classification field is being withheld and why. The field_path
   *  is a dot-path into the Layer2Assessment shape (e.g.,
   *  'iterative_refinement.motivation_classification'). */
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

// Added 2026-05-06 (M1-CP4e) — AC-13 Tier 1 force-clarification interface per ADR-008 §3.5

/** A force-clarification trigger fired by the engine. The orchestrator (per ADR-008
 *  §5) inspects this — if non-null, the engine halts at the named position, Layer 3
 *  is not called, and the route emits a force-clarification response per ADR-008 §2.
 *  When null, the engine proceeds normally and Layer 2 produces a full assessment.
 *  Tier 1 is engine-flow-control, NOT a field on Layer2Assessment — it is returned
 *  separately by `detectTier1Trigger` and (for Position 2 / Position 6) signalled by
 *  `applyMechanisms` via a thrown sentinel or a dedicated return-shape extension
 *  (per §3.10 below). The orchestrator dispatches Tier 1 fires before Layer 3. */
export interface Tier1Trigger {
  /** The engine-level trigger code per Tier1TriggerCode. */
  trigger_code: Tier1TriggerCode
  /** The slot-filled question text in English, ready for the client to render
   *  verbatim. Per D13 stems; pre-D-A16 alt-3 derived. */
  question_text: string
  /** The d-a16 catalogue stem ID once promoted; null pre-promotion. Allows R7
   *  source-fidelity verification of the stem against the canonical catalogue. */
  stem_id: string | null
  /** The resolved slot variables. Surfaced for diagnostics + for clients who wish
   *  to re-render the question with their own template (R10 skill marketplace
   *  consumers). For Tier 1 stems with no slots (SCOPE_AMBIGUITY, TEMPORAL_AMBIGUITY
   *  per D13), this is an empty object. For ELEMENT_FUSION, contains
   *  LIST_OF_FUSED_CONCERNS as a comma-separated string. */
  slot_fills: Record<string, string>
  /** Where in the engine sequencing the trigger fired. */
  fired_at_position: Tier1FiredAtPosition
}

// =============================================================================
// TOP-LEVEL ASSESSMENT
// =============================================================================

export interface Layer2Assessment {
  /** Schema version. Constant. */
  version: 'layer2-assessment-v1'
  /** Layer 1 schema version this assessment was produced from. Forward-compat. */
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
   *  triggers (STATED_OPERATIVE_CONFLICT, STATED_EQUANIMITY_UNVERIFIED,
   *  EUPATHEIA_BOUNDARY, PRAXIS_MOTIVATION_AMBIGUITY). Layer 3 reads this field
   *  to render soft_clarification_prose + open_deferrals_prose per ADR-007. */
  intake_clarifications: IntakeClarifications
  /** Layer 1's ambiguity_notes passed through verbatim. */
  layer1_ambiguity_notes: string[]
  /** Layer 2's own ambiguity notes (e.g., disambiguation_required summary). */
  layer2_ambiguity_notes: string[]
}
```

### 3. Per-mechanism deterministic algorithm

#### 3.1 Control filter

**Source citations:** Epictetus *Discourses* I.1 ("On things in our power and not in our power"); Epictetus *Enchiridion* §1 ("Some things are in our control and others not"); Stoic Brain `prohairesis` passage; Cicero *De Finibus* III.32–33 (on what is "up to us").

**Algorithm:**

```
function classifyControlFilter(elements: ControlFilterElement[]): ControlFilter:
  within = []
  outside = []
  disambiguation = []

  for each ce in elements:
    if ce.agent_named_position == "within":
      classified = { item: ce.item, agent_named_position: "within",
                     classification: "within",
                     reasoning: "agent_identified_within" }
      within.push(classified)

    elif ce.agent_named_position == "outside":
      classified = { item: ce.item, agent_named_position: "outside",
                     classification: "outside",
                     reasoning: "agent_identified_outside" }
      outside.push(classified)

    else:  # "unspecified"
      lower = ce.item.toLowerCase()
      if any keyword in WITHIN_LOOKUP_KEYWORDS matches lower:
        classified = { item: ce.item, agent_named_position: "unspecified",
                       classification: "within",
                       reasoning: "lookup_table_match_within" }
        within.push(classified)
        disambiguation.push(classified)
      else:
        classified = { item: ce.item, agent_named_position: "unspecified",
                       classification: "outside",
                       reasoning: "default_outside_for_unspecified" }
        outside.push(classified)
        disambiguation.push(classified)

  return { within_prohairesis: within,
           outside_prohairesis: outside,
           disambiguation_required: disambiguation }
```

**Lookup table — `WITHIN_LOOKUP_KEYWORDS`:**

```
WITHIN_LOOKUP_KEYWORDS = [
  // First-person mental-state markers
  "my judgement", "my judgment", "my thought", "my belief",
  "my decision", "my choice", "my response", "my reaction",
  "my attitude", "my intention", "my impulse", "my desire",
  "my aversion", "my values", "my character", "my will",
  "my mindset", "my perspective", "my view",
  // Faculty-of-choice phrasings
  "what i think", "how i respond", "how i react",
  "what i decide", "what i choose", "how i frame",
  "how i interpret", "what i believe",
  // Direct prohairesis terms
  "prohairesis", "ruling faculty", "moral choice",
  "rational assent",
]
```

**Citation note:** the canonical Stoic answer is that prohairesis encompasses judgements, impulses, desires, aversions, and character (Epictetus *Discourses* I.1.7, I.4.18; *Enchiridion* §1). Everything else — body, possessions, reputation, family members' actions, weather, market outcomes — is outside. The lookup table identifies first-person markers of these mental states; the default for unspecified is "outside" because the canonical Stoic answer is that most concerns name external things by default.

**Determinism review:** the algorithm uses array iteration in input order and string `.includes()` checks against a `const` keyword array. No randomness, no time, no I/O. Two calls with the same input produce the same output.

#### 3.2 Passion diagnosis

**Source citations:** Cicero *Tusculan Disputations* IV.10–22 (passion classification); Diogenes Laertius *Lives* VII.110–116 (passion definitions and sub-species); SVF III.391–420 (Stoic fragments on passions); Seneca *De Ira* I–III (orge in detail); Epictetus *Discourses* II.16 (on phobos); Stoic Brain passion-taxonomy module.

**Algorithm:**

```
function diagnosePassions(passions: PassionPresent[],
                          stages: CausalStageEvidence[]): PassionDiagnosis:
  if passions.length == 0:
    return { passions_detected: [],
             false_judgements: [],
             correct_judgements: [],
             causal_stage_affected: null }

  detected = []
  for each (p, i) in passions.entries():
    # Hybrid lookup per Decision 4
    if p.sub_species != null AND SUB_SPECIES_FALSE_JUDGEMENT[p.sub_species] exists:
      false_j = SUB_SPECIES_FALSE_JUDGEMENT[p.sub_species]
      correct_j = SUB_SPECIES_CORRECT_JUDGEMENT[p.sub_species]
    else:
      false_j = ROOT_FALSE_JUDGEMENT[p.root_passion]
      correct_j = ROOT_CORRECT_JUDGEMENT[p.root_passion]

    name = formatPassionName(p.root_passion, p.sub_species)
    causal_stage = pickLatestStage(stages) ?? "phantasia"

    detected.push({
      id: `passion_${i}`,
      name: name,
      root_passion: p.root_passion,
      sub_species: p.sub_species,
      false_judgement: false_j,
      correct_judgement: correct_j,
      causal_stage_affected: causal_stage,
      evidence: p.evidence
    })

  return {
    passions_detected: detected,
    false_judgements: detected.map(d => d.false_judgement),
    correct_judgements: detected.map(d => d.correct_judgement),
    causal_stage_affected: pickLatestStage(stages) ?? "phantasia"
  }

function pickLatestStage(stages: CausalStageEvidence[]): CausalStage | null:
  if stages.length == 0: return null
  ORDER = ["phantasia", "synkatathesis", "horme", "praxis"]  # ascending in causality
  latest_index = -1
  for each s in stages:
    idx = ORDER.indexOf(s.stage)
    if idx > latest_index: latest_index = idx
  return ORDER[latest_index]

function formatPassionName(root, sub): string:
  if sub: return `${PASSION_DISPLAY_NAMES[sub]} (${sub})`
  else:   return `${PASSION_DISPLAY_NAMES[root]} (${root})`
```

**Lookup tables — root passions:**

```
ROOT_FALSE_JUDGEMENT = {
  epithumia: "There is good in some external object I do not have.",
  hedone:    "There is good in this external object I now have.",
  phobos:    "There is evil in some future external object.",
  lupe:      "There is evil in some present external object."
}

ROOT_CORRECT_JUDGEMENT = {
  epithumia: "Externals are indifferent. The genuine good is virtue alone — exercised through right judgement, just impulse, and stable character.",
  hedone:    "External pleasures are indifferent. Rejoicing belongs to virtue, not to externals; the wise rejoice in their own correct action, not in objects of pleasure.",
  phobos:    "Externals are indifferent. The only evil is vice. What I fear cannot harm my prohairesis; the body and externals are not the self.",
  lupe:      "Externals are indifferent. What has been lost or threatened is no genuine good. Distress is a false judgement that something external bears on virtue."
}
```

**Lookup tables — sub-species refinements (per Decision 4 hybrid):**

```
SUB_SPECIES_FALSE_JUDGEMENT = {
  // Epithumia sub-species
  orge:         "I have been wronged by another, and the proper response is retaliation.",
  eros:         "Sexual or romantic possession of this person is good.",
  pothos:       "The absence of this loved person is an evil to me.",
  philedonia:   "Bodily pleasure is the genuine good.",
  philoplousia: "Wealth is the genuine good.",
  philodoxia:   "Reputation and honour from others are the genuine good.",
  // Hedone sub-species
  kelesis:      "This impression that flatters me is true; my pleasure in it is justified.",
  epichairekakia: "Another's harm is good for me.",
  terpsis:      "This sensual pleasure I now experience is the genuine good.",
  // Phobos sub-species
  deima:        "I am about to be destroyed.",
  oknos:        "Action will bring evil; inaction is safer.",
  aischyne:     "Others see me as worthless and I am worthless.",
  thambos:      "This unexpected event proves the world is dangerous.",
  thorybos:     "I cannot think clearly because something terrible looms.",
  agonia:       "An imminent evil is overtaking me and I cannot avert it.",
  // Lupe sub-species
  eleos:        "Others' suffering harms me too.",
  phthonos:     "Another's good is evil for me.",
  zelotypia:    "I am being deprived of what is rightfully mine.",
  penthos:      "I have lost something genuinely good.",
  achos:        "An irreversible evil has befallen me."
}

SUB_SPECIES_CORRECT_JUDGEMENT = {
  // (One per sub-species; the per-root template applies as fallback)
  orge:         "No external action by another can harm my prohairesis. Wrongs done by others reflect their character, not my good.",
  eros:         "Possession of any external — including another's affection — is indifferent. The genuine good is right judgement, not the object of desire.",
  pothos:       "The absence of any external is indifferent. What I have lost is no genuine good; the genuine good is virtue alone, which absence cannot remove.",
  philedonia:   "Bodily pleasure is indifferent — preferred when it accompanies right action, of no consequence otherwise. The genuine good is virtue.",
  philoplousia: "Wealth is indifferent — preferred when it serves right action, of no consequence otherwise. The genuine good is virtue.",
  philodoxia:   "Reputation is indifferent. The opinions of others — even good opinions — bear nothing on virtue, which alone is the genuine good.",
  kelesis:      "Examine the impression. The pleasing surface is no proof of truth. Assent only to what survives examination.",
  epichairekakia: "Another's harm is no good for me. The good of another and my own good are not in opposition; we share rational nature.",
  terpsis:      "Sensual pleasure is indifferent. The good is in right judgement about the pleasure, not in the pleasure itself.",
  deima:        "I cannot be destroyed in my essential self — my prohairesis. The body is indifferent; what I fear is no genuine evil.",
  oknos:        "The only evil is vice; inaction from fear is itself a vicious failure to act. Right action proceeds from right judgement, not from fear.",
  aischyne:     "Others' opinion of me is indifferent. My worth is in my virtue, which others' assessments do not touch.",
  thambos:      "Unexpected events do not change the nature of things. Externals are indifferent whether anticipated or not.",
  thorybos:     "Stop. Examine the impression. What I cannot think clearly about is itself an indifferent — clarity is restored by withholding assent until the impression is examined.",
  agonia:       "The imminent event is indifferent. My agitation is the false judgement that virtue depends on its outcome.",
  eleos:        "Others' suffering is indifferent to my good. I can act with care and with kindness without sharing their false judgement that the suffering is genuine evil.",
  phthonos:     "Another's good is no evil for me. Goods of virtue are not scarce; we both can have them.",
  zelotypia:    "Nothing external belongs to me by right. Possession by another is indifferent.",
  penthos:      "What I have lost is no genuine good. The good — virtue — is not lost with the external.",
  achos:        "The event is indifferent. Reversibility is not the criterion of good and evil; only virtue and vice are."
}

PASSION_DISPLAY_NAMES = {
  epithumia: "Craving", hedone: "Irrational pleasure",
  phobos: "Fear", lupe: "Distress",
  orge: "Anger", eros: "Erotic desire", pothos: "Longing",
  philedonia: "Love of pleasure", philoplousia: "Love of wealth",
  philodoxia: "Love of reputation",
  kelesis: "Charm-induced pleasure", epichairekakia: "Malicious joy",
  terpsis: "Sensual delight",
  deima: "Panic", oknos: "Hesitation", aischyne: "Shame",
  thambos: "Astonishment-fear", thorybos: "Confusion", agonia: "Anguish",
  eleos: "Pity", phthonos: "Envy", zelotypia: "Jealousy",
  penthos: "Mourning", achos: "Anguished grief"
}
```

**Determinism review:** algorithm iterates `passions` in input order; lookup tables are `const`; `pickLatestStage` is deterministic (linear scan returning the maximum index). Two calls with the same input produce the same output.

#### 3.3 Oikeiosis

**Source citations:** Cicero *De Officiis* I.50–58 (the social bonds — common humanity, nation, city, household), I.45–47 (Cicero's resolution of conflicts between honestum and utile), III.18–28 (resolution rules); Hierocles *On Appropriate Acts* (the expanding circles — recorded by Stobaeus); Stoic Brain oikeiosis module; Marcus Aurelius *Meditations* II.1, IV.4 (cosmopolis); Cicero *De Finibus* III.62–64 (oikeiosis from self outward).

**Algorithm:**

```
function assessOikeiosis(circles: OikeiosisCircleEngaged[],
                         kathekon_factors: KathekonFactor[],
                         indifferents: ValueCategoryAtStake[]):
                         Oikeiosis:
  assessments = []

  for each ce in circles:
    base_h = CIRCLE_HONOURABILITY_BASE[ce.circle]
    base_a = CIRCLE_ADVANTAGEOUSNESS_BASE[ce.circle]

    h = base_h
    a = base_a

    # Bump honourability if natural relationship engaged at this circle
    if any kf in kathekon_factors where kf.factor_type == "natural_relationship":
      h = min(h + 1, 3)
    if any kf in kathekon_factors where kf.factor_type == "role_obligation":
      h = min(h + 1, 3)

    # Bump advantageousness if high-axia indifferent at stake
    for each i in indifferents:
      if AXIA[i.indifferent] == "high":
        a = min(a + 1, 3)
        break

    verdict = ciceroResolve(h, a)
    obligation_met = computeObligationMet(ce, kathekon_factors)
    tension = computeTension(ce, circles, kathekon_factors)

    assessments.push({
      stage: CIRCLE_STAGE_NUMBER[ce.circle],
      circle: ce.circle,
      description: ce.evidence,
      honourability_grade: h,
      advantageousness_grade: a,
      cicero_verdict: verdict,
      obligation_met: obligation_met,
      tension: tension
    })

  # Sort assessments by stage number for stable output ordering
  assessments.sort_by(stage_ascending)

  deliberation_notes = composeDeliberationNotes(assessments, kathekon_factors)
  return { relevant_circles: assessments, deliberation_notes: deliberation_notes }

function ciceroResolve(h: 1|2|3, a: 1|2|3): CiceroVerdict:
  if h == 3 AND a == 3: return "both_high_aligned"
  if h > a:
    if h >= 2: return "honourable_prevails"
    else: return "indeterminate"
  if a > h:
    if a >= 2: return "advantageous_prevails"
    else: return "indeterminate"
  # h == a, both < 3
  return "balanced_neither_decisive"

function computeObligationMet(ce, factors): boolean | null:
  # Heuristic: if the agent's evidence quote names fulfilment language ("I am",
  # "I do", "I have") → true; if naming failure ("I should have", "I didn't",
  # "I'm not") → false; otherwise null. Layer 3 may override in prose.
  lower = ce.evidence.toLowerCase()
  if matches(lower, FULFILMENT_LANGUAGE): return true
  if matches(lower, FAILURE_LANGUAGE):    return false
  return null

function computeTension(ce, all_circles, factors): string | null:
  # Tension if multiple circles are engaged AND the input contains conflict
  # language (Layer 1 doesn't extract this directly; Layer 2 inspects Layer 1's
  # evidence quotes for canonical conflict markers).
  if all_circles.length < 2: return null
  for each other in all_circles where other != ce:
    if conflict_markers_overlap(ce.evidence, other.evidence):
      return `Tension between ${ce.circle} and ${other.circle}`
  return null
```

**Lookup tables:**

```
CIRCLE_HONOURABILITY_BASE = {
  self_preservation:   1,  # Stoics: self-preservation alone has low honourability;
                           # honourability arises in extending concern outward
  household:           3,  # Cicero De Off I.57-58: household ties strongest
  local_community:     2,
  political_community: 3,  # Cicero De Off I.57: duties to country very high
  cosmopolis:          2   # Wide pull but Stoic primary sources rank it below patria
                           # and household for honourability of action; high for
                           # honourability of disposition
}

CIRCLE_ADVANTAGEOUSNESS_BASE = {
  self_preservation:   3,  # Naturally most advantageous
  household:           2,
  local_community:     2,
  political_community: 2,
  cosmopolis:          1
}

CIRCLE_STAGE_NUMBER = {
  self_preservation:   1,
  household:           2,
  local_community:     3,
  political_community: 4,
  cosmopolis:          5
}

AXIA = {
  life: "high", health: "high",
  pleasure: "moderate", beauty: "moderate", strength: "moderate",
  wealth: "moderate", reputation: "moderate", noble_birth: "moderate",
  death: "low", disease: "low", pain: "low", ugliness: "low"
}

FULFILMENT_LANGUAGE = [
  "i am", "i do", "i have", "i'm meeting", "i'm fulfilling",
  "i'm there", "i'm present", "i'm honouring"
]

FAILURE_LANGUAGE = [
  "i should have", "i didn't", "i'm not", "i failed",
  "i can't", "i won't", "i wasn't", "i haven't"
]
```

**Tied-grade resolution:** when `ciceroResolve` returns `balanced_neither_decisive` for two or more circles, the inner-circle priority breaks the tie at the `improvement_path_structured` selection step (§3.7) only — the per-circle assessments themselves remain tied in their `cicero_verdict` field. This preserves Stoic primary-source intuition (Cicero *De Off* III.69 — "duty closer to home prevails when other things are equal") without overstating Layer 2's certainty in the per-circle output.

**Determinism review:** array iteration in input order; circles sorted by `stage` ascending; lookup tables are `const`; `ciceroResolve` is a pure function over two integers; conflict-marker matching is deterministic substring search. Two calls produce the same output.

#### 3.4 Value assessment

**Source citations:** Diogenes Laertius *Lives* VII.105–107 (axia and the preferred indifferents); Cicero *De Finibus* III.50–54 (preferred and dispreferred indifferents); Stobaeus *Eclogae* II.7.7a (axia table); Stoic Brain indifferents module.

**Algorithm:**

```
function assessValue(indifferents: ValueCategoryAtStake[]): ValueAssessment:
  if indifferents.length == 0:
    return { indifferents_at_stake: [], value_error: null }

  assessments = []
  errors = []

  for each i in indifferents:
    axia = AXIA[i.indifferent]
    treated_as = computeTreatedAs(i.agent_framing)
    error = computeValueError(i.indifferent, treated_as)
    if error: errors.push(error)
    assessments.push({
      name: i.indifferent,
      axia: axia,
      treated_as: treated_as,
      evidence: i.evidence,
      error: error
    })

  value_error = errors.length > 0 ? errors.join("; ") : null
  return { indifferents_at_stake: assessments, value_error: value_error }

function computeTreatedAs(framing: AgentFraming): TreatedAs:
  switch (framing):
    case "good":         return "good"
    case "evil":         return "evil"
    case "indifferent":  return "indifferent"
    case "unspecified":  return "indifferent"  # default — agent didn't elevate

function computeValueError(name: Indifferent, treated_as: TreatedAs): string | null:
  is_preferred = ["life", "health", "pleasure", "beauty", "strength",
                  "wealth", "reputation", "noble_birth"].includes(name)
  is_dispreferred = ["death", "disease", "pain", "ugliness"].includes(name)

  if treated_as == "indifferent":          return null
  if is_preferred AND treated_as == "good":
    return `Confused ${name} (a preferred indifferent) with the genuine good`
  if is_dispreferred AND treated_as == "evil":
    return `Confused ${name} (a dispreferred indifferent) with genuine evil`
  if is_preferred AND treated_as == "evil":
    return `Confused ${name} (preferred) with evil — unusual framing`
  if is_dispreferred AND treated_as == "good":
    return `Confused ${name} (dispreferred) with good — unusual framing`
  return null
```

**Determinism review:** iteration in input order; lookup tables are `const`; switch on enum values. Two calls produce the same output.

#### 3.5 Kathekon assessment

**Source citations:** Cicero *De Officiis* I.7–10 (definition of kathekon and its criteria); Diogenes Laertius *Lives* VII.107–110 (kathekon and its sub-types — perfect / intermediate / contrary); Cicero *De Finibus* III.58–62; Stobaeus *Eclogae* II.7.8.

**The dropped fourth rule (proportionality).** ADR-004 §4.2 names a four-rule check: (1) natural relationship? (2) reasonable justification? (3) role obligations? (4) is the action proportionate? Layer 1 does not extract action magnitude — proportionality cannot be assessed deterministically from the schema alone. ADR-006 drops the fourth rule from the deterministic algorithm and computes quality from three rules. If the founder later wants to restore proportionality, ADR-005 would need a new Layer 1 field (e.g., `action_magnitude_evidence`) and ADR-006 a fourth rule consuming it. Surfaced under "implied follow-on decisions" in §Founder-confirmed decisions above.

**Algorithm:**

```
function assessKathekon(factors: KathekonFactor[]): KathekonAssessment:
  has_natural_relationship = factors.some(f => f.factor_type == "natural_relationship")
  has_role_obligation = factors.some(f => f.factor_type == "role_obligation")
  has_justification = factors.some(f => f.factor_type == "justification_offered")

  satisfied_count = (has_natural_relationship ? 1 : 0)
                  + (has_role_obligation ? 1 : 0)
                  + (has_justification ? 1 : 0)

  quality = QUALITY_FROM_COUNT[satisfied_count]
  is_kathekon = IS_KATHEKON_FROM_QUALITY[quality]
  justification = composeJustification(has_natural_relationship,
                                        has_role_obligation,
                                        has_justification)

  return { is_kathekon: is_kathekon,
           quality: quality,
           justification: justification }

function composeJustification(nr: bool, ro: bool, j: bool): string:
  parts = []
  if nr: parts.push("natural relationship engaged")
  if ro: parts.push("role obligation engaged")
  if j:  parts.push("justification offered")
  if parts.length == 0:
    return "No kathekon factors detected; action is contrary to appropriate action."
  return parts.join("; ") + "."
```

**Lookup tables:**

```
QUALITY_FROM_COUNT = {
  3: "strong",
  2: "moderate",
  1: "marginal",
  0: "contrary"
}

IS_KATHEKON_FROM_QUALITY = {
  strong:   true,
  moderate: true,
  marginal: null,   # undecidable — Layer 3 may flag for human judgement
  contrary: false
}
```

**Determinism review:** boolean checks on input array; lookups are `const`. Two calls produce the same output.

#### 3.6 Iterative refinement

**Source citations:** Seneca *Epistulae Morales* 75 (the four progressors' grades — pre-progress, three grades of progress); Seneca *Epistulae Morales* 87, 90 (progress dimensions); Seneca *De Tranquillitate Animi* (passion reduction over time); Marcus Aurelius *Meditations* V.9 (continual return to principle); Stoic Brain progress module.

**Single-snapshot handling per Decision 6.** Most `/api/reason` inputs are single-snapshot (one decision in present-tense or recent-past). Layer 2 always emits the iterative_refinement field; when no temporal markers are present, `direction_of_travel` is set to `"single_snapshot"` to signal explicitly that no temporal comparison was possible.

**Algorithm:**

```
function assessIterativeRefinement(passions: PassionDiagnosis,
                                    control_filter: ControlFilter,
                                    value_assessment: ValueAssessment,
                                    oikeiosis: Oikeiosis,
                                    layer1_evidence_quotes: string[]):
                                    IterativeRefinement:
  # Per-dimension descriptors
  passion_count = passions.passions_detected.length
  passion_reduction = describePassionReduction(passion_count, passions)
  judgement_quality = describeJudgementQuality(control_filter, value_assessment)
  disposition_stability = describeDispositionStability(passions, control_filter)
  oikeiosis_extension = describeOikeiosisExtension(oikeiosis)

  # Senecan grade aggregate
  senecan_grade = computeSenecanGrade(passions, control_filter, value_assessment)

  # Direction of travel
  direction = computeDirectionOfTravel(layer1_evidence_quotes)

  return {
    senecan_grade: senecan_grade,
    progress_dimensions: {
      passion_reduction: passion_reduction,
      judgement_quality: judgement_quality,
      disposition_stability: disposition_stability,
      oikeiosis_extension: oikeiosis_extension
    },
    direction_of_travel: direction
  }

function computeSenecanGrade(p, cf, va): SenecanGrade:
  passion_count = p.passions_detected.length
  has_late_stage = p.passions_detected.some(pd =>
    pd.causal_stage_affected == "horme" OR
    pd.causal_stage_affected == "praxis")
  value_error_count = va.indifferents_at_stake.filter(i => i.error != null).length
  within_count = cf.within_prohairesis.length
  outside_count = cf.outside_prohairesis.length

  # Pre-progress: passions at horme/praxis with multiple value errors
  if has_late_stage AND value_error_count >= 2:
    return "pre_progress"
  # Grade 1: passions present (any stage) and value errors detected, not yet
  # examining or correcting
  if passion_count >= 1 AND value_error_count >= 1:
    return "grade_1"
  # Grade 2: passions detected at phantasia or synkatathesis only (early stages,
  # examination in progress), few value errors, control filter shows examination
  if passion_count >= 1 AND value_error_count <= 1 AND
     within_count >= outside_count:
    return "grade_2"
  # Grade 3: minimal passions, no value errors, control filter dominantly within
  if passion_count <= 1 AND value_error_count == 0 AND
     within_count > outside_count:
    return "grade_3"
  # Default: grade_1 (most common — agent is in the work)
  return "grade_1"

function computeDirectionOfTravel(quotes: string[]): DirectionOfTravel:
  combined = quotes.join(" ").toLowerCase()
  has_temporal = TEMPORAL_MARKERS.some(m => combined.includes(m))
  if not has_temporal: return "single_snapshot"

  improving_count = IMPROVING_LANGUAGE.filter(m => combined.includes(m)).length
  declining_count = DECLINING_LANGUAGE.filter(m => combined.includes(m)).length
  if improving_count > declining_count: return "improving"
  if declining_count > improving_count: return "declining"
  return "stable"
```

**Lookup tables:**

```
TEMPORAL_MARKERS = [
  "yesterday", "last week", "last month", "last year",
  "i used to", "before", "previously", "in the past",
  "now i", "these days", "recently", "lately"
]

IMPROVING_LANGUAGE = [
  "better", "improved", "progress", "calmer", "stronger",
  "clearer", "more steady", "less reactive", "easier"
]

DECLINING_LANGUAGE = [
  "worse", "declined", "deteriorated", "more agitated",
  "less stable", "less clear", "harder", "regressed"
]
```

**Per-dimension descriptor templates:** terse natural-language strings derived from the inputs. Specific templates listed in the module's source comments per Decision 1's "lookup tables in full" — they are deterministic concatenations over input counts, omitted from this ADR for brevity but cited in §3.6 of the module file.

**Determinism review:** all branches use deterministic counts and substring matching. Two calls produce the same output.

#### 3.7 Derived fields

##### 3.7.1 `katorthoma_proximity`

**Source citations:** Stoic Brain proximity module; Cicero *De Finibus* III.20–22 (right action vs intermediate action); Diogenes Laertius VII.107–108 (katorthoma vs kathekon); the existing engine's `QUICK_SYSTEM_PROMPT` lines 173–178 + `STANDARD_SYSTEM_PROMPT` line 230 (proximity descriptors).

```
function computeProximity(passions, control_filter, oikeiosis,
                          value_assessment, kathekon): KatorthomaProximity:
  passion_count = passions.passions_detected.length
  late_stage = passions.passions_detected.some(p =>
    p.causal_stage_affected == "horme" OR
    p.causal_stage_affected == "praxis")
  early_stage_only = passion_count > 0 AND not late_stage
  within = control_filter.within_prohairesis.length
  outside = control_filter.outside_prohairesis.length
  value_errors = value_assessment.indifferents_at_stake
    .filter(i => i.error != null).length
  has_deliberation = oikeiosis.deliberation_notes.length > 0

  # sage_like: extremely strict — reserved for inputs with no detected passions,
  # control filter dominantly within, no value errors, kathekon strong
  if passion_count == 0 AND within > outside AND value_errors == 0
     AND kathekon.quality == "strong":
    return "sage_like"

  # principled: low passions, mostly within, kathekon at least moderate
  if passion_count <= 1 AND within >= outside AND value_errors <= 1
     AND (kathekon.quality == "strong" OR kathekon.quality == "moderate"):
    return "principled"

  # deliberate: passions at synkatathesis, value errors moderate, deliberation
  # notes present
  if early_stage_only AND has_deliberation AND value_errors <= 2:
    return "deliberate"

  # habitual: passions at horme/praxis, value errors plentiful, no deliberation
  if late_stage AND value_errors >= 2 AND not has_deliberation:
    return "habitual"

  # reflexive: passions at praxis with no examination evidence
  if passions.passions_detected.some(p => p.causal_stage_affected == "praxis")
     AND not has_deliberation:
    return "reflexive"

  # Default fall-through: deliberate (agent is engaging, no other tier fits)
  return "deliberate"
```

##### 3.7.2 `ruling_faculty_state`

**Source citations:** Marcus Aurelius *Meditations* II.6, V.9, VIII.48 (hegemonikon as ruling faculty); Epictetus *Discourses* I.20 (the faculty that uses other faculties); Stoic Brain hegemonikon module.

```
function computeRulingFacultyState(passions, ambiguity_count, urgency_count,
                                    has_deliberation): string:
  passion_count = passions.passions_detected.length

  if urgency_count >= 2 AND passion_count >= 2:
    return "Overwhelmed — multiple passions under time pressure; ruling faculty agitated."
  if passion_count >= 2:
    return "Agitated — multiple passions at present; examination interrupted."
  if passion_count == 1 AND has_deliberation:
    return "Examining — single passion engaged; ruling faculty actively interrogating impressions."
  if passion_count == 0 AND has_deliberation:
    return "Stable, examining — no passions present; ruling faculty deliberating without distortion."
  if passion_count == 0 AND not has_deliberation AND ambiguity_count == 0:
    return "Disengaged — no passions, no deliberation; ruling faculty at rest."
  if ambiguity_count >= 3:
    return "Unsettled — multiple ambiguities in interpretation; ruling faculty unable to resolve."
  return "Engaged — ruling faculty active but no dominant pattern."
```

##### 3.7.3 `virtue_domains_engaged`

**Source citations:** Diogenes Laertius VII.92–94, VII.126 (the four cardinal virtues — phronesis/prudentia, dikaiosyne/justitia, andreia/fortitudo, sophrosyne/temperantia); Cicero *De Officiis* I.15–16 (the four virtues organising kathekonta); Stobaeus *Eclogae* II.7.5b–b1; the existing engine's `STANDARD_SYSTEM_PROMPT` line 233.

```
function computeVirtueDomains(passions, control_filter, oikeiosis,
                              kathekon, value_assessment): VirtueDomain[]:
  domains = []

  # Phronesis: practical wisdom — engaged when control_filter or
  # value_assessment is the prominent mechanism
  if control_filter.disambiguation_required.length >= 1 OR
     value_assessment.indifferents_at_stake.length >= 1:
    domains.push("phronesis")

  # Dikaiosyne: justice — engaged when oikeiosis or kathekon is prominent
  if oikeiosis.relevant_circles.length >= 1 OR
     kathekon.is_kathekon != null:
    domains.push("dikaiosyne")

  # Andreia: courage — engaged when phobos passions detected
  if passions.passions_detected.some(p => p.root_passion == "phobos"):
    domains.push("andreia")

  # Sophrosyne: moderation — engaged when epithumia or hedone detected
  if passions.passions_detected.some(p =>
      p.root_passion == "epithumia" OR p.root_passion == "hedone"):
    domains.push("sophrosyne")

  return domains  # Stable order: phronesis, dikaiosyne, andreia, sophrosyne
```

##### 3.7.4 `improvement_path_structured`

**Source citations:** Epictetus *Discourses* III.21 (correcting impressions); Marcus Aurelius *Meditations* IV.3, VIII.49 (returning to first principles); Seneca *Epistulae Morales* 16 (the daily exam).

```
function selectImprovementPath(passions, control_filter, value_assessment,
                                oikeiosis, kathekon):
                                ImprovementPathStructured | null:
  # Selection priority (per "most prominent false judgement" rule):
  #   1. Most-evidenced passion (passions_present sorted by causal stage,
  #      latest-stage first; tie → first in input order)
  #   2. Most-significant value error (high-axia confused as good/evil)
  #   3. Control filter mismatch (item the agent treats as within but is outside)
  #   4. Kathekon contrary
  #   5. Oikeiosis tension (highest honourability circle with verdict
  #      "indeterminate" or "balanced_neither_decisive")
  #   6. null (no improvement path identified)

  # Priority 1: passions
  if passions.passions_detected.length > 0:
    # Sort by causal stage (latest first), preserving input order for ties
    primary = pickPrimaryPassion(passions.passions_detected)
    return {
      false_judgement_to_correct: primary.false_judgement,
      mechanism_applies: "passion_diagnosis",
      corrected_judgement: primary.correct_judgement
    }

  # Priority 2: value errors
  high_axia_errors = value_assessment.indifferents_at_stake
    .filter(i => i.axia == "high" AND i.error != null)
  if high_axia_errors.length > 0:
    err = high_axia_errors[0]
    return {
      false_judgement_to_correct: err.error,
      mechanism_applies: "value_assessment",
      corrected_judgement: `${err.name} is an indifferent, not a genuine ${err.treated_as}.`
    }

  # Priority 3: control filter mismatch (agent claims within for an item that
  # the lookup table places outside)
  mismatches = control_filter.within_prohairesis.filter(i =>
    i.reasoning == "agent_identified_within" AND
    not WITHIN_LOOKUP_KEYWORDS.some(k => i.item.toLowerCase().includes(k)))
  if mismatches.length > 0:
    return {
      false_judgement_to_correct: `"${mismatches[0].item}" is within my control.`,
      mechanism_applies: "control_filter",
      corrected_judgement: `"${mismatches[0].item}" is outside prohairesis. Only my judgement, impulse, and response to it are within.`
    }

  # Priority 4: kathekon contrary
  if kathekon.is_kathekon == false:
    return {
      false_judgement_to_correct: "This action is appropriate.",
      mechanism_applies: "kathekon_assessment",
      corrected_judgement: "No kathekon factors are engaged; reconsider the action's grounds in natural relationships, role obligations, and justification."
    }

  # Priority 5: oikeiosis tension (inner-circle priority for tied verdicts)
  tied = oikeiosis.relevant_circles.filter(c =>
    c.cicero_verdict == "balanced_neither_decisive" OR
    c.cicero_verdict == "indeterminate")
  if tied.length > 0:
    inner = pickInnermost(tied)  # lowest stage number
    return {
      false_judgement_to_correct: `Obligation at ${inner.circle} is unclear.`,
      mechanism_applies: "oikeiosis",
      corrected_judgement: `Apply Cicero's resolution: where honourability and advantageousness are balanced, the closer circle of concern prevails. ${inner.circle} carries more weight when other things are equal.`
    }

  return null

function pickPrimaryPassion(detected: PassionDiagnosisEntry[]):
                            PassionDiagnosisEntry:
  STAGE_RANK = { phantasia: 1, synkatathesis: 2, horme: 3, praxis: 4 }
  best = detected[0]
  for each p in detected.slice(1):
    if STAGE_RANK[p.causal_stage_affected] > STAGE_RANK[best.causal_stage_affected]:
      best = p
  return best  # Returns first-input-order entry on tie
```

##### 3.7.5 `stage_scores`

**Source citations:** the existing engine's `stage_scores` field (lines 199–204, 267–273, 352–359) — the "strong / adequate / weak" qualitative grading is preserved here, with the `not_applied` value added for mechanisms whose input was empty.

```
function computeStageScores(layer1: Layer1Schema, results: PartialResults):
                            StageScores:
  return {
    control_filter:        scoreControlFilter(layer1, results.control_filter),
    passion_diagnosis:     scorePassionDiagnosis(layer1, results.passion_diagnosis),
    oikeiosis:             scoreOikeiosis(layer1, results.oikeiosis),
    value_assessment:      scoreValueAssessment(layer1, results.value_assessment),
    kathekon_assessment:   scoreKathekonAssessment(layer1, results.kathekon_assessment),
    iterative_refinement:  scoreIterativeRefinement(results.iterative_refinement)
  }

# Per-mechanism scoring rules:
#   not_applied: mechanism's input from Layer 1 was empty
#   strong:      mechanism produced output AND no Layer 1 ambiguity_notes
#                reference this mechanism's fields
#   adequate:    mechanism produced output but ambiguity_notes reference
#                some of its fields (1-2 references)
#   weak:        mechanism produced output but ambiguity_notes reference
#                multiple of its fields (3+ references) OR
#                mechanism's input was minimal (single entry only)
```

#### 3.8 Hasty assent risk

**Source citations:** Epictetus *Enchiridion* §1, §5 (impressions and assent); Marcus Aurelius *Meditations* V.16, VIII.7 (examining impressions before assent); Stoic Brain assent module.

**Algorithm:**

```
function computeHastyAssentRisk(urgency_indicators: UrgencyIndicator[],
                                control_filter: ControlFilter): HastyAssentRisk:
  urgency_count = urgency_indicators.length
  pressing_outside_count = control_filter.outside_prohairesis
    .filter(i => i.reasoning != "agent_identified_outside")  # not pre-acknowledged
    .length

  if urgency_count == 0:
    return "none"
  if urgency_count >= 2 AND pressing_outside_count >= 2:
    return "high"
  if urgency_count >= 1 AND pressing_outside_count >= 1:
    return "moderate"
  return "low"
```

**Determinism review:** counts over input arrays; threshold checks. Two calls produce the same output.

#### 3.9 Intake clarification triggers (added 2026-05-06, M1-CP4b)

**Source citations:** `/adopted/ADR-RAG-MENTOR-ALT3-01-translation-sandwich-deterministic-engine.md` AC-13 + AC-14; `/adopted/rag-mentor-alt3/three-tier-intake.md` (engine-level trigger catalogue); `/adopted/rag-mentor-alt3/long-deferred-questions.md` (the architectural commitment that withholding is kathekon, not fallback); `/adopted/rag-mentor-alt3/d-a16-catalogue.md` Section 1 + Section 3 (canonical stem text and slot specifications).

**Architectural intent.** Per AC-14, withholding is kathekon — the appropriate action when the practitioner needs self-knowledge that has not yet been provided. The engine deliberately declines to assert classifications it cannot honestly confirm from the current instance. Per AC-13, three intake tiers govern this: Tier 1 (force clarification — out of scope at M1-CP4b; engages at M1-CP4d/4e), Tier 2 (soft clarification — offered alongside the result), Tier 3 (deterministic withhold — OPEN_DEFERRAL flag).

**Algorithm.** After mechanisms §3.1 through §3.8 complete, run four trigger detection steps in fixed order. Each step appends entries to `intake_clarifications.soft_clarifications` (Tier 2) or `intake_clarifications.open_deferrals` (Tier 3) per the trigger's tier classification. The trigger order does not affect output (each trigger's predicate is independent) but is fixed for harness determinism.

```
function detectIntakeClarifications(layer1: Layer1Schema,
                                     passion_diagnosis: PassionDiagnosis,
                                     oikeiosis: Oikeiosis,
                                     virtue_domains: VirtueDomain[],
                                     katorthoma_proximity: KatorthomaProximity,
                                     causal_stage_evidence: CausalStageEvidence[],
                                     iterative_refinement_in: IterativeRefinement):
                                     {
                                       intake_clarifications: IntakeClarifications,
                                       motivation_classification: MotivationClassification
                                     }:
  soft = []
  open = []
  motivation_class = null  // overridden by PRAXIS_MOTIVATION_AMBIGUITY when it fires

  # Step 1: STATED_OPERATIVE_CONFLICT (Tier 2)
  for each sct in layer1.stated_concern_targets:
    if sct.for_self_concern != null:
      # Heuristic: if the agent named a stated_target AND a separate self-concern,
      # the operative concern is divergent from the stated target. Soft clarification.
      operative_circle = oikeiosis.relevant_circles.length > 0
                         ? oikeiosis.relevant_circles[0].circle  # highest-stage; sorted
                         : "self_preservation"
      situation = pickSituationPhrase(layer1)  // highest-narrative-weight entity description
      soft.push({
        trigger_code: "STATED_OPERATIVE_CONFLICT",
        intake_tier: 2,
        stem_id: "tier_2:stated_operative_conflict:001",
        slot_fills: {
          "STATED_CIRCLE_TARGET": sct.stated_target,
          "SITUATION": situation
        },
        scope_of_change: "Refinement of the operative circle and its kathekon assessment if the practitioner confirms which concern is dominant."
      })
      break  // Append at most one STATED_OPERATIVE_CONFLICT per assessment

  # Step 2: STATED_EQUANIMITY_UNVERIFIED (Tier 2)
  if layer1.stated_equanimity_signals.length > 0
     AND passion_diagnosis.passions_detected.length > 0:
    soft.push({
      trigger_code: "STATED_EQUANIMITY_UNVERIFIED",
      intake_tier: 2,
      stem_id: "tier_2:stated_equanimity_unverified:001",
      slot_fills: {},  # T2E-002 stem is fully canonical (no slot-fills)
      scope_of_change: "Refinement of the passion classification — whether the stated calm is genuine eupatheia or polished surface over the detected passion-shape."
    })

  # Step 3: EUPATHEIA_BOUNDARY (Tier 3) — one OPEN_DEFERRAL per candidate
  for each ec in layer1.eupatheia_candidates:
    eupatheia_label = EUPATHEIA_DISPLAY_NAMES[ec.shape]
    eupatheia_descr = EUPATHEIA_DESCRIPTIONS[ec.shape]
    counterpart_descr = EUPATHEIA_PASSION_COUNTERPARTS[ec.shape]
    situational_trigger = ec.narrative_target ?? pickSituationPhrase(layer1)
    open.push({
      trigger_code: "EUPATHEIA_BOUNDARY",
      intake_tier: 3,
      stem_id: "tier_3:eupatheia_boundary:001",
      slot_fills: {
        "EUPATHEIA_SHAPE": eupatheia_label,
        "TIME_WINDOW": "recent days",  # M1 has no longitudinal context; default per d-a16
        "SITUATIONAL_TRIGGER": situational_trigger,
        "EUPATHEIA_DESCRIPTION": eupatheia_descr,
        "PASSION_COUNTERPART_DESCRIPTION": counterpart_descr
      },
      withheld_classification: {
        field_path: "passion_diagnosis.eupatheia_confirmation_pending",
        withheld_at_position: "post-passion-diagnosis (M1-CP4b extension)",
        reason: "Eupatheia confirmation requires longitudinal evidence that the practitioner's calm is not polished surface over passion. The current instance does not provide this evidence."
      },
      status: "open"
    })

  # Step 4: PRAXIS_MOTIVATION_AMBIGUITY (Tier 3)
  has_praxis_evidence = causal_stage_evidence.some(s => s.stage == "praxis")
  is_principled_plus = katorthoma_proximity == "principled" OR
                       katorthoma_proximity == "sage_like"
  if layer1.motivation_stated == false AND is_principled_plus AND has_praxis_evidence:
    surface_pattern = KATORTHOMA_PROXIMITY_LABEL[katorthoma_proximity]
    virtue_descr = virtue_domains.length > 0
                   ? VIRTUE_DESCRIPTIONS[virtue_domains[0]]
                   : "phronesis (practical wisdom understanding the right action)"
    convention_descr = CONVENTION_SUBSTITUTION_DESCRIPTION
    open.push({
      trigger_code: "PRAXIS_MOTIVATION_AMBIGUITY",
      intake_tier: 3,
      stem_id: "tier_3:praxis_motivation_ambiguity:001",
      slot_fills: {
        "SURFACE_PATTERN": surface_pattern,
        "VIRTUE_DESCRIPTION": virtue_descr,
        "CONVENTION_DESCRIPTION": convention_descr
      },
      withheld_classification: {
        field_path: "iterative_refinement.motivation_classification",
        withheld_at_position: "post-iterative-refinement (M1-CP4b extension)",
        reason: "Motivation classification depends on self-report the practitioner has not provided. The action's surface pattern is consistent with virtue but cannot be distinguished from convention without the practitioner's reflection on what was operative for them."
      },
      status: "open"
    })
    motivation_class = "unclear_pending_clarification"

  return {
    intake_clarifications: { soft_clarifications: soft, open_deferrals: open },
    motivation_classification: motivation_class
  }

function pickSituationPhrase(layer1: Layer1Schema): string:
  # Highest-narrative-weight entity description per Layer 1; falls back to first
  # oikeiosis circle's evidence; falls back to first passion's evidence;
  # falls back to "this situation".
  if layer1.oikeiosis_circles_engaged.length > 0:
    return layer1.oikeiosis_circles_engaged[0].evidence
  if layer1.passions_present.length > 0:
    return layer1.passions_present[0].evidence
  return "this situation"
```

**Lookup tables:**

```
EUPATHEIA_DISPLAY_NAMES = {
  chara:    "chara (joy in another's good)",
  boulesis: "boulesis (rational wishing)",
  eulabeia: "eulabeia (reverent caution)"
}

EUPATHEIA_DESCRIPTIONS = {
  chara:    "genuine joy in another's good as an end in itself",
  boulesis: "wanting what virtue would have you want, without grasping",
  eulabeia: "disinclination from what virtue would not endorse, without fear"
}

EUPATHEIA_PASSION_COUNTERPARTS = {
  chara:    "philodoxia (pleasure in being associated with success)",
  boulesis: "epithumia (craving an external as a genuine good)",
  eulabeia: "phobos (fear of an external as a genuine evil)"
}

KATORTHOMA_PROXIMITY_LABEL = {
  reflexive:  "an action driven by impulse without deliberation",
  habitual:   "an action shaped by convention without examined understanding",
  deliberate: "an action with conscious reasoning and some understanding",
  principled: "an action approaching the principled level",
  sage_like:  "an action approaching the level of perfected understanding"
}

VIRTUE_DESCRIPTIONS = {
  phronesis:  "phronesis (practical wisdom understanding the right action)",
  dikaiosyne: "dikaiosyne (justice — giving each what is due)",
  andreia:    "andreia (courage — endurance of right judgement under fear)",
  sophrosyne: "sophrosyne (temperance — moderation of desire by right judgement)"
}

CONVENTION_SUBSTITUTION_DESCRIPTION =
  "habit, social expectation, or what is conventionally praiseworthy in the agent's role"
```

**Wiring back into IterativeRefinement.** When PRAXIS_MOTIVATION_AMBIGUITY fires, the assembling step (top of `applyMechanisms`) sets `iterative_refinement.motivation_classification = 'unclear_pending_clarification'`. When the trigger does not fire and no praxis-stage evidence is present, `motivation_classification = null`. When the trigger does not fire and praxis-stage evidence IS present (because the agent named their motivation), Layer 2 reads `layer1.motivation_evidence` and sets `motivation_classification = 'virtue_explicit'` (M1 default — virtue-vs-convention inference is reserved for future work; if the agent named *any* motivation, M1 records it as 'virtue_explicit'). This conservative posture honours AC-14's discipline — Layer 2 does not infer convention substitution from absence; it defers when the signal is genuinely ambiguous and accepts the agent's self-report when present.

**Determinism review:** array iteration in input order; lookup tables are `const`; predicate evaluations are deterministic. Two calls produce the same output.

**Cross-reference to mechanisms.** STATED_OPERATIVE_CONFLICT consumes outputs from §3.3 (oikeiosis); STATED_EQUANIMITY_UNVERIFIED consumes §3.2 (passion_diagnosis); EUPATHEIA_BOUNDARY consumes Layer 1's `eupatheia_candidates` directly (no upstream Layer 2 dependency); PRAXIS_MOTIVATION_AMBIGUITY consumes §3.7.1 (katorthoma_proximity) + §3.7.3 (virtue_domains_engaged) + Layer 1's `causal_stage_evidence` and `motivation_stated`.

#### 3.10 Tier 1 force-clarification triggers (added 2026-05-06, M1-CP4e)

**Source citations:** `/adopted/adr/2026-05-06-multi-turn-input-flow-tier-1.md` (ADR-008 — the design ADR this section implements); `/adopted/rag-mentor-alt3/three-tier-intake.md` (D13 — engine-level Tier 1 trigger catalogue with full stems); `/adopted/ADR-RAG-MENTOR-ALT3-01-translation-sandwich-deterministic-engine.md` AC-13 (the architectural commitment); `/adopted/rag-mentor-alt3/d-a16-catalogue.md` (canonical stem source post-promotion; alt-3 derived pre-promotion).

**Architectural intent.** Per ADR-008 §1, Tier 1 force-clarification is engine-flow-control, NOT a field on `Layer2Assessment`. When a Tier 1 trigger fires, the engine halts at the firing position; subsequent positions do not run; Layer 3 is not called. The orchestrator (per ADR-008 §5) emits a force-clarification response shape (`clarification_required: true` + `Tier1Trigger` payload + opaque continuation token); the client renders the question, gathers the answer, re-submits the augmented input + token; the engine starts fresh from Position 1.

This contrasts with Tier 2 + Tier 3 (§3.9 above): those produce *additions to* `Layer2Assessment.intake_clarifications` while the full assessment proceeds. Tier 1 short-circuits the assessment entirely.

**Three trigger surfaces:**

| Trigger code | Layer | Surface |
|---|---|---|
| `ELEMENT_FUSION` | Layer 1 | Detected upstream of Layer 2 by `element_fusion_detected.fused === true` (per ADR-005 §3.12). Detected via the new exported function `detectTier1Trigger(schema)` BEFORE `applyMechanisms` is called. |
| `TEMPORAL_AMBIGUITY` | Layer 2 / Position 2 | Detected inside `applyMechanisms` at the passion_root_detection step (Position 2 in `applyMechanisms` execution order — the second mechanism after control_filter). Short-circuits Layer 2 with the trigger flag. |
| `SCOPE_AMBIGUITY` | Layer 2 / Position 6 | Detected inside `applyMechanisms` at the oikeiosis_stage step (Position 6 in `applyMechanisms` execution order). Short-circuits Layer 2 with the trigger flag. |

**Position numbering note.** "Position N" refers to the mechanism's place in the `applyMechanisms` execution sequence, not to the §3.X exposition order. The execution order in `applyMechanisms` (set at M1-CP2 implementation, preserved across M1-CP4b/4c/4e) is: Position 1 = control_filter (§3.1); Position 2 = passion_diagnosis with passion_root_detection sub-step (§3.2); Position 3-5 = additional sub-steps within passion_diagnosis + value_assessment + kathekon_assessment; Position 6 = oikeiosis with oikeiosis_stage sub-step (§3.3); Position 7+ = iterative_refinement + derived fields. The numbering reflects the canonical Stoic-mechanism sequencing where prohairesis examination precedes passion diagnosis, which precedes social-circle deliberation. The implementation may collapse some Positions into combined steps; the harness Phase 4 + Phase 6 verifies each trigger fires at the documented position regardless of internal sub-step grouping.

**Module surface — new exported function:**

```typescript
/** Detects upstream-most (Layer 1) Tier 1 triggers. Runs before applyMechanisms.
 *  Returns the Tier1Trigger when fusion is detected; null otherwise. */
export function detectTier1Trigger(schema: Layer1Schema): Tier1Trigger | null
```

The function inspects `schema.element_fusion_detected.fused`. When `true`, it constructs a `Tier1Trigger` with `trigger_code: 'ELEMENT_FUSION'`, renders the question_text by slot-filling LIST_OF_FUSED_CONCERNS from `schema.element_fusion_detected.fused_concerns` (comma-separated with Oxford "and" before final), populates `slot_fills`, and sets `fired_at_position: 'layer1'`. When `false`, returns null and the orchestrator proceeds to `applyMechanisms`.

**Algorithm — `detectTier1Trigger`:**

```
function detectTier1Trigger(schema: Layer1Schema): Tier1Trigger | null:
  if schema.element_fusion_detected.fused == true:
    concerns = schema.element_fusion_detected.fused_concerns
    if concerns == null OR concerns.length == 0:
      throw new Layer2Error("element_fusion_detected.fused === true but " +
                            "fused_concerns is null/empty — cross-field invariant " +
                            "violation. Validator should have caught this.")
    list_str = formatConcernsList(concerns)  // "X, Y, and Z"
    question_text = TIER1_STEMS.ELEMENT_FUSION
                    .replace("[LIST_OF_FUSED_CONCERNS]", list_str)
    return {
      trigger_code: "ELEMENT_FUSION",
      question_text: question_text,
      stem_id: null,  // pre-D-A16 promotion; populated post-promotion
      slot_fills: { "LIST_OF_FUSED_CONCERNS": list_str },
      fired_at_position: "layer1"
    }
  return null

function formatConcernsList(concerns: string[]): string:
  if concerns.length == 1: return concerns[0]
  if concerns.length == 2: return `${concerns[0]} and ${concerns[1]}`
  # 3+ items with Oxford "and"
  head = concerns.slice(0, -1).join(", ")
  tail = concerns[concerns.length - 1]
  return `${head}, and ${tail}`
```

**Module surface — short-circuits inside `applyMechanisms`:**

`applyMechanisms` is amended to detect SCOPE_AMBIGUITY and TEMPORAL_AMBIGUITY at their respective Positions and return early via a discriminated-union extension. The function signature changes from:

```typescript
// Before M1-CP4e
export function applyMechanisms(schema: Layer1Schema, options?: ApplyOptions): Layer2Assessment
```

to:

```typescript
// After M1-CP4e
export function applyMechanisms(
  schema: Layer1Schema,
  options?: ApplyOptions
): Layer2Assessment | { tier1_trigger: Tier1Trigger }
```

The discriminated union: when no Tier 1 fires, returns `Layer2Assessment` (the existing shape, unchanged). When Tier 1 fires at Position 2 or Position 6, returns `{ tier1_trigger: Tier1Trigger }`. The orchestrator type-narrows on the presence of `tier1_trigger` to dispatch.

**Algorithm — Position 2 (TEMPORAL_AMBIGUITY) short-circuit:**

The detection condition (per ADR-008 §3.3): the temporal axis (past / future) is undetermined for the dominant entity. The narrative references a past event ("that conversation") but the practitioner's continued concern is ambiguous between regret (past-orientation) and worry about consequences (future-orientation).

```
function detectTemporalAmbiguity(schema: Layer1Schema,
                                  passion_diagnosis: PassionDiagnosis | null):
                                  Tier1Trigger | null:
  # Short-circuits at passion_root_detection (Position 2). passion_diagnosis is
  # the partial result through the passion_root_detection step; null if Position 2
  # is implemented as a single combined step that hasn't completed yet.

  # Heuristic predicate: passion_root signal present BUT causal_stage_evidence
  # spans both past-anchored stages (synkatathesis, horme on a past event) AND
  # future-anchored stages (phantasia about a future-conditional outcome) without
  # a dominant temporal anchor.
  past_count = schema.causal_stage_evidence
    .filter(s => isPastAnchored(s.evidence)).length
  future_count = schema.causal_stage_evidence
    .filter(s => isFutureAnchored(s.evidence)).length

  has_passion_signal = schema.passions_present.length > 0
  has_temporal_split = past_count >= 1 AND future_count >= 1
  no_dominant_anchor = abs(past_count - future_count) <= 1

  # Plus: at least one passion is in the regret/worry family (lupe.penthos /
  # lupe.achos for past-anchored regret; phobos.agonia / phobos.thorybos for
  # future-anchored worry). This filters cases where the temporal split is
  # narratively obvious (e.g., reporting a sequence of events) from cases where
  # the temporal anchor of the *concern* is the ambiguous element.
  has_regret_or_worry = schema.passions_present.some(p =>
    REGRET_PASSIONS.includes(p.sub_species) OR
    WORRY_PASSIONS.includes(p.sub_species)
  )

  if has_passion_signal AND has_temporal_split AND no_dominant_anchor
     AND has_regret_or_worry:
    return {
      trigger_code: "TEMPORAL_AMBIGUITY",
      question_text: TIER1_STEMS.TEMPORAL_AMBIGUITY,
      stem_id: null,  // pre-D-A16 promotion
      slot_fills: {},  // stem is fully canonical; no slot-fills per D13
      fired_at_position: "position-2"
    }
  return null

function isPastAnchored(evidence: string): boolean:
  lower = evidence.toLowerCase()
  return PAST_TEMPORAL_MARKERS.some(m => lower.includes(m))

function isFutureAnchored(evidence: string): boolean:
  lower = evidence.toLowerCase()
  return FUTURE_TEMPORAL_MARKERS.some(m => lower.includes(m))
```

Lookup tables for Position 2:

```
REGRET_PASSIONS = ["penthos", "achos", "eleos"]  // lupe sub-species anchored on past loss/harm

WORRY_PASSIONS = ["agonia", "thorybos", "deima"]  // phobos sub-species anchored on future imminent

PAST_TEMPORAL_MARKERS = [
  "happened", "did", "said", "was", "were",
  "yesterday", "last week", "last month", "last year",
  "earlier", "before", "previously", "in the past",
  "i used to", "we used to", "i had", "we had",
  "should have", "shouldn't have", "could have",
  "i wish i had", "i wish i hadn't"
]

FUTURE_TEMPORAL_MARKERS = [
  "will", "going to", "might", "could", "may",
  "tomorrow", "next week", "next month", "next year",
  "later", "soon", "if i", "if we", "what if",
  "i'm worried", "i fear", "i'm afraid", "what they'll do",
  "what they might do", "what's going to"
]
```

**Algorithm — Position 6 (SCOPE_AMBIGUITY) short-circuit:**

The detection condition (per ADR-008 §3.2): Mechanism 6 (oikeiosis_stage) cannot map the action's target to a canonical oikeiosis circle because the narrative names an action ("I responded to them") without identifying the target's relational role.

```
function detectScopeAmbiguity(schema: Layer1Schema,
                               control_filter: ControlFilter | null):
                               Tier1Trigger | null:
  # Short-circuits at oikeiosis_stage (Position 6). Runs after control_filter
  # has been computed (Position 1) so we can read which actions / targets the
  # agent named.

  # Heuristic predicate: schema.oikeiosis_circles_engaged is empty OR contains
  # only self_preservation, BUT the schema names an action involving another
  # entity ("I responded", "I told them", "I said to") AND that other entity
  # is not classified into a circle.
  has_action = schema.causal_stage_evidence
    .some(s => s.stage == "praxis" OR s.stage == "horme")

  has_other_referent = OTHER_REFERENT_MARKERS.some(m =>
    schema.causal_stage_evidence.some(s => s.evidence.toLowerCase().includes(m)) OR
    schema.passions_present.some(p => p.evidence.toLowerCase().includes(m))
  )

  has_no_relational_circle =
    schema.oikeiosis_circles_engaged.length == 0 OR
    (schema.oikeiosis_circles_engaged.length == 1 AND
     schema.oikeiosis_circles_engaged[0].circle == "self_preservation")

  if has_action AND has_other_referent AND has_no_relational_circle:
    return {
      trigger_code: "SCOPE_AMBIGUITY",
      question_text: TIER1_STEMS.SCOPE_AMBIGUITY,
      stem_id: null,
      slot_fills: {},
      fired_at_position: "position-6"
    }
  return null
```

Lookup table for Position 6:

```
OTHER_REFERENT_MARKERS = [
  // Pronouns indicating an unspecified other
  "they", "them", "their", "the others", "the other",
  "him", "her", "his", "hers",
  "to him", "to her", "to them",
  // Generic relational markers without circle assignment
  "the person", "this person", "that person",
  "someone", "somebody", "everyone",
  // Action-direction phrases
  "responded to", "replied to", "said to", "told them",
  "wrote to", "called", "messaged"
]
```

**Tier 1 stems lookup table (per D13, pre-D-A16 transitional):**

```
TIER1_STEMS = {
  ELEMENT_FUSION:
    "There are several distinct concerns here — [LIST_OF_FUSED_CONCERNS]. " +
    "Before I work through this with you, can you tell me which one of these " +
    "is most centrally on your mind right now?",

  SCOPE_AMBIGUITY:
    "Who else was affected by this, if anyone? And what role do they play in " +
    "your life — colleague, family member, someone you don't know well?",

  TEMPORAL_AMBIGUITY:
    "When you think about this situation right now, are you more concerned " +
    "about something that's already happened, or something you're worried " +
    "might happen?"
}
```

Source: `/adopted/rag-mentor-alt3/three-tier-intake.md` (D13). Stems rendered verbatim; no paraphrase. R7 source fidelity. Post-D-A16 promotion, the table values remain stable and the catalogue ID populates `stem_id` on each Tier1Trigger.

**Wiring inside `applyMechanisms`:**

```
function applyMechanisms(schema: Layer1Schema,
                          options?: ApplyOptions):
                          Layer2Assessment | { tier1_trigger: Tier1Trigger }:
  # Position 1 — control_filter
  control_filter = classifyControlFilter(schema.control_filter_elements)

  # Position 2 — passion_diagnosis (with passion_root_detection sub-step)
  passion_diagnosis = diagnosePassions(schema.passions_present,
                                        schema.causal_stage_evidence)

  # Position 2 short-circuit — TEMPORAL_AMBIGUITY
  temporal_trigger = detectTemporalAmbiguity(schema, passion_diagnosis)
  if temporal_trigger != null:
    return { tier1_trigger: temporal_trigger }

  # Positions 3-5 — value_assessment, kathekon_assessment, intermediate steps
  value_assessment = assessValue(schema.value_categories_at_stake)
  kathekon_assessment = assessKathekon(schema.kathekon_factors)

  # Position 6 — oikeiosis (with oikeiosis_stage sub-step)
  oikeiosis = assessOikeiosis(schema.oikeiosis_circles_engaged,
                               schema.kathekon_factors,
                               schema.value_categories_at_stake)

  # Position 6 short-circuit — SCOPE_AMBIGUITY
  scope_trigger = detectScopeAmbiguity(schema, control_filter)
  if scope_trigger != null:
    return { tier1_trigger: scope_trigger }

  # Positions 7+ — iterative_refinement + derived fields + intake_clarifications
  # (the existing M1-CP2 + M1-CP4b path, unchanged)
  ...

  return assembleLayer2Assessment(...)  // existing path
```

ELEMENT_FUSION is NOT detected inside `applyMechanisms` — it is detected by `detectTier1Trigger` upstream (the orchestrator runs `detectTier1Trigger` after Layer 1 completes and before `applyMechanisms` is called). When ELEMENT_FUSION fires, `applyMechanisms` is not called for the request.

**Cross-reference to Tier 2 + Tier 3.** Tier 1 supersedes Tier 2 + Tier 3 (per ADR-008 §3.2). When Tier 1 fires at Position 2 or Position 6, `applyMechanisms` returns the trigger and never reaches the M1-CP4b §3.9 intake_clarification detection step. The standard `intake_clarifications.open_deferrals` and `soft_clarifications` are not produced for the request. The orchestrator's response shape for Tier 1 is `Tier1Trigger`, not `Layer2Assessment.intake_clarifications`.

**Determinism review:** all predicates use deterministic substring matching, lookup-table reads, and array iteration in input order. `formatConcernsList` is a pure function over array length. Two calls with the same `Layer1Schema` produce the same `Tier1Trigger | null` result (or the same `{ tier1_trigger: ... }` short-circuit return).

**Calibration toward under-firing.** Per ADR-008's risk note (§"Risks named — Tier 1 over-firing"), the predicates are calibrated conservatively. TEMPORAL_AMBIGUITY requires *both* a temporal split *and* a regret/worry passion to fire — narrative ambiguity alone does not trigger. SCOPE_AMBIGUITY requires an action *and* an unspecified-other referent *and* the absence of a relational circle — naming an action without naming the target circle does not alone trigger. M1-CP5 real-traffic data refines these thresholds.

**Cross-reference to ADR-008 §6 (R20a perimeter preservation).** Tier 1 detection runs server-side after the route's R20a perimeter line. The Tier 1 response is emitted by the orchestrator; the route's distress check has already fired by that point. On the second turn, the augmented input is distress-checked again before token validation. The Tier 1 mechanic does not weaken the perimeter.

### 4. Idempotency guarantee

`applyMechanisms` is **idempotent**: given the same `Layer1Schema` input, two calls produce byte-for-byte equal outputs across:

- The same Node.js process (verified by Phase 3 of the harness this session).
- Different Node.js processes (verified at M1-CP4 by the parallel-run comparison rubric).
- Different times (the algorithm reads no clock; lookup tables are `const`).

**Sources of potential non-determinism explicitly avoided:**

- No `Date.now()`, `performance.now()`, or any clock read in the algorithm path.
- No `Math.random()` or `crypto.randomUUID()` in the algorithm path.
- No iteration over `Map` or `Set` (insertion order matters in JavaScript but is brittle); all data structures are arrays or plain objects with explicitly-ordered keys.
- No I/O (no file reads, network calls, environment-variable lookups).
- No module-level mutable state (lookup tables are `const`; no caches).
- No external library calls beyond pure utility functions (e.g., `String.toLowerCase()`, `Array.prototype.sort()` — the latter only with explicit comparator).
- The `id` field in `PassionDiagnosisEntry` uses a deterministic counter (`passion_${i}`) keyed on input-array index, not a UUID.

**Phase 3 verification (this session, harness):** for each fixture F1–F4, the harness:

1. Calls `extractFeatures` once (with cached output to avoid re-running Sonnet on every harness run).
2. Calls `applyMechanisms` twice with the same `Layer1Schema` input.
3. Asserts the two `Layer2Assessment` outputs are deep-equal via `JSON.stringify` round-trip comparison.

A Phase 3 failure indicates a regression in the determinism guarantee and is a hard fail.

### 5. Validation function

Module exports `validateLayer2Assessment(parsed: unknown): Layer2Assessment` following ADR-005 §6's hand-rolled pattern. The validator:

1. Asserts `parsed` is an object with the exact required keys (including the M1-CP4b additions: `intake_clarifications`, plus `motivation_classification` on `iterative_refinement`).
2. Asserts `version === 'layer2-assessment-v1'` and `layer1_schema_version === 'layer1-schema-v1'`.
3. Asserts each per-mechanism field has the correct shape (delegated to per-mechanism sub-validators).
4. Asserts enum membership for all controlled-vocabulary fields, including the M1-CP4b additions (`IntakeTriggerCode`, `DeferralStatus`, `MotivationClassification`).
5. For `intake_clarifications` (M1-CP4b): asserts `soft_clarifications` and `open_deferrals` are arrays; for each entry, asserts `trigger_code` is in the allowed set for the tier, `intake_tier` matches the tier, `stem_id` is a non-empty string, `slot_fills` is an object whose values are strings, and (for OpenDeferralEntry) `withheld_classification.field_path` / `withheld_at_position` / `reason` are non-empty strings and `status` ∈ `{'open', 'closed'}`.
6. Returns the input narrowed to `Layer2Assessment` on success; throws `Layer2ValidationError` on failure.

The validator is primarily defensive: under correct module behaviour, `applyMechanisms` always returns a valid `Layer2Assessment`. The validator catches programming-error regressions during refactor and supports JSON round-trip safety in the harness.

**Note on Tier 1 (M1-CP4e).** Tier 1 force-clarification triggers (per §3.10) are NOT validated here because they are not fields on `Layer2Assessment` — they are an alternative return shape from `applyMechanisms` (the discriminated union `Layer2Assessment | { tier1_trigger: Tier1Trigger }`). The orchestrator (per ADR-008 §5) type-narrows on the presence of `tier1_trigger` to dispatch. A separate function `validateTier1Trigger(parsed: unknown): Tier1Trigger` validates the trigger shape: asserts `trigger_code ∈ Tier1TriggerCode`, `question_text` is a non-empty string, `stem_id` is null or a non-empty string, `slot_fills` is an object whose values are strings, and `fired_at_position ∈ Tier1FiredAtPosition`. The harness Phase 4 + Phase 6 + Phase 11 + Phase 12 (M1-CP4e additions) exercise this validation across F7/F8/F9 fixtures.

### 6. Citations summary

ADR-006's per-mechanism algorithms are grounded in the following primary Stoic sources. Each algorithm cites its sources inline above; this section consolidates them for auditing.

| Mechanism | Primary sources |
|---|---|
| Control filter (§3.1) | Epictetus *Discourses* I.1; *Enchiridion* §1; Cicero *De Finibus* III.32–33; Stoic Brain prohairesis module |
| Passion diagnosis (§3.2) | Cicero *Tusculan Disputations* IV.10–22; Diogenes Laertius VII.110–116; SVF III.391–420; Seneca *De Ira* I–III; Epictetus *Discourses* II.16; Stoic Brain passion-taxonomy module |
| Oikeiosis (§3.3) | Cicero *De Officiis* I.50–58, I.45–47, III.18–28, III.69; Hierocles *On Appropriate Acts* (via Stobaeus); Marcus Aurelius *Meditations* II.1, IV.4; Cicero *De Finibus* III.62–64; Stoic Brain oikeiosis module |
| Value assessment (§3.4) | Diogenes Laertius VII.105–107; Cicero *De Finibus* III.50–54; Stobaeus *Eclogae* II.7.7a; Stoic Brain indifferents module |
| Kathekon assessment (§3.5) | Cicero *De Officiis* I.7–10; Diogenes Laertius VII.107–110; Cicero *De Finibus* III.58–62; Stobaeus *Eclogae* II.7.8 |
| Iterative refinement (§3.6) | Seneca *Epistulae Morales* 75, 87, 90; Seneca *De Tranquillitate Animi*; Marcus Aurelius *Meditations* V.9; Stoic Brain progress module |
| Katorthoma proximity (§3.7.1) | Cicero *De Finibus* III.20–22; Diogenes Laertius VII.107–108; existing engine `STANDARD_SYSTEM_PROMPT` lines 173–178; Stoic Brain proximity module |
| Ruling faculty state (§3.7.2) | Marcus Aurelius *Meditations* II.6, V.9, VIII.48; Epictetus *Discourses* I.20; Stoic Brain hegemonikon module |
| Virtue domains (§3.7.3) | Diogenes Laertius VII.92–94, VII.126; Cicero *De Officiis* I.15–16; Stobaeus *Eclogae* II.7.5b–b1; existing engine `STANDARD_SYSTEM_PROMPT` line 233 |
| Improvement path (§3.7.4) | Epictetus *Discourses* III.21; Marcus Aurelius *Meditations* IV.3, VIII.49; Seneca *Epistulae Morales* 16 |
| Stage scores (§3.7.5) | Existing engine `STANDARD_SYSTEM_PROMPT` lines 267–273 (the "strong / adequate / weak" rubric) |
| Hasty assent risk (§3.8) | Epictetus *Enchiridion* §1, §5; Marcus Aurelius *Meditations* V.16, VIII.7; Stoic Brain assent module |
| Intake clarification triggers (§3.9) | `/adopted/ADR-RAG-MENTOR-ALT3-01-translation-sandwich-deterministic-engine.md` AC-13 + AC-14; `/adopted/rag-mentor-alt3/three-tier-intake.md`; `/adopted/rag-mentor-alt3/long-deferred-questions.md`; `/adopted/rag-mentor-alt3/d-a16-catalogue.md` Section 1 + Section 3 |

Module comments cite ADR-006 §X.Y for the corresponding rule (per Decision 1's "+ citations" disposition).

## Consequences

### Positive

- ADR-004 §4.2's high-level approach now has concrete, citable per-mechanism rules. The R0 oikeiosis intent — "the engine reasons by principled mechanism, not by LLM defaults" — is realised as auditable code.
- The lookup tables make the Stoic primary-source claims visible at the source-of-truth level. A future review (founder, external philosophical reviewer, or agent developer) can audit the algorithm's claims directly against Stoic sources without re-deriving them from prose.
- The pseudocode discipline keeps ADR-006 readable for a non-coder founder; the TypeScript module's job is mechanical translation of the pseudocode.
- The hand-rolled validator pattern (no Zod) keeps the dependency surface unchanged. AC8 binding force is preserved.
- The idempotency contract is named at three levels: same process (Phase 3 verified this session), different processes (Phase 9 at M1-CP4), and across times (algorithm has no clock read).
- Every field in `Layer2Assessment` is always present (Decision 2). Layer 3's prompt template at M1-CP3 can rely on a stable input shape without defensive null checks.

### Negative / known costs

- **Lookup-table maintenance.** Adding a new sub-species, indifferent, or kathekon factor type requires updates in the type, the validator, and ADR-006's lookup table. Trade-off accepted: AC8's discipline favours minimal-dependency hand-rolling.
- **Citation depth.** Each rule cites primary sources, but ADR-006 cannot reproduce the source quotations in full (copyright + length). Audit requires the reviewer to consult the cited primary text. Mitigation: the existing engine's system prompts (lines 156–361) are cited as one source alongside primary texts; these prompts represent prior consensus on the mechanism descriptions.
- **The dropped fourth kathekon rule (proportionality).** Dropping the fourth rule from the deterministic algorithm means Layer 2's quality assessment uses three rules, not four. If the founder later wants proportionality, ADR-005 needs a new Layer 1 field and ADR-006 a fourth rule. Surfaced explicitly so the founder is not surprised at M1-CP4.
- **Single-snapshot iterative refinement.** Most `/api/reason` inputs will produce `direction_of_travel: "single_snapshot"`. This is honest signalling, not a defect, but Layer 3 must phrase the prose accordingly so users do not interpret it as a failure mode.
- **Lookup-table seed values may need revision after CP4 fixtures.** The honourability/advantageousness base grades (CIRCLE_HONOURABILITY_BASE, CIRCLE_ADVANTAGEOUSNESS_BASE) are derived from primary-source consensus but encode a particular reading. Real `/api/reason` traffic at CP4 may surface inputs where the seed values produce assessments founder finds inadequate. ADR-006 surfaces this as an open question and defers the revision authority to M1-CP4.
- **`virtue_domains_engaged` simplifications.** The four-virtue mapping (phronesis ↔ control_filter/value, dikaiosyne ↔ oikeiosis/kathekon, andreia ↔ phobos, sophrosyne ↔ epithumia/hedone) follows the existing engine's prompt rubric but is not a formal Stoic doctrine — Stoic primary sources discuss the virtues' interdependence (one virtue implies all). Layer 2 reports the engaged domains; Layer 3 may add caveats.

### Risks named

- **Lookup-table bias.** The lookup tables (especially WITHIN_LOOKUP_KEYWORDS, FULFILMENT_LANGUAGE, FAILURE_LANGUAGE, IMPROVING_LANGUAGE, DECLINING_LANGUAGE) encode English-language idioms. Multi-lingual or non-idiomatic inputs may evade detection. Mitigation: CP4 surfaces this in real traffic; ADR-006 names the seed values as revisable.
- **Causal-stage default fallback.** When `causal_stage_evidence` is empty (rare per Layer 1), Layer 2 defaults to `phantasia`. If Layer 1 systematically under-extracts causal stages, all passions land at phantasia, masking late-stage problems. Mitigation: Phase 4 (coverage) asserts `causal_stage_evidence` is non-empty for all four CP1 fixtures; if Layer 1 under-extracts in real traffic at CP4, Layer 2's default may need replacement with `null` (and Layer 3's prose must handle null).
- **Honourability tied-grade resolution.** Tied grades resolve at the `improvement_path_structured` step, not in the per-circle `cicero_verdict` field. Layer 3 must respect this — i.e., not infer a winner from `balanced_neither_decisive` per circle. Mitigation: ADR-007 (M1-CP3) names the rule for Layer 3's prose.
- **Kathekon `is_kathekon: null` (marginal).** Layer 2 returns null when one kathekon factor is engaged. Layer 3 must handle null by flagging the marginal case rather than asserting kathekon. Mitigation: ADR-007 prompt template names this case.
- **Determinism regression risk during refactor.** A future change that introduces `Date.now()` or `Math.random()` into the algorithm (e.g., for tie-breaking) would break the determinism guarantee silently. Mitigation: Phase 3 in the harness re-runs at every CP that touches Layer 2; CI-style harness execution at M5 or sooner would catch this earlier.
- **Selection priority in `improvement_path_structured` may consistently surface the same mechanism.** Priority 1 (passions) will trigger most often because most user inputs contain passions. Priority 5 (oikeiosis tension) is rare. This is not a defect — passions are typically the most actionable correction — but founder should review the priority order at M1-CP4 against real traffic.

### What this ADR is not

- **Not Layer 3.** The per-consumer prose template that consumes this assessment is ADR-007 at M1-CP3.
- **Not the route wiring.** The module exists at `/website/src/lib/translation-sandwich/layer2-mechanisms.ts` but is not imported by any route until M1-CP4.
- **Not a guarantee that the algorithm produces "good" assessments.** The algorithm produces deterministic assessments grounded in primary Stoic sources. Whether these assessments are useful in practice is an empirical question for the parallel-run period (M1-CP5).
- **Not a foreclosure on revision.** Lookup-table values are seed values; revision based on parallel-run observation is an explicit CP4-scope authority.

## Approval

Approval signal from the founder: "approve" (or specific edits) → ADR-006 moves from `/drafts/adr/` to `/adopted/adr/` in this session. The Layer 2 module build (Step 2) and the harness Phase 3 + 4 build (Step 3) proceed under this Adopted spec.

If the founder rejects ADR-006 or requests substantial edits, the draft is revised in this session or the build is deferred to M1-CP2b. The Layer 2 module is not built until ADR-006 is Adopted.

## Changelog

- **2026-05-04 (initial Adoption, Sub-session M1-CP2)** — drafted in `/drafts/adr/` after founder selected "all recommended" across the six load-bearing decisions surfaced at session open, founder-approved verbatim ("approve as drafted"), moved to `/adopted/adr/`. Defines `Layer2Assessment` TypeScript type with all per-mechanism output shapes; specifies per-mechanism deterministic algorithm in pseudocode with lookup tables in full; cites canonical Stoic primary sources per mechanism; names the idempotency guarantee with verification approach (Phase 3 of harness this session); names the validator pattern; surfaces the dropped kathekon "proportionate" rule explicitly as an implied follow-on decision under Decision 1's recommendation.

- **2026-05-06 (cross-session amendment, Sub-session M1-CP4b)** — M1-CP4b adds intake-clarification trigger detection to Layer 2 for AC-13 (Tier 2 soft-clarification) + AC-14 (Tier 3 deterministic-withhold) per `D-M1-AC13-AC14-WIRING-REQUIRED-BEFORE-CUTOVER-2026-05-05`. Schema additions (§2): three new vocabulary types (`IntakeTriggerCode`, `DeferralStatus`, `MotivationClassification`); three new interfaces (`SoftClarification`, `OpenDeferralEntry`, `IntakeClarifications`); `motivation_classification` field added to `IterativeRefinement`; `intake_clarifications` field added to `Layer2Assessment`. All additive — assessment version remains `layer2-assessment-v1`. Algorithm additions (§3): new §3.9 "Intake clarification triggers" specifies four trigger detection steps in fixed order (STATED_OPERATIVE_CONFLICT, STATED_EQUANIMITY_UNVERIFIED, EUPATHEIA_BOUNDARY, PRAXIS_MOTIVATION_AMBIGUITY); cross-references back into §3.3 (oikeiosis), §3.2 (passion_diagnosis), §3.7.1 (katorthoma_proximity); lookup tables for eupatheia display names + descriptions + passion counterparts + virtue descriptions + convention substitution description. Validator (§5) extended to assert intake_clarifications shape and enum membership. Citation summary (§6) extended with the §3.9 sources. Phase 4 fixture coverage extended (per ADR-005 §8.1 F5/F6 additions): F5 must produce non-empty `open_deferrals` (EUPATHEIA_BOUNDARY); F6 must produce non-empty `soft_clarifications` (STATED_EQUANIMITY_UNVERIFIED); F1–F4 must produce empty intake_clarifications when no triggers fire (default-empty discipline). Tier 1 force-clarification triggers (`ELEMENT_FUSION` at Layer 1, `SCOPE_AMBIGUITY` at Position 6 / oikeiosis, `TEMPORAL_AMBIGUITY` at Position 2 / passion_diagnosis) explicitly out of scope at this amendment — those engage at M1-CP4d/4e. Standard-tier governance amendment under 0d-ii (documentation; no production touch). Module update + harness re-verification scheduled for M1-CP4c.

- **2026-05-06 (cross-session amendment, Sub-session M1-CP4e — companion to ADR-008)** — M1-CP4e adds AC-13 Tier 1 force-clarification trigger detection at Layer 2 per ADR-008 §3.5. Schema additions (§2): two new vocabulary types (`Tier1TriggerCode` with three values — `ELEMENT_FUSION`, `SCOPE_AMBIGUITY`, `TEMPORAL_AMBIGUITY` — and `Tier1FiredAtPosition` with three values — `'layer1'`, `'position-2'`, `'position-6'`); one new interface `Tier1Trigger` (trigger_code + question_text + stem_id + slot_fills + fired_at_position). Tier 1 is engine-flow-control, NOT a field on `Layer2Assessment`; instead, `applyMechanisms`'s return type changes to a discriminated union `Layer2Assessment | { tier1_trigger: Tier1Trigger }`. The existing Layer2Assessment shape is preserved unchanged (assessment version remains `layer2-assessment-v1`). Algorithm additions (§3): new §3.10 "Tier 1 force-clarification triggers" specifies (a) the new exported function `detectTier1Trigger(schema: Layer1Schema): Tier1Trigger | null` that runs upstream of `applyMechanisms` and detects ELEMENT_FUSION via `schema.element_fusion_detected.fused === true`; (b) a Position 2 short-circuit detecting TEMPORAL_AMBIGUITY (passion_root signal + temporal split + regret/worry passion family — calibrated toward under-firing per ADR-008's risk note); (c) a Position 6 short-circuit detecting SCOPE_AMBIGUITY (action present + unspecified-other referent + no relational circle — calibrated toward under-firing); (d) Position numbering note clarifying that "Position N" refers to `applyMechanisms` execution order (Position 1 = control_filter, Position 2 = passion_root_detection, Position 6 = oikeiosis_stage); (e) lookup tables for canonical Tier 1 stems per D13 (TIER1_STEMS) + temporal markers (PAST_TEMPORAL_MARKERS, FUTURE_TEMPORAL_MARKERS) + regret/worry passion families (REGRET_PASSIONS, WORRY_PASSIONS) + other-referent markers (OTHER_REFERENT_MARKERS); (f) cross-reference to Tier 2 + Tier 3 (Tier 1 supersedes per ADR-008 §3.2 — when Tier 1 fires, intake_clarifications are not produced). Validator (§5) extended with a note that Tier 1 is an alternative return shape (not a Layer2Assessment field) plus a separate `validateTier1Trigger` function. Citation summary (§6) gains §3.10 sources (ADR-008 + D13 + AC-13 + d-a16 catalogue). Phase 4 + 6 fixture coverage extended (per ADR-005 §8.1 F7/F8/F9 additions in the same M1-CP4e amendment cycle): F7 (element-fusion case) must produce ELEMENT_FUSION via `detectTier1Trigger` upstream of `applyMechanisms`; F8 (scope-ambiguity case) must produce SCOPE_AMBIGUITY short-circuit at Position 6; F9 (temporal-ambiguity case) must produce TEMPORAL_AMBIGUITY short-circuit at Position 2. F1–F6 must NOT fire any Tier 1 trigger (baseline preserved). The orchestrator + route + harness extension are part of M1-CP4e (Critical-tier session under PR6 + AC5; the route amendment touches the R20a perimeter and adds a new env var per ADR-008 §4). The ADR amendment itself is the documentation surface within the Critical session (governance-tier inside the Critical perimeter). Module update + orchestrator extension + route amendment + harness extension are split into Sub-session M1-CP4e-A (modules + ADRs + harness — no deploy) and Sub-session M1-CP4e-B (deployment under Critical Change Protocol) per the founder-confirmed split at session midpoint.

---

*End of ADR-006 (draft).*
