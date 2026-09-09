/**
 * types.ts — shared types for the Cognitive OS Phase 1 state library.
 *
 * Pure, deterministic, dependency-free. No env, no I/O, no DB, no clock read,
 * no randomness. Every time and every identifier is INJECTED (see CognitiveClock)
 * so that the Step-3 critical scenario passes DETERMINISTICALLY.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * ⚠ MANDATORY PLACEMENT NOTE — Q4 ruling, 2026-09-08: "The note is not optional."
 *
 * This library lives at `website/src/lib/cognitive-os/`, OUTSIDE `substrate/`.
 * THAT PLACEMENT WAS CONSTRAINT-DRIVEN BY THE OBSERVATION WINDOW, NOT CHOSEN ON
 * ARCHITECTURAL GROUNDS, AND MAY BE REVISITED AFTER THE WINDOW CLOSES.
 *
 * The constraint: the byte-identity guard matches GUARD_RE against every line of
 * `git status --short`, including `??` untracked entries, and GUARD_RE contains
 * `/substrate/` and `trust-core`. A brand-new file in the architecturally natural
 * home would therefore turn the battery red and block the commit gate, even though
 * a new file cannot perturb the measurement. A per-commit waiver was REJECTED
 * because it "normalises waivers for routine build work, which is precisely what
 * the D2 stand-down mechanics were designed to keep exceptional."
 *
 * A FUTURE SESSION MUST NOT TREAT `cognitive-os/` AS ARCHITECTURALLY SETTLED.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Binding constraints encoded in THIS file (all ruled 2026-09-08 / 2026-09-09):
 *   C3  Claim.confidence is ORDINAL, never cardinal [0,1].
 *   C5  No Cognitive OS scalar may EVER be combined with a proximity rank.
 *       Enforced STRUCTURALLY: the scalars are wrapper OBJECTS, not raw numbers,
 *       so `debt + proximity` is a COMPILE ERROR, not a convention. This mirrors
 *       `validateAuthorityBoundary`'s @ts-expect-error lock — the project's proven
 *       idiom for making an unwaivable rule a compile-time property.
 *   C6  identity_relevance and interpretive_context are OMITTED (not null-filled,
 *       and never `0.0` — the caller_class lesson).
 */

// ============================================================================
// §1  DETERMINISM — every time and id is injected, never read from the ambient
//     environment. Wall-clock ordering is NEVER authoritative; `seq` is.
// ============================================================================

/**
 * The injected source of identifiers, sequence numbers and timestamps.
 *
 * `seq` is a LOGICAL, monotonically increasing sequence number and is the
 * AUTHORITATIVE ordering of the event log. `timestamp` is descriptive only.
 *
 * Rationale (AE-2 precedent, `occurred_at_basis: "submission_order"`): a wall
 * clock cannot be trusted to order events, and a test that depends on one is not
 * deterministic. Ordering therefore rests on the sequence, and the honesty of
 * that choice is stated rather than hidden.
 */
export interface CognitiveClock {
  /** Next logical sequence number. Strictly increasing. Authoritative ordering. */
  nextSeq(): number
  /** Next identifier for the given entity kind. Deterministic under the test clock. */
  nextId(prefix: string): string
  /** Descriptive ISO-8601 timestamp. NEVER used for ordering or comparison. */
  now(): string
}

/**
 * A fully deterministic clock. Same seed ⇒ same ids, same seqs, same timestamps.
 *
 * NOTE for the (separate, founder-walked) table step: a persisted store needs
 * real UUIDs and a real clock. This generator is deliberately NOT a UUID source;
 * it exists so the Phase-1 library and its critical test are reproducible.
 */
export function createDeterministicClock(
  epochIso = '2026-01-01T00:00:00.000Z',
): CognitiveClock {
  let seq = 0
  const counters = new Map<string, number>()
  const epochMs = Date.parse(epochIso)
  return {
    nextSeq: () => ++seq,
    nextId: (prefix: string) => {
      const n = (counters.get(prefix) ?? 0) + 1
      counters.set(prefix, n)
      return `${prefix}-${String(n).padStart(4, '0')}`
    },
    // Derived from the logical sequence, not from the host clock: descriptive,
    // reproducible, and obviously not a real measurement of when anything ran.
    now: () => new Date(epochMs + seq * 1000).toISOString(),
  }
}

// ============================================================================
// §2  ORDINAL CONFIDENCE (C3) — never cardinal, never averaged
// ============================================================================

/**
 * The ordinal confidence scale, weakest → strongest.
 *
 * C3 (Q7 ruling): the spec's `"confidence": 0.0` cardinal schema is OVERRIDDEN.
 * Grounds — the `lower_median` ruling: averaging ordinal ranks produces numbers
 * that may not correspond to any actual rank on the scale.
 *
 * `unsupported` is a REAL rank, not a null-substitute: it means "provenance was
 * examined and supports nothing". Absence of examination is a different thing and
 * is represented by `not_yet_assessed` — see ConfidenceAssessment.
 */
export const CONFIDENCE_ORDINAL = [
  'unsupported',
  'weak',
  'moderate',
  'strong',
  'established',
] as const

export type ConfidenceOrdinal = (typeof CONFIDENCE_ORDINAL)[number]

/** Rank for COMPARISON ONLY. Never summed, never averaged (C3). */
export const CONFIDENCE_RANK: Readonly<Record<ConfidenceOrdinal, number>> =
  Object.freeze({
    unsupported: 0,
    weak: 1,
    moderate: 2,
    strong: 3,
    established: 4,
  })

/**
 * The honest "we have not measured this" value, distinct from every real rank.
 * The caller_class lesson (Q8): an unmeasured thing must NOT be representable as
 * a value a consumer would read as a finding.
 */
export const NOT_YET_ASSESSED = 'not_yet_assessed' as const
export type NotYetAssessed = typeof NOT_YET_ASSESSED

/** A confidence reading: either a real ordinal rank, or an explicit non-measurement. */
export type ConfidenceAssessment = ConfidenceOrdinal | NotYetAssessed

export function isMeasuredConfidence(c: ConfidenceAssessment): c is ConfidenceOrdinal {
  return c !== NOT_YET_ASSESSED
}

/**
 * The conservative combination of several ordinal confidences: the WEAKEST.
 *
 * Deliberately NOT a mean and NOT a median. Weakest-link is the same discipline
 * the engine's unity-thesis minimum uses, and it is the only combination that
 * cannot manufacture a rank no input actually held. Any unmeasured input makes
 * the whole reading unmeasured — silence never strengthens a claim.
 */
export function weakestConfidence(
  inputs: readonly ConfidenceAssessment[],
): ConfidenceAssessment {
  if (inputs.length === 0) return NOT_YET_ASSESSED
  if (inputs.some((c) => !isMeasuredConfidence(c))) return NOT_YET_ASSESSED
  const measured = inputs as readonly ConfidenceOrdinal[]
  return measured.reduce((worst, c) =>
    CONFIDENCE_RANK[c] < CONFIDENCE_RANK[worst] ? c : worst,
  )
}

// ============================================================================
// §3  NON-COMBINABLE SCALARS (C5) — structural for the wrapper case; see the
//     scope note below for what is NOT enforced
// ============================================================================

/**
 * C5 (Q7 ruling), STANDING RULE: no Cognitive OS scalar may be combined with a
 * proximity rank in any derived figure — never aggregated with, averaged against,
 * or used to modify one. The HandoffEnvelope carries them as SEPARATE FIELDS.
 *
 * These are wrapper OBJECTS rather than branded numbers on purpose. A branded
 * `number` still permits `a + b`; an object does not. `debtScore + proximity` is a
 * TypeScript error.
 *
 * ⚠ THE PRECISE SCOPE OF THAT GUARANTEE, CORRECTED AFTER PR19. An earlier version
 * of this header said C5 was "enforced structurally … a COMPILE ERROR, not a
 * convention", full stop. That was STRONGER THAN WHAT IS DELIVERED:
 *   ENFORCED   — combining the two WRAPPERS directly (`debt + proximity`).
 *   NOT ENFORCED — extracting the fields first. `debt.value + WEIGHTS[prox.rank]`
 *                  compiles cleanly, and nothing at the type level prevents it.
 * Phase 1 cannot close field-level extraction without making the values opaque,
 * which would break the legitimate reads the envelope exists to carry. SO THE RULE
 * REMAINS PARTLY A DISCIPLINE, AND THAT IS NOW SAID PLAINLY. It matters most in
 * Phase 6, which is exactly where a routing mechanism would be tempted to mix them
 * — the case C5 was written for. NAMED AS A LIVE RISK, NOT A CLOSED ONE.
 */
export interface EpistemicDebtScore {
  readonly kind: 'epistemic_debt_score'
  /** A SUMMARY only. The underlying debt objects are authoritative (Constraint 4). */
  readonly value: number
}

export interface IdentityCoherenceScore {
  readonly kind: 'identity_coherence_score'
  readonly value: number
}

/**
 * A proximity rank CARRIED from the Stoic harness, as an opaque, separate value.
 *
 * Deliberately NOT imported from the harness's own modules: instruction constraint
 * 1 (harness and Cognitive OS stay separate) applies at the IMPLEMENTATION level,
 * not only the architectural one. The Cognitive OS does not compute, interpret, or
 * modify a proximity rank; it only carries one alongside its own figures.
 */
export interface CarriedProximityRank {
  readonly kind: 'proximity_rank'
  readonly rank: string
}

export function epistemicDebtScore(value: number): EpistemicDebtScore {
  return Object.freeze({ kind: 'epistemic_debt_score' as const, value })
}

export function identityCoherenceScore(value: number): IdentityCoherenceScore {
  return Object.freeze({ kind: 'identity_coherence_score' as const, value })
}

export function carriedProximityRank(rank: string): CarriedProximityRank {
  return Object.freeze({ kind: 'proximity_rank' as const, rank })
}

/**
 * The set of scalar kinds that are INTERNAL-ONLY and must never reach a consumer
 * outside the system (C8 / Q9). Consumed by permissions.ts, which is where the
 * boundary is machine-enforced.
 */
export const INTERNAL_ONLY_SCALAR_KINDS = [
  'epistemic_debt_score',
  'identity_coherence_score',
] as const

export type InternalOnlyScalarKind = (typeof INTERNAL_ONLY_SCALAR_KINDS)[number]

// ============================================================================
// §4  IDENTIFIERS
// ============================================================================

export type ClaimId = string
export type EventId = string
export type BeliefStateId = string
export type DecisionId = string
export type NodeId = string
export type HandoffId = string
