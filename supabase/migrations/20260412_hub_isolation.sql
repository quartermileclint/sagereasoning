-- ============================================================================
-- Hub Isolation Migration — 2026-04-12
--
-- Fully defensive: creates tables if missing, adds columns if missing,
-- creates indexes and policies if missing. Safe to run multiple times.
--
-- Risk: Critical (access control / data isolation)
-- Rollback:
--   ALTER TABLE mentor_interactions DROP COLUMN IF EXISTS hub_id;
--   ALTER TABLE mentor_profile_snapshots DROP COLUMN IF EXISTS hub_id;
-- ============================================================================


-- ══════════════════════════════════════════════════════════════════════════════
-- HELPER: Adds a column to a table only if it doesn't already exist.
-- ══════════════════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION _add_column_if_missing(
  _table TEXT, _column TEXT, _type TEXT, _default TEXT DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = _table AND column_name = _column
  ) THEN
    IF _default IS NOT NULL THEN
      EXECUTE format('ALTER TABLE %I ADD COLUMN %I %s NOT NULL DEFAULT %s', _table, _column, _type, _default);
    ELSE
      EXECUTE format('ALTER TABLE %I ADD COLUMN %I %s', _table, _column, _type);
    END IF;
  END IF;
END;
$$ LANGUAGE plpgsql;


-- ══════════════════════════════════════════════════════════════════════════════
-- 1. MENTOR_PROFILES
-- ══════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS mentor_profiles (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name    TEXT NOT NULL DEFAULT '',
  senecan_grade   TEXT NOT NULL DEFAULT 'pre_progress',
  proximity_level TEXT NOT NULL DEFAULT 'reflexive',
  dim_passion_reduction    TEXT NOT NULL DEFAULT 'emerging',
  dim_judgement_quality    TEXT NOT NULL DEFAULT 'emerging',
  dim_disposition_stability TEXT NOT NULL DEFAULT 'emerging',
  dim_oikeiosis_extension  TEXT NOT NULL DEFAULT 'emerging',
  direction_of_travel TEXT NOT NULL DEFAULT 'stable',
  persisting_passions TEXT[] NOT NULL DEFAULT '{}',
  preferred_indifferents TEXT[] NOT NULL DEFAULT '{}',
  current_prescription JSONB,
  interaction_count INTEGER NOT NULL DEFAULT 0,
  last_interaction  TIMESTAMPTZ,
  journal_ingested  BOOLEAN NOT NULL DEFAULT false,
  journal_ingested_at TIMESTAMPTZ,
  journal_page_count INTEGER,
  weakest_virtue TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Add any columns that might be missing on pre-existing table
SELECT _add_column_if_missing('mentor_profiles', 'weakest_virtue', 'TEXT');
SELECT _add_column_if_missing('mentor_profiles', 'journal_page_count', 'INTEGER');

ALTER TABLE mentor_profiles ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='mentor_profiles' AND policyname='Users can read own profile') THEN
    CREATE POLICY "Users can read own profile" ON mentor_profiles FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='mentor_profiles' AND policyname='Users can update own profile') THEN
    CREATE POLICY "Users can update own profile" ON mentor_profiles FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='mentor_profiles' AND policyname='Users can insert own profile') THEN
    CREATE POLICY "Users can insert own profile" ON mentor_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;


-- ══════════════════════════════════════════════════════════════════════════════
-- 2. MENTOR_PASSION_MAP
-- ══════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS mentor_passion_map (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id       UUID NOT NULL REFERENCES mentor_profiles(id) ON DELETE CASCADE,
  passion_id       TEXT NOT NULL,
  sub_species      TEXT NOT NULL,
  root_passion     TEXT NOT NULL,
  false_judgement   TEXT NOT NULL,
  frequency        TEXT NOT NULL DEFAULT 'occasional',
  first_seen       TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen        TIMESTAMPTZ NOT NULL DEFAULT now(),
  journal_refs     TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(profile_id, passion_id)
);
ALTER TABLE mentor_passion_map ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='mentor_passion_map' AND policyname='Users can access own passion map') THEN
    CREATE POLICY "Users can access own passion map" ON mentor_passion_map FOR ALL
      USING (profile_id IN (SELECT id FROM mentor_profiles WHERE user_id = auth.uid()));
  END IF;
END $$;


-- ══════════════════════════════════════════════════════════════════════════════
-- 3. MENTOR_CAUSAL_TENDENCIES
-- ══════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS mentor_causal_tendencies (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id      UUID NOT NULL REFERENCES mentor_profiles(id) ON DELETE CASCADE,
  failure_point   TEXT NOT NULL,
  description     TEXT NOT NULL,
  frequency       TEXT NOT NULL DEFAULT 'occasional',
  examples        TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE mentor_causal_tendencies ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='mentor_causal_tendencies' AND policyname='Users can access own causal tendencies') THEN
    CREATE POLICY "Users can access own causal tendencies" ON mentor_causal_tendencies FOR ALL
      USING (profile_id IN (SELECT id FROM mentor_profiles WHERE user_id = auth.uid()));
  END IF;
END $$;


-- ══════════════════════════════════════════════════════════════════════════════
-- 4. MENTOR_VALUE_HIERARCHY
-- ══════════════════════════════════════════════════════════════════════════════
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
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='mentor_value_hierarchy' AND policyname='Users can access own value hierarchy') THEN
    CREATE POLICY "Users can access own value hierarchy" ON mentor_value_hierarchy FOR ALL
      USING (profile_id IN (SELECT id FROM mentor_profiles WHERE user_id = auth.uid()));
  END IF;
END $$;


-- ══════════════════════════════════════════════════════════════════════════════
-- 5. MENTOR_OIKEIOSIS_MAP
-- ══════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS mentor_oikeiosis_map (
  id                   UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id           UUID NOT NULL REFERENCES mentor_profiles(id) ON DELETE CASCADE,
  person_or_role       TEXT NOT NULL,
  relationship         TEXT NOT NULL,
  oikeiosis_stage      TEXT NOT NULL,
  reflection_frequency TEXT NOT NULL DEFAULT 'sometimes',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE mentor_oikeiosis_map ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='mentor_oikeiosis_map' AND policyname='Users can access own oikeiosis map') THEN
    CREATE POLICY "Users can access own oikeiosis map" ON mentor_oikeiosis_map FOR ALL
      USING (profile_id IN (SELECT id FROM mentor_profiles WHERE user_id = auth.uid()));
  END IF;
END $$;


-- ══════════════════════════════════════════════════════════════════════════════
-- 6. MENTOR_VIRTUE_PROFILE
-- ══════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS mentor_virtue_profile (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id       UUID NOT NULL REFERENCES mentor_profiles(id) ON DELETE CASCADE,
  domain           TEXT NOT NULL,
  strength         TEXT NOT NULL DEFAULT 'developing',
  evidence         TEXT NOT NULL DEFAULT '',
  journal_refs     TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(profile_id, domain)
);
ALTER TABLE mentor_virtue_profile ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='mentor_virtue_profile' AND policyname='Users can access own virtue profile') THEN
    CREATE POLICY "Users can access own virtue profile" ON mentor_virtue_profile FOR ALL
      USING (profile_id IN (SELECT id FROM mentor_profiles WHERE user_id = auth.uid()));
  END IF;
END $$;


-- ══════════════════════════════════════════════════════════════════════════════
-- 7. MENTOR_JOURNAL_REFS
-- ══════════════════════════════════════════════════════════════════════════════
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
  UNIQUE(profile_id, passage_id)
);
ALTER TABLE mentor_journal_refs ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='mentor_journal_refs' AND policyname='Users can access own journal refs') THEN
    CREATE POLICY "Users can access own journal refs" ON mentor_journal_refs FOR ALL
      USING (profile_id IN (SELECT id FROM mentor_profiles WHERE user_id = auth.uid()));
  END IF;
END $$;


-- ══════════════════════════════════════════════════════════════════════════════
-- 8. MENTOR_INTERACTIONS — with hub_id
-- ══════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS mentor_interactions (
  id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id          UUID NOT NULL REFERENCES mentor_profiles(id) ON DELETE CASCADE,
  hub_id              TEXT NOT NULL DEFAULT 'private-mentor',
  interaction_type    TEXT NOT NULL,
  description         TEXT NOT NULL,
  proximity_assessed  TEXT,
  passions_detected   JSONB DEFAULT '[]',
  mechanisms_applied  TEXT[] NOT NULL DEFAULT '{}',
  inner_agent_id      TEXT,
  inner_agent_name    TEXT,
  mentor_observation  TEXT,
  journal_ref_id      TEXT,
  disclaimer          TEXT NOT NULL DEFAULT 'This evaluation reflects philosophical framework analysis, not professional advice. See R1, R9.',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add hub_id if table existed before without it
SELECT _add_column_if_missing('mentor_interactions', 'hub_id', 'TEXT', '''private-mentor''');

CREATE INDEX IF NOT EXISTS idx_mentor_interactions_profile_time ON mentor_interactions(profile_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_mentor_interactions_type ON mentor_interactions(profile_id, interaction_type);
CREATE INDEX IF NOT EXISTS idx_mentor_interactions_hub ON mentor_interactions(hub_id, profile_id, created_at DESC);

ALTER TABLE mentor_interactions ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='mentor_interactions' AND policyname='Users can read own hub-scoped interactions') THEN
    CREATE POLICY "Users can read own hub-scoped interactions" ON mentor_interactions FOR SELECT
      USING (profile_id IN (SELECT id FROM mentor_profiles WHERE user_id = auth.uid()));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='mentor_interactions' AND policyname='Users can insert own hub-scoped interactions') THEN
    CREATE POLICY "Users can insert own hub-scoped interactions" ON mentor_interactions FOR INSERT
      WITH CHECK (profile_id IN (SELECT id FROM mentor_profiles WHERE user_id = auth.uid()));
  END IF;
END $$;


-- ══════════════════════════════════════════════════════════════════════════════
-- 9. MENTOR_PROFILE_SNAPSHOTS — with hub_id
-- ══════════════════════════════════════════════════════════════════════════════

-- Add missing columns to the existing table first (before CREATE TABLE IF NOT EXISTS)
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='mentor_profile_snapshots') THEN
    -- Table exists — add any missing columns
    PERFORM _add_column_if_missing('mentor_profile_snapshots', 'hub_id', 'TEXT', '''private-mentor''');
    PERFORM _add_column_if_missing('mentor_profile_snapshots', 'snapshot_at', 'TIMESTAMPTZ DEFAULT now()');
    PERFORM _add_column_if_missing('mentor_profile_snapshots', 'proximity_level', 'TEXT DEFAULT ''reflexive''');
    PERFORM _add_column_if_missing('mentor_profile_snapshots', 'senecan_grade', 'TEXT DEFAULT ''pre_progress''');
    PERFORM _add_column_if_missing('mentor_profile_snapshots', 'direction_of_travel', 'TEXT');
    PERFORM _add_column_if_missing('mentor_profile_snapshots', 'persisting_passions', 'TEXT[]');
    PERFORM _add_column_if_missing('mentor_profile_snapshots', 'weakest_virtue', 'TEXT');
    PERFORM _add_column_if_missing('mentor_profile_snapshots', 'interaction_count', 'INTEGER DEFAULT 0');
    PERFORM _add_column_if_missing('mentor_profile_snapshots', 'trigger', 'TEXT DEFAULT ''scheduled''');
  ELSE
    -- Table does not exist — create it fresh with all columns
    CREATE TABLE mentor_profile_snapshots (
      id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      profile_id        UUID NOT NULL REFERENCES mentor_profiles(id) ON DELETE CASCADE,
      hub_id            TEXT NOT NULL DEFAULT 'private-mentor',
      snapshot_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
      proximity_level   TEXT NOT NULL DEFAULT 'reflexive',
      senecan_grade     TEXT NOT NULL DEFAULT 'pre_progress',
      direction_of_travel TEXT,
      persisting_passions TEXT[],
      weakest_virtue    TEXT,
      interaction_count INTEGER DEFAULT 0,
      trigger           TEXT NOT NULL DEFAULT 'scheduled',
      UNIQUE(profile_id, snapshot_at)
    );
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_snapshots_profile_time ON mentor_profile_snapshots(profile_id, snapshot_at DESC);
CREATE INDEX IF NOT EXISTS idx_snapshots_hub ON mentor_profile_snapshots(hub_id, profile_id, snapshot_at DESC);

ALTER TABLE mentor_profile_snapshots ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='mentor_profile_snapshots' AND policyname='Users can read own hub-scoped snapshots') THEN
    CREATE POLICY "Users can read own hub-scoped snapshots" ON mentor_profile_snapshots FOR SELECT
      USING (profile_id IN (SELECT id FROM mentor_profiles WHERE user_id = auth.uid()));
  END IF;
END $$;


-- ══════════════════════════════════════════════════════════════════════════════
-- 10. UPDATED_AT TRIGGERS
-- ══════════════════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'mentor_profiles_updated_at') THEN
    CREATE TRIGGER mentor_profiles_updated_at BEFORE UPDATE ON mentor_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'mentor_passion_map_updated_at') THEN
    CREATE TRIGGER mentor_passion_map_updated_at BEFORE UPDATE ON mentor_passion_map FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'mentor_causal_tendencies_updated_at') THEN
    CREATE TRIGGER mentor_causal_tendencies_updated_at BEFORE UPDATE ON mentor_causal_tendencies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'mentor_value_hierarchy_updated_at') THEN
    CREATE TRIGGER mentor_value_hierarchy_updated_at BEFORE UPDATE ON mentor_value_hierarchy FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'mentor_oikeiosis_map_updated_at') THEN
    CREATE TRIGGER mentor_oikeiosis_map_updated_at BEFORE UPDATE ON mentor_oikeiosis_map FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'mentor_virtue_profile_updated_at') THEN
    CREATE TRIGGER mentor_virtue_profile_updated_at BEFORE UPDATE ON mentor_virtue_profile FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;


-- ══════════════════════════════════════════════════════════════════════════════
-- CLEANUP: Drop the helper function (no longer needed)
-- ══════════════════════════════════════════════════════════════════════════════
DROP FUNCTION IF EXISTS _add_column_if_missing(TEXT, TEXT, TEXT, TEXT);
