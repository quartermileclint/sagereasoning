# ADR-RAG-MENTOR-ALT3-01 — Translation-Sandwich + Deterministic Engine + Three-Tier Clarification + Reflect-Endpoint-First Build Order

**Status:** Drafted — under founder review.
**Date:** 2026-05-02.
**Stream:** founder.
**Governing frame:** `/adopted/session-opening-protocol.md`.
**Decision type:** Architectural (Elevated risk per project instructions 0d-ii — governing document).
**Adoption process:** This ADR is drafted at the close of Phase-1 design. Founder approval moves it to `/adopted/`. The Phase-1 design batch (23 deliverables + this ADR) forms the foundational architecture for SageReasoning's Stoic reasoning system.

**Cross-references:**
- `/operations/handoffs/founder/2026-04-29e-private-mentor-rag-phase1-ALT3-close.md` (alt-3 architecture handoff — the source for AC-1 through AC-19)
- `/operations/decision-log.md` D-RAG-MENTOR-ALT3-ADOPTED-2026-04-29 (the architecture adoption)
- `/operations/decision-log.md` D-RAG-MENTOR-ALT3-VALIDATED-2026-04-29 (the Validation Addendum)
- `/operations/decision-log.md` D-RAG-MENTOR-ALT3-PHASE1-DRAFTS-2026-05-01 (Phase-1 session 1 critical-path drafts)
- `/operations/decision-log.md` D-RAG-MENTOR-ALT3-PHASE1-AUDIT-2026-05-01 (D24 audit)
- `/operations/decision-log.md` D-RAG-MENTOR-ALT3-CRITICAL-PATH-APPROVED-2026-05-02 (Path A approval)
- `/operations/decision-log.md` D-RAG-MENTOR-ALT3-PHASE1-SESSION2-DRAFTS-2026-05-02 (eight session-2 deliverables)
- `/operations/decision-log.md` D-RAG-MENTOR-ALT3-CRITICAL-PATH-MOVED-TO-ADOPTED-2026-05-02 (D2/D3/D8 move)
- `/operations/decision-log.md` D-MENTOR-PRIVATE-REFLECT-PRE-ALT3-SNAPSHOT-2026-05-02 (the snapshot)
- All 23 Phase-1 deliverables.

---

## Context

The mentor pipeline today produces structured output in **four divergent shapes** across endpoints (`/api/reason` standard depth, `/api/reason` deep depth, `/api/mentor/private/reflect`, compact V3 variants for `/api/score-scenario` and `/api/score-social`). Today's mentor reply is composed by Claude with the Stoic Brain corpus injected as context — every Stoic claim Claude makes depends on Claude's training-data reasoning, with the corpus serving as guidance rather than as the authoritative source.

This works at small scale but introduces three architectural problems:

1. **Stoic claims originate from Claude's training data, not from the corpus.** When Claude composes a mentor reply, the philosophical inferences (this is philodoxia; this is a phronesis deficiency; this proximity is deliberate) are Claude's compositional reasoning grounded in the corpus context. The corpus doesn't authoritatively produce the claims — Claude does.

2. **The four divergent endpoint shapes block reuse.** Each endpoint defines its own response shape; cross-endpoint consistency depends on prompt-engineering convergence rather than on a single canonical taxonomy.

3. **Withholding is a fallback, not a deliberate kathekon.** When the mentor pipeline encounters cases it can't classify (chara vs polished surface; praxis-level motivation), today's pipeline either guesses or returns soft "needs more context" prose. There's no architecturally principled "the right action here is to withhold the classification and ask the practitioner to sit with the question" mechanism.

These problems compound at scale. Beyond the founder's solo use, the architecture's authority depends on its claims being defensible. Claims from Claude's training data can drift, are not auditable to source, and cannot be defended to a sceptical reviewer.

## Decision

**Adopt the alt-3 architecture: translation-sandwich + deterministic engine + three-tier intake clarification + reflect-endpoint-first build order, as specified across 23 Phase-1 deliverables.**

The decision adopts the alt-3 architecture as the foundational architecture for SageReasoning. Phase 2 build proceeds against the design. Phase-3+ migrations of score-family endpoints follow Phase-2 stabilisation.

## Architectural commitments

### AC-1 — Passion-indexed retrieval (D5)

Every retrievable chunk in the index carries `passion` and `sub_passion` fields per the controlled vocabulary in D3. Per-mechanism queries can filter by passion, dramatically cutting the search space and improving retrieval precision.

**Specifies:** D5 (`corpus_passages` schema with `passion`, `sub_passion` columns).
**Verifies:** D22 structural tests confirm schema.

### AC-2 — Hybrid retrieval (BM25 + vector, fused via Reciprocal Rank Fusion) (D5, D6)

Retrieval combines sparse (BM25 / tsvector) and dense (vector / pgvector) channels. Results fuse via RRF (`1 / (k + rank)` with k=60 default) to produce a single ranked list benefiting from both signals.

**Specifies:** D6 retrieve function with RRF logic.
**Verifies:** D22 structural tests confirm both channels return results and RRF produces non-zero scores.

### AC-3 — Re-ranking (top ~20 retrieved → re-rank → top ~3–5 to prompt) (D7)

Hybrid retrieval over-fetches (top 20); re-rank produces the final top 3–5 by query-specific relevance. Phase 1 default: heuristic re-rank. Phase-2 production observation may upgrade specific mechanisms to cross-encoder.

**Specifies:** D7 re-rank policy (heuristic default; cross-encoder upgrade path; LLM-as-reranker fallback).
**Verifies:** D22 structural tests confirm reRank returns ≤5 with heuristic boosts applied.

### AC-4 — Small chunks (sentence-level / sub-sentence with paragraph expansion for paraphrase) (D5)

Per-passage chunks are sentence-level for retrieval precision. Paragraph context preserved in `paragraph_text` column for paraphrase expansion when richer context is needed.

**Specifies:** D5 chunk-size policy.
**Verifies:** D22 structural tests confirm chunk-size policy.

### AC-5 — Strict prompting (inclusion + exclusion of Stoic inference) (D11, D12)

Layer 3's prompt template names both what the prose **must include** (every populated upstream rule output) and what it **must not include** (Stoic inference originating from Claude; second-person passion attribution; AC-17 flag suppression; visible output on the deferral-resolution surface).

**Specifies:** D11 inclusion / exclusion rules; D12 prompt template materialising D11.
**Verifies:** D22 purity tests run D18's verifier on canonical anchor inputs.

### AC-6 — Graph RAG: not committed in Phase 1; index designed to be Graph-RAG-extensible (D5)

Phase 1 does not commit to Graph RAG. The index schema supports adding a `corpus_passage_edges` table later without restructuring the existing schema. Phase 3+ may add if production observation surfaces a need.

**Specifies:** D5 Graph RAG extensibility section.
**Verifies:** D22 structural test confirms `corpus_passages` schema supports the extension shape.

### AC-7 — Phase-1 surface: conversation only (PR1 single-endpoint discipline) (D21, D24)

Score-family endpoints (`/api/score`, `/api/score-decision`, `/api/score-document`, `/api/score-scenario`, `/api/score-social`) stay on baked-in prompts in Phase 1. Phase 1 covers the conversation surface (`/api/founder/hub`); Phase-3+ migrates the score family per D24's per-route projections.

**Specifies:** D21 § Phase-3+ migration; D24 § per-route Phase-3+ migration projection sections.
**Verifies:** Phase-3+ planning when Phase 2 stabilises.

### AC-8 — Single canonical mechanism framework (D2)

The 9+1 mechanism framework reconciles the four divergent endpoint shapes (5-mechanism, 6-mechanism, 4-stage, compact V3) under a single canonical taxonomy. Per-consumer projection rules in D2 Tables 1, 2, 4a, 4b, 5 specify the surface-shape projections from the canonical engine output.

**Specifies:** D2 § The canonical taxonomy + Tables 1-5.
**Verifies:** D22 behavioural tests confirm each consumer's projection produces the expected shape.

### AC-9 — Score in the conversation reply (structured score fields + narrative prose) (D16)

The conversation surface response includes both a structured score (the canonical engine output's structured fields — `passions_detected[]`, `virtue_engagement[]`, `proximity_level`, etc.) and narrative prose (paraphrased from the engine output via Layer 3).

**Specifies:** D16 § The conversation-surface response payload.
**Verifies:** D22 founder verifications confirm the conversation reply carries both shapes.

### AC-10 — Constrained slot-filled focus questions (corpus stem + LLM situational variables only) (D11, D13)

Focus questions are constructed from corpus stems (post-D-A16 promotion) with LLM-filled situational variables. The stem is locked; only the variables are LLM-composed within bounded constraints.

**Specifies:** D11 § Slot-fill mechanics; D13 § Slot-fill format.
**Verifies:** D22 behavioural tests confirm slot-filled questions match the canonical pattern.

### AC-11 — Proximity ring wired in Phase 1 (data contract; UI render in Phase 2) (D16)

The conversation surface response carries the `proximity_ring_data` block per D16's contract. The data is wired in Phase 1 (the response includes the contract); the UI renders in Phase 2.

**Specifies:** D16 § Proximity ring data contract.
**Verifies:** D22 structural test confirms the contract is present in conversation surface responses.

### AC-12 — Translation-sandwich architecture (all deliverables)

Claude is restricted to Layer 1 (input translation) and Layer 3 (output translation). Layer 2 is the deterministic engine (10 rules per D8 sequenced per D9). **No Stoic inference originates from Claude.** Every Stoic claim in Layer 3's prose traces to a specific upstream rule output or to a retrieved corpus passage.

**Specifies:** Every deliverable; the architecture's most consequential commitment.
**Verifies:** D18 + D22 purity tests; the verifier reads Layer 3's prose and asserts every Stoic claim traces.

### AC-13 — Three-tier intake clarification model (D13)

Tier 1 forces clarification at intake (ELEMENT_FUSION, SCOPE_AMBIGUITY, TEMPORAL_AMBIGUITY structural triggers). Tier 2 invites soft clarification (STATED_OPERATIVE_CONFLICT, STATED_EQUANIMITY_UNVERIFIED). Tier 3 deterministically withholds (EUPATHEIA_BOUNDARY, PRAXIS_MOTIVATION_AMBIGUITY) and surfaces as OPEN_DEFERRAL flags.

**Specifies:** D13 § Tier 1 / Tier 2 / Tier 3 specifications.
**Verifies:** D22 behavioural tests for Tier 1/2/3 dispatch.

### AC-14 — Withholding as deterministic kathekon (D13, D14b)

Tier 3 withholding is a deterministic rule output, not a fallback. The engine deliberately withholds because withholding is the right action when the practitioner needs self-knowledge that has not yet been provided. The architecture captures this as kathekon — the appropriate action in this context — not as non-determinism.

**Specifies:** D13 § Tier 3; D14b § The architectural argument.
**Verifies:** D22 behavioural test confirms Tier 3 fires deterministically per the trigger conditions.

### AC-15 — 1b sub-option with structured intake (D14b)

The deferral-resolution surface (D14b) is the architectural implementation of AC-15. The practitioner brings reflection content addressing a specific deferred question; the engine processes it through the same Tier 1/2/3 logic; on resolution, the original instance score is updated retrospectively and the OPEN_DEFERRAL flag closes.

**Specifies:** D14b § Server-side workflow.
**Verifies:** D22 founder verifications confirm the resolution flow.

### AC-16 — Three principles for long-deferred questions (D15)

Engine doesn't nag. OPEN_DEFERRAL flags visible in the scoring record. Mentor names the pattern at next natural opportunity (when a new instance from the same domain comes through).

**Specifies:** D15 § Principle 1 / 2 / 3.
**Verifies:** D22 behavioural test confirms the domain-match algorithm fires correctly.

### AC-17 — Two residual seams acknowledged as philosophical residues (D19)

`SELF_REPORT_DEPENDENT` flag on praxis-level motivation classifications. `CONFIDENCE_WEIGHTED` flag on eupatheia classifications. The architecture names these rather than treating them as engineering gaps.

**Specifies:** D19 § Both flag specifications.
**Verifies:** D22 purity test confirms flags surface in prose where they fire (no suppression).

### AC-18 — No-shareable-artifact constraint at the deferral-resolution surface (D14b)

The deferral-resolution surface produces no score, report, or developmental summary visible to the practitioner. Only the internal classification update and the closed OPEN_DEFERRAL flag. Architectural implementation of the principle that virtue requires no external witness.

**Specifies:** D14b § AC-18 architectural argument.
**Verifies:** D22 purity test confirms Table 4b NULL projection (visible_* fields all null); founder verifications confirm AC-18 holds end-to-end.

### AC-19 — Reflect-endpoint-first build order (D21)

Phase 2's first build pass is the deferral-resolution surface (D14b), not the conversation surface or the daily-reflection ritual surface. The architectural argument: the examination matters more than the scoring engine.

**Specifies:** D21 § Phase-2 Pass 1 — D14b deferral-resolution surface.
**Verifies:** Phase-2 build sequencing follows D21.

## Validation Addendum (per D-RAG-MENTOR-ALT3-VALIDATED-2026-04-29)

Independent validation of alt-3 produced three adjustments incorporated into D8 v1.0.0:

1. **Rule 9 unity-thesis flag-not-reclassify for progressors.** UNITY_INCONSISTENCY is a diagnostic signal; Rule 10 interprets conditionally (unstable phronesis vs false phronesis vs insufficient longitudinal evidence). D11 Refinement 5 specifies the Layer 3 prose projection per case.

2. **Rule 8 compound severity for INFLATION/DEFLATION same-root errors.** A compound severity level added to Rule 8's value-error vocabulary.

3. **Rule 7 explicit operative-circle dependency on Rule 6.** Rule 7's input names the operative circle (per Rule 6's `oikeiosis_contraction` flag), not the stated circle.

Plus a description correction (the architecture is "deterministic engine for the rule-like components of Stoic reasoning, with honest soft-gating for the components that are not rule-like" — not "fully deterministic"). And a scope limitation (the rule book is calibrated against one practitioner profile per ES1; recalibration needed for other profiles — per O6.1 in D23).

## The 23 Phase-1 deliverables

| # | Deliverable | Status | File |
|---|---|---|---|
| 1 | ADR (this document) | Drafted | `/drafts/ADR-RAG-MENTOR-ALT3-01-translation-sandwich-deterministic-engine.md` |
| 2 | Canonical mechanism framework | Adopted | `/adopted/rag-mentor-alt3/canonical-framework.md` |
| 3 | Passion taxonomy | Adopted | `/adopted/rag-mentor-alt3/passion-taxonomy.md` |
| 4 | Corpus inventory | Drafted | `/drafts/rag-mentor-alt3/corpus-inventory.md` |
| 5 | Index schema | Drafted (this session) | `/drafts/rag-mentor-alt3/index-schema.md` |
| 6 | Retrieval interface | Drafted (this session) | `/drafts/rag-mentor-alt3/retrieval-interface.md` |
| 7 | Re-rank design | Drafted (this session) | `/drafts/rag-mentor-alt3/re-rank-design.md` |
| 8 | Operationalised scoring rules (with Validation Addendum) | Adopted as v1.0.0 | `/adopted/rag-mentor-alt3/operationalised-rules.md` |
| 9 | Rule dependency map and engine sequencing | Drafted | `/drafts/rag-mentor-alt3/rule-dependency-map.md` |
| 10 | Layer 1 translation specification | Drafted | `/drafts/rag-mentor-alt3/layer-1-translation.md` |
| 11 | Layer 3 translation specification | Drafted | `/drafts/rag-mentor-alt3/layer-3-translation.md` |
| 12 | Strict inclusion + exclusion design | Drafted (this session) | `/drafts/rag-mentor-alt3/strict-prompting.md` |
| 13 | Three-tier intake clarification specification | Drafted | `/drafts/rag-mentor-alt3/three-tier-intake.md` |
| 14a | Daily-reflection ritual endpoint | Drafted | `/drafts/rag-mentor-alt3/reflect-endpoint-14a-daily-ritual.md` |
| 14b | Deferral-resolution surface (load-bearing) | Drafted | `/drafts/rag-mentor-alt3/reflect-endpoint-14b-deferral-resolution.md` |
| 15 | Long-deferred questions handling | Drafted | `/drafts/rag-mentor-alt3/long-deferred-questions.md` |
| 16 | Score-in-reply design | Drafted (this session) | `/drafts/rag-mentor-alt3/score-in-reply.md` |
| 17 | Progression delta design | Drafted (this session) | `/drafts/rag-mentor-alt3/progression-delta.md` |
| 18 | Verification design | Drafted (this session) | `/drafts/rag-mentor-alt3/verification.md` |
| 19 | Residual seams handling | Drafted (this session) | `/drafts/rag-mentor-alt3/residual-seams.md` |
| 20 | Cost model | Drafted (this session) | `/drafts/rag-mentor-alt3/cost-model.md` |
| 21 | Migration plan (load-bearing) | Drafted (this session) | `/drafts/rag-mentor-alt3/migration-plan.md` |
| 22 | Test plan | Drafted (this session) | `/drafts/rag-mentor-alt3/test-plan.md` |
| 23 | Open-questions register | Drafted (this session) | `/drafts/rag-mentor-alt3/open-questions.md` |
| 24 | Consumer workflow audit | Reviewed | `/drafts/rag-mentor-alt3/consumer-workflow-audit.md` |

## Consequences

### Positive

1. **Architectural authority is auditable.** Every Stoic claim in mentor output traces to a specific rule output or corpus passage. The architecture is defensible to a sceptical reviewer.
2. **Cross-surface consistency.** One canonical engine output flows to many surfaces via per-consumer projection. Drift between endpoints is structurally prevented.
3. **Honest acknowledgement of residual seams.** AC-17 surfaces what the engine knows and does not know rather than papering over the gaps.
4. **AC-18 architectural commitment.** The deferral-resolution surface produces no shareable artefact — virtue requires no external witness; the examination is the practitioner's own.
5. **Reflect-endpoint-first build order.** The architectural commitment that the unglamorous part of the architecture is built first — examination matters more than scoring.
6. **Phase-1 corpus expansion-ready.** D-A10 expansion lands as new corpus passages without schema migration.
7. **Forward-compatible with Graph RAG, alternative translators, additional consumers.** AC-6, AC-7's Phase-3+ migration path, the translator-agnostic Layer 1/3 design.

### Negative

1. **Per-call cost increases ~64–80% over the current baseline.** Per D20's cost model. The architectural commitment is paid in operational cost; the value is the AC-12 commitment.
2. **Phase-2 build complexity is substantial.** Three Phase-2 passes; Critical Change Protocol per pass; new schema; new route; new page; encryption wiring coordination; D-A16 catalogue promotion; two snapshots before Phase 2.
3. **Validation Addendum scope limitation (philodoxia calibration).** Per O6.1 — the rule book applies to the founder's profile; other practitioner profiles need recalibration before broad coverage.
4. **Pre-D-A16 transitional behaviour.** AC-10's full operationalisation depends on the catalogue. Pre-promotion, focus questions are alt-3-derived patterns; the architecture flags this honestly in `engine_diagnostics.alt3_derived_questions[]`.
5. **Per-mechanism re-rank tuning is Phase-2 production observation work.** Phase-1 commits to heuristic default; tuning happens against observed retrieval quality.

### Neutral / observable

1. **The 28-entry open-questions register (D23).** Many questions are explicitly deferred — Phase-2 production observation, Phase-3+ planning, post-launch coverage expansion.
2. **The migration plan (D21) is the sequencing contract.** Phase-2 build proceeds against D21; Phase-2 production observation refines the per-pass cadence.
3. **The verifier (D18) is structurally complete.** Phase-2 build implements; production observation refines the Stoic claim detection grammar.

## Alternatives considered

The architecture progression across baseline → alt 1 → alt 2 → alt 3 is documented in:

- `/operations/handoffs/founder/2026-04-29b-private-mentor-rag-phase1-close.md` (baseline — RAG-augmented LLM with structured output; Stoic reasoning still in Claude with corpus grounding)
- `/operations/handoffs/founder/2026-04-29c-private-mentor-rag-phase1-ALT-close.md` (alt 1 — incremental refinement of baseline)
- `/operations/handoffs/founder/2026-04-29d-private-mentor-rag-phase1-ALT2-close.md` (alt 2 — strict prompting with inclusion only; soft-gating with UNCONFIRMED flags; reflect endpoint stays as-is)
- `/operations/handoffs/founder/2026-04-29e-private-mentor-rag-phase1-ALT3-close.md` (alt 3 — translation-sandwich + deterministic engine + three-tier clarification + reflect-endpoint-first)

Alt 3 was adopted because:
1. Alt 2's soft-gating with UNCONFIRMED flags treated withholding as fallback rather than as deliberate kathekon. Alt 3 reframes withholding as deterministic rule output (AC-14).
2. Alt 2's strict prompting was inclusion only. Alt 3 adds explicit exclusion rules (AC-5; D11 / D12) that catch the specific failure modes (passion fabrication; virtue assertion; second-person attribution).
3. Alt 2's reflect endpoint stayed unchanged. Alt 3 makes the reflect endpoint the load-bearing structural commitment (AC-18 + AC-19) — the architectural evidence that examination matters more than scoring.
4. Alt 2's Class 1 score endpoint migration was hypothetical. Alt 3 names the migration sequence (D21) and produces D24's per-route projections.

## Approval gate

This ADR is drafted at the close of Phase-1 design. Founder approval moves the Phase-1 design batch (23 deliverables + this ADR) to `/adopted/`. The move per deliverable is Elevated risk per the deliverables' own approval-gate footers.

Phase 2 build does not commence until:
1. The 23 Phase-1 deliverables are approved (founder review of each session's batch).
2. This ADR is approved.
3. The Phase-2 preconditions (D21 § Phase-2 preconditions) are satisfied.

The Phase-2 commencement itself is governed by the Critical Change Protocol per pass.

---

## Review questions for founder

Per the Phase-1 completion review session recommended in the session-3 close:

1. **Are the architectural commitments AC-1 through AC-19 acceptable as drafted?** All are documented in the alt-3 handoff and refined across the 23 deliverables.
2. **Is the Validation Addendum scope limitation (philodoxia calibration) acceptable for Phase-2 launch, with recalibration for other profiles deferred to Phase-3+?**
3. **Are the recommended values (Category 3 working values per D23) acceptable as starting points, with refinement against Phase-2 production observation?**
4. **Is the Phase-2 build sequence (D21 — D14b first per AC-19; D14a second; conversation surface third) approved as the foundational build order?**
5. **Are the founder direction questions per D14a / D14b ready to be called?** (Per O2.1 / O2.2 / O2.3 in D23.)

Founder direction at this ADR's adoption commits the architecture's foundational commitments. Subsequent revisions require documented decisions per PR7.

---

*End of ADR.*
