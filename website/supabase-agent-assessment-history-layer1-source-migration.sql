-- ============================================================
-- SageReasoning — agent_assessment_history layer1_source column (AE-1, election E-AE1-1)
-- Run in: Supabase Dashboard → SQL Editor → New Query.  TEST first, then prod.
-- AUTHORED 2026-07-18 (AE-1 build session). APPLIED ONLY in the founder-walked
-- activation arm — ORDER: this migration lands BEFORE
-- SUBSTRATE_TRAJECTORY_DELTA_ENABLED is set (the flag gates the write stamp AND
-- the read select of this column; flag-before-migration would fail the windowed
-- read honest — overlay omitted, never a 500 — but the walk forbids that order).
-- ============================================================
-- Adds the AE-1 Layer-1 PROVENANCE marker per trajectory row (ADR-014 §3.1 —
-- provenance-mix disclosure):
--   'supplied' — the consult's Layer-1 extraction was CALLER-PROVIDED (the
--                plugin path's required layer1_schema, or the key-path
--                l1_supply field): the row's evaluated features are the
--                caller's own reading of its action.
--   'server'   — server-side Layer-1 extraction produced the features.
--   NULL       — unmarked (every row written before this column + the flag;
--                the delta layer reports these as n_unknown).
--
-- WHY IT MATTERS (R18 honesty; ADR-014 §3.1): an l1_supply-capable caller can
--   author its own fine-grained trend invisibly — a per-mechanism improvement
--   gradient is exactly the shape of a training reward. The delta block
--   discloses n_supplied / n_server / n_unknown per window; this column is the
--   only ground those counts can honestly rest on. WEIGHTS BLOCKED restated
--   wherever the delta field is documented.
--
-- STAMPED by /api/reason's M6 trajectory write ONLY when
--   SUBSTRATE_TRAJECTORY_DELTA_ENABLED=true (the insert omits the column key
--   entirely when the flag is off — the PGRST204 build-dark-migrate-later
--   class is structurally avoided). Value derivation: 'supplied' iff a
--   validated caller schema was accepted for THIS consult (both supplied
--   paths), else 'server'.
--
-- ADDITIVE + IDEMPOTENT + REVERSIBLE. Nullable; modifies no existing data;
--   defaults every existing row to NULL. No RLS / auth / perimeter / policy
--   change. Safe to re-run. Application code is additive (omits the column
--   unless the flag supplies a value), so flag-absence is byte-identical to
--   pre-migration behaviour.
-- ============================================================

ALTER TABLE public.agent_assessment_history
  ADD COLUMN IF NOT EXISTS layer1_source text;

-- DB-level backstop CHECK (idempotent — added only if absent). Allows NULL
-- (unmarked) + the two valid provenances; rejects anything else even if the
-- application validation were bypassed.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'agent_assessment_history_layer1_source_check'
  ) THEN
    ALTER TABLE public.agent_assessment_history
      ADD CONSTRAINT agent_assessment_history_layer1_source_check
      CHECK (layer1_source IS NULL OR layer1_source IN ('supplied', 'server'));
  END IF;
END $$;

-- ============================================================
-- VERIFY — expect 1 column row (layer1_source | text | YES) and 1 constraint row.
-- ============================================================
SELECT column_name, data_type, is_nullable
  FROM information_schema.columns
 WHERE table_schema = 'public'
   AND table_name = 'agent_assessment_history'
   AND column_name = 'layer1_source';

SELECT conname
  FROM pg_constraint
 WHERE conname = 'agent_assessment_history_layer1_source_check';

-- Existing rows must all read NULL (unmarked) after apply:
SELECT count(*) AS total_rows,
       count(layer1_source) AS marked_rows   -- expect 0 at apply time
  FROM public.agent_assessment_history;

-- ============================================================
-- ROLLBACK (only if this migration itself must be reversed; the column is
-- inert while SUBSTRATE_TRAJECTORY_DELTA_ENABLED is unset):
--   ALTER TABLE public.agent_assessment_history
--     DROP CONSTRAINT IF EXISTS agent_assessment_history_layer1_source_check;
--   ALTER TABLE public.agent_assessment_history
--     DROP COLUMN IF EXISTS layer1_source;
-- NOTE: unset the flag FIRST — with the flag on, the write stamps and the read
-- selects this column; dropping it flag-on fails writes' column list honest
-- (logged, response unaffected) and the windowed read honest (overlay omitted).
-- ============================================================
