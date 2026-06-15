-- ============================================================
-- SageReasoning — CI-14 Unified Practice Credential (UPC): STEP 1 — additive schema
-- Run in: Supabase Dashboard → SQL Editor → New Query  (TEST first, then prod —
--   each its own 0c-ii founder-performed step; the AI does no Supabase action)
-- ============================================================
-- Implements ADR `adopted/adr/2026-06-14-credential-consolidation.md` Migration §1
-- (the CI-14 Critical build, AC7 + PR6). This is the FIRST of three additive,
-- reversible schema migrations (Step 1 additive columns; Step 2 reversible
-- backfill; Step 3 generalised unique index). It is the DARK foundation: it adds
-- columns and WIDENS the purpose CHECK, and changes NO read/write behaviour.
--
-- ADDITIVE-SAFE + IDEMPOTENT. Safe to re-run.
--
-- WHAT THIS CHANGES (plain language):
--   (a) capabilities TEXT[]          — the new multi-valued capability set that
--       REPLACES the single-valued `purpose` discriminator (authoritative going
--       forward via COALESCE(capabilities, preset_for(purpose)) in the Step-4
--       validator). NULL on every existing row until the Step-2 backfill — so
--       existing rows authorise byte-identically off their `purpose` value.
--   (b) owner_kind TEXT NOT NULL DEFAULT 'operator' — turns today's AMBIGUOUS
--       null-`owner_user_id` signal into a DECLARED invariant. Every existing row
--       gets 'operator' at column-add; the Step-2 backfill reclassifies the
--       legacy admin-minted null-owner sr_live_ rows to 'external_consumer'.
--   (c) credential_provenance jsonb  — the explicit R18f no-false-credential
--       anchor ({minted_by, basis}); NULL until a capability-aware mint sets it.
--   (d) purpose: made NULLABLE + its CHECK WIDENED (never dropped as a concept)
--       to additionally admit 'unified_practice' (the diagnostic value new UPC
--       mints will carry; capabilities stays authoritative). The widened set is a
--       STRICT SUPERSET of the live set, so every existing row remains valid.
--
-- WHAT IS NOT TOUCHED (constraint 4 — additive + reversible only):
--   * NO existing CHECK is dropped as a concept and NO index is dropped. The
--     purpose CHECK is drop-and-re-added WIDER (the sanctioned "widen" — same
--     idiom the plugin-install migration used to admit 'plugin_install'); the new
--     admissible set strictly contains the old, so it never narrows.
--   * The two load-bearing invariants — api_keys_sage_assent_write_requires_owner_and_agent
--     and api_keys_plugin_install_requires_identity — are LEFT AS-IS. (purpose
--     becoming nullable does not weaken them: their predicates are
--     `purpose != '<value>' OR ...`, and `NULL != '<value>'` is NULL → the row is
--     EXEMPT, which is correct — a null-purpose UPC row is not a legacy write/
--     install row and carries its constraints via `capabilities`, enforced in the
--     Step-4 validator, not here.)
--   * The api_keys_purpose_check evaluates to NULL (passes) for a NULL purpose;
--     the explicit `purpose IS NULL OR ...` below makes that legible.
--   * No data is migrated here (Step 2). No unique index (Step 3). No validator,
--     mint, or flag change (Steps 4–5). Behaviour is byte-identical after this.
--
-- ROLLBACK: the inverse block at the foot (DROP COLUMN / restore the narrower
-- CHECK / restore NOT NULL). Reversible because nothing reads the new columns yet.
-- ============================================================

-- ------------------------------------------------------------
-- 0. INFORMATIONAL pre-check (read-only) — TWO statements:
--   0a. existing population by purpose (the values the Step-2 backfill will map).
--       Expectation: every row carries one of the three live values; zero NULL
--       purpose (purpose is NOT NULL until §4 below).
--   0b. idempotency guard — whether the UPC columns already exist. On a FIRST run
--       0b returns zero rows; on a re-run it lists the already-added columns. Uses
--       information_schema so it works BEFORE the columns exist (a direct
--       `capabilities IS NOT NULL` 42703s on the un-migrated table — fixed
--       2026-06-15 during the prod cutover, was the original §0 form).
-- ------------------------------------------------------------
-- 0a:
SELECT
  count(*)                                              AS total_rows,
  count(*) FILTER (WHERE purpose = 'ecosystem')         AS ecosystem_rows,
  count(*) FILTER (WHERE purpose = 'sage_assent_write')  AS sage_assent_write_rows,
  count(*) FILTER (WHERE purpose = 'plugin_install')     AS plugin_install_rows,
  count(*) FILTER (WHERE purpose IS NULL)               AS null_purpose_rows
FROM public.api_keys;

-- 0b:
SELECT column_name
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'api_keys'
  AND column_name IN ('capabilities', 'owner_kind', 'credential_provenance')
ORDER BY column_name;

-- ------------------------------------------------------------
-- 1. capabilities TEXT[] — the multi-valued capability set.
--    CHECK: members ⊆ the closed vocabulary. NULL passes (legacy rows);
--    empty array passes (<@). The Step-4 validator reads
--    COALESCE(capabilities, preset_for(purpose)).
-- ------------------------------------------------------------
ALTER TABLE public.api_keys
  ADD COLUMN IF NOT EXISTS capabilities TEXT[];

-- Idempotent constraint (re)creation via DROP IF EXISTS + ADD (the phase3 idiom;
-- avoids the DO/EXCEPTION dollar-quoting some SQL-editor paste paths mishandle).
ALTER TABLE public.api_keys
  DROP CONSTRAINT IF EXISTS api_keys_capabilities_subset_check;
ALTER TABLE public.api_keys
  ADD CONSTRAINT api_keys_capabilities_subset_check
  CHECK (
    capabilities IS NULL
    OR capabilities <@ ARRAY[
         'consult', 'l1_supply', 'accreditation_write', 'calling', 'reflect'
       ]::text[]
  );

-- ------------------------------------------------------------
-- 2. owner_kind — the declared operator-vs-external-consumer invariant.
--    NOT NULL DEFAULT 'operator' fills every existing row at column-add
--    (metadata-only on PG11+, no rewrite); the Step-2 backfill reclassifies the
--    legacy admin null-owner ecosystem rows to 'external_consumer'.
-- ------------------------------------------------------------
ALTER TABLE public.api_keys
  ADD COLUMN IF NOT EXISTS owner_kind TEXT NOT NULL DEFAULT 'operator';

ALTER TABLE public.api_keys
  DROP CONSTRAINT IF EXISTS api_keys_owner_kind_check;
ALTER TABLE public.api_keys
  ADD CONSTRAINT api_keys_owner_kind_check
  CHECK (owner_kind IN ('operator', 'external_consumer'));

-- ------------------------------------------------------------
-- 3. credential_provenance jsonb — the R18f no-false-credential anchor.
--    NULL until a capability-aware mint records {minted_by, basis}.
-- ------------------------------------------------------------
ALTER TABLE public.api_keys
  ADD COLUMN IF NOT EXISTS credential_provenance jsonb;

-- ------------------------------------------------------------
-- 4. purpose — RETAIN, make nullable, WIDEN the CHECK (never drop the concept).
--    (a) Make nullable: new UPC mints carry capabilities (authoritative) and a
--        diagnostic purpose; the column must tolerate the absence of a legacy
--        value. Loosening NOT NULL is additive + reversible.
--    (b) Widen the discriminator CHECK to a STRICT SUPERSET: add the diagnostic
--        'unified_practice' value + make NULL explicitly admissible. Drop-and-
--        re-add is the only way to change a CHECK expression; the new set
--        contains the old, so no existing row is invalidated (same idiom as the
--        plugin-install migration's widen-to-add-'plugin_install').
-- ------------------------------------------------------------
ALTER TABLE public.api_keys
  ALTER COLUMN purpose DROP NOT NULL;

ALTER TABLE public.api_keys
  DROP CONSTRAINT IF EXISTS api_keys_purpose_check;
ALTER TABLE public.api_keys
  ADD CONSTRAINT api_keys_purpose_check
  CHECK (
    purpose IS NULL
    OR purpose IN ('ecosystem', 'sage_assent_write', 'plugin_install', 'unified_practice')
  );

-- ============================================================
-- 5. VERIFY — paste the output of these back to confirm the migration.
-- ============================================================

-- 5a. The three new columns present (capabilities ARRAY, owner_kind NOT NULL
--     DEFAULT 'operator', credential_provenance jsonb); purpose now NULLABLE.
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'api_keys'
  AND column_name IN ('capabilities', 'owner_kind', 'credential_provenance', 'purpose')
ORDER BY column_name;

-- 5b. The two new CHECKs + the widened purpose CHECK present.
SELECT conname, pg_get_constraintdef(oid) AS def
FROM pg_constraint
WHERE conrelid = 'public.api_keys'::regclass
  AND conname IN ('api_keys_capabilities_subset_check',
                  'api_keys_owner_kind_check',
                  'api_keys_purpose_check')
ORDER BY conname;

-- 5c. The two load-bearing invariants are UNTOUCHED (still present).
SELECT conname FROM pg_constraint
WHERE conrelid = 'public.api_keys'::regclass
  AND conname IN ('api_keys_sage_assent_write_requires_owner_and_agent',
                  'api_keys_plugin_install_requires_identity')
ORDER BY conname;

-- 5d. Every existing row defaulted to owner_kind='operator'; capabilities still
--     NULL everywhere (the Step-2 backfill populates it). Expect
--     external_consumer_rows = 0 and non_null_capabilities = 0 at this point.
SELECT
  count(*)                                                AS total_rows,
  count(*) FILTER (WHERE owner_kind = 'operator')          AS operator_rows,
  count(*) FILTER (WHERE owner_kind = 'external_consumer') AS external_consumer_rows,
  count(*) FILTER (WHERE capabilities IS NOT NULL)         AS non_null_capabilities
FROM public.api_keys;

-- ============================================================
-- INVERSE ROLLBACK (commented) — run only to undo Step 1. Reversible because
-- nothing reads capabilities / owner_kind / credential_provenance yet, and the
-- narrower purpose CHECK is restored from the live three-value set.
-- NOTE: restoring purpose NOT NULL is only safe if no UPC row with NULL purpose
-- has been minted yet (true while Step 5 is dark). If any NULL-purpose row
-- exists, backfill a value before re-adding NOT NULL.
-- ============================================================
-- ALTER TABLE public.api_keys DROP CONSTRAINT IF EXISTS api_keys_capabilities_subset_check;
-- ALTER TABLE public.api_keys DROP CONSTRAINT IF EXISTS api_keys_owner_kind_check;
-- ALTER TABLE public.api_keys DROP COLUMN IF EXISTS capabilities;
-- ALTER TABLE public.api_keys DROP COLUMN IF EXISTS owner_kind;
-- ALTER TABLE public.api_keys DROP COLUMN IF EXISTS credential_provenance;
--
-- ALTER TABLE public.api_keys DROP CONSTRAINT IF EXISTS api_keys_purpose_check;
-- ALTER TABLE public.api_keys
--   ADD CONSTRAINT api_keys_purpose_check
--   CHECK (purpose IN ('ecosystem', 'sage_assent_write', 'plugin_install'));
-- -- (only if no NULL-purpose rows exist:)
-- ALTER TABLE public.api_keys ALTER COLUMN purpose SET NOT NULL;
-- ============================================================
