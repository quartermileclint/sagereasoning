# Pre-Launch Bring-Forward Plan — "everything in place before users arrive"

**Created:** 2026-06-07 (founder request, after the A16/A17 follow-up session).
**Status:** Plan for founder review — **not** an adopted governing document; nothing here is executed yet. No governing document was edited to produce this plan.
**Scope source:** every deferred item recorded in the 19 decision-log entries + 14 session closes dated **2026-06-06 and 2026-06-07** (verified by a full read-through + phrase sweep on 2026-06-07).
**How to use it:** review the sequence, pick the session you want to run next, and ask me to "write the prompt for session N." Each session gets its own paste-ready prompt with click-by-click steps (PR17), because each is Critical and founder-performed.

---

## The one thing to understand first

The items you deferred "because there are no users yet" are mostly **activation** steps: flipping a switch in Vercel, running a migration in Supabase, or deploying an endpoint. By your own rules each of these is a **Critical change** that gets its **own session** with the full Critical Change Protocol, walked through with you live (PR17). So bringing them forward is a **short sequence of small sessions**, not one big one. That is a feature, not a delay — it keeps each switch reversible and verified before the next.

A second thing: a few "no-users" items genuinely **cannot be done yet** because they need real usage or revenue to act on (you can't tune a threshold against zero data). Those stay parked on purpose — see Section 2. And the legal items stay with the lawyer at Stage-1 close — see Section 3.

---

## Section 1 — Bring forward now (no users needed to decide; no lawyer needed)

Listed in **recommended dependency order**. Risk class is my assessment; each session confirms it at open.

| # | Session | What it gives you before users | Deferred item it closes | Risk | Depends on |
|---|---|---|---|---|---|
| 1 | **Data-rights endpoints go-live** | GDPR access + correction actually work in production | A15b deploy, A15c deploy, 2 pending migrations | Elevated→Critical | — (ready now) |
| 2 | **Observability keystone — turn on A12 OpenTelemetry** | The system starts recording its own latency/health data | A12 OTel activation | Critical | — (but unblocks 3, 5) |
| 3 | **A19 abuse-detection go-live + 2 more detectors** | Reverse-engineering / scraping attempts get detected | A19 prod activation, A19 detector rollout | Critical + Elevated | Session 2 (needs OTel data) |
| 4 | **A13 automated alert delivery** | Cost-spike alerts arrive on their own, not on-demand | A13 automated delivery | Critical | — (low urgency) |
| 5 | **A14 live SLO / health tracker** | A live read of whether the system meets its speed/uptime targets | A14 implementation half | Elevated | Session 2 (needs OTel data) |

### Session 1 — Data-rights endpoints go-live  ·  *recommended first*
**Plain English:** Two endpoints are already built and **tested on the TEST environment** — one lets a user get a copy of everything you hold about them (GDPR "right of access", `/api/user/access`), the other lets them correct their own profile facts (GDPR "right to rectification", `/api/user/rectify`). They were never switched on in production because there were no users. Switching them on means: (a) make sure the endpoint code is deployed, and (b) run their two database migrations in the production Supabase project so the audit tables exist.
- **Closes:** the two pending production migrations (`supabase/migrations/20260607_a15b_compliance_access_log.sql`, `20260607_a15c_compliance_rectification_log.sql`) and the deferred production deploy of both endpoints.
- **Why it's first:** already Verified-on-TEST (lowest uncertainty), and a hard pre-launch requirement — real users have these rights from day one. Independent of everything else.
- **I do:** confirm what's already deployed vs not; give you the exact migration SQL and the exact verification calls.
- **You do (live walkthrough):** run the two migrations in the **production** Supabase SQL editor; deploy (push) if the endpoint code isn't live yet; run the verification calls.
- **If a table is missing today:** access logging silently does nothing; a correction returns HTTP 207 instead of 200. So this is purely additive — turning logging on, not changing behaviour.
- **Rollback:** the migrations are additive new tables (drop them to reverse); no existing table is altered.
- **Estimate:** ~1 short session.

### Session 2 — Observability keystone: turn on A12 OpenTelemetry
**Plain English:** "OpenTelemetry" (OTel) is the system writing down its own timing and health for each request into a table (`substrate_audit_events`). Right now the switch (`SUBSTRATE_OTEL_ENABLED`) is **off** in production, so that table stays empty — which is exactly *why* the abuse-detector and the health-tracker "have nothing to read." Turning it on is the keystone that makes Sessions 3 and 5 meaningful.
- **Closes:** the A12-OTel-not-active-in-production deferral (and unblocks live A19 evaluation + the A14 tracker).
- **You do (live walkthrough):** confirm/apply `supabase/migrations/20260603_a12_substrate_audit_events.sql` in production; set `SUBSTRATE_OTEL_ENABLED=true` in Vercel (Production scope); redeploy. We'll also decide whether to instrument more than `/api/reason` (today only that one endpoint is instrumented even on TEST).
- **Risk note:** Critical — it's a deployment-config switch that touches live request paths. Full Critical Change Protocol, with a one-flag rollback (`unset` + redeploy).
- **Estimate:** ~1 session.

### Session 3 — A19 abuse-detection go-live + the two remaining detectors
**Plain English:** A19 watches for someone hammering the system to reverse-engineer it. The first detector (velocity / too-many-requests) is **built and proven on TEST**; it's off in production. This session turns it on (`SUBSTRATE_ABUSE_DETECTION_ENABLED` + `ABUSE_DETECTION_EVAL_TOKEN`, plus the `20260606_a19_abuse_signals.sql` migration), then adds the two remaining detectors (`systematic_enumeration`, `rapid_input_variation`) — whose go-ahead condition (the first detector proven live) is already met.
- **Closes:** A19 production activation + the A19 detector rollout (SEQ-1).
- **Depends on:** Session 2 — A19 reads the OTel table, so it has nothing to evaluate in production until OTel is on.
- **Note:** detection only (you chose not to auto-block/rate-limit yet); enforcement stays a later, separate decision.
- **Could be split:** activation (Critical) and the two new detectors (Elevated, can be built inert first). We'll decide at open.
- **Estimate:** 1–2 sessions.

### Session 4 — A13 automated alert delivery
**Plain English:** Cost-health detection is already live (you activated it 2026-06-06) and you check it on demand with a command. This session builds the part that **delivers** an alert to you automatically on a schedule. The originally-planned approach (a Cowork scheduled task) was found unworkable because the sandbox can't reach `sagereasoning.com`, so this needs a server-side scheduler (a **Vercel Cron** job) plus a notification channel.
- **Closes:** the A13 automated-delivery deferral.
- **Why not urgent:** two of the three cost detectors (revenue-vs-cost, Ops-cap) can't fire until there's Stripe revenue / Sage Ops running anyway — so on-demand checking is fine until closer to launch. Worth doing before users so cost spikes surface on their own.
- **Risk:** Critical (Vercel Cron is deployment-config) + code.
- **Estimate:** ~1 session (needs a little design first).

### Session 5 — A14 live SLO / health tracker
**Plain English:** You adopted the SLO policy (the targets for speed and success-rate) as a document. This builds the live tracker that reads the OTel data and tells you whether you're meeting those targets, and warns if you're burning through your "error budget."
- **Closes:** the A14 implementation half.
- **Depends on:** Session 2 (OTel must be on) and some traffic to measure. The team deliberately held this so as not to "lock in an unproven measurement shape against zero data" — so it's best built once OTel is on and there's at least early traffic.
- **Risk:** Elevated (reads the audit table; may include a small dashboard).
- **Estimate:** ~1 session.

---

## Section 2 — Deferred for "no users," but genuinely can't be done yet

These need real usage or revenue before there's anything to do. **No action recommended now** — listed so you know they're parked on purpose, not forgotten.

- **A13 D1/D2 cost detectors** (revenue-vs-cost ratio; Sage Ops $100/mo cap) — **already built and unit-proven**; they simply can't *fire* until there's Stripe revenue (P4) or Sage Ops running (P7). Nothing to build; they activate themselves once the data exists.
- **A18c dependence-detection thresholds** (`DEPENDENCE_DEFAULTS`) — conservative starting values; can only be tuned against real usage once the R20b flag is on.
- **A18c LLM-classifier upgrade** — only worth doing *if* the current simple detector proves inadequate in real use.

---

## Section 3 — Lawyer-gated (out of scope until Stage-1-close legal engagement)

The remaining legal items stay in `/compliance/lawyer-review-queue.md` for the lawyer. Not bring-forwardable without legal input: **LRQ-1** (GDPR lawful basis for intimate data), **LRQ-2** (erasure-vs-audit-retention), **LRQ-3** (final Article 50 wording), **LRQ-5** (DPIA residual-risk sign-off), **LRQ-7** (sub-processor DPAs + transfer mechanism), plus the CR posture-upgrade table, and the final APP 1.7 / APP 8 privacy-policy wording. (LRQ-6 and LRQ-4 were the founder-approvable pair — already Resolved / Progressed on 2026-06-07.)

---

## Section 4 — Housekeeping (foldable into any session; not user-gated)

Small tidy-ups deferred for approval/scope reasons, not because of users. These could ride along as one quick **Elevated "governance + hygiene tidy"** session, or be folded into whichever session above you run next:

- **~7 queued governance in-place edits** awaiting your approval + a `/archive/` backup: staging-plan §A14/§A15/§A18 status annotations; manifest `CR-GDPR-A20-PORTABILITY` / `CR-GDPR-A15-ACCESS` / `CR-GDPR-A16-RECTIFICATION` posture moves.
- **Stale `CLAUDE.md` "Production state (as of 2026-05-14)" block** — now well out of date (it predates A10–A19); worth refreshing so it doesn't mislead a future session's open. *(Mild priority: this is the AI's session-open reference.)*
- **`/api/reason` + `/api/guardrail` R19d decision** — a one-line founder voice-decision: should the raw substrate API carry the mirror principle, or stay deliberately mirror-free? Trivial to apply either way.
- **Code hygiene:** consolidate `/export` onto the shared `user-data-gathering.ts` helper (removes duplication); delete the dead `V3_SOCIAL_MEDIA_PROMPT` constant.
- **Two practice-name renames** ("Premeditatio Malorum", "Oikeiosis Extension") — your product-voice decision; spans nav/footer/welcome.

---

## Recommended path

1. **Session 1 (data-rights go-live)** — TEST-proven, independent, a hard pre-launch must. Best first.
2. **Session 2 (OTel keystone)** — unlocks the rest of observability.
3. **Session 3 (A19 go-live + detectors)** — needs OTel on.
4. **Sessions 4 + 5 (A13 delivery, A14 tracker)** — the observability pair, any order after OTel.
- Fold **Section 4 housekeeping** into whichever of the above is lightest, or run it as one quick tidy session. I'd lift the **stale `CLAUDE.md` refresh** sooner rather than later since it's the AI's own session-open map.

When you've picked, say **"write the prompt for session N"** and I'll produce the paste-ready prompt with the click-by-click founder steps, exact values, verification, and rollback.

---

*End of plan. This is a review artefact; nothing has been executed or activated. Production state is unchanged from the A16/A17 follow-up close (all four R20a flags `true`; OTel / abuse-detection / R20b / Layer3 / plugin-install-auth UNSET; cost-alerts detection `true`; the two A15b/A15c migrations pending).*
