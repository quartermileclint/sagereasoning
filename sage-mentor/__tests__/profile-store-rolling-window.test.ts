/**
 * profile-store-rolling-window.test.ts — EXECUTED regression pin for the
 * unbounded `mentor_interactions` read in `computeRollingWindow` (found by the
 * 2026-09-02 codebase-wide row-cap sweep, finding H9; fixed 2026-09-03).
 *
 * ===========================================================================
 * THE DEFECT THIS REPLACES
 * ===========================================================================
 *
 * `computeRollingWindow` used to call `.from('mentor_interactions').select('*')`
 * with NO filter at all — reading the ENTIRE table for every user, every
 * profile, then filtering to the target `profile_id` and the recency window
 * in JavaScript after the fact. Two problems: (1) it read every practitioner's
 * rows to find one (a privacy smell independent of row count); (2) once
 * `mentor_interactions` crosses PostgREST's silent 1,000-row cap, the
 * unfiltered read truncates BEFORE the target profile's rows are even
 * guaranteed to be present in the returned set — a governing surface (the
 * mentor profile's rolling-window update, live via `updateProfileFromReflection`
 * on both `/api/reflect` and `/api/mentor/private/reflect`) silently computing
 * over an arbitrary subset that may contain none of the target user's rows.
 *
 * THE FIX — filter, window, order, and limit AT THE DATABASE
 * ===========================================================================
 *
 * `.eq('profile_id', profileId).gte('created_at', cutoff).order('created_at',
 * {ascending:false}).limit(HUMAN_ROLLING_WINDOW.max_interactions)` — the read
 * can now never return another user's rows, and the row cap (whatever it is)
 * applies to a query already scoped to at most `max_interactions` (50) rows
 * for one profile within the recency window, which can never itself approach
 * the 1,000-row cap.
 *
 * This is the module's first test file (sage-mentor/ had none before this).
 *
 * Run: npx tsx sage-mentor/__tests__/profile-store-rolling-window.test.ts
 */

import { computeRollingWindow, HUMAN_ROLLING_WINDOW } from '../profile-store'

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
 * A fake matching the module's own minimal local `SupabaseClient` type
 * (profile-store.ts's `SupabaseQueryBuilder`) — NOT the full real
 * `@supabase/supabase-js` shape, since profile-store.ts deliberately does not
 * depend on it. Records every filter/window/order/limit APPLIED to the
 * query, so the test can assert the DB-level scoping happened, not just that
 * the final in-memory result looked right (which the pre-fix code would also
 * have produced correctly for a small fixture — the defect only manifests at
 * scale/cross-tenant, which this fake makes observable without a 1,000-row
 * fixture).
 */
function makeFakeClient(tables: Record<string, Row[]>): {
  client: { from: (table: string) => any }
  calls: { table: string; eqCalls: Array<[string, unknown]>; gteCalls: Array<[string, unknown]>; orderCalls: Array<[string, { ascending?: boolean } | undefined]>; limitCalls: number[] }[]
} {
  const calls: { table: string; eqCalls: Array<[string, unknown]>; gteCalls: Array<[string, unknown]>; orderCalls: Array<[string, { ascending?: boolean } | undefined]>; limitCalls: number[] }[] = []

  function makeBuilder(table: string, rows: Row[]) {
    const record = { table, eqCalls: [] as Array<[string, unknown]>, gteCalls: [] as Array<[string, unknown]>, orderCalls: [] as Array<[string, { ascending?: boolean } | undefined]>, limitCalls: [] as number[] }
    calls.push(record)
    let filtered = rows

    function applyFilters(): Row[] {
      let out = [...filtered]
      for (const [col, val] of record.eqCalls) out = out.filter((r) => r[col] === val)
      for (const [col, val] of record.gteCalls) out = out.filter((r) => (r[col] as string) >= (val as string))
      for (const [col, opts] of record.orderCalls) {
        const asc = opts?.ascending !== false
        out = [...out].sort((a, b) => {
          const av = String(a[col])
          const bv = String(b[col])
          return asc ? av.localeCompare(bv) : bv.localeCompare(av)
        })
      }
      for (const n of record.limitCalls) out = out.slice(0, n)
      return out
    }

    const builder: any = {
      eq(col: string, val: unknown) {
        record.eqCalls.push([col, val])
        return builder
      },
      gte(col: string, val: unknown) {
        record.gteCalls.push([col, val])
        return builder
      },
      order(col: string, opts?: { ascending?: boolean }) {
        record.orderCalls.push([col, opts])
        return builder
      },
      limit(n: number) {
        record.limitCalls.push(n)
        return builder
      },
      then(resolve: (v: { data: Row[]; error: null }) => void) {
        resolve({ data: applyFilters(), error: null })
      },
    }
    return builder
  }

  return {
    client: {
      from(table: string) {
        return {
          select() {
            return makeBuilder(table, tables[table] ?? [])
          },
        }
      },
    },
    calls,
  }
}

function iso(daysAgo: number): string {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  return d.toISOString()
}

async function main() {
  // ── §1 the query is scoped to the target profile at the DB, not in JS ────
  {
    const rows: Row[] = [
      { id: '1', profile_id: 'target', created_at: iso(1), proximity_assessed: 'deliberate', passions: [] },
      { id: '2', profile_id: 'other-user', created_at: iso(1), proximity_assessed: 'reflexive', passions: [] },
      { id: '3', profile_id: 'other-user', created_at: iso(2), proximity_assessed: 'reflexive', passions: [] },
    ]
    const { client, calls } = makeFakeClient({ mentor_interactions: rows })
    const result = await computeRollingWindow(client as any, 'target')

    assert(result !== null, '§1-1 a target profile with one matching row returns a summary, not null')
    assert(calls.length === 1, '§1-2 exactly one query is issued')
    assert(
      calls[0].eqCalls.some(([col, val]) => col === 'profile_id' && val === 'target'),
      '§1-3 the query filters by profile_id AT THE DB (.eq), not by reading every profile and filtering in JS'
    )
    assert(result?.interaction_count === 1, '§1-4 only the target profile\'s row is counted (other-user rows excluded by the DB filter, not by chance)')
  }

  // ── §2 the query is windowed by recency AT THE DB ─────────────────────────
  {
    const rows: Row[] = [
      { id: '1', profile_id: 'target', created_at: iso(1), proximity_assessed: 'deliberate', passions: [] },
      { id: '2', profile_id: 'target', created_at: iso(HUMAN_ROLLING_WINDOW.max_age_days + 10), proximity_assessed: 'reflexive', passions: [] },
    ]
    const { client, calls } = makeFakeClient({ mentor_interactions: rows })
    const result = await computeRollingWindow(client as any, 'target')

    assert(
      calls[0].gteCalls.some(([col]) => col === 'created_at'),
      '§2-1 the query applies a recency cutoff AT THE DB (.gte on created_at)'
    )
    assert(result?.interaction_count === 1, '§2-2 the interaction older than max_age_days is excluded (only 1 of 2 rows counted)')
  }

  // ── §3 the query orders and limits AT THE DB (never .select(\'*\') alone) ──
  {
    const rows: Row[] = Array.from({ length: HUMAN_ROLLING_WINDOW.max_interactions + 20 }, (_, i) => ({
      id: `r${i}`,
      profile_id: 'target',
      created_at: iso(i % 10),
      proximity_assessed: 'deliberate' as const,
      passions: [],
    }))
    const { client, calls } = makeFakeClient({ mentor_interactions: rows })
    const result = await computeRollingWindow(client as any, 'target')

    assert(
      calls[0].orderCalls.some(([col, opts]) => col === 'created_at' && opts?.ascending === false),
      '§3-1 the query orders by created_at descending AT THE DB'
    )
    assert(
      calls[0].limitCalls.includes(HUMAN_ROLLING_WINDOW.max_interactions),
      '§3-2 the query applies an explicit .limit(max_interactions) AT THE DB — never an unbounded .select(\'*\')'
    )
    assert(
      result !== null && result.interaction_count <= HUMAN_ROLLING_WINDOW.max_interactions,
      '§3-3 the returned window never exceeds max_interactions, even when more rows exist for the profile'
    )
  }

  // ── §4 no profile match → null, not an empty-table false negative ────────
  {
    const rows: Row[] = [{ id: '1', profile_id: 'somebody-else', created_at: iso(1), proximity_assessed: 'deliberate', passions: [] }]
    const { client } = makeFakeClient({ mentor_interactions: rows })
    const result = await computeRollingWindow(client as any, 'target')
    assert(result === null, '§4-1 a profile with no matching interactions returns null')
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
