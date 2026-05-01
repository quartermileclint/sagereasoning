# Next Session Prompt — RAG Mentor Phase 1 (ALT 3 — Translation-Sandwich + Deterministic Engine + Three-Tier Clarification + Reflect-Endpoint-First Build Order)

**Copy the text below this line into the next session.**

---

Governing frame: `/adopted/session-opening-protocol.md`.

Read the session handoff first: `/operations/handoffs/founder/2026-04-29e-private-mentor-rag-phase1-ALT3-close.md`. That close describes the **adopted** architecture for SageReasoning — alt 3, the third and final alternative considered, which supersedes the baseline (alt 0), alt 1, and alt 2 as the chosen path forward. **Run alt 3; the prior alternatives remain in the reasoning trail but are not active.** Approximately twenty-three draft deliverables.

This is a continuation of SageReasoning P0 (R&D phase). Session focus: founder/tech, governance scope (Phase 1 produces an ADR and substantial drafts under `/drafts/rag-mentor-alt3/`).

**This session is design only. No code. The deliverable is a set of design documents the founder reviews and approves before Phase 2 (build) begins. Phase 2's first build pass is the reflect endpoint, not the conversation surface — a non-negotiable architectural commitment (AC-19) that follows from the philosophical priority that the examination tool matters more than the scoring engine.**

What just happened (in one paragraph):

The previous session produced the end-to-end mentor pipeline snapshot, culled steps 17 + 18 on the private-mentor surface, and ran an extended architecture exercise that progressed through baseline → alt 1 → alt 2 → alt 3. Within alt 3, the founder accepted the translation-sandwich pattern (Claude restricted to Layer 1 input translation and Layer 3 output translation; deterministic engine in the middle), validated the architecture by producing full structured operationalisations for ten Stoic Brain scoring rules through the live private mentor, evaluated a proposal for dynamic intake clarification (resulting in the three-tier model: force / soft / OPEN_DEFERRAL), reframed Tier 3 from non-determinism residue to deterministic kathekon (withholding as the right action when the practitioner is best served by sitting with the question), adopted sub-option 1b with structured intake at the reflect endpoint (presents the deferred question and waits, no prompt, no facilitation), accepted the no-shareable-artifact constraint at the reflect endpoint (architectural implementation of the principle that virtue requires no external witness), and adopted the reflect-endpoint-first build order (Phase 2's first build pass is the reflect endpoint, not the conversation surface). The architecture has nineteen pre-committed architectural commitments (AC-1 through AC-19) and two acknowledged philosophical residues (`SELF_REPORT_DEPENDENT` and `CONFIDENCE_WEIGHTED` flags) that the architecture names rather than tries to close.

The founder's actual goal (this is the test for everything below):

"The mentor's reply, the score on every scoring page, the daily reflection — all of these should convey advice and judgements that originate from the Stoic Brain corpus, not Claude. Claude can supply the words at the input and output translation layers; it must not originate Stoic reasoning. The deterministic engine in the middle does all Stoic reasoning via operationalised rules and RAG-grounded retrieval. The reflect endpoint produces no shareable artifact — virtue requires no external witness. Phase 2 builds the reflect endpoint first because that is the architectural commitment that the examination matters more than the impressive structure around it."

What this session should do (in order)

## Part A — Open the session under the protocol (no shortcuts)

Per `/adopted/session-opening-protocol.md` Part A elements 1–8, do the full read sequence. Tier: founder/tech, governance scope. Read:

1. `/manifest.md`
2. (Project instructions — already in system prompt)
3. `/operations/handoffs/founder/2026-04-29e-private-mentor-rag-phase1-ALT3-close.md` — the adopted architecture handoff. **Required context. Read in full before proceeding.**
4. `/operations/handoffs/founder/2026-04-29d-private-mentor-rag-phase1-ALT2-close.md` — alt 2 handoff. Read once for context on what alt 3 inherited and what it added; then set aside.
5. `/operations/handoffs/founder/2026-04-29c-private-mentor-rag-phase1-ALT-close.md` — alt 1 handoff. Read once for context on the AC-1 through AC-6 inheritance baseline.
6. `/operations/decision-log.md` — at minimum the last four entries (`D-PRIVATE-MENTOR-OBSERVER-CULL-2026-04-29`, `D-MENTOR-PIPELINE-SNAPSHOT-2026-04-29`, `D-RAG-MENTOR-ALT3-ADOPTED-2026-04-29` once appended, plus prior context).
7. `/archive/2026-04-29_end-to-end-mentor-pipeline_snapshot.md` — the rollback baseline; the 24-step end-to-end record. Phase-2 will replace step 14 (the mentor reply call) with the alt-3 translation-sandwich variant; step 24 (`/api/reason` proximity refresh) is replaced by inline score reading from the conversation response.
8. `/archive/2026-04-29_end-to-end-founder-hub-mentor_parked.md` — the founder-hub-scoped reference. Phase-1 architecture lands ONLY on the private-mentor surface; the founder-hub flow remains as parked.
9. `/operations/knowledge-gaps.md` — scan KG1–7. KG3 (hub-label end-to-end contract) is directly relevant. Note also the four PR5 candidates flagged in the alt-3 handoff: translation-sandwich/neuro-symbolic terminology, withholding-as-kathekon, no-shareable-artifact constraint, build-order condition.
10. `/website/src/lib/sage-reason-engine.ts` — **required for Deliverable 2 (canonical mechanism framework)**. Specifically the `STANDARD_SYSTEM_PROMPT` and `DEEP_SYSTEM_PROMPT` constants and the 5-mechanism set.
11. `/website/src/app/api/mentor/private/reflect/route.ts` — **required for Deliverable 2 and Deliverable 14 (reflect endpoint design)**. Specifically the `REFLECTION_PROMPT` constant and the 4-stage evaluation set; the existing `evening_prompt` mechanism that alt-3 reframes.
12. `/website/src/app/api/score-scenario/route.ts` and `/website/src/app/api/score-social/route.ts` — **required for Deliverable 2**. Compact-variant output shapes.
13. `/stoic-brain/scoring.json` — **required for Deliverable 3 (passion taxonomy) and Deliverable 8 (operationalised scoring rules)**. The canonical scoring rules + 4-stage evaluation sequence.
14. `/stoic-brain/stoic-brain.json`, `/website/src/data/stoic-brain-compiled.ts`, `/website/src/lib/context/stoic-brain-loader.ts` — Stoic Brain corpus sources for Deliverable 4 (corpus inventory).
15. `/website/src/data/mentor-knowledge-base.ts`, `/website/src/lib/context/mentor-knowledge-base-loader.ts` — mentor knowledge base.
16. `/website/src/app/private-mentor/page.tsx` — page-side wiring including the proximity ring widget. **Required for Deliverable 14 (reflect endpoint design) — specifically the morning/evening ritual flow that the alt-3 reflect endpoint replaces.**
17. `/website/src/app/api/founder/hub/route.ts` — at minimum lines around step 14 (the Anthropic call at `claude-sonnet-4-6`) and the surrounding context loading. **Do not edit this file in this session. Read only.**
18. `/website/src/app/api/reason/route.ts` — **required for Deliverable 14**. Identify all callers of this endpoint before designing the conversation/reflect coupling.

Confirm: tier, hold-point status (still active), model selection (no code expected; flag if changes), status-vocabulary readiness, signals/risk-classification readiness.

## Part B — Verify state

Quick check with the founder:

```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
git status -s
```

Expected: empty (no modifications). If anything appears, ask the founder before proceeding.

Verify the cull is live by asking the founder to confirm the verification described in the handoffs. If the cull is not yet pushed or not yet verified, pause Phase 1 and finish that first.

## Part C — Run alt-3 Phase 1

Twenty-three draft deliverables in `/drafts/rag-mentor-alt3/` (and one ADR in `/drafts/`). Phase 1 is substantial; recommend hybrid sequencing across multiple sessions:

- **Session 1 (this session if appetite, otherwise critical-path only):** Deliverables 2 (canonical framework), 3 (passion taxonomy), 8 (operationalised scoring rules — package the 10 rules from the architecture exercise). These three are **critical path** — must be approved before downstream deliverables proceed. Founder reviews and approves at end of this batch.

- **Session 2 (next session):** Deliverables 4 (corpus inventory), 9 (rule dependency map and engine sequencing logic), 10 (Layer 1 translation specification), 11 (Layer 3 translation specification), 13 (three-tier intake clarification specification), 14 (reflect endpoint design — including no-shareable-artifact constraint), 15 (long-deferred questions handling).

- **Session 3:** Deliverables 1 (ADR — written last, after the design is settled), 5 (index schema), 6 (retrieval interface), 7 (re-rank design), 12 (strict inclusion + exclusion design), 16 (score-in-reply design), 17 (progression delta design), 18 (verification design), 19 (residual seams handling), 20 (cost model), 21 (migration plan with reflect-endpoint-first build order), 22 (test plan), 23 (open-questions register).

Founder calls the actual sequencing at session-1 open. The above is a recommended order based on dependency and importance, not a binding plan.

For each deliverable, follow the format established in the alt-2 prompt (which alt 3 inherits):

- Plain language explanations; technical terms defined first time they appear.
- Worked examples drawn from the Stoic Brain corpus and the founder's actual practitioner profile patterns.
- Explicit interpretive moves named where they exist.
- Cleanliness rating per applicable component (HIGH / PARTIAL / INTERPRETIVE).
- Cross-reference to architectural commitments (AC-1 through AC-19) where relevant.

Specific guidance for the most consequential deliverables:

**Deliverable 8 — Operationalised scoring rules.** Package the 10 rules from the architecture exercise into a versioned rule book artefact at `/drafts/rag-mentor-alt3/operationalised-rules.md`. The full operationalisations are preserved in the conversation transcript that produced the alt-3 handoff. Each rule needs: Rule ID, Source, Inputs, Logic, Outputs, Examples (positive / negative / edge), Interpretive moves, Cleanliness rating. Also include the six-dependency map and engine sequencing logic (which is Deliverable 9 separately, but the rule book references it).

**Deliverable 13 — Three-tier intake clarification specification.** Specify the trigger logic, question text, and conversation flow for each tier. Tier 1 (force) trigger conditions and question text are well-developed in the architecture exercise; package them. Tier 2 (soft) likewise. Tier 3 (deterministic OPEN_DEFERRAL) requires explicit specification of the trigger conditions for each non-deterministic component (Component A STATED_OPERATIVE_CONFLICT residue, Component B praxis-level motivation, Component C eupatheia boundary), the OPEN_DEFERRAL data structure, and the timestamping logic.

**Deliverable 14 — Reflect endpoint design.** This is the load-bearing deliverable for Phase 2's first build pass. Specify: structured intake form shape, deferred-question presentation logic ("You left a question open from [date]: [question text]. There's no prompt — just what you found."), reflection content processing pipeline (same Tier 1/2/3 logic as conversation surface), retrospective score update mechanism, OPEN_DEFERRAL closing logic, and **the no-shareable-artifact constraint as architectural specification, not just a preference**. Document specifically what the reflect endpoint does NOT produce: no reflection score, no progress summary, no developmental visualisation, no shareable output of any kind. Document what it DOES produce: the internal classification update (visible in the scoring record but not as a celebratory artefact) and the closed OPEN_DEFERRAL flag.

**Deliverable 15 — Long-deferred questions handling.** Encode the three principles as engine behaviour: engine doesn't nag (specify what "nag" means operationally — no surfacing of deferred questions on the conversation surface across new instances), OPEN_DEFERRAL flags visible in scoring record (specify the data structure and timestamps), mentor names the pattern at next natural opportunity (specify the trigger condition and the observation language; example from architecture exercise: *"You've had a question open since [date] about [topic]. I'm not asking you to answer it now — but I want you to know it's still open."*).

**Deliverable 21 — Migration plan.** Specify the reflect-endpoint-first build order (AC-19) explicitly. Phase 2 build pass 1: reflect endpoint, behind env flag (`MENTOR_RAG_V1=true`), private-mentor surface only. Phase 2 build pass 2: conversation surface, against a working reflect endpoint that already handles deferrals correctly. Specify rollback path for each pass. PR1 single-endpoint proof discipline applies.

After all 23 deliverables (or whatever batch this session covers) are produced, present them to the founder for review. The founder can review per-document or in bulk; the critical-path deliverables (2, 3, 8) must be approved before downstream deliverables proceed. Approval gates the move from draft to adopted and the start of Phase 2.

## Part D — Decision-log entry

Append the following to `/operations/decision-log.md`:

`D-RAG-MENTOR-ALT3-PHASE1-DRAFTS-YYYY-MM-DD` — *(or whichever date this session occurs)*. Status: Drafted — under founder review. Cross-references: D-MENTOR-PIPELINE-SNAPSHOT-2026-04-29, D-PRIVATE-MENTOR-OBSERVER-CULL-2026-04-29, D-RAG-MENTOR-ALT3-ADOPTED-2026-04-29 (the architecture adoption from the previous session, which this Phase-1 implements), `/operations/handoffs/founder/2026-04-29e-private-mentor-rag-phase1-ALT3-close.md` (the architectural brief), `/adopted/session-opening-protocol.md` (governing frame).

If `D-RAG-MENTOR-ALT3-ADOPTED-2026-04-29` has not yet been appended to the decision log (the prior session may have closed without that explicit entry), append it now as the first action in Part D, citing the alt-3 handoff as the artefact. The entry should record: the architecture choice (alt 3 over baseline / alt 1 / alt 2), the nineteen architectural commitments AC-1 through AC-19, the two residual seams as acknowledged philosophical residues, the build-order condition (reflect endpoint first), the rules served (R0 oikeiosis audit trail; 0a status vocabulary; 0d-ii classification; 0f decision log), the risk classification (Standard for the adoption itself; Elevated for downstream ADR adoption; Critical for Phase-2 builds), and the impact (Phase 1 design proceeds; Phase 2 build deferred until Phase 1 deliverables approved; reflect endpoint built first).

## Part E — Session close

Produce a session close at `/operations/handoffs/founder/YYYY-MM-DD-rag-phase1-alt3-drafts-close.md` per protocol Part C. Include the standard 0b minimum (Decisions Made / Status Changes / Next Session Should / Blocked On / Open Questions) plus the extensions for governance work (Verification Method Used / Risk Classification Record / PR5 / Founder Verification). If this session does not complete all 23 deliverables, the close specifies which were completed, which remain, and what the next session should pick up first.

Write the next-session prompt at `/operations/handoffs/founder/YYYY-MM-DD-rag-phase1-alt3-NEXT-SESSION-PROMPT.md` if Phase 1 continues across multiple sessions. When all 23 deliverables are complete and approved, write the prompt for Phase 2 pass 1 (reflect endpoint build): `/operations/handoffs/founder/YYYY-MM-DD-rag-phase2-pass1-reflect-endpoint-NEXT-SESSION-PROMPT.md`.

## Important context

- Founder is a non-coder. Plain-language explanations of every design decision. Define every technical term the first time it appears in a deliverable: BM25, vector embedding, RRF (Reciprocal Rank Fusion), cross-encoder, top-K, sparse vs dense retrieval, Graph RAG, canonical framework, slot-filling, kathekon, katorthoma, hegemonikon, prohairesis, kathekon, eupatheia (chara, boulesis, eulabeia), oikeiosis, neuro-symbolic, deterministic vs interpretive, OPEN_DEFERRAL, kairos. Show concrete worked examples in every deliverable that defines a mechanism — at least three examples drawn from the Stoic Brain corpus and the founder's actual practitioner profile patterns where applicable.
- Founder decides direction; AI surfaces options with reasoning. The deliverables present each open decision (the D-* in the architecture exercise) as a recommendation with reasoning. Founder can override any recommendation. AC-1 through AC-19 are pre-committed and not re-debated.
- Phase 1 is design only. **No edits to `/website/src/`, no edits to `/api/`, no edits to the database, no edits to any adopted document.** All design lives under `/drafts/rag-mentor-alt3/`. A draft ADR is still a draft until the founder approves and it moves to `/adopted/`.
- Honest disclosure throughout. The alt-3 architecture does not claim to eliminate non-determinism — it claims to encode the appropriate response to non-determinism (force clarification where the practitioner can answer; deterministically withhold where they cannot) such that all engine outputs are themselves the result of deterministic rules. The two residual seams (SELF_REPORT_DEPENDENT, CONFIDENCE_WEIGHTED) are acknowledged philosophical residues, not engineering gaps. State these in the ADR, the strict-prompting-design doc, the verification-design doc, and the cost-model doc.
- **No-shareable-artifact constraint is non-negotiable.** Deliverable 14's specification of the reflect endpoint must include the explicit prohibition on producing any shareable output. This is not a design preference; it is the architectural implementation of a philosophical commitment. Any proposed feature that would produce a shareable artefact at the reflect endpoint is rejected at design stage.
- **Reflect-endpoint-first build order is non-negotiable.** Deliverable 21's migration plan must specify Phase 2 pass 1 as the reflect endpoint, not the conversation surface. Any proposed sequencing that builds the conversation surface first is rejected at design stage. The order is the architectural commitment that the examination matters more than the scoring engine.
- **Critical path: deliverables 2, 3, 8.** The canonical mechanism framework, the passion taxonomy, and the operationalised scoring rules are the foundation. All three must be approved before downstream deliverables proceed.
- **Worked examples drawn from the architecture exercise.** The architecture exercise produced specific examples of practitioner-grounded operationalisations (philodoxia patterns, orge with children, six consecutive procedural reports, bus story, agonia in catastrophising). Use these as the source of worked examples in deliverables 8, 9, 13, 14. They are already validated against the corpus; reusing them maintains consistency and reduces invention.
- Risk classification: every Phase-1 alt-3 deliverable is Standard under 0d-ii (drafts in `/drafts/`, no live-system effect). The eventual ADR adoption (in a future session) is Elevated. The eventual canonical mechanism framework adoption is Elevated. The eventual operationalised rules adoption is Elevated (governing rule book). Phase-2 pass 1 (reflect endpoint build) is Critical under PR6 (touches authentication / session management surface). Phase-2 pass 2 (conversation surface build) is Critical under PR6 + R20a.

## Standing reminders

- Single source of truth for the alt-3 design: `/drafts/rag-mentor-alt3/`. Cross-reference, don't duplicate, content between deliverables.
- Decision-log entry per session per PR7 — including for explicitly deferred decisions (Graph RAG outline, corpus expansion, founder-hub flow migration).
- Provide the founder with verification methods (URLs, expected results, copy-paste commands) for any work that touches a live surface. Phase 1 should not touch live surfaces; if any Phase-1 work would, surface it as a scope question and pause.
- **Do not propose changes to the founder-hub flow during Phase 1.** The founder-hub is parked and out of scope.
- **Do not migrate score-family endpoints during Phase 1.** Phase 1 designs the index to support migration; the migration itself is Phase 3+.
- **Do not propose corpus expansion during Phase 1.** Logged as open question.
- **Do not commingle the alt-3 design with prior alternatives' designs.** The prior alternatives are superseded; their handoffs are the reasoning trail. Deliverables under `/drafts/rag-mentor-alt3/` must be self-contained.
- **Do not propose features that produce shareable artefacts at the reflect endpoint.** AC-18 is binding.
- **Do not propose build sequencing that builds the conversation surface before the reflect endpoint.** AC-19 is binding.

End of prompt. Confirm receipt and full Part A read before proceeding to Part B.
