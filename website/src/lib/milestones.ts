/**
 * Milestone definitions and check logic for the SageReasoning gamification system.
 *
 * Every milestone requires demonstrated understanding, not time-on-platform.
 * Once earned, a milestone is never lost.
 */

export interface MilestoneDefinition {
  id: string
  name: string
  description: string
  icon: string        // path to virtue logo image
  virtue?: string     // which virtue this relates to, or undefined for general
  quote?: string      // stoic quote displayed when earned
}

export const MILESTONE_DEFINITIONS: MilestoneDefinition[] = [
  {
    id: 'first_step',
    name: 'First Step',
    description: 'Completed baseline assessment',
    icon: '/images/sagelogosmall.PNG',
    quote: '"The beginning of philosophy is self-awareness." — Epictetus',
  },
  {
    id: 'owls_eye',
    name: "Owl's Eye",
    description: 'Scored 70+ in Wisdom on 3 separate actions',
    icon: '/images/owllogo.PNG',
    virtue: 'wisdom',
    quote: '"No man is free who is not master of himself." — Epictetus',
  },
  {
    id: 'balanced_scales',
    name: 'Balanced Scales',
    description: 'Scored 70+ in Justice on 3 separate actions',
    icon: '/images/scaleslogo.PNG',
    virtue: 'justice',
    quote: '"Justice is the crowning glory of the virtues." — Cicero',
  },
  {
    id: 'lion_heart',
    name: 'Lion Heart',
    description: 'Scored 70+ in Courage on 3 separate actions',
    icon: '/images/lionlogo.PNG',
    virtue: 'courage',
    quote: '"Sometimes even to live is an act of courage." — Seneca',
  },
  {
    id: 'still_waters',
    name: 'Still Waters',
    description: 'Scored 70+ in Temperance on 3 separate actions',
    icon: '/images/lotuslogo.PNG.png',
    virtue: 'temperance',
    quote: '"He is most powerful who has power over himself." — Seneca',
  },
  {
    id: 'examined_life',
    name: 'The Examined Life',
    description: 'Completed 7 daily reflections',
    icon: '/images/sagelogo.PNG',
    quote: '"An unexamined life is not worth living." — Socrates',
  },
  {
    id: 'prokoptos',
    name: 'Prokoptos',
    description: 'Reached "Progressing" tier overall',
    icon: '/images/sagelogo.PNG',
    quote: '"Progress is not achieved by luck or accident, but by working on yourself daily." — Epictetus',
  },
  {
    id: 'returning_practitioner',
    name: 'Returning Practitioner',
    description: 'Returned after 7+ days away and scored an action',
    icon: '/images/sagelogosmall.PNG',
    quote: '"Begin at once to live, and count each separate day as a separate life." — Seneca',
  },
]

export const MILESTONE_MAP = Object.fromEntries(
  MILESTONE_DEFINITIONS.map(m => [m.id, m])
)

/**
 * Check which milestones a user has newly earned.
 * Returns milestone IDs that should be awarded (not already earned).
 */
export interface MilestoneCheckData {
  earnedMilestoneIds: string[]     // already earned
  actionScores: Array<{
    wisdom_score: number
    justice_score: number
    courage_score: number
    temperance_score: number
    total_score: number
    created_at: string
  }>
  reflectionCount: number
  hasBaseline: boolean
  avgTotal: number
  daysSinceLastAction: number | null  // null if this is first action
}

export function checkNewMilestones(data: MilestoneCheckData): string[] {
  const newMilestones: string[] = []
  const earned = new Set(data.earnedMilestoneIds)

  function award(id: string) {
    if (!earned.has(id)) newMilestones.push(id)
  }

  // First Step — baseline completed
  if (data.hasBaseline) {
    award('first_step')
  }

  // Virtue-specific milestones: 3 actions scoring 70+ in that virtue
  const virtueThreshold = 70
  const virtueCount = 3
  const virtueMilestones: Array<{ id: string; field: 'wisdom_score' | 'justice_score' | 'courage_score' | 'temperance_score' }> = [
    { id: 'owls_eye', field: 'wisdom_score' },
    { id: 'balanced_scales', field: 'justice_score' },
    { id: 'lion_heart', field: 'courage_score' },
    { id: 'still_waters', field: 'temperance_score' },
  ]

  for (const vm of virtueMilestones) {
    const qualifyingActions = data.actionScores.filter(a => a[vm.field] >= virtueThreshold)
    if (qualifyingActions.length >= virtueCount) {
      award(vm.id)
    }
  }

  // Examined Life — 7 reflections (not consecutive)
  if (data.reflectionCount >= 7) {
    award('examined_life')
  }

  // Prokoptos — average total >= 70 (Progressing tier)
  if (data.avgTotal >= 70) {
    award('prokoptos')
  }

  // Returning Practitioner — returned after 7+ day gap
  if (data.daysSinceLastAction !== null && data.daysSinceLastAction >= 7) {
    award('returning_practitioner')
  }

  return newMilestones
}
