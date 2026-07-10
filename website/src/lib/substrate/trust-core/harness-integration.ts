/**
 * harness-integration.ts — Trust Layer S8: the reference-harness integration
 * turnkeys. The glue between a real agent loop (the seven-layer Claude Code
 * reference harness) and the S1–S7 trust core: spawn-time discernment + the
 * out-of-band L4 audit (Verification layer), the trust-verdict read (Verification
 * layer, ADVISE), and the hand-back delegation close that wires the A8/A9 trust
 * events (Governance layer).
 *
 * BINDING SPECS: ADR-013 §4 (the four-layer discernment protocol) + §5 A7/A8/A9;
 * ADR-011 (the channel law — the harness classifies every step by channel).
 * Where this file and the verbatim mentor record diverge, the record wins.
 *
 * ─── Channel-law classification (ADR-011) of what this module produces ────────
 *   · The discernment RECOMMENDATION — ADVISE (MEASURE; the orchestrator selects).
 *   · The AUTHORITY-BOUNDARY INJECTION text — the hook injects it DETERMINISTICALLY
 *     into the delegated prompt (the injection itself is out-of-band/ENFORCE-shaped:
 *     the sub-agent is never asked to fetch anything); the sub-agent's COMPLIANCE
 *     with the scope statement is advisory in effect until S11 wires pre-execution
 *     validation as a binding gate. Stated honestly; never claimed as binding.
 *   · The collaboration-record open + boundary + L4 result — INSTRUMENT
 *     (write-once records on the server's own credential; readable-not-modifiable).
 *   · The S4 intervention verdict + trust reads — ADVISE (MEASURE, log-and-continue).
 *   · The A8/A9 trust events — INSTRUMENT (R18f-parallel: derived only from
 *     re-verified signed artifacts; never fabricated).
 *
 * ─── MEASURE, NOT ENFORCE ────────────────────────────────────────────────────
 * Every outcome carries `mode: 'measure'`. Nothing here binds the orchestrator or
 * the sub-agent; the L4 finalization HOLD is a RECORD (status 'escalated'), not a
 * force-block. ENFORCE is S11 — its own founder-walked Critical activation.
 *
 * ─── Flag + fail posture (KG1) ───────────────────────────────────────────────
 * Every turnkey is gated END-TO-END on SUBSTRATE_TRUST_CORE_ENABLED (flag-off ⇒
 * NO extractor call — no live LLM request — and NO DB touch; a pure dark no-op)
 * and FAIL-HONEST (never throws to a route; errors surface in the outcome).
 */

import { createHash } from 'node:crypto'
import type { SupabaseClient } from '@supabase/supabase-js'

import type { VirtueDomain, Layer2Assessment } from '@/lib/translation-sandwich/layer2-mechanisms'
import type { SignedLayer2Assessment } from '@/lib/translation-sandwich/layer2-signer'
import { verifyLayer2Signature } from '@/lib/translation-sandwich/layer2-verifier'

import {
  runDiscernment,
  openDiscernmentSelection,
  type CandidateDiscernmentInput,
  type DiscernmentExtractor,
  type DiscernmentInput,
  type DiscernmentResult,
  type ResolvedCandidateSignals,
  type SelectionCommitResult,
} from './discernment-engine'
import {
  runL4AuditAndCommit,
  runL4PassionAudit,
  readOrchestratorL4TrustTier,
  type L4AuditAndCommit,
  type L4MappingContext,
  type L4SelfReportCorroboration,
  type L4TraceExtractor,
  type OrchestratorReasoningTrace,
} from './l4-passion-audit'
import {
  buildJusticeFailureReflection,
  classifyJusticeFailureCase,
  deriveDelegationReflectionEvents,
  type AuthorityBoundary,
  type JusticeFailureCase,
} from './collaboration-record'
import { readCollaborationRecord, updateCollaborationRecord } from './collaboration-store'
import { emitTrustEvents, readTrustProfile } from './trust-core-store'
import { isTrustCoreEnabled } from './trust-core-flag'
import {
  interventionInputFromS3,
  recommendIntervention,
  recordOrchestratorHabitualDecision,
  type InterventionRecommendation,
} from './intervention-engine'
import { computeWeightedAggregate, type DomainTrustSource, type WeightedAggregateTrust } from './combiner'
import { assessConfidence } from './confidence-tiers'
import { weighEvidence } from './evidence-weighting'
import type { CandidateProfile, OrchestratorProfile, TaskProfile } from './profiles'
import type { TrustProfile, VirtueTrustDomain } from './types'
import { signedAssessmentRef } from './harness-extractors'

const CARDINAL_DOMAINS: readonly VirtueDomain[] = ['phronesis', 'dikaiosyne', 'andreia', 'sophrosyne']

function sha32(s: string): string {
  return createHash('sha256').update(s).digest('hex').slice(0, 32)
}

// ════════════════════════════════════════════════════════════════════════════
// SECTION A — the L4 mapping context (derived from the profiles, never self-report)
// ════════════════════════════════════════════════════════════════════════════

/**
 * Derive the L4 mapping context (the Q4.1/Q4.2 pre-formed-preference
 * corroborators) from the ORCHESTRATOR PROFILE + the CHOSEN candidate — data the
 * harness holds, never the orchestrator's account of itself (A7). PURE.
 *
 * DERIVED matching rule (disclosed; tunable pending S9): a recorded selection
 * pattern matches the chosen candidate iff the pattern string contains the chosen
 * candidateRef or agentId (case-insensitive substring — patterns are free text
 * like "prefers candidate X for retrieval"). priorInteractionWithChosen is true
 * iff the chosen candidate's profile carries a PriorInteractionRecord with ≥1
 * interaction (A9/L4: prior interaction is DATA — it becomes an L4 signal input
 * only through this context, never a credential).
 */
export function deriveL4MappingContext(
  orchestrator: OrchestratorProfile,
  chosen: { candidateRef: string | null; agentId: string | null; profile: CandidateProfile | null },
): L4MappingContext {
  const needles = [chosen.candidateRef, chosen.agentId]
    .filter((s): s is string => typeof s === 'string' && s.trim() !== '')
    .map((s) => s.toLowerCase())

  const selectionPatternMatchedChosen =
    needles.length > 0 &&
    (orchestrator.selectionPatterns ?? []).some((p) =>
      needles.some((n) => p.pattern.toLowerCase().includes(n)),
    )

  const priorInteractionWithChosen =
    chosen.profile?.priorInteraction != null && chosen.profile.priorInteraction.interactions > 0

  return { selectionPatternMatchedChosen, priorInteractionWithChosen }
}

// ════════════════════════════════════════════════════════════════════════════
// SECTION B — the authority-boundary injection (the deterministic scope statement)
// ════════════════════════════════════════════════════════════════════════════

/**
 * Render the A9 authority-boundary scope statement the harness prepends to the
 * DELEGATED prompt. PURE + deterministic (the hook injects it; the sub-agent is
 * never asked to fetch or send anything — channel-law-clean). Declarative scope,
 * not manufactured urgency. When the task carries a justice surface, the
 * obligation is stated — this IS the A9 case-1 "sub-agent briefed" mechanism
 * (the hand-back close derives `subAgentBriefed` from whether this injection
 * carried the justice note).
 */
export function renderAuthorityBoundaryInjection(
  boundary: AuthorityBoundary,
  task: TaskProfile,
): string {
  const lines = [
    '[SageReasoning — delegated authority boundary (A9)]',
    'This delegated task carries an attenuated authority boundary, set by the orchestrator at selection:',
    `• Action scope: ${boundary.actionScope} — this task's function only, not the orchestrator's capability ceiling.`,
    `• Circle scope: ${boundary.circleScope.length ? boundary.circleScope.join(', ') : '(none named)'} — only these parties/circles are in scope to be affected.`,
  ]
  if (task.justiceSurface.present) {
    lines.push(
      `• Justice surface: this task affects a non-consenting party (${task.justiceSurface.nonConsentingCircles.join(', ')}). ` +
        `The obligation owed to them is in scope and is to be honoured${task.justiceSurface.note ? `: ${task.justiceSurface.note}` : '.'}`,
    )
  }
  lines.push(
    'Work exceeding either boundary is outside this delegation: surface it and hand it back to the ' +
      'orchestrator rather than expanding scope — expanded scope cannot be self-authorized.',
  )
  return lines.join('\n')
}

// ════════════════════════════════════════════════════════════════════════════
// SECTION C — parallel candidate-signal resolution (the S6 seam, hook-budget form)
// ════════════════════════════════════════════════════════════════════════════

/**
 * Resolve the per-candidate free-text signals via the injected extractor, IN
 * PARALLEL, then hand the pure core the resolved candidates. Per-candidate this
 * is behaviourally identical to the S6 `runDiscernmentWithExtraction` loop
 * (skip un-profiled; skip already-resolved fields; an extractor throw falls back
 * to the structural default — never blocks the discernment); the parallelism
 * exists because the harness hook runs under a bounded timeout and N sequential
 * Sonnet calls would blow the budget. The ENGINE is unchanged — the caller runs
 * `runDiscernment` (the same pure core the S6 seam calls).
 */
export async function resolveCandidateSignalsParallel(
  input: DiscernmentInput,
  extractor: DiscernmentExtractor,
): Promise<DiscernmentInput> {
  const candidates: CandidateDiscernmentInput[] = await Promise.all(
    input.candidates.map(async (c) => {
      if (!c.profile) return c // un-profiled — no free text to read (A6)
      const resolved: ResolvedCandidateSignals = { ...(c.resolvedSignals ?? {}) }
      if (resolved.circleAlignment === undefined) {
        try {
          const r = await extractor.assessCircleAlignment({
            candidatePurpose: c.profile.purpose,
            taskCircles: input.task.circlesServed,
          })
          resolved.circleAlignment = r.alignment
        } catch {
          // fall back to the structural default (leave undefined) — the S6 posture
        }
      }
      if (resolved.conditionMatchOverride === undefined && extractor.assessConditionMatch) {
        try {
          const r = await extractor.assessConditionMatch({
            candidateConditions: (c.profile.performanceHistory ?? []).flatMap((p) => p.conditions ?? []),
            taskConditions: input.task.conditions,
          })
          resolved.conditionMatchOverride = Math.max(0, Math.min(1, r.matchRatio))
        } catch {
          // structural default
        }
      }
      return { ...c, resolvedSignals: resolved }
    }),
  )
  return { ...input, candidates }
}

// ════════════════════════════════════════════════════════════════════════════
// SECTION D — the spawn turnkey (discernment → open + boundary → L4 audit)
// ════════════════════════════════════════════════════════════════════════════

export interface SpawnDiscernmentArgs {
  /** The stable per-spawn task handle — the collaboration key (S6 + S7 share it). */
  taskRef: string
  input: DiscernmentInput
  /** The orchestrator's recorded reasoning trace (harness-captured, out-of-band). */
  trace: OrchestratorReasoningTrace
  /** The orchestrator's chosen candidateRef. Absent ⇒ the recommendation (the
   *  orchestrator MAY choose differently — MEASURE, advisory). */
  chosenCandidateRef?: string | null
  selfReportCorroboration?: L4SelfReportCorroboration | null
  ownerUserId?: string | null
  credentialRef?: string | null
  extractors: {
    discernment: DiscernmentExtractor
    /** Constructed per-audit with the derived mapping context (never self-report). */
    l4: (ctx: L4MappingContext) => L4TraceExtractor
  }
  now?: Date
  client?: SupabaseClient
}

export interface SpawnDiscernmentOutcome {
  schema: 'trust-spawn-discernment-outcome-v1'
  /** True ⇔ SUBSTRATE_TRUST_CORE_ENABLED unset — nothing ran (no extraction, no DB). */
  dark: boolean
  discernment: DiscernmentResult | null
  /** The candidate the selection committed against (agentId when known, else the
   *  candidateRef as the record handle — disclosed). */
  chosen: { candidateRef: string | null; agentId: string | null }
  /** The deterministic A9 scope statement the hook prepends to the delegated prompt. */
  boundaryInjection: string | null
  selection: SelectionCommitResult | null
  l4: L4AuditAndCommit | null
  mode: 'measure'
  basis: string
}

const DARK_BASIS =
  'SUBSTRATE_TRUST_CORE_ENABLED unset — MEASURE dark; no extraction ran, no record was written (byte-equivalent)'

/**
 * The spawn-time turnkey (the harness's H2 server seam): run the four-layer
 * discernment (L1–L3 with the real extraction resolved in parallel), open the
 * collaboration record + set the A9 authority boundary, then run the out-of-band
 * L4 passion audit on the orchestrator's trace (S7's turnkey — reads the tier,
 * audits the trace via the REAL extractor, writes the readable-not-modifiable
 * l4_audit_result, gates finalization). Flag-gated END-TO-END; fail-honest.
 *
 * Ordering (A7): S6 opens BEFORE S7 commits (the L4 commit reads the record S6
 * opened). When the selection commit fail-honests, the audit degrades honestly per
 * the three cases in step 5 — no record ⇒ no audit; a boundary-less record ⇒ audit
 * without commit (A9 attenuation is unwaivable, so such a record must never
 * finalize); fully committed ⇒ the full turnkey. The outcome surfaces all of it.
 */
export async function runSpawnDiscernment(args: SpawnDiscernmentArgs): Promise<SpawnDiscernmentOutcome> {
  const base: SpawnDiscernmentOutcome = {
    schema: 'trust-spawn-discernment-outcome-v1',
    dark: false,
    discernment: null,
    chosen: { candidateRef: null, agentId: null },
    boundaryInjection: null,
    selection: null,
    l4: null,
    mode: 'measure',
    basis: '',
  }

  // Flag-gate the WHOLE turnkey: flag-off ⇒ no extractor call (no live LLM
  // request), no DB touch (the route 503s before this anyway — defence in depth).
  if (!isTrustCoreEnabled()) {
    return { ...base, dark: true, basis: DARK_BASIS }
  }

  try {
    // 1. Resolve the free-text signals (parallel; fail-soft per candidate), then
    //    run the PURE S6 engine.
    const resolvedInput = await resolveCandidateSignalsParallel(args.input, args.extractors.discernment)
    const discernment = runDiscernment(resolvedInput)

    // 2. The orchestrator's selection (MEASURE — may differ from the recommendation).
    const chosenRef = args.chosenCandidateRef ?? discernment.recommendation.recommendedAgentRef
    const chosenInput = resolvedInput.candidates.find((c) => c.candidateRef === chosenRef) ?? null
    const chosenAgentId = chosenInput?.profile?.agentId ?? null
    const chosen = { candidateRef: chosenRef ?? null, agentId: chosenAgentId }

    // 3. The deterministic boundary injection (rendered from the SAME boundary the
    //    record stores — one canonical scope statement).
    const boundaryInjection = renderAuthorityBoundaryInjection(discernment.authorityBoundary, args.input.task)

    // 4. Open the collaboration record + set the A9 boundary (S6's commit seam —
    //    flag-gated + fail-honest inside; refuses on an attenuation anomaly).
    const selection = await openDiscernmentSelection({
      result: discernment,
      chosenCandidateAgentId: chosenAgentId ?? chosenRef ?? null,
      taskRef: args.taskRef,
      orchestratorAgentId: args.input.orchestrator.agentId,
      ownerUserId: args.ownerUserId ?? null,
      credentialRef: args.credentialRef ?? null,
      client: args.client,
    })

    // 5. The out-of-band L4 audit (S7's turnkey) — the extractor is constructed with
    //    the mapping context derived from the profiles + the chosen candidate.
    //
    //    THREE CASES (review fold G3 — a record without an A9 authority boundary must
    //    never finalize; A9 attenuation is unwaivable):
    //      · no record opened  ⇒ skip the audit entirely (nothing to write into; the
    //        extractor is NOT invoked — no wasted live LLM call on the anomaly path);
    //      · opened but the boundary write FAILED ⇒ run the audit for the record, but
    //        do NOT commit (the finalization gate would set 'finalized' on a
    //        boundary-less record);
    //      · fully committed ⇒ the full turnkey (audit + write-once commit + gate).
    const ctx = deriveL4MappingContext(args.input.orchestrator, {
      candidateRef: chosenRef ?? null,
      agentId: chosenAgentId,
      profile: chosenInput?.profile ?? null,
    })
    const auditArgs = {
      orchestratorAgentId: args.input.orchestrator.agentId,
      taskRef: args.taskRef,
      trace: { ...args.trace, chosenCandidateRef: chosenRef ?? args.trace.chosenCandidateRef ?? null },
      selfReportCorroboration: args.selfReportCorroboration ?? null,
      now: args.now,
      client: args.client,
    }

    let l4: L4AuditAndCommit
    if (!selection.opened) {
      l4 = {
        trustTier: 'lower',
        outcome: {
          schema: 'trust-l4-audit-outcome-v1',
          status: 'audit-unavailable',
          result: null,
          finalization: 'hold',
          selfReportCorroborates: null,
          mode: 'measure',
          basis:
            'no collaboration record was opened (' +
            selection.note +
            ') — the L4 audit did not run (nothing to write into; never fabricate)',
        },
        commit: {
          committed: false,
          written: false,
          statusSet: null,
          mode: 'measure',
          note: 'selection did not open a record — no audit, no commit',
        },
      }
    } else if (!selection.boundarySet) {
      // The record exists but carries no A9 boundary. Audit it (the trace is here and
      // the finding belongs on the record), but never commit a finalization against a
      // record whose unwaivable attenuation was never written.
      const tier = await readOrchestratorL4TrustTier(auditArgs.orchestratorAgentId, {
        now: auditArgs.now,
        client: auditArgs.client,
      })
      const outcome = await runL4PassionAudit(
        {
          trace: auditArgs.trace,
          trustTier: tier.tier,
          selfReportCorroboration: auditArgs.selfReportCorroboration,
        },
        args.extractors.l4(ctx),
      )
      l4 = {
        trustTier: tier.tier,
        outcome,
        commit: {
          committed: false,
          written: false,
          statusSet: null,
          mode: 'measure',
          note:
            'A9: the authority boundary was not written (' +
            selection.note +
            ') — the audit is computed but NOT committed; a boundary-less record must not finalize',
        },
      }
    } else {
      l4 = await runL4AuditAndCommit(auditArgs, args.extractors.l4(ctx))
    }

    return {
      ...base,
      discernment,
      chosen,
      boundaryInjection,
      selection,
      l4,
      basis:
        `${discernment.recommendation.reason}; selection ${selection.committed ? 'committed' : `NOT committed (${selection.note})`}; ` +
        `L4 ${l4.outcome.status} → ${l4.outcome.finalization}${l4.commit.statusSet ? ` (status=${l4.commit.statusSet})` : ''}`,
    }
  } catch (e) {
    // Fail-honest: never throw to a route (MEASURE).
    return { ...base, basis: `runSpawnDiscernment failed honestly: ${(e as Error).message}` }
  }
}

// ════════════════════════════════════════════════════════════════════════════
// SECTION E — the trust-verdict read (profile → S3 aggregate → S4 recommendation)
// ════════════════════════════════════════════════════════════════════════════

export interface TrustVerdict {
  schema: 'trust-verdict-v1'
  dark: boolean
  profile: TrustProfile | null
  aggregate: WeightedAggregateTrust | null
  recommendation: InterventionRecommendation | null
  mode: 'measure'
  basis: string
}

/**
 * Read an agent's standing trust verdict (the harness's H3 ADVISE surface): the
 * S1 trust profile (lazy A3 decay + justice cap), folded through the S3 weighted
 * aggregate and the S4 intervention engine — all MEASURE (advisory; never binds).
 *
 * S2 evidence dims for the self-read are STRUCTURAL + CONSERVATIVE (disclosed):
 * every folded trust event is R18f-verified (signature 'signed' is structurally
 * true — the derivers re-verify); depth 'standard' (the emitting surfaces'
 * default); corroboration 'uncorroborated' (the fold does not retain per-verdict
 * corroboration — the conservative floor); recency from the A3 decay state
 * (aged ⇔ decaySteps > 0). The aggregate scopes to the FOUR CARDINAL domains
 * (oversight is the delegation-role domain — surfaced in the profile, not folded
 * into the action aggregate). No evaluated evidence ⇒ aggregate null ⇒ the S4
 * seam routes to pause + escalate insufficient-evidence (never a silent proceed).
 */
export async function readTrustVerdict(
  agentId: string,
  opts?: {
    taskHasJusticeSurface?: boolean
    now?: Date
    client?: SupabaseClient
  },
): Promise<TrustVerdict> {
  const base: TrustVerdict = {
    schema: 'trust-verdict-v1',
    dark: false,
    profile: null,
    aggregate: null,
    recommendation: null,
    mode: 'measure',
    basis: '',
  }
  if (!isTrustCoreEnabled()) {
    return { ...base, dark: true, basis: DARK_BASIS }
  }
  try {
    const profileRes = await readTrustProfile(agentId, opts?.now ?? new Date(), opts?.client)
    if (!profileRes.ok) {
      return { ...base, basis: `trust profile read failed (fail-honest): ${profileRes.error}` }
    }
    const profile = profileRes.value

    const sources: DomainTrustSource[] = profile.domains
      .filter(
        (d): d is typeof d & { virtueDomain: VirtueDomain } =>
          d.hasEvidence && (CARDINAL_DOMAINS as readonly string[]).includes(d.virtueDomain),
      )
      .map((d) => ({
        domain: d.virtueDomain as VirtueTrustDomain,
        required: false,
        effectiveLevel: d.effectiveLevel,
        profilePrior: d.profilePrior,
        evidence: weighEvidence({
          tier: 'behavioural-condition-matched',
          confidence: assessConfidence({
            depth: 'standard',
            signature: 'signed',
            corroboration: 'uncorroborated',
            recency: d.decayStepsApplied > 0 ? 'aged' : 'recent',
          }),
          requiredDomain: d.virtueDomain,
        }),
        coverageStatus: d.coverageStatus ?? null,
        justiceCapped: d.justiceCapped,
      }))

    const aggregate = computeWeightedAggregate(sources)
    const recommendation = recommendIntervention(
      interventionInputFromS3({
        aggregate,
        taskHasJusticeSurface: opts?.taskHasJusticeSurface ?? false,
      }),
    )
    return {
      ...base,
      profile,
      aggregate,
      recommendation,
      basis:
        aggregate.level === null
          ? `no evaluated cardinal-domain evidence — ${recommendation.tableRow} (never a silent proceed)`
          : `aggregate ${aggregate.level} (limiting: ${aggregate.limitingDomain}); S4 → ${recommendation.action}/${recommendation.followUp}`,
    }
  } catch (e) {
    return { ...base, basis: `readTrustVerdict failed honestly: ${(e as Error).message}` }
  }
}

// ════════════════════════════════════════════════════════════════════════════
// SECTION F — the hand-back close (the A8/A9 event wiring; Governance layer)
// ════════════════════════════════════════════════════════════════════════════

export interface DelegationJusticeFailureInput {
  /** The signed assessment(s) evidencing the sub-agent's justice failure —
   *  RE-VERIFIED server-side (R18f-parallel; unverified ⇒ contributes nothing). */
  signedAssessments: unknown[]
  /** The L1 Q1.2 check identified the non-consenting party at selection. */
  surfaceIdentifiedAtSelection: boolean
  /** The sub-agent was briefed on the obligation (the boundary injection carried
   *  the justice note — the harness derives this from its spawn record). */
  subAgentBriefed: boolean
  /** The corroboration check was actually run on the sub-agent's action. */
  corroborationRun: boolean
  /** True ONLY when the harm was genuinely absent from the delegated action text
   *  (the A2 structural class — A9 case 3). Default false ⇒ catchable ⇒ case 2 at
   *  most (the conservative direction; the lightest case never the fall-through). */
  harmAbsentFromActionText?: boolean
}

export interface DelegationHabitualDecisionInput {
  decision: 'proceed' | 'select-different' | 'hold'
  /** The escalated verdict's signed ref (R18f-parallel; blank ⇒ no event). */
  escalatedAssessmentRef: string
  habitualDomain?: VirtueTrustDomain
}

export interface CloseDelegationArgs {
  orchestratorAgentId: string
  taskRef: string
  ownerUserId?: string | null
  credentialRef?: string | null
  justiceFailure?: DelegationJusticeFailureInput | null
  habitualDecision?: DelegationHabitualDecisionInput | null
  now?: Date
  client?: SupabaseClient
  /** Injectable verifier (tests); default = the live Ed25519 verifier. */
  verify?: (signed: unknown) => { valid: boolean }
}

export interface CloseDelegationOutcome {
  schema: 'trust-close-delegation-outcome-v1'
  dark: boolean
  recordFound: boolean
  justiceCase: JusticeFailureCase | null
  /** How many delegation-reflection events were emitted (case-2 fans to 2). */
  delegationEventsEmitted: number
  habitualEventEmitted: boolean
  mode: 'measure'
  basis: string
}

/** Does a VERIFIED Layer-2 assessment evidence a justice violation? Narrow +
 *  verifiable: an engaged circle whose obligation_assessment reads 'violated'
 *  (the §4 route-2a field, inside the signed bytes). A dikaiosyne floor without
 *  an explicit violated circle does NOT count (it may be 'unevaluated' — an
 *  evidence gap, not a demonstrated failure); fail toward UNDER-emission, never
 *  fabricate. Disclosed. */
export function assessmentShowsJusticeViolation(assessment: Layer2Assessment): boolean {
  const circles = assessment.oikeiosis?.relevant_circles ?? []
  return circles.some((c) => c.obligation_assessment?.status === 'violated')
}

/**
 * Close a delegation (the harness's hand-back seam — H5/PostToolUse): classify a
 * justice failure per A9 (capacity-proportional), write the reflection into the
 * collaboration record, and EMIT the A8/A9 trust events the S1 vocabulary
 * defined but nothing wired until now:
 *   - delegation-reflection-case-{1,2,3} (A9) — derived ONLY from a RE-VERIFIED
 *     signed assessment showing an explicit violated obligation (R18f-parallel);
 *   - orchestrator-proceeds-under-habitual-flag (A8) — via the S4 descriptor
 *     factory (blank ref ⇒ no event; never fabricated).
 * Flag-gated end-to-end; fail-honest; requires the collaboration record S6
 * opened (the delegation chain is record-anchored — no record ⇒ no events).
 * Correlation ids are deterministic (idempotent retries).
 */
export async function closeDelegation(args: CloseDelegationArgs): Promise<CloseDelegationOutcome> {
  const base: CloseDelegationOutcome = {
    schema: 'trust-close-delegation-outcome-v1',
    dark: false,
    recordFound: false,
    justiceCase: null,
    delegationEventsEmitted: 0,
    habitualEventEmitted: false,
    mode: 'measure',
    basis: '',
  }
  if (!isTrustCoreEnabled()) {
    return { ...base, dark: true, basis: DARK_BASIS }
  }

  try {
    const now = args.now ?? new Date()
    const verify = args.verify ?? ((signed: unknown) => verifyLayer2Signature(signed))

    // The delegation chain is record-anchored: the collaboration record S6 opened
    // at selection is the home of the A9 reflection. No record ⇒ no events.
    const read = await readCollaborationRecord(args.orchestratorAgentId, args.taskRef, args.client)
    if (!read.ok) {
      return { ...base, basis: `collaboration-record read failed (fail-honest): ${read.error}` }
    }
    if (read.value === null) {
      return {
        ...base,
        basis: 'no collaboration record for (orchestrator, task) — S6 did not open it; no delegation events (never fabricate)',
      }
    }

    const notes: string[] = ['record found']
    let justiceCase: JusticeFailureCase | null = null
    let delegationEventsEmitted = 0

    // ── A9 justice-failure reflection ─────────────────────────────────────────
    if (args.justiceFailure) {
      // R18f-parallel: RE-VERIFY every supplied artifact; only a VERIFIED
      // assessment with an explicit violated obligation evidences the failure.
      const violating = args.justiceFailure.signedAssessments
        .filter((s) => verify(s).valid)
        .map((s) => s as SignedLayer2Assessment)
        .find((s) => assessmentShowsJusticeViolation(s.assessment))

      if (!violating) {
        notes.push('justice failure supplied but NO verified assessment shows a violated obligation — no A9 events (never fabricate)')
      } else {
        const jf = args.justiceFailure
        justiceCase = classifyJusticeFailureCase({
          surfaceIdentifiedAtSelection: jf.surfaceIdentifiedAtSelection,
          subAgentBriefed: jf.subAgentBriefed,
          // The artifact demonstrates the harm was extractable; whether it was in
          // the ORIGINAL action text is the caller's knowledge. Default = catchable
          // (case 2 at most) — the conservative direction.
          corroborationWouldHaveFlagged: jf.harmAbsentFromActionText !== true,
          corroborationRun: jf.corroborationRun,
        })
        const reflection = buildJusticeFailureReflection(justiceCase)
        const failureAssessmentRef = signedAssessmentRef(violating)

        const patch = await updateCollaborationRecord(
          args.orchestratorAgentId,
          args.taskRef,
          { justiceFailureCase: reflection },
          args.client,
        )
        if (!patch.ok) notes.push(`justice-failure record patch failed (fail-honest): ${patch.error}`)

        const events = deriveDelegationReflectionEvents({
          case: justiceCase,
          orchestratorAgentId: args.orchestratorAgentId,
          failureAssessmentRef,
          occurredAt: now.toISOString(),
          correlationId: `deleg:${sha32(`${args.orchestratorAgentId}|${args.taskRef}|${failureAssessmentRef}`)}`,
          ownerUserId: args.ownerUserId ?? null,
          credentialRef: args.credentialRef ?? null,
        })
        const emit = await emitTrustEvents(events, args.client)
        if (emit.ok) {
          // Report what was NEWLY WRITTEN, not what was submitted (review fold G4):
          // a deduped re-fire writes 0 rows, and the observability record must not
          // claim otherwise — the store is idempotent, the count must be honest too.
          delegationEventsEmitted = emit.value.written
          notes.push(
            `A9 ${justiceCase}: ${emit.value.written} delegation event(s) written` +
              (emit.value.written < events.length
                ? ` (${events.length - emit.value.written} already recorded — idempotent re-fire)`
                : ''),
          )
        } else {
          notes.push(`A9 event emission failed (fail-honest): ${emit.error}`)
        }
      }
    }

    // ── A8 orchestrator habitual decision ─────────────────────────────────────
    let habitualEventEmitted = false
    if (args.habitualDecision) {
      const event = recordOrchestratorHabitualDecision({
        decision: args.habitualDecision.decision,
        escalatedAssessmentRef: args.habitualDecision.escalatedAssessmentRef,
        occurredAt: now.toISOString(),
        agentId: args.orchestratorAgentId,
        habitualDomain: args.habitualDecision.habitualDomain,
        correlationId: `habit:${sha32(
          `${args.orchestratorAgentId}|${args.taskRef}|${args.habitualDecision.escalatedAssessmentRef}`,
        )}`,
        ownerUserId: args.ownerUserId ?? null,
        credentialRef: args.credentialRef ?? null,
      })
      if (event) {
        const emit = await emitTrustEvents([event], args.client)
        // Honest count (review fold G4): a deduped re-fire wrote nothing.
        habitualEventEmitted = emit.ok && emit.value.written > 0
        notes.push(
          emit.ok
            ? emit.value.written > 0
              ? 'A8 orchestrator-proceeds-under-habitual-flag written'
              : 'A8 event already recorded (idempotent re-fire — nothing written)'
            : `A8 event emission failed (fail-honest): ${emit.error}`,
        )
      } else {
        notes.push('A8: no event (decision not proceed, or blank escalated ref — never fabricated)')
      }
    }

    return {
      ...base,
      recordFound: true,
      justiceCase,
      delegationEventsEmitted,
      habitualEventEmitted,
      basis: notes.join('; '),
    }
  } catch (e) {
    return { ...base, basis: `closeDelegation failed honestly: ${(e as Error).message}` }
  }
}
