# Next-Session Prompt — A10 Build: Per-Agent Credentials (step 8 of 8 of post-6b arc — build half)

**Stream:** founder.
**Tier:** `code-critical` — **Critical** risk under 0d-ii. **Full** template (NOT Lean). Critical Change Protocol (0c-ii) ENGAGED. AC7 ENGAGED (new auth surface + new admin endpoint + schema additions to an auth-relevant table + new audit-relevant table). PR6 NOT engaged (no R20a / distress-classifier surface).
**Governing frame:** `/adopted/standing-protocol-cache.md` (general protocol — `code-critical` row → **Full** template + Critical Change Protocol) + `/adopted/build-sessions-protocol-cache.md` (build-arc context — "no current users" governing note applies; CCP step 3 = "N/A — only founder + test logins exist").
**Predecessor session close:** `/operations/handoffs/founder/2026-05-16-A10-design-pass-close.md` (the design half that closed yesterday).
**Predecessor decision-log entry (the immediate upstream spec):** `D-ATL-A10-DESIGN-LOCKED-2026-05-16`.
**Design document (the spec the build implements):** `/adopted/atl-a10-design.md`.
**Sequencing source:** `/operations/handoffs/founder/2026-05-15-post-build-brainstorm-close.md` — step 8 of 8 in the post-6b arc.

---

## Why this session matters

This is the build half of step 8 — the last step of the post-6b arc. The design pass (yesterday) locked nine decisions A–I defining A10's surface. This session implements them.

The load-bearing change: `verifyAgentIdOwnership(request, agent_id)` in `/website/src/app/api/accreditation/[agent_id]/route.ts` — currently a synchronous env-flag check — becomes an `async` function that delegates to a new `validateAtlWriteToken(rawToken, agent_id)` helper in `/website/src/lib/security.ts`. The auth surface for the substrate's write endpoint shifts from "coarse-grained env-flag gate" to "per-agent ownership verification via SHA-256-hashed opaque tokens".

The design's load-bearing PR15 finding (worth re-stating): the existing `api_keys` + `validateApiKey` + `/api/admin/api-keys` infrastructure in production is the substrate A10 extends. A10 is NOT a greenfield credential system — it adds columns to `api_keys`, adds a sibling helper to `security.ts`, and mirrors the existing admin endpoint pattern.

**After this session lands, the post-6b arc closes.** The substrate has read AND write public surfaces, both authenticated, both auditable.

Plan **~3–4 hr** for this Critical session. Founder mid-session input concentrated at Step 1 (one admin-check election) and Step 11 (explicit CCP approval).

---

## Pre-conditions

1. **Design-pass session pushed; Vercel green.** Founder confirmed Vercel green for the design-pass commit (no code change; the rebuild was a no-op from production's perspective).
2. **Founder has reviewed** `/adopted/atl-a10-design.md` between sessions and accepts the spec as written.
3. **Founder has reviewed** the predecessor close's "Next Session Should" pre-conditions, including the admin-check decision (Step 1 election below).
4. **Production state unchanged** from the design-pass close: substrate at A7 Verified; `SUBSTRATE_LAYER3_ENABLED` UNSET; `SUBSTRATE_R20A_GATE_ENABLED` UNSET; `SUBSTRATE_WRITE_PATH_ENABLED` UNSET (write surface inert); `/api/reason` byte-identical; `/api/substrate/layer3` returns 503; `/api/accreditation/[agent_id]` Live for GET + POST (POST returns 503 — env-flag-gated); `agent_accreditation` table empty; `grade_history` table empty; `api_keys` table holds existing ecosystem keys only.
5. **Founder commits to a ~3–4 hr Critical-risk bounded session.** Full Critical Change Protocol overhead.

---

## Part A — Open under the protocol

Read in order:

1. `/adopted/standing-protocol-cache.md` (~3 min) — confirm tier (`code-critical`), risk class (Critical), Full template, signals, status vocabulary, AC1 model-selection table (N/A this session — no LLM calls), Critical-risk-sessions section.
2. `/adopted/build-sessions-protocol-cache.md` (~3 min) — confirm "no current users" simplification still applies; CCP step 3 = "N/A — only founder + test logins exist".
3. `/operations/handoffs/founder/2026-05-16-A10-design-pass-close.md` (~5 min) — the immediate predecessor; particularly the Status Changes block (token format ADR resolved; pre-A10 stopgap retirement resolved).
4. **`/adopted/atl-a10-design.md` in full** (~15 min) — the spec. Nine decisions A–I; the Build-session implementation summary table at the bottom names the expected file changes verbatim.
5. **Targeted code files** (~20 min):
   - `/website/src/lib/security.ts` in full — the PR15 reuse target. Particularly: `hashKey` (line ~299), `extractRawKey` (line ~303), `validateApiKey` (line ~325), `getAuthenticatedUser` + `requireAuth` (lines ~121, ~152). The new `validateAtlWriteToken` lives alongside `validateApiKey`; the new `requireAdmin` (or inline equivalent) lives alongside `requireAuth`; the new `generateAtlWriteToken` helper lives alongside `hashKey`.
   - `/website/src/app/api/accreditation/[agent_id]/route.ts` — the route file the build session modifies. Particularly: `verifyAgentIdOwnership` (line ~335) — body gets rewritten per Decision E; the function becomes `async`; the call site at line ~500 updates one `await`.
   - `/website/src/app/api/admin/api-keys/route.ts` — the pattern A10's new admin endpoint mirrors. Read in full for the auth scaffolding the new endpoint copies.
   - `/website/src/lib/supabase-server.ts` (skim) — the `supabaseAdmin` client the new admin endpoint uses.
6. **`/operations/decision-log.md`** — last 3 entries: `D-ATL-A10-DESIGN-LOCKED-2026-05-16` (the spec for this build); `D-ATL-WRITE-PATH-BUILD-WIRED-VERIFIED-2026-05-16` (the predecessor build whose auth seam this session fills); `D-ATL-WRITE-PATH-DESIGN-LOCKED-2026-05-16` (Decision C of which names A10 as the auth-seam filler).
7. **PR11 inbox scan** — list `/inbox/` files dated since 2026-05-16; review for A10-relevant material. Confirm F1–F4 in `/operations/agentic-commerce-findings-downstream-order.md` for A10 build relevance. Note: F4 (AC10 / AP2 alignment) is forward-looking; the `credential_audit` table this build creates IS the upstream provenance surface F4 names — confirm in-session that the `credential_audit` shape is compatible with what F4 will eventually consume at A12.
8. **PR15 consult** — `.claude/skills/anthropic/` review. Expected: `claude-api` informational (no substitute); `mcp-builder` forward pointer for R18c interoperability (post-launch the credential issuance could be exposed as an MCP tool); the bespoke election justification names the existing `api_keys` infrastructure as the production-adjacent reusable primitive A10 extends — A10 is NOT bespoke in the conventional sense.

**Confirm at open:** tier (`code-critical`); hold-point status (P0 0h active); model selection N/A (no LLM calls); status vocabulary; signals + risk classification; Critical Change Protocol ENGAGED (full template).

---

## Part B — Procedure

### Step 0 — Scope confirm (~5 min)

State scope via AskUserQuestion: implement the nine decisions A–I per `/adopted/atl-a10-design.md`. In scope: schema migrations (2 SQL files); `security.ts` modifications (new validator, new helper functions); new admin endpoint route; auth-gate swap in the existing accreditation route; new + modified test files; new Vercel env var (admin identifier). NOT in scope: founder-only-mint-vs-self-service alternative (Decision B locked founder-only pre-launch); reactivation flow (Decision F PR7 deferral); `expires_at` column (Decision G PR7 deferral); badge documentation update (Decision B's R18b note — separate session).

### Step 1 — Build-session election (~5 min)

The design names ONE build-session election the founder must make:

- **Admin-check pattern (Decision D's structural constraint).** The new admin endpoint authorises the founder via Supabase auth + an admin check. The check compares against either `ADMIN_USER_EMAIL` (against `user.email`) OR `ADMIN_USER_ID` (against `user.id`). Both produce equivalent behaviour. Pick one. The build session adds the chosen env var to the deployment surface; the founder sets its value in Vercel post-deploy.

Founder elects via AskUserQuestion. The AI may surface other small build-session questions if they arise during code-writing — typically file paths, helper naming, test structure within the design's stated constraints.

### Step 2 — Critical Change Protocol responses (PR10 Plan) (~15 min)

The AI writes all seven CCP responses visibly in the conversation BEFORE any code is written. Per `/adopted/standing-protocol-cache.md` §"Critical-risk sessions":

1. **What is changing — plain language.** The auth surface for the substrate write endpoint shifts from env-flag-only to per-agent token verification. A new admin endpoint mints + revokes credentials. The `api_keys` table grows new columns. A new `credential_audit` table is added. Tests cover all paths.
2. **What could break — specific failure modes.** At least eight named risks (token-format collision; admin-check misconfiguration; auth-gate failing closed when it should succeed; auth-gate failing open when it should reject; `purpose` filter regression breaking existing `validateApiKey` for `sr_live_` keys; the schema migration's IF NOT EXISTS clauses not being truly idempotent; the audit table's foreign-key constraint causing existing-key admin operations to fail; the kill-switch retention introducing a regression in the existing pre-A10 503 behaviour).
3. **What happens to existing sessions.** **N/A — only founder + test logins exist; no third-party sessions to invalidate** (per the build-arc cache's "no current users" governing note).
4. **Rollback plan.** Multiple paths: before push (`git reset --hard HEAD~1`); after push before env-var set (`git revert HEAD --no-edit` + push; Supabase rollback via `ALTER TABLE … DROP COLUMN` + `DROP TABLE credential_audit` if needed — see Step 9 below); after push AND env-var set (unset `SUBSTRATE_WRITE_PATH_ENABLED` for kill-switch lockdown; if A10 itself fails, revert the route's `verifyAgentIdOwnership` to the pre-A10 env-flag-only body).
5. **Verification step.** Local pre-push: `tsc --noEmit` clean; new + extended test files pass via `npx tsx --env-file=.env.local`. Post-deploy URL checks: `curl` against `POST /api/accreditation/agent_test_v1` without auth (expect 401 with "Unauthorized."); with a valid minted token but mismatched `agent_id` (expect 401); with a valid token + matching `agent_id` (expect 200 + write); admin endpoint `POST /api/admin/accreditation-credentials` (founder-authed, expect 200 + raw token returned).
6. **Explicit founder approval.** Recorded at Step 11 of this session via AskUserQuestion. The founder elects approval specific to the named risks, not generic.
7. **CCP step 7 — orchestration reminder.** Founder runs the pre-push tests locally one command at a time per the CLAUDE.md note; commits via the exact `git add` + `git commit` block in the close; pushes via GitHub Desktop; sets the new Vercel env var (`ADMIN_USER_EMAIL` or `ADMIN_USER_ID`); applies the two SQL migrations via Supabase SQL Editor; then runs the post-deploy curls.

### Steps 3–9 — Execute (~90–120 min)

Code written in order:

- **Step 3 — Schema migration files (NEW).** Two SQL files in `/website/`:
  - `supabase-api-keys-a10-migration.sql` — adds `agent_id text`, `owner_user_id uuid REFERENCES auth.users(id)`, `purpose text NOT NULL DEFAULT 'ecosystem'`, `revoked_at timestamptz` columns to `api_keys`; adds unique index `(owner_user_id, agent_id, purpose) WHERE purpose = 'atl_write'`; adds lookup index `(purpose, agent_id) WHERE purpose = 'atl_write'`. Additive + idempotent (`ADD COLUMN IF NOT EXISTS`; `CREATE INDEX IF NOT EXISTS`).
  - `supabase-credential-audit-migration.sql` — creates `credential_audit` table with the columns named in Decision H's structural constraint (`event_type`, `credential_id`, `actor_user_id`, `agent_id`, `details jsonb`, `created_at`); three indexes (`credential_id`, `agent_id`, `actor_user_id`). Idempotent (`CREATE TABLE IF NOT EXISTS`; `CREATE INDEX IF NOT EXISTS`).
- **Step 4 — `security.ts` modifications (MODIFIED).** Add (in order, near the existing `validateApiKey`):
  - `type AtlWriteValidationResult` — discriminated union per Decision E's structural constraint.
  - `async function validateAtlWriteToken(rawToken: string, agent_id: string): Promise<AtlWriteValidationResult>` — implementation per Decision E.
  - `function generateAtlWriteToken(): { raw: string; hash: string }` — `crypto.randomBytes(16).toString('hex')` for the raw body; SHA-256 hash via existing `hashKey`.
  - `async function requireAdmin(request: NextRequest): Promise<{ user: ... } | { error: NextResponse }>` — wraps `requireAuth` + the elected admin check. (May be inline in the admin endpoint instead — build-session discretion.)
  - `function logAtlVerifyEvent(event: AtlVerifyEvent): void` — emits one JSON line per call.
  - Existing `validateApiKey`, `requireAuth`, `getAuthenticatedUser`, `hashKey`, `extractRawKey` are byte-untouched.
- **Step 5 — New admin endpoint (NEW).** `/website/src/app/api/admin/accreditation-credentials/route.ts`:
  - `POST` handler (mint flow per Decision D): rate-limit → auth + admin → body validate → generate token → insert `api_keys` row with `purpose='atl_write'` → write `credential_audit` issue event → return raw token once.
  - `DELETE` handler (revoke flow per Decision F): rate-limit → auth + admin → URL param parse → update `api_keys` row (`is_active=false`, `revoked_at=now()`, `suspended_reason`) → write `credential_audit` revoke event → return success.
  - Mirrors the existing `/api/admin/api-keys/route.ts` scaffolding.
- **Step 6 — Route auth-gate swap (MODIFIED).** `/website/src/app/api/accreditation/[agent_id]/route.ts`:
  - `verifyAgentIdOwnership` becomes `async`; body rewritten per Decision E (kill-switch check → token extract → delegate to `validateAtlWriteToken`).
  - Call site at the POST handler updates `const auth = verifyAgentIdOwnership(...)` to `const auth = await verifyAgentIdOwnership(...)`.
  - File-header comments updated to describe the post-A10 behaviour (Decision I dual-semantics for `SUBSTRATE_WRITE_PATH_ENABLED`).
  - `AuthGateResult`'s `'not_enabled' | 'unauthorized'` reason set remains valid (no type change needed — the values are still emitted).
- **Step 7 — `security.test.ts` additions (MODIFIED or NEW).** Tests for `validateAtlWriteToken` per Decision E + F: no-token; invalid-token; revoked-token (also returns invalid_token — failure-mode collapse is intentional per design); wrong-agent; successful validation. Plain-tsx-assertion pattern.
- **Step 8 — Route test extensions (MODIFIED).** `/website/src/app/api/accreditation/[agent_id]/__tests__/route.test.ts`: the POST tests' setup mocks or provisions a valid credential (likely via a mock or test-fixture); auth-gate tests exercise A10's verification path (token presence, hash match, agent_id match); the `unauthorized` test verifies 401 for unknown/revoked/wrong-agent tokens; the `not_enabled` test verifies 503 still fires when `SUBSTRATE_WRITE_PATH_ENABLED` is UNSET (Decision I kill-switch retained).
- **Step 9 — New admin endpoint test (NEW).** `/website/src/app/api/admin/accreditation-credentials/__tests__/route.test.ts`: founder-only auth (401 for non-admin); successful mint returns raw token; mint enforces unique constraint (409 on duplicate `(owner_user_id, agent_id, purpose)`); revoke sets `is_active=false`, `revoked_at`, `suspended_reason`; both mint + revoke write `credential_audit` rows.

### Step 10 — Verify (PR10 Verify) (~5 min)

`npx tsc --noEmit -p tsconfig.json` — expect exit code 0. All new code compiles; integration with existing `validateApiKey` + `requireAuth` chain unchanged.

### Step 11 — Critical Change Protocol explicit approval (~5 min)

Founder confirms via AskUserQuestion: "OK to deploy — I'll commit and push, set the env vars, run the migrations." The approval is specific to the named risks from Step 2.

### Step 12 — Decision-log entry (full form for Critical) (~15 min)

`D-ATL-A10-BUILD-WIRED-VERIFIED-2026-05-16` (or YYYY-MM-DD if the session lands on a different day). Per `/adopted/standing-protocol-cache.md` §"Critical-risk sessions" — full form. Sections: Decision; Step 1 election (admin-check pattern); Reasoning; Files touched; Risk classification; Critical Change Protocol responses (seven); Open questions (deferred per PR7); Verification Method Used (0c framework); Risk Classification Record (0d-ii); PR5 Knowledge-Gap Carry-Forward; Founder Verification (between sessions); Orchestration Reminder; Rules served; Status.

Rules served expected: 0a, 0c, 0c-ii (Critical Change Protocol), 0d-ii, 0f, R0, R3, R4, R17 (primary engagement — the auth gate's body fills), R18a, R18b, R18c, R18e (NOT), R20 (NOT), AC5 (NOT), AC7 (ENGAGED — multiple surfaces), AC8, AC10 (`credential_audit` is upstream provenance for A12 per F4), KG1 (every DB write/read awaited; no self-calls), KG7 (NOT — no JSONB writes at Layer 1 contract level), PR1 (single-build proof — all surfaces landed in one session), PR2 (build-to-wire immediate), PR4 (N/A), PR6 (NOT), PR7 (deferred items named per the design's PR7 list), PR10 (Plan from Step 2; Execute from Steps 3–9; Verify from Step 10 + founder post-deploy), PR11 (inbox scan recorded), PR15 (extending `api_keys` is the PR15 election; bespoke justification recorded).

### Step 13 — Session close (full form for Critical) (~15 min)

Per `/adopted/standing-protocol-cache.md` §"Critical-risk sessions" — full form. Includes Verification Method Used, Risk Classification Record, PR5 Knowledge-Gap Carry-Forward, Founder Verification (Between Sessions), Orchestration Reminder. "Next Session Should" names that the post-6b arc is now closed; the natural next arc is either Q9 wrapper-iteration patterns (deferred under the kathekon design) OR the K-category migration (translation-sandwich consumer migration per the build-arc cache).

---

## Part C — Anticipated session shape

| Phase | Estimate |
|---|---|
| Part A — caches + predecessor close + design doc in full + targeted code (4 files) + decision-log + PR11 + PR15 | 45–60 min |
| Step 0 — scope confirm | 5 min |
| Step 1 — admin-check election | 5 min |
| Step 2 — Critical Change Protocol responses (PR10 Plan) | 15 min |
| Steps 3–9 — Execute (schema migrations × 2 + security.ts + admin endpoint + route swap + tests) | 90–120 min |
| Step 10 — Verify (tsc clean) | 5 min |
| Step 11 — CCP explicit approval | 5 min |
| Step 12 — decision-log entry (full form for Critical) | 15 min |
| Step 13 — session close (full form for Critical) | 15 min |
| **Total** | **~3.5–4 hr** |

The natural pause point if the session runs long is **after Step 2** (CCP Plan written; Execute can resume in a follow-on session — the seven CCP responses are recorded in the conversation transcript and would carry into the next session). A second natural pause is **after Step 9** (code written and `tsc` clean; founder runs verification + approval + push in a follow-on quick session). Founder elects whether to take any pause.

---

## Rollback path

Three production-state paths, depending on when something goes wrong:

**A. Before push** (something spotted while reviewing the diff): `git reset --hard HEAD~1`. Discards the commit. No production effect.

**B. After push, before flipping env vars + running migrations** (the code is in production but no `ADMIN_USER_EMAIL` is set, so the admin endpoint fails closed; no migration has run, so the new columns + table don't exist, but the code that references them DOES exist — this will cause the new code paths to throw if hit, but the kill-switch `SUBSTRATE_WRITE_PATH_ENABLED` is still UNSET so the POST handler short-circuits before reaching the A10 code path; GET handler unchanged; admin endpoint returns 401 to all callers):

```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
git revert HEAD --no-edit
```

Then push. Vercel rebuilds. Post-revert: the new code is gone; the orphaned `ADMIN_USER_EMAIL` env var (if set) becomes inert; the kill-switch stays UNSET; production returns to the design-pass close state.

**C. After push AND migrations applied AND env vars set** (the system is operational): set `SUBSTRATE_WRITE_PATH_ENABLED` to anything other than `"true"` (or unset it) in Vercel → kill-switch fires → all POST returns 503 immediately. If A10 itself needs reverting (rather than just disabling), `git revert HEAD` + push will restore the pre-A10 `verifyAgentIdOwnership` body but the new `api_keys` columns + the `credential_audit` table remain (they're additive and idempotent; harmless if unused). Removing them requires a separate cleanup migration.

**Supabase rollback** (if needed during the build): the two new SQL files are additive and idempotent. To undo: `ALTER TABLE api_keys DROP COLUMN IF EXISTS agent_id`, `DROP COLUMN IF EXISTS owner_user_id`, `DROP COLUMN IF EXISTS purpose`, `DROP COLUMN IF EXISTS revoked_at`; `DROP TABLE IF EXISTS credential_audit`; `DROP INDEX IF EXISTS api_keys_atl_write_owner_agent_unique`; `DROP INDEX IF EXISTS api_keys_purpose_agent_id_idx`. Drop columns on a populated `api_keys` table is safe as long as no row depends on those columns (existing rows don't — they default to NULL or `'ecosystem'`).

---

## Forecast

A successful A10 build session produces:

- 2 new schema migration files (`api_keys` extension; `credential_audit` table).
- `security.ts` modifications (new validator + token generator + admin check + verify-event logger).
- New admin endpoint route (mint + revoke).
- Modified accreditation route (auth-gate body swap; `verifyAgentIdOwnership` becomes `async`).
- New + modified test files.
- 1 new Vercel env var (admin identifier).
- 1 new decision-log entry (full form for Critical).
- 1 session close (full form for Critical).

After the session lands + the founder pushes + sets env vars + applies the SQL migrations + sets `SUBSTRATE_WRITE_PATH_ENABLED='true'` + mints the first credential via the admin endpoint, the substrate's write surface is operational with per-agent auth. Every credential write traces to a specific `agent_id` whose identity has been verified at the route boundary.

**The post-6b arc closes** after this session. The substrate carries authenticated read AND write public surfaces, both auditable. The next arc — likely the wrapper-iteration patterns (Q9 deferred under the kathekon design) or the K-category migration (the build-arc cache's K-category — translation-sandwich consumer migration onto the now-complete substrate) — opens against a substrate that is itself complete enough to support consumer work.

*End of prompt.*
