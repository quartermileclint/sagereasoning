-- Migration: Session Bridge Tables
-- Created: 2026-04-04
-- Module: sage-mentor/session-bridge.ts
-- Architecture doc: Sage_Mentor_Claude_Integration_Architecture.md §4
--
-- Creates the two persistence tables required by the session bridge:
--   session_decisions           — strategic decision log from Cowork sessions
--   session_context_snapshots   — project context at time of decision
--
-- Both tables enforce RLS so each user can only access their own records.
--
-- @compliance
-- compliance_version: CR-2026-Q2-v1
-- regulatory_references: [CR-005, CR-009, CR-020, CR-021]
-- RLS: enabled on all tables (R4 IP protection)

-- ═══════════════════════════════════════════════════════════════════════
-- 1. session_decisions
-- ═══════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS session_decisions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  session_id TEXT NOT NULL,
  session_mode TEXT CHECK (session_mode IN ('observer', 'consultant', 'companion')),
  decision_type TEXT CHECK (decision_type IN (
    'architecture', 'pricing', 'positioning', 'partnership',
    'scope', 'compliance', 'risk', 'document_review', 'other'
  )),
  description TEXT NOT NULL,
  context_summary TEXT,

  -- Ring evaluation results
  proximity_assessed TEXT CHECK (proximity_assessed IN (
    'reflexive', 'habitual', 'deliberate', 'principled', 'sage_like'
  )),
  passions_detected JSONB DEFAULT '[]',
  false_judgements JSONB DEFAULT '[]',
  mechanisms_applied TEXT[] DEFAULT '{}',
  mentor_observation TEXT,
  journal_reference_id TEXT,

  -- Outcome tracking (filled in later when decision outcome is known)
  outcome_notes TEXT,
  outcome_assessed_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: users access only their own decisions
ALTER TABLE session_decisions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users access own decisions"
  ON session_decisions
  FOR ALL
  USING (auth.uid() = user_id);

-- Index: rolling window queries order by most recent
CREATE INDEX IF NOT EXISTS idx_session_decisions_user_created
  ON session_decisions (user_id, created_at DESC);

-- Index: session-scoped lookups
CREATE INDEX IF NOT EXISTS idx_session_decisions_session
  ON session_decisions (session_id);

-- Index: decision type filtering for pattern engine
CREATE INDEX IF NOT EXISTS idx_session_decisions_type
  ON session_decisions (user_id, decision_type);


-- ═══════════════════════════════════════════════════════════════════════
-- 2. session_context_snapshots
-- ═══════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS session_context_snapshots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  session_decision_id UUID REFERENCES session_decisions ON DELETE CASCADE,
  snapshot_type TEXT CHECK (snapshot_type IN (
    'knowledge_context', 'v3_scope_status', 'business_plan', 'custom'
  )),
  content_hash TEXT NOT NULL,
  summary TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: users access only their own snapshots
ALTER TABLE session_context_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users access own snapshots"
  ON session_context_snapshots
  FOR ALL
  USING (auth.uid() = user_id);

-- Index: link back to decisions
CREATE INDEX IF NOT EXISTS idx_snapshots_decision
  ON session_context_snapshots (session_decision_id);

-- Index: user + type for quick context comparisons
CREATE INDEX IF NOT EXISTS idx_snapshots_user_type
  ON session_context_snapshots (user_id, snapshot_type, created_at DESC);


-- ═══════════════════════════════════════════════════════════════════════
-- 3. updated_at trigger (reuse if already exists)
-- ═══════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_session_decisions_updated_at
  BEFORE UPDATE ON session_decisions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
