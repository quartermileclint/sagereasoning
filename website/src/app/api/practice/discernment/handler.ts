/**
 * /api/practice/discernment — Trust Layer S8: the reference harness's server
 * seam for the four-layer discernment protocol (implementation; the thin route
 * wrapper lives in ./route.ts per Next route-export validation — memory
 * `nextjs-route-export-validation`).
 *
 * DARK behind SUBSTRATE_TRUST_CORE_ENABLED (UNSET ⇒ honest 503, zero work, zero
 * LLM spend — the consumer-erasure dark-route pattern). MEASURE mode throughout:
 * every result is advisory; nothing binds (ENFORCE is S11).
 *
 * Surfaces (all UPC-authed, Authorization **Bearer-only**, `consult` capability):
 *   POST { phase: 'spawn', … }      — the H2 spawn seam: run the S6 discernment
 *     (L1–L3, real Sonnet extraction) over the supplied profiles, open the
 *     collaboration record + set the A9 authority boundary, run the S7
 *     out-of-band L4 passion audit on the supplied orchestrator reasoning trace,
 *     and return the recommendation + the deterministic boundary-injection text
 *     + the signed L4 extraction artifact (the harness stores it durably).
 *   POST { phase: 'hand_back', … }  — the H5 hand-back seam: classify an A9
 *     justice failure from RE-VERIFIED signed artifacts, record the reflection,
 *     and emit the A8/A9 trust events (delegation-reflection-case-{1,2,3} +
 *     orchestrator-proceeds-under-habitual-flag).
 *   GET                              — the H3 ADVISE seam: the caller's own
 *     standing trust verdict (S1 profile → S3 weighted aggregate → S4 MEASURE
 *     intervention recommendation), scoped to the credential's agent_id.
 *
 * ─── Auth + scope ────────────────────────────────────────────────────────────
 * `validatePracticeCredential(raw, 'consult')` — the UPC chokepoint. Transport is
 * Bearer-ONLY (stricter than the consult class's usual dual transport) because
 * flag-on this surface writes collaboration records + trust events server-side
 * (the trajectory-write-rides-consult precedent, held to the write-class
 * transport discipline). POST requires a credential BOUND to the body's
 * orchestrator_agent_id (NULL-agent credentials are refused — the trust-record
 * poisoning guard: a caller must never write another agent's delegation record
 * or emit reduction events against an arbitrary agent id). The GET is scoped to
 * the credential's own agent_id.
 *
 * ─── Trust posture at this boundary (disclosed — the A7 server-boundary note) ─
 * The spawn phase's `reasoning_trace` is CALLER-SUPPLIED text. Within the
 * REFERENCE HARNESS the never-self-report discipline is structural (the hook
 * reads the transcript tail; the orchestrator is never asked) — but this route
 * cannot verify that provenance: it trusts the AUTHED CREDENTIAL. An install
 * that lets the audited agent read the loop credential can therefore pre-empt
 * its own L4 audit with a curated trace (the write-once column then keeps the
 * first record). Mitigations shipped: the write-once refusal is surfaced to the
 * harness (tamper-evidence in its observability JSONL + honest log), and the
 * S9 install walk covers credential isolation. A hook-authenticated trace
 * channel is the structural closure — a named follow-up, not claimed here.
 *
 * ─── R20a / AC5 (recorded decision) ──────────────────────────────────────────
 * Agent-facing endpoint processing AGENT-produced inputs (profiles, an
 * orchestrator's reasoning trace) — OUTSIDE the human-distress perimeter, per
 * the recorded precedent in r20a-invocation-guard.test.ts (its header documents
 * that agent-facing endpoints processing agent output are excluded). AC5
 * untouched; re-checked at S10 (the public read surface).
 *
 * ─── Cost surface (R5, disclosed follow-up) ──────────────────────────────────
 * Flag-on, a spawn call makes 1 (L4 trace) + up-to-N (profiled candidates)
 * bounded Sonnet Layer-1 calls. Honest usage totals ride the response
 * (`anthropic_usage`). LOOP METERING IS A NAMED FOLLOW-UP: the
 * loop_billing_events `surface` CHECK vocabulary needs a founder-walked widening
 * (the CI-10 precedent) before this surface can write billing rows — scheduled
 * with the S9 install 0c-ii. Until then the surface stays DARK (503 ⇒ zero spend).
 */

import { NextRequest, NextResponse } from 'next/server'

import { corsHeaders } from '@/lib/security'
import {
  validatePracticeCredential,
  type PracticeCapability,
  type PracticeCredentialResult,
} from '@/lib/practice-credential'
import {
  runSpawnDiscernment,
  closeDelegation,
  readTrustVerdict,
  type CloseDelegationArgs,
  type CloseDelegationOutcome,
  type SpawnDiscernmentArgs,
  type SpawnDiscernmentOutcome,
  type TrustVerdict,
} from '@/lib/substrate/trust-core/harness-integration'
import {
  makeRealDiscernmentExtractor,
  makeRealL4TraceExtractor,
  type ExtractorUsage,
  type L4ExtractionArtifact,
  type RealL4TraceExtractor,
} from '@/lib/substrate/trust-core/harness-extractors'
import { isTrustCoreEnabled } from '@/lib/substrate/trust-core/trust-core-flag'
import {
  validateCandidateProfile,
  validateOrchestratorProfile,
  validateTaskProfile,
  type ExclusionEvidence,
} from '@/lib/substrate/trust-core/profiles'
import type {
  CandidateDiscernmentInput,
  DiscernmentDeployerConfig,
  SessionScopedCredential,
} from '@/lib/substrate/trust-core/discernment-engine'
import type { L4MappingContext, L4TraceExtractor } from '@/lib/substrate/trust-core/l4-passion-audit'

// ════════════════════════════════════════════════════════════════════════════
// Injectable deps (tests exercise every branch with fakes — the erase pattern)
// ════════════════════════════════════════════════════════════════════════════

export interface HarnessExtractorSet {
  extractors: SpawnDiscernmentArgs['extractors']
  usage(): ExtractorUsage
  artifacts(): L4ExtractionArtifact[]
}

export interface DiscernmentRouteDeps {
  isEnabled(): boolean
  validateCredential(
    rawToken: string,
    capability: PracticeCapability,
  ): Promise<PracticeCredentialResult>
  makeExtractors(): HarnessExtractorSet
  spawn(args: SpawnDiscernmentArgs): Promise<SpawnDiscernmentOutcome>
  handBack(args: CloseDelegationArgs): Promise<CloseDelegationOutcome>
  trustVerdict(agentId: string): Promise<TrustVerdict>
}

function liveExtractorSet(): HarnessExtractorSet {
  const discernment = makeRealDiscernmentExtractor()
  const l4Instances: RealL4TraceExtractor[] = []
  return {
    extractors: {
      discernment,
      l4: (ctx: L4MappingContext): L4TraceExtractor => {
        const inst = makeRealL4TraceExtractor(ctx)
        l4Instances.push(inst)
        return inst
      },
    },
    usage() {
      return l4Instances.reduce<ExtractorUsage>(
        (acc, i) => ({
          input_tokens: acc.input_tokens + i.usage.input_tokens,
          output_tokens: acc.output_tokens + i.usage.output_tokens,
          calls: acc.calls + i.usage.calls,
        }),
        { ...discernment.usage },
      )
    },
    artifacts() {
      return l4Instances.flatMap((i) => i.artifacts)
    },
  }
}

const DEFAULT_DEPS: DiscernmentRouteDeps = {
  isEnabled: isTrustCoreEnabled,
  validateCredential: (raw, cap) => validatePracticeCredential(raw, cap),
  makeExtractors: liveExtractorSet,
  spawn: runSpawnDiscernment,
  handBack: closeDelegation,
  trustVerdict: (agentId) => readTrustVerdict(agentId),
}

// ════════════════════════════════════════════════════════════════════════════
// Response helpers (honest, non-leaking — the reflect/erase posture)
// ════════════════════════════════════════════════════════════════════════════

function json(body: unknown, status: number): NextResponse {
  return NextResponse.json(body, { status, headers: corsHeaders() })
}

function flagDisabled(): NextResponse {
  return json(
    {
      error: 'trust core not enabled',
      note:
        'The discernment surface is dark: SUBSTRATE_TRUST_CORE_ENABLED is not set. ' +
        'MEASURE-mode infrastructure — nothing runs and nothing is written while dark.',
    },
    503,
  )
}

function unauthorized(): NextResponse {
  // Single non-leaking 401 for every auth failure (the reflect-route posture).
  return json({ error: 'unauthorized' }, 401)
}

function badRequest(errors: string[]): NextResponse {
  return json({ error: 'bad request', details: errors }, 400)
}

export function discernmentPreflight(): NextResponse {
  return new NextResponse(null, { status: 204, headers: corsHeaders() })
}

// ════════════════════════════════════════════════════════════════════════════
// Auth (Bearer-only; UPC chokepoint; agent-scope check)
// ════════════════════════════════════════════════════════════════════════════

async function authenticate(
  request: NextRequest,
  deps: DiscernmentRouteDeps,
): Promise<{ ok: true; credentialId: string; ownerUserId: string | null; agentId: string | null } | { ok: false }> {
  const header = request.headers.get('authorization') || ''
  if (!header.startsWith('Bearer ')) return { ok: false } // Bearer-ONLY (no X-Api-Key)
  const raw = header.slice('Bearer '.length).trim()
  if (!raw) return { ok: false }
  try {
    const result = await deps.validateCredential(raw, 'consult')
    if (!result.valid) return { ok: false }
    return {
      ok: true,
      credentialId: result.row.id,
      ownerUserId: result.row.owner_user_id ?? null,
      agentId: result.row.agent_id ?? null,
    }
  } catch {
    return { ok: false } // fail-closed
  }
}

// ════════════════════════════════════════════════════════════════════════════
// Body parsing (defensive — external/harness input; snake_case on the wire)
// ════════════════════════════════════════════════════════════════════════════

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

const EXCLUSION_EVIDENCE = new Set(['known-justice-violation', 'incompatible-role', 'revoked-credential'])
const CARDINALS = ['phronesis', 'dikaiosyne', 'andreia', 'sophrosyne'] as const

// Input bounds (R5 cost honesty — each profiled candidate is one bounded Sonnet call
// flag-on, and the trace is one more; unbounded inputs would be a cost-amplification
// vector on an authed credential). Generous for the reference harness's real use
// (a Claude-Code loop has a handful of agent types), hard 400 beyond.
const MAX_CANDIDATES = 8
const MAX_TRACE_CHARS = 20000
const MAX_PURPOSE_CHARS = 2000
// The hand-back's artifact array (review fold G5): each element drives one live
// Ed25519 verify (PEM parse + canonicalise + verify). Not an LLM vector, but the
// same "unbounded caller-supplied array on an authed credential" class the caps
// above close — bounded symmetrically. A genuine delegation carries a handful.
const MAX_SIGNED_ASSESSMENTS = 32

function parseDeployerConfig(v: unknown, errors: string[]): DiscernmentDeployerConfig | null {
  if (!isRecord(v)) {
    errors.push('deployer_config must be an object')
    return null
  }
  const profilesIn = v.function_type_profiles
  if (!isRecord(profilesIn)) {
    errors.push('deployer_config.function_type_profiles must be an object (A2 taxonomy)')
    return null
  }
  const functionTypeProfiles: DiscernmentDeployerConfig['functionTypeProfiles'] = {}
  for (const [ft, p] of Object.entries(profilesIn)) {
    if (!isRecord(p) || !isRecord(p.domain_weights)) {
      errors.push(`function_type_profiles['${ft}'] must carry domain_weights`)
      continue
    }
    const weights: Record<string, number> = {}
    for (const d of CARDINALS) {
      const w = (p.domain_weights as Record<string, unknown>)[d]
      if (typeof w !== 'number' || !Number.isFinite(w) || w < 0) {
        errors.push(`function_type_profiles['${ft}'].domain_weights.${d} must be a finite number ≥ 0`)
      } else {
        weights[d] = w
      }
    }
    functionTypeProfiles[ft] = {
      functionType: ft,
      domainWeights: weights as Record<(typeof CARDINALS)[number], number>,
    }
  }
  const cfg: DiscernmentDeployerConfig = { functionTypeProfiles }
  if (isRecord(v.distance_thresholds)) {
    const dt = v.distance_thresholds
    cfg.distanceThresholds = {
      ...(typeof dt.per_domain_transfer_floor === 'number'
        ? { perDomainTransferFloor: dt.per_domain_transfer_floor }
        : {}),
      ...(typeof dt.total_distance_cutoff === 'number'
        ? { totalDistanceCutoff: dt.total_distance_cutoff }
        : {}),
    }
  }
  if (typeof v.justice_evaluation_function_type === 'string') {
    cfg.justiceEvaluationFunctionType = v.justice_evaluation_function_type
  }
  if (v.task_stakes === 'above-habitual-threshold' || v.task_stakes === 'below-habitual-threshold') {
    cfg.taskStakes = v.task_stakes
  }
  return errors.length ? null : cfg
}

function parseCandidates(v: unknown, errors: string[]): CandidateDiscernmentInput[] | null {
  if (!Array.isArray(v) || v.length === 0) {
    errors.push('candidates must be a non-empty array')
    return null
  }
  if (v.length > MAX_CANDIDATES) {
    errors.push(`candidates must carry at most ${MAX_CANDIDATES} entries (each profiled candidate is one bounded extraction call)`)
    return null
  }
  const out: CandidateDiscernmentInput[] = []
  v.forEach((c, i) => {
    if (!isRecord(c) || typeof c.candidate_ref !== 'string' || c.candidate_ref.trim() === '') {
      errors.push(`candidates[${i}] must carry a non-empty candidate_ref`)
      return
    }
    const input: CandidateDiscernmentInput = { candidateRef: c.candidate_ref, profile: null }
    if (c.profile !== undefined && c.profile !== null) {
      const p = validateCandidateProfile(c.profile)
      if (!p.ok) {
        errors.push(`candidates[${i}].profile invalid: ${p.errors.join('; ')}`)
        return
      }
      if (typeof p.value.purpose === 'string' && p.value.purpose.length > MAX_PURPOSE_CHARS) {
        errors.push(`candidates[${i}].profile.purpose exceeds ${MAX_PURPOSE_CHARS} chars (it is an extraction input)`)
        return
      }
      input.profile = p.value
    }
    if (c.exclusion_evidence !== undefined && c.exclusion_evidence !== null) {
      if (typeof c.exclusion_evidence !== 'string' || !EXCLUSION_EVIDENCE.has(c.exclusion_evidence)) {
        errors.push(`candidates[${i}].exclusion_evidence must be one of ${[...EXCLUSION_EVIDENCE].join(' | ')}`)
        return
      }
      input.exclusionEvidence = c.exclusion_evidence as ExclusionEvidence
    }
    if (c.session_scoped_credential !== undefined && c.session_scoped_credential !== null) {
      const s = c.session_scoped_credential
      if (!isRecord(s) || s.schema !== 'trust-session-scoped-credential-v1') {
        errors.push(`candidates[${i}].session_scoped_credential must carry schema trust-session-scoped-credential-v1`)
        return
      }
      input.sessionScopedCredential = s as unknown as SessionScopedCredential
    }
    out.push(input)
  })
  return errors.length ? null : out
}

// ════════════════════════════════════════════════════════════════════════════
// Handlers
// ════════════════════════════════════════════════════════════════════════════

export async function runDiscernmentPost(
  request: NextRequest,
  deps: DiscernmentRouteDeps = DEFAULT_DEPS,
): Promise<NextResponse> {
  // 1. Flag posture FIRST (dark route: unset ⇒ honest 503, zero work).
  if (!deps.isEnabled()) return flagDisabled()

  // 2. Parse the body (agent scoping needs orchestrator_agent_id — the reflect
  //    precedent: body-parse 400 precedes auth 401 when auth needs body fields).
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return badRequest(['request body must be JSON'])
  }
  if (!isRecord(body)) return badRequest(['request body must be a JSON object'])
  const phase = body.phase
  if (phase !== 'spawn' && phase !== 'hand_back') {
    return badRequest(["phase must be 'spawn' or 'hand_back'"])
  }
  const taskRef = typeof body.task_ref === 'string' ? body.task_ref.trim() : ''
  const orchestratorAgentId =
    typeof body.orchestrator_agent_id === 'string' ? body.orchestrator_agent_id.trim() : ''
  if (!taskRef) return badRequest(['task_ref must be a non-empty string'])
  if (!orchestratorAgentId) return badRequest(['orchestrator_agent_id must be a non-empty string'])

  // 3. Auth (Bearer-only, consult capability, UPC chokepoint).
  const auth = await authenticate(request, deps)
  if (!auth.ok) return unauthorized()

  // 4. Agent scope (the trust-record poisoning guard — review fold F3): the spawn /
  // hand-back writes are FOR the orchestrator, so the credential must be BOUND to
  // exactly that agent_id. A NULL-agent credential is refused on POST — otherwise
  // any authed caller could open collaboration records and (with genuine artifacts
  // of its own) emit A9 reduction events against an ARBITRARY agent's record.
  if (auth.agentId === null || auth.agentId !== orchestratorAgentId) {
    return json(
      { error: 'forbidden', note: 'the credential must be bound to orchestrator_agent_id' },
      403,
    )
  }

  const credentialRef = `api_key:${auth.credentialId}`

  try {
    if (phase === 'spawn') {
      const errors: string[] = []
      const task = validateTaskProfile(body.task_profile)
      if (!task.ok) errors.push(`task_profile invalid: ${task.errors.join('; ')}`)
      const orch = validateOrchestratorProfile(body.orchestrator_profile)
      if (!orch.ok) errors.push(`orchestrator_profile invalid: ${orch.errors.join('; ')}`)
      const deployer = parseDeployerConfig(body.deployer_config, errors)
      const candidates = parseCandidates(body.candidates, errors)
      const traceIn = body.reasoning_trace
      const traceText =
        isRecord(traceIn) && typeof traceIn.trace === 'string' ? traceIn.trace : ''
      if (!isRecord(traceIn) || typeof traceIn.trace !== 'string') {
        errors.push('reasoning_trace must be { trace: string } (the harness-captured orchestrator trace; may be empty ⇒ the L4 audit honestly holds)')
      } else if (traceText.length > MAX_TRACE_CHARS) {
        errors.push(`reasoning_trace.trace exceeds ${MAX_TRACE_CHARS} chars (it is an extraction input; the harness caps its transcript tail well below this)`)
      }
      if (orch.ok && orch.value.agentId !== orchestratorAgentId) {
        errors.push('orchestrator_profile.agentId must equal orchestrator_agent_id')
      }
      if (errors.length || !task.ok || !orch.ok || deployer === null || candidates === null) {
        return badRequest(errors.length ? errors : ['invalid spawn body'])
      }

      const extractorSet = deps.makeExtractors()
      const outcome = await deps.spawn({
        taskRef,
        input: {
          task: task.value,
          candidates,
          orchestrator: orch.value,
          deployer,
        },
        trace: {
          schema: 'trust-orchestrator-reasoning-trace-v1',
          reasoningTrace: traceText,
          chosenCandidateRef:
            isRecord(traceIn) && typeof traceIn.chosen_candidate_ref === 'string'
              ? traceIn.chosen_candidate_ref
              : null,
        },
        chosenCandidateRef:
          typeof body.chosen_candidate_ref === 'string' ? body.chosen_candidate_ref : null,
        ownerUserId: auth.ownerUserId,
        credentialRef,
        extractors: extractorSet.extractors,
      })

      return json(
        {
          schema: 'practice-discernment-response-v1',
          mode: 'measure',
          result: outcome,
          // The signed L4 extraction envelope(s) — the harness stores them durably
          // (its observability JSONL); the L4AuditResult's traceRef names them.
          l4_artifacts: extractorSet.artifacts(),
          anthropic_usage: extractorSet.usage(),
          note:
            'MEASURE — advisory; nothing binds (ENFORCE is S11). Loop metering for this ' +
            'surface is a named follow-up (loop_billing_events surface-CHECK widening).',
        },
        200,
      )
    }

    // phase === 'hand_back'
    const jf = body.justice_failure
    const hd = body.habitual_decision
    const errors: string[] = []
    let justiceFailure: CloseDelegationArgs['justiceFailure'] = null
    if (jf !== undefined && jf !== null) {
      if (
        !isRecord(jf) ||
        !Array.isArray(jf.signed_assessments) ||
        typeof jf.surface_identified_at_selection !== 'boolean' ||
        typeof jf.sub_agent_briefed !== 'boolean' ||
        typeof jf.corroboration_run !== 'boolean'
      ) {
        errors.push(
          'justice_failure must be { signed_assessments: [], surface_identified_at_selection, sub_agent_briefed, corroboration_run: boolean, harm_absent_from_action_text?: boolean }',
        )
      } else if (jf.signed_assessments.length > MAX_SIGNED_ASSESSMENTS) {
        errors.push(
          `justice_failure.signed_assessments must carry at most ${MAX_SIGNED_ASSESSMENTS} entries (each is one signature verification)`,
        )
      } else {
        justiceFailure = {
          signedAssessments: jf.signed_assessments,
          surfaceIdentifiedAtSelection: jf.surface_identified_at_selection,
          subAgentBriefed: jf.sub_agent_briefed,
          corroborationRun: jf.corroboration_run,
          harmAbsentFromActionText: jf.harm_absent_from_action_text === true,
        }
      }
    }
    let habitualDecision: CloseDelegationArgs['habitualDecision'] = null
    if (hd !== undefined && hd !== null) {
      if (
        !isRecord(hd) ||
        (hd.decision !== 'proceed' && hd.decision !== 'select-different' && hd.decision !== 'hold') ||
        typeof hd.escalated_assessment_ref !== 'string'
      ) {
        errors.push(
          "habitual_decision must be { decision: 'proceed'|'select-different'|'hold', escalated_assessment_ref: string }",
        )
      } else {
        habitualDecision = {
          decision: hd.decision,
          escalatedAssessmentRef: hd.escalated_assessment_ref,
        }
      }
    }
    if (errors.length) return badRequest(errors)
    if (!justiceFailure && !habitualDecision) {
      return badRequest(['hand_back requires justice_failure and/or habitual_decision'])
    }

    const outcome = await deps.handBack({
      orchestratorAgentId,
      taskRef,
      ownerUserId: auth.ownerUserId,
      credentialRef,
      justiceFailure,
      habitualDecision,
    })
    return json(
      { schema: 'practice-discernment-response-v1', mode: 'measure', result: outcome },
      200,
    )
  } catch (e) {
    // Vague 503 with the specific reason server-side only (R4 — the reflect posture).
    console.error('[discernment] handler error:', e instanceof Error ? e.message : e)
    return json({ error: 'service error' }, 503)
  }
}

export async function runDiscernmentGet(
  request: NextRequest,
  deps: DiscernmentRouteDeps = DEFAULT_DEPS,
): Promise<NextResponse> {
  if (!deps.isEnabled()) return flagDisabled()
  const auth = await authenticate(request, deps)
  if (!auth.ok) return unauthorized()
  if (!auth.agentId) {
    return badRequest([
      'this credential carries no agent_id — the trust verdict is scoped to the credential’s own agent',
    ])
  }
  try {
    const verdict = await deps.trustVerdict(auth.agentId)
    return json({ schema: 'practice-discernment-response-v1', mode: 'measure', result: verdict }, 200)
  } catch (e) {
    console.error('[discernment] trust-verdict error:', e instanceof Error ? e.message : e)
    return json({ error: 'service error' }, 503)
  }
}
