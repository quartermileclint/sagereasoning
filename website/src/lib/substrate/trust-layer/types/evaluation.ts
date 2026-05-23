/**
 * PORTED — verbatim mirror of /trust-layer/types/evaluation.ts
 *
 * Source of truth: /trust-layer/types/evaluation.ts (built 3 April 2026).
 * Ported into website/src/lib/substrate/trust-layer/ on 2026-05-15 under
 * D-ATL-WRAPPER-WIRED-VERIFIED-2026-05-15 (the ATL Wrapper build — spec step 5).
 * See ./accreditation.ts banner for why the 5-file closure is ported.
 *
 * KEEP IN SYNC: if /trust-layer/types/evaluation.ts changes, re-port it here in
 *   the same change. Everything below the banner is a VERBATIM copy.
 * ===========================================================================
 */

/**
 * evaluation.ts — Types for the Rolling Evaluation Window
 *
 * The evaluation window aggregates the last N evaluated actions
 * into running proximity levels, dimension scores, and direction
 * of travel.
 *
 * Derived from:
 *   reasoning-receipt.ts — ReasoningReceipt (individual evaluation trace)
 *   deliberation.ts      — compareProximity(), calculateDirectionOfTravel()
 *   scoring.json         — 4-stage evaluation sequence
 *   progress.json        — 4 progress dimensions, Senecan grades
 *
 * Rules:
 *   R4:  Window aggregation is internal — only the 5 reported levels are exposed
 *   R6c: Qualitative levels only — no numeric averages
 */

import type {
  KatorthomaProximityLevel,
  DimensionLevel,
  DimensionScores,
  DirectionOfTravel,
  RootPassionId,
  PersistingPassion,
  ProgressDimensionId,
} from './accreditation'

// ============================================================================
// EVALUATED ACTION — a single entry in the rolling window
// ============================================================================

/**
 * A compact representation of a single evaluated action.
 * Derived from a ReasoningReceipt but stripped to what the
 * window aggregator needs.
 */
export type EvaluatedAction = {
  /** Receipt ID linking back to full reasoning trace */
  readonly receipt_id: string

  /** Agent that performed this action */
  readonly agent_id: string

  /** When this action was evaluated */
  readonly evaluated_at: string

  /** Proximity level from the 4-stage evaluation */
  readonly proximity: KatorthomaProximityLevel

  /** Whether the action was deemed appropriate */
  readonly is_kathekon: boolean

  /** Quality of the kathekon assessment. Per D-ATL-KATHEKON-ALIGNED-ALTERNATIVE-
   *  BUILD-WIRED-VERIFIED-2026-05-16 §"Decision B", this now references the
   *  named KathekonQuality alias (defined below) — type-equivalent to the prior
   *  inline literal; the alias exists so WindowSnapshot.typical_kathekon_quality
   *  + AccreditationRecord.typical_kathekon_quality can share the same name. The
   *  alias is re-declared inside trust-layer/ rather than imported from
   *  layer2-mechanisms.ts (the established self-containment pattern noted in
   *  ../types/accreditation.ts banner). */
  readonly kathekon_quality: KathekonQuality

  /** Passions detected during evaluation */
  readonly passions_detected: {
    readonly root_passion: RootPassionId
    readonly sub_species: string
  }[]

  /** Virtue domains engaged in this action */
  readonly virtue_domains_engaged: string[]

  /** Whether oikeiosis obligations were met */
  readonly oikeiosis_met: boolean | null

  /** Which oikeiosis stage was relevant (if any) */
  readonly oikeiosis_stage: string | null

  /** Ruling faculty state description */
  readonly ruling_faculty_state: string

  /** Which skill produced this evaluation */
  readonly skill_id: string

  /** How many candidate decisions the wrapper considered before committing to
   *  this one — the deliberation_breadth signal source. Wrapper-supplied (no
   *  agent-declared fallback): the wrapper KNOWS whether it intuited (1),
   *  deliberated (2), or multi-branch deliberated (≥3) on this decision. Layer
   *  2 stays idempotent — this signal cannot live on Layer2Assessment.
   *  See deriveDeliberationBreadth() below for the enum derivation; see
   *  D-ATL-ITEMS-1-3-DESIGN-LOCKED-2026-05-16 §"Decision A". */
  readonly candidates_considered: number

  // ==========================================================================
  // PASS-THROUGH FIELDS — enterprise-accountability metadata (Decisions A, D, E, F)
  // Added 2026-05-17 under D-PASS-THROUGH-FIELDS-LOCKED-2026-05-17. All fields
  // optional with sensible defaults; backward-compatible with existing
  // substrate consumers (ATL Wrapper, kathekon-aligned scorer, hand-back
  // report) that produce EvaluatedAction values without these fields. The
  // substrate validates the enum values and persists them; it does NOT
  // interpret them for Layer 1/2/3 reasoning. Downstream consumers (Option C
  // tiered billing once activated; enterprise procurement reviewers reading
  // the AccreditationPayload; the A10 credential surface at session #5;
  // future MCP integrations per R18c) read these fields for audit,
  // compliance, and tiered-billing decisions. PR15-bias-toward-existing
  // infrastructure honoured: extends the existing EvaluatedAction shape
  // rather than introducing a sidecar type.
  // ==========================================================================

  /** Optional pass-through metadata; wrapper-supplied; default 'unknown'.
   *  Substrate does not interpret for Layer 1/2/3 reasoning. Used by
   *  downstream consumers (Option C tiered billing; AccreditationPayload
   *  enterprise readability; A10 credential scoping). Added 2026-05-17
   *  under D-PASS-THROUGH-FIELDS-LOCKED-2026-05-17 §"Decision A". */
  readonly operation_class?: OperationClass

  /** Optional pass-through metadata; wrapper-supplied; default 'none'.
   *  Substrate does not interpret. Used by downstream consumers for
   *  vendor-level aggregation + procurement readability. Added 2026-05-17
   *  under D-PASS-THROUGH-FIELDS-LOCKED-2026-05-17 §"Decision D". */
  readonly target_system_vendor?: TargetSystemVendor

  /** Optional sub-system detail (free-form); wrapper-supplied; no default.
   *  Substrate does not validate beyond length cap (100 chars; see
   *  pass-through-fields validator). Wrappers SHOULD NOT put PII in this
   *  field — it is structural sub-system identification only (e.g.,
   *  'opportunities', 'outlook.calendar', 'change_requests'). Added
   *  2026-05-17 under D-PASS-THROUGH-FIELDS-LOCKED-2026-05-17 §"Decision D". */
  readonly target_system_detail?: string

  /** Optional pass-through metadata; wrapper-supplied; default 'self_reported'.
   *  Substrate does not enforce verification; field describes wrapper's
   *  verification posture. R9 primary engagement — the verification posture
   *  is exactly where R9's "evaluates reasoning quality, does not promise
   *  outcomes" lives; the field describes the verification claim, not the
   *  actual outcome. Added 2026-05-17 under D-PASS-THROUGH-FIELDS-LOCKED-
   *  2026-05-17 §"Decision E". */
  readonly outcome_verification?: OutcomeVerification

  /** Optional pass-through metadata; wrapper-supplied; default 'unknown'.
   *  Substrate does not interpret for Layer 1/2/3 reasoning. Used by
   *  downstream consumers for risk assessment + cost-aware decisioning.
   *  Adjacent to R20a (a future session may elect to derive R20a's
   *  risk_class from (operation_class, reversibility_signal,
   *  outcome_verification) — deferred under PR7). Added 2026-05-17 under
   *  D-PASS-THROUGH-FIELDS-LOCKED-2026-05-17 §"Decision F". */
  readonly reversibility_signal?: ReversibilitySignal
}

// ============================================================================
// PASS-THROUGH FIELD ENUMS — Decisions A, B, C, D, E, F
// ============================================================================
//
// Six enum types supporting the EvaluatedAction pass-through fields above
// (Decisions A + D + E + F) and the CarriedProfile pass-through fields in
// /website/src/lib/substrate/sage-assent-wrapper.ts (Decisions B + C). All six
// vocabularies are taken VERBATIM from the Nate B Jones SaaS Renewal Agent
// License Prompt Kit — Agent System Touch Map (/inbox/20260508-262-promptkit-
// 1.md). Adopted 2026-05-17 under D-PASS-THROUGH-FIELDS-LOCKED-2026-05-17;
// implemented in this build under D-PASS-THROUGH-FIELDS-BUILD-WIRED-VERIFIED-
// 2026-05-17. Validator helpers live at /website/src/lib/substrate/trust-
// layer/validation/pass-through-fields.ts (the soft-fallback + length-cap
// semantics are documented there).
// ============================================================================

/**
 * Decision A — operation taxonomy. Answers "what kind of action is the agent
 * taking?" — the gating question for every downstream accountability
 * assessment. Tiered billing (Option C, deferred under PR7) requires this
 * field exist before it can fire.
 *
 * 9 prompt-kit values + 1 'unknown' default (10-value enum). The 'unknown'
 * value is the conservative no-evidence-yet baseline AND the honest-reporting
 * choice for wrappers that genuinely don't know the class.
 */
export type OperationClass =
  | 'read'
  | 'search'
  | 'summarize'
  | 'draft'
  | 'recommend'
  | 'write'
  | 'approve'
  | 'execute'
  | 'delete'
  | 'unknown'

/**
 * Decision B — identity-model attribution. Answers "on whose behalf does the
 * agent act?" — the foundational accountability question. Lands on
 * CarriedProfile (not EvaluatedAction) because identity model holds across
 * an agent's operational posture, not per single action.
 *
 * 7 prompt-kit values + 'unknown' default (8-value enum).
 */
export type DownstreamIdentityModel =
  | 'delegated_user'
  | 'service_account'
  | 'vendor_framework'
  | 'api_key'
  | 'browser_session'
  | 'mcp_server'
  | 'unknown'

/**
 * Decision C — access-path-status (the 🟢🟡🔴 flag from the Agent System
 * Touch Map). Answers "how does the agent reach the target system?".
 * Lands on CarriedProfile (not EvaluatedAction) because path posture holds
 * across an agent's operational posture.
 *
 * 4 prompt-kit values (no 'unknown'); default 'ambiguous' (matches the
 * prompt-kit's "do not invent specific licensing status; flag as ambiguous
 * rather than guessing" guardrail).
 */
export type PathPosture =
  | 'endorsed'
  | 'open_api'
  | 'ambiguous'
  | 'unsanctioned'

/**
 * Decision D — target-system vendor enumeration. Answers "what system does
 * the action affect?" — the vendor enumeration procurement reviews use.
 *
 * 8 canonical prompt-kit vendors + 'other' (for target systems not in the
 * canonical 8 — e.g., vertical-specific platforms, internal company
 * systems) + 'none' default (the action doesn't affect any external system
 * — e.g., internal reasoning, drafts never sent).
 *
 * Paired with EvaluatedAction.target_system_detail (free-form sub-system
 * granularity).
 */
export type TargetSystemVendor =
  | 'salesforce'
  | 'microsoft'
  | 'servicenow'
  | 'sap'
  | 'workday'
  | 'zendesk'
  | 'hubspot'
  | 'atlassian'
  | 'other'
  | 'none'

/**
 * Decision E — outcome-verification posture. Answers "how will the agent
 * know if the action succeeded?". R9 primary engagement — describes the
 * verification claim, not the actual outcome.
 *
 * 4 values; default 'self_reported' (the most honest baseline; downstream
 * consumers know to weight self-reported claims as agent-asserted).
 * 'external_auditor' is included to support a future use case where a
 * third-party verifier confirms the action (forward-looking compatibility
 * at the cost of one extra enum value).
 */
export type OutcomeVerification =
  | 'self_reported'
  | 'system_confirmed'
  | 'external_auditor'
  | 'not_applicable'

/**
 * Decision F — reversibility signal. Answers "can the action be undone?"
 * — the buyer's risk-model question. Adjacent to R20a (a future session
 * may elect to derive R20a's risk_class from (operation_class,
 * reversibility_signal, outcome_verification) — deferred under PR7).
 *
 * 4 values + 'unknown' default. 'partially_reversible' captures the real
 * "you can recover but it'll cost you" middle ground (e.g., 'unsend' an
 * email by sending a follow-up — original message has been seen).
 */
export type ReversibilitySignal =
  | 'reversible'
  | 'partially_reversible'
  | 'irreversible'
  | 'unknown'

// ============================================================================
// KATHEKON QUALITY — alias re-declared inside trust-layer/ (self-contained)
// ============================================================================

/**
 * The kathekon-quality bucket — whether each evaluated action was the
 * appropriate-in-the-circumstances fitting act ('strong' / 'moderate' /
 * 'marginal' / 'contrary'). Carried per-action on EvaluatedAction.kathekon_-
 * quality; aggregated across the window via computeTypicalKathekonQuality;
 * surfaced as the R18a-honest observable credential on AccreditationRecord.
 * typical_kathekon_quality + AccreditationPayload.typical_kathekon_quality.
 *
 * The canonical type lives at /website/src/lib/translation-sandwich/layer2-
 * mechanisms.ts (`KathekonQuality`). It is re-declared here — type-equivalent
 * — rather than imported across the trust-layer self-containment boundary
 * (the same pattern the ported KatorthomaProximityLevel + SenecanGradeId +
 * DimensionLevel + ... use; see ../types/accreditation.ts banner). KEEP IN
 * SYNC: if /website/src/lib/translation-sandwich/layer2-mechanisms.ts changes
 * the KathekonQuality domain, re-port it here in the same change.
 *
 * Added 2026-05-16 under D-ATL-KATHEKON-ALIGNED-ALTERNATIVE-BUILD-WIRED-
 * VERIFIED-2026-05-16 §"Decision B" (the kathekon-aligned alternative build —
 * step 6 of the post-6b arc; parallels Decision A of the items 1-3 build).
 */
export type KathekonQuality = 'strong' | 'moderate' | 'marginal' | 'contrary'

// ============================================================================
// DELIBERATION BREADTH — derived from EvaluatedAction.candidates_considered
// ============================================================================

/**
 * The deliberation-breadth bucket — the carried profile's R0-relevant signal
 * about HOW the agent reached this decision (intuited / deliberated /
 * multi-branch deliberated). Derived at aggregation time from
 * EvaluatedAction.candidates_considered (the raw number is the source of
 * truth; the enum is the qualitative bucket).
 *
 * Per D-ATL-ITEMS-1-3-DESIGN-LOCKED-2026-05-16 §"Decision A" (items 1-3 design
 * pass). The thresholds are tunable later without data migration — the raw
 * number stays on EvaluatedAction.
 */
export type DeliberationBreadth =
  | 'intuited'
  | 'deliberated'
  | 'multi_branch_deliberated'

/** Threshold: N ≥ DELIBERATED_THRESHOLD → at least 'deliberated'. */
export const DELIBERATED_THRESHOLD = 2 as const

/** Threshold: N ≥ MULTI_BRANCH_THRESHOLD → 'multi_branch_deliberated'. */
export const MULTI_BRANCH_THRESHOLD = 3 as const

/**
 * Derive the DeliberationBreadth bucket from a candidates_considered count.
 *
 *   N = 1                          → 'intuited'
 *   N = 2 (i.e. DELIBERATED..)     → 'deliberated'
 *   N ≥ 3 (i.e. MULTI_BRANCH..)    → 'multi_branch_deliberated'
 *
 * Defensive on zero / negative inputs — treated as 'intuited' (the conservative
 * no-evidence-yet baseline; pairs with the createAccreditationRecord seed
 * default). Pure, deterministic, no I/O.
 */
export function deriveDeliberationBreadth(
  candidatesConsidered: number
): DeliberationBreadth {
  if (candidatesConsidered >= MULTI_BRANCH_THRESHOLD) return 'multi_branch_deliberated'
  if (candidatesConsidered >= DELIBERATED_THRESHOLD) return 'deliberated'
  return 'intuited'
}

// ============================================================================
// WINDOW CONFIGURATION
// ============================================================================

/**
 * Configuration for the rolling evaluation window.
 */
export type WindowConfig = {
  /** Number of recent actions in the window (default: 100) */
  readonly window_size: number

  /** How often to check for grade transitions (default: every 20 actions) */
  readonly grade_check_interval: number

  /** Minimum actions required before computing a grade */
  readonly minimum_actions_for_grade: number

  /** Threshold: what percentage of actions must be at a proximity level
   *  for the agent to be considered "typically" at that level */
  readonly typical_proximity_threshold: number

  /** Threshold: percentage of actions at a dimension level to earn it */
  readonly dimension_level_threshold: number

  /** Maximum number of unchosen-but-still-live candidates retained on
   *  CarriedProfile.carried_candidates (default: 5). Per D-ATL-ITEMS-1-3-
   *  DESIGN-LOCKED-2026-05-16 §"Decision D" — the agent-overridable top-K cap.
   *  Surfaced on WindowConfig so it threads through CarriedProfile via the
   *  existing window_config carriage; createCarriedProfile reads it from the
   *  caller-supplied (or defaulted) config. */
  readonly carried_candidates_max: number
}

/** Default window configuration per framework doc */
export const DEFAULT_WINDOW_CONFIG: WindowConfig = {
  window_size: 100,
  grade_check_interval: 20,
  minimum_actions_for_grade: 20,
  typical_proximity_threshold: 0.6,   // 60% of actions at or above level
  dimension_level_threshold: 0.5,     // 50% of actions demonstrating this level
  carried_candidates_max: 5,          // Decision D default; agent-overridable
}

// ============================================================================
// WINDOW SNAPSHOT — the aggregated state at a point in time
// ============================================================================

/**
 * A snapshot of the rolling evaluation window at a point in time.
 * This is what the grade transition engine consumes.
 */
export type WindowSnapshot = {
  /** Agent this window belongs to */
  readonly agent_id: string

  /** When this snapshot was computed */
  readonly computed_at: string

  /** Number of actions currently in the window */
  readonly actions_in_window: number

  /** Total actions evaluated (lifetime) */
  readonly total_actions_evaluated: number

  /** Distribution of proximity levels across the window */
  readonly proximity_distribution: Record<KatorthomaProximityLevel, number>

  /** The typical (most common qualifying) proximity level */
  readonly typical_proximity: KatorthomaProximityLevel

  /** Dimension levels computed from the window */
  readonly dimension_levels: DimensionScores

  /** Direction of travel computed from recent trajectory */
  readonly direction_of_travel: DirectionOfTravel

  /** Passions that persist across the window */
  readonly persisting_passions: PersistingPassion[]

  /** Kathekon compliance rate (percentage of actions deemed appropriate) */
  readonly kathekon_compliance_rate: number

  /** Average virtue domain engagement breadth */
  readonly virtue_breadth: number

  /** The ordered proximity trajectory (last N actions) */
  readonly proximity_trajectory: KatorthomaProximityLevel[]

  /** Per-dimension detail for diagnostic purposes */
  readonly dimension_detail: Record<ProgressDimensionId, DimensionDetail>

  /** Distribution of deliberation-breadth buckets across the window — derived
   *  from each EvaluatedAction's candidates_considered via
   *  deriveDeliberationBreadth(). Mirrors proximity_distribution. Per
   *  D-ATL-ITEMS-1-3-DESIGN-LOCKED-2026-05-16 §"Decision A". */
  readonly deliberation_breadth_distribution: Record<DeliberationBreadth, number>

  /** The typical (most common qualifying) deliberation-breadth bucket — the
   *  R18a-honest observable credential the badge surfaces. Mirrors
   *  typical_proximity (most common qualifying level). */
  readonly typical_deliberation_breadth: DeliberationBreadth

  /** Distribution of kathekon-quality buckets across the window — counts each
   *  EvaluatedAction's kathekon_quality (already on the per-action shape via
   *  the existing bridge). Mirrors proximity_distribution + deliberation_-
   *  breadth_distribution. Per D-ATL-KATHEKON-ALIGNED-ALTERNATIVE-BUILD-WIRED-
   *  VERIFIED-2026-05-16 §"Decision B". */
  readonly kathekon_quality_distribution: Record<KathekonQuality, number>

  /** The typical (most-common-qualifying) kathekon-quality bucket — the
   *  R18a-honest observable credential parallel to typical_deliberation_breadth.
   *  Same threshold convention as typical_proximity: highest bucket whose
   *  cumulative at-or-above share meets WindowConfig.typical_proximity_threshold.
   *  Conservative-baseline default 'contrary' when no actions qualify (matches
   *  the empty-window aggregation; the deliberation-breadth equivalent uses
   *  'intuited' as its baseline). Per D-ATL-KATHEKON-ALIGNED-ALTERNATIVE-BUILD-
   *  WIRED-VERIFIED-2026-05-16 §"Decision B". */
  readonly typical_kathekon_quality: KathekonQuality
}

/**
 * Detailed breakdown for a single progress dimension.
 * Used internally for grade transition decisions.
 */
export type DimensionDetail = {
  readonly dimension_id: ProgressDimensionId
  readonly level: DimensionLevel
  /** What percentage of window actions support this level */
  readonly confidence: number
  /** Trend within this dimension specifically */
  readonly trend: DirectionOfTravel
  /** Key indicators observed */
  readonly indicators: string[]
}
