# Next-Session Prompt — A13 production activation (turn cost-health alerts ON in production)

Paste this whole file into a new session to proceed. Canonical prompt for the session after **A13 reached Verified-live across all five R5 detectors (D1–D5)** on 2026-06-06 (founder-walked service-token TEST run).

**Stream:** founder. **Tier:** `code-critical` — **Critical** under 0d-ii. This session does three production-affecting things: (1) applies the `cost_alerts` migration to the **production** Supabase project (schema change to production), (2) sets `SUBSTRATE_COST_ALERTS_ENABLED=true` + `COST_ALERTS_EVAL_TOKEN` in **Vercel production** (env-flag activation + deployment config), and (3) creates the Cowork scheduled task that polls the production endpoint and reports alerts. **The full Critical Change Protocol (0c-ii) applies and must be completed visibly in the conversation before the founder deploys.**

**PR6 trip-wire:** A13 does not touch the R20a classifier, Zone 2/3 logic, or their wrappers; if any step is found to, that step stays Critical and the same protocol covers it. **PR17:** every founder-performed step here crosses the Cowork boundary (Supabase dashboard, Vercel dashboard, production curl) — each is walked through live, click-by-click, with exact values + a confirmation check after each, never reduced to a one-line hand-off.

**Engaged process rules:** PR1 (the pattern is proven; this is activation, not new build), PR4 (N/A — no LLM call), PR6 (boundary check), PR10 (Plan→Execute→Verify), PR15 (existing infra — the endpoint + the scheduled-tasks capability — is reused; no bespoke build), PR17 (founder-walked live).

**Governing frame:** `/adopted/standing-protocol-cache.md` + `/adopted/build-sessions-protocol-cache.md` ("no current users" holds — so Critical Change Protocol step 3 "existing sessions" is "N/A — only founder + test logins exist"; all other steps in full force) + `/adopted/substrate-plugin-staging-plan.md` §A13.
**Predecessor close:** `/operations/handoffs/founder/2026-06-06-A13-completion-D4-foldin-close.md` (marked Verified-live).
**Predecessor decision-log entries:** `D-A13-COST-HEALTH-ALERTS-COMPLETION-D4-FOLDIN-2026-06-06` (the build); `D-A13-COST-HEALTH-ALERTS-COMPLETION-VERIFIED-LIVE-2026-06-06` (the live pass); `D-A13-AUTH-MODEL-SERVICE-TOKEN-CORRECTION-2026-06-03` (the service-token auth model — unchanged here).

---

## Founder elects the item at open

A13's detector set is complete + Verified-live but **inert in production**. This prompt's default is activation, but the founder may elect otherwise — say so at open and the AI re-scopes:

- **A13 production activation** — apply the migration to production, set the Vercel flag/token, create the scheduled task. **Critical; ~1 session.** This prompt's default.
- **Keep alerting inert; move on** — the build is proven + ready to flip on any time. Proceed to one of the below instead.
- **Stage-1 close** — the staging-plan close-out work (A10–A19 disposition; the close gating step).
- **A15a — R17c genuine deletion endpoint** (Critical; ~1 session) — replaces the 503 placeholder; depends on A10 (done).
- **A19 — abuse-detection + rate-limiting** (Elevated; ~1 session) — consumes A12 baselines + A13's per-identity detector.

**Recommendation:** A13 production activation — it's low-risk (observability only; never on the `/api/reason` path) and completes R5's intent (the founder actually gets told when a cost line trips). Deferring is equally safe; the alerting flips on whenever you choose.

---

## Where this sits (one paragraph)

A10 (identity) + A11b (injection defence) + A12 (OTel + audit + baseline) + **A13 (all five R5 cost-health detectors: D1 revenue:cost ratio, D2 Ops $100/mo cap, D3 rolling-7-day spike, D4 per-call spike, D5 per-identity anomaly)** are Verified-live. The five detectors deliver through one channel: pure detector → `cost_alerts` upsert (deduped per `detector_type` + `scope` + UTC day) → service-token GET evaluate endpoint. **What's missing is the last mile in production:** the `cost_alerts` table exists on TEST only, the Vercel flag/token are UNSET (so the production endpoint returns 503), and there is no scheduled delivery yet. This session flips all three on.

## Why this session matters

R5 makes cost a health metric only if the founder is actually told when a line trips. The detection + persistence + the evaluate contract are proven (TEST). Activation is the deploy decision that makes the alerting real — a daily scheduled check against production that surfaces any fired alert in Cowork. It is Critical because it changes production env/config + adds a production table; it is also genuinely low-risk because alerting is pure observability, gated by a flag, and never on the request critical path.

## Pre-conditions (founder confirms at open; AI verifies by read)

1. The A13 completion build is **committed + pushed**; Vercel green. Confirm `D-A13-COST-HEALTH-ALERTS-COMPLETION-D4-FOLDIN-2026-06-06` and `D-A13-COST-HEALTH-ALERTS-COMPLETION-VERIFIED-LIVE-2026-06-06` are both in `/operations/decision-log.md`. (If the build wasn't committed, do that first — Part 1 of the predecessor close.)
2. Production currently inert: `SUBSTRATE_COST_ALERTS_ENABLED` + `COST_ALERTS_EVAL_TOKEN` **UNSET** in Vercel; `cost_alerts` **not yet** in the production Supabase project; `/api/reason` byte-identical; all four R20a flags `true`; OTel / injection-defence / Layer3 / plugin-install-auth flags UNSET.
3. No work begun after the Verified-live entry — scan the decision log for any entry after `D-A13-COST-HEALTH-ALERTS-COMPLETION-VERIFIED-LIVE-2026-06-06`.

## Part A — Open under the protocol

Read in order:
1. `/adopted/standing-protocol-cache.md` (~3 min — tier, model selection [N/A here], risk class, signals, status vocabulary, the AI-failure-modes table incl. the PR17 one-line-hand-off redirect).
2. `/adopted/build-sessions-protocol-cache.md` — incl. the "no current users" note (Critical Change Protocol step 3 = N/A) and the standing TEST-run process note (not used this session — this is *production* activation, so it is the founder's production Supabase + Vercel, walked live; never reuse the TEST `.env.development.local`).
3. `/operations/handoffs/founder/2026-06-06-A13-completion-D4-foldin-close.md` (predecessor close — production state; what's queued).
4. `/adopted/substrate-plugin-staging-plan.md` §A13 + `/manifest.md` §R5.
5. The endpoint + migration as-built: `website/src/app/api/billing/cost-alerts/evaluate/route.ts` (flag gate → 503; service-token auth; full-sweep global pass) and `supabase/migrations/20260603_a13_cost_alerts.sql` (the table to apply to production; idempotent `IF NOT EXISTS`; service-role-only RLS).
6. `/operations/decision-log.md` last 3–4 entries.

Confirm at open: tier (`code-critical`); hold-point status (P0 0h active); model selection (N/A — no LLM call); status vocabulary; signals + risk class; KG scan — KG1 (await DB writes — already satisfied in code) + KG7 (JSONB `details`) engage on the production `cost_alerts` writes. Narrate before substantive work: where we are in the arc (A13 Verified-live, inert in production); what this session flips on; what's awaiting the founder (the dashboard/Vercel steps) vs the AI (the Critical Change Protocol + verification design).

## Part B — Procedure (Critical Change Protocol throughout)

### Step 1 — Critical Change Protocol (complete visibly before any deploy)
State, in plain language, the six 0c-ii steps:
1. **What is changing** — production gets a new (empty) `cost_alerts` table; the evaluate endpoint stops returning 503 and starts returning live results; a daily scheduled task begins polling it.
2. **What could break** — the realistic worst case is the evaluate endpoint erroring on the production data shape (mitigated: it ran clean on TEST against the same table types; it degrades to `skipped[]` per-detector rather than 500-ing). The endpoint is **off the `/api/reason` path**, so `/api/reason` cannot be affected.
3. **What happens to existing sessions** — N/A (no current users; only founder + test logins — build cache).
4. **Rollback plan** — set `SUBSTRATE_COST_ALERTS_ENABLED` back to unset/false in Vercel → the endpoint returns 503 (inert) → the scheduled task reports nothing. Exact steps provided. The `cost_alerts` table can stay (harmless, empty) or be dropped via the migration's rollback block.
5. **Verification step** — the production curl + scheduled-task dry-run in Step 4/5.
6. **Explicit founder approval** — specific to the named risks, before the Vercel change.

### Step 2 — Apply the `cost_alerts` migration to PRODUCTION Supabase (founder-walked, PR17)
Walk the founder click-by-click: Supabase dashboard → the **production** project (NOT the TEST `iwdtrvuphogkwmovhnvz`) → SQL Editor → New query → paste the full contents of `supabase/migrations/20260603_a13_cost_alerts.sql` → Run. Confirm "Success. No rows returned." Then confirm the table: `SELECT count(*) FROM cost_alerts;` → `0`. (The migration is idempotent `IF NOT EXISTS` + service-role-only RLS.)

### Step 3 — Mint the production token + set the Vercel env vars (founder-walked, PR17)
- Mint a token: `openssl rand -hex 32` (in Terminal). Keep it — the scheduled task needs the same value.
- Vercel dashboard → the SageReasoning project → Settings → Environment Variables → add **both**, scoped to **Production**: `SUBSTRATE_COST_ALERTS_ENABLED` = `true`; `COST_ALERTS_EVAL_TOKEN` = the minted token. Save.
- Trigger a redeploy so the new env vars take effect (Vercel applies env changes on the next deployment — either redeploy the latest from the Vercel dashboard, or push an empty commit). Confirm Vercel goes green.

### Step 4 — Verify the production endpoint (founder-walked curl)
Use the canonical `www.` host, no `-L` (KG1 rule 3 / verification-framework):
```
curl -s -H "x-cost-alerts-token: <TOKEN>" "https://www.sagereasoning.com/api/billing/cost-alerts/evaluate" ; echo
```
Expected: HTTP 200 JSON with `"ok":true`, `detectors_run` listing all five, and `alerts_fired` likely `0` on clean production data (no spikes yet) — the point is it returns **200, not 503**. Gate sanity: the same curl **without** the token → `401`.

### Step 5 — Create the Cowork scheduled task (delivery)
Create a daily scheduled task that calls the production endpoint with the token and reports any fired alerts to the founder (e.g., "call the cost-alerts evaluate endpoint; if `alerts_fired > 0`, summarise the alerts; else say cost-health is green"). Reuse the existing scheduled-task capability (PR15 — no bespoke build). Confirm one on-demand run reports correctly.

### Step 6 — Verify end-to-end + decision-log (Critical full form) + session close
Decision-log entry per the Critical template (full form — Verification Method Used, Risk Classification Record, Rollback, Founder approval record). Session close states the new production state explicitly: `SUBSTRATE_COST_ALERTS_ENABLED=true` + `COST_ALERTS_EVAL_TOKEN` set in production; `cost_alerts` live in production; scheduled task active; `/api/reason` byte-identical.

## What is NOT in this session
- Any detector **code** change — the five detectors + the endpoint auth model are settled (`D-A13-AUTH-MODEL-SERVICE-TOKEN-CORRECTION-2026-06-03`).
- Slack / PagerDuty channels — the scheduled→Cowork delivery first; richer channels are a later follow-on.
- A15a / A19 / Stage-1 close — queue behind activation unless the founder elects one instead.
- The AC10 manifest cross-reference — a separate governing-doc edit awaiting founder approval; do not bundle.

## Rollback path
All reversible. Unset `SUBSTRATE_COST_ALERTS_ENABLED` in Vercel → the endpoint returns 503 and the scheduled task reports nothing; `/api/reason` is unaffected (alerting is never on the request path). The `cost_alerts` table is a harmless empty table if left; drop it via the migration's rollback block if desired. Pause/delete the scheduled task to stop polling.

## Forecast
Most likely: the migration applies to production cleanly, the Vercel flag/token are set, the production endpoint returns 200, and a daily Cowork scheduled task begins reporting cost-health — taking A13 to fully **activated** in production. Next: Stage-1 close; A15a (R17c deletion, Critical) and A19 (abuse-detection, Elevated) available. The parallel legal/insurance (FPE) track + lawyer engagement remain startable on wall-clock whenever you choose.

End of prompt. Opens on `main`. Critical-tier; the full Critical Change Protocol (0c-ii) is completed visibly before any production change; every founder-performed dashboard/Vercel step is walked live (PR17).
