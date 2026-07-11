/**
 * profile-seeding.ts — S9b G1c: calling records as the PRIMARY seeding mechanism
 * for the S2/S5 candidate profiles + function-type domain weights (ADR-013 §11;
 * the 2026-07-11 mentor verdicts, verbatim wins).
 *
 * The mentor's seeding logic, encoded: "each completed calling record contributes
 * to the agent's profile with a confidence weight at the purpose-declaration tier
 * — above nothing, below behavioural evidence, below credential evidence.
 * Multiple calling records in the same function-type domain accumulate, raising
 * the confidence of the domain weight toward the behavioural evidence tier. A
 * single calling record seeds the profile at low confidence. A consistent
 * calling record across multiple sessions seeds it at moderate confidence,
 * equivalent to the lower range of behavioural evidence."
 *
 * PURE LIB (the S5 election: profiles are validated shapes, not persisted). The
 * inputs are the server-persisted acknowledgement/calling records (the R18f-
 * parallel artifacts G1d derives events from); the output is a seeded partial
 * profile + its evidence tier for the discernment/weighting layers to consume.
 *
 * SCOPE (deliberate, recorded): the seeding COMPUTATION is built + battery-
 * pinned here; wiring seeded profiles into the LIVE discernment postures (an
 * un-profiled candidate lifting into a declaration-tier posture) is an S6-engine
 * change deferred to the S2/S10 refinement — the accumulation ladder needs real
 * records to exist first, and today the ledger holds none. Revisit condition:
 * the first candidate with ≥1 accumulated acknowledgement records.
 */

import type { PurposeAcknowledgement } from './collaboration-record'
import type { FunctionType } from './profiles'
import type { EvidenceTier } from './evidence-weighting'

/** The accumulation-ladder threshold: at this many CONSISTENT records the seed's
 *  confidence reads at the lower behavioural range (the mentor's "moderate
 *  confidence"). DERIVED (the mentor fixes the ladder's direction, not the
 *  count); tunable pending S10. */
export const CONSISTENT_RECORDS_FOR_BEHAVIOURAL_TIER = 3

export interface SeededCandidateProfile {
  schema: 'trust-seeded-candidate-profile-v1'
  candidateAgentId: string | null
  candidateRef: string | null
  /** The function types the records consistently declared (deduped, lowercased). */
  functionTypeScope: FunctionType[]
  /** The most recent declared purpose (declarations are priors that downstream
   *  evidence updates — the latest declaration is the operative one). */
  declaredPurpose: string
  /** Records contributing to this seed. */
  recordCount: number
  /** True ⇔ every record declares the same purpose (trimmed, case-insensitive)
   *  — the mentor's consistency condition for the ladder. */
  consistent: boolean
  /** The evidence tier this seed carries: 'declaration' (the default), rising to
   *  'behavioural-condition-matched' only at ≥CONSISTENT_RECORDS_FOR_BEHAVIOURAL_TIER
   *  CONSISTENT records (the mentor's "lower range of behavioural evidence"). */
  evidenceTier: Extract<EvidenceTier, 'declaration' | 'behavioural-condition-matched'>
  basis: string
}

/**
 * Seed a candidate profile from its accumulated acknowledgement/calling records.
 * Pure. Returns null when no records exist (nothing seeds from nothing — the
 * A6 un-profiled path stands).
 */
export function seedCandidateProfileFromCallingRecords(
  records: readonly PurposeAcknowledgement[],
): SeededCandidateProfile | null {
  if (records.length === 0) return null

  // Order by computedAt so "the most recent declaration is the operative one".
  const ordered = [...records].sort(
    (a, b) => Date.parse(a.computedAt) - Date.parse(b.computedAt),
  )
  const latest = ordered[ordered.length - 1]

  const purposes = new Set(
    ordered
      .map((r) => r.declaredPurpose.trim().toLowerCase())
      .filter((p) => p !== ''),
  )
  // Consistency requires EXACTLY ONE non-empty declared purpose (review nit,
  // 2026-07-12: all-empty declarations must not read as "consistent" and climb
  // the ladder on the strength of nothing).
  const consistent = purposes.size === 1

  const functionTypes = new Map<string, FunctionType>()
  for (const r of ordered) {
    const ft = r.scopeReceived.functionType
    const key = ft.trim().toLowerCase()
    if (key !== '') functionTypes.set(key, ft)
  }

  const ladderReached =
    consistent && ordered.length >= CONSISTENT_RECORDS_FOR_BEHAVIOURAL_TIER
  const evidenceTier = ladderReached ? 'behavioural-condition-matched' : 'declaration'

  return {
    schema: 'trust-seeded-candidate-profile-v1',
    candidateAgentId: latest.candidateAgentId,
    candidateRef: latest.candidateRef,
    functionTypeScope: [...functionTypes.values()],
    declaredPurpose: latest.declaredPurpose,
    recordCount: ordered.length,
    consistent,
    evidenceTier,
    basis: ladderReached
      ? `accumulation ladder: ${ordered.length} consistent records ⇒ lower-behavioural tier (G1c)`
      : `declaration tier: ${ordered.length} record(s)${consistent ? '' : ' (inconsistent purposes — held at declaration; a corroboration inconsistency is S2/S10 purpose-misrepresentation input)'}`,
  }
}
