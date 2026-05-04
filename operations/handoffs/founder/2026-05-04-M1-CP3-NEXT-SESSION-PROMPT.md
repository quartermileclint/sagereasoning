# Next-Session Prompt — M1-CP4: End-to-End Orchestration + Parallel-Run Wiring on `/api/reason` (Critical-tier)

**Stream:** founder.
**Tier:** `code-critical`.
**Governing frame:** `/adopted/standing-protocol-cache.md` for tier confirmation, but this is a **Critical-tier session**: per cache §"Critical-risk sessions", the **full** template applies and the **Critical Change Protocol (project instructions §0c-ii)** governs every load-bearing change. The lean form does NOT apply this session.
**Predecessor session close:** `/operations/handoffs/founder/2026-05-04-sub-session-M1-CP3-close.md`.
**Predecessor decision-log entries:**
- `D-M1-CP3-LAYER3-MODULE-AND-ADR007-2026-05-04` (M1-CP3 — Layer 3 module Verified standalone + ADR-007 Adopted; this prompt's predecessor)
- `D-M1-CP2-LAYER2-MODULE-AND-ADR006-2026-05-04` (M1-CP2 — Layer 2 module Verified standalone + ADR-006 Adopted)
- `D-M1-CP1-LAYER1-MODULE-AND-ADR005-2026-05-04` (M1-CP1 — Layer 1 module + ADR-005)
- `D-E10-ADR004-DRAFTED-AND-ADOPTED-2026-05-04` (E10 — ADR-004 codification, including the §6 + §7 + §8 deferrals this session resolves)

**Risk classification:** **Critical** under 0d-ii. Critical Change Protocol APPLIES — see Section "Part D — Critical Change Protocol activation" below. The session touches:
- The R20a perimeter route `/api/reason` (AC5 + PR6 + AC4)
- User-facing route behaviour during parallel-run (AC7-adjacent — the route's response shape stays bundled-depth; the wiring change is internal but the call graph changes)
- Deployment-config (env flag activating the parallel-run path)
- New Supabase table `translation_sandwich_comparisons` for offline comparison (PR1 single-endpoint discipline applied; first read of M1's parallel-run data)

PR6 ENGAGED. AC5 ENGAGED. AC4 ENGAGED. AC7 NOT engaged at the wiring layer (no auth/cookie/session/redirect change) but a Critical-tier session protocol still applies because of AC5.

## Why this session matters

This is the first session in the M1 arc that touches the user-facing route. M1-CP1 + CP2 + CP3 built three Verified-standalone modules in isolation. M1-CP4 composes them into the route with the explicit guarantee of B-3 (per ADR-004 §6.3): zero user impact during the proof. The user receives the bundled-depth result; the translation-sandwich result is logged for offline comparison. Failure of the new path returns the bundled-depth response; failure isolation is the central design property tested at this checkpoint.

The session also creates the first comparison data the founder will read at M1-CP5 to make the cutover decision. The harness Phase 6 (end-to-end orchestration), Phase 7 (R20a perimeter preservation via AC4 invocation testing), Phase 8 (fallback semantics), and Phase 9 (cost + latency reporting) all become live this session. The cost-cap discipline per ADR-004 §6.2 takes effect.

The PR5 carry-forward watch resolves this session: the founder's between-sessions real-Sonnet harness Phase 5 run (per CP3 close) has already happened; if it produced JSON-key drift in Layer 3's output, the third recurrence triggered promotion. If it passed cleanly, the prophylactic application stands.

## Pre-conditions

1. Founder pushed M1-CP3's six uncommitted files via GitHub Desktop. Working tree clean at session open. Vercel build green confirmation post-push (no behaviour change deploys this commit).
2. Founder ran the full real-Sonnet harness from M1-CP3 close (`npx tsx scripts/verify-translation-sandwich.ts`) and confirmed Phases 1–5 pass. Per-fixture diagnostics looked reasonable; LLM summaries broadly aligned with fallback summaries on primary issue + proximity; Greek-identifier consistency was clean (no soft-warn) or if any soft-warn appeared the founder noted which identifier; marginal-case assertions all passed.
3. Founder confirmed PR5 carry-forward disposition: either "no JSON-key drift observed; PR5 candidate stays in watch" (prophylactic application worked) OR "JSON-key drift observed; PR5 promoted to permanent KG entry per third recurrence; the AI updates `/operations/knowledge-gaps.md` at session open before any wiring".
4. Founder availability: 4–6 hours estimated for the wiring + harness, with reservation for a separate session if cost-cap approval pulls scope. Critical-tier sessions can run long because the Critical Change Protocol requires explicit step-by-step approval; budget conservatively.
5. Anthropic API key + Supabase service-role key for `supabase-us` available in `.env.local` for the harness Phase 9 cost reporting.

## Part A — Open under the protocol

Read in order — full reads required for `code-critical` per cache Element 2:

1. `/adopted/standing-protocol-cache.md` (~3 min — confirms tier `code-critical`, model selection rows, status vocabulary, signals, and the §"Critical-risk sessions" pointer to the full templates).
2. `/operations/handoffs/founder/2026-05-04-sub-session-M1-CP3-close.md` (~5 min — predecessor close).
3. `/adopted/adr/2026-05-04-translation-sandwich-pilot-api-reason.md` (ADR-004) **§6 + §7 + §8 + §9 + §10 in full** — the parallel-run mechanics, harness phases, R20a perimeter preservation, fallback semantics, multi-session checkpoint structure including M1-CP4 deliverable.
4. `/adopted/adr/2026-05-04-layer3-prose-template-api-reason.md` (ADR-007) **§6 in full** — the deterministic fallback prose helper that the route invokes when `generateProse` throws.
5. `/manifest.md` AC4 (invocation testing for safety functions); AC5 (R20a perimeter — eight bound routes, of which `/api/reason` is one); AC7 (auth/cookie/session/redirect surface — confirm not engaged at the wiring layer); PR1 (single-endpoint proof — `/api/reason` is the M1 pilot); PR6 (safety-critical changes are always Critical risk).
6. `/website/src/app/api/reason/route.ts` — the entire route file. Re-read line 144 (the existing `enforceDistressCheck(detectDistressTwoStage(input))` — the R20a perimeter; this MUST NOT move) and lines 162–170 (the parallel context loading L1+L2+L3 — the existing four-layer composition).
7. `/website/src/lib/sage-reason-engine.ts` `runSageReason` function (lines ~340–550 — the bundled-depth path; the call surface the route makes today).
8. `/operations/decision-log.md` last 3 entries (D-M1-CP3 + D-M1-CP2 + D-M1-CP1 — full context).
9. `/operations/knowledge-gaps.md` — full read. Engagement scan: KG1 (DB writes — the new `translation_sandwich_comparisons` table writes), KG2 (model selection — Sonnet for Layer 1 + Layer 3, deterministic for Layer 2), KG6 (composition order — translation-sandwich layers compose inside the existing four-layer context architecture), KG7 (JSONB storage format — the comparison table stores both engine outputs as JSONB).

Confirm at session open per cache:
- Tier: **`code-critical`** (cache §"Work categories")
- Hold-point: P0 0h active (cache Element 5)
- Model selection (PR4 + AC1): Sonnet for Layer 1 + Layer 3 (cache Element 6 rows); Haiku for the existing R20a distress check (`safety_critical` PermittedModel row); deterministic for Layer 2 (no model)
- Status vocabulary (D14): the route reaches Wired (parallel-run) at session close; it does NOT reach Verified — that requires the parallel-run observation period at M1-CP5
- Risk class: **Critical** under 0d-ii; Critical Change Protocol APPLIES
- AC4: ENGAGED — Phase 7 invocation test of the R20a distress check is the gating proof
- AC5: ENGAGED — `/api/reason` is one of the eight bound R20a perimeter routes
- AC7: NOT engaged at the wiring layer (no auth/cookie/session/redirect surface change)
- AC8: ENGAGED — the route now imports the three translation-sandwich modules; the architectural constraint's directory rule remains satisfied
- PR1: ENGAGED — single-endpoint proof on `/api/reason`; M2/M3/M4 consumers wait their turn
- PR3: ENGAGED — Layer 1 + Layer 3 awaited; no fire-and-forget; Layer 2 synchronous
- PR6: ENGAGED — every change touching the route at line 144 (the R20a perimeter) or in the call path before line 144 is Critical
- KG1: ENGAGED — the comparison table write must follow the Vercel five rules (per-request lifetime; awaited; no fire-and-forget)
- KG6: ENGAGED — composition order verified at runtime (R20a → Layer 1 → Layer 2 → Layer 3 → log to comparison table → return bundled-depth)
- KG7: ENGAGED if comparison table uses JSONB columns — confirm the table schema at Step 1 below

## Part B — Procedure

### Step 0 — PR5 carry-forward disposition (founder confirms at open)

If the founder's between-sessions real-Sonnet harness run produced JSON-key drift in Layer 3's output, the third recurrence promotes the candidate to a permanent KG entry. The AI updates `/operations/knowledge-gaps.md` per PR5 + appends `D-PR5-PROMOTED-LLM-JSON-KEY-FIDELITY-2026-05-XX` to the decision log (Standard risk; documentation-only). Then proceeds to Step 1.

If no drift was observed, the AI proceeds directly to Step 1 and notes the disposition in the decision-log entry at session close.

### Step 1 — Surface load-bearing decisions for the parallel-run wiring

Surface to the founder before any wiring change:

a. **Comparison table schema** — column types, indexes, retention, primary key shape. Recommended: `id` (UUID PK), `created_at` (timestamptz default now()), `request_id` (UUID), `input_text_hash` (text — SHA-256 of input for de-duplication without storing PII), `bundled_depth_output` (JSONB), `translation_sandwich_output` (JSONB nullable — null when Layer 1 or Layer 3 threw), `translation_sandwich_error` (text nullable), `layer1_latency_ms` (int), `layer2_latency_ms` (int), `layer3_latency_ms` (int), `bundled_depth_latency_ms` (int), `layer1_cost_usd_microcents` (bigint), `layer3_cost_usd_microcents` (bigint), `bundled_depth_cost_usd_microcents` (bigint). Index on `created_at`. Retention: 90 days post-cutover, then archived. **PII discipline** — do NOT store `input_text` itself; only the hash. Discuss with founder at session open.

b. **Env flag for parallel-run activation** — recommended: `TRANSLATION_SANDWICH_PARALLEL_RUN=1` activates the parallel path; absence leaves bundled-depth-only behaviour. The flag is read once at module load; cannot be toggled per-request. **Cutover discipline** — at M1-CP6, the flag is removed entirely; the new path becomes the only path.

c. **Cost cap mechanics** — recommended: in-process counter writes to a Supabase `translation_sandwich_cost_tracker` row at request end; the route reads the row at request start; if cumulative cost > cap, the parallel path is short-circuited (bundled-depth only) for the rest of the cap period. Alternative: external monitoring with manual flag flip when cap reached.

d. **Failure-isolation logging** — recommended: every parallel-path failure logs to `console.warn` with the failure category (layer1_throw, layer3_throw, validation_throw, cost_cap_reached) AND inserts a row in `translation_sandwich_comparisons` with `translation_sandwich_output: null` + `translation_sandwich_error: <category>:<message>` so the founder can read failure rates at M1-CP5.

e. **R20a perimeter preservation strategy** — recommended: the existing `await enforceDistressCheck(detectDistressTwoStage(input))` at line 144 is unchanged. The parallel-path call sits AFTER the distress check + AFTER the bundled-depth call; if either is short-circuited (distress redirect or bundled-depth throw), the parallel path is skipped. AC4 invocation test (Phase 7) verifies this by greping the route + asserting the call order.

### Step 2 — Critical Change Protocol activation (per project instructions §0c-ii)

Before any wiring change, the AI completes these steps visibly in the conversation, then asks the founder for explicit approval **specific to the named risks**:

1. **What is changing** — plain language. The route at `/api/reason` adds an internal call path that runs Layer 1 → Layer 2 → Layer 3 in parallel with the existing bundled-depth call. The user always receives the bundled-depth result. The new path's result is logged to a Supabase comparison table for offline analysis. A new env flag controls activation. A new Supabase table is created.

2. **What could break** — specific failure modes:
   - The R20a distress check could be moved or duplicated (HARD FAIL; the perimeter must fire exactly once before any reasoning). Phase 7 catches this.
   - The bundled-depth path could be slowed by the parallel call awaiting a slow Layer 1 or Layer 3 (latency regression). Mitigation: the parallel call uses `Promise.allSettled` + a deadline; if not done by the bundled-depth's deadline + 500ms grace, the parallel result is logged as `translation_sandwich_error: deadline_exceeded` and the user response proceeds.
   - The comparison table write could fail (DB unavailable, schema drift) and propagate the error to the user. Mitigation: the comparison-table write is wrapped in try/catch; failures log to `console.warn` and do NOT block the user response.
   - Cost overrun if the cap mechanism fails. Mitigation: hard cap at 1000 requests OR $50 per ADR-004 §6.2; manual flag flip available.
   - The new env flag could leak into other routes (M2/M3/M4 are not touched at M1; the flag must NOT activate translation-sandwich for routes other than `/api/reason`). Mitigation: the flag is read only inside `/api/reason`'s route file.

3. **What happens to existing sessions** — no effect. The user's response is the bundled-depth result, identical to today's behaviour. Existing `/api/reason` consumers see no change in response shape during the parallel-run period. (At M1-CP6 cutover, the response shape changes per A-2; the M1-CP6 prompt will name the public deprecation notice.)

4. **Rollback plan** — the env flag is set to `0` (or removed) and re-deployed. Vercel auto-rebuilds; the parallel path is dormant. The bundled-depth path is unchanged and continues serving users. No data loss; the comparison table is preserved for analysis. If a deployment is itself broken, `git revert` of the wiring commit + push reverts the route to its M1-CP3 state.

5. **Verification step** — after deployment:
   - The founder visits `/api/reason` with a known input (e.g., the F1 phone-checking text) and confirms a bundled-depth response shape (the existing shape, no `extraction` / `assessment` / `prose` keys at the top level).
   - The founder runs `LAYER1_REPLAY_CACHE=1 npx tsx scripts/verify-translation-sandwich.ts` and confirms Phases 6 + 7 + 8 + 9 pass (in addition to 1–5).
   - The founder queries Supabase: `SELECT count(*), count(translation_sandwich_output) FROM translation_sandwich_comparisons;` and confirms both counts are non-zero (parallel path firing) and the second is at most equal to the first (failures are also logged).
   - The founder reads the per-request `meta.engine_attribution` field if added (recommended) to confirm both engines reported.

6. **Explicit founder approval** — the founder says "approved" specific to the named risks above. Generic approval is not sufficient at Critical-tier per project instructions §0c-ii. The founder may approve in stages (e.g., "approve schema only", "approve env flag only") to reduce the blast radius of any one change.

### Step 3 — Implementation (after explicit founder approval)

a. **Supabase migration** — idempotent SQL to create `translation_sandwich_comparisons` table per Step 1 schema. Apply via SQL Editor; verify with `\d translation_sandwich_comparisons` (psql) or equivalent.

b. **Cost-tracker table** — idempotent SQL to create `translation_sandwich_cost_tracker` (single row, primary key `period_start` (date), columns `cumulative_cost_usd_microcents` (bigint default 0), `request_count` (int default 0), `cap_reached` (boolean default false), `cap_reached_at` (timestamptz nullable)).

c. **Route wiring** in `/website/src/app/api/reason/route.ts`:
   - Import the three translation-sandwich modules.
   - Read `process.env.TRANSLATION_SANDWICH_PARALLEL_RUN` at module load.
   - After the existing `enforceDistressCheck(...)` at line 144 + the existing `runSageReason(...)` call but before the response is constructed, conditionally fire the parallel translation-sandwich path inside `Promise.allSettled` with a deadline.
   - On settle, write a row to `translation_sandwich_comparisons` (try/catch; never propagate to user).
   - Increment cost-tracker; if cap reached, set `cap_reached = true` and short-circuit subsequent parallel calls.
   - Return the bundled-depth response unchanged.

d. **Phases 6 + 7 + 8 + 9 in the harness** — implement per ADR-004 §7.2. Phase 6 (end-to-end orchestration) calls all three modules + composes per ADR-004 §2.1. Phase 7 (R20a perimeter preservation) greps the route file for the distress check call + asserts it appears before any translation-sandwich import is referenced; runs the route handler directly (mock req/res) with a known-distress input + asserts the response is the redirect, NOT the parallel-run result. Phase 8 (fallback semantics) injects a Layer 1 throw + Layer 3 throw into the harness; asserts the bundled-depth result is returned + the failure is logged. Phase 9 (cost + latency reporting) sums per-layer latency + cost across the harness run + writes a summary table.

### Step 4 — Verify

```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/website" && npx tsc --noEmit -p . && echo "tsc clean"
```

```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/website" && npx tsx scripts/verify-translation-sandwich.ts
```

Expected: Phase 1 + Phase 2 + Phase 3 + Phase 4 + Phase 5 + Phase 6 + Phase 7 + Phase 8 + Phase 9 pass for all four fixtures. Per-run cost ~$0.20–0.60 (Phases 1+2+5 Sonnet; Phase 9 cost reporting reads from the harness run, not new calls).

```
grep -n "TODO: M1-CP" "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/website/scripts/verify-translation-sandwich.ts"
```

Expected: 0 matches (Phases 6 + 7 + 8 + 9 implemented this session).

Supabase verification:

```sql
SELECT count(*) FROM translation_sandwich_comparisons;
SELECT count(*) FROM translation_sandwich_cost_tracker;
\d translation_sandwich_comparisons
\d translation_sandwich_cost_tracker
```

Production smoke test (after Vercel deploys):

```
curl -X POST https://sagereasoning.com/api/reason \
  -H "Content-Type: application/json" \
  -d '{"input": "I keep checking my phone to see if she has replied."}' | head -100
```

Expected: bundled-depth response shape (existing keys); a row appears in `translation_sandwich_comparisons` within 1–2 seconds (parallel path completed).

### Step 5 — Append decision-log entry (FULL form, not lean)

Per cache §"Critical-risk sessions": Critical sessions use the **full** form with the additional sections — Verification Method Used, Risk Classification Record, PR5 Knowledge-Gap Carry-Forward, Founder Verification (Between Sessions), Orchestration Reminder.

ID: `D-M1-CP4-PARALLEL-RUN-WIRING-2026-05-XX`. Cross-references: ADR-004 §10 M1-CP4; ADR-007 §6 (fallback wiring); D-M1-CP3 + D-M1-CP2 + D-M1-CP1; the new Supabase migration files; the new env flag.

### Step 6 — Session close (FULL form)

Pattern: full close per existing protocol (encryption-wiring close as the precedent). Includes Verification Method Used, Risk Classification Record, PR5 Knowledge-Gap Carry-Forward, Founder Verification (Between Sessions), Orchestration Reminder. The next-session prompt at session close names M1-CP5 (Standard-tier — parallel-run observation + cutover decision; founder reads comparison data + decides cutover vs revise vs rollback; lean form applies).

## Part C — Anticipated session shape

| Phase | Estimate |
|---|---|
| Cache + predecessor close + ADR-004 §6+§7+§8+§9+§10 read + ADR-007 §6 read + manifest reads + route file read + sage-reason-engine read + decision log + knowledge-gaps register | 45–60 min |
| Step 0 — PR5 carry-forward disposition | 5–10 min |
| Step 1 — Surface decisions (5 items) + founder review | 30–45 min |
| Step 2 — Critical Change Protocol activation + named-risk approval | 20–30 min |
| Step 3 — Supabase migrations + route wiring + Phase 6+7+8+9 harness | 90–150 min |
| Step 4 verify (tsc + harness + Supabase + production smoke test) | 30–60 min |
| Decision-log (full form) + close (full form) | 45–60 min |
| **Total** | **~4–7 hours** |

If Step 1's decisions surface unexpected complications (e.g., the comparison table schema needs more thought; the cost-cap mechanism needs more design), defer Step 3 to M1-CP4b. Founder's call. Critical-tier sessions can be split safely.

## Part D — Critical Change Protocol activation

This section is the explicit Critical Change Protocol per project instructions §0c-ii. It is reproduced here so the founder can confirm engagement at session open, not discover it mid-session.

1. **What is changing** — `/api/reason` adds an internal call path running Layer 1 → Layer 2 → Layer 3 in parallel with the existing bundled-depth call. User receives bundled-depth result unchanged. New Supabase tables created. New env flag controls activation.

2. **What could break** — R20a perimeter could move or duplicate (Phase 7 catches); latency regression from a slow parallel call (deadline mitigates); comparison-table write failure propagating to user (try/catch mitigates); cost overrun (hard cap mitigates); env flag leaking to other routes (single-route check mitigates).

3. **What happens to existing sessions** — no effect during parallel-run. Response shape unchanged. M1-CP6 cutover is the breaking change for external API consumers; deprecation notice required at M1-CP5 → M1-CP6 transition.

4. **Rollback plan** — env flag → 0 + redeploy reverts the parallel path to dormant. `git revert` of wiring commit + push reverts to M1-CP3 state. Comparison table preserved for analysis. No data loss.

5. **Verification step** — bundled-depth response shape via curl; harness Phases 6+7+8+9 pass; Supabase row counts non-zero; comparison table reads show parallel path firing.

6. **Explicit founder approval** — required specific to named risks above. Generic approval insufficient. Staged approval acceptable.

The AI completes steps 1–5 visibly in the conversation at Step 2 of Part B before requesting step 6 approval.

## Rollback path

- The env flag `TRANSLATION_SANDWICH_PARALLEL_RUN=0` (or removed) → redeploy reverts the parallel path to dormant. Bundled-depth path unchanged. Vercel rebuild ~2 minutes.
- `git revert` of the route-wiring commit + push reverts `/api/reason` to its M1-CP3 state. Vercel rebuild ~2 minutes. Supabase tables remain (no DROP TABLE); comparison data preserved for analysis.
- Supabase tables can be dropped via SQL Editor with `DROP TABLE translation_sandwich_comparisons; DROP TABLE translation_sandwich_cost_tracker;` if the founder wants a full reversion. **AI must NOT perform table drops** — founder runs the SQL.

## Forecast

If M1-CP4 succeeds: route reaches Wired (parallel-run); harness Phases 1–9 all operational; comparison table accumulating data; cost tracker active; founder has the data infrastructure for the M1-CP5 cutover decision. Cumulative session count for M1: four of an estimated six to ten.

If Step 1's schema decision proves more involved than estimated, the session splits cleanly: M1-CP4a (Supabase migrations + ADR amendment for schema) + M1-CP4b (route wiring + harness). PR1 single-endpoint discipline favours this kind of subdivision.

If the harness Phase 7 (R20a perimeter preservation) fails on first run, this is a **HARD STOP** — the AI engages "I caused this" signal, surfaces the failure pattern, and the founder decides whether to revise the wiring (revert + retry) or escalate to a separate session. R20a perimeter regression is the highest-stakes failure mode in M1; AC5 + PR6 + AC4 all engage to prevent it.

PR5 carry-forward resolves at session open per Step 0. If promoted to permanent KG entry, the new entry is referenced in M1-CP4 + all subsequent sessions touching LLM JSON output.

End of prompt.
