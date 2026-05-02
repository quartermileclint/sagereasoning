# Next-Session Prompt — D-A16 Focus-Question-Stem Catalogue Assembly (Phase-2 Pass-1 Precondition)

**Stream:** founder. **Tier:** founder/governance scope.
**Governing frame:** `/adopted/session-opening-protocol.md`.
**Predecessor session close:** `/operations/handoffs/founder/2026-05-02-rag-phase1-completion-review-close.md`.
**Architecture brief:** `/operations/handoffs/founder/2026-04-29e-private-mentor-rag-phase1-ALT3-close.md` (Adopted — alt-3 architecture; Validation Addendum on it).
**Phase-1 design status at session open:** 25 of 25 deliverables Adopted in `/adopted/rag-mentor-alt3/` (24 files) and `/adopted/` (1 ADR). Phase 2 build commences after the named preconditions land — D-A16 catalogue, P2 task 2c encryption wiring, founder approval of pass-1 Critical Change Protocol responses.

This session is **design only**. No code. No live-system effect. The deliverable is a new draft document — the focus-question-stem catalogue — produced under `/drafts/rag-mentor-alt3/d-a16-catalogue.md`. The catalogue's stems are reviewed by the founder; insertion into the `corpus_passages` table (per D5 § index schema) happens at Phase-2 pass-1 build time, not in this session.

---

## Why this session matters

Phase-2 pass 1 (D14b deferral-resolution surface — load-bearing per AC-19) cannot reach operational completeness without focus-question stems for at minimum the two Tier 3 trigger codes (`EUPATHEIA_BOUNDARY` and `PRAXIS_MOTIVATION_AMBIGUITY`). Those stems are what the deterministic engine slot-fills at scoring time to produce the deferred question text shown to the practitioner.

Today there are existing question patterns scattered across `mentor-knowledge-base.ts` and the `REFLECTION_PROMPT` constant in `/website/src/app/api/mentor/private/reflect/route.ts`. They were composed at hand-coding time and live as inline strings or Claude prompts. The alt-3 architecture (per D5, D10, D11, D13) decomposes them into structured stems with typed `[VARIABLE]` placeholders and `slot_fields[]` metadata, so the engine can fill them deterministically without Claude's training-data composition.

This session is the **catalogue assembly + founder review** stage. The catalogue is a documentation artefact at this stage; it materialises into `corpus_passages` rows at Phase-2 build.

---

## Pre-conditions for this session opening

This session does not begin until the following are settled:

1. **Founder push of 2026-05-02 completion-review commits via GitHub Desktop per D-PR8-PUSH-2026-04-26.** The 22-file move-to-`/adopted/`, the decision-log entry (`D-RAG-MENTOR-ALT3-PHASE1-COMPLETION-REVIEW-APPROVED-2026-05-02`), the session close, and the previous session's input prompt must be committed and pushed before this session begins. Verbatim git commands appear in the predecessor session close §"Founder Verification" Step 5.

2. **Founder readiness for Standard-risk design work.** No Critical / Elevated changes this session; no live-system surface touched.

If pre-conditions are not met at session open, the agent's first action is to confirm with the founder which path applies. Do not proceed to source extraction on top of unpushed prior work.

---

## Part A — Open the session under the protocol

Per `/adopted/session-opening-protocol.md` Part A elements 1–8, do the full read sequence. Tier: founder/governance scope. Read:

1. `/manifest.md` — particularly R0, R5, R6a–R6e, R7, R8a–R8d (audience-tier glossary; the catalogue's stems must comply with R8d for skill-contract surfaces and R8c for user-facing surfaces), R17, R20a, R20d, AC1, KG2, KG6.
2. (Project instructions — already in system prompt.)
3. **`/operations/handoffs/founder/2026-05-02-rag-phase1-completion-review-close.md`** — the predecessor session close. Required context.
4. **`/operations/handoffs/founder/2026-04-29e-private-mentor-rag-phase1-ALT3-close.md`** — the alt-3 architecture brief with Validation Addendum. Required context (architectural commitments AC-1 through AC-19; the architecture-exercise transcript that produced the named anchor patterns; the alt-3 transitional question patterns at lines 122–124, 127, 130–133 of the handoff).
5. **`/operations/decision-log.md`** — at minimum the last 6 entries (D-RAG-MENTOR-ALT3-VALIDATED, D-RAG-MENTOR-ALT3-CRITICAL-PATH-MOVED-TO-ADOPTED, D-RAG-MENTOR-ALT3-PHASE1-SESSION3-DRAFTS, D-RAG-MENTOR-ALT3-PHASE1-COMPLETION-REVIEW-APPROVED, D-MENTOR-PRIVATE-REFLECT-PRE-ALT3-SNAPSHOT, D-RAG-MENTOR-ALT3-PHASE1-SESSION2-DRAFTS).
6. **The five most relevant Adopted alt-3 deliverables** (read in the order listed for fastest comprehension):
   - **`/adopted/rag-mentor-alt3/index-schema.md` (D5)** — particularly §"`corpus_passages` table — schema" (the row shape the catalogue lands in) and §"Step 2 — D-A16 catalogue promotion" (the assembly procedure this session executes). **In full.**
   - **`/adopted/rag-mentor-alt3/three-tier-intake.md` (D13)** — particularly the trigger code catalogue (Tier 1 / Tier 2 / Tier 3 codes including the alt-3 canonical set ELEMENT_FUSION, SCOPE_AMBIGUITY, TEMPORAL_AMBIGUITY, STATED_OPERATIVE_CONFLICT, STATED_EQUANIMITY_UNVERIFIED, EUPATHEIA_BOUNDARY, PRAXIS_MOTIVATION_AMBIGUITY plus the D24-identified surface-specific codes: OPTION_SCOPE_INCONSISTENCY, OPTION_FALSE_ALTERNATIVE, STATED_PROCESS_INCONSISTENCY, DOCUMENT_OBJECT_AMBIGUITY, DOCUMENT_PURPOSE_AMBIGUITY, POLICY_INSTITUTIONAL_DISTANCE, RESPONSE_AMBIGUITY, RESPONSE_SCENARIO_DRIFT, POST_ELEMENT_FUSION, POST_PURPOSE_AMBIGUITY, REFLECTION_NARRATIVE_THIN, RESPONSE_FIELD_INCONSISTENCY). **At minimum the trigger code section in full.**
   - **`/adopted/rag-mentor-alt3/layer-3-translation.md` (D11)** — particularly §"Slot-fill mechanics" (how stems are filled at engine time) and the Refinements (D11 Refinement 1 invitation-language; D11 Refinement 5 Validation Addendum prose). **At minimum the slot-fill mechanics section in full.**
   - **`/adopted/rag-mentor-alt3/reflect-endpoint-14a-daily-ritual.md` (D14a — Adopted with founder direction)** — particularly the visible-output specification (the `evening_prompt` field's slot-fill expectation) and the Layer 3 ritual projection prompt template. The catalogue's "ritual surface" stems (the morning/evening prompts) are scoped here. **At minimum the visible output section + the prompt template in full.**
   - **`/adopted/rag-mentor-alt3/reflect-endpoint-14b-deferral-resolution.md` (D14b — Adopted with founder direction)** — particularly the deferred-question text composition in §"Server-side workflow" Step 6 (Layer 1 receives the deferred question as auxiliary context). The catalogue's Tier 3 stems (EUPATHEIA_BOUNDARY, PRAXIS_MOTIVATION_AMBIGUITY) are scoped here. **At minimum the deferred-question composition section.**
7. **`/adopted/rag-mentor-alt3/operationalised-rules.md` (D8)** — at minimum the Validation Addendum (Adjustment 1 — Rule 9 unstable vs false phronesis; Adjustment 2 — Rule 8 compound severity; Adjustment 3 — Rule 7 operative-circle dependency) because some catalogue stems will reference these distinctions. The Validation Addendum is also a Stream-8 promotion candidate per PR8 — flag if a separate alt-3 architectural-conventions catalogue is being assembled in parallel.
8. **The two source files this session decomposes:**
   - **`/website/src/lib/sage-mentor/mentor-knowledge-base.ts`** — the existing question-pattern catalogue used by the live mentor. **In full** (it's the source-of-truth for current stems).
   - **`/website/src/app/api/mentor/private/reflect/route.ts`** — particularly the `REFLECTION_PROMPT` constant (the evening-reflection prompt template). **At minimum the REFLECTION_PROMPT section** (search for the constant by name).
9. **`/operations/knowledge-gaps.md`** — scan KG1–KG7. KG2 (Sonnet/Haiku boundary) and KG6 (composition order) are most relevant when designing how the engine reads the catalogue at scoring time; KG7 (JSONB array discipline) applies to the `slot_fields[]` field.
10. **`/archive/2026-05-02_api-mentor-private-reflect_pre-alt-3-snapshot.md`** — the snapshot referenced by D21. The REFLECTION_PROMPT text is preserved verbatim there; useful as a stable reference if the live route changes during the session.

Confirm: tier, hold-point status (still active per P0 0h), model selection (no LLM model selection at session level — design only), status-vocabulary readiness, signals/risk-classification readiness.

---

## Part B — Verify state

Quick check with the founder:

```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
git status -s
```

Expected: empty (no modifications) — the prior session's commits are pushed; the working tree is clean.

If the working tree is not clean, surface the modifications to the founder before proceeding.

---

## Part C — Run the catalogue assembly

The session has four work streams. Founder calls the order. Recommended sequencing:

### Stream 1 — Source extraction (read-only — no edits)

The agent extracts existing question patterns from the two source files. Two extraction passes:

**Pass 1 — `mentor-knowledge-base.ts`.**

Read the file in full. Identify every question pattern (every literal string ending in `?`, every focus-question template, every Socratic prompt). Produce an inline catalogue:

| ID | Source location | Raw question text | Trigger condition (heuristic guess) | Notes |
|---|---|---|---|---|

The "Trigger condition (heuristic guess)" field is the agent's best read of which D13 trigger code or which mechanism the question fires under. It is heuristic at this stage; founder confirms or revises in Stream 4.

**Pass 2 — `REFLECTION_PROMPT` from `/website/src/app/api/mentor/private/reflect/route.ts`.**

Extract the prompt template. Identify every question pattern within the template (the `evening_prompt` field's compositional rules; the morning/evening orientation lines; any embedded sample questions).

| ID | Source location | Raw question text | Trigger condition (heuristic guess) | Notes |
|---|---|---|---|---|

**Pass 3 (optional, if time permits) — Architecture-exercise transitional patterns.**

The alt-3 handoff (lines 122–124, 127, 130–133) names sample question text from the architecture exercise. These are *alt-3 derived* — they exist in the handoff, not in any current source file. They populate the catalogue alongside the source-extracted patterns; their provenance citation is the alt-3 handoff, not a Stoic primary source.

Output of Stream 1: an inline-table catalogue with all extracted question patterns and their heuristic trigger codes, ready for Stream 2 decomposition.

### Stream 2 — Decomposition into stems

For each extracted question pattern, decompose into:

- **`stem`** — the question template with placeholders. Variables in `[BRACKETS_UPPERCASE]`. Example: original *"You said you want the project to land well — what does 'well' look like to you, in their eyes?"* → stem *"You said you want [PROJECT/EVENT/INTERACTION] to land well — what does 'well' look like to you, in [WHOSE_EYES]?"*
- **`slot_fields[]`** — the typed JSONB metadata for each variable. Example: `[{"name": "PROJECT/EVENT/INTERACTION", "type": "narrative_object", "required": true}, {"name": "WHOSE_EYES", "type": "person_or_audience", "required": true}]`.
- **`passage_type`** — fixed value `focus_question_stem` for this catalogue.
- **`trigger_condition`** — the canonical D13 trigger code (e.g. `STATED_OPERATIVE_CONFLICT`) or the mechanism that fires the question (e.g. `mechanism_2_passion_detection`). Refines the heuristic guess from Stream 1.
- **`intake_tier`** — `1`, `2`, or `3` per D13.
- **`source_citation`** — provenance: `mentor-knowledge-base.ts:LINE_N`; `REFLECTION_PROMPT (route.ts)`; `alt-3 handoff (alt-3 derived) — line LINE_N`; or `[Stoic primary-source citation]` if the stem traces back to corpus.

Output of Stream 2: structured catalogue entries per question pattern, ready for Stream 3 tagging.

### Stream 3 — Tagging + coverage check

For each decomposed stem, finalise:

- All fields from Stream 2.
- `eupatheia_boundary_relevant` boolean (does this stem fire under EUPATHEIA_BOUNDARY?).
- `praxis_motivation_relevant` boolean (does this stem fire under PRAXIS_MOTIVATION_AMBIGUITY?).
- `validation_addendum_aware` boolean (does this stem reference Adjustment 1 unstable-vs-false phronesis distinction; or Adjustment 2 compound severity; or Adjustment 3 operative-circle?).

**Coverage requirements check.** Confirm minimum coverage:

| Coverage area | Minimum stems required | Status |
|---|---|---|
| `EUPATHEIA_BOUNDARY` (Tier 3) | At least 1 | ⚠️ **Phase-2 pass-1 blocking** |
| `PRAXIS_MOTIVATION_AMBIGUITY` (Tier 3) | At least 1 | ⚠️ **Phase-2 pass-1 blocking** |
| `ELEMENT_FUSION` (Tier 1) | At least 1 | Recommended |
| `SCOPE_AMBIGUITY` (Tier 1) | At least 1 | Recommended |
| `TEMPORAL_AMBIGUITY` (Tier 1) | At least 1 | Recommended |
| `STATED_OPERATIVE_CONFLICT` (Tier 2) | At least 1 | Recommended |
| `STATED_EQUANIMITY_UNVERIFIED` (Tier 2) | At least 1 | Recommended |
| Surface-specific codes (D24) | Per route, at least 1 | Phase-3+ |
| Ritual `evening_prompt` slot-fill | At least 5 (morning + evening; varied tone) | D14a Phase-2 pass-2 |

If a coverage minimum is not met by source-extracted stems, flag it. Either the architecture-exercise transitional patterns fill the gap, or new alt-3-derived stems are composed during this session (with explicit `source_citation: alt-3 derived (this session)`).

### Stream 4 — Founder review

The founder reviews the catalogue's stems before the document moves to next stages:

- **Stem-by-stem review** (or batched per trigger condition / per surface). Founder confirms or revises:
  - Each stem's wording (does it match what a Sage-Mentor would actually ask?)
  - Each stem's trigger condition (does the heuristic mapping match how the engine should fire it?)
  - Each `slot_fields[]` entry (are the variable types correct? Do required-vs-optional match the engine's robustness needs?)
- **Surface-by-surface review** for the ritual surface (D14a — `evening_prompt`) and the deferral-resolution surface (D14b — Tier 3 deferred questions): does the catalogue's coverage match the architectural commitment?
- **Naming check on the alt-3 derived stems.** These are not from primary sources; the founder reviews whether the wording matches the architecture exercise's intent.
- **Validation Addendum awareness.** Any stem that references the unstable-vs-false phronesis distinction (Adjustment 1) or the compound severity (Adjustment 2) or the operative-circle dependency (Adjustment 3) is flagged for cross-consistency with D8's Validation Addendum.

Founder direction surfaced where ambiguity exists. Each direction call updates the relevant catalogue entry before the document writes to `/drafts/rag-mentor-alt3/d-a16-catalogue.md`.

---

## Deliverable — `/drafts/rag-mentor-alt3/d-a16-catalogue.md`

The catalogue lives as a draft markdown document with the standard alt-3 deliverable structure:

- Header (status: Drafted; date; stream; governing frame; implements: D5 § Step 2; cross-references).
- Plain-language summary (what the catalogue is; why it matters).
- Glossary (stem; slot_fields; trigger condition; intake tier; source citation; alt-3 derived).
- Catalogue body — structured per trigger condition (Tier 1 codes → Tier 2 codes → Tier 3 codes → ritual evening_prompt → mentor knowledge base focus questions → surface-specific Phase-3+ codes). Each entry: `id`, `stem`, `slot_fields[]`, `trigger_condition`, `intake_tier`, `passage_type`, `source_citation`, `eupatheia_boundary_relevant`, `praxis_motivation_relevant`, `validation_addendum_aware`, optional notes.
- Coverage check section (named coverage requirements + their current status post-this-session).
- Phase-2 build readiness section (named the minimum stems pass-1 needs; named the deferred stems landing at later passes).
- Honest disclosure section (named the alt-3 derived stems; named any Phase-2-build-time refinements expected).
- Open questions (any ambiguities the founder review surfaced; any stems flagged for revisit).
- Approval gate.

The document is **Drafted — under founder review** at session close. Subsequent move-to-`/adopted/rag-mentor-alt3/` is its own Standard-risk decision (the catalogue is documentation; promotion to corpus_passages is at Phase-2 build, not at /adopted/ promotion).

---

## Part D — Decision-log entry

Append to `/operations/decision-log.md`:

`D-A16-CATALOGUE-ASSEMBLED-YYYY-MM-DD` — Status: Drafted — under founder review. Cross-references: D-RAG-MENTOR-ALT3-PHASE1-COMPLETION-REVIEW-APPROVED-2026-05-02 (the precondition); D-RAG-MENTOR-ALT3-VALIDATED-2026-04-29 (Validation Addendum cross-checks); D5 § Step 2 (the assembly procedure honoured); the new catalogue file.

The entry records: which source files were extracted; the count of stems decomposed (per trigger condition); the count of alt-3-derived stems composed; coverage status (pass-1 minimum met / not met); founder review status (batched or per-stem); deferred decisions (any stems flagged for revisit or for Phase-2 build refinement).

---

## Part E — Session close + next-session preparation

Produce a session close at `/operations/handoffs/founder/YYYY-MM-DD-d-a16-catalogue-assembly-close.md` per protocol Part C. Include the standard 0b minimum (Decisions Made / Status Changes / Next Session Should / Blocked On / Open Questions) plus the extensions (Verification Method Used / Risk Classification Record / PR5 / Founder Verification).

The "Next Session Should" section recommends one of the remaining next-session candidates from the predecessor session close §"Next Session Should":

- **Candidate 2** — Component registry update session (Standard risk; clears stale-reference cleanup).
- **Candidate 3** — D2 amendment session for the 5 D24 coverage gaps (Elevated risk).
- **Candidate 4** — `/api/reason` snapshot session (Standard risk; needed before Phase-2 pass 3).
- **Candidate 5** — Validation Addendum third-recurrence promotion session (Standard risk).
- **Candidate 6** — P2 task 2c encryption wiring session (Critical risk; Phase-2 pass-1 precondition).
- **Candidate 7** — Phase-2 pass 1 commencement (Critical risk; pending Candidates 1, 6 complete).

Founder calls the next session's scope based on observed time budget and priority.

---

## Important context

- **Founder is a non-coder.** Plain-language explanations of every decision. Define every technical term the first time it appears (stem, slot_fields, trigger_condition, intake_tier, passage_type, eupatheia, praxis, kathekon, OPEN_DEFERRAL, alt-3 derived, etc.). The catalogue's body is the agent's structured work; the founder's review is the human work.

- **Founder decides direction.** Where the heuristic mapping is ambiguous (e.g., does this stem fire under STATED_OPERATIVE_CONFLICT or under STATED_EQUANIMITY_UNVERIFIED?), the agent surfaces options with reasoning; the founder calls.

- **Phase 1 is design only.** No edits to `/website/src/`, no edits to any code, no edits to the database, no edits to any adopted document (manifest, project instructions, the 25 Phase-1 Adopted deliverables). The only writes this session are: `/drafts/rag-mentor-alt3/d-a16-catalogue.md` (new), `/operations/decision-log.md` (append), `/operations/handoffs/founder/...-close.md` (new).

- **Honest disclosure throughout.** Where a stem is alt-3 derived (no primary source), name it explicitly. Where a stem's wording is the agent's best paraphrase of a hand-coded question, name it as such. The catalogue's audit trail is the source citation field.

- **Validation Addendum awareness.** The three adjustments (Rule 9 unstable vs false phronesis; Rule 8 compound severity; Rule 7 operative-circle) are cross-consistency requirements, not promotion candidates this session. If a stem references one of the distinctions, flag it; do not promote the Validation Addendum to a separate catalogue this session (Stream 8 of the prior session prompt — separate session).

- **Risk classification:** every Stream 1–4 deliverable is Standard under 0d-ii. No live-system effect. The catalogue's `corpus_passages` insertion is at Phase-2 build time and is its own Critical-risk decision per PR6 (it is part of Phase-2 pass 1's load-bearing build).

- **D-A16 is a Phase-2 pass-1 precondition.** Per D21 § Precondition 2 + D14b § Pre-build prerequisites. The minimum coverage (EUPATHEIA_BOUNDARY + PRAXIS_MOTIVATION_AMBIGUITY) is the gating threshold. This session may produce more — but the minimum is non-negotiable.

---

## Standing reminders

- Single source of truth for the alt-3 design: `/adopted/rag-mentor-alt3/`. Cross-reference, don't duplicate, content between deliverables.
- Decision-log entry per session per PR7 — including for explicitly deferred decisions.
- Provide the founder with verification methods (URLs, expected results, copy-paste commands) for any work that touches a live surface. This session should not touch live surfaces; if any work would, surface it as a scope question and pause.
- Do not propose changes to the founder-hub flow during this session. Founder-hub is parked and out of scope.
- Do not migrate score-family endpoints during this session. Phase 3+ is the migration scope.
- Do not propose corpus expansion (D-A10) during this session. D-A10 is logged as open question per D23 §O1.3.
- Do not propose features that produce shareable artefacts at the deferral-resolution surface. AC-18 is binding.
- Do not commence Phase-2 build during this session. Phase-2 commences as its own Critical-risk session per D21's migration plan.
- Do not promote the Validation Addendum to a separate alt-3 architectural-conventions catalogue this session. Stream 8 — separate session per founder call.

---

## Forecast

After this session lands:

- `/drafts/rag-mentor-alt3/d-a16-catalogue.md` exists as a draft document.
- The catalogue covers at minimum EUPATHEIA_BOUNDARY + PRAXIS_MOTIVATION_AMBIGUITY (Phase-2 pass-1 blocking minimum).
- Recommended additional coverage (Tier 1 / Tier 2 / ritual stems / mentor KB stems) included where time permits.
- Founder has reviewed the stems; any direction calls captured in the catalogue body.
- The catalogue's eventual move to `/adopted/rag-mentor-alt3/` is a separate Standard-risk decision at its own time.
- The catalogue's eventual insertion into the `corpus_passages` table is at Phase-2 build time per D5 § Step 2 (Critical risk under PR6 — part of Phase-2 pass 1's load-bearing build).

Phase-2 pass-1 readiness inventory after this session:

| Precondition | Status |
|---|---|
| All 25 Phase-1 deliverables Adopted | ✅ Complete (post-2026-05-02 completion review) |
| D-A16 catalogue minimum (EUPATHEIA_BOUNDARY + PRAXIS_MOTIVATION_AMBIGUITY stems) | ✅ Complete (this session) |
| `/api/mentor/private/reflect` snapshot | ✅ Complete (D-MENTOR-PRIVATE-REFLECT-PRE-ALT3-SNAPSHOT-2026-05-02) |
| `/api/reason` snapshot | ⚠️ Pending — Candidate 4 (not pass-1 blocking; pass-3 blocking) |
| P2 task 2c encryption wiring | ⚠️ Pending — Candidate 6 (Critical-risk task) |
| Component registry up-to-date | ⚠️ Pending — Candidate 2 (recommended Phase-2 housekeeping) |
| Founder approval of pass-1 Critical Change Protocol responses | ⚠️ Pending — happens at pass-1 commencement session itself |

After Candidate 6 (encryption wiring) lands, Phase-2 pass 1 is unblocked subject only to founder approval of pass-1's Critical Change Protocol responses at the commencement session.

---

End of prompt. Confirm receipt and full Part A read before proceeding to Part B.
