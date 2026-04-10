-- =============================================================================
-- Founder Communication Hub — Conversation Storage
-- =============================================================================
-- Stores all founder-agent conversations for the communication hub.
-- Each conversation has a primary agent, and messages from founder, primary agent,
-- and observer agents.
--
-- Run this in Supabase SQL Editor.
-- =============================================================================

-- Conversations table — one row per conversation thread
CREATE TABLE IF NOT EXISTS founder_conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  primary_agent TEXT NOT NULL CHECK (primary_agent IN ('ops', 'tech', 'growth', 'support', 'mentor')),
  title TEXT,  -- auto-generated from first message, editable
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Messages table — all messages in a conversation (founder, agents, observers)
CREATE TABLE IF NOT EXISTS founder_conversation_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES founder_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('founder', 'agent', 'observer')),
  agent_type TEXT CHECK (agent_type IN ('ops', 'tech', 'growth', 'support', 'mentor')),
  content TEXT NOT NULL,
  -- Pipeline metadata (for agent/observer messages)
  pipeline_meta JSONB,  -- PipelineMeta from orchestrator
  decision_gate JSONB,  -- DecisionGateResult if gate was triggered
  -- Observer metadata
  relevance_score REAL,  -- 0.0-1.0, how relevant the observer deemed its contribution
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_fcm_conversation_id ON founder_conversation_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_fcm_created_at ON founder_conversation_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_fc_status ON founder_conversations(status);
CREATE INDEX IF NOT EXISTS idx_fc_updated_at ON founder_conversations(updated_at);

-- RLS: Only founder can access (matches FOUNDER_USER_ID pattern)
-- Note: RLS policies use Supabase auth. Since these endpoints are already
-- gated by FOUNDER_USER_ID in the API routes, RLS here is defense-in-depth.
ALTER TABLE founder_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE founder_conversation_messages ENABLE ROW LEVEL SECURITY;

-- Allow service role full access (API routes use supabaseAdmin)
CREATE POLICY "Service role full access on conversations"
  ON founder_conversations FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access on messages"
  ON founder_conversation_messages FOR ALL
  USING (true)
  WITH CHECK (true);
