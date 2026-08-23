/**
 * completion-signal-handler.test.ts — the POST /api/practice/completion-signal
 * battery (ATRF GS-ATRF-3, built 2026-08-23 to the RULED components; see
 * ../handler.ts header).
 *
 * Plain-assertion script: npx tsx <this file>. Hermetic — injectable deps (fake
 * credential validator + fake store), no env, no network, no DB.
 *
 * DIMENSIONS COVERED:
 *   1. Dark-route posture (flag off ⇒ 503, ZERO work — no auth, no parse, no write)
 *   2. Write-class auth: completion_signal_write, Bearer-ONLY, fail-closed
 *   3. Q-C2a — the three questions, in sequence
 *   4. Q-C3 — the refuse-to-attest branch is REQUIRED and is enforced
 *   5. Q-C4 — the per-proposition provenance/credence constraints are ENFORCED,
 *      not merely documented
 *   6. Identity stamped server-side, never caller-supplied
 *   7. Honest outcomes: written / duplicate / no_such_cycle
 *   8. The ruling's own negative space: no justice verdict, no trust event, no
 *      downstream action
 */

import { readFileSync } from 'fs'
import { join } from 'path'
import { NextRequest } from 'next/server'
import {
  runCompletionSignalPost,
  parseCompletionSignalBody,
  isCompletionSignalEnabled,
  ASSENT_QUALITY_VALUES,
  THRESHOLD_REACHED_VALUES,
  PROVENANCE_VALUES,
  CREDENCE_VALUES,
  ATTESTED_THRESHOLD_CREDENCE_VALUES,
  type CompletionSignalDeps,
} from '../handler'
import {
  PRACTICE_CAPABILITIES,
  WRITE_CLASS_CAPABILITIES,
  capabilitiesIncludeWriteClass,
} from '@/lib/practice-credential'

let passed = 0
let failed = 0
const failures: string[] = []
function assert(condition: boolean, label: string): void {
  if (condition) passed++
  else {
    failed++
    failures.push(label)
    console.error(`FAIL: ${label}`)
  }
}

function req(opts: { auth?: string; apiKey?: string; body?: unknown; rawBody?: string }): NextRequest {
  const headers: Record<string, string> = { 'content-type': 'application/json' }
  if (opts.auth) headers['authorization'] = opts.auth
  if (opts.apiKey) headers['x-api-key'] = opts.apiKey
  return new NextRequest('http://localhost/api/practice/completion-signal', {
    method: 'POST',
    headers,
    ...(opts.rawBody !== undefined
      ? { body: opts.rawBody }
      : opts.body !== undefined
        ? { body: JSON.stringify(opts.body) }
        : {}),
  })
}

interface Calls {
  validate: { raw: string; cap: string }[]
  insert: unknown[]
}

function makeDeps(over: Partial<CompletionSignalDeps> = {}): {
  deps: CompletionSignalDeps
  calls: Calls
} {
  const calls: Calls = { validate: [], insert: [] }
  const deps: CompletionSignalDeps = {
    isEnabled: () => true,
    validateCredential: async (raw, cap) => {
      calls.validate.push({ raw, cap })
      return {
        valid: true,
        row: {
          id: 'cred-uuid-1',
          agent_id: 'sagereasoning:executing-agent@v1',
          owner_user_id: 'owner-uuid-1',
        },
        capabilities: ['completion_signal_write'],
      } as never
    },
    insertSignal: async (signal) => {
      calls.insert.push(signal)
      return { ok: true, value: { status: 'written', signal_id: 'sig-1', cycle_id: 'cycle-1' } }
    },
    ...over,
  }
  return { deps, calls }
}

/** A valid ATTESTED signal. */
function attestedBody(over: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    loop_id: 'loop-abc',
    cycle_number: 7,
    refuse_to_attest: false,
    examination: {
      impression_assented_to: 'that closing the retention gap was the fitting next action',
      assent_quality: 'examined',
      threshold_reached: 'katorthoma',
    },
    propositions: {
      examination_record: { provenance: 'inference', credence: 'probably-true' },
      threshold_assessment: { provenance: 'inference', credence: 'probably-true' },
    },
    ...over,
  }
}

/** A valid REFUSING signal. */
function refusingBody(over: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    loop_id: 'loop-abc',
    cycle_number: 7,
    refuse_to_attest: true,
    refusal_reason: 'I cannot honestly judge whether my own examination reached the threshold.',
    examination: {
      impression_assented_to: 'that closing the retention gap was the fitting next action',
      assent_quality: 'examined',
    },
    propositions: {
      examination_record: { provenance: 'inference', credence: 'probably-true' },
      threshold_assessment: { provenance: 'unknown', credence: 'unknown' },
    },
    ...over,
  }
}

async function run(): Promise<void> {
  // ==========================================================================
  // 1. DARK-ROUTE POSTURE — flag off ⇒ 503 and ZERO work
  // ==========================================================================
  {
    const { deps, calls } = makeDeps({ isEnabled: () => false })
    const res = await runCompletionSignalPost(req({ auth: 'Bearer sr_prac_x', body: attestedBody() }), deps)
    assert(res.status === 503, 'D-1 flag off ⇒ 503')
    const body = await res.json()
    assert(String(body.error).includes('not enabled'), 'D-2 the 503 says why, honestly')
    assert(calls.validate.length === 0, 'D-3 flag off ⇒ the credential is NEVER validated (zero work)')
    assert(calls.insert.length === 0, 'D-4 flag off ⇒ nothing is written (zero DB touch)')
  }
  assert(
    isCompletionSignalEnabled() === (process.env.SUBSTRATE_COMPLETION_SIGNAL_ENABLED === 'true'),
    'D-5 the flag reads the env at call time, exact-string',
  )

  // ==========================================================================
  // 2. AUTH — write-class discipline
  // ==========================================================================
  {
    const { deps, calls } = makeDeps()
    const res = await runCompletionSignalPost(req({ body: attestedBody() }), deps)
    assert(res.status === 401, 'A-1 no Authorization header ⇒ 401')
    assert(calls.insert.length === 0, 'A-2 unauthenticated ⇒ nothing written')
  }
  {
    // Bearer-ONLY (constraint 7): X-Api-Key must NOT authenticate a write-class surface.
    const { deps, calls } = makeDeps()
    const res = await runCompletionSignalPost(req({ apiKey: 'sr_live_x', body: attestedBody() }), deps)
    assert(res.status === 401, 'A-3 X-Api-Key is never read on this write-class surface ⇒ 401')
    assert(calls.validate.length === 0, 'A-4 X-Api-Key does not even reach the validator')
  }
  {
    const { deps } = makeDeps({
      validateCredential: async () => ({ valid: false, reason: 'nope' }) as never,
    })
    const res = await runCompletionSignalPost(req({ auth: 'Bearer sr_prac_x', body: attestedBody() }), deps)
    assert(res.status === 401, 'A-5 an invalid credential ⇒ 401')
  }
  {
    const { deps } = makeDeps({
      validateCredential: async () => {
        throw new Error('validator exploded')
      },
    })
    const res = await runCompletionSignalPost(req({ auth: 'Bearer sr_prac_x', body: attestedBody() }), deps)
    assert(res.status === 401, 'A-6 a THROWING validator fails CLOSED (401), never open')
  }
  {
    const { deps, calls } = makeDeps()
    await runCompletionSignalPost(req({ auth: 'Bearer sr_prac_x', body: attestedBody() }), deps)
    assert(
      calls.validate.length === 1 && calls.validate[0].cap === 'completion_signal_write',
      'A-7 the required capability is completion_signal_write — NOT watching_write (the actor separation Q-C1 turns on)',
    )
  }
  assert(
    (PRACTICE_CAPABILITIES as readonly string[]).includes('completion_signal_write'),
    'A-8 completion_signal_write is in the closed capability vocabulary',
  )
  assert(
    (WRITE_CLASS_CAPABILITIES as readonly string[]).includes('completion_signal_write'),
    'A-9 completion_signal_write is WRITE-CLASS ⇒ the 6e §A owner+agent invariant binds it at mint',
  )
  assert(
    capabilitiesIncludeWriteClass(['completion_signal_write']),
    'A-10 the mint pre-validator recognises it as write-class (so a bad mint gets a clear 400, not an opaque 500)',
  )
  assert(
    !capabilitiesIncludeWriteClass(['consult']),
    'A-11 non-vacuity: capabilitiesIncludeWriteClass is not simply true for everything',
  )

  // ==========================================================================
  // 3. Q-C2a — the three questions
  // ==========================================================================
  {
    const errors: string[] = []
    const parsed = parseCompletionSignalBody(attestedBody(), errors)
    assert(parsed !== null && errors.length === 0, 'Q2a-1 a well-formed attested signal parses clean')
    assert(
      parsed?.impression_assented_to.startsWith('that closing') === true,
      'Q2a-2 question 1 (what impression was assented to) is carried',
    )
    assert(parsed?.assent_quality === 'examined', 'Q2a-3 question 2 (examined vs habitual) is carried')
    assert(parsed?.threshold_reached === 'katorthoma', 'Q2a-4 question 3 (the katorthoma threshold) is carried')
  }
  {
    const errors: string[] = []
    const b = attestedBody()
    ;(b.examination as Record<string, unknown>).impression_assented_to = '   '
    assert(
      parseCompletionSignalBody(b, errors) === null && errors.some((e) => e.includes('question 1')),
      'Q2a-5 an empty impression is refused (question 1 is not optional)',
    )
  }
  {
    const errors: string[] = []
    const b = attestedBody()
    ;(b.examination as Record<string, unknown>).assent_quality = 'thorough'
    assert(
      parseCompletionSignalBody(b, errors) === null,
      'Q2a-6 assent_quality is a CLOSED vocabulary — an invented value is refused',
    )
  }
  assert(
    ASSENT_QUALITY_VALUES.length === 2 &&
      ASSENT_QUALITY_VALUES.includes('examined') &&
      ASSENT_QUALITY_VALUES.includes('habitual'),
    'Q2a-7 the assent vocabulary is exactly the ruled pair — an EPISTEMIC check, never a motivational one (boulesis is never asked here)',
  )
  assert(
    THRESHOLD_REACHED_VALUES.length === 2 &&
      THRESHOLD_REACHED_VALUES.includes('katorthoma') &&
      THRESHOLD_REACHED_VALUES.includes('kathekon'),
    'Q2a-8 the threshold vocabulary is exactly katorthoma vs mere kathekon',
  )

  // ==========================================================================
  // 4. Q-C3 — the refuse-to-attest branch is REQUIRED
  // ==========================================================================
  {
    const errors: string[] = []
    const b = attestedBody()
    delete b.refuse_to_attest
    assert(
      parseCompletionSignalBody(b, errors) === null &&
        errors.some((e) => e.includes('REQUIRED')),
      'Q3-1 an ABSENT refuse_to_attest is refused — a ruled design constraint, not an optional field',
    )
  }
  {
    const errors: string[] = []
    const parsed = parseCompletionSignalBody(refusingBody(), errors)
    assert(parsed !== null && errors.length === 0, 'Q3-2 a well-formed REFUSING signal parses clean')
    assert(parsed?.refuse_to_attest === true, 'Q3-3 the refusal is recorded as a named field')
    assert(parsed?.threshold_reached === null, 'Q3-4 a refusal carries NO threshold answer')
  }
  {
    const errors: string[] = []
    const b = refusingBody()
    ;(b.examination as Record<string, unknown>).threshold_reached = 'katorthoma'
    assert(
      parseCompletionSignalBody(b, errors) === null &&
        errors.some((e) => e.includes('answering it anyway is not a refusal')),
      'Q3-5 refusing AND answering the threshold is refused — the refuse branch IS the expression of an assessment the agent cannot carry',
    )
  }
  {
    const errors: string[] = []
    const b = attestedBody()
    delete (b.examination as Record<string, unknown>).threshold_reached
    assert(
      parseCompletionSignalBody(b, errors) === null &&
        errors.some((e) => e.includes('required when refuse_to_attest is false')),
      'Q3-6 attesting while leaving the threshold unanswered is refused (the other half of the coherence rule)',
    )
  }
  {
    // THE RULING'S NEGATIVE SPACE. "It cannot carry a verdict on whether the
    // examination was just in the dikaiosyne sense." A justice verdict must have
    // no home in the parsed shape — asserted, not assumed.
    const errors: string[] = []
    const parsed = parseCompletionSignalBody(
      attestedBody({ justice_verdict: 'just', dikaiosyne_assessment: 'met' }),
      errors,
    )
    const keys = parsed ? Object.keys(parsed) : []
    assert(
      !keys.some((k) => /justice|dikaiosyne/i.test(k)),
      'Q3-7 NO justice/dikaiosyne verdict field exists in the parsed shape — a supplied one is dropped, never persisted',
    )
  }

  // ==========================================================================
  // 5. Q-C4 — the provenance/credence constraints are ENFORCED
  // ==========================================================================
  {
    const errors: string[] = []
    const b = attestedBody()
    ;(b.propositions as Record<string, unknown>).examination_record = {
      provenance: 'observation',
      credence: 'established',
    }
    assert(
      parseCompletionSignalBody(b, errors) === null &&
        errors.some((e) => e.includes("must be 'inference'")),
      'Q4-1 the examination record MUST be inference — observation is refused (it is not a direct observation of an external event)',
    )
  }
  {
    const errors: string[] = []
    const b = attestedBody()
    ;(b.propositions as Record<string, unknown>).threshold_assessment = {
      provenance: 'inference',
      credence: 'probably-false',
    }
    assert(
      parseCompletionSignalBody(b, errors) === null &&
        errors.some((e) => e.includes('honest floor')),
      'Q4-2 an ATTESTED threshold below the probably-true floor is refused — a weaker credence is what the refuse branch is FOR',
    )
  }
  {
    const errors: string[] = []
    const b = refusingBody()
    ;(b.propositions as Record<string, unknown>).threshold_assessment = {
      provenance: 'inference',
      credence: 'unknown',
    }
    assert(
      parseCompletionSignalBody(b, errors) === null &&
        errors.some((e) => e.includes("must be 'unknown'")),
      'Q4-3 the refuse branch MUST carry provenance unknown — "the agent cannot determine the provenance of an assessment it cannot make"',
    )
  }
  {
    const errors: string[] = []
    const b = attestedBody()
    ;(b.propositions as Record<string, unknown>).threshold_assessment = {
      provenance: 'inference',
      credence: 'established',
    }
    assert(
      parseCompletionSignalBody(b, errors) !== null,
      'Q4-4 `established` IS permitted for an attested threshold (probably-true is a FLOOR, not the only value)',
    )
  }
  assert(
    PROVENANCE_VALUES.length === 4 && CREDENCE_VALUES.length === 4,
    'Q4-5 both Q-A1 axes carry exactly four values each',
  )
  assert(
    ATTESTED_THRESHOLD_CREDENCE_VALUES.every((v) => (CREDENCE_VALUES as readonly string[]).includes(v)),
    'Q4-6 the attested-credence floor is a SUBSET of the credence vocabulary (not a parallel enum)',
  )

  // ==========================================================================
  // 6. IDENTITY — stamped server-side, never caller-supplied
  // ==========================================================================
  {
    const { deps, calls } = makeDeps()
    await runCompletionSignalPost(
      req({
        auth: 'Bearer sr_prac_x',
        body: attestedBody({
          agent_id: 'sagereasoning:IMPERSONATED@v1',
          owner_user_id: 'someone-else',
          credential_ref: 'api_key:forged',
        }),
      }),
      deps,
    )
    const written = calls.insert[0] as Record<string, unknown>
    assert(
      written.agent_id === 'sagereasoning:executing-agent@v1',
      'ID-1 agent_id comes from the CREDENTIAL, not the body — a supplied one is ignored',
    )
    assert(written.owner_user_id === 'owner-uuid-1', 'ID-2 owner_user_id comes from the credential')
    assert(written.credential_ref === 'api_key:cred-uuid-1', 'ID-3 credential_ref is server-composed')
  }

  // ==========================================================================
  // 7. HONEST OUTCOMES
  // ==========================================================================
  {
    const { deps } = makeDeps()
    const res = await runCompletionSignalPost(req({ auth: 'Bearer sr_prac_x', body: attestedBody() }), deps)
    assert(res.status === 200, 'O-1 a valid signal ⇒ 200')
    const b = await res.json()
    assert(b.status === 'written' && b.signal_id === 'sig-1', 'O-2 the response reports what was written')
    assert(
      b.basis === 'agent_composed_self_report',
      'O-3 the honesty posture rides the WIRE — the record says it is the agent’s own report about its own examination',
    )
    assert(
      String(b.note).includes('no downstream action'),
      'O-4 the wire states that receipt triggered the write ONLY (so a caller does not infer a flag or an action from a 200)',
    )
  }
  {
    const { deps } = makeDeps({
      insertSignal: async () => ({ ok: true, value: { status: 'duplicate', cycle_id: 'cycle-1' } }),
    })
    const res = await runCompletionSignalPost(req({ auth: 'Bearer sr_prac_x', body: attestedBody() }), deps)
    assert(res.status === 200, 'O-5 a duplicate is an HONEST no-op 200 (idempotent retry)')
    const b = await res.json()
    assert(b.status === 'duplicate', 'O-6 the duplicate is named, not silently re-reported as written')
  }
  {
    const { deps } = makeDeps({
      insertSignal: async () => ({ ok: true, value: { status: 'no_such_cycle' } }),
    })
    const res = await runCompletionSignalPost(req({ auth: 'Bearer sr_prac_x', body: attestedBody() }), deps)
    assert(res.status === 409, 'O-7 a signal for an unrecorded cycle ⇒ 409 (well-formed + authorised; the conflict is with recorded state)')
    const b = await res.json()
    assert(
      b.status === 'no_such_cycle' && String(b.note).includes('NOT persisted'),
      'O-8 the 409 says plainly that nothing was written — a disclosed limitation, not a silent drop',
    )
  }
  {
    const { deps } = makeDeps({
      insertSignal: async () => ({ ok: false, error: 'db exploded' }),
    })
    const res = await runCompletionSignalPost(req({ auth: 'Bearer sr_prac_x', body: attestedBody() }), deps)
    assert(res.status === 503, 'O-9 a write failure is an honest 503, never a false success')
    const b = await res.json()
    assert(!JSON.stringify(b).includes('db exploded'), 'O-10 the internal error is NOT leaked to the caller')
  }
  {
    const { deps } = makeDeps()
    const res = await runCompletionSignalPost(
      req({ auth: 'Bearer sr_prac_x', rawBody: '{not json' }),
      deps,
    )
    assert(res.status === 400, 'O-11 a malformed body ⇒ 400')
  }

  // ==========================================================================
  // 8. THE RULED SOURCE IS PRESENT AND SAYS WHAT THE BUILD CLAIMS
  //    (drift pin — the same discipline as the EE-C1 battery: read the record,
  //    do not restate it from memory)
  // ==========================================================================
  {
    const record = readFileSync(
      join(
        process.cwd(),
        '..',
        'operations',
        'agent-circles-2026-08',
        '2026-08-23-mentor-rulings-atrf-sixteen-questions-verbatim.md',
      ),
      'utf-8',
    )
    assert(
      record.includes('The agent, post-execution'),
      'R-1 the ruling still names the AGENT as the actor (the reason the capability is dedicated)',
    )
    assert(
      record.includes('The refuse-to-attest branch is required'),
      'R-2 the ruling still makes the refuse-to-attest branch REQUIRED',
    )
    assert(
      record.includes('A new harness endpoint, not an existing one'),
      'R-3 the ruling still requires a NEW endpoint rather than a route on an existing one',
    )
    assert(
      record.includes('Receipt does not trigger a flag, a dashboard update, or any downstream action'),
      'R-4 the ruling still scopes receipt to the write ONLY',
    )
  }

  console.log(`completion-signal-handler battery: ${passed} passed, ${failed} failed`)
  if (failures.length) {
    console.error('\nFailures:')
    for (const f of failures) console.error(`  - ${f}`)
  }
  process.exit(failed === 0 ? 0 : 1)
}

void run()
