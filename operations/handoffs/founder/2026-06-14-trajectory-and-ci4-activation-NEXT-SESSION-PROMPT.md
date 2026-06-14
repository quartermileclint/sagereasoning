# Next-Session Prompt — Trajectory activation (sweep → M6-P2 write → M7 read) + the CI-4 sub-order (reason-route → write-boundary)

**Stream:** founder. **Model:** Fable 5, maximum reasoning effort (arc default). **Environment:** Claude Code on the founder's machine (production reachable; the Cowork sandbox cannot reach production — run this in Claude Code).
**Tier:** **`code-critical`** — this session **builds one small route** (`code-standard`) and then **activates production flags + deployment config** (Critical per 0d-ii: "env flags activating new surfaces"; a new production write surface; a deployment-config cron). **Full templates + the Critical Change Protocol (0c-ii) apply** — do NOT use the lean form.
**Governing frame:** `/adopted/standing-protocol-cache.md` + `/adopted/build-sessions-protocol-cache.md`. PR17 (every founder-performed step walked LIVE, not handed off). PR18 at close.
**Predecessor close:** `operations/handoffs/founder/2026-06-14-mechanism-correction-M8-credential-consolidation-close.md`.
**Predecessor decision-log entries:** `D-MECHANISM-CORRECTION-M8-CREDENTIAL-CONSOLIDATION-DESIGN-2026-06-14`, `D-MECHANISM-CORRECTION-M7-TRAJECTORY-ACTIVATION-BUILT-TEST-VERIFIED-2026-06-14`, `D-MECHANISM-CORRECTION-M6-TRAJECTORY-PERSISTENCE-BUILT-TEST-VERIFIED-2026-06-14`, `D-MECHANISM-CORRECTION-M6-P1-PRODUCTION-MIGRATION-2026-06-14`.
**Build spec for the one code deliverable:** `operations/p1-rebuild-2026-06/trajectory-retention-sweep-scope.md`.

---

## ⛔ THE INVIOLABLE ORDER (the whole reason this prompt exists)

> **Chain B1 (trajectory) — this order is mandatory:**
> **1. build + activate the retention sweep → 2. M6-P2 (WRITE flag) → 3. M7 (READ flag).**
> **The hard rule: the sweep must be BUILT, FLAGGED ON, and SCHEDULED before `SUBSTRATE_TRAJECTORY_WRITE_ENABLED` is set in production.** The sweep is the R17c genuine-deletion gate for the null-owner external-consumer rows the write flag starts creating; flip WRITE first and those rows accumulate with no enforced `retain_until` deletion — the exact gap M6-P2 is held for.
>
> **Chain B2 (CI-4) — this order is mandatory:**
> **4. M5 CI-4 reason-route flag → 5. M3 CI-4 write-boundary gate (flag/detect mode only).**
> **The hard rule: activate the reason-route half first.** The write-boundary gate validates loop closure by READING the `examination.{ref,depth_tier,prior_feedback_ref}` markers the reason-route half writes into the signed assessment; enable the gate first and it gates against markers that don't exist yet.
>
> **B1 and B2 are independent of each other** — you may do B2 before B1, or in a separate session. Only the order *within* each chain is load-bearing. **Every flag is byte-identical when UNSET; rollback is always "unset the flag."** You may stop at any numbered checkpoint and resume later — each step is its own atomic 0c-ii micro-activation.

---

## Why this session matters

M1–M8 are built and TEST-Verified; the mechanism-correction arc is design-complete. This session turns on the **trajectory** feature (M6 persistence + M7 overlay — built, TEST-Verified, production-inert) and the **CI-4 loop-closure** affordance (M5 reason-route + M3 write-boundary — built dark), in the only orders that are safe. Nothing here is novel code except the small retention sweep; everything else is flag activation under the Critical protocol.

## Pre-conditions (verify at open — do not assume)
1. The M8 commit is pushed and Vercel is green (confirmed by the founder).
2. `agent_assessment_history` is **already migrated on production** (M6-P1, inert) **and TEST** — **no table migration is needed this session.** Confirm via the SQL editor (table present; the 6 indexes incl. `idx_aah_retain_until`).
3. `CRON_SECRET` is set in production (already used by `/api/cron/observability`). Confirm.
4. **Path-check the exact env-var names in code before flipping anything** (do not trust this prompt's names blind):
   - sweep flag: `SUBSTRATE_TRAJECTORY_SWEEP_ENABLED` (created by the Step-1 build per the scope doc)
   - M6 write: `SUBSTRATE_TRAJECTORY_WRITE_ENABLED` (grep `agent-assessment-history-store.ts`)
   - M7 read: `SUBSTRATE_TRAJECTORY_READ_ENABLED` (grep `agent-assessment-history-store.ts`)
   - M5 CI-4 reason-route: `SUBSTRATE_REASON_LOOP_CLOSURE_ENABLED` (grep `api/reason/route.ts`)
   - M3 CI-4 write-boundary: `SUBSTRATE_LOOP_CLOSURE_GATE_ENABLED` + `SUBSTRATE_LOOP_CLOSURE_GATE_REJECT` (grep the accreditation write path) — **confirm the exact spellings; correct this prompt if they differ.**
5. The AI does **no git operations and no production changes** — the founder commits by name and performs every Vercel/Supabase action; the AI builds the sweep code and **walks each activation live (PR17)**, verifying the founder's reported output before the next step.

## Part A — Open under the protocol (read order)
1. `/adopted/standing-protocol-cache.md` + `/adopted/build-sessions-protocol-cache.md`
2. This prompt; the M8 close
3. The **M6 close** + `D-MECHANISM-CORRECTION-M6-P1-PRODUCTION-MIGRATION-2026-06-14` (the P2 activation checklist + the null-owner R17c boundary) and the **M7 close** open-questions (the named TEST verification legs for WRITE→READ)
4. The **M5 close** + the **M3 close** (the CI-4 reason-route + write-boundary flags, and the "flag mode then reject by its own step" note)
5. The sweep build spec: `operations/p1-rebuild-2026-06/trajectory-retention-sweep-scope.md`
6. Path-check the flag names + the current env state (pre-condition 4)

Confirm at open: tier (`code-critical`); hold-point (0h HELD — these are R&D-phase activations, permissible under the hold, but none resolves 0h); model; status vocabulary; that the AI does no git/production ops (PR17 walkthrough).

## Critical Change Protocol (0c-ii) — covering every activation below
1. **What is changing (plain language):** one new internal cron route (the retention sweep) ships; then five production env flags are turned on in sequence, each adding an already-built, additive, flag-gated behaviour (a retention purge; per-consult trajectory persistence; an honest trajectory overlay on the `/api/reason` response; the loop-closure re-examination affordance; the write-boundary loop-closure detector).
2. **What could break (specific failure modes):**
   - Sweep: a failed `DELETE` is caught and returned in the cron's JSON (no user-facing impact; no fail-closed). A mis-scoped predicate could over-delete — mitigated: the predicate is **only** `retain_until < now()` (no owner narrowing, no operator-supplied scope), indexed by `idx_aah_retain_until`.
   - M6-P2 write: the write is **awaited + fail-honest** — a write failure is logged and the `/api/reason` response is unaffected (does **NOT** fail closed; contrast CI-10). Determinism untouched (write-only; the engine never reads it).
   - M7 read: the read is **one awaited indexed query, fail-honest** — a failure yields no overlay; the **engine assessment is byte-identical** regardless (the overlay is additive `meta.trajectory`). The whole risk is determinism, already TEST-asserted byte-identical for a fixed window.
   - CI-4 reason-route: adds optional fields to the response **and** the signed Layer-2 assessment (`examination.*` markers). Risk: the signed-payload shape changes — **verify the production signing state on TEST first** (the M5 build hit + resolved a signing-flag-without-key 503; signing algorithm/keys are untouched — CI-4 only adds an optional field).
   - CI-4 write-boundary (flag/detect mode, `_REJECT` UNSET): only **flags** unclosed chains (`enforced:false`) — it cannot reject a legitimate write. The R18f provenance gate is untouched.
3. **What happens to existing sessions:** **N/A** — only founder + test logins exist (no third-party sessions to invalidate; build-cache governing note).
4. **Rollback:** every step = **unset the flag** (byte-identical) and/or `git revert` the sweep code / the `vercel.json` cron entry. No schema to unwind (the table already exists). Detailed per-step below.
5. **Verification:** each step has an explicit TEST-then-production verification with expected output (below). No step proceeds until the prior verifies.
6. **Explicit founder approval per named risk:** the AI states each step's specific risk and gets the founder's go before that flip. The one risk to name aloud at M6-P2: rows begin accruing with a 90-day `retain_until`, enforced only by the sweep activated in Step 2.

---

## Part B1 — The trajectory chain (mandatory order)

### Step 1 — Build the retention sweep (`code-standard`; AI builds, founder commits)
Per `trajectory-retention-sweep-scope.md`: the route `GET /api/cron/trajectory-retention-sweep` (CRON_SECRET gate copied from `narrative-sweep/route.ts:58-68`; honest `flag_enabled:false` 200 when the sweep flag is unset), `purgeExpiredTrajectory()` added to `agent-assessment-history-store.ts` (`.from('agent_assessment_history').delete().lt('retain_until', now()).select('id')`, returning `{deleted, error}`, missing-table-benign via the existing `isMissingTableError`, direct-import / awaited — KG1), the `SUBSTRATE_TRAJECTORY_SWEEP_ENABLED` flag helper, and a tsx test (purge deletes past-`retain_until`, leaves fresh rows, missing-table-benign; route 503/401/flag-off-200/flag-on-200).
- **Verify:** `npx tsc --noEmit` clean; `npx tsx` the new test green; sibling suites green.
- **Founder commits + pushes.** Deploys **inert** (flag unset; no `vercel.json` cron yet — byte-identical).
- **Confirm classification with the founder:** Standard recommended; the 0d-ii "data deletion → Critical" tension is named in the scope doc §5 — the founder confirms Standard or elects full 0c-ii.

### Step 2 — Activate the sweep (deployment-config — Critical; founder-performed, PR17) — **THE GATE on Step 3**
1. Add `{ "path": "/api/cron/trajectory-retention-sweep", "schedule": "0 8 * * *" }` to `website/vercel.json`'s `crons` array (founder elects the schedule — daily 08:00 UTC matches observability; ample for a 90-day limit). Commit + push.
2. Set `SUBSTRATE_TRAJECTORY_SWEEP_ENABLED=true` in Vercel (production).
3. **Verify (founder-performed, walked live):** a manual `curl -H "Authorization: Bearer $CRON_SECRET" https://www.sagereasoning.com/api/cron/trajectory-retention-sweep` → `200 {ok:true, flag_enabled:true, deleted:0}` against the still-empty table; a no-auth call → `401`.
- **Rollback:** unset `SUBSTRATE_TRAJECTORY_SWEEP_ENABLED` (route reverts to the no-op 200) and/or remove the `vercel.json` cron entry.
- **✅ Only after Step 2 verifies green may you proceed to Step 3.**

### Step 3 — TEST-first WRITE→READ verification (the M7 close's named legs)
On **TEST** (`.env.development.local`, throwaway test login — never `.env.local`/production):
1. Set `SUBSTRATE_TRAJECTORY_WRITE_ENABLED=true` → run **≥2 consults on one credential** → confirm 2 rows in `agent_assessment_history` keyed to that `credential_ref` (SQL count).
2. Set `SUBSTRATE_TRAJECTORY_READ_ENABLED=true` → a **3rd consult** shows `meta.trajectory.prior_instances ≥ 2`, `confidence_weighted: "low"`, an honest `direction_of_travel`; a **fresh** credential shows `single_snapshot`.
3. Confirm the engine assessment is byte-identical with the read flag on vs off (determinism).
- TEST teardown per the build-cache process (or leave TEST on — it's TEST).

### Step 4 — Production M6-P2 (WRITE flag — Critical; founder-performed, PR17)
**Pre-check: Step 2 is live (the sweep gate).** State the named risk aloud (rows accrue with a 90-day `retain_until`, enforced by the Step-2 sweep), get the founder's go.
1. Set `SUBSTRATE_TRAJECTORY_WRITE_ENABLED=true` in Vercel (production).
2. **Verify:** a real `/api/reason` consult → a real row appears in production `agent_assessment_history` (SQL count by `credential_ref`); the `/api/reason` response + engine assessment are unchanged (the read flag is still off — write-only).
- **Rollback:** unset the flag (no more writes; existing rows remain, swept by `retain_until`).

### Step 5 — Production M7 (READ flag — Critical; founder-performed, PR17)
After **≥2 production consults on one credential** have accrued (Step 4):
1. Set `SUBSTRATE_TRAJECTORY_READ_ENABLED=true` in Vercel (production).
2. **Verify:** a consult on that credential shows `meta.trajectory.prior_instances ≥ 2` + honest bands; a fresh credential shows `single_snapshot`; the **engine assessment is byte-identical** (the overlay is additive). Confirm no latency regression beyond the one indexed read.
- **Rollback:** unset the flag (overlay disappears; engine untouched).

**Chain B1 complete.** (Optional natural follow-on, founder-elected, NOT required by the ask: the **CI-15 docs-flip** — the M5 staged "where your trajectory is known" conditional → operational, now that M7 surfaces `typical_proximity`; it is a public-surface R18 change, see `operations/p1-rebuild-2026-06/m5-docs-staged-for-activation.md`.)

---

## Part B2 — The CI-4 sub-order (mandatory order; independent of B1)

### Step 6a — M5 CI-4 reason-route (`SUBSTRATE_REASON_LOOP_CLOSURE_ENABLED`) — TEST then production
TEST first: set the flag → a consult accepts a `prior_feedback` input, marks redirections `examination_open`, carries the **same depth** on re-examination (not quick-by-default), and writes `examination.{ref,depth_tier,prior_feedback_ref}` **inside the signed assessment**. **Confirm the production signing state** (the M5 build hit a signing-flag-without-key 503 on TEST — resolve before production). Then production; verify the same.
- **Rollback:** unset the flag (no `prior_feedback`/`examination` fields — byte-identical).

### Step 6b — M3 CI-4 write-boundary gate, **FLAG/DETECT mode only** (`SUBSTRATE_LOOP_CLOSURE_GATE_ENABLED=true`, `SUBSTRATE_LOOP_CLOSURE_GATE_REJECT` UNSET)
**Only after 6a is live** (the gate reads the markers 6a writes). TEST first: an accreditation write over a chain containing adopted-redirections **without** same-depth re-examinations is **flagged** in the 200 response body (`enforced:true`, `ok:true`, `loop_closure.verdict:'unclosed'` — detected, the write **proceeds**, not rejected; **`enforced:false` is the gate-OFF state, NOT detect mode** — corrected 2026-06-14 from code at `loop-closure-gate.ts:309`); a closed chain passes clean (`loop_closure.verdict:'closed'`). Then production; verify. The **R18f provenance gate is untouched**.
- **Rollback:** unset the flag (`enforced:false`, byte-identical).

### Step 6c — Reject mode (`SUBSTRATE_LOOP_CLOSURE_GATE_REJECT=true`) — **DEFERRED, its own later step**
Do **NOT** enable reject mode this session. Per the M3 close it is "its own step once chains demonstrably close" — enabling it before real chains close would reject legitimate writes.

---

## What is NOT in scope (do not pull in)
The credential-consolidation **build** (the CI-14 Critical track — its own session(s); the ADR `adopted/adr/2026-06-14-credential-consolidation.md` is its spec); **CI-16** (parked — the gate-engine decision); the carried **M1** activation (narrative-sweep cron + L3-defer flags), **M3 CI-11** coverage-columns migration, **M4** items, **M5 CI-13** practice-hint flag, and the **CI-15 docs-flip** (all founder-elected, independent — touch them only if you explicitly choose to, in their own steps); the **0h call**; any R20a / distress-classifier / A5 / signing-algorithm change.

## Rollback (summary)
Every activation = **unset the flag** (byte-identical). The sweep code + the `vercel.json` cron entry = `git revert`. No schema to unwind (the table pre-exists from M6-P1). A swept row is irreversible but bounded strictly to rows already past their adopted 90-day `retain_until`.

## Verification (summary — each must pass before the next)
Step 2: cron `200 {flag_enabled:true, deleted:0}` + `401` no-auth. Step 3 (TEST): 2 rows → overlay `prior_instances≥2`/`low` → fresh `single_snapshot` → byte-identical engine. Step 4 (prod): real row written, response unchanged. Step 5 (prod): overlay surfaces, engine byte-identical. Step 6a: `examination`/`prior_feedback` fields + same-depth carry (signing state confirmed). Step 6b: unclosed chain flagged in the 200 body (`enforced:true`, `loop_closure.verdict:'unclosed'`, write proceeds — `enforced:false` is gate-OFF, not detect mode), closed chain clean (`verdict:'closed'`).

## Forecast
Success: the M6/M7 trajectory feature is **Live** (sweep enforcing retention, writes accruing, the honest overlay surfacing — engine byte-identical), and the CI-4 loop-closure affordance is **Live in detect mode**, all in the only safe order. Remaining after this: the optional CI-15 docs-flip; the other carried M1/M3/M4/M5 activations; CI-4 reject mode (6c); the credential-consolidation build (Critical track); parked CI-16; the 0h call.

End of prompt. Open on `main`; the AI does no git/production operations; each flag is byte-identical when unset; nothing proceeds out of the ⛔ order.
