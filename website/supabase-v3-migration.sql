-- ============================================================
-- SageReasoning V3 Migration
-- Derived from scoring.json evaluation_sequence outputs,
-- deliberation.ts V3 types, and action.json deliberation framework.
--
-- Run this in: Supabase Dashboard → SQL Editor → New Query
--
-- This migration creates NEW V3 tables alongside the existing V1 tables.
-- V1 tables (action_evaluations, deliberation_chains, deliberation_steps)
-- are NOT modified or dropped — they remain until Phase 10 cleanup.
-- ============================================================


-- ============================================================
-- 1. ACTION EVALUATIONS V3
-- Stores the output of the 4-stage evaluation sequence.
-- Used by: website/src/app/score/page.tsx (human tool)
-- Derived from: scoring.json > scoring_outputs > past_action
-- ============================================================

CREATE TABLE IF NOT EXISTS public.action_evaluations_v3 (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- Input fields (P3.1)
  action TEXT NOT NULL,
  context TEXT,
  relationships TEXT,          -- NEW in V3: oikeiosis context
  emotional_state TEXT,        -- NEW in V3: for passion diagnosis

  -- Stage 1: Prohairesis Filter (control_filter)
  within_prohairesis JSONB DEFAULT '[]'::jsonb,    -- array of strings
  outside_prohairesis JSONB DEFAULT '[]'::jsonb,   -- array of strings

  -- Stage 2: Kathekon Assessment
  is_kathekon BOOLEAN,
  kathekon_quality TEXT CHECK (kathekon_quality IN ('strong', 'moderate', 'marginal', 'contrary')),

  -- Stage 3: Passion Diagnosis
  passions_detected JSONB DEFAULT '[]'::jsonb,     -- array of {id, name, root_passion}
  false_judgements JSONB DEFAULT '[]'::jsonb,       -- array of strings
  causal_stage_affected TEXT CHECK (causal_stage_affected IN ('phantasia', 'synkatathesis', 'horme', 'praxis')),

  -- Stage 4: Unified Virtue Assessment
  -- R6c: qualitative proximity, NOT numeric 0-100
  katorthoma_proximity TEXT NOT NULL CHECK (katorthoma_proximity IN ('reflexive', 'habitual', 'deliberate', 'principled', 'sage_like')),
  ruling_faculty_state TEXT,
  virtue_domains_engaged JSONB DEFAULT '[]'::jsonb, -- array of virtue domain IDs

  -- Additional outputs
  improvement_path TEXT,
  oikeiosis_context TEXT,
  philosophical_reflection TEXT,

  -- R3: Disclaimer always present
  disclaimer TEXT DEFAULT 'This is a philosophical framework and does not consider legal, medical, financial, or personal obligations.',

  -- AI transparency
  ai_generated BOOLEAN DEFAULT TRUE,
  ai_model TEXT DEFAULT 'claude-sonnet-4-6',

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_action_evaluations_v3_user_id ON public.action_evaluations_v3(user_id);
CREATE INDEX IF NOT EXISTS idx_action_evaluations_v3_proximity ON public.action_evaluations_v3(katorthoma_proximity);
CREATE INDEX IF NOT EXISTS idx_action_evaluations_v3_created_at ON public.action_evaluations_v3(created_at DESC);


-- ============================================================
-- 2. DELIBERATION CHAINS V3
-- Tracks iterative evaluation for AI agents (and humans).
-- V3: qualitative proximity tracking, no numeric scores.
-- Derived from: deliberation.ts V3DeliberationChain type
-- ============================================================

CREATE TABLE IF NOT EXISTS public.deliberation_chains_v3 (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Who is deliberating
  agent_id TEXT,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- The original situation
  original_action TEXT NOT NULL,
  context TEXT,
  relationships TEXT,           -- NEW in V3: oikeiosis context
  emotional_state TEXT,         -- NEW in V3: for passion diagnosis

  -- V3 proximity tracking (replaces V1 numeric scores)
  -- R6c: qualitative levels only
  initial_proximity TEXT NOT NULL CHECK (initial_proximity IN ('reflexive', 'habitual', 'deliberate', 'principled', 'sage_like')),
  current_proximity TEXT NOT NULL CHECK (current_proximity IN ('reflexive', 'habitual', 'deliberate', 'principled', 'sage_like')),
  best_proximity TEXT NOT NULL CHECK (best_proximity IN ('reflexive', 'habitual', 'deliberate', 'principled', 'sage_like')),

  -- Chain state
  iteration_count INTEGER DEFAULT 1,
  status TEXT CHECK (status IN ('active', 'concluded', 'abandoned')) DEFAULT 'active',

  -- Sage reflection on the chain's overall arc
  sage_reflection TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_deliberation_chains_v3_agent_id ON public.deliberation_chains_v3(agent_id);
CREATE INDEX IF NOT EXISTS idx_deliberation_chains_v3_user_id ON public.deliberation_chains_v3(user_id);
CREATE INDEX IF NOT EXISTS idx_deliberation_chains_v3_status ON public.deliberation_chains_v3(status);


-- ============================================================
-- 3. DELIBERATION STEPS V3
-- Each iteration within a V3 chain.
-- Full 4-stage evaluation output per step.
-- Derived from: deliberation.ts V3DeliberationStep type
-- ============================================================

CREATE TABLE IF NOT EXISTS public.deliberation_steps_v3 (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chain_id UUID REFERENCES public.deliberation_chains_v3(id) ON DELETE CASCADE NOT NULL,

  step_number INTEGER NOT NULL,
  action_description TEXT NOT NULL,
  revision_rationale TEXT,

  -- Stage 1: Prohairesis Filter
  -- (stored as part of full evaluation, not separate columns — kept in eval_data JSONB for flexibility)

  -- Stage 2: Kathekon Assessment
  is_kathekon BOOLEAN,
  kathekon_quality TEXT CHECK (kathekon_quality IN ('strong', 'moderate', 'marginal', 'contrary')),

  -- Stage 3: Passion Diagnosis
  passions_detected JSONB DEFAULT '[]'::jsonb,
  false_judgements JSONB DEFAULT '[]'::jsonb,
  causal_stage_affected TEXT CHECK (causal_stage_affected IN ('phantasia', 'synkatathesis', 'horme', 'praxis')),

  -- Stage 4: Unified Virtue Assessment
  katorthoma_proximity TEXT NOT NULL CHECK (katorthoma_proximity IN ('reflexive', 'habitual', 'deliberate', 'principled', 'sage_like')),
  ruling_faculty_state TEXT,
  virtue_domains_engaged JSONB DEFAULT '[]'::jsonb,

  -- Deliberation outputs
  philosophical_reflection TEXT,
  improvement_path TEXT,
  oikeiosis_context TEXT,

  -- Direction of travel (compared to previous step)
  proximity_direction TEXT CHECK (proximity_direction IN ('improving', 'stable', 'regressing')),
  passions_direction TEXT CHECK (passions_direction IN ('fewer', 'same', 'more')),

  -- Cicero's 5-question framework (action.json > deliberation_framework)
  cicero_assessment JSONB,     -- {Q1_is_honourable, Q2_comparative_honour, Q3_is_advantageous, Q4_comparative_advantage, Q5_conflict_resolution}

  -- Iteration management
  iteration_warning_issued BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_deliberation_steps_v3_chain_id ON public.deliberation_steps_v3(chain_id);
CREATE INDEX IF NOT EXISTS idx_deliberation_steps_v3_step_number ON public.deliberation_steps_v3(chain_id, step_number);


-- ============================================================
-- 4. AUTO-UPDATE V3 CHAIN WHEN STEP IS ADDED
-- Uses proximity ordering instead of numeric scores.
-- ============================================================

CREATE OR REPLACE FUNCTION public.proximity_rank(level TEXT)
RETURNS INTEGER AS $$
BEGIN
  RETURN CASE level
    WHEN 'reflexive' THEN 0
    WHEN 'habitual' THEN 1
    WHEN 'deliberate' THEN 2
    WHEN 'principled' THEN 3
    WHEN 'sage_like' THEN 4
    ELSE -1
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION public.update_deliberation_chain_v3()
RETURNS TRIGGER AS $$
DECLARE
  current_best TEXT;
BEGIN
  SELECT best_proximity INTO current_best
  FROM public.deliberation_chains_v3
  WHERE id = NEW.chain_id;

  UPDATE public.deliberation_chains_v3 SET
    current_proximity = NEW.katorthoma_proximity,
    best_proximity = CASE
      WHEN public.proximity_rank(NEW.katorthoma_proximity) > public.proximity_rank(COALESCE(current_best, 'reflexive'))
      THEN NEW.katorthoma_proximity
      ELSE COALESCE(current_best, NEW.katorthoma_proximity)
    END,
    iteration_count = NEW.step_number,
    updated_at = NOW()
  WHERE id = NEW.chain_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_deliberation_step_v3_added ON public.deliberation_steps_v3;
CREATE TRIGGER on_deliberation_step_v3_added
  AFTER INSERT ON public.deliberation_steps_v3
  FOR EACH ROW EXECUTE FUNCTION public.update_deliberation_chain_v3();


-- ============================================================
-- 5. ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.action_evaluations_v3 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deliberation_chains_v3 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deliberation_steps_v3 ENABLE ROW LEVEL SECURITY;

-- Action evaluations: users see their own
CREATE POLICY "Users can view own v3 evaluations"
  ON public.action_evaluations_v3 FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own v3 evaluations"
  ON public.action_evaluations_v3 FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- V3 Chains: users see their own
CREATE POLICY "Users can view own v3 chains"
  ON public.deliberation_chains_v3 FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own v3 chains"
  ON public.deliberation_chains_v3 FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- V3 Steps: via chain ownership
CREATE POLICY "Users can view own v3 chain steps"
  ON public.deliberation_steps_v3 FOR SELECT
  USING (
    chain_id IN (SELECT id FROM public.deliberation_chains_v3 WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can insert own v3 chain steps"
  ON public.deliberation_steps_v3 FOR INSERT
  WITH CHECK (
    chain_id IN (SELECT id FROM public.deliberation_chains_v3 WHERE user_id = auth.uid())
  );

-- Service role (supabaseAdmin) bypasses RLS for agent-initiated operations


-- ============================================================
-- 6. VERIFY
-- ============================================================

SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('action_evaluations_v3', 'deliberation_chains_v3', 'deliberation_steps_v3')
ORDER BY table_name;
