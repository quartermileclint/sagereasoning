/**
 * belief-state.ts — the versioned belief state with explicit revision events
 * (spec §8, Phase-1 components 2 and 4). Pure, deterministic, immutable.
 *
 * Every operation returns a NEW BeliefState value; none mutates its input
 * (Constraint 2 — never overwrite epistemic history, create a new version).
 *
 * ⚠ Constraint 4 — NO SCORE-ONLY REASONING. `epistemic_debt` is a STRUCTURED
 * OBJECT and is AUTHORITATIVE. `summary_scores.epistemic_debt_score` is a
 * SUMMARY, derived from that object, and is never the basis of a decision. The
 * spec says this in prose ("The score is a summary. The underlying debt objects
 * are authoritative."); here the score has no setter and is recomputed from the
 * debt object on every revision, so it cannot drift away from what it summarises
 * or be set independently of it.
 *
 * ⚠ C5 — the score is an `EpistemicDebtScore` WRAPPER OBJECT, not a raw number, so
 * the two wrappers cannot be added. See types.ts §3 for the CORRECTED scope of that
 * guarantee: field-level extraction (`.value`) is NOT prevented at compile time.
 */

import {
  type BeliefStateId,
  type ClaimId,
  type EventId,
  type NodeId,
  type CognitiveClock,
  type EpistemicDebtScore,
  epistemicDebtScore,
} from './types'
import { type Claim, isSupporting } from './claim'

// ============================================================================
// §1  EPISTEMIC DEBT — the structured, authoritative object (spec §8, §9)
// ============================================================================

export interface EpistemicDebt {
  /** Claims whose support has been invalidated and not re-established. */
  readonly unresolved_claims: readonly ClaimId[]
  /** Assumptions with no supporting evidence. */
  readonly unsupported_assumptions: readonly NodeId[]
  /** Pairs of claims in direct contradiction. */
  readonly contradictions: readonly (readonly [ClaimId, ClaimId])[]
  /** Evidence superseded or aged out but still cited. */
  readonly stale_evidence: readonly NodeId[]
  /** Revisions identified as required but not yet performed. */
  readonly pending_revisions: readonly ClaimId[]
}

export const EMPTY_DEBT: EpistemicDebt = Object.freeze({
  unresolved_claims: Object.freeze([]),
  unsupported_assumptions: Object.freeze([]),
  contradictions: Object.freeze([]),
  stale_evidence: Object.freeze([]),
  pending_revisions: Object.freeze([]),
})

/**
 * Derive the SUMMARY score from the authoritative debt object.
 *
 * A plain count of outstanding debt items. Deliberately NOT normalised to [0,1]
 * and deliberately NOT weighted: a normalised weighted index would invite exactly
 * the "score-only reasoning" Constraint 4 forbids, and would be the kind of
 * figure someone might later try to average against a proximity rank. A count is
 * transparently a summary of things you can go and read.
 */
export function deriveEpistemicDebtScore(debt: EpistemicDebt): EpistemicDebtScore {
  return epistemicDebtScore(
    debt.unresolved_claims.length +
      debt.unsupported_assumptions.length +
      debt.contradictions.length +
      debt.stale_evidence.length +
      debt.pending_revisions.length,
  )
}

export function debtIsClear(debt: EpistemicDebt): boolean {
  return deriveEpistemicDebtScore(debt).value === 0
}

// ============================================================================
// §2  THE BELIEF STATE
// ============================================================================

export interface BeliefState {
  readonly belief_state_id: BeliefStateId
  readonly version: number
  readonly timestamp: string

  readonly claims: readonly Claim[]
  readonly revision_events: readonly EventId[]
  readonly active_dependencies: readonly NodeId[]

  /** AUTHORITATIVE (Constraint 4). */
  readonly epistemic_debt: EpistemicDebt
  /** SUMMARY ONLY. Derived from `epistemic_debt`; no independent setter. */
  readonly summary_scores: { readonly epistemic_debt_score: EpistemicDebtScore }
}

export function createBeliefState(clock: CognitiveClock): BeliefState {
  return Object.freeze({
    belief_state_id: clock.nextId('bs'),
    version: 1,
    timestamp: clock.now(),
    claims: Object.freeze([]),
    revision_events: Object.freeze([]),
    active_dependencies: Object.freeze([]),
    epistemic_debt: EMPTY_DEBT,
    summary_scores: Object.freeze({ epistemic_debt_score: deriveEpistemicDebtScore(EMPTY_DEBT) }),
  })
}

/**
 * Produce the NEXT version of a belief state.
 *
 * The version ALWAYS increments — there is no in-place edit and no path that
 * changes a belief state without advancing its version. The prior value remains
 * valid and untouched, so a caller holding it still sees exactly what it saw.
 *
 * `revisionEventId` is REQUIRED: Constraint 1 — no silent belief mutation. A
 * belief change that generated no event cannot be produced through this function,
 * which is what makes the constraint structural rather than a review checklist item.
 */
export function nextVersion(
  prior: BeliefState,
  revisionEventId: EventId,
  changes: {
    readonly claims?: readonly Claim[]
    readonly active_dependencies?: readonly NodeId[]
    readonly epistemic_debt?: EpistemicDebt
  },
  clock: CognitiveClock,
): BeliefState {
  const debt = changes.epistemic_debt ?? prior.epistemic_debt
  return Object.freeze({
    belief_state_id: prior.belief_state_id,
    version: prior.version + 1,
    timestamp: clock.now(),
    claims: Object.freeze([...(changes.claims ?? prior.claims)]),
    revision_events: Object.freeze([...prior.revision_events, revisionEventId]),
    active_dependencies: Object.freeze([
      ...(changes.active_dependencies ?? prior.active_dependencies),
    ]),
    epistemic_debt: Object.freeze({
      unresolved_claims: Object.freeze([...debt.unresolved_claims]),
      unsupported_assumptions: Object.freeze([...debt.unsupported_assumptions]),
      contradictions: Object.freeze([...debt.contradictions]),
      stale_evidence: Object.freeze([...debt.stale_evidence]),
      pending_revisions: Object.freeze([...debt.pending_revisions]),
    }),
    summary_scores: Object.freeze({ epistemic_debt_score: deriveEpistemicDebtScore(debt) }),
  })
}

/** Add a claim, producing a new version. */
export function withClaim(
  prior: BeliefState,
  claim: Claim,
  revisionEventId: EventId,
  clock: CognitiveClock,
): BeliefState {
  return nextVersion(prior, revisionEventId, { claims: [...prior.claims, claim] }, clock)
}

/* `withReplacedClaim` was REMOVED after PR19 (NIT): it declared `clock?` optional
 * and then threw at runtime if it was missing — abandoning this file's own
 * compile-time discipline — and it had no caller anywhere in the library or the
 * batteries. Dead code that models the wrong idiom is worse than no code.
 * Callers use `nextVersion` directly, which requires its clock at compile time. */

export function findClaim(state: BeliefState, id: ClaimId): Claim | undefined {
  return state.claims.find((c) => c.claim_id === id)
}

/** Claims that currently SUPPORT downstream conclusions. */
export function supportingClaims(state: BeliefState): readonly Claim[] {
  return Object.freeze(state.claims.filter((c) => isSupporting(c.epistemic_status)))
}
