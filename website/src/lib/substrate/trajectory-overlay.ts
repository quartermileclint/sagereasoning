/**
 * trajectory-overlay.ts — the deterministic, sparse-honest trajectory overlay
 * (CI-5, mechanism-correction M7, read + activation half).
 *
 * M7 design: READ-AND-OVERLAY (founder election 2026-06-14). The translation-
 * sandwich engine (applyMechanisms) has NO Rule-10 longitudinal machinery and is
 * left BYTE-IDENTICAL — it never reads the trajectory. Instead, the credential's
 * own windowed assessment history (M6's agent_assessment_history, read via
 * getTrajectoryWindow) is reconstructed as EvaluatedAction[] and projected here
 * into an honest overlay that the /api/reason response surfaces under
 * meta.trajectory. This realises the Character-Kernel CONTINUITY claim (FX-6 /
 * dossier B5) and supplies CI-15's proximity-calibration input — without moving
 * the per-instance grade (hysteresis stays the Assent engine's; the prompt's
 * "M7 supplies evidence, it does not move grades directly").
 *
 * DETERMINISM (the whole risk of this half, re-expressed over the enlarged input
 * set): this function is a PURE function of the supplied window. It reuses the
 * trust-layer computeWindowSnapshot (PR15) but reads ONLY the aggregator's
 * deterministic fields — NEVER its `computed_at` (the one clock read the
 * aggregator stamps). The evidence span is computed from the rows' OWN
 * timestamps (earliest/latest), never from now(). So a fixed window → a
 * byte-identical overlay on replay. No clock, no randomness, no
 * order-dependent map iteration (the distribution is a fixed-key record).
 *
 * HONESTY (D17 / AC-17): sparse evidence is named, never papered over.
 *   - `evidence: 'single_snapshot'` when fewer than two prior instances exist —
 *     there is no trajectory yet, only (at most) a single point.
 *   - `confidence_weighted` follows the D17 bands (adapted for the agent path,
 *     which has no domain-matching): low <3, medium 3–9, high ≥10 AND a ≥60-day
 *     longitudinal spread (else medium). direction_of_travel from the aggregator
 *     is itself honest — it returns 'stable' until ≥10 actions exist.
 *   - `kathekon_rate_basis: 'lower_bound'` flags that a stored is_kathekon=false
 *     is the union of "assessed not-appropriate" OR "undecidable" (the M6 bridge
 *     `?? false` narrowing), so kathekon_compliance_rate is a conservative floor,
 *     not a precise rate — do not claim precision the evidence lacks.
 *
 * RULE COMPLIANCE: PR15 (reuses computeWindowSnapshot unchanged rather than
 * re-deriving aggregation); R6c (qualitative levels only — no numeric proximity
 * score; the kathekon rate is a compliance proportion, not a virtue score);
 * R18e (honest on sparse evidence). No I/O, no env reads.
 */

import type {
  KatorthomaProximityLevel,
  DirectionOfTravel,
} from './trust-layer/types/accreditation'
import { computeWindowSnapshot } from './trust-layer/evaluation-window/window-aggregator'
import type { TrajectoryWindow } from './agent-assessment-history-store'

export type TrajectoryEvidence = 'single_snapshot' | 'windowed'
export type TrajectoryConfidence = 'low' | 'medium' | 'high'

/** The honest trajectory overlay surfaced on the /api/reason response
 *  (meta.trajectory) when SUBSTRATE_TRAJECTORY_READ_ENABLED is on. Read-only;
 *  reflects the consulting credential's OWN prior assessment history. */
export interface TrajectoryOverlay {
  schema: 'agent-trajectory-overlay-v1'
  /** Prior consults in the window (EXCLUDES the current one — the M6 write runs
   *  after the assessment, so the current row is not yet present). */
  prior_instances: number
  window_days: number
  max_instances: number
  /** 'single_snapshot' when <2 prior instances (no trajectory yet); else 'windowed'. */
  evidence: TrajectoryEvidence
  /** D17 / AC-17 confidence band — low/medium/high. */
  confidence_weighted: TrajectoryConfidence
  /** Aggregator direction of travel ('improving' | 'stable' | 'regressing').
   *  Honest by construction: 'stable' until ≥10 actions exist. (D17's vocabulary
   *  says 'declining'; the reused trust-layer aggregator says 'regressing' — same
   *  signal, the aggregator's term is kept since the component is reused as-is.) */
  direction_of_travel: DirectionOfTravel
  /** The proximity level the credential is "typically" at across the window. */
  typical_proximity: KatorthomaProximityLevel
  /** Count of window actions at each proximity level (fixed-key record). */
  proximity_distribution: Record<KatorthomaProximityLevel, number>
  /** Proportion of window actions assessed kathekon — a LOWER BOUND (see
   *  kathekon_rate_basis). */
  kathekon_compliance_rate: number
  /** Longitudinal spread of the window in whole days (latest − earliest, from
   *  the rows' own timestamps — clock-free). */
  evidence_span_days: number
  /** Always 'lower_bound' — is_kathekon=false is the union of not-appropriate OR
   *  undecidable (M6 bridge narrowing), so the rate floors rather than measures. */
  kathekon_rate_basis: 'lower_bound'
}

const MS_PER_DAY = 86_400_000

/**
 * Compute the honest trajectory overlay from a windowed read. PURE — a fixed
 * window yields a byte-identical overlay (no clock, no randomness; the
 * aggregator's computed_at is never read).
 */
export function computeTrajectoryOverlay(window: TrajectoryWindow): TrajectoryOverlay {
  const { actions, windowDays, maxInstances, earliest, latest } = window
  const priorInstances = actions.length

  // Reuse the trust-layer aggregator (PR15). total_lifetime = window length: M7
  // performs ONE windowed query (KG1 latency budget) and never claims a separate
  // lifetime it did not count. Read ONLY deterministic fields below — NOT
  // snapshot.computed_at.
  const snapshot = computeWindowSnapshot('agent-trajectory', actions, priorInstances)

  const evidenceSpanDays =
    earliest !== null && latest !== null
      ? (Date.parse(latest) - Date.parse(earliest)) / MS_PER_DAY
      : 0

  return {
    schema: 'agent-trajectory-overlay-v1',
    prior_instances: priorInstances,
    window_days: windowDays,
    max_instances: maxInstances,
    evidence: priorInstances < 2 ? 'single_snapshot' : 'windowed',
    confidence_weighted: deriveConfidence(priorInstances, evidenceSpanDays),
    direction_of_travel: snapshot.direction_of_travel,
    typical_proximity: snapshot.typical_proximity,
    proximity_distribution: snapshot.proximity_distribution,
    kathekon_compliance_rate: snapshot.kathekon_compliance_rate,
    evidence_span_days: Math.round(evidenceSpanDays),
    kathekon_rate_basis: 'lower_bound',
  }
}

/**
 * D17 §"Composite delta" confidence bands, adapted for the agent path (no
 * domain-matching available): driven by the prior-instance count, with the high
 * band additionally requiring D17's ≥60-day longitudinal spread — computed from
 * the rows' OWN timestamps so the band is byte-identical on replay (no now()).
 *   low    : <3 prior instances
 *   medium : 3–9, OR ≥10 with a sub-60-day spread
 *   high   : ≥10 AND span ≥60 days
 */
function deriveConfidence(
  priorInstances: number,
  spanDays: number,
): TrajectoryConfidence {
  if (priorInstances < 3) return 'low'
  if (priorInstances < 10) return 'medium'
  return spanDays >= 60 ? 'high' : 'medium'
}
