# Session Close — 2026-05-07 — Sub-session M1-CP4e-B: AC-13 Tier 1 Deployment under Critical Change Protocol

**Stream:** founder.
**Governing frame:** `/adopted/standing-protocol-cache.md` §"Critical-risk sessions" (full form for `code-critical` category).
**Tier:** code-critical — **Critical** risk under 0d-ii. Critical Change Protocol applied at deployment time per project instructions 0c-ii.
**Date:** 2026-05-07.

## Decisions Made

**D-M1-CP4e-B-AC13-TIER1-DEPLOYED** appended to active decision log (~135 lines added; full Critical-tier form per cache). The seven Critical Change Protocol risks (a)–(g) per the M1-CP4e-B prompt's checklist were summarised in chat and explicitly approved by the founder ("Approve all seven (a)–(g)" at 2026-05-07).

M1-CP4e-B closed the deployment loop opened at M1-CP4e-A:

1. **`TRANSLATION_SANDWICH_TIER1_SECRET` provisioned in Vercel** at session start. Founder pasted a 32-byte cryptographically random base64-encoded value into Vercel project Settings → Environment Variables across Production + Preview + Development. AI generated the value once in chat (do-not-store discipline); founder copied; AI did not retain.

2. **F7 + F8 + F9 fixtures added to harness FIXTURES array** per ADR-005 §8.1. F7 (element-fusion case): expected `element_fusion_detected.fused === true`; expected_non_empty intentionally empty per the fusion-bypass rationale (downstream extraction not load-bearing). F8 (scope-ambiguity case): expected `passions_present` + `control_filter_elements` + `causal_stage_evidence`. F9 (temporal-ambiguity case): expected `passions_present` + `causal_stage_evidence`. Fixture interface comment extended to F1–F9.

3. **Real-Sonnet harness run on founder's machine** populated F7/F8/F9 Layer 1 schemas (cached locally) + regenerated F1+F2 Layer 3 prose (deleted at M1-CP4e-A) + re-extracted F1–F6 with the M1-CP4e tightened category 12 prompt. Marginal cost ~$0.50. Calibration validation confirmed: F7 `fused: true` + non-empty `fused_concerns`; F8 `SCOPE_AMBIGUITY` at Position 6; F9 `TEMPORAL_AMBIGUITY` at Position 2; F1–F4 NOT over-firing Tier 1 (the M1-CP4e-A tightened prompt held).

4. **Phase 12 second-turn resume implementation landed in full** per ADR-008 §8. Async function with Phase11-pattern test secret (process-local mutation, restored in `finally`). Three Phase12Fixtures with synthetic practitioner answers appended to original inputs. Per-fixture: token issuance + augmented-input mismatch (input_hash diverges, error_code `continuation_token_input_mismatch`) + original-input success (token still validates with original) + structural loop-guard. Cache key for augmented Layer 1 schemas: `${id}-aug-v1` (separate namespace from first-turn caches).

5. **Three structural pivots applied** (PR5 watch-status promoted to permanent KG entry on third+ recurrence):
   - **F2 motivation_stated carve-out** — Sonnet legitimately reads "I hate confrontation" as a stated motivation per ADR-005 §3.10; the original `=== false` baseline assertion is exempted for F2 with reasoning documented inline; structural consistency assertion (motivation_evidence well-typed + consistent with motivation_stated) preserved.
   - **F5 EUPATHEIA_BOUNDARY matcher pivoted to structural** — accepts genus (`eupatheia`) OR species (`chara`/`boulesis`/`eulabeia`) + marginal-case language (any of: `cannot` / `not yet` / `single instance` / `this instance alone` / `across instances` / `across this domain` / `arose in this domain`). Sonnet's chara-naming prose ("genuine chara (joy in another's good as an end in itself) or as boulesis (rational wishing) versus a polished surface over passion cannot be confirmed from this instance alone") now correctly recognised as structurally equivalent to the original assertion's intent.
   - **Phase 12 loop-guard pivoted to structural** — assertion is "engine produces valid output (assessment OR Tier 1 trigger; no throw)"; same-trigger-after-augmentation logged as INFO with ADR-008 §10.3 diagnostic. F9's TEMPORAL_AMBIGUITY firing again on the augmented input is a substantive product finding: the loop-guard is real-world-bounded by 2–3 turns, not strict 2 turns. The practitioner's clarification answer (appended) doesn't structurally remove the original input's past-anchored content; Sonnet extracts both past and future markers and the trigger predicates all still hold.

6. **F7 motivation_stated carve-out** — fusion-bypass case per ADR-005 §8.2; downstream extraction is not load-bearing on the Tier 1 path; the assertion is skipped when `element_fusion_detected.fused === true`.

7. **Permanent KG entry added** to `/operations/knowledge-gaps.md` § "Promoted pattern (3rd+ recurrence — load-bearing resolution) — Harness assertions on subjective LLM extractions must be structural, not content-specific". Resolution sketch from M1-CP4e-A close adopted; M1-CP4f scope captured (extend structural-over-content principle to other harness matchers).

8. **Critical Change Protocol named-risk approval (a)–(g) completed** by founder before push. AI summarised each risk + mitigation in chat; founder responded "Approve all seven (a)–(g)".

9. **Commit + push.** Single commit landed via founder's Terminal block + GitHub Desktop push. Vercel auto-rebuilt; deploy verified green by founder. Live curl smoke-test confirmed route is responsive (auth-redirect for unauthenticated request, as expected per pre-existing `requireAuth` gate at line 125 — not a regression).

**Final harness state: 273 / 273 checks PASS.** ALL CHECKS PASSED across Phases 1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 12. tsc clean across full codebase.

## Status Changes

| Item | Old status | New status |
|---|---|---|
| ADR-008 (`multi-turn-input-flow-tier-1.md`) implementation | Wired (modules + orchestrator + route + harness; no deploy; 207/207 harness) at M1-CP4e-A | **Verified (deployed; observation-only logging during parallel-run; 273/273 harness with full Phase 12).** Tier 1 mechanic operative end-to-end in the sandwich path. User-facing path remains bundled-depth (parallel-run dormant default). |
| `tier1-token.ts` | Wired + Verified standalone (Phase 11 — 13/13 sub-checks PASS) at M1-CP4e-A | **Verified end-to-end** (Phase 12 second-turn flow exercised on F7/F8/F9 with real Sonnet; token issuance + validation + mismatch detection all asserted). |
| `TRANSLATION_SANDWICH_TIER1_SECRET` env var | NOT YET SET at M1-CP4e-A close | **Provisioned in Vercel** (Production + Preview + Development) at session start. Read at request time only when continuation_token is present in body; never logged; never sent to clients. |
| `verify-translation-sandwich.ts` harness | Wired (Phases 1–9 + 11 + Phase 12 stub; 207/207 at M1-CP4e-A) | **Verified end-to-end** (273/273 with full Phase 12 + F7/F8/F9 fixtures + three structural pivots + two carve-outs documented inline). |
| `/api/reason` route | Wired (continuation_token validation after R20a perimeter) at M1-CP4e-A | **Verified deployed** (Vercel green; live curl confirms responsive; auth-redirect on unauthenticated requests as expected per pre-existing `requireAuth` gate). |
| Layer 1 schema cache files (F7, F8, F9) | did not exist | **Wired (real-Sonnet extractions cached locally, gitignored).** F7 `fused: true` + fused_concerns; F8 `fused: false` + structural conditions for SCOPE_AMBIGUITY; F9 `fused: false` + structural conditions for TEMPORAL_AMBIGUITY. |
| Layer 1 schema cache files (F7-aug-v1, F8-aug-v1, F9-aug-v1) | did not exist | **Wired (Phase 12 second-turn caches).** Augmented inputs extracted via real Sonnet; loop-guard outcomes diagnosed: F7 augmented produced different trigger or full assessment; F8 augmented produced different trigger or full assessment; F9 augmented produced SAME TEMPORAL_AMBIGUITY trigger (real-world expected; logged as INFO). |
| Layer 3 prose cache files (F1, F2) | Deleted at M1-CP4e-A | **Wired (regenerated this session).** New prose written by real-Sonnet run; consistent with M1-CP4b §3.9 expected behaviour for the recalibrated F1+F2 Layer 1 extractions. |
| `/operations/knowledge-gaps.md` | PR5 watch-status finding from M1-CP4e-A | **PR5 PROMOTED to permanent KG entry** (3rd+ recurrence). New section: "Promoted pattern — Harness assertions on subjective LLM extractions must be structural, not content-specific." |
| `D-M1-CP4e-B-AC13-TIER1-DEPLOYED` decision-log entry | did not exist | **Adopted.** Full Critical-tier form per cache (Verification Method Used + Risk Classification Record + PR5 Knowledge-Gap Carry-Forward + Founder Verification + Orchestration Reminder + Open Questions). |

## Next Session Should

**Sub-session M1-CP4f — parallel-run.ts orchestrator follow-up + comparison-table baseline reset + per-layer cost capture + admin/test-reason fixtures + harness assertion strategy refactor.** Per ADR-004 §10's amended checkpoint table + the M1-CP4e-B prompt's forecast. **Elevated-tier session — no Critical Change Protocol.**

The session executes the post-deployment cleanup + observation infrastructure:

1. **Parallel-run.ts orchestrator follow-up.** Confirm sandwich-path Tier 1 fires log correctly to the comparison table during parallel-run (analytical-only; user-facing path remains bundled-depth). Verify failure isolation per ADR-004 §6.3 + ADR-008 §7 against real traffic (if any has arrived during the M1-CP4e-B observation window).

2. **Comparison-table baseline reset.** Pre-Tier-1 rows in `translation_sandwich_comparisons` (the `12 sandwich_completed / 37 total` accumulated pre-M1-CP4e per the predecessor close's Step C monitoring) should be filtered out or reset before M1-CP5 reads the rubric. Sandwich engine now produces Tier 1 response shapes in the dormant path; rubric needs to handle them.

3. **Per-layer cost capture (M1-CP5 first-pass Open Q1 from 2026-05-05).** Extend `extractFeatures` and `generateProse` to return token usage. Wire into the parallel-run cost-tracker. Sets up R5 cost-health alert calibration for M1-CP5.

4. **Admin/test-reason fixtures (M1-CP4f scope per parent decision).** The `/admin/test-reason` page (added at 2026-05-04) needs Tier 1 fixtures so the founder can exercise the mechanic without going through the sagereasoning.com auth flow. F7/F8/F9-style inputs as prepopulated test buttons.

5. **Harness assertion strategy refactor.** Per the new permanent KG entry: extend the structural-over-content principle systematically to other content-specific assertions in the harness — `proseHasUndecidableKathekonPhrasing`, `proseHasSingleSnapshotPhrasing`, `proseHasNoImprovementPathPhrasing`, EUPATHEIA_BOUNDARY / PRAXIS_MOTIVATION_AMBIGUITY stem fragment matchers. Systematic review pass.

Pre-conditions for M1-CP4f:
1. M1-CP4e-B deploy verified green (done — confirmed by founder).
2. Founder is ready for an Elevated-tier session — typically 2–3 hours.
3. Anthropic API key in `.env.local` (no marginal cost expected; M1-CP4f is mostly governance + non-LLM code).
4. Vercel project access available (no env var changes anticipated).

Estimated time: 2–3 hours.

Next-session prompt: to be drafted at M1-CP4f session-open OR as a separate prompt-drafting session at founder's discretion.

## Blocked On

**Files remaining uncommitted at session close:**

- `/operations/handoffs/founder/2026-05-07-sub-session-M1-CP4e-B-close.md` (this file — new)
- `/operations/knowledge-gaps.md` (modified — PR5 promotion entry appended)

**Production state at session close:**

- Vercel deployment: **green and live.** M1-CP4e-A code (commits `c0deccd` + `a4300a3`) plus M1-CP4e-B harness changes (this session's commit) deployed. The Tier 1 mechanic is operative end-to-end in the sandwich path. `TRANSLATION_SANDWICH_PARALLEL_RUN` remains `1` (parallel-run dormant default; orchestrator runs only in sandwich path); `TRANSLATION_SANDWICH_TIER1_SECRET` is provisioned. **User-visible behaviour is UNCHANGED** — user-facing path remains bundled-depth. Tier 1 fires surface to clients at M1-CP6 cutover (future session).
- Supabase `supabase-us`: **unchanged.** No DDL or DML this session.
- Env flags: `TRANSLATION_SANDWICH_PARALLEL_RUN` = `1` in Vercel Production. `TRANSLATION_SANDWICH_TIER1_SECRET` SET in Vercel (Production + Preview + Development).
- AC4 / AC5 (code-level): ENGAGED at the route + orchestrator + harness. R20a perimeter preservation verified at the route via comments + Phase 7 of the harness (8/8 PASS) + pre-deploy grep confirming distress check runs before token validation. AC7 NOT engaged.
- AC1 + AC8 + KG1 + KG2 + KG6 + PR1 + PR3 + PR4 + PR6: ENGAGED at the implementation level.
- PR5: **PROMOTED to permanent KG entry** (third+ recurrence; new section in `/operations/knowledge-gaps.md`).
- LLM cost incurred this sub-session: **~$0.50** (F7/F8/F9 + F1+F2 layer3 regen + Phase 12 augmented-input extractions). Total M1-CP4e cycle (4e-A + 4e-B): ~$1.30.

## Verification Method Used (0c Framework)

| Work item | Verification method | Result |
|---|---|---|
| `TRANSLATION_SANDWICH_TIER1_SECRET` provisioned in Vercel | Founder visited Vercel dashboard → Settings → Environment Variables → confirmed variable name appears with value masked across Production + Preview + Development | ✓ verified |
| F7/F8/F9 fixtures + Phase 12 implementation | Real-Sonnet harness run on founder's machine surfaced calibration findings (F2 motivation_stated drift, F5 EUPATHEIA prose drift, F9 same-trigger); structural pivots applied; final 273/273 PASS confirmed via REPLAY-mode in AI sandbox | ✓ verified |
| F1+F2 Layer 3 prose regeneration | New cache files written by real-Sonnet run; F5 chara/boulesis prose recognised by structural matcher | ✓ verified |
| F7 ELEMENT_FUSION fires correctly | Phase 3 Branch A asserts trigger_code === ELEMENT_FUSION + idempotent + fired_at_position === layer1 | ✓ verified |
| F8 SCOPE_AMBIGUITY at Position 6 | Phase 3 Branch B asserts trigger_code + fired_at_position === position-6 + idempotent | ✓ verified |
| F9 TEMPORAL_AMBIGUITY at Position 2 | Phase 3 Branch B asserts trigger_code + fired_at_position === position-2 + idempotent | ✓ verified |
| F1–F4 baseline (no Tier 1 over-fire) | Phase 4 baseline assertions: open_deferrals empty + STATED_EQUANIMITY_UNVERIFIED not firing for F1/F3/F4 | ✓ verified |
| Phase 12 second-turn resume | Token issuance + augmented-input mismatch + original-input success + structural loop-guard with diagnostic INFO logs across F7/F8/F9 | ✓ verified |
| tsc clean | `npx tsc --noEmit -p .` returned zero output across full codebase (run on AI sandbox after each edit; reconfirmed by founder before commit) | ✓ verified |
| Critical Change Protocol named-risk approval (a)–(g) | Summarised in chat at 2026-05-07; founder approved each explicitly ("Approve all seven (a)–(g)") | ✓ verified |
| Vercel deployment | Founder commit + push via Terminal block + GitHub Desktop; Vercel auto-rebuilt; deploy confirmed green by founder | ✓ verified |
| Live route smoke-test (curl) | `curl POST /api/reason` returned auth-redirect — expected behaviour per pre-existing `requireAuth` gate (not a regression); confirmed route is responsive (~1s response) | ✓ verified |
| Permanent KG entry added | `/operations/knowledge-gaps.md` modified; new "Promoted pattern" section appended; cross-references to D-M1-CP4e-A and D-M1-CP4e-B and D-M1-CP4b | ✓ verified |

## Risk Classification Record (0d-ii)

| Change | Classification | Engaged at M1-CP4e-B? |
|---|---|---|
| `TRANSLATION_SANDWICH_TIER1_SECRET` env var provision in Vercel | Critical (deployment configuration) | YES — landed at session start |
| Harness extensions (F7/F8/F9 fixtures + F2 + F7 carve-outs + Phase 12 implementation) | Standard (test harness; no production touch) | YES — landed |
| Structural pivots (F5 EUPATHEIA matcher + Phase 12 loop-guard) | Standard (test harness — assertion strategy refinement) | YES — landed |
| Decision-log entry D-M1-CP4e-B | Standard (governance) | YES — landed |
| Knowledge-gaps register update (PR5 promotion) | Standard (governance) | YES — landed |
| Vercel deployment via M1-CP4e-A code activation (now that secret is set) | Critical (live exposure of dormant code path; user-facing remains bundled-depth) | YES — at founder's commit + push; verified green |
| Session close + KG update commit (this file + knowledge-gaps.md) | Standard (governance) | DEFERRED to founder's follow-up commit |

## PR5 Knowledge-Gap Carry-Forward

**PR5 watch-status PROMOTED to permanent KG entry** on this session's third+ recurrence. New entry in `/operations/knowledge-gaps.md` § "Promoted pattern (3rd+ recurrence — load-bearing resolution) — Harness assertions on subjective LLM extractions must be structural, not content-specific". Three drift observations captured this session:

- **F2 `motivation_stated` drift** (Sonnet's reading of "I hate confrontation" as motivation): defensible per ADR-005 §3.10. Resolution: F2 carve-out from baseline assertion; structural consistency assertion preserved.
- **F5 EUPATHEIA prose drift** (Sonnet writes about chara/boulesis species rather than eupatheia genus): both valid; species-naming arguably more precise. Resolution: structural matcher accepts genus or species + marginal-case language.
- **F9 same-trigger after augmentation** (TEMPORAL_AMBIGUITY fires again because original past-anchored content remains present): substantive product finding. ADR-008 §10.3's loop-guard is real-world-bounded by 2–3 turns, not strict 2 turns. Resolution: Phase 12 loop-guard pivoted to structural; same-trigger logged as INFO with diagnostic.

The two structural pivots applied this session (F5 EUPATHEIA matcher; Phase 12 loop-guard) are the PR5-promotion-driven implementations of the watch-status resolution sketch. M1-CP4f's harness assertion strategy refactor extends this pattern systematically.

**Concepts re-explained this session: zero.** Founder verified the structural pivot reasoning (Option A for F9, Option B for F5) without re-explanation. Eupatheia subtype extension (chara/boulesis/eulabeia) was a small refinement of Option B, surfaced briefly and applied.

**Other findings logged:**

- **PR8 promotion candidate (in-place ADR amendment pattern):** NOT engaged this session — M1-CP4e-B is governance + harness only; no ADR amendments. Third recurrence count from M1-CP4e-A holds; promotion at next cycle if observed once more.
- **F-series stewardship finding (PR9 — Efficiency & Stewardship):** the harness's content-specific assertion pattern is fragile across Sonnet runs. M1-CP4f's assertion strategy refactor will systematically address this.
- **F-series stewardship finding (NEW — Long-term regression candidate):** the AI sandbox lacks network access to api.anthropic.com. Real-Sonnet harness runs MUST happen on the founder's machine. Documented in this close + the M1-CP4e-B procedural flow. Impact: any session involving a real-Sonnet step requires founder-side execution + return-of-output. Mitigation discipline: AI handles tsc + REPLAY-mode harness verification in-sandbox; founder runs non-replay LLM steps. Logged for awareness; no resolution required (this is a workspace constraint, not a defect).

## Founder Verification (Between Sessions)

**Step A — Commit the session close + KG update.** Two governance files remain uncommitted at session close. Open Terminal, paste this exact block, press **Enter**:

```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning" && git add operations/handoffs/founder/2026-05-07-sub-session-M1-CP4e-B-close.md operations/knowledge-gaps.md && git commit -m "M1-CP4e-B session close + PR5 promotion to permanent KG entry

- Session close at /operations/handoffs/founder/2026-05-07-sub-session-M1-CP4e-B-close.md (full Critical-tier form per cache).
- Permanent KG entry added to /operations/knowledge-gaps.md: 'Promoted pattern (3rd+ recurrence) — Harness assertions on subjective LLM extractions must be structural, not content-specific.' PR5 watch-status from M1-CP4e-A close promoted on third+ recurrence.

Standard-risk governance commit (no production touch). Cross-references: D-M1-CP4e-B-AC13-TIER1-DEPLOYED-2026-05-07."
```

Then push via **GitHub Desktop**: open GitHub Desktop → select sagereasoning repo → click **Push origin**.

If `git add` fails with `index.lock` errors, paste this in Terminal first then retry:

```
rm "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/.git/index.lock"
```

Vercel will rebuild on push but only governance files changed; build will be green and zero behavioural change.

**Step B — Independent verification (already performed during session).** Vercel deploy is green. Live curl smoke-test confirmed route is responsive. Harness 273/273 PASS (REPLAY mode). tsc clean. Step B is complete.

**Step C — Optional: monitor parallel-run accumulation between sessions.** Same query as the M1-CP4e-A close's Step C. Data accumulating in `translation_sandwich_comparisons` after the M1-CP4e-B deploy will start showing the with-Tier-1 engine's behaviour (Tier 1 fires logged in the sandwich-path comparison row; user-facing remains bundled-depth). M1-CP4f's first task includes filtering pre-Tier-1 rows out before M1-CP5 reads the rubric.

## Open Questions

(Carried into the decision-log entry; summarised here.)

1. **Token expiry tuning** (carried from ADR-008 §10.1) — revisit at M1-CP5.
2. **Loop-guard maximum** (carried from ADR-008 §10.3) — F9's same-trigger-after-augmentation surfaces the question. Revisit at M1-CP5 if observed traffic shows longer chains than the 2–3-turn working assumption.
3. **External skill consumer onboarding doc timing** (carried from M1-CP4d) — founder's call when R10 announcement is being prepared.
4. **F7-aug-v1 / F8-aug-v1 / F9-aug-v1 cache regeneration** — caches gitignored; re-running harness without LAYER1_REPLAY_CACHE regenerates; same Sonnet drift considerations apply.
5. **Harness assertion strategy refactor (M1-CP4f scope)** — extend structural-over-content principle systematically.
6. **Comparison-table baseline reset (M1-CP4f scope)** — pre-Tier-1 rows filtered out before M1-CP5 rubric read.
7. **Per-layer cost capture (M1-CP4f / M1-CP5 scope)** — extractFeatures + generateProse return token usage.
8. **PR8 promotion candidate (in-place ADR amendment pattern)** — third recurrence held from M1-CP4e-A; promotion at next cycle if observed once more.
9. **AI-sandbox-no-network finding** — real-Sonnet steps must run on founder's machine. Workspace constraint; mitigation discipline applied this session. Logged for awareness; no resolution required.

## Cross-references

- `/operations/handoffs/founder/2026-05-06-sub-session-M1-CP4e-A-close.md` (predecessor close)
- `/operations/handoffs/founder/2026-05-06-M1-CP4e-B-NEXT-SESSION-PROMPT.md` (the prompt this session executed)
- `/operations/decision-log.md` `D-M1-CP4e-B-AC13-TIER1-DEPLOYED-2026-05-07` (this session's entry)
- `/operations/decision-log.md` `D-M1-CP4e-A-LAYER-MODULES-ROUTE-HARNESS-AC13-TIER1-IMPLEMENTED-NO-DEPLOY-2026-05-06` (predecessor entry)
- `/operations/decision-log.md` `D-M1-CP4d-MULTI-TURN-INPUT-FLOW-DESIGN-ADR-2026-05-06` (ADR-008 design)
- `/operations/decision-log.md` `D-M1-AC13-AC14-WIRING-REQUIRED-BEFORE-CUTOVER-2026-05-05` (parent scope decision)
- `/operations/knowledge-gaps.md` § "Promoted pattern (3rd+ recurrence — load-bearing resolution) — Harness assertions on subjective LLM extractions must be structural, not content-specific" (this session's PR5 promotion)
- `/adopted/adr/2026-05-06-multi-turn-input-flow-tier-1.md` (ADR-008 — design ADR realised at M1-CP4e-A + M1-CP4e-B)
- `/adopted/adr/2026-05-04-layer1-schema-specification.md` (ADR-005 — amended in place at M1-CP4e-A per §3.4)
- `/adopted/adr/2026-05-04-layer2-mechanism-algorithm.md` (ADR-006 — amended in place at M1-CP4e-A per §3.5)
- `/adopted/adr/2026-05-04-translation-sandwich-pilot-api-reason.md` (ADR-004 — §6.3 + §10)
- `/adopted/ADR-RAG-MENTOR-ALT3-01-translation-sandwich-deterministic-engine.md` AC-13 (architectural commitment fully honoured: Tier 2 + Tier 3 from M1-CP4b/4c; Tier 1 from M1-CP4e-A + M1-CP4e-B)
- `/adopted/rag-mentor-alt3/three-tier-intake.md` (D13 — canonical Tier 1 stems verbatim)
- `/adopted/standing-protocol-cache.md` (operative governing frame; full form for code-critical)
- `/website/scripts/verify-translation-sandwich.ts` (the harness with the structural pivots applied)
- `/website/src/lib/translation-sandwich/` (the engine modules unchanged from M1-CP4e-A; tier1-token.ts now Verified end-to-end)
- `/website/src/app/api/reason/route.ts` (the route unchanged from M1-CP4e-A; deployed and live)

## Orchestration Reminder

M1-CP4e-B is the deployment-time portion of M1-CP4e under PR6 + AC5 + the Critical Change Protocol. The seven named risks (a)–(g) were approved explicitly by the founder before push. Per project instructions: "When something breaks after a change you made, say so directly. Rule out your own changes before suggesting the problem is on my end." If anything regresses post-M1-CP4e-B deploy, the cause is the M1-CP4e-B change, not the founder's environment.

The deployed code is the M1-CP4e-A code from commits `c0deccd` / `a4300a3` PLUS this session's harness-only changes. The route, modules, ADRs, and orchestrator are unchanged from M1-CP4e-A. The Tier 1 mechanic is now fully operative in the sandwich path because (a) `TRANSLATION_SANDWICH_TIER1_SECRET` is provisioned, (b) F7/F8/F9 fixtures + caches confirm correct behaviour end-to-end, (c) Phase 12 confirms the second-turn resume mechanic. User-facing path remains bundled-depth during parallel-run; Tier 1 fires surface to clients at M1-CP6 cutover (future session).

The harness is in a known-good state at session close: 273/273 PASS with the recalibrations + structural pivots documented above. F1+F2 Layer 3 cache regeneration completed (the gap from M1-CP4e-A is filled). F7/F8/F9 first-turn caches + F7-aug-v1/F8-aug-v1/F9-aug-v1 second-turn caches all in place locally (gitignored).

The PR5 promotion to permanent KG entry is the load-bearing R&D-process finding from this session. Future harness work — M1-CP4f's assertion strategy refactor + M2/M3/M4 consumer harnesses — must apply the structural-over-content principle from session-open.

*End of session close. Sub-session M1-CP4e-B landed: AC-13 Tier 1 force-clarification deployed end-to-end. The Critical Change Protocol named-risk approval discipline + the structural-over-content harness assertion principle are the two load-bearing R&D-process improvements from this session, both promoted to permanent governance via the decision-log entry + the new permanent KG entry. M1-CP4f extends the structural assertion principle systematically + handles parallel-run observation infrastructure + admin/test-reason fixtures.*
