-- Project-context update, 2026-08-09 — mentor-instructed, applied precisely.
-- Source instruction: relayed by the founder 2026-08-09 (design-brief rulings follow-up).
-- Target: the single project_context row (Layer 3 dynamic state).
-- Founder-walked (SQL Editor, production). The AI performs no Supabase op.
--
-- What this does (mentor's items 1–3):
--   1. Replaces current_phase with the new Phase text.
--   2. Folds the SETTLED SURFACE NAMES standing section into current_phase,
--      after the Phase sentence — the one placement that renders "after the
--      Phase field, before Recent" in every context builder (full/summary/
--      condensed) without a schema or renderer change.
--   3. Prepends the three new Recent entries to recent_decisions, preserving
--      all existing entries below (jsonb concatenation — nothing overwritten).
-- What it does NOT touch (mentor's item 4): active_tensions, and every other
-- surface (the Recent Interaction Signals + Mentor Observation History blocks
-- live on the private-mentor composition, not this table — unchanged).
--
-- §0 PRE-FLIGHT (run first; expect the old Phase text and the existing
-- recent_decisions array):
--   SELECT current_phase, jsonb_array_length(recent_decisions) AS n_recent,
--          updated_at, updated_by
--   FROM project_context;

UPDATE project_context
SET
  current_phase = 'P0 — Foundations (R&D Phase). Context architecture build complete: Layer 1, 2, and 3 verified live. C2 orientation-reading and examined/observed delivery classification live. Autonomous-loop (idea-on) design brief ruled. Sequencing established: fresh endpoint scope → watching table scope → generation-step scope → first build gate → bounded validation run → standing-runner design.

SETTLED SURFACE NAMES:
practice-on / practice-off — orientation-reading and trust-event pipeline; human-switched binary operational state.
logos-on / logos-off — Layer 3 project context injection; human-switched binary operational state.
idea-on / idea-off — autonomous loop mechanism (IDEA loop); human-switched binary operational state; starting and stopping is a founder act.
fresh — novelty check endpoint; server-side seam wrapping assessStructuralNovelty; no switch suffix; no independent human-switched operational state.
watching — per-cycle dashboard surface; read surface for cycle outcomes; no switch suffix; no meaningful off state distinct from non-existence.
Runner agent identity: sagereasoning:idea-loop@v1 (follows established s9-loop convention; identity name, not a surface name in the above register).',
  recent_decisions = '["2026-08-08: Autonomous-loop design brief ruled. idea-on / idea-off named as the loop mechanism with full human-switched binary operational state. fresh named as the novelty check endpoint (no switch suffix — server-side seam, no independent human-switched state). watching named as the per-cycle dashboard surface (no switch suffix — read surface, no meaningful off state). Sequencing confirmed by mentor.", "2026-08-08: Examined/observed delivery classification built, deployed, and live-verified on genuine post-fix production traffic. 5/5 agreement between ledgered class and agent''s lived experience. Autonomous-loop condition (b) satisfied. Elapsed-time proxy at 28000ms disclosed as proxy, not confirmed delivery.", "2026-08-08: C2 orientation-reading and curation-via-volume disclosure live. Three R18 surfaces updated. ADR-013 §8 amendment applied. Prospective-only treatment of pre-fix rows confirmed."]'::jsonb || recent_decisions,
  updated_at = now(),
  updated_by = 'manual';

-- §VERIFY (run after; expect:
--   - current_phase begins 'P0 — Foundations (R&D Phase). Context architecture
--     build complete:' and contains 'SETTLED SURFACE NAMES:'
--   - the first three recent_decisions entries are the three 2026-08-08 lines,
--     with every pre-existing entry still present below them
--   - active_tensions unchanged):
--   SELECT current_phase,
--          jsonb_pretty(recent_decisions) AS recent,
--          jsonb_pretty(active_tensions) AS tensions
--   FROM project_context;
--
-- ROLLBACK (if needed): restore the §0 pre-flight values —
--   UPDATE project_context SET
--     current_phase = '<the §0 current_phase text>',
--     recent_decisions = recent_decisions - 0 - 0 - 0,  -- removes the three prepended entries
--     updated_at = now(), updated_by = 'manual';
-- (jsonb `- 0` deletes the first array element; applied three times.)
--
-- NOTE: the Layer-3 loader caches this row in-process (CACHE_TTL_MS in
-- project-context.ts); serverless instances pick the change up on their next
-- cold read — no redeploy needed for the DB half.
