-- ============================================================
-- SageReasoning — sage_reflect_sessions context_source column (Gate-1 Slice 5c)
-- Run in: Supabase Dashboard → SQL Editor → New Query.  TEST first, then prod.
-- ============================================================
-- Adds the Slice-5c PROVENANCE marker for the session_summary supplied at open:
--   'agent_stated'     — the agent stated its session context (the human / SDK contract).
--   'harness_inferred' — a harness (the Gate-1 full-loop close hook) INFERRED the context
--                        because it observed the session at close and does not have the agent's
--                        stated summary. The close hook fires the reflection turn in-conversation
--                        and persists the agent's VERBATIM reflection out-of-band; it marks the
--                        open 'harness_inferred' rather than fabricate an agent-stated summary
--                        (ADR-011 channel-law amendment, honesty fix #2).
--   NULL               — unmarked (the pre-field / unsupplied default; every existing row).
--
-- WHY IT MATTERS (R18 honesty): without this field a harness-opened reflect record reads as if its
--   session_summary were agent-stated. The field lets the record be honest about provenance, which
--   is the precondition for the Gate-1 close hook to open/persist a reflection without fabricating
--   the agent's stated context.
--
-- VALIDATED by the route's request-helpers (CONTEXT_SOURCES) at the application boundary; the CHECK
--   below is the DB-level backstop. Set ONLY at session create (the open call); answer calls do not
--   change it.
--
-- ADDITIVE + IDEMPOTENT + REVERSIBLE. Nullable; modifies no existing data; defaults every existing
--   row to NULL. No RLS / auth / perimeter / policy change. Safe to re-run. The application code is
--   additive (omits the column unless a provenance is supplied), so flag-/caller-absence is
--   byte-identical to pre-migration behaviour.
-- ============================================================

ALTER TABLE public.sage_reflect_sessions
  ADD COLUMN IF NOT EXISTS context_source text;

-- DB-level backstop CHECK (idempotent — added only if absent). Allows NULL (unmarked) + the two
-- valid provenances; rejects anything else even if the application validation were bypassed.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'sage_reflect_sessions_context_source_check'
  ) THEN
    ALTER TABLE public.sage_reflect_sessions
      ADD CONSTRAINT sage_reflect_sessions_context_source_check
      CHECK (context_source IS NULL OR context_source IN ('agent_stated', 'harness_inferred'));
  END IF;
END $$;

-- ============================================================
-- VERIFY — expect 1 column row (context_source | text | YES) and 1 constraint row.
-- ============================================================
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'sage_reflect_sessions'
  AND column_name = 'context_source';

SELECT conname
FROM pg_constraint
WHERE conname = 'sage_reflect_sessions_context_source_check';

-- ============================================================
-- ROLLBACK — DO NOT RUN unless reverting this field.
-- ============================================================
--   ALTER TABLE public.sage_reflect_sessions
--     DROP CONSTRAINT IF EXISTS sage_reflect_sessions_context_source_check;
--   ALTER TABLE public.sage_reflect_sessions
--     DROP COLUMN IF EXISTS context_source;
