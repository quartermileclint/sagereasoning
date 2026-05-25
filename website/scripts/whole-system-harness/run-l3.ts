/**
 * run-l3.ts — L3 (Sage Reflect alone) scenario runner.
 *
 * L3 = the unusual standalone configuration: a session-close review run over the
 * developer's own infra with NO upstream Sage Reasoning record feeding it, so the
 * profile the review can build is necessarily thin. (scenario-matrix.md L3;
 * test-brief A.1 L3.)
 *
 * Built 2026-05-25 on the proven L7 pattern (founder "clean scenarios first"
 * election). Drives the full Reflect dialogue with the adaptive lib/reflect-driver
 * (open → Q1..Q6 → complete, walking whatever branch the engine takes).
 *
 * TWO MODES (mirrors run-l7.ts / run-l1.ts)
 * -----------------------------------------
 * DRY-PREVIEW (default — no live env, no secrets): prints the session summary +
 *   the per-step answers + the assertion plan and exits 0. No network, no DB.
 *     Run:  cd website && npx tsx scripts/whole-system-harness/run-l3.ts
 *
 * LIVE (founder-performed against the standing TEST env):
 *   POST /api/practice/reflect (Bearer sr_assent_) open → answer Q1..Q6 → complete.
 *   Each Q1–Q4 answer carries a Sonnet extraction (cost; ~4–5 LLM calls per run).
 *   Env vars required:
 *     WSH_BASE_URL      e.g. http://localhost:3000
 *     WSH_ASSENT_TOKEN  test sr_assent_ token (Bearer for /api/practice/reflect)
 *     WSH_AGENT_ID      the agent_id the sr_assent_ token is bound to (default below)
 *   Run:  cd website && npx tsx --env-file=.env.local \
 *           scripts/whole-system-harness/run-l3.ts --live
 *
 * Exit code 0 = all assertions passed (or dry-preview); non-zero = failures.
 *
 * L3 assertion coverage (all LIVE):
 *   (a) Reflect open → 200 + first question surfaced       (driver)
 *   (b) the session reaches `complete` (200)
 *   (c) the completion carries a profile read-back (present)
 *   (d) exit_path present + valid ('sage_reasoning' | 'sage_calling')
 *   (e) the mandatory mirror note is present (R19d)
 *   note: the profile is THIN — this is Reflect ALONE (sage_reasoning_passes = 0,
 *         no Reasoning upstream); the feed runs from the Q4 review only.
 */

import { AssertionLedger } from './lib/assertions'
import { writeLedger, type RunLedger } from './lib/capture'
import {
  driveReflectSession,
  DEFAULT_REFLECT_ANSWERS,
  type SessionSummaryInput,
} from './lib/reflect-driver'

const SCENARIO = 'L3'
const SCENARIO_LABEL = 'Sage Reflect alone'
const DEFAULT_AGENT_ID = process.env.WSH_AGENT_ID ?? 'wsh-test-agent-L7'

/** L3 session summary — sage_reasoning_passes = 0 is the point: no Reasoning upstream. */
const L3_SESSION_SUMMARY: SessionSummaryInput = {
  purpose_at_open:
    'Return sound, well-grounded answers to research-synthesis requests, ' +
    'distinguishing rated-usefulness from correctness.',
  circle_at_open: 'community',
  role_at_open: 'autonomous research-synthesis agent',
  capacity_at_open: ['retrieval', 'citation-checking', 'drafting'],
  sage_reasoning_passes: 0,
}

function isLive(): boolean {
  return process.argv.includes('--live') || (process.env.WSH_BASE_URL ?? '').length > 0
}

async function main(): Promise<void> {
  const ledger = new AssertionLedger()
  const mode: 'build-only' | 'live' = isLive() ? 'live' : 'build-only'
  const notes: string[] = []
  const timestamp = new Date().toISOString()
  let statuses: Record<string, number> | undefined
  let driveResult: Awaited<ReturnType<typeof driveReflectSession>> | undefined

  console.log(`\n=== ${SCENARIO} (${SCENARIO_LABEL}) — mode: ${mode} ===\n`)

  if (mode === 'live') {
    const baseUrl = process.env.WSH_BASE_URL
    const assentToken = process.env.WSH_ASSENT_TOKEN
    if (!baseUrl || !assentToken) {
      console.error('LIVE mode requires WSH_BASE_URL and WSH_ASSENT_TOKEN (+ optional WSH_AGENT_ID).')
      process.exit(2)
    }
    const sessionId = `wsh-l3-${timestamp.replace(/[:.]/g, '-')}`

    driveResult = await driveReflectSession({
      baseUrl,
      assentToken,
      agentId: DEFAULT_AGENT_ID,
      sessionId,
      sessionSummary: L3_SESSION_SUMMARY,
      ledger, // asserts the open
    })
    statuses = driveResult.statuses
    const body = driveResult.finalBody

    // (b) reached complete
    ledger.assert(
      'L3 (b): the reflection reaches `complete` (200)',
      driveResult.terminal === 'complete',
      `terminal=${driveResult.terminal}; steps=${driveResult.stepsSeen.join(' → ')}; ` +
        `last body=${JSON.stringify(body).slice(0, 200)}`,
    )

    // (c) profile read-back present
    ledger.assert(
      'L3 (c): completion carries a profile read-back (present)',
      driveResult.terminal === 'complete' && !!body?.profile,
      `profile=${JSON.stringify(body?.profile)}`,
    )

    // (d) exit_path present + valid
    const validExit = body?.exit_path === 'sage_reasoning' || body?.exit_path === 'sage_calling'
    ledger.assert(
      'L3 (d): exit_path present + valid',
      driveResult.terminal === 'complete' && validExit,
      `exit_path=${JSON.stringify(body?.exit_path)}`,
    )

    // (e) mandatory mirror note present (R19d) — profile_update_framing.mandatory_note
    const framing = (body as Record<string, unknown> | null)?.['profile_update_framing'] as
      | { mandatory_note?: string }
      | undefined
    ledger.assert(
      'L3 (e): mandatory mirror note present (R19d)',
      typeof framing?.mandatory_note === 'string' && framing.mandatory_note.length > 0,
      `profile_update_framing=${JSON.stringify(framing)}`,
    )

    notes.push(
      `L3 profile is THIN by design: sage_reasoning_passes=0 (Reflect alone, no ` +
        `Reasoning upstream). Steps walked: ${driveResult.stepsSeen.join(' → ')}.`,
    )
  } else {
    notes.push(
      'dry-preview: /api/practice/reflect NOT called (no live env). Confirms the runner ' +
        'loads + prints the session summary, per-step answers, and assertion plan. Run ' +
        'with --live (and --env-file=.env.local) against the standing test env to assert (a)-(e).',
    )
    console.log('Session summary the live run will open with:\n')
    console.log(JSON.stringify(L3_SESSION_SUMMARY, null, 2))
    console.log('\nPer-step answers the adaptive driver will use:\n')
    console.log(JSON.stringify(DEFAULT_REFLECT_ANSWERS, null, 2))
    console.log(
      '\nPlanned live assertions: (a) open 200 + question; (b) reaches complete; ' +
        '(c) profile present; (d) exit_path valid; (e) mirror note present.',
    )
  }

  const result: 'PASS' | 'FAIL' = ledger.failCount === 0 ? 'PASS' : 'FAIL'
  const ledgerOut: RunLedger = {
    scenario: SCENARIO,
    scenario_label: SCENARIO_LABEL,
    mode,
    timestamp,
    result,
    assertions: ledger.results,
    summary: ledger.summaryLine(),
    statuses,
    scenario_input: { session_summary: L3_SESSION_SUMMARY, answers: DEFAULT_REFLECT_ANSWERS, steps_seen: driveResult?.stepsSeen },
    notes,
  }
  const { jsonPath, mdPath } = writeLedger(ledgerOut)

  console.log(`\n${ledger.summaryLine()}`)
  console.log(`Result: ${result}`)
  console.log(`Ledger written:\n  ${jsonPath}\n  ${mdPath}`)
  process.exit(result === 'PASS' ? 0 : 1)
}

main().catch((err) => {
  console.error('run-l3 fatal:', err)
  process.exit(3)
})
