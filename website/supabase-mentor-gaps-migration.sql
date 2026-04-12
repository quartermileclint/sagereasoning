-- ============================================================================
-- MENTOR SYSTEM GAPS — Database Migration
-- ============================================================================
-- Creates tables for Gap 1 (Real-Time Journal Feed), Gap 2 (Passion Log),
-- Gap 3 (Premeditatio Scheduling), and Gap 5 (Oikeiosis Extension Tracking).
--
-- Run in Supabase SQL Editor. All tables are user-scoped with RLS.
-- Gap 4 is founder-private and not in this build sequence.
-- ============================================================================

-- ─── GAP 1: Real-Time Journal Feed ─────────────────────────────────────────
-- Captures the live causal sequence (impression → assent → action) before
-- rationalisation sets in. Distinct from the existing 55-day journal_entries
-- table which is a structured curriculum.

CREATE TABLE IF NOT EXISTS realtime_journal_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  impression text NOT NULL,
  assent text NOT NULL,
  action text NOT NULL,
  event_timestamp timestamptz,                                    -- when the event occurred (user-entered)
  created_at timestamptz NOT NULL DEFAULT now(),                  -- when the entry was recorded
  lag_hours numeric GENERATED ALWAYS AS (
    CASE
      WHEN event_timestamp IS NOT NULL
      THEN EXTRACT(EPOCH FROM (created_at - event_timestamp)) / 3600.0
      ELSE NULL
    END
  ) STORED
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_realtime_journal_user_created
  ON realtime_journal_entries(user_id, created_at DESC);

-- RLS: users can only see their own entries
ALTER TABLE realtime_journal_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own realtime journal entries"
  ON realtime_journal_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own realtime journal entries"
  ON realtime_journal_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own realtime journal entries"
  ON realtime_journal_entries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own realtime journal entries"
  ON realtime_journal_entries FOR DELETE
  USING (auth.uid() = user_id);

-- Service role bypass for API routes using supabaseServiceKey
CREATE POLICY "Service role full access to realtime journal"
  ON realtime_journal_entries FOR ALL
  USING (auth.role() = 'service_role');


-- ─── GAP 2: Passion Log + Classification ───────────────────────────────────
-- Tracks passion events with user self-diagnosis and LLM classification.
-- Functional testing blocked until Gap 1 is live and generating real entries.

CREATE TABLE IF NOT EXISTS passion_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  passion_type text NOT NULL,                    -- user's self-diagnosis (from Stoic taxonomy)
  intensity int NOT NULL CHECK (intensity BETWEEN 1 AND 5),
  caught_before_assent boolean NOT NULL,
  false_judgement text NOT NULL,
  description text,                              -- user's narrative description of the event
  llm_classified_type text,                      -- engine classification result
  llm_confidence numeric,                        -- classification confidence score
  classification_match boolean,                  -- user vs engine agreement
  linked_journal_entry_id uuid REFERENCES realtime_journal_entries(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for trend queries and weekly aggregation
CREATE INDEX IF NOT EXISTS idx_passion_events_user_created
  ON passion_events(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_passion_events_user_type
  ON passion_events(user_id, passion_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_passion_events_pre_assent
  ON passion_events(user_id, caught_before_assent, created_at);

-- RLS
ALTER TABLE passion_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own passion events"
  ON passion_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own passion events"
  ON passion_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own passion events"
  ON passion_events FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own passion events"
  ON passion_events FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Service role full access to passion events"
  ON passion_events FOR ALL
  USING (auth.role() = 'service_role');


-- ─── GAP 3: Premeditatio Scheduling ────────────────────────────────────────
-- Scheduled Monday morning reflections targeting avoidance and catastrophising.
-- Build after Gap 1 and Gap 2 are stable.

CREATE TABLE IF NOT EXISTS premeditatio_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  anticipated_event text NOT NULL,
  false_impression text NOT NULL,
  correct_judgement text NOT NULL,
  is_generic boolean NOT NULL DEFAULT false,       -- quality gate flag
  linked_passion_event_id uuid REFERENCES passion_events(id),
  avoidance_behaviour_tag text,                    -- tag a previously avoided behaviour
  behaviour_changed boolean,                       -- mark when the behaviour changes
  prompt_sent_at timestamptz,                      -- when the weekly prompt was delivered
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_premeditatio_user_created
  ON premeditatio_entries(user_id, created_at DESC);

-- RLS
ALTER TABLE premeditatio_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own premeditatio entries"
  ON premeditatio_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own premeditatio entries"
  ON premeditatio_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own premeditatio entries"
  ON premeditatio_entries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own premeditatio entries"
  ON premeditatio_entries FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Service role full access to premeditatio"
  ON premeditatio_entries FOR ALL
  USING (auth.role() = 'service_role');


-- ─── GAP 5: Oikeiosis Extension Tracking ──────────────────────────────────
-- Quarterly reflections on expanding the moral circle.
-- Build after Gaps 1, 2, and 3 are stable.

CREATE TABLE IF NOT EXISTS oikeiosis_reflections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quarter int NOT NULL CHECK (quarter BETWEEN 1 AND 4),
  year int NOT NULL,
  stage text NOT NULL CHECK (stage IN ('self', 'household', 'community', 'humanity', 'cosmic')),
  action_description text NOT NULL,
  reputational_return text CHECK (reputational_return IN ('yes', 'no', 'partial')),
  philodoxia_flagged boolean NOT NULL DEFAULT false,
  linked_passion_event_id uuid REFERENCES passion_events(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_oikeiosis_user_year_quarter
  ON oikeiosis_reflections(user_id, year DESC, quarter DESC);

-- RLS
ALTER TABLE oikeiosis_reflections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own oikeiosis reflections"
  ON oikeiosis_reflections FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own oikeiosis reflections"
  ON oikeiosis_reflections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own oikeiosis reflections"
  ON oikeiosis_reflections FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own oikeiosis reflections"
  ON oikeiosis_reflections FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Service role full access to oikeiosis"
  ON oikeiosis_reflections FOR ALL
  USING (auth.role() = 'service_role');


-- ─── VERIFICATION VIEWS ────────────────────────────────────────────────────
-- Aggregation views for measurement baselines defined in the spec.

-- Gap 1: Average lag metric per user
CREATE OR REPLACE VIEW realtime_journal_lag_stats AS
SELECT
  user_id,
  COUNT(*) AS total_entries,
  ROUND(AVG(lag_hours)::numeric, 1) AS avg_lag_hours,
  ROUND((COUNT(*) FILTER (WHERE lag_hours < 24)::numeric / NULLIF(COUNT(*), 0) * 100), 1)
    AS pct_under_24h,
  MIN(created_at) AS first_entry,
  MAX(created_at) AS latest_entry
FROM realtime_journal_entries
WHERE event_timestamp IS NOT NULL
GROUP BY user_id;

-- Gap 2: Weekly pre-assent catch rate (operational signal)
CREATE OR REPLACE VIEW passion_weekly_catch_rate AS
SELECT
  user_id,
  DATE_TRUNC('week', created_at)::date AS week_start,
  COUNT(*) AS total_events,
  COUNT(*) FILTER (WHERE caught_before_assent = true) AS pre_assent_events,
  ROUND(
    (COUNT(*) FILTER (WHERE caught_before_assent = true)::numeric
     / NULLIF(COUNT(*), 0) * 100), 1
  ) AS pre_assent_catch_rate_pct
FROM passion_events
GROUP BY user_id, DATE_TRUNC('week', created_at)::date
ORDER BY user_id, week_start;

-- Gap 2: Classification match rate (quality signal)
CREATE OR REPLACE VIEW passion_classification_accuracy AS
SELECT
  user_id,
  COUNT(*) FILTER (WHERE llm_classified_type IS NOT NULL) AS classified_count,
  COUNT(*) FILTER (WHERE classification_match = true) AS match_count,
  ROUND(
    (COUNT(*) FILTER (WHERE classification_match = true)::numeric
     / NULLIF(COUNT(*) FILTER (WHERE llm_classified_type IS NOT NULL), 0) * 100), 1
  ) AS match_rate_pct
FROM passion_events
GROUP BY user_id;

-- Gap 2: Intensity trend per passion type
CREATE OR REPLACE VIEW passion_intensity_trends AS
SELECT
  user_id,
  passion_type,
  DATE_TRUNC('week', created_at)::date AS week_start,
  ROUND(AVG(intensity)::numeric, 1) AS avg_intensity,
  COUNT(*) AS event_count
FROM passion_events
GROUP BY user_id, passion_type, DATE_TRUNC('week', created_at)::date
ORDER BY user_id, passion_type, week_start;

-- Gap 3: Premeditatio engagement rate
CREATE OR REPLACE VIEW premeditatio_engagement AS
SELECT
  user_id,
  DATE_TRUNC('month', created_at)::date AS month_start,
  COUNT(*) AS responses_count,
  COUNT(*) FILTER (WHERE is_generic = false) AS quality_responses,
  COUNT(*) FILTER (WHERE behaviour_changed = true) AS behaviours_changed
FROM premeditatio_entries
GROUP BY user_id, DATE_TRUNC('month', created_at)::date
ORDER BY user_id, month_start;

-- Gap 5: Oikeiosis stage progression
CREATE OR REPLACE VIEW oikeiosis_stage_progression AS
SELECT
  user_id,
  year,
  quarter,
  stage,
  COUNT(*) AS action_count,
  COUNT(*) FILTER (WHERE philodoxia_flagged = true) AS flagged_count,
  COUNT(*) FILTER (WHERE reputational_return = 'no') AS genuine_count
FROM oikeiosis_reflections
GROUP BY user_id, year, quarter, stage
ORDER BY user_id, year, quarter;
