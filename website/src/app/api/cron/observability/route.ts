/**
 * GET /api/cron/observability — A13 automated alert DELIVERY (the deferred half).
 *
 * Runs on a daily Vercel Cron (see website/vercel.json). On each run it calls the
 * two already-Live, already-Verified observability evaluators over HTTP —
 *   /api/billing/cost-alerts/evaluate (A13 cost-health, service token)
 *   /api/abuse/evaluate              (A19 abuse-detection, service token)
 * — collects what fired, and if anything fired (or this is a forced ?test=1, or
 * an evaluator errored) posts a message to the founder's incoming webhook
 * (ALERT_WEBHOOK_URL, Slack/Discord). This is the "telling" half of R5
 * cost-as-health: signals now arrive on their own instead of waiting for a curl.
 *
 * Why a Vercel Cron and not a Cowork scheduled task: the Cowork/bash sandbox has
 * allowlisted network egress that EXCLUDES sagereasoning.com and web_fetch cannot
 * send custom auth headers (A13 production-activation close, 2026-06-06, PR5
 * finding). A server-side Vercel Cron has no such restriction.
 *
 * Auth: Vercel sends `Authorization: Bearer ${CRON_SECRET}` automatically when it
 *   invokes the cron (Vercel docs, "Securing cron jobs"). The route rejects any
 *   caller without the matching secret. The founder can trigger it manually with
 *   the same header for the forced-delivery test.
 * Self-call base URL: ${VERCEL_URL} (the running deployment) so the call stays on
 *   the exact deployment and never depends on the apex→www redirect (cron/self
 *   calls must not rely on redirects). Overridable via CRON_SELF_BASE_URL.
 *
 * NEVER on the /api/reason critical path — pure observability delivery (PR3
 *   trivially met). PR6 NOT engaged: it triggers the two evaluators, which
 *   themselves never touch the R20a classifier, Zone 2/3 logic, or any wrapper.
 *
 * Rules served: R5 (primary — cost-as-health delivery), R0 (operational audit),
 *   PR1 (notify logic proven in lib/cron/observability-notify; both evaluators
 *   already single-endpoint-Verified), PR2 (wired by vercel.json + invoked here),
 *   PR3 (off the hot path). Risk: the cron activation is Critical (deployment
 *   configuration); the route code itself is additive + reversible.
 *
 * @compliance
 * compliance_version: CR-2026-Q2-v5
 * regulatory_references: [CR-005]
 */
import { NextRequest, NextResponse } from 'next/server'
import {
  shouldNotify,
  totalFired,
  formatSweepMessage,
  type EvaluatorOutcome,
} from '@/lib/cron/observability-notify'

// Always run fresh; never cache a cron invocation.
export const dynamic = 'force-dynamic'
export const maxDuration = 60

/** Resolve the base URL for the self-calls to the two evaluators. */
function selfBaseUrl(): string {
  if (process.env.CRON_SELF_BASE_URL) return process.env.CRON_SELF_BASE_URL.replace(/\/+$/, '')
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return 'https://www.sagereasoning.com'
}

/**
 * Call one evaluator and normalise its response. cost-alerts returns
 * { alerts_fired, alerts:[{detector_type,scope,severity,message,multiple}] };
 * abuse returns { signals_fired, signals:[{signal_type,scope,severity,message,multiple}] }.
 * Never throws — a transport/parse failure becomes an `error` outcome so the
 * sweep still reports the other evaluator and surfaces the failure.
 */
async function runEvaluator(
  name: EvaluatorOutcome['name'],
  url: string,
  headerName: string,
  token: string
): Promise<EvaluatorOutcome> {
  if (!token) {
    return { name, ok: false, httpStatus: 0, fired: 0, items: [], error: 'service token not configured' }
  }
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: { [headerName]: token },
      cache: 'no-store',
    })
    let body: unknown = null
    try {
      body = await res.json()
    } catch {
      /* non-JSON body */
    }
    if (!res.ok) {
      const msg =
        (body && typeof body === 'object' && 'error' in body && typeof (body as { error: unknown }).error === 'string'
          ? (body as { error: string }).error
          : `evaluator returned HTTP ${res.status}`)
      return { name, ok: false, httpStatus: res.status, fired: 0, items: [], error: msg }
    }

    const b = (body || {}) as Record<string, unknown>
    if (name === 'cost-alerts') {
      const arr = Array.isArray(b.alerts) ? (b.alerts as Array<Record<string, unknown>>) : []
      return {
        name,
        ok: true,
        httpStatus: res.status,
        fired: typeof b.alerts_fired === 'number' ? (b.alerts_fired as number) : arr.length,
        items: arr.map((a) => ({
          type: String(a.detector_type ?? 'unknown'),
          scope: String(a.scope ?? 'global'),
          severity: a.severity ? String(a.severity) : undefined,
          message: String(a.message ?? ''),
          multiple: typeof a.multiple === 'number' ? (a.multiple as number) : null,
        })),
      }
    }
    // abuse
    const arr = Array.isArray(b.signals) ? (b.signals as Array<Record<string, unknown>>) : []
    return {
      name,
      ok: true,
      httpStatus: res.status,
      fired: typeof b.signals_fired === 'number' ? (b.signals_fired as number) : arr.length,
      items: arr.map((s) => ({
        type: String(s.signal_type ?? 'unknown'),
        scope: String(s.scope ?? 'global'),
        severity: s.severity ? String(s.severity) : undefined,
        message: String(s.message ?? ''),
        multiple: typeof s.multiple === 'number' ? (s.multiple as number) : null,
      })),
    }
  } catch (err) {
    return {
      name,
      ok: false,
      httpStatus: 0,
      fired: 0,
      items: [],
      error: err instanceof Error ? err.message : String(err),
    }
  }
}

/** POST the message to the configured incoming webhook (Slack or Discord). */
async function sendWebhook(text: string): Promise<{ delivered: boolean; reason?: string }> {
  const webhookUrl = process.env.ALERT_WEBHOOK_URL || ''
  if (!webhookUrl) return { delivered: false, reason: 'ALERT_WEBHOOK_URL not configured' }
  // Slack uses { text }; Discord uses { content }. Send both keys — each platform
  // reads the one it understands and ignores the other.
  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ text, content: text }),
      cache: 'no-store',
    })
    if (!res.ok) return { delivered: false, reason: `webhook returned HTTP ${res.status}` }
    return { delivered: true }
  } catch (err) {
    return { delivered: false, reason: err instanceof Error ? err.message : String(err) }
  }
}

export async function GET(request: NextRequest) {
  // ── Cron auth (Vercel sends `Authorization: Bearer ${CRON_SECRET}`) ──────
  const cronSecret = process.env.CRON_SECRET || ''
  if (!cronSecret) {
    return NextResponse.json(
      { error: 'Cron is not configured (CRON_SECRET unset).' },
      { status: 503 }
    )
  }
  const authHeader = request.headers.get('authorization') || ''
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const isTest = request.nextUrl.searchParams.get('test') === '1'
  const base = selfBaseUrl()
  const dateIso = new Date().toISOString().slice(0, 10)

  // ── Run both evaluators (awaited; KG1 — no fire-and-forget) ──────────────
  const [cost, abuse] = await Promise.all([
    runEvaluator(
      'cost-alerts',
      `${base}/api/billing/cost-alerts/evaluate`,
      'x-cost-alerts-token',
      process.env.COST_ALERTS_EVAL_TOKEN || ''
    ),
    runEvaluator(
      'abuse',
      `${base}/api/abuse/evaluate`,
      'x-abuse-detection-token',
      process.env.ABUSE_DETECTION_EVAL_TOKEN || ''
    ),
  ])
  const outcomes = [cost, abuse]

  // ── Notify if anything fired / errored / this is a forced test ───────────
  let notified = false
  let notifyReason: string | undefined
  if (shouldNotify(outcomes, isTest)) {
    const text = formatSweepMessage(outcomes, { isTest, dateIso })
    const res = await sendWebhook(text)
    notified = res.delivered
    notifyReason = res.reason
  }

  return NextResponse.json(
    {
      ok: true,
      ran_at: new Date().toISOString(),
      is_test: isTest,
      fired_total: totalFired(outcomes),
      notified,
      notify_reason: notifyReason,
      outcomes,
    },
    { status: 200 }
  )
}
