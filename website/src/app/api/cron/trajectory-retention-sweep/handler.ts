/**
 * handler.ts — the testable implementation behind GET /api/cron/trajectory-retention-sweep.
 *
 * WHY THIS IS A SEPARATE MODULE: a Next.js `route.ts` may export ONLY the HTTP
 * method handlers (GET/POST/…) and route-segment config (dynamic, maxDuration,
 * …). Exporting the injectable handler or its deps type from route.ts fails the
 * Next route-export validation at `next build` (NOT caught by `tsc --noEmit`).
 * So the handler + its dependency seam live here; route.ts is a thin GET wrapper.
 *
 * The dependency seam (SweepDeps.purge) lets the route test exercise the flag-on
 * DB branch with an injected purge — no Supabase client, no network — while the
 * production GET binds the real, awaited, direct-import purgeExpiredTrajectory.
 */
import { NextRequest, NextResponse } from 'next/server'
import {
  isTrajectorySweepEnabled,
  purgeExpiredTrajectory,
} from '@/lib/substrate/agent-assessment-history-store'

/** The purge dependency, injectable for unit tests (the handler reaches the DB
 *  only through this seam, so the flag-on branch is testable without a Supabase
 *  client). Production GET binds the real, awaited, direct-import store fn. */
export type SweepDeps = {
  purge: () => Promise<{ deleted: number; error: string | null }>
}

export const DEFAULT_DEPS: SweepDeps = { purge: purgeExpiredTrajectory }

/**
 * The testable sweep handler. `route.ts`'s GET binds the real purge dep; tests
 * call this directly with a fake request + an injected purge, so 503/401/flag-off/
 * flag-on are all exercised with no DB and no network.
 */
export async function runTrajectoryRetentionSweep(
  request: NextRequest,
  deps: SweepDeps = DEFAULT_DEPS,
): Promise<NextResponse> {
  // ── Cron auth (identical gate to /api/cron/narrative-sweep + observability) ──
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

  // ── Flag posture ────────────────────────────────────────────────────────────
  // Unset ⇒ the sweep is dormant; report honestly and do NO DB work (the route is
  // strictly inert until the founder elects activation). Rollback = unset.
  if (!isTrajectorySweepEnabled()) {
    return NextResponse.json(
      {
        ok: true,
        ran_at: new Date().toISOString(),
        flag_enabled: false,
        note: 'SUBSTRATE_TRAJECTORY_SWEEP_ENABLED unset — retention sweep inactive; nothing purged.',
      },
      { status: 200 },
    )
  }

  // ── Purge (awaited; KG1 — no fire-and-forget) ───────────────────────────────
  const purge = await deps.purge()

  return NextResponse.json(
    {
      ok: true,
      ran_at: new Date().toISOString(),
      flag_enabled: true,
      deleted: purge.deleted,
      errors: purge.error ? [`purge: ${purge.error}`] : [],
    },
    { status: 200 },
  )
}
