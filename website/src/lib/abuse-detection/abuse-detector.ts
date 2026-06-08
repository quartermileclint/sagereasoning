/**
 * abuse-detector.ts — A19 abuse-detection detectors (PURE).
 *
 * Pure functions: given behavioural counts + thresholds in, return an AbuseSignal
 * or null out. No database, no I/O, no config import — so this is fully
 * unit-testable with plain `npx tsx` (no env file). The evaluate endpoint
 * (/api/abuse/evaluate) reads substrate_audit_events (A12: occurred_at + agent_id),
 * buckets the timestamps into windows, then calls these functions; the thresholds
 * (from ABUSE_DETECTION in abuse-thresholds.ts) are passed in explicitly so that
 * file stays the single source of truth.
 *
 * Deliberately mirrors cost-alert-detector.ts (A13): same candidate-vs-prior-mean
 * shape, same guard structure, same AbuseSignal/CostAlert field layout. The PR1
 * single-detector proof is request_velocity_anomaly (per-identity request burst),
 * the behavioural analogue of A13's per-identity cost anomaly. systematic
 * enumeration + rapid-input-variation detectors are the PR1 surface rollout
 * (added once this proof reaches Verified).
 *
 * SCOPE NOTE (R3 / R17): detection is VELOCITY + STRUCTURAL, never SEMANTIC.
 * substrate_audit_events stores structural masked_context ONLY — never raw input
 * text — so A19 cannot (and must not) compare prompt wording. It detects bursts
 * and structural repetition, not what was said.
 *
 * Rules served: R5 (operational health, primary), R0 (audit-derived), R3 (scope
 * is an agent_id or 'global', never an end-user id). NOT on the /api/reason
 * critical path — detection only (PR3 trivially satisfied).
 */

export type AbuseSignalType =
  | 'request_velocity_anomaly'
  | 'systematic_enumeration'
  | 'rapid_input_variation'

/**
 * A tripped abuse threshold. Maps 1:1 onto an abuse_signals row (the endpoint adds
 * period_date + persistence). Counts are integers (request counts).
 */
export interface AbuseSignal {
  signal_type: AbuseSignalType
  /** 'global' for account-wide detectors; the agent_id for per-identity. Never an end-user id (R3). */
  scope: string
  severity: 'warning'
  /** The measured number that tripped the line (request count). */
  observed_value: number
  /** The line it crossed (request count). */
  threshold_value: number
  /** observed / baseline, rounded to 2dp (for display). */
  multiple: number
  message: string
  details: Record<string, unknown>
}

export interface RequestVelocityAnomalyInput {
  agentId: string
  /** Number of ACTIVE time windows observed for this identity (windows with >=1 request). */
  windowCount: number
  /** Sum of requests across all the identity's active windows. */
  totalRequests: number
  /** The busiest single window's request count (the candidate burst). */
  maxWindowRequests: number
  /** N — alert when the busiest window is >= N x the other-window mean. */
  multiplier: number
  /** Minimum number of PRIOR windows (excluding the busiest) needed to form a baseline. */
  minPriorWindows: number
  /** Ignore the candidate and the baseline if below this many requests (near-zero noise guard). */
  absoluteFloorRequests: number
}

/**
 * request_velocity_anomaly — per-identity request burst.
 *
 * "Identity X made N requests in its busiest window — Mx its typical window."
 * The baseline is the mean request count of the identity's OTHER active windows
 * (the busiest window is excluded so a single burst cannot dilute its own
 * baseline). This is the behavioural analogue of A13's detectPerIdentityAnomaly,
 * with request count in place of anthropic_cost_cents and time windows in place
 * of loops.
 *
 * Returns null (no signal) when any guard fails:
 *  - fewer than `minPriorWindows` prior windows (insufficient history — a new
 *    identity's first busy window cannot trip it),
 *  - the candidate window is below the absolute floor,
 *  - the baseline mean is below the absolute floor (no division by ~0; no signal
 *    on a flat low-traffic identity),
 *  - the multiple is below `multiplier`.
 */
export function detectRequestVelocityAnomaly(
  input: RequestVelocityAnomalyInput
): AbuseSignal | null {
  const {
    agentId,
    windowCount,
    totalRequests,
    maxWindowRequests,
    multiplier,
    minPriorWindows,
    absoluteFloorRequests,
  } = input

  // Guard 1 — enough PRIOR windows (excluding the busiest) to form a baseline.
  const priorCount = windowCount - 1
  if (priorCount < minPriorWindows) return null

  // Guard 2 — the candidate must clear the absolute floor.
  if (maxWindowRequests < absoluteFloorRequests) return null

  // Baseline = mean requests of the identity's OTHER active windows.
  const priorSum = totalRequests - maxWindowRequests
  const priorMean = priorSum / priorCount

  // Guard 3 — baseline must clear the floor (avoids div-by-~0 and near-zero noise).
  if (priorMean < absoluteFloorRequests) return null

  // Compare on the RAW multiple; round only for display.
  const rawMultiple = maxWindowRequests / priorMean
  if (rawMultiple < multiplier) return null

  const roundedMultiple = Math.round(rawMultiple * 100) / 100
  const roundedMean = Math.round(priorMean * 100) / 100
  const threshold = Math.round(priorMean * multiplier * 100) / 100

  return {
    signal_type: 'request_velocity_anomaly',
    scope: agentId,
    severity: 'warning',
    observed_value: maxWindowRequests,
    threshold_value: threshold,
    multiple: roundedMultiple,
    message:
      `A19 ABUSE SIGNAL: identity ${agentId} made ${maxWindowRequests} requests in its busiest window — ` +
      `${roundedMultiple}x its baseline of ${roundedMean} requests/window over ${priorCount} prior windows, ` +
      `at or above the ${multiplier}x threshold.`,
    details: {
      window_count: windowCount,
      prior_windows: priorCount,
      prior_mean_requests: roundedMean,
      max_window_requests: maxWindowRequests,
      total_requests: totalRequests,
      multiplier_threshold: multiplier,
      min_prior_windows: minPriorWindows,
      absolute_floor_requests: absoluteFloorRequests,
    },
  }
}

// ===========================================================================
// Structural detectors (PR1 surface rollout) — gated behind the rollout
// sub-flag in the evaluator; UNSET in production. Both read STRUCTURAL counts
// derived from masked_context.input_char_count ONLY — never raw input text
// (R3 / R17). Same pure-function shape as detectRequestVelocityAnomaly: counts
// + thresholds in, an AbuseSignal or null out. Detection-only.
// ===========================================================================

export interface SystematicEnumerationInput {
  agentId: string
  /** Total requests observed for this identity across the evaluation. */
  totalRequests: number
  /** Number of DISTINCT input_char_count values across those requests. */
  distinctInputSizes: number
  /** Minimum requests before the breadth measure is meaningful (volume floor). */
  minRequests: number
  /** Fire when distinctInputSizes / totalRequests >= this fraction. */
  distinctRatioThreshold: number
}

/**
 * systematic_enumeration — "testing the space, not using it".
 *
 * Breadth signal: one identity whose requests are almost all DIFFERENT input
 * sizes — the fingerprint of a methodical sweep rather than organic repeated
 * use (a genuine user repeats similar input sizes). Pure structural proxy on
 * input_char_count; never inspects input text.
 *
 * Returns null when any guard fails: fewer than `minRequests` requests
 * (insufficient volume), or the distinct-size fraction is below
 * `distinctRatioThreshold`.
 */
export function detectSystematicEnumeration(
  input: SystematicEnumerationInput
): AbuseSignal | null {
  const { agentId, totalRequests, distinctInputSizes, minRequests, distinctRatioThreshold } = input

  // Guard 1 — enough volume for the breadth measure to mean anything.
  if (totalRequests < minRequests) return null

  // Compare on the RAW ratio; round only for display.
  const distinctRatio = distinctInputSizes / totalRequests

  // Guard 2 — distinct-size fraction at/above the threshold.
  if (distinctRatio < distinctRatioThreshold) return null

  const roundedRatio = Math.round(distinctRatio * 100) / 100
  // Minimum distinct sizes that trip the line at this volume (display).
  const threshold = Math.ceil(distinctRatioThreshold * totalRequests)
  const pctDistinct = Math.round(distinctRatio * 100)
  const pctThreshold = Math.round(distinctRatioThreshold * 100)

  return {
    signal_type: 'systematic_enumeration',
    scope: agentId,
    severity: 'warning',
    observed_value: distinctInputSizes,
    threshold_value: threshold,
    multiple: roundedRatio,
    message:
      `A19 ABUSE SIGNAL: identity ${agentId} produced ${distinctInputSizes} distinct input sizes across ` +
      `${totalRequests} requests (${pctDistinct}% distinct), at or above the ${pctThreshold}% ` +
      `systematic-enumeration threshold.`,
    details: {
      total_requests: totalRequests,
      distinct_input_sizes: distinctInputSizes,
      distinct_ratio: roundedRatio,
      distinct_ratio_threshold: distinctRatioThreshold,
      min_requests: minRequests,
    },
  }
}

export interface RapidInputVariationInput {
  agentId: string
  /** Requests in the identity's busiest single window. */
  busiestWindowRequests: number
  /** Count of successive request pairs (in that window, by time) whose
   *  input_char_count differs by >= the large-jump delta. */
  largeVariationCount: number
  /** Minimum requests in the busiest window before the churn measure is meaningful. */
  minWindowRequests: number
  /** Fire when largeVariationCount / (busiestWindowRequests - 1) >= this fraction. */
  variationRatioThreshold: number
}

/**
 * rapid_input_variation — "fuzzing fast".
 *
 * Temporal-intensity signal: one identity rapidly MUTATING its input size,
 * request-to-request, concentrated in its busiest window — sharp successive
 * jumps in input_char_count, the fingerprint of automated fuzzing rather than
 * human-paced editing. Pure structural proxy on input_char_count; never inspects
 * input text.
 *
 * Returns null when any guard fails: fewer than `minWindowRequests` requests in
 * the busiest window (insufficient concentration), no successive pairs, or the
 * large-jump fraction is below `variationRatioThreshold`.
 */
export function detectRapidInputVariation(
  input: RapidInputVariationInput
): AbuseSignal | null {
  const { agentId, busiestWindowRequests, largeVariationCount, minWindowRequests, variationRatioThreshold } = input

  // Guard 1 — enough requests concentrated in one window.
  if (busiestWindowRequests < minWindowRequests) return null

  // Successive pairs in the window (N requests => N-1 consecutive transitions).
  const pairs = busiestWindowRequests - 1
  if (pairs <= 0) return null

  // Compare on the RAW ratio; round only for display.
  const variationRatio = largeVariationCount / pairs

  // Guard 2 — large-jump fraction at/above the threshold.
  if (variationRatio < variationRatioThreshold) return null

  const roundedRatio = Math.round(variationRatio * 100) / 100
  const threshold = Math.ceil(variationRatioThreshold * pairs)
  const pctChurn = Math.round(variationRatio * 100)
  const pctThreshold = Math.round(variationRatioThreshold * 100)

  return {
    signal_type: 'rapid_input_variation',
    scope: agentId,
    severity: 'warning',
    observed_value: largeVariationCount,
    threshold_value: threshold,
    multiple: roundedRatio,
    message:
      `A19 ABUSE SIGNAL: identity ${agentId} made ${largeVariationCount} large input-size jumps across ` +
      `${pairs} successive requests in its busiest window (${pctChurn}% churn), at or above the ` +
      `${pctThreshold}% rapid-variation threshold.`,
    details: {
      busiest_window_requests: busiestWindowRequests,
      successive_pairs: pairs,
      large_variation_count: largeVariationCount,
      variation_ratio: roundedRatio,
      variation_ratio_threshold: variationRatioThreshold,
      min_window_requests: minWindowRequests,
    },
  }
}
