/**
 * run-l2-complete.ts — L2-complete (Sage Calling alone, APPROVED path) scenario runner.
 *
 * The complement to run-l2.ts (the incomplete-specs variant). This is the COMPLETE
 * path: a purpose-finding dialogue that walks Q1→Q5 and pauses at the Hard Gate
 * (status 'awaiting_approval'), then the harness assembles the five-slot
 * DiscoveredPurpose from the session's response history.
 * (scenario-matrix.md L2 approved path; test-brief A.1 L2; seam-map S1 assertion (a).)
 *
 * APPROVAL SEAM — OPTION A (founder elected 2026-05-25, "pure tsx"):
 *   /api/calling itself stops at the Hard Gate (D-14) and builds NO five-spec — the
 *   assembly happens only on the admin-only POST /api/calling/approve path. Rather
 *   than mint an admin credential, this runner drives /api/calling to the gate and
 *   then runs the EXPORTED PURE buildDiscoveredPurpose(history, roleHint) over the
 *   session's response history — the same function the approve route calls. The
 *   history is reconstructed faithfully by the driver (the answer recorded under the
 *   stage of the question it answered — exactly what the engine's appendResponse
 *   does). It does NOT exercise the admin gate itself (logged as a follow-up); it
 *   asserts the five-spec ASSEMBLY (seam-map S1 (a)).
 *
 * PURITY / KG1: buildDiscoveredPurpose lives in calling-service.ts (PURE — no I/O;
 * its session-store import constructs the Supabase admin client LAZILY, never at
 * module load), so this runner imports it and runs under a bare `npx tsx`. KG1 NOT
 * engaged (no DB-write module imported directly; the live HTTP drive writes the
 * session row via the endpoint, as the other runners do).
 *
 * TWO MODES (mirrors the other runners)
 * -------------------------------------
 * DRY-PREVIEW (default): runs the five-slot assertion over a SYNTHETIC complete-path
 *   history (no network) — the assembly + assertion logic execute and exit 0. Only
 *   the live HTTP drive (that the real engine reaches awaiting_approval) is deferred.
 *     Run:  cd website && npx tsx scripts/whole-system-harness/run-l2-complete.ts
 * LIVE (founder-performed against the standing TEST env):
 *   Env vars: WSH_BASE_URL, WSH_ASSENT_TOKEN (Bearer for /api/calling), WSH_AGENT_ID.
 *   The Calling engine makes NO LLM call (pure) → each stage bills at base ($0).
 *     Run:  cd website && npx tsx scripts/whole-system-harness/run-l2-complete.ts --live
 *   (--env-file not required — WSH_* come from the shell export; buildDiscoveredPurpose
 *    needs no env.)
 *
 * Exit code 0 = all assertions passed (or dry-preview); non-zero = failures.
 *
 * L2-complete assertion coverage:
 *   (a) [LIVE] the dialogue reaches the Hard Gate (status 'awaiting_approval')
 *   (b) [LIVE] the gate body carries NO discovered_purpose (D-14 — paused before handoff)
 *   (c) [BOTH] buildDiscoveredPurpose yields all five slots with the agent's OWN WORDS,
 *       no dropped/mis-slotted slot (seam-map S1 (a))
 */

import { AssertionLedger } from './lib/assertions'
import { writeLedger, type RunLedger } from './lib/capture'
import {
  driveCallingToHardGate,
  syntheticCompleteHistory,
  CALLING_COMPLETE_ANSWERS,
} from './lib/calling-driver'
import { assertFiveSlots, type ExpectedSlots } from './lib/discovered-purpose-asserts'
import { buildDiscoveredPurpose } from '../../src/lib/sage-calling/calling-service'

const SCENARIO = 'L2-complete'
const SCENARIO_LABEL = 'Sage Calling alone (approved path → five-slot DiscoveredPurpose)'
const DEFAULT_AGENT_ID = process.env.WSH_AGENT_ID ?? 'wsh-test-agent-L7'

/** The expected slots — the agent's OWN verbatim answers + the deterministic
 *  circle/role buildDiscoveredPurpose assembles (work=Q3, capacity=Q2, obligation=Q3,
 *  first_act=Q5, circle='community' by the D-5 scan, role='individual_nature' default). */
const EXPECTED: ExpectedSlots = {
  work: CALLING_COMPLETE_ANSWERS.Q3.trim(),
  capacity: CALLING_COMPLETE_ANSWERS.Q2.trim(),
  obligation: CALLING_COMPLETE_ANSWERS.Q3.trim(),
  circle: 'community',
  role: 'individual_nature',
  firstAct: CALLING_COMPLETE_ANSWERS.Q5.trim(),
}

function isLive(): boolean {
  return process.argv.includes('--live') || (process.env.WSH_BASE_URL ?? '').length > 0
}

async function main(): Promise<void> {
  const ledger = new AssertionLedger()
  const mode: 'build-only' | 'live' = isLive() ? 'live' : 'build-only'
  const notes: string[] = []
  const timestamp = new Date().toISOString()
  let statuses: Record<string, number> = {}
  let stagesSeen: string[] = ['Q1', 'Q2', 'Q3', 'Q4', 'Q5'] // synthetic default; replaced live

  console.log(`\n=== ${SCENARIO} (${SCENARIO_LABEL}) — mode: ${mode} ===\n`)

  // history feeds buildDiscoveredPurpose: real (live) or synthetic (dry-preview).
  let history = syntheticCompleteHistory()

  if (mode === 'live') {
    const baseUrl = process.env.WSH_BASE_URL
    const assentToken = process.env.WSH_ASSENT_TOKEN
    if (!baseUrl || !assentToken) {
      console.error('LIVE mode requires WSH_BASE_URL and WSH_ASSENT_TOKEN (+ optional WSH_AGENT_ID).')
      process.exit(2)
    }
    const sessionId = `wsh-l2c-${timestamp.replace(/[:.]/g, '-')}`
    const drive = await driveCallingToHardGate({
      baseUrl,
      assentToken,
      agentId: DEFAULT_AGENT_ID,
      sessionId,
      ledger,
    })
    statuses = drive.statuses
    stagesSeen = drive.stagesSeen
    history = drive.history

    // (a) reached the Hard Gate
    ledger.assert(
      'L2-complete (a): the dialogue reaches the Hard Gate (status awaiting_approval)',
      drive.terminal === 'awaiting_approval',
      `terminal=${drive.terminal}; stages=${drive.stagesSeen.join(' → ')}; ` +
        `last=${JSON.stringify(drive.finalBody).slice(0, 200)}`,
    )
    // (b) the gate carries NO five-spec (D-14)
    ledger.assert(
      'L2-complete (b): the Hard Gate body carries NO discovered_purpose (D-14 paused)',
      drive.sawDiscoveredPurpose === false,
      `sawDiscoveredPurpose=${drive.sawDiscoveredPurpose}`,
    )
    notes.push(
      `Stages walked: ${drive.stagesSeen.join(' → ')}. Five-spec assembled by the harness ` +
        `via the pure buildDiscoveredPurpose() over the session history (Option A). The admin ` +
        `gate (/api/calling/approve, requireAdmin) is NOT exercised here — logged as a ` +
        `higher-fidelity follow-up (Option B).`,
    )
  } else {
    notes.push(
      'dry-preview: /api/calling NOT called (no live env). The five-slot assertion (c) runs ' +
        'over a SYNTHETIC complete-path history (no network) and executes here; the live HTTP ' +
        'drive — that the real engine reaches awaiting_approval (a)+(b) — is deferred to the ' +
        'founder live run.',
    )
    console.log('Complete-path per-stage answers (drive steers Q1→Q2→Q3→Q4→Q5→awaiting_approval):\n')
    console.log(JSON.stringify(CALLING_COMPLETE_ANSWERS, null, 2))
  }

  // (c) BOTH modes — assemble + assert the five slots (seam-map S1 (a)).
  const dp = buildDiscoveredPurpose(history, null)
  assertFiveSlots(ledger, dp, EXPECTED, 'L2-complete (c):')

  console.log('\nAssembled DiscoveredPurpose:')
  console.log(JSON.stringify(dp, null, 2))

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
    scenario_input: {
      stage_answers: CALLING_COMPLETE_ANSWERS,
      stages_seen: stagesSeen,
      discovered_purpose: dp,
      expected_slots: EXPECTED,
    },
    notes,
  }
  const { jsonPath, mdPath } = writeLedger(ledgerOut)

  console.log(`\n${ledger.summaryLine()}`)
  console.log(`Result: ${result}`)
  console.log(`Ledger written:\n  ${jsonPath}\n  ${mdPath}`)
  process.exit(result === 'PASS' ? 0 : 1)
}

main().catch((err) => {
  console.error('run-l2-complete fatal:', err)
  process.exit(3)
})
