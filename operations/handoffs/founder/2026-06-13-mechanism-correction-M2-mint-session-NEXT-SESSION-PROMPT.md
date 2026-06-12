# Next-Session Prompt — Mechanism-Correction Build M2: mint session (CI-6 + CI-7)

**Stream:** founder. **Model:** Fable 5, maximum reasoning effort (arc default). **Environment:** Claude Code on the founder's machine; TEST Supabase for live verification; founder-performed steps walked live per PR17.
**Tier:** `code-elevated` for CI-6 (existing route behaviour; billing-adjacent) + `code-standard` for CI-7 (new admin-gated module; no public surface). **Critical guards unchanged from the arc:** any touch of auth surfaces, the R20a branch, the A5 wrapper, or zone logic reclassifies Critical; **no production flag/config activation inside the build** (each is its own 0c-ii step).
**Governing frame:** `/adopted/standing-protocol-cache.md` + `/adopted/build-sessions-protocol-cache.md`. PR10 PEV; PR1 single-endpoint proof; PR2 same-session wire-verification.
**Predecessor close:** `operations/handoffs/founder/2026-06-13-mechanism-correction-M1-close.md`.
**Predecessor decision-log entries:** `D-MECHANISM-CORRECTION-M1-CONSULT-PATH-BUILT-VERIFIED-2026-06-13`, `D-MECHANISM-CORRECTION-BUILD-PLAN-APPROVED-2026-06-12`.

## Why this session matters

CI-6 closes a founder-adjudicated Box-1 catch from the P1 test: the admin mint route hard-codes **667/50/20** against the adopted **30/1/1** defaults (`F12`/FX-12; live-corroborated by the leg-B key row), so every key minted today is over-provisioned ~22× on a billing surface. CI-7 retires the browser-console paste-work that produced the leg-B error class (PF-1 `purpose` 400-retries; the `etch is not defined` typo class) — the founder's own onboarding funnel is the demonstrated defect carrier. Both are pre-P1 funnel fixes that serve launch under any 0h branch; this session also resolves the carried F12-vehicle open question from the leg-B close.

## The approved queue (work top-down; this prompt scopes M2)

| # | Session | Items | Status |
|---|---|---|---|
| 1 | M1 — consult-path levers | CI-1 + CI-17, CI-2 + CI-3 | **Verified (TEST) 2026-06-13; production inert** |
| **→ 2** | **M2 — mint session (THIS PROMPT)** | **CI-6 + CI-7** | Elevated + Standard |
| 3 | M3 — accreditation session | CI-11 + CI-12 (+ CI-4 write-boundary half) | Elevated; Critical-check at the R18f seam |
| 4 | M4 — gate + quick-tier session | CI-8 + CI-9 + CI-10 + CI-16 | Standard ×2 + Elevated ×2 |
| 5 | M5 — practice-completion session | CI-4 (reason-route half) + CI-13 + CI-15 | Elevated |
| 6 | M6/M7 — trajectory persistence | CI-5 | Standard schema + Elevated |
| 7 | M8 — credential consolidation design | CI-14 (design only) | Standard |

**Independent of this queue:** the founder may elect the **M1 activation step** at any time (0c-ii): production migration of `substrate_audit_narratives` + `SUBSTRATE_L3_DEFER_ENABLED` + `SUBSTRATE_L1_SCHEMA_KEY_PATH_ENABLED` + vercel.json cron entry for `/api/cron/narrative-sweep` (hourly suggested) + Fluid-compute dashboard check + applying `operations/p1-rebuild-2026-06/m1-docs-staged-for-activation.md` + the privacy-page sentence.

## Pre-conditions

1. The M1 close commit pushed; Vercel green (flags unset → byte-identical; founder spot-check: production `/api/reason` behaves as before).
2. `npx tsc --noEmit` passes at open.
3. TEST Supabase available. **If the M1 teardown removed the test env block:** CI-6/CI-7 verification needs only `.env.development.local`'s standing TEST contents (Supabase URL/keys + `ADMIN_USER_ID`); no signing keys or M1 flags required for mint work.
4. The AI does no git operations; founder commits by name at close.

## Part A — Open under the protocol (read order)

1. `/adopted/standing-protocol-cache.md` + `/adopted/build-sessions-protocol-cache.md`
2. This prompt; the M1 close
3. Build plan items **CI-6 + CI-7 in full** (`operations/p1-rebuild-2026-06/mechanism-correction-build-plan.md`)
4. Fresh analysis **FX-1, FX-12**; dossier row **B8**
5. Source: the admin mint route (`website/src/app/api/admin/api-keys/route.ts` — the 667/50/20 hard-code at ~:112–115), `website/api-keys-schema.sql` (the adopted 30/1/1 at ~:84,88,92), the founder-admin gate precedent (`/api/admin/slo-health`), `website/src/app/api/admin/plugin-install-credentials/route.ts` (the sr_inst_ mint), the leg-B friction log (`operations/p1-rebuild-2026-06/harnessed/` — PF-1)
6. KG scan: KG1 (route changes; no new DB writes expected); KG2/AC1 (no LLM calls in mint work)

Confirm at open: tier; hold-point (0h HELD); status vocabulary; signals.

## Part B — Procedure

### Step 1 — CI-6: mint-defaults drift fix (Elevated)
Replace the hard-coded 667/50/20 with the adopted 30/1/1 read from (or matched to) the schema source; grep-assert no literal `667` remains on the route. Then the **over-provisioned-keys review** (PR17, founder-walked): query production `api_keys` for rows carrying the drifted limits; founder decides per row (retire / re-limit / leave with note). The leg-B key is already retired; the M1 test key (TEST project) is retired.

### Step 2 — CI-7: mint UX (Standard) — founder elects ONE at session open
(a) **Minimal admin mint page** — founder-JWT-gated (same gate as `/api/admin/slo-health`), mint + revoke + list, key shown once; or
(b) **Repo CLI script** — `npx tsx scripts/mint-credential.ts` with env-creds, same capabilities.
The build-plan PR15 note stands (a Claude Code skill was considered and rejected — the defect is the founder-facing manual surface itself). Fix the PF-1 prompt-pack defects (`purpose` field) in the same pass.

### Step 3 — Tests
Mint-defaults unit assertion (route returns 30/1/1 on a TEST mint); CI-7 surface test per the elected form. Plain-assertion `tsx` scripts per CLAUDE.md conventions.

### Step 4 — Verify (PR2)
`npx tsc --noEmit`; tests; TEST live leg: founder mints a key through the new surface (PR17 walkthrough — **zero console use, zero retries**), row shows 30/1/1, key used once on `/api/reason` (200), revoked, negative-auth confirmed. Grep: no literal 667 on the route.

### Step 5 — Close (lean) + decision log (lean) + PR18
Status changes CI-6/CI-7 → Verified as earned; production-state rewrite at close only; write the M3 prompt (accreditation session) per the queue.

## What is NOT in scope

Any production flag/config activation; the M1 activation checklist (founder-elected, separate); the R20a perimeter / A5 wrapper / auth-surface internals (the mint route's founder-JWT gate is REUSED, not modified — modifying the gate itself reclassifies Critical); M3+ items; the 0h call; methodology of any kind.

## Rollback

CI-6: `git revert` (route-local). CI-7: delete the page/script (additive). Over-provisioned-key changes: per-row, founder-performed, reversible (re-activate / re-limit).

## Anticipated session shape

| Phase | Estimate |
|---|---|
| Open + reads | 15–20 min |
| CI-6 fix + key review (founder live) | 30–40 min |
| CI-7 election + build | 45–60 min |
| Tests + TEST live leg (founder walkthrough) | 30–40 min |
| Close + M3 prompt | 25–30 min |
| **Total** | **~2.5–3 h** |

## Forecast

Success looks like: every newly-minted key carries the adopted 30/1/1; no over-provisioned production key remains unreviewed; the founder mints and revokes through a real surface with zero console paste-work; the M3 prompt ready. The onboarding funnel's demonstrated error class is then gone before any P1 re-engagement.

End of prompt. Open on `main`; production inert throughout; founder performs every environment-touching step live (PR17); nothing activates without 0c-ii.
