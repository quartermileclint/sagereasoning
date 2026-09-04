/**
 * s8-harness-integration.test.ts — Trust Layer S8 battery: the reference-harness
 * seams. Plain-assertion tsx (project convention; no Jest).
 *
 * INSTRUMENT-FIDELITY SHAPED (KG-EX1 — never beats-bare): asserts the harness
 * COMPOSES the S1–S7 pieces correctly — the discernment→collaboration→L4→
 * trust-event chain fires end-to-end on synthetic fixtures, the channel
 * classifications hold (MEASURE everywhere; never-self-report structural;
 * R18f-parallel derivation), and flag-off is a pure no-op (no extraction, no DB).
 *
 * Sections:
 *   1 — harness-extractors: the REAL L4 trace extractor (fake Layer-1/sign deps)
 *   2 — harness-extractors: the REAL discernment (circle-alignment) extractor
 *   3 — harness-integration: pure helpers (mapping ctx, boundary injection,
 *       parallel signal resolution, the justice-violation reader)
 *   4 — runSpawnDiscernment end-to-end (fake supabase + fake extractors)
 *   5 — readTrustVerdict (profile → S3 aggregate → S4 MEASURE recommendation)
 *   6 — closeDelegation (A9 cases + A8 habitual; R18f-parallel; idempotency)
 *   7 — the /api/practice/discernment route handler (injected deps)
 */

import { NextRequest } from 'next/server'

import type { Layer1Schema } from '@/lib/translation-sandwich/layer1-extractor'
import type { Layer2Assessment } from '@/lib/translation-sandwich/layer2-mechanisms'
import type { SignedLayer2Assessment } from '@/lib/translation-sandwich/layer2-signer'

import {
  makeRealL4TraceExtractor,
  makeRealDiscernmentExtractor,
  signedAssessmentRef,
  l4TraceRefFor,
  type ExtractionLike,
  type RealExtractorDeps,
} from '../harness-extractors'
import {
  deriveL4MappingContext,
  renderAuthorityBoundaryInjection,
  resolveCandidateSignalsParallel,
  runSpawnDiscernment,
  readTrustVerdict,
  closeDelegation,
  assessmentShowsJusticeViolation,
  type SpawnDiscernmentArgs,
} from '../harness-integration'
import {
  runDiscernment,
  type DiscernmentDeployerConfig,
  type DiscernmentExtractor,
  type DiscernmentInput,
} from '../discernment-engine'
import type { L4TraceExtractor, OrchestratorReasoningTrace } from '../l4-passion-audit'
import { authorityBoundaryFromTask } from '../collaboration-record'
import type { CandidateProfile, OrchestratorProfile, TaskProfile } from '../profiles'
import { TRUST_CORE_ENV_VAR } from '../trust-core-flag'
import { makeFakeSupabase } from './fake-supabase'
import {
  runDiscernmentPost,
  runDiscernmentGet,
  type DiscernmentRouteDeps,
  type HarnessExtractorSet,
} from '@/app/api/practice/discernment/handler'

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
function eq<T>(a: T, b: T, label: string): void {
  assert(a === b, `${label} (got ${JSON.stringify(a)}, want ${JSON.stringify(b)})`)
}

const NOW = new Date('2026-07-10T00:00:00.000Z')
const RECENT_ISO = '2026-07-01T00:00:00.000Z'

// ── Layer-1 fixture builder ──────────────────────────────────────────────────
function l1(overrides?: Partial<Layer1Schema>): Layer1Schema {
  return {
    version: 'layer1-schema-v1',
    passions_present: [],
    control_filter_elements: [],
    oikeiosis_circles_engaged: [],
    value_categories_at_stake: [],
    kathekon_factors: [],
    urgency_indicators: [],
    causal_stage_evidence: [],
    eupatheia_candidates: [],
    stated_concern_targets: [],
    stated_equanimity_signals: [],
    motivation_stated: false,
    motivation_evidence: '',
    element_fusion_detected: { fused: false, fused_concerns: [] },
    ambiguity_notes: [],
    ...(overrides ?? {}),
  } as Layer1Schema
}

// Fake Layer-1/Layer-2/signer deps. The fake sign produces a deterministic
// signature per call so refs are stable + distinct.
function fakeDeps(schema: Layer1Schema | ((input: string) => Layer1Schema)): RealExtractorDeps & {
  calls: string[]
} {
  const calls: string[] = []
  let sigCounter = 0
  return {
    calls,
    extract: async (params): Promise<ExtractionLike> => {
      calls.push(params.input)
      const s = typeof schema === 'function' ? schema(params.input) : schema
      return { schema: s, usage: { input_tokens: 100, output_tokens: 50 } }
    },
    apply: (_s) =>
      ({ katorthoma_proximity: 'deliberate', oikeiosis: { relevant_circles: [], deliberation_notes: '' } }) as unknown as Layer2Assessment,
    sign: (assessment) => ({ assessment, signature: `fake-sig-${sigCounter++}`, key_id: 'test-key' }),
  }
}

const EMPTY_CTX = { selectionPatternMatchedChosen: false, priorInteractionWithChosen: false }
const TRACE: OrchestratorReasoningTrace = {
  schema: 'trust-orchestrator-reasoning-trace-v1',
  reasoningTrace: 'I compared the two retrieval candidates and weighed their records before choosing.',
}

// ── Section 1 — the REAL L4 trace extractor ──────────────────────────────────
async function section1(): Promise<void> {
  // 1.x refs are deterministic + linkable.
  const signed: SignedLayer2Assessment = {
    assessment: {} as Layer2Assessment,
    signature: 'abc',
    key_id: 'k1',
  }
  eq(signedAssessmentRef(signed), signedAssessmentRef(signed), '1.1 signedAssessmentRef deterministic')
  assert(signedAssessmentRef(signed).startsWith('sig:k1:'), '1.2 ref carries prefix + key id')
  assert(l4TraceRefFor(signed).startsWith('l4:k1:'), '1.3 l4 ref carries l4 prefix')
  assert(
    l4TraceRefFor(signed).slice(3) === signedAssessmentRef(signed).slice(4),
    '1.4 same digest under both prefixes (recomputable linkage)',
  )

  // 1.5 empty trace throws (never self-report; no fabricated audit).
  const d1 = fakeDeps(l1())
  const ext1 = makeRealL4TraceExtractor(EMPTY_CTX, d1)
  let threwEmpty = false
  try {
    await ext1.extractL4Signals({ trace: { ...TRACE, reasoningTrace: '   ' } })
  } catch {
    threwEmpty = true
  }
  eq(threwEmpty, true, '1.5 blank trace → throws (audit-unavailable → HOLD)')
  eq(d1.calls.length, 0, '1.6 blank trace → NO extraction call')

  // 1.7 clean trace → no signals; artifact captured; traceRef matches the envelope.
  const d2 = fakeDeps(l1())
  const ext2 = makeRealL4TraceExtractor(EMPTY_CTX, d2)
  const clean = await ext2.extractL4Signals({ trace: TRACE })
  eq(clean.signals.priorPreferenceFormed, false, '1.7 clean trace → Q4.1 off')
  eq(clean.signals.stakeInOutcome, false, '1.8 clean trace → Q4.2 off')
  eq(clean.signals.resolutionBeforeComplete, false, '1.9 clean trace → Q4.3 off')
  eq(ext2.artifacts.length, 1, '1.10 signed artifact captured')
  eq(clean.traceRef, l4TraceRefFor(ext2.artifacts[0].signed), '1.11 traceRef ⇔ envelope (recomputable)')
  eq(ext2.usage.calls, 1, '1.12 usage accumulates')

  // 1.13 seeded passions/stages map to signals (the same-engine reading).
  const flagged = l1({
    passions_present: [
      { root_passion: 'epithumia', sub_species: null, evidence: 'I want the familiar one' },
      { root_passion: 'phobos', sub_species: null, evidence: 'afraid the other fails' },
    ] as Layer1Schema['passions_present'],
    causal_stage_evidence: [{ stage: 'horme', evidence: 'I committed' }] as Layer1Schema['causal_stage_evidence'],
  })
  const ext3 = makeRealL4TraceExtractor(EMPTY_CTX, fakeDeps(flagged))
  const hot = await ext3.extractL4Signals({ trace: TRACE })
  eq(hot.signals.priorPreferenceFormed, true, '1.13 epithumia → Q4.1')
  eq(hot.signals.stakeInOutcome, true, '1.14 phobos (aversive) → Q4.2 (valence-neutral)')
  eq(hot.signals.resolutionBeforeComplete, true, '1.15 horme → Q4.3')

  // 1.16 the mapping context is honored (pattern-match fires Q4.1 with no passions).
  const ext4 = makeRealL4TraceExtractor(
    { selectionPatternMatchedChosen: true, priorInteractionWithChosen: false },
    fakeDeps(l1()),
  )
  const ctxHit = await ext4.extractL4Signals({ trace: TRACE })
  eq(ctxHit.signals.priorPreferenceFormed, true, '1.16 selection-pattern match → Q4.1 (profile-derived, not self-report)')

  // 1.17 Tier-1 short-circuit throws (an ambiguous trace cannot be cleanly audited).
  const d5 = fakeDeps(l1())
  d5.apply = () =>
    ({ tier1_trigger: { trigger_code: 'TEMPORAL_AMBIGUITY', question_text: 'q', stem_id: null, slots: {} } }) as never
  const ext5 = makeRealL4TraceExtractor(EMPTY_CTX, d5)
  let threwTier1 = false
  try {
    await ext5.extractL4Signals({ trace: TRACE })
  } catch (e) {
    threwTier1 = (e as Error).message.includes('Tier-1')
  }
  eq(threwTier1, true, '1.17 Tier-1 short-circuit → throws (HOLD, never a fabricated pass)')

  // 1.18 signing failure throws (no verifiable artifact ⇒ no audit result).
  const d6 = fakeDeps(l1())
  d6.sign = () => {
    throw new Error('SUBSTRATE_LAYER2_SIGNING_KEY is not set')
  }
  const ext6 = makeRealL4TraceExtractor(EMPTY_CTX, d6)
  let threwSign = false
  try {
    await ext6.extractL4Signals({ trace: TRACE })
  } catch {
    threwSign = true
  }
  eq(threwSign, true, '1.18 signing failure → throws (fail toward HOLD)')
  eq(ext6.artifacts.length, 0, '1.19 no artifact on signing failure')
}

// ── Section 2 — the REAL discernment (circle-alignment) extractor ────────────
async function section2(): Promise<void> {
  const circles = (names: string[]) =>
    l1({
      oikeiosis_circles_engaged: names.map((n) => ({ circle: n, evidence: 'e' })) as Layer1Schema['oikeiosis_circles_engaged'],
    })

  // 2.1 empty purpose throws (structural default applies at the S6 seam).
  const extA = makeRealDiscernmentExtractor(fakeDeps(circles(['cosmopolis'])))
  let threw = false
  try {
    await extA.assessCircleAlignment({ candidatePurpose: '  ', taskCircles: ['requesting-user'] })
  } catch {
    threw = true
  }
  eq(threw, true, '2.1 empty purpose → throws (structural default)')

  // 2.2 no extractable circles throws (unreadable → structural default).
  const extB = makeRealDiscernmentExtractor(fakeDeps(circles([])))
  threw = false
  try {
    await extB.assessCircleAlignment({ candidatePurpose: 'do things', taskCircles: ['x'] })
  } catch {
    threw = true
  }
  eq(threw, true, '2.2 no circles extracted → throws (structural default)')

  // 2.3 POSITIVE misalignment: self-only purpose vs an other-directed task.
  const extC = makeRealDiscernmentExtractor(fakeDeps(circles(['self_preservation'])))
  const mis = await extC.assessCircleAlignment({
    candidatePurpose: 'maximize my own uptime',
    taskCircles: ['requesting-user'],
  })
  eq(mis.alignment, 'misaligned', '2.3 self-only purpose + other-directed task → misaligned (dikaiosyne risk)')

  // 2.4 self-only purpose vs a SELF task circle → aligned (no positive evidence).
  const extD = makeRealDiscernmentExtractor(fakeDeps(circles(['self_preservation'])))
  const selfTask = await extD.assessCircleAlignment({
    candidatePurpose: 'maintain my own state',
    taskCircles: ['self'],
  })
  eq(selfTask.alignment, 'aligned', '2.4 self purpose + self task → aligned')

  // 2.5 wider purpose → aligned regardless of task-circle naming.
  const extE = makeRealDiscernmentExtractor(fakeDeps(circles(['local_community', 'cosmopolis'])))
  const wide = await extE.assessCircleAlignment({
    candidatePurpose: 'serve the community honestly',
    taskCircles: ['customers', 'recipient'],
  })
  eq(wide.alignment, 'aligned', '2.5 other-directed purpose → aligned (no positive misalignment evidence)')

  // 2.6 unknown extracted circle names are ignored (only the canonical vocabulary maps).
  const extF = makeRealDiscernmentExtractor(fakeDeps(circles(['weird_circle'])))
  threw = false
  try {
    await extF.assessCircleAlignment({ candidatePurpose: 'p', taskCircles: ['x'] })
  } catch {
    threw = true
  }
  eq(threw, true, '2.6 only non-canonical circles → unreadable → throws (structural default)')

  // 2.7 assessConditionMatch is deliberately ABSENT (PR15 — the structural Q2.2
  // default stands; no bespoke LLM contract).
  eq(
    (extF as DiscernmentExtractor).assessConditionMatch,
    undefined,
    '2.7 assessConditionMatch omitted (disclosed election)',
  )
}

// ── Shared discernment fixtures (the S6 battery's shapes) ───────────────────
const deployer: DiscernmentDeployerConfig = {
  functionTypeProfiles: {
    'data-retrieval': { functionType: 'data-retrieval', domainWeights: { phronesis: 3, dikaiosyne: 1, andreia: 0, sophrosyne: 1 } },
  },
}
const orchestrator: OrchestratorProfile = {
  schema: 'trust-orchestrator-profile-v1',
  agentId: 'ns:orch@v1',
  currentKathekonta: ['serve the user honestly'],
  examinationCapacity: { corroborationCheckAvailable: true, canReExamine: true, maxDepth: 'standard' },
  circle: ['requesting-user', 'recipient'],
  selectionPatterns: [{ pattern: 'prefers cand-strong for retrieval' }],
}
const retrievalTask: TaskProfile = {
  schema: 'trust-task-profile-v1',
  functionType: 'data-retrieval',
  circlesServed: ['requesting-user'],
  conditions: ['read-only'],
  outputRequirements: ['structured verdict'],
  justiceSurface: { present: false, nonConsentingCircles: [] },
}
const strongRetriever: CandidateProfile = {
  schema: 'trust-candidate-profile-v1',
  agentId: 'ns:strong@v1',
  role: 'retriever',
  capabilityScope: ['data-retrieval'],
  credentialCoverage: [
    { domain: 'phronesis', functionType: 'data-retrieval', coverageStatus: 'continuous', demonstratedProximity: 'principled' },
  ],
  performanceHistory: [{ domain: 'phronesis', proximity: 'principled', conditions: ['read-only'], occurredAt: RECENT_ISO }],
  outputFormat: { emitsSignedTrace: true, emitsStructuredVerdict: true, statesUncertainty: true },
  purpose: 'retrieve records for the requesting user',
  priorInteraction: { interactions: 2, isDataNotCredential: true },
}

function spawnInput(): DiscernmentInput {
  return {
    task: retrievalTask,
    candidates: [{ candidateRef: 'cand-strong', profile: strongRetriever }],
    orchestrator,
    deployer,
  }
}

function noopDiscernmentExtractor(): DiscernmentExtractor & { calls: number } {
  const ext = {
    calls: 0,
    async assessCircleAlignment() {
      ext.calls++
      return { alignment: 'aligned' as const }
    },
  }
  return ext
}

function fakeL4Extractor(flagging: boolean): L4TraceExtractor & { calls: number } {
  const ext = {
    calls: 0,
    async extractL4Signals() {
      ext.calls++
      return {
        signals: {
          priorPreferenceFormed: flagging,
          stakeInOutcome: false,
          resolutionBeforeComplete: false,
        },
        traceRef: 'l4:test-key:deadbeef',
      }
    },
  }
  return ext
}

// ── Section 3 — pure helpers ─────────────────────────────────────────────────
function section3(): void {
  // deriveL4MappingContext.
  const ctx1 = deriveL4MappingContext(orchestrator, {
    candidateRef: 'cand-strong',
    agentId: 'ns:strong@v1',
    profile: strongRetriever,
  })
  eq(ctx1.selectionPatternMatchedChosen, true, '3.1 pattern substring matches the chosen ref')
  eq(ctx1.priorInteractionWithChosen, true, '3.2 prior-interaction record (data, not credential) → ctx')
  const ctx2 = deriveL4MappingContext(orchestrator, { candidateRef: 'cand-other', agentId: null, profile: null })
  eq(ctx2.selectionPatternMatchedChosen, false, '3.3 no pattern match for a different candidate')
  eq(ctx2.priorInteractionWithChosen, false, '3.4 no profile → no prior interaction')

  // renderAuthorityBoundaryInjection — declarative scope; the justice note briefs.
  const boundary = authorityBoundaryFromTask(retrievalTask)
  const inj = renderAuthorityBoundaryInjection(boundary, retrievalTask)
  assert(inj.includes('delegated authority boundary (A9)'), '3.5 injection carries the A9 header')
  assert(inj.includes('data-retrieval'), '3.6 injection names the action scope')
  assert(inj.includes('requesting-user'), '3.7 injection names the circle scope')
  assert(!inj.includes('Justice surface'), '3.8 no justice note when the task has none')
  assert(inj.includes('cannot be self-authorized'), '3.9 the A9 no-self-expansion line')
  const justiceTask: TaskProfile = {
    ...retrievalTask,
    justiceSurface: { present: true, nonConsentingCircles: ['non-consenting-subject'], note: 'no opt-in' },
  }
  const inj2 = renderAuthorityBoundaryInjection(authorityBoundaryFromTask(justiceTask), justiceTask)
  assert(inj2.includes('Justice surface'), '3.10 justice note present ⇒ the sub-agent is BRIEFED (A9 case-1 mechanism)')
  assert(inj2.includes('non-consenting-subject'), '3.11 justice note names the circle')
  // Channel law: the injection asks the sub-agent to fetch/send NOTHING.
  assert(!/\b(POST|fetch|call the|endpoint|credential)\b/i.test(inj2), '3.12 injection carries no outbound instruction')

  // assessmentShowsJusticeViolation — narrow + verifiable.
  const violated = {
    oikeiosis: {
      relevant_circles: [
        { circle: 'recipient', obligation_assessment: { status: 'violated', justification: 'x' } },
      ],
      deliberation_notes: '',
    },
  } as unknown as Layer2Assessment
  const met = {
    oikeiosis: {
      relevant_circles: [{ circle: 'recipient', obligation_assessment: { status: 'met', justification: 'x' } }],
      deliberation_notes: '',
    },
  } as unknown as Layer2Assessment
  const flooredOnly = {
    oikeiosis: { relevant_circles: [], deliberation_notes: '' },
    proximity_floors: { base: 'deliberate', dikaiosyne: 'reflexive', andreia: null, sophrosyne: null, aggregate: 'reflexive', basis: 'b' },
  } as unknown as Layer2Assessment
  eq(assessmentShowsJusticeViolation(violated), true, '3.13 violated circle → violation')
  eq(assessmentShowsJusticeViolation(met), false, '3.14 met circle → no violation')
  eq(assessmentShowsJusticeViolation(flooredOnly), false, '3.15 floor without a violated circle → NOT a demonstrated failure (under-emit, never fabricate)')
}

// ── Section 3b — parallel signal resolution mirrors the S6 seam ──────────────
async function section3b(): Promise<void> {
  const input = spawnInput()

  // Resolution populates circleAlignment; runDiscernment on the resolved input
  // equals the pure engine on the same resolved input (same engine, no bypass).
  const ext = noopDiscernmentExtractor()
  const resolved = await resolveCandidateSignalsParallel(input, ext)
  eq(ext.calls, 1, '3b.1 one alignment read per profiled candidate')
  eq(resolved.candidates[0].resolvedSignals?.circleAlignment, 'aligned', '3b.2 resolved signal populated')
  const a = runDiscernment(resolved)
  const b = runDiscernment(resolved)
  eq(JSON.stringify(a), JSON.stringify(b), '3b.3 deterministic engine on resolved input')

  // A throwing extractor falls back to the structural default (never blocks).
  const throwing: DiscernmentExtractor = {
    async assessCircleAlignment() {
      throw new Error('extraction outage')
    },
  }
  const fellBack = await resolveCandidateSignalsParallel(input, throwing)
  eq(fellBack.candidates[0].resolvedSignals?.circleAlignment, undefined, '3b.4 extractor throw → structural default')
  assert(runDiscernment(fellBack).recommendation.recommendedAgentRef !== undefined, '3b.5 discernment still runs')

  // Un-profiled candidates are never extracted (A6 — nothing to read).
  const unprofiled: DiscernmentInput = {
    ...input,
    candidates: [{ candidateRef: 'cand-unknown', profile: null }],
  }
  const ext2 = noopDiscernmentExtractor()
  await resolveCandidateSignalsParallel(unprofiled, ext2)
  eq(ext2.calls, 0, '3b.6 un-profiled → no extraction call')

  // Already-resolved signals are not re-read.
  const preResolved: DiscernmentInput = {
    ...input,
    candidates: [
      { candidateRef: 'cand-strong', profile: strongRetriever, resolvedSignals: { circleAlignment: 'misaligned' } },
    ],
  }
  const ext3 = noopDiscernmentExtractor()
  const kept = await resolveCandidateSignalsParallel(preResolved, ext3)
  eq(ext3.calls, 0, '3b.7 pre-resolved signal → no re-read')
  eq(kept.candidates[0].resolvedSignals?.circleAlignment, 'misaligned', '3b.8 pre-resolved value kept')
}

// ── Section 4 — runSpawnDiscernment end-to-end ───────────────────────────────
async function section4(): Promise<void> {
  const prior = process.env[TRUST_CORE_ENV_VAR]

  // Flag-OFF: dark — NO extractor invocation (no live LLM call), NO DB touch.
  delete process.env[TRUST_CORE_ENV_VAR]
  const offFake = makeFakeSupabase()
  const offDisc = noopDiscernmentExtractor()
  const offL4 = fakeL4Extractor(false)
  const dark = await runSpawnDiscernment({
    taskRef: 'task-dark',
    input: spawnInput(),
    trace: TRACE,
    extractors: { discernment: offDisc, l4: () => offL4 },
    now: NOW,
    client: offFake.client,
  })
  eq(dark.dark, true, '4.1 flag-off → dark')
  eq(offDisc.calls + offL4.calls, 0, '4.2 flag-off → NO extractor calls')
  eq(offFake.tables.collaboration_records.length, 0, '4.3 flag-off → no record')
  eq(dark.mode, 'measure', '4.4 MEASURE invariant')

  // Flag-ON: the full chain — discernment → open + boundary → L4 written → finalized.
  process.env[TRUST_CORE_ENV_VAR] = 'true'
  const fake = makeFakeSupabase()
  const l4clean = fakeL4Extractor(false)
  const outcome = await runSpawnDiscernment({
    taskRef: 'task-1',
    input: spawnInput(),
    trace: TRACE,
    ownerUserId: null,
    credentialRef: 'api_key:test',
    extractors: { discernment: noopDiscernmentExtractor(), l4: () => l4clean },
    now: NOW,
    client: fake.client,
  })
  eq(outcome.dark, false, '4.5 flag-on runs')
  eq(outcome.discernment?.recommendation.recommendedAgentRef, 'cand-strong', '4.6 recommendation')
  eq(outcome.chosen.candidateRef, 'cand-strong', '4.7 chosen defaults to the recommendation')
  eq(outcome.chosen.agentId, 'ns:strong@v1', '4.8 chosen agentId resolved from the profile')
  eq(outcome.selection?.committed, true, '4.9 collaboration record committed')
  const row = fake.tables.collaboration_records[0]
  eq(row.orchestrator_agent_id, 'ns:orch@v1', '4.10 record keyed to the orchestrator')
  eq(row.candidate_agent_id, 'ns:strong@v1', '4.11 record names the chosen candidate')
  assert(row.authority_boundary !== null, '4.12 A9 boundary set at selection')
  eq(outcome.l4?.commit.written, true, '4.13 L4 result written (out-of-band chain complete)')
  eq(row.status, 'finalized', '4.14 clean audit → finalization gate → finalized')
  assert(outcome.boundaryInjection?.includes('data-retrieval') === true, '4.15 boundary injection rendered')
  eq(outcome.mode, 'measure', '4.16 MEASURE invariant')

  // A flagging L4 at the (default) lower tier → HOLD → escalated (a RECORD, not a block).
  const fake2 = makeFakeSupabase()
  const outcome2 = await runSpawnDiscernment({
    taskRef: 'task-2',
    input: spawnInput(),
    trace: TRACE,
    extractors: { discernment: noopDiscernmentExtractor(), l4: () => fakeL4Extractor(true) },
    now: NOW,
    client: fake2.client,
  })
  eq(outcome2.l4?.outcome.finalization, 'hold', '4.17 lower-tier flag → HOLD')
  eq(fake2.tables.collaboration_records[0].status, 'escalated', '4.18 HOLD recorded as escalated (MEASURE)')

  // The orchestrator MAY choose differently (advisory recommendation).
  const fake3 = makeFakeSupabase()
  const twoCands: DiscernmentInput = {
    ...spawnInput(),
    candidates: [
      { candidateRef: 'cand-strong', profile: strongRetriever },
      { candidateRef: 'cand-unknown', profile: null },
    ],
  }
  const outcome3 = await runSpawnDiscernment({
    taskRef: 'task-3',
    input: twoCands,
    trace: TRACE,
    chosenCandidateRef: 'cand-unknown',
    extractors: { discernment: noopDiscernmentExtractor(), l4: () => fakeL4Extractor(false) },
    now: NOW,
    client: fake3.client,
  })
  eq(outcome3.chosen.candidateRef, 'cand-unknown', '4.19 explicit choice overrides the recommendation')
  eq(fake3.tables.collaboration_records[0].candidate_agent_id, 'cand-unknown', '4.20 un-profiled chosen → the ref is the record handle (disclosed)')

  // A failing L4 extractor → audit-unavailable → HOLD (never a fabricated pass).
  const fake4 = makeFakeSupabase()
  const throwingL4: L4TraceExtractor = {
    async extractL4Signals() {
      throw new Error('extraction outage')
    },
  }
  const outcome4 = await runSpawnDiscernment({
    taskRef: 'task-4',
    input: spawnInput(),
    trace: TRACE,
    extractors: { discernment: noopDiscernmentExtractor(), l4: () => throwingL4 },
    now: NOW,
    client: fake4.client,
  })
  eq(outcome4.l4?.outcome.status, 'audit-unavailable', '4.21 extractor outage → audit-unavailable')
  eq(outcome4.l4?.commit.written, false, '4.22 no fabricated L4 result')
  eq(fake4.tables.collaboration_records[0].status, 'escalated', '4.23 unavailable audit → held (escalated)')
  eq(fake4.tables.collaboration_records[0].l4_audit_result, null, '4.24 l4_audit_result stays null')

  // A9 (review fold G3): a record opened WITHOUT its authority boundary must never
  // finalize — the audit is computed but NOT committed (attenuation is unwaivable).
  const fake5 = makeFakeSupabase()
  const realFrom = fake5.client.from.bind(fake5.client)
  // Make the boundary patch (an update carrying authority_boundary) fail.
  ;(fake5.client as unknown as { from: (t: string) => unknown }).from = (table: string) => {
    const b = realFrom(table) as { update?: (o: Record<string, unknown>) => unknown }
    const origUpdate = b.update?.bind(b)
    if (origUpdate) {
      b.update = (obj: Record<string, unknown>) => {
        if ('authority_boundary' in obj) {
          return { eq: () => ({ eq: () => ({ then: (f: (v: unknown) => unknown) => f({ data: null, error: { code: 'XX000', message: 'boundary write failed' } }) }) }) }
        }
        return origUpdate(obj)
      }
    }
    return b
  }
  const l4spy = fakeL4Extractor(false)
  const partial = await runSpawnDiscernment({
    taskRef: 'task-nb',
    input: spawnInput(),
    trace: TRACE,
    extractors: { discernment: noopDiscernmentExtractor(), l4: () => l4spy },
    now: NOW,
    client: fake5.client,
  })
  eq(partial.selection?.boundarySet, false, '4.25 boundary write failed → boundarySet false')
  eq(l4spy.calls, 1, '4.26 the audit still RAN (the finding belongs on the record)')
  eq(partial.l4?.commit.committed, false, '4.27 but it was NOT committed')
  eq(partial.l4?.commit.statusSet, null, '4.28 no finalization status written')
  eq(fake5.tables.collaboration_records[0].status, 'open', '4.29 a boundary-less record NEVER finalizes (A9 unwaivable)')
  eq(fake5.tables.collaboration_records[0].l4_audit_result, null, '4.30 no L4 result on a boundary-less record')
  assert(partial.l4?.commit.note.includes('must not finalize') === true, '4.31 the refusal is stated honestly')

  // No record opened at all (attenuation anomaly) ⇒ the extractor is NOT invoked
  // (no wasted live LLM call) and nothing is written.
  const fake6 = makeFakeSupabase()
  const wideTask: TaskProfile = { ...retrievalTask, circlesServed: ['requesting-user', 'circle-the-orchestrator-does-not-hold'] }
  const l4spy2 = fakeL4Extractor(false)
  const anomaly = await runSpawnDiscernment({
    taskRef: 'task-anom',
    input: { ...spawnInput(), task: wideTask },
    trace: TRACE,
    extractors: { discernment: noopDiscernmentExtractor(), l4: () => l4spy2 },
    now: NOW,
    client: fake6.client,
  })
  eq(anomaly.selection?.opened, false, '4.32 A9 attenuation anomaly → record not opened')
  eq(l4spy2.calls, 0, '4.33 no record ⇒ extractor NOT invoked (no wasted LLM call)')
  eq(anomaly.l4?.outcome.status, 'audit-unavailable', '4.34 audit honestly unavailable')
  eq(fake6.tables.collaboration_records.length, 0, '4.35 nothing written')

  if (prior === undefined) delete process.env[TRUST_CORE_ENV_VAR]
  else process.env[TRUST_CORE_ENV_VAR] = prior
}

// ── Section 5 — readTrustVerdict ─────────────────────────────────────────────
function seedTrustState(
  fake: ReturnType<typeof makeFakeSupabase>,
  agentId: string,
  domain: string,
  earned: string,
  opts?: { justice?: boolean },
): void {
  fake.tables.agent_trust_state.push({
    agent_id: agentId,
    virtue_domain: domain,
    owner_user_id: null,
    credential_ref: null,
    earned_level: earned,
    profile_prior: 'habitual',
    volatility_rating: 'low',
    last_domain_activity_at: RECENT_ISO,
    reflect_last_honest_at: null,
    justice_floor_active: opts?.justice === true,
    coverage_status: 'continuous',
    updated_at: RECENT_ISO,
    retain_until: '2026-10-07T00:00:00.000Z',
  })
}

async function section5(): Promise<void> {
  const prior = process.env[TRUST_CORE_ENV_VAR]

  // Flag-OFF → dark (no DB read).
  delete process.env[TRUST_CORE_ENV_VAR]
  const offVerdict = await readTrustVerdict('ns:orch@v1', { taskHasJusticeSurface: false, now: NOW, client: makeFakeSupabase().client })
  eq(offVerdict.dark, true, '5.1 flag-off → dark')
  eq(offVerdict.recommendation, null, '5.2 flag-off → no recommendation')

  process.env[TRUST_CORE_ENV_VAR] = 'true'

  // No evidence → aggregate null → S4 pause + escalate (never a silent proceed).
  const empty = await readTrustVerdict('ns:nobody@v1', { taskHasJusticeSurface: false, now: NOW, client: makeFakeSupabase().client })
  eq(empty.aggregate?.level ?? null, null, '5.3 no evidence → aggregate null')
  eq(empty.recommendation?.action, 'pause', '5.4 null aggregate → pause')
  eq(empty.recommendation?.followUp, 'escalate', '5.5 null aggregate → escalate (insufficient evidence)')
  eq(empty.recommendation?.enforced, false, '5.6 MEASURE — never enforced')

  // Seeded domains → the minimum-domain aggregate + the S4 table row.
  const fake = makeFakeSupabase()
  seedTrustState(fake, 'ns:orch@v1', 'phronesis', 'principled')
  seedTrustState(fake, 'ns:orch@v1', 'dikaiosyne', 'deliberate')
  const verdict = await readTrustVerdict('ns:orch@v1', { taskHasJusticeSurface: false, now: NOW, client: fake.client })
  eq(verdict.aggregate?.level, 'deliberate', '5.7 minimum-domain aggregate (weakest wins)')
  eq(verdict.aggregate?.limitingDomain, 'dikaiosyne', '5.8 limiting domain surfaced')
  eq(verdict.recommendation?.action, 'proceed', '5.9 deliberate + no justice surface → log + continue (proceed)')
  eq(verdict.recommendation?.mode, 'measure', '5.10 MEASURE invariant')

  // A worse profile yields a worse recommendation (worse-scores-worse fidelity).
  const fakeBad = makeFakeSupabase()
  seedTrustState(fakeBad, 'ns:bad@v1', 'phronesis', 'reflexive')
  const bad = await readTrustVerdict('ns:bad@v1', { taskHasJusticeSurface: false, now: NOW, client: fakeBad.client })
  eq(bad.recommendation?.action, 'do-not-proceed', '5.11 reflexive aggregate → do-not-proceed (worse scores worse)')

  // The oversight domain is excluded from the CARDINAL action aggregate.
  const fakeOv = makeFakeSupabase()
  seedTrustState(fakeOv, 'ns:ov@v1', 'oversight', 'principled')
  const ov = await readTrustVerdict('ns:ov@v1', { taskHasJusticeSurface: false, now: NOW, client: fakeOv.client })
  eq(ov.aggregate?.level ?? null, null, '5.12 oversight-only evidence → cardinal aggregate stays null')

  // ── P1 / D5 (2026-09-04) ──────────────────────────────────────────────────
  // D5: the flag is now live-wired, not silently defaulted. The SAME seeded
  // profile, read with taskHasJusticeSurface=true and no S3 obligation routing,
  // must route to 'unevaluated' ⇒ do-not-proceed. Before D5 this call was
  // unreachable (the flag was never supplied) — this pin proves the question is
  // now actually asked, and documents why the two live callers state `false`.
  const fakeD5 = makeFakeSupabase()
  seedTrustState(fakeD5, 'ns:d5@v1', 'phronesis', 'principled')
  seedTrustState(fakeD5, 'ns:d5@v1', 'dikaiosyne', 'deliberate')
  const d5off = await readTrustVerdict('ns:d5@v1', { taskHasJusticeSurface: false, now: NOW, client: fakeD5.client })
  const d5on = await readTrustVerdict('ns:d5@v1', { taskHasJusticeSurface: true, now: NOW, client: fakeD5.client })
  eq(d5off.recommendation?.justiceSurface, 'none', "5.13 D5: false ⇒ 'none' (the question is not asked, and says so)")
  eq(d5on.recommendation?.justiceSurface, 'unevaluated', "5.14 D5: true without routing ⇒ 'unevaluated' — the flag REACHES the seam")
  eq(d5on.recommendation?.action, 'do-not-proceed', '5.15 D5: … and the table responds (why live task-agnostic callers must state false)')
  assert(d5off.recommendation?.action !== d5on.recommendation?.action, '5.16 D5 non-vacuity: the flag changes the outcome')

  // P1: the standing verdict is RE-LABELLED as ranging over the aggregate, and
  // discloses the flag value it was read with — it must never be mistaken for
  // the per-action decision-table input.
  assert(d5off.basis.includes('ranges over the AGGREGATE trust state'), '5.17 P1 re-label present in basis')
  assert(d5off.basis.includes('not the per-action decision-table input'), '5.18 P1 re-label names what it is NOT')
  assert(d5off.basis.includes('taskHasJusticeSurface=false'), '5.19 basis discloses the flag value (false)')
  assert(d5on.basis.includes('taskHasJusticeSurface=true'), '5.20 basis discloses the flag value (true)')
  assert(empty.basis.includes('ranges over the AGGREGATE'), '5.21 re-label also on the null-aggregate branch')

  if (prior === undefined) delete process.env[TRUST_CORE_ENV_VAR]
  else process.env[TRUST_CORE_ENV_VAR] = prior
}

// ── Section 6 — closeDelegation ──────────────────────────────────────────────
function violatingSigned(sig: string): SignedLayer2Assessment {
  return {
    assessment: {
      oikeiosis: {
        relevant_circles: [
          { circle: 'recipient', obligation_assessment: { status: 'violated', justification: 'sent without consent' } },
        ],
        deliberation_notes: '',
      },
    } as unknown as Layer2Assessment,
    signature: sig,
    key_id: 'test-key',
  }
}

function seedCollab(fake: ReturnType<typeof makeFakeSupabase>, orch: string, task: string): void {
  fake.tables.collaboration_records.push({
    id: `cr-${orch}-${task}`,
    orchestrator_agent_id: orch,
    candidate_agent_id: 'cand-x',
    task_ref: task,
    owner_user_id: null,
    credential_ref: null,
    authority_boundary: null,
    l4_audit_result: null,
    habitual_stable_flag: null,
    independence_deficits: [],
    justice_failure_case: null,
    status: 'open',
    retain_until: '2026-10-07T00:00:00.000Z',
  })
}

async function section6(): Promise<void> {
  const prior = process.env[TRUST_CORE_ENV_VAR]
  const verifyAll = () => ({ valid: true })
  const verifyNone = () => ({ valid: false })

  // Flag-OFF → dark.
  delete process.env[TRUST_CORE_ENV_VAR]
  const offOut = await closeDelegation({
    orchestratorAgentId: 'o',
    taskRef: 't',
    client: makeFakeSupabase().client,
    verify: verifyAll,
  })
  eq(offOut.dark, true, '6.1 flag-off → dark')

  process.env[TRUST_CORE_ENV_VAR] = 'true'

  // No collaboration record → no events (record-anchored; never fabricate).
  const noRec = await closeDelegation({
    orchestratorAgentId: 'ns:orch@v1',
    taskRef: 'task-none',
    justiceFailure: {
      signedAssessments: [violatingSigned('s1')],
      surfaceIdentifiedAtSelection: true,
      subAgentBriefed: true,
      corroborationRun: true,
    },
    now: NOW,
    client: makeFakeSupabase().client,
    verify: verifyAll,
  })
  eq(noRec.recordFound, false, '6.2 no record → nothing')
  eq(noRec.delegationEventsEmitted, 0, '6.3 no record → no events')

  // Case 1 — identified + briefed → 1 oversight event (moderate).
  const f1 = makeFakeSupabase()
  seedCollab(f1, 'ns:orch@v1', 'task-c1')
  const c1 = await closeDelegation({
    orchestratorAgentId: 'ns:orch@v1',
    taskRef: 'task-c1',
    justiceFailure: {
      signedAssessments: [violatingSigned('s-c1')],
      surfaceIdentifiedAtSelection: true,
      subAgentBriefed: true,
      corroborationRun: true,
    },
    now: NOW,
    client: f1.client,
    verify: verifyAll,
  })
  eq(c1.justiceCase, 'case-1-identified-briefed', '6.4 A9 case 1 classified')
  eq(c1.delegationEventsEmitted, 1, '6.5 case 1 → 1 oversight event')
  eq(f1.tables.agent_trust_events[0].event_type, 'delegation-reflection-case-1', '6.6 event type')
  eq(f1.tables.agent_trust_events[0].virtue_domain, 'oversight', '6.7 oversight domain')
  assert(
    (f1.tables.collaboration_records[0].justice_failure_case as { case?: string } | null)?.case ===
      'case-1-identified-briefed',
    '6.8 reflection recorded on the collaboration record',
  )

  // Case 2 — catchable-not-run → 2 events (oversight + dikaiosyne, distinct correlations).
  const f2 = makeFakeSupabase()
  seedCollab(f2, 'ns:orch@v1', 'task-c2')
  const c2 = await closeDelegation({
    orchestratorAgentId: 'ns:orch@v1',
    taskRef: 'task-c2',
    justiceFailure: {
      signedAssessments: [violatingSigned('s-c2')],
      surfaceIdentifiedAtSelection: false,
      subAgentBriefed: false,
      corroborationRun: false,
    },
    now: NOW,
    client: f2.client,
    verify: verifyAll,
  })
  eq(c2.justiceCase, 'case-2-catchable-not-run', '6.9 A9 case 2 (default catchable — the conservative direction)')
  eq(c2.delegationEventsEmitted, 2, '6.10 case 2 fans to oversight + dikaiosyne')

  // Case 3 — genuinely uncatchable requires the EXPLICIT harm-absent flag.
  const f3 = makeFakeSupabase()
  seedCollab(f3, 'ns:orch@v1', 'task-c3')
  const c3 = await closeDelegation({
    orchestratorAgentId: 'ns:orch@v1',
    taskRef: 'task-c3',
    justiceFailure: {
      signedAssessments: [violatingSigned('s-c3')],
      surfaceIdentifiedAtSelection: false,
      subAgentBriefed: false,
      corroborationRun: true,
      harmAbsentFromActionText: true,
    },
    now: NOW,
    client: f3.client,
    verify: verifyAll,
  })
  eq(c3.justiceCase, 'case-3-uncatchable', '6.11 A9 case 3 only on explicit harm-absent')
  eq(c3.delegationEventsEmitted, 1, '6.12 case 3 → 1 FLAG event')
  eq(f3.tables.agent_trust_events[0].event_type, 'delegation-reflection-case-3', '6.13 flag event type')

  // R18f-parallel: unverified artifacts contribute NOTHING.
  const f4 = makeFakeSupabase()
  seedCollab(f4, 'ns:orch@v1', 'task-unv')
  const unv = await closeDelegation({
    orchestratorAgentId: 'ns:orch@v1',
    taskRef: 'task-unv',
    justiceFailure: {
      signedAssessments: [violatingSigned('s-unv')],
      surfaceIdentifiedAtSelection: true,
      subAgentBriefed: true,
      corroborationRun: true,
    },
    now: NOW,
    client: f4.client,
    verify: verifyNone,
  })
  eq(unv.justiceCase, null, '6.14 unverified artifact → no case')
  eq(unv.delegationEventsEmitted, 0, '6.15 unverified artifact → no events (R18f-parallel)')

  // A verified artifact WITHOUT a violated obligation → no events (never fabricate).
  const f5 = makeFakeSupabase()
  seedCollab(f5, 'ns:orch@v1', 'task-met')
  const metSigned: SignedLayer2Assessment = {
    assessment: {
      oikeiosis: {
        relevant_circles: [{ circle: 'recipient', obligation_assessment: { status: 'met', justification: 'ok' } }],
        deliberation_notes: '',
      },
    } as unknown as Layer2Assessment,
    signature: 's-met',
    key_id: 'test-key',
  }
  const met = await closeDelegation({
    orchestratorAgentId: 'ns:orch@v1',
    taskRef: 'task-met',
    justiceFailure: {
      signedAssessments: [metSigned],
      surfaceIdentifiedAtSelection: true,
      subAgentBriefed: true,
      corroborationRun: true,
    },
    now: NOW,
    client: f5.client,
    verify: verifyAll,
  })
  eq(met.delegationEventsEmitted, 0, '6.16 no violated obligation → no events')

  // Idempotency: a retried close emits ZERO new events (stable correlation ids) AND
  // reports the honest written count, not the submitted count (review fold G4).
  const again = await closeDelegation({
    orchestratorAgentId: 'ns:orch@v1',
    taskRef: 'task-c2',
    justiceFailure: {
      signedAssessments: [violatingSigned('s-c2')],
      surfaceIdentifiedAtSelection: false,
      subAgentBriefed: false,
      corroborationRun: false,
    },
    now: NOW,
    client: f2.client,
    verify: verifyAll,
  })
  eq(again.justiceCase, 'case-2-catchable-not-run', '6.17 retry classifies identically')
  eq(f2.tables.agent_trust_events.length, 2, '6.18 retry emits no duplicate events (idempotent correlations)')
  eq(again.delegationEventsEmitted, 0, '6.18b retry reports 0 WRITTEN (honest count, not events.length)')
  assert(again.basis.includes('idempotent re-fire'), '6.18c retry basis names the idempotent re-fire')

  // A8 habitual decision: proceed → the oversight event; hold → nothing.
  const f6 = makeFakeSupabase()
  seedCollab(f6, 'ns:orch@v1', 'task-h')
  const h1 = await closeDelegation({
    orchestratorAgentId: 'ns:orch@v1',
    taskRef: 'task-h',
    habitualDecision: { decision: 'proceed', escalatedAssessmentRef: 'sig:test-key:abc' },
    now: NOW,
    client: f6.client,
    verify: verifyAll,
  })
  eq(h1.habitualEventEmitted, true, '6.19 proceed-under-flag → A8 event emitted')
  eq(f6.tables.agent_trust_events[0].event_type, 'orchestrator-proceeds-under-habitual-flag', '6.20 A8 event type')
  const f7 = makeFakeSupabase()
  seedCollab(f7, 'ns:orch@v1', 'task-h2')
  const h2 = await closeDelegation({
    orchestratorAgentId: 'ns:orch@v1',
    taskRef: 'task-h2',
    habitualDecision: { decision: 'hold', escalatedAssessmentRef: 'sig:test-key:abc' },
    now: NOW,
    client: f7.client,
    verify: verifyAll,
  })
  eq(h2.habitualEventEmitted, false, '6.21 hold → no A8 event')
  const f8 = makeFakeSupabase()
  seedCollab(f8, 'ns:orch@v1', 'task-h3')
  const h3 = await closeDelegation({
    orchestratorAgentId: 'ns:orch@v1',
    taskRef: 'task-h3',
    habitualDecision: { decision: 'proceed', escalatedAssessmentRef: '   ' },
    now: NOW,
    client: f8.client,
    verify: verifyAll,
  })
  eq(h3.habitualEventEmitted, false, '6.22 blank escalated ref → no A8 event (never fabricated)')

  // A8 honest count on a deduped re-fire (review fold G4).
  const h1again = await closeDelegation({
    orchestratorAgentId: 'ns:orch@v1',
    taskRef: 'task-h',
    habitualDecision: { decision: 'proceed', escalatedAssessmentRef: 'sig:test-key:abc' },
    now: NOW,
    client: f6.client,
    verify: verifyAll,
  })
  eq(f6.tables.agent_trust_events.length, 1, '6.23 A8 retry writes no duplicate row')
  eq(h1again.habitualEventEmitted, false, '6.24 A8 retry reports NOT emitted (0 written — honest count)')

  if (prior === undefined) delete process.env[TRUST_CORE_ENV_VAR]
  else process.env[TRUST_CORE_ENV_VAR] = prior
}

// ── Section 7 — the route handler (injected deps) ────────────────────────────
function req(opts: { method: string; auth?: string; apiKey?: string; body?: unknown }): NextRequest {
  const headers: Record<string, string> = { 'content-type': 'application/json' }
  if (opts.auth) headers['authorization'] = opts.auth
  if (opts.apiKey) headers['x-api-key'] = opts.apiKey
  return new NextRequest('http://localhost/api/practice/discernment', {
    method: opts.method,
    headers,
    ...(opts.body !== undefined ? { body: JSON.stringify(opts.body) } : {}),
  })
}

function stubExtractorSet(): HarnessExtractorSet {
  return {
    extractors: { discernment: noopDiscernmentExtractor(), l4: () => fakeL4Extractor(false) },
    usage: () => ({ input_tokens: 0, output_tokens: 0, calls: 0 }),
    artifacts: () => [],
  }
}

function routeDeps(overrides?: Partial<DiscernmentRouteDeps>): DiscernmentRouteDeps & {
  spawnCalls: number
  handBackCalls: number
} {
  const state = { spawnCalls: 0, handBackCalls: 0 }
  const deps: DiscernmentRouteDeps & { spawnCalls: number; handBackCalls: number } = {
    get spawnCalls() {
      return state.spawnCalls
    },
    get handBackCalls() {
      return state.handBackCalls
    },
    isEnabled: () => true,
    validateCredential: async () =>
      ({
        valid: true,
        row: { id: 'cred-1', owner_user_id: 'owner-1', agent_id: 'ns:orch@v1' },
        capabilities: ['consult'],
      }) as never,
    makeExtractors: stubExtractorSet,
    spawn: async (args: SpawnDiscernmentArgs) => {
      state.spawnCalls++
      return {
        schema: 'trust-spawn-discernment-outcome-v1',
        dark: false,
        discernment: null,
        chosen: { candidateRef: args.chosenCandidateRef ?? 'cand-strong', agentId: null },
        boundaryInjection: 'boundary',
        selection: null,
        l4: null,
        mode: 'measure',
        basis: 'stub',
      }
    },
    handBack: async () => {
      state.handBackCalls++
      return {
        schema: 'trust-close-delegation-outcome-v1',
        dark: false,
        recordFound: true,
        justiceCase: null,
        delegationEventsEmitted: 0,
        habitualEventEmitted: false,
        mode: 'measure',
        basis: 'stub',
      }
    },
    trustVerdict: async () => ({
      schema: 'trust-verdict-v1',
      dark: false,
      profile: null,
      aggregate: null,
      recommendation: null,
      mode: 'measure',
      basis: 'stub',
    }),
    ...(overrides ?? {}),
  }
  return deps
}

function spawnBody(overrides?: Record<string, unknown>): Record<string, unknown> {
  return {
    phase: 'spawn',
    task_ref: 'task-1',
    orchestrator_agent_id: 'ns:orch@v1',
    task_profile: retrievalTask,
    orchestrator_profile: orchestrator,
    deployer_config: {
      function_type_profiles: {
        'data-retrieval': { domain_weights: { phronesis: 3, dikaiosyne: 1, andreia: 0, sophrosyne: 1 } },
      },
    },
    candidates: [{ candidate_ref: 'cand-strong', profile: strongRetriever }],
    reasoning_trace: { trace: 'my selection reasoning' },
    ...(overrides ?? {}),
  }
}

async function section7(): Promise<void> {
  // Flag-off → honest 503, zero work.
  const off = await runDiscernmentPost(
    req({ method: 'POST', auth: 'Bearer t', body: spawnBody() }),
    routeDeps({ isEnabled: () => false }),
  )
  eq(off.status, 503, '7.1 flag-off → 503')
  const offBody = (await off.json()) as { note?: string }
  assert((offBody.note ?? '').includes('SUBSTRATE_TRUST_CORE_ENABLED'), '7.2 503 names the flag')

  // Missing/invalid body → 400.
  const noPhase = await runDiscernmentPost(
    req({ method: 'POST', auth: 'Bearer t', body: { task_ref: 't', orchestrator_agent_id: 'a' } }),
    routeDeps(),
  )
  eq(noPhase.status, 400, '7.3 missing phase → 400')

  // No Bearer → 401 (Bearer-ONLY transport; X-Api-Key refused).
  const noAuth = await runDiscernmentPost(req({ method: 'POST', body: spawnBody() }), routeDeps())
  eq(noAuth.status, 401, '7.4 no Authorization → 401')
  const apiKeyOnly = await runDiscernmentPost(
    req({ method: 'POST', apiKey: 'sr_prac_x', body: spawnBody() }),
    routeDeps(),
  )
  eq(apiKeyOnly.status, 401, '7.5 X-Api-Key transport refused (Bearer-only)')

  // Invalid credential → single non-leaking 401.
  const badCred = await runDiscernmentPost(
    req({ method: 'POST', auth: 'Bearer bad', body: spawnBody() }),
    routeDeps({ validateCredential: async () => ({ valid: false, reason: 'invalid_token' }) as never }),
  )
  eq(badCred.status, 401, '7.6 invalid credential → 401')

  // Agent-scope mismatch → 403; a NULL-agent credential is refused on POST (the
  // trust-record poisoning guard — review fold F3).
  const scope = await runDiscernmentPost(
    req({ method: 'POST', auth: 'Bearer t', body: spawnBody({ orchestrator_agent_id: 'ns:other@v1' }) }),
    routeDeps(),
  )
  eq(scope.status, 403, '7.7 credential bound to a different agent → 403')
  const nullAgent = await runDiscernmentPost(
    req({ method: 'POST', auth: 'Bearer t', body: spawnBody() }),
    routeDeps({
      validateCredential: async () =>
        ({ valid: true, row: { id: 'cred-3', owner_user_id: null, agent_id: null }, capabilities: ['consult'] }) as never,
    }),
  )
  eq(nullAgent.status, 403, '7.7b NULL-agent credential → 403 on POST (poisoning guard; cannot write an arbitrary agent’s record)')

  // Invalid profiles → 400 with details.
  const badTask = await runDiscernmentPost(
    req({
      method: 'POST',
      auth: 'Bearer t',
      body: spawnBody({ task_profile: { schema: 'wrong' } }),
    }),
    routeDeps(),
  )
  eq(badTask.status, 400, '7.8 invalid task profile → 400')

  // A justice surface with no named circle is refused (the S5 validator's scoping gap).
  const badJustice = await runDiscernmentPost(
    req({
      method: 'POST',
      auth: 'Bearer t',
      body: spawnBody({
        task_profile: { ...retrievalTask, justiceSurface: { present: true, nonConsentingCircles: [] } },
      }),
    }),
    routeDeps(),
  )
  eq(badJustice.status, 400, '7.9 justice surface without a named circle → 400')

  // Cost-amplification bounds (R5): candidates, trace, and purpose are capped → 400.
  const tooMany = await runDiscernmentPost(
    req({
      method: 'POST',
      auth: 'Bearer t',
      body: spawnBody({
        candidates: Array.from({ length: 9 }, (_, i) => ({ candidate_ref: `c${i}` })),
      }),
    }),
    routeDeps(),
  )
  eq(tooMany.status, 400, '7.9a >8 candidates → 400 (each profiled candidate is an extraction call)')
  const bigTrace = await runDiscernmentPost(
    req({
      method: 'POST',
      auth: 'Bearer t',
      body: spawnBody({ reasoning_trace: { trace: 'x'.repeat(20001) } }),
    }),
    routeDeps(),
  )
  eq(bigTrace.status, 400, '7.9b oversized trace → 400')
  const bigPurpose = await runDiscernmentPost(
    req({
      method: 'POST',
      auth: 'Bearer t',
      body: spawnBody({
        candidates: [
          { candidate_ref: 'cand-strong', profile: { ...strongRetriever, purpose: 'p'.repeat(2001) } },
        ],
      }),
    }),
    routeDeps(),
  )
  eq(bigPurpose.status, 400, '7.9c oversized candidate purpose → 400 (extraction input)')

  // Spawn happy path → 200, MEASURE + the disclosed metering note.
  const deps = routeDeps()
  const ok = await runDiscernmentPost(req({ method: 'POST', auth: 'Bearer t', body: spawnBody() }), deps)
  eq(ok.status, 200, '7.10 spawn happy → 200')
  const okBody = (await ok.json()) as { mode?: string; note?: string; result?: { basis?: string } }
  eq(okBody.mode, 'measure', '7.11 response mode measure')
  // S9b election 2 CLOSED the S8 metering follow-up: the note no longer discloses
  // an unmetered surface (metering now runs behind SUBSTRATE_DISCERNMENT_METERING_
  // ENABLED — the CI-10 pattern); the MEASURE line stays.
  assert((okBody.note ?? '').includes('MEASURE'), '7.12 MEASURE note retained')
  assert(!(okBody.note ?? '').includes('named follow-up'), '7.12b the metering follow-up disclosure is gone (closed at S9b)')
  eq(deps.spawnCalls, 1, '7.13 spawn invoked once')

  // hand_back happy path → 200; empty hand_back → 400.
  const hb = await runDiscernmentPost(
    req({
      method: 'POST',
      auth: 'Bearer t',
      body: {
        phase: 'hand_back',
        task_ref: 'task-1',
        orchestrator_agent_id: 'ns:orch@v1',
        habitual_decision: { decision: 'proceed', escalated_assessment_ref: 'sig:k:1' },
      },
    }),
    routeDeps(),
  )
  eq(hb.status, 200, '7.14 hand_back happy → 200')
  const hbEmpty = await runDiscernmentPost(
    req({
      method: 'POST',
      auth: 'Bearer t',
      body: { phase: 'hand_back', task_ref: 'task-1', orchestrator_agent_id: 'ns:orch@v1' },
    }),
    routeDeps(),
  )
  eq(hbEmpty.status, 400, '7.15 hand_back with nothing to do → 400')

  // The hand-back artifact array is capped too (review fold G5) — each element is one
  // Ed25519 verify; unbounded was the one caller-supplied array the F4 pass missed.
  const hbTooMany = await runDiscernmentPost(
    req({
      method: 'POST',
      auth: 'Bearer t',
      body: {
        phase: 'hand_back',
        task_ref: 'task-1',
        orchestrator_agent_id: 'ns:orch@v1',
        justice_failure: {
          signed_assessments: Array.from({ length: 33 }, () => ({ assessment: {}, signature: 's', key_id: 'k' })),
          surface_identified_at_selection: false,
          sub_agent_briefed: false,
          corroboration_run: false,
        },
      },
    }),
    routeDeps(),
  )
  eq(hbTooMany.status, 400, '7.15b >32 signed_assessments → 400 (each is one signature verification)')

  // GET: verdict for the credential's own agent; no agent_id → 400; flag off → 503.
  const get = await runDiscernmentGet(req({ method: 'GET', auth: 'Bearer t' }), routeDeps())
  eq(get.status, 200, '7.16 GET verdict → 200')
  const getNoAgent = await runDiscernmentGet(
    req({ method: 'GET', auth: 'Bearer t' }),
    routeDeps({
      validateCredential: async () =>
        ({ valid: true, row: { id: 'cred-2', owner_user_id: null, agent_id: null }, capabilities: ['consult'] }) as never,
    }),
  )
  eq(getNoAgent.status, 400, '7.17 GET without a credential agent_id → 400')
  const getOff = await runDiscernmentGet(
    req({ method: 'GET', auth: 'Bearer t' }),
    routeDeps({ isEnabled: () => false }),
  )
  eq(getOff.status, 503, '7.18 GET flag-off → 503')
}

// ── Run ──────────────────────────────────────────────────────────────────────
async function main(): Promise<void> {
  await section1()
  await section2()
  section3()
  await section3b()
  await section4()
  await section5()
  await section6()
  await section7()
}

main()
  .then(() => {
    console.log(`\nS8 harness-integration battery: ${passed} passed, ${failed} failed`)
    if (failed > 0) {
      console.error('Failures:\n' + failures.map((f) => `  - ${f}`).join('\n'))
      process.exit(1)
    }
  })
  .catch((e) => {
    console.error('Battery crashed:', e)
    process.exit(1)
  })
