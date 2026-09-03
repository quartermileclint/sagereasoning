/**
 * substrate-identity-baseline.ts — A12 per-identity cost / behavioural baseline.
 *
 * Computes a per-agent_id baseline over the existing loop_billing_events surface
 * (the F4 provenance surface already carries agent_id + per-loop cost). This is
 * the precondition consumed by:
 *   - A13 (R5 cost-as-health-metric alerts: "identity X spending Nx its baseline")
 *   - A19 (abuse detection: per-identity behavioural baselines)
 *
 * NOT on the hot path. This is a queryable helper invoked by alerting / analysis
 * code, not by /api/reason request handling. It adds no latency to the substrate.
 *
 * SCOPE NOTE (PR7 follow-on): this proof computes an ALL-TIME per-identity
 * aggregate over confirmed columns (agent_id, total_cents, anthropic_cost_cents).
 * loop_billing_events was created via the Supabase SQL Editor (no migration file
 * in-repo), so its timestamp column name is not yet confirmed in-repo. Windowed
 * baselines (last-N-days, calls-per-day) are deferred to A13, where the timestamp
 * column will be confirmed and an aggregate RPC added. The shape below leaves
 * room for those fields (returned as null until A13).
 *
 * Rules served: R5 (cost-as-health precondition), R0 (audit-derived), AC10, PR7.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { pagedRows } from '@/lib/db/paged-select'

export interface IdentityCostBaseline {
  agent_id: string
  loop_count: number
  total_cost_cents: number
  mean_cost_cents_per_loop: number
  /** Deferred to A13 (timestamp column confirmation). Null for now. */
  window_days: number | null
  /** Deferred to A13. Null for now. */
  calls_per_day: number | null
}

let _adminClient: SupabaseClient | null = null

function getAdminClient(): SupabaseClient {
  if (!_adminClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !key) {
      throw new Error(
        '[substrate-identity-baseline] Missing NEXT_PUBLIC_SUPABASE_URL or ' +
          'SUPABASE_SERVICE_ROLE_KEY; cannot create admin client.'
      )
    }
    _adminClient = createClient(url, key)
  }
  return _adminClient
}

/**
 * Compute the all-time cost baseline for one agent identity. Returns null when
 * the identity has no recorded loops (no baseline yet — A13/A19 should treat a
 * null baseline as "insufficient history").
 *
 * Reads only confirmed columns of loop_billing_events. Does not throw on a query
 * error — returns null and logs, so callers (alerting) degrade gracefully.
 */
export async function getIdentityCostBaseline(
  agentId: string
): Promise<IdentityCostBaseline | null> {
  if (!agentId) return null

  try {
    const admin = getAdminClient()
    // H4, row-cap sweep 2026-09-02/-03: was an unbounded per-agent read —
    // silently truncated this baseline for the dominant identity once its
    // history crossed 1,000 rows. Paged on `id` (the table's UUID PK).
    const { rows: data, error } = await pagedRows<{ id: string; total_cents: number | null; anthropic_cost_cents: number | null }>(
      admin,
      'loop_billing_events',
      'id',
      'id, total_cents, anthropic_cost_cents',
      { eqColumn: 'agent_id', eqValue: agentId }
    )

    if (error) {
      console.warn(
        '[substrate-identity-baseline] query failed (non-fatal): ' + error
      )
      return null
    }
    if (!data || data.length === 0) return null

    const loopCount = data.length
    const totalCostCents = data.reduce(
      (sum, r) => sum + (Number((r as { total_cents?: number }).total_cents) || 0),
      0
    )

    return {
      agent_id: agentId,
      loop_count: loopCount,
      total_cost_cents: totalCostCents,
      mean_cost_cents_per_loop:
        loopCount > 0 ? totalCostCents / loopCount : 0,
      window_days: null,
      calls_per_day: null,
    }
  } catch (err) {
    console.warn(
      '[substrate-identity-baseline] threw (non-fatal): ' +
        (err instanceof Error ? err.message : String(err))
    )
    return null
  }
}
