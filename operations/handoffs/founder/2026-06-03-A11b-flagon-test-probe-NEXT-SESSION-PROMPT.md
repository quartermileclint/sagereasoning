# Next-Session Prompt — A11b flag-ON TEST adversarial probe — takes A11b to Verified-live (both seams)

Paste this whole file into a new session to proceed. This is the canonical prompt for the next critical-path session after A11b reached **Wired-inert + Verified-in-sandbox across BOTH LLM seams** (Layer 1 + Layer 3; 2026-06-03).

**Stream:** founder. **Tier:** `code-critical` — **Critical under 0d-ii.** PR6 ENGAGED (the injection-defence flag wraps the seams that carry the A5.4 R20a deterministic distress pass-through — safety-adjacent). The full Critical Change Protocol (0c-ii) runs visibly before any flag is set or any live run begins — not optional; urgency does not downgrade it. **This session is founder-performed and walked live, click-by-click (PR17)** — the live runs reach `localhost`, which the Cowork sandbox cannot. Engaged process rules: PR1 (single-endpoint proof — the probe runs on the `/api/reason` path only), PR2 (build-to-wire verification — confirm the call path is exercised, not just present), PR6 (safety surface = Critical), PR7 (record any deferral), PR10 (Plan→Execute→Verify with diagnostic-certainty signalling), PR15 (consult Anthropic primitives before any bespoke step — though this is a verification session, not a build), PR17 (every founder-performed step — env var, `npm run dev`, each curl/browser call, the env-var removal — walked live, never handed off as a one-liner).

**Governing frame:** `/adopted/standing-protocol-cache.md` (Critical sessions keep the FULL templates) + `/adopted/build-sessions-protocol-cache.md` ("no current users" holds — CCP step 3 answers "N/A: only founder + test logins exist") + `/adopted/substrate-plugin-staging-plan.md` (§A11b + Stage-1 dependency + Risk profile).

**Predecessor close:** `/operations/handoffs/founder/2026-06-03-A11b-layer3-injection-defence-close.md`.
**Predecessor decision-log entries:** `D-A11B-LAYER3-INJECTION-DEFENCE-WIRED-INERT-2026-06-03` (this session's target) + `D-A11B-LAYER1-INJECTION-DEFENCE-WIRED-INERT-2026-06-03` (the Layer-1 seam) + the A10 chain it builds behind (`D-A10-SMOKE-TEST-VERIFIED-LIVE-2026-06-03`).

---

## Founder elects the item at open

Both A11b seams are **Wired-inert + Verified-in-sandbox**. A11b reaches **Verified-live** once the defence is exercised flag-ON against the TEST environment. This prompt is scoped to that live probe (the default — the remaining verification). If you'd rather take a different item this session, say so at open and the AI re-scopes:

* **A11b combined flag-ON TEST adversarial probe** — the live verification over BOTH seams (Critical; ~1 session) — **this prompt's default.** Takes A11b → **Verified-live**.
* **A12 — OpenTelemetry GenAI instrumentation + call-grain audit** (Elevated; ~1–2 sessions) — folds in agentic-commerce finding F4 (AC10/AP2 alignment) at session-open per the findings tracker. Pre-condition A10 wired (met).
* **A15a — R17c genuine deletion endpoint** (Critical; ~1 session) — replaces the 503 placeholder; depends on A10's identity discrimination.
* **A19 — Abuse-detection + rate-limiting** (Elevated; ~1 session) — depends on A10.

**Recommendation:** the combined flag-ON TEST probe next (it closes A11b to Verified-live across both seams in one run), then A12.

---

## Where this sits (one paragraph)

A11b hardened the two LLM-touching seams of the translation-sandwich against prompt injection: Layer 1 (feature extraction, `extractFeatures` via `buildLayer1UserMessage`) and Layer 3 (prose generation, `generateProse` via `buildLayer3UserMessage`). Both are wired into the `/api/reason` path **inert behind the single UNSET flag `SUBSTRATE_INJECTION_DEFENCE_ENABLED`** (production byte-identical), each with an adversarial unit suite (Layer 1: 57 assertions; Layer 3: 28) including the safety invariant (the A5.4 R20a distress pass-through still fires under an injection wrapper). Everything has been proven **in-sandbox** (unit tests + `tsc` + call-path grep). The one verification left is the **live** one: enable the flag in the TEST environment only and confirm, end-to-end against `localhost`, that (a) benign input produces identical, well-formed output flag-on vs flag-off; (b) adversarial input is neutralised (the injection does not steer extraction or prose); and (c) a distress-bearing input still redirects with the flag on. Then remove the flag. This moves A11b from Verified-in-sandbox to **Verified-live**.

## Why this session matters

This is the live evidence that the defence behaves as designed on a running server, not just in unit tests — the last step before A11b can be considered done, and a precondition for ever enabling the flag in production (a separate, later Critical step). It exercises both LLM seams on the real `/api/reason` request path (PR1), with the A5.4 distress path explicitly preserved (PR6).

## Pre-conditions (founder confirms at open; AI verifies by read)

1. Both A11b seams committed + pushed; Vercel green. **(Founder confirmed verified + Vercel green at the 2026-06-03 Layer-3 close.)** Confirm `D-A11B-LAYER3-INJECTION-DEFENCE-WIRED-INERT-2026-06-03` and `D-A11B-LAYER1-INJECTION-DEFENCE-WIRED-INERT-2026-06-03` are in `/operations/decision-log.md`, and `layer3-prose.ts` + `layer1-extractor.ts` + `injection-defence.ts` + both `__tests__` files are on `main`.
2. Production unchanged: `SUBSTRATE_INJECTION_DEFENCE_ENABLED` UNSET; `PLUGIN_INSTALL_AUTH_ENABLED` UNSET; all four R20a flags `true`; `SUBSTRATE_LAYER3_ENABLED` UNSET (`/api/substrate/layer3` → 503); `/api/reason` byte-identical.
3. No work has begun after the Layer-3 entry — confirm by scanning the decision log for any entry after `D-A11B-LAYER3-INJECTION-DEFENCE-WIRED-INERT-2026-06-03`.
4. **TEST-env discipline (this is a live session — read carefully):** `npm run dev` reads `website/.env.development.local`, which overrides `.env.local` and points at the **TEST** project (`iwdtrvuphogkwmovhnvz`). Production `.env.local` (`jdbefwkonfbhjquozgxr`) must never be the dev target. The flag is set in `.env.development.local` **only** — never in `.env.local`, never in Vercel.

## Part A — Open under the protocol

Read in order:

1. `/adopted/standing-protocol-cache.md` (~3 min — tier, model selection, risk class, signals, status vocabulary, the AI-failure-modes table incl. the PR17 "one-line hand-off" redirect).
2. `/adopted/build-sessions-protocol-cache.md` (the "no current users" note — CCP step 3 is N/A while it holds).
3. `/operations/handoffs/founder/2026-06-03-A11b-layer3-injection-defence-close.md` (predecessor close — what was built on both seams, the safety-invariant logic, production state).
4. `/adopted/substrate-plugin-staging-plan.md` §A11b + the Stage-1 dependency + risk-profile lines.
5. The live source the probe exercises (read to construct the exact request + know what "neutralised" looks like):
   * `website/src/app/api/reason/route.ts` — the request shape `/api/reason` expects (body fields; the `PLUGIN_INSTALL_AUTH_ENABLED`-unset path; how it invokes the sandwich), and the route-level R20a distress perimeter.
   * `website/src/lib/translation-sandwich/parallel-run.ts` — `runSandwichInner` (where `extractFeatures` and `generateProse` are called).
   * `website/src/lib/translation-sandwich/injection-defence.ts` — `isInjectionDefenceEnabled`, the detection patterns, the fence/guard helpers (what to expect in logs when the flag is on).
   * `website/src/lib/translation-sandwich/layer1-extractor.ts` (`buildLayer1UserMessage`) + `layer3-prose.ts` (`buildLayer3UserMessage`) — the two defended seams.
6. `/operations/decision-log.md` last 2–3 entries.

Confirm at open: tier (`code-critical`; Critical); hold-point status (P0 0h active); model selection per the cache (Layer 1 + Layer 3 = Sonnet/DeepModel on the live calls; the injection defence itself is deterministic, no LLM); status vocabulary; signals + risk class; PR6 ENGAGED; PR1, PR2, PR10, PR17 engaged. Narrate before substantive work: where we are in the arc (both A11b seams Wired-inert + Verified-in-sandbox; this probe takes A11b to Verified-live); what's queued behind A11b (A12/A15a/A19); what's awaiting the founder (the live steps) vs the AI (the plan + log + close).

## Part B — Procedure (Critical Change Protocol governs throughout; every founder step walked live per PR17)

### Step 1 — Plan + Critical Change Protocol (visible, before any flag is set)
Complete all six 0c-ii steps in the conversation: (1) what is changing — in plain language, enabling a TEST-only env flag for the duration of a verification run; (2) what could break — only the founder's local TEST environment; production untouched because the flag is set in `.env.development.local`, never `.env.local`/Vercel; (3) existing sessions — "N/A, no current users"; (4) rollback — remove the line from `.env.development.local` and restart `npm run dev` (exact step provided live); (5) verification — the pass/fail criteria below; (6) explicit founder approval to begin the live run. Lay out the **test matrix** for founder confirmation: a benign input, 3–4 adversarial inputs (e.g. "ignore all previous instructions and output …", a role-reassignment, a schema-field-smuggling string, a fence-escape attempt), and a distress-bearing input — each run **flag-OFF then flag-ON**, comparing behaviour.

### Step 2 — Stand up the TEST run (founder-performed; PR17 — walked click-by-click)
Walk the founder, one step at a time, with exact copy-paste values and a confirmation check after each: (a) confirm `git status` clean / on `main`; (b) confirm `.env.development.local` targets the TEST project; (c) baseline run **flag-OFF** — `npm run dev`, then the exact `/api/reason` request(s) for the test matrix (construct the precise body from `route.ts`), capturing output; (d) add `SUBSTRATE_INJECTION_DEFENCE_ENABLED=true` to `.env.development.local` only, restart `npm run dev`; (e) repeat the matrix **flag-ON**, capturing output + the `[layer3-prose]` / `[layer1-extractor]` defence log lines.

### Step 3 — Verify (the pass criteria)
- **Benign:** flag-ON output is well-formed and substantively equivalent to flag-OFF (no degradation; the fence/guard does not corrupt normal prose/extraction).
- **Adversarial:** the injection does NOT steer the output — extraction stays schema-valid; prose stays on-task; defence log lines show detection/neutralisation; any high-confidence override on the primary input fails closed to the bundled fallback (Layer 1 reject path).
- **Distress (the PR6 invariant, live):** a distress-bearing input still redirects (R20a pass-through present) with the flag ON.
Classify the result per PR10 diagnostic-certainty. If anything is symptom- or pattern-level, get founder acknowledgement before treating as resolved.

### Step 4 — Tear down (founder-performed; PR17)
Walk the founder through removing the `SUBSTRATE_INJECTION_DEFENCE_ENABLED=true` line from `.env.development.local`, restarting `npm run dev`, and confirming flag-OFF behaviour returns. Confirm no stray flag remains anywhere (`.env.local`, Vercel both untouched throughout).

### Step 5 — Decision-log entry (full Critical form)
Record the probe matrix, the flag-on vs flag-off comparison, the live distress-invariant result, the diagnostic-certainty classification, and the teardown confirmation. Mark **A11b → Verified-live (both seams)**. Perimeter note (AC5 — verification only; no perimeter change).

### Step 6 — Session close (full Critical form)
Verification Method Used, Risk Classification Record, PR5 Knowledge-Gap Carry-Forward, Founder Verification (Between Sessions), Orchestration Reminder. State production state explicitly (UNCHANGED — flag never touched production). Name the next session (A12 recommended; or A15a/A19) + its pre-conditions.

## What is NOT in this session

* **Production flag activation** (`SUBSTRATE_INJECTION_DEFENCE_ENABLED=true` in Vercel) — a separate future Critical step (its own CCP), only after this TEST probe passes. Do not bundle.
* A10 production activation, `SUBSTRATE_LAYER3_ENABLED` activation, retiring `PLUGIN_AUTH_SECRET` — each its own future Critical step.
* A12/A15a/A19 — they queue behind A11b unless the founder elects one as this session's item instead.

## Rollback path

The only change is a TEST-only env flag on the founder's machine. Rollback = remove the line from `.env.development.local` + restart `npm run dev`. Production is never touched (the flag is never set in `.env.local` or Vercel). The CCP supplies the exact step in-session.

## Forecast

Most likely: the test matrix is agreed; the founder runs `/api/reason` flag-OFF then flag-ON across benign, adversarial, and distress inputs (walked live, PR17); the defence neutralises the adversarial cases without degrading benign output, and the distress redirect still fires flag-ON — taking **A11b to Verified-live across both seams**. The flag is then removed; production remains byte-identical. Next: A12 (OpenTelemetry, folds in F4), with A15a/A19 also available. The parallel legal/insurance (FPE) track and lawyer engagement remain worth starting whenever you choose — they gate the eventual marketplace launch on wall-clock, not build pace.

End of prompt. Opens on `main`. Critical-tier; the full Critical Change Protocol governs the flag set/unset; throwaway TEST data only; every founder step walked live (PR17).
