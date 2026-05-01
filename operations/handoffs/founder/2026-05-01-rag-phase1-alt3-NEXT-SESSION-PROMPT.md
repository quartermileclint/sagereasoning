# Next-Session Prompt — Phase 1 Alt-3 Session 2 (Engine Sequencing + Translation Specifications + Three-Tier Intake + Reflect Endpoint Design)

**Stream:** founder. **Tier:** founder/tech, governance scope.
**Governing frame:** `/adopted/session-opening-protocol.md`.
**Predecessor session close:** `/operations/handoffs/founder/2026-05-01-rag-phase1-alt3-drafts-close.md`.
**Architecture brief:** `/operations/handoffs/founder/2026-04-29e-private-mentor-rag-phase1-ALT3-close.md` (Adopted — alt 3 is the foundational architecture).
**Updated 2026-05-01:** D14 split into D14a (daily-reflection ritual endpoint) and D14b (deferral-resolution surface) per Option 1 AC-18 scoping correction. Deliverable 24 (R20a workflow audit) added as a precondition session before this one. Pre-update version archived at `/archive/2026-05-01_phase1-session2-prompt_pre-option-1-update.md`.

This session is design only. No code. The deliverable is a set of design documents the founder reviews and approves before Phase 2 (build) begins.

---

## Pre-conditions for this session opening

This session does not begin until **both** of the following are complete:

1. **Founder approval of the three critical-path deliverables** (D2, D3, D8) produced in the 2026-05-01 drafting session.
2. **Deliverable 24 (R20a Perimeter Workflow Audit) is drafted and reviewed** — produced in a dedicated audit session preceding this one (see `/operations/handoffs/founder/2026-05-02-rag-phase1-alt3-r20a-audit-PROMPT.md`). The audit may surface further AC-13 / AC-17 / AC-18-shaped ambiguities that change the scope of this session's deliverables (especially D14a and D14b).

Approval paths for the critical path:

- **(a)** Approved as drafted → proceed to this session's full scope (after the audit).
- **(b)** Approved with re-derivation redo on Deliverable 8 → audit-session output may be preceded by a transcript-review pass on `/drafts/rag-mentor-alt3/operationalised-rules.md`.
- **(c)** Send back specific deliverables for redesign → those deliverables redraft before this session begins.
- **(d)** Defer → no session.

If either precondition is not met at the open, the agent's first action is to ask which path applies. Do not proceed to design new deliverables on top of unresolved questions.

---

## Part A — Open the session under the protocol

Per `/adopted/session-opening-protocol.md` Part A elements 1–8, do the full read sequence. Tier: founder/tech, governance scope. Read:

1. `/manifest.md`
2. (Project instructions — already in system prompt)
3. **`/operations/handoffs/founder/2026-05-01-rag-phase1-alt3-drafts-close.md`** — the session-1 close (with Option 1 addendum). Required context. Read in full.
4. **`/drafts/rag-mentor-alt3/consumer-workflow-audit.md`** — Deliverable 24 (R20a perimeter workflow audit), produced in the dedicated audit session and reviewed by the founder. Required context for D14a and D14b (and any other deliverable whose surface was audited). If this file does not yet exist, the audit session has not run — pause this session and run the audit first per `/operations/handoffs/founder/2026-05-02-rag-phase1-alt3-r20a-audit-PROMPT.md`.
5. **`/operations/handoffs/founder/2026-04-29e-private-mentor-rag-phase1-ALT3-close.md`** — the alt-3 architecture brief. Required context.
6. **`/drafts/rag-mentor-alt3/canonical-framework.md`** — Deliverable 2 (approved, with Option 1 amendment to Table 4). The 9+1 mechanism taxonomy. All deliverables in this session reference it.
7. **`/drafts/rag-mentor-alt3/passion-taxonomy.md`** — Deliverable 3 (approved). The controlled vocabulary for passion mechanisms. Deliverables 10 and 13 in this session consume it.
8. **`/drafts/rag-mentor-alt3/operationalised-rules.md`** — Deliverable 8 (approved or transcript-revised). The rule book. Deliverable 9 in this session takes the dependency map summary in D8 to full treatment.
9. `/operations/decision-log.md` — at minimum the last five entries (`D-MENTOR-PIPELINE-SNAPSHOT-2026-04-29`, `D-PRIVATE-MENTOR-OBSERVER-CULL-2026-04-29`, `D-RAG-MENTOR-ALT3-ADOPTED-2026-04-29`, `D-RAG-MENTOR-ALT3-PHASE1-DRAFTS-2026-05-01`, plus the audit-session entry and the founder-approval entry if the critical path has been moved to `/adopted/`).
10. `/archive/2026-04-29_end-to-end-mentor-pipeline_snapshot.md` — the rollback baseline. Required context for Deliverable 14b (deferral-resolution surface design).
11. `/operations/knowledge-gaps.md` — scan KG1–KG7. KG3 (hub-label end-to-end contract) is directly relevant to Deliverable 14a/14b. KG1 (Vercel rules) becomes relevant as 14a/14b name the data-plane behaviour even though Phase 1 is design only.
12. `/website/src/app/api/mentor/private/reflect/route.ts` — required for Deliverable 14a/14b. Specifically the `REFLECTION_PROMPT` constant and the existing `evening_prompt` mechanism that AC-15 / AC-18 reframe (deferral-resolution surface only per Option 1). Read only; do not edit.
13. `/website/src/app/private-mentor/page.tsx` — required for Deliverable 14a/14b. Specifically the morning/evening ritual flow (`submitRitual` function, `MorningView`, `EveningView`) — these stay on 14a's preserved-output path. The `fetchProximityScore` step 24 still gets replaced under the conversation-surface design (separate). Read only; do not edit.
14. `/website/src/app/api/founder/hub/route.ts` — read only, around the mentor sonnet call (~line 706) and the cull guard (~line 1497) for Phase-2 build-order context. Required for Deliverable 14a/14b's awareness of the existing code surface but not for design changes this session.
15. `/website/src/data/stoic-brain-compiled.ts` — required for Deliverable 4 (corpus inventory).
16. `/website/src/lib/context/stoic-brain-loader.ts` — required for Deliverable 4 and Deliverable 10 (Layer 1 translation specification).
17. `/stoic-brain/stoic-brain.json` — corpus index. Required for Deliverable 4.

Confirm: tier, hold-point status (still active), model selection (no code expected; flag if changes), status-vocabulary readiness, signals/risk-classification readiness.

---

## Part B — Verify state

Quick check with the founder:

```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
git status -s
```

Expected: empty (no modifications) unless the critical-path deliverables have been moved from `/drafts/` to `/adopted/` since the session-1 close. If files have moved, verify with the founder before proceeding.

---

## Part C — Run alt-3 Phase-1 session 2

Eight deliverables this session, recommended sequencing (D14 split into 14a/14b per Option 1 amendment 2026-05-01):

1. **Deliverable 4 — Corpus inventory** (`/drafts/rag-mentor-alt3/corpus-inventory.md`). Stoic Brain content broken down by source file and tagged against the canonical framework (D2) and passion taxonomy (D3). Tag every passage by `passage_type` (mechanism / canonical_line / example / focus_question_stem / scoring_rule), `passion`, `sub_passion`, `canonical_mechanism`. Identify coverage gaps for D-A16 (focus-question stems — frequent in `mentor-knowledge-base.ts` and the existing reflect endpoint's LLM behaviour, but not formalised) and corpus expansion (D-A10 — out of scope; just identify gaps).

2. **Deliverable 9 — Rule dependency map and engine sequencing logic** (`/drafts/rag-mentor-alt3/rule-dependency-map.md`). Take the six-dependency map summary in D8 to full treatment. For each dependency: dependency type (forward / circular / bidirectional / conditional back-edge / aggregation), participating rules, the data-flow direction, the resolution pattern (two-pass, sequencing, conditional loop). Specify the engine sequencing logic in full: 1 → 2 → 3 → 4 → 5 (placeholder) → 6 → 7 (provisional) → 8 → 9 → 5 (enrich) → 7 (confirm) → 10. Specify the conditional back-edge from 8 to 2/3 trigger condition (`VALUE_ERROR_WITHOUT_PASSION` flag) and the loop-detection guard (max one re-run per request).

3. **Deliverable 10 — Layer 1 translation specification** (`/drafts/rag-mentor-alt3/layer-1-translation.md`). Claude's input translation: free-text practitioner narrative → canonical Stoic feature representation. Specify: input (raw narrative); output schema (entities[] with type tags, candidate temporal/evaluative axes, candidate scope-stake markers, candidate target identifiers — everything the deterministic engine consumes); the controlled vocabulary (passion taxonomy from D3 plus indifferents from value.json); the prompt template; the error/uncertainty handling (when Claude cannot translate cleanly, what does it return? Tier 1 ELEMENT_FUSION clarification request? Empty schema with reason?). Include worked examples drawn from the named anchor patterns. R7 / R8a / R8d compliance.

4. **Deliverable 11 — Layer 3 translation specification** (`/drafts/rag-mentor-alt3/layer-3-translation.md`). Claude's output translation: canonical engine output → conversational prose. Specify: input (the 9+1 mechanism outputs from the deterministic engine); the prose paraphrase rules (no Stoic inference originating from Claude — Layer 3 is literally translation, not synthesis); the slot-fill mechanics for focus questions (corpus stem with situational variables filled by Claude; everything else locked); the prompt template; the error handling (when an upstream mechanism is empty or null). Note specifically: Layer 3 prohibits second-person passion attribution per R20d (e.g., the prose may say "philodoxia is operating" not "your partner is in philodoxia"). Include worked examples drawn from the named anchor patterns.

5. **Deliverable 13 — Three-tier intake clarification specification** (`/drafts/rag-mentor-alt3/three-tier-intake.md`). Specify the trigger logic, question text, and conversation flow for each tier:
   - **Tier 1 (force):** Component A structural triggers — ELEMENT_FUSION, SCOPE_AMBIGUITY, TEMPORAL_AMBIGUITY. The engine cannot extract structured features; clarification is forced before the engine proceeds. Question text is well-developed in the alt-3 handoff (samples at lines 122–124, 127, 131–133).
   - **Tier 2 (soft):** STATED_OPERATIVE_CONFLICT, STATED_EQUANIMITY_UNVERIFIED. The engine offers a question; practitioner may answer or decline; non-answer doesn't block scoring. Sample question text in the alt-3 handoff at lines 130–133.
   - **Tier 3 (deterministic OPEN_DEFERRAL):** eupatheia boundary (Component C), praxis-level motivation (Component B). The engine deterministically chooses to withhold (AC-14 — withholding as kathekon) and surfaces as OPEN_DEFERRAL with timestamp and the specific deferred question. Specify: (a) trigger conditions for each non-deterministic component, (b) the OPEN_DEFERRAL data structure (timestamps, deferred question text, instance reference, scoring-record visibility), (c) timestamping logic.

6. **Deliverable 14a — Daily-reflection ritual endpoint design** (`/drafts/rag-mentor-alt3/reflect-endpoint-14a-daily-ritual.md`). The morning check-in + evening reflection rituals on the private-mentor page (or its own dedicated page — UX decision in this deliverable). Specify in full:
   - Surface design — own page vs embedded view (founder direction in 2026-05-01 session: "I think this may need its own page and a re-written workflow"). Recommendation comes from the audit findings in Deliverable 24.
   - Practitioner-visible output preserved: `katorthoma_proximity`, `passions_detected[]`, `what_you_did_well`, `sage_perspective`, `evening_prompt`. Plus `structured_observation` — founder direction at design review whether this becomes visible (was previously logged to backend pipeline only).
   - Layer 3 ritual projection: how the canonical engine output is presented as a "completed reflection" to the practitioner.
   - Morning check-in symmetry — same submitRitual function, same endpoint, no `how_i_responded` field. Specify whether morning preserves the same visible-output shape as evening.
   - Persistence to `reflections` table (preserved from current behaviour).
   - `mentor_observations_structured` write (preserved; potentially also surfaced).
   - `updateProfileFromReflection` self-improving loop (preserved).
   - Pattern engine pass + persistence (preserved per ADR-PE-01).
   - Founder-performable verification specification.

7. **Deliverable 14b — Deferral-resolution surface design** (`/drafts/rag-mentor-alt3/reflect-endpoint-14b-deferral-resolution.md`). The new alt-3 surface for resolving `OPEN_DEFERRAL` flags from prior instances per AC-15 sub-option 1b. **The load-bearing deliverable for Phase-2 pass 1.** Specify in full:
   - Surface design — own route vs same-route-different-mode (the existing `/api/mentor/private/reflect` may serve both 14a and 14b; or 14b may live on its own route. Decision in this deliverable, informed by D24 audit findings).
   - Structured intake form shape (what the practitioner sees: deferred-question presentation, the reflection input fields).
   - Deferred-question presentation logic. Sample text from the alt-3 handoff: "You left a question open from [date]: [question text]. There's no prompt — just what you found."
   - Reflection content processing pipeline (same Tier 1/2/3 logic as the conversation surface).
   - Retrospective score update mechanism (the original instance score is updated; OPEN_DEFERRAL flag is closed).
   - **AC-18 — no-shareable-artifact constraint as architectural specification (Option 1 scoping).** Document specifically what this surface **does NOT produce**: no reflection score, no progress summary, no developmental visualisation, no shareable output of any kind. Document what it **DOES produce**: the internal classification update (visible in the scoring record but not as a celebratory artefact) and the closed OPEN_DEFERRAL flag (likewise visible but not celebrated).
   - Founder-performable verification specification (per 0c framework).
   - Phase-2 pass 1 readiness specification: what is needed for AC-19 build (env flag `MENTOR_RAG_V1=true`, rollback path, PR1 single-endpoint proof discipline, AC4 invocation testing for distress detection — already on the perimeter per AC5).

   This deliverable specifies the architectural implementation of AC-18 + AC-19 on the deferral-resolution surface specifically. AC-18 is non-negotiable on this surface per Option 1 scoping. AC-19 is non-negotiable for the build order — Phase 2 pass 1 builds 14b's surface first, before the conversation surface.

7. **Deliverable 15 — Long-deferred questions handling** (`/drafts/rag-mentor-alt3/long-deferred-questions.md`). Encode the three principles as engine behaviour:
   - **Engine doesn't nag.** Specify operationally what "nag" means: no surfacing of deferred questions on the conversation surface across new instances. Deferred questions appear *only* at the reflect endpoint, *only* when the practitioner opens it.
   - **OPEN_DEFERRAL flags visible in the scoring record.** Specify the data structure (instance reference, timestamp, deferred question text, status). Specify the surface presentation in the scoring record (visible but not celebratory).
   - **Mentor names the pattern at next natural opportunity.** Specify the trigger condition (a new instance from a domain where a deferred question is still open) and the observation language. Sample from the alt-3 handoff: "You've had a question open since [date] about [topic]. I'm not asking you to answer it now — but I want you to know it's still open."

For each deliverable, follow the format established in the session-1 deliverables:

- Plain-language explanations; technical terms defined first time they appear.
- Worked examples drawn from the corpus and the founder's actual practitioner-profile patterns (philodoxia patterns, orge with children, six consecutive procedural reports, bus story, agonia in catastrophising).
- Explicit interpretive moves named where they exist.
- Cleanliness rating per applicable component (HIGH / PARTIAL / INTERPRETIVE).
- Cross-reference to architectural commitments (AC-1 through AC-19) where relevant.

---

## Part D — Decision-log entry

Append to `/operations/decision-log.md`:

`D-RAG-MENTOR-ALT3-PHASE1-SESSION2-DRAFTS-YYYY-MM-DD` — Status: Drafted — under founder review. Cross-references: D-RAG-MENTOR-ALT3-PHASE1-DRAFTS-2026-05-01 (the critical-path drafts), D-RAG-MENTOR-ALT3-ADOPTED-2026-04-29 (the architecture), the seven new deliverable files, this next-session prompt, the session-2 close.

---

## Part E — Session close

Produce a session close at `/operations/handoffs/founder/YYYY-MM-DD-rag-phase1-alt3-session2-close.md` per protocol Part C. Include the standard 0b minimum (Decisions Made / Status Changes / Next Session Should / Blocked On / Open Questions) plus the extensions (Verification Method Used / Risk Classification Record / PR5 / Founder Verification).

Write the next-session prompt at `/operations/handoffs/founder/YYYY-MM-DD-rag-phase1-alt3-session3-NEXT-SESSION-PROMPT.md` for Phase-1 session 3 — covers Deliverables 1 (ADR — written last after the design is settled), 5 (index schema), 6 (retrieval interface), 7 (re-rank design), 12 (strict inclusion + exclusion design), 16 (score-in-reply design), 17 (progression delta design), 18 (verification design), 19 (residual seams handling), 20 (cost model), 21 (migration plan with reflect-endpoint-first build order — AC-19), 22 (test plan), 23 (open-questions register).

---

## Important context

- **Founder is a non-coder.** Plain-language explanations of every design decision. Define every technical term the first time it appears: BM25, vector embedding, RRF, cross-encoder, top-K, sparse vs dense retrieval, Graph RAG, slot-filling, kathekon, katorthoma, hegemonikon, prohairesis, eupatheia (chara, boulesis, eulabeia), oikeiosis, neuro-symbolic, deterministic vs interpretive, OPEN_DEFERRAL, kairos, retrospective score update, env flag, rollback path. Show concrete worked examples in every deliverable that defines a mechanism — at least three examples drawn from the named anchor patterns.

- **Founder decides direction.** AI surfaces options with reasoning. AC-1 through AC-19 are pre-committed and not re-debated.

- **Phase 1 is design only.** No edits to `/website/src/`, no edits to `/api/`, no edits to the database, no edits to any adopted document. All design lives under `/drafts/rag-mentor-alt3/`. A draft ADR is still a draft until the founder approves and it moves to `/adopted/`.

- **Honest disclosure throughout.** Where a deliverable depends on the architecture-exercise transcript that may not be in front of the agent, name the dependency explicitly (re-derivation status, etc.).

- **No-shareable-artifact constraint is non-negotiable (AC-18).** Deliverable 14's specification of the reflect endpoint must include the explicit prohibition on producing any shareable output. This is not a design preference; it is the architectural implementation of a philosophical commitment. Any proposed feature that would produce a shareable artefact at the reflect endpoint is rejected at design stage.

- **Reflect-endpoint-first build order is non-negotiable (AC-19).** Even though the migration plan (Deliverable 21) is in session 3, the reflect endpoint design (Deliverable 14) is in this session. The order is the architectural commitment that the examination matters more than the scoring engine.

- **Critical path approval is the precondition.** This session does not begin until the session-1 critical path (Deliverables 2, 3, 8) is approved by the founder. If the critical path is sent back, the agent's first action is the redesign of the named deliverable(s).

- **Worked examples drawn from architecture-exercise patterns.** Reuse the named anchors (philodoxia patterns, orge with children, six consecutive procedural reports, bus story, agonia in catastrophising) for consistency. Do not invent new example patterns unless a deliverable specifically requires a pattern not in the catalogue.

- **Risk classification:** every Phase-1 session-2 deliverable is Standard under 0d-ii (drafts in `/drafts/`, no live-system effect). The eventual ADR adoption (session 3) is Elevated. Phase-2 pass 1 (reflect endpoint build) is Critical under PR6.

---

## Standing reminders

- Single source of truth for the alt-3 design: `/drafts/rag-mentor-alt3/`. Cross-reference, don't duplicate, content between deliverables.
- Decision-log entry per session per PR7 — including for explicitly deferred decisions.
- Provide the founder with verification methods (URLs, expected results, copy-paste commands) for any work that touches a live surface. Phase 1 should not touch live surfaces; if any Phase-1 work would, surface it as a scope question and pause.
- Do not propose changes to the founder-hub flow during Phase 1. Founder-hub is parked and out of scope.
- Do not migrate score-family endpoints during Phase 1. Phase 1 designs the index to support migration; the migration itself is Phase 3+.
- Do not propose corpus expansion during Phase 1. Logged as open question.
- Do not commingle the alt-3 design with prior alternatives. Their handoffs are the reasoning trail; deliverables under `/drafts/rag-mentor-alt3/` must be self-contained.
- Do not propose features that produce shareable artefacts at the reflect endpoint. AC-18 is binding.
- Do not propose build sequencing that builds the conversation surface before the reflect endpoint. AC-19 is binding.

---

End of prompt. Confirm receipt and full Part A read before proceeding to Part B.
