-- =============================================================================
-- 2026-05-04-translation-sandwich-cost-tracker.sql
-- M1-CP4 — Translation-sandwich parallel-run cost cap tracker
-- =============================================================================
--
-- WHAT THIS DOES
--   Creates a single-row counter table that the /api/reason route reads at
--   request start to decide whether to run the parallel sandwich, and writes
--   to at request end to accumulate cost + request count. Once any cap
--   condition triggers (any of: cumulative cost > $50, request count > 1000,
--   period > 14 days), cap_reached flips to true and the parallel path is
--   short-circuited for the rest of the period.
--
-- HOW TO RUN (Clinton):
--   1. Open Supabase Dashboard for the sagereasoning project.
--   2. Click SQL Editor (left sidebar).
--   3. Click + New query.
--   4. Copy this entire file's contents and paste into the editor.
--   5. Click RUN (or press Cmd/Ctrl + Enter).
--   6. Expected result: "Success. No rows returned" then "INSERT 0 1" or
--      "INSERT 0 0" if already present.
--   7. Verify with this query:
--        SELECT id, period_start, cumulative_cost_usd_microcents,
--               request_count, cap_reached
--        FROM translation_sandwich_cost_tracker;
--      Expected: one row with id=1, period_start=today, cumulative_cost=0,
--      request_count=0, cap_reached=false.
--
-- IDEMPOTENCY
--   Safe to run more than once. Uses CREATE TABLE IF NOT EXISTS and
--   ON CONFLICT DO NOTHING for the seed insert. Re-running does not reset
--   counters or change period_start.
--
-- TO RESET THE TRACKER (e.g., to start a new parallel-run period after the
-- cap is reached, with founder's explicit re-approval):
--   UPDATE translation_sandwich_cost_tracker
--   SET period_start = CURRENT_DATE,
--       cumulative_cost_usd_microcents = 0,
--       request_count = 0,
--       cap_reached = false,
--       cap_reached_at = NULL
--   WHERE id = 1;
--
-- ROLLBACK
--   To remove this table entirely:
--     DROP TABLE translation_sandwich_cost_tracker;
--   Clinton runs the DROP — the AI does not run table drops on production.
--
-- REFERENCES
--   ADR-004 §6.2 (cost discipline)
--   Project instructions §0c-ii (Critical Change Protocol)
-- =============================================================================

CREATE TABLE IF NOT EXISTS translation_sandwich_cost_tracker (
  id integer PRIMARY KEY DEFAULT 1,
  period_start date NOT NULL DEFAULT CURRENT_DATE,
  cumulative_cost_usd_microcents bigint NOT NULL DEFAULT 0,
  request_count integer NOT NULL DEFAULT 0,
  cap_reached boolean NOT NULL DEFAULT false,
  cap_reached_at timestamptz,
  CONSTRAINT singleton CHECK (id = 1)
);

-- Seed the singleton row. Idempotent.
INSERT INTO translation_sandwich_cost_tracker (id) VALUES (1)
ON CONFLICT (id) DO NOTHING;

COMMENT ON TABLE translation_sandwich_cost_tracker IS
  'M1-CP4 translation-sandwich parallel-run cost tracker. Single-row counter (id=1). ADR-004 §6.2. Caps: $50 (50,000,000 microcents) OR 1000 requests OR 14 days, whichever first.';

COMMENT ON COLUMN translation_sandwich_cost_tracker.cumulative_cost_usd_microcents IS
  'USD microcents (1 microcent = $0.000001). $50 cap = 50,000,000 microcents.';

COMMENT ON COLUMN translation_sandwich_cost_tracker.cap_reached IS
  'true = parallel path is short-circuited. To resume: UPDATE row to reset all counters + cap_reached=false.';
