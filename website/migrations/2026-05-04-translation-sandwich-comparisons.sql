-- =============================================================================
-- 2026-05-04-translation-sandwich-comparisons.sql
-- M1-CP4 — Translation-sandwich parallel-run comparison log
-- =============================================================================
--
-- WHAT THIS DOES
--   Creates the table that records both engines' outputs side-by-side during
--   the M1 parallel-run period. Each row = one /api/reason request that ran
--   the parallel translation-sandwich path. The user-facing response is the
--   bundled-depth output (preserved unchanged); this table holds the data
--   the founder reads at M1-CP5 to make the cutover decision.
--
-- HOW TO RUN (Clinton):
--   1. Open Supabase Dashboard for the sagereasoning project.
--   2. Click SQL Editor (left sidebar).
--   3. Click + New query.
--   4. Copy this entire file's contents and paste into the editor.
--   5. Click RUN (or press Cmd/Ctrl + Enter).
--   6. Expected result: "Success. No rows returned" (with index + comment).
--   7. Verify with this query (paste into a new SQL Editor query):
--        SELECT count(*) FROM translation_sandwich_comparisons;
--      Expected: 0.
--
-- IDEMPOTENCY
--   Safe to run more than once. Uses CREATE TABLE IF NOT EXISTS and
--   CREATE INDEX IF NOT EXISTS. No data is touched.
--
-- ROLLBACK
--   To remove this table entirely (and lose any data collected):
--     DROP TABLE translation_sandwich_comparisons;
--   Clinton runs the DROP — the AI does not run table drops on production.
--
-- REFERENCES
--   ADR-004 §6.1 (parallel-run shape) + §6.4 (comparison rubric)
--   Project instructions §0c-ii (Critical Change Protocol)
--   Knowledge gap KG7 (JSONB storage format)
-- =============================================================================

CREATE TABLE IF NOT EXISTS translation_sandwich_comparisons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),

  -- Request identity
  request_id uuid NOT NULL,
  -- SHA-256 of the input text. We do NOT store input text itself (PII discipline
  -- per R17b). Hash lets us de-duplicate without retaining the content.
  input_text_hash text NOT NULL,

  -- Engine outputs (JSONB — per KG7, pass JS objects directly to Supabase client;
  -- do not JSON.stringify before insert).
  bundled_depth_output jsonb NOT NULL,
  translation_sandwich_output jsonb,
  -- Failure category + message when the parallel path did not complete.
  -- Categories: 'layer1_throw', 'layer3_throw', 'validation_throw',
  --             'cost_cap_reached', 'deadline_exceeded'.
  translation_sandwich_error text,

  -- Per-layer latencies (milliseconds). NULL when that layer did not run.
  layer1_latency_ms integer,
  layer2_latency_ms integer,
  layer3_latency_ms integer,
  bundled_depth_latency_ms integer,

  -- Per-layer cost in USD microcents (1 microcent = $0.000001 = 1/1,000,000 USD).
  -- bigint to avoid float rounding errors in aggregation queries.
  -- NULL when that layer did not run or cost not captured.
  layer1_cost_usd_microcents bigint,
  layer3_cost_usd_microcents bigint,
  bundled_depth_cost_usd_microcents bigint
);

CREATE INDEX IF NOT EXISTS idx_translation_sandwich_comparisons_created_at
  ON translation_sandwich_comparisons (created_at DESC);

COMMENT ON TABLE translation_sandwich_comparisons IS
  'M1-CP4 translation-sandwich parallel-run comparison log. One row per /api/reason request that ran the parallel path. ADR-004 §6.1. Retention: 90 days post-cutover, then archived.';

COMMENT ON COLUMN translation_sandwich_comparisons.input_text_hash IS
  'SHA-256 of the input text. Input text itself is NOT stored (PII discipline per R17b).';

COMMENT ON COLUMN translation_sandwich_comparisons.translation_sandwich_error IS
  'Failure category. NULL when the parallel path completed successfully. One of: layer1_throw, layer3_throw, validation_throw, cost_cap_reached, deadline_exceeded.';
