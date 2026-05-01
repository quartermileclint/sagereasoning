# Next Session Prompt — RAG Mentor Phase 1 (ALT — Hybrid Retrieval + Re-ranking + Passion-Indexed + Small Chunks)

**Copy the text below this line into the next session.**

---

Governing frame: `/adopted/session-opening-protocol.md`.

Read the session handoff first: `/operations/handoffs/founder/2026-04-29c-private-mentor-rag-phase1-ALT-close.md`. That close describes the **alternative** Phase-1 design proposal — the founder chose this over the baseline (at `/operations/handoffs/founder/2026-04-29b-private-mentor-rag-phase1-close.md`) before opening this session. **Run the alt; do not run the baseline.** Twelve draft deliverables, not nine.

This is a continuation of SageReasoning P0 (R&D phase). Session focus: founder/tech, governance scope (Phase 1 produces an ADR and several drafts under `/drafts/rag-mentor-alt/`).

**This session is design only. No code. The deliverable is a set of design documents the founder reviews and approves before Phase 2 (build) begins.**

What just happened (in one paragraph):

The previous session captured the end-to-end mentor pipeline as a rollback baseline (`/archive/2026-04-29_end-to-end-mentor-pipeline_snapshot.md`), parked a founder-hub-scoped duplicate with FH-01 to FH-24 uniquely-named steps so future private-mentor changes do not implicitly modify the founder-hub reference (`/archive/2026-04-29_end-to-end-founder-hub-mentor_parked.md`), and culled steps 17 (observer agents) and 18 (Ops recommended-action) on the private-mentor surface (founder-hub flow unchanged). The founder then chose Option C (retrieval-augmented mentor) over Option A (fine-tuning) for the underlying goal that mentor advice should originate from the Stoic Brain corpus, not from Claude's training-data reasoning. Within Option C, the founder chose the alternative Phase-1 design over the baseline: hybrid retrieval (BM25 + vector), re-ranking from top-20 down to a top few, small chunks (sentence-level) with paragraph expansion for the paraphrase step, passion-indexed (every passage tagged with its primary passion plus sub-passions from the Stoic taxonomy), strict prompting ("only answer from context"), and Graph RAG outlined as a Phase-2+ open question (not committed in Phase 1).

The founder's actual goal (this is the test for everything below):

"The mentor's reply should convey advice that originates from the Stoic Brain corpus, not Claude. Claude can supply the words; it must not originate the advice."

The architecture under design must (a) understand the founder's raw inputs and practitioner / project context, (b) retrieve the most relevant Stoic Brain passages given that input plus memory, using hybrid retrieval, re-ranking, and passion-tag filtering, (c) compose a reply in the LLM's voice that paraphrases the retrieved passages under strict prompting that forbids drawing on anything outside the retrieved context, and (d) verify the reply traces back to the retrieved passages.

The founder has pre-committed six architecture choices (AC-1 through AC-6 in the handoff). Eleven decisions remain open for this session to surface (D-A1 through D-A11). One additional item is logged as a Phase-2+ open question (D-A12, Graph RAG). Do not re-debate AC-1 through AC-6. Surface D-A1 through D-A11 with reasoning; let the founder decide.

What this session should do (in order)

## Part A — Open the session under the protocol (no shortcuts)

Per `/adopted/session-opening-protocol.md` Part A elements 1–8, do the full read sequence. Tier: founder/tech, governance scope. Read:

1. `/manifest.md`
2. (Project instructions — already in system prompt)
3. `/operations/handoffs/founder/2026-04-29c-private-mentor-rag-phase1-ALT-close.md` — the previous session's full close, including the embedded alt Phase-1 design proposal. **Required context.**
4. `/operations/handoffs/founder/2026-04-29b-private-mentor-rag-phase1-close.md` — the baseline Phase-1 handoff. Read once for context on what was rejected, then do not refer to it during the alt design work. The two designs are distinct; commingling them in this session is a scope hazard.
5. `/operations/decision-log.md` — at minimum the last three entries (`D-PRIVATE-MENTOR-OBSERVER-CULL-2026-04-29`, `D-MENTOR-PIPELINE-SNAPSHOT-2026-04-29`, plus the prior `D-REGISTRY-UPDATE-v1.2.3-2026-04-29` for context).
6. `/archive/2026-04-29_end-to-end-mentor-pipeline_snapshot.md` — the rollback baseline; the 24-step end-to-end record. The architecture being designed replaces step 14 (the mentor reply call) with the alt retrieval-augmented variant; everything else stays the same on the private-mentor surface.
7. `/archive/2026-04-29_end-to-end-founder-hub-mentor_parked.md` — the founder-hub-scoped reference. The Phase-1 architecture lands ONLY on the private-mentor surface; the founder-hub flow remains as parked.
8. `/operations/knowledge-gaps.md` — scan KG1–7. KG3 (hub-label end-to-end contract) is directly relevant.
9. `/website/src/lib/context/stoic-brain-loader.ts` and `/website/src/data/stoic-brain-compiled.ts` — the current Stoic Brain content as it is loaded into the system prompt today.
10. `/stoic-brain/stoic-brain.json` — the canonical source. **Required for D-A11 (passion taxonomy).**
11. `/website/src/data/mentor-knowledge-base.ts` and `/website/src/lib/context/mentor-knowledge-base-loader.ts` — the mentor knowledge base, mixed persona/mechanism content.
12. `/website/src/app/api/founder/hub/route.ts` — at minimum lines around step 14 (the Anthropic call at `claude-sonnet-4-6`) and the surrounding context loading. **Do not edit this file in this session. Read only.**
13. `/manifest.md` (re-read sections referencing R20d, R20b, the four passions, the cardinal virtues) — **required for D-A11 passion taxonomy formalisation**.

Confirm: tier, hold-point status (still active), model selection (no code expected; flag if changes), status-vocabulary readiness, signals/risk-classification readiness.

## Part B — Verify state

Quick check with the founder:

```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
git status -s
```

Expected: empty (no modifications). If anything appears, ask the founder before proceeding.

Verify the cull is live by asking the founder to confirm the verification described in the alt-handoff. If the cull is not yet pushed or not yet verified, pause Phase 1 and finish that first.

## Part C — Run alt Phase 1

Phase 1 produces twelve draft documents in `/drafts/` and `/drafts/rag-mentor-alt/`. The handoff lists them. Produce them in this order so each builds on the prior:

1. **Passion taxonomy** (`/drafts/rag-mentor-alt/passion-taxonomy.md`). Produce **first** because the index schema and the corpus inventory both depend on it. Source from `/stoic-brain/stoic-brain.json`, `/website/src/data/stoic-brain-compiled.ts`, the manifest references (R0, R20, R20d), and any other Stoic Brain content surfaced during reading. Output: top-level passions (the four classical: desire / appetite, fear, pleasure, distress), sub-passions under each (philodoxia, agonia, philagathia, penthos, etc., as the corpus defines them), and a controlled vocabulary so every passage gets exactly one primary passion tag and zero or more sub-passion tags. **Founder reviews the taxonomy before subsequent deliverables proceed**, because subsequent deliverables tag content using this taxonomy.

2. **Corpus inventory** (`/drafts/rag-mentor-alt/corpus-inventory.md`). Inventory the Stoic Brain content. Break each source down by passage, classify each passage (descriptive, canonical line, example, warning), count tokens, and **map each passage to a primary passion tag plus zero or more sub-passion tags** using the taxonomy from deliverable 1. Identify passages that resist single-passion classification — these become a known coverage gap surfaced in deliverable 12. Determine chunk granularity in concrete terms: how many sentences in the corpus? How many would become a chunk under 1-sentence chunking vs 2–3-sentence chunking? The numbers determine D-A3 in deliverable 3.

3. **ADR** (`/drafts/ADR-RAG-MENTOR-ALT-01-hybrid-retrieval-stoic-brain.md`). Standard ADR sections: context, decision, consequences, alternatives considered (Option A fine-tuning, Option B retrieval-only no-LLM, Option C-baseline pure-semantic, Option C-alt hybrid + rerank as adopted), status (Drafted — under review), date, author. The ADR cites the founder's stated goal verbatim, names AC-1 through AC-6 as pre-commitments, and names the trade-off honestly: comprehension and purity cannot both be fully satisfied in one model; this architecture optimises for verifiable provenance of advice plus higher retrieval precision through hybrid + rerank, at the cost of more components than the baseline.

4. **Index schema** (`/drafts/rag-mentor-alt/index-schema.md`). Table structure adding `passion`, `sub_passion` (array), `bm25_index` (or equivalent FTS column for the chosen storage), `chunk_text`, `chunk_meta` (the surrounding-paragraph reference for D-A3 expansion), `embedding` vector, `mechanism`, `passage_type`, `provenance_ref`. Resolve D-A1 (storage technology) here. Recommend Supabase pgvector + Postgres `tsvector` (one DB, less plumbing) unless the corpus inventory surfaces a scale problem.

5. **Retrieval interface** (`/drafts/rag-mentor-alt/retrieval-interface.md`). Function signature for hybrid retrieve. Input: founder message + practitioner context + recent observations + recurring patterns + (optional) passion filter. Output: top-K_rerank passages plus metadata plus provenance refs. Specifies BM25 query construction (use `tsquery` operators or equivalent), vector query construction, fusion method (D-A4 — recommend RRF), top-K_retrieve and top-K_rerank (D-A5 — recommend 20 and 4 respectively), error modes.

6. **Re-rank design** (`/drafts/rag-mentor-alt/rerank-design.md`). Three classes (cross-encoder / LLM-as-reranker / heuristic) with cost-quality table. Surface D-A6. Surface the dependency posture: cross-encoder needs managed inference (small open-source models can run on Vercel Edge functions, may need a separate inference service); LLM-as-reranker uses Haiku (already in stack, no new dependency, higher per-query cost); heuristic is no-model. Recommend an option but let the founder pick.

7. **Strict-prompting design** (`/drafts/rag-mentor-alt/strict-prompting-design.md`). The actual paraphrase prompt template. AC-5 is the constraint; this deliverable produces the prompt language. Include rules for no-context cases (what does the mentor say when retrieval did not find relevant material? "I don't have a Stoic mechanism in scope for that — would you tell me more about X?" type response, never fabrication). Show the template with a worked example: a sample input, sample retrieved passages, sample expected response.

8. **Verification design** (`/drafts/rag-mentor-alt/verification-design.md`). Surface D-A7. Compare (a) none — trust strict prompting; (b) same-prompt with citations — paraphrase prompt asks the LLM to cite which retrieved passage each claim comes from; reject responses without citation; (c) separate-LLM verification call — second pass checks claim-to-passage traceability; (d) deterministic verification — token-overlap threshold. Recommend (b) as the default, (c) as the upgrade path.

9. **Cost model** (`/drafts/rag-mentor-alt/cost-model.md`). Per-turn cost: embedding (rare; only on reindex; estimate based on corpus size and chosen embedding model); retrieval (cheap; DB time only); rerank (varies by D-A6 — cross-encoder near-zero if open-source, ~$0.001/turn on Cohere, $0.005–0.01/turn on Haiku-as-reranker); paraphrase (similar to current Sonnet 4.6 cost); verification (varies by D-A7). Compare to today's baseline minus the cull. Honest disclosure on the embedding model's training data per D-A2.

10. **Migration plan** (`/drafts/rag-mentor-alt/migration-plan.md`). Apply PR1 single-endpoint proof discipline. The new code path lives behind an env flag (recommend `MENTOR_RAG_V1=true` or equivalent), private-mentor surface only, founder can switch back to the legacy path instantly during evaluation. Specify the rollback path explicitly. No big-bang switch.

11. **Test plan** (`/drafts/rag-mentor-alt/test-plan.md`). Tests for hybrid retrieval (BM25-favouring queries vs vector-favouring queries), re-ranking effectiveness (does re-rank actually move better passages up? — requires a small labelled set), small-chunk + expansion behaviour, strict-prompting compliance (does the LLM refuse to fabricate when context is empty?), passion-tag accuracy on the inventory. Founder-performable verification (URL-level test the founder can run between sessions per 0c).

12. **Open-questions register** (`/drafts/rag-mentor-alt/open-questions.md`). Phase-2+ decisions deferred from Phase 1. Includes D-A12 Graph RAG outline (sketch the graph schema that would sit on top: node types, edge types, traversal rule examples) plus decision criteria for whether to adopt later. Includes any items surfaced in inventory that did not fit Phase 1 scope. Includes corpus expansion as an explicitly separate track.

After all twelve drafts are produced, present them to the founder for review. The founder can review per-document or in bulk; approval gates the move from draft to adopted and the start of Phase 2.

## Part D — Decision-log entry

Append `D-RAG-MENTOR-ALT-PHASE1-DRAFTS-YYYY-MM-DD` to `/operations/decision-log.md`. Status: Drafted — under founder review. Cross-references: D-MENTOR-PIPELINE-SNAPSHOT-2026-04-29 (snapshot step 14 is what this redesigns), D-PRIVATE-MENTOR-OBSERVER-CULL-2026-04-29 (the prior step on this track), `/operations/handoffs/founder/2026-04-29c-private-mentor-rag-phase1-ALT-close.md` (the brief), `/adopted/session-opening-protocol.md` (governing frame).

## Part E — Session close

Produce a session close at `/operations/handoffs/founder/YYYY-MM-DD-rag-phase1-alt-drafts-close.md` per protocol Part C. Include the standard 0b minimum (Decisions Made / Status Changes / Next Session Should / Blocked On / Open Questions) plus the extensions for governance work (Verification Method Used / Risk Classification Record / PR5 / Founder Verification). Write the next-session prompt at `/operations/handoffs/founder/YYYY-MM-DD-rag-phase2-alt-NEXT-SESSION-PROMPT.md` for whichever Phase-2 build pass the founder approves.

## Important context

- Founder is a non-coder. Plain-language explanations of every design decision. Define every technical term the first time it appears in a deliverable: BM25, vector embedding, RRF (Reciprocal Rank Fusion), cross-encoder, top-K, sparse vs dense retrieval, Graph RAG. Show concrete examples of what an indexed entry would look like in the alt schema, not just the schema in the abstract — at least three worked examples spanning different passages.
- Founder decides direction; AI surfaces options with reasoning. The deliverables present each D-A1 through D-A11 decision as a recommendation with reasoning. Founder can override any recommendation. AC-1 through AC-6 are pre-committed and not re-debated.
- Phase 1 is design only. **No edits to `/website/src/`, no edits to `/api/`, no edits to the database, no edits to any adopted document.** All design lives under `/drafts/rag-mentor-alt/`. A draft ADR is still a draft until the founder approves and it moves to `/adopted/`.
- Honest disclosure throughout. The alt architecture does not deliver absolute purity from non-Stoic influence; it delivers verifiable provenance for every piece of advice, plus higher retrieval precision than the baseline. State this in the ADR, the strict-prompting-design doc, the verification-design doc, and the cost-model doc.
- **Passion taxonomy first.** Deliverable 1 (passion taxonomy) is on the critical path. Subsequent deliverables tag content using it. If the founder wants the taxonomy reviewed before deliverables 2–12 proceed, pause for that review.
- Risk classification: every Phase-1 alt deliverable is Standard under 0d-ii (drafts in `/drafts/`, no live-system effect). The eventual ADR adoption (in a future session) is Elevated (governing document). The eventual passion taxonomy adoption (if it moves to `/adopted/`) is also Elevated.

## Standing reminders

- Single source of truth for the alt design: `/drafts/rag-mentor-alt/`. Cross-reference, don't duplicate, content between deliverables.
- Decision-log entry per session per PR7 — including for explicitly deferred decisions (D-A12 Graph RAG).
- Provide the founder with verification methods (URLs, expected results, copy-paste commands) for any work that touches a live surface. Phase 1 should not touch live surfaces; if any Phase-1 work would, surface it as a scope question and pause.
- Do not propose changes to the founder-hub flow during Phase 1. The founder-hub is parked and out of scope.
- Do not propose corpus expansion during Phase 1. It is logged as an open question and may run as a parallel track or a Phase-2 prerequisite, not Phase 1.
- **Do not commingle the alt design with the baseline design.** The two are distinct architectures; deliverables under `/drafts/rag-mentor/` (baseline) and `/drafts/rag-mentor-alt/` (alt) must remain separate.

End of prompt. Confirm receipt and full Part A read before proceeding to Part B.
