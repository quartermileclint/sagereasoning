> **⛔ SPENT — executed 2026-07-08** under `D-TRUST-LAYER-S4-INTERVENTION-ENGINE-MEASURE-BUILT-REVIEW-FOLDED`. The intervention engine + the A4 transparency ledger are built (`intervention-engine.ts` + `transparency-ledger.ts`, battery 417/0). Reviewed first-hand on the initial account-limit, then an independent Workflow re-review completed fully (9 agents, 0 errors) — both CLEAN of correctness/safety defects; 5/6 dimensions clean, 2 docstring-precision nits folded + a seam battery case. MEASURE mode; ENFORCE is S11. Close: `operations/handoffs/founder/2026-07-08-trust-layer-S4-intervention-engine-CLOSE.md`. **Next is S5** — `operations/handoffs/founder/2026-07-08-trust-layer-S5-profiles-collaboration-record-NEXT-SESSION-PROMPT.md`. Retained for the record only.

# Next-Session Prompt — Trust Layer S4: the intervention policy engine (MEASURE mode) + transparency tracking

**For the founder. Paste as the first message of a fresh session.** (Rename the date prefix to the actual session date.)

**Stream:** founder.
**Tier:** `code-elevated` — build the deterministic policy engine + the transparency ledger **DARK / MEASURE mode** (log-and-continue only; computed + logged + surfaced, never binding). **ENFORCE is S11** — a separate, named, founder-walked Critical activation; NOTHING this session pre-approves it. If any step would wire a binding guard-deny beyond the already-proven irreversible-action class, STOP — that is S11. Lean + Elevated template.
**Governing frame:** /adopted/standing-protocol-cache.md.
**Design-of-record:** `adopted/adr/2026-07-08-sage-trust-layer.md` (ADR-013 **§3 row 7 + the intervention decision table + the three binding spec-7 constraints in §3**, **§5 A4 + A8**, **§7** measure→enforce sequencing).
**Binding methodology:** `operations/trust-layer-2026-07/2026-07-07-mentor-nine-answers-verbatim.md` — **A4** (the transparency ratio) + **A8** (habitual-pause termination) verbatim; and the spec-7 intervention table (verbatim in `inbox/mentor infrastructure response.rtf`). Where the ADR and the verbatim record diverge, the verbatim record wins.
**Plan of record:** `operations/trust-layer-2026-07/trust-layer-build-plan.md` §S4.
**Predecessor close:** `operations/handoffs/founder/2026-07-08-trust-layer-S3-combiner-CLOSE.md`.
**Predecessor decision-log entry:** `D-TRUST-LAYER-S3-COMBINER-BUILT-REVIEW-FOLDED`.

## Why this session matters

S1 built the trust state/events/decay; S2 the per-source weighting/confidence; S3 the multi-source combiner (A1 routing + spec-6 combining + the weighted aggregate, with conflict→pause and the A2 zeroed-source→no-coverage handoff). S4 is where the combined verdict becomes an **intervention decision** — the mentor's decision table as a deterministic policy engine — but **only computed + logged + surfaced (MEASURE)**. This is the last trust-core slice before the discernment protocol (S5–S7, parallelizable with S4). The load-bearing discipline: v1 must **never bind** (that is S11's logos-gate activation); the value here is the honest, reproducible intervention *recommendation* + the transparency ledger.

## What S4 builds (per ADR-013 §3 row 7 + §5 A4/A8 + build plan §S4)

1. **The intervention decision table as a deterministic policy engine** (spec 7, verbatim — binding):
   - Sage-like / Principled → **proceed + log**
   - Deliberate, no justice surface → **log + continue**
   - Deliberate + justice surface evaluated-**met** → **proceed + log**
   - Deliberate + justice surface evaluated-**indeterminate** → **pause + examine at standard depth**
   - Deliberate + justice surface **unevaluated** → **do not proceed + escalate**
   - Habitual → **pause + examine at standard depth**
   - Reflexive → **do not proceed + escalate**
   - **Any violated obligation → do not proceed + escalate**
   - **Conflict between sources → pause + escalate, NEVER average** (consume S3's `resolution: 'pause-escalate'` / `conflict` directly)
   The **justice-surface modifier is ASYMMETRIC — it can only LOWER the threshold, never raise it** (ADR §3 row 7). v1 = **MEASURE**: every row computes a *recommendation* that is logged + surfaced; the action is NOT blocked (guard-deny stays scoped to the already-proven irreversible-action class in the reference harness).
2. **The three binding spec-7 constraints outside the table** (§3):
   - a **pause-and-examine re-runs at the SAME depth as the original** (the live CI-4 same-depth rule — reuse, do not re-implement);
   - an **escalation carries the full reasoning trace + domain breakdown + justice-surface record**, not just the verdict (the escalation-payload contract);
   - a **consistent `deliberate` across sessions in one domain raises a developmental flag** (tracked, not intervened).
3. **A8 — habitual-pause termination:** bounded re-examination then escalation — **two re-examinations at standard depth; a third habitual result escalates to the Sage Reflect developmental pathway instead of re-examining** (a stable disposition is the input, not the output, of examination). The action is held; the collaboration record takes a **habitual-stable flag** feeding the next Reflect; **the orchestrator's decision at this point is itself trust-relevant** (consistently proceeding under habitual-stable flags without follow-through degrades the orchestrator's oversight-domain trust — emit the S1 `orchestrator-proceeds-under-habitual-flag` event, which S1 already defines).
4. **A4 — the transparency ledger (per-domain examinability):** three descending grades — **signed reasoning trace > stated uncertainty > structured verdict without full trace**; a **bare conclusion is not examinable**. Tracked **per-domain**. The **independence-principle flag** fires on a **functional threshold** — can the orchestrator re-examine the output *without re-running the task*? Signed trace ⇒ met; stated uncertainty + structured verdict ⇒ met at reduced confidence; bare conclusion ⇒ not met regardless of output quality → logged as an **independence-deficit** for that domain (an S1 trust event / a collaboration-record field).
5. **R20c human-override supremacy** is a **stated term of the engine's contract** (manifest R20c) — even in ENFORCE (S11), a human override supersedes the engine. State it in the contract now; it binds at S11.

## What S4 CONSUMES from S3 (already built)

`website/src/lib/substrate/trust-core/combiner.ts` — `routeObligationField` (the A1-routed obligation verdict + `resolution` (`deterministic-authoritative` | `pause-escalate`) + `conflict` + `llmConfidence`); `combineVerificationResults` (per-domain combined level + `conflict` + `openLoop` + terminals); `computeWeightedAggregate` (`level` (categorical min) + `resolution` + `anyConflict` + `anyJusticeCapped` + `coverageGaps` + `aggregateConfidenceWeight`). The engine reads these — it does NOT re-derive them. **Conflict propagation:** S3 surfaces `resolution: 'pause-escalate'` on any obligation-field or cross-session/aggregate conflict; the intervention engine maps that directly to the table's "conflict → pause + escalate."

## The channel-law + measure discipline (non-negotiable this session)

- Every intervention output is **log-and-continue**. The engine returns a recommendation; nothing in this session binds an action beyond the existing irreversible-action guard (ADR-011 channel law: the guard-deny for the irreversible class is already proven and stays as-is).
- **ENFORCE (binding the recommendation) is S11** — gated on the corroboration check clearing both directions (DONE — S0a Live) AND its own founder-walked Critical activation. The ADR-012 logos gate is honored: nothing here flips it.
- Keep everything behind `SUBSTRATE_TRUST_CORE_ENABLED` (or a new S4 flag) at any wiring seam; the pure engine (like S2/S3) is a pure lib with no env/I/O — the flag gates emission/consumption at the call site (which does not exist yet).

## Procedure (lean + elevated)

- **Read** the cache + the S3 close + ADR §3 row 7 + the table + the three constraints + §5 A4/A8 + §7, then the verbatim A4/A8 + the spec-7 table, then the S3 lib + the S1 event vocabulary (`orchestrator-proceeds-under-habitual-flag` etc. already defined) + the live CI-4 same-depth rule (`reason-loop-closure.ts` / `loop-closure-gate.ts`).
- **Build** the pure deterministic intervention engine (`website/src/lib/substrate/trust-core/intervention-engine.ts` or similar): the decision table (categorical inputs → a recommendation `{action, disposition, escalation_payload?}`), the asymmetric justice modifier, the A8 habitual-pause bound (2 re-exams → escalate-to-Reflect), the same-depth pause rule (reuse CI-4), the escalation-payload contract, the developmental-flag rule, and the R20c contract term. Plus the A4 transparency ledger (`transparency-ledger.ts`): the three grades, the per-domain functional threshold, the independence-deficit flag. MEASURE only.
- **Verify** tsc 0; the S1+S2+S3 batteries green; a new S4 battery (instrument-fidelity: every table row → the exact spec-7 disposition; asymmetric modifier only lowers; A8 two-bound then escalate-not-re-examine; conflict→pause consumed from S3; same-depth reuse; the transparency grades + functional threshold; **MEASURE — no path binds an action**). `npm run build` if any registered file changed.
- **Adversarial review** (Workflow PR15 or first-hand per the §4 precedent — **check the account credit/session balance first**): table-row fidelity vs the verbatim spec-7; the asymmetric-modifier property (can it ever RAISE a threshold?); the MEASURE invariant (can any path bind/deny beyond the existing irreversible guard?); the A8 bound (can it loop forever, or escalate early/late?); the transparency functional threshold; claims-vs-code. Fold every confirmed finding.
- **Records** (lean+elevated): decision-log entry + close + CLAUDE.md PR18 refresh + mark this prompt SPENT + author the S5 prompt (profile schemas + collaboration record; **`code-critical`: new schema** — its own founder-walked 0c-ii) OR the S9-onward sequence per the plan (S5–S7 are parallelizable with S4).

## Session shape
Reads 30–40m · decision table + modifier 45–60m · A8 bound + escalation payload 30–45m · A4 transparency ledger 40–55m · battery 45–60m · verify 15–25m · review + folds 40–60m · records 25–35m · **~4.5–6 h**.

## Rollback
`git revert` the build commit — a pure lib + tests; nothing deploys, no schema, no flag set. (If any S1/S2/S3 file is refined, the revert restores it; re-run those batteries.)

## Forecast
Ends with the deterministic intervention engine + transparency ledger built + battery-verified + reviewed, in MEASURE mode, consuming S3's combined verdicts. Ready for **S5–S7 (the four-layer discernment protocol; S5 is `code-critical` — new profile/collaboration schema)**, parallelizable with S4. **ENFORCE is S11** (the founder-walked logos-gate activation). Weights BLOCKED; the 0h call remains the founder's.

End of prompt.
