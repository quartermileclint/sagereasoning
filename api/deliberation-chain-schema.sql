-- ============================================================
-- SageReasoning — Deliberation Chain Schema
-- Tracks iterative scoring for AI agents (and future human use)
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- ============================================================
-- 1. DELIBERATION CHAINS
-- One chain = one action being iteratively refined
-- ============================================================

CREATE TABLE IF NOT EXISTS public.deliberation_chains (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Who is deliberating
  agent_id TEXT,                          -- for AI agents (no auth required)
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,  -- for humans (optional, future)

  -- The original situation that kicked off deliberation
  original_action TEXT NOT NULL,
  context TEXT,
  intended_outcome TEXT,

  -- Scores: first and latest
  initial_score NUMERIC(5,2) CHECK (initial_score >= 0 AND initial_score <= 100),
  current_score NUMERIC(5,2) CHECK (current_score >= 0 AND current_score <= 100),
  best_score NUMERIC(5,2) CHECK (best_score >= 0 AND best_score <= 100),

  -- Chain state
  iteration_count INTEGER DEFAULT 1,
  status TEXT CHECK (status IN ('active', 'concluded', 'abandoned')) DEFAULT 'active',

  -- The sage-recommended action from the initial scoring
  sage_growth_action TEXT,
  sage_projected_score NUMERIC(5,2),

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_deliberation_chains_agent_id ON public.deliberation_chains(agent_id);
CREATE INDEX IF NOT EXISTS idx_deliberation_chains_user_id ON public.deliberation_chains(user_id);
CREATE INDEX IF NOT EXISTS idx_deliberation_chains_status ON public.deliberation_chains(status);

-- ============================================================
-- 2. DELIBERATION STEPS
-- Each iteration within a chain
-- ============================================================

CREATE TABLE IF NOT EXISTS public.deliberation_steps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chain_id UUID REFERENCES public.deliberation_chains(id) ON DELETE CASCADE NOT NULL,

  -- Step order (1 = initial score, 2 = first revision, etc.)
  step_number INTEGER NOT NULL,

  -- What the agent proposed at this step
  action_description TEXT NOT NULL,
  revision_rationale TEXT,  -- why the agent changed its action from the previous step

  -- Full virtue scores at this step
  wisdom_score INTEGER CHECK (wisdom_score >= 0 AND wisdom_score <= 100),
  justice_score INTEGER CHECK (justice_score >= 0 AND justice_score <= 100),
  courage_score INTEGER CHECK (courage_score >= 0 AND courage_score <= 100),
  temperance_score INTEGER CHECK (temperance_score >= 0 AND temperance_score <= 100),
  total_score NUMERIC(5,2) CHECK (total_score >= 0 AND total_score <= 100),
  sage_alignment TEXT CHECK (sage_alignment IN ('sage', 'progressing', 'aware', 'misaligned', 'contrary')),

  -- Feedback from the sage at this step
  reasoning TEXT,
  improvement_path TEXT,
  strength TEXT,
  growth_area TEXT,
  growth_action TEXT,
  growth_action_projected_score NUMERIC(5,2),

  -- Delta from previous step (null for step 1)
  score_delta NUMERIC(5,2),

  -- Was this a warning step? (every 5th iteration)
  iteration_warning_issued BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_deliberation_steps_chain_id ON public.deliberation_steps(chain_id);
CREATE INDEX IF NOT EXISTS idx_deliberation_steps_step_number ON public.deliberation_steps(chain_id, step_number);

-- ============================================================
-- 3. AUTO-UPDATE CHAIN WHEN STEP IS ADDED
-- ============================================================

CREATE OR REPLACE FUNCTION public.update_deliberation_chain()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.deliberation_chains SET
    current_score = NEW.total_score,
    best_score = GREATEST(COALESCE(best_score, 0), NEW.total_score),
    iteration_count = NEW.step_number,
    updated_at = NOW()
  WHERE id = NEW.chain_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_deliberation_step_added ON public.deliberation_steps;
CREATE TRIGGER on_deliberation_step_added
  AFTER INSERT ON public.deliberation_steps
  FOR EACH ROW EXECUTE FUNCTION public.update_deliberation_chain();

-- ============================================================
-- 4. ROW LEVEL SECURITY
-- Agents access by agent_id; humans by user_id
-- ============================================================

ALTER TABLE public.deliberation_chains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deliberation_steps ENABLE ROW LEVEL SECURITY;

-- Chains: authenticated users can see their own
CREATE POLICY "Users can view own chains"
  ON public.deliberation_chains FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own chains"
  ON public.deliberation_chains FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Steps: via chain ownership
CREATE POLICY "Users can view own chain steps"
  ON public.deliberation_steps FOR SELECT
  USING (
    chain_id IN (SELECT id FROM public.deliberation_chains WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can insert own chain steps"
  ON public.deliberation_steps FOR INSERT
  WITH CHECK (
    chain_id IN (SELECT id FROM public.deliberation_chains WHERE user_id = auth.uid())
  );

-- Service role policy for agent-initiated chains (no auth, tracked by agent_id)
-- These use supabaseAdmin (service role) so RLS is bypassed server-side

-- ============================================================
-- 5. VERIFY
-- ============================================================

SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('deliberation_chains', 'deliberation_steps')
ORDER BY table_name;
