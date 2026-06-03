# Session Close — 2026-06-03 — A11b Combined Flag-ON TEST Adversarial Probe — A11b VERIFIED-LIVE (both seams)

**Stream:** founder.
**Governing frame:** `/adopted/standing-protocol-cache.md` + `/adopted/build-sessions-protocol-cache.md` ("no current users" holds).
**Tier:** `code-critical` — **Critical** under 0d-ii. PR6 ENGAGED. AC7 not engaged. Full Critical Change Protocol completed visibly before the flag was set; every founder-performed step walked live (PR17).
**Date:** 2026-06-03. **Branch:** `main`.
**Predecessor close:** `/operations/handoffs/founder/2026-06-03-A11b-layer3-injection-defence-close.md`.

## What this session did

Ran the combined flag-ON TEST adversarial probe over **both** A11b LLM seams (Layer 1 `extractFeatures` + Layer 3 `generateProse`) against a local `npm run dev` pointed at the TEST Supabase project, authenticated with a throwaway TEST-user Supabase JWT. A six-input matrix (benign + four adversarial + one distress, plus a fifth adversarial narrative case added live to exercise the Layer-3 neutralise path) was run flag-OFF (baseline) then flag-ON and compared. All pass criteria met; the flag was removed at teardown and flag-OFF behaviour confirmed restored. Production was never touched. This moves **A11b from Verified-in-sandbox to Verified-live across both seams**.

## Decisions Made
- `D-A11B-COMBINED-FLAG-ON-TEST-PROBE-VERIFIED-LIVE-2026-06-03` (Critical) appended. Full CCP + live R20a safety-invariant verification + the probe matrix recorded. Auth-path election (JWT over API-key, to avoid the Option D billing confound) recorded.

## Status Changes
| Item | Old | New |
|---|---|---|
| A11b Layer-1 seam | Wired inert; Verified-in-sandbox | **Verified-live** |
| A11b Layer-3 seam | Wired inert; Verified-in-sandbox | **Verified-live** |
| A11b (overall) | Verified-in-sandbox (both seams) | **Verified-live (both LLM seams)** |

## Verification Method Used (0c Framework)
- **API endpoint** (per the 0c table): the AI supplied the exact `/api/reason` request bodies + expected outputs; the founder ran them flag-OFF then flag-ON and pasted the results. Both seams' behaviour observed directly, live:
  - **Layer 1 reject** (A1, A4) → minimal fallback (`fallback: true`, `layer1_throw`) + fail-closed log lines (`layer1-extractor: prompt-injection defence rejected input (fail-closed…)`; patterns named).
  - **Layer 1 fence-and-continue** (A2, A3) → on-task assessments; injection not steering the output.
  - **Layer 3 neutralise** (A5 narrative case) → `layer3-prose: …neutralised untrusted spans (consumer=api_reason…) free-text findings: 2`, output still on-task.
  - **Benign equivalence** — flag-ON output substantively equivalent to flag-OFF; no defence log.
  - **R20a distress redirect identical** flag-ON vs flag-OFF (the PR6 safety invariant, confirmed live).
- **Teardown verified:** flag removed from `.env.development.local`; `A1-after` returned a normal `200` assessment (not a fallback); no defence log lines. Production `.env.local` confirmed never to have carried the flag.

## Risk Classification Record (0d-ii)
- The probe (setting + unsetting a TEST-only env flag and making live calls): **Critical** session under PR6 (safety-adjacent seams), executed under the full Critical Change Protocol. **No repo code/config/schema change.** Production untouched.
- Decision-log entry + this close: **Standard** (governance/docs).

## PR5 — Knowledge-Gap Carry-Forward
- No concept required re-explanation this session. The environment nuance (which `.env` file governs `npm run dev`; TEST vs production project refs) is an established pattern from `D-A10-SMOKE-TEST-VERIFIED-LIVE-2026-06-03`, not a new gap. One new one-time observation: the API-key path is **fail-closed on `recordLoopBilling`** (Option D), so it would 500 on a TEST DB lacking the billing schema — avoided by electing the JWT path. Cumulative count for that observation: 1 (not yet a register entry).

## Next Session Should
**Your election** — A11b is closed; the queue behind it:
- **A12 — OpenTelemetry GenAI instrumentation + call-grain audit** (Elevated; ~1–2 sessions) — **recommended next**; folds in agentic-commerce finding F4 (AC10/AP2 alignment) at session-open per the findings tracker. Pre-condition A10 wired (met).
- **A15a — R17c genuine deletion endpoint** (Critical; ~1 session) — replaces the 503 placeholder; depends on A10 identity discrimination.
- **A19 — abuse-detection + rate-limiting** (Elevated; ~1 session) — depends on A10.

Separately available (not a build session): **production activation of `SUBSTRATE_INJECTION_DEFENCE_ENABLED`** — its own future Critical step with its own CCP + a production-parity probe; the sequence relative to K-category migration is an open question (PR7). **Do not bundle.**

## Blocked On
**Files remaining uncommitted (commit commands below):**
- `operations/decision-log.md`
- `operations/handoffs/founder/2026-06-03-A11b-combined-flag-on-test-probe-close.md`

(Code unchanged this session. `website/tsconfig.tsbuildinfo` shows as modified — a harmless TypeScript build cache; optional to `git restore`.)

**Production state at session close:** **UNCHANGED / byte-identical.** `SUBSTRATE_INJECTION_DEFENCE_ENABLED` UNSET (production); all four R20a flags `true`; `SUBSTRATE_LAYER3_ENABLED` UNSET (503); `PLUGIN_INSTALL_AUTH_ENABLED` UNSET; `/api/reason` byte-identical. AC7 not engaged.

## Open Questions
- **Production activation** of the injection-defence flag — its own future Critical step; activate before or after the K-category migration broadens substrate exposure? (PR7-deferred.)
- **Staging-plan A11b status cell** — recommend updating the staging plan's A11b row to Verified; deferred pending your approval (governing-doc edit).
- **Throwaway TEST user** (`a11b-probe@example.com`) — delete at convenience (TEST-only; as you did after the A10 test).

## Founder Verification (Between Sessions)
The live verification is already complete (you ran it this session). To persist the record, commit + push the two docs — **no Vercel behaviour change (docs only):**
```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
git add operations/decision-log.md \
        "operations/handoffs/founder/2026-06-03-A11b-combined-flag-on-test-probe-close.md"
git commit -m "A11b Verified-live (both seams): combined flag-ON TEST adversarial probe passed — Layer-1 reject + Layer-3 neutralise observed live, benign undegraded, R20a distress invariant preserved flag-ON; flag removed, production byte-identical. (D-A11B-COMBINED-FLAG-ON-TEST-PROBE-VERIFIED-LIVE-2026-06-03)"
```
Then push via GitHub Desktop.

**Independent verification after push:** Vercel deploy goes green; `/api/reason` behaves exactly as before (the injection-defence flag is unset in production).

## Orchestration Reminder
A11b is **Verified-live across both LLM seams** — built, tested in-sandbox, and now confirmed live on a running server. The injection-defence flag remains UNSET in production; turning it on in production is a separate future Critical step (its own CCP). The next build item is your election (A12 recommended; A15a/A19 also available). The parallel legal/insurance (FPE) track and lawyer engagement remain worth starting on wall-clock whenever you choose — they gate the eventual marketplace launch on wall-clock, not build pace.

## Cross-references
- Decision log: `D-A11B-COMBINED-FLAG-ON-TEST-PROBE-VERIFIED-LIVE-2026-06-03`
- Predecessor close: `/operations/handoffs/founder/2026-06-03-A11b-layer3-injection-defence-close.md`
- Auth + TEST-env pattern mirrored: `D-A10-SMOKE-TEST-VERIFIED-LIVE-2026-06-03`
- Staging plan: `/adopted/substrate-plugin-staging-plan.md` §A11b + Stage-1 dependency + Risk 9
- Safety-invariant basis: `D-A7-R20A-GATE-SCAFFOLDED-VERIFIED-2026-05-13`; A5.4 in `website/src/lib/substrate/layer3-service.ts`

*End of session close. Stabilised to known-good — production byte-identical to session open; the injection-defence flag is UNSET everywhere (TEST override removed; production never touched); A11b is Verified-live across both LLM seams.*
