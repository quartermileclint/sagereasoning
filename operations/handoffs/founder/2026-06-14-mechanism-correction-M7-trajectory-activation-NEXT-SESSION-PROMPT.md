# Next-Session Prompt — Mechanism-Correction Build M7: trajectory activation (CI-5 — read + activation half)

**Stream:** founder. **Model:** Fable 5, maximum reasoning effort (arc default). **Environment:** Claude Code on the founder's machine; TEST Supabase for live verification; founder-performed steps walked live per PR17.
**Tier:** `code-elevated` (an engine **read-path** change on a Live route: the windowed carried-context becomes a deterministic Rule-10 input, and the response surfaces a trajectory overlay). **Standing guards (unchanged):** any touch of auth surfaces, the R20a branch/distress classifier, the A5 wrapper, or zone logic reclassifies **Critical**. **Engine determinism is sacred and is the whole risk of this half:** the Assent engine's grade **hysteresis** and its **same-inputs→same-output** property must be preserved — the resolution is that the stored history becomes *part of the inputs* (D17 prior-state read), so "same inputs" now includes the supplied/stored context: same `(input + stored context)` → byte-identical output. No production flag/config/migration activation inside the build (each is its own 0c-ii step).
**Governing frame:** `/adopted/standing-protocol-cache.md` + `/adopted/build-sessions-protocol-cache.md`. PR1 (single-endpoint proof on `/api/reason`); PR2 (same-session wire-verification); PR16 dogfood.
**Predecessor close:** `operations/handoffs/founder/2026-06-14-mechanism-correction-M6-trajectory-persistence-close.md`.
**Predecessor decision-log entries:** `D-MECHANISM-CORRECTION-M6-TRAJECTORY-PERSISTENCE-BUILT-TEST-VERIFIED-2026-06-14`, `D-MECHANISM-CORRECTION-BUILD-PLAN-APPROVED-2026-06-12`.

## Why this session matters

M6 made the agent's per-consult trajectory **durable** (the `agent_assessment_history` table; the awaited, flag-gated, credential-keyed write) — but **write-only**: the engine still scores statelessly per instance. M7 is where the **continuity claim becomes real and determinism re-enters scope**: the engine reads a windowed slice of the credential's own stored history (D17 prior-state, 90d / last-30) as the **already-accepted but inert** carried-context fields (`history_window`, `carried_profile` — `layer2-mechanisms.ts:2069-2078`), feeds them through Rule 10's longitudinal inputs, and surfaces a `direction_of_travel`/grade overlay that is **honest on sparse evidence** (CONFIDENCE_WEIGHTED low / `single_snapshot` per D17). This is also what makes **CI-15's "depth calibrated to proximity as well as stake" operational** — proximity-calibrated depth presupposes a readable trajectory, which M6 created and M7 reads. Splitting read from write (M6→M7) kept determinism out of M6's blast radius; M7 takes it on deliberately, with the byte-identity property re-expressed over the enlarged input set.

## The approved queue (work top-down)

| # | Session | Items | Status |
|---|---|---|---|
| 1–5 | M1–M5 | CI-1/2/3/6/7/8/9/10/11/12/13/15 + CI-4 both halves | **Done** (TEST/production per each close) |
| 6 | M6 — trajectory persistence (schema + write) | CI-5 schema + awaited write + data-rights | **TEST-Verified (assertion-level) 2026-06-14; production-inert** |
| **→ 7** | **M7 — trajectory activation (THIS PROMPT): CI-5 read half** | windowed carried-context as deterministic Rule-10 inputs; `direction_of_travel`/grade overlay; unlocks CI-15 proximity calibration | Elevated |
| 8 | M8 — credential consolidation **design** | CI-14 (ADR only; Critical track for any later build) | governance/Standard |
| — | **CI-16 (deferred)** | quick-tier value classification | **Parked** — gate-engine decision pending |

## Pre-conditions
1. The M6 commit(s) pushed; Vercel green (M6 is behaviourally inert: write flag UNSET; data-rights routes no-op on the missing table).
2. **The M6 migration applied on TEST** (`20260614_m6_agent_assessment_history.sql`) and **rows accumulating** there — set `SUBSTRATE_TRAJECTORY_WRITE_ENABLED=true` in `.env.development.local` and run a few consults so M7's read has data. (Production migration/flag stay off — own 0c-ii steps.)
3. `npx tsc --noEmit` passes at open.
4. The AI does no git operations; founder commits by name at close.

## Part A — Open under the protocol (read order)
1. `/adopted/standing-protocol-cache.md` + `/adopted/build-sessions-protocol-cache.md`
2. This prompt; the M6 close + the M6 decision-log entry
3. Build-plan item **CI-5 in full** (`operations/p1-rebuild-2026-06/mechanism-correction-build-plan.md`) — parts (3) + (4): activate `history_window`/`carried_profile` as Rule-10 inputs; surface `direction_of_travel`/grade overlay honestly
4. **D17 read semantics + windowing** (`adopted/rag-mentor-alt3/progression-delta.md`): `window_days: 90`, `max_instances: 30`; the CONFIDENCE_WEIGHTED bands (low `<3` domain-matched or window `<14d`; medium; high `≥10` and `≥60d`); the `direction: improving|stable|declining` + delta-signals vocabulary; `single_snapshot` on sparse evidence (AC-17)
5. **Path-check discipline (verify before citing):**
   - The M6 store + table: `website/src/lib/substrate/agent-assessment-history-store.ts` (the read side — add a windowed reader keyed by `credential_ref` first, `agent_id` when present, `created_at >= now()-90d`, `ORDER BY created_at DESC LIMIT 30`) and `20260614_m6_agent_assessment_history.sql` (the `idx_aah_credential_time` / `idx_aah_agent_time` indexes exist for exactly this read). **M7 windows by `credential_ref`** (the universal key — `agent_id` is often null for external `sr_live_` consumers); prefer `agent_id` only when present.
   - The window aggregator **`computeWindowSnapshot(agentId, actions: EvaluatedAction[], totalLifetime, config)`** (`trust-layer/evaluation-window/window-aggregator.ts`) — reuse it (PR15); reconstruct `EvaluatedAction[]` from the stored rows with a `rowToEvaluatedAction`-style mapper mirroring `evaluated-actions-store.ts:rowToEvaluatedAction` (KG7 `Array.isArray` guard).
   - The **inert carried-context fields** `history_window` / `carried_profile` at `layer2-mechanisms.ts:2069-2078` ("Layer 2 does NOT yet act on them") — M7 makes Layer 2 act on them as Rule-10 inputs. Confirm the exact shape the engine expects so the stored trajectory maps onto it without inventing a new schema.
   - **The `is_kathekon` null→false note (carried from the M6 review):** the M6 rows store `is_kathekon` with the bridge's `?? false` narrowing, so a stored `false` means *either* "assessed not-appropriate" *or* "undecidable". When M7 computes `kathekon_compliance_rate`/overlays, treat `false` as the union (do not claim precision the evidence lacks) — document it where the rate is surfaced.
6. **KG scan:** **KG1** (any new read is awaited; no fire-and-forget; the read is on the hot path so budget its latency — one indexed windowed query); **KG2/AC1** (no model-selection change — the read is deterministic, no LLM); **KG7** (reconstruct JSONB arrays with the `Array.isArray` guard, not a blind cast). **AC7 not engaged** (no auth surface). **R17a** (read only the subject credential's own rows). **Determinism:** the read must be a **pure function of the stored rows + the request** — no clock-dependent or order-nondeterministic aggregation that would break byte-identity on replay (the aggregator is already pure over an `EvaluatedAction[]`; ensure the row ordering fed to it is deterministic).

Confirm at open: tier; hold-point (0h HELD); status vocabulary; signals; **the determinism guard re-expressed over the enlarged input set** (same `input + stored context` → byte-identical output; hysteresis stays the Assent engine's).

## Part B — Procedure (proposed; build session refines)

### Step 1 — The windowed reader (Standard read; reuse the aggregator)
Add `getTrajectoryWindow(credentialRef | agentId)` to the M6 store: the D17 windowed read (90d / last-30, date desc), keyed by `credential_ref` (or `agent_id` when present), reconstructing `EvaluatedAction[]` (KG7 guard), plus a lifetime count for the snapshot. Feed `computeWindowSnapshot` unchanged. **Awaited; flag-gated** by a NEW read flag (e.g. `SUBSTRATE_TRAJECTORY_READ_ENABLED`, UNSET = no read, byte-identical) — separate from the M6 write flag so read can activate after write has accumulated data.

### Step 2 — Activate the carried-context as Rule-10 inputs (Elevated; PR1 on `/api/reason`)
Behind the read flag: at `/api/reason`, before the assessment, populate `history_window` / `carried_profile` from the windowed read (the credential's own stored trajectory — R17a), and make Layer 2 **act** on them per Rule 10's longitudinal inputs (`operationalised-rules.md:589`) + D17 prior-state. **Determinism:** the engine output is now a function of `(layer1 features + carried context)`; assert byte-identity holds for a fixed `(input, stored-window)` pair. The grade **hysteresis** stays inside the Assent engine — M7 supplies evidence, it does not move grades directly.

### Step 3 — Honest trajectory overlay (Elevated; the response surface)
Surface `direction_of_travel` + the grade overlay on the `/api/reason` response **honestly**: CONFIDENCE_WEIGHTED `low` / `single_snapshot` on sparse evidence (the D17 bands), `prior_instances`/window count in `meta`, the delta-signals vocabulary. This is the first M-half that **changes the response shape** (M6 added nothing) — flag-gated so UNSET = byte-identical; R18e/honesty: never claim a trend a single instance can't support.

### Step 4 — CI-15 proximity-calibrated depth becomes operational
With the trajectory readable, wire the CI-15 principle (M5 staged docs) so depth is calibrated to **proximity as well as stake** — the gate/consult can read the credential's typical_proximity from the window to inform depth. Confirm against the M5 staged-docs contract (verbatim-faithful). Scope-guard: this is the depth-*selection* input, not a change to the depth scope mapping (methodology — untouchable).

### Step 5 — Tests (plain-tsx per CLAUDE.md)
Read-flag-off byte-identity (no read, response + engine output unchanged); the windowed reader (90d/last-30, ordering, KG7 reconstruction); **engine determinism: same `(input, stored window)` → byte-identical assessment** (the load-bearing test — extend the existing canonical-JSON/byte-identity suite); sparse-evidence honesty (1 prior → `single_snapshot`/low); R17a isolation (one credential's window never includes another's rows).

### Step 6 — Verify (PR2; founder-walked where environment-touching)
`npx tsc --noEmit`; tests; TEST live legs: with the write flag on (M6) accumulate ≥2 consults on one TEST credential, then with the read flag on a third consult shows `prior_instances ≥ 2` + `confidence_weighted: low` + an honest `direction_of_travel`; a fresh credential shows `single_snapshot`. Production untouched (migration + both flags are founder-elected 0c-ii steps).

### Step 7 — Close (lean) + decision log (lean) + PR18
Status changes as earned; production-state rewrite at close. Name the remaining arc: **M8** (CI-14 credential-consolidation design — which also folds the M6 follow-up: setting `owner_user_id` on `sr_live_` mints + backfill), the **trajectory-retention sweep** (enforce `retain_until` for null-owner external rows — the M6 R17c follow-up), and the parked **CI-16**.

## What is NOT in scope
Any change to the Assent engine's grade **hysteresis** or the methodology depth-scope mapping; CI-16 (deferred); the M6 follow-ups proper (the retention sweep + the `sr_live_` owner backfill are **named** here but built on their own — the sweep is a small cron, the backfill rides M8); any production flag/config/migration activation (M6's + M7's are founder-elected 0c-ii); the R20a perimeter / distress classifier / A5 wrapper / zone logic / auth surfaces; the 0h call.

## Rollback
Read path: flag-gated (`SUBSTRATE_TRAJECTORY_READ_ENABLED` UNSET = no read, byte-identical) or `git revert`. The overlay: same flag. No schema change in M7 (M6's table already exists); if M7 adds an index for the read it is additive (`DROP` on revert).

## Anticipated session shape
| Phase | Estimate |
|---|---|
| Open + reads (incl. path-check + D17 + KG/determinism scan) | 30–40 min |
| Step 1 windowed reader | 30–40 min |
| Step 2 carried-context activation (PR1; the determinism-sensitive core) | 50–70 min |
| Step 3 honest overlay | 30–45 min |
| Step 4 CI-15 proximity-calibrated depth | 25–40 min |
| Tests (incl. the byte-identity-over-enlarged-input test) + TEST legs (founder-walked) | 40–55 min |
| Close + arc-tail prompt | 25–30 min |
| **Total** | **~4–5 h** |

## Forecast
Success: the agent's own stored trajectory is read back into the engine as deterministic Rule-10 inputs, the response carries an honest `direction_of_travel`/grade overlay (sparse-evidence-truthful), CI-15's proximity-calibrated depth is operational — and the engine still produces byte-identical output for a fixed `(input, stored window)`, hysteresis intact. That closes CI-5 (the Character-Kernel continuity claim) and leaves **M8** (CI-14 design + the `sr_live_`-owner follow-up), the **trajectory-retention sweep**, and the parked **CI-16** as the remaining arc.

End of prompt. Open on `main`; production untouched except by founder election; founder performs every environment-touching step live (PR17); nothing activates without 0c-ii.
