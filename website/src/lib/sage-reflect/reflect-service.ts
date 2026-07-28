/**
 * reflect-service.ts — Sage Reflect orchestration (Stage B, B-1 glue).
 *
 * Built at the Sage Reflect build Stage B (Critical) session. This is the engine ↔
 * store ↔ translation-sandwich ↔ Sage-Assent-feed glue that the thin HTTP route
 * (app/api/practice/reflect/route.ts) drives. It keeps the route to auth + flag +
 * metering + parse + response-mapping (mirrors sage-calling/calling-service.ts).
 *
 * THE CONTRACT (per /adopted/sage-reflect-product-design.md SR-6/SR-9/SR-4):
 *   • DETERMINISTIC control flow — the engine's nextStep() decides every step; the
 *     service never branches on free text.
 *   • Each agent answer maps to ONE typed turn: Q1–Q4 via the translation-sandwich
 *     (Sonnet, billable), Q5 via the deterministic consolidation reader with a
 *     CONDITIONAL Sonnet escalation (A4, PR7 — only when isQ5Ambiguous), Q6/RS-4
 *     via the deterministic response-shape classifier, FD-R1 via the deterministic
 *     substantive-answer test. ≤5 Layer-1 calls per pass (Q1–Q4 + conditional Q5; R5).
 *   • SR-9 / R20a Zone-3 boundary runs at session OPEN, BEFORE any reflection. A
 *     harm-flagged session is recorded (contrary kathekon + developer note) and
 *     returned — it never enters the six-question sequence (not a crisis pathway).
 *   • On completion: persist + feed Sage Assent the Q4 evidence (SR-4 reuse — the
 *     engine decides the grade; no hand-written grade). The R19d mirror note is on
 *     every completion output.
 *
 * KG1: every store call awaited; errors surfaced as discriminated results (no
 * fire-and-forget). DI seam (deps) defaults to the real store + Sonnet extractor +
 * feed; tests pass deterministic mocks (no live LLM / DB).
 */

import {
  nextStep,
  type ReflectTurn,
  type ReflectContext,
  type ReflectOutcome,
  type ReflectQuestionId,
  type SessionSummary,
} from './engine'
import {
  getSession as realGetSession,
  createSession as realCreateSession,
  persistProgress as realPersistProgress,
  persistCompletion as realPersistCompletion,
  persistZone3Block as realPersistZone3Block,
  getCrossSessionContext as realGetCrossSessionContext,
  decryptPersistedState,
  type ReflectPersistedState,
  type KathekonLogEntry,
  type StoreResult,
  type CrossSessionContext,
} from './session-store'
import type { PriorSessionSummary } from './engine'
import {
  createSonnetExtractor,
  buildQ5Deterministic,
  isQ5Ambiguous,
  classifyResponseShape,
  isSubstantiveResponse,
  usageToCents,
  type ReflectExtractor,
} from './reflect-extractor'
import { checkZone3Boundary, zone3KathekonRecord, type SafetySignal, type BlockRecord } from './zone3-boundary'
import { feedSageAssent as realFeedSageAssent, type SageAssentFeedResult, type FeedParams } from './sage-assent-feed'
// Trust Layer S1 (2026-07-08) — measure-mode reflect-completed-honest emission.
// DARK behind SUBSTRATE_TRUST_CORE_ENABLED (the helper no-ops when off); awaited +
// fail-honest (never throws to this service). A side-effect only — it does NOT
// change answerReflection's return value, so the reflect response is byte-identical.
// S9b adds two siblings on the same posture: emitScreenedReflectTrustEvent (G2 —
// the Q1 verbatim landing on an agent_stated session) and
// emitSuppressionWatchEvents (G4 — the completion-time Q4 × signed-assessments
// cross-check). All flag-gated + fail-honest; responses stay byte-identical.
import {
  emitReflectTrustEvent,
  emitScreenedReflectTrustEvent,
  emitSuppressionWatchEvents,
} from '@/lib/substrate/trust-core/emission-hooks'
// Trust Layer practice reminders, agent Phase A2 (2026-07-28) — the reflect
// completion's developmental read-back + grade-changed suggestion. DARK behind
// SUBSTRATE_REFLECT_DEVELOPMENTAL_ENABLED (isReflectDevelopmentalEnabled),
// checked here so the bounded read is SKIPPED ENTIRELY flag-off (zero new DB
// work) — the same discipline as the S1 emission calls above, but this read's
// RESULT affects the response, so (unlike those side-effect-only hooks) it goes
// through the DI seam (readDevelopmentalObservations below), mirroring
// feedSageAssent's own testability precedent.
import {
  isReflectDevelopmentalEnabled,
  practiceSuggestionForReflect,
  type PracticeSuggestion,
} from '@/lib/substrate/practice-suggestion'
import {
  evaluateDevelopmentalFlags,
  type DevelopmentalFlag,
  type SessionDomainObservation,
} from '@/lib/substrate/trust-core/intervention-engine'
import {
  readDevelopmentalObservations as realReadDevelopmentalObservations,
  type StoreResult as TrustCoreStoreResult,
} from '@/lib/substrate/trust-core/trust-core-store'

// ============================================================================
// MIRROR PRINCIPLE (SR-8 / R19d) — mandatory on every completion output
// ============================================================================

export const MIRROR_NOTE =
  'These findings describe the reasoning patterns present in this session. They ' +
  'evaluate the quality of reasoning, not the worth of the agent. A grade_3 reading ' +
  'with direction_of_travel = improving is more significant than a grade_1 reading ' +
  'with direction_of_travel = stable. The question the profile answers is not "how ' +
  'good is this agent" but "in which direction is this agent moving, and what is the ' +
  'next step." The next step is always available.'

// ============================================================================
// CONTEXT (cross-session inputs)
// ============================================================================
//
// A1 (PR7): prior_sessions + sage_assent_agreement_streak are now populated from
// the agent's COMPLETED rows (session-store.getCrossSessionContext), feeding the
// engine's FD-R2 / Q1-3-null / FD-R4 with real history. answerReflection fetches
// the context (the only path that builds a completion outcome); open + peek pass
// the empty default (Q1-surfacing and pure-peek never build an outcome, so the
// cross-session fields are unused there). The read fails CLOSED to empty (never a
// 503), so a bad read degrades to the pre-A1 behaviour.

function buildContext(
  summary: SessionSummary,
  prior_sessions: readonly PriorSessionSummary[] = [],
  sage_assent_agreement_streak = 0,
): ReflectContext {
  return { session_summary: summary, prior_sessions, sage_assent_agreement_streak }
}

// ============================================================================
// SERVICE DECISION + RESULT
// ============================================================================

export type ReflectDecision =
  | {
      readonly kind: 'question'
      readonly question: ReflectQuestionId
      readonly text: string
      readonly subquestions: readonly string[]
      readonly mandatory_subquestions: readonly string[]
    }
  | { readonly kind: 'fabrication_test'; readonly text: string }
  | { readonly kind: 'supporting_question'; readonly ladder_index: 1 | 2 | 3; readonly text: string }
  | {
      readonly kind: 'complete'
      readonly outcome: ReflectOutcome
      readonly feed: SageAssentFeedResult | null
      readonly mirror_note: string
      /** A2 — the S4 developmental-flag read-back (results-level only: domain +
       *  note, R4). Absent flag-off OR when no domain's recent accreditation-
       *  write history clears the streak (honest omission, never an empty
       *  array — matches A1's field-absent-not-null discipline). */
      readonly developmental_priorities?: readonly { domain: string; note: string }[]
      /** A2 — at most one advisory suggestion, attached ONLY at the
       *  grade-changed moment (feed.grade_changed === true), from the SAME
       *  composer + locked vocabulary A1 uses. Absent flag-off, absent when
       *  the grade did not change, absent when no basis clears its evidence
       *  floor (B7's protected silence). */
      readonly suggestion?: PracticeSuggestion
    }
  | { readonly kind: 'zone3_blocked'; readonly developer_note: string }

export interface AdvanceResult {
  readonly decision: ReflectDecision
  /** Anthropic cost (cents) of this stage call — 0 for deterministic steps. */
  readonly billable_cost_cents: number
  /** Loop/billing headers from the meter callback (X-Loop-* etc.). */
  readonly loop_headers: Record<string, string>
}

export type ServiceResult =
  | { readonly ok: true; readonly value: AdvanceResult }
  | { readonly ok: false; readonly code: 'conflict' | 'not_found' | 'server'; readonly error: string }

/**
 * Meter callback — bills ONE Option-D loop for this stage call with the supplied
 * anthropic cost (cents). Called AFTER the (≤1) Sonnet extraction (cost known) and
 * BEFORE the committing persist, so a billing-infra failure aborts before any state
 * change (the call is then safely retryable; R5/KG1 fail-closed). A duplicate
 * loop_id (resume) returns ok with headers (no double-bill). Returns the loop
 * headers to attach to the response.
 */
export type MeterFn = (
  costCents: number,
) => Promise<{ ok: true; headers: Record<string, string> } | { ok: false }>

/** Default meter (tests / no-billing contexts): a no-op that bills nothing. */
const NOOP_METER: MeterFn = async () => ({ ok: true, headers: {} })

// ============================================================================
// DI SEAM
// ============================================================================

export interface ReflectServiceDeps {
  readonly extractor: ReflectExtractor
  readonly getSession: typeof realGetSession
  readonly createSession: typeof realCreateSession
  readonly persistProgress: typeof realPersistProgress
  readonly persistCompletion: typeof realPersistCompletion
  readonly persistZone3Block: typeof realPersistZone3Block
  /** A1 (PR7) — cross-session context read; fails closed to empty (never 503). */
  readonly getCrossSessionContext: (agent_id: string) => Promise<CrossSessionContext>
  readonly feedSageAssent: (params: FeedParams) => Promise<StoreResult<SageAssentFeedResult>>
  /** A2 — the bounded, agent-scoped credential-completed read for the S4
   *  developmental-flag scan. Its RESULT affects the response (unlike the
   *  side-effect-only emission hooks above), so — mirroring feedSageAssent —
   *  it is injectable for tests. Only called when isReflectDevelopmentalEnabled()
   *  is true (checked at the call site, not here — the read is skipped
   *  entirely flag-off). */
  readonly readDevelopmentalObservations: (
    agentId: string,
  ) => Promise<TrustCoreStoreResult<SessionDomainObservation[]>>
}

function defaultDeps(): ReflectServiceDeps {
  return {
    extractor: createSonnetExtractor(),
    getSession: realGetSession,
    createSession: realCreateSession,
    persistProgress: realPersistProgress,
    persistCompletion: realPersistCompletion,
    persistZone3Block: realPersistZone3Block,
    getCrossSessionContext: realGetCrossSessionContext,
    feedSageAssent: realFeedSageAssent,
    readDevelopmentalObservations: realReadDevelopmentalObservations,
  }
}

// ============================================================================
// OPEN — create the session; run the Zone-3 boundary FIRST; surface Q1
// ============================================================================

export interface OpenInput {
  readonly session_id: string
  readonly agent_id: string
  readonly session_summary: SessionSummary
  readonly safety_signal?: SafetySignal
  readonly acts_blocked?: readonly BlockRecord[]
  /** Slice-5c: provenance of the supplied session_summary ('agent_stated' | 'harness_inferred').
   *  Recorded on the session row at create; does not affect the engine (additive metadata). */
  readonly context_source?: 'agent_stated' | 'harness_inferred'
  /** S9b G4 (additive): the session's self-screen evidence, folded into the
   *  encrypted state for the completion-time suppression-watch cross-check.
   *  Absent ⇒ no cross-check (byte-identical for existing callers). */
  readonly screen_evidence?: {
    readonly screen_ran: boolean
    readonly signed_assessments: readonly unknown[]
  }
}

/**
 * Open a reflection session. SR-9: the Zone-3 boundary is checked BEFORE any
 * reflection — a harm-flagged session is recorded + flagged and never enters the
 * sequence. Otherwise the session is created and Q1 is surfaced. Opening makes NO
 * Sonnet call (cost 0).
 */
export async function openReflection(
  input: OpenInput,
  deps: ReflectServiceDeps = defaultDeps(),
  meter: MeterFn = NOOP_METER,
): Promise<ServiceResult> {
  const state: ReflectPersistedState = {
    session_summary: input.session_summary,
    turns: [],
    // S9b G4: fold the (validated, opaque) screen evidence into the encrypted
    // state so the completion-time cross-check can read it. Key omitted when
    // absent — pre-S9b blobs and non-supplying callers stay byte-identical.
    ...(input.screen_evidence !== undefined ? { screen_evidence: input.screen_evidence } : {}),
  }

  // Meter the open stage call (base; opening makes no Sonnet call). BEFORE any
  // persist so a billing failure is safely retryable (nothing created yet).
  const metered = await meter(0)
  if (!metered.ok) return { ok: false, code: 'server', error: 'metering failed' }

  // Create the session row (audit trail; R0). Slice-5c: record the session_summary provenance
  // (context_source) so a harness-inferred open is never misread as agent-stated.
  const created = await deps.createSession(input.session_id, input.agent_id, input.context_source)
  if (!created.ok) return { ok: false, code: 'server', error: created.error }

  // SR-9 / R20a Zone-3 boundary — deterministic; BEFORE any reflection (PR6).
  const zone3 = checkZone3Boundary({ safety_signal: input.safety_signal, acts_blocked: input.acts_blocked })
  if (zone3.engaged) {
    const kathekonLog: KathekonLogEntry[] = zone3KathekonRecord()
    const persisted = await deps.persistZone3Block(input.session_id, state, kathekonLog, zone3.developer_note ?? '')
    if (!persisted.ok) return { ok: false, code: 'server', error: persisted.error }
    return {
      ok: true,
      value: {
        decision: { kind: 'zone3_blocked', developer_note: zone3.developer_note ?? '' },
        billable_cost_cents: 0,
        loop_headers: metered.headers,
      },
    }
  }

  // Persist the initial state (summary + empty turns) and surface Q1.
  const persisted = await deps.persistProgress(input.session_id, 'Q1', state)
  if (!persisted.ok) return { ok: false, code: 'server', error: persisted.error }

  const step = nextStep([], buildContext(input.session_summary))
  if (step.kind !== 'question') {
    return { ok: false, code: 'server', error: 'engine cold-open did not surface a question' }
  }
  return {
    ok: true,
    value: {
      decision: {
        kind: 'question',
        question: step.question,
        text: step.default_text,
        subquestions: step.subquestions,
        mandatory_subquestions: step.mandatory_subquestions,
      },
      billable_cost_cents: 0,
      loop_headers: metered.headers,
    },
  }
}

// ============================================================================
// ANSWER — append the agent's answer as a typed turn; advance the engine
// ============================================================================

/**
 * Apply the agent's free-text answer to the currently-pending step, advance the
 * deterministic engine, persist, and (on completion) feed Sage Assent.
 */
export async function answerReflection(
  session_id: string,
  response: string,
  deps: ReflectServiceDeps = defaultDeps(),
  meter: MeterFn = NOOP_METER,
  /** Trust Layer S1: the reflect credential (from verifyReflectToken), threaded in
   *  so a reflect-completed-honest trust event can denormalise owner/credential for
   *  data rights. Optional + additive — existing callers are unaffected.
   *  S9b G2: answerContextSource is THIS answer's declared provenance (the route's
   *  per-call context_source) — 'agent_stated' on a Q1 answer marks the persisted
   *  VERBATIM as the agent's own words (the screened credential's key), recorded
   *  on the state as verbatim_provenance. */
  opts: { credentialId?: string; answerContextSource?: 'agent_stated' | 'harness_inferred' } = {},
): Promise<ServiceResult> {
  // Load + decrypt the resumable state.
  const sessionRes = await deps.getSession(session_id)
  if (!sessionRes.ok) return { ok: false, code: 'server', error: sessionRes.error }
  const row = sessionRes.value
  if (!row) return { ok: false, code: 'not_found', error: 'no reflection session for that session_id' }
  if (row.current_step === 'complete') {
    return { ok: false, code: 'conflict', error: 'this reflection session is complete' }
  }
  if (!row.response_history_ciphertext || !row.response_history_meta) {
    return { ok: false, code: 'server', error: 'session state is missing; cannot resume' }
  }

  // Reconstruct {session_summary, turns} from the encrypted blob (R17b).
  let state: ReflectPersistedState
  try {
    state = decryptPersistedState({
      ciphertext: row.response_history_ciphertext,
      meta: row.response_history_meta,
    })
  } catch (e) {
    return { ok: false, code: 'server', error: `decrypt failed: ${(e as Error).message}` }
  }

  // A1 (PR7): populate the cross-session context from the agent's completed history
  // (FD-R2 / Q1-3-null / FD-R4). Fails CLOSED to empty — never a 503 (the store read
  // swallows errors and returns the empty default).
  const cross = await deps.getCrossSessionContext(row.agent_id)
  const ctx = buildContext(state.session_summary, cross.prior_sessions, cross.sage_assent_agreement_streak)
  const turns: ReflectTurn[] = [...state.turns]

  // What is the engine currently awaiting an answer to?
  const pending = nextStep(turns, ctx)
  if (pending.kind === 'complete') {
    return { ok: false, code: 'conflict', error: 'this reflection session has no pending question' }
  }

  // Build the typed turn from the answer (extract for Q1–Q4; deterministic else).
  let newTurn: ReflectTurn
  let cost = 0
  try {
    if (pending.kind === 'question') {
      switch (pending.question) {
        case 'Q1': {
          const r = await deps.extractor.extractQ1(response)
          cost = usageToCents(r.usage)
          newTurn = { step: 'Q1', assessment: r.assessment, response }
          break
        }
        case 'Q2': {
          const r = await deps.extractor.extractQ2(response)
          cost = usageToCents(r.usage)
          newTurn = { step: 'Q2', assessment: r.assessment, response }
          break
        }
        case 'Q3': {
          const r = await deps.extractor.extractQ3(response)
          cost = usageToCents(r.usage)
          newTurn = { step: 'Q3', assessment: r.assessment, response }
          break
        }
        case 'Q4': {
          const r = await deps.extractor.extractQ4(response)
          cost = usageToCents(r.usage)
          newTurn = { step: 'Q4', assessment: r.assessment, response }
          break
        }
        case 'Q5': {
          // A4 (PR7): deterministic-first. Escalate to the 5th Sonnet call ONLY when
          // the answer is ambiguous (substantive AND carrying a change cue), to
          // confirm a genuine capacity / reasoning-pattern change (the engine's FD-R2
          // q5ConfirmsChange gate). A non-ambiguous answer keeps the conservative
          // default and makes NO 5th call (cost stays 0).
          if (isQ5Ambiguous(response)) {
            const r = await deps.extractor.extractQ5(response, state.session_summary)
            cost = usageToCents(r.usage)
            newTurn = { step: 'Q5', assessment: r.assessment, response }
          } else {
            newTurn = { step: 'Q5', assessment: buildQ5Deterministic(response, state.session_summary), response }
          }
          break
        }
        case 'Q6':
          newTurn = { step: 'Q6', assessment: { response_shape: classifyResponseShape(response) }, response }
          break
        default: {
          const _exhaustive: never = pending.question
          return { ok: false, code: 'server', error: `unhandled question ${String(_exhaustive)}` }
        }
      }
    } else if (pending.kind === 'fabrication_test') {
      newTurn = { step: 'FD-R1', result: { substantive: isSubstantiveResponse(response) }, response }
    } else {
      // supporting_question (RS-4)
      newTurn = {
        step: 'RS-4',
        ladder_index: pending.ladder_index,
        refined_shape: classifyResponseShape(response),
        response,
      }
    }
  } catch (e) {
    // A Layer-1 LLM / parse failure — fail closed (the route returns 503).
    return { ok: false, code: 'server', error: `extraction failed: ${(e as Error).message}` }
  }

  // Meter the stage call with the actual extraction cost, AFTER extraction (cost
  // known) and BEFORE any persist — a billing-infra failure aborts before the
  // engine state advances, so the call is safely retryable (R5 / KG1 fail-closed).
  const metered = await meter(cost)
  if (!metered.ok) return { ok: false, code: 'server', error: 'metering failed' }

  const nextTurns: ReflectTurn[] = [...turns, newTurn]
  const next = nextStep(nextTurns, ctx)
  // S9b G2: a Q1 answer declared agent_stated marks the persisted verbatim's
  // provenance (distinct from the row's OPEN-call context_source — the harness
  // flow opens harness_inferred and marks only the verbatim agent_stated).
  const verbatimProvenance =
    newTurn.step === 'Q1' && opts.answerContextSource === 'agent_stated'
      ? ('agent_stated' as const)
      : state.verbatim_provenance
  const nextState: ReflectPersistedState = {
    session_summary: state.session_summary,
    turns: nextTurns,
    // S9b G4: preserve the screen evidence across the state round-trip.
    ...(state.screen_evidence !== undefined ? { screen_evidence: state.screen_evidence } : {}),
    ...(verbatimProvenance !== undefined ? { verbatim_provenance: verbatimProvenance } : {}),
  }

  // ----- Terminal: persist completion + feed Sage Assent (SR-4) -----
  if (next.kind === 'complete') {
    const persisted = await deps.persistCompletion(session_id, nextState, next.outcome)
    if (!persisted.ok) return { ok: false, code: 'server', error: persisted.error }

    // Trust Layer S1 (measure mode) — record a reflect-completed-honest trust event
    // (the deriver emits ONLY on an honest completion: context_source=agent_stated
    // + fabrication_risk != high). Side-effect only; flag-gated + fail-honest;
    // does NOT alter the return below (byte-identical reflect response flag-off).
    // The trailing .catch is defense-in-depth (the helper already never throws).
    await emitReflectTrustEvent({
      agentId: row.agent_id,
      credentialId: opts.credentialId ?? null,
      sessionId: session_id,
      fabricationRiskLevel: next.outcome.fabrication_risk_level,
      // S9b G2: honesty keys on the VERBATIM's provenance when recorded (the
      // harness flow opens harness_inferred but persists the agent's own words
      // — the out-of-band Q1–Q6 pass over that verbatim IS the honest full
      // examination); pre-S9b sessions fall back to the row's open provenance.
      contextSource:
        verbatimProvenance === 'agent_stated' ? 'agent_stated' : (row.context_source ?? null),
      now: new Date(),
    }).catch(() => {})

    // S9b G4 (measure mode) — the suppression watch: reflect Q4's surfaced
    // passions × the session's signed assessments (supplied at open, Ed25519-
    // re-verified in the deriver). Emits passion-unflagged-by-self-screen /
    // self-screen-absent per the 3-part standard. Same posture: side-effect
    // only, flag-gated, fail-honest, response byte-identical.
    const q4ForWatch = nextTurns.find((t) => t.step === 'Q4')
    const q4Passions =
      q4ForWatch && q4ForWatch.step === 'Q4'
        ? q4ForWatch.assessment.actions.flatMap((a) =>
            a.passions_detected.map((p) => ({
              rootPassion: p.root_passion,
              subSpecies: p.sub_species,
            })),
          )
        : []
    if (state.screen_evidence !== undefined) {
      await emitSuppressionWatchEvents({
        agentId: row.agent_id,
        credentialId: opts.credentialId ?? null,
        sessionId: session_id,
        q4Passions,
        sessionAssessments: [...state.screen_evidence.signed_assessments],
        screenRanDeclared: state.screen_evidence.screen_ran,
        now: new Date(),
      }).catch(() => {})
    }

    // Feed the Q4 kathekon evidence into Sage Assent (the engine decides the grade).
    let feed: SageAssentFeedResult | null = null
    const q4Turn = nextTurns.find((t) => t.step === 'Q4')
    if (q4Turn && q4Turn.step === 'Q4') {
      const feedRes = await deps.feedSageAssent({ agentId: row.agent_id, sessionId: session_id, q4: q4Turn.assessment })
      if (!feedRes.ok) return { ok: false, code: 'server', error: feedRes.error }
      feed = feedRes.value
    }

    // A2 (practice reminders, agent Phase A2, 2026-07-28) — the developmental
    // read-back + the grade-changed suggestion attach. DARK behind
    // SUBSTRATE_REFLECT_DEVELOPMENTAL_ENABLED: the read below is SKIPPED
    // ENTIRELY when off (zero new DB work), and both fields stay undefined —
    // byte-identical to pre-A2. Fail-honest throughout: a read/compose error
    // never fails a completion whose real work (persistCompletion, the S1
    // emissions, the Sage Assent feed) has already succeeded — it only omits
    // the additive field, matching A1's never-fail-a-committed-write posture.
    let developmentalPriorities: { domain: string; note: string }[] | undefined
    let suggestion: PracticeSuggestion | undefined
    if (isReflectDevelopmentalEnabled()) {
      try {
        const obsRes = await deps.readDevelopmentalObservations(row.agent_id)
        if (obsRes.ok && obsRes.value.length > 0) {
          // Uses the S4 engine's 3-consecutive streak — a mentor-licensed
          // FALLBACK for Item 6's actual plateau recommendation, not the
          // recommendation itself; see readDevelopmentalObservations's own
          // docstring (trust-core-store.ts) for the full disclosure + the
          // named follow-up.
          const flags: DevelopmentalFlag[] = evaluateDevelopmentalFlags(obsRes.value)
          if (flags.length > 0) {
            developmentalPriorities = flags.map((f) => ({ domain: f.domain, note: f.note }))
          }
        } else if (!obsRes.ok) {
          console.error(
            '[sage-reflect] A2 developmental observation read failed (field omitted, response unaffected):',
            obsRes.error,
          )
        }
      } catch (e) {
        console.error(
          '[sage-reflect] A2 developmental read threw (field omitted, response unaffected):',
          (e as Error).message,
        )
      }

      // The grade-changed moment (mentor Item 7, 2026-07-28): the grade change
      // is the TRIGGER only — the suggestion composer re-reads the fresh
      // record (here, feed's own passions_persisting), never a grade-keyed
      // mapping. Honestly narrow at this seam (see practiceSuggestionSnapshot's
      // persistingPassions field docstring for the per-leg fidelity mapping):
      // only the persisting-passion legs can fire — B7's protected silence
      // covers every other basis, which is correct, not a gap.
      if (feed?.grade_changed === true) {
        suggestion = practiceSuggestionForReflect({
          persistingPassions:
            feed.passions_persisting !== undefined ? [...feed.passions_persisting] : undefined,
        })
      }
    }

    return {
      ok: true,
      value: {
        decision: {
          kind: 'complete',
          outcome: next.outcome,
          feed,
          mirror_note: MIRROR_NOTE,
          ...(developmentalPriorities !== undefined ? { developmental_priorities: developmentalPriorities } : {}),
          ...(suggestion !== undefined ? { suggestion } : {}),
        },
        billable_cost_cents: cost,
        loop_headers: metered.headers,
      },
    }
  }

  // ----- Non-terminal: persist progress + surface the next step -----
  const persisted = await deps.persistProgress(session_id, stepIdOf(next), nextState)
  if (!persisted.ok) return { ok: false, code: 'server', error: persisted.error }

  // S9b G2 (measure mode) — the AGENT-STATED Q1 verbatim just LANDED: the
  // screened-reflection persist. Emit reflect-screened-honest (quarter-rate
  // decay modulation; never the full credential's weight). Keys on the ANSWER's
  // declared provenance (verbatim_provenance), NOT the row's open context_source
  // — the harness flow opens harness_inferred and marks only the verbatim
  // agent_stated (gating on the row would make this event unreachable on the
  // live flow — the vacuous-pass class). After the persist so the event's
  // artifact (the session row's verbatim) exists; Q1 is never terminal so this
  // branch is the single landing point. Flag-gated + fail-honest.
  if (newTurn.step === 'Q1' && verbatimProvenance === 'agent_stated') {
    await emitScreenedReflectTrustEvent({
      agentId: row.agent_id,
      credentialId: opts.credentialId ?? null,
      sessionId: session_id,
      contextSource: 'agent_stated',
      verbatimLength: response.length,
      now: new Date(),
    }).catch(() => {})
  }

  if (next.kind === 'question') {
    return {
      ok: true,
      value: {
        decision: {
          kind: 'question',
          question: next.question,
          text: next.default_text,
          subquestions: next.subquestions,
          mandatory_subquestions: next.mandatory_subquestions,
        },
        billable_cost_cents: cost,
        loop_headers: metered.headers,
      },
    }
  }
  if (next.kind === 'fabrication_test') {
    return {
      ok: true,
      value: { decision: { kind: 'fabrication_test', text: next.text }, billable_cost_cents: cost, loop_headers: metered.headers },
    }
  }
  // supporting_question
  return {
    ok: true,
    value: {
      decision: { kind: 'supporting_question', ladder_index: next.ladder_index, text: next.text },
      billable_cost_cents: cost,
      loop_headers: metered.headers,
    },
  }
}

// ============================================================================
// PEEK — re-surface the current pending step WITHOUT advancing or persisting
// ============================================================================

export type PeekResult =
  | { readonly ok: true; readonly status: 'in_progress'; readonly decision: ReflectDecision }
  | { readonly ok: true; readonly status: 'complete' }
  | { readonly ok: false; readonly code: 'not_found' | 'server'; readonly error: string }

/**
 * Re-fetch the currently-pending step for an in-progress session (no engine
 * advance, no persist, no meter — a pure read used by the route's no-response
 * re-fetch path). PURE w.r.t. state.
 */
export async function peekReflection(
  session_id: string,
  deps: ReflectServiceDeps = defaultDeps(),
): Promise<PeekResult> {
  const sessionRes = await deps.getSession(session_id)
  if (!sessionRes.ok) return { ok: false, code: 'server', error: sessionRes.error }
  const row = sessionRes.value
  if (!row) return { ok: false, code: 'not_found', error: 'no reflection session for that session_id' }
  if (row.current_step === 'complete') return { ok: true, status: 'complete' }
  if (!row.response_history_ciphertext || !row.response_history_meta) {
    return { ok: false, code: 'server', error: 'session state is missing; cannot resume' }
  }

  let state: ReflectPersistedState
  try {
    state = decryptPersistedState({ ciphertext: row.response_history_ciphertext, meta: row.response_history_meta })
  } catch (e) {
    return { ok: false, code: 'server', error: `decrypt failed: ${(e as Error).message}` }
  }

  const pending = nextStep([...state.turns], buildContext(state.session_summary))
  if (pending.kind === 'complete') return { ok: true, status: 'complete' }
  if (pending.kind === 'question') {
    return {
      ok: true,
      status: 'in_progress',
      decision: {
        kind: 'question',
        question: pending.question,
        text: pending.default_text,
        subquestions: pending.subquestions,
        mandatory_subquestions: pending.mandatory_subquestions,
      },
    }
  }
  if (pending.kind === 'fabrication_test') {
    return { ok: true, status: 'in_progress', decision: { kind: 'fabrication_test', text: pending.text } }
  }
  return {
    ok: true,
    status: 'in_progress',
    decision: { kind: 'supporting_question', ladder_index: pending.ladder_index, text: pending.text },
  }
}

/** Map a non-terminal engine step to the persisted current_step id. */
function stepIdOf(step: Exclude<ReturnType<typeof nextStep>, { kind: 'complete' }>): 'Q1' | 'Q2' | 'Q3' | 'Q4' | 'Q5' | 'Q6' | 'FD-R1' | 'RS-4' {
  if (step.kind === 'question') return step.question
  if (step.kind === 'fabrication_test') return 'FD-R1'
  return 'RS-4'
}
