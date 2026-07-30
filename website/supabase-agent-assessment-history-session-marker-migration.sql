-- ============================================================
-- SageReasoning — agent_assessment_history session_marker column (B5 build)
-- Run in: Supabase Dashboard → SQL Editor → New Query.  TEST first, then prod.
-- AUTHORED 2026-07-29. NOT YET APPLIED — the founder-walked activation arm
-- (its own step) lands this migration BEFORE
-- SUBSTRATE_SESSION_DECLINE_SIGNAL_ENABLED is set, mirroring the layer1_source
-- precedent (flag-before-migration would fail the windowed read honest —
-- signal omitted, never a 500 — but the walk forbids that order).
-- ============================================================
-- Adds the DECLARED session-boundary marker per trajectory row — the evidence
-- B5's "sustained decline across sessions" claim rests on (the mentor's
-- 2026-07-29 binding verdict, "B5 — Session Boundary and the Adequacy of
-- Inferred Evidence"): an INFERRED (timing-based) session boundary is never
-- adequate evidence for this claim; only a POSITIVELY DECLARED one is.
--
--   'session_open'  — this consult begins a new occasion of practice.
--   'session_close' — this consult ends the current occasion (confirmatory,
--                     not required — an abrupt harness termination may never
--                     send one; a later 'session_open' also closes the prior
--                     bucket).
--   'mid_session'   — this consult is within a continuous occasion.
--   NULL            — undeclared (every row written before this column/flag,
--                      and every caller that does not opt in). B5 stays
--                      silent for these rows — never a guess.
--
-- STAMPED by /api/reason's M6 trajectory write ONLY when
--   SUBSTRATE_SESSION_DECLINE_SIGNAL_ENABLED=true AND the caller supplied a
--   valid session_marker on the request (the insert omits the column key
--   entirely otherwise — the PGRST204 build-dark-migrate-later class is
--   structurally avoided, mirroring layer1_source).
--
-- ADDITIVE + IDEMPOTENT + REVERSIBLE. Nullable; modifies no existing data;
--   defaults every existing row to NULL. No RLS / auth / perimeter / policy
--   change. Safe to re-run. Flag-absence is byte-identical to pre-migration
--   behaviour.
-- ============================================================

ALTER TABLE public.agent_assessment_history
  ADD COLUMN IF NOT EXISTS session_marker text;

-- DB-level backstop CHECK (idempotent — added only if absent). Allows NULL
-- (undeclared) + the three valid markers; rejects anything else even if the
-- application validation were bypassed.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'agent_assessment_history_session_marker_check'
  ) THEN
    ALTER TABLE public.agent_assessment_history
      ADD CONSTRAINT agent_assessment_history_session_marker_check
      CHECK (session_marker IS NULL OR session_marker IN ('session_open', 'session_close', 'mid_session'));
  END IF;
END $$;

-- ============================================================
-- VERIFY — expect 1 column row (session_marker | text | YES) and 1 constraint row.
-- ============================================================
SELECT column_name, data_type, is_nullable
  FROM information_schema.columns
 WHERE table_schema = 'public'
   AND table_name = 'agent_assessment_history'
   AND column_name = 'session_marker';

SELECT conname
  FROM pg_constraint
 WHERE conname = 'agent_assessment_history_session_marker_check';

-- Existing rows must all read NULL (undeclared) after apply:
SELECT count(*) AS total_rows,
       count(session_marker) AS marked_rows   -- expect 0 at apply time
  FROM public.agent_assessment_history;

-- ============================================================
-- ROLLBACK (only if this migration itself must be reversed; the column is
-- inert while SUBSTRATE_SESSION_DECLINE_SIGNAL_ENABLED is unset):
--   ALTER TABLE public.agent_assessment_history
--     DROP CONSTRAINT IF EXISTS agent_assessment_history_session_marker_check;
--   ALTER TABLE public.agent_assessment_history
--     DROP COLUMN IF EXISTS session_marker;
-- NOTE: unset the flag FIRST — with the flag on, the write stamps and the read
-- selects this column; dropping it flag-on fails writes' column list honest
-- (logged, response unaffected) and the windowed read honest (signal omitted).
-- ============================================================
