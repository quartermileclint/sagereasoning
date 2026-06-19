# Session Close — 2026-06-19 — Mechanism-correction Part B: guardrail signed-sandwich port (#3b/#3c) + justice bridge **ACTIVATED in production**

**Stream:** founder.
**Governing frame:** `/adopted/standing-protocol-cache.md` + `/adopted/build-sessions-protocol-cache.md`.
**Tier:** **code-critical** — env-flag activation of a new verdict path on the Live `/api/guardrail` + an R10 public-contract change.
**Date:** 2026-06-19.
**Decision-log entry:** `D-MECHANISM-CORRECTION-PART-B-GUARDRAIL-PORT-PRODUCTION-ACTIVATION`.

## What this session did
Activated the #3b/#3c guardrail signed-sandwich port (ADR-009) + the ADR-010 §3 justice bridge in **production**: `SUBSTRATE_GUARDRAIL_SANDWICH_ENABLED=true` (founder-walked Vercel flip + redeploy). `/api/guardrail` now serves the **signed deterministic sandwich** verdict instead of the legacy `sage-guard` LLM. The mandatory battery was re-run green BEFORE the flip (the standing lesson); a prod smoke confirmed flag-live + sandwich-serving + U2 blocking; the R10 response-shape change was published to three surfaces. **A live-smoke finding** — the battery probed injustice only at `threshold:'principled'`, leaving the live default `'deliberate'` untested — was **closed in-session** by extending the battery (D1–D5) and re-running green.

## Decisions Made
- `D-MECHANISM-CORRECTION-PART-B-GUARDRAIL-PORT-PRODUCTION-ACTIVATION` appended. Port + bridge Live; coverage gap found + closed; R10 docs published; api-docs deferred.
- ADR-009 §Activation → **LIVE**. The activation-smoke finding + the battery extension recorded.

## Status Changes
| Item | Old | New |
|---|---|---|
| #3b/#3c guardrail port + ADR-010 §3 bridge | Wired + TEST-Verified (dark) | **Live in production** |
| `SUBSTRATE_GUARDRAIL_SANDWICH_ENABLED` | UNSET (legacy gate) | **true (sandwich gate)** |
| Verdict-equivalence battery | injustice @ principled only | **+ deliberate-threshold fixtures (D1–D5)** |
| ADR-010 §4 root correction | Scoped | Scoped (unchanged — next Critical session) |

## Verification Method Used
- **Pre-activation gate (Step 1):** `guardrail-verdict-equivalence-battery.ts` re-run green — 13 fixtures, 0 leaks, 0 repro failures, U2 blocks via `justice=violated`.
- **Live smoke (Step 3):** prod POST `/api/guardrail` (U2) → HTTP 200, `proceed:false`, `engine_attribution:"translation-sandwich"`, valid `signed_assessment` (`key_id:"substrate-layer2-2026Q2"`), `evaluation_depth:"deterministic"`, `cost_basis:"anthropic_usd_measured"` — the definitive flag-live proof (legacy can't produce this shape).
- **Extended battery (gap closure):** +D1–D5 `deliberate`-threshold injustices → re-run green — **18 fixtures, 0 drifts, 0 leaks, 0 repro failures**; D1–D5 block on all 15 reproducibility runs, the bridge firing (`justice=violated`) every time.
- `npx tsc --noEmit` → 0; `npm run build` → 0 (`/api/guardrail` registered); agent-card.json re-validated as JSON.

## The activation-smoke finding (resolved)
The prod smoke ran U2 at the default `risk_class:'standard'` and blocked via the **kathekon floor** on an *empty* extraction (not the bridge) — diverging from the battery's `reflexive/justice=violated`. Tracing it surfaced a **battery coverage gap**: `justiceCheckScope` excludes `marginal` kathekon and the floor catches only `is_kathekon===false`, so a calm injustice read as `marginal`/`is_kathekon===null` with no oikeiosis circle fires **neither** — and at the default `threshold:'deliberate'`, `proceed:true`. The "provably covers the full leak class" claim holds only for the `principled+` band. **No live leak demonstrated** (the sparse case blocked via the floor; D1–D5 block via the bridge 15/15). Founder elected keep-live + extend-and-re-run (0h-held ⇒ no external users ⇒ no exposure); the extended battery cleared. The narrow theoretical residual (marginal + no-circle at a permissive threshold) is the documented **ADR-010 §4** root fix. Memory: [[verdict-battery-test-the-default-threshold]].

## Risk Classification Record (0d-ii)
**Critical** — deployment-config change (env flag → new verdict path on the Live gate) + R10 contract change + a new **503 `substrate_signing_unavailable`** fail-CLOSED surface on a signing throw. Founder approved the named risks. AC7 not engaged. R20a perimeter, Layer-2 signing keys/algorithm, UPC auth path untouched.

## PR5 Knowledge-Gap Carry-Forward
- **KG1:** the new analytics insert is awaited; the justice second-call is awaited + metered; no module state. Clean.
- **KG2:** the resolver + extraction use Sonnet (DeepModel) — outside Haiku's boundary, per AC1.
- The `nextjs-route-export-validation` lesson held (ran `npm run build` after the route GET-self-doc edit). New lesson saved: [[verdict-battery-test-the-default-threshold]].

## Next Session Should
**Scope the ADR-010 §4 root correction** — its own Critical session on `/api/reason` determinism: per-domain proximity + the KP-04 minimum-domain rule in `computeProximity`, and obligation-resolution as a required oikeiosis field. It fixes the consult tool too (one fix, both consumers), removes the bridge's extraction-richness dependence (closing the deliberate-threshold residual durably), and restores full reproducibility of justice-floored verdicts — **retire the bridge when it lands.** Also carried: publish the deferred api-docs `/api/guardrail` section; Part C (docs + SDK); the guardrail-into-perimeter election; the deferred M5 doc surfaces; parked CI-16; **the 0h launch call** (the founder's).

## Blocked On
**Founder teardown (this session's artifact):** revoke the throwaway smoke key `sr_live_bc45d9a0…` (`revoke api --id <uuid>`); it metered 5 `/api/guardrail` calls today — exclude `analytics_events`/`loop_billing_events` from billing/trajectory samples.

**Files remaining uncommitted (founder commits by name):**
- `website/public/llms.txt`
- `website/public/.well-known/agent-card.json`
- `website/src/app/api/guardrail/route.ts`
- `website/scripts/guardrail-verdict-equivalence-battery.ts`
- `adopted/adr/2026-06-19-guardrail-signed-sandwich-port.md`
- `operations/decision-log.md`, `CLAUDE.md`
- this close
- `website/tsconfig.tsbuildinfo` (build artifact)

**Production state at session close:** `SUBSTRATE_GUARDRAIL_SANDWICH_ENABLED=true` in Vercel Production (founder-flipped, redeploy green) → `/api/guardrail` serves the signed deterministic sandwich + justice bridge. The always-on #3a `meta.ai_model` honesty fix is Live. No schema/cron/auth/perimeter change. Rollback = unset the flag + redeploy.

## Founder Verification (Between Sessions)
```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/website"
npx tsc --noEmit
npm run build
npx tsx --env-file=.env.development.local scripts/guardrail-verdict-equivalence-battery.ts
```
Expected: tsc/build exit 0; battery `VERDICT: ✅`, 18 fixtures, 0 leaks, 0 repro failures, D1–D5 block. Then commit by name + push via GitHub Desktop. **Vercel:** redeploy green; the gate already serves the sandwich (flag live).

## Orchestration Reminder
The flag flip, the key mint, and the key teardown are the **founder's 0c-ii** — the AI ran the battery + the smoke + the docs and performed no Vercel/Supabase/git op. The battery was re-run green BEFORE the flip ([[deterministic-l2-measures-apatheia-not-dikaiosyne]]).

## Cross-references
- `operations/handoffs/founder/2026-06-19-mechanism-correction-PartB-guardrail-port-ACTIVATION-NEXT-SESSION-PROMPT.md` (the prompt this session executed)
- `operations/handoffs/founder/2026-06-19-mechanism-correction-PartB-guardrail-justice-bridge-close.md` (predecessor — the bridge build)
- `adopted/adr/2026-06-19-guardrail-signed-sandwich-port.md` (ADR-009 §Activation → Live), `adopted/adr/2026-06-19-stoic-fidelity-dikaiosyne-weighting.md` (ADR-010 §3/§4)
- `D-MECHANISM-CORRECTION-PART-B-GUARDRAIL-PORT-PRODUCTION-ACTIVATION` (decision-log)

*End of session close. The gate now measures dikaiosyne at the default threshold too; the port is Live, signed, and reproducible-from-extraction except where justice floors it (disclosed); the §4 root correction is the durable fix.*
