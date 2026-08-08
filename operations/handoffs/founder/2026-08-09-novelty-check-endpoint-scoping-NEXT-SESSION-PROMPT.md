# Next-Session Prompt — novelty-check endpoint ("fresh"): SCOPING (the first item of the ruled post-brief sequence)

> **Naming (settled by the mentor's 2026-08-09 project-context instruction, after this prompt was first authored):** the novelty check endpoint's settled surface name is **`fresh`** — no switch suffix (a server-side seam wrapping `assessStructuralNovelty`; no independent human-switched operational state). The per-cycle dashboard surface is **`watching`**; the loop mechanism is **`idea-on` / `idea-off`**; the runner's agent identity is **`sagereasoning:idea-loop@v1`**. The full register lives in the project context document's SETTLED SURFACE NAMES section (`D-PROJECT-CONTEXT-MENTOR-UPDATE-APPLIED-2026-08-09`). Use these names in the scope document.

**Stream:** founder.
**Tier:** `governance` / design (explore-scope) — a scope document offered for mentor review. **No code, schema, flag, credential, or public-surface change. No build.**
**Governing frame:** `/adopted/standing-protocol-cache.md`.
**Predecessor close:** `operations/handoffs/founder/2026-08-09-autonomous-loop-design-brief-scoping-CLOSE.md`.
**Predecessor decision entries:** `D-AUTONOMOUS-LOOP-DESIGN-BRIEF-SCOPED-2026-08-09`; `D-AUTONOMOUS-LOOP-DESIGN-BRIEF-RULED-2026-08-09` (the rulings this session executes the first step of; verbatim record wins: `operations/agent-circles-2026-08/2026-08-09-mentor-consultation-autonomous-loop-design-brief-rulings-verbatim.md`).
**Risk classification:** Standard under 0d-ii. Critical Change Protocol NOT engaged.

## The named sequence — carried per the mentor's Q11 instruction, binding on this and every subsequent session

> Brief ruled *(done 2026-08-09)* → **novelty-check endpoint scoped (THIS SESSION — its own small item, per Q2)** → per-cycle record table scoped (its own small item, per Q5) → generation-step scope document → first build gate → bounded validation run (mentor-reviewed) → only then any standing-runner design.

**And the Q1 hard constraint, carried as a named hard constraint in every subsequent document, this one included: the loop proposes; it never executes.** Execution is a human act — *"action from virtue requires the agent's own assent"* — and no document in this sequence may revisit that line.

## Why this session matters

The mentor ruled (Q2) that the novelty check's home is **a new dedicated endpoint wrapping the committed-but-dark `assessStructuralNovelty`** (`website/src/lib/substrate/idea-loop-types.ts`) — server-side, per the ruled per-cycle contract ("the examination, the novelty check, and the trust-event write"); runner-side computation is ruled out; a guardrail-response extension was considered and set aside as complexity on a load-bearing endpoint. The ruling also fixed that this is **a server-side seam question, not generation content** — hence its own small scoping item, ahead of the generation-step scope document. This session produces that scope document and offers it to the mentor. Scoping only; the endpoint is not built here.

## Pre-conditions

1. The design-brief records commit (brief + verbatim rulings record + folds + close) is committed and pushed (founder).
2. Confirm at open that the session's hook framed (quota memory: `api-key-1-per-day-limit-masks-as-401`; the s9-loop limits stand at 2000/20000).
3. No new mentor guidance has superseded the Q11 sequence or any ruling (ask the founder at open — before drafting, per the predecessor session's lesson).

## Part A — Open under the protocol

Read in order:
1. `/adopted/standing-protocol-cache.md` (~3 min — PR19/PR20 engage; no model-selection row unless the review Workflow runs, which is expected).
2. The predecessor close (above).
3. The verbatim rulings record **in full** — Q2 is this session's charter; Q5/Q11 bound what it must NOT absorb.
4. The ruled brief (`operations/agent-circles-2026-08/2026-08-08-autonomous-loop-design-brief.md`) — §1.6 (the approved novelty specification), §3 items 1/2/6 (the mechanism facts), §8 Q2's ruled annotation.
5. The code the endpoint would wrap, read first-hand (PR20 — mechanism-level facts from the file, not from summaries): `website/src/lib/substrate/idea-loop-types.ts` (`assessStructuralNovelty`, `NoveltyHistoryRow`, the `EVIDENCE_FLOOR` import) and `website/src/lib/substrate/trajectory-delta.ts` (the floor + window constants the spec reuses).
6. The C2 scope document §3 (`operations/agent-circles-2026-08/2026-08-06-c2-orientation-reading-and-c1c-trust-event-scope.md`) — the approved novelty specification's source, including `noveltyConfidence` and the structural-novelty-only limitation (a confirmed, required PR19 review dimension).

Confirm at open: tier; hold-point status (P0 0h); status vocabulary; signals/risk class.

## Part B — Procedure

### Step 1 — Consolidate what Q2 settled
One section states, with citations: the endpoint is new and dedicated; it wraps the existing dark pure function (which is not re-designed here); it is server-side per the ruled per-cycle contract; the guardrail-extension and runner-side options are closed. Nothing in that list is re-opened.

### Step 2 — Scope the endpoint (proposals, not decisions)
As proposals for the mentor: the route path and method; auth (which UPC capability — noting the Q3 ruling that the runner will present a dedicated credential, scoped at the runner session, so this document names the capability class without minting anything); the request shape (what the caller submits for comparison — noting `NoveltyHistoryRow`'s existing shape and whose history the check reads, which interacts with the Q3 identity ruling); the response shape (`passedNoveltyCheck` + `noveltyConfidence` per the approved spec); honest-outcome handling (insufficient history below `EVIDENCE_FLOOR` — the house evidence-floor discipline: never a defaulted pass or fail); rate/cost posture (the check is pure computation over a windowed read — no LLM call; state that as a mechanism fact); flag posture (dark until activation, the house pattern); and what the endpoint deliberately does NOT do (no verdict modification, no trust-event write of its own unless the mentor rules one, no generation content). Every genuinely open question is named as a question for the mentor.

### Step 3 — Adversarial review (PR19)
Independent review before the scope is offered — Q2-fidelity (nothing ruled re-opened; nothing open silently resolved), the structural-novelty-only limitation carried as the required review dimension, PR20 compliance for the mentor-facing form, and boundary compliance (no build step in disguise). Spend-limit fallback per the standing template if the Workflow dies.

### Step 4 — Records
Decision-log entry (lean form); session close; the scope offered to the founder for relay to the mentor. **The session ends there — the per-cycle record table scoping (the sequence's next item) is not opened until the mentor rules on this scope.**

## What this session does NOT do

- Does not build the endpoint, edit `idea-loop-types.ts` (including the pending `'terminated_by_timeout'` seventh value — a named code follow-up for the next code session that touches the module), or change any schema/flag/credential.
- Does not scope the per-cycle record table (next in sequence, its own item per Q5) or the generation-step content (later, per Q11).
- Does not touch the two registered defects, C1c-original, D4, the Stoa activation, W1–W3, B6, or the permission-layer items.
- Does not revisit any ruling — including the Q4 carry-forward ("revisit `ORIENTATION_DELIVERY_TIMEOUT_MS` when runner timeout behaviour is established"), which waits for the runner session.

## Rollback path

Documents only — `git revert` the records commit.

## Forecast

Success = a small, mentor-reviewable endpoint scope faithful to Q2, with open questions named and the build boundary intact. Next after the mentor's ruling: the per-cycle record table scoping (per Q5 — its required fields are already fixed by the ruling), then the generation-step scope document, then the first build gate.

End of prompt.
