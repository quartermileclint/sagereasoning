/**
 * Pure helpers for the A13 automated-delivery cron (/api/cron/observability).
 *
 * No I/O — given the two evaluators' outcomes, decide whether to notify and
 * format the human-readable message. Kept pure so the notification logic is
 * unit-testable without network or credentials (PR1 single-path proof; the
 * route wires these to fetch()).
 *
 * Rules served: R5 (operational health delivery — the "telling" half of A13),
 *   PR1 (the notify logic is proven in isolation), PR3 (off the /api/reason hot
 *   path — this is observability). PR6 NOT engaged (no R20a / classifier touch).
 */

/** One evaluator's normalised result for the daily sweep. */
export interface EvaluatorOutcome {
  /** Which evaluator this is. */
  name: 'cost-alerts' | 'abuse'
  /** The endpoint answered 2xx and parsed cleanly. */
  ok: boolean
  /** HTTP status observed from the evaluator (0 if the call threw). */
  httpStatus: number
  /** How many alerts/signals fired this run. */
  fired: number
  /** The fired items, normalised to a common shape for the message. */
  items: Array<{
    type: string
    scope: string
    severity?: string
    message: string
    multiple?: number | null
  }>
  /** Set when the evaluator could not be reached or returned non-2xx. */
  error?: string
}

/**
 * Notify when this is a forced test, OR any evaluator errored, OR anything
 * fired. A clean run with zero fires sends nothing (no daily noise) — the
 * founder asked for problems to arrive on their own, not a daily "all clear".
 */
export function shouldNotify(outcomes: EvaluatorOutcome[], isTest: boolean): boolean {
  if (isTest) return true
  return outcomes.some((o) => !!o.error || o.fired > 0)
}

/** Total fired across all evaluators. */
export function totalFired(outcomes: EvaluatorOutcome[]): number {
  return outcomes.reduce((s, o) => s + (o.fired || 0), 0)
}

/**
 * Build the Slack message text. Slack incoming webhooks accept a JSON body
 * { "text": "..." } — newlines render as line breaks. Discord incoming
 * webhooks accept { "content": "..." } with the same plain text, so the same
 * string works for either channel; the route picks the field name.
 */
export function formatSweepMessage(
  outcomes: EvaluatorOutcome[],
  opts: { isTest: boolean; dateIso: string }
): string {
  const lines: string[] = []
  const fired = totalFired(outcomes)
  const anyError = outcomes.some((o) => !!o.error)

  const header = opts.isTest
    ? `:test_tube: SageReasoning observability — DELIVERY TEST (${opts.dateIso})`
    : anyError
      ? `:rotating_light: SageReasoning observability sweep — ${opts.dateIso}`
      : fired > 0
        ? `:warning: SageReasoning observability sweep — ${fired} signal(s) fired (${opts.dateIso})`
        : `:white_check_mark: SageReasoning observability sweep — all clear (${opts.dateIso})`
  lines.push(header)

  if (opts.isTest) {
    lines.push('If you can read this in Slack, the Vercel Cron → webhook delivery path works.')
  }

  for (const o of outcomes) {
    const label = o.name === 'cost-alerts' ? 'Cost-health' : 'Abuse'
    if (o.error) {
      lines.push(`• ${label}: COULD NOT EVALUATE — ${o.error} (HTTP ${o.httpStatus})`)
      continue
    }
    if (o.fired === 0) {
      lines.push(`• ${label}: clear (0 fired)`)
      continue
    }
    lines.push(`• ${label}: ${o.fired} fired`)
    for (const it of o.items) {
      const mult = typeof it.multiple === 'number' ? ` — ${it.multiple}×` : ''
      const sev = it.severity ? ` [${it.severity}]` : ''
      lines.push(`    – ${it.type}${sev} (${it.scope})${mult}: ${it.message}`)
    }
  }

  if (fired > 0 || anyError) {
    lines.push(
      'Detail: GET /api/billing/cost-alerts/evaluate and /api/abuse/evaluate (service token).'
    )
  }

  return lines.join('\n')
}
