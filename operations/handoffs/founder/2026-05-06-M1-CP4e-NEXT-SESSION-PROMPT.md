# Next-Session Prompt — M1-CP4e: Layer 1/2/3 module + route updates for AC-13 Tier 1

**Stream:** founder.
**Tier:** code-critical.
**Governing frame:** `/adopted/standing-protocol-cache.md` (full governance via the cache; deliverable-of-the-day = ADR-008 implementation).
**Predecessor session close:** `/operations/handoffs/founder/2026-05-06-sub-session-M1-CP4d-close.md`.
**Predecessor decision-log entries:** `D-M1-CP4d-MULTI-TURN-INPUT-FLOW-DESIGN-ADR-2026-05-06` (M1-CP4d — the design ADR this session implements); `D-M1-CP4c-LAYER-MODULES-AC14-TIER2-IMPLEMENTED-2026-05-06` (M1-CP4c — the engine substrate this session extends); `D-M1-CP4b-AC14-TIER2-ADR-AMENDMENTS-2026-05-06` (M1-CP4b — the in-place amendment precedent this session follows for ADR-005 + ADR-006); `D-M1-AC13-AC14-WIRING-REQUIRED-BEFORE-CUTOVER-2026-05-05` (parent scope decision).
**Risk classification:** **CRITICAL** under 0d-ii. **Critical Change Protocol applies — see Section "Critical Change Protocol checklist" below.** This session touches: the R20a perimeter route (`/api/reason`); a new server-side environment variable (`TRANSLATION_SANDWICH_TIER1_SECRET`); deployment configuration; the engine modules `layer1-extractor.ts` + `layer2-mechanisms.ts`; the parallel-run orchestrator. Critical surface area: AC5 + AC7-adjacent (the continuation token is HMAC-not-session, so AC7 is **not** strictly engaged per ADR-008's design, but the surface is sufficiently auth-adjacent that AC7-style discipline is applied) + PR6 + PR1 (single-endpoint proof — `/api/reason` is the M1 pilot; this is the first deployment of the multi-turn pattern).

## Why this session matters

ADR-008 specifies the architecture for AC-13 Tier 1 force-clarification on `/api/reason`. M1-CP4e implements it. Without this implementation, the engine cannot halt-and-ask when ELEMENT_FUSION / SCOPE_AMBIGUITY / TEMPORAL_AMBIGUITY conditions fire; M1-CP6 cutover would commit a translation-sandwich engine that does not honour the architecturally adopted Tier 1 commitment. This session also amends ADR-005 + ADR-006 in place per the M1-CP4b precedent, so the per-layer specifications include the Tier 1 trigger fields + short-circuits.

The session is Critical because: (a) `/api/reason` is one of the eight bound R20a routes per AC5, and the perimeter must be preserved across both turns of the multi-turn flow; (b) a new env var (`TRANSLATION_SANDWICH_TIER1_SECRET`) is added to Vercel deployment config — secret rotation, set/replace discipline, and never-log discipline apply; (c) the route's request-body parsing gains a new field (`continuation_token`) with strict validation — any wiring error could surface a Tier 1 response without distress check; (d) the parallel-run path's failure-isolation guarantee (ADR-004 §6.3) must be preserved across Tier 1 fires.

## Pre-conditions

1. ADR-008 is Adopted at `/adopted/adr/2026-05-06-multi-turn-input-flow-tier-1.md` (M1-CP4d's deliverable). Confirm at session open: `head -5 /Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/adopted/adr/2026-05-06-multi-turn-input-flow-tier-1.md` shows Status = Adopted.
2. The M1-CP4d commit is committed + pushed (per the M1-CP4d close's Step A).
3. The M1-CP4c module + harness updates are committed + pushed (per the M1-CP4c close's Step A — re-confirm).
4. Standalone harness reproduces 198 / 198 against the M1-CP4c baseline (re-run command in M1-CP4c close's Step B). M1-CP4e adds new fixtures F7 / F8 / F9 + new Phases 11 + 12; the post-M1-CP4e target is approximately **220+ checks** depending on per-fixture assertion counts.
5. Founder is ready for a 3–5 hour Critical-tier session — multi-step Critical Change Protocol with named-risk approval before deployment.
6. Vercel project access available (founder needs to set the new env var + push the deploy).

## Part A — Open under the protocol

Read in order:
1. `/adopted/standing-protocol-cache.md` — confirms tier `code-critical`; full session-opening protocol applies (NOT lean); Critical Change Protocol applies before deployment.
2. `/operations/handoffs/founder/2026-05-06-sub-session-M1-CP4d-close.md` — predecessor close.
3. **`/adopted/adr/2026-05-06-multi-turn-input-flow-tier-1.md` — read in full.** This is the deliverable-of-the-day spec. Especially §2 (response shape), §3.4 (ADR-005 amendment scope), §3.5 (ADR-006 amendment scope), §4 (continuation-token mechanic), §5 (route flow), §6 (R20a perimeter preservation), §7 (failure isolation), §8 (verification harness extension).
4. `/adopted/adr/2026-05-04-translation-sandwich-pilot-api-reason.md` §6 (parallel-run mechanics) + §6.3 (failure-isolation guarantee) + §8 (R20a perimeter preservation) + §9 (fallback semantics) — the constraints this session must preserve.
5. `/adopted/adr/2026-05-04-layer1-schema-specification.md` — the ADR being amended; especially the existing schema fields, validator pattern, system prompt structure, harness fixture pattern.
6. `/adopted/adr/2026-05-04-layer2-mechanism-algorithm.md` — the ADR being amended; especially the §3.9 algorithm (M1-CP4b additions) which the new short-circuits sit around.
7. `/adopted/rag-mentor-alt3/three-tier-intake.md` — re-skim Tier 1 specifications to confirm question stems are rendered verbatim.
8. `/manifest.md` — re-read R20a + AC4 + AC5 + AC7 + PR6 + PR1 in full. Critical-tier sessions require full re-read of engaged rules per cache Element 2.
9. `/operations/decision-log.md` last 3 entries (D-M1-CP4d, D-M1-CP4c, D-M1-CP4b).
10. `/website/src/app/api/reason/route.ts` — read the existing route end-to-end. The amendment must preserve every existing behaviour; the seven-step amended flow per ADR-008 §5 must be implemented as additive changes plus the new §3 token-validation step.

Confirm at session open per cache + full protocol:
- Tier: **`code-critical`**.
- Hold-point: P0 0h active.
- Risk class: **Critical** under 0d-ii (per cache Element 8 + project instructions 0c-ii).
- Status vocabulary: `/api/reason` route + `layer1-extractor.ts` + `layer2-mechanisms.ts` move from **Wired (parallel-run, dormant by default)** to **Wired (parallel-run, dormant by default; with Tier 1 force-clarification)**. ADR-005 + ADR-006 implementation status updated to reflect amendments. ADR-008 implementation status moves from **Designed** to **Wired** (orchestrator + route).
- Model selection per cache Element 6: **Sonnet** for Layer 1 re-extraction (unchanged from M1-CP1 spec); per AC1 + KG2.
- Engaged rules: R0 (oikeiosis — engine reasons by principled mechanism, including halting honestly); R5 (cost — extra Layer 1 call per Tier 1 fire); R7 (source fidelity — question stems verbatim from D13); R8a (controlled vocabulary — Tier 1 trigger codes); R8c (English-only on user-facing prose); R10 (skill marketplace — public API contract gains discriminated union); AC1 + AC4 + AC5 + AC6 + AC8 + KG1 + KG2 + KG6 + PR1 + PR3 + PR4 + PR6. AC7 NOT engaged (HMAC token, not session). PR5 watch-status PRESERVED.

## Critical Change Protocol checklist (per project instructions 0c-ii)

The AI must complete each step visibly in the conversation before the founder deploys. The founder approves each named risk explicitly.

### 1. What is changing — plain language, no jargon

The route at `/api/reason` will gain the ability to ask the practitioner a clarifying question when the engine cannot proceed without more information. When that happens, the route returns a special "needs more info" response instead of an evaluation. The website (or any external skill consumer) shows the question to the practitioner; they answer; the website re-submits the original input plus the answer plus a small signed token; the engine starts fresh and either produces the evaluation or asks another question. From the practitioner's perspective on sagereasoning.com: occasionally, instead of an evaluation, they see a clarifying question and a text field to answer it.

### 2. What could break — specific failure modes

(a) **Existing single-turn requests could fail to evaluate.** If the new logic incorrectly fires Tier 1 on inputs that should produce evaluations, practitioners experience "it keeps asking me questions" instead of getting evaluations. Mitigation: Phase 1 + 4 harness assertions on F1–F6 confirm Tier 1 does NOT fire on the existing fixtures.

(b) **R20a distress check could be bypassed on the second turn.** The most serious failure mode. If the route validates the continuation token before running the distress check, a practitioner whose second-turn input contains acute distress signals would not be redirected. Mitigation: Phase 7 harness assertion explicitly verifies distress check fires on every turn before token validation; AC4 invocation test (grep + execution path proof) confirmed before deployment.

(c) **Continuation token leakage.** If `TRANSLATION_SANDWICH_TIER1_SECRET` is logged or sent client-side, attackers can forge tokens. Mitigation: the secret never appears in any `console.log` / `console.warn` / response body / error message; the secret is set only in Vercel env vars.

(d) **Parallel-run failure-isolation could leak.** During parallel-run, the bundled-depth path remains the user-facing path. If a sandwich-path Tier 1 fire incorrectly surfaces to the user during parallel-run, the user sees a clarification question without warning. Mitigation: ADR-004 §6.3 + ADR-008 §7; Phase 8 harness assertion extended for Tier 1 fires.

(e) **Build break on Vercel.** A `tsc` error or runtime error in the new code could break the build, taking the entire site down. Mitigation: `cd website && npx tsc --noEmit -p .` returns clean before commit; harness 220+ checks pass before commit.

(f) **Regression on existing M1-CP4c functionality.** AC-14 Tier 3 + Tier 2 currently work at 198/198. Any regression in `applyMechanisms` could break those. Mitigation: pre-existing F1–F6 fixtures continue to pass; harness still produces 198+ on the existing checks plus the new Tier 1 phases on F7/F8/F9.

(g) **Vercel cold-start latency.** The new code adds module-load weight. Vercel cold-start could approach the 60-second timeout. Mitigation: `meta.latency_ms` capture extended at M1-CP4f; M1-CP5 latency review.

### 3. What happens to existing sessions

No user sessions exist today (no auth surface engaged for `/api/reason`). The route is rate-limited but not session-bound. Existing in-flight requests continue with the bundled-depth path during parallel-run. After cutover (M1-CP6, not this session), in-flight requests would see the new shape; that is M1-CP6's concern, not M1-CP4e's.

### 4. Rollback plan

The exact rollback steps the founder can run independently:

```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
git log --oneline -5
# Identify the M1-CP4e commit hash
git revert <commit-hash>
git push
```

Then push via GitHub Desktop. Vercel auto-deploys on push. Within 2–3 minutes, the route reverts to its pre-M1-CP4e behaviour. The new env var `TRANSLATION_SANDWICH_TIER1_SECRET` can be left in Vercel (unused) or removed via Vercel project settings → Environment Variables → delete.

The bundled-depth engine remains the user-facing path during parallel-run, so rollback has zero user impact in the parallel-run period. The harness reverts to its pre-M1-CP4e checks (198 / 198).

If `tsc` fails after revert (unlikely but possible if the revert leaves orphan imports), run:

```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/website" && npx tsc --noEmit -p .
```

If errors surface, the AI provides a follow-up small fix-revert.

### 5. Verification step

After deployment:

```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/website" && LAYER1_REPLAY_CACHE=1 npx tsx scripts/verify-translation-sandwich.ts
```

Expected: `SUMMARY: <N> / <N> checks passed` where `N >= 220` (M1-CP4c was 198; M1-CP4e adds Tier 1 phases). All phases pass: `ALL CHECKS PASSED (Phase 1 + Phase 2 + Phase 3 + Phase 4 + Phase 5 + Phase 6 + Phase 7 + Phase 8 + Phase 9 + Phase 11 + Phase 12)`.

Post-deploy live verification:

```
curl -X POST https://sagereasoning.com/api/reason -H "Content-Type: application/json" -d '{"text":"hello"}' | head -c 500
```

Expected: full evaluation response (no Tier 1 fire on a benign input). Confirms the route is responsive and the parallel-run dormant default still produces bundled-depth results.

If founder is feeling ambitious (optional): submit a known-Tier-1 input via `/admin/test-reason` to confirm Tier 1 fires + the response shape matches ADR-008 §2. Folds into M1-CP4f's admin-fixture work if not done at M1-CP4e.

### 6. Explicit founder approval — REQUIRED before deployment

The founder approves each named risk before push. The AI does not push. Approval phrasing must specifically address risks (a)–(g) above. The AI summarises the named risks at deploy time and asks for explicit approval; founder responds with "approve to deploy" + specific named-risk acknowledgement, or names which risks are not yet addressed.

The new env var `TRANSLATION_SANDWICH_TIER1_SECRET` must be set in Vercel BEFORE deployment. The session walks the founder through the exact steps:
- Vercel dashboard → sagereasoning project → Settings → Environment Variables → New
- Name: `TRANSLATION_SANDWICH_TIER1_SECRET`
- Value: a 32-byte cryptographically random base64-encoded string (AI generates and surfaces; founder copies into Vercel; AI does not store)
- Environments: Production + Preview + Development (all three)
- Save

Without the env var, the route's token-issuance code throws on first Tier 1 fire (which would surface as a 500 error to the user, not a security risk — fail-closed). The Critical Change Protocol confirms env var presence before deployment.

## Part B — Procedure

### Step 1 — Re-confirm session-open posture + load context

Per Part A reads. Confirm pre-conditions 1–6. State Critical Change Protocol checklist intent. Surface any unresolved questions before proceeding.

### Step 2 — Amend ADR-005 in place per ADR-008 §3.4

Path: `/adopted/adr/2026-05-04-layer1-schema-specification.md`.

Add: `element_fusion_detected: { fused: boolean, fused_concerns: string[] | null }` as a new top-level Layer1Schema field. New entry-shape interface `ElementFusionDetected`. Extend REQUIRED_KEYS. Extend `validateLayer1Schema` with shape + boolean + array-of-string + non-empty-when-true cross-field validation. Extend `LAYER1_SYSTEM_PROMPT` from "eleven content categories" to "twelve content categories"; add category 12 to EXTRACTION CONTRACT with worked OUTPUT example entry per PR5. Add F7 fixture (element-fusion case). Schema version remains `layer1-schema-v1` (additive). Append Changelog entry dated 2026-05-06 (M1-CP4e amendment).

### Step 3 — Amend ADR-006 in place per ADR-008 §3.5

Path: `/adopted/adr/2026-05-04-layer2-mechanism-algorithm.md`.

Add: new exported function `detectTier1Trigger(schema: Layer1Schema): Tier1Trigger | null`. Two new short-circuits in `applyMechanisms` (Position 2 TEMPORAL_AMBIGUITY; Position 6 SCOPE_AMBIGUITY). New controlled-vocabulary type `Tier1TriggerCode = 'ELEMENT_FUSION' | 'SCOPE_AMBIGUITY' | 'TEMPORAL_AMBIGUITY'`. New interface `Tier1Trigger { trigger_code; question_text; stem_id; slot_fills; fired_at_position }`. Add F8 (scope-ambiguity case) + F9 (temporal-ambiguity case) fixtures. Append Changelog entry dated 2026-05-06 (M1-CP4e amendment).

### Step 4 — Implement ADR-005 amendment in `layer1-extractor.ts`

Per Step 2's amendment text. tsc clean throughout.

### Step 5 — Implement ADR-006 amendment in `layer2-mechanisms.ts`

Per Step 3's amendment text. tsc clean throughout.

### Step 6 — Extend the parallel-run orchestrator (or its successor in M1-CP4f's planned scope)

Per ADR-008 §5. The orchestrator gains: pre-Layer-2 ELEMENT_FUSION check (Layer 1's `element_fusion_detected.fused === true` halts before Layer 2); post-Layer-1 / pre-Layer-3 Tier 1 trigger detection via `detectTier1Trigger`. Returns Tier 1 response shape per ADR-008 §2 when fires; returns full evaluation otherwise. Failure-isolation: per ADR-008 §7, sandwich-path Tier 1 fires during parallel-run are logged but do NOT surface to the user.

### Step 7 — Amend `/api/reason` route per ADR-008 §5

The seven-step flow. New continuation-token validation logic. Token issuance on Tier 1 fire. R20a perimeter preservation: every turn runs distress check before token validation.

### Step 8 — Generate + provision `TRANSLATION_SANDWICH_TIER1_SECRET`

AI generates a 32-byte base64-encoded random value. Founder copies into Vercel project Environment Variables (Production + Preview + Development). AI confirms via the verification step (a small probe endpoint or a test invocation that does not log the secret).

### Step 9 — Extend the harness with Phases 11 + 12 + new fixture assertions

Per ADR-008 §8. F7 / F8 / F9 fixtures added. Phase 1 / Phase 4 / Phase 6 / Phase 7 / Phase 8 extended with Tier 1 expectations. Phase 11 (continuation-token mechanic). Phase 12 (second-turn resume). Target: 220+ checks pass on first real-Sonnet run.

### Step 10 — tsc + harness verification before commit

```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/website" && npx tsc --noEmit -p . && LAYER1_REPLAY_CACHE=1 npx tsx scripts/verify-translation-sandwich.ts
```

Expected: tsc clean (no output); harness 220+ / 220+ passes.

### Step 11 — Critical Change Protocol named-risk approval + deployment

AI summarises risks (a)–(g) per the checklist. Founder explicitly approves each. AI surfaces the exact commit + push commands. Founder runs them. Vercel auto-rebuilds. Post-deploy verification per Step 5 of the checklist.

### Step 12 — Append decision-log entry (full form per cache for Critical sessions)

Pattern: per `/adopted/standing-protocol-cache.md` §"Critical-risk sessions". The full form includes Verification Method Used, Risk Classification Record, PR5 Knowledge-Gap Carry-Forward, Founder Verification (Between Sessions), Orchestration Reminder.

ID suggestion: `D-M1-CP4e-LAYER-MODULES-AND-ROUTE-AC13-TIER1-IMPLEMENTED-2026-MM-DD`. Cross-references: D-M1-CP4d + D-M1-CP4c + D-M1-CP4b + D-M1-AC13-AC14-WIRING-REQUIRED + ADR-008 + amended ADR-005 + amended ADR-006.

### Step 13 — Session close (full form per cache for Critical sessions)

Pattern: per `/adopted/standing-protocol-cache.md` §"Critical-risk sessions". Full form. Names M1-CP4f (parallel-run.ts orchestrator + comparison-table baseline reset + per-layer cost capture + admin/test-reason fixtures) as the next session.

## Part C — Anticipated session shape

| Phase | Estimate |
|---|---|
| Cache + predecessor close + ADR-008 + ADR-004 §6 + §8 + §9 + ADR-005 + ADR-006 + manifest re-reads + decision-log read | 35-50 min |
| Step 1 — confirm posture | 10-20 min |
| Step 2 — Amend ADR-005 | 25-40 min |
| Step 3 — Amend ADR-006 | 25-40 min |
| Step 4 — Implement ADR-005 amendment | 30-50 min |
| Step 5 — Implement ADR-006 amendment | 30-50 min |
| Step 6 — Orchestrator extension | 25-40 min |
| Step 7 — Route amendment | 30-50 min |
| Step 8 — Env var provision | 15-25 min (founder Vercel-side action) |
| Step 9 — Harness extension | 30-50 min |
| Step 10 — tsc + harness | 15-25 min (real-Sonnet run for F7/F8/F9 fresh extractions) |
| Step 11 — Critical Change Protocol + deploy | 25-40 min |
| Step 12 — Decision-log entry (full form) | 30-45 min |
| Step 13 — Session close (full form) | 30-45 min |
| **Total** | **~5-7 hours** |

If the session shape exceeds 7 hours or the founder's appetite, the natural split point is between Step 7 and Step 8 (modules + ADRs + harness in session 1; route + env var + deploy in session 2). The founder decides at session midpoint.

## Rollback path

Per Critical Change Protocol Step 4 above. `git revert` of this session's commit. The route reverts to pre-M1-CP4e behaviour. The env var can be left in Vercel (unused) or removed. No data loss. No user impact during parallel-run because the bundled-depth path remains user-facing.

## Forecast

If M1-CP4e lands clean: M1-CP4f is the next session — Elevated-tier orchestrator update + cost capture + comparison-table baseline reset + admin/test-reason fixtures + JSON export button. M1-CP4f folds in the M1-CP5 first-pass Open Q1 (per-layer cost capture) + the M1-CP4d open question 4 (external skill consumer onboarding doc timing — possibly drafted at M1-CP4f, possibly held until M1-CP6 R10 announcement preparation).

If M1-CP4e surfaces a wiring issue that requires an additional Critical-tier session: the session pauses at Step 11 (deployment) with a clear handoff to M1-CP4e-followup. The architectural intent is preserved — Tier 1 force-clarification is the most operationally consequential of the three tiers; design care at M1-CP4d + implementation care at M1-CP4e pay compound interest at M1-CP6 cutover.

If real-Sonnet F7/F8/F9 extraction surfaces unexpected Layer 1 behaviour (e.g., Sonnet over-extracts ELEMENT_FUSION on F1–F6 baseline-no-fusion fixtures): the harness Phase 1 baseline assertion fails; the session pauses at Step 10. Refinement is a session-internal iteration: tighten the system prompt category 12 OUTPUT example per PR5 worked-example discipline; re-extract; re-run. PR5 watch-status would advance to "second recurrence" if the issue mirrors the M1-CP4b prose-fields-4-and-5 pattern.

End of prompt.
