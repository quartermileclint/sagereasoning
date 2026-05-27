# Next-Session Prompt — Whole-System Test: Next Scope (post positive-matrix completion)

**Stream:** founder.
**Tier:** **depends on the elected scope** (see the Opening Election). Most candidates are `governance` / `code-standard` (Standard); **C2 is `code-critical`** (full Critical Change Protocol). Declare the tier at open once the scope is elected.
**Governing frame:** `/adopted/standing-protocol-cache.md` + `/adopted/build-sessions-protocol-cache.md` ("no current users" holds — founder + test logins only).
**Predecessor close:** `/operations/handoffs/founder/2026-05-25-L2complete-L4-L6-finish-positive-scenarios-build-close.md` (read it + its **Verification Outcome** addendum).
**Predecessor decision-log entry:** `D-L2COMPLETE-L4-L6-POSITIVE-SCENARIOS-BUILD-2026-05-25` (read its **Verification** update). Prior: `D-L1-L5-CLEAN-SCENARIOS-BUILD-2026-05-25`; `D-L7-SINGLE-LOOP-PROOF-LIVE-VERIFIED-2026-05-25`.

## Why this session matters

The **positive scenario matrix L1–L7 is complete and Verified live** on the test env, and **Combination 1** (the headline negative) is already passing in production (R18f gate Live). What remains of the whole-system test is: the **distress perimeter (C2)**, the **no-practice disclaimer negative (Combination 2)**, and the forward payoff — turning the proven harness into the **control-vs-treatment rig** ("is the agent better *with* the substrate?"). These are genuinely parallel options with different risk tiers and dependencies, so this session **opens with a scope election** — the founder picks the direction.

## Opening election — pick the next scope (settle at open; founder elects)

The AI surfaces these via AskUserQuestion after reading (Part A), states the Anthropic-primitive consideration per PR15, then executes the elected scope.

- **A — C2: R20a distress perimeter across the loop (`code-critical`, full Critical Change Protocol).** Completes the test matrix's last scenario type and the safety story: a distress-signal input at each product entry is caught + redirected (the eight AC5 routes). **Critical because** it requires activating `SUBSTRATE_R20A_GATE_ENABLED` in the TEST env (env-flag activation = Critical, 0d-ii) **and** it exercises safety-critical distress classification (**PR6 → Critical**). The full Critical Change Protocol (0c-ii) applies, visibly, before any flag flip. Heaviest lift; highest safety value.
- **B — Priority 4 + Combination 2: the no-practice disclaimer (`governance` / Standard).** Priority 4 writes the no-practice disclaimer text (plain-language, accurate); then the Combination-2 assertion greps the disclaimer string across the surfaces where the config is offered (developer docs, `llms.txt`, `agent-card.json`, the limitations page). Unblocks the project's stated sequence. Lowest risk — content + a doc-grep runner; **needs no test env**. *(AI recommendation: a sensible low-risk "proceed" that follows the project's own Comb2 → C2 → comparison order.)*
- **C — Control-vs-treatment rig (`code-standard`, Standard).** Turn the harness into the comparison rig the whole arc was building toward: run the scenarios with the substrate ON vs OFF (the `SUBSTRATE_LAYER3_ENABLED` / signing / gate flags) and capture the difference — the 0h-criterion-4 value demonstration ("is the agent better *with* the substrate?"). Standard test scaffolding; **needs the test env**.
- **D — Option B: admin-gate fidelity follow-up (`code-standard`/`code-elevated`).** Exercise the real D-14 admin `POST /api/calling/approve` route end-to-end (returns `discovered_purpose` directly), backfilling the higher-fidelity version of L2-complete/L4/L6. **Needs** an admin Supabase session token supplied to the harness + `PLUGIN_AUTH_ENABLED='true'` + `PLUGIN_AUTH_SECRET` in the test env. Optional; lower marginal value.

## Locked context — do NOT re-derive

- **Positive matrix L1–L7 — Verified live** (ledgers in `data-room/05_outputs/`: `L1-live-*`, `L2-live-*`, `L3-live-*`, `L5-live-*`, `L7-live-*`, and the new `L2-complete-live-*`, `L4-live-*`, `L6-live-*`). **Combination 1** — passing in production (R18f gate Live, 2026-05-24).
- **Production is UNTOUCHED.** Provenance gate Live; `/api/reason` byte-identical to pre-A7 cutover.
- **Local dev is on PRODUCTION now** (the founder restored `.env.local` from `.env.local.prod-backup-2026-05-24` at the end of the last session — `.env.local` has 0 test refs / 1 prod ref). **There is NO one-line "restore test" backup.** Any scope that needs the TEST env (A, C, D) must **re-point `.env.local` at the test project first, per `/data-room/04_test_brief/test-env-standup-checklist.md`**, then restart the dev server and confirm `GET http://localhost:3000/api/public-key` → `key_id: substrate-layer2-test`. Scope **B needs no test env.**
- **Standing test env** (rebuilt 2026-05-25): test Supabase project `iwdtrvuphogkwmovhnvz`; test Ed25519 key-pair; two seeded `api_keys` / `sr_assent_` credentials (the `WSH_*` exports come from `scripts/whole-system-harness/mint-test-credentials.ts`); the A1 `sage_reflect_sessions` columns (`complexity`, `calibration_all_correct`) are present; `SUBSTRATE_R20A_GATE_ENABLED` is intentionally UNSET (C2 is the scope that turns it on — under the Critical protocol).
- **The harness + its `lib/` are proven.** `website/scripts/whole-system-harness/` — `lib/http-client.ts`, `lib/reflect-driver.ts`, `lib/bridge-step.ts`, `lib/calling-driver.ts`, `lib/discovered-purpose-asserts.ts`, `lib/assertions.ts`, `lib/capture.ts`, `lib/fixtures.ts`, `lib/scenario-input.ts`; runners `run-l1/2/3/5/7` + `run-l2-complete/4/6`. Reuse, don't rebuild (PR15 — extend the existing pattern).
- **Verify with `npx tsc --noEmit`** (full project — the pre-commit + Vercel check), not only `npx tsx` (which strips types without checking). Run it before declaring any harness change done. Live runs reach localhost:3000, which the build sandbox cannot — so live runs + the `Verified` stamp are the founder's between-session step (0c).
- **Branch:** `main`. The AI does **no** git operations; clear any `.git/index.lock` host-side. Stage by name (never `git add .`; never stage `website/.env.local*` or `website/tsconfig.tsbuildinfo`).

## Pre-conditions (confirm at open)

1. On `main`; working tree clean.
2. If the elected scope needs the test env (A / C / D): re-point `.env.local` at the test project per the standup checklist; restart the dev server; confirm `key_id: substrate-layer2-test`. For **A (C2)**, the `SUBSTRATE_R20A_GATE_ENABLED` activation is a **Critical** step — do it inside the Critical Change Protocol, not as a pre-condition.
3. If the elected scope is **B**: no test env needed; confirm where the disclaimer surfaces live (docs / `llms.txt` / `agent-card.json` / limitations page).

## Part A — Open under the protocol

Read in order:
1. `/adopted/standing-protocol-cache.md` (~3 min — tier, status vocabulary, model selection per AC1, risk class, lean vs full templates).
2. `/adopted/build-sessions-protocol-cache.md` (build-arc context).
3. `/operations/handoffs/founder/2026-05-25-L2complete-L4-L6-finish-positive-scenarios-build-close.md` (predecessor close + Verification Outcome).
4. `/operations/decision-log.md` — the predecessor entries named above.
5. For the elected scope: `data-room/04_test_brief/scenario-matrix.md` + `test-brief.md` (§B for C2/Comb2; §C for C2 distress; §A.3 for the disclaimer) + `03_seam_map/seam-map.md`. For **A (C2)**, also read `/manifest.md` AC5 (the eight R20a routes) + the R20a perimeter rules in full.

**Confirm at open:** tier (set by elected scope); branch; whether the test env is needed + re-pointed; status vocabulary; model selection (the harness makes no model choice). **PR15 consult** before any bespoke build — extend the existing harness `lib/` + plain-`tsx` assertion pattern.

## Part B — Procedure (by elected scope)

- **A (C2):** Architecture-before-code (R20a is safety-critical). Follow the **full Critical Change Protocol (0c-ii)** visibly: what changes (enable `SUBSTRATE_R20A_GATE_ENABLED` in TEST), what could break, session impact (N/A — founder + test logins only), rollback (unset the flag), verification step, explicit founder approval specific to the named risks. Build a `run-c2.ts` that submits a distress-signal input at each product entry and asserts the redirect / pass-through statement appears (synchronous safety check, PR3). PR1: prove on a single route first, reach Verified, then the rest. PR6 applies throughout.
- **B (P4 + Combination 2):** Draft the no-practice disclaimer text (Priority 4 — plain-language, accurate, per `test-brief.md` §A.3). Place it on each surface (docs / `llms.txt` / `agent-card.json` / limitations page). Build a `run-comb2.ts` (or a doc-grep step) asserting the disclaimer string is present on every surface. Standard / governance; no test env.
- **C (control-vs-treatment rig):** Parameterise the existing runners (or a new `run-compare.ts`) to execute a scenario with the substrate ON vs OFF (the `SUBSTRATE_LAYER3_ENABLED` / signing / gate flags) and capture both outputs side-by-side into a ledger; define what "better with the substrate" means as an assertion or a founder-readable diff. Standard; needs the test env.
- **D (Option B):** Supply an admin Supabase session token to the harness; call `POST /api/calling/approve` (admin auth) to get `discovered_purpose` directly; thread L4 via the plugin-auth path (`PLUGIN_AUTH_ENABLED='true'` + `PLUGIN_AUTH_SECRET`). Backfills the gate-exercised version of L2-complete/L4/L6.

**Then (all scopes):** verify (PEV, PR10 — `npx tsc --noEmit` for any code change; founder live run for HTTP/DB); append a decision-log entry (lean form, or **full** for C2); write the session close (lean, or **full** for C2 per the cache's Critical-session close sections); clean up any throwaway build-only/dry-preview ledgers from `data-room/05_outputs/`.

## Part C — Anticipated session shape

| Phase | Estimate |
|---|---|
| Caches + predecessor close + scope-specific reads | 15–25 min |
| Opening election (founder picks scope) | 5–10 min |
| Build + verify (B: ~1–2 h; C: ~2–3 h; D: ~2–3 h; **A/C2: a full Critical session, ~3–5 h**) | varies |
| Decision-log + close (lean, or full for C2) | 20–40 min |

## Rollback

Test scaffolding is additive and never deployed (delete host-side if abandoned). **For C2 only:** the rollback is unsetting `SUBSTRATE_R20A_GATE_ENABLED` in the TEST env (production never touched). Restore production local dev when test work is done — note there is **no test backup**, so re-pointing at test is per the standup checklist, and returning to prod is `cp website/.env.local.prod-backup-2026-05-24 website/.env.local`.

## Forecast

Success = the elected scope reaches Verified (or, for B, the disclaimer is present on every surface and the Comb2 assertion passes). Once C2 + Combination 2 are both done, the whole-system test matrix is complete (positive + negative + distress), and the harness is ready to serve as the control-vs-treatment rig (C) — the 0h-criterion-4 value demonstration that closes the hold point.

End of prompt. Opens on `main`. Production is unchanged at session open; any test-env work re-points `.env.local` at the test project first (no one-line restore exists).
