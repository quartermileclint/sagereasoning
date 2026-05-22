# Next-Session Prompt — Sage Reflect Build: Stage B (Critical endpoint + translation-sandwich + R20a/Zone-3 + R18d)
**Stream:** founder.
**Tier:** `code-critical`. Stage B is the Critical perimeter work — a new authenticated public endpoint (AC7), R17 persistence of intimate introspective content, a deployment-config flag, the translation-sandwich LLM wiring, and the R20a/Zone-3 safety boundary (PR6).
**Governing frame:** `/adopted/standing-protocol-cache.md` (§"Critical-risk sessions" — keep the FULL templates + the Critical Change Protocol; do NOT abbreviate) + `/adopted/build-sessions-protocol-cache.md` ("no current users" → Critical Change Protocol step 3 = N/A).
**Predecessor session close:** `/operations/handoffs/founder/2026-05-22-sage-reflect-stage-a-build-close.md`.
**Predecessor decision-log entries:** `D-SAGE-REFLECT-STAGE-A-BUILD-WIRED-VERIFIED-2026-05-22`; `D-SAGE-REFLECT-DESIGN-LOCKED-2026-05-22`.
**Operative deliverables (read in full):** `/adopted/sage-reflect-product-design.md` (LOCKED) + `/drafts/sage-reflect-build-staging-plan.md` (Stage B section).
**Risk classification:** **Critical** under 0d-ii. **Full Critical Change Protocol (0c-ii) applies and must be completed visibly in the conversation before the founder deploys.** PR6 ENGAGED (R20a/Zone-3 boundary). PR1 + PR2 + PR4 + KG1 + KG7 engaged.

## Why this session matters
Stage A built + Verified the deterministic engine, the Sage-Reflect-owned store, the `evaluated_actions` migration, the SR-15 per-domain store, and the Sage Assent feed — all in isolation, importing nothing public. Stage B wires the perimeter onto that **Verified** engine (PR1 satisfied): the authenticated, metered, kill-switched endpoint; the translation-sandwich that turns the agent's free text into the structured assessments the engine already consumes; the R20a/Zone-3 safety boundary; and the R18d adversarial suite. Nothing user-facing changes until the founder flips `SAGE_REFLECT_ENABLED`.

## Pre-conditions (confirm at open)
1. Stage A is committed + pushed + Vercel green; the four test suites pass on a clean checkout (engine 48/0; proximity 10/0; session-store 29/0; sage-assent-feed 27/0); `tsc --noEmit` clean.
2. **The two Stage-A migrations have been RUN in Supabase** (`evaluated_actions`; `sage_reflect_sessions` + `sage_reflect_proximity_domains`) and their VERIFY blocks confirmed. Stage B cannot smoke-test without the tables.
3. **`MENTOR_ENCRYPTION_KEY` is set in Vercel AND locally** (64 hex chars). `encryptForStorage` throws without it — the first real persisted reflection would 500.
4. Production otherwise unchanged: Sage Calling Live (gated); substrate A7 Verified; A10 Live + Verified; Layer-3 + R20a substrate gates UNSET; Layer 1 schema v3.
5. Founder decision needed at open (carried from the Stage A close): confirm the **R17b encryption split** (verbatim responses encrypted; categorical logs plaintext) or instruct to encrypt the logs too.

## Part A — Open under the protocol
Read in order:
1. `/adopted/standing-protocol-cache.md` (~3 min — tier, model selection [Layer 1 = **Sonnet**], risk class, signals, status vocab, §Critical-risk sessions).
2. `/adopted/build-sessions-protocol-cache.md` (~3 min — "no current users").
3. This predecessor close + the Stage A close.
4. `/operations/decision-log.md` — the last 2 entries.
5. `/adopted/sage-reflect-product-design.md` (LOCKED) + `/drafts/sage-reflect-build-staging-plan.md` Stage B — **in full**.
6. The Stage-A modules being wired (`engine.ts`, `session-store.ts`, `sage-assent-feed.ts`) + the Sage Calling endpoint as the pattern (`website/src/app/api/calling/route.ts` + `request-helpers.ts` + `response-builders.ts`).

Confirm at open: tier (`code-critical`); hold-point (P0 0h active); **PR4 model selection against `constraints.ts` BEFORE designing the endpoint** (Layer 1 = Sonnet; no Haiku safety call — the Zone-3 path is a deterministic boundary check, not an LLM classifier); status vocab; signals/risk class.

## Part B — Procedure (Stage B)
### Step 1 — `POST /api/practice/reflect` (SR-13/SR-14)
Auth: A10 `sr_atl_` Bearer, **unscoped** (reuse the Sage Calling `verifyCallingToken`/`validateAtlWriteToken` pattern). Three auth failure modes → single 401 (no token; bad token; valid token + wrong `agent_id`); positive control → 200. Global `SAGE_REFLECT_ENABLED` checked **before auth** → 503 when unset/false (no code change to disable). Rate-limit → flag → body parse → auth → metering (one Option-D loop per billable call) → drive the engine via `nextStep` → `persistProgress`/`persistCompletion`. R4: surface only verbatim question/result text + coarse status; never the engine's rules/signals/thresholds. Mirror the Sage Calling route's pure `request-helpers` + `response-builders` split; every response carries the R3/R9 disclaimer + R18e `interaction_type`.

### Step 2 — Translation-sandwich wiring (Q1–Q4 semantic scoring)
Layer 1 (**Sonnet**) extracts structured features from each free-text answer → Layer 2 (deterministic) applies the Stoic Brain mechanism (passion taxonomy / value hierarchy / kathekon scoring) → produces the **structured assessments the Stage-A engine already consumes** (`Q1Assessment`…`Q4Assessment`). Q5/Q6: deterministic structural rules first; translation-sandwich escalation only if ambiguous (the Q6 `response_shape` classification). The engine is unchanged — Stage B only supplies its inputs. Cost the full pass (≤4 Layer-1 calls) against the R5 2x guardrail; emit the cost-health signal.

### Step 3 — R20a / Zone-3 boundary (SR-9) — PR6 → Critical
Deterministic boundary check **before** any reflection on a harm-flagged session. Sage Reflect is **not a crisis pathway**: flag the kathekon failure, update the profile, pass the developer flag — no philosophical remediation of harm. Build-to-wire-immediate (PR2): grep that the boundary check is invoked in the request path, not just defined (AC4-style invocation proof for the safety function).

### Step 4 — R18d adversarial suite
Exercise FD-R1..R4 adversarially (the clean-reflection / under-reporting fabrication vectors). State "measures observable patterns, not inner states" in the output (R18a/d). If the suite shows the deterministic FD rules miss subtle semantic signals, that is the documented trigger for the PR7 rules+LLM hybrid (not in scope unless triggered).

### Step 5 — Critical Change Protocol (0c-ii) — complete visibly before deploy
1. What changes (plain language). 2. What could break (auth-gate exposure; flag firing surface live; KG7 double-serialisation; R20a boundary bypass; Layer-1 cost overrun). 3. Existing sessions: **N/A — only founder + test logins** (build-arc cache). 4. Rollback: unset `SAGE_REFLECT_ENABLED` → every call 503s, no redeploy; `git revert` the endpoint commit. 5. Verification: founder smoke test (auth modes; a full Q1→Q6 pass; Supabase row checks incl. `jsonb_typeof(...)='array'` on the logs + `'object'` on `response_history_meta`; a Sage Assent recompute + an SR-15 row). 6. Explicit founder approval specific to the named risks.

### Step 6 — Verify, then full Critical session close + decision-log entry
Full templates (not lean) per the standing cache §Critical-risk sessions: Verification Method Used, Risk Classification Record, PR5 Knowledge-Gap Carry-Forward, Founder Verification (Between Sessions), Orchestration Reminder.

## Part C — Anticipated session shape
| Phase | Estimate |
|---|---|
| Part A — caches + closes + deliverables + constraints.ts model check | 25–30 min |
| Step 1 — endpoint + auth + flag + metering | 50–75 min |
| Step 2 — translation-sandwich wiring | 50–75 min |
| Step 3 — R20a/Zone-3 boundary | 30–45 min |
| Step 4 — R18d suite | 30–45 min |
| Step 5 — Critical Change Protocol (visible) | 20–30 min |
| Verify + Critical close + decision-log | 40–60 min |
| **Total** | **~4–5.5 hr** (likely split across sessions on time budget, per Rule B) |

## Rollback path
Fastest: UNSET/`false` `SAGE_REFLECT_ENABLED` in Vercel → every call 503s, no redeploy. Pre-push: `git reset --hard`. Post-push: `git revert <sha> && git push` → Vercel rebuilds to the pre-endpoint shape (route 404/absent). The Stage-A engine/store/feed/migrations remain inert on rollback; `sage_reflect_sessions` rows are hard-deletable (R17h). Nothing touches A10, the substrate write path, Option D, or Stripe.

## Forecast
After Stage B + the founder flipping `SAGE_REFLECT_ENABLED`, Sage Reflect goes **Live / Verified** (gated) — the fourth Sage Practice product, completing the Calling → Reasoning → Assent → Reflect loop. Then the carried PR7 tracks (human-surface K-category migration; ATL→Sage Assent rename incl. the SR-15 reconciliation; lawyer-engagement retention confirmation) and the Sage Calling follow-ons remain.

*End of prompt. Opens under Part A as a `code-critical` build session. The full Critical Change Protocol applies; do not abbreviate it.*
