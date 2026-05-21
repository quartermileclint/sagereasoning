-- ============================================================
-- SageReasoning — Sage Calling (purpose-discovery): discovery_sessions table
-- Run in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================
-- Implements D-3 (state model) + D-7 (full session persistence +
-- retention/deletion policy) of /adopted/purpose-discovery-product-design.md
-- (Adopted under D-PURPOSE-DISCOVERY-DESIGN-LOCKED-2026-05-21).
-- Authored at the Sage Calling build Stage 1 session
-- (D-SAGE-CALLING-STAGE1-BUILD-WIRED-VERIFIED-2026-05-21).
--
-- ADDITIVE + IDEMPOTENT. Safe to re-run. Reversible via the DROP at the foot
-- of this file (commented; run only to roll back).
--
-- Stage 1 lands the table as INERT groundwork: no endpoint reads or writes it
-- until Sage Calling's engine + POST /api/calling are wired in build Stage 2
-- (Critical). One row per discovery session.
--
-- KG1 (Vercel five rules): the Stage 2 writer/reader MUST await every read/write
--   against this table; no fire-and-forget. (No code touches it this stage.)
-- KG7 (JSONB storage format): response_history + signals_detected are JSONB.
--   The Stage 2 writer MUST pass arrays/objects directly to the Supabase client
--   (no JSON.stringify) so jsonb_typeof() returns 'array', not 'string'.
--
-- ============================================================
-- D-7 RETENTION / DELETION / MINIMISATION POLICY (R17 PRIMARY; R17h; R17i)
-- ------------------------------------------------------------
-- Full persistence of an agent's introspective purpose-discovery content
-- carries material R17 weight, so the policy is set deliberately here (D-7
-- delegated the exact retention window + deletion shape to Stage 1 schema work).
--
--   • RETENTION WINDOW: 90 days (finalised this session). A session row is
--     eligible for automatic deletion 90 days after created_at. Chosen to match
--     the substrate's existing history_window default (90 days) for consistency;
--     conservative relative to the audit value. FOUNDER TO CONFIRM between
--     sessions — see the session close; this is a privacy-policy-adjacent value
--     and a candidate for the Stage 1 lawyer-engagement track. The window is
--     documented policy only at Stage 1; the enforcing sweep + the on-demand
--     deletion endpoint are wired in Stage 2 (the created_at index below
--     supports both). Changing the value pre-Stage-2 is a one-line edit.
--
--   • GENUINE DELETION (R17h): deletion is a HARD DELETE of the row (content is
--     actually removed, not tombstoned/flagged). The Stage 2 deletion endpoint
--     deletes by session_id (one session) or agent_id (all of an agent's
--     sessions). Reference queries at the foot of this file.
--
--   • MINIMISATION (R17i): the table stores ONLY what the audit trail needs —
--     the variant-selection log (signals_detected), the agent's responses
--     (response_history), the stage, the gate state, the outcome, and
--     timestamps. No extraneous operational context is persisted here.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.discovery_sessions (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Agent-supplied server-side session anchor (D-2). The AC10 provenance key;
  -- one logical discovery run = one session_id. UNIQUE so a session is a
  -- single row the Stage 2 endpoint upserts as it advances through stages.
  session_id        text        NOT NULL UNIQUE,
  -- Bound to the agent behind the A10 credential used at session-open (D-6).
  agent_id          text        NOT NULL,
  -- Current stage in the fixed six-stage sequence. 'Q1'..'Q6'.
  current_stage     text        NOT NULL DEFAULT 'Q1',
  -- D-7 full persistence: ordered per-stage records of the variant surfaced and
  -- the agent's response. JSONB array. KG7 — written as a JSON array, never a
  -- JSON-encoded string. Default empty array.
  response_history  jsonb       NOT NULL DEFAULT '[]'::jsonb,
  -- D-4 auditability: ordered epistemic-state reads that drove each variant
  -- selection (every selection traces to a named rule). JSONB array. KG7 as
  -- above. Default empty array.
  signals_detected  jsonb       NOT NULL DEFAULT '[]'::jsonb,
  -- D-14 Hard Gate state. The handoff MUST NOT fire on the agent's say-so;
  -- the gate pauses at end-of-Q5 and requires explicit external developer
  -- approval. 'pending' (pre-gate) | 'awaiting_approval' (at the gate) |
  -- 'approved' (developer approved; handoff may fire) | 'blocked' (global
  -- flag off, or developer/operator blocked).
  gate_status       text        NOT NULL DEFAULT 'pending',
  -- Terminal outcome. NULL while in progress. 'found' (a purpose was found;
  -- five-spec handoff produced, subject to the Hard Gate) | 'null_result' (a
  -- clean Q6 null; the developer-facing clarification is emitted). Stored as
  -- 'null_result' (not the literal 'null') to avoid SQL/JSON NULL confusion.
  outcome           text,
  started_at        timestamptz NOT NULL DEFAULT now(),
  completed_at      timestamptz,
  created_at        timestamptz NOT NULL DEFAULT now()
);

-- House-style enum guards (additive hardening; idempotent). The application
-- only ever writes the values enumerated below.
DO $$ BEGIN
  ALTER TABLE public.discovery_sessions
    ADD CONSTRAINT discovery_sessions_current_stage_check
    CHECK (current_stage IN ('Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.discovery_sessions
    ADD CONSTRAINT discovery_sessions_gate_status_check
    CHECK (gate_status IN ('pending', 'awaiting_approval', 'approved', 'blocked'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- outcome is nullable (NULL = in progress). A CHECK with IN passes on NULL, so
-- this constrains the non-null values without forcing one.
DO $$ BEGIN
  ALTER TABLE public.discovery_sessions
    ADD CONSTRAINT discovery_sessions_outcome_check
    CHECK (outcome IN ('found', 'null_result'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Indexes. session_id already has a unique index from the UNIQUE constraint.
-- agent_id: per-agent queries + the R17h delete-all-of-an-agent's-sessions path.
-- created_at: the D-7 retention sweep (delete rows older than the window).
CREATE INDEX IF NOT EXISTS discovery_sessions_agent_id_idx
  ON public.discovery_sessions (agent_id);
CREATE INDEX IF NOT EXISTS discovery_sessions_created_at_idx
  ON public.discovery_sessions (created_at);

-- RLS: server-side only via the service role, mirroring api_keys /
-- credential_audit (all access through supabaseAdmin). No user-facing policies —
-- RLS enabled with no policy locks the table to the service role. D-3 keeps the
-- discovery state cleanly separated from the credential/accreditation surface.
ALTER TABLE public.discovery_sessions ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- VERIFY — paste the output back to confirm.
-- ============================================================

-- 1. Table exists.
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_name = 'discovery_sessions';

-- 2. Columns + types (expect the 11 columns above).
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'discovery_sessions'
ORDER BY ordinal_position;

-- 3. Indexes (expect: pkey, session_id unique, agent_id_idx, created_at_idx).
SELECT indexname FROM pg_indexes
WHERE schemaname = 'public' AND tablename = 'discovery_sessions'
ORDER BY indexname;

-- 4. CHECK constraints (expect the three named checks).
SELECT conname FROM pg_constraint
WHERE conrelid = 'public.discovery_sessions'::regclass
  AND contype = 'c'
ORDER BY conname;

-- 5. RLS enabled (expect relrowsecurity = true).
SELECT relname, relrowsecurity FROM pg_class
WHERE relname = 'discovery_sessions';

-- ============================================================
-- REFERENCE ONLY — DO NOT RUN as part of this migration.
-- D-7 retention + R17h genuine-deletion paths, wired in Stage 2.
-- ============================================================
--
-- Retention sweep (delete rows past the 90-day window):
--   DELETE FROM public.discovery_sessions
--   WHERE created_at < now() - interval '90 days';
--
-- R17h genuine deletion — one session (hard delete, not tombstone):
--   DELETE FROM public.discovery_sessions WHERE session_id = $1;
--
-- R17h genuine deletion — all of an agent's sessions:
--   DELETE FROM public.discovery_sessions WHERE agent_id = $1;
--
-- ============================================================
-- ROLLBACK — DO NOT RUN unless rolling Stage 1 back.
-- ============================================================
--   DROP TABLE IF EXISTS public.discovery_sessions;
