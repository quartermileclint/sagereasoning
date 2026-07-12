-- Migration: supabase-agent-hold-observations-migration
-- Purpose: Trust Layer S11 observation period (the false-hold labelling
--   instrument). One new table stores the durable, classified record of every
--   at-action examination the reference harness captured over the ≥7-day live
--   MEASURE window — the evidence the mentor's readiness standard part (3)
--   requires (a MEASURED false-hold rate over the live distribution), per
--   ADR-013 §7/§11 (the 2026-07-12 mentor S11 verdict; verbatim wins) and the
--   observation-period prompt (2026-07-12).
--
--     * agent_hold_observations — the APPEND-ONLY, IMMUTABLE ledger of captured
--         at-action examinations. One row per captured consult. Each row carries
--         both (a) the RAW kathekon-engagement signals the harness projected from
--         the /api/reason verdict (proximity, engaged virtue domains, obligation
--         statuses, sub-species passions — for replay if the predicate is refined)
--         AND (b) the DERIVED classification computed by the CANONICAL Q3 predicate
--         (website/.../kathekon-engagement.ts assessKathekonEngagement +
--         classifyObservation — the same function the eventual S11 G6(a) flip
--         binds on): is_hold, kathekon_engaged, the four Q3 arms, and the
--         classification (false_positive | correct_hold | not_a_hold).
--
--   A "hold" is a correction loop the eventual ENFORCE regime would bind: an
--   at-action examination with loop_event ∈ {opened, reopened}. A hold whose
--   opening verdict engaged NO kathekon factor is a candidate FALSE POSITIVE (the
--   class the mentor measures); a hold that engaged one is a candidate CORRECT
--   HOLD. This table is the running tally the readiness report reads.
--
--   MEASURE-ONLY. Nothing here binds any decision. The intervention engine stays
--   MEASURE; the S11 enforce flip is a separate, later, founder-walked step gated
--   on this observation period's record (nothing here pre-approves it). The table
--   is populated by a SERVER-SIDE ingest script the founder runs
--   (scripts/false-hold-observation-report.ts) reading the harness's local JSONL
--   buffer — NO route writes to it, NO auth surface changes, and the harness
--   capture is OFF by default (GATE1_FALSE_HOLD_CAPTURE). Production is
--   byte-equivalent until the founder applies this migration + runs the ingest.
--
-- IDENTITY MODEL (K1-aligned; mirrors agent_trust_events):
--   * agent_id      — the K1 declared agent (the dogfood loop, sagereasoning:s9-loop@v1).
--       NOT NULL — an observation is per declared agent. Set by the ingest from its
--       --agent-id argument (the harness JSONL does not carry the credential).
--   * owner_user_id — the OPERATOR (credential owner). FK → profiles(id) ON DELETE
--       CASCADE (the genuine-deletion backstop). NULLABLE — the founder's own
--       single-operator loop; the full delete/erase/export wiring is a DEFERRED
--       RIDER (R17 no-current-users note — no external consumers exist; the table
--       is a temporary observation instrument the founder DROPs after the window).
--   * credential_ref — the per-credential handle, NULLABLE (same rider).
--
-- RETENTION: 90-day retain_until (mirrors the trust-core precedent). The genuine-
--   deletion path for this window is (a) the ingest script's own purge of expired
--   rows on each run, and (b) DROP TABLE at the end of the observation period.
--   Wiring it into the standing trust-core retention sweep + /api/user/delete +
--   /api/credential/erase is a NAMED RIDER (deferred with the owner-scoping,
--   gated on external multi-tenant onboarding — no external users today).
--
-- Related: ADR-013 §7/§11 (design-of-record); the 2026-07-12 verbatim S11 verdict
--   (binding); agent_trust_events (the mirrored precedent — RLS service-role-only,
--   retain_until, append-only immutability, missing-table-benign); R17/R18f;
--   R6c (categorical proximity, not numeric).
-- Decision log: D-TRUST-LAYER-S11-OBSERVATION-INSTRUMENT-... (this session).
--
-- Risk classification: Critical under 0d-ii — NEW schema. Idempotent + additive
--   (CREATE ... IF NOT EXISTS); no existing table is altered; reversible via the
--   rollback block. Applied TEST-first, then production, each its own founder-walked
--   step (PR17/AC7). The AI performs no DB op; the founder walks the migration.
-- Idempotent: safe to re-run (CREATE TABLE / INDEX / POLICY / TRIGGER IF NOT EXISTS
--   or CREATE OR REPLACE for the function).

-- ============================================================================
-- 1. agent_hold_observations — the append-only, immutable observation ledger
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.agent_hold_observations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identity (K1-aligned; see the header).
  agent_id       TEXT NOT NULL,
  owner_user_id  UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  credential_ref TEXT,

  -- Capture context (from the harness false-hold-record.jsonl).
  session_id     TEXT,
  captured_at    TIMESTAMPTZ NOT NULL,      -- the harness capture time (record.capturedAt)
  tool           TEXT,
  depth          TEXT,
  loop_event     TEXT NOT NULL CHECK (loop_event IN ('opened', 'reopened', 'closed', 'none')),
  action_preview TEXT,                       -- truncated descriptor (≤160 chars; the founder's own loop)
  carried_prior  BOOLEAN NOT NULL DEFAULT false,

  -- The captured RAW kathekon-engagement signals (for replay + query; the
  -- predicate reads these). obligation_statuses stores the NON-NULL per-circle
  -- statuses (a circle with no obligation is dropped — the predicate's justice arm
  -- reads only non-null statuses + dikaiosyne engagement, so this is lossless for
  -- classification; 'unevaluated' = dikaiosyne engaged AND obligation_statuses = {}).
  proximity              TEXT,               -- katorthoma_proximity (NULL on an outage capture)
  virtue_domains_engaged TEXT[] NOT NULL DEFAULT '{}',
  obligation_statuses    TEXT[] NOT NULL DEFAULT '{}',
  sub_species_passions   TEXT[] NOT NULL DEFAULT '{}',

  -- The kathekon SYMPTOM (is_kathekon / quality) — NOT a Q3 arm; captured for the
  -- day-7 human cross-check + context only. The predicate deliberately ignores it.
  is_kathekon      BOOLEAN,
  kathekon_quality TEXT,

  -- The DERIVED classification (assessKathekonEngagement + classifyObservation).
  -- Stored so the table is directly queryable. First-write + idempotent (ON CONFLICT
  -- (record_hash) DO NOTHING; UPDATE is trigger-forbidden), so these columns hold the
  -- classification AS OF FIRST INGEST. The report's PRINTED rate always recomputes in
  -- memory from the raw signals (never stale); to refresh the STORED columns after a
  -- predicate refinement, re-run the ingest with --reingest (clears + re-inserts) — the
  -- raw signals above make the re-derivation lossless.
  is_hold                        BOOLEAN NOT NULL,
  kathekon_engaged               BOOLEAN NOT NULL,
  justice_surface_present        BOOLEAN NOT NULL,
  violated_obligation            BOOLEAN NOT NULL,
  proximity_at_or_below_habitual BOOLEAN NOT NULL,
  sub_species_passion            BOOLEAN NOT NULL,
  classification TEXT NOT NULL CHECK (classification IN (
    'false_positive', 'correct_hold', 'not_a_hold'
  )),

  -- Idempotency: a stable content hash of the source JSONL record so re-ingesting
  -- the same capture line does not duplicate. UNIQUE — the ingest inserts
  -- ON CONFLICT DO NOTHING.
  record_hash TEXT NOT NULL,

  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  retain_until TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '90 days'),

  CONSTRAINT uq_aho_record_hash UNIQUE (record_hash)
);

-- Read an agent's observations by capture time (the readiness window + rate).
CREATE INDEX IF NOT EXISTS idx_aho_agent_time
  ON public.agent_hold_observations (agent_id, captured_at DESC);

-- Query holds by classification (the false-hold rate).
CREATE INDEX IF NOT EXISTS idx_aho_agent_classification
  ON public.agent_hold_observations (agent_id, classification);

-- Data-rights (deferred rider) + retention sweep.
CREATE INDEX IF NOT EXISTS idx_aho_owner
  ON public.agent_hold_observations (owner_user_id)
  WHERE owner_user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_aho_credential
  ON public.agent_hold_observations (credential_ref)
  WHERE credential_ref IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_aho_retain_until
  ON public.agent_hold_observations (retain_until);

-- ----------------------------------------------------------------------------
-- 1a. Append-only immutability — an observation, once recorded, is an immutable
--     fact. INSERT + DELETE (retention purge / erasure) are permitted; UPDATE is
--     trigger-forbidden. The ingest re-runs are idempotent (ON CONFLICT DO NOTHING
--     on record_hash), never UPDATE.
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.agent_hold_observations_forbid_update()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION
    'agent_hold_observations is append-only; UPDATE is forbidden (immutable observation ledger)';
END;
$$;

DROP TRIGGER IF EXISTS trg_aho_forbid_update ON public.agent_hold_observations;
CREATE TRIGGER trg_aho_forbid_update
  BEFORE UPDATE ON public.agent_hold_observations
  FOR EACH ROW EXECUTE FUNCTION public.agent_hold_observations_forbid_update();

-- ============================================================================
-- 2. Row-Level Security — service-role only (internal observation data; no public
--    read). The ingest/report runs with the service role.
-- ============================================================================

ALTER TABLE public.agent_hold_observations ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.agent_hold_observations FROM PUBLIC;
REVOKE ALL ON public.agent_hold_observations FROM authenticated;
REVOKE ALL ON public.agent_hold_observations FROM anon;

-- ============================================================================
-- 3. In-schema documentation
-- ============================================================================

COMMENT ON TABLE public.agent_hold_observations IS
  'Trust Layer S11 observation period (2026-07-12): the APPEND-ONLY, IMMUTABLE '
  'ledger of at-action examinations captured by the reference harness over the '
  '7-day live MEASURE window. Each row carries the raw kathekon-engagement signals '
  '(replay) + the derived Q3 classification (false_positive | correct_hold | '
  'not_a_hold) from the canonical predicate. MEASURE-only — labels nothing, binds '
  'nothing; the S11 enforce flip is a separate later founder-walked step. Populated '
  'by scripts/false-hold-observation-report.ts (server-side ingest of the harness '
  'JSONL); no route writes to it. UPDATE trigger-forbidden; INSERT + DELETE only. '
  '90-day retain_until; DROP at the end of the window. Full delete/erase/export '
  'wiring is a deferred rider (no external users).';

COMMENT ON COLUMN public.agent_hold_observations.loop_event IS
  'opened/reopened ⇒ a hold (the correction loop the enforce regime would bind); '
  'closed/none ⇒ not a hold. Mirrors the harness loop-closure vocabulary.';
COMMENT ON COLUMN public.agent_hold_observations.classification IS
  'false_positive = a hold whose opening verdict engaged NO kathekon factor (the '
  'class the mentor measures); correct_hold = a hold that engaged one; not_a_hold '
  '= loop closed/none. From assessKathekonEngagement + classifyObservation.';
COMMENT ON COLUMN public.agent_hold_observations.obligation_statuses IS
  'Non-null per-circle obligation statuses (met/violated/indeterminate). A circle '
  'with no obligation is dropped; unevaluated = dikaiosyne engaged AND this is {}.';

-- ============================================================================
-- VERIFY — paste the output back to confirm (TEST first, then production, each a
-- founder-walked step).
-- ============================================================================

-- 1. The table exists.
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_name = 'agent_hold_observations';

-- 2. Columns + types.
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'agent_hold_observations'
ORDER BY ordinal_position;

-- 3. Indexes (pkey, idx_aho_agent_time, idx_aho_agent_classification, idx_aho_owner,
--    idx_aho_credential, idx_aho_retain_until, uq_aho_record_hash).
SELECT indexname FROM pg_indexes
WHERE schemaname = 'public' AND tablename = 'agent_hold_observations'
ORDER BY indexname;

-- 4. owner_user_id FK to profiles present.
SELECT conname, confrelid::regclass AS references
FROM pg_constraint
WHERE conrelid = 'public.agent_hold_observations'::regclass AND contype = 'f';

-- 5. The append-only UPDATE trigger exists.
SELECT tgname FROM pg_trigger
WHERE tgrelid = 'public.agent_hold_observations'::regclass AND NOT tgisinternal;

-- 6. RLS enabled (expect relrowsecurity = true).
SELECT relname, relrowsecurity FROM pg_class
WHERE relname = 'agent_hold_observations';

-- ============================================================================
-- Rollback block (commented out — uncomment and run to revert; the natural teardown
-- at the end of the observation period).
-- ============================================================================
--
-- BEGIN;
--   DROP TABLE IF EXISTS public.agent_hold_observations;   -- drops trigger + indexes
--   DROP FUNCTION IF EXISTS public.agent_hold_observations_forbid_update();
-- COMMIT;
