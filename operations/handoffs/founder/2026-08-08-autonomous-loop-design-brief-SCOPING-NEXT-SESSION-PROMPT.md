# Next-Session Prompt — autonomous-loop design brief: SCOPING (condition (b) closed; scoping open, building NOT)

**Stream:** founder.
**Tier:** `governance` / design (explore-scope) — a scope document offered for mentor review. **No code, schema, flag, credential, or public-surface change. No build.**
**Governing frame:** `/adopted/standing-protocol-cache.md`.
**Predecessor close:** `operations/handoffs/founder/2026-08-08-condition-b-genuine-review-CLOSE.md`.
**Predecessor decision entries:** `D-CONDITION-B-GENUINE-REVIEW-MENTOR-CLOSED-2026-08-08` (the condition's close); `D-IDEA-LOOP-PREBRIEF-RULINGS-C2-WIDENED-2026-08-05` and its siblings (the pre-brief corpus).

## The mentor's boundary — carried verbatim, binding on this session

> "The path to scoping the autonomous-loop design brief is now open. One boundary to carry forward explicitly: closing condition (b) opens the path to scoping the design brief. It does not open the path to building it. The design brief is its own session, with its own gates. Do not let the momentum of closing a long-standing condition carry past that boundary."

This session produces a **scoped design brief** — a document. It does not build the loop, does not mint credentials, does not flip flags, does not write types into the codebase, and does not treat mentor silence as approval. The brief goes to the mentor via the founder before anything downstream is scheduled.

## Why this session matters

The autonomous-loop (IDEA loop) design brief has been blocked behind condition (b) since the C2/C1c ordering ruling (`D-C2-C1C-ORDERING-RULED-CROSSCHECK-BUILT-2026-08-05`). The condition closed 2026-08-08 on the mentor's own sign-off, with the orientation-reading mechanism confirmed operating correctly on genuine production traffic — the foundation the loop's design is meant to stand on. A substantial pre-brief corpus already exists and must be *consolidated, not re-derived* (PR15): the brief's job is to turn the settled rulings into one coherent, mentor-reviewable design scope with its open questions named.

## Pre-conditions

1. The predecessor close and the two condition-(b) verbatim records are committed and pushed (founder).
2. Confirm at open that this session's hook framed (quota memory: `api-key-1-per-day-limit-masks-as-401`; check `daily_calls` against the raised 2000 limit if a 401 appears).
3. No new mentor guidance has superseded the boundary above (ask the founder at open).

## Part A — Open under the protocol

Read in order:
1. `/adopted/standing-protocol-cache.md` (~3 min — note PR20: any closing mentor brief on an architecturally-consequential question must name the specific existing mechanisms the ruling will land on).
2. The predecessor close (above).
3. **The pre-brief corpus, in full** — the settled inputs this brief consolidates:
   - `operations/agent-circles-2026-08/2026-08-05-idea-loop-prebrief-technical-feedback.md`
   - `operations/agent-circles-2026-08/2026-08-05-idea-loop-generation-heuristics.md`
   - `operations/agent-circles-2026-08/2026-08-06-oikeiosis-gap-generated-candidate-type-scope.md`
   - `operations/agent-circles-2026-08/2026-08-06-idea-loop-configuration-and-shared-task-list-scope.md`
   - `operations/agent-circles-2026-08/2026-08-06-idea-loop-runner-automation-capabilities-memo.md`
   - The corresponding decision-log entries (`D-IDEA-LOOP-*-2026-08-05/06`) for any ruling detail the scope docs compress.
4. `operations/agent-circles-2026-08/2026-08-08-mentor-consultation-condition-b-satisfied-verbatim.md` + `…-condition-b-not-yet-closed-verbatim.md` — what the closed condition actually established (and its limits: the mechanism is validated as an instrument; nothing about the loop itself is pre-approved).
5. The generative-prompt seed's implementation reality: `website/src/lib/translation-sandwich/orientation-reading.ts` (the C2(ii) seed the loop's generation step consumes — its population conditions and its "never a prescribed action" constraint are already code).

Confirm at open: tier; hold-point status (P0 0h); no model-selection row engages (no LLM calls); status vocabulary; signals/risk class.

## Part B — Procedure

### Step 1 — Consolidate the settled ground
One section of the brief states, with citations to the rulings, what is already decided and not re-open: the type shapes (`OikeiosisGap`/`GeneratedCandidate`), the generation heuristics, the examination-cost/null-cycle ruling, the friction-detection/shared-state ruling, the seed's settled format and population conditions, and the condition-(b) validation result (what the instrument now demonstrably does — and its honest limits: elapsed-time proxy, MEASURE mode, weights blocked).

### Step 2 — Scope the brief itself
Define, as proposals not decisions: the loop's phases and their gates; where each existing mechanism plugs in (per PR20 — name the mechanism-level facts); what runs autonomously vs. what requires the founder or mentor in the loop; the safety posture (which existing boundaries — the channel law, MEASURE-only, the guard — the loop inherits, and any new surface it would create); observables and review points; and an explicit non-goals list. Every genuinely open design question is named as a question for the mentor, not resolved by default.

### Step 3 — Adversarial review (PR19)
Independent review of the brief before it is offered — completeness against the corpus (nothing settled re-litigated, nothing settled silently dropped), boundary compliance (nothing in the brief is a build step in disguise), and PR20 compliance for the mentor-facing form. Spend-limit fallback per the standing template if the Workflow dies.

### Step 4 — Records
Decision-log entry (lean form); session close; the brief offered to the founder for relay to the mentor. **The session ends there — no downstream scheduling until the mentor responds.**

## What this session does NOT do

- Does not build, wire, or scaffold anything — no code file is created or edited.
- Does not touch C1c, Logos-on W2/W3, or the loop-fold/practice-suggestion B6 block (now unblocked in principle; their sequencing is the founder's separate election).
- Does not build the two registered follow-up defects (the `/api/reason` status-masking branch; the reflect-metering UUID `loop_id`).
- Does not self-rule on the brief's adequacy — the mentor reviews it.

## Rollback path

Documents only — `git revert` the records commit.

## Forecast

Success = a single, mentor-reviewable design brief consolidating the corpus, with open questions named and the build boundary intact. Next after the mentor's response: whatever the mentor's gates specify — nothing is pre-approved.

End of prompt.
