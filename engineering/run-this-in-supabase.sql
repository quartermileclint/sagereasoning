-- ============================================================
-- SageReasoning V3 Baseline & Progress Migration
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- Safe to re-run — uses CREATE TABLE IF NOT EXISTS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.baseline_assessments_v3 (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  passion_reduction TEXT NOT NULL CHECK (passion_reduction IN ('emerging', 'developing', 'established', 'advanced')),
  judgement_quality TEXT NOT NULL CHECK (judgement_quality IN ('emerging', 'developing', 'established', 'advanced')),
  disposition_stability TEXT NOT NULL CHECK (disposition_stability IN ('emerging', 'developing', 'established', 'advanced')),
  oikeiosis_stage TEXT NOT NULL CHECK (oikeiosis_stage IN ('self_preservation', 'household', 'community', 'humanity', 'cosmic')),
  senecan_grade TEXT NOT NULL CHECK (senecan_grade IN ('pre_progress', 'grade_3', 'grade_2', 'grade_1')),
  dominant_passion TEXT NOT NULL CHECK (dominant_passion IN ('epithumia', 'hedone', 'phobos', 'lupe')),
  interpretation TEXT,
  disclaimer TEXT DEFAULT 'This is a philosophical framework for self-reflection and does not consider legal, medical, financial, or personal obligations.',
  answers TEXT[] NOT NULL,
  q6_answer TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_baseline_v3_user_id ON public.baseline_assessments_v3(user_id);
CREATE INDEX IF NOT EXISTS idx_baseline_v3_created_at ON public.baseline_assessments_v3(created_at DESC);

ALTER TABLE public.baseline_assessments_v3 ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'baseline_assessments_v3' AND policyname = 'Users can view own v3 baselines'
  ) THEN
    CREATE POLICY "Users can view own v3 baselines"
      ON public.baseline_assessments_v3 FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.progress_snapshots_v3 (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  passion_count_avg NUMERIC(4,2),
  false_judgement_count_avg NUMERIC(4,2),
  most_common_proximity TEXT CHECK (most_common_proximity IN ('reflexive', 'habitual', 'deliberate', 'principled', 'sage_like')),
  oikeiosis_highest TEXT CHECK (oikeiosis_highest IN ('self_preservation', 'household', 'community', 'humanity', 'cosmic')),
  passion_direction TEXT CHECK (passion_direction IN ('improving', 'stable', 'regressing')),
  judgement_direction TEXT CHECK (judgement_direction IN ('improving', 'stable', 'regressing')),
  stability_direction TEXT CHECK (stability_direction IN ('improving', 'stable', 'regressing')),
  oikeiosis_direction TEXT CHECK (oikeiosis_direction IN ('improving', 'stable', 'regressing')),
  senecan_grade TEXT CHECK (senecan_grade IN ('pre_progress', 'grade_3', 'grade_2', 'grade_1')),
  evaluations_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_progress_snapshots_v3_user_id ON public.progress_snapshots_v3(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_snapshots_v3_created_at ON public.progress_snapshots_v3(created_at DESC);

ALTER TABLE public.progress_snapshots_v3 ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'progress_snapshots_v3' AND policyname = 'Users can view own v3 progress snapshots'
  ) THEN
    CREATE POLICY "Users can view own v3 progress snapshots"
      ON public.progress_snapshots_v3 FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.document_evaluations_v3 (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  mode TEXT NOT NULL CHECK (mode IN ('document', 'policy', 'social')),
  content_title TEXT,
  content_text TEXT NOT NULL,
  word_count INTEGER DEFAULT 0,
  katorthoma_proximity TEXT NOT NULL CHECK (katorthoma_proximity IN ('reflexive', 'habitual', 'deliberate', 'principled', 'sage_like')),
  virtue_domains_engaged JSONB DEFAULT '[]'::jsonb,
  ruling_faculty_assessment TEXT,
  improvement_path TEXT,
  authorial_passions JSONB DEFAULT '[]'::jsonb,
  reader_triggered_passions JSONB DEFAULT '[]'::jsonb,
  false_judgements JSONB DEFAULT '[]'::jsonb,
  within_control JSONB DEFAULT '[]'::jsonb,
  outside_control JSONB DEFAULT '[]'::jsonb,
  is_kathekon BOOLEAN,
  kathekon_quality TEXT CHECK (kathekon_quality IN ('strong', 'moderate', 'marginal', 'contrary')),
  deliberation_assessment JSONB,
  oikeiosis_impact JSONB,
  flagged_clauses JSONB,
  disclaimer TEXT DEFAULT 'This is a philosophical framework and does not consider legal, medical, financial, or personal obligations.',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_document_evaluations_v3_user_id ON public.document_evaluations_v3(user_id);
CREATE INDEX IF NOT EXISTS idx_document_evaluations_v3_mode ON public.document_evaluations_v3(mode);
CREATE INDEX IF NOT EXISTS idx_document_evaluations_v3_created_at ON public.document_evaluations_v3(created_at DESC);

ALTER TABLE public.document_evaluations_v3 ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'document_evaluations_v3' AND policyname = 'Users can view own v3 document evaluations'
  ) THEN
    CREATE POLICY "Users can view own v3 document evaluations"
      ON public.document_evaluations_v3 FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'document_evaluations_v3' AND policyname = 'Users can insert own v3 document evaluations'
  ) THEN
    CREATE POLICY "Users can insert own v3 document evaluations"
      ON public.document_evaluations_v3 FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Verify all tables were created
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'baseline_assessments_v3',
    'progress_snapshots_v3',
    'document_evaluations_v3'
  )
ORDER BY table_name;
