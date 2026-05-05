# Next-Session Prompt — M1-CP5 resume: Parallel-run observation + cutover decision

**Stream:** founder.
**Tier:** `governance` (analysis + decision-log entry; no code change unless rollback is decided OR unless the founder folds Open Q1 cost-capture wiring into this session — which would reclassify the relevant step to `code-standard`).
**Governing frame:** `/adopted/standing-protocol-cache.md` (lean form; no Critical Change Protocol unless the founder decides rollback at this session).
**Predecessor session close:** `/operations/handoffs/founder/2026-05-05-sub-session-M1-CP5-first-pass-deferred-close.md`.
**Predecessor decision-log entries:**
- `D-M1-CP5-FIRST-PASS-DEFERRED-2026-05-05` (M1-CP5 first-pass — first data pull; insufficient data; deferred)
- `D-M1-CP4-PARALLEL-RUN-WIRING-2026-05-04` (M1-CP4 — `/api/reason` Wired (parallel-run, dormant by default); harness Phases 1-9 all passing 124/124)
- `D-M1-CP3-LAYER3-MODULE-AND-ADR007-2026-05-04` through `D-M1-CP1-LAYER1-MODULE-AND-ADR005-2026-05-04` (Layer modules + ADRs)
- `D-E10-ADR004-DRAFTED-AND-ADOPTED-2026-05-04` (E10 — ADR-004 codification)

**Risk classification:** **Standard** under 0d-ii at session open (analysis; documentation-only). Critical Change Protocol NOT engaged at session open. **Engages later in the session ONLY IF the founder decides rollback** (which would reclassify the wiring revert as Critical per the cache's R20a perimeter row).

## Why this session matters

Same as the original M1-CP5: this is the analytical session that decides what the parallel-run period showed. The first-pass attempt on 2026-05-05 surfaced only 12 usable rows — below the meaningful-analysis threshold — and was deferred per `D-M1-CP5-FIRST-PASS-DEFERRED-2026-05-05`. This session resumes the M1-CP5 procedure with a meaningful sample. Three outcomes per ADR-004 §10 remain available: **cutover** (advance to M1-CP6, Critical-tier, full Critical Change Protocol, public deprecation notice required); **revise** (specific issues warrant revisiting Layer 1 prompt OR Layer 2 deterministic rules OR Layer 3 prompt template); **rollback** (revert M1-CP4 wiring; revisit ADR-003 + ADR-004).

## Pre-conditions

1. The two SQL migrations (`translation_sandwich_comparisons` + `translation_sandwich_cost_tracker`) are applied (confirmed at M1-CP4 close Step A; remain applied — this session does not redo them).
2. The M1-CP4 commit is in production via Vercel (confirmed at M1-CP4 close Step B + C; remains in production).
3. `TRANSLATION_SANDWICH_PARALLEL_RUN=1` is active in Vercel Production (confirmed active as of 2026-05-05 first-pass; no need to re-activate).
4. **The data threshold is met (founder's call):**
   - **Working threshold:** `count(*) WHERE translation_sandwich_output IS NOT NULL ≥ 50` in `translation_sandwich_comparisons`.
   - OR `cap_reached = true` in `translation_sandwich_cost_tracker` (note: cap is cost-based; if Open Q1 below is not yet wired, cumulative cost stays at 0 and cap will not trigger — fall back to row count or elapsed time).
   - OR 14 days elapsed from `period_start = 2026-05-04` (i.e., from 2026-05-18).
   - OR the founder chooses to resume regardless.
5. **Open Question 1 disposition (founder's call at session-open):**
   - **Option (a) — Resume without cost data.** Acknowledge the limitation in the resume entry; cutover would carry the cost question into M1-CP6 unresolved. Defensible if the latency win + rubric agreement rates are decisive.
   - **Option (b) — Wire per-layer cost capture first this session.** Adds a Standard-tier code session step ahead of the analysis. `extractFeatures` and `generateProse` expose token usage; orchestrator multiplies via the existing `sonnetCostMicrocents` utility and writes via `incrementCostTracker`. Once wired, allow some traffic to accumulate cost data, then proceed to the analysis. May extend session significantly.
   - **Option (c) — Wire cost capture as a separate small Standard-tier session before this resume.** Cleanest scoping but requires another session-open.

## Part A — Open under the protocol

Read in order:

1. `/adopted/standing-protocol-cache.md` (~3 min — confirms tier `governance`, lean form applies; if Option (b) is chosen at session-open, also note `code-standard` for the wiring step).
2. `/operations/handoffs/founder/2026-05-05-sub-session-M1-CP5-first-pass-deferred-close.md` (~5 min — predecessor close).
3. `/operations/handoffs/founder/2026-05-04-sub-session-M1-CP4-close.md` (~5 min — M1-CP4 close, including the testing-period deadline principle).
4. `/adopted/adr/2026-05-04-translation-sandwich-pilot-api-reason.md` **§6.4 + §10 in full** (~10 min — comparison rubric + checkpoint structure; unchanged).
5. `/operations/decision-log.md` last 2 entries (D-M1-CP5-FIRST-PASS-DEFERRED + D-M1-CP4-PARALLEL-RUN-WIRING — full context).

Confirm at session open per cache:
- Tier: **`governance`** (analysis only at start; reclassifies upward only if rollback is chosen or if Option (b) cost-capture wiring is folded into this session).
- Hold-point: P0 0h active.
- Status vocabulary: at session close, `/api/reason` either reaches **Verified** (cutover decision) OR remains **Wired (parallel-run)** (revise decision) OR returns to its M1-CP3 **Wired** state (rollback decision).
- Risk class: **Standard** for the analysis; reclassifies to Critical if rollback is chosen.
- AC4 + AC5 + AC8: ENGAGED only if rollback (the wiring revert touches the perimeter route). Engaged for cost-capture wiring step under Option (b) at minimum AC1 + AC8.
- PR1 + PR3 + PR4 + PR6: ENGAGED only if rollback.

## Part B — Procedure

### Step 0 (conditional) — Wire per-layer cost capture (Option (b) only)

Skip if Option (a) or (c) is chosen at session-open. If Option (b):

- `/website/src/lib/translation-sandwich/layer1-extractor.ts` — modify `extractFeatures` to return token usage alongside the schema (additive return-shape change; one call site to update).
- `/website/src/lib/translation-sandwich/layer3-prose.ts` — same for `generateProse`.
- `/website/src/lib/translation-sandwich/parallel-run.ts` — capture token counts; multiply via existing `sonnetCostMicrocents`; write via existing `incrementCostTracker`.
- Standard-tier per cache. tsc clean. Push via GitHub Desktop. Vercel auto-rebuilds. Allow some traffic to accumulate cost data, then resume Step 1.

### Step 1 — Pull the comparison data

Same three queries as the first-pass attempt (same SQL is reproduced here for self-containment). Run in Supabase Dashboard → SQL Editor:

```sql
-- Total rows + failure breakdown
SELECT
  count(*) AS total,
  count(*) FILTER (WHERE translation_sandwich_output IS NOT NULL) AS sandwich_completed,
  count(*) FILTER (WHERE translation_sandwich_error IS NOT NULL) AS sandwich_failed,
  count(*) FILTER (WHERE translation_sandwich_error = 'layer1_throw') AS layer1_failures,
  count(*) FILTER (WHERE translation_sandwich_error = 'layer3_throw') AS layer3_failures,
  count(*) FILTER (WHERE translation_sandwich_error = 'deadline_exceeded') AS deadline_failures,
  count(*) FILTER (WHERE translation_sandwich_error = 'cost_cap_reached') AS cap_failures
FROM translation_sandwich_comparisons;

-- Per-layer latency distribution
SELECT
  percentile_cont(0.5) WITHIN GROUP (ORDER BY layer1_latency_ms) AS layer1_p50,
  percentile_cont(0.95) WITHIN GROUP (ORDER BY layer1_latency_ms) AS layer1_p95,
  percentile_cont(0.5) WITHIN GROUP (ORDER BY layer3_latency_ms) AS layer3_p50,
  percentile_cont(0.95) WITHIN GROUP (ORDER BY layer3_latency_ms) AS layer3_p95,
  percentile_cont(0.5) WITHIN GROUP (ORDER BY bundled_depth_latency_ms) AS bundled_p50,
  percentile_cont(0.95) WITHIN GROUP (ORDER BY bundled_depth_latency_ms) AS bundled_p95
FROM translation_sandwich_comparisons
WHERE translation_sandwich_output IS NOT NULL;

-- Cost tracker state
SELECT * FROM translation_sandwich_cost_tracker;
```

Filter the 25 pre-fix `deadline_exceeded` rows by querying `WHERE translation_sandwich_output IS NOT NULL` (already applied to the latency query above). Optionally, the founder may DELETE the pre-fix rows in SQL Editor before the analysis (Open Q2 from the first-pass close).

### Step 2 — Apply the comparison rubric (ADR-004 §6.4)

For a sample of completed rows (the prompt's first-pass envelope was 10–20; with ≥50 rows now, suggest 15–25 for spot-checking — the founder may scope as desired). The founder reads the bundled-depth `katorthoma_proximity` vs the translation-sandwich `assessment.katorthoma_proximity` and notes agreement/disagreement. Same for virtue domains overlap; passions detected match; causal stage agreement; per-mechanism stage scores. The founder may also spot-check Layer 3 prose quality for a few rows.

The AI helps with the SQL queries that pull rows for spot-checking; the founder does the qualitative reading.

### Step 3 — Decide

The founder names the decision (cutover / revise / rollback) and the reasoning. The AI surfaces concerns once if it has them.

### Step 4 — Append decision-log entry (lean form)

Pattern: per `/adopted/standing-protocol-cache.md` §"Lean decision-log entry".

ID suggestion: `D-M1-CP5-OUTCOME-2026-MM-DD`. Cross-references: `D-M1-CP5-FIRST-PASS-DEFERRED-2026-05-05` + `D-M1-CP4-PARALLEL-RUN-WIRING-2026-05-04` + ADR-004 §6.4 + §10 + the SQL queries used.

### Step 5 — Session close (lean form)

Pattern: per `/adopted/standing-protocol-cache.md` §"Lean session close". The next-session prompt names M1-CP6 (if cutover) — Critical-tier, full Critical Change Protocol — OR a follow-on revision session (if revise) OR the rollback close (if rollback).

## Part C — Anticipated session shape

| Phase | Estimate |
|---|---|
| Cache + predecessor closes + ADR-004 §6.4 + §10 read | 15-20 min |
| Step 0 (Option (b) only) — cost-capture wiring + traffic accumulation pause | +60-120 min if chosen |
| Step 1 — pull data | 10-20 min |
| Step 2 — apply rubric (spot-check 15-25 rows) | 60-150 min |
| Step 3 — decide | 15-45 min |
| Decision-log + close (lean) | 30-45 min |
| **Total (Options (a)/(c))** | **~2-4 hours** |
| **Total (Option (b))** | **~3-6 hours, possibly across two sittings** |

If the founder decides rollback at Step 3, add ~60-90 min for the revert + push + verification (escalates this session to Critical-tier mid-session).

## Rollback path (if decided at Step 3)

- **Soft rollback:** Vercel → Settings → Environment Variables → `TRANSLATION_SANDWICH_PARALLEL_RUN` → set to `0` (or remove); redeploy. Parallel path becomes a no-op; user-facing behaviour unchanged. Comparison data preserved.
- **Code rollback:** `git revert <M1-CP4-commit-SHA>` + push. Vercel rebuild reverts route to its M1-CP3 state. Comparison data preserved (or dropped via SQL — founder runs the DROP).

The decision to escalate this session to Critical-tier is the founder's call at Step 3.

## Forecast

If cutover is decided: M1-CP6 is the next session — Critical-tier. The bundled-depth call is removed from the route; translation-sandwich becomes the sole user-facing path. Public deprecation notice for external API consumers (per ADR-004 §10.2 — at least 14 days' lead; specific timing decided at this session). R10 announcement.

If revise is decided: a new amendment session follows (likely M1-CP5b or a new sub-session under whichever Layer ADR is being amended). Another parallel-run period follows.

If rollback is decided: ADR-003 + ADR-004 are revisited. The translation-sandwich migration is paused or restructured. The bundled-depth engine remains the sole path until a new approach is approved.

End of prompt.
