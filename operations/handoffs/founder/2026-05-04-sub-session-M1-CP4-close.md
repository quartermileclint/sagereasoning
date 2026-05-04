# Session Close — 2026-05-04 — Sub-session M1-CP4: `/api/reason` Wired (parallel-run) + harness Phases 1–9 all passing

**Stream:** founder.
**Governing frame:** `/adopted/standing-protocol-cache.md` §"Critical-risk sessions" + project instructions §0c-ii Critical Change Protocol.
**Tier:** code-critical — **Critical** risk under 0d-ii.
**Date:** 2026-05-04.

## Decisions Made

- **D-M1-CP4-PARALLEL-RUN-WIRING-2026-05-04** appended to active log (~70 lines added). The `/api/reason` route is Wired (parallel-run, env-flag-gated, dormant by default). Two new Supabase tables drafted as idempotent SQL files for the founder to run. New parallel-run orchestrator module under `/website/src/lib/translation-sandwich/`. Harness Phases 6 + 7 + 8 + 9 implemented; all 124 in-session checks pass against the cached fixtures (replay mode). Critical Change Protocol completed visibly with explicit named-risk approval ("approve all"). All eight named failure modes mitigated and verified.

## Status Changes

| Item | Old status | New status |
|---|---|---|
| `/website/src/app/api/reason/route.ts` | Wired (M1-CP3 state — bundled-depth only; no translation-sandwich import) | **Wired (parallel-run, env-flag-gated, dormant by default).** Imports `runParallelSandwich` from `@/lib/translation-sandwich/parallel-run`. The R20a distress check at line 149 is unchanged. The early-redirect at lines 150–155 is unchanged. The `runSageReason` call at lines 180–189 is unchanged. New code captures `bundledDepthLatencyMs` (line 190), then calls `await runParallelSandwich({...})` (lines 212–223), then returns `NextResponse.json(result)` (line 225). User-facing response shape unchanged. Reaches Verified after the M1-CP5 parallel-run observation period. |
| `/website/src/lib/translation-sandwich/parallel-run.ts` | non-existent | **Wired (parallel-run, env-flag-gated).** ~470 lines. Exports `runParallelSandwich(params): Promise<void>` (NEVER throws; gated on env `TRANSLATION_SANDWICH_PARALLEL_RUN === '1'` at module load); `runSandwichForHarness` (test-facing same-orchestration without DB I/O); `isParallelRunEnabled` + `PARALLEL_RUN_CONFIG` (test-only); `sonnetCostMicrocents` (cost utility for M1-CP5). Internal: `getAdminClient()` lazy-creates Supabase client; `runSandwichInner` composes Layer 1 → Layer 2 → Layer 3 with deterministic Layer 3 fallback per ADR-007 §6 + ADR-004 §9.3; `runWithDeadline` wraps with 500ms grace via `Promise.race`; `readCostTracker` + `incrementCostTracker` defensively wrap Supabase reads/writes (cap-read fails open per Step 1(c)); `logComparison` writes one row per request (try/catch; never throws). All Supabase writes awaited per KG1 rule 2. |
| `/website/migrations/2026-05-04-translation-sandwich-comparisons.sql` | non-existent | **Drafted, not yet applied.** ~70 lines. Idempotent CREATE TABLE for the comparison log per ADR-004 §6.1. PII discipline: only `input_text_hash` (SHA-256) stored, never input text. JSONB columns for both engines' outputs per KG7. Index on created_at. Founder runs in Supabase SQL Editor (Step A of Founder Verification). |
| `/website/migrations/2026-05-04-translation-sandwich-cost-tracker.sql` | non-existent | **Drafted, not yet applied.** ~70 lines. Idempotent CREATE TABLE for the singleton-row cost tracker per ADR-004 §6.2. CHECK CONSTRAINT id=1 enforces singleton. INSERT ... ON CONFLICT DO NOTHING seeds the row. Founder runs in Supabase SQL Editor (Step A of Founder Verification). |
| `/website/scripts/verify-translation-sandwich.ts` | Wired (Phases 1-5 passing; Phases 6-9 stubbed) | **Wired (Phases 1-9 all passing).** ~1130 → ~1500 lines. Phase 6 composes the §2.1 shape from cached layer outputs (no LLM); Phase 7 implements AC4 grep-based invocation testing (8 checks covering import positions + the three ordering invariants); Phase 8 invokes `runSandwichForHarness({input: ''})` to trigger Layer 1's validator-level throw (no LLM cost) + confirms `generateFallbackProse` produces valid Layer3Prose for each fixture; Phase 9 aggregates per-layer latency + prints the parallel-run config so founder can see what is enforced at runtime. main() updated to call all four real phases; SUMMARY message updated to "Phase 1 + 2 + 3 + 4 + 5 + 6 + 7 + 8 + 9". File-header comments updated. |
| Harness in-session verification | 36 / 36 (M1-CP3 in-sandbox smoke test) | **124 / 124 (M1-CP4 in-sandbox replay-mode harness).** ALL CHECKS PASSED across all 9 phases. Phase 9 confirmed `TRANSLATION_SANDWICH_PARALLEL_RUN at module load: disabled` (env-flag default correct); cap config matches founder-approved defaults ($50, 1000 requests, 14 days, 500ms grace). |
| M1-CP4 deliverable | Scoped (named in ADR-004 §10) | **Wired (parallel-run, dormant) + harness verified.** Reaches Verified after the parallel-run observation period at M1-CP5. |

## Next Session Should

**Sub-session M1-CP5 — Parallel-run observation + cutover decision.** Per ADR-004 §10. **Standard-tier — lean form per cache.** The session reads accumulated comparison data from `translation_sandwich_comparisons` against the comparison rubric in ADR-004 §6.4 (proximity match; virtue-domains overlap; passions detected match; causal-stage agreement; per-mechanism stage-scores agreement; prose-quality spot-check). Cost + latency observed against R5 thresholds. Founder reviews data and decides: **cutover** (advance to M1-CP6 — Critical-tier; full Critical Change Protocol applies; replaces the bundled-depth path with translation-sandwich as the sole user-facing path; public deprecation notice required); **revise** (revisit Layer specifications — typically Layer 1 prompt or Layer 2 deterministic rules); or **rollback** (revert parallel-run wiring; revisit ADR-003 + ADR-004 architecture).

Pre-conditions for M1-CP5:
1. The founder has applied the two SQL migrations (Step A of Founder Verification below) and confirmed both verification queries.
2. The founder has pushed this session's commit + verified Vercel deploy (Step B + C).
3. The founder has activated the parallel-run env flag (Step D) for at least one of three conditions: 14 days have passed, the request count has reached 1000, OR the cumulative cost has reached $50 (whichever first — at which point `cap_reached` flips to true and the parallel path short-circuits).
4. Per the cap-reached condition: M1-CP5 may be triggered earlier if the cap is reached or later if the founder wishes more data than the default cap allows. The founder may also reset the cost-tracker (per the SQL in the migration file's comment block) for a second observation period with explicit re-approval.

Estimated time: 2–4 hours for the analysis + decision-log entry. M1-CP5 is analytical, not implementation; no Critical Change Protocol applies.

The next-session prompt for M1-CP5 follows the **lean** template per cache §"Lean next-session prompt".

Next-session prompt: `/operations/handoffs/founder/2026-05-04-M1-CP4-NEXT-SESSION-PROMPT.md`.

## Blocked On

**Files remaining uncommitted at session close:**

- `/website/migrations/2026-05-04-translation-sandwich-comparisons.sql` (new)
- `/website/migrations/2026-05-04-translation-sandwich-cost-tracker.sql` (new)
- `/website/src/lib/translation-sandwich/parallel-run.ts` (new — ~470 lines)
- `/website/src/app/api/reason/route.ts` (modified — added one import + ~12 lines of wiring)
- `/website/scripts/verify-translation-sandwich.ts` (modified — Phases 6-9 implemented, ~1130 → ~1500 lines)
- `/operations/decision-log.md` (modified — D-M1-CP4 entry appended; ~2308 → ~2380 lines)
- `/operations/handoffs/founder/2026-05-04-sub-session-M1-CP4-close.md` (this file — new)
- `/operations/handoffs/founder/2026-05-04-M1-CP4-NEXT-SESSION-PROMPT.md` (next — new)

**Production state at session close:**

- Vercel deployment: deploys at next push, but with `TRANSLATION_SANDWICH_PARALLEL_RUN` unset → the parallel path is dormant; user-facing latency identical to today; user-facing response shape identical to today. Vercel rebuild on push expected to succeed (`npx tsc --noEmit -p .` clean at session close).
- Supabase `supabase-us`: unchanged at session close. Two new tables (`translation_sandwich_comparisons` + `translation_sandwich_cost_tracker`) to be created via the founder's SQL Editor runs at Step A of Founder Verification BEFORE the wiring commit reaches production. If the founder pushes before running the migrations, the route's parallel-path Supabase writes fail silently (logged, never propagated) so it is not catastrophic — the parallel path simply produces no comparison data until the migrations are applied.
- AC7 standing constraint: NOT engaged at any edit this session. No auth/cookie/session/redirect-behaviour change.
- AC5 standing constraint: ENGAGED — `/api/reason` is one of the eight bound R20a perimeter routes. Phase 7 grep-based invocation testing confirms the perimeter is intact: `enforceDistressCheck(detectDistressTwoStage(input))` at line 149 (unchanged); `if (gate.shouldRedirect)` early-return at line 150–155 (unchanged); `await runParallelSandwich(...)` at line 212–223 (new, sequential after `runSageReason`).
- AC8 standing constraint: ENGAGED — fourth surface under `/website/src/lib/translation-sandwich/` (orchestrator joins the three layer modules).
- AC1: ENGAGED — Sonnet for Layer 1 + Layer 3 enforced inside the layer modules per cache Element 6 rows.
- AC4 + AC6 + KG1 + KG6 + KG7 + PR1 + PR3 + PR4 + PR6: all ENGAGED and verified.
- LLM cost incurred this session: **$0.00**. The harness ran in REPLAY mode against the cached fixtures from M1-CP3 close; Phase 8 triggers Layer 1's validator-level throw before any LLM call. No new Sonnet calls.

## Open Questions

(Carried into the decision-log entry at length; summarised here.)

1. **First-traffic comparison data behaviour at M1-CP5.** The parallel-run period accumulates comparison rows for offline analysis. **Revisit at M1-CP5.**
2. **Per-layer cost capture deferred.** `extractFeatures` + `generateProse` do not currently expose token usage. Cost utility `sonnetCostMicrocents` is exported in `parallel-run.ts` for M1-CP5 wiring. **Revisit at M1-CP5.**
3. **Cost-tracker concurrency.** Read-modify-write rather than atomic Postgres function. Acceptable at single-user traffic. **Revisit at M1-CP5** if measured request count diverges.
4. **Cap-read fail-open posture.** Trade-off chosen: parallel path proceeds for one request when read fails. **Revisit at M1-CP5** if observed cost exceeds expected by more than ~5%.
5. **Cutover criteria.** **Revisit at M1-CP5.**
6. **Public deprecation timing.** **Revisit at M1-CP5** for M1-CP6.

(Open questions 1, 2, 3, 4, 5 from M1-CP3 close are partially resolved this session.)

**PR5 carry-forward (watch status, 2nd recurrence):** "LLM marginal-case discipline requires worked OUTPUT examples". Stays in watch. No new LLM prompts authored this session; no third-recurrence trigger fired. Trigger remains preserved for M1-CP4-CP5 parallel-run period traffic OR M2/M3/M4 Layer 3 templates at their respective milestones.

## Founder Verification

**Step A — Apply the Supabase migrations BEFORE pushing the wiring commit.**

The migrations are idempotent (safe to run more than once). Run them in order:

1. Open Supabase Dashboard for the sagereasoning project.
2. Click SQL Editor (left sidebar) → New query.
3. Open `/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/website/migrations/2026-05-04-translation-sandwich-comparisons.sql` in your file viewer; copy entire contents; paste into the SQL Editor; click RUN.
4. Open `/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/website/migrations/2026-05-04-translation-sandwich-cost-tracker.sql`; copy entire contents; paste into a new SQL Editor query; click RUN.
5. Verify both tables exist with this query (paste into a new SQL Editor query):

```sql
SELECT count(*) FROM translation_sandwich_comparisons;
SELECT id, period_start, cumulative_cost_usd_microcents, request_count, cap_reached
FROM translation_sandwich_cost_tracker;
```

Expected: first count returns `0`. Second query returns one row with `id=1`, `period_start=today's date`, all counters at `0`, `cap_reached=false`.

**Step B — Commit + push.** Open Terminal, paste this exact block, press **Enter** (one combined command — adds all touched files):

```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning" && git add -A operations/decision-log.md operations/handoffs/founder/2026-05-04-sub-session-M1-CP4-close.md operations/handoffs/founder/2026-05-04-M1-CP4-NEXT-SESSION-PROMPT.md website/migrations/ website/src/lib/translation-sandwich/parallel-run.ts website/src/app/api/reason/route.ts website/scripts/verify-translation-sandwich.ts && git commit -m "session close: M1-CP4 /api/reason Wired (parallel-run, env-flag-gated, dormant) + harness Phases 1-9 all passing 124/124 — translation-sandwich engine first user-facing route wiring — 2026-05-04 (Sub-session M1-CP4)

- D-M1-CP4-PARALLEL-RUN-WIRING-2026-05-04 — Critical Change Protocol applied; eight named failure modes mitigated and verified

- /website/migrations/2026-05-04-translation-sandwich-comparisons.sql — new (~70 lines; idempotent CREATE TABLE for parallel-run comparison log per ADR-004 §6.1; PII discipline: only SHA-256 of input stored, never input text; JSONB columns per KG7; index on created_at; copy/paste instructions for SQL Editor)

- /website/migrations/2026-05-04-translation-sandwich-cost-tracker.sql — new (~70 lines; idempotent CREATE TABLE for singleton-row cost tracker per ADR-004 §6.2; CHECK CONSTRAINT id=1 enforces singleton; INSERT ON CONFLICT DO NOTHING seeds row; copy/paste instructions for SQL Editor)

- /website/src/lib/translation-sandwich/parallel-run.ts — new (~470 lines; exports runParallelSandwich (NEVER throws; gated on env TRANSLATION_SANDWICH_PARALLEL_RUN at module load); runSandwichForHarness; isParallelRunEnabled; PARALLEL_RUN_CONFIG; sonnetCostMicrocents. Internal: getAdminClient lazy-creates Supabase client; runSandwichInner composes Layer 1 → Layer 2 → Layer 3 with deterministic fallback per ADR-007 §6 + ADR-004 §9.3; runWithDeadline wraps with 500ms grace via Promise.race; readCostTracker + incrementCostTracker defensively wrap Supabase calls; logComparison writes one row per request)

- /website/src/app/api/reason/route.ts — modified (added import for runParallelSandwich; bundledDepthLatencyMs capture; await runParallelSandwich(...) call sequential after runSageReason and before NextResponse.json. Existing R20a distress check at line 149 unchanged. Existing shouldRedirect early-return at lines 150-155 unchanged. Existing runSageReason call unchanged.)

- /website/scripts/verify-translation-sandwich.ts — modified (~1130 → ~1500 lines; Phases 6 + 7 + 8 + 9 implemented and main() updated. Phase 6: composes §2.1 shape from cached layer outputs (no LLM). Phase 7: AC4 grep-based invocation testing — 8 checks covering import positions + 3 ordering invariants. Phase 8: invokes runSandwichForHarness with empty input to trigger Layer 1 validator-level throw (no LLM cost) + asserts generateFallbackProse produces valid Layer3Prose for each fixture. Phase 9: aggregates per-layer latency + prints parallel-run config.)

- Critical risk under 0d-ii. Critical Change Protocol applied per project instructions §0c-ii (six sub-steps completed visibly in conversation; explicit founder approval received specific to eight named risks). AC4 + AC5 + AC6 + AC8 ENGAGED; AC1 + AC7 not engaged (no auth/cookie/session/redirect surface; AC1 enforced at layer-module level). PR1 + PR3 + PR4 + PR6 ENGAGED. KG1 + KG6 + KG7 ENGAGED. R20a perimeter intact (Phase 7 grep proof: distress-check at L149, parallel-run at L212; ordering invariants all confirmed). Single-route env-flag discipline confirmed (TRANSLATION_SANDWICH_PARALLEL_RUN read only in parallel-run.ts; runParallelSandwich imported only by route.ts). PII discipline (R17b) — only SHA-256 of input stored.

- In-session harness verification: 124/124 checks passed (LAYER1_REPLAY_CACHE=1; no Sonnet calls). ALL CHECKS PASSED across Phase 1 + Phase 2 + Phase 3 + Phase 4 + Phase 5 + Phase 6 + Phase 7 + Phase 8 + Phase 9. Phase 9 confirmed env-flag default DISABLED at module load. tsc clean confirmed.

- Production state at session close: Vercel deploys at next push; TRANSLATION_SANDWICH_PARALLEL_RUN unset = parallel path dormant; user-facing behaviour identical to today. Supabase migrations to be applied before push (idempotent; founder runs in SQL Editor; AI does not run table-modifying SQL on production).

- M1-CP4 complete; M1-CP5 (parallel-run observation + cutover decision — Standard-tier; lean form) is the next session's deliverable."
```

Then push via **GitHub Desktop**: open GitHub Desktop → select sagereasoning repo → click **Push origin**. Vercel auto-rebuilds on push to main. Expected: build succeeds; no behaviour change deploys (parallel path is dormant by default).

If `git add` fails with `index.lock` errors, paste this in Terminal first then retry:

```
rm "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/.git/index.lock"
```

**Step C — Confirm dormant deploy.** Once Vercel says deploy succeeded, run this curl:

```
curl -X POST https://sagereasoning.com/api/reason \
  -H "Content-Type: application/json" \
  -d '{"input": "I keep checking my phone to see if she has replied."}' | head -50
```

Expected: bundled-depth response shape with the existing keys (`control_filter`, `passion_diagnosis`, `oikeiosis`, `katorthoma_proximity`, `philosophical_reflection`, `improvement_path`, `disclaimer`). NO `extraction` / `assessment` / `prose` keys at the top level. If you see those, the env flag has accidentally been set; investigate before continuing.

Then verify the comparison table is still empty:

```sql
SELECT count(*) FROM translation_sandwich_comparisons;
```

Expected: `0`.

**Step D — Activate the parallel run (when you are ready).**

In Vercel Dashboard → your project → Settings → Environment Variables → Add:
- Name: `TRANSLATION_SANDWICH_PARALLEL_RUN`
- Value: `1`
- Environments: **Production** only

Click Save, then redeploy: Deployments → latest → "Redeploy".

After the redeploy succeeds, re-run the curl from Step C. The user-facing response is still bundled-depth shape. Then:

```sql
SELECT count(*) FROM translation_sandwich_comparisons;
```

Expected: `1` (the curl just produced one parallel run). If `0`, the parallel path did not fire; check Vercel Logs for `[parallel-run]` console.warn messages and the env var is actually present in Production.

**Step E — Optional harness re-run with the deployed code.**

```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/website" && LAYER1_REPLAY_CACHE=1 npx tsx scripts/verify-translation-sandwich.ts
```

Expected: `124 / 124 checks passed. ALL CHECKS PASSED`. Confirmed at session close. (If you set `LAYER1_REPLAY_CACHE=0` or unset, the harness incurs ~$0.20-0.60 in real Sonnet calls for Phases 1+2+5; replay cache is the recommended path between sessions.)

**Independent verification of the M1-CP4 deliverables:**

```
ls "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/website/migrations/" 2>/dev/null
```

Expected: two SQL files dated 2026-05-04.

```
ls "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/website/src/lib/translation-sandwich/"
```

Expected: `layer1-extractor.ts`, `layer2-mechanisms.ts`, `layer3-prose.ts`, `parallel-run.ts` (four files).

```
grep -n "TODO: M1-CP" "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/website/scripts/verify-translation-sandwich.ts"
```

Expected: 0 matches (Phases 6 + 7 + 8 + 9 all implemented; no stubs remain).

```
grep -rn "TRANSLATION_SANDWICH_PARALLEL_RUN" /Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/website/src/ 2>/dev/null | grep -v "//\|/\*"
```

Expected: only one runtime read of the env var (in `parallel-run.ts:73`); other matches are documentation comments. Confirms single-route discipline.

**TypeScript compile sanity check:**

```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/website" && npx tsc --noEmit -p . && echo "tsc clean"
```

Expected: `tsc clean` (exit 0). Confirmed at session close.

## Cross-references

- `/operations/handoffs/founder/2026-05-04-sub-session-M1-CP3-close.md` (predecessor — Sub-session M1-CP3: Layer 3 module Verified standalone + ADR-007 Adopted + two amendments)
- `/operations/handoffs/founder/2026-05-04-M1-CP3-NEXT-SESSION-PROMPT.md` (this session's opening prompt)
- `/operations/handoffs/founder/2026-05-04-M1-CP4-NEXT-SESSION-PROMPT.md` (next session — M1-CP5 parallel-run observation + cutover decision; Standard-tier; lean form)
- `/operations/decision-log.md` `D-M1-CP4-PARALLEL-RUN-WIRING-2026-05-04` (this session's entry)
- `/operations/decision-log.md` `D-M1-CP3-LAYER3-MODULE-AND-ADR007-2026-05-04` (M1-CP3 — predecessor entry, including amendments)
- `/operations/decision-log.md` `D-M1-CP2-LAYER2-MODULE-AND-ADR006-2026-05-04` (M1-CP2 — Layer 2 module + ADR-006)
- `/operations/decision-log.md` `D-M1-CP1-LAYER1-MODULE-AND-ADR005-2026-05-04` (M1-CP1 — Layer 1 module + ADR-005)
- `/operations/decision-log.md` `D-E10-ADR004-DRAFTED-AND-ADOPTED-2026-05-04` (E10 — ADR-004 codification)
- `/adopted/adr/2026-05-04-translation-sandwich-pilot-api-reason.md` (ADR-004 §6 + §7 + §8 + §9 + §10 — the parent specification this session realises)
- `/adopted/adr/2026-05-04-layer3-prose-template-api-reason.md` (ADR-007 — Layer 3 specification, twice-amended; §6 fallback mechanics that the orchestrator invokes)
- `/adopted/adr/2026-05-04-layer2-mechanism-algorithm.md` (ADR-006)
- `/adopted/adr/2026-05-04-layer1-schema-specification.md` (ADR-005)
- `/website/migrations/2026-05-04-translation-sandwich-comparisons.sql` (new — comparison log; founder runs in SQL Editor)
- `/website/migrations/2026-05-04-translation-sandwich-cost-tracker.sql` (new — cost cap singleton row; founder runs in SQL Editor)
- `/website/src/lib/translation-sandwich/parallel-run.ts` (new — orchestrator; the M1-CP4 deliverable)
- `/website/src/app/api/reason/route.ts` (modified — Wired (parallel-run))
- `/website/src/lib/translation-sandwich/layer1-extractor.ts` (Verified standalone; used at runtime now)
- `/website/src/lib/translation-sandwich/layer2-mechanisms.ts` (Verified standalone; used at runtime now)
- `/website/src/lib/translation-sandwich/layer3-prose.ts` (Verified standalone, twice-amended; used at runtime now)
- `/website/scripts/verify-translation-sandwich.ts` (Wired Phases 1-9; 124/124 in REPLAY mode at session close)
- `/manifest.md` AC1 + AC4 + AC5 + AC6 + AC8 (binds the wiring + perimeter + placement + architecture)
- `/adopted/standing-protocol-cache.md` §"Critical-risk sessions" (the operative governing frame for this session's protocol form)
- Project instructions §0c-ii (Critical Change Protocol — the procedural frame this session activated)

*End of session close. M1-CP4 is the M1 arc's fourth checkpoint and the first to touch the user-facing route. The translation-sandwich engine is now wired into `/api/reason` in parallel-run mode (env-flag-gated, dormant by default). The two SQL migrations are drafted and idempotent; founder applies them before pushing the wiring commit. M1-CP5 (parallel-run observation + cutover decision; Standard-tier; lean form) is the next session.*
