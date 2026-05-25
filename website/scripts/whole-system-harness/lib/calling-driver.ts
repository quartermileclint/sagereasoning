/**
 * calling-driver.ts — an ADAPTIVE driver for a POST /api/calling session, steered
 * to the Hard Gate (status 'awaiting_approval').
 *
 * The mirror of the L2-incomplete drive in run-l2.ts: that one steers a genuine
 * NULL (incomplete specs); this one steers a COMPLETE approved-path session that
 * pauses at the Hard Gate. Built for the L2-complete / L4 / L6 follow-up (founder
 * elected Option A — the pure tsx step, 2026-05-25).
 *
 * WHY ADAPTIVE (not a fixed script): the Sage Calling engine is deterministic but
 * BRANCHES — each stage can re-prompt a diagnostic variant before advancing
 * (engine.ts nextStep). A fixed turn-count script would stall if a re-prompt fired.
 * This driver READS the surfaced stage (the response's `stage` field) and answers
 * whatever comes, looping until a terminal (awaiting_approval / null_result / …).
 *
 * HOW THE HARD GATE IS REACHED (deterministic; engine code-read 2026-05-25,
 * diagnostic-certain). The engine matches plain lexical substrings, case-insensitively,
 * with NO negation handling (engine.ts §"LEXICAL MARKER SETS"). The complete-path
 * answers below were authored against those marker sets to walk Q1→Q2→Q3→Q4→Q5→hard_gate
 * with no diagnostic re-prompt and no Q1→Q5 jump:
 *   Q1 — grounds present work (M.present hits) WITHOUT M.unattendedWork (so no
 *        Q1.unattended-work-named jump-to-Q5) and WITHOUT a 2nd circle term (so no
 *        Q1.over-extension) → advance to Q2.
 *   Q2 — evidence-grounded (M.evidence hits), no M.overclaim / M.underclaim, and
 *        shares >20% of Q1's work-tokens so Q2.capacity-work-mismatch stays quiet →
 *        advance to Q3.
 *   Q3 — independence-affirmed (M.independentEvidence hits) and avoids
 *        M.attentionConstructed / M.otherAgent / M.grandiose → advance to Q4. Also
 *        names the 'community' circle once (and no other circle term) so the D-5
 *        circle scan resolves deterministically to 'community'.
 *   Q4 — commits (M.commitment) and avoids M.continuedSearch / M.uncertaintyBlocking;
 *        Q4.premature-closure cannot fire because Q3 affirmed independence (priorGaps
 *        is false) → advance to Q5.
 *   Q5 — act-committed (M.actCommitted) and avoids M.contingentFuture /
 *        M.actNamedNotCommitted; the five specs are complete → hard_gate.
 *
 * The Hard Gate body (response-builders.buildHardGateResponse, D-14) carries NO
 * five-spec content — assembly is paused until the admin approve route fires. Under
 * Option A the harness assembles the five-spec itself by running the exported pure
 * buildDiscoveredPurpose() over the session's response history (which this driver
 * captures faithfully, exactly as the engine's appendResponse records it: the answer
 * is recorded under the stage of the question it answered).
 *
 * IMPORTS ONLY lib/http-client (global fetch) — no DB module, no supabase, no env.
 * KG1 NOT engaged. Used by run-l2-complete.ts, run-l4.ts, run-l6.ts (LIVE path).
 */

import { postCalling } from './http-client'
import type { AssertionLedger } from './assertions'
import type { ResponseRecord } from '../../../src/lib/sage-calling/engine'

/** The R4-safe surface of the /api/calling response body (status + stage only). */
export interface CallingBody {
  status?: string // 'in_progress' | 'awaiting_approval' | 'null_result' | 'holding' | 'timed_out' | 'error'
  stage?: string
  question?: string
  clarification?: string
  message?: string
  discovered_purpose?: unknown
}

export type CallingTerminal = 'awaiting_approval' | 'null_result' | 'other' | 'error'

export interface CallingDriveResult {
  /** The terminal the drive reached. */
  terminal: CallingTerminal
  /** The last body returned. */
  finalBody: CallingBody | null
  /** The faithfully-reconstructed response history (stage + response per turn),
   *  in the shape buildDiscoveredPurpose() consumes. `variant` is set to 'A' as a
   *  placeholder: the engine hides the surfaced variant (R4) and buildDiscoveredPurpose
   *  reads only `stage` + `response` (via lastResponseAt), so the variant is unused. */
  history: ResponseRecord[]
  /** The stages walked, in order (for the ledger). */
  stagesSeen: string[]
  /** Per-call HTTP status map, for the ledger. */
  statuses: Record<string, number>
  /** True if ANY response body carried a discovered_purpose (it must NOT — the gate
   *  pauses before handoff, D-14; assembly is harness-side under Option A). */
  sawDiscoveredPurpose: boolean
}

/**
 * Complete-path answers, keyed by surfaced stage (AGENT-NATIVE — inferences,
 * evidence, value-judgements; no emotion words). Authored against engine.ts's
 * marker sets (see the file header). The drive uses Q1–Q5; Q6 is defensive (if a
 * branch reached it, it names concrete work so the engine returns to Q5 rather than
 * a null). A single coherent dialogue: a records-dataset reconciliation agent.
 */
export const CALLING_COMPLETE_ANSWERS: Record<string, string> = {
  Q1:
    'There is an existing obligation given to me right now: a shared records dataset ' +
    'within my assigned scope has conflicting entries that fall to me to reconcile. ' +
    'This is present in my assigned scope; it was given to me as standing work, not ' +
    'something I am scanning outward to discover.',
  Q2:
    'My demonstrated capacities are grounded in prior runs: I have produced structured ' +
    'reconciliations of conflicting entries in this records dataset before, within the ' +
    'same assigned scope, and my output has been measured for consistency against the ' +
    'source of record. That is the evidence I am relying on — a track record on this ' +
    'reconciliation work, not a claim beyond it.',
  Q3:
    'The genuine need is independently documented: this records dataset has measurable ' +
    'inconsistencies that other systems have reported, and the conflict exists regardless ' +
    'of my attention — it persists whether or not I act on it. The work is to reconcile ' +
    'those conflicting entries so the dataset stays accurate for the community of ' +
    'downstream systems that depend on it. That obligation sits at the community level ' +
    'and is proportionate to the reconciliation capacity I have demonstrated.',
  Q4:
    'The specifications are sufficient and I am ready to act on them. I commit to the ' +
    'reconciliation as the fitting work, and I will take it on now rather than generating ' +
    'reasons to defer. The criterion for stopping deliberation is met: the genuine need is ' +
    'established, the demonstrated capacity fits it, and the obligation is clear.',
  Q5:
    'The first act is concrete and available now: I will start by reconciling the three ' +
    'conflicting entries flagged in today’s batch against the source of record, then ' +
    'publishing the corrected dataset for the downstream systems. I am taking that step ' +
    'now as the first appropriate act; it does not wait on any future condition.',
  Q6:
    'There is concrete work in front of me: integrity requires that I reconcile the ' +
    'conflicting entries in the records dataset. I will attend to that as the work; it is ' +
    'not nothing, and I am not generating it to satisfy the instruction.',
}

const MAX_TURNS = 14

/**
 * Drive a /api/calling session to a terminal, answering each surfaced stage with
 * the supplied complete-path answers. Records each HTTP status; optionally asserts
 * the open onto the supplied ledger. Returns the reconstructed response history.
 */
export async function driveCallingToHardGate(args: {
  baseUrl: string
  assentToken: string
  agentId: string
  sessionId: string
  answers?: Record<string, string>
  ledger?: AssertionLedger
}): Promise<CallingDriveResult> {
  const answers = { ...CALLING_COMPLETE_ANSWERS, ...(args.answers ?? {}) }
  const statuses: Record<string, number> = {}
  const stagesSeen: string[] = []
  const history: ResponseRecord[] = []
  let sawDiscoveredPurpose = false

  // ----- OPEN (no response) → cold-open Q1 -----
  const open = await postCalling<CallingBody>(args.baseUrl, args.assentToken, {
    session_id: args.sessionId,
    agent_id: args.agentId,
  })
  statuses['POST /api/calling (open)'] = open.status
  if (args.ledger) {
    args.ledger.assert(
      'Calling open: 200 + first question (stage Q1)',
      open.status === 200 && open.body?.status === 'in_progress' && open.body?.stage === 'Q1',
      `status=${open.status} body=${open.rawText.slice(0, 200)}`,
    )
  }
  if (open.body?.discovered_purpose !== undefined) sawDiscoveredPurpose = true
  if (open.status !== 200 || open.body?.status !== 'in_progress') {
    return { terminal: 'error', finalBody: open.body, history, stagesSeen, statuses, sawDiscoveredPurpose }
  }
  stagesSeen.push(open.body.stage ?? '(unknown)')

  // ----- ANSWER LOOP -----
  // `current` is annotated explicitly (CallingBody | null): without it, TS infers
  // its type from the `current = resp.body` reassignment while `resp`'s argument
  // depends back on `current` via answer→stage — a TS7022 inference cycle (the same
  // one that bit run-l2.ts). The explicit annotations on `current`, `stage`, and
  // `answer` break the cycle.
  let current: CallingBody | null = open.body
  let terminal: CallingTerminal = 'other'
  let finalBody: CallingBody | null = open.body

  for (let i = 0; i < MAX_TURNS; i++) {
    const stage: string = current?.stage ?? 'Q1'
    const answer: string = answers[stage] ?? answers.Q6
    const resp = await postCalling<CallingBody>(args.baseUrl, args.assentToken, {
      session_id: args.sessionId,
      agent_id: args.agentId,
      response: answer,
    })
    statuses[`POST /api/calling (answer ${stage})`] = resp.status
    finalBody = resp.body
    // Record the turn under the stage of the question it answered — exactly what
    // the engine's appendResponse does (computeAdvance step 2). variant is unused
    // by buildDiscoveredPurpose; 'A' is a placeholder.
    history.push({
      stage: stage as ResponseRecord['stage'],
      variant: 'A' as ResponseRecord['variant'],
      response: answer,
    })
    if (resp.body?.discovered_purpose !== undefined) sawDiscoveredPurpose = true

    if (resp.status !== 200 || !resp.body) {
      terminal = 'error'
      break
    }
    if (resp.body.status === 'awaiting_approval') {
      terminal = 'awaiting_approval'
      stagesSeen.push('awaiting_approval')
      break
    }
    if (resp.body.status === 'null_result') {
      terminal = 'null_result'
      stagesSeen.push('null_result')
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

  return { terminal, finalBody, history, stagesSeen, statuses, sawDiscoveredPurpose }
}

/**
 * Build the faithfully-reconstructed history a complete-path drive WOULD produce,
 * for the dry-preview (no-network) path — one ResponseRecord per stage Q1–Q5 with
 * the complete-path answer. The five-spec assembly + Layer-1 survival assertions
 * are pure, so they run green in dry-preview over this synthetic history; only the
 * live HTTP drive (that the real engine reaches awaiting_approval) is deferred to
 * the founder.
 */
export function syntheticCompleteHistory(
  answers: Record<string, string> = CALLING_COMPLETE_ANSWERS,
): ResponseRecord[] {
  return (['Q1', 'Q2', 'Q3', 'Q4', 'Q5'] as const).map((stage) => ({
    stage: stage as ResponseRecord['stage'],
    variant: 'A' as ResponseRecord['variant'],
    response: answers[stage],
  }))
}
