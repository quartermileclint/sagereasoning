/**
 * route.test.ts — /api/cron/observability-retention-sweep invariant tests
 * (C-1; the observability retention-sweep gap named by the 2026-08-01
 * regrounding audit).
 *
 * Plain-assertion script run with: npx tsx <this file>   (no --env-file, no DB —
 * the handler reaches the DB only through INJECTED purge deps, so 503/401/
 * flag-off/flag-on are all exercised without a Supabase client or the network).
 * Async sections run inside main() (this project's tsx targets CJS — no
 * top-level await). Mirrors ../../trajectory-retention-sweep/__tests__/route.test.ts.
 *
 * Coverage: CRON_SECRET unset ⇒ 503; bad/absent Bearer ⇒ 401; flag unset (or not
 * exactly 'true') ⇒ 200 { flag_enabled:false } with NO DB work on EITHER table;
 * flag set ⇒ 200 with a per-table deleted count and BOTH purges called exactly
 * once; fail-honest (a purge error is reported in `errors`, still 200); and the
 * property the two-table shape adds over the one-table precedent — the two
 * purges are INDEPENDENT, so one failing neither suppresses nor is suppressed by
 * the other. §7 covers the store purge fns themselves against a fake client
 * (missing-table-benign vs a genuine error vs a null admin client), which is the
 * classification the writers' own trap comment warns about.
 *
 * PR6 not engaged (no distress/R20a surface).
 */

import type { NextRequest } from 'next/server'
import { GET } from '../route'
import {
  runObservabilityRetentionSweep,
  type ObservabilitySweepDeps,
} from '../handler'
import {
  purgeExpiredRouteErrors,
  purgeExpiredThrottleEvents,
  isObservabilitySweepEnabled,
  OBSERVABILITY_SWEEP_ENV_VAR,
} from '@/lib/observability-store'

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

// Minimal fake request — the handler reads only request.headers.get('authorization').
function makeReq(auth: string | null): NextRequest {
  return {
    headers: {
      get(name: string): string | null {
        return name.toLowerCase() === 'authorization' ? auth : null
      },
    },
  } as unknown as NextRequest
}

type PurgeResult = { deleted: number; error: string | null }

/** Purge spies for both tables: record calls; return configurable results. */
function makeDeps(
  routeErrors: PurgeResult,
  throttleEvents: PurgeResult,
): ObservabilitySweepDeps & { routeCalls: number; throttleCalls: number } {
  const spy = {
    routeCalls: 0,
    throttleCalls: 0,
    purgeRouteErrors: async (): Promise<PurgeResult> => {
      spy.routeCalls += 1
      return routeErrors
    },
    purgeThrottleEvents: async (): Promise<PurgeResult> => {
      spy.throttleCalls += 1
      return throttleEvents
    },
  }
  return spy
}

const SWEEP_FLAG = OBSERVABILITY_SWEEP_ENV_VAR

/**
 * A fake PostgREST-ish client for §7: `.from(t).delete().lt(c,v).select(c)`
 * resolves to whatever this table's scripted outcome is. Deliberately records
 * the chain so the test can assert the DELETE is actually filtered on
 * retain_until rather than being an unbounded table wipe.
 */
// The real tables' primary keys — NEITHER is `id` (route_errors: error_id;
// throttle_events: throttle_id; see their migrations' §1). A hardcoded
// `.select('id')` compiles to `DELETE ... RETURNING id`, which Postgres
// rejects wholesale (fail-honest, nothing deleted) when the column doesn't
// exist. Found live 2026-08-12 at first activation smoke, NOT by this
// battery, because the fake client's select() used to ignore its column
// argument entirely — closed below so a regression is catchable offline.
const VALID_SELECT_COLUMN: Record<string, string> = {
  route_errors: 'error_id',
  throttle_events: 'throttle_id',
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
            // `value` is CAPTURED, not discarded — a mutation that filters on
            // a shifted timestamp (e.g. now()+90d instead of now(), which would
            // delete active/live-retention rows rather than expired ones) must
            // be catchable by asserting on `calls[].value`, not just `.column`.
            lt(column: string, value: string) {
              return {
                select(cols: string) {
                  calls.push({ table, column, value, selectColumn: cols })
                  // Only validate the select() column when the caller hasn't
                  // scripted an explicit outcome — the (b)/(c)/(d) error-path
                  // cases below deliberately exercise classification of a
                  // GENUINE error, independent of which column was asked for.
                  // A successful outcome, though, must be earned against the
                  // real PK — this is what would have caught the live defect.
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
                  return Promise.resolve({
                    data: outcome.data ?? null,
                    error: outcome.error ?? null,
                  })
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

async function main(): Promise<void> {
  const priorSecret = process.env.CRON_SECRET
  const priorFlag = process.env[SWEEP_FLAG]

  // ==========================================================================
  // 1. CRON_SECRET unset ⇒ 503 (neither purge reached)
  // ==========================================================================
  {
    delete process.env.CRON_SECRET
    process.env[SWEEP_FLAG] = 'true' // even flag-on, no secret ⇒ 503 first
    const deps = makeDeps({ deleted: 9, error: null }, { deleted: 9, error: null })
    const res = await runObservabilityRetentionSweep(makeReq('Bearer whatever'), deps)
    assert(res.status === 503, 'CRON_SECRET unset → 503')
    const body = await res.json()
    assert(body.error && /not configured/i.test(body.error), '503 body names the missing secret')
    assert(deps.routeCalls === 0 && deps.throttleCalls === 0, '503 → neither purge called (no DB work)')
  }

  // ==========================================================================
  // 2. Bad / absent Bearer ⇒ 401 (neither purge reached)
  // ==========================================================================
  {
    process.env.CRON_SECRET = 'sekret'
    process.env[SWEEP_FLAG] = 'true'
    const deps = makeDeps({ deleted: 9, error: null }, { deleted: 9, error: null })

    const wrong = await runObservabilityRetentionSweep(makeReq('Bearer nope'), deps)
    assert(wrong.status === 401, 'wrong Bearer → 401')

    const absent = await runObservabilityRetentionSweep(makeReq(null), deps)
    assert(absent.status === 401, 'absent Authorization header → 401')

    assert(deps.routeCalls === 0 && deps.throttleCalls === 0, '401 → neither purge called (no DB work)')
  }

  // ==========================================================================
  // 3. Correct Bearer, flag UNSET ⇒ 200 { flag_enabled:false }, NO DB work
  // ==========================================================================
  {
    process.env.CRON_SECRET = 'sekret'
    delete process.env[SWEEP_FLAG]
    assert(isObservabilitySweepEnabled() === false, 'flag unset → isObservabilitySweepEnabled() false')
    const deps = makeDeps({ deleted: 9, error: null }, { deleted: 9, error: null })
    const res = await runObservabilityRetentionSweep(makeReq('Bearer sekret'), deps)
    assert(res.status === 200, 'flag unset (authed) → 200')
    const body = await res.json()
    assert(body.ok === true, 'flag-off body ok:true')
    assert(body.flag_enabled === false, 'flag-off body flag_enabled:false')
    assert(typeof body.note === 'string' && /unset/i.test(body.note), 'flag-off body carries the honest note')
    assert(body.deleted === undefined, 'flag-off body omits deleted (no purge)')
    assert(deps.routeCalls === 0 && deps.throttleCalls === 0, 'flag-off → neither purge called (strictly inert)')
  }

  // Flag present but not exactly 'true' ⇒ still inert (exact match).
  {
    process.env.CRON_SECRET = 'sekret'
    process.env[SWEEP_FLAG] = 'TRUE'
    assert(isObservabilitySweepEnabled() === false, "flag 'TRUE' → isObservabilitySweepEnabled() false")
    const deps = makeDeps({ deleted: 9, error: null }, { deleted: 9, error: null })
    const res = await runObservabilityRetentionSweep(makeReq('Bearer sekret'), deps)
    const body = await res.json()
    assert(res.status === 200 && body.flag_enabled === false, "flag 'TRUE' → inert (exact 'true' only)")
    assert(deps.routeCalls === 0 && deps.throttleCalls === 0, "flag 'TRUE' → neither purge called")
  }

  // ==========================================================================
  // 4. Correct Bearer, flag SET ⇒ 200 with a per-table deleted count
  // ==========================================================================
  {
    process.env.CRON_SECRET = 'sekret'
    process.env[SWEEP_FLAG] = 'true'
    assert(isObservabilitySweepEnabled() === true, "flag 'true' → isObservabilitySweepEnabled() true")
    const deps = makeDeps({ deleted: 4, error: null }, { deleted: 7, error: null })
    const res = await runObservabilityRetentionSweep(makeReq('Bearer sekret'), deps)
    assert(res.status === 200, 'flag set (authed) → 200')
    const body = await res.json()
    assert(body.ok === true, 'flag-on body ok:true')
    assert(body.flag_enabled === true, 'flag-on body flag_enabled:true')
    assert(body.deleted?.route_errors === 4, 'flag-on reports route_errors deleted count')
    assert(body.deleted?.throttle_events === 7, 'flag-on reports throttle_events deleted count')
    assert(Array.isArray(body.errors) && body.errors.length === 0, 'flag-on (clean) → empty errors')
    assert(deps.routeCalls === 1, 'flag-on → route_errors purge called exactly once (awaited)')
    assert(deps.throttleCalls === 1, 'flag-on → throttle_events purge called exactly once (awaited)')
  }

  // ==========================================================================
  // 5. Fail-honest — a purge error is REPORTED but the cron still returns 200
  //    (NOT fail-closed; a cron has no user-facing response to break).
  // ==========================================================================
  {
    process.env.CRON_SECRET = 'sekret'
    process.env[SWEEP_FLAG] = 'true'
    const deps = makeDeps({ deleted: 0, error: 'permission denied' }, { deleted: 0, error: 'permission denied' })
    const res = await runObservabilityRetentionSweep(makeReq('Bearer sekret'), deps)
    assert(res.status === 200, 'purge error → still 200 (fail-honest, not fail-closed)')
    const body = await res.json()
    assert(body.flag_enabled === true, 'purge error → flag_enabled stays true')
    assert(
      Array.isArray(body.errors) && body.errors.length === 2,
      'both purge errors surfaced in errors[] (no silent swallow)',
    )
    assert(
      body.errors.some((e: string) => /^route_errors:/.test(e)) &&
        body.errors.some((e: string) => /^throttle_events:/.test(e)),
      'each error is attributed to its table by name',
    )
  }

  // ==========================================================================
  // 6. INDEPENDENCE — the property this two-table route adds over the
  //    one-table precedent. A failure in the FIRST purge must not prevent the
  //    SECOND from running or from reporting its own successful deletion, and
  //    vice versa. Without this, one broken table silently stops the other's
  //    retention from being enforced — the exact class of gap C-1 exists to
  //    close, reintroduced one layer up.
  // ==========================================================================
  {
    process.env.CRON_SECRET = 'sekret'
    process.env[SWEEP_FLAG] = 'true'

    // First fails, second succeeds.
    const depsA = makeDeps({ deleted: 0, error: 'boom' }, { deleted: 5, error: null })
    const resA = await runObservabilityRetentionSweep(makeReq('Bearer sekret'), depsA)
    const bodyA = await resA.json()
    assert(depsA.throttleCalls === 1, 'route_errors failure → throttle_events purge STILL called')
    assert(bodyA.deleted?.throttle_events === 5, 'route_errors failure → throttle_events count still reported')
    assert(bodyA.errors.length === 1 && /^route_errors:/.test(bodyA.errors[0]), 'only the failing table is in errors[]')

    // Second fails, first succeeds.
    const depsB = makeDeps({ deleted: 3, error: null }, { deleted: 0, error: 'boom' })
    const resB = await runObservabilityRetentionSweep(makeReq('Bearer sekret'), depsB)
    const bodyB = await resB.json()
    assert(depsB.routeCalls === 1, 'throttle_events failure → route_errors purge still ran')
    assert(bodyB.deleted?.route_errors === 3, 'throttle_events failure → route_errors count still reported')
    assert(bodyB.errors.length === 1 && /^throttle_events:/.test(bodyB.errors[0]), 'only the failing table is in errors[]')
  }

  // ==========================================================================
  // 7. THE STORE PURGE FNS THEMSELVES (injected fake client) — the DELETE is
  //    filtered on retain_until; a missing TABLE is benign; a genuine error is
  //    NOT benign; a null admin client is reported rather than silently
  //    returning a false "0 purged, no error".
  // ==========================================================================
  {
    // (a) happy path — deletes filtered on retain_until, count from the rows.
    const beforeRoute = Date.now()
    const okRoute = makeFakeClient({ data: [{ id: 1 }, { id: 2 }] })
    const rRoute = await purgeExpiredRouteErrors(okRoute.client as never)
    const afterRoute = Date.now()
    assert(rRoute.deleted === 2 && rRoute.error === null, 'purgeExpiredRouteErrors → count from returned rows')
    assert(
      okRoute.calls.length === 1 && okRoute.calls[0].table === 'route_errors' && okRoute.calls[0].column === 'retain_until',
      'purgeExpiredRouteErrors DELETEs from route_errors filtered on retain_until (never unbounded)',
    )
    assert(
      okRoute.calls[0].selectColumn === 'error_id',
      'purgeExpiredRouteErrors selects the REAL primary key (error_id), never a generic "id" (2026-08-12 live defect)',
    )
    // The FILTER VALUE, not just the column name, must be pinned — a mutation
    // that filters on e.g. now()+90d (deleting rows NOT yet due, i.e. active
    // data) would still pass a column-name-only assertion. Adversarial-review-
    // found and reproduced directly: without this, that mutation silently
    // passed all other assertions in this file. The captured value must parse
    // as a real timestamp taken at call time (within this call's wall-clock
    // window), not some other epoch.
    {
      const t = new Date(okRoute.calls[0].value).getTime()
      assert(
        Number.isFinite(t) && t >= beforeRoute && t <= afterRoute,
        'purgeExpiredRouteErrors filters on the CURRENT time, not a shifted epoch (catches the now()+90d mutation)',
      )
    }

    const beforeThrottle = Date.now()
    const okThrottle = makeFakeClient({ data: [{ id: 1 }] })
    const rThrottle = await purgeExpiredThrottleEvents(okThrottle.client as never)
    const afterThrottle = Date.now()
    assert(rThrottle.deleted === 1 && rThrottle.error === null, 'purgeExpiredThrottleEvents → count from returned rows')
    assert(
      okThrottle.calls[0].table === 'throttle_events' && okThrottle.calls[0].column === 'retain_until',
      'purgeExpiredThrottleEvents DELETEs from throttle_events filtered on retain_until',
    )
    assert(
      okThrottle.calls[0].selectColumn === 'throttle_id',
      'purgeExpiredThrottleEvents selects the REAL primary key (throttle_id), never a generic "id" (2026-08-12 live defect)',
    )
    {
      const t = new Date(okThrottle.calls[0].value).getTime()
      assert(
        Number.isFinite(t) && t >= beforeThrottle && t <= afterThrottle,
        'purgeExpiredThrottleEvents filters on the CURRENT time, not a shifted epoch',
      )
    }

    // (b) missing TABLE (pre-migration deployment) ⇒ benign no-op, no error.
    const missing = makeFakeClient({ error: { message: 'relation "public.route_errors" does not exist' } })
    const rMissing = await purgeExpiredRouteErrors(missing.client as never)
    assert(rMissing.deleted === 0 && rMissing.error === null, 'missing table → benign no-op (0 deleted, no error)')

    const missingCache = makeFakeClient({ error: { message: "Could not find the table 'public.throttle_events' in the schema cache" } })
    const rMissingCache = await purgeExpiredThrottleEvents(missingCache.client as never)
    assert(rMissingCache.deleted === 0 && rMissingCache.error === null, 'PostgREST table-not-found → benign no-op')

    // (c) a missing COLUMN / genuine error must NOT be classified benign — the
    //     documented false-benign trap (memory `missing-table-benign-guards-
    //     load-bearing-writes`). A silent benign here would report a successful
    //     retention sweep that deleted nothing, forever.
    const columnErr = makeFakeClient({
      error: { message: "Could not find the 'retain_until' column of 'route_errors' in the schema cache" },
    })
    const rColumn = await purgeExpiredRouteErrors(columnErr.client as never)
    assert(
      rColumn.deleted === 0 && typeof rColumn.error === 'string' && /retain_until/.test(rColumn.error),
      'missing COLUMN → reported as a real error, never benign',
    )

    const genuine = makeFakeClient({ error: { message: 'permission denied for table throttle_events' } })
    const rGenuine = await purgeExpiredThrottleEvents(genuine.client as never)
    assert(
      rGenuine.deleted === 0 && typeof rGenuine.error === 'string' && /permission denied/.test(rGenuine.error),
      'genuine DB error → reported, never benign',
    )

    // (d) no service-role credentials ⇒ honest error, NOT a false clean sweep.
    const priorUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const priorKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    delete process.env.NEXT_PUBLIC_SUPABASE_URL
    delete process.env.SUPABASE_SERVICE_ROLE_KEY
    const rNoClient = await purgeExpiredRouteErrors()
    assert(
      rNoClient.deleted === 0 && typeof rNoClient.error === 'string' && /admin client/i.test(rNoClient.error),
      'no admin client → honest error, not a false clean sweep',
    )
    if (priorUrl === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_URL
    else process.env.NEXT_PUBLIC_SUPABASE_URL = priorUrl
    if (priorKey === undefined) delete process.env.SUPABASE_SERVICE_ROLE_KEY
    else process.env.SUPABASE_SERVICE_ROLE_KEY = priorKey

    // (e) a rejection carrying a NON-Error value (e.g. `Promise.reject()` with
    //     no argument, which rejects with `undefined`) must not crash the
    //     catch block itself. Adversarial-review-found: `(e as Error).message`
    //     on a non-Error `e` throws a FRESH, uncaught error from inside the
    //     handler that nothing above wraps — the exact fail-CLOSED escape this
    //     function's whole design exists to prevent. Reproduced directly
    //     before the fix; this pins the fix, not just the interface.
    const throwsUndefined = {
      from() {
        return {
          delete() {
            return {
              lt() {
                return { select: () => Promise.reject(undefined) }
              },
            }
          },
        }
      },
    }
    const rThrowsUndefined = await purgeExpiredRouteErrors(throwsUndefined as never)
    assert(
      rThrowsUndefined.deleted === 0 &&
        typeof rThrowsUndefined.error === 'string' &&
        /threw:\s*undefined/.test(rThrowsUndefined.error),
      'a rejection with a non-Error value (undefined) is caught honestly, not re-thrown',
    )
  }

  // ==========================================================================
  // 8. PRODUCTION binding — GET goes through the REAL purge fns (DEFAULT_DEPS),
  //    not injected spies. With the Supabase env removed the real purges cannot
  //    build a client; the cron MUST still return 200 with both errors reported
  //    (fail-honest end-to-end), proving GET binds the real fns and no throw
  //    escapes as a 500. This is the production path minus nothing.
  // ==========================================================================
  {
    process.env.CRON_SECRET = 'sekret'
    process.env[SWEEP_FLAG] = 'true'
    const priorUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const priorKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    delete process.env.NEXT_PUBLIC_SUPABASE_URL
    delete process.env.SUPABASE_SERVICE_ROLE_KEY
    const res = await GET(makeReq('Bearer sekret'))
    assert(res.status === 200, 'GET (real purges, missing env) → 200 (no 500 escape)')
    const body = await res.json()
    assert(
      body.flag_enabled === true && body.deleted?.route_errors === 0 && body.deleted?.throttle_events === 0,
      'GET real-purge path → flag_enabled:true, both counts 0',
    )
    assert(
      Array.isArray(body.errors) && body.errors.length === 2,
      'GET real-purge path → fail-honest, BOTH tables reported (proves GET binds both real fns)',
    )
    if (priorUrl === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_URL
    else process.env.NEXT_PUBLIC_SUPABASE_URL = priorUrl
    if (priorKey === undefined) delete process.env.SUPABASE_SERVICE_ROLE_KEY
    else process.env.SUPABASE_SERVICE_ROLE_KEY = priorKey
  }

  // ── Restore baseline env ────────────────────────────────────────────────────
  if (priorSecret === undefined) delete process.env.CRON_SECRET
  else process.env.CRON_SECRET = priorSecret
  if (priorFlag === undefined) delete process.env[SWEEP_FLAG]
  else process.env[SWEEP_FLAG] = priorFlag

  // ==========================================================================
  // Tally
  // ==========================================================================
  console.log(`\n${passed} passed, ${failed} failed`)
  if (failed > 0) {
    console.error('\nFailures:')
    for (const f of failures) console.error('  - ' + f)
    process.exit(1)
  }
}

void main()
