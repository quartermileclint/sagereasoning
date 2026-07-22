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
| 1 | **R20 distress floor** — two-stage distress pre-screen fires before the Stoic engine on every human route; halts at moderate/acute with a crisis-resource redirect; logs metadata not content | ✅ VERIFIED-LIVE (2026-07-20) | The unconditional floor (human pages) confirmed always-on regardless of any flag. All 5 R20a flags confirmed `true` in Vercel Production (`SUBSTRATE_CALLING_R20A_ENABLED`, `SUBSTRATE_REFLECT_R20A_ENABLED`, `SUBSTRATE_R20A_AUDIENCE_RENDERING_ENABLED`, `SUBSTRATE_R20A_GATE_ENABLED` re-set + redeployed since 3 were masked "sensitive" in the dashboard and unreadable; `SUBSTRATE_SCORE_CONVERSATION_R20A_ENABLED` directly confirmed `true`). Note for future audits: `SUBSTRATE_R20A_AUDIENCE_RENDERING_ENABLED`/`_REFLECT_`/`_CALLING_`/`_GATE_` govern AI-agent/API-only surfaces (`/api/calling`, `/api/practice/reflect`, the `/api/reason` agent branch) — none are exercisable via browser click-through, only `SCORE_CONVERSATION` is human-page-testable. |
| — | **Crisis-resource list correctness** — US/UK/CA lines (988, Shout UK 85258, 988 CA); Crisis Text Line relabelled US-only | ✅ VERIFIED-LIVE | Fixed + live since 2026-07-07 (`D-FOUNDATION-COMPLETION-SESSION1-...`); confirmed on the live distress surface |
| 2 | **R17 encryption at rest** — AES-256-GCM wired to all practitioner intimate data via `MENTOR_ENCRYPTION_KEY`; `getEncryptionKey()` throws when absent (any encrypted write proves the key is set) | ✅ VERIFIED-LIVE (2026-07-20) | Confirmed via `/api/health` → `mentor_encryption: active`. |
| 28 | **User-facing data export & deletion** — the two dashboard buttons wired to the LIVE `/api/user/export` + `/api/user/delete`; closes the Art-12 honesty defect (privacy page directed users to disabled placeholder buttons) | ✅ VERIFIED-LIVE (2026-07-20) | Built: `website/src/app/dashboard/page.tsx` (Export → JSON blob download; Delete → confirm modal requiring typed `DELETE`, honest 200/207 handling). `tsc` 0, `npm run build` exit 0. Founder confirmed on the deployed live site: both buttons present and active (the original defect — disabled placeholders — is closed; the buttons are no longer the old greyed-out state). Full functional click-through (Export downloading; Delete's modal specifically) not separately exercised — deliberately: testing Delete to completion on a real account is destructive/irreversible, so this was not requested. |
| — | **Crisis exit on all surfaces** — `SupportFooter` on every human practice page | ✅ VERIFIED-LIVE | Standing; the Remaining-Principles tools all carry it |

---

## Section B — Tier-1 verified (Tech lens)

Core product/security substrate + operational observability.

| # | Item | Status | Evidence / owner |
|---|---|---|---|
| 3 | **API-key auth on external endpoints** — every agent-facing / LLM-calling external endpoint is auth-protected; `/api/evaluate` is the only unauth LLM endpoint (free demo, 5/min, 500-char, Haiku, by design) | ✅ VERIFIED-LIVE (2026-07-20) | Repo-verified LIVE + prod-confirmed deployed/reachable (`GET` → 405 as expected; `POST {}` → the correct validation response). **Founder sign-off: YES** — comfortable shipping the free-demo cost/abuse surface as-is. |
| 4 | **Layer-3 context architecture** — the prompt-layer three-layer context (L1 Stoic Brain / L2 Practitioner / L3 Project Context) wired live across ~20 routes | ✅ VERIFIED-LIVE | Mischaracterized in the feedback ("in progress"); actually wired live. The 503-gated *substrate* Layer-3 is a deliberate out-of-scope deferral, not a blocker |
| 19 | **Agent-developer onboarding infra** — self-service `/api/keys` mint (auth-guarded, 5-key cap, free-tier defaults), developer docs surfaces, atomic per-key monthly/daily quota (429 on `/api/reason`) | ✅ VERIFIED-LIVE (2026-07-20) | Confirmed via direct HTTP probe: `curl https://www.sagereasoning.com/api/keys` → HTTP 401 "Authentication required" (deployed + reachable, correctly auth-gated, not a 404). |
| 14 | **Analytics event pipeline** — first-party `sign_up→sign_in→baseline→dashboard→score` events + admin metrics dashboard | ✅ VERIFIED-LIVE (2026-07-20) | Built + serving (feedback premise "analytics absent" is wrong). Confirmed: `SELECT count(*) FROM analytics_events` → 600 rows on prod. Funnel/retention *reporting* remains a deferred later slice (not a blocker — the pipeline itself is live and capturing). |
| 5 | **Error monitoring MVP** — errors Supabase table + shared server-side insert helper in route catch blocks (prod errors currently go to ephemeral Vercel logs only) | ✅ VERIFIED-LIVE (2026-07-20) | `route_errors` table applied to prod + verified (11 cols, 5 indexes incl. PK, `relrowsecurity=true`, trigger `trg_route_errors_forbid_mutation` present). `recordRouteError`/`logRouteError` in `lib/observability-store.ts` wired into 9 consumer routes + (same session, extended) all 7 mentor LLM-calling routes' catch blocks (`morning`, `premeditatio`, `hupexairesis`, `view-from-above`, `sage-compass` at both their outer catches AND their inner fail-open gate catches; `passion-classify`, `private/reflect` at their outer catches). Deploy confirmed live via `/api/health` reachability-probe shape. |
| 6 | **Real health probes** — DB reachability + Anthropic reachability on `/api/health` | ✅ VERIFIED-LIVE (2026-07-20) | Confirmed live: `curl https://www.sagereasoning.com/api/health` returns the new shape (`checks.supabase:"reachability"`, `checks.anthropic_api:"reachability"`, `status:"healthy"`), proving the deploy landed. `mentor_encryption: active` confirmed in the same response (Part A #2 discharged). |
| 8 | **Rate-limit / throttle visibility** — persist throttle events at the 429 return points | ✅ VERIFIED-LIVE (2026-07-20) | `throttle_events` table applied to prod + verified (10 cols, the `throttle_events_limiter_check` CHECK, 5 indexes incl. PK, `relrowsecurity=true`, trigger `trg_throttle_events_forbid_mutation` present). Deploy confirmed live (see #6). |
| 10 | **Honest degradation on consumer routes** — 503 "temporarily unavailable" on an Anthropic outage instead of a raw 500 | ✅ VERIFIED-LIVE (2026-07-20) | Deploy confirmed live (see #6). Same session, extended into the mentor surface: `passion-classify` + `private/reflect` (the two mentor routes where an uncaught LLM error genuinely reaches the outer catch) now return the retriable 503 via `isLlmOutage`/`llmOutageResponse`. The other 5 mentor LLM routes (`morning`, `premeditatio`, `hupexairesis`, `view-from-above`, `sage-compass`) were inspected and found to already fail OPEN on a gate outage — a deliberate, previously-reviewed, documented design (the practitioner's entry must never be blocked by a classifier hiccup) — so #10's 503 was correctly NOT wired there; #5's error logging was added at their gate catches instead, so an outage is now observable without changing the fail-open behavior. |
| 9 | **RLS audit + lock the no-RLS tables** | ✅ VERIFIED-LIVE (2026-07-20) | §A2 inventory run on prod (full policy list captured — `route_errors`/`throttle_events` correctly carry NO anon/authenticated policies, confirming the append-only design landed as intended). §B2 found a REAL finding: **`translation_sandwich_comparisons` + `translation_sandwich_cost_tracker` had full anon+authenticated grants** (SELECT/INSERT/UPDATE/DELETE/TRUNCATE) — any caller with the public anon key could read AND write/delete rows directly via PostgREST. **Discovered mid-run: the third originally-named table, `cost_health_snapshots`, does not exist in production** (§C errored 42P01) despite being read/written in code (`billing/usage-summary`, `billing/cost-alerts/evaluate`, `ops-cost-state.ts`) — confirmed all three call sites are missing-table-benign (fail to `null`/an honest error string, never throw/crash), so this is a **non-blocking observability gap** (the founder-hub cost-health dashboard has run without real snapshot data since launch), not a launch blocker — named as a follow-up, not fixed this session (out of P-GL's scope). §C re-run scoped to the 2 real tables + §D re-verified: both `relrowsecurity=true`, **zero** anon/authenticated grants remain. |
| 7 | **Token-count capture** (optional) — real token counts on `/api/reason` + the 6 human score routes | ⏭ OPEN (optional) | Cost-level R5 monitoring already LIVE (loop-grain cost + revenue:cost Slack detector). Genuinely uneven: `/api/reason` writes 0 token counts; the 6 score routes carry none. Low priority |
| — | **Follow-up (named, non-blocking):** `cost_health_snapshots` table missing in production | ⏭ DEFERRED | The founder-hub cost-health surface + `/api/billing/usage-summary` + `/api/billing/cost-alerts/evaluate` have been running without real data since launch (fail-honest, not fail-closed — confirmed no crash risk). Needs its own migration + scoping session; not a safety/security gate. |
| 13 | **Auth recovery / password reset** | ✅ VERIFIED-LIVE (2026-07-20) | **Founder decision: magic-link suffices** (no reset-UI build). Code-confirmed: `/auth` genuinely calls `supabase.auth.signInWithOtp({ email })` with a "Use magic link" UI option (`src/app/auth/page.tsx:119,253`). Founder confirmed the Magic Link email template exists in Supabase (no separate on/off toggle exists for it — that page customizes content only; delivery is gated on the Email provider being enabled, which it demonstrably is since password sign-in already works). |

---

## Section C — Positioning / content / discovery (Growth lens)

Public-facing surfaces + the honesty of what they claim.

| Item | Status | Evidence / owner |
|---|---|---|
| **Public reasoning surfaces** (`llms.txt`, `agent-card.json`, api-docs) | ✅ VERIFIED-LIVE | Live; carry the R18 contracts. A light claims-vs-code audit under the go-live lens is a folded P1 rider (findings → P1 gap map, not immediate edits) |
| **Explanatory pages** (`/methodology`, `/limitations`, `/transparency`, `/terms`, `/api-docs`, `/logos`) | ✅ VERIFIED-LIVE | Standing framework/scope content |
| **Human practice tools** (Remaining Principles: `/view-from-above`, `/morning`, `/hupexairesis`, `/premeditatio`, `/oikeiosis`, `/sage-compass`, `/logos`) | ✅ VERIFIED-LIVE | All live; measurement-neutral human surface, outside the agent instrument |
| **Privacy page copy accuracy** | ✅ VERIFIED-LIVE (2026-07-20) | #28 deployed + confirmed live (buttons present, active) — the copy now accurately reflects working buttons. |
| **Searchable knowledge base / help centre** (#23) | ⏭ DEFERRED | Post-launch; seed from existing KB Q&A + methodology/limitations |
| **Feedback / quality-signal pipeline** (#20 thumbs) | ⏭ DEFERRED | Post-launch; tagged the FIRST Evidence-Program (Track B) input |
| **Competitive-intel cadence** (#26) | 🔀 ROUTED-P1 | Exists as one topic in the weekly environmental scan (stale, last 2026-07-13); Growth-agent automation call |
| **Content production workflow** (#25) | 🔀 ROUTED-P1 | Draft→review→publish process + named owners undefined |

---

## Section D — Org-owned / vendor decisions (closed 2026-07-22, one item genuinely still open)

**Closed this session** (`operations/handoffs/founder/2026-07-22-section-D-support-channel-and-org-decisions-NEXT-SESSION-PROMPT.md`; decision `D-SECTION-D-SUPPORT-CHANNEL-AND-ORG-DECISIONS-CLOSED-2026-07-22`). Six of seven items resolved; **#11 is the one item that stays explicitly, honestly open** — the founder was asked directly whether either mailbox is watched on a regular cadence and answered no. This checklist records that truthfully rather than marking it resolved by fiat.

| # | Item | Status |
|---|---|---|
| 11 | Support inbox monitoring (`support@sagereasoning.com` + `zeus@sagereasoning.com` watched at launch) — a vulnerable-user product needs a reachable, watched channel | ⏳ **OPEN — genuine gap.** Confirmed directly with the founder (2026-07-22): neither mailbox is checked on a regular cadence today. The manual's prior claim that the support system was "already deployed and running" was also false (corrected in `operations/SageReasoning_Support_Agent_Manual.docx` — see §D note below) and the automated run-loop (`processInboxItemWithGuard`, `sage-mentor/support-agent.ts:880`) still has zero live callers, confirmed by a fresh grep this session (last code touch 2026-04-20). Manual triage of `support/inbox/` remains the only channel in practice. **This is the one item standing between Section D and full closure — left open rather than closed on a nominal commitment, per the founder's own explicit choice (asked directly, via AskUserQuestion) — see the "Go/no-go posture" summary below.** |
| 12 | Human-escalation owner (founder / contractor / vendor) | ✅ **RESOLVED (2026-07-22).** The founder, personally — matches current reality (manual triage already happens this way); formalizes the status quo as the deliberate choice rather than a default-by-omission. |
| 15 | Email platform selection & setup | ✅ **DECIDED, provisioning pending (2026-07-22).** Resend is the intended platform (matching the ring system's original design — `sage-mentor/send-notification.ts` already exists and expects `RESEND_API_KEY`). The manual's claim that this was "already configured in your Vercel environment variables" was false — corrected in the manual (no Resend account exists yet; the key belongs in a local `.env` file since `send-notification.ts` is a locally-run CLI script, not a deployed Vercel route). **Actual provisioning (creating the Resend account, verifying a sending domain, generating the API key) is a founder-performed follow-up** — account creation and DNS verification are outside what the AI can do on the founder's behalf. |
| 18 | Practitioner within-session continuity (a design question; conflicts with stateless signed scoring) | ✅ **CLOSED as a non-gap (confirmed 2026-07-22).** Re-confirmed against `2026-07-19-launch-feedback-reconciliation.md` item #18 — a stateful within-session context for the reasoning engine would conflict with the deliberately stateless, per-instance signed scoring the accreditation/trust model depends on. This was already an answered design question, not an unresolved ownership gap; nothing new to decide. |
| 21 | Rollback / incident-response protocol + named owner (the 2026-07-17 credential-exposure incident had no owner) | ✅ **Owner assigned (confirmed 2026-07-22).** `operations/agent-org-2026-07/ops-calling-v1.md` §3 already names Ops as the tracking/reminder owner ("Ops may propose runbook content; the founder approves and, at incident time, executes") — set at Ops's own P4 provisioning session, per P1 §4.1's recommendation. **The runbook's actual content is separate, future Ops-session work; the ownership question this checklist item asks is answered.** |
| 22 | Database migration-management tooling/strategy | ✅ **Owner assigned (confirmed 2026-07-22).** Same source — Ops's calling §3: "Ops may draft a tracked convention... it never applies a migration itself." Content drafting is future Ops work; ownership is answered. |
| 27 | Community-health / support-analytics dashboard + SLAs | ⏳ **Still blocked on #11 (confirmed 2026-07-22).** Presupposes a support/ticketing operation + SLAs that do not exist while #11 stays open. Not independently resolvable — revisit once #11 has a real, running watch routine. |

**Manual correction (2026-07-22):** `operations/SageReasoning_Support_Agent_Manual.docx` opened with "Everything described here is already deployed and running on your website" — false for the automated run-loop. Corrected in place (both the opening claim and the Resend "already configured" claim in §5.2), dated, and pointed at this checklist as the living source of truth. `website/src/app/terms/page.tsx`'s developer-only comment near the `support@` mailto link was similarly corrected from an unresolved "confirm this is monitored" TBD to an honest, dated statement that it is not.

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

**Every launch-gating build and verification item in Sections A and B is now ✅ VERIFIED-LIVE.** The P-GL finish session (2026-07-20) closed all of it end-to-end against production: both migrations applied + verified (#5, #8), the RLS lockdown run with a real over-permissive-grant finding closed (#9), all 5 R20a flags confirmed `true` including a re-set-and-redeploy for 3 that were unreadable in the Vercel dashboard (#1), health/keys/analytics-events probed live (#6, #19, #14), the free-demo sign-off given (#3), auth recovery confirmed both in code and in Supabase config (#13), and the data-rights dashboard buttons confirmed live and no longer disabled placeholders (#28). #5/#10 were additionally extended into all 7 mentor LLM-calling routes (beyond the original 9 consumer routes this session opened with), correctly preserving the reviewed fail-open design on the 5 routes where a hard 503 would have contradicted it.

**Section D is now closed to a single genuine remaining item (2026-07-22).** Six of Section D's seven items are resolved: the human-escalation owner is the founder personally (#12); the email platform is decided as Resend, with actual provisioning (account + domain verification + API key) named as a founder-performed follow-up (#15); the within-session-continuity question was confirmed as an already-answered design question, not a gap (#18); the incident/rollback runbook and the migration-strategy tooling both have Ops named as their tracking/drafting owner per Ops's own signed calling document (#21, #22); the community-support-analytics item stays honestly blocked on #11 (#27). **What remains, and it is the one item genuinely still standing between this checklist and full closure: `support@sagereasoning.com` and `zeus@sagereasoning.com` are not watched on any regular cadence.** This was confirmed directly with the founder rather than assumed — the checklist records that truthfully as an open gap (#11) rather than closing it on a nominal commitment that would not reflect real practice. A vulnerable-user product should not launch without a reachable, watched channel; the 0h call should weigh this honestly, not against a checklist that reads falsely green.

**Named non-blocking follow-up (found during #9, not fixed this session — out of P-GL's scope):** `cost_health_snapshots` does not exist in production despite being read/written in code (`billing/usage-summary`, `billing/cost-alerts/evaluate`, `ops-cost-state.ts`). Confirmed fail-honest, never crashes — the founder-hub cost dashboard has simply run without real data since launch. Needs its own scoped migration session.

**Not gating:** #7 token counts (optional), Section E deferrals.

*This checklist is the artifact; the 0h call is the founder's.*
