# Next-Session Prompt — M1-CP5: Comparison rubric reads + first-pass interpretation against the with-Tier-1 engine

**Stream:** founder.
**Tier:** code-elevated (analysis-primary; SQL-primary; small-touch on documentation; founder-decision sub-step at end is governance-only).
**Governing frame:** `/adopted/standing-protocol-cache.md` (full governance via the cache; deliverables named per task below).
**Predecessor session close:** `/operations/handoffs/founder/2026-05-07-sub-session-M1-CP4f-close.md`.
**Predecessor decision-log entries:** `D-M1-CP4f-PARALLEL-RUN-OBSERVATION-INFRA-2026-05-07` (observation infrastructure landed); `D-M1-CP4e-B-AC13-TIER1-DEPLOYED-2026-05-07` (Tier 1 deployed); `D-M1-PARALLEL-RUN-FIRST-PASS-DEFERRED-2026-05-05` (the predecessor first-pass that deferred this work).
**Risk classification:** Elevated under 0d-ii (analysis is read-only against existing data; no production touch). Critical Change Protocol NOT engaged at the analysis step. **If the founder's cutover decision at Step 5 is "rollback" or "revise", a follow-up session is required and may engage Critical Change Protocol depending on path.**
**Supersedes:** `/operations/handoffs/founder/2026-05-05-M1-CP5-RESUME-NEXT-SESSION-PROMPT.md` (V1, written before M1-CP4e Tier 1 + M1-CP4f observability; archive when convenient).

## Why this session matters

M1-CP4e-B deployed AC-13 Tier 1 force-clarification end-to-end. M1-CP4f wired the observation infrastructure (per-layer cost capture; comparison-table baseline reset via `tier1_aware`; admin/test-reason F7/F8/F9 fixtures + Tier-1-aware renderer; harness structural-matcher refactor). M1-CP5 is the analytical step the entire M1 arc has been building toward: read the comparison-rubric data, interpret it against ADR-004 §6.4 + R5 cost-health thresholds, and surface the cutover decision to the founder.

The session output is *not* code or schema — it is a structured interpretation report that lets the founder decide: **cutover** (advance to M1-CP6 — Critical), **revise** (revisit Layer specifications), or **rollback** (revert parallel-run; revisit ADR-003). Per ADR-004 §10's checkpoint table, M1-CP5 is "Standard (analysis; no code change unless rollback)" — promoted to Elevated here because the cutover decision sets the trajectory for M1-CP6 (which is Critical) and M2/M3/M4 consumer migrations.

## Pre-conditions

1. M1-CP4f commit + push verified green on Vercel (founder confirmed Steps A–E during M1-CP4f close).
2. **Comparison-table seed data exists.** At M1-CP4f close, post-Tier-1 row count was 0. Founder must have either (a) accumulated real `/api/reason` traffic since 2026-05-07, or (b) seeded the table by clicking F1/F4/F7/F8/F9 buttons on `/admin/test-reason`. If neither has happened, **Step 1 below seeds the table before any analysis begins**.
3. Founder ready for an Elevated-tier session — typically 2–3 hours.
4. Supabase SQL Editor access (most analysis is SQL-driven).
5. Anthropic API key in `.env.local` only required if rollback or seed-via-harness paths are taken; not required for the primary analysis path.
6. No env-flag changes anticipated.

## Part A — Open under the protocol

Read in order:

1. `/adopted/standing-protocol-cache.md` (~3 min — confirms tier `code-elevated`, model selection, risk class, signals).
2. `/operations/handoffs/founder/2026-05-07-sub-session-M1-CP4f-close.md` (~5 min — predecessor close).
3. `/operations/decision-log.md` last 2 entries (`D-M1-CP4f-PARALLEL-RUN-OBSERVATION-INFRA-2026-05-07` + `D-M1-CP4e-B-AC13-TIER1-DEPLOYED-2026-05-07`).
4. `/adopted/adr/2026-05-04-translation-sandwich-pilot-api-reason.md` §6.4 (comparison rubric — the analytical contract this session implements) + §10 (checkpoint table — M1-CP5 row + M1-CP6 + rollback paths) + §10.2 (rollback at each checkpoint — names the M1-CP5 rollback gesture).
5. `/website/migrations/2026-05-04-translation-sandwich-comparisons.sql` (the comparison-table schema — column names + types for the SQL queries below).

Confirm at session open per cache + Elevated-tier protocol:

- **Tier:** `code-elevated` — Elevated risk under 0d-ii (analysis-primary; rollback path possibly engaging Critical, deferred).
- **Hold-point:** P0 0h active.
- **Model selection (per cache Element 6):** N/A for primary analysis path. If a non-REPLAY harness re-run is needed (Step 1 seed-via-harness option), Sonnet for Layer 1 + Layer 3 per AC1.
- **Status vocabulary:** `translation_sandwich_comparisons` schema at Verified (M1-CP4f); per-layer cost capture at Verified (M1-CP4f); harness at Verified (273/273 REPLAY M1-CP4f); rubric reader: **does not exist yet — this session is the first read.** Comparison data: post-Tier-1 row count = 0 at M1-CP4f close; this session seeds + reads.
- **Engaged rules:** R0 (oikeiosis — the engine's behaviour against the rubric is the audit subject); R5 (cost-as-health-metric — alert thresholds proposed this session); R8a (controlled vocabulary — preserved in interpretation); AC1 (model selection — only if Step 1 seed-via-harness path); AC8 (translation-sandwich engine — the subject of analysis); KG1 (Vercel five rules — N/A this session, no code changes); KG7 (JSONB storage format — relevant for SQL queries against `translation_sandwich_output`); PR1 (single-endpoint proof — `/api/reason` is M1 pilot; this session interprets the proof's data); PR5 (the permanent KG entry on structural assertions — applies to Step 4's spot-check methodology). **NOT engaged:** AC4, AC5, AC7 (no R20a perimeter or auth surface touched); PR6 (no safety-critical surface touched at the analysis step); PR3 (synchronous discipline — no async work).

## Part B — Procedure

### Step 1 — Seed comparison-table data (conditional)

Open Supabase SQL Editor → + New query → paste + RUN:

```sql
SELECT
  COUNT(*) FILTER (WHERE tier1_aware = true) AS tier1_aware_rows,
  COUNT(*) FILTER (WHERE tier1_aware = true AND translation_sandwich_output->>'clarification_required' = 'true') AS tier1_fires,
  COUNT(*) FILTER (WHERE tier1_aware = true AND translation_sandwich_error IS NOT NULL) AS sandwich_failures,
  COUNT(*) FILTER (WHERE tier1_aware = false) AS pre_tier1_rows
FROM translation_sandwich_comparisons;
```

**If `tier1_aware_rows < 10`:** seed via `/admin/test-reason`. Founder visits `https://sagereasoning.com/admin/test-reason`, clicks each fixture button → **Send** in this order: F1, F2, F3, F4, F7, F8, F9. Cost: ~$0.06–0.13 per click × 7 ≈ $0.50–1.00. Re-run the count query above; expect `tier1_aware_rows ≥ 7`, `tier1_fires ≥ 3` (one per F7/F8/F9). If sandwich_failures > 0, investigate before proceeding.

**If `tier1_aware_rows ≥ 10`:** proceed directly to Step 2.

### Step 2 — Read comparison-rubric data via SQL

Run each query below in Supabase SQL Editor. Save results in chat for the AI to interpret in Step 3.

**Query 2a — Latency distribution:**

```sql
SELECT
  ROUND(AVG(layer1_latency_ms)) AS avg_layer1_ms,
  ROUND(AVG(layer3_latency_ms) FILTER (WHERE layer3_latency_ms IS NOT NULL)) AS avg_layer3_ms,
  ROUND(AVG(layer1_latency_ms + COALESCE(layer3_latency_ms, 0))) AS avg_sandwich_total_ms,
  ROUND(AVG(bundled_depth_latency_ms)) AS avg_bundled_ms,
  ROUND(percentile_cont(0.5) WITHIN GROUP (ORDER BY bundled_depth_latency_ms)) AS median_bundled_ms,
  ROUND(percentile_cont(0.95) WITHIN GROUP (ORDER BY bundled_depth_latency_ms)) AS p95_bundled_ms,
  COUNT(*) AS row_count
FROM translation_sandwich_comparisons
WHERE tier1_aware = true;
```

**Query 2b — Cost distribution:**

```sql
SELECT
  ROUND(AVG(layer1_cost_usd_microcents)) AS avg_layer1_microcents,
  ROUND(AVG(layer3_cost_usd_microcents) FILTER (WHERE layer3_cost_usd_microcents IS NOT NULL)) AS avg_layer3_microcents,
  ROUND(AVG(layer1_cost_usd_microcents + COALESCE(layer3_cost_usd_microcents, 0))) AS avg_total_sandwich_microcents,
  ROUND(SUM(layer1_cost_usd_microcents + COALESCE(layer3_cost_usd_microcents, 0))) AS sum_sandwich_microcents,
  ROUND(AVG(layer1_cost_usd_microcents + COALESCE(layer3_cost_usd_microcents, 0))::numeric / 1000000, 6) AS avg_sandwich_usd,
  COUNT(*) FILTER (WHERE layer1_cost_usd_microcents IS NOT NULL) AS rows_with_cost_data
FROM translation_sandwich_comparisons
WHERE tier1_aware = true;
```

**Query 2c — Tier 1 fire distribution:**

```sql
SELECT
  translation_sandwich_output->>'trigger_code' AS trigger_code,
  translation_sandwich_output->'meta'->>'fired_at_position' AS fired_at_position,
  COUNT(*) AS count
FROM translation_sandwich_comparisons
WHERE tier1_aware = true
  AND translation_sandwich_output->>'clarification_required' = 'true'
GROUP BY trigger_code, fired_at_position
ORDER BY count DESC;
```

**Query 2d — Failure modes:**

```sql
SELECT
  translation_sandwich_error,
  COUNT(*) AS count
FROM translation_sandwich_comparisons
WHERE tier1_aware = true
  AND translation_sandwich_error IS NOT NULL
GROUP BY translation_sandwich_error
ORDER BY count DESC;
```

**Query 2e — Proximity match (per ADR-004 §6.4 first bullet).** Excludes Tier 1 fires (those have no full assessment) and sandwich failures.

```sql
SELECT
  COUNT(*) FILTER (
    WHERE bundled_depth_output->'depth_data'->>'katorthoma_proximity' =
          translation_sandwich_output->'assessment'->>'katorthoma_proximity'
  ) AS proximity_matches,
  COUNT(*) FILTER (
    WHERE bundled_depth_output->'depth_data'->>'katorthoma_proximity' IS NOT NULL
      AND translation_sandwich_output->'assessment'->>'katorthoma_proximity' IS NOT NULL
  ) AS comparable_rows,
  ROUND(
    100.0 * COUNT(*) FILTER (
      WHERE bundled_depth_output->'depth_data'->>'katorthoma_proximity' =
            translation_sandwich_output->'assessment'->>'katorthoma_proximity'
    )::numeric
    / NULLIF(COUNT(*) FILTER (
      WHERE bundled_depth_output->'depth_data'->>'katorthoma_proximity' IS NOT NULL
        AND translation_sandwich_output->'assessment'->>'katorthoma_proximity' IS NOT NULL
    ), 0),
    1
  ) AS match_rate_pct
FROM translation_sandwich_comparisons
WHERE tier1_aware = true
  AND translation_sandwich_error IS NULL
  AND (translation_sandwich_output->>'clarification_required') IS DISTINCT FROM 'true';
```

> **Note on JSONB paths:** Query 2e assumes `bundled_depth_output.depth_data.katorthoma_proximity` and `translation_sandwich_output.assessment.katorthoma_proximity`. If the bundled-depth shape uses a different key path, the query returns 0 matches with non-zero comparable_rows — **AI should grep `sage-reason-engine.ts` for the actual bundled-depth output shape and adjust the path before re-running.** Same caveat applies to virtue-domains + passions-detected queries the AI may compose during Step 3.

**Query 2f — Per-layer cost vs R5 threshold ($50 cap; $0.05/req baseline):**

```sql
SELECT
  ROUND(AVG(layer1_cost_usd_microcents + COALESCE(layer3_cost_usd_microcents, 0))::numeric / 1000000, 6) AS avg_total_usd,
  COUNT(*) FILTER (
    WHERE (layer1_cost_usd_microcents + COALESCE(layer3_cost_usd_microcents, 0)) > 100000
  ) AS rows_over_10c,
  COUNT(*) FILTER (
    WHERE (layer1_cost_usd_microcents + COALESCE(layer3_cost_usd_microcents, 0)) > 50000
  ) AS rows_over_5c,
  COUNT(*) FILTER (WHERE layer1_cost_usd_microcents IS NOT NULL) AS rows_with_cost_data
FROM translation_sandwich_comparisons
WHERE tier1_aware = true
  AND translation_sandwich_error IS NULL;
```

### Step 3 — First-pass interpretation

Compose a structured interpretation note covering the six ADR-004 §6.4 dimensions:

1. **Latency** — sandwich vs bundled; user-facing latency impact at cutover (= max(bundled, sandwich) per concurrent execution model); whether p95 is acceptable.
2. **Cost** — per-layer; total per-request; aggregate cost burn rate against the $50 cap; **R5 cost-health alert threshold proposal** (e.g., "alert if 24-hour cost > $1.00 OR per-request avg > 2× current observed median").
3. **Tier 1 fire distribution** — which triggers fire most; whether the rate is consistent with under-firing calibration intent (low fire rate is intended; over-firing is the painful failure mode per ADR-008).
4. **Failure modes** — sandwich-side failures + their distribution; whether failure-isolation is holding (user-facing path remained bundled-depth in every failure case).
5. **Proximity match** — engine-agreement signal on `katorthoma_proximity`; if low, surfaces the question of whether the deterministic Layer 2 mechanism + LLM-driven bundled-depth produce comparable assessments.
6. **Prose quality** (deferred to Step 4 — manual spot-check).

Include a short paragraph framing whether the data supports cutover, revise, or rollback at the current observation count. If the observation count is small (<20 rows), explicitly flag that confidence is provisional and either (a) recommend extending the parallel-run period, or (b) recommend cutover anyway if no findings disqualify.

### Step 4 — Layer 3 prose-quality spot-check (per ADR-004 §6.4 last bullet)

Sample 5 random rows from `translation_sandwich_comparisons` where `tier1_aware = true` AND `translation_sandwich_error IS NULL` AND `translation_sandwich_output->>'clarification_required' IS DISTINCT FROM 'true'`. For each: compare `bundled_depth_output.philosophical_reflection` (or equivalent prose field) against `translation_sandwich_output.prose.philosophical_reflection`. Score qualitatively on three axes: factual accuracy (is the prose consistent with the underlying assessment?); voice (does it sound Stoic, addresses the practitioner in second person?); helpfulness (would a practitioner reading this find it useful?).

This is the founder's reading task. AI provides the SQL to fetch the 5 rows + the comparison framework; founder reads and reports findings. Do not attempt to automate prose quality — per the permanent KG entry, prose quality is a structural-vs-content judgement that resists automation.

```sql
SELECT
  request_id,
  created_at,
  bundled_depth_output->'depth_data'->>'philosophical_reflection' AS bundled_prose,
  translation_sandwich_output->'prose'->>'philosophical_reflection' AS sandwich_prose
FROM translation_sandwich_comparisons
WHERE tier1_aware = true
  AND translation_sandwich_error IS NULL
  AND (translation_sandwich_output->>'clarification_required') IS DISTINCT FROM 'true'
ORDER BY random()
LIMIT 5;
```

### Step 5 — Cutover decision input

AI surfaces the structured interpretation (Step 3 + Step 4 findings) + the three options + each option's downstream consequences:

- **Cutover (M1-CP6)** — translation-sandwich becomes sole user-facing engine on `/api/reason`. Critical Change Protocol applies. R10 announcement required (public API breaking change for external agent developers per ADR-004 §10.2 final row). Bundled engine remains as scaffolding for M2/M3/M4 until M5.
- **Revise** — revisit one or more of ADR-005 (Layer 1 schema) / ADR-006 (Layer 2 mechanism algorithm) / ADR-007 (Layer 3 prose template). Re-runs M1-CP4-CP5 cycle on revised modules. Standard tier per the revision scope; potentially Elevated if module changes are user-facing.
- **Rollback** — `git revert` the parallel-run wiring commit. The route returns to bundled-depth-only. Revisits ADR-003 + ADR-004 with the M1-CP5 findings. Standard tier (per ADR-004 §10.2 M1-CP5 rollback row).

Founder decides. AI does not advocate; AI provides options + reasoning + downstream consequences only.

If the founder's choice is **cutover**: M1-CP6 next-session prompt is drafted at the close of this session OR as a separate prompt-drafting session at founder's discretion (per the M1-CP4f close pattern — prompt-drafting can be the closing task of a session or its own session).

If the founder's choice is **revise** or **rollback**: AI drafts the revision/rollback session prompt at the close of this session.

### Step 6 — Append decision-log entry (lean form)

Pattern: per `/adopted/standing-protocol-cache.md` §"Lean decision-log entry". ID: `D-M1-CP5-COMPARISON-RUBRIC-FIRST-PASS-2026-MM-DD`. Cross-references: `D-M1-CP4f-PARALLEL-RUN-OBSERVATION-INFRA-2026-05-07`, `D-M1-CP4e-B-AC13-TIER1-DEPLOYED-2026-05-07`, `D-M1-PARALLEL-RUN-FIRST-PASS-DEFERRED-2026-05-05`, `D-RAG-MENTOR-ALT3-VALIDATED-2026-05-02` (architectural validation — the foundation the rubric tests against).

Entry MUST capture the Step 3 + Step 4 findings + the founder's Step 5 decision. If the decision is "cutover", entry names M1-CP6 as next session. If "revise" or "rollback", entry names the revision/rollback session as next session.

### Step 7 — Session close (lean form)

Pattern: per `/adopted/standing-protocol-cache.md` §"Lean session close". Names M1-CP6 (cutover; Critical) OR a revision/rollback session as the next session, per Step 5's outcome.

## Part C — Anticipated session shape

| Phase | Estimate |
|---|---|
| Cache + predecessor close + decision-log read + ADR-004 §6.4 + §10 read | 15–20 min |
| Step 1 — count check + (conditional) seed via /admin/test-reason (~5–10 min if seeded) | 10–25 min |
| Step 2 — six SQL queries against the comparison table | 15–25 min |
| Step 3 — first-pass interpretation note (six dimensions + framing) | 30–45 min |
| Step 4 — Layer 3 prose spot-check (5 rows; founder reads) | 20–30 min |
| Step 5 — cutover decision input + founder decision | 20–40 min |
| Step 6 — decision-log entry (lean form) | 15–20 min |
| Step 7 — session close (lean form) + next-session-prompt draft for M1-CP6 OR revise/rollback path | 20–30 min |
| **Total** | **~3 hours** |

If the founder's decision at Step 5 is "cutover" with high confidence, the M1-CP6 prompt-drafting can land in this session. If "revise" or "rollback", the prompt-drafting may extend the session or be deferred to a separate prompt-drafting session.

## Rollback path

This session is read-only against existing data. No `git revert` needed for the analysis itself. The only mutating action is the comparison-log INSERTs from `/admin/test-reason` clicks during Step 1 seeding — those are additive (cannot be reversed except by DELETE, which would defeat the purpose). If Step 1's seeding produces unexpected sandwich_failures, investigate by reading the rows with `translation_sandwich_error IS NOT NULL`; common categories: `layer1_throw` (Layer 1 failed; check Anthropic API status), `layer3_throw` (Layer 3 failed; fallback prose should have engaged), `cost_cap_reached` (very unlikely at current data volume).

If the founder's Step 5 decision is **rollback**, the rollback gesture is:

```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning" && git revert <M1-CP4 parallel-run wiring commit SHA>
```

(The M1-CP4 commit is the one that activated parallel-run wiring on `/api/reason`. Find with `git log --oneline website/src/app/api/reason/route.ts | head -10`.) After revert: route returns to bundled-depth-only; `translation_sandwich_comparisons` data is preserved for analysis. Standard tier per ADR-004 §10.2; founder runs the commit + push.

## Forecast

If M1-CP5 lands clean with **cutover** decision: M1-CP6 follows (Critical) — translation-sandwich becomes sole user-facing engine on `/api/reason`. R10 announcement composed + published; external agent developers given migration runway. Then M2/M3/M4 (score family / mentor family / skill family) consumer migrations; then M5 (bundled engine retirement).

If M1-CP5 lands with **revise** decision: revision session(s) follow. ADR amendments + module updates + harness re-run + new parallel-run period. M1-CP6 deferred until revised modules pass the rubric.

If M1-CP5 lands with **rollback** decision: parallel-run wiring reverted. Revisit of ADR-003 + ADR-004 with the rubric data informing whether the translation-sandwich architecture is the right path or whether bundled-depth should remain authoritative. Significant pause in the M1 arc; potential restart from earlier ADR.

This is the cutover-decision session — the analytical pivot point of the entire M1 arc. The disposition the founder takes here shapes M2/M3/M4/M5 timelines and the public API contract for external agent developers.

End of prompt.
