-- ============================================================
-- SageReasoning — `watching_write` capability: the founder-walked api_keys CHECK
-- widening (agent-circles `watching` build, RULED QW-B 2026-08-09)
-- Run in: Supabase Dashboard → SQL Editor → New Query (TEST first, then prod —
--   each section its own founder-performed gate; the AI does no Supabase action)
-- ============================================================
-- WHY: QW-B RULED a dedicated `watching_write` capability, added to the write-class
-- set — "`fresh` computes and stores nothing; `watching` writes the durable record
-- the founder's calibration judgement reads. ... Reusing `consult` would invert the
-- house discipline that distinguishes writes precisely because they are durable."
-- (verbatim record: operations/agent-circles-2026-08/
-- 2026-08-09-mentor-consultation-watching-scope-rulings-verbatim.md).
--
-- PR20 FACT ESTABLISHED AT THIS BUILD'S OPEN (correcting the build prompt's
-- "inherits ... automatically" phrasing): adding `watching_write` to the code
-- constant WRITE_CLASS_CAPABILITIES does NOT extend the DB invariants by itself —
-- BOTH api_keys CHECKs hard-code their arrays, so TWO widenings are required here:
--
--   §V — api_keys_capabilities_subset_check (the closed vocabulary; Step-1 UPC
--        migration): without this widening, ANY mint carrying 'watching_write'
--        fails 23514 on the subset check — the capability cannot exist at all.
--   §W — api_keys_sage_assent_write_requires_owner_and_agent (the 6e §A owner+agent
--        invariant): without this widening, a watching_write credential would NOT
--        be DB-forced to carry owner+agent — the mint-time half of the write-class
--        discipline the ruling requires ("The 6e §A owner+agent invariant will
--        require owner+agent binding at mint — that [runner scoping] session
--        satisfies it.").
--
-- Both are ADDITIVE-THEN-WIDER + IDEMPOTENT + REVERSIBLE, the exact 6e idiom:
--   §V widens the ALLOWED set (strictly more values pass — no existing row can be
--     invalidated).
--   §W widens the FIRING set (the owner+agent requirement fires on MORE rows —
--     but only rows carrying 'watching_write', of which ZERO exist until the
--     runner scoping session mints one, so no existing row is invalidated; the
--     §W.PRE zero-violator check proves it on live data anyway).
--
-- WHAT THIS DOES NOT DO: mint or provision any credential (the runner scoping
-- session's carried step, per the ruling); flip any flag; touch the read-time auth
-- decision (these are MINT-TIME constraints only — no issued credential's
-- validation changes). The paired CODE change (practice-credential.ts:
-- PRACTICE_CAPABILITIES + WRITE_CLASS_CAPABILITIES gain 'watching_write') ships
-- with the same build commit; code + DB must move together or the mint
-- pre-validation and the DB CHECK diverge (the opaque-500-vs-clear-400 gap the
-- WRITE_CLASS comment warns about).
--
-- ORDER: run this AFTER the build commit is pushed (code first, then DB, then —
-- much later, at the runner scoping session — the mint). Running it before the
-- push is also safe (nothing mints watching_write until that session); the
-- code-first order is preferred so the constants and CHECKs never disagree on a
-- deployed build.
--
-- Decision log: D-WATCHING-SCOPE-RULED-2026-08-09 (QW-B);
--   D-WATCHING-BUILT-DARK-2026-08-09 (this build).
-- Risk classification: Critical under 0d-ii (auth-adjacent api_keys CHECK change;
--   founder-walked, PR17/AC7). Reversible via the inverse blocks.
-- ============================================================


-- ############################################################
-- §V — api_keys_capabilities_subset_check: widen the closed vocabulary
--      {consult, l1_supply, accreditation_write, calling, reflect}
--      → + watching_write
-- ############################################################

-- ------------------------------------------------------------
-- §V.PRE — read-only. (1) dump the live def; confirm it matches the Step-1 form
-- (five values). (2) No violator check is needed for a pure WIDENING of an
-- allowed-set (strictly more rows pass), but confirm no row already carries the
-- new value (EXPECT 0 — it could only exist if this migration already ran and a
-- mint happened, i.e. the already-applied tell).
-- ------------------------------------------------------------
SELECT conname, pg_get_constraintdef(oid) AS current_def
FROM pg_constraint
WHERE conrelid = 'public.api_keys'::regclass
  AND conname = 'api_keys_capabilities_subset_check';

SELECT id, key_prefix, capabilities, is_active
FROM public.api_keys
WHERE capabilities IS NOT NULL AND 'watching_write' = ANY(capabilities);
-- EXPECT: zero rows (nothing mints watching_write until the runner scoping session).

-- ------------------------------------------------------------
-- §V.APPLY — drop-and-re-add WIDER. Wrapped in BEGIN/COMMIT so a failed re-add
-- aborts the drop too (the vocabulary guard is never left absent). Idempotent:
-- a re-run drops the six-value constraint and re-adds the identical one.
-- ------------------------------------------------------------
BEGIN;
ALTER TABLE public.api_keys
  DROP CONSTRAINT IF EXISTS api_keys_capabilities_subset_check;

ALTER TABLE public.api_keys
  ADD CONSTRAINT api_keys_capabilities_subset_check
  CHECK (
    capabilities IS NULL
    OR capabilities <@ ARRAY[
         'consult', 'l1_supply', 'accreditation_write', 'calling', 'reflect',
         'watching_write'
       ]::text[]
  );
COMMIT;

-- ------------------------------------------------------------
-- §V.VERIFY — paste the output back. The new def names watching_write.
-- ------------------------------------------------------------
SELECT conname, pg_get_constraintdef(oid) AS new_def
FROM pg_constraint
WHERE conrelid = 'public.api_keys'::regclass
  AND conname = 'api_keys_capabilities_subset_check';

-- ------------------------------------------------------------
-- §V.INVERSE ROLLBACK (commented) — restores the five-value Step-1 form. Safe
-- ONLY while zero rows carry watching_write (the §V.PRE probe); if any exist,
-- revoke/backfill them first or the re-add fails.
-- ------------------------------------------------------------
-- BEGIN;
-- ALTER TABLE public.api_keys
--   DROP CONSTRAINT IF EXISTS api_keys_capabilities_subset_check;
-- ALTER TABLE public.api_keys
--   ADD CONSTRAINT api_keys_capabilities_subset_check
--   CHECK (
--     capabilities IS NULL
--     OR capabilities <@ ARRAY[
--          'consult', 'l1_supply', 'accreditation_write', 'calling', 'reflect'
--        ]::text[]
--   );
-- COMMIT;


-- ############################################################
-- §W — api_keys_sage_assent_write_requires_owner_and_agent: widen the 6e §A
--      write-class overlap array {accreditation_write, calling, reflect}
--      → + watching_write
-- ############################################################

-- ------------------------------------------------------------
-- §W.PRE — read-only. (1) dump the live def; confirm it matches the 6e §A form
-- (three-value overlap array). (2) ZERO-VIOLATOR pre-check: an active row the
-- WIDER predicate would newly invalidate — i.e. carrying watching_write without
-- owner+agent. EXPECT 0 (nothing mints watching_write yet; run on prod
-- IMMEDIATELY before §W.APPLY, not from a stale snapshot).
-- ------------------------------------------------------------
SELECT conname, pg_get_constraintdef(oid) AS current_def
FROM pg_constraint
WHERE conrelid = 'public.api_keys'::regclass
  AND conname = 'api_keys_sage_assent_write_requires_owner_and_agent';

SELECT id, key_prefix, purpose, capabilities, owner_user_id, agent_id, is_active
FROM public.api_keys
WHERE is_active = true
  AND COALESCE(capabilities, '{}'::text[]) && ARRAY['watching_write']::text[]
  AND (owner_user_id IS NULL OR agent_id IS NULL);
-- EXPECT: zero rows.

-- ------------------------------------------------------------
-- §W.APPLY — drop-and-re-add WIDER (the 6e §A predicate with watching_write in
-- the overlap array; every other arm byte-identical to the 6e form). Wrapped in
-- BEGIN/COMMIT so a failed re-add aborts the drop — the load-bearing invariant
-- is never left absent on a partial failure. Idempotent.
-- ------------------------------------------------------------
BEGIN;
ALTER TABLE public.api_keys
  DROP CONSTRAINT IF EXISTS api_keys_sage_assent_write_requires_owner_and_agent;

ALTER TABLE public.api_keys
  ADD CONSTRAINT api_keys_sage_assent_write_requires_owner_and_agent
  CHECK (
    (purpose IS DISTINCT FROM 'sage_assent_write'
     AND NOT (COALESCE(capabilities, '{}'::text[])
              && ARRAY['accreditation_write', 'calling', 'reflect', 'watching_write']::text[]))
    OR is_active = false
    OR (agent_id IS NOT NULL AND owner_user_id IS NOT NULL)
  );
COMMIT;

-- ------------------------------------------------------------
-- §W.VERIFY — paste the output back.
-- ------------------------------------------------------------
-- W1. The widened def is present (the overlap array now names watching_write).
SELECT conname, pg_get_constraintdef(oid) AS new_def
FROM pg_constraint
WHERE conrelid = 'public.api_keys'::regclass
  AND conname = 'api_keys_sage_assent_write_requires_owner_and_agent';

-- W2. No active row violates the widened constraint (proved by construction at
-- ADD; restated explicitly for the record). EXPECT 0.
SELECT count(*) AS violating_active_rows
FROM public.api_keys
WHERE is_active = true
  AND (purpose = 'sage_assent_write'
       OR COALESCE(capabilities, '{}'::text[])
            && ARRAY['accreditation_write', 'calling', 'reflect', 'watching_write']::text[])
  AND (owner_user_id IS NULL OR agent_id IS NULL);

-- W3. POSITIVE PROOF (TEST ONLY — DO NOT run on prod). The invariant now FIRES
-- on watching_write: a watching_write mint without owner+agent must FAIL 23514.
-- Rolled back — writes nothing. (This is the §2.10 dimension-(5) end-to-end
-- proof at the DB layer: "the 6e §A invariant genuinely fires on this capability".)
--   BEGIN;
--   INSERT INTO public.api_keys (key_hash, key_prefix, label, purpose, capabilities, is_active)
--   VALUES ('watching_probe_'||gen_random_uuid(), 'sr_prac_test', 'watching W3 probe',
--           'unified_practice', ARRAY['watching_write']::text[], true);
--   -- EXPECT: ERROR new row ... violates check constraint
--   --         "api_keys_sage_assent_write_requires_owner_and_agent"
--   ROLLBACK;

-- W3b. NEGATIVE PROOF — NO OVER-FIRE (TEST ONLY — DO NOT run on prod). A
-- consult-only UPC with null owner+agent must still PASS (the widen fires only
-- on write-class members; note §V must already be applied or this probe fails on
-- the subset check instead — that would be a §V-not-applied tell, not an over-fire).
--   BEGIN;
--   INSERT INTO public.api_keys (key_hash, key_prefix, label, purpose, capabilities, is_active)
--   VALUES ('watching_neg_'||gen_random_uuid(), 'sr_prac_test', 'watching W3b neg-exempt',
--           'unified_practice', ARRAY['consult', 'l1_supply']::text[], true);
--   -- EXPECT: INSERT 0 1 (succeeds).
--   ROLLBACK;

-- ------------------------------------------------------------
-- §W.INVERSE ROLLBACK (commented) — restores the 6e three-value overlap form.
-- Always safe: the narrower predicate is a SUBSET (it can only RELAX).
-- ------------------------------------------------------------
-- BEGIN;
-- ALTER TABLE public.api_keys
--   DROP CONSTRAINT IF EXISTS api_keys_sage_assent_write_requires_owner_and_agent;
-- ALTER TABLE public.api_keys
--   ADD CONSTRAINT api_keys_sage_assent_write_requires_owner_and_agent
--   CHECK (
--     (purpose IS DISTINCT FROM 'sage_assent_write'
--      AND NOT (COALESCE(capabilities, '{}'::text[])
--               && ARRAY['accreditation_write', 'calling', 'reflect']::text[]))
--     OR is_active = false
--     OR (agent_id IS NOT NULL AND owner_user_id IS NOT NULL)
--   );
-- COMMIT;

-- ============================================================
-- END. §V widens the capability vocabulary; §W widens the 6e §A owner+agent
-- invariant to fire on watching_write. Nothing is minted; no flag moves; the
-- runner scoping session provisions the credential (the ruling's carry-forward).
-- ============================================================
