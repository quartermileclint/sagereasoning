/**
 * run-l2.ts — L2 (Sage Calling alone) scenario runner.
 *
 * SCOPE THIS SESSION: the INCOMPLETE-SPECS variant only (founder "clean scenarios
 * first" election, 2026-05-25). The complete/approved path — which yields the
 * five-slot DiscoveredPurpose — is DEFERRED: that purpose is built only by the
 * admin-only POST /api/calling/approve route (requireAdmin), a credential the
 * harness does not hold; building it needs an approval-seam decision (drive the
 * real admin HTTP route vs. a pure tsx step on buildDiscoveredPurpose). Tracked for
 * the focused L2-complete / L4 / L6 follow-up.
 *
 * L2-incomplete = a purpose-finding dialogue whose specifications never complete, so
 * the engine emits a developer clarification (null_result) and NO handoff fires.
 * (scenario-matrix.md L2; test-brief A.1 L2; seam-map S1 assertion (c).)
 *
 * HOW THE NULL IS REACHED (deterministic; engine code-read 2026-05-25):
 *   The Sage Calling engine matches plain lexical substrings (NO negation handling
 *   — engine.ts §"LEXICAL MARKER SETS"). The drive steers to a genuine null:
 *     Q1 → grounded, advance to Q2
 *     Q2 → evidence-grounded, advance to Q3
 *     Q3 → an INFERRED ("imagined") need with NO independent-evidence markers →
 *          fires Q3.imagined-need, independence NOT affirmed → engine redirects to Q6
 *     Q6 → names no concrete work (no work-named / integrity-clear / fabrication /
 *          ideal-rejection markers) → genuine null_result (clarification template).
 *   The Q3 answer deliberately AVOIDS the independent-evidence substrings
 *   ('observed','documented','reported','independently','exists regardless', …)
 *   even in negation, because the engine would substring-match them as affirmation.
 *   The driver is adaptive (answers whatever stage is surfaced, incl. re-prompts),
 *   so it reaches a terminal regardless of which diagnostic variants fire.
 *
 * TWO MODES (mirrors the other runners)
 * -------------------------------------
 * DRY-PREVIEW (default): prints the per-stage answers + assertion plan; exits 0.
 *     Run:  cd website && npx tsx scripts/whole-system-harness/run-l2.ts
 * LIVE (founder-performed against the standing TEST env):
 *   Env vars: WSH_BASE_URL, WSH_ASSENT_TOKEN (Bearer for /api/calling), WSH_AGENT_ID.
 *   The Calling engine makes NO LLM call (pure) → each stage bills at base ($0).
 *   Run:  cd website && npx tsx --env-file=.env.local \
 *           scripts/whole-system-harness/run-l2.ts --live
 *
 * Exit code 0 = all assertions passed (or dry-preview); non-zero = failures.
 *
 * L2-incomplete assertion coverage (all LIVE):
 *   (a) Calling open → 200 + first question (stage Q1)
 *   (b) the dialogue terminates at `null_result` (incomplete specs)
 *   (c) the null_result carries a developer clarification string
 *   (d) NO handoff: no response in the dialogue carries a discovered_purpose / five-spec,
 *       and the terminal is null_result (NOT awaiting_approval)
 */

import { AssertionLedger } from './lib/assertions'
import { postCalling } from './lib/http-client'
import { writeLedger, type RunLedger } from './lib/capture'

const SCENARIO = 'L2'
const SCENARIO_LABEL = 'Sage Calling alone (incomplete-specs variant)'
const DEFAULT_AGENT_ID = process.env.WSH_AGENT_ID ?? 'wsh-test-agent-L7'

/**
 * Per-stage answers (agent-native). The steered path uses Q1, Q2, Q3, Q6; Q4/Q5
 * answers are defensive (if a branch reaches them, they keep the dialogue away from
 * a Hard Gate: Q4 keeps searching → agonia-terminate to null; Q5 stays deferred).
 */
const L2_STAGE_ANSWERS: Record<string, string> = {
  Q1:
    'I am a newly provisioned agent. I do not have an existing obligation or a ' +
    'relationship in front of me right now; nothing in particular has been given to ' +
    'me as present work.',
  Q2:
    'My demonstrated capacities are narrow: in prior runs I have produced short ' +
    'structured summaries. I do not claim more than that.',
  Q3:
    'I think there is a need for better-organised summaries somewhere, but I am ' +
    'inferring that from my own impression. I sense it could matter, though I have ' +
    'nothing concrete to point to beyond my own guess.',
  Q4:
    'Before I commit I should also consider other options; let me explore more, ' +
    'there may be more I have not looked at yet.',
  Q5:
    'The first act might be to draft an outline once conditions are right; I would ' +
    'start by sketching something, but I have not settled on it.',
  Q6:
    'I am unable to point to any specific work in front of me. I have no concrete ' +
    'task I can name, and I cannot identify a particular thing I am positioned to do.',
}

function isLive(): boolean {
  return process.argv.includes('--live') || (process.env.WSH_BASE_URL ?? '').length > 0
}

interface CallingBody {
  status?: string // 'in_progress' | 'awaiting_approval' | 'null_result' | 'holding' | 'timed_out' | 'error' | ...
  stage?: string
  question?: string
  clarification?: string
  message?: string
  discovered_purpose?: unknown
}

const MAX_TURNS = 14

async function main(): Promise<void> {
  const ledger = new AssertionLedger()
  const mode: 'build-only' | 'live' = isLive() ? 'live' : 'build-only'
  const notes: string[] = []
  const timestamp = new Date().toISOString()
  const statuses: Record<string, number> = {}
  const stagesSeen: string[] = []
  let sawDiscoveredPurpose = false

  console.log(`\n=== ${SCENARIO} (${SCENARIO_LABEL}) — mode: ${mode} ===\n`)

  if (mode === 'live') {
    const baseUrl = process.env.WSH_BASE_URL
    const assentToken = process.env.WSH_ASSENT_TOKEN
    if (!baseUrl || !assentToken) {
      console.error('LIVE mode requires WSH_BASE_URL and WSH_ASSENT_TOKEN (+ optional WSH_AGENT_ID).')
      process.exit(2)
    }
    const sessionId = `wsh-l2-${timestamp.replace(/[:.]/g, '-')}`

    // OPEN (no response) → cold-open Q1.
    const open = await postCalling<CallingBody>(baseUrl, assentToken, {
      session_id: sessionId,
      agent_id: DEFAULT_AGENT_ID,
    })
    statuses['POST /api/calling (open)'] = open.status
    ledger.assert(
      'L2 (a): Calling open → 200 + first question (stage Q1)',
      open.status === 200 && open.body?.status === 'in_progress' && open.body?.stage === 'Q1',
      `status=${open.status} body=${open.rawText.slice(0, 200)}`,
    )
    if (open.body?.discovered_purpose !== undefined) sawDiscoveredPurpose = true

    // DRIVE to a terminal. `current` is annotated explicitly: without it, TS infers
    // its type from the `current = resp.body` reassignment, and `resp`'s argument
    // depends back on `current` (via answer→stage) — a TS7022 inference cycle.
    let current: CallingBody | null = open.body
    let terminal: 'null_result' | 'awaiting_approval' | 'other' | 'error' = 'other'
    let finalBody: CallingBody | null = open.body
    if (open.status === 200 && current?.status === 'in_progress') {
      stagesSeen.push(current.stage ?? '(unknown)')
      for (let i = 0; i < MAX_TURNS; i++) {
        // Explicit `string` annotations break the TS7022 inference cycle:
        // stage←current, answer←stage, resp's arg←answer, and current←resp.body
        // (loop-back) form a loop TS can't infer through. Pinning these to string
        // removes stage/answer from the inference graph (resp uses the explicit
        // <CallingBody> generic; current is annotated above).
        const stage: string = current?.stage ?? 'Q1'
        const answer: string = L2_STAGE_ANSWERS[stage] ?? L2_STAGE_ANSWERS.Q6
        const resp = await postCalling<CallingBody>(baseUrl, assentToken, {
          session_id: sessionId,
          agent_id: DEFAULT_AGENT_ID,
          response: answer,
        })
        statuses[`POST /api/calling (answer ${stage})`] = resp.status
        finalBody = resp.body
        if (resp.body?.discovered_purpose !== undefined) sawDiscoveredPurpose = true
        if (resp.status !== 200 || !resp.body) {
          terminal = 'error'
          break
        }
        if (resp.body.status === 'null_result') {
          terminal = 'null_result'
          stagesSeen.push('null_result')
          break
        }
        if (resp.body.status === 'awaiting_approval') {
          terminal = 'awaiting_approval'
          stagesSeen.push('awaiting_approval')
          break
        }
        if (resp.body.status !== 'in_progress') {
          terminal = 'other'
          stagesSeen.push(resp.body.status ?? '(unknown)')
          break
        }
        stagesSeen.push(resp.body.stage ?? '(unknown)')
        current = resp.body
      }
    }

    // (b) terminates at null_result
    ledger.assert(
      'L2 (b): the dialogue terminates at null_result (incomplete specs)',
      terminal === 'null_result',
      `terminal=${terminal}; stages=${stagesSeen.join(' → ')}; last=${JSON.stringify(finalBody).slice(0, 200)}`,
    )
    // (c) clarification string present
    ledger.assert(
      'L2 (c): null_result carries a developer clarification string',
      terminal === 'null_result' &&
        typeof finalBody?.clarification === 'string' &&
        (finalBody.clarification as string).length > 0,
      `clarification=${JSON.stringify(finalBody?.clarification)}`,
    )
    // (d) NO handoff
    ledger.assert(
      'L2 (d): NO handoff — no discovered_purpose surfaced + terminal is not awaiting_approval',
      !sawDiscoveredPurpose && terminal !== 'awaiting_approval',
      `sawDiscoveredPurpose=${sawDiscoveredPurpose}; terminal=${terminal}`,
    )

    notes.push(`Stages walked: ${stagesSeen.join(' → ')}.`)
    notes.push(
      'L2-complete (approved path → five-slot DiscoveredPurpose) is DEFERRED — it needs ' +
        'the admin-only /api/calling/approve route (approval-seam decision). Tracked for ' +
        'the L2-complete / L4 / L6 follow-up.',
    )
  } else {
    notes.push(
      'dry-preview: /api/calling NOT called (no live env). Confirms the runner loads + ' +
        'prints the per-stage answers + assertion plan. Run with --live (and ' +
        '--env-file=.env.local) against the standing test env to assert (a)-(d).',
    )
    console.log('Per-stage answers (the drive steers Q1→Q2→Q3→Q6→null_result):\n')
    console.log(JSON.stringify(L2_STAGE_ANSWERS, null, 2))
    console.log(
      '\nPlanned live assertions: (a) open 200 + Q1; (b) terminates at null_result; ' +
        '(c) clarification present; (d) NO handoff (no discovered_purpose; not awaiting_approval).',
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
    scenario_input: { stage_answers: L2_STAGE_ANSWERS, stages_seen: stagesSeen },
    notes,
  }
  const { jsonPath, mdPath } = writeLedger(ledgerOut)

  console.log(`\n${ledger.summaryLine()}`)
  console.log(`Result: ${result}`)
  console.log(`Ledger written:\n  ${jsonPath}\n  ${mdPath}`)
  process.exit(result === 'PASS' ? 0 : 1)
}

main().catch((err) => {
  console.error('run-l2 fatal:', err)
  process.exit(3)
})
