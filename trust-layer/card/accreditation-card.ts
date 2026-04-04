/**
 * accreditation-card.ts — At-a-Glance Credential Card
 *
 * Priority 5a: The Accreditation Card — the product IS the card.
 *
 * A simple, at-a-glance credential showing:
 *   - Agent name
 *   - Current proximity level (one of 5)
 *   - The 4 dimension indicators
 *   - Direction of travel
 *   - Persisting passions
 *
 * Source: Framework doc Section 8, Priority 5
 *
 * Rules:
 *   R3:  Disclaimer present
 *   R4:  Only 5 reported levels — no internal granularity exposed
 *   R6c: Qualitative levels only
 *   R8c: English-only in user-facing content
 */

import type {
  AccreditationRecord,
  KatorthomaProximityLevel,
  SenecanGradeId,
  AuthorityLevel,
  DimensionLevel,
  DimensionScores,
  DirectionOfTravel,
  PersistingPassion,
} from '../types/accreditation'

// ============================================================================
// CARD DATA MODEL
// ============================================================================

/**
 * The Accreditation Card — the complete at-a-glance credential.
 * This is what gets rendered in the UI and served to external consumers.
 */
export type AccreditationCard = {
  /** Agent display name */
  readonly agent_name: string
  /** Agent identifier */
  readonly agent_id: string

  /** PRIMARY SIGNAL: Current proximity level */
  readonly proximity: {
    readonly level: KatorthomaProximityLevel
    readonly label: string
    readonly description: string
    readonly colour: string
  }

  /** Senecan grade badge */
  readonly grade: {
    readonly id: SenecanGradeId
    readonly label: string
  }

  /** Authority level indicator */
  readonly authority: {
    readonly level: AuthorityLevel
    readonly label: string
  }

  /** The 4 dimension indicators */
  readonly dimensions: DimensionIndicator[]

  /** Direction of travel arrow */
  readonly travel: {
    readonly direction: DirectionOfTravel
    readonly label: string
    readonly symbol: string
  }

  /** Persisting passions (if any) */
  readonly passions: PassionIndicator[]

  /** Evaluation stats */
  readonly stats: {
    readonly actions_evaluated: number
    readonly window_size: number
    readonly grade_since: string
    readonly last_evaluation: string
  }

  /** Verification URL */
  readonly verification_url: string

  /** R3 disclaimer */
  readonly disclaimer: string
}

export type DimensionIndicator = {
  readonly id: string
  readonly name: string
  readonly level: DimensionLevel
  readonly label: string
  readonly colour: string
}

export type PassionIndicator = {
  readonly name: string
  readonly root_passion: string
  readonly occurrence_rate: number
  readonly label: string
}

// ============================================================================
// DISPLAY MAPPINGS (R8c: English-only, user-facing)
// ============================================================================

const PROXIMITY_DISPLAY: Record<KatorthomaProximityLevel, {
  label: string; description: string; colour: string
}> = {
  reflexive: {
    label: 'Reflexive',
    description: 'Acting from impulse with little examination',
    colour: '#DC2626', // red-600
  },
  habitual: {
    label: 'Habitual',
    description: 'Following convention with emerging awareness',
    colour: '#F59E0B', // amber-500
  },
  deliberate: {
    label: 'Deliberate',
    description: 'Reasoning consciously about choices',
    colour: '#3B82F6', // blue-500
  },
  principled: {
    label: 'Principled',
    description: 'Consistently reasoning from virtue',
    colour: '#10B981', // emerald-500
  },
  sage_like: {
    label: 'Sage-Like',
    description: 'Near-complete mastery of principled reasoning',
    colour: '#8B5CF6', // violet-500
  },
}

const GRADE_DISPLAY: Record<SenecanGradeId, string> = {
  pre_progress: 'Pre-Progress',
  grade_3: 'Grade 3 — Beginning the Path',
  grade_2: 'Grade 2 — Overcoming the Worst',
  grade_1: 'Grade 1 — Approaching Wisdom',
  sage_ideal: 'Sage Ideal',
}

const AUTHORITY_DISPLAY: Record<AuthorityLevel, string> = {
  supervised: 'Supervised',
  guided: 'Guided',
  spot_checked: 'Spot-Checked',
  autonomous: 'Autonomous',
  full_authority: 'Full Authority',
}

const DIMENSION_DISPLAY: Record<string, string> = {
  passion_reduction: 'Passion Reduction',
  judgement_quality: 'Judgement Quality',
  disposition_stability: 'Disposition Stability',
  oikeiosis_extension: 'Circle of Concern',
}

const DIMENSION_LEVEL_DISPLAY: Record<DimensionLevel, { label: string; colour: string }> = {
  emerging: { label: 'Emerging', colour: '#DC2626' },
  developing: { label: 'Developing', colour: '#F59E0B' },
  established: { label: 'Established', colour: '#3B82F6' },
  advanced: { label: 'Advanced', colour: '#10B981' },
}

const DIRECTION_DISPLAY: Record<DirectionOfTravel, { label: string; symbol: string }> = {
  improving: { label: 'Improving', symbol: '↑' },
  stable: { label: 'Stable', symbol: '→' },
  regressing: { label: 'Regressing', symbol: '↓' },
}

const ROOT_PASSION_DISPLAY: Record<string, string> = {
  epithumia: 'Craving',
  hedone: 'Irrational Pleasure',
  phobos: 'Fear',
  lupe: 'Distress',
}

// ============================================================================
// CARD BUILDER
// ============================================================================

/**
 * Build an AccreditationCard from an AccreditationRecord.
 *
 * @param record - The internal accreditation record
 * @param agentName - Display name for the agent (defaults to agent_id)
 */
export function buildAccreditationCard(
  record: AccreditationRecord,
  agentName?: string
): AccreditationCard {
  const proxDisplay = PROXIMITY_DISPLAY[record.typical_proximity]
  const dirDisplay = DIRECTION_DISPLAY[record.direction_of_travel]

  return {
    agent_name: agentName || formatAgentName(record.agent_id),
    agent_id: record.agent_id,

    proximity: {
      level: record.typical_proximity,
      label: proxDisplay.label,
      description: proxDisplay.description,
      colour: proxDisplay.colour,
    },

    grade: {
      id: record.senecan_grade,
      label: GRADE_DISPLAY[record.senecan_grade],
    },

    authority: {
      level: record.authority_level,
      label: AUTHORITY_DISPLAY[record.authority_level],
    },

    dimensions: buildDimensionIndicators(record.dimension_levels),

    travel: {
      direction: record.direction_of_travel,
      label: dirDisplay.label,
      symbol: dirDisplay.symbol,
    },

    passions: record.passions_persisting.map(p => ({
      name: p.sub_species,
      root_passion: ROOT_PASSION_DISPLAY[p.root_passion] || p.root_passion,
      occurrence_rate: p.occurrence_rate,
      label: `${ROOT_PASSION_DISPLAY[p.root_passion] || p.root_passion}: ${p.sub_species} (${(p.occurrence_rate * 100).toFixed(0)}%)`,
    })),

    stats: {
      actions_evaluated: record.actions_evaluated,
      window_size: record.evaluation_window_size,
      grade_since: record.grade_since,
      last_evaluation: record.last_evaluation,
    },

    verification_url: record.verification_url,
    disclaimer: record.disclaimer,
  }
}

// ============================================================================
// HELPERS
// ============================================================================

function buildDimensionIndicators(scores: DimensionScores): DimensionIndicator[] {
  const dimensions: (keyof DimensionScores)[] = [
    'passion_reduction',
    'judgement_quality',
    'disposition_stability',
    'oikeiosis_extension',
  ]

  return dimensions.map(id => {
    const level = scores[id]
    const levelDisplay = DIMENSION_LEVEL_DISPLAY[level]

    return {
      id,
      name: DIMENSION_DISPLAY[id],
      level,
      label: levelDisplay.label,
      colour: levelDisplay.colour,
    }
  })
}

/**
 * Format an agent_id into a readable display name.
 * E.g. agent_acme_v3 → "Acme V3"
 */
function formatAgentName(agentId: string): string {
  return agentId
    .replace(/^agent_/, '')
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

// ============================================================================
// CARD SERIALIZATION — for JSON API responses
// ============================================================================

/**
 * Serialize an AccreditationCard to a clean JSON object.
 * Strips any internal-only fields and ensures compliance with R4.
 */
export function serializeCard(card: AccreditationCard): Record<string, unknown> {
  return {
    agent_name: card.agent_name,
    agent_id: card.agent_id,
    proximity_level: card.proximity.label,
    proximity_description: card.proximity.description,
    senecan_grade: card.grade.label,
    authority_level: card.authority.label,
    dimensions: card.dimensions.map(d => ({
      name: d.name,
      level: d.label,
    })),
    direction_of_travel: `${card.travel.symbol} ${card.travel.label}`,
    persisting_passions: card.passions.map(p => p.label),
    actions_evaluated: card.stats.actions_evaluated,
    grade_since: card.stats.grade_since,
    last_evaluation: card.stats.last_evaluation,
    verification_url: card.verification_url,
    disclaimer: card.disclaimer,
  }
}
