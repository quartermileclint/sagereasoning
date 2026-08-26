-- Migration: supabase-agent-provenance-gaps-migration
-- Purpose: F-2's refused-mint coverage-gap record. Slice 1 of the
--   provenance-ledger build sequence — SCHEMA ONLY. Creates
--   `agent_provenance_gaps`, empty and inert. No write path, no flag, no route
--   change ships in this slice.
--
--   "Every refused mint is a named coverage gap, never silence" (F-2, ruled;
--   SCOPE §1/§6). At enforcement (slice 5), a signed assessment whose extraction
--   origin the ledger could not verify — or explicitly disqualified — refuses
--   to mint that artifact's trust event, and ONE row lands here recording WHY.
--   Served on the public trust record (`GET /api/trust-record/{agent_id}`) as
--   `provenance_gaps` (slice 3, a NEW sibling field — NOT `coverage_gaps`
--   widened; SCOPE §6, ruled), each entry carrying its own honest
--   not-attestable clause inline, alongside a `total_provenance_gaps_count` so
--   a reader sees "showing N of M" rather than inferring completeness (the C2c
--   `orientation_readings` pattern, reused exactly — SCOPE §0.2, §6.4).
--
-- BINDING RECORD (verbatim wins over this comment) — same set as the sibling
--   agent_provenance_ledger migration; see that file's header.
--
-- THE TWO SCHEMA-LEVEL GAPS THE SCOPING NEVER RESOLVED, closed HERE, in this
--   migration, per the slice-1 prompt's Step 2 (neither was ever put to the
--   mentor across five rounds — both are decided here with stated reasoning,
--   not silently defaulted):
--
--   GAP 1 — `correlation_id` was labelled "idempotency" (SCOPE §4.1) with NO
--     uniqueness constraint actually declared. RESOLVED: `correlation_id` is
--     UNIQUE (uq_apg_correlation_id below), mirroring the ledger's own
--     UNIQUE(signature_hash) treatment of insert-once. Reasoning: the accreditation
--     write boundary's own honest-409-on-reuse pattern (the harness's normal
--     operating mode — a retried close-hook write, not an edge case) means a
--     refusal-record write WILL be retried under ordinary operation; without a
--     uniqueness constraint a retry would duplicate the SAME refused write's gap
--     row on the PUBLIC record — a fabricated-looking repeat of a single fact,
--     which is exactly the honesty defect this table exists to prevent. The
--     write path (slice 2) derives correlation_id deterministically from the
--     write's own identity (mirroring 'accr:<hash>' / 'reflect:<session_id>')
--     and relies on ON CONFLICT (correlation_id) DO NOTHING for the same
--     idempotent-retry BEHAVIOUR agent_trust_events already has. The SHAPE is
--     deliberately simpler than agent_trust_events' own uq_ate_correlation
--     (a nullable, partial, THREE-column composite index — correlation_id +
--     event_type + virtue_domain — because one write there can fan out several
--     distinct events per correlation id). This table's grain is ALREADY one
--     row per write (§5.4's ruled granularity), so a bare NOT NULL + UNIQUE on
--     correlation_id alone is the correct, simpler form for this table — not
--     an approximation of the trust-events shape.
--
--   GAP 2 — no stated precedence when ONE accreditation write produces MULTIPLE
--     distinct refusal reasons at once across its several submitted artifacts
--     (the granularity is already ruled: one gap row per WRITE, not per
--     artifact — SCOPE §5.4). RESOLVED (a recommendation the slice-1 prompt
--     licenses this session to change, with the reasoning recorded, if a later
--     review judges otherwise — not re-opened here): precedence, most to least
--     severe —
--       1. caller_supplied_extraction  — a POSITIVE finding: the ledger has
--          data, and the data disqualifies the mint. Distinct in kind from the
--          next three, which are all "the ledger has no data" (the Q2 ruling's
--          own framing of this distinction — SCOPE §5, "one says the instrument
--          had no data, the other says the instrument had data and the data
--          disqualified the mint").
--       2. identity_mismatch           — the ledger has SOME data (an entry
--          resolved) but it does not match the write-side identity (SCOPE §3.4).
--       3. out_of_window               — the ledger has SOME data (an entry
--          resolved) but it has aged out of the retention window.
--       4. no_ledger_entry             — the true fallback: no entry was ever
--          found for this signature.
--     This precedence is stated HERE, in the migration that must admit every
--     value the rule can produce, even though the rule itself is applied by the
--     write-path logic slice 2 builds — so the CHECK constraint below never
--     needs to widen when slice 2 lands. If this ordering is changed in slice
--     2, this comment must be updated in the same session (it is the single
--     stated record of the decision).
--
-- WHY THIS IS A NEW TABLE, NOT A NEW agent_trust_events TYPE (SCOPE §4.1,
--   worked through in full there — restated briefly): a refusal event is not
--   examination-derived (it would require re-auditing
--   TRUST_RECORD_ENVELOPE.attests[0], which is scoped to what the record DOES
--   attest), and it would widen TWO CHECK constraints on agent_trust_events at
--   once (event_type, already 21 values, AND artifact_kind, already 5) — the
--   Stoa Q5c/Q13a staleness class is a named live-incident hazard in THIS
--   project against widening event_type specifically. agent_hold_observations
--   is the right SHAPE precedent (append-only, service-role-only,
--   retain_until-swept); its LIFECYCLE is explicitly NOT the precedent — that
--   table is populated by a script and expected to be DROPped at the end of an
--   observation window with data-rights deferred as a no-external-users rider.
--   `agent_provenance_gaps` is populated by a LIVE ROUTE, is PERMANENT, and is
--   SERVED PUBLICLY — so it ships with full R17 coverage in this slice (see
--   below), not deferred.
--
-- F-2's HARD EXCLUSION IS STRUCTURAL, NOT A SERIALISER DISCIPLINE: no
--   signature, signature_hash, or any artifact-detail column exists on this
--   table AT ALL. A refused mint's evidence lives on agent_provenance_ledger
--   (service-role-only, never served); this table records only the FACT of a
--   refusal and its reason — nothing that would expose the provenance mechanism
--   to gaming by letting a reader correlate a gap entry back to a specific
--   artifact or signature.
--
-- R17 DATA RIGHTS (SCOPE §4.4 — "the sharper case": this table is served
--   PUBLICLY, so an owner deletion that left gap entries standing would keep
--   publishing a fact about an erased subject). Wired in THIS slice — see the
--   sibling ledger migration's header for the full reasoning (the session's
--   judgement call, recorded in the slice-1 close).
--
-- Risk classification: Critical under 0d-ii — NEW schema + a table that will
--   (at slice 3) be served on a public payload. Idempotent + additive; no
--   existing table altered; reversible via the rollback block. Applied
--   TEST-first, then production, each its own founder-walked step
--   (PR6/PR17/AC7). The AI performs no live DB operation.
-- Idempotent: safe to re-run (CREATE TABLE / INDEX IF NOT EXISTS).

-- ============================================================================
-- §PRE — read-only, run first. Confirms the table does not already exist
-- (expect ZERO rows both times).
-- ============================================================================

SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_name = 'agent_provenance_gaps';

-- ============================================================================
-- §APPLY
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.agent_provenance_gaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- The refused write's identity. agent_id is always present at the refusal
  -- point (emitAccreditationTrustEvents already resolves it — SCOPE §2 fact 1).
  -- owner_user_id is nullable (an external-consumer / owner-less credential).
  -- credential_ref is always set, mirroring the ledger table.
  agent_id       TEXT NOT NULL,
  owner_user_id  UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  credential_ref TEXT NOT NULL,

  -- The closed, four-value reason vocabulary (Q2 ruled; SCOPE §5). Precedence
  -- among these when one write produces several at once is GAP 2, resolved
  -- above.
  reason TEXT NOT NULL CHECK (reason IN (
    'no_ledger_entry',
    'out_of_window',
    'identity_mismatch',
    'caller_supplied_extraction'
  )),

  occurred_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  retain_until TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '90 days'),

  -- Idempotency (GAP 1, resolved above). Internal only — NEVER served on the
  -- public payload (F-2's hard exclusion; enforced at the serialiser's field
  -- list in slice 3, not by an absence in this schema, since the column's
  -- purpose is legitimate write-path dedup, not artifact identification).
  correlation_id TEXT NOT NULL,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT uq_apg_correlation_id UNIQUE (correlation_id)
);

-- The public-record serving path: this agent's gap entries, newest first,
-- capped at read time (mirrors ORIENTATION_READINGS_ROW_CAP — the store enforces
-- the cap via .limit(CAP + 1) as a truncation probe, not this index alone).
CREATE INDEX IF NOT EXISTS idx_apg_agent_occurred
  ON public.agent_provenance_gaps (agent_id, occurred_at DESC);

-- Data-rights: delete/export an operator's gap entries (R17c/R17i).
CREATE INDEX IF NOT EXISTS idx_apg_owner
  ON public.agent_provenance_gaps (owner_user_id)
  WHERE owner_user_id IS NOT NULL;

-- Consumer-erasure-by-token: delete an external consumer's entries by credential.
CREATE INDEX IF NOT EXISTS idx_apg_credential
  ON public.agent_provenance_gaps (credential_ref);

-- Retention sweep (slice 2 reads this).
CREATE INDEX IF NOT EXISTS idx_apg_retain_until
  ON public.agent_provenance_gaps (retain_until);

-- ============================================================================
-- Row-Level Security — service-role only. No permissive policy.
-- ============================================================================

ALTER TABLE public.agent_provenance_gaps ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.agent_provenance_gaps FROM PUBLIC;
REVOKE ALL ON public.agent_provenance_gaps FROM authenticated;
REVOKE ALL ON public.agent_provenance_gaps FROM anon;

-- ============================================================================
-- In-schema documentation
-- ============================================================================

COMMENT ON TABLE public.agent_provenance_gaps IS
  'F-2''s refused-mint coverage-gap record (ruled, 2026-08-25/26). One row per '
  'accreditation write whose provenance check refused to mint at least one '
  'artifact''s trust event (one row per WRITE, not per artifact — SCOPE §5.4). '
  'Reason vocabulary: no_ledger_entry | out_of_window | identity_mismatch | '
  'caller_supplied_extraction. NO signature or artifact-detail column exists on '
  'this table (F-2''s hard exclusion, structural). Served publicly at slice 3 as '
  'provenance_gaps on GET /api/trust-record/{agent_id}, each entry carrying its '
  'own not-attestable clause inline (the C2c orientation_readings pattern). '
  'correlation_id is UNIQUE and NEVER served. 90-day retain_until; sweep wiring '
  'is slice 2''s job. R17 lifecycle: genuine deletion via /api/user/delete + '
  '/api/credential/erase + the profiles cascade, export via /api/user/export.';

COMMENT ON COLUMN public.agent_provenance_gaps.reason IS
  'no_ledger_entry = no data for this signature; out_of_window = data existed, '
  'aged out; identity_mismatch = data existed, wrong identity; '
  'caller_supplied_extraction = data existed and disqualified the mint (a '
  'DISTINCT, positive finding from the other three — Q2 ruled).';
COMMENT ON COLUMN public.agent_provenance_gaps.correlation_id IS
  'Idempotency key (GAP 1, resolved in this migration''s header) — derived '
  'like accr:<digest> by the write path (slice 2). Internal only; never served.';

-- ============================================================================
-- §VERIFY — paste the output back after each apply (TEST first, then
-- production; each a founder-walked step).
-- ============================================================================

-- V1. The table exists.
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_name = 'agent_provenance_gaps';

-- V2. Columns + types (expect 9 rows, in ordinal order: id, agent_id,
--     owner_user_id, credential_ref, reason, occurred_at, retain_until,
--     correlation_id, created_at).
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'agent_provenance_gaps'
ORDER BY ordinal_position;

-- V3. Indexes (pkey, uq_apg_correlation_id, idx_apg_agent_occurred,
--     idx_apg_owner, idx_apg_credential, idx_apg_retain_until).
SELECT indexname FROM pg_indexes
WHERE schemaname = 'public' AND tablename = 'agent_provenance_gaps'
ORDER BY indexname;

-- V4. CHECK constraint (reason — exactly the four ruled values).
SELECT conname, pg_get_constraintdef(oid) AS definition
FROM pg_constraint
WHERE conrelid = 'public.agent_provenance_gaps'::regclass AND contype = 'c'
ORDER BY conname;

-- V5. The unique constraint on correlation_id (GAP 1's resolution, live).
SELECT conname, pg_get_constraintdef(oid) AS definition
FROM pg_constraint
WHERE conrelid = 'public.agent_provenance_gaps'::regclass AND contype = 'u';

-- V6. owner_user_id FK to profiles, ON DELETE CASCADE.
SELECT conname, confrelid::regclass AS references, confdeltype
FROM pg_constraint
WHERE conrelid = 'public.agent_provenance_gaps'::regclass AND contype = 'f';

-- V7. RLS enabled (expect relrowsecurity = true).
SELECT relname, relrowsecurity FROM pg_class
WHERE relname = 'agent_provenance_gaps';

-- V8. The table is genuinely empty (expect 0).
SELECT count(*) FROM public.agent_provenance_gaps;

-- V9. No signature-derived column exists (F-2's hard exclusion, checked
--     directly — expect ZERO rows; any row here is a defect).
SELECT column_name FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'agent_provenance_gaps'
  AND column_name ILIKE '%signature%';

-- ============================================================================
-- Rollback block (commented out — uncomment and run to revert).
-- ============================================================================
--
-- BEGIN;
--   DROP TABLE IF EXISTS public.agent_provenance_gaps;   -- drops indexes too
-- COMMIT;
