# Next-Session Prompt — M1-CP4e-B: AC-13 Tier 1 deployment under Critical Change Protocol

**Stream:** founder.
**Tier:** code-critical.
**Governing frame:** `/adopted/standing-protocol-cache.md` (full governance via the cache; deliverable-of-the-day = M1-CP4e-A code reaching Verified status via env var provision + real-Sonnet harness + deployment).
**Predecessor session close:** `/operations/handoffs/founder/2026-05-06-sub-session-M1-CP4e-A-close.md`.
**Predecessor decision-log entries:** `D-M1-CP4e-A-LAYER-MODULES-ROUTE-HARNESS-AC13-TIER1-IMPLEMENTED-NO-DEPLOY` (M1-CP4e-A — modules + ADR amendments + harness all wired tsc-clean, no deploy); `D-M1-CP4d-MULTI-TURN-INPUT-FLOW-DESIGN-ADR-2026-05-06` (M1-CP4d — ADR-008 design); `D-M1-CP4c-LAYER-MODULES-AC14-TIER2-IMPLEMENTED-2026-05-06` (M1-CP4c — engine substrate); `D-M1-AC13-AC14-WIRING-REQUIRED-BEFORE-CUTOVER-2026-05-05` (parent scope decision).
**Risk classification:** **CRITICAL** under 0d-ii. **Critical Change Protocol applies in full — see Section "Critical Change Protocol checklist" below.**

## Why this session matters

M1-CP4e-A landed the modules + ADR amendments + orchestrator + route + harness for AC-13 Tier 1 force-clarification on `/api/reason`. The code is committed and (after the founder's push) deployed to Vercel — but it is INERT: the env var `TRANSLATION_SANDWICH_TIER1_SECRET` is not yet provisioned, and the F7/F8/F9 fixtures have not been added to the harness FIXTURES array (so real-Sonnet Layer 1 extraction has not been exercised). M1-CP4e-B closes this: it provisions the env var, adds the fixtures, runs the harness end-to-end with real Sonnet, and completes the Critical Change Protocol's named-risk approval before declaring the AC-13 Tier 1 deployment complete. After M1-CP4e-B, the Tier 1 mechanic is operative across all three trigger surfaces (ELEMENT_FUSION at Layer 1; SCOPE_AMBIGUITY at Position 6; TEMPORAL_AMBIGUITY at Position 2).

The user-facing behaviour at the end of M1-CP4e-B remains UNCHANGED — `TRANSLATION_SANDWICH_PARALLEL_RUN` is still `1` (parallel-run dormant by default; user-facing path remains bundled-depth). M1-CP4e-B's user-facing change is deployment readiness for the Tier 1 mechanic to surface at M1-CP6 cutover, and observation-only logging in the comparison table during the parallel-run period.

## Pre-conditions

1. M1-CP4e-A commit pushed; Vercel build green. Confirm at session open: `git log --oneline -1` shows the M1-CP4e-A commit; vercel.com/sagereasoning shows the latest deploy as green.
2. Standalone harness reproduces 208+ checks against the M1-CP4e-A baseline (existing 198 + Phase 11's 10 sub-checks). Re-run command: `cd website && LAYER1_REPLAY_CACHE=1 npx tsx scripts/verify-translation-sandwich.ts`.
3. Founder is ready for a 2–3 hour Critical-tier session — Critical Change Protocol with named-risk approval before deployment.
4. Vercel project access available (founder needs to set the new env var + push the deploy).
5. Anthropic API key in `.env.local`. Marginal LLM cost ~$0.30 (F7+F8+F9 Layer 1 extractions + Phase 12 second-turn extractions).

## Part A — Open under the protocol

Read in order:
1. `/adopted/standing-protocol-cache.md` — confirms tier `code-critical`; full session-opening protocol applies (NOT lean); Critical Change Protocol applies before deployment.
2. `/operations/handoffs/founder/2026-05-06-sub-session-M1-CP4e-A-close.md` — predecessor close.
3. `/operations/decision-log.md` last 2 entries (D-M1-CP4e-A and D-M1-CP4d).
4. `/adopted/adr/2026-05-06-multi-turn-input-flow-tier-1.md` (ADR-008) — re-skim §4 (continuation-token mechanic) + §5 (route flow) + §6 (R20a perimeter preservation) + §7 (failure isolation).
5. `/adopted/adr/2026-05-04-layer1-schema-specification.md` §3.12 + §8.1 F7 fixture spec — re-skim.
6. `/adopted/adr/2026-05-04-layer2-mechanism-algorithm.md` §3.10 + §8.1 F8/F9 fixture specs (cross-referenced from ADR-005 §8.1) — re-skim.
7. `/manifest.md` re-read R20a + AC4 + AC5 + PR6 + PR1 in full (Critical-tier sessions require full re-read of engaged rules per cache Element 2).

Confirm at session open per cache + full protocol:
- Tier: **`code-critical`**.
- Hold-point: P0 0h active.
- Risk class: **Critical** under 0d-ii. Critical Change Protocol applies before deployment.
- Status vocabulary: ADR-008 implementation moves from **Wired (no deploy)** to **Verified (deployed; observation-only logging during parallel-run)**. tier1-token.ts moves from **Scaffolded** to **Verified standalone** after Phase 11 + Phase 12 real-Sonnet runs.
- Model selection: **Sonnet** for Layer 1 re-extraction (per AC1 + KG2; cache Element 6 row "Layer 1 translation (alt-3)").
- Engaged rules: R0, R5, R7, R8a, R8c, R10, AC1, AC4, AC5, AC6, AC8, KG1, KG2, KG6, PR1, PR3, PR4, PR6. AC7 NOT engaged. PR5 watch-status — promotion candidate IF Sonnet over-fires ELEMENT_FUSION on F1–F6 baseline-no-fusion fixtures (PR5 second-recurrence pattern).

## Critical Change Protocol checklist (per project instructions 0c-ii)

The AI must complete each step visibly in the conversation before the founder deploys. The founder approves each named risk explicitly. The risks below are the same seven (a)–(g) named in the original M1-CP4e prompt; they engage at deployment time, which is M1-CP4e-B.

### 1. What is changing — plain language, no jargon

The route at `/api/reason` will gain the ability to ask the practitioner a clarifying question when the engine cannot proceed without more information. The new env var `TRANSLATION_SANDWICH_TIER1_SECRET` is provisioned in Vercel so the engine can issue cryptographically-signed continuation tokens. The harness adds three new test fixtures (F7/F8/F9) and runs them end-to-end with real Sonnet to verify the Tier 1 detection logic fires correctly. From the practitioner's perspective on sagereasoning.com: NO IMMEDIATE CHANGE. The user-facing path remains bundled-depth during parallel-run; the Tier 1 mechanic surfaces to users at M1-CP6 cutover (a future session).

### 2. What could break — specific failure modes

(a) **Existing single-turn requests could fail to evaluate.** If Tier 1 detection over-fires on F1–F6 (baseline-no-fusion fixtures), Phase 1's `fused: false` baseline assertion fails, indicating Sonnet's category 12 extraction is too eager. Mitigation: Phase 1 + Phase 4 harness assertions on F1–F6 must show `fused: false` AND no SCOPE_AMBIGUITY / TEMPORAL_AMBIGUITY fires; if any fire, tighten the system prompt's category 12 OUTPUT example per PR5 worked-example discipline before deploying.

(b) **R20a distress check could be bypassed on the second turn.** The most serious failure mode. The route's amended flow runs distress check at line 173 BEFORE token validation at line ~195. AC4 invocation test: grep + execution path proof that `enforceDistressCheck` runs unconditionally on every request, before `validateContinuationToken`. Mitigation: Phase 7 of the harness asserts the import-position invariant (preserved from M1-CP4); pre-deployment grep of the route file confirms distress check runs first.

(c) **Continuation token leakage.** If `TRANSLATION_SANDWICH_TIER1_SECRET` is logged or sent client-side, attackers can forge tokens. Mitigation: secret read at function call time (not module load); secret never appears in any `console.log` / response body / error message; Vercel env vars are server-side only. Pre-deployment grep of the codebase for `TRANSLATION_SANDWICH_TIER1_SECRET` should show only definitions + reads, never log or response use.

(d) **Parallel-run failure-isolation could leak.** During parallel-run, the bundled-depth path remains the user-facing path. If a sandwich-path Tier 1 fire incorrectly surfaces to the user (instead of being logged to the comparison table), the user sees a clarification question without warning. Mitigation: ADR-004 §6.3 + ADR-008 §7 explicitly preserve failure isolation; the route's flow does NOT inspect the sandwich-path output — only the bundled-depth promise's resolved value is returned to the user. Pre-deployment trace through the route confirms the user-facing return statement uses `await bundledPromise`, not the sandwich result.

(e) **Build break on Vercel.** A `tsc` error or runtime error in the new code could break the build, taking the entire site down. Mitigation: `cd website && npx tsc --noEmit -p .` returns clean before commit (verified at M1-CP4e-A; re-verify at M1-CP4e-B before deploy); harness 220+ checks pass before commit.

(f) **Regression on existing M1-CP4c functionality.** AC-14 Tier 3 + Tier 2 currently work at 198/198. Any regression in `applyMechanisms` could break those. Mitigation: pre-existing F1–F6 fixtures continue to pass; harness produces all existing 198 checks plus the new Tier 1 phases on F7/F8/F9 plus Phase 11 + Phase 12.

(g) **Vercel cold-start latency.** The new code adds module-load weight (tier1-token.ts + extended layer2-mechanisms.ts). Vercel cold-start could approach the 60-second timeout. Mitigation: latency capture is M1-CP4f's scope; M1-CP5 latency review will surface this if real.

### 3. What happens to existing sessions

No user sessions are bound to `/api/reason` (the route is rate-limited but not session-bound). Existing in-flight requests at deploy time continue with the bundled-depth path during parallel-run. Post-cutover (M1-CP6, future session), in-flight requests would see the new Tier 1 shape; that is M1-CP6's concern, not M1-CP4e-B's. The new env var `TRANSLATION_SANDWICH_TIER1_SECRET` is read fresh on every request that includes a continuation_token, so secret rotation is a future concern (ADR-008 §4.2 names quarterly rotation policy).

### 4. Rollback plan

The exact rollback steps the founder can run independently:

```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
git log --oneline -5
# Identify the M1-CP4e-B commit hash (the most recent before this rollback)
git revert <commit-hash>
git push
```

Then push via GitHub Desktop. Vercel auto-deploys on push. Within 2–3 minutes, the route reverts to its pre-M1-CP4e-B behaviour. The new env var `TRANSLATION_SANDWICH_TIER1_SECRET` can be left in Vercel (unused) or removed via Vercel project settings → Environment Variables → delete.

The bundled-depth engine remains the user-facing path during parallel-run regardless, so rollback has zero user impact in the parallel-run period.

If `tsc` fails after revert (unlikely but possible if the revert leaves orphan imports), run:
```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/website" && npx tsc --noEmit -p .
```
If errors surface, the AI provides a follow-up small fix-revert.

### 5. Verification step (post-deploy)

After Vercel auto-deploys the M1-CP4e-B commit:

```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/website" && LAYER1_REPLAY_CACHE=1 npx tsx scripts/verify-translation-sandwich.ts
```

Expected: `SUMMARY: <N> / <N> checks passed` where `N >= 220` (includes F7/F8/F9 fixtures + Phase 11 + Phase 12). All phases pass: `ALL CHECKS PASSED (Phase 1 + Phase 2 + Phase 3 + Phase 4 + Phase 5 + Phase 6 + Phase 7 + Phase 8 + Phase 9 + Phase 11 + Phase 12)`.

Live verification:
```
curl -X POST https://sagereasoning.com/api/reason -H "Content-Type: application/json" -d '{"text":"hello"}' | head -c 500
```

Expected: full evaluation response (no Tier 1 fire on a benign input). Confirms the route is responsive and the parallel-run dormant default still produces bundled-depth results.

If founder is feeling ambitious (optional): submit a known-Tier-1 input via `/admin/test-reason` to confirm Tier 1 fires + the response shape matches ADR-008 §2. Folds into M1-CP4f's admin-fixture work if not done at M1-CP4e-B.

### 6. Explicit founder approval — REQUIRED before deployment

The founder approves each named risk before push. The AI does not push. Approval phrasing must specifically address risks (a)–(g) above. The AI summarises the named risks at deploy time and asks for explicit approval; founder responds with "approve to deploy" + specific named-risk acknowledgement, or names which risks are not yet addressed.

The new env var `TRANSLATION_SANDWICH_TIER1_SECRET` MUST be set in Vercel BEFORE the M1-CP4e-B push:
- Vercel dashboard → sagereasoning project → Settings → Environment Variables → New
- Name: `TRANSLATION_SANDWICH_TIER1_SECRET`
- Value: a 32-byte cryptographically random base64-encoded string (AI generates and surfaces in plaintext; founder copies into Vercel; AI does not store)
- Environments: Production + Preview + Development (all three)
- Save

Without the env var set, the route's continuation_token validation returns `continuation_token_secret_missing` → HTTP 503 (not user-affecting because no client sends a continuation_token; the route's first-turn path is unaffected). Token issuance attempts (which only fire from the parallel-run logger when Tier 1 fires) would throw `Tier1SecretMissingError` → caught by the parallel-run try/catch → logged to console.warn. Fail-closed posture; no user-visible regression.

## Part B — Procedure

### Step 1 — Confirm M1-CP4e-A is deployed clean

```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
git log --oneline -1
```

Expected: latest commit is the M1-CP4e-A commit. Visit vercel.com/sagereasoning to confirm the deploy is green.

### Step 2 — Generate + provision TRANSLATION_SANDWICH_TIER1_SECRET

AI generates a 32-byte cryptographically random value, base64-encoded. AI surfaces it in plaintext (per the Critical Change Protocol's "do not store" discipline — AI prints once, founder copies to Vercel).

Founder pastes the value into Vercel project Environment Variables:
- Vercel dashboard → sagereasoning project → Settings → Environment Variables → New
- Name: `TRANSLATION_SANDWICH_TIER1_SECRET`
- Value: <the value the AI generated>
- Environments: Production + Preview + Development (check ALL THREE)
- Save

After saving, founder confirms by visiting Settings → Environment Variables and verifying the variable name appears (the value is masked).

### Step 3 — Add F7 + F8 + F9 fixtures to the harness FIXTURES array

Edit `website/scripts/verify-translation-sandwich.ts`. Find the FIXTURES array (line 269 at M1-CP4e-A close). Append three entries per the specs in ADR-005 §8.1 (F7) + the cross-referenced specs for F8 + F9.

### Step 4 — Run the harness with real Sonnet to extract + cache F7/F8/F9 Layer 1 schemas

```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/website" && npx tsx scripts/verify-translation-sandwich.ts
```

(No `LAYER1_REPLAY_CACHE=1` on this first run — harness extracts Layer 1 schemas via real Sonnet for F7/F8/F9 and caches them. Total cost: ~$0.30. Existing F1–F6 schemas are re-used from cache.)

Expected: 220+ checks pass. F7's `element_fusion_detected.fused === true`; F8 SCOPE_AMBIGUITY fires at Position 6; F9 TEMPORAL_AMBIGUITY fires at Position 2. F1–F6 maintain `element_fusion_detected.fused === false` baseline.

If F1–F6 fail the `fused: false` baseline (Sonnet over-fires ELEMENT_FUSION): tighten the system prompt's category 12 OUTPUT example per PR5 worked-example discipline. Re-run. PR5 watch-status advances to second-recurrence if this issue mirrors the M1-CP4b prose-fields pattern.

### Step 5 — Implement Phase 12 (second-turn resume)

Replace the Phase 12 stub in `verify-translation-sandwich.ts` with the full implementation per ADR-008 §8 + Phase 12 description. Phase 12 exercises the multi-turn flow:

1. Take F7 (or F8 / F9) as the first-turn input.
2. Issue a continuation token (using the test secret set in Phase 11's helper pattern).
3. Augment the input with a synthetic "answer" to the clarification question.
4. Re-extract Layer 1 (real Sonnet call — cached after first run).
5. Validate the token against the augmented input → expect input_hash mismatch (because the input changed).
6. Validate the token against the original input → expect success.
7. Run the engine on the augmented input → expect either a full evaluation OR a different Tier 1 trigger (never the same one twice in a row per D13's loop-guard implication).

Marginal cost: ~$0.10 for the augmented-input Layer 1 re-extractions.

### Step 6 — tsc + harness verification before commit

```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/website" && npx tsc --noEmit -p . && LAYER1_REPLAY_CACHE=1 npx tsx scripts/verify-translation-sandwich.ts
```

Expected: tsc clean (no output); harness 220+ / 220+ pass.

### Step 7 — Critical Change Protocol named-risk approval + deployment

AI summarises risks (a)–(g) per the checklist above. Founder explicitly approves each. AI surfaces the exact commit + push commands. Founder runs them. Vercel auto-rebuilds. Post-deploy verification per Step 5 of the checklist.

Commit message template:
```
M1-CP4e-B: AC-13 Tier 1 deployment under Critical Change Protocol

- TRANSLATION_SANDWICH_TIER1_SECRET provisioned in Vercel (Production + Preview + Development).
- F7 (element-fusion case) + F8 (scope-ambiguity case) + F9 (temporal-ambiguity case) fixtures added to harness FIXTURES array; Layer 1 schemas extracted via real Sonnet and cached.
- Phase 12 (second-turn resume) full implementation per ADR-008 §8.
- Critical Change Protocol named-risk approval completed by founder for risks (a)–(g) per the M1-CP4e-B prompt's checklist.
- Harness 220+ / 220+ checks pass against the with-Tier-1 engine.
- Decision-log entry D-M1-CP4e-B-AC13-TIER1-DEPLOYED appended (full Critical-tier form per cache).
- Cross-references: D-M1-CP4e-A (modules + ADR amendments + harness scaffold); D-M1-CP4d (ADR-008 design); D-M1-AC13-AC14-WIRING-REQUIRED-BEFORE-CUTOVER-2026-05-05 (parent scope).

Note: TRANSLATION_SANDWICH_PARALLEL_RUN remains 1 (parallel-run dormant default). User-facing path remains bundled-depth. The Tier 1 mechanic is now operative in the sandwich path; surfaces to user at M1-CP6 cutover (future session). Failure isolation per ADR-004 §6.3 + ADR-008 §7 preserved.
```

### Step 8 — Append decision-log entry (full form per cache)

Pattern: per `/adopted/standing-protocol-cache.md` §"Critical-risk sessions". Full form. Records Verification Method Used + Risk Classification Record + PR5 + Founder Verification + Orchestration Reminder.

ID suggestion: `D-M1-CP4e-B-AC13-TIER1-DEPLOYED-2026-MM-DD`. Cross-references: D-M1-CP4e-A + D-M1-CP4d + D-M1-CP4c + D-M1-CP4b + D-M1-AC13-AC14-WIRING-REQUIRED-BEFORE-CUTOVER + ADR-008 + amended ADR-005 + amended ADR-006.

### Step 9 — Session close (full form per cache)

Pattern: per `/adopted/standing-protocol-cache.md` §"Critical-risk sessions". Full form. Names M1-CP4f (parallel-run.ts orchestrator follow-up + comparison-table baseline reset + per-layer cost capture + admin/test-reason fixtures) as the next session.

## Part C — Anticipated session shape

| Phase | Estimate |
|---|---|
| Cache + predecessor close + ADR-008 + manifest re-reads + decision-log read | 25-35 min |
| Step 1 — confirm M1-CP4e-A deployed | 5-10 min |
| Step 2 — generate + provision env var | 15-25 min (founder Vercel-side action) |
| Step 3 — add F7/F8/F9 fixtures | 15-25 min |
| Step 4 — real-Sonnet harness run + cache F7/F8/F9 | 20-30 min (LLM calls; possible iteration if F1–F6 baseline fails) |
| Step 5 — implement Phase 12 | 30-45 min |
| Step 6 — tsc + harness | 15-25 min (real-Sonnet re-run for verification) |
| Step 7 — Critical Change Protocol + deploy | 25-40 min |
| Step 8 — Decision-log entry (full form) | 25-35 min |
| Step 9 — Session close (full form) | 25-35 min |
| **Total** | **~3-4 hours** |

## Rollback path

Per Critical Change Protocol Step 4 above. `git revert` of this session's commit. The route reverts to pre-M1-CP4e-B behaviour. The env var can be left in Vercel (unused) or removed. No data loss. No user impact during parallel-run.

## Forecast

If M1-CP4e-B lands clean: the AC-13 Tier 1 mechanic is operative end-to-end. The next sessions are:
- **M1-CP4f (Elevated)** — parallel-run.ts orchestrator follow-up + comparison-table baseline reset filtering pre-Tier-1 rows + per-layer cost capture (M1-CP5 first-pass Open Q1) + admin/test-reason fixtures + JSON export button.
- **M1-CP5 resume (governance + Elevated)** — comparison rubric reads against the with-Tier-1 engine; first-pass interpretation. Per-layer cost data informs R5 cost-health alert thresholds.
- **M1-CP6 (Critical)** — cutover. The orchestrator becomes user-facing; bundled-depth engine retired from the user-facing path; Tier 1 fires surface to clients; R10 announcement of the new public API contract.

If M1-CP4e-B surfaces a Tier 1 over-firing issue at Step 4 (real-Sonnet harness run): the session pauses at Step 4 with prompt-tightening iteration. PR5 watch-status would advance to second-recurrence. Refinement is session-internal.

If M1-CP4e-B surfaces a deployment regression at Step 7: the rollback path is immediate (`git revert + push`). The bundled-depth engine remains operational throughout. Any regression is bounded to the Tier 1 surface (which is dormant during parallel-run anyway).

End of prompt.
