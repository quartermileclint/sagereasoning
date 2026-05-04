# Next-Session Prompt — M1-CP5: Parallel-run observation + cutover decision

**Stream:** founder.
**Tier:** `governance` (analysis + decision-log entry; no code change unless rollback is decided).
**Governing frame:** `/adopted/standing-protocol-cache.md` (lean form; no Critical Change Protocol unless the founder decides rollback at this session).
**Predecessor session close:** `/operations/handoffs/founder/2026-05-04-sub-session-M1-CP4-close.md`.
**Predecessor decision-log entries:**
- `D-M1-CP4-PARALLEL-RUN-WIRING-2026-05-04` (M1-CP4 — `/api/reason` Wired (parallel-run, dormant by default); harness Phases 1-9 all passing 124/124)
- `D-M1-CP3-LAYER3-MODULE-AND-ADR007-2026-05-04` (M1-CP3 — Layer 3 module + ADR-007 + two amendments)
- `D-M1-CP2-LAYER2-MODULE-AND-ADR006-2026-05-04` (M1-CP2 — Layer 2 module + ADR-006)
- `D-M1-CP1-LAYER1-MODULE-AND-ADR005-2026-05-04` (M1-CP1 — Layer 1 module + ADR-005)
- `D-E10-ADR004-DRAFTED-AND-ADOPTED-2026-05-04` (E10 — ADR-004 codification)

**Risk classification:** **Standard** under 0d-ii (analysis; documentation-only). Critical Change Protocol NOT engaged at session open. **Engages later in the session ONLY IF the founder decides rollback** (which would reclassify the wiring revert as Critical per the cache's R20a perimeter row).

## Why this session matters

This is the analytical session that decides what M1-CP4's parallel-run period showed. The two engines have been running side-by-side for some duration (founder-controlled — at most 14 days OR $50 OR 1000 requests, whichever first). The comparison data is in `translation_sandwich_comparisons`. The cost-tracker tells you whether the cap was reached.

Three outcomes are possible (per ADR-004 §10):

1. **Cutover.** The translation-sandwich is at least as good as the bundled-depth path on the comparison rubric. The founder advances to M1-CP6 (Critical-tier; full Critical Change Protocol; the bundled-depth path is removed; translation-sandwich becomes the sole user-facing path; public deprecation notice required).
2. **Revise.** The data shows specific issues that warrant revisiting Layer 1 prompt OR Layer 2 deterministic rules OR Layer 3 prompt template. A new ADR amends the relevant Layer ADR; another parallel-run period follows.
3. **Rollback.** The data shows the translation-sandwich is materially worse than bundled-depth, OR the cost is unsustainable, OR a structural problem in ADR-003/ADR-004 needs revisiting. The wiring commit is reverted; ADR-003 + ADR-004 are revisited.

This session writes the decision in the decision log. The founder's call.

## Pre-conditions

1. The two SQL migrations (`translation_sandwich_comparisons` + `translation_sandwich_cost_tracker`) have been applied via Supabase SQL Editor — confirmed at the M1-CP4 close Step A.
2. The M1-CP4 commit has been pushed via GitHub Desktop and Vercel rebuild succeeded — confirmed at M1-CP4 close Step B + C.
3. The env flag `TRANSLATION_SANDWICH_PARALLEL_RUN=1` has been set in Vercel Production for at least some duration (founder's call) — Step D of M1-CP4 close.
4. At least one of: the request count has reached a meaningful threshold (≥ 50–100 rows for any meaningful analysis); OR 14 days have elapsed; OR `cap_reached=true` in the tracker. The founder decides what counts as "meaningful" for this session's analysis.
5. The founder has at least 2-4 hours for the analysis + decision.

## Part A — Open under the protocol

Read in order:

1. `/adopted/standing-protocol-cache.md` (~3 min — confirms tier `governance`, lean form applies).
2. `/operations/handoffs/founder/2026-05-04-sub-session-M1-CP4-close.md` (~5 min — predecessor close).
3. `/adopted/adr/2026-05-04-translation-sandwich-pilot-api-reason.md` (ADR-004) **§6.4 + §10 in full** — the comparison rubric the founder applies + the M1-CP5 deliverable description.
4. `/operations/decision-log.md` last 1 entry (D-M1-CP4 — full context).

Confirm at session open per cache:
- Tier: **`governance`** (analysis only at start; reclassifies upward only if rollback is chosen)
- Hold-point: P0 0h active
- Status vocabulary: at session close, `/api/reason` either reaches **Verified** (cutover decision) OR remains **Wired (parallel-run)** (revise decision) OR returns to its M1-CP3 **Wired** state (rollback decision)
- Risk class: **Standard** for the analysis; reclassifies to Critical if rollback is chosen
- AC4 + AC5 + AC8: ENGAGED only if rollback (the wiring revert touches the perimeter route)
- PR1 + PR3 + PR4 + PR6: ENGAGED only if rollback

## Part B — Procedure

### Step 1 — Pull the comparison data

The founder runs queries against `translation_sandwich_comparisons` and reports the results. Suggested queries (the AI may surface variations or additional queries based on what the founder is looking for):

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

### Step 2 — Apply the comparison rubric (ADR-004 §6.4)

For a sample of completed rows (e.g., 10–20 rows), the founder reads the bundled-depth `katorthoma_proximity` vs the translation-sandwich `assessment.katorthoma_proximity` and notes agreement/disagreement. Same for virtue domains overlap; passions detected match; causal stage agreement; per-mechanism stage scores. The founder may also spot-check Layer 3 prose quality for a few rows.

The AI helps with the SQL queries that pull rows for spot-checking; the founder does the qualitative reading.

### Step 3 — Decide

The founder names the decision (cutover / revise / rollback) and the reasoning. The AI surfaces concerns once if it has them.

### Step 4 — Append decision-log entry (lean form)

Pattern: per `/adopted/standing-protocol-cache.md` §"Lean decision-log entry".

ID suggestion: `D-M1-CP5-PARALLEL-RUN-OUTCOME-2026-MM-DD`. Cross-references: D-M1-CP4 + ADR-004 §6.4 + §10 + the SQL queries used.

### Step 5 — Session close (lean form)

Pattern: per `/adopted/standing-protocol-cache.md` §"Lean session close". The next-session prompt names M1-CP6 (if cutover) — Critical-tier, full Critical Change Protocol — OR a follow-on revision session (if revise) OR the rollback close (if rollback).

## Part C — Anticipated session shape

| Phase | Estimate |
|---|---|
| Cache + predecessor close + ADR-004 §6.4 + §10 read | 15-20 min |
| Step 1 — pull data | 15-30 min |
| Step 2 — apply rubric (spot-check 10-20 rows) | 60-120 min |
| Step 3 — decide | 15-45 min |
| Decision-log + close (lean) | 30-45 min |
| **Total** | **~2-4 hours** |

If the founder decides rollback, add ~60-90 min for the revert + push + verification (escalates this session to Critical-tier mid-session).

## Rollback path (if decided at Step 3)

- Soft rollback: set Vercel env `TRANSLATION_SANDWICH_PARALLEL_RUN=0` (or remove); redeploy. Parallel path becomes a no-op; user-facing behaviour unchanged. Comparison data preserved.
- Code rollback: `git revert <M1-CP4-commit-SHA>` + push. Vercel rebuild reverts route to its M1-CP3 state. Comparison data preserved (or dropped via SQL — founder runs the DROP).

The decision to escalate this session to Critical-tier is the founder's call at Step 3.

## Forecast

If cutover is decided: M1-CP6 is the next session — Critical-tier. The bundled-depth call is removed from the route; translation-sandwich becomes the sole user-facing path. Public deprecation notice for external API consumers (per ADR-004 §10.2 — at least 14 days' lead; specific timing decided at this session). R10 announcement.

If revise is decided: a new amendment session follows (likely M1-CP4b or a new sub-session under whichever Layer ADR is being amended). Another parallel-run period follows.

If rollback is decided: ADR-003 + ADR-004 are revisited. The translation-sandwich migration is paused or restructured. The bundled-depth engine remains the sole path until a new approach is approved.

End of prompt.
