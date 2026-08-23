-- ============================================================================
-- SageReasoning -- idea_loop_completion_signals: the ATRF completion-signal
-- return path's persistence target (GS-ATRF-3; mentor rulings 2026-08-23,
-- Q-C1 / Q-C2a / Q-C3 / Q-C4 -- verbatim record wins:
-- operations/agent-circles-2026-08/2026-08-23-mentor-rulings-atrf-sixteen-questions-verbatim.md)
-- Run in: Supabase Dashboard -> SQL Editor -> New Query (TEST first, then prod --
--   each section its own founder-performed gate; the AI does no Supabase action)
-- ============================================================================
-- WHY A NEW TABLE RATHER THAN COLUMNS ON idea_loop_candidates.
--
-- Q-C1 left this to the build session, verbatim: "The persistence target is the
-- watching table -- a new row type, or a new column set on the existing
-- candidate row, to be determined at the build session based on the schema these
-- rulings produce." This is the first option: a new row type in the watching
-- family.
--
-- The deciding reason is IDENTITY HONESTY, not convenience. Every candidate row
-- inherits its cycle's identity columns, which are stamped server-side from the
-- RUNNER's credential precisely so the record is unforgeable. A completion
-- signal's identity is the AGENT's -- Q-C1: "The agent, post-execution. The
-- agent is the only actor with access to post-execution evidence of whether
-- genuine examination occurred. No other actor can supply this signal honestly."
-- Putting agent-authored columns on a runner-stamped row would leave a single
-- row whose identity columns describe one actor while some of its columns
-- describe another, with nothing on the row to say which is which.
--
-- Two further consequences of the same fact, which the column option would also
-- have had to solve: the candidate row is written by an INSERT-only path that is
-- idempotent on (loop_id, cycle_number) and never updated, so an agent-side
-- write would have introduced the table's first UPDATE path; and the signal
-- arrives at a different moment, so a per-cycle atomic write could not carry it.
--
-- RETENTION AND DATA RIGHTS -- deliberately NO retain_until on this table.
--   The row's lifetime is its cycle's. cycle_id is NOT NULL with ON DELETE
--   CASCADE, so every existing deletion path that reaches idea_loop_cycles
--   already reaches this table with no new mechanism: /api/user/delete (owner),
--   /api/credential/erase (credential), and purgeExpiredWatching (the
--   retain_until sweep on the cycle). §5 VERIFIES that cascade by query rather
--   than assuming it.
--   PR24 IS THEREFORE NOT ENGAGED: PR24 binds on a table DECLARING retain_until,
--   and this table declares none (the same reading that corrected the
--   stoa_entries case on 2026-08-17). A retain_until here would create a second,
--   independent expiry clock over the same evidence -- two clocks, one record.
--   The AGENT-credential erase path is the one case the cascade does NOT cover
--   (it deletes by the CYCLE's credential_ref, which is the runner's), so a
--   dedicated agent-credential delete is wired in code alongside it.
--
-- WHAT THIS MIGRATION DOES NOT DO: mint or provision any credential; flip any
-- flag; touch idea_loop_cycles or idea_loop_candidates; write any trust event;
-- create any read path other than the data-rights export. Receipt triggers the
-- write ONLY -- Q-C1: "Receipt does not trigger a flag, a dashboard update, or
-- any downstream action at this stage." The dashboard surfacing of the persisted
-- signal belongs to the standing-runner design session, not here.
--
-- THE Q1 HARD CONSTRAINT IS UNTOUCHED. The loop proposes; it never executes.
-- This table RECEIVES a report from an agent that already acted on its own; no
-- code path reads it to cause an action.
--
-- Decision log: D-MENTOR-RULINGS-ATRF-SIXTEEN-ADOPTED-EXECUTED-2026-08-23;
--   this migration's own record is appended at the founder-walked close.
-- Risk classification: Critical under 0d-ii (new table + a new credentialed
--   write path; founder-walked 0c-ii, PR17/AC7). Reversible via §INVERSE.
-- ============================================================================


-- ############################################################
-- §PRE -- read-only
-- ############################################################
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_name = 'idea_loop_completion_signals';
-- EXPECT: 0 rows (the table does not exist yet).

SELECT count(*) AS cycles, count(*) FILTER (WHERE winner_candidate_id IS NOT NULL) AS winner_cycles
FROM public.idea_loop_cycles;
-- RECORD both. This migration must leave them IDENTICAL (§VERIFY re-reads).


-- ############################################################
-- §APPLY
-- ############################################################
BEGIN;

CREATE TABLE IF NOT EXISTS public.idea_loop_completion_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- The cycle whose elected idea was executed. NOT NULL + CASCADE is what makes
  -- retention and data rights free (see the header). A signal for a cycle that
  -- was never recorded has nothing to attach to and is refused at the route with
  -- an honest 409 -- a disclosed limitation, not a silent orphan.
  cycle_id UUID NOT NULL REFERENCES public.idea_loop_cycles(id) ON DELETE CASCADE,

  -- Echoed from the request for auditability. Q-C1 names loop_id as what the
  -- signal carries; cycle_number is required alongside it because loop_id ALONE
  -- IS NOT A CYCLE IDENTIFIER in this schema -- idea_loop_cycles' own uniqueness
  -- is (loop_id, cycle_number). Recorded as a build-session finding, not a
  -- reinterpretation of the ruling.
  loop_id TEXT NOT NULL,
  cycle_number INTEGER NOT NULL CHECK (cycle_number >= 0),

  -- ── Q-C2a: the examination content, three questions IN SEQUENCE ───────────
  -- (1) "What impression did the agent assent to when it elected this idea?"
  impression_assented_to TEXT NOT NULL,
  -- (2) "Was that assent examined or merely habitual?"
  assent_quality TEXT NOT NULL CHECK (assent_quality IN ('examined', 'habitual')),
  -- (3) "Did the examination reach the threshold at which the action can be
  --      characterised as a katorthoma rather than a mere kathekon?"
  --      NULL exactly when refuse_to_attest is true (enforced below).
  threshold_reached TEXT CHECK (threshold_reached IS NULL
                                OR threshold_reached IN ('katorthoma', 'kathekon')),

  -- ── Q-C3: the refuse-to-attest branch. RULED REQUIRED -- "a design
  --    constraint, named in the completion signal's schema, not left to the
  --    build session to discover." NOT NULL: an absent branch is not a
  --    refusal-shaped default, it is a malformed signal.
  --
  --    What the signal CAN honestly carry: "the agent's own examination record
  --    -- what impression was examined, what assent was given, what the
  --    examination's epistemic basis was." What it CANNOT: "a verdict on whether
  --    the examination was just in the dikaiosyne sense, because that verdict
  --    requires access to the agent's interior state that the architecture
  --    declines to trust."
  --
  --    *** THERE IS NO JUSTICE-VERDICT COLUMN ON THIS TABLE, AND THAT IS THE
  --    POINT. Do not add one. ***
  refuse_to_attest BOOLEAN NOT NULL,
  refusal_reason TEXT,

  -- ── Q-A1 entry structure x Q-C4 constraints ──────────────────────────────
  -- Uniform in FORM ({provenance, credence}), with honest per-proposition
  -- constraints. The DB CHECKs enforce the VOCABULARY; the route enforces the
  -- per-proposition constraint (inference for the examination record; inference
  -- with credence constrained for an attested threshold; unknown on the refuse
  -- branch), so a dishonest combination gets a clear named 400 rather than an
  -- opaque 23514.
  examination_record_provenance TEXT NOT NULL
    CHECK (examination_record_provenance IN ('observation','inference','assumption','unknown')),
  examination_record_credence TEXT NOT NULL
    CHECK (examination_record_credence IN ('established','probably-true','unknown','probably-false')),
  threshold_provenance TEXT NOT NULL
    CHECK (threshold_provenance IN ('observation','inference','assumption','unknown')),
  threshold_credence TEXT NOT NULL
    CHECK (threshold_credence IN ('established','probably-true','unknown','probably-false')),

  -- ── Identity: stamped SERVER-SIDE from the presenting completion_signal_write
  --    credential. NEVER caller-supplied. This is the AGENT's identity and is
  --    deliberately independent of the cycle row's (the RUNNER's).
  agent_id TEXT,
  owner_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  credential_ref TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- The one structural coherence rule worth a DB CHECK (as opposed to the
  -- route-level ones): the refuse branch and the threshold answer are mutually
  -- exclusive by construction. A row asserting both, or neither, is not a
  -- degraded record -- it is an incoherent one.
  CONSTRAINT idea_loop_completion_signals_refusal_coherence CHECK (
    (refuse_to_attest = true  AND threshold_reached IS NULL)
    OR
    (refuse_to_attest = false AND threshold_reached IS NOT NULL)
  )
);

-- ONE completion signal per cycle: one elected idea, one executing agent, one
-- report. A retry collides 23505 and the route answers an honest duplicate
-- no-op -- the same idempotency posture as the sibling per-cycle write, realised
-- on this table's own key.
CREATE UNIQUE INDEX IF NOT EXISTS uq_ilcs_cycle
  ON public.idea_loop_completion_signals (cycle_id);

CREATE INDEX IF NOT EXISTS idx_ilcs_credential
  ON public.idea_loop_completion_signals (credential_ref)
  WHERE credential_ref IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_ilcs_owner
  ON public.idea_loop_completion_signals (owner_user_id)
  WHERE owner_user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_ilcs_loop
  ON public.idea_loop_completion_signals (loop_id, cycle_number);

-- ── RLS: service-role only, identical posture to both sibling watching tables.
--    The agent writes via POST /api/practice/completion-signal (a
--    completion_signal_write UPC, server-side service role). No direct client
--    path exists, and the REVOKEs below are what make that true rather than
--    merely intended -- the lesson of the 2026-08-16 lockdown wave, where
--    policies named "service role full access" were written without a TO clause
--    over grants that were never revoked.
ALTER TABLE public.idea_loop_completion_signals ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.idea_loop_completion_signals FROM PUBLIC;
REVOKE ALL ON public.idea_loop_completion_signals FROM authenticated;
REVOKE ALL ON public.idea_loop_completion_signals FROM anon;

COMMIT;


-- ############################################################
-- §COMMENTS (safe to re-run)
-- ############################################################
BEGIN;

COMMENT ON TABLE public.idea_loop_completion_signals IS
  'ATRF completion signal (GS-ATRF-3, RULED 2026-08-23 Q-C1..Q-C4). One row per '
  'cycle whose elected idea was executed, reported BY THE AGENT post-execution '
  '-- the only actor with access to post-execution evidence of whether genuine '
  'examination occurred. Identity is stamped server-side from the agent''s own '
  'completion_signal_write credential and is deliberately INDEPENDENT of the '
  'cycle row''s runner identity. Receipt triggers the write ONLY -- no flag, no '
  'dashboard update, no downstream action; dashboard surfacing belongs to the '
  'standing-runner design session. No trust event is ever written from here. '
  'The Q1 hard constraint is untouched: nothing reads this table to act. '
  'Retention + data rights ride the cycle FK CASCADE (no retain_until here, '
  'deliberately -- one record, one clock).';

COMMENT ON COLUMN public.idea_loop_completion_signals.loop_id IS
  'Echoed from the request. Q-C1 names loop_id as what the signal carries; '
  'cycle_number is required alongside because loop_id alone is NOT a cycle '
  'identifier in this schema (idea_loop_cycles is unique on the PAIR). A '
  'build-session finding, recorded rather than papered over.';

COMMENT ON COLUMN public.idea_loop_completion_signals.assent_quality IS
  'Q-C2a question 2 -- "Was that assent examined or merely habitual?" This is an '
  'EPISTEMIC THRESHOLD CHECK, NOT A MOTIVATIONAL-STATE CHECK: it does not ask '
  'whether the agent WANTED to complete the task (boulesis). Boulesis present '
  'and sufficiency reached are separate fields, never collapsed.';

COMMENT ON COLUMN public.idea_loop_completion_signals.refuse_to_attest IS
  'Q-C3, RULED REQUIRED -- a design constraint, not a design choice. The signal '
  'carries the agent''s own examination RECORD; it can never carry a verdict on '
  'whether that examination was just in the dikaiosyne sense, because that '
  'verdict needs interior state the architecture declines to trust. The floor '
  'pattern that fired on exactly this class of claim in cycle 6 is deliberately '
  'UNDIAGNOSED -- both readings stand -- and under either reading the honest '
  'posture is the same: the instrument does not attest beyond its measurement '
  'basis. NOT NULL because an absent branch is a malformed signal, not a '
  'refusal-shaped default. THERE IS NO JUSTICE-VERDICT COLUMN ON THIS TABLE.';

COMMENT ON COLUMN public.idea_loop_completion_signals.threshold_provenance IS
  'Q-C4. Attested: inference (the agent INFERS the threshold from the examination '
  'record; it does not directly observe whether the threshold was reached), with '
  'credence constrained to the honest floor probably-true. Refused: unknown -- '
  '"The agent cannot determine the provenance of an assessment it cannot make." '
  'Enforced at the route so a dishonest combination returns a named 400.';

COMMIT;


-- ############################################################
-- §VERIFY -- run on BOTH environments after §APPLY
-- ############################################################

-- V1 -- the table and its columns.
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'idea_loop_completion_signals'
ORDER BY ordinal_position;
-- EXPECT: 17 columns. refuse_to_attest NOT NULL boolean; threshold_reached
-- nullable; all four provenance/credence columns NOT NULL text.
-- (INDEPENDENT-REVIEW FINDING 2026-08-23, MEDIUM, folded: this comment read
-- '16' -- enumerate the CREATE TABLE body and it is 17. A wrong EXPECT teaches
-- either false-STOP on a correct migration or, worse, silent acceptance of a
-- future genuine column-count drift on this exact line.)

-- V2 -- the CHECK constraints, including the refusal-coherence rule.
SELECT conname, pg_get_constraintdef(oid) AS def
FROM pg_constraint
WHERE conrelid = 'public.idea_loop_completion_signals'::regclass AND contype = 'c'
ORDER BY conname;
-- EXPECT: the refusal-coherence constraint plus the vocabulary CHECKs.

-- V3 -- the indexes.
SELECT indexname FROM pg_indexes
WHERE schemaname = 'public' AND tablename = 'idea_loop_completion_signals'
ORDER BY indexname;
-- EXPECT: the PK, uq_ilcs_cycle, idx_ilcs_credential, idx_ilcs_loop, idx_ilcs_owner.

-- V4 -- RLS on, and NO grant to anon/authenticated/PUBLIC.
SELECT rowsecurity FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'idea_loop_completion_signals';
-- EXPECT: true.

SELECT grantee, privilege_type FROM information_schema.role_table_grants
WHERE table_schema = 'public' AND table_name = 'idea_loop_completion_signals'
  AND grantee IN ('anon', 'authenticated', 'PUBLIC')
ORDER BY grantee, privilege_type;
-- EXPECT: 0 rows.

-- V5 -- the FK that carries retention and data rights. This is the load-bearing
-- check: it is WHY the table needs no retain_until of its own.
SELECT conname, confdeltype, pg_get_constraintdef(oid) AS def
FROM pg_constraint
WHERE conrelid = 'public.idea_loop_completion_signals'::regclass AND contype = 'f'
ORDER BY conname;
-- EXPECT: cycle_id -> idea_loop_cycles(id) with confdeltype = 'c' (CASCADE);
--         owner_user_id -> profiles(id) with confdeltype = 'c'.

-- V6 -- the sibling tables are untouched.
SELECT count(*) AS cycles, count(*) FILTER (WHERE winner_candidate_id IS NOT NULL) AS winner_cycles
FROM public.idea_loop_cycles;
-- EXPECT: IDENTICAL to §PRE.

-- V7 (TEST ONLY -- DO NOT RUN ON PRODUCTION) -- behavioural proof that the
-- coherence CHECK fires. BOTH must fail with 23514. If either SUCCEEDS the
-- constraint is not doing its job -- STOP.
--
-- PRECONDITION, run FIRST (INDEPENDENT-REVIEW FINDING 2026-08-23, MEDIUM,
-- folded): both probes below source cycle_id from
-- `(SELECT id FROM public.idea_loop_cycles LIMIT 1)`. The bounded validation
-- run wrote its cycles to PRODUCTION, not TEST, so idea_loop_cycles may well be
-- EMPTY on TEST. An empty result makes the subquery NULL, and cycle_id UUID
-- NOT NULL then fires 23502 BEFORE the coherence CHECK is ever evaluated -- an
-- error appears, and it proves NOTHING. Confirm a row exists before probing:
--   SELECT count(*) FROM public.idea_loop_cycles;   -- must be >= 1
--   -- if 0, insert a throwaway cycle first, and remove it after both probes:
--   -- INSERT INTO public.idea_loop_cycles (loop_id, cycle_number, cycle_outcome)
--   --   VALUES ('v7-probe', 0, 'null_cycle');
--   -- ... run (i) and (ii) below ...
--   -- DELETE FROM public.idea_loop_cycles WHERE loop_id = 'v7-probe';
--
--   -- (i) refusing while still answering the threshold question:
--   INSERT INTO public.idea_loop_completion_signals
--     (cycle_id, loop_id, cycle_number, impression_assented_to, assent_quality,
--      threshold_reached, refuse_to_attest, examination_record_provenance,
--      examination_record_credence, threshold_provenance, threshold_credence)
--   VALUES ((SELECT id FROM public.idea_loop_cycles LIMIT 1), 'probe', 0, 'probe',
--           'examined', 'katorthoma', true, 'inference', 'probably-true',
--           'unknown', 'unknown');
--   -- (ii) attesting while leaving the threshold unanswered:
--   INSERT INTO public.idea_loop_completion_signals
--     (cycle_id, loop_id, cycle_number, impression_assented_to, assent_quality,
--      threshold_reached, refuse_to_attest, examination_record_provenance,
--      examination_record_credence, threshold_provenance, threshold_credence)
--   VALUES ((SELECT id FROM public.idea_loop_cycles LIMIT 1), 'probe', 0, 'probe',
--           'examined', NULL, false, 'inference', 'probably-true',
--           'inference', 'probably-true');
-- EXPECT (both): ERROR 23514 ... "idea_loop_completion_signals_refusal_coherence"

-- V8 (TEST ONLY) -- behavioural proof that the cascade actually deletes, which
-- is the entire basis for this table carrying no retain_until. Insert one valid
-- signal against a throwaway cycle, delete the CYCLE, confirm the signal is gone.
-- Run it, then confirm the count returns to its starting value.


-- ############################################################
-- §INVERSE -- fully reversible; the table is new and nothing else references it.
-- ############################################################
-- BEGIN;
-- DROP TABLE IF EXISTS public.idea_loop_completion_signals;
-- COMMIT;
