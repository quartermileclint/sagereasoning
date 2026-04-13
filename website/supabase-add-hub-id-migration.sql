-- =============================================================================
-- Migration: Add hub_id to founder_conversations
-- =============================================================================
-- Fixes the conversation duplication bug where private-mentor conversations
-- appear in the founder-hub conversation list.
--
-- Root cause: No hub_id column → both hubs share one undifferentiated table.
-- Fix: Add hub_id, backfill existing rows, make NOT NULL.
--
-- Run this in Supabase SQL Editor.
-- =============================================================================

-- Step 1: Add column (nullable first for backfill)
ALTER TABLE founder_conversations
  ADD COLUMN IF NOT EXISTS hub_id TEXT;

-- Step 2: Backfill existing rows
-- Conversations with primary_agent='mentor' and no [Ask Org] prefix are private-mentor.
-- Everything else belongs to founder-hub.
UPDATE founder_conversations
  SET hub_id = CASE
    WHEN primary_agent = 'mentor' AND title NOT LIKE '[Ask Org]%' THEN 'private-mentor'
    ELSE 'founder-hub'
  END
  WHERE hub_id IS NULL;

-- Step 3: Make NOT NULL with default for safety
ALTER TABLE founder_conversations
  ALTER COLUMN hub_id SET NOT NULL,
  ALTER COLUMN hub_id SET DEFAULT 'founder-hub';

-- Step 4: Add CHECK constraint
ALTER TABLE founder_conversations
  ADD CONSTRAINT chk_hub_id CHECK (hub_id IN ('founder-hub', 'private-mentor'));

-- Step 5: Index for filtered queries
CREATE INDEX IF NOT EXISTS idx_fc_hub_id ON founder_conversations(hub_id);

-- Step 6: Composite index for the common list query (hub + status + updated_at)
CREATE INDEX IF NOT EXISTS idx_fc_hub_status_updated
  ON founder_conversations(hub_id, status, updated_at DESC);
