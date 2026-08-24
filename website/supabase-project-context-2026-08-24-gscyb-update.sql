-- ============================================================================
-- STATUS: APPLIED to PRODUCTION 2026-08-24 (founder-walked, SQL Editor).
-- VERIFIED: phase_len 5616 — byte-identical to project-context.json v1.4.1;
-- 20 em-dashes; stale pointer gone; SETTLED SURFACE NAMES intact; n_recent 12.
-- DO NOT RE-RUN. It appends and prepends; a second run duplicates both.
--
-- ⚠ INCIDENT ON FIRST APPLY — READ BEFORE AUTHORING THE NEXT project_context SQL.
-- The first apply landed at phase_len 5622, six characters over target. Cause:
-- the THREE em-dashes in the appended payload were UTF-8 (E2 80 94) and were
-- decoded as MAC OS ROMAN somewhere between the macOS clipboard and the browser
-- SQL Editor, each becoming the 3-character sequence chr(8218)||chr(196)||chr(238)
-- ('‚Äî'). Net +2 per em-dash = +6. The pre-existing 17 baseline em-dashes were
-- NOT affected — only this paste's payload passed through the corrupting hop.
--
-- Corrected in place, idempotently, with:
--   UPDATE project_context
--   SET current_phase = replace(current_phase, chr(8218)||chr(196)||chr(238), chr(8212)),
--       updated_at = now(), updated_by = 'manual';
--
-- A first diagnostic guessed LATIN-1 (chr(226)||chr(128)||chr(148)) and was WRONG.
-- It was caught only because the diagnostic tested for that SPECIFIC byte sequence
-- alongside a count of properly-stored em-dashes: mojibake_present=false WITH
-- proper_em_dashes=17-not-20 was immediately informative. A looser "is it broken?"
-- check would have run a no-op replace() and reported success on a corrupt row.
--
-- THE RULE THIS ESTABLISHES: never put a non-ASCII character in a SQL string
-- literal bound for a browser SQL Editor. Use chr(8212) for an em-dash and
-- \uXXXX inside jsonb literals. The payload below has been HARDENED to that form
-- — it is now pure ASCII on the wire and would survive the same hop unchanged.
-- (The statement below is therefore NOT byte-identical to what was actually run;
-- it is the corrected form, and it produces the same stored text.)
-- ============================================================================

-- Project-context update, 2026-08-24 — mentor-ruled (GS-CYB-1/GS-CYB-2 pointer
-- entries + the GS-ATRF-4 stale-pointer correction + the amended weights-BLOCKED
-- constraint).
--
-- Verbatim sources (both binding):
--   operations/agent-circles-2026-08/2026-08-24-mentor-ruling-cybernetics-instruction-four-questions-verbatim.md  (Q1 routing, Q3 pointers-only, Q4 ordinal)
--   operations/agent-circles-2026-08/2026-08-24-mentor-ruling-gaming-robustness-bar-route-ii-verbatim.md          (Q2 two-condition amendment)
-- Target: the single project_context row (Layer 3 dynamic state).
-- Founder-walked (SQL Editor, production). The AI performs no Supabase op.
-- Tier: ELEVATED under 0d-ii — a change to text injected into every /api/reason
-- Layer-1 extraction prompt. Not auth/perimeter/flag/deletion; AC7 not engaged.
--
-- Same class of edit as supabase-project-context-2026-08-19-gsatrf4-update.sql.
-- The static half is ALREADY APPLIED and pushed (project-context.json v1.4.1,
-- JSON-parse-verified). This SQL brings the LIVE row to the identical content.
--
-- THIS SQL WAS DERIVED, NOT TRANSCRIBED. The append text below was extracted
-- programmatically from project-context.json and asserted to be a pure
-- replace()+append over the 8aa9fae baseline, so the DB and the JSON converge
-- byte-for-byte. (The 2026-08-19 precedent records its own hand-written
-- pre-flight count being wrong; deriving avoids that class.)
--
-- What this does:
--   1. Corrects GS-ATRF-4's stale routing pointer — 'generation-step scoping
--      session' -> 'standing-runner design session'. The phrase appears EXACTLY
--      ONCE in the register (asserted). The ruling scopes this correction to the
--      register only; the same phrase occurs in ~12 other repo documents and is
--      deliberately NOT touched there.
--   2. Appends the GS-CYB-1 and GS-CYB-2 POINTER entries (1458 chars) to the END
--      of current_phase. Pointers only, per the Q3 ruling — the full design
--      specifications live in the governing document, deliberately NOT here,
--      because this text is injected into every extraction prompt.
--   3. Prepends ONE new 2026-08-24 recent_decisions entry.
-- What it does NOT touch: active_tensions, SETTLED SURFACE NAMES, the baseline
-- commitments, GS-ATRF-1/2/3, or any existing recent_decisions entry.
--
-- PROPORTIONALITY (the Q3 ruling's own concern): current_phase 4159 -> 5616
-- chars, +35%. The full specifications would have been ~+50%, which the mentor
-- ruled 'not what the instruction intended'. Pointer-only keeps the live
-- extraction-prompt footprint proportionate.
--
-- ============================================================================
-- §0 PRE-FLIGHT — RUN THIS FIRST, AND READ THE RESULT BEFORE APPLYING.
-- ============================================================================
-- This step is load-bearing. The live row's content could not be read from a
-- repo session, so this UPDATE assumes the live row still matches the 8aa9fae
-- baseline (4159 chars). If it has drifted, STOP — the append would land on
-- content this file has not seen.
--
--   SELECT length(current_phase)                                        AS phase_len,
--          right(current_phase, 120)                                    AS phase_tail,
--          current_phase LIKE '%generation-step scoping session.%'      AS stale_pointer_present,
--          current_phase LIKE '%GS-CYB-1%'                              AS already_applied,
--          jsonb_array_length(recent_decisions)                         AS n_recent,
--          updated_at, updated_by
--   FROM project_context;
--
-- EXPECTED BEFORE APPLYING:
--   phase_len              = 4159      <- if this differs, STOP and report it
--   phase_tail             ends '...To be examined at the generation-step scoping session.'
--   stale_pointer_present  = true
--   already_applied        = false     <- true means this file already ran; do NOT re-run
--   n_recent               = 11        (informational only; the UPDATE keys on text, not counts)
--
-- ============================================================================
-- §APPLY
-- ============================================================================

UPDATE project_context
SET
  current_phase = replace(
    current_phase,
    'To be examined at the generation-step scoping session.',
    'To be examined at the standing-runner design session.'
  ) || '

GS-CYB-1 ' || chr(8212) || ' Proximity score as error signal and candidate weighting function. Open question: does the generation step read the proximity score from the watching table as a graded error signal, and if so, how does it use that signal to bias candidate generation toward error-reducing actions? Standing constraint: weights BLOCKED (ADR-012, third rung) ' || chr(8212) || ' a weighting function optimising against the proximity score places a gameable scorer inside an optimisation loop. AMENDED 2026-08-24 to two INDEPENDENT conditions: (1) the weights-claim bar cleared by a route whose scoping clause addresses supply-provenance, not only co-training; and (2) a separate, independent judgement that the scorer is adequate for use inside a feedback optimisation loop specifically. Clearing (1) does not satisfy (2). Neither is met. Full design specification in the Agent Cybernetic Control Architecture governing document. To be examined at the standing-runner design session.

GS-CYB-2 ' || chr(8212) || ' Controlled system model and completion signal return path. Open question: does the completion signal return path constitute a formal model of the controlled system, and if so, what is the update rule by which the post-completion proximity delta modifies the generation step''s candidate weighting function? Sequentially dependent on GS-ATRF-3. Full design specification in the Agent Cybernetic Control Architecture governing document. To be examined at the standing-runner design session.',
  recent_decisions = '["2026-08-24: GS-CYB-1 and GS-CYB-2 added to the ATRF Integration register as POINTER ENTRIES ONLY (full design specifications live in the Agent Cybernetic Control Architecture governing document) and routed to the STANDING-RUNNER DESIGN SESSION, not the generation-step scoping session, which closed 2026-08-09 \u2014 the 2026-08-19 forward-reservation principle, extended 2026-08-24 to questions raised by a ruling. GS-ATRF-4''s identical stale pointer corrected in the same pass. GS-CYB-1 carries the weights-BLOCKED standing constraint, AMENDED the same day to two INDEPENDENT conditions after route (ii) of the gaming-robustness bar was ruled against: clearing the weights-claim bar does not automatically establish that the proximity scorer is adequate for use inside a feedback optimisation loop. Neither condition is met."]'::jsonb || recent_decisions,
  updated_at = now(),
  updated_by = 'manual';

-- ============================================================================
-- §VERIFY — run after applying.
-- ============================================================================
--   SELECT length(current_phase)                                   AS phase_len,
--          right(current_phase, 180)                               AS phase_tail,
--          current_phase LIKE '%GS-CYB-1%'                          AS cyb1_present,
--          current_phase LIKE '%GS-CYB-2%'                          AS cyb2_present,
--          current_phase LIKE '%two INDEPENDENT conditions%'        AS amended_constraint_present,
--          current_phase LIKE '%generation-step scoping session.%'  AS stale_pointer_remaining,
--          current_phase LIKE '%SETTLED SURFACE NAMES:%'            AS settled_names_intact,
--          jsonb_array_length(recent_decisions)                     AS n_recent
--   FROM project_context;
--
-- EXPECTED AFTER APPLYING:
--   phase_len                   = 5616   <- must equal project-context.json v1.4.1 exactly
--   phase_tail                  ends '...To be examined at the standing-runner design session.'
--   cyb1_present                = true
--   cyb2_present                = true
--   amended_constraint_present  = true
--   stale_pointer_remaining     = FALSE  <- the correction landed
--   settled_names_intact        = true   <- nothing else was disturbed
--   n_recent                    = 12      (one more than pre-flight)
--
-- If phase_len is 5616 the live row and the repo JSON are byte-identical.
--
-- ============================================================================
-- ROLLBACK
-- ============================================================================
-- Reverse of the apply — removes the appended block and restores the pointer:
--   UPDATE project_context SET
--     current_phase = replace(
--       left(current_phase, length(current_phase) - 1458),
--       'To be examined at the standing-runner design session.',
--       'To be examined at the generation-step scoping session.'
--     ),
--     recent_decisions = recent_decisions - 0,
--     updated_at = now(), updated_by = 'manual';
--   FROM project_context;
-- (jsonb `- 0` deletes the first array element. Expect phase_len back to 4159.)
-- SAFEST FORM: paste the §0 pre-flight current_phase value back verbatim.
--
-- ============================================================================
-- GUARD — run this file ONCE.
-- ============================================================================
-- It appends and prepends; a second run would duplicate both. The tell is §0's
-- already_applied = true, or phase_len = 5616 before applying.
--
-- CACHE NOTE: project-context.ts caches this row in-process for ONE HOUR
-- (CACHE_TTL_MS). The change is NOT visible to a running serverless instance
-- until its cache expires or it cold-starts. NO REDEPLOY IS REQUIRED — but a
-- redeploy is the fastest way to force every instance to pick it up. Do not
-- read an unchanged extraction prompt in the first hour as a failed update.
