-- ============================================================
-- SageReasoning — CI-14 Unified Practice Credential (UPC): STEP 2 — reversible backfill
-- Run in: Supabase Dashboard → SQL Editor → New Query  (TEST first, then prod —
--   each its own 0c-ii founder-performed step; the AI does no Supabase action)
-- ============================================================
-- Implements ADR `adopted/adr/2026-06-14-credential-consolidation.md` Migration §2.
-- PRE-REQUISITE: Step 1 (the additive columns + widened purpose CHECK) is applied
-- on this environment. RUN §0 (dry-run report) FIRST and review before §1.
--
-- ADDITIVE-SAFE + IDEMPOTENT + REVERSIBLE. Safe to re-run (the WHERE guards skip
-- already-filled rows + never clobber an explicitly-minted UPC row).
--
-- WHAT THIS CHANGES (plain language): it derives `capabilities` from the legacy
-- `purpose` discriminator on existing rows (so they read back as their exact
-- legacy authorisation via the Step-4 COALESCE) and sets `owner_kind` from the
-- presence of `owner_user_id`. NO read/write behaviour changes (the Step-4
-- validator is dark behind SUBSTRATE_UPC_CAPABILITY_AUTH_ENABLED).
--
-- CAPABILITY MAPPING (ADR §2 / Migration §2):
--   'ecosystem'        → {consult, l1_supply}   ← l1_supply, NOT bare {consult}:
--                          bare would 403 these keys' L1 supply and RESTATE FX-3.
--   'plugin_install'   → {consult, l1_supply}
--   'sage_assent_write'→ {accreditation_write, calling, reflect}  ← encodes the
--                          already-shipped unscoped calling/reflect reuse (SR-14).
--   (NULL / 'unified_practice' purpose rows are skipped — a UPC mint sets
--    capabilities explicitly; the `capabilities IS NULL` guard protects them.)
--
-- OWNER_KIND CLASSIFICATION (ADR §3):
--   owner_user_id IS NULL  → 'external_consumer'  (the legacy admin /api/admin/api-keys
--                            mint never set an owner; a genuinely third-party
--                            consumer, governed by retain_until + the sweep, R17c).
--   owner_user_id present   → 'operator'           (self-service /api/keys, admin
--                            plugin-install + accreditation mints all set the owner;
--                            ride the user-JWT data-rights + cascade).
--   Rationale verified at path-check: among the live mint routes, only
--   /api/admin/api-keys (ecosystem) omits owner_user_id; every other route sets it,
--   and the load-bearing invariants force owner_user_id on active write/install
--   rows. So `owner_user_id IS NULL` is an exact discriminator for external_consumer.
--
-- THE sr_live_-OWNER BACKFILL (M6/M7 follow-up (a)) is SUBSUMED, NOT retroactive:
--   existing null-owner admin rows stay external_consumer (the honest default — R3:
--   never mis-promote an external row to an operator). Going FORWARD, the Step-5
--   mint sets owner_user_id only on an EXACT single owner_email→profiles match.
--   §0c below is the conflict report that proves that forward logic is safe.
-- ============================================================

-- ============================================================
-- 0. DRY-RUN REPORT — read-only. RUN THIS FIRST and review with the founder
--    BEFORE running §1. Nothing below §0 is written until §1.
-- ============================================================

-- 0a. The capabilities backfill plan: how many rows each mapping will fill
--     (only rows with capabilities currently NULL are touched).
SELECT
  purpose,
  count(*)                                          AS rows_total,
  count(*) FILTER (WHERE capabilities IS NULL)      AS rows_to_fill,
  count(*) FILTER (WHERE capabilities IS NOT NULL)  AS already_filled
FROM public.api_keys
GROUP BY purpose
ORDER BY purpose;

-- 0b. The owner_kind classification plan.
SELECT
  count(*) FILTER (WHERE owner_user_id IS NULL)      AS will_be_external_consumer,
  count(*) FILTER (WHERE owner_user_id IS NOT NULL)  AS will_be_operator,
  count(*) FILTER (WHERE owner_user_id IS NULL AND purpose <> 'ecosystem') AS unexpected_null_owner_non_ecosystem
FROM public.api_keys;
-- EXPECT unexpected_null_owner_non_ecosystem = 0 (only legacy admin ecosystem rows
-- are null-owner). A non-zero count is an R3 hazard — STOP and review before §1.

-- 0c. FORWARD-PROMOTION SAFETY (for the Step-5 mint, recorded here): for each
--     owner_email on a null-owner row, how many profiles it matches (case-normalised).
--     matching_profiles > 1  → a NON-PROMOTABLE conflict: the Step-5 mint must leave
--     owner_user_id NULL (external) for this email; never pick an arbitrary profile.
SELECT
  lower(trim(k.owner_email))           AS norm_owner_email,
  count(DISTINCT p.id)                 AS matching_profiles
FROM public.api_keys k
LEFT JOIN public.profiles p
  ON lower(trim(p.email)) = lower(trim(k.owner_email))
WHERE k.owner_user_id IS NULL
  AND k.owner_email IS NOT NULL
  AND k.owner_email <> ''
GROUP BY lower(trim(k.owner_email))
ORDER BY matching_profiles DESC, norm_owner_email;

-- ============================================================
-- 1. BACKFILL — run only AFTER §0 is reviewed. Idempotent + reversible.
-- ============================================================

-- 1a. capabilities from purpose (only where currently NULL).
UPDATE public.api_keys
  SET capabilities = ARRAY['consult', 'l1_supply']::text[]
  WHERE purpose = 'ecosystem' AND capabilities IS NULL;

UPDATE public.api_keys
  SET capabilities = ARRAY['consult', 'l1_supply']::text[]
  WHERE purpose = 'plugin_install' AND capabilities IS NULL;

UPDATE public.api_keys
  SET capabilities = ARRAY['accreditation_write', 'calling', 'reflect']::text[]
  WHERE purpose = 'sage_assent_write' AND capabilities IS NULL;

-- 1b. owner_kind from owner presence (external_consumer for the ownerless rows).
UPDATE public.api_keys
  SET owner_kind = 'external_consumer'
  WHERE owner_user_id IS NULL AND owner_kind <> 'external_consumer';

-- (owner-bearing rows already carry the Step-1 default 'operator'; no write needed.)

-- ============================================================
-- 2. VERIFY — paste the output of these back to confirm the backfill.
-- ============================================================

-- 2a. Every legacy row now has a capability set matching its legacy authorisation;
--     no legacy-purpose row is left with NULL capabilities.
SELECT
  purpose,
  capabilities,
  owner_kind,
  count(*) AS rows
FROM public.api_keys
GROUP BY purpose, capabilities, owner_kind
ORDER BY purpose, owner_kind;

-- 2b. The FX-3 closure check for the backfilled population: every consult-capable
--     row also carries l1_supply (zero rows have consult without l1_supply).
SELECT count(*) AS consult_without_l1_supply
FROM public.api_keys
WHERE 'consult' = ANY(capabilities)
  AND NOT ('l1_supply' = ANY(capabilities));
-- EXPECT 0.

-- 2c. No legacy-purpose row left unmapped (capabilities still NULL on a row whose
--     purpose is one of the three legacy values).
SELECT count(*) AS unmapped_legacy_rows
FROM public.api_keys
WHERE purpose IN ('ecosystem', 'sage_assent_write', 'plugin_install')
  AND capabilities IS NULL;
-- EXPECT 0.

-- 2d. owner_kind fully classified (no NULL — column is NOT NULL — and the two
--     classes partition the table by owner presence).
SELECT
  owner_kind,
  count(*)                                          AS rows,
  count(*) FILTER (WHERE owner_user_id IS NULL)     AS with_null_owner,
  count(*) FILTER (WHERE owner_user_id IS NOT NULL) AS with_owner
FROM public.api_keys
GROUP BY owner_kind
ORDER BY owner_kind;
-- EXPECT: external_consumer rows all have_null_owner; operator rows all with_owner.

-- ============================================================
-- INVERSE ROLLBACK (commented) — run only to undo Step 2. Reversible because
-- nothing reads capabilities / owner_kind yet (Step 4 is dark). This re-NULLs the
-- backfilled columns (back to the Step-1 post-add state); Step 1's columns remain.
-- ============================================================
-- UPDATE public.api_keys SET capabilities = NULL
--   WHERE purpose IN ('ecosystem', 'sage_assent_write', 'plugin_install');
-- UPDATE public.api_keys SET owner_kind = 'operator';   -- restore the Step-1 default
-- ============================================================
