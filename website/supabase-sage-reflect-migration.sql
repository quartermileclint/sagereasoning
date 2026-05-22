-- ============================================================
-- SageReasoning — Sage Reflect (post-action reflection): Stage A tables
-- Run in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================
-- Creates the two Sage-Reflect-owned tables (A-2 + A-4) of
-- /adopted/sage-reflect-product-design.md (LOCKED 2026-05-22):
--   1. sage_reflect_sessions          — one row per reflection session_id; the
--                                        five additive logs + encrypted verbatim
--                                        responses + the outcome scalars (SR-12).
--   2. sage_reflect_proximity_domains  — SR-15 per-virtue-domain katorthoma
--                                        proximity, keyed by agent_id (aggregate).
--
-- ADDITIVE + IDEMPOTENT. Safe to re-run. Reversible via the DROPs at the foot of
-- this file (commented; run only to roll back). Modifies NO existing table.
--
-- Stage A is INERT groundwork: no endpoint reads/writes these until the Stage-B
-- POST /api/practice/reflect (Critical) is wired.
--
-- KG1 (Vercel five rules): the Stage-B writer/reader MUST await every read/write;
--   no fire-and-forget. (No code touches it this stage.)
-- KG7 (JSONB storage format): the five log columns + scrutiny_flags are JSONB
--   ARRAYS — the store passes JS arrays DIRECTLY (no JSON.stringify), so
--   jsonb_typeof(...) returns 'array'. response_history_meta + sage_calling_trigger
--   are JSONB OBJECTS — passed as plain objects (jsonb_typeof = 'object').
--
-- ============================================================
-- SR-12 RETENTION / DELETION / MINIMISATION / ENCRYPTION (R17 PRIMARY; b/h/i)
-- ------------------------------------------------------------
--   • RETENTION WINDOW: 90 days (inherits the Sage Calling discovery_sessions
--     default + the substrate history_window default). FOUNDER-CONFIRMABLE
--     (privacy-policy-adjacent; lawyer-engagement track). The enforcing sweep
--     (sweepExpiredSessions) + on-demand deletion are in session-store.ts; the
--     created_at index below supports both. Changing the value is a one-line edit.
--   • GENUINE DELETION (R17h): hard DELETE of the row by session_id or agent_id.
--   • MINIMISATION (R17i): only the logs, the encrypted verbatim responses, the
--     outcome scalars, and timestamps are stored. No extraneous operational context.
--   • APP-LEVEL ENCRYPTION (R17b): the agent's verbatim free-text responses (the
--     most intimate introspective content) are stored ENCRYPTED — ciphertext in
--     response_history_ciphertext (TEXT) + AES-256-GCM meta in response_history_meta
--     (JSONB) — via the established encryption-helpers (MENTOR_ENCRYPTION_KEY). The
--     categorical log arrays carry the queryable signal in plaintext JSONB.
--     PRE-CONDITION for Stage B: MENTOR_ENCRYPTION_KEY must be set in Vercel (and
--     locally) before any real session persists — encryptForStorage throws without it.
-- ============================================================

-- ------------------------------------------------------------
-- 1. sage_reflect_sessions
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.sage_reflect_sessions (
  id                          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  -- One logical reflection run = one session_id (UNIQUE → single upserted row).
  session_id                  text        NOT NULL UNIQUE,
  -- Bound to the agent behind the A10 credential used at session-open (SR-14).
  agent_id                    text        NOT NULL,
  -- Current step in the deterministic sequence.
  current_step                text        NOT NULL DEFAULT 'Q1',
  -- R17b — encrypted verbatim responses (the intimate free text). NULL until first
  -- persist. ciphertext base64 (TEXT) + AES-256-GCM meta (JSONB plain object).
  response_history_ciphertext text,
  response_history_meta       jsonb,
  -- The five Sage-Reflect-owned additive logs (KG7 JSONB arrays; default empty).
  phantasia_distortion_log    jsonb       NOT NULL DEFAULT '[]'::jsonb,
  synkatathesis_failure_log   jsonb       NOT NULL DEFAULT '[]'::jsonb,
  horme_pattern_log           jsonb       NOT NULL DEFAULT '[]'::jsonb,
  kathekon_quality_log        jsonb       NOT NULL DEFAULT '[]'::jsonb,
  circle_need_log             jsonb       NOT NULL DEFAULT '[]'::jsonb,
  -- Outcome scalars (NULL until completion for exit_path / rs_class).
  exit_path                   text,
  rs_class                    text,
  profile_update_confidence   text        NOT NULL DEFAULT 'normal',
  fabrication_risk_level      text        NOT NULL DEFAULT 'low',
  progress_dimensions_held    boolean     NOT NULL DEFAULT false,
  -- Scrutiny flags (KG7 JSONB array) + developer note + Sage Calling trigger.
  scrutiny_flags              jsonb       NOT NULL DEFAULT '[]'::jsonb,
  developer_note              text,
  sage_calling_trigger        jsonb,
  started_at                  timestamptz NOT NULL DEFAULT now(),
  completed_at                timestamptz,
  created_at                  timestamptz NOT NULL DEFAULT now()
);

-- House-style enum guards (idempotent). The application only writes these values.
DO $$ BEGIN
  ALTER TABLE public.sage_reflect_sessions
    ADD CONSTRAINT sage_reflect_sessions_current_step_check
    CHECK (current_step IN ('Q1','Q2','Q3','Q4','Q5','Q6','FD-R1','RS-4','complete'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.sage_reflect_sessions
    ADD CONSTRAINT sage_reflect_sessions_exit_path_check
    CHECK (exit_path IN ('sage_reasoning','sage_calling'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.sage_reflect_sessions
    ADD CONSTRAINT sage_reflect_sessions_rs_class_check
    CHECK (rs_class IN ('RS-1','RS-2','RS-3','RS-4→RS-2'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.sage_reflect_sessions
    ADD CONSTRAINT sage_reflect_sessions_confidence_check
    CHECK (profile_update_confidence IN ('normal','low'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.sage_reflect_sessions
    ADD CONSTRAINT sage_reflect_sessions_fabrication_risk_check
    CHECK (fabrication_risk_level IN ('low','moderate','high'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Indexes. session_id already unique-indexed. agent_id: per-agent + R17h delete-all.
-- created_at: the SR-12 retention sweep.
CREATE INDEX IF NOT EXISTS sage_reflect_sessions_agent_id_idx
  ON public.sage_reflect_sessions (agent_id);
CREATE INDEX IF NOT EXISTS sage_reflect_sessions_created_at_idx
  ON public.sage_reflect_sessions (created_at);

-- RLS: server-side only via the service role (mirrors discovery_sessions). RLS
-- enabled with no policy locks the table to the service role (anon/authenticated
-- have no access; the service-role key bypasses RLS).
ALTER TABLE public.sage_reflect_sessions ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- 2. sage_reflect_proximity_domains  (SR-15)
-- ------------------------------------------------------------
-- Per-virtue-domain katorthoma proximity, keyed by agent_id. Sage Reflect computes
-- this itself (the ATL stores only an aggregate typical_proximity). The four
-- cardinal domains + the KP-04 aggregate (lowest non-null domain). NULL = no
-- evidence yet for that domain.
CREATE TABLE IF NOT EXISTS public.sage_reflect_proximity_domains (
  agent_id    text        PRIMARY KEY,
  phronesis   text,
  dikaiosyne  text,
  andreia     text,
  sophrosyne  text,
  aggregate   text,
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- Proximity-level guards (idempotent). NULL passes (no evidence yet).
DO $$ BEGIN
  ALTER TABLE public.sage_reflect_proximity_domains
    ADD CONSTRAINT sage_reflect_proximity_levels_check
    CHECK (
      (phronesis  IS NULL OR phronesis  IN ('reflexive','habitual','deliberate','principled','sage_like')) AND
      (dikaiosyne IS NULL OR dikaiosyne IN ('reflexive','habitual','deliberate','principled','sage_like')) AND
      (andreia    IS NULL OR andreia    IN ('reflexive','habitual','deliberate','principled','sage_like')) AND
      (sophrosyne IS NULL OR sophrosyne IN ('reflexive','habitual','deliberate','principled','sage_like')) AND
      (aggregate  IS NULL OR aggregate  IN ('reflexive','habitual','deliberate','principled','sage_like'))
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE public.sage_reflect_proximity_domains ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- VERIFY — paste the output back to confirm.
-- ============================================================

-- 1. Both tables exist.
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('sage_reflect_sessions','sage_reflect_proximity_domains')
ORDER BY table_name;

-- 2. sage_reflect_sessions columns (expect 22 columns).
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'sage_reflect_sessions'
ORDER BY ordinal_position;

-- 3. sage_reflect_proximity_domains columns (expect 7 columns).
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'sage_reflect_proximity_domains'
ORDER BY ordinal_position;

-- 4. Indexes on sage_reflect_sessions (expect: pkey, session_id unique,
--    agent_id_idx, created_at_idx).
SELECT indexname FROM pg_indexes
WHERE schemaname = 'public' AND tablename = 'sage_reflect_sessions'
ORDER BY indexname;

-- 5. CHECK constraints on sage_reflect_sessions (expect the five named checks).
SELECT conname FROM pg_constraint
WHERE conrelid = 'public.sage_reflect_sessions'::regclass AND contype = 'c'
ORDER BY conname;

-- 6. RLS enabled on both (expect relrowsecurity = true for each).
SELECT relname, relrowsecurity FROM pg_class
WHERE relname IN ('sage_reflect_sessions','sage_reflect_proximity_domains')
ORDER BY relname;

-- ============================================================
-- REFERENCE ONLY — DO NOT RUN as part of this migration.
-- SR-12 retention + R17h genuine-deletion paths (wired in session-store.ts).
-- ============================================================
--   Retention sweep:  DELETE FROM public.sage_reflect_sessions
--                       WHERE created_at < now() - interval '90 days';
--   One session:      DELETE FROM public.sage_reflect_sessions WHERE session_id = $1;
--   All of an agent:  DELETE FROM public.sage_reflect_sessions WHERE agent_id = $1;
--
-- ============================================================
-- ROLLBACK — DO NOT RUN unless rolling Stage A back.
-- ============================================================
--   DROP TABLE IF EXISTS public.sage_reflect_sessions;
--   DROP TABLE IF EXISTS public.sage_reflect_proximity_domains;
