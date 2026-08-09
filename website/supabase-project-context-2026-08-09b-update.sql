-- Project-context update, 2026-08-09 (second same-day update, hence "b") —
-- mentor-instructed, applied precisely.
-- Source instruction: relayed by the founder 2026-08-09 (Part One, item 3 of
-- the governing-document-amendments instruction — website image use policy +
-- human creator protection commitment).
-- Target: the single project_context row (Layer 3 dynamic state).
-- Founder-walked (SQL Editor, production). The AI performs no Supabase op.
--
-- What this does (mentor's item 3 only — item 4 says "do not change anything
-- else"):
--   Prepends ONE new Recent entry to recent_decisions, preserving all
--   existing entries below (jsonb concatenation — nothing overwritten).
--
-- What it does NOT touch: current_phase, active_tensions, and every other
-- surface. Items 1 and 2 of the mentor's instruction (the Website Image Use
-- Policy and the Human Creator Protection Commitment) do NOT touch this
-- table at all — ethical_commitments is a STATIC field (compiled TS +
-- website/src/data/project-context.json only; confirmed by reading
-- project-context.ts's loadDynamicState(), which SELECTs only
-- current_phase, active_tensions, recent_decisions from this table — no
-- ethical_commitments column exists here). Those two items were applied to
-- manifest.md (new rules R21/R22) and to project-context.json's
-- baseline.ethical_commitments directly (JSON file, ships on the founder's
-- push — no DB step).
--
-- §0 PRE-FLIGHT (run first; expect the existing recent_decisions array,
-- whose first entry is the 2026-08-08 "Autonomous-loop design brief ruled"
-- line from this morning's update):
--   SELECT jsonb_array_length(recent_decisions) AS n_recent,
--          recent_decisions->0 AS first_entry,
--          updated_at, updated_by
--   FROM project_context;

UPDATE project_context
SET
  recent_decisions = '["2026-08-09: Website Image Use Policy formalised as a hard commitment — all website images human-created, grounded in project values not sentiment, scope limited to public-facing website. Human Creator Protection Commitment added to project principles — AI-generated content will not substitute for human creative work on SageReasoning''s own surfaces; protection for original creators named as a direction for permission-layer design work items 14–17."]'::jsonb || recent_decisions,
  updated_at = now(),
  updated_by = 'manual';

-- §VERIFY (run after; expect:
--   - the first recent_decisions entry is the 2026-08-09 line above
--   - every pre-existing entry (incl. this morning's three 2026-08-08
--     entries) is still present below it, in order
--   - current_phase and active_tensions unchanged):
--   SELECT current_phase,
--          jsonb_pretty(recent_decisions) AS recent,
--          jsonb_pretty(active_tensions) AS tensions
--   FROM project_context;
--
-- ROLLBACK (if needed): remove the one prepended entry —
--   UPDATE project_context SET
--     recent_decisions = recent_decisions - 0,  -- removes the first array element
--     updated_at = now(), updated_by = 'manual';
--
-- NOTE: the Layer-3 loader caches this row in-process (CACHE_TTL_MS in
-- project-context.ts); serverless instances pick the change up on their next
-- cold read — no redeploy needed for the DB half. The manifest.md +
-- project-context.json halves land on the founder's push (already covered
-- by this session's commit).
