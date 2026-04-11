-- Migration: Agent Handoffs Table
-- Created: 2026-04-11
-- Module: inter-agent coordination
-- Protocol doc: operations/inter-agent-handoff-protocol.md
--
-- Creates the agent_handoffs table for asynchronous inter-agent coordination.
-- Markdown files in operations/handoffs/ are canonical; this table provides
-- queryability, rolling category windows, and reporting.
--
-- @compliance
-- compliance_version: CR-2026-Q2-v1
-- RLS: enabled (admin/service-role only — internal agent use)

-- ═══════════════════════════════════════════════════════════════════════
-- 1. agent_handoffs
-- ═══════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.agent_handoffs (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Routing
  source_agent    TEXT NOT NULL
    CHECK (source_agent IN ('tech', 'growth', 'support', 'ops', 'founder')),
  target_agent    TEXT NOT NULL
    CHECK (target_agent IN ('tech', 'growth', 'support', 'ops', 'founder')),
  category        TEXT NOT NULL
    CHECK (category IN (
      'content-opportunity',
      'api-change',
      'support-pattern',
      'messaging-update'
    )),

  -- Content
  description     TEXT NOT NULL,
  action_required TEXT,
  context_ref     TEXT,   -- Reference to session, ADR, decision-log entry, file path

  -- Priority and status
  priority        TEXT NOT NULL DEFAULT 'normal'
    CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  status          TEXT NOT NULL DEFAULT 'open'
    CHECK (status IN (
      'open',
      'read',
      'actioned',
      'no-action-needed',
      'escalated'
    )),

  -- Lifecycle
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  read_at         TIMESTAMPTZ,
  resolved_at     TIMESTAMPTZ,
  resolution_note TEXT    -- Note when status → actioned / no-action-needed
);

-- ═══════════════════════════════════════════════════════════════════════
-- 2. RLS — service role only (internal agent sessions)
-- ═══════════════════════════════════════════════════════════════════════

ALTER TABLE public.agent_handoffs ENABLE ROW LEVEL SECURITY;

-- No user-facing policies. All access via supabaseAdmin (service role)
-- in agent session handlers.

-- ═══════════════════════════════════════════════════════════════════════
-- 3. Indexes
-- ═══════════════════════════════════════════════════════════════════════

-- Primary query: target agent reads open handoffs at session start
CREATE INDEX IF NOT EXISTS idx_handoffs_target_status
  ON public.agent_handoffs (target_agent, status, created_at DESC);

-- Support category rolling window (30-day threshold trigger)
CREATE INDEX IF NOT EXISTS idx_handoffs_category_window
  ON public.agent_handoffs (category, created_at DESC);

-- Source→target reporting
CREATE INDEX IF NOT EXISTS idx_handoffs_source_target
  ON public.agent_handoffs (source_agent, target_agent, created_at DESC);

-- ═══════════════════════════════════════════════════════════════════════
-- 4. Helper view — open handoffs summary
-- ═══════════════════════════════════════════════════════════════════════

CREATE OR REPLACE VIEW public.agent_handoffs_open AS
SELECT
  id,
  source_agent,
  target_agent,
  category,
  priority,
  status,
  LEFT(description, 120) AS description_preview,
  created_at,
  EXTRACT(EPOCH FROM (now() - created_at)) / 3600 AS hours_open
FROM public.agent_handoffs
WHERE status = 'open'
ORDER BY
  CASE priority
    WHEN 'urgent' THEN 1
    WHEN 'high'   THEN 2
    WHEN 'normal' THEN 3
    WHEN 'low'    THEN 4
  END,
  created_at ASC;

-- ═══════════════════════════════════════════════════════════════════════
-- 5. Helper view — 30-day category distribution (Support pattern engine)
-- ═══════════════════════════════════════════════════════════════════════

CREATE OR REPLACE VIEW public.agent_handoffs_30d_categories AS
SELECT
  category,
  target_agent,
  COUNT(*) AS item_count,
  ROUND(
    COUNT(*)::NUMERIC /
    NULLIF(SUM(COUNT(*)) OVER (PARTITION BY target_agent), 0) * 100,
    1
  ) AS pct_of_target_total
FROM public.agent_handoffs
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY category, target_agent
ORDER BY target_agent, item_count DESC;

-- ═══════════════════════════════════════════════════════════════════════
-- 6. Verify
-- ═══════════════════════════════════════════════════════════════════════

SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name = 'agent_handoffs';
