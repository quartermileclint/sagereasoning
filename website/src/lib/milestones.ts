/**
 * V3 Milestone definitions and check logic.
 *
 * Derived from V3's progress model (progress.json), passions taxonomy (passions.json),
 * and katorthoma proximity scale (scoring.json).
 *
 * V3 Derivation Notes (R6a):
 *   V1 milestones were based on numeric virtue scores (70+ in a virtue 3 times),
 *   tier-based milestones, and V1's 56-day journal count.
 *
 *   V3 milestones emerge from V3's progress model: qualitative markers like
 *   achieving a proximity level, Senecan grade transitions, passion reduction,
 *   oikeiosis extension, and V3's 55-day journal. Not numeric thresholds.
 *
 * Compliance:
 *   R1:  Milestones framed as philosophical practice markers, not therapeutic milestones.
 *   R6c: No numeric score thresholds — qualitative markers only.
 *   R8c: All user-facing text in English only.
 *   R9:  No outcome promises in milestone descriptions.
 */

import type { KatorthomaProximityLevel, OikeiosisStageId, SenecanGradeId } from './stoic-brain'

export interface MilestoneDefinition {
  id: string
  name: string
  description: string
  icon: string
  category: 'baseline' | 'proximity' | 'passion' | 'oikeiosis' | 'grade' | 'journal' | 'practice'
  quote?: string
}

export const MILESTONE_DEFINITIONS: MilestoneDefinition[] = [
  // ─── Baseline milestones ───
  {
    id: 'first_step',
    name: 'First Step',
    description: 'Completed baseline assessment',
    icon: '/images/sagelogosmall.PNG',
    category: 'baseline',
    quote: 'Self-awareness is where the work begins.',
  },

  // ─── Proximity milestones ───
  {
    id: 'first_deliberate',
    name: 'Deliberate Action',
    description: 'Achieved a Deliberate proximity evaluation',
    icon: '/images/sagelogo.PNG',
    category: 'proximity',
    quote: 'Decide who you want to be, then do what that requires.',
  },
  {
    id: 'first_principled',
    name: 'Principled Action',
    description: 'Achieved a Principled proximity evaluation',
    icon: '/images/sagelogo.PNG',
    category: 'proximity',
    quote: 'True freedom comes from mastering yourself.',
  },
  {
    id: 'consistent_deliberate',
    name: 'Consistent Practice',
    description: 'Achieved Deliberate or higher on 5 consecutive evaluations',
    icon: '/images/sagelogo.PNG',
    category: 'proximity',
    quote: 'Progress comes from working on yourself daily.',
  },

  // ─── Passion milestones ───
  {
    id: 'passion_awareness',
    name: 'Seeing Clearly',
    description: 'Had passions identified in 3 evaluations — recognising them is the first step',
    icon: '/images/owllogo.PNG',
    category: 'passion',
    quote: 'It is not events that disturb us, but our judgements about them.',
  },
  {
    id: 'first_zero_passions',
    name: 'Clear Judgement',
    description: 'Completed an evaluation with zero passions identified',
    icon: '/images/lotuslogo.PNG.png',
    category: 'passion',
    quote: 'The most powerful person is the one who has power over themselves.',
  },
  {
    id: 'passion_reduction',
    name: 'Quieting the Storm',
    description: 'Average passions per evaluation decreased over your last 10 actions',
    icon: '/images/lotuslogo.PNG.png',
    category: 'passion',
    quote: 'Your thoughts shape who you become.',
  },

  // ─── Oikeiosis milestones ───
  {
    id: 'oikeiosis_community',
    name: 'Expanding Circles',
    description: 'Engaged community-level concern in an evaluation',
    icon: '/images/scaleslogo.PNG',
    category: 'oikeiosis',
    quote: 'Justice is the highest expression of virtue.',
  },
  {
    id: 'oikeiosis_humanity',
    name: 'Cosmopolitan',
    description: 'Engaged humanity-level concern in an evaluation',
    icon: '/images/scaleslogo.PNG',
    category: 'oikeiosis',
    quote: 'Your concern now extends to all of humanity.',
  },

  // ─── Senecan grade milestones ───
  {
    id: 'grade_3_reached',
    name: 'Beginning the Path',
    description: 'Baseline placed at Third Grade or higher',
    icon: '/images/sagelogo.PNG',
    category: 'grade',
    quote: 'Stop arguing about what a good person should be. Be one.',
  },
  {
    id: 'grade_2_reached',
    name: 'Overcoming the Worst',
    description: 'Baseline placed at Second Grade or higher',
    icon: '/images/sagelogo.PNG',
    category: 'grade',
    quote: 'Sometimes even to live is an act of courage.',
  },
  {
    id: 'grade_1_reached',
    name: 'Approaching Wisdom',
    description: 'Baseline placed at First Grade',
    icon: '/images/sagelogo.PNG',
    category: 'grade',
    quote: 'The wise person acts according to all the virtues.',
  },

  // ─── Journal milestones (updated for V3's 55-day / 8-phase structure) ───
  {
    id: 'first_page',
    name: 'First Page',
    description: 'Completed the first journal entry',
    icon: '/images/sagelogosmall.PNG',
    category: 'journal',
    quote: 'Self-awareness is where the work begins.',
  },
  {
    id: 'examined_week',
    name: 'The Examined Week',
    description: 'Completed 7 journal entries',
    icon: '/images/sagelogo.PNG',
    category: 'journal',
    quote: 'An examined life is the foundation of growth.',
  },
  {
    id: 'foundation_layer',
    name: 'Foundation Layer',
    description: 'Completed Phase 1 of the journal (Days 1–7)',
    icon: '/images/sagelogo.PNG',
    category: 'journal',
    quote: 'Decide who you want to be, then do what that requires.',
  },
  {
    id: 'halfway_mark',
    name: 'Halfway Mark',
    description: 'Completed 28 journal entries',
    icon: '/images/sagelogo.PNG',
    category: 'journal',
    quote: 'Progress comes from working on yourself daily.',
  },
  {
    id: 'journal_complete',
    name: 'The Path Walked',
    description: 'Completed all 55 journal entries',
    icon: '/images/sagelogo.PNG',
    category: 'journal',
    quote: 'Stop arguing about what a good person should be. Be one.',
  },

  // ─── Practice milestones ───
  {
    id: 'examined_life',
    name: 'The Examined Life',
    description: 'Completed 7 daily reflections',
    icon: '/images/sagelogo.PNG',
    category: 'practice',
    quote: 'An examined life is the foundation of growth.',
  },
  {
    id: 'returning_practitioner',
    name: 'Returning Practitioner',
    description: 'Returned after 7+ days away and evaluated an action',
    icon: '/images/sagelogosmall.PNG',
    category: 'practice',
    quote: 'Every day is a fresh start. Begin now.',
  },
  {
    id: 'journal_return',
    name: 'Return to the Path',
    description: 'Resumed journaling after a 7+ day gap',
    icon: '/images/sagelogosmall.PNG',
    category: 'practice',
    quote: 'Every day is a fresh start. Begin now.',
  },
]

export const MILESTONE_MAP = Object.fromEntries(
  MILESTONE_DEFINITIONS.map(m => [m.id, m])
)

// ============================================================================
// V3 Milestone check logic
// ============================================================================

export interface V3MilestoneCheckData {
  earnedMilestoneIds: string[]

  // Baseline data
  hasBaseline: boolean
  senecanGrade?: SenecanGradeId

  // Action evaluation data
  evaluations: Array<{
    katorthoma_proximity: KatorthomaProximityLevel
    passions_detected: Array<{ name: string; root_passion: string }>
    oikeiosis_context?: string
    created_at: string
  }>

  // Reflection / practice data
  reflectionCount: number
  daysSinceLastAction: number | null

  // Journal data
  journalEntriesCompleted?: number
  journalPhase1Complete?: boolean
  daysSinceLastJournalEntry?: number | null
}

const PROXIMITY_RANK: Record<KatorthomaProximityLevel, number> = {
  reflexive: 0, habitual: 1, deliberate: 2, principled: 3, sage_like: 4,
}

export function checkNewMilestones(data: V3MilestoneCheckData): string[] {
  const newMilestones: string[] = []
  const earned = new Set(data.earnedMilestoneIds)

  function award(id: string) {
    if (!earned.has(id)) newMilestones.push(id)
  }

  // ─── Baseline milestones ───
  if (data.hasBaseline) {
    award('first_step')
  }

  // ─── Senecan grade milestones ───
  if (data.senecanGrade) {
    if (data.senecanGrade === 'grade_3' || data.senecanGrade === 'grade_2' || data.senecanGrade === 'grade_1') {
      award('grade_3_reached')
    }
    if (data.senecanGrade === 'grade_2' || data.senecanGrade === 'grade_1') {
      award('grade_2_reached')
    }
    if (data.senecanGrade === 'grade_1') {
      award('grade_1_reached')
    }
  }

  // ─── Proximity milestones ───
  const hasDeliberate = data.evaluations.some(e => PROXIMITY_RANK[e.katorthoma_proximity] >= 2)
  if (hasDeliberate) award('first_deliberate')

  const hasPrincipled = data.evaluations.some(e => PROXIMITY_RANK[e.katorthoma_proximity] >= 3)
  if (hasPrincipled) award('first_principled')

  // Consistent deliberate: 5 consecutive at deliberate or higher (sorted by created_at desc)
  if (data.evaluations.length >= 5) {
    const recent5 = data.evaluations.slice(0, 5)
    const allDeliberateOrHigher = recent5.every(e => PROXIMITY_RANK[e.katorthoma_proximity] >= 2)
    if (allDeliberateOrHigher) award('consistent_deliberate')
  }

  // ─── Passion milestones ───
  const evalsWithPassions = data.evaluations.filter(e =>
    Array.isArray(e.passions_detected) && e.passions_detected.length > 0
  )
  if (evalsWithPassions.length >= 3) award('passion_awareness')

  const hasZeroPassions = data.evaluations.some(e =>
    Array.isArray(e.passions_detected) && e.passions_detected.length === 0
  )
  if (hasZeroPassions) award('first_zero_passions')

  // Passion reduction: compare last 5 vs previous 5
  if (data.evaluations.length >= 10) {
    const recent5 = data.evaluations.slice(0, 5)
    const older5 = data.evaluations.slice(5, 10)
    const avgRecent = recent5.reduce((s, e) => s + (e.passions_detected?.length || 0), 0) / 5
    const avgOlder = older5.reduce((s, e) => s + (e.passions_detected?.length || 0), 0) / 5
    if (avgRecent < avgOlder) award('passion_reduction')
  }

  // ─── Oikeiosis milestones ───
  // Check if any evaluation mentions community or broader in oikeiosis_context
  // This is a simplified check — in production, this would come from the evaluation's oikeiosis data
  const hasComm = data.evaluations.some(e =>
    e.oikeiosis_context?.toLowerCase().includes('community') ||
    e.oikeiosis_context?.toLowerCase().includes('colleague') ||
    e.oikeiosis_context?.toLowerCase().includes('neighbour')
  )
  if (hasComm) award('oikeiosis_community')

  const hasHumanity = data.evaluations.some(e =>
    e.oikeiosis_context?.toLowerCase().includes('humanity') ||
    e.oikeiosis_context?.toLowerCase().includes('everyone') ||
    e.oikeiosis_context?.toLowerCase().includes('universal')
  )
  if (hasHumanity) award('oikeiosis_humanity')

  // ─── Practice milestones ───
  if (data.reflectionCount >= 7) award('examined_life')

  if (data.daysSinceLastAction !== null && data.daysSinceLastAction >= 7) {
    award('returning_practitioner')
  }

  // ─── Journal milestones ───
  const journalCount = data.journalEntriesCompleted ?? 0

  if (journalCount >= 1) award('first_page')
  if (journalCount >= 7) award('examined_week')
  if (data.journalPhase1Complete) award('foundation_layer')
  if (journalCount >= 28) award('halfway_mark')
  if (journalCount >= 55) award('journal_complete')

  if (data.daysSinceLastJournalEntry != null && data.daysSinceLastJournalEntry >= 7) {
    award('journal_return')
  }

  return newMilestones
}

// ============================================================================
// V1 DEPRECATED SHIMS — preserved for backward compatibility
// ============================================================================

/** @deprecated V1 type. Use V3MilestoneCheckData instead. */
export interface MilestoneCheckData {
  earnedMilestoneIds: string[]
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
  daysSinceLastAction: number | null
  journalEntriesCompleted?: number
  journalPhase1Complete?: boolean
  daysSinceLastJournalEntry?: number | null
}
