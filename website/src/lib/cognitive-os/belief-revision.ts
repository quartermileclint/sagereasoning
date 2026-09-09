/**
 * belief-revision.ts — retraction, reinstatement and propagation through the
 * dependency graph (spec §4.1 + §19 + §20, Phase-1 component 7), plus the
 * durable DecisionRecord the reopening flow operates on.
 *
 * Pure and deterministic. Every mutating operation:
 *   - asserts a permission BEFORE acting (fail-closed), and
 *   - emits an event (Constraint 1 — no silent belief mutation), and
 *   - returns a NEW value, never mutating its input (Constraint 2).
 *
 * Constraints made structural here:
 *   Constraint 6  NO AUTOMATIC REINSTATEMENT. `surfaceClaim` (Attic's affordance)
 *                 is a READ that changes nothing. `reinstateClaim` requires a
 *                 WARRANT carrying at least one system-verified piece of
 *                 evidence, and a scope holding REVISE. Surfacing cannot become
 *                 reinstating by accident: they are different functions with
 *                 different permissions and different preconditions.
 *   Constraint 7  NO AUTOMATIC COMMITMENT. Only a scope holding COMMIT on
 *                 `decision` may commit — which, in the Phase-1 grant table, is
 *                 Threshold alone.
 *   C9 (Q11)      THRESHOLD PRODUCES AN AUTHORISED PROPOSAL, NEVER AN EXECUTION.
 *                 `commitDecision` returns an `AuthorisedProposal`. There is no
 *                 executor anywhere in this library: nothing invokes a tool, a
 *                 command, a network call or a scheduler. The Q1 hard constraint —
 *                 the loop proposes, it never executes — holds by construction.
 *
 * DECISION IMMUTABILITY, and how "mark as requiring review" coexists with it:
 *   The critical scenario requires BOTH "Decision D becomes REVIEW_REQUIRED" AND
 *   "the original decision remains immutable". Those are only compatible if the
 *   status is not a mutable field ON the record. So the DecisionRecord is frozen
 *   and never edited, and the CURRENT STATUS IS DERIVED FROM THE EVENT LOG
 *   (`deriveDecisionStatus`). Marking for review appends a REVIEW event; the
 *   record itself is untouched, byte for byte. This is the spec's own rule —
 *   "current state should be derivable from the event history" — used to resolve
 *   what would otherwise be a contradiction in the requirements.
 */

import {
  type ClaimId,
  type DecisionId,
  type EventId,
  type NodeId,
  type CognitiveClock,
  type EpistemicDebtScore,
  type CarriedProximityRank,
  type ConfidenceAssessment,
} from './types'
import {
  type Claim,
  type EvidenceRef,
  type ClaimProvenance,
  withStatus,
  withProvenance,
} from './claim'
import {
  type BeliefState,
  type EpistemicDebt,
  nextVersion,
  findClaim,
  deriveEpistemicDebtScore,
} from './belief-state'
import { type EventStore } from './event-store'
import { type DependencyGraph } from './dependency-graph'
import { type PermissionScope, assertPermitted } from './permissions'

// ============================================================================
// §1  RETRACTION
// ============================================================================

export interface RevisionResult {
  readonly state: BeliefState
  readonly event: EventId
}

/**
 * Retract a claim: status → `retracted`, an event is emitted, the belief-state
 * version increments, and the claim joins `epistemic_debt.unresolved_claims`.
 *
 * The prior Claim VALUE is untouched and remains reachable through prior belief
 * state versions and the event log.
 */
export function retractClaim(
  state: BeliefState,
  claimId: ClaimId,
  opts: {
    readonly scope: PermissionScope
    readonly caused_by: string
    readonly reason: string
    readonly causal_dependencies?: readonly EventId[]
  },
  store: EventStore,
  clock: CognitiveClock,
): RevisionResult {
  assertPermitted(opts.scope, 'RETRACT', 'claim')
  const claim = findClaim(state, claimId)
  if (claim === undefined) throw new Error(`retractClaim: unknown claim ${claimId}`)
  // PR19 (MEDIUM): retracting an already-retracted claim appended a DUPLICATE to
  // unresolved_claims, inflating the debt summary for one claim retracted once —
  // degrading exactly the honesty the score is supposed to have. Refused, rather
  // than silently deduplicated, because a second RETRACT event would also record a
  // belief change that did not happen (Constraint 1).
  if (claim.epistemic_status === 'retracted') {
    throw new Error(
      `retractClaim: claim ${claimId} is already retracted — a repeat retraction ` +
        `would record a belief change that did not occur and inflate epistemic debt`,
    )
  }

  const event = store.append({
    event_type: 'RETRACT',
    scope: opts.scope,
    caused_by: opts.caused_by,
    reason: opts.reason,
    claim_id: claimId,
    previous_state_version: state.version,
    new_state_version: state.version + 1,
    causal_dependencies: opts.causal_dependencies,
  })

  const retracted = withStatus(claim, 'retracted', clock)
  const debt: EpistemicDebt = {
    ...state.epistemic_debt,
    unresolved_claims: [...state.epistemic_debt.unresolved_claims, claimId],
  }
  const next = nextVersion(
    state,
    event.event_id,
    {
      claims: state.claims.map((c) => (c.claim_id === claimId ? retracted : c)),
      epistemic_debt: debt,
    },
    clock,
  )
  return { state: next, event: event.event_id }
}

/**
 * Register new evidence against an existing claim, re-deriving its confidence
 * from provenance (C4 — confidence never comes from a caller).
 *
 * Emits OBSERVE for the arrival of evidence and CORRECT for the resulting change
 * to the claim, because those are two different things and collapsing them would
 * lose the "what caused the change?" half of Constraint 10.
 */
export function registerEvidence(
  state: BeliefState,
  claimId: ClaimId,
  evidence: EvidenceRef,
  opts: {
    readonly scope: PermissionScope
    readonly caused_by: string
    readonly reason: string
  },
  store: EventStore,
  clock: CognitiveClock,
): RevisionResult & { readonly observeEvent: EventId; readonly claim: Claim } {
  assertPermitted(opts.scope, 'READ', 'evidence')
  assertPermitted(opts.scope, 'REVISE', 'claim')
  const claim = findClaim(state, claimId)
  if (claim === undefined) throw new Error(`registerEvidence: unknown claim ${claimId}`)

  const observe = store.append({
    event_type: 'OBSERVE',
    scope: opts.scope,
    caused_by: opts.caused_by,
    reason: `new evidence ${evidence.evidence_id} (${evidence.verification})`,
    claim_id: claimId,
  })

  const provenance: ClaimProvenance = {
    ...claim.provenance,
    evidence_ids: [...claim.provenance.evidence_ids, evidence],
  }
  const updated = withProvenance(claim, provenance, clock)

  const correct = store.append({
    event_type: 'CORRECT',
    scope: opts.scope,
    caused_by: opts.caused_by,
    reason: opts.reason,
    claim_id: claimId,
    previous_state_version: state.version,
    new_state_version: state.version + 1,
    causal_dependencies: [observe.event_id],
  })

  const next = nextVersion(
    state,
    correct.event_id,
    { claims: state.claims.map((c) => (c.claim_id === claimId ? updated : c)) },
    clock,
  )
  return { state: next, event: correct.event_id, observeEvent: observe.event_id, claim: updated }
}

// ============================================================================
// §2  PROPAGATION
// ============================================================================

export interface PropagationResult {
  readonly state: BeliefState
  readonly staleClaims: readonly ClaimId[]
  readonly affectedDecisions: readonly DecisionId[]
  readonly events: readonly EventId[]
}

/**
 * Propagate an invalidation through the dependency graph.
 *
 * Every transitively dependent CLAIM becomes `stale` and joins the debt object;
 * every transitively dependent DECISION is reported as affected (its status
 * change is `markDecisionForReview`'s job, so that commitment discipline stays in
 * one place). "The system must not silently retain downstream conclusions whose
 * dependencies have been invalidated."
 *
 * `nodeToClaim` / `nodeToDecision` map graph node ids to domain ids; a node that
 * maps to neither (evidence, an assumption, an action) is traversed THROUGH but
 * not itself marked — it is a carrier, not a conclusion.
 */
export function propagateInvalidation(
  state: BeliefState,
  invalidatedNodeId: NodeId,
  graph: DependencyGraph,
  maps: {
    readonly nodeToClaim: (n: NodeId) => ClaimId | undefined
    readonly nodeToDecision: (n: NodeId) => DecisionId | undefined
  },
  opts: {
    readonly scope: PermissionScope
    readonly caused_by: string
    readonly reason: string
    readonly causal_dependencies?: readonly EventId[]
  },
  store: EventStore,
  clock: CognitiveClock,
): PropagationResult {
  assertPermitted(opts.scope, 'REVISE', 'claim')

  const affected = graph.transitiveDependents(invalidatedNodeId)
  const staleClaims: ClaimId[] = []
  const affectedDecisions: DecisionId[] = []
  const events: EventId[] = []

  let working = state
  for (const nodeId of affected) {
    const claimId = maps.nodeToClaim(nodeId)
    if (claimId !== undefined) {
      const claim = findClaim(working, claimId)
      if (claim === undefined) continue
      const event = store.append({
        event_type: 'CHALLENGE',
        scope: opts.scope,
        caused_by: opts.caused_by,
        reason: `${opts.reason} — support invalidated upstream`,
        claim_id: claimId,
        previous_state_version: working.version,
        new_state_version: working.version + 1,
        causal_dependencies: opts.causal_dependencies,
      })
      events.push(event.event_id)
      staleClaims.push(claimId)
      const debt: EpistemicDebt = {
        ...working.epistemic_debt,
        pending_revisions: [...working.epistemic_debt.pending_revisions, claimId],
      }
      working = nextVersion(
        working,
        event.event_id,
        {
          claims: working.claims.map((c) =>
            c.claim_id === claimId ? withStatus(c, 'stale', clock) : c,
          ),
          epistemic_debt: debt,
        },
        clock,
      )
      continue
    }
    const decisionId = maps.nodeToDecision(nodeId)
    if (decisionId !== undefined) affectedDecisions.push(decisionId)
  }

  return {
    state: working,
    staleClaims: Object.freeze(staleClaims),
    affectedDecisions: Object.freeze(affectedDecisions),
    events: Object.freeze(events),
  }
}

// ============================================================================
// §3  SURFACING vs REINSTATEMENT (Constraint 6)
// ============================================================================

/**
 * Attic's affordance: SURFACE an old belief. A pure READ.
 *
 * Emits RETRIEVE and returns the claim. It changes NO status, produces NO new
 * belief-state version, and cannot reinstate anything. "Attic may surface an old
 * belief. Laboratory/Cellar must establish whether it should return."
 */
export function surfaceClaim(
  state: BeliefState,
  claimId: ClaimId,
  opts: { readonly scope: PermissionScope; readonly caused_by: string },
  store: EventStore,
): { readonly claim: Claim | undefined; readonly event: EventId } {
  assertPermitted(opts.scope, 'READ', 'claim')
  const event = store.append({
    event_type: 'RETRIEVE',
    scope: opts.scope,
    caused_by: opts.caused_by,
    reason: `surfaced claim ${claimId} for consideration — surfacing is not reinstatement`,
    claim_id: claimId,
  })
  return { claim: findClaim(state, claimId), event: event.event_id }
}

/**
 * The warrant a reinstatement REQUIRES (Constraint 6).
 *
 * At least one piece of SYSTEM-VERIFIED evidence. An agent cannot supply the
 * verification (C4), so an agent cannot manufacture a warrant for its own
 * retracted claim.
 */
export interface ReinstatementWarrant {
  readonly evidence: readonly EvidenceRef[]
  readonly rationale: string
}

export class ReinstatementRefusedError extends Error {
  constructor(message: string) {
    super(`Cognitive OS reinstatement refused: ${message}`)
    this.name = 'ReinstatementRefusedError'
  }
}

/**
 * Reinstate a retracted or stale claim — only on an established warrant.
 *
 * Refuses unless the warrant carries at least one `verified` piece of evidence.
 * There is no automatic path: no function anywhere in this library calls
 * `reinstateClaim` on its own behalf.
 */
export function reinstateClaim(
  state: BeliefState,
  claimId: ClaimId,
  warrant: ReinstatementWarrant,
  opts: {
    readonly scope: PermissionScope
    readonly caused_by: string
    readonly causal_dependencies?: readonly EventId[]
  },
  store: EventStore,
  clock: CognitiveClock,
): RevisionResult {
  assertPermitted(opts.scope, 'REVISE', 'claim')
  const claim = findClaim(state, claimId)
  if (claim === undefined) throw new Error(`reinstateClaim: unknown claim ${claimId}`)
  if (!warrant.evidence.some((e) => e.verification === 'verified')) {
    throw new ReinstatementRefusedError(
      `claim ${claimId} has no system-verified evidence in its warrant — ` +
        `surfacing is not reinstatement (Constraint 6)`,
    )
  }

  const event = store.append({
    event_type: 'REINSTATE',
    scope: opts.scope,
    caused_by: opts.caused_by,
    reason: warrant.rationale,
    claim_id: claimId,
    previous_state_version: state.version,
    new_state_version: state.version + 1,
    causal_dependencies: opts.causal_dependencies,
  })

  const provenance: ClaimProvenance = {
    ...claim.provenance,
    evidence_ids: [...claim.provenance.evidence_ids, ...warrant.evidence],
  }
  const reinstated = withStatus(withProvenance(claim, provenance, clock), 'reinstated', clock)
  const debt: EpistemicDebt = {
    ...state.epistemic_debt,
    unresolved_claims: state.epistemic_debt.unresolved_claims.filter((c) => c !== claimId),
    pending_revisions: state.epistemic_debt.pending_revisions.filter((c) => c !== claimId),
  }
  const next = nextVersion(
    state,
    event.event_id,
    {
      claims: state.claims.map((c) => (c.claim_id === claimId ? reinstated : c)),
      epistemic_debt: debt,
    },
    clock,
  )
  return { state: next, event: event.event_id }
}

// ============================================================================
// §4  DECISIONS — commitment, review, reopening (spec §19, §20)
// ============================================================================

/** A committed decision. FROZEN AND NEVER EDITED. Status is derived from the log. */
export interface DecisionRecord {
  readonly decision_id: DecisionId
  readonly action: string

  readonly belief_state_id: string
  readonly belief_state_version: number

  readonly supporting_claims: readonly ClaimId[]
  readonly known_uncertainties: readonly string[]

  /** C5: a WRAPPER OBJECT, carried as its own field, never merged with the
   *  proximity rank below. The two wrappers cannot be added; field-level extraction
   *  is not compile-prevented — see types.ts §3 for the corrected scope. */
  readonly epistemic_debt_score: EpistemicDebtScore
  /** C5: the harness's rank, CARRIED as a separate opaque field, never merged
   *  and never interpreted by this library. */
  readonly carried_proximity_rank?: CarriedProximityRank
  /** The harness's own evaluation, carried opaquely. Never parsed, never combined. */
  readonly stoic_evaluation?: Readonly<Record<string, unknown>>

  readonly commitment_event_id: EventId
  readonly timestamp: string

  /** Set when this record is a NEW VERSION replacing an earlier decision. */
  readonly supersedes?: DecisionId

  // C6 discipline generalised: identity_state_id, identity_coherence_score and
  // adversarial_test_results are OMITTED. Phase 1 builds no identity state and no
  // adversarial service, and a present-but-empty field would read as "no identity
  // tension found" / "adversarial testing performed and clean" — both false claims.
}

/**
 * What Threshold produces. C9 (Q11): AN AUTHORISED PROPOSAL, NEVER AN EXECUTION.
 *
 * Something OUTSIDE the loop acts on this, or nothing does. This library contains
 * no executor, and this object carries no callable.
 */
export interface AuthorisedProposal {
  readonly kind: 'authorised_proposal'
  readonly decision: DecisionRecord
  readonly authorised_by_scope: PermissionScope
  readonly note: string
}

const PROPOSAL_NOTE =
  'AUTHORISED PROPOSAL — not an execution. The loop proposes; it never executes. ' +
  'Any execution is performed by a party outside this system and is recorded, if at ' +
  'all, by an EXECUTE event naming that external executor.'

/**
 * Commit a decision. Only a scope holding COMMIT on `decision` may do so
 * (Constraint 7 — in the Phase-1 grant table, that is Threshold alone).
 *
 * ⚠ DISCLOSED LIMIT (PR19): this performs NO decision-readiness check. A commit
 * succeeds even when the belief state carries unresolved contradictions, or when
 * the supporting claims sit at `unsupported`/`not_yet_assessed` confidence. The
 * epistemic debt is recorded on the record as a DESCRIPTIVE field, not as a gate.
 * Spec §21's decision gate — the eight questions producing DECISION READY vs
 * DECISION REQUIRES REVIEW WITH EXPLICIT REASONS, never a threshold score — is
 * PHASE 2 WORK AND IS NOT BUILT HERE. Stated so that a Phase-1 AuthorisedProposal
 * is not mistaken for a vetted one.
 */
export function commitDecision(
  input: {
    readonly action: string
    readonly state: BeliefState
    readonly supporting_claims: readonly ClaimId[]
    readonly known_uncertainties?: readonly string[]
    readonly carried_proximity_rank?: CarriedProximityRank
    readonly stoic_evaluation?: Readonly<Record<string, unknown>>
    readonly supersedes?: DecisionId
  },
  opts: {
    readonly scope: PermissionScope
    readonly caused_by: string
    readonly reason: string
    readonly causal_dependencies?: readonly EventId[]
  },
  store: EventStore,
  clock: CognitiveClock,
): AuthorisedProposal {
  assertPermitted(opts.scope, 'COMMIT', 'decision')
  const decision_id = clock.nextId('dec')
  const event = store.append({
    event_type: 'COMMIT',
    scope: opts.scope,
    caused_by: opts.caused_by,
    reason: opts.reason,
    decision_id,
    previous_state_version: input.state.version,
    new_state_version: input.state.version,
    causal_dependencies: opts.causal_dependencies,
  })
  const decision: DecisionRecord = Object.freeze({
    decision_id,
    action: input.action,
    belief_state_id: input.state.belief_state_id,
    belief_state_version: input.state.version,
    supporting_claims: Object.freeze([...input.supporting_claims]),
    known_uncertainties: Object.freeze([...(input.known_uncertainties ?? [])]),
    epistemic_debt_score: deriveEpistemicDebtScore(input.state.epistemic_debt),
    carried_proximity_rank: input.carried_proximity_rank,
    stoic_evaluation: input.stoic_evaluation,
    commitment_event_id: event.event_id,
    timestamp: clock.now(),
    supersedes: input.supersedes,
  })
  return Object.freeze({
    kind: 'authorised_proposal' as const,
    decision,
    authorised_by_scope: opts.scope,
    note: PROPOSAL_NOTE,
  })
}

export type DecisionStatus = 'COMMITTED' | 'REVIEW_REQUIRED' | 'SUPERSEDED' | 'UNKNOWN'

/**
 * Mark a decision as requiring review — WITHOUT touching the record.
 *
 * Appends a REVIEW event. The DecisionRecord is not passed in and cannot be
 * modified by this function: that is how "Decision D becomes REVIEW_REQUIRED" and
 * "the original decision remains immutable" are both true at once.
 */
export function markDecisionForReview(
  decisionId: DecisionId,
  opts: {
    readonly scope: PermissionScope
    readonly caused_by: string
    readonly reason: string
    readonly causal_dependencies?: readonly EventId[]
  },
  store: EventStore,
): EventId {
  // PR19 (HIGH): this was gated on READ, which Archive and Laboratory both hold —
  // so a scope documented as a pure read-only reconstructor could flip a committed
  // decision's derived status. Marking for review is a WRITE and is gated as one.
  assertPermitted(opts.scope, 'UPDATE', 'decision')
  return store.append({
    event_type: 'REVIEW',
    scope: opts.scope,
    caused_by: opts.caused_by,
    reason: opts.reason,
    decision_id: decisionId,
    causal_dependencies: opts.causal_dependencies,
  }).event_id
}

/**
 * DERIVE a decision's current status from the event log alone.
 *
 * Precedence, latest-wins by `seq`: a later COMMIT that supersedes it →
 * SUPERSEDED; else a REVIEW after the last COMMIT → REVIEW_REQUIRED; else
 * COMMITTED. No stored status field exists to drift from this.
 */
export function deriveDecisionStatus(
  decisionId: DecisionId,
  store: EventStore,
  supersededBy: ReadonlySet<DecisionId> = new Set(),
): DecisionStatus {
  if (supersededBy.has(decisionId)) return 'SUPERSEDED'
  const events = store.forDecision(decisionId)
  if (events.length === 0) return 'UNKNOWN'
  let lastCommitSeq = -1
  let lastReviewSeq = -1
  for (const e of events) {
    if (e.event_type === 'COMMIT') lastCommitSeq = Math.max(lastCommitSeq, e.seq)
    if (e.event_type === 'REVIEW') lastReviewSeq = Math.max(lastReviewSeq, e.seq)
  }
  if (lastCommitSeq === -1) return 'UNKNOWN'
  return lastReviewSeq > lastCommitSeq ? 'REVIEW_REQUIRED' : 'COMMITTED'
}

/** The set of decisions superseded by any decision in `decisions`. */
export function supersededDecisions(
  decisions: readonly DecisionRecord[],
): ReadonlySet<DecisionId> {
  const set = new Set<DecisionId>()
  for (const d of decisions) if (d.supersedes !== undefined) set.add(d.supersedes)
  return set
}

/** Reported confidence of a decision's supporting claims — the weakest link. */
export function decisionSupportConfidence(
  decision: DecisionRecord,
  state: BeliefState,
  weakest: (inputs: readonly ConfidenceAssessment[]) => ConfidenceAssessment,
): ConfidenceAssessment {
  return weakest(
    decision.supporting_claims.map((id) => findClaim(state, id)?.confidence ?? 'unsupported'),
  )
}
