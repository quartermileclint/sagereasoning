# SageReasoning V3 Adoption Scope (Revised)

**Methodology-First Derivation · Adopt V3 · Retire V1 · Build V3 Tools and API**

Date: 31 March 2026

---

## Governing Document

This scope is governed by **manifest.md**. Every task must comply with all 9 rules (R1–R9). Compliance tasks are embedded in each phase and marked with the rules they enforce. See manifest.md for full rule text and the task protocol.

---

## Guiding Principle

This scope follows the same principle used to create the V3 data files: do NOT replicate V1 structures and patch in V3 content. Instead, examine the derivation methodology behind each V1 tool, apply that methodology to the V3 dataset, and let the new tool structure emerge organically. The V3 tool may have a different number of phases, days, questions, or outputs than its V1 counterpart. After derivation, validate that the V3 tool serves an equivalent function and report where it differs with recommendations.

---

## Overview

This scope defines the complete work required to transition SageReasoning from V1 (weighted-composite scoring, 5 data files) to V3 (4-stage evaluation-sequence, 8 data files). It covers 11 phases, 63 tasks, and every file that needs to change.

The scope is organised into three categories:

1. **Infrastructure** (Phases 1–2): Retire V1 files, rebuild the core TypeScript reference library from V3 data.
2. **Tool Derivation** (Phases 3–9): For each tool, apply V1's derivation methodology to V3's 8-file dataset. Let structure emerge. Validate equivalence.
3. **Integration** (Phases 10–11): Update the API specification, run final verification and manifest compliance audit.

---

## Phase 1: Retire V1 and Establish V3 as Production Dataset

**Objective:** Remove all V1 references from the codebase. Promote V3 files to stoic-brain/ root.

| ID | Task | Rules | Files | Acceptance Criteria |
|----|------|-------|-------|-------------------|
| P1.1 | Archive V1 files | — | stoic-brain/*.json, stoic-brain/internal/*.json | V1 files exist only in v1-archive/. No code imports from v1-archive/. |
| P1.2 | Promote V3 files to root | — | stoic-brain/v3/*.json → stoic-brain/*.json | 8 V3 files live at stoic-brain/ root. $ref paths resolve. V3 directory removed. |
| P1.3 | Remove v3-backup-pre-redo directory | — | stoic-brain/v3-backup-pre-redo/ | Directory deleted. |
| P1.4 | Update sources-index.md | — | research/sources-index.md | Pipeline status reflects reality. Phase 3/4/5 marked complete. |
| P1.5 | Verify V2 archive status | — | stoic-brain/v2/ | V2 preserved as historical reference only. |
| **P1.6** | **Source citation audit of all 8 V3 files** | **R7** | All 8 V3 JSON files | Every concept in every V3 file traces to a named primary source. Any concept without a citation is flagged for removal or sourcing before promotion. |

**Dependencies:** None — can start immediately.
**Risk:** Low. File moves only.

---

## Phase 2: Derive stoic-brain.ts (Core Reference Library) from V3 Dataset

**Objective:** Replace V1-based TypeScript reference library with exports derived from V3's 8-file structure. Every website tool imports from this file.

### V1 Derivation Methodology
The V1 stoic-brain.ts was derived by reading V1's 5 data files and creating TypeScript constants and helper functions that exposed V1 concepts to the website: VIRTUES (4 virtues with weights and sub-virtues), ALIGNMENT_TIERS (5 numeric score ranges), getAlignmentTier(score) helper.

### V3 Derivation Approach
Read all 8 V3 data files. For each conceptual domain that the website tools will need, create an export. Do NOT assume the same constants apply — V3 has no weights, no numeric tiers, and has new domains (passions, psychology, oikeiosis, progress metrics) that V1 lacked. Let the export list emerge from what V3 contains.

| ID | Task | Rules | Files | Acceptance Criteria |
|----|------|-------|-------|-------------------|
| P2.1 | Audit all 8 V3 files and list every concept the website tools will need access to | — | Analysis document | Comprehensive list of required exports, each traced to a specific V3 file and field. |
| P2.2 | Create V3 type definitions | R6b, R6c | website/src/lib/stoic-brain.ts | TypeScript types match V3 data structures. No V1 types remain. Types cover: virtue expressions, passions taxonomy, evaluation sequence stages, katorthoma proximity levels, oikeiosis stages, progress dimensions, Senecan grades. No independent virtue weights (R6b). No 0–100 types (R6c). |
| P2.3 | Create V3 constant exports | R6a | website/src/lib/stoic-brain.ts | All V3 domain content accessible via imports. The export list is DERIVED from V3 content, not copied from V1's export list. |
| P2.4 | Create V3 helper functions | — | website/src/lib/stoic-brain.ts | Functions implement V3 evaluation logic: runControlFilter(), assessKathekon(), diagnosePassions() using 5-step diagnostic from passions.json, assessVirtueQuality() using unity thesis, getKatorthomaProximity(). |
| **P2.5** | **Language, IP, and glossary review of all exports** | **R1, R4, R8** | website/src/lib/stoic-brain.ts | All exported type names, function names, and constant names use Glossary v3.0.0 terms (R8). No function or type name implies therapeutic service (R1) — e.g., `diagnosePassions` is acceptable as an internal function name but user-facing labels must say "identify" not "diagnose." Scoring logic is server-side only; client-side exports expose types and constants, not the evaluation engine (R4). |

**Dependencies:** P1 complete.
**Risk:** Medium. Every tool imports from this file — errors cascade everywhere.

---

## Phase 3: Derive Action Score Tool from V3 Dataset

**Objective:** Apply the V1 action scorer's derivation methodology to V3's evaluation model. Let the tool structure emerge from V3's 4-stage sequence rather than replicating V1's weighted-composite UI.

### V1 Derivation Methodology
The V1 action scorer was derived from scoring-rules-full.json (P6 workflow):
1. **Input design:** Collected action_description, context, intended_outcome, actual_outcome — fields determined by what the V1 scoring model needed to evaluate.
2. **Scoring engine:** Applied dichotomy_filter first, then scored each of 4 virtues 0–100 using scoring_criteria arrays (score_high_if / score_low_if), applied weights (wisdom 0.30, justice 0.25, courage 0.25, temperance 0.20), computed weighted total, assigned tier.
3. **Output design:** Returned virtue_scores, total_score, sage_alignment, reasoning, improvement_path, strength, growth_area — fields determined by what the V1 model produced.
4. **Deliberation chain:** Tracked score changes across iterations, each step recording 4 virtue scores + total + delta.

### V3 Derivation Approach
Read V3's scoring.json evaluation_sequence (4 stages), passions.json diagnostic_use, action.json two_layers and oikeiosis_sequence, and virtue.json unity_thesis. Derive the tool by asking: what inputs does the 4-stage sequence need? What does each stage produce? What is the natural output? Do NOT assume the same input fields, the same number of output fields, or the same UI layout as V1.

| ID | Task | Rules | Files | Acceptance Criteria |
|----|------|-------|-------|-------------------|
| P3.1 | Derive input form from V3 evaluation requirements | — | website/src/app/score/page.tsx | Form fields are determined by what the 4-stage evaluation sequence needs as input. May differ from V1 fields. Must include oikeiosis context (required by Stage 2). |
| P3.2 | Derive output display from V3 evaluation outputs | R6b, R6c, R6d | website/src/app/score/page.tsx, components/ | Output renders the natural products of each stage: prohairesis filter result, kathekon assessment (yes/no + quality), passion identification (named passions with sub-species and false judgements), unified virtue assessment (katorthoma proximity + ruling faculty state). No numeric bars unless V3 derivation produces them. Passions presented as diagnostic insight, not penalties (R6d). |
| P3.3 | Derive scoring prompt from V3 evaluation sequence | R4 | API route handler | LLM prompt implements the 4-stage sequence from scoring.json. Response schema matches scoring.json past_action outputs. Prompt references specific V3 file content, not V1 scoring criteria. Prompt text stored server-side only, never exposed in API responses or client bundles (R4). |
| P3.4 | Derive deliberation chain from V3 model | — | website/src/lib/deliberation.ts | Deliberation tracks V3 metrics across iterations: passions detected, false judgements identified, proximity level. Structure emerges from what V3 naturally produces per iteration. Integrates Cicero's 5-question framework from action.json. |
| P3.5 | Derive Supabase schema from V3 outputs | — | Supabase migration files | Schema stores what the V3 evaluation sequence produces. Fields determined by V3 output structure, not by modifying V1 columns. |
| P3.6 | Validate functional equivalence with V1 | — | Validation report | V3 action scorer can evaluate any action V1 could. Report where output differs and why. Recommendations on whether differences are improvements. |
| **P3.7** | **Manifest compliance review of action score tool** | **R1, R3, R9** | Action score UI and output | All user-facing output includes R3 disclaimer. No language implies therapeutic assessment (R1) — passions are "identified," not "diagnosed"; output is "philosophical reflection," not "assessment result." Output does not promise that following the improvement path will produce a specific life outcome (R9). |

**Dependencies:** P2 complete.
**Risk:** High. Core product tool. User-facing changes. Database schema change.

---

## Phase 4: Derive Journal (Path of the Prokoptos) from V3 Dataset

**Objective:** Apply the V1 journal's derivation methodology to V3's 8-file dataset. Let the phase count, day count, and topic sequence emerge from V3's conceptual structure rather than copying V1's 7-phase / 56-day layout.

### V1 Derivation Methodology
The V1 journal was derived by reading V1's data files and mapping concepts to a progressive teaching sequence:
1. **Phase structure:** One phase per major conceptual domain in V1 (Foundation → Wisdom → Thought → Emotions → Acceptance → Gratitude → Integration). 7 phases because V1 had roughly 7 teachable domains.
2. **Day count per phase:** Phase 1 got 10 days (one per foundational concept in stoic-brain.json). Phases 2–5 got 8–9 days each (one per sub-virtue or key concept in the domain). Phase 6 got 7 days. Phase 7 got 6 days (integration/review).
3. **Entry design:** Each day had a teaching (drawn from V1 data content) and a reflective question (designed to apply the teaching to lived experience).
4. **Progression logic:** Concepts build on each other — later phases assume understanding of earlier concepts.
5. **Total:** 56 days emerged from the number of distinct teachable concepts in V1.

### V3 Derivation Approach
Read all 8 V3 files. Identify every distinct teachable concept. Group them into a natural progressive sequence. The number of phases should emerge from V3's conceptual structure (8 files vs V1's 5, with new domains like passions taxonomy, oikeiosis stages, causal sequence, progress metrics). The number of days per phase should emerge from the number of teachable concepts in that domain. The total day count will likely differ from 56.

| ID | Task | Rules | Files | Acceptance Criteria |
|----|------|-------|-------|-------------------|
| P4.1 | Extract all teachable concepts from V3's 8 files | R7 | Analysis document | Complete inventory of distinct teachable concepts, grouped by source file. Each concept has a one-line description, dependency notes, and the primary source citation it derives from (R7). |
| P4.2 | Derive phase structure from V3 concept groups | R6a | Design document | Phases emerge from V3's natural conceptual domains. Phase count and names determined by V3 content, not copied from V1. Dependency ordering verified. |
| P4.3 | Derive day sequence within each phase | — | website/src/lib/journal-content.ts | Each day teaches one concept from V3. Teaching text derived from V3 data content. Reflective question designed to apply the V3 concept to lived experience. Day count per phase matches concept count. |
| P4.4 | Derive journal completion assessment | R6c | website/src/app/journal/page.tsx | Completion assessment uses V3 progress model (Senecan grades, 4 progress dimensions from progress.json). Structure emerges from V3's progress metrics, not from V1's tier system. |
| P4.5 | Validate functional equivalence with V1 | — | Validation report | V3 journal teaches a complete Stoic practice path. Report: total days, phase count, phase names, what V3 covers that V1 didn't, what V1 covered that V3 handles differently, and recommendations. |
| **P4.6** | **Manifest compliance review of journal content** | **R1, R7, R9** | journal-content.ts, journal page | No teaching or reflective question implies therapeutic practice (R1) — frame as "philosophical exercise," not "emotional healing" or "processing feelings." Every teaching traces to a cited source (R7). No framing that promises completing the journal will produce a specific life outcome (R9) — frame as "practice path" not "treatment programme" or "transformation journey." |

**Dependencies:** P2 complete.
**Risk:** Medium. Content derivation, not structural rewrite.

---

## Phase 5: Derive Document Scorer from V3 Dataset

**Objective:** Apply the V1 document scorer's derivation methodology to V3's evaluation model. Let the scoring approach emerge from V3's diagnostic framework rather than replicating V1's per-virtue numeric scoring.

### V1 Derivation Methodology
The V1 document scorer was derived by adapting the V1 action scoring model (P6) to written content:
1. **Same model, different subject:** Applied the same 4-virtue weighted-composite scoring to document content instead of lived action.
2. **Scoring criteria:** Evaluated the document's ideas, arguments, tone, and ethical posture against each virtue using score_high_if / score_low_if criteria adapted for written content.
3. **Same scale:** 0–100 per virtue, same weights, same 5 tiers.
4. **Additional output:** Badge URL and embed HTML for embeddable results.
5. **Policy variant:** Adjusted weights for policy/legal documents (justice 35%, temperance 30%, wisdom 20%, courage 15%) and added flagged_clauses output.

### V3 Derivation Approach
Start from V3's evaluation sequence and ask: how does the 4-stage model apply to written content? Stage 1 (prohairesis filter) may adapt to authorial intent. Stage 3 (passion diagnosis) becomes analysis of which passions the document's rhetoric triggers in readers and which passions drove its creation. Stage 4 (unified virtue assessment) becomes proximity assessment of the document's ethical quality. Let the output structure emerge from what V3 naturally produces when applied to text.

| ID | Task | Rules | Files | Acceptance Criteria |
|----|------|-------|-------|-------------------|
| P5.1 | Derive document evaluation prompt from V3 evaluation sequence | R4 | website/src/lib/document-scorer.ts | Prompt applies V3's 4-stage sequence to written content. Passion identification analyses passions the document triggers and those that drove creation. Output schema emerges from V3's evaluation outputs applied to text. Prompt text server-side only (R4). |
| P5.2 | Derive DocumentScore interface from V3 outputs | R6b, R6c | website/src/lib/document-scorer.ts | Interface fields determined by what the V3 evaluation produces for documents. Not a modified copy of V1's interface. |
| P5.3 | Derive score-document page from V3 output structure | — | website/src/app/score-document/page.tsx | UI renders V3's document evaluation outputs. Layout determined by what V3 produces. |
| P5.4 | Derive embeddable badge from V3 proximity model | R4 | document-scorer.ts, badge endpoint | Badge displays V3's katorthoma proximity level. Embed HTML updated. Badge does not expose evaluation logic (R4). |
| P5.5 | Derive policy review variant from V3 + Cicero's deliberation framework | — | website/src/app/score-policy/page.tsx | Policy review applies Cicero's 5-question deliberation framework from action.json. Oikeiosis analysis assesses who the policy affects at each social level. Flagged clauses identified through passion identification (which passions the clause exploits or generates). |
| P5.6 | Derive social media filter from V3 passion diagnostic | — | website/src/app/score-social/page.tsx | Social media filter applies V3's passion identification as primary analysis. Evaluates: poster's motivating passions, passions the content triggers in readers, false judgements embedded in the post. |
| P5.7 | Validate functional equivalence with V1 | — | Validation report | V3 document scorer, policy reviewer, and social filter serve equivalent functions to their V1 counterparts. Report where outputs differ and recommendations. |
| **P5.8** | **Manifest compliance review of all content scoring tools** | **R1, R3, R9** | All 3 tool pages and outputs | All evaluative outputs include R3 disclaimer. Social filter does not frame reader-impact analysis as psychological profiling (R1). Policy review does not frame flagged clauses as legal advice (R3, R9). No tool promises a specific outcome from acting on its analysis (R9). |

**Dependencies:** P2 and P3 complete.
**Risk:** Medium.

---

## Phase 6: Derive Ethical Scenarios Tool from V3 Dataset

**Objective:** Apply V3's evaluation model to ethical scenario presentation. Let the scenario evaluation structure emerge from V3's 4-stage sequence and deliberation framework.

### V1 Derivation Methodology
The V1 scenarios tool presented pre-built ethical dilemmas and scored each option using the same weighted-composite model. Each option received 4 virtue scores and a total.

### V3 Derivation Approach
Apply V3's 4-stage evaluation to each option in a scenario. Additionally, apply Cicero's 5-question deliberation framework from action.json to walk through the resolution. The output per option should show: prohairesis filter, kathekon assessment, passions at play, proximity assessment. The deliberation walkthrough should show how the 5 questions resolve the dilemma.

| ID | Task | Rules | Files | Acceptance Criteria |
|----|------|-------|-------|-------------------|
| P6.1 | Derive scenario evaluation display from V3 4-stage sequence | R6b, R6c | website/src/app/scenarios/page.tsx | Each option evaluated through V3's 4 stages. Named passions per option. No numeric scores unless V3 derivation produces them. |
| P6.2 | Derive deliberation walkthrough from Cicero's 5-question framework | — | website/src/app/scenarios/page.tsx | 5 deliberation questions from action.json applied to each scenario. Resolution shown step-by-step. |
| P6.3 | Validate functional equivalence with V1 | — | Validation report | V3 scenarios serve equivalent function. Report differences and recommendations. |
| **P6.4** | **Manifest compliance review of scenarios tool** | **R3, R9** | Scenarios page | Scenario evaluations include R3 disclaimer. No scenario framing implies that the "correct" option will produce a guaranteed outcome (R9). |

**Dependencies:** P2 and P3 complete.
**Risk:** Low. Content-driven update.

---

## Phase 7: Derive Baseline Assessment and Progress Tracking from V3 Dataset

**Objective:** Apply the V1 baseline's derivation methodology to V3's progress model and diagnostic framework. Let the question count, structure, and tracking dimensions emerge from V3's content.

### V1 Derivation Methodology
The V1 baseline was derived from V1's scoring model:
1. **Question design:** One question per major scoring dimension (4 virtues = 4 core questions). Each question presented a real-life scenario targeting its virtue.
2. **Option design:** 4 options per question, shuffled so position doesn't correlate with score. Each option had a primary virtue score and secondary scores for cross-virtue signal.
3. **Scoring:** Primary (70%) + secondary (30%) blend per virtue → apply virtue weights → total score → assign tier.
4. **Conditional Q5:** Two branch variants triggered by borderline scores, providing refinement.
5. **Progress tracking:** Single numeric score tracked over time. 30-day retake interval. Progress = score change.

### V3 Derivation Approach
V3's progress model has 4 dimensions (passion_reduction, judgement_quality, disposition_stability, oikeiosis_extension) and 3 Senecan grades. The baseline must assess the user's starting position across these dimensions, not across 4 independently-weighted virtues. The number of questions should emerge from how many dimensions need assessment. The scoring should produce Senecan grade placement and a multi-dimensional profile, not a single number. Progress tracking should measure direction of travel across all 4 dimensions.

| ID | Task | Rules | Files | Acceptance Criteria |
|----|------|-------|-------|-------------------|
| P7.1 | Derive baseline questions from V3 progress dimensions | R6a | website/src/lib/baseline-assessment.ts | Question count and content emerge from V3's 4 progress dimensions + Senecan grade assessment + oikeiosis stage identification. Each question derived from V3 data, not adapted from V1 questions. |
| P7.2 | Derive scoring model from V3 progress framework | R6b, R6c | website/src/lib/baseline-assessment.ts | Scoring produces: Senecan grade, passion profile (which passions are dominant), oikeiosis stage, and position on each of 4 progress dimensions. Not a weighted numeric total. |
| P7.3 | Derive progress dashboard from V3 progress metrics | — | website/src/app/dashboard/ | Dashboard tracks 4 dimensions over time. Shows direction of travel per dimension. Senecan grade milestones marked. No single-number score line unless V3 derivation produces one. |
| P7.4 | Derive milestones from V3 progress model | — | website/src/lib/milestones.ts, MilestonesDisplay.tsx | Milestones emerge from V3's progress model: qualitative markers like "first action with zero passions identified," "oikeiosis extended to community level," Senecan grade transitions. Not numeric thresholds. |
| P7.5 | Derive Supabase schema from V3 progress outputs | — | Supabase migration | Schema stores V3's multi-dimensional progress data: passion counts over time, proximity history, Senecan grade transitions, oikeiosis progression. |
| P7.6 | Validate functional equivalence with V1 | — | Validation report | V3 baseline assesses starting position. V3 progress tracking measures improvement. Users see motivating progress. Report differences from V1 and recommendations. |
| **P7.7** | **Manifest compliance review of baseline and progress tools** | **R1, R3, R9** | Baseline page, dashboard, milestones | Baseline output includes R3 disclaimer. "Passion profile" framed as philosophical self-knowledge, not psychological assessment (R1). Progress dashboard does not imply clinical improvement or guaranteed outcomes (R1, R9). Milestones framed as philosophical practice markers, not therapeutic milestones (R1). "Passion reduction" dimension labelled to avoid clinical connotation (R1). |

**Dependencies:** P3 complete.
**Risk:** High. Key retention feature — users seeing their progress must feel motivating.

---

## Phase 8: Derive AI Agent Assessment Framework from V3 Dataset

**Objective:** Apply the V1 agent assessment's derivation methodology to V3's dataset. Let the assessment count, structure, and evaluation criteria emerge from the V3 journal (Phase 4 output) rather than from V1's 37-assessment structure.

### V1 Derivation Methodology
The V1 agent assessment was derived from the V1 journal:
1. **Mirror structure:** 37 assessments mapped 1:1 to journal phases and days.
2. **Reframe teaching:** Each journal teaching was reframed as an AI agent self-evaluation prompt.
3. **Define schema:** Each assessment had an expected_output_schema (JSON the agent should produce) and evaluation_criteria.
4. **Tiered access:** Free tier = foundational assessments (Phases 1–2, 11 items). Paid tier = full 37.
5. **Scoring:** References V1 scoring model — some schemas expected 0–100 self-scoring.

### V3 Derivation Approach
The V3 agent assessment must be derived from the V3 journal (which itself was derived in Phase 4). Since the V3 journal will have its own phase/day structure, the assessment count and structure will emerge from that. Each assessment's evaluation schema must use V3 concepts (passions detected, false judgements, katorthoma proximity, oikeiosis scope) not V1 scores. The tiering split should emerge from the V3 journal's natural progression.

| ID | Task | Rules | Files | Acceptance Criteria |
|----|------|-------|-------|-------------------|
| P8.1 | Derive assessment structure from V3 journal | R6a | agent-assessment/agent-assessment-framework.json | Assessment count and structure mirrors V3 journal phases (from Phase 4). Not 37 assessments unless V3 journal produces 37 teachable concepts. |
| P8.2 | Derive assessment prompts from V3 journal teachings | R6c | agent-assessment/agent-assessment-framework.json | Each assessment reframes its V3 journal teaching as an AI agent self-evaluation. Prompts reference V3 evaluation concepts. No 0–100 self-scoring. |
| P8.3 | Derive expected output schemas from V3 evaluation model | — | agent-assessment/agent-assessment-v3.json | Output schemas use V3 structures: katorthoma_proximity, passions_detected arrays, false_judgements arrays, oikeiosis_scope. Not numeric score fields. |
| P8.4 | Derive tier configuration from V3 journal progression | R5 | agent-assessment/tier-config.json | Free and paid tier split at a natural boundary in the V3 journal progression. Free tier limited to control filter + kathekon assessment + summary proximity (R5). Paid tier outputs determined by V3's advanced assessments. |
| P8.5 | Derive V3 Analysis Assessment API endpoint | — | API endpoint: POST /api/v1/agent/assess | Returns V3-native outputs: passion_profile, prohairesis_clarity, kathekon_consistency, katorthoma_proximity_distribution, senecan_grade, improvement_priorities. |
| P8.6 | Derive agent-assessment.ts and agent-baseline.ts | — | website/src/lib/agent-assessment.ts, agent-baseline.ts | Both files import V3 types. Logic implements V3 evaluation model. |
| P8.7 | Validate functional equivalence with V1 | — | Validation report | V3 agent assessment evaluates AI agent Stoic reasoning capability. Report: assessment count, coverage of V3 concepts, comparison with V1's 37 assessments, recommendations. |
| **P8.8** | **Manifest compliance review of agent assessment framework** | **R2, R4, R5** | Framework, tier config, API endpoint | Assessment cannot be used to evaluate humans for employment (R2) — framework documentation and API terms must state this explicitly. Assessment prompts and evaluation criteria are IP and must not be returned in API responses (R4). Free-tier response fields confirmed limited per R5. Cost guardrail: verify paid-tier revenue projection covers 2x LLM API cost for assessment evaluations (R5). |

**Dependencies:** P2, P3, and P4 complete (P4 produces the V3 journal from which assessments are derived).
**Risk:** High. AI agent assessment is a key revenue driver.

---

## Phase 9: Derive stoic-brain.ts Helper Library (Agent-Facing) from V3

**Objective:** Update the agent-facing TypeScript exports (agent-assessment.ts, agent-baseline.ts) to use V3 types and evaluation logic.

| ID | Task | Rules | Files | Acceptance Criteria |
|----|------|-------|-------|-------------------|
| P9.1 | Rewrite agent-assessment.ts with V3 types | R8 | website/src/lib/agent-assessment.ts | Imports V3 types. No V1 scoring logic. All terms match Glossary v3.0.0 (R8). |
| P9.2 | Rewrite agent-baseline.ts with V3 types | R8 | website/src/lib/agent-baseline.ts | Imports V3 types. Baseline uses V3 progress model. All terms match Glossary v3.0.0 (R8). |

**Dependencies:** P2 and P8 complete.
**Risk:** Low. Follows from P8 outputs.

---

## Phase 10: Derive API Specification from V3 Outputs

**Objective:** Update OpenAPI spec and all endpoints to serve V3 data. Endpoint design should emerge from what V3 tools produce, not from modifying V1 endpoints.

### V1 Derivation Methodology
V1's API was derived from V1's data files and scoring model: endpoints exposed V1 concepts (GET /virtues, GET /indifferents) and V1 scoring workflows (POST /score-action).

### V3 Derivation Approach
Read all V3 data files and the V3 tools derived in Phases 3–8. Identify what external consumers (AI agents, third-party apps) need access to. Design endpoints around V3's concepts. New endpoints may be needed (e.g., POST /diagnose-passion, POST /rank-indifferents). Some V1 endpoints may be unnecessary or reshaped.

| ID | Task | Rules | Files | Acceptance Criteria |
|----|------|-------|-------|-------------------|
| P10.1 | Derive API endpoint list from V3 concepts and tool outputs | R6a | api/api-spec.yaml | Endpoints serve V3 data. Endpoint list determined by V3 content, not by modifying V1 endpoint list. All schemas match V3 output structures. |
| P10.2 | Update Supabase Edge Functions | — | api/functions/ | All functions return V3 response schemas. |
| P10.3 | Consolidated database migration | — | api/migrations/ | Single migration covering all V3 schema changes from Phases 3, 7, and 8. Runs cleanly on fresh database. |
| **P10.4** | **Manifest compliance review of entire API** | **R2, R3, R4, R5, R8** | api-spec.yaml, Edge Functions, terms of use | All evaluative API responses include R3 disclaimer field. No endpoint exposes evaluation frameworks, prompt text, or scoring logic (R4). Free-tier endpoints enforce R5 output limits. API terms of use explicitly prohibit employment evaluation (R2). All response field names use Glossary v3.0.0 terms (R8). Rate limiting and cost-tracking guardrail implemented to enforce 2x revenue-to-cost ratio (R5). |

**Dependencies:** P3, P7, and P8 complete.
**Risk:** High. API is the external contract with AI agent developers.

---

## Phase 11: Final Verification and Cleanup

**Objective:** End-to-end testing, documentation update, removal of all V1 remnants, and full manifest compliance audit.

| ID | Task | Rules | Files | Acceptance Criteria |
|----|------|-------|-------|-------------------|
| P11.1 | Full codebase grep for V1 remnants | R6 | entire codebase | Zero V1 scoring references in active code. V1 references only in v1-archive/ and historical documents. |
| P11.2 | End-to-end tool testing | — | all tool pages | All tools produce V3 outputs. Each tool was derived from methodology, not rewritten from V1 structure. |
| P11.3 | Compile combined validation report | — | combined-validation-report.md | Consolidate all per-tool validation reports (from P3.6, P4.5, P5.7, P6.3, P7.6, P8.7) into a single document showing: what changed, why, and recommendations. |
| P11.4 | Update AGENTS.md | — | AGENTS.md | Describes V3 exclusively. API examples show V3 response format. |
| P11.5 | Update README.md and STATUS-REVENUE-MODEL.md | — | README.md, STATUS-REVENUE-MODEL.md | Current and references V3 throughout. |
| **P11.6** | **Full manifest compliance audit** | **R1–R9** | All files, all pages, all API endpoints | Systematic check of every rule against every deliverable. Checklist format: for each rule, list every file/page/endpoint that rule applies to, and confirm compliance. Any remaining violations flagged for remediation before launch. This is the final gate. |

**Dependencies:** All prior phases complete.
**Risk:** Low. Verification and cleanup.

---

## Summary

| Phase | Tasks | Risk | Key Deliverable |
|-------|-------|------|-----------------|
| P1: Retire V1 | 6 | Low | V3 files at stoic-brain/ root (source-audited) |
| P2: Core Library | 5 | Medium | stoic-brain.ts derived from V3's 8 files (language/IP/glossary reviewed) |
| P3: Action Score | 7 | High | Flagship tool with R1/R3/R9 compliance |
| P4: Journal | 6 | Medium | Journal with R1/R7/R9 compliance |
| P5: Document Score + Policy + Social | 8 | Medium | Content scoring tools with R1/R3/R9 compliance |
| P6: Scenarios | 4 | Low | Ethical scenarios with R3/R9 compliance |
| P7: Baseline + Progress | 7 | High | Multi-dimensional tracking with R1/R3/R9 compliance |
| P8: Agent Assessment | 8 | High | Agent framework with R2/R4/R5 compliance |
| P9: Agent Library | 2 | Low | Agent-facing TypeScript (glossary-compliant) |
| P10: API | 4 | High | API with R2/R3/R4/R5/R8 compliance |
| P11: Verification | 6 | Low | Full manifest audit (R1–R9 gate) |
| **Total** | **63** | | |

---

## Key Difference from Previous Scope

The previous scope (v1) treated each tool phase as "rewrite the existing tool with V3 content." This revision treats each tool phase as:

1. **Examine** the V1 tool's derivation methodology (how was it originally created from V1 data?)
2. **Apply** that same methodology to V3's 8-file dataset
3. **Let emerge** a V3 tool whose structure is determined by V3's content, not by V1's structure
4. **Validate** that the V3 tool serves an equivalent function
5. **Report** where the V3 tool differs from V1, with recommendations
6. **Verify manifest compliance** — every tool passes R1–R9 before sign-off

This mirrors the exact approach used to build the V3 data files themselves: the V3 data was not V1 restructured with new content — it was V1's methodology re-applied to original sources, producing 8 files instead of 5 because the source material warranted a different structure. The tools must follow the same principle.

---

## Rule Coverage Matrix

| Rule | Phases Where Enforced |
|------|-----------------------|
| R1 — No Therapeutic Implication | P2.5, P3.7, P4.6, P5.8, P7.7 |
| R2 — No Employment Evaluation | P8.8, P10.4 |
| R3 — Disclaimer on Evaluative Output | P3.7, P5.8, P6.4, P7.7, P10.4 |
| R4 — IP Protection | P2.5, P3.3, P5.1, P5.4, P8.8, P10.4 |
| R5 — Free Tier / Cost Guardrail | P8.4, P8.8, P10.4 |
| R6 — Methodology-First (V1 Learnings) | P2.2, P2.3, P3.2, P5.2, P6.1, P7.1, P7.2, P8.1, P8.2, P10.1, P11.1 |
| R7 — Source Fidelity | P1.6, P4.1, P4.6 |
| R8 — Glossary Enforcement | P2.5, P9.1, P9.2, P10.4 |
| R9 — No Outcome Promises | P3.7, P4.6, P5.8, P6.4, P7.7 |
| **All (R1–R9)** | **P11.6 (final gate)** |
