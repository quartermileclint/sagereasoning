# Next-Session Prompt — Pre-Launch S7b: Deploy A13 automated delivery (the deferred Critical step) + activate A14 tracker

Paste this whole file into a new session to continue. **S7b is the founder-performed deploy of work that is already built, type-checked, and unit-tested in S7.** No new code is written here unless a problem surfaces — this session is the live walkthrough (PR17) of: create a Slack webhook → set three Vercel env vars → confirm Root Directory → commit/push (deploys + registers the cron) → verify the cron registered → forced-signal notification test → open the A14 page. After S7b, only **S8** remains (end-to-end verification + capability inventory → the pre-lawyer readiness gate).

## What S7 already did (read the close in full)
- **Predecessor close (read in full):** `/operations/handoffs/founder/2026-06-09-prelaunch-S7-observability-completion-close.md` — the authoritative state.
- S7 built the A13 delivery cron + the A14 SLO tracker, verified them (`tsc` clean; 14/14 + 20/20 unit tests; wiring grep), delivered the Critical Change Protocol brief, and **the founder approved the deploy (step 6) then elected to defer it to this session.** Production is **byte-identical**; all S7 files are **uncommitted on disk**.
- **Decision-log entry:** `D-PRELAUNCH-S7-A13-DELIVERY-BUILT-DEPLOY-DEFERRED-2026-06-09`.

## Tier and protocol posture (confirm at open; don't assume)
- Stream: founder. Tier: **`code-critical`** — this is the deployment-configuration activation (a Vercel Cron + env vars + the commit that deploys them). Full Critical Change Protocol.
- **The Critical Change Protocol step-6 approval was already given at S7.** Re-state the six steps at open and re-confirm the founder's "go ahead" before touching Vercel (discipline; urgency does not skip it).
- **PR6 NOT engaged** (confirm by read): the cron triggers the cost + abuse *observability* evaluators; it never touches the R20a distress classifier, the A7 Zone-2 gate, Zone-3 redirection, or any wrapper. The A14 tracker reads structural latency only (R3/R17). State this after a boundary check.
- **AC7 NOT engaged** (confirm by read): no auth/cookie/session/domain-redirect change. The cron uses a Vercel-managed secret (`CRON_SECRET`); the evaluators use existing service tokens; the A14 tracker reuses the existing `ADMIN_USER_ID` gate.
- **PR4 N/A** — no LLM call is added. **PR17** — every founder-performed step (Slack, Vercel, the commit) is walked live, click-by-click, not handed off.
- Model selection: state "PR4 N/A — no model selected."

## Reconcile / verify FIRST at open (carry the S6/S7 discipline)
1. **Confirm the S7 build is present + still uncommitted.** `git status --short` should show the new files (`website/vercel.json`, `website/src/app/api/cron/observability/`, `website/src/lib/cron/`, `website/src/app/api/admin/slo-health/`, `website/src/lib/slo/`) as untracked, plus the docs, plus the stray `website/tsconfig.tsbuildinfo`. If a `.git/index.lock` is present, the founder clears it with `rm -f .git/index.lock`.
2. **Confirm delivery is still absent in production** (no cron yet): a founder curl of each evaluator (with its token) still returns 200 (detection Live), and there is no Vercel cron job listed. Cheapest empirical check; settles "still nothing automated."
3. **Confirm the corrected R20a truth carries:** all four R20a flags (`SUBSTRATE_CALLING_R20A_ENABLED`, `SUBSTRATE_REFLECT_R20A_ENABLED`, `SUBSTRATE_R20A_AUDIENCE_RENDERING_ENABLED`, `SUBSTRATE_R20A_GATE_ENABLED`) are `true`. `SUBSTRATE_LAYER3_ENABLED` stays UNSET (Layer 3 was decided OUT of launch scope at S7).
4. **Re-read, do not re-write, the S7 code** before deploying — a verification check at open, not blind trust in the prior session (0c).

## Carry-forward discipline
- **Do NOT re-attempt the Cowork-scheduled-task delivery path** — it cannot reach `sagereasoning.com` and `web_fetch` can't send auth headers (the A13 PR5 finding). Vercel Cron is the mechanism, already built.
- **Set the env vars BEFORE the commit/push.** A redeploy reads the current env vars; setting them first means the cron has its `CRON_SECRET` and the slo page has its flag on the very first deploy. (If you push first, you'd need a second redeploy.)
- The cron is idempotent-safe (the evaluators upsert-dedupe per detector+scope+UTC day), so Vercel's best-effort delivery (occasional miss/duplicate) is harmless.

## Pre-conditions (AI verifies by read at open; founder confirms)
1. Working tree carries the uncommitted S7 build (per the S7 close "Blocked On" list). `main`; Vercel green; no `.git/index.lock` (clear if present).
2. The founder has the **`CRON_SECRET` value recorded at S7** (a 32-char string). It is deliberately **not** written into any repo file (secret hygiene). The founder sets that exact value in Vercel and uses it in the forced-signal test. (If lost, regenerate with `node -e "console.log(require('crypto').randomBytes(24).toString('base64url'))"` and use the new value consistently.)
3. Hosts: production `www.sagereasoning.com` (apex 307-redirects to `www`); production Supabase ref `jdbefwkonfbhjquozgxr`.
4. The AI does no Vercel/git/Supabase operations — the founder performs the Slack webhook, the env vars, the commit, each walked live (PR17).

## Part A — Open under the protocol
Read in order:
1. `/adopted/standing-protocol-cache.md` (~3 min) — tier, signals, risk classification, model selection, AI-failure-modes table.
2. `/operations/handoffs/founder/2026-06-09-prelaunch-S7-observability-completion-close.md` — the build + the deferral (authoritative).
3. `/operations/pre-launch-completion-plan-2026-06-07.md` — S7 is its observability leg; S8 is next.
4. The S7 as-built files (re-read, don't rewrite): `website/src/app/api/cron/observability/route.ts`, `website/src/lib/cron/observability-notify.ts`, `website/vercel.json`, `website/src/app/api/admin/slo-health/route.ts`, `website/src/lib/slo/slo-stats.ts`.
5. `/manifest.md` — targeted: R5 (cost-as-health), AC2 (latency SLO). Confirm PR6/AC7 dispositions.

Confirm at open (narrate before any action): where we are in the arc (S7b — deploy the S7 build; S8 remains); the real A13/A19/A12 disposition (by read + curl); tier = Critical; PR6 NOT engaged (after boundary check); AC7 NOT engaged; PR4 N/A; status vocabulary; PR17 engaged; the step-6 approval carried from S7 (re-confirm).

## Part B — Procedure (the live deploy walkthrough; PR17)

Re-state the Critical Change Protocol (6 steps) and re-confirm the founder's go-ahead, then walk each step live, confirming after each.

**Step 1 — Create a Slack incoming webhook** (founder; ~3 min)
1. https://api.slack.com/apps → Create New App → From scratch → name `SageReasoning Alerts`, pick workspace → Create App.
2. Left menu → Incoming Webhooks → toggle **Activate Incoming Webhooks** On.
3. Add New Webhook to Workspace → choose the channel (e.g. `#sage-alerts` or a DM) → Allow.
4. Copy the Webhook URL (`https://hooks.slack.com/services/T…/B…/…`). Keep it private; paste into Vercel in Step 3, **not** into chat.
*(Discord alternative: Server Settings → Integrations → Webhooks → New Webhook → Copy URL. The cron route already sends a Discord-compatible `content` field, so no code change is needed.)*
✅ Confirm: a webhook URL exists.

**Step 2 — Confirm Vercel Root Directory** (founder; ~1 min)
Vercel → **sagereasoning** project → Settings → General → **Root Directory**.
✅ Confirm it shows **`website`**. If blank/`.`, STOP — `website/vercel.json` must move to the repo root; the AI adjusts before the commit.

**Step 3 — Set three env vars in Vercel** (founder; ~3 min)
Settings → Environment Variables → add (Environment = **Production**; tick Preview too if testing on a preview):
- `CRON_SECRET` = *(the value recorded at S7)* — mark Sensitive
- `ALERT_WEBHOOK_URL` = *(the Slack webhook URL from Step 1)* — mark Sensitive
- `SUBSTRATE_SLO_TRACKER_ENABLED` = `true`
Leave `COST_ALERTS_EVAL_TOKEN` + `ABUSE_DETECTION_EVAL_TOKEN` untouched (already set).
✅ Confirm: three new variables listed under Production.

**Step 4 — Commit + push (this deploys the route + registers the cron)** (founder)
```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
rm -f .git/index.lock
git checkout -- website/tsconfig.tsbuildinfo
git add website/vercel.json \
        website/src/app/api/cron/observability/route.ts \
        website/src/lib/cron/observability-notify.ts \
        website/src/lib/cron/__tests__/observability-notify.test.ts \
        website/src/app/api/admin/slo-health/route.ts \
        website/src/lib/slo/slo-stats.ts \
        website/src/lib/slo/__tests__/slo-stats.test.ts \
        operations/decision-log.md \
        "operations/handoffs/founder/2026-06-09-prelaunch-S7-observability-completion-close.md" \
        "operations/handoffs/founder/2026-06-09-prelaunch-S7-observability-completion-NEXT-SESSION-PROMPT.md" \
        "operations/handoffs/founder/2026-06-09-prelaunch-S7b-deploy-NEXT-SESSION-PROMPT.md"
git commit -m "Pre-Launch S7b: deploy A13 automated alert delivery (Vercel Cron). vercel.json daily cron /api/cron/observability runs the cost + abuse evaluators and posts fired signals to ALERT_WEBHOOK_URL (Slack); CRON_SECRET-gated; off the /api/reason hot path. A14 read-only SLO/health tracker (/api/admin/slo-health, flag-gated SUBSTRATE_SLO_TRACKER_ENABLED, founder-admin gated) activated. Layer 3 decided OUT of launch scope. PR6/AC7 not engaged; /api/reason byte-identical. (D-PRELAUNCH-S7-A13-DELIVERY-BUILT-DEPLOY-DEFERRED-2026-06-09)"
```
Then push via GitHub Desktop and wait for the Vercel deploy to go green.
✅ Confirm: Vercel deploy succeeded (green).

**Step 5 — Verify** (founder; ~3 min)
a) **Cron registered:** Vercel → project → Settings → **Cron Jobs** → see `/api/cron/observability` at `0 8 * * *`.
b) **Forced-signal test** (Terminal; replace `<CRON_SECRET>` with the recorded value):
```
curl -s -w "\nHTTP:%{http_code}\n" -H "Authorization: Bearer <CRON_SECRET>" "https://www.sagereasoning.com/api/cron/observability?test=1"
```
Expected: `HTTP:200`; JSON `"is_test":true`, `"notified":true`, `"outcomes"` showing both evaluators ran (`cost-alerts` + `abuse`, each `ok:true`). **AND a message lands in Slack** (`:test_tube: SageReasoning observability — DELIVERY TEST …`).
- `notified:false` w/ ALERT_WEBHOOK_URL reason → webhook var missing/typo'd.
- `HTTP 401` → CRON_SECRET mismatch.
- an evaluator `error` → check the eval token (should already be set).
c) **Negative auth check:** the same curl WITHOUT the header → expect `HTTP 401`.
d) **A14 page** (signed in, browser): open `https://www.sagereasoning.com/api/admin/slo-health` → JSON with `"provisional":true` and near-empty windows (honest; no traffic yet).

When (a)–(d) pass → **A13 automated delivery is Live**; A14 tracker Live (provisional).

**Step 6 — Decision-log entry + close.** Append a Critical-form `D-PRELAUNCH-S7b-…` entry recording the activation + the founder-verified results (cron registered; forced-signal Slack message received; A14 page reachable). Write the S7b close (full Critical form). Provide the docs-only follow-up commit block.

## What is NOT in this session
- No R20a / safety-perimeter change. No new feature code (unless a deploy problem requires a fix). No Layer 3 activation (decided OUT). No metering (A10 metering deferred). No `component-registry.json` reconcile (S8).

## Rollback path
Remove the `crons` block from `website/vercel.json` + redeploy → no scheduled trigger (back to pull-only). Or Vercel Settings → Cron Jobs → Disable. Unset `ALERT_WEBHOOK_URL` → no messages. Unset `SUBSTRATE_SLO_TRACKER_ENABLED` → A14 page back to 503. `git revert <sha>` removes the route + config. No data/schema to undo; the four R20a flags and `/api/reason` are untouched throughout.

## Forecast
Most likely: the reconciliation confirms the S7 build present + uncommitted and delivery still absent; the founder creates the Slack webhook, sets the three env vars, confirms Root Directory = `website`, commits/pushes, the cron registers, the forced-signal test posts a real Slack message, and the A14 page opens → **A13 automated delivery Live + A14 tracker Live (provisional)**. Then S8: end-to-end verification on production (one human + one agent use case) + the honest capability inventory → the pre-lawyer readiness gate.

End of prompt. Opens on `main`. Critical (deploy of the S7-built Vercel Cron; full Critical Change Protocol — step-6 approval carried from S7, re-confirm). Reconcile the build-present + delivery-absent state FIRST. Do NOT re-attempt the Cowork-scheduled-task path. Founder runs the Slack webhook, the Vercel env vars, and the commit, each walked live (PR17).
