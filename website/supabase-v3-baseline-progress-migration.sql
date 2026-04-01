-- ============================================================
-- SageReasoning V3 Baseline & Progress Migration
-- Derived from progress.json (Senecan grades, progress dimensions),
-- passions.json (passion profile), action.json (oikeiosis stages),
-- and scoring.json (katorthoma proximity scale).
--
-- Run this in: Supabase Dashboard → SQL Editor → New Query
--
-- This migration creates NEW V3 tables alongside V1 tables.
-- V1 tables (baseline_assessments, milestones) are NOT modified
-- or dropped — they remain until Phase 11 cleanup.
-- ============================================================


-- ============================================================
-- 1. BASELINE ASSESSMENTS V3
-- Stores V3 multi-dimensional baseline profile.
-- V3: No numeric 0-100 scores. Qualitative dimension levels,
-- Senecan grade, passion profile, oikeiosis stage.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.baseline_assessments_v3 (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- 4 progress dimension levels (R6c: qualitative, not numeric)
  passion_reduction TEXT NOT NULL CHECK (passion_reduction IN ('emerging', 'developing', 'established', 'advanced')),
  judgement_quality TEXT NOT NULL CHECK (judgement_quality IN ('emerging', 'developing', 'established', 'advanced')),
  disposition_stability TEXT NOT NULL CHECK (disposition_stability IN ('emerging', 'developing', 'established', 'advanced')),

  -- Oikeiosis stage (from action.json)
  oikeiosis_stage TEXT NOT NULL CHECK (oikeiosis_stage IN ('self_preservation', 'household', 'community', 'humanity', 'cosmic')),

  -- Senecan grade (from progress.json)
  senecan_grade TEXT NOT NULL CHECK (senecan_grade IN ('pre_progress', 'grade_3', 'grade_2', 'grade_1')),

  -- Dominant passion (from passions.json)
  dominant_passion TEXT NOT NULL CHECK (dominant_passion IN ('epithumia', 'hedone', 'phobos', 'lupe')),

  -- Interpretation and disclaimer
  interpretation TEXT,
  disclaimer TEXT DEFAULT 'This is a philosophical framework for self-reflection and does not consider legal, medical, financial, or personal obligations.',

  -- Answers (option IDs selected)
  answers TEXT[] NOT NULL,
  q6_answer TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_baseline_v3_user_id ON public.baseline_assessments_v3(user_id);
CREATE INDEX IF NOT EXISTS idx_baseline_v3_created_at ON public.baseline_assessments_v3(created_at DESC);

-- RLS: users can only read their own baseline assessments
ALTER TABLE public.baseline_assessments_v3 ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own v3 baselines"
  ON public.baseline_assessments_v3 FOR SELECT
  USING (auth.uid() = user_id);

-- Service role (API) handles inserts — bypasses RLS


-- ============================================================
-- 2. PROGRESS SNAPSHOTS V3
-- Tracks progress dimensions over time. One row per snapshot.
-- Used by dashboard to show direction of travel.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.progress_snapshots_v3 (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Snapshot of current state across 4 dimensions
  passion_count_avg NUMERIC(4,2),        -- average passions per recent action
  false_judgement_count_avg NUMERIC(4,2), -- average false judgements per recent action
  most_common_proximity TEXT CHECK (most_common_proximity IN ('reflexive', 'habitual', 'deliberate', 'principled', 'sage_like')),
  oikeiosis_highest TEXT CHECK (oikeiosis_highest IN ('self_preservation', 'household', 'community', 'humanity', 'cosmic')),

  -- Direction of travel per dimension
  passion_direction TEXT CHECK (passion_direction IN ('improving', 'stable', 'regressing')),
  judgement_direction TEXT CHECK (judgement_direction IN ('improving', 'stable', 'regressing')),
  stability_direction TEXT CHECK (stability_direction IN ('improving', 'stable', 'regressing')),
  oikeiosis_direction TEXT CHECK (oikeiosis_direction IN ('improving', 'stable', 'regressing')),

  -- Senecan grade at time of snapshot
  senecan_grade TEXT CHECK (senecan_grade IN ('pre_progress', 'grade_3', 'grade_2', 'grade_1')),

  -- How many evaluations contributed to this snapshot
  evaluations_count INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_progress_snapshots_v3_user_id ON public.progress_snapshots_v3(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_snapshots_v3_created_at ON public.progress_snapshots_v3(created_at DESC);

ALTER TABLE public.progress_snapshots_v3 ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own v3 progress snapshots"
  ON public.progress_snapshots_v3 FOR SELECT
  USING (auth.uid() = user_id);


-- ============================================================
-- 3. DOCUMENT EVALUATIONS V3
-- Stores V3 document/policy/social evaluations.
-- Used by score-document, score-policy, score-social pages.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.document_evaluations_v3 (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Mode: document, policy, or social
  mode TEXT NOT NULL CHECK (mode IN ('document', 'policy', 'social')),

  -- Input
  content_title TEXT,
  content_text TEXT NOT NULL,
  word_count INTEGER DEFAULT 0,

  -- V3 evaluation output (R6c: qualitative proximity)
  katorthoma_proximity TEXT NOT NULL CHECK (katorthoma_proximity IN ('reflexive', 'habitual', 'deliberate', 'principled', 'sage_like')),
  virtue_domains_engaged JSONB DEFAULT '[]'::jsonb,
  ruling_faculty_assessment TEXT,
  improvement_path TEXT,

  -- Passion analysis
  authorial_passions JSONB DEFAULT '[]'::jsonb,
  reader_triggered_passions JSONB DEFAULT '[]'::jsonb,
  false_judgements JSONB DEFAULT '[]'::jsonb,

  -- Control filter
  within_control JSONB DEFAULT '[]'::jsonb,
  outside_control JSONB DEFAULT '[]'::jsonb,

  -- Appropriate action assessment
  is_kathekon BOOLEAN,
  kathekon_quality TEXT CHECK (kathekon_quality IN ('strong', 'moderate', 'marginal', 'contrary')),

  -- Policy-specific (nullable for document/social modes)
  deliberation_assessment JSONB,  -- {is_honourable, is_advantageous, honour_vs_advantage}
  oikeiosis_impact JSONB,        -- {self, household, community, humanity}
  flagged_clauses JSONB,         -- array of flagged clauses

  -- R3: Disclaimer
  disclaimer TEXT DEFAULT 'This is a philosophical framework and does not consider legal, medical, financial, or personal obligations.',

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_document_evaluations_v3_user_id ON public.document_evaluations_v3(user_id);
CREATE INDEX IF NOT EXISTS idx_document_evaluations_v3_mode ON public.document_evaluations_v3(mode);
CREATE INDEX IF NOT EXISTS idx_document_evaluations_v3_created_at ON public.document_evaluations_v3(created_at DESC);

ALTER TABLE public.document_evaluations_v3 ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own v3 document evaluations"
  ON public.document_evaluations_v3 FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own v3 document evaluations"
  ON public.document_evaluations_v3 FOR INSERT
  WITH CHECK (auth.uid() = user_id);


-- ============================================================
-- 4. VERIFY
-- ============================================================

SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'baseline_assessments_v3',
    'progress_snapshots_v3',
    'document_evaluations_v3'
  )
ORDER BY table_name;
