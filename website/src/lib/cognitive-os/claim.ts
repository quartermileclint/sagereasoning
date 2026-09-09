/**
 * claim.ts — the Claim, a first-class object with provenance, confidence and
 * dependency tracking (spec §7, Phase-1 component 1).
 *
 * Pure and deterministic. No env, no I/O.
 *
 * WHAT THIS FILE OVERRIDES IN THE SPECIFICATION, AND WHY (precedence: the
 * mentor rulings win over the spec, per the Step-2 governing documents):
 *
 *   C3 (Q7)  `confidence` is ORDINAL. The spec's `"confidence": 0.0` and
 *            `"uncertainty": {lower: 0.0, upper: 1.0}` cardinal pair is replaced
 *            by an ordinal rank and an ordinal band. Uncertainty is PRESERVED
 *            (Constraint 9), just not on a cardinal scale.
 *
 *   C4 (Q6)  NO agent-supplied confidence scalar.
 *
 *            TWO HALVES, AND ONLY ONE OF THEM WAS ORIGINALLY BUILT. PR19 found
 *            the gap; this header now states what is true rather than what was
 *            intended.
 *
 *            (a) ENFORCED, compile-time: `CreateClaimInput` types `confidence`
 *                and `agent_confidence` as `never`, so a caller supplying either
 *                is a COMPILE ERROR. `deriveConfidence` never reads a caller
 *                confidence value.
 *            (b) ENFORCED, compile-time: an `EvidenceRef` is BRANDED and can only
 *                be produced by `attestEvidence`. A bare object literal
 *                `{ evidence_id, verification: 'verified' }` is NOT assignable to
 *                `EvidenceRef` — also a COMPILE ERROR. So evidence enters through
 *                exactly one chokepoint, which must name a `VerifierAuthority`.
 *
 *            ⚠ (c) NOT ENFORCED, AND THIS IS THE HONEST LIMIT: PHASE 1 SHIPS NO
 *                EVIDENCE-VERIFICATION SUBSYSTEM. Nothing in this library checks
 *                that a piece of evidence marked `verified` was actually verified.
 *                The chokepoint makes the authority position EXPLICIT, TYPED and
 *                GREPPABLE — one place a real verifier plugs in — but it does not
 *                itself verify anything. An earlier version of this header claimed
 *                `verification` was "set by the system"; THAT WAS FALSE and is
 *                corrected here. Until a verifier exists, a caller that mints its
 *                own attestations can still drive its own claim's confidence up.
 *                THIS IS A NAMED PHASE-2 PREREQUISITE, not a solved problem.
 *
 *   C6 (Q8)  `identity_relevance` and `interpretive_context` are OMITTED until
 *            Phase 3 — not present-but-zero. A reserved `identity_relevance: 0.0`
 *            reads as "no identity relevance" (a false claim), not as "not yet
 *            measured". This is the caller_class lesson applied. They are typed
 *            `never` on the input so a well-meaning future caller cannot
 *            reintroduce them without deleting the constraint deliberately.
 */

import {
  type ClaimId,
  type BeliefStateId,
  type ConfidenceAssessment,
  type ConfidenceOrdinal,
  type CognitiveClock,
  NOT_YET_ASSESSED,
  CONFIDENCE_RANK,
  isMeasuredConfidence,
} from './types'

// ============================================================================
// §1  EPISTEMIC STATUS (spec §4.1 / §7)
// ============================================================================

export const EPISTEMIC_STATUSES = [
  'asserted',
  'defeasible',
  'under_challenge',
  'retracted',
  'reinstated',
  'superseded',
  'stale',
] as const

export type EpistemicStatus = (typeof EPISTEMIC_STATUSES)[number]

/**
 * Statuses under which a claim still SUPPORTS a downstream conclusion.
 *
 * `reinstated` supports; `stale`, `retracted`, `superseded` and `under_challenge`
 * do NOT. `under_challenge` is deliberately non-supporting: this is the
 * conservative direction, and it is the same instinct as the loop-closure gate's
 * "indeterminate is treated as NOT closed" — an unresolved question does not get
 * the benefit of the doubt.
 */
export const SUPPORTING_STATUSES: readonly EpistemicStatus[] = Object.freeze([
  'asserted',
  'defeasible',
  'reinstated',
])

export function isSupporting(status: EpistemicStatus): boolean {
  return SUPPORTING_STATUSES.includes(status)
}

// ============================================================================
// §2  PROVENANCE — the ONLY input to confidence (C4)
// ============================================================================

export type VerificationOutcome = 'verified' | 'unverified' | 'contradicted'

declare const ATTESTED: unique symbol

/**
 * Who attested a verification outcome.
 *
 * ⚠ PHASE 1 SHIPS NO VERIFIER. This type exists so that the authority position is
 * EXPLICIT and TYPED rather than implicit — every attestation must name who made
 * it, and there is exactly one function that produces evidence. A real verifier
 * plugs in at that one place. Naming the seam is not the same as filling it, and
 * this library does not pretend otherwise.
 */
export interface VerifierAuthority {
  readonly verifier_id: string
  /** `unverified_phase1` is the ONLY kind Phase 1 can produce. Its presence in a
   *  record is a standing disclosure that no verification actually occurred. */
  readonly kind: 'unverified_phase1' | 'system_verifier'
}

/**
 * A reference to a piece of evidence. BRANDED — constructible ONLY via
 * `attestEvidence`, so a bare object literal will not typecheck as one.
 *
 * That closes the forge-by-literal route at compile time. It does NOT make the
 * outcome trustworthy: see (c) in this file's header. `attested_by` records who
 * claimed it, so an unverified attestation is visible in the record rather than
 * indistinguishable from a verified one.
 */
export interface EvidenceRef {
  readonly evidence_id: string
  readonly verification: VerificationOutcome
  readonly attested_by: VerifierAuthority
  /** Brand. Not writable by a caller; only `attestEvidence` can produce it. */
  readonly [ATTESTED]: true
}

/** The ONE chokepoint through which evidence enters a claim's provenance. */
export function attestEvidence(
  evidence_id: string,
  verification: VerificationOutcome,
  attested_by: VerifierAuthority,
): EvidenceRef {
  return Object.freeze({ evidence_id, verification, attested_by }) as EvidenceRef
}

/**
 * The Phase-1 authority. ⚠ IT VERIFIES NOTHING. Every attestation it signs is
 * marked `unverified_phase1` so that the absence of verification is legible in the
 * record — the caller_class discipline applied to provenance: an unmeasured thing
 * must not be representable in a form that reads as a measurement.
 */
export function phase1UnverifiedAuthority(verifier_id: string): VerifierAuthority {
  return Object.freeze({ verifier_id, kind: 'unverified_phase1' as const })
}

/** Was every attestation behind this evidence set made by a REAL verifier? Phase 1
 *  always answers false, honestly, and consumers can branch on it. */
export function allEvidenceGenuinelyVerified(evidence: readonly EvidenceRef[]): boolean {
  return evidence.length > 0 && evidence.every((e) => e.attested_by.kind === 'system_verifier')
}

export interface ClaimProvenance {
  readonly source_ids: readonly string[]
  readonly evidence_ids: readonly EvidenceRef[]
  /** The agent or service that created the claim. Recorded for traceability
   *  (Constraint 10), NEVER an input to confidence. */
  readonly created_by: string
  readonly created_at: string
}

// ============================================================================
// §3  THE CLAIM
// ============================================================================

/** An ordinal uncertainty BAND. Replaces the spec's cardinal {lower, upper}. */
export interface ConfidenceBand {
  readonly lower: ConfidenceOrdinal
  readonly upper: ConfidenceOrdinal
}

export interface Claim {
  readonly claim_id: ClaimId
  readonly content: string
  readonly epistemic_status: EpistemicStatus

  /** ORDINAL (C3). DERIVED from provenance only (C4). Never agent-supplied. */
  readonly confidence: ConfidenceAssessment
  /** Ordinal uncertainty band. Absent when confidence is not yet assessed —
   *  a band around an unmeasured value would itself be a false measurement. */
  readonly uncertainty?: ConfidenceBand

  readonly provenance: ClaimProvenance

  readonly dependency_graph_id: string
  readonly belief_state_id: BeliefStateId
  readonly belief_state_version: number

  readonly created_at: string
  readonly updated_at: string

  // C6: identity_relevance and interpretive_context are ABSENT until Phase 3.
  // Not null, not 0.0, not a placeholder. Absent.
}

/**
 * The input to `createClaim`.
 *
 * The four `never` fields are the compile-time enforcement of C4 and C6. Passing
 * any of them is a TypeScript error rather than a silently-ignored property, so
 * the constraint cannot be defeated by a caller who has not read this header.
 * (Pinned by an @ts-expect-error assertion in the battery — the same idiom that
 * locks `validateAuthorityBoundary`'s unwaivability.)
 */
export type CreateClaimInput = {
  readonly content: string
  readonly provenance: ClaimProvenance
  readonly dependency_graph_id: string
  readonly belief_state_id: BeliefStateId
  readonly belief_state_version: number
  readonly epistemic_status?: EpistemicStatus
} & {
  readonly confidence?: never
  readonly agent_confidence?: never
  readonly identity_relevance?: never
  readonly interpretive_context?: never
}

/**
 * Derive a claim's confidence from provenance ALONE (C4).
 *
 * Deterministic table, no averaging (C3):
 *   any contradicted evidence            → unsupported   (adverse evidence is
 *                                          never outweighed by volume)
 *   no evidence at all                   → not_yet_assessed (NOT `unsupported` —
 *                                          "nothing examined" is not a finding)
 *   ≥1 verified, none contradicted:
 *       1 verified                       → weak
 *       2 verified                       → moderate
 *       3 verified                       → strong
 *       ≥4 verified AND ≥2 sources       → established
 *       ≥4 verified, <2 sources          → strong  (single-source ceiling)
 *   evidence present but none verified   → unsupported (examined, supports nothing)
 *
 * The single-source ceiling exists so that repeated citation of one source cannot
 * reach the top rank — volume from a single origin is not independent corroboration.
 *
 * ⚠ HONEST LIMIT (PR19): this function trusts `verification`. Phase 1 has no
 * verifier, so under Phase 1 that trust is unearned — see (c) in the file header.
 * Use `allEvidenceGenuinelyVerified` to tell a Phase-1 attestation apart from a
 * real one; this function deliberately does NOT branch on it, because silently
 * treating unverified evidence as verified-but-discounted would hide the gap
 * rather than surface it.
 */
export function deriveConfidence(provenance: ClaimProvenance): ConfidenceAssessment {
  const evidence = provenance.evidence_ids
  if (evidence.length === 0) return NOT_YET_ASSESSED
  if (evidence.some((e) => e.verification === 'contradicted')) return 'unsupported'

  const verified = evidence.filter((e) => e.verification === 'verified').length
  if (verified === 0) return 'unsupported'
  if (verified === 1) return 'weak'
  if (verified === 2) return 'moderate'
  if (verified === 3) return 'strong'
  return provenance.source_ids.length >= 2 ? 'established' : 'strong'
}

/**
 * The ordinal uncertainty band around a derived confidence.
 *
 * Constraint 9 — compression must not erase uncertainty. The band widens downward
 * whenever unverified evidence is present: unverified material could fail, so the
 * floor drops, while the ceiling never rises above what was actually derived.
 */
export function deriveUncertaintyBand(
  provenance: ClaimProvenance,
  confidence: ConfidenceAssessment,
): ConfidenceBand | undefined {
  if (!isMeasuredConfidence(confidence)) return undefined
  const hasUnverified = provenance.evidence_ids.some(
    (e) => e.verification === 'unverified',
  )
  if (!hasUnverified) return { lower: confidence, upper: confidence }
  const order = (Object.keys(CONFIDENCE_RANK) as ConfidenceOrdinal[]).sort(
    (a, b) => CONFIDENCE_RANK[a] - CONFIDENCE_RANK[b],
  )
  const idx = order.indexOf(confidence)
  return { lower: order[Math.max(0, idx - 1)], upper: confidence }
}

/** Create a claim. Confidence is DERIVED here and cannot be passed in (C4). */
export function createClaim(input: CreateClaimInput, clock: CognitiveClock): Claim {
  const confidence = deriveConfidence(input.provenance)
  const ts = clock.now()
  return Object.freeze({
    claim_id: clock.nextId('claim'),
    content: input.content,
    epistemic_status: input.epistemic_status ?? 'asserted',
    confidence,
    uncertainty: deriveUncertaintyBand(input.provenance, confidence),
    provenance: Object.freeze({
      ...input.provenance,
      source_ids: Object.freeze([...input.provenance.source_ids]),
      evidence_ids: Object.freeze([...input.provenance.evidence_ids]),
    }),
    dependency_graph_id: input.dependency_graph_id,
    belief_state_id: input.belief_state_id,
    belief_state_version: input.belief_state_version,
    created_at: ts,
    updated_at: ts,
  })
}

/**
 * Produce a NEW claim value with a changed status. The input claim is never
 * mutated (Constraint 2 — no destruction of history). Callers must emit the
 * corresponding event (Constraint 1 — no silent belief mutation); that pairing is
 * enforced in belief-revision.ts, which is the only sanctioned mutator.
 */
export function withStatus(
  claim: Claim,
  status: EpistemicStatus,
  clock: CognitiveClock,
): Claim {
  return Object.freeze({ ...claim, epistemic_status: status, updated_at: clock.now() })
}

/** Produce a NEW claim value with re-derived confidence after provenance changed. */
export function withProvenance(
  claim: Claim,
  provenance: ClaimProvenance,
  clock: CognitiveClock,
): Claim {
  const confidence = deriveConfidence(provenance)
  return Object.freeze({
    ...claim,
    provenance: Object.freeze({
      ...provenance,
      source_ids: Object.freeze([...provenance.source_ids]),
      evidence_ids: Object.freeze([...provenance.evidence_ids]),
    }),
    confidence,
    uncertainty: deriveUncertaintyBand(provenance, confidence),
    updated_at: clock.now(),
  })
}
