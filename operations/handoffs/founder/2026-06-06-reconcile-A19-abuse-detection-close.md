# Session Close — 2026-06-06 — Stage-1 reconciliation + A19 abuse-detection single-detector proof

**Stream:** founder.
**Governing frame:** `/adopted/standing-protocol-cache.md` + `/adopted/build-sessions-protocol-cache.md` ("no current users" holds → Critical Change Protocol step 3 = N/A; not engaged this session — nothing Critical).
**Tier:** `governance` (reconcile) + `code-elevated` (A19) — session-level risk **Elevated**. No Critical change; production untouched.
**Date:** 2026-06-06. **Branch:** `main`.
**Operative prompt:** `/operations/handoffs/founder/2026-06-06-post-A13-activation-NEXT-SESSION-PROMPT.md`.
**Predecessor close:** `/operations/handoffs/founder/2026-06-06-A13-production-activation-close.md`.

## What this session did

Two pieces, in the prompt's recommended order (reconcile → A19):

**1. Stage-1 status reconciliation (governance).** Cleared the stale "R17c 503 placeholder" documentation drift you flagged — plus a sibling drift on portability — and produced an honest Stage-1 disposition. The R17c deletion endpoint (`/api/user/delete`) and the R17i portability endpoint (`/api/user/export`) were both **already Verified-live and deployed to production on 2026-05-30**; the manifest and staging plan still described them as not-yet-built. Seven edits applied across `manifest.md` (3 deletion notes + 1 portability note) and the staging plan (A15a marked done in 3 places), all approved by you ("Approve all"). **Posture fields left unchanged on purpose** — full GDPR Art 17 alignment has an open legal question (the erasure-vs-audit-retention tension), so upgrading them would overclaim compliance. Prior versions backed up to `archive/2026-06-06-R17c-reconcile/` before editing.

**2. A19 abuse-detection single-detector proof (code-elevated, detection-only, inert).** Built the per-identity request-velocity anomaly detector — "identity X made N requests in its busiest window, M× its baseline rate" — mirroring the proven A13 cost-alert pattern exactly. A pure detector + a flag-gated service-token evaluator + a service-role-only `abuse_signals` table. **Everything is additive and behind an UNSET flag, so production is byte-identical.** You elected detection-only (no live-route enforcement this session).

## Decisions Made
- `D-R17C-A15A-STALE-DRIFT-RECONCILED-2026-06-06` (Elevated) — the drift reconcile + Stage-1 disposition.
- `D-A19-ABUSE-DETECTION-VELOCITY-PROOF-2026-06-06` (Elevated) — the A19 build.

## Status Changes
| Item | Old | New |
|---|---|---|
| manifest/staging-plan R17c "503 placeholder" notes | stale (drift) | **corrected — reflect Verified-live deletion** |
| manifest CR-GDPR-A20 portability note | stale (SCOPED, "to build") | **corrected — export Verified-live** |
| A19 `request_velocity_anomaly` detector | not built | **Wired (inert; sandbox-verified)** → Verified-live on your TEST pass |
| `abuse_signals` table | absent | **migration written (not yet applied anywhere)** |
| Production (`/api/reason`, all flags) | — | **UNCHANGED / byte-identical** |

## Honest Stage-1 disposition (what's truly left before Stage-1 close)
Stage-1 close needs **all of A10–A19 Verified** (plus lawyer engagement + EU-customer decision + the parallel FPE track).
- **Done:** A10, A11b, A12, A13 (Verified-live), A15a (R17c deletion), A15d (portability, substantially).
- **Still to build/confirm:** A14 (SLOs), A15b (SAR), A15c (rectification), A16 + A17 (privacy/regulatory — lawyer-coupled), A18 (onboarding + limitations), **A19** (this session — Verified-live pending your TEST pass).
- **Plain takeaway:** Stage-1 close is **not imminent** — ~6 items remain, two of them gated on a lawyer. A19 clears one.

## Verification Method Used (0c framework)
- **Unit (sandbox, done):** `abuse-detector.test.ts` → **17/17 PASS** (burst fires; flat-normal silent; below-threshold silent; exact-threshold fires; all four guards; baseline-excludes-busiest-window).
- **Typecheck (sandbox, done):** `npx tsc --noEmit` → exit 0, no errors.
- **PR2 build-to-wire (done):** detector invoked at `route.ts:191`, persist at `:206`, flag gate `:80`, token `:93`, both DB surfaces in the execution path (grep-confirmed).
- **Diagnostic-certainty:** **Diagnostic-certain** on detector logic + wiring. The live data-path against a real Supabase is **pending your TEST pass** (the sandbox can't reach localhost).

## Risk Classification Record (0d-ii)
- Reconcile: **Elevated** (in-place edits to two adopted governing docs; prior versions backed up). PR6 not engaged. AC7 not engaged.
- A19: **Elevated** (new table + new flag-gated route; additive; inert; production byte-identical). **PR6 not engaged** — reads the substrate's already-produced audit rows; never the R20a classifier / Zone 2/3 / any wrapper (boundary checked). KG1 + KG7 engaged.

## Blocked On
**Files uncommitted (commit command in Founder Verification, Part 1 below):** the reconcile edits, the backups, the four A19 source files + the migration + the test, the two decision-log entries, and this close.
**Production state at session close:** **UNCHANGED from pre-session.** A13 cost-health detection remains Live; all four R20a flags `true`; OTel / injection-defence / Layer3 / plugin-install-auth / **abuse-detection** flags all UNSET; `/api/reason` byte-identical. `abuse_signals` not applied to any database.

## Open Questions
- A15d portability + A15b SAR: confirm at the A15 sub-stage whether the Verified `/api/user/export` closes them or a dedicated `/api/user/access` is still required.
- A19 surface rollout (the `systematic_enumeration` + `rapid_input_variation` detectors) and enforcement (rate-limit/revoke) are deferred — separate sessions.
- `CLAUDE.md` "Production state (as of 2026-05-14)" block is still stale (carried from the A13 close) — refresh in a later governance pass.

---

## Founder Verification (Between Sessions)

### Part 0 — clean up a build-cache side effect (10 seconds)
Running the typecheck updated a local build-cache file. It's not part of the work — discard it:
```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
git checkout -- website/tsconfig.tsbuildinfo
```

### Part 1 — verify the reconcile, then commit everything (5 minutes)
First confirm the drift is gone (expect: no matches, then `3`):
```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
grep -nE "R17c.*(503|placeholder|on roadmap)" manifest.md adopted/substrate-plugin-staging-plan.md
grep -c "Verified-live + deployed to production 2026-05-30" manifest.md
```
Then commit + push (this deploys the **new but inert** `/api/abuse/evaluate` route — it returns 503 until a future activation; `/api/reason` is byte-identical):
```
git add manifest.md adopted/substrate-plugin-staging-plan.md \
  archive/2026-06-06-R17c-reconcile/ \
  supabase/migrations/20260606_a19_abuse_signals.sql \
  website/src/app/api/abuse/ website/src/lib/abuse-detection/ \
  operations/decision-log.md \
  operations/handoffs/founder/2026-06-06-reconcile-A19-abuse-detection-close.md \
  operations/handoffs/founder/2026-06-06-post-A13-activation-NEXT-SESSION-PROMPT.md
git commit -m "Stage-1 reconcile (R17c/A15a + A20 drift) + A19 abuse-detection single-detector proof (request_velocity_anomaly; detection-only, flag-gated inert; 17/17 unit + tsc clean). Production byte-identical. (D-R17C-A15A-STALE-DRIFT-RECONCILED-2026-06-06; D-A19-ABUSE-DETECTION-VELOCITY-PROOF-2026-06-06)"
```
Then push via GitHub Desktop. Vercel will redeploy; the only change is the new inert route.

### Part 2 — A19 live TEST pass (takes A19 → Verified-live) — ~15 minutes
This runs against the **TEST** Supabase project via `website/.env.development.local` — **never** `.env.local`, never production. It's the localhost step the sandbox can't reach.

**Step 2.1 — apply the migration to TEST.** Open the **TEST** Supabase project (`iwdtrvuphogkwmovhnvz`) → **SQL Editor** → paste the entire contents of `supabase/migrations/20260606_a19_abuse_signals.sql` → **Run**. Expect: "Success. No rows returned."

**Step 2.2 — set the TEST env.** Open `website/.env.development.local` (create it if absent — it overrides `.env.local` in dev). Add these two lines (pick any long random string for the token):
```
SUBSTRATE_ABUSE_DETECTION_ENABLED=true
ABUSE_DETECTION_EVAL_TOKEN=a19-test-token-pick-any-long-random-string
```

**Step 2.3 — seed test data.** In the TEST SQL Editor, run this (a "burst" identity that should fire, and a "flat" identity that must not):
```sql
-- Burst identity: 5 baseline windows (5 events each, 5 distinct minutes) + 1 burst window (50 events in one minute)
INSERT INTO substrate_audit_events (correlation_id, agent_id, surface, decision_event, occurred_at)
SELECT gen_random_uuid(), 'a19-burst-test', 'api_reason', 'assessment',
       now() - (m || ' minutes')::interval - (e || ' seconds')::interval
FROM generate_series(6,10) AS m, generate_series(1,5) AS e;
INSERT INTO substrate_audit_events (correlation_id, agent_id, surface, decision_event, occurred_at)
SELECT gen_random_uuid(), 'a19-burst-test', 'api_reason', 'assessment',
       now() - interval '5 minutes' - (e || ' seconds')::interval
FROM generate_series(1,50) AS e;
-- Flat identity: 6 windows x 5 events, no burst (false-positive guard)
INSERT INTO substrate_audit_events (correlation_id, agent_id, surface, decision_event, occurred_at)
SELECT gen_random_uuid(), 'a19-flat-test', 'api_reason', 'assessment',
       now() - (m || ' minutes')::interval - (e || ' seconds')::interval
FROM generate_series(5,10) AS m, generate_series(1,5) AS e;
```

**Step 2.4 — run the app + the detector logic test.** In Terminal:
```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/website"
npx tsx src/lib/abuse-detection/__tests__/abuse-detector.test.ts   # expect: 17 passed, 0 failed
npm run dev
```
(The `tsx` line is the same unit test I ran in-sandbox — on your Mac it runs natively. Expect `17 passed, 0 failed`.)

**Step 2.5 — call the evaluator** (new Terminal tab; replace `<TOKEN>` with the token from Step 2.2):
```
curl -s -w "\nHTTP:%{http_code}\n" -H "x-abuse-detection-token: <TOKEN>" "http://localhost:3000/api/abuse/evaluate"
```
**Expect:** `HTTP:200`; `"signals_fired"` ≥ 1; the `signals` array contains an entry with `"scope":"a19-burst-test"` and `"signal_type":"request_velocity_anomaly"`; **`a19-flat-test` does NOT appear** in `signals` (no false positive). Counts may vary by a window or two depending on minute alignment — the burst (~10×) fires regardless.

**Step 2.6 — gate sanity (two quick checks):**
```
curl -s -w "\nHTTP:%{http_code}\n" "http://localhost:3000/api/abuse/evaluate"          # no token  -> expect HTTP:401
```
Then remove the `SUBSTRATE_ABUSE_DETECTION_ENABLED` line from `.env.development.local`, restart `npm run dev`, and repeat the Step 2.5 curl → expect **HTTP:503** (inert when the flag is off). Put the line back if you want to re-test.

**Step 2.7 — confirm persistence** (TEST SQL Editor):
```sql
SELECT signal_type, scope, observed_value, threshold_value, multiple
FROM abuse_signals WHERE scope = 'a19-burst-test';   -- expect: one request_velocity_anomaly row
```

**Step 2.8 — teardown** (TEST SQL Editor + the env file):
```sql
DELETE FROM abuse_signals WHERE scope IN ('a19-burst-test','a19-flat-test');
DELETE FROM substrate_audit_events WHERE agent_id IN ('a19-burst-test','a19-flat-test');
```
Then delete the two lines from `website/.env.development.local` (or the whole file if you created it just for this). Stop `npm run dev` (Ctrl-C).

If Step 2.5 fires for the burst identity and stays silent for the flat identity, **A19 `request_velocity_anomaly` → Verified-live.** Tell me next session and I'll record it.

## Next Session Should
You elect. Natural options:
- **Record A19 Verified-live** (if your TEST pass passed) + pick the next Stage-1 item.
- **A14 SLOs / error-budget discipline** (Standard governance + Elevated implementation) — the next unbuilt Stage-1 item.
- **A15b/A15c** (SAR + rectification endpoints) — Critical; or first confirm whether `/api/user/export` already satisfies A15b/A15d.
- **A13 delivery follow-on** or **A10/A11b/A12 production activations** (each Critical) — still available.
- The **legal/insurance (FPE) track** — startable on wall-clock anytime; gates A16/A17 and Stage-1 close.

## Cross-references
- Decision log: `D-R17C-A15A-STALE-DRIFT-RECONCILED-2026-06-06`; `D-A19-ABUSE-DETECTION-VELOCITY-PROOF-2026-06-06`; `D-R17-ERASURE-PORTABILITY-COMPLETENESS-2026-05-29`; `D-A13-PRODUCTION-ACTIVATION-2026-06-06`.
- As-built (A19): `website/src/lib/abuse-detection/abuse-detector.ts`; `abuse-thresholds.ts`; `__tests__/abuse-detector.test.ts`; `website/src/app/api/abuse/evaluate/route.ts`; `supabase/migrations/20260606_a19_abuse_signals.sql`.
- Reconcile: `manifest.md` §compliance_register; `adopted/substrate-plugin-staging-plan.md` §A15/§A19; backups in `archive/2026-06-06-R17c-reconcile/`.

*End of session close. Stabilised to known-good: production byte-identical; A19 Wired-inert + sandbox-verified (17/17 + tsc clean); the drift cleared with prior versions preserved; only documentation + inert additive code uncommitted.*
