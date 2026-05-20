# Next-Session Prompt — Session #6 of the post-6b arc tail: A10 Build (Critical)

**Supersedes** `/operations/handoffs/founder/2026-05-17-A10-build-NEXT-SESSION-PROMPT.md` (preserved in place with a superseded-by header). This 2026-05-20 version folds in the six-protocols + control-layer annotations applied to the A10 design on 2026-05-20. Use THIS prompt for the A10 build session.

**Stream:** founder.
**Tier:** `code-critical` — **Critical** risk under 0d-ii. **Full** template + Critical Change Protocol (per `/adopted/standing-protocol-cache.md` §"Critical-risk sessions" + project instructions 0c-ii). **AC7 ENGAGED** (auth surface change + schema additions to live tables + new admin endpoint + deployment-configuration change via new env var). **PR6 NOT engaged** (no R20a / distress-classifier surface).
**Governing frame:** `/adopted/standing-protocol-cache.md` (`code-critical` row → Full template + CCP) + `/adopted/build-sessions-protocol-cache.md` ("no current users" governing note; CCP step 3 simplified to "N/A — only founder + test logins exist").
**Operative design (the spec this build implements):** `/adopted/atl-a10-design.md` (rewritten 2026-05-17 under `D-ATL-A10-DESIGN-LOCKED-REWRITE-2026-05-17`; annotated 2026-05-20 with the §Control-layer alignment subsection + agent-card.json build row + AP2/MCP PR7 trigger notes).
**Predecessor decision-log entries (load-bearing):**
- `D-ATL-A10-DESIGN-LOCKED-REWRITE-2026-05-17` (the operative spec — implement against THIS, not the superseded original)
- `D-PASS-THROUGH-FIELDS-BUILD-WIRED-VERIFIED-2026-05-17` (the 7 pass-through fields; Decision 3 of the rewrite integrates them)
- `D-BILLING-MODEL-BUILD-WIRED-VERIFIED-2026-05-17` (Option D Live; Decision 2 of the rewrite addresses the no-integration posture)
- `D-ATL-WRITE-PATH-BUILD-WIRED-VERIFIED-2026-05-16` (the write-path build whose `verifyAgentIdOwnership` seam A10 fills)
**Risk classification:** **Critical** under 0d-ii. **The full Critical Change Protocol applies — the six steps must be responded to VISIBLY in the conversation BEFORE any code or schema is touched.**

## Why this session matters

This session implements the rewritten A10 design and **closes the post-6b arc**. After it lands: the substrate carries authenticated read AND write public surfaces, both auditable; every credential write traces to a specific agent_id whose identity has been verified at the route boundary AND whose operational scope (identity_model + path_posture) has been checked against the credential's scope columns; AccreditationPayload exposes four new typical_* fields; agent_accreditation gains forensic JOIN-traceability to loop_billing_events via a nullable loop_id column; and the substrate's `agent-card.json` declares the A10 auth method for A2A discovery.

The control-layer framing (per the 2026-05-20 §Control-layer alignment subsection in the design) confirms A10 as the substrate's Row 3 (identity/authorization) + Row 7 (kill switch) surface, covering kill-switch Layers 1/2/3 (runtime env-flag, identity revocation, gateway choke point). No new build work arises from the control-layer annotation — the kill-switch mechanisms (Decision F revocation + Decision I env flag) were already in scope; the annotation documents their posture in the now-standard vocabulary.

This is a Critical-risk session. The CCP exists because auth-surface mistakes can lock the founder out of the deployment OR expose the write surface unsafely. Plan **~5–7 hr** including CCP overhead, in a single uninterrupted sitting (the nine file changes are interdependent; mid-build interruption risks partial state). If the session looks like it will overrun ~5 hr at the Step 3 mark, the founder may elect the A10a/A10b split named in Part C.

## Pre-conditions

1. Session #5's commit pushed; the founder has confirmed `/adopted/atl-a10-design.md` (rewritten + 2026-05-20 annotated) matches expectations.
2. The founder is in a single uninterrupted ~5–7 hr sitting.
3. Production state unchanged from the session #5 close (substrate at A7 Verified; Option D Live + Verified; pass-through fields Verified; Stripe test-mode Verified, live Deferred; `SUBSTRATE_WRITE_PATH_ENABLED` UNSET; `SUBSTRATE_LAYER3_ENABLED` UNSET; `SUBSTRATE_R20A_GATE_ENABLED` UNSET; both ATL tables empty).
4. Supabase / Vercel / (Stripe if needed) dashboards accessible — the build will require adding `ADMIN_USER_EMAIL` (or `ADMIN_USER_ID`) to Vercel pre-deploy.
5. The founder understands the rollback path (Rollback section below + the design's banner) BEFORE approving CCP step 6.

## Part A — Open under the protocol

Read in order:

1. **`/adopted/standing-protocol-cache.md`** (~3 min) — confirm tier (`code-critical`), Critical risk, full template, CCP, signals, status vocabulary. Model selection N/A (no LLM calls). AC1 + KG2 NOT engaged.
2. **`/adopted/build-sessions-protocol-cache.md`** (~3 min) — "no current users" note (CCP step 3 simplification).
3. **`/operations/handoffs/founder/2026-05-17-A10-design-rewrite-close.md`** (~5 min) — the session #5 close. Open Questions block (Layer 3 prose anomaly + source-of-truth port-mirror reconciliation carry forward as deferred; orphaned-credential auto-revocation is a build-session-discretion item).
4. **`/adopted/atl-a10-design.md`** in full (~25–30 min) — the operative rewritten + annotated design. Read every section, particularly: the "What changed from the predecessor design" section; Decision C in full (migration shape: only `purpose` + `revoked_at` columns; 2 scope columns; CHECK constraint; full SQL inline; the agent_accreditation extensions subsection); Decision E (validateAtlWriteToken signature + scope check + `'wrong_scope'` reason; route's verifyAgentIdOwnership body extension); the "Integration with adjacent surfaces" section including the **§Control-layer alignment subsection (2026-05-20)** documenting the kill-switch posture; the build-session implementation summary table (the canonical file-change list — note it now includes the agent-card.json row).
5. **`D-ATL-A10-DESIGN-LOCKED-REWRITE-2026-05-17`** decision-log entry in full (~5 min).
6. **`/api/api-keys-schema.sql`** (~5 min) — lines 75 (`agent_id TEXT`), 77 (`owner_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL`), 105 (`idx_api_keys_owner_user_id`). The Finding 1 source-of-truth: these columns + index already exist; the migration reuses them.
7. **`/api/migrations/option-d-billing-schema.sql`** (~5 min) — the `loop_billing_events` schema + `increment_api_usage` RPC. A10 does NOT modify these (Decision 2 no-integration). Confirm the column shape `agent_accreditation.loop_id` will JOIN against.
8. **`/website/src/lib/security.ts`** in full (~10 min) — the `validateApiKey` + `hashKey` + `extractRawKey` + `requireAuth` precedents A10 reuses + extends.
9. **`/website/src/app/api/admin/api-keys/route.ts`** (~5 min) — the existing admin endpoint precedent the new `/api/admin/accreditation-credentials/route.ts` mirrors.
10. **`/website/src/app/api/accreditation/[agent_id]/route.ts`** in full (~5–10 min) — the existing write surface; the build swaps `verifyAgentIdOwnership`'s body + extends its signature, and extends the POST handler to extract the new typical_* + loop_id body fields.
11. **`/website/src/lib/substrate/atl-accreditation-writer.ts`** (~5 min) — the writer; build extends it for the 4 typical_* + loop_id.
12. **`/website/src/lib/substrate/trust-layer/accreditation/accreditation-record.ts`** (~5 min) — `buildAccreditationPayload`; build extends it to expose the 4 typical_* fields. Port-mirror discretion (defer recommended).
13. **`/website/src/lib/substrate/trust-layer/types/accreditation.ts`** (~5 min) — `AccreditationRecord` + `AccreditationPayload`; build extends both with 4 optional typical_* fields.
14. **`/website/src/lib/substrate/trust-layer/types/evaluation.ts`** + **`atl-wrapper.ts`** (~5 min) — confirm the 7 pass-through fields/enums landed per session #4 (informational; imports for the agent_accreditation CHECK constraints).
15. **`/operations/decision-log.md`** last 3 entries (~5 min) — confirm the rewrite entry + predecessor `D-ATL-A10-DESIGN-LOCKED-2026-05-16` shows Status `Superseded by D-ATL-A10-DESIGN-LOCKED-REWRITE-2026-05-17`.
16. **PR11 inbox scan** — list `/inbox/` for files dated after 2026-05-20. The six-protocols + control-layer files (`20260512-0df-promptkit-1.md`, `6 agent protocols.rtfd`, `20260512-v6e-promptkit-1.md`, `AI Agent Shipping readiness.rtfd`) are already-consumed source material reflected in the design's 2026-05-20 annotations. Re-run the scan at session open for anything newer.
17. **PR15 consult** — `.claude/skills/anthropic/` review. `claude-api` informational; `mcp-builder` forward pointer (R18c). Bespoke election justified — the existing `api_keys` + `validateApiKey` infrastructure IS the production-adjacent reusable primitive (Finding 1 strengthens this; columns already exist). Record the consult.

**Confirm at open:** tier (`code-critical`); hold-point status (P0 0h active); model selection (N/A); status vocabulary; signals + risk class; **Critical Change Protocol APPLIES**; **AC7 ENGAGED**; PR6 NOT engaged; PR1 (single-build proof); PR2 (build-to-wire immediate); KG1 ENGAGED (every DB write/read awaited; no fire-and-forget); KG7 NOT engaged (`credential_audit.details` JSONB holds free-form context only).

## Part B — Procedure

### Step 0 — Critical Change Protocol (~15–20 min)

**Mandatory.** Respond to the six CCP steps VISIBLY in the conversation BEFORE any code or schema. Founder approves at step 6 against the named risks.

- **0.1 What is changing** — plain language (A10 per-agent credentials; the write surface becomes auth-gated by per-agent tokens minted via a new admin endpoint; the kill-switch flag stays; new tables/columns hold credential audit + credentials + typical_* aggregates + loop_id).
- **0.2 What could break** — schema migration partial-failure (mitigated by idempotent `IF NOT EXISTS` + transaction); CHECK constraint rejecting an existing row (mitigated — all existing rows are `purpose='ecosystem'`; check for any pre-existing `atl_write` rows with NULL agent_id/owner_user_id, none expected); `validateAtlWriteToken` logic error (mitigated by tests covering all five failure modes + the kill-switch path); admin authz error (mitigated by `requireAdmin` single-check + tests); route signature change breaking the call site (caught by `tsc --noEmit` pre-deploy); `buildAccreditationPayload` extension breaking verifiers (additive optional fields default null; existing responses byte-identical for existing rows).
- **0.3 What happens to existing sessions** — **N/A — only founder + test logins exist; no third-party sessions to invalidate** (build-arc cache "no current users" simplification).
- **0.4 Rollback plan** — see the Rollback section below (pre-push reset / post-push revert + the schema rollback SQL, provided inline). Founder must understand BEFORE approving step 6.
- **0.5 Verification step** — after deploy + before flipping `SUBSTRATE_WRITE_PATH_ENABLED`: (1) `tsc --noEmit` clean; (2) schema verification queries (Step 10); (3) admin-endpoint smoke test; (4) confirm `ADMIN_USER_EMAIL` set in Vercel; (5) only then flip the flag + run the write-path smoke test.
- **0.6 Explicit approval** — founder says "OK to proceed against the named risks" (or specifies adjustments). The build does NOT proceed until this is in writing.

### Step 1 — Scope confirmation via AskUserQuestion (~5–10 min)

After CCP approval: (1) migration runner (SQL files run in Supabase SQL Editor); (2) port-mirror reconciliation (defer recommended); (3) orphaned-credential auto-revocation (immediate auto-revocation on `owner_user_id IS NULL` recommended, OR defer); (4) admin-check pattern (`ADMIN_USER_EMAIL` recommended over `ADMIN_USER_ID`).

### Step 2 — Schema migrations (~20–30 min)

Three SQL files under `/website/`, per the design's Decision C migration text:
- **2.1** `/website/supabase-api-keys-a10-migration.sql` (NEW) — `purpose` + `revoked_at` + `scope_downstream_identity_model` + `scope_path_posture` columns + CHECK constraints (purpose enum; scope enums; the load-bearing `purpose != 'atl_write' OR (agent_id IS NOT NULL AND owner_user_id IS NOT NULL)`) + the unique index + the lookup index. **`agent_id` + `owner_user_id` are NOT added (already exist per `/api/api-keys-schema.sql` 75 + 77).**
- **2.2** `/website/supabase-credential-audit-migration.sql` (NEW) — `credential_audit` table; `actor_user_id` references `public.profiles(id)` (Finding 1 correction); three indexes.
- **2.3** `/website/supabase-agent-accreditation-a10-migration.sql` (NEW) — 4 typical_* columns + CHECK constraints + nullable `loop_id UUID` + its index. **Verify the live `agent_accreditation` schema first** (SELECT against `information_schema.columns`); migration idempotent.

Founder runs each in Supabase SQL Editor one at a time; reports the verification SELECT output; build confirms each Verified before Step 3.

### Step 3 — security.ts extensions (~30–40 min)

Per Decision E + Decision D helpers: add `AtlWriteValidationResult` type (five failure reasons incl. `'wrong_scope'`); `generateAtlWriteToken()`; `validateAtlWriteToken(rawToken, agent_id, carriedProfile?)` async (seven-step body incl. the scope check at step 6); `logAtlVerifyEvent(event)` (Decision H shape incl. scope fields); `requireAdmin(request)`; `resolveProfileId(user_id)` (auth.users.id → profiles.id; reuse if an existing helper is found). All DB-touching functions await reads/writes (KG1). `tsc --noEmit` after this step. Do NOT proceed if errors.

### Step 4 — NEW admin endpoint (~25–35 min)

Create `/website/src/app/api/admin/accreditation-credentials/route.ts` per Decision D. POST (mint, with optional scope params) + DELETE (revoke). Both gate via `requireAdmin`; both write `credential_audit` rows in the same transactional flow as the api_keys mutation (KG1). Response shapes per Decision D (incl. scope echoes + the "shown once" warning). `tsc --noEmit`.

### Step 5 — Modified accreditation/[agent_id]/route.ts (~20–30 min)

Per Decision E: `verifyAgentIdOwnership` becomes async; signature extends with the body param; body rewritten (kill-switch check → header extract → CarriedProfile extract → `validateAtlWriteToken` with scope check → map to AuthGateResult); call site updated to await + pass body (parse body once); POST handler extracts the new typical_* + loop_id and passes them to the writer; header comments updated for post-A10 behaviour. `tsc --noEmit`.

### Step 5b — Update agent-card.json with A10 auth declaration (~5 min)

Per the design's build-summary agent-card.json row (A2A Agent Card alignment). Update `/website/public/.well-known/agent-card.json` to declare the write-surface auth method (`Bearer sr_atl_<...>`) so third-party agents discovering the substrate via A2A know how to authenticate. JSON shape per build discretion: top-level `authentication` block OR a `capabilities.extensions` entry `atl-write-auth/v1` (mirrors the existing `pass-through-metadata/v1` pattern). Validate as valid JSON. No runtime effect.

### Step 6 — Modified atl-accreditation-writer.ts (~15–20 min)

Extend the writer to accept the 4 typical_* fields + loop_id and persist them on `agent_accreditation`. Additive; existing callers get nullable defaults. All writes awaited (KG1). `tsc --noEmit`.

### Step 7 — Modified accreditation-record.ts + types/accreditation.ts (~15–20 min)

Extend `buildAccreditationPayload` with the 4 typical_* fields; extend `AccreditationRecord` + `AccreditationPayload` types with the 4 optional fields. Port-mirror discretion per Step 1 (defer recommended). `tsc --noEmit`.

### Step 8 — Tests (~30–40 min)

Three files: (8.1) `security.test.ts` — `validateAtlWriteToken` across no_token / invalid_token / wrong_agent / **wrong_scope** / ok-no-scope / ok-matching-scope; (8.2) `accreditation/[agent_id]/route.test.ts` — 401 for unknown/revoked/wrong-agent/wrong-scope; 503 when kill-switch off; new body fields flow to the writer; (8.3) NEW `admin/accreditation-credentials/route.test.ts` — non-admin 401; mint returns token + writes credential_audit; unique-constraint 409; mint-with-scope persists; revoke sets is_active=false + revoked_at + writes credential_audit. Run all three (`npx tsx --env-file=.env.local` for Supabase-importing tests). All pass before proceeding.

### Step 9 — Add ADMIN_USER_EMAIL env var (~5 min)

Founder adds `ADMIN_USER_EMAIL` (or `ADMIN_USER_ID` per Step 1) to Vercel (Production + Preview + Development). **Do NOT deploy yet** — the env var must be present before the admin endpoint deploys.

### Step 10 — Verify (~15–20 min)

10.1 `tsc --noEmit` clean. 10.2 Run all three test files (`npx tsx --env-file=.env.local`). 10.3 Schema verification queries in Supabase SQL Editor (api_keys new columns + constraints; credential_audit table; agent_accreditation new columns). 10.4 Commit + push via GitHub Desktop (build provides the exact multi-line commit command). 10.5 Vercel rebuild (~2 min). 10.6 Admin-endpoint mint smoke test (founder records the raw token, shown once). 10.7 Flip `SUBSTRATE_WRITE_PATH_ENABLED='true'` → wait for redeploy → write-path POST smoke test with the minted token (expect HTTP 200 + agent_accreditation row). 10.8 Failure-mode smoke tests (no token → 401; invalid token → 401; wrong agent_id → 401; revoke → 200; revoked token → 401). 10.9 Founder leaves the flag `'true'` (write surface Live) OR reverts to UNSET (Live-but-inert for further testing) — founder's call.

### Step 11 — Append decision-log entry (full form per Critical) (~20–30 min)

`D-ATL-A10-BUILD-WIRED-VERIFIED-YYYY-MM-DD`, full form (Verification Method Used + Risk Classification Record + PR5 Knowledge-Gap Carry-Forward). Captures all nine decisions A–I + the three rewrite integrations + the §Control-layer kill-switch posture (Layers 1/2/3 now Live) + build-session discretion picks (Step 1 elections); risk + rollback + verification; cross-references.

### Step 12 — Session close (full form per Critical) (~20–30 min)

Full template (Verification Method Used; Risk Classification Record; PR5; Decisions Made; Status Changes; Next Session Should — post-arc-close: K-category migration, Stage 1 lawyer engagement, the discovery-product design pass per `/operations/handoffs/founder/2026-05-20-purpose-discovery-design-pass-NEXT-SESSION-PROMPT.md`; Blocked On + production state at close; Open Questions — Layer 3 prose anomaly + port-mirror reconciliation + orphaned-credential cleanup if deferred + Layer 4 payment kill switch still deferred in Option D; Founder Verification Between Sessions; Orchestration Reminder).

## Part C — Anticipated session shape

| Phase | Estimate |
|---|---|
| Part A — caches + rewrite close + design (full, incl. §Control-layer) + decision-log + schemas + security.ts + admin precedent + route + writer + accreditation-record + types + evaluation + decision-log last 3 + PR11 + PR15 | 75–100 min |
| Step 0 — Critical Change Protocol | 15–20 min |
| Step 1 — scope confirmation | 5–10 min |
| Step 2 — schema migrations (3 files) | 20–30 min |
| Step 3 — security.ts extensions | 30–40 min |
| Step 4 — NEW admin endpoint | 25–35 min |
| Step 5 — Modified accreditation route | 20–30 min |
| Step 5b — agent-card.json auth declaration | ~5 min |
| Step 6 — Modified writer | 15–20 min |
| Step 7 — Modified accreditation-record + types | 15–20 min |
| Step 8 — Tests (3 files) | 30–40 min |
| Step 9 — ADMIN_USER_EMAIL env var | 5 min |
| Step 10 — Verify (tsc + tests + schema + commit + deploy + smoke + failure-mode) | 15–20 min |
| Step 11 — decision-log entry (full) | 20–30 min |
| Step 12 — session close (full) | 20–30 min |
| **Total** | **~5–7 hr** |

**Fallback split if overrunning ~5 hr at Step 3:** A10a (schema + security.ts + admin endpoint + their tests; Critical) and A10b (route + agent-card.json + writer + accreditation-record + their tests + deploy; Critical). Both carry the full CCP. The build-arc cache permits time-bounded sessions per Rule B.

## Rollback path

**Pre-push:** `cd` to repo → `git status` → `git reset --hard HEAD~N`. If schema migrations were run, execute the rollback SQL (below). If the env var was added, remove it. No production change (commits never reached Vercel).

**Post-push:** `git revert HEAD~N..HEAD --no-edit` → push via GitHub Desktop → Vercel rebuilds (~2 min) to pre-A10 shape → run the rollback SQL → remove `ADMIN_USER_EMAIL`. Post-revert: admin endpoint 404; A10 verification path gone; write-path POST returns 503 (pre-A10 stopgap unaffected).

**Rollback SQL (run in order — agent_accreditation, then credential_audit, then api_keys):**

```sql
-- agent_accreditation
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

-- credential_audit
DROP TABLE IF EXISTS public.credential_audit;

-- api_keys
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

Idempotent (`IF EXISTS`). Does NOT touch: `SUBSTRATE_WRITE_PATH_ENABLED` (unaffected; behaves as pre-A10); the pre-existing `api_keys.agent_id` + `owner_user_id` + `idx_api_keys_owner_user_id` (pre-date A10); `loop_billing_events` (A10 never wrote to it); the 7 pass-through fields (live in code, not schema); Stripe wiring.

## Forecast

A successful A10 build produces authenticated read AND write public surfaces; per-agent credentials with per-credential scoping; four new typical_* fields on AccreditationPayload; forensic JOIN-traceability via `agent_accreditation.loop_id`; the agent-card.json A10 auth declaration; and a documented kill-switch posture (Layers 1/2/3 Live). The post-6b arc closes.

**Post-arc tracks (independent):** K-category migration; Stage 1 lawyer engagement (FPE-5 TOS + liability); Stripe-Price-ID follow-on; Layer 3 prose anomaly investigation; the **purpose-discovery product design pass** (`/operations/handoffs/founder/2026-05-20-purpose-discovery-design-pass-NEXT-SESSION-PROMPT.md` — independent of the arc; pre-conditioned on A10 Verified for its recommended auth). The **Layer 4 payment kill switch** (budget-cap enforcement) remains deferred in Option D — a future session could close control-map Row 5 by electing the enforcement mechanism in `/adopted/billing-model-design.md`.

*End of prompt. Paste into a fresh session; the session begins under Part A.*
