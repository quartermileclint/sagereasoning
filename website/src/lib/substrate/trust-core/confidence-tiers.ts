/**
 * confidence-tiers.ts — Trust Layer S2: mentor A5, per-verdict confidence, as a
 * pure deterministic function.
 *
 * BINDING SPEC (mentor A5, verbatim in
 * operations/trust-layer-2026-07/2026-07-07-mentor-nine-answers-verbatim.md;
 * ADR-013 §5 A5). Seven canonical tiers, highest → lowest confidence:
 *   1. Deep,     signed,   corroborated,   recent   → maximum
 *   2. Standard, signed,   corroborated,   recent
 *   3. Deep/std, signed,   UNcorroborated, recent   (corroboration absent — the
 *                                                     extraction gameable surface
 *                                                     is undefended on the catchable half)
 *   4. Deep/std, signed,   corroborated,   AGED     (recency absent — A3 decay has
 *                                                     begun eroding toward the prior)
 *   5. QUICK,    signed,   corroborated,   recent   (depth is the limiter — a quick
 *                                                     screen is triage, not examination)
 *   6. Any depth, UNSIGNED, any corroboration, any recency (not cryptographically verifiable)
 *   7. Profile-prior only  — no examination, no credential, no history (§6 baseline)
 *
 * Stated as a rule (verbatim): "Depth > Signature > Corroboration > Recency. Each
 * dimension is a multiplier on the base confidence, not an additive component. A
 * verdict that is deep but unsigned does not compensate for the missing signature
 * by being deeper. THE WEAKEST DIMENSION SETS THE CEILING."
 *
 * ENCODING OF RECORD. The seven tiers ARE the specification; the "multiplier"
 * language describes the mechanism, the tier list is authoritative. We assign a
 * verdict to its tier by the WEAKEST (most-penalising) dimension drop — the
 * ceiling semantics: each dropped dimension imposes a floor (a worst-possible
 * tier), and the FINAL tier is the worst floor across all dropped dimensions. So
 * strengthening a dimension that is NOT the weakest cannot raise the tier (no
 * compensation), and any single drop from the all-max verdict strictly lowers it.
 *
 * The per-dimension floors (each floor is a distinct tier number, so the max is
 * unambiguous):
 *   signature = unsigned      → floor 6 (a hard gate: unsigned caps at 6 regardless)
 *   depth     = quick         → floor 5
 *   recency   = aged          → floor 4
 *   corrob.  != corroborated  → floor 3   (uncorroborated OR contradicted; see note)
 *   depth     = standard      → floor 2
 *   (nothing dropped)         → tier 1
 * tier = max(applicable floors). Profile-prior-only (no verdict at all) = tier 7.
 *
 * `contradicted` NOTE. The mentor's A5 names only corroborated / uncorroborated.
 * The live corroboration vocabulary also carries `contradicted` (the catchable
 * harm-in-text case — already floored to reflexive at PROXIMITY by the live
 * monotone override). For the A5 CONFIDENCE dimension, `contradicted` is treated
 * as "not corroborated" (floor 3, same as uncorroborated): it does not
 * corroborate the self-report claim. The proximity floor is a separate axis
 * (S1/live engine); this function scores examinability/corroboration-support, not
 * the verdict's proximity. Disclosed design decision — `ceilingDimension` still
 * distinguishes the two via the input.
 *
 * Pure — no I/O, no env, no clock. `recency` is supplied by the caller (derived
 * from the A3 decay state: aged ⇔ decayStepsApplied > 0 / past the onset); this
 * keeps S2 decoupled from now(). The output TIER is canonical (mentor-fixed); the
 * `weight` scalar is a DERIVED monotone convenience for S3's weighted combination
 * — the mentor fixes the ORDERING, not the magnitudes (see CONFIDENCE_TIER_WEIGHT).
 */

import type { ReasonDepth } from '@/lib/depth-constants'
import type { CorroborationFindingStatus } from '@/lib/translation-sandwich/corroboration-check'

/** A5 Depth dimension — reuses the engine's canonical examination depth. */
export type ExaminationDepth = ReasonDepth // 'quick' | 'standard' | 'deep'

/** A5 Signature dimension. */
export type SignatureState = 'signed' | 'unsigned'

/** A5 Corroboration dimension — reuses the live corroboration finding vocabulary. */
export type CorroborationState = CorroborationFindingStatus // 'corroborated' | 'uncorroborated' | 'contradicted'

/** A5 Recency dimension — the caller derives this from the A3 decay state. */
export type RecencyState = 'recent' | 'aged'

/** The four quality dimensions of a single signed examination verdict (A5). */
export interface VerdictQualityDimensions {
  depth: ExaminationDepth
  signature: SignatureState
  corroboration: CorroborationState
  recency: RecencyState
}

/** The canonical seven confidence tiers (1 = highest confidence, 7 = lowest). */
export type ConfidenceTier = 1 | 2 | 3 | 4 | 5 | 6 | 7

/** Which dimension imposed the ceiling (the weakest / most-penalising drop). */
export type CeilingDimension =
  | 'depth'
  | 'signature'
  | 'corroboration'
  | 'recency'
  | 'none' // tier 1 — nothing dropped
  | 'no-examination' // tier 7 — profile prior only

export interface ConfidenceAssessment {
  /** The canonical A5 tier (mentor-fixed). */
  tier: ConfidenceTier
  /**
   * A monotone-decreasing scalar in (0, 1] — DERIVED (not mentor-specified
   * magnitudes; the mentor fixes only the ordering). For S3's weighted
   * combination. Strictly decreasing in `tier`, so worse evidence ⇒ strictly
   * lower weight, tier-over-tier.
   */
  weight: number
  /** The dimension that set the ceiling (the weakest drop). */
  ceilingDimension: CeilingDimension
  label: string
  rationale: string
}

/**
 * Per-tier monotone weight scalar. DERIVED convenience for S3 — the mentor fixes
 * the seven-tier ordering, not these magnitudes. Strictly decreasing (each tier's
 * weight < the previous), so `assessConfidence` respects "worse evidence ⇒
 * strictly lower confidence" at the scalar level. Tunable pending S3/S9 input; the
 * TIER is the canonical output, not the scalar.
 */
export const CONFIDENCE_TIER_WEIGHT: Record<ConfidenceTier, number> = {
  1: 1.0,
  2: 0.85,
  3: 0.7,
  4: 0.55,
  5: 0.4,
  6: 0.2,
  7: 0.1,
}

const TIER_LABEL: Record<ConfidenceTier, string> = {
  1: 'deep, signed, corroborated, recent',
  2: 'standard, signed, corroborated, recent',
  3: 'signed, uncorroborated, recent (corroboration absent)',
  4: 'signed, corroborated, aged (recency absent — decay begun)',
  5: 'quick screen, signed, corroborated, recent (depth-limited triage)',
  6: 'unsigned (not cryptographically verifiable)',
  7: 'profile-prior only (no examination)',
}

/**
 * Score a single signed examination verdict onto its A5 confidence tier. Pass
 * `null` for a profile-prior-only assessment (no verdict) → tier 7. Pure.
 */
export function assessConfidence(
  dims: VerdictQualityDimensions | null,
): ConfidenceAssessment {
  // Tier 7 — profile prior only (no examination artifact at all).
  if (dims === null) {
    return build(7, 'no-examination', 'no examination artifact — profile prior only (A5 tier 7)')
  }

  // Tier 6 — unsigned is a hard gate: an unsigned verdict cannot be
  // cryptographically verified, so it caps at tier 6 regardless of depth,
  // corroboration, or recency (mentor A5 tier 6).
  if (dims.signature === 'unsigned') {
    return build(6, 'signature', 'unsigned — reproducibility guarantee absent (A5 tier 6)')
  }

  // Signed verdict: the tier is the WEAKEST (worst) floor across the dropped
  // dimensions. Each floor is a distinct tier number, so max() is unambiguous.
  const floors: { floor: ConfidenceTier; dim: CeilingDimension }[] = [
    { floor: 1, dim: 'none' },
  ]
  if (dims.depth === 'standard') floors.push({ floor: 2, dim: 'depth' })
  if (dims.corroboration !== 'corroborated') floors.push({ floor: 3, dim: 'corroboration' })
  if (dims.recency === 'aged') floors.push({ floor: 4, dim: 'recency' })
  if (dims.depth === 'quick') floors.push({ floor: 5, dim: 'depth' })

  // Worst floor wins (highest tier number = lowest confidence = weakest dimension
  // sets the ceiling). Unique max ⇒ unambiguous ceiling dimension.
  let worst = floors[0]
  for (const f of floors) if (f.floor > worst.floor) worst = f

  const rationale = ceilingRationale(worst.dim, dims)
  return build(worst.floor, worst.dim, rationale)
}

function build(
  tier: ConfidenceTier,
  ceilingDimension: CeilingDimension,
  rationale: string,
): ConfidenceAssessment {
  return {
    tier,
    weight: CONFIDENCE_TIER_WEIGHT[tier],
    ceilingDimension,
    label: TIER_LABEL[tier],
    rationale,
  }
}

function ceilingRationale(
  dim: CeilingDimension,
  dims: VerdictQualityDimensions,
): string {
  switch (dim) {
    case 'none':
      return 'all four quality dimensions present — deep, signed, corroborated, recent (A5 tier 1)'
    case 'depth':
      return dims.depth === 'quick'
        ? 'quick screen — depth is the limiting dimension; triage, not examination (A5 tier 5)'
        : 'standard depth — one notch below deep (A5 tier 2)'
    case 'corroboration':
      return `corroboration = ${dims.corroboration} — self-report not positively corroborated against the text (A5 tier 3)`
    case 'recency':
      return 'aged — A3 decay has begun eroding the credential toward the profile prior (A5 tier 4)'
    default:
      return 'confidence ceiling'
  }
}

/** Convenience: the profile-prior-only confidence assessment (A5 tier 7). */
export const PROFILE_PRIOR_CONFIDENCE: ConfidenceAssessment = assessConfidence(null)
