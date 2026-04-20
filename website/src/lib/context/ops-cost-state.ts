/**
 * ops-cost-state.ts — Channel 1 loader for the Sage-Ops chat persona.
 *
 * Reads the most recent row of `cost_health_snapshots` via the service-role
 * Supabase client, pulls the last-30-days classifier aggregate via the
 * existing `getClassifierCostSummary` helper, evaluates four cost thresholds
 * (revenue-to-cost ratio, $100/mo Ops cap, single-endpoint concentration,
 * runway) and returns both a structured block and a ready-to-inject
 * `formatted_context` string.
 *
 * Read-only. Does not import from sage-mentor/. Does not write. Graceful
 * degradation with a self-disclosing stub when the Supabase read path
 * fails — silent fallback is worse than a transparent message.
 *
 * Concentration and runway
 *   These two thresholds return `status: 'unknown'` with explicit notes.
 *   Concentration (Choice 2A / D-Ops-2): we do not have per-endpoint cost
 *   telemetry yet; the handoff defers this pending an instrumentation
 *   decision.
 *   Runway (D-Ops-6): `cost_health_snapshots` does not hold `cash_balance`
 *   or `monthly_burn` columns. Reporting 'unknown' preserves honesty
 *   until a schema decision is made.
 *
 * Stale-snapshot guard (Choice 4A)
 *   When the latest snapshot is older than 7 days the formatted block adds
 *   a "snapshot is N days old" warning so Ops names the staleness rather
 *   than presenting the figure as live.
 *
 * Injection point: website/src/app/api/founder/hub/route.ts `case 'ops'`.
 *
 * Risk classification: Elevated (0d-ii). New Supabase read path on a
 * non-safety-critical surface, with graceful-degradation fallback.
 *
 * Rules served: R5 (cost as health metric), R15 (Sage Ops stack), R16
 *   (intelligence pipeline data governance).
 */

import { supabaseAdmin } from '@/lib/supabase-server'
import { getClassifierCostSummary } from '@/lib/r20a-cost-tracker'

// =============================================================================
// Types
// =============================================================================

export type ThresholdStatus = 'green' | 'amber' | 'red' | 'unknown'

export interface RatioReading {
  value: number | null
  status: ThresholdStatus
  note?: string
}

export interface OpsCapReading {
  monthly_usd: number | null
  cap_usd: number
  status: ThresholdStatus
  note?: string
}

export interface ConcentrationReading {
  worst_endpoint: string | null
  worst_share_pct: number | null
  status: ThresholdStatus
  note: string
}

export interface RunwayReading {
  months: number | null
  status: ThresholdStatus
  note: string
}

export interface Classifier30dReading {
  total_cost_cents: number
  invocations: number
  llm_invocations: number
  llm_stage_rate: number | null
  severity_3_count: number
  flags_written: number
}

export interface OpsCostBlock {
  as_of: string
  snapshot_age_days: number | null
  snapshot_is_stale: boolean
  period_start: string | null
  period_end: string | null
  revenue_to_cost_ratio: RatioReading
  ops_pipeline_cap: OpsCapReading
  single_endpoint_concentration: ConcentrationReading
  runway: RunwayReading
  classifier_30d: Classifier30dReading
  formatted_context: string
  source: 'supabase' | 'stub'
}

// =============================================================================
// Constants
// =============================================================================

// R5 thresholds
const REVENUE_RATIO_TARGET = 2.0      // green >= 2.0
const REVENUE_RATIO_AMBER_FLOOR = 1.0  // amber 1.0–2.0; red < 1.0

const OPS_MONTHLY_CAP_USD = 100        // R5 hard cap for the Ops pipeline
const OPS_AMBER_FLOOR_USD = 80         // amber 80–100; red > 100

// Stale-snapshot guard (Choice 4A)
const SNAPSHOT_STALE_AFTER_DAYS = 7

// Concentration placeholder (Choice 2A — D-Ops-2)
const CONCENTRATION_NOTE =
  'Per-endpoint cost telemetry not yet instrumented. Cannot compute share. ' +
  'Tracked under D-Ops-2 (deferred pending instrumentation decision).'

// Runway placeholder (D-Ops-6 — schema gap)
const RUNWAY_NOTE =
  'Runway cannot be computed. cost_health_snapshots does not yet hold ' +
  'cash_balance or monthly_burn columns. Tracked under D-Ops-6 (deferred ' +
  'pending schema decision). Do not estimate runway from other data.'

const STUB_MESSAGE =
  'Cost-health signal unavailable. Ops is answering without live cost ' +
  'context. This usually means the Supabase read path failed or no ' +
  'cost_health_snapshots row exists yet. Do not fabricate figures.'

// =============================================================================
// Snapshot type (shape returned from cost_health_snapshots)
// =============================================================================

interface CostHealthSnapshotRow {
  id: string
  period_start: string
  period_end: string
  total_revenue_cents: number | null
  total_llm_cost_cents: number | null
  total_api_calls: number | null
  revenue_to_cost_ratio: number | null
  sage_ops_cost_cents: number | null
  alert_triggered: boolean | null
  alert_reason: string | null
  created_at: string
  classifier_cost_cents?: number | null
  classifier_to_mentor_ratio?: number | null
}

// =============================================================================
// Helpers
// =============================================================================

function daysSince(iso: string | null): number | null {
  if (!iso) return null
  const t = Date.parse(iso)
  if (Number.isNaN(t)) return null
  return Math.max(0, Math.floor((Date.now() - t) / 86_400_000))
}

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function last30DayWindow(): { start: string; end: string } {
  const end = new Date()
  const start = new Date(end.getTime() - 30 * 86_400_000)
  return { start: isoDate(start), end: isoDate(end) }
}

/**
 * Revenue-to-cost ratio thresholds (R5):
 *   green  >= 2.0
 *   amber  1.0 – 2.0
 *   red    < 1.0
 * Returns 'unknown' if the snapshot is missing the value or if cost is zero
 * (ratio undefined during pre-revenue phase).
 */
function assessRatio(row: CostHealthSnapshotRow): RatioReading {
  const raw = row.revenue_to_cost_ratio
  if (raw === null || raw === undefined) {
    return {
      value: null,
      status: 'unknown',
      note: 'No ratio recorded on the latest snapshot.',
    }
  }
  const value = Number(raw)
  if (!Number.isFinite(value)) {
    return {
      value: null,
      status: 'unknown',
      note: 'Ratio on snapshot is non-numeric.',
    }
  }

  // Pre-revenue edge case: revenue is zero and cost is zero → ratio is 0 but
  // not meaningful. Name it rather than scoring 'red'.
  const revenueCents = Number(row.total_revenue_cents ?? 0)
  const costCents = Number(row.total_llm_cost_cents ?? 0)
  if (revenueCents === 0 && costCents === 0) {
    return {
      value: 0,
      status: 'unknown',
      note: 'Pre-revenue, pre-cost snapshot. Ratio not meaningful.',
    }
  }

  let status: ThresholdStatus = 'red'
  if (value >= REVENUE_RATIO_TARGET) status = 'green'
  else if (value >= REVENUE_RATIO_AMBER_FLOOR) status = 'amber'

  return { value: Math.round(value * 100) / 100, status }
}

/**
 * Ops pipeline $100/month cap (R5):
 *   green  < $80
 *   amber  $80 – $100
 *   red    > $100
 */
function assessOpsCap(row: CostHealthSnapshotRow): OpsCapReading {
  const cents = row.sage_ops_cost_cents
  if (cents === null || cents === undefined) {
    return {
      monthly_usd: null,
      cap_usd: OPS_MONTHLY_CAP_USD,
      status: 'unknown',
      note: 'No sage_ops_cost_cents recorded on the latest snapshot.',
    }
  }
  const usd = Math.round(Number(cents)) / 100
  let status: ThresholdStatus = 'green'
  if (usd > OPS_MONTHLY_CAP_USD) status = 'red'
  else if (usd >= OPS_AMBER_FLOOR_USD) status = 'amber'

  return {
    monthly_usd: Math.round(usd * 100) / 100,
    cap_usd: OPS_MONTHLY_CAP_USD,
    status,
  }
}

// =============================================================================
// Formatter
// =============================================================================

function fmtUsd(usd: number | null): string {
  if (usd === null) return 'unknown'
  return `$${usd.toFixed(2)}`
}

function fmtRatio(r: number | null): string {
  if (r === null) return 'unknown'
  return `${r.toFixed(2)}x`
}

function renderReading(label: string, status: ThresholdStatus, body: string, note?: string): string {
  const tag = `[${status.toUpperCase()}]`
  const noteLine = note ? `\n    note: ${note}` : ''
  return `- ${label} ${tag}\n    ${body}${noteLine}`
}

function formatBlock(block: Omit<OpsCostBlock, 'formatted_context' | 'source'>): string {
  const header = [
    'LIVE COST-HEALTH STATE — OPS CHANNEL 1',
    'Source: cost_health_snapshots (latest row) + classifier_cost_log (last 30 days)',
    `As of: ${block.as_of}`,
    block.period_start && block.period_end
      ? `Snapshot period: ${block.period_start} → ${block.period_end}`
      : 'Snapshot period: unavailable',
    block.snapshot_age_days !== null
      ? `Snapshot age: ${block.snapshot_age_days} day(s)${
          block.snapshot_is_stale
            ? ` — STALE (> ${SNAPSHOT_STALE_AFTER_DAYS} days). Name the staleness when citing these figures; do not present them as real-time.`
            : ''
        }`
      : 'Snapshot age: unknown',
    '',
    'Treat this block as the only authoritative cost-health signal for Ops.',
    'Ground R5 answers in these thresholds. If a reading is marked UNKNOWN,',
    'say so plainly — do not estimate, do not invent figures, and do not',
    'imply live access to Vercel, Anthropic, or Supabase consoles.',
  ].join('\n')

  const ratio = block.revenue_to_cost_ratio
  const cap = block.ops_pipeline_cap
  const conc = block.single_endpoint_concentration
  const run = block.runway
  const c30 = block.classifier_30d

  const lines = [
    renderReading(
      'Revenue-to-cost ratio (R5, target >= 2.0x)',
      ratio.status,
      `value: ${fmtRatio(ratio.value)}  target: ${REVENUE_RATIO_TARGET.toFixed(1)}x  ` +
        `amber band: ${REVENUE_RATIO_AMBER_FLOOR.toFixed(1)}–${REVENUE_RATIO_TARGET.toFixed(1)}x  red: < ${REVENUE_RATIO_AMBER_FLOOR.toFixed(1)}x`,
      ratio.note,
    ),
    renderReading(
      'Ops pipeline monthly spend (R5, cap $100/mo)',
      cap.status,
      `this month: ${fmtUsd(cap.monthly_usd)}  cap: ${fmtUsd(cap.cap_usd)}  amber floor: ${fmtUsd(OPS_AMBER_FLOOR_USD)}`,
      cap.note,
    ),
    renderReading(
      'Single-endpoint concentration (R5)',
      conc.status,
      `worst endpoint: ${conc.worst_endpoint ?? 'unknown'}  share: ${
        conc.worst_share_pct === null ? 'unknown' : `${conc.worst_share_pct.toFixed(1)}%`
      }`,
      conc.note,
    ),
    renderReading(
      'Runway (R5)',
      run.status,
      `months remaining: ${run.months === null ? 'unknown' : run.months.toFixed(1)}`,
      run.note,
    ),
  ].join('\n')

  const c30Line = [
    'R20a classifier (last 30 days):',
    `    invocations: ${c30.invocations}  ` +
      `llm-stage invocations: ${c30.llm_invocations}  ` +
      `llm-stage rate: ${c30.llm_stage_rate === null ? 'unknown' : `${(c30.llm_stage_rate * 100).toFixed(1)}%`}`,
    `    total cost: ${fmtUsd(Math.round(c30.total_cost_cents) / 100)}  ` +
      `flags written: ${c30.flags_written}  severity-3: ${c30.severity_3_count}`,
  ].join('\n')

  return `${header}\n\nThresholds:\n${lines}\n\n${c30Line}`
}

function formatStubBlock(reason: string): string {
  return [
    'LIVE COST-HEALTH STATE — OPS CHANNEL 1',
    'Source: cost_health_snapshots + classifier_cost_log',
    'As of: unavailable',
    '',
    STUB_MESSAGE,
    '',
    `Reason: ${reason}`,
  ].join('\n')
}

// =============================================================================
// Public API
// =============================================================================

/**
 * Loads the latest cost-health snapshot + the rolling 30-day classifier
 * aggregate and returns a structured `OpsCostBlock` with an injection-ready
 * `formatted_context`. Never throws — failures fall back to a
 * self-disclosing stub.
 */
export async function getOpsCostState(): Promise<OpsCostBlock> {
  const nowIso = new Date().toISOString()

  // --- Snapshot ----------------------------------------------------------
  let snapshot: CostHealthSnapshotRow | null = null
  let snapshotError: string | null = null
  try {
    const { data, error } = await supabaseAdmin
      .from('cost_health_snapshots')
      .select('*')
      .order('period_end', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) {
      snapshotError = error.message || 'unknown Supabase error'
    } else if (data) {
      snapshot = data as CostHealthSnapshotRow
    } else {
      snapshotError = 'no cost_health_snapshots rows found'
    }
  } catch (e) {
    snapshotError =
      e instanceof Error ? `Supabase read threw: ${e.message}` : 'Supabase read threw an unknown error'
  }

  // --- Classifier 30-day aggregate (independent; failure returns zeros) --
  const window = last30DayWindow()
  let classifierSummary = {
    total_invocations: 0,
    rule_only_count: 0,
    llm_invocations: 0,
    total_cost_cents: 0,
    avg_cost_per_run: 0,
    flags_written: 0,
    severity_3_count: 0,
  }
  try {
    classifierSummary = await getClassifierCostSummary(window.start, window.end)
  } catch {
    // Swallowed — getClassifierCostSummary already returns zeros on error,
    // but this try/catch covers any unexpected throw.
  }

  const classifier30d: Classifier30dReading = {
    total_cost_cents: classifierSummary.total_cost_cents,
    invocations: classifierSummary.total_invocations,
    llm_invocations: classifierSummary.llm_invocations,
    llm_stage_rate:
      classifierSummary.total_invocations > 0
        ? classifierSummary.llm_invocations / classifierSummary.total_invocations
        : null,
    severity_3_count: classifierSummary.severity_3_count,
    flags_written: classifierSummary.flags_written,
  }

  // --- Snapshot missing → stub -------------------------------------------
  if (!snapshot) {
    const stub: OpsCostBlock = {
      as_of: nowIso,
      snapshot_age_days: null,
      snapshot_is_stale: false,
      period_start: null,
      period_end: null,
      revenue_to_cost_ratio: { value: null, status: 'unknown' },
      ops_pipeline_cap: {
        monthly_usd: null,
        cap_usd: OPS_MONTHLY_CAP_USD,
        status: 'unknown',
      },
      single_endpoint_concentration: {
        worst_endpoint: null,
        worst_share_pct: null,
        status: 'unknown',
        note: CONCENTRATION_NOTE,
      },
      runway: { months: null, status: 'unknown', note: RUNWAY_NOTE },
      classifier_30d: classifier30d,
      formatted_context: formatStubBlock(snapshotError ?? 'unknown'),
      source: 'stub',
    }
    return stub
  }

  // --- Assess thresholds --------------------------------------------------
  const ratio = assessRatio(snapshot)
  const cap = assessOpsCap(snapshot)

  // Snapshot age — use period_end, which represents the last day the
  // snapshot covers. created_at can lag; period_end is the truer measure
  // of freshness for threshold reporting.
  const ageDays = daysSince(snapshot.period_end)
  const isStale = ageDays !== null && ageDays > SNAPSHOT_STALE_AFTER_DAYS

  const block: Omit<OpsCostBlock, 'formatted_context' | 'source'> = {
    as_of: nowIso,
    snapshot_age_days: ageDays,
    snapshot_is_stale: isStale,
    period_start: snapshot.period_start,
    period_end: snapshot.period_end,
    revenue_to_cost_ratio: ratio,
    ops_pipeline_cap: cap,
    single_endpoint_concentration: {
      worst_endpoint: null,
      worst_share_pct: null,
      status: 'unknown',
      note: CONCENTRATION_NOTE,
    },
    runway: { months: null, status: 'unknown', note: RUNWAY_NOTE },
    classifier_30d: classifier30d,
  }

  return {
    ...block,
    formatted_context: formatBlock(block),
    source: 'supabase',
  }
}
