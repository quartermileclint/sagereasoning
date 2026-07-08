/**
 * derive-trust-events.ts — turn verifiable examination artifacts into typed trust
 * events (the R18f-parallel emission core). Pure — no I/O, no env.
 *
 * THE R18f-PARALLEL GUARANTEE. deriveCredentialAndJusticeEvents RE-VERIFIES every
 * signed assessment (verifyLayer2Signature) and derives events ONLY from the ones
 * that verify against the published key. A tampered / unsigned / forged assessment
 * yields NO events. So the guarantee is STRUCTURAL + self-contained here — it does
 * not rely on the caller having run the provenance gate (though the accreditation
 * write already has). deriveReflectEvent gates on the honest-completion signals
 * (context_source = agent_stated + fabrication_risk != high). No trust event
 * without a verifiable examination artifact.
 *
 * SCOPE (E1 "also wire justice"): this session wires credential-completed +
 * reflect-completed-honest + the justice-surface events. The demonstrated per-
 * domain proximity is taken CONSERVATIVELY (the weakest across the verified
 * assessments engaging a domain — resisting gaming by one strong assessment);
 * S2 refines the proportional weighting (domain distance, coverage continuity,
 * confidence tiers).
 */

import {
  verifyLayer2Signature,
} from '@/lib/translation-sandwich/layer2-verifier'
import type { SignedLayer2Assessment } from '@/lib/translation-sandwich/layer2-signer'
import type {
  KatorthomaProximity,
  VirtueDomain,
} from '@/lib/translation-sandwich/layer2-mechanisms'
import { PROXIMITY_RANK } from './constants'
import type { CoverageStatus, TrustEvent } from './types'

/** verifyLayer2Signature's result (structural — avoids importing its private type). */
type VerifyResult = { valid: true; key_id: string } | { valid: false; reason: string }
type VerifyFn = (signed: SignedLayer2Assessment, now: Date) => VerifyResult

export interface CredentialJusticeInput {
  agentId: string
  ownerUserId: string | null
  credentialRef: string | null
  signedAssessments: SignedLayer2Assessment[]
  /** From the accreditation profile, when known (spec-4 coverage). Undefined ⇒
   *  presumed continuous (a completed R18f-verified write is a completed
   *  credential; only suspended/resumed-unverified downgrades the rise). */
  coverageStatus?: CoverageStatus
  now: Date
  /** Shared idempotency key for the fanned rows (the write's correlation). */
  correlationId: string
  /** Injectable for tests; defaults to the real Ed25519 verifier. */
  verify?: VerifyFn
}

/** Derive credential-completed (per engaged domain) + one justice-surface event
 *  from the VERIFIED signed assessments. Returns [] when none verify. */
export function deriveCredentialAndJusticeEvents(
  input: CredentialJusticeInput,
): TrustEvent[] {
  const verify = input.verify ?? (verifyLayer2Signature as unknown as VerifyFn)

  const verified: { assessment: SignedLayer2Assessment['assessment']; keyId: string }[] = []
  for (const signed of input.signedAssessments) {
    const res = verify(signed, input.now)
    if (res.valid) verified.push({ assessment: signed.assessment, keyId: res.key_id })
  }
  // R18f-parallel: no verified artifact ⇒ no trust event.
  if (verified.length === 0) return []

  const artifactRef = `signed:${verified[0].keyId}`
  const coverageContinuous =
    input.coverageStatus === undefined ? true : input.coverageStatus === 'continuous'

  const events: TrustEvent[] = []

  // --- credential-completed, one per engaged cardinal virtue domain. The
  //     demonstrated proximity for a domain is the WEAKEST across the verified
  //     assessments that engaged it (conservative). ---
  const demonstratedByDomain = new Map<VirtueDomain, KatorthomaProximity>()
  for (const v of verified) {
    const proximity = v.assessment.katorthoma_proximity
    for (const domain of v.assessment.virtue_domains_engaged) {
      const prev = demonstratedByDomain.get(domain)
      if (prev === undefined || PROXIMITY_RANK[proximity] < PROXIMITY_RANK[prev]) {
        demonstratedByDomain.set(domain, proximity)
      }
    }
  }
  for (const [domain, demonstratedProximity] of demonstratedByDomain) {
    events.push({
      agentId: input.agentId,
      virtueDomain: domain,
      eventType: 'credential-completed',
      artifactKind: 'signed_layer2_assessment',
      artifactRef,
      payload: {
        demonstratedProximity,
        coverageContinuous,
        ...(input.coverageStatus !== undefined ? { coverageStatus: input.coverageStatus } : {}),
        keyId: verified[0].keyId,
      },
      occurredAt: input.now.toISOString(),
      correlationId: input.correlationId,
      ownerUserId: input.ownerUserId,
      credentialRef: input.credentialRef,
    })
  }

  // --- one justice-surface event (dikaiosyne) = the WORST justice outcome across
  //     the verified assessments. ---
  const justice = deriveWorstJusticeOutcome(verified.map((v) => v.assessment))
  if (justice !== null) {
    events.push({
      agentId: input.agentId,
      virtueDomain: 'dikaiosyne',
      eventType: justice.eventType,
      artifactKind: 'signed_layer2_assessment',
      artifactRef,
      payload: { obligationStatus: justice.obligationStatus, keyId: verified[0].keyId },
      occurredAt: input.now.toISOString(),
      correlationId: input.correlationId,
      ownerUserId: input.ownerUserId,
      credentialRef: input.credentialRef,
    })
  }

  return events
}

type JusticeOutcome = {
  eventType:
    | 'justice-surface-violated'
    | 'justice-surface-unevaluated'
    | 'justice-surface-indeterminate'
    | 'justice-surface-transparently-handled'
  obligationStatus: 'violated' | 'unevaluated' | 'indeterminate' | 'met'
}

/**
 * The worst justice outcome across assessments: violated > unevaluated >
 * indeterminate > met > none. "unevaluated" is the marketing-email failure —
 * dikaiosyne engaged but no circle carried an obligation_assessment. Reads only
 * well-defined fields (obligation_assessment.status + virtue_domains_engaged).
 */
export function deriveWorstJusticeOutcome(
  assessments: SignedLayer2Assessment['assessment'][],
): JusticeOutcome | null {
  let sawViolated = false
  let sawUnevaluated = false
  let sawIndeterminate = false
  let sawMet = false

  for (const a of assessments) {
    const circles = a.oikeiosis?.relevant_circles ?? []
    const statuses = circles
      .map((c) => c.obligation_assessment?.status)
      .filter((s): s is 'met' | 'violated' | 'indeterminate' => s != null)

    if (statuses.includes('violated')) sawViolated = true
    if (statuses.includes('indeterminate')) sawIndeterminate = true
    if (statuses.includes('met')) sawMet = true

    // Unevaluated: dikaiosyne engaged but NO circle carried an obligation
    // assessment at all — the obligation was never evaluated.
    const dikaiosyneEngaged = a.virtue_domains_engaged.includes('dikaiosyne')
    if (dikaiosyneEngaged && statuses.length === 0) sawUnevaluated = true
  }

  if (sawViolated) return { eventType: 'justice-surface-violated', obligationStatus: 'violated' }
  if (sawUnevaluated)
    return { eventType: 'justice-surface-unevaluated', obligationStatus: 'unevaluated' }
  if (sawIndeterminate)
    return { eventType: 'justice-surface-indeterminate', obligationStatus: 'indeterminate' }
  if (sawMet)
    return { eventType: 'justice-surface-transparently-handled', obligationStatus: 'met' }
  return null
}

export interface ReflectInput {
  agentId: string
  ownerUserId: string | null
  credentialRef: string | null
  sessionId: string
  fabricationRiskLevel: 'low' | 'moderate' | 'high'
  contextSource: 'agent_stated' | 'harness_inferred' | null
  now: Date
  correlationId: string
}

/**
 * Derive a reflect-completed-honest event — but ONLY when the completion is
 * honest: context_source === 'agent_stated' (the agent's own verbatim words drove
 * it, not a harness inference) AND fabrication_risk_level !== 'high'. Otherwise
 * returns null (a harness-inferred or high-fabrication-risk completion is not a
 * trust-positive artifact). Agent-wide (virtue_domain = null) — it modulates
 * decay across the agent's domains, not one.
 */
export function deriveReflectEvent(input: ReflectInput): TrustEvent | null {
  const honest =
    input.contextSource === 'agent_stated' && input.fabricationRiskLevel !== 'high'
  if (!honest) return null

  return {
    agentId: input.agentId,
    virtueDomain: null,
    eventType: 'reflect-completed-honest',
    artifactKind: 'reflect_completion',
    artifactRef: `reflect:${input.sessionId}`,
    payload: {
      fabricationRiskLevel: input.fabricationRiskLevel,
      contextSource: input.contextSource,
    },
    occurredAt: input.now.toISOString(),
    correlationId: input.correlationId,
    ownerUserId: input.ownerUserId,
    credentialRef: input.credentialRef,
  }
}
