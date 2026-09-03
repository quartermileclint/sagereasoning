/**
 * paged-select.test.ts — EXECUTED regression pin for `pagedRows`, the shared
 * keyset-paging helper built 2026-09-03 (C1 of the row-cap sweep remediation).
 *
 * Run: npx tsx src/lib/db/__tests__/paged-select.test.ts
 */

import { pagedRows } from '../paged-select'

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

type Row = Record<string, unknown>

/**
 * A fake client modelling PostgREST's 1,000-row cap (default `maxRows`),
 * applied AFTER the query's own `.order()`/`.limit()`/filters — exactly as
 * real PostgREST truncates regardless of a requested page size.
 */
function makeFakeClient(rows: Row[], opts: { maxRows?: number } = {}) {
  const maxRows = opts.maxRows ?? 1000
  let requestCount = 0

  const client = {
    from(table: string) {
      let eqFilter: [string, unknown] | null = null
      let notNullCol: string | null = null
      let gteFilter: [string, unknown] | null = null
      let gtFilter: [string, unknown] | null = null
      let orderCol: string | null = null
      let limitN: number | null = null

      const builder: any = {
        select() {
          return builder
        },
        eq(col: string, val: unknown) {
          eqFilter = [col, val]
          return builder
        },
        not(col: string, _op: string, _val: unknown) {
          notNullCol = col
          return builder
        },
        gte(col: string, val: unknown) {
          gteFilter = [col, val]
          return builder
        },
        gt(col: string, val: unknown) {
          gtFilter = [col, val]
          return builder
        },
        order(col: string) {
          orderCol = col
          return builder
        },
        limit(n: number) {
          limitN = n
          return builder
        },
        then(resolve: (v: { data: Row[]; error: null }) => void) {
          requestCount++
          let out = rows.filter((r) => r.__table === table)
          if (eqFilter) out = out.filter((r) => r[eqFilter![0]] === eqFilter![1])
          if (notNullCol) out = out.filter((r) => r[notNullCol!] !== null && r[notNullCol!] !== undefined)
          if (gteFilter) out = out.filter((r) => (r[gteFilter![0]] as any) >= (gteFilter![1] as any))
          if (gtFilter) out = out.filter((r) => (r[gtFilter![0]] as any) > (gtFilter![1] as any))
          if (orderCol) out = [...out].sort((a, b) => ((a[orderCol!] as any) < (b[orderCol!] as any) ? -1 : (a[orderCol!] as any) > (b[orderCol!] as any) ? 1 : 0))
          if (limitN !== null) out = out.slice(0, limitN)
          out = out.slice(0, maxRows)
          resolve({ data: out, error: null })
        },
      }
      return builder
    },
  }
  return { client: client as any, requestCount: () => requestCount }
}

function row(table: string, id: number, agentId: string, val: number, createdAt: string): Row {
  return { __table: table, id: `id-${String(id).padStart(6, '0')}`, agent_id: agentId, val, created_at: createdAt }
}

async function main() {
  // ── §1 more rows than one page, well under the server cap ────────────────
  {
    const rows: Row[] = []
    for (let i = 0; i < 1300; i++) rows.push(row('t', i, `agent-${i % 5}`, 10, `2026-09-0${1 + (i % 8)}T00:00:0${i % 10}.000Z`))
    const { client, requestCount } = makeFakeClient(rows, { maxRows: 1000 })
    const { rows: result, error } = await pagedRows<Row>(client, 't', 'id', 'id,agent_id,val,created_at')
    assert(error === null, '§1-1 no error')
    assert(result?.length === 1300, `§1-2 all 1300 rows returned across multiple pages (saw ${result?.length})`)
    assert(requestCount() > 1, `§1-3 more than one page request made (saw ${requestCount()})`)
  }

  // ── §2 negative control — a single unbounded read WOULD truncate ─────────
  {
    const rows: Row[] = []
    for (let i = 0; i < 1300; i++) rows.push(row('t2', i, 'a', 10, '2026-09-01T00:00:00.000Z'))
    const { client } = makeFakeClient(rows, { maxRows: 1000 })

    // Sanity: the fake genuinely caps a bare (non-paged) select at 1000 — the
    // exact OLD pattern every C1 site used before this fix.
    const bareResult: { data: Row[]; error: null } = await client.from('t2').select('id').order('id', { ascending: true })
    assert(bareResult.data.length === 1000, `§2-1 sanity: the fake genuinely caps a bare read at 1000 (saw ${bareResult.data.length})`)

    const { rows: result } = await pagedRows<Row>(client, 't2', 'id', 'id')
    assert(result?.length === 1300, `§2-2 pagedRows returns all 1300 where the bare read would have capped at 1000`)
  }

  // ── §3 eq filter applied correctly across pages ───────────────────────────
  {
    const rows: Row[] = []
    for (let i = 0; i < 1200; i++) rows.push(row('t3', i, i % 3 === 0 ? 'target' : 'other', 5, '2026-09-01T00:00:00.000Z'))
    const { client } = makeFakeClient(rows, { maxRows: 1000 })
    const { rows: result } = await pagedRows<Row>(client, 't3', 'id', 'id,agent_id', { eqColumn: 'agent_id', eqValue: 'target' })
    const expectedCount = Math.ceil(1200 / 3)
    assert(result?.length === expectedCount, `§3-1 eq filter holds across all pages (saw ${result?.length}, expected ${expectedCount})`)
    assert(result!.every((r) => r.agent_id === 'target'), '§3-2 every returned row matches the filter')
  }

  // ── §4 gte time-window filter applied correctly across pages ─────────────
  {
    const rows: Row[] = []
    for (let i = 0; i < 1200; i++) {
      const day = 1 + (i % 10)
      rows.push(row('t4', i, 'a', 5, `2026-09-${String(day).padStart(2, '0')}T00:00:00.000Z`))
    }
    const { client } = makeFakeClient(rows, { maxRows: 1000 })
    const { rows: result } = await pagedRows<Row>(client, 't4', 'id', 'id,created_at', { gteColumn: 'created_at', gteValue: '2026-09-06T00:00:00.000Z' })
    assert(result!.every((r) => (r.created_at as string) >= '2026-09-06T00:00:00.000Z'), '§4-1 every returned row is within the gte window')
    const expected = rows.filter((r) => (r.created_at as string) >= '2026-09-06T00:00:00.000Z').length
    assert(result?.length === expected, `§4-2 gte filter holds across all pages (saw ${result?.length}, expected ${expected})`)
  }

  // ── §5 notNull filter applied correctly across pages ──────────────────────
  {
    const rows: Row[] = []
    for (let i = 0; i < 1200; i++) rows.push(row('t5', i, i % 4 === 0 ? null as any : 'a', 5, '2026-09-01T00:00:00.000Z'))
    const { client } = makeFakeClient(rows, { maxRows: 1000 })
    const { rows: result } = await pagedRows<Row>(client, 't5', 'id', 'id,agent_id', { notNullColumn: 'agent_id' })
    assert(result!.every((r) => r.agent_id !== null), '§5-1 every returned row has non-null agent_id')
    assert(result?.length === 1200 - Math.ceil(1200 / 4), `§5-2 count matches (saw ${result?.length})`)
  }

  // ── §6 empty table → empty array, one request, no infinite loop ──────────
  {
    const { client, requestCount } = makeFakeClient([], { maxRows: 1000 })
    const { rows: result, error } = await pagedRows<Row>(client, 't6', 'id', 'id')
    assert(error === null, '§6-1 no error on empty table')
    assert(result?.length === 0, '§6-2 empty array')
    assert(requestCount() === 1, `§6-3 exactly one request (saw ${requestCount()})`)
  }

  // ── §7 a read error aborts the whole walk, fail-honest ────────────────────
  {
    const failingClient: any = {
      from() {
        return {
          select() {
            return this
          },
          eq() {
            return this
          },
          not() {
            return this
          },
          gte() {
            return this
          },
          gt() {
            return this
          },
          order() {
            return this
          },
          limit() {
            return this
          },
          then(resolve: (v: { data: null; error: { message: string } }) => void) {
            resolve({ data: null, error: { message: 'simulated failure' } })
          },
        }
      },
    }
    const { rows: result, error } = await pagedRows(failingClient, 't7', 'id', 'id')
    assert(result === null, '§7-1 rows is null on error')
    assert(error === 'simulated failure', `§7-2 the error message is surfaced (saw "${error}")`)
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
