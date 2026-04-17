/**
 * V3 Baseline Stoic Assessment
 *
 * Derived from V3's progress model (progress.json), passions taxonomy (passions.json),
 * oikeiosis stages (action.json), and katorthoma proximity scale (scoring.json).
 *
 * V3 Derivation Notes (R6a):
 *   V1 had 4 questions (one per independently-weighted virtue) + conditional Q5.
 *   V1 produced a single 0-100 total score with per-virtue breakdowns.
 *
 *   V3 has 4 progress dimensions (passion_reduction, judgement_quality,
 *   disposition_stability, oikeiosis_extension), 3 Senecan grades,
 *   a passion profile, and an oikeiosis stage. The questions, count,
 *   and scoring model emerge from what V3 needs to assess.
 *
 *   Result: 6 questions (one per assessment dimension) producing a
 *   multi-dimensional profile — not a single weighted number.
 *
 *   Q1: Passion awareness       → passion_reduction dimension
 *   Q2: Quality of judgement    → judgement_quality dimension
 *   Q3: Consistency under test  → disposition_stability dimension
 *   Q4: Circle of concern       → oikeiosis_extension dimension
 *   Q5: Dominant passion ID     → passion profile
 *   Q6: Conditional refinement  → borderline grade clarification
 *
 * Compliance:
 *   R1:  Framed as philosophical self-knowledge, not psychological assessment.
 *   R3:  Disclaimer in result interface.
 *   R6b: No independent virtue weights — assesses progress dimensions.
 *   R6c: Qualitative dimension levels, not 0-100 scores.
 *   R8c: All user-facing text in English only.
 *   R9:  No outcome promises in interpretation.
 */

import type {
  OikeiosisStageId,
  SenecanGradeId,
  ProgressDimensionId,
} from './stoic-brain'

// ============================================================================
// V3 TYPES
// ============================================================================

/** Qualitative level on a progress dimension. Not a numeric score. */
export type DimensionLevel = 'emerging' | 'developing' | 'established' | 'advanced'

/** English labels for dimension levels (R8c). */
export const DIMENSION_LEVEL_ENGLISH: Record<DimensionLevel, string> = {
  emerging: 'Emerging',
  developing: 'Developing',
  established: 'Established',
  advanced: 'Advanced',
}

/** Display colors for dimension levels. */
export const DIMENSION_LEVEL_COLORS: Record<DimensionLevel, string> = {
  emerging: '#B45309',     // amber-700
  developing: '#CA8A04',   // yellow-600
  established: '#65A30D',  // lime-600
  advanced: '#059669',     // emerald-600
}

/** English labels for Senecan grades (R8c). */
export const SENECAN_GRADE_ENGLISH: Record<SenecanGradeId, string> = {
  pre_progress: 'Before the Path',
  grade_3: 'Beginning the Path',
  grade_2: 'Overcoming the Worst',
  grade_1: 'Approaching Wisdom',
}

/** English labels for oikeiosis stages (R8c). */
export const OIKEIOSIS_STAGE_ENGLISH: Record<OikeiosisStageId, string> = {
  self_preservation: 'Self',
  household: 'Household',
  community: 'Community',
  humanity: 'Humanity',
  cosmic: 'Cosmic',
}

/** Root passion IDs for the dominant passion profile. */
export type DominantPassionId = 'epithumia' | 'hedone' | 'phobos' | 'lupe'

/** English labels for root passions (R8c). */
export const DOMINANT_PASSION_ENGLISH: Record<DominantPassionId, string> = {
  epithumia: 'Craving',
  hedone: 'Irrational Pleasure',
  phobos: 'Fear',
  lupe: 'Distress',
}

// ============================================================================
// V3 QUESTION INTERFACES
// ============================================================================

export interface V3AssessmentOption {
  id: string
  text: string
  /** Primary dimension assessed by this question. */
  dimension_level: DimensionLevel
  /** For Q4: maps to oikeiosis stage instead of a generic dimension level. */
  oikeiosis_stage?: OikeiosisStageId
  /** For Q5: maps to a root passion. */
  dominant_passion?: DominantPassionId
  /** Secondary signals: other dimensions this answer provides evidence about. */
  secondary_signals?: Array<{ dimension: ProgressDimensionId; level: DimensionLevel }>
}

export interface V3AssessmentQuestion {
  id: string
  /** Which progress dimension this question primarily assesses. */
  dimension: ProgressDimensionId | 'passion_profile' | 'refinement'
  question: string
  context?: string
  options: V3AssessmentOption[]
}

export interface V3ConditionalQuestion {
  id: string
  condition: 'borderline_grade_2_3' | 'borderline_grade_1_2'
  question: string
  options: Array<{
    id: string
    text: string
    /** Which direction this nudges the grade. */
    grade_adjustment: 'up' | 'none' | 'down'
  }>
}

// ============================================================================
// V3 RESULT INTERFACES
// ============================================================================

export interface V3BaselineResult {
  /** Position on each of the 4 progress dimensions. */
  passion_reduction: DimensionLevel
  judgement_quality: DimensionLevel
  disposition_stability: DimensionLevel
  oikeiosis_stage: OikeiosisStageId

  /** Overall Senecan grade placement. */
  senecan_grade: SenecanGradeId

  /** Which root passion is most dominant. */
  dominant_passion: DominantPassionId

  /** Whether a refinement question is needed. */
  needs_q6: 'borderline_grade_2_3' | 'borderline_grade_1_2' | null

  /** Answer IDs selected. */
  answers: string[]
}

export interface V3FinalBaselineResult extends V3BaselineResult {
  needs_q6: null
  q6_answer?: string

  /** Philosophical interpretation of the baseline profile. */
  interpretation: string

  /** R3: Disclaimer always present. */
  disclaimer: string
}

// ============================================================================
// V3 QUESTIONS — derived from V3 progress dimensions (P7.1)
// ============================================================================

// Q1 — Passion Reduction dimension
// Assesses: Can the person recognize and manage destructive passions?
// Source: passions.json diagnostic framework, progress.json passion_reduction dimension
// Option order shuffled: C, A, D, B (best answer at position 2)
const Q1: V3AssessmentQuestion = {
  id: 'q1_passion_reduction',
  dimension: 'passion_reduction',
  question: 'When something goes wrong that you cannot change — a job loss, a health setback, a betrayal — what happens inside you?',
  options: [
    {
      id: 'q1_c',
      text: 'I know I\'m reacting emotionally, but I struggle to stop the reaction from influencing what I do',
      dimension_level: 'developing',
      secondary_signals: [
        { dimension: 'judgement_quality', level: 'developing' },
      ],
    },
    {
      id: 'q1_a',
      text: 'I notice the emotional reaction, examine what belief is driving it, and let it pass without acting on it',
      dimension_level: 'advanced',
      secondary_signals: [
        { dimension: 'judgement_quality', level: 'advanced' },
        { dimension: 'disposition_stability', level: 'established' },
      ],
    },
    {
      id: 'q1_d',
      text: 'My emotions usually take over — I act on what I feel and deal with consequences later',
      dimension_level: 'emerging',
      secondary_signals: [
        { dimension: 'disposition_stability', level: 'emerging' },
      ],
    },
    {
      id: 'q1_b',
      text: 'I feel strong emotions but usually manage to step back before they drive my actions',
      dimension_level: 'established',
      secondary_signals: [
        { dimension: 'disposition_stability', level: 'developing' },
      ],
    },
  ],
}

// Q2 — Judgement Quality dimension
// Assesses: Can the person distinguish genuine good from preferred indifferents?
// Source: value.json (genuine goods vs. indifferents), progress.json judgement_quality dimension
// Option order shuffled: B, D, A, C (best answer at position 3)
const Q2: V3AssessmentQuestion = {
  id: 'q2_judgement_quality',
  dimension: 'judgement_quality',
  question: 'A close friend receives a major promotion and significant pay rise. What is your honest first reaction?',
  options: [
    {
      id: 'q2_b',
      text: 'I\'m happy for them, though I notice a brief comparison to my own situation before moving on',
      dimension_level: 'established',
      secondary_signals: [
        { dimension: 'passion_reduction', level: 'established' },
      ],
    },
    {
      id: 'q2_d',
      text: 'It bothers me — their success highlights what I don\'t have',
      dimension_level: 'emerging',
      secondary_signals: [
        { dimension: 'passion_reduction', level: 'emerging' },
      ],
    },
    {
      id: 'q2_a',
      text: 'I feel genuine gladness for them — their external success is welcome but what truly matters is their character',
      dimension_level: 'advanced',
      secondary_signals: [
        { dimension: 'passion_reduction', level: 'advanced' },
      ],
    },
    {
      id: 'q2_c',
      text: 'I congratulate them but privately feel envious or question whether they deserved it',
      dimension_level: 'developing',
      secondary_signals: [
        { dimension: 'passion_reduction', level: 'developing' },
      ],
    },
  ],
}

// Q3 — Disposition Stability dimension
// Assesses: How consistent is the person under pressure?
// Source: progress.json disposition_stability dimension, virtue.json hexis concept
// Option order shuffled: D, B, C, A (best answer at position 4)
const Q3: V3AssessmentQuestion = {
  id: 'q3_disposition_stability',
  dimension: 'disposition_stability',
  question: 'You\'ve been practising patience and fairness consistently. Then someone publicly disrespects you in front of people whose opinion you value. What happens?',
  options: [
    {
      id: 'q3_d',
      text: 'I completely lose my composure — the public nature of the insult overwhelms everything I\'ve been practising',
      dimension_level: 'emerging',
      secondary_signals: [
        { dimension: 'passion_reduction', level: 'emerging' },
      ],
    },
    {
      id: 'q3_b',
      text: 'I hold my ground but it takes real effort — I can feel the pull toward a sharper response',
      dimension_level: 'established',
      secondary_signals: [
        { dimension: 'passion_reduction', level: 'established' },
      ],
    },
    {
      id: 'q3_c',
      text: 'I react more harshly than I would in private and regret it afterward',
      dimension_level: 'developing',
      secondary_signals: [
        { dimension: 'judgement_quality', level: 'developing' },
      ],
    },
    {
      id: 'q3_a',
      text: 'I respond the same way I would in private — the audience doesn\'t change what\'s right',
      dimension_level: 'advanced',
      secondary_signals: [
        { dimension: 'passion_reduction', level: 'advanced' },
        { dimension: 'judgement_quality', level: 'advanced' },
      ],
    },
  ],
}

// Q4 — Oikeiosis Extension dimension
// Assesses: How broad is the person's circle of concern?
// Source: action.json oikeiosis_sequence, progress.json oikeiosis_extension dimension
// Option order shuffled: C, A, D, B (broadest at position 3)
const Q4: V3AssessmentQuestion = {
  id: 'q4_oikeiosis_extension',
  dimension: 'oikeiosis_extension',
  question: 'When making a major decision — about your career, where to live, how to spend your time — whose interests do you consider?',
  options: [
    {
      id: 'q4_c',
      text: 'My family and broader community — I think about how my choices affect the people around me',
      dimension_level: 'established',
      oikeiosis_stage: 'community',
    },
    {
      id: 'q4_a',
      text: 'My own needs come first — that\'s just realistic',
      dimension_level: 'emerging',
      oikeiosis_stage: 'self_preservation',
    },
    {
      id: 'q4_d',
      text: 'Everyone potentially affected — I try to weigh the wider impact, even on people I\'ll never meet',
      dimension_level: 'advanced',
      oikeiosis_stage: 'humanity',
    },
    {
      id: 'q4_b',
      text: 'Mine and my family\'s — the people closest to me are my responsibility',
      dimension_level: 'developing',
      oikeiosis_stage: 'household',
    },
  ],
}

// Q5 — Dominant Passion Identification
// Assesses: Which root passion is most operative?
// Source: passions.json four_root_passions
// This question maps directly to the passion profile, not a dimension level.
// Option order shuffled: B, D, A, C
const Q5: V3AssessmentQuestion = {
  id: 'q5_dominant_passion',
  dimension: 'passion_profile',
  question: 'Which of these patterns do you most recognise in yourself?',
  context: 'There are no right or wrong answers here — this identifies which tendency is strongest so you know where to focus your practice.',
  options: [
    {
      id: 'q5_b',
      text: 'I get disproportionate satisfaction from comforts and pleasures, and I\'m thrown off when they\'re taken away',
      dimension_level: 'developing', // placeholder — not used for scoring
      dominant_passion: 'hedone',
    },
    {
      id: 'q5_d',
      text: 'I dwell on setbacks and losses, and I find it hard to move past things that have gone wrong',
      dimension_level: 'developing',
      dominant_passion: 'lupe',
    },
    {
      id: 'q5_a',
      text: 'I often want things I don\'t have — a better job, more recognition, more money — and feel restless until I get them',
      dimension_level: 'developing',
      dominant_passion: 'epithumia',
    },
    {
      id: 'q5_c',
      text: 'I avoid difficult conversations, risky decisions, and uncomfortable situations even when I know they\'re necessary',
      dimension_level: 'developing',
      dominant_passion: 'phobos',
    },
  ],
}

export const CORE_QUESTIONS: V3AssessmentQuestion[] = [Q1, Q2, Q3, Q4, Q5]

// Q6 — Conditional refinement for borderline grade placement
export const Q6_BRANCHES: {
  borderline_grade_2_3: V3ConditionalQuestion
  borderline_grade_1_2: V3ConditionalQuestion
} = {
  // Between Third Grade and Second Grade
  borderline_grade_2_3: {
    id: 'q6_branch_2_3',
    condition: 'borderline_grade_2_3',
    question: 'When you succeed at something difficult, what is your first internal response?',
    options: [
      {
        id: 'q6a_b',
        text: 'Genuine pride, but I keep perspective and move to the next challenge',
        grade_adjustment: 'up',
      },
      {
        id: 'q6a_c',
        text: 'Strong excitement — I want to celebrate and be recognised for it',
        grade_adjustment: 'down',
      },
      {
        id: 'q6a_a',
        text: 'Quiet satisfaction — the effort was its own reward',
        grade_adjustment: 'up',
      },
    ],
  },
  // Between Second Grade and First Grade
  borderline_grade_1_2: {
    id: 'q6_branch_1_2',
    condition: 'borderline_grade_1_2',
    question: 'When you see someone acting unjustly and getting away with it, what is your internal response?',
    options: [
      {
        id: 'q6b_a',
        text: 'I feel calm clarity — their character is their concern; mine is mine',
        grade_adjustment: 'up',
      },
      {
        id: 'q6b_b',
        text: 'I feel frustration but choose not to dwell on it — I focus on what I can influence',
        grade_adjustment: 'none',
      },
      {
        id: 'q6b_c',
        text: 'It genuinely bothers me — injustice is hard to watch without a strong reaction',
        grade_adjustment: 'down',
      },
    ],
  },
}

// ============================================================================
// V3 SCORING MODEL (P7.2)
// ============================================================================

/** Internal mapping for grade derivation. Not exposed to users. */
const LEVEL_RANK: Record<DimensionLevel, number> = {
  emerging: 0,
  developing: 1,
  established: 2,
  advanced: 3,
}

const OIKEIOSIS_MODIFIER: Record<OikeiosisStageId, number> = {
  self_preservation: -0.25,
  household: -0.1,
  community: 0,
  humanity: 0.25,
  cosmic: 0.5,
}

/**
 * Derive Senecan grade from the pattern of dimension levels.
 * Uses internal ranking for derivation, but the output is a qualitative grade.
 *
 * Grade boundaries (derived from Seneca Ep. 75):
 *   grade_1: Average ≥ 2.5 — most passions overcome, strong understanding, approaching hexis
 *   grade_2: Average ≥ 1.5 — worst passions checked, good judgement in familiar situations
 *   grade_3: Average ≥ 0.5 — some passions overcome, awareness but inconsistent
 *   pre_progress: Average < 0.5 — passions dominant, little philosophical awareness
 */
function deriveSenecanGrade(
  passionReduction: DimensionLevel,
  judgementQuality: DimensionLevel,
  dispositionStability: DimensionLevel,
  oikeiosisStage: OikeiosisStageId
): { grade: SenecanGradeId; internal_avg: number } {
  const base =
    (LEVEL_RANK[passionReduction] +
      LEVEL_RANK[judgementQuality] +
      LEVEL_RANK[dispositionStability]) /
    3
  const adjusted = base + OIKEIOSIS_MODIFIER[oikeiosisStage]

  let grade: SenecanGradeId
  if (adjusted >= 2.5) grade = 'grade_1'
  else if (adjusted >= 1.5) grade = 'grade_2'
  else if (adjusted >= 0.5) grade = 'grade_3'
  else grade = 'pre_progress'

  return { grade, internal_avg: adjusted }
}

/**
 * Score Q1–Q5 and produce the initial V3 baseline result.
 *
 * @param answerIds — 5 answer IDs, one per question (Q1–Q5).
 * @returns V3BaselineResult with dimension levels, grade, and passion profile.
 */
export function scoreCore(answerIds: string[]): V3BaselineResult {
  if (answerIds.length !== 5) throw new Error('Exactly 5 answers required for V3 baseline')

  const allOptions = CORE_QUESTIONS.map((q, i) => {
    const opt = q.options.find(o => o.id === answerIds[i])
    if (!opt) throw new Error(`Invalid answer ID: ${answerIds[i]}`)
    return opt
  })

  // Primary dimension levels from Q1–Q3
  const passion_reduction = allOptions[0].dimension_level
  const judgement_quality = allOptions[1].dimension_level
  const disposition_stability = allOptions[2].dimension_level

  // Oikeiosis stage from Q4
  const oikeiosis_stage = allOptions[3].oikeiosis_stage ?? 'self_preservation'

  // Dominant passion from Q5
  const dominant_passion = allOptions[4].dominant_passion ?? 'epithumia'

  // Derive Senecan grade
  const { grade, internal_avg } = deriveSenecanGrade(
    passion_reduction,
    judgement_quality,
    disposition_stability,
    oikeiosis_stage
  )

  // Check if Q6 is needed (borderline placement)
  let needs_q6: V3BaselineResult['needs_q6'] = null
  const distTo_2_3 = Math.abs(internal_avg - 0.5)
  const distTo_1_2 = Math.abs(internal_avg - 1.5)

  if (distTo_2_3 <= 0.25 && (grade === 'grade_3' || grade === 'grade_2')) {
    needs_q6 = 'borderline_grade_2_3'
  } else if (distTo_1_2 <= 0.25 && (grade === 'grade_2' || grade === 'grade_1')) {
    needs_q6 = 'borderline_grade_1_2'
  }

  return {
    passion_reduction,
    judgement_quality,
    disposition_stability,
    oikeiosis_stage,
    senecan_grade: grade,
    dominant_passion,
    needs_q6,
    answers: answerIds,
  }
}

/**
 * Apply Q6 refinement to a borderline result.
 */
export function applyQ6(
  result: V3BaselineResult,
  q6AnswerId: string
): V3FinalBaselineResult {
  if (!result.needs_q6) throw new Error('Q6 not needed for this result')

  const branch = Q6_BRANCHES[result.needs_q6]
  const option = branch.options.find(o => o.id === q6AnswerId)
  if (!option) throw new Error(`Invalid Q6 answer ID: ${q6AnswerId}`)

  let adjustedGrade = result.senecan_grade

  if (option.grade_adjustment === 'up') {
    // Move one grade up
    if (result.needs_q6 === 'borderline_grade_2_3' && result.senecan_grade === 'grade_3') {
      adjustedGrade = 'grade_2'
    } else if (result.needs_q6 === 'borderline_grade_1_2' && result.senecan_grade === 'grade_2') {
      adjustedGrade = 'grade_1'
    }
  } else if (option.grade_adjustment === 'down') {
    // Move one grade down
    if (result.needs_q6 === 'borderline_grade_2_3' && result.senecan_grade === 'grade_2') {
      adjustedGrade = 'grade_3'
    } else if (result.needs_q6 === 'borderline_grade_1_2' && result.senecan_grade === 'grade_1') {
      adjustedGrade = 'grade_2'
    }
  }

  return {
    ...result,
    senecan_grade: adjustedGrade,
    needs_q6: null,
    q6_answer: q6AnswerId,
    interpretation: generateV3Interpretation(
      adjustedGrade,
      result.passion_reduction,
      result.judgement_quality,
      result.disposition_stability,
      result.oikeiosis_stage,
      result.dominant_passion
    ),
    disclaimer: BASELINE_DISCLAIMER,
  }
}

/**
 * Finalize a non-borderline result without Q6.
 */
export function finalizeWithoutQ6(result: V3BaselineResult): V3FinalBaselineResult {
  return {
    ...result,
    needs_q6: null,
    interpretation: generateV3Interpretation(
      result.senecan_grade,
      result.passion_reduction,
      result.judgement_quality,
      result.disposition_stability,
      result.oikeiosis_stage,
      result.dominant_passion
    ),
    disclaimer: BASELINE_DISCLAIMER,
  }
}

// ============================================================================
// V3 INTERPRETATION
// ============================================================================

/** R3: Disclaimer on evaluative output. */
export const BASELINE_DISCLAIMER =
  'This is a philosophical framework for self-reflection and does not consider legal, medical, financial, or personal obligations.'

const GRADE_INTROS: Record<SenecanGradeId, string> = {
  grade_1:
    'Your baseline reflects strong philosophical understanding across multiple dimensions. You show consistent virtue in reasoning and action, with a clear foundation that few reach.',
  grade_2:
    'You show genuine philosophical development. The worst tendencies are checked and your judgement is sound in familiar situations, with room to build greater consistency under pressure.',
  grade_3:
    'You have real awareness of philosophical principles and some passions are managed well, but application is still uneven. This is where most people who engage with philosophy find themselves — and where the most growth happens.',
  pre_progress:
    'Your baseline suggests that external concerns and strong reactions currently shape most of your decisions. This is the starting point — and awareness of it is the first step forward.',
}

const DIMENSION_DESCRIPTIONS: Record<ProgressDimensionId, Record<DimensionLevel, string>> = {
  passion_reduction: {
    emerging: 'Strong emotional reactions frequently drive your actions before you can step back',
    developing: 'You recognise when emotions are influencing you, but they often still win out',
    established: 'You can usually pause before reacting and prevent emotions from driving your actions',
    advanced: 'You consistently identify the beliefs behind emotional reactions and let them pass',
  },
  judgement_quality: {
    emerging: 'External circumstances strongly shape your sense of what is good and bad',
    developing: 'You sometimes recognise the difference between genuine goods and external circumstances',
    established: 'Your understanding of what is genuinely valuable is mostly accurate and consistent',
    advanced: 'You reliably distinguish genuine good (character, virtue) from preferred but indifferent externals',
  },
  disposition_stability: {
    emerging: 'Your reactions change significantly depending on circumstances and social pressure',
    developing: 'You can maintain your principles in calm situations but lose them under pressure',
    established: 'You hold your ground in most situations, though extreme testing can shake you',
    advanced: 'Your character is consistent regardless of external pressure or audience',
  },
  oikeiosis_extension: {
    emerging: 'Your decisions primarily focus on your own immediate interests',
    developing: 'Your concern naturally extends to your close relationships and family',
    established: 'You consider the broader community when making decisions',
    advanced: 'You weigh the impact of your decisions on people broadly, even those you may never meet',
  },
}

const PASSION_DESCRIPTIONS: Record<DominantPassionId, string> = {
  epithumia:
    'Your dominant tendency is craving — reaching for things you don\'t yet have (recognition, wealth, status) as though they were genuine goods. The philosophical correction: these are preferred indifferents, worth selecting when available but not worth being controlled by.',
  hedone:
    'Your dominant tendency is attachment to pleasure — treating comfort and enjoyment as genuine goods that must be preserved. The philosophical correction: pleasure is a preferred indifferent; genuine good is found in the quality of your character, not the quality of your experience.',
  phobos:
    'Your dominant tendency is avoidance — shrinking from difficulty, risk, or discomfort as though they were genuine evils. The philosophical correction: most things you fear are dispreferred indifferents, not genuine evils. The only genuine evil is vice.',
  lupe:
    'Your dominant tendency is dwelling in distress — contracting around losses and setbacks as though they were genuine evils that diminish you. The philosophical correction: external losses cannot touch your character. What matters is how you respond.',
}

function generateV3Interpretation(
  grade: SenecanGradeId,
  passionReduction: DimensionLevel,
  judgementQuality: DimensionLevel,
  dispositionStability: DimensionLevel,
  _oikeiosisStage: OikeiosisStageId,
  dominantPassion: DominantPassionId
): string {
  const intro = GRADE_INTROS[grade]

  // Find strongest and growth dimensions
  const dimensions: Array<{ id: ProgressDimensionId; level: DimensionLevel }> = [
    { id: 'passion_reduction', level: passionReduction },
    { id: 'judgement_quality', level: judgementQuality },
    { id: 'disposition_stability', level: dispositionStability },
  ]

  const sorted = [...dimensions].sort(
    (a, b) => LEVEL_RANK[b.level] - LEVEL_RANK[a.level]
  )
  const strongest = sorted[0]
  const growth = sorted[sorted.length - 1]

  const strongestDesc = DIMENSION_DESCRIPTIONS[strongest.id][strongest.level]
  const growthDesc = DIMENSION_DESCRIPTIONS[growth.id][growth.level]

  const DIMENSION_NAMES: Record<ProgressDimensionId, string> = {
    passion_reduction: 'Awareness of Passions',
    judgement_quality: 'Quality of Judgement',
    disposition_stability: 'Consistency of Character',
    oikeiosis_extension: 'Circle of Concern',
  }

  const passionNote = PASSION_DESCRIPTIONS[dominantPassion]

  return `${intro}\n\nYour strongest area is ${DIMENSION_NAMES[strongest.id]}: ${strongestDesc.toLowerCase()}. Your growth edge is ${DIMENSION_NAMES[growth.id]}: ${growthDesc.toLowerCase()}.\n\n${passionNote}`
}

// ============================================================================
// RETAKE ELIGIBILITY
// ============================================================================

/** Retake eligibility: 30 days from last assessment. */
export const RETAKE_INTERVAL_DAYS = 30

export function getRetakeEligibleDate(lastAssessmentDate: string): Date {
  const last = new Date(lastAssessmentDate)
  last.setDate(last.getDate() + RETAKE_INTERVAL_DAYS)
  return last
}

export function isRetakeEligible(lastAssessmentDate: string): boolean {
  return new Date() >= getRetakeEligibleDate(lastAssessmentDate)
}

// ============================================================================
// V1 DEPRECATED SHIMS — preserved for backward compatibility
// ============================================================================

/** @deprecated V1 type. Use V3AssessmentOption instead. */
export interface AssessmentOption {
  id: string
  text: string
  scores: {
    primary: { virtue: 'wisdom' | 'justice' | 'courage' | 'temperance'; value: number }
    secondary: { virtue: string; value: number }[]
  }
}

/** @deprecated V1 type. Use V3AssessmentQuestion instead. */
export interface AssessmentQuestion {
  id: string
  virtue: 'wisdom' | 'justice' | 'courage' | 'temperance' | 'refinement'
  question: string
  options: AssessmentOption[]
}

/** @deprecated V1 type. Use V3BaselineResult instead. */
export interface BaselineResult {
  total_score: number
  wisdom_score: number
  justice_score: number
  courage_score: number
  temperance_score: number
  alignment_tier: string
  strongest_virtue: string
  growth_area: string
  needs_q5: 'branch_a' | 'branch_b' | null
  answers: string[]
}

/** @deprecated V1 type. Use V3FinalBaselineResult instead. */
export interface FinalBaselineResult extends BaselineResult {
  needs_q5: null
  q5_answer?: string
  interpretation: string
}

/** @deprecated V1 interface. Use V3ConditionalQuestion instead. */
export interface Q5Option {
  id: string
  text: string
  adjustment: number
}

/** @deprecated V1 interface. Use V3ConditionalQuestion instead. */
export interface Q5Branch {
  id: string
  condition: string
  question: string
  options: Q5Option[]
}
