# Next-Session Prompt — M1-CP4f: Parallel-run observation infrastructure + harness assertion strategy refactor

**Stream:** founder.
**Tier:** code-elevated.
**Governing frame:** `/adopted/standing-protocol-cache.md` (full governance via the cache; deliverables named per task below).
**Predecessor session close:** `/operations/handoffs/founder/2026-05-07-sub-session-M1-CP4e-B-close.md`.
**Predecessor decision-log entries:** `D-M1-CP4e-B-AC13-TIER1-DEPLOYED-2026-05-07` (Tier 1 deployed end-to-end); `D-M1-CP4e-A-LAYER-MODULES-ROUTE-HARNESS-AC13-TIER1-IMPLEMENTED-NO-DEPLOY-2026-05-06` (modules + ADRs).
**Risk classification:** Elevated under 0d-ii (changes to existing user-facing functionality possible — parallel-run orchestrator instrumentation + `/admin/test-reason` page). Critical Change Protocol NOT engaged this session — no auth, encryption, R20a perimeter, or deployment-config changes expected.

## Why this session matters

M1-CP4e-B deployed AC-13 Tier 1 force-clarification end-to-end. The Tier 1 mechanic is operative in the dormant sandwich path; user-facing remains bundled-depth (parallel-run dormant default; cutover at M1-CP6). M1-CP4f handles the post-deployment cleanup + observation infrastructure that was deferred from M1-CP4e: parallel-run logging cleanup, comparison-table baseline reset before M1-CP5 reads the rubric, per-layer cost capture for R5 cost-health alert calibration, admin/test-reason Tier 1 fixtures for founder smoke-testing without auth, and the harness assertion strategy refactor promoted to permanent KG entry at M1-CP4e-B (extending the structural-over-content principle systematically).

This session is the bridge between M1-CP4e (Tier 1 deployment) and M1-CP5 (resume comparison rubric reads + first-pass interpretation). M1-CP5 needs (a) clean comparison-table data with Tier 1 fires correctly logged + pre-Tier-1 baseline rows filtered, (b) per-layer cost data for R5 thresholds, (c) the with-Tier-1 engine's behaviour visible via admin fixtures.

## Pre-conditions

1. M1-CP4e-B deploy commit + push completed (Vercel green) AND the M1-CP4e-B session-close + KG-entry + this prompt's governance commit completed.
2. Vercel build green (latest commit deployed).
3. Founder ready for an Elevated-tier session — typically 2–3 hours.
4. Anthropic API key in `.env.local` (low marginal cost expected; Step 3 may issue a small number of Sonnet calls to confirm token-usage extraction works end-to-end).
5. Vercel project access available (no env var changes anticipated).
6. Supabase SQL Editor access (Step 1 baseline reset).

## Part A — Open under the protocol

Read in order:

1. `/adopted/standing-protocol-cache.md` (~3 min — confirms tier `code-elevated`, model selection, risk class, signals).
2. `/operations/handoffs/founder/2026-05-07-sub-session-M1-CP4e-B-close.md` (~5 min — predecessor close).
3. `/operations/decision-log.md` last 2 entries (`D-M1-CP4e-B-AC13-TIER1-DEPLOYED-2026-05-07` + `D-M1-CP4e-A-LAYER-MODULES-ROUTE-HARNESS-AC13-TIER1-IMPLEMENTED-NO-DEPLOY-2026-05-06`).
4. `/operations/knowledge-gaps.md` § "Promoted pattern (3rd+ recurrence — load-bearing resolution) — Harness assertions on subjective LLM extractions must be structural, not content-specific" (the new permanent KG entry from M1-CP4e-B; **load-bearing for Step 5**).
5. `/adopted/adr/2026-05-04-translation-sandwich-pilot-api-reason.md` §6.3 (failure isolation) + §10 (checkpoint table).

Confirm at session open per cache + Elevated-tier protocol:

- Tier: `code-elevated` — Elevated risk under 0d-ii.
- Hold-point: P0 0h active.
- Model selection (per cache Element 6): N/A or Sonnet at low usage. Layer 1 / Layer 3 calls already governed by AC1.
- Status vocabulary: `parallel-run.ts` orchestrator at Verified end-to-end (M1-CP4e-B); `/admin/test-reason` at Wired (M1-CP4 — needs Tier 1 fixtures); harness at Verified (273/273 at M1-CP4e-B).
- Engaged rules: R5 (cost-as-health-metric — per-layer cost capture), R0 (oikeiosis audit trail), AC8 (translation-sandwich engine extension), KG1 (Vercel five rules — await all DB writes; no fire-and-forget on cost-tracker writes), PR1 (single-endpoint proof preserved — `/api/reason` is M1 pilot), PR5 (the new permanent KG entry — apply structural-over-content to other assertions). AC4/AC5/AC7 NOT engaged (no R20a perimeter or auth surface touched).

## Part B — Procedure

### Step 1 — Comparison-table baseline reset

Pre-Tier-1 rows in `translation_sandwich_comparisons` (the `12 sandwich_completed / 37 total` accumulated pre-M1-CP4e per the M1-CP4e-A close's Step C monitoring) need to be filtered out before M1-CP5 reads the rubric. The sandwich engine now produces Tier 1 response shapes in the dormant path; the rubric reader needs to handle them, and pre-Tier-1 rows would skew first-pass interpretation.

Surface options at session open + recommend; founder picks:

- **(A) Truncate** — `DELETE FROM translation_sandwich_comparisons WHERE created_at < '2026-05-07T00:00:00Z';` (cleaner; non-reversible without backup).
- **(B) Filter via flag column** — `ALTER TABLE translation_sandwich_comparisons ADD COLUMN tier1_aware boolean DEFAULT true;` then `UPDATE translation_sandwich_comparisons SET tier1_aware = false WHERE created_at < '2026-05-07T00:00:00Z';` (reversible; rubric reader filters on `tier1_aware = true`).

Apply via Supabase SQL Editor. Both options are Standard risk (idempotent migration). Verify with `SELECT COUNT(*) FROM translation_sandwich_comparisons WHERE [filter];`.

### Step 2 — Parallel-run.ts orchestrator follow-up

Confirm sandwich-path Tier 1 fires log correctly to `translation_sandwich_comparisons` during parallel-run. Read the current orchestrator + the comparison-table writer; confirm `composeTier1ResponseShape` outputs land in the comparison row's `translation_sandwich_output` correctly (Tier 1 response shape vs full assessment shape — both must serialise cleanly). Verify failure isolation per ADR-004 §6.3 + ADR-008 §7 against any real traffic that arrived during the M1-CP4e-B observation window (query `translation_sandwich_comparisons` for rows after the M1-CP4e-B deploy commit timestamp).

If a Tier 1 fire was captured in real traffic, inspect the row to confirm the `translation_sandwich_output` JSON includes the discriminated-union shape (`clarification_required: true` + `trigger_code` + `continuation_token`) and that the `bundled_output` (user-facing) contains the bundled-depth full evaluation.

If no real traffic arrived, write a small probe query that exercises the orchestrator with an F7/F8/F9-style input via `/admin/test-reason` (which Step 4 wires up).

### Step 3 — Per-layer cost capture

Extend `extractFeatures` (Layer 1, in `layer1-extractor.ts`) and `generateProse` (Layer 3, in `layer3-prose.ts`) to return token usage from the Anthropic API response (`usage.input_tokens`, `usage.output_tokens`). Update return types accordingly. Wire into `parallel-run.ts` cost-tracker. Update `verify-translation-sandwich.ts` Phase 9 to report per-layer cost when available.

This is M1-CP5 first-pass Open Q1 from `D-M1-PARALLEL-RUN-FIRST-PASS-DEFERRED-2026-05-05`; addressing it here unblocks M1-CP5's R5 cost-health alert calibration.

Marginal LLM cost: ~$0.10 if a fresh harness run is needed to confirm usage extraction works end-to-end. Otherwise zero (the harness can run in REPLAY mode against existing caches and report zero usage; the wire-up is what matters).

### Step 4 — Admin/test-reason Tier 1 fixtures

The `/admin/test-reason` page (added 2026-05-04) needs prepopulated Tier 1 test inputs so the founder can smoke-test without going through the sagereasoning.com auth flow. Add three buttons:

- **F7-style ELEMENT_FUSION** — populate the input field with F7's text from the harness FIXTURES array.
- **F8-style SCOPE_AMBIGUITY** — populate with F8's text.
- **F9-style TEMPORAL_AMBIGUITY** — populate with F9's text.

Wire to call `/api/reason` with the corresponding text. Display the response shape distinctly: full evaluation (existing render) OR force-clarification request (new render — show `trigger_code`, `clarification.question_text`, `meta.fired_at_position`, mention `continuation_token` is present without displaying it).

This is the founder-facing surface that exercises Tier 1 end-to-end.

### Step 5 — Harness assertion strategy refactor

Per the new permanent KG entry from M1-CP4e-B: extend the structural-over-content principle systematically to other content-specific assertions in `verify-translation-sandwich.ts`:

- `proseHasUndecidableKathekonPhrasing` (kathekon-null prose matcher).
- `proseHasSingleSnapshotPhrasing` (single_snapshot prose matcher).
- `proseHasNoImprovementPathPhrasing` (no-improvement-path matcher).
- EUPATHEIA_BOUNDARY / PRAXIS_MOTIVATION_AMBIGUITY stem fragment matchers (Phase 5 assertions 8 and 9).

For each: audit whether content-specific or structural. For content-specific, broaden to lexical-set membership (paraphrases) OR pivot to structural (predicate + diagnostic INFO). Same pattern as the M1-CP4e-B F5 EUPATHEIA matcher pivot. Run harness in REPLAY mode after each change; expect 273/273 baseline maintained.

### Step 6 — Verify

```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/website" && npx tsc --noEmit -p . && LAYER1_REPLAY_CACHE=1 npx tsx scripts/verify-translation-sandwich.ts
```

Expected: tsc clean (no output); harness 273+/273+ PASS (count may grow if new assertions added during the refactor).

Optional: re-run without `LAYER1_REPLAY_CACHE` on founder's machine if structural pivots affect cached state expectations OR if Step 3's cost capture wire-up requires a fresh Sonnet call to confirm usage fields populate.

### Step 7 — Append decision-log entry (lean form)

Pattern: per `/adopted/standing-protocol-cache.md` §"Lean decision-log entry". ID: `D-M1-CP4f-PARALLEL-RUN-OBSERVATION-INFRA-2026-MM-DD`. Cross-references: `D-M1-CP4e-B-AC13-TIER1-DEPLOYED-2026-05-07`, `D-M1-CP4e-A-LAYER-MODULES-ROUTE-HARNESS-AC13-TIER1-IMPLEMENTED-NO-DEPLOY-2026-05-06`, `D-M1-PARALLEL-RUN-FIRST-PASS-DEFERRED-2026-05-05` (the open question this session resolves for cost capture).

### Step 8 — Session close (lean form)

Pattern: per `/adopted/standing-protocol-cache.md` §"Lean session close". Names M1-CP5 resume (comparison rubric reads + first-pass interpretation against the with-Tier-1 engine; governance + Elevated) as the next session.

## Part C — Anticipated session shape

| Phase | Estimate |
|---|---|
| Cache + predecessor close + KG-entry read + decision-log read | 15-20 min |
| Step 1 — comparison-table baseline reset (option pick + SQL apply + verify) | 15-25 min |
| Step 2 — orchestrator follow-up (read + verify + probe) | 20-30 min |
| Step 3 — per-layer cost capture (extract + wire + Phase 9 update) | 30-45 min |
| Step 4 — admin/test-reason fixtures (3 buttons + response renderer) | 25-40 min |
| Step 5 — harness assertion strategy refactor (audit + pivot 4-5 matchers) | 40-60 min |
| Step 6 — verify (tsc + harness) | 10-15 min |
| Step 7 + 8 — decision-log + session close (lean form) | 25-40 min |
| **Total** | **~3-4 hours** |

## Rollback path

Each step is independently revertible via `git revert`. No production behaviour change is introduced — admin/test-reason is founder-only; orchestrator changes are observational; cost capture is additive (existing flow continues if usage extraction fails). The comparison-table baseline reset (Step 1) is the most consequential SQL change; option B (flag column) is fully reversible via UPDATE; option A (truncate) requires Supabase backup restore if reversal is needed (low likelihood — pre-Tier-1 rows have limited analytical value).

## Forecast

If M1-CP4f lands clean: M1-CP5 resumes with comparison rubric reads against the with-Tier-1 engine; first-pass interpretation; per-layer cost data informs R5 cost-health alert thresholds. Tier 1 fires visible in the comparison table for analytical observation. Admin/test-reason exercises the Tier 1 mechanic for founder smoke-testing without the auth flow.

After M1-CP5 (governance + Elevated): the next major checkpoint is M1-CP6 (cutover — Critical). The orchestrator becomes user-facing; bundled-depth engine retired from the user-facing path; Tier 1 fires surface to clients; R10 announcement of the new public API contract.

End of prompt.
