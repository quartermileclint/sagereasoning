-- Migration: Reasoning Receipts & Pattern Detection tables
-- Run in Supabase SQL Editor

-- ============================================================
-- 1. reasoning_receipts — Persistent receipt storage
-- ============================================================
CREATE TABLE IF NOT EXISTS reasoning_receipts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  skill_id TEXT NOT NULL,
  input_hash TEXT NOT NULL,
  agent_id TEXT,
  chain_id UUID,
  katorthoma_proximity TEXT CHECK (katorthoma_proximity IN ('reflexive', 'habitual', 'deliberate', 'principled', 'sage_like')),
  mechanisms_applied TEXT[] DEFAULT '{}',
  passions_count INTEGER DEFAULT 0,
  passions_detected JSONB DEFAULT '[]',
  reasoning_trace JSONB DEFAULT '[]',
  is_kathekon BOOLEAN,
  kathekon_quality TEXT CHECK (kathekon_quality IN ('strong', 'moderate', 'marginal', 'contrary')),
  recommended_next TEXT,
  full_receipt JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_receipts_agent ON reasoning_receipts (agent_id) WHERE agent_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_receipts_skill ON reasoning_receipts (skill_id);
CREATE INDEX IF NOT EXISTS idx_receipts_proximity ON reasoning_receipts (katorthoma_proximity);
CREATE INDEX IF NOT EXISTS idx_receipts_created ON reasoning_receipts (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_receipts_chain ON reasoning_receipts (chain_id) WHERE chain_id IS NOT NULL;

-- ============================================================
-- 2. reasoning_patterns — Detected patterns from receipt analysis
-- ============================================================
CREATE TABLE IF NOT EXISTS reasoning_patterns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id TEXT,
  pattern_type TEXT NOT NULL CHECK (pattern_type IN (
    'recurring_passion', 'proximity_trend', 'skill_preference',
    'virtue_gap', 'improvement_trajectory', 'passion_cluster'
  )),
  pattern_data JSONB NOT NULL,
  confidence REAL CHECK (confidence >= 0 AND confidence <= 1),
  receipts_analyzed INTEGER DEFAULT 0,
  date_range_start TIMESTAMPTZ,
  date_range_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_patterns_agent ON reasoning_patterns (agent_id) WHERE agent_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_patterns_type ON reasoning_patterns (pattern_type);

-- ============================================================
-- 3. Enable RLS (service role key bypasses these)
-- ============================================================
ALTER TABLE reasoning_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE reasoning_patterns ENABLE ROW LEVEL SECURITY;

-- Service role has full access (API routes use supabaseAdmin)
-- No anon policies needed — these are API-only tables
