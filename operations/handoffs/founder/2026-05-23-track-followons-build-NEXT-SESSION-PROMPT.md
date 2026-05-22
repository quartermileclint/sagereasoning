# Next-Session Prompt — Track follow-ons BUILD arc (A3-gov → A2 → A4 → A1, then C rename, then E)

**Stream:** founder.
**Tier:** opens at **`code-elevated`** for the A-track (the day's default scope). The C rename is **`code-critical`** and runs as its own arc; E varies per item. Re-declare tier per step.
**Governing frame:** `/adopted/standing-protocol-cache.md` + `/adopted/build-sessions-protocol-cache.md` ("no current users" holds — founder + test logins only; Critical Change Protocol step 3 = N/A).
**Predecessor session close:** `/operations/handoffs/founder/2026-05-23-track-election-design-pack-close.md` (read the **Founder Decisions** section — the elections are locked there).
**Predecessor decision-log entry:** `D-TRACK-FOLLOWONS-DESIGN-PACK-2026-05-23`.
**Deliverable-of-the-day (read in full):** `/drafts/2026-05-23-track-followons-design-pack.md` — read the section for the step you're building.
**Risk classification:** A-track = **Elevated** under 0d-ii (changes to existing user-facing functionality + a schema change to an existing table; PEV loop per PR10; no auth/encryption/safety/deploy-config surface → not Critical; PR6 NOT engaged). C = **Critical** (Critical Change Protocol applies — see Part B Step 5). 

## Locked decisions (from the 2026-05-23 review — do not re-litigate)
- **A3 = (a):** the two-signal harm-flag carrier is canonical. Governance-only; no code change.
- **A1 / A2 / A4:** greenlit to build, order **A2 → A4 → A1**. A1 must land **before** C.
- **C:** approved, **full internal + external** rename ("Sage Assent" replaces "Agent Trust Layer" everywhere, including the wire-format contract). Critical multi-session arc. `D-ATL-*` decision IDs stay as-is.
- **E:** nothing deferred — all five Sage Calling follow-ons in scope; **#4 is build-blocked** until the wrapper observability surface exists; #2/#5/#3 are buildable but gated in *effect* on conditions that don't yet hold.
- **F:** founder-run cleanup (see the design pack's Track F).
- **Carried:** the founder's held **"something else"** — surface it at session open before building if it changes scope.

## Why this session matters
Sage Reflect is Live/Verified (gated) but feeds the engine empty cross-session context and rounds sub-cent cost to zero; A1/A2/A4 make the live product faithful to its own design. These must land before the C rename so C renames finished code once. The session hardens the fourth Sage Practice product, then opens the pre-launch rename arc.

## Pre-conditions (confirm at open)
1. Predecessor close + `D-TRACK-FOLLOWONS-DESIGN-PACK-2026-05-23` committed + pushed; working tree clean; no `.git/index.lock`.
2. Production unchanged: `SAGE_REFLECT_ENABLED=true`; `MENTOR_ENCRYPTION_KEY` set; substrate A7 Verified; A10 Live + Verified; Sage Calling Live (gated); Layer-3 + R20a substrate gates UNSET.
3. `cd website && npm install` if a clean checkout (tsx is a devDependency); run verification commands one at a time; the two Supabase-importing tests need `npx tsx --env-file=.env.local` (per `/CLAUDE.md`).
4. F cleanup ideally done (not blocking the build).

## Part A — Open under the protocol
Read in order:
1. `/adopted/standing-protocol-cache.md` (~3 min — tier, model selection, risk class, signals, status vocab).
2. `/adopted/build-sessions-protocol-cache.md` (~3 min — build-arc context; "no current users").
3. `/operations/handoffs/founder/2026-05-23-track-election-design-pack-close.md` (Founder Decisions).
4. `/operations/decision-log.md` — last 2 entries.
5. `/drafts/2026-05-23-track-followons-design-pack.md` — the section for the step being built.

Confirm at open: tier; hold-point (P0 0h active); **model selection (PR4)** — A2/A4 Layer-1 = **Sonnet** (`MODEL_DEEP`, cache "Layer 1 translation = Sonnet"); A1 makes **no LLM call** (schema + read); status vocabulary; signals/risk class. **PR15 consult** (`.claude/skills/anthropic/` + the agentic-commerce findings tracker) before each build step — the load-bearing reuse is SageReasoning's own substrate (`getClient`/`sonnetCostMicrocents`/the Sage-Assent feed), justified per the design pack.

## Part B — Build sequence

### Step 0 — A3(a) governance micro-step (Standard)
Update `/adopted/sage-reflect-product-design.md` SR-9 to state the canonical harm-flag carrier explicitly: the boundary engages when `safety_signal.harm_flagged === true` OR any `acts_blocked[].category === 'harm'`. The design doc is LOCKED — the founder approved this edit at the 2026-05-23 gate (on record in the predecessor close); preserve the prior text per the version-preservation rule (note the change inline or via the doc's change log). No code change. Log under the session's decision-log entry.

### Step 1 — A2 microcent cost-health (Elevated, PEV)
Per design-pack §A2. Keep the integer-cents loop bill unchanged; add a microcent-precise accumulator (mirror the substrate `incrementCostTracker`; `sonnetCostMicrocents` already returns pre-rounding microcents). Files: `route.ts` `makeMeter` (add accumulator alongside `recordLoopBilling`), a cost-tracker module/RPC, the R5 cost-health reader. **Extra caution: this is the path that had two defects on 2026-05-22 — additive only, deliberate verify.** Verify: a multi-call pass's accumulated microcents ÷ 10000 == sum of per-call `usageToCents`; integer bill unchanged; suites green.

### Step 2 — A4 Q5 sandwich-escalation (Elevated, PEV)
Per design-pack §A4. Add `extractQ5` (Sonnet) + an ambiguity detector; run `buildQ5Deterministic` first, escalate only when ambiguous. **Updates the documented cost bound from ≤4 to ≤5 Layer-1 calls/pass** — update `reflect-extractor.ts` header + the design doc; A2's precise cost-health should be in place first. Files: `reflect-extractor.ts` (+`Q5_SYSTEM`), `reflect-service.ts` (Q5 branch bills the escalation), tests. Verify: explicit-change Q5 releases the FD-R2 hold; unchanged makes no 5th call (assert call count ≤5).

### Step 3 — A1 cross-session context (Elevated — schema + open-path read)
Per design-pack §A1. Schema: add `complexity int` + `calibration_all_correct boolean` to `sage_reflect_sessions`, written at completion (`persistCompletion`). Open-path: replace `buildContext`'s hardcoded `[]`/`0` with a query of the last 3 completed rows for the agent (map to `PriorSessionSummary{complexity, q1_clean from phantasia log, failures from synkatathesis log}`) + a streak walk over `calibration_all_correct`. **Fail-closed: a read failure degrades to the current empty context, never a 503.** Confirm `PriorSessionSummary.failures` mapping against `engine.ts` at build. Verify: new columns populate at completion; a third clean session trips the Q1 3-null flag / FD-R2 hold; suites green.

### Step 4 — Decision-log + close (lean form per the standing cache)
Append one lean entry covering Steps 0–3 (or whichever landed). Lean session close. If the session ends mid-arc, the close's "Next Session Should" names the next step.

### Step 5 — C rename arc (CRITICAL — its own session(s); do NOT start mid-A-track)
Per design-pack §C, full internal+external. Phase 1 internal identifiers (Elevated) → Phase 2 docs/registry (Standard) → **Phase 3 external/wire-format (Critical Change Protocol, visible before deploy):** the `sr_atl_` prefix (dual-accept window; lowest-cost now — zero live credentials), the `atl_write` DB scope (data migration + constraint/index/trigger recreation), the agent-card extension-URI version bump, the public copy (limitations page, agent-card, ops-hub). Fold the SR-15 per-domain reconciliation into Phase 1/2. Sequence after A1.

### Step 6 — E follow-ons (per item)
E#1 persist the Agent-Card verification verdict (code-elevated) — the one worth doing pre-launch. E#2/#3/#5 buildable but effect-gated; E#4 build-blocked on the wrapper observability surface.

## Part C — Anticipated session shape (the A-track first session)
| Phase | Estimate |
|---|---|
| Caches + predecessor close + design-pack §A read | 15–20 min |
| Step 0 A3(a) SR-9 update | 10–15 min |
| Step 1 A2 (build + verify) | 45–70 min |
| Step 2 A4 (build + verify) | 45–70 min |
| Step 3 A1 (schema + read + verify) | 60–90 min |
| Decision-log + close | 20–30 min |
| **Total (A-track)** | **~3.5–5 hours — may split across two sessions; founder elects the day's bite at open** |

C is a separate Critical arc (multi-session); E#1 is ~1 short session.

## Rollback path
A-track is all reversible: A2 remove the accumulator (bill untouched); A4 remove the conditional call (reverts to conservative Q5); A1 `ALTER TABLE ... DROP COLUMN` + revert the read (fail-closed means a bad read already degrades safely). Sage Reflect remains reversible end-to-end by unsetting `SAGE_REFLECT_ENABLED` (→ 503, no redeploy). C Phase 3 carries its own Critical rollback (dual-accept window; revert the migration) — defined in that session's Critical Change Protocol.

## Forecast
Success = Sage Reflect feeding the engine real cross-session data, a faithful R5 cost signal, and Q5 able to confirm genuine change — the live product matching its design. Then the C rename retires "Agent Trust Layer" for "Sage Assent" across the surface (the pre-launch positioning + wire-format cleanup), and E#1 sharpens Sage Calling. The order is A-track → C → E, with the founder electing each session's scope at open. The held "something else" is surfaced first if it reorders any of this.

End of prompt. Opens as a `code-elevated` A-track build session (re-declare to `code-critical` for the C arc). Baseline: Sage Reflect Live/Verified (gated) — stable known-good.
