# Next-Session Prompt — Mechanism-Correction Build M8: credential-consolidation design (CI-14 — ADR only) + the M6/M7 activation follow-ups

**Stream:** founder. **Model:** Fable 5, maximum reasoning effort (arc default). **Environment:** Claude Code on the founder's machine; documents-only session (no code path, no schema, no flag) unless the founder elects to scope the retention sweep as a small build.
**Tier:** `governance` (Standard — an ADR + design documents). **Standing guard:** CI-14 is **design-only in this arc** — *any* credential-build is its own later Critical session (AC7 + PR6 — auth surface; full 0c-ii). This session writes the ADR; it does not touch auth.
**Governing frame:** `/adopted/standing-protocol-cache.md` + `/adopted/build-sessions-protocol-cache.md`. PR15 (consult Anthropic primitives before bespoke); PR16 dogfood.
**Predecessor close:** `operations/handoffs/founder/2026-06-14-mechanism-correction-M7-trajectory-activation-close.md`.
**Predecessor decision-log entries:** `D-MECHANISM-CORRECTION-M7-TRAJECTORY-ACTIVATION-BUILT-TEST-VERIFIED-2026-06-14`, `D-MECHANISM-CORRECTION-M6-TRAJECTORY-PERSISTENCE-BUILT-TEST-VERIFIED-2026-06-14`, `D-MECHANISM-CORRECTION-BUILD-PLAN-APPROVED-2026-06-12`.

## Why this session matters

M1–M7 are built and TEST-Verified. **M8 is the last item in the approved mechanism-correction arc** — and it is a **design session**, not a build: an ADR reconciling the practice's three credential classes (`sr_inst_` per-install, `sr_live_` ecosystem API key, `sr_assent_` accreditation-write) against SR-14's *one-credential-across-the-agent's-practice* intent and the K1 composite-key ADR (`adopted/adr/2026-05-26-credential-scope-and-coverage-status.md`). It also lands the two **M6/M7 follow-ups** that the trajectory work surfaced and deferred here: (a) the `sr_live_`-owner gap — the legacy `/api/admin/api-keys` mint leaves `owner_user_id` null, which is why external-consumer trajectory rows are unreachable by the user-JWT data-rights paths; (b) the **trajectory-retention sweep** — the small cron that enforces `retain_until` for those null-owner rows, which **gates the M6-P2 production write-flag activation** (and therefore the M7 read activation). Designing the consolidation now means the credential build (whenever it runs, as its own Critical track) closes the FX-3/FX-17 regression class by construction.

## The approved queue (this is the tail)

| # | Session | Items | Status |
|---|---|---|---|
| 1–7 | M1–M7 | CI-1/2/3/4/5/6/7/8/9/10/11/12/13/15 + CI-17 | **Done** (TEST/production per each close) |
| **→ 8** | **M8 — credential-consolidation DESIGN (THIS PROMPT)** | CI-14 ADR (design only); + the `sr_live_`-owner backfill design; + the trajectory-retention-sweep scope | governance/Standard |
| — | **Trajectory-retention sweep** (named here; build is small) | enforce `retain_until` for null-owner external rows — **gates M6-P2 + M7 activation** | scope in M8; build its own step |
| — | **CI-16 (deferred)** | quick-tier value classification | **Parked** — gate-engine decision pending |
| — | Credential **build** (post-M8) | the consolidation itself | **Critical track**, its own session(s) |

## Pre-conditions
1. The M7 commit(s) pushed; Vercel green (M7 is behaviourally inert: the read flag is UNSET; the engine assessment is byte-identical).
2. No code/schema pre-condition (design session). `npx tsc --noEmit` should still pass at open (sanity).
3. The AI does no git operations; the founder commits by name at close.

## Part A — Open under the protocol (read order)
1. `/adopted/standing-protocol-cache.md` + `/adopted/build-sessions-protocol-cache.md`
2. This prompt; the M7 close + the M7 decision-log entry; the M6 close (for the null-owner R17c boundary, stated in full there)
3. Build-plan item **CI-14 in full** (`operations/p1-rebuild-2026-06/mechanism-correction-build-plan.md:121`)
4. **K1 composite-key ADR** (`adopted/adr/2026-05-26-credential-scope-and-coverage-status.md`) — the identity model the consolidation must respect
5. **Path-check (verify before citing):** the three credential classes and where each is minted/validated — `sr_live_` (`/api/admin/api-keys`, `validateApiKey`); `sr_inst_` (the A10 per-install mint + `validatePluginInstallToken`); `sr_assent_` (the accreditation-write path); plus the CI-7 mint CLI (`website/scripts/mint-credential.ts`). Confirm which mints set `owner_user_id` and which leave it null (the M6/M7 finding: the legacy admin mint leaves it null; the accreditation/install mints set it).
6. **PR15 — consult Anthropic primitives** before any bespoke credential design (the Plugin spec's per-install auth model; MCP server auth; managed-agent credentials) and the agentic-commerce findings tracker.

Confirm at open: tier (`governance`/Standard); hold-point (0h HELD); status vocabulary; that CI-14 build remains a separate Critical track.

## Part B — Procedure (proposed; design session refines)

### Step 1 — The ADR (CI-14): one credential across the practice
Write `adopted/adr/2026-06-14-credential-consolidation.md` (or the session's date): reconcile `sr_inst_` / `sr_live_` / `sr_assent_` against SR-14's one-credential intent + K1. State explicitly (CI-14 founder-verification): **the migration path for existing credentials** and **the FX-3 regression class it closes**. Name what stays separate and why (if anything). PR15: name the Anthropic primitive considered (Plugin per-install auth / MCP auth) and why bespoke, per any bespoke election.

### Step 2 — Fold the `sr_live_`-owner backfill (M6/M7 follow-up) into the design
Design (not build) the change that sets `owner_user_id` on `sr_live_` mints + the backfill for existing keys — so external-consumer trajectory rows become reachable by the data-rights paths (closing the M6 null-owner R17c boundary by construction rather than relying solely on `retain_until`). This is part of the consolidation ADR's migration path.

### Step 3 — Scope the trajectory-retention sweep (the M6-P2 gate)
Scope the small cron that hard-deletes `agent_assessment_history` rows past `retain_until` (mirrors the M1 narrative-sweep: `/api/cron/...` CRON_SECRET-gated, `vercel.json` entry). This is what **unblocks M6-P2** (the production write-flag activation) and therefore the M7 read activation. The founder may elect to **build it this session** (small, Standard — a cron + an indexed delete on `idx_aah_retain_until`) or keep M8 documents-only and build the sweep on its own step. Note: it does not touch auth → not the CI-14 Critical track.

### Step 4 — Name the activation sequence + close the arc
State the full activation order the founder now owns: trajectory-retention sweep → M6-P2 (`SUBSTRATE_TRAJECTORY_WRITE_ENABLED` in production) → M7 read (`SUBSTRATE_TRAJECTORY_READ_ENABLED`) → optionally the CI-15 docs-flip (conditional→operational) + the M1/M3/M4/M5 staged-doc/flag activations. Confirm **CI-16 stays parked** (the gate-engine architecture decision).

### Step 5 — Close (lean) + decision log (lean) + PR18
Status changes as earned; production-state rewrite at close (unchanged unless the sweep is built + activated). This **closes the mechanism-correction build arc** (CI-1…CI-17 designed/built; the only remaining *builds* are the credential consolidation on its Critical track, the retention sweep, and the parked CI-16).

## What is NOT in scope
The credential **build** itself (CI-14 build = its own Critical session, AC7 + PR6); any auth-surface / R20a / signing change; CI-16; the M7/M6 production flag activations (founder-elected 0c-ii); the 0h call.

## Rollback
Design documents — `git revert`. If the founder elects to build the retention sweep: flag/cron-gated + `git revert`; the delete is bounded by `retain_until` and indexed (`idx_aah_retain_until`).

## Forecast
Success: an adopted ADR that gives the credential build a clear migration path closing FX-3/FX-17; the `sr_live_`-owner backfill designed; the trajectory-retention sweep scoped (or built) so the M6-P2 + M7 activations are unblocked; CI-16 confirmed parked. That **closes the mechanism-correction arc** — the remaining work is the founder-elected activations and the credential build on its own Critical track.

End of prompt. Open on `main`; production untouched except by founder election; the AI does no git operations; nothing activates without 0c-ii.
