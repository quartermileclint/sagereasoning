/**
 * /api/founder/watching — the founder's read route for `watching`, the IDEA
 * loop's per-cycle record dashboard (agent-circles, built 2026-08-09 to the
 * RULED scope §2.4; verbatim ruling record wins).
 *
 * DARK behind SUBSTRATE_WATCHING_ENABLED — the SAME flag as the write route
 * (ruled §2.8: "honest 503 on both routes"). Implementation lives here; the
 * thin route wrapper is ./route.ts (Next route-export validation).
 *
 * ─── Auth (ruled §2.4) ───────────────────────────────────────────────────────
 * FOUNDER_USER_ID Bearer JWT — the founder-hub gate, RE-VERIFIED first-hand
 * against founder/hub/route.ts (requireAuth → auth.user.id === FOUNDER_USER_ID),
 * NOT the ADMIN_EMAILS billing gate (the two are confirmed distinct,
 * non-interchangeable admin gates; the ruling confirms the founder-hub one:
 * "this is the founder's operational dashboard, same audience and sensitivity
 * class as founder-hub"). Serves the founder only; nothing lands on S10 or any
 * public surface.
 *
 * ─── What it serves ──────────────────────────────────────────────────────────
 * The most recent cycles (desc), each with ALL its candidate rows — including
 * rejected_by_guardrail candidates with heuristic attribution (Q7 full
 * transparency, ruled: "A founder who cannot see what the guardrail refused
 * cannot evaluate whether the guardrail is calibrated correctly"). Optional
 * ?loop_id= filter + ?limit= pagination (build-time details, ruled). The
 * response carries the §2.5 runner-composed disclosure so the dashboard (and
 * any raw reader) sees the record's basis.
 *
 * R20a/AC5 (recorded decision, ruled §2.9): founder-facing read of agent/runner
 * -produced records; no human free-text surface is created — OUTSIDE the
 * human-distress perimeter per the standing recorded precedent. Re-checkable
 * per AC5.
 */

import { NextRequest, NextResponse } from 'next/server'

import { requireAuth } from '@/lib/security'
import {
  getCyclesWithCandidates,
  type WatchingReadOpts,
} from '@/lib/substrate/idea-loop-watching-store'
import type { StoreResult } from '@/lib/substrate/trust-core/trust-core-store'
import { isWatchingEnabled } from '../../practice/watching/handler'
// The §2.5 disclosure the dashboard RENDERS (a ruled build requirement — §2.10
// dimension (2): rendered, not merely documented in the schema). Shared from the
// dependency-free watching-shared.ts so the page's rendered text and this wire
// text cannot drift. Imported once, then re-exported (the battery imports it
// from here) — a single import + a bare re-export of the local binding, not a
// duplicated module specifier.
import { RUNNER_COMPOSED_DISCLOSURE } from '@/lib/substrate/watching-shared'
export { RUNNER_COMPOSED_DISCLOSURE }

export interface WatchingReadDeps {
  isEnabled(): boolean
  /** Returns the founder's user id, or a NextResponse to send instead
   *  (401/403). Wraps requireAuth + the FOUNDER_USER_ID gate. */
  authenticateFounder(request: NextRequest): Promise<{ ok: true } | { ok: false; response: NextResponse }>
  getCycles(opts: WatchingReadOpts): Promise<StoreResult<unknown[]>>
}

async function defaultAuthenticateFounder(
  request: NextRequest,
): Promise<{ ok: true } | { ok: false; response: NextResponse }> {
  const auth = await requireAuth(request)
  if (auth.error) return { ok: false, response: auth.error }
  const founderId = process.env.FOUNDER_USER_ID
  if (!founderId || auth.user.id !== founderId) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: 'This endpoint is restricted to the founder.' },
        { status: 403 },
      ),
    }
  }
  return { ok: true }
}

const DEFAULT_DEPS: WatchingReadDeps = {
  isEnabled: isWatchingEnabled,
  authenticateFounder: defaultAuthenticateFounder,
  getCycles: (opts) => getCyclesWithCandidates(opts),
}

export async function runFounderWatchingGet(
  request: NextRequest,
  deps: WatchingReadDeps = DEFAULT_DEPS,
): Promise<NextResponse> {
  // 1. Flag posture FIRST (dark route: unset ⇒ honest 503, zero work — before
  //    auth so the dark surface does not even exercise the auth path).
  if (!deps.isEnabled()) {
    return NextResponse.json(
      {
        error: 'watching not enabled',
        note:
          'The per-cycle record surface is dark: SUBSTRATE_WATCHING_ENABLED is not set. ' +
          'Nothing runs and nothing is read while dark.',
      },
      { status: 503 },
    )
  }

  // 2. Founder gate (FOUNDER_USER_ID Bearer JWT — the founder-hub pattern).
  const auth = await deps.authenticateFounder(request)
  if (!auth.ok) return auth.response

  // 3. Read (query params are build-time details, ruled §2.4).
  const url = new URL(request.url)
  const loopId = url.searchParams.get('loop_id') ?? undefined
  const limitRaw = url.searchParams.get('limit')
  const limit = limitRaw ? Number.parseInt(limitRaw, 10) : undefined
  const result = await deps.getCycles({
    loopId,
    limit: Number.isFinite(limit as number) ? (limit as number) : undefined,
  })
  if (!result.ok) {
    console.error('[founder/watching] read failed:', result.error)
    return NextResponse.json({ error: 'service error' }, { status: 503 })
  }

  return NextResponse.json(
    {
      schema: 'founder-watching-response-v1',
      // The §2.5 disclosure — rendered by the dashboard page from this field/
      // constant; on the wire so a raw reader sees the basis too.
      disclosure: RUNNER_COMPOSED_DISCLOSURE,
      cycles: result.value,
    },
    { status: 200 },
  )
}
