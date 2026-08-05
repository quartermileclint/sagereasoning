-- ============================================================================
-- Stoa evidence-gate cross-check (2026-08-05)
-- ============================================================================
--
-- Built per the mentor's 2026-08-05 instruction: a runnable, named query that
-- exists BEFORE the Stoa trust-flag activation session, so that if the smoke
-- test (checklist §3) passes but a question arises later, the check can be
-- run without reconstruction. Not a running monitor — a query to run on
-- demand, or to wire into a periodic job later if the founder elects to.
--
-- READ-ONLY. No side effects. Safe to run at any time, on TEST or production,
-- flag-on or flag-off (returns 0 rows either way if the gate is healthy or
-- has never fired).
--
-- WHAT IT DETECTS: the specific silent-failure mode named in the
-- pre-activation checklist (2026-08-05-stoa-trust-flag-preactivation-
-- checklist.md §4) — an agent+domain whose ENTIRE event history in
-- agent_trust_events is Stoa-sourced (event_type LIKE 'stoa-%'), meaning no
-- independent examined evidence existed for that domain at any point, but
-- whose agent_trust_state row shows the domain was folded anyway (activity
-- recorded, or the level moved off the profile prior, or a justice floor is
-- active). That combination means emitStoaGatedTrustEvents did NOT hold the
-- event as designed — it should have ledgered-but-not-folded, per the
-- 2026-08-04 mentor ruling and the D-STOA-Q5C-Q13A-BUILT-DARK-EVIDENCE-GATE-
-- FOLDED-2026-08-04 build.
--
-- The three OR conditions below mirror trust-aggregate.ts's hasEvidence
-- formula exactly (lastDomainActivityAt !== null || earnedRank !==
-- priorRank || justiceFloorActive) — this query is checking the same
-- property the public trust-record read surface checks, from the DB side.
--
-- EXPECTED RESULT ON A HEALTHY GATE: ZERO ROWS. A non-empty result is the
-- gate-failure finding this query exists to catch.
-- ============================================================================

WITH stoa_only_agent_domains AS (
  -- Every (agent_id, virtue_domain) pair where 100% of the ledger's events
  -- for that pair are Stoa-sourced — i.e. no independent (non-Stoa) trust
  -- event has EVER been recorded for this agent in this domain.
  SELECT
    agent_id,
    virtue_domain
  FROM public.agent_trust_events
  WHERE virtue_domain IS NOT NULL
  GROUP BY agent_id, virtue_domain
  HAVING bool_and(event_type LIKE 'stoa-%')
)
SELECT
  s.agent_id,
  s.virtue_domain,
  st.earned_level,
  st.profile_prior,
  st.last_domain_activity_at,
  st.justice_floor_active,
  st.updated_at
FROM stoa_only_agent_domains s
JOIN public.agent_trust_state st
  ON st.agent_id = s.agent_id
 AND st.virtue_domain = s.virtue_domain
WHERE
  st.last_domain_activity_at IS NOT NULL
  OR st.earned_level <> st.profile_prior
  OR st.justice_floor_active = true;

-- Expected: 0 rows.
--
-- If this returns any rows: the evidence gate did not hold — a domain with
-- no independent evidence at any point was nonetheless folded into the
-- public trust-state table by a Stoa event. Do not attempt to repair the
-- row in place; capture the row(s) here, unset SUBSTRATE_STOA_TRUST_EVENTS_
-- ENABLED, and bring the finding to the mentor before any further
-- activation attempt (per the checklist's §3 step-2 hard-gate instruction).
-- ============================================================================
