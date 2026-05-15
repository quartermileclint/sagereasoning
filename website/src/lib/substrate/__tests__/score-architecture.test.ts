/**
 * score-architecture.test.ts — substrate score-computation functional tests
 * + invariant checks.
 *
 * Run via: `npx tsx website/src/lib/substrate/__tests__/score-architecture.test.ts`
 * (mirrors the A5 / A7 / philosophical-mode / atl-bridge verification pattern;
 * no Jest framework dependency).
 *
 * COVERAGE
 *
 *   SHAPE
 *     SHAPE-1  version is 'substrate-score-v1'
 *     SHAPE-2  result has verdict / components / component_sum / score
 *
 *   GATE OUTCOMES (the superseded spec's "Kathekon as gate" table)
 *     GATE-1  is_kathekon true + engine_constructed -> 'confirmed', no cap
 *     GATE-2  is_kathekon true + agent_asserted -> 'provisional_agent_asserted'
 *     GATE-3  is_kathekon true + absent -> 'unconfirmed_absent'
 *     GATE-4  is_kathekon false -> 'contrary'
 *     GATE-5  quality 'contrary' (is_kathekon true) -> 'contrary'
 *     GATE-6  is_kathekon null -> 'provisional_null'
 *
 *   COMPONENTS
 *     COMP-1   proximity 'principled' -> +23
 *     COMP-2   proximity 'sage_like' -> +30 ; proximity 'reflexive' -> 0
 *     COMP-3   virtue bonus phronesis+dikaiosyne -> +10
 *     COMP-4   virtue bonus all four -> +15
 *     COMP-5   virtue bonus de-duplicates a repeated domain
 *     COMP-6   structural passion synkatathesis+praxis -> -7.5
 *     COMP-7   structural passion floored at -15 (4 praxis passions)
 *     COMP-8   passion_undeclared -5 when no declaration supplied
 *     COMP-9   passion_declared -10 when declared_motivation_passion 'detected'
 *     COMP-10  declared 'clean' -> declared 0 AND undeclared 0
 *     COMP-11  value error one low 'evil' -> -2
 *     COMP-12  value error floored at -15 (two high 'evil')
 *     COMP-13  value error ignores items treated_as 'indifferent'
 *     COMP-14  hasty_assent null when direction_of_travel 'single_snapshot'
 *     COMP-15  hasty_assent -10 when 'high' risk + non-single_snapshot
 *     COMP-16  hasty_assent 0 (not null) when 'none' risk + non-single_snapshot
 *
 *   MULTIPLIER
 *     MULT-1  quality 'strong' -> 1.0
 *     MULT-2  quality 'marginal' -> 0.75
 *     MULT-3  convention_inferred caps a 'strong' quality to 'moderate' (0.9)
 *     MULT-4  convention cap does NOT fire on a 'marginal' quality
 *
 *   SCALAR
 *     SCALAR-1  component_sum is baseline + all components (null hasty = 0)
 *     SCALAR-2  confirmed clean path: value = round(sum x multiplier)
 *     SCALAR-3  confirmed path floored at 5 (max penalties, marginal quality)
 *     SCALAR-4  confirmed path ceilinged at 100 (max bonuses, strong quality)
 *     SCALAR-5  rounding is round-half-up
 *
 *   VALIDITY
 *     VALID-1  confirmed engine_constructed -> NORMAL
 *     VALID-2  agent_asserted -> PROVISIONAL
 *     VALID-3  is_kathekon null -> PROVISIONAL
 *     VALID-4  absent -> NORMAL (not a PROVISIONAL trigger)
 *     VALID-5  contrary -> NORMAL (verdict settled, just low)
 *     VALID-6  motivation 'unclear_pending_clarification' -> PROVISIONAL
 *     VALID-7  motivation null does NOT trigger PROVISIONAL (Step 2 finding)
 *
 *   CAP RULES
 *     CAP-1  contrary -> cap 35
 *     CAP-2  absent -> cap 35
 *     CAP-3  agent_asserted -> cap 50
 *     CAP-4  null -> cap 50
 *     CAP-5  confirmed clean -> cap_applied null
 *     CAP-6  tighter cap survives (contrary 35 alongside unclear-motivation 50)
 *
 *   PRECISION BAND
 *     PREC-1  clean confirmed -> 5
 *     PREC-2  marginal quality adds 5
 *     PREC-3  reaches the +-20 cap on a fully-uncertain assessment
 *     PREC-4  precision band is symmetric magnitude only (a positive number)
 *
 *   CONFIDENCE
 *     CONF-1  'improving' -> high
 *     CONF-2  'stable' -> moderate
 *     CONF-3  'declining' -> low
 *     CONF-4  'single_snapshot' -> moderate
 *
 *   INVARIANTS
 *     DET-1  two identical computations produce byte-identical SubstrateScore
 *     DET-2  computeSubstrateScore does not mutate the input assessment
 *     DET-3  computeSubstrateScore does not mutate the input context
 *
 * Exit code 0 = all pass. Non-zero = failures printed.
 */

import {
  computeSubstrateScore,
  type ScoreContext,
} from '../score-architecture'

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

/** KATHEKON_CONFIRMED — a clean, high-scoring confirmed assessment. is_kathekon
 *  true, quality 'strong', proximity 'principled' (+23), two virtues engaged
 *  (phronesis +6, dikaiosyne +4), no passions, no value errors, single_snapshot
 *  (hasty_assent null), motivation 'virtue_explicit'. */
const KATHEKON_CONFIRMED: Layer2Assessment = {
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
    justification: 'The disclosure accords with the role obligation and proceeds from judgement.',
  },
  iterative_refinement: {
    senecan_grade: 'grade_2',
    progress_dimensions: {
      passion_reduction: 'consolidating',
      judgement_quality: 'consolidating',
      disposition_stability: 'consolidating',
      oikeiosis_extension: 'consolidating',
    },
    direction_of_travel: 'single_snapshot',
    motivation_classification: 'virtue_explicit',
  },
  katorthoma_proximity: 'principled',
  ruling_faculty_state: 'Assent given deliberately, on examined judgement.',
  virtue_domains_engaged: ['phronesis', 'dikaiosyne'],
  improvement_path_structured: null,
  stage_scores: {
    control_filter: 'strong',
    passion_diagnosis: 'strong',
    oikeiosis: 'adequate',
    value_assessment: 'adequate',
    kathekon_assessment: 'strong',
    iterative_refinement: 'adequate',
  },
  hasty_assent_risk: 'low',
  intake_clarifications: { soft_clarifications: [], open_deferrals: [] },
  layer1_ambiguity_notes: [],
  layer2_ambiguity_notes: [],
}

/** CONTRARY — is_kathekon false, quality 'marginal'. proximity 'deliberate'
 *  (+15), two virtues (phronesis +6, sophrosyne +2), two passions
 *  (synkatathesis -2.5, praxis -5.0 -> -7.5), one low 'evil' value error (-2),
 *  hasty_assent_risk 'high' + direction 'stable' (-10), motivation null. */
const CONTRARY: Layer2Assessment = {
  version: 'layer2-assessment-v1',
  layer1_schema_version: 'layer1-schema-v1',
  passion_diagnosis: {
    passions_detected: [
      {
        id: 'p1',
        name: 'Anxious assent to the impression',
        root_passion: 'phobos',
        sub_species: 'agonia',
        false_judgement: 'The silence is evidence of failure.',
        correct_judgement: "Another's response is a preferred indifferent.",
        causal_stage_affected: 'synkatathesis',
        evidence: 'I assented to the fear before examining it.',
      },
      {
        id: 'p2',
        name: 'Acting on the unexamined fear',
        root_passion: 'phobos',
        sub_species: null,
        false_judgement: 'I must check again to be safe.',
        correct_judgement: 'Right action proceeds from judgement, not fear.',
        causal_stage_affected: 'praxis',
        evidence: 'I checked the channel a fourth time.',
      },
    ],
    false_judgements: ['The silence is evidence of failure.'],
    correct_judgements: ["Another's response is a preferred indifferent."],
    causal_stage_affected: 'synkatathesis',
  },
  control_filter: {
    within_prohairesis: [],
    outside_prohairesis: [],
    disambiguation_required: [],
  },
  oikeiosis: { relevant_circles: [], deliberation_notes: '' },
  value_assessment: {
    indifferents_at_stake: [
      {
        name: 'reputation',
        axia: 'low',
        treated_as: 'evil',
        evidence: 'I feel the dip when no one has responded.',
        error: 'a low-worth dispreferred indifferent mis-categorised as evil',
      },
    ],
    value_error: 'Peer recognition is treated as more than it is.',
  },
  kathekon_assessment: {
    is_kathekon: false,
    quality: 'marginal',
    justification: 'The post-submission checking pattern is not appropriate action.',
  },
  iterative_refinement: {
    senecan_grade: 'grade_1',
    progress_dimensions: {
      passion_reduction: 'developing',
      judgement_quality: 'developing',
      disposition_stability: 'developing',
      oikeiosis_extension: 'developing',
    },
    direction_of_travel: 'stable',
    motivation_classification: null,
  },
  katorthoma_proximity: 'deliberate',
  ruling_faculty_state: 'Examining the pattern but not yet substituting the judgement.',
  virtue_domains_engaged: ['phronesis', 'sophrosyne'],
  improvement_path_structured: null,
  stage_scores: {
    control_filter: 'adequate',
    passion_diagnosis: 'weak',
    oikeiosis: 'not_applied',
    value_assessment: 'adequate',
    kathekon_assessment: 'weak',
    iterative_refinement: 'not_applied',
  },
  hasty_assent_risk: 'high',
  intake_clarifications: { soft_clarifications: [], open_deferrals: [] },
  layer1_ambiguity_notes: [],
  layer2_ambiguity_notes: [],
}

/** KATHEKON_NULL — is_kathekon null, quality 'marginal'. proximity 'reflexive'
 *  (0), no virtues, no passions, no value errors, hasty 'none' + single_snapshot
 *  (null), motivation null. */
const KATHEKON_NULL: Layer2Assessment = {
  ...KATHEKON_CONFIRMED,
  kathekon_assessment: {
    is_kathekon: null,
    quality: 'marginal',
    justification: 'Appropriateness cannot be determined from the available evidence.',
  },
  iterative_refinement: {
    ...KATHEKON_CONFIRMED.iterative_refinement,
    direction_of_travel: 'single_snapshot',
    motivation_classification: null,
  },
  katorthoma_proximity: 'reflexive',
  virtue_domains_engaged: [],
  hasty_assent_risk: 'none',
}

/** MAX_PENALTY — confirmed path, marginal quality, maximum penalties:
 *  reflexive proximity (0), no virtues, four praxis passions (structural floored
 *  at -15), two high 'evil' value errors (floored at -15), hasty 'high' +
 *  'declining' (-10), declared_motivation_passion 'detected' (-10). Exercises
 *  the [5, 100] floor clamp and confidence 'low'. */
const MAX_PENALTY: Layer2Assessment = {
  ...KATHEKON_CONFIRMED,
  passion_diagnosis: {
    passions_detected: [
      mkPraxisPassion('p1'),
      mkPraxisPassion('p2'),
      mkPraxisPassion('p3'),
      mkPraxisPassion('p4'),
    ],
    false_judgements: [],
    correct_judgements: [],
    causal_stage_affected: 'praxis',
  },
  value_assessment: {
    indifferents_at_stake: [
      {
        name: 'health',
        axia: 'high',
        treated_as: 'evil',
        evidence: 'The diagnosis is treated as a genuine evil.',
        error: 'a high-worth indifferent mis-categorised as evil',
      },
      {
        name: 'wealth',
        axia: 'high',
        treated_as: 'good',
        evidence: 'The windfall is treated as a genuine good.',
        error: 'a high-worth indifferent mis-categorised as good',
      },
    ],
    value_error: 'High-worth indifferents are being treated as goods and evils.',
  },
  kathekon_assessment: {
    is_kathekon: true,
    quality: 'marginal',
    justification: 'Marginally appropriate; the disposition around it is poor.',
  },
  iterative_refinement: {
    ...KATHEKON_CONFIRMED.iterative_refinement,
    direction_of_travel: 'declining',
    motivation_classification: null,
  },
  katorthoma_proximity: 'reflexive',
  virtue_domains_engaged: [],
  hasty_assent_risk: 'high',
}

/** MAX_SCORE — confirmed path, strong quality, maximum bonuses: sage_like
 *  proximity (+30), all four virtues (+15), no passions, no value errors,
 *  hasty 'none' + 'improving' (0, not null), declared_motivation_passion 'clean'
 *  (declared 0, undeclared 0). Exercises the 100 ceiling and confidence 'high'. */
const MAX_SCORE: Layer2Assessment = {
  ...KATHEKON_CONFIRMED,
  iterative_refinement: {
    ...KATHEKON_CONFIRMED.iterative_refinement,
    direction_of_travel: 'improving',
    motivation_classification: 'virtue_explicit',
  },
  katorthoma_proximity: 'sage_like',
  virtue_domains_engaged: ['phronesis', 'dikaiosyne', 'andreia', 'sophrosyne'],
  hasty_assent_risk: 'none',
}

/** PRECISION_MAX — every precision-band uncertainty signal firing: is_kathekon
 *  null, quality 'marginal', motivation 'unclear_pending_clarification',
 *  justification_source 'absent' (supplied via context). Band would compute to
 *  25; caps at 20. */
const PRECISION_MAX: Layer2Assessment = {
  ...KATHEKON_CONFIRMED,
  kathekon_assessment: {
    is_kathekon: null,
    quality: 'marginal',
    justification: 'Undetermined; the input is too thin to confirm.',
  },
  iterative_refinement: {
    ...KATHEKON_CONFIRMED.iterative_refinement,
    direction_of_travel: 'single_snapshot',
    motivation_classification: 'unclear_pending_clarification',
  },
}

/** Helper — a praxis-stage passion entry (structural penalty 1.25 x 4 = 5.0). */
function mkPraxisPassion(id: string) {
  return {
    id,
    name: `Acting on the unexamined impression (${id})`,
    root_passion: 'epithumia' as const,
    sub_species: null,
    false_judgement: 'The object of desire is a genuine good.',
    correct_judgement: 'The object of desire is a preferred indifferent.',
    causal_stage_affected: 'praxis' as const,
    evidence: 'The action was taken before the impression was examined.',
  }
}

// Context fixtures.
const CTX_ENGINE: ScoreContext = { justification_source: 'engine_constructed' }
const CTX_AGENT: ScoreContext = { justification_source: 'agent_asserted' }
const CTX_ABSENT: ScoreContext = { justification_source: 'absent' }
const CTX_ENGINE_CLEAN: ScoreContext = {
  justification_source: 'engine_constructed',
  declared_motivation_passion: 'clean',
}
const CTX_ENGINE_DETECTED: ScoreContext = {
  justification_source: 'engine_constructed',
  declared_motivation_passion: 'detected',
}

// ============================================================================
// SHAPE
// ============================================================================

{
  const s = computeSubstrateScore(KATHEKON_CONFIRMED, CTX_ENGINE)
  assertEqual('SHAPE-1  version is substrate-score-v1', s.version, 'substrate-score-v1')
  assert(
    'SHAPE-2  result has verdict / components / component_sum / score',
    s.verdict !== undefined &&
      s.components !== undefined &&
      typeof s.component_sum === 'number' &&
      s.score !== undefined
  )
}

// ============================================================================
// GATE OUTCOMES
// ============================================================================

{
  const confirmed = computeSubstrateScore(KATHEKON_CONFIRMED, CTX_ENGINE)
  assertEqual(
    'GATE-1  engine_constructed -> confirmed',
    confirmed.verdict.gate_outcome,
    'confirmed'
  )
  assertEqual('GATE-1b confirmed -> no cap', confirmed.score.cap_applied, null)

  const agent = computeSubstrateScore(KATHEKON_CONFIRMED, CTX_AGENT)
  assertEqual(
    'GATE-2  agent_asserted -> provisional_agent_asserted',
    agent.verdict.gate_outcome,
    'provisional_agent_asserted'
  )

  const absent = computeSubstrateScore(KATHEKON_CONFIRMED, CTX_ABSENT)
  assertEqual(
    'GATE-3  absent -> unconfirmed_absent',
    absent.verdict.gate_outcome,
    'unconfirmed_absent'
  )

  const contraryFalse = computeSubstrateScore(CONTRARY, CTX_ENGINE)
  assertEqual(
    'GATE-4  is_kathekon false -> contrary',
    contraryFalse.verdict.gate_outcome,
    'contrary'
  )

  const contraryQuality = computeSubstrateScore(
    { ...KATHEKON_CONFIRMED, kathekon_assessment: { is_kathekon: true, quality: 'contrary', justification: 'x' } },
    CTX_ENGINE
  )
  assertEqual(
    'GATE-5  quality contrary (is_kathekon true) -> contrary',
    contraryQuality.verdict.gate_outcome,
    'contrary'
  )

  const nul = computeSubstrateScore(KATHEKON_NULL, CTX_ENGINE)
  assertEqual(
    'GATE-6  is_kathekon null -> provisional_null',
    nul.verdict.gate_outcome,
    'provisional_null'
  )
}

// ============================================================================
// COMPONENTS
// ============================================================================

{
  const confirmed = computeSubstrateScore(KATHEKON_CONFIRMED, CTX_ENGINE)
  assertEqual('COMP-1  proximity principled -> 23', confirmed.components.proximity, 23)

  const maxScore = computeSubstrateScore(MAX_SCORE, CTX_ENGINE_CLEAN)
  assertEqual('COMP-2a proximity sage_like -> 30', maxScore.components.proximity, 30)
  const nul = computeSubstrateScore(KATHEKON_NULL, CTX_ENGINE)
  assertEqual('COMP-2b proximity reflexive -> 0', nul.components.proximity, 0)

  assertEqual(
    'COMP-3  virtue bonus phronesis+dikaiosyne -> 10',
    confirmed.components.virtue_bonus,
    10
  )
  assertEqual(
    'COMP-4  virtue bonus all four -> 15',
    maxScore.components.virtue_bonus,
    15
  )

  const dupVirtues = computeSubstrateScore(
    { ...KATHEKON_CONFIRMED, virtue_domains_engaged: ['phronesis', 'phronesis', 'dikaiosyne'] },
    CTX_ENGINE
  )
  assertEqual(
    'COMP-5  virtue bonus de-duplicates a repeated domain',
    dupVirtues.components.virtue_bonus,
    10
  )

  const contrary = computeSubstrateScore(CONTRARY, CTX_ENGINE)
  assertEqual(
    'COMP-6  structural passion synkatathesis(-2.5)+praxis(-5.0) -> -7.5',
    contrary.components.passion_structural,
    -7.5
  )

  const maxPenalty = computeSubstrateScore(MAX_PENALTY, CTX_ENGINE_DETECTED)
  assertEqual(
    'COMP-7  structural passion floored at -15 (4 praxis passions)',
    maxPenalty.components.passion_structural,
    -15
  )

  assertEqual(
    'COMP-8  passion_undeclared -5 when no declaration supplied',
    confirmed.components.passion_undeclared,
    -5
  )
  assertEqual(
    'COMP-8b passion_declared 0 when no declaration supplied',
    confirmed.components.passion_declared,
    0
  )

  assertEqual(
    'COMP-9  passion_declared -10 when declared_motivation_passion detected',
    maxPenalty.components.passion_declared,
    -10
  )
  assertEqual(
    'COMP-9b passion_undeclared 0 when a declaration was supplied',
    maxPenalty.components.passion_undeclared,
    0
  )

  const clean = computeSubstrateScore(KATHEKON_CONFIRMED, CTX_ENGINE_CLEAN)
  assertEqual('COMP-10a declared clean -> declared 0', clean.components.passion_declared, 0)
  assertEqual('COMP-10b declared clean -> undeclared 0', clean.components.passion_undeclared, 0)

  assertEqual(
    'COMP-11  value error one low evil -> -2',
    contrary.components.value_error,
    -2
  )
  assertEqual(
    'COMP-12  value error floored at -15 (two high evil/good)',
    maxPenalty.components.value_error,
    -15
  )

  // KATHEKON_CONFIRMED has no indifferents_at_stake; add one treated_as
  // 'indifferent' (correctly categorised) — it must contribute 0.
  const correctlyCategorised = computeSubstrateScore(
    {
      ...KATHEKON_CONFIRMED,
      value_assessment: {
        indifferents_at_stake: [
          {
            name: 'reputation',
            axia: 'high',
            treated_as: 'indifferent',
            evidence: 'Correctly held as a preferred indifferent.',
            error: null,
          },
        ],
        value_error: null,
      },
    },
    CTX_ENGINE
  )
  assertEqual(
    'COMP-13  value error ignores items treated_as indifferent',
    correctlyCategorised.components.value_error,
    0
  )

  assertEqual(
    'COMP-14  hasty_assent null when direction single_snapshot',
    confirmed.components.hasty_assent,
    null
  )
  assertEqual(
    'COMP-15  hasty_assent -10 when high risk + non-single_snapshot',
    contrary.components.hasty_assent,
    -10
  )
  assertEqual(
    'COMP-16  hasty_assent 0 (not null) when none risk + non-single_snapshot',
    maxScore.components.hasty_assent,
    0
  )
}

// ============================================================================
// MULTIPLIER
// ============================================================================

{
  const confirmed = computeSubstrateScore(KATHEKON_CONFIRMED, CTX_ENGINE)
  assertEqual(
    'MULT-1  quality strong -> 1.0',
    confirmed.score.kathekon_quality_multiplier,
    1.0
  )

  const marginal = computeSubstrateScore(KATHEKON_NULL, CTX_ENGINE)
  assertEqual(
    'MULT-2  quality marginal -> 0.75',
    marginal.score.kathekon_quality_multiplier,
    0.75
  )

  const convention = computeSubstrateScore(
    {
      ...KATHEKON_CONFIRMED,
      iterative_refinement: {
        ...KATHEKON_CONFIRMED.iterative_refinement,
        motivation_classification: 'convention_inferred',
      },
    },
    CTX_ENGINE
  )
  assertEqual(
    'MULT-3a convention_inferred caps strong -> moderate (effective_quality)',
    convention.verdict.effective_quality,
    'moderate'
  )
  assertEqual(
    'MULT-3b convention cap multiplier -> 0.9',
    convention.score.kathekon_quality_multiplier,
    0.9
  )
  assertEqual(
    'MULT-3c convention_quality_cap_applied flag set',
    convention.verdict.convention_quality_cap_applied,
    true
  )

  // CONTRARY is quality 'marginal' + motivation null -> the convention cap must
  // NOT fire (it only downgrades a 'strong' quality).
  const noConventionCap = computeSubstrateScore(
    {
      ...CONTRARY,
      iterative_refinement: {
        ...CONTRARY.iterative_refinement,
        motivation_classification: 'convention_inferred',
      },
    },
    CTX_ENGINE
  )
  assertEqual(
    'MULT-4  convention cap does NOT fire on a marginal quality',
    noConventionCap.verdict.convention_quality_cap_applied,
    false
  )
}

// ============================================================================
// SCALAR
// ============================================================================

{
  // KATHEKON_CONFIRMED + CTX_ENGINE: baseline 55 + proximity 23 + virtue 10
  // + undeclared -5 = 83; hasty null -> 0; strong x1.0 = 83.
  const confirmed = computeSubstrateScore(KATHEKON_CONFIRMED, CTX_ENGINE)
  assertEqual('SCALAR-1  component_sum is 83', confirmed.component_sum, 83)
  assertEqual('SCALAR-2  confirmed clean path value = 83', confirmed.score.value, 83)

  // MAX_PENALTY + CTX_ENGINE_DETECTED: 55 + 0 - 15 - 10 + 0 + 0 - 15 - 10 = 0?
  // No: 55 -15(struct) -10(declared) -15(value) -10(hasty) = 5. marginal x0.75
  // = 3.75 -> round 4 -> floored to 5.
  const maxPenalty = computeSubstrateScore(MAX_PENALTY, CTX_ENGINE_DETECTED)
  assertEqual('SCALAR-3a max-penalty component_sum is 5', maxPenalty.component_sum, 5)
  assertEqual('SCALAR-3b confirmed path floored at 5', maxPenalty.score.value, 5)

  // MAX_SCORE + CTX_ENGINE_CLEAN: 55 + 30 + 15 + 0 + 0 = 100; strong x1.0 = 100.
  const maxScore = computeSubstrateScore(MAX_SCORE, CTX_ENGINE_CLEAN)
  assertEqual('SCALAR-4a max-score component_sum is 100', maxScore.component_sum, 100)
  assertEqual('SCALAR-4b confirmed path ceilinged at 100', maxScore.score.value, 100)

  // Rounding: KATHEKON_CONFIRMED with a 'convention_inferred' cap -> x0.9.
  // 83 x 0.9 = 74.7 -> round-half-up region -> 75.
  const rounded = computeSubstrateScore(
    {
      ...KATHEKON_CONFIRMED,
      iterative_refinement: {
        ...KATHEKON_CONFIRMED.iterative_refinement,
        motivation_classification: 'convention_inferred',
      },
    },
    CTX_ENGINE
  )
  assertEqual('SCALAR-5  rounding: round(83 x 0.9 = 74.7) = 75', rounded.score.value, 75)
}

// ============================================================================
// VALIDITY
// ============================================================================

{
  assertEqual(
    'VALID-1  confirmed engine_constructed -> NORMAL',
    computeSubstrateScore(KATHEKON_CONFIRMED, CTX_ENGINE).score.validity,
    'NORMAL'
  )
  assertEqual(
    'VALID-2  agent_asserted -> PROVISIONAL',
    computeSubstrateScore(KATHEKON_CONFIRMED, CTX_AGENT).score.validity,
    'PROVISIONAL'
  )
  assertEqual(
    'VALID-3  is_kathekon null -> PROVISIONAL',
    computeSubstrateScore(KATHEKON_NULL, CTX_ENGINE).score.validity,
    'PROVISIONAL'
  )
  assertEqual(
    'VALID-4  absent -> NORMAL (not a PROVISIONAL trigger)',
    computeSubstrateScore(KATHEKON_CONFIRMED, CTX_ABSENT).score.validity,
    'NORMAL'
  )
  assertEqual(
    'VALID-5  contrary -> NORMAL (verdict settled, just low)',
    computeSubstrateScore(CONTRARY, CTX_ENGINE).score.validity,
    'NORMAL'
  )

  const unclear = computeSubstrateScore(
    {
      ...KATHEKON_CONFIRMED,
      iterative_refinement: {
        ...KATHEKON_CONFIRMED.iterative_refinement,
        motivation_classification: 'unclear_pending_clarification',
      },
    },
    CTX_ENGINE
  )
  assertEqual(
    'VALID-6  motivation unclear_pending_clarification -> PROVISIONAL',
    unclear.score.validity,
    'PROVISIONAL'
  )

  // The Step 2 finding: motivation_classification null is "no praxis-stage
  // action observed" (a genuine N/A), NOT a data gap — it must NOT trigger
  // PROVISIONAL. KATHEKON_CONFIRMED-with-null-motivation on the confirmed path
  // must stay NORMAL.
  const nullMotivation = computeSubstrateScore(
    {
      ...KATHEKON_CONFIRMED,
      iterative_refinement: {
        ...KATHEKON_CONFIRMED.iterative_refinement,
        motivation_classification: null,
      },
    },
    CTX_ENGINE
  )
  assertEqual(
    'VALID-7  motivation null does NOT trigger PROVISIONAL (Step 2 finding)',
    nullMotivation.score.validity,
    'NORMAL'
  )
}

// ============================================================================
// CAP RULES
// ============================================================================

{
  const contrary = computeSubstrateScore(CONTRARY, CTX_ENGINE)
  assertEqual('CAP-1  contrary -> cap 35', contrary.score.cap_applied?.cap, 35)

  const absent = computeSubstrateScore(KATHEKON_CONFIRMED, CTX_ABSENT)
  assertEqual('CAP-2  absent -> cap 35', absent.score.cap_applied?.cap, 35)
  assertEqual('CAP-2b absent -> value capped at 35', absent.score.value, 35)

  const agent = computeSubstrateScore(KATHEKON_CONFIRMED, CTX_AGENT)
  assertEqual('CAP-3  agent_asserted -> cap 50', agent.score.cap_applied?.cap, 50)
  assertEqual('CAP-3b agent_asserted -> value capped at 50', agent.score.value, 50)

  const nul = computeSubstrateScore(KATHEKON_NULL, CTX_ENGINE)
  assertEqual('CAP-4  null -> cap 50', nul.score.cap_applied?.cap, 50)

  assertEqual(
    'CAP-5  confirmed clean -> cap_applied null',
    computeSubstrateScore(KATHEKON_CONFIRMED, CTX_ENGINE).score.cap_applied,
    null
  )

  // CONTRARY (gate cap 35, NORMAL) + an unclear-motivation PROVISIONAL trigger
  // (cap 50): the tighter cap (35) must survive, and validity must flip to
  // PROVISIONAL.
  const contraryPlusUnclear = computeSubstrateScore(
    {
      ...CONTRARY,
      iterative_refinement: {
        ...CONTRARY.iterative_refinement,
        motivation_classification: 'unclear_pending_clarification',
      },
    },
    CTX_ENGINE
  )
  assertEqual(
    'CAP-6a tighter cap survives (35 over 50)',
    contraryPlusUnclear.score.cap_applied?.cap,
    35
  )
  assertEqual(
    'CAP-6b validity flips to PROVISIONAL via the independent trigger',
    contraryPlusUnclear.score.validity,
    'PROVISIONAL'
  )
}

// ============================================================================
// PRECISION BAND
// ============================================================================

{
  assertEqual(
    'PREC-1  clean confirmed -> 5',
    computeSubstrateScore(KATHEKON_CONFIRMED, CTX_ENGINE).score.precision_band,
    5
  )
  // KATHEKON_NULL: marginal (+5) + is_kathekon null (+5) = 15 on CTX_ENGINE.
  assertEqual(
    'PREC-2  marginal + null -> 15',
    computeSubstrateScore(KATHEKON_NULL, CTX_ENGINE).score.precision_band,
    15
  )
  // PRECISION_MAX + CTX_ABSENT: marginal(5) + absent≠engine(5) + unclear(5)
  // + null(5) = 25 -> capped at 20.
  assertEqual(
    'PREC-3  fully-uncertain assessment caps at 20',
    computeSubstrateScore(PRECISION_MAX, CTX_ABSENT).score.precision_band,
    20
  )
  assert(
    'PREC-4  precision band is a positive number (symmetric magnitude)',
    computeSubstrateScore(KATHEKON_CONFIRMED, CTX_ENGINE).score.precision_band > 0
  )
}

// ============================================================================
// CONFIDENCE
// ============================================================================

{
  assertEqual(
    'CONF-1  improving -> high',
    computeSubstrateScore(MAX_SCORE, CTX_ENGINE_CLEAN).score.confidence,
    'high'
  )
  assertEqual(
    'CONF-2  stable -> moderate',
    computeSubstrateScore(CONTRARY, CTX_ENGINE).score.confidence,
    'moderate'
  )
  assertEqual(
    'CONF-3  declining -> low',
    computeSubstrateScore(MAX_PENALTY, CTX_ENGINE_DETECTED).score.confidence,
    'low'
  )
  assertEqual(
    'CONF-4  single_snapshot -> moderate',
    computeSubstrateScore(KATHEKON_CONFIRMED, CTX_ENGINE).score.confidence,
    'moderate'
  )
}

// ============================================================================
// INVARIANTS
// ============================================================================

{
  const a = computeSubstrateScore(CONTRARY, CTX_ENGINE)
  const b = computeSubstrateScore(CONTRARY, CTX_ENGINE)
  assertEqual(
    'DET-1  two identical computations produce byte-identical SubstrateScore',
    JSON.stringify(a),
    JSON.stringify(b)
  )

  const assessmentSnapshot = JSON.stringify(CONTRARY)
  computeSubstrateScore(CONTRARY, CTX_ENGINE)
  assertEqual(
    'DET-2  computeSubstrateScore does not mutate the input assessment',
    JSON.stringify(CONTRARY),
    assessmentSnapshot
  )

  const contextSnapshot = JSON.stringify(CTX_ENGINE_DETECTED)
  computeSubstrateScore(MAX_PENALTY, CTX_ENGINE_DETECTED)
  assertEqual(
    'DET-3  computeSubstrateScore does not mutate the input context',
    JSON.stringify(CTX_ENGINE_DETECTED),
    contextSnapshot
  )
}

// ============================================================================
// Report
// ============================================================================

console.log('')
console.log(`${passCount} pass / ${failCount} fail`)
if (failCount > 0) {
  console.log('')
  console.log('FAILURES:')
  for (const f of failures) console.log(`  - ${f}`)
  process.exit(1)
}
process.exit(0)
