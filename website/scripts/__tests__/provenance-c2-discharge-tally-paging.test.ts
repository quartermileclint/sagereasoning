/**
 * provenance-c2-discharge-tally-paging.test.ts — EXECUTED regression pin for
 * the `pagedLedgerRead` fix to provenance-c2-discharge-tally.ts's whole-table
 * `agent_provenance_ledger` read (row-cap sweep finding H1, the sharpest in
 * the whole sweep: this tally gates the provenance-ledger C2 readiness
 * switch-on, and the ledger was projected to cross the 1,000-row cap around
 * 2026-09-17 — inside the two-week window the tally measures. Fixed
 * 2026-09-03, Part D of the sweep's remediation, founder-elected option (ii):
 * a minimal scoped fix to the script's whole-table reads, keeping the ruled
 * one-time/non-recurring scope this file's header states unchanged).
 *
 * Run: npx tsx scripts/__tests__/provenance-c2-discharge-tally-paging.test.ts
 */

import { pagedLedgerRead, type LedgerRow } from '../provenance-c2-discharge-tally'

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

/**
 * A fake `agent_provenance_ledger` client that MODELS PostgREST's 1,000-row
 * cap (default `maxRows`), applying it per-request exactly as PostgREST does
 * — after the query's own `.order()`/`.limit()`, silently truncating rather
 * than erroring. Ties in `recorded_at` are deliberately constructed so the
 * keyset's `(recorded_at, id)` tie-break is genuinely exercised, not just
 * declared.
 */
function makeFakeLedgerClient(rows: LedgerRow[], opts: { maxRows?: number } = {}) {
  const maxRows = opts.maxRows ?? 1000
  let requestCount = 0

  function run(eqFilters: Array<[string, unknown]>, orFilter: string | null, limitN: number | null) {
    requestCount++
    let out = [...rows]
    for (const [col, val] of eqFilters) out = out.filter((r) => (r as any)[col] === val)
    if (orFilter) {
      // Parse `recorded_at.gt.X,and(recorded_at.eq.X,id.gt.Y)` — the exact
      // shape pagedLedgerRead constructs.
      const m = /^recorded_at\.gt\.([^,]+),and\(recorded_at\.eq\.([^,]+),id\.gt\.([^)]+)\)$/.exec(orFilter)
      if (!m) throw new Error('fake could not parse or-filter: ' + orFilter)
      const [, gtTs, eqTs, gtId] = m
      out = out.filter((r) => r.recorded_at > gtTs || (r.recorded_at === eqTs && r.id > gtId))
    }
    // order by (recorded_at asc, id asc) always, matching the fixed source
    out.sort((a, b) => (a.recorded_at < b.recorded_at ? -1 : a.recorded_at > b.recorded_at ? 1 : a.id < b.id ? -1 : a.id > b.id ? 1 : 0))
    if (limitN !== null) out = out.slice(0, limitN)
    // The PostgREST server-side cap — applied AFTER the query's own limit,
    // exactly as real PostgREST truncates regardless of a requested page size.
    out = out.slice(0, maxRows)
    return out
  }

  const client = {
    from(table: string) {
      if (table !== 'agent_provenance_ledger') throw new Error('unexpected table: ' + table)
      const eqFilters: Array<[string, unknown]> = []
      let orFilter: string | null = null
      const orderCols: string[] = []
      let limitN: number | null = null
      const builder: any = {
        select() {
          return builder
        },
        eq(col: string, val: unknown) {
          eqFilters.push([col, val])
          return builder
        },
        or(expr: string) {
          orFilter = expr
          return builder
        },
        order(col: string) {
          orderCols.push(col)
          return builder
        },
        limit(n: number) {
          limitN = n
          return builder
        },
        then(resolve: (v: { data: LedgerRow[]; error: null }) => void) {
          resolve({ data: run(eqFilters, orFilter, limitN), error: null })
        },
      }
      return builder
    },
  }
  return { client, requestCount: () => requestCount }
}

function row(i: number, recordedAt: string): LedgerRow {
  return {
    id: `id-${String(i).padStart(6, '0')}`,
    identity_kind: 'owner_agent_pair',
    layer1_source: 'server',
    credential_ref: 'cred-1',
    agent_id: 'agent-1',
    owner_user_id: 'owner-1',
    recorded_at: recordedAt,
  }
}

async function main() {
  // ── §1 more rows than one page, well under the server cap ────────────────
  {
    const rows: LedgerRow[] = []
    for (let i = 0; i < 1300; i++) {
      rows.push(row(i, new Date(Date.UTC(2026, 7, 1) + i * 1000).toISOString()))
    }
    const { client, requestCount } = makeFakeLedgerClient(rows, { maxRows: 1000 })
    const result = await pagedLedgerRead(client as any)
    assert(result.length === 1300, `§1-1 all 1300 rows returned across multiple pages (saw ${result.length})`)
    assert(requestCount() > 1, `§1-2 more than one page request was made (saw ${requestCount()})`)
    const ids = new Set(result.map((r) => r.id))
    assert(ids.size === 1300, '§1-3 no duplicate rows across page boundaries')
  }

  // ── §2 negative control — the OLD unbounded single read WOULD have lost
  //      the newest 300 rows to the server cap; prove the fix does not ──────
  {
    const rows: LedgerRow[] = []
    for (let i = 0; i < 1300; i++) {
      rows.push(row(i, new Date(Date.UTC(2026, 7, 1) + i * 1000).toISOString()))
    }
    const { client } = makeFakeLedgerClient(rows, { maxRows: 1000 })
    const result = await pagedLedgerRead(client as any)
    const newestExpected = row(1299, new Date(Date.UTC(2026, 7, 1) + 1299 * 1000).toISOString())
    assert(
      result.some((r) => r.id === newestExpected.id),
      '§2-1 the newest row (which a single unbounded 1,000-cap read would have dropped) is present'
    )
  }

  // ── §3 a page boundary lands mid-tie: no row skipped, none duplicated ────
  {
    const tiedTs = new Date(Date.UTC(2026, 7, 1)).toISOString()
    const rows: LedgerRow[] = []
    // 500 distinct-timestamp rows, then 40 rows all sharing ONE timestamp
    // straddling where a 500-row page would land, then 500 more distinct.
    for (let i = 0; i < 500; i++) rows.push(row(i, new Date(Date.UTC(2026, 6, 1) + i * 1000).toISOString()))
    for (let i = 500; i < 540; i++) rows.push(row(i, tiedTs))
    for (let i = 540; i < 1040; i++) rows.push(row(i, new Date(Date.UTC(2026, 8, 1) + i * 1000).toISOString()))
    const { client } = makeFakeLedgerClient(rows, { maxRows: 1000 })
    const result = await pagedLedgerRead(client as any)
    assert(result.length === 1040, `§3-1 all rows survive a tie straddling a page boundary (saw ${result.length}, expected 1040)`)
    const tiedIds = new Set(result.filter((r) => r.recorded_at === tiedTs).map((r) => r.id))
    assert(tiedIds.size === 40, `§3-2 all 40 tied rows present exactly once (saw ${tiedIds.size})`)
  }

  // ── §4 empty table → empty array, one request, no infinite loop ──────────
  {
    const { client, requestCount } = makeFakeLedgerClient([], { maxRows: 1000 })
    const result = await pagedLedgerRead(client as any)
    assert(result.length === 0, '§4-1 an empty ledger returns an empty array')
    assert(requestCount() === 1, `§4-2 exactly one request is made against an empty table (saw ${requestCount()})`)
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
