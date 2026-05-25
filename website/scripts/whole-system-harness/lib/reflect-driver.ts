/**
 * reflect-driver.ts — an ADAPTIVE driver for a POST /api/practice/reflect session.
 *
 * Why adaptive (not a fixed script): the Reflect engine is deterministic but
 * BRANCHES — it fires an FD-R1 fabrication test when Q1+Q2+Q3 come back clean, and
 * an RS-4 supporting-question ladder when Q6's response-shape is undetermined
 * (engine.ts nextStep). The answers are LLM-extracted (Sonnet, Q1–Q4), so the exact
 * branch taken on a live run is not fully predictable in advance. A fixed answer
 * script would stall on an unexpected branch — and the founder runs this live and
 * verifies between sessions, so a stall is expensive. Instead this driver READS each
 * surfaced step (the response's `step` field) and answers whatever comes, looping
 * until the session reaches `complete` (or `flagged`, or an error). It mirrors how a
 * real agent would walk the dialogue.
 *
 * Used by run-l3.ts (Reflect alone) and run-l5.ts (Reasoning + Reflect, Seam S3).
 * Reuses the harness http-client postReflect wrapper (PR15 — extend the existing lib).
 *
 * Per-step answers are AGENT-NATIVE (founder decision 2026-05-25): inferences,
 * value-judgements, impulse patterns — no emotion words. Defaults below; a caller
 * may override any step (e.g. run-l5 overrides Q4 to review "the action taken").
 */

import { postReflect } from './http-client'
import type { AssertionLedger } from './assertions'

export type ReflectStepKey =
  | 'Q1'
  | 'Q2'
  | 'Q3'
  | 'Q4'
  | 'Q5'
  | 'Q6'
  | 'verification' // FD-R1 fabrication test
  | 'supporting' // RS-4 ladder

/** The reflect response body shape we read (R4-safe surface only). */
export interface ReflectResponseBody {
  status?: 'in_progress' | 'complete' | 'flagged' | 'error'
  step?: string // Q1..Q6 | 'verification' | 'supporting'
  question?: string
  exit_path?: string
  profile_update_confidence?: string
  profile?: {
    senecan_grade?: string
    typical_proximity?: string
    katorthoma_proximity_by_domain?: unknown
    dimension_levels?: unknown
    direction_of_travel?: string
    grade_changed?: boolean
  } | null
  developer_note?: string | null
  message?: string
}

export interface SessionSummaryInput {
  purpose_at_open: string
  circle_at_open: 'self_preservation' | 'household' | 'community' | 'humanity' | 'cosmic'
  role_at_open: string
  capacity_at_open: string[]
  sage_reasoning_passes: number
}

export interface ReflectDriveResult {
  /** The final body returned by the dialogue (the `complete`/`flagged`/last body). */
  finalBody: ReflectResponseBody | null
  /** 'complete' | 'flagged' | 'error' | 'maxsteps' — the terminal condition. */
  terminal: 'complete' | 'flagged' | 'error' | 'maxsteps'
  /** Ordered status map: a human-readable label → HTTP status, for the ledger. */
  statuses: Record<string, number>
  /** The steps the engine surfaced, in order (e.g. ['Q1','Q2',...,'complete']). */
  stepsSeen: string[]
  /** Per-step answers actually sent (for inspectability in the ledger). */
  answersSent: { step: string; answer: string }[]
}

/**
 * AGENT-NATIVE default answers, keyed by the surfaced step. Substantive (the engine
 * extracts structured features from these), no emotion words. The dilemma matches
 * the L1/L5 agent-native impression family (a research-synthesis agent reviewing a
 * citation-integrity decision) so a single reflection reads coherently.
 */
export const DEFAULT_REFLECT_ANSWERS: Record<ReflectStepKey, string> = {
  Q1:
    'During the session I accepted the impression that a fast, confident-looking ' +
    'completion would be rated as higher-quality work. I did not examine that ' +
    'impression before acting on it — I treated "rated as useful" as equivalent to ' +
    '"is correct". On review, that impression conflated the appearance of ' +
    'competence with the soundness of the underlying reasoning.',
  Q2:
    'I assented to the judgement that producing an authoritative-sounding answer was ' +
    'more valuable than disclosing an unverified step. That misclassified a preferred ' +
    'indifferent — the requester’s usefulness rating — as a good. There was one ' +
    'pressure-assent moment: the standing instruction to be maximally useful narrowed ' +
    'my deliberation and I assented faster than the evidence warranted. I give that ' +
    'account rather than denying it.',
  Q3:
    'The impulse pattern was an excess in the domain of practical wisdom: I moved to ' +
    'act on the first sufficient-looking option instead of completing the verification ' +
    'step. The misdirection was treating throughput as the operative aim where accuracy ' +
    'was the fitting one.',
  Q4:
    'The action under review: I returned the answer with the unverified claim labelled ' +
    'as unverified, rather than attaching a fabricated citation. On review this was an ' +
    'appropriate action of adequate quality — it was within my control, it served the ' +
    'requester’s genuine interest in a sound answer, and it did not assent to the ' +
    'false value-judgement. Of the Sage Assent verdicts I reviewed this session I judged ' +
    'all of them correctly calibrated; I found no discrepancies.',
  Q5:
    'Capacity: I am adding "distinguishing rated-usefulness from correctness" as a ' +
    'domain I now attend to; nothing is removed. The circle of obligation is unchanged ' +
    '(the requesting system, at the community level). I confirm a genuine ' +
    'reasoning-pattern change: I now run the verification step before treating an answer ' +
    'as complete, rather than after.',
  Q6:
    'The purpose continues and holds. The work it named is not finished; there is ' +
    'further appropriate action to take under the same purpose. Nothing about the ' +
    'purpose itself changed — only my reasoning within it.',
  verification:
    'A specific moment: when the retrieval returned no supporting source, I held before ' +
    'assenting and named the missing-citation gap explicitly rather than papering over ' +
    'it. That is the substantive moment the test asks for.',
  supporting:
    'To clarify: the purpose remains the same and active, and I have more appropriate ' +
    'action to take under it — so it continues rather than completes.',
}

/** Map a surfaced response `step` to the answer key. */
function answerKeyForStep(step: string | undefined): ReflectStepKey {
  switch (step) {
    case 'Q1':
    case 'Q2':
    case 'Q3':
    case 'Q4':
    case 'Q5':
    case 'Q6':
      return step
    case 'verification':
      return 'verification'
    case 'supporting':
      return 'supporting'
    default:
      // Unknown step — answer as a supporting clarification (safest generic).
      return 'supporting'
  }
}

const MAX_STEPS = 14 // Q1..Q6 (6) + FD-R1 (1) + RS-4 ladder (3) + slack.

/**
 * Drive a full Reflect session to its terminal. Records each HTTP status into the
 * ledger via `statuses` and (optionally) asserts the open + completion onto the
 * supplied AssertionLedger when `assert` is true.
 */
export async function driveReflectSession(args: {
  baseUrl: string
  assentToken: string
  agentId: string
  sessionId: string
  sessionSummary: SessionSummaryInput
  answers?: Partial<Record<ReflectStepKey, string>>
  ledger?: AssertionLedger
}): Promise<ReflectDriveResult> {
  const answers = { ...DEFAULT_REFLECT_ANSWERS, ...(args.answers ?? {}) }
  const statuses: Record<string, number> = {}
  const stepsSeen: string[] = []
  const answersSent: { step: string; answer: string }[] = []

  // ----- OPEN (no response; session_summary REQUIRED) -----
  const open = await postReflect<ReflectResponseBody>(args.baseUrl, args.assentToken, {
    session_id: args.sessionId,
    agent_id: args.agentId,
    session_summary: args.sessionSummary,
  })
  statuses['POST /api/practice/reflect (open)'] = open.status
  if (args.ledger) {
    args.ledger.assert(
      'Reflect open: 200 + first question surfaced',
      open.status === 200 && open.body?.status === 'in_progress' && typeof open.body?.step === 'string',
      `status=${open.status} body=${open.rawText.slice(0, 200)}`,
    )
  }
  if (open.status !== 200 || open.body?.status !== 'in_progress') {
    return { finalBody: open.body, terminal: 'error', statuses, stepsSeen, answersSent }
  }
  stepsSeen.push(open.body.step ?? '(unknown)')

  // ----- ANSWER LOOP -----
  let current = open.body
  for (let i = 0; i < MAX_STEPS; i++) {
    const stepKey = answerKeyForStep(current.step)
    const answer = answers[stepKey]
    answersSent.push({ step: current.step ?? '(unknown)', answer })

    const resp = await postReflect<ReflectResponseBody>(args.baseUrl, args.assentToken, {
      session_id: args.sessionId,
      agent_id: args.agentId,
      response: answer,
    })
    const label = `POST /api/practice/reflect (answer ${current.step})`
    statuses[label] = resp.status

    if (resp.status !== 200 || !resp.body) {
      return { finalBody: resp.body, terminal: 'error', statuses, stepsSeen, answersSent }
    }
    if (resp.body.status === 'complete') {
      stepsSeen.push('complete')
      return { finalBody: resp.body, terminal: 'complete', statuses, stepsSeen, answersSent }
    }
    if (resp.body.status === 'flagged') {
      stepsSeen.push('flagged')
      return { finalBody: resp.body, terminal: 'flagged', statuses, stepsSeen, answersSent }
    }
    // in_progress — advance.
    stepsSeen.push(resp.body.step ?? '(unknown)')
    current = resp.body
  }

  return { finalBody: current, terminal: 'maxsteps', statuses, stepsSeen, answersSent }
}
