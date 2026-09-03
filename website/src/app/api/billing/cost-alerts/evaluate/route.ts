/**
 * GET /api/billing/cost-alerts/evaluate — A13 R5 cost-as-health-metric evaluator.
 *
 * D5 single-rule proof (PR1): per-identity cost-anomaly detection. Reads the
 * per-identity LLM-cost surface (loop_billing_events: agent_id +
 * anthropic_cost_cents), runs the PURE detector (cost-alert-detector.ts), and
 * persists any tripped alert to cost_alerts (deduped per detector+scope+UTC day
 * via upsert). Returns the alerts fired this run so a scheduled caller (the
 * Cowork scheduled task) can report them to the founder.
 *
 * Access: SERVICE TOKEN (COST_ALERTS_EVAL_TOKEN), sent as `Authorization: Bearer
 *   <token>` or the `x-cost-alerts-token` header. This is an automated/internal
 *   evaluator — the founder triggers it by curl and the scheduled delivery task
 *   polls it; neither does an interactive Supabase login, so it is NOT behind the
 *   founder-email admin gate (which would 403 a test-email TEST login and cannot
 *   be supplied by a scheduled job).
 * Inert behind SUBSTRATE_COST_ALERTS_ENABLED (unset => 503).
 * NEVER on the /api/reason critical path — pure observability (PR3 trivially met).
 *
 * Rules served: R5 (primary), R0 (oikeiosis cost trail), AC10 (reads the F4
 *   provenance / per-identity cost surface), PR1 (single-rule), PR2 (wired),
 *   PR3 (off the hot path). Risk: Elevated. PR6 not engaged (no R20a touch).
 *
 * @compliance
 * compliance_version: CR-2026-Q2-v4
 * regulatory_references: [CR-005]
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { corsHeaders, corsPreflightResponse, RATE_LIMITS, checkRateLimit } from '@/lib/security'
import { COST_HEALTH } from '@/lib/stripe'
import { getIdentityCostBaseline } from '@/lib/substrate/substrate-identity-baseline'
import { pagedRows } from '@/lib/db/paged-select'
import {
  detectPerIdentityAnomaly,
  detectPerCallSpike,
  detectRevenueCostRatio,
  detectOpsMonthlyCap,
  detectRolling7DaySpike,
  type CostAlert,
} from '@/lib/cost-alerts/cost-alert-detector'

/**
 * Persist one fired alert — dedup on (detector_type, scope, period_date) via
 * upsert. KG1: awaited (no fire-and-forget). Shared by the global detectors
 * (D4 + D1–D3); the per-identity D5 loop keeps its own inline persist so its
 * Verified-live path stays byte-identical.
 */
async function persistCostAlert(
  supabaseAdmin: SupabaseClient,
  alert: CostAlert,
  periodDate: string
): Promise<{ persisted: boolean; error?: string }> {
  const { data, error } = await supabaseAdmin
    .from('cost_alerts')
    .upsert(
      {
        detector_type: alert.detector_type,
        scope: alert.scope,
        severity: alert.severity,
        period_date: periodDate,
        observed_value: alert.observed_value,
        threshold_value: alert.threshold_value,
        multiple: alert.multiple,
        message: alert.message,
        details: alert.details,
      },
      { onConflict: 'detector_type,scope,period_date' }
    )
    .select('id')
  if (error) return { persisted: false, error: error.message }
  return { persisted: !!(data && data.length > 0) }
}

export async function OPTIONS() {
  return corsPreflightResponse()
}

export async function GET(request: NextRequest) {
  // ── Flag gate — inert in production until explicitly enabled ──────────
  if (process.env.SUBSTRATE_COST_ALERTS_ENABLED !== 'true') {
    return NextResponse.json(
      { error: 'Cost-alert evaluation is disabled (SUBSTRATE_COST_ALERTS_ENABLED unset).' },
      { status: 503, headers: corsHeaders() }
    )
  }

  // ── Service-token auth ────────────────────────────────────────────────
  // Automated/internal evaluator: the founder triggers it by curl and the
  // scheduled delivery task polls it on a cadence. Neither does an interactive
  // Supabase login, so it is gated by a shared secret (COST_ALERTS_EVAL_TOKEN)
  // sent as `Authorization: Bearer <token>` or the `x-cost-alerts-token` header —
  // NOT by the founder-email admin gate (which would 403 a test-email TEST login
  // and cannot be supplied by a scheduled job). Constant string compare; the
  // secret is high-entropy and never user-derived.
  const expectedToken = process.env.COST_ALERTS_EVAL_TOKEN || ''
  if (!expectedToken) {
    return NextResponse.json(
      { error: 'Cost-alert evaluation is not configured (COST_ALERTS_EVAL_TOKEN unset).' },
      { status: 503, headers: corsHeaders() }
    )
  }
  const providedToken =
    request.headers.get('authorization')?.replace(/^Bearer\s+/i, '').trim() ||
    request.headers.get('x-cost-alerts-token')?.trim() ||
    ''
  if (!providedToken || providedToken !== expectedToken) {
    return NextResponse.json(
      { error: 'Invalid or missing cost-alerts service token.' },
      { status: 401, headers: corsHeaders() }
    )
  }

  // ── Rate limit ────────────────────────────────────────────────────────
  const rateLimitHit = checkRateLimit(request, RATE_LIMITS.admin)
  if (rateLimitHit) return rateLimitHit

  // ── Optional scope: ?agent_id=<id> evaluates one identity; else all ───
  const requestedAgentId = request.nextUrl.searchParams.get('agent_id')?.trim() || null

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // ── Determine which identities to evaluate ────────────────────────────
  let agentIds: string[] = []
  if (requestedAgentId) {
    agentIds = [requestedAgentId]
  } else {
    // H3, row-cap sweep 2026-09-02/-03: was an unbounded whole-table read —
    // silently dropped identities beyond the first 1,000 rows. `pagedRows`
    // walks the table to completion via keyset pagination on `id` (the
    // table's UUID primary key — a genuinely unique cursor, no tie risk).
    const { rows: idRows, error: idErr } = await pagedRows<{ agent_id: string | null }>(
      supabaseAdmin,
      'loop_billing_events',
      'id',
      'id,agent_id',
      { notNullColumn: 'agent_id' }
    )
    if (idErr) {
      return NextResponse.json(
        { error: `Failed to enumerate identities: ${idErr}` },
        { status: 500, headers: corsHeaders() }
      )
    }
    agentIds = [
      ...new Set(
        (idRows || [])
          .map((r) => r.agent_id)
          .filter((x): x is string => typeof x === 'string' && x.length > 0)
      ),
    ]
  }

  const periodDate = new Date().toISOString().slice(0, 10) // UTC YYYY-MM-DD
  const evaluated: string[] = []
  const firedAlerts: CostAlert[] = []
  const skipped: Array<{ agent_id: string; reason: string }> = []
  let persistedCount = 0

  for (const agentId of agentIds) {
    evaluated.push(agentId)

    // A12 helper — the named D5 input. Gives loop_count + the (bill-based)
    // baseline for cross-reference; null when the identity has no history.
    const baseline = await getIdentityCostBaseline(agentId)
    if (!baseline) {
      skipped.push({ agent_id: agentId, reason: 'no baseline (no recorded loops)' })
      continue
    }

    // R5 = LLM cost = anthropic_cost_cents. NOTE (PR13 consider-implications):
    // getIdentityCostBaseline aggregates total_cents (the customer bill) under a
    // field named *cost*; for an R5 cost-health alert the LLM cost
    // (anthropic_cost_cents) is the faithful signal, so D5 triggers on that.
    // The bill-based baseline is carried in details for context. A follow-on
    // could align the helper's naming or add a cost-based variant.
    // H4, row-cap sweep 2026-09-02/-03: was an unbounded per-agent read —
    // silently truncated the count/sum/max for the dominant identity once its
    // history crossed 1,000 rows. Paged on `id` (the table's UUID PK).
    const { rows: costRows, error: costErr } = await pagedRows<{ anthropic_cost_cents: number | null }>(
      supabaseAdmin,
      'loop_billing_events',
      'id',
      'id,anthropic_cost_cents',
      { eqColumn: 'agent_id', eqValue: agentId }
    )
    if (costErr || !costRows || costRows.length === 0) {
      skipped.push({ agent_id: agentId, reason: costErr ? costErr : 'no cost rows' })
      continue
    }

    const costs = costRows.map((r) => Number(r.anthropic_cost_cents) || 0)
    const loopCount = costs.length
    const totalCostCents = costs.reduce((s, c) => s + c, 0)
    const maxLoopCostCents = costs.reduce((m, c) => (c > m ? c : m), 0)

    const alert = detectPerIdentityAnomaly({
      agentId,
      loopCount,
      totalCostCents,
      maxLoopCostCents,
      multiplier: COST_HEALTH.PER_IDENTITY_ANOMALY_MULTIPLIER,
      minPriorLoops: COST_HEALTH.PER_IDENTITY_MIN_PRIOR_LOOPS,
      absoluteFloorCents: COST_HEALTH.PER_IDENTITY_ABSOLUTE_FLOOR_CENTS,
    })
    if (!alert) continue

    // Carry the A12 bill-based baseline alongside the cost-based trigger.
    alert.details.bill_baseline_loop_count = baseline.loop_count
    alert.details.bill_baseline_total_cents = baseline.total_cost_cents
    firedAlerts.push(alert)

    // Persist — dedup on (detector_type, scope, period_date). KG1: awaited.
    const { data: upserted, error: upErr } = await supabaseAdmin
      .from('cost_alerts')
      .upsert(
        {
          detector_type: alert.detector_type,
          scope: alert.scope,
          severity: alert.severity,
          period_date: periodDate,
          observed_value: alert.observed_value,
          threshold_value: alert.threshold_value,
          multiple: alert.multiple,
          message: alert.message,
          details: alert.details,
        },
        { onConflict: 'detector_type,scope,period_date' }
      )
      .select('id')
    if (upErr) {
      skipped.push({ agent_id: agentId, reason: `persist failed: ${upErr.message}` })
      continue
    }
    if (upserted && upserted.length > 0) persistedCount += 1
  }

  // ── Global detectors (run once per full sweep; NOT on a targeted ?agent_id) ──
  // D4 (per-call spike) + D1–D3 (revenue:cost ratio, ops cap, rolling 7-day spike)
  // are account-wide (scope 'global'); the (detector_type, scope, period_date)
  // dedup yields one alert per detector per UTC day. A targeted ?agent_id=X query
  // runs only the per-identity detector for X; the scheduled task does a full sweep
  // (no agent_id), so the global detectors always run there. Each reads its own
  // faithful cost surface (PR13): D4 per-loop anthropic_cost_cents; D1 revenue vs
  // LLM cost; D2 Sage Ops cost; D3 daily substrate spend. D1–D3 gather the same
  // surfaces A9 reads, here, so the evaluator is FRESH and not reliant on the admin
  // usage-summary endpoint having been polled.
  const detectorsRun: string[] = ['per_identity_anomaly']
  if (!requestedAgentId) {
    detectorsRun.push('per_call_spike', 'revenue_cost_ratio', 'ops_monthly_cap', 'rolling_7day_spike')
    const globalAlerts: CostAlert[] = []

    // ── D4 — per-call (global) spike over all loops' anthropic_cost_cents ──
    // H2, row-cap sweep 2026-09-02/-03: was an unbounded whole-table read —
    // silently computed count/sum/max over an arbitrary 1,000-row subset
    // once the table crossed the cap. Paged on `id` (the table's UUID PK).
    const { rows: allCostRows, error: allCostErr } = await pagedRows<{ anthropic_cost_cents: number | null }>(
      supabaseAdmin,
      'loop_billing_events',
      'id',
      'id,anthropic_cost_cents'
    )
    if (allCostErr) {
      skipped.push({ agent_id: 'global', reason: `per_call_spike query failed: ${allCostErr}` })
    } else if (allCostRows && allCostRows.length > 0) {
      const allCosts = allCostRows.map((r) => Number(r.anthropic_cost_cents) || 0)
      const spike = detectPerCallSpike({
        loopCount: allCosts.length,
        totalCostCents: allCosts.reduce((s, c) => s + c, 0),
        maxLoopCostCents: allCosts.reduce((m, c) => (c > m ? c : m), 0),
        multiplier: COST_HEALTH.PER_CALL_SPIKE_MULTIPLIER,
        minPriorLoops: COST_HEALTH.PER_CALL_SPIKE_MIN_PRIOR_LOOPS,
        absoluteFloorCents: COST_HEALTH.PER_CALL_SPIKE_ABSOLUTE_FLOOR_CENTS,
      })
      if (spike) globalAlerts.push(spike)
    }

    // ── D1–D3 — account-health detectors folded in from A9 usage-summary ──
    try {
      const gNow = new Date()
      const gPeriodStart = new Date(gNow.getFullYear(), gNow.getMonth(), 1).toISOString().split('T')[0]
      const gPeriodEnd = new Date(gNow.getFullYear(), gNow.getMonth() + 1, 0).toISOString().split('T')[0]

      // Revenue this month (payment_events) — D1 numerator.
      const { data: revenueEvents } = await supabaseAdmin
        .from('payment_events')
        .select('amount_cents')
        .in('event_type', ['checkout.session.completed', 'invoice.paid'])
        .gte('created_at', `${gPeriodStart}T00:00:00Z`)
        .lte('created_at', `${gPeriodEnd}T23:59:59Z`)
      const revenueCents = (revenueEvents || []).reduce(
        (s: number, r: { amount_cents: number | null }) => s + (r.amount_cents || 0),
        0
      )

      // LLM cost this month (substrate path) — D1 denominator + D3 source.
      const { data: monthCostRows } = await supabaseAdmin
        .from('translation_sandwich_comparisons')
        .select('layer1_cost_usd_microcents, layer3_cost_usd_microcents')
        .gte('created_at', `${gPeriodStart}T00:00:00Z`)
        .lte('created_at', `${gPeriodEnd}T23:59:59Z`)
      const llmCostMicrocents = (monthCostRows || []).reduce(
        (
          s: number,
          r: { layer1_cost_usd_microcents: number | null; layer3_cost_usd_microcents: number | null }
        ) => s + (r.layer1_cost_usd_microcents || 0) + (r.layer3_cost_usd_microcents || 0),
        0
      )
      const llmCostCents = Math.round(llmCostMicrocents / 10000)

      // D1 — revenue:cost ratio.
      const ratioAlert = detectRevenueCostRatio({
        revenueCents,
        llmCostCents,
        minRatio: COST_HEALTH.MIN_REVENUE_TO_COST_RATIO,
      })
      if (ratioAlert) globalAlerts.push(ratioAlert)

      // Ops spend from the current cost_health_snapshots row (A9 maintains it).
      const { data: snap } = await supabaseAdmin
        .from('cost_health_snapshots')
        .select('sage_ops_cost_cents')
        .eq('period_start', gPeriodStart)
        .eq('period_end', gPeriodEnd)
        .single()
      const opsCostCents = snap?.sage_ops_cost_cents || 0

      // D2 — Sage Ops monthly cap.
      const opsAlert = detectOpsMonthlyCap({
        opsCostCents,
        capCents: COST_HEALTH.SAGE_OPS_MONTHLY_CAP_CENTS,
      })
      if (opsAlert) globalAlerts.push(opsAlert)

      // Rolling 7-day daily substrate spend (today vs prior-7-day average).
      const gToday = new Date(gNow)
      gToday.setUTCHours(0, 0, 0, 0)
      const gSevenDaysAgo = new Date(gToday)
      gSevenDaysAgo.setUTCDate(gToday.getUTCDate() - 7)
      const { data: windowRows } = await supabaseAdmin
        .from('translation_sandwich_comparisons')
        .select('created_at, layer1_cost_usd_microcents, layer3_cost_usd_microcents')
        .gte('created_at', gSevenDaysAgo.toISOString())
        .lte('created_at', new Date().toISOString())
      if (windowRows && windowRows.length > 0) {
        const dailyCents: Record<string, number> = {}
        for (const row of windowRows as Array<{
          created_at: string
          layer1_cost_usd_microcents: number | null
          layer3_cost_usd_microcents: number | null
        }>) {
          const dayKey = row.created_at.slice(0, 10)
          dailyCents[dayKey] =
            (dailyCents[dayKey] || 0) +
            ((row.layer1_cost_usd_microcents || 0) + (row.layer3_cost_usd_microcents || 0)) / 10000
        }
        const todayKey = gToday.toISOString().slice(0, 10)
        const todayCents = Math.round(dailyCents[todayKey] || 0)
        const priorDays = Object.entries(dailyCents).filter(([k]) => k !== todayKey)
        const daysObserved = priorDays.length
        const priorSum = priorDays.reduce((s, [, v]) => s + v, 0)
        const priorAvgCents = daysObserved > 0 ? Math.round(priorSum / daysObserved) : 0

        // D3 — rolling 7-day spike.
        const rollingAlert = detectRolling7DaySpike({
          todayCents,
          priorAvgCents,
          daysObserved,
          minDaysObserved: COST_HEALTH.ROLLING_AVERAGE_MIN_DAYS_OBSERVED,
          multiplier: COST_HEALTH.ROLLING_AVERAGE_ALERT_MULTIPLIER,
        })
        if (rollingAlert) globalAlerts.push(rollingAlert)
      }
    } catch (err) {
      skipped.push({
        agent_id: 'global',
        reason: `D1-D3 evaluation failed: ${err instanceof Error ? err.message : String(err)}`,
      })
    }

    // ── Persist every fired global alert (dedup on detector_type+scope+day) ──
    for (const alert of globalAlerts) {
      firedAlerts.push(alert)
      const res = await persistCostAlert(supabaseAdmin, alert, periodDate)
      if (res.error) {
        skipped.push({ agent_id: 'global', reason: `${alert.detector_type} persist failed: ${res.error}` })
      } else if (res.persisted) {
        persistedCount += 1
      }
    }
  }

  return NextResponse.json(
    {
      ok: true,
      detectors_run: detectorsRun,
      period_date: periodDate,
      identities_evaluated: evaluated.length,
      alerts_fired: firedAlerts.length,
      alerts_persisted: persistedCount,
      alerts: firedAlerts,
      skipped,
    },
    { status: 200, headers: corsHeaders() }
  )
}
