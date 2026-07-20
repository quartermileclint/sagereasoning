# Go-Live Readiness Checklist (go/no-go) — SageReasoning

**Created 2026-07-20** under P-GL (`operations/agent-org-2026-07/agent-org-and-evidence-build-plan.md` §3). Satisfies launch-feedback **item #16** (the consolidated cross-functional go/no-go artifact that did not previously exist).

**What this is:** one artifact assembling the verified launch-readiness state across **Safety (Support)**, **Tier-1-verified (Tech)**, and **Positioning / content / discovery (Growth)**, each line marked with its status + evidence + owner. It is the standing surface the single **0h "go-live" call** should rest on.

**What this is NOT:** it does **not make the 0h call.** The 0h call remains the founder's, made elsewhere. This doc gives that call the evidence base it previously lacked (the launch feedback was found substantially stale about the live build — `2026-07-19-launch-feedback-reconciliation.md`).

**Raw inputs:** the 28-item reconciliation (code-verified, adversarially re-checked — every verdict CONFIRMED); the CLAUDE.md "Live in production" / "Built but inert" lists; this session's Part-A prod confirmations + Part-B build outcomes.

**As-of note (PR18-style):** this is a living checklist, updated at each P-GL sub-session close. Status cells dated in-line; undated cells reflect 2026-07-20 open state.

---

## Status legend

| Mark | Meaning |
|---|---|
| ✅ **VERIFIED-LIVE** | Built + serving in production; confirmed (repo-verified and/or prod-confirmed) |
| 🟡 **PENDING-PROD-CONFIRM** | Believed live (repo-verified); awaiting the founder's one-time prod check (Part A) |
| 🔨 **BUILT-PENDING-DEPLOY** | Built + build-green this session; awaiting the founder-walked deploy + verification |
| ⏳ **OPEN** | Genuine remaining work, scheduled (which P-GL sub-session) |
| 🔀 **ROUTED-P1** | Org/vendor ownership decision — routed to the AO P1 gap-map, not a launch build |
| ⏭ **DEFERRED** | Post-launch (AO plan §9 pool); not launch-gating |

---

## Section A — Safety (Support lens)

The vulnerable-user safety floor. These are the non-negotiables for a product that reasons with people about their decisions.

| # | Item | Status | Evidence / owner |
|---|---|---|---|
| 1 | **R20 distress floor** — two-stage distress pre-screen fires before the Stoic engine on every human route; halts at moderate/acute with a crisis-resource redirect; logs metadata not content | 🟡 PENDING-PROD-CONFIRM | The unconditional floor works flag-off (compile-time `SafetyGate` discipline). Part A confirms the 5 R20a flags are `true` in Vercel Prod (`SUBSTRATE_CALLING_R20A_ENABLED`, `SUBSTRATE_REFLECT_R20A_ENABLED`, `SUBSTRATE_R20A_AUDIENCE_RENDERING_ENABLED`, `SUBSTRATE_R20A_GATE_ENABLED`, `SUBSTRATE_SCORE_CONVERSATION_R20A_ENABLED`). **Founder confirmation:** _pending_ |
| — | **Crisis-resource list correctness** — US/UK/CA lines (988, Shout UK 85258, 988 CA); Crisis Text Line relabelled US-only | ✅ VERIFIED-LIVE | Fixed + live since 2026-07-07 (`D-FOUNDATION-COMPLETION-SESSION1-...`); confirmed on the live distress surface |
| 2 | **R17 encryption at rest** — AES-256-GCM wired to all practitioner intimate data via `MENTOR_ENCRYPTION_KEY`; `getEncryptionKey()` throws when absent (any encrypted write proves the key is set) | 🟡 PENDING-PROD-CONFIRM | Part A: `/api/health` → `mentor_encryption: active`. **Founder confirmation:** _pending_ |
| 28 | **User-facing data export & deletion** — the two dashboard buttons wired to the LIVE `/api/user/export` + `/api/user/delete`; closes the Art-12 honesty defect (privacy page directed users to disabled placeholder buttons) | 🔨 BUILT-PENDING-DEPLOY | Built this session: `website/src/app/dashboard/page.tsx` (Export → JSON blob download; Delete → confirm modal requiring typed `DELETE`, honest 200/207 handling). Privacy copy already directed users to these buttons ⇒ wiring makes it true (no privacy edit needed). `tsc` 0, `npm run build` exit 0 (`/dashboard` registered, compiled successfully). **Deploy + click-through:** _pending founder_ |
| — | **Crisis exit on all surfaces** — `SupportFooter` on every human practice page | ✅ VERIFIED-LIVE | Standing; the Remaining-Principles tools all carry it |

---

## Section B — Tier-1 verified (Tech lens)

Core product/security substrate + operational observability.

| # | Item | Status | Evidence / owner |
|---|---|---|---|
| 3 | **API-key auth on external endpoints** — every agent-facing / LLM-calling external endpoint is auth-protected; `/api/evaluate` is the only unauth LLM endpoint (free demo, 5/min, 500-char, Haiku, by design) | 🟡 PENDING-PROD-CONFIRM | Repo-verified LIVE. Part A: founder sign-off that the `/api/evaluate` free-demo cost/abuse surface is acceptable pre-launch. **Founder sign-off:** _pending_ |
| 4 | **Layer-3 context architecture** — the prompt-layer three-layer context (L1 Stoic Brain / L2 Practitioner / L3 Project Context) wired live across ~20 routes | ✅ VERIFIED-LIVE | Mischaracterized in the feedback ("in progress"); actually wired live. The 503-gated *substrate* Layer-3 is a deliberate out-of-scope deferral, not a blocker |
| 19 | **Agent-developer onboarding infra** — self-service `/api/keys` mint (auth-guarded, 5-key cap, free-tier defaults), developer docs surfaces, atomic per-key monthly/daily quota (429 on `/api/reason`) | 🟡 PENDING-PROD-CONFIRM | Repo-verified end-to-end. Part A: live HTTP probe that `/api/keys` is deployed (non-404). **Founder confirmation:** _pending_ |
| 14 | **Analytics event pipeline** — first-party `sign_up→sign_in→baseline→dashboard→score` events + admin metrics dashboard | 🟡 PENDING-PROD-CONFIRM | Built + serving (feedback premise "analytics absent" is wrong). Part A: confirm `analytics_events` prod table exists (its `CREATE TABLE` isn't in an in-repo migration). Funnel/retention *reporting* is a deferred later slice. **Founder confirmation:** _pending_ |
| 5 | **Error monitoring MVP** — errors Supabase table + shared server-side insert helper in route catch blocks (prod errors currently go to ephemeral Vercel logs only) | 🔨 BUILT-PENDING-DEPLOY + migration | Built: `route_errors` table (`website/supabase-route-errors-migration.sql`, append-only, service-role-only, 90d) + `recordRouteError`/`logRouteError` in `lib/observability-store.ts` (fail-soft, **missing-table-benign** → activates by applying the migration, no flag), wired into 9 consumer-route catch blocks. **Founder: apply the migration.** |
| 6 | **Real health probes** — DB reachability + Anthropic reachability on `/api/health` | 🔨 BUILT-PENDING-DEPLOY | `/api/health` now probes DB (cheap HEAD count) + Anthropic (`models.list()` — catches an invalid/expired key), timeout-bounded (2.5s), 10s-cached, returns **503** when a critical subsystem is unreachable. `mentor_encryption: active` preserved (Part A #2 still works). `tsc` 0, build 0. **Founder: deploy.** |
| 8 | **Rate-limit / throttle visibility** — persist throttle events at the 429 return points | 🔨 BUILT-PENDING-DEPLOY + migration | Built: `throttle_events` table (`website/supabase-throttle-events-migration.sql`, IP stored as SHA-256 hash) + `recordThrottleEvent`/`logThrottleEvent`, wired into all 5 × 429 sites in `security.ts` (IP limiter + monthly/daily × legacy/UPC). Missing-table-benign. `security.test.ts` 20/0. **Founder: apply the migration.** |
| 10 | **Honest degradation on consumer routes** — 503 "temporarily unavailable" on an Anthropic outage instead of a raw 500 | 🔨 BUILT-PENDING-DEPLOY | Built: `lib/llm-outage.ts` (`isLlmOutage` duck-typed classifier — 35/0 battery incl. precision guard that a bare `status:500` doesn't trip + `llmOutageResponse` → retriable 503), wired into 9 consumer-route catches (score×6, evaluate, reflect, reason outer catch), preserving `X-Loop-*` headers where present. `tsc` 0, build 0. **Founder: deploy.** |
| 9 | **RLS audit + lock the 3 no-RLS tables** | 🔨 PREPARED — founder-walked (`code-critical`) | Deliverable authored: `website/supabase-rls-audit-and-lockdown.sql` — the §A per-table RLS/policy inventory + §B pre-check + §C lockdown + §D re-verify. **Code-side clearance (verified this session):** all 3 tables (`cost_health_snapshots`, `translation_sandwich_comparisons`, `translation_sandwich_cost_tracker`) are accessed ONLY via the service-role client (bypasses RLS), so lockdown is safe. **Founder: run §A/§B (query prod first) → §C (REVOKE) → §D (re-verify).** Never a blind REVOKE. |
| 7 | **Token-count capture** (optional) — real token counts on `/api/reason` + the 6 human score routes | ⏭ OPEN (optional) | Cost-level R5 monitoring already LIVE (loop-grain cost + revenue:cost Slack detector). Genuinely uneven: `/api/reason` writes 0 token counts; the 6 score routes carry none. Low priority |
| 13 | **Auth recovery / password reset** — decide magic-link-suffices vs a reset UI, then verify the Supabase recovery/OTP templates | ⏳ OPEN — founder decision + dashboard-config check | Magic-link works as a functional recovery path (no lockout). Self-service password-reset UI unbuilt. **Founder call needed** |

---

## Section C — Positioning / content / discovery (Growth lens)

Public-facing surfaces + the honesty of what they claim.

| Item | Status | Evidence / owner |
|---|---|---|
| **Public reasoning surfaces** (`llms.txt`, `agent-card.json`, api-docs) | ✅ VERIFIED-LIVE | Live; carry the R18 contracts. A light claims-vs-code audit under the go-live lens is a folded P1 rider (findings → P1 gap map, not immediate edits) |
| **Explanatory pages** (`/methodology`, `/limitations`, `/transparency`, `/terms`, `/api-docs`, `/logos`) | ✅ VERIFIED-LIVE | Standing framework/scope content |
| **Human practice tools** (Remaining Principles: `/view-from-above`, `/morning`, `/hupexairesis`, `/premeditatio`, `/oikeiosis`, `/sage-compass`, `/logos`) | ✅ VERIFIED-LIVE | All live; measurement-neutral human surface, outside the agent instrument |
| **Privacy page copy accuracy** | 🔨 BUILT-PENDING-DEPLOY | Becomes accurate once #28 buttons deploy (the copy already directs users to them) |
| **Searchable knowledge base / help centre** (#23) | ⏭ DEFERRED | Post-launch; seed from existing KB Q&A + methodology/limitations |
| **Feedback / quality-signal pipeline** (#20 thumbs) | ⏭ DEFERRED | Post-launch; tagged the FIRST Evidence-Program (Track B) input |
| **Competitive-intel cadence** (#26) | 🔀 ROUTED-P1 | Exists as one topic in the weekly environmental scan (stale, last 2026-07-13); Growth-agent automation call |
| **Content production workflow** (#25) | 🔀 ROUTED-P1 | Draft→review→publish process + named owners undefined |

---

## Section D — Org-owned / vendor decisions (routed to AO P1 gap-map)

Not launch builds — founder ownership/vendor decisions. In the P1 gap analysis (`P1-agent-roster-gap-analysis.md`), not resolved here.

| # | Item | Status |
|---|---|---|
| 11 | Support inbox monitoring (`support@sagereasoning.com` watched at launch) — a vulnerable-user product needs a reachable, watched channel | 🔀 ROUTED-P1 (ownership assignment; go-live confirms it) |
| 12 | Human-escalation owner (founder / contractor / vendor) | 🔀 ROUTED-P1 |
| 15 | Email platform selection & setup | 🔀 ROUTED-P1 |
| 21 | Rollback / incident-response protocol + named owner (the 2026-07-17 credential-exposure incident had no owner) | 🔀 ROUTED-P1 |
| 22 | Database migration-management tooling/strategy | 🔀 ROUTED-P1 |
| 27 | Community-health / support-analytics dashboard + SLAs | 🔀 ROUTED-P1 |
| 18 | Practitioner within-session continuity (a design question; conflicts with stateless signed scoring) | 🔀 ROUTED-P1 |

---

## Section E — Deferred post-launch (AO §9 pool)

| # | Item | Note |
|---|---|---|
| 17 | Distributed cache persistence (Upstash/Supabase) | At-scale optimization; per-instance LRU adequate at 0h/low traffic |
| 20 | Feedback thumbs pipeline | First Track-B Evidence-Program input |
| 23 | Searchable knowledge base | Seed post-launch |
| 24 | R20b dependency detection | Already built + dark by a recorded off-perimeter S6 decision — no action |

---

## Go/no-go posture (summary — for the founder's 0h call)

**The core product / safety / security substrate is built and (repo-)verified.** The launch is much closer than the raw 28-item feedback implied. Remaining launch-gating work is small and clusters in observability last-mile wiring.

**P-GL build status (2026-07-20):** #28 + the observability set (#5/#6/#8/#10) are **built + build-green** this session; #9's lockdown SQL is authored + code-cleared. All prod ops (deploy, the 2 migrations, the RLS REVOKE) remain **founder-walked** — nothing is live until the founder acts.

**Gates the founder should see satisfied before the 0h call:**
1. **Part A prod confirmations** (5 checks) — the LIVE items confirmed in the actual prod environment. _[built handoff ready; awaiting founder]_
2. **#28 deployed + click-through verified** — the one live user-facing honesty defect closed. _[built; awaiting deploy]_
3. **The observability set deployed** (#5 error store, #6 health probes, #8 throttle logging, #10 honest degradation) — #6/#10 activate on deploy; #5/#8 activate on applying their 2 migrations. _[built; awaiting deploy + 2 migrations]_
4. **#9 RLS lockdown** — the 3 no-RLS tables cleared or locked (SQL authored; query-first). _[prepared; awaiting founder-walked run]_
5. **#13 auth-recovery decision** — magic-link-suffices vs a reset UI. _[founder decision — not yet made]_
6. **Org-ownership (Section D)** — support@ monitored + an incident/rollback owner named (P1) — a vulnerable-user product should not launch without a watched support channel and an incident owner.

**Not gating:** #7 token counts (optional), Section E deferrals.

*This checklist is the artifact; the 0h call is the founder's.*
