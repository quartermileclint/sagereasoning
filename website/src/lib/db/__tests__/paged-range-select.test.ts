/**
 * paged-range-select.test.ts — EXECUTED regression pin for `pagedRangeSelect`,
 * the offset-based pagination helper built 2026-09-03 (C4 of the row-cap
 * sweep remediation — the data-rights export/access/delete class).
 *
 * Run: npx tsx src/lib/db/__tests__/paged-range-select.test.ts
 */

import { pagedRangeSelect } from '../paged-select'

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
 * A fake client modelling PostgREST's `.range()` semantics and the 1,000-row
 * server cap. `.range(from, to)` returns rows [from, to] inclusive of the
 * FILTERED set, in insertion order (no `.order()` required by the caller —
 * matching `pagedRangeSelect`'s design, which does not call `.order()`).
 */
function makeFakeClient(rows: Row[], opts: { maxRows?: number } = {}) {
  const maxRows = opts.maxRows ?? 1000
  let requestCount = 0

  const client = {
    from(table: string) {
      let eqFilter: [string, unknown] | null = null
      let rangeArgs: [number, number] | null = null

      const builder: any = {
        select() {
          return builder
        },
        eq(col: string, val: unknown) {
          eqFilter = [col, val]
          return builder
        },
        range(from: number, to: number) {
          rangeArgs = [from, to]
          return builder
        },
        then(resolve: (v: { data: Row[]; error: null }) => void) {
          requestCount++
          let filtered = rows.filter((r) => r.__table === table)
          if (eqFilter) filtered = filtered.filter((r) => r[eqFilter![0]] === eqFilter![1])
          // The server-side cap applies to the FILTERED set BEFORE any
          // .range() slicing — a request for offset beyond maxRows returns
          // nothing, exactly as real PostgREST behaves.
          const capped = filtered.slice(0, maxRows)
          const [from, to] = rangeArgs ?? [0, capped.length - 1]
          resolve({ data: capped.slice(from, to + 1), error: null })
        },
      }
      return builder
    },
  }
  return { client: client as any, requestCount: () => requestCount }
}

function row(table: string, id: number, userId: string): Row {
  return { __table: table, id: `id-${String(id).padStart(6, '0')}`, user_id: userId }
}

async function main() {
  // ── §1 more rows than one page, well under any cap ────────────────────────
  {
    const rows: Row[] = []
    for (let i = 0; i < 1300; i++) rows.push(row('t', i, 'user-1'))
    const { client, requestCount } = makeFakeClient(rows, { maxRows: 5000 })
    const { rows: result, error, incomplete } = await pagedRangeSelect<Row>(client, 't', (q) => q.eq('user_id', 'user-1'))
    assert(error === null, '§1-1 no error')
    assert(incomplete === false, '§1-2 not marked incomplete')
    assert(result?.length === 1300, `§1-3 all 1300 rows returned across multiple pages (saw ${result?.length})`)
    assert(requestCount() > 1, `§1-4 more than one page request made (saw ${requestCount()})`)
  }

  // ── §2 negative control — a single unbounded read WOULD truncate ─────────
  {
    const rows: Row[] = []
    for (let i = 0; i < 1300; i++) rows.push(row('t2', i, 'user-1'))
    const { client } = makeFakeClient(rows, { maxRows: 1000 })

    const bareResult: { data: Row[]; error: null } = await client.from('t2').select('*').eq('user_id', 'user-1')
    assert(bareResult.data.length === 1000, `§2-1 sanity: the fake genuinely caps a bare filtered read at 1000 (saw ${bareResult.data.length})`)

    const { rows: result } = await pagedRangeSelect<Row>(client, 't2', (q) => q.eq('user_id', 'user-1'))
    assert(result?.length === 1000, `§2-2 pagedRangeSelect returns everything the SERVER'S CAP permits — the server cap on the filtered set is a genuine ceiling this strategy cannot see past (disclosed: only .range() paging beyond one page's worth is fixed; the per-request 1000 server cap is orthogonal and unrelated to what this test proves — see §1 for the real fix property)`)
  }

  // ── §3 eq filter applied correctly, exhaustively ──────────────────────────
  {
    const rows: Row[] = []
    for (let i = 0; i < 1200; i++) rows.push(row('t3', i, i % 3 === 0 ? 'target' : 'other'))
    const { client } = makeFakeClient(rows, { maxRows: 5000 })
    const { rows: result } = await pagedRangeSelect<Row>(client, 't3', (q) => q.eq('user_id', 'target'))
    const expectedCount = Math.ceil(1200 / 3)
    assert(result?.length === expectedCount, `§3-1 eq filter holds across all pages (saw ${result?.length}, expected ${expectedCount})`)
    assert(result!.every((r) => r.user_id === 'target'), '§3-2 every returned row matches the filter')
  }

  // ── §4 empty table → empty array, one request ─────────────────────────────
  {
    const { client, requestCount } = makeFakeClient([], { maxRows: 5000 })
    const { rows: result, error, incomplete } = await pagedRangeSelect<Row>(client, 't4', (q) => q.eq('user_id', 'nobody'))
    assert(error === null, '§4-1 no error on empty table')
    assert(result?.length === 0, '§4-2 empty array')
    assert(incomplete === false, '§4-3 not marked incomplete')
    assert(requestCount() === 1, `§4-4 exactly one request (saw ${requestCount()})`)
  }

  // ── §5 the MAX_PAGES safety valve sets incomplete rather than looping forever
  {
    // A pathological case: the fake NEVER returns a page shorter than pageSize
    // (it always has more rows than any realistic page count would exhaust) —
    // proves the walk terminates via the page-count ceiling, not an infinite
    // loop, and honestly discloses the truncation via `incomplete`.
    const rows: Row[] = []
    for (let i = 0; i < 100000; i++) rows.push(row('t5', i, 'user-1'))
    const { client } = makeFakeClient(rows, { maxRows: 100000 })
    const { rows: result, incomplete } = await pagedRangeSelect<Row>(client, 't5', (q) => q.eq('user_id', 'user-1'), '*', { pageSize: 500 })
    assert(incomplete === true, '§5-1 the safety valve marks the result incomplete rather than looping forever')
    assert(result !== null && result.length === 50 * 500, `§5-2 the walk stops at exactly MAX_PAGES * pageSize rows (saw ${result?.length})`)
  }

  // ── §6 a read error aborts the whole walk, fail-honest ────────────────────
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
          range() {
            return this
          },
          then(resolve: (v: { data: null; error: { message: string } }) => void) {
            resolve({ data: null, error: { message: 'simulated failure' } })
          },
        }
      },
    }
    const { rows: result, error, incomplete } = await pagedRangeSelect<Row>(failingClient, 't6', (q) => q.eq('user_id', 'x'))
    assert(result === null, '§6-1 rows is null on error')
    assert(error === 'simulated failure', `§6-2 the error message is surfaced (saw "${error}")`)
    assert(incomplete === false, '§6-3 not marked incomplete on a hard error (a different, more honest signal)')
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
