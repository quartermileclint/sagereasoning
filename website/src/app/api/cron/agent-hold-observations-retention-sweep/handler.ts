/**
 * handler.ts — the testable implementation behind
 * GET /api/cron/agent-hold-observations-retention-sweep.
 *
 * WHY THIS IS A SEPARATE MODULE: a Next.js `route.ts` may export ONLY the HTTP
 * method handlers (GET/POST/…) and route-segment config. Exporting the injectable
 * handler or its deps type from route.ts fails Next's route-export validation at
 * `next build` — which `tsc --noEmit` and the tsx tests do NOT run (memory
 * `nextjs-route-export-validation`). So the handler + its dependency seam live here;
 * route.ts is a thin GET wrapper.
 *
 * Structure mirrors ../observability-retention-sweep/handler.ts, with ONE purge.
 *
 * PR24 (retention parity): `agent_hold_observations` has declared `retain_until`
 * since 2026-07-12 with nothing enforcing it. This is the enforcement. The
 * `stoa_entries` half of PR24's grounding sentence is FACTUALLY WRONG and is
 * corrected in the same commit — that table deliberately has no `retain_until` by
 * binding mentor ruling #24/Q9 ("silent expiry is prohibited").
 *
 * DARK: no flag is set and NO vercel.json cron entry ships with this build.
 * Scheduling and activation are R4, each its own founder-walked step.
 */
import { NextRequest, NextResponse } from 'next/server'
import {
  isHoldObservationsSweepEnabled,
  purgeExpiredHoldObservations,
} from '@/lib/agent-hold-observations-store'

/** The purge dependency, injectable for unit tests (the handler reaches the DB only
 *  through this seam, so the flag-on branch is testable without a Supabase client).
 *  Production GET binds the real, awaited store fn. */
export type HoldObservationsSweepDeps = {
  purgeHoldObservations: () => Promise<{ deleted: number; error: string | null }>
}

export const DEFAULT_DEPS: HoldObservationsSweepDeps = {
  purgeHoldObservations: purgeExpiredHoldObservations,
}

export async function runHoldObservationsRetentionSweep(
  request: NextRequest,
  deps: HoldObservationsSweepDeps = DEFAULT_DEPS,
): Promise<NextResponse> {
  // ── Cron auth (identical gate to the four existing sweeps) ────────────────
  const cronSecret = process.env.CRON_SECRET || ''
  if (!cronSecret) {
    return NextResponse.json(
      { error: 'Cron is not configured (CRON_SECRET unset).' },
      { status: 503 },
    )
  }
  const authHeader = request.headers.get('authorization') || ''
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // ── Flag posture ──────────────────────────────────────────────────────────
  // Unset ⇒ dormant; report honestly and do NO DB work. The route is strictly
  // inert until the founder elects activation. Rollback = unset the flag.
  if (!isHoldObservationsSweepEnabled()) {
    return NextResponse.json(
      {
        ok: true,
        ran_at: new Date().toISOString(),
        flag_enabled: false,
        note: 'SUBSTRATE_HOLD_OBSERVATIONS_SWEEP_ENABLED unset — retention sweep inactive; nothing purged.',
      },
      { status: 200 },
    )
  }

  // ── Purge (awaited — KG1, no fire-and-forget) ─────────────────────────────
  const holdObservations = await deps.purgeHoldObservations()

  const errors: string[] = []
  if (holdObservations.error) errors.push(`agent_hold_observations: ${holdObservations.error}`)

  // `ok` stays true even when the purge errors: this is a cron, the response has no
  // user, and a 500 would make the failure LESS visible than a named error string in
  // a logged body. The error is never swallowed — it is reported.
  return NextResponse.json(
    {
      ok: true,
      ran_at: new Date().toISOString(),
      flag_enabled: true,
      deleted: {
        agent_hold_observations: holdObservations.deleted,
      },
      errors,
    },
    { status: 200 },
  )
}
