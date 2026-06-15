# Next-Session Prompt — M1 **consult-path activation** (L3 prose deferral + key-path Layer-1 + narrative retention)

**Stream:** founder. **Model:** session default, maximum reasoning. **Environment:** Claude Code on the founder's machine (TEST **and** production reachable).
**Tier:** **`code-critical`** — a production schema migration + production env-flag activation(s) + a deployment-config change (`vercel.json` cron). Each flag flip / migration is its own 0c-ii Critical Change Protocol. The staged public-doc inserts are Elevated (R18) and ride the corresponding flag.
**Governing frame:** `/adopted/standing-protocol-cache.md` + `/adopted/build-sessions-protocol-cache.md`. PR1 (prove on TEST first); PR17 (every Supabase/Vercel step founder-walked live — the founder performs them; the AI does **no** git/Supabase/Vercel op, only guides + verifies); PR18 at close.
**Predecessor close:** `operations/handoffs/founder/2026-06-15-carried-activations-M3CI11-M5-close.md` (M3-CI-11 + M5 are LIVE; CI-14 fully complete).
**Spec sources (read each before acting):** the M1 build entry `D-MECHANISM-CORRECTION-M1-CONSULT-PATH-BUILT-VERIFIED-2026-06-13` (decision-log ~line 10878); the M1 close `operations/handoffs/founder/2026-06-13-mechanism-correction-M1-close.md`; the staged docs `operations/p1-rebuild-2026-06/m1-docs-staged-for-activation.md`; the carried-activations prompt Part A `operations/handoffs/founder/2026-06-15-mechanism-correction-carried-activations-M1-M3CI11-M4-M5-NEXT-SESSION-PROMPT.md`.

> **What this is:** M1 was built + TEST-Verified at the M1 session (2026-06-13) and ships **dark in production** (both flags UNSET, the retention table unmigrated in prod, no `vercel.json` cron entry). This session performs its founder-elected **production activation**. It is the **heaviest** of the carried activations — a migration, two independent flags, a cron, a Vercel platform check, public docs, and a privacy-page sentence — so it gets its own session.

---

## Why this session matters

M1 turns the consult path from "every consult pays the full Layer-3 prose + server Layer-1 latency" into the deferred, schema-supplied shape the forensic diagnosed (FX-4/FX-13). Measured on TEST: **~3–4s deferred vs 29–33s raw+full — an ~87% cut at standard.** Three levers, all built + TEST-Verified:
- **CI-1 — L3 prose deferral** (`response_format: 'assessment_first'`): the signed assessment + extraction + meta return immediately; the narrative is generated async and **retained server-side** (never suppressed — CI-17). Flag `SUBSTRATE_L3_DEFER_ENABLED`.
- **CI-2 — key-path `layer1_schema`**: accept a pre-extracted Layer-1 schema (required on `sr_inst_`, optional on `sr_live_`/`sr_prac_`), skipping server Layer-1 (`meta.layer1_source: "supplied"`). Flag `SUBSTRATE_L1_SCHEMA_KEY_PATH_ENABLED`.
- **CI-17 — narrative-existence guarantee**: a pending `substrate_audit_narratives` row is written (awaited) before the response and completed by `waitUntil` or the `/api/cron/narrative-sweep` backstop. "A verdict without a narrative account is a classification, not an examination."

## ⚠ Two load-bearing facts the carried prompt got slightly wrong (corrected here)
1. **Migration path:** the retention table migration is at **`supabase/migrations/20260612_m1_substrate_audit_narratives.sql`** (repo-root `supabase/`), **not** `website/supabase/...` as the carried prompt stated. Verify-before-citing held.
2. **api-docs has no `/api/reason` entry.** The M1 staged docs say to apply CI-17/CI-2/CI-1/CI-3 to "the api-docs page's `/api/reason` section," but `website/src/app/api-docs/page.tsx` has **no `/api/reason` entry in its endpoints data array** (only legacy endpoints; confirmed in the 2026-06-15 M5 session). The applier must add a new subsection (or an `/api/reason` entry) rather than amend a non-existent block — same adaptation M5 used.

## ⚠ Post-CI-14 sequencing (the l1_supply enforcement coupling)
Activating **`SUBSTRATE_L1_SCHEMA_KEY_PATH_ENABLED`** also makes the now-Live UPC **`l1_supply` capability gate ENFORCE** on `/api/reason` (today's flag-off path skips it). The CI-14 Step-2 backfill granted `l1_supply` to **every** consult-capable credential (`consult_without_l1_supply=0`, verified at the Step-6 cutover), so existing creds supply L1 fine. **Before** the prod L1 flag flip, run a TEST gate-check: a `consult`+`l1_supply` credential supplying a `layer1_schema` → **200** `meta.layer1_source=supplied`; a credential **without** `l1_supply` → **403**. This is why the L3-deferral flag and the L1-key-path flag are treated as **two separate sub-activations** below (PR1 — one surface/behaviour proven at a time).

## Pre-conditions (verify at open)
1. Predecessor state holds: M3-CI-11 + M5 + CI-14 (UPC/6e/Step-7) + B1/B2/CI-10 + the four R20a flags all Live; no new prod incidents.
2. `tsc --noEmit` clean; the M1 suites green — `website/src/lib/substrate/__tests__/narrative-retention.test.ts` (19) + `website/src/lib/translation-sandwich/__tests__/prose-deferral.test.ts` (26). Use the redirect-to-file + timeout-kill runner for any security-importing suite (memory `tsx-tests-setinterval-keepalive-hang`).
3. The M1 code is already deployed dark in prod (the M1 commit was pushed at the build session — the `/api/cron/narrative-sweep` route + the flag-gated deferral/retention code + `@vercel/functions` are live, inert). Confirm `git log`/Vercel shows the M1 commit deployed.
4. **`MENTOR_ENCRYPTION_KEY` is set in production** (the retention writes encrypt the assessment + narrative with it, per the migration's encryption shape; it is the existing intimate-data key used by SR-12 / open_deferrals / sage-reflect, so it should already be set — confirm before flipping the defer flag, else awaited retention writes fail).
5. TEST schema mirrors prod for `substrate_audit_narratives` (it was TEST-applied at the M1 build; re-confirm via the migration §pre-flight). Fresh terminal for any TEST mint (memory `mint-cli-env-file-export-leak`); TEST admin `profiles` row exists (memory `test-admin-needs-profiles-row`).

## Cross-cutting safety posture
- **Each flag flip / migration is its own 0c-ii gate.** TEST first, then prod, every VERIFY founder-walked. The AI performs no Supabase/Vercel/git op.
- **R18 discipline:** the staged public-doc inserts are applied **only at the corresponding flag activation** — never before the production behaviour exists. The CI-3 latency envelopes carry their TEST label until re-measured on production.
- **Rollback for any flag = unset it** (byte-identical to today; flag-off paths are test-asserted). The migration is additive + reversible (its file carries the rollback block; but note: once deferral is Live and writing rows, dropping the table requires the flag off first).
- **No perimeter change:** the R18f provenance gate / R20a / distress classifier / A5 wrapper / A7 gate / Layer-2 signing / the UPC auth path stay untouched. The deferral path is **structurally unavailable for distress-signal runs** (`shouldDeferProse` forces the inline path) — re-verify this in the TEST leg.

---

## Procedure

### Step 0 — Open under the protocol
Read the spec sources above + the predecessor close + the last 2 decision-log entries. Confirm at open: tier (`code-critical`); hold-point (0h HELD); model selection (`/api/reason` quick→Haiku, standard/deep→Sonnet, narrative generation→Sonnet per AC1 — M1 changes response shape + L1 path + retention, not the models); status vocabulary; risk class. Re-run pre-condition 2 (tsc + the two M1 suites).

### Step 1 — Pre-activation adversarial review (ultracode)
Run a focused multi-agent review (the established pattern; mirror the M3-CI-11/M5 session). Dimensions to cover: (a) **migration safety** (additive/idempotent/reversible; the encryption-meta JSONB shape; the not-append-only UPDATE/DELETE divergence is intended); (b) **flag-off byte-identity** for both flags (re-confirm — asserted by `prose-deferral.test.ts`); (c) **the l1_supply enforcement coupling** (does flipping the L1 flag fail-closed correctly for a no-`l1_supply` cred? does it 403 cleanly, not 500?); (d) **CI-17 guarantee** (the pending row is awaited before response; `waitUntil` + sweep complete it; KG1 — no self-call in the sweep, all awaited); (e) **distress structural-defer guard** (`shouldDeferProse` forces inline on a distress signal — no R20a/A7/A5 file touched); (f) **fail-honesty** (a missing `MENTOR_ENCRYPTION_KEY` or a retention-write failure must not silently drop the narrative or 500 the consult in a way that loses the examination). Fold any blocking finding before touching prod.

### Step 2 — Vercel Fluid-Compute check (founder-walked)
The `waitUntil` deferral-completion primitive (`@vercel/functions@^3.7.1`) needs **Fluid Compute** enabled on the project. Confirm on the Vercel dashboard (Project → Settings → Functions → Fluid Compute) **before** relying on deferral. If off, the `/api/cron/narrative-sweep` backstop still guarantees existence, but `waitUntil` completion is the fast path — enable it.

### Step 3 — Production migration (Critical Change Protocol, founder-walked)
Apply `supabase/migrations/20260612_m1_substrate_audit_narratives.sql` on **production** (the table must exist before the defer flag, or awaited retention writes fail). Walk it like M3-CI-11: run the migration's pre-flight/§verify; confirm the table + its indexes + the encryption-meta columns exist; paste outputs back. Re-confirm on TEST first (idempotent). **State the Critical Change Protocol** (what changes / what could break / existing sessions N/A no users / rollback = `DROP TABLE substrate_audit_narratives` with the defer flag off / verification = the §verify) and get explicit "go ahead."

### Step 4 — Sub-activation A: L3 prose deferral (founder-walked, its own 0c-ii)
1. **TEST leg** (PR1): `SUBSTRATE_L3_DEFER_ENABLED=true` in `.env.development.local`; a consult with `response_format:'assessment_first'` → fast assessment + `narrative:{status:'deferred',correlation_id}`; a pending `substrate_audit_narratives` row written, then completed (waitUntil/sweep); a **distress-signal consult still returns the full synchronous shape** (deferral structurally unavailable); the sweep curl completes pending rows + purges past-`retain_until`. Tear down the TEST flag.
2. **Prod:** `SUBSTRATE_L3_DEFER_ENABLED=true` in Vercel (Production) + redeploy → a throwaway prod consult with `assessment_first` writes a narrative row keyed to its correlation id (note: a throwaway key + a billing + trajectory + narrative artifact to revoke/sweep at teardown). Confirm the row + completion.
3. **`vercel.json` cron:** add the narrative-sweep entry (the AI edits `website/vercel.json`; the founder commits + pushes). Current entries: `observability` + `trajectory-retention-sweep` (both `0 8 * * *`). Add `{ "path": "/api/cron/narrative-sweep", "schedule": "0 * * * *" }` (hourly suggested — generation is LLM work, capped per invocation; hourly keeps the pending set near-empty). After deploy, the sweep curl returns `flag_enabled:true`.

### Step 5 — Sub-activation B: key-path Layer-1 (founder-walked, its own 0c-ii)
1. **TEST l1_supply gate-check** (the coupling above): with `SUBSTRATE_L1_SCHEMA_KEY_PATH_ENABLED=true` on TEST, a `consult`+`l1_supply` cred supplying a valid `layer1_schema` → **200** `meta.layer1_source=supplied`, `layer1_latency_ms:0`; the same cred omitting it → today's raw behaviour (`meta.layer1_source=server`); a malformed schema → **400** field-level validator error; (if constructable) a cred **without** `l1_supply` supplying a schema → **403** (fail-closed). Tear down.
2. **Prod:** `SUBSTRATE_L1_SCHEMA_KEY_PATH_ENABLED=true` in Vercel (Production) + redeploy → a throwaway prod consult supplying a schema → 200 `meta.layer1_source=supplied`; confirm an existing-credential consult still works (the backfill granted `l1_supply` to all).

### Step 6 — Apply the staged docs + the privacy sentence (R18 — ride the live behaviour)
Apply `operations/p1-rebuild-2026-06/m1-docs-staged-for-activation.md` once the corresponding behaviour is live: the **CI-17 blocked-configuration statement** (verbatim Q2 sentence + the feature binding); the **CI-2 open-Layer-1 contract**; the **CI-1 `response_format` + R17 retention disclosure**; the **CI-3 latency envelopes** — **re-measure on production and replace the TEST label**, or keep the TEST label until measured (R18). Surfaces: `website/public/llms.txt`, `website/public/.well-known/agent-card.json`, and the api-docs `/api/reason` area (**add a subsection — there is no `/api/reason` endpoint entry to amend**; see the ⚠ above). Add the **privacy-page sentence** (90-day narrative retention + encryption-at-rest + genuine deletion-on-request; lawyer-coupled wording fine to defer to the Stage-1 engagement). The CI-13/CI-15 M5 deferred surfaces (api-docs/mcp-contracts/skill-registry) may be folded in here opportunistically if the founder elects.

### Step 7 — Records (PR18)
Decision-log entry (Critical form) for the M1 production activation; CLAUDE.md production-state PR18 refresh (move M1 from "Built but inert" to "Live in production"); the session close. The founder commits by name + pushes (the migration + flags are founder-performed; the commit carries the `vercel.json` cron entry + the staged docs + the privacy sentence + the records).

---

## Acceptance (M1 activated)
TEST legs pass (deferral + retention + sweep + distress-still-synchronous; l1_supply gate-check) → prod migration applied + verified → both flags Live + the cron scheduled + the Fluid-Compute check done → a prod smoke (one deferred consult writes + completes a narrative row; the sweep curl returns `flag_enabled:true`; a schema-supplied consult reports `meta.layer1_source=supplied`) → staged docs + privacy sentence applied (CI-3 re-measured or TEST-labelled) → records written. **Production test artifacts (throwaway key + its narrative/billing/trajectory rows) excluded from billing/trajectory samples + revoked/swept at teardown.**

## What is NOT in scope
The deferred **M5 doc surfaces** (api-docs/mcp-contracts/skill-registry — fold in opportunistically only); parked **CI-16**; the **CI-17 manifest-rule candidate** (the R18f-parallel "no examination credential over verdict-only assessments" — its own governance session if elected); **the 0h launch call** (the one true launch gate — a founder strategic decision, not a build session); the `/api/keys` 100/100/1 vs admin 30/1/1 split; a consumer-facing narrative-retrieval endpoint (planned separately).

## Rollback (summary)
Each flag = unset it in Vercel + redeploy (byte-identical to today; flag-off paths test-asserted). The migration is additive + reversible (`DROP TABLE substrate_audit_narratives` — but flip the defer flag off first so no write is mid-flight). The `vercel.json` cron entry + the staged docs = `git revert`. Nothing here touches the UPC auth path, R18f, R20a, distress, A7, A5, or Layer-2 signing.

## Forecast
Success: the consult path serves the deferred low-latency shape with every examination's narrative retained (CI-17), accepts schema-supplied Layer-1 with the `l1_supply` gate correctly enforcing, and the public docs honestly describe it (CI-3 production-measured). After M1 lands, the only remaining mechanism-correction items are the **deferred M5 doc surfaces**, parked **CI-16**, and **the 0h launch call** — the last of which is the true launch gate.

End of prompt. Open on `main`; the AI does no git/production operations; each flag/migration is its own additive/reversible 0c-ii; the staged public docs ride their activation (R18); every already-Live behaviour keeps working throughout.
