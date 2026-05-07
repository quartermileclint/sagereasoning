# Session Close — 2026-05-07 — Sub-session M1-CP4f: Parallel-run observation infrastructure + harness assertion strategy refactor

**Stream:** founder.
**Governing frame:** /adopted/session-opening-protocol.md (cached via /adopted/standing-protocol-cache.md).
**Tier:** code-elevated — Elevated risk under 0d-ii.
**Date:** 2026-05-07.

## Decisions Made

- `D-M1-CP4f-PARALLEL-RUN-OBSERVATION-INFRA-2026-05-07` appended to active decision log (~145 lines, lean form per cache). Names the five-step landed scope (baseline reset; orchestrator follow-up; per-layer cost capture; admin/test-reason fixtures + Tier-1-aware renderer; harness structural-matcher refactor) and the Open Questions carried into M1-CP5.

## Status Changes

| Item | Old | New |
|---|---|---|
| `translation_sandwich_comparisons` schema | (no `tier1_aware` column) | **Verified** with `tier1_aware boolean NOT NULL DEFAULT true` column; pre-Tier-1 rows backfilled to `false` (37/37 rows); ready for M1-CP5's rubric reader to filter on `tier1_aware = true`. |
| `extractFeatures` return shape | `Promise<Layer1Schema>` (Verified end-to-end M1-CP4e-B) | **Verified** `Promise<ExtractFeaturesResult>` (`{ schema, usage }`) — usage carries `input_tokens` + `output_tokens` from the Anthropic SDK. |
| `generateProse` return shape | `Promise<Layer3Prose>` (Verified end-to-end M1-CP4e-B) | **Verified** `Promise<GenerateProseResult>` (`{ prose, usage }`) — same usage pattern. |
| `parallel-run.ts` per-layer cost wiring | Hardcoded null (`result.layer{1,3}_cost_usd_microcents = null`) | **Verified** populated via `sonnetCostMicrocents(usage.input_tokens, usage.output_tokens)`; flows through `logComparisonRow` to the `layer{1,3}_cost_usd_microcents` columns; flows through `incrementCostTracker` for R5 cost-cap enforcement. |
| `verify-translation-sandwich.ts` Phase 9 reporting | Per-layer cost reported as "not captured" (M1-CP5 open question) | **Verified** Phase 9 surfaces per-layer cost when usage is captured; reports "no usage captured (REPLAY mode)" when running off cache. |
| `/admin/test-reason` page | Wired (F1–F4 fixtures only; uniform render) | **Verified Wired** — F7/F8/F9 Tier 1 fixtures added (orange styling); `Tier1ClarificationResponse` type guard + dedicated render branch; helper paragraph explaining current parallel-run posture. |
| Harness matchers (six items: `proseHasUndecidableKathekonPhrasing`, `proseHasSingleSnapshotPhrasing`, `proseHasNoImprovementPathPhrasing`, EUPATHEIA stem-fragment matcher, PRAXIS stem-fragment matcher, PRAXIS reflection-sentence matcher) | Content-specific (literal phrase matches, brittle across Sonnet runs) | **Verified** structural / lexical-set membership per the new permanent KG entry. All super-sets of the prior matchers; cached fixtures continue to pass (273/273 REPLAY). |
| `D-M1-CP4f-PARALLEL-RUN-OBSERVATION-INFRA` decision-log entry | did not exist | **Adopted** (lean form; ~145 lines). |

## Next Session Should

**Sub-session M1-CP5 — comparison rubric reads + first-pass interpretation against the with-Tier-1 engine.** Per the M1-CP4f next-session prompt's forecast + the existing M1-CP5 next-session prompt at `/operations/handoffs/founder/2026-05-05-M1-CP5-RESUME-NEXT-SESSION-PROMPT.md` (which may need a brief delta-amendment to acknowledge the M1-CP4f-landed observation infrastructure: tier1_aware filter + per-layer cost capture). **Elevated tier — governance + analysis; no Critical Change Protocol unless rollback is triggered (per ADR-004 §10.2).**

The session executes the comparison-rubric reads scoped at ADR-004 §6.4: proximity match, virtue-domains overlap (Jaccard threshold), passions-detected match, causal-stage agreement, stage-scores agreement, prose-quality spot-check. Filter on `tier1_aware = true` to exclude pre-Tier-1 rows. R5 cost-health alert thresholds calibrated against observed per-layer costs (now captured per Step 3). Founder reviews data and decides at the M1-CP5 exit whether to: cutover (advance to M1-CP6 — Critical), revise (revisit Layer specifications), or rollback (revert parallel-run; revisit ADR-003).

Pre-conditions for M1-CP5:

1. M1-CP4f commit + push completed (Vercel green).
2. Founder ready for an Elevated-tier session — typically 2–3 hours.
3. Some real `/api/reason` traffic has accumulated since the M1-CP4e-B + M1-CP4f deploys, OR the founder has exercised `/admin/test-reason` enough to populate post-Tier-1 rows in `translation_sandwich_comparisons` for the rubric reader to consume. **Note: at M1-CP4f close, post-Tier-1 row count = 0.** Founder may want to spend 5–10 minutes clicking F1/F4/F7/F8/F9 buttons on `/admin/test-reason` before M1-CP5 to seed the table; alternatively, M1-CP5 itself can begin with that seeding step.
4. Anthropic API key in `.env.local` (low marginal cost expected — analysis is read-only against existing data).
5. Supabase SQL Editor access.

Estimated time for M1-CP5: 2–3 hours.

## Blocked On

**Files remaining uncommitted at session close:**

- `/website/src/lib/translation-sandwich/layer1-extractor.ts`
- `/website/src/lib/translation-sandwich/layer3-prose.ts`
- `/website/src/lib/translation-sandwich/parallel-run.ts`
- `/website/scripts/verify-translation-sandwich.ts`
- `/website/src/app/admin/test-reason/page.tsx`
- `/operations/decision-log.md`
- `/operations/handoffs/founder/2026-05-07-sub-session-M1-CP4f-close.md` (this file)

**Production state at session close:**

- **Vercel deployment:** unchanged from M1-CP4e-B post-deploy state. The M1-CP4f code (Step 3 + Step 4 + Step 5 changes) is committed only to local working tree; not deployed. The Tier 1 mechanic remains fully operative end-to-end (M1-CP4e-B disposition); user-facing path remains bundled-depth (parallel-run dormant default; orchestrator runs in sandwich path only). User-visible behaviour at session close: **UNCHANGED**.
- **Supabase `supabase-us`:** **changed.** `translation_sandwich_comparisons.tier1_aware` column added during Step 1; 37 pre-Tier-1 rows backfilled to `tier1_aware = false`. Migration is idempotent (Standard risk; reversible via `DROP COLUMN`). M1-CP5's rubric reader will filter on `tier1_aware = true`.
- **Env flags:** `TRANSLATION_SANDWICH_PARALLEL_RUN` = `1` in Vercel Production (confirmed by founder during session). `TRANSLATION_SANDWICH_TIER1_SECRET` SET in Vercel (Production + Preview + Development) — unchanged from M1-CP4e-B.
- **AC4 / AC5 / AC7:** NOT engaged this session. R20a perimeter unchanged; no auth/cookie/session/redirect surface touched.
- **R0, R5, AC1, AC6, AC8, KG1, KG2, KG6, KG7, PR1, PR3, PR4, PR5, PR9:** ENGAGED at the implementation level (per the decision-log entry's Rules served).
- **LLM cost incurred this sub-session:** **zero on AI sandbox** (REPLAY-mode only). Optional non-REPLAY harness re-run on founder's machine to confirm Step 3's wire-up captures real usage values would cost ~$0.10–0.30 (F1–F9 sweep + Phase 12 augmented runs). Founder's call.

## Open Questions

(Carried into the decision-log entry; summarised here.)

1. **Cache-aware cost accounting** — current capture is marginal cost (input_tokens excludes cache reads). Adequate for R5 alert calibration; revisit at M1-CP5 if total-cost accuracy becomes load-bearing.
2. **Live Tier 1 comparison-row inspection** — deferred from Step 2. Founder exercises `/admin/test-reason` F7/F8/F9 buttons to seed; ad-hoc verification thereafter.
3. **Token expiry tuning** (carried from ADR-008 §10.1 via D-M1-CP4e-B) — revisit at M1-CP5.
4. **Loop-guard maximum** (carried from ADR-008 §10.3 via D-M1-CP4e-B) — revisit at M1-CP5.
5. **External skill consumer onboarding doc timing** (carried from M1-CP4d) — founder's call.
6. **PR8 promotion candidate (in-place ADR amendment pattern)** — third recurrence held; promotion at next cycle if observed once more.
7. **Optional founder-side non-REPLAY harness re-run** — confirms Step 3's wire-up captures real usage. Cost ~$0.10–0.30. Not strictly required (REPLAY 273/273 confirms tsc + matcher correctness; usage extraction is straightforward SDK access).

## Founder Verification

**Step A — Commit + push the M1-CP4f changes.** Open Terminal, paste this exact block, press **Enter**:

```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning" && git add website/src/lib/translation-sandwich/layer1-extractor.ts website/src/lib/translation-sandwich/layer3-prose.ts website/src/lib/translation-sandwich/parallel-run.ts website/scripts/verify-translation-sandwich.ts website/src/app/admin/test-reason/page.tsx operations/decision-log.md operations/handoffs/founder/2026-05-07-sub-session-M1-CP4f-close.md && git commit -m "M1-CP4f: parallel-run observation infrastructure + harness structural-matcher refactor

- Step 1 (Supabase): translation_sandwich_comparisons.tier1_aware column added (boolean NOT NULL DEFAULT true) + 37 pre-Tier-1 rows backfilled to false. Idempotent (Standard risk; reversible).
- Step 2 (read-only): parallel-run.ts orchestrator follow-up via static review. Confirmed correctness; no live data (0 post-Tier-1 rows). Live verification deferred to /admin/test-reason probe (Step 4).
- Step 3 (wire-up): per-layer cost capture end-to-end. extractFeatures + generateProse return { schema/prose, usage } with Anthropic SDK token usage. parallel-run wires sonnetCostMicrocents() to result.layer{1,3}_cost_usd_microcents. Phase 9 reports per-layer cost when usage captured.
- Step 4 (admin UI): /admin/test-reason extended with F7/F8/F9 Tier 1 fixtures (orange styling) + Tier1ClarificationResponse type guard + dedicated render branch (trigger_code, fired_at_position, question_text, stem_id, continuation-token-issued indicator without value).
- Step 5 (harness refactor): six matchers broadened from content-specific to structural / lexical-set membership per the M1-CP4e-B PR5-promoted permanent KG entry. proseHasUndecidableKathekonPhrasing, proseHasSingleSnapshotPhrasing, proseHasNoImprovementPathPhrasing extended; EUPATHEIA stem-fragment matcher requires temporal-window + domain/past signals; PRAXIS stem-fragment matcher requires negative-ability + single-instance signals; PRAXIS reflection-sentence matcher broadened with virtue/convention contrast + negative-ability lexical set. Super-sets of pre-refactor matchers; cached fixtures pass.

Verification: tsc clean across full codebase; harness 273/273 PASS in REPLAY mode.

Risk classification: Elevated under 0d-ii. AC4/AC5/AC7/PR6 NOT engaged. Critical Change Protocol NOT engaged.

Decision-log entry D-M1-CP4f-PARALLEL-RUN-OBSERVATION-INFRA-2026-05-07 appended (lean form per cache).

Cross-references: D-M1-CP4e-B-AC13-TIER1-DEPLOYED, D-M1-CP4e-A-LAYER-MODULES-ROUTE-HARNESS-AC13-TIER1-IMPLEMENTED-NO-DEPLOY, D-M1-PARALLEL-RUN-FIRST-PASS-DEFERRED-2026-05-05; ADR-004, ADR-008; KG entry on structural assertions."
```

Then push via **GitHub Desktop**: open GitHub Desktop → select sagereasoning repo → click **Push origin**.

If `git add` fails with `index.lock` errors, paste this in Terminal first then retry:

```
rm "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/.git/index.lock"
```

Vercel will rebuild on push because `/website/**` files changed. Build should be **green** (tsc clean confirmed in-session) and zero behavioural change to user-facing paths (parallel-run dormant default; admin page is founder-only).

**Step B — Independent verification (founder-performable, optional but recommended).**

```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/website" && npx tsc --noEmit -p . && LAYER1_REPLAY_CACHE=1 npx tsx scripts/verify-translation-sandwich.ts
```

Expected: tsc clean (no output); harness reports `SUMMARY: 273 / 273 checks passed`.

**Step C — Schema verification (founder-performable, optional).** Open Supabase → SQL Editor → + New query → paste + RUN:

```sql
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_name = 'translation_sandwich_comparisons'
  AND column_name = 'tier1_aware';
```

Expected: one row with `data_type=boolean`, `column_default=true`, `is_nullable=NO`.

**Step D — Optional: real-cost harness re-run (founder's machine, costs ~$0.10–0.30).** Confirms Step 3's wire-up captures real usage values from Anthropic SDK responses:

```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/website" && npx tsx scripts/verify-translation-sandwich.ts
```

Expected: harness 273/273 (caches will be regenerated for any fixtures whose Sonnet output drifts; the structural-matcher refactor in Step 5 should absorb minor drift). Phase 9 reports actual per-layer costs in microcents + USD.

**Step E — Optional: live Tier 1 comparison-row inspection (founder, post-deploy).** Visit `https://sagereasoning.com/admin/test-reason`, click an F7/F8/F9 button, click **Send**. The user-facing response will be bundled-depth (parallel-run posture). Then in Supabase SQL Editor:

```sql
SELECT
  request_id,
  created_at,
  translation_sandwich_output->>'clarification_required' AS tier1_fired,
  translation_sandwich_output->>'trigger_code' AS trigger_code,
  translation_sandwich_output->'meta'->>'fired_at_position' AS fired_at_position,
  layer1_cost_usd_microcents,
  layer3_cost_usd_microcents,
  tier1_aware
FROM translation_sandwich_comparisons
WHERE tier1_aware = true
ORDER BY created_at DESC
LIMIT 5;
```

Expected: latest rows show `tier1_fired = 'true'`, `trigger_code` populated (ELEMENT_FUSION / SCOPE_AMBIGUITY / TEMPORAL_AMBIGUITY), `fired_at_position` populated (`layer1` / `position-2` / `position-6`), `layer1_cost_usd_microcents` non-null, `layer3_cost_usd_microcents` null (Layer 3 not called when Tier 1 fires), `tier1_aware = true`.

## Cross-references

- `/operations/handoffs/founder/2026-05-07-sub-session-M1-CP4e-B-close.md` (predecessor close)
- `/operations/handoffs/founder/2026-05-07-M1-CP4f-NEXT-SESSION-PROMPT.md` (the prompt this session executed)
- `/operations/handoffs/founder/2026-05-05-M1-CP5-RESUME-NEXT-SESSION-PROMPT.md` (next session — M1-CP5; may need a brief delta-amendment to acknowledge the M1-CP4f-landed infrastructure)
- `/operations/decision-log.md` `D-M1-CP4f-PARALLEL-RUN-OBSERVATION-INFRA-2026-05-07` (this session's entry)
- `/operations/decision-log.md` `D-M1-CP4e-B-AC13-TIER1-DEPLOYED-2026-05-07` (predecessor entry)
- `/operations/decision-log.md` `D-M1-CP4e-A-LAYER-MODULES-ROUTE-HARNESS-AC13-TIER1-IMPLEMENTED-NO-DEPLOY-2026-05-06` (predecessor entry)
- `/operations/decision-log.md` `D-M1-PARALLEL-RUN-FIRST-PASS-DEFERRED-2026-05-05` (Open Q1 from M1-CP5 first-pass — Step 3 resolves the "extractFeatures + generateProse expose token usage" item)
- `/operations/knowledge-gaps.md` § "Promoted pattern (3rd+ recurrence — load-bearing resolution) — Harness assertions on subjective LLM extractions must be structural, not content-specific" (the KG entry Step 5 implements systematically)
- `/adopted/adr/2026-05-04-translation-sandwich-pilot-api-reason.md` (ADR-004 — §6.1 + §6.3 + §10 M1-CP4f checkpoint row)
- `/adopted/adr/2026-05-06-multi-turn-input-flow-tier-1.md` (ADR-008)
- `/adopted/standing-protocol-cache.md` (operative governing frame)
- `/website/migrations/2026-05-04-translation-sandwich-comparisons.sql` (the schema this session extended via in-Supabase migration)
- `/website/src/lib/translation-sandwich/layer1-extractor.ts` (Step 3 wire-up)
- `/website/src/lib/translation-sandwich/layer3-prose.ts` (Step 3 wire-up)
- `/website/src/lib/translation-sandwich/parallel-run.ts` (Step 3 wire-up + cost helper activation)
- `/website/src/app/admin/test-reason/page.tsx` (Step 4 — Tier 1 fixtures + renderer)
- `/website/scripts/verify-translation-sandwich.ts` (Step 3 + Step 5 — harness extensions)

*End of session close. Sub-session M1-CP4f landed: parallel-run observation infrastructure (per-layer cost capture, comparison-table baseline reset, admin/test-reason Tier 1 fixtures + renderer) + harness assertion strategy refactor (six matchers broadened structurally). The Tier 1 mechanic deployed at M1-CP4e-B is now observable end-to-end and the harness is hardened against future Sonnet drift via the structural-over-content principle. M1-CP5 resumes next: comparison-rubric reads + first-pass interpretation + cutover decision input.*
