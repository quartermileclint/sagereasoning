# Next-Session Prompt — Write-Path Build: Library + Route + Auth Gate + Tests (post-6b arc, step 7 of 8)

**Stream:** founder.
**Tier:** `code-critical` — **Critical** risk under 0d-ii. **Full** template (NOT Lean). **Critical Change Protocol (0c-ii) ENGAGED — AC7 + PR6 partial: AC7 ENGAGED (new auth surface); PR6 NOT engaged (no R20a / distress-classifier surface).**
**Governing frame:** `/adopted/standing-protocol-cache.md` (general protocol — `code-critical` row → Full template) + `/adopted/build-sessions-protocol-cache.md` (build-arc context — "no current users" governing note applies; Critical Change Protocol step 3 answered "N/A — only founder + test logins exist; no third-party sessions to invalidate"; all other Critical Change Protocol steps in full force).
**Predecessor session close:** `/operations/handoffs/founder/2026-05-16-write-path-design-pass-close.md` (the write-path design pass that closed step 7's design half).
**Predecessor decision-log entry (the build's spec):** `D-ATL-WRITE-PATH-DESIGN-LOCKED-2026-05-16`.
**Design document (the build's authoritative spec):** `/adopted/atl-write-path-design.md` — seven locked design decisions A–G.
**Sequencing source:** `/operations/handoffs/founder/2026-05-15-post-build-brainstorm-close.md` — step 7 of 8 in the post-6b arc (the build half).

---

## Why this session matters

The persistence layer's three write functions (`upsertAccreditationRecord`, `appendGradeHistory`, `appendInitialGradeHistory`) exist, are tested, and are Verified — but are called by nothing in production. The `agent_accreditation` table is empty. The wrapper's `computeTrajectory` produces an advanced `CarriedProfile` containing an updated `AccreditationRecord` on every call, but the wrapper is intentionally pure — it produces values, it does not persist.

This session builds the seam: a library function (`seedAccreditation` + `updateAccreditation`) that bridges the wrapper's pure output to the persistence layer's awaited writes, plus a POST route at `/api/accreditation/[agent_id]` that exposes the library over HTTP for external callers, plus an auth gate shaped to receive A10 tokens once step 8 lands.

The build session is **Critical** because:
1. Decision A introduces a new route (deployment surface).
2. Decision C introduces an auth gate (auth surface → AC7 engaged).
3. The route is publicly addressable (anyone on the internet can hit `/api/accreditation/[agent_id]` with POST after deploy).

Plan **~3–4 hr**. The session's load-bearing steps are: the Step 1 pre-A10 stopgap election; the library build (Decisions B + D + E + F + G); the route build (Decisions A + C); the test suite (PR2 build-to-wire immediate); the full Critical Change Protocol responses before the founder deploys.

---

## Pre-conditions

1. **This session's commits pushed; Vercel green.** Confirmed at the design-pass close + founder confirmation post-deploy (2026-05-16).
2. **Founder has reviewed** `/operations/decision-log.md` entry `D-ATL-WRITE-PATH-DESIGN-LOCKED-2026-05-16` and `/adopted/atl-write-path-design.md`.
3. **Founder has decided in advance** (or is ready to decide at Step 1) the pre-A10 auth stopgap election — one of:
   - **(1) Feature-flag gated** — route returns 503 with "writes not yet enabled" until `SUBSTRATE_WRITE_PATH_ENABLED` env is set. The library remains callable by wrapper-internal consumers.
   - **(2) Founder-only via service-role** — route accepts `Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}` header for the founder's tooling.
   - **(3) Founder-only via shared-secret** — separate `ATL_WRITE_KEY` env var; narrower scope than service-role.
4. **Production state unchanged from the design-pass close:** substrate at A7 Verified; flags UNSET; `/api/reason` byte-identical; `/api/substrate/layer3` returns 503; `/api/accreditation/[agent_id]` Live (GET only); `agent_accreditation` has both `typical_deliberation_breadth` + `typical_kathekon_quality` columns; table empty; `grade_history` empty.
5. **Founder commits to a ~3–4 hr bounded session.** Mid-session input is concentrated at Step 1 (pre-A10 stopgap election + four build-discretion picks) and at Step 9 (Critical Change Protocol responses before deploy).

---

## Part A — Open under the protocol

Read in order:

1. `/adopted/standing-protocol-cache.md` (~3 min) — confirm tier (`code-critical`), risk class (Critical), Full template (NOT Lean), signals, status vocabulary, AC1 model-selection table (N/A this session — no LLM calls).
2. `/adopted/build-sessions-protocol-cache.md` (~3 min) — confirm "no current users" simplification of Critical Change Protocol step 3; otherwise full force.
3. `/operations/handoffs/founder/2026-05-16-write-path-design-pass-close.md` (~5 min) — the immediate predecessor session close.
4. `/adopted/atl-write-path-design.md` (~15 min) — **the authoritative spec; read in full.** The build session implements the seven decisions A–G as specified.
5. Targeted code files (~25 min total):
   - `/website/src/lib/substrate/atl-accreditation-store.ts` in full — the persistence layer the library will invoke (four async functions).
   - `/website/src/lib/substrate/atl-wrapper.ts` — `CarriedProfile` shape; `TransitionResult` shape; `computeTrajectory` semantics. The library consumes these shapes.
   - `/website/src/lib/substrate/trust-layer/grade-engine/grade-transition-engine.ts` — `TransitionResult` definition; `evaluateGradeTransition`; and check whether `buildGradeChangeEvent` is already exported (Decision D may require adding it).
   - `/website/src/app/api/accreditation/[agent_id]/route.ts` in full — the existing GET handler; the POST handler joins this file or a sibling.
   - `/website/src/app/api/accreditation/[agent_id]/response-builders.ts` — the existing response-shape helpers; the POST handler can reuse the response envelope.
   - `/website/src/lib/substrate/trust-layer/accreditation/public-endpoint.ts` — `handleAccreditationLookup`'s injected-lookupFn pattern; the precedent shape for any new `handleAccreditationWrite`-style handler the build session may add.
   - `/website/src/lib/security.ts` — `checkRateLimit` + `RATE_LIMITS`; the route's rate-limit posture mirrors the existing GET's.
   - `/website/src/lib/supabase-server.ts` (skim) — `supabaseAdmin` client construction; confirm service-role key env var name (for stopgap option 2).
6. `/operations/decision-log.md` — the last three entries (`D-ATL-WRITE-PATH-DESIGN-LOCKED-2026-05-16`, `D-ATL-KATHEKON-ALIGNED-ALTERNATIVE-BUILD-WIRED-VERIFIED-2026-05-16`, `D-ATL-KATHEKON-ALIGNED-ALTERNATIVE-DESIGN-LOCKED-2026-05-16`).
7. **PR11 inbox scan** — list `/inbox/` files dated since 2026-05-16. Confirm F1–F4 in `/operations/agentic-commerce-findings-downstream-order.md` for write-path-build relevance: F3 is potentially relevant (A5 retrospective). F1, F2, F4 do not target this session.
8. **PR15 consult** — `.claude/skills/anthropic/` review. Candidate primitives for a Critical-risk route + auth build: `claude-api` (for response-shape conventions); `mcp-builder` (forward pointer for R18c — the write surface could later also be exposed as an MCP tool). Bespoke election expected: the spec's named surface is the Next.js route at the existing route group; the auth-gate function is bespoke until A10 fills it. Justify in the decision-log entry.

**Confirm at open:** tier (`code-critical`); hold-point status (P0 0h active); model selection N/A (no LLM calls); status vocabulary; signals + risk classification; Critical Change Protocol engaged (AC7); PR6 NOT engaged.

---

## Part B — Procedure

### Step 0 — Scope confirm (~5 min)

State scope: implement the seven design decisions A–G as a single Critical-risk build per PR1 single-build proof. **In scope this session:** new library file (Decisions A + B + D + E + F + G); POST handler at the existing route group (Decisions A + C); pre-A10 auth stopgap (Decision C's discretion); library test file; route test extensions; documentation of any new env vars in deployment notes. **NOT in scope this session:** A10 per-agent credentials (step 8 — separate Critical session); the wrapper-iteration-pattern engagement with the kathekon signal (deferred Q9 from the kathekon design); badge-docs update; any change to the existing GET handler's behaviour. Founder confirms via AskUserQuestion.

### Step 1 — Pre-A10 auth stopgap election + four build-discretion picks (~15–20 min)

**Load-bearing election: pre-A10 auth stopgap.** AskUserQuestion: which of (1) feature-flag gated, (2) founder-only via service-role, (3) founder-only via shared-secret. The election determines the auth gate's pre-A10 implementation and (for option 1) requires a new env var.

**Four build-discretion picks** (per the design's implementation summary table — file paths, helper names, test structure are build-session discretion within the design's constraints):

1. **Library file path + name.** Default `/website/src/lib/substrate/atl-accreditation-writer.ts` (sibling to `atl-accreditation-store.ts`). Founder confirms or names an alternative.
2. **POST handler location.** Default: add to the existing `/website/src/app/api/accreditation/[agent_id]/route.ts` alongside the GET. Alternative: split read and write across separate files. Founder confirms.
3. **`buildGradeChangeEvent` export.** Check whether the function is already exported from `grade-transition-engine.ts`. If yes, import it. If no, decide: add an exportable version, OR inline-construct the `GradeChangeEvent` inside `updateAccreditation`. Founder confirms.
4. **Library test file structure.** Default: new `/website/src/lib/substrate/__tests__/atl-accreditation-writer.test.ts` modelled on the existing `atl-accreditation-store.test.ts` plain-assertion harness pattern. Confirm.

The five elections proceed in one or two AskUserQuestion rounds.

### Step 2 — Critical Change Protocol responses (Plan step of PR10 PEV loop) (~15 min)

Before any code is written, the AI completes the six Critical Change Protocol steps visibly in the conversation:

1. **What is changing** — plain language. New library exposing `seedAccreditation` + `updateAccreditation`; new POST handler at `/api/accreditation/[agent_id]`; new auth gate; new structured-logging helper; new test file + extended route test.
2. **What could break** — specific failure modes:
   - Auth gate misconfiguration → 401s for legitimate callers, OR (worse) the route accepts unauthenticated writes.
   - Auth gate's pre-A10 stopgap leaks secrets (option 2 or 3 expose env values via incorrect error messages).
   - The library's hybrid trigger (Decision B) miscalculates which `grade_history` function to call (e.g., calls `appendGradeHistory` when `grade_changed === false`, producing spurious history rows).
   - The library's two-awaited-writes posture (Decision E) leaves state ahead of history; if the founder retries via a different code path, the second attempt could produce a duplicate state-row update (idempotent — Decision F) AND a duplicate history append (visible — Decision F).
   - The POST handler's body validation accepts malformed `CarriedProfile` shapes, producing a 400 in some cases and a 500 in others depending on which field is malformed.
   - Existing GET handler regresses (file edits in the same route.ts could break unrelated exports).
   - The new env var (option 1's `SUBSTRATE_WRITE_PATH_ENABLED`, or option 3's `ATL_WRITE_KEY`) is misconfigured at deploy → route returns 503 unexpectedly OR auth-bypasses unexpectedly.
3. **What happens to existing sessions** — **N/A** per the build-arc cache's "no current users" governing note. The only logins are the founder's and known test logins; no third-party sessions to invalidate.
4. **Rollback plan** — `git revert HEAD --no-edit` + push via GitHub Desktop. Post-rebuild (~2 min): new library file removed; POST handler removed from route.ts (or sibling file removed); test files removed; any new env var becomes orphaned (harmless — env vars without code consumers are inert). Supabase: no schema changes this session (the table + columns already exist from earlier steps). The persistence layer's four async functions remain Verified.
5. **Verification step** — see Step 10 below + Step 11 founder post-deploy URL check.
6. **Explicit founder approval** — Step 11 below; specific to the named risks in step 2.

### Step 3 — Build the library (`atl-accreditation-writer.ts` or chosen filename) (~30–40 min)

Implements Decisions B + D + E + F + G:

```ts
import { CarriedProfile } from './atl-wrapper'
import {
  upsertAccreditationRecord,
  appendGradeHistory,
  appendInitialGradeHistory,
  type AccreditationRecord,
} from './atl-accreditation-store'
import {
  evaluateGradeTransition,
  type TransitionResult,
  // buildGradeChangeEvent or inline construction per Step 1 election #3
} from './trust-layer/grade-engine/grade-transition-engine'

export async function seedAccreditation(profile: CarriedProfile): Promise<void>
export async function updateAccreditation(profile: CarriedProfile, transitionResult: TransitionResult): Promise<void>
```

Each function:
- Awaits `upsertAccreditationRecord(record, { tier, regressing_check_count })` first.
- Then awaits `appendInitialGradeHistory(record)` (seed) OR — only if `transitionResult.grade_changed === true && transitionResult.trigger !== null` — `appendGradeHistory(event)` (update).
- Emits one structured JSON log event (Decision G's field set) on success, and on error before re-throwing.
- Errors from either persistence-layer call propagate to the caller per KG1 rule 2 + Decision E's posture.

Module header comments per the existing substrate module conventions (KG1 postures, R-rule engagement, design-decision cross-references).

### Step 4 — Build the POST handler (~30–40 min)

Implements Decisions A + C:

```ts
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ agent_id: string }> }
): Promise<NextResponse>
```

Inside:
- Rate-limit check (mirroring the GET's `checkRateLimit(request, RATE_LIMITS.publicAgent)` — or use a separate write-specific rate limit; build-session discretion).
- Auth gate (`verifyAgentIdOwnership(request, agent_id)` or chosen name); pre-A10 implementation per Step 1 election; 401 with non-leaking message on failure.
- Body parsing + validation (`{ kind: 'seed' | 'update', profile: <CarriedProfile>, transition_result?: <TransitionResult> }`); 400 on invalid body.
- Branch on `kind`: call `seedAccreditation` or `updateAccreditation`.
- Map outcomes: 200 on success; 404 on update against non-existent row (catch the persistence-layer error and disambiguate); 409 on seed against existing row (lookup first, OR catch the Postgres unique-violation); 503 on any other Supabase error (mirror the existing 503 posture).
- Existing `methodNotAllowed` helper should be updated to remove POST from the 405 list (POST is now allowed).

### Step 5 — Add the auth-gate helper (~15 min)

Per Step 1's pre-A10 stopgap election:

- **(1) Feature-flag gated:** the gate reads `process.env.SUBSTRATE_WRITE_PATH_ENABLED`; if unset or falsy, returns `{ ok: false, reason: 'writes not yet enabled' }` → route returns 503 with non-leaking message.
- **(2) Founder-only via service-role:** the gate reads `Authorization: Bearer <token>`; compares to `process.env.SUPABASE_SERVICE_ROLE_KEY` via constant-time comparison; mismatch → `{ ok: false, reason: 'unauthorized' }` → route returns 401.
- **(3) Founder-only via shared-secret:** same as (2) but compares to `process.env.ATL_WRITE_KEY`.

Build-session decides whether the gate lives in the route file, the library file, or a sibling helper. The function signature is shaped so its body can later be swapped to A10 token verification without changing the call-site.

### Step 6 — Add the structured-logging helper (~10 min)

Per Decision G's field set. One helper function (e.g., `logWriteEvent(event)`); called at success + failure sites inside `seedAccreditation` and `updateAccreditation`. Uses `console.log(JSON.stringify(event))`.

### Step 7 — Update existing route.ts's method-not-allowed list (~5 min)

The existing 405 list includes POST. Remove POST from the four 405 handlers (or replace POST with PATCH only). Confirm `OPTIONS` and `GET` still work.

### Step 8 — Build the library test file (~30–40 min)

New file at `/website/src/lib/substrate/__tests__/atl-accreditation-writer.test.ts`. Plain-assertion harness mirroring `atl-accreditation-store.test.ts`'s pattern. Tests:

- **SEED-1**: `seedAccreditation` calls `upsertAccreditationRecord` then `appendInitialGradeHistory`, in that order.
- **SEED-2**: SEED success emits one structured-log event with `call_type: 'seed'`.
- **SEED-3**: SEED failure (Supabase throws) re-throws and emits an error log event.
- **UPDATE-1**: `updateAccreditation` with `grade_changed: true` calls `upsertAccreditationRecord` then `appendGradeHistory`.
- **UPDATE-2**: `updateAccreditation` with `grade_changed: false` calls `upsertAccreditationRecord` only — NO `appendGradeHistory` call.
- **UPDATE-3**: UPDATE log event includes `grade_changed`, `previous_grade`, `new_grade`, `trigger_reason` when grade changed.
- **ATOMICITY-1**: history-append failure after successful upsert re-throws; the state row is already written (verified by mock invocation order).
- **IDEMPOTENT-1**: re-calling `seedAccreditation` with the same profile produces a successful no-op-or-update (mock upsert receives the call; mock history append receives a second call; both succeed).

Mock the persistence layer's four async functions (Vitest/Jest convention or the harness's existing mock pattern). Mock `console.log` to capture log events.

Test file imports `--env-file=.env.local` posture: this test does NOT transitively import `supabase-server.ts` (the writer module imports the store's exported functions, which themselves import `supabase-server.ts` — so the writer's test will need `--env-file=.env.local`). Confirm by reading the import chain.

### Step 9 — Extend the route test file (~20–30 min)

Existing `/website/src/app/api/accreditation/[agent_id]/__tests__/route.test.ts` — add:

- **POST-SEED-1**: valid body + valid auth → 200.
- **POST-UPDATE-1**: valid body + valid auth → 200.
- **POST-AUTH-1**: missing auth → 401 with non-leaking message.
- **POST-AUTH-2**: invalid auth → 401 with non-leaking message.
- **POST-BODY-1**: invalid body (missing `kind`) → 400.
- **POST-BODY-2**: invalid body (malformed `profile`) → 400.
- **POST-LIB-1**: library throw → 503 (mock the writer module to throw).
- **POST-METHOD-1**: the four 405-tested methods are now reduced to three (PATCH only, or whatever is left after POST is allowed).

The route test transitively imports `supabase-server.ts` via the writer module → `--env-file=.env.local` required.

### Step 10 — Verify (Plan→Execute→Verify per PR10) (~10 min)

In-session: `npx tsc --noEmit -p tsconfig.json` should run CLEAN. Runtime tests cannot run in the sandbox (esbuild platform mismatch — documented). The founder runs runtime tests locally per the Founder Verification block.

### Step 11 — Critical Change Protocol — explicit founder approval before deploy (~10 min)

AskUserQuestion: founder approves deployment specific to the named risks in Step 2. The Critical Change Protocol's step 6 must be satisfied by an explicit "OK to deploy" — not just "looks good." If the founder declines, the build is committed but not pushed; a follow-on session reconsiders.

### Step 12 — Append decision-log entry (full form for Critical) (~15 min)

`D-ATL-WRITE-PATH-BUILD-WIRED-VERIFIED-YYYY-MM-DD`. Full form per `/adopted/standing-protocol-cache.md` §"Critical-risk sessions" — includes the seven Critical Change Protocol responses + Verification Method Used + Risk Classification Record + PR5 Knowledge-Gap Carry-Forward + Founder Verification + Orchestration Reminder.

Rules served expected: 0a, 0c, 0c-ii (Critical Change Protocol), 0d-ii, 0f, R0, R3, R4, R6c, R17 (auth gate is primary engagement), R18a, R18c, R18e (NOT engaged at write level), R20 (NOT engaged), AC5 (NOT), AC7 (ENGAGED — new auth surface), AC8, AC10 (deferred per design), KG1 (Vercel rules — engaged), KG7 (engaged), PR1 (single-build proof — library + route + tests in one session), PR2 (build-to-wire immediate), PR4 (N/A), PR6 (NOT engaged), PR7 (deferred items named — A10, AC10 provenance, webhook emission, OpenTelemetry, RPC transactional atomicity, client idempotency key), PR10 (PEV: Plan = Step 2's Critical Change Protocol; Execute = Steps 3–9; Verify = tsc clean + founder local tests + founder post-deploy URL check), PR11 (inbox scan), PR15 (`mcp-builder` forward pointer; bespoke election justified).

### Step 13 — Session close (full form for Critical) (~20–25 min)

`/operations/handoffs/founder/YYYY-MM-DD-write-path-build-close.md` per the Full template. "Next Session Should" names step 8 — A10 per-agent credentials — as the natural next session.

---

## Part C — Anticipated session shape

| Phase | Estimate |
|---|---|
| Part A — caches + predecessor close + design doc + code files + decision-log + PR11 + PR15 | 50–60 min |
| Step 0 — scope confirm | 5 min |
| Step 1 — pre-A10 stopgap election + 4 discretion picks | 15–20 min |
| Step 2 — Critical Change Protocol responses (Plan) | 15 min |
| Step 3 — library build | 30–40 min |
| Step 4 — POST handler build | 30–40 min |
| Step 5 — auth gate | 15 min |
| Step 6 — logging helper | 10 min |
| Step 7 — 405 list update | 5 min |
| Step 8 — library test file | 30–40 min |
| Step 9 — route test extensions | 20–30 min |
| Step 10 — tsc Verify | 10 min |
| Step 11 — Critical Change Protocol approval | 10 min |
| Step 12 — decision-log entry (full form) | 15 min |
| Step 13 — session close (full form) | 20–25 min |
| **Total** | **~4–5 hr** |

The natural pause point if the session runs long is **after Step 9** (library + route + tests all land; tsc Verify can wait; Critical Change Protocol approval can be a separate short session). The founder elects whether to take that pause.

---

## Rollback path

**Code rollback (if approved + pushed + something goes wrong post-deploy):** `git revert HEAD --no-edit` + push via GitHub Desktop. Vercel rebuilds (~2 min). Post-revert: new library file removed; POST handler removed from route.ts (or sibling file removed); test files removed; auth-gate helper removed; logging helper removed; method-not-allowed list restores POST to the 405 set. Any new env var becomes orphaned (harmless). The persistence layer's four async functions remain Verified. The GET handler at `/api/accreditation/[agent_id]` returns to its pre-session shape (byte-identical).

**Code rollback before push:** `git reset --hard HEAD~1` (or per the commit's SHA). No production effect.

**Env rollback:** if the stopgap option was (1) feature-flag gated and the flag is unintentionally set, unset `SUBSTRATE_WRITE_PATH_ENABLED` in Vercel. Route returns 503 immediately on next request (no rebuild required for env var changes in Vercel; runtime env vars take effect on next function invocation).

**Supabase rollback:** none required — no schema changes this session.

---

## Forecast

A successful build session produces:
- New library `/website/src/lib/substrate/atl-accreditation-writer.ts` (or chosen filename) exposing `seedAccreditation` + `updateAccreditation`.
- New POST handler at `/api/accreditation/[agent_id]` (or sibling file) with auth gate + body validation + library invocation + outcome → HTTP mapping.
- New auth-gate helper shaped to receive A10 tokens (pre-A10 stopgap implementation per Step 1 election).
- New structured-logging helper.
- New library test file with mocks for the persistence layer.
- Extended route test file with POST-handler tests.
- Updated method-not-allowed list (POST removed from 405).
- New env var documented (if Step 1 elected option 1 or 3).
- Decision-log entry (`D-ATL-WRITE-PATH-BUILD-WIRED-VERIFIED-YYYY-MM-DD`) — full form for Critical.
- Session close (full form for Critical) pointing at A10 as the next session.

After this session lands:
- The `agent_accreditation` table becomes populate-able by any wrapper consumer (via the library) or any external caller (via the route, subject to auth).
- The post-6b arc has one step remaining: **step 8 — A10 per-agent credentials** — which fills the auth seam Decision C names, replacing the pre-A10 stopgap with proper per-agent token verification.

The write-path build is the substrate's first **write-side public surface**. After this lands, the substrate has both read (`/api/accreditation/[agent_id]` GET) and write (POST) surfaces operational — the badge becomes a live credential rather than a dormant schema.

*End of prompt.*
