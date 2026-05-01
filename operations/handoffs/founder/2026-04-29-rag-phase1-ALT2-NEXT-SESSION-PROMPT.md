# Next Session Prompt — RAG Mentor Phase 1 (ALT 2 — Hybrid + Score-in-Reply + Single Canonical Framework + Slot-Filled Focus Questions + Proximity Ring Wired)

**Copy the text below this line into the next session.**

---

Governing frame: `/adopted/session-opening-protocol.md`.

Read the session handoff first: `/operations/handoffs/founder/2026-04-29d-private-mentor-rag-phase1-ALT2-close.md`. That close describes the **second alternative** Phase-1 design proposal — the founder chose this over the baseline (at `/operations/handoffs/founder/2026-04-29b-private-mentor-rag-phase1-close.md`) and over the first alternative (at `/operations/handoffs/founder/2026-04-29c-private-mentor-rag-phase1-ALT-close.md`) before opening this session. **Run alt 2; do not run baseline or alt 1.** Seventeen draft deliverables, not nine or twelve.

This is a continuation of SageReasoning P0 (R&D phase). Session focus: founder/tech, governance scope (Phase 1 produces an ADR and several drafts under `/drafts/rag-mentor-alt2/`).

**This session is design only. No code. The deliverable is a set of design documents the founder reviews and approves before Phase 2 (build) begins.**

What just happened (in one paragraph):

The previous session captured the end-to-end mentor pipeline as a rollback baseline and parked a founder-hub-scoped duplicate, culled steps 17 + 18 on the private-mentor surface, and adopted Option C (retrieval-augmented mentor) over fine-tuning. Within Option C, the founder considered three Phase-1 design proposals and chose alt 2: hybrid retrieval (BM25 + vector), re-ranking from top-20 down to a top few, small chunks (sentence-level) with paragraph expansion, passion-indexed plus a single canonical mechanism framework reconciling the divergent score-family shapes (5-mechanism / 4-stage / compact variants), strict inclusion + exclusion of Stoic inference, score embedded in the conversation reply (Q3a), constrained slot-filled focus questions (Q1c), proximity ring wired to read the conversation response's score (Q-X3 I), and the architecture landing only on the conversation surface in Phase 1 under PR1 single-endpoint proof discipline (Q-X1 a). The score-family endpoints (`/api/score`, `/api/score-document`, `/api/score-social`, `/api/score-scenario`, `/api/reflect`, `/api/mentor/private/reflect`) stay on their baked-in prompts in Phase 1; the index is designed to be reusable so they migrate in later phases. Graph RAG remains a Phase-2+ open question.

The founder's actual goal (this is the test for everything below):

"The mentor's reply should convey advice that originates from the Stoic Brain corpus, not Claude. Claude can supply the words; it must not originate the advice. The reply should also surface a structured score and progression delta, and the focus questions should come from corpus-retrieved stems with the LLM filling only situational variables."

The architecture under design must (a) understand the founder's raw inputs and practitioner / project context, (b) retrieve the most relevant Stoic Brain passages using hybrid retrieval, re-ranking, and passion + canonical-framework filtering, (c) compose a reply in the LLM's voice that paraphrases the retrieved passages under strict inclusion (only retrieved context) + strict exclusion (no Stoic inference from training data), (d) include a structured score and progression delta in the response that drives the proximity ring, and (e) compose focus questions by filling situational slots into corpus-retrieved canonical stems.

The founder has pre-committed eleven architecture choices (AC-1 through AC-11 in the handoff). Eighteen decisions remain open for this session to surface (D-A1 through D-A18). Two are critical-path (canonical mechanism framework and passion taxonomy — deliverables 1 and 2). One additional item is logged as a Phase-2+ open question (D-A12, Graph RAG). Do not re-debate AC-1 through AC-11. Surface D-A1 through D-A18 with reasoning; let the founder decide.

What this session should do (in order)

## Part A — Open the session under the protocol (no shortcuts)

Per `/adopted/session-opening-protocol.md` Part A elements 1–8, do the full read sequence. Tier: founder/tech, governance scope. Read:

1. `/manifest.md`
2. (Project instructions — already in system prompt)
3. `/operations/handoffs/founder/2026-04-29d-private-mentor-rag-phase1-ALT2-close.md` — the previous session's full close, including the embedded alt-2 Phase-1 design proposal. **Required context.**
4. `/operations/handoffs/founder/2026-04-29c-private-mentor-rag-phase1-ALT-close.md` — alt 1, for inheritance context (alt 2 inherits AC-1 through AC-6 from alt 1). Read once for context, then do not commingle with alt-2 design work.
5. `/operations/handoffs/founder/2026-04-29b-private-mentor-rag-phase1-close.md` — baseline, for context on what was rejected. Read once and set aside.
6. `/operations/decision-log.md` — at minimum the last three entries (`D-PRIVATE-MENTOR-OBSERVER-CULL-2026-04-29`, `D-MENTOR-PIPELINE-SNAPSHOT-2026-04-29`, plus prior context).
7. `/archive/2026-04-29_end-to-end-mentor-pipeline_snapshot.md` — the rollback baseline; the 24-step end-to-end record. Step 14 (mentor reply) is replaced by the alt-2 retrieval-augmented variant; step 24 (`/api/reason` proximity refresh) is replaced by inline score reading from the conversation response. Steps 1–13, 15, 16, 19–23 remain unchanged on the private-mentor surface.
8. `/archive/2026-04-29_end-to-end-founder-hub-mentor_parked.md` — the founder-hub-scoped reference. The Phase-1 architecture lands ONLY on the private-mentor surface; the founder-hub flow remains as parked.
9. `/operations/knowledge-gaps.md` — scan KG1–7. KG3 (hub-label end-to-end contract) is directly relevant.
10. `/website/src/lib/sage-reason-engine.ts` — **required for D-A13** (canonical mechanism framework reconciliation). Specifically the `STANDARD_SYSTEM_PROMPT` and `DEEP_SYSTEM_PROMPT` constants and the 5-mechanism set.
11. `/website/src/app/api/mentor/private/reflect/route.ts` — **required for D-A13**. Specifically the `REFLECTION_PROMPT` constant and the 4-stage evaluation set.
12. `/website/src/app/api/score-scenario/route.ts` and `/website/src/app/api/score-social/route.ts` — **required for D-A13**. Compact-variant output shapes.
13. `/stoic-brain/scoring.json` — **required for D-A11 and D-A13**. The canonical scoring rules + 4-stage evaluation sequence.
14. `/website/src/lib/context/stoic-brain-loader.ts`, `/website/src/data/stoic-brain-compiled.ts`, `/stoic-brain/stoic-brain.json` — Stoic Brain corpus sources.
15. `/website/src/data/mentor-knowledge-base.ts` and `/website/src/lib/context/mentor-knowledge-base-loader.ts` — mentor knowledge base.
16. `/website/src/app/private-mentor/page.tsx` — page-side wiring including the proximity ring widget (`fetchProximityScore`) — **required for D-A17 (proximity ring data contract)**.
17. `/website/src/app/api/founder/hub/route.ts` — at minimum lines around step 14 (the Anthropic call at `claude-sonnet-4-6`) and the surrounding context loading. **Do not edit this file in this session. Read only.**
18. `/website/src/app/api/reason/route.ts` — **required for D-A18 (`/api/reason` step 24 replacement audit)**. Identify all callers of this endpoint before designing the replacement.
19. `/manifest.md` (re-read sections referencing R20d, R20b, the four passions, the cardinal virtues) — **required for D-A11 and D-A13**.

Confirm: tier, hold-point status (still active), model selection (no code expected; flag if changes), status-vocabulary readiness, signals/risk-classification readiness.

## Part B — Verify state

Quick check with the founder:

```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
git status -s
```

Expected: empty (no modifications). If anything appears, ask the founder before proceeding.

Verify the cull is live by asking the founder to confirm the verification described in the handoffs. If the cull is not yet pushed or not yet verified, pause Phase 1 and finish that first.

## Part C — Run alt-2 Phase 1

Phase 1 produces seventeen draft documents in `/drafts/rag-mentor-alt2/` (and one ADR in `/drafts/`). Produce them in this order so each builds on the prior:

1. **Canonical mechanism framework** (`/drafts/rag-mentor-alt2/canonical-framework.md`) — D-A13. **Critical path.** Reconcile the 5-mechanism (sage-reason-engine: control_filter / passion_diagnosis / oikeiosis / value_assessment / kathekon_assessment), 4-stage (reflect: proximity / passions / what_you_did_well / sage_perspective), and compact variants (score-scenario: feedback + sage_says + proximity; score-social: proximity + publish_recommendation) into one unified canonical taxonomy. Includes mapping tables: every existing endpoint's output shape projects onto the canonical framework losslessly. Founder reviews and approves before deliverables 2, 5 proceed.

2. **Passion taxonomy** (`/drafts/rag-mentor-alt2/passion-taxonomy.md`) — D-A11. **Critical path.** Top-level passions (the four classical: epithumia/desire, hedone/pleasure, phobos/fear, lupe/distress) and sub-passions under each (philodoxia, agonia, philagathia, penthos, etc., as the corpus and manifest define them). Cross-reference the canonical framework from deliverable 1 — passions are the input to the passion_diagnosis mechanism within that framework, not a separate axis. Source from `/stoic-brain/stoic-brain.json`, `/website/src/data/stoic-brain-compiled.ts`, `/website/src/lib/sage-reason-engine.ts` (the sub-species lists in STANDARD_SYSTEM_PROMPT), and the manifest (R0, R20, R20d). Founder reviews and approves before deliverable 3 proceeds.

3. **Corpus inventory** (`/drafts/rag-mentor-alt2/corpus-inventory.md`) — Stoic Brain content broken down by source, classified by passage_type (descriptive / canonical_line / example / focus_question_stem / scoring_rule), tagged against the canonical framework (deliverable 1) and passion taxonomy (deliverable 2). Identify coverage gaps for deliverable 9 (focus-question stems) and corpus expansion (D-A10). Determine chunk granularity in concrete numbers.

4. **ADR** (`/drafts/ADR-RAG-MENTOR-ALT2-01-hybrid-retrieval-score-in-reply.md`) — Standard ADR. Document AC-1 through AC-11 as pre-commitments and D-A1 through D-A18 as decisions. Cite the founder's stated goal verbatim. Name the trade-off honestly.

5. **Index schema** (`/drafts/rag-mentor-alt2/index-schema.md`) — Table structure with `passion`, `sub_passion` (array), `canonical_mechanism` (single value from deliverable 1), `passage_type`, `bm25_index`, `chunk_text`, `chunk_meta` (the surrounding-paragraph reference), `embedding`, `provenance_ref`, `score_state_relevance`. Resolves D-A1 (storage technology — recommend Supabase pgvector + Postgres tsvector unless inventory reverses it).

6. **Retrieval interface** (`/drafts/rag-mentor-alt2/retrieval-interface.md`) — Function signature. Resolves D-A2 (embedding model), D-A3 (chunk size), D-A4 (fusion method — recommend RRF), D-A5 (top-K_retrieve = 20, top-K_rerank = 4 — confirm). Output shape includes the canonical-framework axis so consumers know which mechanism each retrieved passage applies to.

7. **Re-rank design** (`/drafts/rag-mentor-alt2/rerank-design.md`) — D-A6. Cost-quality table for cross-encoder vs LLM-as-reranker vs heuristic.

8. **Strict inclusion + exclusion design** (`/drafts/rag-mentor-alt2/strict-prompting-design.md`) — D-A7 (with AC-5 expanded). The actual paraphrase prompt template combining: (i) inclusion ("only answer from the retrieved Stoic passages") and (ii) exclusion ("do not infer Stoic content from training data"). Worked examples. Document honestly the limitations of negative constraints — exclusion reinforces inclusion but is not independently verifiable.

9. **Focus-question composition design** (`/drafts/rag-mentor-alt2/focus-question-design.md`) — D-A16. Slot-filling mechanism: how stems are retrieved (by progression-blocker / passion / score-state), what variables the LLM fills (proper nouns from profile, situational specifics from input), what's locked (the question's Stoic frame). Worked examples drawn from the founder's actual conversation evidence (refer to the conversation shared in the alt-2 design session — questions like "What does your 16-year-old need from you right now that you haven't asked about yet?" demonstrate the pattern). Identify stem-authoring gaps.

10. **Score-in-reply design** (`/drafts/rag-mentor-alt2/score-in-reply.md`) — D-A14. Conversation response payload shape. Recommend fields: `score` (canonical-framework structure from deliverable 1), `progression_delta` (deliverable 11), `focus_question` (output of deliverable 9), `narrative` (the prose reply), `passages_cited` (provenance refs from retrieval). One-call vs two-call composition (recommend two-call: score first via deterministic-or-structured-retrieval, then narrative composition with the score in context — this preserves verifiable provenance for the score). Worked examples.

11. **Progression delta design** (`/drafts/rag-mentor-alt2/progression-delta.md`) — D-A15. Concrete definition of progression delta: comparison against the most recent prior session score, against a rolling window, against pattern-analysis observations. Where the prior-state read happens (existing `mentor_observations_structured`, `mentor_profile_snapshots`, `pattern_analyses` tables — already loaded at step 10 of the snapshot pipeline). What signal counts as movement.

12. **Verification design** (`/drafts/rag-mentor-alt2/verification-design.md`) — D-A7 extended for the new structured-score output. Verification checks BOTH the narrative content traces to retrieved passages AND the structured score is consistent with the retrieved evidence. Recommend same-prompt verification with citations as the default; separate-LLM call as upgrade path.

13. **Proximity ring data contract + step 24 replacement** (`/drafts/rag-mentor-alt2/proximity-ring-wiring.md`) — D-A17 + D-A18. Data contract for the ring (which fields it reads from the conversation response). Migration of step 24 of the snapshot. Audit of `/api/reason` callers: which callers stay (other pages, scheduled jobs, external API consumers), which migrate. Fallback behaviour when score is unavailable. Animation/transition behaviour on score change. UI rendering is Phase 2 build; data contract is Phase 1 design.

14. **Cost model** (`/drafts/rag-mentor-alt2/cost-model.md`) — Per-turn cost: embedding (rare; reindex only), retrieval (cheap), re-rank (varies by D-A6), paraphrase (Sonnet 4.6 — similar to current), verification (varies by D-A7), score composition (folded into paraphrase if one-call; separate small call if two-call). Note the savings: step 24's `/api/reason` cost is removed by AC-11. Compared to today's baseline minus the cull.

15. **Migration plan** (`/drafts/rag-mentor-alt2/migration-plan.md`) — D-A9. PR1 single-endpoint proof on `/api/founder/hub` mentor branch under `hub_id: 'private-mentor'`. Env flag (`MENTOR_RAG_V1=true` or equivalent). Founder-hub branch unchanged. Rollback path. Phase-2 sequencing (which deliverable becomes which build pass).

16. **Test plan** (`/drafts/rag-mentor-alt2/test-plan.md`) — Tests for hybrid retrieval, re-ranking, small-chunk + expansion, strict prompting compliance, passion-tag accuracy, **canonical-framework projection** (every existing score endpoint's output shape can map onto the canonical taxonomy losslessly — this is the verification that deliverable 1 succeeded), score-in-reply correctness, progression delta logic, proximity ring data contract. Founder-performable verification per 0c.

17. **Open-questions register** (`/drafts/rag-mentor-alt2/open-questions.md`) — D-A12 Graph RAG outline + decision criteria. D-A10 corpus expansion as parallel track. **Phase 3+ migration of score-family endpoints** to the canonical framework + retrieval pattern (`/api/score`, `/api/score-document`, `/api/score-social`, `/api/score-scenario`, `/api/reflect`, `/api/mentor/private/reflect`) — sequencing, deprecation of baked-in prompts, consumer-by-consumer cutover. Founder-hub flow migration as Phase 4+ open question.

After all seventeen drafts are produced, present them to the founder for review. The founder can review per-document or in bulk; the critical-path deliverables (1, 2) must be approved before downstream deliverables proceed. Approval gates the move from draft to adopted and the start of Phase 2.

## Part D — Decision-log entry

Append `D-RAG-MENTOR-ALT2-PHASE1-DRAFTS-YYYY-MM-DD` to `/operations/decision-log.md`. Status: Drafted — under founder review. Cross-references: D-MENTOR-PIPELINE-SNAPSHOT-2026-04-29 (snapshot step 14 + step 24 are what this redesigns), D-PRIVATE-MENTOR-OBSERVER-CULL-2026-04-29 (the prior step on this track), `/operations/handoffs/founder/2026-04-29d-private-mentor-rag-phase1-ALT2-close.md` (the brief), `/adopted/session-opening-protocol.md` (governing frame).

## Part E — Session close

Produce a session close at `/operations/handoffs/founder/YYYY-MM-DD-rag-phase1-alt2-drafts-close.md` per protocol Part C. Include the standard 0b minimum + the extensions (Verification Method Used / Risk Classification Record / PR5 / Founder Verification). Write the next-session prompt at `/operations/handoffs/founder/YYYY-MM-DD-rag-phase2-alt2-NEXT-SESSION-PROMPT.md` for whichever Phase-2 build pass the founder approves.

## Important context

- Founder is a non-coder. Plain-language explanations of every design decision. Define every technical term the first time it appears in a deliverable: BM25, vector embedding, RRF (Reciprocal Rank Fusion), cross-encoder, top-K, sparse vs dense retrieval, Graph RAG, canonical framework, slot-filling. Show concrete worked examples in every deliverable that defines a mechanism — at least three examples drawn from the actual Stoic Brain corpus and the conversation evidence shared in the alt-2 design session.
- Founder decides direction; AI surfaces options with reasoning. The deliverables present each D-A1 through D-A18 decision as a recommendation with reasoning. Founder can override any recommendation. AC-1 through AC-11 are pre-committed and not re-debated.
- Phase 1 is design only. **No edits to `/website/src/`, no edits to `/api/`, no edits to the database, no edits to any adopted document.** All design lives under `/drafts/rag-mentor-alt2/`. A draft ADR is still a draft until the founder approves and it moves to `/adopted/`.
- Honest disclosure throughout. The alt-2 architecture does not deliver absolute purity from non-Stoic influence; it delivers verifiable provenance for narrative advice, structured score with retrieval-grounded reasoning, slot-filled focus questions with corpus-sourced stems, and a unified canonical framework that allows future migration of score-family endpoints. State these in the ADR, the strict-prompting-design doc, the verification-design doc, and the cost-model doc.
- **Critical path: deliverables 1 and 2 (canonical framework + passion taxonomy).** Both must be approved before deliverables 3, 5 proceed. Pause and request founder review at each critical-path checkpoint.
- **Worked examples drawn from the founder's actual conversation evidence.** The alt-2 design session shared a real private-mentor conversation in which the mentor demonstrated the patterns alt-2 is designing for: weaving in profile references, naming Stoic mechanisms, posing situation-specific focus questions. Use that conversation as the source of worked examples in deliverables 9 (focus-question composition) and 10 (score-in-reply).
- Risk classification: every Phase-1 alt-2 deliverable is Standard under 0d-ii (drafts in `/drafts/`, no live-system effect). The eventual ADR adoption (in a future session) is Elevated. The eventual canonical mechanism framework adoption is Elevated and may require sub-decisions about migration of divergent shapes. Phase 2 build of the conversation surface is Critical under PR6.

## Standing reminders

- Single source of truth for the alt-2 design: `/drafts/rag-mentor-alt2/`. Cross-reference, don't duplicate, content between deliverables.
- Decision-log entry per session per PR7 — including for explicitly deferred decisions (D-A12 Graph RAG, D-A10 corpus expansion).
- Provide the founder with verification methods (URLs, expected results, copy-paste commands) for any work that touches a live surface. Phase 1 should not touch live surfaces; if any Phase-1 work would, surface it as a scope question and pause.
- **Do not propose changes to the founder-hub flow during Phase 1.** The founder-hub is parked and out of scope.
- **Do not migrate score-family endpoints during Phase 1.** Phase 1 designs the index to support migration; the migration itself is Phase 3+.
- **Do not propose corpus expansion during Phase 1.** Logged as open question.
- **Do not commingle the alt-2 design with the baseline or alt-1 designs.** The three are distinct architectures; deliverables under `/drafts/rag-mentor/` (baseline), `/drafts/rag-mentor-alt/` (alt 1), `/drafts/rag-mentor-alt2/` (alt 2) must remain separate.

End of prompt. Confirm receipt and full Part A read before proceeding to Part B.
