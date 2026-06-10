# Next-Session Prompt — Pre-Launch S7: Observability completion — A13 automated alert delivery (Critical spine) + A14 live SLO/health tracker (Elevated fill) + Layer 3 launch-scope decision

Paste this whole file into a new session to proceed. This is **Session 7** of the pre-launch completion plan (`/operations/pre-launch-completion-plan-2026-06-07.md`, adopted 2026-06-07). S6 is done: the R20a safety perimeter was found already audience-correct and Live (since 2026-05-31) and was verified live in production for both audiences; the documentation drift that mislabelled two R20a flags as "inert" was corrected. S7 turns on **automated** observability delivery so cost/abuse signals arrive on their own, and stands up a read-only health tracker.

---

## Tier and protocol posture (confirm at open, don't assume)

- **Stream:** founder. **Tier:** `code-critical` for the spine (A13 automated delivery is a deployment-configuration change: a Vercel Cron + a notification path). The A14 tracker fill is `code-elevated`. Highest category governs → treat the session as **Critical**.
- **PR6 NOT engaged (confirm by read):** A13 delivery and the A14 tracker do not touch the R20a distress classifier, the A7 Zone-2 gate, Zone-3 redirection, or their wrappers. State this explicitly at open after a boundary check. (If anything in scope drifts toward the safety perimeter, stop and reclassify.)
- **AC7 — confirm by read; expected NOT engaged** (no auth/cookie/session/domain-redirect change; the evaluator endpoints already exist and use service tokens). State the disposition at open.
- **Governing frame:** `/adopted/standing-protocol-cache.md` §"Critical-risk sessions" + `/adopted/build-sessions-protocol-cache.md` ("no current users" holds → Critical Change Protocol step 3 = N/A). **PR17** — every founder-performed step (Vercel `vercel.json`/cron config, any env var, any dashboard action, the commit) is walked live, click-by-click, not handed off.
- **Model selection:** no LLM call is added by A13 delivery or the A14 tracker (both read existing data / trigger existing endpoints). State "PR4 N/A — no model selected" at open.

## Predecessors (read at open)

- **Predecessor close (read in full):** `/operations/handoffs/founder/2026-06-09-prelaunch-S6-r20a-audience-rendering-close.md` (S6 — most recent; authoritative production-state block).
- **A13 production-activation close (read — the delivery deferral + the sandbox finding):** `/operations/handoffs/founder/2026-06-06-A13-production-activation-close.md`.
- **A14 close + policy:** `/operations/handoffs/founder/2026-06-07-A14-slo-error-budget-close.md` + `/adopted/slo-error-budget-policy.md`.
- **Designs:** `/drafts/A13-cost-health-alerts-design.md`; completion plan S7 section (`/operations/pre-launch-completion-plan-2026-06-07.md` lines ~100-104).

## Why this session matters

A13 cost-health detection and A19 abuse detection are both Live in production, but **detection-only and pull-based** — a signal only surfaces if someone runs the curl. S7 makes delivery **push-based**: a scheduled server-side trigger runs the cost + abuse evaluators and notifies the founder, so problems arrive on their own the moment anything is exposed. A14's reliability *policy* is adopted; S7 optionally stands up the *live tracker* that measures adherence off the A12 OpenTelemetry latency data. Together these close the observability leg of "pre-launch complete" (completion-plan criterion 5).

## ⚠ Reconcile / verify FIRST at open (carry the S6 lesson)

S6's whole value came from checking the actual production state against the decision log before acting — the prose production-state summaries had drifted. Apply the same discipline here **before** building:

1. **Confirm the real A13/A19 disposition by code-read + the decision log, not the prose:** `/api/billing/cost-alerts/evaluate` (A13, `COST_ALERTS_EVAL_TOKEN` / `x-cost-alerts-token`) and `/api/abuse/evaluate` (A19, `ABUSE_DETECTION_EVAL_TOKEN` / `x-abuse-detection-token`) are both service-token GET endpoints, detection-only, **Live in production**. Confirm both are still live (a founder curl of each is the cheapest check) and that **automated delivery is genuinely still absent** before building it.
2. **Confirm A12 OTel is Live** (`SUBSTRATE_OTEL_ENABLED=true`; `substrate_audit_events` receiving rows). Note: the A14 close (2026-06-07) said "A12 observability is off in production" — that predates the S2 OTel activation; **A12 is now Live** (per the S5/S6 production-state blocks). The A14 tracker can therefore read `substrate_audit_events` latency fields — but production traffic is still ~nil (only founder test calls), so values will be sparse/provisional. State this honestly.
3. **Confirm the corrected R20a truth:** all four R20a flags (`SUBSTRATE_CALLING_R20A_ENABLED`, `SUBSTRATE_REFLECT_R20A_ENABLED`, `SUBSTRATE_R20A_AUDIENCE_RENDERING_ENABLED`, `SUBSTRATE_R20A_GATE_ENABLED`) are `true` in production (verified at S6). `SUBSTRATE_LAYER3_ENABLED` and `R20B_INDEPENDENCE_COACHING_ENABLED` remain UNSET (inert).

## Carry-forward discipline (apply here)

1. **The A13 PR5 finding is load-bearing for this session:** the Cowork/scheduled-task + bash sandbox has *allowlisted* network egress that **excludes `sagereasoning.com`**, and `web_fetch` cannot send custom auth headers. So a "scheduled task curls our authenticated endpoint" design **does not work** — that is exactly why A13 delivery was deferred. The mechanism for S7 is a **server-side trigger (Vercel Cron)**, not a Cowork task. Do not re-attempt the Cowork-task path.
2. **PR12/PR13:** verify what's actually live by observation before claiming it (the S6 + S5 lesson). A founder curl of each evaluator at open settles the "is delivery still absent" question empirically.
3. **PR15 / PR11:** before bespoke, confirm the current Vercel Cron mechanism against authoritative current sources (Vercel docs) and consider whether existing infrastructure (Vercel Cron + the existing evaluator endpoints + an existing notification channel) delivers the outcome with the least custom work. Name the primitive considered.

## Decisions to settle at open (founder elects; AI presents with a recommendation)

1. **Confirm S7 spine = A13 automated delivery via Vercel Cron.** *Recommendation: yes* — a `vercel.json` cron entry hitting a small server-side route that runs both evaluators on a schedule (e.g. daily) and, if any signal fires, sends a notification. The Cron path is the one that actually works (per the A13 sandbox finding).
2. **Notification channel** (the genuine design choice). Options to present with trade-offs: (a) email (e.g. Resend/SES/SMTP — a new external dependency + key); (b) a Slack/Discord incoming webhook (one secret URL, no auth dance); (c) write-only to a `cost_alerts`/notification table the founder reads (no external dep, but still pull). *Recommendation: surface (a) vs (b) and let the founder pick; (b) is the lowest-friction first step.* This is the founder's call.
3. **A14 live tracker scope** — build the read-only SLO/health view now (prove on `/api/reason` first per PR1, reading `substrate_audit_events` latency), or defer until there's real traffic. *Recommendation: build the mechanism now, read-only, clearly labelled "provisional — sparse data until traffic"; it's pre-positioning, not load-bearing yet.* Founder elects whether it's S7 fill or deferred.
4. **Layer 3 launch-scope decision** (the completion plan flags this for S7): is the standalone `/api/substrate/layer3` endpoint (`SUBSTRATE_LAYER3_ENABLED`, currently → 503) **in** launch scope, or out (internal-only)? *Recommendation: present the two readings; if in scope it becomes its own Critical activation session (likely S7-split or S8-adjacent), not bundled into the A13 spine.* Founder decides; this may split S7.

## Pre-conditions (AI verifies by read at open; founder confirms)

1. Working tree clean; no `.git/index.lock`. The S6 commit is pushed; Vercel green.
2. S6 done — R20a audience-correct rendering + gate confirmed Live (both branches production-verified); the four R20a flags `true`; docs corrected. Confirm by reading the S6 close + `D-PRELAUNCH-S6-R20A-AUDIENCE-RENDERING-VERIFIED-2026-06-09`.
3. A13 detection Live (`SUBSTRATE_COST_ALERTS_ENABLED=true`; `/api/billing/cost-alerts/evaluate` → 200 with token); A19 all three detectors Live (`/api/abuse/evaluate` → 200 with token); A12 OTel Live. Confirm by read + founder curl.
4. Hosts: production `www.sagereasoning.com` (apex 307-redirects to `www`); production Supabase ref `jdbefwkonfbhjquozgxr`; TEST ref `iwdtrvuphogkwmovhnvz`.
5. The AI does no Vercel/git/Supabase operations — the founder performs the `vercel.json`/cron config, any env var, any dashboard action, and the commit, each walked live (PR17).

## Part A — Open under the protocol

Read in order:
1. `/adopted/standing-protocol-cache.md` (~3 min) — tier, signals, risk classification, model selection, AI-failure-modes table.
2. `/operations/pre-launch-completion-plan-2026-06-07.md` — this session is its S7 (note the corrected R20a row).
3. `/operations/handoffs/founder/2026-06-09-prelaunch-S6-r20a-audience-rendering-close.md` — most-recent production state.
4. `/operations/handoffs/founder/2026-06-06-A13-production-activation-close.md` — the delivery deferral + the sandbox-egress PR5 finding (the reason Cron, not a Cowork task).
5. `/adopted/slo-error-budget-policy.md` §5 + the A14 close — what the tracker must measure.
6. `website/src/app/api/billing/cost-alerts/evaluate/route.ts` + `website/src/app/api/abuse/evaluate/route.ts` — the two endpoints the Cron will trigger (auth shape, response shape).
7. `/manifest.md` — targeted: R5 (cost-as-health), AC2 (latency SLO), AC11/A12 (OTel). Confirm PR6/AC7 dispositions.

Confirm at open (narrate before any action): where we are in the arc (S7 of the completion plan; S6 done); the real A13/A19/A12 disposition (by read + curl); tier = Critical (spine) / Elevated (fill); PR6 disposition (expected not engaged — state after boundary check); AC7 disposition; model selection (PR4 N/A); the Layer 3 scope question is open; status vocabulary; PR17 engaged; PR15 primitive considered (Vercel Cron).

## Part B — Procedure

Order: reconcile/verify the disposition (+ founder curls) → settle Decisions 1–4 → Critical Change Protocol brief for the Cron (visible) → build the cron route + `vercel.json` entry + notification path → TEST/preview verify → founder sets any secret + deploys → verify the Cron fires + a forced-signal notification arrives → (optional) A14 tracker fill → decision log → close.

- **Step 0 — Reconcile + baseline.** AI states the real A13/A19/A12 state; founder curls each evaluator (token) → confirm 200 + delivery still absent.
- **Step 1 — Settle Decisions 1–4** (founder elects notification channel + A14 scope + Layer 3 scope).
- **Step 2 — Critical Change Protocol brief (visible, before any deploy):** what changes (a Cron + a small route + a notification secret); what could break (a noisy/failing Cron — but it's off the `/api/reason` hot path; no user-facing surface); existing sessions (none); rollback (remove the cron entry from `vercel.json` + redeploy, and/or unset the notification secret); verification (Cron run logged + a forced-signal notification received); explicit founder approval.
- **Step 3 — Build (AI):** the cron route (server-side, calls both evaluators internally or via service token), the `vercel.json` `crons` entry, the notification call. Single-endpoint-proof discipline (PR1); no fire-and-forget on anything safety-adjacent (none here).
- **Step 4 — Verify:** on a Vercel preview/TEST first if feasible; then founder sets the notification secret + deploys; trigger the Cron (or wait for its first scheduled run) and confirm a forced-signal test produces a real notification. Founder-repeatable check provided.
- **Step 5 — (Optional fill) A14 tracker:** a small read-only health view reading `substrate_audit_events` latency, proven on `/api/reason` first (PR1), labelled "provisional — sparse until traffic." Elevated; separate from the Critical spine.
- **Step 6 — Decision-log entry** (Critical form) + **Step 7 — session close** (full Critical form: Verification Method Used, Risk Classification Record, PR5, Founder Verification with exact git block, Orchestration Reminder). Provide the exact `git add`/commit block.

## What is NOT in this session

- No R20a / safety-perimeter change (done + verified at S6). No metering work (A10 metering deferred).
- No standalone Layer 3 activation **unless** Decision 4 elects it in scope — and if so, it is its own clearly-labelled Critical step, not bundled into the A13 cron.
- No `component-registry.json` reconcile (S8). No `/api/user/export` shared-helper consolidation (its own Elevated step).

## Rollback path

Remove the `crons` entry from `vercel.json` + redeploy → no scheduled trigger (back to pull-only, the current safe state). Unset the notification secret → no notifications. The cron route is additive and off the `/api/reason` hot path; reverting the commit removes it. No data or schema to undo. The four R20a flags and `/api/reason` behaviour are untouched throughout.

## Forecast

Most likely: the reconciliation confirms A13/A19 detection Live + delivery still absent + A12 OTel Live; the founder picks a notification channel (likely a webhook for lowest friction), approves the Cron, the AI builds the cron route + `vercel.json` entry + notification call, the founder sets the secret + deploys, and a forced-signal test delivers a real notification → A13 automated delivery Live. The A14 read-only tracker may be built as fill (provisional) or deferred. The Layer 3 scope decision is settled (in → its own step, possibly splitting S7; out → noted). After S7: observability is push-based and the only remaining pre-launch work is S8 (end-to-end verification + the honest capability inventory → the pre-lawyer readiness gate).

End of prompt. Opens on `main`. Critical spine (A13 delivery via Vercel Cron — full Critical Change Protocol; PR6 expected NOT engaged, confirm by read; AC7 confirm). Reconcile the A13/A19/A12 disposition FIRST (carry the S6 drift lesson). Do NOT re-attempt the Cowork-scheduled-task delivery path — it cannot reach the endpoint (A13 PR5 finding); use Vercel Cron. Founder runs any Vercel/cron config, any secret, and the commit, each walked live (PR17).
