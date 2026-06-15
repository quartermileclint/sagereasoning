# Session Close — 2026-06-15 — Credential Consolidation (CI-14): the Unified Practice Credential built DARK (Steps 1–5)

**Stream:** founder.
**Governing frame:** `/adopted/standing-protocol-cache.md` + `/adopted/build-sessions-protocol-cache.md`. PR1 (prove on one surface first). PR17 (every founder Supabase step walked live). PR18 at close.
**Tier:** **`code-critical`** — authentication surface (AC7 + PR6). Full templates + Critical Change Protocol (0c-ii) per step.
**Environment:** Claude Code on the founder's machine (TEST Supabase reachable). Model: Opus 4.8 (1M).
**Date:** 2026-06-15.
**Operative prompt:** `operations/handoffs/founder/2026-06-14-credential-consolidation-CI14-BUILD-NEXT-SESSION-PROMPT.md`.
**Spec:** `adopted/adr/2026-06-14-credential-consolidation.md` (CI-14 ADR, Accepted).
**Predecessor closes:** `operations/handoffs/founder/2026-06-14-mechanism-correction-M8-credential-consolidation-close.md` (design); `operations/handoffs/founder/2026-06-14-trajectory-ci4-B2-activation-close.md` (most recent — CI-4 Live).

## What this session did

Built the **Unified Practice Credential (UPC)** dark — **Steps 1–5 of the ADR migration** — on its own Critical track. Founder-elected scope at open: **full dark build (Steps 1–5)**, new **`sr_prac_`** prefix. Production is byte-identical: the new flag `SUBSTRATE_UPC_CAPABILITY_AUTH_ENABLED` is UNSET everywhere; only the TEST schema changed.

- **Step 1 — additive schema (TEST applied + verified).** `ALTER api_keys` ADD `capabilities TEXT[]` (CHECK ⊆ `{consult,l1_supply,accreditation_write,calling,reflect}`), `owner_kind TEXT NOT NULL DEFAULT 'operator'` (CHECK), `credential_provenance jsonb`; `purpose` made nullable + CHECK widened (never dropped) to admit `unified_practice`. The two load-bearing invariants untouched. (`website/supabase-api-keys-upc-step1-additive-migration.sql`; the `DO $$ … EXCEPTION` blocks were re-authored to plain `DROP IF EXISTS`/`ADD` after a SQL-editor partial-run.) Verified: 16 rows, all `owner_kind='operator'`, `capabilities` NULL.
- **Step 2 — reversible backfill (TEST, dry-run first + verified).** `ecosystem`/`plugin_install → {consult,l1_supply}`; `sage_assent_write → {accreditation_write,calling,reflect}`; `owner_kind='external_consumer'` for null-owner rows. (`…step2-backfill-migration.sql`.) Result: 11 `ecosystem/{consult,l1_supply}/external_consumer` + 5 `sage_assent_write/{…}/operator`; FX-3 closure check `consult_without_l1_supply = 0`; unmapped `0`; clean owner_kind partition.
- **Step 3 — generalised unique index (TEST, zero-violator pre-check + verified).** `api_keys_upc_owner_agent_active_uniq (owner_user_id, agent_id) WHERE is_active AND owner_user_id IS NOT NULL AND agent_id IS NOT NULL`. (`…step3-unique-index-migration.sql`.) Pre-check returned zero; index created clean; the pre-existing `sage_assent_write` index intact.
- **Step 4 — the single validator chokepoint (built dark, AC7 heart).** New `website/src/lib/practice-credential.ts`: the capability vocabulary, `presetForPurpose`, `effectiveCapabilities` (= `COALESCE(capabilities, preset_for(purpose))`), the pure `evaluatePracticeCredentialRow`, the async `validatePracticeCredential`, `isUpcCapabilityAuthEnabled`. `validateApiKey` / `validateSageAssentWriteToken` / `validatePluginInstallToken` refactored into **thin capability-asserting wrappers** — each keeps its **verbatim legacy body** under `if (!flag)` and delegates under flag-on (`validateApiKey`→`consult`; `validateSageAssentWriteToken`→default `accreditation_write`, calling/reflect pass `calling`/`reflect`; `validatePluginInstallToken`→`consult`). Extractors widened to `sr_prac_` flag-gated, preserving the write-class Authorization-Bearer-only narrowing (constraint 7).
- **Step 5 — capability-aware mint (built dark).** `/api/admin/api-keys` POST gains an **additive UPC mode** (when `capabilities[]` is supplied → mint `sr_prac_` + `purpose='unified_practice'` + `owner_kind` + `credential_provenance` + exact-single-match `owner_email→profiles` promotion); the legacy `sr_live_` path is byte-identical. The CI-7 CLI gains a `practice` class (`mint-credential-core.ts`); `classFromPrefix`/`buildRevokePlan` recognise `sr_prac_`.

**Method (ultracode):** an 8-agent path-check at session open (every credential surface verified at `file:line`, adversarially cross-checked against the ADR); a **6-dimension/12-agent adversarial review** of the chokepoint before any flip (0 critical/high/medium; the real low + the comment nit fixed in-session; a coverage-gap low partially closed with the route-level test deferred to Step 6).

## Decisions Made
- `D-CI14-UPC-BUILD-DARK-STEPS-1-5-TEST-VERIFIED-2026-06-15` appended (full Critical form).

## Status Changes
| Item | Old | New |
|---|---|---|
| CI-14 credential consolidation | Designed (ADR adopted) | **Built dark — Steps 1–5; TEST schema verified; assertion-parity green; adversarially reviewed** |
| `api_keys` UPC schema (capabilities/owner_kind/credential_provenance/index) | — | **Applied + verified on TEST** (prod = later 0c-ii) |
| `validatePracticeCredential` chokepoint + 3 wrappers | — | **Built dark** (flag UNSET = byte-identical) |
| Capability-aware mint + `sr_prac_` | — | **Built dark** |
| CI-14 cutover (flip + leg-B replay) | — | **Step 6 — its own later 0c-ii session** |

## Verification Method Used
- **Flag-off byte-identity (live suites):** security 20/0, plugin-install-auth 22/0, mint-credential-core 54/0 (+10 new `practice` cases), api-key-defaults 8/0, accreditation route 90/0.
- **Flag-on capability logic (new unit suite):** `practice-credential.test.ts` 29/0 — incl. the leg-B-at-unit-level proof (one `unified_practice` credential serves all five capabilities) + least-privilege (consult-only UPC refused write/calling/reflect) + cross-class denial both directions.
- **`tsc --noEmit` exit 0; `npm run build` exit 0** (×2 — the four `route.ts` changes validated).
- **TEST schema (PR17 founder-walked):** Steps 1–3 applied + each VERIFY block reviewed.
- **Adversarial review:** 6-dimension/12-agent workflow, every finding independently verified (2 refuted).

## Risk Classification Record
**Critical** under 0d-ii + PR6 + AC7 (authentication surface). AC7 ENGAGED (the validator chokepoint). The R18f provenance gate, R20a perimeter, distress classifier, A5 wrapper, Layer-2 signing — **untouched** (capability checking is additive). No flag activated; production byte-identical. Rollback = unset `SUBSTRATE_UPC_CAPABILITY_AUTH_ENABLED` + `git revert`; additive columns/index reversible.

## Next Session Should
**Step 6 — the founder-elected cutover** (its own Critical 0c-ii session). Prompt: `operations/handoffs/founder/2026-06-15-credential-consolidation-CI14-step6-cutover-NEXT-SESSION-PROMPT.md`. Flip `SUBSTRATE_UPC_CAPABILITY_AUTH_ENABLED` on TEST → run the assertion suites + the **leg-B replay** (three-credential scenario re-run on ONE `sr_prac_` UPC carrying all five capabilities) as the FX-3/FX-17 acceptance proof + the route-level X-Api-Key transport regression test → then production (Steps 1–3 schema on prod, then the flag). Re-anchor the install/assent invariant CHECK predicates from `purpose` to `capabilities` only after cutover is stable. **Step 7** (consumer-erasure-by-token) follows.

## Blocked On
**Files remaining uncommitted (the founder commits by name; the AI did no git ops):**
- NEW: `website/src/lib/practice-credential.ts`, `website/src/lib/__tests__/practice-credential.test.ts`, the three `website/supabase-api-keys-upc-step{1,2,3}-*.sql`
- CHANGED: `website/src/lib/security.ts`, `website/src/lib/plugin-install-auth.ts`, `website/src/lib/admin-mint/mint-credential-core.ts` (+ its test), `website/src/app/api/admin/api-keys/route.ts`, `website/src/app/api/reason/route.ts`, `website/src/app/api/calling/route.ts`, `website/src/app/api/practice/reflect/route.ts`, `website/src/app/api/accreditation/[agent_id]/route.ts`
- DOCS: `operations/decision-log.md`, this close, the Step-6 prompt, `CLAUDE.md` (PR18 refresh), the build prompt (`…CI14-BUILD-NEXT-SESSION-PROMPT.md`)
- **Exclude:** `website/tsconfig.tsbuildinfo`; never stage `.env*`.

**Production state at session close:** **unchanged** — no code on prod is behaviourally different (the chokepoint is dead with the flag UNSET; the admin-mint UPC mode only fires when `capabilities[]` is supplied; the `/api/reason` l1_supply gate is behind the flag). The TEST `api_keys` table now carries the UPC columns + backfill + index (inert dark). The four R20a flags, B1 trajectory, B2 CI-4, CI-10 remain Live. **No production schema change** (TEST only).

## PR5 Knowledge-Gap Carry-Forward
- **Supabase SQL-editor partial-run on `DO $$ … EXCEPTION` blocks:** Step 1's first run applied only the first section. Switching constraint adds to plain `DROP CONSTRAINT IF EXISTS` + `ADD` (the phase3 idiom) is the robust pattern for hand-run migrations. (Recorded in the Step-1 migration header.)
- **tsx tests importing `security.ts` hang after printing** (the module-level `setInterval` keepalive) — redirect-to-file + read the summary, never `| tail`; foreground `sleep`/`Monitor` `sleep` is blocked in this shell. (Memory `tsx-tests-setinterval-keepalive-hang` saved.)

## Founder Verification (Between Sessions)
```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/website"
npx tsc --noEmit                                          # exit 0
npm run build                                             # exit 0
node_modules/.bin/tsx src/lib/__tests__/practice-credential.test.ts > /tmp/pc.txt 2>&1; tail -2 /tmp/pc.txt   # 29/0
node_modules/.bin/tsx src/lib/__tests__/security.test.ts        > /tmp/s.txt  2>&1; tail -2 /tmp/s.txt         # 20/0
node_modules/.bin/tsx src/lib/admin-mint/__tests__/mint-credential-core.test.ts > /tmp/m.txt 2>&1; tail -2 /tmp/m.txt  # 54/0
```
Then commit (by name) + push via GitHub Desktop. **Vercel deploy is behaviourally inert** — no flag, no prod schema. **Optional TEST teardown:** the UPC columns/backfill/index on TEST are inert and feed Step 6's leg-B replay — leave them in place.

## Orchestration Reminder
The flip is a Vercel env var (`SUBSTRATE_UPC_CAPABILITY_AUTH_ENABLED`), set in Step 6, not this commit. Rollback for the eventual flip = unset it (byte-identical). This commit carries code + TEST-migration SQL + docs only.

## Cross-references
- `D-CI14-UPC-BUILD-DARK-STEPS-1-5-TEST-VERIFIED-2026-06-15` (the authoritative record)
- `adopted/adr/2026-06-14-credential-consolidation.md` (the spec) + `D-MECHANISM-CORRECTION-M8-CREDENTIAL-CONSOLIDATION-DESIGN-2026-06-14` (design)
- `operations/handoffs/founder/2026-06-14-credential-consolidation-CI14-BUILD-NEXT-SESSION-PROMPT.md` (the prompt this close answers)
- `operations/handoffs/founder/2026-06-15-credential-consolidation-CI14-step6-cutover-NEXT-SESSION-PROMPT.md` (Step 6)

*End of session close. The Unified Practice Credential is built dark across Steps 1–5: the TEST schema is verified, flag-off is byte-identical, the capability logic is unit-proven, and the chokepoint passed a 12-agent adversarial review (real findings fixed). The cutover flip + leg-B replay are Step 6. Production is byte-identical; the founder commits by name.*
