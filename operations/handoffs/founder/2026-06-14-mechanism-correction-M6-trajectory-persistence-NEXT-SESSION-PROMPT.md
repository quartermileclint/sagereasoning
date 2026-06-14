# Next-Session Prompt — Mechanism-Correction Build M6: trajectory persistence (CI-5 — schema + write half)

**Stream:** founder. **Model:** Fable 5, maximum reasoning effort (arc default). **Environment:** Claude Code on the founder's machine; TEST Supabase for live verification; founder-performed steps walked live per PR17.
**Tier:** `schema` (Standard, idempotent additive migration) + `code-elevated` (a new awaited write on a Live route; the agent-identity-keyed history rows). **Standing guards (unchanged):** any touch of auth surfaces, the R20a branch/distress classifier, the A5 wrapper, or zone logic reclassifies **Critical**; **engine determinism is sacred** — the Assent engine's grade hysteresis and same-inputs→same-output property must be preserved (this half only WRITES history; it does not yet feed it back into the engine — that read/activation is M7). No production flag/config/migration activation inside the build (each is its own 0c-ii step).
**Governing frame:** `/adopted/standing-protocol-cache.md` + `/adopted/build-sessions-protocol-cache.md`. PR1 (single-endpoint proof on `/api/reason`); PR2 (same-session wire-verification); PR16 dogfood.
**Predecessor close:** `operations/handoffs/founder/2026-06-14-mechanism-correction-M5-practice-completion-close.md`.
**Predecessor decision-log entries:** `D-MECHANISM-CORRECTION-M5-PRACTICE-COMPLETION-BUILT-TEST-VERIFIED-2026-06-14`, `D-MECHANISM-CORRECTION-BUILD-PLAN-APPROVED-2026-06-12`.

## Why this session matters

CI-5 is the **continuity half of the Character-Kernel claim** and the arc's largest item. Today the agent path scores **statelessly per instance** (that is by design); what is *not* designed is the absence of a **readable longitudinal trajectory** (FX-6, dossier B5) — Rule 10's longitudinal inputs and the §4.8 profile have designed-but-unbuilt carriers. Until a trajectory is persisted and readable, the M5 CI-15 docs' "depth calibrated to **proximity** as well as stake" cannot be operational (CI-15 published it as principle only, naming this CI-5 dependency). **This session builds the SCHEMA + WRITE half**: persist per-consult assessment history, keyed to the credential's agent identity, additively and flag-gated — landing on the already-accepted carried-context fields **without yet activating the read** (that is M7, where the engine begins consuming the history as deterministic Rule-10 inputs). Splitting schema+write from read+activation keeps each half PR1-provable and keeps determinism out of the blast radius this session.

## The approved queue (work top-down)

| # | Session | Items | Status |
|---|---|---|---|
| 1–4 | M1–M4 | CI-1/2/3/6/7/8/9/10/11/12 + CI-4 write-boundary | **Done** (TEST/production per each close) |
| 5 | M5 — practice-completion | CI-4 reason-route half + CI-13 + CI-15 | **TEST-Verified 2026-06-14; production inert** |
| **→ 6** | **M6 — trajectory persistence (THIS PROMPT): CI-5 schema + write** | `evaluated_actions` + agent assessment-history table + awaited per-consult write (flag-gated, no read-back) | Schema + Elevated |
| 7 | M7 — trajectory activation | CI-5 read half — windowed carried-context as deterministic Rule-10 inputs; `direction_of_travel`/grade overlay; unlocks CI-15 proximity calibration | Elevated |
| 8 | M8 — credential consolidation **design** | CI-14 (ADR only; Critical track for any later build) | governance/Standard |
| — | **CI-16 (deferred)** | quick-tier value classification | **Parked** — gate-engine decision pending |

## Pre-conditions
1. The M5 commit(s) pushed; Vercel green (M5 behaviourally inert except the observation-length validator alignment).
2. `npx tsc --noEmit` passes at open.
3. TEST Supabase available (`.env.development.local`). For any TEST credential, mint via the CI-7 CLI (`npx tsx --env-file=.env.development.local scripts/mint-credential.ts`).
4. The AI does no git operations; founder commits by name at close.

## Part A — Open under the protocol (read order)
1. `/adopted/standing-protocol-cache.md` + `/adopted/build-sessions-protocol-cache.md`
2. This prompt; the M5 close
3. Build-plan item **CI-5 in full** (`operations/p1-rebuild-2026-06/mechanism-correction-build-plan.md` ~lines 49–56)
4. Fresh analysis **FX-6**; dossier row **B5**; the K1 composite-key ADR (`/adopted/.../2026-05-26-credential-scope-and-coverage-status.md` — agent identity governs the history key)
5. **Path-check discipline (verify before citing):** confirm `evaluated_actions` is the table the live Assent runs **in-memory** and is named Stage-A scope at `sage-reflect-product-design.md:357`; confirm the **already-accepted carried-context fields** `history_window` / `carried_profile` at `layer2-mechanisms.ts:2069-2078` (these are the fields M7 will read — this session writes the rows they will draw from, but does NOT wire the read); locate the `/api/reason` post-assessment seam where an awaited history write attaches (after the assessment is produced, alongside / mirroring the M1 narrative-retention awaited write — reuse that KG1-clean pattern); confirm D17 prior-state read semantics + the windowing (90d / last 30) for M7.
6. **KG scan:** **KG1** (the new history write MUST be awaited — no fire-and-forget; Vercel terminates after response — mirror the M1 retention write; no self-call); **KG7** (the history rows are JSONB — pass plain JS objects, no double-stringify); **KG2/AC1** (no model-selection change this half). **AC7 not engaged** (no auth surface); **R17a** (the history row is the subject agent's own record, keyed to its credential identity — isolation by construction) + **R17c analogue** (genuine deletion: the new table MUST be reachable by the existing `/api/user/delete` + `/api/user/export` paths — extend them, awaited).

Confirm at open: tier; hold-point (0h HELD); status vocabulary; signals; the determinism guard (this half writes only).

## Part B — Procedure

### Step 1 — Schema (Standard, idempotent additive)
Author the migration (founder applies on TEST first, production at its own 0c-ii step): (a) `evaluated_actions` per the Stage-A scope (the in-memory Assent table made durable); (b) the per-consult **agent assessment-history** rows keyed to the credential's agent identity (K1 composite key) — additive, nullable-friendly, with the retention columns (a `created_at`/window basis; R17c-deletable). Indexes for the M7 windowed read (by agent identity + date desc). RLS consistent with the existing agent-scoped tables (R17a — the subject reads only its own). **Idempotent** (`CREATE TABLE IF NOT EXISTS`, additive `CHECK`s); reversible by `DROP`.

### Step 2 — The awaited write (Elevated; PR1 on `/api/reason`)
Behind a flag (e.g. `SUBSTRATE_TRAJECTORY_WRITE_ENABLED`, UNSET = byte-identical, no write): at the post-assessment seam on `/api/reason`, **await** a write of the per-consult assessment-history row keyed to the credential's agent identity (KG1 rule 2 — no fire-and-forget; reuse the M1 retention awaited pattern; if the write fails, fail honest, do not strand the response — mirror the M1 election that the guarantee never rides on a write that didn't land). **The engine does NOT read this back this session** — determinism is untouched; `evaluated_actions` / the history table accumulate rows only. KG7 for the JSONB payload.

### Step 3 — Data rights (R17a + R17c analogue)
Extend `/api/user/delete` (R17c) + `/api/user/export` (R17i) to reach the new table(s) — awaited, so genuine deletion of an agent's assessment history is verifiable. R17a isolation asserted (an agent's credential reads/deletes only its own rows).

### Step 4 — Tests (plain-tsx per CLAUDE.md)
Flag-off byte-identity (no write, response unchanged); flag-on writes exactly one awaited history row per consult keyed to the agent identity (assert the await + the key); the JSONB shape (KG7); the deletion path removes an agent's rows; RLS/isolation (one agent cannot read another's). No engine-determinism test changes (the engine is untouched this half).

### Step 5 — Verify (PR2; founder-walked where environment-touching)
`npx tsc --noEmit`; tests; TEST live legs as elected: two consults on the same TEST agent credential → SQL row-count shows two history rows keyed to that agent; the response meta is **unchanged** (no read-back yet); the deletion path removes the agent's rows (SQL-verified). Production untouched (the migration + flag are founder-elected 0c-ii steps).

### Step 6 — Close (lean) + decision log (lean) + PR18
Status changes as earned; production-state rewrite at close; write the **M7 prompt** (the read + activation half — windowed carried-context as deterministic Rule-10 inputs; `direction_of_travel`/grade overlay honest on sparse evidence per the D17 CONFIDENCE_WEIGHTED bands; this is where determinism re-enters scope and where CI-15's proximity-calibrated depth becomes operational).

## What is NOT in scope
The **read/activation** of the history into the engine (M7 — the determinism-sensitive half); any change to the Assent engine's grade **hysteresis** or its same-inputs→same-output property; CI-16 (deferred); any production flag/config/migration activation (the M6 migration + write flag are founder-elected 0c-ii); the R20a perimeter / distress classifier / A5 wrapper / zone logic / auth surfaces; the M5 flag activations; the 0h call.

## Rollback
Schema: additive — `DROP` the new table(s) on revert. Write: flag-gated (`SUBSTRATE_TRAJECTORY_WRITE_ENABLED` UNSET = no write, byte-identical) or `git revert`. Data-rights extensions: `git revert` (additive deletion/export coverage).

## Anticipated session shape
| Phase | Estimate |
|---|---|
| Open + reads (incl. path-check + KG/R17 scan) | 25–35 min |
| Step 1 schema | 40–55 min |
| Step 2 awaited write (PR1) | 45–60 min |
| Step 3 data-rights extension | 25–35 min |
| Tests + TEST live legs (founder-walked) | 35–50 min |
| Close + M7 prompt | 25–30 min |
| **Total** | **~3.5–4.5 h** |

## Forecast
Success: the agent's assessment history persists durably, keyed to its credential identity, written awaited and flag-gated, with genuine deletion proven — and the engine still scores identically (no read-back yet, so determinism is untouched). That leaves **M7** (read + activation — the longitudinal trajectory feeding Rule 10, which also makes CI-15's proximity-calibrated depth operational), **M8** (CI-14 credential-consolidation design), and the parked **CI-16** as the remaining arc.

End of prompt. Open on `main`; production untouched except by founder election; founder performs every environment-touching step live (PR17); nothing activates without 0c-ii.
