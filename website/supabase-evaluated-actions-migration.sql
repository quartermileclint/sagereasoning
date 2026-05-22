-- ============================================================
-- SageReasoning — evaluated_actions table (Sage Reflect Stage A, A-3)
-- Run in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================
-- Creates public.evaluated_actions — the durable rolling-evaluation-window store
-- that the existing Sage Assent (ATL) aggregator computeWindowSnapshot() consumes.
--
-- WHY THIS EXISTS (the 2026-05-22 lock finding):
--   The EvaluatedAction TYPE is live (website/src/lib/substrate/trust-layer/types/
--   evaluation.ts) and computeWindowSnapshot() consumes an EvaluatedAction[]
--   array. But the evaluated_actions TABLE was never migrated — it existed only in
--   the DRAFT trust-layer/schema/trust-layer-schema-REVIEW.sql (marked DO NOT RUN),
--   and the live ATL Wrapper ran the window IN-MEMORY from its CarriedProfile.
--   Sage Reflect's Q4 records must persist + accumulate across sessions so the
--   rolling window is durable rather than per-process — so Stage A creates this
--   table. The aggregator consumes the persisted rows UNCHANGED (it is a pure
--   function over an EvaluatedAction[]; it does not care whether the array came
--   from memory or from these rows). DDL extracted verbatim-in-spirit from the
--   review schema §2; the FK + RLS posture are preserved.
--
-- ADDITIVE + IDEMPOTENT. Safe to re-run. Reversible via the DROP at the foot of
-- this file (commented; run only to roll back). Modifies NO existing table.
--
-- PRE-CONDITION: public.agent_accreditation must exist (it is live — the A10 +
--   badge-persistence migrations created it). The agent_id FK below references it.
--   A Sage Reflect Q4 record can only be inserted once the agent has an
--   agent_accreditation row; the Sage Assent feed (sage-assent-feed.ts) ensures
--   that row exists (seeding a conservative starting credential if absent) BEFORE
--   inserting evaluated_actions rows.
--
-- KG1 (Vercel five rules): the Stage-A feed awaits every read/write here; no
--   fire-and-forget. (No public endpoint touches it until Stage B.)
-- KG7 (JSONB storage format): passions_detected is JSONB — the feed passes the
--   array DIRECTLY (no JSON.stringify) so jsonb_typeof(passions_detected)='array'.
--   virtue_domains_engaged is a Postgres text[] — the feed passes a JS array.
--
-- R4 (IP boundary): evaluated_actions is INTERNAL window data — it gets NO public
--   read policy (only the aggregated agent_accreditation is public-readable). RLS
--   service-role-only, consistent with how the live discovery_sessions table is
--   locked, and with agent_accreditation's "Service role manages …" write policy.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.evaluated_actions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Links to the accreditation record (FK; cascade delete = R17h genuine deletion
  -- of an agent removes its window rows too).
  agent_id TEXT NOT NULL REFERENCES public.agent_accreditation(agent_id) ON DELETE CASCADE,

  -- Links to a reasoning receipt (Sage Reflect: reflect_<session_id>_q4_<idx>).
  receipt_id TEXT NOT NULL,

  -- Evaluation results.
  proximity TEXT NOT NULL CHECK (proximity IN (
    'reflexive', 'habitual', 'deliberate', 'principled', 'sage_like'
  )),
  is_kathekon BOOLEAN NOT NULL,
  kathekon_quality TEXT NOT NULL CHECK (kathekon_quality IN (
    'strong', 'moderate', 'marginal', 'contrary'
  )),

  -- Passions detected (JSONB array — KG7).
  passions_detected JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- Virtue domains engaged (Postgres text array).
  virtue_domains_engaged TEXT[] NOT NULL DEFAULT '{}',

  -- Oikeiosis tracking.
  oikeiosis_met BOOLEAN,
  oikeiosis_stage TEXT,

  -- Ruling faculty state.
  ruling_faculty_state TEXT,

  -- Which skill produced this evaluation (Sage Reflect: 'sage_reflect').
  skill_id TEXT NOT NULL,

  -- How many candidate decisions were considered (deliberation_breadth source;
  -- Sage Reflect defaults to 1 = intuited, the conservative baseline).
  candidates_considered INTEGER NOT NULL DEFAULT 1,

  -- Timestamp.
  evaluated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for window queries: last N actions for an agent (the aggregator read).
CREATE INDEX IF NOT EXISTS idx_evaluated_agent_time
  ON public.evaluated_actions(agent_id, evaluated_at DESC);

-- Index for receipt lookup.
CREATE INDEX IF NOT EXISTS idx_evaluated_receipt
  ON public.evaluated_actions(receipt_id);

-- RLS: service-role-only (R4 — internal window data, no public read). Mirrors the
-- review schema's "Service role manages evaluated_actions" policy.
ALTER TABLE public.evaluated_actions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Service role manages evaluated_actions"
    ON public.evaluated_actions
    FOR ALL
    USING (auth.role() = 'service_role');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
-- VERIFY — paste the output back to confirm.
-- ============================================================

-- 1. Table exists.
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_name = 'evaluated_actions';

-- 2. Columns + types (expect the 14 columns above).
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'evaluated_actions'
ORDER BY ordinal_position;

-- 3. Indexes (expect: pkey, idx_evaluated_agent_time, idx_evaluated_receipt).
SELECT indexname FROM pg_indexes
WHERE schemaname = 'public' AND tablename = 'evaluated_actions'
ORDER BY indexname;

-- 4. Foreign key to agent_accreditation present.
SELECT conname, confrelid::regclass AS references
FROM pg_constraint
WHERE conrelid = 'public.evaluated_actions'::regclass AND contype = 'f';

-- 5. RLS enabled (expect relrowsecurity = true).
SELECT relname, relrowsecurity FROM pg_class WHERE relname = 'evaluated_actions';

-- ============================================================
-- ROLLBACK — DO NOT RUN unless rolling Stage A back.
-- ============================================================
--   DROP TABLE IF EXISTS public.evaluated_actions;
