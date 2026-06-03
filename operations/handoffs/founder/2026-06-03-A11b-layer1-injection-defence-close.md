# Session Close — 2026-06-03 — A11b Prompt-Injection Defence (Layer 1 seam; wired inert)

**Stream:** founder.
**Governing frame:** `/adopted/standing-protocol-cache.md` + `/adopted/build-sessions-protocol-cache.md` ("no current users" holds).
**Tier:** `code-critical` — **Critical** under 0d-ii. PR6 ENGAGED. AC7 NOT engaged. Full Critical Change Protocol completed visibly before any founder-performed step.
**Date:** 2026-06-03. **Branch:** `main`.
**Predecessor close:** `/operations/handoffs/founder/2026-06-03-A10-critical-implementation-close.md` (+ its same-day "TEST smoke test PASSED → A10 Verified-live" update).

## What this session did

Hardened the **first of the two LLM seams** of the translation-sandwich — Layer 1 (feature extraction) — against prompt injection, and wired it into `extractFeatures` **inert behind a new UNSET flag** `SUBSTRATE_INJECTION_DEFENCE_ENABLED`. (1) Built a deterministic, no-LLM, pure module `injection-defence.ts`. (2) Factored the Layer 1 user-message build into a pure exported `buildLayer1UserMessage` (PR2) and wired the defence through it behind the flag. (3) Wrote a 57-assertion adversarial suite including the **safety invariant**. (4) Documented the flag in `.env.example`. All code landed **inert**; nothing deployed; **production byte-identical.** Per PR1, Layer 1 is proven first; the Layer 3 prose seam is the next A11b session.

## Decisions Made
- `D-A11B-LAYER1-INJECTION-DEFENCE-WIRED-INERT-2026-06-03` (Critical) appended. Founder design-lock: (a) **neutralise-and-flag** (hard-reject only high-confidence overrides on the primary input); (b) **input-detection + free-text sanitisation** this session. Full CCP + R20a-perimeter (AC5 — no change) + safety-invariant verification recorded.

## Status Changes
| Item | Old | New |
|---|---|---|
| `injection-defence.ts` module | Not started | **Wired + Verified-in-sandbox** (57/57) |
| Layer 1 `extractFeatures` defence | Not started | **Wired (behind unset flag) + Verified-in-sandbox**; byte-identical when off |
| A11b Layer-1 seam (overall) | Scoped | **Wired inert; pending founder flag-ON TEST adversarial probe to reach Verified-live** |
| A11b Layer-3 seam | Scoped | Scoped (next session) |

## Verification Method Used (0c Framework)
- **In-sandbox (this session):** `npx tsx src/lib/translation-sandwich/__tests__/injection-defence.test.ts` → **57/57**; `npx tsc --noEmit` → **exit 0**; PR2 call-path grep → `buildLayer1UserMessage` / `isInjectionDefenceEnabled` / `scanFreeTextFields` invoked inside `extractFeatures` (not just imported); no `src/app/api` route imports `injection-defence` (NONE — wired only via the `/api/reason` → `extractFeatures` path). Sibling regression (plain tsx): `layer1-schema-additions` 50/50, `layer2-verifier` 18/18.
- **Pre-existing, NOT a regression:** `layer2-canonical-json` + `layer2-signer` are Jest-style (`describe is not defined` under `tsx`) — the carried-forward Jest-runner gap; git confirms only `layer1-extractor.ts` + the two new files changed. *I did not cause this.*
- **Pending (founder-elected live run):** the flag-ON adversarial probe in TEST — deferred this session (commit-inert), consistent with the A10 verification boundary.

## Risk Classification Record (0d-ii)
- `injection-defence.ts` (new pure module, not enabled) — Standard in isolation; folded into the Critical session (safety-adjacent seam).
- `layer1-extractor.ts` defence wiring behind unset flag — **Critical** (PR6; safety-adjacent). Byte-identical while the flag is off.
- `.env.example`, decision-log, this close — Standard (governance/docs).

## PR5 — Knowledge-Gap Carry-Forward
- No concept required re-explanation this session. One process observation (not a knowledge gap): the **Jest-runner gap** surfaced again (two layer2 tests use `describe()` and can't run under plain `tsx`). This is now recurring across sessions — if it recurs once more, consider either a one-line standing note ("layer2-canonical-json + layer2-signer are Jest-style; skip under plain tsx") or porting them to plain-assertion form. Cumulative count: 1 (this session, for this register entry).

## Next Session Should
**Your election** — two natural next moves:
- **A11b Layer 3 seam** (Critical; ~1 session) — harden `generateProse` consumer-context against injection-into-prose, and apply `neutraliseFreeText` (built + tested this session) at the Layer 3 input boundary. Completes A11b → Verified. **Pre-conditions:** this session's files committed + pushed; Vercel green.
- **A11b flag-ON TEST adversarial probe** (the live verification that moves the Layer-1 seam from Verified-in-sandbox to Verified-live) — stand up the TEST override, set `SUBSTRATE_INJECTION_DEFENCE_ENABLED=true` in `.env.development.local` only, run benign-input extraction flag-on vs flag-off + a set of adversarial inputs, then remove the flag. I will walk this live, click-by-click (PR17). **Pre-conditions:** TEST project active.

Recommendation: do the **Layer 3 seam** next so A11b reaches Verified across both seams, then run one combined flag-ON TEST adversarial probe over both. But the call is yours. (A12 OpenTelemetry instrumentation — Elevated, folds in agentic-commerce F4 — is also available.)

## Blocked On
**Files remaining uncommitted (commit commands below):**
- `website/src/lib/translation-sandwich/injection-defence.ts`
- `website/src/lib/translation-sandwich/layer1-extractor.ts`
- `website/src/lib/translation-sandwich/__tests__/injection-defence.test.ts`
- `website/.env.example`
- `operations/decision-log.md`
- `operations/handoffs/founder/2026-06-03-A11b-layer1-injection-defence-close.md`

**Production state at session close:** **UNCHANGED / byte-identical.** No flag flipped, nothing deployed with the defence active. `SUBSTRATE_INJECTION_DEFENCE_ENABLED` UNSET; all four R20a flags `true`; `SUBSTRATE_LAYER3_ENABLED` UNSET (503); `PLUGIN_INSTALL_AUTH_ENABLED` UNSET; `/api/reason` byte-identical. AC7 not engaged.

## Open Questions
- Layer 3 prose seam — the second A11b surface (deferred under PR1).
- Flag activation (`SUBSTRATE_INJECTION_DEFENCE_ENABLED=true`) — its own step (live TEST adversarial probe + CCP).
- A11a audits — not run this session (you elected A11b alone); available as a future filler.

## Founder Verification (Between Sessions)
You can re-run the in-sandbox checks on your machine (optional):
```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/website"
npx tsx src/lib/translation-sandwich/__tests__/injection-defence.test.ts     # expect: 57 passed, 0 failed
npx tsc --noEmit                                                             # expect: no output, exit 0
```
Then commit + push (no Vercel behaviour change — the defence is gated by an unset flag):
```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
git add "website/src/lib/translation-sandwich/injection-defence.ts" \
        "website/src/lib/translation-sandwich/layer1-extractor.ts" \
        "website/src/lib/translation-sandwich/__tests__/injection-defence.test.ts" \
        "website/.env.example" \
        operations/decision-log.md \
        "operations/handoffs/founder/2026-06-03-A11b-layer1-injection-defence-close.md"
git commit -m "A11b: Layer 1 prompt-injection defence wired into extractFeatures behind UNSET flag (SUBSTRATE_INJECTION_DEFENCE_ENABLED) + new injection-defence module + 57 adversarial tests incl. safety invariant. Inert; production byte-identical. (D-A11B-LAYER1-INJECTION-DEFENCE-WIRED-INERT-2026-06-03)"
```
Then push via GitHub Desktop. Vercel rebuilds; behaviour is byte-identical (the defence is gated by an unset flag).

**Independent verification after push:** Vercel deploy goes green; `/api/reason` behaves exactly as before (the new flag is unset).

## Orchestration Reminder
A11b's Layer-1 seam is built and inert. The remaining verification to reach Verified-live is the **flag-ON TEST adversarial probe** — I will walk it live (PR17) whenever you elect. The Layer 3 prose seam is the next build to complete A11b. Production activation of the flag is a separate, later step (its own CCP) — do not bundle it with anything. The parallel legal/insurance (FPE) track and lawyer engagement remain worth starting whenever you choose — they gate the eventual marketplace launch on wall-clock, not build pace.

## Cross-references
- Decision log: `D-A11B-LAYER1-INJECTION-DEFENCE-WIRED-INERT-2026-06-03`
- Predecessor close: `/operations/handoffs/founder/2026-06-03-A10-critical-implementation-close.md`
- Next-session prompt (this session's source): `/operations/handoffs/founder/2026-06-03-A11b-prompt-injection-defence-NEXT-SESSION-PROMPT.md`
- Staging plan: `/adopted/substrate-plugin-staging-plan.md` §A11b + Stage-1 dependency + Risk 9
- Safety-invariant basis: `D-A7-R20A-GATE-SCAFFOLDED-VERIFIED-2026-05-13` (distress-gate reuse)

*End of session close. Stabilised to a known-good state — production byte-identical to session open; the Layer-1 injection defence is wired but gated by an unset flag; 57/57 adversarial tests incl. the safety invariant pass; tsc clean. A11b's Layer-1 seam is one founder-elected TEST adversarial probe away from Verified-live, with the Layer 3 seam queued next.*
