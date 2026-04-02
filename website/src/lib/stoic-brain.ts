/**
 * stoic-brain.ts — V3 Core Reference Library
 *
 * Derived from the 8 V3 data files at stoic-brain/ root.
 * Every export traces to a specific V3 file and field.
 *
 * V3 Derivation Notes (R6a):
 *   - Exports are DERIVED from V3 content, not copied from V1's export list.
 *   - V1 had: VIRTUES (4 weighted), ALIGNMENT_TIERS (5 numeric), getAlignmentTier(score).
 *   - V3 has: unified virtue expressions, passions taxonomy, 4-stage evaluation sequence,
 *     katorthoma proximity levels, oikeiosis stages, progress dimensions, Senecan grades.
 *   - No independent virtue weights (R6b). No 0-100 types (R6c).
 *
 * Source files:
 *   stoic-brain.json  — foundations (prohairesis, flourishing, sage ideal, cosmic framework)
 *   virtue.json       — unity thesis, 4 virtue expressions with sub-expressions
 *   value.json        — genuine goods, genuine evils, indifferents with selective value
 *   action.json       — kathekon/katorthoma, oikeiosis, deliberation framework
 *   passions.json     — 4 root passions, 25 sub-species, 3 eupatheiai, diagnostic sequence
 *   psychology.json   — ruling faculty, causal sequence (impression → assent → impulse → action)
 *   progress.json     — sage/non-sage binary, Senecan grades, progress dimensions
 *   scoring.json      — 4-stage evaluation sequence, katorthoma proximity scale (application layer)
 */

// ============================================================================
// TYPES — derived from V3 data structures (P2.2)
// ============================================================================

// --- virtue.json ---

/** A sub-expression of one of the four virtue domains. */
export type VirtueSubExpression = {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly source: string
}

/**
 * One of the four expressions of unified virtue.
 * R6b: No independent weights — virtues are expressions of a single
 * unified excellence of the ruling faculty (hegemonikon).
 */
export type VirtueExpression = {
  readonly id: 'phronesis' | 'dikaiosyne' | 'andreia' | 'sophrosyne'
  readonly name: string
  readonly greek: string
  readonly latin: string
  readonly domain: string
  readonly definitions: Record<string, string>
  readonly opposite_vice: string
  readonly sub_expressions: readonly VirtueSubExpression[]
}

// --- passions.json ---

/** A specific sub-species of a root passion. */
export type PassionSubSpecies = {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly source: string
}

/** One of the four root passions (pathe). */
export type RootPassion = {
  readonly id: 'epithumia' | 'hedone' | 'phobos' | 'lupe'
  readonly name: string
  readonly greek: string
  readonly definition: string
  readonly sub_species: readonly PassionSubSpecies[]
}

/** One of the three rational good feelings (eupatheiai). */
export type Eupatheia = {
  readonly id: 'chara' | 'boulesis' | 'eulabeia'
  readonly name: string
  readonly greek: string
  readonly replaces: string
  readonly definition: string
  readonly sub_species: readonly string[]
}

// --- scoring.json ---

/**
 * The 5-level katorthoma proximity scale.
 * R6c: Qualitative proximity levels, not numeric 0-100.
 */
export type KatorthomaProximityLevel =
  | 'reflexive'
  | 'habitual'
  | 'deliberate'
  | 'principled'
  | 'sage_like'

export type ProximityLevelDetail = {
  readonly id: KatorthomaProximityLevel
  readonly name: string
  readonly description: string
  readonly progress_grade: string
}

/** The output of the kathekon assessment stage. */
export type KathekonQuality = 'strong' | 'moderate' | 'marginal' | 'contrary'

/** Output of a single evaluation stage. */
export type ControlFilterOutput = {
  within_prohairesis: string[]
  outside_prohairesis: string[]
}

export type KathekonOutput = {
  is_kathekon: boolean
  quality: KathekonQuality
}

export type PassionDiagnosisOutput = {
  passions_detected: string[]
  false_judgements: string[]
  causal_stage_affected: string
}

export type VirtueQualityOutput = {
  katorthoma_proximity: KatorthomaProximityLevel
  ruling_faculty_state: string
}

/** Complete output of the 4-stage evaluation sequence. */
export type EvaluationResult = {
  control_filter: ControlFilterOutput
  kathekon_assessment: KathekonOutput
  passion_diagnosis: PassionDiagnosisOutput
  virtue_quality: VirtueQualityOutput
  improvement_path: string
  oikeiosis_obligations: string
}

// --- action.json ---

/** Oikeiosis stage — the expanding circle of natural affiliation. */
export type OikeiosisStageId =
  | 'self_preservation'
  | 'household'
  | 'community'
  | 'humanity'
  | 'cosmic'

export type OikeiosisStage = {
  readonly id: OikeiosisStageId
  readonly name: string
  readonly description: string
  readonly source: string
}

// --- progress.json ---

/** Senecan grades of moral progress. */
export type SenecanGradeId = 'grade_1' | 'grade_2' | 'grade_3' | 'pre_progress'

export type SenecanGrade = {
  readonly id: SenecanGradeId
  readonly name: string
  readonly latin?: string
  readonly description: string
  readonly indicators: readonly string[]
}

/** The 4 dimensions of moral progress. */
export type ProgressDimensionId =
  | 'passion_reduction'
  | 'judgement_quality'
  | 'disposition_stability'
  | 'oikeiosis_extension'

export type ProgressDimension = {
  readonly id: ProgressDimensionId
  readonly name: string
  readonly description: string
  readonly measures: readonly string[]
}

// --- value.json ---

export type SelectiveValue = 'high' | 'moderate' | 'low' | 'high-negative' | 'moderate-negative' | 'low-negative'

export type Indifferent = {
  readonly id: string
  readonly name: string
  readonly axia: SelectiveValue
  readonly domain: string
  readonly note?: string
  readonly source: string
}

// --- psychology.json ---

export type CausalStageId = 'phantasia' | 'synkatathesis' | 'horme' | 'praxis'

export type CausalStage = {
  readonly id: CausalStageId
  readonly name: string
  readonly greek: string
  readonly description: string
  readonly failure_mode: string
}

// ============================================================================
// CONSTANTS — derived from V3 content (P2.3, R6a)
// ============================================================================

// --- From virtue.json ---

/**
 * The four virtue expressions with their sub-expressions.
 * Source: DL 7.92-93, 7.125; Stobaeus Ecl. 2.59-63; Cicero De Officiis 1.15-18.
 *
 * R6b: No weights. These are co-dependent expressions of a single unified
 * excellence, not independently scorable skills.
 */
export const VIRTUE_EXPRESSIONS: readonly VirtueExpression[] = [
  {
    id: 'phronesis',
    name: 'Practical Wisdom',
    greek: 'phronesis',
    latin: 'prudentia',
    domain: 'What is genuinely good, bad, and indifferent',
    definitions: {
      DL: 'Knowledge of what things are to be done, what are not to be done, and what are neither (DL Lives 7.92)',
      Stobaeus: 'Knowledge of what is good, what is bad, and what is neither, belonging to a social creature (Ecl. 2.59)',
      Cicero_Off: 'The virtue concerned with the investigation and discovery of truth (De Officiis 1.15)',
      Cicero_Fin: 'The understanding of what is good and evil (De Finibus 3.22)',
    },
    opposite_vice: 'Folly (aphrosyne)',
    sub_expressions: [
      { id: 'euboulia', name: 'Euboulia / Good Deliberation', description: 'Knowledge of when to act, how to act, and when not to', source: 'DL 7.92; Stobaeus Ecl. 2.59' },
      { id: 'synesis', name: 'Synesis / Good Understanding', description: 'Applying general principles to particular situations', source: 'DL 7.92; Stobaeus Ecl. 2.59' },
      { id: 'anchinoia', name: 'Anchinoia / Quick-Wittedness', description: 'Finding the virtuous path in novel circumstances', source: 'DL 7.92; Stobaeus Ecl. 2.59' },
      { id: 'pronoia', name: 'Pronoia / Foresight', description: 'Anticipating consequences within the limits of what is up to us', source: 'DL 7.92; Stobaeus Ecl. 2.59' },
    ],
  },
  {
    id: 'dikaiosyne',
    name: 'Justice',
    greek: 'dikaiosyne',
    latin: 'iustitia',
    domain: 'What is owed to others — distributing to each their due',
    definitions: {
      DL: 'Knowledge that distributes to each their worth (DL Lives 7.126)',
      Stobaeus: 'Knowledge of distributions — knowing what to give to whom (Ecl. 2.59)',
      Cicero_Off: 'The virtue by which the common bond of humanity is preserved (De Officiis 1.20)',
      Cicero_Fin: 'The fair treatment of others and the proper ordering of human relationships (De Finibus 3.62-68)',
    },
    opposite_vice: 'Injustice (adikia)',
    sub_expressions: [
      { id: 'eusebeia', name: 'Eusebeia / Piety', description: 'Right relation to the cosmic rational order', source: 'DL 7.119; Stobaeus Ecl. 2.59' },
      { id: 'chrestotes', name: 'Chrestotes / Benevolence', description: 'Active goodwill and love of humanity (philanthropia)', source: 'DL 7.126; Stobaeus Ecl. 2.59' },
      { id: 'koinonike', name: 'Koinonike / Social Participation', description: 'Fulfilling roles in community life through oikeiosis', source: 'Stobaeus Ecl. 2.59; Cicero De Officiis 1.20-22' },
      { id: 'epieikeia', name: 'Epieikeia / Fair Dealing', description: 'Equity — not applying rules when doing so produces injustice', source: 'DL 7.126; Stobaeus Ecl. 2.59' },
    ],
  },
  {
    id: 'andreia',
    name: 'Courage',
    greek: 'andreia',
    latin: 'fortitudo',
    domain: 'What is genuinely fearful and what is not',
    definitions: {
      DL: 'Knowledge of what is to be endured, what is to be dared, and what is neither (DL Lives 7.92)',
      Stobaeus: 'The virtue that disposes us to endure what we ought (Ecl. 2.60)',
      Cicero_Off: 'The excellence and unconquerable strength of a lofty soul (De Officiis 1.15)',
    },
    opposite_vice: 'Cowardice (deilia)',
    sub_expressions: [
      { id: 'karteria', name: 'Karteria / Endurance', description: 'Standing firm against what must be borne', source: 'DL 7.92; Stobaeus Ecl. 2.60' },
      { id: 'tharsos', name: 'Tharsos / Confidence', description: 'Rational assurance grounded in correct knowledge of what is truly threatening', source: 'DL 7.92; Stobaeus Ecl. 2.60' },
      { id: 'megalopsychia', name: 'Megalopsychia / Magnanimity', description: 'Not being diminished by external circumstance', source: 'DL 7.92-93; Stobaeus Ecl. 2.60; Seneca Ep. 88.2' },
      { id: 'philoponia', name: 'Philoponia / Industriousness', description: 'Willing effort in service of virtue', source: 'DL 7.92; Stobaeus Ecl. 2.60' },
    ],
  },
  {
    id: 'sophrosyne',
    name: 'Temperance / Self-Mastery',
    greek: 'sophrosyne',
    latin: 'temperantia',
    domain: 'What to choose and what to avoid — ordering impulse and desire',
    definitions: {
      DL: 'Knowledge that makes impulses steadfast (episteme ametaptotos) (DL Lives 7.92)',
      Stobaeus: 'The virtue that produces orderliness (eutaxia) in the movements of the soul (Ecl. 2.60)',
      Cicero_Off: 'Order and measure in all things done and said, in which propriety (decorum) and self-control are contained (De Officiis 1.15)',
    },
    opposite_vice: 'Intemperance (akolasia)',
    sub_expressions: [
      { id: 'eutaxia', name: 'Eutaxia / Orderliness', description: 'Right timing and measure in action', source: 'DL 7.92; Stobaeus Ecl. 2.60' },
      { id: 'kosmiotetes', name: 'Kosmiotetes / Propriety', description: 'Acting as befits a rational being in context (decorum / to prepon)', source: 'DL 7.92; Stobaeus Ecl. 2.60; Cicero De Officiis 1.93-99' },
      { id: 'enkrateia', name: 'Enkrateia / Self-Mastery', description: 'Command over impulse and desire — not being driven by the four passions', source: 'DL 7.92; Stobaeus Ecl. 2.60' },
      { id: 'aidos', name: 'Aidos / Modesty', description: 'The inner check that prevents base action', source: 'DL 7.92; Stobaeus Ecl. 2.60; also listed as sub-species of eulabeia in DL 7.116' },
    ],
  },
] as const

// --- From passions.json ---

/**
 * The four root passions (pathe) with their sub-species.
 * Source: Stobaeus Ecl. 2.88-92; DL 7.110-116.
 *
 * R6d: The passions taxonomy is diagnostic, not punitive.
 * It identifies specific false judgements, not score deductions.
 */
export const ROOT_PASSIONS: readonly RootPassion[] = [
  {
    id: 'epithumia',
    name: 'Craving / Irrational Desire',
    greek: 'epithumia',
    definition: 'Irrational reaching toward an apparent future good that is not genuinely good.',
    sub_species: [
      { id: 'orge', name: 'Anger (orge)', description: 'Craving for revenge on one who seems to have wronged you', source: 'Stobaeus Ecl. 2.91; DL 7.113' },
      { id: 'eros', name: 'Erotic Passion (eros)', description: 'Craving for sexual union not based in virtue', source: 'Stobaeus Ecl. 2.91; DL 7.113' },
      { id: 'pothos', name: 'Longing (pothos)', description: 'Craving for something absent', source: 'Stobaeus Ecl. 2.91; DL 7.113' },
      { id: 'philedonia', name: 'Love of Pleasure (philedonia)', description: 'Craving for bodily pleasure as an end', source: 'Stobaeus Ecl. 2.91; DL 7.113' },
      { id: 'philoplousia', name: 'Love of Wealth (philoplousia)', description: 'Craving for wealth as an end', source: 'Stobaeus Ecl. 2.91; DL 7.113' },
      { id: 'philodoxia', name: 'Love of Honour (philodoxia)', description: 'Craving for reputation as an end', source: 'Stobaeus Ecl. 2.91; DL 7.113' },
    ],
  },
  {
    id: 'hedone',
    name: 'Irrational Pleasure',
    greek: 'hedone',
    definition: 'Irrational elation at an apparent present good that is not genuinely good.',
    sub_species: [
      { id: 'kelesis', name: 'Enchantment (kelesis)', description: 'Pleasure that captivates through the senses', source: 'Stobaeus Ecl. 2.91; DL 7.114' },
      { id: 'epichairekakia', name: 'Malicious Joy (epichairekakia)', description: 'Pleasure at another\'s misfortune', source: 'Stobaeus Ecl. 2.91; DL 7.114' },
      { id: 'terpsis', name: 'Excessive Amusement (terpsis)', description: 'Pleasure that dissolves seriousness', source: 'Stobaeus Ecl. 2.91; DL 7.114' },
    ],
  },
  {
    id: 'phobos',
    name: 'Fear / Irrational Shrinking',
    greek: 'phobos',
    definition: 'Irrational avoidance of an apparent future evil that is not genuinely evil.',
    sub_species: [
      { id: 'deima', name: 'Terror (deima)', description: 'Fear that produces paralysis', source: 'Stobaeus Ecl. 2.90; DL 7.112' },
      { id: 'oknos', name: 'Timidity (oknos)', description: 'Fear of future effort or exertion', source: 'Stobaeus Ecl. 2.90; DL 7.112' },
      { id: 'aischyne', name: 'Shame (aischyne)', description: 'Fear of ill-repute', source: 'Stobaeus Ecl. 2.90; DL 7.112' },
      { id: 'thambos', name: 'Dread (thambos)', description: 'Fear produced by the representation of an unfamiliar thing', source: 'Stobaeus Ecl. 2.90; DL 7.112' },
      { id: 'thorybos', name: 'Panic (thorybos)', description: 'Fear accompanied by vocal disturbance', source: 'Stobaeus Ecl. 2.90; DL 7.112' },
      { id: 'agonia', name: 'Agony (agonia)', description: 'Fear of an uncertain outcome', source: 'Stobaeus Ecl. 2.90; DL 7.112' },
    ],
  },
  {
    id: 'lupe',
    name: 'Distress / Irrational Pain',
    greek: 'lupe',
    definition: 'Irrational contraction at an apparent present evil that is not genuinely evil.',
    sub_species: [
      { id: 'eleos', name: 'Pity (eleos)', description: 'Distress at another\'s undeserved suffering — misidentifies an indifferent as evil', source: 'Stobaeus Ecl. 2.90; DL 7.111' },
      { id: 'phthonos', name: 'Envy (phthonos)', description: 'Distress at another\'s good fortune', source: 'Stobaeus Ecl. 2.90; DL 7.111' },
      { id: 'zelotypia', name: 'Jealousy (zelotypia)', description: 'Distress that another possesses what one desires', source: 'Stobaeus Ecl. 2.90; DL 7.111' },
      { id: 'penthos', name: 'Grief (penthos)', description: 'Distress at loss, especially of a person', source: 'Stobaeus Ecl. 2.90; DL 7.111' },
      { id: 'achos', name: 'Anxiety (achos)', description: 'Distress that weighs on the mind without clear object', source: 'Stobaeus Ecl. 2.90; DL 7.111' },
    ],
  },
] as const

/**
 * The three rational good feelings (eupatheiai).
 * Source: DL 7.116; Stobaeus Ecl. 2.90.
 */
export const EUPATHEIAI: readonly Eupatheia[] = [
  {
    id: 'chara',
    name: 'Joy / Rational Gladness',
    greek: 'chara',
    replaces: 'hedone (irrational pleasure)',
    definition: 'Rational gladness at what is genuinely good — virtue and right action.',
    sub_species: ['terpsis / delight', 'euphrosyne / good spirits', 'euthymia / cheerfulness'],
  },
  {
    id: 'boulesis',
    name: 'Rational Wish',
    greek: 'boulesis',
    replaces: 'epithumia (craving)',
    definition: 'Rational desire directed at what is genuinely good — wanting virtue and the welfare of others from correct understanding.',
    sub_species: ['eunoia / goodwill', 'eumeneia / benevolence', 'agapesis / love', 'aspasmos / affection'],
  },
  {
    id: 'eulabeia',
    name: 'Rational Caution',
    greek: 'eulabeia',
    replaces: 'phobos (fear)',
    definition: 'Rational avoidance of what is genuinely evil — vice. Not fear, but principled refusal to participate in what is truly harmful.',
    sub_species: ['aidos / reverence', 'hagneia / sanctity'],
  },
] as const

// --- From scoring.json ---

/**
 * The 5-level katorthoma proximity scale.
 * Source: scoring.json (application layer), grounded in Stobaeus Ecl. 2.85
 * and Seneca Ep. 75.8-15.
 *
 * R6c: Qualitative levels, not numeric 0-100.
 */
export const PROXIMITY_LEVELS: readonly ProximityLevelDetail[] = [
  {
    id: 'reflexive',
    name: 'Reflexive',
    description: 'Action from pure impulse with no deliberation. Passion dominates completely.',
    progress_grade: 'Below the gradient (pre-progress)',
  },
  {
    id: 'habitual',
    name: 'Habitual',
    description: 'Action from social convention or habit, not from understanding. May be a kathekon externally but performed without knowledge of why it is right.',
    progress_grade: 'Third grade (tertius gradus)',
  },
  {
    id: 'deliberate',
    name: 'Deliberate',
    description: 'Action from conscious reasoning, with some understanding. Passion partially checked but still operative.',
    progress_grade: 'Second grade (secundus gradus)',
  },
  {
    id: 'principled',
    name: 'Principled',
    description: 'Action from stable commitment to virtue, with strong understanding and minimal passion. Approaching sage-like quality.',
    progress_grade: 'First grade (primus gradus)',
  },
  {
    id: 'sage_like',
    name: 'Sage-Like (Katorthoma)',
    description: 'Action from perfected understanding and unified virtue. Complete freedom from destructive passion.',
    progress_grade: 'Sage (sophos/sapiens)',
  },
] as const

// --- From action.json ---

/**
 * The 5 stages of oikeiosis — expanding circle of natural affiliation.
 * Source: DL 7.51-60; Cicero De Finibus 3.62-68; Cicero De Officiis 1.11-12.
 */
export const OIKEIOSIS_STAGES: readonly OikeiosisStage[] = [
  { id: 'self_preservation', name: 'Self-Preservation', description: 'Natural impulse to preserve oneself and what belongs to oneself.', source: 'Cicero De Finibus 3.16-22' },
  { id: 'household', name: 'Household / Family', description: 'Extension of concern to those closest — family, dependants.', source: 'DL 7.51-60; Cicero De Finibus 3.62' },
  { id: 'community', name: 'Community', description: 'Recognition of bonds with fellow citizens, colleagues, neighbours.', source: 'Cicero De Officiis 1.20-22' },
  { id: 'humanity', name: 'Humanity', description: 'Universal human fellowship — the bond of shared rationality.', source: 'Cicero De Officiis 1.11-12; DL 7.58-60' },
  { id: 'cosmic', name: 'Cosmic / Rational Order', description: 'Full cosmopolitan citizenship — alignment with the rational order of the whole.', source: 'DL 7.58-60; Marcus Aurelius Meditations 4.26' },
] as const

/**
 * Cicero's 5 deliberation questions from De Officiis.
 * Source: action.json > deliberation_framework; Cicero De Officiis 1.9-10, 3.7-19.
 */
export const DELIBERATION_QUESTIONS: readonly string[] = [
  'Is the proposed action honourable (honestum)?',
  'Is it advantageous (utile)?',
  'If honourable and advantageous conflict, which prevails?',
  'Among competing honourable options, which is more honourable?',
  'Among competing advantageous options, which is more advantageous?',
] as const

// --- From progress.json ---

/**
 * Senecan grades of moral progress.
 * Source: Seneca Epistulae 75.8-15.
 */
export const SENECAN_GRADES: readonly SenecanGrade[] = [
  {
    id: 'grade_1',
    name: 'First Grade — Approaching Wisdom',
    latin: 'primus gradus',
    description: 'Those who have come near to wisdom but have not yet reached it. Most passions overcome but not all.',
    indicators: [
      'Most passions overcome but not all',
      'Understanding is strong but not yet complete',
      'Can still relapse under extreme testing',
      'Disposition approaching hexis but not yet fully stable',
    ],
  },
  {
    id: 'grade_2',
    name: 'Second Grade — Overcoming the Worst',
    latin: 'secundus gradus',
    description: 'Those who have overcome the worst passions and vices but are not yet secure.',
    indicators: [
      'Major passions checked but minor ones still operative',
      'Good judgement in familiar situations',
      'Can be thrown off by novel or extreme circumstances',
      'Regular philosophical practice maintaining progress',
    ],
  },
  {
    id: 'grade_3',
    name: 'Third Grade — Beginning the Path',
    latin: 'tertius gradus',
    description: 'Those who have escaped many great vices but not all. Where most philosophical practitioners find themselves.',
    indicators: [
      'Some passions overcome, others still dominant',
      'Awareness of philosophical principles but inconsistent application',
      'Progress is real but uneven',
      'Subject to regression when tested',
    ],
  },
] as const

/**
 * The 4 progress dimensions for tracking moral development.
 * Source: progress.json (application layer derived from Seneca Ep. 75, Stobaeus, Cicero).
 */
export const PROGRESS_DIMENSIONS: readonly ProgressDimension[] = [
  {
    id: 'passion_reduction',
    name: 'Reduction of Passions',
    description: 'Are fewer passions operative? Are they less intense? Are the sub-species narrowing?',
    measures: [
      'Number and intensity of passions detected across recent actions',
      'Which specific passions have been overcome vs. which persist',
      'Are the remaining passions becoming more subtle?',
    ],
  },
  {
    id: 'judgement_quality',
    name: 'Quality of Judgement',
    description: 'Is understanding of what is good, bad, and indifferent becoming more accurate?',
    measures: [
      'Frequency of false judgements in action evaluations',
      'Are false judgements becoming subtler?',
      'Better recognition of comprehensive impressions vs. mere opinion?',
    ],
  },
  {
    id: 'disposition_stability',
    name: 'Stability of Disposition',
    description: 'Is commitment to virtue becoming more stable (approaching hexis)?',
    measures: [
      'Consistency of action quality over time',
      'Resilience under pressure',
      'Recovery time after setbacks',
    ],
  },
  {
    id: 'oikeiosis_extension',
    name: 'Extension of Natural Affiliation',
    description: 'Is the circle of concern expanding?',
    measures: [
      'Which oikeiosis stage do actions typically serve?',
      'Increasingly accounting for broader social obligations?',
      'Moving from self-concern toward cosmopolitan concern?',
    ],
  },
] as const

// --- From value.json ---

/**
 * Preferred indifferents with selective value (axia).
 * Source: DL 7.102-107; Stobaeus Ecl. 2.79-85.
 */
export const PREFERRED_INDIFFERENTS: readonly Indifferent[] = [
  { id: 'life', name: 'Life', axia: 'high', domain: 'body', source: 'DL 7.102; Stobaeus Ecl. 2.79-80' },
  { id: 'health', name: 'Health', axia: 'high', domain: 'body', source: 'DL 7.102; Stobaeus Ecl. 2.80' },
  { id: 'strength', name: 'Strength', axia: 'moderate', domain: 'body', source: 'DL 7.102; Stobaeus Ecl. 2.80' },
  { id: 'beauty', name: 'Beauty', axia: 'low', domain: 'body', source: 'DL 7.102; Stobaeus Ecl. 2.80' },
  { id: 'intact_senses', name: 'Intact Senses', axia: 'high', domain: 'body', source: 'DL 7.102; Stobaeus Ecl. 2.80' },
  { id: 'wealth', name: 'Wealth', axia: 'moderate', domain: 'external', note: 'Material for just action', source: 'DL 7.102; Stobaeus Ecl. 2.80; Seneca De Vita Beata 22-24' },
  { id: 'reputation', name: 'Good Reputation', axia: 'moderate', domain: 'external', source: 'DL 7.102; Stobaeus Ecl. 2.80' },
  { id: 'noble_birth', name: 'Noble Birth', axia: 'low', domain: 'external', source: 'DL 7.102; Stobaeus Ecl. 2.80' },
  { id: 'freedom', name: 'Freedom', axia: 'high', domain: 'external', source: 'DL 7.102; Epictetus Discourses 4.1' },
  { id: 'friendship', name: 'Friendship', axia: 'high', domain: 'external', note: 'Natural expression of oikeiosis', source: 'DL 7.102; Cicero De Finibus 3.62-68' },
  { id: 'knowledge', name: 'Knowledge', axia: 'high', domain: 'soul-adjacent', note: 'Material for phronesis', source: 'DL 7.102; Stobaeus Ecl. 2.80' },
  { id: 'natural_ability', name: 'Natural Ability', axia: 'moderate', domain: 'soul-adjacent', source: 'DL 7.102; Stobaeus Ecl. 2.80' },
] as const

// --- From psychology.json ---

/**
 * The 4-stage causal sequence in the ruling faculty.
 * Source: Stobaeus Ecl. 2.86-88; DL 7.40.
 */
export const CAUSAL_SEQUENCE: readonly CausalStage[] = [
  { id: 'phantasia', name: 'Phantasia / Impression', greek: 'phantasia', description: 'An impression presents itself to the ruling faculty.', failure_mode: 'Distorted impression — seeing danger or good where there is none.' },
  { id: 'synkatathesis', name: 'Synkatathesis / Assent', greek: 'synkatathesis', description: 'The ruling faculty assents to or withholds assent from the impression.', failure_mode: 'Hasty assent — accepting a false impression as true.' },
  { id: 'horme', name: 'Horme / Impulse', greek: 'horme', description: 'If assent is given, an impulse toward or away from something arises.', failure_mode: 'Excessive impulse (pathos) — impulse that overshoots reason.' },
  { id: 'praxis', name: 'Praxis / Action', greek: 'praxis', description: 'The external action resulting from the impulse.', failure_mode: 'Action from passion — externally correct behaviour driven by wrong reasons.' },
] as const

/**
 * The 5-step passion diagnostic sequence.
 * Source: passions.json > diagnostic_use.
 */
export const DIAGNOSTIC_SEQUENCE: readonly string[] = [
  '1. Was the agent\'s impression of the situation distorted? If so, by which of the 4 root passions?',
  '2. Did the agent assent to a false impression? Which false belief drove the assent?',
  '3. Did the impulse exceed what reason warranted?',
  '4. Which specific sub-species was operative?',
  '5. What is the corresponding correct judgement that would replace the false one?',
] as const

// ============================================================================
// HELPER FUNCTIONS (P2.4)
// ============================================================================

/**
 * Run the prohairesis control filter (Stage 1 of the evaluation sequence).
 * Separates what was within the agent's moral choice from what was not.
 * Source: scoring.json > evaluation_sequence > stage 1.
 */
export function runControlFilter(
  withinProhairesis: string[],
  outsideProhairesis: string[]
): ControlFilterOutput {
  return {
    within_prohairesis: withinProhairesis,
    outside_prohairesis: outsideProhairesis,
  }
}

/**
 * Assess whether an action is a kathekon (appropriate action).
 * Source: scoring.json > evaluation_sequence > stage 2; action.json > kathekon.
 */
export function assessKathekon(
  isKathekon: boolean,
  quality: KathekonQuality
): KathekonOutput {
  return { is_kathekon: isKathekon, quality }
}

/**
 * Identify passions using the 5-step diagnostic from passions.json.
 * Source: passions.json > diagnostic_use > diagnostic_sequence.
 *
 * R6d: This is diagnostic (identifying false judgements), not punitive (deducting points).
 */
export function identifyPassions(
  passionsDetected: string[],
  falseJudgements: string[],
  causalStageAffected: CausalStageId
): PassionDiagnosisOutput {
  return {
    passions_detected: passionsDetected,
    false_judgements: falseJudgements,
    causal_stage_affected: causalStageAffected,
  }
}

/**
 * Assess unified virtue quality (Stage 4).
 * Source: scoring.json > evaluation_sequence > stage 4; virtue.json > unity_thesis.
 *
 * R6b: Assesses the UNIFIED quality of the ruling faculty, not
 * independent virtue scores.
 */
export function assessVirtueQuality(
  proximity: KatorthomaProximityLevel,
  rulingFacultyState: string
): VirtueQualityOutput {
  return {
    katorthoma_proximity: proximity,
    ruling_faculty_state: rulingFacultyState,
  }
}

/**
 * Get the detail for a katorthoma proximity level.
 * Source: scoring.json > katorthoma_proximity_scale.
 *
 * R6c: Returns qualitative description, not a numeric score.
 */
export function getKatorthomaProximity(
  level: KatorthomaProximityLevel
): ProximityLevelDetail {
  const found = PROXIMITY_LEVELS.find(l => l.id === level)
  if (!found) {
    throw new Error(`Unknown proximity level: ${level}`)
  }
  return found
}

/**
 * Get the Senecan grade for a given grade ID.
 * Source: progress.json > progress_gradient > grades.
 */
export function getSenecanGrade(gradeId: SenecanGradeId): SenecanGrade | undefined {
  return SENECAN_GRADES.find(g => g.id === gradeId)
}

/**
 * Get a virtue expression by ID.
 */
export function getVirtueExpression(
  id: 'phronesis' | 'dikaiosyne' | 'andreia' | 'sophrosyne'
): VirtueExpression {
  const found = VIRTUE_EXPRESSIONS.find(v => v.id === id)
  if (!found) {
    throw new Error(`Unknown virtue expression: ${id}`)
  }
  return found
}

/**
 * Get a root passion by ID.
 */
export function getRootPassion(
  id: 'epithumia' | 'hedone' | 'phobos' | 'lupe'
): RootPassion {
  const found = ROOT_PASSIONS.find(p => p.id === id)
  if (!found) {
    throw new Error(`Unknown root passion: ${id}`)
  }
  return found
}

/**
 * Find a specific passion sub-species by ID across all root passions.
 * Returns the sub-species and which root passion it belongs to.
 */
export function findPassionSubSpecies(
  subSpeciesId: string
): { rootPassion: RootPassion; subSpecies: PassionSubSpecies } | undefined {
  for (const root of ROOT_PASSIONS) {
    const sub = root.sub_species.find(s => s.id === subSpeciesId)
    if (sub) {
      return { rootPassion: root, subSpecies: sub }
    }
  }
  return undefined
}

/**
 * Get the oikeiosis stage by ID.
 */
export function getOikeiosisStage(
  id: OikeiosisStageId
): OikeiosisStage {
  const found = OIKEIOSIS_STAGES.find(s => s.id === id)
  if (!found) {
    throw new Error(`Unknown oikeiosis stage: ${id}`)
  }
  return found
}

/**
 * Standard disclaimer for all evaluative output.
 * R3: All tool outputs that evaluate, score, or recommend actions must
 * include this visible disclaimer.
 */
export const EVALUATIVE_DISCLAIMER =
  'Ancient reasoning, modern application. Does not consider legal, medical, financial, or personal obligations.' as const

// ============================================================================
// TEMPORARY V1 COMPATIBILITY SHIMS
// These exist ONLY so that unrewritten V1 tool pages still compile.
// Each shim will be removed when its consuming page is derived in Phases 3-9.
// DO NOT use these in any new V3 code.
// ============================================================================

/** @deprecated V1 compat — remove when consuming pages are derived in Phases 3-9. */
/** Virtue icon paths — maps each virtue to its animal symbol image */
const VIRTUE_ICONS: Record<string, string> = {
  phronesis: '/images/owllogo.PNG',
  dikaiosyne: '/images/scaleslogo.PNG',
  andreia: '/images/lionlogo.PNG',
  sophrosyne: '/images/lotuslogo.PNG.png',
}

export const VIRTUES = VIRTUE_EXPRESSIONS.map(v => ({
  id: v.id,
  name: v.name,
  greek: v.greek,
  // weight removed — V3 rule R6b: no independent virtue weights (unified assessment)
  icon: VIRTUE_ICONS[v.id] || '',
  color: v.id === 'phronesis' ? '#7d9468' : v.id === 'dikaiosyne' ? '#B2AC88' : v.id === 'andreia' ? '#9e6b3a' : '#c45a7a',
  description: v.domain,
  subVirtues: v.sub_expressions.map(se => se.name),
}))

/** @deprecated V1 compat — remove when consuming pages are derived in Phases 3-9. */
export const ALIGNMENT_TIERS = PROXIMITY_LEVELS.map((level, i) => ({
  id: level.id,
  label: level.name,
  range: ['0-19', '20-39', '40-59', '60-79', '80-100'][i] ?? '',
  color: ['#9e3a3a', '#c4843a', '#B2AC88', '#7d9468', '#4d6040'][i] ?? '#999',
  description: level.description,
}))

/** @deprecated V1 compat — remove when consuming pages are derived in Phases 3-9. */
export function getAlignmentTier(score: number) {
  if (score >= 80) return ALIGNMENT_TIERS[4]
  if (score >= 60) return ALIGNMENT_TIERS[3]
  if (score >= 40) return ALIGNMENT_TIERS[2]
  if (score >= 20) return ALIGNMENT_TIERS[1]
  return ALIGNMENT_TIERS[0]
}
