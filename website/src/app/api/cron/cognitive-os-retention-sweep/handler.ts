/**
 * handler.ts - the testable implementation behind
 * GET /api/cron/cognitive-os-retention-sweep.
 *
 * WHY THIS IS A SEPARATE MODULE: a Next.js `route.ts` may export ONLY the HTTP
 * method handlers and route-segment config. Exporting an injectable handler from
 * route.ts passes `tsc` and passes tsx tests, then fails at `next build` - a
 * defect this project has already shipped once. route.ts stays a thin wrapper.
 *
 * Mirrors /api/cron/trust-core-retention-sweep exactly:
 *   - Auth: the same CRON_SECRET gate (503 if unset; 401 on a bad Bearer).
 *   - Flag: a DEDICATED kill-switch (SUBSTRATE_COGNITIVE_OS_SWEEP_ENABLED).
 *     Unset => honest { flag_enabled: false } 200 and NO DB work.
 *   - Purge: awaited (KG1 - never fire-and-forget).
 *   - Fail-honest: a failed DELETE is returned in the JSON, never fail-closed.
 *
 * WHY THIS SWEEP MATTERS MORE THAN MOST: a cognitive_contexts row keyed only by
 * credential_ref has no owner_user_id, so it is unreachable by the user-JWT
 * data-rights paths. For those rows this cron and the on-demand
 * /api/credential/erase are the ONLY deletion mechanisms. Nothing enforces
 * retention without it.
 *
 * NEVER on the /api/reason critical path. PR6 not engaged.
 */
import { NextRequest, NextResponse } from 'next/server'
import { isCognitiveOsSweepEnabled } from '@/lib/cognitive-os-store/sweep-flag'
import { purgeExpiredCognitive } from '@/lib/cognitive-os-store/store'

/** The purge dependency, injectable for tests - the handler reaches the DB only
 *  through this seam. */
export type CognitiveSweepDeps = {
  purge: () => Promise<{
    deleted: number
    contexts: number
    events: number
    claims: number
    belief_states: number
    error: string | null
  }>
}

export const DEFAULT_DEPS: CognitiveSweepDeps = { purge: purgeExpiredCognitive }

export async function runCognitiveOsRetentionSweep(
  request: NextRequest,
  deps: CognitiveSweepDeps = DEFAULT_DEPS,
): Promise<NextResponse> {
  // -- Cron auth (identical gate to the sibling sweeps) --
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

  // -- Flag posture: unset => dormant, no DB work. --
  if (!isCognitiveOsSweepEnabled()) {
    return NextResponse.json(
      {
        ok: true,
        ran_at: new Date().toISOString(),
        flag_enabled: false,
        note: 'SUBSTRATE_COGNITIVE_OS_SWEEP_ENABLED unset - cognitive-os retention sweep inactive; nothing purged.',
      },
      { status: 200 },
    )
  }

  // -- Purge (awaited; KG1). Fail-honest: a failed DELETE is reported, not thrown. --
  const purge = await deps.purge()

  return NextResponse.json(
    {
      ok: true,
      ran_at: new Date().toISOString(),
      flag_enabled: true,
      deleted: purge.deleted,
      contexts_deleted: purge.contexts,
      events_deleted: purge.events,
      claims_deleted: purge.claims,
      belief_states_deleted: purge.belief_states,
      errors: purge.error ? [`purge: ${purge.error}`] : [],
    },
    { status: 200 },
  )
}
