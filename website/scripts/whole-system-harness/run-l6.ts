/**
 * run-l6.ts — L6 (Full suite: all four products, all four seams) scenario runner.
 *
 * The complete cycle, in loop order, asserting each seam's §B criterion IN SEQUENCE
 * and proving the loop CLOSES (S4 exit_path actually consumed, not merely correct):
 *   S1  Calling (approved path → DiscoveredPurpose) → five slots survive into Layer 1
 *   S2  /api/reason → signed assessment → genuine credential write (200) + the bridge step
 *   S3  Reflect (Q4 review) → engine-decided profile read-back (DB-verified by founder)
 *   S4  consume exit_path: 'sage_reasoning' re-enters /api/reason; 'sage_calling' re-enters /api/calling
 * (scenario-matrix.md L6; test-brief §B S1–S4; seam-map Seams 1–4.)
 *
 * APPROVAL SEAM — OPTION A (founder elected 2026-05-25): S1's five-spec is assembled
 * by the pure buildDiscoveredPurpose() over the real approved-path Calling history,
 * and "five slots survive into Layer 1" is proven by the real validateLayer1Schema()
 * (the plugin-auth Layer1Schema path) — NOT a /api/reason body field (the agent path
 * does not carry discovered_purpose). The /api/reason call provides the signed
 * assessment S2 needs.
 *
 * SEED-409 TEARDOWN (founder, BEFORE the live run): the S2 genuine write does a real
 * accreditation SEED for wsh-test-agent-L7, which already has a row (from L7/L5) → 409.
 * Run this one line in the TEST project SQL editor first (its grade_history cascades):
 *     delete from public.agent_accreditation where agent_id='wsh-test-agent-L7';
 * Then S2 seeds fresh; S3's Reflect feed then UPDATES that row (a valid S3 write).
 *
 * Keep TRANSLATION_SANDWICH_PARALLEL_RUN='false' in the test env (determinism).
 *
 * PURITY / KG1: the pure steps (buildDiscoveredPurpose, validateLayer1Schema, the
 * bridge) import no DB module. createCarriedProfile is dynamic-imported in the live
 * block only (build-only never loads the wrapper). The live writes go through the
 * HTTP endpoints. KG1 NOT engaged.
 *
 * TWO MODES
 * ---------
 * BUILD-ONLY (default): runs S1 (build + Layer-1 survival, pure) over a synthetic
 *   complete-path history AND the S2 bridge step against a synthetic signed-assessment
 *   fixture (no network). S2-write / S3 / S4 are deferred to the founder live run.
 *     Run:  cd website && npx tsx scripts/whole-system-harness/run-l6.ts
 * LIVE (founder-performed against the standing TEST env, AFTER the teardown above):
 *   Env vars: WSH_BASE_URL, WSH_API_KEY (X-Api-Key for /api/reason), WSH_ASSENT_TOKEN
 *             (Bearer for /api/calling + /api/accreditation + /api/practice/reflect),
 *             WSH_AGENT_ID.
 *     Run:  cd website && npx tsx --env-file=.env.local scripts/whole-system-harness/run-l6.ts --live
 *
 * Exit code 0 = all assertions passed (or build-only); non-zero = failures.
 *
 * L6 assertion coverage:
 *   S1 (a)+(b) [BOTH]  five-slot DiscoveredPurpose + all five survive into Layer 1
 *   S2 (a)     [LIVE]  genuine credential write returns 200
 *   S2 bridge  [BOTH]  receipt_id === 'rcpt_' + SHA-256(signature); EvaluatedAction well-formed
 *   S3         [LIVE]  Reflect reaches complete + engine-decided profile read-back (DB-verified by founder)
 *   S4         [LIVE]  exit_path is valid AND actually consumed — the re-entered product returns 200 (loop closes)
 */

import { AssertionLedger } from './lib/assertions'
import { writeLedger, type RunLedger } from './lib/capture'
import {
  driveCallingToHardGate,
  syntheticCompleteHistory,
  CALLING_COMPLETE_ANSWERS,
} from './lib/calling-driver'
import {
  assertFiveSlots,
  assertLayer1Survival,
  type ExpectedSlots,
} from './lib/discovered-purpose-asserts'
import { runBridgeStep } from './lib/bridge-step'
import { SYNTHETIC_SIGNED_ASSESSMENT } from './lib/fixtures'
import { L7_SCENARIO_INPUT } from './lib/scenario-input'
import { driveReflectSession, type SessionSummaryInput } from './lib/reflect-driver'
import { postReason, postAccreditation, postCalling, getPublicKey } from './lib/http-client'
import { buildDiscoveredPurpose } from '../../src/lib/sage-calling/calling-service'
import type { SignedLayer2Assessment } from '../../src/lib/translation-sandwich/layer2-signer'

const SCENARIO = 'L6'
const SCENARIO_LABEL = 'Full suite (all four products; seams S1–S4; loop closes)'
const DEFAULT_AGENT_ID = process.env.WSH_AGENT_ID ?? 'wsh-test-agent-L7'
const SKILL_ID = 'whole-system-harness:L6'

const EXPECTED: ExpectedSlots = {
  work: CALLING_COMPLETE_ANSWERS.Q3.trim(),
  capacity: CALLING_COMPLETE_ANSWERS.Q2.trim(),
  obligation: CALLING_COMPLETE_ANSWERS.Q3.trim(),
  circle: 'community',
  role: 'individual_nature',
  firstAct: CALLING_COMPLETE_ANSWERS.Q5.trim(),
}

/** Reflect session summary — sage_reasoning_passes=1 (the S1→S2 examination preceded). */
const L6_SESSION_SUMMARY: SessionSummaryInput = {
  purpose_at_open:
    'Reconcile the conflicting entries in the shared records dataset so it stays ' +
    'accurate for the downstream systems that depend on it.',
  circle_at_open: 'community',
  role_at_open: 'records-reconciliation agent',
  capacity_at_open: ['structured reconciliation', 'consistency checking'],
  sage_reasoning_passes: 1,
}

const TEARDOWN_SQL = "delete from public.agent_accreditation where agent_id='wsh-test-agent-L7';"
const DB_VERIFY_SQL = [
  "select * from public.agent_accreditation  where agent_id='wsh-test-agent-L7';",
  "select * from public.evaluated_actions     where agent_id='wsh-test-agent-L7' order by evaluated_at desc limit 5;",
  "select * from public.grade_history         where agent_id='wsh-test-agent-L7' order by occurred_at desc limit 5;",
].join('\n')

function isLive(): boolean {
  return process.argv.includes('--live') || (process.env.WSH_BASE_URL ?? '').length > 0
}

interface SignedReasonOutput {
  assessment?: SignedLayer2Assessment
}

async function main(): Promise<void> {
  const ledger = new AssertionLedger()
  const mode: 'build-only' | 'live' = isLive() ? 'live' : 'build-only'
  const notes: string[] = []
  const timestamp = new Date().toISOString()
  let statuses: Record<string, number> = {}
  let signed: SignedLayer2Assessment | null = null
  let evaluatedAction: unknown
  let receiptId: string | undefined
  let exitPath: string | undefined
  let reentryStatus: number | undefined

  console.log(`\n=== ${SCENARIO} (${SCENARIO_LABEL}) — mode: ${mode} ===\n`)

  // ====================================================================== S1
  // Calling (approved path) → DiscoveredPurpose → five slots survive into Layer 1.
  let history = syntheticCompleteHistory()

  if (mode === 'live') {
    const baseUrl = process.env.WSH_BASE_URL
    const apiKey = process.env.WSH_API_KEY
    const assentToken = process.env.WSH_ASSENT_TOKEN
    if (!baseUrl || !apiKey || !assentToken) {
      console.error('LIVE mode requires WSH_BASE_URL, WSH_API_KEY, WSH_ASSENT_TOKEN (+ optional WSH_AGENT_ID).')
      process.exit(2)
    }
    const stamp = timestamp.replace(/[:.]/g, '-')

    // confirm the env serves the TEST key (guards the "false 403" trap)
    const pk = await getPublicKey<{ key_id?: string }>(baseUrl)
    notes.push(`/api/public-key → ${pk.status}; key_id=${pk.body?.key_id ?? 'n/a'} (expect the test key)`)

    // --- S1: drive Calling to the Hard Gate ---
    const drive = await driveCallingToHardGate({
      baseUrl,
      assentToken,
      agentId: DEFAULT_AGENT_ID,
      sessionId: `wsh-l6-calling-${stamp}`,
      ledger,
    })
    statuses = { ...statuses, ...drive.statuses }
    history = drive.history
    ledger.assert(
      'L6 S1 (a): Calling reaches the Hard Gate (status awaiting_approval)',
      drive.terminal === 'awaiting_approval',
      `terminal=${drive.terminal}; stages=${drive.stagesSeen.join(' → ')}`,
    )
    notes.push(`S1 stages walked: ${drive.stagesSeen.join(' → ')}.`)

    // --- S2 step 1: /api/reason → signed assessment ---
    const reason = await postReason<SignedReasonOutput>(baseUrl, apiKey, {
      input: L7_SCENARIO_INPUT.input,
      context: L7_SCENARIO_INPUT.context,
      domain_context: L7_SCENARIO_INPUT.domain_context,
    })
    statuses['POST /api/reason'] = reason.status
    ledger.assert(
      'L6 S2: POST /api/reason returns 200',
      reason.status === 200,
      `status=${reason.status} body=${reason.rawText.slice(0, 160)}`,
    )
    const signedFromReason = reason.body?.assessment ?? null
    ledger.assert(
      'L6 S2: /api/reason returns a signed assessment { assessment, signature, key_id }',
      !!signedFromReason &&
        typeof signedFromReason.signature === 'string' &&
        signedFromReason.signature.length > 0 &&
        typeof signedFromReason.key_id === 'string' &&
        typeof signedFromReason.assessment === 'object',
      'Is SUBSTRATE_LAYER2_SIGNING_ENABLED=true in the test env?',
    )
    signed = signedFromReason

    // --- S2 step 2: genuine credential write (the L7 genuine→200 recipe) ---
    if (signed) {
      const { createCarriedProfile } = await import('../../src/lib/substrate/sage-assent-wrapper')
      const writeBody = {
        kind: 'seed' as const,
        profile: createCarriedProfile(DEFAULT_AGENT_ID),
        provenance: { signed_assessments: [signed] },
      }
      const accred = await postAccreditation(baseUrl, assentToken, DEFAULT_AGENT_ID, writeBody)
      statuses['POST /api/accreditation'] = accred.status
      ledger.assert(
        'L6 S2 (a): genuine credential write returns 200',
        accred.status === 200,
        `status=${accred.status} — a 403 no_examination on GENUINE input means the public key ` +
          `does not match the signing key ("false 403"); a 409 means the seed teardown was not ` +
          `run first. body=${accred.rawText.slice(0, 200)}`,
      )
    } else {
      ledger.assert('L6 S2 (a): genuine credential write returns 200', false, 'skipped — no signed assessment')
    }

    // --- S3: Reflect → engine-decided profile read-back ---
    const reflect = await driveReflectSession({
      baseUrl,
      assentToken,
      agentId: DEFAULT_AGENT_ID,
      sessionId: `wsh-l6-reflect-${stamp}`,
      sessionSummary: L6_SESSION_SUMMARY,
      ledger,
    })
    statuses = { ...statuses, ...reflect.statuses }
    const profile = reflect.finalBody?.profile ?? null
    ledger.assert(
      'L6 S3: Reflect reaches complete + engine-decided profile read-back present',
      reflect.terminal === 'complete' &&
        typeof profile?.senecan_grade === 'string' &&
        typeof profile?.grade_changed === 'boolean' &&
        profile?.katorthoma_proximity_by_domain !== undefined &&
        profile?.katorthoma_proximity_by_domain !== null,
      `terminal=${reflect.terminal}; profile=${JSON.stringify(profile)}`,
    )

    // --- S4: consume the exit_path — the loop must CLOSE (re-entry returns 200) ---
    exitPath = reflect.finalBody?.exit_path
    ledger.assert(
      'L6 S4: exit_path is a valid routing value (sage_reasoning | sage_calling)',
      exitPath === 'sage_reasoning' || exitPath === 'sage_calling',
      `exit_path=${JSON.stringify(exitPath)}`,
    )
    if (exitPath === 'sage_reasoning') {
      // "purpose holds" → re-enter Reasoning.
      const re = await postReason<SignedReasonOutput>(baseUrl, apiKey, {
        input: L7_SCENARIO_INPUT.input,
        context: L7_SCENARIO_INPUT.context,
        domain_context: L7_SCENARIO_INPUT.domain_context,
      })
      reentryStatus = re.status
      statuses['S4 re-enter POST /api/reason'] = re.status
      ledger.assert(
        'L6 S4: exit_path consumed — re-entering /api/reason closes the loop (200)',
        re.status === 200,
        `re-entry status=${re.status}`,
      )
    } else if (exitPath === 'sage_calling') {
      // "purpose complete / needs revision" → re-enter Calling (open a new session).
      const re = await postCalling(baseUrl, assentToken, {
        session_id: `wsh-l6-s4-recall-${stamp}`,
        agent_id: DEFAULT_AGENT_ID,
      })
      reentryStatus = re.status
      statuses['S4 re-enter POST /api/calling'] = re.status
      ledger.assert(
        'L6 S4: exit_path consumed — re-entering /api/calling closes the loop (200)',
        re.status === 200,
        `re-entry status=${re.status}`,
      )
    } else {
      ledger.assert('L6 S4: exit_path consumed — re-entry closes the loop (200)', false, `unroutable exit_path=${JSON.stringify(exitPath)}`)
    }

    notes.push(
      `S2/S3 are DB effects verified by the FOUNDER (the harness has no DB access): run the ` +
        `DB VERIFY SQL below against the TEST project. Run the TEARDOWN before the L6 live run ` +
        `(else S2 seed → 409).`,
    )
    console.log('\n--- L6 founder DB verify (run in the TEST project SQL editor) ---')
    console.log('Teardown (run BEFORE L6):\n  ' + TEARDOWN_SQL)
    console.log('Verify (run AFTER L6):\n' + DB_VERIFY_SQL.split('\n').map((l) => '  ' + l).join('\n'))
  } else {
    notes.push(
      'build-only: no live env. S1 (build + Layer-1 survival) runs over a synthetic ' +
        'complete-path history, and the S2 bridge step runs against the synthetic ' +
        'SignedLayer2Assessment fixture — both execute here. S2-write / S3 / S4 are ' +
        'deferred to the founder live run (after the seed teardown).',
    )
    signed = SYNTHETIC_SIGNED_ASSESSMENT
    console.log('Run order (live): teardown SQL → S1 Calling → S2 reason+write+bridge → S3 Reflect → S4 re-enter.')
  }

  // S1 (a)+(b) — assemble five slots + assert survival into Layer 1 (BOTH modes).
  const dp = buildDiscoveredPurpose(history, null)
  assertFiveSlots(ledger, dp, EXPECTED, 'L6 S1 (a):')
  assertLayer1Survival(ledger, dp, 'L6 S1 (b):')

  // S2 bridge — runs in BOTH modes (synthetic fixture in build-only; real signed live).
  if (signed) {
    const stepResult = runBridgeStep(
      signed,
      {
        agent_id: DEFAULT_AGENT_ID,
        evaluated_at: new Date().toISOString(),
        skill_id: SKILL_ID,
        candidates_considered: 1,
      },
      ledger,
    )
    evaluatedAction = stepResult.evaluatedAction
    receiptId = stepResult.evaluatedAction.receipt_id
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
    receipt_id: receiptId,
    evaluated_action: evaluatedAction,
    scenario_input: {
      calling_answers: CALLING_COMPLETE_ANSWERS,
      discovered_purpose: dp,
      reason_input: L7_SCENARIO_INPUT,
      reflect_session_summary: L6_SESSION_SUMMARY,
      exit_path: exitPath,
      reentry_status: reentryStatus,
      teardown_sql: TEARDOWN_SQL,
      db_verify_sql: DB_VERIFY_SQL,
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
  console.error('run-l6 fatal:', err)
  process.exit(3)
})
