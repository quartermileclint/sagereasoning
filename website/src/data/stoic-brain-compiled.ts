/**
 * stoic-brain-compiled.ts — Stoic Brain JSON compiled as TypeScript constants.
 *
 * These are CONDENSED versions of the 8 Stoic Brain JSON files optimized for
 * LLM context injection. Full source files live in /stoic-brain/ at repo root.
 *
 * Token budget: ~500-1000 tokens per mechanism context block.
 * Total ceiling: 3000 tokens (quick depth), 6000 tokens (deep depth).
 *
 * Generated from Stoic Brain v3.0.0 (2026-03-31)
 */

export const PSYCHOLOGY_CONTEXT = {
  causal_sequence: [
    {
      stage: 1,
      id: "phantasia",
      name: "Impression / Presentation",
      failure_mode: "Distorted impression — seeing danger where there is none, or seeing good where there is none.",
    },
    {
      stage: 2,
      id: "synkatathesis",
      name: "Assent",
      failure_mode: "Hasty assent — accepting a false impression as true without examination.",
    },
    {
      stage: 3,
      id: "horme",
      name: "Impulse",
      failure_mode: "Excessive impulse (pathos) — impulse that exceeds due measure.",
    },
    {
      stage: 4,
      id: "praxis",
      name: "Action",
      failure_mode: "Action from passion — externally correct behaviour driven by wrong reasons.",
    },
  ],
  ruling_faculty: {
    id: "hegemonikon",
    description: "The rational, commanding part of the soul that receives impressions, grants assent, and generates impulses.",
  },
  impulse_taxonomy: [
    { id: "prothesis", name: "Intention" },
    { id: "epibole", name: "Grasping" },
    { id: "paraskue", name: "Preparation" },
    { id: "engeiresis", name: "Undertaking" },
    { id: "hairesis", name: "Choice" },
    { id: "prohairesis", name: "Moral Choice" },
    { id: "boulesis", name: "Rational Wish" },
    { id: "thelesis", name: "Willing" },
  ],
} as const;

export const PASSIONS_CONTEXT = {
  four_root_passions: {
    epithumia: {
      id: "epithumia",
      name: "Craving / Irrational Desire",
      root_passion: "future_apparent_good",
      sub_species: [
        { id: "orge", name: "Anger" },
        { id: "eros", name: "Erotic Passion" },
        { id: "pothos", name: "Longing" },
        { id: "philedonia", name: "Love of Pleasure" },
        { id: "philoplousia", name: "Love of Wealth" },
        { id: "philodoxia", name: "Love of Honour" },
      ],
    },
    hedone: {
      id: "hedone",
      name: "Irrational Pleasure",
      root_passion: "present_apparent_good",
      sub_species: [
        { id: "kelesis", name: "Enchantment" },
        { id: "epichairekakia", name: "Malicious Joy" },
        { id: "terpsis", name: "Excessive Amusement" },
      ],
    },
    phobos: {
      id: "phobos",
      name: "Fear / Irrational Shrinking",
      root_passion: "future_apparent_evil",
      sub_species: [
        { id: "deima", name: "Terror" },
        { id: "oknos", name: "Timidity" },
        { id: "aischyne", name: "Shame" },
        { id: "thambos", name: "Dread" },
        { id: "thorybos", name: "Panic" },
        { id: "agonia", name: "Agony" },
      ],
    },
    lupe: {
      id: "lupe",
      name: "Distress / Irrational Pain",
      root_passion: "present_apparent_evil",
      sub_species: [
        { id: "eleos", name: "Pity" },
        { id: "phthonos", name: "Envy" },
        { id: "zelotypia", name: "Jealousy" },
        { id: "penthos", name: "Grief" },
        { id: "achos", name: "Anxiety" },
      ],
    },
  },
  diagnostic_sequence: [
    "1. Was the agent's impression of the situation distorted? If so, by which of the 4 root passions?",
    "2. Did the agent assent to a false impression? Which false belief drove the assent?",
    "3. Did the impulse exceed what reason warranted? (Zeno's definition: impulse exceeding due measure)",
    "4. Which specific sub-species was operative? (Not just 'fear' but 'timidity' or 'shame')",
    "5. What is the corresponding correct judgement that would replace the false one?",
  ],
  three_good_feelings: [
    {
      id: "chara",
      name: "Joy / Rational Gladness",
      replaces: "hedone (irrational pleasure)",
    },
    {
      id: "boulesis",
      name: "Rational Wish",
      replaces: "epithumia (craving)",
    },
    {
      id: "eulabeia",
      name: "Rational Caution",
      replaces: "phobos (fear)",
    },
  ],
} as const;

export const VIRTUE_CONTEXT = {
  unity_thesis: "All four virtues are unified and co-dependent — you cannot possess one without all.",
  four_expressions: [
    {
      id: "phronesis",
      name: "Practical Wisdom",
      domain: "What is genuinely good, bad, and indifferent",
      sub_expressions: [
        { id: "euboulia", name: "Good Deliberation" },
        { id: "synesis", name: "Good Understanding" },
        { id: "anchinoia", name: "Quick-Wittedness" },
        { id: "pronoia", name: "Foresight" },
      ],
    },
    {
      id: "dikaiosyne",
      name: "Justice",
      domain: "What is owed to others — distributing to each their due",
      sub_expressions: [
        { id: "eusebeia", name: "Piety" },
        { id: "chrestotes", name: "Benevolence" },
        { id: "koinonike", name: "Social Participation" },
        { id: "epieikeia", name: "Fair Dealing" },
      ],
    },
    {
      id: "andreia",
      name: "Courage",
      domain: "What is genuinely fearful and what is not",
      sub_expressions: [
        { id: "karteria", name: "Endurance" },
        { id: "tharsos", name: "Confidence" },
        { id: "megalopsychia", name: "Magnanimity" },
        { id: "philoponia", name: "Industriousness" },
      ],
    },
    {
      id: "sophrosyne",
      name: "Temperance / Self-Mastery",
      domain: "What to choose and what to avoid — ordering impulse and desire",
      sub_expressions: [
        { id: "eutaxia", name: "Orderliness" },
        { id: "kosmiotetes", name: "Propriety" },
        { id: "enkrateia", name: "Self-Mastery" },
        { id: "aidos", name: "Modesty / Reverence" },
      ],
    },
  ],
} as const;

export const VALUE_CONTEXT = {
  hierarchy: "Only virtue is genuinely good. Only vice is genuinely evil. Everything else is indifferent with varying degrees of selective value (axia).",
  preferred_indifferents: [
    { id: "life", name: "Life", axia: "high" },
    { id: "health", name: "Health", axia: "high" },
    { id: "strength", name: "Strength", axia: "moderate" },
    { id: "beauty", name: "Beauty", axia: "low" },
    { id: "intact_senses", name: "Intact Senses", axia: "high" },
    { id: "wealth", name: "Wealth", axia: "moderate" },
    { id: "reputation", name: "Good Reputation", axia: "moderate" },
    { id: "noble_birth", name: "Noble Birth", axia: "low" },
    { id: "freedom", name: "Freedom", axia: "high" },
    { id: "friendship", name: "Friendship", axia: "high" },
    { id: "knowledge", name: "Knowledge", axia: "high" },
    { id: "natural_ability", name: "Natural Ability", axia: "moderate" },
  ],
  dispreferred_indifferents: [
    { id: "death", name: "Death", axia: "high-negative" },
    { id: "disease", name: "Disease", axia: "high-negative" },
    { id: "pain", name: "Pain", axia: "moderate-negative" },
    { id: "disability", name: "Disability", axia: "moderate-negative" },
    { id: "ugliness", name: "Ugliness", axia: "low-negative" },
    { id: "poverty", name: "Poverty", axia: "moderate-negative" },
    { id: "dishonour", name: "Dishonour", axia: "moderate-negative" },
    { id: "exile", name: "Exile", axia: "moderate-negative" },
    { id: "low_birth", name: "Low Birth", axia: "low-negative" },
    { id: "loneliness", name: "Isolation / Friendlessness", axia: "moderate-negative" },
  ],
  selection_principles: [
    "Select what is kata physin (according to nature) over what is para physin (against nature)",
    "Among preferred indifferents, select based on degree of selective value (axia)",
    "Select what serves one's kathekonta (appropriate actions) in current roles",
    "NEVER select an indifferent at the cost of virtue — the honourable always prevails",
    "The sage selects (eklegetai) preferred indifferents — they do not desire (oregetai) them",
  ],
} as const;

export const ACTION_CONTEXT = {
  two_layers: {
    kathekon: {
      id: "kathekon",
      name: "Appropriate Action",
      definition: "That which accords with life and has a reasonable justification when done.",
    },
    katorthoma: {
      id: "katorthoma",
      name: "Right Action / Perfect Action",
      definition: "The same external action as kathekon, but performed from complete understanding and unified virtue.",
    },
  },
  oikeiosis_sequence: [
    {
      stage: 1,
      id: "self",
      name: "Self-Preservation",
      description: "The newborn's instinctive drive toward self-preservation and preference for its own constitution.",
    },
    {
      stage: 2,
      id: "family",
      name: "Family and Intimates",
      description: "Affiliation extends to parents, children, spouse, siblings, and close friends.",
    },
    {
      stage: 3,
      id: "community",
      name: "City and Political Community",
      description: "Affiliation extends to fellow citizens and the political order.",
    },
    {
      stage: 4,
      id: "humanity",
      name: "All Rational Beings",
      description: "Recognising all humans as fellow citizens of the cosmos sharing divine reason.",
    },
    {
      stage: 5,
      id: "cosmos",
      name: "The Rational Cosmos",
      description: "The sage's affiliation extends to the cosmos itself — aligning one's will with the rational order of nature.",
    },
  ],
  deliberation_framework: [
    {
      id: "Q1",
      question: "Is the action honourable (honestum / to kalon)?",
    },
    {
      id: "Q2",
      question: "Between two honourable options, which is MORE honourable?",
    },
    {
      id: "Q3",
      question: "Is the action advantageous (utile)?",
    },
    {
      id: "Q4",
      question: "Between two advantageous options, which is MORE advantageous?",
    },
    {
      id: "Q5",
      question: "When the honourable conflicts with the advantageous, which prevails?",
    },
  ],
} as const;

export const PROGRESS_CONTEXT = {
  binary_foundation: {
    sage: {
      description: "The perfectly wise person (sophos/sapiens). Possesses unified virtue as a stable disposition.",
      characteristics: [
        "Unified virtue — all four expressions inseparable",
        "Freedom from destructive passions — apatheia",
        "Cognitive grasp (katalepsis) — no false beliefs",
        "Internal freedom — prohairesis cannot be constrained",
        "Cosmopolitan citizenship — oikeiosis fully extended",
        "Right action (katorthoma) — not merely appropriate action",
      ],
    },
  },
  progress_gradient: [
    {
      id: "grade_1",
      name: "First Grade — Approaching Wisdom",
      indicators: [
        "Most passions overcome but not all",
        "Understanding is strong but not yet complete",
        "Can still relapse under extreme testing",
        "Disposition approaching hexis but not yet fully stable",
      ],
    },
    {
      id: "grade_2",
      name: "Second Grade — Overcoming the Worst",
      indicators: [
        "Major passions checked but minor ones still operative",
        "Good judgement in familiar situations",
        "Can be thrown off by novel or extreme circumstances",
        "Regular philosophical practice maintaining progress",
      ],
    },
    {
      id: "grade_3",
      name: "Third Grade — Beginning the Path",
      indicators: [
        "Some passions overcome, others still dominant",
        "Awareness of philosophical principles but inconsistent application",
        "Progress is real but uneven",
        "Subject to regression when tested",
      ],
    },
  ],
  progress_metrics: [
    {
      id: "passion_reduction",
      name: "Reduction of Passions",
      description: "Are fewer passions operative? Are they less intense? Are the sub-species narrowing?",
    },
    {
      id: "judgement_quality",
      name: "Quality of Judgement",
      description: "Is the agent's understanding of what is good, bad, and indifferent becoming more accurate?",
    },
    {
      id: "disposition_stability",
      name: "Stability of Disposition",
      description: "Is the agent's commitment to virtue becoming more stable (approaching hexis)?",
    },
    {
      id: "oikeiosis_extension",
      name: "Extension of Natural Affiliation",
      description: "Is the agent's circle of concern expanding?",
    },
  ],
} as const;

export const SCORING_CONTEXT = {
  evaluation_sequence: [
    {
      stage: 1,
      id: "control_filter",
      name: "Prohairesis Filter",
      question: "What was and was not within the agent's moral choice (prohairesis)?",
    },
    {
      stage: 2,
      id: "kathekon_evaluation",
      name: "Appropriate Action Assessment",
      question: "Is this action a kathekon — an appropriate action for which a reasonable justification can be given?",
    },
    {
      stage: 3,
      id: "passion_diagnosis",
      name: "Passion Diagnosis",
      question: "Which passions, if any, distorted the agent's impression, assent, or impulse?",
    },
    {
      stage: 4,
      id: "virtue_quality",
      name: "Unified Virtue Assessment",
      question: "How close is the agent's disposition to the sage ideal?",
    },
  ],
  katorthoma_proximity_scale: [
    {
      id: "reflexive",
      name: "Reflexive",
      description: "Action from pure impulse with no deliberation. Passion dominates completely.",
    },
    {
      id: "habitual",
      name: "Habitual",
      description: "Action from social convention or habit, not from understanding.",
    },
    {
      id: "deliberate",
      name: "Deliberate",
      description: "Action from conscious reasoning, with some understanding of the rational foundation.",
    },
    {
      id: "principled",
      name: "Principled",
      description: "Action from stable commitment to virtue, with strong understanding and minimal passion.",
    },
    {
      id: "sage_like",
      name: "Sage-Like (Katorthoma)",
      description: "Action from perfected understanding and unified virtue. Complete freedom from destructive passion.",
    },
  ],
} as const;

export const STOIC_BRAIN_FOUNDATIONS = {
  core_premise: "The only genuine good is virtue (arete). The only genuine evil is vice (kakia). Everything else is indifferent. Flourishing (eudaimonia) is achieved by living in agreement with nature, which means living according to virtue.",
  dichotomy_of_control: {
    up_to_us: [
      "judgements (hypolepseis)",
      "impulses (hormai)",
      "desires (orexeis)",
      "aversions (ekkliseis)",
      "assent (synkatathesis)",
      "moral choice (prohairesis)",
      "character (ethos)",
    ],
    not_up_to_us: [
      "body (soma)",
      "reputation (doxa)",
      "possessions (ktemata)",
      "external events",
      "other people's actions",
      "death (thanatos)",
    ],
  },
  flourishing: "Living and acting in agreement with nature. Not a feeling of happiness but the objective quality of a life fully expressed through virtue.",
} as const;
