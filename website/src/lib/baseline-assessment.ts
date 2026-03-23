// Baseline Stoic Assessment — 4 core questions + 1 conditional
// Answer options are shuffled per question so position does not correlate with score.
// Each answer has a unique ID for scoring lookup.

export interface AssessmentOption {
  id: string
  text: string
  scores: {
    primary: { virtue: 'wisdom' | 'justice' | 'courage' | 'temperance'; value: number }
    secondary: { virtue: string; value: number }[]
  }
}

export interface AssessmentQuestion {
  id: string
  virtue: 'wisdom' | 'justice' | 'courage' | 'temperance' | 'refinement'
  question: string
  options: AssessmentOption[]
}

export interface Q5Option {
  id: string
  text: string
  adjustment: number
}

export interface Q5Branch {
  id: string
  condition: string
  question: string
  options: Q5Option[]
}

// Q1 — Wisdom (30% weight)
// Option order: B, D, A, C (shuffled so best answer is position 3)
const Q1: AssessmentQuestion = {
  id: 'q1_wisdom',
  virtue: 'wisdom',
  question: 'When something goes wrong that you cannot change — a job loss, a health setback, a betrayal — where does your attention go first?',
  options: [
    {
      id: 'q1_b',
      text: 'To understanding why it happened, then shifting to what I can do',
      scores: {
        primary: { virtue: 'wisdom', value: 75 },
        secondary: [
          { virtue: 'courage', value: 60 },
          { virtue: 'temperance', value: 65 },
        ],
      },
    },
    {
      id: 'q1_d',
      text: 'To wishing it hadn\'t happened and replaying what could have been different',
      scores: {
        primary: { virtue: 'wisdom', value: 20 },
        secondary: [
          { virtue: 'courage', value: 20 },
          { virtue: 'temperance', value: 20 },
        ],
      },
    },
    {
      id: 'q1_a',
      text: 'To what I can still control: my response, my next step, my character',
      scores: {
        primary: { virtue: 'wisdom', value: 90 },
        secondary: [
          { virtue: 'courage', value: 70 },
          { virtue: 'temperance', value: 75 },
        ],
      },
    },
    {
      id: 'q1_c',
      text: 'To the feelings it creates — frustration, worry — before eventually moving forward',
      scores: {
        primary: { virtue: 'wisdom', value: 45 },
        secondary: [
          { virtue: 'courage', value: 38 },
          { virtue: 'temperance', value: 38 },
        ],
      },
    },
  ],
}

// Q2 — Justice (25% weight)
// Option order: C, A, D, B (shuffled so best answer is position 2)
const Q2: AssessmentQuestion = {
  id: 'q2_justice',
  virtue: 'justice',
  question: 'A decision you\'re about to make will benefit you significantly, but will disadvantage someone else who isn\'t aware of it. What do you do?',
  options: [
    {
      id: 'q2_c',
      text: 'I\'d go ahead but try to minimise the impact on them',
      scores: {
        primary: { virtue: 'justice', value: 50 },
        secondary: [
          { virtue: 'wisdom', value: 42 },
        ],
      },
    },
    {
      id: 'q2_a',
      text: 'I wouldn\'t proceed unless I could make it fair — their interests matter as much as mine',
      scores: {
        primary: { virtue: 'justice', value: 90 },
        secondary: [
          { virtue: 'wisdom', value: 75 },
          { virtue: 'courage', value: 65 },
          { virtue: 'temperance', value: 70 },
        ],
      },
    },
    {
      id: 'q2_d',
      text: 'Their situation is their responsibility — I focus on my own interests',
      scores: {
        primary: { virtue: 'justice', value: 20 },
        secondary: [
          { virtue: 'wisdom', value: 25 },
        ],
      },
    },
    {
      id: 'q2_b',
      text: 'I\'d tell them about the disadvantage and let them decide',
      scores: {
        primary: { virtue: 'justice', value: 78 },
        secondary: [
          { virtue: 'wisdom', value: 68 },
          { virtue: 'courage', value: 58 },
          { virtue: 'temperance', value: 58 },
        ],
      },
    },
  ],
}

// Q3 — Courage (25% weight)
// Option order: D, B, A, C (shuffled so best answer is position 3)
const Q3: AssessmentQuestion = {
  id: 'q3_courage',
  virtue: 'courage',
  question: 'You know the right thing to do, but doing it would cost you something you value — money, comfort, a relationship, or your reputation. What typically happens?',
  options: [
    {
      id: 'q3_d',
      text: 'I tend to protect what I have and wait for a better moment',
      scores: {
        primary: { virtue: 'courage', value: 20 },
        secondary: [
          { virtue: 'wisdom', value: 25 },
          { virtue: 'justice', value: 25 },
        ],
      },
    },
    {
      id: 'q3_b',
      text: 'I do what\'s right, but it takes real effort to push through the resistance',
      scores: {
        primary: { virtue: 'courage', value: 70 },
        secondary: [
          { virtue: 'wisdom', value: 62 },
          { virtue: 'justice', value: 58 },
          { virtue: 'temperance', value: 58 },
        ],
      },
    },
    {
      id: 'q3_a',
      text: 'I do what\'s right — the external cost doesn\'t change what\'s virtuous',
      scores: {
        primary: { virtue: 'courage', value: 90 },
        secondary: [
          { virtue: 'wisdom', value: 80 },
          { virtue: 'justice', value: 70 },
          { virtue: 'temperance', value: 75 },
        ],
      },
    },
    {
      id: 'q3_c',
      text: 'I usually find a middle ground that feels safer',
      scores: {
        primary: { virtue: 'courage', value: 45 },
        secondary: [
          { virtue: 'wisdom', value: 42 },
          { virtue: 'justice', value: 42 },
        ],
      },
    },
  ],
}

// Q4 — Temperance (20% weight)
// Option order: C, B, D, A (shuffled so best answer is position 4)
const Q4: AssessmentQuestion = {
  id: 'q4_temperance',
  virtue: 'temperance',
  question: 'When a strong emotion arises — anger at an insult, craving for something, anxiety about a loss — how do you typically respond?',
  options: [
    {
      id: 'q4_c',
      text: 'I often react first and reflect later',
      scores: {
        primary: { virtue: 'temperance', value: 40 },
        secondary: [
          { virtue: 'wisdom', value: 32 },
        ],
      },
    },
    {
      id: 'q4_b',
      text: 'I feel it strongly but usually manage to act reasonably after a pause',
      scores: {
        primary: { virtue: 'temperance', value: 70 },
        secondary: [
          { virtue: 'wisdom', value: 58 },
          { virtue: 'courage', value: 55 },
        ],
      },
    },
    {
      id: 'q4_d',
      text: 'My emotions usually drive my actions — I act on what I feel in the moment',
      scores: {
        primary: { virtue: 'temperance', value: 15 },
        secondary: [
          { virtue: 'wisdom', value: 15 },
        ],
      },
    },
    {
      id: 'q4_a',
      text: 'I notice the feeling, examine whether it reflects reality, and choose my response deliberately',
      scores: {
        primary: { virtue: 'temperance', value: 90 },
        secondary: [
          { virtue: 'wisdom', value: 80 },
          { virtue: 'courage', value: 70 },
        ],
      },
    },
  ],
}

export const CORE_QUESTIONS: AssessmentQuestion[] = [Q1, Q2, Q3, Q4]

// Q5 — Conditional branches
export const Q5_BRANCHES: { branchA: Q5Branch; branchB: Q5Branch } = {
  // Near Aware/Progressing boundary (score 65–74)
  branchA: {
    id: 'q5_branch_a',
    condition: 'score_65_74',
    question: 'When you succeed at something difficult, what is your first internal response?',
    options: [
      { id: 'q5a_b', text: 'Genuine pride, but I keep perspective and move on', adjustment: 3 },
      { id: 'q5a_c', text: 'Strong excitement — I want to celebrate and be recognised for it', adjustment: -3 },
      { id: 'q5a_a', text: 'Quiet satisfaction — the effort was its own reward', adjustment: 8 },
    ],
  },
  // Near Misaligned/Aware boundary (score 35–44)
  branchB: {
    id: 'q5_branch_b',
    condition: 'score_35_44',
    question: 'Do you believe being a good person matters more than being a successful one?',
    options: [
      { id: 'q5b_b', text: 'Ideally yes, but success matters too — they aren\'t mutually exclusive', adjustment: 3 },
      { id: 'q5b_a', text: 'Yes — my character is the one thing truly in my control', adjustment: 8 },
      { id: 'q5b_c', text: 'Success first — you can\'t help anyone from a weak position', adjustment: -5 },
    ],
  },
}

const VIRTUE_WEIGHTS = { wisdom: 0.30, justice: 0.25, courage: 0.25, temperance: 0.20 }
const BLEND_PRIMARY = 0.70
const BLEND_SECONDARY = 0.30

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
  answers: string[] // option IDs selected
}

export interface FinalBaselineResult extends BaselineResult {
  needs_q5: null
  q5_answer?: string
  interpretation: string
}

// Score after Q1–Q4
export function scoreCore(answerIds: string[]): BaselineResult {
  if (answerIds.length !== 4) throw new Error('Exactly 4 answers required')

  const allOptions = CORE_QUESTIONS.map((q, i) => {
    const opt = q.options.find(o => o.id === answerIds[i])
    if (!opt) throw new Error(`Invalid answer ID: ${answerIds[i]}`)
    return opt
  })

  // Collect primary scores
  const primary: Record<string, number> = { wisdom: 0, justice: 0, courage: 0, temperance: 0 }
  allOptions.forEach(opt => {
    primary[opt.scores.primary.virtue] = opt.scores.primary.value
  })

  // Collect secondary signals per virtue
  const secondaryBuckets: Record<string, number[]> = { wisdom: [], justice: [], courage: [], temperance: [] }
  allOptions.forEach(opt => {
    opt.scores.secondary.forEach(s => {
      secondaryBuckets[s.virtue].push(s.value)
    })
  })

  // Blend
  const blended: Record<string, number> = {}
  for (const virtue of Object.keys(primary)) {
    const secs = secondaryBuckets[virtue]
    if (secs.length > 0) {
      const avgSec = secs.reduce((a, b) => a + b, 0) / secs.length
      blended[virtue] = Math.round(primary[virtue] * BLEND_PRIMARY + avgSec * BLEND_SECONDARY)
    } else {
      blended[virtue] = primary[virtue]
    }
  }

  const total = Math.round(
    blended.wisdom * VIRTUE_WEIGHTS.wisdom +
    blended.justice * VIRTUE_WEIGHTS.justice +
    blended.courage * VIRTUE_WEIGHTS.courage +
    blended.temperance * VIRTUE_WEIGHTS.temperance
  )

  // Determine tier
  const alignment_tier = total >= 95 ? 'sage' : total >= 70 ? 'progressing' : total >= 40 ? 'aware' : total >= 15 ? 'misaligned' : 'contrary'

  // Strongest and growth
  const virtueEntries = Object.entries(blended).sort((a, b) => b[1] - a[1])
  const strongest_virtue = virtueEntries[0][0]
  const growth_area = virtueEntries[virtueEntries.length - 1][0]

  // Check if Q5 is needed
  let needs_q5: 'branch_a' | 'branch_b' | null = null
  if (total >= 65 && total <= 74) needs_q5 = 'branch_a'
  else if (total >= 35 && total <= 44) needs_q5 = 'branch_b'

  return {
    total_score: total,
    wisdom_score: blended.wisdom,
    justice_score: blended.justice,
    courage_score: blended.courage,
    temperance_score: blended.temperance,
    alignment_tier,
    strongest_virtue,
    growth_area,
    needs_q5,
    answers: answerIds,
  }
}

// Apply Q5 adjustment to finalize
export function applyQ5(result: BaselineResult, q5AnswerId: string): FinalBaselineResult {
  const branch = result.needs_q5 === 'branch_a' ? Q5_BRANCHES.branchA : Q5_BRANCHES.branchB
  const option = branch.options.find(o => o.id === q5AnswerId)
  if (!option) throw new Error(`Invalid Q5 answer ID: ${q5AnswerId}`)

  const adjusted = Math.max(0, Math.min(100, result.total_score + option.adjustment))
  const alignment_tier = adjusted >= 95 ? 'sage' : adjusted >= 70 ? 'progressing' : adjusted >= 40 ? 'aware' : adjusted >= 15 ? 'misaligned' : 'contrary'

  return {
    ...result,
    total_score: adjusted,
    alignment_tier,
    needs_q5: null,
    q5_answer: q5AnswerId,
    interpretation: generateInterpretation(adjusted, result.wisdom_score, result.justice_score, result.courage_score, result.temperance_score, result.strongest_virtue, result.growth_area, alignment_tier),
  }
}

// Finalize without Q5
export function finalizeWithoutQ5(result: BaselineResult): FinalBaselineResult {
  return {
    ...result,
    needs_q5: null,
    interpretation: generateInterpretation(result.total_score, result.wisdom_score, result.justice_score, result.courage_score, result.temperance_score, result.strongest_virtue, result.growth_area, result.alignment_tier),
  }
}

function generateInterpretation(
  total: number, wisdom: number, justice: number, courage: number, temperance: number,
  strongest: string, growth: string, tier: string
): string {
  const virtueNames: Record<string, string> = { wisdom: 'Wisdom', justice: 'Justice', courage: 'Courage', temperance: 'Temperance' }
  const virtueDescriptions: Record<string, string> = {
    wisdom: 'discernment about what is truly in your control',
    justice: 'fairness and concern for others\' wellbeing',
    courage: 'willingness to act rightly despite personal cost',
    temperance: 'measured, deliberate responses free from passion',
  }
  const growthAdvice: Record<string, string> = {
    wisdom: 'Practice pausing before reacting to ask: "Is this within my control?" Direct your energy only toward what you can influence.',
    justice: 'Before decisions that affect others, ask: "Am I treating everyone involved as I would want to be treated?"',
    courage: 'Deliberately choose the harder right action in low-stakes situations to build the habit of acting from virtue.',
    temperance: 'When a strong emotion arises, pause and name it before acting. Ask: "Is this impulse or reason speaking?"',
  }

  const tierIntros: Record<string, string> = {
    sage: 'Your baseline reflects exceptional alignment with Stoic virtue across all four dimensions.',
    progressing: 'You show consistent virtue in your reasoning and behaviour, with a clear foundation to build on.',
    aware: 'You have genuine awareness of virtue but are still working to apply it consistently under pressure.',
    misaligned: 'Your baseline suggests that external concerns often override virtue in your decision-making — but awareness is the first step toward change.',
    contrary: 'Your responses suggest significant distance from Stoic virtue — the path forward begins with understanding what is truly in your control.',
  }

  return `${tierIntros[tier]} Your strongest virtue is ${virtueNames[strongest]} (${virtueDescriptions[strongest]}). Your growth edge is ${virtueNames[growth]}. ${growthAdvice[growth]}`
}

// Retake eligibility: 30 days from last assessment
export const RETAKE_INTERVAL_DAYS = 30

export function getRetakeEligibleDate(lastAssessmentDate: string): Date {
  const last = new Date(lastAssessmentDate)
  last.setDate(last.getDate() + RETAKE_INTERVAL_DAYS)
  return last
}

export function isRetakeEligible(lastAssessmentDate: string): boolean {
  return new Date() >= getRetakeEligibleDate(lastAssessmentDate)
}
