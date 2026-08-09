/**
 * idea-loop-watching-store.test.ts — the DB seam for `watching`
 * (agent-circles, built 2026-08-09; see ../idea-loop-watching-store.ts
 * header). A minimal, purpose-built in-memory fake Supabase client — the store
 * uses call chains (insert().select().single(); a batched array insert;
 * update().eq(); delete().eq()/lt().select('id'); a join select) distinct
 * enough from trust-core-store's that a dedicated fake is clearer than
 * extending the shared one (per that fake's own header, scoped to trust-core
 * tables).
 *
 * Covers: idempotency (the DB unique-violation 23505 path), partial-failure
 * cleanup (a failed candidate/winner-link insert deletes the half-written
 * cycle), the winner-link-by-outcome derivation (order-independent), data
 * rights (delete-by-owner/credential, export, missing-table-benign), and the
 * retention purge.
 *
 * Plain-assertion script: npx tsx <this file>.
 */

import { readFileSync } from 'node:fs'
import type { SupabaseClient } from '@supabase/supabase-js'
import {
  insertCycleRecord,
  deleteWatchingDataForOwner,
  deleteWatchingDataForCredential,
  getWatchingDataForOwner,
  getCyclesWithCandidates,
  purgeExpiredWatching,
  type WatchingCycleInsert,
  type WatchingCandidateInsert,
} from '../idea-loop-watching-store'

let passed = 0
let failed = 0
const failures: string[] = []
function assert(condition: boolean, label: string): void {
  if (condition) passed++
  else {
    failed++
    failures.push(label)
    console.error(`FAIL: ${label}`)
  }
}

// ── A minimal, purpose-built fake ────────────────────────────────────────────

type Row = Record<string, unknown>

function makeFake(opts?: { missingTables?: boolean }) {
  const cycles: Row[] = []
  const candidates: Row[] = []
  let idCounter = 0
  const missing = opts?.missingTables === true
  const MISSING_ERR = { code: '42P01', message: 'relation "idea_loop_cycles" does not exist' }
  let armFailNextInsert: { table: string; error: { code?: string; message: string } } | null = null

  function nextId(): string {
    idCounter++
    return `id-${idCounter}`
  }

  function violatesUniqueCycle(row: Row): boolean {
    return cycles.some((c) => c.loop_id === row.loop_id && c.cycle_number === row.cycle_number)
  }

  const client = {
    from(table: string) {
      const store = table === 'idea_loop_cycles' ? cycles : candidates

      const builder = {
        insert(rowsOrRow: Row | Row[]) {
          if (missing) {
            return {
              select: () => ({
                single: async () => ({ data: null, error: MISSING_ERR }),
                then: undefined,
              }),
            } as unknown
          }
          if (armFailNextInsert && armFailNextInsert.table === table) {
            const err = armFailNextInsert.error
            armFailNextInsert = null
            return {
              select: () => ({
                single: async () => ({ data: null, error: err }),
                // for the batched-array path, `.select(cols)` awaited directly
                then: (resolve: (v: unknown) => void) => resolve({ data: null, error: err }),
              }),
            } as unknown
          }
          const rows = Array.isArray(rowsOrRow) ? rowsOrRow : [rowsOrRow]
          if (table === 'idea_loop_cycles' && violatesUniqueCycle(rows[0])) {
            const err = { code: '23505', message: 'duplicate key value violates unique constraint "uq_ilc_loop_cycle"' }
            return {
              select: () => ({ single: async () => ({ data: null, error: err }) }),
            } as unknown
          }
          const withIds = rows.map((r) => ({ ...r, id: nextId() }))
          if (table === 'idea_loop_cycles') cycles.push(...withIds)
          else candidates.push(...withIds)
          return {
            select: (_cols?: string) => ({
              single: async () => ({ data: withIds[0], error: null }),
              // batched-array await path: `await insert(rows).select(cols)`
              then: (resolve: (v: unknown) => void) => resolve({ data: withIds, error: null }),
            }),
          } as unknown
        },
        update(patch: Row) {
          return {
            eq: (col: string, val: unknown) => {
              if (missing) return Promise.resolve({ error: MISSING_ERR })
              const row = store.find((r) => r[col] === val)
              if (row) Object.assign(row, patch)
              return Promise.resolve({ error: null })
            },
          }
        },
        delete() {
          return {
            eq: (col: string, val: unknown) => {
              function exec() {
                if (missing) return Promise.resolve({ data: null, error: MISSING_ERR })
                const matched = store.filter((r) => r[col] === val)
                for (const m of matched) {
                  const idx = store.indexOf(m)
                  store.splice(idx, 1)
                  // Cascade: deleting a cycle removes its candidates too.
                  if (table === 'idea_loop_cycles') {
                    for (let i = candidates.length - 1; i >= 0; i--) {
                      if (candidates[i].cycle_id === m.id) candidates.splice(i, 1)
                    }
                  }
                }
                return Promise.resolve({ data: matched.map((m) => ({ id: m.id })), error: null })
              }
              return {
                select: (_cols?: string) => exec(),
                // cleanupCycle awaits `.delete().eq('id', cycleId)` directly
                // (no .select()) — make the eq() result itself awaitable.
                then: (resolve: (v: unknown) => void) => exec().then(resolve),
              }
            },
            lt: (col: string, val: string) => ({
              select: (_cols?: string) => {
                if (missing) return Promise.resolve({ data: null, error: MISSING_ERR })
                const matched = store.filter((r) => new Date(r[col] as string) < new Date(val))
                for (const m of matched) {
                  const idx = store.indexOf(m)
                  store.splice(idx, 1)
                }
                return Promise.resolve({ data: matched.map((m) => ({ id: m.id })), error: null })
              },
            }),
          }
        },
        select(cols: string) {
          const joined = /idea_loop_candidates/.test(cols) && table === 'idea_loop_cycles'
          const filters: Array<{ col: string; val: unknown }> = []
          function exec() {
            if (missing) return Promise.resolve({ data: null, error: MISSING_ERR })
            let rows = store.filter((r) => filters.every((f) => r[f.col] === f.val))
            if (joined) {
              rows = rows.map((r) => ({
                ...r,
                idea_loop_candidates: candidates.filter((c) => c.cycle_id === r.id),
              }))
            }
            return Promise.resolve({ data: rows, error: null })
          }
          const api = {
            eq(col: string, val: unknown) {
              filters.push({ col, val })
              return api
            },
            order() {
              return api
            },
            limit(_n: number) {
              return api
            },
            then(resolve: (v: unknown) => void) {
              exec().then(resolve)
            },
          }
          return api as unknown
        },
      }
      return builder
    },
  } as unknown as SupabaseClient

  return {
    client,
    cycles,
    candidates,
    armFailInsert(table: string, error: { code?: string; message: string }) {
      armFailNextInsert = { table, error }
    },
  }
}

const CYCLE: WatchingCycleInsert = {
  loop_id: 'loop-1',
  cycle_number: 0,
  gap_ref: 'sess:0:1->2',
  cycle_outcome: 'null_cycle',
  friction_only_mode: false,
  cost_cents: 10,
  elapsed_ms: 500,
  maximum_duration_ms: 60000,
  agent_id: 'sagereasoning:idea-loop@v1',
  owner_user_id: 'owner-1',
  credential_ref: 'api_key:cred-1',
  started_at: '2026-08-09T00:00:00Z',
  ended_at: '2026-08-09T00:01:00Z',
}

const CANDIDATE: WatchingCandidateInsert = {
  gap_ref: 'sess:0:1->2',
  heuristic: 'anomaly_detection',
  proposed_action: 'do the thing',
  classification_kind: 'virtue_domain',
  classified_domains: ['phronesis'],
  generation_confidence: 0.8,
  guardrail_proximity: 'reflexive',
  guardrail_domains: ['dikaiosyne'],
  guardrail_session_id: 'sess-9',
  passed_novelty_check: true,
  novelty_confidence: 1,
  novelty_basis: null,
  cycle_outcome: 'rejected_by_guardrail',
  unavailable_dependency: null,
}

async function run(): Promise<void> {
  // ══════════════════════════════════════════════════════════════════════════
  // §1 A genuine write — cycle + candidates + winner link
  // ══════════════════════════════════════════════════════════════════════════
  {
    const fake = makeFake()
    const winnerCandidate: WatchingCandidateInsert = { ...CANDIDATE, cycle_outcome: 'winner' }
    const res = await insertCycleRecord(
      { ...CYCLE, cycle_outcome: 'winner' },
      [CANDIDATE, winnerCandidate],
      fake.client,
    )
    assert(res.ok === true, '§1.1 a genuine write succeeds')
    if (res.ok && res.value.status === 'written') {
      const written = res.value
      assert(written.candidates_written === 2, '§1.2 both candidates written')
      const cycleRow = fake.cycles.find((c) => c.id === written.cycle_id)
      assert(!!cycleRow, '§1.3 the cycle row exists')
      const winnerRow = fake.candidates.find((c) => c.cycle_outcome === 'winner')
      assert(
        !!winnerRow && cycleRow?.winner_candidate_id === winnerRow.id,
        '§1.4 the winner link is derived by OUTCOME (order-independent), not array index',
      )
    } else {
      assert(false, '§1.5 expected status "written"')
    }
  }

  // ══════════════════════════════════════════════════════════════════════════
  // §2 Idempotency — a retried write on the same (loop_id, cycle_number) is a
  // duplicate no-op, never a second row
  // ══════════════════════════════════════════════════════════════════════════
  {
    const fake = makeFake()
    const first = await insertCycleRecord(CYCLE, [CANDIDATE], fake.client)
    assert(first.ok && first.ok && first.value.status === 'written', '§2.1 first write succeeds')
    const cyclesAfterFirst = fake.cycles.length
    const second = await insertCycleRecord(CYCLE, [CANDIDATE], fake.client)
    assert(second.ok === true, '§2.2 a retried write does not error')
    assert(second.ok && second.value.status === 'duplicate', '§2.3 a retried write reports duplicate, not written')
    assert(fake.cycles.length === cyclesAfterFirst, '§2.4 NO second row was inserted (idempotent)')
  }

  // ══════════════════════════════════════════════════════════════════════════
  // §3 Partial-failure cleanup — a candidate-insert failure deletes the
  // half-written cycle so a retry starts clean
  // ══════════════════════════════════════════════════════════════════════════
  {
    const fake = makeFake()
    fake.armFailInsert('idea_loop_candidates', { message: 'candidate insert boom' })
    const res = await insertCycleRecord(CYCLE, [CANDIDATE], fake.client)
    assert(res.ok === false, '§3.1 a candidate-insert failure reports ok:false')
    assert(fake.cycles.length === 0, '§3.2 the half-written cycle row was cleaned up (deleted)')

    // A retry on the same key now succeeds (proves the cleanup was real, not a
    // dangling row that would collide on the next attempt).
    const retry = await insertCycleRecord(CYCLE, [CANDIDATE], fake.client)
    assert(retry.ok && retry.ok && retry.value.status === 'written', '§3.3 a retry after cleanup succeeds cleanly (no phantom duplicate)')
  }

  // ══════════════════════════════════════════════════════════════════════════
  // §4 Data rights — delete by owner / credential; export; missing-table-benign
  // ══════════════════════════════════════════════════════════════════════════
  {
    const fake = makeFake()
    await insertCycleRecord(CYCLE, [CANDIDATE], fake.client)
    const del = await deleteWatchingDataForOwner('owner-1', fake.client)
    assert(del.ok === true && del.ok && del.value === 1, '§4.1 delete-by-owner removes the owner\'s cycle row')
    assert(fake.candidates.length === 0, '§4.2 candidates cascade with their cycle (FK ON DELETE CASCADE modelled)')

    const fake2 = makeFake()
    await insertCycleRecord(CYCLE, [CANDIDATE], fake2.client)
    const delCred = await deleteWatchingDataForCredential('api_key:cred-1', fake2.client)
    assert(delCred.ok === true && delCred.ok && delCred.value === 1, '§4.3 delete-by-credential removes the credential\'s cycle row')

    const fake3 = makeFake()
    await insertCycleRecord(CYCLE, [CANDIDATE], fake3.client)
    const exp = await getWatchingDataForOwner('owner-1', fake3.client)
    assert(exp.ok === true && exp.ok && exp.value.length === 1, '§4.4 export-by-owner returns the owner\'s cycle rows')

    const missing = makeFake({ missingTables: true })
    const delMissing = await deleteWatchingDataForOwner('owner-1', missing.client)
    assert(delMissing.ok === true && delMissing.ok && delMissing.value === 0, '§4.5 delete is missing-table-benign (ok:true, 0) before the migration lands')
    const expMissing = await getWatchingDataForOwner('owner-1', missing.client)
    assert(expMissing.ok === true && expMissing.ok && expMissing.value.length === 0, '§4.6 export is missing-table-benign (ok:true, []) before the migration lands')
  }

  // ══════════════════════════════════════════════════════════════════════════
  // §5 Retention sweep — purge past retain_until; missing-table-benign
  // ══════════════════════════════════════════════════════════════════════════
  {
    const fake = makeFake()
    const expired: WatchingCycleInsert = { ...CYCLE, cycle_number: 99 }
    await insertCycleRecord(expired, [], fake.client)
    // retain_until isn't set by this store's insert path in the fake (no DB
    // default), so stamp it manually to simulate an expired row.
    fake.cycles[0].retain_until = '2000-01-01T00:00:00Z'
    const purge = await purgeExpiredWatching(fake.client)
    assert(purge.error === null && purge.deleted === 1, '§5.1 an expired cycle row is purged')
    assert(fake.cycles.length === 0, '§5.2 the row is genuinely gone')

    const missing = makeFake({ missingTables: true })
    const purgeMissing = await purgeExpiredWatching(missing.client)
    assert(purgeMissing.error === null && purgeMissing.deleted === 0, '§5.3 purge is missing-table-benign before the migration lands')
  }

  // ══════════════════════════════════════════════════════════════════════════
  // §6 The founder read — joined cycles + candidates, loop_id filter
  // ══════════════════════════════════════════════════════════════════════════
  {
    const fake = makeFake()
    await insertCycleRecord(CYCLE, [CANDIDATE], fake.client)
    await insertCycleRecord({ ...CYCLE, cycle_number: 1, loop_id: 'loop-2' }, [], fake.client)
    const all = await getCyclesWithCandidates({}, fake.client)
    assert(all.ok === true && all.ok && all.value.length === 2, '§6.1 unfiltered read returns all cycles')
    const filtered = await getCyclesWithCandidates({ loopId: 'loop-1' }, fake.client)
    assert(filtered.ok === true && filtered.ok && filtered.value.length === 1, '§6.2 loop_id filter narrows the read')
    const row = (filtered.ok ? filtered.value[0] : {}) as Record<string, unknown>
    assert(
      Array.isArray(row.idea_loop_candidates) && (row.idea_loop_candidates as unknown[]).length === 1,
      '§6.3 candidates are joined onto the cycle row (Q7 attribution reaches the dashboard)',
    )
  }

  // ══════════════════════════════════════════════════════════════════════════
  // §7 — INV source pins: the DISAMBIGUATED cycle→candidates embed.
  //
  // HONEST SCOPE, STATED SO IT IS NOT MISREAD: these pin the query STRING, not
  // the behaviour. The in-memory fake below models result SHAPE only — it has
  // no notion of PostgREST relationship resolution, so it returns joined rows
  // for ANY select string, qualified or not. That is precisely why this whole
  // battery was green (23/0) while BOTH production readers were failing with
  // PGRST201 (found live 2026-08-09 at the SUBSTRATE_WATCHING_ENABLED smoke:
  // GET /api/founder/watching → 503 {"error":"service error"}).
  //
  // So §6.3 above is NOT evidence the join works in production, and no fake-
  // driven assertion can be. These pins exist only to stop a future edit
  // silently dropping the hint; behaviour is proven by a LIVE call.
  // ══════════════════════════════════════════════════════════════════════════
  {
    const src = readFileSync(
      new URL('../idea-loop-watching-store.ts', import.meta.url),
      'utf8',
    )
    // Strip block comments so the explanatory comment's own literal (which
    // deliberately shows the FORBIDDEN form) cannot satisfy or defeat a pin.
    const code = src.replace(/\/\*[\s\S]*?\*\//g, '')

    assert(
      code.includes('!idea_loop_candidates_cycle_id_fkey'),
      '§7.1 the embed names the candidates.cycle_id FK explicitly (PGRST201 disambiguation)',
    )
    assert(
      !/\$\{CANDIDATES_TABLE\}\s*\(\*\)/.test(code),
      '§7.2 no UNQUALIFIED cycle→candidates embed survives anywhere in the module',
    )
    // Non-vacuity: both readers must route through the one shared constant, so
    // a single edit cannot fix one call site and leave the other broken — the
    // exact shape of the live defect (dashboard AND the R17i export path).
    const embedUses = code.match(/\$\{CANDIDATES_EMBED\}/g) ?? []
    assert(
      embedUses.length === 2,
      `§7.3 both readers (dashboard + R17i export) use the shared embed constant (found ${embedUses.length}, expected 2)`,
    )
  }

  console.log(`\nidea-loop-watching-store battery: ${passed} passed, ${failed} failed`)
  if (failed > 0) {
    console.error('FAILURES:\n - ' + failures.join('\n - '))
    process.exit(1)
  }
}

run().catch((e) => {
  console.error('battery crashed:', e)
  process.exit(1)
})
