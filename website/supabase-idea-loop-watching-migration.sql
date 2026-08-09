-- Migration: supabase-idea-loop-watching-migration
-- Purpose: `watching` — the IDEA loop's per-cycle record table + dashboard surface
--   (agent-circles, RULED 2026-08-09). TWO new tables realise the ruled §2.1 shape
--   (operations/agent-circles-2026-08/2026-08-09-watching-per-cycle-record-table-scope.md;
--   verbatim record wins: 2026-08-09-mentor-consultation-watching-scope-rulings-verbatim.md):
--
--     * idea_loop_cycles     — one row per COMPLETED cycle (the four ruled cycle-level
--         facts: outcome, cost, elapsed-vs-max, loop_id — plus mode + identity).
--     * idea_loop_candidates — one row per generated candidate, FK → its cycle row
--         ON DELETE CASCADE (Q7's full per-candidate transparency, including
--         rejected_by_guardrail candidates with heuristic attribution).
--
--   The denormalised single-table alternative was RULED set aside ("update anomalies
--   on timeout/cost fields that are only known at cycle end are a real defect").
--
-- HONESTY POSTURE (ruled §2.5): every row is the RUNNER'S SELF-REPORT of its own
--   cycle (the runner is the only party holding full cycle state; SageReasoning is
--   stateless and request-scoped per cycle). maximum_duration_ms is runner-declared
--   configuration the server can never verify — recorded as declared, disclosed as
--   such on the dashboard. Traceability (guardrail_session_id) is an AFFORDANCE, not
--   a gate — the write is never refused for missing refs. Rows never ride S10, the
--   accreditation payload, or any consult response. MEASURE-only; the record binds
--   nothing; weights-tier use blocked.
--
-- THE Q1 HARD CONSTRAINT (carried): the loop proposes; it never executes. A record
--   row DESCRIBES a completed cycle's proposals and dispositions; nothing reads
--   these tables to act, and no execution pathway is conferred.
--
-- OUTCOME VOCABULARIES (ruled §2.2 + QW-C): candidate-level SEVEN values
--   (pending | rejected_by_guardrail | rejected_by_novelty | winner | null_cycle |
--   dependency_unavailable | terminated_by_timeout — the committed six plus Q6's
--   ruled seventh); cycle-level FOUR values (winner | null_cycle |
--   dependency_unavailable | terminated_by_timeout). QW-C RULED: the timeout token
--   is `terminated_by_timeout` — the UNIFORM spelling at BOTH levels ("a CHECK
--   constraint that uses two different spellings for the same semantic concept
--   across two related tables is a latent defect"). The `pending` value is legal at
--   the DB (the CHECK carries the full ruled candidate vocabulary) but the write
--   route REJECTS it — a `pending` row must never appear in a COMPLETED cycle's
--   record (one write per completed cycle, ruled §2.3).
--
-- COST (memory `loop-billing-rpc-integer-uuid-contract`): cost_cents is INTEGER —
--   the runner aggregates from the guardrail calls' X-Loop-Cost-Cents headers + the
--   winner consult's metering; a float here repeats the 503 class the discernment
--   sibling had to fix.
--
-- IDENTITY: loop_id NOT NULL (the ruled required field — one runner instance across
--   many consults); gap_ref keeps the settled `{sessionId}:{cycleNumber}:
--   {currentCircle}->{targetCircle}` format, SEPARATE from loop_id, never composited
--   (ruled §2.6). agent_id / owner_user_id / credential_ref are stamped SERVER-SIDE
--   from the presenting watching_write credential (unforgeable), mirroring
--   collaboration_records' identity model. owner_user_id FK → profiles ON DELETE
--   CASCADE is the genuine-deletion backstop (ruled §2.7 — the collaboration_records
--   precedent, NOT the hold-observations deferred-rider posture).
--
-- IDEMPOTENCY (ruled §2.3): UNIQUE (loop_id, cycle_number) — a retried write
--   collides (23505) and the route answers a duplicate no-op, never a second row.
--
-- RETENTION + DATA RIGHTS (ruled §2.7): retain_until 90-day; wired at build into
--   /api/user/delete + /api/user/export + /api/credential/erase + the trust-core
--   retention sweep — all missing-table-benign until this migration lands (the
--   standing dark-built-table-read discipline).
--
-- DARK (ruled §2.8): both routes sit behind SUBSTRATE_WATCHING_ENABLED (UNSET
--   everywhere ⇒ honest 503, zero work). MIGRATION-BEFORE-FLAG is standing
--   discipline: apply TEST → prod BEFORE any flag flip. Activation is its own
--   founder-walked code-critical step — nothing here pre-approves it.
--
-- COMPANION MIGRATION (the founder-walked capability step, run separately):
--   supabase-api-keys-watching-write-capability-migration.sql — widens the two
--   api_keys CHECKs so the new `watching_write` capability can mint at all.
--
-- Decision log: D-WATCHING-SCOPE-RULED-2026-08-09 (the ruled scope);
--   D-WATCHING-BUILT-DARK-2026-08-09 (this build).
-- Risk classification: Critical under 0d-ii — NEW schema (founder-walked TEST →
--   prod, PR17/AC7). Idempotent + additive (CREATE ... IF NOT EXISTS); no existing
--   table altered; reversible via the rollback block.

-- ============================================================================
-- 1. idea_loop_cycles — one row per completed cycle
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.idea_loop_cycles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- The ruled required field: one runner instance across many consults (§2.6 —
  -- deliberately independent of per-consult sessionIds; never composited).
  loop_id TEXT NOT NULL,
  cycle_number INTEGER NOT NULL CHECK (cycle_number >= 0),

  -- The settled gap_ref format: {sessionId}:{cycleNumber}:{currentCircle}->{targetCircle}
  gap_ref TEXT,

  -- Cycle-level outcome — FOUR ruled values, QW-C uniform timeout token.
  cycle_outcome TEXT NOT NULL CHECK (cycle_outcome IN (
    'winner', 'null_cycle', 'dependency_unavailable', 'terminated_by_timeout'
  )),

  -- Set post-insert from the candidate row whose cycle_outcome = 'winner'
  -- (the runner cannot know the DB uuid; the route derives it). FK added below
  -- after the candidate table exists (ON DELETE SET NULL).
  winner_candidate_id UUID,

  -- The mode the cycle ran under. Transparency ONLY — the table records mode;
  -- it never computes or enforces the three-consecutive-null-cycles counter
  -- (§1 item 6 / §2.9; QW-A governs the RUNNER's counting, not any table logic).
  friction_only_mode BOOLEAN NOT NULL DEFAULT false,

  -- INTEGER cents (the loop-billing integer contract). Runner-aggregated.
  cost_cents INTEGER CHECK (cost_cents >= 0),

  -- Elapsed vs maximum: maximum_duration_ms is RUNNER-DECLARED configuration the
  -- server can never verify (option-1 config ruling) — recorded as declared,
  -- disclosed as such (§2.5).
  elapsed_ms INTEGER CHECK (elapsed_ms >= 0),
  maximum_duration_ms INTEGER CHECK (maximum_duration_ms >= 0),

  -- Identity — stamped server-side from the presenting watching_write credential.
  agent_id TEXT,
  owner_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  credential_ref TEXT,

  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- R17c: 90-day retention (the collaboration_records precedent, ruled §2.7).
  retain_until TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '90 days'),

  -- Idempotency: a retried write must not duplicate a cycle (ruled §2.3). The
  -- unique index doubles as the ruled (loop_id, cycle_number) lookup index.
  CONSTRAINT uq_ilc_loop_cycle UNIQUE (loop_id, cycle_number)
);

-- Retention sweep (hard-delete past retain_until).
CREATE INDEX IF NOT EXISTS idx_ilc_retain_until
  ON public.idea_loop_cycles (retain_until);

-- Data-rights: delete/export an operator's cycle records.
CREATE INDEX IF NOT EXISTS idx_ilc_owner
  ON public.idea_loop_cycles (owner_user_id)
  WHERE owner_user_id IS NOT NULL;

-- Consumer-erasure-by-token: delete an external consumer's records by credential.
CREATE INDEX IF NOT EXISTS idx_ilc_credential
  ON public.idea_loop_cycles (credential_ref)
  WHERE credential_ref IS NOT NULL;

-- ============================================================================
-- 2. idea_loop_candidates — one row per generated candidate (Q7 transparency)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.idea_loop_candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cycle_id UUID NOT NULL REFERENCES public.idea_loop_cycles(id) ON DELETE CASCADE,

  gap_ref TEXT,

  -- Which of the seven generation heuristics produced this candidate — the ruled
  -- heuristic attribution (Q7: refused candidates visible WITH attribution).
  heuristic TEXT NOT NULL CHECK (heuristic IN (
    'analogous_transfer', 'combinatorial_generation', 'synthesis_over_novelty',
    'context_transfer', 'fifth_circle_weighting', 'anomaly_detection',
    'friction_detection'
  )),

  -- The proposed action, full text — Q7 full transparency includes the refused
  -- proposals' text. This is the founder's operational dashboard record, NEVER
  -- served publicly (§2.5).
  proposed_action TEXT NOT NULL,

  -- Mirrors GeneratedCandidate.initialClassification (a discriminated union in
  -- the type; two columns here).
  classification_kind TEXT NOT NULL CHECK (classification_kind IN (
    'virtue_domain', 'preferred_indifferent'
  )),
  classified_domains TEXT[],

  generation_confidence NUMERIC CHECK (generation_confidence >= 0 AND generation_confidence <= 1),

  -- The ruled per-candidate guardrail result (nullable — a candidate may never
  -- have reached the guardrail; the nullable fields + CHECK vocabulary are the
  -- ruled posture for representing whatever the generation-step document ruled,
  -- including QG-A's fail-closed handling).
  guardrail_proximity TEXT CHECK (guardrail_proximity IS NULL OR guardrail_proximity IN (
    'reflexive', 'habitual', 'deliberate', 'principled', 'sage_like'
  )),
  guardrail_domains TEXT[],
  -- §2.5 traceability affordance: checkable against SageReasoning's own signed
  -- assessments + loop_billing_events rows where present; never required.
  guardrail_session_id TEXT,

  -- fresh's ruled outcome shape (§1 item 7): the boolean verdict, the check's own
  -- confidence, and the basis (carries 'insufficient_history' when fresh returned
  -- it — the exact string of fresh/handler.ts's starved-window outcome).
  passed_novelty_check BOOLEAN,
  novelty_confidence NUMERIC CHECK (novelty_confidence IS NULL OR (novelty_confidence >= 0 AND novelty_confidence <= 1)),
  novelty_basis TEXT,

  -- Candidate-level outcome — SEVEN ruled values (Q6's terminated_by_timeout the
  -- seventh; QW-C uniform spelling). `pending` is in the vocabulary but the write
  -- route rejects it in a completed cycle's record (ruled §2.2).
  cycle_outcome TEXT NOT NULL CHECK (cycle_outcome IN (
    'pending', 'rejected_by_guardrail', 'rejected_by_novelty', 'winner',
    'null_cycle', 'dependency_unavailable', 'terminated_by_timeout'
  )),

  -- Present when cycle_outcome = 'dependency_unavailable' — names which dependency
  -- was unreachable (QG-A: '/api/guardrail' for the four examination-side failure
  -- classes; the task list for a friction attempt).
  unavailable_dependency TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Read a cycle's candidates (the dashboard join).
CREATE INDEX IF NOT EXISTS idx_ilcand_cycle
  ON public.idea_loop_candidates (cycle_id);

-- The winner link (cycles → candidates), added AFTER both tables exist so the
-- migration stays ordered. ON DELETE SET NULL: deleting a cycle cascades its
-- candidates (and the cycle row itself is gone); a direct candidate delete only
-- clears the pointer. Guarded for idempotency.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'fk_ilc_winner_candidate'
      AND conrelid = 'public.idea_loop_cycles'::regclass
  ) THEN
    ALTER TABLE public.idea_loop_cycles
      ADD CONSTRAINT fk_ilc_winner_candidate
      FOREIGN KEY (winner_candidate_id)
      REFERENCES public.idea_loop_candidates(id)
      ON DELETE SET NULL;
  END IF;
END $$;

-- ============================================================================
-- 3. Row-Level Security — service-role only (both tables). The founder reads via
--    GET /api/founder/watching (FOUNDER_USER_ID Bearer JWT, server-side service
--    role); the runner writes via POST /api/practice/watching (watching_write
--    UPC, server-side service role). No direct client path.
-- ============================================================================

ALTER TABLE public.idea_loop_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.idea_loop_candidates ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.idea_loop_cycles FROM PUBLIC;
REVOKE ALL ON public.idea_loop_cycles FROM authenticated;
REVOKE ALL ON public.idea_loop_cycles FROM anon;
REVOKE ALL ON public.idea_loop_candidates FROM PUBLIC;
REVOKE ALL ON public.idea_loop_candidates FROM authenticated;
REVOKE ALL ON public.idea_loop_candidates FROM anon;

-- ============================================================================
-- 4. In-schema documentation
-- ============================================================================

COMMENT ON TABLE public.idea_loop_cycles IS
  'watching (agent-circles, RULED 2026-08-09): one row per completed IDEA-loop cycle. '
  'RUNNER-COMPOSED SELF-REPORT (disclosed on the dashboard); maximum_duration_ms is '
  'runner-declared config the server cannot verify. Records outcomes and mode; NEVER '
  'computes/enforces the fallback counter (QW-A governs the runner). No trust event; '
  'no execution pathway (Q1); never public. DARK behind SUBSTRATE_WATCHING_ENABLED. '
  'R17: 90-day retain_until + genuine deletion via /api/user/delete + '
  '/api/credential/erase + the profiles cascade + the trust-core retention sweep.';

COMMENT ON TABLE public.idea_loop_candidates IS
  'watching (Q7 full transparency): every generated candidate, INCLUDING '
  'rejected_by_guardrail, with heuristic attribution — "A founder who cannot see what '
  'the guardrail refused cannot evaluate whether the guardrail is calibrated '
  'correctly." Cascade-deleted with its cycle. Never served publicly.';

COMMENT ON COLUMN public.idea_loop_cycles.cycle_outcome IS
  'Four ruled values; QW-C: terminated_by_timeout is the uniform token at both levels.';
COMMENT ON COLUMN public.idea_loop_cycles.friction_only_mode IS
  'Records the mode only — the fallback counter is runner-owned (never table logic).';
COMMENT ON COLUMN public.idea_loop_cycles.maximum_duration_ms IS
  'Runner-declared configuration; recorded as declared, disclosed as such (§2.5).';
COMMENT ON COLUMN public.idea_loop_candidates.cycle_outcome IS
  'Seven ruled values (Q6 seventh: terminated_by_timeout). pending must never appear '
  'in a completed cycle''s record — the write route rejects it (ruled §2.2).';

-- ============================================================================
-- VERIFY — paste the output back (TEST first, then production, each its own
-- founder-walked step; migration BEFORE any flag flip).
-- ============================================================================

-- 1. Both tables exist.
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_name IN ('idea_loop_cycles', 'idea_loop_candidates')
ORDER BY table_name;

-- 2. Columns + types (expect 17 cycle columns / 15 candidate columns).
SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name IN ('idea_loop_cycles', 'idea_loop_candidates')
ORDER BY table_name, ordinal_position;

-- 3. CHECK constraints — confirm both outcome vocabularies + the uniform
--    terminated_by_timeout token at both levels (QW-C).
SELECT conrelid::regclass AS tbl, conname, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid IN ('public.idea_loop_cycles'::regclass, 'public.idea_loop_candidates'::regclass)
  AND contype = 'c'
ORDER BY 1, 2;

-- 4. FKs: candidates → cycles CASCADE; cycles.winner_candidate_id → candidates
--    SET NULL; cycles.owner_user_id → profiles CASCADE.
SELECT conrelid::regclass AS tbl, conname, confrelid::regclass AS references, confdeltype
FROM pg_constraint
WHERE conrelid IN ('public.idea_loop_cycles'::regclass, 'public.idea_loop_candidates'::regclass)
  AND contype = 'f'
ORDER BY 1, 2;

-- 5. Indexes (uq_ilc_loop_cycle, idx_ilc_retain_until, idx_ilc_owner,
--    idx_ilc_credential, idx_ilcand_cycle + the two pkeys).
SELECT tablename, indexname FROM pg_indexes
WHERE schemaname = 'public' AND tablename IN ('idea_loop_cycles', 'idea_loop_candidates')
ORDER BY tablename, indexname;

-- 6. RLS enabled on both (expect relrowsecurity = true, true).
SELECT relname, relrowsecurity FROM pg_class
WHERE relname IN ('idea_loop_cycles', 'idea_loop_candidates');

-- 7. Idempotency probe (optional, TEST only): insert the same (loop_id,
--    cycle_number) twice — the second must fail 23505 — then clean up.
-- INSERT INTO public.idea_loop_cycles (loop_id, cycle_number, cycle_outcome)
--   VALUES ('probe-loop', 0, 'null_cycle');
-- INSERT INTO public.idea_loop_cycles (loop_id, cycle_number, cycle_outcome)
--   VALUES ('probe-loop', 0, 'null_cycle');  -- expect ERROR 23505 (uq_ilc_loop_cycle)
-- DELETE FROM public.idea_loop_cycles WHERE loop_id = 'probe-loop';

-- ============================================================================
-- Rollback block (commented out — uncomment and run to revert). Flag-unset first
-- so nothing is writing, then drop (candidates first is unnecessary — dropping
-- cycles alone would fail on the candidate FK, so drop both; CASCADE order below
-- is explicit).
-- ============================================================================
--
-- BEGIN;
--   DROP TABLE IF EXISTS public.idea_loop_candidates;
--   DROP TABLE IF EXISTS public.idea_loop_cycles;
-- COMMIT;
