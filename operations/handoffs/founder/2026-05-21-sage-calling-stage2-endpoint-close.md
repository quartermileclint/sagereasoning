# Session Close — 2026-05-21 — Sage Calling: Build Stage 2 (Critical public-surface half)

**Stream:** founder.
**Governing frame:** `/adopted/standing-protocol-cache.md` (`code-critical` → Full template + Critical Change Protocol) + `/adopted/build-sessions-protocol-cache.md` ("no current users" relaxes Critical Change Protocol step 3 only).
**Tier:** `code-critical`. **Critical** risk under 0d-ii. AC7 **ENGAGED** (A10 auth gate). PR6 **NOT** engaged (no R20a/distress surface). Full Critical Change Protocol completed visibly this session.
**Date:** 2026-05-21.
**Operative deliverable:** `/adopted/purpose-discovery-product-design.md` (D-2/D-5/D-6/D-8/D-12/D-13/D-14 + the R18d block).
**Operative prompt:** `/operations/handoffs/founder/2026-05-21-sage-calling-stage2-endpoint-NEXT-SESSION-PROMPT.md`.
**Decision-log entry:** `D-SAGE-CALLING-STAGE2-ENDPOINT-WIRED-VERIFIED-2026-05-21`.

This session wired the verified engine + store into an A10-authenticated, metered, kill-switched public endpoint, enforced the Hard Gate, bumped Layer 1 to v3, and proved it all against the R18d adversarial suite. The product is **Wired** and goes **Live only when the founder flips `SAGE_CALLING_ENABLED`** — production is byte-identical until then.

## What was built

1. **`POST /api/calling`** (`website/src/app/api/calling/route.ts`) — the public purpose-discovery endpoint. Rate-limit → **global `SAGE_CALLING_ENABLED` kill switch** (503 if off, checked before auth) → body parse → **A10 token gate** (reuses `validateAtlWriteToken`; single 401 on any failure; `atl_verify` audit event) → optional **Agent Card** fetch+verify (D-13; logged, never trusted) → **per-stage Option D metering** (one loop per billable call; a resumed `loop_id` is a no-op, never a 400) → the **endpoint↔engine contract** (cold-open / advance / re-fetch / D-12 holding / terminal-status) → `persistTurn`. R4: only the verbatim question/clarification text + a coarse status ever reach the agent — never the variant, rule, or signals.

2. **`POST /api/calling/approve`** (`.../approve/route.ts`) — the **Hard Gate's external approval** entry point, **admin-gated** (`requireAdmin`/`ADMIN_USER_ID`). This is the ONLY path that flips `gate_status` to `approved`/`blocked` and the ONLY place the five-spec `discovered_purpose` (D-5) is built and returned to the developer. The agent (holding only an `sr_atl_` token) cannot reach it — so the handoff cannot fire on the agent's say-so (D-14).

3. **Pure helpers** — `request-helpers.ts` (body parse; `available_tools` declined), `response-builders.ts` (every response carries the R3/R9 disclaimer + R18e `interaction_type`), `lib/sage-calling/calling-service.ts` (the contract, the D-12 24h holding pattern, the D-5 assembly), `lib/sage-calling/agent-card.ts` (https + origin anti-spoof; tool/skill claims never read as capacity).

4. **Layer 1 `version` → v3** (`layer1-extractor.ts`) — additive widening (accept v1|v2|v3); producer example unchanged; Layer 2 decoupled. Founder-elected (AI pushed back once; founder overrode; executed safely).

5. **R18d adversarial suite** + service/card unit tests.

## Decisions Made
- `D-SAGE-CALLING-STAGE2-ENDPOINT-WIRED-VERIFIED-2026-05-21` appended (full Critical form). Founder elections at open (AskUserQuestion): **D-12 timeout = 24h**; **new context = a new `session_id`** (in-session re-injection deferred per D-11/PR7); **Hard-Gate approval = admin-only**; **Layer 1 `version` → v3** (founder override of the AI recommendation; executed as a safe additive widening).

## Status Changes
| Item | Old | New |
|---|---|---|
| Sage Calling — Stage 2 public surface (endpoint, A10 gate, Hard Gate, R18d, `SAGE_CALLING_ENABLED`) | Scoped | **Wired** (tsc clean; calling-service 28/0; agent-card 16/0; R18d 9/0) → Verified/Live on founder deploy + flag flip |
| Sage Calling — `POST /api/calling/approve` (admin Hard-Gate approval) | — | **Wired** |
| Layer 1 schema `version` | v2 | **v3** (additive; accepts v1\|v2\|v3; producer unchanged) |

## Verification Method Used (0c framework)
- **New suites** (plain-assertion `tsx`): calling-service **28/0**, agent-card **16/0**, R18d **9/0** — R18d rules HELD (validation-steering challenged; covert framing resisted; spoofed/poisoned cards rejected); **no PR7 hybrid escalation triggered**.
- **Whole project**: `npx tsc --noEmit` clean.
- **Regression**: question-library 90/0; engine 41/0; session-store 30/0; layer1-schema-additions **50/0** (the suite that exercises the v3 area). The two layer2 *Jest-style* tests (`layer2-canonical-json`, `layer2-signer`) are not tsx-runnable (`describe is not defined`) — a pre-existing harness mismatch, unaffected by this change; `tsc` type-checks `layer2-mechanisms.ts` against the widened union.
- **PR2 (build-to-wire)**: grep confirms the global flag, the auth gate, the metering call, and `persistTurn` are invoked in the request path; the gate flip + five-spec build occur ONLY in the admin approve route.
- **Live round-trips**: the founder post-deploy smoke test below (nothing is Live until the flag is flipped).

## Risk Classification Record (0d-ii)
- Endpoint + approve route — **Critical** (new auth-gated public surface; AC7 engaged; R17 persistence; deployment-config flag).
- Layer 1 v3 bump — **Elevated** (additive validator widening; no runtime change to existing paths; Layer 2 decoupled).
- Pure helpers + tests — Standard (no surface).
- Session set to **Critical**; full Critical Change Protocol completed (see the decision-log entry, 6 steps).

## PR5 — Knowledge-Gap Carry-Forward
No concept required re-explanation. KG1 (every Supabase + billing call awaited; no fire-and-forget; no endpoint self-calls — engine/store are direct imports) and KG7 (store writes JSONB arrays directly) engaged + enforced. Cumulative count unchanged.

## Next Session Should
**Founder elects the next track** — the Sage Calling build arc is complete (Live-gated). Candidates: (a) the **K-category migration** (swap remaining bundled-prose consumers onto the translation-sandwich substrate — the build-arc's remaining product work); (b) the **Stage 1-close lawyer engagement** (TOS + liability + the 90-day retention / privacy-policy-adjacent values; critical-path per ST2 Q4); (c) smaller **PR7 follow-ons** for Sage Calling (persist the Agent-Card verdict to carry the chosen-role hint into the five-spec; per-developer delegated Hard-Gate approval; the rules+LLM hybrid only if a future adversarial finding warrants it). No follow-up prompt is pre-written — the founder chooses order.

## Blocked On
**Files to commit + push via GitHub Desktop (only these — do NOT blanket `git add .`):**
- `website/src/app/api/calling/route.ts` (new)
- `website/src/app/api/calling/approve/route.ts` (new)
- `website/src/app/api/calling/request-helpers.ts` (new)
- `website/src/app/api/calling/response-builders.ts` (new)
- `website/src/lib/sage-calling/calling-service.ts` (new)
- `website/src/lib/sage-calling/agent-card.ts` (new)
- `website/src/lib/sage-calling/__tests__/calling-service.test.ts` (new)
- `website/src/lib/sage-calling/__tests__/agent-card.test.ts` (new)
- `website/src/lib/sage-calling/__tests__/r18d-adversarial.test.ts` (new)
- `website/src/lib/translation-sandwich/layer1-extractor.ts` (edit — v3 bump)
- `operations/decision-log.md` (entry appended)
- `operations/handoffs/founder/2026-05-21-sage-calling-stage2-endpoint-close.md` (this close)

**Side-effect to clean up:** running `tsc` regenerates `website/tsconfig.tsbuildinfo` (a generated incremental-build artefact) — leave it out of the commit, or `git restore website/tsconfig.tsbuildinfo`.

**Production state at session close:** **UNCHANGED — nothing deployed, nothing Live.** `SAGE_CALLING_ENABLED` does not exist in Vercel yet, so once pushed, `POST /api/calling` and `/api/calling/approve` compile and deploy but return **503** on every call until the flag is set to `true`. A10 Live + Verified. Substrate at A7 Verified. `SUBSTRATE_LAYER3_ENABLED` UNSET. `SUBSTRATE_R20A_GATE_ENABLED` UNSET. Option D Live (Sage Calling reuses its `wrapper_internal` metering). `discovery_sessions` exists (Stage 1) and stays empty until the first Live call. Layer 1 now accepts v3 but `/api/reason`'s Layer 1 output is byte-unchanged (producer still emits v1).

## Open Questions
- D-4 PR7 hybrid (rules+LLM): NOT triggered — the R18d rules held. Revisit only on a future missed-signal finding.
- Agent-Card chosen-role hint is logged but not persisted (no migration); approval-time `role` defaults to `individual_nature`. PR7 follow-on.
- Per-developer delegated Hard-Gate approval (vs admin-only): PR7 follow-on once external users exist.
- 90-day retention + privacy-policy-adjacent values: lawyer-engagement track.

## Founder Verification (between sessions)

**1. Re-run the in-session checks (from `website/`):**
```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/website"
npx tsc --noEmit
npx tsx src/lib/sage-calling/__tests__/calling-service.test.ts
npx tsx src/lib/sage-calling/__tests__/agent-card.test.ts
npx tsx src/lib/sage-calling/__tests__/r18d-adversarial.test.ts
```
Expected: `tsc` exits 0 (no output); `28 pass / 0 fail`; `16 pass / 0 fail`; `9 pass / 0 fail` (and the R18d "rules HELD" summary). Run them ONE AT A TIME (a prompt would otherwise eat the next pasted line).

**2. Commit + push (GitHub Desktop):** stage the 12 files above (discard `tsconfig.tsbuildinfo`), paste the commit message, commit, then push. A Vercel rebuild compiles the routes; **runtime behaviour is unchanged** (the flag is unset → 503).
```
Sage Calling Stage 2 (Critical public surface) — POST /api/calling + admin Hard-Gate approval

Authenticated (A10 sr_atl_ reuse, single-401), metered (Option D wrapper_internal,
duplicate loop_id = no-op), kill-switched (SAGE_CALLING_ENABLED, off by default).
Endpoint↔engine contract over the verified engine+store; D-12 24h holding pattern;
D-13 agent_card_url fetch+verify (decline available_tools); D-14 Hard Gate — five-spec
discovered_purpose built + gate flipped ONLY on the admin approve route. Layer 1 version
-> v3 (additive; Layer 2 decoupled). R18d suite: rules held (no PR7 escalation).

tsc clean; calling-service 28/0; agent-card 16/0; R18d 9/0; regression green.
Critical; Live-gated by SAGE_CALLING_ENABLED (unset = 503). Per
D-SAGE-CALLING-STAGE2-ENDPOINT-WIRED-VERIFIED-2026-05-21.
```

**3. Go Live (Vercel) — ONLY after you've reviewed the Critical Change Protocol risks and are ready:**
Vercel → your project → **Settings → Environment Variables** → add `SAGE_CALLING_ENABLED` = `true` (Production) → **redeploy**. To turn it back off instantly: unset it (or set to anything but `true`) → every call 503s again, no code change.

**4. Post-deploy smoke test** (needs an UNSCOPED `sr_atl_` test credential for an agent_id you control — mint via the A10 admin credential surface):

> **Curl conventions (operational findings, recorded 2026-05-21):**
> - **Use the canonical `https://www.sagereasoning.com` host.** The apex `sagereasoning.com` returns a Vercel **307** to `www`; `curl` does not follow it by default, and `curl -L` **drops the `Authorization` header on the cross-host redirect** → a spurious 401. Do not add `-L`; target `www.` directly. (This is a KG1 rule-3 manifestation — www↔non-www header stripping.)
> - **Admin Supabase JWT expires (~1 hour).** The admin endpoints (`/api/admin/accreditation-credentials`, `/api/calling/approve`) need a fresh `ey…` token grabbed immediately before the call.

Flag OFF (before step 3), or after turning it off:
```
curl -i -X POST https://www.sagereasoning.com/api/calling \
  -H "Authorization: Bearer sr_atl_YOURTOKEN" -H "Content-Type: application/json" \
  -d '{"session_id":"smoke-001","agent_id":"agent_YOURORG_v1"}'
```
Expected: **503** `"Sage Calling is not currently enabled."`

Flag ON — cold open (no `response`):
```
curl -i -X POST https://www.sagereasoning.com/api/calling \
  -H "Authorization: Bearer sr_atl_YOURTOKEN" -H "Content-Type: application/json" \
  -d '{"session_id":"smoke-001","agent_id":"agent_YOURORG_v1"}'
```
Expected: **200**, `"status":"in_progress"`, `"stage":"Q1"`, a `question`, plus the disclaimer + `interaction_type`.

Auth failure modes:
```
# no token  -> 401
curl -i -X POST https://www.sagereasoning.com/api/calling -H "Content-Type: application/json" \
  -d '{"session_id":"smoke-002","agent_id":"agent_YOURORG_v1"}'
# wrong agent_id for the token -> 401
curl -i -X POST https://www.sagereasoning.com/api/calling \
  -H "Authorization: Bearer sr_atl_YOURTOKEN" -H "Content-Type: application/json" \
  -d '{"session_id":"smoke-003","agent_id":"agent_SOMEONEELSE_v1"}'
```

Walk the sequence (send a `response` each time; reuse the `session_id`). A clean run reaches **`"status":"awaiting_approval"`** at Q5 — and the gate stays paused (the agent's calls never flip it). Confirm the row + JSONB shape (Supabase SQL Editor):
```
select session_id, current_stage, gate_status, outcome,
       jsonb_typeof(response_history) as rh_type,
       jsonb_typeof(signals_detected) as sd_type
from discovery_sessions where session_id = 'smoke-001';
```
Expected: `rh_type='array'`, `sd_type='array'`, `gate_status` progressing `pending → awaiting_approval`.

Approve (releases the handoff) — needs your **admin Supabase session JWT** (the `/api/calling/approve` route is admin-gated; the agent's `sr_atl_` token cannot approve):
```
curl -i -X POST https://www.sagereasoning.com/api/calling/approve \
  -H "Authorization: Bearer <YOUR_ADMIN_SUPABASE_JWT>" -H "Content-Type: application/json" \
  -d '{"session_id":"smoke-001","decision":"approve"}'
```
Expected: **200**, `"gate_status":"approved"`, and the assembled `discovered_purpose` five-spec. Re-run the SQL → `gate_status='approved'`. Clean up the test row anytime via the R17h hard-delete path.

## Cross-references
- `/operations/handoffs/founder/2026-05-21-sage-calling-stage2-engine-store-close.md` (predecessor — engine + store half)
- `/operations/handoffs/founder/2026-05-21-sage-calling-stage2-endpoint-NEXT-SESSION-PROMPT.md` (the operative prompt for this session)
- `/adopted/purpose-discovery-product-design.md` (the locked design)
- `D-SAGE-CALLING-STAGE2-ENDPOINT-WIRED-VERIFIED-2026-05-21` + `D-SAGE-CALLING-STAGE2-ENGINE-STORE-WIRED-VERIFIED-2026-05-21` + `D-SAGE-CALLING-STAGE1-BUILD-WIRED-VERIFIED-2026-05-21` + `D-PURPOSE-DISCOVERY-DESIGN-LOCKED-2026-05-21` + `D-ATL-A10-BUILD-WIRED-VERIFIED-2026-05-21` (decision-log)
- `/adopted/standing-protocol-cache.md`; `/adopted/build-sessions-protocol-cache.md`

*End of session close. Stabilised to a known-good state: the Critical public surface is Wired + Verified in-session (tsc clean; 28/0 + 16/0 + 9/0; regression green; R18d rules held), Live-gated by `SAGE_CALLING_ENABLED` (unset → 503), production byte-identical. 12 files await commit + push; going Live is the founder's flag flip after reviewing the Critical Change Protocol risks.*
