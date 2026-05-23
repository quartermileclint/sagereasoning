/**
 * proximity-domains.ts — SR-15 per-virtue-domain katorthoma proximity (Stage A, A-4).
 *
 * Built at the Sage Reflect build Stage A session. Implements the founder lock
 * election SR-15 in /adopted/sage-reflect-product-design.md: Sage Assent
 * stores only an AGGREGATE typical_proximity — there is no per-virtue-domain
 * field — so Sage Reflect computes per-domain proximity ITSELF from the Q4 action
 * evidence and stores it Sage-Reflect-side.
 *
 * THE COMPUTATION (deterministic, pure, no I/O)
 * ---------------------------------------------
 *  • PER DOMAIN (KP-03): for each cardinal virtue domain (phronesis / dikaiosyne /
 *    andreia / sophrosyne), gather every Q4 action that ENGAGED that domain and
 *    take the WEAKEST proximity among them (lowest rank). The weakest-link reading
 *    within a domain is the conservative, unity-thesis-consistent choice — a single
 *    weak action in a domain is not masked by stronger ones. A domain engaged by no
 *    action is `null` (no evidence this session).
 *  • AGGREGATE (KP-04, the unity thesis): the aggregate is the LOWEST proximity
 *    across the non-null domains — virtue is one; the agent is only as close to
 *    katorthoma as its weakest cardinal domain. All domains null → aggregate null.
 *
 * KNOWN-RISK (recorded at lock): a future native Sage Assent per-domain field
 * must reconcile with this Sage-Reflect-side computation — flagged for the Sage
 * Assent enhancement track (SR-15). Until then this is the home for KP-03/04.
 *
 * R4: this is engine-internal; only the resulting proximity levels are surfaced
 * (on the output schema's katorthoma_proximity_by_domain field). The per-action
 * derivation is never exposed.
 */

import type { KatorthomaProximityLevel } from '@/lib/substrate/trust-layer/types/accreditation'
import { PROXIMITY_RANK } from '@/lib/substrate/trust-layer/accreditation/accreditation-record'
import type { KathekonAssessment, VirtueDomain } from './engine'

/** The four cardinal domains, in the canonical order. */
export const VIRTUE_DOMAINS: readonly VirtueDomain[] = [
  'phronesis',
  'dikaiosyne',
  'andreia',
  'sophrosyne',
]

/** Per-virtue-domain proximity breakdown + the KP-04 aggregate (lowest domain). */
export interface PerDomainProximity {
  readonly phronesis: KatorthomaProximityLevel | null
  readonly dikaiosyne: KatorthomaProximityLevel | null
  readonly andreia: KatorthomaProximityLevel | null
  readonly sophrosyne: KatorthomaProximityLevel | null
  /** KP-04 unity rule: lowest non-null domain. null when all domains are null. */
  readonly aggregate: KatorthomaProximityLevel | null
}

/** The lowest-rank proximity among a set (weakest link). null if the set is empty. */
function weakest(levels: readonly KatorthomaProximityLevel[]): KatorthomaProximityLevel | null {
  if (levels.length === 0) return null
  return levels.reduce((lo, l) => (PROXIMITY_RANK[l] < PROXIMITY_RANK[lo] ? l : lo))
}

/**
 * Compute the per-domain proximity breakdown + the KP-04 aggregate from a set of
 * Q4 kathekon assessments. Pure + deterministic.
 *
 * @param actions the session's Q4 action assessments (each carries proximity +
 *                virtue_domains_engaged).
 */
export function computePerDomainProximity(
  actions: readonly KathekonAssessment[],
): PerDomainProximity {
  const byDomain: Record<VirtueDomain, KatorthomaProximityLevel[]> = {
    phronesis: [],
    dikaiosyne: [],
    andreia: [],
    sophrosyne: [],
  }

  for (const action of actions) {
    for (const domain of action.virtue_domains_engaged) {
      // Defensive: ignore any domain outside the cardinal four.
      if (domain in byDomain) byDomain[domain].push(action.proximity)
    }
  }

  const phronesis = weakest(byDomain.phronesis)
  const dikaiosyne = weakest(byDomain.dikaiosyne)
  const andreia = weakest(byDomain.andreia)
  const sophrosyne = weakest(byDomain.sophrosyne)

  // KP-04 unity rule: aggregate = lowest non-null domain.
  const present = [phronesis, dikaiosyne, andreia, sophrosyne].filter(
    (l): l is KatorthomaProximityLevel => l !== null,
  )
  const aggregate = weakest(present)

  return { phronesis, dikaiosyne, andreia, sophrosyne, aggregate }
}
