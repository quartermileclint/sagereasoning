# Next-Session Prompt — Mechanism-Correction Build M3: accreditation session (CI-11 + CI-12, + CI-4 write-boundary half)

**Stream:** founder. **Model:** Fable 5, maximum reasoning effort (arc default). **Environment:** Claude Code on the founder's machine; TEST Supabase for live verification; founder-performed steps walked live per PR17.
**Tier:** `schema` (Standard — idempotent additive columns) + `code-elevated` (CI-11: Live trust-surface payload change; CI-12: public read path on a Live trust surface). **Critical-check at the R18f seam:** the accreditation write boundary was built Critical — if the CI-4 write-boundary validation *modifies* the existing R18f enforcement logic rather than extending it additively, PR6 posture applies and the step reclassifies Critical. The arc's standing guards are unchanged: any touch of auth surfaces, the R20a branch, the A5 wrapper, or zone logic reclassifies Critical; **no production flag/config activation inside the build** (each is its own 0c-ii step).
**Governing frame:** `/adopted/standing-protocol-cache.md` + `/adopted/build-sessions-protocol-cache.md`. PR10 PEV; PR1 single-endpoint proof; PR2 same-session wire-verification.
**Predecessor close:** `operations/handoffs/founder/2026-06-13-mechanism-correction-M2-mint-close.md`.
**Predecessor decision-log entries:** `D-MECHANISM-CORRECTION-M2-MINT-SESSION-BUILT-VERIFIED-2026-06-13`, `D-MECHANISM-CORRECTION-BUILD-PLAN-APPROVED-2026-06-12`.

## Why this session matters

CI-12 closes the second founder-adjudicated Box-1 catch from the P1 test: the accreditation write accepted `p1-comparison-leg-b-agent` but the public GET rejects the same id ("Expected: agent_{org}_{version}"), so a written provenance record is unreadable through its own public path (FX-11) — the trust surface's core claim fails on contact. CI-11 builds the adopted-but-unbuilt K1 honesty fields (`coverage_status`, `monitored_since`, `credential_basis`) so the credential states what it actually attests (FX-10, R19e). The optional CI-4 write-boundary half puts the loop-closure requirement where it bites — the R18f credential write — per the adopted Q4 mentor verdict. All three serve launch readiness under any 0h branch.

## The approved queue (work top-down; this prompt scopes M3)

| # | Session | Items | Status |
|---|---|---|---|
| 1 | M1 — consult-path levers | CI-1 + CI-17, CI-2 + CI-3 | **Verified (TEST) 2026-06-13; production inert** |
| 2 | M2 — mint session | CI-6 + CI-7 | **Verified 2026-06-13** (CI-6 live on the M2 push; key review complete) |
| **→ 3** | **M3 — accreditation session (THIS PROMPT)** | **CI-11 + CI-12 (+ CI-4 write-boundary half)** | Schema + Elevated; Critical-check at the R18f seam |
| 4 | M4 — gate + quick-tier session | CI-8 + CI-9 + CI-10 + CI-16 | Standard ×2 + Elevated ×2 |
| 5 | M5 — practice-completion session | CI-4 (reason-route half) + CI-13 + CI-15 | Elevated |
| 6 | M6/M7 — trajectory persistence | CI-5 | Standard schema + Elevated |
| 7 | M8 — credential consolidation design | CI-14 (design only) | Standard |

**Independent of this queue:** the founder may elect the **M1 activation step** at any time (0c-ii; six-item checklist in the M1 decision-log entry).

## Pre-conditions

1. The M2 close commit pushed; Vercel green. **Note: the M2 deploy intentionally changes admin-mint defaults to 30/1/1 (CI-6)** — spot-check is a TEST/production mint via the CLI if desired, not required.
2. `npx tsc --noEmit` passes at open.
3. TEST Supabase available (`.env.development.local` standing contents). The CI-7 CLI (`website/scripts/mint-credential.ts`) is the credential surface for any minting this session needs — `MINT_CLI_ADMIN_EMAIL`/`MINT_CLI_ADMIN_PASSWORD` must be re-added if removed at the M2 teardown.
4. The expiring leg-B `agent_accreditation` seed row's disposition is a carried founder item — this session's TEST writes supersede it as test material; the founder may clear it during Step 5.
5. The AI does no git operations; founder commits by name at close.

## Part A — Open under the protocol (read order)

1. `/adopted/standing-protocol-cache.md` + `/adopted/build-sessions-protocol-cache.md`
2. This prompt; the M2 close
3. Build plan items **CI-11 + CI-12 + CI-4 in full** (`operations/p1-rebuild-2026-06/mechanism-correction-build-plan.md`)
4. Fresh analysis **FX-10, FX-11, FX-8**; dossier rows **B8, B6**
5. **The K1 ADR in full:** `adopted/adr/2026-05-26-credential-scope-and-coverage-status.md` (composite key + coverage_status vocabulary — **carry, don't re-derive**)
6. Source: `website/src/app/api/admin/accreditation-credentials/route.ts` (+ `validation.ts`), the public read `website/src/app/api/accreditation/[agent_id]/route.ts` (the GET-side agent_id validation that rejects written ids), `website/src/lib/substrate/sage-assent-accreditation-writer.ts` (the R18f write seam), the `agent_accreditation` schema (locate via grep — **path-check discipline: the M2 prompt cited `website/api-keys-schema.sql` but the file lives at `api/api-keys-schema.sql`; verify schema paths before citing**)
7. KG scan: KG1 (DB writes on the new columns); KG7 if any JSONB; KG2/AC1 N/A unless a verification consult is elected

Confirm at open: tier; hold-point (0h HELD); status vocabulary; signals.

## Part B — Procedure

### Step 1 — CI-12: write/read agent_id reconcile (Elevated)
Read both sides' vocabularies; decide-and-document the canonical id form (the K1 composite key governs); reconcile so **every writable record is readable through the public GET**. The build session proposes the reconcile direction (loosen the read validation vs canonicalise at write vs both); founder elects before code.

### Step 2 — CI-11: K1 first slice (schema Standard + Elevated)
Additive migration on `agent_accreditation` (TEST first, founder-walked): `coverage_status`, `monitored_since`, `credential_basis` (nullable). Existing write paths set honest initial values per the K1 ADR vocabulary; public read payload carries them. **The full state machine (suspend/resume on guardrail toggling) is NOT this slice.**

### Step 3 — CI-4 write-boundary half (founder elects in/out at open; Critical-check)
If elected: the accreditation write validates loop closure — an assessment chain containing adopted-redirections without same-depth re-examinations is **flagged or rejected** (build session proposes both shapes with what-could-break; founder elects). Extend the R18f seam additively; if the existing enforcement logic must be modified, STOP and reclassify per PR6.
**Adjacent candidate (from M2, founder elects in/out):** api-keys PATCH audit symmetry — a `credential_audit` write (and optionally a purpose filter) on the sr_live_ revocation path, mirroring the other two surfaces.

### Step 4 — Tests
Plain-assertion `tsx` per CLAUDE.md: id-reconcile unit coverage (write-accepted ⇒ read-accepted; unknown ids still 404); K1 field initial-value assertions against the ADR vocabulary; write-boundary flag/reject logic if elected.

### Step 5 — Verify (PR2, founder-walked)
`npx tsc --noEmit`; tests; TEST live leg: write a record (CLI-minted `sr_assent_` credential) → **public GET returns it** (today's repro 404s) → fields show honest K1 values → negative case 404s → credentials revoked via the CLI. Production untouched (the CI-11 production migration is part of a founder-elected activation, its own 0c-ii step, unless the founder elects it walked in-session per the M1 precedent).

### Step 6 — Close (lean) + decision log (lean) + PR18
Status changes as earned; production-state rewrite at close only; write the M4 prompt (gate + quick-tier session) per the queue.

## What is NOT in scope

The K1 suspend/resume state machine; CI-13/CI-15 (M5); any production flag/config activation; the M1 activation checklist (independent, founder-elected); R20a perimeter / A5 wrapper / auth-surface internals (the admin gate is REUSED); methodology of any kind; the 0h call.

## Rollback

CI-12: `git revert` (route-local). CI-11: nullable additive columns (DROP on revert); read-path change `git revert`. CI-4 half: flag-gated or `git revert` (additive extension).

## Anticipated session shape

| Phase | Estimate |
|---|---|
| Open + reads (incl. K1 ADR in full) | 20–25 min |
| CI-12 reconcile (election + build) | 40–50 min |
| CI-11 schema (founder-walked) + fields | 40–50 min |
| CI-4 half / PATCH-audit candidate (if elected) | 30–45 min |
| Tests + TEST live leg (founder-walked) | 30–40 min |
| Close + M4 prompt | 25–30 min |
| **Total** | **~2.5–3.5 h** |

## Forecast

Success looks like: every accreditation record written is publicly readable through its own path; the credential carries honest K1 coverage fields; (if elected) the loop-closure requirement bites at the write boundary and the sr_live_ revocation path gains audit symmetry; the M4 prompt ready. The two Box-1 catches from the P1 test are then both closed (F12 at M2, FX-11 here).

End of prompt. Open on `main`; production untouched except by founder election; founder performs every environment-touching step live (PR17); nothing activates without 0c-ii.
