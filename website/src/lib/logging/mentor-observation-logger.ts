/**
 * mentor-observation-logger.ts — Structured Mentor Observation Logging
 *
 * Replaces the previous pass-through pattern where raw LLM response text
 * was dumped into the mentor_observation column. This module enforces a
 * strict input contract: observations must be distilled, third-person,
 * categorised, and confidence-scored.
 *
 * The mentor hub (private-mentor) uses logMentorObservation().
 * The founder hub (founder-mentor) uses logFounderHubEntry().
 * Neither function accepts raw LLM output.
 *
 * Rules:
 *   R1:   No therapeutic framing
 *   R4:   Private to the user
 *   R6c:  Qualitative levels — confidence is low/medium/high, not numeric
 *   R8a:  Greek identifiers where they derive from the Stoic Brain
 *
 * SageReasoning Proprietary Licence
 */

import { supabaseAdmin } from '@/lib/supabase-server'

// ─── Types ──────────────────────────────────────────────────────────

/**
 * Category enum for mentor observations.
 * Each maps to a specific kind of developmental signal the mentor notices.
 */
export type ObservationCategory =
  | 'passion_event'         // A passion was detected (anger, fear, desire, etc.)
  | 'virtue_marker'         // Evidence of virtue (courage, justice, temperance, wisdom)
  | 'reasoning_pattern'     // Recurring pattern in how the founder reasons
  | 'progress_signal'       // Movement along the developmental trajectory
  | 'oikeiosis_shift'       // Change in circles of concern / moral extension
  | 'integration_signal'    // Project-self alignment or divergence

export const VALID_CATEGORIES: ObservationCategory[] = [
  'passion_event',
  'virtue_marker',
  'reasoning_pattern',
  'progress_signal',
  'oikeiosis_shift',
  'integration_signal',
]

export type ConfidenceLevel = 'low' | 'medium' | 'high'

export const VALID_CONFIDENCE_LEVELS: ConfidenceLevel[] = ['low', 'medium', 'high']

/**
 * Structured input for a mentor observation.
 * The mentor (LLM) must distil its observation into this format
 * before it can be persisted. Raw conversational text is rejected.
 */
export interface MentorObservationInput {
  /** Date of the observation (YYYY-MM-DD) */
  date: string

  /**
   * Distilled third-person observation about the founder.
   * Must be 50–1000 characters.
   * Must NOT contain first-person mentor language ("I noticed", "You should").
   * Good: "Founder avoided naming fear as a passion — possible andreia blind spot."
   * Bad:  "I noticed you seem afraid. You should work on courage."
   */
  observation: string

  /** Category of developmental signal */
  category: ObservationCategory

  /** How confident the mentor is in this observation */
  confidence: ConfidenceLevel

  /**
   * Source context — what triggered this observation.
   * e.g., "evening_reflection", "founder_hub_conversation", "passion_log_review"
   */
  source_context: string
}

/**
 * Entry types for the founder hub — the founder's own words and decisions.
 */
export type FounderEntryType =
  | 'gap4_prompted'      // Response to a scheduled Gap 4 prompt
  | 'gap4_spontaneous'   // Unprompted Gap 4 self-observation
  | 'project_decision'   // A project decision with reasoning
  | 'passion_event'      // Founder's own passion event report

export const VALID_FOUNDER_ENTRY_TYPES: FounderEntryType[] = [
  'gap4_prompted',
  'gap4_spontaneous',
  'project_decision',
  'passion_event',
]

export interface FounderHubEntryInput {
  /** The founder's own words */
  content: string

  /** Type of entry */
  entry_type: FounderEntryType

  /** Optional: link to a related conversation or decision */
  conversation_id?: string

  /** Optional: link to a passion event */
  linked_passion_event_id?: string
}

// ─── Validation ─────────────────────────────────────────────────────

/**
 * Patterns that indicate first-person mentor language (contamination).
 * If the observation contains these, it's raw LLM output, not distilled.
 */
const FIRST_PERSON_MENTOR_PATTERNS = [
  /\bI (noticed|observed|think|believe|see|sense|feel|recommend|suggest|would)\b/i,
  /\byou (should|could|might|need to|seem|appear|are|were|have|had)\b/i,
  /\byour\b/i,
  /\bmy (observation|assessment|recommendation|view)\b/i,
  /\blet me\b/i,
  /\bI'd (push back|recommend|suggest)\b/i,
]

export interface ValidationResult {
  valid: boolean
  errors: string[]
}

/**
 * Validate a mentor observation against the structured input contract.
 * Returns { valid: true } or { valid: false, errors: [...] }.
 */
export function validateMentorObservation(input: MentorObservationInput): ValidationResult {
  const errors: string[] = []

  // Date format check (YYYY-MM-DD)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date)) {
    errors.push(`Invalid date format: "${input.date}". Expected YYYY-MM-DD.`)
  }

  // Observation length check (50–750 chars)
  const len = input.observation?.length || 0
  if (len < 50) {
    errors.push(`Observation too short (${len} chars). Minimum 50 characters. Distil the observation into a meaningful developmental signal.`)
  }
  if (len > 1000) {
    errors.push(`Observation too long (${len} chars). Maximum 1000 characters. Distil further.`)
  }

  // First-person mentor language check
  for (const pattern of FIRST_PERSON_MENTOR_PATTERNS) {
    if (pattern.test(input.observation)) {
      errors.push(
        `Observation contains first-person mentor language (matched: ${pattern}). ` +
        `Rewrite in third person about the founder. ` +
        `Good: "Founder avoided naming fear." Bad: "I noticed you seem afraid."`
      )
      break // One pattern match is enough to reject
    }
  }

  // Category check
  if (!VALID_CATEGORIES.includes(input.category)) {
    errors.push(`Invalid category: "${input.category}". Must be one of: ${VALID_CATEGORIES.join(', ')}`)
  }

  // Confidence check
  if (!VALID_CONFIDENCE_LEVELS.includes(input.confidence)) {
    errors.push(`Invalid confidence: "${input.confidence}". Must be one of: ${VALID_CONFIDENCE_LEVELS.join(', ')}`)
  }

  // Source context check
  if (!input.source_context || input.source_context.trim().length === 0) {
    errors.push('source_context is required. What triggered this observation?')
  }

  return { valid: errors.length === 0, errors }
}

// ─── Logging Functions ──────────────────────────────────────────────

/**
 * Log a structured mentor observation to the private mentor hub.
 *
 * This is the ONLY way to write to the mentor_observation column.
 * It validates the input contract and rejects raw LLM output.
 *
 * @param profileId - The mentor profile UUID
 * @param input - Structured observation (validated before insert)
 * @returns Success/error result
 */
export async function logMentorObservation(
  profileId: string,
  input: MentorObservationInput,
): Promise<{ success: boolean; error: string | null; validation?: ValidationResult }> {
  // Validate the input contract
  const validation = validateMentorObservation(input)
  if (!validation.valid) {
    return {
      success: false,
      error: `Observation rejected by input contract: ${validation.errors.join('; ')}`,
      validation,
    }
  }

  try {
    const { error: insertError } = await supabaseAdmin
      .from('mentor_observations_structured')
      .insert({
        profile_id: profileId,
        hub_id: 'private-mentor',
        observation_date: input.date,
        observation: input.observation,
        category: input.category,
        confidence: input.confidence,
        source_context: input.source_context,
      })

    if (insertError) {
      return { success: false, error: `DB insert failed: ${insertError.message}` }
    }

    // Update activation tracking counters on mentor_profiles (non-blocking)
    // Increments structured_observation_count and sets first_structured_observation_at
    // on the first successful observation.
    try {
      await supabaseAdmin.rpc('increment_structured_observation_count', {
        p_profile_id: profileId,
      })
    } catch (counterErr) {
      // Non-blocking — counter failure shouldn't fail the observation write
      console.warn('[mentor-observation-logger] Counter increment failed (non-blocking):', counterErr)
    }

    return { success: true, error: null }
  } catch (err) {
    console.error('[mentor-observation-logger] logMentorObservation failed:', err)
    return { success: false, error: String(err) }
  }
}

/**
 * Log a founder hub entry — the founder's own words.
 *
 * Unlike mentor observations, founder entries are NOT validated for
 * third-person language. The founder speaks in first person. The only
 * validation is type and length.
 *
 * @param userId - The auth user ID
 * @param input - Founder's entry
 * @returns Success/error result
 */
export async function logFounderHubEntry(
  userId: string,
  input: FounderHubEntryInput,
): Promise<{ success: boolean; error: string | null }> {
  // Validate entry type
  if (!VALID_FOUNDER_ENTRY_TYPES.includes(input.entry_type)) {
    return {
      success: false,
      error: `Invalid entry_type: "${input.entry_type}". Must be one of: ${VALID_FOUNDER_ENTRY_TYPES.join(', ')}`,
    }
  }

  // Validate content length (10–5000 chars — founder can write more freely)
  const len = input.content?.length || 0
  if (len < 10) {
    return { success: false, error: `Content too short (${len} chars). Minimum 10 characters.` }
  }
  if (len > 5000) {
    return { success: false, error: `Content too long (${len} chars). Maximum 5000 characters.` }
  }

  try {
    const { error: insertError } = await supabaseAdmin
      .from('founder_hub_entries')
      .insert({
        user_id: userId,
        entry_type: input.entry_type,
        content: input.content,
        conversation_id: input.conversation_id || null,
        linked_passion_event_id: input.linked_passion_event_id || null,
      })

    if (insertError) {
      return { success: false, error: `DB insert failed: ${insertError.message}` }
    }

    return { success: true, error: null }
  } catch (err) {
    console.error('[mentor-observation-logger] logFounderHubEntry failed:', err)
    return { success: false, error: String(err) }
  }
}

// ─── Retrieval (replaces getMentorObservations for structured data) ──

/**
 * Retrieve structured mentor observations for context injection.
 * This replaces the old getMentorObservations() which read raw text
 * from the mentor_observation column on mentor_interactions.
 *
 * @param profileId - The mentor profile UUID
 * @param hubId - Hub scope
 * @param limit - Max observations (default 15)
 */
export async function getStructuredMentorObservations(
  profileId: string,
  hubId: 'founder-mentor' | 'private-mentor' = 'private-mentor',
  limit: number = 15
): Promise<string | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('mentor_observations_structured')
      .select('observation_date, observation, category, confidence, source_context')
      .eq('profile_id', profileId)
      .eq('hub_id', hubId)
      .order('observation_date', { ascending: false })
      .limit(limit)

    if (error || !data || data.length === 0) return null

    const sections: string[] = [
      'MENTOR OBSERVATION HISTORY (structured developmental signals, most recent first):',
      '',
    ]

    for (const obs of data) {
      sections.push(
        `[${obs.observation_date}] [${obs.category}] (confidence: ${obs.confidence}, source: ${obs.source_context})`,
        `  ${obs.observation}`,
        ''
      )
    }

    sections.push(
      'Use these observations to build continuity across sessions. Reference patterns noticed. Do not repeat observations verbatim — weave them into guidance naturally.'
    )

    return sections.join('\n')
  } catch (err) {
    console.error('[mentor-observation-logger] getStructuredMentorObservations failed:', err)
    return null
  }
}
