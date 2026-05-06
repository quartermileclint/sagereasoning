# Next-Session Prompt — M1-CP4c: Layer 1/2/3 module updates for AC-14 + Tier 2

**Stream:** founder.
**Tier:** `code-standard`.
**Governing frame:** `/adopted/standing-protocol-cache.md` (lean form per cache; Standard risk under 0d-ii — modules touched but route not wired).
**Predecessor session close:** `/operations/handoffs/founder/2026-05-06-sub-session-M1-CP4b-close.md`.
**Predecessor decision-log entries:**
- `D-M1-CP4b-AC14-TIER2-ADR-AMENDMENTS-2026-05-06` (M1-CP4b — the four ADR amendments this session implements)
- `D-M1-AC13-AC14-WIRING-REQUIRED-BEFORE-CUTOVER-2026-05-05` (the parent scope decision)
- `D-M1-CP3-LAYER3-MODULE-AND-ADR007-2026-05-04` + `D-M1-CP2-LAYER2-MODULE-AND-ADR006-2026-05-04` + `D-M1-CP1-LAYER1-MODULE-AND-ADR005-2026-05-04` (the predecessor module adoptions)

**Risk classification:** **Standard** under 0d-ii. Critical Change Protocol NOT engaged. The three modules under `/website/src/lib/translation-sandwich/` are touched, but no route is wired (parallel-run.ts orchestrator update is M1-CP4f). Module changes affect only the standalone harness output until the orchestrator is updated; the user-facing parallel-run path remains dormant by default until M1-CP4f. No R20a perimeter touched.

## Why this session matters

M1-CP4b specified the four engine-level intake triggers in ADR-005 + ADR-006 + ADR-007. M1-CP4c implements the spec in code. Without this session, the ADR amendments are documentation only — the engine cannot fire EUPATHEIA_BOUNDARY, PRAXIS_MOTIVATION_AMBIGUITY, STATED_OPERATIVE_CONFLICT, or STATED_EQUANIMITY_UNVERIFIED at runtime. M1-CP5 cutover-decision data depends on the with-mechanism engine being live in the parallel-run path, which depends on M1-CP4c modules + M1-CP4f orchestrator.

## Pre-conditions

1. The four M1-CP4b ADR amendments are committed + pushed (per the predecessor session's Step A).
2. Founder spot-check confirmed the amendments are in place (per the predecessor session's Step B).
3. Founder is ready for a code session (estimated 4-7 hours; may span two sittings if Sonnet harness costs warrant a pause).
4. Vercel deployment + Supabase state unchanged from M1-CP4b close (no production touch this session either, until founder pushes the modules at session close).

## Part A — Open under the protocol

Read in order:
1. `/adopted/standing-protocol-cache.md` (~3 min — confirms tier `code-standard`, lean form applies; Standard default risk; AC8 engaged for module placement under `/website/src/lib/translation-sandwich/`).
2. `/operations/handoffs/founder/2026-05-06-sub-session-M1-CP4b-close.md` (~5 min — predecessor close).
3. The four amended ADRs in full (~30-45 min combined):
   - `/adopted/adr/2026-05-04-layer1-schema-specification.md` (especially §2 + §3.8–§3.11 + §4 + §6 + §8)
   - `/adopted/adr/2026-05-04-layer2-mechanism-algorithm.md` (especially §2 + §3.9)
   - `/adopted/adr/2026-05-04-layer3-prose-template-api-reason.md` (especially §2 + §3 + §6 + §8.2)
   - `/adopted/adr/2026-05-04-translation-sandwich-pilot-api-reason.md` §10 (the amended checkpoint table)
4. `/operations/decision-log.md` last 2 entries (D-M1-CP4b + D-M1-AC13-AC14-WIRING-REQUIRED-BEFORE-CUTOVER — full context).

Confirm at session open per cache:
- Tier: **`code-standard`** — modules touched; route not wired.
- Hold-point: P0 0h active.
- Status vocabulary: at session close, the three layer modules advance from Wired (parallel-run, dormant) to Wired (parallel-run, dormant; with intake-clarification trigger detection).
- Risk class: **Standard** under 0d-ii.
- Model selection per cache Element 6: Sonnet for Layer 1 + Layer 3 (unchanged); Layer 2 has no model.
- AC1 + AC6 + AC8 + KG1 + KG2 + KG6: ENGAGED for the module updates (per the existing M1-CP1/2/3 dispositions).
- AC4 + AC5 + AC7 + PR1 + PR3 + PR6: NOT engaged this session (no route wiring; no perimeter touched). PR4 ENGAGED (model selection unchanged from spec).

## Part B — Procedure

### Step 1 — Update `/website/src/lib/translation-sandwich/layer1-extractor.ts`

Per ADR-005 amendment (M1-CP4b):
- Add the new controlled-vocabulary types (`EupatheiaShape`, `StatedEquanimitySignal`).
- Add the four new entry-shape interfaces (`EupatheiaCandidate`, `StatedConcernTarget`, `StatedEquanimitySignalEntry`, `MotivationEvidenceEntry`).
- Add the five new top-level fields to `Layer1Schema` (`eupatheia_candidates`, `stated_concern_targets`, `stated_equanimity_signals`, `motivation_stated`, `motivation_evidence`).
- Update the `LAYER1_SYSTEM_PROMPT` constant with categories 8–11 in the EXTRACTION CONTRACT and the OUTPUT example extension per ADR-005 §4.
- Update `validateLayer1Schema` to assert the new fields per ADR-005 §6.
- Re-run `tsc --noEmit -p .` to verify no type errors.

### Step 2 — Update `/website/src/lib/translation-sandwich/layer2-mechanisms.ts`

Per ADR-006 amendment (M1-CP4b):
- Add the new controlled-vocabulary types (`IntakeTriggerCode`, `DeferralStatus`, `MotivationClassification`).
- Add the three new interfaces (`SoftClarification`, `OpenDeferralEntry`, `IntakeClarifications`).
- Add `motivation_classification` to `IterativeRefinement`.
- Add `intake_clarifications` to `Layer2Assessment`.
- Implement the new §3.9 trigger detection algorithm with all four trigger steps + the lookup tables (eupatheia display names + descriptions + passion counterparts + virtue descriptions + convention substitution description + katorthoma proximity labels).
- Wire the new step into `applyMechanisms` after §3.8 (hasty assent risk) and before the final assembly. The new step is `detectIntakeClarifications(...)` returning `{intake_clarifications, motivation_classification}`; assemble both into `Layer2Assessment`.
- Update `validateLayer2Assessment` per ADR-006 §5 amendment.
- Re-run `tsc --noEmit -p .` to verify no type errors.

### Step 3 — Update `/website/src/lib/translation-sandwich/layer3-prose.ts`

Per ADR-007 amendment (M1-CP4b):
- Add the two new fields (`soft_clarification_prose`, `open_deferrals_prose`) to `Layer3Prose`.
- Update `LAYER3_SYSTEM_PROMPT_API_REASON` with the new prose-fields 4 + 5 instructions + the MARGINAL-CASE DISCIPLINE EXTENSION block + the second WORKED EXAMPLE block.
- Update `generateFallbackProse` per ADR-007 §6 amendment:
  - Append the AC-14 marginal-case sentences to philosophical_reflection when EUPATHEIA_BOUNDARY or PRAXIS_MOTIVATION_AMBIGUITY entries are present.
  - Render `soft_clarification_prose` from canned d-a16 stem templates per the SoftClarification entry (or null when empty).
  - Render `open_deferrals_prose` from canned d-a16 stem templates per the OpenDeferralEntry entries (or null when empty).
- Update `validateLayer3Prose` per ADR-007 §7 amendment.
- Re-run `tsc --noEmit -p .` to verify no type errors.

### Step 4 — Update `/website/scripts/verify-translation-sandwich.ts`

- Add F5 (eupatheia-shape) + F6 (stated-equanimity-with-passion) fixtures per ADR-005 §8.1.
- Update Phase 1 assertions to include F5 + F6 expectations per ADR-005 §8.2.
- Update Phase 4 expectations to assert F5 produces non-empty `open_deferrals` (EUPATHEIA_BOUNDARY); F6 produces non-empty `soft_clarifications` (STATED_EQUANIMITY_UNVERIFIED); F1–F4 produce empty `intake_clarifications`.
- Add Phase 5 assertions 8 + 9 + 10 per ADR-007 §8.2 amendment (soft-clarification surfacing, open-deferral surfacing, fallback prose intake-clarification parity).
- Update SUMMARY message to reflect the new assertion count.

### Step 5 — Run the harness

Run with `LAYER1_REPLAY_CACHE=1` for Phases 1+2 (to use cached F1–F4 outputs); F5 + F6 will incur fresh Sonnet calls (~$0.20-0.40). Phase 5 runs against fresh Sonnet for all six fixtures (~$0.30-0.80). Total expected cost: ~$0.50-1.20.

If any phase fails:
- Phase 1/2 failure on F5 or F6: likely Sonnet under-extraction or schema-key drift. Per the existing PR5 watch-status pattern, this is the third potential recurrence of "LLM marginal-case discipline requires worked OUTPUT examples" — if it fires, promote PR5 from watch to permanent KG entry.
- Phase 4 failure on F5 or F6: likely a bug in the §3.9 trigger detection logic. Trace through the algorithm manually.
- Phase 5 failure on assertions 8/9/10: likely the LLM is producing prose with wrong shape OR the fallback isn't honouring the stem-rendering discipline. Per the existing PR5 watch-status pattern, surface the worked-example fix-in-session as a candidate amendment.

If amendments are needed mid-session, follow the existing M1-CP1/CP3 in-session amendment pattern (founder approves; ADR + module update together; harness re-run).

### Step 6 — Confirm + verify

When harness is green:
- `tsc --noEmit -p .` clean (compile).
- All assertions passing including the new 8/9/10.
- F5 + F6 produce non-null intake_clarifications outputs as specified.
- F1–F4 produce empty intake_clarifications (no regressions on the existing fixtures).

### Step 7 — Append decision-log entry (lean form)

Pattern: per `/adopted/standing-protocol-cache.md` §"Lean decision-log entry".

ID suggestion: `D-M1-CP4c-LAYER-MODULES-AC14-TIER2-IMPLEMENTED-2026-MM-DD`. Cross-references: `D-M1-CP4b-AC14-TIER2-ADR-AMENDMENTS-2026-05-06` + the four amended ADRs + the harness file.

### Step 8 — Session close (lean form)

Pattern: per `/adopted/standing-protocol-cache.md` §"Lean session close". The next-session prompt names M1-CP4d (multi-turn input flow design ADR for AC-13 Tier 1) — Standard-tier governance.

## Part C — Anticipated session shape

| Phase | Estimate |
|---|---|
| Cache + predecessor close + four ADRs read | 30-45 min |
| Step 1 — Layer 1 module update | 45-75 min |
| Step 2 — Layer 2 module update (new §3.9 algorithm + lookup tables) | 60-120 min |
| Step 3 — Layer 3 module update (prompt + fallback) | 45-90 min |
| Step 4 — Harness extension (F5 + F6 + assertions 8/9/10) | 30-60 min |
| Step 5 — Run harness (first-pass) | 5-15 min + $0.50-1.20 |
| Step 5 contingent — in-session amendments if any phase fails | 30-90 min if needed |
| Step 6 — Confirm + verify | 15-30 min |
| Decision-log + close (lean) | 30-45 min |
| **Total (clean run)** | **~4-6 hours** |
| **Total (one in-session amendment)** | **~5-7 hours** |

If two or more in-session amendments are needed, suggest pausing at session midpoint to avoid loss of context; founder may split into M1-CP4c + M1-CP4c-followup.

## Rollback path

`git revert` of this session's commit. The three modules + harness revert to their pre-M1-CP4c state. The four ADR amendments from M1-CP4b remain in place (a separate revert step would be needed if the founder wants to revert both). Module rollback has no production effect — the parallel-run path remains dormant by default; if active, the parallel path produces comparison data without the new `intake_clarifications` fields, which preserves the M1-CP4 contract (additive change, schema versions unchanged).

## Forecast

If M1-CP4c lands clean: M1-CP4d is the next session — multi-turn input flow design ADR for AC-13 Tier 1. Standard-tier governance. The architectural design call: server-side ephemeral session vs client-renders-form stateless protocol vs Tier 1 deferred to a later milestone. M1-CP4e (Critical-tier route updates) follows only if M1-CP4d adopts Tier 1 in scope.

If M1-CP4c surfaces algorithmic issues (false positives on STATED_OPERATIVE_CONFLICT, eupatheia over-detection, motivation_classification mis-defaults): the issues are surfaced and either fixed in-session (per the existing M1-CP1/CP3 pattern) or deferred to M1-CP4c-followup with a decision-log entry naming the deferral. The architectural intent is preserved — the four triggers are deterministic and traceable; refinement is a normal Layer 2 algorithm-tuning concern.

End of prompt.
