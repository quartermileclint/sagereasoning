/**
 * vocabulary.ts — the LOCAL vocabulary for the primal-impulse examination tool
 * (S7). Zero imports, by design. Shared by the route, the page, the migration's
 * CHECK constraints, and the boundary test's drift pin.
 *
 * ===========================================================================
 * WHY THIS IS DUPLICATED RATHER THAN IMPORTED (mentor ruling C12, binding)
 * ===========================================================================
 *
 * The passion sub-species this exercise needs ARE in the committed corpus —
 * `ROOT_PASSIONS` in `website/src/lib/stoic-brain.ts` (lines 311-364), sourced
 * to Stobaeus Ecl. 2.88-92 and DL 7.110-116. This module does NOT import them.
 *
 * `stoic-brain.ts` is imported DIRECTLY by `api/guardrail/route.ts` and by
 * `guardrail-sandwich.ts`, and transitively reaches `/api/reason`. Reading it
 * is permitted; EDITING it is forbidden — an edit breaks byte-identity on two
 * measured surfaces. The shipped precedent for a human surface that needs
 * engine-adjacent vocabulary is to define it LOCALLY (see `/sage-compass`'s
 * VIRTUES and `/oikeiosis`'s CIRCLES), keeping this surface out of the
 * `/api/reason` import graph.
 *
 * The mentor ruled the trade-off explicitly (C12):
 *
 *   "Accept the duplication and add a drift pin. The boundary test reads
 *    stoic-brain.ts as text — imports nothing — and asserts the local IDs are
 *    a subset. Silent drift is the risk; the pin catches it without coupling."
 *
 * So: `__tests__/human-practitioner-boundary.test.ts` reads `stoic-brain.ts`
 * AS TEXT (never importing it) and asserts every id below is present in the
 * corpus. If the corpus changes, the pin goes red. Do not "fix" a red drift
 * pin by editing stoic-brain.ts.
 *
 * ===========================================================================
 * A CORRECTION TO THE SCOPE DOCUMENT, RECORDED HERE (2026-08-12)
 * ===========================================================================
 *
 * `S7-primal-substrate-practice-activities-scope.md` §2.1 and §2.4 state that
 * ROOT_PASSIONS holds "4 roots / 25 sub-species". Counted first-hand in the
 * source: it holds **20** — epithumia 6, hedone 3, phobos 6, lupe 5. The
 * scope document's per-id line citations are all CORRECT (philoplousia :322,
 * philodoxia :323, oknos :344, aischyne :345, agonia :348, phobos spanning
 * :343-348); only the total was wrong. The 20 below are the real set, and the
 * drift pin asserts against the source, not against the scope document — the
 * standing `primary-data-beats-secondary-characterisation` lesson, which this
 * session's own prompt named as its highest-risk class.
 */

// ===========================================================================
// THE ELEVEN PRIMAL TRAITS
// ===========================================================================

/**
 * The eleven traits, transcribed from `inbox/eleven traits research.rtf`
 * (committed 2026-08-11, discharging founder act D1).
 *
 * *** CITE TRAITS BY NAME, NEVER BY NUMBER. *** The research is UNNUMBERED.
 * `order` below is order of appearance in the source and exists only to keep
 * this list stable and reviewable — it is NOT a label the source assigns, and
 * no user-facing copy uses it. (The primal-substrate synthesis called
 * Behavioural Flexibility "the eleventh trait"; it is NINTH by order of
 * appearance. The trait was correctly named and characterised — only the
 * positional label was wrong. That is exactly why numbers are not used here.)
 *
 * *** EXTENSIBILITY (mentor ruling C13). *** All ELEVEN ids are listed here
 * and all eleven are admitted by the migration's CHECK constraint, while only
 * the traits carrying a `PATHWAYS` entry below are selectable in v1. That is
 * the deliberate resolution of C13's requirement — "design the trait
 * vocabulary so the remaining seven can be added without a schema change" —
 * against the sibling requirement that every enum carry a CHECK: the CHECK is
 * real and spans the committed taxonomy, so adding a pathway for a further
 * trait is a CODE-ONLY change with no migration.
 */
export interface PrimalTrait {
  readonly id: string
  /** Verbatim as written in the research. */
  readonly name: string
  /** Order of appearance in the source. NOT a label the source assigns. */
  readonly order: number
}

export const PRIMAL_TRAITS: readonly PrimalTrait[] = [
  { id: 'competition', name: 'Competition', order: 1 },
  { id: 'hierarchy_dominance', name: 'Hierarchy / Dominance', order: 2 },
  { id: 'territoriality', name: 'Territoriality', order: 3 },
  { id: 'resource_acquisition', name: 'Resource Acquisition / Foraging Optimization', order: 4 },
  { id: 'mate_competition', name: 'Mate Competition and Sexual Selection', order: 5 },
  { id: 'kin_preference', name: 'Kin Preference / Inclusive Fitness Drive', order: 6 },
  { id: 'reciprocity', name: 'Reciprocity / Conditional Cooperation', order: 7 },
  { id: 'threat_avoidance', name: 'Threat Avoidance / Self-Preservation', order: 8 },
  { id: 'behavioral_flexibility', name: 'Behavioral Flexibility / Innovation', order: 9 },
  { id: 'social_monitoring', name: 'Social Monitoring / Alliance Formation', order: 10 },
  { id: 'deception_manipulation', name: 'Deception / Manipulation', order: 11 },
] as const

export const TRAIT_IDS: readonly string[] = PRIMAL_TRAITS.map((t) => t.id)

export type TraitId = (typeof PRIMAL_TRAITS)[number]['id']

// ===========================================================================
// THE PASSION SUB-SPECIES — transcribed from the corpus, guarded by the pin
// ===========================================================================

/**
 * The 20 passion sub-species, transcribed verbatim from `ROOT_PASSIONS`
 * (`stoic-brain.ts:311-364`; Stobaeus Ecl. 2.88-92; DL 7.110-116).
 *
 * `root` is the parent passion's id; `description` is the corpus's own
 * description string, reproduced so the practitioner chooses from the real
 * definitions rather than from a paraphrase.
 */
export interface PassionSubSpecies {
  readonly id: string
  readonly name: string
  readonly root: 'epithumia' | 'hedone' | 'phobos' | 'lupe'
  readonly description: string
}

export const ROOT_PASSION_LABELS: readonly {
  readonly id: 'epithumia' | 'hedone' | 'phobos' | 'lupe'
  readonly name: string
  readonly definition: string
}[] = [
  {
    id: 'epithumia',
    name: 'Craving / Irrational Desire',
    definition: 'Irrational reaching toward an apparent future good that is not genuinely good.',
  },
  {
    id: 'hedone',
    name: 'Irrational Pleasure',
    definition: 'Irrational elation at an apparent present good that is not genuinely good.',
  },
  {
    id: 'phobos',
    name: 'Fear / Irrational Shrinking',
    definition: 'Irrational avoidance of an apparent future evil that is not genuinely evil.',
  },
  {
    id: 'lupe',
    name: 'Distress / Irrational Pain',
    definition: 'Irrational contraction at an apparent present evil that is not genuinely evil.',
  },
] as const

export const PASSION_SUB_SPECIES: readonly PassionSubSpecies[] = [
  // epithumia (6)
  { id: 'orge', name: 'Anger (orge)', root: 'epithumia', description: 'Craving for revenge on one who seems to have wronged you' },
  { id: 'eros', name: 'Erotic Passion (eros)', root: 'epithumia', description: 'Craving for sexual union not based in virtue' },
  { id: 'pothos', name: 'Longing (pothos)', root: 'epithumia', description: 'Craving for something absent' },
  { id: 'philedonia', name: 'Love of Pleasure (philedonia)', root: 'epithumia', description: 'Craving for bodily pleasure as an end' },
  { id: 'philoplousia', name: 'Love of Wealth (philoplousia)', root: 'epithumia', description: 'Craving for wealth as an end' },
  { id: 'philodoxia', name: 'Love of Honour (philodoxia)', root: 'epithumia', description: 'Craving for reputation as an end' },
  // hedone (3)
  { id: 'kelesis', name: 'Enchantment (kelesis)', root: 'hedone', description: 'Pleasure that captivates through the senses' },
  { id: 'epichairekakia', name: 'Malicious Joy (epichairekakia)', root: 'hedone', description: "Pleasure at another's misfortune" },
  { id: 'terpsis', name: 'Excessive Amusement (terpsis)', root: 'hedone', description: 'Pleasure that dissolves seriousness' },
  // phobos (6)
  { id: 'deima', name: 'Terror (deima)', root: 'phobos', description: 'Fear that produces paralysis' },
  { id: 'oknos', name: 'Timidity (oknos)', root: 'phobos', description: 'Fear of future effort or exertion' },
  { id: 'aischyne', name: 'Shame (aischyne)', root: 'phobos', description: 'Fear of ill-repute' },
  { id: 'thambos', name: 'Dread (thambos)', root: 'phobos', description: 'Fear produced by the representation of an unfamiliar thing' },
  { id: 'thorybos', name: 'Panic (thorybos)', root: 'phobos', description: 'Fear accompanied by vocal disturbance' },
  { id: 'agonia', name: 'Agony (agonia)', root: 'phobos', description: 'Fear of an uncertain outcome' },
  // lupe (5)
  { id: 'eleos', name: 'Pity (eleos)', root: 'lupe', description: "Distress at another's undeserved suffering — misidentifies an indifferent as evil" },
  { id: 'phthonos', name: 'Envy (phthonos)', root: 'lupe', description: "Distress at another's good fortune" },
  { id: 'zelotypia', name: 'Jealousy (zelotypia)', root: 'lupe', description: 'Distress that another possesses what one desires' },
  { id: 'penthos', name: 'Grief (penthos)', root: 'lupe', description: 'Distress at loss, especially of a person' },
  { id: 'achos', name: 'Anxiety (achos)', root: 'lupe', description: 'Distress that weighs on the mind without clear object' },
] as const

export const SUB_SPECIES_IDS: readonly string[] = PASSION_SUB_SPECIES.map((s) => s.id)

// ===========================================================================
// THE TWO EXAMINATION MODES
// ===========================================================================

/**
 * `diagnostic_sequence` — the committed five-step `DIAGNOSTIC_SEQUENCE`
 *   (`stoic-brain.ts:595-601`, from passions.json > diagnostic_use), entered
 *   from a trait. Adopted as THE examination pathway per mentor rulings A1/C1:
 *   *"The DIAGNOSTIC_SEQUENCE is the committed examination pathway. S7 applies
 *   it rather than authoring a parallel taxonomy."*
 *
 * `reciprocity` — a STRUCTURALLY DIFFERENT mode with the mentor's own supplied
 *   question set (B4). It is NOT the sequence with fields renamed. See
 *   RECIPROCITY_QUESTIONS below.
 */
export const EXAMINATION_MODES = ['diagnostic_sequence', 'reciprocity'] as const
export type ExaminationMode = (typeof EXAMINATION_MODES)[number]

/**
 * The five steps of the committed DIAGNOSTIC_SEQUENCE, quoted verbatim from
 * `stoic-brain.ts:595-601` so a reader can check the mapping without leaving
 * this file. The tool's five questions ARE these steps; the trait is the entry
 * point that frames step 1 and narrows step 4's candidates.
 *
 * Verbatim, in order:
 *   1. "Was the agent's impression of the situation distorted? If so, by which
 *       of the 4 root passions?"
 *   2. "Did the agent assent to a false impression? Which false belief drove
 *       the assent?"
 *   3. "Did the impulse exceed what reason warranted?"
 *   4. "Which specific sub-species was operative?"
 *   5. "What is the corresponding correct judgement that would replace the
 *       false one?"
 */
export const DIAGNOSTIC_STEP_COUNT = 5

/** Step 3's answer — "Did the impulse exceed what reason warranted?" */
export const IMPULSE_EXCEEDED_VALUES = ['yes', 'no', 'uncertain'] as const
export type ImpulseExceeded = (typeof IMPULSE_EXCEEDED_VALUES)[number]

/**
 * The reciprocity mode's first question, as an answer vocabulary.
 *
 * The mentor's question (B4, verbatim): *"is this cooperation grounded in
 * recognition of the other as a rational being, or in expected return?"* — it
 * is posed as an either/or, so the answer is captured as a choice AND in the
 * practitioner's own words (`cooperation_ground_note`). Neither is scored.
 */
export const COOPERATION_GROUNDS = [
  'rational_being',
  'expected_return',
  'both',
  'uncertain',
] as const
export type CooperationGround = (typeof COOPERATION_GROUNDS)[number]

/**
 * The reciprocity mode's question set — the mentor's own words (ruling B4),
 * reproduced here so the page renders them rather than a re-authored version:
 *
 *   "is this cooperation grounded in recognition of the other as a rational
 *    being, or in expected return? What would the action look like if the
 *    expected return were removed?"
 *
 * The SECOND question is the discriminating one and has no analogue in the
 * other three pathways — it is a COUNTERFACTUAL, not a diagnosis. That is
 * precisely why this mode genuinely differs and must not be forced into the
 * sub-species shape: doing so would either invent a sub-species (an R7
 * source-fidelity violation — reciprocity IS NOT a passion sub-species) or
 * silently drop the pathway. Its corpus anchor is the `praxis` failure mode
 * (`stoic-brain.ts:588`): *"Action from passion — externally correct behaviour
 * driven by wrong reasons."*
 */
export const RECIPROCITY_QUESTIONS = {
  ground:
    'Is this cooperation grounded in recognition of the other as a rational being, or in expected return?',
  counterfactual: 'What would the action look like if the expected return were removed?',
} as const

/** The corpus's own `praxis` failure mode — this mode's anchor. Verbatim. */
export const PRAXIS_FAILURE_MODE =
  'Action from passion — externally correct behaviour driven by wrong reasons.'

// ===========================================================================
// THE FOUR RULED v1 PATHWAYS (mentor ruling C13)
// ===========================================================================

/**
 * The examination pathways wired in v1.
 *
 * *** WHY FIVE TRAIT IDS FOR FOUR PATHWAYS. *** The mentor's ruling names four
 * mappings, the first written as *"competition/hierarchy → philodoxia"*. The
 * research names Competition and Hierarchy / Dominance as two DISTINCT traits.
 * Merging them into one invented trait id would break the cite-by-name rule
 * and the source's own taxonomy; so both traits are selectable and both route
 * to the philodoxia pathway. That is what the mentor's slash means when the
 * two named traits are not silently merged. Four pathways, five wired traits.
 *
 * `narrowedSubSpecies` is the mentor's named set for that pathway — step 4's
 * candidates, surfaced first. It is a NARROWING, not a restriction: the
 * practitioner may still choose any of the 20 (DIAGNOSTIC_SEQUENCE step 4 asks
 * "which specific sub-species was operative", and the honest answer is
 * sometimes not the expected one).
 *
 * `impressionHint`, `falseBeliefHint`, and `correctJudgementHint` are the
 * mentor's own per-pathway examination questions (Heading 7), placed on the
 * step they belong to. They FRAME the committed sequence per trait; they do
 * not replace it.
 */
export interface ExaminationPathway {
  readonly traitIds: readonly string[]
  readonly mode: ExaminationMode
  /** The sub-species this trait's impulse characteristically resolves to. */
  readonly narrowedSubSpecies: readonly string[]
  /** The false judgement the mentor names for this pathway. */
  readonly falseJudgement: string
  readonly impressionHint: string
  readonly falseBeliefHint: string
  readonly correctJudgementHint: string
}

export const EXAMINATION_PATHWAYS: readonly ExaminationPathway[] = [
  {
    // "Competition and hierarchy map to philodoxia — love of honour — and the
    //  false judgement that status is a genuine good."
    traitIds: ['competition', 'hierarchy_dominance'],
    mode: 'diagnostic_sequence',
    narrowedSubSpecies: ['philodoxia'],
    falseJudgement: 'that status is a genuine good',
    impressionHint:
      'What is the impression driving this competitive impulse? Name the moment, not the mood.',
    falseBeliefHint:
      'What false belief about what constitutes security or worth is underneath it?',
    correctJudgementHint:
      'What is true about worth and security here, that the impression got wrong?',
  },
  {
    // "Resource acquisition maps to philoplousia — love of wealth — and the
    //  false judgement that possessions are genuine goods."
    traitIds: ['resource_acquisition'],
    mode: 'diagnostic_sequence',
    narrowedSubSpecies: ['philoplousia'],
    falseJudgement: 'that possessions are genuine goods',
    impressionHint:
      'What is the impression driving this acquisition impulse? Name the moment it arrived.',
    falseBeliefHint:
      'What is being treated as a genuine good here that is in fact a preferred indifferent?',
    correctJudgementHint:
      'What would be sufficient, and why is that not sufficient now?',
  },
  {
    // "Threat avoidance maps to phobos and its sub-species — agonia, timidity,
    //  shame."
    traitIds: ['threat_avoidance'],
    mode: 'diagnostic_sequence',
    narrowedSubSpecies: ['agonia', 'oknos', 'aischyne'],
    falseJudgement: 'that a preferred indifferent under threat is a genuine evil',
    impressionHint:
      'What is the impression of danger? Name what appeared threatened, and when.',
    falseBeliefHint:
      'Is the danger to something genuinely good, or to a preferred indifferent?',
    correctJudgementHint:
      'What is actually at risk here, and what is actually up to you?',
  },
  {
    // B4: a distinct mode, framed around the praxis failure mode. NOT routed
    // to /oikeiosis in v1; NOT omitted.
    traitIds: ['reciprocity'],
    mode: 'reciprocity',
    narrowedSubSpecies: [],
    falseJudgement:
      'that outwardly correct cooperation is sufficient, whatever it is grounded in',
    impressionHint:
      'What is the impression driving this cooperative impulse? Name the exchange, not the relationship.',
    falseBeliefHint: '',
    correctJudgementHint: '',
  },
] as const

/** The trait ids that carry a v1 pathway (a strict subset of TRAIT_IDS). */
export const WIRED_TRAIT_IDS: readonly string[] = EXAMINATION_PATHWAYS.flatMap(
  (p) => p.traitIds
)

/** Resolve a trait id to its pathway, or null if the trait is not wired in v1. */
export function pathwayForTrait(traitId: string): ExaminationPathway | null {
  return EXAMINATION_PATHWAYS.find((p) => p.traitIds.includes(traitId)) ?? null
}

/** The mode a trait's examination runs in, or null if the trait is not wired. */
export function modeForTrait(traitId: string): ExaminationMode | null {
  return pathwayForTrait(traitId)?.mode ?? null
}

/** The display name of a trait id (verbatim from the research), or the id. */
export function traitName(traitId: string): string {
  return PRIMAL_TRAITS.find((t) => t.id === traitId)?.name ?? traitId
}

// ===========================================================================
// THE GATE'S OUTPUT VOCABULARY
// ===========================================================================

/**
 * The ONE classification this tool performs: whether the practitioner's
 * IMPRESSION (step 1) is specific or general.
 *
 * The criterion is the mentor's own (synthesis Heading 4): *"the equivalent
 * mechanism is the practice of naming the specific impression that generated
 * the impulse. Not 'I felt competitive' but 'I felt competitive when X said Y,
 * because I interpreted it as a threat to Z.' The specificity is the evidence
 * of genuine examination rather than formulaic self-report."*
 *
 * NOTHING ELSE IS CLASSIFIED. In particular the CORRECT JUDGEMENT (step 5) is
 * never scored, ranked, graded, or classified — that would make the tool an
 * assessor of the practitioner's philosophy, which no sibling does and which
 * `/sage-compass`'s binding not-a-verdict constraint rules out by analogy.
 * The boundary test pins this at the classifier's signature AND at both of its
 * call sites' argument lists.
 */
export const IMPRESSION_SPECIFICITY_VALUES = ['specific', 'general'] as const
export type ImpressionSpecificity = (typeof IMPRESSION_SPECIFICITY_VALUES)[number]
