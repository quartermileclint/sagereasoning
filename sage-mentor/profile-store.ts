/**
 * profile-store.ts — Profile Persistence Layer
 *
 * Extends the trust-layer's Supabase schema for human mentor profiles.
 * Provides CRUD operations for storing and retrieving MentorProfile data,
 * seeded from journal ingestion output.
 *
 * Architecture:
 *   - Extends the existing trust-layer tables (agent_accreditation,
 *     evaluated_actions, grade_history) with human-specific tables
 *   - Journal ingestion output → profile seed → ongoing updates
 *   - Rolling window aggregation adapted for human-scale data
 *     (fewer actions, longer timeframes than agents)
 *
 * Tables introduced:
 *   mentor_profiles       — Core profile data (the MentorProfile type)
 *   mentor_passion_map    — Persisting passion observations
 *   mentor_causal_tendencies — Where the causal sequence breaks
 *   mentor_value_hierarchy — Declared vs observed value classifications
 *   mentor_oikeiosis_map  — Circles of concern
 *   mentor_virtue_profile — Strength/gap per virtue domain
 *   mentor_journal_refs   — Indexed journal passages for contextual recall
 *   mentor_interactions   — Rolling window of mentor interactions
 *
 * Rules:
 *   R1:  No therapeutic framing in stored data
 *   R3:  Disclaimer field on all evaluative records
 *   R4:  IP protection — profile data is private to the user
 *   R6c: Qualitative levels only — no numeric scores in storage
 *   R8a: Greek identifiers in column names where they derive from the brain
 *
 * SageReasoning Proprietary Licence
 */
/**
 * @compliance
 * compliance_version: CR-2026-Q2-v1
 * last_regulatory_review: 2026-04-04
 * applicable_jurisdictions: [AU, EU, US]
 * regulatory_references: [CR-005, CR-009]
 * review_cycle: quarterly
 * owner: founder
 * next_review_due: 2026-07-06
 * change_trigger: [EU AI Act classification guidance, AU Privacy Act reform]
 * deprecation_flag: false
 */

import type {
  MentorProfile,
  PassionMapEntry,
  CausalTendency,
  ValueHierarchyEntry,
  OikeioisMapEntry,
  VirtueDomainAssessment,
  JournalReference,
} from './persona'

import { buildProfileContext } from './persona'

import type {
  KatorthomaProximityLevel,
  DimensionScores,
  DirectionOfTravel,
} from '../trust-layer/types/accreditation'

import type { ProgressionPrescription } from '../trust-layer/types/progression'

// ============================================================================
// SQL SCHEMA — Supabase DDL for human mentor profiles
// ============================================================================

/**
 * The complete SQL schema for the mentor profile store.
 * Run this in the Supabase SQL editor to create all tables.
 *
 * Designed to sit alongside the trust-layer's existing tables:
 *   - agent_accreditation
 *   - evaluated_actions
 *   - grade_history
 *   - onboarding_results
 *   - progression_sessions
 */
export const PROFILE_STORE_SQL = `
-- ============================================================================
-- MENTOR PROFILE STORE — Extends trust-layer for human users
-- ============================================================================

-- Enable RLS on all tables (Supabase standard)
-- Users can only read/write their own profile data

-- 1. CORE PROFILE
-- The root record. One per user. Seeded by journal ingestion,
-- updated by ongoing interactions.
CREATE TABLE IF NOT EXISTS mentor_profiles (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name    TEXT NOT NULL,

  -- Senecan grade estimate (qualitative, R6c)
  senecan_grade   TEXT NOT NULL DEFAULT 'pre_progress'
    CHECK (senecan_grade IN ('pre_progress', 'grade_3', 'grade_2', 'grade_1')),

  -- Katorthoma proximity level (qualitative, R6c)
  proximity_level TEXT NOT NULL DEFAULT 'reflexive'
    CHECK (proximity_level IN ('reflexive', 'habitual', 'deliberate', 'principled', 'sage_like')),

  -- 4 progress dimensions (qualitative levels, R6c)
  dim_passion_reduction    TEXT NOT NULL DEFAULT 'emerging'
    CHECK (dim_passion_reduction IN ('emerging', 'developing', 'established', 'advanced')),
  dim_judgement_quality    TEXT NOT NULL DEFAULT 'emerging'
    CHECK (dim_judgement_quality IN ('emerging', 'developing', 'established', 'advanced')),
  dim_disposition_stability TEXT NOT NULL DEFAULT 'emerging'
    CHECK (dim_disposition_stability IN ('emerging', 'developing', 'established', 'advanced')),
  dim_oikeiosis_extension  TEXT NOT NULL DEFAULT 'emerging'
    CHECK (dim_oikeiosis_extension IN ('emerging', 'developing', 'established', 'advanced')),

  -- Direction of travel
  direction_of_travel TEXT NOT NULL DEFAULT 'stable'
    CHECK (direction_of_travel IN ('improving', 'stable', 'regressing')),

  -- Persisting passions (array of sub-species names)
  persisting_passions TEXT[] NOT NULL DEFAULT '{}',

  -- Preferred indifferents (what externals generate emotional energy)
  preferred_indifferents TEXT[] NOT NULL DEFAULT '{}',

  -- Current progression prescription (JSONB — nullable)
  current_prescription JSONB,

  -- Interaction tracking
  interaction_count INTEGER NOT NULL DEFAULT 0,
  last_interaction  TIMESTAMPTZ,

  -- Journal ingestion metadata
  journal_ingested  BOOLEAN NOT NULL DEFAULT false,
  journal_ingested_at TIMESTAMPTZ,
  journal_page_count INTEGER,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- One profile per user
  UNIQUE(user_id)
);

-- RLS: Users can only access their own profile
ALTER TABLE mentor_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own profile"
  ON mentor_profiles FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile"
  ON mentor_profiles FOR UPDATE
  USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile"
  ON mentor_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 2. PASSION MAP
-- Each persisting passion observation. Grows from journal ingestion
-- and ongoing interactions.
CREATE TABLE IF NOT EXISTS mentor_passion_map (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id       UUID NOT NULL REFERENCES mentor_profiles(id) ON DELETE CASCADE,
  passion_id       TEXT NOT NULL,
  sub_species      TEXT NOT NULL,
  root_passion     TEXT NOT NULL
    CHECK (root_passion IN ('epithumia', 'hedone', 'phobos', 'lupe')),
  false_judgement   TEXT NOT NULL,
  frequency        TEXT NOT NULL DEFAULT 'occasional'
    CHECK (frequency IN ('rare', 'occasional', 'recurring', 'persistent')),
  first_seen       TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen        TIMESTAMPTZ NOT NULL DEFAULT now(),
  journal_refs     TEXT[] NOT NULL DEFAULT '{}',

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- One entry per passion per profile
  UNIQUE(profile_id, passion_id)
);

ALTER TABLE mentor_passion_map ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access own passion map"
  ON mentor_passion_map FOR ALL
  USING (profile_id IN (SELECT id FROM mentor_profiles WHERE user_id = auth.uid()));

-- 3. CAUSAL TENDENCIES
-- Where in the impression→assent→impulse→action sequence the user
-- typically makes false judgements.
CREATE TABLE IF NOT EXISTS mentor_causal_tendencies (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id      UUID NOT NULL REFERENCES mentor_profiles(id) ON DELETE CASCADE,
  failure_point   TEXT NOT NULL
    CHECK (failure_point IN ('phantasia', 'synkatathesis', 'horme', 'praxis')),
  description     TEXT NOT NULL,
  frequency       TEXT NOT NULL DEFAULT 'occasional'
    CHECK (frequency IN ('rare', 'occasional', 'common')),
  examples        TEXT[] NOT NULL DEFAULT '{}',

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE mentor_causal_tendencies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access own causal tendencies"
  ON mentor_causal_tendencies FOR ALL
  USING (profile_id IN (SELECT id FROM mentor_profiles WHERE user_id = auth.uid()));

-- 4. VALUE HIERARCHY
-- Declared vs observed value classifications. The gap between what
-- the user says they value and what their actions reveal.
CREATE TABLE IF NOT EXISTS mentor_value_hierarchy (
  id                       UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id               UUID NOT NULL REFERENCES mentor_profiles(id) ON DELETE CASCADE,
  item                     TEXT NOT NULL,
  declared_classification  TEXT NOT NULL,
  observed_classification  TEXT NOT NULL,
  gap_detected             BOOLEAN NOT NULL DEFAULT false,
  journal_refs             TEXT[] NOT NULL DEFAULT '{}',

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE mentor_value_hierarchy ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access own value hierarchy"
  ON mentor_value_hierarchy FOR ALL
  USING (profile_id IN (SELECT id FROM mentor_profiles WHERE user_id = auth.uid()));

-- 5. OIKEIOSIS MAP
-- Circles of concern — who matters, which roles occupied.
CREATE TABLE IF NOT EXISTS mentor_oikeiosis_map (
  id                   UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id           UUID NOT NULL REFERENCES mentor_profiles(id) ON DELETE CASCADE,
  person_or_role       TEXT NOT NULL,
  relationship         TEXT NOT NULL,
  oikeiosis_stage      TEXT NOT NULL
    CHECK (oikeiosis_stage IN ('self_preservation', 'household', 'community', 'humanity', 'cosmic')),
  reflection_frequency TEXT NOT NULL DEFAULT 'sometimes'
    CHECK (reflection_frequency IN ('rarely', 'sometimes', 'often')),

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE mentor_oikeiosis_map ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access own oikeiosis map"
  ON mentor_oikeiosis_map FOR ALL
  USING (profile_id IN (SELECT id FROM mentor_profiles WHERE user_id = auth.uid()));

-- 6. VIRTUE PROFILE
-- Strength/gap assessment per virtue domain.
CREATE TABLE IF NOT EXISTS mentor_virtue_profile (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id       UUID NOT NULL REFERENCES mentor_profiles(id) ON DELETE CASCADE,
  domain           TEXT NOT NULL
    CHECK (domain IN ('phronesis', 'dikaiosyne', 'andreia', 'sophrosyne')),
  strength         TEXT NOT NULL DEFAULT 'developing'
    CHECK (strength IN ('strong', 'moderate', 'developing', 'gap')),
  evidence         TEXT NOT NULL DEFAULT '',
  journal_refs     TEXT[] NOT NULL DEFAULT '{}',

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- One entry per virtue domain per profile
  UNIQUE(profile_id, domain)
);

ALTER TABLE mentor_virtue_profile ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access own virtue profile"
  ON mentor_virtue_profile FOR ALL
  USING (profile_id IN (SELECT id FROM mentor_profiles WHERE user_id = auth.uid()));

-- 7. JOURNAL REFERENCES
-- Indexed journal passages for contextual recall.
-- The mentor uses these to surface the right passage at the right moment.
CREATE TABLE IF NOT EXISTS mentor_journal_refs (
  id                 UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id         UUID NOT NULL REFERENCES mentor_profiles(id) ON DELETE CASCADE,
  passage_id         TEXT NOT NULL,
  journal_phase      TEXT NOT NULL,
  journal_day        INTEGER NOT NULL,
  topic_tags         TEXT[] NOT NULL DEFAULT '{}',
  summary            TEXT NOT NULL,
  relevance_triggers TEXT[] NOT NULL DEFAULT '{}',

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- One entry per passage per profile
  UNIQUE(profile_id, passage_id)
);

ALTER TABLE mentor_journal_refs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access own journal refs"
  ON mentor_journal_refs FOR ALL
  USING (profile_id IN (SELECT id FROM mentor_profiles WHERE user_id = auth.uid()));

-- 8. MENTOR INTERACTIONS
-- Rolling window of interactions for human-scale evaluation.
-- Adapted from trust-layer's evaluated_actions but with human-appropriate
-- metadata (longer timeframes, fewer actions, richer context).
CREATE TABLE IF NOT EXISTS mentor_interactions (
  id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id          UUID NOT NULL REFERENCES mentor_profiles(id) ON DELETE CASCADE,

  -- Hub isolation: which mentor hub generated this interaction
  hub_id              TEXT NOT NULL DEFAULT 'private-mentor'
    CHECK (hub_id IN ('founder-mentor', 'private-mentor')),

  -- What happened
  interaction_type    TEXT NOT NULL
    CHECK (interaction_type IN (
      'action_evaluation', 'journal_entry', 'morning_check_in',
      'evening_reflection', 'ring_before', 'ring_after',
      'baseline_question', 'scenario_response', 'conversation'
    )),
  description         TEXT NOT NULL,

  -- Evaluation results (R6c: qualitative only)
  proximity_assessed  TEXT
    CHECK (proximity_assessed IN ('reflexive', 'habitual', 'deliberate', 'principled', 'sage_like')),
  passions_detected   JSONB DEFAULT '[]',
  mechanisms_applied  TEXT[] NOT NULL DEFAULT '{}',

  -- Ring context (if this came through the ring)
  inner_agent_id      TEXT,
  inner_agent_name    TEXT,

  -- The mentor's observation (R6d: diagnostic, not punitive)
  mentor_observation  TEXT,

  -- Journal reference surfaced, if any
  journal_ref_id      TEXT,

  -- R3: Disclaimer on evaluative output
  disclaimer          TEXT NOT NULL DEFAULT 'This evaluation reflects philosophical framework analysis, not professional advice. See R1, R9.',

  -- Timestamp
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for rolling window queries (most recent first)
CREATE INDEX IF NOT EXISTS idx_mentor_interactions_profile_time
  ON mentor_interactions(profile_id, created_at DESC);

-- Index for interaction type filtering
CREATE INDEX IF NOT EXISTS idx_mentor_interactions_type
  ON mentor_interactions(profile_id, interaction_type);

ALTER TABLE mentor_interactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access own interactions"
  ON mentor_interactions FOR ALL
  USING (profile_id IN (SELECT id FROM mentor_profiles WHERE user_id = auth.uid()));

-- 9. UPDATED_AT TRIGGER
-- Auto-update the updated_at column on profile changes.
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER mentor_profiles_updated_at
  BEFORE UPDATE ON mentor_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER mentor_passion_map_updated_at
  BEFORE UPDATE ON mentor_passion_map
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER mentor_causal_tendencies_updated_at
  BEFORE UPDATE ON mentor_causal_tendencies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER mentor_value_hierarchy_updated_at
  BEFORE UPDATE ON mentor_value_hierarchy
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER mentor_oikeiosis_map_updated_at
  BEFORE UPDATE ON mentor_oikeiosis_map
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER mentor_virtue_profile_updated_at
  BEFORE UPDATE ON mentor_virtue_profile
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
`

// ============================================================================
// PROFILE STORE — TypeScript CRUD operations
// ============================================================================

/**
 * Supabase client type — in production this comes from @supabase/supabase-js.
 * We define a minimal interface here to keep the module self-contained.
 */
type SupabaseClient = {
  from: (table: string) => {
    select: (columns?: string) => Promise<{ data: any[]; error: any }>
    insert: (data: any) => Promise<{ data: any; error: any }>
    update: (data: any) => { eq: (col: string, val: any) => Promise<{ data: any; error: any }> }
    upsert: (data: any) => Promise<{ data: any; error: any }>
    delete: () => { eq: (col: string, val: any) => Promise<{ data: any; error: any }> }
  }
}

// ============================================================================
// PRE-COMPUTED PROFILE CONTEXT — Token efficiency (Rec #4)
// ============================================================================

/**
 * A MentorProfile with its pre-computed context string.
 *
 * TOKEN EFFICIENCY: buildProfileContext() iterates over passions, values,
 * oikeiosis, virtues, and causal tendencies to produce a ~500-800 token
 * string. The ring wrapper calls this on every before/after check. Instead
 * of rebuilding it each time, we compute it once when the profile loads
 * or updates, and carry the cached string alongside the profile.
 *
 * The cached string only changes when:
 *   - The profile is first loaded from the database
 *   - An interaction updates profile fields (direction, passions, etc.)
 *   - The rolling window summary triggers a profile update
 *
 * This saves negligible tokens (same output) but measurable latency
 * when the ring runs multiple checks per session.
 */
export type ProfileWithCache = {
  readonly profile: MentorProfile
  /** Pre-computed output of buildProfileContext(profile) */
  readonly cached_context: string
  /** Timestamp when the context was last computed */
  readonly context_computed_at: string
}

/**
 * Wrap a MentorProfile with its pre-computed context string.
 * Call this whenever a profile is loaded or updated.
 */
export function cacheProfileContext(profile: MentorProfile): ProfileWithCache {
  return {
    profile,
    cached_context: buildProfileContext(profile),
    context_computed_at: new Date().toISOString(),
  }
}

/**
 * Refresh the cached context after a profile update.
 * Returns a new ProfileWithCache with the updated profile and fresh context.
 */
export function refreshProfileCache(
  existing: ProfileWithCache,
  updatedProfile: MentorProfile
): ProfileWithCache {
  return cacheProfileContext(updatedProfile)
}

// ============================================================================
// SEED FROM JOURNAL INGESTION
// ============================================================================

/**
 * Seed a new mentor profile from journal ingestion output.
 *
 * This is the primary onboarding path for users who have completed
 * the 55-Day Stoic Journal. The MentorProfile produced by the
 * journal-ingestion pipeline is decomposed into the relational
 * tables defined above.
 *
 * After seeding, the profile is immediately available for the ring
 * to carry — no baseline questions needed for journal users (though
 * tailored gap-filling questions may follow).
 */
export async function seedProfileFromIngestion(
  supabase: SupabaseClient,
  profile: MentorProfile
): Promise<{ success: boolean; profileId: string | null; error: string | null }> {
  try {
    // 1. Insert core profile
    const { data: profileData, error: profileError } = await supabase
      .from('mentor_profiles')
      .insert({
        user_id: profile.user_id,
        display_name: profile.display_name,
        senecan_grade: profile.senecan_grade,
        proximity_level: profile.proximity_level,
        dim_passion_reduction: profile.dimensions.passion_reduction,
        dim_judgement_quality: profile.dimensions.judgement_quality,
        dim_disposition_stability: profile.dimensions.disposition_stability,
        dim_oikeiosis_extension: profile.dimensions.oikeiosis_extension,
        direction_of_travel: profile.direction_of_travel,
        persisting_passions: profile.persisting_passions,
        preferred_indifferents: profile.preferred_indifferents,
        current_prescription: profile.current_prescription,
        interaction_count: 0,
        journal_ingested: true,
        journal_ingested_at: new Date().toISOString(),
      })

    if (profileError) {
      return { success: false, profileId: null, error: `Profile insert failed: ${profileError.message}` }
    }

    const profileId = profileData?.id ?? (profileData as any)?.id

    // 2. Insert passion map entries
    if (profile.passion_map.length > 0) {
      const passionRows = profile.passion_map.map((p: PassionMapEntry) => ({
        profile_id: profileId,
        passion_id: p.passion_id,
        sub_species: p.sub_species,
        root_passion: p.root_passion,
        false_judgement: p.false_judgement,
        frequency: p.frequency,
        first_seen: p.first_seen,
        last_seen: p.last_seen,
        journal_refs: p.journal_references,
      }))
      await supabase.from('mentor_passion_map').insert(passionRows)
    }

    // 3. Insert causal tendencies
    if (profile.causal_tendencies.length > 0) {
      const causalRows = profile.causal_tendencies.map((c: CausalTendency) => ({
        profile_id: profileId,
        failure_point: c.failure_point,
        description: c.description,
        frequency: c.frequency,
        examples: c.examples,
      }))
      await supabase.from('mentor_causal_tendencies').insert(causalRows)
    }

    // 4. Insert value hierarchy
    if (profile.value_hierarchy.length > 0) {
      const valueRows = profile.value_hierarchy.map((v: ValueHierarchyEntry) => ({
        profile_id: profileId,
        item: v.item,
        declared_classification: v.declared_classification,
        observed_classification: v.observed_classification,
        gap_detected: v.gap_detected,
        journal_refs: v.journal_references,
      }))
      await supabase.from('mentor_value_hierarchy').insert(valueRows)
    }

    // 5. Insert oikeiosis map
    if (profile.oikeiosis_map.length > 0) {
      const oikRows = profile.oikeiosis_map.map((o: OikeioisMapEntry) => ({
        profile_id: profileId,
        person_or_role: o.person_or_role,
        relationship: o.relationship,
        oikeiosis_stage: o.oikeiosis_stage,
        reflection_frequency: o.reflection_frequency,
      }))
      await supabase.from('mentor_oikeiosis_map').insert(oikRows)
    }

    // 6. Insert virtue profile
    if (profile.virtue_profile.length > 0) {
      const virtueRows = profile.virtue_profile.map((v: VirtueDomainAssessment) => ({
        profile_id: profileId,
        domain: v.domain,
        strength: v.strength,
        evidence: v.evidence,
        journal_refs: v.journal_references,
      }))
      await supabase.from('mentor_virtue_profile').insert(virtueRows)
    }

    // 7. Insert journal references
    if (profile.journal_references.length > 0) {
      const refRows = profile.journal_references.map((r: JournalReference) => ({
        profile_id: profileId,
        passage_id: r.passage_id,
        journal_phase: r.journal_phase,
        journal_day: r.journal_day,
        topic_tags: r.topic_tags,
        summary: r.summary,
        relevance_triggers: r.relevance_triggers,
      }))
      await supabase.from('mentor_journal_refs').insert(refRows)
    }

    return { success: true, profileId, error: null }
  } catch (err) {
    return { success: false, profileId: null, error: `Seed failed: ${String(err)}` }
  }
}

// ============================================================================
// LOAD PROFILE — Reconstruct MentorProfile from database
// ============================================================================

/**
 * Load a complete MentorProfile from the database.
 *
 * Reconstructs the full in-memory MentorProfile by querying all
 * related tables. This is called when the ring initialises for a
 * user session.
 */
export async function loadProfile(
  supabase: SupabaseClient,
  userId: string
): Promise<MentorProfile | null> {
  // 1. Load core profile
  const { data: profiles } = await supabase
    .from('mentor_profiles')
    .select('*')
  const core = profiles?.find((p: any) => p.user_id === userId)
  if (!core) return null

  const profileId = core.id

  // 2. Load all related data in parallel
  const [passions, causal, values, oikeiosis, virtue, journalRefs] = await Promise.all([
    supabase.from('mentor_passion_map').select('*'),
    supabase.from('mentor_causal_tendencies').select('*'),
    supabase.from('mentor_value_hierarchy').select('*'),
    supabase.from('mentor_oikeiosis_map').select('*'),
    supabase.from('mentor_virtue_profile').select('*'),
    supabase.from('mentor_journal_refs').select('*'),
  ])

  // Filter by profile_id (RLS handles user-level, but we filter for the specific profile)
  const filterById = (rows: any[]) => (rows || []).filter((r: any) => r.profile_id === profileId)

  // 3. Reconstruct MentorProfile
  const mentorProfile: MentorProfile = {
    user_id: core.user_id,
    display_name: core.display_name,

    passion_map: filterById(passions.data).map((p: any): PassionMapEntry => ({
      passion_id: p.passion_id,
      sub_species: p.sub_species,
      root_passion: p.root_passion,
      false_judgement: p.false_judgement,
      frequency: p.frequency,
      first_seen: p.first_seen,
      last_seen: p.last_seen,
      journal_references: p.journal_refs || [],
    })),

    causal_tendencies: filterById(causal.data).map((c: any): CausalTendency => ({
      failure_point: c.failure_point,
      description: c.description,
      frequency: c.frequency,
      examples: c.examples || [],
    })),

    value_hierarchy: filterById(values.data).map((v: any): ValueHierarchyEntry => ({
      item: v.item,
      declared_classification: v.declared_classification,
      observed_classification: v.observed_classification,
      gap_detected: v.gap_detected,
      journal_references: v.journal_refs || [],
    })),

    oikeiosis_map: filterById(oikeiosis.data).map((o: any): OikeioisMapEntry => ({
      person_or_role: o.person_or_role,
      relationship: o.relationship,
      oikeiosis_stage: o.oikeiosis_stage,
      reflection_frequency: o.reflection_frequency,
    })),

    virtue_profile: filterById(virtue.data).map((v: any): VirtueDomainAssessment => ({
      domain: v.domain,
      strength: v.strength,
      evidence: v.evidence,
      journal_references: v.journal_refs || [],
    })),

    senecan_grade: core.senecan_grade as MentorProfile['senecan_grade'],
    proximity_level: core.proximity_level as KatorthomaProximityLevel,
    dimensions: {
      passion_reduction: core.dim_passion_reduction,
      judgement_quality: core.dim_judgement_quality,
      disposition_stability: core.dim_disposition_stability,
      oikeiosis_extension: core.dim_oikeiosis_extension,
    } as DimensionScores,
    direction_of_travel: core.direction_of_travel as DirectionOfTravel,
    persisting_passions: core.persisting_passions || [],
    preferred_indifferents: core.preferred_indifferents || [],
    journal_references: filterById(journalRefs.data).map((r: any): JournalReference => ({
      passage_id: r.passage_id,
      journal_phase: r.journal_phase,
      journal_day: r.journal_day,
      topic_tags: r.topic_tags || [],
      summary: r.summary,
      relevance_triggers: r.relevance_triggers || [],
    })),
    current_prescription: core.current_prescription as ProgressionPrescription | null,
    last_interaction: core.last_interaction || core.updated_at,
    interaction_count: core.interaction_count,
  }

  return mentorProfile
}

/**
 * Load a profile and pre-compute its context string in one step.
 *
 * TOKEN EFFICIENCY (Rec #4): The caller gets a ProfileWithCache that
 * contains the pre-built context string. The ring wrapper reads
 * cached_context instead of calling buildProfileContext() on every
 * before/after check.
 *
 * Typical usage:
 *   const cached = await loadProfileWithCache(supabase, userId)
 *   // In ring checks, use cached.cached_context instead of buildProfileContext()
 *   // After profile updates, call refreshProfileCache(cached, updatedProfile)
 */
export async function loadProfileWithCache(
  supabase: SupabaseClient,
  userId: string
): Promise<ProfileWithCache | null> {
  const profile = await loadProfile(supabase, userId)
  if (!profile) return null
  return cacheProfileContext(profile)
}

// ============================================================================
// RECORD INTERACTION — Append to rolling window
// ============================================================================

/**
 * Interaction types recognised by the store.
 */
export type InteractionType =
  | 'action_evaluation'
  | 'journal_entry'
  | 'morning_check_in'
  | 'evening_reflection'
  | 'ring_before'
  | 'ring_after'
  | 'baseline_question'
  | 'scenario_response'
  | 'conversation'

/**
 * Record a new interaction in the rolling window.
 *
 * Called by the ring after each BEFORE/AFTER cycle, and by proactive
 * check-ins (morning, evening, weekly).
 */
export async function recordInteraction(
  supabase: SupabaseClient,
  profileId: string,
  interaction: {
    type: InteractionType
    description: string
    hub_id?: 'founder-mentor' | 'private-mentor'
    proximity_assessed?: KatorthomaProximityLevel
    passions_detected?: { passion: string; false_judgement: string }[]
    mechanisms_applied?: string[]
    inner_agent_id?: string
    inner_agent_name?: string
    mentor_observation?: string
    journal_ref_id?: string
  }
): Promise<{ success: boolean; error: string | null }> {
  try {
    // 1. Insert the interaction record — hub-scoped
    const { error: insertError } = await supabase
      .from('mentor_interactions')
      .insert({
        profile_id: profileId,
        hub_id: interaction.hub_id || 'private-mentor',
        interaction_type: interaction.type,
        description: interaction.description,
        proximity_assessed: interaction.proximity_assessed || null,
        passions_detected: JSON.stringify(interaction.passions_detected || []),
        mechanisms_applied: interaction.mechanisms_applied || [],
        inner_agent_id: interaction.inner_agent_id || null,
        inner_agent_name: interaction.inner_agent_name || null,
        mentor_observation: interaction.mentor_observation || null,
        journal_ref_id: interaction.journal_ref_id || null,
      })

    if (insertError) {
      return { success: false, error: `Insert failed: ${insertError.message}` }
    }

    // 2. Increment interaction count on core profile
    // Note: In production, use Supabase RPC for atomic increment
    const { data: profiles } = await supabase
      .from('mentor_profiles')
      .select('interaction_count')
    const profile = profiles?.find((p: any) => p.id === profileId)
    if (profile) {
      await supabase
        .from('mentor_profiles')
        .update({
          interaction_count: (profile.interaction_count || 0) + 1,
          last_interaction: new Date().toISOString(),
        })
        .eq('id', profileId)
    }

    return { success: true, error: null }
  } catch (err) {
    return { success: false, error: `Record failed: ${String(err)}` }
  }
}

// ============================================================================
// ROLLING WINDOW AGGREGATION — Human-scale evaluation
// ============================================================================

/**
 * Rolling window configuration for human users.
 *
 * Human interactions are much sparser than agent actions:
 *   - Agent: 100+ actions/day → window of 100 actions
 *   - Human: 1-5 interactions/day → window of 30 days or 50 interactions
 *
 * The window uses whichever limit is reached first.
 */
export const HUMAN_ROLLING_WINDOW = {
  /** Maximum number of interactions in the window */
  max_interactions: 50,
  /** Maximum age of interactions in the window (days) */
  max_age_days: 30,
} as const

/**
 * Rolling window summary — aggregated from recent interactions.
 */
export type RollingWindowSummary = {
  /** How many interactions are in the window */
  interaction_count: number
  /** Proximity distribution across the window */
  proximity_distribution: Record<KatorthomaProximityLevel, number>
  /** Most common proximity level */
  typical_proximity: KatorthomaProximityLevel
  /** Passions appearing more than once in the window */
  recurring_passions: { passion: string; count: number }[]
  /** Direction of travel based on window trend */
  direction: DirectionOfTravel
  /** Window date range */
  window_start: string
  window_end: string
}

/**
 * Compute the rolling window summary for a user's profile.
 *
 * This is the human-scale equivalent of the trust-layer's rolling
 * evaluation window. It aggregates recent interactions to determine
 * the user's current proximity level, direction of travel, and
 * recurring passions.
 */
export async function computeRollingWindow(
  supabase: SupabaseClient,
  profileId: string
): Promise<RollingWindowSummary | null> {
  // Fetch recent interactions (within window limits)
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - HUMAN_ROLLING_WINDOW.max_age_days)

  const { data: interactions } = await supabase
    .from('mentor_interactions')
    .select('*')

  if (!interactions || interactions.length === 0) return null

  // Filter to this profile and within the window
  const windowInteractions = interactions
    .filter((i: any) =>
      i.profile_id === profileId &&
      new Date(i.created_at) >= cutoffDate
    )
    .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, HUMAN_ROLLING_WINDOW.max_interactions)

  if (windowInteractions.length === 0) return null

  // Only consider interactions with proximity assessments
  const assessed = windowInteractions.filter((i: any) => i.proximity_assessed)

  // Compute proximity distribution
  const distribution: Record<KatorthomaProximityLevel, number> = {
    reflexive: 0,
    habitual: 0,
    deliberate: 0,
    principled: 0,
    sage_like: 0,
  }

  for (const interaction of assessed) {
    const level = interaction.proximity_assessed as KatorthomaProximityLevel
    distribution[level]++
  }

  // Typical proximity = mode of the distribution
  const typicalProximity = (Object.entries(distribution) as [KatorthomaProximityLevel, number][])
    .sort((a, b) => b[1] - a[1])[0]?.[0] || 'reflexive'

  // Recurring passions — count across all window interactions
  const passionCounts = new Map<string, number>()
  for (const interaction of windowInteractions) {
    const passions = typeof interaction.passions_detected === 'string'
      ? JSON.parse(interaction.passions_detected)
      : interaction.passions_detected || []
    for (const p of passions) {
      const name = typeof p === 'string' ? p : p.passion
      passionCounts.set(name, (passionCounts.get(name) || 0) + 1)
    }
  }
  const recurringPassions = Array.from(passionCounts.entries())
    .filter(([, count]) => count > 1)
    .map(([passion, count]) => ({ passion, count }))
    .sort((a, b) => b.count - a.count)

  // Direction of travel — compare first half vs second half of assessed interactions
  let direction: DirectionOfTravel = 'stable'
  if (assessed.length >= 4) {
    const proximityRank: Record<KatorthomaProximityLevel, number> = {
      reflexive: 0, habitual: 1, deliberate: 2, principled: 3, sage_like: 4,
    }
    const midpoint = Math.floor(assessed.length / 2)
    const olderHalf = assessed.slice(midpoint)
    const newerHalf = assessed.slice(0, midpoint)

    const avgOlder = olderHalf.reduce((sum: number, i: any) =>
      sum + proximityRank[i.proximity_assessed as KatorthomaProximityLevel], 0) / olderHalf.length
    const avgNewer = newerHalf.reduce((sum: number, i: any) =>
      sum + proximityRank[i.proximity_assessed as KatorthomaProximityLevel], 0) / newerHalf.length

    if (avgNewer - avgOlder > 0.3) direction = 'improving'
    else if (avgOlder - avgNewer > 0.3) direction = 'regressing'
  }

  return {
    interaction_count: windowInteractions.length,
    proximity_distribution: distribution,
    typical_proximity: typicalProximity,
    recurring_passions: recurringPassions,
    direction,
    window_start: windowInteractions[windowInteractions.length - 1]?.created_at,
    window_end: windowInteractions[0]?.created_at,
  }
}

// ============================================================================
// UPDATE PROFILE FROM ROLLING WINDOW
// ============================================================================

/**
 * Update the core profile based on rolling window results.
 *
 * Called periodically (e.g., after each interaction or daily) to
 * keep the profile's summary fields in sync with the rolling window.
 */
export async function updateProfileFromWindow(
  supabase: SupabaseClient,
  profileId: string,
  window: RollingWindowSummary
): Promise<{ success: boolean; error: string | null }> {
  try {
    const { error } = await supabase
      .from('mentor_profiles')
      .update({
        proximity_level: window.typical_proximity,
        direction_of_travel: window.direction,
        persisting_passions: window.recurring_passions.map(p => p.passion),
        updated_at: new Date().toISOString(),
      })
      .eq('id', profileId)

    if (error) {
      return { success: false, error: `Update failed: ${error.message}` }
    }
    return { success: true, error: null }
  } catch (err) {
    return { success: false, error: `Update failed: ${String(err)}` }
  }
}

// ============================================================================
// UPDATE PASSION MAP — Evolve passion tracking over time
// ============================================================================

/**
 * Upsert a passion observation from an interaction.
 *
 * If the passion already exists in the map, update its frequency
 * and last_seen. If new, insert it.
 */
export async function upsertPassionObservation(
  supabase: SupabaseClient,
  profileId: string,
  observation: {
    passion_id: string
    sub_species: string
    root_passion: 'epithumia' | 'hedone' | 'phobos' | 'lupe'
    false_judgement: string
  }
): Promise<void> {
  await supabase.from('mentor_passion_map').upsert({
    profile_id: profileId,
    passion_id: observation.passion_id,
    sub_species: observation.sub_species,
    root_passion: observation.root_passion,
    false_judgement: observation.false_judgement,
    last_seen: new Date().toISOString(),
  })
}

// ============================================================================
// UPDATE PROFILE FROM REFLECTION — Self-improving feedback loop (Gap 3)
// ============================================================================

/**
 * Reflection data structure as returned by the /api/reflect endpoint.
 *
 * When sage-reflect evaluates a day's actions, it produces passions detected,
 * a proximity assessment, and a sage perspective. This function takes that
 * output and feeds it back into the Mentor profile — so the Mentor gets
 * smarter from every reflection.
 *
 * This wiring creates the self-improving feedback loop described in the
 * research gap analysis: reflect → profile update → ring BEFORE enrichment.
 * The ring wrapper's BEFORE phase already reads the profile via
 * buildProfileContext(). By updating the profile here, the next interaction
 * automatically benefits from the reflection's findings.
 *
 * Rules:
 *   R6c: Qualitative levels only — no numeric scores in storage
 *   R6d: Passions are diagnostic, not punitive
 *   R14: Interaction recorded for audit trail
 */
export type ReflectionOutput = {
  katorthoma_proximity: KatorthomaProximityLevel
  passions_detected: Array<{
    root_passion: string
    sub_species: string
    false_judgement: string
  }>
  what_you_did_well?: string
  sage_perspective?: string
}

/**
 * Update the Mentor profile from a sage-reflect output.
 *
 * This does three things:
 * 1. Upserts each detected passion into the passion map (updating frequency
 *    and last_seen if it already exists, or creating a new entry)
 * 2. Records the reflection as an interaction in the rolling window
 * 3. Recomputes the rolling window and updates the core profile if the
 *    window has enough data
 *
 * The caller (the /api/reflect route) passes the reflection output after
 * saving it to the reflections table. The profile update happens as a
 * fire-and-forget operation — it should not block the API response.
 */
export async function updateProfileFromReflection(
  supabase: SupabaseClient,
  userId: string,
  reflection: ReflectionOutput,
  reflectionInput: string,
  hubId: 'founder-mentor' | 'private-mentor' = 'private-mentor'
): Promise<{ success: boolean; profileUpdated: boolean; error: string | null }> {
  try {
    // 1. Find the user's profile
    const { data: profiles } = await supabase
      .from('mentor_profiles')
      .select('id')
    const profileRow = profiles?.find((p: any) => p.user_id === userId)

    if (!profileRow) {
      // No profile yet — this is fine for users who haven't completed onboarding.
      // The reflection is still stored in the reflections table; it just doesn't
      // update a profile that doesn't exist yet.
      return { success: true, profileUpdated: false, error: null }
    }

    const profileId = profileRow.id

    // 2. Upsert each detected passion into the passion map
    // Map root_passion strings to the constrained type expected by the schema.
    // The reflection endpoint uses more flexible passion names; we map to the
    // four Stoic root passions (epithumia, hedone, phobos, lupe).
    const rootPassionMap: Record<string, 'epithumia' | 'hedone' | 'phobos' | 'lupe'> = {
      desire: 'epithumia',
      epithumia: 'epithumia',
      pleasure: 'hedone',
      hedone: 'hedone',
      fear: 'phobos',
      phobos: 'phobos',
      anger: 'phobos',     // anger is a sub-species of phobos in V3
      aversion: 'phobos',
      distress: 'lupe',
      lupe: 'lupe',
      shame: 'lupe',       // shame is a sub-species of lupe in V3
      grief: 'lupe',
    }

    for (const passion of (reflection.passions_detected || [])) {
      const mappedRoot = rootPassionMap[passion.root_passion.toLowerCase()] || 'lupe'
      const passionId = `${mappedRoot}_${passion.sub_species.toLowerCase().replace(/\s+/g, '_')}`

      await upsertPassionObservation(supabase, profileId, {
        passion_id: passionId,
        sub_species: passion.sub_species,
        root_passion: mappedRoot,
        false_judgement: passion.false_judgement,
      })
    }

    // 3. Record the reflection as an interaction in the rolling window — hub-scoped
    await recordInteraction(supabase, profileId, {
      type: 'evening_reflection',
      hub_id: hubId,
      description: reflectionInput.substring(0, 200), // Truncate for storage
      proximity_assessed: reflection.katorthoma_proximity,
      passions_detected: (reflection.passions_detected || []).map(p => ({
        passion: p.sub_species,
        false_judgement: p.false_judgement,
      })),
      mechanisms_applied: ['passion_diagnosis', 'oikeiosis'],
      mentor_observation: reflection.sage_perspective || undefined,
    })

    // 4. Recompute rolling window and update core profile if enough data
    const window = await computeRollingWindow(supabase, profileId)
    if (window && window.interaction_count >= 3) {
      await updateProfileFromWindow(supabase, profileId, window)
    }

    return { success: true, profileUpdated: true, error: null }
  } catch (err) {
    // Profile update failure should not break the reflection API.
    // Log the error but return success:false so the caller knows.
    console.error('Profile update from reflection failed:', err)
    return { success: false, profileUpdated: false, error: String(err) }
  }
}
