-- ============================================================
-- SageReasoning — `not_selected` candidate outcome: the founder-walked
-- api_keys-style CHECK widening on `idea_loop_candidates` (bounded validation
-- run, ruled 2026-08-10 mid-run — the runner's blocking spec:
-- PROJECTS/idea-loop-validation-run/NOT-SELECTED-CHANGE-SPEC.md).
-- Run in: Supabase Dashboard -> SQL Editor -> New Query (TEST first, then prod --
--   each section its own founder-performed gate; the AI does no Supabase action)
-- ============================================================
-- WHY: the candidate-level CHECK on `idea_loop_candidates.cycle_outcome`
-- (supabase-idea-loop-watching-migration.sql, inline/unnamed) enumerates seven
-- values. It has no representation for "passed guardrail filtering, passed the
-- novelty check, was not the highest-proximity survivor" -- the ORDINARY outcome
-- for every non-winner candidate in a winner cycle. Cycle 1 of the bounded
-- validation run hit exactly this: five real candidates with no honest value to
-- write, forcing the runner to disclose a workaround (D-4: recorded as
-- null_cycle, which is not what happened) rather than fabricate a match. The
-- runner correctly stopped before cycle 2 rather than keep writing the same
-- wrong value.
--
-- WHAT THIS DOES NOT DO: touch the cycle-level CHECK (idea_loop_cycles stays at
-- its ruled four values -- winner | null_cycle | dependency_unavailable |
-- terminated_by_timeout, UNCHANGED); touch the winner-consistency validation in
-- the route handler (it references only 'winner', untouched by this addition);
-- mint or provision any credential; flip any flag. Additive-only -- a strict
-- superset of the current CHECK, so no existing row can be invalidated (proven
-- by a zero-violator check below, though none could exist by construction: no
-- row has ever been able to carry a value the CHECK didn't already permit).
--
-- ORDER: this migration FIRST (backward-compatible superset, breaks nothing),
-- then the code change (handler.ts CANDIDATE_LEVEL_OUTCOMES + the battery pin)
-- ships on the next deploy. The reverse order would let the handler accept a
-- value the database still rejects -- a 500 on write, not a clean 400.
--
-- Decision log: D-RUNNER-SCOPING-SESSION-COMPLETE-2026-08-10 (the arc this run
--   continues); this migration's own record is appended at the founder-walked
--   close of this step.
-- Risk classification: Elevated under 0d-ii (schema change to an existing table
--   carrying real production rows; additive-only, reversible). AC7 not engaged
--   (no auth/credential/encryption/R20a/flag-activation surface touched).
-- ============================================================


-- ############################################################
-- SECTION 1 -- widen idea_loop_candidates.cycle_outcome's CHECK
-- ############################################################

-- ------------------------------------------------------------
-- §1.PRE -- read-only. Get the CHECK's actual (Postgres-assigned) name and
-- current definition -- the original migration left this CHECK inline/unnamed,
-- so Postgres auto-generated a name we must look up rather than guess.
-- Also confirm no row already carries 'not_selected' (EXPECT 0 -- it could only
-- exist if this migration already ran and a write happened since).
-- ------------------------------------------------------------
SELECT conname, pg_get_constraintdef(oid) AS current_def
FROM pg_constraint
WHERE conrelid = 'public.idea_loop_candidates'::regclass
  AND contype = 'c'
  AND pg_get_constraintdef(oid) LIKE '%cycle_outcome%';

SELECT count(*) AS already_present
FROM public.idea_loop_candidates
WHERE cycle_outcome = 'not_selected';
-- EXPECT: already_present = 0.

-- ------------------------------------------------------------
-- §1.APPLY -- drop the old (unnamed-but-now-known) CHECK, add the widened one
-- under an EXPLICIT name so any future widening can reference it directly
-- (the lesson from this exact migration's own §1.PRE step -- an inline CHECK
-- forces a lookup every time; naming it here ends that for future changes).
--
-- >>> BEFORE RUNNING: replace <CONNAME_FROM_PRE> below with the conname the
-- §1.PRE query returned. Do not guess it. <<<
-- ------------------------------------------------------------
BEGIN;

ALTER TABLE public.idea_loop_candidates
  DROP CONSTRAINT <CONNAME_FROM_PRE>;

ALTER TABLE public.idea_loop_candidates
  ADD CONSTRAINT idea_loop_candidates_cycle_outcome_check
  CHECK (cycle_outcome IN (
    'pending', 'rejected_by_guardrail', 'rejected_by_novelty', 'winner',
    'null_cycle', 'dependency_unavailable', 'terminated_by_timeout',
    'not_selected'
  ));

COMMIT;

-- ------------------------------------------------------------
-- §1.VERIFY -- confirm the new CHECK is live and accepts the eighth value.
-- ------------------------------------------------------------
SELECT conname, pg_get_constraintdef(oid) AS new_def
FROM pg_constraint
WHERE conrelid = 'public.idea_loop_candidates'::regclass
  AND conname = 'idea_loop_candidates_cycle_outcome_check';
-- EXPECT: new_def lists all eight values including 'not_selected'.

-- ------------------------------------------------------------
-- §1.INVERSE -- reversible at any time (narrows back to the seven-value form;
-- SAFE ONLY IF no row carries 'not_selected' -- re-run the §1.PRE count first).
-- ------------------------------------------------------------
-- BEGIN;
-- ALTER TABLE public.idea_loop_candidates
--   DROP CONSTRAINT idea_loop_candidates_cycle_outcome_check;
-- ALTER TABLE public.idea_loop_candidates
--   ADD CONSTRAINT idea_loop_candidates_cycle_outcome_check
--   CHECK (cycle_outcome IN (
--     'pending', 'rejected_by_guardrail', 'rejected_by_novelty', 'winner',
--     'null_cycle', 'dependency_unavailable', 'terminated_by_timeout'
--   ));
-- COMMIT;


-- ############################################################
-- SECTION 2 -- cycle 1 back-correction (run AFTER §1 lands on the SAME
-- environment, and only after independently confirming the five rows below
-- still read exactly as expected -- see the founder-side verification step
-- before this file is used for anything more than a dry read).
-- ############################################################

-- ------------------------------------------------------------
-- §2.PRE -- read-only. Confirm the five candidate rows the runner's spec
-- names, before touching anything.
-- ------------------------------------------------------------
SELECT id, heuristic, cycle_outcome, passed_novelty_check, novelty_confidence,
       guardrail_proximity
FROM public.idea_loop_candidates
WHERE cycle_id = 'a9ead994-7183-4020-ab44-44175ba945e6'
ORDER BY heuristic;
-- EXPECT: 6 rows total. analogous_transfer -> cycle_outcome = 'winner'
-- (unchanged by this correction). The other five --
-- combinatorial_generation, synthesis_over_novelty, context_transfer,
-- fifth_circle_weighting, friction_detection -- currently 'null_cycle', each
-- with passed_novelty_check = true, novelty_confidence = 0,
-- guardrail_proximity = 'deliberate'. If ANY of these five values differs
-- from that, STOP -- do not run §2.APPLY -- the spec's premise doesn't hold
-- for this row and the correction must be re-derived, not applied blind.

-- ------------------------------------------------------------
-- §2.APPLY -- run ONLY after §1 has landed on this SAME environment (prod)
-- and §2.PRE confirms the five rows read as expected.
-- ------------------------------------------------------------
-- UPDATE public.idea_loop_candidates
-- SET cycle_outcome = 'not_selected'
-- WHERE cycle_id = 'a9ead994-7183-4020-ab44-44175ba945e6'
--   AND heuristic <> 'analogous_transfer';

-- ------------------------------------------------------------
-- §2.VERIFY
-- ------------------------------------------------------------
-- SELECT heuristic, cycle_outcome FROM public.idea_loop_candidates
-- WHERE cycle_id = 'a9ead994-7183-4020-ab44-44175ba945e6' ORDER BY heuristic;
-- EXPECT: analogous_transfer = 'winner'; the other five = 'not_selected'.

-- ------------------------------------------------------------
-- §2.INVERSE (only meaningful before any further writes touch these five rows)
-- ------------------------------------------------------------
-- UPDATE public.idea_loop_candidates
-- SET cycle_outcome = 'null_cycle'
-- WHERE cycle_id = 'a9ead994-7183-4020-ab44-44175ba945e6'
--   AND heuristic <> 'analogous_transfer';
