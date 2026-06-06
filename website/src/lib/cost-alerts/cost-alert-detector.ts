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
 * D5 (per-identity anomaly) was the A13 PR1 single-rule proof (Verified-live
 * 2026-06-06). D4 (per-call spike) is the global analogue, added once D5 reached
 * Verified (PR1 surface rollout). D1 (revenue:cost ratio), D2 (ops monthly cap),
 * and D3 (rolling 7-day spike) are folded in here from the inline A9 logic in
 * /api/billing/usage-summary so all five R5 detectors share one detection source
 * and deliver through cost_alerts. Each detector reads its own faithful cost
 * surface (PR13): D4/D5 use per-loop anthropic_cost_cents; D1 uses revenue vs
 * LLM cost; D2 uses Sage Ops cost; D3 uses daily substrate spend. They share a
 * delivery channel, NOT a single number.
 *
 * The numbers used by D1–D3 (their messages, threshold figures) intentionally
 * match the A9 usage-summary strings, so folding the logic out of that endpoint
 * leaves its admin output effectively unchanged.
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

export interface PerCallSpikeInput {
  /** Total loops in the evaluated population (global — all identities). */
  loopCount: number
  /** Sum of anthropic_cost_cents over all loops in the population. */
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
 * D4 — per-call (global) cost spike.
 *
 * "Some single call cost Nx the typical call." The GLOBAL analogue of D5: the
 * baseline is the mean cost of all OTHER loops across every identity (the
 * candidate spike is excluded so a single outlier cannot dilute its own
 * baseline). Triggers on anthropic_cost_cents — the LLM cost R5 governs (NOT
 * total_cents, the customer bill).
 *
 * Distinct from D5: D5 needs >= minPriorLoops for ONE identity, so a brand-new
 * identity's first (expensive) call cannot trip it; D4 catches that spike by
 * comparing against the whole population. scope is always 'global'.
 *
 * Timestamp-free by construction (needs only per-loop costs + the count, not an
 * ordering). The arithmetic mirrors detectPerIdentityAnomaly intentionally — kept
 * as a separate function so the Verified-live D5 path stays byte-identical;
 * collapsing the shared spike-core into one helper is a deferred cleanup (PR7).
 *
 * Returns null (no alert) when any guard fails: fewer than `minPriorLoops` prior
 * loops, the candidate below the floor, the baseline mean below the floor (no
 * div-by-~0), or the multiple below `multiplier`.
 */
export function detectPerCallSpike(input: PerCallSpikeInput): CostAlert | null {
  const { loopCount, totalCostCents, maxLoopCostCents, multiplier, minPriorLoops, absoluteFloorCents } = input

  // Guard 1 — enough PRIOR loops (excluding the candidate) to form a baseline.
  const priorCount = loopCount - 1
  if (priorCount < minPriorLoops) return null

  // Guard 2 — the candidate must clear the absolute floor.
  if (maxLoopCostCents < absoluteFloorCents) return null

  // Baseline = mean of all the OTHER loops in the population.
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
    detector_type: 'per_call_spike',
    scope: 'global',
    severity: 'warning',
    observed_value: maxLoopCostCents,
    threshold_value: threshold,
    multiple: roundedMultiple,
    message:
      `R5 ALERT: a single loop cost ${maxLoopCostCents} cents — ` +
      `${roundedMultiple}x the global baseline of ${roundedMean} cents/loop over ${priorCount} other loops, ` +
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

// ════════════════════════════════════════════════════════════════════════════
// D1–D3 — global account-health detectors (folded in from A9 usage-summary).
// Each is PURE: inputs + thresholds in, CostAlert | null out. scope is 'global'.
// observed_value / threshold_value are in cents EXCEPT for D1, where they carry
// the (dimensionless) revenue:cost ratio — see that detector's note.
// ════════════════════════════════════════════════════════════════════════════

export interface RevenueCostRatioInput {
  /** Revenue recognised in the period (cents). */
  revenueCents: number
  /** LLM cost in the period (cents). */
  llmCostCents: number
  /** Minimum acceptable revenue:cost ratio (R5 = 2.0). */
  minRatio: number
}

/**
 * D1 — revenue-to-cost ratio (global). Fires when there IS cost and revenue has
 * fallen below the R5 minimum multiple of LLM cost (2x). Silent when there is no
 * cost yet (ratio undefined — the pre-revenue / pre-Stripe state, true today).
 *
 * NOTE: for this detector observed_value carries the ratio (an "x" figure, not
 * cents) and threshold_value carries minRatio; details holds the cent figures.
 */
export function detectRevenueCostRatio(input: RevenueCostRatioInput): CostAlert | null {
  const { revenueCents, llmCostCents, minRatio } = input
  if (llmCostCents <= 0) return null // no cost => ratio undefined => no alert
  const ratio = revenueCents / llmCostCents
  if (ratio >= minRatio) return null

  const roundedRatio = Math.round(ratio * 100) / 100
  return {
    detector_type: 'revenue_cost_ratio',
    scope: 'global',
    severity: 'warning',
    observed_value: roundedRatio,
    threshold_value: minRatio,
    multiple: roundedRatio,
    message:
      `R5 ALERT: Revenue-to-cost ratio is ${roundedRatio.toFixed(2)}x — below the ${minRatio.toFixed(1)}x minimum threshold. ` +
      `Revenue: $${(revenueCents / 100).toFixed(2)}, Estimated LLM cost: $${(llmCostCents / 100).toFixed(2)}.`,
    details: {
      revenue_cents: revenueCents,
      llm_cost_cents: llmCostCents,
      ratio: roundedRatio,
      min_ratio: minRatio,
    },
  }
}

export interface OpsMonthlyCapInput {
  /** Sage Ops spend this month (cents). */
  opsCostCents: number
  /** The monthly cap (R5 = $100 = 10000 cents). */
  capCents: number
}

/**
 * D2 — Sage Ops monthly cap (global). Fires when Sage Ops spend exceeds the R5
 * $100/month cap. (In practice 0 until Sage Ops runs at P7 — wired + ready.)
 */
export function detectOpsMonthlyCap(input: OpsMonthlyCapInput): CostAlert | null {
  const { opsCostCents, capCents } = input
  if (opsCostCents <= capCents) return null

  const multiple = Math.round((opsCostCents / capCents) * 100) / 100
  return {
    detector_type: 'ops_monthly_cap',
    scope: 'global',
    severity: 'warning',
    observed_value: opsCostCents,
    threshold_value: capCents,
    multiple,
    message:
      `R5 ALERT: Sage Ops costs ($${(opsCostCents / 100).toFixed(2)}) exceed the $${(capCents / 100).toFixed(2)}/month cap.`,
    details: { ops_cost_cents: opsCostCents, cap_cents: capCents },
  }
}

export interface Rolling7DaySpikeInput {
  /** Today's spend (cents). */
  todayCents: number
  /** Average daily spend over the prior 7 days, excluding today (cents). */
  priorAvgCents: number
  /** How many prior days had observed data. */
  daysObserved: number
  /** Cold-start guard: need >= this many prior days before firing. */
  minDaysObserved: number
  /** Alert when today >= multiplier x the prior average. */
  multiplier: number
}

/**
 * D3 — rolling 7-day daily-spend spike (global). Fires when today's substrate
 * spend is >= multiplier x the prior-7-day average, with a cold-start guard
 * (needs minDaysObserved prior days of data). Mirrors A9's rule exactly.
 */
export function detectRolling7DaySpike(input: Rolling7DaySpikeInput): CostAlert | null {
  const { todayCents, priorAvgCents, daysObserved, minDaysObserved, multiplier } = input
  if (daysObserved < minDaysObserved) return null
  if (priorAvgCents <= 0) return null

  const rawMultiple = todayCents / priorAvgCents
  if (rawMultiple < multiplier) return null

  const roundedMultiple = Math.round(rawMultiple * 100) / 100
  const threshold = Math.round(priorAvgCents * multiplier)
  return {
    detector_type: 'rolling_7day_spike',
    scope: 'global',
    severity: 'warning',
    observed_value: todayCents,
    threshold_value: threshold,
    multiple: roundedMultiple,
    message:
      `R5 ALERT: Today's substrate spend ($${(todayCents / 100).toFixed(2)}) is ` +
      `${roundedMultiple.toFixed(2)}x the rolling 7-day average ($${(priorAvgCents / 100).toFixed(2)}) — ` +
      `at or above the ${multiplier.toFixed(1)}x threshold.`,
    details: {
      today_cents: todayCents,
      prior_avg_cents: priorAvgCents,
      days_observed: daysObserved,
      multiplier_threshold: multiplier,
    },
  }
}
