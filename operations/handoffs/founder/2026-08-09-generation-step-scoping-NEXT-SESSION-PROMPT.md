# Next-Session Prompt — The generation-step scope document (fourth item of the ruled post-brief sequence)

**Stream:** founder.
**Tier:** `governance` / design (explore-scope) — a scope document offered for mentor review. **No code, schema, flag, credential, or public-surface change. No build.**
**Governing frame:** `/adopted/standing-protocol-cache.md`.
**Predecessor close:** `operations/handoffs/founder/2026-08-09-watching-ruling-fold-CLOSE.md`.
**Predecessor decision entries:** `D-WATCHING-SCOPE-RULED-2026-08-09` (verbatim record wins: `operations/agent-circles-2026-08/2026-08-09-mentor-consultation-watching-scope-rulings-verbatim.md`); `D-WATCHING-PER-CYCLE-RECORD-TABLE-SCOPED-2026-08-09`.
**Risk classification:** Standard under 0d-ii. Critical Change Protocol NOT engaged.

## The named sequence — carried per the mentor's Q11 instruction, binding on this and every subsequent session

> Brief ruled *(2026-08-09)* → `fresh` endpoint scoped and ruled *(2026-08-09)* → `watching` (per-cycle record table) scoped and ruled *(2026-08-09)* → **generation-step scope document (THIS SESSION)** → first build gate → bounded validation run (mentor-reviewed) → only then any standing-runner design.

**And the Q1 hard constraint, carried as a named hard constraint in every subsequent document, this one included: the loop proposes; it never executes.** No document in this sequence may revisit that line.

## Why this session matters

This is the last scoping item before the first build gate. The generation step is the runner-side half of a cycle — the seven heuristics applied against an `OikeiosisGap`, producing `GeneratedCandidate`s for SageReasoning's examination-side per-cycle contract. Its fixed design was captured 2026-08-05 and ruled with the brief (§1.3), but the *content* — prompt structure, friction-detection threshold, the `randomOffsetPercent` phantasia-variation mechanism, heuristic implementation shape, and every configuration default — was deliberately deferred to this document by name, repeatedly. Several rulings also assigned this document specific obligations (listed below). Per the sequencing ruling: *"The first build gate does not open until the generation-step scope document is ruled."*

## What earlier rulings assign to THIS document by name (obligations, not options)

1. **The guardrail fail-closed handling — a named OPEN question, not resolved by default** (brief §3 item 1 ruling, re-confirmed by the `watching` ruling's carry-forward 2): *"must name how the runner handles a filtering pass where one or more guardrail calls fail closed — whether the affected candidate is treated as rejected_by_guardrail, dependency_unavailable, or something else. Do not leave this implicit."* The `watching` candidate row's nullable guardrail fields are ready to represent whatever is ruled.
2. **The QW-A settled ground, carried VERBATIM** (the `watching` ruling's carry-forward 1): a `dependency_unavailable` cycle passes the three-consecutive-null-cycles fallback counter **transparently — neither counts nor resets**; the cycle-level outcome reads `dependency_unavailable` only when no active heuristic could produce an assessable pool (concretely, friction-only mode with the task list down); a friction-only-mode `dependency_unavailable` cycle neither satisfies nor disturbs the fallback-exit condition — *"a third thing — an honest record of infrastructure unavailability."* Settled — carry, do not re-open.
3. **`loopId`/`sessionId` composition in a trust-event write** (brief §1.4 mentor note): *"the generation-step scope document must name how they compose in a trust-event write"* — named there, not pre-empted by `watching`'s row composition (§2.6 of that scope kept the boundary deliberately).
4. **The generative-prompt seed principle, carried as a named design principle** (C2 scope §2.2 resolution, mentor-confirmed): `generativePrompt` is a per-examination computed seed — raw material for runner/human authorship of a later `OikeiosisGap.targetCircleMeaning`, never itself an `OikeiosisGap`, never a substitute for that authorship. *"It should not need to be rediscovered there."* Also Q8 (ruled): seed hand-off across identities is a founder act.
5. **Configuration defaults** — all five `IdeaLoopConfiguration` parameters (`loopId`, `minimumInterval`, `maximumDuration`, `randomOffsetPercent`, `minimumIncubationInterval`) have **no settled default anywhere** (§1.4: "Defaults are TBD at generation-step scoping — no default is settled anywhere yet"). This document proposes them for ruling.
6. **The null-cycle rule must be architecturally enforced, not merely stated as policy** (the brief §1 confirmation's carry-forward note (i)).
7. **The validation-runner / standing-runner distinction** (§1.8, ruled): this document *"should not assume the validation runner and the standing runner are the same thing"* — and must not pre-answer the standing-runner design.
8. **Q6 note:** the `'terminated_by_timeout'` seventh `cycleOutcome` value is ruled but still absent from the committed `idea-loop-types.ts` (verify at open — do not assume it has landed); the code edit remains a named follow-up for the first code session touching the module, plausibly the `fresh` or `watching` build.

## Pre-conditions

1. The `watching` ruling-fold records commit is committed and pushed (founder).
2. Confirm at open that the session's hook framed (quota memory: `api-key-1-per-day-limit-masks-as-401`; the s9-loop limits stand at 2000/20000).
3. No new mentor guidance has superseded the Q11 sequence or any ruling — ask the founder at open, before drafting.

## Part A — Open under the protocol

Read in order:
1. `/adopted/standing-protocol-cache.md` (~3 min).
2. The predecessor close (above).
3. The `watching` verbatim rulings record **in full** (`2026-08-09-mentor-consultation-watching-scope-rulings-verbatim.md`) — its "Sequencing confirmation" and the two generation-step carry-forwards are this session's charter.
4. The generation heuristics document **in full** (`operations/agent-circles-2026-08/2026-08-05-idea-loop-generation-heuristics.md`) — the seven heuristics, the neuroscience-grounded additions, the design-rationale mappings; this document's raw material.
5. The ruled brief §1.3/§1.4/§1.5/§1.8 + Phases 1/3/7 (`2026-08-08-autonomous-loop-design-brief.md`) and the config/shared-task-list scope (`2026-08-06-idea-loop-configuration-and-shared-task-list-scope.md` — both Parts; the `SharedTask` contract + the `frictionAssessment` mapping open question).
6. The ruled `fresh` + `watching` scope documents (the two server-side seams a cycle calls; `fresh`'s request/response shape and `watching`'s write shape are fixed inputs the generation step composes with).
7. The code, read first-hand (PR20): `idea-loop-types.ts` (`OikeiosisGap`/`createOikeiosisGap`/`GeneratedCandidate`/`assessStructuralNovelty`; check whether the seventh `cycleOutcome` value has landed); `orientation-reading.ts` (`composeGenerativePrompt` — the live seed format).

Confirm at open: tier; hold-point status (P0 0h); status vocabulary; signals/risk class.

## Part B — Procedure

### Step 1 — Consolidate the fixed design (settled, cited, not re-opened)
The seven heuristics (one candidate each per cycle; the six core all run each cycle); friction detection's structural difference (preferred-indifferent tag; kathekon vs katorthoma applied to generation); the ruled examination-cost shape (all candidates guardrail-shape only → novelty on survivors → one full examination for the highest-proximity novelty-passer); the null-cycle rule; the fallback rule **with QW-A's settled semantics folded in verbatim**; the two design-rationale mappings (documentation, not requirements); the external-state rulings (config option 1; task list option 2; `SharedTask` as contract-not-storage-mandate).

### Step 2 — Scope the generation content (proposals, not decisions)
As proposals for the mentor: per-heuristic implementation shape (prompt structure per heuristic; what each consumes from the gap/seeds/task list); the friction-detection threshold; the `randomOffsetPercent` phantasia-variation mechanism (how jitter varies input sequence, not just timing); configuration defaults for all five parameters; the null-cycle rule's architectural enforcement (obligation 6); how `loopId` + `sessionId` compose in a trust-event write (obligation 3); the cycle's composition against the two ruled seams (`fresh` batch call; `watching` end-of-cycle write); the validation-run shape within §1.8's boundary (obligation 7). **Named open questions for the mentor must include the guardrail fail-closed handling (obligation 1 — options named, none defaulted)** and the `frictionAssessment` PM-tool mapping question if this document's scope touches it (or an explicit statement of which later session owns it).

### Step 3 — Adversarial review (PR19)
Independent review before the scope is offered — ruling-fidelity (nothing ruled re-opened; QW-A carried verbatim; the Q1 line intact); PR20 compliance (every mechanism-fact claim traced to actual code, especially the seventh-value status and the two ruled seams' shapes); boundary compliance (no build step in disguise; no standing-runner design; no runner-credential work — that is the runner scoping session's). Spend-limit fallback per the standing template if the Workflow dies. **Pause before and after the review for the founder's model-settings changes, per standing practice.**

### Step 4 — Records
Decision-log entry (lean form); session close; the scope offered to the founder for relay to the mentor. **The session ends there — the first build gate does not open until the mentor rules on this scope.**

## What this session does NOT do

- Does not build anything; no code, migration, flag, or credential accompanies it (the `idea-loop-types.ts` seventh-value edit stays a named code follow-up unless the mentor has explicitly directed otherwise).
- Does not design the standing runner (§1.8's ruled boundary) or scope the runner credential/identity (Q3 — its own session, which also owns the `watching_write` provisioning carry-forward and the `ORIENTATION_DELIVERY_TIMEOUT_MS` revisit trigger).
- Does not re-open anything ruled — the brief's Q1–Q11, the `fresh` scope, the `watching` scope (including QW-A/B/C), the examination-cost/null-cycle rulings.
- Does not touch the two registered defects, C1c-original, D4, the Stoa activation, W1–W3, B6, or the permission-layer items 14–17 (including the Human Creator Protection permission-layer constraint, PL-HCP-1/2/3 — carried, not resolved, until those items open).

## Rollback path

Documents only — `git revert` the records commit.

## Forecast

Success = a mentor-reviewable generation-step scope faithful to the fixed design and every named obligation, with the guardrail fail-closed handling surfaced as a genuinely open question and configuration defaults proposed for ruling. Next after the mentor's ruling: the first build gate (its own election — which of `fresh`/`watching`/generation builds first is not pre-decided here).

End of prompt.
