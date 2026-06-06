# Session Close — 2026-06-06 — A13 completion: D4 (per-call spike) + D1–D3 fold-in (Wired → VERIFIED-LIVE same session)

> **Update 2026-06-06:** the founder ran the live TEST verification in-session and it passed — full-sweep evaluate returned `alerts_fired 1` / `alerts_persisted 1`, the one alert `per_call_spike` (scope `global`, `observed_value 300`, `multiple 247.06`); `detectors_run` listed all five; no `per_identity_anomaly` (D4 isolated from D5); D1/D2/D3 correctly silent; `skipped: []`; persisted `cost_alerts` row confirmed by SELECT; teardown done. **A13 → Verified-live across all five detectors (D1–D5).** Recorded in `D-A13-COST-HEALTH-ALERTS-COMPLETION-VERIFIED-LIVE-2026-06-06`. Remaining founder step: commit the build (Part 1 below) — the live run validated the working tree but did not commit it. Next session: A13 production activation (Critical) — `/operations/handoffs/founder/2026-06-06-A13-production-activation-NEXT-SESSION-PROMPT.md`.

**Stream:** founder.
**Governing frame:** `/adopted/standing-protocol-cache.md` + `/adopted/build-sessions-protocol-cache.md` ("no current users" holds; standing TEST-run process note applies).
**Tier:** `code-elevated` — **Elevated** under 0d-ii (new detectors + extends the evaluate endpoint + refactors the existing A9 `usage-summary`). PR6 boundary preserved (not engaged — grep-confirmed no R20a touch). AC7 not engaged.
**Date:** 2026-06-06. **Branch:** `main`.
**Predecessor close:** `/operations/handoffs/founder/2026-06-03-A13-cost-health-alerts-D5-proof-close.md` (D5 → Verified-live 2026-06-06).
**Operative prompt:** `/operations/handoffs/founder/2026-06-06-A13-completion-NEXT-SESSION-PROMPT.md`.

## What this session did

Completed the A13 detector set so **all five R5 cost-health detectors deliver through one channel** (`cost_alerts` + the service-token evaluate endpoint). At open you elected **A13 completion (default)**; for the D1–D3 fold-in you elected **Option A (shared module) + "Build it now."**

- **D4 (per-call / global spike)** — added `detectPerCallSpike`, the global analogue of the Verified-live D5 (a single loop ≥ 2× the *global* other-loop mean, catching a spike even from a brand-new identity D5 can't yet baseline). Wired into the evaluator's global pass.
- **D1–D3 fold-in** — extracted A9's three inline threshold checks (revenue:cost ratio, Sage Ops $100/mo cap, rolling-7-day spike) into shared pure detectors. The admin `usage-summary` endpoint now calls them (keeping its pull behaviour + output); the evaluator gathers their inputs fresh and persists to `cost_alerts`.
- **Cross-detector dedup** — all five `detector_type`s coexist in `cost_alerts` under `(detector_type, scope, period_date)`: D5 scoped per-identity, D1–D4 scoped `global`.

Everything is additive, flag-gated behind `SUBSTRATE_COST_ALERTS_ENABLED` (unset), and entirely off the `/api/reason` critical path. Sandbox-verified (42/42 unit, `tsc` 0 errors, PR2 call-path grep). No schema change — the `cost_alerts` table already whitelists all five detectors. The live TEST run is your between-sessions step (it reaches `localhost`, which Cowork can't) — walked step-by-step in §"Founder Verification, Part 2" (PR17).

## Decisions Made
- `D-A13-COST-HEALTH-ALERTS-COMPLETION-D4-FOLDIN-2026-06-06` (Elevated) appended. Option-A election, PR15/PR13 reasoning, rollback, and the founder-walked verification recorded. **A13 D4 + D1–D3 → Wired (inert; sandbox-verified).**

## Status Changes
| Item | Old | New |
|---|---|---|
| A13 D4 (per-call spike) | Scoped | **Wired** (inert; sandbox-verified; live-TEST pending) |
| A13 D1–D3 (fold-in to `cost_alerts`) | Live inline in A9 (pull-only) | **Wired** through `cost_alerts` (inert; sandbox-verified) |
| A13 (overall) | Designed (D5 Verified-live) | **Wired** — all 5 detectors; → Verified-live on your Part-2 pass |
| `/api/billing/cost-alerts/evaluate` | D5 only | D5 + D4 + D1–D3; `detector` → `detectors_run[]` |
| `/api/billing/usage-summary` | inline D1–D3 | calls shared detectors (output preserved) |
| `COST_HEALTH` (stripe.ts) | 7 constants | +4 (D4 ×3, D3 min-days ×1) |

## Verification Method Used (0c Framework)
- **AI side (this session):** unit tests **42/42 PASS** (13 D5 unchanged + 13 D4 + 16 D1–D3 — run in an isolated sandbox copy per the esbuild note below); `tsc --noEmit` project-wide **0 errors** (validates the `usage-summary` refactor + evaluator + detector module); **PR2** grep confirms all five detectors are *invoked* in the evaluator (D5 loop + D4/D1/D2/D3 global pass) and D1–D3 in `usage-summary`; `/api/reason` has **zero** cost-alert references. PR10 Verify: **Diagnostic-certain** at the sandbox layer.
- **Founder side (between sessions; the live half):** §"Founder Verification, Part 2" — takes D4 (+ optionally D2) → Verified-live.

## Risk Classification Record (0d-ii)
- Code: **Elevated** (`code-elevated`). Additive, flag-gated, reversible. Touches existing admin functionality (`usage-summary`) — its rollback is `git revert`. PR6 not engaged (grep-confirmed). AC7 not engaged. No schema change.
- Decision-log entry + this close: **Standard** (governance/docs).

## PR5 — Knowledge-Gap Carry-Forward
- No concept required re-explanation. The sandbox-`tsx` workaround recurred (the repo's `esbuild` is the macOS binary, so the Cowork **Linux** sandbox runs the pure detector tests from a *copy* under `/tmp` with a sandbox-local `tsx` — never `npm install` in the mounted repo). Cumulative count: 2 (carried from the D5 close's count 1; still a candidate, not yet a register entry).

## Next Session Should
Record **A13 → Verified-live** from your Part-2 run. A13 is then complete across all five detectors. Next options: **A13 production activation** (set `SUBSTRATE_COST_ALERTS_ENABLED` + `COST_ALERTS_EVAL_TOKEN` in Vercel + create the Cowork scheduled task against the production endpoint — **Critical**, full Critical Change Protocol); then **Stage-1 close** work; **A15a** (R17c deletion, Critical) and **A19** (abuse-detection, Elevated) remain available. The parallel legal/insurance (FPE) track is startable on wall-clock whenever you choose.

## Blocked On
**Files uncommitted (commit command in Part 1):** the five source files (detector module, `stripe.ts`, evaluator, `usage-summary`, test), the decision-log entry, and this close.

**Production state at session close:** **UNCHANGED / byte-identical.** `SUBSTRATE_COST_ALERTS_ENABLED` + `COST_ALERTS_EVAL_TOKEN` UNSET in production; `SUBSTRATE_OTEL_ENABLED` UNSET; all four R20a flags `true`; injection-defence / Layer3 / plugin-install-auth flags UNSET; `/api/reason` byte-identical. AC7 not engaged.

**Note (not caused by this session's code):** the sandbox left a stale zero-byte `.git/index.lock` it lacks permission to delete (the known FUSE quirk from the D5 close). It does not affect your Mac, but if GitHub Desktop ever says "another git process is running," run `rm -f .git/index.lock` in the repo to clear it (command included in Part 1).

## Open Questions
- Shared spike-core helper (D4/D5 share arithmetic) — deferred cleanup (PR7); kept separate to leave the Verified-live D5 path byte-identical.
- D1/D2 can't fire until paid revenue (P4 Stripe) / Sage Ops running (P7) exist — wired + unit-proven, awaiting real data to fire live.
- A9 `usage-summary` still gathers D1–D3 inputs inline (Option A shares the detection logic, not the gathering); a later session could share the gathering too.

## Founder Verification

### Part 1 — persist the build (no Vercel behaviour change — the flag is unset, so the deploy is byte-identical)
```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
rm -f .git/index.lock          # clears the stale sandbox lock if present (harmless if absent)
git add -A
git commit -m "A13 completion (Wired; inert; sandbox-verified): D4 per-call/global spike + fold D1-D3 (revenue:cost, ops cap, rolling 7-day) into shared pure detectors; evaluator runs all five through cost_alerts (global pass), usage-summary calls the shared detectors (output preserved); 42/42 unit + tsc clean + PR2 grep; /api/reason byte-identical; no schema change. (D-A13-COST-HEALTH-ALERTS-COMPLETION-D4-FOLDIN-2026-06-06)"
```
Then push via GitHub Desktop. **Independent check after push:** Vercel goes green; `/api/reason` behaves exactly as before; `https://www.sagereasoning.com/api/billing/cost-alerts/evaluate` still returns **503** (`SUBSTRATE_COST_ALERTS_ENABLED` unset in production — correct, inert).

### Part 1b — repo-only checks (no localhost needed; run anytime)
```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/website"
npx tsx src/lib/cost-alerts/__tests__/cost-alert-detector.test.ts
npx tsc --noEmit
```
Expected: `42 passed / 0 failed`; then no output from `tsc` (0 errors). Run them one at a time (per the CLAUDE.md note).

### Part 2 — the live TEST run (takes D4 → Verified-live; proves the fold-in channel end-to-end). TEST Supabase project only.

> Same process as your D5 run: **TEST** project (`iwdtrvuphogkwmovhnvz`) via **`website/.env.development.local`**, service token, **no founder login**. Production untouched.

1. **Check the table state.** TEST SQL Editor → New query:
   ```sql
   SELECT count(*) AS loops, coalesce(max(anthropic_cost_cents),0) AS max_cost FROM loop_billing_events;
   SELECT count(*) FROM cost_alerts;
   ```
   Note `max_cost`. The seed below uses a 300-cent spike; if `max_cost` is ≥ 150, paste it to me and I'll raise the seed so ours dominates. (`cost_alerts` already exists from the D5 session — no migration needed.)
2. **Get a real `api_key_id`** (required FK): `SELECT id FROM api_keys LIMIT 1;` → copy the UUID; call it `<KEYID>`.
3. **Seed a multi-identity global spike** — six *distinct* identities, one loop each, so no identity has the ≥5 prior loops D5 needs (this isolates **D4** from D5). Replace every `<KEYID>`:
   ```sql
   INSERT INTO public.loop_billing_events
     (loop_id, api_key_id, agent_id, surface, base_cents, threshold_cents, anthropic_cost_cents, total_cents, internal_calls, models_used)
   VALUES
     (gen_random_uuid(), '<KEYID>', 'd4-a', 'api_reason', 2, 1, 3,   2, 2, '{}'),
     (gen_random_uuid(), '<KEYID>', 'd4-b', 'api_reason', 2, 1, 3,   2, 2, '{}'),
     (gen_random_uuid(), '<KEYID>', 'd4-c', 'api_reason', 2, 1, 3,   2, 2, '{}'),
     (gen_random_uuid(), '<KEYID>', 'd4-d', 'api_reason', 2, 1, 3,   2, 2, '{}'),
     (gen_random_uuid(), '<KEYID>', 'd4-e', 'api_reason', 2, 1, 3,   2, 2, '{}'),
     (gen_random_uuid(), '<KEYID>', 'd4-spike', 'api_reason', 2, 1, 300, 2, 2, '{}');
   ```
   Expected: "Success. 6 rows."
4. **Confirm the TEST flag + token are in `website/.env.development.local`** (re-add if you removed them at D5 teardown — NOT `.env.local`):
   ```
   SUBSTRATE_COST_ALERTS_ENABLED=true
   COST_ALERTS_EVAL_TOKEN=paste-a-long-random-string-here
   ```
5. **Start the dev server** (reads `.env.development.local` → TEST; production untouched):
   ```
   cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/website"
   npm run dev
   ```
6. **Trigger the FULL sweep** (no `agent_id` — global detectors run on the full sweep). Second Terminal, replace `<TOKEN>`:
   ```
   curl -s -H "x-cost-alerts-token: <TOKEN>" \
     "http://localhost:3000/api/billing/cost-alerts/evaluate"
   ```
   Expected JSON: `"detectors_run"` lists `per_identity_anomaly`, `per_call_spike`, `revenue_cost_ratio`, `ops_monthly_cap`, `rolling_7day_spike`; `alerts[]` contains a **`per_call_spike`** alert with `"scope":"global"`, `"observed_value":300`, and a large `multiple`; `alerts_persisted` ≥ 1; **no** `per_identity_anomaly` for any `d4-*` (each has one loop).
7. **Confirm the persisted row:**
   ```sql
   SELECT detector_type, scope, observed_value, multiple
   FROM cost_alerts WHERE detector_type = 'per_call_spike' ORDER BY created_at DESC LIMIT 1;
   ```
   Expected: one row — `per_call_spike`, `global`, `observed_value 300`.
8. **Gate sanity:** the same curl **without** `-H "x-cost-alerts-token: ..."` → `401`; with the flag/token removed → `503`.
9. **Teardown.** Ctrl-C the server. Remove the two lines from `.env.development.local`. TEST cleanup:
   ```sql
   DELETE FROM loop_billing_events WHERE agent_id LIKE 'd4-%';
   DELETE FROM cost_alerts WHERE detector_type = 'per_call_spike' AND scope = 'global';
   ```
   Production was never involved.

### Part 2C — optional deeper check: D2 (Sage Ops cap), only if a current-month snapshot row exists
```sql
-- Only if SELECT returns a row for this month:
SELECT period_start, sage_ops_cost_cents FROM cost_health_snapshots
WHERE period_start = date_trunc('month', now() AT TIME ZONE 'UTC')::date;
-- If it does, trip the cap, run the full-sweep curl again, expect an ops_monthly_cap alert (observed_value 15000), then restore:
UPDATE cost_health_snapshots SET sage_ops_cost_cents = 15000 WHERE period_start = date_trunc('month', now() AT TIME ZONE 'UTC')::date;
-- ... curl ... then restore:
UPDATE cost_health_snapshots SET sage_ops_cost_cents = 0     WHERE period_start = date_trunc('month', now() AT TIME ZONE 'UTC')::date;
```
If no row exists, skip — D2 is unit-proven and shares D4's now-proven persist path; it'll fire once the month has a snapshot.

Paste the step-6 JSON + the step-7 row back next session and I'll record **A13 → Verified-live**.

## Cross-references
- Decision log: `D-A13-COST-HEALTH-ALERTS-COMPLETION-D4-FOLDIN-2026-06-06` (this build); `D-A13-COST-HEALTH-ALERTS-D5-VERIFIED-LIVE-2026-06-06` (D5 live); `D-A13-COST-HEALTH-ALERTS-D5-PROOF-2026-06-03` (D5 build); `D-A13-AUTH-MODEL-SERVICE-TOKEN-CORRECTION-2026-06-03` (service-token auth)
- Predecessor close: `/operations/handoffs/founder/2026-06-03-A13-cost-health-alerts-D5-proof-close.md`
- Operative prompt: `/operations/handoffs/founder/2026-06-06-A13-completion-NEXT-SESSION-PROMPT.md`
- Staging plan: `/adopted/substrate-plugin-staging-plan.md` §A13
- Code: `website/src/lib/cost-alerts/cost-alert-detector.ts`; `website/src/app/api/billing/cost-alerts/evaluate/route.ts`; `website/src/app/api/billing/usage-summary/route.ts`; `website/src/lib/stripe.ts` (`COST_HEALTH`)

*End of session close. Stabilised to known-good — production byte-identical to session open; A13 D4 + D1–D3 Wired + inert behind `SUBSTRATE_COST_ALERTS_ENABLED`; sandbox-verified (42/42 unit, tsc clean, PR2 grep); the live TEST run is your between-sessions step to reach Verified-live across all five detectors.*
