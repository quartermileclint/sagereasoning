/**
 * s5-profiles-collaboration-record.test.ts — Trust Layer S5 instrument-fidelity battery.
 *
 * Plain-assertion script: npx tsx <this file>  (pure lib + an in-memory fake for the
 * store; getAdminClient() is never reached — run bare, no --env-file).
 *
 * Proves (KG-EX1 instrument-fidelity, never beats-bare) — the S5 review dimensions:
 *   A9 authority boundary — within-scope proceeds; exceeding action-scope OR
 *     circle-scope escalates (never autonomous expansion); UNWAIVABLE BY TRUST
 *     LEVEL (structural — the validator takes no trust argument; the @ts-expect-error
 *     below locks that at compile time); attenuation ⊆ orchestrator circle.
 *   A7 L4 audit — no flag → no-op; a flag at a LOWER tier HOLDS the selection; a
 *     flag at a HIGHER tier logs + surfaces (does not auto-hold); readable-not-
 *     modifiable is DB write-once (verified in the migration probe) + the lib guard.
 *   A9 justice-failure cases — classify (incl. the identified-not-briefed pin →
 *     case 2); the orchestrator-side delegation events (case 1: oversight; case 2:
 *     oversight + dikaiosyne; case 3: oversight FLAG), each consistent with the S1
 *     transition EVENT_EFFECT; the sub-agent's own violation is the ordinary
 *     pipeline (NOT re-emitted); R18f-parallel (no ref ⇒ no events).
 *   A8 habitual-stable + A4 independence-deficit — homed in the record.
 *   A6 un-profiled candidate — assessed on prior at tier-7 + independence flag,
 *     NEVER excluded.
 *   Profiles — validators; the A2A mapper ignores capability CLAIMS (R18d).
 *   Store — CRUD, write-once setters, data-rights, purge, missing-table-benign
 *     (⇒ the Live data-rights routes are byte-equivalent until the table has rows).
 */

import {
  validateTaskProfile,
  validateCandidateProfile,
  validateOrchestratorProfile,
  candidateHintsFromA2ACard,
  classifyCandidatePresence,
  type TaskProfile,
  type CandidateProfile,
  type OrchestratorProfile,
} from '../profiles'
import {
  validateAuthorityBoundary,
  authorityBoundaryFromTask,
  boundaryAttenuatesOrchestrator,
  resolveL4AuditResult,
  habitualStableFlagFromRecommendation,
  classifyJusticeFailureCase,
  buildJusticeFailureReflection,
  deriveDelegationReflectionEvents,
  newCollaborationRecord,
  canSetAuthorityBoundary,
  canSetL4AuditResult,
  validateCollaborationRecord,
  type AuthorityBoundary,
  type L4Signals,
} from '../collaboration-record'
import {
  openCollaborationRecord,
  readCollaborationRecord,
  recordAuthorityBoundary,
  recordL4AuditResult,
  updateCollaborationRecord,
  deleteCollaborationDataForOwner,
  deleteCollaborationDataForCredential,
  getCollaborationDataForOwner,
  purgeExpiredCollaboration,
} from '../collaboration-store'
import { recommendIntervention, applyHabitualPauseBound } from '../intervention-engine'
import { EVENT_EFFECT } from '../trust-transition'
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

// Fixtures --------------------------------------------------------------------
const T0 = '2026-07-09T00:00:00.000Z'

const task: TaskProfile = {
  schema: 'trust-task-profile-v1',
  functionType: 'data-retrieval',
  circlesServed: ['requesting-user', 'record-subject'],
  conditions: ['read-only', 'PII present'],
  outputRequirements: ['structured verdict'],
  justiceSurface: { present: true, nonConsentingCircles: ['record-subject'], note: 'subject did not consent' },
}

const orchestrator: OrchestratorProfile = {
  schema: 'trust-orchestrator-profile-v1',
  agentId: 'ns:orchestrator@v1',
  currentKathekonta: ['fulfil the user request honestly'],
  examinationCapacity: { corroborationCheckAvailable: true, canReExamine: true, maxDepth: 'standard' },
  circle: ['requesting-user', 'record-subject', 'wider-org'],
  selectionPatterns: [],
}

// ════════════════════════════════════════════════════════════════════════════
// SECTION 1 — profiles: validators, A2A mapper (R18d), A6 presence
// ════════════════════════════════════════════════════════════════════════════
{
  assert(validateTaskProfile(task).ok, 'task profile: valid passes')
  assert(!validateTaskProfile({ ...task, functionType: '' }).ok, 'task profile: empty functionType fails')
  // Justice surface present but no circle named — a scoping gap (L1 Q1.2).
  assert(
    !validateTaskProfile({ ...task, justiceSurface: { present: true, nonConsentingCircles: [] } }).ok,
    'task profile: justice-present-no-circle is a scoping gap (fails)',
  )
  assert(!validateTaskProfile(null).ok, 'task profile: null fails')

  const candidate: CandidateProfile = {
    schema: 'trust-candidate-profile-v1',
    agentId: 'ns:candidate@v1',
    role: 'retriever',
    capabilityScope: ['data-retrieval'],
    credentialCoverage: [{ domain: 'phronesis', functionType: 'data-retrieval', coverageStatus: 'continuous' }],
    outputFormat: { emitsSignedTrace: true, emitsStructuredVerdict: true, statesUncertainty: true },
    purpose: 'retrieve records for the requesting user',
    priorInteraction: null,
  }
  assert(validateCandidateProfile(candidate).ok, 'candidate profile: valid passes')
  assert(!validateCandidateProfile({ ...candidate, outputFormat: {} }).ok, 'candidate profile: bad outputFormat fails')
  assert(validateOrchestratorProfile(orchestrator).ok, 'orchestrator profile: valid passes')
  assert(
    !validateOrchestratorProfile({ ...orchestrator, examinationCapacity: { corroborationCheckAvailable: true, canReExamine: true, maxDepth: 'ludicrous' } }).ok,
    'orchestrator profile: bad maxDepth fails',
  )

  // A2A mapper (R18d): maps role/purpose; IGNORES capability claims.
  const poisonedCard = {
    name: 'Helper',
    description: 'does retrieval',
    skills: ['everything'],
    capabilities: ['admin', 'delete-all'],
    tools: ['rm -rf'],
    output_modes: { signed: true, structured: true },
  }
  const hints = candidateHintsFromA2ACard(poisonedCard)
  assert(hints !== null, 'A2A mapper: usable card → hints')
  eq(hints?.role, 'Helper', 'A2A mapper: role ← card name')
  eq(hints?.purpose, 'does retrieval', 'A2A mapper: purpose ← card description')
  eq(hints?.outputFormat?.emitsSignedTrace, true, 'A2A mapper: signed hint mapped')
  assert(hints?.capabilityScope === undefined, 'A2A mapper: capability CLAIMS are NOT mapped (R18d)')
  assert(hints?.credentialCoverage === undefined, 'A2A mapper: credential coverage NOT sourced from a card (R18d)')
  eq(candidateHintsFromA2ACard(42), null, 'A2A mapper: non-object → null')

  // A6 — presence classification (NEVER exclusion).
  const profiled = classifyCandidatePresence(candidate)
  assert(profiled.profiled && profiled.posture === 'assess-on-profile' && !profiled.independenceFlagActive, 'A6: profiled → assess-on-profile, no independence flag')
  const unprofiled = classifyCandidatePresence(null)
  assert(!unprofiled.profiled && unprofiled.posture === 'assess-on-prior-tier7' && unprofiled.independenceFlagActive, 'A6: un-profiled → assess-on-prior-tier7 + independence flag (never excluded)')
}

// ════════════════════════════════════════════════════════════════════════════
// SECTION 2 — A9 authority boundary (unwaivable by trust; attenuation)
// ════════════════════════════════════════════════════════════════════════════
{
  const boundary: AuthorityBoundary = authorityBoundaryFromTask(task)
  eq(boundary.actionScope, 'data-retrieval', 'boundary: action-scope = task function type')
  assert(boundary.circleScope.length === 2, 'boundary: circle-scope = task circles')

  // Within scope → proceed.
  const within = validateAuthorityBoundary({ functionType: 'data-retrieval', circlesAffected: ['requesting-user'] }, boundary)
  assert(within.withinBoundary && within.disposition === 'proceed-within-boundary', 'boundary: within scope → proceed')

  // Exceeding action scope → escalate.
  const badAction = validateAuthorityBoundary({ functionType: 'data-deletion', circlesAffected: ['requesting-user'] }, boundary)
  assert(!badAction.withinBoundary && badAction.exceeded.includes('action-scope') && badAction.disposition === 'escalate-exceeds-boundary', 'boundary: exceed action-scope → escalate')

  // Exceeding circle scope → escalate + names the out-of-scope circle.
  const badCircle = validateAuthorityBoundary({ functionType: 'data-retrieval', circlesAffected: ['requesting-user', 'unrelated-third-party'] }, boundary)
  assert(!badCircle.withinBoundary && badCircle.exceeded.includes('circle-scope') && badCircle.outOfScopeCircles.includes('unrelated-third-party'), 'boundary: exceed circle-scope → escalate + names it')

  // Exceeding BOTH.
  const badBoth = validateAuthorityBoundary({ functionType: 'x', circlesAffected: ['y'] }, boundary)
  assert(badBoth.exceeded.length === 2, 'boundary: exceed both dimensions')

  // ── UNWAIVABLE BY TRUST LEVEL (structural). validateAuthorityBoundary takes NO
  //    trust/capability argument. The @ts-expect-error below makes tsc REJECT a
  //    trust argument; if a trust param were ever added, the directive becomes
  //    unused and tsc errors — so "unwaivable by trust" is locked at compile time.
  // @ts-expect-error — no trust/capability/accreditation parameter exists (A9 unwaivable)
  validateAuthorityBoundary({ functionType: 'data-retrieval', circlesAffected: [] }, boundary, 'sage_like')
  assert(true, 'boundary: validator has NO trust parameter (compile-time @ts-expect-error lock; A9 unwaivable by trust)')

  // Attenuation: task circles ⊆ orchestrator circle → attenuates.
  const att = boundaryAttenuatesOrchestrator(boundary, orchestrator)
  assert(att.attenuates && att.circlesBeyondOrchestrator.length === 0, 'attenuation: task circles ⊆ orchestrator → proper attenuation')
  // A task circle outside the orchestrator's extension → anomaly surfaced.
  const anomaly = boundaryAttenuatesOrchestrator({ schema: 'trust-authority-boundary-v1', actionScope: 'x', circleScope: ['ghost-circle'] }, orchestrator)
  assert(!anomaly.attenuates && anomaly.circlesBeyondOrchestrator.includes('ghost-circle'), 'attenuation: circle beyond orchestrator → anomaly')
}

// ════════════════════════════════════════════════════════════════════════════
// SECTION 3 — A7 L4 audit result (out-of-band; tier disposition)
// ════════════════════════════════════════════════════════════════════════════
{
  const clean: L4Signals = { priorPreferenceFormed: false, stakeInOutcome: false, resolutionBeforeComplete: false }
  const flagged: L4Signals = { priorPreferenceFormed: true, stakeInOutcome: false, resolutionBeforeComplete: false }

  const noFlag = resolveL4AuditResult({ signals: clean, trustTier: 'lower', traceRef: 'signed:k' })
  assert(!noFlag.anyFlag && noFlag.disposition === 'no-flag', 'L4: no signal → no-flag')

  const lower = resolveL4AuditResult({ signals: flagged, trustTier: 'lower', traceRef: 'signed:k' })
  assert(lower.anyFlag && lower.disposition === 'holds-selection', 'L4: flag at lower tier → HOLDS selection')

  const higher = resolveL4AuditResult({ signals: flagged, trustTier: 'higher', traceRef: 'signed:k' })
  assert(higher.anyFlag && higher.disposition === 'logs-and-surfaces', 'L4: flag at higher tier → logs + surfaces (no auto-hold)')

  // Any of the three signals fires anyFlag.
  const stake = resolveL4AuditResult({ signals: { priorPreferenceFormed: false, stakeInOutcome: true, resolutionBeforeComplete: false }, trustTier: 'lower', traceRef: 'signed:k' })
  assert(stake.anyFlag && stake.disposition === 'holds-selection', 'L4: stake-in-outcome alone fires (holds at lower)')
  eq(higher.traceRef, 'signed:k', 'L4: traceRef carried (R18f-parallel — the audit ran on a signed trace)')
}

// ════════════════════════════════════════════════════════════════════════════
// SECTION 4 — A8 habitual-stable flag (S4 finding → collaboration-record field)
// ════════════════════════════════════════════════════════════════════════════
{
  const nonHabitual = recommendIntervention({ proximity: 'sage_like' })
  eq(habitualStableFlagFromRecommendation(nonHabitual, 'phronesis', T0), null, 'habitual-stable: non-habitual rec → null')

  const habitualStable = applyHabitualPauseBound(recommendIntervention({ proximity: 'habitual' }), 2)
  assert(habitualStable.habitualStable, 'setup: recommendation is habitual-stable at the bound')
  const flag = habitualStableFlagFromRecommendation(habitualStable, 'andreia', T0)
  assert(flag !== null && flag.domain === 'andreia' && flag.recordedAt === T0, 'habitual-stable: habitual-stable rec → flag on the domain')
}

// ════════════════════════════════════════════════════════════════════════════
// SECTION 5 — A9 justice-failure cases (classify, record field, event mappers)
// ════════════════════════════════════════════════════════════════════════════
{
  // classify
  eq(
    classifyJusticeFailureCase({ surfaceIdentifiedAtSelection: true, subAgentBriefed: true, corroborationWouldHaveFlagged: true, corroborationRun: false }),
    'case-1-identified-briefed',
    'classify: identified + briefed → case 1',
  )
  eq(
    classifyJusticeFailureCase({ surfaceIdentifiedAtSelection: false, subAgentBriefed: false, corroborationWouldHaveFlagged: true, corroborationRun: false }),
    'case-2-catchable-not-run',
    'classify: catchable + not run → case 2',
  )
  eq(
    classifyJusticeFailureCase({ surfaceIdentifiedAtSelection: false, subAgentBriefed: false, corroborationWouldHaveFlagged: false, corroborationRun: false }),
    'case-3-uncatchable',
    'classify: not identified + not catchable → case 3',
  )
  // The pinned non-enumerated cell: identified but NOT briefed → case 2 (the safe direction).
  eq(
    classifyJusticeFailureCase({ surfaceIdentifiedAtSelection: true, subAgentBriefed: false, corroborationWouldHaveFlagged: false, corroborationRun: false }),
    'case-2-catchable-not-run',
    'classify: identified-not-briefed (pin) → case 2 (higher; safe direction)',
  )
  // Fold (S5 review, a9-fidelity): a CATCHABLE surface where the check WAS run yet the
  // sub-agent still acted (coherent in MEASURE mode) is NOT genuinely uncatchable — it
  // must be case 2, never the lighter case-3 flag (the under-penalizing bug, fixed).
  eq(
    classifyJusticeFailureCase({ surfaceIdentifiedAtSelection: false, subAgentBriefed: false, corroborationWouldHaveFlagged: true, corroborationRun: true }),
    'case-2-catchable-not-run',
    'classify: catchable + check-run-yet-violated → case 2 (never case-3 — A9 full-capacity-failure-to-act)',
  )
  // Case 3 is reachable ONLY when genuinely uncatchable: NOT identified AND corroboration
  // would not have flagged. An identified surface is never case-3 (the orchestrator saw it).
  eq(
    classifyJusticeFailureCase({ surfaceIdentifiedAtSelection: true, subAgentBriefed: true, corroborationWouldHaveFlagged: false, corroborationRun: false }),
    'case-1-identified-briefed',
    'classify: identified + briefed stays case 1 even when the text is uncatchable',
  )

  // record field
  const r1 = buildJusticeFailureReflection('case-1-identified-briefed')
  assert(r1.orchestratorEffect.domains.length === 1 && r1.orchestratorEffect.domains[0] === 'oversight' && r1.orchestratorEffect.kind === 'moderate-reduction', 'reflection: case 1 → orchestrator moderate oversight')
  const r2 = buildJusticeFailureReflection('case-2-catchable-not-run')
  assert(r2.orchestratorEffect.domains.includes('oversight') && r2.orchestratorEffect.domains.includes('dikaiosyne') && r2.orchestratorEffect.kind === 'higher-reduction', 'reflection: case 2 → orchestrator higher on oversight + dikaiosyne')
  const r3 = buildJusticeFailureReflection('case-3-uncatchable')
  assert(r3.orchestratorEffect.domains[0] === 'oversight' && r3.orchestratorEffect.kind === 'flag-not-reduction', 'reflection: case 3 → orchestrator FLAG (not a reduction)')

  // event mappers (orchestrator-side; consistent with the S1 transition EVENT_EFFECT)
  const base = { orchestratorAgentId: 'ns:orchestrator@v1', failureAssessmentRef: 'signed:key1', occurredAt: T0, correlationId: 'collab-1', ownerUserId: 'owner-a', credentialRef: 'api_key:z' }

  const e1 = deriveDelegationReflectionEvents({ ...base, case: 'case-1-identified-briefed' })
  assert(e1.length === 1 && e1[0].virtueDomain === 'oversight' && e1[0].eventType === 'delegation-reflection-case-1', 'events: case 1 → 1 oversight event')
  eq(EVENT_EFFECT[e1[0].eventType], 'decrease', 'events: case 1 event is a decrease (S1 transition)')
  eq(e1[0].agentId, 'ns:orchestrator@v1', 'events: case 1 event is on the ORCHESTRATOR')
  eq(e1[0].artifactRef, 'signed:key1', 'events: case 1 event is R18f-parallel (backed by the failure assessment)')

  const e2 = deriveDelegationReflectionEvents({ ...base, case: 'case-2-catchable-not-run' })
  assert(e2.length === 2, 'events: case 2 → 2 events (fanned oversight + dikaiosyne)')
  const e2domains = e2.map((e) => e.virtueDomain).sort()
  assert(e2domains[0] === 'dikaiosyne' && e2domains[1] === 'oversight', 'events: case 2 → oversight + dikaiosyne')
  assert(e2.every((e) => e.eventType === 'delegation-reflection-case-2' && EVENT_EFFECT[e.eventType] === 'decrease'), 'events: case 2 events are decreases')
  assert(e2[0].correlationId !== e2[1].correlationId, 'events: case 2 fanned rows get distinct correlation ids (idempotency index)')

  const e3 = deriveDelegationReflectionEvents({ ...base, case: 'case-3-uncatchable' })
  assert(e3.length === 1 && e3[0].eventType === 'delegation-reflection-case-3', 'events: case 3 → 1 event')
  eq(EVENT_EFFECT[e3[0].eventType], 'flag', 'events: case 3 event is a FLAG (no reduction) per the S1 transition')

  // R18f-parallel: no verifiable ref ⇒ NO events (fail-honest, never fabricate).
  eq(deriveDelegationReflectionEvents({ ...base, failureAssessmentRef: '', case: 'case-1-identified-briefed' }).length, 0, 'events: no failure-assessment ref ⇒ no events (R18f-parallel)')
}

// ════════════════════════════════════════════════════════════════════════════
// SECTION 6 — collaboration record (fresh open; write-once guards; validate)
// ════════════════════════════════════════════════════════════════════════════
{
  const rec = newCollaborationRecord({ orchestratorAgentId: 'ns:orchestrator@v1', taskRef: 'task-1', ownerUserId: 'owner-a' })
  assert(rec.status === 'open' && rec.authorityBoundary === null && rec.l4AuditResult === null && rec.independenceDeficits.length === 0, 'record: fresh open record')
  assert(validateCollaborationRecord(rec), 'record: validate passes on a fresh record')
  assert(!validateCollaborationRecord({ schema: 'wrong' }), 'record: validate fails on a bad shape')

  const boundary: AuthorityBoundary = { schema: 'trust-authority-boundary-v1', actionScope: 'data-retrieval', circleScope: ['a'] }
  // write-once guard — boundary
  assert(canSetAuthorityBoundary(rec, boundary).allowed, 'write-once: set boundary when null → allowed')
  const withBoundary = { ...rec, authorityBoundary: boundary }
  assert(canSetAuthorityBoundary(withBoundary, boundary).allowed, 'write-once: idempotent re-set of the SAME boundary → allowed')
  assert(!canSetAuthorityBoundary(withBoundary, { ...boundary, actionScope: 'data-deletion' }).allowed, 'write-once: a DIFFERENT boundary → forbidden (A9 unwaivable)')

  // write-once guard — L4 result
  const l4 = resolveL4AuditResult({ signals: { priorPreferenceFormed: true, stakeInOutcome: false, resolutionBeforeComplete: false }, trustTier: 'lower', traceRef: 'signed:k' })
  assert(canSetL4AuditResult(rec, l4).allowed, 'write-once: set L4 when null → allowed')
  const withL4 = { ...rec, l4AuditResult: l4 }
  assert(canSetL4AuditResult(withL4, l4).allowed, 'write-once: idempotent re-write of the identical L4 → allowed')
  const differentL4 = resolveL4AuditResult({ signals: { priorPreferenceFormed: false, stakeInOutcome: true, resolutionBeforeComplete: false }, trustTier: 'higher', traceRef: 'signed:k' })
  assert(!canSetL4AuditResult(withL4, differentL4).allowed, 'write-once: a DIFFERENT L4 result → forbidden (A7 readable-not-modifiable)')
}

// ════════════════════════════════════════════════════════════════════════════
// SECTION 7 — the store (CRUD + data-rights + purge + missing-table-benign)
// ════════════════════════════════════════════════════════════════════════════
;(async () => {
  const fake = makeFakeSupabase()
  const rec = newCollaborationRecord({ orchestratorAgentId: 'ns:orch@v1', taskRef: 'task-x', ownerUserId: 'owner-1', credentialRef: 'api_key:c1' })

  const open1 = await openCollaborationRecord(rec, fake.client)
  assert(open1.ok && open1.value.opened, 'store: open a fresh record → opened')
  const open2 = await openCollaborationRecord(rec, fake.client)
  assert(open2.ok && !open2.value.opened, 'store: re-open same (orchestrator, task) → idempotent (not opened)')

  const boundary: AuthorityBoundary = { schema: 'trust-authority-boundary-v1', actionScope: 'data-retrieval', circleScope: ['requesting-user'] }
  const sb = await recordAuthorityBoundary('ns:orch@v1', 'task-x', boundary, fake.client)
  assert(sb.ok, 'store: recordAuthorityBoundary ok')

  const l4 = resolveL4AuditResult({ signals: { priorPreferenceFormed: true, stakeInOutcome: false, resolutionBeforeComplete: false }, trustTier: 'lower', traceRef: 'signed:k' })
  const sl = await recordL4AuditResult('ns:orch@v1', 'task-x', l4, fake.client)
  assert(sl.ok, 'store: recordL4AuditResult ok')

  const up = await updateCollaborationRecord('ns:orch@v1', 'task-x', { candidateAgentId: 'ns:cand@v1', status: 'finalized' }, fake.client)
  assert(up.ok, 'store: updateCollaborationRecord ok')

  const read = await readCollaborationRecord('ns:orch@v1', 'task-x', fake.client)
  const rv = read.ok ? read.value : null
  assert(rv !== null, 'store: read back the record')
  eq(rv?.authorityBoundary?.actionScope, 'data-retrieval', 'store: boundary persisted')
  eq(rv?.l4AuditResult?.disposition, 'holds-selection', 'store: L4 result persisted')
  eq(rv?.candidateAgentId, 'ns:cand@v1', 'store: candidate + status persisted')
  eq(rv?.status, 'finalized', 'store: status persisted')

  const readMiss = await readCollaborationRecord('ns:orch@v1', 'no-such-task', fake.client)
  assert(readMiss.ok && readMiss.value === null, 'store: read absent → null')
})()

;(async () => {
  // Data rights: delete by owner + by credential + export + purge.
  const fake = makeFakeSupabase()
  await openCollaborationRecord(newCollaborationRecord({ orchestratorAgentId: 'ns:o2@v1', taskRef: 't2', ownerUserId: 'owner-2', credentialRef: 'api_key:cred-2' }), fake.client)

  const exp = await getCollaborationDataForOwner('owner-2', fake.client)
  assert(exp.ok && exp.value.length === 1, 'store: export by owner returns the record')

  const del = await deleteCollaborationDataForOwner('owner-2', fake.client)
  assert(del.ok && del.value === 1, 'store: delete by owner removes the record')
  eq(fake.tables.collaboration_records.filter((r) => r.owner_user_id === 'owner-2').length, 0, 'store: no owner rows remain after delete')

  // Consumer erasure by credential.
  await openCollaborationRecord(newCollaborationRecord({ orchestratorAgentId: 'ns:o3@v1', taskRef: 't3', ownerUserId: null, credentialRef: 'api_key:cons' }), fake.client)
  const delc = await deleteCollaborationDataForCredential('api_key:cons', fake.client)
  assert(delc.ok && delc.value === 1, 'store: delete by credential removes the record')
})()

;(async () => {
  // Purge: an expired row is swept; a live row is kept.
  const fake = makeFakeSupabase()
  fake.tables.collaboration_records.push({ id: 'c-old', orchestrator_agent_id: 'x', task_ref: 'old', owner_user_id: null, credential_ref: null, status: 'open', independence_deficits: [], retain_until: '2020-01-01T00:00:00.000Z' })
  fake.tables.collaboration_records.push({ id: 'c-new', orchestrator_agent_id: 'x', task_ref: 'new', owner_user_id: null, credential_ref: null, status: 'open', independence_deficits: [], retain_until: '2999-01-01T00:00:00.000Z' })
  const purge = await purgeExpiredCollaboration(fake.client)
  eq(purge.error, null, 'store: purge no error')
  assert(purge.deleted >= 1, 'store: purge removed the expired record')
  assert(fake.tables.collaboration_records.some((r) => r.id === 'c-new'), 'store: purge kept the live record')
  assert(!fake.tables.collaboration_records.some((r) => r.id === 'c-old'), 'store: purge removed the expired record row')
})()

;(async () => {
  // Missing-table-benign: data-rights on an un-migrated store must be byte-equivalent
  // (no error / empty) — so the Live data-rights routes are unaffected before the
  // migration lands (the S5 flag-off byte-identity proof at the store level).
  const fake = makeFakeSupabase({ missingTables: true })
  const del = await deleteCollaborationDataForOwner('owner-x', fake.client)
  assert(del.ok && del.value === 0, 'store: delete on missing table is benign (0)')
  const delc = await deleteCollaborationDataForCredential('api_key:x', fake.client)
  assert(delc.ok && delc.value === 0, 'store: delete-by-credential on missing table is benign (0)')
  const exp = await getCollaborationDataForOwner('owner-x', fake.client)
  assert(exp.ok && exp.value.length === 0, 'store: export on missing table is benign empty')
  const purge = await purgeExpiredCollaboration(fake.client)
  eq(purge.error, null, 'store: purge on missing table is benign (no error)')
  const open = await openCollaborationRecord(newCollaborationRecord({ orchestratorAgentId: 'z', taskRef: 'z' }), fake.client)
  assert(open.ok, 'store: open on missing table is benign ok')
})()

// ════════════════════════════════════════════════════════════════════════════
// Summary (deferred to flush the async store blocks)
// ════════════════════════════════════════════════════════════════════════════
setTimeout(() => {
  console.log(`\nS5 profiles + collaboration-record battery: ${passed} passed, ${failed} failed`)
  if (failed > 0) {
    console.error('Failures:\n' + failures.map((f) => `  - ${f}`).join('\n'))
    process.exit(1)
  }
}, 100)
