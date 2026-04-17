/**
 * private-hub-types.ts — Private Mentor Hub Data Structures
 *
 * Defines all data structures and types required by the Private Mentor Hub interface.
 * The hub is the interface where Layers 2-8 (and eventually 9-10) are communicated to
 * the human, refined through dialogue, and integrated back into the mentor's model.
 *
 * The hub displays:
 *   - The user's 10-layer interpretation (MentorProfile + Layers 2-10)
 *   - A conversation thread between mentor and human
 *   - Refinement options for each layer
 *   - Real-time session context (what's active now, triggers, passions)
 *   - Ritual prompts (morning/evening) with predictive context
 *   - Weekly pattern synthesis
 *
 * Architecture:
 *   - PrivateHubState: Complete hub state (what's displayed, what's being edited)
 *   - MentorMessage & HumanMessage: Conversation types
 *   - ConversationContext: Active profile state during session
 *   - RitualPrompt: Morning/evening prompts with contextual predictions
 *   - ProfileView: All 10 layers formatted for display
 *   - PatternMirrorReport: Weekly synthesis
 *
 * Rules:
 *   R4:  Hub structure is IP — results and refined profiles exposed, not frameworks
 *   R6d: All displays are diagnostic, not punitive — framed for growth discovery
 *   R7:  All passions and concepts trace to brain file citations
 *   R8a: Greek passion identifiers in data layer; English-only in UI
 *   R8c: UI content uses plain English, no jargon
 *
 * SageReasoning Proprietary Licence
 */
/**
 * @compliance
 * compliance_version: CR-2026-Q2-v1
 * last_regulatory_review: 2026-04-04
 * applicable_jurisdictions: [AU, EU, US]
 * regulatory_references: [CR-004, CR-006, CR-012]
 * review_cycle: quarterly
 * owner: founder
 * next_review_due: 2026-07-06
 * change_trigger: [EU AI Act classification guidance, AU Privacy Act reform]
 * deprecation_flag: false
 */

import type { FullInterpretationResult } from './journal-interpreter'
import type { KatorthomaProximityLevel } from '../trust-layer/types/accreditation'
import type { ProgressionPrescription } from '../trust-layer/types/progression'
import type { MentorLedger, LedgerEntryKind } from './mentor-ledger'

// ============================================================================
// HUB STATE & NAVIGATION
// ============================================================================

/**
 * The complete state of the Private Mentor Hub.
 * Used to render the hub, handle navigation, and manage edits.
 */
export type PrivateHubState = {
  readonly user_id: string
  readonly display_name: string

  /** Current view: which section is the user looking at */
  readonly current_view: 'dashboard' | 'conversation' | 'profile' | 'patterns' | 'rituals' | 'ledger' | 'settings'

  /** Current proximity display (from rolling window + mentor profile) */
  readonly current_proximity: KatorthomaProximityLevel
  readonly senecan_grade: 'pre_progress' | 'grade_3' | 'grade_2' | 'grade_1'
  readonly direction_of_travel: 'improving' | 'stable' | 'regressing'

  /** Full 10-layer interpretation (loaded once on mount) */
  readonly full_interpretation: FullInterpretationResult

  /** Active conversation in the hub */
  readonly conversation: ConversationThread

  /** Context for current session (what's active, triggered, prescribed) */
  readonly session_context: ConversationContext

  /** Pending ritual prompts (morning/evening) */
  readonly pending_rituals: RitualPrompt[]

  /** Weekly pattern mirror (generated weekly) */
  readonly weekly_pattern: PatternMirrorReport | null

  /** The Mentor Ledger — commitments, realisations, questions, tensions, intentions */
  readonly mentor_ledger: MentorLedger

  /** Current ledger filter in the Hub UI */
  readonly ledger_filter: {
    readonly kind_filter: LedgerEntryKind | 'all'
    readonly status_filter: 'active' | 'all' | 'completed'
    readonly sort_by: 'priority' | 'extracted_at' | 'last_engaged_at'
  }

  /** Which layers are currently being refined (user is editing) */
  readonly layers_in_edit: number[]

  /** UI state: loading, error messages, etc. */
  readonly ui_state: {
    readonly is_loading: boolean
    readonly last_error: string | null
    readonly unsaved_changes: boolean
  }

  /** Timestamp of last mentor update */
  readonly last_mentor_sync: string
}

/**
 * A single view of all 10 layers formatted for the hub UI.
 * This is what displays in the "Profile" view.
 */
export type ProfileView = {
  // Layer 1: Baseline (already in MentorProfile)
  readonly layer_1_baseline: {
    readonly passion_summary: string
    readonly causal_tendency_summary: string
    readonly virtue_profile_summary: string
    readonly oikeiosis_summary: string
  }

  // Layer 2: Reasoning Architecture
  readonly layer_2_cognitive_style: {
    readonly reasoning_style: string
    readonly thinking_pattern: string
    readonly abstraction_preference: string
    readonly mentor_communication_note: string
  }

  // Layer 3: Engagement Gradient
  readonly layer_3_engagement: {
    readonly overall_pattern: string
    readonly breakthrough_entries: string[]
    readonly entry_quality_trend: string
  }

  // Layer 4: Contradictions
  readonly layer_4_contradictions: {
    readonly primary_gap: string | null
    readonly contradiction_count: number
    readonly most_significant: string | null
    readonly growth_opportunity: string
  }

  // Layer 5: Relational Texture
  readonly layer_5_relationships: {
    readonly key_relationships_summary: string
    readonly reasoning_variations: string
    readonly relational_triggers: string[]
  }

  // Layer 6: Developmental Timeline
  readonly layer_6_development: {
    readonly progression_arc: string
    readonly plateau_pattern: string
    readonly next_breakthrough_window: string
    readonly optimal_challenge_timing: string
  }

  // Layer 7: Language Fingerprint
  readonly layer_7_voice: {
    readonly metaphor_style: string
    readonly emotional_register: string
    readonly recurring_themes: string[]
    readonly mentor_tone_suggestion: string
  }

  // Layer 8: Trigger Map
  readonly layer_8_triggers: {
    readonly primary_triggers: string[]
    readonly context_sensitivity: string
    readonly early_warning_signs: string[]
  }

  // Layer 9: Product Signals (UX feedback)
  readonly layer_9_product_signals: {
    readonly effective_prompts: string[]
    readonly improvement_areas: string[]
  } | null

  // Layer 10: Proof of Concept
  readonly layer_10_case_study: {
    readonly narrative_summary: string
  } | null
}

// ============================================================================
// CONVERSATION TYPES
// ============================================================================

/**
 * A single message in the conversation thread.
 * Type discriminated by kind field.
 */
export type ConversationMessage =
  | MentorMessage
  | HumanMessage
  | InsightMessage
  | JournalRefMessage

export type MessageBase = {
  readonly id: string
  readonly created_at: string
  readonly sequence: number
}

/**
 * Mentor contribution to conversation.
 */
export type MentorMessage = MessageBase & {
  readonly kind: 'mentor'
  readonly text: string
  /** Which layer(s) this message addresses (if specific to a layer) */
  readonly layers_addressed: number[]
  /** Brain mechanisms used in this message */
  readonly mechanisms: string[]
}

/**
 * Human (user) contribution to conversation.
 */
export type HumanMessage = MessageBase & {
  readonly kind: 'human'
  readonly text: string
}

/**
 * Automated insight surfaced by the mentor (not a direct message, but a prompt for reflection).
 */
export type InsightMessage = MessageBase & {
  readonly kind: 'insight'
  readonly title: string
  readonly description: string
  readonly derived_from_layers: number[]
  readonly action_prompt: string
}

/**
 * Reference to a specific journal passage that the mentor is surfacing.
 */
export type JournalRefMessage = MessageBase & {
  readonly kind: 'journal_ref'
  readonly section: string
  readonly page_or_entry: string
  readonly excerpt: string
  readonly why_surfaced: string
  readonly relevance_to_current: string
}

/**
 * Complete conversation thread in the hub.
 */
export type ConversationThread = {
  readonly messages: ConversationMessage[]
  readonly is_active: boolean
  readonly topic: string
  readonly created_at: string
  readonly last_message_at: string
}

// ============================================================================
// SESSION CONTEXT
// ============================================================================

/**
 * Active context during a hub session.
 * Tracks what's currently relevant, what's triggered, what's being prescribed.
 */
export type ConversationContext = {
  /** Passions currently elevated in this session */
  readonly active_passions: {
    readonly passion_id: string
    readonly passion_name: string
    readonly false_judgement: string
    readonly activation_trigger: string | null
  }[]

  /** Value gaps that are currently forefront */
  readonly active_value_gaps: {
    readonly declared: string
    readonly observed: string
    readonly why_relevant_now: string
  }[]

  /** Situational triggers that might activate in near future */
  readonly anticipated_triggers: string[]

  /** Current progression prescription */
  readonly current_prescription: ProgressionPrescription | null

  /** Which relationships are relevant to current decision/situation */
  readonly relevant_relationships: string[]

  /** Cognitive style note for this conversation */
  readonly cognitive_style_note: string

  /** Language/tone calibration for this session */
  readonly voice_calibration: string
}

// ============================================================================
// RITUAL PROMPTS (Morning/Evening)
// ============================================================================

/**
 * A ritual prompt (morning check-in or evening reflection).
 * Includes predictive context about what passions/triggers to watch for.
 */
export type RitualPrompt = {
  readonly ritual_id: string
  readonly ritual_type: 'morning' | 'evening'
  readonly scheduled_time: string
  readonly created_at: string

  /** The prompt text itself */
  readonly prompt_text: string

  /** Predictive context: what to watch for today/tonight */
  readonly predictive_context: {
    readonly likely_passions: {
      readonly passion_id: string
      readonly passion_name: string
      readonly why_likely: string
    }[]
    readonly anticipated_challenges: string[]
    readonly relevant_oikeiosis_stages: string[]
  }

  /** Smart suggestions based on developmental timeline */
  readonly timeline_note: string

  /** Journal reference that might resonate */
  readonly suggested_journal_ref: {
    readonly excerpt: string
    readonly relevance: string
  } | null

  /** Personalization based on language fingerprint */
  readonly voice_note: string

  readonly status: 'pending' | 'sent' | 'responded'
  readonly response_at?: string
}

// ============================================================================
// WEEKLY PATTERN SYNTHESIS
// ============================================================================

/**
 * Weekly pattern mirror — narrative synthesis of the week's actions and patterns.
 * Generated from the pattern-engine output and formatted for the hub.
 */
export type PatternMirrorReport = {
  readonly week_ending: string
  readonly generated_at: string

  /** Narrative summary of the week */
  readonly narrative: string

  /** Key patterns detected */
  readonly patterns_detected: {
    readonly pattern: string
    readonly evidence: string[]
    readonly interpretation: string
  }[]

  /** Passions that showed up most */
  readonly passion_summary: {
    readonly passion_name: string
    readonly appearances: number
    readonly trend: 'increasing' | 'stable' | 'decreasing'
  }[]

  /** Progression dimension updates */
  readonly dimension_updates: {
    readonly dimension: string
    readonly direction: 'improving' | 'stable' | 'regressing'
    readonly evidence: string
  }[]

  /** Recommended next focus */
  readonly recommended_focus: string

  /** Suggested journal prompt for coming week */
  readonly suggested_reflection: string
}

// ============================================================================
// REFINEMENT & FEEDBACK
// ============================================================================

/**
 * When a user provides feedback or refinement on a layer interpretation.
 * Used to capture "the mentor got this wrong" or "I'd add..." feedback.
 */
export type LayerRefinement = {
  readonly layer_number: number
  readonly refinement_type: 'correction' | 'addition' | 'disagreement' | 'expansion'
  readonly original_content: string
  readonly refined_content: string
  readonly rationale: string
  readonly created_at: string
}

/**
 * A compiled set of refinements from a session — sent back to the backend
 * to improve the user's profile.
 */
export type RefinementBatch = {
  readonly batch_id: string
  readonly user_id: string
  readonly refinements: LayerRefinement[]
  readonly session_date: string
  readonly overall_note: string
}

// ============================================================================
// HUB SETTINGS & PREFERENCES
// ============================================================================

/**
 * User settings and preferences for the hub.
 */
export type HubPreferences = {
  readonly user_id: string

  /** Ritual preferences */
  readonly rituals: {
    readonly morning_check_in_enabled: boolean
    readonly morning_time: string // HH:MM in user's timezone
    readonly evening_reflection_enabled: boolean
    readonly evening_time: string // HH:MM in user's timezone
  }

  /** Conversation preferences */
  readonly conversation: {
    readonly mentor_verbosity: 'concise' | 'balanced' | 'detailed'
    readonly citation_level: 'minimal' | 'moderate' | 'detailed'
    readonly use_greek_terms: boolean
  }

  /** Display preferences */
  readonly display: {
    readonly theme: 'dark' | 'light'
    readonly layer_detail_level: 'summary' | 'detailed'
  }

  /** Notification preferences */
  readonly notifications: {
    readonly pattern_insights: boolean
    readonly contradiction_alerts: boolean
    readonly trigger_warnings: boolean
  }
}

// ============================================================================
// HUB INITIALISATION & SYNC
// ============================================================================

/**
 * Configuration for initialising the hub.
 */
export type HubInitConfig = {
  readonly user_id: string
  readonly include_full_interpretation: boolean
  readonly include_conversation_history: boolean
  readonly include_pending_rituals: boolean
  readonly include_patterns: boolean
}

/**
 * Result of syncing hub state back to the server.
 * Captures what was saved and any conflicts or errors.
 */
export type HubSyncResult = {
  readonly sync_id: string
  readonly synced_at: string
  readonly user_id: string

  readonly refinements_saved: number
  readonly profile_updates: string[]

  readonly new_insights_generated: number
  readonly new_rituals_scheduled: number

  readonly conflicts: string[]
  readonly warnings: string[]

  readonly success: boolean
}
