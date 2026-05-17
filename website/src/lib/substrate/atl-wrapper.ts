/**
 * atl-wrapper.ts — the Agent Trust Layer Wrapper (Components 1 + 4).
 *
 * STATUS: Scaffolded → Wired → Verified (2026-05-15, this session). New code,
 * imported by no route — no production exposure this session.
 *
 * GOVERNING DOCUMENTS:
 *   - /adopted/substrate-modes/agent-trust-layer-wrapper-spec.md — the spec
 *     (Adopted 2026-05-14). This module builds spec §"Component 1 — The Wrapper
 *     / carried-profile mechanism" and §"Component 4 — Trajectory awareness".
 *   - /operations/decision-log.md — D-ATL-WRAPPER-WIRED-VERIFIED-2026-05-15
 *     (this build; the Step 2 design-decision gate is recorded there).
 *   - /manifest.md §R4 (IP boundary) / §R17e (named as NOT applying to agent
 *     profiles — the load-bearing distinction from private mode) /
 *     §R18 a–e (the wrapper is the carried-profile mechanism the badge
 *     certifies) / §AC8 (translation-sandwich substrate).
 *
 * WHAT THIS MODULE IS
 *
 * The wrapper is to an agent what the private mentor is to a human — the
 * continuity-bearing relationship around the per-assessment substrate calls.
 * Each time a wrapped agent consults the substrate, the substrate returns a
 * signed Layer2Assessment. The wrapper:
 *
 *   1. maps the Layer2Assessment to an EvaluatedAction (via atl-bridge.ts),
 *   2. accumulates the EvaluatedAction into the agent's carried profile
 *      (Component 1), and
 *   3. aggregates the accumulated profile into trajectory awareness — a
 *      WindowSnapshot plus a grade transition (Component 4) — and produces the
 *      carried_profile payload to attach to the agent's next Layer 1 input.
 *
 * It consumes two already-Verified pieces and the ported /trust-layer/ closure:
 *   - atl-bridge.ts — mapLayer2AssessmentToEvaluatedAction (the bridge; the PR1
 *     single-endpoint proof of the substrate↔ATL pattern — this module is its
 *     next consumer).
 *   - ./trust-layer/ — the 5-file ported closure of computeWindowSnapshot +
 *     evaluateGradeTransition (the existing /trust-layer/ window/grade
 *     infrastructure, built 3 April 2026). Ported, not imported across the
 *     tsconfig boundary, per the founder's Step 2 election — see
 *     ./trust-layer/types/accreditation.ts banner.
 *
 * STORAGE — wrapper-side carriage, no server-side persistence (spec open
 * question 2; the founder confirmed this at the Step 2 gate). Every function
 * here is a pure transform over a CarriedProfile VALUE the caller holds. The
 * substrate holds no server-side agent-profile store — contrast private mode,
 * which is server-side encrypted. The badge's server persistence is spec
 * step 6, a later session.
 *
 * AGENT IDENTITY — agent_id is carried as a wrapper-supplied opaque string
 * (spec open question 8; founder-confirmed at the Step 2 gate). AUTHENTICATING
 * it is A10 (per-agent credentials), deferred. accumulate() forces the bridge
 * context's agent_id to the carried profile's, so an EvaluatedAction can never
 * be accumulated under a mismatched identity (a light gaming-defence touch).
 *
 * PURITY PROFILE (PR1 — this module is the bridge's next consumer; keep the
 * accumulator pure):
 *   - accumulate()                — PURE. No clock, no I/O, no randomness, no
 *                                   mutation. Returns a new CarriedProfile.
 *   - toCarriedProfilePayload()   — PURE given a supplied snapshot; reads the
 *     toProfileProvenancePayload()   clock only if it must compute its own
 *                                   snapshot (via the ported computeWindowSnapshot).
 *   - computeTrajectory()         — delegates to the ported computeWindowSnapshot
 *     createCarriedProfile()        + evaluateGradeTransition + createAccreditation-
 *                                   Record, which stamp ISO timestamps from the
 *                                   system clock (computed_at / updated_at /
 *                                   grade_since / created_at). This is the
 *                                   ported /trust-layer/ behaviour — see the
 *                                   ./trust-layer/ banners. These functions are
 *                                   deterministic in every field EXCEPT those
 *                                   ISO-timestamp fields; the test asserts
 *                                   determinism modulo timestamps.
 *
 * COMPLIANCE
 *   - R4 (IP boundary): the wrapper emits results — a CarriedProfile, a
 *     WindowSnapshot, a TransitionResult, the carried_profile payload. The
 *     grade-engine's UPGRADE/DOWNGRADE thresholds are module-private inside the
 *     ported grade-transition-engine.ts and are never returned.
 *   - R17e: does NOT apply to agent profiles. An agent's reasoning-pattern
 *     profile is not an intimate human vulnerability — R17e exists to protect
 *     humans (ATL Wrapper spec §"R-rule engagement"; the load-bearing
 *     distinction from private mode). This module applies no R17e filter.
 *   - R18 a–e: the carried profile + its WindowSnapshot are the substance the
 *     badge (Component 3, spec step 6) certifies.
 *   - AC8: this module sits in /website/src/lib/substrate/ and consumes the
 *     translation-sandwich Layer 2 output (via the bridge).
 *   - PR1: the bridge was the single-endpoint proof of the substrate↔ATL
 *     pattern; this wrapper is its next consumer — kept a pure, synchronous,
 *     deterministic accumulator + aggregator.
 *   - PR2: the test file (__tests__/atl-wrapper.test.ts) invokes every exported
 *     function in the same session this module is written.
 *   - PR4: N/A — no LLM call. The wrapper is deterministic plumbing.
 *   - PR10: the build follows the Plan → Execute → Verify loop; the Step 2
 *     design-decision gate was the Plan step.
 */

import {
  mapLayer2AssessmentToEvaluatedAction,
  type BridgeContext,
  type EvaluatedAction,
} from './atl-bridge'

import type { Layer2Assessment } from '../translation-sandwich/layer2-mechanisms'
import type { Layer1Schema } from '../translation-sandwich/layer1-extractor'

import { computeWindowSnapshot } from './trust-layer/evaluation-window/window-aggregator'
import {
  evaluateGradeTransition,
  type TransitionResult,
} from './trust-layer/grade-engine/grade-transition-engine'
import { createAccreditationRecord } from './trust-layer/accreditation/accreditation-record'
import {
  DEFAULT_WINDOW_CONFIG,
  type WindowConfig,
  type WindowSnapshot,
  type DownstreamIdentityModel,
  type PathPosture,
} from './trust-layer/types/evaluation'
import type {
  AccreditationRecord,
  SenecanGradeId,
  KatorthomaProximityLevel,
  DimensionScores,
} from './trust-layer/types/accreditation'

// Re-export the ported types the wrapper produces/consumes, so downstream ATL
// consumers (Component 3 the badge — spec step 6; Component 5 the iteration
// patterns — ATL Wrapper Session 6) import them from one place.
export type {
  EvaluatedAction,
  BridgeContext,
} from './atl-bridge'
export type {
  WindowSnapshot,
  WindowConfig,
  OperationClass,
  DownstreamIdentityModel,
  PathPosture,
  TargetSystemVendor,
  OutcomeVerification,
  ReversibilitySignal,
} from './trust-layer/types/evaluation'
export type {
  AccreditationRecord,
  SenecanGradeId,
  KatorthomaProximityLevel,
  DimensionScores,
} from './trust-layer/types/accreditation'
export type {
  TransitionResult,
  TransitionTrigger,
} from './trust-layer/grade-engine/grade-transition-engine'

// ============================================================================
// CARRIED PROFILE — the wrapper's accumulating state (Component 1)
// ============================================================================

/**
 * The agent's carried profile — the wrapper's accumulating state.
 *
 * This is the "carried profile" the ATL Wrapper spec describes: the wrapper
 * accumulating Layer 2 JSON outputs (each mapped to an EvaluatedAction) plus
 * the trajectory infrastructure the existing /trust-layer/ build needs to
 * aggregate them. The caller holds this value and threads it through the
 * agent's loop — wrapper-side carriage, no server persistence (spec open
 * question 2).
 *
 * Note: this is the wrapper's accumulating STATE. The shape the wrapper writes
 * into Layer1Schema.carried_profile is the separate CarriedProfilePayload
 * (below) — the trajectory snapshot, not this whole accumulating object.
 */
export interface CarriedProfile {
  /** The wrapped agent's identifier — a wrapper-supplied opaque string.
   *  Authenticating it is A10 (per-agent credentials), deferred. */
  readonly agent_id: string

  /** The accumulated EvaluatedActions, oldest first — the chronological order
   *  computeWindowSnapshot expects. Grows by one per accumulate() call. */
  readonly evaluated_actions: readonly EvaluatedAction[]

  /** Lifetime count of actions evaluated for this agent. Equals
   *  evaluated_actions.length until the rolling window would trim — kept
   *  separate because computeWindowSnapshot reports it independently of the
   *  in-window count. */
  readonly total_actions_evaluated: number

  /** The agent's current accreditation credential. Seeded by
   *  createCarriedProfile and advanced by computeTrajectory's grade
   *  transitions. evaluateGradeTransition needs a PRIOR record as input — the
   *  carried profile is where it lives. */
  readonly accreditation_record: AccreditationRecord

  /** Consecutive regressing grade-checks — the grade engine's downgrade
   *  hysteresis input. Maintained by computeTrajectory: a regressing snapshot
   *  increments it, any non-regressing snapshot resets it to 0, and a grade
   *  change (up or down) resets it (the hysteresis window restarts). */
  readonly regressing_check_count: number

  /** The rolling-window configuration in force for this agent. */
  readonly window_config: WindowConfig

  /** Unchosen-but-still-live candidates the agent considered in past parallel
   *  evaluations — the working set distinct from evaluated_actions[] (which
   *  records ONLY committed reasoning). Top-K capped (K from
   *  window_config.carried_candidates_max — default 5). Added 2026-05-16 under
   *  D-ATL-ITEMS-1-3-BUILD-WIRED-VERIFIED-2026-05-16 §"Decision B". The slot
   *  enables two use cases:
   *    1. Compare against new candidates in the next round (skip re-paying
   *       the substrate cost on options already evaluated).
   *    2. Revisit a sibling if the committed action fails downstream.
   *  carried_candidates does NOT feed grade transitions — only
   *  evaluated_actions[] does. The committed-record semantics are preserved. */
  readonly carried_candidates: readonly CarriedCandidate[]

  // ==========================================================================
  // PASS-THROUGH FIELDS — operational-posture metadata (Decisions B + C)
  // Added 2026-05-17 under D-PASS-THROUGH-FIELDS-LOCKED-2026-05-17. Both
  // fields optional with sensible defaults; backward-compatible with
  // existing wrappers that produce CarriedProfile values without these
  // fields. The substrate validates the enum values and persists them; it
  // does NOT interpret them for Layer 1/2/3 reasoning. Downstream
  // consumers (A10 credential scoping at session #5; AccreditationPayload
  // enterprise readability; future per-identity-model + per-path-posture
  // billing variants deferred under PR7) read these fields for
  // accountability attribution.
  //
  // Why on CarriedProfile and not on EvaluatedAction: identity model and
  // path posture are properties of the agent's operational posture across
  // actions, not properties of any single action. A CarriedProfile
  // typically spans many actions; these fields hold across them.
  //
  // Validator helpers live at /website/src/lib/substrate/trust-layer/
  // validation/pass-through-fields.ts (soft-fallback to default with
  // warning log; same posture as the EvaluatedAction-side validators).
  // ==========================================================================

  /** Optional pass-through metadata; wrapper-supplied; default 'unknown'.
   *  Substrate does not interpret for Layer 1/2/3 reasoning. Used by
   *  downstream consumers for accountability attribution (A10 credential
   *  scoping; AccreditationPayload enterprise readability). Per
   *  D-PASS-THROUGH-FIELDS-LOCKED-2026-05-17 §"Decision B". */
  readonly downstream_identity_model?: DownstreamIdentityModel

  /** Optional pass-through metadata; wrapper-supplied; default 'ambiguous'.
   *  Substrate does not enforce; field is observability for downstream
   *  consumers (including the wrapper itself for self-reporting in its
   *  own audit trails). Per D-PASS-THROUGH-FIELDS-LOCKED-2026-05-17
   *  §"Decision C". */
  readonly path_posture?: PathPosture
}

// ----------------------------------------------------------------------------
// CARRIED CANDIDATE — one unchosen-but-still-live candidate (Decision B)
// ----------------------------------------------------------------------------

/**
 * One unchosen-but-still-live candidate retained in
 * CarriedProfile.carried_candidates. Per Decision B of
 * D-ATL-ITEMS-1-3-DESIGN-LOCKED-2026-05-16: the slim-rich shape — enough to
 * compare or revisit, without the bloat of carrying a re-derivable Layer 3
 * rendering.
 *
 * Layer 3 (the agent-mode rendering) is omitted from the carry — it is
 * re-derivable via renderAgentMode(layer1_input + layer2_assessment), a pure
 * deterministic function with no LLM call. Avoids bloat.
 */
export interface CarriedCandidate {
  /** The substrate input that produced the assessment — replayable. */
  readonly layer1_input: Layer1Schema
  /** The substrate's response for this candidate — verbatim. */
  readonly layer2_assessment: Layer2Assessment
  /** 1-based rank from the parallel evaluation that surfaced this candidate
   *  (input order at the time of the parallel evaluation; not the post-prune
   *  rank). */
  readonly rank: number
  /** ISO 8601 timestamp of the parallel evaluation that surfaced this
   *  candidate (BridgeContext.evaluated_at of the originating step). */
  readonly considered_at: string
}

// ----------------------------------------------------------------------------
// Default starting state — a fresh wrapped agent with no onboarding history.
// ----------------------------------------------------------------------------

/** A fresh wrapped agent starts at reflexive / pre_progress with all four
 *  progress dimensions emerging — the honest "no evidence yet" baseline.
 *  Establishing a starting grade from a real 55-assessment onboarding run is
 *  spec open question 7, deferred. The caller may override via
 *  CreateCarriedProfileOptions. */
const DEFAULT_STARTING_PROXIMITY: KatorthomaProximityLevel = 'reflexive'
const DEFAULT_STARTING_GRADE: SenecanGradeId = 'pre_progress'
const DEFAULT_STARTING_DIMENSIONS: DimensionScores = {
  passion_reduction: 'emerging',
  judgement_quality: 'emerging',
  disposition_stability: 'emerging',
  oikeiosis_extension: 'emerging',
}

/** Optional overrides for createCarriedProfile. */
export interface CreateCarriedProfileOptions {
  /** Override the rolling-window configuration (default: DEFAULT_WINDOW_CONFIG). */
  readonly window_config?: WindowConfig
  /** Override the starting Senecan grade (default: pre_progress). */
  readonly starting_grade?: SenecanGradeId
  /** Override the starting typical proximity (default: reflexive). */
  readonly starting_proximity?: KatorthomaProximityLevel
  /** Override the starting dimension levels (default: all emerging). */
  readonly starting_dimensions?: DimensionScores
}

/**
 * Create an empty carried profile for a freshly wrapped agent.
 *
 * Seeds the accreditation credential via the ported createAccreditationRecord.
 * NOT pure — createAccreditationRecord stamps created_at / updated_at /
 * grade_since / expires_at from the system clock (the ported /trust-layer/
 * behaviour). This is a one-time seed, analogous to the bridge taking
 * evaluated_at from outside.
 *
 * @throws if agent_id is empty or whitespace — an empty identifier would
 *         produce a meaningless verification_url and an un-attributable
 *         profile. agent_id is otherwise treated as an opaque string (no
 *         format enforcement — authenticating it is A10, deferred).
 */
export function createCarriedProfile(
  agent_id: string,
  options: CreateCarriedProfileOptions = {}
): CarriedProfile {
  if (!agent_id || agent_id.trim() === '') {
    throw new Error(
      'createCarriedProfile: agent_id must be a non-empty string. ' +
        'It is a wrapper-supplied opaque identifier for the wrapped agent.'
    )
  }

  const accreditation_record = createAccreditationRecord({
    agent_id,
    starting_grade: options.starting_grade ?? DEFAULT_STARTING_GRADE,
    starting_proximity: options.starting_proximity ?? DEFAULT_STARTING_PROXIMITY,
    starting_dimensions:
      options.starting_dimensions ?? DEFAULT_STARTING_DIMENSIONS,
    window_size: (options.window_config ?? DEFAULT_WINDOW_CONFIG).window_size,
  })

  return {
    agent_id,
    evaluated_actions: [],
    total_actions_evaluated: 0,
    accreditation_record,
    regressing_check_count: 0,
    window_config: options.window_config ?? DEFAULT_WINDOW_CONFIG,
    // Decision B (D-ATL-ITEMS-1-3-BUILD-WIRED-VERIFIED-2026-05-16) — empty
    // working set at fresh-agent creation.
    carried_candidates: [],
  }
}

// ============================================================================
// COMPONENT 1 — accumulate: map a substrate consultation into the profile
// ============================================================================

/**
 * Accumulate one substrate consultation into the carried profile.
 *
 * Maps the Layer2Assessment to an EvaluatedAction via the bridge
 * (mapLayer2AssessmentToEvaluatedAction), appends it to the carried profile's
 * accumulating list, and increments the lifetime count. Returns a NEW
 * CarriedProfile — the input is never mutated.
 *
 * PURE: no clock read, no I/O, no randomness. The bridge takes its timestamp
 * (evaluated_at) from the supplied BridgeContext, so the whole accumulate path
 * is deterministic.
 *
 * The bridge context's agent_id is FORCED to the carried profile's agent_id —
 * the carried profile is the authority on the wrapped agent's identity, so an
 * EvaluatedAction can never enter the profile under a mismatched identity. The
 * caller still supplies evaluated_at / skill_id / signature on the context.
 */
export function accumulate(
  profile: CarriedProfile,
  assessment: Layer2Assessment,
  context: BridgeContext
): CarriedProfile {
  const action = mapLayer2AssessmentToEvaluatedAction(assessment, {
    ...context,
    agent_id: profile.agent_id,
  })

  return {
    ...profile,
    evaluated_actions: [...profile.evaluated_actions, action],
    total_actions_evaluated: profile.total_actions_evaluated + 1,
  }
}

// ============================================================================
// COMPONENT 4 — trajectory awareness: aggregate + grade
// ============================================================================

/**
 * The result of one trajectory computation — Component 4.
 */
export interface TrajectoryResult {
  /** The aggregated WindowSnapshot over the accumulated EvaluatedActions. */
  readonly snapshot: WindowSnapshot

  /** The grade-transition result computed from the snapshot + the carried
   *  profile's prior accreditation record. transition.record is the
   *  (possibly upgraded / downgraded) credential; transition.trigger is
   *  non-null when a grade actually changed. */
  readonly transition: TransitionResult

  /** The carried profile advanced by this trajectory computation: its
   *  accreditation_record is set to transition.record, and its
   *  regressing_check_count is advanced (see CarriedProfile.regressing_check_-
   *  count). evaluated_actions / total_actions_evaluated are unchanged —
   *  computeTrajectory aggregates, it does not accumulate. */
  readonly profile: CarriedProfile
}

/**
 * Compute trajectory awareness over the carried profile — Component 4.
 *
 * Drives the two ported /trust-layer/ functions:
 *   1. computeWindowSnapshot — aggregates the accumulated EvaluatedAction[]
 *      into a WindowSnapshot (proximity distribution, typical proximity,
 *      direction of travel, the four dimension levels, persisting passions,
 *      kathekon rate, virtue breadth, the ordered proximity trajectory).
 *   2. evaluateGradeTransition — evaluates the snapshot against the carried
 *      profile's prior accreditation record, with the regressing-check-count
 *      hysteresis input, producing the (possibly changed) credential.
 *
 * One computeTrajectory call IS one "grade check" for hysteresis purposes. The
 * wrapper does not impose a cadence — the caller (or Component 5, the iteration
 * patterns) decides how often to run a trajectory computation; window_config
 * .grade_check_interval is carried for that future use but not enforced here.
 *
 * NOT pure — the ported computeWindowSnapshot + evaluateGradeTransition stamp
 * ISO timestamps (computed_at / updated_at / grade_since) from the system
 * clock. Deterministic in every other field. See the module header's
 * PURITY PROFILE.
 */
export function computeTrajectory(profile: CarriedProfile): TrajectoryResult {
  const snapshot = computeWindowSnapshot(
    profile.agent_id,
    [...profile.evaluated_actions],
    profile.total_actions_evaluated,
    profile.window_config
  )

  const transition = evaluateGradeTransition(
    profile.accreditation_record,
    snapshot,
    profile.regressing_check_count
  )

  // Maintain the downgrade-hysteresis counter. A grade change (up or down)
  // restarts the hysteresis window; a regressing snapshot extends the streak;
  // any non-regressing snapshot breaks it.
  const nextRegressingCount = transition.grade_changed
    ? 0
    : snapshot.direction_of_travel === 'regressing'
      ? profile.regressing_check_count + 1
      : 0

  const advancedProfile: CarriedProfile = {
    ...profile,
    accreditation_record: transition.record,
    regressing_check_count: nextRegressingCount,
  }

  return { snapshot, transition, profile: advancedProfile }
}

// ============================================================================
// COMPONENT 1 — the carried_profile payload for the next Layer1Schema input
// ============================================================================

/** Schema tag for the carried_profile payload — lets a Layer 2 consumer
 *  recognise the wrapper's payload shape and version it independently. */
export const CARRIED_PROFILE_PAYLOAD_SCHEMA = 'atl-carried-profile-v1' as const

/** Schema tag for the profile_provenance payload. */
export const PROFILE_PROVENANCE_PAYLOAD_SCHEMA = 'atl-profile-provenance-v1' as const

/**
 * The payload the wrapper writes into the agent's next Layer1Schema.carried_-
 * profile field.
 *
 * Per the founder's Step 2 election: the payload carries the aggregated
 * WindowSnapshot — the agent's trajectory in aggregated form — NOT the raw
 * EvaluatedAction[]. The snapshot is bounded in size and is exactly what
 * trajectory-aware Layer 2 assessment needs; the raw action list grows without
 * bound. The grade + typical proximity are surfaced alongside for a Layer 2
 * consumer that wants the headline without reading into the snapshot.
 *
 * This is a plain, JSON-serialisable object — it round-trips through
 * Layer1Schema's permissive carried_profile field (typed CarriedProfile =
 * Record<string, unknown> | null in layer1-extractor.ts) and validateLayer1-
 * Schema's assertObject check.
 */
export interface CarriedProfilePayload {
  readonly schema: typeof CARRIED_PROFILE_PAYLOAD_SCHEMA
  readonly agent_id: string
  /** The aggregated trajectory — the founder-elected payload shape. */
  readonly window_snapshot: WindowSnapshot
  /** The agent's current Senecan grade (headline, mirrored from the snapshot's
   *  governing accreditation record). */
  readonly senecan_grade: SenecanGradeId
  /** The agent's typical proximity level (headline). */
  readonly typical_proximity: KatorthomaProximityLevel
  /** Lifetime count of actions evaluated for this agent. */
  readonly total_actions_evaluated: number
}

// ============================================================================
// CARRIED-CANDIDATES PAYLOAD — Decision B (Layer 1 schema-version bump)
// ============================================================================

/** Schema tag for the carried_candidates Layer 1 payload — versions the field
 *  independently. Added 2026-05-16 under D-ATL-ITEMS-1-3-BUILD-WIRED-VERIFIED-
 *  2026-05-16 §"Decision B". */
export const CARRIED_CANDIDATES_PAYLOAD_SCHEMA = 'atl-carried-candidates-v1' as const

/**
 * The wrapper's working-set payload — projected into Layer1Schema.carried_candidates
 * via toCarriedCandidatesPayload(). Distinct from the carried_profile payload:
 * the carried_profile carries the COMMITTED-reasoning trajectory; this carries
 * unchosen-but-still-live candidates the agent retained for revisit / comparison.
 *
 * Plain, JSON-serialisable — round-trips through Layer1Schema.carried_candidates
 * (typed Record<string, unknown>[] | null) and validateLayer1Schema's per-entry
 * assertObject check.
 */
export interface CarriedCandidatesPayload {
  readonly schema: typeof CARRIED_CANDIDATES_PAYLOAD_SCHEMA
  readonly agent_id: string
  readonly candidates: readonly CarriedCandidate[]
}

/**
 * The profile_provenance payload — the Layer 1 gaming-defence attestation that
 * the carried profile came from the agent's OWN prior substrate assessments,
 * not injected third-party content (ATL Wrapper spec §"Layer 1 implications").
 *
 * Each accumulated EvaluatedAction's receipt_id is derived (in the bridge) from
 * a signed Layer2Assessment's Ed25519 signature — so the receipt_id_chain is a
 * tamper-evident ledger of the assessments that built this profile. CRYPTO-
 * GRAPHICALLY VERIFYING the chain (re-checking each signature) is deferred — it
 * needs the agent-identity mechanism (A10, spec open question 8). This session
 * produces the attestation; verifying it is later work.
 */
export interface ProfileProvenancePayload {
  readonly schema: typeof PROFILE_PROVENANCE_PAYLOAD_SCHEMA
  readonly source: 'own_prior_substrate_assessments'
  readonly accumulated_action_count: number
  /** The ordered receipt_ids of every accumulated EvaluatedAction — each
   *  derived (in the bridge) from a signed Layer2Assessment's signature. */
  readonly receipt_id_chain: string[]
}

/**
 * Build the carried_profile payload for the agent's next Layer 1 input.
 *
 * Pass the snapshot from a prior computeTrajectory call to avoid recomputing
 * it; if omitted, this computes its own snapshot (which reads the clock for
 * the snapshot's computed_at — see the module header's PURITY PROFILE).
 *
 * The grade + typical proximity are read from profile.accreditation_record —
 * so call this AFTER threading computeTrajectory's advanced profile back in,
 * to carry the post-transition grade.
 */
export function toCarriedProfilePayload(
  profile: CarriedProfile,
  snapshot?: WindowSnapshot
): CarriedProfilePayload {
  const window_snapshot =
    snapshot ??
    computeWindowSnapshot(
      profile.agent_id,
      [...profile.evaluated_actions],
      profile.total_actions_evaluated,
      profile.window_config
    )

  return {
    schema: CARRIED_PROFILE_PAYLOAD_SCHEMA,
    agent_id: profile.agent_id,
    window_snapshot,
    senecan_grade: profile.accreditation_record.senecan_grade,
    typical_proximity: profile.accreditation_record.typical_proximity,
    total_actions_evaluated: profile.total_actions_evaluated,
  }
}

/**
 * Build the profile_provenance payload for the agent's next Layer 1 input.
 *
 * PURE — reads only the accumulated actions already in the carried profile.
 */
export function toProfileProvenancePayload(
  profile: CarriedProfile
): ProfileProvenancePayload {
  return {
    schema: PROFILE_PROVENANCE_PAYLOAD_SCHEMA,
    source: 'own_prior_substrate_assessments',
    accumulated_action_count: profile.evaluated_actions.length,
    receipt_id_chain: profile.evaluated_actions.map((a) => a.receipt_id),
  }
}

/**
 * Build the carried_candidates payload for the agent's next Layer 1 input —
 * Decision B (D-ATL-ITEMS-1-3-BUILD-WIRED-VERIFIED-2026-05-16). The wrapper's
 * working set of unchosen-but-still-live candidates is projected into
 * Layer1Schema.carried_candidates so Layer 2 can see what the agent is still
 * holding under consideration.
 *
 * PURE — reads only the carried profile's existing carried_candidates slot.
 */
export function toCarriedCandidatesPayload(
  profile: CarriedProfile
): CarriedCandidatesPayload {
  return {
    schema: CARRIED_CANDIDATES_PAYLOAD_SCHEMA,
    agent_id: profile.agent_id,
    candidates: profile.carried_candidates,
  }
}
