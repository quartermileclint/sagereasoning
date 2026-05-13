/**
 * GET /api/billing/usage-summary — R5 cost-health-metric summary.
 *
 * Returns current billing period's revenue, LLM costs, and the
 * revenue-to-cost ratio. Alerts if ratio drops below 2.0x (R5 threshold)
 * or if Sage Ops costs exceed $100/month cap.
 *
 * Access: Admin only (service role or founder).
 *
 * Rules served: R0 (oikeiosis), R5 (2x margin, $100 Ops cap)
 *
 * @compliance
 * compliance_version: CR-2026-Q2-v4
 * regulatory_references: [CR-005]
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAuth, corsHeaders, corsPreflightResponse, RATE_LIMITS, checkRateLimit } from '@/lib/security'
import { COST_HEALTH } from '@/lib/stripe'
import { getClassifierCostSummary, checkClassifierCostThreshold } from '@/lib/r20a-cost-tracker'

export async function OPTIONS() {
  return corsPreflightResponse()
}

export async function GET(request: NextRequest) {
  // Rate limit
  const rateLimitHit = checkRateLimit(request, RATE_LIMITS.admin)
  if (rateLimitHit) return rateLimitHit

  // Authenticate
  const auth = await requireAuth(request)
  if (auth.error) return auth.error

  // Admin check — only the founder email can access this
  // TODO: Replace with proper admin role check when roles are implemented
  const ADMIN_EMAILS = ['clintonaitkenhead@hotmail.com', 'zeus@sagereasoning.com']
  if (!auth.user.email || !ADMIN_EMAILS.includes(auth.user.email)) {
    return NextResponse.json(
      { error: 'Admin access required.' },
      { status: 403, headers: corsHeaders() }
    )
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const now = new Date()
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString().split('T')[0]
  const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    .toISOString().split('T')[0]

  // ── Fetch or compute current period snapshot ──────────────────────────
  const { data: snapshot } = await supabaseAdmin
    .from('cost_health_snapshots')
    .select('*')
    .eq('period_start', periodStart)
    .eq('period_end', periodEnd)
    .single()

  // ── Fetch total API calls this month (from api_key_usage) ─────────────
  const year = now.getFullYear()
  const month = now.getMonth() + 1

  const { data: usageRows } = await supabaseAdmin
    .from('api_key_usage')
    .select('monthly_total')
    .eq('year', year)
    .eq('month', month)

  const totalApiCalls = usageRows?.reduce(
    (sum: number, row: { monthly_total: number }) => sum + (row.monthly_total || 0),
    0
  ) || 0

  // ── Fetch revenue this month (from payment_events) ────────────────────
  const { data: revenueEvents } = await supabaseAdmin
    .from('payment_events')
    .select('amount_cents')
    .in('event_type', ['checkout.session.completed', 'invoice.paid'])
    .gte('created_at', `${periodStart}T00:00:00Z`)
    .lte('created_at', `${periodEnd}T23:59:59Z`)

  const totalRevenueCents = revenueEvents?.reduce(
    (sum: number, row: { amount_cents: number | null }) => sum + (row.amount_cents || 0),
    0
  ) || 0

  // ── Compute LLM costs from substrate path (A9 Option B, 2026-05-14) ───
  // Post-M1-CP6 the translation-sandwich is the sole engine on /api/reason.
  // Each successful request writes layer1_cost_usd_microcents +
  // layer3_cost_usd_microcents to translation_sandwich_comparisons. Sum
  // those for the period instead of the prior heuristic of
  // totalApiCalls * $0.005 (see J6 assessment 2026-05-14 for cost-shape
  // analysis). Defensive: if the query fails or the table is empty, fall
  // back to the heuristic so the endpoint still returns rather than 500.
  let llmCostMicrocents = 0
  let substrateCostQueryOk = false
  try {
    const { data: costRows, error: costErr } = await supabaseAdmin
      .from('translation_sandwich_comparisons')
      .select('layer1_cost_usd_microcents, layer3_cost_usd_microcents')
      .gte('created_at', `${periodStart}T00:00:00Z`)
      .lte('created_at', `${periodEnd}T23:59:59Z`)

    if (!costErr && costRows) {
      llmCostMicrocents = costRows.reduce(
        (sum: number, row: { layer1_cost_usd_microcents: number | null; layer3_cost_usd_microcents: number | null }) =>
          sum + (row.layer1_cost_usd_microcents || 0) + (row.layer3_cost_usd_microcents || 0),
        0
      )
      substrateCostQueryOk = true
    }
  } catch (err) {
    console.warn('[usage-summary] substrate cost query failed; falling back to heuristic:', err)
  }

  // Convert microcents (1e-6 USD) → cents (1e-2 USD): divide by 1e4.
  const substrateLlmCostCents = Math.round(llmCostMicrocents / 10000)
  // Fallback heuristic (preserves prior behaviour if the substrate query failed
  // or returned no rows — e.g., very first request of the month).
  const fallbackLlmCostCents = Math.round(totalApiCalls * 0.5)
  const estimatedLlmCostCents = substrateCostQueryOk && substrateLlmCostCents > 0
    ? substrateLlmCostCents
    : fallbackLlmCostCents

  // ── Compute ratio ─────────────────────────────────────────────────────
  const ratio = estimatedLlmCostCents > 0
    ? totalRevenueCents / estimatedLlmCostCents
    : null // Can't compute if no costs

  // ── Check alerts ──────────────────────────────────────────────────────
  const alerts: string[] = []

  if (ratio !== null && ratio < COST_HEALTH.MIN_REVENUE_TO_COST_RATIO) {
    alerts.push(
      `R5 ALERT: Revenue-to-cost ratio is ${ratio.toFixed(2)}x — below the 2.0x minimum threshold. ` +
      `Revenue: $${(totalRevenueCents / 100).toFixed(2)}, Estimated LLM cost: $${(estimatedLlmCostCents / 100).toFixed(2)}.`
    )
  }

  const sageOpsCostCents = snapshot?.sage_ops_cost_cents || 0
  if (sageOpsCostCents > COST_HEALTH.SAGE_OPS_MONTHLY_CAP_CENTS) {
    alerts.push(
      `R5 ALERT: Sage Ops costs ($${(sageOpsCostCents / 100).toFixed(2)}) exceed the $100/month cap.`
    )
  }

  // ── Rolling 7-day daily-spend alert (A9 Option B, 2026-05-14) ─────────
  // R5 manifest rule: "Cost-as-health-metric alerts trigger at 2x the
  // rolling 7-day average daily spend." Sources cost from the substrate
  // path (translation_sandwich_comparisons). Cold-start guard: require
  // at least 3 days of observed data before firing (per J6 assessment
  // §5 — insufficient signal otherwise).
  //
  // The window is the 7 calendar UTC days preceding today. Today's spend
  // is compared to the average of the prior 7 (excluding today). If today
  // exceeds 2.0x that average, the alert fires.
  let rollingWindow: { todayCents: number; avgCents: number; daysObserved: number } | null = null
  try {
    const today = new Date(now)
    today.setUTCHours(0, 0, 0, 0)
    const sevenDaysAgo = new Date(today)
    sevenDaysAgo.setUTCDate(today.getUTCDate() - 7)

    const { data: windowRows, error: windowErr } = await supabaseAdmin
      .from('translation_sandwich_comparisons')
      .select('created_at, layer1_cost_usd_microcents, layer3_cost_usd_microcents')
      .gte('created_at', sevenDaysAgo.toISOString())
      .lte('created_at', new Date().toISOString())

    if (!windowErr && windowRows && windowRows.length > 0) {
      // Bucket by UTC date.
      const dailyCents: Record<string, number> = {}
      for (const row of windowRows as Array<{
        created_at: string
        layer1_cost_usd_microcents: number | null
        layer3_cost_usd_microcents: number | null
      }>) {
        const dayKey = row.created_at.slice(0, 10) // YYYY-MM-DD
        const rowMicrocents =
          (row.layer1_cost_usd_microcents || 0) + (row.layer3_cost_usd_microcents || 0)
        dailyCents[dayKey] = (dailyCents[dayKey] || 0) + rowMicrocents / 10000
      }

      const todayKey = today.toISOString().slice(0, 10)
      const todayCents = Math.round(dailyCents[todayKey] || 0)

      // Prior-7-day average excludes today.
      const priorDays = Object.entries(dailyCents).filter(([k]) => k !== todayKey)
      const daysObserved = priorDays.length
      const priorSum = priorDays.reduce((sum, [, v]) => sum + v, 0)
      const avgCents = daysObserved > 0 ? Math.round(priorSum / daysObserved) : 0

      rollingWindow = { todayCents, avgCents, daysObserved }

      // Cold-start guard: require 3+ days of prior data before firing.
      if (daysObserved >= 3 && avgCents > 0) {
        const multiplier = todayCents / avgCents
        if (multiplier >= COST_HEALTH.ROLLING_AVERAGE_ALERT_MULTIPLIER) {
          alerts.push(
            `R5 ALERT: Today's substrate spend ($${(todayCents / 100).toFixed(2)}) is ` +
            `${multiplier.toFixed(2)}x the rolling 7-day average ($${(avgCents / 100).toFixed(2)}) — ` +
            `at or above the ${COST_HEALTH.ROLLING_AVERAGE_ALERT_MULTIPLIER.toFixed(1)}x threshold.`
          )
        }
      }
    }
  } catch (err) {
    console.warn('[usage-summary] rolling-7-day window query failed:', err)
  }

  // ── R20a classifier cost monitoring (ADR-R20a-01 D7-b) ───────────────
  // Scaffolded: returns zeros until Phase D classifier ships and starts
  // logging to classifier_cost_log. Graceful fallback if table missing.
  const classifierSummary = await getClassifierCostSummary(periodStart, periodEnd)

  // Estimate mentor-turn cost for threshold comparison.
  // Mentor endpoints use Sonnet (~$0.015 per call average).
  // TODO: Replace with actual per-endpoint cost tracking when available.
  const ESTIMATED_MENTOR_COST_PER_CALL_CENTS = 1.5  // $0.015
  const mentorCallEstimate = Math.round(totalApiCalls * 0.3)  // ~30% of calls are mentor
  const mentorTurnCostCents = Math.round(mentorCallEstimate * ESTIMATED_MENTOR_COST_PER_CALL_CENTS)

  const classifierAlert = checkClassifierCostThreshold(
    classifierSummary.total_cost_cents,
    mentorTurnCostCents
  )

  if (classifierAlert.triggered && classifierAlert.message) {
    alerts.push(classifierAlert.message)
  }

  // ── Upsert snapshot ───────────────────────────────────────────────────
  await supabaseAdmin.from('cost_health_snapshots').upsert({
    period_start: periodStart,
    period_end: periodEnd,
    total_revenue_cents: totalRevenueCents,
    total_llm_cost_cents: estimatedLlmCostCents,
    total_api_calls: totalApiCalls,
    revenue_to_cost_ratio: ratio,
    sage_ops_cost_cents: sageOpsCostCents,
    classifier_cost_cents: Math.round(classifierSummary.total_cost_cents),
    classifier_to_mentor_ratio: classifierAlert.ratio,
    alert_triggered: alerts.length > 0,
    alert_reason: alerts.length > 0 ? alerts.join(' | ') : null,
  }, {
    onConflict: 'period_start,period_end',
  })

  return NextResponse.json({
    period: { start: periodStart, end: periodEnd },
    metrics: {
      total_api_calls: totalApiCalls,
      total_revenue_usd: totalRevenueCents / 100,
      estimated_llm_cost_usd: estimatedLlmCostCents / 100,
      // A9 Option B (2026-05-14): cost source is now substrate-derived when
      // available; falls back to the prior heuristic only if the substrate
      // query failed or returned zero rows.
      cost_source: substrateCostQueryOk && substrateLlmCostCents > 0 ? 'substrate' : 'heuristic_fallback',
      revenue_to_cost_ratio: ratio,
      sage_ops_cost_usd: sageOpsCostCents / 100,
      // Rolling 7-day daily-spend window (A9 Option B, 2026-05-14).
      // Null when the window query failed or returned no rows.
      rolling_seven_day: rollingWindow
        ? {
            today_usd: rollingWindow.todayCents / 100,
            prior_seven_day_avg_usd: rollingWindow.avgCents / 100,
            prior_days_observed: rollingWindow.daysObserved,
            multiplier_today_over_avg: rollingWindow.avgCents > 0
              ? rollingWindow.todayCents / rollingWindow.avgCents
              : null,
          }
        : null,
      // R20a classifier cost metrics (scaffolded — returns zeros until Phase D ships)
      r20a_classifier: {
        total_invocations: classifierSummary.total_invocations,
        rule_only_count: classifierSummary.rule_only_count,
        llm_invocations: classifierSummary.llm_invocations,
        total_cost_usd: classifierSummary.total_cost_cents / 100,
        avg_cost_per_run_usd: classifierSummary.avg_cost_per_run / 100,
        flags_written: classifierSummary.flags_written,
        severity_3_count: classifierSummary.severity_3_count,
        classifier_to_mentor_ratio: classifierAlert.ratio,
      },
    },
    thresholds: {
      min_revenue_to_cost_ratio: COST_HEALTH.MIN_REVENUE_TO_COST_RATIO,
      sage_ops_monthly_cap_usd: COST_HEALTH.SAGE_OPS_MONTHLY_CAP_CENTS / 100,
      r20a_classifier_max_mentor_ratio: COST_HEALTH.R20A_CLASSIFIER_MAX_MENTOR_RATIO,
      rolling_seven_day_alert_multiplier: COST_HEALTH.ROLLING_AVERAGE_ALERT_MULTIPLIER,
    },
    alerts,
    health: alerts.length === 0 ? 'healthy' : 'warning',
  }, { status: 200, headers: corsHeaders() })
}
