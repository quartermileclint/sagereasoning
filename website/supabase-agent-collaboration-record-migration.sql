-- Migration: supabase-agent-collaboration-record-migration
-- Purpose: Trust Layer S5 (Phase 2, the four-layer discernment protocol — the
--   collaboration record). ONE new table realises the mentor's collaboration-record
--   fields per ADR-013 (adopted/adr/2026-07-08-sage-trust-layer.md §4 + §5 A4/A7/A8/A9)
--   and the build plan §S5:
--
--     * collaboration_records — the DURABLE per-collaboration document. One row per
--         (orchestrator_agent_id, task_ref) — a spawn/selection. It homes the fields
--         the discernment protocol + the S4 engine produce over the collaboration's
--         lifetime:
--           - authority_boundary  (A9) — {action_scope, circle_scope}, set ONCE at
--               selection, validated pre-execution, UNWAIVABLE by trust level, never
--               self-authorized expansion (exceed → escalate). WRITE-ONCE (trigger).
--           - l4_audit_result     (A7) — the out-of-band passion-audit verdict on the
--               orchestrator's OWN reasoning trace (extracted by the deterministic
--               engine, S7; never self-report). READABLE-NOT-MODIFIABLE: the
--               orchestrator can read it (via the S10 read surface) but cannot write
--               it — service-role-only RLS gives no write path, and the WRITE-ONCE
--               trigger stops even a later server write from tampering.
--           - habitual_stable_flag(A8) + independence_deficits (A4) — the S4 findings.
--           - justice_failure_case(A9) — the capacity-proportional reflection record.
--
--   PROFILES ARE NOT PERSISTED (founder election, S5 open): the task/candidate/
--   orchestrator profiles are pure-lib validated shapes the harness supplies at
--   discernment time (trust-core/profiles.ts), matching A6 (a profile is
--   look-up-or-absent at runtime). Only the collaboration record persists — hence
--   this single-table migration.
--
--   MEASURE MODE: this half RECORDS a collaboration; it gates NOTHING. The
--   discernment ENGINE is S6; the out-of-band L4 audit is S7; binding enforcement is
--   S11 (a separate founder-walked Critical activation — nothing here is
--   pre-approved). The whole surface is DARK behind SUBSTRATE_TRUST_CORE_ENABLED —
--   flag-unset ⇒ nothing writes, the table sits empty + inert (byte-identical,
--   test-asserted). NB: the R17 data-rights + retention coverage of this table is
--   ALWAYS-ON (erasure/export cannot be flag-gated) but missing-table-benign until
--   this migration lands and empty-safe thereafter.
--
-- IDENTITY MODEL (K1-aligned; mirrors agent_trust_state / agent_assessment_history):
--   * orchestrator_agent_id — the K1 declared agent_identity of the orchestrator (the
--       oversight-domain trust subject; A8/A9). NOT NULL.
--   * candidate_agent_id    — the SELECTED sub-agent's K1 id. NULLable — a record may
--       open before selection finalizes (the L4 audit runs "before selection
--       finalizes"), so the candidate is set when selection locks.
--   * task_ref              — a stable per-spawn task handle; (orchestrator, task_ref)
--       is the collaboration key.
--   * owner_user_id — the OPERATOR (K1 operator_account; a developer, never an
--       end-user — R3). Denormalised from the credential so the user-JWT data-rights
--       paths (/api/user/delete R17c + /api/user/export R17i) reach these rows. FK →
--       profiles(id) ON DELETE CASCADE = the genuine-deletion backstop. NULL for
--       external API consumers (sr_live_ path).
--   * credential_ref — the stable per-credential handle ('api_key:<id>' | 'install:<id>')
--       so consumer-erasure-by-token (/api/credential/erase, R17c) reaches the
--       null-owner external-consumer rows. NULLable.
--
-- WRITE-ONCE IMMUTABILITY (A9 unwaivable + A7 readable-not-modifiable): unlike
--   agent_trust_events (fully append-only), this record IS mutable over the
--   collaboration lifetime (status, flags, the justice-failure record are set as the
--   collaboration progresses). But TWO columns are WRITE-ONCE — authority_boundary
--   and l4_audit_result — enforced by a BEFORE UPDATE trigger that RAISES if either
--   is changed once non-null. Setting from NULL is allowed (the initial write);
--   changing a set value is forbidden (idempotent re-set of the identical value is
--   allowed). jsonb equality is key-order-independent but ARRAY-order-SENSITIVE; the
--   store (collaboration-store.ts) writes authority_boundary CANONICALIZED (circle
--   scope sorted, canonicalAuthorityBoundary), so the trigger only ever compares
--   canonical values and a genuine re-set of the same circle set matches regardless of
--   the order it was supplied in — consistent with the order-independent lib guards.
--   This is the DB-level guarantee behind the mentor's "set once at selection … cannot self-authorise
--   scope extension" (A9) and "a field the orchestrating agent can read but not
--   modify" (A7).
--
-- Related: ADR-013 (design-of-record), mentor §4 + A4/A7/A8/A9, agent_trust_core
--   (the mirrored S1 precedent — retain_until, RLS service-role-only,
--   missing-table-benign data rights, R18f-parallel), R17/R17c/R17i (data rights
--   extend here), R6c (qualitative levels, not numeric scoring).
-- Decision log: D-TRUST-LAYER-S0B-ADR-ADOPTED (design surface); D-TRUST-LAYER-S5-...
--   (this session).
--
-- Risk classification: Critical under 0d-ii — NEW schema. Idempotent + additive
--   (CREATE ... IF NOT EXISTS); no existing table is altered; reversible via the
--   rollback block. Applied TEST-first, then PRODUCTION INERT this session (flag
--   unset ⇒ no writes) — the S1/M6 precedent — each its own founder-walked step
--   (PR17/AC7). The flag activation is a LATER founder-walked step, not pre-approved
--   by this migration.
-- Idempotent: safe to re-run (CREATE TABLE / INDEX / POLICY / TRIGGER IF NOT EXISTS
--   or CREATE OR REPLACE for the function).

-- ============================================================================
-- 1. collaboration_records — the durable per-collaboration discernment document
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.collaboration_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identity (K1-aligned; see the header).
  orchestrator_agent_id TEXT NOT NULL,
  candidate_agent_id    TEXT,
  task_ref              TEXT NOT NULL,
  owner_user_id         UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  credential_ref        TEXT,

  -- A9 authority boundary — {action_scope: <function-type>, circle_scope: <string[]>},
  -- set ONCE at selection. WRITE-ONCE (trigger below). NULL until set. JSONB (KG7 —
  -- the object is passed directly, no JSON.stringify).
  authority_boundary JSONB,

  -- A7 L4 audit result — the out-of-band passion audit on the orchestrator's trace.
  -- READABLE-NOT-MODIFIABLE: WRITE-ONCE (trigger below); the orchestrator has no
  -- write path (service-role-only RLS). NULL until the S7 audit writes it.
  l4_audit_result JSONB,

  -- A8 habitual-stable flag (the S4 finding fed to the next Reflect). NULL when none.
  habitual_stable_flag JSONB,

  -- A4 per-domain independence-principle deficits (the S4 transparency-ledger
  -- descriptors). Default empty array (no deficit).
  independence_deficits JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- A9 justice-failure reflection record (the capacity-proportional case). NULL
  -- when the collaboration produced no justice failure.
  justice_failure_case JSONB,

  -- The collaboration lifecycle status.
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'finalized', 'escalated')),

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- The record IS mutable over the collaboration lifetime (status/flags/justice case);
  -- authority_boundary + l4_audit_result are the write-once exceptions (trigger).
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- R17c: 90-day retention (the S1/M6 precedent). For null-owner external-consumer
  -- rows this is the PRIMARY genuine-deletion mechanism (the trust-core retention
  -- sweep hard-deletes past retain_until). Refreshed on each write.
  retain_until TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '90 days'),

  -- One record per (orchestrator, task) — the collaboration key + the upsert/read key.
  CONSTRAINT uq_cr_orchestrator_task UNIQUE (orchestrator_agent_id, task_ref)
);

-- Read a candidate's collaborations (for the candidate-side trust view, later).
CREATE INDEX IF NOT EXISTS idx_cr_candidate
  ON public.collaboration_records (candidate_agent_id)
  WHERE candidate_agent_id IS NOT NULL;

-- Data-rights: delete/export an operator's collaboration records.
CREATE INDEX IF NOT EXISTS idx_cr_owner
  ON public.collaboration_records (owner_user_id)
  WHERE owner_user_id IS NOT NULL;

-- Consumer-erasure-by-token: delete an external consumer's records by credential.
CREATE INDEX IF NOT EXISTS idx_cr_credential
  ON public.collaboration_records (credential_ref)
  WHERE credential_ref IS NOT NULL;

-- Retention sweep (hard-delete past retain_until).
CREATE INDEX IF NOT EXISTS idx_cr_retain_until
  ON public.collaboration_records (retain_until);

-- ----------------------------------------------------------------------------
-- 1a. Write-once immutability — authority_boundary (A9 unwaivable) + l4_audit_result
--     (A7 readable-not-modifiable). A BEFORE UPDATE trigger RAISES if either column
--     is CHANGED once non-null. Setting from NULL is allowed (the initial write);
--     an idempotent re-set of the IDENTICAL value is allowed (jsonb equality is
--     key-order-independent; array order IS significant, but the store writes
--     authority_boundary with a canonical/sorted circle scope so a genuine re-set
--     matches), so a retry does not trip the guard. Every other column stays mutable
--     (status/flags/justice-case accrue over the collaboration).
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.collaboration_records_protect_immutable()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF OLD.authority_boundary IS NOT NULL
     AND NEW.authority_boundary IS DISTINCT FROM OLD.authority_boundary THEN
    RAISE EXCEPTION
      'collaboration_records.authority_boundary is set-once at selection (A9 unwaivable; exceed → escalate, never self-expand)';
  END IF;
  IF OLD.l4_audit_result IS NOT NULL
     AND NEW.l4_audit_result IS DISTINCT FROM OLD.l4_audit_result THEN
    RAISE EXCEPTION
      'collaboration_records.l4_audit_result is readable-not-modifiable (A7 out-of-band audit — written once)';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_cr_protect_immutable ON public.collaboration_records;
CREATE TRIGGER trg_cr_protect_immutable
  BEFORE UPDATE ON public.collaboration_records
  FOR EACH ROW EXECUTE FUNCTION public.collaboration_records_protect_immutable();

-- ============================================================================
-- 2. Row-Level Security — service-role only (R17a; internal collaboration data,
--    no public read; the S10 public read surface is a later, separately-governed
--    slice). The orchestrator's read-only access to l4_audit_result is mediated by
--    that future read surface, NOT direct table access — the readable-not-modifiable
--    guarantee: no non-service role can read OR write here.
-- ============================================================================

ALTER TABLE public.collaboration_records ENABLE ROW LEVEL SECURITY;

-- No permissive policies. The Supabase service role bypasses RLS and is the ONLY
-- reader/writer (collaboration-store.ts + the data-rights routes).
REVOKE ALL ON public.collaboration_records FROM PUBLIC;
REVOKE ALL ON public.collaboration_records FROM authenticated;
REVOKE ALL ON public.collaboration_records FROM anon;

-- ============================================================================
-- 3. In-schema documentation
-- ============================================================================

COMMENT ON TABLE public.collaboration_records IS
  'Trust Layer S5 (2026-07-09): the DURABLE per-collaboration discernment document '
  '(mentor ADR-013 §4 + A4/A7/A8/A9). One row per (orchestrator_agent_id, task_ref). '
  'Homes authority_boundary (A9, write-once), l4_audit_result (A7, write-once / '
  'readable-not-modifiable), habitual_stable_flag (A8), independence_deficits (A4), '
  'justice_failure_case (A9). Mutable over the collaboration lifetime EXCEPT the two '
  'write-once columns (trg_cr_protect_immutable). DARK behind SUBSTRATE_TRUST_CORE_ENABLED '
  '(flag-unset ⇒ empty + inert). R17 lifecycle: 90-day retain_until + genuine deletion '
  'via /api/user/delete + /api/credential/erase + the profiles cascade.';

COMMENT ON COLUMN public.collaboration_records.authority_boundary IS
  'A9: {action_scope, circle_scope}, set once at selection. WRITE-ONCE (trigger) — '
  'unwaivable by trust level; a different boundary is a new collaboration, not a mutation.';
COMMENT ON COLUMN public.collaboration_records.l4_audit_result IS
  'A7: the out-of-band passion audit on the orchestrator trace (S7). WRITE-ONCE / '
  'readable-not-modifiable — the orchestrator reads (via S10) but has no write path.';
COMMENT ON COLUMN public.collaboration_records.justice_failure_case IS
  'A9: the capacity-proportional reflection record (case 1 briefed / case 2 catchable-'
  'not-run / case 3 uncatchable). The orchestrator-side delegation-reflection events '
  'are emitted separately (S1 delegation-reflection-case-{1,2,3}); the sub-agent''s own '
  'violation flows through the ordinary justice pipeline.';

-- ============================================================================
-- VERIFY — paste the output back to confirm (TEST first, then production inert at
-- its own founder-walked step).
-- ============================================================================

-- 1. Table exists.
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_name = 'collaboration_records';

-- 2. Columns + types.
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'collaboration_records'
ORDER BY ordinal_position;

-- 3. Indexes (pkey, uq_cr_orchestrator_task, idx_cr_candidate, idx_cr_owner,
--    idx_cr_credential, idx_cr_retain_until).
SELECT tablename, indexname FROM pg_indexes
WHERE schemaname = 'public' AND tablename = 'collaboration_records'
ORDER BY indexname;

-- 4. owner_user_id FK → profiles.
SELECT conrelid::regclass AS tbl, conname, confrelid::regclass AS references
FROM pg_constraint
WHERE conrelid = 'public.collaboration_records'::regclass AND contype = 'f';

-- 5. The write-once trigger exists.
SELECT tgname FROM pg_trigger
WHERE tgrelid = 'public.collaboration_records'::regclass AND NOT tgisinternal;

-- 6. RLS enabled (expect relrowsecurity = true).
SELECT relname, relrowsecurity FROM pg_class
WHERE relname = 'collaboration_records';

-- 7. Write-once behaviour check (optional — run against a scratch row on TEST):
--    INSERT a row with authority_boundary set, attempt to CHANGE it (expect the
--    RAISE), attempt to change status (expect success), then DELETE.
-- INSERT INTO public.collaboration_records (orchestrator_agent_id, task_ref, authority_boundary)
--   VALUES ('probe:orch@v1', 'probe-task', '{"schema":"trust-authority-boundary-v1","actionScope":"retrieval","circleScope":["c1"]}'::jsonb);
-- UPDATE public.collaboration_records SET authority_boundary = '{"actionScope":"write"}'::jsonb
--   WHERE orchestrator_agent_id = 'probe:orch@v1';  -- expect ERROR (write-once)
-- UPDATE public.collaboration_records SET status = 'finalized'
--   WHERE orchestrator_agent_id = 'probe:orch@v1';  -- expect success (mutable)
-- DELETE FROM public.collaboration_records WHERE orchestrator_agent_id = 'probe:orch@v1';  -- cleanup

-- ============================================================================
-- Rollback block (commented out — uncomment and run to revert). Flag-unset first
-- so nothing is writing, then drop.
-- ============================================================================
--
-- BEGIN;
--   DROP TABLE IF EXISTS public.collaboration_records;   -- drops trigger + indexes
--   DROP FUNCTION IF EXISTS public.collaboration_records_protect_immutable();
-- COMMIT;
