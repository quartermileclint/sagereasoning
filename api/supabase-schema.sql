-- ============================================================
-- SageReasoning — Supabase Database Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- ============================================================
-- 1. USER PROFILES
-- Extends Supabase's built-in auth.users table
-- ============================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  display_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 2. ACTION SCORES
-- Stores every scored action for each user (P6)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.action_scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,

  -- The action
  action_description TEXT NOT NULL,
  context TEXT,
  intended_outcome TEXT,
  actual_outcome TEXT,

  -- Virtue scores (0-100 each)
  wisdom_score INTEGER CHECK (wisdom_score >= 0 AND wisdom_score <= 100),
  justice_score INTEGER CHECK (justice_score >= 0 AND justice_score <= 100),
  courage_score INTEGER CHECK (courage_score >= 0 AND courage_score <= 100),
  temperance_score INTEGER CHECK (temperance_score >= 0 AND temperance_score <= 100),

  -- Composite score (weighted, 0-100)
  total_score NUMERIC(5,2) CHECK (total_score >= 0 AND total_score <= 100),

  -- Qualitative tier
  sage_alignment TEXT CHECK (sage_alignment IN ('sage', 'progressing', 'aware', 'misaligned', 'contrary')),

  -- AI reasoning output
  reasoning TEXT,
  improvement_path TEXT,
  strength TEXT,   -- which virtue was strongest
  growth_area TEXT, -- which virtue needs most work
  key_indifferents TEXT[], -- array of indifferent IDs involved

  -- Metadata
  scored_by TEXT DEFAULT 'claude', -- which AI model scored this
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast user history queries
CREATE INDEX IF NOT EXISTS idx_action_scores_user_id ON public.action_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_action_scores_created_at ON public.action_scores(created_at DESC);

-- ============================================================
-- 3. USER STOIC PROFILE (Aggregated)
-- Cached aggregate stats — recalculated when new scores are added
-- ============================================================

CREATE TABLE IF NOT EXISTS public.user_stoic_profiles (
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,

  -- Aggregate virtue averages
  avg_wisdom NUMERIC(5,2) DEFAULT 0,
  avg_justice NUMERIC(5,2) DEFAULT 0,
  avg_courage NUMERIC(5,2) DEFAULT 0,
  avg_temperance NUMERIC(5,2) DEFAULT 0,
  avg_total NUMERIC(5,2) DEFAULT 0,

  -- Derived fields
  sage_alignment TEXT CHECK (sage_alignment IN ('sage', 'progressing', 'aware', 'misaligned', 'contrary')) DEFAULT 'aware',
  strongest_virtue TEXT,
  growth_virtue TEXT,
  actions_scored INTEGER DEFAULT 0,

  -- Trend (based on last 10 vs previous 10 scores)
  trend TEXT CHECK (trend IN ('improving', 'declining', 'stable')) DEFAULT 'stable',

  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Function to recalculate profile after a new score is added
CREATE OR REPLACE FUNCTION public.update_stoic_profile()
RETURNS TRIGGER AS $$
DECLARE
  avg_w NUMERIC;
  avg_j NUMERIC;
  avg_c NUMERIC;
  avg_t NUMERIC;
  avg_tot NUMERIC;
  cnt INTEGER;
  strongest TEXT;
  weakest TEXT;
  alignment TEXT;
BEGIN
  -- Calculate averages
  SELECT
    AVG(wisdom_score), AVG(justice_score), AVG(courage_score),
    AVG(temperance_score), AVG(total_score), COUNT(*)
  INTO avg_w, avg_j, avg_c, avg_t, avg_tot, cnt
  FROM public.action_scores
  WHERE user_id = NEW.user_id;

  -- Determine strongest and weakest virtue
  SELECT virtue INTO strongest FROM (
    VALUES ('wisdom', avg_w), ('justice', avg_j), ('courage', avg_c), ('temperance', avg_t)
  ) AS v(virtue, score)
  ORDER BY score DESC LIMIT 1;

  SELECT virtue INTO weakest FROM (
    VALUES ('wisdom', avg_w), ('justice', avg_j), ('courage', avg_c), ('temperance', avg_t)
  ) AS v(virtue, score)
  ORDER BY score ASC LIMIT 1;

  -- Determine alignment tier
  alignment := CASE
    WHEN avg_tot >= 95 THEN 'sage'
    WHEN avg_tot >= 70 THEN 'progressing'
    WHEN avg_tot >= 40 THEN 'aware'
    WHEN avg_tot >= 15 THEN 'misaligned'
    ELSE 'contrary'
  END;

  -- Upsert profile
  INSERT INTO public.user_stoic_profiles (
    user_id, avg_wisdom, avg_justice, avg_courage, avg_temperance,
    avg_total, sage_alignment, strongest_virtue, growth_virtue,
    actions_scored, updated_at
  )
  VALUES (
    NEW.user_id, avg_w, avg_j, avg_c, avg_t,
    avg_tot, alignment, strongest, weakest,
    cnt, NOW()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    avg_wisdom = EXCLUDED.avg_wisdom,
    avg_justice = EXCLUDED.avg_justice,
    avg_courage = EXCLUDED.avg_courage,
    avg_temperance = EXCLUDED.avg_temperance,
    avg_total = EXCLUDED.avg_total,
    sage_alignment = EXCLUDED.sage_alignment,
    strongest_virtue = EXCLUDED.strongest_virtue,
    growth_virtue = EXCLUDED.growth_virtue,
    actions_scored = EXCLUDED.actions_scored,
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_action_score_added ON public.action_scores;
CREATE TRIGGER on_action_score_added
  AFTER INSERT ON public.action_scores
  FOR EACH ROW EXECUTE FUNCTION public.update_stoic_profile();

-- ============================================================
-- 4. ROW LEVEL SECURITY (RLS)
-- Users can only see their own data
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.action_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_stoic_profiles ENABLE ROW LEVEL SECURITY;

-- Profiles: users can only read/update their own
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Action scores: users can only see/insert their own
CREATE POLICY "Users can view own scores"
  ON public.action_scores FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scores"
  ON public.action_scores FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Stoic profiles: users can only view their own
CREATE POLICY "Users can view own stoic profile"
  ON public.user_stoic_profiles FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================================
-- 5. VERIFY
-- Run this to confirm tables were created correctly
-- ============================================================

SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
