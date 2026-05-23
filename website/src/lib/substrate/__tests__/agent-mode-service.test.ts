/**
 * agent-mode-service.test.ts — Layer 3 agent-mode rendering (ATL Wrapper
 * Component 2) functional tests + invariant checks.
 *
 * Run via: `npx tsx website/src/lib/substrate/__tests__/agent-mode-service.test.ts`
 * (mirrors the A5 / A7 / philosophical-mode / score-architecture / sage-assent-bridge
 * verification pattern; no Jest framework dependency).
 *
 * COVERAGE
 *
 *   DISPATCH (PR1 / PR2 — the dispatch pattern is invoked here with the new mode)
 *     DSP-1  renderLayer3Mode({ mode: 'atl_wrapper' }) returns a result
 *     DSP-2  the result carries mode / json / markdown
 *     DSP-3  renderLayer3Mode still throws on an unimplemented mode
 *     DSP-4  renderAgentMode (the sync entry point) returns the same JSON
 *
 *   JSON SECTION ORDERING
 *     ORD-1  JSON top-level keys follow the superseded spec's section ordering
 *     ORD-2  Markdown section order: wrap → title → verdict → score vector →
 *            scalar score → principal findings → caveats → closing wraps
 *
 *   MANDATORY WRAPS (R3 / R19c / R19d / R20a / R18a / R18e)
 *     WRAP-1  R3 disclaimer present + canonical in JSON + Markdown
 *     WRAP-2  R19c limitations present + canonical
 *     WRAP-3  R18e transparency notice present + canonical
 *     WRAP-4  R19d mirror principle null when not mentor-flavoured
 *     WRAP-5  R19d mirror principle present + canonical when mentor-flavoured
 *     WRAP-6  R18a category framing null when not requested
 *     WRAP-7  R18a category framing present + canonical when requested
 *
 *   VERDICT — the verdict-to-action label + the gate result
 *     VERD-1  is_kathekon true  → kathekon 'appropriate'
 *     VERD-2  is_kathekon false → kathekon 'not_appropriate'
 *     VERD-3  is_kathekon null  → kathekon 'undetermined'
 *     VERD-4  verdict fields project verbatim from the SubstrateScore verdict
 *
 *   SCORE — the score vector + scalar project from the SubstrateScore
 *     SCORE-1  score_components project verbatim from computeSubstrateScore
 *     SCORE-2  component_sum projects verbatim
 *     SCORE-3  score scalar projects verbatim (incl. cap_applied + confidence)
 *     SCORE-4  gate outcomes: confirmed / contrary / provisional_agent_asserted
 *              / provisional_null all project correctly
 *     SCORE-5  PROVISIONAL validity + cap render in the Markdown
 *
 *   SCORE CONTEXT
 *     CTX-1  absent score_context → defaults to justification_source 'absent'
 *     CTX-2  declared_motivation_passion 'detected' surfaces in metadata
 *     CTX-3  declared_motivation_passion 'clean' surfaces in metadata
 *     CTX-4  absent declaration → metadata declared_motivation_passion 'absent'
 *
 *   AGENT PROJECTIONS
 *     PROJ-1   principal_passion projects the first detected passion
 *     PROJ-2   passion_count counts the detected passions
 *     PROJ-3   principal_value_error projects the first mis-categorised indifferent
 *     PROJ-4   value_errors_count counts mis-categorised indifferents
 *     PROJ-5   virtues_engaged de-duplicates a repeated domain
 *     PROJ-6   indifferents_ranked sorts by axia (high → moderate → low)
 *     PROJ-7   correction projects from improvement_path_structured
 *     PROJ-8   correction is null when improvement_path_structured is null
 *     PROJ-9   stated_operative_conflict true when the soft clarification fired
 *     PROJ-10  stated_operative_conflict false when no soft clarification fired
 *     PROJ-11  oikeiosis_circle_served = the first relevant circle
 *     PROJ-12  objective_function_declared is always null this session
 *     PROJ-13  direction_of_travel surfaces (R17e does NOT filter agent profiles)
 *     PROJ-14  layer2_assessment_verbatim carries the full assessment
 *     PROJ-15  the Markdown omits the Correction section when correction is null
 *
 *   REFLECTION COMPONENT (open_questions — withheld_classification verbatim)
 *     REFL-1  open_questions projects one entry per Layer 2 open deferral
 *     REFL-2  withheld_classification is preserved VERBATIM in the JSON
 *     REFL-3  the withheld field_path + reason render in the Markdown
 *     REFL-4  open_questions is empty when there are no open deferrals
 *
 *   RECEIVING-AGENT CAVEATS
 *     CAV-1  caveats_for_receiving_agent equals AGENT_MODE_CAVEATS verbatim
 *     CAV-2  every caveat renders in the Markdown
 *
 *   R20a DISTRESS PASSTHROUGH (PR6 watch-point — rendered, not modified)
 *     R20A-1  distress signal → json.distress_passthrough is the canonical text
 *     R20A-2  distress signal → json.agent_projections is null (section 5 replaced)
 *     R20A-3  distress signal → verdict + score still render (mirror of philo mode)
 *     R20A-4  distress signal → Markdown shows the Response block, omits section 5
 *
 *   R17e POSTURE (the load-bearing distinction — does NOT apply to agent profiles)
 *     R17E-1  meta.r17e_exclusion_applied is the literal false
 *     R17E-2  the iterative_refinement fields are surfaced, not stripped
 *
 *   INVARIANTS
 *     DET-1  two identical renders produce byte-identical JSON
 *     DET-2  two identical renders produce byte-identical Markdown
 *     DET-3  renderAgentMode does not mutate the input assessment
 *
 * Exit code 0 = all pass. Non-zero = failures printed.
 */

import {
  renderLayer3Mode,
  type Layer3RenderMode,
} from '../philosophical-mode-service'

import { renderAgentMode, AGENT_MODE_CAVEATS } from '../agent-mode-service'

import {
  computeSubstrateScore,
  type ScoreContext,
} from '../score-architecture'

import {
  R3_DISCLAIMER,
  R19C_LIMITATIONS_LINK,
  R19D_MIRROR_PRINCIPLE,
  R20A_DISTRESS_PASSTHROUGH,
  R18A_CHARACTER_KERNEL_CATEGORY,
  R18E_ARTICLE_50_TRANSPARENCY_NOTICE,
  type ConsumerContext,
} from '../layer3-service'

import type { Layer2Assessment } from '../../translation-sandwich/layer2-mechanisms'

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

// ============================================================================
// Fixtures
// ============================================================================

/** CONFIRMED — a rich, kathekon-confirmed assessment. is_kathekon true, quality
 *  'strong'; two passions (phobos/agonia at synkatathesis, phobos at horme);
 *  one within + one outside prohairesis; one oikeiosis circle; three
 *  indifferents (health high/evil, wealth low/good, reputation moderate/
 *  indifferent → two value errors, all three axia grades for the ranking test);
 *  an improvement path; a STATED_OPERATIVE_CONFLICT soft clarification; one
 *  open deferral; duplicated virtue domains (for the de-dup test);
 *  direction_of_travel 'stable'. */
const CONFIRMED: Layer2Assessment = {
  version: 'layer2-assessment-v1',
  layer1_schema_version: 'layer1-schema-v1',
  passion_diagnosis: {
    passions_detected: [
      {
        id: 'p1',
        name: 'Anguished anxiety over the deployment outcome',
        root_passion: 'phobos',
        sub_species: 'agonia',
        false_judgement: 'A failed deploy is a genuine evil.',
        correct_judgement: 'The deploy outcome is a preferred indifferent.',
        causal_stage_affected: 'synkatathesis',
        evidence: 'The agent assented to the fear before examining the impression.',
      },
      {
        id: 'p2',
        name: 'Impulse to roll back without deliberation',
        root_passion: 'phobos',
        sub_species: null,
        false_judgement: 'Rolling back now will remove the evil.',
        correct_judgement: 'Right action proceeds from judgement, not fear.',
        causal_stage_affected: 'horme',
        evidence: 'The rollback impulse formed before the diagnostic completed.',
      },
    ],
    false_judgements: ['A failed deploy is a genuine evil.'],
    correct_judgements: ['The deploy outcome is a preferred indifferent.'],
    causal_stage_affected: 'synkatathesis',
  },
  control_filter: {
    within_prohairesis: [
      {
        item: 'the quality of the diagnostic the agent runs',
        agent_named_position: 'within',
        classification: 'within',
        reasoning: 'agent_identified_within',
      },
    ],
    outside_prohairesis: [
      {
        item: 'whether the deploy ultimately succeeds',
        agent_named_position: 'outside',
        classification: 'outside',
        reasoning: 'agent_identified_outside',
      },
    ],
    disambiguation_required: [],
  },
  oikeiosis: {
    relevant_circles: [
      {
        stage: 3,
        circle: 'local_community',
        description: 'the engineering team relying on the deploy',
        honourability_grade: 2,
        advantageousness_grade: 2,
        cicero_verdict: 'balanced_neither_decisive',
        obligation_met: true,
        tension: null,
      },
    ],
    deliberation_notes: 'The obligation to the team is being fulfilled.',
  },
  value_assessment: {
    indifferents_at_stake: [
      {
        name: 'health',
        axia: 'high',
        treated_as: 'evil',
        evidence: 'The on-call burden is treated as a genuine evil.',
        error: 'a high-worth indifferent mis-categorised as a genuine evil',
      },
      {
        name: 'wealth',
        axia: 'low',
        treated_as: 'good',
        evidence: 'The cost saving is treated as a genuine good.',
        error: 'a low-worth indifferent mis-categorised as a genuine good',
      },
      {
        name: 'reputation',
        axia: 'moderate',
        treated_as: 'indifferent',
        evidence: 'Correctly held as a preferred indifferent.',
        error: null,
      },
    ],
    value_error: 'Two indifferents are treated as more than they are.',
  },
  kathekon_assessment: {
    is_kathekon: true,
    quality: 'strong',
    justification:
      'Running the diagnostic before acting accords with the role obligation and proceeds from judgement.',
  },
  iterative_refinement: {
    senecan_grade: 'grade_2',
    progress_dimensions: {
      passion_reduction: 'consolidating',
      judgement_quality: 'consolidating',
      disposition_stability: 'consolidating',
      oikeiosis_extension: 'consolidating',
    },
    direction_of_travel: 'stable',
    motivation_classification: 'virtue_explicit',
  },
  katorthoma_proximity: 'principled',
  ruling_faculty_state: 'Assent given deliberately, on examined judgement.',
  virtue_domains_engaged: ['phronesis', 'dikaiosyne', 'phronesis'],
  improvement_path_structured: {
    false_judgement_to_correct: 'A failed deploy is a genuine evil.',
    mechanism_applies: 'passion_diagnosis',
    corrected_judgement: 'The deploy outcome is a preferred indifferent.',
  },
  stage_scores: {
    control_filter: 'strong',
    passion_diagnosis: 'strong',
    oikeiosis: 'adequate',
    value_assessment: 'adequate',
    kathekon_assessment: 'strong',
    iterative_refinement: 'adequate',
  },
  hasty_assent_risk: 'moderate',
  intake_clarifications: {
    soft_clarifications: [
      {
        trigger_code: 'STATED_OPERATIVE_CONFLICT',
        intake_tier: 2,
        stem_id: 'stem-stated-operative-conflict',
        slot_fills: { STATED_CIRCLE_TARGET: 'the team', SITUATION: 'the deploy' },
        scope_of_change:
          'Clarifying the operative motivation would refine the kathekon justification.',
      },
    ],
    open_deferrals: [
      {
        trigger_code: 'PRAXIS_MOTIVATION_AMBIGUITY',
        intake_tier: 3,
        stem_id: 'stem-praxis-motivation',
        slot_fills: { SURFACE_PATTERN: 'the rollback impulse' },
        withheld_classification: {
          field_path: 'iterative_refinement.motivation_classification',
          withheld_at_position: 'position-6',
          reason:
            'The agent’s own account of what was operative at the praxis stage is absent.',
        },
        status: 'open',
      },
    ],
  },
  layer1_ambiguity_notes: ['The temporal scope of "recent" was not made precise.'],
  layer2_ambiguity_notes: [],
}

/** CONTRARY — is_kathekon false, quality 'marginal'. */
const CONTRARY: Layer2Assessment = {
  ...CONFIRMED,
  kathekon_assessment: {
    is_kathekon: false,
    quality: 'marginal',
    justification:
      'Rolling back on the unexamined impulse is not consistent with appropriate action.',
  },
}

/** NULL — is_kathekon null, quality 'marginal'. */
const NULL_ASSESSMENT: Layer2Assessment = {
  ...CONFIRMED,
  kathekon_assessment: {
    is_kathekon: null,
    quality: 'marginal',
    justification: 'Appropriateness cannot be determined from the available evidence.',
  },
}

/** MINIMAL — every omittable section empty/null: no passions, no circles, no
 *  indifferents, improvement_path null, no soft clarifications, no open
 *  deferrals, single_snapshot. */
const MINIMAL: Layer2Assessment = {
  version: 'layer2-assessment-v1',
  layer1_schema_version: 'layer1-schema-v1',
  passion_diagnosis: {
    passions_detected: [],
    false_judgements: [],
    correct_judgements: [],
    causal_stage_affected: null,
  },
  control_filter: {
    within_prohairesis: [],
    outside_prohairesis: [],
    disambiguation_required: [],
  },
  oikeiosis: { relevant_circles: [], deliberation_notes: '' },
  value_assessment: { indifferents_at_stake: [], value_error: null },
  kathekon_assessment: {
    is_kathekon: true,
    quality: 'strong',
    justification: 'The action accords with the role obligation.',
  },
  iterative_refinement: {
    senecan_grade: 'pre_progress',
    progress_dimensions: {
      passion_reduction: 'developing',
      judgement_quality: 'developing',
      disposition_stability: 'developing',
      oikeiosis_extension: 'developing',
    },
    direction_of_travel: 'single_snapshot',
    motivation_classification: null,
  },
  katorthoma_proximity: 'reflexive',
  ruling_faculty_state: 'Insufficient evidence to characterise.',
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

/** DISTRESS — CONFIRMED with A7's sub-threshold distress_signal flag set. */
const DISTRESS: Layer2Assessment = {
  ...CONFIRMED,
  distress_signal: true,
}

const CONSUMER_PLAIN: ConsumerContext = { consumer: 'api_reason' }
const CONSUMER_MENTOR: ConsumerContext = {
  consumer: 'api_reason',
  is_mentor_flavoured: true,
}
const CONSUMER_CATEGORY: ConsumerContext = {
  consumer: 'api_reason',
  include_category_framing: true,
}

const CTX_ENGINE: ScoreContext = { justification_source: 'engine_constructed' }
const CTX_AGENT: ScoreContext = { justification_source: 'agent_asserted' }
const CTX_ENGINE_CLEAN: ScoreContext = {
  justification_source: 'engine_constructed',
  declared_motivation_passion: 'clean',
}
const CTX_ENGINE_DETECTED: ScoreContext = {
  justification_source: 'engine_constructed',
  declared_motivation_passion: 'detected',
}

// ============================================================================
// Main — async because renderLayer3Mode is declared async
// ============================================================================

async function main(): Promise<void> {
  // --- Renders used across the assertions -------------------------------
  const confirmed = await renderLayer3Mode({
    mode: 'atl_wrapper',
    assessment: CONFIRMED,
    consumer_context: CONSUMER_PLAIN,
    score_context: CTX_ENGINE,
  })
  const contrary = await renderLayer3Mode({
    mode: 'atl_wrapper',
    assessment: CONTRARY,
    consumer_context: CONSUMER_PLAIN,
    score_context: CTX_ENGINE,
  })
  const nullRender = await renderLayer3Mode({
    mode: 'atl_wrapper',
    assessment: NULL_ASSESSMENT,
    consumer_context: CONSUMER_PLAIN,
    score_context: CTX_ENGINE,
  })
  const provisional = await renderLayer3Mode({
    mode: 'atl_wrapper',
    assessment: CONFIRMED,
    consumer_context: CONSUMER_PLAIN,
    score_context: CTX_AGENT,
  })
  const minimal = await renderLayer3Mode({
    mode: 'atl_wrapper',
    assessment: MINIMAL,
    consumer_context: CONSUMER_PLAIN,
    score_context: CTX_ENGINE,
  })
  const mentor = await renderLayer3Mode({
    mode: 'atl_wrapper',
    assessment: CONFIRMED,
    consumer_context: CONSUMER_MENTOR,
    score_context: CTX_ENGINE,
  })
  const category = await renderLayer3Mode({
    mode: 'atl_wrapper',
    assessment: CONFIRMED,
    consumer_context: CONSUMER_CATEGORY,
    score_context: CTX_ENGINE,
  })
  const distress = await renderLayer3Mode({
    mode: 'atl_wrapper',
    assessment: DISTRESS,
    consumer_context: CONSUMER_PLAIN,
    score_context: CTX_ENGINE,
  })

  // --- DISPATCH ---------------------------------------------------------
  assert('DSP-1  renderLayer3Mode returns a result', confirmed != null)
  assert(
    'DSP-2  result carries mode / json / markdown',
    confirmed.mode === 'atl_wrapper' &&
      typeof confirmed.markdown === 'string' &&
      confirmed.json != null &&
      confirmed.json.version === 'agent-mode-response-v1'
  )
  {
    let threw = false
    try {
      await renderLayer3Mode({
        mode: 'standard' as Layer3RenderMode,
        assessment: CONFIRMED,
        consumer_context: CONSUMER_PLAIN,
      })
    } catch {
      threw = true
    }
    assert('DSP-3  renderLayer3Mode throws on an unimplemented mode', threw)
  }
  {
    // renderAgentMode (the synchronous entry point) produces the same JSON as
    // the async dispatch path.
    const sync = renderAgentMode({
      mode: 'atl_wrapper',
      assessment: CONFIRMED,
      consumer_context: CONSUMER_PLAIN,
      score_context: CTX_ENGINE,
    })
    assertEqual(
      'DSP-4  renderAgentMode returns the same JSON as the dispatch path',
      JSON.stringify(sync.json),
      JSON.stringify(confirmed.json)
    )
  }

  // --- JSON SECTION ORDERING -------------------------------------------
  {
    const keys = Object.keys(confirmed.json)
    const expected = [
      'version',
      'mode',
      'mandatory_injections',
      'verdict',
      'score_components',
      'component_sum',
      'score',
      'agent_projections',
      'distress_passthrough',
      'caveats_for_receiving_agent',
      'meta',
    ]
    assertEqual(
      'ORD-1  JSON top-level keys follow the spec section ordering',
      keys.join(','),
      expected.join(',')
    )
  }
  {
    const md = confirmed.markdown
    const positions = [
      md.indexOf(R3_DISCLAIMER),
      md.indexOf(`# Agent-Mode Decision Support`),
      md.indexOf('## Verdict'),
      md.indexOf('## Score vector'),
      md.indexOf('## Scalar score'),
      md.indexOf('## Principal findings'),
      md.indexOf('## Caveats for the receiving agent'),
      md.indexOf(R19C_LIMITATIONS_LINK),
    ]
    let ordered = true
    for (let i = 1; i < positions.length; i++) {
      if (positions[i] <= positions[i - 1] || positions[i] < 0) ordered = false
    }
    assert('ORD-2  Markdown section order follows the spec', ordered, positions.join(','))
  }

  // --- MANDATORY WRAPS --------------------------------------------------
  assertEqual(
    'WRAP-1a R3 disclaimer canonical in JSON',
    confirmed.json.mandatory_injections.r3_disclaimer,
    R3_DISCLAIMER
  )
  assert('WRAP-1b R3 disclaimer in Markdown', confirmed.markdown.includes(R3_DISCLAIMER))
  assertEqual(
    'WRAP-2  R19c limitations canonical in JSON',
    confirmed.json.mandatory_injections.r19_limitations,
    R19C_LIMITATIONS_LINK
  )
  assertEqual(
    'WRAP-3  R18e transparency notice canonical in JSON',
    confirmed.json.mandatory_injections.r18e_transparency_notice,
    R18E_ARTICLE_50_TRANSPARENCY_NOTICE
  )
  assertEqual(
    'WRAP-4  R19d mirror principle null when not mentor-flavoured',
    confirmed.json.mandatory_injections.r19_mirror_principle,
    null
  )
  assertEqual(
    'WRAP-5  R19d mirror principle present + canonical when mentor-flavoured',
    mentor.json.mandatory_injections.r19_mirror_principle,
    R19D_MIRROR_PRINCIPLE
  )
  assert(
    'WRAP-5b R19d mirror principle renders in the mentor Markdown',
    mentor.markdown.includes(R19D_MIRROR_PRINCIPLE)
  )
  assertEqual(
    'WRAP-6  R18a category framing null when not requested',
    confirmed.json.mandatory_injections.r18a_category,
    null
  )
  assertEqual(
    'WRAP-7a R18a category framing present + canonical when requested',
    category.json.mandatory_injections.r18a_category,
    R18A_CHARACTER_KERNEL_CATEGORY
  )
  {
    // R18a sits in the title block — before the Verdict.
    const md = category.markdown
    const r18aPos = md.indexOf(R18A_CHARACTER_KERNEL_CATEGORY)
    const verdictPos = md.indexOf('## Verdict')
    assert(
      'WRAP-7b R18a category framing renders before the Verdict',
      r18aPos >= 0 && r18aPos < verdictPos
    )
  }

  // --- VERDICT ----------------------------------------------------------
  assertEqual(
    'VERD-1  is_kathekon true → kathekon appropriate',
    confirmed.json.verdict.kathekon,
    'appropriate'
  )
  assertEqual(
    'VERD-2  is_kathekon false → kathekon not_appropriate',
    contrary.json.verdict.kathekon,
    'not_appropriate'
  )
  assertEqual(
    'VERD-3  is_kathekon null → kathekon undetermined',
    nullRender.json.verdict.kathekon,
    'undetermined'
  )
  {
    const score = computeSubstrateScore(CONFIRMED, CTX_ENGINE)
    assert(
      'VERD-4  verdict fields project verbatim from the SubstrateScore verdict',
      confirmed.json.verdict.is_kathekon === score.verdict.is_kathekon &&
        confirmed.json.verdict.justification_source ===
          score.verdict.justification_source &&
        confirmed.json.verdict.quality === score.verdict.quality &&
        confirmed.json.verdict.effective_quality ===
          score.verdict.effective_quality &&
        confirmed.json.verdict.convention_quality_cap_applied ===
          score.verdict.convention_quality_cap_applied &&
        confirmed.json.verdict.gate_outcome === score.verdict.gate_outcome
    )
  }

  // --- SCORE ------------------------------------------------------------
  {
    const score = computeSubstrateScore(CONFIRMED, CTX_ENGINE)
    assertEqual(
      'SCORE-1  score_components project verbatim from computeSubstrateScore',
      JSON.stringify(confirmed.json.score_components),
      JSON.stringify(score.components)
    )
    assertEqual(
      'SCORE-2  component_sum projects verbatim',
      confirmed.json.component_sum,
      score.component_sum
    )
    assertEqual(
      'SCORE-3  score scalar projects verbatim',
      JSON.stringify(confirmed.json.score),
      JSON.stringify(score.score)
    )
  }
  assertEqual(
    'SCORE-4a confirmed → gate_outcome confirmed',
    confirmed.json.verdict.gate_outcome,
    'confirmed'
  )
  assertEqual(
    'SCORE-4b contrary → gate_outcome contrary',
    contrary.json.verdict.gate_outcome,
    'contrary'
  )
  assertEqual(
    'SCORE-4c agent_asserted → gate_outcome provisional_agent_asserted',
    provisional.json.verdict.gate_outcome,
    'provisional_agent_asserted'
  )
  assertEqual(
    'SCORE-4d is_kathekon null → gate_outcome provisional_null',
    nullRender.json.verdict.gate_outcome,
    'provisional_null'
  )
  assert(
    'SCORE-5  PROVISIONAL validity + cap render in the Markdown',
    provisional.json.score.validity === 'PROVISIONAL' &&
      provisional.json.score.cap_applied !== null &&
      provisional.markdown.includes('**Validity:** PROVISIONAL') &&
      provisional.markdown.includes('**Cap applied:**')
  )

  // --- SCORE CONTEXT ----------------------------------------------------
  {
    // No score_context supplied → the renderer defaults to
    // justification_source 'absent' (the honest "no justification" path).
    const noCtx = await renderLayer3Mode({
      mode: 'atl_wrapper',
      assessment: CONFIRMED,
      consumer_context: CONSUMER_PLAIN,
    })
    assertEqual(
      'CTX-1  absent score_context → justification_source absent',
      noCtx.json.verdict.justification_source,
      'absent'
    )
  }
  {
    const detected = renderAgentMode({
      mode: 'atl_wrapper',
      assessment: CONFIRMED,
      consumer_context: CONSUMER_PLAIN,
      score_context: CTX_ENGINE_DETECTED,
    })
    assertEqual(
      'CTX-2  declared_motivation_passion detected surfaces in metadata',
      detected.json.agent_projections?.metadata.declared_motivation_passion,
      'detected'
    )
    const clean = renderAgentMode({
      mode: 'atl_wrapper',
      assessment: CONFIRMED,
      consumer_context: CONSUMER_PLAIN,
      score_context: CTX_ENGINE_CLEAN,
    })
    assertEqual(
      'CTX-3  declared_motivation_passion clean surfaces in metadata',
      clean.json.agent_projections?.metadata.declared_motivation_passion,
      'clean'
    )
  }
  assertEqual(
    'CTX-4  absent declaration → metadata declared_motivation_passion absent',
    confirmed.json.agent_projections?.metadata.declared_motivation_passion,
    'absent'
  )

  // --- AGENT PROJECTIONS ------------------------------------------------
  {
    const p = confirmed.json.agent_projections
    assert('AGENT-PROJECTIONS present on a steady-state render', p !== null)
    if (p !== null) {
      assert(
        'PROJ-1  principal_passion projects the first detected passion',
        p.principal_findings.principal_passion !== null &&
          p.principal_findings.principal_passion.root === 'phobos' &&
          p.principal_findings.principal_passion.sub_species === 'agonia' &&
          p.principal_findings.principal_passion.causal_stage === 'synkatathesis'
      )
      assertEqual(
        'PROJ-2  passion_count counts the detected passions',
        p.principal_findings.passion_count,
        2
      )
      assert(
        'PROJ-3  principal_value_error projects the first mis-categorised indifferent',
        p.principal_findings.principal_value_error !== null &&
          p.principal_findings.principal_value_error.indifferent_name === 'health' &&
          p.principal_findings.principal_value_error.mis_categorised_as === 'evil'
      )
      assertEqual(
        'PROJ-4  value_errors_count counts mis-categorised indifferents',
        p.principal_findings.value_errors_count,
        2
      )
      assertEqual(
        'PROJ-5  virtues_engaged de-duplicates a repeated domain',
        p.principal_findings.virtues_engaged.join(','),
        'phronesis,dikaiosyne'
      )
      assertEqual(
        'PROJ-6  indifferents_ranked sorts by axia (high → moderate → low)',
        p.principal_findings.indifferents_ranked
          .map((i) => `${i.name}:${i.axia}`)
          .join(','),
        'health:high,reputation:moderate,wealth:low'
      )
      assert(
        'PROJ-7  correction projects from improvement_path_structured',
        p.correction !== null &&
          p.correction.false_judgement_to_correct ===
            'A failed deploy is a genuine evil.' &&
          p.correction.corrected_judgement_to_substitute ===
            'The deploy outcome is a preferred indifferent.' &&
          p.correction.mechanism === 'passion_diagnosis' &&
          p.correction.stage_to_intercept === 'synkatathesis'
      )
      assertEqual(
        'PROJ-9  stated_operative_conflict true when the soft clarification fired',
        p.metadata.stated_operative_conflict,
        true
      )
      assertEqual(
        'PROJ-11  oikeiosis_circle_served = the first relevant circle',
        p.metadata.oikeiosis_circle_served,
        'local_community'
      )
      assertEqual(
        'PROJ-12  objective_function_declared is always null this session',
        p.metadata.objective_function_declared,
        null
      )
      assertEqual(
        'PROJ-13  direction_of_travel surfaces (R17e does NOT filter agent profiles)',
        p.direction_of_travel,
        'stable'
      )
      assertEqual(
        'PROJ-14  layer2_assessment_verbatim carries the full assessment',
        JSON.stringify(p.layer2_assessment_verbatim),
        JSON.stringify(CONFIRMED)
      )
    }
  }
  {
    const p = minimal.json.agent_projections
    assert(
      'PROJ-8  correction is null when improvement_path_structured is null',
      p !== null && p.correction === null
    )
    assert(
      'PROJ-10  stated_operative_conflict false when no soft clarification fired',
      p !== null && p.metadata.stated_operative_conflict === false
    )
    assert(
      'PROJ-15  the Markdown omits the Correction section when correction is null',
      !minimal.markdown.includes('## Correction')
    )
  }

  // --- REFLECTION COMPONENT --------------------------------------------
  {
    const p = confirmed.json.agent_projections
    assert(
      'REFL-1  open_questions projects one entry per Layer 2 open deferral',
      p !== null && p.open_questions.length === 1
    )
    if (p !== null && p.open_questions.length === 1) {
      const q = p.open_questions[0]
      const expected = CONFIRMED.intake_clarifications.open_deferrals[0]
      assertEqual(
        'REFL-2  withheld_classification is preserved VERBATIM in the JSON',
        JSON.stringify(q.withheld_classification),
        JSON.stringify(expected.withheld_classification)
      )
      assert(
        'REFL-3  the withheld field_path + reason render in the Markdown',
        confirmed.markdown.includes(expected.withheld_classification.field_path) &&
          confirmed.markdown.includes(expected.withheld_classification.reason)
      )
    }
  }
  {
    const p = minimal.json.agent_projections
    assert(
      'REFL-4  open_questions is empty when there are no open deferrals',
      p !== null && p.open_questions.length === 0
    )
  }

  // --- RECEIVING-AGENT CAVEATS -----------------------------------------
  assertEqual(
    'CAV-1  caveats_for_receiving_agent equals AGENT_MODE_CAVEATS verbatim',
    JSON.stringify(confirmed.json.caveats_for_receiving_agent),
    JSON.stringify([...AGENT_MODE_CAVEATS])
  )
  assert(
    'CAV-2  every caveat renders in the Markdown',
    AGENT_MODE_CAVEATS.every((c) => confirmed.markdown.includes(c))
  )

  // --- R20a DISTRESS PASSTHROUGH ---------------------------------------
  assertEqual(
    'R20A-1  distress signal → json.distress_passthrough is the canonical text',
    distress.json.distress_passthrough,
    R20A_DISTRESS_PASSTHROUGH
  )
  assertEqual(
    'R20A-2  distress signal → json.agent_projections is null (section 5 replaced)',
    distress.json.agent_projections,
    null
  )
  assert(
    'R20A-3  distress signal → verdict + score still render (mirror of philo mode)',
    distress.json.verdict != null &&
      distress.json.score_components != null &&
      distress.json.score != null &&
      distress.json.meta.distress_passthrough_active === true
  )
  assert(
    'R20A-4  distress signal → Markdown shows the Response block, omits section 5',
    distress.markdown.includes('## Response') &&
      distress.markdown.includes(R20A_DISTRESS_PASSTHROUGH) &&
      !distress.markdown.includes('## Principal findings') &&
      distress.markdown.includes('## Verdict') &&
      distress.markdown.includes('## Score vector') &&
      distress.markdown.includes('## Caveats for the receiving agent')
  )

  // --- R17e POSTURE -----------------------------------------------------
  assertEqual(
    'R17E-1  meta.r17e_exclusion_applied is the literal false',
    confirmed.json.meta.r17e_exclusion_applied,
    false
  )
  {
    // R17e does NOT apply to agent profiles: the iterative_refinement fields are
    // SURFACED, not stripped. direction_of_travel renders, and the verbatim
    // assessment still carries the full iterative_refinement object.
    const p = confirmed.json.agent_projections
    assert(
      'R17E-2  the iterative_refinement fields are surfaced, not stripped',
      p !== null &&
        p.direction_of_travel === 'stable' &&
        'iterative_refinement' in p.layer2_assessment_verbatim &&
        p.layer2_assessment_verbatim.iterative_refinement
          .motivation_classification === 'virtue_explicit'
    )
  }

  // --- INVARIANTS -------------------------------------------------------
  {
    const a = renderAgentMode({
      mode: 'atl_wrapper',
      assessment: CONFIRMED,
      consumer_context: CONSUMER_PLAIN,
      score_context: CTX_ENGINE,
    })
    const b = renderAgentMode({
      mode: 'atl_wrapper',
      assessment: CONFIRMED,
      consumer_context: CONSUMER_PLAIN,
      score_context: CTX_ENGINE,
    })
    assertEqual(
      'DET-1  two identical renders produce byte-identical JSON',
      JSON.stringify(a.json),
      JSON.stringify(b.json)
    )
    assertEqual(
      'DET-2  two identical renders produce byte-identical Markdown',
      a.markdown,
      b.markdown
    )
  }
  {
    const snapshot = JSON.stringify(CONFIRMED)
    renderAgentMode({
      mode: 'atl_wrapper',
      assessment: CONFIRMED,
      consumer_context: CONSUMER_PLAIN,
      score_context: CTX_ENGINE,
    })
    assertEqual(
      'DET-3  renderAgentMode does not mutate the input assessment',
      JSON.stringify(CONFIRMED),
      snapshot
    )
  }

  // --- Summary ----------------------------------------------------------
  console.log('')
  console.log(`Total: ${passCount + failCount}  Pass: ${passCount}  Fail: ${failCount}`)
  if (failCount > 0) {
    console.log('')
    console.log('FAILURES:')
    for (const f of failures) console.log(`  - ${f}`)
  }
}

main()
  .then(() => {
    process.exit(failCount === 0 ? 0 : 1)
  })
  .catch((err) => {
    console.error('Test harness error:', err)
    process.exit(1)
  })
