-- ============================================================
-- SageReasoning — CI-14 Unified Practice Credential (UPC): STEP 3 — generalised unique index
-- Run in: Supabase Dashboard → SQL Editor → New Query  (TEST first, then prod —
--   each its own 0c-ii founder-performed step; the AI does no Supabase action)
-- ============================================================
-- Implements ADR `adopted/adr/2026-06-14-credential-consolidation.md` Migration §3 (§1 index).
-- PRE-REQUISITE: Steps 1 + 2 applied on this environment. RUN §0 (zero-violator
-- pre-check) FIRST — the index creation in §1 will FAIL if §0 returns any row.
--
-- ADDITIVE + IDEMPOTENT. No existing index is dropped (constraint 4). The existing
-- `api_keys_sage_assent_write_owner_agent_unique` index (the three-column,
-- purpose-partial one) is LEFT IN PLACE; it is re-anchored/retired only post-cutover
-- (Step 6), not here. This adds a NEW, broader partial-unique index.
--
-- WHAT THIS ENFORCES: "one credential across the practice" (SR-14) BY CONSTRUCTION —
-- at most one ACTIVE credential per (owner_user_id, agent_id). The agent_id IS NOT
-- NULL guard is LOAD-BEARING: the legacy admin ecosystem mint, the self-service
-- /api/keys mint, and the plugin_install mint all leave agent_id NULL (the per-install
-- row carries identity in install_id, not agent_id), so those rows are correctly
-- EXEMPT — the index constrains only rows that actually declare an agent_identity.
--
-- WIDER-THAN-IT-REPLACES (path-check finding): the old purpose-partial unique index
-- only enforced uniqueness AMONG sage_assent_write rows. This one enforces it across
-- ALL active rows with a non-null agent_id. The legacy admin ecosystem mint DOES
-- allow a non-null agent_id (agent_id?.trim() || null). So a legacy ecosystem row and
-- a sage_assent_write row could in principle share an (owner_user_id, agent_id) pair
-- and collide. §0 is exactly the guard against that — it MUST return zero rows on
-- this environment before §1 runs.
-- ============================================================

-- ============================================================
-- 0. ZERO-VIOLATOR PRE-CHECK — read-only. RUN THIS FIRST on TEST and on prod.
--    If it returns ANY row, DO NOT run §1 — surface the colliding rows to the
--    founder (an existing duplicate (owner, agent_id) active pair) and resolve
--    before creating the index. (Mirrors the existing migrations' 7e safety pattern.)
-- ============================================================
SELECT
  owner_user_id,
  agent_id,
  count(*)                                   AS active_rows,
  array_agg(id)                              AS row_ids,
  array_agg(DISTINCT purpose)                AS purposes,
  array_agg(DISTINCT key_prefix)             AS key_prefixes
FROM public.api_keys
WHERE is_active = true
  AND owner_user_id IS NOT NULL
  AND agent_id IS NOT NULL
GROUP BY owner_user_id, agent_id
HAVING count(*) > 1
ORDER BY active_rows DESC;
-- EXPECT: zero rows. (The existing sage_assent_write unique index already proves the
-- assent rows are internally clean; this widens the scope to cross-purpose pairs.)

-- ============================================================
-- 1. CREATE the generalised partial unique index — run ONLY after §0 returns zero.
-- ============================================================
CREATE UNIQUE INDEX IF NOT EXISTS api_keys_upc_owner_agent_active_uniq
  ON public.api_keys (owner_user_id, agent_id)
  WHERE is_active = true
    AND owner_user_id IS NOT NULL
    AND agent_id IS NOT NULL;

-- ============================================================
-- 2. VERIFY — paste the output of these back to confirm the index.
-- ============================================================

-- 2a. The new index is present, unique, partial (with the agent_id IS NOT NULL guard).
SELECT indexname, indexdef
FROM pg_indexes
WHERE schemaname = 'public' AND tablename = 'api_keys'
  AND indexname = 'api_keys_upc_owner_agent_active_uniq';

-- 2b. The pre-existing sage_assent_write unique index is UNTOUCHED (still present —
--     constraint 4: nothing dropped this build).
SELECT indexname
FROM pg_indexes
WHERE schemaname = 'public' AND tablename = 'api_keys'
  AND indexname = 'api_keys_sage_assent_write_owner_agent_unique';

-- ============================================================
-- INVERSE ROLLBACK (commented) — run only to undo Step 3.
-- ============================================================
-- DROP INDEX IF EXISTS public.api_keys_upc_owner_agent_active_uniq;
-- ============================================================
