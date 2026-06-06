# Session Close — 2026-06-03 — A13 R5 Cost-as-Health Alerts — D5 single-rule proof (Wired → VERIFIED-LIVE 2026-06-06)

> **Update 2026-06-06:** the founder ran the live TEST verification and it passed — alert fired on the spike identity (`observed_value 30`, `multiple 10`, persisted to `cost_alerts`); no alert on the flat control identity; token-gated TEST run, production untouched. **A13 D5 → Verified-live.** Recorded in `D-A13-COST-HEALTH-ALERTS-D5-VERIFIED-LIVE-2026-06-06`.

**Stream:** founder.
**Governing frame:** `/adopted/standing-protocol-cache.md` + `/adopted/build-sessions-protocol-cache.md` ("no current users" holds).
**Tier:** `code-elevated` — **Elevated** under 0d-ii (new endpoint + new table; alerting reads the cost surface). PR6 boundary preserved (not engaged). AC7 not engaged.
**Date:** 2026-06-03. **Branch:** `main`.
**Predecessor close:** `/operations/handoffs/founder/2026-06-03-A12-opentelemetry-instrumentation-close.md`.
**Operative prompt:** `/operations/handoffs/founder/2026-06-03-A13-cost-health-alerts-NEXT-SESSION-PROMPT.md`.

## What this session did

Designed A13 (founder approved the design + elected channel = scheduled-check → Cowork, design-only-then-build), then built the **D5 per-identity cost-anomaly** rule as the PR1 single-rule proof. Five additive pieces, all flag-gated behind `SUBSTRATE_COST_ALERTS_ENABLED` (unset) and entirely off the `/api/reason` critical path: a pure detector, its unit tests, a `cost_alerts` state table, an admin GET evaluate endpoint, and three `COST_HEALTH` constants. Sandbox-verified (13/13 unit, tsc clean, PR2 call-path grep). The live TEST run is the founder's between-sessions step (it reaches `localhost`, which Cowork cannot) — walked click-by-click in §"Founder Verification, Part 2" (PR17).

## Decisions Made
- `D-A13-COST-HEALTH-ALERTS-D5-PROOF-2026-06-03` (Elevated) appended. Channel election + PR15 (no email sender / no Anthropic primitive for own-spend) + PR13 (cost vs bill) + rollback + founder-walked verification recorded. **A13 D5 → Wired (inert; sandbox-verified).**

## Status Changes
| Item | Old | New |
|---|---|---|
| A13 D5 (per-identity anomaly) | Scoped | **Verified-live (2026-06-06)** |
| A13 (overall) | Scoped | **Designed** (D5 Wired; D1–D4 designed, queued behind D5 Verified per PR1) |
| `cost_alerts` table | — | migration written (TEST apply = founder step in Part 2) |
| `/api/billing/cost-alerts/evaluate` (GET) | — | Wired, inert behind `SUBSTRATE_COST_ALERTS_ENABLED`; service-token auth (`COST_ALERTS_EVAL_TOKEN`) |
| `COST_HEALTH` (stripe.ts) | 4 constants | +3 (per-identity multiplier / min-prior-loops / floor) |
| `/drafts/A13-cost-health-alerts-design.md` | — | NEW (approved design) |

## Verification Method Used (0c Framework)
- **AI side (complete this session):** D5 detector unit test **13/13 PASS** (sandbox-local tsx — see PR5 note); `tsc --noEmit` project-wide **0 errors**; **PR2** grep confirms the wired path — GET handler invokes `getIdentityCostBaseline` (route.ts:103) + `detectPerIdentityAnomaly` (route.ts:131) + upserts `cost_alerts` (route.ts:149); `/api/reason` has **zero** A13 references.
- **Founder side (between sessions; the live half):** §"Founder Verification, Part 2".

## Risk Classification Record (0d-ii)
- Code + migration: **Elevated** (`code-elevated`). Additive, flag-gated, reversible. PR6 not engaged (no R20a-perimeter touch — by design + grep-confirmed). AC7 not engaged.
- Decision-log entry + this close + the design draft: **Standard** (governance/docs).

## PR5 — Knowledge-Gap Carry-Forward
- No concept required re-explanation. One new one-time observation: the repo's `node_modules/esbuild` is the macOS (`darwin-arm64`) binary, so the Cowork **Linux** sandbox can't run the repo's own `tsx` — the workaround is a sandbox-local `tsx` install pointed at the real files (never `npm install` in the mounted repo, which would swap the binary and break `npm run dev` on the Mac). Cumulative count: 1 (not yet a register entry; likely to recur on any code session that runs tsx tests in-sandbox).

## Next Session Should
Record **A13 D5 → Verified-live** from the founder's Part-2 run. Then complete A13: wire **D4** (per-call spike), fold **D1–D3** into the same scheduled evaluator, add cross-detector dedup (PR1 — only after D5 is Verified-live). Then Stage-1 close work; **A15a** (R17c deletion, Critical) and **A19** (abuse-detection, Elevated) remain available. **Production activation** of the alert flag + creating the Cowork scheduled task against the production endpoint is a separate deploy decision (env-flag activation, Critical under 0d-ii) — not bundled here.

## Blocked On
**Files uncommitted (commit command in Part 1):** the A13 source (migration, detector, test, endpoint, `stripe.ts` edit), the design draft, the decision-log entry, this close — **plus** the still-uncommitted A12 VERIFIED-LIVE governance (the A12 close + the A12 next-session prompt), which rides along in this commit.

**Production state at session close:** **UNCHANGED / byte-identical.** `SUBSTRATE_COST_ALERTS_ENABLED` UNSET everywhere; `cost_alerts` not applied to any DB; `SUBSTRATE_OTEL_ENABLED` UNSET; all four R20a flags `true`; `SUBSTRATE_INJECTION_DEFENCE_ENABLED` / `SUBSTRATE_LAYER3_ENABLED` / `PLUGIN_INSTALL_AUTH_ENABLED` UNSET; `/api/reason` byte-identical. AC7 not engaged.

**Note (not caused by this session):** `git status` reported it could not remove `.git/index.lock` (a mount-permission quirk in the sandbox). You commit on your Mac via GitHub Desktop where this won't apply; if GitHub Desktop ever reports "another git process is running," deleting `.git/index.lock` clears a stale lock.

## Open Questions
- D4 + D1–D3 fold-in + dedup — after D5 Verified-live (PR1).
- Production activation (flag + scheduled task) — separate deploy decision (Critical).
- Windowed per-identity baseline — needs the `loop_billing_events` timestamp column (A12 deferral); D5 is timestamp-free.
- PR13: `getIdentityCostBaseline` aggregates the bill (`total_cents`) under a "cost" label; D5 triggers on the LLM cost (`anthropic_cost_cents`); a follow-on could align the helper's naming.

## Founder Verification

### Part 1 — persist the build (no Vercel behaviour change — the flag is unset, so the deploy is byte-identical)
```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
git add -A
git commit -m "A13 D5 Wired (inert; sandbox-verified): R5 per-identity cost-anomaly detector + cost_alerts table + service-token GET evaluate endpoint (COST_ALERTS_EVAL_TOKEN), flag-gated behind SUBSTRATE_COST_ALERTS_ENABLED; pure detector 13/13 unit + tsc clean + PR2 grep; /api/reason byte-identical. Includes the auth-model correction + standing TEST-process note + the A12 VERIFIED-LIVE governance. (D-A13-COST-HEALTH-ALERTS-D5-PROOF-2026-06-03; D-A13-AUTH-MODEL-SERVICE-TOKEN-CORRECTION-2026-06-03)"
```
Then push via GitHub Desktop. **Independent check after push:** Vercel goes green; `/api/reason` behaves exactly as before (flag unset); calling `https://www.sagereasoning.com/api/billing/cost-alerts/evaluate` returns **503** (`SUBSTRATE_COST_ALERTS_ENABLED` unset in production — correct, inert).

### Part 2 — the live TEST run (takes A13 D5 → Verified-live). TEST Supabase project only.

> **Corrected 2026-06-03** — the founder flagged that an earlier draft of this section mis-stated the TEST process. Authoritative process (per the A10/A11b/A12 closes, now codified in the build cache): run against the **TEST** project (`iwdtrvuphogkwmovhnvz`) via **`website/.env.development.local`**, which Next.js loads *ahead of* `.env.local` in dev so the production config is untouched. Put test-only flags/secrets in `.env.development.local` and remove them at teardown. The evaluate endpoint is gated by a **service token**, so there is **no founder login** — you call it with `curl` and the token header (the same way the scheduled task will).

1. **Apply the A13 migration to TEST.** Supabase dashboard → **TEST** project → **SQL Editor** → **New query** → paste the full contents of `supabase/migrations/20260603_a13_cost_alerts.sql` → **Run**. Expected: "Success. No rows returned."
2. **Confirm the table is there + empty.** New query → `SELECT count(*) FROM cost_alerts;` → expected `0`.
3. **Get a real TEST `api_key_id`** (the seed needs it — `api_key_id` is a required foreign key). Run: `SELECT id FROM api_keys LIMIT 1;` → copy the `id` (a UUID). Call it `<KEYID>`. (There should be one from your A10/A11b/A12 TEST runs.)
4. **Seed the anomalous identity** (5 normal loops at 3 cents + 1 spike at 30 cents). Paste, replacing **both** `<KEYID>` placeholders below with the id from step 3:
   ```sql
   INSERT INTO public.loop_billing_events
     (loop_id, api_key_id, agent_id, surface, base_cents, threshold_cents, anthropic_cost_cents, total_cents, internal_calls, models_used)
   VALUES
     (gen_random_uuid(), '<KEYID>', 'a13-d5-test', 'api_reason', 2, 1, 3, 2, 2, '{}'),
     (gen_random_uuid(), '<KEYID>', 'a13-d5-test', 'api_reason', 2, 1, 3, 2, 2, '{}'),
     (gen_random_uuid(), '<KEYID>', 'a13-d5-test', 'api_reason', 2, 1, 3, 2, 2, '{}'),
     (gen_random_uuid(), '<KEYID>', 'a13-d5-test', 'api_reason', 2, 1, 3, 2, 2, '{}'),
     (gen_random_uuid(), '<KEYID>', 'a13-d5-test', 'api_reason', 2, 1, 3, 2, 2, '{}'),
     (gen_random_uuid(), '<KEYID>', 'a13-d5-test', 'api_reason', 30, 1, 30, 60, 2, '{}');
   ```
   Expected: "Success. 6 rows". (If it errors on a missing NOT-NULL column, paste me the error — I have the schema, so this should insert cleanly.)
5. **Seed the normal identity** (6 loops all at 3 cents — the no-false-positive control):
   ```sql
   INSERT INTO public.loop_billing_events
     (loop_id, api_key_id, agent_id, surface, base_cents, threshold_cents, anthropic_cost_cents, total_cents, internal_calls, models_used)
   VALUES
     (gen_random_uuid(), '<KEYID>', 'a13-d5-normal', 'api_reason', 2, 1, 3, 2, 2, '{}'),
     (gen_random_uuid(), '<KEYID>', 'a13-d5-normal', 'api_reason', 2, 1, 3, 2, 2, '{}'),
     (gen_random_uuid(), '<KEYID>', 'a13-d5-normal', 'api_reason', 2, 1, 3, 2, 2, '{}'),
     (gen_random_uuid(), '<KEYID>', 'a13-d5-normal', 'api_reason', 2, 1, 3, 2, 2, '{}'),
     (gen_random_uuid(), '<KEYID>', 'a13-d5-normal', 'api_reason', 2, 1, 3, 2, 2, '{}'),
     (gen_random_uuid(), '<KEYID>', 'a13-d5-normal', 'api_reason', 2, 1, 3, 2, 2, '{}');
   ```
6. **Add the TEST-only flag + service token to `website/.env.development.local`** (NOT `.env.local` — that's production). Open `website/.env.development.local` in a text editor and add these two lines. For the token, pick any long random string — on your Mac you can generate one in Terminal with `openssl rand -hex 32`:
   ```
   SUBSTRATE_COST_ALERTS_ENABLED=true
   COST_ALERTS_EVAL_TOKEN=paste-a-long-random-string-here
   ```
   Save the file. (You remove both lines at teardown, step 11.)
7. **Start the dev server** (it reads `.env.development.local` → your TEST project; production untouched). No login needed:
   ```
   cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/website"
   npm run dev
   ```
   Expected: server on `http://localhost:3000`.
8. **Trigger the evaluator for the anomalous identity** — in a second Terminal window run (replace `<TOKEN>` with the token you set in step 6):
   ```
   curl -s -H "x-cost-alerts-token: <TOKEN>" \
     "http://localhost:3000/api/billing/cost-alerts/evaluate?agent_id=a13-d5-test"
   ```
   Expected JSON: `"alerts_fired": 1`, `"alerts_persisted": 1`, and an alert with `"detector_type":"per_identity_anomaly"`, `"scope":"a13-d5-test"`, `"observed_value":30`, `"multiple":10`.
   (Gate sanity-checks: the **same curl without** the `-H "x-cost-alerts-token: ..."` returns `401`; with the flag + token removed it returns `503`.)
9. **Confirm the persisted row.** TEST SQL Editor:
   ```sql
   SELECT detector_type, scope, observed_value, threshold_value, multiple, message
   FROM cost_alerts WHERE scope = 'a13-d5-test' ORDER BY created_at DESC LIMIT 1;
   ```
   Expected: one row — `per_identity_anomaly`, `a13-d5-test`, `observed_value 30`, `multiple 10`.
10. **The no-false-positive check** — run the same curl for the normal identity:
    ```
    curl -s -H "x-cost-alerts-token: <TOKEN>" \
      "http://localhost:3000/api/billing/cost-alerts/evaluate?agent_id=a13-d5-normal"
    ```
    Expected JSON: `"alerts_fired": 0`. Confirm no row: `SELECT count(*) FROM cost_alerts WHERE scope = 'a13-d5-normal';` → `0`.
11. **Teardown.** Stop the dev server (Ctrl-C). **Remove the two lines you added to `website/.env.development.local`** in step 6, so the TEST override returns to known-good. Optional TEST data cleanup: `DELETE FROM loop_billing_events WHERE agent_id IN ('a13-d5-test','a13-d5-normal'); DELETE FROM cost_alerts WHERE scope IN ('a13-d5-test','a13-d5-normal');`. Production was never involved.

Paste the step-8 JSON + the step-9 row back next session and I'll record **A13 D5 → Verified-live**.

## Cross-references
- Decision log: `D-A13-COST-HEALTH-ALERTS-D5-PROOF-2026-06-03` (the build); `D-A13-AUTH-MODEL-SERVICE-TOKEN-CORRECTION-2026-06-03` (auth → service token; this close's TEST process corrected after founder catch); `D-BUILD-CACHE-DRIFT-RESOLVED-2026-06-03-TEST-PROCESS-NOTE` (standing TEST-process note)
- Approved design: `/drafts/A13-cost-health-alerts-design.md`
- Predecessor close: `/operations/handoffs/founder/2026-06-03-A12-opentelemetry-instrumentation-close.md`
- A9 (the detection half A13 extends): `/operations/handoffs/founder/2026-05-14-A9-J6-cost-monitoring-close.md`; `D-A9-J6-COST-MONITORING-WIRED-2026-05-14`
- Staging plan: `/adopted/substrate-plugin-staging-plan.md` §A13
- Cost surfaces: `website/src/lib/loop-cost-tracker.ts`; `website/src/lib/substrate/substrate-identity-baseline.ts`; `website/src/lib/stripe.ts` (`COST_HEALTH`, `computeLoopBill`)

*End of session close. Stabilised to known-good — production byte-identical to session open; A13 D5 Wired + inert behind `SUBSTRATE_COST_ALERTS_ENABLED`; sandbox-verified (13/13 unit, tsc clean, PR2 grep); the live TEST run is the founder's between-sessions step to reach Verified-live.*
