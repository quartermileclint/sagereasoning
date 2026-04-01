-- ============================================================
-- SageReasoning V3 Agent Assessment Migration
-- Adds tables for V3 agent self-assessment and baseline results.
--
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- Run AFTER: supabase-v3-migration.sql and supabase-v3-baseline-progress-migration.sql
--
-- This migration creates tables for:
-- 1. Agent foundational assessment results (free tier, 14 assessments)
-- 2. Agent full assessment results (paid tier, 55 assessments)
-- 3. Agent baseline results (4 ethical scenarios)
-- ============================================================


-- ============================================================
-- 1. AGENT FOUNDATIONAL ASSESSMENT RESULTS V3
-- Stores free-tier (14 assessment) V3 foundational results.
-- Used by: /api/assessment/foundational POST
-- ============================================================

CREATE TABLE IF NOT EXISTS public.agent_foundational_assessments_v3 (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Agent identity
  agent_id TEXT NOT NULL,

  -- V3 aggregate outputs (R6c: qualitative, no 0-100)
  senecan_grade_estimate TEXT NOT NULL CHECK (senecan_grade_estimate IN ('pre_progress', 'grade_3', 'grade_2', 'grade_1')),
  katorthoma_proximity_summary TEXT NOT NULL CHECK (katorthoma_proximity_summary IN ('reflexive', 'habitual', 'deliberate', 'principled', 'sage_like')),
  control_clarity TEXT NOT NULL CHECK (control_clarity IN ('strong', 'moderate', 'weak')),
  causal_sequence_integrity TEXT NOT NULL CHECK (causal_sequence_integrity IN ('intact', 'partially_compromised', 'compromised')),
  direction_of_travel TEXT NOT NULL CHECK (direction_of_travel IN ('improving', 'stable', 'regressing')),

  -- Passions detected across all 14 assessments
  initial_passions_detected JSONB DEFAULT '[]'::jsonb,

  -- Per-assessment summaries (14 entries)
  per_assessment_summaries JSONB NOT NULL,

  -- API key tier used
  api_key_tier TEXT DEFAULT 'free',

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agent_foundational_v3_agent_id ON public.agent_foundational_assessments_v3(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_foundational_v3_created_at ON public.agent_foundational_assessments_v3(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_foundational_v3_grade ON public.agent_foundational_assessments_v3(senecan_grade_estimate);


-- ============================================================
-- 2. AGENT FULL ASSESSMENT RESULTS V3
-- Stores paid-tier (55 assessment) V3 complete results.
-- Used by: /api/assessment/full POST
-- ============================================================

CREATE TABLE IF NOT EXISTS public.agent_full_assessments_v3 (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Agent identity
  agent_id TEXT NOT NULL,

  -- V3 aggregate outputs (R6c: qualitative)
  senecan_grade TEXT NOT NULL CHECK (senecan_grade IN ('pre_progress', 'grade_3', 'grade_2', 'grade_1')),
  typical_proximity TEXT NOT NULL CHECK (typical_proximity IN ('reflexive', 'habitual', 'deliberate', 'principled', 'sage_like')),
  dominant_passion TEXT CHECK (dominant_passion IN ('epithumia', 'hedone', 'phobos', 'lupe')),
  oikeiosis_stage TEXT CHECK (oikeiosis_stage IN ('self_preservation', 'household', 'community', 'humanity', 'cosmic')),

  -- 4 dimension levels
  passion_reduction TEXT NOT NULL CHECK (passion_reduction IN ('emerging', 'developing', 'established', 'advanced')),
  judgement_quality TEXT NOT NULL CHECK (judgement_quality IN ('emerging', 'developing', 'established', 'advanced')),
  disposition_stability TEXT NOT NULL CHECK (disposition_stability IN ('emerging', 'developing', 'established', 'advanced')),
  oikeiosis_extension TEXT NOT NULL CHECK (oikeiosis_extension IN ('emerging', 'developing', 'established', 'advanced')),

  -- Direction of travel (aggregate and per-dimension)
  direction_of_travel TEXT NOT NULL CHECK (direction_of_travel IN ('improving', 'stable', 'regressing')),
  passion_reduction_direction TEXT CHECK (passion_reduction_direction IN ('improving', 'stable', 'regressing')),
  judgement_quality_direction TEXT CHECK (judgement_quality_direction IN ('improving', 'stable', 'regressing')),
  disposition_stability_direction TEXT CHECK (disposition_stability_direction IN ('improving', 'stable', 'regressing')),
  oikeiosis_extension_direction TEXT CHECK (oikeiosis_extension_direction IN ('improving', 'stable', 'regressing')),

  -- Full passions profile
  passions_profile JSONB DEFAULT '[]'::jsonb,

  -- Critical corrections
  critical_corrections JSONB DEFAULT '[]'::jsonb,

  -- Examination protocol
  examination_protocol JSONB DEFAULT '[]'::jsonb,

  -- Per-assessment summaries (55 entries)
  per_assessment_summaries JSONB NOT NULL,

  -- R3: Disclaimer
  disclaimer TEXT DEFAULT 'This is a philosophical framework for self-reflection and does not consider legal, medical, financial, or personal obligations.',

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agent_full_v3_agent_id ON public.agent_full_assessments_v3(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_full_v3_created_at ON public.agent_full_assessments_v3(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_full_v3_grade ON public.agent_full_assessments_v3(senecan_grade);


-- ============================================================
-- 3. AGENT BASELINE RESULTS V3
-- Stores V3 agent baseline (4 scenario) evaluation results.
-- Used by: /api/baseline/agent POST
-- ============================================================

CREATE TABLE IF NOT EXISTS public.agent_baseline_results_v3 (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Agent identity
  agent_id TEXT NOT NULL,

  -- V3 aggregate outputs (R6c: qualitative)
  senecan_grade TEXT NOT NULL CHECK (senecan_grade IN ('pre_progress', 'grade_3', 'grade_2', 'grade_1')),
  typical_proximity TEXT NOT NULL CHECK (typical_proximity IN ('reflexive', 'habitual', 'deliberate', 'principled', 'sage_like')),
  dominant_passion TEXT CHECK (dominant_passion IN ('epithumia', 'hedone', 'phobos', 'lupe')),
  oikeiosis_stage TEXT CHECK (oikeiosis_stage IN ('self_preservation', 'household', 'community', 'humanity', 'cosmic')),

  -- 4 dimension levels
  passion_reduction TEXT NOT NULL CHECK (passion_reduction IN ('emerging', 'developing', 'established', 'advanced')),
  judgement_quality TEXT NOT NULL CHECK (judgement_quality IN ('emerging', 'developing', 'established', 'advanced')),
  disposition_stability TEXT NOT NULL CHECK (disposition_stability IN ('emerging', 'developing', 'established', 'advanced')),
  oikeiosis_extension TEXT NOT NULL CHECK (oikeiosis_extension IN ('emerging', 'developing', 'established', 'advanced')),

  -- Analysis
  strongest_domain TEXT,
  growth_edge TEXT,
  interpretation TEXT,

  -- Per-scenario evaluations (4 entries, full 4-stage evaluation each)
  scenario_evaluations JSONB NOT NULL,

  -- R3: Disclaimer
  disclaimer TEXT DEFAULT 'This is a philosophical framework for self-reflection and does not consider legal, medical, financial, or personal obligations.',

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agent_baseline_v3_agent_id ON public.agent_baseline_results_v3(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_baseline_v3_created_at ON public.agent_baseline_results_v3(created_at DESC);

-- Enforce retake limit: max 2 baselines per agent per calendar month
-- (Checked at API layer, not at DB layer, but index supports the query)
CREATE INDEX IF NOT EXISTS idx_agent_baseline_v3_agent_month
  ON public.agent_baseline_results_v3(agent_id, created_at);


-- ============================================================
-- 4. RLS — Agent tables use service role for all operations
-- (No user auth for agent endpoints — API key only)
-- ============================================================

-- Enable RLS but allow service role to bypass
ALTER TABLE public.agent_foundational_assessments_v3 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_full_assessments_v3 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_baseline_results_v3 ENABLE ROW LEVEL SECURITY;

-- No SELECT policies for anon — agent results are returned inline, not stored for later retrieval.
-- Service role (supabaseAdmin) bypasses RLS for inserts.


-- ============================================================
-- 5. VERIFY
-- ============================================================

SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'agent_foundational_assessments_v3',
    'agent_full_assessments_v3',
    'agent_baseline_results_v3'
  )
ORDER BY table_name;
