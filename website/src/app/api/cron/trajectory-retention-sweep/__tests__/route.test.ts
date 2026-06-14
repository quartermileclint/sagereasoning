/**
 * route.test.ts — /api/cron/trajectory-retention-sweep invariant tests
 * (CI-5; the M6-P2 retention-sweep gate, 2026-06-14).
 *
 * Plain-assertion script run with: npx tsx <this file>   (no --env-file, no DB —
 * the handler reaches the DB only through an INJECTED purge dep, so 503/401/
 * flag-off/flag-on are all exercised without a Supabase client or the network).
 * Async sections run inside main() (this project's tsx targets CJS — no
 * top-level await). Mirrors the public-key route test's harness.
 *
 * Coverage (scope-doc §6): CRON_SECRET unset ⇒ 503; bad/absent Bearer ⇒ 401;
 * flag unset ⇒ 200 { flag_enabled:false } with NO DB work (purge never called);
 * flag set ⇒ 200 { flag_enabled:true, deleted:N }; fail-honest (a purge error is
 * reported in `errors` but the cron still returns 200 — NOT fail-closed).
 *
 * AC: the route is invoked via its exported handler in each case; assertions
 * confirm the auth gate, the dedicated-flag short-circuit, and the purge contract.
 * PR6 not engaged (no distress/R20a surface).
 */

import type { NextRequest } from 'next/server'
import { GET } from '../route'
import { runTrajectoryRetentionSweep, type SweepDeps } from '../handler'

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

// A purge spy: records calls; returns a configurable result. The real DB purge is
// covered in agent-assessment-history-store.test.ts (§8) with an injected client.
function makePurge(result: { deleted: number; error: string | null }): SweepDeps & { calls: number } {
  const spy = {
    calls: 0,
    purge: async (): Promise<{ deleted: number; error: string | null }> => {
      spy.calls += 1
      return result
    },
  }
  return spy
}

const SWEEP_FLAG = 'SUBSTRATE_TRAJECTORY_SWEEP_ENABLED'

async function main(): Promise<void> {
  const priorSecret = process.env.CRON_SECRET
  const priorFlag = process.env[SWEEP_FLAG]

  // ==========================================================================
  // 1. CRON_SECRET unset ⇒ 503 (and the purge is never reached)
  // ==========================================================================
  {
    delete process.env.CRON_SECRET
    process.env[SWEEP_FLAG] = 'true' // even with the flag on, no secret ⇒ 503 first
    const deps = makePurge({ deleted: 9, error: null })
    const res = await runTrajectoryRetentionSweep(makeReq('Bearer whatever'), deps)
    assert(res.status === 503, 'CRON_SECRET unset → 503')
    const body = await res.json()
    assert(body.error && /not configured/i.test(body.error), '503 body names the missing secret')
    assert(deps.calls === 0, '503 → purge never called (no DB work)')
  }

  // ==========================================================================
  // 2. Bad / absent Bearer ⇒ 401 (purge never reached)
  // ==========================================================================
  {
    process.env.CRON_SECRET = 'sekret'
    process.env[SWEEP_FLAG] = 'true'
    const deps = makePurge({ deleted: 9, error: null })

    const wrong = await runTrajectoryRetentionSweep(makeReq('Bearer nope'), deps)
    assert(wrong.status === 401, 'wrong Bearer → 401')

    const absent = await runTrajectoryRetentionSweep(makeReq(null), deps)
    assert(absent.status === 401, 'absent Authorization header → 401')

    assert(deps.calls === 0, '401 → purge never called (no DB work)')
  }

  // ==========================================================================
  // 3. Correct Bearer, flag UNSET ⇒ 200 { flag_enabled:false }, NO DB work
  // ==========================================================================
  {
    process.env.CRON_SECRET = 'sekret'
    delete process.env[SWEEP_FLAG]
    const deps = makePurge({ deleted: 9, error: null })
    const res = await runTrajectoryRetentionSweep(makeReq('Bearer sekret'), deps)
    assert(res.status === 200, 'flag unset (authed) → 200')
    const body = await res.json()
    assert(body.ok === true, 'flag-off body ok:true')
    assert(body.flag_enabled === false, 'flag-off body flag_enabled:false')
    assert(typeof body.note === 'string' && /unset/i.test(body.note), 'flag-off body carries the honest note')
    assert(body.deleted === undefined, 'flag-off body omits deleted (no purge)')
    assert(deps.calls === 0, 'flag-off → purge never called (strictly inert)')
  }

  // Flag present but not exactly 'true' (e.g. 'TRUE') ⇒ still inert (exact match).
  {
    process.env.CRON_SECRET = 'sekret'
    process.env[SWEEP_FLAG] = 'TRUE'
    const deps = makePurge({ deleted: 9, error: null })
    const res = await runTrajectoryRetentionSweep(makeReq('Bearer sekret'), deps)
    const body = await res.json()
    assert(res.status === 200 && body.flag_enabled === false, "flag 'TRUE' → inert (exact 'true' only)")
    assert(deps.calls === 0, "flag 'TRUE' → purge never called")
  }

  // ==========================================================================
  // 4. Correct Bearer, flag SET ⇒ 200 { flag_enabled:true, deleted:N }
  // ==========================================================================
  {
    process.env.CRON_SECRET = 'sekret'
    process.env[SWEEP_FLAG] = 'true'
    const deps = makePurge({ deleted: 4, error: null })
    const res = await runTrajectoryRetentionSweep(makeReq('Bearer sekret'), deps)
    assert(res.status === 200, 'flag set (authed) → 200')
    const body = await res.json()
    assert(body.ok === true, 'flag-on body ok:true')
    assert(body.flag_enabled === true, 'flag-on body flag_enabled:true')
    assert(body.deleted === 4, 'flag-on body reports deleted count from the purge')
    assert(Array.isArray(body.errors) && body.errors.length === 0, 'flag-on (clean) → empty errors')
    assert(deps.calls === 1, 'flag-on → purge called exactly once (awaited)')
  }

  // ==========================================================================
  // 5. Fail-honest — a purge error is REPORTED but the cron still returns 200
  //    (NOT fail-closed; a cron has no user-facing response to break — contrast
  //    CI-10 gate metering, which fails closed).
  // ==========================================================================
  {
    process.env.CRON_SECRET = 'sekret'
    process.env[SWEEP_FLAG] = 'true'
    const deps = makePurge({ deleted: 0, error: 'permission denied' })
    const res = await runTrajectoryRetentionSweep(makeReq('Bearer sekret'), deps)
    assert(res.status === 200, 'purge error → still 200 (fail-honest, not fail-closed)')
    const body = await res.json()
    assert(body.flag_enabled === true && body.deleted === 0, 'purge error → flag_enabled:true, deleted:0')
    assert(
      Array.isArray(body.errors) && body.errors.length === 1 && /permission denied/.test(body.errors[0]),
      'purge error surfaced in errors[] (no silent swallow)',
    )
  }

  // ==========================================================================
  // 6. PRODUCTION binding — GET goes through the REAL purgeExpiredTrajectory
  //    (DEFAULT_DEPS), not an injected spy. With the Supabase env removed the real
  //    purge's getAdminClient() throws; the cron MUST still return 200 with the
  //    error reported (fail-honest end-to-end), proving GET binds the real fn and
  //    no throw escapes as a 500. This is the production path minus nothing.
  // ==========================================================================
  {
    process.env.CRON_SECRET = 'sekret'
    process.env[SWEEP_FLAG] = 'true'
    const priorUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const priorKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    delete process.env.NEXT_PUBLIC_SUPABASE_URL
    delete process.env.SUPABASE_SERVICE_ROLE_KEY
    const res = await GET(makeReq('Bearer sekret'))
    assert(res.status === 200, 'GET (real purge, missing env) → 200 (no 500 escape)')
    const body = await res.json()
    assert(body.flag_enabled === true && body.deleted === 0, 'GET real-purge path → flag_enabled:true, deleted:0')
    assert(
      Array.isArray(body.errors) && body.errors.length === 1 && /threw|admin client/i.test(body.errors[0]),
      'GET real-purge path → fail-honest (getAdminClient throw caught + reported)',
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
