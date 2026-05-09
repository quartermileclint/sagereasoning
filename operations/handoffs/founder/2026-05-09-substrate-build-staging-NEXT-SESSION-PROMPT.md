# Next-Session Prompt — Stoic Agent Substrate: Detailed Build Staging (Planning Only)

**Stream:** founder.
**Tier:** Standard (planning / governance only — no execution).
**Governing frame:** `/adopted/standing-protocol-cache.md` (operative reference).
**Predecessor session close:** `/operations/handoffs/founder/2026-05-09-substrate-architecture-explore-close.md`
**Risk classification:** Standard (no production touch this session).

## Why this session matters

The previous session expanded three converging ideas into a single architecture (the Stoic Agent Substrate), captured the founder's declarative decision to open-source Layer 1 and Layer 3, and surfaced thirteen open questions. None of this has been formalised. None of it has been executed.

The founder cited 2F as evidence of what happens when ideas aren't expanded before formal planning: rework, rescoping, and lost time. This session exists to prevent the same pattern recurring with the substrate work, which is materially larger in scope than 2F.

The session's job is to produce a **staged build plan** — an ordered, dependency-aware, importance-prioritised plan for how the substrate work will unfold across subsequent sessions. The plan is the artefact. No code, no licence file, no public announcement, no ADR drafting other than the staging plan itself.

## Pre-conditions

1. **Predecessor session close read.** `/operations/handoffs/founder/2026-05-09-substrate-architecture-explore-close.md` covers what was decided, what was recorded as founder positions, and what remains as open questions.
2. **Inbox files re-read if needed.** `/inbox/Layer A – Impression Capture.rtf`, `/inbox/Layer B – Assent Quality.rtf`, `/inbox/Layer C – Consistency under pressure and subagent verification.rtf`, `/inbox/Layer D – CoC Extension and Ethical Colab Cred.rtf`, `/inbox/sage-intuit.txt`. These contributed substantive content to the architecture; the staging plan must reference them.
3. **Standing protocol cache opened.** Tier confirmation, model selection (cite cache row at item-time — planning is documentation work; AC1 N/A), risk class, signals and status vocabulary in scope.
4. **No founder pre-work required.** The planning session uses what's already been decided and recorded. New decisions during the session are welcome but not required.

## Part A — Open under the protocol

Read in order:

1. `/adopted/standing-protocol-cache.md` (~3 min)
2. `/operations/handoffs/founder/2026-05-09-substrate-architecture-explore-close.md` (~5 min — most recent predecessor close; decisions, open questions, founder positions on record)
3. The five inbox files if not already familiar (~10 min total)

Confirm at open: tier (Standard); hold-point status (P0 0h still active — substrate work happens in parallel with hold-point assessment, not after); model selection (planning is documentation; cite the AC1 N/A row); status vocabulary; signals/risk class.

## Part B — Session work: produce the staged build plan

The session has one deliverable: a staged build plan saved as a document the founder can review.

Suggested location: `/drafts/stoic-agent-substrate-staging-plan.md` (drafts folder so it's clearly not yet adopted).

The plan must cover the elements below. Each element gets, at minimum: a short description, an importance rating, dependencies on other elements, an estimated session count, a risk class, and a stage assignment (Stage 1 / 2 / 3 / etc.).

### Inventory of substrate work to be planned

The following list is what the previous session surfaced. The planning session adds to it, removes from it, and orders it. The list is not the plan; the plan is the *ordered version* of this list with reasoning.

**A. Authoritative judgement infrastructure (the moat-side work)**

- A1. Layer 2 server-side authentication infrastructure — how external Layer 2 calls are authenticated when Layers 1 and 3 are open
- A2. Layer 2 signing — every authoritative Layer2Assessment is cryptographically signed by SageReasoning; verifiers can check signatures
- A3. Key management — how signing keys are managed, rotated, protected
- A4. Layer 2 input validation surface — accepting and validating Layer1Schema directly; clear error responses
- A5. R20a perimeter handover — where the distress check lives once Layer 1 is open. Three options (replicate in open Layer 1; enforce server-side at Layer 2 as precondition; combination). One must be selected.
- A6. Existing /api/reason and V3 endpoint family relationship to substrate — coexist, deprecate, or rewire? Migration path for sagereasoning.com consumers.

**B. Open-source publication infrastructure**

- B1. Licensing strategy — permissive / copyleft / custom / dual. Affects everything downstream. Needs lawyer review at execution stage.
- B2. Repository structure — single monorepo, multi-repo, or substrate-as-package. How code is organised for external consumption.
- B3. Reference Layer 1 implementation hardening — cleaning, commenting, examples, version contracts for external use
- B4. Reference Layer 3 implementation hardening — same
- B5. Open-source R20a reference implementation if A5 lands on "include in open Layer 1"
- B6. Brand and trademark posture — distinguishing "running open SageReasoning code" from "calling authoritative SageReasoning Layer 2"
- B7. Community governance model — contribution guidelines, PR review policy, maintainer roles, support-burden discipline. Day-one minimum.
- B8. Public announcement strategy — when, how, where (Anthropic developer ecosystem, philosophy communities, agent-protocol communities)

**C. Input contract and developer surface**

- C1. Layer1Schema published as JSON Schema, OpenAPI fragment, and TypeScript types
- C2. Schema documentation — every Greek term, every enum value, primary-source citation, when-to-use, when-not-to-use, examples and counter-examples
- C3. Three-mode access — pure structured (Mode 1), hybrid (Mode 2), pure text (Mode 3) — designed and documented as a developmental sequence for agents
- C4. Developer guide — 5–10 worked examples (text input alongside corresponding self-classified Layer1Schema)
- C5. Validation-as-teaching error messages — helpful errors that double as Stoic onboarding
- C6. Schema linter / draft-validation surface — agents can validate before running full assessment
- C7. Test fixtures and reference inputs — agents verify their self-classification matches expected outputs

**D. Translation pattern wiki**

- D1. Wiki structure — pattern format (input pattern / Layer1Schema mapping / examples / counter-examples / primary source citation)
- D2. Initial pattern corpus — extracted from existing Layer 1 implementation and primary sources
- D3. Wiki governance — who curates, how contributions are reviewed, versioning
- D4. Wiki ↔ code linkage — patterns reference specific extractor logic; tests reference patterns
- D5. Wiki as test corpus — examples become validation set for any translator implementation

**E. Decision-path mechanisms (the Stoic Agent Substrate proper)**

- E1. Action-scorer interface — `score(judgement, candidate_action) → kathekon_assessment` (the sage-intuit pre-decision moment). Mirrors human action scorer per founder's open-question position.
- E2. Verification interface — Layer B alignment metric: `verify(examined_judgement, response) → alignment_record`
- E3. Subagent handoff payload — Layer C: signed serialisable examined-judgement that travels with delegated tasks
- E4. Concern-radius credential — Layer D: living trail of proximity movement
- E5. Mode separation: evaluative mode, prescriptive mode, configurable mode, augmentative-combo mode (per founder's Q1 position — separate products, not a single configurable surface)
- E6. Acceptance/rejection audit trail — record of which substrate-suggested options the agent accepted or rejected (per founder's combo-mode framing)

**F. Credential infrastructure**

- F1. Credential format — JWT minimal, W3C VC with selective disclosure, or progression. Carries proximity movement.
- F2. Credential issuance — how the substrate signs and emits credentials
- F3. Credential verification — verification library; receivers need to be able to check signatures
- F4. Living-trail mechanism — pointer-to-backend, Merkle tree, or periodic snapshot reissuance
- F5. Revocation model — what happens when an agent's behaviour drifts after issuance
- F6. Cross-platform readability — engagement with adjacent ecosystem standards (MCP, A2A, others) so the credential is interpretable beyond SageReasoning's own consumers

**G. Ecosystem offerings (above schema + docs)**

- G1. SDK design — which language(s) first, how packaged, how distributed
- G2. MCP server packaging — substrate as an MCP server other agents can include
- G3. Domain-specific adapters — which domains first (code review, customer service, content moderation, healthcare, others), how versioned, community vs in-house
- G4. Build-your-own-translator assistant — design and feasibility; whether it's a v1 or v2 deliverable
- G5. Calibration tools — drift detection, suggestion feedback for agent self-classification
- G6. Process narrative — published artefact of how the founder built Layer 1 with Claude (your own session transcripts and decision log are the source)
- G7. Examples-as-data — published dataset of (text, Layer1Schema) pairs for few-shot prompting and fine-tuning

**H. Operational and governance infrastructure**

- H1. ADR for the unified Stoic Agent Substrate concept — captures the architectural decision; references this session's exploration
- H2. ADR for licensing — captures the licensing choice
- H3. ADR for the three-mode access design
- H4. ADR for the credential format choice
- H5. R5 cost-as-health-metric impact assessment — substrate model changes cost-to-serve dramatically; revisit projections
- H6. Existing manifest amendments needed — AC additions, new PR rules, project-instructions updates
- H7. Standards-formation engagement plan — which communities, when, how

### Importance criteria the plan should use

The staging plan must order items by importance, defined here as:

1. **Items that block other work.** A signing infrastructure (A2) blocks any credential work (F). A licensing decision (B1) blocks any open-source publication (B3, B4). Identify these and stage them first.
2. **Items that preserve safety.** R20a perimeter handover (A5) is non-negotiable before any open-source publication. Stage before B3/B4.
3. **Items that establish moat.** Layer 2 server-side authentication, signing, and key management (A1–A3) are foundational to the value proposition. Stage early.
4. **Items that unlock community work.** Open-source publication (B3–B4) and the wiki (D1–D5) let the community contribute. Stage after foundational moat work but before deep ecosystem additions.
5. **Items that serve specific agent uses.** Action scorer, verifier, credential — concrete agent-substrate functionality. Stage after foundations are ready.
6. **Items that polish and extend.** Domain adapters, calibration tools, build-your-own assistant. Stage last.

The plan is free to override these defaults with reasoning. The defaults are starting points, not constraints.

### Output format expected

The staging plan saved to `/drafts/stoic-agent-substrate-staging-plan.md` should include:

- Executive summary (what's being planned, why, what's out of scope)
- Stage-by-stage breakdown (Stage 1 through Stage N), each with: items in the stage, dependencies, estimated sessions, risk class, success criteria
- Dependency map showing which items depend on which
- Critical path identification — the chain of items that determines the project's overall length
- Parallel work opportunities — which stages or items can run concurrently
- Open questions surfaced during planning that need founder decision before execution begins
- Recommended first three stages, in order, with reasoning

The plan is a draft. Founder reviews, edits, requests changes, and approves. Only an approved plan moves to `/adopted/`.

## Part C — Anticipated session shape

| Phase | Time |
|---|---|
| Cache + predecessor close + inbox file re-read | 15 min |
| Founder confirms scope and any pre-session position changes | 5 min |
| Inventory pass — confirm the list above is complete; add or remove items | 30 min |
| Dependency mapping — for each item, what does it depend on | 30 min |
| Importance ordering — apply the criteria; produce stage assignments | 45 min |
| Staging draft — write the plan document | 60–90 min |
| Founder review of draft + revisions | 30 min |
| Decision-log entry + close | 30 min |
| **Total** | **~4–5 hr** |

If the inventory grows beyond capacity for one session, the planning work is itself staged — Session 1 produces a complete inventory and Stage 1 detail; subsequent stages get planned in follow-up sessions. Founder elects scope at session-open.

## Rollback path

`git revert` of the staging plan commit. The plan lives in `/drafts/`; nothing in `/adopted/` is touched. No production impact, no user-facing change, no rollback discipline beyond ordinary version control.

## Forecast

**Most-likely path:** the inventory above is roughly complete; the planning session produces a staging plan that orders the items into 5–8 stages spanning an estimated 30–60 build sessions across multiple months. The first three stages are likely:

1. **Stage 1 — Foundations.** Licensing decision (B1), R20a perimeter handover (A5), Layer 2 server-side authentication and signing (A1–A3), input validation surface (A4). Blocks everything else.
2. **Stage 2 — Open-source publication.** Reference Layer 1 hardening (B3), reference Layer 3 hardening (B4), repository structure (B2), community governance day-one minimum (B7), brand posture (B6).
3. **Stage 3 — Developer surface.** Schema publication (C1), schema documentation (C2), three-mode access design (C3), developer guide (C4), validation-as-teaching errors (C5).

Decision-path mechanisms (E), credential infrastructure (F), and ecosystem offerings (G) come later.

**Alternative paths:**

- **Compressed: founder elects to proceed with manual licence-as-temporary while remaining work proceeds in parallel.** Possible but raises risk of having to redo work if the licence choice constrains structure. Not recommended without specific reasoning.
- **Expanded: founder elects to engage external review (lawyer for licensing, cryptographer for signing infrastructure, philosopher-of-Stoicism for primary-source curation) at specific stages.** Adds calendar time but raises quality.
- **Pivoted: planning surfaces a new finding that changes the architecture.** The staging plan is itself draft until founder approves; if planning surfaces something material, the architecture is revisited before plan adoption.

**Recommendation (not prescription):** the planning session is itself the discipline. The temptation will be to start designing or even building during planning. Hold the line: this session is *only* planning. Execution starts in the session after the plan is approved.

End of prompt.
