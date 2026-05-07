# Next-Session Prompt — return-to-M1-CP5: refreshed comparison-rubric read against post-M1-CP5c parallel-run sample

**Stream:** founder.
**Tier:** governance — analysis-primary read-only against existing data.
**Governing frame:** /adopted/standing-protocol-cache.md (full governance via the cache; deliverable-of-the-day named below).
**Predecessor session close:** `/operations/handoffs/founder/2026-05-07-sub-session-M1-CP5c-close.md`.
**Predecessor decision-log entries:** `D-M1-CP5c-LAYER3-MODULE-AMENDED-2026-05-07` (the seven Revisions implemented + per-row spot-check verdict on F1–F4); `D-M1-CP5b-ADR-007-AMENDMENT-2026-05-07` (the seven Revisions adopted); `D-M1-CP5-COMPARISON-RUBRIC-FIRST-PASS-2026-05-07` (the seven gaps catalogued + the rubric this session re-runs).
**Risk classification:** Standard under 0d-ii. Read-only analysis against existing data. No code touched. No production state change. AC4/AC5/AC7/PR6 NOT engaged. Critical Change Protocol NOT engaged. The session may surface a need for code changes (M1-CP5d) or a downstream Critical session (M1-CP6 cutover); those are scoped + risk-classified separately.

## Why this session matters

M1-CP5c implemented the seven Revisions to ADR-007's Layer 3 prompt template; the per-row spot-check of 4 parallel-run rows produced at standard depth confirmed the Revise election worked — every Revision passes on the rows reviewed. return-to-M1-CP5 is the formal verdict: re-run the six-dimension comparison rubric per ADR-004 §6.4 against the larger post-M1-CP5c sample and decide cutover-readiness for M1-CP6. The decision is binary by founder: cutover (M1-CP6 — Critical tier with R10 announcement), revise-again (M1-CP5d — likely focused on the open questions carried forward), or rollback (revert parallel-run wiring; revisit ADR-003).

The session does not write code. It reads data + composes the founder's verdict.

## Pre-conditions

1. M1-CP5c commit + push completed. Both commits are on `main`: the partial commit ("M1-CP5c (partial): Layer 3 module + harness amended per ADR-007 Revisions 1-7") and the close commit ("M1-CP5c (close): Revision 5 strengthening + governance close"). Vercel is green.
2. ADR-004 §6.4 (the six-dimension rubric) read at session open.
3. ADR-007 §3 + Amendment section 2026-05-07 read at session open (the prose-quality target).
4. The six open questions from `D-M1-CP5c-LAYER3-MODULE-AMENDED-2026-05-07` reviewed at session open (Q1 over-imitation soft-warns; Q2 F4 JSON variance; Q3 Pattern B heuristic at scale; Q4 PR8 held; Q5 Revision 7 soft-warn firing; Q6 pedagogical upstream causal-chain references).
5. Sufficient parallel-run sample. M1-CP5c produced 4 rows at standard depth. If the founder wants more before this session, click 4–6 more fixtures on `/admin/test-reason` between sessions (each click is ~$0.03; ~$0.20 ceiling for expansion).
6. Founder-attended browser session for SQL queries against `supabase-us`.
7. No env-flag changes anticipated.
8. No Supabase schema changes anticipated.

## Part A — Open under the protocol

Read in order:

1. `/adopted/standing-protocol-cache.md` (~3 min — confirms tier `governance`, Standard risk class, model selection per Element 6, signals).
2. `/operations/handoffs/founder/2026-05-07-sub-session-M1-CP5c-close.md` (~5 min — predecessor close).
3. `/operations/decision-log.md` last entry `D-M1-CP5c-LAYER3-MODULE-AMENDED-2026-05-07` — read in full, especially the Open Questions section.
4. `/adopted/adr/2026-05-04-translation-sandwich-pilot-api-reason.md` §6.4 — the six-dimension rubric this session re-runs.
5. `/adopted/adr/2026-05-04-layer3-prose-template-api-reason.md` Amendment section dated 2026-05-07 — the prose-quality target.
6. The seven gaps from `D-M1-CP5-COMPARISON-RUBRIC-FIRST-PASS-2026-05-07` — read the rubric data table from M1-CP5 for comparison.

Confirm at session open per cache + governance protocol:

- **Tier:** `governance` — Standard risk under 0d-ii (read-only analysis; no code touched; no production state change).
- **Hold-point:** P0 0h active.
- **Model selection:** N/A this session (no LLM calls; pure SQL + prose review).
- **Status vocabulary:** Layer 3 module currently Verified (amended); ADR-007 currently Adopted (amended). Either status may change at session close pending founder verdict (e.g., Layer 3 module → Live at M1-CP6 cutover).
- **Engaged rules:** R0, R5, R8a, R8c, R7, AC1 (cited not exercised), AC8, KG1, KG7 (JSONB read paths), PR1, PR5 (carry-forward of M1-CP5c open questions). NOT engaged: AC4, AC5, AC7, PR6.

## Part B — Procedure

### Step 1 — Sample inventory

Run this SQL against `supabase-us` to inventory the post-M1-CP5c sample:

```sql
SELECT
  COUNT(*) FILTER (WHERE tier1_aware = true AND created_at > '2026-05-07 06:00:00'::timestamptz) AS post_cp5c_rows,
  COUNT(*) FILTER (WHERE tier1_aware = true AND created_at > '2026-05-07 06:00:00'::timestamptz AND translation_sandwich_output->>'clarification_required' = 'true') AS post_cp5c_tier1_fires,
  COUNT(*) FILTER (WHERE tier1_aware = true AND created_at > '2026-05-07 06:00:00'::timestamptz AND translation_sandwich_output->'prose' IS NOT NULL) AS post_cp5c_prose_rows,
  COUNT(*) FILTER (WHERE tier1_aware = true AND created_at <= '2026-05-07 06:00:00'::timestamptz) AS pre_cp5c_rows
FROM translation_sandwich_comparisons;
```

Expected: `post_cp5c_rows ≥ 4` (the M1-CP5c spot-check rows); `post_cp5c_prose_rows = post_cp5c_rows - post_cp5c_tier1_fires` (rows with prose are the ones that didn't Tier-1 short-circuit); `pre_cp5c_rows ≥ 8` (the M1-CP5 first-pass rubric data).

If `post_cp5c_prose_rows < 5`, founder may want to click a few more fixtures on `/admin/test-reason` before continuing the rubric run. Optional; the seven Revisions can be assessed on as few as 4 rows per the M1-CP5c spot-check.

### Step 2 — Six-dimension rubric refresh per ADR-004 §6.4

Run each of the six rubric queries against the post-M1-CP5c sample. Compare to the M1-CP5 first-pass results captured in `D-M1-CP5-COMPARISON-RUBRIC-FIRST-PASS-2026-05-07`.

**Rubric Dimension 1 — Layer 1 latency:**

```sql
SELECT
  ROUND(AVG((layer_latencies->>'layer1_ms')::numeric), 0) AS avg_layer1_ms,
  ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY (layer_latencies->>'layer1_ms')::numeric), 0) AS median_layer1_ms,
  ROUND(PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY (layer_latencies->>'layer1_ms')::numeric), 0) AS p95_layer1_ms
FROM translation_sandwich_comparisons
WHERE tier1_aware = true
  AND created_at > '2026-05-07 06:00:00'::timestamptz
  AND layer_latencies->>'layer1_ms' IS NOT NULL;
```

Compare to M1-CP5 first-pass (avg 13,355 ms). Expectation: similar magnitude (Layer 1 is unchanged in M1-CP5c).

**Rubric Dimension 2 — Layer 3 latency:**

```sql
SELECT
  COUNT(*) AS layer3_rows,
  ROUND(AVG((layer_latencies->>'layer3_ms')::numeric), 0) AS avg_layer3_ms,
  ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY (layer_latencies->>'layer3_ms')::numeric), 0) AS median_layer3_ms,
  ROUND(PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY (layer_latencies->>'layer3_ms')::numeric), 0) AS p95_layer3_ms
FROM translation_sandwich_comparisons
WHERE tier1_aware = true
  AND created_at > '2026-05-07 06:00:00'::timestamptz
  AND layer_latencies->>'layer3_ms' IS NOT NULL;
```

Compare to M1-CP5 first-pass (avg 14,228 ms). The new prompt is longer (more rules + worked examples + heuristics) but the OUTPUT is also longer (extended philosophical_reflection budget when AC-13/14/single_snapshot/kathekon-null fire). Expect modest increase or comparable magnitude. Flag if avg > 25,000 ms — that would indicate the prompt is significantly slowing Sonnet.

**Rubric Dimension 3 — Sandwich vs bundled total latency:**

```sql
SELECT
  COUNT(*) AS rows_with_both,
  ROUND(AVG((layer_latencies->>'total_ms')::numeric), 0) AS avg_sandwich_total_ms,
  ROUND(AVG(bundled_depth_latency_ms), 0) AS avg_bundled_total_ms,
  ROUND(PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY bundled_depth_latency_ms), 0) AS p95_bundled_ms
FROM translation_sandwich_comparisons
WHERE tier1_aware = true
  AND created_at > '2026-05-07 06:00:00'::timestamptz
  AND layer_latencies->>'total_ms' IS NOT NULL
  AND bundled_depth_latency_ms IS NOT NULL;
```

Compare to M1-CP5 first-pass (sandwich 22,248 ms vs bundled 53,354 ms — 42%). Expectation: similar magnitude.

**Rubric Dimension 4 — Cost per request (sandwich):**

```sql
SELECT
  COUNT(*) AS rows,
  ROUND(AVG((layer_costs->>'total_usd')::numeric), 4) AS avg_cost_usd,
  ROUND(SUM((layer_costs->>'total_usd')::numeric), 4) AS cumulative_cost_usd,
  COUNT(*) FILTER (WHERE (layer_costs->>'total_usd')::numeric > 0.05) AS over_baseline,
  COUNT(*) FILTER (WHERE (layer_costs->>'total_usd')::numeric > 0.10) AS over_action
FROM translation_sandwich_comparisons
WHERE tier1_aware = true
  AND created_at > '2026-05-07 06:00:00'::timestamptz
  AND layer_costs->>'total_usd' IS NOT NULL;
```

Compare to M1-CP5 first-pass (avg $0.0306/req; 0 over $0.05; 0 over $0.10). The new prompt is longer (more input tokens) so per-request cost may rise modestly. Flag if avg > $0.05 or any single request > $0.10.

**Rubric Dimension 5 — Tier 1 fire distribution:**

```sql
SELECT
  COALESCE(translation_sandwich_output->>'trigger_code', 'no_clarification') AS trigger_code,
  COUNT(*) AS row_count
FROM translation_sandwich_comparisons
WHERE tier1_aware = true
  AND created_at > '2026-05-07 06:00:00'::timestamptz
GROUP BY trigger_code
ORDER BY row_count DESC;
```

Compare to M1-CP5 first-pass (ELEMENT_FUSION ×2 / TEMPORAL_AMBIGUITY ×1 / SCOPE_AMBIGUITY ×0). The post-M1-CP5c sample is smaller; pattern may not be reliable until larger sample accumulates.

**Rubric Dimension 6 — Proximity match (sandwich vs bundled):**

```sql
SELECT
  request_id,
  bundled_depth_output->'result'->>'katorthoma_proximity' AS bundled_proximity,
  translation_sandwich_output->'assessment'->>'katorthoma_proximity' AS sandwich_proximity,
  CASE
    WHEN bundled_depth_output->'result'->>'katorthoma_proximity' = translation_sandwich_output->'assessment'->>'katorthoma_proximity'
    THEN 'match'
    ELSE 'differ'
  END AS verdict
FROM translation_sandwich_comparisons
WHERE tier1_aware = true
  AND created_at > '2026-05-07 06:00:00'::timestamptz
  AND bundled_depth_output->'result'->>'katorthoma_proximity' IS NOT NULL
  AND translation_sandwich_output->'assessment'->>'katorthoma_proximity' IS NOT NULL
ORDER BY created_at DESC;
```

Compare to M1-CP5 first-pass (40% match — sandwich differentiating; bundled mode-collapsing to `deliberate`). The Layer 2 mechanism is unchanged in M1-CP5c, so the proximity distribution should be similar.

### Step 3 — Prose-quality spot-check across post-M1-CP5c sample

Run this SQL to read the prose for spot-check:

```sql
SELECT
  request_id,
  created_at,
  translation_sandwich_output->'prose'->>'philosophical_reflection' AS reflection,
  translation_sandwich_output->'prose'->>'improvement_guidance' AS guidance,
  translation_sandwich_output->'prose'->>'summary' AS summary
FROM translation_sandwich_comparisons
WHERE tier1_aware = true
  AND created_at > '2026-05-07 06:00:00'::timestamptz
  AND translation_sandwich_output->'prose' IS NOT NULL
ORDER BY created_at DESC;
```

For each row, verify the seven Revisions per the M1-CP5c spot-check rubric:

- **Revision 1** ✅ if the LAST sentence of `reflection` is an actionable orientation (a "the work is to…" statement, a concrete practice, a Stoic move) — NOT "this is a single snapshot…", "cannot be determined…", "no specific improvement path…", "polished surface over passion", "from virtue or from convention".
- **Revision 1** ✅ if the LAST sentence of `guidance` is a concrete practice — NOT just mechanism naming.
- **Revision 3** ✅ if every Greek term has an English gloss in parentheses on its first appearance anywhere in the response.
- **Revision 4** ✅ if no sentence predicates "evil" or "good" of the practitioner's character; phrases like "the indifferent is being treated as a genuine evil — that is the false judgement, not your standing" are CORRECT.
- **Revision 5** ✅ if marginal-case sentences (single-snapshot, kathekon-null, EUPATHEIA_BOUNDARY, PRAXIS_MOTIVATION_AMBIGUITY, no-improvement-path) appear MID-PROSE and not as the closing sentence; AND if the LLM correctly applies the input-condition heuristic (omits when no temporal hook / no appropriateness question).
- **Revision 6** ✅ if for any fixture where the input has a clear preferred-indifferent, the prose names the indifferent + the agent's framing + the structural finding.
- **Revision 7** ✅ if `guidance` reads heavier and more action-oriented than `reflection`.

### Step 4 — Open question track-rate

For each of the six open questions carried forward, count occurrences across the post-M1-CP5c sample.

**Q1 — Persistent OUTPUT-example over-imitation soft-warns.** No SQL test (this fires in the harness, not in the parallel-run rows). Run the harness once locally and inspect the `[INFO] ... soft-warn: prose names Greek identifier(s) not in assessment` lines:

```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/website"
LAYER1_REPLAY_CACHE=1 LAYER3_FORCE_REGEN=1 npx tsx scripts/verify-translation-sandwich.ts 2>&1 | grep "soft-warn: prose names Greek"
```

Cost: ~$0.28–$1.12 (the harness regenerates L3 caches with live Sonnet calls). Optional — the M1-CP5c session already captured this.

**Q2 — F4 one-off JSON parse failure.** Run the same harness command above. If F4.P5 throws again with the same `extractJSON` error, the issue is recurring; if it passes, the M1-CP5c run was a one-off. If recurring, add to the M1-CP5d agenda.

**Q3 — Pattern B input-condition heuristic effectiveness at scale.** From Step 3's prose review: count rows where (a) input has temporal hook AND single-snapshot disclaimer is present mid-prose, vs (b) input has no temporal hook AND single-snapshot disclaimer is absent. The heuristic is robust if (a) and (b) align with assessment field marginality. Misalignment is a Revision 5 drift; track count.

**Q4 — PR8 promotion candidate.** Note the recurrence count for the in-session prompt-strengthening pattern. Currently at three (M1-CP3 amendment 1, M1-CP3 amendment 2, M1-CP5c). If this session's verdict requires another in-session prompt strengthening (M1-CP5d candidate), the count increments to four and PR8 promotion becomes likely. Founder decides.

**Q5 — Revision 7 soft-warn observed-firing pattern.** From Step 3 inspection of harness output: count the `[INFO] ... soft-warn (Revision 7 proportion)` lines. Expectation per Revision 7: rare or zero firings. If frequent, either the LLM is not honouring the proportion guidance or the heuristic is too strict.

**Q6 — Pedagogical correctness of "wrong assessment stage" warnings.** From Step 3 review of any soft-warn: classify each as either "pedagogically correct upstream causal-chain reference" (the prose names a stage upstream of the assessment's lodged stage as the corrective intercept point — Stoic discipline) or "straight imitation" (the prose names a Greek term solely because it appears in the OUTPUT example). If most are pedagogical, the soft-warn rule may need refinement.

### Step 5 — Founder verdict

The verdict is binary, with three branches:

**Branch A — Cutover (advance to M1-CP6).** All seven Revisions pass on the larger sample; no new failure modes surfaced beyond the M1-CP5c open questions; cost / latency / proximity match indicators support cutover; founder confirms user-facing readiness. Next session: M1-CP6 cutover (Critical tier; full Critical Change Protocol; R10 announcement; Layer 1 cache cost-aware accounting refresh).

**Branch B — Revise-again (M1-CP5d).** Specific failure modes surfaced that warrant another module + harness amendment cycle. Likely candidates from current open questions: amend OUTPUT example to vary causal stages (Q1); strengthen `extractJSON` or "no markdown" instruction (Q2); refine soft-warn rule for upstream causal-chain references (Q6). M1-CP5d is Elevated tier (similar to M1-CP5c). Estimated ~2–3 hours.

**Branch C — Rollback.** The new prose template introduces regressions the founder cannot accept; sandwich path is reverted from the parallel-run wiring; ADR-003 (the architectural decision) is revisited. Critical tier (touches the parallel-run env flag in production). Estimated ~3–4 hours plus an architectural rethink session.

Branch A is the expected outcome based on M1-CP5c spot-check evidence. Branches B and C are contingencies.

### Step 6 — Append decision-log entry (lean form)

Pattern: per `/adopted/standing-protocol-cache.md` §"Lean decision-log entry". ID: `D-M1-CP5-RETURN-RUBRIC-REFRESH-2026-MM-DD`. Cross-references: `D-M1-CP5c-LAYER3-MODULE-AMENDED-2026-05-07`, `D-M1-CP5b-ADR-007-AMENDMENT-2026-05-07`, `D-M1-CP5-COMPARISON-RUBRIC-FIRST-PASS-2026-05-07`.

Entry MUST capture: the six rubric dimensions' refreshed values; the prose-quality verdict per Revision; the open-question track-rate; the founder's binary verdict (Branch A / B / C); the next session named.

### Step 7 — Session close (lean form) + draft next-session prompt

Pattern: per `/adopted/standing-protocol-cache.md` §"Lean session close". The next-session prompt depends on the verdict:

- **Branch A:** `/operations/handoffs/founder/2026-MM-DD-M1-CP6-NEXT-SESSION-PROMPT.md` — Critical tier; full Critical Change Protocol; R10 announcement scope.
- **Branch B:** `/operations/handoffs/founder/2026-MM-DD-M1-CP5d-NEXT-SESSION-PROMPT.md` — Elevated tier; specific revisions named.
- **Branch C:** `/operations/handoffs/founder/2026-MM-DD-M1-CP-ROLLBACK-NEXT-SESSION-PROMPT.md` — Critical tier; rollback protocol.

## Part C — Anticipated session shape

| Phase | Estimate |
|---|---|
| Cache + predecessor close + ADR §6.4 + ADR-007 Amendment + open-questions read | 15–20 min |
| Step 1 — sample inventory | 5–10 min |
| Step 2 — six-dimension rubric refresh | 25–35 min |
| Step 3 — prose-quality spot-check across sample | 25–40 min (depends on sample size) |
| Step 4 — open-question track-rate (incl. optional harness re-run) | 15–30 min |
| Step 5 — founder verdict | 10–15 min |
| Step 6 — decision-log entry (lean form) | 15–20 min |
| Step 7 — session close (lean form) + next-session prompt (Branch A / B / C) | 20–35 min |
| **Total** | **~2–3 hours** |

Branch A's session close is shorter (cleaner handoff to M1-CP6); Branch B's is medium (adds Revision-specific scope); Branch C's is longest (architectural rethink scope).

## Rollback path

This session is read-only against existing data; no `git revert` needed. Founder's verdict is the rollback gesture relative to the cutover-now alternative if Branch C is chosen — the cutover commit is not made; the parallel-run is reverted via separate Critical-tier session.

## Forecast

If Branch A: M1-CP6 cutover follows (~3–4 hours; Critical tier with full Critical Change Protocol + R10 announcement). Total path from M1-CP5c onwards to cutover: ~5–7 hours session time across 2 sub-sessions plus the brief sample-expansion period within return-to-M1-CP5.

If Branch B: M1-CP5d follows (~2–3 hours; Elevated tier). Then return-to-M1-CP5-prime (~1.5–2 hours; Standard tier). Then M1-CP6. Total path adds ~3–5 hours if B fires.

If Branch C: rollback session (~3–4 hours; Critical tier) + architectural rethink session (variable). The sandwich engine architecture would need re-evaluation per ADR-003 from a new starting point.

This is the verdict-by-evidence session. The work proven at M1-CP5 + the design proven at M1-CP5b + the implementation proven at M1-CP5c arrives here for the cutover-readiness call.

End of prompt.
