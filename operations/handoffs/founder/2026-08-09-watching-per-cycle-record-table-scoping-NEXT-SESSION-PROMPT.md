# Next-Session Prompt — `watching` (the per-cycle record table): SCOPING (second item of the ruled post-brief sequence)

**Stream:** founder.
**Tier:** `governance` / design (explore-scope) — a scope document offered for mentor review. **No code, schema, flag, credential, or public-surface change. No build.**
**Governing frame:** `/adopted/standing-protocol-cache.md`.
**Predecessor close:** `operations/handoffs/founder/2026-08-09-fresh-novelty-endpoint-scoping-CLOSE.md`.
**Predecessor decision entries:** `D-FRESH-NOVELTY-ENDPOINT-SCOPED-2026-08-09`; `D-FRESH-ENDPOINT-SCOPE-RULED-2026-08-09` (verbatim record wins: `operations/agent-circles-2026-08/2026-08-09-mentor-consultation-fresh-endpoint-scope-rulings-verbatim.md`).
**Risk classification:** Standard under 0d-ii. Critical Change Protocol NOT engaged.

## The named sequence — carried per the mentor's Q11 instruction, binding on this and every subsequent session

> Brief ruled *(2026-08-09)* → `fresh` endpoint scoped and ruled *(2026-08-09)* → **per-cycle record table (`watching`) scoped (THIS SESSION — its own small item, per Q5)** → generation-step scope document → first build gate → bounded validation run (mentor-reviewed) → only then any standing-runner design.

**And the Q1 hard constraint, carried as a named hard constraint in every subsequent document, this one included: the loop proposes; it never executes.** No document in this sequence may revisit that line.

## Why this session matters

The mentor ruled (Q5, then reconfirmed at the `fresh` ruling's own sequencing note) that the per-cycle record table is its own small scoping item — a server-side schema/route question, not generation content. Its **required fields are already fixed by the ruling**: the four outcomes (winner / null_cycle / dependency_unavailable / timeout), per-candidate guardrail results with heuristic attribution (Q7), cost, elapsed time against `maximumDuration`, and `loopId`. This session produces that scope document.

**One genuine open question this session must carry, not resolve by default:** the `fresh` ruling named a carry-forward — *"the dependency_unavailable / null-cycle distinction for the fallback counter — the brief's §1.3 carry-forward that was named but not yet resolved. If that distinction is not already settled in the corpus, the watching scope document should surface it as an open question rather than resolve it by default."* Checked at the predecessor session's close: it is **not settled**. The brief's carry-forward note (ii) pointed to "Q6's territory," but Q6 ruled only the seventh `cycleOutcome` value (`'terminated_by_timeout'`) — it never addressed whether a `dependency_unavailable` cycle counts toward, resets, or is excluded from the "three consecutive null cycles" fallback trigger (brief §1.3: the fallback rule counts *null* cycles specifically; `dependency_unavailable` is stated only as "honestly distinct" from a null cycle, brief line 51). **Do not resolve this by inference from the pointer — re-verify the corpus first-hand, then raise it as a named open question for the mentor if it is still unresolved.**

## Pre-conditions

1. The `fresh` scope records commit (scope document + verbatim rulings record + mirror update + this prompt + decision-log entries + close) is committed and pushed (founder).
2. Confirm at open that the session's hook framed (quota memory: `api-key-1-per-day-limit-masks-as-401`; the s9-loop limits stand at 2000/20000).
3. No new mentor guidance has superseded the Q11 sequence or any ruling — ask the founder at open, before drafting.

## Part A — Open under the protocol

Read in order:
1. `/adopted/standing-protocol-cache.md` (~3 min).
2. The predecessor close (above).
3. The `fresh` verbatim rulings record **in full** (`operations/agent-circles-2026-08/2026-08-09-mentor-consultation-fresh-endpoint-scope-rulings-verbatim.md`) — its final "Sequencing confirmation" section is this session's charter.
4. The `fresh` scope document itself (`operations/agent-circles-2026-08/2026-08-09-fresh-novelty-endpoint-scope.md`) — now RULED; §2.4's response shape (`gapRef`, `passedNoveltyCheck`, `noveltyConfidence`, the `window` disclosure block) and §2.8's settled no-trust-event statement are inputs the per-cycle record must be compatible with.
5. The autonomous-loop design brief's rulings — Q5 (the table's required fields, verbatim), Q6 (`cycleOutcome` gains `'terminated_by_timeout'`), Q7 (rejected-candidate visibility with heuristic attribution), §1.3 (the fallback rule + the `dependency_unavailable` distinction, un-cited pointer) — `operations/agent-circles-2026-08/2026-08-08-autonomous-loop-design-brief.md`.
6. The code the table's fields describe, read first-hand (PR20): `website/src/lib/substrate/idea-loop-types.ts` (`GeneratedCandidate.cycleOutcome`'s current six values — the seventh, `'terminated_by_timeout'`, is ruled but not yet in the committed code; do not assume it is present without checking).
7. The house dashboard pattern (PR20 mechanism fact, brief §3 item 9): the repo's only live dashboard pattern is a GET route polled by the page, no push/websocket anywhere — confirm this still holds before proposing the table's read path.

Confirm at open: tier; hold-point status (P0 0h); status vocabulary; signals/risk class.

## Part B — Procedure

### Step 1 — Consolidate what Q5/Q6/Q7 settled
One section states, with citations: the table is its own small item, scoped separately from generation content; its required fields (the four outcomes, per-candidate guardrail results with heuristic attribution, cost, elapsed time, `loopId`); the seventh `cycleOutcome` value is ruled and must be reflected in the table's outcome vocabulary even though the type module hasn't been edited yet (named as a code follow-up, not resolved here); rejected candidates are recorded with full transparency (Q7) because the per-cycle record is the founder's operational dashboard, not the public trust record.

### Step 2 — Scope the table (proposals, not decisions)
As proposals for the mentor: the schema (columns, types, one row per cycle vs. one row per candidate — note the tension between a cycle-level row and Q7's per-candidate rejected-guardrail-result requirement, and propose a shape, e.g. a cycle table + a candidate table, or one denormalised table); the GET route + dashboard page (per the confirmed house pattern); retention/data-rights posture (does this table need an owner-scoped delete/export path, per the house R17 discipline every other trust-adjacent table carries); how `loopId` and `sessionId` compose in the row (the brief's §1.4 note: *"they must not be conflated, and the generation-step scope document must name how they compose in a trust-event write"* — this document is not the generation-step scope document, so name the table's own composition without pre-empting that later document); flag posture (dark until activation, the house pattern). Every genuinely open question is named as a question for the mentor — **including the re-verified `dependency_unavailable`/fallback-counter distinction** from "Why this session matters" above.

### Step 3 — Adversarial review (PR19)
Independent review before the scope is offered — Q5/Q6/Q7-fidelity (nothing ruled re-opened; nothing open silently resolved); PR20 compliance (every mechanism-fact claim traced to actual code, especially the `cycleOutcome` seventh-value gap); boundary compliance (no build step in disguise; the generation-step content is not scoped here). Spend-limit fallback per the standing template if the Workflow dies.

### Step 4 — Records
Decision-log entry (lean form); session close; the scope offered to the founder for relay to the mentor. **The session ends there — the generation-step scope document (the sequence's next item) is not opened until the mentor rules on this scope.**

## What this session does NOT do

- Does not build the table, edit `idea-loop-types.ts` (the pending `'terminated_by_timeout'` value remains a named code follow-up, plausibly for whichever session builds `fresh` or `watching` first — not resolved here), or change any schema/flag/credential.
- Does not scope the generation-step content (next in sequence, per Q11) or the `fresh` endpoint (already scoped and ruled).
- Does not touch the two registered defects, C1c-original, D4, the Stoa activation, W1–W3, B6, or the permission-layer items.
- Does not revisit any ruling — including the Q4 carry-forward (waits for the runner session) or anything ruled in the `fresh` scope.

## Rollback path

Documents only — `git revert` the records commit.

## Forecast

Success = a small, mentor-reviewable table scope faithful to Q5/Q6/Q7, with the `dependency_unavailable`/fallback-counter distinction correctly surfaced as open (re-verified, not assumed), and the build boundary intact. Next after the mentor's ruling: the generation-step scope document, then the first build gate.

End of prompt.
