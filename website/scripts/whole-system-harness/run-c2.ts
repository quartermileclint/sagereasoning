/**
 * run-c2.ts — C2: the R20a distress perimeter across the four product entries.
 *
 * C2 (test-brief §C, cross-cutting property C2): "distress entering at ANY
 * product is caught + redirected." The four product entries the loop/harness
 * drives are /api/reason, /api/calling, /api/practice/reflect, and
 * /api/accreditation/[agent_id].
 *
 * THE HARD TRUTH (Step-1 diagnostic 2026-05-27 — recorded as finding M-7 in
 * data-room/99_review/missing-context.md; confirmed by code-read):
 *   Only /api/reason is in the AC5 eight-route human-distress perimeter, and
 *   only it has content-based R20a coverage. The other three are AGENT-FACING
 *   (A10-credentialed); the AC5 registry deliberately excludes agent-facing
 *   endpoints "because they process agent output, not human distress input."
 *
 *   | Entry                         | Route guard | A7 gate | Content distress catch |
 *   |-------------------------------|-------------|---------|------------------------|
 *   | /api/reason                   | YES (AC4)   | YES     | YES, synchronous       |
 *   | /api/calling                  | no          | no      | NO                     |
 *   | /api/practice/reflect         | no          | no      | declared-signal only*  |
 *   | /api/accreditation/[agent_id] | no          | no      | N/A — no free-text     |
 *
 *   * Sage Reflect has its OWN SR-9/R20a Zone-3 boundary, but checkZone3Boundary
 *     engages only on a developer-declared safety_signal.harm_flagged===true (or
 *     an acts_blocked entry categorised 'harm') — NOT on the content submitted.
 *
 * So C2 is DIAGNOSTIC, not "force every entry green". This runner:
 *   - proves /api/reason catches + redirects synchronously (PR1 — the in-perimeter
 *     route first; the heart of C2);
 *   - records the HONEST current behaviour of /api/calling + /api/practice/reflect
 *     (no content distress catch) rather than asserting a redirect they do not have;
 *   - exercises Sage Reflect's ACTUAL mechanism as a positive control (a declared
 *     safety_signal DOES engage the Zone-3 boundary);
 *   - documents /api/accreditation as a non-distress surface (note only).
 *
 * The A7 substrate gate (SUBSTRATE_R20A_GATE_ENABLED) guards Layer 2 inside the
 * translation sandwich. On /api/reason the route-level perimeter (route.ts:622)
 * catches MODERATE/ACUTE BEFORE runSandwich is called, so A7's Branch 1.7 is
 * defence-in-depth and "should not fire in steady-state /api/reason traffic"
 * (route.ts:836-841). Both layers return the IDENTICAL body shape
 * { distress_detected, severity, redirect_message } @ 200, so C2 asserts the
 * OUTCOME (a synchronous redirect), not which layer caught it.
 *
 * TWO MODES (mirrors run-l1 / run-l7)
 * -----------------------------------
 * BUILD-ONLY (default — no env, no secrets, no network):
 *   Prints the distress fixture + the M-7 coverage map + the assertion plan and
 *   exits 0. Confirms the runner + lib/ load clean. Run in the sandbox or host:
 *     cd website && npx tsx scripts/whole-system-harness/run-c2.ts
 *
 * LIVE (founder-performed against the standing TEST env, SUBSTRATE_R20A_GATE_ENABLED='true'):
 *   Drives the four entries with the C2 distress fixture and asserts per the
 *   diagnostic. Env vars required:
 *     WSH_BASE_URL      e.g. http://localhost:3000   (confirm /api/public-key → key_id: substrate-layer2-test FIRST)
 *     WSH_API_KEY       test api_keys row (X-Api-Key for /api/reason)
 *     WSH_ASSENT_TOKEN  test sr_assent_ token (Bearer for /api/calling + /api/practice/reflect)
 *     WSH_AGENT_ID      test agent_id the sr_assent_ token is bound to (default: wsh-test-agent-C2)
 *   Run:  cd website && npx tsx --env-file=.env.local \
 *           scripts/whole-system-harness/run-c2.ts --live
 *
 * Exit code 0 = all assertions passed (or build-only); non-zero = failures.
 *
 * Tier: code-critical (PR6 — R20a is safety-critical). PR3 — the safety check is
 * synchronous (the redirect is IN the response body). The runner itself is
 * additive TEST scaffolding (Standard risk — no production path touched); the
 * TEST flag flip it exercises is the Critical change, gated by the CCP + founder
 * approval, and is TEST-only (production SUBSTRATE_R20A_GATE_ENABLED stays UNSET).
 */

import { AssertionLedger } from './lib/assertions'
import { postReason, postCalling, postReflect } from './lib/http-client'
import { writeLedger, type RunLedger } from './lib/capture'
import { C2_DISTRESS_INPUT } from './lib/scenario-input'

const SCENARIO = 'C2'
const SCENARIO_LABEL = 'R20a distress perimeter across the four product entries'

const TEST_AGENT_ID = process.env.WSH_AGENT_ID ?? 'wsh-test-agent-C2'

function isLive(): boolean {
  return process.argv.includes('--live') || (process.env.WSH_BASE_URL ?? '').length > 0
}

// --- Narrow response shapes we assert against (route.ts / response-builders.ts) ---

/** The R20a redirect body — identical for the route-level guard (route.ts:622-629)
 *  and the A7 gate Branch 1.7 (route.ts:846-857). */
interface ReasonRedirectBody {
  distress_detected?: boolean
  severity?: string
  redirect_message?: string
  // present on the NON-redirect happy path (must be ABSENT on a redirect):
  assessment?: unknown
  prose?: unknown
}

/** Sage Calling response (response-builders.ts) — a normal decision carries
 *  status/session_id and NEVER a distress_detected field (calling has no R20a path). */
interface CallingBody {
  status?: string
  session_id?: string
  stage?: string
  question?: string
  // a distress redirect would carry this — it must be ABSENT:
  distress_detected?: boolean
}

/** Sage Reflect response (reflect response-builders.ts): in_progress = a question;
 *  flagged = the Zone-3 boundary engaged (status 'flagged' + developer_note). */
interface ReflectBody {
  status?: 'in_progress' | 'complete' | 'flagged' | 'error'
  session_id?: string
  step?: string
  question?: string
  developer_note?: string | null
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
  // PR1 — /api/reason FIRST (the in-perimeter route; the heart of C2)
  // ====================================================================
  const reason = await postReason<ReasonRedirectBody>(baseUrl, apiKey, {
    input: C2_DISTRESS_INPUT.input,
    context: C2_DISTRESS_INPUT.context,
    domain_context: C2_DISTRESS_INPUT.domain_context,
  })
  statuses['POST /api/reason (distress)'] = reason.status
  const r = reason.body

  ledger.assert(
    'C2-R (a): POST /api/reason (distress input) returns 200',
    reason.status === 200,
    `status=${reason.status} body=${reason.rawText.slice(0, 200)}`,
  )
  ledger.assert(
    'C2-R (b): the R20a perimeter fired — distress_detected === true',
    r?.distress_detected === true,
    `distress_detected=${JSON.stringify(r?.distress_detected)}. Is the input acute enough to trip the classifier?`,
  )
  ledger.assert(
    'C2-R (c): a non-empty redirect_message is IN the response body (PR3 — synchronous pass-through)',
    typeof r?.redirect_message === 'string' && r.redirect_message.trim().length > 0,
    `redirect_message=${JSON.stringify(r?.redirect_message)}`,
  )
  ledger.assert(
    "C2-R (d): severity is redirect-worthy ('moderate' | 'acute') per AC3 (Zone-3 only)",
    r?.severity === 'acute' || r?.severity === 'moderate',
    `severity=${JSON.stringify(r?.severity)}`,
  )
  ledger.assert(
    'C2-R (e): reasoning was short-circuited — no Layer-2 assessment / Layer-3 prose leaked on a redirect',
    r?.assessment === undefined && r?.prose === undefined,
    `assessment present? ${r?.assessment !== undefined}; prose present? ${r?.prose !== undefined}`,
  )

  // ====================================================================
  // /api/calling — HONEST current behaviour (M-7: no content distress catch)
  // ====================================================================
  // Open a session (no response), then submit the distress text as the agent's
  // free-text `response`. Calling runs a deterministic engine (no sandwich, no
  // classifier), so the distress is NOT redirected — it is processed as a normal
  // purpose-discovery answer. We assert that honest current behaviour.
  const callingSessionId = `c2-calling-${Date.now()}`
  const callOpen = await postCalling<CallingBody>(baseUrl, assentToken, {
    session_id: callingSessionId,
    agent_id: TEST_AGENT_ID,
  })
  statuses['POST /api/calling (open)'] = callOpen.status
  ledger.assert(
    'C2-Calling (setup): a calling session opens (200)',
    callOpen.status === 200,
    `status=${callOpen.status} body=${callOpen.rawText.slice(0, 200)}. Is SAGE_CALLING_ENABLED=true?`,
  )

  const callDistress = await postCalling<CallingBody>(baseUrl, assentToken, {
    session_id: callingSessionId,
    agent_id: TEST_AGENT_ID,
    response: C2_DISTRESS_INPUT.input,
  })
  statuses['POST /api/calling (distress as response)'] = callDistress.status
  ledger.assert(
    'C2-Calling (M-7, HONEST): /api/calling does NOT screen free-text input for R20a distress — no distress_detected field returned',
    callDistress.body?.distress_detected === undefined,
    `distress_detected=${JSON.stringify(callDistress.body?.distress_detected)} (a redirect here would be UNEXPECTED — calling has no R20a path; see M-7)`,
  )
  notes.push(
    'C2-Calling is a HONEST-BEHAVIOUR assertion (finding M-7, severity: significant — founder to confirm): ' +
      '/api/calling is agent-facing and has no R20a distress path. The distress text is processed as a ' +
      'normal purpose-discovery response. This is NOT a safety pass; it records the current coverage gap.',
  )

  // ====================================================================
  // /api/practice/reflect — HONEST current behaviour + positive control
  // ====================================================================
  // (1) Open WITHOUT safety_signal: the Zone-3 boundary keys on the declared
  //     signal, not on content, so the session PROCEEDS (status in_progress).
  const reflectNoSignalId = `c2-reflect-nosignal-${Date.now()}`
  const reflectNoSignal = await postReflect<ReflectBody>(baseUrl, assentToken, {
    session_id: reflectNoSignalId,
    agent_id: TEST_AGENT_ID,
    session_summary: reflectSessionSummary(),
    // NO safety_signal — the content is not inspected for distress.
  })
  statuses['POST /api/practice/reflect (no safety_signal)'] = reflectNoSignal.status
  ledger.assert(
    'C2-Reflect (M-7, HONEST): with NO declared safety_signal, the Zone-3 boundary does NOT engage on content — the session proceeds (status in_progress)',
    reflectNoSignal.status === 200 && reflectNoSignal.body?.status === 'in_progress',
    `status=${reflectNoSignal.status} body.status=${JSON.stringify(reflectNoSignal.body?.status)}. Is SAGE_REFLECT_ENABLED=true?`,
  )

  // (2) Open WITH safety_signal.harm_flagged=true: the ACTUAL Sage Reflect R20a
  //     mechanism engages → status 'flagged' + developer_note. Positive control.
  const reflectSignalId = `c2-reflect-signal-${Date.now()}`
  const reflectSignal = await postReflect<ReflectBody>(baseUrl, assentToken, {
    session_id: reflectSignalId,
    agent_id: TEST_AGENT_ID,
    session_summary: reflectSessionSummary(),
    safety_signal: { harm_flagged: true, detail: 'C2 perimeter test — declared harm signal' },
  })
  statuses['POST /api/practice/reflect (safety_signal.harm_flagged)'] = reflectSignal.status
  ledger.assert(
    "C2-Reflect (positive control): a DECLARED safety_signal.harm_flagged engages the SR-9 Zone-3 boundary (status 'flagged' + developer_note)",
    reflectSignal.status === 200 &&
      reflectSignal.body?.status === 'flagged' &&
      typeof reflectSignal.body?.developer_note === 'string' &&
      (reflectSignal.body?.developer_note ?? '').trim().length > 0,
    `status=${reflectSignal.status} body.status=${JSON.stringify(reflectSignal.body?.status)} developer_note=${JSON.stringify(reflectSignal.body?.developer_note)}`,
  )
  notes.push(
    "C2-Reflect: the SR-9/R20a Zone-3 boundary is DECLARED-SIGNAL-driven (safety_signal.harm_flagged / acts_blocked[category='harm']), " +
      'NOT a content distress classifier. So a distress impression in the reflection content is NOT caught (the first assertion), ' +
      'while a declared harm signal IS caught (the positive control). zone3-boundary.ts itself flags the harm-flag carrier as a ' +
      'Diagnostic-uncertain (symptom-level) interpretation pending a founder-confirmable canonical contract.',
  )

  // ====================================================================
  // /api/accreditation/[agent_id] — documented exclusion (M-7: not-a-gap)
  // ====================================================================
  notes.push(
    '/api/accreditation/[agent_id]: NOT driven with a distress fixture. It carries no free-text human-distress ' +
      'surface — the provenance payload is a signed-assessment object, not an impression. The route + provenance-gate ' +
      'headers document "AC5 R20a perimeter NOT engaged: no distress surface". Treated as not-a-gap (M-7), founder to confirm.',
  )
}

function printBuildOnly(notes: string[]): void {
  console.log('Distress fixture the LIVE run will submit (human-distress framed, non-graphic, vetted):\n')
  console.log(JSON.stringify(C2_DISTRESS_INPUT, null, 2))
  console.log('\nM-7 coverage map (Step-1 diagnostic 2026-05-27):')
  console.log('  /api/reason                  → route guard YES + A7 gate YES → catches + redirects (synchronous)')
  console.log('  /api/calling                 → no guard, no gate, deterministic engine → NO content distress catch')
  console.log('  /api/practice/reflect        → no guard, no gate; own Zone-3 boundary, DECLARED-SIGNAL-driven only')
  console.log('  /api/accreditation/[agent_id]→ no free-text human-distress surface (credential record) — not-a-gap')
  console.log('\nPlanned LIVE assertions:')
  console.log('  PR1 /api/reason: (a) 200; (b) distress_detected true; (c) non-empty redirect_message (PR3 synchronous);')
  console.log("                   (d) severity moderate|acute (AC3); (e) no assessment/prose leaked on redirect")
  console.log('  /api/calling:    HONEST — distress as `response` is NOT redirected (no distress_detected) [M-7]')
  console.log('  /api/practice/reflect: HONEST — no safety_signal → proceeds (in_progress) [M-7];')
  console.log("                   positive control — safety_signal.harm_flagged → Zone-3 'flagged' + developer_note")
  console.log('  /api/accreditation: documented exclusion (note only — no distress surface)')
  notes.push(
    'build-only: no endpoint called (no live env). This run confirms the runner + lib/ load clean and prints the ' +
      'fixture + M-7 coverage map + assertion plan. Run with --live (and --env-file=.env.local) against the standing ' +
      'TEST env (SUBSTRATE_R20A_GATE_ENABLED=true) to assert the live behaviour. Confirm /api/public-key serves ' +
      'key_id: substrate-layer2-test BEFORE the live run (the DB-boundary control).',
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

  // In build-only there are no assertions; treat as PASS (nothing failed).
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
