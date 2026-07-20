# Next-Session Prompt — P-GL: Go-live checklist + gate builds

**Program:** Agent-Organization + Evidence Program (AO) — this is **P-GL**, the launch go/no-go session added 2026-07-19 (`operations/agent-org-2026-07/agent-org-and-evidence-build-plan.md`, §3; `D-LAUNCH-FEEDBACK-RECONCILIATION-FOLDED-INTO-AO-PLAN-2026-07-19`).
**Stream:** founder (launch readiness). **Parallel-safe with P1/P2; NOT gated on P4/P5** — this is product launch-readiness, independent of the org roll-out. (P1 is being handled in another session; the plan already carries the reconciliation as a P1 input, so do not duplicate P1 here.)
**Tier:** **`code-elevated`** for the gate-builds; the **prod verifications + the deploy + #9's RLS `REVOKE` are founder-walked (PR17)**; the go/no-go doc itself is `governance`. **#9's RLS lockdown is an access-control change on production — treat that ONE step as `code-critical` (query prod first → `REVOKE` second → re-verify), never a blind REVOKE.** Confirm the tier per sub-step at open.
**Governing frame:** `/adopted/standing-protocol-cache.md` + `/adopted/build-sessions-protocol-cache.md`.
**Size:** 1–2 focused sessions (a recommended split is marked below).

## Current status (as of 2026-07-19, verified this session)

The last 3 commits are **documents-only; production is byte-equivalent** (nothing functional shipped):
- `a335b2e` — AO plan amendment: folded the launch-feedback reconciliation + added this P-GL session.
- `fa8f59f` — P0 diagnosis (s9-loop consult credential DIAGNOSED HEALTHY; no refresh).
- `c613b86` — AO plan adoption + s9-loop refresh prompt.

So the production state this session verifies is the **pre-existing** live substrate (unchanged by those commits). This session is the FIRST that ships functional code since the AO program opened — every build is founder-walked to deploy.

## Why this session

The 28-item launch-feedback reconciliation (`operations/agent-org-2026-07/2026-07-19-launch-feedback-reconciliation.md`, code-verified + adversarially re-checked, all 28 CONFIRMED) found the launch is **much closer than the raw list implied**: of the 5 items called TIER-1 blockers, only #5 is a genuine gap; the core product/safety/security substrate is already built. This session (a) **confirms the LIVE items in prod**, (b) knocks out the **small gate-builds** on the already-built substrate, and (c) **produces the go/no-go doc** (feedback item #16) — the artifact the currently-undocumented single "0h call" should rest on.

**The input is authoritative** — the reconciliation already verified every LIVE claim against code, so this session CONFIRMS in prod; it does NOT re-investigate. Read it in full at open; it carries per-item file/endpoint evidence.

## Standing constraints (AO §2)

- Nothing is pre-approved; the founder performs every prod verification, the deploy, and the RLS `REVOKE` (PR17); the AI guides + verifies.
- MEASURE throughout; weights BLOCKED; the S11 flip stays REFUSED; the 0h call remains the founder's — **this session PREPARES the go/no-go artifact; it does not make the 0h call.**
- The working tree carries unrelated other-stream files (`2026-07-13-remaining-*`, `website/src/data/environmental-context.json`, `inbox/*.rtf`) — commit only this session's files; do **NOT** `git add -A`.
- Any `route.ts`/`page.tsx` change is gated by `npm run build`, not just `tsc` (memory `nextjs-route-export-validation`).

## Pre-conditions / open (read in order)

1. `/adopted/standing-protocol-cache.md`.
2. `operations/agent-org-2026-07/2026-07-19-launch-feedback-reconciliation.md` (the verified input — the per-item "true state" + evidence + effort).
3. The AO plan §3 P-GL + §2 (`agent-org-and-evidence-build-plan.md`).
4. `CLAUDE.md` "Live in production" + "Built but inert" lists (the go/no-go doc's other raw input).

Confirm at open: the tier per sub-step; that the founder runs the verifications + deploy + RLS REVOKE; production is byte-equivalent until the founder's deploy.

## Part A — VERIFY the LIVE items in production (founder-walked, ~15 min; no build)

Confirm the reconciliation's LIVE verdicts hold in the actual prod environment (the pieces the repo can't show):
- **#1 R20 safety** — the 5 R20a flags are `true` in Vercel Production: `SUBSTRATE_CALLING_R20A_ENABLED`, `SUBSTRATE_REFLECT_R20A_ENABLED`, `SUBSTRATE_R20A_AUDIENCE_RENDERING_ENABLED`, `SUBSTRATE_R20A_GATE_ENABLED`, `SUBSTRATE_SCORE_CONVERSATION_R20A_ENABLED`. (The core two-stage distress floor is flag-INDEPENDENT and fires before the engine regardless — these flags only govern the newer routes/audience-rendering; confirm them for completeness.)
- **#2 R17 encryption** — `GET /api/health` returns `mentor_encryption: active` (proves `MENTOR_ENCRYPTION_KEY` is set in prod — the only piece not repo-verifiable; `getEncryptionKey()` throws if unset, so any encrypted write already implies it, but confirm the health field).
- **#3 API-key auth** — confirm the `/api/evaluate` unauthenticated free-demo (5/min, 500-char, Haiku) is an acceptable pre-launch cost/abuse surface (it is the ONLY unauth LLM endpoint, by design). Nothing to build.
- **#19 + #14** — confirm the self-service `/api/keys` mint route is deployed and per-key quota enforces, and that the `analytics_events` prod table exists (its `CREATE TABLE` is not in any in-repo migration — near-certainly present since the admin metrics dashboard reads it, but confirm).

Record each result in the go/no-go doc (Part C).

## Part B — the small GATE-BUILDS (`code-elevated`; founder-walked deploy)

Do **#28 FIRST** (highest ROI, ~1h, closes a live honesty defect). **Recommended split:** Session 1 = Part A + #28 + the Part-C doc scaffold; Session 2 = the observability builds (#5/#6/#8/#10) + #9 RLS. Run as one long session only if scope allows.

- **#28 — wire the disabled data-rights buttons + fix privacy copy (HIGHEST PRIORITY).** The compliance backend is fully live (`GET /api/user/export`, `DELETE /api/user/delete {confirm:'DELETE'}`, Art-15 access, audit, rate-limit). The dashboard `Export my data` / `Delete my account` buttons are disabled `(coming soon)` placeholders, and the privacy page directs users to them — a live GDPR/Art-12 honesty contradiction. Wire the two buttons to the existing endpoints (attach the Supabase JWT as `Authorization: Bearer` from the `sb-*-auth-token` localStorage key — `requireAuth` is Bearer-only; memory `human-routes-bearer-jwt-console-smoke`), add a confirm modal on delete, and correct the privacy-page copy to match reality. `npm run build` + a founder-walked deploy + a live click-through.
- **#5 — error-monitoring MVP.** Prod route errors go to `console.error` → ephemeral Vercel logs only; OTel exports to console (backend deferred to PR7). Build an `errors`/`exceptions` Supabase table + a shared server-side insert helper wired into route catch blocks (OR wire `instrumentation.ts`/OTel to a real backend). Additive; RLS service-role-only; a founder-walked migration if a table is added.
- **#6 — real health probes.** `/api/health` currently reports `healthy`/`connected` on config PRESENCE, so a DB outage or an invalid/expired Anthropic key (env still set) would still report healthy (a false green light for the founder's own monitoring). Add a lightweight DB reachability probe (a cheap `SELECT`/RPC via the service-role client) + an Anthropic reachability check (a cheap models/token-count ping), each timeout-bounded so the endpoint stays fast; degrade status on either failure; rename the `connected` labels to reflect what's actually checked.
- **#8 — rate-limit/throttle visibility.** Rate limiting exists (IP in-memory + API-key quota) but throttle events are never persisted, so a prod 429 can't be told from a bug. Persist throttle events (category, ip/key, endpoint, timestamp) at the 429 return points in `website/src/lib/security.ts`.
- **#10 — honest degradation on consumer routes.** The safety perimeter (`/api/reason` substrate + `/api/guardrail`) already degrades honestly by design, but the human score routes, mentor routes, and `/api/reason`'s OUTER catch-all return raw 500s on an Anthropic outage. Add an honest 503 ("AI temporarily unavailable") and/or a transient retry-with-backoff at those catch blocks, distinguishing an Anthropic-outage failure from a generic 500.
- **#9 — RLS audit deliverable + lock the 3 no-RLS tables (`code-critical` sub-step, founder-walked).** RLS is broadly + soundly applied (97 policies; every PII/security-critical table protected). Produce the per-table RLS + active-policy inventory by querying PROD `pg_tables`/`pg_policies` (applied state, not migration files). The audit surfaced **3 data-bearing tables with no RLS and no REVOKE** — `cost_health_snapshots`, `translation_sandwich_comparisons`, `translation_sandwich_cost_tracker` (PII-free internal telemetry, but confirm the default PostgREST anon/authenticated grants). **Query prod first → `REVOKE`/enable-RLS second → re-verify** — never a blind REVOKE; this is an access-control change on production.
- **(optional) #7 — token-count capture.** Cost-level R5 monitoring is already live (loop-grain cost + the revenue:cost Slack detector). Genuinely uneven: `/api/reason` writes 0 token counts (`SandwichRunResult` exposes cost microcents, not token counts) and the 6 human score routes carry no token/cost tracking. Small-medium, optional pre-launch — capture real token counts if in scope.

## Part C — PRODUCE the go/no-go readiness doc (item #16)

Assemble the verified state into ONE cross-functional go/no-go artifact — recommend `operations/agent-org-2026-07/go-live-readiness-checklist.md`. It spans **safety (Support)** / **Tier-1-verified (Tech)** / **positioning-content-discovery (Growth)**, with each line marked verified/built/open + its evidence. Raw inputs: this session's Part-A confirmations + Part-B build outcomes + the CLAUDE.md Live/inert lists + the reconciliation. This doc becomes the standing artifact the single "0h call" rests on — it does NOT make the call.

## NOT in scope (deferred — AO §9)

#17 distributed cache · #20 feedback thumbs (tagged the first Track-B Evidence input) · #23 knowledge base. **#24 (R20b) is already built-and-dark by a recorded S6 decision — no action.** The org/vendor ownership items (#11/#12/#15/#21/#22/#25/#26/#27) route to **P1's gap-map**, not here.

## Deliverables
- #28 wired + privacy copy corrected (deployed, click-through verified).
- The gate-builds attempted per the split (each: `tsc` 0, `npm run build` 0, battery/unit coverage where code changed, founder-walked deploy).
- The #9 RLS inventory + the 3 tables locked/cleared (founder-walked, query-first).
- `operations/agent-org-2026-07/go-live-readiness-checklist.md` (item #16).
- A decision-log entry per tier; the session close; the Part-A prod confirmations recorded in the checklist.

## Verification (per changed surface)
- `#28`: build green + a live authenticated click-through (export downloads; delete behind the confirm modal 200s; privacy copy matches).
- `#6`: `/api/health` degrades correctly when a probe is forced to fail (test with a deliberately-bad check locally).
- `#8`/`#5`: the throttle/error rows land in Supabase (server-side insert verified).
- `#9`: re-query prod `pg_policies` post-REVOKE to confirm the 3 tables are locked and no PostgREST anon path remains.
- `#10`: an induced LLM-unreachable path returns the honest 503, not a 500.

## Rollback
Each gate-build is additive/small and independently `git revert`-able + flag/deploy-reversible. #9's RLS change is the one with a live-access-control effect — record the pre-REVOKE grants so it can be restored; treat it as its own founder-walked verified step.

## Scope discipline
`code-elevated` builds on an already-built substrate; the verifications + deploy + RLS REVOKE are founder-walked. This session prepares the go/no-go artifact and closes the launch-honesty defect (#28); it does NOT make the 0h call, touch the org roll-out (P1/P4/P5), or the trust-layer surfaces. S11 REFUSED; MEASURE throughout; weights BLOCKED; the 0h call remains the founder's.

End of prompt.
