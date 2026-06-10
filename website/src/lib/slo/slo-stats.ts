/**
 * Pure SLO-latency statistics for the A14 live tracker (read-only).
 *
 * No I/O — given rows from substrate_audit_events (layer1/2/3_latency_ms +
 * occurred_at) compute per-window p50/p95 of total call latency. Kept pure so
 * the maths is unit-testable without Supabase (PR1). The route wires this to
 * supabaseAdmin and reads only structural latency fields — never any PII (R3/R17).
 *
 * Honest measurability (SLO policy §4): today only /api/reason is instrumented
 * and production traffic is ~nil, so values are sparse/provisional until traffic.
 *
 * Rules served: R5 (operational health), AC2 (the safety-latency budget this
 *   tracker sits alongside), PR1 (pure + proven). PR6 NOT engaged.
 */

export interface LatencyRow {
  layer1_latency_ms: number | null
  layer2_latency_ms: number | null
  layer3_latency_ms: number | null
  occurred_at: string
}

export interface WindowStats {
  count: number
  p50_ms: number | null
  p95_ms: number | null
  max_ms: number | null
}

/** Total latency for one call = sum of the present per-layer latencies. */
export function totalLatencyMs(row: LatencyRow): number | null {
  const parts = [row.layer1_latency_ms, row.layer2_latency_ms, row.layer3_latency_ms].filter(
    (v): v is number => typeof v === 'number' && Number.isFinite(v)
  )
  if (parts.length === 0) return null
  return parts.reduce((s, v) => s + v, 0)
}

/**
 * Nearest-rank percentile over an ascending-sorted array. p in [0,100].
 * Returns null for an empty input. Uses ceil(p/100 * n) rank (1-indexed),
 * clamped to [1, n] — standard nearest-rank, stable for tiny samples.
 */
export function percentile(sortedAsc: number[], p: number): number | null {
  const n = sortedAsc.length
  if (n === 0) return null
  if (p <= 0) return sortedAsc[0]
  if (p >= 100) return sortedAsc[n - 1]
  const rank = Math.ceil((p / 100) * n)
  const idx = Math.min(Math.max(rank, 1), n) - 1
  return sortedAsc[idx]
}

/** Summarise a set of rows into count + p50/p95/max of total latency. */
export function summariseLatency(rows: LatencyRow[]): WindowStats {
  const totals = rows
    .map(totalLatencyMs)
    .filter((v): v is number => v !== null)
    .sort((a, b) => a - b)
  if (totals.length === 0) return { count: 0, p50_ms: null, p95_ms: null, max_ms: null }
  return {
    count: totals.length,
    p50_ms: percentile(totals, 50),
    p95_ms: percentile(totals, 95),
    max_ms: totals[totals.length - 1],
  }
}

export interface SloHealth {
  surface: string
  generated_at: string
  provisional: true
  note: string
  windows: { last_7d: WindowStats; all_time: WindowStats }
  slo_targets: {
    reason_quick_haiku_p95_ms: number
    reason_standard_deep_sonnet_p95_ms: number
    source: string
  }
}

/**
 * Build the read-only health object for one surface. `nowMs` injected for
 * deterministic testing; the route passes Date.now().
 */
export function buildSloHealth(rows: LatencyRow[], nowMs: number, surface = 'api_reason'): SloHealth {
  const sevenDaysAgo = nowMs - 7 * 24 * 60 * 60 * 1000
  const recent = rows.filter((r) => {
    const t = new Date(r.occurred_at).getTime()
    return !Number.isNaN(t) && t >= sevenDaysAgo
  })
  return {
    surface,
    generated_at: new Date(nowMs).toISOString(),
    provisional: true,
    note:
      'Provisional — sparse until real traffic. Latency = sum of layer1+2+3 latency_ms per call; ' +
      'only /api/reason is instrumented today (SLO policy §4). p95 is meaningless on a handful of rows.',
    windows: {
      last_7d: summariseLatency(recent),
      all_time: summariseLatency(rows),
    },
    slo_targets: {
      reason_quick_haiku_p95_ms: 3000,
      reason_standard_deep_sonnet_p95_ms: 8000,
      source: 'SLO policy §1 Tier 1 / manifest AC2',
    },
  }
}
