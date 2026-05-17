# Next-Session Prompt — Session #6 of the post-6b arc tail: A10 Build (Critical)

**Stream:** founder.
**Tier:** `code-critical` — **Critical** risk under 0d-ii. **Full** template per the standing protocol cache. **Critical Change Protocol applies** (per `/adopted/standing-protocol-cache.md` §"Critical-risk sessions" + project instructions 0c-ii). **AC7 ENGAGED** (auth surface change + schema additions to live tables + new admin endpoint + deployment-configuration change via new env var). **PR6 NOT engaged** (no R20a / distress-classifier surface; the §A6/A7 R20a perimeter subsection of the rewritten design explicitly notes A10 doesn't touch the perimeter).
**Governing frame:** `/adopted/standing-protocol-cache.md` (general protocol — `code-critical` row → **Full** template + Critical Change Protocol) + `/adopted/build-sessions-protocol-cache.md` (build-arc context — "no current users" governing note applies; CCP step 3 simplified to "N/A — only founder + test logins exist; no third-party sessions to invalidate").
**Predecessor session close:** `/operations/handoffs/founder/2026-05-17-A10-design-rewrite-close.md` (A10 design rewrite Adopted; the rewritten design Supersedes the original A10 design).
**Predecessor decision-log entries (load-bearing for this build):**
- `D-ATL-A10-DESIGN-LOCKED-REWRITE-2026-05-17` (the rewritten spec — THIS is the operative design the build implements)
- `D-ATL-A10-DESIGN-LOCKED-2026-05-16` (predecessor — **Superseded by the rewrite**; preserved in git history for context only; do not implement against this)
- `D-PASS-THROUGH-FIELDS-BUILD-WIRED-VERIFIED-2026-05-17` (the 7 pass-through fields landed; Decision 3 of the rewrite integrates them)
- `D-BILLING-MODEL-BUILD-WIRED-VERIFIED-2026-05-17` (Option D Live; Decision 2 of the rewrite addresses the no-integration posture)
- `D-ATL-WRITE-PATH-BUILD-WIRED-VERIFIED-2026-05-16` (the write-path build whose `verifyAgentIdOwnership` seam A10 fills; Decision E of the rewrite extends the function's signature and rewrites its body)
**Sequencing source:** session #6 of 6 in the post-6b arc tail per the 2026-05-17 A10 design rewrite close's "Next Session Should" block. After this session lands, the post-6b arc closes.
**Risk classification:** **Critical** under 0d-ii. **The full Critical Change Protocol applies — six steps must be responded to VISIBLY in the conversation BEFORE any code or schema is touched.**

---

## Why this session matters

This session implements the rewritten A10 design and **closes the post-6b arc**. After it lands, the substrate carries authenticated read AND write public surfaces, both auditable; every credential write traces to a specific agent_id whose identity has been verified at the route boundary AND whose operational scope (identity_model + path_posture) has been checked against the credential's scope columns; AccreditationPayload exposes four new typical_* fields parallel to the existing pattern; agent_accreditation gains forensic JOIN-traceability to loop_billing_events via a nullable loop_id column.

The pre-A10 stopgap (`SUBSTRATE_WRITE_PATH_ENABLED` env var as the sole gate) is retained as the kill-switch but is no longer the primary gate. A10 token verification becomes primary. The post-A10 deployment posture: both must succeed for a write to land — defence-in-depth.

**This is a Critical-risk session.** The Critical Change Protocol exists because mistakes at the auth surface can lock the founder out of the deployment OR expose the write surface unsafely. Every step in Part B is structured to make those failure modes visible and recoverable.

Plan **~3.5–4.5 hr** including the Critical Change Protocol overhead at session open. Plan to commit to a single sitting — the build's nine file changes are interdependent and a mid-build interruption risks partial-state.

---

## Pre-conditions

1. **Session #5's commit pushed to git** and the founder has confirmed the rewritten design at `/adopted/atl-a10-design.md` matches expectations. The four bullet points in session #5's close's "Founder Verification" section 1 confirmed.
2. **The founder is in a single uninterrupted sitting.** ~3.5–4.5 hr including CCP. Do not begin this session if there's a hard time boundary inside that window.
3. **Production state unchanged from session #5 close** (substrate at A7 Verified; Option D per-loop metering Live + Verified; pass-through fields Verified end-to-end; Stripe test-mode wiring Verified; Stripe live activation Deferred; `SUBSTRATE_WRITE_PATH_ENABLED` UNSET; `SUBSTRATE_LAYER3_ENABLED` UNSET; `SUBSTRATE_R20A_GATE_ENABLED` UNSET; both ATL tables empty).
4. **The founder has the Stripe Dashboard / Supabase Dashboard / Vercel Dashboard accessible.** Mid-build steps will require generating an env var value (`ADMIN_USER_EMAIL` or `ADMIN_USER_ID`) and adding it to Vercel pre-deploy.
5. **The founder has confirmed they can identify the rollback path before approving Step 0's Critical Change Protocol step 4.** The rollback is documented in the rewritten design's banner + this prompt's Rollback path section — the founder confirms they understand BEFORE approving.

---

## Part A — Open under the protocol

Read in order:

1. **`/adopted/standing-protocol-cache.md`** (~3 min) — confirms tier (`code-critical`), risk class (Critical), full template, Critical Change Protocol, signals, status vocabulary. **Confirm model selection N/A** (the build session has no LLM calls — pure code + schema work). **Confirm AC1 + KG2 NOT engaged** (no model selection question).
2. **`/adopted/build-sessions-protocol-cache.md`** (~3 min) — confirm "no current users" governing note (CCP step 3 simplification applies).
3. **`/operations/handoffs/founder/2026-05-17-A10-design-rewrite-close.md`** (~5 min) — predecessor close. Particularly the Status Changes table + Open Questions block (Layer 3 prose anomaly + source-of-truth port-mirror reconciliation carry forward as deferred; orphaned-credential auto-revocation is a new deferred item the build session has discretion on — recommendation: immediate auto-revocation rule, deferred to a follow-on Standard-risk session per PR7).
4. **`/adopted/atl-a10-design.md`** in full (~25–30 min) — the rewritten design. **Read every section carefully.** Particularly:
   - The "What changed from the predecessor design" section — three integrations narrated
   - Decision C in full — the migration shape (NEW: only `purpose` + `revoked_at` columns; 2 scope columns; CHECK constraint; full SQL inline)
   - Decision C's "Updated structural constraint — agent_accreditation extensions" subsection — 4 typical_* columns + loop_id column + their CHECK constraints
   - Decision E in full — the `validateAtlWriteToken` signature extension with optional CarriedProfile param; the new `'wrong_scope'` failure reason; the route's `verifyAgentIdOwnership` extension to accept body param
   - The "Integration with adjacent surfaces" section — §Option D billing (no integration; loop_id column for JOIN), §Pass-through fields (3a + 3b + 3c integration shapes), §A6/A7 R20a perimeter (NOT engaged)
   - The "Build-session implementation summary" table — the canonical file change list this session implements
5. **`D-ATL-A10-DESIGN-LOCKED-REWRITE-2026-05-17`** decision-log entry in full (~5 min) — the lean-form spec entry; cross-references confirm the integrations.
6. **`/api/api-keys-schema.sql`** (~5 min) — particularly lines 75 (`agent_id TEXT`), 77 (`owner_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL`), 105 (`idx_api_keys_owner_user_id`). **The Finding 1 source-of-truth.** Confirm the existing columns + reference target + ON DELETE behaviour.
7. **`/api/migrations/option-d-billing-schema.sql`** (~5 min) — the `loop_billing_events` schema + the existing `increment_api_usage` RPC's signature. A10 does NOT modify these; Decision 2 of the rewrite's no-integration posture is preserved. Confirm the column shape that `agent_accreditation.loop_id` will JOIN against.
8. **`/website/src/lib/security.ts`** in full (~10 min) — the existing `validateApiKey` + `hashKey` + `extractRawKey` + `requireAuth` precedents A10 reuses. **The build session extends this file substantially** — add `AtlWriteValidationResult` type + `validateAtlWriteToken` async function + `generateAtlWriteToken` helper + `logAtlVerifyEvent` helper + `requireAdmin` helper + `resolveProfileId` helper. Confirm the existing patterns + naming conventions to align with.
9. **`/website/src/app/api/admin/api-keys/route.ts`** (~5 min) — the existing admin endpoint precedent the new `/api/admin/accreditation-credentials/route.ts` mirrors. Auth pattern + response shape + error handling to align with.
10. **`/website/src/app/api/accreditation/[agent_id]/route.ts`** in full (~5–10 min) — the existing write surface. Particularly the `verifyAgentIdOwnership` function (whose body the build rewrites + signature extends per Decision E) and the POST handler (which needs to extract the new typical_* + loop_id body fields and pass them to the writer per Decisions 3b + 3c).
11. **`/website/src/lib/substrate/atl-accreditation-writer.ts`** (~5 min) — the writer library. Build session extends it to accept the 4 typical_* fields + loop_id and persist them on `agent_accreditation`.
12. **`/website/src/lib/substrate/trust-layer/accreditation/accreditation-record.ts`** (~5 min) — `buildAccreditationPayload` lives here. Build session extends it to expose the 4 new typical_* fields. Note this file is a ported mirror of `/trust-layer/accreditation/accreditation-record.ts` (banner instructs port-mirror discipline; the source-of-truth file is currently drifted per the predecessor close — build session has discretion to reconcile or defer; **recommendation: defer to a follow-on Standard-risk session**).
13. **`/website/src/lib/substrate/trust-layer/types/accreditation.ts`** (~5 min) — `AccreditationRecord` + `AccreditationPayload` types. Build session extends both with 4 new optional typical_* fields. Same port-mirror discretion.
14. **`/website/src/lib/substrate/trust-layer/types/evaluation.ts`** (~3 min) — confirm the 7 pass-through enum types landed correctly per session #4 (informational; the build session imports these for the agent_accreditation CHECK constraints' enum values).
15. **`/website/src/lib/substrate/atl-wrapper.ts`** (~3 min) — confirm the 2 CarriedProfile fields (`downstream_identity_model`, `path_posture`) landed in the interface per session #4 (informational).
16. **`/operations/decision-log.md`** last 3 entries (~5 min) — confirm `D-ATL-A10-DESIGN-LOCKED-REWRITE-2026-05-17`, `D-PASS-THROUGH-FIELDS-BUILD-WIRED-VERIFIED-2026-05-17`, `D-BILLING-MODEL-BUILD-WIRED-VERIFIED-2026-05-17` are visible and the predecessor `D-ATL-A10-DESIGN-LOCKED-2026-05-16` has Status `Superseded by D-ATL-A10-DESIGN-LOCKED-REWRITE-2026-05-17`.
17. **PR11 inbox scan** — list `/inbox/` for files dated since the predecessor close (2026-05-17). No new files expected.
18. **PR15 consult** — `.claude/skills/anthropic/` review. Candidate primitives: `claude-api` (informational SDK patterns); `mcp-builder` (forward pointer for R18c — post-A10 credential issuance could later be exposed as an MCP tool). Bespoke election expected — substrate-internal auth surface has no Anthropic primitive substitute; the existing `api_keys` + `validateApiKey` infrastructure IS the production-adjacent reusable primitive (Finding 1 correction strengthens this; the columns already exist). Record the consult.

**Confirm at open:** tier (`code-critical`); hold-point status (P0 0h active); model selection (N/A — no LLM calls; AC1 + KG2 NOT engaged); status vocabulary (`Scoped → Designed → Scaffolded → Wired → Verified → Live` for implementation; `Adopted / Under review / Superseded` for decisions); signals + risk classification per 0d-ii; **Critical Change Protocol APPLIES**; **AC7 ENGAGED**; PR6 NOT engaged; PR1 (single-build proof — every change below lands this session); PR2 (build-to-wire immediate — tests invoke new code paths same session); KG1 ENGAGED (every DB write/read in the new admin endpoint + validator + audit logger + writer extension must be awaited; no fire-and-forget); KG7 NOT engaged (no JSONB writes at the credential layer; `credential_audit.details` is JSONB but holds free-form context only).

---

## Part B — Procedure

### Step 0 — Critical Change Protocol (~15–20 min)

**Mandatory.** Before any code or schema is touched, respond to the six Critical Change Protocol steps VISIBLY in the conversation. The founder approves at step 6 specifically against the named risks before any work proceeds.

The six CCP steps (per `/adopted/standing-protocol-cache.md` §"Critical-risk sessions" + project instructions 0c-ii):

**Step 0.1 — What is changing.** Plain language summary from the founder's perspective. (Suggested content: "This session adds A10 per-agent credentials. The substrate's write surface (POST /api/accreditation/[agent_id]) becomes auth-gated by per-agent tokens you mint via a new admin endpoint. The kill-switch stays. New tables hold credential audit + new columns on api_keys hold credentials + new columns on agent_accreditation hold typical_* aggregates + a loop_id JOIN column.")

**Step 0.2 — What could break.** Specific failure modes:
- Schema migration on `api_keys` fails partway → table in inconsistent state. Mitigation: every ALTER is idempotent (`IF NOT EXISTS`); migration runs in a transaction per Supabase SQL Editor convention.
- Schema migration on `agent_accreditation` fails partway → same. Same mitigation.
- New CHECK constraint on `api_keys` rejects an existing row → migration aborts. Mitigation: the CHECK constraint allows `purpose != 'atl_write'` cases; all existing rows are `purpose='ecosystem'` (default), so the existing rows pass. If any existing row already has `purpose='atl_write'` with NULL `agent_id` or NULL `owner_user_id` (impossible in current production state but check), abort and surface to founder for case-by-case handling.
- `validateAtlWriteToken` function logic error → either accepts invalid tokens (security failure) or rejects valid ones (lockout). Mitigation: tests cover all five failure modes (no_token, invalid_token, wrong_agent, wrong_scope, ok) + the kill-switch path; founder confirms tests pass before deploy.
- New admin endpoint authz error → either allows non-admin mint (security failure) or rejects founder mint (lockout). Mitigation: `requireAdmin` helper is the single check point; tests cover non-admin 401 + admin 200; founder confirms env var is set in Vercel before flipping `SUBSTRATE_WRITE_PATH_ENABLED`.
- Route extension to `verifyAgentIdOwnership` breaks the existing call site's signature → TypeScript build fails. Mitigation: TypeScript catches this at `npx tsc --noEmit` BEFORE deploy; if tsc clean, the signature change is safe.
- `buildAccreditationPayload` extension breaks third-party verifier parsers → unlikely (additive optional fields; existing parsers ignore unknown fields). Mitigation: the new typical_* fields default to `null` when not populated; existing AccreditationPayload responses are byte-identical for existing agent_accreditation rows (which lack the new columns' data); only newly-written rows will carry the new fields.

**Step 0.3 — What happens to existing sessions.** Per the build-arc cache's "no current users" governing note: **N/A — only founder + test logins exist; no third-party sessions to invalidate.** This is the simplification the build-arc cache authorises pre-launch.

**Step 0.4 — Rollback plan.** See the Rollback path section below for the full detail. The founder must understand the rollback BEFORE approving step 6.

Summary: pre-push, `git reset --hard HEAD~N` discards local commits + the founder runs the schema rollback SQL in Supabase SQL Editor (provided inline below). Post-push, `git revert HEAD~N..HEAD --no-edit` + push via GitHub Desktop; Vercel rebuilds (~2 min) back to pre-A10 shape + the founder runs the schema rollback SQL. The pre-A10 stopgap (`SUBSTRATE_WRITE_PATH_ENABLED` env var) is unaffected by the rollback — it continues to function as it did pre-A10 (UNSET → write surface returns 503).

**Step 0.5 — Verification step.** After deploy + before flipping `SUBSTRATE_WRITE_PATH_ENABLED`:
1. Founder runs `npx tsc --noEmit` locally — expected: clean exit.
2. Founder runs the schema verification queries in Supabase SQL Editor (provided in Step 10 of this prompt) — expected: new columns visible; new table visible; CHECK constraints visible.
3. Founder runs the admin endpoint smoke test with their admin credentials — expected: mint returns raw token + structured response; revoke returns success; non-admin call returns 401.
4. Founder confirms `ADMIN_USER_EMAIL` (or `ADMIN_USER_ID`) is set in Vercel.
5. **Only after all four pass: founder flips `SUBSTRATE_WRITE_PATH_ENABLED` to `"true"` in Vercel** and runs the write-path POST smoke test with a freshly-minted A10 token — expected: HTTP 200 with the substrate response; verification log shows `outcome: ok`.

**Step 0.6 — Explicit founder approval.** Founder responds: "OK to proceed against the named risks" (or specifies adjustments). The build does NOT proceed until this approval is in writing.

### Step 1 — Scope confirmation via AskUserQuestion (~5–10 min)

After CCP approval, surface via AskUserQuestion:

1. **Migration runner.** Build session generates SQL files; founder runs them in Supabase SQL Editor. Confirmed?
2. **Port-mirror reconciliation.** The source-of-truth `/trust-layer/types/accreditation.ts` + `/trust-layer/accreditation/accreditation-record.ts` are currently drifted (per predecessor close). Build session further drifts them (extending `AccreditationRecord` + `AccreditationPayload` + `buildAccreditationPayload`). Reconcile in-build OR defer to a follow-on Standard-risk session? **Recommended: defer** (keeps this Critical session focused).
3. **Orphaned-credential auto-revocation** (Decision B PR7-deferred item). Build session implements immediate auto-revocation on `owner_user_id IS NULL` for `purpose='atl_write'` rows (recommended)? OR defer to a follow-on Standard-risk session?
4. **Admin check pattern** (Decision D discretion). `ADMIN_USER_EMAIL` (string equality on `user.email`) OR `ADMIN_USER_ID` (UUID equality on `user.id`)? **Recommended: ADMIN_USER_EMAIL** (easier for the founder to verify the value at the Vercel UI; user.id is less human-readable). Both produce equivalent security; the founder elects.

Founder elects each. Locks scope before code is touched.

### Step 2 — Schema migrations (~20–30 min)

Generate three SQL files under `/website/` (matching the existing pattern of `supabase-*-migration.sql` files):

**Step 2.1** — `/website/supabase-api-keys-a10-migration.sql` (NEW). Per the rewritten design's Decision C "Updated structural constraint — schema migration text" subsection. Contains:
- `ALTER TABLE public.api_keys ADD COLUMN IF NOT EXISTS purpose TEXT NOT NULL DEFAULT 'ecosystem';`
- `ADD CONSTRAINT api_keys_purpose_check CHECK (purpose IN ('ecosystem', 'atl_write'));` (wrapped in `DO $$ BEGIN ... EXCEPTION WHEN duplicate_object THEN NULL; END $$` for idempotency)
- `ALTER TABLE public.api_keys ADD COLUMN IF NOT EXISTS revoked_at TIMESTAMPTZ;`
- `ALTER TABLE public.api_keys ADD COLUMN IF NOT EXISTS scope_downstream_identity_model TEXT;` + its CHECK constraint
- `ALTER TABLE public.api_keys ADD COLUMN IF NOT EXISTS scope_path_posture TEXT;` + its CHECK constraint
- The load-bearing NOT NULL invariant CHECK: `ADD CONSTRAINT api_keys_atl_write_requires_owner_and_agent CHECK (purpose != 'atl_write' OR (agent_id IS NOT NULL AND owner_user_id IS NOT NULL));`
- The unique index `api_keys_atl_write_owner_agent_unique` and the lookup index `api_keys_purpose_agent_id_idx`
- A verification SELECT at the end echoing the new columns + constraints

**Step 2.2** — `/website/supabase-credential-audit-migration.sql` (NEW). Per the rewritten design's Decision H. The `actor_user_id UUID REFERENCES public.profiles(id)` reference target (Finding 1 correction). Three indexes.

**Step 2.3** — `/website/supabase-agent-accreditation-a10-migration.sql` (NEW). Per the rewritten design's Decision C's "Updated structural constraint — agent_accreditation extensions" subsection. **Build session FIRST verifies the live `agent_accreditation` schema** via a SELECT against `information_schema.columns` to confirm the existing column set. Then four `typical_*` columns + their CHECK constraints + nullable `loop_id UUID` column + its index.

For all three migrations: idempotent (`IF NOT EXISTS` everywhere; CHECK constraints wrapped in `DO $$ ... EXCEPTION WHEN duplicate_object` blocks); verification SELECT at the end of each file.

Founder runs each in Supabase SQL Editor (one at a time, not as a batch) and reports the verification SELECT's output back. The build session confirms each is Verified before proceeding to Step 3.

### Step 3 — security.ts extensions (~30–40 min)

Extend `/website/src/lib/security.ts` per the rewritten design's Decision E "Updated structural constraint" subsection + Decision D's helpers list. Add (in order):

1. **`AtlWriteValidationResult` discriminated union type** — with the five failure reasons (`'no_token' | 'invalid_token' | 'wrong_agent' | 'wrong_scope'`) plus the `valid: true` shape including the scope echoes.
2. **`generateAtlWriteToken()` helper** — returns `{ raw: 'sr_atl_<32 hex>', hash: 'sha256-hex' }`. Reuses the existing `crypto.randomBytes(16).toString('hex')` + `createHash('sha256')` patterns from `validateApiKey`.
3. **`validateAtlWriteToken(rawToken, agent_id, carriedProfile?)` async function** — per the rewritten design's Decision E implementation outline (seven steps including the new scope check at step 6). The query selects `id, agent_id, owner_user_id, scope_downstream_identity_model, scope_path_posture` from `api_keys` filtering `key_hash = $1 AND purpose = 'atl_write' AND is_active = true`.
4. **`logAtlVerifyEvent(event)` helper** — per the rewritten design's Decision H "Updated 2026-05-17" event-shape outline. Includes the four new scope fields. `console.log(JSON.stringify(event))` for the Vercel-logs path.
5. **`requireAdmin(request)` helper** — wraps `requireAuth` + checks the authenticated user against the env-var-supplied admin (per Step 1's election). Returns the authenticated user object if admin; throws / returns null if not (matches the existing `requireAuth` pattern).
6. **`resolveProfileId(user_id)` helper** — auth.users.id → profiles.id lookup. If the existing codebase already has this helper (build session greps for it first), reuse; otherwise add. Single Supabase query.

**KG1 compliance:** all four DB-touching functions (`validateAtlWriteToken`, `requireAdmin`, `resolveProfileId`, and indirectly `logAtlVerifyEvent` if it writes to a future audit destination) await all reads/writes. No fire-and-forget.

Run `npx tsc --noEmit` after this step to confirm types align. **Do NOT proceed to Step 4 if tsc reports errors.**

### Step 4 — NEW admin endpoint (~25–35 min)

Create `/website/src/app/api/admin/accreditation-credentials/route.ts` (NEW) per the rewritten design's Decision D. Two handlers:

**POST handler (mint):** per Decision D's 8-step flow (with step 3 being the auth.users.id → profiles.id resolution). Accepts optional `scope_downstream_identity_model` + `scope_path_posture` per Decision 3a. Response shape per Decision D's "Structural constraint" subsection — includes the scope echoes + the `warning` field.

**DELETE handler (revoke):** sets `is_active = false`, `revoked_at = now()`, `suspended_reason`; writes `credential_audit` row with `event_type = 'revoke'`; returns the response shape per Decision D.

Both handlers gate via `requireAdmin`; both write `credential_audit` rows in the same transactional flow as the api_keys mutation (KG1).

Run `npx tsc --noEmit` after this step.

### Step 5 — Modified accreditation/[agent_id]/route.ts (~20–30 min)

Extend `/website/src/app/api/accreditation/[agent_id]/route.ts` per the rewritten design's Decision E "Updated structural constraint":

1. Make `verifyAgentIdOwnership` `async` (was synchronous pre-A10).
2. Extend its signature with a third param: `body: { carried_profile?: { downstream_identity_model?: string; path_posture?: string } } | null`.
3. Rewrite its body per the rewritten design's Decision E "Updated structural constraint" code outline (5 steps: kill-switch check → header extract → CarriedProfile extract → delegate to `validateAtlWriteToken` → map result to `AuthGateResult`).
4. Update the POST handler's call site to `await verifyAgentIdOwnership(...)` and pass the parsed body. Parse the body once (no double-parse cost).
5. Extract the new typical_* + loop_id values from the body and pass them through to the writer library (Step 6 — `atl-accreditation-writer.ts` extension).
6. Update the route file's header comments to describe post-A10 behaviour (per Decision I's structural constraint).

Run `npx tsc --noEmit` after this step.

### Step 6 — Modified atl-accreditation-writer.ts (~15–20 min)

Extend `/website/src/lib/substrate/atl-accreditation-writer.ts` to accept the 4 typical_* fields + the loop_id and persist them on the `agent_accreditation` row. Additive change; existing callers (which don't supply the new fields) get nullable defaults at the schema level.

The build session reads the existing writer signature first; the extension adds the 4 + 1 fields as optional params; the Supabase INSERT/UPDATE includes them when present; KG1 — all writes awaited.

Run `npx tsc --noEmit` after this step.

### Step 7 — Modified accreditation-record.ts + types/accreditation.ts (~15–20 min)

Extend `/website/src/lib/substrate/trust-layer/accreditation/accreditation-record.ts` to extend `buildAccreditationPayload` with the 4 new typical_* fields per the rewritten design's "Integration with adjacent surfaces" §Pass-through fields subsection. Pattern matches the existing `typical_deliberation_breadth` + `typical_kathekon_quality` extension.

Extend `/website/src/lib/substrate/trust-layer/types/accreditation.ts` to add the 4 new optional fields to `AccreditationRecord` and `AccreditationPayload`.

**Port-mirror discipline:** the source-of-truth files at `/trust-layer/types/accreditation.ts` + `/trust-layer/accreditation/accreditation-record.ts` are currently drifted (per predecessor close). Per Step 1's election, the build session either reconciles in-build OR defers to a follow-on Standard-risk session (recommended: defer).

Run `npx tsc --noEmit` after this step.

### Step 8 — Tests (~30–40 min)

Three test files:

**Step 8.1** — `/website/src/lib/__tests__/security.test.ts` (MODIFIED or NEW). Tests for `validateAtlWriteToken`:
- Token-prefix-rejection (`no_token` for missing/wrong-prefix tokens)
- Unknown-hash → `invalid_token`
- Revoked credential → `invalid_token` (fails on `is_active = false` filter)
- Wrong-agent → `wrong_agent`
- **Wrong-scope** (NEW per Decision 3a): credential scoped to `vendor_framework` + CarriedProfile says `browser_session` → `wrong_scope`
- Successful validation with no scope (both scope columns NULL on credential) → `valid: true`
- Successful validation with matching scope → `valid: true`

Uses a Supabase test fixture or mock per existing pattern. ~10–15 plain-assertion tests.

**Step 8.2** — `/website/src/app/api/accreditation/[agent_id]/__tests__/route.test.ts` (MODIFIED). Existing tests' setup needs to mock or provision a valid A10 credential; the auth-gate tests now exercise the A10 verification path; new tests:
- `unauthorized` test verifies 401 for unknown / revoked / wrong-agent / **wrong-scope** tokens
- `not_enabled` test verifies 503 still fires when the kill-switch is off (Decision I preserved)
- New tests for the new request body fields (typical_* + loop_id flow through to the writer per Decisions 3b + 3c)

**Step 8.3** — `/website/src/app/api/admin/accreditation-credentials/__tests__/route.test.ts` (NEW). Tests for the new admin endpoint:
- Founder-only auth (401 for non-admin)
- Successful mint returns raw token + structured response
- Mint writes `credential_audit` row with scope_* in details
- Mint enforces unique constraint (409 on duplicate `(owner, agent_id, atl_write)`)
- **Mint with optional scope params succeeds; scope params persist on the row** (Decision 3a)
- Revoke sets `is_active = false`, `revoked_at`, `suspended_reason`
- Revoke writes `credential_audit` row

Pattern matches the existing test files (plain-assertion `npx tsx` style per CLAUDE.md note about the test harness).

Run all three test files after creation. Expected: all pass. If any fail, debug + fix BEFORE proceeding.

### Step 9 — Add ADMIN_USER_EMAIL env var (~5 min)

Per Step 1's election (recommendation: ADMIN_USER_EMAIL). Founder adds the env var to Vercel:
- Dashboard → Project → Settings → Environment Variables → Add Variable
- Key: `ADMIN_USER_EMAIL` (or `ADMIN_USER_ID` if elected)
- Value: founder's email address (or user.id UUID)
- Environments: Production, Preview, Development (all three)

**Do NOT deploy yet.** The env var must be in place before the new admin endpoint is deployed — otherwise the `requireAdmin` helper has nothing to check against.

### Step 10 — Verify (~15–20 min)

Per the rewritten design + CCP step 5:

**Step 10.1** — Local TypeScript: `cd /Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/website && npx tsc --noEmit`. Expected: clean exit.

**Step 10.2** — Local tests:
```
cd /Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/website
npx tsx --env-file=.env.local src/lib/__tests__/security.test.ts
npx tsx --env-file=.env.local src/app/api/admin/accreditation-credentials/__tests__/route.test.ts
npx tsx --env-file=.env.local src/app/api/accreditation/[agent_id]/__tests__/route.test.ts
```
(Per the CLAUDE.md note about supabase-server.ts requiring `--env-file=.env.local` for tests that transitively import it.) Expected: each ends with `--- Results: N pass, 0 fail ---`.

**Step 10.3** — Schema verification queries (provided inline by the build session; founder runs in Supabase SQL Editor):
```sql
-- Confirm api_keys new columns + constraints
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'api_keys'
  AND column_name IN ('purpose', 'revoked_at', 'scope_downstream_identity_model', 'scope_path_posture')
ORDER BY column_name;

-- Confirm CHECK constraints
SELECT conname, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'public.api_keys'::regclass
  AND conname LIKE 'api_keys_%';

-- Confirm credential_audit table
SELECT column_name, data_type FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'credential_audit'
ORDER BY ordinal_position;

-- Confirm agent_accreditation new columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'agent_accreditation'
  AND column_name IN ('typical_operation_class', 'typical_target_system_vendor',
                      'typical_outcome_verification', 'typical_reversibility_signal',
                      'loop_id')
ORDER BY column_name;
```
Expected: all four queries return the expected new columns + constraints visible.

**Step 10.4** — Commit + push via GitHub Desktop (build session provides the exact commit command with multi-line message).

**Step 10.5** — Vercel rebuild (~2 min; watch in Vercel dashboard).

**Step 10.6** — Post-deploy admin endpoint smoke test (founder runs):
```
# Mint
curl -i -X POST https://www.sagereasoning.com/api/admin/accreditation-credentials \
  -H "Authorization: Bearer <founder-supabase-session-token>" \
  -H "Content-Type: application/json" \
  -d '{"agent_id":"agent_test_a10_001","purpose":"atl_write","label":"A10 test credential"}'
```
Expected: HTTP 200 with `{ credential: {...}, token: "sr_atl_<32 hex>", warning: "..." }`. Founder records the raw token securely (shown once).

**Step 10.7** — Post-deploy write-path verification (founder runs):
```
# First flip SUBSTRATE_WRITE_PATH_ENABLED to "true" in Vercel
# Wait for the redeploy (~2 min)
# Then run the write-path POST
curl -i -X POST https://www.sagereasoning.com/api/accreditation/agent_test_a10_001 \
  -H "Authorization: Bearer sr_atl_<the-token-from-Step-10.6>" \
  -H "Content-Type: application/json" \
  -d '{"carried_profile":{...minimal payload per the existing API contract...}}'
```
Expected: HTTP 200 with the substrate response (agent_accreditation row persisted).

**Step 10.8** — Failure-mode smoke tests (founder runs):
- POST without `Authorization` header → expected 401 (`no_token`)
- POST with `Authorization: Bearer sr_atl_INVALID` → expected 401 (`invalid_token`)
- POST with the valid token but wrong agent_id in the URL → expected 401 (`wrong_agent`)
- DELETE the test credential via the admin endpoint → expected 200
- POST again with the now-revoked token → expected 401 (`invalid_token`)

**Step 10.9** — Founder flips `SUBSTRATE_WRITE_PATH_ENABLED` back to UNSET (or `"false"`) IF the build is being kept inert for further testing. Or LEAVES it `"true"` if production write surface should remain operational. Founder's call.

### Step 11 — Append decision-log entry (full form per Critical) (~20–30 min)

Pattern: per `/adopted/standing-protocol-cache.md` §"Critical-risk sessions" — the full decision-log entry includes Verification Method Used + Risk Classification Record + PR5 Knowledge-Gap Carry-Forward sections. Entry: `D-ATL-A10-BUILD-WIRED-VERIFIED-YYYY-MM-DD`. Captures: all nine decisions A–I implemented + the three rewrite integrations (Finding 1 CHECK constraint; loop_id JOIN column; pass-through fields scoping + typical_* exposure + aggregates-only persistence); build-session discretion picks (Step 1 elections); risk classification + rollback + verification step; cross-references to the rewritten design + the predecessor write-path build + the four predecessor closes.

### Step 12 — Session close (full form per Critical) (~20–30 min)

Pattern: per `/adopted/standing-protocol-cache.md` §"Critical-risk sessions" — full template. Sections: Verification Method Used (per 0c framework — schema queries, test commands, smoke-test URLs), Risk Classification Record (one line per change Critical/Elevated/Standard), PR5 Knowledge-Gap Carry-Forward (concepts re-explained this session + cumulative count), Decisions Made, Status Changes, Next Session Should (post-arc-close: the K-category migration begins; Stage 1 closure with lawyer engagement; etc.), Blocked On (files uncommitted + production state at close — Production state at session close: substrate at A10 Verified; new credential surface Live IF founder kept SUBSTRATE_WRITE_PATH_ENABLED on, OR Live-but-inert if reverted), Open Questions (Layer 3 prose anomaly + port-mirror reconciliation + orphaned-credential auto-revocation if deferred at Step 1 + ~28 PR7 items from the rewritten design), Founder Verification (Between Sessions — what the founder runs between sessions to confirm the A10 surface is healthy), Orchestration Reminder (per existing Critical close pattern).

---

## Part C — Anticipated session shape

| Phase | Estimate |
|---|---|
| Part A — caches + predecessor close + rewritten A10 design (full) + decision-log entry + production schema + Option D schema + security.ts + admin endpoint precedent + accreditation route + writer + accreditation-record + types + evaluation + atl-wrapper + decision-log last 3 + PR11 + PR15 | 75–100 min |
| Step 0 — Critical Change Protocol (6 steps; visible in conversation; founder approval at step 6) | 15–20 min |
| Step 1 — scope confirmation (4 questions via AskUserQuestion) | 5–10 min |
| Step 2 — schema migrations (3 SQL files; founder runs each; verification SELECTs) | 20–30 min |
| Step 3 — security.ts extensions (6 additions; tsc check) | 30–40 min |
| Step 4 — NEW admin endpoint (POST + DELETE handlers; tsc check) | 25–35 min |
| Step 5 — Modified accreditation/[agent_id]/route.ts (verifyAgentIdOwnership extension; tsc check) | 20–30 min |
| Step 6 — Modified atl-accreditation-writer.ts (4 + 1 field extension; tsc check) | 15–20 min |
| Step 7 — Modified accreditation-record.ts + types (4 typical_* extension; tsc check) | 15–20 min |
| Step 8 — Tests (3 files; ~25–35 tests total; run all) | 30–40 min |
| Step 9 — Add ADMIN_USER_EMAIL env var to Vercel | 5 min |
| Step 10 — Verify (tsc + tests + schema + commit + deploy + smoke tests + failure-mode tests) | 15–20 min |
| Step 11 — decision-log entry (full form per Critical) | 20–30 min |
| Step 12 — session close (full form per Critical) | 20–30 min |
| **Total** | **~5–7 hr** |

(Larger than my session #5 close estimated — Critical sessions carry significant CCP overhead + the build itself touches 9 files + 3 SQL migrations + 3 test files. The 3.5–4.5 hr estimate from the close was conservative against the rewrite's narrower migration scope; this prompt's larger estimate is more realistic against the full file list.)

**If the session looks like it will overrun ~5 hr at the Step 3 mark, the founder may elect to break into two sub-sessions: A10a (schema + security.ts + admin endpoint + tests for those; Critical) and A10b (route + writer + accreditation-record + tests for those + deploy; Critical).** The split is unusual for a single Critical build but the build-arc cache permits time-bounded sessions per Rule B. Both sub-sessions would carry the full Critical Change Protocol.

---

## Rollback path

### Pre-push (commits made locally, not yet pushed)

1. `cd /Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning`
2. `git status` — confirm uncommitted state vs N commits ahead.
3. `git reset --hard HEAD~N` — discards the N most-recent local commits.
4. If schema migrations were run in Supabase, run the rollback SQL (provided below).
5. If env var was added to Vercel, remove it (Dashboard → Settings → Environment Variables → Delete).

No production state change at any point (the local commits never reached Vercel).

### Post-push (commits pushed; Vercel rebuilt)

1. `cd /Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning`
2. `git log --oneline -n N` — confirm the N commits to revert.
3. `git revert HEAD~N..HEAD --no-edit` — creates N revert commits.
4. Push via GitHub Desktop.
5. Vercel rebuilds (~2 min) back to pre-A10 shape.
6. Run the rollback SQL in Supabase (provided below).
7. Remove `ADMIN_USER_EMAIL` from Vercel.

Production state post-revert: A10 admin endpoint returns 404; A10 token verification path doesn't exist; write-path POST at `/api/accreditation/[agent_id]` returns 503 (the pre-A10 stopgap is unaffected by the rollback; it returns to its pre-A10 behaviour).

### Rollback SQL (provided inline so the founder has it before approval)

```sql
-- agent_accreditation rollback (run FIRST — depends on no other table)
ALTER TABLE public.agent_accreditation DROP CONSTRAINT IF EXISTS agent_accreditation_typical_op_class_check;
ALTER TABLE public.agent_accreditation DROP CONSTRAINT IF EXISTS agent_accreditation_typical_vendor_check;
ALTER TABLE public.agent_accreditation DROP CONSTRAINT IF EXISTS agent_accreditation_typical_outcome_check;
ALTER TABLE public.agent_accreditation DROP CONSTRAINT IF EXISTS agent_accreditation_typical_reversibility_check;
DROP INDEX IF EXISTS agent_accreditation_loop_id_idx;
ALTER TABLE public.agent_accreditation DROP COLUMN IF EXISTS typical_operation_class;
ALTER TABLE public.agent_accreditation DROP COLUMN IF EXISTS typical_target_system_vendor;
ALTER TABLE public.agent_accreditation DROP COLUMN IF EXISTS typical_outcome_verification;
ALTER TABLE public.agent_accreditation DROP COLUMN IF EXISTS typical_reversibility_signal;
ALTER TABLE public.agent_accreditation DROP COLUMN IF EXISTS loop_id;

-- credential_audit rollback (run SECOND — references api_keys)
DROP TABLE IF EXISTS public.credential_audit;

-- api_keys rollback (run THIRD — referenced by credential_audit which is now gone)
DROP INDEX IF EXISTS api_keys_atl_write_owner_agent_unique;
DROP INDEX IF EXISTS api_keys_purpose_agent_id_idx;
ALTER TABLE public.api_keys DROP CONSTRAINT IF EXISTS api_keys_atl_write_requires_owner_and_agent;
ALTER TABLE public.api_keys DROP CONSTRAINT IF EXISTS api_keys_scope_path_check;
ALTER TABLE public.api_keys DROP CONSTRAINT IF EXISTS api_keys_scope_identity_check;
ALTER TABLE public.api_keys DROP CONSTRAINT IF EXISTS api_keys_purpose_check;
ALTER TABLE public.api_keys DROP COLUMN IF EXISTS scope_path_posture;
ALTER TABLE public.api_keys DROP COLUMN IF EXISTS scope_downstream_identity_model;
ALTER TABLE public.api_keys DROP COLUMN IF EXISTS revoked_at;
ALTER TABLE public.api_keys DROP COLUMN IF EXISTS purpose;
```

The rollback SQL is idempotent (`IF EXISTS` everywhere); safe to run multiple times. After running, the schema is byte-identical to pre-A10.

### What the rollback does NOT touch

- `SUBSTRATE_WRITE_PATH_ENABLED` env var — unaffected by the rollback; it continues to function as it did pre-A10 (UNSET → write surface returns 503).
- The existing `api_keys.agent_id` + `owner_user_id` columns + `idx_api_keys_owner_user_id` index — these pre-date A10 (per Finding 1); they remain in production with their original semantics (self-reported / unverified `agent_id` on legacy rows).
- Option D's `loop_billing_events` table — unaffected; A10 never wrote to it.
- The 7 pass-through fields in the substrate type system — unaffected; they live in code, not schema.
- Stripe test-mode or live-mode wiring — unaffected.

---

## Forecast

A successful A10 build produces:

- **Substrate carries authenticated read AND write public surfaces.** GET at `/api/accreditation/[agent_id]` (Live since the public accreditation endpoint build) + POST at `/api/accreditation/[agent_id]` (Live after A10 + founder flips `SUBSTRATE_WRITE_PATH_ENABLED='true'`).
- **Per-agent credentials with per-credential scoping.** Issued via the new admin endpoint; bound to `(owner_user_id, agent_id)`; optionally scoped to `(downstream_identity_model, path_posture)` per Decision 3a.
- **AccreditationPayload exposes four new typical_* fields.** Procurement reviewers see the agent's typical operational profile.
- **Forensic JOIN-traceability between billing and accreditation.** `agent_accreditation.loop_id` JOINs to `loop_billing_events.loop_id` — "which loop triggered this credential update?"
- **The kill-switch retained.** `SUBSTRATE_WRITE_PATH_ENABLED` becomes the emergency-stop; flipping to UNSET blocks all A10 writes globally without a deploy.

After this session lands, the post-6b arc closes. The substrate's architectural foundation is complete.

**Post-arc work (independent tracks; not blocking each other):**

- **K-category migration.** The bundled-prose consumer migration to the translation-sandwich substrate. Per the build-arc cache's K-category section. Multiple sub-sessions over an extended period.
- **Stage 1 closure: lawyer engagement.** The amended staging plan brings lawyer engagement to Stage 1 close (per ST2 Q4 election). FPE-5 TOS + liability allocation. Independent track.
- **Stripe-Price-ID follow-on.** Standard-to-Elevated; ~30–60 min. Pending accountant + lawyer engagement per the 2026-05-17 Addendum.
- **Layer 3 prose anomaly investigation.** Standard-risk; potentially escalates to Elevated. Founder schedules when ready.
- **Cowork plugin marketplace listing.** Per ST2 Q9 election (Cowork locked as first marketplace).
- **Substrate-plugin packaging work.** Per the substrate-plugin staging plan.

Critical-path items remaining before launch (per the Priority 6 MVP launch criteria in the project instructions): legal review (Stage 1 close); R17 intimate data protections operational (Priority 2); R18 honest certification language (Priority 3); R19 limitations page; R20 vulnerable user detection; R5 cost health alerts (Priority 4 + 7 — partially Live via Option D).

*End of prompt. Paste into a fresh session; the next session begins under Part A.*
