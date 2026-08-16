/**
 * GET /api/cron/agent-hold-observations-retention-sweep — R17c retention
 * enforcement for `agent_hold_observations` (PR24 parity).
 *
 * The table has carried a 90-day `retain_until` column AND an index on it since
 * its 2026-07-12 migration (supabase-agent-hold-observations-migration.sql:126
 * and :146-147). The schema declared the retention; nothing enforced it. PR24
 * (adopted 2026-08-10) makes shipping the purge alongside the declaration a rule
 * and names this table as one of the two still open.
 *
 * THE OTHER TABLE PR24 NAMES DOES NOT BELONG HERE. `stoa_entries` has NO
 * `retain_until` at all, deliberately, by binding mentor ruling #24 (Q9):
 * entries are STANDING declarations and "silent expiry is prohibited". That is
 * pinned in the migration header, the store header ("Never add this table to any
 * retention sweep") and an executing battery assertion. PR24's grounding
 * sentence claiming both tables declare `retain_until` is factually wrong and is
 * corrected in the same commit. Its erasure reachability was verified first-hand
 * instead: `stoa_entries` IS wired into the owner-delete, export and
 * credential-erase paths, so "no retention sweep" is the correct posture rather
 * than a differently-shaped gap.
 *
 * Mirrors /api/cron/observability-retention-sweep (the C-1 precedent), with one
 * purge instead of two:
 *   • Auth: the same CRON_SECRET gate (503 if unset; 401 on a bad Bearer).
 *   • Flag: a DEDICATED kill-switch (SUBSTRATE_HOLD_OBSERVATIONS_SWEEP_ENABLED).
 *     Unset ⇒ honest { flag_enabled: false } 200, no DB work. Deliberately NOT
 *     the live SUBSTRATE_TRUST_CORE_SWEEP_ENABLED, which would have made this
 *     delete rows the moment it deployed.
 *   • Purge: purgeExpiredHoldObservations by DIRECT IMPORT, awaited (KG1 rule 1
 *     — no HTTP self-call, no fire-and-forget). A bounded, indexed DELETE;
 *     missing-table-benign but NEVER missing-column-benign (the C-1 discipline).
 *   • Fail-honest: a failed DELETE is caught and named in the JSON.
 *
 * The handler logic + its testable dependency seam live in ./handler.ts, because
 * a Next.js route.ts may export ONLY method handlers + route-segment config.
 *
 * NO vercel.json cron entry ships with this build, and the flag is NOT set.
 * Scheduling + activation is a deployment-configuration change and is its own
 * founder-walked step (R4).
 *
 * ONE ACTIVATION CONSTRAINT WORTH CARRYING, because it is not obvious: this
 * sweep and an ACTIVE false-hold observation window are in tension by design.
 * Activating it mid-window silently purges 90-day-old window data. And the
 * operator report's ingest re-inserts purged rows from the local JSONL buffer
 * (its own comment calls the JSONL "the source of truth"), so a swept row can
 * reappear with a fresh `retain_until`. The sweep enforces retention on the
 * SERVER copy; it is not a guarantee about the operator's local buffer.
 *
 * NEVER on the /api/reason critical path. PR6 NOT engaged — no distress/R20a
 * surface is touched. Rules served: R17c, PR24, KG1, PR1, PR3.
 */
import { NextRequest, NextResponse } from 'next/server'
import { runHoldObservationsRetentionSweep } from './handler'

// Always run fresh; never cache a cron invocation.
export const dynamic = 'force-dynamic'
// One bounded, indexed DELETE — no LLM work; the sibling sweeps' 30s is ample.
export const maxDuration = 30

export async function GET(request: NextRequest): Promise<NextResponse> {
  return runHoldObservationsRetentionSweep(request)
}
