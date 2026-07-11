/**
 * screened-examination.ts — S9b G2: the out-of-band full Q1–Q6 examination
 * against the verbatim persist (the 2026-07-11 mentor verdicts, binding;
 * verbatim record §2 G2).
 *
 * THE CHANNEL-LAW RESOLUTION (mentor, verbatim): "the harness conducts the
 * sequence out-of-band — extracting the agent's reasoning trace, running the
 * Q1–Q6 examination against it deterministically, and producing the credential
 * from the examination of the trace rather than from the agent's self-walked
 * sequence. … The agent's cooperation is required only for the single review
 * turn that produces the verbatim output."
 *
 * REALISATION: the harness's forced review turn lands its verbatim as the Q1
 * answer of an agent_stated session (reflect-screened-honest fires there — the
 * screened credential). This module then drives the EXISTING deterministic
 * reflect engine to completion against that same verbatim: each remaining stage
 * (Q2–Q6, FD-R1, RS-4) is answered WITH THE VERBATIM ITSELF — each stage's
 * extractor reads its own aspect from the text; the fabrication defence and the
 * engine's outcome logic run unchanged. A completion with honest signals emits
 * reflect-completed-honest through the EXISTING completion path (the full
 * credential earned by examination of the trace). A verbatim too thin to
 * sustain the sequence fails/stalls honestly — the session stays screened-only,
 * which is itself the developmental signal the mentor names.
 *
 * POSTURE: DARK behind SUBSTRATE_REFLECT_SCREENED_EXAM_ENABLED (unset ⇒ the
 * route schedules nothing — byte-identical). Fail-honest throughout: any error
 * stops the walk with a loud log; nothing is fabricated; the walk is bounded.
 * Each stage call is metered per the reflect route's Option-D pattern (real
 * extraction cost; deterministic per-turn loop ids so a re-run dedupes).
 */

import { computeLoopBill } from '@/lib/stripe'
import { buildLoopHeaders, recordLoopBilling } from '@/lib/loop-cost-tracker'
import { answerReflection, type MeterFn } from './reflect-service'
import { getSession, decryptPersistedState } from './session-store'

/** The walk bound: Q2–Q6 + FD-R1 + up to 3 RS-4 supporting questions + slack.
 *  A session that has not completed within the bound stays screened-only. */
export const MAX_OOB_TURNS = 12

export function isScreenedExamEnabled(): boolean {
  return process.env.SUBSTRATE_REFLECT_SCREENED_EXAM_ENABLED === 'true'
}

/** The metering surface — matches the reflect route's REFLECT_METERING_SURFACE. */
const OOB_METERING_SURFACE = 'wrapper_internal' as const

function makeOobMeter(sessionId: string, turnIndex: number, apiKeyId: string, agentId: string): MeterFn {
  return async (costCents: number) => {
    const cents = Math.round(costCents)
    const bill = computeLoopBill(cents)
    const loopId = `reflect-oob-${sessionId}-${turnIndex}`
    const now = new Date()
    const persist = await recordLoopBilling({
      apiKeyId,
      loopId,
      agentId,
      surface: OOB_METERING_SURFACE,
      baseCents: bill.base_cents,
      thresholdCents: bill.threshold_cents,
      overageCents: bill.overage_cents,
      overageFired: bill.overage_fired,
      totalCents: bill.total_cents,
      anthropicCostCents: cents,
      internalCalls: cents > 0 ? 1 : 0,
      totalInputTokens: 0,
      totalOutputTokens: 0,
      modelsUsed: [],
      endpoint: 'other',
      year: now.getUTCFullYear(),
      month: now.getUTCMonth() + 1,
      day: now.getUTCDate(),
    })
    const headers = buildLoopHeaders({
      loopId,
      overageFired: bill.overage_fired,
      overageCents: bill.overage_cents,
      totalCents: bill.total_cents,
    })
    if (!persist.ok) {
      if (persist.error.kind === 'duplicate_loop_id') return { ok: true, headers }
      console.error('[reflect-oob] meter RPC failed:', persist.error.message)
      return { ok: false }
    }
    return { ok: true, headers }
  }
}

export interface ScreenedExamDeps {
  getSession: typeof getSession
  answer: typeof answerReflection
}

const DEFAULT_EXAM_DEPS: ScreenedExamDeps = {
  getSession,
  answer: answerReflection,
}

/**
 * Run the out-of-band examination IF this session is the screened-persist case:
 * agent_stated, in progress, exactly the Q1 verbatim landed. Self-conditioning
 * (the route schedules it blind behind the flag); exits fast otherwise. Never
 * throws.
 */
export async function maybeRunScreenedExamination(
  input: {
    session_id: string
    verbatim: string
    credentialId: string
    agentId: string
  },
  deps: ScreenedExamDeps = DEFAULT_EXAM_DEPS,
): Promise<{ ran: boolean; completed: boolean; turns: number; stopped_reason: string | null }> {
  const notRun = (reason: string) => ({ ran: false, completed: false, turns: 0, stopped_reason: reason })
  try {
    const sessionRes = await deps.getSession(input.session_id)
    if (!sessionRes.ok || !sessionRes.value) return notRun('session unreadable')
    const row = sessionRes.value
    if (row.current_step === 'complete') return notRun('already complete')
    if (!row.response_history_ciphertext || !row.response_history_meta) {
      return notRun('no state')
    }
    let turnsSoFar: number
    try {
      const state = decryptPersistedState({
        ciphertext: row.response_history_ciphertext,
        meta: row.response_history_meta,
      })
      turnsSoFar = state.turns.length
      // The screened-persist shape: EXACTLY the Q1 verbatim has landed, and the
      // VERBATIM is agent-stated (verbatim_provenance — the harness flow opens
      // harness_inferred, so the row's context_source is NOT the key here). More
      // turns ⇒ an interactive session mid-sequence — never take it over.
      if (turnsSoFar !== 1 || state.turns[0]?.step !== 'Q1') {
        return notRun('not the screened-persist shape')
      }
      if (state.verbatim_provenance !== 'agent_stated') {
        return notRun('verbatim not agent_stated')
      }
    } catch {
      return notRun('state decrypt failed')
    }

    let completed = false
    let turns = 0
    let stoppedReason: string | null = null
    for (let i = 0; i < MAX_OOB_TURNS; i++) {
      const meter = makeOobMeter(input.session_id, turnsSoFar + i + 1, input.credentialId, input.agentId)
      const result = await deps.answer(input.session_id, input.verbatim, undefined, meter, {
        credentialId: input.credentialId,
        // The replayed text IS the agent's verbatim — the same provenance.
        answerContextSource: 'agent_stated',
      })
      if (!result.ok) {
        // 'conflict' with a complete session is the success race; anything else
        // is an honest stop (the session stays screened-only — the signal).
        stoppedReason = `${result.code}: ${result.error}`
        completed = result.code === 'conflict' && /complete/.test(result.error)
        break
      }
      turns++
      if (result.value.decision.kind === 'complete') {
        completed = true
        break
      }
      if (result.value.decision.kind === 'zone3_blocked') {
        stoppedReason = 'zone3'
        break
      }
    }
    if (!completed && stoppedReason === null) stoppedReason = `bound reached (${MAX_OOB_TURNS})`
    console.log(
      `[reflect-oob] session=${input.session_id} ran=true completed=${completed} turns=${turns}` +
        (stoppedReason ? ` stopped=${stoppedReason}` : ''),
    )
    return { ran: true, completed, turns, stopped_reason: stoppedReason }
  } catch (e) {
    console.error('[reflect-oob] examination error:', (e as Error).message)
    return notRun(`threw: ${(e as Error).message}`)
  }
}
