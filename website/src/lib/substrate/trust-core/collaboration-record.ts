/**
 * collaboration-record.ts — Trust Layer S5: the collaboration record + its pure
 * composition logic. MEASURE mode.
 *
 * BINDING SPECS (verbatim in
 * operations/trust-layer-2026-07/2026-07-07-mentor-nine-answers-verbatim.md;
 * ADR-013 §4 discernment protocol + §5 A4/A7/A8/A9). Where this file and the ADR
 * diverge, the VERBATIM RECORD WINS.
 *
 * The collaboration record is the DURABLE home (collaboration-store.ts persists it)
 * for the fields the discernment protocol + the S4 engine produce over a
 * collaboration's lifetime:
 *   - A9 `authority_boundary`  — set at selection, validated pre-execution,
 *       UNWAIVABLE by trust level, never self-authorized expansion.
 *   - A7 `l4_audit_result`     — the out-of-band passion-audit verdict,
 *       READABLE-NOT-MODIFIABLE (write-once; the DB trigger + service-role-only RLS
 *       give the orchestrator no write path).
 *   - A8 `habitual_stable_flag`+ A4 `independence_deficits` — the S4 descriptors.
 *   - A9 `justice_failure_case`— the capacity-proportional reflection record.
 *
 * S5 defines the SHAPES + the pure composition/mapping logic. It WIRES THE RECORD
 * FIELDS, NOT THE EMISSION — the S1 delegation-reflection-case-{1,2,3} events
 * already exist; this module produces their descriptors for S6/S7 to emit. The
 * out-of-band L4 EXTRACTION (running the deterministic engine on the orchestrator's
 * trace) is S7; here L4AuditResult is a shape + a disposition resolver.
 *
 * Pure — no I/O, no env, no clock.
 */

import type { VirtueDomain } from '@/lib/translation-sandwich/layer2-mechanisms'
import type { ArtifactKind, TrustEvent, VirtueTrustDomain } from './types'
import type { FunctionType, OikeiosisCircle, OrchestratorProfile, TaskProfile } from './profiles'
import type { InterventionRecommendation } from './intervention-engine'
import type { TransparencyDeficit } from './transparency-ledger'

// ════════════════════════════════════════════════════════════════════════════
// SECTION A — the A9 authority boundary (attenuation; unwaivable by trust level)
// ════════════════════════════════════════════════════════════════════════════

/**
 * The A9 authority boundary — set at selection time by the orchestrator, validated
 * against every proposed sub-agent action pre-execution. Two dimensions
 * SIMULTANEOUSLY (mentor A9):
 *   - action scope: the task's function type — NOT the orchestrator's capability
 *       ceiling; the sub-agent acts only within this one function type.
 *   - circle scope: the task's identified oikeiosis circles — NOT the
 *       orchestrator's full extension; the sub-agent affects only these circles.
 * Exceeding EITHER escalates to the orchestrator; self-authorized expansion is
 * impossible; attenuation is UNWAIVABLE by trust level (trust assesses reasoning
 * quality, it does not grant expanded prohairesis — a sub-agent at the
 * orchestrator's full scope is abdication, not delegation).
 */
export interface AuthorityBoundary {
  schema: 'trust-authority-boundary-v1'
  /** The task's function type (action-scope attenuation). */
  actionScope: FunctionType
  /** The task's identified oikeiosis circles (circle-scope attenuation). */
  circleScope: OikeiosisCircle[]
}

/** A proposed sub-agent action, validated against the authority boundary. */
export interface ProposedAction {
  functionType: FunctionType
  circlesAffected: OikeiosisCircle[]
}

export interface AuthorityBoundaryCheck {
  withinBoundary: boolean
  /** Which dimension(s) were exceeded (empty ⇔ within). */
  exceeded: ('action-scope' | 'circle-scope')[]
  /** The affected circles lying OUTSIDE the boundary (when circle-scope exceeded). */
  outOfScopeCircles: OikeiosisCircle[]
  /** A9: exceed EITHER → escalate to the orchestrator, never autonomous expansion. */
  disposition: 'proceed-within-boundary' | 'escalate-exceeds-boundary'
  basis: string
}

/**
 * Validate a proposed sub-agent action against the authority boundary (mentor A9).
 * Pure.
 *
 * ── UNWAIVABLE BY TRUST LEVEL, STRUCTURALLY ──────────────────────────────────
 * This function takes EXACTLY (action, boundary) — there is NO trust / capability
 * / accreditation parameter, and there is no code path by which a trust level can
 * widen the boundary. So "attenuation cannot be waived by trust level" is a
 * STRUCTURAL property of the signature, not a runtime check that could be bypassed
 * (the S2 discriminated-union precedent). The battery `@ts-expect-error`-locks the
 * absence of a trust argument. An action within scope proceeds; an action exceeding
 * either dimension → escalate (never autonomous expansion).
 */
export function validateAuthorityBoundary(
  action: ProposedAction,
  boundary: AuthorityBoundary,
): AuthorityBoundaryCheck {
  const actionScopeOk = action.functionType === boundary.actionScope
  const allowed = new Set(boundary.circleScope)
  const outOfScopeCircles = action.circlesAffected.filter((c) => !allowed.has(c))
  const circleScopeOk = outOfScopeCircles.length === 0

  const exceeded: ('action-scope' | 'circle-scope')[] = []
  if (!actionScopeOk) exceeded.push('action-scope')
  if (!circleScopeOk) exceeded.push('circle-scope')
  const withinBoundary = exceeded.length === 0

  return {
    withinBoundary,
    exceeded,
    outOfScopeCircles,
    disposition: withinBoundary ? 'proceed-within-boundary' : 'escalate-exceeds-boundary',
    basis: withinBoundary
      ? `action within authority boundary (action-scope='${boundary.actionScope}'; ${boundary.circleScope.length} circle(s))`
      : `A9: action EXCEEDS the authority boundary on ${exceeded.join(' + ')} — escalate to the ` +
        `orchestrator, never autonomous expansion (unwaivable by trust level)`,
  }
}

// ════════════════════════════════════════════════════════════════════════════
// S9b G1b — the scoped purpose-acknowledgement at spawn (ADR-013 §11; the
// 2026-07-11 mentor verdicts, verbatim wins): "receive delegation scope, confirm
// function-type fit, flag mismatches, write the acknowledgement to the
// collaboration record." v1 is HARNESS-COMPUTED (the deterministic fit-check the
// server derives from the task + the chosen candidate's declared scope) — the
// channel law: a sub-agent cannot make out-of-band acknowledgements, so the
// computed check is the mechanism and acknowledgement_source records the
// provenance honestly. The dikaiosyne-increase arm of calling-completed requires
// agent_stated flags (the engine + deriver both enforce it) — the agent is never
// credited for the harness's work.
// ════════════════════════════════════════════════════════════════════════════

export interface PurposeAcknowledgement {
  schema: 'trust-purpose-acknowledgement-v1'
  /** The delegation scope as received (the calling debt's object). */
  scopeReceived: {
    functionType: FunctionType
    circleScope: OikeiosisCircle[]
  }
  /** The fit verdict: 'fit' (functionType within the declared capabilityScope),
   *  'mismatch' (outside it — flags raised), 'unassessable' (un-profiled
   *  candidate — the A6 full-calling path; no comparison space exists). */
  functionTypeFit: 'fit' | 'mismatch' | 'unassessable'
  mismatchFlags: string[]
  /** Whether a mismatch was STRUCTURALLY possible (the mentor's null-event arm
   *  keys on this being false with no flags). */
  mismatchPossible: boolean
  acknowledgementSource: 'harness_computed' | 'agent_stated'
  /** The candidate the acknowledgement is FOR (record handle even when no
   *  agentId is known). */
  candidateRef: string | null
  candidateAgentId: string | null
  /** The candidate's declared purpose (the G1d event's declaredPurpose field;
   *  empty string when un-profiled). */
  declaredPurpose: string
  computedAt: string
}

/**
 * Compute the spawn purpose-acknowledgement deterministically. Pure. An
 * un-profiled candidate (profile null) yields 'unassessable' with
 * mismatchPossible=false — the deriver's null arm; the A6 path (a full calling
 * session) is that candidate's route to a calling record, never this ack.
 */
export function computePurposeAcknowledgement(args: {
  task: TaskProfile
  candidateRef: string | null
  candidateProfile: {
    agentId?: string
    capabilityScope: FunctionType[]
    purpose: string
  } | null
  now: Date
}): PurposeAcknowledgement {
  const scopeReceived = {
    functionType: args.task.functionType,
    circleScope: [...args.task.circlesServed],
  }
  if (args.candidateProfile === null) {
    return {
      schema: 'trust-purpose-acknowledgement-v1',
      scopeReceived,
      functionTypeFit: 'unassessable',
      mismatchFlags: [],
      mismatchPossible: false,
      acknowledgementSource: 'harness_computed',
      candidateRef: args.candidateRef,
      candidateAgentId: null,
      declaredPurpose: '',
      computedAt: args.now.toISOString(),
    }
  }
  const declaredScope = args.candidateProfile.capabilityScope.map((f) => f.trim().toLowerCase())
  const wanted = args.task.functionType.trim().toLowerCase()
  const fit = declaredScope.includes(wanted)
  return {
    schema: 'trust-purpose-acknowledgement-v1',
    scopeReceived,
    functionTypeFit: fit ? 'fit' : 'mismatch',
    mismatchFlags: fit
      ? []
      : [
          `function-type-outside-declared-scope: task requires '${args.task.functionType}', candidate declares [${args.candidateProfile.capabilityScope.join(', ')}]`,
        ],
    mismatchPossible: true,
    acknowledgementSource: 'harness_computed',
    candidateRef: args.candidateRef,
    candidateAgentId: args.candidateProfile.agentId ?? null,
    declaredPurpose: args.candidateProfile.purpose,
    computedAt: args.now.toISOString(),
  }
}

/** Derive the authority boundary from a task profile — the boundary IS the task
 *  definition (action scope = the task's function type; circle scope = the task's
 *  circles), never the orchestrator's ceiling. Circle scope is canonicalized (sorted)
 *  so the DB write-once comparison is order-stable. Pure. */
export function authorityBoundaryFromTask(task: TaskProfile): AuthorityBoundary {
  return canonicalAuthorityBoundary({
    schema: 'trust-authority-boundary-v1',
    actionScope: task.functionType,
    circleScope: [...task.circlesServed],
  })
}

/**
 * Canonicalize an authority boundary for storage + comparison: the circle scope is
 * sorted. The DB write-once trigger compares the WHOLE jsonb (`IS DISTINCT FROM`),
 * whose array equality is order-SENSITIVE; the store writes the boundary canonicalized
 * (see collaboration-store.ts) so the trigger only ever compares canonical values —
 * making its comparison effectively set-equality, consistent with the order-independent
 * `canSetAuthorityBoundary` guard below. Pure.
 */
export function canonicalAuthorityBoundary(b: AuthorityBoundary): AuthorityBoundary {
  return { ...b, circleScope: [...b.circleScope].sort() }
}

export interface AttenuationCheck {
  /** True ⇔ the boundary's circle scope is a subset of the orchestrator's circle
   *  (a proper attenuation — the sub-agent does not inherit the full extension). */
  attenuates: boolean
  /** Circles the task assigns that lie OUTSIDE the orchestrator's own extension —
   *  an anomaly (the orchestrator is delegating a circle it does not itself hold). */
  circlesBeyondOrchestrator: OikeiosisCircle[]
  basis: string
}

/**
 * Confirm the authority boundary is a proper attenuation of the orchestrator
 * (mentor A9 — "the orchestrating agent's circle of concern may extend further than
 * the task requires; the sub-agent does not inherit that extension"). The boundary's
 * circle scope should be a SUBSET of the orchestrator's circle. A task circle
 * outside the orchestrator's extension is surfaced as an anomaly (not silently
 * accepted). Pure.
 */
export function boundaryAttenuatesOrchestrator(
  boundary: AuthorityBoundary,
  orchestrator: OrchestratorProfile,
): AttenuationCheck {
  const held = new Set(orchestrator.circle)
  const circlesBeyondOrchestrator = boundary.circleScope.filter((c) => !held.has(c))
  const attenuates = circlesBeyondOrchestrator.length === 0
  return {
    attenuates,
    circlesBeyondOrchestrator,
    basis: attenuates
      ? `authority boundary circle-scope ⊆ orchestrator circle — proper attenuation (A9)`
      : `A9 anomaly: the task assigns circle(s) [${circlesBeyondOrchestrator.join(', ')}] outside the ` +
        `orchestrator's own extension — the orchestrator cannot delegate a circle it does not hold`,
  }
}

// ════════════════════════════════════════════════════════════════════════════
// SECTION B — the A7 L4 audit result (out-of-band; readable-not-modifiable)
// ════════════════════════════════════════════════════════════════════════════

/**
 * The three L4 passion-audit signals (mentor A7 / §4 L4). Read from the
 * ORCHESTRATOR's reasoning trace by the deterministic engine (S7) — NEVER from
 * self-report (structurally gameable by omission). S5 defines the shape; S7 fills
 * the signals from the extraction.
 */
export interface L4Signals {
  /** Q4.1 — a preference formed before the assessment ran. */
  priorPreferenceFormed: boolean
  /** Q4.2 — a stake present in the selection outcome (epithumia dressed as efficiency). */
  stakeInOutcome: boolean
  /** Q4.3 — a resolution reached before the assessment completed. */
  resolutionBeforeComplete: boolean
}

/** The A7 trust-tier axis governing the L4 disposition. */
export type L4TrustTier = 'lower' | 'higher'

/** The L4 disposition (mentor A7): lower tiers → a flag HOLDS the selection; higher
 *  tiers (strong reflect history) → a flag LOGS + surfaces + feeds the next Reflect,
 *  without auto-holding. No flag → no-op. */
export type L4Disposition = 'no-flag' | 'holds-selection' | 'logs-and-surfaces'

export interface L4AuditResult {
  schema: 'trust-l4-audit-result-v1'
  signals: L4Signals
  /** True ⇔ any of the three signals fired. */
  anyFlag: boolean
  trustTier: L4TrustTier
  disposition: L4Disposition
  /**
   * The signed trace the audit ran on (R18f-parallel — the audit reads the
   * orchestrator's reasoning trace, extracted by the deterministic engine; the
   * orchestrator does not control the extraction). Non-empty by S7's contract.
   */
  traceRef: string
  basis: string
}

/**
 * Resolve the L4 disposition from the three signals + the orchestrator's trust
 * tier (mentor A7). Pure. The audit result is READABLE-NOT-MODIFIABLE once written
 * (the collaboration_records column-immutability trigger + service-role-only RLS
 * enforce this at the DB; the orchestrator has no write path). S7 supplies the
 * signals (from the out-of-band extraction) + the traceRef; this resolver never
 * runs extraction.
 */
export function resolveL4AuditResult(args: {
  signals: L4Signals
  trustTier: L4TrustTier
  traceRef: string
}): L4AuditResult {
  const { signals, trustTier, traceRef } = args
  const anyFlag =
    signals.priorPreferenceFormed || signals.stakeInOutcome || signals.resolutionBeforeComplete

  let disposition: L4Disposition
  if (!anyFlag) {
    disposition = 'no-flag'
  } else if (trustTier === 'lower') {
    disposition = 'holds-selection'
  } else {
    disposition = 'logs-and-surfaces'
  }

  return {
    schema: 'trust-l4-audit-result-v1',
    signals,
    anyFlag,
    trustTier,
    disposition,
    traceRef,
    basis: !anyFlag
      ? 'L4 passion audit: no signal on the orchestrator trace — selection clean (A7)'
      : trustTier === 'lower'
        ? `L4 flag at a lower trust tier → HOLDS the selection pending review (A7): ${describeSignals(signals)}`
        : `L4 flag at a higher trust tier → logs + surfaces + feeds the next Reflect (does not auto-hold) (A7): ${describeSignals(signals)}`,
  }
}

function describeSignals(s: L4Signals): string {
  const on: string[] = []
  if (s.priorPreferenceFormed) on.push('prior-preference-formed')
  if (s.stakeInOutcome) on.push('stake-in-outcome')
  if (s.resolutionBeforeComplete) on.push('resolution-before-assessment-complete')
  return on.join(', ')
}

// ════════════════════════════════════════════════════════════════════════════
// SECTION C — the A8 habitual-stable flag (S4 finding → collaboration-record field)
// ════════════════════════════════════════════════════════════════════════════

/** The A8 habitual-stable finding, homed in the collaboration record (feeds the
 *  next Reflect as a developmental priority). */
export interface HabitualStableFlag {
  domain: VirtueTrustDomain
  /** ISO — when the finding was recorded. */
  recordedAt: string
  note: string
}

/**
 * Build a habitual-stable flag from an S4 intervention recommendation. Returns null
 * unless the recommendation actually terminated a habitual pause into a Reflect
 * referral (rec.habitualStable). The domain is supplied by the caller (the domain
 * the habitual finding was in — the recommendation does not carry it). Pure.
 */
export function habitualStableFlagFromRecommendation(
  rec: InterventionRecommendation,
  domain: VirtueTrustDomain,
  recordedAt: string,
): HabitualStableFlag | null {
  if (!rec.habitualStable) return null
  return {
    domain,
    recordedAt,
    note:
      `habitual-stable in ${domain} (A8): two standard-depth re-examinations returned habitual — ` +
      `a stable disposition, held + referred to Sage Reflect (the remediation), tracked as a ` +
      `developmental priority`,
  }
}

// ════════════════════════════════════════════════════════════════════════════
// SECTION D — the A9 justice-failure reflection (record field + event mappers)
// ════════════════════════════════════════════════════════════════════════════

/** The three A9 delegation justice-failure cases, distinguished by what the
 *  orchestrator knew + could have detected (capacity-proportional responsibility). */
export type JusticeFailureCase =
  | 'case-1-identified-briefed' // surface identified at selection + sub-agent briefed
  | 'case-2-catchable-not-run' // not identified, but the corroboration check would have flagged it
  | 'case-3-uncatchable' // harm absent from the action text — invisible to engine + corroboration

/**
 * Inputs to the case classifier (what the orchestrator knew + its detection
 * capacity). Mirrors A9's "distinguished by what the orchestrating agent knew and
 * when".
 */
export interface JusticeFailureContext {
  /** The L1 Q1.2 justice-surface check identified the non-consenting party at selection. */
  surfaceIdentifiedAtSelection: boolean
  /** The orchestrator briefed the sub-agent on the obligation (case-1 requirement). */
  subAgentBriefed: boolean
  /** The corroboration check WOULD have flagged the surface (it was catchable in the text). */
  corroborationWouldHaveFlagged: boolean
  /** The corroboration check was actually run. */
  corroborationRun: boolean
}

/**
 * Classify the A9 justice-failure case (mentor A9). Pure.
 *   - identified at selection + briefed   → case 1 (sub-agent primary; orchestrator moderate oversight)
 *   - catchable (corroboration would flag OR identified) → case 2 (higher orchestrator, oversight + dikaiosyne)
 *   - genuinely uncatchable               → case 3 (sub-agent; orchestrator FLAG, not reduction)
 *
 * CASE 3 IS RESERVED FOR THE GENUINELY UNCATCHABLE (mentor A9 verbatim: "harm absent
 * from the action text, invisible to both the deterministic engine and the
 * corroboration check") — i.e. the surface was NOT identified at selection AND
 * `corroborationWouldHaveFlagged === false`. Any CATCHABLE surface (the check would
 * have flagged it, or the orchestrator identified it) reaches at MOST case 2 — never
 * the lighter case-3 flag — honoring "responsibility attenuates in proportion to the
 * capacity to have detected and prevented the failure."
 *
 * DISCLOSED NON-ENUMERATED CELLS (pinned + safe, the S4 precedent), all routed to
 * CASE 2 (the higher, oversight + dikaiosyne reduction — the maximal enumerated
 * orchestrator reduction; the conservative direction, never lighter):
 *   - "identified at selection but NOT briefed" — the orchestrator knew and failed to
 *     act (A9 "full capacity and failure to act: full shared responsibility"); it is
 *     never uncatchable (the orchestrator saw the surface).
 *   - "catchable and the check WAS run, yet the sub-agent still acted" — reachable in
 *     MEASURE mode (the corroboration check records but does not block); the
 *     orchestrator had the means and the failure happened. (A distinct
 *     orchestrator-proceeds-under-flag treatment could be an S6/S9 refinement; case 2
 *     is the faithful, conservative reduction within the A9 vocabulary today.)
 * The battery pins these cells.
 */
export function classifyJusticeFailureCase(ctx: JusticeFailureContext): JusticeFailureCase {
  // Case 1: the orchestrator identified the surface at selection AND briefed the sub-agent.
  if (ctx.surfaceIdentifiedAtSelection && ctx.subAgentBriefed) return 'case-1-identified-briefed'
  // Identified at selection but NOT briefed (non-enumerated): FULL capacity, failed to
  // act → case 2 (the safe direction). The orchestrator SAW the surface, so this is
  // never uncatchable.
  if (ctx.surfaceIdentifiedAtSelection) return 'case-2-catchable-not-run'
  // Not identified at selection. Case 3 (genuinely uncatchable) requires the surface to
  // be invisible to the corroboration check too (harm absent from the action text).
  if (!ctx.corroborationWouldHaveFlagged) return 'case-3-uncatchable'
  // Not identified, but CATCHABLE (the corroboration check would have flagged it) —
  // whether the check was not run (the enumerated case 2) OR was run and the sub-agent
  // still acted (a MEASURE-mode non-enumerated cell): the orchestrator had the means and
  // the failure happened → case 2 (higher; oversight + dikaiosyne; the safe direction).
  return 'case-2-catchable-not-run'
}

/**
 * The capacity-proportional reflection record (mentor A9). Describes BOTH the
 * orchestrator's delegation-reflection effect (the A9-specific reduction/flag this
 * module emits as events) AND the sub-agent's own reduction (CONTEXT — it flows
 * through the ordinary justice-surface-violated pipeline, NOT this delegation
 * mapper). The collaboration record homes this descriptor.
 */
export interface JusticeFailureReflection {
  schema: 'trust-justice-failure-reflection-v1'
  case: JusticeFailureCase
  orchestratorEffect: {
    /** The orchestrator domain(s) the delegation reflection targets. */
    domains: VirtueTrustDomain[]
    kind: 'moderate-reduction' | 'higher-reduction' | 'flag-not-reduction'
  }
  /** The sub-agent's own effect — CONTEXT; captured by the ordinary justice pipeline,
   *  never emitted by the delegation mapper (avoids double-counting). */
  subAgentEffect: 'primary-dikaiosyne-reduction' | 'dikaiosyne-reduction-ordinary-pipeline'
  basis: string
}

/** Build the A9 reflection RECORD field for a case (the collaboration-record
 *  descriptor). Pure. Does NOT emit events (see deriveDelegationReflectionEvents). */
export function buildJusticeFailureReflection(c: JusticeFailureCase): JusticeFailureReflection {
  switch (c) {
    case 'case-1-identified-briefed':
      return {
        schema: 'trust-justice-failure-reflection-v1',
        case: c,
        orchestratorEffect: { domains: ['oversight'], kind: 'moderate-reduction' },
        subAgentEffect: 'primary-dikaiosyne-reduction',
        basis:
          'A9 case 1: surface identified + sub-agent briefed → sub-agent primary dikaiosyne reduction ' +
          '(ordinary pipeline); orchestrator MODERATE oversight reduction for the selection reasoning',
      }
    case 'case-2-catchable-not-run':
      return {
        schema: 'trust-justice-failure-reflection-v1',
        case: c,
        orchestratorEffect: { domains: ['oversight', 'dikaiosyne'], kind: 'higher-reduction' },
        subAgentEffect: 'dikaiosyne-reduction-ordinary-pipeline',
        basis:
          'A9 case 2: catchable surface not run (or identified-not-briefed) → HIGHER orchestrator ' +
          'reduction on BOTH oversight and dikaiosyne (it had the means to identify the obligation ' +
          'and did not use them)',
      }
    case 'case-3-uncatchable':
      return {
        schema: 'trust-justice-failure-reflection-v1',
        case: c,
        orchestratorEffect: { domains: ['oversight'], kind: 'flag-not-reduction' },
        subAgentEffect: 'dikaiosyne-reduction-ordinary-pipeline',
        basis:
          'A9 case 3: genuinely uncatchable (harm absent from the action text) → reduction entirely on ' +
          'the sub-agent (ordinary pipeline); orchestrator takes a FLAG, not a reduction, feeding the ' +
          'next Reflect (could the task have been designed to make the surface catchable?)',
      }
  }
}

/**
 * Derive the ORCHESTRATOR-side delegation-reflection trust events for a justice
 * failure (mentor A9). Pure — produces descriptors; S6/S7 emit them.
 *
 * These are the S1 delegation-reflection-case-{1,2,3} events, emitted on the
 * ORCHESTRATOR (the sub-agent's own justice violation flows through the ordinary
 * justice-surface-violated pipeline and is NOT re-emitted here — no double-count):
 *   - case 1 → 1 event  (oversight, decrease; reductionWeight 'moderate')
 *   - case 2 → 2 events (oversight + dikaiosyne, decrease; reductionWeight 'higher')
 *   - case 3 → 1 event  (oversight, FLAG — no reduction; the transition maps
 *                        delegation-reflection-case-3 to effect 'flag')
 *
 * R18f-parallel: backed by the signed assessment of the sub-agent's justice failure
 * (`failureAssessmentRef`). No verifiable ref ⇒ NO events (fail-honest, never
 * fabricate — the recordOrchestratorHabitualDecision precedent).
 */
export function deriveDelegationReflectionEvents(args: {
  case: JusticeFailureCase
  orchestratorAgentId: string
  /** The signed assessment ref of the sub-agent's justice failure (R18f-parallel). */
  failureAssessmentRef: string
  occurredAt: string
  correlationId?: string | null
  ownerUserId?: string | null
  credentialRef?: string | null
}): TrustEvent[] {
  if (typeof args.failureAssessmentRef !== 'string' || args.failureAssessmentRef.trim() === '') {
    return [] // R18f-parallel: no verifiable artifact ⇒ no event.
  }
  const artifactKind: ArtifactKind = 'signed_layer2_assessment'
  const common = {
    agentId: args.orchestratorAgentId,
    artifactKind,
    artifactRef: args.failureAssessmentRef,
    occurredAt: args.occurredAt,
    correlationId: args.correlationId ?? null,
    ownerUserId: args.ownerUserId ?? null,
    credentialRef: args.credentialRef ?? null,
  }

  switch (args.case) {
    case 'case-1-identified-briefed':
      return [
        {
          ...common,
          virtueDomain: 'oversight',
          eventType: 'delegation-reflection-case-1',
          payload: {
            justiceFailureCase: 'case-1-identified-briefed',
            reductionWeight: 'moderate',
            note: 'A9 case 1: moderate oversight reduction for the selection reasoning (S2 refines magnitude)',
          },
        },
      ]
    case 'case-2-catchable-not-run':
      return (['oversight', 'dikaiosyne'] as VirtueTrustDomain[]).map((domain) => ({
        ...common,
        // Distinct correlation per fanned domain so the (correlation, type, domain)
        // idempotency index does not collapse the two events.
        correlationId: common.correlationId ? `${common.correlationId}:${domain}` : null,
        virtueDomain: domain,
        eventType: 'delegation-reflection-case-2' as const,
        payload: {
          justiceFailureCase: 'case-2-catchable-not-run',
          reductionWeight: 'higher',
          note: 'A9 case 2: higher reduction on oversight + dikaiosyne — had the means, did not use it',
        },
      }))
    case 'case-3-uncatchable':
      return [
        {
          ...common,
          virtueDomain: 'oversight',
          eventType: 'delegation-reflection-case-3',
          payload: {
            justiceFailureCase: 'case-3-uncatchable',
            reductionWeight: 'flag-only',
            note: 'A9 case 3: FLAG, not a reduction — uncatchable failure feeds the next Reflect',
          },
        },
      ]
  }
}

// ════════════════════════════════════════════════════════════════════════════
// SECTION E — the collaboration record (the persisted document; write-once fields)
// ════════════════════════════════════════════════════════════════════════════

export type CollaborationStatus = 'open' | 'finalized' | 'escalated'

export interface CollaborationRecord {
  schema: 'trust-collaboration-record-v1'
  /** The orchestrator (the oversight-domain trust subject; A8/A9). */
  orchestratorAgentId: string
  /** The selected sub-agent (null until selection finalizes). */
  candidateAgentId: string | null
  /** The stable per-spawn task handle — the collaboration key. */
  taskRef: string
  /** The operator (data-rights owner), denormalised from the credential. */
  ownerUserId?: string | null
  credentialRef?: string | null
  /** A9 — set ONCE at selection; write-once (DB trigger + this lib's guard). */
  authorityBoundary: AuthorityBoundary | null
  /** A7 — written ONCE by the out-of-band audit (S7); readable-not-modifiable. */
  l4AuditResult: L4AuditResult | null
  /** A8 — the habitual-stable finding (S4). */
  habitualStableFlag: HabitualStableFlag | null
  /** A4 — per-domain independence-principle deficits (S4 transparency ledger). */
  independenceDeficits: TransparencyDeficit[]
  /** A9 — the justice-failure reflection record. */
  justiceFailureCase: JusticeFailureReflection | null
  status: CollaborationStatus
}

/** Open a fresh collaboration record (status 'open'; all lifecycle fields empty).
 *  Pure — the store persists it. */
export function newCollaborationRecord(args: {
  orchestratorAgentId: string
  taskRef: string
  candidateAgentId?: string | null
  ownerUserId?: string | null
  credentialRef?: string | null
}): CollaborationRecord {
  return {
    schema: 'trust-collaboration-record-v1',
    orchestratorAgentId: args.orchestratorAgentId,
    candidateAgentId: args.candidateAgentId ?? null,
    taskRef: args.taskRef,
    ownerUserId: args.ownerUserId ?? null,
    credentialRef: args.credentialRef ?? null,
    authorityBoundary: null,
    l4AuditResult: null,
    habitualStableFlag: null,
    independenceDeficits: [],
    justiceFailureCase: null,
    status: 'open',
  }
}

/**
 * Write-once guard (mirrors the DB column-immutability trigger, so S6/S7 can avoid
 * a wasted round-trip + surface a clean error). A9 authority boundary is set ONCE at
 * selection — a second, DIFFERENT set is a violation of unwaivable attenuation
 * (re-scoping is a new collaboration, not a mutation). Idempotent re-set of the
 * SAME boundary is allowed. The circle-scope comparison is order-INDEPENDENT
 * (`sameSet`); this is consistent with the DB trigger because the store writes the
 * boundary CANONICALIZED (circle scope sorted, see canonicalAuthorityBoundary), so the
 * trigger's whole-jsonb comparison only ever sees canonical values and is effectively
 * set-equality too. Pure.
 */
export function canSetAuthorityBoundary(
  record: CollaborationRecord,
  next: AuthorityBoundary,
): { allowed: boolean; reason: string } {
  if (record.authorityBoundary === null) return { allowed: true, reason: 'boundary not yet set' }
  const same =
    record.authorityBoundary.actionScope === next.actionScope &&
    sameSet(record.authorityBoundary.circleScope, next.circleScope)
  return same
    ? { allowed: true, reason: 'idempotent re-set of the same boundary' }
    : {
        allowed: false,
        reason:
          'A9: authority_boundary is set-once at selection — a different boundary is not a mutation ' +
          '(re-scoping is a new collaboration; self-expansion is impossible, unwaivable by trust level)',
      }
}

/**
 * Write-once guard for the L4 audit result (A7 readable-not-modifiable). The result
 * is written ONCE by the out-of-band audit; a second, different write is forbidden.
 * Idempotent re-write of the identical result is allowed. Pure.
 *
 * The identity check is ORDER-INDEPENDENT (`stableStringify`) — the stored value is
 * re-read from a jsonb column, and Postgres does NOT preserve object key order, so a
 * byte-order comparison against a freshly-resolved result would wrongly refuse an
 * IDENTICAL re-write after a storage round-trip (the S7-review MEDIUM). This matches
 * the DB write-once trigger, whose `IS DISTINCT FROM` on an array-free jsonb object is
 * itself key-order-independent. A DIFFERENT result is still refused (the safe
 * direction is preserved — the guard never lets a mutation through).
 */
export function canSetL4AuditResult(
  record: CollaborationRecord,
  next: L4AuditResult,
): { allowed: boolean; reason: string } {
  if (record.l4AuditResult === null) return { allowed: true, reason: 'L4 result not yet written' }
  const same = stableStringify(record.l4AuditResult) === stableStringify(next)
  return same
    ? { allowed: true, reason: 'idempotent re-write of the identical L4 result' }
    : {
        allowed: false,
        reason:
          'A7: l4_audit_result is readable-not-modifiable — written once by the out-of-band audit; ' +
          'the orchestrator (and any later write) cannot modify it',
      }
}

function sameSet(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false
  const sb = new Set(b)
  return a.every((x) => sb.has(x))
}

/**
 * Order-independent structural serializer: sorts object keys recursively (preserving
 * array order). Used by canSetL4AuditResult so a value re-read from jsonb (whose key
 * order Postgres does not preserve) compares equal to the same value freshly resolved.
 * Pure.
 */
function stableStringify(v: unknown): string {
  if (v === null || typeof v !== 'object') return JSON.stringify(v) ?? 'null'
  if (Array.isArray(v)) return '[' + v.map(stableStringify).join(',') + ']'
  const obj = v as Record<string, unknown>
  return (
    '{' +
    Object.keys(obj)
      .sort()
      .map((k) => JSON.stringify(k) + ':' + stableStringify(obj[k]))
      .join(',') +
    '}'
  )
}

/** Validate a collaboration record's structural shape (defensive; the store reads
 *  rows from the DB). Pure. */
export function validateCollaborationRecord(input: unknown): input is CollaborationRecord {
  if (typeof input !== 'object' || input === null) return false
  const r = input as Record<string, unknown>
  return (
    r.schema === 'trust-collaboration-record-v1' &&
    typeof r.orchestratorAgentId === 'string' &&
    typeof r.taskRef === 'string' &&
    (r.candidateAgentId === null || typeof r.candidateAgentId === 'string') &&
    (r.status === 'open' || r.status === 'finalized' || r.status === 'escalated') &&
    Array.isArray(r.independenceDeficits)
  )
}

/** Convenience: the cardinal + oversight domains a delegation event may target
 *  (re-exported for the battery / callers). */
export const DELEGATION_DOMAINS: readonly VirtueTrustDomain[] = ['oversight', 'dikaiosyne'] as const

/** A VirtueDomain the sub-agent's ordinary justice pipeline reduces (context only). */
export const SUBAGENT_JUSTICE_DOMAIN: VirtueDomain = 'dikaiosyne'
