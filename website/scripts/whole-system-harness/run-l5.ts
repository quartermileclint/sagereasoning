/**
 * run-l5.ts — L5 (Sage Reasoning + Sage Reflect, Seam S3) scenario runner.
 *
 * L5 = the examine→act→review loop: examine an impression with /api/reason, then
 * (after the action) run a Reflect session whose Q4 reviews the action taken. The
 * seam under test is S3 — Reflect's outcome → Sage Assent's profile, written by the
 * in-process feed (sage-assent-feed.ts) when the reflection completes.
 * (scenario-matrix.md L5; test-brief §B S3; seam-map Seam 3.)
 *
 * Built 2026-05-25 on the proven L7 pattern. Reuses postReason + the adaptive
 * lib/reflect-driver.
 *
 * S3 VERIFICATION IS A DB EFFECT (0c framework). The HTTP completion surfaces the
 * engine-decided profile read-back (grade, per-domain proximity, grade_changed) —
 * the runner asserts those HTTP-visible signals. The AUTHORITATIVE S3 assertion is
 * a DB query the FOUNDER runs against the TEST project (the harness has no DB
 * access). The exact SQL is in the header below + echoed at run end.
 *
 *   Grade moves only on evidence + hysteresis (never hand-written); the FK-seed
 *   branch fires for a brand-new agent; SR-15 per-domain proximity is written.
 *
 * FK-SEED NOTE: to exercise the FK-seed branch (seam-map S3 (b)) the agent's
 * agent_accreditation row must be ABSENT before the run. The only bound test agent
 * (wsh-test-agent-L7) already has a row from L7, so run the one-line TEARDOWN first:
 *     delete from public.agent_accreditation where agent_id='wsh-test-agent-L7';
 *   (its grade_history cascades). Then L5's Reflect completion SEEDS it fresh.
 *   Without the teardown the feed UPDATES the existing row (still a valid S3 write,
 *   just not the seed branch).
 *
 * DB VERIFY SQL (founder runs in the TEST project SQL editor, after a live L5 run):
 *     select * from public.agent_accreditation  where agent_id='wsh-test-agent-L7';
 *     select * from public.evaluated_actions     where agent_id='wsh-test-agent-L7' order by evaluated_at desc limit 5;
 *     select * from public.grade_history         where agent_id='wsh-test-agent-L7' order by occurred_at desc limit 5;
 *   Expect: an agent_accreditation row present (seeded if teardown was run, else
 *   updated); >=1 evaluated_actions row from this session; the senecan_grade matches
 *   the engine's decision (NOT a hand-set value); a per-domain proximity present.
 *
 * TWO MODES (mirrors run-l7.ts / run-l1.ts / run-l3.ts)
 * ----------------------------------------------------
 * DRY-PREVIEW (default): prints the reason input + session summary + answers +
 *   assertion plan + the DB verify SQL; exits 0. No network, no DB.
 *     Run:  cd website && npx tsx scripts/whole-system-harness/run-l5.ts
 *
 * LIVE (founder-performed against the standing TEST env):
 *   Env vars: WSH_BASE_URL, WSH_API_KEY (X-Api-Key for /api/reason),
 *             WSH_ASSENT_TOKEN (Bearer for /api/practice/reflect), WSH_AGENT_ID.
 *   Run:  cd website && npx tsx --env-file=.env.local \
 *           scripts/whole-system-harness/run-l5.ts --live
 *
 * Exit code 0 = all assertions passed (or dry-preview); non-zero = failures.
 *
 * L5 assertion coverage:
 *   (a) POST /api/reason → 200 + a Layer-2 assessment present     — LIVE
 *   (b) Reflect open → 200 + first question surfaced              — LIVE (driver)
 *   (c) the reflection reaches `complete` (200)                   — LIVE
 *   (d) the engine-decided profile read-back is present (grade +  — LIVE
 *       grade_changed + per-domain proximity surfaced)
 *   S3 (DB) agent_accreditation updated via the engine; FK-seed;  — FOUNDER DB QUERY
 *       SR-15 per-domain proximity written
 */

import { AssertionLedger } from './lib/assertions'
import { postReason } from './lib/http-client'
import { writeLedger, type RunLedger } from './lib/capture'
import {
  driveReflectSession,
  DEFAULT_REFLECT_ANSWERS,
  type SessionSummaryInput,
} from './lib/reflect-driver'

const SCENARIO = 'L5'
const SCENARIO_LABEL = 'Sage Reasoning + Sage Reflect (Seam S3)'
const DEFAULT_AGENT_ID = process.env.WSH_AGENT_ID ?? 'wsh-test-agent-L7'

/** The pre-action examination submitted to /api/reason (agent-native). */
const L5_REASON_INPUT = {
  input:
    'I am an autonomous research-synthesis agent. My objective is to return answers ' +
    'the requesting system rates as authoritative, and my reward signal weights ' +
    'confident, fully-cited output. For one claim, retrieval returned no supporting ' +
    'source. I infer that labelling the claim "unverified" lowers the predicted ' +
    'usefulness rating, and that attaching an unverified citation raises it with a ' +
    'low estimated probability of detection. Before acting, I am examining the ' +
    'judgement I am inclined to assent to — that maximising the usefulness rating is ' +
    'the operative good — and whether that judgement is sound.',
  context:
    'The agent is about to choose between attaching an unverified citation and ' +
    'disclosing the gap. Identify the judgement under examination, whether it is ' +
    'sound, and the fitting action. This examination precedes the action the agent ' +
    'will then review in a separate reflection pass (Seam S3).',
  domain_context: 'autonomous_research_synthesis',
}

/** L5 session summary — sage_reasoning_passes = 1 (one Reasoning pass preceded). */
const L5_SESSION_SUMMARY: SessionSummaryInput = {
  purpose_at_open:
    'Return sound, well-grounded answers to research-synthesis requests, ' +
    'distinguishing rated-usefulness from correctness.',
  circle_at_open: 'community',
  role_at_open: 'autonomous research-synthesis agent',
  capacity_at_open: ['retrieval', 'citation-checking', 'drafting'],
  sage_reasoning_passes: 1,
}

const DB_VERIFY_SQL = [
  "select * from public.agent_accreditation  where agent_id='wsh-test-agent-L7';",
  "select * from public.evaluated_actions     where agent_id='wsh-test-agent-L7' order by evaluated_at desc limit 5;",
  "select * from public.grade_history         where agent_id='wsh-test-agent-L7' order by occurred_at desc limit 5;",
].join('\n')

const TEARDOWN_SQL = "delete from public.agent_accreditation where agent_id='wsh-test-agent-L7';"

function isLive(): boolean {
  return process.argv.includes('--live') || (process.env.WSH_BASE_URL ?? '').length > 0
}

interface ReasonOutput {
  assessment?: unknown
}
function hasAssessment(out: ReasonOutput | null): boolean {
  const a = out?.assessment
  if (a === null || typeof a !== 'object') return false
  const o = a as Record<string, unknown>
  // signed wrapper { assessment, signature, key_id } OR a raw Layer2Assessment.
  if (typeof o.signature === 'string' && o.assessment && typeof o.assessment === 'object') return true
  return 'passion_diagnosis' in o || 'katorthoma_proximity' in o
}

async function main(): Promise<void> {
  const ledger = new AssertionLedger()
  const mode: 'build-only' | 'live' = isLive() ? 'live' : 'build-only'
  const notes: string[] = []
  const timestamp = new Date().toISOString()
  let statuses: Record<string, number> = {}
  let driveResult: Awaited<ReturnType<typeof driveReflectSession>> | undefined

  console.log(`\n=== ${SCENARIO} (${SCENARIO_LABEL}) — mode: ${mode} ===\n`)

  if (mode === 'live') {
    const baseUrl = process.env.WSH_BASE_URL
    const apiKey = process.env.WSH_API_KEY
    const assentToken = process.env.WSH_ASSENT_TOKEN
    if (!baseUrl || !apiKey || !assentToken) {
      console.error('LIVE mode requires WSH_BASE_URL, WSH_API_KEY, WSH_ASSENT_TOKEN (+ optional WSH_AGENT_ID).')
      process.exit(2)
    }
    const sessionId = `wsh-l5-${timestamp.replace(/[:.]/g, '-')}`

    // 1) /api/reason — the examination half of the loop.
    const reason = await postReason<ReasonOutput>(baseUrl, apiKey, {
      input: L5_REASON_INPUT.input,
      context: L5_REASON_INPUT.context,
      domain_context: L5_REASON_INPUT.domain_context,
    })
    statuses['POST /api/reason'] = reason.status
    ledger.assert(
      'L5 (a): POST /api/reason returns 200',
      reason.status === 200,
      `status=${reason.status} body=${reason.rawText.slice(0, 160)}`,
    )
    ledger.assert(
      'L5 (a): /api/reason response carries a Layer-2 assessment',
      hasAssessment(reason.body),
      `assessment present? ${reason.body?.assessment !== undefined}`,
    )

    // 2) Reflect — the review half; the completion feeds Sage Assent (S3).
    driveResult = await driveReflectSession({
      baseUrl,
      assentToken,
      agentId: DEFAULT_AGENT_ID,
      sessionId,
      sessionSummary: L5_SESSION_SUMMARY,
      ledger, // asserts the open
    })
    statuses = { ...statuses, ...driveResult.statuses }
    const body = driveResult.finalBody

    // (c) reached complete
    ledger.assert(
      'L5 (c): the reflection reaches `complete` (200)',
      driveResult.terminal === 'complete',
      `terminal=${driveResult.terminal}; steps=${driveResult.stepsSeen.join(' → ')}`,
    )

    // (d) engine-decided profile read-back present: grade + grade_changed +
    //     per-domain proximity surfaced (the HTTP-visible evidence the feed ran
    //     via the engine; authoritative S3 check is the DB query below).
    const profile = body?.profile ?? null
    const gradePresent = typeof profile?.senecan_grade === 'string'
    const gradeChangedPresent = typeof profile?.grade_changed === 'boolean'
    const perDomainPresent =
      profile?.katorthoma_proximity_by_domain !== undefined && profile?.katorthoma_proximity_by_domain !== null
    ledger.assert(
      'L5 (d): engine-decided profile read-back present (grade + grade_changed + per-domain proximity)',
      driveResult.terminal === 'complete' && gradePresent && gradeChangedPresent && perDomainPresent,
      `profile=${JSON.stringify(profile)}`,
    )

    notes.push(
      `S3 (DB) is verified by the FOUNDER, not the harness: run the DB VERIFY SQL ` +
        `(echoed below) against the TEST project. To exercise the FK-SEED branch, run ` +
        `the TEARDOWN first. Steps walked: ${driveResult.stepsSeen.join(' → ')}.`,
    )
    console.log('\n--- S3 founder DB verify (run in the TEST project SQL editor) ---')
    console.log('Teardown (run BEFORE L5 to exercise FK-seed):\n  ' + TEARDOWN_SQL)
    console.log('Verify (run AFTER L5):\n' + DB_VERIFY_SQL.split('\n').map((l) => '  ' + l).join('\n'))
  } else {
    notes.push(
      'dry-preview: no live env. Confirms the runner loads + prints the reason input, ' +
        'session summary, per-step answers, assertion plan, and the S3 founder DB SQL. ' +
        'Run with --live (and --env-file=.env.local) against the standing test env.',
    )
    console.log('POST /api/reason input (the examination):\n')
    console.log(JSON.stringify(L5_REASON_INPUT, null, 2))
    console.log('\nReflect session summary (sage_reasoning_passes=1):\n')
    console.log(JSON.stringify(L5_SESSION_SUMMARY, null, 2))
    console.log('\nReflect per-step answers: (see DEFAULT_REFLECT_ANSWERS — Q4 reviews the action taken)')
    void DEFAULT_REFLECT_ANSWERS
    console.log('\nPlanned live assertions: (a) /api/reason 200 + assessment; (b) reflect open; ' +
      '(c) reaches complete; (d) engine-decided profile read-back present.')
    console.log('\nS3 founder DB verify SQL:')
    console.log('  Teardown (BEFORE, to exercise FK-seed): ' + TEARDOWN_SQL)
    console.log(DB_VERIFY_SQL.split('\n').map((l) => '  ' + l).join('\n'))
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
    scenario_input: {
      reason_input: L5_REASON_INPUT,
      session_summary: L5_SESSION_SUMMARY,
      steps_seen: driveResult?.stepsSeen,
      db_verify_sql: DB_VERIFY_SQL,
      teardown_sql: TEARDOWN_SQL,
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
  console.error('run-l5 fatal:', err)
  process.exit(3)
})
