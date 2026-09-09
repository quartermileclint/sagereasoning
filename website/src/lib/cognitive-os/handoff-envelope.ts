/**
 * handoff-envelope.ts — the standard scope-to-scope handoff envelope, validated
 * on receipt and rejected if stale or invalid (spec §16, Phase-1 component 8).
 * Pure and deterministic.
 *
 * ⚠ DO NOT EXTEND `agent_handoffs`. That table is the ORGANISATIONAL INBOX
 * (`source_agent`/`target_agent` constrained to tech/growth/support/ops/founder).
 * It shares a word with this envelope and NOTHING ELSE. Conflating them is the
 * specific mistake the gap analysis flagged so a future session would not make it.
 *
 * ⚠ R9/R10 RECONCILIATION IS OWED BEFORE PHASE 2 OPENS (Q2 ruling). This envelope
 * does NOT supersede R9's handoff design; the two must be reconciled when the
 * actor architecture begins consuming these state services. Recorded here as well
 * as in the report so it is not rediscovered.
 *
 * Constraints enforced here:
 *   C5   `epistemic_debt.score` and `carried_proximity_rank` are SEPARATE FIELDS and
 *        are never merged here. Adding the two wrappers is a compile error; field-
 *        level extraction is not compile-prevented (types.ts §3 states the corrected
 *        scope). Nothing in this file combines them.
 *   C6   The spec's `identity` block (state_id / version / coherence_score) is
 *        OMITTED — Phase 1 builds no identity state, and an `identity: {...}` with
 *        zeroed fields would read as a measurement of identity coherence. Phase 3.
 *   C8   `toExternalView` strips internal-only scores, and `sendExternally`
 *        refuses outright if any remain. Internal scope-to-scope handoffs may
 *        carry them; the boundary is the system edge, not the scope edge.
 */

import {
  type HandoffId,
  type ClaimId,
  type EventId,
  type BeliefStateId,
  type CognitiveClock,
  type EpistemicDebtScore,
  type CarriedProximityRank,
} from './types'
import {
  type PermissionScope,
  PERMISSION_SCOPES,
  isPermitted,
  assertNoInternalScoreEgress,
  type EgressDestination,
} from './permissions'

export interface HandoffEnvelope {
  readonly handoff_id: HandoffId
  /** PERMISSION SCOPES, not actors (C2). */
  readonly from: PermissionScope
  readonly to: PermissionScope
  readonly timestamp: string

  readonly state: {
    readonly belief_state_id: BeliefStateId
    readonly belief_state_version: number
  }

  readonly claims: readonly ClaimId[]

  readonly epistemic_debt: {
    readonly score: EpistemicDebtScore
    readonly relevant_items: readonly string[]
  }

  /** C5 — carried alongside, never merged into any Cognitive OS figure. */
  readonly carried_proximity_rank?: CarriedProximityRank

  readonly events: readonly EventId[]
  readonly payload: Readonly<Record<string, unknown>>

  // C6: the spec's `identity` block is OMITTED until Phase 3.
}

export function createHandoffEnvelope(
  input: {
    readonly from: PermissionScope
    readonly to: PermissionScope
    readonly belief_state_id: BeliefStateId
    readonly belief_state_version: number
    readonly claims?: readonly ClaimId[]
    readonly epistemic_debt_score: EpistemicDebtScore
    readonly relevant_debt_items?: readonly string[]
    readonly carried_proximity_rank?: CarriedProximityRank
    readonly events?: readonly EventId[]
    readonly payload?: Readonly<Record<string, unknown>>
  },
  clock: CognitiveClock,
): HandoffEnvelope {
  return Object.freeze({
    handoff_id: clock.nextId('ho'),
    from: input.from,
    to: input.to,
    timestamp: clock.now(),
    state: Object.freeze({
      belief_state_id: input.belief_state_id,
      belief_state_version: input.belief_state_version,
    }),
    claims: Object.freeze([...(input.claims ?? [])]),
    epistemic_debt: Object.freeze({
      score: input.epistemic_debt_score,
      relevant_items: Object.freeze([...(input.relevant_debt_items ?? [])]),
    }),
    carried_proximity_rank: input.carried_proximity_rank,
    events: Object.freeze([...(input.events ?? [])]),
    payload: Object.freeze({ ...(input.payload ?? {}) }),
  })
}

// ============================================================================
// VALIDATION ON RECEIPT (spec §16 + §24)
// ============================================================================

export type HandoffRejectionReason =
  | 'malformed'
  | 'missing_state'
  | 'unknown_scope'
  | 'stale_version'
  | 'permission_denied'

export type HandoffValidation =
  | { readonly ok: true; readonly envelope: HandoffEnvelope }
  | {
      readonly ok: false
      readonly reason: HandoffRejectionReason
      readonly detail: string
    }

/**
 * Validate an envelope on receipt. FAIL-CLOSED: anything unrecognised is
 * rejected, never accepted with a warning.
 *
 * `currentBeliefStateVersion` is the receiver's own current version. An envelope
 * carrying an OLDER version is STALE and is rejected — acting on a superseded
 * belief state is precisely the failure the whole component exists to prevent.
 * A FUTURE version is also rejected: the receiver cannot have the state the
 * envelope claims, so accepting it would mean reasoning over state it does not hold.
 */
export function validateHandoff(
  candidate: unknown,
  context: {
    readonly currentBeliefStateVersion: number
    readonly expectedBeliefStateId?: BeliefStateId
  },
): HandoffValidation {
  if (typeof candidate !== 'object' || candidate === null) {
    return { ok: false, reason: 'malformed', detail: 'envelope is not an object' }
  }
  const e = candidate as Record<string, unknown>

  for (const field of ['handoff_id', 'from', 'to', 'timestamp'] as const) {
    if (typeof e[field] !== 'string') {
      return { ok: false, reason: 'malformed', detail: `missing or non-string ${field}` }
    }
  }

  const scopes = PERMISSION_SCOPES as readonly string[]
  if (!scopes.includes(e.from as string)) {
    return { ok: false, reason: 'unknown_scope', detail: `unknown from-scope ${String(e.from)}` }
  }
  if (!scopes.includes(e.to as string)) {
    return { ok: false, reason: 'unknown_scope', detail: `unknown to-scope ${String(e.to)}` }
  }

  const state = e.state
  if (
    typeof state !== 'object' ||
    state === null ||
    typeof (state as Record<string, unknown>).belief_state_id !== 'string' ||
    typeof (state as Record<string, unknown>).belief_state_version !== 'number'
  ) {
    return { ok: false, reason: 'missing_state', detail: 'state block absent or malformed' }
  }
  const st = state as { belief_state_id: string; belief_state_version: number }

  if (!Array.isArray(e.claims)) {
    return { ok: false, reason: 'malformed', detail: 'claims must be an array' }
  }
  if (!Array.isArray(e.events)) {
    return { ok: false, reason: 'malformed', detail: 'events must be an array' }
  }

  const debt = e.epistemic_debt
  if (
    typeof debt !== 'object' ||
    debt === null ||
    typeof (debt as Record<string, unknown>).score !== 'object' ||
    (debt as Record<string, { kind?: unknown }>).score?.kind !== 'epistemic_debt_score'
  ) {
    return {
      ok: false,
      reason: 'malformed',
      detail: 'epistemic_debt.score must be an EpistemicDebtScore wrapper (C5)',
    }
  }

  if (
    context.expectedBeliefStateId !== undefined &&
    st.belief_state_id !== context.expectedBeliefStateId
  ) {
    return {
      ok: false,
      reason: 'missing_state',
      detail: `belief_state_id ${st.belief_state_id} is not the receiver's ${context.expectedBeliefStateId}`,
    }
  }

  if (st.belief_state_version !== context.currentBeliefStateVersion) {
    return {
      ok: false,
      reason: 'stale_version',
      detail:
        `envelope carries belief_state_version ${st.belief_state_version}; ` +
        `receiver is at ${context.currentBeliefStateVersion}`,
    }
  }

  // The receiver must actually be permitted to read what it is being handed.
  if ((e.claims as unknown[]).length > 0 && !isPermitted(e.to as string, 'READ', 'claim')) {
    return {
      ok: false,
      reason: 'permission_denied',
      detail: `${String(e.to)} may not READ claim`,
    }
  }

  return { ok: true, envelope: candidate as HandoffEnvelope }
}

// ============================================================================
// C8 — THE EXTERNAL BOUNDARY
// ============================================================================

/** An envelope with every internal-only score REMOVED. Q9: these never leave. */
export type ExternalHandoffView = Omit<HandoffEnvelope, 'epistemic_debt'>

/**
 * Strip internal-only scores for a consumer outside the system.
 *
 * `epistemic_debt` goes ENTIRELY — not zeroed, not redacted-to-null. A zeroed
 * debt block would read as "no epistemic debt", which is the caller_class error
 * in a different costume.
 */
export function toExternalView(envelope: HandoffEnvelope): ExternalHandoffView {
  const rest = { ...envelope } as Record<string, unknown>
  delete rest.epistemic_debt
  return Object.freeze(rest) as ExternalHandoffView
}

/**
 * Send an envelope outside the system. Refuses if any internal-only score
 * survives — belt and braces over `toExternalView`, so that a future field
 * carrying a score cannot leak simply because someone forgot to strip it.
 */
export function sendExternally(
  envelope: HandoffEnvelope,
  destination: EgressDestination,
): ExternalHandoffView {
  const view = toExternalView(envelope)
  assertNoInternalScoreEgress(view, destination)
  return view
}
