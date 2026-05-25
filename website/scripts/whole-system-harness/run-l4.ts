/**
 * run-l4.ts — L4 (Sage Calling + Sage Reasoning, Seam S1) scenario runner.
 *
 * L4 = find the work (Calling, approved path), then thread the five-spec into the
 * substrate's Layer 1. The seam under test is S1 — Calling's five-spec → substrate
 * Layer 1. The headline assertion: ALL FIVE SLOTS SURVIVE into the Layer 1 schema,
 * with no dropped or mis-slotted field.
 * (scenario-matrix.md L4; test-brief §B S1; seam-map Seam 1 assertions (a)+(b).)
 *
 * APPROVAL SEAM — OPTION A (founder elected 2026-05-25, "pure tsx"):
 *   The five-spec reaches Layer 1 as a `Layer1Schema.discovered_purpose` field on the
 *   pre-extracted layer1_schema path (the plugin-auth path) — NOT a body field on
 *   /api/reason's agent path. So L4 is NOT a plain HTTP thread into /api/reason.
 *   Instead it runs the REAL validateLayer1Schema() over a Layer1Schema carrying the
 *   DiscoveredPurpose, and asserts the five slots survive — directly proving
 *   "five slots survive the Layer 1 schema, no dropped slot" (seam-map S1 (b)).
 *   The DiscoveredPurpose comes from buildDiscoveredPurpose() over a real
 *   approved-path Calling session (live) or a synthetic complete-path history (dry).
 *
 * PURITY / KG1: buildDiscoveredPurpose (calling-service.ts) and validateLayer1Schema
 * (layer1-extractor.ts) are both PURE; layer1-extractor runs under bare `npx tsx`
 * (proven by its own __tests__/layer1-schema-additions.test.ts). KG1 NOT engaged.
 *
 * TWO MODES
 * ---------
 * DRY-PREVIEW (default): the FULL S1 (b) survival assertion runs over a synthetic
 *   complete-path history (no network) and executes here — L4's core seam check is
 *   fully sandbox-verifiable. Only the live Calling drive (S1 (a) end-to-end) is
 *   deferred.
 *     Run:  cd website && npx tsx scripts/whole-system-harness/run-l4.ts
 * LIVE (founder-performed against the standing TEST env):
 *   Env vars: WSH_BASE_URL, WSH_ASSENT_TOKEN (Bearer for /api/calling), WSH_AGENT_ID.
 *     Run:  cd website && npx tsx scripts/whole-system-harness/run-l4.ts --live
 *
 * Exit code 0 = all assertions passed (or dry-preview); non-zero = failures.
 *
 * L4 assertion coverage:
 *   (a) [LIVE] the upstream Calling session reaches the Hard Gate (real approved-path dp)
 *   (b) [BOTH] Layer 1 ACCEPTS the handoff and all five slots survive (no dropped slot)
 *   (c) [BOTH] per-slot presence on the received side + side-by-side print for the founder
 */

import { AssertionLedger } from './lib/assertions'
import { writeLedger, type RunLedger } from './lib/capture'
import {
  driveCallingToHardGate,
  syntheticCompleteHistory,
  CALLING_COMPLETE_ANSWERS,
} from './lib/calling-driver'
import { assertLayer1Survival, renderSlotComparison } from './lib/discovered-purpose-asserts'
import { buildDiscoveredPurpose } from '../../src/lib/sage-calling/calling-service'

const SCENARIO = 'L4'
const SCENARIO_LABEL = 'Sage Calling + Sage Reasoning (Seam S1 — five slots survive into Layer 1)'
const DEFAULT_AGENT_ID = process.env.WSH_AGENT_ID ?? 'wsh-test-agent-L7'

function isLive(): boolean {
  return process.argv.includes('--live') || (process.env.WSH_BASE_URL ?? '').length > 0
}

async function main(): Promise<void> {
  const ledger = new AssertionLedger()
  const mode: 'build-only' | 'live' = isLive() ? 'live' : 'build-only'
  const notes: string[] = []
  const timestamp = new Date().toISOString()
  let statuses: Record<string, number> = {}
  let stagesSeen: string[] = ['Q1', 'Q2', 'Q3', 'Q4', 'Q5']

  console.log(`\n=== ${SCENARIO} (${SCENARIO_LABEL}) — mode: ${mode} ===\n`)

  let history = syntheticCompleteHistory()

  if (mode === 'live') {
    const baseUrl = process.env.WSH_BASE_URL
    const assentToken = process.env.WSH_ASSENT_TOKEN
    if (!baseUrl || !assentToken) {
      console.error('LIVE mode requires WSH_BASE_URL and WSH_ASSENT_TOKEN (+ optional WSH_AGENT_ID).')
      process.exit(2)
    }
    const sessionId = `wsh-l4-${timestamp.replace(/[:.]/g, '-')}`
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

    // (a) the handoff comes from a real approved-path session (Hard Gate reached).
    ledger.assert(
      'L4 (a): the upstream Calling session reaches the Hard Gate (real approved-path dp)',
      drive.terminal === 'awaiting_approval',
      `terminal=${drive.terminal}; stages=${drive.stagesSeen.join(' → ')}`,
    )
    notes.push(`Stages walked: ${drive.stagesSeen.join(' → ')}.`)
  } else {
    notes.push(
      'dry-preview: /api/calling NOT called. The S1 (b) survival assertion runs over a ' +
        'synthetic complete-path history (no network) and executes here — L4\'s core seam ' +
        'check is fully sandbox-verifiable. The live Calling drive (a) is deferred.',
    )
  }

  // Build the five-spec, then assert it survives the Layer 1 schema (S1 (b)).
  const dp = buildDiscoveredPurpose(history, null)
  const { received } = assertLayer1Survival(ledger, dp, 'L4 (b):')

  // Founder side-by-side comparison (the matrix calls for the five input slots
  // printed beside what Layer 1 received).
  const onTheWire = JSON.parse(JSON.stringify(dp))
  console.log('\n--- S1 five-slot survival: input → Layer-1 received (founder comparison) ---')
  console.log(renderSlotComparison(onTheWire, received))
  console.log('\nLayer-1-received discovered_purpose:')
  console.log(JSON.stringify(received, null, 2))

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
      discovered_purpose_input: dp,
      layer1_received: received,
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
  console.error('run-l4 fatal:', err)
  process.exit(3)
})
