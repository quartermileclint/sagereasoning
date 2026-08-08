# Session Close — 2026-08-09 — `fresh` novelty-check endpoint: scoped, adversarially reviewed, ruled same session

> **Superseding note (same session, before push):** the mentor's rulings arrived while the records were still uncommitted — the scope is now **RULED in full** (every section confirmed, all three questions ruled; `D-FRESH-ENDPOINT-SCOPE-RULED-2026-08-09`; verbatim record wins). The "offered for relay / nothing scheduled" posture below is retained as the accurate record of the session's first half; the second half's ruling-fold and the unresolved carry-forward it surfaced are described in the sections marked **[RULED]**.

**Stream:** founder.
**Governing frame:** `operations/handoffs/founder/2026-08-09-novelty-check-endpoint-scoping-NEXT-SESSION-PROMPT.md` + `/adopted/standing-protocol-cache.md`.
**Tier:** `governance` / design (explore-scope) — Standard risk throughout. AC7 not engaged. Production byte-equivalent (no code, schema, flag, or credential change; the only production writes were the harness's own organic consult traffic, and at least one document write proceeded unframed on a Gate-2 at-action timeout — the known fail-open-honest 28000ms class, organic, disclosed).
**Date:** 2026-08-09.

## Decisions Made

- `D-FRESH-NOVELTY-ENDPOINT-SCOPED-2026-08-09` appended — the `fresh` novelty-check endpoint scope document offered for mentor relay.
- `D-FRESH-ENDPOINT-SCOPE-RULED-2026-08-09` appended **[RULED]** — the mentor's ruling recorded verbatim and folded into the scope.

## What this session did

1. **Opened under the protocol** — all three pre-conditions held: the predecessor records commit (`90320c9`) at HEAD and pushed; the session's own opening prompt FRAMED by the hook (quota fix holding); the founder confirmed no new mentor guidance supersedes the Q11 sequence or any ruling.
2. **Consolidated what Q2 settled** (scope §1, cited: dedicated endpoint; wraps the dark `assessStructuralNovelty` un-redesigned; server-side per the ruled per-cycle contract; both alternative homes closed) and **proposed** the seam (scope §2, every item marked PROPOSAL): `POST /api/practice/fresh`; `consult` capability Bearer-only, nothing minted; batch request of the two structural axes with the **history window read server-side from the presenting credential's own rows** (the caller never submits history); `passedNoveltyCheck`/`noveltyConfidence` response + window disclosure; no LLM call, no billing write; dark behind `SUBSTRATE_FRESH_ENABLED` ⇒ 503; the does-NOT-do list; the structural-novelty-only limitation carried as the required review dimension. **Four open questions for the mentor** — the substantive one (Q-C) a genuinely new fact from the first-hand code read: an empty/starved window yields `novel: true, confidence: 1.0`, and Q3's dedicated runner identity starts at zero history.
3. **Adversarial review (PR19), paused first at the founder's direction** so model settings could be switched (to Sonnet 5), then run in full: 3 dimensions → per-finding adversarial verification, 11 agents, 0 errors — **8 raised, 8 confirmed, 0 refuted; boundary compliance clean.** The substantive catch (medium): the draft's Q-D ("confirm no novelty trust event") was **settled ground mischaracterised as open** — the brief's Phase 5 "no new write path" was approved as proposed, un-amended, so Q-D was withdrawn and restated as settled. Also folded: a provenance correction (the query-shape/floor fix belongs to the 2026-08-05 C2-widening ruling, not Q2); the "up to seven" batch figure struck (an unverified inference from the enum's cardinality); a precision note on Q-C's Option-2 quantity (total window size ≠ the matching-row count the function computes); the rate bucket revised `analytics` → `publicAgent` (the discernment sibling's actual bucket); three positive confirmations (all PR20 facts trace exactly to code; the limitation un-watered-down; Q-A/Q-B/Q-C genuinely open). Disclosed: the automated safety-classifier was unavailable for 4 verify agents; every finding and verdict was read first-hand before folding.

## What the second half did **[RULED]**

4. **Relayed and received the mentor's ruling same session** (model switched to Fable 5 by the founder for the ruling relay, before the records commit was pushed). Every §2 proposal confirmed: §2.1 route/method as proposed; §2.2/Q-A `consult` capability reuse confirmed (no new capability, no mint-surface change); §2.3/Q-B the 90-day/30-row trajectory window confirmed as v1 default, with "revisit after first bounded validation run" carried as a named follow-up rather than an open question; §2.4 the response shape + window-disclosure block confirmed as required, not optional; §2.5/Q-C the distinct `insufficient_history` basis (Option 2, the AI's recommendation) confirmed — **and the PR19 precision note's own resolution was fixed by the ruling itself**: the basis check reads total window size, not the matching-row count the function currently computes, named explicitly as a build-time wiring detail for the build prompt; §2.6 the `publicAgent` rate-bucket revision confirmed; §2.7 the dark flag posture confirmed; §2.8 all eight do-NOT-do items confirmed, including the PR19-withdrawn Q-D reaffirmed as settled (with an exact sentence to carry into the build prompt); §2.9 the structural-novelty-only limitation confirmed as a required build-time disclosure.
5. **Recorded the ruling verbatim** (`operations/agent-circles-2026-08/2026-08-09-mentor-consultation-fresh-endpoint-scope-rulings-verbatim.md` — wins over every summary), then **folded it in** as inline RULED annotations across the scope document, mirroring the predecessor session's pattern (proposal prose kept, marked ruled rather than deleted): the status header; §1's confirmation block; a RULED note under every §2 subsection; §3's open-questions list rewritten to show all three ruled; §4 rewritten to state the sequence advance to `watching` with the carry-forward, original "goes to the mentor" text preserved as the record.
6. **Surfaced and re-verified an unresolved carry-forward.** The ruling named one item for the next session: the `dependency_unavailable`/null-cycle fallback-counter distinction, pointing to "Q6's territory." Checked against the corpus first-hand: **the pointer resolves to nothing** — Q6 ruled only the seventh `cycleOutcome` value (`'terminated_by_timeout'`) and never addressed whether a `dependency_unavailable` cycle counts toward, resets, or is excluded from the "three consecutive null cycles" fallback trigger (the brief's §1.3 fallback rule counts *null* cycles specifically; `dependency_unavailable` is stated only as "honestly distinct" from a null cycle, brief line 51). Per the ruling's own instruction, this is carried forward as a genuine open question for `watching`, not silently defaulted.
7. **Updated the architecture-map mirror** (§Sixth element) to reflect `fresh` scoped-and-ruled same day, with the unresolved carry-forward named for `watching`.
8. **Authored the `watching` next-session prompt**, carrying the carry-forward explicitly (with instructions to re-verify, not assume, before drafting).

## Status Changes **[RULED — final]**

| Item | Old | New |
|---|---|---|
| `fresh` (novelty-check endpoint) — SCOPING | next in the ruled sequence, not started | **SCOPED → RULED (mentor, same session — every proposal confirmed, all three questions ruled)** |
| `fresh` — BUILDING | blocked | **still blocked** — the first build gate sits after the per-cycle table item + the generation-step scope document |
| Per-cycle record table (`watching`) — SCOPING | queued second | **next in the ruled sequence** (own small item, Q5; required fields fixed; one carry-forward question named and re-verified) |
| `dependency_unavailable`/null-cycle fallback-counter distinction | named, assumed addressed by Q6 | **re-verified NOT settled** — carried as a genuine open question for `watching` |

## Next Session Should

Open under `operations/handoffs/founder/2026-08-09-watching-per-cycle-record-table-scoping-NEXT-SESSION-PROMPT.md` — the **`watching` (per-cycle record table) scoping** session (governance/design; the second item of the ruled Q11 sequence; scoping only; its required fields are already fixed by the ruling — the four outcomes, per-candidate guardrail results with heuristic attribution, cost, elapsed vs `maximumDuration`, `loopId`, plus Q7's rejected-candidate visibility — with the `dependency_unavailable`/fallback-counter distinction re-verified as genuinely open, not defaulted). The two registered defects, C1c-original, D4, the Stoa activation, W1–W3, B6, and the permission-layer items remain independently electable and untouched.

## Blocked On

**Files new/modified this session (uncommitted, for the founder's push — one records commit):**
- `operations/agent-circles-2026-08/2026-08-09-fresh-novelty-endpoint-scope.md` (new; revised through the PR19 fold, then RULED-annotated)
- `operations/agent-circles-2026-08/2026-08-09-mentor-consultation-fresh-endpoint-scope-rulings-verbatim.md` (new)
- `operations/architecture-map-2026-08/06-PLAIN-TEXT-MIRROR.md` (§Sixth element update)
- `operations/handoffs/founder/2026-08-09-watching-per-cycle-record-table-scoping-NEXT-SESSION-PROMPT.md` (new)
- `operations/decision-log.md` (two entries appended)
- `operations/handoffs/founder/2026-08-09-fresh-novelty-endpoint-scoping-CLOSE.md` (this file)

Pre-existing untracked strays from prior sessions remain unchanged and deliberately unstaged.

**Production state at session close (2026-08-09):** no code, schema, flag, or credential change. AC7 not engaged. C2/C1c remain LIVE (MEASURE); the s9-loop consult credential at 2000/20000; the two registered defects remain open, untouched per the prompt's scope. The Q1 hard constraint stands in every document: the loop proposes; it never executes.

## Founder Verification

```bash
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning" && git add operations/agent-circles-2026-08/2026-08-09-fresh-novelty-endpoint-scope.md operations/agent-circles-2026-08/2026-08-09-mentor-consultation-fresh-endpoint-scope-rulings-verbatim.md operations/architecture-map-2026-08/06-PLAIN-TEXT-MIRROR.md operations/handoffs/founder/2026-08-09-watching-per-cycle-record-table-scoping-NEXT-SESSION-PROMPT.md operations/decision-log.md operations/handoffs/founder/2026-08-09-fresh-novelty-endpoint-scoping-CLOSE.md && git status --short
```

Review the staged list (six paths, all documents — no website/ or code file), then commit and push via GitHub Desktop. No Vercel behaviour change is expected (no code touched). The mentor's rulings are already recorded; no relay step remains for this session.

## Rules served

PR15 (settled corpus cited, not re-derived); PR19 (full independent Workflow, both stages, run under the founder's model election with the pause honoured; a real mischaracterisation in the author's own draft caught, folded, disclosed — the fallback was not needed); PR20 (every mechanism fact read first-hand from the code, independently re-verified by the review, and the fallback-counter carry-forward re-checked against the brief text rather than trusted from the ruling's own pointer); PR17/PR18 (this close); the Q1 hard constraint carried; the scoping-not-building boundary intact end-to-end (no code file created or edited; the code-adjacent acts were *reading* `idea-loop-types.ts`, `trajectory-delta.ts`, `agent-assessment-history-store.ts`, and the discernment route to verify facts).

## Cross-references

- `operations/handoffs/founder/2026-08-09-autonomous-loop-design-brief-scoping-CLOSE.md` (predecessor)
- `operations/handoffs/founder/2026-08-09-novelty-check-endpoint-scoping-NEXT-SESSION-PROMPT.md` (governing prompt)
- `D-FRESH-NOVELTY-ENDPOINT-SCOPED-2026-08-09` + `D-FRESH-ENDPOINT-SCOPE-RULED-2026-08-09`
- `operations/agent-circles-2026-08/2026-08-09-fresh-novelty-endpoint-scope.md` (the deliverable, now RULED)
- `operations/agent-circles-2026-08/2026-08-09-mentor-consultation-fresh-endpoint-scope-rulings-verbatim.md` (the rulings — verbatim wins)
- `operations/handoffs/founder/2026-08-09-watching-per-cycle-record-table-scoping-NEXT-SESSION-PROMPT.md` (next in the ruled sequence)

*End of close. The `fresh` scope is drafted, reviewed, and ruled in one session; a genuine gap in the ruling's own carry-forward pointer was caught and correctly re-routed as an open question rather than assumed resolved; the build boundary is intact — the first build gate sits two ruled steps away.*
