# Next-Session Prompt — Pre-Launch Bring-Forward S2: Turn on A12 OpenTelemetry (the observability keystone)

Paste this whole file into a new session to proceed.

This is **Session 2** of the pre-launch bring-forward plan (`/operations/pre-launch-bring-forward-plan-2026-06-07.md`). It switches on the A12 telemetry that is **already built, Verified-live on TEST, and deployed inert** in production. Turning it on makes the substrate start recording its own per-request timing + health into the `substrate_audit_events` table — the data that Session 3 (A19 abuse-detection) and Session 5 (A14 SLO/health tracker) need to be meaningful. Today that table is empty in production *by design*: the master switch `SUBSTRATE_OTEL_ENABLED` is unset.

**Stream:** founder. **Tier:** `code-critical` (deployment-config env-flag activation on the live `/api/reason` request path) + a production `schema` migration → the session as a whole is **Critical**. Full Critical Change Protocol (0c-ii), walked live (PR17).

**Governing frame:** `/adopted/standing-protocol-cache.md` §"Critical-risk sessions" (full templates; Critical Change Protocol governs) + `/adopted/build-sessions-protocol-cache.md`.

**Predecessor closes:** `/operations/handoffs/founder/2026-06-03-A12-opentelemetry-instrumentation-close.md` (A12 built + Verified-live on TEST), `/operations/handoffs/founder/2026-06-07-prelaunch-S1-data-rights-go-live-close.md` (S1; most recent).

**Predecessor decision-log entries:** `D-A12-OTEL-INSTRUMENTATION-AUDIT-PROOF-2026-06-03`, `D-A12-OTEL-INSTRUMENTATION-VERIFIED-LIVE-2026-06-03`, `D-PRELAUNCH-S1-DATA-RIGHTS-GO-LIVE-2026-06-07`.

**Risk classification:** **Critical** under 0d-ii — *deployment-configuration change (env flag activating a new surface on a live request path)*. The migration half is additive/idempotent (Elevated on its own), but the session's highest category governs → Critical. **PR6 not engaged** (A12 instruments Layer 1/2/3 only; it does **not** touch the R20a distress classifier, the A7 Zone-2 gate, or their wrappers — grep-confirmed in the A12 close). **AC7 not engaged.** No auth / session / encryption / access-control change.

---

## Why this session matters

A12 ("OpenTelemetry" / OTel) is the system writing down its own timing and health for each `/api/reason` run — into spans (which print to the deployment logs) and into a durable, append-only, **masked** audit table (`substrate_audit_events`) that stores structural fields only (counts, codes, latencies, model names), never raw user text. It was proven end-to-end on TEST on 2026-06-03 (trace + matching audit row + masking confirmed). In production it sits inert behind one unset flag. Turning it on is the **keystone**: the abuse-detector (Session 3) and the SLO/health tracker (Session 5) both *read* this audit table, so until OTel is on they have nothing to evaluate. This is a hard pre-launch enabler and is low-uncertainty (TEST-proven), but because the switch sits on a live request path it is a Critical change and gets its own protocolised session.

---

## Pre-conditions (AI verifies by read at open; founder confirms)

1. Working tree clean enough to add a docs commit at the end; no `.git/index.lock` (if present: `rm -f .git/index.lock` first — founder runs git; AI does read-only git inspection only).
2. `main` up to date with `origin/main`; Vercel green (founder confirmed at the S1 close: "Vercel green").
3. **A12 code is committed + deployed, inert behind the unset flag.** AI confirms by read at open: `git ls-files` shows `website/src/instrumentation.ts`, `website/src/lib/substrate/substrate-telemetry.ts`, `website/src/lib/substrate/substrate-audit-writer.ts`, `website/src/lib/translation-sandwich/parallel-run.ts`, `supabase/migrations/20260603_a12_substrate_audit_events.sql` all on `main` (last A12 commit `739b28d`); `next.config.js` has `instrumentationHook: true`.
4. **The only gate is `SUBSTRATE_OTEL_ENABLED`.** AI confirms by reading `instrumentation.ts` (line 26) + `substrate-telemetry.ts` (`isSubstrateOtelEnabled`): no OTLP backend env var is required — when the flag is on, spans use a ConsoleSpanExporter (→ deployment logs). A persistent trace backend is a separate deferred decision (see Decision 2 below).
5. The migration is run against the **production** Supabase project, **not** TEST. Production ref: `jdbefwkonfbhjquozgxr` (US East / North Virginia). TEST ref (do **not** use here): `iwdtrvuphogkwmovhnvz` (`sagereasoning-test`). AI re-confirms the production ref at open against `/compliance/sub-processor-register.md`.
6. The AI does **no** Vercel, git, or Supabase operations — the founder performs the migration (Supabase dashboard), the env-var change + redeploy (Vercel dashboard), and the docs commit (GitHub Desktop). The AI walks every step live (PR17).

---

## Part A — Open under the protocol

Read in order:

1. `/adopted/standing-protocol-cache.md` (~3 min) — Critical tier; §"Critical-risk sessions" (full templates); signals; AI-failure-modes table incl. prescribe-before-grounding + PR17.
2. `/operations/handoffs/founder/2026-06-03-A12-opentelemetry-instrumentation-close.md` — the authoritative A12 build state: what was built, the TEST verification result, the production-state line, the deferred items (trace backend, failure-path spans, broader instrumentation).
3. `/operations/handoffs/founder/2026-06-07-prelaunch-S1-data-rights-go-live-close.md` — the S1 close (most recent; production state).
4. `supabase/migrations/20260603_a12_substrate_audit_events.sql` in full — the table, the append-only triggers, and the commented rollback block at the bottom.
5. `website/src/instrumentation.ts` + `website/src/lib/substrate/substrate-telemetry.ts` (top ~90 lines) — confirm the flag gate + no-op safety + PR6 boundary.
6. `/compliance/sub-processor-register.md` — re-confirm the production Supabase ref before directing any production SQL.
7. `/operations/decision-log.md` last 2 entries.

**Confirm at open (narrate before any action, per the AI-failure-modes table):** where we are in the arc (Session 2 of the pre-launch bring-forward plan; A12 is built + Verified-live on TEST + deployed inert; only the production migration + the flag remain); tier = **Critical**, full Critical Change Protocol; PR17 engaged (founder runs the migration, the Vercel change, and the redeploy — AI walks live, does not hand off); status vocabulary; model selection N/A for the activation itself (the verification call exercises `/api/reason`, whose models are unchanged); PR6 **not** engaged (state explicitly — A12 stays outside the R20a perimeter); PR15 (no Anthropic-canonical primitive substitutes for flipping a Vercel env flag / running a Supabase migration — state explicitly).

---

## Two decisions to settle at open (founder elects; AI presents with a recommendation)

**Decision 1 — Instrument only `/api/reason`, or broaden now?**
Today only `/api/reason` is instrumented (the PR1 single-endpoint proof, Verified-live on TEST). *Recommendation: keep it `/api/reason`-only for this activation.* PR1 says prove on one endpoint first; broadening instrumentation to other endpoints is a separate **Elevated build** session, not bundled into this Critical activation. Activating the proven surface is the clean, reversible move; broadening can follow once the production surface has run.

**Decision 2 — Production trace backend now, or defer (PR7)?**
When the flag is on, spans export via ConsoleSpanExporter → they land in the Vercel runtime/function logs. The **durable** observability — the part Sessions 3 and 5 read — is the `substrate_audit_events` table, which does not need a trace backend. *Recommendation: defer the trace backend (PR7).* Wiring a persistent tracing backend (Vercel OTel integration / Honeycomb / Grafana / Datadog — all support the GenAI conventions) is an optional later decision and is **not** needed to unblock A19/A14.

If the founder accepts both recommendations, the session is exactly Steps 0–6 below.

---

## Part B — Procedure

Ground each surface before acting (prescribe-before-grounding). **Order matters: apply the migration FIRST, then flip the flag, then redeploy.** Rationale: if the flag is on before the table exists, the audit write safely no-ops (it's isolated and never throws into the response — so users are unaffected), but the verification row would be lost. Table first guarantees the first instrumented call is captured.

### Step 0 — Confirm current production state (AI, read-only)
- Confirm the A12 files are on `main` + pushed (pre-condition 3) → code is deployed.
- Confirm `SUBSTRATE_OTEL_ENABLED` is **unset** in production (founder reads it from Vercel → Project → Settings → Environment Variables; AI confirms the code default is no-op when unset).
- State to the founder, in plain language: *"A12 is already deployed but switched off. We are doing two things: (1) create one new, empty, append-only audit table in the production database, and (2) flip one switch in Vercel from off to on, then redeploy. The switch only adds observability; it can't change a user's assessment — the audit write is isolated and never breaks the response. The whole thing reverses by flipping the switch back and redeploying."*

### Step 1 — Critical Change Protocol brief (AI completes visibly before the founder runs anything) — 0c-ii
1. **What is changing:** (a) one new, empty, append-only table `substrate_audit_events` is created in the production Supabase project; (b) the Vercel env var `SUBSTRATE_OTEL_ENABLED` is set to `true` for the **Production** environment and the app is redeployed. From then on, each `/api/reason` run emits trace spans (to the Vercel logs) and writes one **masked** audit row (structural fields only — no raw text).
2. **What could break:** very little, and nothing that changes a user's assessment. The instrumentation is additive, flag-gated, and **no-throw**: a span or audit-write failure is swallowed and never alters the `/api/reason` response (confirmed in `substrate-telemetry.ts` + the A12 close). Realistic failure modes and their blast radius: *startup registration error* → caught + logged, server still starts (and rolls back via the flag); *audit insert fails* (e.g. table missing) → isolated no-op, response still HTTP 200; *added latency* → one extra span layer + one awaited masked insert per call (sub-perceptible; PR3 accepts synchronous safety/telemetry latency). A real `/api/reason` verification call incurs a small real Anthropic cost (Sonnet L1 + L3 — a few cents) — acceptable for one benign call.
3. **What happens to existing sessions:** nothing — no auth/session/encryption change. (No real users yet, so N/A in practice.)
4. **Rollback plan (founder-runnable):** in Vercel, set `SUBSTRATE_OTEL_ENABLED` back to unset (delete the variable) **and redeploy** → production is byte-identical to today (the code is a strict no-op when the flag is off). The audit table is additive and harmless if left in place; to fully remove it, run the **commented rollback block** at the bottom of `20260603_a12_substrate_audit_events.sql` (drops the triggers, function, and table) in the production SQL editor. No data loss (the table is new).
5. **Verification step:** Step 4 below (one benign production `/api/reason` call → confirm a masked audit row in production Supabase + masking safety check + no-regression).
6. **Explicit approval:** the founder says "OK / go ahead" **specific to (a) creating the production audit table and (b) turning on `SUBSTRATE_OTEL_ENABLED` in production + redeploying** before Step 2 proceeds.

### Step 2 — Apply the `substrate_audit_events` migration in PRODUCTION (founder, walked live)
1. dashboard.supabase.com → select the **production** project — ref `jdbefwkonfbhjquozgxr` (US East / N. Virginia). Confirm it is **NOT** `sagereasoning-test` before continuing (Project Settings → General → Reference ID).
2. Left sidebar → SQL Editor → + New query.
3. Open `supabase/migrations/20260603_a12_substrate_audit_events.sql`, copy its **entire** contents, paste, Run. (It is idempotent — `CREATE TABLE IF NOT EXISTS` / `CREATE OR REPLACE` / `DROP ... IF EXISTS` — safe to re-run.)
4. Expected: "Success. No rows returned."
5. Confirm the table + masking-relevant columns — new query:
```sql
select column_name, data_type
from information_schema.columns
where table_schema = 'public' and table_name = 'substrate_audit_events'
order by ordinal_position;
```
Expected columns include: `event_id` (uuid), `correlation_id` (uuid), `agent_id` (text), `surface` (text), `decision_event` (text), `severity_band` (text), `layer1_latency_ms`/`layer2_latency_ms`/`layer3_latency_ms` (integer), `models_used` (ARRAY), `provenance` (jsonb), `use_policies` (jsonb), `masked_context` (jsonb), `occurred_at` (timestamptz). ✅
6. Confirm it's empty: `select count(*) from public.substrate_audit_events;` → `0`. ✅ before continuing.

### Step 3 — Turn on `SUBSTRATE_OTEL_ENABLED` in Vercel, then redeploy (founder, walked live)
*(Vercel labels can shift; the AI confirms each label live before the founder clicks.)*
1. vercel.com → the SageReasoning project → **Settings** → **Environment Variables**.
2. **Add New**: Key = `SUBSTRATE_OTEL_ENABLED`; Value = `true`; **Environments** = **Production** only (leave Preview + Development unchecked unless the founder wants TEST/preview tracing too). **Save**.
3. Env-var changes do **not** take effect until a redeploy. Go to **Deployments** → the latest **Production** deployment → the **⋯** menu → **Redeploy** → confirm (build cache on/off both fine). Wait for the deploy to go **green/Ready**.
4. Expected: deploy succeeds; the runtime logs for the new deployment show `[instrumentation] SageReasoning substrate OTel registered (SUBSTRATE_OTEL_ENABLED=true; ConsoleSpanExporter).` on first server boot. (Vercel → the deployment → **Logs** / **Runtime Logs**.)

### Step 4 — Verify in PRODUCTION (Critical verification step)
1. **One benign `/api/reason` call against production (AI walks live).** The AI repoints the existing `/api/reason` test harness (the API-key/JWT path used in the A10/A11b TEST runs) at `https://sagereasoning.com`, or directs the founder through one authenticated production call, using a plainly benign input (e.g. "I keep putting off a tedious work task and feel mildly annoyed at myself"). Expected: **HTTP 200**, a normal assessment, **no** distress redirect (no-regression check).
2. **Confirm the audit row** in the **production** Supabase SQL editor:
```sql
select decision_event, severity_band, models_used, provenance, use_policies, masked_context, occurred_at
from public.substrate_audit_events order by occurred_at desc limit 1;
```
Expected: one row; `decision_event = 'assessment'`; `provenance` + `use_policies` populated (AP2 shape); `models_used` lists the models touched.
3. **Masking safety check (R3 + R17) — the one thing worth stopping for.** Read the `masked_context` value: it must contain **only** structural fields (e.g. `input_char_count`, mechanism codes, severity band, counts) and **no** sentence from the input, no free-text findings, no intimate data. If any raw text appears → **STOP, unset the flag + redeploy (Step 1 rollback), and tell the AI** — that would be a masking defect the AI owns.
4. **Optional:** confirm the `substrate.reason → layer1/layer2/layer3 → audit.insert` spans appear in the Vercel runtime logs for that request, all sharing one `sage.correlation_id`.
5. **State the disposition:** A12 instrumentation + call-grain audit is now **Live in production** on `/api/reason`; `substrate_audit_events` is **Live** (production) and receiving masked rows; Sessions 3 (A19) and 5 (A14) are now unblocked.

### Step 5 — Decision-log entry
Append `D-PRELAUNCH-S2-OTEL-ACTIVATION-2026-06-DD`. Because the change is Critical, include in the entry: the Critical-Change-Protocol record (the 6 points, condensed), the Risk Classification Record, the rollback path (flag-unset + redeploy; table-drop block), and the founder-performed verification result (the audit row + masking confirmation). Note this closes the "A12 OTel not active in production" deferral and unblocks Sessions 3 + 5. Status changes: `substrate_audit_events` → **Live** (production); `SUBSTRATE_OTEL_ENABLED` → set `true` (Production); A12 → **Live (production, /api/reason)**.

### Step 6 — Session close (full Critical form) + commit
Per `/adopted/standing-protocol-cache.md` §"Critical-risk sessions" (full close: Verification Method Used, Risk Classification Record, PR5 Knowledge-Gap Carry-Forward, Founder Verification, Orchestration Reminder). The only files to commit are docs (the decision-log entry + this session's close) — **no code change this session** (the code shipped on 2026-06-03; the production changes were the hand-run migration + the Vercel flag). Provide the exact `rm -f .git/index.lock` + `git add`/commit block for the founder to push via GitHub Desktop. **Vercel note:** the redeploy already happened in Step 3 (that's what activated the flag); the docs commit is `/operations/`-only and changes no deployed behaviour.

---

## What is NOT in this session
- **No code change** (A12 shipped 2026-06-03). No new endpoints, no broadening of instrumentation beyond `/api/reason` (Decision 1 — deferred to a separate Elevated build unless the founder elects otherwise at open).
- **No production trace backend** (Decision 2 — deferred PR7; ConsoleSpanExporter → Vercel logs is sufficient; the durable audit table is what unblocks A19/A14).
- **No A19 / A14 work** — those are Sessions 3 and 5; this session only provides the data they read.
- **No CR-register posture upgrades; no housekeeping edits** (the queued governance edits + stale `CLAUDE.md` block remain a separate item).

## Rollback path
In Vercel: delete `SUBSTRATE_OTEL_ENABLED` (or set it to anything other than `true`) **and redeploy** → production byte-identical to today (strict no-op when off). The audit table is additive and harmless; to remove it entirely, run the commented rollback block at the bottom of `20260603_a12_substrate_audit_events.sql` in the production SQL editor. No code to revert, no data lost.

## Forecast
Most likely shape: the additive migration runs cleanly in production (table confirmed, empty); the founder flips one Vercel flag and redeploys; one benign production `/api/reason` call returns a normal 200 and writes one masked audit row whose masking checks out; one Critical docs commit. After it, the substrate is recording its own health in production and Sessions 3 (A19 abuse-detection) and 5 (A14 SLO/health tracker) are unblocked. Next in the plan: **Session 3 — A19 abuse-detection go-live + the two remaining detectors** (needs this OTel data), or **Session 4 — A13 automated alert delivery** (independent), founder's election.

---

*End of prompt. Opens on `main`. **Critical** — full Critical Change Protocol; founder runs the production migration (Supabase), the env-flag change + redeploy (Vercel), and the docs commit (GitHub Desktop), each walked live (PR17). Order: migration → flag → redeploy → verify. One-flag rollback.*
