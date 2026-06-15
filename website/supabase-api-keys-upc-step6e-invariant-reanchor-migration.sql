-- ============================================================
-- SageReasoning — CI-14 Unified Practice Credential (UPC): STEP 6e — invariant re-anchor
-- Run in: Supabase Dashboard → SQL Editor → New Query  (TEST first, then prod —
--   each SECTION its own 0c-ii founder-performed gate; the AI does no Supabase action)
-- ============================================================
-- Implements ADR `adopted/adr/2026-06-14-credential-consolidation.md` Migration §6
-- (the re-anchor tail) — the deliberate "after cutover is stable" follow-up to the
-- Step-6 cutover (D-CI14-UPC-CUTOVER-STEP6-LIVE-2026-06-15). The UPC is ALREADY
-- Live and correct; this finishes the consolidation's *honesty*: the two
-- load-bearing invariant CHECKs are made to fire on the AUTHORITATIVE signal
-- (the capability / structural identity) rather than only the legacy `purpose`
-- discriminator. Today a sr_prac_ UPC carrying `accreditation_write` is forced to
-- carry owner+agent only in the VALIDATOR (practice-credential.ts), not at the DB;
-- §A makes the DB enforce it too. §B does the analogous structural re-anchor for
-- the per-install identity invariant. §C records the per-purpose-index fate
-- decision (keep-both — no DROP by default).
--
-- ADDITIVE-THEN-WIDER + IDEMPOTENT + REVERSIBLE. Each §'s new predicate is a STRICT
-- SUPERSET of the old (the sanctioned "widen" idiom the phase-3 / plugin-install /
-- Step-1 migrations all used) — it fires the owner/agent (resp. identity-triple)
-- REQUIREMENT on MORE rows, never fewer, so NO currently-VALID row is invalidated.
-- Each § is preceded by a ZERO-VIOLATOR pre-check (§*.0): if it returns any row,
-- DO NOT run the re-add — surface the row(s) to the founder (a currently-active row
-- that the wider predicate WOULD invalidate) and resolve first. Expected: zero.
--
-- TRANSITION, NOT NARROWING (ADR Migration §6 item 4 / prompt Part A item 4): the
-- new predicates accept BOTH the legacy purpose-based case AND the capability/
-- structural case. This is the safe steady state. Narrowing to capability-ONLY
-- (dropping the `purpose = '<legacy>'` arm) is a SEPARATE, later gate — NOT here.
--
-- WHAT IS NOT TOUCHED: the live UPC auth path (validatePracticeCredential), the
-- SUBSTRATE_UPC_CAPABILITY_AUTH_ENABLED flag, the R18f provenance gate, R20a, the
-- distress classifier, Layer-2 signing, the four prefixes, the per-capability
-- transport narrowing. Every issued credential keeps validating throughout. These
-- are DB CHECK constraints that fire at INSERT/UPDATE (mint) time only — they do
-- NOT participate in the read-time auth decision, so re-anchoring them cannot
-- change whether any existing credential authenticates.
--
-- HOW THE FOUNDER RUNS THIS: section by section, TEST first then prod. For each
-- section: (1) run §*.PRE (the constraint-def dump + zero-violator pre-check),
-- (2) confirm the dump matches the "EXPECTED CURRENT" comment + the pre-check is
-- zero, (3) run §*.APPLY, (4) run §*.VERIFY, (5) paste the output back. §C is a
-- DECISION (no DDL by default).
-- ============================================================


-- ############################################################
-- §A — api_keys_sage_assent_write_requires_owner_and_agent
--      Re-anchor: fire on the WRITE-CLASS capabilities
--      {accreditation_write, calling, reflect} too.
-- ############################################################
-- EXPECTED CURRENT (from supabase-api-keys-phase3-scope-rename-migration.sql:79-83;
-- left AS-IS by every UPC step):
--   CHECK (purpose <> 'sage_assent_write'
--          OR is_active = false
--          OR (agent_id IS NOT NULL AND owner_user_id IS NOT NULL))
--
-- WHY: post-cutover, write-class authority travels on the CAPABILITY set, not on
-- `purpose='sage_assent_write'`. The legacy sage_assent_write row bundled all three
-- write-class members ({accreditation_write, calling, reflect}) under one purpose,
-- and the live validator binds agent_id at AUTH time for ALL THREE (the write
-- boundary serves accreditation_write; calling + reflect reuse the same owner/agent
-- binding — CLAUDE.md write-class). So a sr_prac_ UPC carrying ANY write-class
-- capability must be DB-forced to carry owner+agent exactly as a legacy
-- sage_assent_write row is. We fire on the array-OVERLAP with the write-class set
-- (the `&&` operator) rather than membership of a single capability, so the DB
-- enforcement matches the validator's binding for every write-class member — not
-- just accreditation_write. (A consult-only / l1_supply credential is NOT
-- write-class and is correctly left exempt — it never needs owner+agent.)

-- ------------------------------------------------------------
-- §A.PRE — read-only. (1) dump the live def to confirm it matches EXPECTED CURRENT.
-- ------------------------------------------------------------
SELECT conname, pg_get_constraintdef(oid) AS current_def
FROM pg_constraint
WHERE conrelid = 'public.api_keys'::regclass
  AND conname = 'api_keys_sage_assent_write_requires_owner_and_agent';

-- §A.PRE — (2) ZERO-VIOLATOR pre-check. Active rows that the WIDER predicate would
-- newly require to have owner+agent but that LACK one — i.e. an active row carrying
-- ANY write-class capability ({accreditation_write, calling, reflect}) whose purpose
-- is NOT the legacy value and that is missing owner_user_id or agent_id. (Legacy
-- sage_assent_write rows already satisfy owner+agent under the existing constraint,
-- so they cannot appear here.) RUN THIS ON PROD IMMEDIATELY BEFORE §A.APPLY (not from
-- a stale snapshot) so any sr_prac_ write-class UPC minted since the cutover is caught.
-- EXPECT 0. A non-zero row is almost certainly a leftover ACTIVE sr_prac_ test UPC
-- minted with a write-class capability but null owner/agent — revoke it (is_active=false
-- exempts it) or backfill owner+agent BEFORE §A.APPLY.
SELECT id, key_prefix, purpose, capabilities, owner_user_id, agent_id, is_active
FROM public.api_keys
WHERE is_active = true
  AND COALESCE(capabilities, '{}'::text[])
        && ARRAY['accreditation_write', 'calling', 'reflect']::text[]
  AND purpose IS DISTINCT FROM 'sage_assent_write'
  AND (owner_user_id IS NULL OR agent_id IS NULL);
-- EXPECT: zero rows.

-- ------------------------------------------------------------
-- §A.APPLY — run ONLY after §A.PRE confirms (def matches + zero violators).
-- Drop-and-re-add WIDER (a partial-CHECK predicate cannot be altered in place).
-- The new predicate: a row is EXEMPT from the owner+agent requirement only if it is
-- NEITHER a legacy sage_assent_write row NOR a write-class-capable row (OR it is
-- revoked). NULL-handling (all three forms are TOTAL — TRUE/FALSE, never NULL — so
-- no 3VL leak from the common cases):
--   * COALESCE(capabilities,'{}') turns NULL capabilities into an empty array, and
--     '{}' && ARRAY[...] is FALSE (no overlap) — so a NULL-capabilities legacy row
--     is correctly treated as non-write-class.
--   * IS DISTINCT FROM makes a NULL purpose behave as "not the legacy value" (TRUE),
--     never NULL — so a non-write-class null-purpose row stays exempt exactly as today
--     (zero NULL-purpose rows exist on prod today; this arm is forward-looking).
--   (Caveat recorded for completeness: a capabilities array literally CONTAINING a
--    SQL NULL element — e.g. '{NULL}' — would make `&&` FALSE and thus pass; this is
--    unreachable, since every mint path + the Step-2 backfill write fixed string-
--    literal arrays. The optional §0 subset-check hardening below bars it at source.)
-- Wrapped in BEGIN/COMMIT so a failed re-add (e.g. a violator that slipped the
-- pre-check) ABORTS the drop too — the load-bearing invariant is never left absent
-- on a partial failure. The Supabase SQL Editor honours this explicit transaction
-- as-is (no competing implicit wrap). Idempotent: DROP IF EXISTS + ADD; a re-run
-- drops the wider constraint and re-adds the identical one.
-- ------------------------------------------------------------
BEGIN;
ALTER TABLE public.api_keys
  DROP CONSTRAINT IF EXISTS api_keys_sage_assent_write_requires_owner_and_agent;

ALTER TABLE public.api_keys
  ADD CONSTRAINT api_keys_sage_assent_write_requires_owner_and_agent
  CHECK (
    (purpose IS DISTINCT FROM 'sage_assent_write'
     AND NOT (COALESCE(capabilities, '{}'::text[])
              && ARRAY['accreditation_write', 'calling', 'reflect']::text[]))
    OR is_active = false
    OR (agent_id IS NOT NULL AND owner_user_id IS NOT NULL)
  );
COMMIT;

-- ------------------------------------------------------------
-- §A.VERIFY — paste the output back.
-- ------------------------------------------------------------
-- A1. The re-anchored def is present (now references the write-class capabilities).
SELECT conname, pg_get_constraintdef(oid) AS new_def
FROM pg_constraint
WHERE conrelid = 'public.api_keys'::regclass
  AND conname = 'api_keys_sage_assent_write_requires_owner_and_agent';

-- A2. No active row violates the new constraint (a constraint that was just added
-- proves this by construction — every row already satisfied it — but this restates
-- it explicitly for the record). EXPECT 0.
SELECT count(*) AS violating_active_rows
FROM public.api_keys
WHERE is_active = true
  AND (purpose = 'sage_assent_write'
       OR COALESCE(capabilities, '{}'::text[])
            && ARRAY['accreditation_write', 'calling', 'reflect']::text[])
  AND (owner_user_id IS NULL OR agent_id IS NULL);

-- A3. POSITIVE PROOF (TEST ONLY — DO NOT run on prod). Prove the constraint now
-- FIRES on a write-class capability. This INSERT must FAIL with a check_violation
-- (23514). Wrapped in a rollback so it writes nothing. On prod, skip — A1/A2 are
-- sufficient and prod must not take a deliberate constraint-violating write.
--   BEGIN;
--   INSERT INTO public.api_keys (key_hash, key_prefix, label, purpose, capabilities, is_active)
--   VALUES ('reanchor_test_'||gen_random_uuid(), 'sr_prac_test', '6e A3 probe',
--           'unified_practice', ARRAY['accreditation_write']::text[], true);
--   -- EXPECT: ERROR new row ... violates check constraint
--   --         "api_keys_sage_assent_write_requires_owner_and_agent"
--   ROLLBACK;
--   -- (A calling-only or reflect-only UPC with null owner/agent fails identically,
--   --  confirming the write-class overlap — swap capabilities to ARRAY['calling'].)

-- A3b. NEGATIVE PROOF — NO OVER-FIRE (TEST ONLY — DO NOT run on prod). Prove the
-- widen did NOT start firing on a consult-only credential: a consult/l1_supply row
-- with null owner+agent must still PASS (it is not write-class). EXPECT success.
--   BEGIN;
--   INSERT INTO public.api_keys (key_hash, key_prefix, label, purpose, capabilities, is_active)
--   VALUES ('reanchor_neg_'||gen_random_uuid(), 'sr_prac_test', '6e A3b neg-exempt',
--           'unified_practice', ARRAY['consult', 'l1_supply']::text[], true);
--   -- EXPECT: INSERT 0 1 (succeeds — a consult-only UPC is NOT owner+agent-forced).
--   ROLLBACK;

-- ------------------------------------------------------------
-- §A.INVERSE ROLLBACK (commented) — restores the narrower (purpose-only) predicate.
-- Safe to run any time: the old predicate is a SUBSET, so dropping back can only
-- RELAX the constraint — it never invalidates a row that passes the wider one.
-- ------------------------------------------------------------
-- ALTER TABLE public.api_keys
--   DROP CONSTRAINT IF EXISTS api_keys_sage_assent_write_requires_owner_and_agent;
-- ALTER TABLE public.api_keys
--   ADD CONSTRAINT api_keys_sage_assent_write_requires_owner_and_agent
--   CHECK (purpose <> 'sage_assent_write'
--          OR is_active = false
--          OR (agent_id IS NOT NULL AND owner_user_id IS NOT NULL));


-- ############################################################
-- §B — api_keys_plugin_install_requires_identity
--      Re-anchor: fire on `install_id IS NOT NULL` too (STRUCTURAL, not capability-
--      based — there is NO "install" capability in the vocabulary).
-- ############################################################
-- EXPECTED CURRENT (from supabase-api-keys-plugin-install-migration.sql:81-89;
-- left AS-IS by every UPC step):
--   CHECK (purpose <> 'plugin_install'
--          OR is_active = false
--          OR (identity_type IS NOT NULL AND install_id IS NOT NULL
--              AND install_scope IS NOT NULL))
--
-- WHY (path-check finding, prompt Part A item 2): a per-install UPC is "a credential
-- whose capabilities include {consult, l1_supply} and whose row carries a non-null
-- install_id" — it carries NO distinct capability. So the honest re-anchor keys off
-- the STRUCTURAL signal `install_id IS NOT NULL`, not a capability. NOTE the live
-- plugin-install mint (admin/plugin-install-credentials/route.ts:125) STILL sets
-- purpose='plugin_install', so the legacy arm already covers every live install row;
-- the `OR install_id IS NOT NULL` arm is FORWARD-LOOKING/DEFENSIVE (it would force
-- the identity triple onto any future UPC row that declares an install_id). Additive
-- + WIDER + reversible — it changes NOTHING about today's rows.

-- ------------------------------------------------------------
-- §B.PRE — read-only. (1) dump the live def to confirm it matches EXPECTED CURRENT.
-- ------------------------------------------------------------
SELECT conname, pg_get_constraintdef(oid) AS current_def
FROM pg_constraint
WHERE conrelid = 'public.api_keys'::regclass
  AND conname = 'api_keys_plugin_install_requires_identity';

-- §B.PRE — (2) ZERO-VIOLATOR pre-check. Active rows the WIDER predicate would newly
-- require to carry the full identity triple but that lack part of it — i.e. an
-- active, install_id-bearing row whose purpose is NOT 'plugin_install' and that is
-- missing identity_type or install_scope. (Legacy plugin_install rows already
-- satisfy the triple under the existing constraint.) EXPECT 0.
SELECT id, key_prefix, purpose, install_id, identity_type, install_scope, is_active
FROM public.api_keys
WHERE is_active = true
  AND install_id IS NOT NULL
  AND purpose IS DISTINCT FROM 'plugin_install'
  AND (identity_type IS NULL OR install_scope IS NULL);
-- EXPECT: zero rows.

-- ------------------------------------------------------------
-- §B.APPLY — run ONLY after §B.PRE confirms (def matches + zero violators).
-- A row is EXEMPT from the identity-triple requirement only if it is NEITHER a
-- legacy plugin_install row NOR carries an install_id (OR it is revoked). The
-- `install_id IS NULL` arm keeps every non-install row (purpose ecosystem /
-- unified_practice / sage_assent_write, all install_id-null) exempt exactly as today.
-- Wrapped in BEGIN/COMMIT so a failed re-add aborts the drop too — the invariant is
-- never left absent on a partial failure. Idempotent (DROP IF EXISTS + ADD).
-- ------------------------------------------------------------
BEGIN;
ALTER TABLE public.api_keys
  DROP CONSTRAINT IF EXISTS api_keys_plugin_install_requires_identity;

ALTER TABLE public.api_keys
  ADD CONSTRAINT api_keys_plugin_install_requires_identity
  CHECK (
    (purpose IS DISTINCT FROM 'plugin_install' AND install_id IS NULL)
    OR is_active = false
    OR (identity_type IS NOT NULL
        AND install_id IS NOT NULL
        AND install_scope IS NOT NULL)
  );
COMMIT;

-- ------------------------------------------------------------
-- §B.VERIFY — paste the output back.
-- ------------------------------------------------------------
-- B1. The re-anchored def is present (now references install_id structurally).
SELECT conname, pg_get_constraintdef(oid) AS new_def
FROM pg_constraint
WHERE conrelid = 'public.api_keys'::regclass
  AND conname = 'api_keys_plugin_install_requires_identity';

-- B2. No active row violates the new constraint. EXPECT 0.
SELECT count(*) AS violating_active_rows
FROM public.api_keys
WHERE is_active = true
  AND (purpose = 'plugin_install' OR install_id IS NOT NULL)
  AND (identity_type IS NULL OR install_id IS NULL OR install_scope IS NULL);

-- B3. POSITIVE PROOF (TEST ONLY — DO NOT run on prod). An install_id-bearing,
-- non-plugin_install row missing the triple must FAIL (23514). Rolled back.
--   BEGIN;
--   INSERT INTO public.api_keys (key_hash, key_prefix, label, purpose, install_id, is_active)
--   VALUES ('reanchor_test_'||gen_random_uuid(), 'sr_prac_test', '6e B3 probe',
--           'unified_practice', 'probe-install-1', true);
--   -- EXPECT: ERROR ... violates check constraint "api_keys_plugin_install_requires_identity"
--   ROLLBACK;

-- B3b. NEGATIVE PROOF — NO OVER-FIRE (TEST ONLY — DO NOT run on prod). A non-install
-- row (no install_id) with null identity columns must still PASS. EXPECT success.
--   BEGIN;
--   INSERT INTO public.api_keys (key_hash, key_prefix, label, purpose, capabilities, is_active)
--   VALUES ('reanchor_neg_'||gen_random_uuid(), 'sr_prac_test', '6e B3b neg-exempt',
--           'unified_practice', ARRAY['consult', 'l1_supply']::text[], true);
--   -- EXPECT: INSERT 0 1 (succeeds — install_id is NULL, so the identity triple is
--   --         not required; the widen did not start firing on non-install rows).
--   ROLLBACK;

-- ------------------------------------------------------------
-- §B.INVERSE ROLLBACK (commented) — restores the narrower (purpose-only) predicate.
-- ------------------------------------------------------------
-- ALTER TABLE public.api_keys
--   DROP CONSTRAINT IF EXISTS api_keys_plugin_install_requires_identity;
-- ALTER TABLE public.api_keys
--   ADD CONSTRAINT api_keys_plugin_install_requires_identity
--   CHECK (purpose <> 'plugin_install'
--          OR is_active = false
--          OR (identity_type IS NOT NULL AND install_id IS NOT NULL
--              AND install_scope IS NOT NULL));


-- ############################################################
-- §C — Per-purpose unique / lookup indexes: FATE DECISION (no DDL by default)
-- ############################################################
-- The prompt's Part A item 3 asks whether the legacy per-purpose indexes are now
-- subsumed by the generalised api_keys_upc_owner_agent_active_uniq (Step 3) and can
-- be retired. PATH-CHECK FINDING — they are NOT fully subsumed:
--
--   • api_keys_sage_assent_write_owner_agent_unique
--       ON (owner_user_id, agent_id, purpose) WHERE purpose = 'sage_assent_write'
--     is NOT is_active-partial — it spans ACTIVE *and* REVOKED rows, so it enforces
--     "at most one sage_assent_write row EVER (active or tombstone) per (owner,agent)"
--     (which is why accreditation revoke→re-mint for the same (owner,agent) 409s
--     until the tombstone is cleared — accreditation revoke is a TOMBSTONE,
--     is_active=false, not a hard delete; route.ts:247-254).
--   • api_keys_upc_owner_agent_active_uniq
--       ON (owner_user_id, agent_id) WHERE is_active = true AND both NOT NULL
--     is is_active-PARTIAL — it enforces "at most one ACTIVE row per (owner,agent)".
--
--   The new index does NOT cover the old index's active+revoked uniqueness. DROPPING
--   the old index would therefore LOOSEN behaviour (it would START permitting
--   revoke→re-mint for assent creds, matching the plugin_install one-active index) —
--   a real behaviour change, NOT required by 6e's capability-re-anchor goal.
--
-- DECISION (default): KEEP BOTH. The dual-index state is harmless (Step-3 VERIFY 2b
--   already confirmed both present) — the new index gives SR-14 "one ACTIVE credential
--   per (owner,agent)" enforcement across ALL purposes (incl. sr_prac_ UPC rows the
--   old assent index never saw); the old index additionally preserves the assent-row
--   active+revoked uniqueness the founder has operated under. NO DROP this gate.
--
-- LOOKUP indexes (the other two purpose-keyed objects) — KEEP, named here for an
--   honest record (this §C disposes of EVERY purpose-keyed index, not only the two
--   unique ones):
--     • api_keys_purpose_agent_id_idx  ON (purpose, agent_id) WHERE purpose='sage_assent_write'
--         (phase3:98-101) — a non-unique admin-listing lookup index.
--     • api_keys_plugin_install_install_id_idx  ON (install_id) WHERE purpose='plugin_install'
--         (plugin-install:96-98) — a non-unique admin-listing lookup index.
--   DISPOSITION: KEEP both as-is. They are purpose-partial LOOKUP indexes that still
--   serve admin listing/revoke of legacy-purpose rows; they are not load-bearing and
--   retiring them buys nothing until the legacy `purpose` values are themselves
--   retired (a separate later gate). No DDL.
--
-- The two OPTIONAL changes below are NOT part of the default 6e. Run EITHER only on
-- an explicit founder election, TEST first, with the recreate-block kept on file:
--
-- OPTION C1 (founder-elected): retire the legacy assent unique index, ACCEPTING the
--   looser revoke→re-mint semantic (one ACTIVE per (owner,agent), tombstones free).
--   Pre-check first (must be zero — no (owner,agent) with >1 sage_assent_write row,
--   which would block the active-only index from being the sole guard). NOTE this
--   pre-check is belt-and-braces: the Live api_keys_upc_owner_agent_active_uniq index
--   already forbids two ACTIVE rows per (owner,agent) across all purposes, so a
--   non-zero result here would itself signal a corrupt/missing UPC index rather than a
--   normal data state:
--     SELECT owner_user_id, agent_id, count(*) AS assent_rows
--     FROM public.api_keys
--     WHERE purpose = 'sage_assent_write' AND is_active = true
--       AND owner_user_id IS NOT NULL AND agent_id IS NOT NULL
--     GROUP BY owner_user_id, agent_id HAVING count(*) > 1;   -- EXPECT 0
--   Then:
--     -- DROP INDEX IF EXISTS public.api_keys_sage_assent_write_owner_agent_unique;
--   RECREATE (inverse):
--     -- CREATE UNIQUE INDEX IF NOT EXISTS api_keys_sage_assent_write_owner_agent_unique
--     --   ON public.api_keys (owner_user_id, agent_id, purpose)
--     --   WHERE purpose = 'sage_assent_write';
--
-- OPTION C2 (founder-elected, forward-looking): generalise the one-active-per-install
--   unique index from purpose-partial to install_id-structural so a future UPC-per-
--   install row (purpose='unified_practice' + install_id) is also covered. Today no
--   such row exists (the install mint still sets purpose='plugin_install'), so this is
--   YAGNI until a UPC-per-install path is built. Pre-check (must be zero):
--     SELECT install_id, count(*) AS active_rows
--     FROM public.api_keys
--     WHERE install_id IS NOT NULL AND is_active = true
--     GROUP BY install_id HAVING count(*) > 1;   -- EXPECT 0
--   Then:
--     -- DROP INDEX IF EXISTS public.api_keys_plugin_install_one_active_uniq_idx;
--     -- CREATE UNIQUE INDEX IF NOT EXISTS api_keys_install_one_active_uniq_idx
--     --   ON public.api_keys (install_id)
--     --   WHERE install_id IS NOT NULL AND is_active = true;
--   RECREATE (inverse):
--     -- DROP INDEX IF EXISTS public.api_keys_install_one_active_uniq_idx;
--     -- CREATE UNIQUE INDEX IF NOT EXISTS api_keys_plugin_install_one_active_uniq_idx
--     --   ON public.api_keys (install_id) WHERE purpose = 'plugin_install' AND is_active = true;

-- §C.RECORD — read-only snapshot of the FULL purpose-keyed index state (run on TEST
-- + prod for the close's record; all five present = the kept-both/keep-lookups default).
SELECT indexname
FROM pg_indexes
WHERE schemaname = 'public' AND tablename = 'api_keys'
  AND indexname IN ('api_keys_sage_assent_write_owner_agent_unique',  -- unique (kept)
                    'api_keys_upc_owner_agent_active_uniq',           -- unique (Step 3)
                    'api_keys_plugin_install_one_active_uniq_idx',    -- unique (kept)
                    'api_keys_purpose_agent_id_idx',                  -- lookup (kept)
                    'api_keys_plugin_install_install_id_idx')         -- lookup (kept)
ORDER BY indexname;
-- EXPECT (default): all five present.


-- ############################################################
-- §D — owner_kind / owner_user_id CONSISTENCY (OPTIONAL — founder-elected; surfaced,
--      not silently included). The single most material honesty gap in 6e's domain.
-- ############################################################
-- THE GAP (adversarial-review medium finding): ADR §3 makes `owner_kind` the declared
-- operator-vs-external invariant — owner_kind='external_consumer' ⇔ owner_user_id IS
-- NULL (Step-2 §0b/§1b establish this: null owner ⇒ external_consumer is an "exact
-- discriminator"). BUT the LEGACY sr_live_ ecosystem mint (admin/api-keys/route.ts,
-- the non-UPC branch ~:209-224) inserts NEITHER owner_user_id NOR owner_kind, so a
-- NEW legacy ecosystem mint yields owner_user_id=NULL + owner_kind='operator' (the
-- Step-1 column DEFAULT) — a row that CONTRADICTS the Step-2 invariant and is
-- un-erasable-on-request by BOTH data-rights paths (the user-JWT /api/user/delete
-- needs a profiles FK it lacks; Step-7 erase-by-token, if it keyed on owner_kind,
-- would skip it as 'operator'). owner_kind is NOT read at auth time (zero refs in
-- practice-credential.ts), so this is a DATA-RIGHTS / honesty defect, not an auth one.
--
-- HOW STEP 7 ALREADY HANDLES IT: the Step-7 erasure path keys its scope guard on
-- `owner_user_id IS NULL` (the honest "no operator account / no user-JWT path" signal),
-- NOT on owner_kind — so it erases these misclassified rows correctly REGARDLESS of the
-- owner_kind drift. §D is therefore about making the DATA honest, not about Step-7
-- correctness.
--
-- THE PAIRED CODE FIX (lands with Step 7, NOT here): the legacy ecosystem branch of
-- admin/api-keys/route.ts is changed to set owner_kind:'external_consumer' explicitly
-- (the honest default — the admin mint genuinely never knows the operator, exactly
-- Step-2's own classification of the existing population). Once that ships, NO mint
-- path produces a null-owner 'operator' row.
--
-- THE OPTIONAL CHECK (§D.APPLY) — add ONLY AFTER the paired code fix is DEPLOYED, else
-- the next legacy ecosystem mint will 23514 (a real behaviour change — that is WHY this
-- is gated, not silent). It makes the declared invariant load-bearing at the DB:
--   "owner_kind='operator' REQUIRES a non-null owner_user_id."
--
-- §D.PRE — read-only. Existing violators (EXPECT 0 — Step-2's backfill set every
-- null-owner row to external_consumer; a non-zero count means a legacy mint happened
-- since the cutover — reclassify those rows to external_consumer before §D.APPLY).
SELECT id, key_prefix, purpose, owner_user_id, owner_kind, is_active
FROM public.api_keys
WHERE owner_user_id IS NULL AND owner_kind = 'operator';
-- EXPECT: zero rows. (If non-zero: UPDATE ... SET owner_kind='external_consumer'
--   WHERE owner_user_id IS NULL AND owner_kind='operator';  -- the honest reclassify.)
--
-- §D.APPLY (commented — founder-elected, AFTER the paired code fix is live):
--   -- ALTER TABLE public.api_keys
--   --   ADD CONSTRAINT api_keys_owner_kind_requires_owner
--   --   CHECK (owner_kind <> 'operator' OR owner_user_id IS NOT NULL);
-- §D.INVERSE:
--   -- ALTER TABLE public.api_keys DROP CONSTRAINT IF EXISTS api_keys_owner_kind_requires_owner;
--
-- §D RECOMMENDATION: ship the paired code fix with Step 7 (makes the data honest going
-- forward, zero-risk additive); defer §D.APPLY to a follow-up only if the founder wants
-- the DB-level guarantee. Recording the gap here means it is NOT a surprise during Step 7.


-- ############################################################
-- §0 (OPTIONAL) — capabilities subset-check NULL-element hardening
-- ############################################################
-- The §A predicate's array-overlap (and the Step-1 api_keys_capabilities_subset_check)
-- both treat a capabilities array literally CONTAINING a SQL NULL element (e.g. the
-- raw-SQL-only value '{NULL}'::text[]) as passing — a 3VL corner the adversarial review
-- flagged. It is UNREACHABLE (every mint path + the Step-2 backfill writes fixed string-
-- literal arrays; the 21 live rows carry only literal strings or whole-array NULL), so
-- it is recorded here as OPTIONAL hardening, not a default-run step. It tightens the
-- subset-check to do what it claims (capabilities ⊆ the closed vocabulary — a NULL
-- element is not in the vocabulary). Additive-narrowing on an EMPTY violation set;
-- reversible. Pre-check (EXPECT 0) then apply:
--   SELECT id, capabilities FROM public.api_keys
--   WHERE capabilities IS NOT NULL AND array_position(capabilities, NULL) IS NOT NULL;
--   -- EXPECT 0. Then (founder-elected):
--   -- BEGIN;
--   -- ALTER TABLE public.api_keys DROP CONSTRAINT IF EXISTS api_keys_capabilities_subset_check;
--   -- ALTER TABLE public.api_keys ADD CONSTRAINT api_keys_capabilities_subset_check
--   --   CHECK (capabilities IS NULL
--   --          OR (capabilities <@ ARRAY['consult','l1_supply','accreditation_write','calling','reflect']::text[]
--   --              AND array_position(capabilities, NULL) IS NULL));
--   -- COMMIT;
-- §0.INVERSE: restore the Step-1 form (drop the array_position arm) — see
--   supabase-api-keys-upc-step1-additive-migration.sql:93-99.

-- ============================================================
-- END 6e. §A + §B re-anchor the two load-bearing invariants from the legacy
-- `purpose` discriminator to the authoritative capability / structural signal,
-- additively (transition predicate accepts BOTH) and reversibly. §C keeps the
-- per-purpose unique AND lookup indexes as-is (no DROP) — the new UPC active-index
-- already provides SR-14 enforcement; retiring the legacy indexes is a separate
-- founder election. §D (owner_kind consistency) + §0 (subset-check NULL-element
-- hardening) are OPTIONAL founder-elected follow-ups, surfaced not silent. Narrowing
-- the §A/§B predicates to capability-ONLY is a SEPARATE later gate.
-- ============================================================
