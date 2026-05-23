/**
 * sage-assent-iteration-patterns.ts — the Agent Trust Layer Wrapper, Component 5:
 * the three iteration patterns (sequential loop / parallel evaluation /
 * multi-agent orchestration).
 *
 * STATUS: Scaffolded → Wired → Verified (2026-05-15, this session). New code,
 * imported by no route — no production exposure this session.
 *
 * GOVERNING DOCUMENTS:
 *   - /adopted/substrate-modes/agent-trust-layer-wrapper-spec.md — the spec
 *     (Adopted 2026-05-14). This module builds spec §"Component 5 — The three
 *     iteration patterns" and the §"Layer 1 implications" peer_agent_assessments
 *     field; it is the last ATL Wrapper component before the badge (Component 3).
 *   - /operations/decision-log.md — D-ATL-ITERATION-PATTERNS-WIRED-VERIFIED-
 *     2026-05-15 (this build; the Step 2 design-decision gate is recorded there).
 *   - /manifest.md §R4 (IP boundary) / §R17e (named as NOT applying to agent
 *     profiles) / §R18 a–e (the wrapper is the carried-profile mechanism the
 *     badge certifies) / §AC8 (translation-sandwich substrate).
 *
 * WHAT THIS MODULE IS
 *
 * Component 5 turns the wrapper from "a thing you call once per consultation"
 * into "a thing that runs an agent's actual decision loop." It is ORCHESTRATION
 * of already-Verified pieces — it adds no net-new assessment logic:
 *
 *   - sage-assent-wrapper.ts   — createCarriedProfile / accumulate / computeTrajectory /
 *                        toCarriedProfilePayload / toProfileProvenancePayload
 *                        (Components 1 + 4 — the carried-profile mechanism +
 *                        trajectory awareness).
 *   - agent-mode-service.ts — renderAgentMode (Component 2 — the Layer 3
 *                        agent-mode rendering; synchronous + deterministic).
 *   - ./trust-layer/   — buildAccreditationPayload (the ported /trust-layer/
 *                        public-payload builder — pure).
 *
 * THE THREE PATTERNS (spec §"Component 5")
 *
 *   1. SEQUENTIAL LOOP — the agent submits a decision, gets the assessment,
 *      decides, repeats. runSequentialStep accumulates one EvaluatedAction and,
 *      at the carried profile's grade_check_interval cadence, runs a trajectory
 *      computation; runSequentialLoop folds an ordered list of steps. This is
 *      where the grade-check CADENCE is implemented — sage-assent-wrapper.ts
 *      deliberately left "how often to run a trajectory computation" to
 *      Component 5.
 *
 *   2. PARALLEL EVALUATION — the agent evaluates several candidate decisions at
 *      once. evaluateInParallel renders N agent-mode renderings (one per
 *      candidate, via renderAgentMode), each with its own score, and ranks them.
 *      OPEN QUESTION 4 (build-session decision, founder-elected): only the
 *      CHOSEN candidate feeds the carried profile — the carried profile is the
 *      record of COMMITTED reasoning, and the grade thresholds (min_actions
 *      20/40/60/80) are calibrated against committed decisions, not deliberation
 *      breadth. The N-candidate comparison is decision-support and is retained
 *      in full in the result; accumulation is the separate explicit
 *      accumulateChosen step.
 *
 *   3. MULTI-AGENT ORCHESTRATION — an agent that decides based on the OUTCOMES
 *      of other agents; that orchestrator is itself wrapped. toPeerAgentAssess-
 *      ments builds the orchestrator's peer_agent_assessments Layer 1 field from
 *      a flat list of peer carried profiles; runOrchestrationStep accumulates
 *      the orchestrator's OWN trajectory (it is a wrapped agent — pattern 1) and
 *      attaches the peer payloads.
 *      OPEN QUESTION 5 (build-session decision, founder-elected):
 *        - DEPTH — a depth-1 posture (MAX_ORCHESTRATION_DEPTH). peer_agent_-
 *          assessments is built from a FLAT peer list; this module does not
 *          recurse into peers' own peers. An orchestrator that is itself a peer
 *          of a higher orchestrator is fine — but each wrapping level only sees
 *          one level down. This mirrors Anthropic's own multi-agent
 *          orchestration primitive ("the coordinator can only delegate to one
 *          level of agents; depth > 1 is ignored" — Claude Managed Agents,
 *          Multiagent sessions, public beta) — see the PR15 consult in the
 *          decision-log entry.
 *        - GRADE PROPAGATION — a peer's grade is carried as DATA in
 *          peer_agent_assessments, NOT propagated as a mutation. The
 *          orchestrator's own CarriedProfile + grade are computed ONLY from the
 *          orchestrator's own accumulated EvaluatedActions; a peer's grade
 *          transition influences future orchestrator assessments only by being
 *          in the orchestrator's Layer 1 input. Each wrapped agent's trajectory
 *          stays its own (profile_provenance.source ===
 *          'own_prior_substrate_assessments').
 *
 * PURITY PROFILE (PR1 — this module is the next consumer of sage-assent-wrapper.ts, the
 * single-endpoint proof of the carried-profile/trajectory pattern; keep the
 * orchestration pure / deterministic):
 *   - evaluateInParallel()      — PURE. renderAgentMode is synchronous +
 *     toPeerAgentAssessments()    deterministic; buildAccreditationPayload is
 *                                 pure. No clock, no I/O, no randomness.
 *   - runSequentialStep()       — deterministic MODULO the ISO-timestamp fields
 *     runSequentialLoop()         the ported /trust-layer/ functions stamp from
 *     accumulateChosen()          the system clock (computed_at / updated_at /
 *     runOrchestrationStep()      grade_since / last_evaluation), inherited via
 *                                 sage-assent-wrapper.ts's computeTrajectory /
 *                                 toCarriedProfilePayload. accumulate() itself
 *                                 is fully pure. The test asserts determinism
 *                                 modulo those timestamp fields — exactly as
 *                                 sage-assent-wrapper.test.ts does.
 *   No function here reads the clock directly, performs I/O, calls an LLM, or
 *   uses randomness. Component 5 is deterministic plumbing over deterministic
 *   plumbing.
 *
 * COMPLIANCE
 *   - R4 (IP boundary): this module emits results — advanced CarriedProfiles,
 *     ranked renderings, the Layer 1 payloads. The grade-engine thresholds and
 *     the score weight tables stay module-private inside the ported
 *     /trust-layer/ closure + score-architecture.ts; nothing here returns them.
 *   - R17e: does NOT apply to agent profiles — an agent's reasoning-pattern
 *     profile is not an intimate human vulnerability (ATL Wrapper spec §"R-rule
 *     engagement"; the load-bearing distinction from private mode). This module
 *     applies no R17e filter.
 *   - R18 a–e: the iteration patterns produce the carried profiles +
 *     renderings + peer payloads the badge (Component 3, spec step 6) certifies.
 *   - AC8: this module sits in /website/src/lib/substrate/ and orchestrates the
 *     translation-sandwich substrate's ATL pieces.
 *   - PR1: sage-assent-wrapper.ts was the single-endpoint proof of the carried-profile/
 *     trajectory pattern; this module is its next consumer — kept pure /
 *     deterministic, no I/O, no LLM call inside the module.
 *   - PR2: the test file (__tests__/sage-assent-iteration-patterns.test.ts) invokes
 *     every exported function in the same session this module is written.
 *   - PR4: N/A — no LLM call. Component 5 is deterministic orchestration.
 *   - PR6: NOT engaged — Component 5 does not touch the R20a distress
 *     classifier, Zone 2 / Zone 3 logic, or their wrappers. (renderAgentMode
 *     renders the R20a passthrough by consuming the existing injection layer;
 *     this module never re-authors a wrap and never touches the classifier.)
 *   - PR10: the build follows the Plan → Execute → Verify loop; the Step 2
 *     design-decision gate was the Plan step.
 *   - PR15: Anthropic's multi-agent orchestration primitive (Claude Managed
 *     Agents, Multiagent sessions — public beta) was evaluated for pattern 3
 *     and found COMPLEMENTARY, not competing: it is the runtime substrate an
 *     orchestrator runs on; the ATL Wrapper wraps such an orchestrator. Bespoke
 *     is correct — see the decision-log entry's Reasoning.
 */

import {
  accumulate,
  computeTrajectory,
  toCarriedProfilePayload,
  toProfileProvenancePayload,
  toCarriedCandidatesPayload,
  type CarriedProfile,
  type CarriedCandidate,
  type TrajectoryResult,
  type CarriedProfilePayload,
  type ProfileProvenancePayload,
  type CarriedCandidatesPayload,
  type BridgeContext,
} from './sage-assent-wrapper'

import {
  renderAgentMode,
  type AgentModeRenderResult,
  type AgentModeResponse,
} from './agent-mode-service'

import type { Layer3ModeRenderInput } from './philosophical-mode-service'

import type { Layer2Assessment } from '../translation-sandwich/layer2-mechanisms'
import type { Layer1Schema } from '../translation-sandwich/layer1-extractor'

import { buildAccreditationPayload } from './trust-layer/accreditation/accreditation-record'
import type { AccreditationPayload } from './trust-layer/types/accreditation'

// Re-export the types Component 5's signatures use, so downstream ATL consumers
// (Component 3 the badge — spec step 6; the trajectory-enriched developer
// hand-back report) import them from one place.
export type {
  CarriedProfile,
  CarriedCandidate,
  TrajectoryResult,
  CarriedProfilePayload,
  ProfileProvenancePayload,
  CarriedCandidatesPayload,
  BridgeContext,
} from './sage-assent-wrapper'
export type {
  AgentModeRenderResult,
  AgentModeResponse,
} from './agent-mode-service'
export type { AccreditationPayload } from './trust-layer/types/accreditation'

// ============================================================================
// PATTERN 1 — THE SEQUENTIAL LOOP
//
// The agent submits a decision, gets the assessment, decides, repeats. The
// wrapper accumulates each EvaluatedAction in sequence; the carried profile
// grows with each iteration; at the carried profile's grade_check_interval
// cadence a trajectory computation runs.
// ============================================================================

/** One iteration of an agent's sequential decision loop. */
export interface SequentialStepInput {
  /** The agent's carried profile going into this step. */
  readonly profile: CarriedProfile
  /** The signed Layer2Assessment the substrate returned for this decision. */
  readonly assessment: Layer2Assessment
  /** The BridgeContext for this consultation (evaluated_at / skill_id /
   *  signature; agent_id is forced to the carried profile's by accumulate). */
  readonly context: BridgeContext
}

/** Options for a sequential step. */
export interface SequentialStepOptions {
  /** Force a trajectory computation on this step regardless of the cadence.
   *  Default false — the cadence (window_config.grade_check_interval) decides. */
  readonly force_grade_check?: boolean
}

/** The result of one sequential step. */
export interface SequentialStepResult {
  /** The carried profile after this step. When a grade check ran, this is the
   *  trajectory-advanced profile (post-transition accreditation record +
   *  advanced regressing_check_count); otherwise it is the post-accumulate
   *  profile. Always the most-advanced profile — thread it into the next step. */
  readonly profile: CarriedProfile
  /** The trajectory computation — non-null only when this step ran a grade
   *  check (cadence hit, or force_grade_check). Null otherwise. */
  readonly trajectory: TrajectoryResult | null
  /** Whether this step ran a grade check (computeTrajectory). */
  readonly grade_check_ran: boolean
  /** The carried_profile payload for the agent's NEXT Layer 1 input. Always
   *  produced — the next decision wants the current trajectory regardless of
   *  whether a grade transition happened this step. */
  readonly carried_profile_payload: CarriedProfilePayload
  /** The profile_provenance payload for the agent's NEXT Layer 1 input. */
  readonly profile_provenance_payload: ProfileProvenancePayload
  /** The carried_candidates payload for the agent's NEXT Layer 1 input —
   *  Decision B (D-ATL-ITEMS-1-3-BUILD-WIRED-VERIFIED-2026-05-16). Always
   *  produced (will be empty for fresh agents or sequential-only flows); the
   *  next decision wants the current working set. */
  readonly carried_candidates_payload: CarriedCandidatesPayload
}

/**
 * Run one iteration of the sequential loop.
 *
 * Accumulates the step's Layer2Assessment into the carried profile (Component
 * 1, pure), then — when the carried profile's grade_check_interval cadence is
 * hit, or force_grade_check is set — runs a trajectory computation (Component
 * 4) and advances the profile. Always emits the two Layer 1 payloads for the
 * agent's next input.
 *
 * Cadence: a grade check runs when the post-accumulate total_actions_evaluated
 * is a positive multiple of window_config.grade_check_interval. A
 * grade_check_interval of 0 or less disables the automatic cadence — only
 * force_grade_check triggers a check then (a deliberate "manual cadence" escape
 * hatch; the grade engine itself still gates on its own min_actions thresholds,
 * so an early or frequent check is harmless, just potentially a no-op).
 *
 * Deterministic modulo the ISO-timestamp fields the ported /trust-layer/
 * functions stamp — see the module header's PURITY PROFILE.
 */
export function runSequentialStep(
  input: SequentialStepInput,
  options: SequentialStepOptions = {}
): SequentialStepResult {
  // Decision A (D-ATL-ITEMS-1-3-BUILD-WIRED-VERIFIED-2026-05-16) — BridgeContext
  // carries candidates_considered. The caller (the wrapper code constructing
  // BridgeContext) supplies the value: 1 for a sequential commitment.
  // accumulateChosen passes candidates.length here. runOrchestrationStep
  // delegates with 1 for the orchestrator's own commitment. The Layer 1
  // implication (Decision B) flows through unchanged.

  // Component 1 — accumulate (pure).
  const accumulated = accumulate(input.profile, input.assessment, input.context)

  // Cadence decision.
  const interval = accumulated.window_config.grade_check_interval
  const cadenceHit =
    interval > 0 && accumulated.total_actions_evaluated % interval === 0
  const gradeCheckRan = cadenceHit || options.force_grade_check === true

  // Component 4 — trajectory computation, when the cadence says so.
  const trajectory: TrajectoryResult | null = gradeCheckRan
    ? computeTrajectory(accumulated)
    : null

  // The most-advanced profile: the trajectory-advanced one when a check ran,
  // otherwise the post-accumulate profile.
  const advancedProfile = trajectory ? trajectory.profile : accumulated

  // The carried_profile payload. When a grade check ran, reuse the trajectory's
  // snapshot (avoids a recompute) AND read the post-transition grade off the
  // advanced profile. When no check ran, toCarriedProfilePayload computes its
  // own snapshot (the documented clock read — module header PURITY PROFILE).
  const carriedProfilePayload = trajectory
    ? toCarriedProfilePayload(advancedProfile, trajectory.snapshot)
    : toCarriedProfilePayload(advancedProfile)

  const profileProvenancePayload = toProfileProvenancePayload(advancedProfile)
  // Decision B (D-ATL-ITEMS-1-3-BUILD-WIRED-VERIFIED-2026-05-16) — also emit
  // the carried_candidates payload for the next Layer 1 input.
  const carriedCandidatesPayload = toCarriedCandidatesPayload(advancedProfile)

  return {
    profile: advancedProfile,
    trajectory,
    grade_check_ran: gradeCheckRan,
    carried_profile_payload: carriedProfilePayload,
    profile_provenance_payload: profileProvenancePayload,
    carried_candidates_payload: carriedCandidatesPayload,
  }
}

/**
 * Run a whole sequential loop — fold an ordered list of steps through
 * runSequentialStep.
 *
 * Each step's advanced profile is threaded into the next step's input. Returns
 * the final carried profile and the per-step results (in order). An empty steps
 * list returns the input profile unchanged and an empty results list.
 *
 * The same SequentialStepOptions apply to every step in the loop; for per-step
 * control, call runSequentialStep directly.
 *
 * Deterministic modulo the ISO-timestamp fields — see runSequentialStep.
 */
export function runSequentialLoop(
  profile: CarriedProfile,
  steps: ReadonlyArray<{
    readonly assessment: Layer2Assessment
    readonly context: BridgeContext
  }>,
  options: SequentialStepOptions = {}
): { readonly profile: CarriedProfile; readonly steps: SequentialStepResult[] } {
  let current = profile
  const results: SequentialStepResult[] = []
  for (const step of steps) {
    const result = runSequentialStep(
      { profile: current, assessment: step.assessment, context: step.context },
      options
    )
    results.push(result)
    current = result.profile
  }
  return { profile: current, steps: results }
}

// ============================================================================
// PATTERN 2 — PARALLEL EVALUATION
//
// The agent evaluates several candidate decisions at once. The wrapper collects
// N agent-mode renderings (one per candidate, via renderAgentMode), each with
// its own score; the agent ranks. Open question 4 (founder-elected): only the
// CHOSEN candidate feeds the carried profile — accumulation is the separate
// explicit accumulateChosen step.
// ============================================================================

/**
 * One candidate decision in a parallel evaluation: the Layer3ModeRenderInput
 * the substrate produced for it (mode 'atl_wrapper'), plus the BridgeContext
 * needed to accumulate it into the carried profile IF it is the one chosen.
 *
 * Added 2026-05-16 under D-ATL-ITEMS-1-3-BUILD-WIRED-VERIFIED-2026-05-16
 * (Decision B): each candidate also carries its `layer1_input` so the N-1
 * unchosen candidates can be retained on CarriedProfile.carried_candidates
 * (the slim-rich shape — replayable via renderAgentMode).
 */
export interface ParallelCandidate {
  /** The substrate's Layer1Schema input for this candidate — replayable.
   *  Required for Decision B's carried_candidates retention; the wrapper
   *  produced it when it called the substrate for this candidate. */
  readonly layer1_input: Layer1Schema
  /** The agent-mode render input for this candidate. mode is fixed to
   *  'atl_wrapper' — parallel evaluation collects agent-mode renderings.
   *  The Layer 2 assessment is reached via input.assessment. */
  readonly input: Layer3ModeRenderInput & { mode: 'atl_wrapper' }
  /** The BridgeContext for this candidate — used only by accumulateChosen if
   *  this candidate is the one the agent commits to. */
  readonly context: BridgeContext
}

/** One ranked candidate in a parallel-evaluation result. */
export interface RankedCandidate {
  /** Position in the input candidates array — the stable identity of this
   *  candidate (rank reorders; index does not). accumulateChosen takes this. */
  readonly index: number
  /** The agent-mode rendering for this candidate (in-loop JSON + Markdown). */
  readonly rendering: AgentModeRenderResult
  /** The candidate's scalar score — rendering.json.score.value, surfaced for
   *  ranking convenience. Treat scores within precision_band as ties (the
   *  agent-mode caveats say so) — the rank is a sort key, not a verdict. */
  readonly score: number
  /** 1-based rank: 1 = highest score. Ties (equal score) share neither a rank
   *  nor input order — they are ranked by input order, so the ranking is fully
   *  deterministic. */
  readonly rank: number
}

/** The result of a parallel evaluation — all N renderings, ranked. */
export interface ParallelEvaluationResult {
  /** All N candidates, ranked by scalar score (highest first); ties broken by
   *  input order. Fully deterministic regardless of Array.sort stability. */
  readonly ranked: readonly RankedCandidate[]
  /** Convenience — the top-ranked candidate (ranked[0]); null when the
   *  candidates list was empty. */
  readonly top: RankedCandidate | null
}

/**
 * Evaluate N candidate decisions in parallel.
 *
 * Renders each candidate via renderAgentMode (synchronous + deterministic — no
 * LLM call), reads each rendering's scalar score, and ranks the candidates by
 * score (highest first), breaking ties by input order so the ranking is fully
 * deterministic. Does NOT touch any carried profile — parallel evaluation is
 * decision-support; accumulation is the separate accumulateChosen step (open
 * question 4: only the chosen candidate feeds the carried profile).
 *
 * PURE — renderAgentMode is synchronous + deterministic; no clock, no I/O, no
 * randomness.
 *
 * @param candidates The N candidate decisions. An empty list returns an empty
 *                   ranked list and a null top.
 */
export function evaluateInParallel(
  candidates: ReadonlyArray<ParallelCandidate>
): ParallelEvaluationResult {
  // Render each candidate, keeping its input-array index as its stable identity.
  const rendered = candidates.map((candidate, index) => {
    const rendering = renderAgentMode(candidate.input)
    return { index, rendering, score: rendering.json.score.value }
  })

  // Rank by score descending; ties broken by input index (ascending) so the
  // ordering is fully deterministic and independent of Array.sort stability.
  const sorted = [...rendered].sort((a, b) => {
    const byScore = b.score - a.score
    return byScore !== 0 ? byScore : a.index - b.index
  })

  const ranked: RankedCandidate[] = sorted.map((entry, position) => ({
    index: entry.index,
    rendering: entry.rendering,
    score: entry.score,
    rank: position + 1,
  }))

  return { ranked, top: ranked.length > 0 ? ranked[0] : null }
}

/**
 * Accumulate the CHOSEN candidate of a parallel evaluation into the carried
 * profile.
 *
 * Open question 4 (founder-elected): only the chosen candidate feeds the
 * carried profile. The carried profile is the record of COMMITTED reasoning —
 * the agent reasoned once (one decision point), evaluating N candidates; the N
 * un-chosen candidates were considered, not enacted. This delegates to
 * runSequentialStep — the chosen candidate is exactly one sequential step — so
 * the grade-check cadence + the Layer 1 payloads come through unchanged.
 *
 * @param profile      The agent's carried profile.
 * @param candidates   The same candidates array passed to evaluateInParallel.
 * @param chosenIndex  The index (stable identity, RankedCandidate.index) of the
 *                     candidate the agent committed to.
 * @param options      Sequential-step options (e.g. force_grade_check).
 * @throws if chosenIndex is out of range for the candidates array.
 *
 * Deterministic modulo the ISO-timestamp fields — see runSequentialStep.
 */
export function accumulateChosen(
  profile: CarriedProfile,
  candidates: ReadonlyArray<ParallelCandidate>,
  chosenIndex: number,
  options: SequentialStepOptions = {}
): SequentialStepResult {
  const chosen = candidates[chosenIndex]
  if (chosen === undefined) {
    throw new Error(
      `accumulateChosen: chosenIndex ${chosenIndex} is out of range for ` +
        `${candidates.length} candidate(s). Pass the RankedCandidate.index of ` +
        'the candidate the agent committed to.'
    )
  }

  // Decision A (D-ATL-ITEMS-1-3-BUILD-WIRED-VERIFIED-2026-05-16) — Pattern 2
  // KNOWS the slate size: the wrapper considered N candidates before committing
  // to one. Override the chosen candidate's BridgeContext.candidates_considered
  // to candidates.length — the wrapper-sole-source rule. The chosen context's
  // other fields (signature, evaluated_at, skill_id, agent_id) are preserved.
  const contextWithBreadth: BridgeContext = {
    ...chosen.context,
    candidates_considered: candidates.length,
  }

  // Decisions B + D (D-ATL-ITEMS-1-3-BUILD-WIRED-VERIFIED-2026-05-16) — the
  // N-1 unchosen candidates from this parallel evaluation are added to the
  // carried_candidates slot, then pruned to window_config.carried_candidates_max
  // by the default comparator (proximity rank — higher first; objective_function
  // declaration retained as opaque context for future tightening). The chosen
  // candidate does NOT go into carried_candidates — it goes into evaluated_actions
  // via accumulate() inside runSequentialStep.
  const consideredAt = chosen.context.evaluated_at
  const newCandidates: CarriedCandidate[] = candidates
    .map((c, idx) => ({ c, idx }))
    .filter((entry) => entry.idx !== chosenIndex)
    .map((entry) => ({
      layer1_input: entry.c.layer1_input,
      layer2_assessment: entry.c.input.assessment,
      // 1-based rank by input order at the time of the parallel evaluation;
      // post-prune rank is recomputed against the default comparator below.
      rank: entry.idx + 1,
      considered_at: consideredAt,
    }))
  const merged: CarriedCandidate[] = [
    ...profile.carried_candidates,
    ...newCandidates,
  ]
  const comparator = defaultCarriedCandidateComparator(
    chosen.layer1_input.objective_function_declaration ?? null
  )
  const prunedCandidates = pruneToTopK(
    merged,
    profile.window_config.carried_candidates_max,
    comparator
  )
  const profileWithCandidates: CarriedProfile = {
    ...profile,
    carried_candidates: prunedCandidates,
  }

  return runSequentialStep(
    {
      profile: profileWithCandidates,
      assessment: chosen.input.assessment,
      context: contextWithBreadth,
    },
    options
  )
}

// ============================================================================
// PATTERN 3 — MULTI-AGENT ORCHESTRATION
//
// An agent that decides based on the OUTCOMES of other agents. That orchestrator
// is itself wrapped. The orchestrator's Layer 1 input carries the peer agents'
// AccreditationPayloads (and optionally their agent-mode renderings) via the
// peer_agent_assessments field; the orchestrator otherwise accumulates its own
// trajectory exactly like any wrapped agent (pattern 1).
// ============================================================================

/**
 * The depth limit for orchestration wrapping (open question 5, founder-elected).
 *
 * A depth-1 posture: toPeerAgentAssessments builds peer_agent_assessments from a
 * FLAT peer list and does not recurse into peers' own peers. An orchestrator
 * that is itself a peer of a higher orchestrator is permitted — but each
 * wrapping level only sees ONE level down. This mirrors Anthropic's own
 * multi-agent orchestration primitive: "the coordinator can only delegate to one
 * level of agents; depth > 1 is ignored" (Claude Managed Agents, Multiagent
 * sessions — public beta; see the PR15 consult in D-ATL-ITERATION-PATTERNS-
 * WIRED-VERIFIED-2026-05-15). The constant documents the posture; the flat
 * peer-list signature of toPeerAgentAssessments enforces it structurally.
 */
export const MAX_ORCHESTRATION_DEPTH = 1 as const

/** Schema tag for a peer_agent_assessment payload — lets a Layer 2 consumer
 *  recognise the shape and version it independently. */
export const PEER_AGENT_ASSESSMENT_SCHEMA = 'atl-peer-agent-assessment-v1' as const

/**
 * One peer agent an orchestrator is deciding based on. The orchestrator does
 * not see the peer's own peers — a depth-1 flat structure (MAX_ORCHESTRATION_-
 * DEPTH).
 */
export interface PeerAgent {
  /** The peer agent's carried profile. The peer's public AccreditationPayload
   *  is derived from this; the peer's grade is carried as DATA, never
   *  propagated as a mutation to the orchestrator (open question 5). */
  readonly carried_profile: CarriedProfile
  /** The peer's latest in-loop agent-mode rendering, when the orchestrator has
   *  it. Optional — the AccreditationPayload alone is a valid peer assessment
   *  (spec §"Component 5": "the peer agents' AccreditationPayloads AND/OR their
   *  agent-mode renderings"). */
  readonly latest_rendering?: AgentModeResponse
}

/**
 * One entry in the orchestrator's peer_agent_assessments Layer 1 field — the
 * orchestrator's view of one peer agent it is deciding based on.
 *
 * A plain, JSON-serialisable object — it round-trips through Layer1Schema's
 * permissive peer_agent_assessments field (typed PeerAgentAssessment[] =
 * Record<string, unknown>[] | null in layer1-extractor.ts) and validateLayer1-
 * Schema's per-entry assertObject check.
 */
export interface PeerAgentAssessmentPayload {
  readonly schema: typeof PEER_AGENT_ASSESSMENT_SCHEMA
  /** The peer agent's identifier. */
  readonly agent_id: string
  /** The peer's public, R4-compliant accreditation payload — derived from the
   *  peer's carried profile's accreditation record via the ported
   *  buildAccreditationPayload (grade + dimensions exposed; internal thresholds
   *  and micro-logic are not). */
  readonly accreditation: AccreditationPayload
  /** The peer's latest in-loop agent-mode rendering, when the orchestrator
   *  supplied it; null otherwise. */
  readonly latest_rendering: AgentModeResponse | null
}

/**
 * Build the orchestrator's peer_agent_assessments Layer 1 field from a flat
 * list of peer agents.
 *
 * Depth-1 (MAX_ORCHESTRATION_DEPTH): each peer is read as flat data — this
 * function does not recurse into a peer's own peers. Each peer's public
 * AccreditationPayload is derived from its carried profile's accreditation
 * record via the ported buildAccreditationPayload; the peer's latest agent-mode
 * rendering is carried alongside when supplied.
 *
 * PURE — buildAccreditationPayload is a pure field projection (no clock); this
 * function reads only the already-computed accreditation records on the peers'
 * carried profiles. No clock, no I/O, no randomness.
 *
 * @param peers The flat list of peer agents the orchestrator is deciding based
 *              on. An empty list returns an empty array (a valid, un-orchestrated
 *              Layer 1 input).
 */
export function toPeerAgentAssessments(
  peers: ReadonlyArray<PeerAgent>
): PeerAgentAssessmentPayload[] {
  return peers.map((peer) => ({
    schema: PEER_AGENT_ASSESSMENT_SCHEMA,
    agent_id: peer.carried_profile.agent_id,
    accreditation: buildAccreditationPayload(
      peer.carried_profile.accreditation_record
    ),
    latest_rendering: peer.latest_rendering ?? null,
  }))
}

/** Input to one orchestration step. */
export interface OrchestrationStepInput {
  /** The orchestrator's OWN sequential step — the orchestrator is a wrapped
   *  agent: its own decision, its own assessment, its own bridge context. Its
   *  carried profile + grade are advanced by this, like any wrapped agent. */
  readonly orchestrator: SequentialStepInput
  /** The peer agents whose outcomes the orchestrator decided based on. A flat,
   *  depth-1 list (MAX_ORCHESTRATION_DEPTH). May be empty — an orchestrator
   *  with no peers this step is just a sequential-loop agent. */
  readonly peers: ReadonlyArray<PeerAgent>
}

/** The result of one orchestration step — a sequential-step result plus the
 *  orchestrator's peer_agent_assessments Layer 1 field. */
export interface OrchestrationStepResult extends SequentialStepResult {
  /** The peer_agent_assessments payload for the orchestrator's NEXT Layer 1
   *  input — depth-1, flat. The peers' grades are DATA here; they did not
   *  mutate the orchestrator's own grade (open question 5). */
  readonly peer_agent_assessments: PeerAgentAssessmentPayload[]
}

/**
 * Run one orchestration step.
 *
 * The orchestrator is itself a wrapped agent: its own decision is accumulated
 * into its own carried profile via runSequentialStep (pattern 1) — its grade
 * comes ONLY from its own accumulated EvaluatedActions. The peer agents'
 * assessments are built into the peer_agent_assessments Layer 1 field via
 * toPeerAgentAssessments — carried as DATA for the orchestrator's next Layer 1
 * input, NOT propagated as a mutation to the orchestrator's grade (open
 * question 5: grade propagation).
 *
 * Deterministic modulo the ISO-timestamp fields — see runSequentialStep.
 */
export function runOrchestrationStep(
  input: OrchestrationStepInput,
  options: SequentialStepOptions = {}
): OrchestrationStepResult {
  // The orchestrator accumulates its OWN trajectory — it is a wrapped agent.
  const ownStep = runSequentialStep(input.orchestrator, options)

  // The peers' assessments are built into the Layer 1 field — depth-1, flat,
  // carried as data (no grade propagation into ownStep.profile).
  const peerAgentAssessments = toPeerAgentAssessments(input.peers)

  return {
    ...ownStep,
    peer_agent_assessments: peerAgentAssessments,
  }
}

// ============================================================================
// DECISION D — TOP-K RETENTION (D-ATL-ITEMS-1-3-BUILD-WIRED-VERIFIED-2026-05-16)
//
// Generic top-K pruner + default carried-candidate comparator. Used by
// accumulateChosen to cap CarriedProfile.carried_candidates after adding the
// N-1 unchosen candidates from a parallel evaluation.
// ============================================================================

/**
 * Prune a list of candidates to the top K by a ranking comparator.
 *
 * STABLE for tied scores — input order survives where the comparator returns
 * 0 (Array.sort is stable since ES2019; the implementation copies the input
 * with [...candidates] so the original array is never mutated).
 *
 * @param candidates  The candidates to prune (input not mutated).
 * @param k           The maximum count to retain. If k ≥ candidates.length,
 *                    returns a fresh copy of the input (still sorted). If k
 *                    is 0 or negative, returns []. If k is non-finite, throws.
 * @param comparator  Optional ranking function — same contract as
 *                    Array.prototype.sort's compareFn (negative if a should
 *                    rank before b). When omitted, the input order is the
 *                    rank (i.e. effectively "keep the first k").
 * @returns           A new array of length min(k, candidates.length).
 */
export function pruneToTopK<T>(
  candidates: readonly T[],
  k: number,
  comparator?: (a: T, b: T) => number
): T[] {
  if (!Number.isFinite(k)) {
    throw new Error(`pruneToTopK: k must be a finite number, got ${k}`)
  }
  if (k <= 0) return []

  // Copy before sorting so the input is never mutated (PR1 + spec invariant).
  const sorted = comparator ? [...candidates].sort(comparator) : [...candidates]
  return sorted.slice(0, k)
}

/**
 * The default comparator for CarriedProfile.carried_candidates pruning.
 *
 * Per Decision D of D-ATL-ITEMS-1-3-DESIGN-LOCKED-2026-05-16, the default is
 * HYBRID:
 *   1. If the agent's objective_function_declaration is present, the comparator
 *      uses it as a tie-breaker hint — but the declaration is a string
 *      (Form-2 gaming defence), not a scoring function, so the comparator
 *      falls back to (2) for the actual comparison. The declaration's presence
 *      is preserved as opaque context for a future tighter typing.
 *   2. Rank by katorthoma_proximity (sage_like > principled > deliberate >
 *      habitual > reflexive). Higher proximity = better rank = appears first.
 *
 * Returns the comparator function suitable for Array.prototype.sort or for
 * passing into pruneToTopK as the third argument.
 *
 * @param objectiveFunctionDeclaration  The agent's declared optimisation
 *        target (Layer1Schema.objective_function_declaration). Presence is
 *        currently observed but the field is opaque — see (1) above.
 */
export function defaultCarriedCandidateComparator(
  objectiveFunctionDeclaration: string | null
): (a: CarriedCandidate, b: CarriedCandidate) => number {
  // (Reserved for the future tighter typing of objective_function_declaration;
  //  retained in the closure so it's logged in the comparator's lexical scope
  //  for downstream introspection.)
  void objectiveFunctionDeclaration

  const PROXIMITY_RANK: Record<string, number> = {
    sage_like: 4,
    principled: 3,
    deliberate: 2,
    habitual: 1,
    reflexive: 0,
  }

  return (a, b) => {
    const aRank = PROXIMITY_RANK[a.layer2_assessment.katorthoma_proximity] ?? 0
    const bRank = PROXIMITY_RANK[b.layer2_assessment.katorthoma_proximity] ?? 0
    // Higher proximity should appear FIRST → sort descending.
    return bRank - aRank
  }
}
