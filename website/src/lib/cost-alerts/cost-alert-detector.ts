/**
 * cost-alert-detector.ts — A13 R5 cost-as-health-metric detectors (PURE).
 *
 * Pure functions: given cost numbers + thresholds in, return a CostAlert or null
 * out. No database, no I/O, no imports of stripe.ts or supabase — so this is
 * fully unit-testable with plain `npx tsx` (no env file). The evaluate endpoint
 * (/api/billing/cost-alerts/evaluate) reads the COST_HEALTH thresholds and the
 * cost surfaces, then calls these functions; the thresholds are passed in
 * explicitly so COST_HEALTH (in stripe.ts) stays the single source of truth.
 *
 * D5 (per-identity anomaly) is the A13 PR1 single-rule proof. The other four R5
 * detectors (per-call spike, revenue:cost ratio, ops monthly cap, rolling 7-day
 * spike) are added here after D5 reaches Verified (PR1).
 *
 * Rules served: R5 (primary), R0 (cost as a tracked health signal). NOT on the
 * /api/reason critical path — observability only (PR3 trivially satisfied).
 */

export type CostAlertType =
  | 'per_identity_anomaly'
  | 'per_call_spike'
  | 'revenue_cost_ratio'
  | 'ops_monthly_cap'
  | 'rolling_7day_spike'

/**
 * A tripped cost threshold. Maps 1:1 onto a cost_alerts row (the endpoint adds
 * period_date + persistence). All monetary values are in integer cents — the
 * grain at which loop_billing_events.anthropic_cost_cents is persisted.
 */
export interface CostAlert {
  detector_type: CostAlertType
  /** 'global' for account-wide detectors; the agent_id for per-identity. Never an end-user id (R3). */
  scope: string
  severity: 'warning'
  /** The measured number that tripped the line (cents). */
  observed_value: number
  /** The line it crossed (cents). */
  threshold_value: number
  /** observed / baseline, rounded to 2dp (for display). */
  multiple: number
  message: string
  details: Record<string, unknown>
}

export interface PerIdentityAnomalyInput {
  agentId: string
  /** Total loops recorded for this identity. */
  loopCount: number
  /** Sum of anthropic_cost_cents over all the identity's loops. */
  totalCostCents: number
  /** The single most expensive loop's anthropic_cost_cents (the candidate spike). */
  maxLoopCostCents: number
  /** N — alert when the candidate is >= N x the other-loop mean. */
  multiplier: number
  /** Minimum number of PRIOR loops (excluding the candidate) needed to form a baseline. */
  minPriorLoops: number
  /** Ignore the candidate and the baseline if below this many cents (near-zero noise guard). */
  absoluteFloorCents: number
}

/**
 * D5 — per-identity cost anomaly.
 *
 * "Identity X spending Nx its baseline." The baseline is the mean cost of the
 * identity's OTHER loops (the candidate spike is excluded so a single outlier
 * cannot dilute its own baseline). Triggers on anthropic_cost_cents — the LLM
 * cost, which is what R5 governs (NOT total_cents, the customer bill).
 *
 * Timestamp-free by construction: it needs only per-loop costs + the count, not
 * an ordering. (A windowed "now vs the identity's own last-7-days" form is a
 * later refinement that needs the loop_billing_events timestamp column, which
 * A12 left unconfirmed in-repo.)
 *
 * Returns null (no alert) when any guard fails:
 *  - fewer than `minPriorLoops` prior loops (insufficient history),
 *  - the candidate is below the absolute floor,
 *  - the baseline mean is below the absolute floor (no division by ~0; no alert
 *    on a flat near-zero identity),
 *  - the multiple is below `multiplier`.
 */
export function detectPerIdentityAnomaly(input: PerIdentityAnomalyInput): CostAlert | null {
  const { agentId, loopCount, totalCostCents, maxLoopCostCents, multiplier, minPriorLoops, absoluteFloorCents } = input

  // Guard 1 — enough PRIOR loops (excluding the candidate) to form a baseline.
  const priorCount = loopCount - 1
  if (priorCount < minPriorLoops) return null

  // Guard 2 — the candidate must clear the absolute floor.
  if (maxLoopCostCents < absoluteFloorCents) return null

  // Baseline = mean of the identity's OTHER loops.
  const priorSum = totalCostCents - maxLoopCostCents
  const priorMean = priorSum / priorCount

  // Guard 3 — baseline must clear the floor (avoids div-by-~0 and near-zero noise).
  if (priorMean < absoluteFloorCents) return null

  // Compare on the RAW multiple; round only for display.
  const rawMultiple = maxLoopCostCents / priorMean
  if (rawMultiple < multiplier) return null

  const roundedMultiple = Math.round(rawMultiple * 100) / 100
  const roundedMean = Math.round(priorMean * 100) / 100
  const threshold = Math.round(priorMean * multiplier * 100) / 100

  return {
    detector_type: 'per_identity_anomaly',
    scope: agentId,
    severity: 'warning',
    observed_value: maxLoopCostCents,
    threshold_value: threshold,
    multiple: roundedMultiple,
    message:
      `R5 ALERT: identity ${agentId} has a loop costing ${maxLoopCostCents} cents — ` +
      `${roundedMultiple}x its baseline of ${roundedMean} cents/loop over ${priorCount} prior loops, ` +
      `at or above the ${multiplier}x threshold.`,
    details: {
      loop_count: loopCount,
      prior_loops: priorCount,
      prior_mean_cents: roundedMean,
      max_loop_cents: maxLoopCostCents,
      total_cost_cents: totalCostCents,
      multiplier_threshold: multiplier,
      min_prior_loops: minPriorLoops,
      absolute_floor_cents: absoluteFloorCents,
    },
  }
}
