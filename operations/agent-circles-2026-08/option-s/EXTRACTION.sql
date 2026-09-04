-- Option S / Path A -- extract the closed run's decision-bearing candidates.
-- FOUNDER-RUN, against PRODUCTION, Supabase SQL Editor. READ-ONLY: four SELECTs,
-- no DDL, no DML.
--
-- REBUILT 2026-09-04 after PR19 review. The first version was defective in ways
-- that would NOT have errored -- it would have silently returned the wrong set:
--   * it filtered `cycle_outcome = 'selected'`, which is NOT a legal value. The
--     CHECK (supabase-idea-loop-watching-migration.sql:160-206, widened by
--     ...candidate-outcome-not-selected-migration.sql to add only 'not_selected')
--     admits: pending | rejected_by_guardrail | rejected_by_novelty | winner |
--     null_cycle | dependency_unavailable | terminated_by_timeout | not_selected.
--     The winner value is 'winner'. The old filter returned ZERO winners.
--   * it counted §PRE with two overlapping FILTERs while §3 used a UNION, so the
--     "= 29" check could pass while §3 returned a different cardinality.
--   * it queried the whole table with no run scoping, so a later run's rows
--     (incl. the documented `probe-loop` inserts) would be swept in.
--   * §4 returned every session id in the table, not the rejections' trace.
--
-- ⚠ SET-SIZE DISCREPANCY -- READ BEFORE RUNNING. The ruling says 29
-- decision-bearing (20 winners + 9 rejections). The S6 report's own outcome
-- table (2026-08-16-idea-loop-S6-report.md §2) says winner = 15, across cycles
-- 1,2,4,7,8,9,10,11,12,13,14,17,18,19,20 -- five cycles produced no winner
-- (3,5,6 dependency_unavailable; 15,16 null_cycle). 15 + 9 = 24, not 29.
-- This SQL does not resolve the conflict. §PRE settles it against production.
-- Carry whichever number production gives, and carry the discrepancy with it.

-- ---------------------------------------------------------------------------
-- §0 -- identify the run. `idea_loop_cycles.loop_id` is "one runner instance
-- across cycles" (migration:86, UNIQUE(loop_id, cycle_number) at :131).
-- Pick the closed run's loop_id and substitute it below. Do not skip this:
-- every later section is scoped by it.
-- ---------------------------------------------------------------------------
SELECT loop_id,
       count(*)            AS cycles,
       min(cycle_number)   AS first_cycle,
       max(cycle_number)   AS last_cycle,
       min(created_at)     AS started,
       max(created_at)     AS ended
FROM idea_loop_cycles
GROUP BY loop_id
ORDER BY started;
-- EXPECTED: the closed run has 20 cycles, 2026-08-16. Note its loop_id.

-- ---------------------------------------------------------------------------
-- §PRE -- the cardinality check, counted with the EXACT predicate §3 uses so
-- the check verifies the extraction rather than a different set.
-- Replace :RUN below with the §0 loop_id (quoted).
-- ---------------------------------------------------------------------------
SELECT
  count(*)                                                    AS total_candidates,
  count(*) FILTER (WHERE c.cycle_outcome = 'winner')           AS winners,
  count(*) FILTER (WHERE c.cycle_outcome = 'rejected_by_guardrail'
                      OR c.guardrail_proximity = 'reflexive')  AS rejections,
  count(*) FILTER (WHERE c.cycle_outcome = 'winner'
                      OR c.cycle_outcome = 'rejected_by_guardrail'
                      OR c.guardrail_proximity = 'reflexive')  AS decision_bearing_union,
  count(DISTINCT c.cycle_id)                                   AS cycles
FROM idea_loop_candidates c
JOIN idea_loop_cycles cy ON cy.id = c.cycle_id
WHERE cy.loop_id = :RUN;
-- `decision_bearing_union` is the number §3 will return. If winners + rejections
-- exceeds it, some row satisfies both predicates -- that overlap is the arithmetic
-- the first version got wrong. Carry `decision_bearing_union` as the true set size.
-- EXPECTED from S6: total ~120, cycles 20, winners 15, rejections 9, union 24.
--
-- ⚖ RULED 2026-09-04: THE PRODUCTION COUNT GOVERNS. The S6 report is the primary
-- record; the ruling's "20 cycle winners" "was not derived from the S6 report; it
-- appears to have been a reconstruction that did not account for the five
-- no-winner cycles." Carry whatever this query returns as the authoritative set.
--
-- ⚠ OBLIGATION IF THIS RETURNS 24: the ruling's "20 cycle winners" figure is to be
-- CORRECTED IN THE RECORD WITH A NOTE naming the discrepancy and its source --
-- explicitly "not quietly overwritten". Do NOT adopt an alternative definition of
-- decision-bearing (no-winner cycles' best candidates; not_selected rows) without
-- its own ruling: the ruling's language was "winners, not candidates".
--
-- THE NOTE MUST NAME THE MECHANISM, NOT ONLY THE CORRECTION (ruled 2026-09-05,
-- F2's addition): "the ruling's figure appears to have been a reconstruction that
-- did not account for the five no-winner cycles" -- three dependency_unavailable
-- (cycles 3, 5, 6) and two null_cycle (15, 16). Record that, so a future reader
-- understands the mechanism and not just the number.
--
-- The obligation is to be EXECUTED REGARDLESS of which number production returns.
-- The ruling expects 29. If production gives neither, STOP and reconcile.

-- ---------------------------------------------------------------------------
-- §2 -- the set, human-readable, for eyeball confirmation before extracting.
-- ---------------------------------------------------------------------------
SELECT cy.cycle_number, c.heuristic, c.cycle_outcome, c.guardrail_proximity,
       c.guardrail_session_id, length(c.proposed_action) AS action_len,
       left(c.proposed_action, 120) AS action_preview
FROM idea_loop_candidates c
JOIN idea_loop_cycles cy ON cy.id = c.cycle_id
WHERE cy.loop_id = :RUN
  AND (c.cycle_outcome IN ('winner', 'rejected_by_guardrail')
       OR c.guardrail_proximity = 'reflexive')
ORDER BY cy.cycle_number, c.heuristic;

-- ---------------------------------------------------------------------------
-- §3 -- the extraction. Copy the single returned value into
-- option-s-candidates.json -> `candidates`, and set `populated: true`.
-- `bytes` is REQUIRED by the runner's byte guard -- do not strip it.
-- ---------------------------------------------------------------------------
SELECT jsonb_pretty(jsonb_agg(row_to_json(t)::jsonb ORDER BY t.cycle_number, t.id))
FROM (
  SELECT c.id::text                     AS id,
         cy.cycle_number                AS cycle_number,
         c.heuristic                    AS heuristic,
         CASE WHEN c.cycle_outcome = 'winner' THEN 'winner'
              ELSE 'guardrail_rejection' END      AS decision_role,
         c.guardrail_proximity          AS recorded_proximity,
         c.guardrail_session_id::text   AS guardrail_session_id,
         c.proposed_action              AS text,
         octet_length(c.proposed_action) AS bytes
  FROM idea_loop_candidates c
  JOIN idea_loop_cycles cy ON cy.id = c.cycle_id
  WHERE cy.loop_id = :RUN
    AND (c.cycle_outcome IN ('winner', 'rejected_by_guardrail')
         OR c.guardrail_proximity = 'reflexive')
) t;

-- ---------------------------------------------------------------------------
-- §4 -- LIMIT 2's trace, SCOPED TO THE REJECTIONS (the first version returned
-- every session id in the table -- ~119 -- which is not the trace §7(1) names).
--
-- The 2026-08-29 classification §7(1) records the submitted-payload assumption
-- as unverified from this repo; §11.4 (NOT §9 -- §9 is superseded, see its own
-- banner) confirms it "remains open, now independently confirmed unresolvable
-- from this repo by a second party" and "still the first thing R8 should close".
-- §7(5) records that ONE of the nine (cycle 6, analogous_transfer) has no
-- session id -- hence eight, not nine.
--
-- ALSO WORTH RECONCILING: guardrail/route.ts:99-101 records that "the
-- 2026-08-29 c11 re-submission experiment wrote 10 loop_billing_events rows
-- through this route" -- i.e. a K-repeat on the c11 text may ALREADY have been
-- run. If so, that data bears directly on both L2 and this instrument's purpose
-- and should be found before spending 144+ quota units re-deriving it.
-- ---------------------------------------------------------------------------
SELECT cy.cycle_number, c.heuristic, c.guardrail_session_id
FROM idea_loop_candidates c
JOIN idea_loop_cycles cy ON cy.id = c.cycle_id
WHERE cy.loop_id = :RUN
  AND (c.cycle_outcome = 'rejected_by_guardrail'
       OR c.guardrail_proximity = 'reflexive')
ORDER BY cy.cycle_number;
