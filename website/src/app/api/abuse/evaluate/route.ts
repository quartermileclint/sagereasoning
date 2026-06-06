/**
 * GET /api/abuse/evaluate — A19 abuse-detection evaluator (detection only).
 *
 * PR1 single-detector proof: per-identity request-velocity anomaly. Reads the A12
 * timestamped behavioural surface (substrate_audit_events: occurred_at + agent_id),
 * buckets each identity's events into fixed time windows, runs the PURE detector
 * (abuse-detector.ts), and persists any tripped signal to abuse_signals (deduped
 * per signal_type + scope + UTC day via upsert). Returns the signals fired this
 * run so a future scheduled caller can report them to the founder.
 *
 * Deliberately mirrors /api/billing/cost-alerts/evaluate (A13): same flag-gate +
 * service-token shape, same enumerate -> per-identity -> detect -> persist loop,
 * same response envelope. Detection only — NO enforcement (no rate-limit / revoke
 * on live traffic). Enforcement is a separate later activation, exactly as A13
 * shipped detection-live with delivery deferred.
 *
 * Access: SERVICE TOKEN (ABUSE_DETECTION_EVAL_TOKEN), sent as `Authorization:
 *   Bearer <token>` or the `x-abuse-detection-token` header. Automated/internal
 *   evaluator — not behind the founder-email admin gate (which a scheduled job
 *   cannot supply).
 * Inert behind SUBSTRATE_ABUSE_DETECTION_ENABLED (unset => 503).
 * NEVER on the /api/reason critical path — pure observability (PR3 trivially met).
 * PR6 NOT engaged: reads the substrate's already-produced audit rows; never the
 *   R20a classifier, Zone 2/3 logic, or any wrapper.
 *
 * Rules served: R5 (operational health, primary), R0 (audit trail), R3 (scope is
 *   an agent_id, never an end-user id), AC10 (reads the A12 behavioural surface),
 *   PR1 (single-detector), PR2 (wired + invoked), PR3 (off the hot path). Risk:
 *   Elevated.
 *
 * @compliance
 * compliance_version: CR-2026-Q2-v5
 * regulatory_references: [CR-005]
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { corsHeaders, corsPreflightResponse, RATE_LIMITS, checkRateLimit } from '@/lib/security'
import { ABUSE_DETECTION } from '@/lib/abuse-detection/abuse-thresholds'
import {
  detectRequestVelocityAnomaly,
  type AbuseSignal,
} from '@/lib/abuse-detection/abuse-detector'

/**
 * Persist one fired signal — dedup on (signal_type, scope, period_date) via
 * upsert. KG1: awaited (no fire-and-forget). KG7: details is a JSONB object.
 */
async function persistAbuseSignal(
  supabaseAdmin: SupabaseClient,
  signal: AbuseSignal,
  periodDate: string
): Promise<{ persisted: boolean; error?: string }> {
  const { data, error } = await supabaseAdmin
    .from('abuse_signals')
    .upsert(
      {
        signal_type: signal.signal_type,
        scope: signal.scope,
        severity: signal.severity,
        period_date: periodDate,
        observed_value: signal.observed_value,
        threshold_value: signal.threshold_value,
        multiple: signal.multiple,
        message: signal.message,
        details: signal.details,
      },
      { onConflict: 'signal_type,scope,period_date' }
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
  if (process.env.SUBSTRATE_ABUSE_DETECTION_ENABLED !== 'true') {
    return NextResponse.json(
      { error: 'Abuse-detection evaluation is disabled (SUBSTRATE_ABUSE_DETECTION_ENABLED unset).' },
      { status: 503, headers: corsHeaders() }
    )
  }

  // ── Service-token auth ────────────────────────────────────────────────
  // Automated/internal evaluator: triggered by curl / a future scheduled task.
  // Gated by a shared secret (ABUSE_DETECTION_EVAL_TOKEN) sent as
  // `Authorization: Bearer <token>` or `x-abuse-detection-token` — NOT by the
  // founder-email admin gate (which a scheduled job cannot supply). Constant
  // string compare; the secret is high-entropy and never user-derived.
  const expectedToken = process.env.ABUSE_DETECTION_EVAL_TOKEN || ''
  if (!expectedToken) {
    return NextResponse.json(
      { error: 'Abuse-detection evaluation is not configured (ABUSE_DETECTION_EVAL_TOKEN unset).' },
      { status: 503, headers: corsHeaders() }
    )
  }
  const providedToken =
    request.headers.get('authorization')?.replace(/^Bearer\s+/i, '').trim() ||
    request.headers.get('x-abuse-detection-token')?.trim() ||
    ''
  if (!providedToken || providedToken !== expectedToken) {
    return NextResponse.json(
      { error: 'Invalid or missing abuse-detection service token.' },
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
  // Enumerate distinct agent_id from the A12 audit surface (the behavioural
  // baseline source). agent_id is NULL on the user-auth / cookie path (no agent
  // identity) — those rows are excluded (abuse detection is per-agent-identity).
  let agentIds: string[] = []
  if (requestedAgentId) {
    agentIds = [requestedAgentId]
  } else {
    const { data: idRows, error: idErr } = await supabaseAdmin
      .from('substrate_audit_events')
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

  const windowSeconds = ABUSE_DETECTION.REQUEST_VELOCITY_WINDOW_SECONDS
  const periodDate = new Date().toISOString().slice(0, 10) // UTC YYYY-MM-DD
  const evaluated: string[] = []
  const firedSignals: AbuseSignal[] = []
  const skipped: Array<{ agent_id: string; reason: string }> = []
  let persistedCount = 0

  for (const agentId of agentIds) {
    evaluated.push(agentId)

    // Read this identity's event timestamps from the A12 behavioural surface.
    const { data: eventRows, error: evErr } = await supabaseAdmin
      .from('substrate_audit_events')
      .select('occurred_at')
      .eq('agent_id', agentId)
    if (evErr) {
      skipped.push({ agent_id: agentId, reason: evErr.message })
      continue
    }
    if (!eventRows || eventRows.length === 0) {
      skipped.push({ agent_id: agentId, reason: 'no audit events' })
      continue
    }

    // Bucket timestamps into fixed windows; count requests per active window.
    const buckets: Record<number, number> = {}
    for (const row of eventRows as Array<{ occurred_at: string }>) {
      const ms = new Date(row.occurred_at).getTime()
      if (Number.isNaN(ms)) continue
      const bucket = Math.floor(ms / 1000 / windowSeconds)
      buckets[bucket] = (buckets[bucket] || 0) + 1
    }
    const counts = Object.values(buckets)
    if (counts.length === 0) {
      skipped.push({ agent_id: agentId, reason: 'no parseable timestamps' })
      continue
    }
    const windowCount = counts.length
    const totalRequests = counts.reduce((s, c) => s + c, 0)
    const maxWindowRequests = counts.reduce((m, c) => (c > m ? c : m), 0)

    const signal = detectRequestVelocityAnomaly({
      agentId,
      windowCount,
      totalRequests,
      maxWindowRequests,
      multiplier: ABUSE_DETECTION.REQUEST_VELOCITY_MULTIPLIER,
      minPriorWindows: ABUSE_DETECTION.REQUEST_VELOCITY_MIN_PRIOR_WINDOWS,
      absoluteFloorRequests: ABUSE_DETECTION.REQUEST_VELOCITY_ABSOLUTE_FLOOR_REQUESTS,
    })
    if (!signal) continue

    signal.details.window_seconds = windowSeconds
    firedSignals.push(signal)

    // Persist — dedup on (signal_type, scope, period_date). KG1: awaited.
    const res = await persistAbuseSignal(supabaseAdmin, signal, periodDate)
    if (res.error) {
      skipped.push({ agent_id: agentId, reason: `persist failed: ${res.error}` })
      continue
    }
    if (res.persisted) persistedCount += 1
  }

  return NextResponse.json(
    {
      ok: true,
      detectors_run: ['request_velocity_anomaly'],
      window_seconds: windowSeconds,
      period_date: periodDate,
      identities_evaluated: evaluated.length,
      signals_fired: firedSignals.length,
      signals_persisted: persistedCount,
      signals: firedSignals,
      skipped,
    },
    { status: 200, headers: corsHeaders() }
  )
}
