/**
 * collaboration-store-row-cap.test.ts — EXECUTED regression pin for the
 * row-cap sweep fix to `getCollaborationDataForOwner` (2026-09-03, following
 * C1/C4's paged-select pattern).
 *
 * Proves the export read now returns MORE than the PostgREST 1,000-row cap
 * for a single owner where the old bare `.select('*').eq(...)` would have
 * silently truncated — an incomplete Art 20 export presented as complete.
 *
 * Run: npx tsx src/lib/substrate/trust-core/__tests__/collaboration-store-row-cap.test.ts
 */

import { getCollaborationDataForOwner } from '../collaboration-store'

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
 * A fake Supabase client modelling the PostgREST 1,000-row cap, applied
 * AFTER order()/limit()/filters — same shape as paged-select.test.ts's
 * fake, extended with delete() (unused here but keeps the builder generic).
 */
function makeFakeClient(rows: Row[], opts: { maxRows?: number } = {}) {
  const maxRows = opts.maxRows ?? 1000
  let requestCount = 0

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
          requestCount++
          let out = rows.filter((r) => r.__table === table)
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
  return { client: client as any, requestCount: () => requestCount }
}

function row(id: number, ownerUserId: string): Row {
  return {
    __table: 'collaboration_records',
    id: `id-${String(id).padStart(6, '0')}`,
    owner_user_id: ownerUserId,
    task_ref: `task-${id}`,
  }
}

async function main() {
  // ── §1 more rows than one server-side page for ONE owner ─────────────────
  {
    const rows: Row[] = []
    const owner = 'owner-A'
    for (let i = 0; i < 1300; i++) rows.push(row(i, owner))
    // Some other owner's rows mixed in, to prove the eq() scoping survives paging.
    for (let i = 1300; i < 1310; i++) rows.push(row(i, 'owner-B'))

    const { client, requestCount } = makeFakeClient(rows, { maxRows: 1000 })
    const result = await getCollaborationDataForOwner(owner, client)

    assert(result.ok === true, '§1-1 ok:true')
    if (result.ok) {
      assert(result.value.length === 1300, `§1-2 all 1300 of the owner's rows returned (saw ${result.value.length})`)
    }
    assert(requestCount() > 1, `§1-3 more than one page request made (saw ${requestCount()}) — proves paging occurred`)
  }

  // ── §2 negative control — a bare unbounded read WOULD have truncated ─────
  {
    const rows: Row[] = []
    const owner = 'owner-C'
    for (let i = 0; i < 1300; i++) rows.push(row(i, owner))
    const { client } = makeFakeClient(rows, { maxRows: 1000 })

    const bareResult: { data: Row[]; error: null } = await client
      .from('collaboration_records')
      .select('*')
      .eq('owner_user_id', owner)
    assert(
      bareResult.data.length === 1000,
      `§2-1 sanity: the OLD pattern (bare select().eq(), no paging) genuinely caps at 1000 (saw ${bareResult.data.length})`,
    )

    const result = await getCollaborationDataForOwner(owner, client)
    assert(
      result.ok === true && result.value.length === 1300,
      `§2-2 the fixed function returns all 1300 where the old bare read would have capped at 1000`,
    )
  }

  // ── §3 empty owner — no rows, ok:true, empty array (not an error) ────────
  {
    const { client } = makeFakeClient([])
    const result = await getCollaborationDataForOwner('nobody', client)
    assert(result.ok === true, '§3-1 ok:true on an owner with zero rows')
    if (result.ok) assert(Array.isArray(result.value) && result.value.length === 0, '§3-2 empty array, not null/undefined')
  }

  // ── §4 missing-table-benign — a genuine query error naming a missing table
  //     is still folded to ok:true/[] (pre-migration environments) ─────────
  {
    const client = {
      from() {
        const builder: any = {
          select() {
            return builder
          },
          eq() {
            return builder
          },
          order() {
            return builder
          },
          limit() {
            return builder
          },
          then(resolve: (v: { data: null; error: { message: string } }) => void) {
            resolve({ data: null, error: { message: 'Could not find the table \'public.collaboration_records\' in the schema cache' } })
          },
        }
        return builder
      },
    }
    const result = await getCollaborationDataForOwner('owner-D', client as any)
    assert(result.ok === true, '§4-1 missing-table error folds to ok:true')
    if (result.ok) assert(Array.isArray(result.value) && result.value.length === 0, '§4-2 empty array on missing-table')
  }

  console.log(`\n${passed} passed, ${failed} failed`)
  if (failed > 0) {
    console.error('\nFailures:\n' + failures.map((f) => '  - ' + f).join('\n'))
    process.exit(1)
  }
}

main()
