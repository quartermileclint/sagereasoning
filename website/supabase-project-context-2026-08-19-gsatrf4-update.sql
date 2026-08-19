-- Project-context update, 2026-08-19 — mentor-ruled (GS-ATRF-4 formal addition).
-- Verbatim source: operations/agent-circles-2026-08/2026-08-19-mentor-ruling-gsatrf4-epistemic-status-verbatim.md
-- Target: the single project_context row (Layer 3 dynamic state).
-- Founder-walked (SQL Editor, production). The AI performs no Supabase op.
--
-- Same class of edit as the 2026-08-09 ATRF/GS-ATRF-1..3 addition
-- (supabase-project-context-2026-08-09-atrf-update.sql) — a static-file change
-- (already applied to website/src/data/project-context.json v1.3.0 -> v1.4.0,
-- tsc-clean, JSON-parse-verified) plus this authored SQL UPDATE for the live
-- row.
--
-- What this does:
--   1. Corrects the paragraph-count wording inside current_phase from
--      "These three questions are carried..." to "These four questions are
--      carried..." (a plain text replace — the phrase appears exactly once).
--   2. Appends the GS-ATRF-4 open question and its cross-reference note to
--      the END of current_phase, immediately after the GS-ATRF-3 paragraph
--      (the same append-at-end placement precedent as the 2026-08-09 update).
--   3. Prepends ONE new 2026-08-19 recent_decisions entry, preserving every
--      existing entry below it.
-- What it does NOT touch: active_tensions, the SETTLED SURFACE NAMES text,
-- the baseline commitments, GS-ATRF-1/2/3's own paragraphs (unchanged except
-- for the shared "three"->"four" count phrase they sit inside), the
-- high|medium|low vocabulary (unchanged; the mentor ruled the vocabulary
-- question itself stays deferred to the generation-step scoping session).
--
-- §0 PRE-FLIGHT (run first; expect current_phase ending with the GS-ATRF-3
-- paragraph -- "The answer must be explicit, not defaulted." -- and 10
-- recent entries if this is the first run, or 11 if this file is re-run.
-- CORRECTED 2026-08-19, post-run: this comment originally claimed "13" and
-- "14" -- wrong, not independently verified before being written. Traced
-- from the full update chain (seed 3 + 2026-08-09-update +3 +
-- 2026-08-09b-update +1 + 2026-08-09-atrf-update +3 = 10) and confirmed
-- against the actual production value at the founder-walked run: n_recent
-- was 10 pre-run, 11 post-run. The 2026-08-09-atrf-update.sql file this
-- number was extrapolated from ALSO carries an inaccurate pre-flight count
-- ("9", corrected there too) -- neither error affected the UPDATE statement
-- itself, which depends on text content via replace()/LIKE, not on a count.
-- The founder ran an additional confirming query before Step 2
-- (LIKE '%These three questions...%') per this session's own discipline of
-- verifying load-bearing facts directly rather than trusting a comment.):
--   SELECT right(current_phase, 200) AS phase_tail,
--          jsonb_array_length(recent_decisions) AS n_recent,
--          updated_at, updated_by
--   FROM project_context;

UPDATE project_context
SET
  current_phase = replace(
    current_phase,
    'These three questions are carried into the generation-step build sequence.',
    'These four questions are carried into the generation-step build sequence.'
  ) || '

GS-ATRF-4 — Epistemic status of propositions. The ATRF carries propositions through the reasoning harness — impressions, candidate ideas, blast-radius assessments, completion signals. Open question: should each consequential proposition carry a formal epistemic status (observation / inference / assumption / unknown), and if so, where in the harness does that status get assigned, checked, and disclosed? The governing rule is that confidence of an explanation must never exceed its evidential basis. The honest answer may be that epistemic status assignment belongs at the generation step, with disclosure riding the proposal shape alongside the blast-radius indicator. If that is the ruling, the epistemic status field is disclosed as an assessed classification, not a measurement — consistent with the blast-radius indicator being a proxy, disclosed as such.

See also: §(c-bis) in gs-atrf-corrections.md — the unknown category may close the basis-lessness gap in GS-ATRF-1''s ruled four-virtue proxy. To be examined at the generation-step scoping session.',
  recent_decisions = '["2026-08-19: GS-ATRF-4 — Epistemic status of propositions — added to the ATRF Integration generation-step open questions, ruled by the mentor as a standalone fourth question (not an amendment to GS-ATRF-1''s ruled four-virtue proxy). Cross-referenced to gs-atrf-corrections.md §(c-bis), to be examined at the generation-step scoping session. Governing rule stated: confidence of an explanation must never exceed its evidential basis."]'::jsonb || recent_decisions,
  updated_at = now(),
  updated_by = 'manual';

-- §VERIFY (run after; expect:
--   - current_phase still begins 'P0 — Foundations (R&D Phase).', still
--     contains 'SETTLED SURFACE NAMES:', now says "four questions" (not
--     "three"), and now ENDS with the GS-ATRF-4 cross-reference sentence
--     ('...examined at the generation-step scoping session.')
--   - the first recent_decisions entry is the 2026-08-19 GS-ATRF-4 line
--     above, with every pre-existing entry still present below it
--   - active_tensions unchanged):
--   SELECT right(current_phase, 400) AS phase_tail,
--          current_phase LIKE '%four questions are carried%' AS four_questions_wording_present,
--          current_phase LIKE '%three questions are carried%' AS stale_three_questions_wording_present,
--          jsonb_pretty(recent_decisions) AS recent,
--          jsonb_pretty(active_tensions) AS tensions
--   FROM project_context;
-- Expected on the two boolean columns: four_questions_wording_present = true,
-- stale_three_questions_wording_present = false.

-- ROLLBACK (if needed): restore the §0 pre-flight state --
--   UPDATE project_context SET
--     current_phase = replace(
--       left(current_phase, length(current_phase) - length('
--
-- GS-ATRF-4 — ... <the full appended section text, through the cross-reference sentence> ')),
--       'These four questions are carried into the generation-step build sequence.',
--       'These three questions are carried into the generation-step build sequence.'
--     ),
--     -- (simplest reliable form: paste the §0 pre-flight current_phase back verbatim)
--     recent_decisions = recent_decisions - 0,  -- removes the one prepended entry
--     updated_at = now(), updated_by = 'manual';
-- (jsonb `- 0` deletes the first array element.)

-- GUARD: run this file ONCE. It appends and prepends; a second run would
-- duplicate the section and the entry (the §0 n_recent count is the tell --
-- 14 means already applied, and the four_questions_wording_present check in
-- §VERIFY confirms the replace already happened rather than running twice).

-- NOTE: the Layer-3 loader caches this row in-process (CACHE_TTL_MS in
-- project-context.ts); serverless instances pick the change up on their next
-- cold read -- no redeploy needed for the DB half. The fallback JSON half
-- (website/src/data/project-context.json v1.4.0) lands on the founder's push.
