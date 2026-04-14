-- ═══════════════════════════════════════════════════════════════════════
-- 20260414 — Add 'mentor_session' to session_context_snapshots.snapshot_type
-- ═══════════════════════════════════════════════════════════════════════
--
-- Purpose:
--   Extend the snapshot_type CHECK constraint to include 'mentor_session'
--   so the Mentor Session Context Loader (v2) can write rows with a
--   correctly-typed value rather than overloading 'custom'.
--
-- Why now:
--   Writing 'custom' for every mentor session creates a query-time liability.
--   A future filter by snapshot_type would silently drop mentor context rows
--   alongside any other 'custom' use. Typing them correctly from the first
--   real row is cheaper than retrofitting later.
--
-- Pre-conditions (verified before applying):
--   - session_context_snapshots row count = 0 (no data migration needed)
--   - No other writers use snapshot_type yet
--
-- Risk classification: ELEVATED
--   - Schema change to an existing table with a CHECK constraint
--   - One downstream code change (mentor-context-private.ts write call)
--   - Rollback: drop new constraint, re-add original four-value constraint
--
-- Rollback SQL:
--   ALTER TABLE session_context_snapshots
--     DROP CONSTRAINT IF EXISTS session_context_snapshots_snapshot_type_check;
--   ALTER TABLE session_context_snapshots
--     ADD CONSTRAINT session_context_snapshots_snapshot_type_check
--     CHECK (snapshot_type IN (
--       'knowledge_context', 'v3_scope_status', 'business_plan', 'custom'
--     ));
-- ═══════════════════════════════════════════════════════════════════════

ALTER TABLE session_context_snapshots
  DROP CONSTRAINT IF EXISTS session_context_snapshots_snapshot_type_check;

ALTER TABLE session_context_snapshots
  ADD CONSTRAINT session_context_snapshots_snapshot_type_check
  CHECK (snapshot_type IN (
    'knowledge_context',
    'v3_scope_status',
    'business_plan',
    'custom',
    'mentor_session'
  ));
