/**
 * event-store.ts — the immutable append-only event log (spec §5 + §6,
 * Phase-1 component 3). Pure, deterministic, IN-MEMORY.
 *
 * ⚠ PHASE 1 IS IN-MEMORY BY RULING (review Q2, 2026-09-09). There is no table,
 * no migration, no SQL. The table is ITS OWN FOUNDER-WALKED STEP — schema,
 * data-rights wiring, `retain_until`, sweep, migration — opened only after this
 * library is reviewed and the critical test passes. "Do not couple the reviewable
 * thing to the irreversible thing before the reviewable thing is confirmed."
 *
 * The append-only discipline is MODELLED ON `agent_trust_events` — which is
 * production-proven: a BEFORE UPDATE trigger that RAISES, a fold derivable from
 * history, and a partial-unique idempotency index. The PATTERN is copied. The
 * TABLE is deliberately not extended: its `event_type` CHECK is a closed,
 * virtue-domain-tied vocabulary under active mentor sequencing (D2), and widening
 * it would couple the two systems at exactly the layer instruction constraint 1
 * says must stay separate.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * ⚠ A SPEC-VS-RULING DIVERGENCE, RESOLVED BY PRECEDENCE AND FLAGGED, NOT HIDDEN
 *
 * Spec §6's event example carries  "actor": "Laboratory".
 * Ruling C2 (review Q1) says the four names are permission scope identifiers
 * ONLY — "not actor names, not agent identifiers, not environment instantiations."
 *
 * These cannot both be honoured literally. Precedence is stated in the governing
 * documents (the rulings win over the spec), so this event carries:
 *     `scope`      — the PermissionScope the transition was authorised under
 *     `caused_by`  — the agent/service identity that caused it (Constraint 10:
 *                    "Who/what caused the change?")
 * rather than a single `actor` field holding an environment name.
 *
 * The divergence is REPORTED to the founder rather than resolved silently, per
 * the instruction: "If any instruction in this document conflicts with the
 * specification, flag the conflict explicitly and do not resolve it unilaterally."
 * Precedence gave the resolution; the flag preserves the founder's authority to
 * overrule it.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import {
  type CognitiveClock,
  type EventId,
  type ClaimId,
  type DecisionId,
} from './types'
import { type PermissionScope } from './permissions'

// ============================================================================
// §1  EVENT VOCABULARY (spec §5)
// ============================================================================

export const EVENT_TYPES = [
  'OBSERVE',
  'RETRIEVE',
  'INFER',
  'COMMUNICATE',
  'CORRECT',
  'CHALLENGE',
  'RETRACT',
  'REINSTATE',
  'COMMIT',
  /**
   * EXECUTE records that an execution happened OUTSIDE this system.
   *
   * ⚠ IT DOES NOT AUTHORISE ONE. The Q1 hard constraint — the loop proposes, it
   * never executes — holds, and C9 (Q11) confirms Threshold produces an
   * AUTHORISED PROPOSAL that something outside the loop executes. This library
   * contains NO executor: nothing here invokes a tool, a command, a network call
   * or a scheduler, and `commitDecision` emits COMMIT, never EXECUTE. An EXECUTE
   * event can only be appended by an external caller reporting a completed
   * external act, and it therefore requires `external_executor` to be named.
   */
  'EXECUTE',
  'REVIEW',
] as const

export type CognitiveEventType = (typeof EVENT_TYPES)[number]

// ============================================================================
// §2  THE EVENT
// ============================================================================

export interface CognitiveEvent {
  readonly event_id: EventId
  /**
   * The LOGICAL sequence number — strictly increasing, and the AUTHORITATIVE
   * ordering of the log. `timestamp` is descriptive and is never compared.
   * (AE-2 precedent: ordering rests on submission order, and saying so is the
   * honest alternative to implying a wall clock ordered the events.)
   */
  readonly seq: number
  readonly event_type: CognitiveEventType
  readonly timestamp: string

  /** The permission scope the transition was authorised under. NOT an actor (C2). */
  readonly scope: PermissionScope
  /** The agent/service that caused the transition (Constraint 10 traceability). */
  readonly caused_by: string

  readonly claim_id?: ClaimId
  readonly decision_id?: DecisionId

  readonly previous_state_version: number | null
  readonly new_state_version: number | null

  readonly reason: string
  readonly causal_dependencies: readonly EventId[]

  /** Required on EXECUTE, and only meaningful there: names the EXTERNAL party
   *  that performed the act. Its presence is what makes an EXECUTE event a
   *  record of something outside the loop rather than an act of the loop. */
  readonly external_executor?: string
}

export interface AppendEventInput {
  readonly event_type: CognitiveEventType
  readonly scope: PermissionScope
  readonly caused_by: string
  readonly reason: string
  readonly claim_id?: ClaimId
  readonly decision_id?: DecisionId
  readonly previous_state_version?: number | null
  readonly new_state_version?: number | null
  readonly causal_dependencies?: readonly EventId[]
  readonly external_executor?: string
}

export class ImmutableHistoryError extends Error {
  constructor(message: string) {
    super(`Cognitive OS history is immutable: ${message}`)
    this.name = 'ImmutableHistoryError'
  }
}

// ============================================================================
// §3  THE STORE — append-only, no update path, no delete path
// ============================================================================

/**
 * An in-memory append-only event log.
 *
 * There is no `update`, no `delete`, no `replace` and no setter (Constraint 2 —
 * never overwrite epistemic history). Appended events are frozen, and `all()`
 * returns a fresh frozen copy, so a caller cannot reach in and mutate the log
 * through a returned reference.
 */
export class EventStore {
  private readonly events: CognitiveEvent[] = []
  private readonly ids = new Set<EventId>()

  constructor(private readonly clock: CognitiveClock) {}

  /**
   * Append an event. Returns the frozen event.
   *
   * Rejects an EXECUTE without `external_executor`: an execution record that
   * cannot name who executed would be indistinguishable from this system having
   * executed something, which is the one thing it must never do.
   */
  append(input: AppendEventInput): CognitiveEvent {
    if (input.event_type === 'EXECUTE' && !input.external_executor) {
      throw new ImmutableHistoryError(
        'an EXECUTE event must name its external_executor — this system never executes (Q1)',
      )
    }
    for (const dep of input.causal_dependencies ?? []) {
      if (!this.ids.has(dep)) {
        throw new ImmutableHistoryError(
          `causal dependency ${dep} does not exist in this log — a dangling causal ` +
            `link would make the trajectory unreconstructable (Constraint 10)`,
        )
      }
    }
    const event: CognitiveEvent = Object.freeze({
      event_id: this.clock.nextId('evt'),
      seq: this.clock.nextSeq(),
      event_type: input.event_type,
      timestamp: this.clock.now(),
      scope: input.scope,
      caused_by: input.caused_by,
      claim_id: input.claim_id,
      decision_id: input.decision_id,
      previous_state_version: input.previous_state_version ?? null,
      new_state_version: input.new_state_version ?? null,
      reason: input.reason,
      causal_dependencies: Object.freeze([...(input.causal_dependencies ?? [])]),
      external_executor: input.external_executor,
    })
    this.events.push(event)
    this.ids.add(event.event_id)
    return event
  }

  /** The whole log, ordered by `seq`. A frozen copy — never the live array. */
  all(): readonly CognitiveEvent[] {
    return Object.freeze([...this.events])
  }

  get length(): number {
    return this.events.length
  }

  byId(id: EventId): CognitiveEvent | undefined {
    return this.events.find((e) => e.event_id === id)
  }

  /** Events strictly after `seq`, in order. */
  since(seq: number): readonly CognitiveEvent[] {
    return Object.freeze(this.events.filter((e) => e.seq > seq))
  }

  /** Events for one claim, in order — its revision history. */
  forClaim(claimId: ClaimId): readonly CognitiveEvent[] {
    return Object.freeze(this.events.filter((e) => e.claim_id === claimId))
  }

  forDecision(decisionId: DecisionId): readonly CognitiveEvent[] {
    return Object.freeze(this.events.filter((e) => e.decision_id === decisionId))
  }

  /**
   * HISTORICAL REPLAY (spec §6, §24 "state reconstruction" / "historical replay").
   *
   * The log as it stood at `seq` — what Archive reconstructs from. Answers, for
   * any point in the past: what did the system believe, when, why, what changed,
   * what caused the change, and what depended on it (Constraint 10).
   */
  replayTo(seq: number): readonly CognitiveEvent[] {
    return Object.freeze(this.events.filter((e) => e.seq <= seq))
  }

  /**
   * The belief-state version in force at `seq`, derived from the log alone.
   *
   * "Current state should be derivable from the event history" (spec §6). This is
   * the narrow proof of that property: the version is recomputed from events, not
   * read from any stored field.
   */
  versionAt(seq: number): number | null {
    let version: number | null = null
    for (const e of this.events) {
      if (e.seq > seq) break
      if (e.new_state_version !== null) version = e.new_state_version
    }
    return version
  }
}
