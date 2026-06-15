# Session Close — 2026-06-15 — Credential Consolidation (CI-14) **Step 6**: the Unified Practice Credential is LIVE in production

**Stream:** founder.
**Governing frame:** `/adopted/standing-protocol-cache.md` + `/adopted/build-sessions-protocol-cache.md`. PR1 (prove on one surface first). PR17 (every founder Supabase/Vercel step walked live). PR18 at close.
**Tier:** **`code-critical`** — authentication-surface flag activation (AC7 + PR6). Full templates + Critical Change Protocol (0c-ii) per sub-step.
**Environment:** Claude Code on the founder's machine (TEST **and production** reachable). Model: Opus 4.8 (1M).
**Date:** 2026-06-15.
**Operative prompt:** `operations/handoffs/founder/2026-06-15-credential-consolidation-CI14-step6-cutover-NEXT-SESSION-PROMPT.md`.
**Spec:** `adopted/adr/2026-06-14-credential-consolidation.md` Migration §6 (+ §7). **Predecessor close:** `operations/handoffs/founder/2026-06-15-credential-consolidation-CI14-build-dark-close.md` (the dark build this activates).

## What this session did

Executed the **Step 6 cutover** — flipped `SUBSTRATE_UPC_CAPABILITY_AUTH_ENABLED` to `true` in production after applying the UPC schema (Steps 1–3) to prod. **The single `validatePracticeCredential` chokepoint is now the live auth path** across `/api/reason` consult, `/api/calling`, `/api/practice/reflect`, plugin-install, and the accreditation write boundary. **FX-3's class + FX-17 are closed by construction, confirmed live on prod.** This is the last build item of the mechanism-correction arc.

- **6a — TEST flag-on parity.** All six credential suites green with the flag globally ON (223 assertions, 0 fail) — no suite assumed flag-off as the process default.
- **6b — leg-B replay (FX-3/FX-17 acceptance proof).** One `sr_prac_` UPC (`{consult,l1_supply,accreditation_write,calling,reflect}`, agent `legb:upc-replay@v1`, owner-promoted) across every surface, then revoked: consult+`layer1_schema` → 200 `meta.layer1_source=supplied` (no double-L1); accreditation/calling/reflect (Bearer) accepted; X-Api-Key on a write surface → 401 (constraint 7 live); revoke → 401 everywhere. FX-17: one credential, no mid-run switch — structurally unrepresentable. Proof: `operations/p1-rebuild-2026-06/ci14-step6-legb-replay-proof.md`.
- **6c — transport regression test.** `website/src/lib/__tests__/upc-transport-narrowing.test.ts` (19/0) — a source-invariant lock proving the three write-class routes never read `x-api-key` for the credential, `sr_prac_` is flag-gated, and `/api/reason` accepts both transports. (The behavioural transport proof is 6b's live X-Api-Key→401-vs-Bearer→200; the consult-requirement is locked at the chokepoint, `practice-credential.test.ts:246`.)
- **6d — production cutover.** Steps 1–3 schema applied to prod (every VERIFY block founder-walked green); flag flipped in Vercel + redeployed; smoke-tested live on a throwaway `sr_prac_` (consult 200 + write accepted + revoke→401).

**Defect found + fixed (surfaced by the live replay):** the CLI `summariseMintResponse` dropped the `sr_prac_` token (treated `practice` like the install/assent response shape; `practice` mints via the api-keys `{api_key,...}` shape). Fixed (`'api' || 'practice'`) + regression-locked (SM-4 + CP-5; mint-core 54→56). Display-only — the credential always minted correctly.

**Method (ultracode):** a 6-agent/3-dimension pre-cutover adversarial workflow before the flip (byte-identity / migration-parity / prod-data-parity) → **GO-with-conditions, 0 upheld findings**; the conditions were the live prod-data eyeball gates, all green.

## Decisions Made
- `D-CI14-UPC-CUTOVER-STEP6-LIVE-2026-06-15` appended (full Critical form).

## Status Changes
| Item | Old | New |
|---|---|---|
| CI-14 Unified Practice Credential | Built dark (TEST-verified) | **LIVE in production** |
| `SUBSTRATE_UPC_CAPABILITY_AUTH_ENABLED` | UNSET everywhere | **`true` in Vercel production** |
| `api_keys` UPC schema (columns/backfill/index) | TEST only | **applied + verified on production** |
| CI-14 cutover (Step 6) | pending | **complete (6a–6d Verified)** |
| Mechanism-correction arc — build items | last item open (CI-14) | **all build items complete** |
| `summariseMintResponse` (CLI) | dropped `sr_prac_` token | **fixed + regression-locked (56/0)** |

## Verification Method Used
- **6a flag-on (live suites):** practice-credential 29/0, security 20/0, plugin-install 22/0, api-key-defaults 8/0, mint-core 56/0, accreditation route 90/0 (with `--env-file`).
- **6b leg-B replay (live TEST harness):** one UPC, five capabilities, all surfaces accepted → revoke → denied; FX-3 (`layer1_source=supplied`) + FX-17 + constraint-7 (X-Api-Key→401) live.
- **6c:** transport-narrowing source-invariant test 19/0.
- **Post-6c flag-off byte-identity:** tsc 0 · 29 · 56 · 8 · 20 · 22 · 90 · 19.
- **6d prod (PR17 founder-walked):** Step-1 §0/§5, Step-2 §0/§2 (`consult_without_l1_supply=0`), Step-3 §0/§2 (zero violators), flag flip + redeploy, smoke test (consult 200 / write 400-accepted / revoke `is_active:false`).
- **Pre-cutover adversarial workflow:** 6 agents, GO-with-conditions, 0 upheld findings.

## Risk Classification Record
**Critical** under 0d-ii + PR6 + AC7 (authentication-surface flag activation). AC7 ENGAGED (the chokepoint is now the live auth path). The R18f provenance gate, R20a perimeter, distress classifier, A5 wrapper, Layer-2 signing — **untouched** (capability checking is additive). Rollback = unset `SUBSTRATE_UPC_CAPABILITY_AUTH_ENABLED` in Vercel + redeploy (instant, byte-identical); the additive schema stays.

## Next Session Should
The arc's build is done. Remaining CI-14 follow-ups (each its own session, none blocking): **6e** — re-anchor the install/assent invariant CHECK predicates + per-purpose indexes from `purpose` to `capabilities` (transition predicate accepts BOTH meanwhile); **Step 7** — on-demand consumer-erasure-by-token for `owner_kind='external_consumer'`. Carried unchanged: the M1/M3-CI-11/M4/M5 doc/flag activations; parked CI-16; **the 0h call** (the gating launch item — the bare-vs-harnessed verdict was "no benefit"; the founder's branch decision remains the blocker). Prefix retirement + the portable creator credential + per-install metering stay deferred.

## Blocked On
**Files remaining uncommitted (the founder commits by name; the AI did no git ops):**
- NEW: `website/src/lib/__tests__/upc-transport-narrowing.test.ts`, `operations/p1-rebuild-2026-06/ci14-step6-legb-replay-proof.md`, this close
- CHANGED: `website/src/lib/admin-mint/mint-credential-core.ts` (CLI fix), `website/src/lib/admin-mint/__tests__/mint-credential-core.test.ts` (SM-4, CP-5), `website/supabase-api-keys-upc-step1-additive-migration.sql` (§0 fresh-table fix), `operations/decision-log.md`, `CLAUDE.md` (PR18 refresh)
- **Exclude:** `website/tsconfig.tsbuildinfo`; never stage `.env*` (the TEST flags I added were torn down — `.env.development.local` is restored to baseline + is gitignored anyway).

**Production state at session close:** **CI-14 UPC is LIVE.** `SUBSTRATE_UPC_CAPABILITY_AUTH_ENABLED=true` in Vercel production; the prod `api_keys` table carries the UPC columns + backfill (21 rows: 8 ecosystem [6 external/2 operator], 9 sage_assent_write, 4 plugin_install) + the `api_keys_upc_owner_agent_active_uniq` index. The three legacy validators delegate to the chokepoint; all four prefixes validate. The deployed code is `dbcf6bd` (+ this session's auth-path-neutral commit once pushed). The four R20a flags, B1 trajectory, B2 CI-4, CI-10 gate metering remain Live, untouched.

## Open Questions
- 6e re-anchor + Step 7 erasure-by-token (carried; non-blocking).
- `/api/reason` collapses 403-suspended / 429-quota to a uniform 401 (route auth-fallback) — pre-existing, unchanged by UPC; noted only.
- `/api/keys` self-service 100/100/1 vs admin 30/1/1 — carried fold-or-record.

## PR5 Knowledge-Gap Carry-Forward
- **Migration §0 pre-checks must be fresh-table-safe.** The Step-1 §0 referenced `capabilities IS NOT NULL` before the column existed → `42703` on the un-migrated prod table. Fixed in-file (split into a purpose-population count + an `information_schema` idempotency guard). Standing lesson: an informational pre-check that doubles as a re-run guard must not reference the columns the migration itself adds.
- **Mint-CLI creds don't persist across commands.** Inline `VAR=… node_modules/.bin/tsx …` creds apply to that one command only; a follow-up revoke in the same shell without re-supplying them defaults to `localhost:3000` + "Missing auth environment" and **silently fails to revoke** (the key stays active). Verify `Target:` on every prod mint/revoke; `export` once for a prod-only terminal (then open a fresh terminal before any TEST work — the `--env-file` export-leak still cuts the other way). Memory `mint-cli-env-file-export-leak` updated.
- **tsx + `security.ts` keepalive** (carried): redirect-to-file + read the summary, never `| tail`; never use foreground `sleep` (blocked — aborts the command).

## Founder Verification (Between Sessions)
```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/website"
npx tsc --noEmit                                                                          # exit 0
node_modules/.bin/tsx src/lib/__tests__/upc-transport-narrowing.test.ts > /tmp/tn.txt 2>&1; tail -1 /tmp/tn.txt   # 19/0
node_modules/.bin/tsx src/lib/admin-mint/__tests__/mint-credential-core.test.ts > /tmp/m.txt 2>&1; tail -2 /tmp/m.txt  # 56/0 (keepalive-hangs — read the file)
```
Then commit (by name) + push via GitHub Desktop. **Vercel will redeploy with the committed code (CLI fix + 6c test + §0 SQL fix — all auth-path-neutral); the flag stays on, behaviour unchanged.** The cutover itself is already live (Vercel env + prod schema, both founder-performed this session).

## Orchestration Reminder
The flip is the Vercel env var (`SUBSTRATE_UPC_CAPABILITY_AUTH_ENABLED=true`, already set) + the prod schema (already applied). This commit carries **code + docs only** — none of it changes the live auth path. Rollback = unset the Vercel var + redeploy (byte-identical); the additive schema stays (reversible via the inverse blocks, only while no `sr_prac_` row with NULL purpose exists — and UPC rows carry `purpose='unified_practice'`, so the schema rollback's NOT-NULL restore would need those rows cleared first; not a flip-day concern).

## Cross-references
- `D-CI14-UPC-CUTOVER-STEP6-LIVE-2026-06-15` (the authoritative record)
- `D-CI14-UPC-BUILD-DARK-STEPS-1-5-TEST-VERIFIED-2026-06-15` (the dark build this activates)
- `adopted/adr/2026-06-14-credential-consolidation.md` (the spec, Migration §6)
- `operations/p1-rebuild-2026-06/ci14-step6-legb-replay-proof.md` (the FX-3/FX-17 acceptance proof)
- `operations/handoffs/founder/2026-06-15-credential-consolidation-CI14-step6-cutover-NEXT-SESSION-PROMPT.md` (the prompt this close answers)
- `operations/handoffs/founder/2026-06-15-credential-consolidation-CI14-build-dark-close.md` (predecessor)

*End of session close. The Unified Practice Credential is Live in production: the prod schema is migrated + verified, the validator chokepoint is the live auth path, the leg-B replay proved one credential across the whole practice (FX-3 + FX-17 closed), and the prod smoke test confirmed consult/write acceptance + universal revocation. This closes the mechanism-correction arc's last build item. The founder commits by name; the only remaining CI-14 work (6e re-anchor, Step 7 erasure) is non-blocking follow-up.*
