# Session Close — 2026-05-23 — Track C Phase 3 (ATL → Sage Assent external / wire-format / public copy) — CRITICAL

**Stream:** founder.
**Governing frame:** `/adopted/standing-protocol-cache.md` + `/adopted/build-sessions-protocol-cache.md` ("no current users" holds — founder + test logins only; the agent-card is a published external contract, so the public-contract risk is real even with no users).
**Tier:** `code-critical` — **Critical** risk. PEV loop (PR10). **AC7 ENGAGED.** PR6 NOT engaged.
**Date:** 2026-05-23.

Executed Phase 3 of the locked Track C arc on the committed Phase-2 baseline (`49a7f9a`), completing the ATL→Sage Assent rename end-to-end. At open I confirmed the protocol, ran the PR15 consult + PR16 lens, confirmed pre-conditions, and surfaced the bite + naming/cutover elections. You elected **C Phase 3** with: prefix **`sr_assent_`**, DB scope **`sage_assent_write`**, extension URI **`sage-assent-write-auth/v1`** (clean path rename, v1), **clean cutover**. All four external surfaces are built, `tsc`-clean, and green across the affected suites. **Production is UNCHANGED** until you complete the Critical-Change-Protocol gate below (pre-deploy credential check → migration → commit/push → smoke tests).

## Decisions Made
- `D-TRACK-FOLLOWONS-C-PHASE3-EXTERNAL-WIRE-2026-05-23` appended (full Critical form). Prefix `sr_atl_`→`sr_assent_`; DB scope `atl_write`→`sage_assent_write`; agent-card extension URI + tokenPrefix/header/brand line; 3 public-copy surfaces. Every `D-ATL-*` ID preserved.

## Status Changes
| Item | Old | New |
|---|---|---|
| Track C Phase 3 (external/wire/public) | Scoped | **Wired** (tsc 0 + suites green in-session) → **Verified** on your pre-deploy credential check + migration VERIFY + post-deploy smoke tests |
| Credential prefix value | `sr_atl_` | **`sr_assent_`** (code; agent-card advertises it) |
| DB scope value | `atl_write` | **`sage_assent_write`** (code; migration written, not yet run) |
| Agent-card extension URI | `atl-write-auth/v1` | **`sage-assent-write-auth/v1`** |
| Track C rename arc | Phases 1–2 done | **Phases 1–3 complete** (pending your deploy) |

## CRITICAL CHANGE PROTOCOL (0c-ii) — complete this gate before deploy

**1. What is changing (plain language).**
- The agent write-credential **prefix** changes from `sr_atl_` to `sr_assent_`. Every write token you issue now starts with `sr_assent_`, and the routes that accept write credentials expect it.
- The database **scope tag** on those credentials changes from `atl_write` to `sage_assent_write` (the value in `api_keys.purpose` that marks a row as an agent write-credential). A migration renames it and rebuilds the constraint/indexes/trigger that depend on it.
- The **published agent-card** (`/.well-known/agent-card.json`, the machine-readable contract agent developers read) now advertises the new prefix and a new extension URL (`…/extensions/sage-assent-write-auth/v1`).
- Three bits of human copy now say **"Sage Assent"** instead of "Agent Trust Layer."

**2. What could break (specific worst cases).**
- After cutover, any token issued with the OLD `sr_atl_` prefix is **rejected with 401**. Clean cutover = old tokens stop working — acceptable ONLY because there are zero live credentials.
- **Code/migration mismatch:** if the migration runs but code isn't deployed (or vice-versa), code expects `purpose='sage_assent_write'` while rows are `atl_write` → all write-credential lookups return no row → 401 for every write. Mitigation: deploy code + run migration together; with zero live creds there is nothing to mismatch.
- **Index loss:** if the migration dropped the unique index and failed to recreate it, duplicate write-credentials for the same (owner, agent) could exist. Mitigation: the DROP+CREATE is sequential + idempotent; the VERIFY block confirms the new index exists.
- **Stale public URI:** any third party who cached `atl-write-auth/v1` would not find it. Mitigation: zero external consumers today.

**3. What happens to existing sessions / credentials.**
- Third-party sessions: **N/A** — "no current users." No third-party sessions to invalidate.
- Test credentials: per the A10 close + Track F cleanup, the test creds were revoked → **zero active `atl_write` rows expected**. The clean cutover invalidates any old-prefix token; with zero active credentials, nothing in use stops working. **This is the hard gate — confirm the count is 0 (step 0 below) before deploying.**
- AC7 (Session-7b): credential-format + auth-gate value swap on the already-proven opaque-token pattern; **cookie scope, session validation, and domain-redirect behaviour are untouched.**

**4. Rollback plan (founder-runnable).**
- Code + agent-card + public copy: `git revert <commit>` + push → Vercel rebuilds to the old shape.
- DB scope: run the **INVERSE ROLLBACK** block (commented at the foot of `website/supabase-api-keys-phase3-scope-rename-migration.sql`) in the Supabase SQL editor → restores `atl_write` + old constraint/index names + old trigger predicate.
- Zero live credentials → rollback has no credential/data implications.

**5. Verification step (per surface) — see the Founder Verification block below.**

**6. Explicit approval.** Deploy requires your explicit "go" specific to the named risks (credential-format change + DB scope migration + published-contract change) **and** your confirmation that the active-credential count is 0.

## Blocked On
**Files changed this session (uncommitted — for your commit):**
- Modified: `website/src/lib/security.ts`; `website/src/app/api/accreditation/[agent_id]/route.ts`; `website/src/app/api/admin/accreditation-credentials/route.ts` + `validation.ts` + `__tests__/route.test.ts`; `website/src/app/api/calling/route.ts` + `request-helpers.ts`; `website/src/app/api/calling/approve/route.ts`; `website/src/app/api/practice/reflect/route.ts` + `request-helpers.ts`; `website/src/lib/__tests__/security.test.ts`; `website/public/.well-known/agent-card.json`; `website/src/app/limitations/page.tsx`; `website/src/app/ops-hub/page.tsx`; `website/src/app/api/guardrail/route.ts`
- NEW: `website/supabase-api-keys-phase3-scope-rename-migration.sql`
- `operations/decision-log.md` (entry appended), this close (NEW)

**Production state at session close:** **UNCHANGED.** No deploy, no env change, no migration run yet. `SAGE_REFLECT_ENABLED=true`; `MENTOR_ENCRYPTION_KEY` set; substrate A7 Verified; A10 Live+Verified; Sage Calling/Sage Reflect Live (gated); Layer-3 + R20a substrate gates UNSET. Until you commit + push **and** run the migration, production runs the identical pre-Phase-3 code with the old `sr_atl_`/`atl_write` surface.

## Founder Verification (Between Sessions)

**Step 0 — HARD GATE: confirm zero live credentials (clean-cutover precondition).** In the Supabase SQL editor:
```sql
SELECT id, label, agent_id, is_active, revoked_at
FROM api_keys WHERE purpose = 'atl_write' AND is_active = true;
```
Expected: **0 rows.** If any active row exists beyond known test creds, STOP and tell me — we switch to dual-accept before any deploy.

**Step 1 — type-check + suites** (from `website/`; `npm install` first on a clean checkout):
```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/website"
npx tsc --noEmit
```
Then run a few suites one command at a time (per `/CLAUDE.md`):
```
npx tsx --env-file=.env.local "src/app/api/accreditation/[agent_id]/__tests__/route.test.ts"        # 90 pass
npx tsx --env-file=.env.local src/app/api/admin/accreditation-credentials/__tests__/route.test.ts    # 23 pass
npx tsx --env-file=.env.local src/lib/__tests__/security.test.ts                                     # 20 pass
npx tsx src/app/api/practice/reflect/__tests__/request-helpers.test.ts                               # 12 pass
```
Expected: `tsc` exits 0; each suite reports 0 fail.

**Step 2 — run the DB migration. ✅ DONE + VERIFIED (2026-05-23).** Founder ran `website/supabase-api-keys-phase3-scope-rename-migration.sql` in the Supabase SQL editor. VERIFY confirmed: `remaining_atl_write=0`, `sage_assent_write_rows=3`, purpose CHECK = `('ecosystem','sage_assent_write')`, `api_keys_sage_assent_write_*` constraint + unique index present, `atl_write`-named ones absent, trigger predicate on the new value, trigger attached. **Correction note:** the first run failed on the old `api_keys_purpose_check` (backfill-before-drop ordering bug, AI-caused; DB unchanged, UPDATE rolled back atomically). The migration was reordered (drop old CHECK + invariant → backfill → re-add) and the re-run succeeded. DB scope migration **Verified (production)**.

**Step 3 — commit + push** (via GitHub Desktop). CLI equivalent:
```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
git add -A
git commit -m "Track C Phase 3 (D-TRACK-FOLLOWONS-C-PHASE3-EXTERNAL-WIRE-2026-05-23): ATL->Sage Assent external/wire — prefix sr_atl_->sr_assent_, DB scope atl_write->sage_assent_write (migration), agent-card extension URI + tokenPrefix, 3 public-copy surfaces; clean cutover; D-ATL-* IDs preserved"
```
Then push. Vercel rebuilds. **Deploy code + run the migration in the same window** (the two must match).

**Step 4 — post-deploy smoke test (exact commands).** Two browser checks (no terminal) + a 4-command credential flow. Every expected HTTP status is exact; a result other than the stated one means stop + report.

**4a — agent-card (browser).** Open `https://www.sagereasoning.com/.well-known/agent-card.json`; Cmd+F `tokenPrefix` → reads `sr_assent_`; Cmd+F `sage-assent-write-auth` → present. PASS = both found, and no `sr_atl_`/`atl-write-auth` anywhere.

**4b — public copy (browser).** `https://www.sagereasoning.com/limitations` → the certification section reads "Sage Assent evaluates AI agents'…". `https://www.sagereasoning.com/ops-hub` → pipeline row reads "P3: Sage Assent".

**Get your admin token (for 4c/4f):** sign in at `https://www.sagereasoning.com` → DevTools (Cmd+Opt+I) → Application → Local Storage → `https://www.sagereasoning.com` → the key `sb-…-auth-token` → copy the `access_token` value (long string starting `eyJ…`).

Pre-req: `SUBSTRATE_WRITE_PATH_ENABLED='true'` in Vercel (left on per A10). If 4d/4e return **503**, the flag is unset — set it to `true`, redeploy, retry.

**4c — mint (proves new prefix generation + new scope WRITE).**
```
curl -s -w '\nHTTP_STATUS: %{http_code}\n' -X POST \
  "https://www.sagereasoning.com/api/admin/accreditation-credentials" \
  -H "Authorization: Bearer <ACCESS_TOKEN>" -H "Content-Type: application/json" \
  -d '{"agent_id":"agent_phase3_smoke_v1","purpose":"sage_assent_write","label":"Phase 3 smoke"}'
```
Expect **201**; body has `"token":"sr_assent_…"` and `"credential":{"id":"<uuid>",…}`. Record the token + the id. (409 → that agent already has a credential; use `agent_phase3_smoke_v2`. 401 → token wrong/expired.)

**4d — OLD prefix rejected (proves cutover).**
```
curl -s -w '\nHTTP_STATUS: %{http_code}\n' -X POST \
  "https://www.sagereasoning.com/api/accreditation/agent_phase3_smoke_v1" \
  -H "Authorization: Bearer sr_atl_00000000000000000000000000000000" \
  -H "Content-Type: application/json" -d '{}'
```
Expect **401**.

**4e — NEW token accepted (proves new prefix + new scope READ round-trip).**
```
curl -s -w '\nHTTP_STATUS: %{http_code}\n' -X POST \
  "https://www.sagereasoning.com/api/accreditation/agent_phase3_smoke_v1" \
  -H "Authorization: Bearer <MINTED_sr_assent_TOKEN>" \
  -H "Content-Type: application/json" -d '{}'
```
Expect **400** with a message about `'kind'`. **The 400 (not 401) is the pass:** the token cleared the auth gate (new prefix accepted + `sage_assent_write` row found); the 400 is only the endpoint asking for a real write body, which this test deliberately omits. The 4d→401 vs 4e→400 contrast (same call, only the prefix differs) IS the cutover proof.

**4f — cleanup (revoke the smoke credential).**
```
curl -s -w '\nHTTP_STATUS: %{http_code}\n' -X DELETE \
  "https://www.sagereasoning.com/api/admin/accreditation-credentials?id=<CREDENTIAL_ID>" \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```
Expect **200** `{"revoked":true,…}`.

When Steps 0–4 pass, the implementation status flips **Wired → Verified (production)**.

## Open Questions
- limitations `:111` section header "Agent trust certification is not a guarantee" — left as generic descriptive copy; change to "Sage Assent certification…" if you prefer (your call).
- profile-delete trigger/function NAMES (`revoke_atl_credentials_*`) retained as internal identifiers (predicate already migrated) — optional later polish.
- `trust-layer/` directory rename + `mode:'atl_wrapper'` discriminant classification — still parked.
- Out-of-scope "Agent Trust Layer" prose in non-live surfaces (reference/, product/, summary/users guides, PROJECT_STATE.md, compliance register, flows.json, other SQL comments) — a later sweep if desired.

## Verification Method Used (0c framework)
- Type-check: `npx tsc --noEmit` → exit 0. Suites: accreditation route 90/90, admin route 23/23, security 20/20, reflect request-helpers 12/12 (in-sandbox, `.env.local`). Runtime prefix accept/reject + agent-card shape = founder post-deploy smoke (Step 4). DB = founder migration VERIFY (Step 2).
- Guards: `D-ATL-` uppercase 170→170 in `website/src`; zero lowercase `sr_atl_`/`atl_write` in `src`; agent-card valid JSON, retains the D-ATL-A10 ID, advertises the new prefix + URI.

## Risk Classification Record (0d-ii)
- Whole session: **Critical** (credential-format + persisted DB scope migration on an existing table + published A2A contract + deployment config). AC7 ENGAGED; PR6 NOT engaged; R17c relevant (deletion-path trigger predicate, updated in place); KG1 relevant (migration DB objects; route reads unchanged + fail-closed).

## PR5 — Knowledge-Gap Carry-Forward
- No concept required re-explanation. Reinforced finding: a shared prefix const is not uniformly consumed — the accreditation route hardcodes `'Bearer sr_atl_'`, so a prefix-value change must grep for consumers, not just edit the const. No new register entry.

## Orchestration Reminder
- Single-endpoint discipline (PR1): the prefix is a central value; the proof was staged on the recommended route (reflect, const-based) + the `security` unit, then all consumers confirmed via `tsc` + the route suites (incl. the accreditation route's separately-hardcoded literal). PEV loop (PR10): Plan (Critical Change Protocol above) → Execute (four surfaces) → Verify (tsc + suites + guards) = **Diagnostic-certain** at the type/test level; runtime cutover behaviour is founder-verified post-deploy (Step 4).

## Cross-references
- `/operations/handoffs/founder/2026-05-23-C-phase2-docs-registry-close.md` (predecessor)
- `/operations/handoffs/founder/2026-05-23-C-phase3-external-wire-NEXT-SESSION-PROMPT.md` (the prompt this session executed)
- `D-TRACK-FOLLOWONS-C-PHASE3-EXTERNAL-WIRE-2026-05-23`; `D-TRACK-FOLLOWONS-C-PHASE2-DOCS-REGISTRY-2026-05-23`; `D-ATL-A10-BUILD-WIRED-VERIFIED-2026-05-21`
- `/drafts/2026-05-23-track-followons-design-pack.md` §C (deliverable-of-the-day)
- `website/supabase-api-keys-phase3-scope-rename-migration.sql` (the migration to run)

## Verification Confirmation (appended 2026-05-23, post-deploy)

Founder completed the full gate + smoke test. **Phase 3 = Verified (production); Track C rename arc CLOSED end-to-end.**
- Zero-credential gate: 0 active `atl_write` rows (3 revoked tombstones) → clean cutover confirmed safe.
- Migration: run + VERIFY passed (`remaining_atl_write=0`, `sage_assent_write_rows=3`, new constraint + unique index present, old absent, trigger predicate on new value, trigger attached). First run failed on an AI-caused backfill-before-drop ordering bug (DB unchanged); corrected + re-run clean.
- Deploy: committed + pushed; Vercel green.
- Smoke test: agent-card serves `sr_assent_` + `sage-assent-write-auth/v1`; `/limitations` + `/ops-hub` read "Sage Assent"; mint → 201 (`sr_assent_` token); old `sr_atl_` → 401; new token → 400 (auth accepted); revoke → 200.

**Production state now:** code + agent-card + public copy on the `sr_assent_` / `sage_assent_write` / `sage-assent-write-auth/v1` surface; DB migrated; `SUBSTRATE_WRITE_PATH_ENABLED='true'` (write surface Live). All other flags unchanged from the Phase-2 baseline.

*End of session close. Stabilised to a known-good state: Phase 3 Verified across all four external surfaces; Track C rename arc complete (Phases 1+2+3); `D-ATL-*` IDs preserved. Next session: E#1 (persist the Sage Calling Agent-Card verdict) per the locked order, or a parked item — your election at open. Prompt: `/operations/handoffs/founder/2026-05-23-E1-agent-card-verdict-NEXT-SESSION-PROMPT.md`.*
