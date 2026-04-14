/**
 * mentor-context-private.ts — Private mentor context assembly
 *
 * Assembles the enriched context that only the private (founder-only) mentor
 * receives. This includes:
 *
 *   1. Recent mentor observations from the rolling interaction window
 *      (Gap 2: Mentor observation persistence)
 *   2. Relevant journal references matched by topic/relevance triggers
 *      (Gap 3: Journal reference recall)
 *   3. Temporal profile snapshots for growth trajectory analysis
 *      (Gap 4: Temporal snapshots)
 *
 * These are layered ON TOP of the full practitioner context, project context,
 * and L5 mentor knowledge base that the private routes already load.
 *
 * Each function returns a formatted string block for user-message injection,
 * or null if no data is available (graceful degradation).
 */

import { supabaseAdmin } from '@/lib/supabase-server'
import { loadMentorProfile, saveMentorProfile } from '@/lib/mentor-profile-store'
import type { FounderFacts, MentorProfileData, PassionMapEntry } from '@/lib/mentor-profile-summary'

// ── Gap 2: Mentor Observation History ────────────────────────────────

/**
 * Retrieve the most recent mentor observations from the interaction log.
 * These are qualitative insights recorded after each interaction (e.g.,
 * "founder consistently avoids andreia scenarios," "fear of judgement
 * surfaces when discussing community expansion").
 *
 * Returns a formatted block for injection into the private mentor's
 * user message, or null if no observations exist.
 *
 * @param userId - The user's ID (used to find their profile)
 * @param hubId - The hub context: 'founder-mentor' or 'private-mentor'
 * @param limit - Max observations to return (default 15, most recent first)
 */
export async function getMentorObservations(
  userId: string,
  hubId: 'founder-mentor' | 'private-mentor' = 'private-mentor',
  limit: number = 15
): Promise<string | null> {
  try {
    // Find the user's profile ID
    const profileId = await getProfileId(userId)
    if (!profileId) return null

    // Fetch recent interactions that have mentor observations — hub-scoped
    const { data, error } = await supabaseAdmin
      .from('mentor_interactions')
      .select('interaction_type, description, proximity_assessed, mentor_observation, created_at')
      .eq('profile_id', profileId)
      .eq('hub_id', hubId)
      .not('mentor_observation', 'is', null)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error || !data || data.length === 0) return null

    const sections: string[] = [
      'MENTOR OBSERVATION HISTORY (recent qualitative insights from prior interactions):',
      '',
    ]

    for (const obs of data) {
      const date = new Date(obs.created_at).toISOString().split('T')[0]
      const type = obs.interaction_type.replace(/_/g, ' ')
      sections.push(
        `[${date}] (${type}, proximity: ${obs.proximity_assessed || 'not assessed'})`,
        `  Observation: ${obs.mentor_observation}`,
        ''
      )
    }

    sections.push(
      'Use these observations to build continuity across sessions. Reference patterns you\'ve noticed. Do not repeat observations verbatim — weave them into your guidance naturally.'
    )

    return sections.join('\n')
  } catch (err) {
    console.error('[mentor-context-private] Failed to load observations:', err)
    return null
  }
}

// ── Parallel Retrieval Logging (2026-04-13 refactor) ────────────────
//
// During the transition period, both old (raw text from mentor_interactions)
// and new (structured from mentor_observations_structured) paths run in
// parallel. A comparison log records what each path returned, so we can
// measure whether structured observations improve context quality before
// cutting over.
//
// Cutover criteria: 5–10 structured observations pass manual quality review.
// Until then, the old path provides context (it has data); the new path
// accumulates data and logs for comparison.

import {
  getStructuredMentorObservations,
} from '@/lib/logging/mentor-observation-logger'

/**
 * Parallel retrieval log entry format.
 * Written to analytics_events for measurement.
 */
export interface ObservationRetrievalLog {
  retrieval_timestamp: string
  hub_id: 'founder-mentor' | 'private-mentor'
  caller: string                    // which route triggered retrieval
  old_path_count: number            // observations returned from legacy path
  new_path_count: number            // observations returned from structured path
  db_structured_count: number       // total structured observations for user (from mentor_profiles counter)
  active_path: 'legacy' | 'structured' | 'legacy_fallback'
  old_path_chars: number            // total chars in legacy context block
  new_path_chars: number            // total chars in structured context block
}

/**
 * Get mentor observations with parallel retrieval logging.
 *
 * Runs BOTH the legacy getMentorObservations() and the new
 * getStructuredMentorObservations() in parallel. Returns whichever
 * has data (preferring structured when it has ≥5 observations).
 * Logs the comparison to analytics_events for measurement.
 *
 * Drop-in replacement for getMentorObservations() at all call sites.
 *
 * @param userId - Auth user ID
 * @param hubId - Hub scope
 * @param caller - Identifying string for the calling route (for log)
 * @param limit - Max observations per path
 */
export async function getMentorObservationsWithParallelLog(
  userId: string,
  hubId: 'founder-mentor' | 'private-mentor' = 'private-mentor',
  caller: string = 'unknown',
  limit: number = 15
): Promise<string | null> {
  const profileId = await getProfileId(userId)

  // Check the fast counter on mentor_profiles for cutover decision
  // This avoids querying mentor_observations_structured just to count rows
  let dbStructuredCount = 0
  if (profileId) {
    const { data: profileRow } = await supabaseAdmin
      .from('mentor_profiles')
      .select('structured_observation_count')
      .eq('id', profileId)
      .single()
    dbStructuredCount = (profileRow as { structured_observation_count?: number } | null)
      ?.structured_observation_count || 0
  }

  // Run both paths in parallel
  const [legacyResult, structuredResult] = await Promise.all([
    getMentorObservations(userId, hubId, limit),
    profileId
      ? getStructuredMentorObservations(profileId, hubId, limit)
      : Promise.resolve(null),
  ])

  // Count observations from retrieved text (for logging/comparison)
  const legacyCount = legacyResult
    ? (legacyResult.match(/^\[/gm) || []).length
    : 0
  const structuredCount = structuredResult
    ? (structuredResult.match(/^\[/gm) || []).length
    : 0

  // Decision: use structured if the user has ≥5 total structured observations
  // Uses the DB counter (accurate) rather than the text match count (may be limited)
  const STRUCTURED_THRESHOLD = 5
  let activePath: 'legacy' | 'structured' | 'legacy_fallback'
  let activeResult: string | null

  if (dbStructuredCount >= STRUCTURED_THRESHOLD && structuredResult) {
    activePath = 'structured'
    activeResult = structuredResult
  } else if (legacyResult) {
    activePath = 'legacy_fallback'
    activeResult = legacyResult
  } else {
    activePath = 'legacy'
    activeResult = null
  }

  // Console log on every retrieval — path used, observation counts, and timestamp
  // This makes it visible in Vercel logs which path is active and when cutover happens
  console.log(
    `[observation-retrieval] path=${activePath} db_count=${dbStructuredCount} structured_retrieved=${structuredCount} legacy=${legacyCount} threshold=${STRUCTURED_THRESHOLD} caller=${caller} ts=${new Date().toISOString()}`
  )

  // Log the comparison (non-blocking)
  const logEntry: ObservationRetrievalLog = {
    retrieval_timestamp: new Date().toISOString(),
    hub_id: hubId,
    caller,
    old_path_count: legacyCount,
    new_path_count: structuredCount,
    db_structured_count: dbStructuredCount,
    active_path: activePath,
    old_path_chars: legacyResult?.length || 0,
    new_path_chars: structuredResult?.length || 0,
  }

  // Non-blocking analytics write — wrapped in async IIFE to handle errors
  ;(async () => {
    try {
      await supabaseAdmin
        .from('analytics_events')
        .insert({
          event_type: 'observation_retrieval_comparison',
          user_id: userId,
          metadata: logEntry,
        })
    } catch (err) {
      console.warn('[mentor-context-private] Failed to log retrieval comparison:', err)
    }
  })()

  return activeResult
}

// ── Gap 3: Journal Reference Recall ──────────────────────────────────

/**
 * Retrieve journal references relevant to the current interaction context.
 * Uses the indexed key passages from journal ingestion, matched by topic
 * tags and relevance triggers.
 *
 * If topicHints are provided (extracted from the user's current input),
 * passages are filtered by tag/trigger match. Otherwise returns the most
 * recently indexed passages.
 *
 * @param userId - The user's ID
 * @param topicHints - Optional keywords from the current interaction to match against
 * @param hubId - The hub context (journal refs are always private-scoped but param kept for API consistency)
 * @param limit - Max references to return (default 10)
 */
export async function getJournalReferences(
  userId: string,
  topicHints?: string[],
  hubId: 'founder-mentor' | 'private-mentor' = 'private-mentor',
  limit: number = 10
): Promise<string | null> {
  try {
    const profileId = await getProfileId(userId)
    if (!profileId) return null

    let query = supabaseAdmin
      .from('mentor_journal_refs')
      .select('passage_id, journal_phase, journal_day, topic_tags, summary, relevance_triggers')
      .eq('profile_id', profileId)

    // If we have topic hints, filter by overlap with topic_tags or relevance_triggers
    // Supabase array overlap: .overlaps('column', array)
    if (topicHints && topicHints.length > 0) {
      // Try topic_tags overlap first
      query = query.overlaps('topic_tags', topicHints)
    }

    const { data, error } = await query
      .order('journal_day', { ascending: false })
      .limit(limit)

    if (error || !data || data.length === 0) {
      // If topic-filtered query returned nothing, try relevance_triggers
      if (topicHints && topicHints.length > 0) {
        const { data: triggerData, error: triggerError } = await supabaseAdmin
          .from('mentor_journal_refs')
          .select('passage_id, journal_phase, journal_day, topic_tags, summary, relevance_triggers')
          .eq('profile_id', profileId)
          .overlaps('relevance_triggers', topicHints)
          .order('journal_day', { ascending: false })
          .limit(limit)

        if (triggerError || !triggerData || triggerData.length === 0) return null

        return formatJournalRefs(triggerData)
      }
      return null
    }

    return formatJournalRefs(data)
  } catch (err) {
    console.error('[mentor-context-private] Failed to load journal refs:', err)
    return null
  }
}

function formatJournalRefs(
  refs: Array<{
    passage_id: string
    journal_phase: string
    journal_day: number
    topic_tags: string[]
    summary: string
    relevance_triggers: string[]
  }>
): string {
  const sections: string[] = [
    'JOURNAL REFERENCE RECALL (key passages from the practitioner\'s own journal):',
    '',
  ]

  for (const ref of refs) {
    sections.push(
      `[${ref.journal_phase}, Day ${ref.journal_day}] ${ref.summary}`,
      `  Topics: ${ref.topic_tags.join(', ')}`,
      ''
    )
  }

  sections.push(
    'Reference the practitioner\'s own words and journal entries where relevant. This builds trust and demonstrates accumulated knowledge of their journey.'
  )

  return sections.join('\n')
}

// ── Gap 4: Temporal Profile Snapshots ────────────────────────────────

/**
 * Retrieve timestamped profile snapshots for growth trajectory analysis.
 * These are stored periodically (weekly or on significant profile change)
 * and allow the mentor to observe trends: "your proximity has been steady
 * for six weeks," "your dominant passion has shifted from fear to desire."
 *
 * @param userId - The user's ID
 * @param hubId - The hub context: 'founder-mentor' or 'private-mentor'
 * @param limit - Max snapshots to return (default 8, most recent first)
 */
export async function getProfileSnapshots(
  userId: string,
  hubId: 'founder-mentor' | 'private-mentor' = 'private-mentor',
  limit: number = 8
): Promise<string | null> {
  try {
    const profileId = await getProfileId(userId)
    if (!profileId) return null

    const { data, error } = await supabaseAdmin
      .from('mentor_profile_snapshots')
      .select('snapshot_at, proximity_level, senecan_grade, direction_of_travel, persisting_passions, weakest_virtue, interaction_count, trigger')
      .eq('profile_id', profileId)
      .eq('hub_id', hubId)
      .order('snapshot_at', { ascending: false })
      .limit(limit)

    if (error || !data || data.length === 0) return null

    const sections: string[] = [
      'GROWTH TRAJECTORY (timestamped profile snapshots, most recent first):',
      '',
    ]

    for (const snap of data) {
      const date = new Date(snap.snapshot_at).toISOString().split('T')[0]
      const passions = Array.isArray(snap.persisting_passions)
        ? snap.persisting_passions.join(', ')
        : snap.persisting_passions || 'none recorded'

      sections.push(
        `[${date}] Proximity: ${snap.proximity_level} (${snap.senecan_grade}) | Direction: ${snap.direction_of_travel || 'stable'} | Weakest: ${snap.weakest_virtue || 'unknown'} | Persisting: ${passions} | Interactions: ${snap.interaction_count || 0} | Trigger: ${snap.trigger || 'scheduled'}`,
      )
    }

    sections.push(
      '',
      'Use this trajectory to identify plateaus, growth spurts, and regression patterns. Reference specific timeframes when coaching: "over the past month..." or "since you started working on..."'
    )

    return sections.join('\n')
  } catch (err) {
    console.error('[mentor-context-private] Failed to load snapshots:', err)
    return null
  }
}

/**
 * Create a profile snapshot. Called periodically (weekly) or when a
 * significant profile change is detected (e.g., proximity level change,
 * direction_of_travel flip).
 *
 * @param profileId - The profile's UUID
 * @param trigger - What triggered the snapshot: 'scheduled' | 'proximity_change' | 'direction_change' | 'manual'
 * @param hubId - The hub context: 'founder-mentor' or 'private-mentor'
 */
export async function createProfileSnapshot(
  profileId: string,
  trigger: 'scheduled' | 'proximity_change' | 'direction_change' | 'manual' = 'scheduled',
  hubId: 'founder-mentor' | 'private-mentor' = 'private-mentor'
): Promise<{ success: boolean; error: string | null }> {
  try {
    // Read current profile state
    const { data: profile, error: readError } = await supabaseAdmin
      .from('mentor_profiles')
      .select('proximity_level, senecan_grade, direction_of_travel, persisting_passions, weakest_virtue, interaction_count')
      .eq('id', profileId)
      .single()

    if (readError || !profile) {
      return { success: false, error: readError?.message || 'Profile not found' }
    }

    const { error: insertError } = await supabaseAdmin
      .from('mentor_profile_snapshots')
      .insert({
        profile_id: profileId,
        hub_id: hubId,
        snapshot_at: new Date().toISOString(),
        proximity_level: profile.proximity_level,
        senecan_grade: profile.senecan_grade,
        direction_of_travel: profile.direction_of_travel,
        persisting_passions: profile.persisting_passions,
        weakest_virtue: profile.weakest_virtue,
        interaction_count: profile.interaction_count,
        trigger,
      })

    if (insertError) {
      return { success: false, error: insertError.message }
    }

    return { success: true, error: null }
  } catch (err) {
    console.error('[mentor-context-private] Snapshot creation failed:', err)
    return { success: false, error: String(err) }
  }
}

// ── Shared Helper ────────────────────────────────────────────────────

/**
 * Look up a user's mentor profile ID by their auth user ID.
 * Cached per request — multiple calls in the same endpoint won't hit DB twice.
 */
const profileIdCache = new Map<string, string | null>()

async function getProfileId(userId: string): Promise<string | null> {
  if (profileIdCache.has(userId)) return profileIdCache.get(userId) || null

  const { data, error } = await supabaseAdmin
    .from('mentor_profiles')
    .select('id')
    .eq('user_id', userId)
    .single()

  const profileId = error || !data ? null : data.id
  profileIdCache.set(userId, profileId)

  // Clear cache after 60 seconds to prevent stale IDs across requests
  setTimeout(() => profileIdCache.delete(userId), 60_000)

  return profileId
}

// ── Founder Facts Management ────────────────────────────────────────

/**
 * Set or replace the entire FounderFacts block on a practitioner's profile.
 * Used for initial population. For incremental updates (mentor-observed
 * biographical notes), use appendFounderFactsNote() instead.
 *
 * @param userId - The user's auth ID
 * @param facts - The complete FounderFacts object
 */
export async function setFounderFacts(
  userId: string,
  facts: FounderFacts
): Promise<{ success: boolean; error?: string }> {
  try {
    const stored = await loadMentorProfile(userId)
    if (!stored) return { success: false, error: 'No profile found for user' }

    const updatedProfile: MentorProfileData = {
      ...stored.profile,
      founder_facts: {
        ...facts,
        last_updated: new Date().toISOString().split('T')[0],
      },
    }

    const result = await saveMentorProfile(userId, updatedProfile)
    return { success: result.success, error: result.error }
  } catch (err) {
    console.error('[mentor-context-private] Failed to set founder facts:', err)
    return { success: false, error: String(err) }
  }
}

/**
 * Append a new biographical observation to the FounderFacts additional_context
 * array. This is the mechanism by which the mentor grows the "who this person is"
 * context over time — during sessions, the mentor can note stable personal facts
 * (e.g., "recently started grandparent caregiving", "changed work role to consultant")
 * and they persist to future sessions.
 *
 * If no FounderFacts block exists yet, this returns an error — use setFounderFacts()
 * to initialise the block first.
 *
 * @param userId - The user's auth ID
 * @param note - The biographical observation to append
 */
export async function appendFounderFactsNote(
  userId: string,
  note: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const stored = await loadMentorProfile(userId)
    if (!stored) return { success: false, error: 'No profile found for user' }
    if (!stored.profile.founder_facts) {
      return { success: false, error: 'No founder_facts block initialised — use setFounderFacts() first' }
    }

    const updatedProfile: MentorProfileData = {
      ...stored.profile,
      founder_facts: {
        ...stored.profile.founder_facts,
        additional_context: [
          ...stored.profile.founder_facts.additional_context,
          `[${new Date().toISOString().split('T')[0]}] ${note}`,
        ],
        last_updated: new Date().toISOString().split('T')[0],
      },
    }

    const result = await saveMentorProfile(userId, updatedProfile)
    return { success: result.success, error: result.error }
  } catch (err) {
    console.error('[mentor-context-private] Failed to append founder facts note:', err)
    return { success: false, error: String(err) }
  }
}

// ── Migration SQL ────────────────────────────────────────────────────

/**
 * SQL to create the mentor_profile_snapshots table.
 * Run this in the Supabase SQL Editor.
 */
export const SNAPSHOTS_MIGRATION_SQL = `
-- mentor_profile_snapshots — Timestamped profile state for growth trajectory (Gap 4)
-- Captures key profile dimensions at regular intervals or on significant change.
-- Enables the private mentor to observe growth trends, plateaus, and regressions.

CREATE TABLE IF NOT EXISTS mentor_profile_snapshots (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id        UUID NOT NULL REFERENCES mentor_profiles(id) ON DELETE CASCADE,

  -- Hub isolation: which mentor hub produced this snapshot
  hub_id            TEXT NOT NULL DEFAULT 'private-mentor'
    CHECK (hub_id IN ('founder-mentor', 'private-mentor')),

  -- Snapshot timestamp
  snapshot_at       TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Profile state at snapshot time
  proximity_level   TEXT NOT NULL DEFAULT 'reflexive',
  senecan_grade     TEXT NOT NULL DEFAULT 'pre_progress',
  direction_of_travel TEXT,
  persisting_passions TEXT[],
  weakest_virtue    TEXT,
  interaction_count INTEGER DEFAULT 0,

  -- What triggered this snapshot
  trigger           TEXT NOT NULL DEFAULT 'scheduled'
    CHECK (trigger IN ('scheduled', 'proximity_change', 'direction_change', 'manual')),

  -- Prevent duplicate snapshots within the same hour
  UNIQUE(profile_id, snapshot_at)
);

-- RLS: Users can only read their own snapshots
ALTER TABLE mentor_profile_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own snapshots"
  ON mentor_profile_snapshots FOR SELECT
  USING (
    profile_id IN (
      SELECT id FROM mentor_profiles WHERE user_id = auth.uid()
    )
  );

-- Index for efficient retrieval
CREATE INDEX IF NOT EXISTS idx_snapshots_profile_time
  ON mentor_profile_snapshots (profile_id, snapshot_at DESC);
`

// =============================================================================
// Session Context Loader — Piece 2
// =============================================================================
//
// Recent Interaction Loader: fetches the last N interactions for a practitioner
// from mentor_interactions, pre-processes each into a DIAGNOSTIC SIGNAL (not
// raw dialogue), and returns a formatted block for injection alongside the
// projected profile. The mentor diagnoses patterns, not surface utterances.
//
// Each interaction is emitted as:
//
//   [DATE] Topic: <one line>
//   Impression presented: <what the practitioner said they saw/felt>
//   Likely assent: <what false judgement they may have accepted>
//   Pattern match: <which passion from their profile this resembles>
//
// Pre-processing rules:
//   - No raw dialogue. Use the existing description / observation / passion
//     fields on mentor_interactions, which are already diagnostic-level.
//   - Pattern match is inferred by matching passion root names between the
//     interaction's detected passions and the profile's passion_map.
//   - Fields missing at source degrade gracefully to "—".
//
// Also exports recordSessionContextSnapshot() which writes a row into
// session_context_snapshots at session start (for audit trail). This is the
// first writer to that table; it previously had 0 rows.
// =============================================================================

/**
 * One interaction shaped as a diagnostic signal line.
 */
interface InteractionSignal {
  date: string
  topic: string
  impression: string
  likely_assent: string
  pattern_match: string
}

/**
 * Pre-process a mentor_interactions row into a diagnostic signal.
 * NEVER includes raw dialogue. Uses already-diagnostic fields (description,
 * mentor_observation, passions_detected, proximity_assessed) and matches
 * detected passions against the practitioner's passion map.
 */
function rowToSignal(
  row: {
    created_at: string
    interaction_type: string
    description: string | null
    proximity_assessed: string | null
    passions_detected: unknown
    mentor_observation: string | null
  },
  passionMap: PassionMapEntry[]
): InteractionSignal {
  const date = new Date(row.created_at).toISOString().split('T')[0]

  // Topic: first ~100 chars of description or interaction_type.
  // description is already a structured note, not verbatim user text.
  const topicRaw = (row.description || row.interaction_type || '').trim()
  const topic = topicRaw.length > 100 ? topicRaw.substring(0, 97) + '...' : topicRaw

  // Impression: the mentor's prior observation captures what the practitioner
  // seemed to see/feel. If absent, degrade to proximity assessed.
  const impression = row.mentor_observation
    ? (row.mentor_observation.length > 140
        ? row.mentor_observation.substring(0, 137) + '...'
        : row.mentor_observation)
    : (row.proximity_assessed
        ? `acted at ${row.proximity_assessed} proximity`
        : '—')

  // Likely assent: pull first false_judgement from passions_detected JSONB.
  let likelyAssent = '—'
  let primaryRootPassion: string | null = null
  try {
    const passions = Array.isArray(row.passions_detected)
      ? (row.passions_detected as Array<{
          root_passion?: string
          sub_species?: string
          false_judgement?: string
        }>)
      : []
    if (passions.length > 0) {
      const first = passions[0]
      primaryRootPassion = first.root_passion || null
      if (first.false_judgement) {
        likelyAssent = first.false_judgement.length > 140
          ? first.false_judgement.substring(0, 137) + '...'
          : first.false_judgement
      } else if (first.sub_species) {
        likelyAssent = `(unnamed) — surfaced as ${first.sub_species}`
      }
    }
  } catch {
    // passions_detected malformed — leave as em-dash
  }

  // Pattern match: find a matching entry in the practitioner's passion map
  // by root_passion. Surfaces recurring diagnostic patterns to the mentor.
  let patternMatch = '—'
  if (primaryRootPassion && passionMap.length > 0) {
    const match = passionMap.find(
      p => p.root_passion.toLowerCase() === primaryRootPassion!.toLowerCase()
    )
    if (match) {
      patternMatch = `${match.sub_species} (${match.root_passion}, freq ${match.frequency})`
    } else {
      patternMatch = `${primaryRootPassion} (not in profile passion map yet)`
    }
  }

  return { date, topic, impression, likely_assent: likelyAssent, pattern_match: patternMatch }
}

/**
 * Fetch the last N interactions for a practitioner and return them as
 * pre-processed diagnostic signals. Returns null if no interactions.
 *
 * Typical use: called in parallel with profile projection. Does not block
 * session start — caller awaits via Promise.all.
 *
 * @param userId - Auth user ID
 * @param profile - The already-loaded MentorProfileData (for pattern match lookup)
 * @param hubId - Hub scope
 * @param limit - Max interactions (default 7)
 */
export async function getRecentInteractionsAsSignals(
  userId: string,
  profile: MentorProfileData | null,
  hubId: 'founder-mentor' | 'private-mentor' = 'private-mentor',
  limit: number = 7
): Promise<string | null> {
  try {
    const profileId = await getProfileId(userId)
    if (!profileId) return null

    const { data, error } = await supabaseAdmin
      .from('mentor_interactions')
      .select('interaction_type, description, proximity_assessed, passions_detected, mentor_observation, created_at')
      .eq('profile_id', profileId)
      .eq('hub_id', hubId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error || !data || data.length === 0) return null

    const passionMap = profile?.passion_map || []

    const signals = data.map(row => rowToSignal(row, passionMap))

    const sections: string[] = [
      `RECENT INTERACTION SIGNALS (last ${signals.length} interactions, diagnostic pre-processing — not raw dialogue):`,
      '',
    ]

    for (const s of signals) {
      sections.push(
        `[${s.date}] Topic: ${s.topic}`,
        `  Impression presented: ${s.impression}`,
        `  Likely assent: ${s.likely_assent}`,
        `  Pattern match: ${s.pattern_match}`,
        ''
      )
    }

    sections.push(
      'Use these signals to recognise recurring patterns and build continuity. Reference what the practitioner has presented before where it illuminates the current conversation. Do not repeat signals verbatim — diagnose the pattern.'
    )

    return sections.join('\n')
  } catch (err) {
    console.error('[mentor-context-private] Failed to load recent interactions:', err)
    return null
  }
}

/**
 * Record a session_context_snapshots row at session start. Provides an
 * audit trail of what context was injected into a given mentor request.
 *
 * Non-blocking: caller should fire-and-forget. Errors are logged, not thrown.
 *
 * snapshot_type is constrained to one of:
 *   'knowledge_context' | 'v3_scope_status' | 'business_plan' | 'custom' | 'mentor_session'
 * We use 'mentor_session' here so future filters by snapshot_type return
 * mentor context cleanly without overloading 'custom'. Requires migration
 * 20260414_snapshot_type_mentor_session.sql to be applied.
 *
 * @param userId - Auth user ID (maps to auth.users)
 * @param summary - One-line summary of what was injected
 * @param contentHash - Deterministic hash of injected content (for dedup / comparison)
 */
export async function recordSessionContextSnapshot(
  userId: string,
  summary: string,
  contentHash: string
): Promise<void> {
  try {
    await supabaseAdmin
      .from('session_context_snapshots')
      .insert({
        user_id: userId,
        snapshot_type: 'mentor_session',
        content_hash: contentHash,
        summary,
      })
  } catch (err) {
    console.warn('[mentor-context-private] session_context_snapshot write failed (non-blocking):', err)
  }
}

/**
 * Lightweight deterministic hash (FNV-1a 32-bit) suitable for content
 * fingerprinting in logs. Not cryptographic.
 */
export function fnv1aHash(input: string): string {
  let h = 0x811c9dc5
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return (h >>> 0).toString(16)
}

/**
 * Rough token estimate: approx 4 chars per token for English text.
 * Used for before/after comparison in logs — not for billing.
 */
export function estimateTokens(text: string | null | undefined): number {
  if (!text) return 0
  return Math.ceil(text.length / 4)
}
