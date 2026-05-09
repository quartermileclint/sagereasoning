# Next-Session Prompt — Substrate as Plugin: Detailed Build Staging (Planning Only)

**Stream:** founder.
**Tier:** Standard (planning / governance only — no execution).
**Governing frame:** `/adopted/standing-protocol-cache.md` (operative reference).
**Predecessor session close:** `/operations/handoffs/founder/2026-05-10-substrate-plugin-architecture-close.md`
**Risk classification:** Standard (no production touch this session).
**Supersedes:** `/operations/handoffs/founder/2026-05-09-substrate-build-staging-NEXT-SESSION-PROMPT.md` (the prior staging prompt was scoped against an earlier architecture; preserved on file as predecessor record per the preserve-prior-versions principle).

## Why this session matters

The architecture is now agreed. Layer 1 is open-sourced; Layer 3 stays closed; the substrate is delivered as a plugin (or plugin family) installable via plugin marketplaces. Two front-ends, one substrate: sagereasoning.com for humans, plugins for agents, shared Layer 2 + Layer 3 backend. **And:** once Layer 1, 2, 3 are finalised, every existing SageReasoning product currently using the bundled prose method swaps to the translation-sandwich method — migration is part of this build arc, not separate from it (per Decision 7 in the predecessor close).

This session exists to take the agreed architecture and stage the build into an ordered, dependency-aware plan that subsequent sessions execute. The plan is the artefact. No code, no licence file, no public announcement, no ADR drafting other than the staging plan itself.

This session also formally **validates and approves the build-sessions-protocol-cache** (`/drafts/build-sessions-protocol-cache.md`). The cache is intended to carry across all sessions of this build arc for token efficiency at session-opens — without the cache, each subsequent session would re-read the architecture exploration, the agreed decisions, the rules, and the migration intent, burning tokens unnecessarily. If the cache is approved as written, move it to `/adopted/`. If refinements are needed, refine and then move. If material rework is needed, save the revised version back to `/drafts/` and flag for a follow-up session.

The staging plan must apply two specific rules carried forward from the founder's first staging attempt — both placed up-front so they govern the whole plan:

**Rule A — Licensing immediately precedes any public open-source release.** Licensing is not a generic Stage 1 item; it is a *gate* placed immediately before the work that goes public with open-sourced code. The licensing decision is made at the moment the substrate is concrete enough to license but before public exposure. Lawyer review at the licensing gate. Nothing public ships without the gate cleared.

**Rule B — Holistic second pass after step-scoping.** Once all stages and steps are scoped step-by-step, the planning session performs a second pass over the whole plan to: (i) check implications across stages, (ii) identify efficiencies (combinable work, redundancies, parallel-work opportunities), (iii) repackage the work into time-bounded sessions rather than step-bounded sessions (sessions end when the time budget is reached or a natural pause point is hit, not when "step N is done"; a session may contain multiple steps; a step may span multiple sessions), (iv) design sessions for minimal mid-session founder input — the founder elects scope at session-open and reviews/approves at session-close; in between, the AI works without needing decisions or clarifications.

Both rules are embedded in the planning method, not the planning output. They shape how the plan is built.

## Pre-conditions

1. **Predecessor session close read.** `/operations/handoffs/founder/2026-05-10-substrate-plugin-architecture-close.md` covers what was agreed (now eight decisions, with Decision 7 adding the migration intent and Decision 8 noting the cache creation) and twenty open questions carried into planning.
2. **Build-sessions-protocol-cache read.** `/drafts/build-sessions-protocol-cache.md` is the new build-arc cache; this session validates it. Read it carefully — it carries the architecture, decisions, rules, and migration intent in a form intended to be the standing reference for every subsequent build-arc session.
3. **Standing protocol cache opened.** `/adopted/standing-protocol-cache.md` — the general session protocol (model selection, KG register, signals, risk classification, lean templates). Tier confirmation, model selection (planning is documentation work; cite the AC1 N/A row), risk class, signals, status vocabulary in scope.
4. **Component registry read.** `/website/public/component-registry.json` is the source of truth for what products exist (191 components), their current statuses (`scoped → designed → scaffolded → wired → verified → live`), dependencies, blockers. The K-category (migration of bundled-prose consumers) is built against this registry. The planning session must identify which components currently use bundled prose vs translation-sandwich vs are in transitional states. Skim at session-open; deep-read the bundled-prose entries during K-category scoping.
5. **The two manuals read** — at session-open or during K-category scoping:
   - `/users-guide-to-sagereasoning.md` — what each product does for practitioners; intended use; audience. Parts Two and Four describe the product surface.
   - `/summary-tech-guide.md` — operational/technical manual; Section 1 (File Map) names the API surface and what each route directs.
   - `/summary-tech-guide-addendum-context-and-memory.md` — addendum; relevant for migration of context-dependent consumers.
6. **Research files re-read if needed.** `/inbox/plugin transcript.rtf` and `/inbox/plugin summary.rtf` ground the plugin paradigm. The five earlier inbox files (`Layer A` through `Layer D` + `sage-intuit.txt`) ground the substrate architecture. `Untitled 4.rtf` is empty and can be ignored.
7. **2026-05-09 predecessor records optionally referenced.** `/operations/handoffs/founder/2026-05-09-substrate-architecture-explore-close.md` and `/operations/handoffs/founder/2026-05-09-substrate-build-staging-NEXT-SESSION-PROMPT.md` are predecessor records; specific items in them have been refined per the 2026-05-10 close. Read only if cross-reference helps.
8. **No founder pre-work required.** The planning session uses what's already been decided and recorded. New decisions during the session are welcome but not required. Founder's optional pre-skim of the component-registry and Users' Guide Parts Two and Four (per the close's Founder Verification block) may help if founder wants to pre-form views on migration sequencing.

## Part A — Open under the protocol

Read in order:

1. `/adopted/standing-protocol-cache.md` (~3 min — general session protocol)
2. `/drafts/build-sessions-protocol-cache.md` (~5 min — build-arc-specific cache; this session validates it)
3. `/operations/handoffs/founder/2026-05-10-substrate-plugin-architecture-close.md` (~5 min — most recent predecessor close; eight decisions, twenty open questions, supersedes/refines from 2026-05-09)
4. `/website/public/component-registry.json` skim — focus on components with `engine: bundled` or where the description names the bundled-prose method; flag for K-category scoping (~10 min skim; deeper during K-category)
5. `/users-guide-to-sagereasoning.md` and `/summary-tech-guide.md` — Parts Two and Four of users guide; Section 1 of tech guide; consult during K-category scoping (~10 min if pre-read; can defer to inventory pass)
6. `/inbox/plugin transcript.rtf` and `/inbox/plugin summary.rtf` if not already familiar (~10–15 min)

Confirm at open: tier (Standard); hold-point status (P0 0h still active — substrate work happens alongside the hold-point assessment, not after); model selection (planning is documentation; cite the AC1 N/A row); status vocabulary; signals/risk class. Confirm the build-sessions-protocol-cache is the operative reference for this and subsequent build-arc sessions.

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
- J6. R5 cost-as-health-metric impact assessment under the new architecture (Layer 1 cost shifts to plugin; Layer 2 cost near-zero; Layer 3 cost stays metered; per-consumer cost shifts as K-category migrations land)
- J7. Manifest amendments — AC additions, new PR rules if needed, project-instructions updates
- J8. Decision-log entries for the eight decisions in the 2026-05-10 close
- J9. Build-sessions-protocol-cache validation and movement to `/adopted/`

**K. Migration of existing bundled-prose consumers to translation-sandwich**

This category implements Decision 7 from the 2026-05-10 close. Source-of-truth: `/website/public/component-registry.json`. Reference materials: `/users-guide-to-sagereasoning.md` Parts Two + Four; `/summary-tech-guide.md` Section 1; `/summary-tech-guide-addendum-context-and-memory.md`.

- K1. Inventory of bundled-prose consumers from the component-registry — which endpoints, which pages, which agent surfaces still use bundled prose vs which have already migrated to translation-sandwich vs which are in transitional states
- K2. Per-consumer migration plan template (mirrors the M1-CP1–CP6 pattern that migrated `/api/reason`)
- K3. Migration sequencing strategy — which consumers first (criteria: criticality to users, safety surface, cost impact, engineering complexity, dependencies on substrate refinements). Most plausible: the V3 endpoint family (`/api/score`, `/api/score-decision`, `/api/score-document`, `/api/score-scenario`, `/api/score-social`, `/api/guardrail`, `/api/score-iterate`) before the mentor surfaces (`/api/reflect`, `/api/mentor/private/reflect`) since the latter touch R17 intimate-data boundaries
- K4. Verification methodology per migration — mirrors the M1-CP6 pattern (consumer-page audit + payload-shape adaptation + post-deploy verification)
- K5. Cost impact assessment per migration — Sonnet → Sonnet+Sonnet (substrate runs Layer 1 + Layer 3 server-side for website front-end, since the website doesn't run an open-Layer-1 plugin); cost increase per call but architectural consistency. R5 cost-as-health-metric implications.
- K6. Migration ↔ plugin-build interaction — does the plugin work depend on K-category being substantially complete? Probably yes for the agent-facing plugin, since the plugin's open Layer 1 must produce input that all the Layer 2 endpoints accept consistently. Order this in the staging plan deliberately.
- K7. Substrate refinements driven by migration findings — each consumer migration may surface Layer 1 / Layer 2 / Layer 3 limitations that need fixing in the substrate itself. Migration is iterative refinement of the substrate, not just "swap and done."
- K8. Feedback loop into the build inventory — migration findings may add or modify items in categories A through J.

### Importance criteria the plan should use

The staging plan must order items by importance, defined here as:

1. **Items that block other work.** Backend authentication and signing (A1–A4) block most plugin features. R20a server-side gate (A7) blocks public release. The first marketplace decision (G1) shapes plugin packaging. K-category migration of consumers using the bundled engine may need to advance ahead of plugin work because the plugin's open Layer 1 must produce input that all the Layer 2 endpoints accept consistently.
2. **Items that preserve safety.** All three layers of the R20a defence (B2, A7, A5's deterministic injection) are non-negotiable before any public release.
3. **Items that establish moat.** Layer 2 + Layer 3 service infrastructure (A1–A7) is foundational to the value proposition.
4. **Items that finalise the substrate.** K-category migration is part of finalising Layers 1, 2, 3 — each migration may surface substrate limitations that need fixing. Migration findings feed back into A, B, and other categories.
5. **Items that prepare for distribution.** Plugin packaging (C), marketplace work (G), and licensing gate (H) come once foundations are ready and substrate is finalised.
6. **Items that extend the substrate.** Decision-path mechanisms (D), three-mode access (E), wiki (F), and ecosystem polish come after the first plugin ships.

The plan is free to override these defaults with reasoning. The defaults are starting points, not constraints. **Rule A applies regardless:** licensing (H1–H4) sits immediately before the first stage that goes public, wherever in the order that lands.

### Output format expected

The staging plan saved to `/drafts/substrate-plugin-staging-plan.md` should include:

- **Executive summary.** What's being planned, why, what's out of scope.
- **Architecture recap.** One-paragraph statement of the agreed substrate architecture (Layer 1 open / Layer 2 closed / Layer 3 closed; plugin as end-goal; three-layer R20a defence; two front-ends one substrate; K-category migration of bundled-prose consumers part of substrate finalisation).
- **Stage-by-stage breakdown.** Stage 1 through Stage N. Each stage with: items in the stage, dependencies, estimated time/work, risk class, success criteria. K-category items distributed appropriately across stages or batched as a stage of their own.
- **Licensing gate placement.** Explicitly marked in the stage order, immediately before the first public-release stage.
- **Dependency map.** Which items depend on which. K-category interactions with substrate refinements (A, B) and plugin work (C–E) named explicitly.
- **Critical path.** The chain of items that determines overall length.
- **Parallel work opportunities.** Stages or items that can run concurrently.
- **Open questions surfaced during planning** that need founder decision before execution begins.
- **Recommended first three stages** with reasoning.
- **Holistic second-pass review.** A separate section produced AFTER the step-scoping, applying Rule B — implications across stages, efficiencies, time-bounded session repackaging, minimal-founder-input session design, parallel-work confirmation, new risks visible only at the holistic level.
- **Build-sessions-protocol-cache validation outcome.** Whether the cache (`/drafts/build-sessions-protocol-cache.md`) was approved as written, refined, or needs material rework. If approved or refined, move to `/adopted/`. If material rework, save revisions to `/drafts/` and flag for follow-up.

The plan is a draft. Founder reviews, edits, requests changes, and approves. Only an approved plan moves to `/adopted/`. The build-sessions-protocol-cache, once approved, becomes the operative reference for every subsequent build-arc session and is updated in-session whenever the underlying records change.

## Part C — Anticipated session shape

| Phase | Time |
|---|---|
| Standing cache + build-sessions cache + predecessor close + research file re-read | 20 min |
| Component-registry skim + manuals consult (or deferred to inventory pass) | 15 min |
| Founder confirms scope and any pre-session position changes | 5 min |
| Build-sessions-protocol-cache validation pass | 15 min |
| Inventory pass — confirm categories A–K are complete; add or remove items; identify K-category bundled-prose consumers from registry | 45 min |
| Dependency mapping — for each item, what does it depend on; K-category ↔ substrate ↔ plugin interactions | 30 min |
| Importance ordering — apply the criteria; produce stage assignments; place the licensing gate per Rule A | 45 min |
| Initial staging draft — write the plan document | 60–90 min |
| **Holistic second pass — Rule B** — review for cross-stage implications, efficiencies, time-bounded session repackaging, minimal-founder-input session design | 45–60 min |
| Build-sessions-protocol-cache moved to `/adopted/` (or refined and re-saved) | 5 min |
| Founder review of draft + revisions | 30 min |
| Decision-log entry + close | 30 min |
| **Total** | **~6–7 hr** |

If the inventory grows beyond capacity for one session, the planning work is itself staged — Session 1 produces a complete inventory (including the K-category) and Stage 1–3 detail with the holistic second pass on those stages; subsequent stages are planned in follow-up sessions with another holistic pass at the end. Founder elects scope at session-open.

The Rule B holistic second pass is essential and must not be skipped, even if the session runs to its time limit. If time pressure forces a choice between completing all step-scoping and performing the second pass, prefer to scope fewer steps and complete the second pass on what was scoped. The second pass is what converts a step-by-step plan into an executable plan.

The build-sessions-protocol-cache validation should happen early in the session (after reads, before deep planning) so that subsequent build-arc sessions inherit a stable cache.

## Rollback path

`git revert` of the staging plan commit. The plan lives in `/drafts/`; nothing in `/adopted/` is touched. No production impact, no user-facing change, no rollback discipline beyond ordinary version control.

## Forecast

**Most-likely path:** the inventory above is roughly complete; the planning session produces a staging plan with the licensing gate explicitly placed, ordering 6–12 stages (more than the prior estimate due to the K-category) spanning an estimated 35–70 build sessions. The Rule B holistic second pass repackages the work into time-bounded sessions of consistent length (e.g., 3–4 hours each) with founder input concentrated at session-open and session-close.

The first three stages are likely:

1. **Stage 1 — Backend foundations.** A1–A4 (Layer 2 authentication, validation, signing, key management), A7 (server-side R20a gate), A8 (V3 endpoint relationship design), A9 (cost monitoring restoration), A5–A6 (Layer 3 service + prose_mode parameter as substrate matures). Blocks K-category and plugin work both. K1 (inventory of bundled-prose consumers from component-registry) likely happens here too.
2. **Stage 2 — K-category migration begins.** K2–K7 — per-consumer migration plans, sequencing, verification, cost impact, plus substrate refinements driven by migration findings (feeds back into A and B). The V3 endpoint family migrates first (per K3 plausible sequencing), then mentor surfaces.
3. **Stage 3 — Layer 1 hardening + plugin internals.** B1–B2 (Layer 1 hardening + in-plugin R20a), B3–B5 (Layer 1 documentation, repository structure, contribution surface), C1–C5 (plugin manifest, skills, tools, scripts, hooks). Substrate is now finalised; plugin internals can be built against it confidently.

K-category and plugin-internals work may run partially in parallel once the substrate is mature enough to support both.

The licensing gate (H1–H4) sits immediately before the first stage that goes public — likely after Stage 3 and before plugin packaging / marketplace work, but the planning session decides exactly where based on what's actually being released first.

The decision-path mechanisms (D), three-mode access surface (E), wiki publication (F), and ecosystem polish come after the first plugin ships.

**Alternative paths the planning may surface:**

- **First marketplace = Cowork.** Faster to first deliverable; smaller audience initially; uses the Cowork plugin tooling already on the system. Likely the recommended first path.
- **First marketplace = Claude Code.** Larger audience; more stringent review; might require longer Stage 3.
- **Multi-marketplace simultaneous launch.** Maximal reach but multi-times the Stage 3 + licensing gate + public-release work. Probably not first iteration.
- **Plugin variant family vs single configurable plugin.** Each has different complexity profiles in C8 and downstream.
- **K-category migration in parallel with plugin work, or strictly sequential.** Parallel risks substrate divergence; strictly sequential delays plugin shipping. Planning session decides.

**Recommendation (not prescription):** the planning session is the discipline. The temptation will be to start designing or building during planning. Hold the line: this session is *only* planning. Execution starts in the session after the plan is approved. Rule B (holistic second pass) is what makes the plan executable rather than aspirational; do not skip it under time pressure — prefer scoping fewer steps and completing the pass on what was scoped. The build-sessions-protocol-cache validation should happen early so the cache is stable when the planning detail begins.

End of prompt.
