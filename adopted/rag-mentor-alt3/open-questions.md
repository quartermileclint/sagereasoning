# Deliverable 23 — Open-Questions Register

**Status:** Adopted (founder approval per Path A on 2026-05-02 — Phase-1 completion review; D-RAG-MENTOR-ALT3-PHASE1-COMPLETION-REVIEW-APPROVED-2026-05-02). Moved from `/drafts/rag-mentor-alt3/` to `/adopted/rag-mentor-alt3/` 2026-05-02.
**Date:** 2026-05-02.
**Stream:** founder.
**Governing frame:** `/adopted/session-opening-protocol.md`.
**Implements:** PR7 (decisions not made are documented — every deferred decision is recorded with reasoning, what was considered, why it was deferred, and what condition triggers revisiting it); R0 (oikeiosis principle — the audit trail of deferred decisions serves R0's commitment to honest reasoning record).

**Cross-references:**
- All 22 other Phase-1 deliverables — D23 catalogues their open questions for tracking.
- `/operations/handoffs/founder/2026-04-29e-private-mentor-rag-phase1-ALT3-close.md` (alt-3 architecture)
- `/manifest.md` (R0, R5, R17, R20a, AC1-7 — the standing constraints whose interactions are deferred decisions)
- `/operations/decision-log.md` D-RAG-MENTOR-ALT3-VALIDATED-2026-04-29 (Validation Addendum scope limitations recorded)

---

## Plain-language summary

Phase-1's 23 deliverables surface architectural commitments and per-deliverable open questions. Some open questions need founder direction at review time; others are deferred to Phase-2 production observation; others are deferred to Phase-3+ scope expansions; others are working-value parameters that may shift with operational evidence.

This deliverable is the **single catalogue** of unresolved Phase-1 questions and deferred decisions. Per PR7, every entry has: question text, why it's deferred, what condition triggers revisit, and the deliverable(s) the question affects.

The categories:

1. **Architectural commitments deferred** — alt-3 commitments where the architecture commits to the design without committing to specific implementation choices.
2. **Founder direction deferred** — questions that need founder calls at deliverable review time.
3. **Working-value parameters deferred** — numeric thresholds and tuning parameters that may shift with Phase-2 production observation.
4. **Phase-2 build preconditions** — work items that must complete before specific Phase-2 passes commence.
5. **Future revision passes** — known-deferred revisions to existing deliverables.
6. **Cross-cutting limitations** — scope acknowledgements that affect multiple deliverables.

Each entry serves PR7's purpose: deferring a decision is itself a decision; the audit trail records why and what condition would trigger revisiting.

## Glossary

- **Deferred decision** — a decision the architecture explicitly does not make in Phase 1, with reasoning and revisit condition.
- **Working-value parameter** — a numeric or threshold value chosen as a reasonable starting point pending production observation.
- **Build precondition** — a Phase-2 work item that must complete before a specific pass commences.
- **Future revision pass** — a known-deferred update to an existing deliverable, scheduled for a future session.
- **Scope limitation** — an acknowledged limit of the architecture's coverage (e.g., calibration to one practitioner profile per ES1).

---

## Category 1 — Architectural commitments deferred

### O1.1 — Graph RAG (AC-6 outline only)

**Question:** Does Phase 1 commit to Graph RAG as a retrieval extension?

**Why deferred:** AC-6 explicitly states Phase 1 does **not** commit to Graph RAG; the index is designed to be Graph-RAG-extensible (per D5 §"Graph RAG extensibility (per AC-6)"). Phase 1's hybrid retrieval (BM25 + vector via RRF — D6) is sufficient for the small Phase-1 corpus.

**Revisit condition:** Phase-2 production observation surfaces retrieval-quality patterns that hybrid retrieval cannot meet. Specifically: per-mechanism recall@10 below 85% on canonical anchor patterns, and the cross-encoder upgrade per D7 doesn't close the gap. Phase 3+ Graph RAG addition lands as a corpus_passage_edges table extension (D5 sketches the schema).

**Affected deliverables:** D5, D6, D7.

### O1.2 — Phase-3+ migration of score-family endpoints

**Question:** When and in what order do `/api/score`, `/api/score-decision`, `/api/score-document`, `/api/score-scenario`, `/api/score-social` migrate to the alt-3 engine?

**Why deferred:** Per AC-7, score-family endpoints stay on baked-in prompts in Phase 1. Phase 2 covers the conversation surface and the daily-reflection ritual surface (D14a + D14b + conversation per D21). Score-family migration is Phase 3+.

**Revisit condition:** After Phase-2 lands and stabilises (Pass 1, 2, 3 all reach Verified status). Founder calls the Phase-3+ scope based on observed Phase-2 production usage.

**Recommended order (per D21 §"Phase-3+ — Score-family endpoint migrations"):** Routes 1, 2 (most-used) → Routes 4, 5 (compact variants) → Route 3 (architecturally distinct, largest scope).

**Affected deliverables:** D21, D24, all per-route Phase-3+ migration projection sections in D24.

### O1.3 — Corpus expansion (D-A10 parallel track)

**Question:** When does the corpus expand beyond the 8 source files plus the D-A16 catalogue?

**Why deferred:** D-A10 is a parallel track to alt-3. The Phase-1 corpus calibration is for the founder's profile (per ES1 / Validation Addendum). Other practitioner profiles (penthos primary; phthonos primary; aischyne primary) have known coverage gaps per D4 §"Coverage gaps".

**Revisit condition:** Practitioners with non-philodoxia primary profiles need coverage. Phase-3+ or post-launch observation. The D-A10 expansion lands as new rows in `corpus_passages` with appropriate tags; no schema migration needed.

**Affected deliverables:** D4, D5, D8 (rule book recalibration may follow).

### O1.4 — D-A16 focus-question stems catalogue promotion

**Question:** When and how is the focus-question-stem catalogue promoted from informal patterns (mentor-knowledge-base.ts; existing REFLECTION_PROMPT) to formal corpus content?

**Why deferred:** D-A16 is named in D4 §"Coverage gaps" Gap 1 as a Phase-2 build precondition (per D5 / D14b / D21). The catalogue assembly is Phase-2 work, not Phase-1 design.

**Revisit condition:** Phase-2 pass 1 (D14b deferral-resolution surface) requires at minimum the EUPATHEIA_BOUNDARY and PRAXIS_MOTIVATION_AMBIGUITY trigger code stems before reaching operational completeness. Phase-2 build sequencing resolves the catalogue's incremental promotion.

**Affected deliverables:** D4, D5, D13, D21.

---

## Category 2 — Founder direction deferred

### O2.1 — D14a daily-reflection ritual: own page or embedded view?

**Question:** Does the daily-reflection ritual move to its own page (`/private-mentor/ritual` or `/daily-reflection`) or stay embedded in `/private-mentor` as today's MorningView/EveningView?

**Recommendation:** Own page (per D14a §"Surface design — own page or embedded view" + D14a §"The recommendation"). The ritual's structurally distinct intention (forward-looking deferred questions; persistent rendering for revisit; clear separation from the dialogue stream) honours the architectural distinction.

**Why deferred:** Founder calls based on UX preferences and observed practitioner needs. Both options preserve AC-12 + AC-18 scoping.

**Revisit condition:** Founder reviews D14a at deliverable approval; calls own-page or embedded; Phase-2 pass 2 builds against the call.

**Affected deliverables:** D14a, D21.

### O2.2 — D14a `mentor_observation` visibility

**Question:** Should `mentor_observation` (Mechanism 10's `structured_observation` paraphrased to one sentence) become a visible field on the daily-reflection ritual response?

**Recommendation:** Visible (per D14a §"Founder direction needed — `mentor_observation` visibility"). The 2026-05-01 founder direction supports this; the observation is in third-person about the practitioner; R20d compliance preserved.

**Why deferred:** Founder calls based on UX preferences and observed practitioner needs.

**Revisit condition:** Founder reviews D14a at deliverable approval; calls visible / hidden / opt-in; Phase-2 pass 2 builds against the call.

**Affected deliverables:** D14a, D11 (Layer 3 prose surfacing for the field), D17 (the structured_observation feeds into progression delta context).

### O2.3 — D14b route name and page route

**Question:** What are the names of the new route and the new page?

**Recommendation:** `/api/mentor/private/deferral-resolve` (route) + `/private-mentor/deferred-questions` (page). Per D14b §"The new route name" + §"Page route".

**Why deferred:** Founder calls based on naming preferences. Alternatives: `/api/mentor/private/sit-with`, `/api/mentor/private/return`.

**Revisit condition:** Founder reviews D14b at deliverable approval; calls names; Phase-2 pass 1 builds against the calls.

**Affected deliverables:** D14b, D21.

---

## Category 3 — Working-value parameters deferred

### O3.1 — D15 long-deferred threshold N=7 days

**Question:** When does an OPEN_DEFERRAL become "long-deferred" — at what threshold N (in days from `created_at`) does the mentor surface the named-pattern observation?

**Recommendation:** N = 7 days (per D15 §"Threshold for 'long-deferred'"). Conservative — allows time for the practitioner to sit with the deferral before the mentor's observation fires.

**Why deferred:** Working value. Phase-2 production observation may surface practitioners whose timing differs (e.g., practitioners who reflect daily and need a shorter threshold; practitioners who reflect weekly and need a longer one).

**Revisit condition:** Phase-2 production observation reports on practitioner experience with the threshold. Per-practitioner override available; default applies until profile-specific override.

**Affected deliverables:** D15.

### O3.2 — D9 back-edge loop guard threshold = 1

**Question:** Per D9 §"Loop-guard specification", the conditional back-edge from Rule 8 to Rules 2/3 has a loop guard limit of 1 re-run per request. Is this the right value?

**Recommendation:** 1 re-run per request (per D9). The architecture exercise did not produce evidence that more than 1 re-run is needed.

**Why deferred:** Phase-2 production observation may surface cases where 2 re-runs would resolve a value error that 1 re-run does not.

**Revisit condition:** Phase-2 production observation reports cases where the back-edge exhausts (per `back_edge_exhausted: true` diagnostic) and a second re-run might have caught a passion the first re-run missed.

**Affected deliverables:** D9.

### O3.3 — D17 confidence_weighted thresholds (3/10 instances; 14/60 days)

**Question:** Per D17 §"Single-instance vs multi-instance evidence", the `confidence_weighted` levels transition at 3/10 instances and 14/60 days. Are these the right values?

**Recommendation:** Working values. Phase-2 production observation refines.

**Why deferred:** No empirical evidence at design time. Different practitioners may have different cadences; the thresholds may need per-practitioner override.

**Revisit condition:** Phase-2 production observation reports on direction-signal accuracy at each level; threshold tuning if accuracy is consistently off.

**Affected deliverables:** D17, D19.

### O3.4 — D7 heuristic re-rank multiplier values (1.5 / 1.3 / 1.2 / 1.1)

**Question:** The heuristic re-rank scoring formula uses multiplicative boosts (mechanism 1.5x, passion 1.3x, passage_type 1.2x, audience_tier 1.1x). Are these the right values?

**Recommendation:** Working values. Phase-2 production observation refines.

**Why deferred:** No empirical evidence at design time. Per-mechanism tuning may improve recall@K.

**Revisit condition:** Phase-2 production observation reports on retrieval quality; per-mechanism boost tuning if specific mechanisms show consistently suboptimal rankings.

**Affected deliverables:** D7.

### O3.5 — D7 cross-encoder upgrade trigger threshold

**Question:** When does a specific mechanism's re-rank policy upgrade from heuristic to cross-encoder?

**Recommendation:** Per Phase-2 production observation. Threshold not specified at design time.

**Why deferred:** No empirical baseline. Phase-2 build chooses how to measure "consistently suboptimal" via observation.

**Revisit condition:** Phase-2 production observation produces retrieval-quality measurements; founder reviews quarterly (or more frequently if a mechanism's quality is contested).

**Affected deliverables:** D7.

### O3.6 — D6 default RRF weights (0.5 / 0.5)

**Question:** The retrieval interface uses 0.5/0.5 BM25/vector weight. Per-mechanism tuning may improve retrieval quality.

**Recommendation:** 0.5/0.5 default; per-call override supported via input parameters.

**Why deferred:** No empirical evidence at design time.

**Revisit condition:** Phase-2 production observation; per-mechanism RRF weight tuning if specific mechanisms benefit from different weights.

**Affected deliverables:** D6.

### O3.7 — D5 embedding model upgrade trigger

**Question:** When does the embedding model upgrade from `text-embedding-3-small` (1536 dim, $0.02/M tokens) to `text-embedding-3-large` (3072 dim, $0.13/M tokens) or alternative?

**Recommendation:** Re-evaluate `text-embedding-3-large` if Phase-2 production retrieval recall@10 falls below 85%.

**Why deferred:** No empirical baseline. Phase-1 corpus is small; the small model is sufficient.

**Revisit condition:** Phase-2 production observation reports retrieval recall@10 per mechanism; upgrade evaluation if quality is consistently below threshold.

**Affected deliverables:** D5.

### O3.8 — D17 progression delta window (90 days, 30 instances)

**Question:** The progression delta window is 90 days / 30 max instances. Is this the right window?

**Recommendation:** Working values. Phase-2 production observation may refine.

**Why deferred:** No empirical baseline.

**Revisit condition:** Phase-2 production observation reports on whether the window captures meaningful trajectory information for the founder's usage cadence.

**Affected deliverables:** D17.

### O3.9 — D14b page count of recently-closed deferrals

**Question:** Should the deferral-resolution page display a count of recently-closed deferrals?

**Recommendation:** Do NOT display a count (per D14b §"Open questions" item 5). AC-18 prohibits celebratory artefacts; a count of closed deferrals borders on a streak counter.

**Why deferred:** Founder calls; the page-side architecture supports either.

**Revisit condition:** If founder direction at D14b approval is "show count", the architecture supports it; otherwise, no count.

**Affected deliverables:** D14b.

---

## Category 4 — Phase-2 build preconditions

### O4.1 — D-A16 catalogue promotion (Phase-2 pass 1 precondition)

**Question:** The D-A16 focus-question-stems catalogue must be promoted before Phase-2 pass 1 reaches operational completeness.

**Why deferred:** Catalogue assembly is Phase-2 build work, not Phase-1 design.

**Revisit condition:** Phase-2 build sequencing resolves. Pass 1 minimum requirement: EUPATHEIA_BOUNDARY and PRAXIS_MOTIVATION_AMBIGUITY trigger code stems. Other stems land at later passes.

**Affected deliverables:** D4, D5, D13, D21.

### O4.2 — Two snapshots before Phase-2

**Question:** Two snapshots are recommended before Phase-2 begins.

**Status:**
- `/api/mentor/private/reflect` snapshot — ✅ **Done** per `D-MENTOR-PRIVATE-REFLECT-PRE-ALT3-SNAPSHOT-2026-05-02`. Located at `/archive/2026-05-02_api-mentor-private-reflect_pre-alt-3-snapshot.md`.
- `/api/reason` snapshot — Deferred. Lands before Phase-2 pass 3.

**Why the `/api/reason` snapshot is deferred:** Phase-2 pass 3 (conversation surface migration) is downstream of Pass 1 and Pass 2; the snapshot can land alongside Pass 3 planning.

**Revisit condition:** Phase-2 pass 2 verification commences → `/api/reason` snapshot produced before Pass 3 begins.

**Affected deliverables:** D21, D24.

### O4.3 — Encryption wiring (P2 task 2c) coordination

**Question:** P2 task 2c (per project instructions Priority 2) wires application-level encryption per R17b. D14b's Phase-2 pass 1 build coordinates: encryption must be operational before the new tables write encrypted data.

**Recommendation:** P2 task 2c lands first; Phase-2 pass 1 builds against the wired module.

**Why deferred:** P2 task 2c is itself a Critical-risk task with its own Critical Change Protocol; Phase-2 pass 1 must coordinate with its sequencing.

**Revisit condition:** P2 task 2c approval and deployment status before Phase-2 pass 1 commences.

**Affected deliverables:** D14b, D21, project instructions Priority 2.

---

## Category 5 — Future revision passes

### O5.1 — D8 v1.1.0 transcript-faithful redo

**Question:** D8's current v1.0.0 was re-derived from architectural commitments + corpus + named anchors, **not** from the architecture exercise transcript directly. A v1.1.0 transcript-faithful redo is intended but deferred.

**Why deferred:** The architecture exercise transcript is in conversation history; surfacing it requires a deliberate session. v1.0.0 with the Validation Addendum stands until then.

**Revisit condition:** Founder schedules a transcript-faithful redo session. The redo reads the architecture exercise transcript directly and updates D8's rule operationalisations to match.

**Affected deliverables:** D8.

### O5.2 — D2 amendments per D24 coverage gaps (5 small additions)

**Question:** D24 §"Coverage gaps in D2 mapping tables" identifies 5 small additions to D2:
1. `prior_feedback` projection note for Route 1.
2. Aggregate-across-options note for Route 2.
3. Policy-mode-specific Table 6 for Route 3.
4. quick-depth Table 0 / 1a for Route 6.
5. Table 4a dual applicability for Routes 7 + 8 ritual flow.

**Why deferred:** D2 is now in `/adopted/`. Amending it is Elevated risk per the deliverable's approval-gate footer. The amendments don't block any session-3 deliverable.

**Revisit condition:** Founder schedules a focused D2 amendment session post-Phase-1-completion. The amendment lands as a separate decision-log entry.

**Affected deliverables:** D2, D24.

### O5.3 — D7 LLM-as-reranker fallback

**Question:** If Phase-2 production observation triggers the cross-encoder upgrade for a specific mechanism but the cross-encoder upgrade is operationally rejected (no new vendor; no self-hosting), the LLM-as-reranker fallback is named. Implementation is deferred.

**Why deferred:** Default is heuristic; the fallback is only relevant if both heuristic and cross-encoder are rejected.

**Revisit condition:** Phase-2 production observation triggers re-rank quality concerns AND founder rejects cross-encoder upgrade.

**Affected deliverables:** D7.

---

## Category 6 — Cross-cutting limitations

### O6.1 — Validation Addendum scope (philodoxia calibration)

**Question:** The 10 rules in D8 v1.0.0 (per Validation Addendum) are calibrated against one practitioner profile (philodoxia primary; the founder's profile per ES1).

**Why this is a limitation:** Severity weightings, prior probabilities, and compound-passion thresholds reflect the founder's calibration. Other primary passions (philoplousia-strong, agonia-strong, penthos-strong) will require recalibration before the rule book applies across the full coverage envelope.

**Revisit condition:** Pre-launch coverage expansion or post-launch observation surfaces practitioners with different primary profiles. The recalibration is a Phase-3+ work item.

**Affected deliverables:** D8, ES1.

### O6.2 — Adversarial evaluation deferred

**Question:** R18d names adversarial evaluation as a precondition for broad deployment. Phase 1 design does not perform adversarial evaluation.

**Why deferred:** Adversarial evaluation is a Phase-2 / pre-launch work item. Per project instructions Priority 3 (Agent Trust Layer) Phase 3d.

**Revisit condition:** Pre-launch (Phase-2 / Phase-3+); ideally with external review.

**Affected deliverables:** R18d compliance, project instructions Priority 3.

### O6.3 — Coverage of practitioner profiles outside ES1

**Question:** ES1 names the founder's profile as the eval-suite minimum. Other practitioner profiles are a known coverage gap.

**Why deferred:** Pre-launch test-suite expansion or post-launch observation will cover. Per ES1.

**Revisit condition:** P1 / post-launch task per ES1.

**Affected deliverables:** D22 eval suite, ES1.

### O6.4 — Honest disclosure of pre-D-A16 transitional behaviour

**Question:** Pre-D-A16 promotion, focus-question stems are alt-3-derived (LLM-composed transitional patterns). The architecture explicitly acknowledges this transitional state.

**Why deferred:** D-A16 promotion is a Phase-2 build precondition; pre-promotion the transitional state is honest.

**Revisit condition:** D-A16 catalogue promotion. Post-promotion, all stems are corpus-derived; the transitional flagging in `engine_diagnostics.alt3_derived_questions[]` becomes empty.

**Affected deliverables:** D11, D12, D13.

### O6.5 — Stale-reference cleanup post-D2/D3/D8 move

**Question:** D2/D3/D8 moved to `/adopted/rag-mentor-alt3/` on 2026-05-02. The session-2 deliverables (D4/D9/D10/D11/D13/D14a/D14b/D15) reference D2/D3/D8 at `/drafts/` paths. Per `D-RAG-MENTOR-ALT3-CRITICAL-PATH-MOVED-TO-ADOPTED-2026-05-02`, these references are known-stale and intentionally not updated this session.

**Why deferred:** The references update when the session-2 deliverables themselves move to `/adopted/` (likely as part of Phase-1 session 3's eventual approval batch when all 23 deliverables move together).

**Revisit condition:** Phase-1 session 3 approval batch resolves. The full set of session-2 + session-3 deliverables moves to `/adopted/` together; cross-references update at move time.

**Affected deliverables:** all session-2 + session-3 deliverables.

### O6.6 — Component registry update for D2/D3/D8/D24 path fields

**Question:** The component registry (`/website/public/component-registry.json`) tracks D2, D3, D8, D24 with `path` fields pointing to `/drafts/rag-mentor-alt3/`. Post-move, the paths are stale.

**Why deferred:** A registry update (v1.3.1 or v1.4.0) is the appropriate vehicle to reflect the moves to `/adopted/`. The update is logged per `D-RAG-MENTOR-ALT3-CRITICAL-PATH-MOVED-TO-ADOPTED-2026-05-02`.

**Revisit condition:** Phase-1 session 3 close or a separate registry-update session.

**Affected deliverables:** component registry.

---

## Open-question summary table

| ID | Category | Question | Affected deliverables | Revisit trigger |
|---|---|---|---|---|
| O1.1 | Architectural | Graph RAG commitment | D5, D6, D7 | Phase-2 production retrieval gap |
| O1.2 | Architectural | Phase-3+ score-family migration order | D21, D24 | Phase-2 stable |
| O1.3 | Architectural | Corpus expansion (D-A10) | D4, D5, D8 | Non-philodoxia practitioners |
| O1.4 | Architectural | D-A16 catalogue promotion | D4, D5, D13, D21 | Phase-2 pass 1 precondition |
| O2.1 | Founder direction | D14a own-page or embedded | D14a, D21 | Founder review |
| O2.2 | Founder direction | D14a `mentor_observation` visibility | D14a, D11, D17 | Founder review |
| O2.3 | Founder direction | D14b route + page names | D14b, D21 | Founder review |
| O3.1 | Working value | D15 long-deferred N=7 days | D15 | Phase-2 observation |
| O3.2 | Working value | D9 back-edge loop guard = 1 | D9 | Phase-2 observation |
| O3.3 | Working value | D17 confidence_weighted thresholds | D17, D19 | Phase-2 observation |
| O3.4 | Working value | D7 heuristic multipliers | D7 | Phase-2 observation |
| O3.5 | Working value | D7 cross-encoder upgrade trigger | D7 | Phase-2 observation |
| O3.6 | Working value | D6 RRF weights | D6 | Phase-2 observation |
| O3.7 | Working value | D5 embedding model upgrade | D5 | Phase-2 observation |
| O3.8 | Working value | D17 progression window | D17 | Phase-2 observation |
| O3.9 | Working value | D14b closed-deferral count | D14b | Founder direction |
| O4.1 | Build precondition | D-A16 promotion | D4, D5, D13, D21 | Phase-2 sequencing |
| O4.2 | Build precondition | `/api/reason` snapshot | D21, D24 | Phase-2 pass 3 commencement |
| O4.3 | Build precondition | Encryption wiring (P2 task 2c) | D14b, D21 | P2 task 2c sequencing |
| O5.1 | Future revision | D8 v1.1.0 transcript-faithful redo | D8 | Founder schedules |
| O5.2 | Future revision | D2 amendments per D24 coverage gaps | D2, D24 | Founder schedules |
| O5.3 | Future revision | D7 LLM-as-reranker fallback | D7 | Cross-encoder rejected |
| O6.1 | Limitation | Validation Addendum scope (philodoxia) | D8, ES1 | Coverage expansion |
| O6.2 | Limitation | Adversarial evaluation | R18d | Pre-launch |
| O6.3 | Limitation | Practitioner profiles outside ES1 | D22, ES1 | Post-launch |
| O6.4 | Limitation | Pre-D-A16 transitional behaviour | D11, D12, D13 | D-A16 promotion |
| O6.5 | Limitation | Stale references post-D2/D3/D8 move | session-2 deliverables | Phase-1 approval batch |
| O6.6 | Limitation | Component registry path update | registry | Registry-update session |

## Audit trail

Per PR7 + R0, each open question is recorded with:
- The question text.
- Why it's deferred.
- What condition triggers revisit.
- Which deliverable(s) the question affects.

The audit trail is reconstructable. Future sessions reading D23 can identify deferred decisions, their reasoning, and their revisit conditions.

## Phase-2 production observation roadmap

Phase-2 production observation will report on:
- Working-value parameters (Category 3) — observed values vs the working defaults.
- Retrieval quality (O1.1, O3.4, O3.5, O3.6, O3.7) — recall@K per mechanism.
- Cost trends (per D20's R5 alert thresholds) — actual vs estimated per-call costs.
- Eval-suite results (per ES2/ES3) — coverage of Zone 2 / founder-profile inputs.

The observation reports are scheduled per Phase-2 production planning. Phase-1 design names the categories; Phase-2 sequencing resolves the cadence.

## Cleanliness rating

The catalogue is **HIGH cleanliness** — every entry has the four required fields per PR7. The categories are structurally bounded.

## R0 / PR7 compliance

- **R0 (oikeiosis principle):** the audit trail of deferred decisions serves R0's commitment to honest reasoning. The architecture acknowledges what it does not yet know.
- **PR7 (decisions not made are documented):** every deferred decision is recorded with reasoning and revisit condition. The catalogue is the canonical reference for Phase-2 production observation and Phase-3+ planning.

## Honest disclosure

The open-questions register is the architecture's honest acknowledgement of what is not yet decided. Some questions need founder direction (Category 2); others need empirical evidence (Category 3); others are downstream of Phase-2 build work (Category 4); others are scope acknowledgements (Categories 5, 6).

The catalogue does **not** include questions that have a single recommended answer the architecture commits to. Recommendations in deliverables (D5 single-table; D6 0.5/0.5 RRF default; D7 heuristic default; D17 90-day window) are Phase-1 commitments — they may shift with Phase-2 observation, but the architecture commits to the recommended values as starting points.

The 28 entries in the open-questions register are the ones the architecture explicitly does not commit to. PR7's commitment is to make this explicit.

## Approval gate

This deliverable is consumed by Phase-2 production observation, by Phase-3+ planning, and by post-launch coverage expansion. Approval is part of the same batch as the other Phase-1 session 3 deliverables (Standard risk under 0d-ii). Move from `/drafts/rag-mentor-alt3/` to `/adopted/rag-mentor-alt3/` is Elevated risk.

---

*End of Deliverable 23.*
