# Next-Session Prompt — Credential Consolidation (CI-14) **Step 6**: the founder-elected cutover + leg-B replay

**Stream:** founder. **Model:** session default, maximum reasoning. **Environment:** Claude Code on the founder's machine (TEST **and production** reachable).
**Tier:** **`code-critical`** — flipping the authentication-surface validator (AC7 + PR6). Full templates + Critical Change Protocol (0c-ii). This is the highest-blast-radius step of the CI-14 build: one flag turns the single `validatePracticeCredential` chokepoint live across `/api/reason`, `/api/calling`, `/api/practice/reflect`, plugin-install, and the accreditation write boundary at once.
**Governing frame:** `/adopted/standing-protocol-cache.md` + `/adopted/build-sessions-protocol-cache.md`. PR1; PR17 (every Vercel/Supabase step walked live); PR18 at close.
**Spec:** `adopted/adr/2026-06-14-credential-consolidation.md` Migration §6 (+ §7). **Predecessor close:** `operations/handoffs/founder/2026-06-15-credential-consolidation-CI14-build-dark-close.md`. **Decision:** `D-CI14-UPC-BUILD-DARK-STEPS-1-5-TEST-VERIFIED-2026-06-15`.

---

## Pre-conditions (verify at open)
1. The dark build (Steps 1–5) is committed + pushed + Vercel green; `SUBSTRATE_UPC_CAPABILITY_AUTH_ENABLED` is **UNSET** in both environments (production byte-identical).
2. The UPC schema (Steps 1–3) is on **TEST** (verified at the dark-build close). It is **NOT yet on production** — Step 6 applies it to prod before the prod flip.
3. `tsc --noEmit` clean; the credential suites green (security 20, plugin-install 22, mint-core 54, api-key-defaults 8, accreditation route 90, practice-credential 29) — run with `node_modules/.bin/tsx <file> > /tmp/x 2>&1; tail -2 /tmp/x` (the security-importing ones keepalive-hang; never `| tail`).
4. The AI does **no git/production ops**; the founder commits by name and performs every Vercel/Supabase action; the AI builds + walks each step live.

## The inviolable constraints (unchanged from the build)
Every issued credential keeps validating throughout; rollback for the flip = **unset the flag** (byte-identical); the R18f provenance gate / R20a / distress / Layer-2 signing stay untouched; the write-class transport narrowing stays Authorization-Bearer-only.

## Part B — the cutover (each sub-step its own 0c-ii gate)

### 6a — TEST flip + assertion suites
Set `SUBSTRATE_UPC_CAPABILITY_AUTH_ENABLED=true` in `website/.env.development.local` (TEST). Re-run the credential suites flag-ON; confirm green. (Flag-off byte-identity is already proven; this proves flag-on parity against the real TEST schema.)

### 6b — the leg-B replay (the FX-3 / FX-17 acceptance proof)
With the flag ON on TEST: mint **ONE** `sr_prac_` UPC carrying `{consult, l1_supply, accreditation_write, calling, reflect}` bound to a test `agent_id`, owner = a TEST profile (needs a `profiles` row — see memory `test-admin-needs-profiles-row`). Then re-run the leg-B three-credential scenario on that **single** credential:
- `/api/reason` consult (the credential that was `sr_inst_`) + supply `layer1_schema` (the `l1_supply` surface — needs `SUBSTRATE_L1_SCHEMA_KEY_PATH_ENABLED=true` on TEST too) → no silent L1-supply loss, no double-L1 billing (**FX-3 closed**);
- the mid-run credential switch that leg-B required is **structurally unrepresentable** (one credential) (**FX-17 closed**);
- `/api/accreditation/[agent_id]` write (Bearer), `/api/calling` (Bearer), `/api/practice/reflect` (Bearer) all on the same credential;
- **revoke** the one credential → 401 on all five surfaces.
Capture the run as the acceptance proof. Mint via the CI-7 CLI `mint practice --capabilities consult,l1_supply,accreditation_write,calling,reflect --agent-id <id> --owner-email <test-admin-email>` (CLI `Target:` must read TEST — memory `mint-cli-env-file-export-leak`).

### 6c — route-level transport regression test (deferred from the build's adversarial review)
Add an assertion-level test proving a write-capable `sr_prac_` presented via **X-Api-Key** to `/api/calling` / `/api/practice/reflect` / accreditation is rejected (the surfaces read Authorization-Bearer only), and that the same credential via Bearer succeeds. Plus a `validateApiKeyUpc` test locking the `consult` requirement (a non-consult credential → 403 insufficient_capability).

### 6d — production cutover (its own 0c-ii)
Apply Steps 1–3 migration SQL to **production** (additive/reversible; run each VERIFY block); then set `SUBSTRATE_UPC_CAPABILITY_AUTH_ENABLED=true` in Vercel. Smoke-test a real consult + a real write on prod with a throwaway `sr_prac_` UPC; revoke + teardown. **Rollback:** unset the flag (byte-identical); the columns/index stay.

### 6e — post-cutover invariant re-anchor (only after cutover is stable)
Re-anchor `api_keys_sage_assent_write_requires_owner_and_agent` + `api_keys_plugin_install_requires_identity` + the per-purpose unique/lookup indexes from `purpose` to `capabilities` (transition predicate accepts BOTH meanwhile). This is a later step, not part of the flip.

## Acceptance proof (CI-14 founder-verification)
1. The leg-B replay on one credential (FX-3 + FX-17 closed).
2. One credential, five surfaces: mint → use across `/api/reason` (consult + `l1_supply`) + `/api/accreditation/[agent_id]` + `/api/calling` + `/api/practice/reflect` → revoke → 401 everywhere.

## What is NOT in scope
Prefix retirement (future); the portable creator credential (deferred A10 Surface-2); per-install metering/quota (deferred); any R18f/R20a/distress/A5/Layer-2-signing change. Step 7 (consumer-erasure-by-token for `owner_kind='external_consumer'`) is a separate small follow-up.

## Rollback (summary)
Unset `SUBSTRATE_UPC_CAPABILITY_AUTH_ENABLED` (byte-identical — each validator reverts to its `purpose`-filter body) and/or `git revert`. The additive columns/index are reversible; no existing CHECK/index was dropped; all four prefixes keep validating.

## Forecast
Success: the UPC chokepoint is **Live** — one credential carries the whole practice; FX-3's class + FX-17 are closed by construction; the leg-B replay is the recorded proof. Remaining after: 6e re-anchor, Step 7, prefix retirement (future), the M1/M3/M4/M5 activations, CI-16, the 0h call. **This closes the mechanism-correction arc's last build item.**

End of prompt. Open on `main`; the AI does no git/production operations; nothing proceeds out of the additive/reversible/flag-gated order; every already-issued credential keeps validating throughout.
