-- ============================================================
-- SageReasoning — Agent Trust Layer Schema
-- STATUS: DRAFT FOR REVIEW — DO NOT RUN UNTIL APPROVED
-- ============================================================
--
-- This schema adds the tables needed for the Agent Trust Layer.
-- It extends the existing supabase-schema.sql without modifying
-- any existing tables.
--
-- Tables:
--   1. agent_accreditation    — persistent agent credentials
--   2. evaluated_actions      — rolling evaluation window data
--   3. grade_history          — audit trail of grade changes
--   4. onboarding_results     — 55-assessment framework outcomes
--   5. progression_sessions   — progression toolkit interactions
--
-- ============================================================


-- ============================================================
-- 1. AGENT ACCREDITATION RECORDS
-- The persistent credential for each accredited agent.
-- Source: Framework doc Section 5 + Priority 1
-- ============================================================

CREATE TABLE IF NOT EXISTS public.agent_accreditation (
  -- Primary key: the agent identifier
  agent_id TEXT PRIMARY KEY,

  -- Senecan grade (progress.json)
  senecan_grade TEXT NOT NULL CHECK (senecan_grade IN (
    'pre_progress', 'grade_3', 'grade_2', 'grade_1', 'sage_ideal'
  )),

  -- Typical proximity level across evaluation window
  typical_proximity TEXT NOT NULL CHECK (typical_proximity IN (
    'reflexive', 'habitual', 'deliberate', 'principled', 'sage_like'
  )),

  -- Authority level (derived from grade — Phase C)
  authority_level TEXT NOT NULL CHECK (authority_level IN (
    'supervised', 'guided', 'spot_checked', 'autonomous', 'full_authority'
  )),

  -- The 4 progress dimensions (progress.json)
  passion_reduction TEXT NOT NULL DEFAULT 'emerging' CHECK (passion_reduction IN ('emerging', 'developing', 'established', 'advanced')),
  judgement_quality TEXT NOT NULL DEFAULT 'emerging' CHECK (judgement_quality IN ('emerging', 'developing', 'established', 'advanced')),
  disposition_stability TEXT NOT NULL DEFAULT 'emerging' CHECK (disposition_stability IN ('emerging', 'developing', 'established', 'advanced')),
  oikeiosis_extension TEXT NOT NULL DEFAULT 'emerging' CHECK (oikeiosis_extension IN ('emerging', 'developing', 'established', 'advanced')),

  -- Direction of travel
  direction_of_travel TEXT NOT NULL DEFAULT 'stable' CHECK (direction_of_travel IN ('improving', 'stable', 'regressing')),

  -- Evaluation window config
  evaluation_window_size INTEGER NOT NULL DEFAULT 100,
  actions_evaluated INTEGER NOT NULL DEFAULT 0,

  -- Timestamps
  grade_since TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_evaluation TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '90 days'),

  -- Persisting passions (stored as JSONB array)
  passions_persisting JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Tier tracking
  tier TEXT NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'paid')),

  -- Consecutive regressing check count (for downgrade logic)
  regressing_check_count INTEGER NOT NULL DEFAULT 0
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_accreditation_grade ON public.agent_accreditation(senecan_grade);
CREATE INDEX IF NOT EXISTS idx_accreditation_proximity ON public.agent_accreditation(typical_proximity);
CREATE INDEX IF NOT EXISTS idx_accreditation_authority ON public.agent_accreditation(authority_level);
CREATE INDEX IF NOT EXISTS idx_accreditation_expires ON public.agent_accreditation(expires_at);

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_accreditation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS accreditation_updated ON public.agent_accreditation;
CREATE TRIGGER accreditation_updated
  BEFORE UPDATE ON public.agent_accreditation
  FOR EACH ROW EXECUTE FUNCTION public.update_accreditation_timestamp();


-- ============================================================
-- 2. EVALUATED ACTIONS (Rolling Evaluation Window)
-- Individual evaluated actions that feed the window aggregator.
-- Source: Framework doc Section 3 Phase B + Priority 2
-- ============================================================

CREATE TABLE IF NOT EXISTS public.evaluated_actions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Links to accreditation record
  agent_id TEXT NOT NULL REFERENCES public.agent_accreditation(agent_id) ON DELETE CASCADE,

  -- Links to reasoning receipt (existing system)
  receipt_id TEXT NOT NULL,

  -- Evaluation results
  proximity TEXT NOT NULL CHECK (proximity IN (
    'reflexive', 'habitual', 'deliberate', 'principled', 'sage_like'
  )),
  is_kathekon BOOLEAN NOT NULL,
  kathekon_quality TEXT NOT NULL CHECK (kathekon_quality IN (
    'strong', 'moderate', 'marginal', 'contrary'
  )),

  -- Passions detected (JSONB array)
  passions_detected JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- Virtue domains engaged (text array)
  virtue_domains_engaged TEXT[] NOT NULL DEFAULT '{}',

  -- Oikeiosis tracking
  oikeiosis_met BOOLEAN,
  oikeiosis_stage TEXT,

  -- Ruling faculty state
  ruling_faculty_state TEXT,

  -- Which skill produced this evaluation
  skill_id TEXT NOT NULL,

  -- Timestamp
  evaluated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for window queries: get last N actions for an agent
CREATE INDEX IF NOT EXISTS idx_evaluated_agent_time
  ON public.evaluated_actions(agent_id, evaluated_at DESC);

-- Index for receipt lookup
CREATE INDEX IF NOT EXISTS idx_evaluated_receipt
  ON public.evaluated_actions(receipt_id);


-- ============================================================
-- 3. GRADE HISTORY (Audit Trail)
-- Records every grade change for audit and analytics.
-- Source: Framework doc Section 5 + Grade Change Events
-- ============================================================

CREATE TABLE IF NOT EXISTS public.grade_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  agent_id TEXT NOT NULL REFERENCES public.agent_accreditation(agent_id) ON DELETE CASCADE,

  -- Change details
  event_type TEXT NOT NULL CHECK (event_type IN ('grade_upgrade', 'grade_downgrade', 'initial_grade')),
  previous_grade TEXT,
  new_grade TEXT NOT NULL,
  previous_proximity TEXT,
  new_proximity TEXT NOT NULL,
  previous_authority TEXT,
  new_authority TEXT NOT NULL,

  -- Evidence
  trigger_action_count INTEGER NOT NULL,
  evidence_summary TEXT,

  -- Timestamp
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_grade_history_agent
  ON public.grade_history(agent_id, occurred_at DESC);


-- ============================================================
-- 4. ONBOARDING RESULTS
-- Stores the outcome of the 55-assessment framework.
-- Source: Framework doc Section 3 Phase A
-- ============================================================

CREATE TABLE IF NOT EXISTS public.onboarding_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  agent_id TEXT NOT NULL REFERENCES public.agent_accreditation(agent_id) ON DELETE CASCADE,

  -- Assessment totals
  assessments_completed INTEGER NOT NULL,
  total_assessments INTEGER NOT NULL,
  tier TEXT NOT NULL CHECK (tier IN ('free', 'paid')),

  -- Starting levels
  starting_grade TEXT NOT NULL,
  starting_proximity TEXT NOT NULL,

  -- Starting dimensions (JSONB)
  starting_dimensions JSONB NOT NULL,

  -- Phase-by-phase results (JSONB array)
  phase_results JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- Timestamp
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_onboarding_agent
  ON public.onboarding_results(agent_id);


-- ============================================================
-- 5. PROGRESSION SESSIONS
-- Tracks progression toolkit interactions (coaching revenue).
-- Source: Framework doc Section 4 + Priority 5b
-- ============================================================

CREATE TABLE IF NOT EXISTS public.progression_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  agent_id TEXT NOT NULL REFERENCES public.agent_accreditation(agent_id) ON DELETE CASCADE,

  -- Which tool was used
  tool_id TEXT NOT NULL,
  pathway_id TEXT NOT NULL,

  -- Request/response (JSONB for flexibility)
  request_summary TEXT NOT NULL,
  response_summary TEXT,

  -- Coaching result
  mechanisms_applied TEXT[] NOT NULL DEFAULT '{}',
  source_files TEXT[] NOT NULL DEFAULT '{}',

  -- Billing
  billable BOOLEAN NOT NULL DEFAULT true,

  -- Timestamp
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_progression_agent
  ON public.progression_sessions(agent_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_progression_tool
  ON public.progression_sessions(tool_id);


-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- All tables follow the existing pattern from supabase-schema.sql
-- ============================================================

-- Enable RLS on all new tables
ALTER TABLE public.agent_accreditation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluated_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grade_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progression_sessions ENABLE ROW LEVEL SECURITY;

-- Public read access for accreditation (it's a public endpoint)
CREATE POLICY "Public read access for accreditation"
  ON public.agent_accreditation
  FOR SELECT
  USING (true);

-- Service role can manage all tables
-- (In production, these would be more restrictive)
CREATE POLICY "Service role manages accreditation"
  ON public.agent_accreditation
  FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role manages evaluated_actions"
  ON public.evaluated_actions
  FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role manages grade_history"
  ON public.grade_history
  FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role manages onboarding_results"
  ON public.onboarding_results
  FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role manages progression_sessions"
  ON public.progression_sessions
  FOR ALL
  USING (auth.role() = 'service_role');


-- ============================================================
-- NOTES FOR REVIEW
-- ============================================================
--
-- 1. agent_accreditation uses TEXT primary key (agent_id) instead
--    of UUID. This matches the framework doc's agent_id format
--    (agent_acme_v3) and makes the public endpoint cleaner.
--
-- 2. passions_persisting is stored as JSONB to allow flexible
--    structure without needing a separate join table.
--
-- 3. evaluated_actions links to receipt_id (TEXT) rather than
--    a foreign key to reasoning_receipts, since receipts may
--    live in a different storage system (OpenBrain).
--
-- 4. The 90-day default expiry on expires_at can be configured
--    per-agent via the API.
--
-- 5. regressing_check_count on agent_accreditation is used by
--    the grade transition engine to track consecutive regression.
--    It resets on any non-regressing check.
--
-- 6. RLS policies are minimal for draft. Production would add:
--    - Agent-specific read access to their own evaluated_actions
--    - API key-based write access for sage-guard integration
--    - Rate limiting via pg functions
--
-- ============================================================
