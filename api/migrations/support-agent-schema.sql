-- ============================================================================
-- SUPPORT AGENT OPERATIONAL TABLES
-- Migration: support-agent-schema.sql
-- Date: 2026-04-04
-- Purpose: Operational tables for the support agent (Part A, Step 3)
-- All tables use RLS, user-scoped per SageReasoning convention.
-- ============================================================================

-- 1. Support interactions log (OpenBrain immutable receipt)
-- Each resolved support interaction is synced here from local markdown files.
CREATE TABLE IF NOT EXISTS support_interactions (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  interaction_id  TEXT NOT NULL UNIQUE,
  channel         TEXT NOT NULL DEFAULT 'email'
    CHECK (channel IN ('email', 'chat', 'api', 'social', 'form')),
  status          TEXT NOT NULL DEFAULT 'open'
    CHECK (status IN ('open', 'in_progress', 'resolved', 'escalated')),
  customer_id     TEXT,
  subject         TEXT,
  raw_content     TEXT NOT NULL,
  draft_response  TEXT,
  ring_evaluation JSONB,
  resolved_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for querying open interactions
CREATE INDEX IF NOT EXISTS idx_support_interactions_status
  ON support_interactions(user_id, status);

-- Index for date-range queries (pattern summaries, daily batch)
CREATE INDEX IF NOT EXISTS idx_support_interactions_created
  ON support_interactions(user_id, created_at DESC);

-- 2. Support agent token usage (extends ring instrumentation)
-- Tracks LLM costs per interaction for cost monitoring (R5).
CREATE TABLE IF NOT EXISTS support_token_usage (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  interaction_id  TEXT REFERENCES support_interactions(interaction_id),
  model           TEXT NOT NULL,
  model_tier      TEXT NOT NULL CHECK (model_tier IN ('fast', 'deep')),
  input_tokens    INTEGER NOT NULL,
  output_tokens   INTEGER NOT NULL,
  estimated_cost  NUMERIC(10, 6) NOT NULL,
  phase           TEXT NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for cost aggregation queries
CREATE INDEX IF NOT EXISTS idx_support_token_usage_interaction
  ON support_token_usage(interaction_id);

-- 3. Support pattern summaries (pattern engine output)
-- Aggregated insights about support operations over time.
CREATE TABLE IF NOT EXISTS support_pattern_summaries (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  summary_type    TEXT NOT NULL
    CHECK (summary_type IN ('weekly', 'monthly', 'quarterly')),
  period_start    DATE NOT NULL,
  period_end      DATE NOT NULL,
  total_interactions INTEGER NOT NULL DEFAULT 0,
  resolution_rate NUMERIC(5, 2),
  escalation_rate NUMERIC(5, 2),
  top_topics      JSONB,
  ring_observations JSONB,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Unique constraint: one summary per type per period per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_support_pattern_unique
  ON support_pattern_summaries(user_id, summary_type, period_start, period_end);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE support_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_token_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_pattern_summaries ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "support_interactions_own_data" ON support_interactions
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "support_token_usage_own_data" ON support_token_usage
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "support_pattern_summaries_own_data" ON support_pattern_summaries
  FOR ALL USING (auth.uid() = user_id);
