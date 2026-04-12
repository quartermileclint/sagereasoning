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
