-- ============================================================================
-- R17b — Encrypt realtime_journal_entries prose at rest
-- ============================================================================
-- Adds the ciphertext + meta column pair for the AES-256-GCM at-rest encryption
-- of the verbatim impression / assent / action prose, and relaxes the legacy
-- NOT NULL constraints so encrypted-only rows can be inserted.
--
-- Strategy: LEAVE-AND-TOLERATE (D-R17B-REALTIME-JOURNAL-ENCRYPTION-2026-05-31).
--   - New rows write entry_ciphertext + entry_meta; the legacy prose columns
--     are left NULL.
--   - Pre-change plaintext rows (founder/test only) are untouched; readers fall
--     back to the legacy columns when entry_ciphertext IS NULL.
--   - The legacy columns are NOT dropped this session (reversible; a later
--     cleanup session may drop them once this single-table proof is stable).
--
-- The realtime_journal_lag_stats view reads only event_timestamp / created_at
-- and the generated lag_hours — never the prose columns — so it is unaffected.
--
-- Idempotent. Run in the Supabase SQL Editor (TEST first, then production).
-- Reversible: see the ROLLBACK block at the foot of this file.
-- ============================================================================

-- 1. Add the at-rest encryption column pair (TEXT ciphertext + JSONB meta, KG7).
ALTER TABLE realtime_journal_entries
  ADD COLUMN IF NOT EXISTS entry_ciphertext text,
  ADD COLUMN IF NOT EXISTS entry_meta jsonb;

-- 2. Relax the legacy NOT NULL constraints so encrypted-only rows can insert.
ALTER TABLE realtime_journal_entries ALTER COLUMN impression DROP NOT NULL;
ALTER TABLE realtime_journal_entries ALTER COLUMN assent     DROP NOT NULL;
ALTER TABLE realtime_journal_entries ALTER COLUMN action     DROP NOT NULL;

-- ── VERIFICATION (run after a TEST write through /api/mentor/journal-feed) ───
-- Expect: entry_ciphertext is a non-readable base64 string; the prose columns
-- are NULL on new rows; jsonb_typeof(entry_meta) = 'object'.
--
--   SELECT
--     left(entry_ciphertext, 24) AS ciphertext_head,
--     jsonb_typeof(entry_meta)   AS meta_type,
--     impression, assent, action,
--     created_at
--   FROM realtime_journal_entries
--   ORDER BY created_at DESC
--   LIMIT 1;
--
-- Expect: ciphertext_head looks like random base64; meta_type = 'object';
-- impression/assent/action are NULL (new encrypted row).

-- ── ROLLBACK (only if reverting the change) ─────────────────────────────────
-- The added columns are additive and harmless to leave in place. If a full
-- revert is required AND no encrypted rows must be retained:
--
--   ALTER TABLE realtime_journal_entries ALTER COLUMN impression SET NOT NULL;
--   ALTER TABLE realtime_journal_entries ALTER COLUMN assent     SET NOT NULL;
--   ALTER TABLE realtime_journal_entries ALTER COLUMN action     SET NOT NULL;
--   -- (Re-asserting NOT NULL fails if any encrypted-only rows exist; delete or
--   --  back-fill those test rows first.)
--   ALTER TABLE realtime_journal_entries DROP COLUMN IF EXISTS entry_ciphertext;
--   ALTER TABLE realtime_journal_entries DROP COLUMN IF EXISTS entry_meta;
