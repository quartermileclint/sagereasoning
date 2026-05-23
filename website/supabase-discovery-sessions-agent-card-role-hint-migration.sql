-- ============================================================
-- SageReasoning — Sage Calling (purpose-discovery): add agent_card_role_hint
-- Run in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================
-- E#1 follow-on (Track E item 1, /drafts/2026-05-23-track-followons-design-pack.md):
-- "Persist the Agent-Card verification verdict — so the chosen-role hint carries
-- into the five-spec assembly; today the verdict is logged but not stored, so
-- role defaults to individual_nature."
--
-- Extends the discovery_sessions table created at Sage Calling build Stage 1
-- (website/supabase-discovery-sessions-migration.sql;
--  D-SAGE-CALLING-STAGE1-BUILD-WIRED-VERIFIED-2026-05-21).
--
-- ADDITIVE + IDEMPOTENT. Safe to re-run. Reversible via the ROLLBACK block at
-- the foot of this file (commented; run only to roll back).
--
-- WHAT THIS ADDS
-- --------------
--   • A single nullable column `agent_card_role_hint`. When an agent supplies a
--     verifiable agent_card_url at session-open (D-13) and the card VERIFIES, the
--     verdict's role hint ('chosen_role' — the card IS the agent's formal A2A
--     commitment, i.e. the chosen-role persona) is stored here. The Hard-Gate
--     approval path (POST /api/calling/approve) reads it and feeds it into the
--     five-specification assembly (buildDiscoveredPurpose), so `role` reflects the
--     verified card instead of defaulting to 'individual_nature'.
--   • An absent / unverified / spoofed card stores NOTHING (the column stays
--     NULL) → the assembly defaults exactly as it does today (fail-open / degrade
--     to current behaviour; no behavioural change until a card verifies).
--
-- R17i (minimisation): only the role hint the assembly needs is stored — NOT the
--   card body, NOT the fetched URL, NOT the verdict reason (those remain
--   observability-only console logs at session time). One nullable scalar.
-- R18c (interop): the column admits the full four-persona vocabulary (not just
--   'chosen_role') so a later, richer card-verification verdict needs no schema
--   change.
-- KG1 (Vercel five rules): the writer (createSession, session-open) and the
--   reader (approve route) await every DB call; no fire-and-forget. The hint is
--   folded into the EXISTING session-creation INSERT — no new write, no new
--   failure mode.
-- ============================================================

-- 1. The column. Nullable text; no default (absence = NULL = "no verified card").
ALTER TABLE public.discovery_sessions
  ADD COLUMN IF NOT EXISTS agent_card_role_hint text;

-- 2. Enum guard (additive hardening; idempotent). A CHECK with IN passes on NULL,
--    so this constrains the non-null values without forcing one — matching the
--    house style of discovery_sessions_outcome_check. The four values are
--    Cicero's four personae (DiscoveredPurposeRole in layer1-extractor.ts).
--    The application only ever writes 'chosen_role' today; the others are admitted
--    for forward compatibility (R18c).
DO $$ BEGIN
  ALTER TABLE public.discovery_sessions
    ADD CONSTRAINT discovery_sessions_agent_card_role_hint_check
    CHECK (agent_card_role_hint IN ('shared_rational_nature', 'individual_nature', 'circumstance', 'chosen_role'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
-- VERIFY — paste the output back to confirm.
-- ============================================================

-- 1. Column exists, is text, is nullable, no default.
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'discovery_sessions'
  AND column_name = 'agent_card_role_hint';
-- Expect: 1 row → agent_card_role_hint | text | YES | (null)

-- 2. The CHECK constraint exists.
SELECT conname FROM pg_constraint
WHERE conrelid = 'public.discovery_sessions'::regclass
  AND contype = 'c'
  AND conname = 'discovery_sessions_agent_card_role_hint_check';
-- Expect: 1 row → discovery_sessions_agent_card_role_hint_check

-- 3. The full column list is now 12 (the original 11 + agent_card_role_hint).
SELECT count(*) AS column_count
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'discovery_sessions';
-- Expect: column_count = 12

-- ============================================================
-- ROLLBACK — DO NOT RUN unless rolling E#1 back.
-- Reversible: drops the guard then the column. No data implications
-- (no current users; pre-existing rows store NULL here).
-- ============================================================
--   ALTER TABLE public.discovery_sessions
--     DROP CONSTRAINT IF EXISTS discovery_sessions_agent_card_role_hint_check;
--   ALTER TABLE public.discovery_sessions
--     DROP COLUMN IF EXISTS agent_card_role_hint;
