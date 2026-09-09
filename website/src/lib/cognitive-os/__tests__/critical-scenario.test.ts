/**
 * critical-scenario.test.ts — STEP 3, THE CRITICAL FIRST TEST.
 *
 * Run: npx tsx src/lib/cognitive-os/__tests__/critical-scenario.test.ts
 *
 * The gate on Phase 1 being complete (instruction Step 3 / spec §27):
 *
 *   Decision D depends on Claim A → new evidence arrives → Claim A is invalidated
 *   → Belief State version increments → TMS identifies dependent conclusions →
 *   Decision D is identified as affected → epistemic debt increases → Decision D
 *   becomes REVIEW_REQUIRED → THE ORIGINAL DECISION REMAINS IMMUTABLE → the system
 *   routes the issue for reassessment → new evidence is evaluated → the decision is
 *   reaffirmed or replaced → THE COMPLETE TRAJECTORY REMAINS RECONSTRUCTABLE.
 *
 * "This test must pass DETERMINISTICALLY. If it does not pass, Phase 1 is not
 * complete."
 *
 * HOW DETERMINISM IS PROVEN RATHER THAN ASSERTED: the entire scenario is run
 * TWICE, from scratch, with two independently constructed clocks, and the two
 * full serialised traces are compared byte-for-byte. A scenario that merely
 * "passed" once would not establish determinism; two identical traces do.
 *
 * HERMETIC: the Supabase env is deleted up front, so any accidental DB path
 * throws loudly rather than silently succeeding (the S9b lesson).
 */

const SAVED_ENV: Record<string, string | undefined> = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
}
delete process.env.NEXT_PUBLIC_SUPABASE_URL
delete process.env.SUPABASE_SERVICE_ROLE_KEY

import { createDeterministicClock, carriedProximityRank } from '../types'
import { createClaim, attestEvidence, phase1UnverifiedAuthority, type EvidenceRef } from '../claim'
import { EventStore } from '../event-store'
import { DependencyGraph } from '../dependency-graph'
import { createBeliefState, withClaim, findClaim } from '../belief-state'
import { analyseStaleness, type ReExamination } from '../truth-maintenance'
import {
  registerEvidence,
  retractClaim,
  propagateInvalidation,
  commitDecision,
  markDecisionForReview,
  deriveDecisionStatus,
  supersededDecisions,
  type DecisionRecord,
} from '../belief-revision'

let passed = 0
let failed = 0
const failures: string[] = []
function check(label: string, ok: boolean): void {
  if (ok) passed++
  else {
    failed++
    failures.push(label)
    console.error(`  FAIL  ${label}`)
  }
}

// Evidence is BRANDED after PR19: it can only be produced by attestEvidence, and
// every attestation must name an authority. Phase 1's authority verifies nothing
// and says so — see claim.ts's header limit (c).
const AUTH = phase1UnverifiedAuthority('critical-scenario-harness')
const verified = (id: string): EvidenceRef => attestEvidence(id, 'verified', AUTH)
const contradicting = (id: string): EvidenceRef => attestEvidence(id, 'contradicted', AUTH)

// ============================================================================
// THE SCENARIO — returns a full serialisable trace for the determinism compare
// ============================================================================

interface ScenarioTrace {
  readonly steps: Record<string, unknown>
  readonly eventLog: readonly {
    seq: number
    type: string
    scope: string
    claim?: string
    decision?: string
  }[]
}

function runScenario(): { trace: ScenarioTrace; assertions: () => void } {
  const clock = createDeterministicClock()
  const store = new EventStore(clock)
  const graph = new DependencyGraph()

  // ── Setup: Evidence E1 → Claim A → Claim B → Claim C, and Decision D ──────
  let state = createBeliefState(clock)

  const claimA = createClaim(
    {
      content: 'The supplier can deliver by Q3.',
      provenance: {
        source_ids: ['src-supplier-statement'],
        evidence_ids: [verified('ev-1')],
        created_by: 'analysis-service',
        created_at: clock.now(),
      },
      dependency_graph_id: 'dg-1',
      belief_state_id: state.belief_state_id,
      belief_state_version: state.version,
    },
    clock,
  )
  const setupEvtA = store.append({
    event_type: 'OBSERVE',
    scope: 'Laboratory',
    caused_by: 'analysis-service',
    reason: 'claim A asserted',
    claim_id: claimA.claim_id,
    previous_state_version: state.version,
    new_state_version: state.version + 1,
  })
  state = withClaim(state, claimA, setupEvtA.event_id, clock)

  const claimB = createClaim(
    {
      content: 'The Q3 launch window is feasible.',
      provenance: {
        source_ids: ['src-plan'],
        evidence_ids: [verified('ev-2')],
        created_by: 'analysis-service',
        created_at: clock.now(),
      },
      dependency_graph_id: 'dg-1',
      belief_state_id: state.belief_state_id,
      belief_state_version: state.version,
    },
    clock,
  )
  const setupEvtB = store.append({
    event_type: 'INFER',
    scope: 'Laboratory',
    caused_by: 'analysis-service',
    reason: 'claim B derived from A',
    claim_id: claimB.claim_id,
    previous_state_version: state.version,
    new_state_version: state.version + 1,
  })
  state = withClaim(state, claimB, setupEvtB.event_id, clock)

  const claimC = createClaim(
    {
      content: 'Marketing spend should be committed for Q3.',
      provenance: {
        source_ids: ['src-plan'],
        evidence_ids: [verified('ev-3')],
        created_by: 'analysis-service',
        created_at: clock.now(),
      },
      dependency_graph_id: 'dg-1',
      belief_state_id: state.belief_state_id,
      belief_state_version: state.version,
    },
    clock,
  )
  const setupEvtC = store.append({
    event_type: 'INFER',
    scope: 'Laboratory',
    caused_by: 'analysis-service',
    reason: 'claim C derived from B',
    claim_id: claimC.claim_id,
    previous_state_version: state.version,
    new_state_version: state.version + 1,
  })
  state = withClaim(state, claimC, setupEvtC.event_id, clock)

  // Graph: E1 → A → B → C → D
  graph.addNode({ node_id: 'n-ev1', kind: 'evidence', ref_id: 'ev-1' })
  graph.addNode({ node_id: 'n-A', kind: 'claim', ref_id: claimA.claim_id })
  graph.addNode({ node_id: 'n-B', kind: 'derived_claim', ref_id: claimB.claim_id })
  graph.addNode({ node_id: 'n-C', kind: 'derived_claim', ref_id: claimC.claim_id })
  graph.addNode({ node_id: 'n-D', kind: 'decision' })
  // n-E: a dependent ASSUMPTION whose establishing rigour was never recorded.
  // It maps to no claim and no decision, so propagation traverses it without
  // marking anything — its only job is to be INDETERMINATE to the TMS, which is
  // how the third reused semantic (indeterminate is NOT resolved) gets exercised.
  graph.addNode({ node_id: 'n-E', kind: 'assumption' })
  graph.addEdge('n-ev1', 'n-A')
  graph.addEdge('n-A', 'n-B')
  graph.addEdge('n-B', 'n-C')
  graph.addEdge('n-C', 'n-D')
  graph.addEdge('n-B', 'n-E')

  // ── Threshold commits Decision D ─────────────────────────────────────────
  const proposal = commitDecision(
    {
      action: 'Commit Q3 marketing spend.',
      state,
      supporting_claims: [claimA.claim_id, claimB.claim_id, claimC.claim_id],
      known_uncertainties: ['supplier capacity unconfirmed beyond the statement'],
      carried_proximity_rank: carriedProximityRank('deliberate'),
    },
    { scope: 'Threshold', caused_by: 'decision-service', reason: 'evidence sufficient at v4' },
    store,
    clock,
  )
  const decisionD: DecisionRecord = proposal.decision
  // Snapshot the ORIGINAL, to prove later that nothing changed it.
  const originalDecisionSnapshot = JSON.stringify(decisionD)
  const versionAtCommit = state.version

  // ── STEP 1+2: new evidence arrives, contradicting Claim A ────────────────
  const evidenceResult = registerEvidence(
    state,
    claimA.claim_id,
    contradicting('ev-99'),
    {
      scope: 'Laboratory',
      caused_by: 'evidence-intake',
      reason: 'supplier withdrew the Q3 commitment in writing',
    },
    store,
    clock,
  )
  state = evidenceResult.state
  const claimAAfterEvidence = evidenceResult.claim

  // ── STEP 3: Claim A is invalidated ───────────────────────────────────────
  const retraction = retractClaim(
    state,
    claimA.claim_id,
    {
      scope: 'Laboratory',
      caused_by: 'evidence-intake',
      reason: 'contradicted by ev-99',
      causal_dependencies: [evidenceResult.observeEvent],
    },
    store,
    clock,
  )
  const versionBeforeRetraction = state.version
  state = retraction.state

  // ── STEP 5+6+7: propagate; identify B, C and the dependent decision ──────
  const nodeToClaim = (n: string): string | undefined =>
    n === 'n-A' ? claimA.claim_id : n === 'n-B' ? claimB.claim_id : n === 'n-C' ? claimC.claim_id : undefined
  const nodeToDecision = (n: string): string | undefined =>
    n === 'n-D' ? decisionD.decision_id : undefined

  const propagation = propagateInvalidation(
    state,
    'n-A',
    graph,
    { nodeToClaim, nodeToDecision },
    {
      scope: 'Laboratory',
      caused_by: 'tms',
      reason: 'claim A retracted',
      causal_dependencies: [retraction.event],
    },
    store,
    clock,
  )
  const debtBefore = state.summary_scores.epistemic_debt_score.value
  state = propagation.state
  const debtAfter = state.summary_scores.epistemic_debt_score.value

  // TMS staleness reading, with NOTHING re-examined yet
  const rigourOf = (n: string) => (n === 'n-B' || n === 'n-C' || n === 'n-D' ? 'standard' as const : null)
  const stalenessBefore = analyseStaleness('n-A', graph, rigourOf, [])

  // ── STEP 9: mark D for review (the RECORD is not touched) ────────────────
  const reviewEvent = markDecisionForReview(
    decisionD.decision_id,
    {
      scope: 'Threshold',
      caused_by: 'tms',
      reason: 'supporting claim A retracted; B and C stale',
      causal_dependencies: [retraction.event],
    },
    store,
  )
  const statusAfterReview = deriveDecisionStatus(decisionD.decision_id, store)

  // ── STEP 11+12: route for reassessment; new evidence is evaluated ────────
  const reExaminations: ReExamination[] = [
    { re_examination_id: 'rx-B', supersedes_ref: 'n-B', rigour: 'standard', seq: 1000 },
    { re_examination_id: 'rx-C', supersedes_ref: 'n-C', rigour: 'thorough', seq: 1001 },
    { re_examination_id: 'rx-D', supersedes_ref: 'n-D', rigour: 'standard', seq: 1002 },
  ]
  const stalenessAfter = analyseStaleness('n-A', graph, rigourOf, reExaminations)

  // A control in which n-E's rigour IS recorded and IS re-examined: only then
  // may the verdict be clean. This is the positive half of the conservative pin.
  const rigourOfAll = (n: string) =>
    n === 'n-B' || n === 'n-C' || n === 'n-D' || n === 'n-E' ? ('standard' as const) : null
  const stalenessFullyClean = analyseStaleness('n-A', graph, rigourOfAll, [
    ...reExaminations,
    { re_examination_id: 'rx-E', supersedes_ref: 'n-E', rigour: 'standard', seq: 1003 },
  ])

  // A deliberately INSUFFICIENT re-examination of B — the same-depth rule bites
  const stalenessCursory = analyseStaleness('n-A', graph, rigourOf, [
    { re_examination_id: 'rx-B-weak', supersedes_ref: 'n-B', rigour: 'cursory', seq: 1000 },
    { re_examination_id: 'rx-C', supersedes_ref: 'n-C', rigour: 'thorough', seq: 1001 },
    { re_examination_id: 'rx-D', supersedes_ref: 'n-D', rigour: 'standard', seq: 1002 },
  ])

  // ── STEP 15: a NEW decision version replaces D ───────────────────────────
  const replacement = commitDecision(
    {
      action: 'Defer Q3 marketing spend pending a confirmed supplier commitment.',
      state,
      supporting_claims: [claimB.claim_id, claimC.claim_id],
      known_uncertainties: ['supplier Q3 capacity now contradicted'],
      carried_proximity_rank: carriedProximityRank('principled'),
      supersedes: decisionD.decision_id,
    },
    { scope: 'Threshold', caused_by: 'decision-service', reason: 'reassessed after retraction' },
    store,
    clock,
  )
  const superseded = supersededDecisions([decisionD, replacement.decision])
  const statusOfOriginalNow = deriveDecisionStatus(decisionD.decision_id, store, superseded)

  // ── STEP 16: the complete trajectory ─────────────────────────────────────
  const fullLog = store.all()
  const replayAtCommit = store.replayTo(decisionD ? fullLog.find((e) => e.event_type === 'COMMIT')!.seq : 0)

  const trace: ScenarioTrace = {
    steps: {
      versionAtCommit,
      versionAfterEvidence: evidenceResult.state.version,
      versionBeforeRetraction,
      versionAfterRetraction: retraction.state.version,
      versionFinal: state.version,
      claimAConfidenceAfterEvidence: claimAAfterEvidence.confidence,
      claimAStatusFinal: findClaim(state, claimA.claim_id)?.epistemic_status,
      claimBStatusFinal: findClaim(state, claimB.claim_id)?.epistemic_status,
      claimCStatusFinal: findClaim(state, claimC.claim_id)?.epistemic_status,
      propagationStale: propagation.staleClaims,
      propagationDecisions: propagation.affectedDecisions,
      debtBefore,
      debtAfter,
      stalenessBefore,
      stalenessAfter,
      stalenessFullyClean,
      stalenessCursory,
      statusAfterReview,
      statusOfOriginalNow,
      reviewEvent,
      originalDecisionSnapshot,
      currentDecisionSerialisation: JSON.stringify(decisionD),
      replacementSupersedes: replacement.decision.supersedes,
      proposalKind: proposal.kind,
      replayLength: replayAtCommit.length,
      fullLogLength: fullLog.length,
    },
    eventLog: fullLog.map((e) => ({
      seq: e.seq,
      type: e.event_type,
      scope: e.scope,
      claim: e.claim_id,
      decision: e.decision_id,
    })),
  }

  const assertions = (): void => {
    const s = trace.steps as Record<string, any>

    // 1 + 2 — evidence registered, epistemic events created
    check('§1 new evidence produced an OBSERVE event',
      trace.eventLog.some((e) => e.type === 'OBSERVE' && e.claim === claimA.claim_id))
    check('§2 the change to claim A produced a CORRECT event',
      trace.eventLog.some((e) => e.type === 'CORRECT' && e.claim === claimA.claim_id))

    // 3 — Claim A invalidated
    check('§3 contradicting evidence drove claim A confidence to unsupported',
      s.claimAConfidenceAfterEvidence === 'unsupported')
    check('§3 claim A is retracted', s.claimAStatusFinal === 'retracted')
    check('§3 a RETRACT event exists for claim A',
      trace.eventLog.some((e) => e.type === 'RETRACT' && e.claim === claimA.claim_id))

    // 4 — version increments, monotonically, at every step
    check('§4 version incremented on evidence', s.versionAfterEvidence > s.versionAtCommit)
    check('§4 version incremented on retraction',
      s.versionAfterRetraction > s.versionBeforeRetraction)
    check('§4 version incremented on propagation', s.versionFinal > s.versionAfterRetraction)

    // 5 + 6 — TMS identifies dependent conclusions
    check('§5 propagation marked B and C stale',
      s.claimBStatusFinal === 'stale' && s.claimCStatusFinal === 'stale')
    check('§6 propagation reported exactly claims B and C as stale',
      s.propagationStale.length === 2 &&
        s.propagationStale.includes(claimB.claim_id) &&
        s.propagationStale.includes(claimC.claim_id))

    // 7 — the dependent decision is identified
    check('§7 propagation identified decision D as affected',
      s.propagationDecisions.length === 1 &&
        s.propagationDecisions[0] === decisionD.decision_id)

    // 8 — epistemic debt increases
    check('§8 epistemic debt increased', s.debtAfter > s.debtBefore)

    // 9 — REVIEW_REQUIRED
    check('§9 decision D derives as REVIEW_REQUIRED', s.statusAfterReview === 'REVIEW_REQUIRED')

    // 10 — THE ORIGINAL DECISION REMAINS IMMUTABLE
    check('§10 the original decision record is byte-identical after the whole flow',
      s.originalDecisionSnapshot === s.currentDecisionSerialisation)
    check('§10 the original decision record is frozen', Object.isFrozen(decisionD))

    // 11 + 12 — routing and re-evaluation; the TMS verdict moves only when the
    //           re-examinations actually satisfy the reused semantics
    check('§11 before re-examination the TMS verdict is unresolved',
      s.stalenessBefore.verdict === 'unresolved' && s.stalenessBefore.unresolved === 3)
    check('§11 an item with unrecorded rigour reads INDETERMINATE, not resolved',
      s.stalenessBefore.indeterminate === 1 && s.stalenessBefore.perItem['n-E'] === 'indeterminate')
    check('§12 EXPLICIT REF LINK: each re-examination resolved exactly the item it named',
      s.stalenessAfter.resolved === 3 &&
        s.stalenessAfter.perItem['n-B'] === 'resolved' &&
        s.stalenessAfter.perItem['n-C'] === 'resolved' &&
        s.stalenessAfter.perItem['n-D'] === 'resolved')
    check('§12 CONSERVATIVE DIRECTION: 3 resolved + 1 indeterminate is STILL "unresolved" — ' +
      'an unestablished item never counts toward a clean verdict',
      s.stalenessAfter.verdict === 'unresolved' && s.stalenessAfter.indeterminate === 1)
    check('§12 and the verdict IS reachable: with n-E recorded and re-examined, it is clean',
      s.stalenessFullyClean.verdict === 'clean' && s.stalenessFullyClean.resolved === 4 &&
        s.stalenessFullyClean.indeterminate === 0)
    check('§12 SAME-DEPTH RULE BITES: a cursory re-exam of a standard item does NOT resolve it',
      s.stalenessCursory.verdict === 'unresolved' && s.stalenessCursory.unresolved === 1)

    // 15 — a new decision version
    check('§15 the replacement decision supersedes D',
      s.replacementSupersedes === decisionD.decision_id)
    check('§15 D now derives as SUPERSEDED', s.statusOfOriginalNow === 'SUPERSEDED')
    check('§15 commitment produced an AUTHORISED PROPOSAL, never an execution (C9)',
      s.proposalKind === 'authorised_proposal')
    check('§15 no EXECUTE event was produced anywhere in the flow',
      !trace.eventLog.some((e) => e.type === 'EXECUTE'))

    // 16 — the complete trajectory is reconstructable
    check('§16 replay to the commit point returns a strict prefix of the log',
      s.replayLength > 0 && s.replayLength < s.fullLogLength)
    check('§16 every event carries a scope and a monotonic seq',
      trace.eventLog.every((e, i) => typeof e.scope === 'string' && (i === 0 || e.seq > trace.eventLog[i - 1].seq)))
    check('§16 the trajectory contains the full causal story: OBSERVE→CORRECT→RETRACT→CHALLENGE→REVIEW→COMMIT',
      ['OBSERVE', 'CORRECT', 'RETRACT', 'CHALLENGE', 'REVIEW', 'COMMIT'].every((t) =>
        trace.eventLog.some((e) => e.type === t)))
  }

  return { trace, assertions }
}

// ============================================================================
// RUN — twice, and compare
// ============================================================================

console.log('\nSTEP 3 — THE CRITICAL FIRST TEST (belief retraction → propagation → reopening)\n')

const runOne = runScenario()
runOne.assertions()

const runTwo = runScenario()

check(
  'DETERMINISM — two independent runs produce byte-identical traces',
  JSON.stringify(runOne.trace) === JSON.stringify(runTwo.trace),
)

// NON-VACUITY FLOOR — a battery that stops asserting still prints "0 failed".
const MIN_ASSERTIONS = 28
check(
  `NON-VACUITY FLOOR — at least ${MIN_ASSERTIONS} assertions must have run (guard against a guard that stopped guarding)`,
  passed + failed >= MIN_ASSERTIONS,
)

for (const [k, v] of Object.entries(SAVED_ENV)) {
  if (v === undefined) delete process.env[k]
  else process.env[k] = v
}

if (failures.length > 0) {
  console.error('\nFAILURES:')
  for (const f of failures) console.error(`  - ${f}`)
}
console.log(`\ncritical scenario: ${passed} passed, ${failed} failed`)
console.log(
  failed === 0
    ? 'PHASE 1 GATE: PASSED — the scenario runs deterministically.\n'
    : 'PHASE 1 GATE: FAILED — Phase 1 is NOT complete.\n',
)
process.exit(failed === 0 ? 0 : 1)
