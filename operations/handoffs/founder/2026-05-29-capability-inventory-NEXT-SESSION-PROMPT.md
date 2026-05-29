# Next-Session Prompt — First-Pass Capability Inventory (0h criterion 4)

**Stream:** founder.
**Tier:** `governance` (documentation/assessment only; lean templates per `/adopted/standing-protocol-cache.md` §"Work categories"). **No code; no production change; no governance document modified.** The output is an assessment deliverable.
**Governing frame:** `/adopted/standing-protocol-cache.md` + `/adopted/build-sessions-protocol-cache.md` ("no current users" holds).
**Predecessor session close:** `/operations/handoffs/founder/2026-05-29-capability-inventory-direction-close.md`.
**Predecessor decision-log entries:** `D-CONFIG-AUDIT-DIRECTION-CAPABILITY-INVENTORY-2026-05-29`; `D-CONFIG-AUDIT-FINDINGS-REVIEWED-2026-05-29`.
**Risk classification:** **Standard** under 0d-ii (assessment + documentation; reads code/registry read-only; writes only a `/drafts/` deliverable + decision-log + close). Critical Change Protocol NOT engaged. AC7 not engaged. PR6 not engaged.
**Primary deliverable:** fill `/drafts/2026-05-29-capability-inventory-skeleton.md` into a first-pass capability inventory, seeded from `/website/public/component-registry.json`.

## Why this session matters

The founder ran a thought experiment on what dimensions of "approved configurations of product use" deserve attention, and — after an adversarial review of the prior AI's findings — approved doing this as the **0h capability inventory** rather than a bespoke catalog. This session is the 0h hold-point work that gates P1 (business plan review): a clear-eyed catalogue of every configuration's true status and per-audience readiness across the dimensions, grounded in the existing component registry rather than built on spec. It answers the founder's original question by **assessment, not implementation** — and produces a ranked gap list that decides what to build/test next (including whether finishing the Option A build arc, S5 + C2 live, is the top gap, or whether something else — e.g. R17 genuine deletion, currently a 503 stub — outranks it).

This session does NOT build any dimension. It assesses. Implementation happens afterward, in P1–P7 priority order, informed by the ranking this session produces.

## Pre-conditions (founder confirms at session open)

1. **Configuration rows (the L1–L7).** The skeleton lists seven candidates (C1–C7): `/api/reason`, `/api/calling`, `/api/practice/reflect`, `/api/mentor/private/reflect`, Sage Assent surfaces, website human-facing tools, future plugin-internal tools. The AI asks via AskUserQuestion to confirm/correct the set and count. **Do not proceed with an assumed list.**
2. **Dimension columns (the 11).** The skeleton lists D1–D11 (PR14-grounded). Confirm, trim, or add at session open.
3. **AEO** is recorded as **Agent Engine Optimisation** (the agent analogue of SEO — discovery + ranking/selection in agent ecosystems; agent-card.json/llms.txt are table stakes). Confirm it still reads right.
4. **Registry currency.** `component-registry.json` is v1.5.0 / 2026-05-02 — it predates the Option A arc (S1–S5) and is ~4 weeks stale. It is the **seed**, not the truth. The founder elects at Step 1 (c) whether this pass also *reconciles* the registry to current reality or merely *notes* the staleness per cell (recommendation: note-and-defer the reconciliation — a registry rewrite is its own session).

If any pre-condition is unresolved, settle it before filling cells.

## Part A — Open under the protocol

Read in order (governance tier — lean reads):

1. `/adopted/standing-protocol-cache.md` (~3 min — tier, risk class, signals, the AI-failure-modes subsection, lean templates).
2. `/adopted/build-sessions-protocol-cache.md` — "no current users" holds; the component-registry is the migration source-of-truth.
3. This prompt + the predecessor close in full.
4. `/drafts/2026-05-29-capability-inventory-skeleton.md` — **the deliverable to fill.**
5. `/drafts/2026-05-29-configuration-audit-thought-experiment-REVIEW.md` §A (the dimension reasoning + the PR14/audience grounding) and the findings doc `/drafts/2026-05-28-configuration-audit-thought-experiment-findings.md` §2 (the prior AI's dimension prose, for reference).
6. `/adopted/project-instructions-snapshot.md` §0h (hold-point exit criteria — this session advances criteria 1–4) and §PR14 (the ten-domain frame the columns are grounded in).
7. `/website/public/component-registry.json` — the seed. Note its per-component fields: `status` (0a), `humanReady`, `agentReady`, `deps`, `blocker`, `rules`, `journey`, `priority`, `path`, `type`.

Confirm at open (narrate before any work, per the cache's failure-modes subsection): where we are in the arc (post-review, direction set to capability-inventory); what's queued (this inventory → ranked gap list → P1–P7 work in priority order); what's awaiting the founder (row/column confirmation + Step 1 CCP items); what's awaiting the AI (seed + fill + rank + decision-log + close). Model selection: N/A (no LLM calls). KG scan: N/A (governance).

## Part B — Procedure (governance; lean CCP)

### Step 1 — Lean CCP drafted in chat
Visible in chat; founder OK before filling. Items: (a) confirmed row set (L1–L7); (b) confirmed column set (D1–D11); (c) registry reconcile-now vs note-and-defer. What could break: negligible (assessment-only; rollback = `git rm` the filled deliverable / revert). Verification: founder reads the inventory directly (0c). **Wait for "OK to (a)(b)(c)".**

### Step 2 — Confirm configuration rows
AskUserQuestion to confirm/correct the seven candidate rows and their primary audience(s).

### Step 3 — Seed the matrix from the registry
For each configuration row, pull the relevant components' `status`, `humanReady`, `agentReady`, `blocker`, `deps` from `component-registry.json`. Pre-fill the D-columns where the registry already answers (notably the audience-readiness depth). Flag every seeded value "(seed — verify; registry is 2026-05-02)".

### Step 4 — Fill the assessable cells
For each (configuration × dimension) cell that is assessable pre-users, record: status (0a), human-readiness, agent-readiness, gap (one line), severity (blocker/significant/minor/cosmetic). Mark usage-dependent cells (most of D7 economics, the dashboard part of D9) `⏸ deferred-until-traffic`. Honest "Wired-not-Verified-live" on D1/D2 for C1–C3 (Option A).

### Step 5 — Produce the ranked gap list
Order the gaps by `severity × launch-criticality` (does the gap block one of the 11 MVP launch criteria, P6?) within P1–P7 priority order. This is the session's headline output: the founder's prioritised "what to do next," with finishing Option A, the per-dimension deep-dives, and the discoverability/AEO work all appearing as *ranked items*.

### Step 6 — Decision-log entry (lean form)
Per `/adopted/standing-protocol-cache.md` §"Lean decision-log entry". Entry: `D-CAPABILITY-INVENTORY-FIRST-PASS-YYYY-MM-DD`. Status: Adopted (the inventory is adopted as a deliverable; promotion `/drafts/`→`/adopted/` is a later founder-gated step).

### Step 7 — Session close (lean form)
Per the cache's "Lean session close". Production state at close: **UNCHANGED**. Next session: the top-ranked gap from Step 5, worked in its P1–P7 home.

## Part C — Anticipated session shape

| Phase | Estimate |
|---|---|
| Cache + close + skeleton + review §A + registry read | 25–40 min |
| Step 1 CCP + founder OK (a)(b)(c) | 10–15 min |
| Step 2 row confirmation | 10–15 min |
| Step 3 registry seed | 20–35 min |
| Step 4 fill assessable cells | 45–75 min |
| Step 5 ranked gap list | 20–30 min |
| Step 6 + 7 decision-log + close | 20–30 min |
| **Total** | **~2.5–3.5 hours** |

Natural pause points: after Step 1 (CCP), after Step 2 (rows), after Step 3 (seed), after Step 5 (ranked list locked).

## Locked context — do NOT re-derive

- The direction is set: a capability inventory, not the prior AI's Option I three-phase catalog. The findings doc's Option I is **Superseded** by `D-CONFIG-AUDIT-DIRECTION-CAPABILITY-INVENTORY-2026-05-29`.
- Option A Session 4 is Verified at the code level; all four R20a flags remain UNSET in Vercel; production is byte-identical. This session does not touch any of it — R20a appears in the inventory as one row (D1/D2 across C1–C3) marked "Wired, not Verified-live."
- Assessment only. No code, no dimension build, no governance amendment, no commits by the AI. Output is the filled `/drafts/` deliverable + decision-log entry + close.
- Branch `main`. The AI does no git operations.

## Rollback path

The inventory is additive (a `/drafts/` file). Rollback = `git rm` the filled deliverable + revert the decision-log + close. No production change to roll back.

## Forecast

The session ends with a first-pass capability inventory (the cube filled for assessable cells, audience depth seeded from the registry) and a ranked gap list ordered by severity × launch-criticality within P1–P7. The founder reads the ranking and picks the top gap to work next — in its existing roadmap home, not a new program. Production remains UNCHANGED. 0h exit criteria 1–4 are materially advanced, moving the project toward the P1 gate.

End of prompt. Opens on `main`. **Standard-risk governance/assessment session — no code, no production change, no execution.**
