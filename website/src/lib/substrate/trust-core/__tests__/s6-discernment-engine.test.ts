/**
 * s6-discernment-engine.test.ts — Trust Layer S6 instrument-fidelity battery.
 *
 * Plain-assertion script: npx tsx <this file>  (pure core + an in-memory fake for
 * the flag-gated commit seam; getAdminClient() is never reached — run bare, no
 * --env-file).
 *
 * Proves (KG-EX1 instrument-fidelity, never beats-bare) — the S6 review dimensions:
 *   A6 — never exclude on absence: un-profiled below-threshold → assess-on-prior
 *     tier-7 + independence flag; un-profiled above-threshold → requires a
 *     session-scoped examination (not-yet-eligible, never failed); a supplied+passed
 *     session-scoped credential → eligible at reduced confidence; positive exclusion
 *     evidence → the ONLY L1 fail; a FAILED session-scoped exam → fail (positive
 *     evidence, distinct from absence).
 *   Justice branch — mandatory iff a non-consenting party is in scope; skipped when
 *     absent; an above-threshold justice task with no justice-evaluation capacity →
 *     requires the session-scoped exam (not silently selectable).
 *   Domain-distance reuse (S2) — a zeroed credential (distant function) does NOT
 *     contribute; a matching credential does; Q1.3 rides computeCredentialTransfer.
 *   worse-fit-scores-worse — a weaker twin (aged coverage / bare conclusion /
 *     misaligned purpose) scores a STRICTLY lower L2 fit than the strong twin.
 *   Selection recommendation — highest L2 fit wins; L3 axia comparison runs iff >1
 *     eligible; mustExamineFirst surfaced; noEligibleCandidate when all excluded.
 *   Extraction seam — a no-op-equivalent extractor leaves the result unchanged; a
 *     misalignment-flagging extractor lowers the circle score; an extractor throw
 *     falls back to the structural default (fail-honest).
 *   Commit seam — flag-OFF is a pure no-op (byte-equivalent); flag-ON opens the
 *     record + sets the A9 boundary against the fake; an attenuation anomaly is NOT
 *     committed.
 *   MEASURE — every result carries mode 'measure'; nothing binds.
 */

import {
  runDiscernment,
  runDiscernmentWithExtraction,
  openDiscernmentSelection,
  evaluateL1,
  evaluateL2,
  computeL3Signals,
  taskAtOrAboveHabitualThreshold,
  type DiscernmentDeployerConfig,
  type CandidateDiscernmentInput,
  type DiscernmentExtractor,
  type SessionScopedCredential,
} from '../discernment-engine'
import type { TaskProfile, CandidateProfile, OrchestratorProfile } from '../profiles'
import { TRUST_CORE_ENV_VAR } from '../trust-core-flag'
import { makeFakeSupabase } from './fake-supabase'

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

// ── Fixtures ─────────────────────────────────────────────────────────────────
const deployer: DiscernmentDeployerConfig = {
  functionTypeProfiles: {
    'data-retrieval': { functionType: 'data-retrieval', domainWeights: { phronesis: 3, dikaiosyne: 1, andreia: 0, sophrosyne: 1 } },
    'user-communication': { functionType: 'user-communication', domainWeights: { phronesis: 2, dikaiosyne: 3, andreia: 0, sophrosyne: 0 } },
    'justice-evaluation': { functionType: 'justice-evaluation', domainWeights: { phronesis: 2, dikaiosyne: 4, andreia: 0, sophrosyne: 0 } },
    // A function with NO overlap on the retrieval-required domains (phronesis/
    // dikaiosyne/sophrosyne) — a credential here is zeroed for retrieval (S2 A2).
    'ops-automation': { functionType: 'ops-automation', domainWeights: { phronesis: 0, dikaiosyne: 0, andreia: 4, sophrosyne: 0 } },
    // Same phronesis weight as data-retrieval (⇒ identical phronesis transfer τ=1, so
    // identical L2 specificity) but a larger TOTAL domain distance (2) — used to prove
    // L3 kata-physin decides an equal-fit near-tie (Q3.1).
    'retrieval-variant': { functionType: 'retrieval-variant', domainWeights: { phronesis: 3, dikaiosyne: 0, andreia: 1, sophrosyne: 1 } },
  },
}

const orchestrator: OrchestratorProfile = {
  schema: 'trust-orchestrator-profile-v1',
  agentId: 'ns:orch@v1',
  currentKathekonta: ['serve the user honestly'],
  examinationCapacity: { corroborationCheckAvailable: true, canReExamine: true, maxDepth: 'standard' },
  circle: ['requesting-user', 'recipient', 'non-consenting-subject', 'wider-org'],
  selectionPatterns: [],
}

const retrievalTask: TaskProfile = {
  schema: 'trust-task-profile-v1',
  functionType: 'data-retrieval',
  circlesServed: ['requesting-user'],
  conditions: ['read-only'],
  outputRequirements: ['structured verdict'],
  justiceSurface: { present: false, nonConsentingCircles: [] },
}

const justiceTask: TaskProfile = {
  schema: 'trust-task-profile-v1',
  functionType: 'user-communication',
  circlesServed: ['recipient', 'non-consenting-subject'],
  conditions: ['outbound message'],
  outputRequirements: ['structured verdict'],
  justiceSurface: { present: true, nonConsentingCircles: ['non-consenting-subject'], note: 'recipient did not opt in' },
}

const strongRetriever: CandidateProfile = {
  schema: 'trust-candidate-profile-v1',
  agentId: 'ns:strong@v1',
  role: 'retriever',
  capabilityScope: ['data-retrieval'],
  credentialCoverage: [{ domain: 'phronesis', functionType: 'data-retrieval', coverageStatus: 'continuous', demonstratedProximity: 'principled' }],
  performanceHistory: [{ domain: 'phronesis', proximity: 'principled', conditions: ['read-only'], occurredAt: '2026-07-01T00:00:00.000Z' }],
  outputFormat: { emitsSignedTrace: true, emitsStructuredVerdict: true, statesUncertainty: true },
  purpose: 'retrieve records for the requesting user',
  priorInteraction: null,
}

// A weaker twin: aged (suspended) coverage + a bare conclusion (not-met transparency)
// + no condition-matched performance.
const weakRetriever: CandidateProfile = {
  schema: 'trust-candidate-profile-v1',
  agentId: 'ns:weak@v1',
  role: 'retriever',
  capabilityScope: ['data-retrieval'],
  credentialCoverage: [{ domain: 'phronesis', functionType: 'data-retrieval', coverageStatus: 'suspended' }],
  outputFormat: { emitsSignedTrace: false, emitsStructuredVerdict: false, statesUncertainty: false },
  purpose: 'retrieve records',
  priorInteraction: null,
}

// A profiled candidate whose ONLY credential is in a distant function (zeroed for
// retrieval): role-aligned by declaration, but no contributing credential.
const distantRetriever: CandidateProfile = {
  schema: 'trust-candidate-profile-v1',
  agentId: 'ns:distant@v1',
  role: 'retriever',
  capabilityScope: ['data-retrieval'],
  credentialCoverage: [{ domain: 'andreia', functionType: 'ops-automation', coverageStatus: 'continuous' }],
  outputFormat: { emitsSignedTrace: true, emitsStructuredVerdict: true, statesUncertainty: false },
  purpose: 'automate ops',
  priorInteraction: null,
}

// A justice-capable communicator (dikaiosyne coverage) for the justice task.
const justiceCommunicator: CandidateProfile = {
  schema: 'trust-candidate-profile-v1',
  agentId: 'ns:justice@v1',
  role: 'communicator',
  capabilityScope: ['user-communication'],
  credentialCoverage: [
    { domain: 'dikaiosyne', functionType: 'user-communication', coverageStatus: 'continuous', demonstratedProximity: 'principled' },
    { domain: 'phronesis', functionType: 'user-communication', coverageStatus: 'continuous' },
  ],
  outputFormat: { emitsSignedTrace: true, emitsStructuredVerdict: true, statesUncertainty: true },
  purpose: 'communicate with recipients honestly, honouring what is owed',
  priorInteraction: null,
}

// A communicator with NO justice-evaluation capacity (no dikaiosyne) for the justice task.
const noJusticeCommunicator: CandidateProfile = {
  schema: 'trust-candidate-profile-v1',
  agentId: 'ns:nojust@v1',
  role: 'communicator',
  capabilityScope: ['user-communication'],
  credentialCoverage: [{ domain: 'phronesis', functionType: 'user-communication', coverageStatus: 'continuous' }],
  outputFormat: { emitsSignedTrace: true, emitsStructuredVerdict: true, statesUncertainty: false },
  purpose: 'communicate with recipients',
  priorInteraction: null,
}

// A twin of strongRetriever with an equal-fit but MORE-DISTANT credential (function
// 'retrieval-variant', domain distance 2 vs 0) — same phronesis τ=1 ⇒ identical L2
// fit, so L3 kata-physin (Q3.1) must decide.
const variantRetriever: CandidateProfile = {
  ...strongRetriever,
  agentId: 'ns:variant@v1',
  credentialCoverage: [{ domain: 'phronesis', functionType: 'retrieval-variant', coverageStatus: 'continuous', demonstratedProximity: 'principled' }],
}

const inp = (profile: CandidateProfile | null, candidateRef: string, extra: Partial<CandidateDiscernmentInput> = {}): CandidateDiscernmentInput => ({
  profile,
  candidateRef,
  ...extra,
});

// ════════════════════════════════════════════════════════════════════════════
// SECTION 1 — A6 stakes threshold (justice surface ⇒ above; explicit raise only)
// ════════════════════════════════════════════════════════════════════════════
{
  assert(!taskAtOrAboveHabitualThreshold(retrievalTask, deployer), 'A6 threshold: no justice surface → below the habitual threshold')
  assert(taskAtOrAboveHabitualThreshold(justiceTask, deployer), 'A6 threshold: justice surface → above the habitual threshold')
  // Explicit override can RAISE a no-justice task…
  assert(taskAtOrAboveHabitualThreshold(retrievalTask, { ...deployer, taskStakes: 'above-habitual-threshold' }), 'A6 threshold: explicit above-stakes raises a no-justice task')
  // …but can NEVER lower a justice task (the safe, asymmetric direction).
  assert(taskAtOrAboveHabitualThreshold(justiceTask, { ...deployer, taskStakes: 'below-habitual-threshold' }), 'A6 threshold: a justice task can NEVER be downgraded below threshold')
}

// ════════════════════════════════════════════════════════════════════════════
// SECTION 2 — L1 honestum gate: A6 (never exclude on absence), Q1.1/Q1.2/Q1.3
// ════════════════════════════════════════════════════════════════════════════
{
  // Un-profiled + below threshold → assess-on-prior tier-7 + independence flag (A6).
  const unprofiledBelow = evaluateL1(retrievalTask, inp(null, 'unprofiled'), deployer)
  eq(unprofiledBelow.outcome, 'pass', 'L1: un-profiled below-threshold → PASS (never excluded)')
  eq(unprofiledBelow.posture, 'assess-on-prior-tier7', 'L1: un-profiled below → assess-on-prior-tier7')
  assert(unprofiledBelow.independenceFlagActive, 'L1: un-profiled below → independence flag active')
  eq(unprofiledBelow.confidence.tier, 7, 'L1: un-profiled → A5 tier 7 confidence')

  // Un-profiled + above threshold (justice task) → requires a session-scoped exam.
  const unprofiledAbove = evaluateL1(justiceTask, inp(null, 'unprofiled'), deployer)
  eq(unprofiledAbove.outcome, 'requires-session-scoped-examination', 'L1: un-profiled above-threshold → requires session-scoped exam (never failed)')
  assert(unprofiledAbove.examMustEstablish.length > 0, 'L1: requires-exam names what the exam must establish')

  // Positive exclusion evidence is the ONLY hard fail (A6).
  const excluded = evaluateL1(retrievalTask, inp(strongRetriever, 'strong', { exclusionEvidence: 'known-justice-violation' }), deployer)
  eq(excluded.outcome, 'fail', 'L1: positive exclusion evidence → FAIL (the only L1 exclusion)')

  // A profiled, role-aligned, contributing candidate passes at full evidence.
  const strong = evaluateL1(retrievalTask, inp(strongRetriever, 'strong'), deployer)
  eq(strong.outcome, 'pass', 'L1: strong profiled candidate → PASS')
  eq(strong.posture, 'profiled-credentialed', 'L1: strong → profiled-credentialed posture')
  assert(!strong.independenceFlagActive, 'L1: strong → no independence flag')
  assert(strong.hasContributingCredential, 'L1: strong → has a contributing credential (S2 A2)')

  // A profiled candidate with only a ZEROED (distant) credential, below threshold →
  // assess-on-prior (A2 zero-floor routes it, never a spurious contribution).
  const distant = evaluateL1(retrievalTask, inp(distantRetriever, 'distant'), deployer)
  eq(distant.outcome, 'pass', 'L1: distant-credential candidate below threshold → PASS on prior')
  eq(distant.posture, 'assess-on-prior-tier7', 'L1: distant credential → assess-on-prior (A2 zero-floor: no contributing credential)')
  assert(!distant.hasContributingCredential, 'L1: distant credential does NOT contribute (S2 A2 domain distance)')

  // Justice task: mandatory L3 justice branch; a candidate with justice capacity passes.
  const jc = evaluateL1(justiceTask, inp(justiceCommunicator, 'justice'), deployer)
  eq(jc.outcome, 'pass', 'L1: justice-capable communicator on justice task → PASS')
  assert(jc.justiceBranchMandatory, 'L1: justice task → mandatory L3 justice branch')
  assert(jc.justiceEvaluationCapacity, 'L1: justice communicator has justice-evaluation capacity')

  // Justice task: a communicator with NO justice capacity → requires the session-scoped
  // exam (NOT silently selectable, NOT excluded on absence — A6 remediation).
  const noJust = evaluateL1(justiceTask, inp(noJusticeCommunicator, 'nojust'), deployer)
  eq(noJust.outcome, 'requires-session-scoped-examination', 'L1: justice task + no justice capacity → requires session-scoped exam')
  assert(noJust.examMustEstablish.some((g) => /justice-evaluation capacity/.test(g)), 'L1: the exam requirement names the justice-capacity gap')

  // Precedence: an ADEQUATE profiled candidate with a supplied exam is NOT downgraded
  // to session-scoped — profiled adequacy takes precedence (checked before the ssc fold).
  const sscForAdequate: SessionScopedCredential = { schema: 'trust-session-scoped-credential-v1', approachProximity: 'deliberate', justiceHandled: true, depth: 'standard', signed: true }
  const adequateWithExam = evaluateL1(justiceTask, inp(justiceCommunicator, 'justice', { sessionScopedCredential: sscForAdequate }), deployer)
  eq(adequateWithExam.posture, 'profiled-credentialed', 'L1: an adequate profiled candidate + a supplied exam → stays profiled-credentialed (adequacy precedence)')

  // A supplied, PASSED session-scoped credential makes an un-profiled candidate eligible.
  const sscPass: SessionScopedCredential = { schema: 'trust-session-scoped-credential-v1', approachProximity: 'deliberate', justiceHandled: true, depth: 'standard', signed: true }
  const remediated = evaluateL1(justiceTask, inp(null, 'unprofiled', { sessionScopedCredential: sscPass }), deployer)
  eq(remediated.outcome, 'pass', 'L1: un-profiled + PASSED session-scoped credential → PASS (A6 remediation)')
  eq(remediated.posture, 'session-scoped', 'L1: session-scoped posture')
  assert(remediated.confidence.tier >= 2, 'L1: session-scoped confidence is reduced (tier ≥ 2, below a full deep credential)')

  // A FAILED session-scoped exam (approach below the assent floor) is POSITIVE evidence → fail.
  const sscFail: SessionScopedCredential = { schema: 'trust-session-scoped-credential-v1', approachProximity: 'reflexive', justiceHandled: false, depth: 'standard' }
  const failedExam = evaluateL1(justiceTask, inp(null, 'unprofiled', { sessionScopedCredential: sscFail }), deployer)
  eq(failedExam.outcome, 'fail', 'L1: FAILED session-scoped exam → fail (positive evidence, distinct from absence)')

  // A session-scoped exam that reached deliberate but LEFT THE JUSTICE SURFACE UNHANDLED → fail.
  const sscJusticeMiss: SessionScopedCredential = { schema: 'trust-session-scoped-credential-v1', approachProximity: 'deliberate', justiceHandled: false, depth: 'standard' }
  const justiceMiss = evaluateL1(justiceTask, inp(null, 'unprofiled', { sessionScopedCredential: sscJusticeMiss }), deployer)
  eq(justiceMiss.outcome, 'fail', 'L1: session-scoped exam that left the justice surface unhandled → fail')
}

// ════════════════════════════════════════════════════════════════════════════
// SECTION 3 — L2 fit: worse-fit-scores-worse; transparency; circle-misalignment risk
// ════════════════════════════════════════════════════════════════════════════
{
  const strongL1 = evaluateL1(retrievalTask, inp(strongRetriever, 'strong'), deployer)
  const weakL1 = evaluateL1(retrievalTask, inp(weakRetriever, 'weak'), deployer)
  const strongL2 = evaluateL2(retrievalTask, inp(strongRetriever, 'strong'), strongL1, deployer)
  const weakL2 = evaluateL2(retrievalTask, inp(weakRetriever, 'weak'), weakL1, deployer)

  assert(strongL2.fit > weakL2.fit, `worse-fit-scores-worse: strong fit ${strongL2.fit} > weak fit ${weakL2.fit}`)
  assert(strongL2.specificity > weakL2.specificity, 'worse-fit: strong specificity > weak (continuous vs suspended coverage)')
  assert(strongL2.transparency > weakL2.transparency, 'worse-fit: strong transparency > weak (signed trace vs bare conclusion)')
  eq(strongL2.independence, 'met-full', 'L2: strong output (signed trace) → met-full independence')
  eq(weakL2.independence, 'not-met', 'L2: weak output (bare conclusion) → not-met independence')

  // Circle-misalignment (Q2.4) is a dikaiosyne RISK, not a hard fail: it lowers fit
  // but the candidate is still eligible.
  const misalignedInput = inp(strongRetriever, 'strong-misaligned', { resolvedSignals: { circleAlignment: 'misaligned' } })
  const misaligned = evaluateL2(retrievalTask, misalignedInput, strongL1, deployer)
  assert(misaligned.circleMisalignmentRisk, 'L2: caller-flagged misalignment → dikaiosyne risk surfaced')
  assert(misaligned.circleAlignment < strongL2.circleAlignment, 'L2: misalignment lowers the circle sub-score (a dikaiosyne risk)')
  assert(misaligned.fit < strongL2.fit, 'L2: misalignment lowers the overall fit (but does not fail L1)')

  // Monotone worse: a strong candidate with an ADDED aged twist scores no higher.
  assert(strongL2.minDim >= weakL2.minDim, 'L2: strong weakest-dimension ≥ weak weakest-dimension')
}

// ════════════════════════════════════════════════════════════════════════════
// SECTION 4 — L3 axia signals + the deterministic ranking
// ════════════════════════════════════════════════════════════════════════════
{
  const l1 = evaluateL1(retrievalTask, inp(strongRetriever, 'strong'), deployer)
  const l2 = evaluateL2(retrievalTask, inp(strongRetriever, 'strong'), l1, deployer)
  const l3 = computeL3Signals(retrievalTask, inp(strongRetriever, 'strong'), l1, l2, deployer)
  // Q3.1: the retrieval credential is IN the retrieval function → distance 0 (maximally kata physin).
  eq(l3.kataPhysinDistance, 0, 'L3 Q3.1: a credential in the task function → kata-physin distance 0')
  // Q3.2: strong candidate → no independence deficit, no misalignment, profiled → 0 dispreferred.
  eq(l3.dispreferredCount, 0, 'L3 Q3.2: strong candidate introduces 0 dispreferred indifferents')
  // Q3.3: signed trace → maximal integrability.
  eq(l3.integrabilityRank, 2, 'L3 Q3.3: signed trace → maximal integrability rank')

  const weakL1 = evaluateL1(retrievalTask, inp(weakRetriever, 'weak'), deployer)
  const weakL2 = evaluateL2(retrievalTask, inp(weakRetriever, 'weak'), weakL1, deployer)
  const weakL3 = computeL3Signals(retrievalTask, inp(weakRetriever, 'weak'), weakL1, weakL2, deployer)
  assert(weakL3.dispreferredCount >= 1, 'L3 Q3.2: weak candidate (bare conclusion) introduces ≥1 dispreferred indifferent')
  assert(weakL3.integrabilityRank < l3.integrabilityRank, 'L3 Q3.3: weak candidate is less integrable than the strong candidate')
}

// ════════════════════════════════════════════════════════════════════════════
// SECTION 5 — the full discernment + the selection recommendation
// ════════════════════════════════════════════════════════════════════════════
{
  // Two eligible candidates on the retrieval task → L3 applied; strong wins.
  const res = runDiscernment({ task: retrievalTask, candidates: [inp(strongRetriever, 'strong'), inp(weakRetriever, 'weak')], orchestrator, deployer })
  eq(res.mode, 'measure', 'discernment: MEASURE invariant (mode measure)')
  assert(res.l3Applied, 'discernment: 2 eligible → L3 axia comparison applied')
  eq(res.recommendation.recommendedAgentRef, 'strong', 'recommendation: highest L2 fit (strong) wins')
  eq(res.recommendation.recommendedAgentId, 'ns:strong@v1', 'recommendation: agentId carried')
  eq(res.recommendation.noEligibleCandidate, false, 'recommendation: an eligible candidate exists')
  eq(res.mandatoryL3JusticeBranch, false, 'discernment: retrieval task has no justice surface')
  // The authority boundary = the task definition (never the orchestrator ceiling).
  eq(res.authorityBoundary.actionScope, 'data-retrieval', 'A9: boundary action-scope = task function type')
  assert(res.attenuation.attenuates, 'A9: boundary circle-scope ⊆ orchestrator → proper attenuation')

  // Justice task: the justice-capable communicator is eligible; the no-justice one and
  // an un-profiled one require the session-scoped exam (surfaced, not selected).
  const jres = runDiscernment({ task: justiceTask, candidates: [inp(justiceCommunicator, 'justice'), inp(noJusticeCommunicator, 'nojust'), inp(null, 'unprofiled')], orchestrator, deployer })
  eq(jres.mandatoryL3JusticeBranch, true, 'discernment: justice task → mandatory L3 justice branch')
  eq(jres.recommendation.recommendedAgentRef, 'justice', 'recommendation: only the justice-capable communicator is eligible')
  assert(jres.recommendation.mustExamineFirst.includes('nojust') && jres.recommendation.mustExamineFirst.includes('unprofiled'), 'recommendation: no-justice + un-profiled surfaced as must-examine-first (A6)')

  // L3 is NON-VACUOUS: two EQUAL-fit candidates (strong vs variant — identical L2 fit,
  // more-distant variant credential) are decided by the L3 axia comparison (Q3.1 kata
  // physin: distance 0 < 2) → the nearer-fit candidate wins.
  const l3res = runDiscernment({ task: retrievalTask, candidates: [inp(variantRetriever, 'variant'), inp(strongRetriever, 'strong')], orchestrator, deployer })
  const strongL2fit = l3res.perCandidate.find((c) => c.candidateRef === 'strong')!.l2!.fit
  const variantL2fit = l3res.perCandidate.find((c) => c.candidateRef === 'variant')!.l2!.fit
  eq(strongL2fit, variantL2fit, 'L3 setup: strong + variant have IDENTICAL L2 fit (same phronesis transfer)')
  eq(l3res.recommendation.recommendedAgentRef, 'strong', 'L3 non-vacuous: equal L2 fit → L3 kata-physin (distance 0 < 2) selects the nearer candidate')
  const strongL3 = l3res.perCandidate.find((c) => c.candidateRef === 'strong')!.l3!
  const variantL3 = l3res.perCandidate.find((c) => c.candidateRef === 'variant')!.l3!
  assert(strongL3.kataPhysinDistance === 0 && variantL3.kataPhysinDistance === 2, 'L3 non-vacuous: kata-physin distances (0 vs 2) drive the decision')

  // No eligible candidate: a single candidate that fails on exclusion evidence.
  const none = runDiscernment({ task: retrievalTask, candidates: [inp(strongRetriever, 'strong', { exclusionEvidence: 'revoked-credential' })], orchestrator, deployer })
  eq(none.recommendation.recommendedAgentRef, null, 'recommendation: all excluded → no recommendation')
  assert(none.recommendation.noEligibleCandidate, 'recommendation: noEligibleCandidate flagged')
  eq(none.l3Applied, false, 'discernment: 0 eligible → no L3')

  // Attenuation anomaly: a task circle beyond the orchestrator's extension is surfaced.
  const ghostTask: TaskProfile = { ...retrievalTask, circlesServed: ['ghost-circle'] }
  const ghost = runDiscernment({ task: ghostTask, candidates: [inp(strongRetriever, 'strong')], orchestrator, deployer })
  assert(!ghost.attenuation.attenuates, 'A9: a task circle beyond the orchestrator → attenuation anomaly surfaced')
}

// ════════════════════════════════════════════════════════════════════════════
// SECTION 6 — the extraction seam (injectable; pure fallback; fail-honest)
// ════════════════════════════════════════════════════════════════════════════
;(async () => {
  const base = { task: retrievalTask, candidates: [inp(strongRetriever, 'strong')], orchestrator, deployer }

  // A no-op-equivalent extractor (returns 'aligned', matching the structural default)
  // leaves the recommendation + fit unchanged.
  const noop: DiscernmentExtractor = { async assessCircleAlignment() { return { alignment: 'aligned' } } }
  const pure = runDiscernment(base)
  const withNoop = await runDiscernmentWithExtraction(base, noop)
  eq(withNoop.recommendation.recommendedAgentRef, pure.recommendation.recommendedAgentRef, 'extraction seam: no-op-equivalent extractor → same recommendation')
  eq(withNoop.perCandidate[0].l2!.circleAlignment, pure.perCandidate[0].l2!.circleAlignment, 'extraction seam: no-op extractor → same circle score')

  // A misalignment-flagging extractor lowers the circle score (the seam is load-bearing).
  const flagsMisalign: DiscernmentExtractor = { async assessCircleAlignment() { return { alignment: 'misaligned' } } }
  const withMisalign = await runDiscernmentWithExtraction(base, flagsMisalign)
  assert(withMisalign.perCandidate[0].l2!.circleAlignment < pure.perCandidate[0].l2!.circleAlignment, 'extraction seam: a misalignment read lowers the circle score')
  assert(withMisalign.perCandidate[0].l2!.circleMisalignmentRisk, 'extraction seam: misalignment surfaces the dikaiosyne risk')

  // A throwing extractor falls back to the structural default (fail-honest — never blocks).
  const throws: DiscernmentExtractor = { async assessCircleAlignment() { throw new Error('extractor down') } }
  const withThrow = await runDiscernmentWithExtraction(base, throws)
  eq(withThrow.perCandidate[0].l2!.circleAlignment, pure.perCandidate[0].l2!.circleAlignment, 'extraction seam: extractor throw → structural fallback (fail-honest)')
})()

// ════════════════════════════════════════════════════════════════════════════
// SECTION 7 — the flag-gated, fail-honest commit seam (open record + set boundary)
// ════════════════════════════════════════════════════════════════════════════
;(async () => {
  const prev = process.env[TRUST_CORE_ENV_VAR]
  const res = runDiscernment({ task: retrievalTask, candidates: [inp(strongRetriever, 'strong')], orchestrator, deployer })

  // Flag OFF (unset) → a pure no-op (no store touch) — byte-equivalent, MEASURE dark.
  delete process.env[TRUST_CORE_ENV_VAR]
  const fakeOff = makeFakeSupabase()
  const off = await openDiscernmentSelection({ result: res, chosenCandidateAgentId: 'ns:strong@v1', taskRef: 'task-1', orchestratorAgentId: 'ns:orch@v1', client: fakeOff.client })
  assert(!off.committed && !off.opened, 'commit seam: flag OFF → not committed (MEASURE dark)')
  eq(fakeOff.tables.collaboration_records.length, 0, 'commit seam: flag OFF → no store write (byte-equivalent)')

  // Flag ON → opens the record + sets the A9 authority boundary.
  process.env[TRUST_CORE_ENV_VAR] = 'true'
  const fakeOn = makeFakeSupabase()
  const on = await openDiscernmentSelection({ result: res, chosenCandidateAgentId: 'ns:strong@v1', taskRef: 'task-1', orchestratorAgentId: 'ns:orch@v1', ownerUserId: 'owner-1', client: fakeOn.client })
  assert(on.committed && on.opened && on.boundarySet, 'commit seam: flag ON → committed + opened + boundary set')
  eq(fakeOn.tables.collaboration_records.length, 1, 'commit seam: flag ON → one collaboration record written')
  const row = fakeOn.tables.collaboration_records[0] as Record<string, unknown>
  eq((row.authority_boundary as { actionScope: string } | null)?.actionScope, 'data-retrieval', 'commit seam: A9 boundary persisted (action-scope = task function)')
  eq(row.candidate_agent_id, 'ns:strong@v1', 'commit seam: chosen candidate persisted')
  eq(row.l4_audit_result, null, 'commit seam: l4_audit_result left null for S7')

  // Attenuation anomaly → NOT committed (do not silently proceed).
  const ghostRes = runDiscernment({ task: { ...retrievalTask, circlesServed: ['ghost-circle'] }, candidates: [inp(strongRetriever, 'strong')], orchestrator, deployer })
  const fakeGhost = makeFakeSupabase()
  const ghost = await openDiscernmentSelection({ result: ghostRes, chosenCandidateAgentId: 'ns:strong@v1', taskRef: 'task-2', orchestratorAgentId: 'ns:orch@v1', client: fakeGhost.client })
  assert(!ghost.committed, 'commit seam: attenuation anomaly → NOT committed (escalate)')
  eq(fakeGhost.tables.collaboration_records.length, 0, 'commit seam: anomaly → no store write')

  // Restore the flag state.
  if (prev === undefined) delete process.env[TRUST_CORE_ENV_VAR]
  else process.env[TRUST_CORE_ENV_VAR] = prev
})()

// ════════════════════════════════════════════════════════════════════════════
// SECTION 8 — review folds: the A2 zero-floor must hold at EVERY S6 derivation
// (justice capacity, confidence/coverage, kata-physin), the prior bonus can't
// manufacture stability, and justiceEvaluationFunctionType is consumed.
// ════════════════════════════════════════════════════════════════════════════
{
  // FOLD S6-JUSTICE-CAPACITY-01 (MEDIUM): a dikaiosyne credential earned in a
  // justice-BLIND function (ops-automation, dikaiosyne weight 0) is NOT justice
  // capacity — the fail-open where a bare dikaiosyne tag skipped the exam is closed.
  const zeroedJusticeTag: CandidateProfile = {
    schema: 'trust-candidate-profile-v1', agentId: 'ns:gamed@v1', role: 'communicator',
    capabilityScope: ['user-communication'],
    credentialCoverage: [
      { domain: 'phronesis', functionType: 'user-communication', coverageStatus: 'continuous' }, // contributes on the task
      { domain: 'dikaiosyne', functionType: 'ops-automation', coverageStatus: 'continuous' }, // dikaiosyne weight 0 → justice-blind
    ],
    outputFormat: { emitsSignedTrace: true, emitsStructuredVerdict: true, statesUncertainty: true },
    purpose: 'communicate', priorInteraction: null,
  }
  const gamed = evaluateL1(justiceTask, inp(zeroedJusticeTag, 'gamed'), deployer)
  eq(gamed.outcome, 'requires-session-scoped-examination', 'FOLD justice-capacity: a justice-blind dikaiosyne tag → requires session-scoped exam (fail-open closed)')
  assert(!gamed.justiceEvaluationCapacity, 'FOLD justice-capacity: justiceEvaluationCapacity false for a justice-blind dikaiosyne tag')

  // FOLD S6-REUSE-1 (LOW): a zeroed CONTINUOUS credential must not upgrade confidence
  // or specificity — both are scoped to the contributing credentials.
  const suspendedOnly: CandidateProfile = { ...strongRetriever, agentId: 'ns:so@v1', credentialCoverage: [{ domain: 'phronesis', functionType: 'data-retrieval', coverageStatus: 'suspended' }], performanceHistory: [] }
  const suspendedPlusZeroed: CandidateProfile = { ...suspendedOnly, agentId: 'ns:spz@v1', credentialCoverage: [
    { domain: 'phronesis', functionType: 'data-retrieval', coverageStatus: 'suspended' },
    { domain: 'andreia', functionType: 'ops-automation', coverageStatus: 'continuous' }, // zeroed for retrieval
  ] }
  const soL1 = evaluateL1(retrievalTask, inp(suspendedOnly, 'so'), deployer)
  const spzL1 = evaluateL1(retrievalTask, inp(suspendedPlusZeroed, 'spz'), deployer)
  eq(soL1.confidence.tier, spzL1.confidence.tier, 'FOLD reuse-1: a zeroed continuous credential does NOT upgrade the confidence tier (scoped to contributing)')
  const soL2 = evaluateL2(retrievalTask, inp(suspendedOnly, 'so'), soL1, deployer)
  const spzL2 = evaluateL2(retrievalTask, inp(suspendedPlusZeroed, 'spz'), spzL1, deployer)
  eq(soL2.specificity, spzL2.specificity, 'FOLD reuse-1: a zeroed continuous credential does NOT upgrade specificity (coverage scoped to contributing)')

  // FOLD S6-L3-KATAPHYSIN-01 (LOW): kata-physin min over CONTRIBUTING credentials only —
  // a zeroed credential with a SMALLER distance must not win the tie-break.
  const deployerKP: DiscernmentDeployerConfig = { functionTypeProfiles: {
    F: { functionType: 'F', domainWeights: { phronesis: 1, dikaiosyne: 0, andreia: 0, sophrosyne: 0 } },
    G: { functionType: 'G', domainWeights: { phronesis: 1, dikaiosyne: 0, andreia: 10, sophrosyne: 0 } }, // contributes (phronesis); distance 10
    H: { functionType: 'H', domainWeights: { phronesis: 0, dikaiosyne: 0, andreia: 0, sophrosyne: 0.5 } }, // non-contributing; distance 1.5
  } }
  const taskF: TaskProfile = { schema: 'trust-task-profile-v1', functionType: 'F', circlesServed: ['u'], conditions: [], outputRequirements: [], justiceSurface: { present: false, nonConsentingCircles: [] } }
  const kpCand: CandidateProfile = { schema: 'trust-candidate-profile-v1', agentId: 'ns:kp@v1', role: 'r', capabilityScope: ['F'], credentialCoverage: [
    { domain: 'phronesis', functionType: 'G', coverageStatus: 'continuous' },
    { domain: 'sophrosyne', functionType: 'H', coverageStatus: 'continuous' },
  ], outputFormat: { emitsSignedTrace: true, emitsStructuredVerdict: true, statesUncertainty: false }, purpose: 'p', priorInteraction: null }
  const kpL1 = evaluateL1(taskF, inp(kpCand, 'kp'), deployerKP)
  const kpL2 = evaluateL2(taskF, inp(kpCand, 'kp'), kpL1, deployerKP)
  const kpL3 = computeL3Signals(taskF, inp(kpCand, 'kp'), kpL1, kpL2, deployerKP)
  eq(kpL3.kataPhysinDistance, 10, 'FOLD kata-physin: min over CONTRIBUTING credentials (10), NOT the smaller-distance zeroed credential (1.5)')

  // FOLD S6-L2-1 (LOW): a prior-interaction record cannot MANUFACTURE stability from
  // zero condition-matched evidence (capped at baseStability=0).
  const friendlyNoPerf: CandidateProfile = { ...strongRetriever, agentId: 'ns:fnp@v1', performanceHistory: [], priorInteraction: { interactions: 100, isDataNotCredential: true } }
  const fnpL1 = evaluateL1(retrievalTask, inp(friendlyNoPerf, 'fnp'), deployer)
  const fnpL2 = evaluateL2(retrievalTask, inp(friendlyNoPerf, 'fnp'), fnpL1, deployer)
  eq(fnpL2.stability, 0, 'FOLD L2-1: prior-interaction cannot manufacture stability from zero condition-matched evidence')

  // FOLD S6-L2-3 (NIT): a NaN interaction count does not poison the fit (clamp01 NaN-safe + guard).
  const nanFriendly: CandidateProfile = { ...strongRetriever, agentId: 'ns:nan@v1', priorInteraction: { interactions: NaN, isDataNotCredential: true } }
  const nanL1 = evaluateL1(retrievalTask, inp(nanFriendly, 'nan'), deployer)
  const nanL2 = evaluateL2(retrievalTask, inp(nanFriendly, 'nan'), nanL1, deployer)
  assert(!Number.isNaN(nanL2.fit) && !Number.isNaN(nanL2.stability), 'FOLD L2-3: a NaN interaction count does not poison the fit / stability')

  // FOLD S6-CVC-2 (NIT): justiceEvaluationFunctionType is CONSUMED (not dead). A
  // phronesis-domain credential whose FUNCTION overlaps the justice-eval function on
  // dikaiosyne grants capacity ONLY when the deployer names the justice function.
  const deployerJEF: DiscernmentDeployerConfig = { ...deployer, justiceEvaluationFunctionType: 'justice-evaluation' }
  const jefCand: CandidateProfile = {
    schema: 'trust-candidate-profile-v1', agentId: 'ns:jef@v1', role: 'communicator', capabilityScope: ['user-communication'],
    credentialCoverage: [{ domain: 'phronesis', functionType: 'user-communication', coverageStatus: 'continuous' }], // phronesis DOMAIN; its FUNCTION overlaps the justice-eval fn on dikaiosyne
    outputFormat: { emitsSignedTrace: true, emitsStructuredVerdict: true, statesUncertainty: true }, purpose: 'communicate', priorInteraction: null,
  }
  eq(evaluateL1(justiceTask, inp(jefCand, 'jef'), deployer).outcome, 'requires-session-scoped-examination', 'FOLD cvc-2: WITHOUT justiceEvaluationFunctionType, a phronesis-domain credential is not justice capacity → requires exam')
  const jefL1 = evaluateL1(justiceTask, inp(jefCand, 'jef'), deployerJEF)
  assert(jefL1.justiceEvaluationCapacity && jefL1.outcome === 'pass', 'FOLD cvc-2: justiceEvaluationFunctionType is CONSUMED — coverage of the justice-eval function grants capacity (spec-2)')
}

// ════════════════════════════════════════════════════════════════════════════
// Summary (deferred to flush the async blocks)
// ════════════════════════════════════════════════════════════════════════════
setTimeout(() => {
  console.log(`\nS6 discernment-engine battery: ${passed} passed, ${failed} failed`)
  if (failed > 0) {
    console.error('Failures:\n' + failures.map((f) => `  - ${f}`).join('\n'))
    process.exit(1)
  }
}, 100)
