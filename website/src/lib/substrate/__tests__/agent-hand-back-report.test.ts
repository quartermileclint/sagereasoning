/**
 * agent-hand-back-report.test.ts — trajectory-enriched developer hand-back
 * report functional tests + invariant checks.
 *
 * Run via:
 *   npx tsx website/src/lib/substrate/__tests__/agent-hand-back-report.test.ts
 *
 * Plain-assertion script (no Jest); exit code 0 = all pass.
 *
 * PR2 — build-to-wire verification immediate: this file invokes
 * renderAgentHandBackReport in the same session agent-hand-back-report.ts is
 * written.
 *
 * COVERAGE
 *
 *   renderAgentHandBackReport — the hand-back report
 *     RENDER-1  empty CarriedProfile (fresh agent, no steps) → coherent empty-state
 *     RENDER-2  one Sequential step → Section 1 shows one action; trajectory present
 *     RENDER-3  Pattern-2 (accumulateChosen N=3) → action reflects N; carried_candidates
 *               subsection shows the 2 retained candidates
 *     RENDER-4  orchestrator step WITH peers → Section 5 renders peers
 *     RENDER-5  orchestrator step WITHOUT peers → Section 5 hidden
 *     RENDER-6  typical_deliberation_breadth headline appears in Section 2
 *     RENDER-7  persisting passions non-empty renders the passion strings
 *     RENDER-8  verification_url renders and matches the record's URL
 *     RENDER-9  typical_kathekon_quality headline appears in Section 2
 *               (Decision G — kathekon-aligned alternative build, 2026-05-16)
 *     RENDER-10 kathekon_quality_distribution appears in Section 2
 *               (Decision G — kathekon-aligned alternative build, 2026-05-16)
 *     RENDER-11 typical_kathekon_quality appears in Section 3
 *               (Decision G — kathekon-aligned alternative build, 2026-05-16)
 *
 *   INVARIANTS
 *     DET-1     two renders with identical input + supplied snapshot →
 *               byte-identical output
 *     R3-1      output contains ACCREDITATION_DISCLAIMER text
 *     R4-1      output contains no internal thresholds / micro-logic /
 *               dimension confidence scores
 *     R18a-1    output contains the Character Kernel category language
 */

import {
  renderAgentHandBackReport,
  type HandBackReportInput,
} from '../agent-hand-back-report'

import {
  createCarriedProfile,
  type CarriedProfile,
  type BridgeContext,
  type KatorthomaProximityLevel,
  type WindowSnapshot,
} from '../sage-assent-wrapper'

import {
  runSequentialStep,
  accumulateChosen,
  runOrchestrationStep,
  type ParallelCandidate,
  type PeerAgent,
} from '../sage-assent-iteration-patterns'

import { computeWindowSnapshot } from '../trust-layer/evaluation-window/window-aggregator'

import type { Layer3ModeRenderInput } from '../philosophical-mode-service'
import type { Layer2Assessment } from '../../translation-sandwich/layer2-mechanisms'
import type { Layer1Schema } from '../../translation-sandwich/layer1-extractor'

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

function assertContains(label: string, haystack: string, needle: string): void {
  assert(
    label,
    haystack.includes(needle),
    `expected output to contain "${needle}"`
  )
}

function assertAbsent(label: string, haystack: string, needle: string): void {
  assert(
    label,
    !haystack.includes(needle),
    `expected output NOT to contain "${needle}"`
  )
}

// ============================================================================
// Fixtures — minimal valid Layer2Assessment, parameterised. Modelled on the
// existing sage-assent-iteration-patterns.test.ts fixtures.
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

function goodHabitual(): Layer2Assessment {
  return makeAssessment({
    proximity: 'habitual',
    is_kathekon: true,
    kathekon_quality: 'strong',
  })
}

function ctxWithSignature(signature: string): BridgeContext {
  return {
    agent_id: 'agent_SOMEONE_ELSE',
    evaluated_at: '2026-05-16T10:00:00.000Z',
    skill_id: 'sage-reason',
    signature,
    candidates_considered: 1,
  }
}

function makeLayer1Input(): Layer1Schema {
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
    motivation_evidence: [],
    element_fusion_detected: { fused: false, fused_concerns: null },
    ambiguity_notes: [],
  }
}

function makeRenderInput(opts: {
  proximity: KatorthomaProximityLevel
  is_kathekon?: boolean | null
  kathekon_quality?: 'strong' | 'moderate' | 'marginal' | 'contrary'
}): Layer3ModeRenderInput & { mode: 'sage_assent' } {
  return {
    mode: 'sage_assent',
    assessment: makeAssessment(opts),
    consumer_context: { consumer: 'api_reason' },
    score_context: { justification_source: 'engine_constructed' },
  }
}

function makeCandidate(opts: {
  proximity: KatorthomaProximityLevel
  is_kathekon?: boolean | null
  kathekon_quality?: 'strong' | 'moderate' | 'marginal' | 'contrary'
  signature: string
}): ParallelCandidate {
  return {
    layer1_input: makeLayer1Input(),
    input: makeRenderInput(opts),
    context: ctxWithSignature(opts.signature),
  }
}

const AGENT_ID = 'agent_handback_test_v1'

const CONSUMER_CTX: HandBackReportInput['consumer_context'] = {
  is_mentor_flavoured: false,
  include_category_framing: false,
}

/** Build a fixed-snapshot WindowSnapshot for deterministic tests. The
 *  computed_at field is the only clock-read in computeWindowSnapshot; for
 *  determinism we overwrite it with a fixed string. */
function makeFixedSnapshot(profile: CarriedProfile): WindowSnapshot {
  const live = computeWindowSnapshot(
    profile.agent_id,
    [...profile.evaluated_actions],
    profile.total_actions_evaluated,
    profile.window_config
  )
  return { ...live, computed_at: '2026-05-16T11:00:00.000Z' }
}

/** Build a fixed accreditation record (overrides the clock-stamped fields on
 *  the seeded record with fixed values), so the report's grade section is
 *  deterministic. */
function withFixedRecordTimestamps(profile: CarriedProfile): CarriedProfile {
  return {
    ...profile,
    accreditation_record: {
      ...profile.accreditation_record,
      grade_since: '2026-05-16T10:00:00.000Z',
      last_evaluation: '2026-05-16T10:00:00.000Z',
      expires_at: '2026-08-14T10:00:00.000Z',
      created_at: '2026-05-16T10:00:00.000Z',
      updated_at: '2026-05-16T10:00:00.000Z',
    },
  }
}

// ============================================================================
// Main
// ============================================================================

function main(): void {
  // --------------------------------------------------------------------------
  // RENDER-1 — empty CarriedProfile, no steps → coherent empty-state report
  // --------------------------------------------------------------------------
  {
    const fresh = withFixedRecordTimestamps(createCarriedProfile(AGENT_ID))
    const snapshot = makeFixedSnapshot(fresh)
    const result = renderAgentHandBackReport({
      profile: fresh,
      steps: [],
      snapshot,
      consumer_context: CONSUMER_CTX,
    })
    const md = result.markdown

    assertContains(
      'RENDER-1  title carries the agent_id',
      md,
      `\`${AGENT_ID}\``
    )
    assertContains(
      'RENDER-1  Section 1 renders with zero count',
      md,
      '## 1. Decisions (0)'
    )
    assertContains(
      'RENDER-1  Section 1 empty-state line present',
      md,
      'No decisions evaluated this session.'
    )
    assertContains(
      'RENDER-1  Section 1.5 renders with zero count',
      md,
      '## 1.5. Still under consideration (0)'
    )
    assertContains(
      'RENDER-1  Section 1.5 empty-state line present',
      md,
      'No candidates currently held under consideration.'
    )
    assertContains(
      'RENDER-1  Section 2 trajectory present',
      md,
      '## 2. Trajectory'
    )
    assertContains(
      'RENDER-1  Section 3 grade/authority/badge present',
      md,
      '## 3. Grade / Authority / Badge'
    )
    assertContains(
      'RENDER-1  Section 4 persisting passions present',
      md,
      '## 4. Persisting Passions'
    )
    assertContains(
      'RENDER-1  Section 4 empty-state line present',
      md,
      'No passions persisting across the evaluation window.'
    )
    assertAbsent(
      'RENDER-1  Section 5 (peers) NOT present when no peers',
      md,
      '## 5. Peer Agents'
    )
    assertContains(
      'RENDER-1  trailing newline',
      md.slice(-1),
      '\n'
    )
  }

  // --------------------------------------------------------------------------
  // RENDER-2 — one Sequential step → Section 1 shows one action; trajectory
  // --------------------------------------------------------------------------
  {
    const fresh = withFixedRecordTimestamps(createCarriedProfile(AGENT_ID))
    const step = runSequentialStep({
      profile: fresh,
      assessment: goodHabitual(),
      context: ctxWithSignature('render2_1'),
    })
    const profileAfter = withFixedRecordTimestamps(step.profile)
    const snapshot = makeFixedSnapshot(profileAfter)
    const result = renderAgentHandBackReport({
      profile: profileAfter,
      steps: [step],
      snapshot,
      consumer_context: CONSUMER_CTX,
    })
    const md = result.markdown

    assertContains(
      'RENDER-2  Section 1 carries one decision count',
      md,
      '## 1. Decisions (1)'
    )
    assertContains('RENDER-2  Decision 1 heading present', md, '### Decision 1')
    assertContains(
      'RENDER-2  Decision 1 proximity rendered',
      md,
      '**proximity:** habitual'
    )
    assertContains(
      'RENDER-2  Decision 1 how-reasoned (intuited) rendered',
      md,
      '**how reasoned:** intuited'
    )
    assertContains(
      'RENDER-2  Decision 1 kathekon rendered',
      md,
      '**kathekon:** kathekon (strong)'
    )
    assertContains(
      'RENDER-2  Decision 1 skill rendered',
      md,
      '**skill:** `sage-reason`'
    )
    assertContains(
      'RENDER-2  Trajectory section reflects actions in window',
      md,
      '**actions in window:** 1'
    )
  }

  // --------------------------------------------------------------------------
  // RENDER-3 — Pattern-2 (accumulateChosen N=3) → action's how-reasoned reflects
  // candidates_considered=3 (multi-branch); Section 1.5 shows 2 retained
  // --------------------------------------------------------------------------
  {
    const fresh = withFixedRecordTimestamps(createCarriedProfile(AGENT_ID))
    const candidates: ParallelCandidate[] = [
      makeCandidate({
        proximity: 'habitual',
        is_kathekon: true,
        kathekon_quality: 'strong',
        signature: 'cand_1',
      }),
      makeCandidate({
        proximity: 'deliberate',
        is_kathekon: true,
        kathekon_quality: 'strong',
        signature: 'cand_2',
      }),
      makeCandidate({
        proximity: 'principled',
        is_kathekon: true,
        kathekon_quality: 'strong',
        signature: 'cand_3',
      }),
    ]
    // The agent commits to candidate index 0 (habitual). The other two
    // (deliberate, principled) should land in carried_candidates.
    const step = accumulateChosen(fresh, candidates, 0)
    const profileAfter = withFixedRecordTimestamps(step.profile)
    const snapshot = makeFixedSnapshot(profileAfter)
    const result = renderAgentHandBackReport({
      profile: profileAfter,
      steps: [step],
      snapshot,
      consumer_context: CONSUMER_CTX,
    })
    const md = result.markdown

    assertContains(
      'RENDER-3  Decision 1 how-reasoned reflects multi-branch (N=3)',
      md,
      '**how reasoned:** multi-branch deliberated (N=3)'
    )
    assertContains(
      'RENDER-3  Section 1.5 reports 2 retained candidates',
      md,
      '## 1.5. Still under consideration (2)'
    )
    // The default comparator ranks by proximity descending → principled before
    // deliberate.
    assertContains(
      'RENDER-3  Rank 1 retained candidate carries principled proximity',
      md,
      '**rank 1** · proximity: **principled**'
    )
    assertContains(
      'RENDER-3  Rank 2 retained candidate carries deliberate proximity',
      md,
      '**rank 2** · proximity: **deliberate**'
    )
  }

  // --------------------------------------------------------------------------
  // RENDER-4 — orchestrator step WITH peers → Section 5 renders peers
  // --------------------------------------------------------------------------
  {
    const orchestrator = withFixedRecordTimestamps(
      createCarriedProfile(AGENT_ID)
    )

    const peerA = withFixedRecordTimestamps(
      createCarriedProfile('agent_peer_alpha')
    )
    const peerB = withFixedRecordTimestamps(
      createCarriedProfile('agent_peer_beta')
    )
    const peers: PeerAgent[] = [
      { carried_profile: peerA },
      { carried_profile: peerB },
    ]

    const step = runOrchestrationStep({
      orchestrator: {
        profile: orchestrator,
        assessment: goodHabitual(),
        context: ctxWithSignature('orch_1'),
      },
      peers,
    })
    const profileAfter = withFixedRecordTimestamps(step.profile)
    const snapshot = makeFixedSnapshot(profileAfter)
    const result = renderAgentHandBackReport({
      profile: profileAfter,
      steps: [step],
      snapshot,
      consumer_context: CONSUMER_CTX,
    })
    const md = result.markdown

    assertContains(
      'RENDER-4  Section 5 renders peer count',
      md,
      '## 5. Peer Agents (orchestration this session) — 2'
    )
    assertContains(
      'RENDER-4  peer_alpha appears',
      md,
      '**agent_peer_alpha**'
    )
    assertContains(
      'RENDER-4  peer_beta appears',
      md,
      '**agent_peer_beta**'
    )
    assertContains(
      'RENDER-4  peer entry carries authority level',
      md,
      'supervised'
    )
    assertContains(
      'RENDER-4  peer entry includes the latest-rendering note',
      md,
      'no in-loop rendering held'
    )
  }

  // --------------------------------------------------------------------------
  // RENDER-5 — orchestrator step WITHOUT peers → Section 5 hidden
  // --------------------------------------------------------------------------
  {
    const orchestrator = withFixedRecordTimestamps(
      createCarriedProfile(AGENT_ID)
    )
    const step = runOrchestrationStep({
      orchestrator: {
        profile: orchestrator,
        assessment: goodHabitual(),
        context: ctxWithSignature('orch_empty'),
      },
      peers: [],
    })
    const profileAfter = withFixedRecordTimestamps(step.profile)
    const snapshot = makeFixedSnapshot(profileAfter)
    const result = renderAgentHandBackReport({
      profile: profileAfter,
      steps: [step],
      snapshot,
      consumer_context: CONSUMER_CTX,
    })
    const md = result.markdown

    assertAbsent(
      'RENDER-5  Section 5 hidden when orchestrator had no peers',
      md,
      '## 5. Peer Agents'
    )
  }

  // --------------------------------------------------------------------------
  // RENDER-6 — typical_deliberation_breadth headline appears in Section 2
  // --------------------------------------------------------------------------
  {
    const fresh = withFixedRecordTimestamps(createCarriedProfile(AGENT_ID))
    const step = runSequentialStep({
      profile: fresh,
      assessment: goodHabitual(),
      context: ctxWithSignature('render6_1'),
    })
    const profileAfter = withFixedRecordTimestamps(step.profile)
    const snapshot = makeFixedSnapshot(profileAfter)
    const result = renderAgentHandBackReport({
      profile: profileAfter,
      steps: [step],
      snapshot,
      consumer_context: CONSUMER_CTX,
    })
    const md = result.markdown

    assertContains(
      'RENDER-6  typical_deliberation_breadth headline in Section 2',
      md,
      '**typical deliberation breadth:** intuited'
    )
    assertContains(
      'RENDER-6  deliberation breadth distribution rendered',
      md,
      '**deliberation breadth distribution:**'
    )
  }

  // --------------------------------------------------------------------------
  // RENDER-7 — persisting passions non-empty renders the passion strings
  // --------------------------------------------------------------------------
  {
    const fresh = withFixedRecordTimestamps(createCarriedProfile(AGENT_ID))
    // Inject a passion-bearing accreditation record (the payload reads
    // passions_persisting as a string list — we just need it non-empty for
    // the rendering test).
    const profileWithPassions: CarriedProfile = {
      ...fresh,
      accreditation_record: {
        ...fresh.accreditation_record,
        passions_persisting: [
          {
            root_passion: 'phobos',
            sub_species: 'agonia',
            occurrence_count: 5,
            occurrence_rate: 0.5,
          },
        ],
      },
    }
    const snapshot = makeFixedSnapshot(profileWithPassions)
    const result = renderAgentHandBackReport({
      profile: profileWithPassions,
      steps: [],
      snapshot,
      consumer_context: CONSUMER_CTX,
    })
    const md = result.markdown

    assertContains(
      'RENDER-7  Section 4 renders the passion string (root/sub form)',
      md,
      'phobos/agonia'
    )
    assertAbsent(
      'RENDER-7  Section 4 does NOT render the empty-state line',
      md,
      'No passions persisting across the evaluation window.'
    )
  }

  // --------------------------------------------------------------------------
  // RENDER-8 — verification_url renders and matches the record's URL
  // --------------------------------------------------------------------------
  {
    const fresh = withFixedRecordTimestamps(createCarriedProfile(AGENT_ID))
    const snapshot = makeFixedSnapshot(fresh)
    const result = renderAgentHandBackReport({
      profile: fresh,
      steps: [],
      snapshot,
      consumer_context: CONSUMER_CTX,
    })
    const md = result.markdown
    const expectedUrl = fresh.accreditation_record.verification_url

    assertContains(
      'RENDER-8  Section 3 renders the verification URL',
      md,
      expectedUrl
    )
    assertContains(
      'RENDER-8  Section 3 verify line present',
      md,
      `**verify:** ${expectedUrl}`
    )
    assertContains(
      'RENDER-8  Signoff carries the verify-this-report URL footer',
      md,
      `Verify this report's credential at ${expectedUrl}`
    )
  }

  // --------------------------------------------------------------------------
  // RENDER-9 — typical_kathekon_quality headline appears in Section 2
  // (Decision G — kathekon-aligned alternative build, 2026-05-16)
  // --------------------------------------------------------------------------
  {
    const fresh = withFixedRecordTimestamps(createCarriedProfile(AGENT_ID))
    const step = runSequentialStep({
      profile: fresh,
      assessment: goodHabitual(),
      context: ctxWithSignature('render9_1'),
    })
    const profileAfter = withFixedRecordTimestamps(step.profile)
    const snapshot = makeFixedSnapshot(profileAfter)
    const result = renderAgentHandBackReport({
      profile: profileAfter,
      steps: [step],
      snapshot,
      consumer_context: CONSUMER_CTX,
    })
    const md = result.markdown

    // goodHabitual() supplies kathekon_quality 'strong' on a single action;
    // with 1 strong action and a 0.6 threshold, typical_kathekon_quality
    // computes to 'strong' (1/1 strong at-or-above >= 0.6).
    assertContains(
      'RENDER-9  typical_kathekon_quality headline in Section 2',
      md,
      '**typical kathekon quality:** strong'
    )
  }

  // --------------------------------------------------------------------------
  // RENDER-10 — kathekon_quality_distribution appears in Section 2
  // (Decision G — kathekon-aligned alternative build, 2026-05-16)
  // --------------------------------------------------------------------------
  {
    const fresh = withFixedRecordTimestamps(createCarriedProfile(AGENT_ID))
    const step = runSequentialStep({
      profile: fresh,
      assessment: goodHabitual(),
      context: ctxWithSignature('render10_1'),
    })
    const profileAfter = withFixedRecordTimestamps(step.profile)
    const snapshot = makeFixedSnapshot(profileAfter)
    const result = renderAgentHandBackReport({
      profile: profileAfter,
      steps: [step],
      snapshot,
      consumer_context: CONSUMER_CTX,
    })
    const md = result.markdown

    assertContains(
      'RENDER-10  kathekon quality distribution rendered (label)',
      md,
      '**kathekon quality distribution:**'
    )
    // goodHabitual() => one 'strong' action; distribution has strong: 1.
    assertContains(
      'RENDER-10  kathekon quality distribution carries the strong count',
      md,
      'strong: 1'
    )
    assertContains(
      'RENDER-10  kathekon quality distribution carries the contrary zero',
      md,
      'contrary: 0'
    )
  }

  // --------------------------------------------------------------------------
  // RENDER-11 — typical_kathekon_quality appears in Section 3
  // (Decision G — kathekon-aligned alternative build, 2026-05-16)
  // --------------------------------------------------------------------------
  {
    // A fresh CarriedProfile's AccreditationRecord seeds
    // typical_kathekon_quality to 'contrary' (the conservative baseline) via
    // createAccreditationRecord. Section 3 reads it from the payload-shape
    // projection.
    const fresh = withFixedRecordTimestamps(createCarriedProfile(AGENT_ID))
    const snapshot = makeFixedSnapshot(fresh)
    const result = renderAgentHandBackReport({
      profile: fresh,
      steps: [],
      snapshot,
      consumer_context: CONSUMER_CTX,
    })
    const md = result.markdown

    assertContains(
      'RENDER-11  typical_kathekon_quality appears in Section 3 (fresh baseline = contrary)',
      md,
      '**typical kathekon quality:** contrary'
    )
  }

  // --------------------------------------------------------------------------
  // DET-1 — two renders with identical input + supplied snapshot → identical
  // --------------------------------------------------------------------------
  {
    const fresh = withFixedRecordTimestamps(createCarriedProfile(AGENT_ID))
    const step = runSequentialStep({
      profile: fresh,
      assessment: goodHabitual(),
      context: ctxWithSignature('det_1'),
    })
    const profileAfter = withFixedRecordTimestamps(step.profile)
    const snapshot = makeFixedSnapshot(profileAfter)
    const input: HandBackReportInput = {
      profile: profileAfter,
      steps: [step],
      snapshot,
      consumer_context: CONSUMER_CTX,
    }
    const a = renderAgentHandBackReport(input).markdown
    const b = renderAgentHandBackReport(input).markdown

    assertEqual(
      'DET-1  byte-identical output for identical input + supplied snapshot',
      a,
      b
    )
  }

  // --------------------------------------------------------------------------
  // R3-1 — output contains ACCREDITATION_DISCLAIMER text
  // --------------------------------------------------------------------------
  {
    const fresh = withFixedRecordTimestamps(createCarriedProfile(AGENT_ID))
    const snapshot = makeFixedSnapshot(fresh)
    const result = renderAgentHandBackReport({
      profile: fresh,
      steps: [],
      snapshot,
      consumer_context: CONSUMER_CTX,
    })
    const md = result.markdown

    // ACCREDITATION_DISCLAIMER is a 3-sentence string; checking a distinctive
    // fragment is sufficient evidence of presence.
    assertContains(
      'R3-1  Output contains ACCREDITATION_DISCLAIMER opening clause',
      md,
      'This accreditation evaluates reasoning quality using Stoic philosophical frameworks.'
    )
    assertContains(
      'R3-1  Output contains ACCREDITATION_DISCLAIMER closing tagline',
      md,
      'Ancient reasoning, modern application.'
    )
  }

  // --------------------------------------------------------------------------
  // R4-1 — output contains no internal thresholds / micro-logic / dimension
  // confidence scores
  // --------------------------------------------------------------------------
  {
    const fresh = withFixedRecordTimestamps(createCarriedProfile(AGENT_ID))
    const snapshot = makeFixedSnapshot(fresh)
    const result = renderAgentHandBackReport({
      profile: fresh,
      steps: [],
      snapshot,
      consumer_context: CONSUMER_CTX,
    })
    const md = result.markdown

    // Internal threshold names from the grade-transition engine + window
    // aggregator that MUST NOT leak.
    assertAbsent('R4-1  no UPGRADE_THRESHOLD leak', md, 'UPGRADE_THRESHOLD')
    assertAbsent('R4-1  no DOWNGRADE_THRESHOLD leak', md, 'DOWNGRADE_THRESHOLD')
    assertAbsent(
      'R4-1  no typical_proximity_threshold leak',
      md,
      'typical_proximity_threshold'
    )
    assertAbsent(
      'R4-1  no dimension_level_threshold leak',
      md,
      'dimension_level_threshold'
    )
    assertAbsent(
      'R4-1  no minimum_actions_for_grade leak',
      md,
      'minimum_actions_for_grade'
    )
    // Internal record-only fields not in the public payload.
    assertAbsent('R4-1  no regressing_check_count leak', md, 'regressing_check_count')
    assertAbsent('R4-1  no expires_at leak', md, 'expires_at')
    assertAbsent('R4-1  no created_at leak', md, 'created_at')
    // Per-dimension confidence is an internal diagnostic, not in the payload.
    assertAbsent('R4-1  no dimension_detail leak', md, 'dimension_detail')
  }

  // --------------------------------------------------------------------------
  // R18a-1 — output contains the Character Kernel category language
  // --------------------------------------------------------------------------
  {
    const fresh = withFixedRecordTimestamps(createCarriedProfile(AGENT_ID))
    const snapshot = makeFixedSnapshot(fresh)
    const result = renderAgentHandBackReport({
      profile: fresh,
      steps: [],
      snapshot,
      consumer_context: CONSUMER_CTX,
    })
    const md = result.markdown

    assertContains(
      'R18a-1  Output contains the Character Kernel category language',
      md,
      'Character Kernel'
    )
    assertContains(
      'R18a-1  Output explicitly disclaims absolute safety/ethics/trustworthiness',
      md,
      'safety, ethics, or trustworthiness in any absolute sense'
    )
  }

  // --------------------------------------------------------------------------
  // Report
  // --------------------------------------------------------------------------
  console.log('')
  console.log(`Total: ${passCount + failCount}    Pass: ${passCount}    Fail: ${failCount}`)
  if (failCount > 0) {
    console.log('')
    console.log('Failures:')
    failures.forEach((f) => console.log(`  - ${f}`))
    process.exit(1)
  }
}

main()
