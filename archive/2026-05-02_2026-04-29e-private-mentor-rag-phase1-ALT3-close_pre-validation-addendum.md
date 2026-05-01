# Session Close — 2026-04-29 — Third Alternative Phase-1 Design Adopted (Translation-Sandwich + Deterministic Engine + Three-Tier Clarification + Reflect-Endpoint-First Build Order)

**Stream:** founder.
**Governing frame:** `/adopted/session-opening-protocol.md`.
**Date:** 2026-04-29.
**Status of this document:** **Adopted as the foundational architecture for SageReasoning.** Supersedes the baseline (`/operations/handoffs/founder/2026-04-29b-private-mentor-rag-phase1-close.md`), alt 1 (`/operations/handoffs/founder/2026-04-29c-private-mentor-rag-phase1-ALT-close.md`), and alt 2 (`/operations/handoffs/founder/2026-04-29d-private-mentor-rag-phase1-ALT2-close.md`) as the chosen path forward. Those three remain in `/archive/`-equivalent status as the reasoning trail; alt 3 is the architecture that Phase 2 build implements.

---

## Why alt 3 was adopted

The architecture progression across baseline → alt 1 → alt 2 → alt 3 shifted the question from "how do we constrain Claude's reasoning" to "how do we separate Stoic reasoning from language interface entirely."

Alt 3 implements a **translation-sandwich** architecture: Claude is restricted to two narrow translation tasks (input translation and output translation), with a deterministic engine in the middle that does all Stoic reasoning via operationalised rules and RAG-grounded retrieval. The Stoic Brain becomes the rule book; the engine is the reasoning agent; Claude is the language interface.

The architecture was validated through a sustained operationalisation exercise in which the live private mentor produced full structured operationalisations for ten Stoic Brain scoring rules (PROHAIRESIS-FILTER-001 through KATORTHOMA-PROXIMITY-001). The exercise confirmed that the deterministic skeleton holds with two genuine philosophical residues that the architecture acknowledges rather than tries to close.

---

## Decisions Made (carried forward from main session and exercise)

- **D-MENTOR-PIPELINE-SNAPSHOT-2026-04-29** — End-to-end mentor pipeline snapshot + founder-hub-scoped duplicate parked.
- **D-PRIVATE-MENTOR-OBSERVER-CULL-2026-04-29** — Steps 17 + 18 culled on the private-mentor surface.
- **D-RAG-MENTOR-OPTION-C-ADOPTED** — Retrieval-augmented mentor chosen over fine-tuning.
- **D-RAG-MENTOR-ALT3-ADOPTED-2026-04-29** *(this entry to be appended to decision log)* — Alt 3 (translation-sandwich + deterministic engine + three-tier clarification + reflect-endpoint-first build order) chosen as the foundational architecture.

---

## Status Changes

- This handoff is Adopted (not draft).
- Companion next-session prompt at `/operations/handoffs/founder/2026-04-29-rag-phase1-ALT3-NEXT-SESSION-PROMPT.md` is Adopted.
- Baseline, alt 1, alt 2 handoffs and prompts remain in their existing locations as the architectural reasoning trail.

---

## Next Session Should

Run Phase 1 of the alt-3 retrieval-augmented Stoic Brain mentor design. **Phase 1 is design only — no code.** Approximately twenty-three draft documents under `/drafts/rag-mentor-alt3/`, reviewed and approved by the founder before Phase 2 (build) begins. **Critical architectural condition: Phase 2's first build pass is the reflect endpoint, not the conversation surface.**

---

# Alt-3 Phase-1 Design Proposal — Translation-Sandwich + Deterministic Engine + Reflect-Endpoint-First

## Goal (refined for alt 3)

The mentor's reply on the private-mentor conversation surface, the score on every scoring page, the daily reflection on the reflect endpoint — all of these should convey advice and judgements that originate from the Stoic Brain corpus, not from Claude's training-data reasoning. Claude is restricted to two narrow translation tasks: translating the practitioner's free-text input into the canonical Stoic feature representation (Layer 1), and translating the deterministic engine's structured output into conversational prose (Layer 3). The deterministic engine in the middle (Layer 2) does all Stoic reasoning via operationalised rules and RAG-grounded retrieval, with no Stoic inference originating from Claude.

## Architectural commitments (the founder has pre-committed all of the below)

**From alt 1 (carried forward):**
- AC-1 — Passion-indexed retrieval (passion + sub_passion fields per chunk).
- AC-2 — Hybrid retrieval (BM25 + vector, fused via Reciprocal Rank Fusion).
- AC-3 — Re-ranking (top ~20 retrieved → re-rank → top ~3–5 to prompt).
- AC-4 — Small chunks (sentence-level / sub-sentence with paragraph expansion for paraphrase).
- AC-5 — Strict prompting (inclusion + exclusion of Stoic inference).
- AC-6 — Graph RAG: not committed in Phase 1; index designed to be Graph-RAG-extensible.

**From alt 2 (carried forward):**
- AC-7 — Phase-1 surface: conversation only (PR1 single-endpoint discipline). Score-family endpoints stay on baked-in prompts in Phase 1; index designed for migration in Phase 3+.
- AC-8 — Single canonical mechanism framework (reconciles 5-mechanism / 4-stage / compact variants).
- AC-9 — Score in the conversation reply (structured score fields + narrative prose).
- AC-10 — Constrained slot-filled focus questions (corpus stem + LLM situational variables only).
- AC-11 — Proximity ring wired in Phase 1 (data contract; UI render in Phase 2).

**New for alt 3:**
- **AC-12 — Translation-sandwich architecture.** Claude is restricted to Layer 1 (input translation) and Layer 3 (output translation). Layer 2 is the deterministic engine; no Stoic inference originates from Claude.
- **AC-13 — Three-tier intake clarification model.** Tier 1 forces clarification at intake (Component A structural triggers — ELEMENT_FUSION, SCOPE_AMBIGUITY, TEMPORAL_AMBIGUITY). Tier 2 invites soft clarification as reflective prompt (STATED_OPERATIVE_CONFLICT, empirical redirect). Tier 3 deterministically withholds and surfaces as `OPEN_DEFERRAL` (eupatheia boundary, praxis-level motivation).
- **AC-14 — Withholding as deterministic kathekon.** Tier 3 deferral is a deterministic rule output, not a fallback. The engine deliberately withholds because withholding is the right action when the practitioner is best served by sitting with the question. The architecture captures this as a kathekon, not as a non-determinism residue.
- **AC-15 — 1b sub-option with structured intake.** The reflect endpoint presents the specific deferred question and waits, with no prompt or facilitation. Practitioner brings reflection when ready; engine processes deterministically; updates the original instance score retrospectively; closes the `OPEN_DEFERRAL`.
- **AC-16 — Three principles for long-deferred questions.** Engine doesn't nag. `OPEN_DEFERRAL` flags visible in the scoring record with timestamps. Mentor names the pattern at next natural opportunity, not as prompt.
- **AC-17 — Two residual seams acknowledged as philosophical residues.** `SELF_REPORT_DEPENDENT` flag on praxis-level motivation classifications (practitioner self-report itself is not deterministic). `CONFIDENCE_WEIGHTED` flag on eupatheia classifications (chara/hedone boundary requires longitudinal evidence). Architecture names these rather than treating them as engineering gaps.
- **AC-18 — No-shareable-artifact constraint at the reflect endpoint.** The reflect endpoint produces no score, report, or developmental summary visible to the practitioner. Only the internal classification update and the closed `OPEN_DEFERRAL` flag. The examination is genuinely private and unrewardable. Architectural implementation of the principle that virtue requires no external witness.
- **AC-19 — Reflect-endpoint-first build order.** Phase 2's first build pass is the reflect endpoint, not the conversation surface. The reflect endpoint is the unglamorous part of the architecture; building it first is the architectural commitment that the examination matters more than the scoring engine.

## The candidate rule book

The live private mentor produced full structured operationalisations for ten Stoic Brain scoring rules during the architecture exercise. These ten operationalisations form the candidate rule book for Phase-1 Deliverable 8. The rules are:

1. **PROHAIRESIS-FILTER-001** — Identify what's eph' hemin and what isn't. Output: `prohairesis_scope[]`, `external_scope[]`, `misclassification_flags[]` (CONTROL_INFLATION / CONTROL_ABDICATION), `misclassification_severity`, `filter_passed`.

2. **PASSION-DETECT-ROOT-001** — Identify root passions via 2×2 matrix (temporal × evaluative). Output: `passions_detected[]`, `dominant_passion`, `false_impression[]`, `eupatheia_candidate`, `temporal_split`.

3. **PASSION-SUB-SPECIES-001** — Map root passion to sub-species via canonical object-mapping. Output: `sub_species_map[]`, `compound_passion_flags[]`, `unclassified_passions[]`, `dominant_sub_species`.

4. **PASSION-CAUSAL-STAGE-001** — Identify earliest stage in causal sequence (phantasia → synkatathesis → horme → praxis) where assent was given. Output: `causal_stage_map[]`, `compound_stage_failures[]`, `intervention_priority[]`, `profile_prior_applied`, `primary_causal_breakdown`.

5. **PASSION-FALSE-JUDGEMENT-001** — Two-step structure: canonical lookup + case refinement. Output: `false_judgements[]`, `dominant_false_judgement`, `firing_conditions[]`, `refinement_source` (PROFILE / DERIVED).

6. **OIKEIOSIS-STAGE-001** — Map action to most proximate engaged oikeiosis circle. Output: `primary_circle`, `widest_circle_reached`, `circles_engaged[]`, `oikeiosis_contraction`, `circle_mismatch`.

7. **OIKEIOSIS-OBLIGATION-001** — Cicero's 5 questions applied to each circle's role obligations. Output: `obligation_status[]`, `cicero_q1_passed`, `cicero_q5_applied`, `circle_conflict`, `circle_conflict_resolution`.

8. **VALUE-INDIFFERENT-001** — Identify preferred indifferents at stake and how each is treated; identify value errors (INFLATION / DEFLATION / INVERSE_DEFLATION). Output: `indifferents_at_stake[]`, `treatment_map[]`, `value_errors[]`, `dominant_value_error`, `value_error_without_passion_flag`.

9. **VIRTUE-DOMAIN-ENGAGED-001** — Classify each cardinal virtue's engagement; apply unity check; weight weakest virtue. Output: `virtue_engagement[]`, `unity_inconsistency`, `unity_resolution[]`, `weakest_virtue_flag`, `dominant_virtue_failure`.

10. **KATORTHOMA-PROXIMITY-001** — Composite proximity via weakest-link aggregation across four dimensions; directional modifier; Senecan grade overlay; proximity-specific risk flags. Output: `dimension_scores`, `composite_score`, `proximity_level`, `weakest_dimension`, `direction`, `senecan_grade`, `proximity_risk_flag` (PASSION_DOMINANCE / CONVENTION_SUBSTITUTION / TECHNIQUE_SUBSTITUTION / STABILITY_TEST / THEORETICAL_ONLY), `profile_tension_flag`.

The full operationalisations (sources, inputs, logic, outputs, examples, interpretive moves, cleanliness ratings) are preserved in the conversation transcript that produced this handoff. Phase 1 Deliverable 8 packages them into a versioned rule book artefact at `/drafts/rag-mentor-alt3/operationalised-rules.md`.

All ten rules are PARTIAL cleanliness — deterministic core with a small number of interpretive sub-steps, mostly resolved by structured intake (AC-13 Tier 1) and the no-shareable-artifact reflect endpoint (AC-18).

## The dependency map

Six dependencies across the rule chain (four newly identified during the exercise):

| # | Type | Dependency | Resolution |
|---|---|---|---|
| 1 | Forward | Rule 5 → Rule 9 (correct_judgement enrichment) | Two-pass: Rule 5 placeholder, Rule 9 fills, Rule 5 enriches |
| 2 | Circular | Phronesis ↔ Andreia within Rule 9 (unity thesis) | Sequence phronesis first using Rule 8 output |
| 3 | Bidirectional | Rule 7 ↔ Rule 9 (Cicero Q1 needs virtue assessment; dikaiosyne needs obligation status) | Two-pass: provisional Q1 from action description, Rule 9 runs, Rule 7 confirms |
| 4 | Conditional back-edge | Rule 8 → Rules 2/3 (`VALUE_ERROR_WITHOUT_PASSION` triggers re-run) | Conditional loop, not mandatory |
| 5 | Forward | Rule 6 → Rule 2 (stated vs operative concern needs passion data) | Sequence Rule 2 before Rule 6 |
| 6 | Aggregation | Rule 10 → Rules 1–9 (composite is only as accurate as upstream) | Surface upstream confidence in Rule 10 output |

Phase 1's engine sequencing logic (Deliverable 9) specifies the order: 1 → 2 → 3 → 4 → 5 (placeholder) → 6 → 7 (provisional) → 8 → 9 → 5 (enrich) → 7 (confirm) → 10. Conditional back-edge from 8 to 2/3 fires when `VALUE_ERROR_WITHOUT_PASSION` is set.

## The three-tier intake clarification model

**Tier 1 — Force clarification at intake.** Component A structural triggers (ELEMENT_FUSION, SCOPE_AMBIGUITY, TEMPORAL_AMBIGUITY) fire when the engine cannot extract structured features from free text. The engine asks the practitioner to clarify before proceeding. Sample question text (from the architecture exercise):

- "Before I work through this with you — can you tell me in one sentence what you were most concerned about in that moment? Not what happened, but what mattered to you about it."
- "Who else was affected by this, if anyone? And what role do they play in your life — colleague, family member, someone you don't know well?"
- "When you think about this situation right now, are you more concerned about something that's already happened, or something you're worried might happen?"

These are factual questions. Practitioner answers reliably. Determinism gain: HIGH.

**Tier 2 — Soft clarification as reflective prompt.** STATED_OPERATIVE_CONFLICT trigger and STATED_EQUANIMITY_UNVERIFIED empirical redirect. Engine offers a question; practitioner can answer or decline; non-answer doesn't block scoring. Sample question text:

- "You mentioned being concerned about how they were feeling. I want to check something with you — when you imagine this going badly, what's the thing you're most worried about for yourself?"
- "Has there been a recent time when something similar went the other way — when the outcome you hoped for didn't arrive — and you noticed how you actually felt, not how you thought you should feel?"

Tier 2 questions enrich context but don't determine classification.

**Tier 3 — Deterministic withhold + surface as `OPEN_DEFERRAL`.** Eupatheia boundary and praxis-level motivation triggers. Engine deterministically chooses to withhold, surfaces as `OPEN_DEFERRAL` with timestamp and the specific question that remains open. The deferred question goes to the reflect endpoint; the original instance score is marked with the unresolved fields visible in the scoring record.

## Conversation/reflect coupling — sub-option 1b with structured intake

The reflect endpoint is the resolution mechanism for Tier 3 deferrals. Architecturally:

- Reflect endpoint presents the specific deferred question(s) from prior instances. **No prompt, no facilitation, no Socratic framing.** "You left a question open from [date]: [question text]. There's no prompt — just what you found."
- Practitioner submits reflection content addressing the question (or chooses not to).
- Engine processes the reflection through the same Tier 1/2/3 logic as the conversation surface. If Tier 3 fires again on the reflection itself, deferral re-cascades (rare in practice; usually the practitioner's reflection provides the missing self-knowledge).
- On successful resolution, the original instance score is updated retrospectively and the `OPEN_DEFERRAL` flag is closed.
- **No shareable artifact is produced.** The reflect endpoint outputs no visible score, report, or summary. Only the internal classification update and the closed `OPEN_DEFERRAL` flag (visible in the scoring record but not as a celebratory artefact).

The matching task (does this reflection address this deferred question?) is the small interpretive seam in 1b. Mitigated by structured intake — the engine presents the specific question and asks the practitioner to confirm whether their response addresses it.

## Three principles for long-deferred questions

1. **Engine doesn't nag.** The conversation surface does not surface deferred questions repeatedly across new instances. The reflect endpoint is the only surface where deferred questions appear, and only when the practitioner opens the reflect endpoint.

2. **Deferrals visible in the scoring record.** `OPEN_DEFERRAL` flags appear in the practitioner's profile with timestamps. Long-deferred questions accumulate visibly. The scoring record reflects what the practitioner has actually examined, not what they have been credited with examining.

3. **Mentor names the pattern at next natural opportunity.** When the practitioner brings a new instance from a domain where a deferred question is open, the mentor reply notes the open deferral as observation, not as prompt. *"You've had a question open since [date] about [topic]. I'm not asking you to answer it now — but I want you to know it's still open."* This is the mentor's follow-up function in Stoic practice.

## Two residual seams (acknowledged as philosophical residues, not engineering gaps)

**Seam 1 — `SELF_REPORT_DEPENDENT`.** Praxis-level motivation classifications depend on practitioner self-report. The self-report itself is not deterministic. Architecture flags the dependency rather than treating the classification as fully confirmed.

**Seam 2 — `CONFIDENCE_WEIGHTED`.** Eupatheia classifications cannot be confirmed from a single instance or self-report. Confidence weight increases with longitudinal evidence in the same domain. A classification consistent across twelve instances carries higher confidence than one based on a single self-report. Genuine progress in a domain may temporarily produce confidence drops as the profile prior catches up to the new behaviour.

Both seams reflect genuine limits of self-knowledge that the Stoic tradition itself acknowledges. The architecture names them; it does not try to close them.

## The no-shareable-artifact constraint (AC-18)

The reflect endpoint produces no output that can be shown, shared, or used as evidence of having examined oneself. No reflection score. No progress summary. No developmental visualisation.

This is not a UX gap to be filled later. It is a deliberate architectural constraint, derived from the principle that virtue requires no external witness. For a practitioner with confirmed philodoxia, any shareable output of the examination tool becomes a reputation-generation mechanism inside the examination tool. The constraint removes the mechanism. The examination is genuinely private, genuinely unrewardable, and genuinely the practitioner's own.

The reflect endpoint outputs only:
- The internal classification update (retrospective score adjustment on the original instance)
- The closed `OPEN_DEFERRAL` flag

Both are visible in the scoring record but not as shareable artefacts. The practitioner cannot point to a completed reflection; the only evidence of completed examination is the closing of an open deferral, which the practitioner themselves must look up.

## Build-order condition (AC-19)

**Phase 2's first build pass is the reflect endpoint, not the conversation surface.**

This is the architectural commitment that the examination matters more than the scoring engine. The reflect endpoint is the unglamorous part of the architecture: a structured intake form that presents a deferred question and waits, producing no shareable artefact. Building it first signals that the examination tool is the load-bearing component, not an afterthought.

The conversation surface (10 rules, three-tier clarification, retrieval-augmented translation sandwich) is built second, against a working reflect endpoint that already handles deferrals correctly.

The condition is non-negotiable in the Phase-1 design. Phase 2 sequencing follows from it.

---

## Phase-1 Deliverables (twenty-three)

Produce these in `/drafts/rag-mentor-alt3/`:

1. **ADR** (`/drafts/ADR-RAG-MENTOR-ALT3-01-translation-sandwich-deterministic-engine.md`) — documents AC-1 through AC-19.
2. **Canonical mechanism framework** — reconciles 5-mechanism / 4-stage / compact variants. Critical path.
3. **Passion taxonomy** — formalises four root passions and sub-species. Critical path.
4. **Corpus inventory** — Stoic Brain content tagged against canonical framework, passion taxonomy, and passage_type (mechanism / canonical_line / example / focus_question_stem / scoring_rule).
5. **Index schema** — Supabase pgvector + tsvector recommended; resolves storage decision.
6. **Retrieval interface** — hybrid retrieve function signature, fusion method, top-K, error modes.
7. **Re-rank design** — cross-encoder vs LLM-as-reranker vs heuristic, with cost-quality table.
8. **Operationalised scoring rules** — packages the 10 rules from the architecture exercise into a versioned rule book.
9. **Rule dependency map and engine sequencing logic** — six dependencies, two-pass sequencing where required.
10. **Layer 1 translation specification** — input translation prompt, schema, controlled vocabulary, error/uncertainty handling.
11. **Layer 3 translation specification** — output translation prompt, narrative paraphrase rules, slot-fill mechanics for focus questions.
12. **Strict inclusion + exclusion design** — paraphrase prompt template combining inclusion and exclusion constraints.
13. **Three-tier intake clarification specification** — Tier 1 force, Tier 2 soft, Tier 3 OPEN_DEFERRAL. Trigger logic, question text, conversation flow.
14. **Reflect endpoint design** — 1b structured intake, no-shareable-artifact constraint, deferral-resolution mechanism.
15. **Long-deferred questions handling** — three principles encoded as engine behaviour.
16. **Score-in-reply design** — conversation response payload shape; structured score + narrative.
17. **Progression delta design** — comparison logic, prior-state read, signal definition.
18. **Verification design** — verifies narrative traces to retrieved passages; verifies structured score is consistent with retrieved evidence.
19. **Residual seams handling** — SELF_REPORT_DEPENDENT and CONFIDENCE_WEIGHTED flag specifications.
20. **Cost model** — per-turn cost across both surfaces; comparison to current baseline.
21. **Migration plan** — PR1 single-endpoint proof on private-mentor surface; **reflect-endpoint-first build order**; env flag; rollback path; Phase-2 sequencing.
22. **Test plan** — structural, behavioural, purity, founder-performable verification per 0c.
23. **Open-questions register** — Graph RAG outline (AC-6 deferred); Phase 3+ migration of score-family endpoints; corpus expansion as parallel track.

The three critical-path deliverables (2, 3, 8) must be approved before downstream deliverables proceed.

## Differences from Alt 2 (at a glance)

| Aspect | Alt 2 | Alt 3 |
| --- | --- | --- |
| Architecture pattern | RAG-augmented LLM with structured output | **Translation sandwich + deterministic engine** |
| Stoic reasoning location | Claude paraphrase under retrieval grounding | **Deterministic engine; Claude is translation only** |
| Strict prompting | Inclusion only | **Inclusion + exclusion** |
| Tier 3 (eupatheia / praxis motivation) | Soft-gate with UNCONFIRMED flag | **Deterministic withhold as kathekon → OPEN_DEFERRAL** |
| Reflect endpoint | Implicit (reflect endpoint stays as-is) | **Load-bearing; 1b structured intake; no shareable artifact** |
| Build order | Conversation surface first | **Reflect endpoint first** |
| Determinism coverage estimate | ~80–90% conv surface; ~95%+ across coupled pair | **Full determinism in engine outputs; two acknowledged philosophical residues** |
| Phase-1 deliverables | 17 | 23 |
| Phase-2 build effort | High | **Highest, but with the reflect endpoint as the proof point** |

## What Phase 1 (Alt 3) Does Not Decide

- Whether Claude remains the Layer 1/Layer 3 translator or is replaced by a smaller / fine-tuned model (Phase 3+ question; Layer 1/3 specifications are translator-agnostic).
- Whether Class 1 score endpoints actually migrate to the deterministic engine (Phase 3+ question; index designed to support migration).
- Whether to support the founder-hub flow with the same architecture later (Phase 4+ question).
- Whether to expand the Stoic Brain corpus (parallel track).
- Whether to commit Graph RAG (AC-6 outline only).

## Approval Gate

Phase 2 (build, starting with the reflect endpoint) does not begin until the founder has reviewed and approved each of the twenty-three Phase-1 deliverables. Approval can be batched or per-document. The three critical-path deliverables (2, 3, 8) must be approved before downstream deliverables proceed.

---

## Blocked On

- Founder push of today's commits (cull + snapshots + decision-log entries + this handoff + the alt-3 prompt) before Phase-1 session begins.

## Open Questions

- **First Phase-1 session sequencing.** Twenty-three deliverables is substantial. Should Phase 1 be one extended session, multiple focused sessions per deliverable batch, or a hybrid? Recommendation: hybrid — three sessions covering critical-path deliverables (2, 3, 8) in session 1; engine sequencing + intake clarification + reflect endpoint design (deliverables 9, 13, 14, 15) in session 2; remaining deliverables in session 3. Founder calls this at session-1 open.

- **Whether the live mentor remains the rule-operationalisation tool.** The 10 rules from the architecture exercise are the candidate rule book, but the live mentor's persona is currently coaching-flavoured. For ongoing rule maintenance, refinement, and addition of new rules (e.g., when corpus expansion adds new mechanisms), is a dedicated "rule operationalisation mentor" mode the right pattern? This is itself a Phase-1 design decision worth surfacing.

- **The personal/philosophical question.** The mentor's closing observation in the architecture exercise — that the build-order condition is itself a Stoic test for the practitioner — is not for this handoff to address. It is for the founder's evening review. Surfaced here only because the architecture's commitments (AC-18, AC-19) are direct expressions of the philosophical commitment, and the founder should be aware that adopting alt 3 includes adopting that commitment.

## Verification Method Used (0c framework)

| Work item | Verification method |
| --- | --- |
| Snapshot + parked files | Founder reads directly. |
| Observer cull (route edit) | TypeScript check; founder live-site verification post-push. |
| Decision-log entries | Founder reads directly. |
| Architecture exercise (10 rules + 5-dimension proposal evaluation) | Live private mentor produced operationalisations and evaluation; founder validated alongside; comparison report produced. |
| Phase-1 alt-3 design (next session) | Founder reads each of 23 deliverables; approves or sends back for redesign. Critical-path deliverables (2, 3, 8) approved before downstream deliverables proceed. |
| Phase-2 build (later sessions) | Reflect endpoint first; founder live-site verification; PR1 single-endpoint proof; env flag rollback. |

## Risk Classification Record (0d-ii)

| Change | Risk | Reasoning |
| --- | --- | --- |
| Phase-1 alt-3 drafts (next session) | Standard | Design only, no code. Drafts under `/drafts/rag-mentor-alt3/`, no live-system effect. |
| ADR adoption | Elevated | Governing document. |
| Canonical framework + passion taxonomy adoption | Elevated | Becomes part of canonical Stoic Brain definition. |
| Phase-2 reflect endpoint build | Critical | Touches authentication / session management surface; PR6 perimeter. Requires Critical Change Protocol per 0c-ii. |
| Phase-2 conversation surface build | Critical | Touches mentor pipeline; PR6 + R20a perimeter. Requires Critical Change Protocol. |

## PR5 — Knowledge-Gap Carry-Forward

- **Translation-sandwich + neuro-symbolic terminology** — surfaced in the architecture exercise; logged as candidate for first observation. If re-explained in a future session, becomes a KG candidate.
- **Withholding as deterministic kathekon** — the architectural reframing of Tier 3 from non-determinism residue to deterministic rule output. Likely a re-explanation candidate; logged.
- **No-shareable-artifact constraint as architectural commitment** — derived from the philosophical principle that virtue requires no external witness. Likely a re-explanation candidate, especially given that most product designs treat reflection outputs as features.
- **Build-order condition as philosophical test** — the architectural commitment to build the reflect endpoint first, derived from the Stoic principle that examination matters more than the impressive structure built around it. May require re-explanation in any future session that proposes deviating from this order.

## Founder Verification (Between Sessions)

After pushing today's commits, allow ~1 minute for Vercel to deploy.

**Step 1 — Verify private-mentor cull is live** (same as alt 2 handoff): Open `https://www.sagereasoning.com/private-mentor`, send any short test message, mentor should reply as before with reduced latency.

**Step 2 — Verify founder-hub flow is unchanged** (same as alt 2 handoff): Open `https://www.sagereasoning.com/founder-hub`, send any short test message, observer / recommended-action elements should still appear.

**Step 3 — If anything is wrong, restore from the backup** (same as alt 2 handoff).

**Step 4 — Read this handoff and the alt-3 prompt before opening the next session.** Twenty-three deliverables is substantial; the prompt's read sequence is longer than prior prompts. Familiarity with the architectural commitments before session open improves session opening speed.

---

## Orchestration reminder (Part C element 21)

This alt-3 handoff was produced under `/adopted/session-opening-protocol.md`. The architecture exercise that produced its substance was a sustained operationalisation test in this session, validated through the live private mentor's structured operationalisations. No protocol elements skipped. The build-order condition (AC-19) is itself an extension of the protocol's principle that the practitioner is responsible for their own examination — applied to product architecture.

---

## Cross-references

- `/operations/handoffs/founder/2026-04-29b-private-mentor-rag-phase1-close.md` (baseline handoff — superseded but preserved as reasoning trail)
- `/operations/handoffs/founder/2026-04-29-rag-phase1-NEXT-SESSION-PROMPT.md` (baseline next-session prompt — superseded)
- `/operations/handoffs/founder/2026-04-29c-private-mentor-rag-phase1-ALT-close.md` (alt 1 handoff — superseded)
- `/operations/handoffs/founder/2026-04-29-rag-phase1-ALT-NEXT-SESSION-PROMPT.md` (alt 1 next-session prompt — superseded)
- `/operations/handoffs/founder/2026-04-29d-private-mentor-rag-phase1-ALT2-close.md` (alt 2 handoff — superseded)
- `/operations/handoffs/founder/2026-04-29-rag-phase1-ALT2-NEXT-SESSION-PROMPT.md` (alt 2 next-session prompt — superseded)
- `/operations/handoffs/founder/2026-04-29-rag-phase1-ALT3-NEXT-SESSION-PROMPT.md` (alt 3 next-session prompt — companion to this file, **active**)
- `/archive/2026-04-29_end-to-end-mentor-pipeline_snapshot.md` (rollback baseline)
- `/archive/2026-04-29_end-to-end-founder-hub-mentor_parked.md` (founder-hub-scoped reference)
- `/operations/decision-log.md` D-MENTOR-PIPELINE-SNAPSHOT-2026-04-29 and D-PRIVATE-MENTOR-OBSERVER-CULL-2026-04-29
- `/website/src/lib/sage-reason-engine.ts` (5-mechanism shape — STANDARD_SYSTEM_PROMPT)
- `/website/src/app/api/mentor/private/reflect/route.ts` (4-stage shape — REFLECTION_PROMPT)
- `/website/src/app/api/score-scenario/route.ts` (compact variant — feedback + sage_says)
- `/website/src/app/api/score-social/route.ts` (compact variant — proximity + publish_recommendation)
- `/stoic-brain/scoring.json` (canonical scoring rules; the 4-stage evaluation sequence)
- `/stoic-brain/stoic-brain.json` (canonical Stoic Brain corpus)
- The architecture exercise transcript (the session in which the 10 rules and 5-dimension proposal evaluation were produced) — preserved in conversation history; Phase-1 Deliverable 8 packages the rule operationalisations into a versioned artefact.
