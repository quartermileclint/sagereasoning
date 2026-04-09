-- Migration: Create project_context table for Layer 3 dynamic state
-- Part of Context Architecture (Option C hybrid)
-- Run this when ready to switch from static defaults to live Supabase reads.

CREATE TABLE IF NOT EXISTS project_context (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  current_phase TEXT NOT NULL,
  active_tensions JSONB NOT NULL DEFAULT '[]'::jsonb,
  recent_decisions JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by TEXT -- 'manual' | 'sage-stenographer' | session ID
);

-- Single-row constraint: only one project context row should exist
CREATE UNIQUE INDEX IF NOT EXISTS project_context_singleton ON project_context ((true));

-- Insert initial row from current static defaults
INSERT INTO project_context (current_phase, active_tensions, recent_decisions, updated_by)
VALUES (
  'P0 — Foundations (R&D Phase). Context architecture build: Layer 1 (Stoic Brain injection) and Layer 2 (practitioner context) verified live across 9 engine endpoints. Layer 3 (project context) in progress. Hold point assessment ahead.',
  '["Scope governance: P0 permits product building when it makes what follows simpler, but must not become indefinite preparation.", "The deliberate choice exercise (P1) depends on evidence from P0 hold point testing, not projections.", "Builder-product relationship: the founder''s own practice is the first test case for every tool."]'::jsonb,
  '["2026-04-10: Layer 1+2 context architecture deployed to all 9 runSageReason endpoints. Practitioner context in user message, not system message.", "2026-04-09: Three-layer context architecture adopted (Stoic Brain + Practitioner + Project). Compiled TypeScript approach for Stoic Brain data.", "2026-04-08: Session debrief protocol and critical change protocol adopted after auth incident."]'::jsonb,
  'manual'
)
ON CONFLICT ((true)) DO NOTHING;

-- RLS: Only service role can read/write (this is internal project state, not user data)
ALTER TABLE project_context ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role only" ON project_context
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
