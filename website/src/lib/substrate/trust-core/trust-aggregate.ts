/**
 * trust-aggregate.ts — the read path: per-domain effective trust (earned + A3
 * decay + the justice cap) and the mentor spec-4 / spec-6 MINIMUM-DOMAIN
 * aggregate.
 *
 * Mentor spec 6 (the aggregation rule): "Aggregate trust = minimum domain trust
 * level, modified by justice surface evaluation, weighted by coverage continuity
 * and source confidence, with conflicts escalating to pause rather than averaging
 * to proceed." S1 computes the DETERMINISTIC minimum-domain core + the justice
 * cap; the coverage/source-confidence WEIGHTING and cross-source CONFLICT→pause
 * are S2/S3 extensions (the seam is marked). The aggregate is taken over the
 * domains that actually carry earned evidence — an un-evaluated domain is
 * UNKNOWN (surfaced as a coverage gap), not silently treated as low or high.
 *
 * Pure; `now` injected (E3 lazy-on-read — a live value).
 */

import type { KatorthomaProximity, VirtueDomain } from '@/lib/translation-sandwich/layer2-mechanisms'
import type {
  AggregateTrust,
  EarnedDomainState,
  EffectiveDomainTrust,
  TrustProfile,
  VirtueTrustDomain,
} from './types'
import { CARDINAL_VIRTUE_DOMAINS } from './types'
import { DELIBERATE_RANK, PROXIMITY_RANK, rankToProximity } from './constants'
import { decayEarnedRank } from './trust-decay'

/**
 * Compute the LIVE effective trust for one domain: apply A3 decay to the earned
 * level, then the justice cap (deliberate) when the latch is active. Pure.
 */
export function computeEffectiveDomain(
  virtueDomain: VirtueTrustDomain,
  state: EarnedDomainState,
  now: Date,
): EffectiveDomainTrust {
  const decay = decayEarnedRank({
    earnedLevel: state.earnedLevel,
    profilePrior: state.profilePrior,
    lastDomainActivityAt: state.lastDomainActivityAt,
    volatility: state.volatility,
    reflectLastHonestAt: state.reflectLastHonestAt,
    now,
  })

  let effRank = decay.rank
  const justiceCapped = state.justiceFloorActive
  if (justiceCapped && effRank > DELIBERATE_RANK) {
    effRank = DELIBERATE_RANK
  }

  const earnedRank = PROXIMITY_RANK[state.earnedLevel]
  const priorRank = PROXIMITY_RANK[state.profilePrior]
  const hasEvidence =
    state.lastDomainActivityAt !== null ||
    earnedRank !== priorRank ||
    state.justiceFloorActive

  return {
    virtueDomain,
    effectiveLevel: rankToProximity(effRank) as KatorthomaProximity,
    earnedLevel: state.earnedLevel,
    profilePrior: state.profilePrior,
    decayStepsApplied: decay.stepsApplied,
    justiceCapped,
    reflectModulated: decay.reflectModulated,
    coverageStatus: state.coverageStatus,
    hasEvidence,
  }
}

/**
 * Build an agent's full trust profile from its per-domain earned states.
 * Deterministic; `now` injected. The aggregate is the minimum effective level
 * across the domains that carry earned evidence; the un-evaluated cardinal
 * virtues are surfaced as a coverage/scoping gap (mentor spec 5 oikeiosis).
 */
export function computeTrustProfile(
  agentId: string,
  states: Map<VirtueTrustDomain, EarnedDomainState>,
  now: Date,
): TrustProfile {
  const domains: EffectiveDomainTrust[] = []
  for (const [domain, state] of states) {
    domains.push(computeEffectiveDomain(domain, state, now))
  }
  // Stable order by domain name (deterministic output).
  domains.sort((a, b) => a.virtueDomain.localeCompare(b.virtueDomain))

  const evaluated = domains.filter((d) => d.hasEvidence)

  // Cardinal-virtue coverage gap (oversight excluded — a role domain, not a
  // cardinal virtue).
  const evaluatedNames = new Set(evaluated.map((d) => d.virtueDomain))
  const unevaluatedCardinalDomains: VirtueDomain[] = CARDINAL_VIRTUE_DOMAINS.filter(
    (d) => !evaluatedNames.has(d),
  )

  const aggregate = computeAggregate(evaluated)

  return {
    schema: 'agent-trust-profile-v1',
    agentId,
    domains,
    aggregate,
    unevaluatedCardinalDomains,
    sparse: evaluated.length === 0,
  }
}

/**
 * The minimum-domain aggregate over the evaluated domains (mentor spec 6). The
 * coverage/source-confidence weighting + the cross-source conflict→pause are the
 * S2/S3 extension (this is the deterministic minimum-domain core).
 */
export function computeAggregate(
  evaluated: EffectiveDomainTrust[],
): AggregateTrust {
  if (evaluated.length === 0) {
    return {
      level: null,
      limitingDomain: null,
      basis: 'no evaluated domains — profile-prior only',
      anyJusticeCapped: false,
    }
  }

  let limiting = evaluated[0]
  for (const d of evaluated) {
    if (PROXIMITY_RANK[d.effectiveLevel] < PROXIMITY_RANK[limiting.effectiveLevel]) {
      limiting = d
    }
  }
  const anyJusticeCapped = evaluated.some((d) => d.justiceCapped)

  return {
    level: limiting.effectiveLevel,
    limitingDomain: limiting.virtueDomain,
    basis:
      `minimum-domain rule across ${evaluated.length} evaluated domain(s): ` +
      `${limiting.virtueDomain}=${limiting.effectiveLevel}` +
      (anyJusticeCapped ? ' (justice cap active)' : ''),
    anyJusticeCapped,
  }
}
