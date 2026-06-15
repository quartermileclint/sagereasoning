# Next-Session Prompt — Credential Consolidation (CI-14): the Unified Practice Credential **build** (Critical track)

**Stream:** founder. **Model:** Fable 5 (or session default), maximum reasoning effort. **Environment:** Claude Code on the founder's machine (production reachable; the Cowork sandbox cannot reach production — run this in Claude Code).
**Tier:** **`code-critical`** — this is an **authentication-surface** change (AC7 + PR6). **Full templates + the Critical Change Protocol (0c-ii) apply to every step** — do NOT use the lean form. The single-validator chokepoint touches `/api/reason`, `/api/calling`, `/api/practice/reflect`, and the plugin-install path at once.
**Governing frame:** `/adopted/standing-protocol-cache.md` + `/adopted/build-sessions-protocol-cache.md`. PR1 (prove on one surface first). PR17 (every founder-performed Vercel/Supabase step walked LIVE, not handed off). PR18 at close.
**THE SPEC (read in full — it is this build's blueprint):** `adopted/adr/2026-06-14-credential-consolidation.md` — the CI-14 ADR (Accepted). Its **Migration §1–§7** and **Build sequencing** section ARE the step plan below.
**Predecessor closes:** `operations/handoffs/founder/2026-06-14-mechanism-correction-M8-credential-consolidation-close.md` (the design); `operations/handoffs/founder/2026-06-14-trajectory-ci4-B2-activation-close.md` (most recent — CI-4 Live).
**Predecessor decision-log entries:** `D-MECHANISM-CORRECTION-M8-CREDENTIAL-CONSOLIDATION-DESIGN-2026-06-14`, `D-MECHANISM-CORRECTION-CI4-LOOP-CLOSURE-B2-ACTIVATION-2026-06-14`, `D-MECHANISM-CORRECTION-TRAJECTORY-B1-ACTIVATION-2026-06-14`.

---

## ⛔ THE INVIOLABLE CONSTRAINTS (the spine of this build)

> 1. **Every already-issued credential keeps validating, throughout.** The four prefixes (`sr_live_`/`sr_inst_`/`sr_assent_`/the new `sr_prac_`) all keep authenticating; capabilities are read from the row regardless of prefix. **No issued integration token breaks.**
> 2. **`capabilities` is authoritative via `COALESCE(capabilities, preset_for(purpose))` — ZERO backfill is required for parity.** Existing rows (every one has a `NOT NULL DEFAULT 'ecosystem'` `purpose`) authorise byte-identically before any backfill runs.
> 3. **The new validator ships DARK behind `SUBSTRATE_UPC_CAPABILITY_AUTH_ENABLED` — UNSET = byte-identical.** Each legacy validator keeps its current `purpose`-filter fallback until the founder-elected flip.
> 4. **`purpose` is RETAINED** (nullable, diagnostic/legacy; its CHECK **widened, never dropped**). No existing CHECK or index is dropped this build. Additive + reversible only.
> 5. **Least-privilege write-class defaults:** a consult credential defaults to `{consult, l1_supply}` (`l1_supply` rides consult — it is the FX-3 closure, not a privilege grant). `accreditation_write`/`calling`/`reflect` are **opt-in, never defaulted on**.
> 6. **Out of scope, untouched:** the R18f provenance gate (capability checking is *additive* to it), the R20a perimeter, the distress classifier, the A5 wrapper, the Layer-2 signing algorithm/keys, the portable creator credential (A10 Surface-2), and per-install metering/quota.
> 7. **Per-capability transport narrowing travels with the capability, not the prefix:** `accreditation_write`/`calling`/`reflect` stay **Authorization-header-only** (today `sr_assent_` `security.ts:542`, `sr_inst_` Bearer-only `plugin-install-auth.ts:37`). Do not silently widen the attack surface.

**This is a multi-step Critical build; it will likely span more than one session.** Each Migration step is its own atomic 0c-ii micro-change. The founder elects scope at session-open. Steps 1–5 build the UPC **dark** (byte-identical); Step 6 (the cutover flip) and Step 7 are their own later 0c-ii steps.

---

## Why this build matters

CI-14 is the **last design item of the mechanism-correction arc**, now Accepted as an ADR. It consolidates the three credential classes (`sr_live_` ecosystem / `sr_inst_` per-install / `sr_assent_` accreditation-write) into **one Unified Practice Credential (UPC)** — one `public.api_keys` row keyed on the K1 composite `(owner_user_id, agent_id)`, carrying a `capabilities TEXT[]` set `{consult, l1_supply, accreditation_write, calling, reflect}` that replaces the `purpose` discriminator, validated through one `validatePracticeCredential` chokepoint. It **closes the FX-3 regression class + FX-17 by construction** (one credential carries the whole practice — no mid-run switch to drop state) and realises **SR-14** ("one credential across the agent's practice"). The opaque-bearer primitive is retained verbatim — the consolidation is at the identity+capability layer, not storage.

## Pre-conditions (verify at open — do not assume)
1. The B2 commit (`a9fb78e` or later) is pushed and Vercel is green; CI-4 (6a+6b detect) + the trajectory feature (B1) are Live. **The build must not break any of these live surfaces.**
2. **Path-check the current credential code before touching anything** (the ADR's "three classes today" table is the map; re-verify at `file:line`):
   - `website/src/lib/security.ts` — `validateApiKey` (~328), `validateSageAssentWriteToken` (~660), `extractRawKey`, the `sr_assent_` Authorization-only narrowing (~542).
   - `website/src/lib/plugin-install-auth.ts` — `validatePluginInstallToken` (~155), the Bearer-only narrowing (~37).
   - `website/src/app/api/admin/{api-keys,plugin-install-credentials,accreditation-credentials}/route.ts` — the three mint routes (note `api-keys/route.ts:141-142` leaves `owner_user_id` null + `agent_id?.trim() || null`).
   - `website/src/app/api/keys/route.ts` — the self-service mint (sets `owner_user_id`, `keys/route.ts:131`).
   - `website/src/lib/admin-mint/mint-credential-core.ts` + `website/scripts/mint-credential.ts` — the CI-7 mint surface; `classFromPrefix` (~273) treats prefix as display-only.
   - The `api_keys` schema + its A10/phase-3 migrations (the existing `sage_assent_write` unique index `supabase-api-keys-phase3-scope-rename-migration.sql:91-93`; the M6 `owner_user_id` null-owner comment `20260614_m6_agent_assessment_history.sql:176-180`).
   - The capability call-sites: `/api/reason` (consult + the CI-2 `layer1_schema` L1-supply path + `SUBSTRATE_L1_SCHEMA_KEY_PATH_ENABLED`), `/api/calling/route.ts:20`, `/api/practice/reflect/route.ts:18`.
3. `tsc --noEmit` clean at open; the substrate test suite green (run with `npx tsx`; the two Supabase-importing tests need `--env-file=.env.development.local`).
4. TEST Supabase is the live-verification target; the AI does **no git operations and no production changes** — the founder commits by name and performs every Vercel/Supabase action; the AI builds + walks each step live (PR17).
5. **Confirm the exact new flag name** the build introduces: `SUBSTRATE_UPC_CAPABILITY_AUTH_ENABLED` (UNSET = byte-identical). If a different spelling is elected, record it.

## Part A — Open under the protocol (read order)
1. `/adopted/standing-protocol-cache.md` + `/adopted/build-sessions-protocol-cache.md`
2. This prompt; the M8 close (the design) + the B2 close (most recent state)
3. **`adopted/adr/2026-06-14-credential-consolidation.md` IN FULL** (the spec — Decision §1–§6, Migration §1–§7, Consequences, Build sequencing)
4. `adopted/adr/2026-05-26-credential-scope-and-coverage-status.md` (K1 — the identity model) + `adopted/adr/2026-06-03-a10-token-format.md` (A10 — the opaque-bearer election this reaffirms)
5. `operations/p1-rebuild-2026-06/fresh-test-analysis.md` (FX-3 §:51, FX-17 §:81 — what the build must close) + `operations/p1-rebuild-2026-06/trajectory-retention-sweep-scope.md` (the sweep that consumes `owner_kind`; already Live from B1)
6. Path-check the current credential surfaces (pre-condition 2)

Confirm at open: tier (`code-critical`, full 0c-ii per step); hold-point (0h HELD — R&D-phase build, permissible under the hold; the cutover flip resolves nothing on its own); model; status vocabulary; that the AI does no git/production ops (PR17 walkthrough); the no-current-users simplification (founder + test logins only — Critical-protocol step 3 is "N/A").

## Critical Change Protocol (0c-ii) — covering every step below
1. **What is changing (plain language):** three additive `api_keys` columns + a widened `purpose` CHECK; a reversible backfill; a generalised unique index; one new `validatePracticeCredential` chokepoint the three legacy validators delegate to (dark behind a flag); a capability-aware mint; then a founder-elected cutover flip.
2. **What could break (specific failure modes):** the **single-chokepoint blast radius** — one validator bug fails `/api/reason` + `/api/calling` + `/api/practice/reflect` + plugin-install at once (mitigated: dark-ship flag + exhaustive assertion-parity against ALL legacy paths before any flip); a backfill that narrows a live capability (mitigated: ecosystem keys backfill `{consult, l1_supply}` not bare `{consult}` — bare would 403 their L1 supply and restate FX-3); a unique-index violation (mitigated: the `agent_id IS NOT NULL` guard + a zero-violator pre-check mirroring the existing 7e safety pattern); an owner mis-promotion (mitigated: `owner_user_id` set only on an **exact single** `owner_email→profiles` match; 0-or-≥2 = left null = external; conflicts reported, never auto-resolved — an R3 hazard).
3. **What happens to existing sessions:** **N/A** (founder + test logins only) — but **every issued credential keeps validating** (constraint 1).
4. **Rollback:** unset `SUBSTRATE_UPC_CAPABILITY_AUTH_ENABLED` (each validator reverts to its `purpose` filter — byte-identical); the additive columns/index are reversible (`DROP COLUMN`/`DROP INDEX`); no existing CHECK/index was dropped. `git revert` the code.
5. **Verification:** assertion-parity per legacy path on TEST, then the **leg-B replay** acceptance proof, then production — each its own 0c-ii. No step proceeds until the prior verifies.
6. **Explicit founder approval per named risk:** the AI states each step's specific risk (above) and gets the founder's go before the schema apply, the backfill, the validator flip, and the production cutover.

---

## Part B — The build (ADR Migration §1–§7 → steps; each its own 0c-ii)

### Step 1 — Additive schema (Standard, idempotent; TEST → prod)
`ALTER TABLE api_keys`: `ADD COLUMN capabilities TEXT[]` (CHECK members ⊆ `{consult, l1_supply, accreditation_write, calling, reflect}`); `ADD COLUMN owner_kind TEXT CHECK (owner_kind IN ('operator','external_consumer')) NOT NULL DEFAULT 'operator'`; `ADD COLUMN credential_provenance jsonb`; **widen (never drop)** the `purpose` CHECK; make `purpose` nullable. No existing CHECK/index dropped. Existing rows unchanged (read back via the COALESCE in Step 4) — **no behaviour change.**
- **Verify:** the three columns + the widened CHECK present on TEST (then prod, a later 0c-ii); a tsx column-probe; `tsc` clean.

### Step 2 — Reversible backfill (Standard; TEST → prod, dry-run first)
Derive `capabilities` from `purpose`: `'ecosystem' → {consult, l1_supply}`; `'plugin_install' → {consult, l1_supply}`; `'sage_assent_write' → {accreditation_write, calling, reflect}`. **Ecosystem keys get `l1_supply`, NOT bare `{consult}`** (the FX-3 closure for the backfilled population; verify the `SUBSTRATE_L1_SCHEMA_KEY_PATH_ENABLED`-on population is not silently narrowed). Set `owner_kind`: legacy admin `sr_live_` null-owner rows → `'external_consumer'`; self-service `/api/keys` + admin install/assent rows → `'operator'`. **Subsumes the `sr_live_`-owner backfill:** change `/api/admin/api-keys` to set `owner_user_id` only on an **exact single** case-normalised `owner_email→profiles` match (0/≥2 = null = external); a **dry-run report** lists every `owner_email` with >1 matching profile as a non-promotable conflict (never mis-promote — R3).
- **Verify:** dry-run report reviewed (founder); post-backfill, every row's effective capability set == its legacy authorisation (assertion check).

### Step 3 — Generalised unique index (Elevated; TEST → prod, zero-violator pre-check)
Add `api_keys_upc_owner_agent_active_uniq ON api_keys (owner_user_id, agent_id) WHERE is_active = true AND owner_user_id IS NOT NULL AND agent_id IS NOT NULL`. The `agent_id IS NOT NULL` guard is load-bearing (legacy/self-service/install mints leave `agent_id` null). Precede with a zero-violator pre-check (mirror the existing migrations' 7e pattern).
- **Verify:** the pre-check returns zero violators on TEST + prod before the index is created; the existing `sage_assent_write` index proves assent rows are clean.

### Step 4 — Single validator, flag-gated (Critical — AC7/PR6; the heart of the build)
Build `validatePracticeCredential(rawToken, requiredCapability, scopeContext?)`: one indexed `key_hash` lookup of the active row → `is_active` (universal revocation, unchanged) → `requiredCapability ∈ capabilities` (via `COALESCE(capabilities, preset_for(purpose))`) else `403 insufficient_capability` → apply the capability-scoped scope + the per-capability transport narrowing (constraint 7). Refactor `validateApiKey` / `validatePluginInstallToken` / `validateSageAssentWriteToken` into **thin capability-asserting wrappers** over it **without changing their external signatures**. Widen the extractors to accept all four prefixes. Ship behind `SUBSTRATE_UPC_CAPABILITY_AUTH_ENABLED` (**UNSET = byte-identical** — each wrapper keeps its current `purpose`-filter fallback).
- **Verify:** **exhaustive assertion-parity** with the flag OFF and ON against every legacy path — consult via `sr_live_` **and** `sr_inst_`; the CI-2 `l1_supply` path; write + calling + reflect via `sr_assent_` (unscoped); negative cases (`403 insufficient_capability` when a capability is absent; transport-narrowing rejections). Adversarial review of the chokepoint before any flip.

### Step 5 — Capability-aware mint (Elevated; dark)
Extend `/api/admin/api-keys` + `/api/keys` + `mint-credential-core.ts` + the CI-7 CLI to accept `capabilities[]` (default `{consult, l1_supply}`; write-class opt-in, never defaulted) + `owner_kind`. The three legacy admin routes become **thin shims** minting a UPC with their fixed capability subset (back-compat for any caller/script; **preserve the CI-6 30/1/1 consult defaults**). New mints may issue the `sr_prac_` prefix (founder may elect to reuse `sr_live_` — a copy decision, not security).
- **Verify:** mint a UPC via the CLI on TEST carrying all five capabilities → use it across all five surfaces → revoke → 401 everywhere (one credential live).

### Step 6 — Founder-elected cutover (Critical; its own 0c-ii — likely a SEPARATE session)
Flip `SUBSTRATE_UPC_CAPABILITY_AUTH_ENABLED` on TEST → run the assertion suites + **the leg-B replay** (the three-credential scenario re-run on ONE credential carrying `{consult, l1_supply, accreditation_write, calling, reflect}`) as the **FX-3/FX-17 acceptance proof** → then production, each its own 0c-ii. Re-anchor the install/assent invariant CHECK predicates from `purpose` to `capabilities` **only after** cutover is stable (transition predicate accepts BOTH meanwhile).
- **Rollback:** unset the flag (byte-identical).

### Step 7 — Retention follow-up (Standard)
The trajectory-retention sweep is **already Live** (B1) — confirm `owner_kind` is **NOT** a sweep predicate (a universal `retain_until < now()` purge; owner-narrowing would let owner-bearing rows accumulate past 90 days). Add an **on-demand consumer-erasure-by-token** path for the `owner_kind='external_consumer'` case (their only deletion path besides the sweep). `owner_kind='operator'` rows also ride the user-JWT data-rights + cascade.

---

## The acceptance proof (CI-14 founder-verification)
1. **The leg-B replay:** the three-credential leg-B scenario (`sr_inst_` for reason → `sr_live_` mid-run → `sr_assent_` for the write) re-run on **ONE** credential carrying the full capability set — FX-3 (no silent L1-supply loss; no double-L1 billing) + FX-17 (no mid-run switch — structurally unrepresentable) closed.
2. **One credential, five surfaces:** mint → use across `/api/reason` (consult + `l1_supply`), `/api/accreditation/[agent_id]`, `/api/calling`, `/api/practice/reflect` → revoke → 401 everywhere.

## What is NOT in scope (do not pull in)
Prefix retirement (a separate decision gated on "zero active legacy-prefix credentials in the wild"); the portable creator credential (A10 Surface-2 — W3C-VC/AP2, deferred); per-install metering/quota (deferred to first paid agent); any R18f / R20a / distress-classifier / A5 / Layer-2-signing change (untouched — capability checking is additive to R18f). Also untouched this build: the CI-4 loop-closure gates, the trajectory write/read, the M1/M3-CI-11/M4/M5-CI-13 activations, CI-16, the 0h call.

## Rollback (summary)
Every code/flag step = **unset `SUBSTRATE_UPC_CAPABILITY_AUTH_ENABLED`** (byte-identical) and/or `git revert`. The additive columns + index are reversible (`DROP`); no existing CHECK/index was dropped; `purpose` + all four prefixes keep validating throughout.

## Forecast
Success: the UPC is **built dark and TEST-verified** (Steps 1–5 byte-identical, assertion-parity green) — one `api_keys` row keyed on `(owner_user_id, agent_id)` with a `capabilities[]` set, one validator chokepoint, `owner_kind` declared, capability-aware mint — with the cutover flip (Step 6) and the consumer-erasure path (Step 7) staged as their own later 0c-ii steps. The leg-B replay is the acceptance proof. Remaining after a full cutover: prefix retirement (future), the portable creator credential (deferred), the M1/M3/M4/M5 activations, CI-16, the 0h call. **This closes the mechanism-correction arc's last build item.**

End of prompt. Open on `main`; the AI does no git/production operations; the new validator is byte-identical when `SUBSTRATE_UPC_CAPABILITY_AUTH_ENABLED` is unset; every already-issued credential keeps validating throughout; nothing proceeds out of the additive/reversible/flag-gated order.
