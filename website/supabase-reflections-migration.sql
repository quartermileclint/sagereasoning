-- reflections — the nightly evening review (the `/reflect` page, POST /api/reflect).
--
-- ─────────────────────────────────────────────────────────────────────────────
-- RECONCILED 2026-08-02. READ THIS BEFORE EDITING.
--
-- This file previously described a table that does not exist. It declared six
-- NOT NULL scoring columns with no defaults —
--     total_score, wisdom_score, justice_score, courage_score,
--     temperance_score, alignment_tier
-- — that NO writer has ever supplied, and it omitted `katorthoma_proximity` and
-- `passions_detected`, which every reader and writer of this table uses.
--
-- Taken at face value it implied that the reflect insert could never succeed.
-- It can: the column set below was verified READ-ONLY against the live TEST and
-- PRODUCTION databases on 2026-08-02 — all seven writer columns present, all six
-- of the columns above absent (error 42703), and 13 rows already stored in
-- production. The file was stale; the code was right.
--
-- The stale version was nearly the cause of a false diagnosis while building
-- `/reflect`, and the project has already paid for this class once: the
-- `action_evaluations_v3` drift silently discarded every human score save for
-- four months (2026-03-21 → 2026-07-26). A migration file that disagrees with
-- its table is not documentation, it is a trap.
--
-- HONEST LIMIT on what was verified. The COLUMN SET is confirmed against both
-- live databases. The types, nullability and defaults below are authored to
-- match what `/api/reflect` and `/api/mentor/private/reflect` actually write and
-- what `/api/reflections` reads — they were NOT read out of the live catalogue
-- (PostgREST does not expose information_schema). This file is therefore
-- accurate for provisioning a FRESH environment; it is not a byte-exact dump of
-- the existing production table.
-- ─────────────────────────────────────────────────────────────────────────────
--
-- Run in the Supabase SQL Editor. Idempotent.

CREATE TABLE IF NOT EXISTS reflections (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,

  -- The practitioner's own words. `what_happened` is required by the route
  -- (min 10 chars after trim); `how_responded` is optional and stored as NULL
  -- when omitted.
  what_happened text NOT NULL,
  how_responded text,

  -- The engine's reading. `katorthoma_proximity` is the same five-level scale
  -- used across the product (and rendered on /reflect as the Five Stages);
  -- `passions_detected` is the JSONB array of {root_passion, sub_species,
  -- false_judgement}.
  katorthoma_proximity text CHECK (
    katorthoma_proximity IN ('reflexive', 'habitual', 'deliberate', 'principled', 'sage_like')
  ),
  passions_detected jsonb DEFAULT '[]'::jsonb,
  sage_perspective text,
  evening_prompt text,

  created_at timestamptz DEFAULT now() NOT NULL
);

-- Indexes. `created_at DESC` is not optional decoration: the dashboard's evening
-- pole reads MAX(created_at) for the practitioner via
-- /api/mentor/practice-status, on every dashboard load.
CREATE INDEX IF NOT EXISTS idx_reflections_user_id ON reflections(user_id);
CREATE INDEX IF NOT EXISTS idx_reflections_created_at ON reflections(created_at DESC);

-- RLS
ALTER TABLE reflections ENABLE ROW LEVEL SECURITY;

-- Users can only read their own reflections.
--
-- Wrapped DO $$ ... EXCEPTION WHEN duplicate_object THEN NULL; END $$ so the
-- file's own "Idempotent." claim (below) is actually true — Postgres has no
-- CREATE POLICY ... IF NOT EXISTS, so a bare CREATE POLICY re-run against a
-- database where both policies already exist (TEST/prod both do) aborts with
-- 42710. Matches the house idiom in every sibling migration, e.g.
-- supabase-sage-compass-migration.sql:112-135.
DO $$ BEGIN
  CREATE POLICY "Users can read own reflections"
    ON reflections FOR SELECT
    USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Inserts arrive from the API route on the service-role client, which bypasses
-- RLS anyway.
--
-- ⚠ OPEN, AND DELIBERATELY NOT CHANGED HERE. This policy has no TO clause, so it
-- applies to PUBLIC — meaning the anon and authenticated roles may also insert a
-- row for ANY user_id. Scoping it `TO service_role` would close that, but doing
-- it in this file would silently rewrite live RLS the moment anyone re-ran what
-- looks like a documentation reconciliation. That is a founder-walked schema
-- decision, not a side effect of a comment fix, so it is FLAGGED and left alone.
--
-- The practical path to the same outcome is already closed at the application
-- layer: as of 2026-08-02 /api/reflect binds the row to `auth.user.id` and
-- ignores any body-supplied user_id (it previously trusted it — a cross-tenant
-- write). Narrowing the policy would close the second, independent path.
DO $$ BEGIN
  CREATE POLICY "Service role insert for reflections"
    ON reflections FOR INSERT
    WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- NOTE: there are deliberately no UPDATE or DELETE policies. An evening review is
-- append-only from the practitioner's side; erasure happens through the R17 data-
-- rights paths (/api/user/delete, /api/user/export, /api/user/access), which run
-- on the service-role client and were wired to this table on 2026-08-02.
