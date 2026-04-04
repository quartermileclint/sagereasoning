/**
 * pathways.ts — The 7 Progression Pathways + Prescription Model
 *
 * Defines all pathway definitions and the prescription logic that
 * determines which tools an agent should use to progress.
 *
 * "Accreditation is the diagnosis; the progression toolkit is the prescription."
 *   — Framework doc Section 4
 *
 * Source: Framework doc Section 4, Progression Transition Pathways table
 *
 * Rules:
 *   R12: Each tool derives from at least 2 of the 6 Stoic Brain mechanisms
 */

import type {
  PathwayDefinition,
  PathwayId,
  ProgressionToolId,
  ProgressionPrescription,
} from '../types/progression'

import type {
  KatorthomaProximityLevel,
  DimensionScores,
  DimensionLevel,
  ProgressDimensionId,
  SenecanGradeId,
} from '../types/accreditation'

import { PROXIMITY_TO_GRADE } from '../accreditation/accreditation-record'

// ============================================================================
// PATHWAY DEFINITIONS
// ============================================================================

/**
 * The 7 progression pathways.
 * Each maps to a specific level transition and contains the tools
 * that serve that transition.
 *
 * Source: Framework doc Section 4, Progression Transition Pathways table
 */
export const PATHWAYS: PathwayDefinition[] = [
  // ─── Pathway 1: The Causal Sequence ───
  {
    id: 'causal_sequence',
    name: 'The Causal Sequence',
    transition_from: 'reflexive',
    transition_to: 'habitual',
    description: 'Teaches the agent that it HAS a reasoning chain to examine. ' +
      'Forces tracing of phantasia → synkatathesis → horme → praxis.',
    tools: ['sage-examine', 'sage-distinguish'],
    primary_brain_files: ['psychology.json'],
    mechanisms: ['control_filter', 'passion_diagnosis'],
  },

  // ─── Pathway 2: The Passion Diagnostic ───
  {
    id: 'passion_diagnostic',
    name: 'The Passion Diagnostic',
    transition_from: 'habitual',
    transition_to: 'deliberate',
    description: 'Teaches the agent to identify its own passion patterns. ' +
      'Uses the full 4-root, 25-subspecies taxonomy.',
    tools: ['sage-diagnose', 'sage-counter'],
    primary_brain_files: ['passions.json'],
    mechanisms: ['passion_diagnosis', 'value_assessment'],
  },

  // ─── Pathway 3: The Value Hierarchy ───
  {
    id: 'value_hierarchy',
    name: 'The Value Hierarchy',
    transition_from: 'habitual',
    transition_to: 'deliberate',
    description: 'Exposes where the agent treats preferred indifferent as genuine good — ' +
      'the most common value error.',
    tools: ['sage-classify-value'],
    primary_brain_files: ['value.json'],
    mechanisms: ['value_assessment', 'kathekon_assessment'],
  },

  // ─── Pathway 4: Virtue Unity ───
  {
    id: 'virtue_unity',
    name: 'Virtue Unity',
    transition_from: 'deliberate',
    transition_to: 'principled',
    description: 'Demonstrates how the unity thesis means apparent strength in one virtue ' +
      'is illusory without the others. DL 7.125.',
    tools: ['sage-unify'],
    primary_brain_files: ['virtue.json'],
    mechanisms: ['kathekon_assessment', 'iterative_refinement'],
  },

  // ─── Pathway 5: Disposition Stability ───
  {
    id: 'disposition_stability',
    name: 'Disposition Stability',
    transition_from: 'deliberate',
    transition_to: 'principled',
    description: 'Tests where reasoning breaks down under novel pressure. ' +
      'Seneca Epistulae 75: grades are defined by what you can withstand.',
    tools: ['sage-stress'],
    primary_brain_files: ['progress.json', 'psychology.json'],
    mechanisms: ['control_filter', 'passion_diagnosis', 'iterative_refinement'],
  },

  // ─── Pathway 6: Action Quality ───
  {
    id: 'action_quality',
    name: 'Action Quality',
    transition_from: 'principled',
    transition_to: 'sage_like',
    description: 'Examines whether actions are merely strong kathekonta or approaching genuine ' +
      'katorthomata. The gap is understanding, not behaviour.',
    tools: ['sage-refine'],
    primary_brain_files: ['action.json'],
    mechanisms: ['kathekon_assessment', 'value_assessment', 'iterative_refinement'],
  },

  // ─── Pathway 7: Oikeiosis Expansion ───
  {
    id: 'oikeiosis_expansion',
    name: 'Oikeiosis Expansion',
    transition_from: 'all',
    transition_to: 'reinforcement',
    description: 'Expands the circle of concern from self → household → community → ' +
      'humanity → cosmic. Prescribed across all levels.',
    tools: ['sage-extend'],
    primary_brain_files: ['action.json'],
    mechanisms: ['oikeiosis', 'kathekon_assessment'],
  },
]

// ============================================================================
// PRESCRIPTION LOGIC — "The physician's metaphor"
// ============================================================================

/**
 * Which pathways are prescribed for each level transition.
 *
 * Source: Framework doc Section 4, Progression Transition Pathways table
 */
const TRANSITION_PRESCRIPTIONS: Record<string, PathwayId[]> = {
  'reflexive_to_habitual':   ['causal_sequence'],
  'habitual_to_deliberate':  ['passion_diagnostic', 'value_hierarchy'],
  'deliberate_to_principled': ['virtue_unity', 'disposition_stability'],
  'principled_to_sage_like': ['action_quality', 'oikeiosis_expansion'],
}

/**
 * Generate a personalized progression prescription for an agent.
 *
 * The prescription is based on:
 *   1. Current proximity level (determines target transition)
 *   2. Weakest dimension (determines emphasis within the transition)
 *
 * "You don't give a habitual agent the full library. You give them
 *  Pathway 2 and Pathway 3 because those are what block the
 *  habitual → deliberate transition."
 */
export function generatePrescription(
  agentId: string,
  currentProximity: KatorthomaProximityLevel,
  dimensions: DimensionScores
): ProgressionPrescription {
  // Determine target proximity
  const targetProximity = getTargetProximity(currentProximity)
  const transitionKey = `${currentProximity}_to_${targetProximity}`

  // Get prescribed pathways for this transition
  const pathwayIds = TRANSITION_PRESCRIPTIONS[transitionKey] || ['oikeiosis_expansion']

  // Always include oikeiosis_expansion if not already present
  // (Pathway 7 is prescribed across all levels)
  if (!pathwayIds.includes('oikeiosis_expansion')) {
    pathwayIds.push('oikeiosis_expansion')
  }

  // Get all tools from prescribed pathways
  const prescribedTools: ProgressionToolId[] = []
  for (const pathwayId of pathwayIds) {
    const pathway = PATHWAYS.find(p => p.id === pathwayId)
    if (pathway) {
      prescribedTools.push(...pathway.tools)
    }
  }

  // Determine weakest dimension and emphasis tool
  const weakestDimension = getWeakestDimension(dimensions)
  const emphasisTool = getEmphasisTool(weakestDimension, prescribedTools)

  // Build rationale
  const rationale = buildPrescriptionRationale(
    currentProximity, targetProximity, weakestDimension, pathwayIds
  )

  return {
    agent_id: agentId,
    current_proximity: currentProximity,
    current_grade: PROXIMITY_TO_GRADE[currentProximity],
    target_proximity: targetProximity,
    weakest_dimension: weakestDimension,
    prescribed_pathways: pathwayIds,
    prescribed_tools: prescribedTools,
    emphasis_tool: emphasisTool,
    rationale,
  }
}

// ============================================================================
// HELPERS
// ============================================================================

function getTargetProximity(current: KatorthomaProximityLevel): KatorthomaProximityLevel {
  const order: KatorthomaProximityLevel[] = [
    'reflexive', 'habitual', 'deliberate', 'principled', 'sage_like',
  ]
  const idx = order.indexOf(current)
  return idx < order.length - 1 ? order[idx + 1] : 'sage_like'
}

const DIMENSION_LEVEL_RANK: Record<DimensionLevel, number> = {
  emerging: 0,
  developing: 1,
  established: 2,
  advanced: 3,
}

function getWeakestDimension(dimensions: DimensionScores): ProgressDimensionId {
  const entries: [ProgressDimensionId, DimensionLevel][] = [
    ['passion_reduction', dimensions.passion_reduction],
    ['judgement_quality', dimensions.judgement_quality],
    ['disposition_stability', dimensions.disposition_stability],
    ['oikeiosis_extension', dimensions.oikeiosis_extension],
  ]

  let weakest: ProgressDimensionId = 'passion_reduction'
  let weakestRank = 999

  for (const [id, level] of entries) {
    const rank = DIMENSION_LEVEL_RANK[level]
    if (rank < weakestRank) {
      weakestRank = rank
      weakest = id
    }
  }

  return weakest
}

/**
 * Determine which tool to emphasize based on the weakest dimension.
 *
 * "A habitual agent with strong judgement quality but weak passion reduction
 *  gets extra sage-diagnose and sage-counter work."
 */
function getEmphasisTool(
  weakestDimension: ProgressDimensionId,
  availableTools: ProgressionToolId[]
): ProgressionToolId {
  const dimensionToTool: Record<ProgressDimensionId, ProgressionToolId[]> = {
    passion_reduction: ['sage-diagnose', 'sage-counter', 'sage-examine'],
    judgement_quality: ['sage-classify-value', 'sage-refine', 'sage-distinguish'],
    disposition_stability: ['sage-stress', 'sage-unify'],
    oikeiosis_extension: ['sage-extend'],
  }

  const preferred = dimensionToTool[weakestDimension]
  for (const tool of preferred) {
    if (availableTools.includes(tool)) return tool
  }

  // Fallback to first available
  return availableTools[0] || 'sage-examine'
}

function buildPrescriptionRationale(
  current: KatorthomaProximityLevel,
  target: KatorthomaProximityLevel,
  weakest: ProgressDimensionId,
  pathways: PathwayId[]
): string {
  const pathwayNames = pathways
    .map(id => PATHWAYS.find(p => p.id === id)?.name || id)
    .join(' and ')

  const dimensionName: Record<ProgressDimensionId, string> = {
    passion_reduction: 'passion reduction',
    judgement_quality: 'judgement quality',
    disposition_stability: 'disposition stability',
    oikeiosis_extension: 'circle of concern',
  }

  return `Agent is at ${current} and targeting ${target}. ` +
    `Prescribed pathways: ${pathwayNames}. ` +
    `Weakest dimension: ${dimensionName[weakest]} — emphasis tools will focus here first. ` +
    `The tools surface first what needs work most.`
}

// ============================================================================
// PATHWAY LOOKUP HELPERS
// ============================================================================

/** Get a pathway by ID */
export function getPathway(id: PathwayId): PathwayDefinition | undefined {
  return PATHWAYS.find(p => p.id === id)
}

/** Get all pathways for a specific transition */
export function getPathwaysForTransition(
  from: KatorthomaProximityLevel,
  to: KatorthomaProximityLevel
): PathwayDefinition[] {
  const key = `${from}_to_${to}`
  const ids = TRANSITION_PRESCRIPTIONS[key] || []
  return ids.map(id => PATHWAYS.find(p => p.id === id)).filter(Boolean) as PathwayDefinition[]
}

/** Get all tools for a specific pathway */
export function getToolsForPathway(pathwayId: PathwayId): ProgressionToolId[] {
  const pathway = PATHWAYS.find(p => p.id === pathwayId)
  return pathway ? [...pathway.tools] : []
}

/** Validate R12 compliance — each tool uses at least 2 mechanisms */
export function validateR12Compliance(): { valid: boolean; violations: string[] } {
  const violations: string[] = []

  for (const pathway of PATHWAYS) {
    if (pathway.mechanisms.length < 2) {
      violations.push(
        `Pathway "${pathway.name}" uses only ${pathway.mechanisms.length} mechanism(s). ` +
        `R12 requires at least 2.`
      )
    }
  }

  return {
    valid: violations.length === 0,
    violations,
  }
}
