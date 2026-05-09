# Next-Session Prompt — Substrate as Plugin: Detailed Build Staging (Planning Only)

**Stream:** founder.
**Tier:** Standard (planning / governance only — no execution).
**Governing frame:** `/adopted/standing-protocol-cache.md` (operative reference).
**Predecessor session close:** `/operations/handoffs/founder/2026-05-10-substrate-plugin-architecture-close.md`
**Risk classification:** Standard (no production touch this session).
**Supersedes:** `/operations/handoffs/founder/2026-05-09-substrate-build-staging-NEXT-SESSION-PROMPT.md` (the prior staging prompt was scoped against an earlier architecture; preserved on file as predecessor record per the preserve-prior-versions principle).

## Why this session matters

The architecture is now agreed. Layer 1 is open-sourced; Layer 3 stays closed; the substrate is delivered as a plugin (or plugin family) installable via plugin marketplaces. Two front-ends, one substrate: sagereasoning.com for humans, plugins for agents, shared Layer 2 + Layer 3 backend.

This session exists to take the agreed architecture and stage the build into an ordered, dependency-aware plan that subsequent sessions execute. The plan is the artefact. No code, no licence file, no public announcement, no ADR drafting other than the staging plan itself.

The staging plan must apply two specific rules carried forward from the founder's first staging attempt — both placed up-front so they govern the whole plan:

**Rule A — Licensing immediately precedes any public open-source release.** Licensing is not a generic Stage 1 item; it is a *gate* placed immediately before the work that goes public with open-sourced code. The licensing decision is made at the moment the substrate is concrete enough to license but before public exposure. Lawyer review at the licensing gate. Nothing public ships without the gate cleared.

**Rule B — Holistic second pass after step-scoping.** Once all stages and steps are scoped step-by-step, the planning session performs a second pass over the whole plan to: (i) check implications across stages, (ii) identify efficiencies (combinable work, redundancies, parallel-work opportunities), (iii) repackage the work into time-bounded sessions rather than step-bounded sessions (sessions end when the time budget is reached or a natural pause point is hit, not when "step N is done"; a session may contain multiple steps; a step may span multiple sessions), (iv) design sessions for minimal mid-session founder input — the founder elects scope at session-open and reviews/approves at session-close; in between, the AI works without needing decisions or clarifications.

Both rules are embedded in the planning method, not the planning output. They shape how the plan is built.

## Pre-conditions

1. **Predecessor session close read.** `/operations/handoffs/founder/2026-05-10-substrate-plugin-architecture-close.md` covers what was agreed (the six decisions) and twenty open questions carried into planning.
2. **Research files re-read if needed.** `/inbox/plugin transcript.rtf` and `/inbox/plugin summary.rtf` ground the plugin paradigm. The five earlier inbox files (`Layer A` through `Layer D` + `sage-intuit.txt`) ground the substrate architecture. `Untitled 4.rtf` is empty and can be ignored.
3. **2026-05-09 predecessor records optionally referenced.** `/operations/handoffs/founder/2026-05-09-substrate-architecture-explore-close.md` and `/operations/handoffs/founder/2026-05-09-substrate-build-staging-NEXT-SESSION-PROMPT.md` are predecessor records; specific items in them have been refined per the 2026-05-10 close. Read only if cross-reference helps.
4. **Standing protocol cache opened.** Tier confirmation, model selection (planning is documentation work; cite the AC1 N/A row), risk class, signals, status vocabulary in scope.
5. **No founder pre-work required.** The planning session uses what's already been decided and recorded. New decisions during the session are welcome but not required.

## Part A — Open under the protocol

Read in order:

1. `/adopted/standing-protocol-cache.md` (~3 min)
2. `/operations/handoffs/founder/2026-05-10-substrate-plugin-architecture-close.md` (~5 min — most recent predecessor close; six decisions, twenty open questions, supersedes/refines from 2026-05-09)
3. `/inbox/plugin transcript.rtf` and `/inbox/plugin summary.rtf` if not already familiar (~10–15 min)

Confirm at open: tier (Standard); hold-point status (P0 0h still active — substrate work happens alongside the hold-point assessment, not after); model selection (planning is documentation; cite the AC1 N/A row); status vocabulary; signals/risk class.

## Part B — Session work: produce the staged build plan

The session has one deliverable: a staged build plan saved as a draft document.

Suggested location: `/drafts/substrate-plugin-staging-plan.md` (drafts folder so it's clearly not yet adopted; preserves the prior `/drafts/stoic-agent-substrate-staging-plan.md` if it exists from the 2026-05-09 attempt — do not overwrite; the new plan is a separate document).

The plan must cover the inventory below. Each element gets, at minimum: a short description, an importance rating, dependencies on other elements, an estimated time/work, a risk class, and a stage assignment.

### Inventory of substrate-as-plugin work

The list below carries forward from the 2026-05-09 inventory and is reorganised under the plugin-as-end-goal architecture. The planning session adds to it, removes from it, refines it, and orders it. The list is not the plan; the plan is the *ordered version* with reasoning, applied through Rule A (licensing gate) and Rule B (holistic second pass).

**A. Backend services and authority infrastructure (closed, server-side)**

- A1. Layer 2 server-side authentication infrastructure for plugin-originated calls
- A2. Layer 2 input validation surface — accepting Layer1Schema; clear error responses
- A3. Layer 2 signing — every authoritative Layer2Assessment is cryptographically signed; verifiers (plugins, downstream agents) can check signatures
- A4. Key management — signing keys managed, rotated, protected
- A5. Layer 3 server-side service — generates prose from Layer 2 output; injects R3 disclaimer + R19 limitations + R20a distress pass-through deterministically
- A6. Layer 3 prose_mode parameter — enum of supported modes (clinical / terse / standard / educational / others); SageReasoning-authored, not community-extensible
- A7. Server-side R20a gate — the second of the three-layer R20a defence; guards Layer 2 API regardless of plugin behaviour
- A8. Existing /api/reason and V3 endpoint family — relationship to substrate; coexist (likely), with each existing endpoint becoming a plugin-internal tool wrapper
- A9. Cost monitoring restoration on the new substrate path (R5) — Layer 1 cost shifts to the plugin; Layer 2 cost is near-zero; Layer 3 cost stays metered

**B. Open Layer 1 reference implementation (open-source)**

- B1. Layer 1 reference hardening — cleaning, commenting, examples, version contracts for external use
- B2. Layer 1 R20a script — first of the three-layer R20a defence; runs locally inside the plugin
- B3. Layer 1 input/output contract documentation — what the plugin's open Layer 1 produces (Layer1Schema) and how it's consumed by the closed Layer 2 API
- B4. Repository structure — single repo, monorepo, or substrate-as-package; how the open Layer 1 is organised for external consumption
- B5. Code-level documentation, examples, contribution guidelines (for community contributions to Layer 1)

**C. Plugin packaging and contents**

- C1. Plugin manifest / metadata — capability declarations, dependencies, version contract
- C2. Plugin skills — the Stoic reasoning workflow skill(s) inside the plugin
- C3. Plugin tools — connectors to the closed Layer 2 + Layer 3 APIs
- C4. Plugin scripts — deterministic checks (the in-plugin R20a from B2; validation; schema-linter)
- C5. Plugin hooks — where the plugin integrates with the agent's loop (impression-capture, action-space-generation, post-action verification, subagent-handoff)
- C6. Plugin assets — open Layer 1 reference (from B); wiki content reference; primary-source citations; starter examples
- C7. Plugin documentation — install guide, getting-started, examples, trust questions, security review status
- C8. Plugin variant strategy — one plugin with mode parameter (evaluative / prescriptive / augmentative-combo) vs a family of plugins; decided at planning

**D. Decision-path mechanisms (plugin features)**

- D1. Action-scorer interface — `score(judgement, candidate_action) → kathekon_assessment` (the sage-intuit pre-decision moment); mirrors human action scorer per Decision 5 carried forward
- D2. Verification interface — Layer B alignment metric: `verify(examined_judgement, response) → alignment_record`
- D3. Subagent handoff payload — Layer C: signed serialisable examined-judgement that travels with delegated tasks
- D4. Concern-radius credential — Layer D: living trail of proximity movement, emitted by the plugin during normal operation
- D5. Acceptance/rejection audit trail — record of which substrate-suggested options the agent accepted or rejected (the augmentative-combo audit trail)

**E. Three-mode access (within plugin)**

- E1. Pure structured mode — agent self-fills Layer1Schema; plugin calls Layer 2 directly
- E2. Hybrid mode — plugin's open Layer 1 fills missing fields; partial agent self-classification
- E3. Pure text mode — plugin runs full open Layer 1 locally; agent provides text only
- E4. Mode selection logic and developer-facing API surface

**F. Translation pattern wiki**

- F1. Wiki structure and pattern format
- F2. Initial pattern corpus — extracted from existing Layer 1 implementation and primary sources
- F3. Wiki governance — curation policy, contribution review, versioning
- F4. Wiki ↔ open Layer 1 code linkage — patterns reference specific extractor logic
- F5. Wiki as test corpus — examples become validation set for translator implementations
- F6. Wiki publication form — embedded asset in plugin and/or freestanding public site

**G. Marketplace and distribution**

- G1. First marketplace target decision — Cowork / Claude Code / Codex / multi-simultaneous; each has different review policies, fees, sandbox capabilities, audiences
- G2. Per-marketplace packaging — plugin format conversions if multiple marketplaces are targeted
- G3. Marketplace listing design — name, description, screenshots, trust signalling, brand presence
- G4. Marketplace review and approval — plugin review processes per marketplace
- G5. Plugin update mechanics and version compatibility — backward compatibility, deprecation paths
- G6. Plugin economics — free-to-install with paid services via connectors; pricing strategy for Layer 2 + Layer 3 service usage; per-call vs subscription

**H. Licensing (gate immediately before any public release — Rule A)**

- H1. Licensing strategy decision — permissive (MIT / Apache) for the open Layer 1 reference, given the moat is on Layer 2 + Layer 3 services
- H2. Plugin licensing — separate from Layer 1 reference; can be proprietary with bundled open components
- H3. Lawyer review — at the licensing gate, before any public release
- H4. Licence files committed to repositories; attribution preserved; trademark posture documented

**Rule A constraint:** H1–H4 are NOT distributed across the plan as Stage 1 items. They are batched as a *gate* placed in the staging plan immediately before the first stage that goes public. Nothing public ships until H1–H4 are cleared.

**I. Public release and standards-formation**

- I1. Public announcement — when, where, with what framing
- I2. Community engagement — Anthropic developer ecosystem, MCP community, philosophy communities, agent-protocol communities
- I3. Standards-formation work for the Layer 1 input contract and credential interoperability — smaller scope under plugin paradigm but still relevant
- I4. Brand and trademark protection — distinguishing open SageReasoning Layer 1 from authoritative SageReasoning Layer 2 + Layer 3 services
- I5. Plugin trust signalling in marketplaces — verified badges, security review status, audit posture

**J. Operational governance**

- J1. ADR for the unified Stoic Agent Substrate concept — captures the architecture
- J2. ADR for the open-Layer-1-only / closed-Layer-3 decision
- J3. ADR for the plugin-as-end-goal decision
- J4. ADR for the three-layer R20a defence
- J5. ADR for the licensing strategy
- J6. R5 cost-as-health-metric impact assessment under the new architecture (Layer 1 cost shifts to plugin; Layer 2 cost near-zero; Layer 3 cost stays metered)
- J7. Manifest amendments — AC additions, new PR rules if needed, project-instructions updates
- J8. Decision-log entries for the six decisions in the 2026-05-10 close
- J9. Migration path for existing sagereasoning.com consumers — coexistence design, no rewrite needed at this stage

### Importance criteria the plan should use

The staging plan must order items by importance, defined here as:

1. **Items that block other work.** Backend authentication and signing (A1–A4) block most plugin features. R20a server-side gate (A7) blocks public release. The first marketplace decision (G1) shapes plugin packaging.
2. **Items that preserve safety.** All three layers of the R20a defence (B2, A7, A5's deterministic injection) are non-negotiable before any public release.
3. **Items that establish moat.** Layer 2 + Layer 3 service infrastructure (A1–A7) is foundational to the value proposition.
4. **Items that prepare for distribution.** Plugin packaging (C), marketplace work (G), and licensing gate (H) come once foundations are ready.
5. **Items that extend the substrate.** Decision-path mechanisms (D), three-mode access (E), wiki (F), and ecosystem polish come after the first plugin ships.

The plan is free to override these defaults with reasoning. The defaults are starting points, not constraints. **Rule A applies regardless:** licensing (H1–H4) sits immediately before the first stage that goes public, wherever in the order that lands.

### Output format expected

The staging plan saved to `/drafts/substrate-plugin-staging-plan.md` should include:

- **Executive summary.** What's being planned, why, what's out of scope.
- **Architecture recap.** One-paragraph statement of the agreed substrate architecture (Layer 1 open / Layer 2 closed / Layer 3 closed; plugin as end-goal; three-layer R20a defence; two front-ends one substrate).
- **Stage-by-stage breakdown.** Stage 1 through Stage N. Each stage with: items in the stage, dependencies, estimated time/work, risk class, success criteria.
- **Licensing gate placement.** Explicitly marked in the stage order, immediately before the first public-release stage.
- **Dependency map.** Which items depend on which.
- **Critical path.** The chain of items that determines overall length.
- **Parallel work opportunities.** Stages or items that can run concurrently.
- **Open questions surfaced during planning** that need founder decision before execution begins.
- **Recommended first three stages** with reasoning.
- **Holistic second-pass review.** A separate section produced AFTER the step-scoping, applying Rule B — implications across stages, efficiencies, time-bounded session repackaging, minimal-founder-input session design, parallel-work confirmation, new risks visible only at the holistic level.

The plan is a draft. Founder reviews, edits, requests changes, and approves. Only an approved plan moves to `/adopted/`.

## Part C — Anticipated session shape

| Phase | Time |
|---|---|
| Cache + predecessor close + research file re-read | 15 min |
| Founder confirms scope and any pre-session position changes | 5 min |
| Inventory pass — confirm the list above is complete; add or remove items | 30 min |
| Dependency mapping — for each item, what does it depend on | 30 min |
| Importance ordering — apply the criteria; produce stage assignments; place the licensing gate per Rule A | 45 min |
| Initial staging draft — write the plan document | 60–90 min |
| **Holistic second pass — Rule B** — review for cross-stage implications, efficiencies, time-bounded session repackaging, minimal-founder-input session design | 45–60 min |
| Founder review of draft + revisions | 30 min |
| Decision-log entry + close | 30 min |
| **Total** | **~5–6 hr** |

If the inventory grows beyond capacity for one session, the planning work is itself staged — Session 1 produces a complete inventory and Stage 1–3 detail with the holistic second pass on those stages; subsequent stages are planned in follow-up sessions with another holistic pass at the end. Founder elects scope at session-open.

The Rule B holistic second pass is essential and must not be skipped, even if the session runs to its time limit. If time pressure forces a choice between completing all step-scoping and performing the second pass, prefer to scope fewer steps and complete the second pass on what was scoped. The second pass is what converts a step-by-step plan into an executable plan.

## Rollback path

`git revert` of the staging plan commit. The plan lives in `/drafts/`; nothing in `/adopted/` is touched. No production impact, no user-facing change, no rollback discipline beyond ordinary version control.

## Forecast

**Most-likely path:** the inventory above is roughly complete; the planning session produces a staging plan with the licensing gate explicitly placed, ordering 5–10 stages spanning an estimated 25–50 build sessions. The Rule B holistic second pass repackages the work into time-bounded sessions of consistent length (e.g., 3–4 hours each) with founder input concentrated at session-open and session-close.

The first three stages are likely:

1. **Stage 1 — Backend foundations.** A1–A4 (Layer 2 authentication, validation, signing, key management), A7 (server-side R20a gate), A8 (V3 endpoint relationship design), A9 (cost monitoring restoration). Blocks most downstream work.
2. **Stage 2 — Layer 3 service + plugin internals.** A5–A6 (Layer 3 service, prose_mode parameter), C1–C5 (plugin manifest, skills, tools, scripts, hooks), B1–B2 (Layer 1 hardening + in-plugin R20a). Builds the substrate's deliverable.
3. **Stage 3 — Plugin packaging and first-marketplace prep.** C6–C8 (assets, documentation, variant strategy), G1 (first marketplace target), G2–G3 (per-marketplace packaging, listing design), B3–B5 (Layer 1 documentation and contribution surface).

The licensing gate (H1–H4) sits immediately after Stage 3 and before Stage 4. Stage 4 is the first stage that goes public.

The decision-path mechanisms (D), three-mode access surface (E), wiki publication (F), and ecosystem polish come in Stages 5+.

**Alternative paths the planning may surface:**

- **First marketplace = Cowork.** Faster to first deliverable; smaller audience initially; uses the Cowork plugin tooling already on the system. Likely the recommended first path.
- **First marketplace = Claude Code.** Larger audience; more stringent review; might require longer Stage 3.
- **Multi-marketplace simultaneous launch.** Maximal reach but multi-times the Stage 3 + licensing gate + public-release work. Probably not first iteration.
- **Plugin variant family vs single configurable plugin.** Each has different complexity profiles in C8 and downstream.

**Recommendation (not prescription):** the planning session is the discipline. The temptation will be to start designing or building during planning. Hold the line: this session is *only* planning. Execution starts in the session after the plan is approved. Rule B (holistic second pass) is what makes the plan executable rather than aspirational; do not skip it under time pressure — prefer scoping fewer steps and completing the pass on what was scoped.

End of prompt.
