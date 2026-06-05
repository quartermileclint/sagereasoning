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
import { createClient } from '@supabase/supabase-js'
import { corsHeaders, corsPreflightResponse, RATE_LIMITS, checkRateLimit } from '@/lib/security'
import { COST_HEALTH } from '@/lib/stripe'
import { getIdentityCostBaseline } from '@/lib/substrate/substrate-identity-baseline'
import { detectPerIdentityAnomaly, type CostAlert } from '@/lib/cost-alerts/cost-alert-detector'

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
    const { data: idRows, error: idErr } = await supabaseAdmin
      .from('loop_billing_events')
      .select('agent_id')
      .not('agent_id', 'is', null)
    if (idErr) {
      return NextResponse.json(
        { error: `Failed to enumerate identities: ${idErr.message}` },
        { status: 500, headers: corsHeaders() }
      )
    }
    agentIds = [
      ...new Set(
        ((idRows || []) as Array<{ agent_id: string | null }>)
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
    const { data: costRows, error: costErr } = await supabaseAdmin
      .from('loop_billing_events')
      .select('anthropic_cost_cents')
      .eq('agent_id', agentId)
    if (costErr || !costRows || costRows.length === 0) {
      skipped.push({ agent_id: agentId, reason: costErr ? costErr.message : 'no cost rows' })
      continue
    }

    const costs = (costRows as Array<{ anthropic_cost_cents: number | null }>).map(
      (r) => Number(r.anthropic_cost_cents) || 0
    )
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

  return NextResponse.json(
    {
      ok: true,
      detector: 'per_identity_anomaly',
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
