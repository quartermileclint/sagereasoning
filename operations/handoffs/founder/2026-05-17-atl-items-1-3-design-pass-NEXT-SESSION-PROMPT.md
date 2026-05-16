# Next-Session Prompt — Items 1–3 Design Pass (post-6b arc, step 2)

**Stream:** founder.
**Tier:** `governance` — **Standard** risk under 0d-ii. **Lean** template. No code changes; no schema changes; no env changes; no production exposure. The session output is design decisions captured in the decision log + (optionally) a small design document if the four decisions warrant one.
**Governing frame:** `/adopted/standing-protocol-cache.md` (general protocol; lean templates) + `/adopted/build-sessions-protocol-cache.md` (build-arc context).
**Predecessor session close:** `/operations/handoffs/founder/2026-05-16-atl-public-accreditation-endpoint-close.md` (the 6b build close — every ATL Wrapper component now Live).
**Predecessor decision-log entries:** `D-ATL-PUBLIC-ACCREDITATION-ENDPOINT-WIRED-VERIFIED-2026-05-16`; `D-ATL-BADGE-SCHEMA-PERSISTENCE-WIRED-VERIFIED-2026-05-15`; `D-ATL-ITERATION-PATTERNS-WIRED-VERIFIED-2026-05-15`.
**Risk classification:** Standard under 0d-ii. **Critical Change Protocol NOT engaged.** PR6 not engaged. AC7 not engaged. AC5 not engaged.
**Sequencing source:** `/operations/handoffs/founder/2026-05-15-post-build-brainstorm-close.md` — this design pass is **step 2 of 8** in the post-6b arc (6b → **items 1–3 design pass** → items 1–3 build → trajectory-enriched hand-back report → kathekon-aligned alternative design pass → kathekon-aligned alternative build → write-path → A10).

---

## Why this session matters

The 2026-05-15 brainstorm confirmed three small, additive enhancements to the ATL Wrapper — items 1, 2, and 3 — as the immediate next work after 6b. They are R0-aligned, R18a-honest, and PR15-respectful (the ATL is the per-node evaluator; we don't reimplement tree search). But they are **confirmed in principle, not yet designed in detail.** This session does the design — it locks four decisions so the items 1–3 build session has a clean spec to execute against.

The build session that follows this design pass will be `code-elevated` (additive changes to `EvaluatedAction` / `Layer2Assessment` schemas + a small carried-context field shape + possibly a helper or two). This design pass keeps that session straightforward.

The decisions are not large. The session is bounded (~2–3 hr). The output is one decision-log entry recording the four locked decisions; optionally a small design document at `/adopted/` if the founder wants a referenceable design surface.

## What was decided in the brainstorm — DO NOT re-litigate

Read these from the brainstorm close at session-open; they are the frame for this design pass, not items to revisit:

- **Items 1, 2, 3 are confirmed for build.** Scope below.
- **Item 4 (original — alternative generation) is parked permanently** as a future ideation product. Off the post-6b arc.
- **Item 4 reframed (kathekon-aligned alternative in the handoff) is adopted in principle.** Sequenced as steps 5–6 of the post-6b arc — its own design pass after this one. **NOT this session's work.**
- **Layer 1 asked-question multiple-choice (narrowed scope) is adopted in principle** for the onboarding framework first; lower priority for in-loop. **NOT this session's work.**
- **Pre-decision model correction:** the substrate is consulted *during* the agent's deliberation, before commit. Layer 1 captures deliberation, not emitted action. The carried profile records deliberation quality over time. Three composition patterns: Claude self-wrapping, outer-agent-wraps-Claude, substrate-as-Claude-skill. **This frames the items 1–3 design — don't re-derive it.**

## The four design decisions to lock

### Decision A — Where does `deliberation_breadth` live?

**The signal:** whether a committed action was *intuited* (single-pass), *deliberated* (the agent considered alternatives but committed to one), or *multi-branch-deliberated* (the agent ran several substrate consultations and picked among them). The current architecture drops this — the carried profile records the action and the assessment, but not the breadth of the deliberation that produced the action.

**For an R0-driven (oikeiosis-aware) system, this matters:** an agent that habitually intuits is at a different developmental position than one that habitually deliberates across multiple candidates. The carried profile should reflect this so the trajectory measure is honest.

**Open questions to lock:**

1. **Where the field lives** — on `EvaluatedAction` (the carried-profile unit)? On `Layer2Assessment` (the substrate's per-call output)? On both (with `Layer2Assessment.deliberation_breadth` flowing into `EvaluatedAction.deliberation_breadth` via the bridge)? The third option is the cleanest from a data-flow standpoint but adds a field to the substrate's per-call surface.
2. **What values** — a small enum (`intuited / deliberated / multi_branch_deliberated`) or a finer-grained signal (e.g., `candidates_considered: number`)? The brainstorm leaned toward a small enum for the carried-profile aggregation; the finer-grained signal could be a complementary field.
3. **Who supplies it** — the wrapper (it knows whether one or N substrate calls were made for a given action) or the agent (the agent declares its deliberation breadth)? Wrapper-supplied is the gaming-resistant default; agent-declared is a fallback.
4. **Aggregation in `WindowSnapshot`** — does the snapshot expose `deliberation_breadth_distribution` (the proportion of actions intuited vs deliberated vs multi-branch)? This would feed Component 4 (trajectory awareness) directly.
5. **Persistence** — does this affect the badge (Component 3 — `AccreditationRecord` / `AccreditationPayload`)? Brainstorm-default: yes, as a new field on the payload — verifiers care whether an agent deliberates or intuits.

### Decision B — The live-candidates carried-context field shape

**The gap:** Component 5 pattern 2 (parallel evaluation — the agent submits N candidates, gets N agent-mode renderings, picks one) is built; what's missing is the **carry** of the unchosen candidates into the next deliberation loop. Currently when the agent picks a candidate, the unchosen ones disappear. Brainstorm finding 1B: in some patterns the agent should carry the live candidates forward (e.g., to compare against new candidates in the next round, or to revisit if the chosen one fails downstream).

**Open questions to lock:**

1. **The field name** — `live_candidates`? `carried_candidates`? `candidate_branches`? Brainstorm did not lock this.
2. **The field shape** — a list of `EvaluatedAction[]` (the agent's prior assessments, kept around)? A list of richer objects with the original Layer 1 input + Layer 2 assessment + Layer 3 rendering? Trade-off: richer carries more useful context but bloats the carried profile.
3. **Where it lives** — on the carried profile (cumulative across iterations) or in a per-iteration ephemeral context (cleared between deliberations)? The brainstorm leaned ephemeral, but the on-profile option is also coherent.
4. **Cap / pruning policy** — if it's on the carried profile, how many candidates can accumulate before pruning? Top-K (decision C below) is the natural cap — if K=5, retain the top 5 candidates' contexts.
5. **Layer 1 implications** — does this become a new optional Layer 1 input field (alongside `carried_profile` / `peer_agent_assessments` / `objective_function_declaration` / `profile_provenance`)? If yes, this is a versioned change to the open Layer 1 contract — coordinate with Rule A (licensing gate).

### Decision C — Tree-search composition: doc, helper, or pattern?

**The principle (PR15-aligned):** the ATL is the per-node evaluator; tree search (MCTS, BFS, beam search, ToT) stays agent-side or framework-side. We do not reimplement tree search inside the substrate.

**The gap:** an agent developer who wants to compose the substrate with a tree-search algorithm currently has no documented contract for what the per-node evaluation interface looks like or how to wire it. The brainstorm flagged this as a documentation + ergonomics gap — not a re-implementation question.

**Open questions to lock:**

1. **Format of the deliverable** — pure documentation in the spec? A small helper module (e.g., `atl-tree-search-adapter.ts` exposing a function with the per-node-evaluator signature)? A new Component 5 pattern (Pattern 4 — tree-search composition)?
2. **The per-node contract** — is it just `(layer1Input) => Layer2Assessment` (the substrate's existing API)? Or does the contract also specify how the agent should pass the partial trajectory / parent-node carried profile? The brainstorm leaned toward the existing API being sufficient — the wrapper accumulates whatever the agent passes.
3. **Example compositions** — should the deliverable include example wirings for the canonical tree-search algorithms (MCTS / BFS / ToT)? Pseudocode is enough; reference implementations are not required.
4. **PR15 Anthropic-primitive consult — multi-agent orchestration.** The brainstorm flagged that Anthropic's multi-agent-orchestration primitive (public beta) is the natural composition surface for one form of tree-like behaviour. Does the design pass include a section on how the substrate composes with Anthropic's orchestration primitive specifically?

### Decision D — Top-K retention pattern

**The mechanic:** the agent holds N `CarriedProfile` values — one per candidate the agent is considering — and after each iteration prunes back to the top K. Mechanically already possible (it's just an array of carried profiles); the gap is documentation and possibly a small helper.

**Open questions to lock:**

1. **What "top" means** — by what criterion does the agent rank the K? `katorthoma_proximity` of the most recent assessment? `WindowSnapshot.direction_of_travel` over the carry? An agent-supplied `objective_function_declaration` (the gaming-defence field already on `Layer1Schema`)? The brainstorm leaned toward agent-supplied, with a default of `katorthoma_proximity` rank.
2. **Helper or doc?** — if a helper exists, what does it do (`pruneToTopK(profiles, k, comparator?)`) and where does it live (`atl-iteration-patterns.ts`?)? If doc-only, what's the recommended pattern's pseudocode?
3. **Connection to Decision B** — if the live-candidates field is on the carried profile, top-K retention is the natural cap. If it's ephemeral, top-K applies only within a single iteration. Resolve this dependency before locking.
4. **Default K value** — is there a recommended default (e.g., K=5) or is K always agent-specified?

## Pre-conditions

1. **The 6b commit + the hotfix commit are pushed; Vercel green.** `git log --oneline -3 origin/main` shows both commits; the four post-deploy URL checks passed (200/404/200/400 with the documented JSON shapes); the cleanup `DELETE` ran successfully.
2. **`D-ATL-PUBLIC-ACCREDITATION-ENDPOINT-WIRED-VERIFIED-2026-05-16` is in `/operations/decision-log.md`.** Confirm at session open.
3. **The `/api/accreditation/[agent_id]` endpoint is Live** — every ATL Wrapper component (1, 2, 3, 4, 5) is real end-to-end.
4. **No env-var changes; production state unchanged.** Substrate at A7 Verified; all flags UNSET; `/api/reason` byte-identical.
5. **Founder commits to a ~2–3 hr bounded design session.** Mid-session founder input expected at the four design-decision gates (one per decision A–D).

## Part A — Open under the protocol

Read in order:

1. `/adopted/standing-protocol-cache.md` (~3 min) — confirm tier (`governance`), risk class (Standard), lean template applies, model selection N/A.
2. `/adopted/build-sessions-protocol-cache.md` (~3 min) — build-arc context.
3. `/operations/handoffs/founder/2026-05-16-atl-public-accreditation-endpoint-close.md` (~5 min) — the 6b close.
4. `/operations/handoffs/founder/2026-05-15-post-build-brainstorm-close.md` (~5 min) — the brainstorm-close that confirmed items 1–3 + the four forward-planning decisions. **Read in full** — this is the frame for the design pass.
5. `/adopted/substrate-modes/agent-trust-layer-wrapper-spec.md` — targeted: §"Component 1 — The Wrapper / carried-profile mechanism" (the EvaluatedAction mapping table); §"Component 4 — Trajectory awareness" (the WindowSnapshot fields); §"Component 5 — The three iteration patterns" (the existing patterns and where pattern 4 might fit); §"Layer 1 implications" (the four optional fields the wrapper currently populates); §"Open questions deferred to build" (4, 5).
6. `/website/src/lib/substrate/trust-layer/types/accreditation.ts` — targeted: `EvaluatedAction` shape; `WindowSnapshot` shape if defined here; `AccreditationPayload` shape (for the Decision A persistence question).
7. `/website/src/lib/substrate/atl-iteration-patterns.ts` — targeted: the three pattern handlers + any existing parallel-evaluation helpers (the Decision B/D dependencies).
8. `/website/src/lib/substrate/atl-bridge.ts` — targeted: the Layer2Assessment → EvaluatedAction mapping function (the Decision A "via the bridge" option).
9. `/operations/decision-log.md` — last 3 entries.
10. **PR15 consult:** `.claude/skills/anthropic/` — `mcp-builder` (R18c interoperability — the per-node-evaluator contract could later be exposed as an MCP server), the Anthropic multi-agent-orchestration primitive (the Decision C question 4). **PR11 inbox scan:** `/inbox/` for files dated since the 6b close (2026-05-16).

**Confirm at session open:** tier (`governance`), risk class (Standard), lean template, model selection N/A, status vocabulary, signals, AC5/AC7/PR6 not engaged.

## Part B — Procedure

### Step 0 — Confirm scope (~3 min)

State the scope: lock four design decisions (A, B, C, D) for items 1, 2, 3. Confirm NOT in scope: writing any code; building items 1–3 (their build session is the next one); designing the kathekon-aligned alternative (steps 5–6 of the post-6b arc); designing the Layer 1 multiple-choice; designing the write-path; designing A10. Founder confirms.

### Step 1 — Decision A: `deliberation_breadth` (~25–35 min)

Walk through Decision A's five open questions; surface the trade-offs; the founder elects. Lock all five sub-decisions. Output: a 5–8-line summary of the locked design ready for the decision-log entry.

### Step 2 — Decision B: live-candidates carried-context field (~25–35 min)

Walk through Decision B's five open questions; surface the trade-offs; the founder elects. Lock the field name, shape, location (profile vs ephemeral), cap/pruning, and Layer 1 implication. Output: a 5–8-line summary.

### Step 3 — Decision C: tree-search composition (~25–35 min)

Walk through Decision C's four open questions. PR15 consult engages here — surface what Anthropic's multi-agent-orchestration primitive provides and whether it changes the format choice. Lock the deliverable format (doc / helper / pattern), the per-node contract scope, the example-composition list, and the PR15 fold-in. Output: a 5–8-line summary.

### Step 4 — Decision D: top-K retention (~15–25 min)

Walk through Decision D's four open questions. Resolve the Decision B dependency (if live-candidates is on the carried profile, top-K is the cap). Lock the ranking criterion, helper-or-doc, default K. Output: a 5–8-line summary.

### Step 5 — Append decision-log entry (lean form)

One entry capturing all four decisions: `D-ATL-ITEMS-1-3-DESIGN-LOCKED-YYYY-MM-DD`. Lean form per `/adopted/standing-protocol-cache.md`. Rules served expected: 0a, 0c, 0d-ii, 0f, R0 (the deliberation-breadth signal serves the oikeiosis audit trail), R18a (the badge-impact decision under A respects Character Kernel scope), R4 (the persistence-impact decision respects the IP boundary), AC8 (substrate carriage), PR1 (single-build proof — items 1–3 build is one session, then verify before any further extension), PR7 (decisions made + decisions deferred — the kathekon-aligned alternative + Layer 1 multiple-choice + write-path + A10 named as deferred), PR10 (PEV — Plan step is this session; Execute is the build session; Verify is post-build), PR11 (inbox scan), PR15 (Anthropic-primitive consult engaged on Decision C).

### Step 6 — Optional small design document

If the four locked decisions warrant a referenceable design surface (founder elects), produce `/adopted/atl-items-1-3-design.md` (lean, ~80–150 lines) capturing the four decisions in implementable detail. Otherwise the decision-log entry is sufficient.

### Step 7 — Session close (lean form)

`/operations/handoffs/founder/YYYY-MM-DD-atl-items-1-3-design-pass-close.md` per the lean template. **"Next Session Should" names the items 1–3 build session** — `code-elevated` (additive `EvaluatedAction` / `Layer2Assessment` schema additions; small carried-context field; possibly one or two helpers; updated tests for the existing iteration patterns + new tests for the additions). Pre-conditions: this design pass committed + pushed; the four design-locked summaries are the build spec.

## Part C — Anticipated session shape

| Phase | Estimate |
|---|---|
| Caches + 6b close + brainstorm close + spec sections + types + iteration patterns + bridge + PR15 consult (Part A) | 25–35 min |
| Step 0 — scope confirm | 3 min |
| Step 1 — Decision A | 25–35 min |
| Step 2 — Decision B | 25–35 min |
| Step 3 — Decision C | 25–35 min |
| Step 4 — Decision D | 15–25 min |
| Step 5 — decision-log entry | 15–20 min |
| Step 6 — optional design document | 30–40 min (skip if not elected) |
| Step 7 — session close | 15–20 min |
| **Total** | **~2.5–3.5 hr** (3.5–4 hr with the design document) |

## Rollback path

This is a governance session — no code, no schema, no env changes. "Rollback" means: if the founder reconsiders any of the four locked decisions before the items 1–3 build session, append a superseding decision-log entry (`D-ATL-ITEMS-1-3-DESIGN-REVISED-YYYY-MM-DD`) marking the prior entry `Superseded by D-…`. No production-state recovery needed.

## Forecast

A successful design pass produces four locked decisions ready for the items 1–3 build session. After the build session lands, the carried profile carries `deliberation_breadth`, the wrapper carries live candidates with a documented shape and a known cap, agent developers have a documented contract for tree-search composition, and top-K retention is a named pattern with (optionally) a small helper. **That makes the trajectory-enriched developer hand-back report buildable** — the report is much richer once it has the deliberation-breadth signal and the live-candidates context. After the hand-back report, the kathekon-aligned alternative design pass kicks off (step 5 of the post-6b arc).

End of prompt.
