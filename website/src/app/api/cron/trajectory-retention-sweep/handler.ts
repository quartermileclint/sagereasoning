/**
 * handler.ts — the testable implementation behind GET /api/cron/trajectory-retention-sweep.
 *
 * WHY THIS IS A SEPARATE MODULE: a Next.js `route.ts` may export ONLY the HTTP
 * method handlers (GET/POST/…) and route-segment config (dynamic, maxDuration,
 * …). Exporting the injectable handler or its deps type from route.ts fails the
 * Next route-export validation at `next build` (NOT caught by `tsc --noEmit`).
 * So the handler + its dependency seam live here; route.ts is a thin GET wrapper.
 *
 * PROVENANCE-LEDGER SLICE 2 (2026-08-26, SCOPE §7, round-6 mentor ruling Q6):
 * this handler now also purges the two provenance-ledger tables
 * (agent_provenance_ledger, agent_provenance_gaps) — the PR24 two-table-per-
 * handler precedent (/api/cron/observability-retention-sweep). The two new
 * purges are called UNCONDITIONALLY (not gated by isTrajectorySweepEnabled()
 * — the trajectory sweep's own flag): each gates INTERNALLY on
 * SUBSTRATE_PROVENANCE_LEDGER_ENABLED (purgeExpiredProvenanceLedger /
 * purgeExpiredProvenanceGaps in provenance-ledger-store.ts). This is the
 * ruled shape, not a convenience — SUBSTRATE_TRAJECTORY_SWEEP_ENABLED is
 * ALREADY `true` in production, so gating the new purges on it alone would
 * make them go live the instant this code deploys, "dark" only by the
 * coincidence of the tables being empty rather than by the flag's own
 * meaning (the exact shape the Stoa ST3/ST4 incident named as a standing
 * rule: dark is per-flag, not per-feature). Calling the two new purge
 * functions here regardless of the trajectory flag's state, with each
 * function checking its OWN flag, is what makes "the ledger's sweep tracks
 * only the ledger's own flag" true in EVERY combination of the two flags'
 * states — including a hypothetical future rollback of the (already-live)
 * trajectory sweep, which must not silently stop the ledger's retention
 * enforcement too.
 *
 * RESPONSE SHAPE — deliberately changed from a single boolean/number to a
 * per-feature object (the observability-retention-sweep's `deleted: {table:
 * N, ...}` pattern), because there are now two independently-gated flags
 * whose "did work run" state a bare `flag_enabled: boolean` cannot represent
 * without lying about one of them. `flag_enabled.trajectory` preserves the
 * exact meaning the old bare boolean had; `flag_enabled.provenance_ledger` is
 * new. `deleted` is always an object (never a bare number) so a founder
 * eyeballing the cron's JSON response can see all three counts at a glance
 * without first checking which flags were on.
 *
 * The three purges are INDEPENDENT (observability-retention-sweep's own
 * comment, reused verbatim in spirit): one failing must never suppress or
 * skip the others. Pinned by route.test.ts (mirrors that handler's §6).
 */
import { NextRequest, NextResponse } from 'next/server'
import {
  isTrajectorySweepEnabled,
  purgeExpiredTrajectory,
} from '@/lib/substrate/agent-assessment-history-store'
import {
  isProvenanceLedgerEnabled,
  purgeExpiredProvenanceLedger,
  purgeExpiredProvenanceGaps,
} from '@/lib/substrate/trust-core/provenance-ledger-store'

/** The purge dependencies, injectable for unit tests (the handler reaches the
 *  DB only through this seam, so every flag-on branch is testable without a
 *  Supabase client). Production GET binds the real, awaited, direct-import
 *  store fns. */
export type SweepDeps = {
  purgeTrajectory: () => Promise<{ deleted: number; error: string | null }>
  purgeProvenanceLedger: () => Promise<{ deleted: number; error: string | null }>
  purgeProvenanceGaps: () => Promise<{ deleted: number; error: string | null }>
}

export const DEFAULT_DEPS: SweepDeps = {
  purgeTrajectory: purgeExpiredTrajectory,
  purgeProvenanceLedger: purgeExpiredProvenanceLedger,
  purgeProvenanceGaps: purgeExpiredProvenanceGaps,
}

/**
 * The testable sweep handler. `route.ts`'s GET binds the real purge deps;
 * tests call this directly with a fake request + injected purges, so
 * 503/401/every flag combination are all exercised with no DB and no network.
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

  // ── Trajectory purge — gated on ITS OWN flag, as before ─────────────────────
  // Unset ⇒ no DB work for this one table; the two provenance-ledger purges
  // below are NOT gated by this flag (round-6 ruling, Q6 — see this file's
  // header) and run regardless.
  const trajectoryEnabled = isTrajectorySweepEnabled()
  const trajectory = trajectoryEnabled
    ? await deps.purgeTrajectory()
    : { deleted: 0, error: null }

  // ── Provenance-ledger purges — called UNCONDITIONALLY; each gates          ──
  // ── INTERNALLY on SUBSTRATE_PROVENANCE_LEDGER_ENABLED (round-6 ruling, Q6) ──
  // Sequential, independent (mirrors the observability sweep's own comment):
  // one failing must never suppress or skip the others.
  const provenanceLedger = await deps.purgeProvenanceLedger()
  const provenanceGaps = await deps.purgeProvenanceGaps()

  const errors: string[] = []
  if (trajectory.error) errors.push(`trajectory: ${trajectory.error}`)
  if (provenanceLedger.error) errors.push(`provenance_ledger: ${provenanceLedger.error}`)
  if (provenanceGaps.error) errors.push(`provenance_gaps: ${provenanceGaps.error}`)

  return NextResponse.json(
    {
      ok: true,
      ran_at: new Date().toISOString(),
      flag_enabled: {
        trajectory: trajectoryEnabled,
        provenance_ledger: isProvenanceLedgerEnabled(),
      },
      deleted: {
        trajectory: trajectory.deleted,
        provenance_ledger: provenanceLedger.deleted,
        provenance_gaps: provenanceGaps.deleted,
      },
      errors,
    },
    { status: 200 },
  )
}
