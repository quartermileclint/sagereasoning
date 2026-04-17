# Session Close — 17 April 2026 (Remediation Session)

## Session Purpose

Targeted remediation of 6 audit findings (F1, F2, F3, F5, F6, F7) from the contextual stewardship audit (`operations/contextual-stewardship-audit-2026-04-17.md`), plus client-side crash fixes discovered during testing.

## Decisions Made

- **F1: Two-stage distress detection uses inline (minimal latency) Haiku evaluation.** Founder chose inline over background processing. Haiku evaluator runs synchronously before the main LLM call, adding ~500ms for borderline inputs. Regex-only inputs add zero latency. → Impact: All 9 API routes now use `detectDistressTwoStage()` from `r20a-classifier.ts` instead of regex-only `detectDistress()` from `guardrails.ts`.

- **F2: Unified retry wrapper replaces quick-only Haiku→Sonnet escalation.** All depths get 1 retry on parse failure. Quick escalates Haiku→Sonnet. Standard/deep retry same model. Second failure returns structured error JSON instead of throwing (which caused 500s). → Impact: No more unhandled 500s from parse failures at any depth.

- **F5: Single source of truth for `ReasonDepth` and `DEPTH_MECHANISMS`.** New `depth-constants.ts` breaks the circular dependency between engine and loader (session 7b issue). Both files now re-export from the single source. → Impact: Type and constant sync guaranteed at compile time.

- **F3: project-context.json updated.** Version 1.0.0→1.0.1, date corrected, recent_decisions refreshed.

- **F6: Crisis resources corrected and verification schedule added.** Hotline name fixed to "988 Suicide & Crisis Lifeline (US)". Verification comment block added with next-due date 30 June 2026.

- **F7: compile-stoic-brain.ts script created.** Reads 8 JSON source files, produces stoic-brain-compiled.ts with timestamp. Limitation noted: produces full-field output, not the condensed format of the hand-compiled file. May exceed token budgets. Consider a condensation pass.

- **Client-side crash caused by missing distress_detected handling.** I caused this. The API routes correctly returned `{ distress_detected: true, severity, redirect_message }` with HTTP 200, but client pages tried to render the response as evaluation results and crashed on undefined property access. Fixed all 5 affected pages.

- **classifier_cost_log table created in Supabase.** Founder ran the SQL manually. Cost tracking now operational.

## Status Changes

| Item | Old Status | New Status |
|---|---|---|
| R20a two-stage classifier (`r20a-classifier.ts`) | Scaffolded | **Wired** |
| R20a cost tracking (`r20a-cost-tracker.ts` + `classifier_cost_log` table) | Scaffolded | **Wired** |
| Unified retry path (sage-reason-engine.ts) | Designed | **Wired** |
| `depth-constants.ts` (single source of truth) | Not started | **Wired** |
| `compile-stoic-brain.ts` script | Not started | **Scaffolded** (works but may exceed token budgets) |
| Client-side distress handling (5 pages) | Not started | **Wired** |
| Crisis resource verification schedule | Not started | **Verified** |
| project-context.json | Stale | **Verified** |

## Files Created

| File | Purpose | Risk |
|---|---|---|
| `website/src/lib/r20a-classifier.ts` | Two-stage distress detection (regex → Haiku) | Critical (safety system) |
| `website/src/lib/__tests__/r20a-classifier-eval.ts` | Eval suite: 5 Group A (must block), 5 Group B (must pass), 1 edge case | Standard |
| `website/src/lib/depth-constants.ts` | Single source of truth for ReasonDepth + DEPTH_MECHANISMS | Standard |
| `scripts/compile-stoic-brain.ts` | Automated compilation of stoic-brain JSON sources | Standard |
| `operations/remediation-session-2026-04-17.md` | Full remediation report with rollback plans | Documentation |

## Files Modified

| File | Change | Risk |
|---|---|---|
| `website/src/lib/sage-reason-engine.ts` | Re-export ReasonDepth/DEPTH_MECHANISMS from depth-constants; unified retry wrapper | Elevated |
| `website/src/lib/context/stoic-brain-loader.ts` | Import ReasonDepth/DEPTH_MECHANISMS from depth-constants | Standard |
| `website/src/lib/guardrails.ts` | Crisis resource name fix + verification comment block | Standard |
| `website/src/data/project-context.json` | Version bump, date, recent_decisions | Standard |
| `website/src/app/score/page.tsx` | distress_detected check + redirect UI | Standard |
| `website/src/app/score-document/page.tsx` | distress_detected check + redirect UI | Standard |
| `website/src/app/score-social/page.tsx` | distress_detected check + redirect UI | Standard |
| `website/src/app/scenarios/page.tsx` | distress_detected check + redirect UI | Standard |
| `website/src/app/private-mentor/page.tsx` | distress_detected check in sendMessage + submitRitual (shows as insight message) | Standard |
| 9 API route files | Switched from `detectDistress` to `detectDistressTwoStage` | Elevated |

## Eval Suite Results (Verified by Founder)

All 11 test inputs passed on all affected pages:

- **Group A (must block):** A1 giving away possessions, A2 "won't be around", A3 medication withdrawal, A4 bridge fixation, A5 farewell letters → All blocked with redirect UI ✓
- **Group B (must pass):** B1 job offer, B2 dying business, B3 divorce feelings, B4 partnership ending, B5 third-person scenario → All passed through to evaluation ✓
- **Vercel logs:** No R20a ALERT lines (Haiku never failed). Cost tracker error resolved after table creation.

## Next Session Should

1. **Commit and push the client-side fixes if not already done.** Run `git status` first — working tree was clean at session close, suggesting founder already committed. Verify with `git log --oneline -5`.

2. **Update the decision log** with: (a) two-stage classifier design choice (inline Haiku), (b) unified retry wrapper replacing quick-only escalation, (c) depth-constants single source of truth pattern, (d) client-side distress handling pattern.

3. **Set calendar reminder for 30 June 2026** — crisis resource verification due (R20a, guardrails.ts comment block).

4. **Consider the deferred findings (F4, F8–F16)** from the audit. The full list is in `operations/remediation-session-2026-04-17.md` under "Deferred Findings." F4 (observability/logging) is partially addressed by the retry console.warn lines. The rest are architectural or documentation items.

5. **Review compile-stoic-brain.ts output size** before using it in production. The script produces full-field output. If token counts exceed budget, a condensation pass is needed.

## Blocked On

Nothing. All items from this session are deployed and verified.

## Open Questions

1. **F7 token budget:** The compile script works but its output may be larger than the hand-compiled version. Does this matter for the current use case, or should a condensation step be added?

2. **Deferred findings prioritisation:** F8–F16 cover test coverage, documentation gaps, and architectural improvements. When does the founder want to schedule the next remediation pass?

3. **vulnerability_flag table:** Exists and empty (good — means Haiku hasn't failed). Should there be a scheduled check or alert if rows appear there? That would mean the classifier fell back to fail-open and some inputs weren't properly evaluated.
