/**
 * route.test.ts — the PR24 retention sweep for `agent_hold_observations`.
 * Run: npx tsx website/src/app/api/cron/agent-hold-observations-retention-sweep/__tests__/route.test.ts
 *
 * Mirrors the C-1 observability-sweep battery, whose own live defect is the
 * reason the fake client below validates `select()`'s column: a hardcoded
 * `.select('id')` against a table whose PK is not `id` compiles to
 * `DELETE … RETURNING id`, which Postgres rejects wholesale — so the sweep can
 * never delete anything, fail-honest but silently useless. That survived a
 * 47-assertion battery because the fake's `select(_cols)` ignored its argument.
 *
 * `agent_hold_observations.id` genuinely IS `id`, which is exactly how the class
 * hides: a hardcoded literal looks correct today. The column is validated here
 * anyway, so the guard is against the class rather than the symptom.
 */
import assert from 'node:assert'
import { NextRequest } from 'next/server'
import {
  runHoldObservationsRetentionSweep,
  type HoldObservationsSweepDeps,
} from '../handler'
import {
  purgeExpiredHoldObservations,
  isHoldObservationsSweepEnabled,
  HOLD_OBSERVATIONS_SWEEP_ENV_VAR,
} from '@/lib/agent-hold-observations-store'

let passed = 0
let failed = 0
function check(label: string, cond: boolean, extra?: string) {
  if (cond) {
    passed++
    console.log(`  PASS  ${label}`)
  } else {
    failed++
    console.log(`  FAIL  ${label}${extra ? ` — ${extra}` : ''}`)
  }
}

const SECRET = 'test-cron-secret'
const req = (auth?: string) =>
  new NextRequest('https://x.test/api/cron/agent-hold-observations-retention-sweep', {
    headers: auth ? { authorization: auth } : {},
  })

const okDeps = (deleted = 0): HoldObservationsSweepDeps => ({
  purgeHoldObservations: async () => ({ deleted, error: null }),
})

async function main(): Promise<void> {
// ============================================================================
console.log('\n§1 — cron auth (identical gate to the four sibling sweeps)')
// ============================================================================
{
  const prev = process.env.CRON_SECRET
  delete process.env.CRON_SECRET
  const r = await runHoldObservationsRetentionSweep(req('Bearer x'), okDeps())
  check('§1.1 CRON_SECRET unset ⇒ 503 (not configured)', r.status === 503)

  process.env.CRON_SECRET = SECRET
  const bad = await runHoldObservationsRetentionSweep(req('Bearer wrong'), okDeps())
  check('§1.2 wrong Bearer ⇒ 401', bad.status === 401)
  const none = await runHoldObservationsRetentionSweep(req(), okDeps())
  check('§1.3 missing Authorization ⇒ 401', none.status === 401)
  if (prev === undefined) delete process.env.CRON_SECRET
  else process.env.CRON_SECRET = prev
}

// ============================================================================
console.log('\n§2 — flag posture: UNSET ⇒ inert, and provably NO DB work')
// ============================================================================
{
  const prevSecret = process.env.CRON_SECRET
  const prevFlag = process.env[HOLD_OBSERVATIONS_SWEEP_ENV_VAR]
  process.env.CRON_SECRET = SECRET
  delete process.env[HOLD_OBSERVATIONS_SWEEP_ENV_VAR]

  check('§2.1 flag reader is false when unset', isHoldObservationsSweepEnabled() === false)
  process.env[HOLD_OBSERVATIONS_SWEEP_ENV_VAR] = 'TRUE'
  check('§2.2 flag reader is EXACT-match (TRUE ⇒ false)', isHoldObservationsSweepEnabled() === false)
  process.env[HOLD_OBSERVATIONS_SWEEP_ENV_VAR] = 'true'
  check('§2.3 flag reader is true only for exact "true"', isHoldObservationsSweepEnabled() === true)
  delete process.env[HOLD_OBSERVATIONS_SWEEP_ENV_VAR]

  // The purge dep must NOT be called at all when the flag is unset — asserting on
  // the response body alone would pass even if the DB had been hit.
  let called = 0
  const spyDeps: HoldObservationsSweepDeps = {
    purgeHoldObservations: async () => {
      called++
      return { deleted: 7, error: null }
    },
  }
  const r = await runHoldObservationsRetentionSweep(req(`Bearer ${SECRET}`), spyDeps)
  const body = await r.json()
  check('§2.4 flag unset ⇒ 200 with flag_enabled:false', r.status === 200 && body.flag_enabled === false)
  check('§2.5 flag unset ⇒ the purge dep is NEVER invoked (no DB work)', called === 0)
  check('§2.6 flag unset ⇒ no deleted counts are reported', body.deleted === undefined)

  if (prevSecret === undefined) delete process.env.CRON_SECRET
  else process.env.CRON_SECRET = prevSecret
  if (prevFlag === undefined) delete process.env[HOLD_OBSERVATIONS_SWEEP_ENV_VAR]
  else process.env[HOLD_OBSERVATIONS_SWEEP_ENV_VAR] = prevFlag
}

// ============================================================================
console.log('\n§3 — flag ON: purge runs, counts reported, errors NAMED not swallowed')
// ============================================================================
{
  const prevSecret = process.env.CRON_SECRET
  const prevFlag = process.env[HOLD_OBSERVATIONS_SWEEP_ENV_VAR]
  process.env.CRON_SECRET = SECRET
  process.env[HOLD_OBSERVATIONS_SWEEP_ENV_VAR] = 'true'

  const r = await runHoldObservationsRetentionSweep(req(`Bearer ${SECRET}`), okDeps(3))
  const body = await r.json()
  check('§3.1 flag on ⇒ flag_enabled:true + the deleted count', body.flag_enabled === true && body.deleted.agent_hold_observations === 3)
  check('§3.2 no errors on a clean run', Array.isArray(body.errors) && body.errors.length === 0)

  const errDeps: HoldObservationsSweepDeps = {
    purgeHoldObservations: async () => ({ deleted: 0, error: 'boom' }),
  }
  const e = await runHoldObservationsRetentionSweep(req(`Bearer ${SECRET}`), errDeps)
  const ebody = await e.json()
  // ok stays TRUE deliberately: this is a cron with no user-facing response, and a
  // 500 would make the failure LESS visible than a named string in a logged body.
  check('§3.3 a purge error is NAMED in errors[] (never swallowed)', ebody.errors.some((s: string) => s.includes('agent_hold_observations') && s.includes('boom')))
  check('§3.4 ok stays true on a purge error (cron posture, failure still visible)', ebody.ok === true && e.status === 200)

  if (prevSecret === undefined) delete process.env.CRON_SECRET
  else process.env.CRON_SECRET = prevSecret
  if (prevFlag === undefined) delete process.env[HOLD_OBSERVATIONS_SWEEP_ENV_VAR]
  else process.env[HOLD_OBSERVATIONS_SWEEP_ENV_VAR] = prevFlag
}

// ============================================================================
console.log('\n§4 — THE C-1 CLASS: the DELETE must ask for the REAL primary key')
// ============================================================================
// The fake validates select()'s column against the real PK on any scripted
// SUCCESS. This is the check that did not exist when the C-1 defect shipped.
const VALID_SELECT_COLUMN: Record<string, string> = {
  agent_hold_observations: 'id',
}

function makeFakeClient(outcome: {
  data?: unknown[] | null
  error?: { code?: string; message: string } | null
}): {
  client: unknown
  calls: { table: string; column: string; value: string; selectColumn: string }[]
} {
  const calls: { table: string; column: string; value: string; selectColumn: string }[] = []
  const client = {
    from(table: string) {
      return {
        delete() {
          return {
            // `value` is CAPTURED, not discarded — a mutation filtering on a
            // shifted timestamp (now()+90d rather than now(), which would delete
            // LIVE in-retention rows) must be catchable by asserting on value.
            lt(column: string, value: string) {
              return {
                select(cols: string) {
                  calls.push({ table, column, value, selectColumn: cols })
                  // Validate the column only when no explicit error is scripted —
                  // the error-classification cases below exercise a GENUINE error
                  // independent of which column was requested.
                  if (!outcome.error) {
                    const expected = VALID_SELECT_COLUMN[table]
                    if (expected && cols !== expected) {
                      return Promise.resolve({
                        data: null,
                        error: {
                          message: `Could not find the '${cols}' column of '${table}' in the schema cache`,
                        },
                      })
                    }
                  }
                  return Promise.resolve({ data: outcome.data ?? null, error: outcome.error ?? null })
                },
              }
            },
          }
        },
      }
    },
  }
  return { client, calls }
}

{
  const { client, calls } = makeFakeClient({ data: [{ id: 'a' }, { id: 'b' }] })
  const r = await purgeExpiredHoldObservations(client as never)
  check('§4.1 purge returns the deleted row count', r.deleted === 2 && r.error === null)
  check('§4.2 it targets agent_hold_observations', calls[0]?.table === 'agent_hold_observations')
  check('§4.3 it filters on retain_until', calls[0]?.column === 'retain_until')
  check('§4.4 it asks for the REAL primary key `id` (the C-1 class)', calls[0]?.selectColumn === 'id')
  // The filter value must be NOW, not a future/shifted timestamp — a shifted
  // filter would delete live in-retention rows.
  const filterMs = Date.parse(calls[0]?.value ?? '')
  check('§4.5 the retain_until filter is ~now (not a shifted timestamp)', Math.abs(Date.now() - filterMs) < 60_000, calls[0]?.value)
}

// ============================================================================
console.log('\n§5 — error classification: missing TABLE benign, missing COLUMN is NOT')
// ============================================================================
{
  const missingTable = await purgeExpiredHoldObservations(
    makeFakeClient({ error: { code: '42P01', message: 'relation "agent_hold_observations" does not exist' } }).client as never,
  )
  check('§5.1 missing TABLE (42P01) ⇒ benign no-op, no error', missingTable.deleted === 0 && missingTable.error === null)

  const schemaCache = await purgeExpiredHoldObservations(
    makeFakeClient({ error: { message: "Could not find the table 'public.agent_hold_observations' in the schema cache" } }).client as never,
  )
  check('§5.2 PostgREST schema-cache table miss ⇒ benign no-op', schemaCache.deleted === 0 && schemaCache.error === null)

  // THE TRAP: a Postgres 42703 message is shaped `column "x" of relation "y" does
  // not exist` — it contains BOTH "relation" and "does not exist", so a
  // message-only regex would wrongly classify genuine schema drift as benign.
  const missingCol = await purgeExpiredHoldObservations(
    makeFakeClient({ error: { code: '42703', message: 'column "retain_until" of relation "agent_hold_observations" does not exist' } }).client as never,
  )
  check('§5.3 missing COLUMN (42703) is NOT benign — it surfaces as a real error', missingCol.deleted === 0 && missingCol.error !== null)

  const pgrst204 = await purgeExpiredHoldObservations(
    makeFakeClient({ error: { code: 'PGRST204', message: "Could not find the 'retain_until' column in the schema cache" } }).client as never,
  )
  check('§5.4 PGRST204 (unknown column) is NOT benign', pgrst204.deleted === 0 && pgrst204.error !== null)
}

// ============================================================================
console.log('\n§6 — fail-honest: no admin client, and a non-Error rejection')
// ============================================================================
{
  const prevUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const prevKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  delete process.env.NEXT_PUBLIC_SUPABASE_URL
  delete process.env.SUPABASE_SERVICE_ROLE_KEY
  const r = await purgeExpiredHoldObservations()
  check('§6.1 no service-role creds ⇒ honest error, NOT a false zero-row purge', r.deleted === 0 && (r.error ?? '').includes('admin client unavailable'))
  if (prevUrl !== undefined) process.env.NEXT_PUBLIC_SUPABASE_URL = prevUrl
  if (prevKey !== undefined) process.env.SUPABASE_SERVICE_ROLE_KEY = prevKey

  // A rejection carrying a non-Error value: reading `.message` off it would throw a
  // FRESH error from inside the catch, which nothing wraps — the fail-CLOSED
  // behaviour the hardening exists to avoid.
  const throwing = {
    from() {
      return {
        delete() {
          return {
            lt() {
              return { select: () => Promise.reject('a bare string, not an Error') }
            },
          }
        },
      }
    },
  }
  const t = await purgeExpiredHoldObservations(throwing as never)
  check('§6.2 a non-Error rejection is caught and named (never escapes)', t.deleted === 0 && (t.error ?? '').includes('a bare string'))
}

// ============================================================================
console.log('\n§7 — non-vacuity: the fake genuinely traverses (a guard that stops guarding still prints 0 failed)')
// ============================================================================
{
  const { client, calls } = makeFakeClient({ data: [] })
  await purgeExpiredHoldObservations(client as never)
  check('§7.1 exactly ONE delete call was made (the scan is real)', calls.length === 1, `calls=${calls.length}`)
  // Prove the column validator itself can fail — otherwise §4.4 could be vacuous.
  const { client: badClient } = makeFakeClient({ data: [{ id: 'a' }] })
  const probe = await (badClient as { from(t: string): { delete(): { lt(c: string, v: string): { select(c: string): Promise<{ error: unknown }> } } } })
    .from('agent_hold_observations')
    .delete()
    .lt('retain_until', new Date().toISOString())
    .select('error_id')
  check('§7.2 the fake REJECTS a wrong select column (so §4.4 is not vacuous)', probe.error !== null)
}

  assert.ok(true)
  console.log(`\nagent-hold-observations retention sweep battery: ${passed} passed, ${failed} failed`)
  if (failed > 0) process.exit(1)
}

void main()
