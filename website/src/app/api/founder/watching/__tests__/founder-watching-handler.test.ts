/**
 * founder-watching-handler.test.ts — the GET /api/founder/watching route
 * battery (agent-circles `watching`, built 2026-08-09; see ../handler.ts
 * header). Covers dimension 3 (flag-off byte-identity on the read side) and
 * the founder-gate discipline; dimensions 1+2 (Q7 transparency + the
 * disclosure RENDERED) are asserted at the dashboard-page battery, since a
 * schema-only test cannot prove "rendered" — this battery proves the wire
 * carries everything the page needs to render both.
 *
 * Plain-assertion script: npx tsx <this file>. Hermetic — injectable deps, no
 * env, no network, no DB.
 */

import { readFileSync } from 'fs'
import { join } from 'path'
import { NextRequest, NextResponse } from 'next/server'
import { runFounderWatchingGet, RUNNER_COMPOSED_DISCLOSURE, type WatchingReadDeps } from '../handler'

let passed = 0
let failed = 0
const failures: string[] = []
function assert(condition: boolean, label: string): void {
  if (condition) passed++
  else {
    failed++
    failures.push(label)
    console.error(`FAIL: ${label}`)
  }
}

function req(opts: { url?: string } = {}): NextRequest {
  return new NextRequest(opts.url ?? 'http://localhost/api/founder/watching')
}

const FAKE_CYCLE = {
  id: 'cyc-1',
  loop_id: 'loop-1',
  cycle_number: 3,
  cycle_outcome: 'null_cycle',
  idea_loop_candidates: [
    { id: 'cand-1', heuristic: 'anomaly_detection', cycle_outcome: 'rejected_by_guardrail', guardrail_proximity: 'reflexive' },
  ],
}

function makeDeps(opts: {
  enabled?: boolean
  founderOk?: boolean
  readFails?: boolean
  getCallsSink?: unknown[]
}): WatchingReadDeps & { authCalls: number; getCalls: number } {
  const state = { authCalls: 0, getCalls: 0 }
  return {
    get authCalls() {
      return state.authCalls
    },
    get getCalls() {
      return state.getCalls
    },
    isEnabled: () => opts.enabled !== false,
    authenticateFounder: async () => {
      state.authCalls++
      if (opts.founderOk === false) {
        return { ok: false, response: NextResponse.json({ error: 'restricted' }, { status: 403 }) }
      }
      return { ok: true }
    },
    getCycles: async (readOpts) => {
      state.getCalls++
      opts.getCallsSink?.push(readOpts)
      if (opts.readFails) return { ok: false, error: 'db unavailable' }
      return { ok: true, value: [FAKE_CYCLE] }
    },
  }
}

async function run(): Promise<void> {
  // ══════════════════════════════════════════════════════════════════════════
  // §1 Flag posture — dark ⇒ 503, ZERO work (before auth, dimension 3)
  // ══════════════════════════════════════════════════════════════════════════
  {
    const deps = makeDeps({ enabled: false })
    const res = await runFounderWatchingGet(req(), deps)
    assert(res.status === 503, '§1.1 flag-off ⇒ 503')
    const body = await res.json()
    assert(String(body.note ?? '').includes('SUBSTRATE_WATCHING_ENABLED'), '§1.2 503 names the flag honestly')
    assert(deps.authCalls === 0, '§1.3 flag-off ⇒ NO auth check (zero work — checked BEFORE auth)')
    assert(deps.getCalls === 0, '§1.4 flag-off ⇒ NO DB read (zero DB touch)')
  }

  // ══════════════════════════════════════════════════════════════════════════
  // §2 Founder gate
  // ══════════════════════════════════════════════════════════════════════════
  {
    const deps = makeDeps({ founderOk: false })
    const res = await runFounderWatchingGet(req(), deps)
    assert(res.status === 403, '§2.1 non-founder ⇒ 403 (the founder-hub gate pattern)')
    assert(deps.getCalls === 0, '§2.2 auth failure ⇒ no read attempted')
  }

  // ══════════════════════════════════════════════════════════════════════════
  // §3 Successful read — the wire carries the Q7 candidate attribution + the
  // §2.5 disclosure (what the dashboard page renders)
  // ══════════════════════════════════════════════════════════════════════════
  {
    const opts: unknown[] = []
    const deps = makeDeps({ getCallsSink: opts })
    const res = await runFounderWatchingGet(req({ url: 'http://localhost/api/founder/watching?loop_id=loop-1&limit=10' }), deps)
    assert(res.status === 200, '§3.1 valid read ⇒ 200')
    const body = await res.json()
    assert(body.schema === 'founder-watching-response-v1', '§3.2 response schema tag')
    assert(body.disclosure === RUNNER_COMPOSED_DISCLOSURE, '§3.3 the §2.5 runner-composed disclosure rides the wire')
    assert(Array.isArray(body.cycles) && body.cycles.length === 1, '§3.4 cycles array present')
    assert(
      body.cycles[0].idea_loop_candidates[0].heuristic === 'anomaly_detection' &&
        body.cycles[0].idea_loop_candidates[0].cycle_outcome === 'rejected_by_guardrail',
      '§3.5 Q7: a rejected_by_guardrail candidate carries its heuristic attribution on the wire',
    )
    assert(
      opts.length === 1 && (opts[0] as { loopId?: string }).loopId === 'loop-1',
      '§3.6 the ?loop_id= filter is threaded to the store read',
    )
    assert((opts[0] as { limit?: number }).limit === 10, '§3.7 the ?limit= param is threaded to the store read')
  }

  // ══════════════════════════════════════════════════════════════════════════
  // §4 Read failure ⇒ honest 503 (never a fabricated empty list)
  // ══════════════════════════════════════════════════════════════════════════
  {
    const deps = makeDeps({ readFails: true })
    const prevErr = console.error
    console.error = () => {}
    const res = await runFounderWatchingGet(req(), deps)
    console.error = prevErr
    assert(res.status === 503, '§4.1 store read failure ⇒ honest 503 (never a fabricated empty list)')
  }

  // ══════════════════════════════════════════════════════════════════════════
  // §5 Source-grep INV pins
  // ══════════════════════════════════════════════════════════════════════════
  {
    const routeSrc = readFileSync(join(__dirname, '../route.ts'), 'utf8')
    assert(routeSrc.includes('RATE_LIMITS.admin'), '§5.1 INV: route uses the admin bucket (the founder-hub sibling)')
    assert(!routeSrc.includes('RATE_LIMITS.scoring'), '§5.2 INV: route NEVER uses the scoring bucket')
    const exportLines = routeSrc.split('\n').filter((l) => l.startsWith('export '))
    assert(
      exportLines.every((l) => /export async function (GET)\(/.test(l)),
      '§5.3 INV: route.ts exports ONLY the GET handler (Next route-export validation)',
    )
    const handlerSrc = readFileSync(join(__dirname, '../handler.ts'), 'utf8')
    assert(
      handlerSrc.includes('FOUNDER_USER_ID'),
      '§5.4 INV: the founder gate uses FOUNDER_USER_ID (not ADMIN_EMAILS — the two distinct non-interchangeable gates)',
    )
    assert(
      !handlerSrc.includes('process.env.ADMIN_EMAILS') && !handlerSrc.includes('ADMIN_EMAILS.split'),
      '§5.5 INV: the route does NOT USE the ADMIN_EMAILS billing gate (a doc-comment mention naming ' +
        'the gate it is NOT is expected and fine)',
    )
    assert(
      handlerSrc.includes('RUNNER_COMPOSED_DISCLOSURE'),
      '§5.6 INV: the disclosure is imported from the shared constant (page + wire cannot drift)',
    )
  }

  console.log(`\nfounder-watching-handler battery: ${passed} passed, ${failed} failed`)
  if (failed > 0) {
    console.error('FAILURES:\n - ' + failures.join('\n - '))
    process.exit(1)
  }
}

run().catch((e) => {
  console.error('battery crashed:', e)
  process.exit(1)
})
