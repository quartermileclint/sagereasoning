# Next-Session Prompt — Mechanism-correction **carried activations**: M1 (consult-path) · M3-CI-11 (coverage columns) · M4 (verify-complete) · M5 (practice-completion)

**Stream:** founder. **Model:** session default, maximum reasoning. **Environment:** Claude Code on the founder's machine (TEST **and production** reachable).
**Tier:** **`code-critical`** for every prod flag flip + every prod migration (each its own 0c-ii Critical Change Protocol). The doc-only pieces (CI-15 cadence; the staged public-doc inserts) are Elevated (R18 public-surface changes) but ride the corresponding flag/migration activation.
**Governing frame:** `/adopted/standing-protocol-cache.md` + `/adopted/build-sessions-protocol-cache.md`. PR1 (prove on one surface/TEST first); PR17 (every Supabase/Vercel step walked live — the founder performs them); PR18 at close. **The AI does no git/Supabase/Vercel ops; the founder performs every one; the AI guides + verifies.**
**Predecessor close:** `operations/handoffs/founder/2026-06-15-credential-consolidation-CI14-completion-step6e-step7-close.md` (CI-14 is now fully complete — UPC, 6e, Step-7 all Live).
**Spec sources (read the entry for each item you elect):** the M1/M3/M4/M5 decision-log entries — `D-MECHANISM-CORRECTION-M1-CONSULT-PATH-BUILT-VERIFIED-2026-06-13`, `…-M3-ACCREDITATION-BUILT-TEST-VERIFIED-2026-06-13`, `…-M4-GATE-QUICK-TIER-BUILT-TEST-VERIFIED-2026-06-13`, `…-M5-PRACTICE-COMPLETION-BUILT-TEST-VERIFIED-2026-06-14` — plus the two staged-doc files (`operations/p1-rebuild-2026-06/m1-docs-staged-for-activation.md`, `…/m5-docs-staged-for-activation.md`).

> **Scope note:** these are the remaining **carried activations** of the mechanism-correction arc — features already built + TEST-Verified, awaiting their founder-elected production activation. They are **independent** — do any subset, in any order, across one or more sessions. The founder elects scope at open: **M1 only / M3-CI-11 only / M5 only / any combination / all**. (M4 needs no activation — see Part C; the session just confirms + records it.) If you'd rather spend the session on **the 0h launch call** (the gating launch item — a founder strategic decision, not a build session), say so at open and skip this prompt.

---

## Why this session matters

The CI-14 consolidation closed the credential arc; these are the **last shipped-but-inert mechanism-correction levers**. Each is a flag flip and/or a small prod migration that turns a TEST-Verified feature on:
- **M1** makes the consult path **defer Layer-3 prose** (87% latency cut at standard, measured on TEST) + accept a key-path `layer1_schema` + retain every examination's narrative (CI-17 narrative-existence guarantee).
- **M3-CI-11** surfaces the **K1 coverage-status honesty fields** on the public accreditation payload (currently folded to null because the columns aren't migrated in prod).
- **M5** turns on the **reflect-at-close `practice` hint** (CI-13) + publishes the **two-gate consultation cadence** (CI-15).
- **M4** is already effectively complete (CI-8 always-on, CI-10 Live, CI-9 acknowledged) — only the parked CI-16 + a fleet-wide price-vs-cost honesty question remain, neither an activation.

## Pre-conditions (verify at open)
1. CI-14 is **Live + stable** (UPC + 6e + Step-7 all Live; no new prod incidents). The four R20a flags, B1 trajectory, B2 CI-4, CI-10 gate metering remain Live.
2. `tsc --noEmit` clean; the substrate/translation-sandwich + accreditation suites green (run with the redirect-to-file or Python-`subprocess`-timeout form for the security-importing keepalive-hangers — memory `tsx-tests-setinterval-keepalive-hang`; `--env-file=.env.local` for the Supabase-touching ones).
3. TEST schema mirrors prod for the surfaces you'll touch; a fresh terminal for any TEST mint (memory `mint-cli-env-file-export-leak`); the TEST admin `profiles` row exists (memory `test-admin-needs-profiles-row`).

## Cross-cutting safety posture (applies to every item)
- **Each flag flip / migration is its own 0c-ii gate.** TEST first, then prod, every VERIFY founder-walked.
- **R18 discipline:** the staged public-doc inserts (M1, M5) are applied **only at the corresponding flag activation** — never before the production behaviour exists. The CI-3 latency envelopes carry their environment label until production-verified.
- **Rollback for any flag = unset it** (byte-identical to today; all test-asserted flag-off). Migrations are additive + reversible (their files carry a DROP/rollback block).
- **No perimeter change:** R18f provenance gate / R20a / distress / Layer-2 signing / the UPC auth path stay untouched by all of these.

---

## Part A — M1: consult-path activation (the heaviest; Critical)

**What it turns on:** L3 prose deferral (`response_format: 'assessment_first'`), the key-path `layer1_schema` contract, and server-side narrative retention. Built + TEST-Verified at `D-…-M1-…-2026-06-13`.

**The activation checklist (from the M1 decision-log entry's open-questions block):**
1. **Prod migration** `website/supabase/migrations/20260612_m1_substrate_audit_narratives.sql` (the retention table — 90-day retain, R17b app-level encryption, admin hard-delete; **TEST-applied, prod pending**). TEST-re-confirm then prod, each VERIFY walked.
2. **Flags** `SUBSTRATE_L3_DEFER_ENABLED` + `SUBSTRATE_L1_SCHEMA_KEY_PATH_ENABLED` → `true` in Vercel.
3. **`vercel.json` cron** for `/api/cron/narrative-sweep` (the sweep route deploys CRON_SECRET-gated, reports `flag_enabled:false` until the flag is on; **no cron entry exists yet** — `vercel.json` currently has only `observability` + `trajectory-retention-sweep`, both `0 8 * * *`). Add the narrative-sweep entry (hourly suggested per the M1 checklist).
4. **Vercel Fluid-Compute dashboard check** — the `waitUntil` deferral primitive (`@vercel/functions@^3.7.1`, already in `package.json`) needs Fluid Compute enabled; confirm on the dashboard before relying on it.
5. **Apply `m1-docs-staged-for-activation.md`** — the CI-17 blocked-configuration statement + the CI-2 open-Layer-1 contract + the CI-3 latency envelopes → `website/public/llms.txt`, `website/public/.well-known/agent-card.json`, the api-docs `/api/reason` section (exact placements in the staged doc).
6. **Privacy-page sentence** — the 90-day narrative retention + encryption-at-rest + deletion-on-request.

**⚠ SEQUENCING (post-Step-6 awareness):** activating `SUBSTRATE_L1_SCHEMA_KEY_PATH_ENABLED` now also makes the UPC **`l1_supply` capability gate ENFORCE** on `/api/reason` (today's flag-off path skips it). The Step-2 backfill granted `l1_supply` to **every** consult-capable credential (`consult_without_l1_supply=0`, verified at cutover), so existing creds supply L1 fine — but a TEST check (a `consult`-only credential **with** `l1_supply` supplies a `layer1_schema` → 200 `meta.layer1_source=supplied`; a hypothetical credential **without** `l1_supply` → 403) confirms the gate is correctly wired before the prod flip.

**Acceptance (M1):** TEST flag-on leg (a deferred consult returns the assessment fast + a narrative row is written + the sweep purges past-retention rows + `l1_supply` enforced as above) → prod migration + both flags + the cron + the docs + the privacy sentence, each walked → a prod smoke (one deferred consult writes a narrative row keyed to its correlation id; the sweep curl returns `flag_enabled:true`). **Production test artifacts (throwaway key + its narrative/billing rows) excluded from billing/trajectory samples + revoked/swept at teardown.**

## Part B — M3-CI-11: K1 coverage columns (Standard-ish migration + the fold goes live)

**What it turns on:** the public accreditation GET payload surfaces `coverage_status` / `monitored_since` / `credential_basis` (the server-side honesty composer — `agent_elected`, consumer-unforgeable) instead of folding them to null. **No flag** — the fold becomes live the moment the columns exist in prod.

1. **Migration** `website/supabase-agent-accreditation-k1-coverage-migration.sql` — three **nullable additive** columns on `agent_accreditation`. TEST first (confirm the public payload then surfaces the fields), then prod.
2. **Verify** the public `/api/accreditation/[agent_id]` payload carries the three fields (honest values; operator unattributed in `credential_basis` per R17 minimisation).

**Acceptance (M3-CI-11):** TEST migration → public payload shows the coverage fields → prod migration → public payload verified. Additive + reversible (DROP the three columns).

## Part C — M4: verify-complete (no activation action)

M4's levers are **already resolved** — confirm + record, no flag/migration:
- **CI-8** (gate-meta cost honesty) — **always-on, Live** (shipped at M4).
- **CI-10** (gate loop metering) — **Live since 2026-06-13** (`D-MECHANISM-CORRECTION-CI10-PRODUCTION-ACTIVATION-2026-06-13`).
- **CI-9** (gate latency diagnostic) — **diagnostic-only; replay reproduced + founder-acknowledged 2026-06-13** (the 46ms/20,015ms split = a `runSageReason` LRU cache hit vs a cold call; no code path to activate).
- **CI-16** — **parked** (the gate-engine architecture decision — a *separate* future election, NOT an activation).
- **Open (not an activation):** the fleet-wide price-vs-cost question (the 6 non-gate routes report customer *price* as `meta.cost_usd`) — a founder honesty call, addressable separately.

→ This session simply **records M4 as activation-complete**; there is nothing to flip.

## Part D — M5: practice-completion activation (flag + docs; Critical for the flag)

**What it turns on:** the CI-13 reflect-at-close `practice` hint on the consult + accreditation-write responses, and the CI-15 two-gate cadence on the public surfaces. Built + TEST-Verified at `D-…-M5-…-2026-06-14`. **The CI-4 reason-route half is ALREADY Live (B2)** — only CI-13 + CI-15 remain.

1. **Flag** `SUBSTRATE_PRACTICE_CYCLE_HINT_ENABLED` → `true` in Vercel (the `practice` field is absent when unset; `practice-cycle-hint.ts` ships dark).
2. **Apply `m5-docs-staged-for-activation.md`:**
   - **CI-15** two-gate cadence — a new `## Consultation Cadence (When to Examine)` section on `llms.txt` + an `agent-card.json` extension + an api-docs subsection + an `mcp-contracts.ts` paragraph. **Docs-only, NO flag — may be applied independently** of the CI-13 flip if the founder elects (it's adopted methodology).
   - **CI-13** the `practice`-field contract — rides the flag flip (publishing "responses carry a `practice` field" only once the field is emitted, R18).

**Acceptance (M5):** TEST flag-on (the `practice` field appears on a consult response + an accreditation-write response, pointing at the existing SR-13 reflect) → prod flag + apply the staged docs (CI-13 with the flag; CI-15 may go independently), each walked. Rollback = unset the flag (field disappears) / `git revert` the docs.

---

## What is NOT in scope
Parked **CI-16** (the gate-engine value-classification decision — its own session); **the 0h launch call** (the gating launch item — a founder strategic decision); the `/api/keys` 100/100/1 vs admin 30/1/1 split (carried fold-or-record); prefix retirement; the portable creator credential; per-install metering. Any new manifest-rule candidate (e.g. the CI-17 R18f-parallel "no examination credential over verdict-only assessments") goes through its own governance session if elected.

## Rollback (summary)
Every flag = unset it in Vercel (byte-identical to today; all flag-off paths are test-asserted). Each migration is additive + reversible via its file's DROP/rollback block. The staged public-doc inserts = `git revert`. Nothing here touches the live UPC auth path, the R18f gate, R20a, distress, or Layer-2 signing.

## Forecast
Success: the elected levers go Live (M1's deferral + narrative retention; M3-CI-11's honest coverage fields; M5's practice hint + cadence docs), each TEST-then-prod-walked, M4 recorded complete. After all four land, the **only** remaining mechanism-correction items are parked **CI-16** and **the 0h launch call** — and the 0h call is the one true launch gate.

End of prompt. Open on `main`; the AI does no git/production operations; each flag/migration is its own additive/reversible 0c-ii; the staged public docs ride their activation (R18); every already-Live behaviour keeps working throughout.
