/**
 * GET /api/cron/observability-retention-sweep — R17c retention enforcement for
 * the two observability tables (C-1).
 *
 * `route_errors` and `throttle_events` (P-GL #5 and #8) have each carried a
 * 90-day `retain_until` column AND an index on it since their migrations
 * (supabase-route-errors-migration.sql:34/41,
 * supabase-throttle-events-migration.sql:32/47). The schema declared the
 * retention; nothing enforced it. The 2026-08-01 regrounding audit named the
 * gap (C-1). Neither table is reachable by the user-JWT data-rights paths —
 * both are service-role-only, and throttle_events stores a hashed IP rather
 * than an owner — so this sweep is their ONLY genuine-deletion mechanism.
 *
 * Mirrors /api/cron/trajectory-retention-sweep (the proven precedent), with two
 * purge calls instead of one — the shape /api/cron/trust-core-retention-sweep
 * already uses for several unrelated table-groups in one route:
 *   • Auth: the same CRON_SECRET gate (503 if unset; 401 on a bad Bearer).
 *   • Flag: a DEDICATED kill-switch (SUBSTRATE_OBSERVABILITY_SWEEP_ENABLED).
 *     Unset ⇒ honest { flag_enabled: false } 200, no DB work.
 *   • Purge: purgeExpiredRouteErrors + purgeExpiredThrottleEvents by DIRECT
 *     IMPORT, awaited (KG1 rule 1 — no HTTP self-call, no fire-and-forget).
 *     Bounded, indexed DELETEs; missing-table-benign.
 *   • Fail-honest: a failed DELETE is caught and named in the JSON — NOT
 *     fail-closed; a cron has no user-facing response to break.
 *
 * The handler logic + its testable dependency seam live in ./handler.ts,
 * because a Next.js route.ts may export ONLY method handlers + route-segment
 * config. This file is the thin GET wrapper that binds the real purge deps.
 *
 * NO vercel.json cron entry ships with this build, and the flag is NOT set.
 * Scheduling + activation is a deployment-configuration change and is its own
 * founder-walked Critical step (0d-ii: "env flags activating new surfaces").
 * Until then the route exists, is secret-gated, is inert, and is invoked
 * manually. Activating it is safe in either order — an unscheduled flag simply
 * means nothing calls it, and a scheduled unset flag is a no-op 200 — but the
 * founder should set the flag and add the cron entry together so the sweep
 * actually runs.
 *
 * NEVER on the /api/reason critical path. PR6 NOT engaged — no distress/R20a
 * surface is touched. Rules served: R17c (genuine deletion — enforces
 * retain_until), R5 (observability), KG1 (direct import, awaited), PR1, PR3.
 */
import { NextRequest, NextResponse } from 'next/server'
import { runObservabilityRetentionSweep } from './handler'

// Always run fresh; never cache a cron invocation.
export const dynamic = 'force-dynamic'
// Two bounded, indexed DELETEs — no LLM work; the trajectory sweep's 30s is ample.
export const maxDuration = 30

export async function GET(request: NextRequest): Promise<NextResponse> {
  return runObservabilityRetentionSweep(request)
}
