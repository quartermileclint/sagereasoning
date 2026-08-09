# Next-Session Prompt — Build `fresh`, the novelty-check endpoint (first of the founder-approved build order)

**Stream:** founder.
**Tier:** `code-elevated` — a new dedicated API route, dark behind a new flag, reusing an existing auth capability (no new capability, no schema, no auth-surface change at build time). Elevated risk under 0d-ii ("new module/function/route file" leaning Standard, but a full production-request-path build warrants the Elevated additions per the standing cache). **Critical Change Protocol NOT engaged at build** — activation (the flag flip) is its own later founder-walked `code-critical` step; nothing here pre-approves it.

## THE FOUNDER-APPROVED BUILD ORDER (read this first — every session in this arc should)

**Approved 2026-08-09** (founder election, following the AI's recommendation put to the founder for mentor confirmation — see the note below):

> **STATUS UPDATE (2026-08-09, this session's close): item 1 is DONE — `fresh` is BUILT DARK, batteries green (61/0 + 20/0), PR19 GO with zero findings; the Q6 seventh `cycleOutcome` value landed with it.** See `D-FRESH-ENDPOINT-BUILT-DARK-REVIEW-CLEAN-2026-08-09` + the close `operations/handoffs/founder/2026-08-09-fresh-endpoint-build-CLOSE.md`. Activation (`SUBSTRATE_FRESH_ENABLED`) remains its own founder-walked `code-critical` step, not yet taken. **`watching` (item 2) is NEXT** — its own `code-critical` session; the `watching_write` capability CHECK widening is founder-walked at that build's own open. The order's honesty note below still stands (founder election, not a separate mentor ruling; no mentor confirmation had arrived by this build's open).

1. **`fresh`** — the novelty-check endpoint. **← DONE (built dark, this session).**
2. **`watching`** — the per-cycle record table + dashboard. Next after this one.
3. **The generation-side runner code** — in this repo, only the additive `loop_id` field on the live `/api/reason` route (per QG-C); the heuristic templates/cycle logic themselves run in the external runner, outside this repo, per the architecture ruling. Last — it structurally depends on both `fresh` and `watching` existing (the ruled cycle composition, §2.8 of the generation-step scope, calls `fresh` in step 3 and `watching` in step 6).

**Reasoning for the order (recorded at the time, for continuity):** `fresh` is smallest, self-contained, and blocks nothing else — a clean first proof of the build-gate process. `watching` is the heavier Critical-tier item (a new `watching_write` capability requires a founder-walked `api_keys` CHECK widening) and deserves to be deliberate rather than rushed alongside a first build. The generation-side piece is last both by necessity (it calls the other two) and by prudence (its one server-touching piece, `loop_id`, lands on a live production route and should inherit review discipline already proven on the first two builds).

**Honesty note, carried forward:** this order is a **founder election**, not itself a separate mentor ruling — the AI recommended it and the founder approved it in the same conversation that produced this prompt; it was not put to the mentor as its own formal ruling question. If the founder has since confirmed it with the mentor, record that confirmation in this session's own decision-log entry (a one-line addendum is enough). If not, this order can still change before `watching`'s session opens — nothing in the ruled corpus fixes it.

**Update this section (or leave a pointer) at the close of each build session** so the next one opens knowing exactly what came before and what's next — this file is designed to be copied forward with `s/fresh/watching/` and `s/watching/generation-side/` for step 2, or superseded by a fresh prompt at that point.

---

**Governing frame:** `/adopted/standing-protocol-cache.md` (full governance via the cache; deliverable-of-the-day named below).
**Predecessor session close:** `operations/handoffs/founder/2026-08-09-generation-step-scoping-CLOSE.md`.
**Predecessor decision-log entries:** `D-FRESH-ENDPOINT-SCOPE-RULED-2026-08-09` (the ruled scope this session builds to); `D-GENERATION-STEP-SCOPE-RULED-2026-08-09` (the Q11 sequence this build sits inside — the first build gate opened here); `D-WATCHING-SCOPE-RULED-2026-08-09` (the sibling ruled scope, next in the order).

## Why this session matters

This is the first build gate opening after four fully-scoped-and-ruled documents (the autonomous-loop brief, `fresh`, `watching`, the generation step). It is deliberately the smallest of the three: one new route, no new capability, no schema, dark behind a flag. Getting the build-gate process right here (scope → build → battery → PR19 → founder-walked activation, each its own gate) sets the pattern `watching` and the generation-side build will follow.

## Pre-conditions

1. Confirm at open: no new mentor guidance has superseded anything in the ruled corpus (the brief, `fresh`, `watching`, the generation-step scope, or the build order above) — ask the founder before writing code.
2. Confirm the session's hook framed (quota memory: `api-key-1-per-day-limit-masks-as-401`).
3. The `fresh` ruling's Q6 carry-forward: confirm at open whether `idea-loop-types.ts`'s `cycleOutcome` union still carries exactly six values (it did as of 2026-08-09) — if the seventh `'terminated_by_timeout'` value still hasn't landed, **decide explicitly at open** whether this session also makes that one-line type edit (the mentor named this build as the *plausible* place for it, not the mandatory one — a deliberate choice, not a default).

## Part A — Open under the protocol

Read in order:
1. `/adopted/standing-protocol-cache.md` (~3 min — confirms tier, model selection, risk class, signals).
2. `operations/handoffs/founder/2026-08-09-generation-step-scoping-CLOSE.md` (~5 min).
3. **The ruled `fresh` scope document IN FULL** — `operations/agent-circles-2026-08/2026-08-09-fresh-novelty-endpoint-scope.md`. This is the deliverable-of-the-day; every field, capability, response shape, and honesty-posture item below is transcribed from it, not re-derived.
4. The verbatim ruling record — `operations/agent-circles-2026-08/2026-08-09-mentor-consultation-fresh-endpoint-scope-rulings-verbatim.md` — verbatim wins over the scope document's own annotations if either is ambiguous.
5. The code, read first-hand (PR20): `website/src/lib/substrate/idea-loop-types.ts` (`assessStructuralNovelty`, `NoveltyHistoryRow`, the `cycleOutcome` union — check the Q6 value's current status); `website/src/app/api/practice/discernment/` (the sibling route's handler+route split pattern — `route.ts` is a thin wrapper, `handler.ts` carries the implementation + injectable deps, per the Next route-export rule); `website/src/lib/practice-credential.ts` (`validatePracticeCredential`, the `consult` capability check); `website/src/lib/substrate/trajectory-delta.ts` (`EVIDENCE_FLOOR`, the windowed read the novelty check reuses); `website/src/lib/substrate/agent-assessment-history-store.ts` (`getTrajectoryWindow`, the `credential_ref`-scoped read).
6. `operations/decision-log.md` — last 3 entries.

Confirm at open: tier (`code-elevated`); hold-point status (P0 0h); model selection per the cache's AC1 table (this route makes **no LLM call** — pure computation over an indexed read, so no model-selection row applies to the route's own logic); status vocabulary; signals/risk class.

## Part B — Procedure

### Step 1 — Build the route, exactly to the ruled shape

`POST /api/practice/fresh`, handler-split (`handler.ts` + a thin `route.ts`), per the discernment sibling's pattern. Per the ruled scope (§2.1–§2.7, all confirmed as proposed):

- **Auth:** UPC `consult` capability via `validatePracticeCredential`, Bearer-only transport. No new capability value, no mint-surface change, no `api_keys` CHECK widening.
- **Request:** a batch — an array of `{ gapRef, targetCircle?, initialClassification }` (the `Pick<GeneratedCandidate, 'targetCircle' | 'initialClassification'>` shape the pure function takes), one entry per guardrail-surviving candidate. Input caps (max candidates per call, max `gapRef` length) are a build-time detail under the house input-cap pattern — pick sensible bounds and document them.
- **History window:** read **server-side only**, scoped by the presenting credential's `credential_ref` (R17a — never a cross-credential read), reusing the existing 90-day/30-row `getTrajectoryWindow` — **no new windowing code**. The caller never submits history (this is load-bearing: caller-supplied history would reopen the ruled-out runner-side-computation shape and a curated-window gaming surface).
- **Response:** per candidate, `{ gapRef, passedNoveltyCheck, noveltyConfidence }` (wire names mirroring the approved `GeneratedCandidate` fields) plus one per-call disclosure block: `window: { rows_in_window, window_days, max_rows, basis: 'credential_ref' }`.
- **The starved-window honest outcome (Q-C, ruled — build this exactly, it is the session's most load-bearing wiring detail):** when the window carries fewer than `EVIDENCE_FLOOR` rows **in total** (not the matching-row count `assessStructuralNovelty` currently computes and exposes — a genuinely different quantity), return `passedNoveltyCheck: true`, `basis: 'insufficient_history'`, `noveltyConfidence: 0`. The mentor's own instruction: *"the basis check must read total window size, not the matching-row count the function currently computes, because the distinction matters — a populated window with no matching rows is the genuinely novel case, not the starved-window case. The function does not currently receive or expose total window size; the build must wire this."* This means `assessStructuralNovelty` (or the route calling it) needs a new parameter/return field carrying total window size — a small, deliberate extension of the dark function, not a re-design.
- **Friction candidates:** the existing `{ novel: true, confidence: 0 }` behaviour for a candidate with neither structural axis is surfaced unchanged.
- **Cost/rate posture:** no LLM call (pure computation), no `loop_billing_events` write, no cost headers — disclosed as a decision, not an omission. Rate-limit bucket: **`publicAgent` (30/min/IP)**, matching the discernment sibling — **never `scoring`** (the standing lesson: `scoring` is IP-shared with `/api/reason` and would couple this surface to the measured instrument; memory `rate-limit-bucket-couples-to-measured-surface`).
- **Flag:** dark behind a **new** `SUBSTRATE_FRESH_ENABLED`, UNSET everywhere ⇒ honest **503, zero work**. Flag-off byte-identity is battery-asserted, not merely claimed.
- **What this route deliberately does NOT do** (carry into the code comments): no verdict modification of any guardrail/`/api/reason` result; **no trust-event write of its own** — this is settled ground per the ruling (*"the endpoint writes no trust event; any future novelty event class is a new question for the mentor"*), not an open question to re-derive; no generation content (heuristics/prompts/thresholds stay out of scope); no persistence — stateless per call, the runner stores results; nothing reaches S10 or the public trust record.

### Step 2 — The Q6 code follow-up (decide explicitly, per the pre-condition above)

If elected at open: add the seventh `'terminated_by_timeout'` value to `GeneratedCandidate.cycleOutcome` in `idea-loop-types.ts`, matching the ruled vocabulary (`watching` scope §1 item 4, `fresh` scope §2.8's confirmation). This is a one-line type-union edit; if elected, regression-test that nothing currently consuming the type breaks (it's dark/unconsumed, so this should be a no-op check).

### Step 3 — Battery

Required review dimensions carried by the ruling (§2.9 of the `fresh` scope, confirmed): the structural-novelty-only limitation disclosed in the endpoint's response documentation (two structurally identical but substantively different actions are indistinguishable — content novelty is a named future upgrade, not required now). Plus the house-standard set for a dark-flag build: flag-off byte-identity (503, zero work, zero DB touch); the `insufficient_history` basis fires on total-window-size, not matching-row-count (a fixture with a populated-but-non-matching window must NOT trigger it — this is the exact case the ruling distinguished); input-cap rejection paths; the batch/`gapRef`-echo round-trip; `publicAgent` rate-limit wiring (not `scoring`). `tsc` clean; `npm run build` clean (route registered, no non-handler export errors — the standing Next route-export lesson).

### Step 4 — Adversarial review (PR19)

Independent review before this build is treated as done — ruling-fidelity (the built route matches every ruled field exactly, especially the `insufficient_history` wiring detail and the settled no-trust-event statement); PR20 compliance (every mechanism-fact claim in code comments/docs traces to actual code); boundary compliance (nothing here activates the flag, builds `watching`, or touches the generation-side/runner scoping items). **Pause before and after the review for the founder's model-settings changes**, per this arc's standing practice.

### Step 5 — Records

Decision-log entry (lean form, `code-elevated`). Session close, updating the build-order note at the top of this file (or superseding it with a fresh `watching`-build prompt) so the next session knows this one is done and `watching` is next.

## What this session does NOT do

- Does not flip `SUBSTRATE_FRESH_ENABLED` in production — activation is its own founder-walked `code-critical` step, at or after this build, not pre-approved here.
- Does not build `watching` or the generation-side runner code (next in the order, above).
- Does not touch the runner scoping session's items (credential mint, `watching_write` provisioning, `ORIENTATION_DELIVERY_TIMEOUT_MS`) — those wait for their own session, after both `fresh` and `watching` are built per the amended Q11 sequence.
- Does not re-open anything ruled — the brief's Q1–Q11, the `fresh` scope's own §1/§2, the `watching` scope, the generation-step scope's QG-A/B/C/D.
- Does not touch C1c-original, D4, the Stoa activation, W1–W3, B6, the permission-layer items 14–17, or the ATRF/Consciousness-and-Continuity Obligation additions (all independent, untouched by this arc).

## Rollback path

`git revert` the build commit — the route is dark (flag unset), so nothing live is affected regardless.

## Forecast

Success = `fresh` built exactly to the ruled shape (especially the `insufficient_history` total-window-size wiring), battery green, flag-off byte-identity proven, PR19 clean or folded, and dark on push. Next session: build `watching` (its own `code-critical` session — the `watching_write` capability CHECK widening is a founder-walked step at that build's own open, not before).

End of prompt.
