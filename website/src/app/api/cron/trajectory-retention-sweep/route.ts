/**
 * GET /api/cron/trajectory-retention-sweep — R17c retention enforcement for the
 * agent trajectory store (CI-5; the M6-P2 gate).
 *
 * agent_assessment_history (M6) carries a 90-day `retain_until` (migration:121).
 * For the null-owner external-consumer rows the M6 write flag starts creating,
 * `retain_until` is the PRIMARY genuine-deletion mechanism (those rows are not
 * reachable by the user-JWT data-rights paths). NOTHING enforces it without this
 * cron. The hard rule (next-session prompt ⛔): this sweep must be BUILT, FLAGGED
 * ON, and SCHEDULED before SUBSTRATE_TRAJECTORY_WRITE_ENABLED is set in production
 * — otherwise rows accrue with no enforced deletion (the exact gap M6-P2 is held
 * for). See operations/p1-rebuild-2026-06/trajectory-retention-sweep-scope.md.
 *
 * Mirrors /api/cron/narrative-sweep exactly (the proven M1 precedent), minus the
 * LLM-regeneration scaffolding — this sweep is purge-only:
 *   • Auth: the same CRON_SECRET gate (503 if unset; 401 on a bad Bearer).
 *   • Flag: a DEDICATED kill-switch (SUBSTRATE_TRAJECTORY_SWEEP_ENABLED), separate
 *     from the write flag so it can go live BEFORE M6-P2. Unset ⇒ honest
 *     { flag_enabled: false } 200, no DB work.
 *   • Purge: purgeExpiredTrajectory() by DIRECT IMPORT, awaited (KG1 rule 1 — no
 *     HTTP self-call; nothing here is token-gated the way the observability
 *     evaluators are). A bounded, indexed DELETE on idx_aah_retain_until.
 *   • Fail-honest: a failed DELETE is caught and returned in the JSON — NO
 *     fail-closed (contrast CI-10; a cron has no user-facing response to break).
 *
 * NO vercel.json cron entry ships with this build — scheduling is a deployment-
 * configuration change and rides the founder's 0c-ii activation step (scope §4:
 * "0 8 * * *", matching the observability cron). Until then the route exists, is
 * secret-gated, and is invoked manually.
 *
 * NEVER on the /api/reason critical path. PR6 NOT engaged — no distress/R20a
 * surface is touched. Rules served: R17c (genuine deletion — enforces retain_until),
 * KG1 (direct import, awaited, no fire-and-forget), PR1, PR3.
 */
import { NextRequest, NextResponse } from 'next/server'
import {
  isTrajectorySweepEnabled,
  purgeExpiredTrajectory,
} from '@/lib/substrate/agent-assessment-history-store'

// Always run fresh; never cache a cron invocation.
export const dynamic = 'force-dynamic'
// A bounded, indexed DELETE — no LLM work; the default is ample (contrast the
// narrative-sweep's 60s, sized for Sonnet generations).
export const maxDuration = 30

/** The purge dependency, injectable for unit tests (the route handler reaches the
 *  DB only through this seam, so the flag-on branch is testable without a Supabase
 *  client). Production GET binds the real, awaited, direct-import store fn. */
export type SweepDeps = {
  purge: () => Promise<{ deleted: number; error: string | null }>
}

const DEFAULT_DEPS: SweepDeps = { purge: purgeExpiredTrajectory }

/**
 * The testable handler. `GET` is a thin wrapper binding the real purge dep; tests
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

export async function GET(request: NextRequest): Promise<NextResponse> {
  return runTrajectoryRetentionSweep(request)
}
