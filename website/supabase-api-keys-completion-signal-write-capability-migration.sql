-- ============================================================================
-- SageReasoning -- `completion_signal_write` capability: the founder-walked
-- api_keys CHECK widening for the ATRF completion-signal return path
-- (GS-ATRF-3; mentor rulings 2026-08-23, Q-C1/Q-C2a/Q-C3/Q-C4).
-- Run in: Supabase Dashboard -> SQL Editor -> New Query (TEST first, then prod --
--   each section its own founder-performed gate; the AI does no Supabase action)
-- ============================================================================
-- WHY A DEDICATED CAPABILITY, and why NOT reuse watching_write.
--
-- The ruling did not name a capability -- it named an ACTOR, and the actor is
-- the reason. Q-C1, verbatim:
--
--   "Actor: The agent, post-execution. The agent is the only actor with access
--    to post-execution evidence of whether genuine examination occurred. No
--    other actor can supply this signal honestly."
--
-- `watching_write` is the RUNNER's capability: the per-cycle record route stamps
-- agent_id / owner_user_id / credential_ref server-side from the presenting
-- credential precisely so the record's identity is unforgeable. If the
-- completion signal rode the same capability, the runner's own credential could
-- post a signal asserting the quality of the AGENT's examination -- collapsing
-- exactly the actor distinction the ruling turns on, and doing it silently,
-- because the server would have no way to tell the two apart.
--
-- The house precedent is the same shape and was decided the same way (QW-B,
-- 2026-08-09, on `watching` vs `consult`): "Reusing consult would invert the
-- house discipline that distinguishes writes precisely because they are
-- durable." A dedicated capability is what makes the actor separation
-- ENFORCEABLE AT MINT rather than merely documented.
--
-- FOUNDER-ELECTED at the build session's open, with the cost stated: this
-- migration is the cost -- a THIRD founder-walked SQL step in the sitting.
--
-- PR20 FACT ESTABLISHED AT THIS BUILD'S OPEN (do not skip either section):
-- adding `completion_signal_write` to the code constants does NOT extend the DB
-- invariants by itself -- BOTH api_keys CHECKs hard-code their arrays, so TWO
-- widenings are required:
--
--   §V -- api_keys_capabilities_subset_check (the closed vocabulary): without
--        this widening, ANY mint carrying 'completion_signal_write' fails 23514
--        on the subset check -- the capability cannot exist at all.
--   §W -- api_keys_sage_assent_write_requires_owner_and_agent (the 6e §A
--        owner+agent invariant): without this widening, a completion-signal
--        credential would NOT be DB-forced to carry owner+agent -- the mint-time
--        half of the write-class discipline. A durable, agent-attributed record
--        write carries the full write-class discipline, exactly as watching_write
--        does.
--
-- Both are ADDITIVE-THEN-WIDER + IDEMPOTENT + REVERSIBLE, the 6e idiom:
--   §V widens the ALLOWED set (strictly more values pass -- no existing row can
--     be invalidated).
--   §W widens the FIRING set (the owner+agent requirement fires on MORE rows --
--     but only rows carrying 'completion_signal_write', of which ZERO exist
--     until a credential is minted; the §W.PRE zero-violator check proves it on
--     live data anyway).
--
-- WHAT THIS DOES NOT DO: mint or provision any credential (its own later step);
-- flip any flag; touch the read-time auth decision (these are MINT-TIME
-- constraints only -- no issued credential's validation changes). The paired
-- CODE change (practice-credential.ts: PRACTICE_CAPABILITIES +
-- WRITE_CLASS_CAPABILITIES gain 'completion_signal_write') ships with the same
-- build commit; code + DB must move together or the mint pre-validation and the
-- DB CHECK diverge (the opaque-500-vs-clear-400 gap).
--
-- ORDER: safe in either order relative to the push -- nothing mints
-- completion_signal_write until a later, separate step. Code-first is preferred
-- so the constants and CHECKs never disagree on a deployed build.
--
-- Decision log: D-MENTOR-RULINGS-ATRF-SIXTEEN-ADOPTED-EXECUTED-2026-08-23 (the
--   rulings); this migration's own record is appended at the founder-walked close.
-- Risk classification: Critical under 0d-ii (auth-adjacent api_keys CHECK change;
--   founder-walked, PR17/AC7). Reversible via the inverse blocks.
-- ============================================================================


-- ############################################################
-- §V -- api_keys_capabilities_subset_check: widen the closed vocabulary
--      {consult, l1_supply, accreditation_write, calling, reflect,
--       watching_write}  ->  + completion_signal_write
-- ############################################################

-- ------------------------------------------------------------
-- §V.PRE -- read-only. (1) dump the live def; confirm it matches the SIX-value
-- form (i.e. the watching_write widening has already landed on this
-- environment -- if it shows FIVE values, STOP: that migration has not been
-- applied here and this one must not jump ahead of it).
-- (2) confirm no row already carries the new value (EXPECT 0 -- it could only
-- exist if this migration already ran and a mint happened).
-- ------------------------------------------------------------
SELECT conname, pg_get_constraintdef(oid) AS current_def
FROM pg_constraint
WHERE conrelid = 'public.api_keys'::regclass
  AND conname = 'api_keys_capabilities_subset_check';
-- EXPECT current_def to name exactly: consult, l1_supply, accreditation_write,
-- calling, reflect, watching_write.

SELECT id, key_prefix, capabilities, is_active
FROM public.api_keys
WHERE capabilities IS NOT NULL AND 'completion_signal_write' = ANY(capabilities);
-- EXPECT: zero rows.

-- ------------------------------------------------------------
-- §V.APPLY -- drop-and-re-add WIDER, wrapped so a failed re-add aborts the drop
-- (the vocabulary guard is never left absent). Idempotent.
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
         'watching_write', 'completion_signal_write'
       ]::text[]
  );
COMMIT;

-- ------------------------------------------------------------
-- §V.VERIFY
-- ------------------------------------------------------------
SELECT conname, pg_get_constraintdef(oid) AS new_def
FROM pg_constraint
WHERE conrelid = 'public.api_keys'::regclass
  AND conname = 'api_keys_capabilities_subset_check';
-- EXPECT: new_def names all SEVEN values including completion_signal_write.

-- ------------------------------------------------------------
-- §V.INVERSE (commented) -- restores the six-value form. Safe ONLY while zero
-- rows carry completion_signal_write (re-run the §V.PRE probe first).
-- ------------------------------------------------------------
-- BEGIN;
-- ALTER TABLE public.api_keys
--   DROP CONSTRAINT IF EXISTS api_keys_capabilities_subset_check;
-- ALTER TABLE public.api_keys
--   ADD CONSTRAINT api_keys_capabilities_subset_check
--   CHECK (
--     capabilities IS NULL
--     OR capabilities <@ ARRAY[
--          'consult', 'l1_supply', 'accreditation_write', 'calling', 'reflect',
--          'watching_write'
--        ]::text[]
--   );
-- COMMIT;


-- ############################################################
-- §W -- api_keys_sage_assent_write_requires_owner_and_agent: widen the 6e §A
--      write-class overlap array
--      {accreditation_write, calling, reflect, watching_write}
--      -> + completion_signal_write
-- ############################################################

-- ------------------------------------------------------------
-- §W.PRE -- read-only. (1) dump the live def; confirm it matches the
-- FOUR-value overlap form. (2) ZERO-VIOLATOR pre-check: an active row the WIDER
-- predicate would newly invalidate -- i.e. carrying completion_signal_write
-- without owner+agent. EXPECT 0. Run on prod IMMEDIATELY before §W.APPLY, not
-- from a stale snapshot.
-- ------------------------------------------------------------
SELECT conname, pg_get_constraintdef(oid) AS current_def
FROM pg_constraint
WHERE conrelid = 'public.api_keys'::regclass
  AND conname = 'api_keys_sage_assent_write_requires_owner_and_agent';
-- EXPECT current_def's overlap array to name exactly: accreditation_write,
-- calling, reflect, watching_write.

SELECT id, key_prefix, purpose, capabilities, owner_user_id, agent_id, is_active
FROM public.api_keys
WHERE is_active = true
  AND COALESCE(capabilities, '{}'::text[]) && ARRAY['completion_signal_write']::text[]
  AND (owner_user_id IS NULL OR agent_id IS NULL);
-- EXPECT: zero rows.

-- ------------------------------------------------------------
-- §W.APPLY -- drop-and-re-add WIDER. Every arm byte-identical to the current
-- form except the overlap array. Wrapped so a failed re-add aborts the drop --
-- the load-bearing invariant is never left absent on a partial failure.
-- ------------------------------------------------------------
BEGIN;
ALTER TABLE public.api_keys
  DROP CONSTRAINT IF EXISTS api_keys_sage_assent_write_requires_owner_and_agent;

ALTER TABLE public.api_keys
  ADD CONSTRAINT api_keys_sage_assent_write_requires_owner_and_agent
  CHECK (
    (purpose IS DISTINCT FROM 'sage_assent_write'
     AND NOT (COALESCE(capabilities, '{}'::text[])
              && ARRAY['accreditation_write', 'calling', 'reflect',
                       'watching_write', 'completion_signal_write']::text[]))
    OR is_active = false
    OR (agent_id IS NOT NULL AND owner_user_id IS NOT NULL)
  );
COMMIT;

-- ------------------------------------------------------------
-- §W.VERIFY
-- ------------------------------------------------------------
SELECT conname, pg_get_constraintdef(oid) AS new_def
FROM pg_constraint
WHERE conrelid = 'public.api_keys'::regclass
  AND conname = 'api_keys_sage_assent_write_requires_owner_and_agent';
-- EXPECT: new_def's overlap array names all FIVE write-class capabilities.

-- W2. No active row violates the widened constraint (proved by construction at
-- ADD; restated explicitly for the record, per the watching-write precedent).
-- EXPECT 0.
SELECT count(*) AS violating_active_rows
FROM public.api_keys
WHERE is_active = true
  AND (purpose = 'sage_assent_write'
       OR COALESCE(capabilities, '{}'::text[])
            && ARRAY['accreditation_write', 'calling', 'reflect', 'watching_write',
                     'completion_signal_write']::text[])
  AND (owner_user_id IS NULL OR agent_id IS NULL);

-- §W.VERIFY-BEHAVIOURAL — POSITIVE PROOF (TEST ONLY -- DO NOT RUN ON PRODUCTION).
-- Proves the widened invariant actually FIRES rather than merely existing.
--
-- INDEPENDENT-REVIEW FINDING (2026-08-23, HIGH, folded): the original probe
-- here omitted `label`, which api-keys-schema.sql declares NOT NULL. Postgres
-- runs its NOT NULL check BEFORE any CHECK constraint, so the omitted-label
-- version failed 23502 before the widened invariant was ever evaluated --
-- the founder would have seen an error, believed it proved the fix, and
-- proven NOTHING about the single most auth-sensitive change in this sitting.
-- This form mirrors the watching-write precedent's W3 exactly (label supplied,
-- a fresh key_hash via gen_random_uuid() so a re-run never hits the UNIQUE
-- constraint on key_hash first, and BEGIN/ROLLBACK so it writes nothing even
-- on the success path this probe is designed NOT to reach).
--   BEGIN;
--   INSERT INTO public.api_keys (key_hash, key_prefix, label, purpose, capabilities, is_active)
--   VALUES ('completion_probe_'||gen_random_uuid(), 'sr_prac_test',
--           'completion_signal W-probe', 'unified_practice',
--           ARRAY['completion_signal_write']::text[], true);
--   -- EXPECT: ERROR new row ... violates check constraint
--   --         "api_keys_sage_assent_write_requires_owner_and_agent"
--   ROLLBACK;

-- §W.VERIFY-BEHAVIOURAL -- NEGATIVE PROOF, NO OVER-FIRE (TEST ONLY -- DO NOT
-- RUN ON PRODUCTION). A consult-only UPC with null owner+agent must still
-- PASS -- the widen fires only on write-class members. (Note: §V must already
-- be applied or this probe fails on the subset check instead -- that is a
-- §V-not-applied tell, not an over-fire.)
--   BEGIN;
--   INSERT INTO public.api_keys (key_hash, key_prefix, label, purpose, capabilities, is_active)
--   VALUES ('completion_neg_'||gen_random_uuid(), 'sr_prac_test',
--           'completion_signal W-probe neg-exempt', 'unified_practice',
--           ARRAY['consult', 'l1_supply']::text[], true);
--   -- EXPECT: INSERT 0 1 (succeeds).
--   ROLLBACK;

-- ------------------------------------------------------------
-- §W.INVERSE (commented) -- restores the four-value overlap form.
-- ------------------------------------------------------------
-- BEGIN;
-- ALTER TABLE public.api_keys
--   DROP CONSTRAINT IF EXISTS api_keys_sage_assent_write_requires_owner_and_agent;
-- ALTER TABLE public.api_keys
--   ADD CONSTRAINT api_keys_sage_assent_write_requires_owner_and_agent
--   CHECK (
--     (purpose IS DISTINCT FROM 'sage_assent_write'
--      AND NOT (COALESCE(capabilities, '{}'::text[])
--               && ARRAY['accreditation_write', 'calling', 'reflect',
--                        'watching_write']::text[]))
--     OR is_active = false
--     OR (agent_id IS NOT NULL AND owner_user_id IS NOT NULL)
--   );
-- COMMIT;
