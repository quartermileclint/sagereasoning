/**
 * atl-iteration-patterns.test.ts — Agent Trust Layer Wrapper Component 5 (the
 * three iteration patterns) functional tests + invariant checks.
 *
 * Run via: `npx tsx website/src/lib/substrate/__tests__/atl-iteration-patterns.test.ts`
 * (mirrors the atl-wrapper / atl-bridge / score-architecture verification
 * pattern; no Jest framework dependency).
 *
 * PR2 — build-to-wire verification immediate: this file invokes every exported
 * atl-iteration-patterns function in the same session atl-iteration-patterns.ts
 * is written.
 *
 * COVERAGE
 *
 *   runSequentialStep — Pattern 1
 *     SEQ-1  accumulates one action (evaluated_actions length 1, total 1)
 *     SEQ-2  no grade check below the cadence (step 1, interval 20)
 *     SEQ-3  grade check FIRES at the cadence (20th accumulation)
 *     SEQ-4  force_grade_check forces a check off-cadence
 *     SEQ-5  emits both Layer 1 payloads with the correct schema tags
 *     SEQ-6  does not mutate the input profile
 *     SEQ-7  returned profile is the trajectory-advanced one when a check ran
 *
 *   runSequentialLoop — Pattern 1
 *     LOOP-1  empty steps → profile unchanged, steps []
 *     LOOP-2  folds N steps — final total === N, N step results
 *     LOOP-3  threads the advanced profile (final evaluated_actions length N)
 *     LOOP-4  a grade UPGRADE is reachable through the loop (40 good-habitual)
 *     LOOP-5  the upgrade step's carried_profile_payload carries the new grade
 *
 *   evaluateInParallel — Pattern 2
 *     PAR-1  empty candidates → ranked [], top null
 *     PAR-2  renders N candidates — ranked.length === N
 *     PAR-3  ranks by scalar score, highest first
 *     PAR-4  ties broken by input order (deterministic)
 *     PAR-5  top === ranked[0]
 *     PAR-6  RankedCandidate.index is the stable input-array identity
 *     PAR-7  PURE — identical candidates → identical ranking
 *
 *   accumulateChosen — Pattern 2
 *     CHOSE-1  accumulates exactly one action (the chosen candidate)
 *     CHOSE-2  the accumulated action is the CHOSEN candidate's
 *     CHOSE-3  throws on an out-of-range chosenIndex
 *     CHOSE-4  returns a SequentialStepResult (both Layer 1 payloads present)
 *
 *   toPeerAgentAssessments — Pattern 3
 *     PEER-1  empty peers → []
 *     PEER-2  one payload per peer
 *     PEER-3  payload schema tag + agent_id + derived accreditation
 *     PEER-4  latest_rendering null when absent, non-null when supplied
 *     PEER-5  PURE — identical peers → identical output
 *
 *   runOrchestrationStep — Pattern 3
 *     ORCH-1  the orchestrator accumulates its OWN trajectory
 *     ORCH-2  peer_agent_assessments attached — length === peers.length
 *     ORCH-3  a peer's grade is NOT propagated to the orchestrator's grade
 *     ORCH-4  the result is a superset of a SequentialStepResult
 *     ORCH-5  empty peers → peer_agent_assessments []
 *
 *   CONSTANTS
 *     CONST-1  MAX_ORCHESTRATION_DEPTH === 1
 *     CONST-2  PEER_AGENT_ASSESSMENT_SCHEMA tag
 *
 *   INVARIANTS
 *     DET-1  runSequentialStep is deterministic modulo ISO-timestamp fields
 *     DET-2  runOrchestrationStep is deterministic modulo ISO-timestamp fields
 *     RT-1   carried_profile + profile_provenance + peer_agent_assessments
 *            payloads all round-trip through validateLayer1Schema
 *
 * Exit code 0 = all pass. Non-zero = failures printed.
 */

import {
  runSequentialStep,
  runSequentialLoop,
  evaluateInParallel,
  accumulateChosen,
  toPeerAgentAssessments,
  runOrchestrationStep,
  MAX_ORCHESTRATION_DEPTH,
  PEER_AGENT_ASSESSMENT_SCHEMA,
  type ParallelCandidate,
  type PeerAgent,
} from '../atl-iteration-patterns'

import {
  createCarriedProfile,
  accumulate,
  CARRIED_PROFILE_PAYLOAD_SCHEMA,
  PROFILE_PROVENANCE_PAYLOAD_SCHEMA,
  type CarriedProfile,
  type BridgeContext,
  type KatorthomaProximityLevel,
} from '../atl-wrapper'

import { renderAgentMode } from '../agent-mode-service'

import type { Layer3ModeRenderInput } from '../philosophical-mode-service'

import type { Layer2Assessment } from '../../translation-sandwich/layer2-mechanisms'
import { validateLayer1Schema } from '../../translation-sandwich/layer1-extractor'

// ============================================================================
// Test runner — plain assertions; exit code reports pass/fail
// ============================================================================

let passCount = 0
let failCount = 0
const failures: string[] = []

function assert(label: string, condition: boolean, detail?: string): void {
  if (condition) {
    passCount++
    console.log(`PASS  ${label}`)
  } else {
    failCount++
    const msg = detail ? `${label} — ${detail}` : label
    failures.push(msg)
    console.log(`FAIL  ${msg}`)
  }
}

function assertEqual<T>(label: string, actual: T, expected: T): void {
  const ok = actual === expected
  assert(
    label,
    ok,
    ok
      ? undefined
      : `expected=${JSON.stringify(expected)}, actual=${JSON.stringify(actual)}`
  )
}

function assertThrows(label: string, fn: () => unknown): void {
  let threw = false
  try {
    fn()
  } catch {
    threw = true
  }
  assert(label, threw, 'expected the call to throw')
}

// ============================================================================
// Fixtures — minimal valid Layer2Assessment, parameterised. Modelled on the
// MINIMAL_ASSESSMENT fixture in atl-wrapper.test.ts (a known-valid shape). A
// fresh object is returned each call — important for the no-mutation checks.
// ============================================================================

function makeAssessment(opts: {
  proximity: KatorthomaProximityLevel
  is_kathekon?: boolean | null
  kathekon_quality?: 'strong' | 'moderate' | 'marginal' | 'contrary'
  withPassion?: boolean
}): Layer2Assessment {
  const {
    proximity,
    is_kathekon = null,
    kathekon_quality = 'marginal',
    withPassion = false,
  } = opts

  return {
    version: 'layer2-assessment-v1',
    layer1_schema_version: 'layer1-schema-v1',
    passion_diagnosis: {
      passions_detected: withPassion
        ? [
            {
              id: 'p1',
              name: 'Anguished anxiety',
              root_passion: 'phobos',
              sub_species: 'agonia',
              false_judgement: 'An imminent evil is overtaking me.',
              correct_judgement: 'Externals are indifferent.',
              causal_stage_affected: 'synkatathesis',
              evidence: 'I keep re-checking the result.',
            },
          ]
        : [],
      false_judgements: [],
      correct_judgements: [],
      causal_stage_affected: withPassion ? 'synkatathesis' : null,
    },
    control_filter: {
      within_prohairesis: [],
      outside_prohairesis: [],
      disambiguation_required: [],
    },
    oikeiosis: { relevant_circles: [], deliberation_notes: '' },
    value_assessment: { indifferents_at_stake: [], value_error: null },
    kathekon_assessment: {
      is_kathekon,
      quality: kathekon_quality,
      justification: 'Test fixture justification.',
    },
    iterative_refinement: {
      senecan_grade: 'pre_progress',
      progress_dimensions: {
        passion_reduction: 'emerging',
        judgement_quality: 'emerging',
        disposition_stability: 'emerging',
        oikeiosis_extension: 'emerging',
      },
      direction_of_travel: 'single_snapshot',
      motivation_classification: null,
    },
    katorthoma_proximity: proximity,
    ruling_faculty_state: 'Test fixture ruling-faculty state.',
    virtue_domains_engaged: [],
    improvement_path_structured: null,
    stage_scores: {
      control_filter: 'not_applied',
      passion_diagnosis: 'not_applied',
      oikeiosis: 'not_applied',
      value_assessment: 'not_applied',
      kathekon_assessment: 'not_applied',
      iterative_refinement: 'not_applied',
    },
    hasty_assent_risk: 'none',
    intake_clarifications: { soft_clarifications: [], open_deferrals: [] },
    layer1_ambiguity_notes: [],
    layer2_ambiguity_notes: [],
  }
}

/** A "good habitual" assessment — habitual proximity, strong kathekon, no
 *  passions. A run of these clears the reflexive→habitual upgrade thresholds. */
function goodHabitual(): Layer2Assessment {
  return makeAssessment({
    proximity: 'habitual',
    is_kathekon: true,
    kathekon_quality: 'strong',
  })
}

/** A BridgeContext with a DELIBERATELY DIFFERENT agent_id — accumulate forces
 *  the action's agent_id to the carried profile's. */
function ctxWithSignature(signature: string): BridgeContext {
  return {
    agent_id: 'agent_SOMEONE_ELSE',
    evaluated_at: '2026-05-15T10:00:00.000Z',
    skill_id: 'sage-reason',
    signature,
  }
}

/** A minimal agent-mode render input at a given proximity — for the parallel
 *  evaluation patterns. */
function makeRenderInput(opts: {
  proximity: KatorthomaProximityLevel
  is_kathekon?: boolean | null
  kathekon_quality?: 'strong' | 'moderate' | 'marginal' | 'contrary'
}): Layer3ModeRenderInput & { mode: 'atl_wrapper' } {
  return {
    mode: 'atl_wrapper',
    assessment: makeAssessment(opts),
    consumer_context: { consumer: 'api_reason' },
    score_context: { justification_source: 'engine_constructed' },
  }
}

/** A parallel candidate — a render input plus its bridge context. */
function makeCandidate(opts: {
  proximity: KatorthomaProximityLevel
  is_kathekon?: boolean | null
  kathekon_quality?: 'strong' | 'moderate' | 'marginal' | 'contrary'
  signature: string
}): ParallelCandidate {
  return {
    input: makeRenderInput(opts),
    context: ctxWithSignature(opts.signature),
  }
}

/** Strip the ISO-timestamp fields the ported /trust-layer/ functions stamp from
 *  the system clock — so determinism can be asserted on everything else. */
const TIMESTAMP_KEYS = new Set([
  'computed_at',
  'updated_at',
  'grade_since',
  'last_evaluation',
])
function stableJSON(value: unknown): string {
  return JSON.stringify(value, (key, val) =>
    TIMESTAMP_KEYS.has(key) ? '<timestamp>' : val
  )
}

const AGENT_ID = 'agent_acme_v3'

// ============================================================================
// Main
// ============================================================================

function main(): void {
  // --- runSequentialStep — Pattern 1 -----------------------------------
  {
    const fresh = createCarriedProfile(AGENT_ID)

    // SEQ-1: accumulates one action.
    const step1 = runSequentialStep({
      profile: fresh,
      assessment: goodHabitual(),
      context: ctxWithSignature('seq_1'),
    })
    assertEqual(
      'SEQ-1  accumulates one action (evaluated_actions length 1)',
      step1.profile.evaluated_actions.length,
      1
    )
    assertEqual(
      'SEQ-1  total_actions_evaluated is 1',
      step1.profile.total_actions_evaluated,
      1
    )

    // SEQ-2: step 1 (total 1, interval 20) — no grade check.
    assertEqual('SEQ-2  no grade check below the cadence', step1.grade_check_ran, false)
    assertEqual('SEQ-2  trajectory is null below the cadence', step1.trajectory, null)

    // SEQ-3: accumulate up to the 20th — the cadence fires.
    let p: CarriedProfile = fresh
    let step20: ReturnType<typeof runSequentialStep> | null = null
    for (let i = 1; i <= 20; i++) {
      const r = runSequentialStep({
        profile: p,
        assessment: goodHabitual(),
        context: ctxWithSignature(`cad_${i}`),
      })
      p = r.profile
      if (i === 20) step20 = r
    }
    assert(
      'SEQ-3  grade check FIRES at the cadence (20th accumulation)',
      step20 !== null && step20.grade_check_ran === true
    )
    assert(
      'SEQ-3  trajectory is non-null at the cadence',
      step20 !== null && step20.trajectory !== null
    )

    // SEQ-4: force_grade_check forces a check off-cadence (step 1).
    const forced = runSequentialStep(
      {
        profile: fresh,
        assessment: goodHabitual(),
        context: ctxWithSignature('forced_1'),
      },
      { force_grade_check: true }
    )
    assertEqual(
      'SEQ-4  force_grade_check forces a check off-cadence',
      forced.grade_check_ran,
      true
    )
    assert('SEQ-4  forced check yields a trajectory', forced.trajectory !== null)

    // SEQ-5: both Layer 1 payloads, correct schema tags.
    assertEqual(
      'SEQ-5  carried_profile payload schema tag',
      step1.carried_profile_payload.schema,
      CARRIED_PROFILE_PAYLOAD_SCHEMA
    )
    assertEqual(
      'SEQ-5  profile_provenance payload schema tag',
      step1.profile_provenance_payload.schema,
      PROFILE_PROVENANCE_PAYLOAD_SCHEMA
    )
    assertEqual(
      'SEQ-5  profile_provenance accumulated_action_count matches',
      step1.profile_provenance_payload.accumulated_action_count,
      1
    )

    // SEQ-6: the input profile is not mutated.
    assertEqual(
      'SEQ-6  input profile not mutated (evaluated_actions still empty)',
      fresh.evaluated_actions.length,
      0
    )
    assertEqual(
      'SEQ-6  input profile not mutated (total still 0)',
      fresh.total_actions_evaluated,
      0
    )

    // SEQ-7: when a check ran, the returned profile is the trajectory-advanced
    // one (its accreditation_record is the transition's record).
    assert(
      'SEQ-7  returned profile is the trajectory-advanced one when a check ran',
      forced.trajectory !== null &&
        forced.profile.accreditation_record ===
          forced.trajectory.transition.record
    )
  }

  // --- runSequentialLoop — Pattern 1 -----------------------------------
  {
    const fresh = createCarriedProfile(AGENT_ID)

    // LOOP-1: empty steps.
    const empty = runSequentialLoop(fresh, [])
    assert('LOOP-1  empty steps → profile unchanged', empty.profile === fresh)
    assertEqual('LOOP-1  empty steps → steps []', empty.steps.length, 0)

    // LOOP-2 / LOOP-3: fold 5 steps.
    const fiveSteps = Array.from({ length: 5 }, (_, i) => ({
      assessment: goodHabitual(),
      context: ctxWithSignature(`loop_${i}`),
    }))
    const five = runSequentialLoop(fresh, fiveSteps)
    assertEqual('LOOP-2  folds 5 steps — final total 5', five.profile.total_actions_evaluated, 5)
    assertEqual('LOOP-2  5 step results', five.steps.length, 5)
    assertEqual(
      'LOOP-3  threads the advanced profile (final evaluated_actions length 5)',
      five.profile.evaluated_actions.length,
      5
    )

    // LOOP-4 / LOOP-5: a grade upgrade is reachable through a 40-step loop
    // (grade checks fire at step 20 and step 40). 40 good-habitual actions
    // clear the reflexive→habitual upgrade thresholds.
    const fortySteps = Array.from({ length: 40 }, (_, i) => ({
      assessment: goodHabitual(),
      context: ctxWithSignature(`up_${i}`),
    }))
    const forty = runSequentialLoop(fresh, fortySteps)
    assertEqual(
      'LOOP-4  a grade UPGRADE is reachable through the loop (→ grade_3)',
      forty.profile.accreditation_record.senecan_grade,
      'grade_3'
    )
    // The first step whose carried_profile_payload carries the post-upgrade
    // grade — find the earliest step where the payload reports grade_3.
    const upgradeStep = forty.steps.find(
      (s) => s.carried_profile_payload.senecan_grade === 'grade_3'
    )
    assert(
      'LOOP-5  an upgrade step carries the post-transition grade in its payload',
      upgradeStep !== undefined
    )
    assert(
      'LOOP-5  the upgrade step ran a grade check',
      upgradeStep !== undefined && upgradeStep.grade_check_ran === true
    )
  }

  // --- evaluateInParallel — Pattern 2 ----------------------------------
  {
    // PAR-1: empty candidates.
    const emptyResult = evaluateInParallel([])
    assertEqual('PAR-1  empty candidates → ranked []', emptyResult.ranked.length, 0)
    assertEqual('PAR-1  empty candidates → top null', emptyResult.top, null)

    // Three candidates with distinct scores: sage_like > habitual > reflexive
    // (proximity drives the score; engine_constructed justification + strong
    // kathekon keep them on the confirmed path).
    const candidates: ParallelCandidate[] = [
      makeCandidate({
        proximity: 'habitual',
        is_kathekon: true,
        kathekon_quality: 'strong',
        signature: 'cand_mid',
      }),
      makeCandidate({
        proximity: 'sage_like',
        is_kathekon: true,
        kathekon_quality: 'strong',
        signature: 'cand_high',
      }),
      makeCandidate({
        proximity: 'reflexive',
        is_kathekon: true,
        kathekon_quality: 'strong',
        signature: 'cand_low',
      }),
    ]
    const result = evaluateInParallel(candidates)

    // PAR-2: renders all N.
    assertEqual('PAR-2  renders N candidates — ranked.length 3', result.ranked.length, 3)

    // PAR-3: ranked by score, highest first.
    assert(
      'PAR-3  ranked by scalar score, highest first',
      result.ranked[0].score >= result.ranked[1].score &&
        result.ranked[1].score >= result.ranked[2].score
    )
    assertEqual(
      'PAR-3  the sage_like candidate (input index 1) ranks first',
      result.ranked[0].index,
      1
    )
    assertEqual('PAR-3  rank labels are 1, 2, 3', result.ranked.map((r) => r.rank).join(','), '1,2,3')

    // PAR-4: ties broken by input order. Two identical-score candidates.
    const tied: ParallelCandidate[] = [
      makeCandidate({
        proximity: 'deliberate',
        is_kathekon: true,
        kathekon_quality: 'strong',
        signature: 'tie_a',
      }),
      makeCandidate({
        proximity: 'deliberate',
        is_kathekon: true,
        kathekon_quality: 'strong',
        signature: 'tie_b',
      }),
    ]
    const tiedResult = evaluateInParallel(tied)
    assert(
      'PAR-4  tie → identical scores',
      tiedResult.ranked[0].score === tiedResult.ranked[1].score
    )
    assertEqual(
      'PAR-4  tie broken by input order (index 0 ranks first)',
      tiedResult.ranked[0].index,
      0
    )

    // PAR-5: top === ranked[0].
    assert('PAR-5  top === ranked[0]', result.top === result.ranked[0])

    // PAR-6: RankedCandidate.index is the stable input-array identity.
    assert(
      'PAR-6  RankedCandidate.index is the stable input-array identity',
      result.ranked.every((r) => candidates[r.index] !== undefined) &&
        new Set(result.ranked.map((r) => r.index)).size === 3
    )

    // PAR-7: PURE — identical candidates → identical ranking.
    const result2 = evaluateInParallel(candidates)
    assertEqual(
      'PAR-7  PURE — identical candidates → identical ranking',
      result.ranked.map((r) => `${r.index}:${r.rank}:${r.score}`).join('|'),
      result2.ranked.map((r) => `${r.index}:${r.rank}:${r.score}`).join('|')
    )
  }

  // --- accumulateChosen — Pattern 2 ------------------------------------
  {
    const fresh = createCarriedProfile(AGENT_ID)
    const candidates: ParallelCandidate[] = [
      makeCandidate({
        proximity: 'reflexive',
        is_kathekon: true,
        kathekon_quality: 'strong',
        signature: 'chose_0',
      }),
      makeCandidate({
        proximity: 'principled',
        is_kathekon: true,
        kathekon_quality: 'strong',
        signature: 'chose_1',
      }),
    ]

    // CHOSE-1: accumulates exactly one action — the chosen one.
    const chosen = accumulateChosen(fresh, candidates, 1)
    assertEqual(
      'CHOSE-1  accumulates exactly one action (only the chosen candidate)',
      chosen.profile.evaluated_actions.length,
      1
    )
    assertEqual(
      'CHOSE-1  total_actions_evaluated is 1 (not N)',
      chosen.profile.total_actions_evaluated,
      1
    )

    // CHOSE-2: the accumulated action is the CHOSEN candidate's (index 1 =
    // principled proximity).
    assertEqual(
      'CHOSE-2  the accumulated action is the chosen candidate (principled)',
      chosen.profile.evaluated_actions[0].proximity,
      'principled'
    )

    // CHOSE-3: throws on an out-of-range index.
    assertThrows('CHOSE-3  throws on an out-of-range chosenIndex', () =>
      accumulateChosen(fresh, candidates, 5)
    )

    // CHOSE-4: returns a SequentialStepResult — both payloads present.
    assertEqual(
      'CHOSE-4  returns a SequentialStepResult (carried_profile payload)',
      chosen.carried_profile_payload.schema,
      CARRIED_PROFILE_PAYLOAD_SCHEMA
    )
    assertEqual(
      'CHOSE-4  returns a SequentialStepResult (profile_provenance payload)',
      chosen.profile_provenance_payload.schema,
      PROFILE_PROVENANCE_PAYLOAD_SCHEMA
    )
  }

  // --- toPeerAgentAssessments — Pattern 3 ------------------------------
  {
    // PEER-1: empty peers.
    assertEqual('PEER-1  empty peers → []', toPeerAgentAssessments([]).length, 0)

    // Build two peer agents — one fresh (reflexive / pre_progress), one seeded
    // at a higher grade so a grade difference is visible in the payload.
    const peerLowProfile = createCarriedProfile('agent_peer_low')
    const peerHighProfile = createCarriedProfile('agent_peer_high', {
      starting_grade: 'grade_2',
      starting_proximity: 'deliberate',
    })
    const peerLowRendering = renderAgentMode(
      makeRenderInput({
        proximity: 'habitual',
        is_kathekon: true,
        kathekon_quality: 'strong',
      })
    ).json
    const peers: PeerAgent[] = [
      { carried_profile: peerLowProfile, latest_rendering: peerLowRendering },
      { carried_profile: peerHighProfile },
    ]

    const payloads = toPeerAgentAssessments(peers)

    // PEER-2: one payload per peer.
    assertEqual('PEER-2  one payload per peer', payloads.length, 2)

    // PEER-3: schema tag + agent_id + derived accreditation.
    assertEqual(
      'PEER-3  payload schema tag',
      payloads[0].schema,
      PEER_AGENT_ASSESSMENT_SCHEMA
    )
    assertEqual('PEER-3  payload agent_id (peer 0)', payloads[0].agent_id, 'agent_peer_low')
    assertEqual('PEER-3  payload agent_id (peer 1)', payloads[1].agent_id, 'agent_peer_high')
    assertEqual(
      'PEER-3  accreditation is derived from the peer record (peer 0 grade)',
      payloads[0].accreditation.senecan_grade,
      'pre_progress'
    )
    assertEqual(
      'PEER-3  accreditation is derived from the peer record (peer 1 grade)',
      payloads[1].accreditation.senecan_grade,
      'grade_2'
    )

    // PEER-4: latest_rendering null when absent, non-null when supplied.
    assert(
      'PEER-4  latest_rendering non-null when supplied',
      payloads[0].latest_rendering !== null
    )
    assertEqual(
      'PEER-4  latest_rendering null when not supplied',
      payloads[1].latest_rendering,
      null
    )

    // PEER-5: PURE — identical peers → identical output.
    assertEqual(
      'PEER-5  PURE — identical peers → identical output',
      JSON.stringify(toPeerAgentAssessments(peers)),
      JSON.stringify(payloads)
    )
  }

  // --- runOrchestrationStep — Pattern 3 --------------------------------
  {
    // The orchestrator is a fresh wrapped agent (reflexive / pre_progress).
    const orchestrator = createCarriedProfile('agent_orchestrator')
    // A peer seeded at grade_1 — deliberately a HIGHER grade than the
    // orchestrator, to prove grade is carried as data, not propagated.
    const peerProfile = createCarriedProfile('agent_peer', {
      starting_grade: 'grade_1',
      starting_proximity: 'principled',
    })

    const step = runOrchestrationStep({
      orchestrator: {
        profile: orchestrator,
        assessment: goodHabitual(),
        context: ctxWithSignature('orch_1'),
      },
      peers: [{ carried_profile: peerProfile }],
    })

    // ORCH-1: the orchestrator accumulates its OWN trajectory.
    assertEqual(
      'ORCH-1  the orchestrator accumulates its own trajectory (total 1)',
      step.profile.total_actions_evaluated,
      1
    )
    assertEqual(
      'ORCH-1  the orchestrator profile keeps its own agent_id',
      step.profile.agent_id,
      'agent_orchestrator'
    )

    // ORCH-2: peer_agent_assessments attached.
    assertEqual(
      'ORCH-2  peer_agent_assessments attached — length 1',
      step.peer_agent_assessments.length,
      1
    )
    assertEqual(
      'ORCH-2  peer_agent_assessments carries the peer agent_id',
      step.peer_agent_assessments[0].agent_id,
      'agent_peer'
    )

    // ORCH-3: the peer's grade (grade_1) is NOT propagated to the
    // orchestrator's grade. The orchestrator ran one step (total 1) with no
    // grade check (1 % 20 !== 0), so its grade stays pre_progress — and
    // critically it did NOT inherit the peer's grade_1.
    assertEqual(
      'ORCH-3  the orchestrator grade is its OWN (pre_progress), not the peer grade_1',
      step.profile.accreditation_record.senecan_grade,
      'pre_progress'
    )
    assertEqual(
      'ORCH-3  but the peer grade IS carried as data in peer_agent_assessments',
      step.peer_agent_assessments[0].accreditation.senecan_grade,
      'grade_1'
    )

    // ORCH-4: the result is a superset of a SequentialStepResult.
    assertEqual(
      'ORCH-4  result carries the carried_profile payload',
      step.carried_profile_payload.schema,
      CARRIED_PROFILE_PAYLOAD_SCHEMA
    )
    assertEqual(
      'ORCH-4  result carries the profile_provenance payload',
      step.profile_provenance_payload.schema,
      PROFILE_PROVENANCE_PAYLOAD_SCHEMA
    )

    // ORCH-5: empty peers.
    const noPeers = runOrchestrationStep({
      orchestrator: {
        profile: orchestrator,
        assessment: goodHabitual(),
        context: ctxWithSignature('orch_nopeers'),
      },
      peers: [],
    })
    assertEqual(
      'ORCH-5  empty peers → peer_agent_assessments []',
      noPeers.peer_agent_assessments.length,
      0
    )
  }

  // --- CONSTANTS -------------------------------------------------------
  {
    assertEqual('CONST-1  MAX_ORCHESTRATION_DEPTH === 1', MAX_ORCHESTRATION_DEPTH, 1)
    assertEqual(
      'CONST-2  PEER_AGENT_ASSESSMENT_SCHEMA tag',
      PEER_AGENT_ASSESSMENT_SCHEMA,
      'atl-peer-agent-assessment-v1'
    )
  }

  // --- INVARIANTS ------------------------------------------------------
  {
    // DET-1: runSequentialStep is deterministic modulo the ISO-timestamp fields.
    // Use a profile pre-loaded to 19 actions so the step under test (the 20th)
    // runs a grade check — exercising the computeTrajectory path.
    let pre: CarriedProfile = createCarriedProfile(AGENT_ID)
    for (let i = 0; i < 19; i++) {
      pre = accumulate(pre, goodHabitual(), ctxWithSignature(`det_pre_${i}`))
    }
    const detInput = {
      profile: pre,
      assessment: goodHabitual(),
      context: ctxWithSignature('det_step'),
    }
    const a = runSequentialStep(detInput)
    const b = runSequentialStep(detInput)
    assertEqual(
      'DET-1  runSequentialStep is deterministic modulo ISO-timestamp fields',
      stableJSON(a),
      stableJSON(b)
    )

    // DET-2: runOrchestrationStep is deterministic modulo ISO-timestamp fields.
    const orch = createCarriedProfile('agent_det_orch')
    const peer = createCarriedProfile('agent_det_peer', {
      starting_grade: 'grade_2',
      starting_proximity: 'deliberate',
    })
    const orchInput = {
      orchestrator: {
        profile: orch,
        assessment: goodHabitual(),
        context: ctxWithSignature('det_orch_step'),
      },
      peers: [{ carried_profile: peer }],
    }
    const oa = runOrchestrationStep(orchInput)
    const ob = runOrchestrationStep(orchInput)
    assertEqual(
      'DET-2  runOrchestrationStep is deterministic modulo ISO-timestamp fields',
      stableJSON(oa),
      stableJSON(ob)
    )

    // RT-1: the three Layer 1 payloads round-trip through validateLayer1Schema.
    // The payloads are serialised into the agent's next Layer 1 input JSON;
    // JSON.parse(JSON.stringify(...)) models that wire round-trip.
    const carriedRaw = JSON.parse(JSON.stringify(oa.carried_profile_payload))
    const provRaw = JSON.parse(JSON.stringify(oa.profile_provenance_payload))
    const peersRaw = JSON.parse(JSON.stringify(oa.peer_agent_assessments))
    const minimalLayer1: Record<string, unknown> = {
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
      motivation_evidence: [],
      element_fusion_detected: { fused: false, fused_concerns: null },
      ambiguity_notes: [],
      carried_profile: carriedRaw,
      profile_provenance: provRaw,
      peer_agent_assessments: peersRaw,
    }
    let roundTripped = false
    let validated: ReturnType<typeof validateLayer1Schema> | null = null
    try {
      validated = validateLayer1Schema(minimalLayer1)
      roundTripped = true
    } catch (err) {
      roundTripped = false
      console.log(`  (validateLayer1Schema threw: ${String(err)})`)
    }
    assert(
      'RT-1  carried_profile + profile_provenance + peer_agent_assessments validate in a Layer1Schema',
      roundTripped
    )
    assert(
      'RT-1  peer_agent_assessments round-trips byte-identically through the validator',
      validated != null &&
        JSON.stringify(validated.peer_agent_assessments) === JSON.stringify(peersRaw)
    )
  }

  // --- Summary ---------------------------------------------------------
  console.log('')
  console.log(`Total: ${passCount + failCount}  Pass: ${passCount}  Fail: ${failCount}`)
  if (failCount > 0) {
    console.log('')
    console.log('FAILURES:')
    for (const f of failures) console.log(`  - ${f}`)
  }
}

main()
process.exit(failCount === 0 ? 0 : 1)
