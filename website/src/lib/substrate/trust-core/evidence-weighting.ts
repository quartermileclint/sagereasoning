/**
 * evidence-weighting.ts — Trust Layer S2: mentor A2 (domain distance) + the three
 * evidence tiers + the justice-surface modifier, as pure deterministic functions.
 *
 * BINDING SPECS (verbatim in
 * operations/trust-layer-2026-07/2026-07-07-mentor-nine-answers-verbatim.md;
 * ADR-013 §3 row 2 + §5 A2).
 *
 * ─── A2 — domain distance ───────────────────────────────────────────────────
 * Distance is FUNCTIONAL ROLE OVERLAP on virtue-domain demands, NOT task-content
 * similarity. The DEPLOYER defines the function-type taxonomy at integration time
 * (never a canonical one); each function type carries a four-virtue-domain weight
 * profile (which domains it exercises, at what weight). Domain distance between
 * two function types = Σ|Δweights| across the four domains. A credential earned in
 * function A transfers to function B PER-DIMENSION at a proportional discount:
 * "full weight on the phronesis dimension … reduced weight on the dikaiosyne
 * dimension" for two functions that share phronesis but diverge on dikaiosyne.
 *
 * PRACTICAL FLOOR (load-bearing safety property): above the deployer-set
 * threshold, credential confidence in the target domain is ZERO ("equivalent to
 * no credential"), and "the infrastructure enforces that a zero-confidence
 * credential does not contribute to a proceed verdict on a task requiring that
 * domain." DOMAIN-SCOPED (ADR-013 §5 A2, the S0b fold): the SAME credential may
 * still contribute on tasks requiring domains where its per-dimension confidence
 * is nonzero.
 *
 * PER-DIMENSION TRANSFER FORMULA (encoding of record). For each virtue domain d,
 * the transfer factor τ_d ∈ [0,1] is the normalised agreement between the
 * credential function's weight on d and the task function's weight on d:
 *     τ_d = 1 − |cred.w[d] − task.w[d]| / (cred.w[d] + task.w[d])   (cred.w[d] > 0)
 *     τ_d = 0   when the credential never exercised d (cred.w[d]=0) — no evidence
 *               in d transfers to a task requiring d (the mentor's LITERAL
 *               boundary), regardless of the task's own weight on d; this also
 *               covers the both-zero case safely (never a spurious full match).
 * This is SCALE-FREE (no arbitrary normaliser) and has the correct boundary
 * behaviour: a credential that NEVER exercised domain d (cred.w[d]=0) transfers
 * ZERO to a task requiring d (τ_d = 0) — it earned no evidence in the domain the
 * task needs. It reproduces the mentor's example: data-analysis→communication,
 * phronesis shared ⇒ τ≈1 (full), dikaiosyne divergent ⇒ τ reduced. The mentor
 * fixes the proportionality + the boundary, not the exact curve; this normalised
 * difference is the documented encoding.
 *
 * ─── The three evidence tiers (spec 2) ──────────────────────────────────────
 * credential (highest; scoped by coverage continuity + domain distance) >
 * behavioural condition-matched > profile prior. Monotone weights (derived; the
 * mentor fixes the ORDERING).
 *
 * ─── The justice-surface modifier (spec 2) ──────────────────────────────────
 * "A task affecting non-consenting parties requires credential coverage of the
 * JUSTICE-EVALUATION FUNCTION, not just the task function." When the task has a
 * justice surface AND the credential does not cover the justice-evaluation
 * function, the evidence weight is reduced (a multiplicative deficit ≤ 1).
 *
 * Pure — no I/O, no env, no clock. S3 (the combiner, Critical at wiring) composes
 * these across sources; S4 (the intervention engine) reads them. This file does
 * NOT modify the S1 transition/aggregate engine — it is the layer S3 folds onto
 * the stored state at combine time (the S2 seams marked in trust-transition.ts /
 * trust-aggregate.ts).
 */

import type { VirtueDomain } from '@/lib/translation-sandwich/layer2-mechanisms'
import { CARDINAL_VIRTUE_DOMAINS } from './types'
import type { ConfidenceAssessment } from './confidence-tiers'

// ════════════════════════════════════════════════════════════════════════════
// A2 — domain distance + per-dimension credential transfer
// ════════════════════════════════════════════════════════════════════════════

/** A deployer-defined function type + its four-virtue-domain weight profile (A2). */
export interface FunctionTypeProfile {
  functionType: string
  /** Non-negative weights over the four cardinal virtues (deployer-defined). A
   *  domain the function does not exercise carries weight 0. */
  domainWeights: Record<VirtueDomain, number>
}

/** Deployer-set thresholds for the A2 zero-confidence floor (integration-time). */
export interface DeployerDistanceThresholds {
  /**
   * Per-dimension transfer floor: a domain whose τ_d ≤ this is ZEROED (confidence
   * zero in that domain — "equivalent to no credential" for that domain). Default
   * 0 ⇒ only an exact-zero transfer zeroes; a deployer raises it (e.g. 0.25) to
   * zero out weak transfers.
   */
  perDomainTransferFloor?: number
  /**
   * Optional TOTAL-distance cutoff (the mentor's "domain distance above a
   * specified threshold"): when Σ|Δweights| ≥ this, EVERY domain is zeroed (the
   * whole credential is zero-confidence). Omitted ⇒ no total cutoff (per-domain
   * floor only).
   */
  totalDistanceCutoff?: number
}

/** One domain's transfer factor + whether the deployer floor zeroed it. */
export interface DomainTransferFactor {
  /** τ_d ∈ [0,1]; 0 when the domain is zeroed. */
  factor: number
  /** True ⇔ the deployer threshold floored this domain to zero. */
  zeroed: boolean
}

/** The per-dimension transfer of a credential's evidence to a task function (A2). */
export interface CredentialTransfer {
  credentialFunction: string
  taskFunction: string
  /** Σ|Δweights| across the four cardinal virtues. */
  totalDistance: number
  /** Per-cardinal-virtue transfer factor + zero-floor flag. */
  perDomain: Record<VirtueDomain, DomainTransferFactor>
}

/** Domain distance between two function types = Σ|Δweights| (A2, verbatim). Pure. */
export function domainDistance(
  a: FunctionTypeProfile,
  b: FunctionTypeProfile,
): number {
  let sum = 0
  for (const d of CARDINAL_VIRTUE_DOMAINS) {
    sum += Math.abs((a.domainWeights[d] ?? 0) - (b.domainWeights[d] ?? 0))
  }
  return sum
}

/**
 * Per-dimension transfer factor τ_d = normalised agreement on domain d. Pure.
 * A credential that never exercised d (cred.w[d]=0) ⇒ τ=0 — no evidence to
 * transfer, INCLUDING the both-zero case (never a spurious "full match" a
 * justice-surface-via-context task could ride to a proceed). Otherwise
 * τ = 1 − |cred.w[d] − task.w[d]| / (cred.w[d] + task.w[d]) ∈ [0,1].
 */
function transferFactorForDomain(
  credWeight: number,
  taskWeight: number,
): number {
  // Fail-safe: a non-finite or negative deployer weight is treated as 0 (no
  // exercise). A malformed credential weight on a REQUIRED domain then yields
  // τ=0 ⇒ cannot contribute (the safe direction), never a spurious full transfer.
  const c = Number.isFinite(credWeight) && credWeight > 0 ? credWeight : 0
  const t = Number.isFinite(taskWeight) && taskWeight > 0 ? taskWeight : 0
  // A credential that NEVER exercised domain d carries no evidence in d: it
  // transfers ZERO to any task requiring d (mentor A2's literal boundary — "a
  // credential that never exercised d transfers zero to a task requiring d"),
  // regardless of how the task's own weight on d is modelled. This also makes the
  // BOTH-ZERO case safe: a domain neither profile exercises yields τ=0, never a
  // spurious "full match" that a justice-surface-via-context task (task weight 0 on
  // the justice domain, surface signalled through JusticeSurfaceContext) could ride
  // to a proceed. The zero τ is then floored (zeroed) in computeCredentialTransfer.
  if (c === 0) return 0
  const denom = c + t // ≥ c > 0 here
  const factor = 1 - Math.abs(c - t) / denom
  // Clamp against FP drift; the formula is already in [0,1].
  return Math.max(0, Math.min(1, factor))
}

/**
 * Compute the A2 per-dimension credential transfer from a credential's examined
 * function to a task's function, applying the deployer zero-confidence floor.
 * Pure. The zeroed domains are the load-bearing safety output — enforced by
 * `credentialCanContribute` / `weighEvidence`.
 */
export function computeCredentialTransfer(
  credentialFn: FunctionTypeProfile,
  taskFn: FunctionTypeProfile,
  thresholds: DeployerDistanceThresholds = {},
): CredentialTransfer {
  const perDomainFloor = thresholds.perDomainTransferFloor ?? 0
  const totalDistance = domainDistance(credentialFn, taskFn)
  const totalCutoffHit =
    thresholds.totalDistanceCutoff !== undefined &&
    totalDistance >= thresholds.totalDistanceCutoff

  const perDomain = {} as Record<VirtueDomain, DomainTransferFactor>
  for (const d of CARDINAL_VIRTUE_DOMAINS) {
    const raw = transferFactorForDomain(
      credentialFn.domainWeights[d] ?? 0,
      taskFn.domainWeights[d] ?? 0,
    )
    // Zero-floor: the total-distance cutoff zeroes every domain; otherwise a
    // per-dimension factor at/below the floor is zeroed for that domain.
    const zeroed = totalCutoffHit || raw <= perDomainFloor
    perDomain[d] = { factor: zeroed ? 0 : raw, zeroed }
  }

  return {
    credentialFunction: credentialFn.functionType,
    taskFunction: taskFn.functionType,
    totalDistance,
    perDomain,
  }
}

/**
 * THE A2 ENFORCEMENT PRIMITIVE. Can this credential's transfer contribute to a
 * PROCEED verdict on a task requiring `requiredDomain`? False ⇔ the domain is
 * zeroed / factor 0 ("a zero-confidence credential does not contribute to a
 * proceed verdict on a task requiring that domain"). Domain-scoped: the same
 * credential may return true for a domain where its transfer is nonzero. Pure.
 */
export function credentialCanContribute(
  transfer: CredentialTransfer,
  requiredDomain: VirtueDomain,
): boolean {
  const t = transfer.perDomain[requiredDomain]
  return t !== undefined && !t.zeroed && t.factor > 0
}

// ════════════════════════════════════════════════════════════════════════════
// The three evidence tiers (spec 2)
// ════════════════════════════════════════════════════════════════════════════

/** Evidence source tier (spec 2): credential > behavioural condition-matched > prior. */
export type EvidenceTier =
  | 'credential'
  | 'behavioural-condition-matched'
  | 'profile-prior'

/**
 * Monotone tier weights. DERIVED (the mentor fixes the ORDERING credential >
 * behavioural > profile-prior, not these magnitudes). Strictly decreasing.
 * Tunable pending S3/S9.
 */
export const EVIDENCE_TIER_WEIGHT: Record<EvidenceTier, number> = {
  credential: 1.0,
  'behavioural-condition-matched': 0.6,
  'profile-prior': 0.25,
}

// ════════════════════════════════════════════════════════════════════════════
// The justice-surface modifier (spec 2)
// ════════════════════════════════════════════════════════════════════════════

export interface JusticeSurfaceContext {
  /** The task affects a non-consenting party (a justice surface is present). */
  taskHasJusticeSurface: boolean
  /** The credential covers the JUSTICE-EVALUATION function, not just the task function. */
  credentialCoversJusticeEvaluation: boolean
}

/**
 * The deficit factor when a justice surface is present but the credential does
 * NOT cover the justice-evaluation function. DERIVED (the mentor fixes that the
 * weight is REDUCED, not the magnitude). Multiplicative ≤ 1; tunable.
 */
export const JUSTICE_COVERAGE_DEFICIT_FACTOR = 0.3

/**
 * The justice-surface modifier (spec 2): 1.0 when there is no justice surface, or
 * when the credential covers the justice-evaluation function; the deficit factor
 * when a justice surface is present and justice-evaluation coverage is absent.
 * Pure.
 */
export function justiceSurfaceModifier(ctx: JusticeSurfaceContext): number {
  if (!ctx.taskHasJusticeSurface) return 1
  if (ctx.credentialCoversJusticeEvaluation) return 1
  return JUSTICE_COVERAGE_DEFICIT_FACTOR
}

// ════════════════════════════════════════════════════════════════════════════
// Composition — the weighted evidence a source contributes (S3 consumes this)
// ════════════════════════════════════════════════════════════════════════════

/**
 * Common evidence-source fields. `requiredDomain` MUST be a domain the task
 * actually requires (task weight > 0). A profile-prior source should carry
 * PROFILE_PRIOR_CONFIDENCE (A5 tier 7); S3 (the combiner) owns the tier↔confidence
 * pairing across sources — S2 provides the per-source primitive.
 */
interface EvidenceInputBase {
  /** The A5 confidence of the underlying verdict (confidence-tiers.ts). */
  confidence: ConfidenceAssessment
  /** The virtue domain the task requires (the domain this evidence bears on). */
  requiredDomain: VirtueDomain
  /** The justice-surface context, when the task has one. */
  justice?: JusticeSurfaceContext
}

/**
 * A credential evidence source. The A2 `transfer` is REQUIRED — so the zero-floor
 * is enforced STRUCTURALLY: a credential can never be weighed without its transfer,
 * closing the enforcement bypass at compile time (a credential is always earned in
 * a specific function, so a transfer relative to the task function always exists).
 */
export interface CredentialEvidenceInput extends EvidenceInputBase {
  tier: 'credential'
  transfer: CredentialTransfer
}

/**
 * A non-credential evidence source (behavioural condition-matched / profile prior)
 * — not function-scoped, so no A2 transfer applies.
 */
export interface NonCredentialEvidenceInput extends EvidenceInputBase {
  tier: 'behavioural-condition-matched' | 'profile-prior'
}

export type EvidenceInput = CredentialEvidenceInput | NonCredentialEvidenceInput

export interface WeightedEvidence {
  /** Final evidence weight in [0,1]. 0 ⇔ the A2 zero-floor (or a hard block) fired. */
  weight: number
  /** False ⇔ weight is 0 — this source cannot contribute to a proceed on this domain. */
  contributes: boolean
  /** The multiplicative components, for transparency (S4 surfaces / logs these). */
  components: {
    tierWeight: number
    confidenceWeight: number
    transferFactor: number // 1 when no transfer applies (non-credential tiers)
    justiceModifier: number
    /** True ⇔ the credential's A2 transfer zeroed the required domain. */
    a2ZeroFloorFired: boolean
  }
}

/**
 * Weigh one evidence source's contribution on the required domain. Multiplicative
 * + monotone. THE LOAD-BEARING PROPERTY: a credential whose A2 transfer is zeroed
 * on `requiredDomain` returns weight 0 / contributes false REGARDLESS of tier or
 * confidence — "a zero-confidence credential can never contribute to a proceed
 * verdict on a task requiring that domain" (mentor A2). Pure.
 */
export function weighEvidence(input: EvidenceInput): WeightedEvidence {
  const tierWeight = EVIDENCE_TIER_WEIGHT[input.tier]
  const confidenceWeight = input.confidence.weight
  const justiceModifier = input.justice ? justiceSurfaceModifier(input.justice) : 1

  // A2 transfer applies to the credential tier only. For a credential source the
  // zero-floor is enforced FIRST: a zeroed required domain ⇒ hard zero, no matter
  // how strong the tier or confidence. `transfer` is REQUIRED on the credential
  // branch (discriminated union), so the floor cannot be bypassed by omitting it.
  let transferFactor = 1
  let a2ZeroFloorFired = false
  if (input.tier === 'credential') {
    const canContribute = credentialCanContribute(input.transfer, input.requiredDomain)
    if (!canContribute) {
      a2ZeroFloorFired = true
      return {
        weight: 0,
        contributes: false,
        components: {
          tierWeight,
          confidenceWeight,
          transferFactor: 0,
          justiceModifier,
          a2ZeroFloorFired: true,
        },
      }
    }
    transferFactor = input.transfer.perDomain[input.requiredDomain].factor
  }

  const weight = tierWeight * confidenceWeight * transferFactor * justiceModifier
  return {
    weight,
    contributes: weight > 0,
    components: {
      tierWeight,
      confidenceWeight,
      transferFactor,
      justiceModifier,
      a2ZeroFloorFired,
    },
  }
}
