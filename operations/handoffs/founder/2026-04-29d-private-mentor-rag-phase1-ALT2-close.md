# Session Close — 2026-04-29 — Second Alternative Phase-1 Design Proposal (Hybrid Retrieval + Re-ranking + Strict Inclusion+Exclusion + Score-in-Reply + Single Canonical Framework + Proximity Ring Wired)

**Stream:** founder.
**Governing frame:** `/adopted/session-opening-protocol.md`.
**Date:** 2026-04-29.
**Status of this document:** Second alternative to the baseline (`/operations/handoffs/founder/2026-04-29b-private-mentor-rag-phase1-close.md`) and the first alternative (`/operations/handoffs/founder/2026-04-29c-private-mentor-rag-phase1-ALT-close.md`). All three sit alongside each other; the founder chooses one before Phase 1 begins. Architecture choice (Option C — retrieval-augmented mentor) is shared. What differs is the specific design within Option C.

---

## Why this second alternative exists

The first alternative (alt 1) introduced hybrid retrieval, re-ranking, small chunks, and a passion-indexed taxonomy. It optimised for **retrieval quality on the conversation surface**.

This second alternative inherits all of alt 1's architectural pre-commitments and adds five further design choices oriented around making the mentor reply **carry structured scoring and progression delta** alongside its narrative — i.e., the mentor reply itself becomes a lightweight Class 1 (structured-score) output, with the conversation surface unified with the score-family pattern. The five additions:

1. **Strict inclusion + exclusion** instead of strict inclusion alone. The paraphrase prompt forbids drawing on anything outside the retrieved Stoic Brain passages AND explicitly excludes Stoic inference from the LLM's own reasoning. Inclusion is the load-bearing constraint (verifiable); exclusion is additional emphasis (less verifiable but reinforces the discipline).
2. **Single canonical mechanism framework.** A reconciliation pass collapses the divergent shapes in production today (5-mechanism in `sage-reason-engine`; 4-stage in `reflect`; compact variants in `score-scenario` / `score-social`) into one canonical taxonomy that all consumers — Phase 1's conversation surface and Phase 3+'s score endpoints — query against. The divergence today is most likely accidental drift; Phase 1 fixes it once.
3. **Score in the mentor reply.** The conversation surface (`/api/founder/hub` mentor branch, private-mentor `hub_id`) now returns a structured score (`katorthoma_proximity`, `virtue_quality`, `passion_diagnosis`, `progression_delta`) alongside the narrative reply. Q3 answer (a). The reply's prose surfaces the score in plain language; the structured fields drive UI elements.
4. **Constrained slot-filled focus questions.** Focus questions are not fully LLM-composed (which leaks Stoic inference) and not fully canonical-retrieved (too brittle for situation-specific phrasing). The corpus carries focus-question stems indexed by progression-blocker / passion / score-state. The LLM fills only situational variables (proper nouns, profile references, the founder's specific context). Stoic content provenance is from the corpus; only the situational instantiation is LLM-driven.
5. **Proximity ring wired to the conversation reply.** The page's proximity ring widget today renders hard-coded values. Phase 1 designs the wiring so the ring reads the structured score from the conversation response. Step 24 of the snapshot (the per-turn `/api/reason` call) is replaced by inline reading of the conversation response's score fields.

These five additions, on top of alt 1's six architectural pre-commitments, yield a Phase 1 brief that produces a substantially more capable architecture than alt 1, at the cost of more Phase 1 deliverables and more Phase 2 build surface.

The retrieval architecture lands only on the conversation surface in Phase 1 (the `/api/founder/hub` mentor branch under `hub_id: 'private-mentor'`) — PR1 single-endpoint proof discipline. Score-family endpoints (`/api/score`, `/api/score-document`, `/api/score-social`, `/api/score-scenario`, `/api/reflect`, `/api/mentor/private/reflect`) remain on their baked-in prompts in Phase 1; the index is designed to be reusable so they migrate in later phases without redesign.

---

## Decisions Made (carried forward from main session)

Same as the prior handoffs:
- **D-MENTOR-PIPELINE-SNAPSHOT-2026-04-29** — End-to-end mentor pipeline snapshot + founder-hub-scoped duplicate parked.
- **D-PRIVATE-MENTOR-OBSERVER-CULL-2026-04-29** — Steps 17 + 18 culled on the private-mentor surface.
- **Architecture direction adopted (Option C — retrieval-augmented mentor)** — Fine-tuning rejected as foundation.

What this alt-2 handoff adds: the founder is choosing among baseline, alt 1, and alt 2 before Phase 1 begins.

---

## Status Changes

Same as the prior handoffs. Adding:
- This alt-2 handoff is Drafted (under founder review).
- Companion alt-2 prompt at `/operations/handoffs/founder/2026-04-29-rag-phase1-ALT2-NEXT-SESSION-PROMPT.md` is Drafted.

---

## Next Session Should

Run Phase 1 of the **second alternative** retrieval-augmented Stoic Brain mentor design. **Phase 1 is design only — no code.** Sixteen draft documents, under `/drafts/rag-mentor-alt2/`, reviewed and approved by the founder before Phase 2 (build) begins.

---

# Alt-2 Phase-1 Design Proposal — Hybrid Retrieval + Score-in-Reply + Single Canonical Framework

## Goal (refined)

The mentor's reply on the private-mentor conversation surface should:

1. Convey advice that originates from the Stoic Brain corpus, with verifiable provenance for every piece of advice (shared with baseline + alt 1).
2. Include a structured score (`katorthoma_proximity`, virtue quality, passion diagnosis) and a progression delta (what's changed since the last mentor session) embedded in the reply, in addition to a narrative interpretation (Q3 answer (a)).
3. Compose focus questions that are situation-specific to the founder's profile + current input, while keeping Stoic content provenance verifiable through retrieved canonical stems (Q1 answer (c)).
4. Drive the proximity ring widget on the page directly from the conversation response, replacing the per-turn `/api/reason` call (Q-X3 answer (I)).

The retrieval index is the data substrate. It's designed once in Phase 1 with a single canonical mechanism framework so later phases can extend the architecture to the score-family endpoints (`/api/score`, `/api/reflect`, etc.) without redesign.

## Architectural pre-commitments

Inherited from alt 1:

- **AC-1 — Passion-indexed.** Every retrievable entry carries `passion` and `sub_passion` fields, populated from the canonical Stoic passion taxonomy.
- **AC-2 — Hybrid retrieval (BM25 + vector).** Keyword and semantic searches run in parallel. Results fused (recommended: Reciprocal Rank Fusion).
- **AC-3 — Re-ranking.** Retrieve top ~20 by hybrid score, then re-rank with a stronger model down to top ~3–5 for the prompt.
- **AC-4 — Small chunks.** Sentence-level / sub-sentence chunking. Larger context expanded only for the paraphrase step.
- **AC-5 — Strict prompting.** Inclusion ("only answer from retrieved context") + exclusion ("do not infer Stoic content from training data"). Inclusion is the verifiable load-bearing constraint; exclusion is additional emphasis with documented limits.
- **AC-6 — Graph RAG: not committed in Phase 1.** Logged as a Phase-2+ open question; index schema designed to be Graph-RAG-extensible.

New for alt 2:

- **AC-7 — Phase-1 surface is the conversation only.** `/api/founder/hub` mentor branch with `hub_id: 'private-mentor'`. Score-family endpoints stay on their baked-in prompts in Phase 1. Aligns with PR1 single-endpoint proof discipline.
- **AC-8 — Single canonical mechanism framework.** Phase 1 reconciles the 5-mechanism (sage-reason-engine), 4-stage (reflect), and compact-variant (score-scenario, score-social) shapes into one canonical taxonomy. The index is tagged in this single shape; all current and future consumers query in this shape.
- **AC-9 — Score in the conversation reply.** Reply payload carries structured score fields + narrative prose. The narrative surfaces the score in plain language; the structured fields drive UI.
- **AC-10 — Constrained slot-filled focus questions.** Focus-question stems are a passage_type in the index. The LLM fills situational variables only.
- **AC-11 — Proximity ring wired in Phase 1.** Migration plan replaces step 24's `/api/reason` call with inline reading of the conversation response's score fields. UI rendering update is part of Phase 2 build but designed in Phase 1.

## Decisions Phase 1 Must Surface (and Founder Decides)

Inherited from alt 1 (D-A1 through D-A12, with D-A11 elevated to a critical-path deliverable):

- **D-A1** — Storage technology (Supabase pgvector + tsvector vs hybrid-native store).
- **D-A2** — Embedding model (OpenAI vs open-source).
- **D-A3** — Chunk size precisely (sentence vs 1–3 sentences vs other; expansion rule for paraphrase).
- **D-A4** — Hybrid fusion method (RRF vs weighted score combination).
- **D-A5** — Top-K_retrieve and Top-K_rerank (recommend 20 / 4).
- **D-A6** — Re-ranker model (cross-encoder vs LLM-as-reranker vs heuristic).
- **D-A7** — Verification mechanism (none / same-prompt with citations / separate-LLM call / deterministic).
- **D-A8** — System context vs retrieval split.
- **D-A9** — Migration strategy (env flag, single-endpoint proof).
- **D-A10** — Stoic Brain corpus expansion (open question, not blocking Phase 1).
- **D-A11** — Passion taxonomy formalisation (critical-path deliverable; tags every passage).
- **D-A12** — Graph RAG outline (open question, schema designed to be extensible).

New for alt 2:

- **D-A13 — Canonical mechanism framework reconciliation.** Phase 1 produces a unified taxonomy that subsumes the 5-mechanism, 4-stage, and compact-variant shapes. Includes mapping tables showing how each existing endpoint's output shape projects onto the canonical framework, so future migrations are mechanical.
- **D-A14 — Score-in-reply payload shape.** The conversation response payload structure: which fields are surfaced (e.g., `score`, `progression_delta`, `focus_question`, `narrative`, `passages_cited`). How the narrative prose references the structured fields naturally without sounding like a form. Whether the response is one combined LLM call or two-call (score → compose narrative).
- **D-A15 — Progression delta computation.** What "progression delta" means in concrete terms — comparison against the most recent prior session score, comparison against a rolling window of sessions, comparison against pattern-analysis observations? What signal counts as movement? Where the prior-state read happens (existing `mentor_observations_structured`, `mentor_profile_snapshots`, `pattern_analyses` tables).
- **D-A16 — Focus-question stem authoring.** The corpus needs focus-question stems indexed by progression-blocker / passion / score-state. Phase 1 produces an inventory of what stems already exist (from the conversation evidence: many do, embedded in the existing reflect endpoint's LLM behaviour) and what gaps need authoring. Authoring itself is Phase 2 or a parallel track.
- **D-A17 — Proximity ring data contract.** Specification of which conversation-response fields the ring reads, fallback behaviour when score is unavailable (e.g., first message of a new conversation), animation/transition behaviour on score change. UI rendering is Phase 2 build; data contract is Phase 1 design.
- **D-A18 — `/api/reason` step 24 replacement.** Migration plan for replacing the per-turn `/api/reason` call. Whether `/api/reason` remains available for other consumers (it may be called from places I haven't catalogued); whether the mentor surface specifically stops calling it. Rollback path if the inline approach proves insufficient.

## Phase-1 Deliverables (sixteen)

Produce these in `/drafts/rag-mentor-alt2/` (folder distinct from `/drafts/rag-mentor/` baseline and `/drafts/rag-mentor-alt/` alt 1).

1. **Canonical mechanism framework** (`/drafts/rag-mentor-alt2/canonical-framework.md`) — D-A13. Single unified taxonomy reconciling 5-mechanism / 4-stage / compact variants. Includes mapping tables showing how each existing endpoint's output projects onto the canonical shape. **Critical path** — must be approved before deliverables 2, 4, 5.
2. **Passion taxonomy** (`/drafts/rag-mentor-alt2/passion-taxonomy.md`) — D-A11. The Stoic passion taxonomy formalised as a controlled vocabulary. Cross-references the canonical framework from deliverable 1 (passions are part of the canonical taxonomy, not a separate axis). **Critical path.**
3. **Corpus inventory** (`/drafts/rag-mentor-alt2/corpus-inventory.md`) — Stoic Brain content broken down by source, classified by passage type (descriptive / canonical_line / example / focus_question_stem / scoring_rule), tagged against the canonical framework and passion taxonomy. Identifies coverage gaps for D-A16 (focus-question stems) and corpus expansion (D-A10).
4. **ADR** (`/drafts/ADR-RAG-MENTOR-ALT2-01-hybrid-retrieval-score-in-reply.md`) — Standard ADR. Documents AC-1 through AC-11 as pre-commitments, D-A1 through D-A18 as decisions, names the trade-off honestly: comprehension and purity cannot both be fully satisfied; this architecture optimises for verifiable provenance + structured scoring + progression visibility on the conversation surface, at the cost of more components than alt 1.
5. **Index schema** (`/drafts/rag-mentor-alt2/index-schema.md`) — Table structure with `passion`, `sub_passion`, `canonical_mechanism`, `passage_type` (mechanism / canonical_line / example / focus_question_stem / scoring_rule), `bm25_index`, `chunk_text`, `chunk_meta`, `embedding`, `provenance_ref`, `score_state_relevance` (which score states this passage applies to). Resolves D-A1.
6. **Retrieval interface** (`/drafts/rag-mentor-alt2/retrieval-interface.md`) — Function signature. Resolves D-A2 (embedding model), D-A3 (chunk size), D-A4 (fusion), D-A5 (top-K).
7. **Re-rank design** (`/drafts/rag-mentor-alt2/rerank-design.md`) — D-A6.
8. **Strict inclusion + exclusion design** (`/drafts/rag-mentor-alt2/strict-prompting-design.md`) — D-A7 plus AC-5 expansion. The actual paraphrase prompt template combining inclusion and exclusion. Includes worked examples.
9. **Focus-question composition design** (`/drafts/rag-mentor-alt2/focus-question-design.md`) — D-A16. The slot-filling mechanism: how stems are retrieved, what variables the LLM is allowed to fill (proper nouns, profile references, situational specifics), what's locked. Worked examples drawn from the founder's actual conversation evidence. Identifies stem-authoring gaps.
10. **Score-in-reply design** (`/drafts/rag-mentor-alt2/score-in-reply.md`) — D-A14. Conversation response payload shape. How the narrative prose references the structured fields. One-call vs two-call composition (score first, then narrative — vs combined). Worked examples.
11. **Progression delta design** (`/drafts/rag-mentor-alt2/progression-delta.md`) — D-A15. What "progression delta" means concretely. Where the prior-state read happens. What signals count as movement.
12. **Verification design** (`/drafts/rag-mentor-alt2/verification-design.md`) — D-A7 (revisited from alt 1, extended for the new structured-score output — verification now checks both the narrative content traces to retrieved passages AND the structured score is consistent with the retrieved evidence).
13. **Proximity ring data contract + step 24 replacement** (`/drafts/rag-mentor-alt2/proximity-ring-wiring.md`) — D-A17 + D-A18. Data contract for the ring. Migration of step 24. Fallback behaviour. Whether `/api/reason` remains available for other consumers (audit needed in this deliverable).
14. **Cost model** (`/drafts/rag-mentor-alt2/cost-model.md`) — Per-turn cost: embedding (rare; reindex only), retrieval (cheap), re-rank (varies by D-A6), paraphrase (Sonnet 4.6), verification (varies by D-A7), score composition (folded into paraphrase if one-call). Compared to today's baseline minus the cull. Note that step 24's `/api/reason` cost is removed by AC-11.
15. **Migration plan** (`/drafts/rag-mentor-alt2/migration-plan.md`) — D-A9. PR1 single-endpoint proof on `/api/founder/hub` mentor branch under `hub_id: 'private-mentor'`. Env flag (`MENTOR_RAG_V1=true`). Founder-hub branch unchanged. Rollback path. Phase-2 sequencing.
16. **Test plan** (`/drafts/rag-mentor-alt2/test-plan.md`) — Tests for hybrid retrieval, re-ranking, small-chunk + expansion, strict prompting compliance, passion-tag accuracy, canonical-framework projection (every existing score endpoint's output can map onto the canonical taxonomy losslessly), score-in-reply correctness, progression delta logic, proximity ring data contract. Founder-performable verification per 0c.
17. **Open-questions register** (`/drafts/rag-mentor-alt2/open-questions.md`) — D-A12 Graph RAG outline + decision criteria. D-A10 corpus expansion as parallel track. Phase 3+ migration of score-family endpoints to the canonical framework + retrieval pattern.

(Numbered to 17 because deliverable 1 + 2 are split for clarity; consider folding them in execution if they become small.)

## Differences from Baseline / Alt 1 (at a glance)

| Aspect | Baseline (`/drafts/rag-mentor/`) | Alt 1 (`/drafts/rag-mentor-alt/`) | Alt 2 (`/drafts/rag-mentor-alt2/`) |
| --- | --- | --- | --- |
| Retrieval mode | Pure semantic | Hybrid (BM25 + vector) | Hybrid (BM25 + vector) |
| Chunk size | TBD by inventory | Sentence-level + expansion | Sentence-level + expansion |
| Retrieval depth | Top-K direct | Top-20 → re-rank → top-3–5 | Top-20 → re-rank → top-3–5 |
| Index taxonomy | Mechanism + metadata | Mechanism + passion + sub_passion | **Single canonical framework** + passion + sub_passion |
| Strict prompting | Inclusion only | Inclusion only | **Inclusion + exclusion** |
| Focus questions | Not specified | Not specified | **Slot-filled composition (corpus stem + LLM variables)** |
| Score in reply | No | No | **Yes (structured + narrative)** |
| Progression delta | No | No | **Yes** |
| Proximity ring | Out of scope | Out of scope | **Wired in Phase 1 (data contract)** |
| Step 24 (`/api/reason`) | Unchanged | Unchanged | **Replaced by inline score read** |
| Class 1 score endpoints | Unchanged | Unchanged | **Unchanged in Phase 1; index designed for migration in Phase 3+** |
| Phase-1 deliverables | 9 | 12 | 17 |
| Phase-2 build effort | Lower | Higher | Highest |
| Architecture cohesion ceiling | Limited | Mid | **Highest (single canonical framework across all surfaces over time)** |

## What Phase 1 (Alt 2) Does Not Decide

- Whether Claude remains the paraphraser LLM (Phase 3 question).
- Whether Class 1 score endpoints actually migrate to retrieval (Phase 3+ question; Phase 1 only ensures the index supports it).
- Whether to support the founder-hub flow with the same architecture later.
- Whether to expand the Stoic Brain corpus (parallel track).
- Whether to commit Graph RAG (D-A12 outline only).

## Approval Gate

Phase 2 (build) does not begin until the founder has reviewed and approved each of the seventeen Phase-1 alt-2 deliverables. Approval can be batched or per-document. The critical-path deliverables (1, 2) must be approved before downstream deliverables proceed.

---

## Blocked On

- Founder push of today's commits (cull + snapshots + decision-log entries) before any Phase-1 session begins.
- Founder choice among baseline / alt 1 / alt 2.

## Open Questions

- **Choice among baseline, alt 1, alt 2.** The three are progressively more capable and progressively more expensive. Baseline is the cheapest path to a working RAG mentor on the conversation surface. Alt 1 adds retrieval-quality engineering (hybrid + re-rank + small chunks + passion taxonomy). Alt 2 adds score-in-reply, progression delta, single canonical framework, proximity ring wiring, and slot-filled focus questions on top. Recommendation criteria: pick baseline if shipping a working RAG mentor sooner is the goal; pick alt 1 if retrieval quality from day one matters more than ship speed; pick alt 2 if you want the architecture that genuinely unifies the mentor reply with the score family over time.
- **Class 1 score endpoint migration.** Phase 1 designs the index to support migration of `/api/score`, `/api/score-document`, `/api/score-social`, `/api/score-scenario`, `/api/reflect`, `/api/mentor/private/reflect` to the retrieval pattern in later phases. The migration order, the deprecation of baked-in prompts, and the consumer-by-consumer cutover are deferred to Phase 3+. Phase 1 does not commit a schedule.
- **Founder-hub flow.** Stays on the existing pipeline (parked) in Phase 1. Whether to migrate it to alt-2's architecture later is a Phase 4+ decision, made after Phase 2 has proven itself on the private-mentor surface and the founder-hub-specific tweaks (distress detection, observer-pipeline preservation) are ready.
- **`/api/reason` audit.** D-A18 requires a survey of where `/api/reason` is called from. The proximity ring is one consumer; there may be others (other pages, scheduled jobs, external API consumers). The audit is part of deliverable 13.

## Verification Method Used (0c framework)

| Work item | Verification method |
| --- | --- |
| Snapshot + parked files | Founder reads directly. |
| Observer cull (route edit) | TypeScript check; founder live-site verification post-push. |
| Decision-log entries | Founder reads directly. |
| Phase-1 alt-2 design (next session) | Founder reads each of 17 deliverables; approves or sends back for redesign. Critical-path deliverables 1, 2 approved before downstream deliverables proceed. |

## Risk Classification Record (0d-ii)

| Change | Risk | Reasoning |
| --- | --- | --- |
| Phase-1 alt-2 drafts (next session) | Standard | Design only, no code. Drafts under `/drafts/rag-mentor-alt2/`, no live-system effect. |

The eventual ADR adoption (in a future session) is Elevated (governing document). The eventual canonical mechanism framework adoption (if it moves to `/adopted/`) is also Elevated — and may itself require sub-decisions about how to migrate the divergent shapes in production over time. Phase 2 build of the conversation surface is Critical under PR6 (touches the mentor pipeline; safety-critical perimeter under R20a if the cull is preserved and distress detection is added).

## PR5 — Knowledge-Gap Carry-Forward

- **Existing scoring framework divergence** — the 5-mechanism / 4-stage / compact-variant split surfaced in this session. Logged as 1st observation. If this surfaces again in a future session, becomes a KG candidate. The canonical-framework deliverable in alt-2 is the resolution if alt-2 is chosen.
- **Hybrid retrieval terminology + Graph RAG terminology** — same as alt 1. Expect re-explanation; logged as candidate.
- **"Strict exclusion" as a prompt-engineering pattern** — the founder's framing (exclude rather than include) surfaced an interesting design pattern. The combined inclusion + exclusion approach is the resolution. Logged as 1st observation.

## Founder Verification (Between Sessions)

Same as alt 1's handoff (push the cull + snapshots + handoffs, verify private-mentor and founder-hub on the live site). Plus, before opening the next session: choose among baseline / alt 1 / alt 2.

---

## Orchestration reminder (Part C element 21)

This alt-2 handoff was produced under `/adopted/session-opening-protocol.md`. It supplements rather than supersedes the baseline and alt 1 handoffs. All three remain available; the founder picks one before Phase 1 begins. No protocol elements skipped.

---

## Cross-references

- `/operations/handoffs/founder/2026-04-29b-private-mentor-rag-phase1-close.md` (baseline handoff)
- `/operations/handoffs/founder/2026-04-29-rag-phase1-NEXT-SESSION-PROMPT.md` (baseline next-session prompt)
- `/operations/handoffs/founder/2026-04-29c-private-mentor-rag-phase1-ALT-close.md` (alt 1 handoff)
- `/operations/handoffs/founder/2026-04-29-rag-phase1-ALT-NEXT-SESSION-PROMPT.md` (alt 1 next-session prompt)
- `/operations/handoffs/founder/2026-04-29-rag-phase1-ALT2-NEXT-SESSION-PROMPT.md` (alt 2 next-session prompt — companion to this file)
- `/archive/2026-04-29_end-to-end-mentor-pipeline_snapshot.md` (rollback baseline)
- `/archive/2026-04-29_end-to-end-founder-hub-mentor_parked.md` (founder-hub-scoped reference)
- `/operations/decision-log.md` D-MENTOR-PIPELINE-SNAPSHOT-2026-04-29 and D-PRIVATE-MENTOR-OBSERVER-CULL-2026-04-29
- `/website/src/lib/sage-reason-engine.ts` (5-mechanism shape — STANDARD_SYSTEM_PROMPT)
- `/website/src/app/api/mentor/private/reflect/route.ts` (4-stage shape — REFLECTION_PROMPT)
- `/website/src/app/api/score-scenario/route.ts` (compact variant — feedback + sage_says)
- `/website/src/app/api/score-social/route.ts` (compact variant — proximity + publish_recommendation)
- `/stoic-brain/scoring.json` (the canonical scoring rules referenced in the canonical-framework deliverable)
