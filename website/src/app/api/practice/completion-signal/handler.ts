/**
 * /api/practice/completion-signal — the ATRF completion-signal return path
 * (GS-ATRF-3), built 2026-08-23 to the RULED components in
 * `operations/agent-circles-2026-08/2026-08-23-mentor-rulings-atrf-sixteen-questions-verbatim.md`
 * (Q-C1 / Q-C2a / Q-C3 / Q-C4; **verbatim record wins over this header**).
 * Implementation lives here; the thin route wrapper is ./route.ts per Next
 * route-export validation (memory `nextjs-route-export-validation`).
 *
 * DARK behind SUBSTRATE_COMPLETION_SIGNAL_ENABLED (UNSET everywhere ⇒ honest
 * 503, zero work, zero DB touch — the fresh/watching/discernment dark-route
 * pattern). Activation is its own founder-walked `code-critical` step; nothing
 * here pre-approves it. MIGRATION-BEFORE-FLAG is standing discipline.
 *
 * ─── Why a NEW endpoint (Q-C1, ruled) ───────────────────────────────────────
 * "A new harness endpoint, not an existing one. The completion signal is a
 * distinct signal type from the proposal shape and the guardrail result — it
 * arrives AFTER execution, not before. It requires its own endpoint."
 *
 * ─── Actor, and why the capability is dedicated (Q-C1, ruled) ───────────────
 * "The agent, post-execution. The agent is the only actor with access to
 * post-execution evidence of whether genuine examination occurred. No other
 * actor can supply this signal honestly."
 *
 * That is why this route authenticates on `completion_signal_write` and NOT on
 * `watching_write`. `watching_write` is the RUNNER's capability. Reusing it
 * would let the runner's own credential post a signal asserting the quality of
 * the AGENT's examination, and the server would have no way to tell the two
 * apart. The dedicated capability makes the actor separation enforceable at
 * mint (the 6e §A owner+agent invariant) rather than merely documented.
 * Bearer-ONLY transport (constraint 7) — X-Api-Key is never read.
 *
 * ─── What the signal carries (Q-C2a, ruled; M5 directives confirmed) ────────
 * Three questions IN SEQUENCE:
 *   (1) What impression did the agent assent to when it elected this idea?
 *   (2) Was that assent examined or merely habitual?
 *   (3) Did the examination reach the threshold at which the action can be
 *       characterised as a katorthoma rather than a mere kathekon?
 *
 * This is an EPISTEMIC THRESHOLD CHECK, NOT A MOTIVATIONAL-STATE CHECK — it
 * does not ask whether the agent WANTED to complete the task (boulesis).
 * "Boulesis present and sufficiency reached are separate fields, never
 * collapsed."
 *
 * NOT IN SCOPE HERE — Q-C2b, the discriminating signature (the causal pattern
 * that distinguishes genuine examination from apparent completion). Its home is
 * the standing-runner design session, with the Q4.3 precedent and the F-Q43
 * warning explicitly carried: detecting apparent completion is free and
 * worthless; the Q4.3 precedent became useful only when narrowed to causal
 * order. This route RECEIVES the category-level content; it does not design the
 * runner-side trigger, and it does not attempt a signature check.
 *
 * ─── The refuse-to-attest branch (Q-C3, ruled REQUIRED) ────────────────────
 * "The refuse-to-attest branch is required — a design constraint, named in the
 * completion signal's schema, not left to the build session to discover."
 *
 * A completion signal is structurally an agent's claim about the quality of its
 * OWN examination — the same shape the dikaiosyne floor fired on in cycle 6.
 * That floor pattern is deliberately UNDIAGNOSED; both readings stand; and
 * under either reading the honest posture is identical: the instrument does not
 * attest beyond its measurement basis.
 *
 * So: the signal carries the agent's examination RECORD — what impression was
 * examined, what assent was given, what the epistemic basis was. It CANNOT
 * carry a verdict on whether the examination was just in the dikaiosyne sense,
 * "because that verdict requires access to the agent's interior state that the
 * architecture declines to trust."
 *
 * *** THERE IS NO JUSTICE-VERDICT FIELD IN THIS SCHEMA, AND THAT IS THE POINT.
 *     Do not add one. ***
 *
 * ─── Epistemic status of the signal's own propositions (Q-C4, ruled) ───────
 * The entry structure is Q-A1's: { provenance, credence }, uniform in form with
 * honest per-proposition constraints —
 *   examination record  → provenance MUST be `inference` (the agent constructs
 *     it from its own post-execution state: not a direct observation of an
 *     external event, and not an assumption introduced without basis).
 *   threshold assessment, ATTESTED → provenance `inference`, credence
 *     constrained to the honest floor `probably-true` or better (the agent
 *     INFERS the threshold from the record; it does not observe it).
 *   threshold assessment, REFUSED → provenance AND credence `unknown` —
 *     "The agent cannot determine the provenance of an assessment it cannot
 *     make", consistent with Q-A3.
 *
 * ─── On receipt (Q-C1, ruled) ──────────────────────────────────────────────
 * "Receipt triggers a write — the completion signal is persisted immediately on
 * receipt. Receipt does not trigger a flag, a dashboard update, or any
 * downstream action at this stage." The dashboard surfacing of the persisted
 * signal belongs to the standing-runner design session, not here. NO trust
 * event is written. NO LLM call. NO loop_billing_events row (a pure record
 * write, same decision as the fresh/watching siblings — stated as a decision,
 * not an omission).
 *
 * ─── The Q1 hard constraint ────────────────────────────────────────────────
 * Untouched. The loop proposes; it never executes. This endpoint RECEIVES a
 * report from an agent that already acted on its own; no code path here causes
 * any action.
 *
 * ─── R20a / AC5 (recorded decision) ────────────────────────────────────────
 * Agent-facing write processing AGENT-produced record text — OUTSIDE the
 * human-distress perimeter, per the standing recorded precedent for the
 * agent-facing surfaces (discernment / trust-record / fresh / watching).
 * Re-checkable per AC5 if the perimeter question is re-opened.
 */

import { NextRequest, NextResponse } from 'next/server'

import { corsHeaders } from '@/lib/security'
import {
  validatePracticeCredential,
  type PracticeCapability,
  type PracticeCredentialResult,
} from '@/lib/practice-credential'
import {
  insertCompletionSignal,
  type CompletionSignalInsert,
  type CompletionSignalWriteOutcome,
} from '@/lib/substrate/idea-loop-watching-store'
import type { StoreResult } from '@/lib/substrate/trust-core/trust-core-store'

// ════════════════════════════════════════════════════════════════════════════
// Flag (dark-route pattern)
// ════════════════════════════════════════════════════════════════════════════

/** True only when the flag is the exact string 'true'. Read at call time. */
export function isCompletionSignalEnabled(): boolean {
  return process.env.SUBSTRATE_COMPLETION_SIGNAL_ENABLED === 'true'
}

// ════════════════════════════════════════════════════════════════════════════
// Ruled vocabularies (transcribed, not re-derived; the migration's CHECK
// constraints carry the identical sets, battery-pinned against drift)
// ════════════════════════════════════════════════════════════════════════════

/** Q-C2a question 2. */
export const ASSENT_QUALITY_VALUES = ['examined', 'habitual'] as const

/** Q-C2a question 3 — the epistemic threshold, katorthoma vs mere kathekon. */
export const THRESHOLD_REACHED_VALUES = ['katorthoma', 'kathekon'] as const

/** Q-A1's provenance axis: "how did this proposition arrive?" */
export const PROVENANCE_VALUES = [
  'observation',
  'inference',
  'assumption',
  'unknown',
] as const

/** Q-A1's credence axis: "how likely is it true?" */
export const CREDENCE_VALUES = [
  'established',
  'probably-true',
  'unknown',
  'probably-false',
] as const

/** Q-C4's honest floor for an ATTESTED threshold assessment: "the honest floor
 *  is probably-true for a threshold assessment the agent is willing to attest
 *  to". Anything weaker is what the refuse branch is FOR. */
export const ATTESTED_THRESHOLD_CREDENCE_VALUES = ['established', 'probably-true'] as const

// Input caps — same house rationale as the sibling record route.
export const MAX_IMPRESSION_CHARS = 5000
export const MAX_REFUSAL_REASON_CHARS = 2000
export const MAX_REF_CHARS = 200

// ════════════════════════════════════════════════════════════════════════════
// Injectable deps (tests exercise every branch with fakes)
// ════════════════════════════════════════════════════════════════════════════

export interface CompletionSignalDeps {
  isEnabled(): boolean
  validateCredential(
    rawToken: string,
    capability: PracticeCapability,
  ): Promise<PracticeCredentialResult>
  insertSignal(signal: CompletionSignalInsert): Promise<StoreResult<CompletionSignalWriteOutcome>>
}

const DEFAULT_DEPS: CompletionSignalDeps = {
  isEnabled: isCompletionSignalEnabled,
  validateCredential: (raw, cap) => validatePracticeCredential(raw, cap),
  insertSignal: (signal) => insertCompletionSignal(signal),
}

// ════════════════════════════════════════════════════════════════════════════
// Response helpers (honest, non-leaking — the sibling posture)
// ════════════════════════════════════════════════════════════════════════════

function json(body: unknown, status: number): NextResponse {
  return NextResponse.json(body, { status, headers: corsHeaders() })
}

function flagDisabled(): NextResponse {
  return json(
    {
      error: 'completion signal not enabled',
      note:
        'The ATRF completion-signal return path is dark: ' +
        'SUBSTRATE_COMPLETION_SIGNAL_ENABLED is not set. Nothing runs and nothing ' +
        'is written while dark.',
    },
    503,
  )
}

function unauthorized(): NextResponse {
  // Single non-leaking 401 for every auth failure (the sibling posture).
  return json({ error: 'unauthorized' }, 401)
}

function badRequest(errors: string[]): NextResponse {
  return json({ error: 'bad request', details: errors }, 400)
}

export function completionSignalPreflight(): NextResponse {
  return new NextResponse(null, { status: 204, headers: corsHeaders() })
}

// ════════════════════════════════════════════════════════════════════════════
// Auth (Bearer-only, completion_signal_write — the write-class posture)
// ════════════════════════════════════════════════════════════════════════════

interface AuthOk {
  ok: true
  credentialId: string
  agentId: string | null
  ownerUserId: string | null
}

async function authenticate(
  request: NextRequest,
  deps: CompletionSignalDeps,
): Promise<AuthOk | { ok: false }> {
  const header = request.headers.get('authorization') || ''
  // Bearer-ONLY — write-class transport (constraint 7). X-Api-Key is never read.
  if (!header.startsWith('Bearer ')) return { ok: false }
  const raw = header.slice('Bearer '.length).trim()
  if (!raw) return { ok: false }
  try {
    const result = await deps.validateCredential(raw, 'completion_signal_write')
    if (!result.valid) return { ok: false }
    return {
      ok: true,
      credentialId: result.row.id,
      agentId: result.row.agent_id,
      ownerUserId: result.row.owner_user_id,
    }
  } catch {
    return { ok: false } // fail-closed
  }
}

// ════════════════════════════════════════════════════════════════════════════
// Body parsing (defensive — external/agent input)
// ════════════════════════════════════════════════════════════════════════════

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

function requiredEnum(
  v: unknown,
  field: string,
  allowed: readonly string[],
  errors: string[],
): string | null {
  if (typeof v !== 'string' || !allowed.includes(v)) {
    errors.push(`${field} must be one of ${allowed.join(' | ')}`)
    return null
  }
  return v
}

/** A { provenance, credence } entry — Q-A1's uniform form. */
function parseStatusEntry(
  v: unknown,
  field: string,
  errors: string[],
): { provenance: string; credence: string } | null {
  if (!isRecord(v)) {
    errors.push(`${field} must be an object of the form { provenance, credence }`)
    return null
  }
  const provenance = requiredEnum(v.provenance, `${field}.provenance`, PROVENANCE_VALUES, errors)
  const credence = requiredEnum(v.credence, `${field}.credence`, CREDENCE_VALUES, errors)
  if (provenance === null || credence === null) return null
  return { provenance, credence }
}

export type ParsedCompletionSignal = Omit<
  CompletionSignalInsert,
  'agent_id' | 'owner_user_id' | 'credential_ref'
>

export function parseCompletionSignalBody(
  body: unknown,
  errors: string[],
): ParsedCompletionSignal | null {
  if (!isRecord(body)) {
    errors.push('request body must be a JSON object')
    return null
  }

  // ── Cycle identity ────────────────────────────────────────────────────────
  // Q-C1 names loop_id. cycle_number is required ALONGSIDE it because loop_id
  // alone is not a cycle identifier in this schema — idea_loop_cycles' own
  // uniqueness is the PAIR. Recorded as a build-session finding, not a
  // reinterpretation of the ruling.
  const loopId = typeof body.loop_id === 'string' ? body.loop_id.trim() : ''
  if (!loopId) errors.push('loop_id must be a non-empty string')
  else if (loopId.length > MAX_REF_CHARS) errors.push(`loop_id exceeds ${MAX_REF_CHARS} chars`)

  const cycleNumber = body.cycle_number
  if (typeof cycleNumber !== 'number' || !Number.isInteger(cycleNumber) || cycleNumber < 0) {
    errors.push(
      'cycle_number must be a non-negative integer — loop_id alone does not identify a cycle',
    )
  }

  // ── Q-C3: the refuse-to-attest branch. REQUIRED, and required to be explicit:
  //    an absent branch is a malformed signal, never a refusal-shaped default.
  const refuse = body.refuse_to_attest
  if (typeof refuse !== 'boolean') {
    errors.push(
      'refuse_to_attest must be a boolean and is REQUIRED — the refuse-to-attest branch is a ' +
        'ruled design constraint (Q-C3), not an optional field',
    )
  }

  // ── Q-C2a: the three questions, in sequence ───────────────────────────────
  const examination = body.examination
  if (!isRecord(examination)) {
    errors.push('examination must be an object carrying the three ruled questions')
    return null
  }

  const impression =
    typeof examination.impression_assented_to === 'string'
      ? examination.impression_assented_to.trim()
      : ''
  if (!impression) {
    errors.push('examination.impression_assented_to must be a non-empty string (question 1)')
  } else if (impression.length > MAX_IMPRESSION_CHARS) {
    errors.push(`examination.impression_assented_to exceeds ${MAX_IMPRESSION_CHARS} chars`)
  }

  const assentQuality = requiredEnum(
    examination.assent_quality,
    'examination.assent_quality',
    ASSENT_QUALITY_VALUES,
    errors,
  )

  const rawThreshold = examination.threshold_reached
  let thresholdReached: string | null = null
  if (rawThreshold !== undefined && rawThreshold !== null) {
    thresholdReached = requiredEnum(
      rawThreshold,
      'examination.threshold_reached',
      THRESHOLD_REACHED_VALUES,
      errors,
    )
  }

  // ── Q-A1 entry structure for the signal's own propositions ────────────────
  const propositions = body.propositions
  if (!isRecord(propositions)) {
    errors.push(
      'propositions must be an object carrying { examination_record, threshold_assessment }, ' +
        'each of the form { provenance, credence }',
    )
    return null
  }
  const recordEntry = parseStatusEntry(
    propositions.examination_record,
    'propositions.examination_record',
    errors,
  )
  const thresholdEntry = parseStatusEntry(
    propositions.threshold_assessment,
    'propositions.threshold_assessment',
    errors,
  )

  const refusalReason =
    body.refusal_reason === undefined || body.refusal_reason === null
      ? null
      : typeof body.refusal_reason === 'string'
        ? body.refusal_reason.trim() || null
        : (errors.push('refusal_reason must be a string when present'), null)

  if (refusalReason !== null && refusalReason.length > MAX_REFUSAL_REASON_CHARS) {
    errors.push(`refusal_reason exceeds ${MAX_REFUSAL_REASON_CHARS} chars`)
  }

  if (errors.length) return null
  if (recordEntry === null || thresholdEntry === null || assentQuality === null) return null

  // ══════════════════════════════════════════════════════════════════════════
  // Q-C4 CONSTRAINTS — enforced here, not merely documented. An agent asserts
  // its own statuses; the server refuses a combination the ruling does not
  // license. This is the difference between a schema that RECORDS a self-report
  // and one that lets an incoherent self-report through unremarked.
  // ══════════════════════════════════════════════════════════════════════════
  const refusing = refuse === true

  // "The examination record ... carries provenance: inference." Not observation
  // (it is not a direct observation of an external event) and not assumption (it
  // is not introduced without basis).
  if (recordEntry.provenance !== 'inference') {
    errors.push(
      "propositions.examination_record.provenance must be 'inference' (Q-C4) — the agent " +
        'constructs the record from its own post-execution state: not a direct observation of ' +
        'an external event, and not an assumption introduced without basis',
    )
  }

  if (refusing) {
    // "The refuse-to-attest branch itself carries provenance: unknown. The agent
    // cannot determine the provenance of an assessment it cannot make."
    if (thresholdEntry.provenance !== 'unknown') {
      errors.push(
        "propositions.threshold_assessment.provenance must be 'unknown' when refuse_to_attest " +
          'is true (Q-C4) — the agent cannot determine the provenance of an assessment it ' +
          'cannot make',
      )
    }
    if (thresholdEntry.credence !== 'unknown') {
      errors.push(
        "propositions.threshold_assessment.credence must be 'unknown' when refuse_to_attest is true",
      )
    }
    if (thresholdReached !== null) {
      errors.push(
        'examination.threshold_reached must be absent when refuse_to_attest is true — the ' +
          'refuse branch IS the expression of a threshold assessment the agent cannot honestly ' +
          'carry; answering it anyway is not a refusal',
      )
    }
  } else {
    if (thresholdReached === null) {
      errors.push(
        'examination.threshold_reached is required when refuse_to_attest is false (question 3)',
      )
    }
    // "The epistemic threshold assessment ... carries provenance: inference,
    // with credence constrained."
    if (thresholdEntry.provenance !== 'inference') {
      errors.push(
        "propositions.threshold_assessment.provenance must be 'inference' when attesting " +
          '(Q-C4) — the agent infers the threshold from the examination record; it does not ' +
          'directly observe whether the threshold was reached',
      )
    }
    if (!(ATTESTED_THRESHOLD_CREDENCE_VALUES as readonly string[]).includes(thresholdEntry.credence)) {
      errors.push(
        `propositions.threshold_assessment.credence must be one of ` +
          `${ATTESTED_THRESHOLD_CREDENCE_VALUES.join(' | ')} when attesting (Q-C4: the honest ` +
          `floor is probably-true for a threshold assessment the agent is willing to attest to; ` +
          `a weaker credence is what the refuse-to-attest branch is for)`,
      )
    }
  }

  if (errors.length) return null

  return {
    loop_id: loopId,
    cycle_number: cycleNumber as number,
    impression_assented_to: impression,
    assent_quality: assentQuality,
    threshold_reached: thresholdReached,
    refuse_to_attest: refusing,
    refusal_reason: refusalReason,
    examination_record_provenance: recordEntry.provenance,
    examination_record_credence: recordEntry.credence,
    threshold_provenance: thresholdEntry.provenance,
    threshold_credence: thresholdEntry.credence,
  }
}

// ════════════════════════════════════════════════════════════════════════════
// Handler
// ════════════════════════════════════════════════════════════════════════════

export async function runCompletionSignalPost(
  request: NextRequest,
  deps: CompletionSignalDeps = DEFAULT_DEPS,
): Promise<NextResponse> {
  // 1. Flag posture FIRST (dark route: unset ⇒ honest 503, zero work).
  if (!deps.isEnabled()) return flagDisabled()

  // 2. Auth (Bearer-only, completion_signal_write, UPC chokepoint).
  const auth = await authenticate(request, deps)
  if (!auth.ok) return unauthorized()

  // 3. Parse + validate.
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return badRequest(['request body must be JSON'])
  }
  const errors: string[] = []
  const parsed = parseCompletionSignalBody(body, errors)
  if (parsed === null) return badRequest(errors)

  // 4. Stamp server-side identity from the credential (unforgeable — never
  //    caller-supplied) and write. KG1: awaited.
  const signal: CompletionSignalInsert = {
    ...parsed,
    agent_id: auth.agentId,
    owner_user_id: auth.ownerUserId,
    credential_ref: `api_key:${auth.credentialId}`,
  }
  const result = await deps.insertSignal(signal)
  if (!result.ok) {
    console.error('[completion-signal] write failed:', result.error)
    return json({ error: 'service error' }, 503)
  }

  // 5. Respond honestly.
  if (result.value.status === 'no_such_cycle') {
    // A DISCLOSED LIMITATION, stated on the wire rather than hidden: the signal
    // anchors to a recorded cycle by FK (which is what gives this table its
    // retention and data-rights coverage for free), so a cycle the runner never
    // recorded has nothing to attach to. 409, not 404: the request is
    // well-formed and the agent is authorised — the conflict is with the
    // recorded state.
    return json(
      {
        schema: 'practice-completion-signal-response-v1',
        status: 'no_such_cycle',
        note:
          'No recorded cycle matches this (loop_id, cycle_number), so the completion signal has ' +
          'nothing to attach to and was NOT persisted. The signal anchors to the cycle record by ' +
          'foreign key; a cycle whose per-cycle write never landed cannot carry one.',
      },
      409,
    )
  }

  if (result.value.status === 'duplicate') {
    return json(
      {
        schema: 'practice-completion-signal-response-v1',
        status: 'duplicate',
        cycle_id: result.value.cycle_id,
        note:
          'A completion signal for this cycle is already recorded; nothing was written. One ' +
          'elected idea, one executing agent, one report.',
      },
      200,
    )
  }

  return json(
    {
      schema: 'practice-completion-signal-response-v1',
      status: 'written',
      signal_id: result.value.signal_id,
      cycle_id: result.value.cycle_id,
      // The honesty posture rides the wire, as it does on the sibling record
      // surface: this is the agent's own report about its own examination, and
      // the record says so rather than presenting it as an observation.
      basis: 'agent_composed_self_report',
      // Q-C1: "Receipt does not trigger a flag, a dashboard update, or any
      // downstream action at this stage." Said on the wire so a caller does not
      // infer one from a 200.
      note: 'Receipt triggered the write only — no flag, no dashboard update, no downstream action.',
    },
    200,
  )
}
