/**
 * fresh-handler.test.ts — the /api/practice/fresh route battery (agent-circles,
 * built 2026-08-09 to the RULED endpoint scope; see ../handler.ts header).
 *
 * Plain-assertion script: npx tsx <this file>. Hermetic — injectable deps
 * (fake credential validator + fake window read), no env, no network, no DB.
 *
 * Dimensions (the build prompt's Step-3 house-standard set):
 *   §1 flag-off byte-identity: honest 503, ZERO work (no auth call, no window
 *      read — spied), zero DB touch by construction.
 *   §2 auth: Bearer-only (X-Api-Key refused), invalid/missing token 401,
 *      validator throw ⇒ 401 fail-closed.
 *   §3 input caps + validation rejection paths.
 *   §4 the batch/gapRef-echo round-trip (order preserved).
 *   §5 the ruled Q-C wiring: insufficient_history fires on TOTAL window size,
 *      NOT matching-row count — a populated-but-non-matching window must NOT
 *      trigger it (the exact case the ruling distinguished).
 *   §6 the required window disclosure block + the §2.9 limitation disclosure.
 *   §7 window-read outage ⇒ honest 503 (never a manufactured
 *      insufficient_history pass).
 *   §8 source-grep INV pins: publicAgent (never scoring) rate-limit wiring;
 *      route.ts exports handlers only; no trust-event / billing import.
 */

import { readFileSync } from 'fs'
import { join } from 'path'
import { NextRequest } from 'next/server'
import {
  runFreshPost,
  parseFreshCandidates,
  isFreshEnabled,
  MAX_CANDIDATES,
  MAX_GAPREF_CHARS,
  STRUCTURAL_NOVELTY_LIMITATION,
  type FreshRouteDeps,
} from '../handler'
import type { EvaluatedAction } from '@/lib/substrate/trust-layer/types/evaluation'
import {
  assessStructuralNovelty,
  TAXONOMY_QUESTION_OUTCOME,
} from '@/lib/substrate/idea-loop-types'

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

// ── Fixtures ────────────────────────────────────────────────────────────────

function req(opts: { auth?: string; apiKey?: string; body?: unknown; rawBody?: string }): NextRequest {
  const headers: Record<string, string> = { 'content-type': 'application/json' }
  if (opts.auth) headers['authorization'] = opts.auth
  if (opts.apiKey) headers['x-api-key'] = opts.apiKey
  return new NextRequest('http://localhost/api/practice/fresh', {
    method: 'POST',
    headers,
    ...(opts.rawBody !== undefined
      ? { body: opts.rawBody }
      : opts.body !== undefined
        ? { body: JSON.stringify(opts.body) }
        : {}),
  })
}

/** A minimal EvaluatedAction-shaped history row — only the two structural axes
 *  matter to the novelty check; the rest are inert filler. */
function historyAction(stage: string | null, domains: string[]): EvaluatedAction {
  return {
    receipt_id: 'r',
    agent_id: 'a',
    evaluated_at: '2026-08-01T00:00:00Z',
    proximity: 'deliberate',
    is_kathekon: true,
    kathekon_quality: 'moderate',
    passions_detected: [],
    virtue_domains_engaged: domains,
    oikeiosis_met: null,
    oikeiosis_stage: stage,
    ruling_faculty_state: '',
    skill_id: 's',
    candidates_considered: 1,
  } as EvaluatedAction
}

function makeDeps(opts: {
  enabled?: boolean
  valid?: boolean
  validateThrows?: boolean
  windowActions?: EvaluatedAction[]
  windowFails?: boolean
}): FreshRouteDeps & { validateCalls: number; windowCalls: number; windowCredentialRef: string | null } {
  const state = { validateCalls: 0, windowCalls: 0, windowCredentialRef: null as string | null }
  return {
    get validateCalls() {
      return state.validateCalls
    },
    get windowCalls() {
      return state.windowCalls
    },
    get windowCredentialRef() {
      return state.windowCredentialRef
    },
    isEnabled: () => opts.enabled !== false,
    validateCredential: async () => {
      state.validateCalls++
      if (opts.validateThrows) throw new Error('boom')
      if (opts.valid === false) return { valid: false, error: 'nope' } as never
      return { valid: true, row: { id: 'cred-9' }, capabilities: ['consult'] } as never
    },
    getWindow: async ({ credentialRef }) => {
      state.windowCalls++
      state.windowCredentialRef = credentialRef
      if (opts.windowFails) return { ok: false, error: 'db unavailable' }
      const actions = opts.windowActions ?? []
      return {
        ok: true,
        value: {
          actions,
          windowDays: 90,
          maxInstances: 30,
          earliest: null,
          latest: null,
        },
      }
    },
  }
}

const GOOD_CANDIDATE = {
  gapRef: 'sess_1:1:3->4',
  targetCircle: 4,
  initialClassification: { kind: 'virtue_domain', domains: ['phronesis', 'dikaiosyne'] },
}

async function run(): Promise<void> {
  // ══════════════════════════════════════════════════════════════════════════
  // §1 Flag posture — dark ⇒ honest 503, ZERO work
  // ══════════════════════════════════════════════════════════════════════════
  {
    assert(isFreshEnabled() === false, '§1.1 SUBSTRATE_FRESH_ENABLED unset ⇒ flag reads off')
    const deps = makeDeps({ enabled: false })
    const res = await runFreshPost(req({ auth: 'Bearer sr_prac_x', body: { candidates: [GOOD_CANDIDATE] } }), deps)
    assert(res.status === 503, '§1.2 flag-off ⇒ 503')
    const body = await res.json()
    assert(String(body.note ?? '').includes('SUBSTRATE_FRESH_ENABLED'), '§1.3 503 names the flag honestly')
    assert(deps.validateCalls === 0, '§1.4 flag-off ⇒ NO credential lookup (zero work)')
    assert(deps.windowCalls === 0, '§1.5 flag-off ⇒ NO window read (zero DB touch)')
  }

  // ══════════════════════════════════════════════════════════════════════════
  // §2 Auth — Bearer-only, single non-leaking 401, fail-closed
  // ══════════════════════════════════════════════════════════════════════════
  {
    const noAuth = await runFreshPost(req({ body: { candidates: [GOOD_CANDIDATE] } }), makeDeps({}))
    assert(noAuth.status === 401, '§2.1 missing Authorization ⇒ 401')

    const xApiKey = await runFreshPost(
      req({ apiKey: 'sr_prac_x', body: { candidates: [GOOD_CANDIDATE] } }),
      makeDeps({}),
    )
    assert(xApiKey.status === 401, '§2.2 X-Api-Key transport refused (Bearer-ONLY)')

    const invalid = await runFreshPost(
      req({ auth: 'Bearer bad', body: { candidates: [GOOD_CANDIDATE] } }),
      makeDeps({ valid: false }),
    )
    assert(invalid.status === 401, '§2.3 invalid credential ⇒ 401')

    const throws = await runFreshPost(
      req({ auth: 'Bearer x', body: { candidates: [GOOD_CANDIDATE] } }),
      makeDeps({ validateThrows: true }),
    )
    assert(throws.status === 401, '§2.4 validator throw ⇒ 401 (fail-closed, never 500)')

    const emptyBearer = await runFreshPost(req({ auth: 'Bearer ', body: {} }), makeDeps({}))
    assert(emptyBearer.status === 401, '§2.5 empty Bearer token ⇒ 401')
  }

  // ══════════════════════════════════════════════════════════════════════════
  // §3 Input caps + validation rejections
  // ══════════════════════════════════════════════════════════════════════════
  {
    const auth = 'Bearer ok'
    const cases: Array<{ label: string; body?: unknown; rawBody?: string }> = [
      { label: '§3.1 non-JSON body ⇒ 400', rawBody: 'not json' },
      { label: '§3.2 non-object body ⇒ 400', body: [1] },
      { label: '§3.3 missing candidates ⇒ 400', body: {} },
      { label: '§3.4 empty candidates ⇒ 400', body: { candidates: [] } },
      {
        label: `§3.5 > ${MAX_CANDIDATES} candidates ⇒ 400 (cap)`,
        body: { candidates: Array.from({ length: MAX_CANDIDATES + 1 }, () => GOOD_CANDIDATE) },
      },
      { label: '§3.6 missing gapRef ⇒ 400', body: { candidates: [{ ...GOOD_CANDIDATE, gapRef: '' }] } },
      {
        label: `§3.7 gapRef > ${MAX_GAPREF_CHARS} chars ⇒ 400 (cap)`,
        body: { candidates: [{ ...GOOD_CANDIDATE, gapRef: 'x'.repeat(MAX_GAPREF_CHARS + 1) }] },
      },
      {
        label: '§3.8 targetCircle out of range ⇒ 400',
        body: { candidates: [{ ...GOOD_CANDIDATE, targetCircle: 6 }] },
      },
      {
        label: '§3.9 non-integer targetCircle ⇒ 400',
        body: { candidates: [{ ...GOOD_CANDIDATE, targetCircle: 3.5 }] },
      },
      {
        label: '§3.10 unknown classification kind ⇒ 400',
        body: { candidates: [{ ...GOOD_CANDIDATE, initialClassification: { kind: 'other' } }] },
      },
      {
        label: '§3.11 invalid virtue domain ⇒ 400',
        body: {
          candidates: [
            { ...GOOD_CANDIDATE, initialClassification: { kind: 'virtue_domain', domains: ['hubris'] } },
          ],
        },
      },
      {
        label: '§3.12 duplicate virtue domain ⇒ 400 (would perturb the sorted-join key)',
        body: {
          candidates: [
            {
              ...GOOD_CANDIDATE,
              initialClassification: { kind: 'virtue_domain', domains: ['phronesis', 'phronesis'] },
            },
          ],
        },
      },
      {
        label: '§3.13 empty domains array ⇒ 400',
        body: {
          candidates: [{ ...GOOD_CANDIDATE, initialClassification: { kind: 'virtue_domain', domains: [] } }],
        },
      },
    ]
    for (const c of cases) {
      const deps = makeDeps({})
      const res = await runFreshPost(req({ auth, body: c.body, rawBody: c.rawBody }), deps)
      assert(res.status === 400, c.label)
      assert(deps.windowCalls === 0, `${c.label} — no window read on rejection`)
    }

    // parseFreshCandidates directly: valid batch parses whole, errors aggregate.
    const errs: string[] = []
    const parsed = parseFreshCandidates(
      [GOOD_CANDIDATE, { gapRef: 'g2', initialClassification: { kind: 'preferred_indifferent' } }],
      errs,
    )
    assert(parsed !== null && parsed.length === 2 && errs.length === 0, '§3.14 valid batch parses (incl. axis-free friction entry)')
  }

  // ══════════════════════════════════════════════════════════════════════════
  // §4 Batch round-trip — gapRef echo, order preserved
  // ══════════════════════════════════════════════════════════════════════════
  {
    const window = [
      historyAction('local_community', ['phronesis', 'dikaiosyne']),
      historyAction('local_community', ['dikaiosyne', 'phronesis']),
      historyAction('local_community', ['phronesis', 'dikaiosyne']),
      historyAction('cosmopolis', ['andreia']),
    ]
    const deps = makeDeps({ windowActions: window })
    const res = await runFreshPost(
      req({
        auth: 'Bearer ok',
        body: {
          candidates: [
            { gapRef: 'g-a', targetCircle: 3, initialClassification: { kind: 'virtue_domain', domains: ['phronesis', 'dikaiosyne'] } },
            { gapRef: 'g-b', targetCircle: 4, initialClassification: { kind: 'virtue_domain', domains: ['sophrosyne'] } },
            { gapRef: 'g-c', initialClassification: { kind: 'preferred_indifferent' } },
          ],
        },
      }),
      deps,
    )
    assert(res.status === 200, '§4.1 valid batch ⇒ 200')
    const body = await res.json()
    assert(body.schema === 'practice-fresh-response-v1', '§4.2 response schema tag')
    assert(Array.isArray(body.results) && body.results.length === 3, '§4.3 one result per candidate')
    assert(
      body.results[0].gapRef === 'g-a' && body.results[1].gapRef === 'g-b' && body.results[2].gapRef === 'g-c',
      '§4.4 gapRef echoed, order preserved',
    )
    // g-a: 3 matching rows (rank-3 circle + set-equal domains) = at floor ⇒ NOT novel.
    assert(body.results[0].passedNoveltyCheck === false && body.results[0].noveltyConfidence === 0, '§4.5 at-floor candidate fails novelty (wire names mirror GeneratedCandidate)')
    assert(body.results[0].basis === undefined, '§4.6 populated-window verdict carries no basis field')
    // g-b: populated window, zero matches ⇒ genuinely novel at full curve confidence.
    assert(body.results[1].passedNoveltyCheck === true && body.results[1].noveltyConfidence === 1 && body.results[1].basis === undefined, '§4.7 genuinely-novel candidate: full confidence, NO insufficient_history')
    // g-c: friction candidate surfaced unchanged.
    assert(body.results[2].passedNoveltyCheck === true && body.results[2].noveltyConfidence === 0 && body.results[2].basis === undefined, '§4.8 friction candidate surfaced unchanged (novel, zero confidence, no basis)')
    assert(deps.windowCalls === 1, '§4.9 ONE window read per batch (amortised)')
    assert(deps.windowCredentialRef === 'api_key:cred-9', '§4.10 window scoped to the PRESENTING credential (R17a)')
  }

  // ══════════════════════════════════════════════════════════════════════════
  // §5 The ruled Q-C wiring — TOTAL window size, not matching-row count
  // ══════════════════════════════════════════════════════════════════════════
  {
    // Starved window (2 rows < EVIDENCE_FLOOR) ⇒ insufficient_history, even
    // though both rows MATCH the candidate.
    const starved = makeDeps({
      windowActions: [
        historyAction('cosmopolis', ['phronesis', 'dikaiosyne']),
        historyAction('cosmopolis', ['phronesis', 'dikaiosyne']),
      ],
    })
    const r1 = await runFreshPost(
      req({ auth: 'Bearer ok', body: { candidates: [GOOD_CANDIDATE] } }),
      starved,
    )
    const b1 = await r1.json()
    assert(
      b1.results[0].passedNoveltyCheck === true &&
        b1.results[0].noveltyConfidence === 0 &&
        b1.results[0].basis === 'insufficient_history',
      '§5.1 below-floor TOTAL window ⇒ insufficient_history / true / 0 (even with matching rows)',
    )

    // Empty window ⇒ same honest outcome (the fresh-runner-identity case the
    // ruling called "foreseeable and common, not an edge case").
    const empty = makeDeps({ windowActions: [] })
    const r2 = await runFreshPost(req({ auth: 'Bearer ok', body: { candidates: [GOOD_CANDIDATE] } }), empty)
    const b2 = await r2.json()
    assert(b2.results[0].basis === 'insufficient_history' && b2.results[0].noveltyConfidence === 0, '§5.2 empty window ⇒ insufficient_history, zero claimed confidence (never 1.0)')

    // THE EXACT CASE THE RULING DISTINGUISHED: populated window (≥ floor),
    // zero matching rows ⇒ genuinely novel, NOT insufficient_history.
    const populated = makeDeps({
      windowActions: [
        historyAction('household', ['sophrosyne']),
        historyAction('household', ['sophrosyne']),
        historyAction('household', ['andreia']),
      ],
    })
    const r3 = await runFreshPost(req({ auth: 'Bearer ok', body: { candidates: [GOOD_CANDIDATE] } }), populated)
    const b3 = await r3.json()
    assert(
      b3.results[0].passedNoveltyCheck === true &&
        b3.results[0].noveltyConfidence === 1 &&
        b3.results[0].basis === undefined,
      '§5.3 populated-but-non-matching window ⇒ genuinely novel at curve confidence, NOT insufficient_history (the ruled distinction)',
    )
  }

  // ══════════════════════════════════════════════════════════════════════════
  // §6 The required disclosure block + limitation
  // ══════════════════════════════════════════════════════════════════════════
  {
    const deps = makeDeps({ windowActions: [historyAction('household', ['andreia'])] })
    const res = await runFreshPost(req({ auth: 'Bearer ok', body: { candidates: [GOOD_CANDIDATE] } }), deps)
    const body = await res.json()
    assert(
      body.window &&
        body.window.rows_in_window === 1 &&
        body.window.window_days === 90 &&
        body.window.max_rows === 30 &&
        body.window.basis === 'credential_ref',
      '§6.1 the ruled per-call window disclosure block { rows_in_window, window_days, max_rows, basis } is present + exact',
    )
    assert(
      typeof body.limitation === 'string' && body.limitation === STRUCTURAL_NOVELTY_LIMITATION && body.limitation.includes('substantively different'),
      '§6.2 the §2.9 structural-novelty-only limitation is disclosed on the response',
    )
  }

  // ══════════════════════════════════════════════════════════════════════════
  // §7 Window-read outage ⇒ honest 503, never a manufactured pass
  // ══════════════════════════════════════════════════════════════════════════
  {
    const deps = makeDeps({ windowFails: true })
    const prevErr = console.error
    console.error = () => {}
    const res = await runFreshPost(req({ auth: 'Bearer ok', body: { candidates: [GOOD_CANDIDATE] } }), deps)
    console.error = prevErr
    assert(res.status === 503, '§7.1 window-read failure ⇒ 503 (an outage is NEVER an empty window / insufficient_history pass)')
    const body = await res.json()
    assert(body.error === 'service error' && body.results === undefined, '§7.2 outage response carries no verdicts')
  }

  // ══════════════════════════════════════════════════════════════════════════
  // §8 Source-grep INV pins (wiring — the r20a pattern)
  // ══════════════════════════════════════════════════════════════════════════
  {
    const routeSrc = readFileSync(join(__dirname, '../route.ts'), 'utf8')
    assert(routeSrc.includes('RATE_LIMITS.publicAgent'), '§8.1 INV: route uses the publicAgent bucket (30/min/IP, the discernment sibling)')
    assert(!routeSrc.includes('RATE_LIMITS.scoring'), '§8.2 INV: route NEVER uses the scoring bucket (IP-shared with /api/reason — the measured-instrument coupling lesson)')
    const exportLines = routeSrc.split('\n').filter((l) => l.startsWith('export '))
    assert(
      exportLines.every((l) => /export async function (POST|OPTIONS)\(/.test(l)),
      '§8.3 INV: route.ts exports ONLY HTTP handlers (Next route-export validation)',
    )
    const handlerSrc = readFileSync(join(__dirname, '../handler.ts'), 'utf8')
    assert(
      !handlerSrc.includes('emission-hooks') && !handlerSrc.includes('emitAccreditation') && !handlerSrc.includes('agent_trust_events'),
      '§8.4 INV: no trust-event write path imported (settled ground: "the endpoint writes no trust event")',
    )
    assert(
      !handlerSrc.includes('recordLoopBilling') && !handlerSrc.includes('loop-cost-tracker') && !handlerSrc.includes('buildLoopHeaders'),
      '§8.5 INV: no loop-billing write / cost headers (the ruled §2.6 decision, not an omission)',
    )
    assert(
      handlerSrc.includes('getTrajectoryWindow'),
      '§8.6 INV: the history read is the EXISTING getTrajectoryWindow (no new windowing code — Q-B ruled)',
    )
    assert(
      handlerSrc.includes('the endpoint writes no trust event; any future novelty event ') ||
        handlerSrc.includes('the endpoint writes no trust event; any future novelty event'),
      '§8.7 INV: the settled statement is carried verbatim in the handler docs',
    )
  }

  // ══════════════════════════════════════════════════════════════════════════
  // §9 The curiosity-trigger seam (stub, 2026-08-19; placement RULED
  //    2026-08-18 Q5). The seam is a PURE PASS-THROUGH, so the load-bearing
  //    assertion is a NEGATIVE one: wiring it changed no byte of this route's
  //    response. §9.1–§9.3 prove that behaviourally, end-to-end through the
  //    real handler, against the pure function computed independently.
  //    idea-loop-types.test.ts §6 covers the trigger's own branch behaviour.
  // ══════════════════════════════════════════════════════════════════════════
  {
    // A populated window (≥ EVIDENCE_FLOOR rows in total) with no rows matching
    // the candidate ⇒ the GENUINE confirmation branch, which is the only branch
    // that makes the seam do anything at all. If the seam could perturb a
    // response, this is where it would show.
    const windowActions = [
      historyAction('household', ['sophrosyne']),
      historyAction('household', ['sophrosyne']),
      historyAction('household', ['sophrosyne']),
      historyAction('cosmopolis', ['phronesis']),
    ]
    const deps = makeDeps({ windowActions })
    const res = await runFreshPost(
      req({ auth: 'Bearer tok', body: { candidates: [GOOD_CANDIDATE] } }),
      deps,
    )
    assert(res.status === 200, '§9.1 the genuine-confirmation path still returns 200 with the seam wired')
    const body = await res.json()

    // Compute the expected result from the PURE function directly — the seam is
    // deliberately not in this path, so any divergence is the seam's doing.
    const pure = assessStructuralNovelty(
      {
        targetCircle: 4,
        initialClassification: { kind: 'virtue_domain', domains: ['phronesis', 'dikaiosyne'] },
      },
      windowActions,
    )
    assert(
      pure.novel === true && pure.confidence > 0 && pure.basis === undefined,
      '§9.2a the fixture really is the genuine-confirmation branch (non-vacuity floor — otherwise §9.3 would pass on an inert branch)',
    )
    assert(
      body.results?.[0]?.passedNoveltyCheck === pure.novel &&
        body.results?.[0]?.noveltyConfidence === pure.confidence &&
        body.results?.[0]?.basis === undefined,
      '§9.2b the response equals the PURE verdict exactly — the seam altered nothing',
    )
    assert(
      body.results?.[0]?.gapRef === GOOD_CANDIDATE.gapRef && body.results.length === 1,
      '§9.3 the gapRef echo and result count are unchanged by the seam',
    )

    // §9.4 — BEHAVIOURAL wiring pin (added at the PR19 fold). A pure
    // pass-through cannot be detected by its output, so §9.2b would pass whether
    // or not the seam is wired. Its one observable is the log line — capture it
    // and prove the seam actually fires end-to-end through the REAL handler.
    // Sequential stub/restore inside this awaited block; no concurrent async
    // block runs alongside it (memory `async-test-console-stub-race`).
    const originalLog = console.log
    const captured: unknown[][] = []
    console.log = (...args: unknown[]) => {
      captured.push(args)
    }
    let logRes: Response | null = null
    try {
      logRes = await runFreshPost(
        req({ auth: 'Bearer tok', body: { candidates: [GOOD_CANDIDATE] } }),
        makeDeps({ windowActions }),
      )
    } finally {
      console.log = originalLog
    }
    assert(logRes?.status === 200, '§9.4a the captured run returned 200')
    const triggerLines = captured.filter((l) =>
      String(l[0] ?? '').includes('[curiosity-trigger]'),
    )
    assert(
      triggerLines.length === 1,
      `§9.4b BEHAVIOURAL: the seam genuinely fires once through the live handler on a genuine confirmation (got ${triggerLines.length}) — this is what a source-grep alone cannot prove`,
    )

    // §9.4c — the structural half, comment-stripped so a mention of the call in
    // a comment cannot satisfy it (PR19 found the un-stripped form was
    // comment-satisfiable).
    const handlerSrc = readFileSync(join(__dirname, '../handler.ts'), 'utf8')
    const handlerCode = handlerSrc
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .split('\n')
      .filter((l) => !l.trim().startsWith('//'))
      .join('\n')
    assert(
      handlerCode.includes(
        'noteCuriosityTrigger(assessStructuralNovelty(candidate, historyWindow))',
      ),
      '§9.4c INV: the seam wraps the assessment AT the confirmation point in CODE, not in a comment (RULED placement — server-side, beside the taxonomy stub)',
    )
    assert(
      !handlerSrc.includes(TAXONOMY_QUESTION_OUTCOME),
      '§9.5 INV: this LIVE route carries no taxonomy_question literal — the stub is code-only and its migration is deferred (RULED Q1)',
    )
  }

  console.log(`\nfresh-handler battery: ${passed} passed, ${failed} failed`)
  if (failed > 0) {
    console.error('FAILURES:\n - ' + failures.join('\n - '))
    process.exit(1)
  }
}

run().catch((e) => {
  console.error('battery crashed:', e)
  process.exit(1)
})
