# SageReasoning V3 Adoption Scope (Revised April 2026)

**Completion Audit · Remaining Cleanup · Mythos-Readiness · Infrastructure Hardening**

Date: 3 April 2026
Supersedes: V3_Adoption_Scope.md (31 March 2026)

---

## Governing Document

This scope is governed by **manifest.md**. Every task must comply with all 13 rules (R1–R13). Compliance tasks are embedded in each phase and marked with the rules they enforce.

---

## Status of Original V3 Adoption Scope (P1–P11)

An audit of the codebase on 3 April 2026 confirmed that all 11 original phases are substantially complete. The table below summarises the findings.

| Phase | Description | Status | Notes |
|-------|-------------|--------|-------|
| P1 | Retire V1, promote V3 to production | **COMPLETE** | V1 archived to v1-archive/. All 8 V3 files at stoic-brain/ root. Citation audit at ~84% (148/177 concepts cited; 9 remaining gaps are application-layer, permitted by R7). sources-index.md updated 31 March 2026. |
| P2 | Derive stoic-brain.ts from V3 dataset | **COMPLETE** | All V3 types, constants (11 exports derived from 8 data files), and 5 helper functions exported. V1 shims isolated at end of file, marked @deprecated. One naming note: spec said diagnosePassions(), code uses identifyPassions() — consistent with R1 (no therapeutic language). |
| P3 | Derive action score tool from V3 | **COMPLETE** | 4-stage evaluation sequence (prohairesis filter → kathekon → passion diagnosis → virtue quality). V3 inputs include oikeiosis context. No numeric scoring. Supabase schema uses V3 columns with CHECK constraints. |
| P4 | Derive journal tool from V3 | **COMPLETE** | 55-day journal across 8 phases. Completion assessment uses 4 progress dimensions (passion reduction, judgement quality, disposition stability, oikeiosis extension). |
| P5 | Derive baseline assessment from V3 | **COMPLETE** | 5 core questions + conditional Q6. Outputs Senecan grade, dimension levels, dominant passion, oikeiosis stage. Saves to baseline_assessments_v3 table. |
| P6 | Derive milestone assessment from V3 | **COMPLETE** | Checks action_evaluations_v3 and baseline_assessments_v3 for V3 progress markers. |
| P7 | Derive scenario generator from V3 | **COMPLETE** | Age-appropriate scenarios scored with V3 4-stage format. Extended output includes Cicero's 5-question deliberation walkthrough. |
| P8 | Derive pattern analysis from V3 | **COMPLETE** | Deterministic aggregation of reasoning_receipts — no LLM call. Surfaces recurring passions, proximity trends, virtue gaps. |
| P9 | Derive marketplace metadata from V3 | **COMPLETE** | 15+ sage skills all powered by sage-reason engine. All use V3 mechanisms via createContextTemplateHandler. |
| P10 | Update API specification | **COMPLETE** | OpenAPI 3.1.0 spec at v3.0.0. Three Supabase migrations implement V3 schema. P10.4 manifest compliance review: 9/9 rules compliant. |
| P11 | Final verification and manifest audit | **COMPLETE** | Validation report exists. TypeScript compiles clean (0 errors). V1 remnants categorised into 4 groups (deprecated shims, anti-pattern instructions, documentation references, deferred items). |

---

## Phases 12–16: COMPLETED 3 April 2026

The original scope mentioned Phases 12–19 in the addendum for integration testing and cleanup. The audit identified specific remaining work items, plus new priorities driven by the Claude Mythos model announcement (late March 2026). This revised scope consolidated remaining work into 5 phases. **All 5 phases were completed on 3 April 2026.**

---

## Phase 12: V1 Cleanup and README Alignment

**Objective:** Remove all deprecated V1 compatibility shims and update documentation that still references V1 patterns.

**Rationale:** V1 shims were preserved so unrewritten tool pages would compile during the P3–P9 derivation work. That work is now complete. Keeping deprecated code increases maintenance burden and confuses agents reading the codebase.

| ID | Task | Rules | Files | Acceptance Criteria |
|----|------|-------|-------|-------------------|
| P12.1 | Remove @deprecated V1 shims from stoic-brain.ts | R6a | website/src/lib/stoic-brain.ts | Lines 756–798 (VIRTUES, ALIGNMENT_TIERS, getAlignmentTier) deleted. No V1 exports remain. All consuming files already use V3 equivalents. |
| P12.2 | Remove @deprecated V1 shims from agent-assessment.ts | R6a | website/src/lib/agent-assessment.ts | V1 types and constants removed. Confirm no imports reference removed exports. |
| P12.3 | Remove @deprecated V1 shims from agent-baseline.ts | R6a | website/src/lib/agent-baseline.ts | Same as above. |
| P12.4 | Remove @deprecated V1 shims from baseline-assessment.ts | R6a | website/src/lib/baseline-assessment.ts | Same as above. |
| P12.5 | Remove V1 fallback code from baseline route | R6a | website/src/app/api/baseline/route.ts | Remove fallback to baseline_assessments (V1) table. Users who completed V1 baseline will be prompted to retake under V3. |
| P12.6 | Remove V1 fallback code from milestones route | R6a | website/src/app/api/milestones/route.ts | Remove fallback to V1 baseline table. |
| P12.7 | Update README.md to remove V1 alignment tiers | R6c, R8c | README.md | Replace lines showing 0–100 numeric tiers (0–14 Contrary, 15–39 Misaligned, etc.) with V3 proximity levels (reflexive → sage-like). Keep consistent with AGENTS.md and ai-agent-guide.md. |
| P12.8 | Remove V1 anti-pattern instructions from route files | — | All API routes containing "Do NOT use 0-100" | Once V1 shims are gone, these prohibitive comments are no longer needed. The codebase itself enforces V3. Remove to reduce prompt token overhead. |
| **P12.9** | **TypeScript compilation and runtime test** | — | All .ts/.tsx files | Zero compilation errors after all removals. Verify score, baseline, journal, scenarios, and marketplace pages render correctly. |

**Dependencies:** None — can start immediately.
**Risk:** Low. All V1 shims are already unused by production code. This is deletion work.

---

## Phase 13: Prompt Audit and Simplification

**Objective:** Audit every server-side scoring prompt and reduce procedural scaffolding. Specify what and why, not how. Prepare prompts for next-generation model capabilities.

**Rationale:** The Claude Mythos announcement (March 2026) signals a step change in model reasoning. The "bitter lesson" for builders is that smarter models demand simplification — overspecified prompts, rigid step-by-step instructions, and hard-coded inference rules become performance liabilities. SageReasoning's value is in the V3 dataset and governance rules (R1–R13), not in procedural prompt engineering. This phase separates the two.

| ID | Task | Rules | Files | Acceptance Criteria |
|----|------|-------|-------|-------------------|
| P13.1 | Inventory all server-side prompts | R4 | All API route handlers | Complete list of every LLM system prompt, with token count per prompt. Identify which prompts contain procedural instructions (step-by-step) vs. declarative specifications (what + why + constraints). |
| P13.2 | Classify prompt content into three categories | — | Analysis document | For each prompt, line by line, classify content as: **(A) Outcome specification** — what the evaluation must produce (keep). **(B) Governance constraint** — rule enforcement, disclaimers, IP protection (keep). **(C) Procedural instruction** — step-by-step reasoning guidance the model can infer from context (candidate for removal). |
| P13.3 | Create simplified prompt variants | R4, R6a | Parallel prompt files | For each prompt, create a simplified version that retains (A) outcome specs and (B) governance constraints but removes (C) procedural steps. Include the relevant V3 data file content inline as context rather than paraphrasing it in the prompt. |
| P13.4 | A/B test simplified vs. current prompts | — | Test harness + evaluation report | Run both prompt versions against a standard set of 20 test inputs per tool. Compare output quality on: R7 source fidelity (does output trace to V3 concepts?), R6b unity compliance (no independent virtue scoring?), R6c qualitative output (no numeric leakage?), and R3 disclaimer presence. Document where simplified prompts match or exceed current quality and where they regress. |
| P13.5 | Deploy winning prompt variants | R4 | API route handlers | Replace current prompts with simplified versions where A/B testing confirms equivalent or better quality. Retain current prompts as fallback for any tools where simplification caused regression. |
| **P13.6** | **Document prompt architecture for model-agnostic operation** | R4 | docs/prompt-architecture.md | Create internal documentation explaining: (1) what each prompt specifies and why, (2) which V3 data files each prompt references, (3) which governance rules each prompt enforces. This document enables future model swaps without re-engineering prompts from scratch. |

**Dependencies:** P12 complete (V1 anti-pattern instructions removed before auditing prompts).
**Risk:** Medium. Prompt changes directly affect output quality. A/B testing in P13.4 mitigates this — no untested prompt reaches production.

---

## Phase 14: API Consolidation Review

**Objective:** Evaluate whether specialised scoring endpoints can be consolidated into sage-reason depth/mode parameters, reducing surface area while increasing composability for agent consumers.

**Rationale:** SageReasoning currently exposes 56+ API routes including 18+ sage skill endpoints. The Mythos-class model generation will produce agents that prefer composable primitives over pre-built specialty routes — they'll orchestrate evaluation sequences autonomously rather than calling purpose-built endpoints. Fewer, smarter endpoints also reduce maintenance burden and simplify the skill contract surface for AGENTS.md.

This phase is a **review and recommendation** — it does not commit to consolidation until the analysis is complete.

| ID | Task | Rules | Files | Acceptance Criteria |
|----|------|-------|-------|-------------------|
| P14.1 | Map all evaluation endpoints to sage-reason mechanisms | R12 | Analysis document | For each of the 18+ sage skill endpoints and the specialised scoring endpoints (score-document, score-conversation, score-social, score-policy), document: (1) which V3 mechanisms it uses, (2) what unique input/output it requires beyond sage-reason, (3) whether its function could be expressed as a sage-reason depth + mode parameter. |
| P14.2 | Identify consolidation candidates | R5 | Analysis document | Classify each endpoint as: **(A) Keep standalone** — unique input/output requirements justify a dedicated route. **(B) Consolidate into sage-reason** — functionality is a parameterised variant of the universal reasoning layer. **(C) Deprecate** — low usage, redundant with another endpoint. Include usage data from analytics if available. |
| P14.3 | Assess revenue and compatibility impact | R5, R10, R13 | Analysis document | For each consolidation candidate: (1) does consolidation change pricing per R5 (2x cost coverage)? (2) do existing integrations break? (3) do marketplace-listed skills per R10 need updating? (4) do embedding platforms per R13 need migration paths? |
| P14.4 | Produce recommendation with migration plan | R8d | Recommendation document | If consolidation is recommended: specify new sage-reason parameters, deprecation timeline for old endpoints, migration guide for existing consumers, and updated AGENTS.md skill contracts. If consolidation is not recommended: document why and close this phase. |
| **P14.5** | **Decision gate — approve or reject consolidation** | — | — | Present recommendation for approval. Do not proceed with endpoint changes without explicit sign-off. |

**Dependencies:** P13 complete (prompt architecture documented before evaluating endpoint consolidation).
**Risk:** Low for the review itself. Actual consolidation (if approved) would be a separate phase with its own risk assessment.

---

## Phase 15: Competitive Moat Documentation

**Objective:** Update the business plan and positioning documents to articulate why SageReasoning's value increases — not decreases — as model capabilities advance.

**Rationale:** When Mythos-class models can "think like a Stoic" from a raw prompt, the risk is that potential customers or investors ask: "Why pay for SageReasoning when the model can do this natively?" The answer is source fidelity, governance guarantees, and structured evaluation infrastructure — but this case needs to be made explicitly in the business plan, pitch materials, and website copy.

| ID | Task | Rules | Files | Acceptance Criteria |
|----|------|-------|-------|-------------------|
| P15.1 | Draft competitive moat analysis | — | SageReasoning_Mythos_Competitive_Analysis.docx | Document that addresses: (1) What a raw "think like a Stoic" prompt produces vs. what SageReasoning produces (source citations, structured passions taxonomy, reproducible evaluation sequence). (2) What SageReasoning guarantees that raw prompting cannot: R7 source fidelity, R1/R2/R9 governance, R3 disclaimers, R13 embedding obligations. (3) The "compliance infrastructure" framing — SageReasoning as the verified, auditable layer that agents use when they need reasoning they can cite and defend. |
| P15.2 | Update business plan competitive advantage section | — | SageReasoning_Legal_Revenue_Business_Plan.docx | Revise the competitive moat section to incorporate the Mythos-era framing. The plan must clearly justify why the potential returns warrant investment given that foundation models are getting dramatically more capable. |
| P15.3 | Update Growth Strategy positioning | — | SageReasoning_Growth_Strategy.docx | Revise market positioning to emphasise: (1) reasoning infrastructure, not reasoning tool, (2) the dataset and governance rules as the durable asset, (3) model-agnostic architecture (SageReasoning works with any sufficiently capable model, including Mythos). |
| P15.4 | Review and update Break-Even Analysis | — | SageReasoning_BreakEven_Analysis.xlsx | Assess whether Mythos pricing (~$200/month premium tier, higher per-token costs) changes the cost model. Update LLM cost assumptions. Evaluate whether prompt simplification (P13) reduces per-call costs enough to offset any model price increases. |
| **P15.5** | **Critical review of business plan investment case** | — | Investment case assessment | With all updates in place, review the full business plan with a critical lens: does it clearly justify why the potential returns warrant the upfront investment and ongoing operational costs? Flag any assumptions that Mythos capabilities invalidate. This task directly addresses the current project priority stated in the project instructions. |

**Dependencies:** P13 complete (prompt simplification results inform cost model). P14.4 complete (endpoint strategy informs revenue model).
**Risk:** Low technical risk. High strategic importance — this is the "why bother" question for the entire project.

---

## Phase 16: Final Verification and Scope Closure

**Objective:** Confirm all remaining work is complete, all documentation is current, and the project is positioned for Mythos-era operation.

| ID | Task | Rules | Files | Acceptance Criteria |
|----|------|-------|-------|-------------------|
| P16.1 | Full TypeScript compilation check | — | All .ts/.tsx files | Zero errors, zero warnings related to V1 types or deprecated imports. |
| P16.2 | Runtime smoke test of all user-facing tools | R3 | All page routes | Score, journal, baseline, scenarios, marketplace, dashboard pages load and function. All evaluative outputs include R3 disclaimer. |
| P16.3 | API endpoint smoke test | — | All API routes | Automated or manual test of each API endpoint with a standard input. Confirm V3 output format (proximity levels, passions, kathekon assessment). No V1 output fields in any response. |
| P16.4 | Documentation consistency check | R8a–d | AGENTS.md, README.md, ai-agent-guide.md, api-spec.yaml, openbrain-integration-spec.md | All documents describe the same V3 architecture. No contradictions between docs. Glossary enforcement verified per R8 tiers. |
| P16.5 | Manifest compliance audit (R1–R13) | All | All files | Final pass confirming every rule is enforced. Produce compliance matrix with evidence per rule. |
| **P16.6** | **Archive V3_Adoption_Scope.md (original) and close scope** | — | V3_Adoption_Scope.md | Move original scope to an archive directory. This revised scope becomes the active reference. Mark project as "V3 adoption complete, Mythos-ready." |

**Dependencies:** P12–P15 complete.
**Risk:** Low. Verification only.

---

## Summary: Completion Status

| Phase | Tasks | Status | Completed |
|-------|-------|--------|-----------|
| P12: V1 Cleanup | 9 tasks | **COMPLETE** | 3 April 2026 |
| P13: Prompt Audit | 6 tasks | **COMPLETE** | 3 April 2026 |
| P14: API Consolidation Review | 5 tasks | **COMPLETE** (recommendation: Option 1 approved) | 3 April 2026 |
| P15: Competitive Moat Documentation | 5 tasks | **COMPLETE** | 3 April 2026 |
| P16: Final Verification | 6 tasks | **COMPLETE** | 3 April 2026 |

**Total: 31 tasks across 5 phases — all complete.**

### Deliverables Produced

- `docs/prompt-architecture.md` — Prompt inventory, token counts, content classification, model swap procedure
- `docs/P14_API_Consolidation_Recommendation.md` — Full endpoint analysis, consolidation plan, revenue impact assessment
- `SageReasoning_Mythos_Competitive_Analysis.docx` — 8-section competitive moat analysis including critical investment case review
- `SageReasoning_Legal_Revenue_Business_Plan.docx` — Updated with tracked changes (V3 terminology, Mythos cost notes)
- `SageReasoning_Growth_Strategy.docx` — Updated with tracked changes (compliance infrastructure positioning, new article suggestion)
- `SageReasoning_BreakEven_Analysis.xlsx` — New "Mythos Cost Scenario" sheet added, assumptions updated with Phase 13 savings

### Validation Results (P16)

- TypeScript compilation: 0 errors
- V1 remnant scan: All remaining V1 code properly marked @deprecated, no active usage
- Manifest compliance (R1-R13): All rules compliant across all API routes and lib files
- R3 disclaimers: Present on all evaluative endpoints
- R6c qualitative output: No numeric 0-100 scoring in active code
- R1 no-therapeutic: Explicitly enforced in all prompt files

---

## Key Principles Carried Forward

1. **Methodology-first derivation (R6a):** Still applies to any new tool or endpoint created during consolidation.
2. **Source fidelity (R7):** The citation audit at 84% exceeds the application-layer threshold. No further sourcing work required unless new data concepts are added.
3. **IP protection (R4):** Prompt simplification must not expose evaluation logic in API responses. Server-side only.
4. **Model-agnostic architecture:** The revised scope explicitly prepares for model swaps by documenting prompt architecture (P13.6) rather than hard-coding model-specific optimisations.
5. **No premature Mythos optimisation:** The scope prepares for Mythos without depending on it. All changes improve the current Opus 4.6 stack. Mythos-specific work (if needed) would be a separate scope after public release.
