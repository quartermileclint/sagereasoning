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

  // ── Estimate LLM costs ────────────────────────────────────────────────
  // Rough estimate: average $0.005 per API call (mix of haiku and sonnet)
  // This should be refined with actual Anthropic billing data
  const estimatedLlmCostCents = Math.round(totalApiCalls * 0.5)

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

  // ── Upsert snapshot ───────────────────────────────────────────────────
  await supabaseAdmin.from('cost_health_snapshots').upsert({
    period_start: periodStart,
    period_end: periodEnd,
    total_revenue_cents: totalRevenueCents,
    total_llm_cost_cents: estimatedLlmCostCents,
    total_api_calls: totalApiCalls,
    revenue_to_cost_ratio: ratio,
    sage_ops_cost_cents: sageOpsCostCents,
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
      revenue_to_cost_ratio: ratio,
      sage_ops_cost_usd: sageOpsCostCents / 100,
    },
    thresholds: {
      min_revenue_to_cost_ratio: COST_HEALTH.MIN_REVENUE_TO_COST_RATIO,
      sage_ops_monthly_cap_usd: COST_HEALTH.SAGE_OPS_MONTHLY_CAP_CENTS / 100,
    },
    alerts,
    health: alerts.length === 0 ? 'healthy' : 'warning',
  }, { status: 200, headers: corsHeaders() })
}
