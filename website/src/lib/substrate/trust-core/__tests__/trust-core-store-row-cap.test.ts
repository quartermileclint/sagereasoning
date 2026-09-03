/**
 * trust-core-store-row-cap.test.ts — EXECUTED functional regression for the
 * row-cap sweep fix (2026-09-02/-03) to `selectBy` in trust-core-store.ts.
 *
 * getTrustDataForOwner (feeding /api/user/export's Art 20 copy) called the
 * private `selectBy` helper for both `agent_trust_events` and
 * `agent_trust_state` via an unbounded `.select('*').eq(column, value)` —
 * PostgREST silently truncates that at its confirmed 1,000-row server cap,
 * so an operator with more than 1,000 rows in either table got an
 * incomplete export presented as complete. `selectBy` now routes through the
 * shared `pagedRows` keyset helper (cursor `id`, both tables' confirmed
 * UUID primary key).
 *
 * This test drives the real, exported `getTrustDataForOwner` against a fake
 * client that models the PostgREST cap directly (mirroring paged-select
 * .test.ts's own fake, not the shared trust-core fake-supabase.ts, which
 * has no `.gt()`/server-cap simulation) — proving end-to-end that BOTH
 * tables' reads now return more than 1,000 rows.
 *
 * Run: npx tsx src/lib/substrate/trust-core/__tests__/trust-core-store-row-cap.test.ts
 */

import { getTrustDataForOwner } from '../trust-core-store'

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

/** Models PostgREST's row cap, applied AFTER order/limit/filters — exactly as
 *  the real server truncates regardless of the requested page size. */
function makeFakeClient(tables: Record<string, Row[]>, opts: { maxRows?: number } = {}) {
  const maxRows = opts.maxRows ?? 1000

  const client = {
    from(table: string) {
      let eqFilter: [string, unknown] | null = null
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
          let out = tables[table] ?? []
          if (eqFilter) out = out.filter((r) => r[eqFilter![0]] === eqFilter![1])
          if (gtFilter) out = out.filter((r) => (r[gtFilter![0]] as any) > (gtFilter![1] as any))
          if (orderCol) {
            out = [...out].sort((a, b) =>
              (a[orderCol!] as any) < (b[orderCol!] as any) ? -1 : (a[orderCol!] as any) > (b[orderCol!] as any) ? 1 : 0,
            )
          }
          if (limitN !== null) out = out.slice(0, limitN)
          out = out.slice(0, maxRows)
          resolve({ data: out, error: null })
        },
      }
      return builder
    },
  }
  return client as any
}

function row(id: number, ownerUserId: string): Row {
  return { id: `id-${String(id).padStart(6, '0')}`, owner_user_id: ownerUserId, virtue_domain: 'phronesis' }
}

async function main() {
  // ── §1 both tables exceed the 1,000-row server cap — the export must see all ──
  {
    const eventsRows: Row[] = []
    for (let i = 0; i < 1300; i++) eventsRows.push(row(i, 'owner-1'))
    const stateRows: Row[] = []
    for (let i = 0; i < 1100; i++) stateRows.push(row(i, 'owner-1'))

    const client = makeFakeClient(
      { agent_trust_events: eventsRows, agent_trust_state: stateRows },
      { maxRows: 1000 },
    )

    // Sanity: the fake genuinely caps a bare (non-paged) read at 1000 — the
    // exact behaviour of the OLD selectBy body before this fix.
    const bare = await client.from('agent_trust_events').select('*').eq('owner_user_id', 'owner-1')
    assert(bare.data.length === 1000, `§1-0 sanity: a bare unbounded read caps at 1000 (saw ${bare.data.length})`)

    const result = await getTrustDataForOwner('owner-1', client)
    assert(result.ok === true, '§1-1 getTrustDataForOwner ok:true')
    if (result.ok) {
      assert(
        result.value.events.length === 1300,
        `§1-2 agent_trust_events: all 1300 rows returned, past the 1000 cap (saw ${result.value.events.length})`,
      )
      assert(
        result.value.state.length === 1100,
        `§1-3 agent_trust_state: all 1100 rows returned, past the 1000 cap (saw ${result.value.state.length})`,
      )
    }
  }

  // ── §2 owner scoping still holds across pages ─────────────────────────────
  {
    const eventsRows: Row[] = []
    for (let i = 0; i < 1200; i++) eventsRows.push(row(i, i % 2 === 0 ? 'owner-a' : 'owner-b'))
    const client = makeFakeClient({ agent_trust_events: eventsRows, agent_trust_state: [] }, { maxRows: 1000 })

    const result = await getTrustDataForOwner('owner-a', client)
    assert(result.ok === true, '§2-1 ok:true')
    if (result.ok) {
      assert(result.value.events.length === 600, `§2-2 only owner-a's 600 rows returned (saw ${result.value.events.length})`)
      assert(
        result.value.events.every((r: any) => r.owner_user_id === 'owner-a'),
        '§2-3 every returned row matches the eq filter',
      )
    }
  }

  // ── §3 a small (well under 1,000) row set is unaffected — no behaviour change ──
  {
    const eventsRows = [row(1, 'owner-z'), row(2, 'owner-z')]
    const stateRows = [row(3, 'owner-z')]
    const client = makeFakeClient({ agent_trust_events: eventsRows, agent_trust_state: stateRows })
    const result = await getTrustDataForOwner('owner-z', client)
    assert(result.ok === true, '§3-1 ok:true')
    if (result.ok) {
      assert(result.value.events.length === 2, `§3-2 small table: 2 events (saw ${result.value.events.length})`)
      assert(result.value.state.length === 1, `§3-3 small table: 1 state row (saw ${result.value.state.length})`)
    }
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
