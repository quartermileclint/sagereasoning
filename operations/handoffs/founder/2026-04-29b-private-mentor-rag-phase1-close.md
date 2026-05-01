# Session Close — 2026-04-29 — Private-Mentor Snapshot, Observer Cull, and RAG Phase-1 Direction Adopted

**Stream:** founder.
**Governing frame:** `/adopted/session-opening-protocol.md`.
**Date:** 2026-04-29.
**Tier read at open:** 1, 2, 3 + 4, 5, 6 (governance scope).
**Scope at open vs scope delivered:** Opened as "registry update-skill redesign" per `2026-04-29-NEXT-SESSION-PROMPT.md`. Founder redirected mid-session to private-mentor end-to-end snapshot + observer cull + RAG architecture direction. Scope shift surfaced under protocol Part A element 18 and accepted by founder.

---

## Decisions Made

- **D-MENTOR-PIPELINE-SNAPSHOT-2026-04-29** — End-to-end mentor pipeline captured as the rollback baseline before any private-mentor corrections, plus a founder-hub-scoped duplicate parked with FH-01 to FH-24 uniquely-named steps so future private-mentor changes do not implicitly modify the founder-hub reference. Files: `/archive/2026-04-29_end-to-end-mentor-pipeline_snapshot.md` and `/archive/2026-04-29_end-to-end-founder-hub-mentor_parked.md`.
- **D-PRIVATE-MENTOR-OBSERVER-CULL-2026-04-29** — Steps 17 (observer agents — `ops`, `tech`, `growth`, `support` running in parallel) and 18 (Ops "recommended action" final-synthesis pass) skipped on the private-mentor surface. Single hub-id guard; founder-hub flow unchanged. Pre-edit backup: `/archive/2026-04-29_hub-route_pre-private-mentor-observer-cull.ts.md`.
- **Architecture direction adopted (Option C — retrieval-augmented mentor)** — Founder chose retrieval-augmented architecture over fine-tuning for the underlying goal that mentor advice originate from the Stoic Brain corpus, not Claude's training-data reasoning. Fine-tuning was considered and rejected as foundation because: (i) the Stoic Brain corpus is roughly 9,000 tokens, two to three orders of magnitude too small for from-scratch training; (ii) fine-tuning a base model preserves the base model's training data and therefore does not deliver the purity goal; (iii) fine-tuning needs (input, response) example pairs we do not have, and producing them via a strong LLM is circular. Fine-tuning remains a possible later enhancement, not a foundation.

---

## Status Changes

- `/website/src/app/api/founder/hub/route.ts` — Verified-pre-push (private-mentor cull applied locally; TypeScript check passed; founder push and live-site verification pending).
- `/archive/2026-04-29_end-to-end-mentor-pipeline_snapshot.md` — Live (created).
- `/archive/2026-04-29_end-to-end-founder-hub-mentor_parked.md` — Live (created; status: Parked).
- `/archive/2026-04-29_hub-route_pre-private-mentor-observer-cull.ts.md` — Live (pre-edit backup).
- `/operations/decision-log.md` — Two new entries appended (D-MENTOR-PIPELINE-SNAPSHOT, D-PRIVATE-MENTOR-OBSERVER-CULL).

---

## Next Session Should

Run Phase 1 of the retrieval-augmented Stoic Brain mentor design. **Phase 1 is design only — no code.** The deliverable is a set of design documents that the founder reviews and approves before Phase 2 (build) begins. The Phase-1 design proposal embedded below is the brief.

---

# Phase-1 Design Proposal — Retrieval-Augmented Stoic Brain Mentor

## Goal (the test for everything below)

The mentor's reply should convey advice that originates from the Stoic Brain corpus, with verifiable provenance for every piece of advice. Claude (or whichever LLM is in the paraphraser slot) is constrained to be a voice — not an originator of advice. The architecture must (a) understand the founder's raw inputs and practitioner / project context, (b) retrieve the most relevant Stoic Brain passages given that input + memory, (c) compose a reply in the LLM's voice that paraphrases the retrieved passages without inventing advice not present in them, and (d) verify the reply traces back to the retrieved passages.

## Scope

In scope for Phase 1:
1. Architecture Decision Record (ADR) for the retrieval-augmented Stoic Brain mentor.
2. Corpus inventory of the existing Stoic Brain content (`stoic-brain/stoic-brain.json`, `website/src/data/stoic-brain-compiled.ts`, `website/src/data/mentor-knowledge-base.ts`, plus any related sources surfaced during inventory).
3. Indexing schema — what fields each retrievable entry carries, how passages are chunked, how metadata is structured for filtering.
4. Storage choice — where the index lives (Supabase pgvector is the strong default candidate given existing Supabase usage; alternatives surfaced for comparison).
5. Embedding model choice — which model produces the vectors, with cost and provenance considerations honestly disclosed (every embedding model carries its own training data; this is not a purity-leak unique to Claude).
6. Retrieval interface specification — input shape (founder message + practitioner context + recent observations + recurring patterns), output shape (top-K passages + metadata + provenance refs), filtering rules.
7. Verification mechanism design — how the system checks that the LLM's reply traces back to retrieved passages; one-call vs two-call architecture; what happens when verification fails.
8. Migration plan — how step 14 of the snapshot pipeline is replaced (or wrapped) without breaking the private-mentor flow during transition; safe rollout strategy.
9. Cost model — projected per-turn cost (embedding + retrieval + LLM paraphrase + verification) compared to today's baseline.
10. Test plan — how Phase 2 (build) will be verified at single-endpoint proof level (PR1 discipline).
11. Open-questions register for Phase 2.

Out of scope for Phase 1:
- Any code changes to the route, the page, or the database.
- Corpus expansion. (Surfaced as an open question — may move into Phase 2 or a parallel track, not Phase 1.)
- Founder-hub flow changes. (Founder-hub remains unchanged; the retrieval-augmented architecture lands first on the private-mentor surface only, per PR1 single-endpoint proof discipline.)

## Phase-1 Deliverables

Produce these files (locations are recommendations; finalise in the session):

1. `/drafts/ADR-RAG-MENTOR-01-retrieval-augmented-stoic-brain.md` — the ADR. Status: Drafted (under review). Standard ADR sections: context, decision, consequences, alternatives considered, status, date, author.
2. `/drafts/rag-mentor/corpus-inventory.md` — what's currently in the Stoic Brain corpus, broken down by source file, with counts (passages, tokens), shape (descriptive, canonical lines, examples, warnings), and gaps.
3. `/drafts/rag-mentor/index-schema.md` — table structure (or document structure), field-by-field, with rationale.
4. `/drafts/rag-mentor/retrieval-interface.md` — function signature, input contract, output contract, filtering rules, error modes.
5. `/drafts/rag-mentor/verification-design.md` — how the verification pass works, success / failure criteria, regeneration policy.
6. `/drafts/rag-mentor/cost-model.md` — per-turn cost estimate with assumptions, compared to current baseline.
7. `/drafts/rag-mentor/migration-plan.md` — how step 14 is replaced; PR1 single-endpoint proof plan; rollback path.
8. `/drafts/rag-mentor/test-plan.md` — verification approach for Phase 2.
9. `/drafts/rag-mentor/open-questions.md` — register of Phase-2 decisions deferred from Phase 1.

These are draft documents. They land under `/drafts/` per project folder convention. Founder reviews each in the session or between sessions; approval gates the move from draft to adopted (and the start of Phase 2).

## Decisions Phase 1 Must Surface (and Founder Decides)

Phase 1 surfaces these for founder decision; the AI does not pre-empt them:

- **D1 — Storage technology.** Supabase pgvector (already in stack; cheap; integrated) vs separate vector store (Pinecone, Weaviate, etc.; more capable; another dependency). Recommendation will be Supabase pgvector unless evidence surfaces otherwise during inventory.
- **D2 — Embedding model.** OpenAI `text-embedding-3-small` (~$0.02 per million tokens; commercial; high quality) vs open-source (`bge-small-en-v1.5`, `nomic-embed-text`; free at inference; lower quality on some benchmarks; can run locally or on managed inference). Honest disclosure: every embedding model carries its training data; the embedding step is not a purity-perfect path. The decision is which trade-offs are acceptable.
- **D3 — Chunking strategy.** Whole mechanism vs paragraph vs canonical-line-level. Smaller chunks improve retrieval precision; larger chunks preserve context. Recommendation will follow corpus inventory.
- **D4 — Retrieval mode.** Pure semantic (vector similarity only) vs hybrid (semantic + keyword/BM25). Hybrid is more robust on small corpora; pure semantic is simpler.
- **D5 — Top-K (how many passages retrieved per turn).** Trade-off between recall and prompt size.
- **D6 — One-call vs two-call architecture.** One-call: retrieve, then paraphrase in the same LLM call. Two-call: first call classifies the input (which mechanism applies, what passion type), retrieve filtered, second call composes. Two-call is more constrained; one-call is cheaper and lower latency.
- **D7 — Verification mechanism.** Same-prompt verification (cheap, less reliable) vs separate-LLM verification call (cleaner, more cost) vs deterministic verification (a non-LLM check that paraphrase tokens overlap with retrieved-passage tokens above some threshold; cheapest, possibly too strict).
- **D8 — What stays in system context vs moves to retrieval.** The mentor persona prompt and the eight reasoning upgrades in step 8 of the snapshot are persona instructions; they likely stay as system context. The Stoic Brain mechanism content moves to retrieval. The mentor knowledge base (`mentor-knowledge-base.ts`) is mixed — some persona, some mechanism reference. Phase 1 produces the line.
- **D9 — Migration strategy.** Build the retrieval-augmented step 14 alongside the existing step 14, gated by an env flag (e.g., `MENTOR_RAG_V1=true`), so the founder can switch back to the legacy path instantly during evaluation. PR1 single-endpoint proof discipline applies. No big-bang switch.
- **D10 — Stoic Brain corpus expansion.** Honest disclosure: the current corpus is small. Even with retrieval-augmented architecture, novel inputs may produce poor retrievals if the corpus does not cover the territory. Phase 1 surfaces this as an open question; corpus expansion is its own project, parallel to or after Phase 2. It does NOT block Phase 1 design.

## What Phase 1 Does Not Decide

- Whether Claude remains the LLM in the paraphraser slot or is replaced by a smaller / fine-tuned model. That is a Phase 3 question (after Phase 2 is built and evaluated). Phase 1 designs the architecture to be paraphraser-agnostic.
- Whether to support the founder-hub flow with the same architecture later. That is a separate decision, made after Phase 2 has proven itself on the private-mentor surface.

## Approval Gate

Phase 2 (build) does not begin until the founder has reviewed and approved each of the nine Phase-1 deliverables. Approval can be batched or per-document. Disapproval at any deliverable triggers redesign of that deliverable; no Phase 2 work proceeds on a disapproved foundation.

---

## Blocked On

- Founder push of today's commits (snapshots, parked file, observer cull, two decision-log entries) before the next session begins, so Phase 1 opens against a private-mentor pipeline whose observer cull is live and verifiable.

## Open Questions

- The 24 numbered steps in the snapshot include candidates beyond the observer cull that the founder may want to address in parallel with the RAG work: (i) the dead `data.distress_detected` handler on the private-mentor page (route does not invoke detection, page handles a flag that never fires); (ii) hard-coded proximity ring values in `fetchProximityScore`; (iii) the Haiku observation-extraction truncation (500 chars message, 1000 chars reply). None of these are blockers to Phase 1, but founder may want to schedule them.
- Whether the founder wants a second session today, or to push and verify the cull first, then resume Phase 1 next session. Recommendation: push and verify first, resume Phase 1 next session, so the cull is live before architecture work proceeds.
- Whether the prior next-session prompt (`2026-04-29-NEXT-SESSION-PROMPT.md` for the registry update-skill redesign) is deferred or cancelled. The redesign work is independent of the RAG work and can be picked up in any future session; today's session simply did not run it. Recommendation: defer, not cancel; it remains the canonical prompt for the registry work whenever the founder is ready.

## Verification Method Used (0c framework)

| Work item | Verification method |
| --- | --- |
| Snapshot + parked files | Founder reads directly. |
| Observer cull (route edit) | TypeScript check ran cleanly post-edit (`npx tsc --noEmit --project website/tsconfig.json`). Founder live-site verification post-push: send a private-mentor message and a founder-hub mentor message; expected behaviours described in `D-PRIVATE-MENTOR-OBSERVER-CULL-2026-04-29`. |
| Decision log entries | Founder reads directly. |
| Phase-1 design (next session) | Founder reads each deliverable; approves or sends back for redesign. |

## Risk Classification Record (0d-ii)

| Change | Risk | Reasoning |
| --- | --- | --- |
| Snapshot + parked file creation | Standard | New docs in `/archive/`, no live-system effect. |
| Observer cull route edit | Standard | Additive guard; founder-hub branch unchanged; no auth / encryption / session / redirect surface engaged; AC7 not engaged; PR6 explicitly NOT engaged (no safety-critical surface in observer pipeline). Rollback by restoring backup or `git revert`. |
| Decision-log entries | Standard | Append-only governance maintenance. |
| Phase 1 (next session) | Standard | Design only, no code. |

## PR5 — Knowledge-Gap Carry-Forward

- **KG3 (hub-label end-to-end contract)** — referenced explicitly in the snapshot and parked file; the cull preserves the existing `mapRequestHubToContextHub` mapper unchanged and uses `effectiveHubId` as the discrimination axis (the canonical pattern). Not re-explained.
- **Candidate (1st observation, not yet a KG candidate)** — the terminology distinction "fine-tuning trains a base model further; it does not produce a model trained only on the corpus, and the corpus's training does not erase the base model's training" surfaced in this session as a misconception worth clarifying for the founder. If it recurs in a future session, log as a KG candidate per PR5.
- **Candidate (1st observation, not yet a KG candidate)** — "retrieval-augmented architecture vs fine-tuning vs templated composition" as three distinct approaches, often blended in casual usage. If a future session blurs these again, log as a KG candidate.

## Founder Verification (Between Sessions)

After pushing today's commits, allow ~1 minute for Vercel to deploy.

**Step 1 — Verify private-mentor cull is live:**
- Open `https://www.sagereasoning.com/private-mentor`.
- Send any short test message (e.g., "I had a difficult conversation with a colleague today").
- Mentor should reply as before. Expected behavioural change: the reply may arrive noticeably faster than before because the four observer LLM calls plus one Opus 4.6 synthesis call are no longer running on this surface.
- Visible UI should be unchanged.

**Step 2 — Verify founder-hub flow is unchanged:**
- Open `https://www.sagereasoning.com/founder-hub`.
- Send any short test message in the mentor conversation.
- Mentor reply should arrive AND any observer / recommended-action UI elements that the founder-hub page currently shows should still appear, exactly as before.

**Step 3 — If anything is wrong, restore from the backup:**
- In Terminal: `cp "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/archive/2026-04-29_hub-route_pre-private-mentor-observer-cull.ts.md" "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/website/src/app/api/founder/hub/route.ts"` then `git add`, `git commit -m "revert(private-mentor): roll back observer cull"`, `git push`.

---

## Orchestration reminder (Part C element 21)

This session's governing frame was `/adopted/session-opening-protocol.md`. No protocol elements were skipped. Tier-declared scope was followed; mid-session redirect from registry redesign to private-mentor work was surfaced under Part A element 18 and accepted by the founder.

---

## Cross-references

- `/adopted/session-opening-protocol.md` (governing frame)
- `/adopted/canonical-sources.md` (read sequence)
- `/operations/decision-log.md` D-MENTOR-PIPELINE-SNAPSHOT-2026-04-29 and D-PRIVATE-MENTOR-OBSERVER-CULL-2026-04-29
- `/archive/2026-04-29_end-to-end-mentor-pipeline_snapshot.md` (rollback baseline; the 24-step end-to-end record)
- `/archive/2026-04-29_end-to-end-founder-hub-mentor_parked.md` (founder-hub-scoped reference, FH-01 to FH-24)
- `/archive/2026-04-29_hub-route_pre-private-mentor-observer-cull.ts.md` (pre-edit backup)
- `/operations/handoffs/founder/2026-04-29-NEXT-SESSION-PROMPT.md` (the prior next-session prompt for the registry update-skill redesign — deferred, not cancelled)
- `/operations/handoffs/founder/2026-04-29-rag-phase1-NEXT-SESSION-PROMPT.md` (the next-session prompt for Phase 1 of the RAG mentor design)
