-- ============================================================================
-- LOGGING REFACTOR + GAP 4 — Database Migration
-- ============================================================================
--
-- Part 1: Structured mentor observations (replaces raw text pass-through)
-- Part 2: Founder hub entries (founder's own words, typed)
-- Part 3: Gap 4 — Project-Self Integration entries + review views
--
-- Run in Supabase SQL Editor. All tables are user-scoped with RLS.
-- ============================================================================

-- ─── PART 1: Structured Mentor Observations ───────────────────────────

-- New table for validated, structured mentor observations.
-- Replaces the mentor_observation TEXT column on mentor_interactions,
-- which was a pass-through dumping raw LLM response text.

CREATE TABLE IF NOT EXISTS mentor_observations_structured (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id         UUID NOT NULL REFERENCES mentor_profiles(id) ON DELETE CASCADE,

  -- Hub isolation (same pattern as mentor_interactions)
  hub_id             TEXT NOT NULL DEFAULT 'private-mentor'
    CHECK (hub_id IN ('founder-mentor', 'private-mentor')),

  -- When the observation was made
  observation_date   DATE NOT NULL,

  -- The distilled observation (50–500 chars, third-person, validated by application)
  observation        TEXT NOT NULL
    CHECK (char_length(observation) >= 50 AND char_length(observation) <= 500),

  -- Category enum — what kind of developmental signal
  category           TEXT NOT NULL
    CHECK (category IN (
      'passion_event',
      'virtue_marker',
      'reasoning_pattern',
      'progress_signal',
      'oikeiosis_shift',
      'integration_signal'
    )),

  -- Confidence level (qualitative, R6c)
  confidence         TEXT NOT NULL DEFAULT 'medium'
    CHECK (confidence IN ('low', 'medium', 'high')),

  -- What triggered the observation
  source_context     TEXT NOT NULL,

  created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_mentor_obs_structured_profile_date
  ON mentor_observations_structured(profile_id, observation_date DESC);

CREATE INDEX IF NOT EXISTS idx_mentor_obs_structured_category
  ON mentor_observations_structured(profile_id, category, observation_date DESC);

CREATE INDEX IF NOT EXISTS idx_mentor_obs_structured_hub
  ON mentor_observations_structured(profile_id, hub_id, observation_date DESC);

-- RLS: users can read their own observations via profile ownership
ALTER TABLE mentor_observations_structured ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own structured observations"
  ON mentor_observations_structured FOR SELECT
  USING (
    profile_id IN (
      SELECT id FROM mentor_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Service role full access to structured observations"
  ON mentor_observations_structured FOR ALL
  USING (auth.role() = 'service_role');


-- ─── PART 2: Founder Hub Entries ──────────────────────────────────────

-- The founder's own words — project decisions, passion events, Gap 4 entries.
-- Distinct from mentor observations: these are first-person, unvalidated for tone.

CREATE TABLE IF NOT EXISTS founder_hub_entries (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                   UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Entry type
  entry_type                TEXT NOT NULL
    CHECK (entry_type IN (
      'gap4_prompted',
      'gap4_spontaneous',
      'project_decision',
      'passion_event'
    )),

  -- The founder's own words (10–5000 chars)
  content                   TEXT NOT NULL
    CHECK (char_length(content) >= 10 AND char_length(content) <= 5000),

  -- Optional links
  conversation_id           UUID,        -- link to founder_conversations
  linked_passion_event_id   UUID REFERENCES passion_events(id),

  created_at                TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_founder_hub_entries_user_created
  ON founder_hub_entries(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_founder_hub_entries_user_type
  ON founder_hub_entries(user_id, entry_type, created_at DESC);

-- RLS
ALTER TABLE founder_hub_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own founder hub entries"
  ON founder_hub_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own founder hub entries"
  ON founder_hub_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own founder hub entries"
  ON founder_hub_entries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Service role full access to founder hub entries"
  ON founder_hub_entries FOR ALL
  USING (auth.role() = 'service_role');


-- ─── PART 3: Gap 4 — Project-Self Integration Report ─────────────────

-- Gap 4 tracks whether the founder's project decisions diverge from their
-- personal Stoic practice. The mentor holds the review — the system provides
-- data, not interpretation.
--
-- Schedule:
--   Month 1:    Weekly Sunday prompt
--   Months 2–4: Monthly Sunday prompt (first Sunday of the month)
--   Months 5–6: No prompt (self-initiated only)
--
-- Auto-flag: entries reporting no divergence in months 1–3 are flagged suspect
-- (it's statistically unlikely to have zero divergence that early)

CREATE TABLE IF NOT EXISTS gap4_entries (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- When the entry covers
  entry_date                  DATE NOT NULL,

  -- Prompted or spontaneous
  entry_type                  TEXT NOT NULL
    CHECK (entry_type IN ('prompted', 'spontaneous')),

  -- Which month of the 6-month cycle (1–6)
  month_number                INT NOT NULL CHECK (month_number BETWEEN 1 AND 6),

  -- Did the founder report divergence between project decisions and personal practice?
  divergence_reported         BOOLEAN NOT NULL,

  -- If divergence was reported, describe it
  divergence_description      TEXT,

  -- Did the founder identify philodoxia (love of reputation) in a product decision?
  philodoxia_in_product_decision BOOLEAN NOT NULL DEFAULT false,

  -- The founder's reflection content
  content                     TEXT NOT NULL
    CHECK (char_length(content) >= 10 AND char_length(content) <= 5000),

  -- Auto-flagged: no divergence in months 1–3 is suspect
  flagged_suspect             BOOLEAN NOT NULL DEFAULT false,

  created_at                  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_gap4_entries_user_date
  ON gap4_entries(user_id, entry_date DESC);

CREATE INDEX IF NOT EXISTS idx_gap4_entries_user_month
  ON gap4_entries(user_id, month_number, entry_date DESC);

CREATE INDEX IF NOT EXISTS idx_gap4_entries_flagged
  ON gap4_entries(user_id, flagged_suspect, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_gap4_entries_philodoxia
  ON gap4_entries(user_id, philodoxia_in_product_decision, entry_date DESC);

-- RLS
ALTER TABLE gap4_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own gap4 entries"
  ON gap4_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own gap4 entries"
  ON gap4_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own gap4 entries"
  ON gap4_entries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Service role full access to gap4 entries"
  ON gap4_entries FOR ALL
  USING (auth.role() = 'service_role');


-- ─── Gap 4 Prompt Schedule View ──────────────────────────────────────

-- Tracks which prompts have been sent and which are due.
-- The application layer uses this to determine whether a prompt should
-- fire on a given Sunday.

CREATE TABLE IF NOT EXISTS gap4_prompt_schedule (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- The 6-month cycle start date (set when the founder begins Gap 4)
  cycle_start_date  DATE NOT NULL,

  -- Current month in the cycle (computed by application, updated at each prompt)
  current_month     INT NOT NULL DEFAULT 1 CHECK (current_month BETWEEN 1 AND 6),

  -- Tracking
  last_prompt_date  DATE,
  next_prompt_date  DATE,
  prompts_sent      INT NOT NULL DEFAULT 0,

  -- Whether the cycle is active
  active            BOOLEAN NOT NULL DEFAULT true,

  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE gap4_prompt_schedule ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own gap4 schedule"
  ON gap4_prompt_schedule FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role full access to gap4 schedule"
  ON gap4_prompt_schedule FOR ALL
  USING (auth.role() = 'service_role');


-- ─── Gap 4 Review Views ──────────────────────────────────────────────

-- Month 3 review: mid-cycle assessment
-- Cross-references Gap 2 passion log for philodoxia-in-product-decision trends
CREATE OR REPLACE VIEW gap4_month3_review AS
SELECT
  g.user_id,

  -- Gap 4 entry summary for months 1–3
  COUNT(g.id) AS total_entries_m1_m3,
  COUNT(g.id) FILTER (WHERE g.entry_type = 'prompted') AS prompted_entries,
  COUNT(g.id) FILTER (WHERE g.entry_type = 'spontaneous') AS spontaneous_entries,
  COUNT(g.id) FILTER (WHERE g.divergence_reported = true) AS divergence_count,
  COUNT(g.id) FILTER (WHERE g.divergence_reported = false) AS no_divergence_count,
  COUNT(g.id) FILTER (WHERE g.flagged_suspect = true) AS suspect_count,
  COUNT(g.id) FILTER (WHERE g.philodoxia_in_product_decision = true) AS philodoxia_in_product_count,

  -- Gap 2 cross-reference: philodoxia passion events in the same period
  (SELECT COUNT(*)
   FROM passion_events pe
   WHERE pe.user_id = g.user_id
     AND pe.passion_type = 'philodoxia'
     AND pe.created_at >= MIN(g.entry_date)::timestamptz
     AND pe.created_at <= MAX(g.entry_date)::timestamptz + interval '1 day'
  ) AS gap2_philodoxia_events,

  -- Gap 2: total passion events for context
  (SELECT COUNT(*)
   FROM passion_events pe
   WHERE pe.user_id = g.user_id
     AND pe.created_at >= MIN(g.entry_date)::timestamptz
     AND pe.created_at <= MAX(g.entry_date)::timestamptz + interval '1 day'
  ) AS gap2_total_passion_events,

  MIN(g.entry_date) AS first_entry_date,
  MAX(g.entry_date) AS last_entry_date

FROM gap4_entries g
WHERE g.month_number BETWEEN 1 AND 3
GROUP BY g.user_id;


-- Month 6 review: end-of-cycle assessment (full 6-month window)
CREATE OR REPLACE VIEW gap4_month6_review AS
SELECT
  g.user_id,

  -- Full cycle entry summary
  COUNT(g.id) AS total_entries,
  COUNT(g.id) FILTER (WHERE g.entry_type = 'prompted') AS prompted_entries,
  COUNT(g.id) FILTER (WHERE g.entry_type = 'spontaneous') AS spontaneous_entries,

  -- Divergence tracking across the full cycle
  COUNT(g.id) FILTER (WHERE g.divergence_reported = true) AS divergence_count,
  COUNT(g.id) FILTER (WHERE g.divergence_reported = false) AS no_divergence_count,
  COUNT(g.id) FILTER (WHERE g.flagged_suspect = true) AS suspect_count,

  -- Philodoxia tracking
  COUNT(g.id) FILTER (WHERE g.philodoxia_in_product_decision = true) AS philodoxia_in_product_count,

  -- Trend: compare months 1–3 vs months 4–6 divergence rates
  COUNT(g.id) FILTER (WHERE g.month_number BETWEEN 1 AND 3 AND g.divergence_reported = true)
    AS divergence_m1_m3,
  COUNT(g.id) FILTER (WHERE g.month_number BETWEEN 4 AND 6 AND g.divergence_reported = true)
    AS divergence_m4_m6,

  -- Self-initiation trend: spontaneous entries in months 5–6 (no prompts)
  COUNT(g.id) FILTER (WHERE g.month_number BETWEEN 5 AND 6 AND g.entry_type = 'spontaneous')
    AS spontaneous_m5_m6,

  -- Gap 2 cross-reference: philodoxia passion events across full cycle
  (SELECT COUNT(*)
   FROM passion_events pe
   WHERE pe.user_id = g.user_id
     AND pe.passion_type = 'philodoxia'
     AND pe.created_at >= MIN(g.entry_date)::timestamptz
     AND pe.created_at <= MAX(g.entry_date)::timestamptz + interval '1 day'
  ) AS gap2_philodoxia_events,

  -- Gap 2: philodoxia events in months 1–3 vs 4–6 for trend
  (SELECT COUNT(*)
   FROM passion_events pe
   WHERE pe.user_id = g.user_id
     AND pe.passion_type = 'philodoxia'
     AND pe.created_at >= MIN(g.entry_date)::timestamptz
     AND pe.created_at < (MIN(g.entry_date) + interval '3 months')::timestamptz
  ) AS gap2_philodoxia_m1_m3,

  (SELECT COUNT(*)
   FROM passion_events pe
   WHERE pe.user_id = g.user_id
     AND pe.passion_type = 'philodoxia'
     AND pe.created_at >= (MIN(g.entry_date) + interval '3 months')::timestamptz
     AND pe.created_at <= MAX(g.entry_date)::timestamptz + interval '1 day'
  ) AS gap2_philodoxia_m4_m6,

  -- Gap 2: overall passion trend for context
  (SELECT COUNT(*)
   FROM passion_events pe
   WHERE pe.user_id = g.user_id
     AND pe.created_at >= MIN(g.entry_date)::timestamptz
     AND pe.created_at <= MAX(g.entry_date)::timestamptz + interval '1 day'
  ) AS gap2_total_passion_events,

  MIN(g.entry_date) AS cycle_start,
  MAX(g.entry_date) AS cycle_end

FROM gap4_entries g
GROUP BY g.user_id;
