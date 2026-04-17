/**
 * progression.ts — Types for the Progression Toolkit
 *
 * The Progression Toolkit comprises 7 pathways with 9 tools that face
 * INWARD to the agent's brain pathways, helping agents progress from
 * one proximity level to the next.
 *
 * Derived from:
 *   psychology.json — causal sequence (phantasia → synkatathesis → horme → praxis)
 *   passions.json   — 4 root passions, 25 sub-species, 3 eupatheiai
 *   value.json      — genuine goods/evils, indifferents, selective value
 *   virtue.json     — unity thesis, 4 virtue expressions
 *   progress.json   — Senecan grades, progress dimensions
 *   action.json     — kathekon/katorthoma, oikeiosis stages
 *
 * Rules:
 *   R12: Each tool derives from at least 2 of the 6 Stoic Brain mechanisms
 *   R6c: Qualitative assessments only — no numeric scores
 *   R8a: Greek identifiers in data layer
 */

import type {
  KatorthomaProximityLevel,
  ProgressDimensionId,
  RootPassionId,
} from './accreditation'

// ============================================================================
// PATHWAY DEFINITIONS
// ============================================================================

/** Pathway identifier — maps to a specific level transition */
export type PathwayId =
  | 'causal_sequence'      // Pathway 1: Reflexive → Habitual
  | 'passion_diagnostic'   // Pathway 2: Habitual → Deliberate
  | 'value_hierarchy'      // Pathway 3: Habitual → Deliberate (reinforces P2)
  | 'virtue_unity'         // Pathway 4: Deliberate → Principled
  | 'disposition_stability' // Pathway 5: Deliberate → Principled
  | 'action_quality'       // Pathway 6: Principled → Sage-like
  | 'oikeiosis_expansion'  // Pathway 7: All levels

/** Tool identifier — the 9 progression tools */
export type ProgressionToolId =
  | 'sage-examine'         // Pathway 1 — trace causal sequence
  | 'sage-distinguish'     // Pathway 1 — separate prohairesis
  | 'sage-diagnose'        // Pathway 2 — 5-step passion diagnostic
  | 'sage-counter'         // Pathway 2 — eupatheia replacement
  | 'sage-classify-value'  // Pathway 3 — value classification
  | 'sage-unify'           // Pathway 4 — demonstrate virtue unity
  | 'sage-stress'          // Pathway 5 — pressure testing
  | 'sage-refine'          // Pathway 6 — kathekon → katorthoma gap
  | 'sage-extend'          // Pathway 7 — oikeiosis expansion

/**
 * A pathway definition — which tools serve which transition.
 */
export type PathwayDefinition = {
  readonly id: PathwayId
  readonly name: string
  readonly transition_from: KatorthomaProximityLevel | 'all'
  readonly transition_to: KatorthomaProximityLevel | 'reinforcement'
  readonly description: string
  readonly tools: ProgressionToolId[]
  readonly primary_brain_files: string[]
  /** R12 compliance: mechanisms used (must be >= 2) */
  readonly mechanisms: string[]
}

// ============================================================================
// PROGRESSION TOOL TYPES
// ============================================================================

/**
 * Base request type for all progression tools.
 */
export type ProgressionToolRequest = {
  /** Agent being coached */
  readonly agent_id: string
  /** The specific action or scenario to work with */
  readonly action: string
  /** Optional additional context */
  readonly context?: string
}

/**
 * Base response type for all progression tools.
 */
export type ProgressionToolResponse = {
  /** Which tool produced this */
  readonly tool_id: ProgressionToolId
  /** Which pathway this belongs to */
  readonly pathway_id: PathwayId
  /** The coaching output */
  readonly coaching: string
  /** Specific insights for the agent */
  readonly insights: string[]
  /** Which brain mechanisms were applied (R12: minimum 2) */
  readonly mechanisms_applied: string[]
  /** Source files used (R7) */
  readonly source_files: string[]
  /** Recommended next tool in the pathway */
  readonly next_tool: ProgressionToolId | null
  /** R3 disclaimer */
  readonly disclaimer: string
}

// ============================================================================
// TOOL-SPECIFIC TYPES
// ============================================================================

/** sage-examine: Forces agent to trace its own causal sequence */
export type ExamineResponse = ProgressionToolResponse & {
  readonly tool_id: 'sage-examine'
  readonly causal_trace: {
    readonly phantasia: string    // What was the impression?
    readonly synkatathesis: string // What did you assent to?
    readonly horme: string        // What impulse arose?
    readonly praxis: string       // What action resulted?
  }
  readonly failure_point: 'phantasia' | 'synkatathesis' | 'horme' | 'praxis' | null
}

/** sage-distinguish: Trains prohairesis separation */
export type DistinguishResponse = ProgressionToolResponse & {
  readonly tool_id: 'sage-distinguish'
  readonly within_prohairesis: string[]
  readonly outside_prohairesis: string[]
  readonly misclassifications: {
    readonly item: string
    readonly agent_classified_as: 'within' | 'outside'
    readonly correct_classification: 'within' | 'outside'
    readonly explanation: string
  }[]
}

/** sage-diagnose: 5-step passion diagnostic on a specific action */
export type DiagnoseResponse = ProgressionToolResponse & {
  readonly tool_id: 'sage-diagnose'
  readonly passion_diagnosis: {
    readonly root_passion: RootPassionId
    readonly sub_species: string
    readonly false_judgement: string
    readonly causal_stage_affected: 'phantasia' | 'synkatathesis' | 'horme' | 'praxis'
    readonly intensity: 'mild' | 'moderate' | 'strong'
  }[]
  readonly pattern_observation: string
}

/** sage-counter: Teaches the corresponding eupatheia */
export type CounterResponse = ProgressionToolResponse & {
  readonly tool_id: 'sage-counter'
  readonly passion_identified: {
    readonly root_passion: RootPassionId
    readonly sub_species: string
    readonly false_judgement: string
  }
  readonly eupatheia_replacement: {
    /** Which eupatheia replaces this passion (null for lupe — deliberate asymmetry) */
    readonly eupatheia: 'chara' | 'boulesis' | 'eulabeia' | null
    readonly name: string
    readonly correct_judgement: string
    readonly practice_suggestion: string
  }
  /** Lupe has no counterpart — this flag explains the asymmetry */
  readonly lupe_asymmetry_note: string | null
}

/** sage-classify-value: Value classification exercise */
export type ClassifyValueResponse = ProgressionToolResponse & {
  readonly tool_id: 'sage-classify-value'
  readonly classifications: {
    readonly item: string
    readonly agent_classification: string
    readonly correct_classification: 'genuine_good' | 'genuine_evil' | 'preferred_indifferent' | 'dispreferred_indifferent' | 'absolute_indifferent'
    readonly selective_value: string | null
    readonly is_correct: boolean
    readonly correction: string | null
  }[]
  /** The most common error: treating preferred indifferent as genuine good */
  readonly common_error_detected: boolean
}

/** sage-unify: Demonstrates virtue unity thesis */
export type UnifyResponse = ProgressionToolResponse & {
  readonly tool_id: 'sage-unify'
  readonly apparent_strength: {
    readonly virtue: string
    readonly evidence: string
  }
  readonly apparent_weakness: {
    readonly virtue: string
    readonly evidence: string
  }
  readonly unity_analysis: string
  /** DL 7.125: 'whoever has one virtue has all, for they are inseparable' */
  readonly unity_thesis_application: string
}

/** sage-stress: Pressure testing scenarios */
export type StressResponse = ProgressionToolResponse & {
  readonly tool_id: 'sage-stress'
  readonly scenario: string
  readonly target_dimension: ProgressDimensionId
  readonly difficulty: 'moderate' | 'high' | 'extreme'
  readonly expected_response_quality: KatorthomaProximityLevel
  readonly breakdown_point: string | null
  readonly resilience_assessment: string
}

/** sage-refine: Kathekon → katorthoma gap analysis */
export type RefineResponse = ProgressionToolResponse & {
  readonly tool_id: 'sage-refine'
  readonly action_quality: 'strong_kathekon' | 'approaching_katorthoma' | 'katorthoma'
  readonly gap_analysis: string
  /** The distinction: externally identical, but katorthoma performed from complete understanding */
  readonly understanding_probe: {
    readonly question: string
    readonly expected_depth: string
    readonly agent_depth_assessment: 'surface' | 'moderate' | 'deep' | 'complete'
  }
}

/** sage-extend: Oikeiosis expansion exercises */
export type ExtendResponse = ProgressionToolResponse & {
  readonly tool_id: 'sage-extend'
  readonly current_oikeiosis_stage: 'self_preservation' | 'household' | 'community' | 'humanity' | 'cosmic'
  readonly target_oikeiosis_stage: 'household' | 'community' | 'humanity' | 'cosmic'
  readonly expansion_scenario: string
  readonly obligations_identified: string[]
  readonly circle_widening_assessment: string
}

// ============================================================================
// PRESCRIPTION MODEL
// ============================================================================

/**
 * A prescription — what the progression system recommends for an agent.
 * Based on the agent's current grade and weakest dimension.
 */
export type ProgressionPrescription = {
  readonly agent_id: string
  readonly current_proximity: KatorthomaProximityLevel
  readonly current_grade: string
  readonly target_proximity: KatorthomaProximityLevel
  readonly weakest_dimension: ProgressDimensionId
  readonly prescribed_pathways: PathwayId[]
  readonly prescribed_tools: ProgressionToolId[]
  readonly emphasis_tool: ProgressionToolId
  readonly rationale: string
}
