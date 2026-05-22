/**
 * reflect-cost-tracker.ts — Sage Reflect microcent-precise R5 cost-health accumulator (A2, PR7).
 *
 * THE GAP THIS CLOSES (per /drafts/2026-05-23-track-followons-design-pack.md §A2).
 * The Sage Reflect meter (route.ts makeMeter) rounds each stage call's Anthropic
 * cost to INTEGER cents for the loop bill — correct, because the increment_api_usage
 * RPC and the customer-facing bill are integer cents. But a sub-cent Sonnet pass
 * records anthropic_cost_cents = 0 in loop_billing_events, so the retrospective R5
 * "revenue-to-cost ≥ 2x" health check (stripe.ts COST_HEALTH; the
 * cost_health_snapshots surface) reads 0 cost and the ratio looks artificially
 * healthy. This module records the RAW microcents alongside the unchanged integer
 * bill, decoupling *billing rounding* (integer cents to the customer) from *cost
 * truth* (microcent accumulation for the health metric).
 *
 * DECOUPLED + ADDITIVE (R5). This does NOT touch the bill, the increment_api_usage
 * RPC, loop_billing_events, or the response path. It is a separate side-table,
 * mirroring the substrate's translation_sandwich_cost_tracker / incrementCostTracker
 * pattern (PR15 reuse of the proven primitive — no Anthropic-canonical primitive
 * substitutes for a product-internal cost-truth accumulator). The integer-cents loop
 * bill in route.ts is byte-for-byte unchanged.
 *
 * FAIL-SOFT (KG1-aware). Every read/write is wrapped; on any failure we console.warn
 * and return without throwing — observability must NEVER block billing or the agent
 * response. The meter awaits this call (no fire-and-forget) but its outcome does not
 * gate the meter result. Same posture as the substrate's incrementCostTracker.
 *
 * UNITS. 1 cent = 10,000 microcents (1 microcent = $0.000001). sonnetCostMicrocents()
 * returns INTEGER microcents; reflect-extractor.usageToCents divides by 10000; this
 * module multiplies the meter's cents back to microcents (Math.round) so the
 * conversion is loss-free for the integer-microcent magnitudes involved (the
 * precision invariant is proved by reflect-cost-tracker.test.ts without a DB).
 *
 * Rules served: R5 (cost-as-health-metric — primary engagement), R0 (the cost record
 * is part of the long-term audit trail), R4 (microcents + counts are operational
 * fields, never engine internals), KG1 (awaited; fail-soft).
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js'

/** The accumulator table (idempotent migration: supabase-sage-reflect-cost-tracker-migration.sql). */
const COST_TRACKER_TABLE = 'sage_reflect_cost_tracker'

// ============================================================================
// PURE CONVERSION HELPERS (exported for reflect-cost-tracker.test.ts — no I/O)
// ============================================================================

/**
 * cents (float, ≥0) → integer microcents. 1 cent = 10,000 microcents. A
 * non-positive / non-finite input is a no-op (0). Inverse-paired with
 * microcentsToCents for the integer-microcent magnitudes the meter produces.
 */
export function centsToMicrocents(cents: number): number {
  if (!Number.isFinite(cents) || cents <= 0) return 0
  return Math.round(cents * 10000)
}

/** integer microcents → cents (float). The R5-truthful cost. */
export function microcentsToCents(microcents: number): number {
  return microcents / 10000
}

/**
 * Read-modify-write accumulation, BigInt-safe (mirrors the substrate's cumulative
 * bigint stored as a string). Negative / fractional additions are clamped + rounded.
 */
export function nextCumulativeMicrocents(current: bigint, addedMicrocents: number): bigint {
  return current + BigInt(Math.max(0, Math.round(addedMicrocents)))
}

// ============================================================================
// ADMIN CLIENT (service-role; no RLS) — same lazy pattern as loop-cost-tracker.ts
// ============================================================================

let _adminClient: SupabaseClient | null = null

function getAdminClient(): SupabaseClient {
  if (!_adminClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !key) {
      throw new Error(
        '[reflect-cost-tracker] Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.',
      )
    }
    _adminClient = createClient(url, key)
  }
  return _adminClient
}

// ============================================================================
// PERIOD KEY
// ============================================================================

export interface ReflectCostPeriod {
  /** The metering surface (e.g. 'wrapper_internal' for /api/practice/reflect). */
  readonly surface: string
  /** UTC year of the billed call. */
  readonly year: number
  /** UTC month (1–12) of the billed call. */
  readonly month: number
}

// ============================================================================
// INCREMENT (write) — fail-soft
// ============================================================================

/**
 * Accumulate `microcents` of true Anthropic cost into the (surface, year, month)
 * row. FAIL-SOFT — never throws. Call AFTER the loop bill persists and NOT on a
 * resume/duplicate (the meter returns early on a duplicate loop_id, so this is
 * never reached on a resume → no double-count). A zero/negative microcents is a
 * no-op (deterministic/base stages cost nothing to record).
 */
export async function incrementReflectCostMicrocents(
  microcents: number,
  period: ReflectCostPeriod,
): Promise<void> {
  const added = Math.max(0, Math.round(microcents))
  if (added === 0) return

  try {
    const admin = getAdminClient()

    const { data: current, error: readErr } = await admin
      .from(COST_TRACKER_TABLE)
      .select('cumulative_cost_microcents, request_count')
      .eq('surface', period.surface)
      .eq('period_year', period.year)
      .eq('period_month', period.month)
      .maybeSingle()

    if (readErr) {
      console.warn('[reflect-cost-tracker] read failed; increment skipped:', readErr.message)
      return
    }

    if (!current) {
      // First call this period — insert. A concurrent insert (unique_violation
      // 23505) means the row now exists; this lost increment is observability-only
      // and acceptable under fail-soft + "no current users".
      const { error: insertErr } = await admin.from(COST_TRACKER_TABLE).insert({
        surface: period.surface,
        period_year: period.year,
        period_month: period.month,
        cumulative_cost_microcents: BigInt(added).toString(),
        request_count: 1,
      })
      if (insertErr) {
        console.warn('[reflect-cost-tracker] insert failed (non-fatal):', insertErr.message)
      }
      return
    }

    const newCumulative = nextCumulativeMicrocents(BigInt(current.cumulative_cost_microcents ?? 0), added)
    const { error: updateErr } = await admin
      .from(COST_TRACKER_TABLE)
      .update({
        cumulative_cost_microcents: newCumulative.toString(),
        request_count: (current.request_count ?? 0) + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('surface', period.surface)
      .eq('period_year', period.year)
      .eq('period_month', period.month)

    if (updateErr) {
      console.warn('[reflect-cost-tracker] update failed (non-fatal):', updateErr.message)
    }
  } catch (err) {
    console.warn('[reflect-cost-tracker] increment threw (non-fatal):', err)
  }
}

// ============================================================================
// READ — the R5 cost-health reporter for the Sage Reflect surface
// ============================================================================

export interface ReflectCostHealth {
  readonly surface: string
  readonly year: number
  readonly month: number
  /** Cumulative true cost in microcents (precise — no sub-cent rounding loss). */
  readonly cumulative_cost_microcents: number
  /** The same cost in cents (microcents / 10000) — the figure the R5 2x ratio uses. */
  readonly cumulative_cost_cents: number
  /** Number of billable LLM stage calls accumulated this period. */
  readonly request_count: number
  /** True when the read failed; the caller treats cost as 0-but-unknown, not healthy. */
  readonly read_failed: boolean
}

/**
 * Read the accumulated microcent cost for (surface, year, month). FAIL-SOFT: on a
 * read failure returns read_failed=true with zeroed figures so the R5 check can
 * distinguish "no recorded cost" from "couldn't read" rather than silently reading
 * a healthy ratio. This is the figure the retrospective R5 revenue-to-cost ratio
 * should divide by for the Sage Reflect surface (true sub-cent cost is visible).
 */
export async function readReflectCostHealth(period: ReflectCostPeriod): Promise<ReflectCostHealth> {
  const base = {
    surface: period.surface,
    year: period.year,
    month: period.month,
    cumulative_cost_microcents: 0,
    cumulative_cost_cents: 0,
    request_count: 0,
  }
  try {
    const admin = getAdminClient()
    const { data, error } = await admin
      .from(COST_TRACKER_TABLE)
      .select('cumulative_cost_microcents, request_count')
      .eq('surface', period.surface)
      .eq('period_year', period.year)
      .eq('period_month', period.month)
      .maybeSingle()

    if (error) {
      console.warn('[reflect-cost-tracker] health read failed:', error.message)
      return { ...base, read_failed: true }
    }
    if (!data) return { ...base, read_failed: false }

    const mc = Number(BigInt(data.cumulative_cost_microcents ?? 0))
    return {
      ...base,
      cumulative_cost_microcents: mc,
      cumulative_cost_cents: microcentsToCents(mc),
      request_count: data.request_count ?? 0,
      read_failed: false,
    }
  } catch (err) {
    console.warn('[reflect-cost-tracker] health read threw:', err)
    return { ...base, read_failed: true }
  }
}
