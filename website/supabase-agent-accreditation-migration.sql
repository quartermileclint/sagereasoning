-- ============================================================
-- SageReasoning — Agent Trust Layer: Badge Foundation Migration
-- agent_accreditation + grade_history (approved subset of the
-- DRAFT 5-table /trust-layer/schema/trust-layer-schema-REVIEW.sql)
--
-- Run in: Supabase Dashboard -> SQL Editor -> New Query -> paste -> Run
-- Approved under D-ATL-BADGE-SCHEMA-PERSISTENCE-WIRED-VERIFIED-2026-05-15
-- (ATL Wrapper Session 7, step 6a -- the badge foundation). The other three
-- DRAFT tables (evaluated_actions, onboarding_results, progression_sessions)
-- are deferred -- see /trust-layer/schema/trust-layer-schema-REVIEW.sql.
--
-- Idempotent (IF NOT EXISTS / DROP-then-CREATE -- the whole script is
-- re-runnable, not just the CREATE TABLE statements). Additive (adds two new
-- tables, modifies no existing table).
-- ============================================================


-- ============================================================
-- 1. AGENT ACCREDITATION RECORDS
-- The persistent credential for each accredited agent.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.agent_accreditation (
  -- Primary key: the agent identifier
  agent_id TEXT PRIMARY KEY,

  -- Senecan grade
  senecan_grade TEXT NOT NULL CHECK (senecan_grade IN (
    'pre_progress', 'grade_3', 'grade_2', 'grade_1', 'sage_ideal'
  )),

  -- Typical proximity level across evaluation window
  typical_proximity TEXT NOT NULL CHECK (typical_proximity IN (
    'reflexive', 'habitual', 'deliberate', 'principled', 'sage_like'
  )),

  -- Authority level (derived from proximity)
  authority_level TEXT NOT NULL CHECK (authority_level IN (
    'supervised', 'guided', 'spot_checked', 'autonomous', 'full_authority'
  )),

  -- The 4 progress dimensions (flattened from AccreditationRecord.dimension_levels)
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

  -- Persisting passions (JSONB array -- KG7: writers pass the array directly,
  -- never JSON.stringify; expected jsonb_typeof is 'array')
  passions_persisting JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Tier tracking (store-only column -- no AccreditationRecord counterpart)
  tier TEXT NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'paid')),

  -- Consecutive regressing check count (store-only -- the wrapper's
  -- CarriedProfile is the authority on this value)
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
-- 2. GRADE HISTORY (Audit Trail)
-- Records every grade change for audit and analytics.
-- Append-only -- one row per grade transition.
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
-- 3. ROW LEVEL SECURITY (RLS)
-- Follows the existing pattern from the DRAFT trust-layer schema.
-- DROP-then-CREATE so the policy block is re-runnable.
-- ============================================================

ALTER TABLE public.agent_accreditation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grade_history ENABLE ROW LEVEL SECURITY;

-- Public read access for accreditation (it is a public verification endpoint)
DROP POLICY IF EXISTS "Public read access for accreditation" ON public.agent_accreditation;
CREATE POLICY "Public read access for accreditation"
  ON public.agent_accreditation
  FOR SELECT
  USING (true);

-- Service role manages all writes to accreditation
DROP POLICY IF EXISTS "Service role manages accreditation" ON public.agent_accreditation;
CREATE POLICY "Service role manages accreditation"
  ON public.agent_accreditation
  FOR ALL
  USING (auth.role() = 'service_role');

-- Service role manages all access to grade_history
DROP POLICY IF EXISTS "Service role manages grade_history" ON public.grade_history;
CREATE POLICY "Service role manages grade_history"
  ON public.grade_history
  FOR ALL
  USING (auth.role() = 'service_role');


-- ============================================================
-- 4. VERIFY
-- Expected: two rows -- agent_accreditation, grade_history
-- ============================================================

SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('agent_accreditation', 'grade_history')
ORDER BY table_name;
