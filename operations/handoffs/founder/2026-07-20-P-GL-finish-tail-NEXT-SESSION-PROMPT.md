# Next-Session Prompt — P-GL (finish): activate the gate-builds + complete the go/no-go doc

**Program:** Agent-Organization + Evidence Program (AO) — this finishes **P-GL** (the launch go/no-go session; `operations/agent-org-2026-07/agent-org-and-evidence-build-plan.md` §3).
**Stream:** founder (launch readiness). **Parallel-safe with P1/P2; NOT gated on P4/P5.**
**Tier:** **`code-elevated`** for the mentor-route wiring + any #13 build; the migrations, the #9 RLS `REVOKE`, the Part-A checks, and the post-deploy smokes are **founder-walked (PR17)** — the AI guides + verifies, performs no prod op. **#9's RLS lockdown is an access-control change on production — treat it as its own `code-critical` founder-walked step (query prod first → `REVOKE` second → re-verify), never a blind REVOKE.** Confirm the tier per sub-step at open.
**Governing frame:** `/adopted/standing-protocol-cache.md`.
**Predecessor close:** `operations/handoffs/founder/2026-07-20-P-GL-golive-checklist-CLOSE.md`.
**Predecessor decision-log entry:** `D-AGENT-ORG-P-GL-GOLIVE-CHECKLIST-AND-GATE-BUILDS-2026-07-20`.

## Current state (as of the 2026-07-20 P-GL build session, deployed)

The P-GL build session shipped the whole buildable launch surface and the founder **committed + pushed (Vercel green)**. So RIGHT NOW in production:
- **LIVE (deployed):** #28 (Export/Delete dashboard buttons wired to `/api/user/export` + `/api/user/delete`), #6 (real DB + Anthropic health probes, 503-on-degraded), #10 (honest 503 on an Anthropic outage across 9 consumer routes).
- **BUILT but INERT** (missing-table-benign — activate by applying their migration, no flag): #5 `route_errors` store, #8 `throttle_events` store.
- **PREPARED, not run:** #9 RLS lockdown SQL (`website/supabase-rls-audit-and-lockdown.sql`).
- **Authored:** the go/no-go checklist (`operations/agent-org-2026-07/go-live-readiness-checklist.md`, item #16) — with PENDING cells for Part A.
- **Pending founder decision:** #13 (magic-link-suffices vs a password-reset UI).
- **Named mechanical follow-up:** #5/#10 wiring into the remaining mentor LLM routes (the core user-facing scoring routes are done; the helpers are a one-line drop-in).

Batteries at predecessor close: `llm-outage` 35/0 · `security` 20/0 · `api-key-defaults` 12/0 · `tsc` 0 · `npm run build` exit 0 (141/141).

## Standing constraints (AO §2)

- Nothing is pre-approved; the founder performs every prod op (migrations, RLS REVOKE, deploy, smokes) — PR17; the AI guides + verifies.
- MEASURE throughout; weights BLOCKED; the S11 flip stays REFUSED; the 0h call remains the founder's — **this session PREPARES/COMPLETES the go/no-go artifact; it does not make the 0h call.**
- The working tree may carry unrelated other-stream files (`2026-07-13-remaining-*`, `website/src/data/environmental-context.json`, `inbox/*.rtf`) — commit only this session's files; **do NOT `git add -A`.**
- Any `route.ts`/`page.tsx` change is gated by `npm run build`, not just `tsc` (memory `nextjs-route-export-validation`).
- The observability writers are fail-soft + missing-table-benign; keep that posture on any new wiring (never fail-closed, never fire-and-forget on the hot path — `waitUntil` per the established pattern).

## Pre-conditions / open (read in order)

1. `/adopted/standing-protocol-cache.md`.
2. The predecessor close (above).
3. `operations/agent-org-2026-07/go-live-readiness-checklist.md` (the #16 doc being completed).
4. The three authored SQL files: `website/supabase-route-errors-migration.sql`, `website/supabase-throttle-events-migration.sql`, `website/supabase-rls-audit-and-lockdown.sql`.

Confirm at open: tier per sub-step; that the founder runs the migrations / RLS / smokes; production state (the three LIVE items above).

## Part A — founder-walked activation + verification (the AI guides + records)

**A1. Part A prod confirmations** (the 5 checks from the predecessor session, if not already done): the 5 R20a flags `true` in Vercel; `/api/health` → `mentor_encryption: active`; the `/api/evaluate` free-demo sign-off; `/api/keys` deployed (non-404); `analytics_events` prod table present. **Record each into the go/no-go doc's PENDING-PROD-CONFIRM cells.**

**A2. Post-deploy smoke of the now-LIVE builds** (founder-walked; the AI supplies exact commands):
- **#6** — `curl -s https://www.sagereasoning.com/api/health` → expect `status: healthy`, `subsystems.supabase: connected`, `subsystems.anthropic_api: connected`, `checks.*: reachability`, HTTP 200. (If a subsystem shows `unreachable` + 503, that's a REAL finding.)
- **#28** — authenticated click-through on the deployed dashboard: Export downloads the JSON; Delete behind the modal 200s (**use a throwaway test account** — deletion is irreversible); privacy copy now matches.
- **#10** — optional: confirm a score route still returns normally (the 503 only fires on a real Anthropic outage; no easy way to force one — the 35/0 battery covers the classifier).

**A3. Apply the 2 migrations** (Supabase SQL Editor, prod) — activates #5 + #8:
- `website/supabase-route-errors-migration.sql` (run + its VERIFY section → confirm table/indexes/RLS/trigger).
- `website/supabase-throttle-events-migration.sql` (run + VERIFY).
- After apply, confirm activation: trigger a 429 (hammer a rate-limited endpoint) or a route error, then `SELECT count(*) FROM public.throttle_events;` / `route_errors;` → rows accrue. (Missing-table-benign means nothing broke before this; now they capture.)

**A4. #9 RLS lockdown (`code-critical`, query-first)** — `website/supabase-rls-audit-and-lockdown.sql`:
- Run §A (inventory — **save the output**, it's the audit deliverable) + §B (pre-check; **save the §B2 grant output** for rollback).
- Run §C (ENABLE RLS + REVOKE on the 3 tables).
- Run §D (re-verify: RLS true, zero anon/authenticated grants) + smoke a billing/cost surface still works (service-role bypasses RLS).
- Paste the §A inventory into the go/no-go doc (the positive per-table RLS map #9 asked for).

## Part B — the small remaining build (`code-elevated`; founder-walked deploy)

**B1. Wire #5/#10 into the remaining mentor LLM routes** (mechanical — the helpers `logRouteError` + `isLlmOutage`/`llmOutageResponse` are a one-line drop-in). Scope: the mentor routes that make LLM calls (e.g. `mentor/private/reflect`, `mentor/passion-classify`, `mentor/sage-compass`, and the other LLM-calling mentor routes — NOT the pure-CRUD ones, whose 500s aren't LLM outages). Same pattern as the 9 consumer routes: in each outer catch, `const outage = isLlmOutage(error); logRouteError({...}); if (outage) return llmOutageResponse(...)`. `tsc` 0 + `npm run build` 0 + a founder-walked deploy.

**B2. #13 — auth recovery** (founder decision FIRST): magic-link-suffices vs a password-reset UI. If "magic-link suffices," record the decision + verify the Supabase Auth recovery/OTP email templates are enabled/tested (dashboard config, not code). If "build a reset UI," that's a `code-elevated` build (a `/auth` reset flow + the Supabase `resetPasswordForEmail` call) — scope it here or spin it into its own small session.

## Part C — complete the go/no-go doc + close

- Fill every PENDING cell (Part A results, the RLS inventory, the mentor-route wiring status, the #13 decision) so the go/no-go artifact is complete.
- Update its "Go/no-go posture" summary: what's satisfied, what remains (org-ownership Section D → P1; #7 optional).
- Decision-log entry (lean, per tier) + session close.

## NOT in scope (deferred / routed)
- Org-ownership items (#11 support@ monitoring, #12 escalation owner, #15 email vendor, #21 incident/rollback owner, #22 migration tooling, #26/#25 Growth cadence, #18 session continuity) → **AO P1 gap-map** (`P1-agent-roster-gap-analysis.md`), not here.
- §9 deferrals (#17 cache, #20 feedback thumbs, #23 KB) → post-launch. #24 R20b already dark-by-decision.
- The 0h call itself — the founder's, made against the completed go/no-go doc; this session does not make it.

## Deliverables
- The go/no-go doc completed (all cells filled; the #9 RLS inventory pasted in).
- #5/#8 live (migrations applied + verified); #9 tables locked + re-verified; #6/#28/#10 smoke-confirmed.
- The mentor-route #5/#10 wiring (built + deployed) or an explicit deferral note.
- The #13 decision recorded (+ template verification, or a scoped reset-UI build).
- Decision-log entry + session close.

## Verification (per changed surface)
- Migrations: each file's VERIFY section green on prod; rows accrue after a real 429 / route error.
- #9: §D re-verify (RLS true, zero anon/authenticated grants); billing surface still reads.
- B1 mentor wiring: `tsc` 0, `npm run build` 0; an induced mentor-route error logs to `route_errors` post-migration.

## Rollback
Each build is additive + independently `git revert`-able. #5/#8 migrations carry rollback blocks (DROP the table + trigger + function). #9's RLS: record the §B2 grants first; §E restores. #28/#6/#10 are byte-reversible via revert + redeploy.

## Scope discipline
`code-elevated` mechanical wiring on an already-built substrate; every prod op founder-walked. This session activates the built gate-builds, completes the go/no-go artifact, and closes the launch-honesty items — it does NOT make the 0h call, touch the org roll-out (P1/P4/P5), or the trust-layer surfaces. **S11 REFUSED; MEASURE throughout; weights BLOCKED; the 0h call remains the founder's.**

End of prompt.
