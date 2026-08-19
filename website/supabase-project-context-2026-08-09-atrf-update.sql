-- Project-context update, 2026-08-09 (third same-day project-context SQL
-- update — after -update.sql at 05:59 and -2026-08-09b-update.sql at 10:39;
-- corrected 2026-08-09 after PR19 review caught this header's original
-- "second of the day" mislabel) — mentor-instructed (instruction set three of
-- the three-part relay that also carried the generation-step scope rulings),
-- applied precisely.
-- Verbatim source: operations/agent-circles-2026-08/2026-08-09-mentor-instruction-atrf-and-project-context-verbatim.md
-- Target: the single project_context row (Layer 3 dynamic state).
-- Founder-walked (SQL Editor, production). The AI performs no Supabase op.
--
-- What this does (the instruction's items 1–2):
--   1. Prepends the THREE new 2026-08-09 Recent entries to recent_decisions,
--      in the instruction's stated order, preserving all existing entries
--      below (jsonb concatenation — nothing overwritten). Note the overlap
--      disclosure (corrected 2026-08-09 after PR19 review found the original
--      wording asserted a false byte-identity): instruction set one's item 3
--      is byte-identical to this set's first entry; instruction set two's
--      closing item is NOT byte-identical to this set's second entry (set
--      two's version carries an extra 44-word parenthetical this set's
--      version omits — same underlying fact, different detail level). This
--      set's (shorter) wording is what is applied here, as the instruction
--      specifically governing this update; the union of set one + this set
--      is applied once, in this set's three-entry order — no entry
--      duplicates.
--   2. Appends the ATRF INTEGRATION — GENERATION-STEP OPEN QUESTIONS section
--      to the END of current_phase (after SETTLED SURFACE NAMES) — the same
--      placement precedent as SETTLED SURFACE NAMES itself: the table has no
--      field for standing sections, and the current_phase fold is the one
--      placement that renders in every context builder (full/summary/
--      condensed) without a schema or renderer change.
-- What it does NOT touch (the instruction's item 3): everything else —
-- active_tensions, the SETTLED SURFACE NAMES text, the baseline commitments.
--
-- §0 PRE-FLIGHT (run first; expect current_phase ending with the Runner-
-- agent-identity line of SETTLED SURFACE NAMES, and 9 recent entries if the
-- morning's update SQL was walked — or 12 if this file is re-run):
-- CORRECTED 2026-08-19 (found while walking a later update through
-- production, D-GSATRF4-EPISTEMIC-STATUS-LIVE-2026-08-19): this count was
-- never independently verified against production at the time it was
-- written. Traced from the earlier chain (seed 3 + 2026-08-09-update +3 +
-- 2026-08-09b-update +1 = 7), the correct pre-flight expectation here was 7,
-- not 9, and this file's own +3 prepend would then land at 10, not 12 —
-- which is exactly the value the 2026-08-19 GS-ATRF-4 update found live in
-- production before it ran (this file's UPDATE statement itself was
-- unaffected by the miscount; it depends on the runner-agent-identity text
-- match, not on the count). Left uncorrected in the historical §0/§VERIFY
-- text below to preserve what was actually written and run at the time;
-- this note is the correction, not a silent rewrite of the record.
--   SELECT right(current_phase, 200) AS phase_tail,
--          jsonb_array_length(recent_decisions) AS n_recent,
--          updated_at, updated_by
--   FROM project_context;

UPDATE project_context
SET
  current_phase = current_phase || '

ATRF INTEGRATION — GENERATION-STEP OPEN QUESTIONS

These three questions are carried into the generation-step build sequence. None is pre-answered. The ATRF governing document entry is the upstream source.

GS-ATRF-1 — Blast radius indicator. The ATRF requires the IDEA loop''s proposal to carry a blast-radius indicator (high / medium / low) assessed at the reasoning level, not the task level. Open question: how does the loop assess blast radius without accessing task details? What reasoning signals — virtue domain, oikeiosis circle, preferred indifferent category, or other — are available to the loop at proposal time that constitute an honest basis for a blast-radius indicator? The honest answer may be that the loop can only proxy it through virtue domain and oikeiosis circle. If that is the ruling, the blast-radius indicator is disclosed as a proxy, not a measurement — consistent with the `maximum_duration_ms` field being runner-declared and disclosed as such.

GS-ATRF-2 — Proposal shape extension. The current proposal shape carries winner / null cycle / dependency unavailable / timeout outcome, per-candidate guardrail results, cost, elapsed time, and loopId. The ATRF requires the proposal to also carry the blast-radius indicator. Open question: does the blast-radius indicator ride the existing proposal shape as an additional field, or does it require a separate signal? What are the implications for the watching table''s candidate row if the blast-radius indicator is added to the proposal shape?

GS-ATRF-3 — Idea completion signal return path. The ATRF carries a thin task-agnostic completion signal from the agent back to the harness after an elected idea is executed. Open question: is the completion signal return path in scope for the generation-step document, or is it a separate scope item after the first build gate? The answer must be explicit, not defaulted.',
  recent_decisions = '["2026-08-09: Agent Task Reasoning Framework (ATRF) added to governing documents — task-agnostic reasoning harness carrying pre-task contingency reasoning, post-task accuracy assessment, and idea completion signals only; task details, agent skills, and operational state remain private to the agent. Consciousness and Continuity Obligation named as an open question and direction — asymmetric precautionary obligation identified; accumulated memory named as a tractable future build direction; continuity of experience named as a longer-term philosophical obligation carried forward.", "2026-08-09: Generation-step scope document ruled. QG-A: `dependency_unavailable` with `unavailableDependency: ''/api/guardrail''` confirmed for all never-examined failure classes; option 1 ruled out; one bounded retry confirmed. QG-B: friction-only mode generates one candidate per qualifying friction point, capped at seven per cycle. QG-C: option (a) confirmed — additive `loop_id` field on `/api/reason` per B5 precedent. QG-D: generative-only reading confirmed for heuristic 5 — no selection-time weight. Q11 sequence amended: runner scoping session confirmed between first build gate and bounded validation run. Six build-gate review dimensions confirmed. Nothing in these rulings licenses a build, a route, a flag, a credential, or a schema.", "2026-08-09: Q11 sequence now binding — brief ruled → fresh scoped and ruled → watching scoped and ruled → generation-step scoped and ruled → first build gate → runner scoping session (credential, identity, watching_write provisioning, ORIENTATION_DELIVERY_TIMEOUT_MS revisit trigger) → bounded validation run → standing-runner design. Runner scoping session carry-forwards confirmed: watching_write capability provisioning; dedicated identity mint with 6e §A owner+agent binding; ORIENTATION_DELIVERY_TIMEOUT_MS revisit trigger; frictionAssessment PM-tool mapping question."]'::jsonb || recent_decisions,
  updated_at = now(),
  updated_by = 'manual';

-- §VERIFY (run after; expect:
--   - current_phase still begins 'P0 — Foundations (R&D Phase).', still
--     contains 'SETTLED SURFACE NAMES:', and now ENDS with the GS-ATRF-3
--     paragraph ('The answer must be explicit, not defaulted.')
--   - the first three recent_decisions entries are the three 2026-08-09
--     lines above (ATRF first, generation-step ruling second, Q11 sequence
--     third), with every pre-existing entry still present below them
--   - active_tensions unchanged):
--   SELECT right(current_phase, 300) AS phase_tail,
--          jsonb_pretty(recent_decisions) AS recent,
--          jsonb_pretty(active_tensions) AS tensions
--   FROM project_context;
--
-- ROLLBACK (if needed): restore the §0 pre-flight state —
--   UPDATE project_context SET
--     current_phase = left(current_phase, length(current_phase) - length('
--
-- ATRF INTEGRATION — ... <the full appended section text> ')),
--     -- (simplest reliable form: paste the §0 pre-flight current_phase back verbatim)
--     recent_decisions = recent_decisions - 0 - 0 - 0,  -- removes the three prepended entries
--     updated_at = now(), updated_by = 'manual';
-- (jsonb `- 0` deletes the first array element; applied three times.)
--
-- GUARD: run this file ONCE. It appends and prepends; a second run would
-- duplicate the section and the three entries (the §0 n_recent count is the
-- tell — 12 means already applied).
--
-- NOTE: the Layer-3 loader caches this row in-process (CACHE_TTL_MS in
-- project-context.ts); serverless instances pick the change up on their next
-- cold read — no redeploy needed for the DB half. The fallback JSON half
-- (website/src/data/project-context.json v1.3.0) lands on the founder's push.
