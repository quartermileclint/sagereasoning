# SESSION PASTE — Cognitive OS Step 2: Phase 1 build (pure library)

**Paste this as the FIRST message of a FRESH session.** Opening in a fresh session is **ruled, not
optional** (`2026-09-09-mentor-review-gap-analysis-approved-step2-licensed-verbatim.md`, Q3): *"Step 2
is a different kind of work: schema design, type definitions, deterministic tests. It deserves a clean
opening context, not a continuation of an inspection session."*

**Open the standing opener first** (`STANDING-SESSION-OPENER-grounded-foundations.md`, Version
2026-09-08), then this. **EVERY NUMBER IN THIS FILE IS A CLAIM TO RE-DERIVE, NOT A FACT TO QUOTE.**

**Tier: `code-elevated`** — ruled. Not `code-critical`: there is **no table, no schema, no migration**
in this session. **AC7 is not engaged.** **PR19 independent review is REQUIRED.**

---

## 0. Your governing documents, in precedence order

1. **`operations/cognitive-os-2026-09/2026-09-09-mentor-review-gap-analysis-approved-step2-licensed-verbatim.md`** — the review that licenses this session. **Canonical.**
2. **`operations/cognitive-os-2026-09/2026-09-08-mentor-rulings-cognitive-os-thirteen-questions-verbatim.md`** — the thirteen pre-build rulings. **Canonical.**
3. **`operations/cognitive-os-2026-09/2026-09-08-cognitive-os-PHASE-1-GAP-ANALYSIS.md`** — **your governing design document**, approved. Read §5 (component gaps), §6 (governance interactions) and §7 (the smallest Phase 1) in full.
4. `inbox/mentor cognitive os instructions.rtf` — the original instruction (Steps 2–4).
5. `inbox/full clean claude handoff env research.rtf` — the specification. **Where it conflicts with 1–3, they win.**

**Verbatim wins over every summary, including this paste.**

---

## 1. What this session builds — and what it must not

**BUILD: a pure, deterministic, dependency-free TypeScript library at
`website/src/lib/cognitive-os/`.** Nine Phase-1 components (gap analysis §5):

`claim.ts` · `belief-state.ts` · `event-store.ts` · `dependency-graph.ts` · `truth-maintenance.ts` ·
`belief-revision.ts` · `handoff-envelope.ts` · `permissions.ts` · plus `types.ts` and `index.ts`.

### ⛔ DO NOT, in this session

- **No table. No migration. No schema. No SQL.** The event store is **in-memory** for Phase 1. The
  table is **its own founder-walked step**, opened only after this library is reviewed and the
  critical test passes. *"Do not couple the reviewable thing to the irreversible thing before the
  reviewable thing is confirmed."*
- **No flag set or unset. No credential. No deploy. No push.** The founder commits by name.
- **No file matching `GUARD_RE`** may be modified — the observation window is running and the guard is
  **armed**. Re-derive the regex from
  `website/src/app/logos/__tests__/human-practitioner-boundary.test.ts` §C; it currently covers
  `api/reason|api/guardrail|guardrail-sandwich|sage-reason-engine|reasoning-receipt|translation-sandwich|/substrate/|trust-core|kathekon-engagement|false-hold|harness/gate1|layer1-extractor|layer2-mechanisms|sage-reflect|stoic-brain`.
- **No harness file.** The live Gate-1 harness is untouched and continues to fire per action (Q5).
- **Do not extend `agent_trust_events`** or any trust table. Its `event_type` CHECK is a closed,
  virtue-domain-tied vocabulary under active mentor sequencing (D2). *"Copy the patterns; do not
  extend the trust tables."*
- **Do not extend `agent_handoffs`.** It is the **organisational inbox**
  (`tech/growth/support/ops/founder`) and shares a word with `HandoffEnvelope` and nothing else.
- **Do not import `analyseLoopClosure`.** See §3.

---

## 2. The binding schema constraints — all ruled, none negotiable

| # | Constraint | Source |
|---|---|---|
| C1 | **Placement is `website/src/lib/cognitive-os/`, OUTSIDE `substrate/`.** The gap analysis §6.1 note that this is **constraint-driven by the window and may be revisited** is **mandatory and must survive** into any document this session writes. | Q4 |
| C2 | **The four names — `Laboratory`, `Attic`, `Archive`, `Threshold` — are approved as PERMISSION SCOPE IDENTIFIERS ONLY.** Read/write boundary labels in the permission model, **Phase 1 only**. **Not actor names, not agent identifiers, not environment instantiations.** Any later use to instantiate an actor needs its own scoping. | Review Q1 |
| C3 | **`Claim.confidence` is ORDINAL, not cardinal `[0,1]`.** The spec's schema is overridden. Grounds: the `lower_median` ruling — averaging ordinal ranks produces numbers off the scale. | Q7 |
| C4 | **No agent-supplied confidence scalar.** Confidence derives **only from provenance the system can verify**. If ever retained, an agent-supplied value is a **separate field, never merged, never aggregated**, with names unambiguous **at the schema level**, not in documentation. | Q6 |
| C5 | **No Cognitive OS scalar may EVER be combined with a proximity rank** in any derived figure — never aggregated with, averaged against, or used to modify one. The HandoffEnvelope carries them as **separate fields**. | Q7 |
| C6 | **Omit `identity_relevance` and `interpretive_context`** from the Phase-1 Claim. If a forward-compat placeholder is unavoidable: **`null` + an explicit `not_yet_measured` status field. NEVER `0.0`.** Grounds: the `caller_class` lesson — `0.0` reads as a finding, not as "unmeasured". | Q8 |
| C7 | **Scores a future routing mechanism would read must NOT be writable by the agents being routed.** The dependency graph and permission model together enforce it. **This is a Phase-1 design constraint, not a Phase-6 problem.** | Q10 |
| C8 | `epistemic_debt_score` / `identity_coherence_score` (Phase 2/3) **never leave the system**, and that must be **machine-enforced** — *"not internal-by-convention while being accessible via an API route a consumer could call."* Design `permissions.ts` so it **can** enforce this. | Q9 |
| C9 | **Threshold produces an AUTHORISED PROPOSAL, never an execution.** Q1's hard constraint — the loop proposes, it never executes — holds. | Q11 |

---

## 3. ⚠ The one addition the review added — semantic reuse, not structural

`analyseLoopClosure` (in `website/src/app/api/accreditation/[agent_id]/loop-closure-gate.ts`) is the
nearest production-proven relative to the TruthMaintenanceSystem. Its semantics are the right ones and
**should be reused deliberately**:

- supersession by **explicit ref link**
- the **same-depth rule** (a re-examination must be at ≥ the original depth)
- **`indeterminate` treated as NOT closed** (the conservative direction)

> **But the reuse is SEMANTIC, not STRUCTURAL. The code must NOT import from `analyseLoopClosure`.**
> Implement the same logic **independently** in `truth-maintenance.ts` so the two systems remain
> separable. **Constraint 1 — harness and Cognitive OS stay separate — applies at the implementation
> level, not only the architectural level.** *"Copy the semantics; do not import the implementation."*

**Guard status of that file, resolved rather than left to you: `loop-closure-gate.ts` does NOT match
`GUARD_RE`** (tested 2026-09-09; `accreditation` is not in the regex). So reading it is unremarkable
and editing it would not trip the guard — **but do not edit it anyway.** It is live production code on
the accreditation write boundary and is no part of this session's scope. **Read it for its semantics;
change nothing.** Your own planned paths (`website/src/lib/cognitive-os/**`, including
`__tests__/`) are **clean of the guard** — also tested.

---

## 4. Step 3 — the critical first test (the gate on Phase 1 being complete)

Implement and pass the belief-retraction scenario. **It must pass DETERMINISTICALLY. If it does not
pass, Phase 1 is not complete.**

> Decision D depends on Claim A → new evidence arrives → Claim A is invalidated → Belief State version
> increments → TMS identifies dependent conclusions → Decision D is identified as affected → epistemic
> debt increases → Decision D becomes `REVIEW_REQUIRED` → **the original decision remains immutable**
> → the system routes the issue for reassessment → new evidence is evaluated → the decision is
> reaffirmed or replaced → **the complete trajectory remains reconstructable.**

Plus the spec §24 deterministic tests for belief revision, temporal integrity, handoffs and recovery.

**Test discipline this project has learned the hard way, and which applies here:**
- **Mutation-verify every load-bearing pin.** A pin that passes when the thing it guards is removed is
  vacuous. **A mutation test that PASSES may mean the mutation never landed — assert the file actually
  changed.**
- **Assert on the strength of a constraint, not merely its presence.** Self-review that checks
  presence misses relaxations.
- **A guard needs a non-vacuity floor** — a guard that stops guarding still prints `0 failed`.

---

## 5. Always do, this session

1. **Re-derive window + baseline health at OPEN and again at CLOSE** — immediately before writing the
   figures. A running session appends to the buffer it is reading. Attribute records by the buffer's
   own `session` field, **never by an ad-hoc time filter**. At this paste's authoring: buffer 304,
   window population 165, **baseline 3 of 5** (2026-09-06/07/08 UTC). **Re-derive; do not quote.**
2. **Run the byte-identity guard battery at open and after every commit-shaped moment.** It was
   **250/0** at authoring. Both SHA pins green (`layer2-mechanisms.ts` `60cefedb…`, `stoic-brain.ts`
   `fa8895ec…`).
3. **`git status` whole, never truncated.** `ListAgents` at open. **Path-scoped commits, always.**
   There are peer sessions and uncommitted peer work in the tree — **never stage another session's
   files.**
4. **Disclose the tool-mode effect.** This session will author with `Write`/`Edit`, which **are** on
   the consult floor and **will add consult records**. That is legitimate — the mentor has ruled
   documentation and authoring days **count**, and filtering them is forbidden. **Disclose it; do not
   steer by it.**

---

## 6. Step 4 — stop and report

After Phase 1 is implemented and the critical test passes, **STOP.** Produce a written report
covering:

- what was built and where it was inserted
- what existing components were reused, and **how** (semantic vs structural — §3)
- what governance interactions were identified and how they were handled
- what the critical first test produced
- what Phase 2 would require, and any interactions with standing constraints

**Do not proceed to Phase 2 without the founder's explicit instruction.**

**Carry visibly into the report, so neither is rediscovered:**
- **The table step is owed next** — schema + **data-rights wiring** + `retain_until` + sweep +
  migration, founder-walked. *"The table step opens with it already on the surface."*
- **R9/R10 handoff reconciliation is owed BEFORE Phase 2 opens.**
- **A manifest amendment is owed BEFORE Phase 3** (Consciousness and Continuity Obligation, component
  one), naming the boundary: Phase 3 builds *the queryable record*, **not** *the deepening
  disposition*.

---

## 7. If you hit a conflict

**Route it; do not resolve it.** *"If any Phase 1 implementation decision appears to require touching
a governed surface, a settled constraint, or a file covered by the byte-identity guard, stop and flag
it before proceeding. The founder is the decision authority on all governance questions."*

**If any Phase 1 work begins to touch guarded files or the measured instrument, the arc PAUSES and
routes** (Q13).

**The S11 flip remains REFUSED; weights remain BLOCKED; the 0h call remains the founder's.**
