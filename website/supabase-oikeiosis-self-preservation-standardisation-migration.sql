-- ============================================================
-- SageReasoning — standardise `self_preservation` as the canonical
-- innermost-circle spelling across the reflect/human-tool family
-- (mentor ruling C15, 2026-08-12 — coexistence, not convergence; Q4:
-- "self_preservation" is the canonical underlying vocabulary for this
-- family, "self" may remain a display label only).
-- Run in: Supabase Dashboard -> SQL Editor -> New Query (TEST first, then
--   prod -- each section its own founder-performed gate; the AI does no
--   Supabase action).
-- ============================================================
-- WHY: the reflect/human-tool family (sage-reflect/engine.ts, stoic-brain.ts,
-- sage-mentor/persona.ts, and their DB-backed consumers) already, correctly,
-- spells the innermost circle `self_preservation`. Two tables built later
-- (oikeiosis_reflections -- the quarterly diagnostic; circle_extension_entries
-- -- the #6/#15 circle-extension practice) independently spelled it `self`
-- instead, an ordinary implementation drift, not a doctrinal choice (see
-- operations/agent-circles-2026-08/2026-08-12-c15-oikeiosis-circle-
-- enumeration-scoping.md §2b). This migration widens both tables' CHECK
-- constraints to accept BOTH spellings (additive, no existing row can be
-- invalidated), so application code can start writing `self_preservation`
-- immediately while any already-written `self` row (verified: NONE exist in
-- either table, in either environment, as of 2026-08-12 -- see this
-- migration's own §PRE queries below) remains valid.
--
-- WHAT THIS DOES NOT DO: touch the engine vocabulary (layer1-extractor.ts and
-- everything downstream -- local_community/political_community/cosmopolis is
-- untouched, per the ruling); narrow either CHECK (this is add-only); force a
-- backfill (moot here -- zero rows use `self` in either table); touch any
-- other table in the reflect/human-tool family (sage_reflect_sessions and the
-- two v3 baseline/assessment tables already, correctly, use
-- `self_preservation` and are not touched).
--
-- ORDER: this migration FIRST (backward-compatible superset, breaks nothing),
-- then the code change (route.ts VALID_STAGES / extension/route.ts CIRCLES +
-- the two display-page request-body values) ships on the next deploy. The
-- reverse order would let the route accept a value the database still
-- rejects -- a 500 on write, not a clean 400.
--
-- Decision log: D-C15-DOCTRINAL-SPLIT-FOLLOW-ON-EXECUTED-2026-08-12.
-- Risk classification: Elevated under 0d-ii (schema change to a table
-- carrying real production rows -- oikeiosis_reflections; additive-only,
-- reversible; circle_extension_entries carries zero rows in either
-- environment as of this writing but is included for vocabulary
-- consistency). AC7 not engaged (no auth/credential/encryption/R20a/flag
-- surface touched).
-- ============================================================


-- ############################################################
-- SECTION 1 -- widen oikeiosis_reflections.stage's CHECK
-- ############################################################

-- ------------------------------------------------------------
-- §1.PRE -- read-only. Get the CHECK's actual (Postgres-assigned) name and
-- current definition -- the original migration left this CHECK inline/
-- unnamed, so Postgres auto-generated a name we must look up rather than
-- guess. Also confirm no row already carries 'self_preservation' (EXPECT 0),
-- and confirm no row carries 'self' either (EXPECT 0 as of 2026-08-12 --
-- verified via the app's service-role client immediately before authoring
-- this file: the two live production rows read 'household' and 'humanity').
-- If either count is non-zero when you run this, STOP and re-derive before
-- proceeding -- the premise this file was written against no longer holds.
-- ------------------------------------------------------------
SELECT conname, pg_get_constraintdef(oid) AS current_def
FROM pg_constraint
WHERE conrelid = 'public.oikeiosis_reflections'::regclass
  AND contype = 'c'
  AND pg_get_constraintdef(oid) LIKE '%stage%';

SELECT count(*) AS already_self_preservation
FROM public.oikeiosis_reflections
WHERE stage = 'self_preservation';
-- EXPECT: 0.

SELECT count(*) AS currently_self
FROM public.oikeiosis_reflections
WHERE stage = 'self';
-- EXPECT: 0 (confirmed at authoring time; re-confirm live before applying).

-- ------------------------------------------------------------
-- §1.APPLY -- drop the old (unnamed-but-now-known) CHECK, add the widened
-- one under an EXPLICIT name so any future widening can reference it
-- directly.
--
-- >>> BEFORE RUNNING: replace <CONNAME_FROM_1_PRE> below with the conname
-- the §1.PRE query returned. Do not guess it. <<<
-- ------------------------------------------------------------
BEGIN;

ALTER TABLE public.oikeiosis_reflections
  DROP CONSTRAINT <CONNAME_FROM_1_PRE>;

ALTER TABLE public.oikeiosis_reflections
  ADD CONSTRAINT oikeiosis_reflections_stage_check
  CHECK (stage IN ('self', 'self_preservation', 'household', 'community', 'humanity', 'cosmic'));

COMMIT;

-- ------------------------------------------------------------
-- §1.VERIFY -- confirm the new CHECK is live and accepts the sixth value.
-- ------------------------------------------------------------
SELECT conname, pg_get_constraintdef(oid) AS new_def
FROM pg_constraint
WHERE conrelid = 'public.oikeiosis_reflections'::regclass
  AND conname = 'oikeiosis_reflections_stage_check';
-- EXPECT: new_def lists all six values including 'self_preservation'.

-- ------------------------------------------------------------
-- §1.INVERSE (reversible only while no row carries 'self_preservation' --
-- re-run the §1.PRE 'already_self_preservation' count first; once the
-- application deploys writing 'self_preservation', this inverse is no
-- longer safe to run without a prior backfill decision).
-- ------------------------------------------------------------
-- BEGIN;
-- ALTER TABLE public.oikeiosis_reflections
--   DROP CONSTRAINT oikeiosis_reflections_stage_check;
-- ALTER TABLE public.oikeiosis_reflections
--   ADD CONSTRAINT oikeiosis_reflections_stage_check
--   CHECK (stage IN ('self', 'household', 'community', 'humanity', 'cosmic'));
-- COMMIT;


-- ############################################################
-- SECTION 2 -- widen circle_extension_entries's two CHECKs
-- (current_circle, extended_circle). This table carries ZERO rows in either
-- TEST or production as of 2026-08-12 (verified immediately before authoring
-- this file), so this section is lower-risk than Section 1, but follows the
-- identical widen-first discipline for consistency and because a row could
-- exist by the time this migration is actually run.
-- ############################################################

-- ------------------------------------------------------------
-- §2.PRE -- read-only. Get both CHECKs' actual names; confirm zero rows use
-- either spelling of the innermost circle (both counts EXPECT 0, but if
-- 'currently_self' is non-zero, treat exactly as §1.PRE instructs).
-- ------------------------------------------------------------
SELECT conname, pg_get_constraintdef(oid) AS current_def
FROM pg_constraint
WHERE conrelid = 'public.circle_extension_entries'::regclass
  AND contype = 'c'
  AND (pg_get_constraintdef(oid) LIKE '%current_circle%'
       OR pg_get_constraintdef(oid) LIKE '%extended_circle%');

SELECT
  count(*) FILTER (WHERE current_circle = 'self' OR extended_circle = 'self') AS currently_self,
  count(*) FILTER (WHERE current_circle = 'self_preservation' OR extended_circle = 'self_preservation') AS already_self_preservation
FROM public.circle_extension_entries;
-- EXPECT: both 0.

-- ------------------------------------------------------------
-- §2.APPLY -- drop both old (unnamed-but-now-known) CHECKs, add widened ones
-- under explicit names.
--
-- >>> BEFORE RUNNING: replace <CONNAME_CURRENT_FROM_2_PRE> and
-- <CONNAME_EXTENDED_FROM_2_PRE> below with the two connames the §2.PRE query
-- returned. Do not guess them. <<<
-- ------------------------------------------------------------
BEGIN;

ALTER TABLE public.circle_extension_entries
  DROP CONSTRAINT <CONNAME_CURRENT_FROM_2_PRE>;
ALTER TABLE public.circle_extension_entries
  ADD CONSTRAINT circle_extension_entries_current_circle_check
  CHECK (current_circle IN ('self', 'self_preservation', 'household', 'community', 'humanity', 'cosmic'));

ALTER TABLE public.circle_extension_entries
  DROP CONSTRAINT <CONNAME_EXTENDED_FROM_2_PRE>;
ALTER TABLE public.circle_extension_entries
  ADD CONSTRAINT circle_extension_entries_extended_circle_check
  CHECK (extended_circle IN ('self', 'self_preservation', 'household', 'community', 'humanity', 'cosmic'));

COMMIT;

-- ------------------------------------------------------------
-- §2.VERIFY
-- ------------------------------------------------------------
SELECT conname, pg_get_constraintdef(oid) AS new_def
FROM pg_constraint
WHERE conrelid = 'public.circle_extension_entries'::regclass
  AND conname IN ('circle_extension_entries_current_circle_check', 'circle_extension_entries_extended_circle_check');
-- EXPECT: both list all six values including 'self_preservation'.

-- ------------------------------------------------------------
-- §2.INVERSE (reversible while both counts above stay 0)
-- ------------------------------------------------------------
-- BEGIN;
-- ALTER TABLE public.circle_extension_entries
--   DROP CONSTRAINT circle_extension_entries_current_circle_check;
-- ALTER TABLE public.circle_extension_entries
--   ADD CONSTRAINT circle_extension_entries_current_circle_check
--   CHECK (current_circle IN ('self', 'household', 'community', 'humanity', 'cosmic'));
--
-- ALTER TABLE public.circle_extension_entries
--   DROP CONSTRAINT circle_extension_entries_extended_circle_check;
-- ALTER TABLE public.circle_extension_entries
--   ADD CONSTRAINT circle_extension_entries_extended_circle_check
--   CHECK (extended_circle IN ('self', 'household', 'community', 'humanity', 'cosmic'));
-- COMMIT;
