-- Migration: supabase-agent-provenance-ledger-migration
-- Purpose: The signature-keyed extraction-provenance ledger (ruled option (a)).
--   Slice 1 of the provenance-ledger build sequence — SCHEMA ONLY. Creates
--   `agent_provenance_ledger`, empty and inert. No write path, no flag, no route
--   change ships in this slice; the consult-side write (gated behind the NEW,
--   NOT-YET-CREATED `SUBSTRATE_PROVENANCE_LEDGER_ENABLED`) is slice 2's job.
--
--   Records, per consulted-and-signed action, the extraction-origin fact
--   (`layer1_source`: did the server extract the Layer-1 schema, or did the
--   caller supply one?) keyed on a hash of the assessment's own Ed25519
--   signature — so the accreditation write boundary can later look up "was THIS
--   signed artifact's origin server-extracted?" without trusting the caller's
--   say-so at write time (F-1/F-2, the extraction-provenance fix). Read at the
--   accreditation write boundary (`emitAccreditationTrustEvents`); a lookup miss,
--   an out-of-window entry, an identity mismatch, or a `supplied` entry each
--   REFUSES the mint of that artifact's trust event (slice 5, gated on §9's
--   readiness threshold) — recorded as a coverage gap on the sibling table,
--   `agent_provenance_gaps` (its own migration).
--
-- BINDING RECORD (verbatim wins over this comment):
--   operations/agent-circles-2026-08/2026-08-25-mentor-ruling-extraction-
--     provenance-fix-choice-verbatim.md (+ ADDENDUM, ADDENDUM 2)
--   operations/agent-circles-2026-08/2026-08-26-mentor-ruling-provenance-
--     ledger-q1-q4-verbatim.md
--   operations/agent-circles-2026-08/2026-08-26-mentor-ruling-provenance-
--     ledger-q1-round2-verbatim.md
--   operations/agent-circles-2026-08/2026-08-26-mentor-ruling-provenance-
--     ledger-q3-and-404-verbatim.md
--   operations/agent-circles-2026-08/2026-08-26-provenance-ledger-SCOPE.md
--     (§3, §4.1, §4.2, §4.3, §7 — the schema and its reasoning)
--
-- IDENTITY MODEL — the EXISTING resolveLongitudinalIdentity module, unchanged;
--   NO second identity notion (F-1, SCOPE §3):
--   * identity_kind  — 'owner_agent_pair' when the presenting credential resolved
--       with both owner_user_id AND agent_id present (the UPC identity);
--       'credential' otherwise (the owner-less-credential fallback — the live
--       s9-loop CONSULT credential's shape, per longitudinal-identity.ts's own
--       docstring). The CHECK below (apl_identity_kind_consistency) encodes this
--       exactly, so the column pair can never drift from what
--       resolveLongitudinalIdentity() would compute.
--   * owner_user_id  — set only on the pair branch. FK -> profiles(id) ON DELETE
--       CASCADE (the genuine-deletion backstop; R17c).
--   * agent_id       — the K1 declared agent identity. Set on the pair branch;
--       MAY also be set on the credential branch (an agent-declared but
--       owner-less credential still names its agent_id — agent_declared:true in
--       the identity module's own vocabulary). Never used as a lookup key on its
--       own (agent_id alone is NOT owner-unique — the cross-tenant guard).
--   * credential_ref — always set (the physical write key AND the R17a/R17c
--       consumer-erasure-by-token handle). 'api_key:<id>' | 'install:<id>'.
--
-- WHY A HASH, NEVER THE RAW SIGNATURE (F-2's hard exclusion, structural — see
--   the sibling agent_provenance_gaps migration for the fuller statement): the
--   raw Ed25519 signature is never persisted here. `signature_hash` is
--   sha256(signature), hex-encoded, computed by the write path (slice 2) from
--   the SAME signature the consult already returned to the caller — nothing
--   secret is stored, and the hash is useless for reconstructing or replaying
--   the signature itself.
--
-- INSERT-ONCE, NEVER UPSERT (Q4(ii) ruled; SCOPE §4.3): `signature_hash` is
--   UNIQUE. A retried write conflicts benignly (ON CONFLICT DO NOTHING is the
--   write path's job, slice 2) — the database enforces insert-once, not
--   application ordering. The disclosed limit stands as ruled: a later genuine
--   `server` consult of the SAME already-recorded signature cannot correct an
--   earlier `supplied` entry. Per SCOPE §3.5/§4.3 the only reachable
--   misattribution runs fail-closed (a later record can only ever be equal or
--   MORE conservative), so insert-once is the conservative choice here, not
--   merely the simpler one.
--
-- recorded_at IS THE CONSULT TIME, NOT THE LEDGER-WRITE TIME (SCOPE §0.3, §8):
--   load-bearing for the PA-10 dependency (the A5 recency-tier closure this
--   ledger is the prerequisite ENABLER for, not a substitute for) — an
--   artifact's AGE is `now() - recorded_at`, and today no artifact-age signal
--   exists anywhere else in the system. created_at (the row-insert time) is kept
--   separate, mirroring agent_trust_events' occurred_at/created_at split, so a
--   delayed or replayed write never masquerades as a fresher artifact.
--
-- RETENTION (SCOPE §7): 90 days, matching the trust-core/hold-observations
--   family — one sweep, one schedule, one retention story, one PR24 account.
--   The window bounds what can be NEWLY MINTED going forward; it does NOT bound
--   what an already-minted trust event has already folded into
--   agent_trust_state (that fold is permanent — SCOPE §7.2's correction). THE
--   SWEEP ITSELF (extending /api/cron/trajectory-retention-sweep per the C-1
--   two-table precedent) IS SLICE 2's JOB (SCOPE §7, this prompt's Step 3) —
--   NOT built here. This migration only declares the column + its index; no
--   purge function reads it yet.
--
-- R17 DATA RIGHTS (SCOPE §4.4 — "not a rider; a precondition"): wired in THIS
--   slice, alongside the empty tables, per the session's own judgement call
--   (recorded in the slice-1 close) — following the S1/S5/Stoa precedent of
--   shipping retention/data-rights machinery in the SAME session as the schema
--   it protects, and because both tables are owner-scoped exactly like their
--   agent_trust_events/agent_trust_state/collaboration_records siblings. Both
--   tables are missing-table-benign until this migration lands, so the Live
--   /api/user/delete + /api/user/export + /api/credential/erase routes do not
--   break before it does.
--
-- Risk classification: Critical under 0d-ii — NEW schema. Idempotent + additive
--   (CREATE ... IF NOT EXISTS); no existing table is altered; reversible via the
--   rollback block. Applied TEST-first, then production, each its own
--   founder-walked step (PR6/PR17/AC7). The AI performs no live DB operation;
--   the founder walks the migration and pastes back each §VERIFY output.
-- Idempotent: safe to re-run (CREATE TABLE / INDEX IF NOT EXISTS).

-- ============================================================================
-- §PRE — read-only, run first. Confirms the table does not already exist
-- (expect ZERO rows both times).
-- ============================================================================

SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_name = 'agent_provenance_ledger';

-- ============================================================================
-- §APPLY
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.agent_provenance_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- The key. sha256(signature), hex. The raw signature is NEVER stored here.
  signature_hash TEXT NOT NULL,

  -- Identity (see the header). Mirrors resolveLongitudinalIdentity() exactly —
  -- the CHECK below enforces the same fallback rule the module encodes in code,
  -- so the two can never silently diverge.
  identity_kind  TEXT NOT NULL CHECK (identity_kind IN ('owner_agent_pair', 'credential')),
  owner_user_id  UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  agent_id       TEXT,
  credential_ref TEXT NOT NULL,

  -- The extraction-origin fact this ledger exists to record. Computed
  -- UNCONDITIONALLY from preExtractedLayer1Schema !== undefined at the write
  -- site (SCOPE §2 fact 6 / §4.2) — NEVER gated behind an unrelated feature flag
  -- (the trajectory-delta blind window this ledger must not inherit).
  layer1_source TEXT NOT NULL CHECK (layer1_source IN ('server', 'supplied')),

  -- The consult time — load-bearing (see the header). Not defaulted to now() by
  -- convention alone: the write path (slice 2) always supplies the real value: the
  -- DEFAULT below exists only so a manual/diagnostic insert has a sane fallback.
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- The ledger-row-insert time (distinct from recorded_at — see the header).
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- 90-day retention (see the header). The sweep that enforces this is slice 2.
  retain_until TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '90 days'),

  -- Insert-once (Q4(ii) ruled; SCOPE §4.3) — the database enforces it, not
  -- application ordering. A retried write conflicts benignly on this key.
  CONSTRAINT uq_apl_signature_hash UNIQUE (signature_hash),

  -- Encodes resolveLongitudinalIdentity()'s fallback rule at the schema level:
  -- 'owner_agent_pair' iff BOTH owner_user_id and agent_id are set;
  -- 'credential' otherwise, and on that branch owner_user_id is ALWAYS null
  -- (agent_id may or may not be set — the agent-declared-but-owner-less shape,
  -- longitudinal-identity.ts:53-56 — but owner_user_id set + agent_id null is a
  -- shape the function never produces; the constraint is written tight, not as
  -- "not both set", so a write-path bug on the credential branch that carries
  -- owner_user_id through unexpectedly is CAUGHT here rather than silently
  -- admitted — PR19 fold, 2026-08-26).
  CONSTRAINT apl_identity_kind_consistency CHECK (
    (identity_kind = 'owner_agent_pair' AND owner_user_id IS NOT NULL AND agent_id IS NOT NULL)
    OR
    (identity_kind = 'credential' AND owner_user_id IS NULL)
  )
);

-- Age lookups (the slice-2 window check: recorded_at vs. now() - retention).
CREATE INDEX IF NOT EXISTS idx_apl_recorded_at
  ON public.agent_provenance_ledger (recorded_at);

-- Data-rights: delete/export an operator's ledger entries (R17c/R17i).
CREATE INDEX IF NOT EXISTS idx_apl_owner
  ON public.agent_provenance_ledger (owner_user_id)
  WHERE owner_user_id IS NOT NULL;

-- Consumer-erasure-by-token: delete an external consumer's entries by credential.
CREATE INDEX IF NOT EXISTS idx_apl_credential
  ON public.agent_provenance_ledger (credential_ref);

-- Retention sweep (slice 2 reads this; declared now so the sweep needs no later
-- migration of its own).
CREATE INDEX IF NOT EXISTS idx_apl_retain_until
  ON public.agent_provenance_ledger (retain_until);

-- ============================================================================
-- Row-Level Security — service-role only, mirroring agent_trust_events /
-- agent_hold_observations. No permissive policy: the Supabase service role
-- bypasses RLS and is the ONLY reader/writer (the store module + the
-- data-rights routes).
-- ============================================================================

ALTER TABLE public.agent_provenance_ledger ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.agent_provenance_ledger FROM PUBLIC;
REVOKE ALL ON public.agent_provenance_ledger FROM authenticated;
REVOKE ALL ON public.agent_provenance_ledger FROM anon;

-- ============================================================================
-- In-schema documentation
-- ============================================================================

COMMENT ON TABLE public.agent_provenance_ledger IS
  'The signature-keyed extraction-provenance ledger (ruled option (a), '
  '2026-08-25/26). One row per signed, extraction-provenance-recorded consult. '
  'INSERT-ONCE (UNIQUE signature_hash) — the database enforces it, never an '
  'upsert. Read at the accreditation write boundary to decide whether a signed '
  'artifact''s trust event may mint (slice 5, gated on the §9 readiness '
  'threshold). Refusals are recorded on the sibling agent_provenance_gaps table, '
  'never silently. DARK behind SUBSTRATE_PROVENANCE_LEDGER_ENABLED (does not '
  'exist yet — created by slice 2 alongside the write it gates). 90-day '
  'retain_until; sweep wiring is slice 2''s job. R17 lifecycle: genuine '
  'deletion via /api/user/delete + /api/credential/erase + the profiles cascade, '
  'export via /api/user/export.';

COMMENT ON COLUMN public.agent_provenance_ledger.signature_hash IS
  'sha256(signature), hex. The key. The raw Ed25519 signature is never stored.';
COMMENT ON COLUMN public.agent_provenance_ledger.layer1_source IS
  'server = the substrate extracted the Layer-1 schema; supplied = the caller '
  'did (route (i)/(ii) territory; a supplied entry REFUSES the mint at '
  'enforcement — Q2 ruled, 2026-08-26).';
COMMENT ON COLUMN public.agent_provenance_ledger.recorded_at IS
  'The CONSULT time, not the row-insert time (see created_at). Load-bearing for '
  'the PA-10/A5-recency-tier dependency this ledger enables.';

-- ============================================================================
-- §VERIFY — paste the output back after each apply (TEST first, then
-- production; each a founder-walked step).
-- ============================================================================

-- V1. The table exists.
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_name = 'agent_provenance_ledger';

-- V2. Columns + types (expect 10 rows, in ordinal order: id, signature_hash,
--     identity_kind, owner_user_id, agent_id, credential_ref, layer1_source,
--     recorded_at, created_at, retain_until).
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'agent_provenance_ledger'
ORDER BY ordinal_position;

-- V3. Indexes (pkey, uq_apl_signature_hash, idx_apl_recorded_at, idx_apl_owner,
--     idx_apl_credential, idx_apl_retain_until).
SELECT indexname FROM pg_indexes
WHERE schemaname = 'public' AND tablename = 'agent_provenance_ledger'
ORDER BY indexname;

-- V4. CHECK constraints (identity_kind, layer1_source,
--     apl_identity_kind_consistency).
SELECT conname, pg_get_constraintdef(oid) AS definition
FROM pg_constraint
WHERE conrelid = 'public.agent_provenance_ledger'::regclass AND contype = 'c'
ORDER BY conname;

-- V5. The unique constraint on signature_hash.
SELECT conname, pg_get_constraintdef(oid) AS definition
FROM pg_constraint
WHERE conrelid = 'public.agent_provenance_ledger'::regclass AND contype = 'u';

-- V6. owner_user_id FK to profiles, ON DELETE CASCADE.
SELECT conname, confrelid::regclass AS references, confdeltype
FROM pg_constraint
WHERE conrelid = 'public.agent_provenance_ledger'::regclass AND contype = 'f';

-- V7. RLS enabled (expect relrowsecurity = true).
SELECT relname, relrowsecurity FROM pg_class
WHERE relname = 'agent_provenance_ledger';

-- V8. The table is genuinely empty (expect 0).
SELECT count(*) FROM public.agent_provenance_ledger;

-- ============================================================================
-- Rollback block (commented out — uncomment and run to revert).
-- ============================================================================
--
-- BEGIN;
--   DROP TABLE IF EXISTS public.agent_provenance_ledger;   -- drops indexes too
-- COMMIT;
