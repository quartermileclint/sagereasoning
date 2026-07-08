/**
 * direction-of-travel.ts — the canonical direction_of_travel vocabulary and the
 * trust-layer boundary mapper (Trust Layer S0b, ADR-013 §Vocabulary; founder
 * elections E1/E2 2026-07-08).
 *
 * Two vocabularies exist in the codebase for the same longitudinal signal:
 *
 *   - the ENGINE / D17 vocabulary — `layer2-mechanisms.ts` `DirectionOfTravel`:
 *     'improving' | 'stable' | 'declining' | 'single_snapshot'. CANONICAL
 *     (E1, ADR-013): every new wire surface, and every S1+ trust-layer store
 *     and event, uses this vocabulary.
 *
 *   - the reused trust-layer AGGREGATOR's vocabulary —
 *     `trust-layer/types/accreditation.ts` `DirectionOfTravel`:
 *     'improving' | 'stable' | 'regressing'. Kept INTERNALLY because the
 *     aggregator is reused as-is (PR15), and on the persisted accreditation
 *     contract (the write body's CarriedProfile + the public accreditation
 *     GET), which remains the documented legacy exception until a separate,
 *     deliberate migration (persisted rows + a validated write body are not
 *     a boundary-mapping concern).
 *
 * This module is the SINGLE mapping point between them. Wire surfaces that
 * source their value from the aggregator/record vocabulary (the M7
 * meta.trajectory overlay on /api/reason; the Sage Reflect completion
 * profile) map through toCanonicalDirectionOfTravel() at composition, so the
 * aggregator itself stays byte-identical and S1's trust events never inherit
 * the split. Pure — no I/O, no env reads.
 */

import type { DirectionOfTravel as TrustLayerDirectionOfTravel } from './trust-layer/types/accreditation'

/**
 * The canonical wire vocabulary (engine/D17; ADR-013). Note on
 * 'single_snapshot': the ENGINE's full union includes it as the no-trajectory
 * marker, but the trust-layer aggregator never produces it (it reads 'stable'
 * below its evidence threshold), so boundary-MAPPED surfaces emit only these
 * three values — sparse evidence is carried by each surface's own honesty
 * field (e.g. the overlay's `evidence: 'single_snapshot'`).
 */
export type CanonicalDirectionOfTravel = 'improving' | 'stable' | 'declining'

/**
 * Map a trust-layer aggregator/record direction onto the canonical
 * vocabulary. 'regressing' → 'declining'; the other two values are shared.
 * Total and pure — same signal, canonical term.
 */
export function toCanonicalDirectionOfTravel(
  dir: TrustLayerDirectionOfTravel,
): CanonicalDirectionOfTravel {
  return dir === 'regressing' ? 'declining' : dir
}
