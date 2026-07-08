/**
 * GET /api/cron/trust-core-retention-sweep — R17c retention enforcement for the
 * Trust Layer S1 trust core (agent_trust_events + agent_trust_state).
 *
 * Both tables carry a 90-day `retain_until` (the events from occurrence; the state
 * refreshed on each event, so a dormant agent's state expires 90 days after its
 * last event). For null-owner external-consumer rows this sweep is the PRIMARY
 * genuine-deletion mechanism (those rows are not reachable by the user-JWT
 * data-rights paths, only by consumer-erasure-by-token, which is on demand).
 * NOTHING enforces retention without this cron.
 *
 * The hard rule (mirrors the trajectory sweep ⛔): this sweep must be BUILT,
 * FLAGGED ON, and SCHEDULED before SUBSTRATE_TRUST_CORE_ENABLED begins creating
 * null-owner rows in production — otherwise rows accrue with no enforced deletion.
 *
 * Mirrors /api/cron/trajectory-retention-sweep exactly:
 *   • Auth: the same CRON_SECRET gate (503 if unset; 401 on a bad Bearer).
 *   • Flag: a DEDICATED kill-switch (SUBSTRATE_TRUST_CORE_SWEEP_ENABLED), separate
 *     from the write flag so it can go live BEFORE emission. Unset ⇒ honest
 *     { flag_enabled: false } 200, no DB work.
 *   • Purge: purgeExpiredTrustCore() by DIRECT IMPORT, awaited (KG1). Bounded,
 *     indexed DELETEs on idx_ate_retain_until + idx_ats_retain_until.
 *   • Fail-honest: a failed DELETE is caught + returned in the JSON — NO fail-closed.
 *
 * The handler + its testable dependency seam live in ./handler.ts (a Next.js
 * route.ts may export ONLY the method handlers + route-segment config).
 *
 * NEVER on the /api/reason critical path. PR6 NOT engaged. Rules served: R17c,
 * KG1, PR1, PR3.
 */
import { NextRequest, NextResponse } from 'next/server'
import { runTrustCoreRetentionSweep } from './handler'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

export async function GET(request: NextRequest): Promise<NextResponse> {
  return runTrustCoreRetentionSweep(request)
}
