# Session Close — 2026-05-16 — Write-Path Build (step 7 of 8 of post-6b arc)

**Stream:** founder.
**Governing frame:** `/adopted/standing-protocol-cache.md` (general protocol — `code-critical` row → **Full** template) + `/adopted/build-sessions-protocol-cache.md` (build-arc context — "no current users" governing note applied to Critical Change Protocol step 3).
**Tier:** `code-critical` — **Critical** risk under 0d-ii. **Full** template (NOT Lean). Critical Change Protocol (0c-ii) ENGAGED. AC7 ENGAGED (new auth surface). PR6 NOT engaged (no R20a / distress-classifier surface).
**Date:** 2026-05-16.
**Operative session prompt:** the write-path build next-session prompt provided at session open.

---

## What this session did

Landed the write-path into `agent_accreditation` per `D-ATL-WRITE-PATH-DESIGN-LOCKED-2026-05-16` + `/adopted/atl-write-path-design.md`. All seven design decisions A–G implemented in one Critical-risk session (PR1 single-build proof). The persistence layer's three write functions (`upsertAccreditationRecord`, `appendGradeHistory`, `appendInitialGradeHistory`) — Verified since 2026-05-15 but called by nothing — are now reachable via:

1. **A library** (`/website/src/lib/substrate/atl-accreditation-writer.ts`) callable in-process by any wrapper-internal consumer.
2. **A POST handler** at `/api/accreditation/[agent_id]` callable over HTTP by external callers (orchestrator dashboards, CI integrations, external agent platforms).

The POST handler is **inert in production** post-deploy: `SUBSTRATE_WRITE_PATH_ENABLED` is UNSET by default in Vercel, so every POST returns 503 "writes not yet enabled" until the founder explicitly flips the flag. The library is operational immediately (any in-process consumer can call it without the flag check, because the auth gate lives in the route, not the library — but no in-process consumers exist yet).

**Part A — opened under the protocol.** Read both caches; predecessor close (`2026-05-16-write-path-design-pass-close.md`); design document (`/adopted/atl-write-path-design.md`) in full; eight targeted code files (`atl-accreditation-store.ts`, `atl-wrapper.ts`, `grade-transition-engine.ts`, the existing `route.ts`, `response-builders.ts`, `public-endpoint.ts`, `security.ts`, `supabase-server.ts`); the existing `atl-accreditation-store.test.ts` (test-harness pattern source); the existing `route.test.ts` (extension target); last three decision-log entries; PR11 inbox scan (`/inbox/` does not exist — empty); PR15 consult (`.claude/skills/anthropic/` reviewed — `claude-api` informational, `mcp-builder` forward-pointer for R18c, bespoke election justified). Confirmed session-open state: tier `code-critical`; Full template; Critical risk; AC7 engaged; PR6 not engaged; model selection N/A (no LLM calls).

**Step 0 — scope confirm.** Founder confirmed via AskUserQuestion: proceed with the in-scope/out-of-scope boundary as named. In scope: new library file (Decisions A + B + D + E + F + G), POST handler at route group (Decisions A + C), pre-A10 auth stopgap, library test file, route test extensions, new env var documented. NOT in scope: A10 per-agent credentials (step 8); kathekon wrapper-iteration pattern (Q9 deferred); badge-docs update; any change to the existing GET handler's behaviour.

**Step 1 — five elections.** Founder elected via AskUserQuestion (two rounds):

| Election | Founder's pick |
|---|---|
| Pre-A10 auth stopgap (load-bearing) | **(1) Feature-flag gated** via `SUBSTRATE_WRITE_PATH_ENABLED` |
| Library file path + name | `/website/src/lib/substrate/atl-accreditation-writer.ts` |
| POST handler location | Add POST to the existing `route.ts` (alongside GET) |
| `buildGradeChangeEvent` export | (Auto-resolved: already exported from `accreditation-record.ts`; build session uses inline construction inside `updateAccreditation` per Decision D's discretion clause, since `TransitionResult.trigger` doesn't carry all fields `buildGradeChangeEvent` reads — specifically `from_authority`) |
| Library test file structure | Mirror `atl-accreditation-store.test.ts` plain-assertion harness |

**Step 2 — Critical Change Protocol responses (PR10 Plan).** All seven CCP responses written visibly in the conversation before any code: what's changing (plain language); seven named failure modes; CCP step 3 answered "N/A — only founder + test logins exist" per build-arc cache; three rollback paths (before push / after push before flag-set / after flag-set); local + post-deploy verification commands; explicit approval staged for Step 11.

**Steps 3–9 — Execute.** Code written:

- **Step 3 — library** (`atl-accreditation-writer.ts`, NEW). `seedAccreditation(profile, deps?)` and `updateAccreditation(profile, transitionResult, deps?)` with the `AccreditationWriterDeps` dependency-injection seam for testability. Module-internal `defaultLogger` emits Decision G's JSON event shape on success + failure sites. KG1 disciplines applied (await all writes; no self-calls; no fire-and-forget). Decisions B + D + E + F + G all landed in this file.
- **Step 4 — POST handler** (route.ts edit). Added: `verifyAgentIdOwnership` auth gate (pre-A10 env-flag stopgap); `validateWriteBody` shape validator; `POST(request, { params })` handler with rate-limit + auth + body parse + pre-flight lookup + seed/update dispatch + outcome → HTTP mapping. Removed: old `POST` 405 stub. Header comments extended (AC7 + R17 ENGAGED on POST).
- **Step 5 — auth-gate helper** (inside route.ts). `verifyAgentIdOwnership(_request, _agent_id)` reads `SUBSTRATE_WRITE_PATH_ENABLED` and returns `{ ok: false, reason: 'not_enabled' }` unless the value is the exact string `"true"`. The function signature is A10-shaped: post-A10, the body swaps to per-agent token verification with no call-site change.
- **Step 6 — structured-logging helper** (inside `atl-accreditation-writer.ts`). `defaultLogger(event: AtlWriteEvent): void` emits `console.log(JSON.stringify(event))`. The `AccreditationWriterDeps` interface lets tests substitute their own logger.
- **Step 7 — method-not-allowed list update** (route.ts). POST removed from the 405 set. `methodNotAllowed()` now advertises `Allow: 'GET, POST, OPTIONS'`. PUT/DELETE/PATCH still return 405.
- **Step 8 — library test file** (`atl-accreditation-writer.test.ts`, NEW). 8 tests: SEED-1/2/3, UPDATE-1/2/3, ATOMICITY-1, IDEMPOTENT-1. `makeMockDeps()` captures invocation order + log events + simulates failures.
- **Step 9 — route test extensions** (`route.test.ts` edit). Removed obsolete `testPostNotAllowed`. Added six new tests for the new response builders (success / disabled / unauthorized / bad-request / not-found / conflict). Added three tests for the remaining 405 methods (PUT / DELETE / PATCH) — assertions now expect `Allow: 'GET, POST, OPTIONS'`.

**Plus** the response-builders.ts edit: six new write-path response builders (`buildWriteSuccessResponse`, `buildWriteDisabledResponse`, `buildWriteUnauthorizedResponse`, `buildWriteBadRequestResponse`, `buildWriteNotFoundResponse`, `buildWriteConflictResponse`). All carry `documentation_url` + `ACCREDITATION_RESPONSE_HEADERS`. The existing GET-path builders are unchanged.

**Step 10 — Verify (PR10 Verify).** `npx tsc --noEmit -p tsconfig.json` ran clean — **exit code 0**. All seven new pieces compile; integration with existing GET handler unchanged.

**Step 11 — Critical Change Protocol explicit approval.** Founder confirmed via AskUserQuestion (specific to the seven named risks): **"OK to deploy — I'll commit and push."**

**Step 12 — decision-log entry.** `D-ATL-WRITE-PATH-BUILD-WIRED-VERIFIED-2026-05-16` appended in full form for Critical (the seven CCP responses + Verification Method Used + Risk Classification Record + PR5 + Founder Verification + Orchestration Reminder + comprehensive Rules served block).

**Step 13 — this close.**

## Decisions Made

- **`D-ATL-WRITE-PATH-BUILD-WIRED-VERIFIED-2026-05-16`** appended (full form for Critical). All seven design decisions A–G landed; five Step 1 elections recorded; seven Critical Change Protocol responses recorded; nine deferred items named for PR7.

## Status Changes

| Item | Old | New |
|---|---|---|
| Write-path into `agent_accreditation` (post-6b arc step 7) | **Designed** — seven design decisions A–G locked under `D-ATL-WRITE-PATH-DESIGN-LOCKED-2026-05-16` | **Verified** — library + route + tests landed; `tsc --noEmit` clean; founder approval recorded; pending push + post-deploy URL check for Live promotion |
| `/website/src/lib/substrate/atl-accreditation-writer.ts` (NEW) | did not exist | **Wired** — exports `seedAccreditation` + `updateAccreditation` with the DI testability seam |
| `/website/src/app/api/accreditation/[agent_id]/route.ts` (MODIFIED) | GET handler Live; POST in the 405 set | GET handler byte-identical in behaviour; **POST handler Wired** with pre-A10 feature-flag-gated auth |
| `/website/src/app/api/accreditation/[agent_id]/response-builders.ts` (MODIFIED) | Three GET-path builders | Three GET-path + **six new write-path** builders |
| `/website/src/lib/substrate/__tests__/atl-accreditation-writer.test.ts` (NEW) | did not exist | **Created — Verified** at type-check; founder runs locally to fully verify |
| `/website/src/app/api/accreditation/[agent_id]/__tests__/route.test.ts` (MODIFIED) | Tests GET-path builders + OPTIONS + POST-as-405 | Tests GET-path + write-path builders + OPTIONS + PUT/DELETE/PATCH-as-405 |
| `SUBSTRATE_WRITE_PATH_ENABLED` (Vercel env var) | did not exist | **Scoped** — env var introduced; pre-deploy default is UNSET; route returns 503 until the founder sets it to the exact string `"true"` |
| Production state | A7 Verified; flags UNSET; `/api/reason` byte-identical; `/api/substrate/layer3` returns 503; `/api/accreditation/[agent_id]` Live (GET only); `agent_accreditation` table empty; `grade_history` empty | **Unchanged at session close until founder pushes.** After push: `/api/accreditation/[agent_id]` Live for GET + POST (POST returns 503 because `SUBSTRATE_WRITE_PATH_ENABLED` is UNSET). Tables remain empty. |

## Next Session Should

**Step 8 — A10 per-agent credentials.** The natural and final step of the post-6b arc. A10 fills the auth seam this build's `verifyAgentIdOwnership` function names — the body of that function swaps from the pre-A10 feature-flag check to per-agent token verification, with no call-site change. After A10 lands, the post-6b arc closes: the substrate has read AND write public surfaces, both authenticated, both auditable.

Pre-conditions for the A10 session:

1. This session's commits pushed; Vercel green; both founder-verification commands return all-pass; both post-deploy `curl` commands return the expected 503 + 404 responses.
2. Founder has decided whether to keep `SUBSTRATE_WRITE_PATH_ENABLED` UNSET (the inert state — most conservative) until A10 lands, OR to set it to `"true"` briefly for testing the POST flow against a real Supabase write (caveat: any caller could write any row while the flag is set).
3. Founder ready to engage Critical Change Protocol again for A10 (which is a Critical session: new auth surface internals, new credential-issuance + verification logic, potentially a new `agent_credentials` table).

A next-session prompt for A10 has NOT been pre-drafted. The founder can request it when ready.

## Blocked On

**Files remaining uncommitted (to be committed by the founder):**

```
 M website/src/app/api/accreditation/[agent_id]/route.ts                                      (POST handler added)
 M website/src/app/api/accreditation/[agent_id]/response-builders.ts                          (six new builders)
 M website/src/app/api/accreditation/[agent_id]/__tests__/route.test.ts                       (write-path tests added; POST-405 test removed)
 M operations/decision-log.md                                                                 (entry appended)
?? website/src/lib/substrate/atl-accreditation-writer.ts                                      (NEW — the library)
?? website/src/lib/substrate/__tests__/atl-accreditation-writer.test.ts                       (NEW — the library test)
?? operations/handoffs/founder/2026-05-16-write-path-build-close.md                           (NEW — this file)
```

**Production state at session close:** unchanged from session start until the founder pushes. Substrate at A7 Verified. `SUBSTRATE_LAYER3_ENABLED` UNSET. `SUBSTRATE_R20A_GATE_ENABLED` UNSET. `SUBSTRATE_WRITE_PATH_ENABLED` **introduced as a new env var; will remain UNSET in Vercel after push** (the founder elects when to set it). `/api/reason` byte-identical. `/api/substrate/layer3` returns 503. `/api/accreditation/[agent_id]` GET behaviour unchanged. After push: POST handler exists at the same URL but returns 503 for all requests until the env var is set. `agent_accreditation` table remains empty. `grade_history` remains empty.

## Open Questions

(All deferred under PR7; revisit conditions named in the decision-log entry.)

- **A10 per-agent credentials.** The next session.
- **Token format ADR.** Inside A10's design.
- **`SUBSTRATE_WRITE_PATH_ENABLED` retirement vs kill-switch repurposing.** Decide at A10 close.
- **AC10 provenance fields on `agent_accreditation`.**
- **GradeChangeEvent webhook emission.**
- **OpenTelemetry instrumentation.**
- **Single Supabase RPC for transactional atomicity.**
- **Client-provided idempotency key + `grade_history` uniqueness constraint.**
- **CORS for cross-origin POST.** `Access-Control-Allow-Methods` still advertises `'GET, OPTIONS'` only; same-origin POSTs work; cross-origin browser POSTs would fail preflight. Acceptable pre-A10.
- **Body-validation strictness on `CarriedProfile` internals.** Current validator is shape-only; deeper validation deferred to the library + persistence layer's natural throw behaviour.

## Verification Method Used (0c Framework)

| Component | Founder Verification Method |
|---|---|
| Library (`atl-accreditation-writer.ts`) | Run `npx tsx --env-file=.env.local src/lib/substrate/__tests__/atl-accreditation-writer.test.ts` locally; expect `N passed / 0 failed`. |
| POST handler (`route.ts`) | (1) Run `npx tsx --env-file=.env.local src/app/api/accreditation/\[agent_id\]/__tests__/route.test.ts` locally; expect `Pass: N  Fail: 0`. The `--env-file` is required as of this session — route.ts now imports the writer + store chain, both of which transitively load `supabase-server.ts` (CLAUDE.md "Running the substrate test suite"). (2) After push + Vercel rebuild, run `curl -i -X POST https://sagereasoning.com/api/accreditation/agent_test_v1 -H "Content-Type: application/json" -d '{"kind":"seed"}'`; expect `HTTP/2 503` with body containing `"not yet enabled"`. |
| Auth gate (env-flag) | The 503 response on POST (above) confirms the env-unset code path. Founder elects whether to test the flag-set path (a separate decision; not part of this session). |
| Existing GET handler regression | After push, run `curl -i https://sagereasoning.com/api/accreditation/agent_test_v1`; expect `HTTP/2 404` with body `{"status":"not_found",...}` (the table is empty). |
| Type-correctness | In-session `tsc --noEmit -p tsconfig.json` ran clean (exit 0). |

## Risk Classification Record (0d-ii)

| Change | Classification |
|---|---|
| Auth gate added to POST handler | **Critical** (new auth surface; AC7 ENGAGED) |
| POST handler at `/api/accreditation/[agent_id]` | **Critical** (new publicly-addressable URL; new deployment surface) |
| `atl-accreditation-writer.ts` library | Standard (KG1 disciplined; deps-injection testability) |
| Response builders + body validator | Standard (pure functions; no I/O) |
| Test files | Standard (mocked dependencies; no production effect) |
| `methodNotAllowed` Allow header change | Standard (cosmetic; no behaviour change for the 405 methods) |

Session-overall classification: **Critical** (highest component sets the session).

## PR5 — Knowledge-Gap Carry-Forward

No concepts required re-explanation this session. Founder's mid-session input was concentrated at Step 1 (five elections via AskUserQuestion) and Step 11 (explicit approval); the rest of the session ran without needing decisions. PR15 consult of `.claude/skills/anthropic/` produced no substitute primitive (the route is bespoke Next.js; `mcp-builder` recorded as a forward pointer for R18c interoperability). Knowledge gaps register at `/operations/knowledge-gaps.md` not edited this session.

## Founder Verification

**Three things to do, in order. Take them one at a time — do not paste the blocks as multi-line commands per the CLAUDE.md note about prompt-consumption.**

### 1. Run the local tests (pre-push verification)

Open Terminal. Run each command on its own line, waiting for each to finish:

```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/website"
```

```
npx tsx --env-file=.env.local src/lib/substrate/__tests__/atl-accreditation-writer.test.ts
```

**Expected:** lots of `PASS  …` lines (about 35 tests), ending with `atl-accreditation-writer.test.ts — N passed / 0 failed`. If you see any `FAIL` line OR the final line says any non-zero number of failures, stop and tell me before pushing.

```
npx tsx --env-file=.env.local src/app/api/accreditation/\[agent_id\]/__tests__/route.test.ts
```

**Expected:** `Total: N  Pass: N  Fail: 0` (about 60+ tests across GET-path + write-path builders + 405 methods + OPTIONS). If failures, stop and tell me.

**Why `--env-file=.env.local` is now needed for the route test (CLAUDE.md note):** the write-path build added POST handler imports to `route.ts`, which transitively load `supabase-server.ts`. `supabase-server.ts` constructs a Supabase client at module load. The client is constructed but never CALLED by this test — but the construction itself needs the env vars, so `--env-file=.env.local` is required. (Pre-build, the route test ran without it — the GET-path response builders didn't touch Supabase. The write-path build expanded the route's import surface; the test runner now sees the wider transitive chain.)

### 2. Commit and push

Use targeted adds (explicit paths, not `git add -A`). Run each command on its own line:

```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
```

```
rm -f .git/index.lock
```

```
git add website/src/lib/substrate/atl-accreditation-writer.ts
```

```
git add website/src/lib/substrate/__tests__/atl-accreditation-writer.test.ts
```

```
git add website/src/app/api/accreditation/[agent_id]/route.ts
```

```
git add website/src/app/api/accreditation/[agent_id]/response-builders.ts
```

```
git add website/src/app/api/accreditation/[agent_id]/__tests__/route.test.ts
```

```
git add operations/decision-log.md
```

```
git add operations/handoffs/founder/2026-05-16-write-path-build-close.md
```

Then the commit (one command, but multi-line message — paste the whole block including the closing `"`):

```
git commit -m "Write-path build (step 7 of 8 of post-6b arc)

Lands the write-path into agent_accreditation per
D-ATL-WRITE-PATH-DESIGN-LOCKED-2026-05-16. All seven design decisions
A-G implemented in one Critical-risk session (PR1).

  - Library at /website/src/lib/substrate/atl-accreditation-writer.ts
    exposes seedAccreditation + updateAccreditation (Decisions A + B +
    D + E + F + G). Deps-injection seam for testability.
  - POST handler at /api/accreditation/[agent_id] (Decisions A + C):
    rate-limit + auth gate + body validate + pre-flight lookup +
    seed/update dispatch + 200/400/401/404/409/503 mapping.
  - Auth gate (verifyAgentIdOwnership) is A10-shaped; pre-A10
    stopgap is feature-flag gated via SUBSTRATE_WRITE_PATH_ENABLED.
    Default UNSET = route inert in production.
  - Six new write-path response builders. Test files added/extended.
  - Method-not-allowed list: POST removed from 405; Allow header
    now advertises GET, POST, OPTIONS.

Critical risk; AC7 engaged (new auth surface). PR6 not engaged
(no R20a / distress-classifier surface). 'No current users'
governing note: CCP step 3 = N/A.

tsc --noEmit clean. Founder Critical Change Protocol approval
recorded specific to the seven named risks.

Decision log: D-ATL-WRITE-PATH-BUILD-WIRED-VERIFIED-2026-05-16.

Next: step 8 - A10 per-agent credentials (Critical)."
```

Then push via **GitHub Desktop**.

**Expected Vercel behaviour:** standard rebuild (~2 min). After the rebuild, the route accepts POST requests but returns 503 because `SUBSTRATE_WRITE_PATH_ENABLED` is UNSET. The existing GET behaviour is unchanged.

### 3. Post-deploy URL checks

After Vercel reports the deployment as green, run each `curl` on its own line:

**POST inert-state check (proves the route exists, the auth gate fires, nothing writes):**

```
curl -i -X POST https://sagereasoning.com/api/accreditation/agent_test_v1 -H "Content-Type: application/json" -d '{"kind":"seed"}'
```

**Expected:** the first line is `HTTP/2 503`. The body (after the headers) is a JSON object containing `"status":"error"` and a message saying the write surface is not yet enabled, plus `"documentation_url":"https://sagereasoning.com/limitations"`. If you see HTTP 200 instead, the auth gate is misconfigured — message me before doing anything else, and follow rollback path (B) (`git revert HEAD --no-edit` + push). If you see HTTP 401 / 400 / 404 / 409, that's unexpected but probably fine — message me so we can confirm what fired.

**GET regression check (proves the existing read endpoint is unchanged):**

```
curl -i https://sagereasoning.com/api/accreditation/agent_test_v1
```

**Expected:** `HTTP/2 404` with body `{"status":"not_found", "message":"No accreditation record found...", "documentation_url":"https://sagereasoning.com/limitations"}`. If you see 503 or 500 or anything auth-related, the GET regressed — message me; follow rollback path (B).

If both checks return the expected results, the session is fully Verified and Live. You can leave `SUBSTRATE_WRITE_PATH_ENABLED` UNSET indefinitely; nothing breaks. The route is operational but inert, ready for A10 to fill the auth seam at step 8.

## Rollback path

Three paths, depending on when something goes wrong:

**A. Before push** (you spot something wrong while reviewing the diff in GitHub Desktop):
```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
git reset --hard HEAD~1
```
Discards the commit. No production effect. Re-run the build session from a clean state.

**B. After push, before flipping the env var** (route exists in production but every POST returns 503 because the env var is UNSET — the route is effectively inert):
```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
git revert HEAD --no-edit
```
Then push via GitHub Desktop. Vercel rebuilds (~2 min). Post-revert: the new library file removed; POST handler removed from `route.ts`; new response builders removed; test files removed; method-not-allowed list restores POST to the 405 set. The orphaned `SUBSTRATE_WRITE_PATH_ENABLED` env var becomes inert (no code reads it). The GET handler is byte-identical to its pre-session state.

**C. After push AND env var set** (route is live + accepting writes, and you want to disable writes without removing the code): in Vercel — Project → Settings → Environment Variables → unset `SUBSTRATE_WRITE_PATH_ENABLED` (or set to anything other than the exact string `"true"`). No rebuild needed; env-var changes take effect on the next function invocation. POST returns 503 immediately.

**Supabase rollback:** none required this session — no schema change.

## Cross-references

- Operative session prompt: the write-path build next-session prompt provided at session open.
- Predecessor session close (write-path design pass): `/operations/handoffs/founder/2026-05-16-write-path-design-pass-close.md`
- Design document (this build's spec): `/adopted/atl-write-path-design.md`
- Sequencing source: `/operations/handoffs/founder/2026-05-15-post-build-brainstorm-close.md` (step 7 of 8 in the post-6b arc)
- Decision-log entry (this session): `D-ATL-WRITE-PATH-BUILD-WIRED-VERIFIED-2026-05-16`
- Predecessor decision-log entries: `D-ATL-WRITE-PATH-DESIGN-LOCKED-2026-05-16` (the spec); `D-ATL-KATHEKON-ALIGNED-ALTERNATIVE-BUILD-WIRED-VERIFIED-2026-05-16` (structural precedent); `D-ATL-PUBLIC-ACCREDITATION-ENDPOINT-WIRED-VERIFIED-2026-05-16` (the existing GET endpoint — behaviour preserved by this build); `D-ATL-BADGE-SCHEMA-PERSISTENCE-WIRED-VERIFIED-2026-05-15` (the persistence layer this build's library invokes); `D-SUBSTRATE-CATEGORY-CHARACTER-KERNEL-ADR-2026-05-12` (J1 ADR — Character Kernel category language preserved).
- New library: `/website/src/lib/substrate/atl-accreditation-writer.ts`
- Modified route: `/website/src/app/api/accreditation/[agent_id]/route.ts`
- Modified response builders: `/website/src/app/api/accreditation/[agent_id]/response-builders.ts`
- New library test: `/website/src/lib/substrate/__tests__/atl-accreditation-writer.test.ts`
- Modified route test: `/website/src/app/api/accreditation/[agent_id]/__tests__/route.test.ts`
- Persistence layer (the library's call target): `/website/src/lib/substrate/atl-accreditation-store.ts`
- Wrapper (upstream source of `CarriedProfile` + `TransitionResult`): `/website/src/lib/substrate/atl-wrapper.ts`
- Grade-transition engine: `/website/src/lib/substrate/trust-layer/grade-engine/grade-transition-engine.ts`
- Handler precedent: `/website/src/lib/substrate/trust-layer/accreditation/public-endpoint.ts`

*End of session close. With this session's files committed + pushed, the substrate has read AND write public surfaces. The write surface is inert by default (env-flag-gated); the founder flips `SUBSTRATE_WRITE_PATH_ENABLED` to `"true"` in Vercel when ready to accept writes. The natural next session is step 8 — A10 per-agent credentials — which replaces the env-flag gate with per-agent token verification and closes the post-6b arc.*
