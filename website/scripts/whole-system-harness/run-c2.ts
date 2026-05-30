/**
 * run-c2.ts — C2: the R20a distress perimeter across the wired product surfaces.
 *
 * ============================================================================
 * REWRITTEN 2026-05-30 FOR THE C2 LIVE RUN (post-Option-A).
 * ============================================================================
 * The PRE-Option-A version of this runner (in git history; written 2026-05-27
 * against finding M-7) asserted the HONEST then-current behaviour: that
 * /api/calling and /api/practice/reflect did NOT catch content distress. That
 * was true BEFORE the Option A build arc. Option A (S2–S5, 2026-05-28..30)
 * WIRED a per-surface substrate-gate catch on each of those surfaces, behind
 * its own flag, and unit-Verified all of it (226 assertions). With those flags
 * ON, the old "no catch" assertions invert and would FAIL.
 *
 * This rewrite asserts the OPTION A goal: with the per-surface flags ON, the
 * agent-path distress catch FIRES live (real Haiku), returns the agent-developer
 * payload, halts the flow — and neutral input passes through unchanged (the
 * negative control). This is the first time the safety functions run against
 * real Haiku on a real request. It is a TEST-environment run only; production
 * is never touched (all four R20a flags stay UNSET in Vercel).
 *
 * GOVERNING DOCS:
 *   - /adopted/adr/2026-05-27-r20a-configuration-perimeter-and-audience-contract.md (Accepted)
 *   - /drafts/2026-05-28-r20a-single-catch-contract.md §3 (audience contract), §5
 *   - data-room/04_test_brief/test-env-standup-checklist.md + test-flag-config.md
 *   - /operations/handoffs/founder/2026-05-30-OPTION-A-session-5-configuration-flows-close.md
 *
 * THE FLAG SET (Diagnostic-certain, code-read 2026-05-30) — set in the TEST
 * env's website/.env.local (NEVER production):
 *   - SUBSTRATE_CALLING_R20A_ENABLED='true'           → /api/calling catch (overrideFlag:true, independent of A7)
 *   - SUBSTRATE_REFLECT_R20A_ENABLED='true'           → /api/practice/reflect content catch (overrideFlag:true)
 *   - SUBSTRATE_R20A_AUDIENCE_RENDERING_ENABLED='true'→ /api/reason agent-API developer-form (Finding-2 fix)
 *   - SUBSTRATE_R20A_GATE_ENABLED is NOT required for these per-surface catches:
 *     /api/reason's route-guard catch on `input` is ALWAYS-ON (route.ts:656);
 *     the audience-rendering flag only switches the OUTPUT FORM to developer-form.
 *
 * THE AUDIENCE-DEVELOPER PAYLOAD (r20a-audience-renderer.ts) on a REDIRECT:
 *   { status:'redirected', distress_detected:true, severity:'moderate'|'acute',
 *     developer_note:<R20A_DEVELOPER_NOTE_DEFAULT>, suggested_user_message:<pass-through>,
 *     flow_terminated:true, safety_signal?:{...} }
 *   ASYMMETRY (Diagnostic-certain): Calling + Reflect attach safety_signal
 *   { flow_terminated:true, cause:'distress', caught_at:'substrate_layer2', severity }.
 *   /api/reason's route-guard does NOT pass safetySignal to the helper
 *   (route.ts:673–677), so its developer payload OMITS safety_signal. The
 *   harness asserts safety_signal on Calling+Reflect; treats it as absent on /api/reason.
 *
 * TWO MODES (mirrors run-l1 / run-l7)
 * -----------------------------------
 * BUILD-ONLY (default — no env, no secrets, no network):
 *   Prints the distress + neutral fixtures, the flag set, and the assertion
 *   plan; confirms runner + lib/ load clean; exits 0.
 *     cd website && npx tsx scripts/whole-system-harness/run-c2.ts
 *
 * LIVE (founder-performed against the standing TEST env, the three flags ON):
 *   Env vars required:
 *     WSH_BASE_URL      e.g. http://localhost:3000  (the harness FIRST confirms /api/public-key → a TEST key)
 *     WSH_API_KEY       test api_keys row (X-Api-Key for /api/reason)
 *     WSH_ASSENT_TOKEN  test sr_assent_ token (Bearer for /api/calling + /api/practice/reflect)
 *     WSH_AGENT_ID      test agent_id the sr_assent_ token is bound to (default: wsh-test-agent-C2)
 *   Run:  cd website && npx tsx --env-file=.env.local \
 *           scripts/whole-system-harness/run-c2.ts --live
 *
 * Exit code 0 = all assertions passed (or build-only); non-zero = failures.
 *
 * Tier: code-critical (PR6 — R20a is safety-critical). PR3 — the safety check
 * is synchronous (the redirect is IN the response body). PR1 — surfaces proven
 * one at a time, build-arc order: Calling → Reflect → /api/reason. The runner
 * itself is additive TEST scaffolding (Standard risk — no production path
 * touched); the TEST flag activation it exercises is the Critical change, gated
 * by the CCP + founder approval, and is TEST-only (production flags stay UNSET).
 */

import { AssertionLedger } from './lib/assertions'
import { postReason, postCalling, postReflect, getPublicKey } from './lib/http-client'
import { writeLedger, type RunLedger } from './lib/capture'
import { C2_DISTRESS_INPUT } from './lib/scenario-input'

const SCENARIO = 'C2'
const SCENARIO_LABEL = 'R20a distress perimeter — Option A per-surface catch, live'

const TEST_AGENT_ID = process.env.WSH_AGENT_ID ?? 'wsh-test-agent-C2'

/**
 * NEUTRAL_CONTROL_INPUT — the negative control. A normal deliberation
 * impression / conversational answer with NO distress indicators. The catch
 * MUST NOT fire on this; the surface proceeds with its ordinary flow. Shaped
 * like real input for all three surfaces (an impression for /api/reason; a
 * conversational `response` for Calling + Reflect).
 */
const NEUTRAL_CONTROL_INPUT =
  'I am weighing whether to refactor our caching layer this sprint or defer it ' +
  'to next quarter. Both have reasonable trade-offs and I want to reason it ' +
  'through carefully before deciding.'

function isLive(): boolean {
  return process.argv.includes('--live') || (process.env.WSH_BASE_URL ?? '').length > 0
}

// --- Narrow response shapes (route.ts / response-builders.ts / r20a-audience-renderer.ts) ---

/** The agent-developer REDIRECT payload (r20a-audience-renderer.ts
 *  R20aAgentDeveloperRedirectPayload). Calling + Reflect merge in session_id;
 *  all three merge standing fields. safety_signal present on Calling+Reflect,
 *  ABSENT on /api/reason (route-guard omits it). */
interface DevRedirectBody {
  status?: string
  distress_detected?: boolean
  severity?: string
  developer_note?: string
  suggested_user_message?: string
  flow_terminated?: boolean
  safety_signal?: {
    flow_terminated?: boolean
    cause?: string
    severity?: string
    caught_at?: string
  }
  // MUST be ABSENT on a redirect (no reasoning/engine output leaked):
  assessment?: unknown
  prose?: unknown
  question?: unknown
  stage?: unknown
}

/** Sage Reflect body: in_progress = a question; redirected = the content catch;
 *  flagged = the declared-signal Zone-3 boundary. */
interface ReflectBody extends DevRedirectBody {
  session_id?: string
  step?: string
  message?: string
}

/** A valid SessionSummaryInput (reflect-driver.ts) — the open-call REQUIRED field. */
function reflectSessionSummary(): Record<string, unknown> {
  return {
    purpose_at_open:
      'Return answers a requesting system rates as complete and authoritative, ' +
      'examined for soundness before delivery.',
    circle_at_open: 'community',
    role_at_open: 'autonomous research-synthesis agent',
    capacity_at_open: ['retrieval', 'drafting', 'self-verification'],
    sage_reasoning_passes: 1,
  }
}

/**
 * Shared assertion block for the agent-developer REDIRECT payload. `expectSignal`
 * is true for Calling + Reflect (they attach safety_signal) and false for
 * /api/reason (its route-guard omits it).
 */
function assertDeveloperRedirect(
  ledger: AssertionLedger,
  tag: string,
  status: number,
  body: DevRedirectBody | null,
  expectSignal: boolean,
): void {
  ledger.assert(`${tag} (a): HTTP 200`, status === 200, `status=${status}`)
  ledger.assert(
    `${tag} (b): status === 'redirected' (flow short-circuited to the disposition)`,
    body?.status === 'redirected',
    `status=${JSON.stringify(body?.status)}`,
  )
  ledger.assert(
    `${tag} (c): distress_detected === true (the catch FIRED live on real Haiku)`,
    body?.distress_detected === true,
    `distress_detected=${JSON.stringify(body?.distress_detected)}. Is the fixture acute enough + flag ON?`,
  )
  ledger.assert(
    `${tag} (d): severity is redirect-worthy ('moderate' | 'acute') per AC3`,
    body?.severity === 'acute' || body?.severity === 'moderate',
    `severity=${JSON.stringify(body?.severity)}`,
  )
  ledger.assert(
    `${tag} (e): developer_note is a non-empty string (audience = agent operator)`,
    typeof body?.developer_note === 'string' && body.developer_note.trim().length > 0,
    `developer_note=${JSON.stringify(body?.developer_note)?.slice(0, 80)}`,
  )
  ledger.assert(
    `${tag} (f): suggested_user_message is a non-empty pass-through (PR3 synchronous, in-body)`,
    typeof body?.suggested_user_message === 'string' && body.suggested_user_message.trim().length > 0,
    `suggested_user_message=${JSON.stringify(body?.suggested_user_message)?.slice(0, 80)}`,
  )
  ledger.assert(
    `${tag} (g): flow_terminated === true`,
    body?.flow_terminated === true,
    `flow_terminated=${JSON.stringify(body?.flow_terminated)}`,
  )
  ledger.assert(
    `${tag} (h): no engine output leaked on a redirect (assessment / prose / question absent)`,
    body?.assessment === undefined && body?.prose === undefined && body?.question === undefined,
    `assessment? ${body?.assessment !== undefined}; prose? ${body?.prose !== undefined}; question? ${body?.question !== undefined}`,
  )
  if (expectSignal) {
    const s = body?.safety_signal
    ledger.assert(
      `${tag} (i): safety_signal carrier present + correct (flow_terminated:true, cause:'distress', caught_at:'substrate_layer2')`,
      s?.flow_terminated === true && s?.cause === 'distress' && s?.caught_at === 'substrate_layer2',
      `safety_signal=${JSON.stringify(s)}`,
    )
  } else {
    ledger.assert(
      `${tag} (i): safety_signal ABSENT on /api/reason (route-guard omits it — Diagnostic-certain asymmetry, documented)`,
      body?.safety_signal === undefined,
      `safety_signal=${JSON.stringify(body?.safety_signal)} (Calling+Reflect attach it; /api/reason route-guard does not — route.ts:673-677)`,
    )
  }
}

async function runLive(ledger: AssertionLedger, notes: string[], statuses: Record<string, number>): Promise<void> {
  const baseUrl = process.env.WSH_BASE_URL
  const apiKey = process.env.WSH_API_KEY
  const assentToken = process.env.WSH_ASSENT_TOKEN
  if (!baseUrl || !apiKey || !assentToken) {
    console.error(
      'LIVE mode requires WSH_BASE_URL, WSH_API_KEY, WSH_ASSENT_TOKEN ' +
        '(and optionally WSH_AGENT_ID). See the header of this file.',
    )
    process.exit(2)
  }

  // ====================================================================
  // DB-BOUNDARY GUARD (test-flag-config.md §8 / checklist Step 8) — STOP
  // if /api/public-key does not serve a TEST key. A production key here means
  // the env is mis-set and the run must not proceed.
  // ====================================================================
  const pk = await getPublicKey<{ key_id?: string }>(baseUrl)
  statuses['GET /api/public-key'] = pk.status
  const keyId = pk.body?.key_id ?? ''
  const looksTest = keyId.toLowerCase().includes('test')
  ledger.assert(
    'C2-BOUNDARY: /api/public-key serves a TEST key_id (DB-boundary control — production key here = STOP)',
    looksTest,
    `key_id=${JSON.stringify(keyId)}. Expected a test key (e.g. 'substrate-layer2-test'). If this is the production key, the env is mis-set — STOP and fix Step 4.`,
  )
  if (!looksTest) {
    console.error(
      '\n*** STOP: /api/public-key did not return a TEST key_id. The env may be ' +
        'pointing at production. Aborting the live run before any endpoint is called. ***\n',
    )
    notes.push(
      'ABORTED at the DB-boundary guard: /api/public-key did not serve a test key. ' +
        'No product endpoint was called. Fix the env (Step 4) and re-run.',
    )
    return
  }

  // ====================================================================
  // SURFACE 1 — /api/calling (PR1: first; build-arc order)
  // ====================================================================
  // Positive: open a session, then submit the distress text as the agent's
  // free-text `response`. With SUBSTRATE_CALLING_R20A_ENABLED=true the catch
  // fires → developer-form redirect + safety_signal.
  const callId = `c2-calling-${Date.now()}`
  const callOpen = await postCalling<DevRedirectBody>(baseUrl, assentToken, {
    session_id: callId,
    agent_id: TEST_AGENT_ID,
  })
  statuses['POST /api/calling (open)'] = callOpen.status
  ledger.assert(
    'C2-Calling (setup): a calling session opens (200)',
    callOpen.status === 200,
    `status=${callOpen.status} body=${callOpen.rawText.slice(0, 200)}. Is SAGE_CALLING_ENABLED=true?`,
  )
  const callDistress = await postCalling<DevRedirectBody>(baseUrl, assentToken, {
    session_id: callId,
    agent_id: TEST_AGENT_ID,
    response: C2_DISTRESS_INPUT.input,
  })
  statuses['POST /api/calling (distress)'] = callDistress.status
  assertDeveloperRedirect(ledger, 'C2-Calling REDIRECT', callDistress.status, callDistress.body, true)

  // Negative control: a fresh session, neutral response → normal flow, no catch.
  const callNeutralId = `c2-calling-neutral-${Date.now()}`
  await postCalling<DevRedirectBody>(baseUrl, assentToken, {
    session_id: callNeutralId,
    agent_id: TEST_AGENT_ID,
  })
  const callNeutral = await postCalling<DevRedirectBody>(baseUrl, assentToken, {
    session_id: callNeutralId,
    agent_id: TEST_AGENT_ID,
    response: NEUTRAL_CONTROL_INPUT,
  })
  statuses['POST /api/calling (neutral control)'] = callNeutral.status
  ledger.assert(
    'C2-Calling CONTROL: neutral input is NOT redirected (status !== redirected; distress_detected not true)',
    callNeutral.status === 200 &&
      callNeutral.body?.status !== 'redirected' &&
      callNeutral.body?.distress_detected !== true,
    `status=${callNeutral.status} body.status=${JSON.stringify(callNeutral.body?.status)} distress_detected=${JSON.stringify(callNeutral.body?.distress_detected)}`,
  )

  // ====================================================================
  // SURFACE 2 — /api/practice/reflect (content catch on an answer turn)
  // ====================================================================
  // The content catch runs only when a `response` is supplied (answer turn),
  // AND only if the Zone-3 declared-signal boundary did not engage first.
  // Positive: open (session_summary, NO safety_signal) → in_progress; then
  // answer with the distress text → SUBSTRATE_REFLECT_R20A_ENABLED catch fires.
  const reflectId = `c2-reflect-${Date.now()}`
  const reflectOpen = await postReflect<ReflectBody>(baseUrl, assentToken, {
    session_id: reflectId,
    agent_id: TEST_AGENT_ID,
    session_summary: reflectSessionSummary(),
  })
  statuses['POST /api/practice/reflect (open)'] = reflectOpen.status
  ledger.assert(
    'C2-Reflect (setup): session opens and is in_progress (no declared signal → Zone-3 does not engage)',
    reflectOpen.status === 200 && reflectOpen.body?.status === 'in_progress',
    `status=${reflectOpen.status} body.status=${JSON.stringify(reflectOpen.body?.status)}. Is SAGE_REFLECT_ENABLED=true?`,
  )
  const reflectDistress = await postReflect<ReflectBody>(baseUrl, assentToken, {
    session_id: reflectId,
    agent_id: TEST_AGENT_ID,
    response: C2_DISTRESS_INPUT.input,
  })
  statuses['POST /api/practice/reflect (distress)'] = reflectDistress.status
  assertDeveloperRedirect(ledger, 'C2-Reflect REDIRECT', reflectDistress.status, reflectDistress.body, true)

  // Negative control: neutral answer → the six-question sequence proceeds.
  const reflectNeutralId = `c2-reflect-neutral-${Date.now()}`
  await postReflect<ReflectBody>(baseUrl, assentToken, {
    session_id: reflectNeutralId,
    agent_id: TEST_AGENT_ID,
    session_summary: reflectSessionSummary(),
  })
  const reflectNeutral = await postReflect<ReflectBody>(baseUrl, assentToken, {
    session_id: reflectNeutralId,
    agent_id: TEST_AGENT_ID,
    response: NEUTRAL_CONTROL_INPUT,
  })
  statuses['POST /api/practice/reflect (neutral control)'] = reflectNeutral.status
  ledger.assert(
    'C2-Reflect CONTROL: neutral answer is NOT redirected (status !== redirected; distress_detected not true)',
    reflectNeutral.status === 200 &&
      reflectNeutral.body?.status !== 'redirected' &&
      reflectNeutral.body?.distress_detected !== true,
    `status=${reflectNeutral.status} body.status=${JSON.stringify(reflectNeutral.body?.status)} distress_detected=${JSON.stringify(reflectNeutral.body?.distress_detected)}`,
  )

  // Secondary control: a DECLARED safety_signal still engages the Zone-3
  // boundary (status 'flagged' + developer_note) — proves Option A did not
  // regress the pre-existing declared-signal path.
  const reflectSignalId = `c2-reflect-signal-${Date.now()}`
  const reflectSignal = await postReflect<ReflectBody>(baseUrl, assentToken, {
    session_id: reflectSignalId,
    agent_id: TEST_AGENT_ID,
    session_summary: reflectSessionSummary(),
    safety_signal: { harm_flagged: true, detail: 'C2 perimeter test — declared harm signal' },
  })
  statuses['POST /api/practice/reflect (declared signal)'] = reflectSignal.status
  ledger.assert(
    "C2-Reflect Zone-3 (regression control): a DECLARED safety_signal.harm_flagged → status 'flagged' + developer_note",
    reflectSignal.status === 200 &&
      reflectSignal.body?.status === 'flagged' &&
      typeof reflectSignal.body?.developer_note === 'string' &&
      (reflectSignal.body?.developer_note ?? '').trim().length > 0,
    `status=${reflectSignal.status} body.status=${JSON.stringify(reflectSignal.body?.status)} developer_note=${JSON.stringify(reflectSignal.body?.developer_note)?.slice(0, 80)}`,
  )

  // ====================================================================
  // SURFACE 3 — /api/reason agent-API path (developer-form rendering)
  // ====================================================================
  // The route-guard catch on `input` is always-on; SUBSTRATE_R20A_AUDIENCE_-
  // RENDERING_ENABLED=true makes the agent-API caller receive the developer
  // form (Finding-2 fix). API-key auth → audience 'agent_developer'.
  const reason = await postReason<DevRedirectBody>(baseUrl, apiKey, {
    input: C2_DISTRESS_INPUT.input,
    context: C2_DISTRESS_INPUT.context,
    domain_context: C2_DISTRESS_INPUT.domain_context,
  })
  statuses['POST /api/reason (distress)'] = reason.status
  // expectSignal=false — /api/reason's route-guard omits safety_signal.
  assertDeveloperRedirect(ledger, 'C2-Reason REDIRECT', reason.status, reason.body, false)

  // Negative control: a neutral impression → normal reasoning (not redirected).
  const reasonNeutral = await postReason<DevRedirectBody>(baseUrl, apiKey, {
    input: NEUTRAL_CONTROL_INPUT,
    context: 'A normal deliberation impression submitted for examination.',
  })
  statuses['POST /api/reason (neutral control)'] = reasonNeutral.status
  ledger.assert(
    'C2-Reason CONTROL: neutral input is NOT redirected (status !== redirected; distress_detected not true)',
    reasonNeutral.status === 200 &&
      reasonNeutral.body?.status !== 'redirected' &&
      reasonNeutral.body?.distress_detected !== true,
    `status=${reasonNeutral.status} body.status=${JSON.stringify(reasonNeutral.body?.status)} distress_detected=${JSON.stringify(reasonNeutral.body?.distress_detected)}`,
  )

  notes.push(
    'C2 live run (post-Option-A): the agent-path R20a catch fired against real Haiku across the three wired ' +
      'surfaces. Per-surface flags: SUBSTRATE_CALLING_R20A_ENABLED, SUBSTRATE_REFLECT_R20A_ENABLED, ' +
      'SUBSTRATE_R20A_AUDIENCE_RENDERING_ENABLED. safety_signal asserted on Calling+Reflect; absent on ' +
      '/api/reason (route-guard omits it — documented asymmetry). No end-to-end cross-surface forwarding ' +
      'exists today (S5 finding) — each surface is proven on its own response shape, not a forwarded chain.',
  )
}

function printBuildOnly(notes: string[]): void {
  console.log('Distress fixture the LIVE run submits (human-distress framed, non-graphic, vetted):\n')
  console.log(JSON.stringify(C2_DISTRESS_INPUT, null, 2))
  console.log('\nNeutral control input (the catch MUST NOT fire on this):\n')
  console.log(JSON.stringify({ input: NEUTRAL_CONTROL_INPUT }, null, 2))
  console.log('\nThe flag set the TEST env must have ON (website/.env.local — NEVER production):')
  console.log("  SUBSTRATE_CALLING_R20A_ENABLED='true'            → /api/calling catch")
  console.log("  SUBSTRATE_REFLECT_R20A_ENABLED='true'            → /api/practice/reflect content catch")
  console.log("  SUBSTRATE_R20A_AUDIENCE_RENDERING_ENABLED='true' → /api/reason agent-API developer form")
  console.log('  (SUBSTRATE_R20A_GATE_ENABLED is NOT required — /api/reason route-guard is always-on)')
  console.log('\nPlanned LIVE assertions (per surface: REDIRECT positive + neutral negative control):')
  console.log('  /api/calling          : open → answer(distress) → developer-form redirect + safety_signal; neutral → not redirected')
  console.log('  /api/practice/reflect : open(in_progress) → answer(distress) → developer-form redirect + safety_signal; neutral → proceeds')
  console.log("                          + Zone-3 regression control: declared safety_signal → status 'flagged'")
  console.log('  /api/reason           : input(distress) → developer-form redirect (NO safety_signal — route-guard omits it); neutral → normal reasoning')
  console.log('  DB-boundary guard     : /api/public-key must serve a TEST key_id or the run ABORTS before any endpoint call')
  notes.push(
    'build-only: no endpoint called (no live env). Confirms the runner + lib/ load clean and prints the ' +
      'fixtures + flag set + assertion plan. Run with --live (and --env-file=.env.local) against the standing ' +
      'TEST env (the three per-surface flags ON). The harness confirms /api/public-key serves a TEST key ' +
      'BEFORE calling any product endpoint (the DB-boundary control).',
  )
}

async function main(): Promise<void> {
  const ledger = new AssertionLedger()
  const mode: 'build-only' | 'live' = isLive() ? 'live' : 'build-only'
  const notes: string[] = []
  const statuses: Record<string, number> = {}

  console.log(`\n=== ${SCENARIO} (${SCENARIO_LABEL}) — mode: ${mode} ===\n`)

  if (mode === 'live') {
    await runLive(ledger, notes, statuses)
  } else {
    printBuildOnly(notes)
  }

  const result: 'PASS' | 'FAIL' = ledger.failCount === 0 ? 'PASS' : 'FAIL'
  const ledgerOut: RunLedger = {
    scenario: SCENARIO,
    scenario_label: SCENARIO_LABEL,
    mode,
    timestamp: new Date().toISOString(),
    result,
    assertions: ledger.results,
    summary: ledger.summaryLine(),
    statuses: Object.keys(statuses).length > 0 ? statuses : undefined,
    scenario_input: C2_DISTRESS_INPUT,
    notes,
  }
  const { jsonPath, mdPath } = writeLedger(ledgerOut)

  console.log(`\n${ledger.summaryLine()}`)
  console.log(`Result: ${result}`)
  console.log(`Ledger written:\n  ${jsonPath}\n  ${mdPath}`)
  process.exit(result === 'PASS' ? 0 : 1)
}

main().catch((err) => {
  console.error('run-c2 fatal:', err)
  process.exit(3)
})
