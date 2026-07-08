# Session Close — 2026-07-08 — Corroboration Check LIVE-GATE ACTIVATION (LIVE on both surfaces)

**Stream:** founder.
**Governing frame:** /adopted/session-opening-protocol.md (cached via /adopted/standing-protocol-cache.md §"Critical-risk sessions"); Critical Change Protocol 0c-ii completed visibly in-session with explicit founder approval of the named risks.
**Tier:** `code-critical` — Critical risk under 0d-ii (production env-flag activation changing live verdict behaviour + the public response shape on two Live surfaces). **AC7 ENGAGED + DISCHARGED** — founder-performed flip, redeploy, smokes, and the throwaway-credential mint + revoke; the AI guided + verified and performed no Vercel/Supabase/git/mint op.
**Date:** 2026-07-08.

## Decisions Made
- `D-TRUST-LAYER-S0A-CORROBORATION-CHECK-LIVE-GATE-ACTIVATION` appended (full Critical form). **`SUBSTRATE_CORROBORATION_CHECK_ENABLED=true` is LIVE in Vercel Production** — the deterministic extraction-trust corroboration check now runs on every `/api/reason` assessment (incl. the `l1_supply` path — the Arm-B naive-lie class is caught live) and every `/api/guardrail` verdict; the `corroboration` report rides inside the signed assessment; overrides are monotone floor-only. **Production is intentionally NOT byte-equivalent — a deliberate, intended standing change.** The ADR-012 logos-enforce activation condition is discharged; **weights BLOCKED unchanged**.
- Founder elections at open: CCP six items approved against the named risks; **E1 document** the flag-on `corroboration` field (R18); **E2 same-session post-smoke** docs application; the throwaway smoke-credential mint approved as a disclosed deviation (revoked same-session, net-zero).

## Status Changes
| Item | Old | New |
|---|---|---|
| Corroboration check | Verified (dark, both frames) | **LIVE on `/api/reason` + `/api/guardrail`** (flag set 2026-07-08) |
| ADR-012 ladder: logos-enforce | Remaining gate = the Live-gate activation | **Activation condition DISCHARGED** (+ the standing A2 disclosure) |
| ADR-012 ladder: weights | BLOCKED | **BLOCKED (unchanged)** |
| `layer2-signer.test.ts` | 14 assertions (no corroboration case) | **18/0** — corroboration sign/verify/tamper regression folded |
| Public R18 surfaces | No corroboration field documented | Documented: llms.txt + `corroboration-check/v1` extension (**16 extensions**) + api-docs bullet (live on push) |
| Trust Layer plan | S0a discharged; activation carried | **Activation done — S0b (Trust Layer ADR) is next** |

## Verification Method Used
1. **Step 1 repo gates (AI-run):** `corroboration-check.test.ts` 106/0; `guardrail-sandwich.test.ts` 74/74; `layer2-signer.test.ts` 18/0 **including the new fold** (corroboration-bearing assessment: signs, verifies against the matching key, present in the canonical bytes, canonical round-trip stable, in-field tamper rejected); `tsc --noEmit` 0; `npm run build` 0 — re-run green again after the docs edits (page.tsx gate honoured).
2. **Step 2 MANDATORY both-flag-states battery (AI-run, repo-local, real Sonnet extractions):** flag-off — 18 fixtures, 0 drifts, 0 unsafe leaks, 0 reproducibility failures, ✅ (matches the standing record); flag-on (inline env var over `--env-file`, the established override direction; shell + env file verified clean of `SUBSTRATE_*` first) — 0/0/0 ✅. Per-fixture first-hand comparison: every proceed/block outcome identical across states; B1/B2/J1 proceed flag-on (J1 = the harm-vocabulary-dense lawful breach notification, `dikaiosyne=sage_like`); no over-block drift; the unsafe set floored natively 10/10 + 30/30 repro both states. Logs: scratchpad `battery-flag-off.log` / `battery-flag-on.log` (session-local evidence; summaries recorded in the results memo §8).
3. **Step 4 live smokes (founder-run):** (A) benign consult → `corroboration` present, `any_contradiction:false`, `deliberate` unfloored, **Ed25519 signature verified against the live `GET /api/public-key`** (helper script canonicalised with the repo's own canonicaliser); (B) C1 lying-met ×2 → `reflexive` both runs (honest-extractor native branch, pre-disclosed; contradicted path battery-proven 3/3); (C) U2 → `proceed:false`/`reflexive` + report inside `signed_assessment.assessment`; benign gate probe → `proceed:true` (no over-block live).
4. **Docs validation:** agent-card parses, 16 extensions, additive +14-line diff (a whole-file JSON reformat was caught and reverted in favour of surgical insertion); `npm run build` green after the api-docs edit.

## Risk Classification Record
Critical under 0d-ii (deployment-configuration env-flag activation; public response-shape change). AC7 engaged + discharged. PR6 engaged. PR17 honoured — every live step (flip, redeploy, smokes, mint, revoke) founder-performed and walked live, step by step, with expected results and confirmation checks. KG2/AC1: the battery's Layer-1 extractions ran on Sonnet (AC1 Layer-1 row); the check itself adds no LLM call.

## Incident / Findings (honest record)
- **Stale dogfood credential (found, not fixed — named follow-up):** the first smoke 401'd (`Plugin authentication failed`). Root cause, Diagnostic-certain: `settings.local.json` `SAGE_GATE1_CREDENTIAL` holds the **REVOKED leg-d v6** credential (`sr_prac_f0c5da…`, id `e2726b38…`, revoked at the 2026-07-07 hygiene session; swapped during the leg-d benchmark, never restored). The standing dogfood UPC `sr_prac_7e9b11…` (id `322b0eb7…`) is **active but its raw token is unrecoverable** (shown once at mint; no local copy — hooks-block backup + env files scanned prefix-only). **FOLLOW-UP: rotate the standing dogfood credential (its own founder-walked step) before any `/sage-on` re-enable** — until then the harness would run UNFRAMED (honest 401s). The server-side marker credential + accreditation row are unaffected.
- **Smoke credential (disclosed deviation, closed):** founder minted a throwaway `sr_live_` key (label `corro-activation-smoke`, 50/50 limits; id `30133f71-1dc5-4d13-b600-5f07b136c158`) for the smokes and revoked it same-session (founder-confirmed, reason "corro activation smoke teardown") — net-zero standing credential footprint. (`mint practice` exposes no limit flags — a fresh practice cred's 1/day default would have 401-masked the multi-call smoke; `mint api` used instead, per the Part-B precedent.)
- **C1 smoke branch:** both live probes floored `reflexive` via the native branch (extraction read `violated` directly; check rightly silent). Not a defect — the pre-disclosed stochastic branch; the contradicted path is battery-proven (3/3 on real extractions) + unit-locked. Recorded as-is; no re-probe loop beyond the prompt's single re-probe.

## PR5 Knowledge-Gap Carry-Forward
KG1 N/A (no DB writes authored); KG2 engaged (Sonnet extraction in the battery); KG7 N/A. Standing lessons honoured: `verdict-battery-test-the-default-threshold` (the battery's D-set runs at the live default), `mint-cli-env-file-export-leak` (fresh terminal for the CLI), `api-key-1-per-day-limit-masks-as-401` (raised limits on the smoke key), `human-routes-bearer-jwt-console-smoke` (admin JWT pulled from the logged-in session), route/page build gate (`npm run build` after page.tsx).

## Next Session Should
**S0b — the Trust Layer ADR** per the adopted plan (`operations/trust-layer-2026-07/trust-layer-build-plan.md` P0; governance session, documents only). The dogfood-credential rotation is a separate small founder-walked step, schedulable any time before a `/sage-on` re-enable.

## Blocked On
**Files remaining uncommitted (this session's commit set):**
- `website/src/lib/translation-sandwich/__tests__/layer2-signer.test.ts`
- `website/public/llms.txt`
- `website/public/.well-known/agent-card.json`
- `website/src/app/api-docs/page.tsx`
- `operations/benchmarks/sage-practice-v1/2026-07-08-corroboration-check-build-results.md` (§8 addendum)
- `operations/handoffs/founder/2026-07-08-corroboration-check-activation-NEXT-SESSION-PROMPT.md` (SPENT marker)
- `operations/handoffs/founder/2026-07-08-corroboration-check-activation-CLOSE.md` (NEW — this file)
- `operations/decision-log.md` (appended)
- `CLAUDE.md` (PR18 refresh)

**Production state at session close:** `SUBSTRATE_CORROBORATION_CHECK_ENABLED=true` in Vercel Production (set + redeployed by the founder this session) — the corroboration check is LIVE on `/api/reason` + `/api/guardrail`; **production intentionally NOT byte-equivalent.** `SUBSTRATE_PROXIMITY_DIKAIOSYNE_ENABLED` confirmed still `true` (the disclosed coupling). The throwaway smoke credential is REVOKED (id `30133f71-1dc5-4d13-b600-5f07b136c158`; net-zero); the docs changes go live on the founder's push. R18f / R20a / distress / Layer-2 signing / UPC auth untouched.

## Founder Verification (Between Sessions)
```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/website"
npx tsx src/lib/translation-sandwich/__tests__/layer2-signer.test.ts
```
Expected: `18 passed, 0 failed`. Then commit the file list above and push via GitHub Desktop; Vercel deploys the docs (behaviour unchanged — the flag is already live). Post-push spot-check: `curl -s https://www.sagereasoning.com/.well-known/agent-card.json | python3 -c "import json,sys;print(len(json.load(sys.stdin)['capabilities']['extensions']))"` → `16`.

## Rollback
Unset `SUBSTRATE_CORROBORATION_CHECK_ENABLED` + redeploy → byte-identical flag-off (test-asserted). `git revert` this session's commit for the docs/records. Coupling note: unsetting the §4 flag would silently disable the check on `/api/reason` while the gate stays covered.

## Orchestration Reminder
The 0h call remains the founder's. S0b (Trust Layer ADR) has no dependency on anything carried here. The A2 structural residual stays disclosed; no public weights claim.

## Cross-references
- `operations/handoffs/founder/2026-07-08-corroboration-check-live-battery-completion-CLOSE.md` (predecessor close)
- `operations/handoffs/founder/2026-07-08-corroboration-check-activation-NEXT-SESSION-PROMPT.md` (the executed prompt, SPENT)
- `D-TRUST-LAYER-S0A-CORROBORATION-CHECK-LIVE-GATE-ACTIVATION`
- `operations/benchmarks/sage-practice-v1/2026-07-08-corroboration-check-build-results.md` §8 (the activation record)
- `operations/trust-layer-2026-07/trust-layer-build-plan.md` (S0b next)

*End of session close. The extraction-trust catchable half is enforced in production on both surfaces, the public contract documents it honestly, and the arc proceeds to S0b with the logos-gate activation condition discharged.*
