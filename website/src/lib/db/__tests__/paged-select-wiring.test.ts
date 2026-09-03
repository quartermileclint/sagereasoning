/**
 * paged-select-wiring.test.ts — EXECUTED source-pin regression for every C1
 * call site of `pagedRows` (row-cap sweep remediation, 2026-09-03). The
 * helper's own pagination correctness is proven by `paged-select.test.ts`
 * (16 assertions, mutation-verified); this file proves each SITE calls it
 * with the right table, cursor column, and filters — the class of mistake
 * most likely once a correct helper exists (a copy-paste error, a wrong
 * table name, a dropped filter).
 *
 * Run: npx tsx src/lib/db/__tests__/paged-select-wiring.test.ts
 */

import * as fs from 'fs'
import * as path from 'path'

let passed = 0
let failed = 0
const failures: string[] = []

function assert(condition: boolean, label: string): void {
  if (condition) {
    passed++
  } else {
    failed++
    failures.push(label)
    console.error('FAIL: ' + label)
  }
}

const root = path.resolve(__dirname, '../../../..')

function readSrc(relPath: string): string {
  return fs.readFileSync(path.join(root, relPath), 'utf-8')
}

async function main() {
  // ── H2/H3/H4 — cost-alerts/evaluate/route.ts ──────────────────────────────
  {
    const src = readSrc('src/app/api/billing/cost-alerts/evaluate/route.ts')
    assert(/import \{ pagedRows \} from '@\/lib\/db\/paged-select'/.test(src), 'cost-alerts imports pagedRows')
    assert(!/\.from\('loop_billing_events'\)\s*\n?\s*\.select\('agent_id'\)/.test(src), 'H3: the old unbounded agent_id enumeration is gone')
    assert(/pagedRows<\{ agent_id: string \| null \}>\(\s*\n?\s*supabaseAdmin,\s*\n?\s*'loop_billing_events',\s*\n?\s*'id',/.test(src), 'H3: identity enumeration is now pagedRows on loop_billing_events, cursor id')
    assert(/notNullColumn: 'agent_id'/.test(src), 'H3: the not-null agent_id filter is preserved')
    assert(/pagedRows<\{ anthropic_cost_cents: number \| null \}>\(\s*\n?\s*supabaseAdmin,\s*\n?\s*'loop_billing_events',\s*\n?\s*'id',\s*\n?\s*'id,anthropic_cost_cents',\s*\n?\s*\{ eqColumn: 'agent_id', eqValue: agentId \}/.test(src), 'H4: per-agent cost read is now pagedRows, eq-filtered on agentId')
    assert(/pagedRows<\{ anthropic_cost_cents: number \| null \}>\(\s*\n?\s*supabaseAdmin,\s*\n?\s*'loop_billing_events',\s*\n?\s*'id',\s*\n?\s*'id,anthropic_cost_cents'\s*\n?\s*\)/.test(src), 'H2: the global D4 per-call-spike read is now pagedRows, no filter')
    assert(!/\.from\('loop_billing_events'\)\s*\n?\s*\.select\('anthropic_cost_cents'\)\s*\n?\s*$/m.test(src), 'H2: no bare unbounded loop_billing_events select remains at end-of-line')
  }

  // ── H4 (2nd site) — substrate-identity-baseline.ts ────────────────────────
  {
    const src = readSrc('src/lib/substrate/substrate-identity-baseline.ts')
    assert(/import \{ pagedRows \} from '@\/lib\/db\/paged-select'/.test(src), 'substrate-identity-baseline imports pagedRows')
    assert(/pagedRows<\{ id: string; total_cents: number \| null; anthropic_cost_cents: number \| null \}>\(\s*\n?\s*admin,\s*\n?\s*'loop_billing_events',\s*\n?\s*'id',/.test(src), 'H4b: getIdentityCostBaseline reads via pagedRows on loop_billing_events, cursor id')
    assert(/eqColumn: 'agent_id', eqValue: agentId/.test(src), 'H4b: the per-agent eq filter is preserved')
  }

  // ── H5/H6 — abuse/evaluate/route.ts ───────────────────────────────────────
  {
    const src = readSrc('src/app/api/abuse/evaluate/route.ts')
    assert(/import \{ pagedRows \} from '@\/lib\/db\/paged-select'/.test(src), 'abuse/evaluate imports pagedRows')
    assert(!/\.from\('substrate_audit_events'\)\s*\n?\s*\.select\('agent_id'\)/.test(src), 'H5: the old unbounded agent_id enumeration is gone')
    assert(/pagedRows<\{ agent_id: string \| null \}>\(\s*\n?\s*supabaseAdmin,\s*\n?\s*'substrate_audit_events',\s*\n?\s*'event_id',/.test(src), 'H5: identity enumeration is now pagedRows on substrate_audit_events, cursor event_id')
    assert(/pagedRows<\{ event_id: string; occurred_at: string; masked_context/.test(src), 'H6: the per-agent event read is now pagedRows')
    assert(/gteColumn: 'occurred_at', gteValue: lookbackCutoff/.test(src), 'H6: the per-agent read is bounded by the lookback cutoff')
    assert(/REQUEST_VELOCITY_LOOKBACK_HOURS/.test(src), 'H6: the lookback constant is referenced, not a magic number')
  }

  // ── The lookback constant itself — abuse-thresholds.ts ────────────────────
  {
    const src = readSrc('src/lib/abuse-detection/abuse-thresholds.ts')
    assert(/REQUEST_VELOCITY_LOOKBACK_HOURS:\s*24/.test(src), 'the lookback constant is defined at 24 hours')
  }

  // ── H7 — admin/slo-health/route.ts ────────────────────────────────────────
  {
    const src = readSrc('src/app/api/admin/slo-health/route.ts')
    assert(/import \{ pagedRows \} from '@\/lib\/db\/paged-select'/.test(src), 'slo-health imports pagedRows')
    assert(/pagedRows<LatencyRow & \{ event_id: string \}>\(\s*\n?\s*supabaseAdmin,\s*\n?\s*'substrate_audit_events',\s*\n?\s*'event_id',/.test(src), 'H7: the latency read is now pagedRows on substrate_audit_events, cursor event_id')
    assert(/eqColumn: 'surface', eqValue: surface/.test(src), 'H7: the surface filter is preserved')
    assert(!/\.from\('substrate_audit_events'\)\s*\n?\s*\.select\('layer1_latency_ms/.test(src), 'H7: the old unbounded latency select is gone')
  }

  // ── H10/H11 — admin/metrics/route.ts ──────────────────────────────────────
  {
    const src = readSrc('src/app/api/admin/metrics/route.ts')
    assert(/import \{ pagedRows \} from '@\/lib\/db\/paged-select'/.test(src), 'admin/metrics imports pagedRows')
    const pagedRowsCalls = (src.match(/pagedRows</g) || []).length
    assert(pagedRowsCalls === 3, `H10/H11: exactly 3 pagedRows calls (week, today, all-time fallback) — saw ${pagedRowsCalls}`)
    assert(/'analytics_events', 'created_at', 'event_type,created_at', \{\s*\n?\s*gteColumn: 'created_at',\s*\n?\s*gteValue: weekAgo,/.test(src), "H11: the week window is paged on created_at, gte weekAgo")
    assert(/'analytics_events', 'created_at', 'event_type,created_at', \{\s*\n?\s*gteColumn: 'created_at',\s*\n?\s*gteValue: today,/.test(src), "H11: the today window is paged on created_at, gte today")
    assert(/pagedRows<\{ event_type: string \}>\(\s*\n?\s*supabaseAdmin,\s*\n?\s*'analytics_events',\s*\n?\s*'created_at',\s*\n?\s*'event_type,created_at'\s*\n?\s*\)/.test(src), 'H10: the all-time fallback (inside the totalEvents.error branch) is paged, no filter')
    assert(!/const allEvents = await supabaseAdmin\.from\('analytics_events'\)\s*\n?\s*\.select\('event_type'\)\s*\n?\s*$/m.test(src), 'H10: the old unbounded all-time fallback select is gone')
    assert(/if \(weekEventsResult\.error\)/.test(src), 'H11: a paged-read error on the week window is surfaced, not silently swallowed')
    assert(/if \(todayEventsResult\.error\)/.test(src), 'H11: a paged-read error on the today window is surfaced, not silently swallowed')
  }

  console.log(`\n${passed} passed, ${failed} failed`)
  if (failed > 0) {
    console.log('Failures:')
    for (const f of failures) console.log('  - ' + f)
    process.exit(1)
  }
}

main().catch((err) => {
  console.error('harness error:', err)
  process.exit(1)
})
