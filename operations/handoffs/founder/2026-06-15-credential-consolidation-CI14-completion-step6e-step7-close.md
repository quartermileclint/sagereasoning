# Session Close — 2026-06-15 — Credential Consolidation (CI-14) **completion**: Step 6e (invariant re-anchor) + Step 7 (consumer-erasure-by-token) — BUILT + VERIFIED

**Stream:** founder.
**Governing frame:** `/adopted/standing-protocol-cache.md` + `/adopted/build-sessions-protocol-cache.md`. PR1; PR17 (every Supabase/Vercel step walked live — the live legs are pending below); PR18 at close.
**Tier:** **`code-critical`** for BOTH parts (6e = load-bearing CHECK constraints on the auth table; Step 7 = data deletion). Full Critical Change Protocol (0c-ii) per sub-step.
**Environment:** Claude Code on the founder's machine (TEST **and** production reachable). Model: Opus 4.8 (1M).
**Date:** 2026-06-15.
**Operative prompt:** `operations/handoffs/founder/2026-06-15-credential-consolidation-CI14-completion-step6e-step7-NEXT-SESSION-PROMPT.md` (founder elected **Both — 6e then Step 7**).
**Spec:** `adopted/adr/2026-06-14-credential-consolidation.md` Migration §6 (6e) + §7 (Step 7).

## What this session did

Built + adversarially verified the **two remaining CI-14 build items**, then **founder-walked both live this session** (PR17): **6e is now LIVE on production** (the founder ran §A/§B on TEST then prod, every VERIFY green) and **Step 7 is TEST-verified end-to-end live** (the full mint→consult→erase→verify leg passed on the local dev server against TEST). The only remaining step is the **Step-7 prod flag** (`SUBSTRATE_CONSUMER_ERASURE_ENABLED` in Vercel) + the founder commit. The AI performed no Supabase/Vercel/git operation — the founder ran every live step; the AI guided + verified.

- **6e — invariant re-anchor (SQL authored).** `website/supabase-api-keys-upc-step6e-invariant-reanchor-migration.sql`: **§A** re-anchors `api_keys_sage_assent_write_requires_owner_and_agent` to fire on the **write-class** capability overlap `{accreditation_write, calling, reflect}` (array `&&`) as well as `purpose='sage_assent_write'`; **§B** re-anchors `api_keys_plugin_install_requires_identity` to fire on `install_id IS NOT NULL` (structural) as well as `purpose='plugin_install'`. Additive-then-WIDER, BEGIN/COMMIT-wrapped, reversible; each § has a constraint-def dump + zero-violator pre-check + VERIFY + positive/negative TEST probes + inverse block. **§C** = keep-both index decision (no DROP). **§D** (owner_kind consistency) + **§0** (subset-check NULL-element) = surfaced, optional.
- **Step 7 — consumer-erasure-by-token (built dark).** `POST /api/credential/erase` (handler+route split, `SUBSTRATE_CONSUMER_ERASURE_ENABLED` UNSET ⇒ 503): for an `owner_kind='external_consumer'` credential (scope-guarded on `owner_user_id IS NULL`), hard-DELETE its trajectory (`agent_assessment_history` by `credential_ref`) + anonymise+revoke the credential husk + de-personalise the retained billing. **Anonymise-not-hard-delete** because the FK graph means a hard-DELETE would cascade-destroy retained-by-law billing (mirrors `/api/user/delete`). Token mode + admin-by-id mode. Paired mint-hardening fixes close the `owner_kind` drift + give a clear 400 for a write-class UPC missing owner+agent.

**Method (ultracode):** a 6-agent adversarial workflow per part. 6e → **5 GO + 1 GO-WITH-FIX, 0 critical/high** (+ a focused re-verify of the §A write-class broadening = GO). Step 7 → **4 GO + 2 GO-WITH-FIX, 0 critical/high**. **Every finding folded in-session** (see Verification Method).

## Decisions Made
- `D-CI14-UPC-STEP6E-INVARIANT-REANCHOR-BUILT-VERIFIED-2026-06-15` appended (full Critical form).
- `D-CI14-UPC-STEP7-CONSUMER-ERASURE-BUILT-TEST-VERIFIED-2026-06-15` appended (full Critical form).

## Status Changes
| Item | Old | New |
|---|---|---|
| `api_keys` invariant CHECKs (§A/§B) | keyed on `purpose` | **RE-ANCHORED + LIVE on production** (transition: BOTH purpose + capability/structural; founder-walked TEST→prod) |
| 6e invariant re-anchor | not authored | **applied + verified on TEST and production** (every VERIFY green; 0 violators; A3/A3b/B3/B3b behavioral probes passed on TEST) |
| Step 7 consumer-erasure path | not built | **built dark + adversarially reviewed + TEST-verified END-TO-END LIVE**; prod flag UNSET (the only pending step) |
| `/api/credential/erase` | absent | **NEW, dark (503 until `SUBSTRATE_CONSUMER_ERASURE_ENABLED`)** — TEST leg passed live |
| `deleteAssessmentHistoryForCredential` | absent | **NEW store fn** (TEST-verified live: erased 1 row by `credential_ref`) |
| api-keys mint (owner_kind / write-class) | drift + opaque 500 | **honest `external_consumer` default + clear 400** (both verified live on TEST) |
| CI-14 build arc | last 2 cleanups open | **6e LIVE; Step 7 TEST-verified live — only the Step-7 prod flag remains** |

## Verification Method Used
- **tsc** exit 0 (twice — after the build, and after folding all review fixes). **`npm run build`** exit 0 twice (the new `/api/credential/erase` route registered; route-export validation clean).
- **New/changed suites (final):** `consumer-erasure` 25/0, `credential/erase` handler 38/0, `agent-assessment-history-store` 120/0 (+`deleteAssessmentHistoryForCredential`), `practice-credential` 33/0 (+`capabilitiesIncludeWriteClass`).
- **Byte-identity suites (unchanged):** security 20/0, plugin-install-auth 22/0, mint-credential-core 56/0, api-key-defaults 8/0, accreditation mint route 23/0, upc-transport-narrowing 19/0.
- **6e adversarial workflow (6 agents):** 5 GO + 1 GO-WITH-FIX, 0 critical/high; WIDER-no-invalidation proven by logical identity; 0/21 prod rows invalidated. Folded: §A→write-class; §D surfaced; §C lookup-index note; negative probes.
- **Step-7 adversarial review (6 agents):** 4 GO + 2 GO-WITH-FIX, 0 critical/high. Folded: **rate-limiting** (`RATE_LIMITS.dataRights`); **lookup DB-error → 503** (not a false 404); **write-class predicate extracted + tested**; **`credential_ref` in the compliance log**; **atomic owner-null UPDATE guard**; **`credential_audit` retained-intact (R0) documented**; **admin-mode-on-operator 409 test**.

## Risk Classification Record
**Critical** under 0d-ii + PR6 for both. 6e: load-bearing CHECK constraints on `api_keys` — but **mint-time only**, so they cannot change whether any issued credential authenticates (re-verified: `validatePracticeCredential` reads column values, not constraints). Step 7: data deletion — flag-off byte-identical (503, zero DB work, no import-time DB side effect). The mint-hardening is auth-path-neutral (`owner_kind` never read at validation). The R18f provenance gate, R20a perimeter, distress classifier, Layer-2 signing, the live `SUBSTRATE_UPC_CAPABILITY_AUTH_ENABLED` auth path — **all untouched**.

## Founder-walk — the live legs (PR17) — ✅ **6e + Step-7 TEST leg COMPLETED this session; only the Step-7 prod flag remains**

> **Outcome:** §A and §B were founder-walked on TEST (incl. the A3/A3b/B3/B3b behavioral probes) then on **production** — every PRE clean (0 violators), every APPLY committed, every VERIFY green; **6e is Live on prod.** The Step-7 TEST leg ran on the local dev server against TEST and passed every check (erase 200 → trajectory 0 → husk anonymised+revoked → token 401 → idempotent `already_erased` → unknown 404 → operator 409 → mint-hardening 400 + `owner_kind='external_consumer'`); all TEST creds revoked + the flags removed at teardown. The procedure below is retained as the record; **the only step not yet taken is B-9 (the Step-7 prod flag).**

### A) 6e — run the SQL TEST first, then prod (each section, paste outputs back)
File: `website/supabase-api-keys-upc-step6e-invariant-reanchor-migration.sql`. For **TEST**, then **prod**:
1. **§A.PRE** — run; confirm the dumped def matches "EXPECTED CURRENT" and the zero-violator pre-check returns **0 rows**.
2. **§A.APPLY** (BEGIN/COMMIT block) → **§A.VERIFY** (A1 shows the new write-class def; A2 = 0). On TEST you may run the commented **A3** (must 23514-fail) + **A3b** (must succeed) probes. **Do not run A3/A3b on prod.**
3. **§B.PRE** → **§B.APPLY** → **§B.VERIFY** (B1/B2; B3/B3b TEST-only).
4. **§C.RECORD** — snapshot (expect all five indexes present).
5. (§D / §0 are optional — skip unless you elect them; §D needs the Step-7 mint code deployed first.)
6. After prod: re-run the credential suites (Founder Verification block) to confirm auth is unchanged.

### B) Step 7 — the founder-walked TEST leg (then prod flag, when ready)
Use a **fresh terminal** (memory `mint-cli-env-file-export-leak`); TEST = `.env.development.local`.
1. In `.env.development.local` set `SUBSTRATE_CONSUMER_ERASURE_ENABLED=true`, `SUBSTRATE_UPC_CAPABILITY_AUTH_ENABLED=true`, `SUBSTRATE_TRAJECTORY_WRITE_ENABLED=true`; `npm run dev`.
2. Mint an **external_consumer** UPC (consult-capable): `POST /api/admin/api-keys` with `{label:'step7 test', capabilities:['consult','l1_supply'], owner_kind:'external_consumer'}` (or via the CLI `practice` class) → note the `sr_prac_` token + the `api_key` id.
3. Drive a consult: `POST /api/reason` (Bearer the token) → writes one `agent_assessment_history` row. Verify: `SELECT count(*) FROM agent_assessment_history WHERE credential_ref='api_key:<id>';` → ≥1, `owner_user_id` NULL.
4. **Erase:** `POST /api/credential/erase` with `Authorization: Bearer <sr_prac_ token>` + body `{"confirm":"ERASE"}` → **200** `{status:'erased', trajectory_rows_deleted:N, credential:'anonymised_and_revoked'}`.
5. Verify: trajectory rows **0**; `SELECT owner_email,label,is_active,suspended_reason FROM api_keys WHERE id='<id>';` → `null / '[erased]' / false / 'consumer_erasure'`; the token now **401s** on `/api/reason`; re-POST erase → **200** `already_erased`.
6. Negatives: an **operator** credential (owner_user_id set) → **409** `operator_credential`; an unknown `sr_` token → **404** `not_found`. Confirm `/api/user/delete`, `/api/user/export`, the retention sweep still work.
7. Also assert the mint-hardening: a write-class UPC with no owner_email → **400** (pre-validation); a legacy `sr_live_` mint → `owner_kind='external_consumer'` in the row.
8. **Teardown:** remove the three TEST flags from `.env.development.local`.
9. **Prod activation (later, founder-elected 0c-ii):** set `SUBSTRATE_CONSUMER_ERASURE_ENABLED=true` in Vercel + redeploy; smoke-test on a throwaway external_consumer `sr_prac_`; erase + teardown.

## Next Session Should
**The CI-14 consolidation is effectively complete** — 6e is Live on prod and Step 7 is TEST-verified end-to-end; the **only** remaining CI-14 step is flipping `SUBSTRATE_CONSUMER_ERASURE_ENABLED=true` in Vercel (a founder-elected 0c-ii micro-activation, optionally with a throwaway-`sr_prac_` prod smoke). After that, the whole arc (build + activation + cleanup) is closed. Then only these remain across the project: the carried **M1 / M3-CI-11 / M4 / M5** doc/flag activations; parked **CI-16**; and **the 0h launch call** (the one true launch gate — a founder strategic decision, per `operations/p1-rebuild-2026-06/verdict-memo.md` §8). Prefix retirement + the portable creator credential + per-install metering stay deferred.

## Blocked On
**Files remaining uncommitted (the founder commits by name; the AI did no git ops):**
- NEW: `website/supabase-api-keys-upc-step6e-invariant-reanchor-migration.sql`, `website/src/lib/consumer-erasure.ts`, `website/src/lib/__tests__/consumer-erasure.test.ts`, `website/src/app/api/credential/erase/{handler.ts,route.ts,__tests__/handler.test.ts}`, `operations/p1-rebuild-2026-06/ci14-step7-consumer-erasure-design.md`, this close, the completion prompt.
- CHANGED: `website/src/app/api/admin/api-keys/route.ts`, `website/src/lib/practice-credential.ts`, `website/src/lib/substrate/agent-assessment-history-store.ts` (+ its test), `operations/decision-log.md`, `CLAUDE.md` (PR18 refresh).
- **Exclude:** `website/tsconfig.tsbuildinfo`; never stage `.env*` (any TEST flags added during the walk are torn down; `.env.development.local` is gitignored).

**Production state at session close:** **CI-14 UPC remains Live + correct; 6e is now APPLIED on production** (the two `api_keys` invariant CHECKs `api_keys_sage_assent_write_requires_owner_and_agent` + `api_keys_plugin_install_requires_identity` re-anchored to the capability/structural signal — founder-walked, every VERIFY green, 0 rows invalidated; both index-sets kept). This was a **mint-time constraint change only — no code, flag, or read-time auth path changed in production**; every issued credential keeps validating. **Step 7 is dark** (`SUBSTRATE_CONSUMER_ERASURE_ENABLED` UNSET ⇒ 503). The committed code is auth-path-neutral: Step 7 dark, the mint-hardening owner_kind-only + behaviour-preserving. The four R20a flags, B1 trajectory, B2 CI-4, CI-10 gate metering, the UPC auth path — all Live, untouched.

## Open Questions
- 6e §D (owner_kind CHECK) + §0 (NULL-element hardening) — optional, surfaced; founder-elect at the walk (§D needs the Step-7 mint code deployed first).
- 6e OPTION C1 (retire the legacy assent unique index, accepting the looser revoke→re-mint semantic) — optional; default is keep-both.
- `/api/keys` self-service 100/100/1 vs admin 30/1/1 — carried fold-or-record (pre-existing).

## PR5 Knowledge-Gap Carry-Forward
- **A new `route.ts` is gated by `npm run build`, not just `tsc`** (re-confirmed: the new erase route passed; the handler+route split kept non-handler exports out of `route.ts`).
- **Mint-CLI + TEST flags:** fresh terminal for any TEST mint; `--env-file`/export-leak still cuts both ways (memory `mint-cli-env-file-export-leak`).
- **tsx + `security.ts` keepalive** (carried): redirect-to-file + read the summary, never `| tail`; never foreground `sleep`. (This session used a Python `subprocess` timeout wrapper for the hanging suites.)
- **3VL in CHECK constraints:** `COALESCE(arr,'{}') && ARRAY[...]` neutralises a NULL *array* but not a NULL *element*; the closed-vocabulary subset-check should bar NULL elements if belt-and-braces is wanted (6e §0, optional).

## Founder Verification (Between Sessions)
```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/website"
npx tsc --noEmit                                                                                  # exit 0
npm run build                                                                                     # exit 0 (route /api/credential/erase registered)
node_modules/.bin/tsx src/lib/__tests__/consumer-erasure.test.ts > /tmp/ce.txt 2>&1; tail -1 /tmp/ce.txt          # 25 passed
node_modules/.bin/tsx src/lib/__tests__/practice-credential.test.ts > /tmp/pc.txt 2>&1; tail -1 /tmp/pc.txt        # Total 33
node_modules/.bin/tsx src/app/api/credential/erase/__tests__/handler.test.ts > /tmp/h.txt 2>&1; tail -2 /tmp/h.txt # 38 passed (keepalive-hangs — read the file)
node_modules/.bin/tsx src/lib/substrate/__tests__/agent-assessment-history-store.test.ts > /tmp/s.txt 2>&1; tail -2 /tmp/s.txt # 120 passed
```
Then commit (by name) + push via GitHub Desktop. **Vercel redeploys with auth-path-neutral code (Step 7 dark, mint-hardening owner_kind-only, no schema change); production behaviour is unchanged.** The 6e SQL + the Step-7 TEST/prod legs are the founder-walked steps above.

## Orchestration Reminder
This commit carries **code + SQL-file + docs only** — none of it changes the live production auth path. 6e is applied by the founder running the SQL (TEST→prod); Step 7 activates only when `SUBSTRATE_CONSUMER_ERASURE_ENABLED=true` is set in Vercel. Rollback: unset the Step-7 flag (→ 503) / each 6e §'s inverse block / `git revert` — all byte-identical to now.

## Cross-references
- `D-CI14-UPC-STEP6E-INVARIANT-REANCHOR-BUILT-VERIFIED-2026-06-15`, `D-CI14-UPC-STEP7-CONSUMER-ERASURE-BUILT-TEST-VERIFIED-2026-06-15` (the authoritative records)
- `D-CI14-UPC-CUTOVER-STEP6-LIVE-2026-06-15` (the cutover this completes)
- `adopted/adr/2026-06-14-credential-consolidation.md` (the spec — Migration §6 + §7)
- `operations/p1-rebuild-2026-06/ci14-step7-consumer-erasure-design.md` (the Step-7 design)
- `operations/handoffs/founder/2026-06-15-credential-consolidation-CI14-completion-step6e-step7-NEXT-SESSION-PROMPT.md` (the prompt this close answers)

*End of session close. The CI-14 consolidation's two remaining build items are built + adversarially verified (6e SQL: 6-agent GO; Step 7: 6-agent GO with all fixes folded), tsc + npm run build + every suite green. Production is unchanged at the AI's hand; the founder-walked 6e SQL (TEST→prod) + the Step-7 TEST leg + the prod flag are the pending PR17 live steps. After they land, the entire mechanism-correction arc — build, activation, and cleanup — is closed, and only the carried M-activations, parked CI-16, and the 0h launch call remain.*
