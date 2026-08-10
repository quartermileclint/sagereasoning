/**
 * handler.ts — the testable implementation behind
 * GET /api/cron/observability-retention-sweep.
 *
 * WHY THIS IS A SEPARATE MODULE: a Next.js `route.ts` may export ONLY the HTTP
 * method handlers (GET/POST/…) and route-segment config (dynamic, maxDuration,
 * …). Exporting the injectable handler or its deps type from route.ts fails the
 * Next route-export validation at `next build` (NOT caught by `tsc --noEmit` —
 * memory `nextjs-route-export-validation`). So the handler + its dependency
 * seam live here; route.ts is a thin GET wrapper.
 *
 * Structure mirrors ../trajectory-retention-sweep/handler.ts exactly, with two
 * purge deps instead of one — the same shape /api/cron/trust-core-retention-sweep
 * already uses to sweep several unrelated table-groups from a single route.
 *
 * The two purges are INDEPENDENT: one failing must not suppress the other, and
 * must not fail the response. Both are awaited (KG1 — no fire-and-forget), and
 * both errors are collected into the JSON. `ok` stays true even when a purge
 * errors: this is a cron, the response has no user, and a 500 would only make
 * the failure less visible than a named error string in a logged body.
 */
import { NextRequest, NextResponse } from 'next/server'
import {
  isObservabilitySweepEnabled,
  purgeExpiredRouteErrors,
  purgeExpiredThrottleEvents,
} from '@/lib/observability-store'

/** The purge dependencies, injectable for unit tests (the handler reaches the
 *  DB only through this seam, so the flag-on branch is testable without a
 *  Supabase client). Production GET binds the real, awaited store fns. */
export type ObservabilitySweepDeps = {
  purgeRouteErrors: () => Promise<{ deleted: number; error: string | null }>
  purgeThrottleEvents: () => Promise<{ deleted: number; error: string | null }>
}

export const DEFAULT_DEPS: ObservabilitySweepDeps = {
  purgeRouteErrors: purgeExpiredRouteErrors,
  purgeThrottleEvents: purgeExpiredThrottleEvents,
}

export async function runObservabilityRetentionSweep(
  request: NextRequest,
  deps: ObservabilitySweepDeps = DEFAULT_DEPS,
): Promise<NextResponse> {
  // ── Cron auth (identical gate to the three existing sweeps) ────────────────
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
  if (!isObservabilitySweepEnabled()) {
    return NextResponse.json(
      {
        ok: true,
        ran_at: new Date().toISOString(),
        flag_enabled: false,
        note: 'SUBSTRATE_OBSERVABILITY_SWEEP_ENABLED unset — retention sweep inactive; nothing purged.',
      },
      { status: 200 },
    )
  }

  // ── Purge both tables (awaited, independent) ──────────────────────────────
  // Sequential rather than Promise.all: two small indexed DELETEs on one
  // connection, and a serial order keeps the error attribution unambiguous.
  const routeErrors = await deps.purgeRouteErrors()
  // INDEPENDENT — this call MUST run unconditionally, regardless of whether
  // routeErrors above failed. Do not add an `if (routeErrors.error) return`/
  // `skip` guard here: that would silently stop enforcing throttle_events'
  // retention the moment route_errors' purge broke — reintroducing the exact
  // declared-but-unenforced gap (C-1) this route exists to close, one layer
  // up. Pinned by route.test.ts §6 (both failure orderings).
  const throttleEvents = await deps.purgeThrottleEvents()

  const errors: string[] = []
  if (routeErrors.error) errors.push(`route_errors: ${routeErrors.error}`)
  if (throttleEvents.error) errors.push(`throttle_events: ${throttleEvents.error}`)

  return NextResponse.json(
    {
      ok: true,
      ran_at: new Date().toISOString(),
      flag_enabled: true,
      deleted: {
        route_errors: routeErrors.deleted,
        throttle_events: throttleEvents.deleted,
      },
      errors,
    },
    { status: 200 },
  )
}
