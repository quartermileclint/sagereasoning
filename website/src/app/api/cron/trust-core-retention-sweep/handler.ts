/**
 * handler.ts — the testable implementation behind GET /api/cron/trust-core-retention-sweep.
 *
 * WHY THIS IS A SEPARATE MODULE: a Next.js `route.ts` may export ONLY the HTTP
 * method handlers + route-segment config; the injectable handler + its deps seam
 * live here (route.ts is a thin GET wrapper). Mirrors the trajectory-retention-sweep
 * handler exactly (the proven precedent), purging BOTH trust-core tables.
 */
import { NextRequest, NextResponse } from 'next/server'
import { isTrustCoreSweepEnabled } from '@/lib/substrate/trust-core/trust-core-flag'
import { purgeExpiredTrustCore } from '@/lib/substrate/trust-core/trust-core-store'

/** The purge dependency, injectable for tests (the handler reaches the DB only
 *  through this seam). Production GET binds the real, awaited store fn. */
export type TrustSweepDeps = {
  purge: () => Promise<{ deleted: number; events: number; state: number; error: string | null }>
}

export const DEFAULT_DEPS: TrustSweepDeps = { purge: purgeExpiredTrustCore }

export async function runTrustCoreRetentionSweep(
  request: NextRequest,
  deps: TrustSweepDeps = DEFAULT_DEPS,
): Promise<NextResponse> {
  // ── Cron auth (identical gate to the trajectory sweep + narrative-sweep) ──
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

  // ── Flag posture: unset ⇒ dormant, no DB work (strictly inert until activation). ──
  if (!isTrustCoreSweepEnabled()) {
    return NextResponse.json(
      {
        ok: true,
        ran_at: new Date().toISOString(),
        flag_enabled: false,
        note: 'SUBSTRATE_TRUST_CORE_SWEEP_ENABLED unset — trust-core retention sweep inactive; nothing purged.',
      },
      { status: 200 },
    )
  }

  // ── Purge (awaited; KG1 — no fire-and-forget). Fail-honest: a failed DELETE is
  //    returned in the JSON, never fail-closed (a cron has no user response to break). ──
  const purge = await deps.purge()

  return NextResponse.json(
    {
      ok: true,
      ran_at: new Date().toISOString(),
      flag_enabled: true,
      deleted: purge.deleted,
      events_deleted: purge.events,
      state_deleted: purge.state,
      errors: purge.error ? [`purge: ${purge.error}`] : [],
    },
    { status: 200 },
  )
}
