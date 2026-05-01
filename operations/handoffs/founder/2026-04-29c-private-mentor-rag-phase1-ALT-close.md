# Session Close — 2026-04-29 — Alternative Phase-1 Design Proposal (Hybrid Retrieval + Re-ranking + Small Chunks + Passion-Indexed)

**Stream:** founder.
**Governing frame:** `/adopted/session-opening-protocol.md`.
**Date:** 2026-04-29.
**Status of this document:** Alternative to `/operations/handoffs/founder/2026-04-29b-private-mentor-rag-phase1-close.md` (the baseline Phase-1 design proposal). Both sit alongside each other; the founder chooses one before Phase 1 begins. Architecture choice (Option C — retrieval-augmented mentor) is shared. What differs is the specific retrieval design.

---

## Why this alternative exists

The baseline Phase-1 design proposal recommends a straightforward retrieval-augmented architecture: pure semantic retrieval, mechanism-level chunking, top-K retrieval, LLM paraphrase, verification pass. It is the simplest path that delivers verifiable advice provenance and runs against the existing Stoic Brain corpus.

This alternative reaches for higher retrieval quality at the cost of more design surface and more moving parts in Phase 2. Specifically, the founder asked for a Phase 1 designed around:

1. **Passion-indexed retrieval.** The retrieval index also tags every passage with the passion and sub-passion it relates to (the Stoic taxonomy). Retrieval can filter by passion, not only by semantic similarity.
2. **Hybrid retrieval.** Keyword search (BM25) plus vector search, fused. Better for exact-match terms (Stoic technical vocabulary like "synkatathesis", "philodoxia", "oikeiosis") combined with semantic meaning. Either alone misses cases the other catches.
3. **Re-ranking.** Retrieve a wider top-K (around 20), then re-rank with a stronger model. Only the top few survive into the prompt. Improves precision when the corpus contains many passages with overlapping topics.
4. **Small chunk sizes (high resolution).** Sentence-level or sub-sentence chunking. Each chunk carries one idea, not a paragraph of mixed ideas. Retrieval precision improves; the trade-off is that the LLM may need surrounding context expanded back in for the paraphrase step.
5. **Strict prompting.** The paraphrase prompt explicitly forbids the LLM from drawing on anything outside the retrieved context. "Only answer from context. If the context does not address the founder's input, say so plainly."
6. **Graph RAG (possibly).** An explicit knowledge graph layer over the Stoic corpus — nodes for passions, virtues, mechanisms, oikeiosis levels, kathekons; edges for "remedies", "diagnoses", "applies-to", "extends-from". Retrieval can traverse the graph to surface adjacent concepts. Graph RAG is the most experimental of the six and is **not** committed in Phase 1 — it is logged as a Phase-2+ open question, with the architecture designed so Graph RAG can be added later without a redesign.

These six together form a markedly different Phase-1 brief than the baseline. The founder should choose deliberately between the two — they are not subsets of each other.

---

## Decisions Made (carried forward from main session)

Same as the baseline handoff:
- **D-MENTOR-PIPELINE-SNAPSHOT-2026-04-29** — End-to-end mentor pipeline snapshot + founder-hub-scoped duplicate parked.
- **D-PRIVATE-MENTOR-OBSERVER-CULL-2026-04-29** — Steps 17 + 18 culled on the private-mentor surface.
- **Architecture direction adopted (Option C — retrieval-augmented mentor)** — Fine-tuning rejected as foundation; retrieval-augmented adopted.

What this alt-handoff adds: the founder is choosing between baseline Phase-1 and this alt Phase-1 before Phase 1 begins. No third architecture decision is made in this session.

---

## Status Changes

Same as the baseline handoff. Adding:
- This alt-handoff is Drafted (under founder review).
- Companion alt-prompt at `/operations/handoffs/founder/2026-04-29-rag-phase1-ALT-NEXT-SESSION-PROMPT.md` is Drafted.

---

## Next Session Should

Run Phase 1 of the **alt** retrieval-augmented Stoic Brain mentor design. **Phase 1 is design only — no code.** Twelve draft documents (three more than the baseline), under `/drafts/rag-mentor-alt/`, reviewed and approved by the founder before Phase 2 (build) begins.

If the founder has not yet chosen between baseline and alt, the next session begins with the choice. Run the chosen design proposal; do not run both.

---

# Alt Phase-1 Design Proposal — Hybrid Retrieval + Re-ranking + Passion-Indexed + Small Chunks

## Goal (unchanged from baseline)

The mentor's reply should convey advice that originates from the Stoic Brain corpus, with verifiable provenance for every piece of advice. Claude (or whichever LLM is in the paraphraser slot) is constrained to be a voice — not an originator of advice. The architecture must understand the founder's raw inputs and practitioner / project context, retrieve the most relevant Stoic Brain passages given that input plus memory, compose a reply in the LLM's voice that paraphrases the retrieved passages without inventing advice not present in them, and verify the reply traces back to the retrieved passages.

## Architectural pre-commitments (the six the founder has already chosen)

These are inputs to the design, not decisions the design surfaces:

- **AC-1 — Passion-indexed.** Every retrievable entry carries `passion` and `sub_passion` fields, populated from the canonical Stoic passion taxonomy. Retrieval can filter by passion type.
- **AC-2 — Hybrid retrieval (BM25 + vector).** Keyword and semantic searches run in parallel. Results are fused (recommended: Reciprocal Rank Fusion).
- **AC-3 — Re-ranking.** Retrieve top ~20 by hybrid score, then re-rank with a stronger model down to top ~3–5 for the prompt.
- **AC-4 — Small chunks.** Sentence-level or sub-sentence chunking. Larger context expanded only for the paraphrase step, not for retrieval.
- **AC-5 — Strict prompting.** The paraphrase prompt explicitly constrains the LLM to use only the retrieved context. "Only answer from context. If the context does not address the input, say so plainly."
- **AC-6 — Graph RAG: not committed in Phase 1.** Logged as a Phase-2+ open question. Phase 1 designs the index and retrieval interface to be Graph-RAG-extensible, but the graph layer is not built or specified beyond an outline.

## Decisions Phase 1 Must Surface (and Founder Decides)

These decisions are not pre-committed by AC-1 through AC-6:

- **D-A1 — Storage technology.** Two strong candidates: (i) Supabase pgvector + Postgres `tsvector` for BM25, all in one DB (already in stack; one fewer dependency; pgvector covers vectors, tsvector covers full-text/BM25; Postgres FTS is BM25-shaped via `ts_rank_cd`). (ii) A hybrid-native store like Qdrant or Weaviate (purpose-built; more capable on hybrid scoring; another dependency). Recommendation: Supabase pgvector + tsvector unless the inventory or scale evidence reverses it.
- **D-A2 — Embedding model.** Same options as baseline: OpenAI `text-embedding-3-small` (paid; high quality; small cost) vs open-source (`bge-small-en-v1.5`, `nomic-embed-text`; free at inference; varying quality). Honest disclosure: every embedding model carries its own training data; the embedding step is not a purity-perfect path. The decision is which trade-offs are acceptable.
- **D-A3 — Chunk size precisely.** Sentence is the default for AC-4, but the inventory may surface a corpus where sentences are too short to carry meaning standalone. Phase 1 produces a precise spec (e.g., "chunks are 1–3 sentences, target 30–80 tokens, hard cap 120 tokens, expanded to surrounding paragraph for the paraphrase step"). The expansion rule is part of D-A3.
- **D-A4 — Hybrid fusion method.** Reciprocal Rank Fusion (parameter-light, robust, recommended default) vs weighted-score combination (more tunable, requires calibration on a test set we do not yet have). Recommendation: RRF for Phase 2 launch; revisit if retrieval quality data justifies tuning.
- **D-A5 — Top-K_retrieve and Top-K_rerank.** AC-3 names ~20 retrieved and "best few" re-ranked. Phase 1 commits the precise numbers (recommendation: K_retrieve = 20, K_rerank = 4) with reasoning tied to the prompt budget and corpus size.
- **D-A6 — Re-ranker model.** Three classes: (i) Purpose-built cross-encoder (e.g., `bge-reranker-large` open-source, or Cohere Rerank API). Fast, accurate, narrow purpose. (ii) LLM-as-re-ranker (Haiku 4.5 — already in stack; flexible; more expensive per query than (i); slower). (iii) Heuristic re-rank (no model; passion-tag overlap + recency + proximity signals). Cheapest, limited recall. Recommendation: surface all three with cost-quality estimates; start with (i) cross-encoder if the founder is willing to add a small open-source model dependency, otherwise (ii) Haiku as the LLM-re-ranker.
- **D-A7 — Verification mechanism.** Strict prompting (AC-5) is one layer. Phase 1 surfaces whether to add a separate verification layer on top: (a) None — trust strict prompting. (b) Same-prompt verification — the paraphrase prompt also asks the LLM to cite which retrieved passage each claim comes from; reject responses without citation. (c) Separate-LLM verification call — second pass checks claim-to-passage traceability. (d) Deterministic verification — token-overlap threshold between paraphrase and retrieved passages; cheapest, most rigid. Recommendation: (b) same-prompt with citations is the strongest cost-effective default; (c) separate-LLM is the upgrade path if (b) proves insufficient.
- **D-A8 — System context vs retrieval split.** The persona prompt and the eight April-2026 reasoning upgrades stay as system context. The Stoic Brain mechanism content moves to retrieval. The `mentor-knowledge-base.ts` is mixed; Phase 1 produces the line.
- **D-A9 — Migration strategy.** Same as baseline: env flag (`MENTOR_RAG_V1=true` or equivalent), private-mentor surface only, single-endpoint proof per PR1, founder can switch back instantly during evaluation.
- **D-A10 — Stoic Brain corpus expansion.** Same as baseline: surfaced as an open question, not blocking Phase 1.
- **D-A11 — Passion taxonomy formalisation.** New deliverable required by AC-1. The Stoic passion taxonomy must be formalised as a discrete, machine-readable structure: top-level passions (the four — desire, fear, pleasure, distress), sub-passions under each (philodoxia under pleasure-of-honour, agonia under fear-of-future, philagathia under desire-for-good, penthos under distress-of-loss, etc.), and a controlled vocabulary so every indexed passage gets exactly one primary passion tag and zero or more sub-passion tags. Source material: the Stoic Brain content already in the repo plus the manifest references (R0–R20 contextually). Phase 1 produces the formal taxonomy doc; the index schema in D-A3 references it.
- **D-A12 — Graph RAG outline (open question, not committed).** Phase 1 sketches the graph schema that *would* sit on top of the retrieval index if adopted later: node types (passion, sub-passion, virtue, mechanism, oikeiosis level, kathekon), edge types (remedies, diagnoses, applies-to, extends-from, contrasts-with), and how a graph traversal step would augment retrieval (e.g., "if passion P is detected, surface the canonical lines tagged with the virtue that remedies P, even if their semantic similarity to the input is lower"). This is an outline for future-proofing the index schema, not a build commitment.

## Phase-1 Deliverables (twelve, vs baseline's nine)

Produce these in `/drafts/rag-mentor-alt/` (folder distinct from baseline's `/drafts/rag-mentor/` so the two design tracks do not commingle):

1. `/drafts/ADR-RAG-MENTOR-ALT-01-hybrid-retrieval-stoic-brain.md` — the ADR. Documents the six pre-commitments (AC-1 through AC-6) and the eleven decisions (D-A1 through D-A11; D-A12 is an open question, not a decision).
2. `/drafts/rag-mentor-alt/passion-taxonomy.md` — formal Stoic passion taxonomy (the new D-A11 deliverable). Must be approved before D-A3 chunking decisions are finalised because every chunk gets a passion tag from this taxonomy.
3. `/drafts/rag-mentor-alt/corpus-inventory.md` — same scope as baseline, with added analysis of how passages map to passion taxonomy tags. Identifies passages that resist single-passion classification (these become a known coverage gap).
4. `/drafts/rag-mentor-alt/index-schema.md` — table structure adding `passion`, `sub_passion`, `bm25_index` (or equivalent for the chosen FTS column type), and chunk_meta for the small-chunk + expansion rule.
5. `/drafts/rag-mentor-alt/retrieval-interface.md` — function signature for hybrid retrieve. Input: founder message + practitioner context + recent observations + recurring patterns + (optional) passion filter. Output: top-K_rerank passages plus metadata plus provenance refs. Specifies BM25 query construction, vector query construction, fusion method (D-A4), rerank input shape, rerank output shape.
6. `/drafts/rag-mentor-alt/rerank-design.md` — re-ranker pipeline and model choice (D-A6). Specifies input format (the K_retrieve passages plus the original query), scoring, output (the K_rerank passages with confidence scores). Includes the cost-quality table for the three re-ranker classes.
7. `/drafts/rag-mentor-alt/strict-prompting-design.md` — the paraphrase prompt template. AC-5 is the constraint; this deliverable produces the actual prompt language. Includes rules for handling "context does not address the input" cases (what does the mentor say when the retrieval did not find relevant material?).
8. `/drafts/rag-mentor-alt/verification-design.md` — D-A7 mechanism, with an explicit comparison of (a)–(d).
9. `/drafts/rag-mentor-alt/cost-model.md` — per-turn cost: embedding (rare; only on reindex), retrieval (cheap; DB time), re-rank (varies by D-A6 — cross-encoder ~$0 if open-source on managed inference, ~$0.001/turn on Cohere; Haiku-as-reranker ~$0.005–0.01/turn), paraphrase (similar to current Sonnet 4.6 cost), verification (varies by D-A7). Compared to today's baseline minus the cull.
10. `/drafts/rag-mentor-alt/migration-plan.md` — same as baseline (env flag, single-endpoint proof, rollback path).
11. `/drafts/rag-mentor-alt/test-plan.md` — adds tests for hybrid retrieval (BM25-favouring queries vs vector-favouring queries), re-ranking effectiveness (does the re-ranker actually move better passages up?), small-chunk + expansion behaviour, strict-prompting compliance (does the LLM refuse to fabricate when context is empty?), passion-tag accuracy.
12. `/drafts/rag-mentor-alt/open-questions.md` — register of Phase-2+ decisions. Includes D-A12 Graph RAG outline + decision criteria for whether to adopt later, plus any items surfaced in inventory that did not fit Phase 1 scope.

## Differences from Baseline (at a glance)

| Aspect | Baseline (`-rag-mentor/`) | Alt (`-rag-mentor-alt/`) |
| --- | --- | --- |
| Retrieval mode | Pure semantic (vector only) | Hybrid (BM25 + vector, fused) |
| Chunk size | TBD by inventory; mechanism-level default | Sentence-level / sub-sentence (small chunks) with paragraph expansion for paraphrase |
| Retrieval depth | Top-K direct | Top-20 retrieve → re-rank → top-3–5 |
| Index taxonomy | Mechanism + metadata | Mechanism + **passion + sub_passion** + metadata |
| Prompting | Constrained | **Strict** ("only answer from context"; refuses on no-context) |
| Future hooks | None named | Graph RAG outlined as Phase-2+ option |
| Phase-1 deliverables | 9 | 12 |
| Phase-1 effort | Lower | Higher (passion taxonomy + rerank + strict-prompting deliverables added) |
| Phase-2 build effort | Lower | Higher (more components to build) |
| Retrieval quality ceiling | Limited by pure-semantic recall | Higher; hybrid + rerank + small chunks compound |

## What Phase 1 (Alt) Does Not Decide

Same as baseline:
- Whether Claude remains the paraphraser LLM or is replaced later.
- Whether to support the founder-hub flow with the same architecture later.
- Whether to expand the Stoic Brain corpus.

Plus alt-specific:
- Whether to commit Graph RAG (D-A12). Outline only in Phase 1.
- The actual re-ranker model after the cost-quality comparison; the founder picks at the end of Phase 1 review.

## Approval Gate

Phase 2 (build) does not begin until the founder has reviewed and approved each of the twelve Phase-1 alt deliverables. Approval can be batched or per-document. Disapproval at any deliverable triggers redesign of that deliverable.

---

## Blocked On

Same as baseline:
- Founder push of today's commits (cull + snapshots + decision-log entries) before any Phase-1 session begins.

Plus alt-specific:
- Founder choice between baseline Phase-1 (`-rag-mentor/`) and alt Phase-1 (`-rag-mentor-alt/`). Both are drafted as session-close + next-session prompt pairs; one is selected before Phase 1 begins.

## Open Questions

- **Choice between baseline and alt.** The two designs are not subsets of each other. Baseline is faster to build, simpler to operate, and probably good enough for a small corpus. Alt reaches for higher precision and better handling of the Stoic technical vocabulary, at the cost of more design surface and more components in Phase 2. The honest comparison: alt is better-engineered for the goal but takes longer to deliver the first working private-mentor reply. Recommendation: if the founder values shipping a working RAG mentor sooner, pick baseline. If the founder values retrieval quality from day one and is willing to accept a longer Phase 2, pick alt. The two designs can also be sequenced — baseline first as Phase 2A, alt enhancements layered on as Phase 2B — though that risks rebuilding parts of the design on a foundation that wasn't designed for them.
- **Re-ranker dependency posture.** The alt's quality depends on the re-ranker. If the founder prefers to avoid a new managed-inference dependency, the choice tightens to (ii) Haiku-as-reranker or (iii) heuristic. The cost-model deliverable in alt makes this explicit.
- **Passion taxonomy ownership.** The taxonomy deliverable (D-A11) is governance-adjacent. Once formalised it becomes part of the canonical Stoic Brain definition. The founder may want it in `/adopted/` rather than `/drafts/` once approved. Phase 1 leaves it under `/drafts/` until founder direction.

## Verification Method Used (0c framework)

| Work item | Verification method |
| --- | --- |
| Snapshot + parked files | Founder reads directly. |
| Observer cull (route edit) | Verified at TypeScript check; founder live-site verification post-push. |
| Decision-log entries | Founder reads directly. |
| Phase-1 alt design (next session) | Founder reads each of 12 deliverables; approves or sends back for redesign. |

## Risk Classification Record (0d-ii)

| Change | Risk | Reasoning |
| --- | --- | --- |
| Phase-1 alt drafts (next session) | Standard | Design only, no code. Drafts under `/drafts/rag-mentor-alt/`, no live-system effect. |

## PR5 — Knowledge-Gap Carry-Forward

- **Hybrid retrieval terminology** (BM25, RRF, cross-encoder, sparse vs dense retrieval) — likely to require some re-explanation if the founder has not encountered it. Logged as a candidate for first observation in the next session if it does. Not a KG yet.
- **Graph RAG terminology** — newer and more specialised. Likely a re-explanation candidate. Phase 1's deferred-outline approach reduces the need to load this concept fully in Phase 1.

## Founder Verification (Between Sessions)

Same as baseline (push the cull + snapshots + handoffs, verify private-mentor and founder-hub on the live site). Plus, before opening the next session: choose between baseline and alt design. The choice can be made after reading both handoffs side by side; both are short enough to read in one sitting.

---

## Orchestration reminder (Part C element 21)

This alt-handoff was produced under `/adopted/session-opening-protocol.md`. It supplements rather than supersedes the baseline handoff. Both remain available; the founder picks one before Phase 1 begins. No protocol elements skipped.

---

## Cross-references

- `/operations/handoffs/founder/2026-04-29b-private-mentor-rag-phase1-close.md` (the baseline Phase-1 handoff)
- `/operations/handoffs/founder/2026-04-29-rag-phase1-NEXT-SESSION-PROMPT.md` (the baseline next-session prompt)
- `/operations/handoffs/founder/2026-04-29-rag-phase1-ALT-NEXT-SESSION-PROMPT.md` (the alt next-session prompt — companion to this file)
- `/archive/2026-04-29_end-to-end-mentor-pipeline_snapshot.md` (the rollback baseline)
- `/archive/2026-04-29_end-to-end-founder-hub-mentor_parked.md` (founder-hub-scoped reference)
- `/operations/decision-log.md` D-MENTOR-PIPELINE-SNAPSHOT-2026-04-29 and D-PRIVATE-MENTOR-OBSERVER-CULL-2026-04-29
