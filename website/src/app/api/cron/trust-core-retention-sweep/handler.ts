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
import { purgeExpiredCollaboration } from '@/lib/substrate/trust-core/collaboration-store'
import { purgeExpiredWatching } from '@/lib/substrate/idea-loop-watching-store'
import { sweepExpiredSessions } from '@/lib/sage-reflect/session-store'

/** The purge dependency, injectable for tests (the handler reaches the DB only
 *  through this seam). Production GET binds the real, awaited store fns — sweeping
 *  ALL trust-core tables: agent_trust_events + agent_trust_state (S1),
 *  collaboration_records (S5), sage_reflect_sessions (S9b G2 — the reflect
 *  retention enforcer the standing persist activation was gated on; SR-12's
 *  sweepExpiredSessions, finally scheduled), AND idea_loop_cycles (watching,
 *  agent-circles ruled §2.7 — candidates cascade via FK; missing-table-benign
 *  until its migration lands). */
export type TrustSweepDeps = {
  purge: () => Promise<{
    deleted: number
    events: number
    state: number
    collaboration: number
    reflect: number
    watching: number
    error: string | null
  }>
}

/** Sweep the S1 trust-core tables, the S5 collaboration table, the reflect
 *  sessions (S9b), and the watching cycle table; combine the cron-friendly
 *  shape. Fail-honest — a purge error from any surfaces in `error`, never
 *  fail-closed. */
async function purgeAllTrustCore(): Promise<{
  deleted: number
  events: number
  state: number
  collaboration: number
  reflect: number
  watching: number
  error: string | null
}> {
  const tc = await purgeExpiredTrustCore()
  const collab = await purgeExpiredCollaboration()
  const reflect = await sweepExpiredSessions()
  const watching = await purgeExpiredWatching()
  const reflectDeleted = reflect.ok ? reflect.value.deleted : 0
  return {
    deleted: tc.deleted + collab.deleted + reflectDeleted + watching.deleted,
    events: tc.events,
    state: tc.state,
    collaboration: collab.deleted,
    reflect: reflectDeleted,
    watching: watching.deleted,
    error: tc.error ?? collab.error ?? (reflect.ok ? null : reflect.error) ?? watching.error,
  }
}

export const DEFAULT_DEPS: TrustSweepDeps = { purge: purgeAllTrustCore }

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
      collaboration_deleted: purge.collaboration,
      reflect_deleted: purge.reflect,
      watching_deleted: purge.watching,
      errors: purge.error ? [`purge: ${purge.error}`] : [],
    },
    { status: 200 },
  )
}
