/**
 * proactive-scheduler.ts — Proactive Scheduling Layer (Priority 5)
 *
 * The ring's proactive output layer. These are scheduled tasks that
 * run independently of any inner agent — the mentor initiates contact.
 *
 * Three proactive outputs:
 *   1. Morning check-in   — Daily disposition check (Marcus Aurelius practice)
 *   2. Evening reflection  — Daily Senecan review (De Ira 3.36)
 *   3. Weekly pattern mirror — Narrative pattern insight with trajectory
 *
 * Each proactive output:
 *   - Loads the user's ProfileWithCache
 *   - Selects the appropriate prompt builder from persona.ts
 *   - Routes to the correct model tier (Haiku for daily, Sonnet for weekly)
 *   - Records the interaction to the profile store
 *   - Tracks token usage
 *
 * Architecture:
 *   The scheduler does NOT manage cron/timers. It provides the
 *   execution functions that an external scheduler (e.g., Supabase
 *   pg_cron, Vercel cron, or client-side timer) calls at the right
 *   moment. The scheduler is the "what to do"; the timer is the
 *   "when to do it."
 *
 * Rules:
 *   R1:  No therapeutic framing — philosophical mentorship only
 *   R3:  Disclaimer on evaluative output
 *   R6d: Diagnostic, not punitive
 *   R9:  No outcome promises
 *   R12: All interventions from 2+ mechanisms
 *
 * SageReasoning Proprietary Licence
 */
/**
 * @compliance
 * compliance_version: CR-2026-Q2-v1
 * last_regulatory_review: 2026-04-04
 * applicable_jurisdictions: [AU, EU, US]
 * regulatory_references: [CR-001, CR-004]
 * review_cycle: quarterly
 * owner: founder
 * next_review_due: 2026-07-06
 * change_trigger: [EU AI Act classification guidance, AU Privacy Act reform]
 * deprecation_flag: false
 */

import type { MentorProfile } from './persona'
import type { KatorthomaProximityLevel } from '../trust-layer/types/accreditation'

import {
  buildMorningCheckIn,
  buildEveningReflection,
  buildWeeklyPatternMirror,
  buildMentorPersonaCore,
  buildMentorPersona,
} from './persona'

import type { ProfileWithCache } from './profile-store'
import type { ModelTier, TokenUsage } from './ring-wrapper'
import {
  PROACTIVE_MODEL_ROUTING,
  MODEL_IDS,
  recordTokenUsage,
} from './ring-wrapper'
import { sanitise } from './sanitise'

// ============================================================================
// TYPES
// ============================================================================

/**
 * Schedule definition for a proactive output.
 *
 * These define WHAT to schedule, not WHEN. The external scheduler
 * (Supabase pg_cron, Vercel cron, client timer) uses these definitions
 * to know what function to call.
 */
export type ProactiveScheduleType = 'morning_check_in' | 'evening_reflection' | 'weekly_pattern_mirror'

export type ProactiveSchedule = {
  readonly type: ProactiveScheduleType
  /** Suggested cron expression (for external scheduler configuration) */
  readonly suggested_cron: string
  /** Human-readable description */
  readonly description: string
  /** Which model tier to use */
  readonly model_tier: ModelTier
  /** Which persona tier to use */
  readonly persona_tier: 'full' | 'core'
  /** Whether this schedule is enabled for the user */
  enabled: boolean
}

/**
 * Result of executing a proactive output.
 */
export type ProactiveResult = {
  readonly type: ProactiveScheduleType
  /** The system prompt sent to the LLM */
  readonly system_prompt: string
  /** The persona system prompt (for Anthropic cache_control) */
  readonly persona_prompt: string
  /** Which model to call */
  readonly model_id: string
  /** Model tier used */
  readonly model_tier: ModelTier
  /** Mechanisms applied (for R12 compliance) */
  readonly mechanisms_applied: string[]
  /** Token usage (populated after LLM response) */
  token_usage: TokenUsage | null
  /** Timestamp */
  readonly timestamp: string
}

/**
 * User preferences for proactive scheduling.
 *
 * These are user-configurable and stored in the profile.
 * Times are in the user's local timezone.
 */
export type ProactivePreferences = {
  /** Whether proactive outputs are enabled at all */
  readonly enabled: boolean
  /** Morning check-in time (HH:MM in user's local timezone) */
  readonly morning_time: string
  /** Evening reflection time (HH:MM in user's local timezone) */
  readonly evening_time: string
  /** Day of week for weekly mirror (0=Sunday, 1=Monday, etc.) */
  readonly weekly_day: number
  /** Weekly mirror time (HH:MM in user's local timezone) */
  readonly weekly_time: string
  /** User's timezone (IANA, e.g., 'Australia/Sydney') */
  readonly timezone: string
  /** Quiet mode — suppress proactive outputs when user hasn't interacted in N days */
  readonly quiet_after_days: number
}

// ============================================================================
// DEFAULT PREFERENCES
// ============================================================================

/**
 * Sensible defaults for proactive scheduling.
 *
 * Morning at 7:30 AM, evening at 9:00 PM, weekly mirror on Sunday
 * evenings. Quiet mode after 7 days of no interaction (don't nag
 * a user who's gone silent — check in once, then wait).
 */
export const DEFAULT_PREFERENCES: ProactivePreferences = {
  enabled: true,
  morning_time: '07:30',
  evening_time: '21:00',
  weekly_day: 0,    // Sunday
  weekly_time: '19:00',
  timezone: 'UTC',
  quiet_after_days: 7,
} as const

// ============================================================================
// SCHEDULE DEFINITIONS
// ============================================================================

/**
 * Build the schedule definitions for a user.
 *
 * Converts user preferences into schedule objects that an external
 * scheduler can use. The cron expressions use the user's preferred
 * times (the external scheduler must handle timezone conversion).
 */
export function buildSchedules(prefs: ProactivePreferences): ProactiveSchedule[] {
  const [morningHour, morningMin] = prefs.morning_time.split(':').map(Number)
  const [eveningHour, eveningMin] = prefs.evening_time.split(':').map(Number)
  const [weeklyHour, weeklyMin] = prefs.weekly_time.split(':').map(Number)

  return [
    {
      type: 'morning_check_in',
      suggested_cron: `${morningMin} ${morningHour} * * *`,
      description: 'Morning disposition check — surfaces what is on your mind before the day begins',
      model_tier: PROACTIVE_MODEL_ROUTING.morning_check_in,
      persona_tier: 'core',
      enabled: prefs.enabled,
    },
    {
      type: 'evening_reflection',
      suggested_cron: `${eveningMin} ${eveningHour} * * *`,
      description: 'Evening Senecan review — examine the day, one observation, sleep well',
      model_tier: PROACTIVE_MODEL_ROUTING.evening_reflection,
      persona_tier: 'core',
      enabled: prefs.enabled,
    },
    {
      type: 'weekly_pattern_mirror',
      suggested_cron: `${weeklyMin} ${weeklyHour} * * ${prefs.weekly_day}`,
      description: 'Weekly pattern mirror — narrative insight from this week\'s actions and trajectory',
      model_tier: PROACTIVE_MODEL_ROUTING.weekly_pattern_mirror,
      persona_tier: 'full',
      enabled: prefs.enabled,
    },
  ]
}

// ============================================================================
// QUIET MODE — Respect silence
// ============================================================================

/**
 * Check if proactive outputs should be suppressed.
 *
 * If the user hasn't interacted in quiet_after_days, suppress all
 * daily outputs. The weekly mirror still fires once as a gentle
 * "checking in" — if the user doesn't respond to that either, it
 * goes quiet until the user returns.
 *
 * Philosophy: a good mentor knows when to be silent. Nagging a user
 * who's disengaged makes the relationship worse, not better.
 */
export function shouldSuppressProactive(
  profile: MentorProfile,
  prefs: ProactivePreferences,
  scheduleType: ProactiveScheduleType
): { suppress: boolean; reason: string | null } {
  if (!prefs.enabled) {
    return { suppress: true, reason: 'Proactive scheduling disabled by user preference' }
  }

  const lastInteraction = new Date(profile.last_interaction)
  const daysSinceInteraction = Math.floor(
    (Date.now() - lastInteraction.getTime()) / (1000 * 60 * 60 * 24)
  )

  if (daysSinceInteraction <= prefs.quiet_after_days) {
    return { suppress: false, reason: null }
  }

  // Past quiet threshold — suppress daily outputs
  if (scheduleType === 'morning_check_in' || scheduleType === 'evening_reflection') {
    return {
      suppress: true,
      reason: `No interaction in ${daysSinceInteraction} days — suppressing daily proactive output`,
    }
  }

  // Weekly mirror gets ONE more chance as a check-in
  // But only if we haven't already sent a quiet check-in this week
  if (daysSinceInteraction > prefs.quiet_after_days + 7) {
    return {
      suppress: true,
      reason: `No interaction in ${daysSinceInteraction} days — suppressing all proactive output until user returns`,
    }
  }

  // Weekly mirror fires as a gentle re-engagement
  return { suppress: false, reason: null }
}

// ============================================================================
// PROACTIVE EXECUTION — Build the prompts for each output type
// ============================================================================

/**
 * Execute a morning check-in.
 *
 * Returns the system prompt and persona prompt ready to send to the
 * LLM. The caller (API route or cron handler) sends these to the
 * Anthropic API and delivers the response to the user.
 *
 * Brain mechanisms: psychology.json (impression awareness),
 * passions.json (early detection), progress.json (growth edge).
 */
export function prepareMorningCheckIn(
  cached: ProfileWithCache
): ProactiveResult {
  const profile = cached.profile

  return {
    type: 'morning_check_in',
    system_prompt: buildMorningCheckIn(profile),
    persona_prompt: buildMentorPersonaCore(profile),
    model_id: MODEL_IDS[PROACTIVE_MODEL_ROUTING.morning_check_in],
    model_tier: PROACTIVE_MODEL_ROUTING.morning_check_in,
    mechanisms_applied: ['control_filter', 'passion_diagnosis'],
    token_usage: null,
    timestamp: new Date().toISOString(),
  }
}

/**
 * Execute an evening reflection.
 *
 * The Senecan review — the mentor prompts the day's examination,
 * listens, and provides one observation connecting today to the
 * larger trajectory.
 *
 * Brain mechanisms: sage-reflect logic (iterative refinement),
 * passions.json (naming what happened), progress.json (trajectory).
 */
export function prepareEveningReflection(
  cached: ProfileWithCache
): ProactiveResult {
  const profile = cached.profile

  return {
    type: 'evening_reflection',
    system_prompt: buildEveningReflection(profile),
    persona_prompt: buildMentorPersonaCore(profile),
    model_id: MODEL_IDS[PROACTIVE_MODEL_ROUTING.evening_reflection],
    model_tier: PROACTIVE_MODEL_ROUTING.evening_reflection,
    mechanisms_applied: ['iterative_refinement', 'passion_diagnosis'],
    token_usage: null,
    timestamp: new Date().toISOString(),
  }
}

/**
 * Execute a weekly pattern mirror.
 *
 * The mentor holds up the mirror — one narrative pattern from this
 * week, connected to the person's trajectory, ending with one
 * question. This is the most expensive proactive output because it
 * requires synthesis across multiple interactions.
 *
 * Brain mechanisms: Evaluated action aggregation (rolling window),
 * passion trend detection, dimension-level analysis, oikeiosis check.
 *
 * Requires weekActions — the caller must query the profile store
 * for this week's interactions and pass them in.
 */
export function prepareWeeklyPatternMirror(
  cached: ProfileWithCache,
  weekActions: { action: string; proximity: KatorthomaProximityLevel; passions: string[] }[]
): ProactiveResult {
  const profile = cached.profile

  return {
    type: 'weekly_pattern_mirror',
    system_prompt: buildWeeklyPatternMirror(profile, weekActions),
    persona_prompt: buildMentorPersona(profile, 'full'),
    model_id: MODEL_IDS[PROACTIVE_MODEL_ROUTING.weekly_pattern_mirror],
    model_tier: PROACTIVE_MODEL_ROUTING.weekly_pattern_mirror,
    mechanisms_applied: [
      'passion_diagnosis',
      'iterative_refinement',
      'value_assessment',
      'social_obligation',
    ],
    token_usage: null,
    timestamp: new Date().toISOString(),
  }
}

// ============================================================================
// UNIFIED DISPATCHER
// ============================================================================

/**
 * Dispatch a proactive output by type.
 *
 * The external scheduler calls this with the schedule type. It
 * checks quiet mode, selects the right preparation function, and
 * returns the result (or null if suppressed).
 *
 * Usage:
 *   const result = dispatchProactive('morning_check_in', cached, prefs)
 *   if (result) {
 *     // Send result.persona_prompt + result.system_prompt to Anthropic API
 *     // with model_id = result.model_id
 *     // Record token usage: result.token_usage = recordTokenUsage(...)
 *   }
 */
export function dispatchProactive(
  scheduleType: ProactiveScheduleType,
  cached: ProfileWithCache,
  prefs: ProactivePreferences,
  weekActions?: { action: string; proximity: KatorthomaProximityLevel; passions: string[] }[]
): ProactiveResult | null {
  // 1. Check quiet mode
  const quietCheck = shouldSuppressProactive(cached.profile, prefs, scheduleType)
  if (quietCheck.suppress) {
    console.info(`[PROACTIVE] Suppressed ${scheduleType}: ${quietCheck.reason}`)
    return null
  }

  // 2. Dispatch to the right preparation function
  switch (scheduleType) {
    case 'morning_check_in':
      return prepareMorningCheckIn(cached)

    case 'evening_reflection':
      return prepareEveningReflection(cached)

    case 'weekly_pattern_mirror':
      if (!weekActions || weekActions.length === 0) {
        console.info('[PROACTIVE] Suppressed weekly_pattern_mirror: no actions this week')
        return null
      }
      return prepareWeeklyPatternMirror(cached, weekActions)

    default:
      console.warn(`[PROACTIVE] Unknown schedule type: ${scheduleType}`)
      return null
  }
}

// ============================================================================
// INTERACTION RECORDING HELPER
// ============================================================================

/**
 * Build the interaction record data for a completed proactive output.
 *
 * After the LLM responds, the caller uses this to build the data
 * needed for recordInteraction() in profile-store.ts.
 */
export function buildProactiveInteractionRecord(
  result: ProactiveResult,
  llmResponse: string
): {
  type: 'morning_check_in' | 'evening_reflection' | 'conversation'
  description: string
  mechanisms_applied: string[]
  mentor_observation: string
} {
  const interactionType = result.type === 'weekly_pattern_mirror'
    ? 'conversation' as const
    : result.type

  return {
    type: interactionType,
    description: `Proactive ${result.type.replace(/_/g, ' ')}`,
    mechanisms_applied: result.mechanisms_applied,
    // NOTE (2026-04-13): mentor_observation deliberately set to empty string.
    // Previously this passed the full sanitised LLM response, which contaminated
    // the legacy mentor_interactions.mentor_observation column with raw output.
    // Structured observations are now logged separately via logMentorObservation().
    // See: website/src/lib/logging/mentor-observation-logger.ts
    mentor_observation: '',
  }
}
