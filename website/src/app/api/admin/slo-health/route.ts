/**
 * GET /api/admin/slo-health — A14 live SLO/health tracker (read-only, provisional).
 *
 * Reads the A12 latency surface (substrate_audit_events: layer1/2/3_latency_ms +
 * occurred_at) for /api/reason and returns rolling p50/p95 latency vs the SLO
 * targets. Read-only; computes nothing, writes nothing, never on the /api/reason
 * hot path. The maths lives in lib/slo/slo-stats.ts (pure, unit-tested, PR1).
 *
 * Honest posture (R18/R19; SLO policy §4): only /api/reason is instrumented and
 * production traffic is ~nil, so values are sparse/provisional until traffic —
 * the response is labelled `provisional: true`. This is pre-positioning, not a
 * load-bearing measurement yet.
 *
 * Auth: founder-admin gate (requireAdmin → reuses existing ADMIN_USER_ID; no new
 *   secret) so the founder can open it signed-in.
 * Inert behind SUBSTRATE_SLO_TRACKER_ENABLED (unset => 503) — default OFF in
 *   production, exactly like the A13/A19 detection-before-activation pattern.
 *   Activation is a trivial future flag-flip, not part of the S7 Critical spine.
 *
 * Rules served: R5 (operational health), AC2 (safety-latency budget it sits
 *   alongside), R3/R17 (reads structural latency only — never PII), PR1 (pure
 *   maths proven), PR2 (wired + invoked), PR3 (off the hot path). Risk: Elevated
 *   (read-only; additive; reversible). PR6 NOT engaged. AC7 NOT engaged.
 *
 * @compliance
 * compliance_version: CR-2026-Q2-v5
 * regulatory_references: [CR-005]
 */
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { checkRateLimit, RATE_LIMITS, requireAdmin } from '@/lib/security'
import { buildSloHealth, type LatencyRow } from '@/lib/slo/slo-stats'
import { pagedRows } from '@/lib/db/paged-select'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  // ── Flag gate — inert until explicitly enabled ───────────────────────────
  if (process.env.SUBSTRATE_SLO_TRACKER_ENABLED !== 'true') {
    return NextResponse.json(
      { error: 'SLO tracker is disabled (SUBSTRATE_SLO_TRACKER_ENABLED unset).' },
      { status: 503 }
    )
  }

  // ── Rate limit + founder-admin gate (reuses ADMIN_USER_ID; no new secret) ─
  const rateLimitHit = checkRateLimit(request, RATE_LIMITS.admin)
  if (rateLimitHit) return rateLimitHit
  const admin = await requireAdmin(request)
  if (admin.error) return admin.error

  const surface = request.nextUrl.searchParams.get('surface')?.trim() || 'api_reason'

  // H7, row-cap sweep 2026-09-02/-03: was an unbounded whole-table read —
  // silently computed percentile latencies over an arbitrary 1,000-row
  // subset once the table crossed the cap. `buildSloHealth`'s own `all_time`
  // window statistic needs the TRUE full history (a narrowed lookback would
  // make the `all_time` label dishonest — its `last_7d` window already
  // filters in-memory from the same rows), so this is fully paged on
  // `event_id` rather than time-windowed.
  const { rows: data, error } = await pagedRows<LatencyRow & { event_id: string }>(
    supabaseAdmin,
    'substrate_audit_events',
    'event_id',
    'event_id, layer1_latency_ms, layer2_latency_ms, layer3_latency_ms, occurred_at',
    { eqColumn: 'surface', eqValue: surface }
  )
  if (error) {
    return NextResponse.json(
      { error: `Failed to read latency rows: ${error}` },
      { status: 500 }
    )
  }

  const rows = (data || []) as LatencyRow[]
  const health = buildSloHealth(rows, Date.now(), surface)
  return NextResponse.json(health, { status: 200 })
}
