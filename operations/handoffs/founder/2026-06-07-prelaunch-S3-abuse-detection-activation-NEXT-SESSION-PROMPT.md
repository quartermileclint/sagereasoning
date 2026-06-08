# Next-Session Prompt — Pre-Launch S3 (dense): A19 abuse-detection go-live + 2 new detectors built inert + CLAUDE.md refresh

Paste this whole file into a new session to proceed.

This is **Session 3** of the pre-launch **completion** plan (`/operations/pre-launch-completion-plan-2026-06-07.md`, adopted 2026-06-07). It is packed to the dense form the founder elected: **one Critical activation (the spine) + AI-doable build/housekeeping fill**. The spine turns on the A19 abuse-detection that is already built, Verified-live on TEST, and deployed inert in production — making the substrate able to **detect** a per-identity request burst by reading the OTel audit data that **Session 2 activated**. The fill builds the two remaining detectors (held inert in production) and refreshes the stale `CLAUDE.md` production-state block.

A19 is **detection-only** — it records signals; it never blocks, rate-limits, or revokes (enforcement is a deliberately separate, later decision).

**Stream:** founder.
**Tier:** the session spans `code-critical` (the A19 production activation — env flag + service token on a live API surface, + a production `schema` migration) **+** `code-elevated` (the two new detectors, built additive + inert) **+** `governance` (CLAUDE.md refresh + decision log). **The highest category governs → the session as a whole is Critical.** Full Critical Change Protocol (0c-ii), walked live (PR17).
**Governing frame:** `/adopted/standing-protocol-cache.md` §"Critical-risk sessions" (full templates; Critical Change Protocol governs) + `/adopted/build-sessions-protocol-cache.md`.

**Predecessor closes:** `/operations/handoffs/founder/2026-06-07-prelaunch-S2-otel-activation-close.md` (S2; most recent — turned OTel on, which A19 depends on), `/operations/handoffs/founder/2026-06-06-reconcile-A19-abuse-detection-close.md` (A19 built + velocity detector proven), `/operations/handoffs/founder/2026-06-06-post-A19-verified-NEXT-SESSION-PROMPT.md` (carried-forward A19 state).
**Predecessor decision-log entries:** `D-PRELAUNCH-S2-OTEL-ACTIVATION-2026-06-07`, `D-A19-VELOCITY-VERIFIED-LIVE-2026-06-06`, `D-A19-ABUSE-DETECTION-VELOCITY-PROOF-2026-06-06`.
**Plan context:** `/operations/pre-launch-completion-plan-2026-06-07.md` (this is its Session 3).

**Risk classification:** **Critical** under 0d-ii — the activation is a deployment-configuration change (env flag + service token activating `/api/abuse/evaluate` on the live deployment). The migration half is additive/idempotent (Elevated alone); the detector build is additive + inert (Elevated alone); the highest category governs → **Critical**. **PR6 not engaged** — A19 reads the substrate's already-produced `substrate_audit_events` rows (occurred_at + agent_id + structural `masked_context`); it never touches the R20a distress classifier, the A7 Zone-2 gate, or their wrappers (boundary stated in `abuse-detector.ts` + the A19 build close). The two new detectors read **structural fields only** (R3/R17 — never raw text). AC7 not engaged.

---

## Why this session matters

A19 is the system noticing when one identity makes far more requests than its own normal ("identity X made 50 requests in its busiest minute, 10× its baseline"). The `request_velocity_anomaly` detector is **built and proven on TEST** (2026-06-06). In production it sits inert behind one unset flag, one unset token, and a not-yet-applied table; it reads `substrate_audit_events`, which only started flowing in production when **S2 turned OTel on** — so its dependency is now satisfied. Turning it on is a hard pre-launch enabler (reverse-engineering / scraping attempts get *seen*) and is low-uncertainty (TEST-proven, mirrors the A12/A13 activation shape). Because the switch sits on the live deployment it is a **Critical** change. Per the founder's "fully-utilised sessions" direction, the verified activation is followed by real build work (the two further detectors) and a housekeeping fix that needs no founder decision (CLAUDE.md), all without compromising the Critical isolation.

---

## Two decisions to settle at open (founder elects; AI presents with a recommendation)

**Decision 1 — Confirm the dense packing (build the two new detectors this session, inert in production).**
The plan adopted the dense form: build `systematic_enumeration` + `rapid_input_variation` as additive pure detectors + thresholds + unit tests, **wired behind a rollout sub-flag that stays UNSET in production** so production runs only the proven velocity detector; prove the two new ones on **TEST** (founder pass — PR1 surface-rollout; PR2 invocation-verified). Their production rollout is a later 2-minute flag-flip (foldable into S4).
**Recommendation: yes — build them inert this session.** It's real additive work that fills the session, respects PR1 (no unproven rollout into the live production surface) and PR2 (they're invoked + proven on TEST, not dead code), and leaves production running only the proven detector. *(If the founder prefers a leaner session, fall back to activation-only + CLAUDE.md and defer the detector build — state at open.)*

**Decision 2 — Detection-only (no enforcement), confirm.**
A19 records signals to `abuse_signals`; it never auto-blocks, rate-limits, or revokes. **Recommendation: keep detection-only** (the founder's standing election). Enforcement on live traffic is a separate, later decision and is out of scope here.

---

## Pre-conditions (AI verifies by read at open; founder confirms)

1. Working tree clean enough to add a commit at the end; no `.git/index.lock` (if present: `rm -f .git/index.lock` first — founder runs git; AI does read-only git inspection only).
2. `main` up to date with `origin/main`; Vercel green (founder confirmed at the S2 close: "Vercel green"; the S2 docs commit pushed).
3. **S2 is done** — `SUBSTRATE_OTEL_ENABLED=true` in production, `substrate_audit_events` Live and receiving rows. A19 has nothing to read without this. AI confirms by reading the S2 close + `D-PRELAUNCH-S2-OTEL-ACTIVATION-2026-06-07`.
4. A19 code is committed + deployed, inert. AI confirms by read: `git ls-files` shows `website/src/app/api/abuse/evaluate/route.ts`, `website/src/lib/abuse-detection/abuse-detector.ts`, `abuse-thresholds.ts`, and `supabase/migrations/20260606_a19_abuse_signals.sql` on `main`. The endpoint is deployed but returns **503** while `SUBSTRATE_ABUSE_DETECTION_ENABLED` is unset (confirm the 503 in Step 0).
5. The gates are `SUBSTRATE_ABUSE_DETECTION_ENABLED` (flag) + `ABUSE_DETECTION_EVAL_TOKEN` (service token). AI confirms by reading `route.ts`: unset flag → 503; missing/non-matching token → 401; both present → 200.
6. The migration runs against the **production** Supabase project, not TEST. Production ref: `jdbefwkonfbhjquozgxr` (US East / N. Virginia). TEST ref (do **not** use for the activation): `iwdtrvuphogkwmovhnvz` (used only for the detector TEST pass in Step 5). AI re-confirms the production ref at open against `/compliance/sub-processor-register.md`.
7. The AI does no Vercel, git, or Supabase operations — the founder performs the production migration (Supabase), the env-var + token change + redeploy (Vercel), the TEST-pass for the new detectors, and the commit (GitHub Desktop). The AI walks every step live (PR17) and writes the detector code. The token is a **credential the founder mints** (`openssl rand -hex 32`); the AI never sees it.

---

## Part A — Open under the protocol

Read in order:
1. `/adopted/standing-protocol-cache.md` (~3 min) — Critical tier; §"Critical-risk sessions"; signals; AI-failure-modes table incl. prescribe-before-grounding + PR17.
2. `/operations/pre-launch-completion-plan-2026-06-07.md` — this session is its S3; confirm the dense-packing intent + the definition-of-done this session contributes to.
3. `/operations/handoffs/founder/2026-06-07-prelaunch-S2-otel-activation-close.md` — most-recent production state (OTel now Live).
4. `/operations/handoffs/founder/2026-06-06-reconcile-A19-abuse-detection-close.md` — the authoritative A19 build state, detection-only posture, deferred detectors + enforcement.
5. `supabase/migrations/20260606_a19_abuse_signals.sql` in full — the table (supports all three `signal_type`s in its CHECK), dedup unique index, service-role-only RLS, commented rollback block. (`abuse_signals` is **NOT** append-only — `notified_at` is updated — so no immutability trigger.)
6. `website/src/app/api/abuse/evaluate/route.ts` + `website/src/lib/abuse-detection/abuse-detector.ts` + `abuse-thresholds.ts` — the flag/token gates, the no-`/api/reason`-critical-path posture, the PR6 boundary, and the existing pure-detector + threshold shape the two new detectors must mirror.
7. `/compliance/sub-processor-register.md` — re-confirm the production Supabase ref.
8. `/operations/decision-log.md` last 3 entries.

**Confirm at open** (narrate before any action): where we are in the arc (S3 of the completion plan; velocity detector built + Verified-live on TEST + deployed inert; S2/OTel on so data exists); what's queued behind; what's awaiting the founder vs the AI; tier = Critical, full Critical Change Protocol; PR17 engaged; status vocabulary; model selection **N/A** (A19 detectors are pure + deterministic — no LLM); PR6 **not** engaged (state explicitly); PR15 (no Anthropic-canonical primitive substitutes for a Vercel flag/token change or a Supabase migration — state explicitly).

---

## Part B — Procedure

**Order matters and the spine comes first:** apply the production migration → set flag + token → redeploy → verify the activation. **Only after the activation is verified** do the inert detector build (Step 5) and the CLAUDE.md refresh (Step 6) proceed, so the Critical change stays isolated and individually verified.

### Step 0 — Confirm current production state (AI read-only + founder one check)
- AI confirms A19 files on `main` + deployed; flag + token unset in production (→ 503).
- **Founder baseline check (Terminal):** `curl -s -w "\nHTTP:%{http_code}\n" "https://sagereasoning.com/api/abuse/evaluate"` → expect **HTTP:503** (deployed; inert). This is the "before" state rollback returns to.
- AI states in plain language what the three changes are (new empty table; one flag + one secret token; redeploy) and that detection records only — it never blocks anyone and never runs on the `/api/reason` path.

### Step 1 — Critical Change Protocol brief (AI completes visibly before the founder runs anything) — 0c-ii
1. **What is changing:** (a) new empty `abuse_signals` table in production; (b) `SUBSTRATE_ABUSE_DETECTION_ENABLED=true` + a new secret `ABUSE_DETECTION_EVAL_TOKEN` (Production) + redeploy. After it, a service-token call to `/api/abuse/evaluate` evaluates the real audit data and persists any tripped signal.
2. **What could break:** very little, and **nothing that touches a user's assessment** — `/api/abuse/evaluate` is standalone (reads audit + writes `abuse_signals`), not on the `/api/reason` path (grep-confirmed; PR6 boundary). Failure modes: table missing when flag on → write errors on that call (mitigated by migration-first); bad token → 401 (no effect); false-positive on bursty-legit traffic → just a recorded row (detection-only; conservative thresholds 3×/≥5 windows/floor 5).
3. **What happens to existing sessions:** nothing — no auth/session/encryption change to the app. (No real users yet.)
4. **Rollback plan (founder-runnable):** unset `SUBSTRATE_ABUSE_DETECTION_ENABLED` + redeploy → `/api/abuse/evaluate` returns 503, byte-identical to today. Token can be left or deleted (inert without the flag). The `abuse_signals` table is additive/harmless; to remove, run the commented rollback block in `20260606_a19_abuse_signals.sql`. No data loss.
5. **Verification step:** Step 4 (migration → flag+token → redeploy → one authenticated 200 + gate-flip 503→401 + no false-positive signal).
6. **Explicit approval:** founder says "OK / go ahead" specific to (a) creating the production `abuse_signals` table and (b) setting the flag + token in production + redeploying, before Step 2.

### Step 2 — Apply the `abuse_signals` migration in PRODUCTION (founder, walked live)
1. dashboard.supabase.com → the **production** project — ref `jdbefwkonfbhjquozgxr`. Confirm it is **NOT** `sagereasoning-test` (Project Settings → General → Reference ID).
2. SQL Editor → + New query → paste the **entire** contents of `supabase/migrations/20260606_a19_abuse_signals.sql` → Run. (Idempotent.) Expected: "Success. No rows returned."
3. Confirm columns: `select column_name, data_type from information_schema.columns where table_schema='public' and table_name='abuse_signals' order by ordinal_position;` → expect `id, signal_type, scope, severity, period_date, observed_value, threshold_value, multiple, message, details, created_at, notified_at`. ✅
4. Confirm empty: `select count(*) from public.abuse_signals;` → `0`. ✅

### Step 3 — Set the flag + token in Vercel, then redeploy (founder, walked live)
1. **Mint the token (founder's Mac, Terminal):** `openssl rand -hex 32` → copy the hex string (AI never sees it; keep it safe — needed for verification + future scheduled delivery).
2. vercel.com → SageReasoning → Settings → Environment Variables.
3. Add `SUBSTRATE_ABUSE_DETECTION_ENABLED` = `true`, Environments = **Production** only. Save.
4. Add `ABUSE_DETECTION_EVAL_TOKEN` = the hex string, Environments = **Production** only. Save.
5. Redeploy: Deployments → latest Production deployment → ⋯ → Redeploy → confirm → wait for green.

### Step 4 — Verify the activation in PRODUCTION (Critical verification step)
1. **Authenticated call (Terminal; `<TOKEN>` = the hex from Step 3.1):**
   `curl -s -w "\nHTTP:%{http_code}\n" -H "x-abuse-detection-token: <TOKEN>" "https://sagereasoning.com/api/abuse/evaluate"` → expect **HTTP:200** + JSON showing the evaluation ran. With no real abuse, **`signals_fired` is expected to be 0** (correct — no false positives). The burst-firing is already TEST-proven (`D-A19-VELOCITY-VERIFIED-LIVE-2026-06-06`); we do **not** seed synthetic bursts into the production append-only audit trail.
2. **Gate sanity (no token):** `curl -s -w "\nHTTP:%{http_code}\n" "https://sagereasoning.com/api/abuse/evaluate"` → expect **HTTP:401** (was 503 in Step 0 → proves the flag is on + token gate active).
3. **Disposition:** A19 `request_velocity_anomaly` → **Live in production**; `abuse_signals` → **Live (production)**. *Spine complete — proceed to fill only now.*

### Step 5 — (Fill, Elevated) Build the two remaining detectors, inert in production
1. **Design off structural fields only (R3/R17).** From `masked_context` (e.g. `input_char_count`, `engine_attribution`, `tier1_trigger_code`, `severity_band`, counts) + `occurred_at`/`agent_id`: `systematic_enumeration` (an identity walking structural variants methodically) and `rapid_input_variation` (rapid churn of structural inputs). Never raw text. Confirm the structural signal definitions with the founder before coding.
2. **Build pure + add thresholds.** Add `detectSystematicEnumeration` + `detectRapidInputVariation` to `abuse-detector.ts` (same pure-function shape as `detectRequestVelocityAnomaly`); add their conservative thresholds to `abuse-thresholds.ts`. Unit tests alongside (fires / silent-on-flat / guards) — sandbox `npx tsx` (Supabase-free) or the in-sandbox `tsc`+node form per CLAUDE.md.
3. **Wire behind a rollout sub-flag, UNSET in production.** Gate the two new detectors in the evaluator behind a rollout sub-flag (e.g. `SUBSTRATE_ABUSE_DETECTION_ROLLOUT_ENABLED`) that stays UNSET in production this session → production runs **only** the proven velocity detector. PR2: confirm invocation on the path (grep). This avoids an unproven rollout onto the live surface (PR1) while keeping the new code invoked-and-proven (not dead code).
4. **Founder TEST pass (PR17, optional but recommended this session).** On TEST (ref `iwdtrvuphogkwmovhnvz`) with the rollout sub-flag set, seed enumeration + variation patterns and confirm each new detector fires and stays silent on flat data → the two new detectors reach **Verified-live (TEST)**. Use the append-only teardown (`ALTER TABLE … DISABLE TRIGGER trg_sae_no_delete` around the seed DELETE) per the carried-forward PR5 note. *(If the founder prefers, defer the TEST pass to a follow-on and leave the new detectors at sandbox-verified-inert.)*
5. **Production rollout of the two new detectors is NOT done this session** — it is a later 2-minute flag-flip (set the rollout sub-flag in production + verify), foldable into S4.

### Step 6 — (Fill, governance) Refresh the stale `CLAUDE.md` production-state block
- `CLAUDE.md` "Production state (as of 2026-05-14)" predates A10–A19 and misleads every session open. Update it to current truth: OTel **on** (S2); data-rights tables **Live** (S1); A19 velocity detector **Live (production)** + 2 new detectors built inert behind the rollout sub-flag; cost-health **Live**; core distress safety **on**; A10/A11b/Layer3/R20a-rendering still **inert**. Keep it a pointer file (no governance content changes). This is a documentation refresh — Standard risk; founder glances, no decision needed.

### Step 7 — Decision-log entry (Critical form)
Append `D-PRELAUNCH-S3-ABUSE-DETECTION-ACTIVATION-2026-06-DD`. Include the Critical-Change-Protocol record (6 points, condensed), the Risk Classification Record (activation Critical; detector build Elevated/inert; CLAUDE.md Standard), the rollback path, and the founder-performed verification result (200 + 401 gate flip + empty `abuse_signals`; + the new detectors' TEST result if run). Status changes: `abuse_signals` → Live (production); `SUBSTRATE_ABUSE_DETECTION_ENABLED` + `ABUSE_DETECTION_EVAL_TOKEN` → set (Production); A19 `request_velocity_anomaly` → Live (production); `systematic_enumeration` + `rapid_input_variation` → Wired-inert (+ Verified-live TEST if run). Note the production rollout of the two new detectors (rollout sub-flag flip) is deferred to S4.

### Step 8 — Session close (full Critical form) + commit
Per `/adopted/standing-protocol-cache.md` §"Critical-risk sessions" (full close: Verification Method Used, Risk Classification Record, PR5 Knowledge-Gap Carry-Forward, Founder Verification, Orchestration Reminder). **This session includes code** (the two new detectors + thresholds + tests + the rollout-sub-flag wiring) + the CLAUDE.md refresh + docs — so the commit is not docs-only. Provide the exact `rm -f .git/index.lock` + `git add`/commit block. Vercel note: the activation redeploy already happened in Step 3; deploying the new detector code is a **production behavioural no-op** because the rollout sub-flag is unset in production.

---

## What is NOT in this session
- **No enforcement** — A19 stays detection-only (no rate-limit / revoke / block). Separate later decision.
- **No production rollout of the two new detectors** — they are inert in production behind the rollout sub-flag; the prod flag-flip is a later 2-minute step (S4 fill).
- **No automated delivery** — scheduled surfacing of signals (`notified_at`) is the A13/S7 Vercel-Cron arc.
- **No production audit-data seeding** — no synthetic bursts into the production append-only `substrate_audit_events`.
- **No R20a / Zone 2/3 / classifier / wrapper touch** (PR6 trip-wire). No governance-content edits beyond the CLAUDE.md production-state refresh.

## Rollback path
Activation: unset `SUBSTRATE_ABUSE_DETECTION_ENABLED` + redeploy → 503, byte-identical to today. Token optional to remove. `abuse_signals` removable via the migration's commented rollback block. The new detector code is inert in production (rollout sub-flag unset) — `git revert` removes it with no production behaviour change. No data lost.

## Forecast
Most likely: the migration runs clean (table confirmed, empty); the founder mints a token, sets two Vercel vars, redeploys; one authenticated call returns 200 with zero signals, the no-token call flips 503→401; then the two new detectors are written + unit-proven (+ optional TEST pass) but held inert in production behind the rollout sub-flag; CLAUDE.md refreshed; one Critical commit (code + docs). After it: request-burst detection is live in production, two more detectors are ready to roll out, and the AI's session-open map is current. Next in the completion plan: **S4 — injection-defence (A11b) go-live** (+ fold in the A19 rollout-sub-flag flip + limitations-page draft + R19d decision).

End of prompt. Opens on `main`. Critical — full Critical Change Protocol; founder runs the production migration (Supabase), mints the token + sets env vars + redeploys (Vercel), the new-detector TEST pass, and the commit (GitHub Desktop), each walked live (PR17). Order: migration → flag + token → redeploy → verify → (then) build detectors inert → CLAUDE.md refresh. One-flag rollback on the activation.
