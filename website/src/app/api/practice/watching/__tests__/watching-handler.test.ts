/**
 * watching-handler.test.ts — the POST /api/practice/watching route battery
 * (agent-circles, built 2026-08-09 to the RULED scope; see ../handler.ts
 * header). Hits the FIVE required §2.10 review dimensions (dimensions 3–5 land
 * here; 1+2 land in the dashboard/founder-watching batteries):
 *   (3) flag-off byte-identity — including data-rights riders (own battery)
 *   (4) candidate/cycle outcome vocabularies exactly as ruled (uniform
 *       terminated_by_timeout; pending-never-in-completed-record)
 *   (5) the watching_write capability + write-class discipline end-to-end
 *
 * Plain-assertion script: npx tsx <this file>. Hermetic — injectable deps (fake
 * credential validator + fake store), no env, no network, no DB.
 */

import { readFileSync } from 'fs'
import { join } from 'path'
import { NextRequest } from 'next/server'
import {
  runWatchingPost,
  parseWatchingBody,
  isWatchingEnabled,
  CYCLE_LEVEL_OUTCOMES,
  CANDIDATE_LEVEL_OUTCOMES,
  MAX_CANDIDATES_PER_WRITE,
  MAX_PROPOSED_ACTION_CHARS,
  MAX_REF_CHARS,
  type WatchingWriteDeps,
} from '../handler'

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

function req(opts: { auth?: string; apiKey?: string; body?: unknown; rawBody?: string }): NextRequest {
  const headers: Record<string, string> = { 'content-type': 'application/json' }
  if (opts.auth) headers['authorization'] = opts.auth
  if (opts.apiKey) headers['x-api-key'] = opts.apiKey
  return new NextRequest('http://localhost/api/practice/watching', {
    method: 'POST',
    headers,
    ...(opts.rawBody !== undefined
      ? { body: opts.rawBody }
      : opts.body !== undefined
        ? { body: JSON.stringify(opts.body) }
        : {}),
  })
}

function makeDeps(opts: {
  enabled?: boolean
  valid?: boolean
  validateThrows?: boolean
  requiredCapabilitySeen?: string[]
  insertFails?: boolean
  insertDuplicate?: boolean
}): WatchingWriteDeps & { validateCalls: number; insertCalls: number; lastCycle: unknown; lastCandidates: unknown } {
  const state = {
    validateCalls: 0,
    insertCalls: 0,
    lastCycle: null as unknown,
    lastCandidates: null as unknown,
  }
  return {
    get validateCalls() {
      return state.validateCalls
    },
    get insertCalls() {
      return state.insertCalls
    },
    get lastCycle() {
      return state.lastCycle
    },
    get lastCandidates() {
      return state.lastCandidates
    },
    isEnabled: () => opts.enabled !== false,
    validateCredential: async (_raw, capability) => {
      state.validateCalls++
      opts.requiredCapabilitySeen?.push(capability)
      if (opts.validateThrows) throw new Error('boom')
      if (opts.valid === false) return { valid: false, reason: 'insufficient_capability' } as never
      return {
        valid: true,
        row: { id: 'cred-9', agent_id: 'sagereasoning:idea-loop@v1', owner_user_id: 'owner-1' },
        capabilities: ['watching_write'],
      } as never
    },
    insertCycle: async (cycle, candidates) => {
      state.insertCalls++
      state.lastCycle = cycle
      state.lastCandidates = candidates
      if (opts.insertFails) return { ok: false, error: 'db unavailable' }
      if (opts.insertDuplicate) return { ok: true, value: { status: 'duplicate' } }
      return { ok: true, value: { status: 'written', cycle_id: 'cyc-1', candidates_written: candidates.length } }
    },
  }
}

const GOOD_CANDIDATE = {
  heuristic: 'analogous_transfer',
  proposed_action: 'do the thing',
  classification_kind: 'virtue_domain',
  classified_domains: ['phronesis'],
  cycle_outcome: 'rejected_by_guardrail',
  guardrail_proximity: 'reflexive',
  guardrail_domains: ['dikaiosyne'],
}

const GOOD_CYCLE = {
  loop_id: 'loop-1',
  cycle_number: 3,
  cycle_outcome: 'null_cycle',
  friction_only_mode: false,
}

async function run(): Promise<void> {
  // ══════════════════════════════════════════════════════════════════════════
  // §1 Flag posture — dark ⇒ honest 503, ZERO work (dimension 3)
  // ══════════════════════════════════════════════════════════════════════════
  {
    assert(isWatchingEnabled() === false, '§1.1 SUBSTRATE_WATCHING_ENABLED unset ⇒ flag reads off')
    const deps = makeDeps({ enabled: false })
    const res = await runWatchingPost(
      req({ auth: 'Bearer sr_prac_x', body: { cycle: GOOD_CYCLE, candidates: [GOOD_CANDIDATE] } }),
      deps,
    )
    assert(res.status === 503, '§1.2 flag-off ⇒ 503')
    const body = await res.json()
    assert(String(body.note ?? '').includes('SUBSTRATE_WATCHING_ENABLED'), '§1.3 503 names the flag honestly')
    assert(deps.validateCalls === 0, '§1.4 flag-off ⇒ NO credential lookup (zero work)')
    assert(deps.insertCalls === 0, '§1.5 flag-off ⇒ NO DB write (zero DB touch)')
  }

  // ══════════════════════════════════════════════════════════════════════════
  // §2 Auth — Bearer-only, watching_write capability, single non-leaking 401
  // (dimension 5: the write-class discipline end-to-end at the route)
  // ══════════════════════════════════════════════════════════════════════════
  {
    const body = { cycle: GOOD_CYCLE, candidates: [GOOD_CANDIDATE] }
    const noAuth = await runWatchingPost(req({ body }), makeDeps({}))
    assert(noAuth.status === 401, '§2.1 missing Authorization ⇒ 401')

    const xApiKey = await runWatchingPost(req({ apiKey: 'sr_prac_x', body }), makeDeps({}))
    assert(xApiKey.status === 401, '§2.2 X-Api-Key transport refused (Bearer-ONLY — write-class constraint 7)')

    const invalid = await runWatchingPost(req({ auth: 'Bearer bad', body }), makeDeps({ valid: false }))
    assert(invalid.status === 401, '§2.3 insufficient_capability (no watching_write) ⇒ 401')

    const throws = await runWatchingPost(req({ auth: 'Bearer x', body }), makeDeps({ validateThrows: true }))
    assert(throws.status === 401, '§2.4 validator throw ⇒ 401 (fail-closed, never 500)')

    const capSeen: string[] = []
    await runWatchingPost(req({ auth: 'Bearer ok', body }), makeDeps({ requiredCapabilitySeen: capSeen }))
    assert(
      capSeen.length === 1 && capSeen[0] === 'watching_write',
      '§2.5 the route requests the watching_write capability specifically (dimension 5) — not consult',
    )
  }

  // ══════════════════════════════════════════════════════════════════════════
  // §3 Body/vocabulary validation (dimension 4 — outcome vocabularies exactly
  // as ruled, incl. the pending-rejection discipline)
  // ══════════════════════════════════════════════════════════════════════════
  {
    const auth = 'Bearer ok'
    const cases: Array<{ label: string; body?: unknown; rawBody?: string }> = [
      { label: '§3.1 non-JSON body ⇒ 400', rawBody: 'not json' },
      { label: '§3.2 missing cycle ⇒ 400', body: { candidates: [] } },
      { label: '§3.3 missing loop_id ⇒ 400', body: { cycle: { ...GOOD_CYCLE, loop_id: '' }, candidates: [] } },
      {
        label: `§3.4 loop_id > ${MAX_REF_CHARS} chars ⇒ 400 (cap)`,
        body: { cycle: { ...GOOD_CYCLE, loop_id: 'x'.repeat(MAX_REF_CHARS + 1) }, candidates: [] },
      },
      { label: '§3.5 negative cycle_number ⇒ 400', body: { cycle: { ...GOOD_CYCLE, cycle_number: -1 }, candidates: [] } },
      {
        label: '§3.6 unknown cycle_outcome ⇒ 400',
        body: { cycle: { ...GOOD_CYCLE, cycle_outcome: 'made_up' }, candidates: [] },
      },
      {
        label: "§3.7 cycle_outcome 'rejected_by_guardrail' (a candidate-only value) rejected at cycle level ⇒ 400",
        body: { cycle: { ...GOOD_CYCLE, cycle_outcome: 'rejected_by_guardrail' }, candidates: [] },
      },
      {
        label: `§3.8 > ${MAX_CANDIDATES_PER_WRITE} candidates ⇒ 400 (cap)`,
        body: { cycle: GOOD_CYCLE, candidates: Array.from({ length: MAX_CANDIDATES_PER_WRITE + 1 }, () => GOOD_CANDIDATE) },
      },
      {
        label: '§3.9 unknown heuristic ⇒ 400',
        body: { cycle: GOOD_CYCLE, candidates: [{ ...GOOD_CANDIDATE, heuristic: 'guessing' }] },
      },
      {
        label: '§3.10 empty proposed_action ⇒ 400',
        body: { cycle: GOOD_CYCLE, candidates: [{ ...GOOD_CANDIDATE, proposed_action: '' }] },
      },
      {
        label: `§3.11 proposed_action > ${MAX_PROPOSED_ACTION_CHARS} chars ⇒ 400 (cap)`,
        body: { cycle: GOOD_CYCLE, candidates: [{ ...GOOD_CANDIDATE, proposed_action: 'x'.repeat(MAX_PROPOSED_ACTION_CHARS + 1) }] },
      },
      {
        label: '§3.12 unknown classification_kind ⇒ 400',
        body: { cycle: GOOD_CYCLE, candidates: [{ ...GOOD_CANDIDATE, classification_kind: 'other' }] },
      },
      {
        label: '§3.13 unknown candidate cycle_outcome ⇒ 400',
        body: { cycle: GOOD_CYCLE, candidates: [{ ...GOOD_CANDIDATE, cycle_outcome: 'made_up' }] },
      },
      {
        label:
          "§3.14 RULED §2.2: candidate cycle_outcome 'pending' is REJECTED — a completed cycle's record " +
          'must never carry a pending candidate',
        body: { cycle: GOOD_CYCLE, candidates: [{ ...GOOD_CANDIDATE, cycle_outcome: 'pending' }] },
      },
      {
        label: '§3.15 invalid guardrail_proximity value ⇒ 400',
        body: { cycle: GOOD_CYCLE, candidates: [{ ...GOOD_CANDIDATE, guardrail_proximity: 'excellent' }] },
      },
      {
        label: "§3.16 novelty_basis other than 'insufficient_history' ⇒ 400 (the only basis fresh emits)",
        body: { cycle: GOOD_CYCLE, candidates: [{ ...GOOD_CANDIDATE, novelty_basis: 'made_up' }] },
      },
      {
        label:
          "§3.17 cycle_outcome 'winner' with ZERO winning candidates ⇒ 400 (winner-consistency check)",
        body: { cycle: { ...GOOD_CYCLE, cycle_outcome: 'winner' }, candidates: [GOOD_CANDIDATE] },
      },
      {
        label:
          "§3.18 a non-winner cycle carrying a candidate marked 'winner' ⇒ 400 (winner-consistency check)",
        body: { cycle: GOOD_CYCLE, candidates: [{ ...GOOD_CANDIDATE, cycle_outcome: 'winner' }] },
      },
      {
        label:
          "§3.19 cycle_outcome 'winner' with TWO winning candidates ⇒ 400 (exactly one, not at-most-one)",
        body: {
          cycle: { ...GOOD_CYCLE, cycle_outcome: 'winner' },
          candidates: [
            { ...GOOD_CANDIDATE, cycle_outcome: 'winner' },
            { ...GOOD_CANDIDATE, cycle_outcome: 'winner' },
          ],
        },
      },
    ]
    for (const c of cases) {
      const deps = makeDeps({})
      const res = await runWatchingPost(req({ auth, body: c.body, rawBody: c.rawBody }), deps)
      assert(res.status === 400, c.label)
      assert(deps.insertCalls === 0, `${c.label} — no write on rejection`)
    }
  }

  // ══════════════════════════════════════════════════════════════════════════
  // §4 Vocabulary fidelity to the ruled sets (dimension 4)
  // ══════════════════════════════════════════════════════════════════════════
  {
    assert(
      CYCLE_LEVEL_OUTCOMES.length === 4 &&
        JSON.stringify([...CYCLE_LEVEL_OUTCOMES].sort()) ===
          JSON.stringify(['dependency_unavailable', 'null_cycle', 'terminated_by_timeout', 'winner'].sort()),
      '§4.1 cycle-level outcome CHECK is exactly the four ruled values',
    )
    assert(
      CANDIDATE_LEVEL_OUTCOMES.length === 7 &&
        JSON.stringify([...CANDIDATE_LEVEL_OUTCOMES].sort()) ===
          JSON.stringify(
            [
              'pending',
              'rejected_by_guardrail',
              'rejected_by_novelty',
              'winner',
              'null_cycle',
              'dependency_unavailable',
              'terminated_by_timeout',
            ].sort(),
          ),
      '§4.2 candidate-level outcome CHECK is exactly the seven ruled values (Q6 seventh included)',
    )
    assert(
      CYCLE_LEVEL_OUTCOMES.includes('terminated_by_timeout') &&
        CANDIDATE_LEVEL_OUTCOMES.includes('terminated_by_timeout'),
      '§4.3 QW-C: terminated_by_timeout is the UNIFORM spelling at BOTH levels (not "timeout")',
    )
  }

  // ══════════════════════════════════════════════════════════════════════════
  // §5 The write path — server-stamped identity, idempotency, honest outcomes
  // ══════════════════════════════════════════════════════════════════════════
  {
    const deps = makeDeps({})
    const res = await runWatchingPost(
      req({
        auth: 'Bearer ok',
        body: {
          cycle: { ...GOOD_CYCLE, cost_cents: 42, elapsed_ms: 1000, maximum_duration_ms: 60000, gap_ref: 'sess_1:3:2->3' },
          candidates: [GOOD_CANDIDATE, { ...GOOD_CANDIDATE, cycle_outcome: 'rejected_by_novelty' }],
        },
      }),
      deps,
    )
    assert(res.status === 200, '§5.1 valid write ⇒ 200')
    const body = await res.json()
    assert(body.schema === 'practice-watching-response-v1', '§5.2 response schema tag')
    assert(body.status === 'written' && body.candidates_written === 2, '§5.3 written status + candidate count')
    assert(body.basis === 'runner_composed_self_report', '§5.4 the §2.5 disclosure rides the wire')

    const cycleArg = deps.lastCycle as Record<string, unknown>
    assert(
      cycleArg.agent_id === 'sagereasoning:idea-loop@v1' && cycleArg.owner_user_id === 'owner-1',
      '§5.5 identity is STAMPED SERVER-SIDE from the credential (never caller-supplied — unforgeable)',
    )
    assert(
      cycleArg.credential_ref === 'api_key:cred-9',
      '§5.6 credential_ref is derived from the presenting credential id',
    )
    assert(cycleArg.cost_cents === 42, '§5.7 cost_cents is an INTEGER, round-tripped (the loop-billing contract)')

    // Idempotency — a duplicate write is an honest no-op 200, never a 5xx or a
    // second row (ruled §2.3: a retried write must not duplicate a cycle).
    const dupDeps = makeDeps({ insertDuplicate: true })
    const dupRes = await runWatchingPost(
      req({ auth: 'Bearer ok', body: { cycle: GOOD_CYCLE, candidates: [] } }),
      dupDeps,
    )
    assert(dupRes.status === 200, '§5.8 duplicate (loop_id, cycle_number) ⇒ 200, not an error')
    const dupBody = await dupRes.json()
    assert(dupBody.status === 'duplicate', '§5.9 the response honestly reports the duplicate no-op')

    // A store failure is an honest 503 (never a silent success, never a 500 leak).
    const failDeps = makeDeps({ insertFails: true })
    const prevErr = console.error
    console.error = () => {}
    const failRes = await runWatchingPost(req({ auth: 'Bearer ok', body: { cycle: GOOD_CYCLE, candidates: [] } }), failDeps)
    console.error = prevErr
    assert(failRes.status === 503, '§5.10 store write failure ⇒ honest 503')

    // A candidate-less cycle (e.g. a genuine dependency_unavailable) is legal.
    const emptyCandDeps = makeDeps({})
    const emptyCandRes = await runWatchingPost(
      req({ auth: 'Bearer ok', body: { cycle: { ...GOOD_CYCLE, cycle_outcome: 'dependency_unavailable' }, candidates: [] } }),
      emptyCandDeps,
    )
    assert(emptyCandRes.status === 200, '§5.11 a candidate-less cycle (e.g. dependency_unavailable) is a legal write')
  }

  // ══════════════════════════════════════════════════════════════════════════
  // §6 parseWatchingBody directly — a good multi-candidate body parses whole
  // ══════════════════════════════════════════════════════════════════════════
  {
    const errs: string[] = []
    const parsed = parseWatchingBody(
      { cycle: GOOD_CYCLE, candidates: [GOOD_CANDIDATE, { ...GOOD_CANDIDATE, cycle_outcome: 'rejected_by_novelty' }] },
      errs,
    )
    assert(parsed !== null && parsed.candidates.length === 2 && errs.length === 0, '§6.1 a good multi-candidate body parses whole')
  }

  // ══════════════════════════════════════════════════════════════════════════
  // §7 Source-grep INV pins (wiring — the fresh/r20a pattern)
  // ══════════════════════════════════════════════════════════════════════════
  {
    const routeSrc = readFileSync(join(__dirname, '../route.ts'), 'utf8')
    assert(routeSrc.includes('RATE_LIMITS.publicAgent'), '§7.1 INV: route uses the publicAgent bucket (30/min/IP)')
    assert(!routeSrc.includes('RATE_LIMITS.scoring'), '§7.2 INV: route NEVER uses the scoring bucket (measured-instrument coupling)')
    const exportLines = routeSrc.split('\n').filter((l) => l.startsWith('export '))
    assert(
      exportLines.every((l) => /export async function (POST|OPTIONS)\(/.test(l)),
      '§7.3 INV: route.ts exports ONLY HTTP handlers (Next route-export validation)',
    )
    const handlerSrc = readFileSync(join(__dirname, '../handler.ts'), 'utf8')
    assert(
      !handlerSrc.includes('emission-hooks') && !handlerSrc.includes('emitAccreditation') && !handlerSrc.includes('agent_trust_events'),
      '§7.4 INV: no trust-event write path imported (settled ground, carried from fresh with equal force)',
    )
    assert(
      !handlerSrc.includes('recordLoopBilling') && !handlerSrc.includes('loop-cost-tracker') && !handlerSrc.includes('buildLoopHeaders'),
      '§7.5 INV: no loop-billing write / cost headers (a ruled decision, not an omission)',
    )
    assert(
      handlerSrc.includes("'watching_write'"),
      '§7.6 INV: the route requests the watching_write capability by name (dimension 5)',
    )
    assert(
      handlerSrc.includes('the loop proposes; it never executes') || handlerSrc.includes('Q1 hard constraint'),
      '§7.7 INV: the Q1 hard constraint is carried in the handler docs',
    )
  }

  console.log(`\nwatching-handler battery: ${passed} passed, ${failed} failed`)
  if (failed > 0) {
    console.error('FAILURES:\n - ' + failures.join('\n - '))
    process.exit(1)
  }
}

run().catch((e) => {
  console.error('battery crashed:', e)
  process.exit(1)
})
