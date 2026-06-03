# Session Close — 2026-06-03 — A11b Prompt-Injection Defence (Layer 3 seam; wired inert) — A11b COMPLETE across both seams

**Stream:** founder.
**Governing frame:** `/adopted/standing-protocol-cache.md` + `/adopted/build-sessions-protocol-cache.md` ("no current users" holds).
**Tier:** `code-critical` — **Critical** under 0d-ii. PR6 ENGAGED. AC7 NOT engaged. Full Critical Change Protocol completed visibly before any founder-performed step.
**Date:** 2026-06-03. **Branch:** `main`.
**Predecessor close:** `/operations/handoffs/founder/2026-06-03-A11b-layer1-injection-defence-close.md`.

## What this session did

Hardened the **second and last LLM seam** of the translation-sandwich — Layer 3 (prose generation) — against prompt injection, and wired it into `generateProse` **inert behind the existing UNSET flag** `SUBSTRATE_INJECTION_DEFENCE_ENABLED`. This **completes A11b across both LLM seams**.

(1) Factored the Layer 3 user-message construction into a pure exported `buildLayer3UserMessage` (PR2). When the flag is ON it: feeds a **neutralised COPY** of the assessment to the prose prompt (`neutraliseFreeText` — R7 keeps the stored/signed assessment verbatim); **fences** the assessment block in `SAGE_UNTRUSTED_INPUT` markers; **prepends the `GUARD_INSTRUCTION`** as a cached system block; **routes consumer-supplied context (Vector 2) through the same fence**; and records **neutralise-and-flag** findings. It reuses the deterministic, no-LLM `injection-defence.ts` module built in the Layer-1 session. (2) Wired `generateProse` through it — the OFF branch reproduces the legacy user message + emits no guard block, **byte-identical** to pre-A11b. (3) Wrote a **28-assertion** adversarial suite incl. the **Layer-3 safety invariant**. All code landed **inert**; nothing deployed; **production byte-identical.**

## Decisions Made
- `D-A11B-LAYER3-INJECTION-DEFENCE-WIRED-INERT-2026-06-03` (Critical) appended. Founder design-lock at open: full **fence + guard + escape + flag**; **consumer-context (Vector 2) handled this session**. Full CCP + R20a-perimeter (AC5 — no change) + safety-invariant verification recorded.

## Status Changes
| Item | Old | New |
|---|---|---|
| `buildLayer3UserMessage` (new pure fn, PR2) | Not started | **Wired + Verified-in-sandbox** (28/28) |
| Layer 3 `generateProse` defence | Not started | **Wired (behind unset flag) + Verified-in-sandbox**; byte-identical when off |
| A11b Layer-3 seam | Scoped | **Wired inert; Verified-in-sandbox** |
| **A11b (overall)** | Layer-1 wired inert; Layer-3 scoped | **Verified across BOTH LLM seams (in-sandbox); pending one combined flag-ON TEST probe for Verified-live** |

## Verification Method Used (0c Framework)
- **In-sandbox (this session):**
  - `npx tsx src/lib/translation-sandwich/__tests__/layer3-injection-defence.test.ts` → **28/28**
  - `npx tsx src/lib/translation-sandwich/__tests__/injection-defence.test.ts` (Layer-1 regression) → **57/57**
  - `npx tsc --noEmit` → **exit 0** (clean)
  - PR2 call-path grep → `buildLayer3UserMessage` / `isInjectionDefenceEnabled()` invoked **inside** `generateProse` (lines ~772–795), not just defined; no `src/app/api` route imports the defence directly (wired only via `/api/reason` → `parallel-run` → `generateProse`).
- **Pending (founder-elected live run):** the combined flag-ON TEST adversarial probe over both seams — deferred this session (commit-inert), consistent with the A10 / Layer-1 verification boundary. Walked live (PR17) whenever elected.

## Risk Classification Record (0d-ii)
- `buildLayer3UserMessage` (new pure fn) + the `generateProse` wiring behind unset flag — **Critical** (PR6; safety-adjacent seam). Byte-identical while the flag is off.
- `ProseInput.consumer_context` (new optional field) — Standard in isolation; folded into the Critical session.
- `layer3-injection-defence.test.ts`, decision-log, this close — Standard (governance/docs).

## PR5 — Knowledge-Gap Carry-Forward
- No concept required re-explanation this session. The **Jest-runner gap** (two layer2 tests use `describe()` and can't run under plain `tsx`) was not exercised this session (the new + regression suites are plain-assertion). Cumulative count for that register observation: still 1 (unchanged; not re-encountered).

## Next Session Should
**Your election** — two natural next moves:
- **Combined flag-ON TEST adversarial probe over BOTH seams** (the live verification that moves A11b from Verified-in-sandbox to **Verified-live**) — stand up the TEST override, set `SUBSTRATE_INJECTION_DEFENCE_ENABLED=true` in `.env.development.local` **only**, run benign-input prose flag-on vs flag-off + a set of adversarial inputs through `/api/reason`, then remove the flag. I walk it live, click-by-click (PR17). **Pre-conditions:** TEST project active; this session's files committed + pushed; Vercel green.
- **A12 — OpenTelemetry GenAI instrumentation** (Elevated; ~1–2 sessions) — folds in agentic-commerce finding F4 (AC10/AP2 alignment) at session-open per the findings tracker. **Pre-conditions:** A10 wired (met).

Also available behind A11b: **A15a** (R17c genuine deletion endpoint, Critical), **A19** (abuse-detection + rate-limiting, Elevated). Recommendation: the **combined flag-ON TEST probe** next (it closes out A11b to Verified-live across both seams in one run), then A12.

## Blocked On
**Files remaining uncommitted (commit commands below):**
- `website/src/lib/translation-sandwich/layer3-prose.ts`
- `website/src/lib/translation-sandwich/__tests__/layer3-injection-defence.test.ts`
- `operations/decision-log.md`
- `operations/handoffs/founder/2026-06-03-A11b-layer3-injection-defence-close.md`

**Production state at session close:** **UNCHANGED / byte-identical.** No flag flipped, nothing deployed with the defence active. `SUBSTRATE_INJECTION_DEFENCE_ENABLED` UNSET; all four R20a flags `true`; `SUBSTRATE_LAYER3_ENABLED` UNSET (503); `PLUGIN_INSTALL_AUTH_ENABLED` UNSET; `/api/reason` byte-identical. AC7 not engaged.

## Open Questions
- Combined flag-ON TEST adversarial probe (both seams) — the live verification left to reach Verified-live.
- Flag activation in production (`SUBSTRATE_INJECTION_DEFENCE_ENABLED=true`) — its own future Critical step (TEST probe + CCP). Do not bundle.

## Founder Verification (Between Sessions)
Re-run the in-sandbox checks on your machine (optional — run **one at a time**, not as a pasted block):
```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/website"
npx tsx src/lib/translation-sandwich/__tests__/layer3-injection-defence.test.ts   # expect: 28 passed, 0 failed
```
```
npx tsx src/lib/translation-sandwich/__tests__/injection-defence.test.ts           # expect: 57 passed, 0 failed
```
```
npx tsc --noEmit                                                                    # expect: no output, exit 0
```
Then commit + push (no Vercel behaviour change — the defence is gated by an unset flag):
```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
git add "website/src/lib/translation-sandwich/layer3-prose.ts" \
        "website/src/lib/translation-sandwich/__tests__/layer3-injection-defence.test.ts" \
        operations/decision-log.md \
        "operations/handoffs/founder/2026-06-03-A11b-layer3-injection-defence-close.md"
git commit -m "A11b: Layer 3 prompt-injection defence wired into generateProse behind UNSET flag (SUBSTRATE_INJECTION_DEFENCE_ENABLED) via new pure buildLayer3UserMessage (fence+guard+escape+flag; consumer-context routing) + 28 adversarial tests incl. Layer-3 safety invariant. Inert; production byte-identical. Completes A11b across both LLM seams. (D-A11B-LAYER3-INJECTION-DEFENCE-WIRED-INERT-2026-06-03)"
```
Then push via GitHub Desktop. Vercel rebuilds; behaviour is byte-identical (the defence is gated by an unset flag).

**Independent verification after push:** Vercel deploy goes green; `/api/reason` behaves exactly as before (the new flag is unset).

## Orchestration Reminder
A11b is now built and inert across **both** LLM seams (Layer 1 + Layer 3). The remaining verification to reach **Verified-live** is the **combined flag-ON TEST adversarial probe** — I walk it live (PR17) whenever you elect. Production activation of the flag is a separate, later step (its own CCP) — do not bundle it with anything. The parallel legal/insurance (FPE) track and lawyer engagement remain worth starting whenever you choose — they gate the eventual marketplace launch on wall-clock, not build pace.

## Cross-references
- Decision log: `D-A11B-LAYER3-INJECTION-DEFENCE-WIRED-INERT-2026-06-03`
- Predecessor close: `/operations/handoffs/founder/2026-06-03-A11b-layer1-injection-defence-close.md`
- This session's source prompt: `/operations/handoffs/founder/2026-06-03-A11b-layer3-seam-NEXT-SESSION-PROMPT.md`
- Staging plan: `/adopted/substrate-plugin-staging-plan.md` §A11b + Stage-1 dependency + Risk 9
- Safety-invariant basis: `D-A7-R20A-GATE-SCAFFOLDED-VERIFIED-2026-05-13` (distress-gate reuse); A5.4 in `website/src/lib/substrate/layer3-service.ts`

*End of session close. Stabilised to a known-good state — production byte-identical to session open; the Layer-3 injection defence is wired but gated by an unset flag; 28/28 Layer-3 adversarial tests incl. the safety invariant pass; 57/57 Layer-1 regression; tsc clean. A11b is complete across both LLM seams (Verified-in-sandbox), one combined founder-elected TEST adversarial probe away from Verified-live.*
