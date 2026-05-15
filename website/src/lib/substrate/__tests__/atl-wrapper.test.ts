/**
 * atl-wrapper.test.ts — Agent Trust Layer Wrapper (Components 1 + 4) functional
 * tests + invariant checks.
 *
 * Run via: `npx tsx website/src/lib/substrate/__tests__/atl-wrapper.test.ts`
 * (mirrors the atl-bridge / score-architecture / agent-mode verification
 * pattern; no Jest framework dependency).
 *
 * PR2 — build-to-wire verification immediate: this file invokes every exported
 * atl-wrapper function in the same session atl-wrapper.ts is written.
 *
 * COVERAGE
 *
 *   createCarriedProfile
 *     CREATE-1  fresh profile — evaluated_actions empty, total 0
 *     CREATE-2  seeded accreditation record at the default grade + proximity
 *     CREATE-3  agent_id set on the profile and on the seeded record
 *     CREATE-4  throws on an empty / whitespace agent_id
 *     CREATE-5  starting-grade option override is honoured
 *     CREATE-6  regressing_check_count starts 0; window_config defaults
 *
 *   accumulate — Component 1
 *     ACC-1  appends one EvaluatedAction (evaluated_actions.length 1)
 *     ACC-2  total_actions_evaluated increments
 *     ACC-3  returns a NEW profile; the input profile is not mutated
 *     ACC-4  the action's agent_id is FORCED to the profile's (context differs)
 *     ACC-5  accumulate is pure — identical inputs → byte-identical results
 *     ACC-6  sequence of 3 → 3 actions, total 3, accumulation order preserved
 *
 *   computeTrajectory — Component 4
 *     TRAJ-1  fresh profile → empty snapshot, no transition, stays reflexive
 *     TRAJ-2  drives computeWindowSnapshot (agent_id + in-window + lifetime)
 *     TRAJ-3  a grade UPGRADE is reachable (25 good-habitual actions → grade_3)
 *     TRAJ-4  advances the profile (accreditation_record ← transition.record)
 *     TRAJ-5  regressing_check_count increments on a regressing snapshot
 *     TRAJ-6  regressing_check_count increments again (consecutive)
 *     TRAJ-7  regressing_check_count resets on a non-regressing snapshot
 *     TRAJ-8  regressing_check_count resets on a grade change
 *     TRAJ-9  computeTrajectory does not mutate the input profile
 *
 *   toCarriedProfilePayload / toProfileProvenancePayload — Component 1 payloads
 *     PAY-1  carried_profile payload — schema tag, agent_id, snapshot, total
 *     PAY-2  carried_profile payload carries the post-transition grade
 *     PAY-3  a supplied snapshot is used verbatim (no recompute)
 *     PAY-4  profile_provenance payload — count + receipt_id_chain order
 *     PAY-5  ROUND-TRIP — both payloads validate inside a Layer1Schema
 *
 *   INVARIANTS
 *     DET-1  computeTrajectory is deterministic modulo the ISO-timestamp fields
 *
 * Exit code 0 = all pass. Non-zero = failures printed.
 */

import {
  createCarriedProfile,
  accumulate,
  computeTrajectory,
  toCarriedProfilePayload,
  toProfileProvenancePayload,
  CARRIED_PROFILE_PAYLOAD_SCHEMA,
  PROFILE_PROVENANCE_PAYLOAD_SCHEMA,
  type CarriedProfile,
  type BridgeContext,
  type KatorthomaProximityLevel,
  type WindowSnapshot,
} from '../atl-wrapper'

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
// Fixtures — minimal valid Layer2Assessment, parameterised
// ============================================================================

/**
 * Build a minimal valid Layer2Assessment at a given proximity. Modelled on the
 * MINIMAL_ASSESSMENT fixture in atl-bridge.test.ts (a known-valid shape). A
 * fresh object is returned each call — important for the no-mutation checks.
 */
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
 *  passions. 25 of these clear the reflexive→habitual upgrade thresholds. */
function goodHabitual(): Layer2Assessment {
  return makeAssessment({
    proximity: 'habitual',
    is_kathekon: true,
    kathekon_quality: 'strong',
  })
}

/** A BridgeContext with a DELIBERATELY DIFFERENT agent_id — exercises ACC-4
 *  (accumulate forces the action's agent_id to the carried profile's). */
function ctxWithSignature(signature: string): BridgeContext {
  return {
    agent_id: 'agent_SOMEONE_ELSE',
    evaluated_at: '2026-05-15T10:00:00.000Z',
    skill_id: 'sage-reason',
    signature,
  }
}

/** Accumulate `count` assessments produced by `make` onto a profile. */
function accumulateMany(
  profile: CarriedProfile,
  make: () => Layer2Assessment,
  count: number,
  signaturePrefix: string
): CarriedProfile {
  let p = profile
  for (let i = 0; i < count; i++) {
    p = accumulate(p, make(), ctxWithSignature(`${signaturePrefix}_${i}`))
  }
  return p
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
  // --- createCarriedProfile --------------------------------------------
  {
    const fresh = createCarriedProfile(AGENT_ID)
    assertEqual(
      'CREATE-1  fresh profile — evaluated_actions empty',
      fresh.evaluated_actions.length,
      0
    )
    assertEqual(
      'CREATE-1  fresh profile — total_actions_evaluated 0',
      fresh.total_actions_evaluated,
      0
    )
    assertEqual(
      'CREATE-2  seeded record at the default grade (pre_progress)',
      fresh.accreditation_record.senecan_grade,
      'pre_progress'
    )
    assertEqual(
      'CREATE-2  seeded record at the default proximity (reflexive)',
      fresh.accreditation_record.typical_proximity,
      'reflexive'
    )
    assertEqual(
      'CREATE-3  agent_id set on the profile',
      fresh.agent_id,
      AGENT_ID
    )
    assertEqual(
      'CREATE-3  agent_id set on the seeded record',
      fresh.accreditation_record.agent_id,
      AGENT_ID
    )
    assertThrows('CREATE-4  throws on empty agent_id', () =>
      createCarriedProfile('')
    )
    assertThrows('CREATE-4  throws on whitespace agent_id', () =>
      createCarriedProfile('   ')
    )
    const overridden = createCarriedProfile(AGENT_ID, {
      starting_grade: 'grade_2',
      starting_proximity: 'deliberate',
    })
    assertEqual(
      'CREATE-5  starting-grade override honoured',
      overridden.accreditation_record.senecan_grade,
      'grade_2'
    )
    assertEqual(
      'CREATE-6  regressing_check_count starts 0',
      fresh.regressing_check_count,
      0
    )
    assertEqual(
      'CREATE-6  window_config defaults (window_size 100)',
      fresh.window_config.window_size,
      100
    )
  }

  // --- accumulate — Component 1 ----------------------------------------
  {
    const p0 = createCarriedProfile(AGENT_ID)
    const p1 = accumulate(p0, makeAssessment({ proximity: 'deliberate' }), ctxWithSignature('sigA'))
    assertEqual('ACC-1  appends one EvaluatedAction', p1.evaluated_actions.length, 1)
    assertEqual('ACC-2  total_actions_evaluated increments', p1.total_actions_evaluated, 1)
    assert(
      'ACC-3  returns a NEW profile (not the input reference)',
      p1 !== p0
    )
    assert(
      'ACC-3  the input profile is not mutated',
      p0.evaluated_actions.length === 0 && p0.total_actions_evaluated === 0
    )
    assertEqual(
      'ACC-4  the action agent_id is FORCED to the profile agent_id',
      p1.evaluated_actions[0].agent_id,
      AGENT_ID
    )
    // ACC-5: accumulate is pure — identical inputs → byte-identical results.
    const a = accumulate(p0, makeAssessment({ proximity: 'deliberate' }), ctxWithSignature('sigA'))
    const b = accumulate(p0, makeAssessment({ proximity: 'deliberate' }), ctxWithSignature('sigA'))
    assertEqual(
      'ACC-5  accumulate is pure (identical inputs → identical results)',
      JSON.stringify(a),
      JSON.stringify(b)
    )
    // ACC-6: a sequence of 3.
    let seq = createCarriedProfile(AGENT_ID)
    seq = accumulate(seq, makeAssessment({ proximity: 'reflexive' }), ctxWithSignature('s0'))
    seq = accumulate(seq, makeAssessment({ proximity: 'habitual' }), ctxWithSignature('s1'))
    seq = accumulate(seq, makeAssessment({ proximity: 'deliberate' }), ctxWithSignature('s2'))
    assertEqual('ACC-6  sequence of 3 → 3 actions', seq.evaluated_actions.length, 3)
    assertEqual('ACC-6  sequence of 3 → total 3', seq.total_actions_evaluated, 3)
    assert(
      'ACC-6  accumulation order preserved (proximities in order)',
      seq.evaluated_actions[0].proximity === 'reflexive' &&
        seq.evaluated_actions[1].proximity === 'habitual' &&
        seq.evaluated_actions[2].proximity === 'deliberate'
    )
  }

  // --- computeTrajectory — Component 4 ---------------------------------
  {
    // TRAJ-1: fresh profile.
    const fresh = createCarriedProfile(AGENT_ID)
    const t0 = computeTrajectory(fresh)
    assertEqual(
      'TRAJ-1  fresh profile → empty snapshot (actions_in_window 0)',
      t0.snapshot.actions_in_window,
      0
    )
    assertEqual(
      'TRAJ-1  fresh profile → no transition',
      t0.transition.grade_changed,
      false
    )
    assertEqual(
      'TRAJ-1  fresh profile → stays reflexive',
      t0.transition.record.typical_proximity,
      'reflexive'
    )

    // TRAJ-2: drives computeWindowSnapshot.
    const withFive = accumulateMany(fresh, () => makeAssessment({ proximity: 'deliberate' }), 5, 'd')
    const t2 = computeTrajectory(withFive)
    assertEqual('TRAJ-2  snapshot.agent_id ← profile.agent_id', t2.snapshot.agent_id, AGENT_ID)
    assertEqual('TRAJ-2  snapshot.actions_in_window ← accumulated count', t2.snapshot.actions_in_window, 5)
    assertEqual(
      'TRAJ-2  snapshot.total_actions_evaluated ← profile.total',
      t2.snapshot.total_actions_evaluated,
      5
    )

    // TRAJ-3: a grade upgrade is reachable (25 good-habitual actions).
    const good25 = accumulateMany(fresh, goodHabitual, 25, 'gh')
    const t3 = computeTrajectory(good25)
    assertEqual('TRAJ-3  25 good-habitual → grade_changed true', t3.transition.grade_changed, true)
    assertEqual(
      'TRAJ-3  25 good-habitual → trigger type upgrade',
      t3.transition.trigger?.type,
      'upgrade'
    )
    assertEqual(
      'TRAJ-3  25 good-habitual → record.typical_proximity habitual',
      t3.transition.record.typical_proximity,
      'habitual'
    )
    assertEqual(
      'TRAJ-3  25 good-habitual → record.senecan_grade grade_3',
      t3.transition.record.senecan_grade,
      'grade_3'
    )

    // TRAJ-4: advances the profile.
    assert(
      'TRAJ-4  advanced profile.accreditation_record === transition.record',
      t3.profile.accreditation_record === t3.transition.record
    )
    assertEqual(
      'TRAJ-4  advanced profile keeps evaluated_actions (aggregate, not accumulate)',
      t3.profile.evaluated_actions.length,
      25
    )

    // TRAJ-5/6: regressing_check_count increments on consecutive regressing
    // snapshots. 12 deliberate then 12 reflexive → recent half well below the
    // prior half → 'regressing'.
    let reg = createCarriedProfile(AGENT_ID)
    reg = accumulateMany(reg, () => makeAssessment({ proximity: 'deliberate' }), 12, 'rd')
    reg = accumulateMany(reg, () => makeAssessment({ proximity: 'reflexive' }), 12, 'rr')
    const r1 = computeTrajectory(reg)
    assertEqual(
      'TRAJ-5  regressing snapshot → direction_of_travel regressing',
      r1.snapshot.direction_of_travel,
      'regressing'
    )
    assertEqual(
      'TRAJ-5  regressing snapshot, no grade change → count 0 → 1',
      r1.profile.regressing_check_count,
      1
    )
    const r2 = computeTrajectory(r1.profile)
    assertEqual(
      'TRAJ-6  consecutive regressing snapshot → count 1 → 2',
      r2.profile.regressing_check_count,
      2
    )

    // TRAJ-7: reset on a non-regressing snapshot. Append 30 reflexive actions
    // to the count-2 profile → the trajectory flattens to 'stable', and
    // reflexive can't downgrade → no grade change → count resets to 0.
    const flattened = accumulateMany(
      r2.profile,
      () => makeAssessment({ proximity: 'reflexive' }),
      30,
      'flat'
    )
    const r3 = computeTrajectory(flattened)
    assert(
      'TRAJ-7  flattened trajectory is not regressing',
      r3.snapshot.direction_of_travel !== 'regressing'
    )
    assertEqual(
      'TRAJ-7  non-regressing snapshot, no grade change → count resets to 0',
      r3.profile.regressing_check_count,
      0
    )

    // TRAJ-8: reset on a grade change — the TRAJ-3 upgrade case.
    assertEqual(
      'TRAJ-8  grade change → regressing_check_count resets to 0',
      t3.profile.regressing_check_count,
      0
    )

    // TRAJ-9: no mutation of the input profile.
    {
      const before = JSON.stringify(good25)
      computeTrajectory(good25)
      assertEqual(
        'TRAJ-9  computeTrajectory does not mutate the input profile',
        JSON.stringify(good25),
        before
      )
    }
  }

  // --- payloads — Component 1 ------------------------------------------
  {
    const fresh = createCarriedProfile(AGENT_ID)
    const good25 = accumulateMany(fresh, goodHabitual, 25, 'pgh')
    const traj = computeTrajectory(good25)
    const advanced = traj.profile

    // PAY-1: carried_profile payload basics.
    const payload = toCarriedProfilePayload(advanced, traj.snapshot)
    assertEqual('PAY-1  payload.schema tag', payload.schema, CARRIED_PROFILE_PAYLOAD_SCHEMA)
    assertEqual('PAY-1  payload.agent_id', payload.agent_id, AGENT_ID)
    assert(
      'PAY-1  payload.window_snapshot present',
      payload.window_snapshot != null &&
        payload.window_snapshot.actions_in_window === 25
    )
    assertEqual('PAY-1  payload.total_actions_evaluated', payload.total_actions_evaluated, 25)

    // PAY-2: carries the POST-transition grade (advanced profile → grade_3).
    assertEqual(
      'PAY-2  payload carries the post-transition grade (grade_3)',
      payload.senecan_grade,
      'grade_3'
    )
    assertEqual(
      'PAY-2  payload carries the post-transition proximity (habitual)',
      payload.typical_proximity,
      'habitual'
    )

    // PAY-3: a supplied snapshot is used verbatim.
    assert(
      'PAY-3  a supplied snapshot is used verbatim (identity preserved)',
      payload.window_snapshot === traj.snapshot
    )

    // PAY-4: profile_provenance payload.
    const prov = toProfileProvenancePayload(advanced)
    assertEqual(
      'PAY-4  provenance.schema tag',
      prov.schema,
      PROFILE_PROVENANCE_PAYLOAD_SCHEMA
    )
    assertEqual(
      'PAY-4  provenance.source',
      prov.source,
      'own_prior_substrate_assessments'
    )
    assertEqual(
      'PAY-4  provenance.accumulated_action_count matches',
      prov.accumulated_action_count,
      25
    )
    assertEqual(
      'PAY-4  provenance.receipt_id_chain length matches',
      prov.receipt_id_chain.length,
      25
    )
    assert(
      'PAY-4  provenance.receipt_id_chain order matches the accumulated actions',
      prov.receipt_id_chain.every(
        (id, i) => id === advanced.evaluated_actions[i].receipt_id
      )
    )

    // PAY-5: ROUND-TRIP — both payloads validate inside a Layer1Schema.
    // The payloads are serialised into the agent's next Layer 1 input JSON;
    // JSON.parse(JSON.stringify(...)) models that wire round-trip.
    const carriedRaw = JSON.parse(JSON.stringify(payload))
    const provRaw = JSON.parse(JSON.stringify(prov))
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
      'PAY-5  carried_profile + profile_provenance payloads validate in a Layer1Schema',
      roundTripped
    )
    assert(
      'PAY-5  carried_profile round-trips byte-identically through the validator',
      validated != null &&
        JSON.stringify(validated.carried_profile) === JSON.stringify(carriedRaw)
    )
    assert(
      'PAY-5  profile_provenance round-trips byte-identically through the validator',
      validated != null &&
        JSON.stringify(validated.profile_provenance) === JSON.stringify(provRaw)
    )
  }

  // --- INVARIANTS ------------------------------------------------------
  {
    // DET-1: computeTrajectory is deterministic modulo the ISO-timestamp fields
    // the ported /trust-layer/ functions stamp from the system clock.
    const fresh = createCarriedProfile(AGENT_ID)
    const good25 = accumulateMany(fresh, goodHabitual, 25, 'det')
    const a = computeTrajectory(good25)
    const b = computeTrajectory(good25)
    const aStable: { snapshot: WindowSnapshot; transition: unknown } = {
      snapshot: a.snapshot,
      transition: a.transition,
    }
    const bStable: { snapshot: WindowSnapshot; transition: unknown } = {
      snapshot: b.snapshot,
      transition: b.transition,
    }
    assertEqual(
      'DET-1  computeTrajectory is deterministic modulo ISO-timestamp fields',
      stableJSON(aStable),
      stableJSON(bStable)
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
