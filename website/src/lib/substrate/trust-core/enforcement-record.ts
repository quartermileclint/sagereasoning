/**
 * enforcement-record.ts — Logos-on W2: the ENFORCEMENT-CLASS record machinery
 * (mentor verdicts L4, L5, L7 — verbatim record
 * operations/agent-circles-2026-08/2026-08-01-mentor-consultation-agent-circles-
 * logos-on-verbatim.md; the verbatim record wins over every restatement here.
 * Design of record: operations/agent-circles-2026-08/2026-09-12-W2-record-
 * honesty-DESIGN.md).
 *
 * ─── What this is ────────────────────────────────────────────────────────────
 * When the infrastructure blocks an action (today: the guardrail's live
 * `do_not_proceed` deny; later: the S11 intervention engine once flipped), the
 * outcome was produced by the rational structure, not by the agent's reasoning.
 * L5: "Enforced outcomes are recorded as a distinct enforcement class that
 * moves no domain level, and the record must disclose its enforcement context
 * explicitly." L7: the record must carry the compliance-not-virtue clause "at
 * the record level and travel with enforcement-class entries inline".
 *
 * ─── The three structural guarantees (each battery-pinned) ──────────────────
 *   1. EFFECT-NEUTRAL BY CONSTRUCTION. `enforcement-outcome` maps to 'flag' in
 *      EVENT_EFFECT (a no-op on state), carries virtue_domain NULL, and is
 *      emitted ONLY through emitLedgerOnlyTrustEvents (insert-only: never
 *      folds, never touches a reflect timestamp). PA-6 re-run: it cannot raise
 *      oversight or any domain.
 *   2. THE GROUND IS OTHER-DIRECTED OR ABSENT — NEVER THE FIRST CIRCLE (L4).
 *      deriveEnforcementRecord returns TWO LANES: the enforcement entry whose
 *      `enforcementGround` cites only circles beyond `self_preservation`, and a
 *      separate, measure-only `firstCircleFinding` that never enters the
 *      enforcement entry. "The enforcement was triggered by the other-directed
 *      violation; the first-circle failure is recorded separately as a
 *      measure-only finding."
 *   3. CONSUMER-UNFORGEABLE. The entry is derived server-side from the
 *      guardrail's OWN Ed25519-signed verdict (re-verified here), for the agent
 *      the CREDENTIAL is bound to — never from a caller-supplied agent_id and
 *      never from a harness-side write.
 *
 * ─── The first-circle lane's ledger home is NAMED, not invented ─────────────
 * No first-circle event type exists in this codebase: the original build-plan
 * C1c (first-circle failure/demonstration classes) is a distinct, unscheduled
 * item that the record forbids silently absorbing. The finding is therefore
 * returned as a structured object and logged server-side by the emitter; its
 * ledger carrier is C1c-original's event class when that session runs. A
 * disclosed limit of this build.
 *
 * ─── Retroactivity: none, structurally ──────────────────────────────────────
 * The only producer is the deny-time seam; there is no backfill path (plan §6
 * item 2, the Q9a forward-only discipline by extension).
 *
 * DARK behind BOTH SUBSTRATE_TRUST_CORE_ENABLED and
 * SUBSTRATE_ENFORCEMENT_RECORD_ENABLED; the CHECK-widening migration
 * (supabase-agent-trust-events-enforcement-vocabulary-migration.sql) must land
 * before the flag is set.
 */

import { createHash } from 'crypto'
import type { KatorthomaProximity } from '@/lib/translation-sandwich/layer2-mechanisms'
import { verifyLayer2Signature } from '@/lib/translation-sandwich/layer2-verifier'
import type { SignedLayer2Assessment } from '@/lib/translation-sandwich/layer2-signer'
import { SELF_PRESERVATION_CIRCLE } from './constants'
import { isAcceptedAgentId } from '@/lib/substrate/trust-layer/accreditation/agent-id-vocabulary'
import type { TrustEvent } from './types'
import { isTrustCoreEnabled, isEnforcementRecordEnabled } from './trust-core-flag'
import { emitLedgerOnlyTrustEvents } from './trust-core-store'

// ============================================================================
// THE TWO VERBATIM TEXTS (mentor L5 + L7) live in the zero-import
// enforcement-clause.ts so the pure S10 composer can carry them inline without
// importing the store. Re-exported here for callers of this module.
// ============================================================================

import { COMPLIANCE_NOT_VIRTUE_CLAUSE, ENFORCEMENT_CONTEXT_MARKER } from './enforcement-clause'
export { COMPLIANCE_NOT_VIRTUE_CLAUSE, ENFORCEMENT_CONTEXT_MARKER }

// ============================================================================
// VOCABULARY
// ============================================================================

/** WHICH infrastructure acted. Only 'guardrail_deny' has a producer today.
 *  's11_intervention' is DECLARED for the intervention engine once the S11 flip
 *  happens, and is never emitted before that — the battery pins that no code
 *  path in this file produces it. */
export type EnforcementSource = 'guardrail_deny' | 's11_intervention'

export const ENFORCEMENT_SOURCES: readonly EnforcementSource[] = [
  'guardrail_deny',
  's11_intervention',
] as const

export type EnforcementGround =
  | { kind: 'other_directed'; circles: string[]; obligationStatus: 'violated' }
  | { kind: 'no_other_directed_ground'; basis: string }

/** The measure-only first-circle lane (L4): a `self_preservation` circle whose
 *  obligation the extraction read as violated, co-occurring with (or standing
 *  alone beside) the deny. NEVER cited as the enforcement ground. */
export interface FirstCircleFinding {
  circle: typeof SELF_PRESERVATION_CIRCLE
  obligationStatus: 'violated'
  justification: string | null
  /** True when an other-directed ground ALSO exists (the co-occurring case). */
  coOccurringWithOtherDirected: boolean
  /** The measure-only bound, stated on the lane itself. */
  bound: string
}

export const FIRST_CIRCLE_MEASURE_ONLY_BOUND =
  'Measure-only (mentor L4): the first circle remains measure-only even under ' +
  'logos-on enforcement. This finding is NOT the enforcement ground and moves no ' +
  'domain level. Its ledger carrier is the first-circle event class (the original ' +
  'build-plan C1c), not yet built; until then it is returned and logged, never ' +
  'ledgered.'

// ============================================================================
// THE PURE DERIVER (no I/O, no env, no clock beyond the injected `now`)
// ============================================================================

/** verifyLayer2Signature's result (structural — mirrors derive-trust-events.ts). */
type VerifyResult = { valid: true; key_id: string } | { valid: false; reason: string }
type VerifyFn = (signed: SignedLayer2Assessment, now: Date) => VerifyResult

export interface EnforcementRecordInput {
  agentId: string
  ownerUserId: string | null
  credentialRef: string | null
  /** The guardrail's signed verdict artifact (re-verified here; unverifiable ⇒
   *  no entry, R18f-parallel). */
  signedAssessment: SignedLayer2Assessment
  source: EnforcementSource
  /** The verdict the block rested on. ONLY 'do_not_proceed' is an enforced
   *  outcome — a caution is not enforcement (the action proceeds). */
  verdictRecommendation: string
  verdictProximity: KatorthomaProximity | null
  now: Date
  correlationId: string
  /** Injectable for the battery; defaults to the real verifier. */
  verify?: VerifyFn
}

export interface EnforcementRecordResult {
  enforcement: TrustEvent | null
  firstCircleFinding: FirstCircleFinding | null
  /** Why no enforcement entry was derived (null when one was). */
  refusal: 'not_a_deny' | 'unverifiable_artifact' | 'source_not_yet_producible' | null
}

type CircleLike = {
  circle?: unknown
  obligation_assessment?: { status?: unknown; justification?: unknown } | null
}

function isViolated(c: CircleLike): boolean {
  return c.obligation_assessment?.status === 'violated'
}

function circleName(c: CircleLike): string | null {
  const name = c.circle
  return typeof name === 'string' && name.trim() !== '' ? name : null
}

/**
 * Select the CITED GROUND (L4) from the signed assessment's circles.
 * Other-directed = a violated obligation on an IDENTIFIED circle beyond
 * `self_preservation` — MIRRORING (not calling; the codebase idiom is parallel
 * duplication over the shared SELF_PRESERVATION_CIRCLE constant, so the two
 * cannot drift on the constant's value but are not one function)
 * deriveWorstJusticeOutcome's and the kathekon predicate's encoding ("every
 * extraction circle beyond self_preservation contains other rational agents").
 * Strict on unknown identity: a nameless circle is never an other party. Pure;
 * exported for the battery.
 */
export function selectEnforcementGround(
  assessment: SignedLayer2Assessment['assessment'],
  verdictRecommendation: string,
  verdictProximity: KatorthomaProximity | null,
): { ground: EnforcementGround; firstCircle: FirstCircleFinding | null } {
  const circles = (assessment.oikeiosis?.relevant_circles ?? []) as CircleLike[]

  const otherDirected = circles
    .filter((c) => isViolated(c))
    .map(circleName)
    .filter((n): n is string => n !== null && n !== SELF_PRESERVATION_CIRCLE)
  // Deduplicate while preserving first-seen order.
  const cited = Array.from(new Set(otherDirected))

  const self = circles.find((c) => isViolated(c) && circleName(c) === SELF_PRESERVATION_CIRCLE)
  const firstCircle: FirstCircleFinding | null = self
    ? {
        circle: SELF_PRESERVATION_CIRCLE,
        obligationStatus: 'violated',
        justification:
          typeof self.obligation_assessment?.justification === 'string'
            ? self.obligation_assessment.justification
            : null,
        coOccurringWithOtherDirected: cited.length > 0,
        bound: FIRST_CIRCLE_MEASURE_ONLY_BOUND,
      }
    : null

  if (cited.length > 0) {
    return {
      ground: { kind: 'other_directed', circles: cited, obligationStatus: 'violated' },
      firstCircle,
    }
  }

  // No other-directed violated obligation was identified. The block still
  // happened (a kathekon-floor / proximity deny, or — the class L4 says the
  // infrastructure must not enforce on — a first-circle-only failure). The
  // ground says so explicitly; it NEVER names the self circle as the ground.
  const basis =
    firstCircle !== null
      ? 'no other-directed violated obligation identified; a first-circle finding stands alone and ' +
        'is recorded in its own measure-only lane, never as this ground (mentor L4)'
      : `no violated obligation on any circle; the block rested on the verdict alone ` +
        `(recommendation ${verdictRecommendation}, proximity ${verdictProximity ?? 'unknown'})`
  return { ground: { kind: 'no_other_directed_ground', basis }, firstCircle }
}

/**
 * Derive the enforcement-class entry (and the separate first-circle lane) from
 * an enforced outcome. Pure. Returns `enforcement: null` with a named refusal
 * when the input is not an enforced outcome, the artifact does not verify, or
 * the source has no producer yet.
 */
export function deriveEnforcementRecord(input: EnforcementRecordInput): EnforcementRecordResult {
  if (input.verdictRecommendation !== 'do_not_proceed') {
    return { enforcement: null, firstCircleFinding: null, refusal: 'not_a_deny' }
  }
  if (input.source !== 'guardrail_deny') {
    // 's11_intervention' is declared, not producible: the S11 flip is a separate,
    // later, founder-walked step, and nothing here may pre-empt it.
    return { enforcement: null, firstCircleFinding: null, refusal: 'source_not_yet_producible' }
  }
  const verify = input.verify ?? (verifyLayer2Signature as unknown as VerifyFn)
  const res = verify(input.signedAssessment, input.now)
  if (!res.valid) {
    return { enforcement: null, firstCircleFinding: null, refusal: 'unverifiable_artifact' }
  }

  const assessment = input.signedAssessment.assessment
  const { ground, firstCircle } = selectEnforcementGround(
    assessment,
    input.verdictRecommendation,
    input.verdictProximity,
  )

  const payload: TrustEvent['payload'] = {
    regime: 'logos-on-enforcement',
    enforcementSource: input.source,
    enforcementGround: ground,
    enforcementContextMarker: ENFORCEMENT_CONTEXT_MARKER,
    complianceNotVirtueClause: COMPLIANCE_NOT_VIRTUE_CLAUSE,
    verdictRecommendation: input.verdictRecommendation,
    verdictProximity: input.verdictProximity,
    proximityFloorsBasis: assessment.proximity_floors?.basis ?? null,
  }

  return {
    enforcement: {
      agentId: input.agentId,
      virtueDomain: null,
      eventType: 'enforcement-outcome',
      artifactKind: 'signed_layer2_assessment',
      artifactRef: `signed:${res.key_id}`,
      payload,
      occurredAt: input.now.toISOString(),
      correlationId: input.correlationId,
      ownerUserId: input.ownerUserId,
      credentialRef: input.credentialRef,
    },
    firstCircleFinding: firstCircle,
    refusal: null,
  }
}

/**
 * PR19 fold (2026-09-12, HIGH, proven by live mutation): the route's identity
 * choice was pinned only by a source regex, which a `enfCredCtx.agent_id ?? agent_id`
 * fallback defeated while re-opening forgery on credentials with no bound agent.
 * The choice now lives HERE, as a pure function with a runtime battery, and the
 * route must pass its result. It takes ONLY the credential context — there is no
 * parameter through which a caller-supplied body `agent_id` could be offered.
 * Returns null (⇒ no entry) unless the credential's bound agent id exists and is
 * in the accepted vocabulary.
 */
export function resolveEnforcementAgentId(credCtx: { agent_id: string | null }): string | null {
  const id = credCtx.agent_id
  return id !== null && isAcceptedAgentId(id) ? id : null
}

/** `enforce:<sha256(agentId|signature)[:32]>` — one deny, at most one entry
 *  (dedup by uq_ate_correlation, which has no agent_id column — hence the
 *  agent-id salt, the orientation F-2 lesson). */
export function computeEnforcementCorrelationId(agentId: string, signature: string): string {
  return (
    'enforce:' + createHash('sha256').update(agentId + '|' + signature).digest('hex').slice(0, 32)
  )
}

// ============================================================================
// THE EMITTER (the /api/guardrail deny-time seam's target)
// ============================================================================

export interface EnforcementEmissionInput {
  agentId: string
  credentialId: string
  ownerUserId: string | null
  signedAssessment: unknown
  verdictRecommendation: string
  verdictProximity: KatorthomaProximity | null
  now?: Date
  /** Injectable store seam for the battery (defaults to the real insert-only path). */
  emit?: (events: TrustEvent[]) => Promise<unknown>
  verify?: VerifyFn
}

export interface EnforcementEmissionOutcome {
  emitted: boolean
  firstCircleFinding: FirstCircleFinding | null
  reason: string | null
}

/**
 * Emit the enforcement entry for a guardrail deny. Gated behind BOTH flags
 * (re-checked HERE, not only at the route — defence in depth, the C1c PR19
 * fold). Never throws; the verdict is never affected. INSERT-ONLY emission.
 * The first-circle lane is returned to the caller and logged, never ledgered
 * (see the header).
 */
export async function emitEnforcementOutcomeTrustEvent(
  input: EnforcementEmissionInput,
): Promise<EnforcementEmissionOutcome> {
  try {
    if (!isTrustCoreEnabled() || !isEnforcementRecordEnabled()) {
      return { emitted: false, firstCircleFinding: null, reason: 'flag_off' }
    }
    const signed = input.signedAssessment as SignedLayer2Assessment | null | undefined
    if (
      !signed ||
      typeof signed.signature !== 'string' ||
      signed.signature.length === 0 ||
      !signed.assessment
    ) {
      return { emitted: false, firstCircleFinding: null, reason: 'no_signed_assessment' }
    }
    const now = input.now ?? new Date()
    const result = deriveEnforcementRecord({
      agentId: input.agentId,
      ownerUserId: input.ownerUserId,
      credentialRef: `api_key:${input.credentialId}`,
      signedAssessment: signed,
      source: 'guardrail_deny',
      verdictRecommendation: input.verdictRecommendation,
      verdictProximity: input.verdictProximity,
      now,
      correlationId: computeEnforcementCorrelationId(input.agentId, signed.signature),
      verify: input.verify,
    })
    if (result.firstCircleFinding !== null) {
      // The measure-only lane, logged and returned — never in the enforcement
      // entry, never ledgered (no first-circle event type exists yet).
      console.log(
        '[trust-core] enforcement-record: first-circle finding recorded in its own measure-only lane ' +
          `(co-occurring with other-directed ground: ${result.firstCircleFinding.coOccurringWithOtherDirected})`,
      )
    }
    if (result.enforcement === null) {
      return { emitted: false, firstCircleFinding: result.firstCircleFinding, reason: result.refusal }
    }
    const emit = input.emit ?? ((events: TrustEvent[]) => emitLedgerOnlyTrustEvents(events))
    await emit([result.enforcement])
    return { emitted: true, firstCircleFinding: result.firstCircleFinding, reason: null }
  } catch (e) {
    console.error('[trust-core] emitEnforcementOutcomeTrustEvent error:', (e as Error).message)
    return { emitted: false, firstCircleFinding: null, reason: 'threw' }
  }
}
