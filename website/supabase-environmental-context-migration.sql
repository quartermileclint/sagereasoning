-- =============================================================================
-- Environmental Context — Layer 4 storage for weekly scan results
--
-- Each row stores the latest environmental scan summary for one agent domain.
-- Written by the weekly scheduled scan task.
-- Read by environmental-context.ts loader (with 1-hour cache).
--
-- Run this in: Supabase Dashboard → SQL Editor
-- =============================================================================

CREATE TABLE IF NOT EXISTS environmental_context (
  domain TEXT PRIMARY KEY,               -- 'ops' | 'tech' | 'growth' | 'support'
  current_summary TEXT NOT NULL,          -- The synthesised environmental context
  last_scanned TIMESTAMPTZ NOT NULL,      -- When the scan was last run
  scan_metadata JSONB DEFAULT '{}'::jsonb, -- Optional: sources, search queries used, token count
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed rows for all four domains (empty until first scan)
INSERT INTO environmental_context (domain, current_summary, last_scanned) VALUES
  ('ops', 'Awaiting first environmental scan.', NOW()),
  ('tech', 'Awaiting first environmental scan.', NOW()),
  ('growth', 'Awaiting first environmental scan.', NOW()),
  ('support', 'Awaiting first environmental scan.', NOW())
ON CONFLICT (domain) DO NOTHING;

-- RLS: Only service role can write (scan task uses service key)
ALTER TABLE environmental_context ENABLE ROW LEVEL SECURITY;

-- Read access for authenticated users (endpoints run with service role anyway,
-- but this allows dashboard reads if needed)
CREATE POLICY "environmental_context_read"
  ON environmental_context FOR SELECT
  USING (true);

-- Write access restricted to service role only
CREATE POLICY "environmental_context_write"
  ON environmental_context FOR ALL
  USING (auth.role() = 'service_role');

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_environmental_context_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER environmental_context_updated
  BEFORE UPDATE ON environmental_context
  FOR EACH ROW
  EXECUTE FUNCTION update_environmental_context_timestamp();
