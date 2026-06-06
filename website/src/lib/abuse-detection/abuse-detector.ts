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
