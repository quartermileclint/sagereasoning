# Session Close — 2026-05-16 — ATL Wrapper Items 1–3 Design Pass

**Stream:** founder.
**Governing frame:** `/adopted/standing-protocol-cache.md` (general protocol — `governance` / Standard / lean template) + `/adopted/build-sessions-protocol-cache.md` (build-arc context).
**Tier:** `governance` — **Standard** risk under 0d-ii. **Lean** template. No code, no schema, no env, no production exposure. AC5 / AC7 / PR6 not engaged. Critical Change Protocol not engaged.
**Date:** 2026-05-16.
**Operative session prompt:** the items 1–3 design pass prompt provided at session open (sequenced as step 2 of 8 in the post-6b arc per the 2026-05-15 brainstorm sequencing).

---

## What this session did

Locked the design for ATL Wrapper items 1, 2, and 3 — the post-6b enhancement arc, step 2 of 8. Four design decisions taken:

**Part A — opened under the protocol.** Read both caches; the 6b close (every ATL Wrapper component Verified end-to-end); the 2026-05-15 brainstorm close (the sequencing source); the Wrapper spec targeted (§Component 1 + §Component 4 + §Component 5 + §Layer 1 implications + §Open questions); `trust-layer/types/evaluation.ts` + `trust-layer/types/accreditation.ts` (EvaluatedAction + WindowSnapshot + AccreditationRecord + AccreditationPayload shapes); `atl-bridge.ts` (the BridgeContext + the idempotence rationale that forces Decision A's location); `atl-iteration-patterns.ts` (Pattern 2's open-question-4 closure + the Anthropic multi-agent-orchestration PR15 consult retained for Decision C); the last 2 decision-log entries (6a + 6b). PR11 inbox scan: no new files in `/inbox/` since the 6b close (2026-05-16). PR15 consult: `.claude/skills/anthropic/` reviewed; `mcp-builder` forward pointer for R18c interoperability noted; the multi-agent-orchestration finding from `atl-iteration-patterns.ts` is retained and folded into Decision C's deliverable. No bespoke election to justify — Decision C elects a small helper that does NOT reimplement an Anthropic primitive.

**Step 0 — scope confirm.** Founder confirmed scope: lock four design decisions (A, B, C, D); NOT in scope — code, items 1–3 build, kathekon-aligned alternative design, Layer 1 multiple-choice, write-path, A10.

**Step 1 — Decision A: `deliberation_breadth`.** Five sub-decisions walked through; founder elected all recommendations. Locked: new fifth `BridgeContext` field `candidates_considered: number` (wrapper-supplied; no agent-declared fallback) maps onto `EvaluatedAction`. `Layer2Assessment` stays idempotent. A `DeliberationBreadth` enum (`intuited` / `deliberated` / `multi_branch_deliberated`) is derived at aggregation time using N=1 / N=2 / N≥3 thresholds — tunable later without data migration. `WindowSnapshot` gains `deliberation_breadth_distribution` + `typical_deliberation_breadth`. `AccreditationRecord` + `AccreditationPayload` gain `typical_deliberation_breadth` — R18a-observable credential; R18c-interoperable additive schema version.

**Step 2 — Decision B: `carried_candidates`.** Five sub-decisions walked through; founder elected all recommendations (including the departure from the brainstorm's ephemeral lean — persistent-with-top-K-cap deliberately elected for the revisit-if-failed use case). Locked: NEW slot on `CarriedProfile`, persistent across iterations, top-K capped (K from D). Shape `{ layer1_input, layer2_assessment, rank, considered_at }[]` (Layer 3 omitted — re-derivable). Becomes a fifth wrapper-populated optional `Layer1Schema` field — additive + backward-compatible; **versioned change to the open Layer 1 contract; Rule A (licensing gate) noted for the build session.**

**Step 3 — Decision C: tree-search composition.** Four sub-decisions walked through; founder elected all recommendations. Locked: doc + small helper. New file `atl-tree-search-adapter.ts` exposes `createSubstrateEvaluator(callSubstrate, bridgeContextProvider)` returning a per-node evaluator function. Per-node contract is the EXISTING substrate API. New section in the Wrapper spec documents the contract with pseudocode for MCTS / BFS / ToT (no reference implementations) + a short subsection distinguishing in-process tree search from multi-agent tree-like behaviour (Anthropic orchestration as runtime substrate; ATL wraps the orchestrator per Pattern 3).

**Step 4 — Decision D: top-K retention.** Four sub-decisions walked through; founder elected all recommendations. Locked: helper + doc. New helper `pruneToTopK(candidates, k, comparator?)` + `defaultCarriedCandidateComparator(objectiveFunctionDeclaration)`. Default comparator: hybrid — agent's `objective_function_declaration` if declared, else `katorthoma_proximity` rank. Default K = 5, agent-overridable. Applies to the Decision B `carried_candidates` slot.

**Step 5 — decision-log entry appended.** `D-ATL-ITEMS-1-3-DESIGN-LOCKED-2026-05-16` — lean form per the standing protocol cache. All four decisions captured; deferred decisions named under PR7 (kathekon-aligned alternative, Layer 1 multiple-choice, write-path, A10).

**Step 6 — optional design document produced.** `/adopted/atl-items-1-3-design.md` (~150 lines) covering A / B / C / D in implementable detail — field shapes, function signatures, enum thresholds, helper signatures, doc subsections, file locations. The items 1–3 build session opens against this document + the decision-log entry as the spec.

**Step 7 — this close.**

## Decisions Made

- **`D-ATL-ITEMS-1-3-DESIGN-LOCKED-2026-05-16`** appended (lean form). Four decisions (A / B / C / D) locked. Rules served: 0a, 0c, 0d-ii, 0f, R0, R4, R18a, R18c, AC8, PR1, PR7, PR10, PR11, PR15. PR4 / PR6 / AC5 / AC7 not engaged.

## Status Changes

| Item | Old | New |
|---|---|---|
| Items 1, 2, 3 (post-6b enhancement arc) | Adopted in principle (brainstorm 2026-05-15) | **Designed** — four decisions A/B/C/D locked; build spec exists |
| `/adopted/atl-items-1-3-design.md` | did not exist | **Adopted** (decision status) — Designed (implementation status); referenceable design surface |
| Decision A — `deliberation_breadth` design | Open (brainstorm question) | **Locked** — EvaluatedAction-only; BridgeContext-supplied; enum derived from number; snapshot + badge exposed |
| Decision B — `carried_candidates` design | Open (brainstorm question) | **Locked** — persistent slot on CarriedProfile; slim-rich shape; Layer1Schema-versioning; top-K capped |
| Decision C — tree-search composition design | Open (brainstorm question) | **Locked** — doc + small helper; existing API sufficient; MCTS/BFS/ToT pseudocode; Anthropic multi-agent-orchestration distinction folded in |
| Decision D — top-K retention design | Open (brainstorm question) | **Locked** — pruneToTopK helper; hybrid default comparator (objective_function else proximity); K=5 default, overridable |
| Items 1, 2, 3 (build status) | Not started | **Unchanged** — design complete; build is the next session |
| Production state | A7 Verified; flags UNSET; 6b route Verified; tables exist | **Unchanged** — no code, schema, env, or governance-document changes that affect runtime |

## Next Session Should

**The items 1–3 build session.** `code-elevated` — additive `EvaluatedAction` / `BridgeContext` / `WindowSnapshot` / `AccreditationRecord` / `AccreditationPayload` / `Layer1Schema` schema changes; new persistent slot on `CarriedProfile`; new helper file `atl-tree-search-adapter.ts`; new helper `pruneToTopK` (location TBD by the build session); new section in `agent-trust-layer-wrapper-spec.md`; new column on Supabase `agent_accreditation` table (additive, idempotent migration); updated tests for the existing iteration patterns + new tests for the additions. Coordinates the Layer 1 schema version bump with Rule A (licensing gate) inside the session — no separate gate session required.

The build session opens against `/adopted/atl-items-1-3-design.md` + `D-ATL-ITEMS-1-3-DESIGN-LOCKED-2026-05-16` as the spec.

**Pre-conditions for the items 1–3 build session:**

1. This session's three files (decision-log entry append, design document, this close) committed + pushed by the founder.
2. Vercel green (no code touched — the build should be a no-op).
3. The founder has reviewed `/adopted/atl-items-1-3-design.md` and confirms the four locked summaries match the session-open elections.

A next-session prompt for the items 1–3 build session has NOT been pre-drafted; the founder can request it whenever the three files are committed and the design document has been reviewed.

## Blocked On

**Files remaining uncommitted (to be committed by the founder):**

```
 M operations/decision-log.md                                                     (entry appended)
?? adopted/atl-items-1-3-design.md                                                (NEW — design document)
?? operations/handoffs/founder/2026-05-16-atl-items-1-3-design-pass-close.md      (NEW — this file)
```

**Production state at session close:** unchanged from session start. Substrate at A7 Verified. `SUBSTRATE_LAYER3_ENABLED` UNSET. `SUBSTRATE_R20A_GATE_ENABLED` UNSET. `/api/reason` byte-identical. `/api/substrate/layer3` returns 503. `/api/accreditation/[agent_id]` Live (Verified 6b). `agent_accreditation` + `grade_history` tables exist (founder ran the 6a migration). No env-var, auth-surface, or R20a-perimeter change this session.

## Open Questions

- **Kathekon-aligned alternative — design pass.** Steps 5–6 of the post-6b arc. R20b conditional-offering policy + R4 IP boundary + naming concerns. Revisit condition: items 1–3 build + trajectory-enriched hand-back report Verified.
- **Layer 1 asked-question multiple-choice (narrowed scope) — design pass.** Sequenced for the 55-assessment onboarding-framework. Revisit condition: onboarding-framework design.
- **Write-path into `agent_accreditation`.** Step 7 of the post-6b arc. Connects to spec open question 7 (onboarding) + 8 (`agent_id` authentication). Revisit condition: hand-back report Verified.
- **A10 — per-agent credentials.** Sequenced after write-path. Revisit condition: post write-path.
- **Layer 1 versioning bump (from Decision B).** Coordinates with Rule A (licensing gate) inside the items 1–3 build session — no separate gate session required, but the bump must be recorded in the build-session close and the Stage 1 licensing gate must see it before the open-source release of the Layer 1 reference distribution.
- **Decision D file location.** `pruneToTopK` could live in `atl-iteration-patterns.ts` or a new sibling. Build-session call.
- **Spec-hygiene finding (carried forward — unchanged).** The Adopted ATL Wrapper spec §"Component 2" still owes the superseded agent-mode spec's content inline. Governance-session item.
- **Trajectory-enriched developer hand-back report.** Step 4 of the post-6b arc — much richer once it has `deliberation_breadth` + `carried_candidates`. Revisit condition: items 1–3 build Verified.

## Founder Verification

**Two things to do, in this order. Take them one at a time.**

### 1. Review the design document

Open `/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/adopted/atl-items-1-3-design.md` and confirm the four locked summaries match the founder's elections at session-open. If anything reads wrong, stop and tell me before committing — a superseding decision-log entry is the rollback path (governance-only; no production-state recovery).

### 2. Commit and push (Terminal + GitHub Desktop)

Use a **targeted** add (explicit paths, not `git add -A`). Run these **one line at a time** per `/CLAUDE.md` §"Running the substrate test suite" (a pasted block can break on a prompt — same hygiene as the build sessions, even though no tests run here):

```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"

# Defensive: clear any stale sandbox-created .git/index.lock.
rm -f .git/index.lock

git add operations/decision-log.md
git add adopted/atl-items-1-3-design.md
git add operations/handoffs/founder/2026-05-16-atl-items-1-3-design-pass-close.md
git commit -m "ATL Wrapper items 1-3 design pass (step 2 of 8 of post-6b arc)

Locks the design for items 1, 2, 3 from the 2026-05-15 brainstorm
enhancement arc. Four sub-decisions:

  A - deliberation_breadth signal. New BridgeContext field
    candidates_considered:number maps onto EvaluatedAction. Layer2-
    Assessment stays idempotent. DeliberationBreadth enum derived at
    aggregation time (N=1/2/>=3). WindowSnapshot gains distribution +
    typical fields. AccreditationRecord + Payload gain typical_
    deliberation_breadth - R18a observable, R18c additive schema.

  B - carried_candidates. NEW slot on CarriedProfile, persistent,
    top-K capped (K from D). Shape: {layer1_input, layer2_assessment,
    rank, considered_at}[] (Layer 3 omitted - re-derivable). Becomes
    a fifth wrapper-populated optional Layer1Schema field - versioned
    change to the open Layer 1 contract; Rule A noted for the items
    1-3 build session.

  C - tree-search composition. Doc + small helper. New file
    atl-tree-search-adapter.ts exposes createSubstrateEvaluator(...).
    Per-node contract is the EXISTING substrate API. New spec section
    documents MCTS/BFS/ToT pseudocode + the in-process-vs-multi-agent
    distinction (Anthropic orchestration is the runtime substrate for
    multi-agent tree-like behaviour - retained PR15 consult finding
    from atl-iteration-patterns.ts).

  D - top-K retention. Helper + doc. pruneToTopK(candidates, k,
    comparator?) + defaultCarriedCandidateComparator. Hybrid default:
    agent's objective_function_declaration if declared, else
    katorthoma_proximity rank. K=5 default, agent-overridable.

No code, schema, env, or production exposure this session. The items
1-3 build session is the next sub-session (code-elevated; coordinates
the Layer 1 schema version bump with Rule A inside the session).

Decision log: D-ATL-ITEMS-1-3-DESIGN-LOCKED-2026-05-16. Tier
governance. Standard risk. AC5/AC7/PR6/Critical Change Protocol not
engaged. Design document at /adopted/atl-items-1-3-design.md."
```

Then push via **GitHub Desktop**. **Expected Vercel behaviour:** no build action — the only files touched are documentation (`.md`) which Vercel rebuilds without effect. **No production state change.**

## Cross-references

- Operative session prompt (this session): the items 1–3 design pass prompt provided at session open.
- Predecessor session close (6b): `/operations/handoffs/founder/2026-05-16-atl-public-accreditation-endpoint-close.md`
- Sequencing source (brainstorm): `/operations/handoffs/founder/2026-05-15-post-build-brainstorm-close.md`
- Decision-log entry (this session): `D-ATL-ITEMS-1-3-DESIGN-LOCKED-2026-05-16`
- Predecessor decision-log entries: `D-ATL-PUBLIC-ACCREDITATION-ENDPOINT-WIRED-VERIFIED-2026-05-16`, `D-ATL-BADGE-SCHEMA-PERSISTENCE-WIRED-VERIFIED-2026-05-15`, `D-ATL-ITERATION-PATTERNS-WIRED-VERIFIED-2026-05-15`, `D-ATL-WRAPPER-WIRED-VERIFIED-2026-05-15`
- Deliverable-of-the-day: `/adopted/atl-items-1-3-design.md` (NEW — this session's product)
- Wrapper spec: `/adopted/substrate-modes/agent-trust-layer-wrapper-spec.md` §"Component 1" + §"Component 4" + §"Component 5" + §"Layer 1 implications" + §"Open questions deferred to build"
- Structural constraints sourced from: `/website/src/lib/substrate/atl-bridge.ts` (idempotence rationale forcing Decision A onto EvaluatedAction), `/website/src/lib/substrate/atl-iteration-patterns.ts` (open-question-4 closure framing Decision B's separate-slot model + the Anthropic multi-agent-orchestration PR15 consult retained for Decision C), `/website/src/lib/substrate/trust-layer/types/evaluation.ts` (EvaluatedAction + WindowSnapshot shape), `/website/src/lib/substrate/trust-layer/types/accreditation.ts` (AccreditationRecord + AccreditationPayload shape)
- New files: `/adopted/atl-items-1-3-design.md`, `/operations/handoffs/founder/2026-05-16-atl-items-1-3-design-pass-close.md`

*End of session close. Four design decisions locked; design document produced; decision-log entry appended. Production state at session close unchanged — no code, no schema, no env, no runtime impact. The items 1–3 build session opens against this design as its spec (code-elevated risk; one session expected to land all four decisions per PR1 single-build proof; Layer 1 schema version bump coordinated with Rule A inside the session).*
