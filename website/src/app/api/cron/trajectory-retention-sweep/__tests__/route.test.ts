/**
 * route.test.ts — /api/cron/trajectory-retention-sweep invariant tests
 * (CI-5; the M6-P2 retention-sweep gate, 2026-06-14; extended slice 2,
 * 2026-08-26, to cover the two new provenance-ledger purges).
 *
 * Plain-assertion script run with: npx tsx <this file>   (no --env-file, no DB —
 * the handler reaches the DB only through THREE INJECTED purge deps, so 503/401/
 * every flag combination is exercised without a Supabase client or the network).
 * Async sections run inside main() (this project's tsx targets CJS — no
 * top-level await). Mirrors the public-key route test's harness.
 *
 * Coverage (scope-doc §6, extended by the slice-2 prompt's Step 6 item 3):
 * CRON_SECRET unset ⇒ 503; bad/absent Bearer ⇒ 401; trajectory flag unset ⇒
 * trajectory purge never called (but the two ledger purges still called,
 * each self-gating internally); trajectory flag set ⇒ trajectory purge
 * called; fail-honest (a purge error is reported in `errors` but the cron
 * still returns 200 — NOT fail-closed); the THREE purges are INDEPENDENT
 * (one erroring never suppresses or skips another — mirrors
 * observability-retention-sweep's route.test.ts §6); and the round-6 ruling's
 * headline property: the ledger purges are called and their OWN flag governs
 * their behaviour REGARDLESS of the trajectory sweep flag's state (both
 * off, both on, and each on with the other off).
 *
 * AC: the route is invoked via its exported handler in each case; assertions
 * confirm the auth gate, per-purge independence, and the purge contract.
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

type PurgeResult = { deleted: number; error: string | null }

// A three-purge spy set: records calls per purge; returns configurable results.
// The real DB purges are covered in agent-assessment-history-store.test.ts and
// provenance-ledger-store.test.ts with injected clients.
function makeDeps(results: {
  trajectory?: PurgeResult
  provenanceLedger?: PurgeResult
  provenanceGaps?: PurgeResult
}): SweepDeps & { calls: { trajectory: number; provenanceLedger: number; provenanceGaps: number } } {
  const calls = { trajectory: 0, provenanceLedger: 0, provenanceGaps: 0 }
  return {
    calls,
    purgeTrajectory: async () => {
      calls.trajectory += 1
      return results.trajectory ?? { deleted: 0, error: null }
    },
    purgeProvenanceLedger: async () => {
      calls.provenanceLedger += 1
      return results.provenanceLedger ?? { deleted: 0, error: null }
    },
    purgeProvenanceGaps: async () => {
      calls.provenanceGaps += 1
      return results.provenanceGaps ?? { deleted: 0, error: null }
    },
  }
}

const SWEEP_FLAG = 'SUBSTRATE_TRAJECTORY_SWEEP_ENABLED'
const LEDGER_FLAG = 'SUBSTRATE_PROVENANCE_LEDGER_ENABLED'

async function main(): Promise<void> {
  const priorSecret = process.env.CRON_SECRET
  const priorSweepFlag = process.env[SWEEP_FLAG]
  const priorLedgerFlag = process.env[LEDGER_FLAG]

  // ==========================================================================
  // 1. CRON_SECRET unset ⇒ 503 (and NO purge is ever reached)
  // ==========================================================================
  {
    delete process.env.CRON_SECRET
    process.env[SWEEP_FLAG] = 'true'
    const deps = makeDeps({ trajectory: { deleted: 9, error: null } })
    const res = await runTrajectoryRetentionSweep(makeReq('Bearer whatever'), deps)
    assert(res.status === 503, 'CRON_SECRET unset → 503')
    const body = await res.json()
    assert(body.error && /not configured/i.test(body.error), '503 body names the missing secret')
    assert(
      deps.calls.trajectory === 0 && deps.calls.provenanceLedger === 0 && deps.calls.provenanceGaps === 0,
      '503 → no purge ever called (no DB work)',
    )
  }

  // ==========================================================================
  // 2. Bad / absent Bearer ⇒ 401 (no purge reached)
  // ==========================================================================
  {
    process.env.CRON_SECRET = 'sekret'
    process.env[SWEEP_FLAG] = 'true'
    const deps = makeDeps({ trajectory: { deleted: 9, error: null } })

    const wrong = await runTrajectoryRetentionSweep(makeReq('Bearer nope'), deps)
    assert(wrong.status === 401, 'wrong Bearer → 401')

    const absent = await runTrajectoryRetentionSweep(makeReq(null), deps)
    assert(absent.status === 401, 'absent Authorization header → 401')

    assert(
      deps.calls.trajectory === 0 && deps.calls.provenanceLedger === 0 && deps.calls.provenanceGaps === 0,
      '401 → no purge ever called (no DB work)',
    )
  }

  // ==========================================================================
  // 3. Trajectory flag UNSET ⇒ trajectory purge NEVER called, but the two
  //    ledger purges ARE STILL CALLED (round-6 ruling, Q6 — they self-gate
  //    on their OWN flag, never on the trajectory sweep's).
  // ==========================================================================
  {
    process.env.CRON_SECRET = 'sekret'
    delete process.env[SWEEP_FLAG]
    delete process.env[LEDGER_FLAG]
    const deps = makeDeps({})
    const res = await runTrajectoryRetentionSweep(makeReq('Bearer sekret'), deps)
    assert(res.status === 200, 'trajectory flag unset (authed) → 200')
    const body = await res.json()
    assert(body.ok === true, 'body ok:true')
    assert(body.flag_enabled.trajectory === false, 'flag_enabled.trajectory:false')
    assert(body.flag_enabled.provenance_ledger === false, 'flag_enabled.provenance_ledger:false (also unset)')
    assert(body.deleted.trajectory === 0, 'deleted.trajectory:0 (purge never ran)')
    assert(deps.calls.trajectory === 0, 'trajectory purge NOT called when its flag is unset')
    assert(
      deps.calls.provenanceLedger === 1 && deps.calls.provenanceGaps === 1,
      'BOTH ledger purges are STILL called even though the trajectory flag is off — they self-gate internally',
    )
  }

  // Flag present but not exactly 'true' (e.g. 'TRUE') ⇒ trajectory purge still inert.
  {
    process.env.CRON_SECRET = 'sekret'
    process.env[SWEEP_FLAG] = 'TRUE'
    const deps = makeDeps({})
    const res = await runTrajectoryRetentionSweep(makeReq('Bearer sekret'), deps)
    const body = await res.json()
    assert(res.status === 200 && body.flag_enabled.trajectory === false, "trajectory flag 'TRUE' → inert (exact 'true' only)")
    assert(deps.calls.trajectory === 0, "trajectory flag 'TRUE' → trajectory purge never called")
  }

  // ==========================================================================
  // 4. Trajectory flag SET, ledger flag UNSET ⇒ trajectory purge runs, ledger
  //    purges are STILL CALLED (their own internal no-op, per round-6 Q6) —
  //    the headline independence property, in the opposite direction from #3.
  // ==========================================================================
  {
    process.env.CRON_SECRET = 'sekret'
    process.env[SWEEP_FLAG] = 'true'
    delete process.env[LEDGER_FLAG]
    const deps = makeDeps({ trajectory: { deleted: 4, error: null } })
    const res = await runTrajectoryRetentionSweep(makeReq('Bearer sekret'), deps)
    assert(res.status === 200, 'trajectory flag set (authed) → 200')
    const body = await res.json()
    assert(body.flag_enabled.trajectory === true, 'flag_enabled.trajectory:true')
    assert(body.flag_enabled.provenance_ledger === false, 'flag_enabled.provenance_ledger:false (ledger flag unset)')
    assert(body.deleted.trajectory === 4, 'deleted.trajectory reports the trajectory purge count')
    assert(Array.isArray(body.errors) && body.errors.length === 0, '(clean) → empty errors')
    assert(deps.calls.trajectory === 1, 'trajectory purge called exactly once (awaited)')
    assert(deps.calls.provenanceLedger === 1 && deps.calls.provenanceGaps === 1, 'ledger purges still called (self-gate to a no-op)')
  }

  // ==========================================================================
  // 5. BOTH flags SET ⇒ all three purges run and report their own counts.
  // ==========================================================================
  {
    process.env.CRON_SECRET = 'sekret'
    process.env[SWEEP_FLAG] = 'true'
    process.env[LEDGER_FLAG] = 'true'
    const deps = makeDeps({
      trajectory: { deleted: 4, error: null },
      provenanceLedger: { deleted: 2, error: null },
      provenanceGaps: { deleted: 1, error: null },
    })
    const res = await runTrajectoryRetentionSweep(makeReq('Bearer sekret'), deps)
    const body = await res.json()
    assert(res.status === 200, 'both flags set → 200')
    assert(body.flag_enabled.trajectory === true && body.flag_enabled.provenance_ledger === true, 'both flag_enabled true')
    assert(
      body.deleted.trajectory === 4 && body.deleted.provenance_ledger === 2 && body.deleted.provenance_gaps === 1,
      'all three deleted counts reported correctly',
    )
    assert(Array.isArray(body.errors) && body.errors.length === 0, 'both flags set (clean) → empty errors')
  }

  // ==========================================================================
  // 6. Fail-honest + INDEPENDENCE — one purge erroring must not suppress or
  //    skip the others (mirrors observability-retention-sweep route.test §6).
  //    Tested three ways, one per purge, to prove none of the three can block
  //    a sibling.
  // ==========================================================================
  {
    process.env.CRON_SECRET = 'sekret'
    process.env[SWEEP_FLAG] = 'true'
    process.env[LEDGER_FLAG] = 'true'

    // 6a — trajectory errors; both ledger purges still run and succeed.
    {
      const deps = makeDeps({
        trajectory: { deleted: 0, error: 'permission denied' },
        provenanceLedger: { deleted: 3, error: null },
        provenanceGaps: { deleted: 2, error: null },
      })
      const res = await runTrajectoryRetentionSweep(makeReq('Bearer sekret'), deps)
      const body = await res.json()
      assert(res.status === 200, 'trajectory error → still 200 (fail-honest, not fail-closed)')
      assert(
        deps.calls.provenanceLedger === 1 && deps.calls.provenanceGaps === 1,
        'trajectory erroring does not suppress the ledger purges',
      )
      assert(
        body.deleted.provenance_ledger === 3 && body.deleted.provenance_gaps === 2,
        'sibling purge counts still reported correctly despite the trajectory error',
      )
      assert(
        Array.isArray(body.errors) && body.errors.length === 1 && /trajectory:.*permission denied/.test(body.errors[0]),
        'trajectory error surfaced, attributed to the right table, no silent swallow',
      )
    }

    // 6b — provenance_ledger errors; trajectory and provenance_gaps unaffected.
    {
      const deps = makeDeps({
        trajectory: { deleted: 4, error: null },
        provenanceLedger: { deleted: 0, error: 'transient network error' },
        provenanceGaps: { deleted: 2, error: null },
      })
      const res = await runTrajectoryRetentionSweep(makeReq('Bearer sekret'), deps)
      const body = await res.json()
      assert(res.status === 200, 'provenance_ledger error → still 200')
      assert(deps.calls.trajectory === 1 && deps.calls.provenanceGaps === 1, 'siblings still called')
      assert(body.deleted.trajectory === 4 && body.deleted.provenance_gaps === 2, 'sibling counts unaffected')
      assert(
        Array.isArray(body.errors) &&
          body.errors.length === 1 &&
          /provenance_ledger:.*transient network error/.test(body.errors[0]),
        'provenance_ledger error surfaced, attributed correctly',
      )
    }

    // 6c — provenance_gaps errors; the other two unaffected.
    {
      const deps = makeDeps({
        trajectory: { deleted: 4, error: null },
        provenanceLedger: { deleted: 3, error: null },
        provenanceGaps: { deleted: 0, error: 'constraint violation' },
      })
      const res = await runTrajectoryRetentionSweep(makeReq('Bearer sekret'), deps)
      const body = await res.json()
      assert(res.status === 200, 'provenance_gaps error → still 200')
      assert(deps.calls.trajectory === 1 && deps.calls.provenanceLedger === 1, 'siblings still called')
      assert(body.deleted.trajectory === 4 && body.deleted.provenance_ledger === 3, 'sibling counts unaffected')
      assert(
        Array.isArray(body.errors) &&
          body.errors.length === 1 &&
          /provenance_gaps:.*constraint violation/.test(body.errors[0]),
        'provenance_gaps error surfaced, attributed correctly',
      )
    }

    // 6d — ALL THREE error at once; all three reported, none swallowed.
    {
      const deps = makeDeps({
        trajectory: { deleted: 0, error: 'err-a' },
        provenanceLedger: { deleted: 0, error: 'err-b' },
        provenanceGaps: { deleted: 0, error: 'err-c' },
      })
      const res = await runTrajectoryRetentionSweep(makeReq('Bearer sekret'), deps)
      const body = await res.json()
      assert(res.status === 200, 'all three erroring → still 200')
      assert(Array.isArray(body.errors) && body.errors.length === 3, 'all three errors surfaced, none swallowed')
    }
  }

  // ==========================================================================
  // 7. PRODUCTION binding — GET goes through the REAL purge functions
  //    (DEFAULT_DEPS), not injected spies. With the Supabase env removed, the
  //    real purges' getAdminClient() throws (trajectory + both ledger purges,
  //    the latter only if their own flag is on); the cron MUST still return
  //    200 with every error reported (fail-honest end-to-end), proving GET
  //    binds the real fns and no throw escapes as a 500.
  // ==========================================================================
  {
    process.env.CRON_SECRET = 'sekret'
    process.env[SWEEP_FLAG] = 'true'
    process.env[LEDGER_FLAG] = 'true'
    const priorUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const priorKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    delete process.env.NEXT_PUBLIC_SUPABASE_URL
    delete process.env.SUPABASE_SERVICE_ROLE_KEY
    const res = await GET(makeReq('Bearer sekret'))
    assert(res.status === 200, 'GET (real purges, missing env) → 200 (no 500 escape)')
    const body = await res.json()
    assert(
      body.deleted.trajectory === 0 && body.deleted.provenance_ledger === 0 && body.deleted.provenance_gaps === 0,
      'GET real-purge path → all deleted counts 0 on throw',
    )
    assert(
      Array.isArray(body.errors) && body.errors.length === 3,
      'GET real-purge path → all three failures reported (fail-honest, no throw escape)',
    )
    if (priorUrl === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_URL
    else process.env.NEXT_PUBLIC_SUPABASE_URL = priorUrl
    if (priorKey === undefined) delete process.env.SUPABASE_SERVICE_ROLE_KEY
    else process.env.SUPABASE_SERVICE_ROLE_KEY = priorKey
  }

  // ── Restore baseline env ────────────────────────────────────────────────────
  if (priorSecret === undefined) delete process.env.CRON_SECRET
  else process.env.CRON_SECRET = priorSecret
  if (priorSweepFlag === undefined) delete process.env[SWEEP_FLAG]
  else process.env[SWEEP_FLAG] = priorSweepFlag
  if (priorLedgerFlag === undefined) delete process.env[LEDGER_FLAG]
  else process.env[LEDGER_FLAG] = priorLedgerFlag

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
