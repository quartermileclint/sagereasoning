# Substrate-as-Plugin Staging Plan

**Status:** Adopted 2026-05-10 under `D-STAGING-PLAN-ADOPTED-2026-05-10`. **Amended 2026-05-12 under `D-STAGING-PLAN-AMENDED-FROM-ST2-2026-05-12`** incorporating the ST2 stress-test triage (57 items in ALLOW / REVISE / BLOCK / ESCALATE framework).
**Predecessor on file:** `/archive/2026-05-09-stoic-agent-substrate-staging-plan-superseded.md` (moved from `/drafts/` 2026-05-10) and `/archive/2026-05-12-staging-plan-amendments-source-of-amendment.md` (the ST2 amendment source draft, archived at adoption). Original adopted plan is preserved in git history.
**Governing frame:** `/adopted/standing-protocol-cache.md` + `/adopted/build-sessions-protocol-cache.md`.
**Decision basis:** the eight decisions/directions in `/operations/handoffs/founder/2026-05-10-substrate-plugin-architecture-close.md`; Rule A (licensing gate) and Rule B (holistic second pass) embedded in the planning method; ST2 Phase 3 four-outcome triage (57 items) per `/operations/handoffs/founder/2026-05-12-build-plan-stress-test-ST2-close.md`.

---

## Executive summary

This plan stages the build of the Stoic Agent Substrate as a plugin (or plugin family) installable via plugin marketplaces, alongside the migration of every existing SageReasoning product currently using the bundled-prose method to the translation-sandwich method. The plan covers six stages (with a licensing gate sitting between Stage 3 and Stage 4), an estimated **~48–77 build sessions** (revised upward from the original 38–62 estimate following ST2's Stage 1 expansion), and a critical path running through backend foundations → Critical-gap closures → product migration → Layer 1 hardening → plugin internals → licensing gate → first marketplace listing → public open-source release → ecosystem polish. A parallel pre-launch founder-personal-exposure track runs alongside the substrate work and gates Stage 4 G4 approval.

What is in scope: every aspect of taking the agreed substrate architecture from "agreed on paper" to "first plugin shipped in a marketplace, Layer 1 reference open-sourced under a permissive licence, every existing product on the new substrate." Plus: the foundational governance + protection items (legal entity; insurance; TOS) that gate any marketplace approval.

What is out of scope: post-launch ecosystem growth (community moderation, conference talks, partner integrations) beyond the minimum needed for a first credible release; multi-marketplace expansion beyond the third listing; any Sage Ops activation that follows from P7 in the project priorities.

The plan is **not** a launch-readiness review. It does not certify completion. It is a staged map of work to be executed in subsequent sessions.

---

## Architecture recap (for orientation)

The Stoic Agent Substrate has three layers. Layer 1 (text → structured features) is **open-sourced** under permissive licensing. Layer 2 (deterministic mechanism application) and Layer 3 (prose generation) are **closed and server-side**. The R20a distress perimeter operates as a three-layer defence: in-plugin script (fast local), server-side gate guarding Layer 2 (compliance), and Layer 3 deterministic injection of the distress pass-through statement (final enforcement). Two front-ends share one substrate: `sagereasoning.com` for human practitioners, plugins for agent developers — both call the same Layer 2 + Layer 3 backend services. Once the substrate is finalised, every existing SageReasoning product currently on the bundled-prose method swaps to the translation-sandwich method (the K-category).

---

## Stage-by-stage breakdown

### Stage 1 — Backend foundations + Critical-gap closures (EXPANDED per ST2)

**Why first:** The closed Layer 2 + Layer 3 services are the moat. Nothing else can land until they are authoritative, signed, R20a-gated, and instrumented for cost. K-category migration depends on them. Plugin work depends on them. The website front-end (already on translation-sandwich for `/api/reason`) depends on the substrate being mature enough to migrate the rest of its surface. ST2 Phase 3 Q3 election: **Stage 1 expanded to absorb Critical-gap closures before Stage 2 K-category migration broadens substrate exposure.**

**Existing items (A1-A9 unchanged; A1-A4 Verified at ST2 close):**

| # | Item | Description | Risk | Est. sessions | Status |
|---|---|---|---|---|---|
| A1 | Layer 2 server-side authentication infrastructure | Accept plugin-originated calls; existing user-auth pattern extended for plugin-originated traffic; dual-auth (KG4) as the canonical pattern | Critical (auth) | 2-3 | Verified |
| A2 | Layer 2 input validation surface | Accept Layer1Schema; clear error responses; type-enforced via constraints.ts pattern | Elevated | 1-2 | Verified |
| A3 | Layer 2 signing | Every authoritative Layer2Assessment cryptographically signed; verifiers (plugins, downstream agents) check signatures | Critical (crypto) | 2-3 | Verified |
| A4 | Key management | Signing keys managed, rotated, protected; rotation procedure documented | Critical (crypto) | 1-2 | Verified |
| A5 | Layer 3 server-side service | Generates prose from Layer 2 output; injects R3 disclaimer + R19 limitations + R20a distress pass-through deterministically | Critical (R20a) | 2-3 | Scoped |
| A6 | Layer 3 `prose_mode` parameter | Enum of supported modes (clinical / terse / standard / educational); SageReasoning-authored, not community-extensible | Standard | 1 | Scoped |
| A7 | Server-side R20a gate | Layer 2 of the three-layer R20a defence; guards Layer 2 API regardless of plugin behaviour | Critical (R20a / PR6) | 2 | Scoped |
| A8 | V3 endpoint relationship design | Decide how each existing /api/score-* endpoint becomes a plugin-internal tool wrapper after migration; produce the mapping document | Standard | 1 | Scoped |
| A9 | Cost monitoring restoration on the new substrate path (R5) | Layer 1 cost shifts to plugin; Layer 2 cost near-zero; Layer 3 cost stays metered; R5 cost-as-health-metric alerts re-pointed | Elevated | 1-2 | Scoped |
| K1 | Inventory of bundled-prose consumers from registry | Read /website/public/component-registry.json + manuals; produce an authoritative list of consumers needing migration with current statuses | Standard | 1 | Scoped |
| J1 | ADR — Stoic Agent Substrate concept (Character Kernel category) | Captures the three-layer architecture, moat boundaries, the substrate's structural role, and the Character Kernel category label (per ST2 election; see `/adopted/adr/2026-05-12-substrate-category-character-kernel.md`) | Standard | 1 | Designed (ADR adopted 2026-05-12) |
| J6 | R5 cost-as-health-metric impact assessment | New cost shape under translation-sandwich + plugin paradigm; revenue:cost ratio implications; alert threshold updates | Standard | 1 | Scoped |

**NEW items added in ST2 expansion (A10-A19):**

#### A10 — Per-agent credentials + revocation + identity discrimination (NEW; Critical)

**Source:** ST2 Phase 2 Domain 1 S1 (REVISE election). Phase 1.5 G1 + G2 + T3-9 + T3-10 (Critical judge-layer gaps).

**Scope:**
- Replace single `PLUGIN_AUTH_SECRET` with per-install token issuance
- Per-token metadata: `identity_type` (human | agent), `install_id`, `scope` (assessment-only | mentor-also | admin)
- Revocation list checked at every authenticated call (Redis-backed or Supabase row read)
- Admin-only revocation API + revocation runbook mirroring rotation runbook
- Token format ADR drafted before implementation. Candidate formats: JWT (HMAC or asymmetric); W3C Verifiable Credentials; AP2-style mandate (Google's spec for agent authorization records — scope + constraints + proof of approval; per the 2026-05-12 agentic-commerce inbox synthesis close); hybrid.

**Pre-conditions:** Token format ADR adopted (open question; revisit at A10 kickoff).
**Stage 1 sequencing:** Lands AFTER A5 (Layer 3 service) wires up; BEFORE Stage 2 K-category migration broadens substrate exposure to multiple consumers.
**Closes:** Phase 1.5 G1 + G2; T3-9 + T3-10; Phase 2 S1. Critical under PR6 + AC7 (auth surface).
**Risk:** Critical. **Est. sessions:** 2-3.

#### A11 — Endpoint-auth inventory + JSON-key SQL audit + prompt-injection defence (NEW)

Decomposed from ST2 Phase 2 Domain 1 S2 (REVISE → S2a Standard + S2b Critical).

**A11a — Audits (Standard).**
- Endpoint-auth inventory: list every route in `/website/src/app/api/`; classify each as authenticated / unauthenticated / public-by-design
- CI check on PRs to flag any new unauthenticated route (`/security-review` GitHub Action candidate per ST2 Phase 2.5 Candidate 1)
- JSON-key SQL injection audit: code-review pass on all `from()` + `select()` calls in Supabase queries; verify input parameters never reach JSON key paths unescaped
- Closes Phase 1.5 G3 + G4; T3-11 + T3-12.

**A11b — Prompt-injection defence at Layer 1 + Layer 3 (Critical; PR6 engages).**
- Layer 1 (extractFeatures): adversarial-input testing for prompt-injection patterns ("ignore previous instructions"; tool-call escape attempts); structured-output sanitisation
- Layer 3 (sage-prose-engine): consumer-context sanitisation; output validation against injection-of-prompts-into-prose
- Closes Phase 1.5 G6; T3-13 + T3-14.

**Risk:** A11a Standard + A11b Critical. **Est. sessions:** A11a 1; A11b 2.

#### A12 — OpenTelemetry GenAI semantic conventions + call-grain audit (NEW; Elevated)

**Source:** ST2 Phase 2 Domain 5 O1 (ALLOW). Cross-cuts P1 (DPIA — call-grain audit logging) + S1 (behavioural baselines) + A9 (cost monitoring).

**Scope:**
- Adopt OpenTelemetry GenAI semantic conventions for substrate operations
- Auto-instrumentation for Anthropic SDK calls
- Trace propagation: Layer 1 → Layer 2 → Layer 3 → Supabase write (correlation IDs)
- Per-call audit logging: structured logs with decision event + context + masked sensitive data + immutable storage
- A9 cost-monitoring expanded: per-call cost tracking; per-identity baseline behavioural metrics

**Stage 1 sequencing:** After A10 (per-agent credentials provide identity for per-identity tracking); before Stage 2.
**Risk:** Elevated. **Est. sessions:** 1-2.

#### A13 — R5 cost-as-health-metric alerts (NEW; Elevated)

**Source:** ST2 Phase 2 Domain 5 O2 (ALLOW). Depends on A12.

**Scope:**
- Revenue-to-cost ratio threshold: <2x → alert (per R5)
- Per-call cost threshold: >2x baseline → alert
- Daily total cost threshold: >budgeted cap → alert
- Per-identity cost anomaly detection (identity X spending Nx its baseline)
- Alerts delivered via configured channel (email; later: Slack / PagerDuty)

**Risk:** Elevated. **Est. sessions:** 1.

#### A14 — SLOs + error-budget discipline (NEW; Standard governance + Elevated implementation)

**Source:** ST2 Phase 2 Domain 5 O3 (ALLOW).

**Scope:**
- Per-surface SLOs documented (e.g., `/api/reason` p95 latency <3s; `/api/public-key` p95 <100ms; R20a synchronous distress classifier p95 <500ms per AC2)
- Error budgets per surface (e.g., 99.5% success rate per surface = ~4 hours error budget per quarter)
- Discipline: when error budget burns >50% in a quarter, freeze new feature work for that surface until reliability restored

**Risk:** Standard governance / Elevated implementation. **Est. sessions:** 1-2.

#### A15 — R17 expansion: SAR + rectification + portability (NEW; Critical; R17 surface)

**Source:** ST2 Phase 2 Domain 4 P2 (REVISE — phased). Cross-cuts R1 (R17c deletion endpoint bring-forward).

**Phased sequencing:**
- **A15a** — R17c genuine deletion endpoint (bring-forward from P2 priority 2d). Replaces 503 placeholder. Critical.
- **A15b** — R17g access (SAR — GDPR Article 15). Standard contract, Critical surface.
- **A15c** — R17h rectification (GDPR Article 16). Standard contract, Critical surface.
- **A15d** — R17i portability (GDPR Article 20). Most complex; structured-export contract; Critical surface.

**Closes:** Phase 1.5 T4-4; Phase 2 R1 + P2.
**Risk:** Critical per sub-stage. **Est. sessions:** A15a 1; A15b 1; A15c 1; A15d 2. Total 5.

#### A16 — Privacy governance pass (NEW; Standard; lawyer-coupled)

**Source:** ST2 Phase 2 Domain 4 P1 + P3 + P4 (ALLOW).

**Scope:**
- **A16a** — DPIA + substrate data-flow diagram (lawyer-coupled per Q4)
- **A16b** — ISO/IEC 27701:2025 informal alignment mapping
- **A16c** — Sub-processor DPA register (Anthropic + Supabase + Vercel; founder as controller; user-facing privacy policy lists sub-processors)

**Risk:** Standard. **Est. sessions:** 2.

#### A17 — Regulatory governance pass (NEW; Standard; lawyer-coupled)

**Source:** ST2 Phase 2 Domain 2 R2 + R4 (ALLOW / REVISE).

**Scope:**
- **A17a** — Manifest CR-### register populated with live binding obligations (GDPR Article 17; EAA WCAG 2.1 AA; Australia Privacy Act 1988; EU AI Act Article 50; CCPA deletion rights) — drafted in ST2 manifest amendments
- **A17b** — EU AI Act Article 50 transparency posture (lawyer-coupled; specific language deferred to lawyer engagement)
- **A17c** — R14 quarterly review cadence operationalised (next-due 2026-07-06 per manifest header)

**Risk:** Standard. **Est. sessions:** 2.

#### A18 — Onboarding + limitations governance pass (NEW; Standard → Elevated)

**Source:** ST2 Phase 2 Domain 9 U1 + U2 + U3 (ALLOW). Cross-cuts A3 (cognitive accessibility).

**Scope:**
- **A18a** — Sagereasoning.com first-run experience designed + built (U1)
- **A18b** — R19c limitations page + R19d mirror principle in mentor prompts (P2 priority 2e bring-forward)
- **A18c** — R20b framework-dependence detection + coaching (Elevated; mentor-behaviour change; PR6 applies)
- **A18d** — Accessibility statement page (A2)
- **A18e** — Cognitive-accessibility design pass on mentor + assessment surfaces (A3)

**Risk:** Mixed Standard / Elevated (A18c). **Est. sessions:** 3-4.

#### A19 — Abuse-detection + rate-limiting (NEW; Elevated)

**Source:** ST2 Phase 2 Domain 8 M4 (ALLOW). Cross-cuts A10 (per-agent credentials).

**Scope:**
- Per-identity rate-limit (depends on A10's identity surface)
- Reverse-engineering probe detection (systematic prompt enumeration; rapid variations of same input)
- Abuse-response: rate-limit; revoke; alert

**Risk:** Elevated. **Est. sessions:** 1-2.

#### Stage 1 close (NEW gating step)

Per ST2 Q4 lawyer-engagement bring-forward election: **lawyer engagement begins at Stage 1 close.** Lawyer reviews:
- R4 / A17 regulatory posture (CR-### register; Article 50 language)
- P1 / A16 privacy work (DPIA; sub-processor DPAs; ISO 27701 mapping)
- M1 TOS + liability allocation (parallel-track item — see below)
- L1 Pty Ltd structure recommendation (parallel-track item)
- R3 / A1 EU customer plausibility decision (gates EAA + WCAG work)

**Stage 1 close exit criteria:**
1. All A10-A19 sub-stages Verified
2. Lawyer engagement initiated + first-review report delivered
3. EU customer plausibility decision recorded
4. Parallel pre-launch founder-personal-exposure track has at least L1 ADR + I1 quote received

**Stage 1 dependencies:** A2 depends on A1. A3 depends on A1 + A4. A5 depends on A2 + A7 (so Layer 3 only runs on validated, R20a-gated, Layer-2-signed input). A6 depends on A5. A8 depends on K1. A9 depends on A1–A5 being at least Scaffolded. **A10 depends on A5 wired.** **A11b depends on A5 + A10.** **A12 depends on A10.** **A13 depends on A12.** **A15a depends on A10 (identity discrimination).** **A19 depends on A10.**

**Stage 1 success criteria (expanded):**
- Layer 2 accepts authenticated, validated plugin-originated calls (existing)
- Every Layer 2 response is cryptographically signed and verifiable (existing)
- Layer 3 generates prose with R3 + R19 + R20a injections deterministically; supports `prose_mode` (existing)
- Server-side R20a gate live (PR1 single-endpoint proof first) (existing)
- Cost monitoring restored; alerts re-pointed; R5 health-metric ratio tracked (existing)
- ADR for the substrate concept adopted; bundled-prose consumer inventory produced (existing)
- **A10-A19 sub-stages all Verified (NEW)**
- **Stage 1 close gating step completed (NEW)**

**Stage 1 estimated total (revised):** **~28-40 sessions** (was 16-24; expansion adds 10-15 sessions per ST2 Phase 2 Cross-cutting Observation 2).

**Stage 1 risk profile:** Mostly Critical. PR1 (single-endpoint proof) applies — A1, A3, A5, A7, A10, A11b each get proven on one endpoint before any rollout. PR6 applies to A7, A10, A11b, A15a-d, A18c. AC5 perimeter rules apply.

---

### Stage 2 — K-category migration (DELAYED START; scope unchanged)

**Why second:** The substrate is now finalised at the API level AND Critical-gap closures from Stage 1 expansion are complete. Every existing consumer can be migrated. Migration findings feed back into substrate refinement (Stage 1 may receive amendments). The website front-end gets onto the new substrate before the agent-facing plugin is built, which means the website is the proving ground for the substrate's stability under real load.

**ST2 sequencing implication:** Stage 2 start blocked by Stage 1 close exit criteria. K-category migration is the first work that broadens substrate exposure beyond founder + test logins. Stage 1's A10 (per-agent credentials) must be Verified before K-category migration begins, so each migrated consumer can be issued its own credential.

**Migration tiers (from K1 inventory and component-registry.json):**

**Tier 1 — Already migrated (M1-CP6 cutover 2026-05-08):**
- `/api/reason` (sage-reason). Verified end-to-end. Reference for migration methodology.

**Tier 2 — Phase-2 in progress (per AC-19 load-bearing build order):**
- `/api/mentor/private/reflect` — Phase-2 pass 1; load-bearing first build for Phase-2 of the alt-3 architecture; D24 audit names this as one of two endpoints requiring snapshot before Phase-2 begins
- conversation surface — Phase-2 pass 2

**Tier 3 — R20a perimeter routes (per AC5; Phase-3+ scope):**
- `/api/score` (sage-score)
- `/api/score-decision` (sage-decide)
- `/api/score-document` (sage-audit) — independent of shared engine
- `/api/score-scenario` (sage-scenario)
- `/api/score-social` (sage-filter) — D11 per-consumer projection rules including reader_triggered_passions invitation-language framing per R20d
- `/api/guardrail` (sage-guard) — uses Haiku; KG2 boundary applies
- `/api/reflect` (sage-reflect, public) — D24 audit found Critical PR6 issues (fire-and-forget on safety-relevant log; user_id vs auth.user.id mismatch) requiring resolution before or during migration

**Tier 4 — Outside the AC5 perimeter:**
- `/api/score-conversation` (sage-converse)
- `/api/score-iterate` (sage-iterate) — chain state, independent by necessity; multi-turn transformation pattern must be preserved by migration design

**Tier 5 — Skill wrappers (15 endpoints under /api/skill/*):**
- sage-classify, sage-coach, sage-compliance, sage-educate, sage-govern, sage-identity, sage-invest, sage-moderate, sage-negotiate, sage-pivot, sage-premortem, sage-prioritise, sage-resolve, sage-retro, plus sage-reason itself if applicable
- These wrap sage-reason. Migration is largely "verify wrapper handles new payload shape" plus per-skill receipts/adapters as needed.

**Tier 6 — Assessments:**
- `/api/assessment/foundational` (sage-diagnose, 14- or 55-question)
- `/api/assessment/full` (sage-profile, writes to DB; R17 partial)

**Items in this stage:**

| # | Item | Description | Risk | Est. sessions |
|---|---|---|---|---|
| K2 | Per-consumer migration plan template | Mirrors the M1-CP1–CP6 pattern from /api/reason migration | Standard | 1 |
| K3 | Migration sequencing strategy | V3 endpoint family first (less R17 exposure); mentor surfaces last (most sensitive); per-tier gating | Standard | 1 |
| K4 | Verification methodology per migration | Mirrors M1-CP6 (consumer-page audit + payload-shape adaptation + post-deploy verification) | Standard | 1 |
| K5 | Cost impact assessment per migration | Sonnet → Sonnet+Sonnet (substrate runs Layer 1 + Layer 3 for website front-end since site doesn't ship a plugin); per-call cost increase quantified; R5 implications | Standard | 1 |
| K6 | Migration ↔ plugin-build interaction design | Does plugin work block on K? Probably partially — plugin's open Layer 1 must produce input that all migrated Layer 2 endpoints accept consistently | Standard | 1 |
| K7 | Substrate refinements driven by migration findings | Each migration may surface Layer 1 / 2 / 3 limitations to fix; this is iterative refinement, not "swap and done" | Elevated | 2-3 |
| K8 | Feedback loop into build inventory | Migration findings may add or modify items in categories A through J | Standard | continuous |
| Migrate Tier 2 (continue) | Continue Phase-2 pass 1 (private mentor reflect) and Phase-2 pass 2 (conversation surface) | Critical (R17 surface) | 4-6 |
| Migrate Tier 3 (R20a perimeter) | Per-endpoint migration: score, score-decision, score-document, score-scenario, score-social, guardrail, reflect-public | Critical per route (R20a + PR6) | 7-10 (one session per route average) |
| Migrate Tier 4 (outside perimeter) | score-conversation, score-iterate | Elevated | 2-3 |
| Migrate Tier 5 (skill wrappers) | Verify wrappers handle new payload; per-skill receipts updated; can be batched 2-3 wrappers per session | Standard-Elevated | 5-7 |
| Migrate Tier 6 (assessments) | foundational, full; full has Supabase write path requiring R17 review | Elevated | 2 |

**Stage 2 dependencies:** **Stage 1 close exit criteria all met (NEW per ST2).** K1 → K2/K3/K4 → K5 → K6. K7 and K8 run continuously as migrations land. Tier 2 was already in progress before this plan; per-tier gating: Tier 3 begins only after Tier 2 verified; Tier 4–6 may run partially in parallel after Tier 3 substantially complete. D24 audit findings (existing perimeter audit) feed K3 sequencing — endpoints with open Critical-class findings get migrated in a way that resolves those findings as part of the migration rather than shipping migrations that preserve the issues.

**Stage 2 success criteria:** unchanged from original adopted plan.

**Stage 2 estimated total:** 21–32 sessions (the largest stage by session count).

**Stage 2 risk profile:** unchanged. Mixed. Tier 2 Critical (R17). Tier 3 Critical (R20a, PR6). Tier 4–6 mostly Elevated. K1–K6 Standard.

---

### Stage 3 — Layer 1 hardening + plugin internals (RE-SCOPED on Anthropic Plugin spec + MCP)

**Why third:** With substrate finalised (Stages 1–2), Layer 1 reference can be hardened against actual production behaviour rather than projected behaviour. Plugin internals can be built against confirmed Layer 2 + Layer 3 contracts. The decision-path mechanisms (action scorer, verification, subagent handoff, concern-radius credential) become possible only when the substrate is reliable. This is the last stage before the licensing gate; everything in this stage is **closed** preparation for what becomes public in Stage 4.

**ST2 Phase 3 Step 4 re-scope:** Stage 3 plugin work commits to Anthropic Plugin spec + MCP rather than bespoke architecture. **C5 substrate-specific integrations stay bespoke** (the substrate's value-add). Estimated reduction: ~5-8 sessions per inbox synthesis Opportunity #1.

**Items in this stage:**

**Layer 1 hardening (unchanged):**

| # | Item | Description | Risk | Est. sessions |
|---|---|---|---|---|
| B1 | Layer 1 reference hardening | Cleaning, commenting, examples, version contracts for external use | Elevated | 2 |
| B2 | Layer 1 R20a script | Layer 1 of the three-layer R20a defence; runs locally inside the plugin | Critical (R20a / PR6) | 2 |
| B3 | Layer 1 input/output contract documentation | What the open Layer 1 produces (Layer1Schema) and how it's consumed by the closed Layer 2 API | Standard | 1 |
| B4 | Repository structure decision | Single repo / monorepo / substrate-as-package; how the open Layer 1 is organised for external consumption | Standard | 1 |
| B5 | Code-level documentation, examples, contribution guidelines | For community contributions to Layer 1 once public | Standard | 1-2 |

**Plugin internals (RE-SCOPED on Anthropic Plugin spec + MCP):**

| Original | Re-scope | Source |
|---|---|---|
| C1 Plugin manifest (bespoke) | **C1 Adopt Plugin spec manifest format** | Anthropic Plugin spec |
| C2 Plugin skills (bespoke) | **C2 Adopt Agent Skills format** | `anthropics/skills` repo |
| C3 Plugin tools (bespoke HTTP) | **C3 Adopt MCP as protocol; substrate's Layer 2 + Layer 3 expose as MCP servers** | modelcontextprotocol.io; code-execution-with-MCP pattern |
| C4 Plugin scripts (bespoke) | **C4 Adopt Plugin spec scripts/hooks** | Anthropic Plugin spec |
| **C5 Substrate-specific integrations** | **C5 STAYS BESPOKE — substrate's value-add** | — |
| C6 Plugin assets (bespoke) | **C6 Adopt Plugin spec assets convention** | Anthropic Plugin spec |
| C7 Plugin documentation (bespoke) | **C7 Standardise on Plugin spec + Anthropic skill-creator conventions** | Anthropic Plugin spec |
| C8 Plugin variant strategy decision | One plugin with mode parameter (evaluative / prescriptive / augmentative-combo) vs a family | Standard | 1 |

**Decision-path mechanisms (re-evaluation under Anthropic primitives per ST2):**

| # | Item | Description | Risk | Est. sessions |
|---|---|---|---|---|
| D1 | Action-scorer interface | `score(judgement, candidate_action) → kathekon_assessment`; mirrors human action scorer per Decision 5; **re-evaluate against Sub-Agents primitive at Stage 3 kickoff (ST2 C2 ALLOW)** | Elevated | 2 |
| D2 | Verification interface | `verify(examined_judgement, response) → alignment_record`; **AC12 sub-agent verification option (ST2 C2 ALLOW + AC12 manifest amendment)** | Elevated | 1-2 |
| D3 | Subagent handoff payload | Signed serialisable examined-judgement that travels with delegated tasks | Elevated | 2 |
| D4 | Concern-radius credential | Living trail of proximity movement, emitted by the plugin during normal operation | Elevated | 2 |
| D5 | Acceptance/rejection audit trail | Record of substrate-suggested options accepted or rejected | Standard | 1 |
| D-multi | Multi-agent orchestration re-evaluation | **ESCALATED per ST2 C7; revisit at Stage 3 kickoff for multi-agent patterns** | TBD | TBD |

**Three-mode access + wiki + governance (unchanged):**

| # | Item | Description | Risk | Est. sessions |
|---|---|---|---|---|
| E1-E4 | Three-mode access (within plugin) | Pure structured / hybrid / pure text; mode selection logic; developer-facing API surface | Elevated | 2-3 |
| F1-F5 | Translation pattern wiki (initial) | Structure, format, initial corpus, governance, code linkage, test corpus | Standard | 3-4 |
| J3 | ADR plugin-as-end-goal | Captures Decision 2 | Standard | 1 |
| J4 | ADR three-layer R20a defence | Captures Decision 3 | Standard | 1 |
| J7 | Manifest amendments | AC additions; new PR rules; project-instructions updates (most absorbed by ST2 adoption; J7 covers post-adoption refinements) | Elevated | 1 |
| J8 | Decision-log entries for the eight 2026-05-10 decisions | Backfill into the active decision log if not already present | Standard | 1 |

**NEW Stage 3 items added per ST2:**

| # | Item | Description | Risk | Est. sessions |
|---|---|---|---|---|
| S4 | OWASP Agentic Top 10 2026 mapping (J7 component) | Cross-references manifest rules to each OWASP Agentic 2026 risk; flags coverage gaps. **Source: ST2 Phase 2 Domain 1 S4 (ALLOW)** | Standard | 1 |
| U4 | Plugin-developer first-call success path | Standalone deliverable in Stage 3 C7 expansion. **Source: ST2 Phase 2 Domain 9 U4 (ALLOW)** | Standard | 1 |
| SDK1 | Claude Agent SDK adoption for Layer 1 open-source plugin client (selective) | Closed Layer 2 + Layer 3 stay on current Vercel + Supabase + bespoke orchestration. **Source: ST2 Phase 3 Step 3 ALLOW-selective; wholesale Managed Agents re-platform ESCALATED with three revisit conditions** | Elevated | 2 |

**Stage 3 dependencies:** B1 depends on Stage 1 + 2 substantially complete. B2 depends on B1 (the open Layer 1 reference is the input to the local R20a script). B3 depends on Stage 1 (Layer 2's accepted contract). C1–C7 depend on B1–B5 + Stage 1 + **Anthropic Plugin spec stability**. C8 (variant strategy) gates whether subsequent stages plan for one plugin or a family. D1–D5 depend on C5 + **Sub-Agents primitive availability**. E1–E4 depend on B1 + C1–C5. F1–F5 can run partially in parallel with C/D/E. S4 + U4 can run as session-fillers. SDK1 depends on B1 hardened.

**Stage 3 success criteria (updated):**
- Layer 1 reference hardened, documented, ready for external consumption
- In-plugin R20a script verified against the local-fast / server-canonical contract
- Plugin manifest, skills, tools, scripts, hooks, assets, documentation produced **on Anthropic Plugin spec + MCP (C1-C7 except C5)**
- Variant strategy decided
- Decision-path mechanisms (D1–D5) implemented and tested against the hardened substrate; **D1, D2 re-evaluated against Sub-Agents + AC12**
- Three-mode access surface tested (E1–E4)
- Initial translation-pattern wiki content produced (F1–F5; F6 publication deferred to post-gate)
- ADRs J3 + J4 adopted; **post-adoption manifest amendments J7 produced; J8 decision-log backfill complete**
- **OWASP Agentic Top 10 2026 mapping produced (S4)**
- **Plugin-developer first-call success path designed (U4)**
- **Claude Agent SDK adopted for Layer 1 open-source plugin client (SDK1)**

**Stage 3 estimated total (revised):** ~20-29 sessions (was 28-37; reduction ~5-8 sessions from Plugin spec + MCP adoption).

**Stage 3 risk profile:** Mixed. B2 Critical (R20a perimeter, PR6). C2/C3/C4/D1–D4/E1–E4/SDK1 Elevated. The rest is Standard. PR1 (single-endpoint proof) applies to C5 hooks before they roll out to all integration points.

---

### LICENSING GATE (Rule A) — between Stage 3 and Stage 4

**Why this is a gate, not a stage:** Per Rule A, licensing is not a generic Stage 1 item distributed across the plan. It is the boundary that separates "all closed preparation" from "first public exposure." Until the gate is cleared, nothing in `/adopted/` of the open Layer 1 reference, no plugin in any marketplace, no public announcement, no public repository commit. The work in this gate is small in volume but consequential.

**Note per ST2:** Lawyer engagement bringing-forward to **Stage 1 close** (per ST2 Q4) means the lawyer is already engaged by the time this gate is reached. The gate work is then primarily mechanical (sign-off, file commits, ADRs).

**Items at the gate:**

| # | Item | Description | Risk | Est. sessions |
|---|---|---|---|---|
| H1 | Licensing strategy decision (Layer 1 reference) | Permissive (MIT vs Apache vs other); the moat is on Layer 2 + Layer 3 services so permissive is defensible | Elevated | 1 |
| H2 | Plugin licensing | Separate from Layer 1 reference; can be proprietary with bundled open components | Elevated | 1 |
| H3 | Lawyer review (final sign-off) | At the gate, before any public release. Covers H1, H2, brand and trademark posture, plugin economics legal posture | Critical (legal) | 1-2 (final sign-off; primary review already done at Stage 1 close per ST2 Q4) |
| H4 | Licence files committed; attribution preserved; trademark posture documented | Mechanical execution after H3 sign-off | Elevated | 1 |
| J2 | ADR — open-Layer-1-only / closed-Layer-3 decision | Captures Decision 1 with the licensing implications | Standard | 1 |
| J5 | ADR — licensing strategy | Captures H1–H4 decisions and reasoning | Standard | 1 |

**Gate-clearing criteria:**
- H1 + H2 decisions adopted by founder
- Lawyer (engaged at Stage 1 close per ST2 Q4) provides final sign-off on H1, H2, brand/trademark posture, plugin economics legal frame
- H4 mechanical work done: licence files committed to repos, attribution preserved, trademark notices consistent
- ADRs J2 and J5 adopted; cross-referenced from the staging plan

**Nothing public ships until all six gate-clearing criteria are true.** "Public" includes: open-sourced repository made public; plugin listed in any marketplace (even private/preview); any external announcement.

**Gate estimated total (revised):** **3-5 sessions** (was 5-7; lawyer engagement bring-forward to Stage 1 close removes the wall-clock blocker).

**Gate risk profile:** Critical at H3 final sign-off. Elevated at H1–H4.

---

### Stage 4 — First public release (LOCKED-IN marketplace strategy; EXPANDED gating)

**Why fourth:** With substrate finalised, Layer 1 hardened, plugin internals built, and licensing cleared, the plugin can be packaged for one marketplace and listed. Single marketplace first per PR1 (single-endpoint proof before rollout — extended to "single marketplace before multi-marketplace"). Per ST2 Phase 3 Step 6 + Step 9 M3: **Cowork is locked in as first target.**

**Items in this stage:**

| # | Item | Description | Risk | Est. sessions |
|---|---|---|---|---|
| G1 | First marketplace target (LOCKED IN) | **Cowork first; anthropics/skills second; Claude Code Plugins third** per ST2 Phase 3 Step 6 Candidate 8 ALLOW + Step 9 M3 REVISE | Standard | 1 (already decided) |
| G2 | Per-marketplace packaging (Cowork) | Plugin format conversions; build pipeline for Cowork | Elevated | 2 |
| G3 | Marketplace listing copy + Character Kernel category language | Name, description, screenshots, trust signalling, brand presence. **Category label: "Character Kernel"** (per ST2 election; per R18a manifest amendment). Peer-category language: "Character Kernel; peers include ANCHOR (Cognitive Middleware), ResontoLogic (Reasoning for Humans)" | Standard | 1-2 |
| G4 | Marketplace review and approval (EXPANDED gating) | Plugin review process per marketplace; iteration on review feedback. **Gated on parallel pre-launch track items + substrate Verified status (see below)** | Elevated | 2-4 (incl. review turnaround) |
| G5 | Plugin update mechanics and version compatibility | Backward compatibility, deprecation paths, update mechanisms | Standard | 1 |
| G6 | Plugin economics + Stripe integration (M2) | Free-to-install with paid services via connectors; per-call metered with monthly cap; free-tier preserved; R5 cost-as-health-metric thresholds against revenue (depends on A13) | Elevated | 2 |
| I5 | Plugin trust signalling in marketplaces | Verified badges, security review status, audit posture | Standard | 1 |

#### G4 expanded gating criteria (NEW per ST2)

**Parallel pre-launch founder-personal-exposure track items MUST be Complete:**
- FPE-1 Pty Ltd structure incorporated; ASIC + accountant engagement complete
- FPE-2 GST registration decision recorded
- FPE-3 Tech E&O + Cyber Liability + General Liability policies purchased (D&O purchasable at first investor engagement)
- FPE-4 Coverage-gap audit complete (AI-specific exclusion endorsements verified)
- FPE-5 TOS + liability allocation document published; lawyer-reviewed

**Substrate items MUST be at Verified status:**
- A10-A19 (Stage 1 expansion) Verified
- C1-C7 (re-scoped Stage 3) Verified or BESPOKE (C5 only)
- R18 + R19c + R20a + R20b operational

**Stage 4 dependencies:** G1 depends on Stage 3 substantially complete and the licensing gate cleared. G2 depends on G1. G3 depends on G2. **G4 depends on G3 + parallel pre-launch track complete + substrate at Verified.** G5 + G6 + I5 can run in parallel with G3/G4. The K-category should be substantially complete by the start of Stage 4 — the website front-end on the substrate makes the live data visible to potential plugin reviewers and earns the trust signalling.

**Stage 4 success criteria (updated):**
- First marketplace target locked in (Cowork); reasoning recorded in decision log
- Plugin packaged for Cowork
- Listing approved and live with Character Kernel category language
- Update mechanics, version compatibility, plugin economics documented and operational
- Stripe integration live; R5 thresholds against revenue operationalised
- Trust signalling (badges, security review status) in place on the listing
- **Parallel pre-launch track items all Complete (NEW)**

**Stage 4 estimated total:** 10–15 sessions.

**Stage 4 risk profile:** Mostly Elevated. G2 (packaging changes) and G4 (review-driven changes) and G6 (economics) are the higher-risk items. PR1 (single-endpoint proof) applies — single marketplace first, rollout to others only after first listing has produced telemetry.

---

### Stage 5 — Public open-source release of Layer 1 + announcement

**Why fifth:** Plugin is in market. Telemetry is flowing. Now is the moment to release the Layer 1 reference publicly (separate repo or as the plugin's open component) with announcement and community engagement. Not before, because the plugin's behaviour in market validates the substrate; the open release lands on a substrate that has been observed, not projected.

**Items in this stage (unchanged from original):**

| # | Item | Description | Risk | Est. sessions |
|---|---|---|---|---|
| I1 | Public announcement | When, where, with what framing; coordinated with marketplace listing visibility | Elevated | 1-2 |
| I2 | Community engagement | Anthropic developer ecosystem, MCP community, philosophy communities, agent-protocol communities | Standard | 2-3 |
| I4 | Brand and trademark protection | Distinguishing open SageReasoning Layer 1 from authoritative SageReasoning Layer 2 + Layer 3 services | Elevated | 1 |
| F6 | Wiki publication form | Embedded asset in plugin and/or freestanding public site | Standard | 1-2 |

**Stage 5 dependencies, success criteria, risk profile, estimated total:** unchanged.

---

### Stage 6 — Multi-marketplace strategy + ecosystem polish (EXPANDED per ST2)

**Why sixth (and explicitly post-launch):** Standards-formation and ecosystem expansion are slower-tempo work that benefits from real adoption signal. Working on standards before adoption is speculative; working after is grounded in observed need. Multi-marketplace expansion follows the same logic — but ST2 locks in the sequence in advance so the work has direction.

**Marketplace adoption sequence (LOCKED IN per ST2):**

1. **Cowork** (Stage 4 G1; first marketplace; lands at MVP launch)
2. **anthropics/skills** (Stage 6 first deliverable; after Cowork ships and produces telemetry)
3. **Claude Code Plugins** (Stage 6 second deliverable; after anthropics/skills ships; per PR1 staged adoption)
4. **Additional marketplaces** (computer-use surfaces; per inbox synthesis Theme H) — ESCALATE pending Cowork + anthropics/skills evidence

**Per-marketplace packaging:**
- Plugin spec format provides cross-marketplace portability (per Stage 3 C1-C7 re-scope)
- Marketplace-specific adaptations: Cowork connector wrapper; anthropics/skills skill-creator output; Claude Code Plugins plugin manifest

**Items in this stage:**

| # | Item | Description | Risk | Est. sessions |
|---|---|---|---|---|
| G7 | anthropics/skills listing | Second-marketplace adoption per Phase 3 Step 6 Candidate 8 ALLOW | Elevated | 2-3 |
| G8 | Claude Code Plugins listing | Third-marketplace adoption per Phase 3 Step 6 Candidate 11 | Elevated | 2-3 |
| I3 | Standards-formation engagement | Smaller scope under plugin paradigm but still relevant for credential interoperability and Layer 1 input contract | Standard | ongoing |
| D-extensions | Refinements of D1–D5 driven by production telemetry | Elevated | ongoing |
| E-extensions | Refinements of E1–E4 mode-access surface | Standard | ongoing |
| F-extensions | Wiki growth and pattern corpus expansion | Standard | ongoing |
| Post-launch refinements | Any items surfaced by Stages 4–5 telemetry | Variable | continuous |

**Stage 6 dependencies:** Depends on Stages 4–5 complete with telemetry flowing. G7 depends on G4 (first marketplace shipped) + telemetry observed. G8 depends on G7 ship. Ongoing rather than time-bounded.

**Stage 6 success criteria:** open-ended. This stage runs continuously alongside Sage Ops (P7) and post-launch product evolution.

**Stage 6 estimated total (revised):** **8-14 sessions for G7 + G8 + initial polish**; thereafter steady-state. (Was "6-10 sessions" estimate; expansion accounts for the locked-in second + third marketplace sequence.)

---

## Parallel pre-launch founder-personal-exposure track (NEW per ST2)

Per ST2 Phase 3 Q6 election. **Track runs alongside the substrate-build arc; gates Stage 4 G4.**

### Track items

| # | Item | Source | Dependency |
|---|---|---|---|
| FPE-1 | Pty Ltd structure decision + incorporation | ST2 Phase 2 Domain 6 L1 | P1 investment-case affirmation; lawyer engagement (Q4) |
| FPE-2 | GST registration timing decision | ST2 Phase 2 Domain 6 L2 | Accountant engagement |
| FPE-3 | Tech E&O + Cyber Liability + General Liability purchase | ST2 Phase 2 Domain 7 I1 | FPE-1 complete (Pty Ltd needed) |
| FPE-4 | Coverage-gap audit for AI-specific exclusions | ST2 Phase 2 Domain 7 I2 | FPE-3 quotes received |
| FPE-5 | TOS + liability allocation document | ST2 Phase 2 Domain 8 M1 | Lawyer engagement (Q4) |

### Track governance

- Track is recorded in this staging plan but executed independently of substrate-build sessions
- Founder maintains `/operations/parallel-track-fpe-status.md` (NEW deliverable; created at ST2 adoption) listing each item's current status (Scoped / Designed / Initiated / Complete)
- Each item Complete is logged in the decision log
- Stage 4 G4 marketplace approval gated on all five items Complete (per G4 expanded gating above)

---

## Dependency map (high-level, updated per ST2)

```
Stage 1 (Backend foundations + Critical-gap closures — EXPANDED)
  A1-A9 (foundations) → A10 (per-agent credentials) → A11-A19 (gap closures)
                                                    ↓
                                            Stage 1 close (NEW gating step)
                                                    ↓
Stage 2 (K-category migration — DELAYED START) ← migration findings refine Stage 1 (K7 feedback loop)
  ↓
Stage 3 (Layer 1 hardening + plugin internals on Plugin spec + MCP — RE-SCOPED)
  ↓
LICENSING GATE (Rule A; reduced volume due to lawyer-engagement bring-forward)
  ↓
Stage 4 (First marketplace listing — Cowork — EXPANDED gating)
  ↓ (gated by parallel pre-launch track + substrate Verified)
Stage 5 (Public open-source + announcement)
  ↓
Stage 6 (Multi-marketplace — anthropics/skills → Claude Code Plugins — EXPANDED)
```

**Parallel pre-launch track:**
```
FPE-1 → FPE-3 → FPE-4
       ↓
FPE-2 (independent of substrate timing)
       ↓
FPE-5 (lawyer-coupled)
       ↓
All five Complete → Gates Stage 4 G4 approval
```

**Within-stage critical chains:**

- **Stage 1:** A1 → A2 → A3 → A5 → A6; A7 lands in parallel after A1; A8 + A9 + K1 + J1 + J6 run partially in parallel; **A10 (NEW) after A5 Verified → A11 + A12 + A13 + A15 + A19 chain depend on A10**
- **Stage 2:** K1 → K2/K3/K4/K5 → K6 → first migration → subsequent migrations; K7 and K8 are continuous loops
- **Stage 3:** B1 → B2 → B3; B4 → B5; B1 + B5 → C1–C7 (on Plugin spec); C8 gates downstream variant work; D1–D5 depend on C5; D1+D2 re-evaluated against Sub-Agents at Stage 3 kickoff; E1–E4 depend on B + C; F1–F5 partially parallel with C/D/E; S4 + U4 + SDK1 partially parallel
- **Gate:** H1 + H2 → H3 (reduced; primary review at Stage 1 close) → H4; J2 + J5 land alongside
- **Stage 4:** G1 (locked in: Cowork) → G2 → G3 (Character Kernel) → G4 (gated by parallel track + substrate Verified); G5 + G6 + I5 partially parallel
- **Stage 5:** I4 → I1 → I2; F6 lands in parallel
- **Stage 6:** G4 ship + telemetry → G7 (anthropics/skills) → G8 (Claude Code Plugins)

---

## Critical path (updated per ST2)

The shortest end-to-end chain that determines overall arc length:

```
A1 → A3 → A5 → A7 → A9
  → A10 → A11b → A12 → A13 → A15a → Stage 1 close
  → K1 → K2 → K3 → K7
  → Tier 2 migrations → Tier 3 migrations
  → B1 → B2 → C1–C5 (on Plugin spec) → D1
  → H1 → H2 → H3 → H4
  → G1 → G2 → G3 → G4 (gated by FPE track)
  → I4 → I1
```

**Critical-path session estimate (revised):** roughly **48–60 sessions** if pursued without parallelism. With parallel work + parallel pre-launch track (see next section), end-to-end is closer to **45–55 sessions**. The pre-launch track adds wall-clock overhead but minimal session-count overhead (founder + lawyer + accountant work runs alongside).

---

## Parallel work opportunities (updated per ST2)

Items that can run concurrently with their stage's critical path:

- **Stage 1:** A8, A9, K1, J1, J6 can run in parallel with A1–A7 (existing); **A11a (audits) + A14 (SLOs) + A16 (privacy gov) + A17 (regulatory gov) + A18a-e (onboarding gov) run in parallel with A10/A12/A13 critical-path** (NEW)
- **Stage 2:** Tier 5 (skill wrappers) can run partially in parallel with Tier 3 once methodology (K2–K6) is settled
- **Stage 3:** F1–F5 (wiki) runs partially in parallel with C/D/E; J3, J4, J7, J8 (governance) are session-fillers; **S4 + U4 + SDK1 partially parallel**
- **Stage 4:** G5, G6, I5 run in parallel with G2/G3/G4
- **Stage 5:** F6 runs in parallel with I1/I2
- **Stage 6:** Everything is parallel by definition; no critical path
- **Parallel pre-launch track:** Runs alongside substrate work; FPE-1 + FPE-2 can begin immediately at ST2 adoption; FPE-3/4 follow FPE-1; FPE-5 follows lawyer engagement (Stage 1 close)

---

## Open questions surfaced during planning (updated post-ST2)

**Resolved by ST2 Phase 3 (no longer open):**

- ~~First marketplace target (G1)~~ → **Cowork locked in** per ST2 Phase 3 Step 6 + Step 9 M3
- ~~Lawyer engagement timing~~ → **Bring forward to Stage 1 close** per ST2 Q4
- ~~Migration sequencing within Tier 3~~ → resolved during K3 sequencing (per-route case-by-case during migration)
- ~~Trust signalling (I5)~~ → Character Kernel category + R18a honest-certification language + R19c limitations page link per ST2

**New open questions surfaced by ST2 (require founder decision at the named revisit conditions):**

1. **Token format for A10 per-agent credentials** (JWT / W3C VC / hybrid). Revisit: A10 sub-stage kickoff with ADR drafted.
2. **EU customer plausibility decision** (gates R3 / A1; coupled with regulatory R3 ESCALATE). Revisit: lawyer engagement at Stage 1 close.
3. **R20a perimeter potential broadening** with A10 revocation API additions. Revisit: A10 sub-stage kickoff. Each addition Critical under PR6 + AC5.
4. **Outcomes pricing cost-aware adoption threshold** (per AC13 manifest amendment). Revisit: first Outcomes adoption attempt; verify pricing fits R5 cost session-budget.
5. **Wholesale Managed Agents re-platform** (ESCALATED per ST2 Phase 3 Step 3). Revisit conditions: (a) Vercel infrastructure cost exceeds $200/month; (b) Managed Agents demonstrates production support for synchronous-endpoint workloads at sub-second latency; (c) 2+ peer substrates have published their hosting architecture choices.
6. **Layer 1 Action Proposal Envelope** (Amendment 2C ESCALATED). Revisit: external Judge Extender adopter exists OR Layer 1 schema stable post-K-category migration.
7. **Memory tool cache-pattern simplification** (Candidate 9 ESCALATED). Revisit: dedicated future governance session.
8. **Cowork-side connector to `/api/reason`** (for substrate-as-judge dogfooding from session environments). Revisit: Cowork integration scope (Stage 4 G2).

**Remaining open from original adopted plan (still open):**

- **Variant strategy (C8)** — single configurable plugin or a family? Recommendation: single plugin with mode parameter for the first marketplace listing; revisit family-strategy after first-listing telemetry. Decision required before Stage 3 begins.
- **Repository structure (B4)** — single repo / monorepo / substrate-as-package? Affects how the open Layer 1 reference is consumed. Decision required before Stage 3 begins.
- **Cost shape for migrated website endpoints (K5)** — moving from bundled-Sonnet to translation-sandwich (Sonnet for L1 + Sonnet for L3) doubles per-call LLM cost. R5 alert thresholds need adjustment. Decision required before Stage 2 cuts over the first revenue-affecting endpoint.
- **Plugin economics (G6)** — free-to-install with paid services via connectors is the standard pattern. Specific tariff (per-call / subscription / hybrid) is open. Decision required before Stage 4's G6 lands.

---

## Holistic-pass-net effect on session count (updated per ST2)

| Estimate type | Sessions |
|---|---|
| Step-scoped raw total (post-ST2 expansion) | 110–145 |
| After efficiencies (Efficiency 1–7) + Stage 3 Plugin spec reduction | 95–125 |
| After time-bounded repackaging (sessions cap at 4 hr) | 75–100 |
| After parallel-work confirmation (Stage 6 truly post-launch / parallel) + parallel pre-launch track wall-clock-only | 60–85 |
| After Stage 6 deferred to ongoing (out of arc-completion scope) | **48–77** |

**Final arc estimate (revised post-ST2):** **48–77 sessions** to first marketplace listing + public Layer 1 release + initial ecosystem polish (Cowork + anthropics/skills + Claude Code Plugins). Stage 6 continues thereafter. (Original estimate 38–62 sessions; revised upward primarily by Stage 1 expansion +10-15 sessions; partially offset by Stage 3 re-scope -5-8 sessions and lawyer-engagement bring-forward reducing gate volume.)

---

## Cross-stage implications (updated per ST2)

**Implication 1 — Stage 1 + Stage 2 are coupled tighter than the linear sequence implies.** K7 (substrate refinements driven by migration findings) means Stage 2 reaches back into Stage 1 with amendments. Practical implication: "Stage 1 closed" is provisional; Stage 2 may re-open Stage 1 work, and that's expected.

**Implication 2 — Stage 3 plugin internals depend on the K-category being substantially complete** AND on Anthropic Plugin spec + MCP stability. The plugin's open Layer 1 must produce input that all migrated Layer 2 endpoints accept consistently. Practical implication: Stage 3 should not begin until Stage 2 Tier 3 (R20a perimeter routes) is substantially complete — at least 5 of the 7 perimeter routes Verified — AND Anthropic Plugin spec + MCP are stable enough to commit to.

**Implication 3 — The licensing gate touches every artefact.** Anything that could plausibly be published needs licensing-clean status before the gate. Stage 3's wiki content (F1–F5), examples, documentation, and plugin assets all need to be original-or-attributed before the gate.

**Implication 4 — D24 audit findings are pre-existing technical debt that intersects with K-category migration.** Tier 3 migration session estimates may be conservative; budget 1–2 extra sessions for D24-driven Critical fixes that surface during migration.

**Implication 5 — Founder verification capacity is the rate-limiting resource.** Stage 1's Critical-risk sessions each require founder verification before next session can proceed. With ~20–30 Critical sessions in Stages 1–2 (expanded from 15–25 pre-ST2), this is a non-trivial overhead. Practical implication: batch verification where possible.

**Implication 6 (NEW per ST2) — Parallel pre-launch track produces wall-clock dependencies independent of session count.** Pty Ltd incorporation takes weeks; insurance quotes take days; lawyer turnaround takes weeks. Practical implication: founder starts FPE-1 + FPE-2 at ST2 adoption regardless of substrate-build session pacing. The track does not consume substrate-build session time but determines Stage 4 G4 readiness.

**Implication 7 (NEW per ST2) — Anthropic Plugin spec + MCP adoption couples the build arc to external roadmap.** If Anthropic deprecates or significantly changes the Plugin spec or MCP semantics during Stage 1-2, Stage 3 work absorbs the change. Practical implication: monitor Anthropic releases at each quarterly review cadence (AC1 governance task); have a fallback to bespoke architecture for C1-C7 if spec changes destabilise.

---

## Efficiencies (combinable / redundant / parallel) — updated per ST2

**Efficiency 1 — Combine A8, J1, K1 into a single "inventory + ADR + endpoint mapping" session early in Stage 1.** Estimated saving: 1–2 sessions. *(J1 ADR already adopted 2026-05-12; A8 + K1 still combinable.)*

**Efficiency 2 — Skill wrappers (K-category Tier 5) can be batched 3–4 per session.** Estimated saving: 3–4 sessions on Tier 5.

**Efficiency 3 — F1–F5 wiki content can be authored partially during Stage 2 migrations.** Estimated saving: 1–2 sessions.

**Efficiency 4 — J governance (J3, J4, J7, J8) is documentation work that fits into session edges.** Estimated saving: 2–3 sessions.

**Efficiency 5 — Lawyer engagement starts at Stage 1 close (per ST2 Q4), not at the gate.** Lawyer turnaround time runs in parallel with Stage 2 + 3's session work. Estimated saving: wall-clock time, not session count. *(Brought forward from original "Stage 3 kickoff" recommendation.)*

**Efficiency 6 — D-mechanisms (D1–D5) and E-mechanisms (E1–E4) can largely run in parallel.** Estimated saving: 3–5 sessions on Stage 3.

**Efficiency 7 — The component registry update is a routine afterwards.** Each migration that lands updates the registry as part of the migration session.

**Efficiency 8 (NEW per ST2) — Stage 3 C1-C7 adoption of Anthropic Plugin spec + MCP.** Removes ~5-8 sessions of bespoke architecture work. C5 stays bespoke (substrate's value-add).

**Efficiency 9 (NEW per ST2) — Stage 1 A11a + A14 + A16 + A17 + A18a-e (governance + audits) run as session-fillers during code-heavy critical-path sessions.** Founder lower-attention closing phases absorb these. Estimated saving: 2–3 sessions absorbed into edges rather than dedicated sessions.

**Net efficiency saving:** approximately 15–22 sessions across the arc (up from original 10–17).

---

## Time-bounded session repackaging (updated per ST2)

The original step-scoping above is step-bounded ("session per item or per item-cluster"). Per Rule B, the plan packages work into time-bounded sessions instead. Recommended session length: **3–4 hours**, ending at the time budget or a natural pause (whichever comes first). A session may contain multiple steps; a step may span multiple sessions.

**ST2 update to indicative packaging:** The original 12-session illustrative packaging (sessions 1-12 covering Stage 1 + start of Stage 2) is preserved for the A1-A9 critical chain. Sessions 13-25 cover the Stage 1 expansion (A10-A19) — packaging will be drafted at the relevant kickoff per "minimal-mid-session-founder-input session design." Stage 1 close is its own session.

Sessions 1-7 are complete or in-progress (A1, A2, A3, A4 Verified; A5 next). Indicative packaging for sessions 8 onwards:

| # | Session focus | Items | Est. duration | Risk class |
|---|---|---|---|---|
| 8 | A5 Layer 3 scaffolding + A6 prose_mode + A8 endpoint mapping + K1 inventory | A5 (partial), A6, A8, K1 | 3-4 hr | Mixed |
| 9 | A5 Verified; A7 R20a gate scaffolding (PR1 single-endpoint proof) | A5 (complete), A7 (partial) | 3-4 hr | Critical |
| 10 | A7 Verified; A9 cost monitoring + J6 cost-impact | A7 (complete), A9, J6 | 3-4 hr | Critical → Standard |
| 11 | A10 token-format ADR + kickoff scaffolding | A10 (partial); ADR drafted | 3-4 hr | Critical (PR6 + AC7) |
| 12 | A10 implementation + revocation surface | A10 (complete) | 3-4 hr | Critical |
| 13 | A11a audits + A11b prompt-injection defence scaffolding | A11a (complete), A11b (partial) | 3-4 hr | Mixed |
| 14 | A11b Verified; A12 OpenTelemetry instrumentation | A11b (complete), A12 (partial) | 3-4 hr | Mixed |
| 15 | A12 Verified; A13 cost-as-health-metric alerts | A12 (complete), A13 | 3-4 hr | Elevated |
| 16 | A14 SLOs + error-budget discipline | A14 | 3-4 hr | Standard governance / Elevated implementation |
| 17 | A15a R17c deletion endpoint (Critical) | A15a | 3-4 hr | Critical (R17) |
| 18 | A15b R17g access (SAR) | A15b | 3-4 hr | Critical (R17) |
| 19 | A15c R17h rectification | A15c | 3-4 hr | Critical (R17) |
| 20 | A15d R17i portability | A15d | 3-4 hr | Critical (R17) |
| 21 | A16a-c privacy governance pass | A16 | 3-4 hr | Standard |
| 22 | A17a-c regulatory governance pass | A17 | 3-4 hr | Standard |
| 23 | A18a + A18b onboarding governance | A18a, A18b | 3-4 hr | Standard |
| 24 | A18c framework-dependence detection (PR6) + A18d-e | A18c (PR6), A18d, A18e | 3-4 hr | Mixed (PR6 engages) |
| 25 | A19 abuse-detection + rate-limiting | A19 | 3-4 hr | Elevated |
| 26 | Stage 1 close session: lawyer engagement initiation; EU customer plausibility decision; parallel track status review | Stage 1 close gating step | 3-4 hr | Standard governance |

**Session counts for Stage 2 onwards:** see Stage 2 estimated total (21–32 sessions); Stage 3 (20–29 sessions); Gate (3–5 sessions); Stage 4 (10–15 sessions); Stage 5 (5–8 sessions); Stage 6 first wave (8–14 sessions).

---

## Risks visible only at the holistic level (updated per ST2)

**Risk 1 — Stage 3's plugin variant strategy decision (C8) gates a lot of work.** *Unchanged.* Recommendation: founder makes C8 decision at the start of Stage 3 and does not revisit it.

**Risk 2 — D24 audit-driven Critical fixes during Tier 3 migrations may concentrate at the end of Tier 3 sequencing.** *Unchanged.* Recommendation: pair D24-affected routes with non-D24 routes in sequencing.

**Risk 3 — The licensing gate's lawyer turnaround.** *Resolved by ST2 Q4 bring-forward to Stage 1 close.*

**Risk 4 — Stage 5's public announcement (I1) is one-shot.** *Unchanged.*

**Risk 5 — Stage 6's "ongoing" framing risks indefinite drift.** *Mitigated by ST2 locking in the marketplace sequence (G7, G8 named).* Recommendation: Stage 6 has explicit 3-month checkpoints.

**Risk 6 — Founder-AI collaboration knowledge gaps may surface mid-arc.** *Unchanged.*

**Risk 7 (NEW per ST2) — Parallel pre-launch track items have wall-clock dependencies the substrate-build sessions cannot accelerate.** Pty Ltd incorporation, insurance quotes, lawyer engagement all run on external timelines. If founder doesn't begin FPE track at ST2 adoption, Stage 4 G4 will block on track completion regardless of substrate readiness. Recommendation: founder begins FPE-1 + FPE-2 immediately after ST2 adoption; tracks status weekly in `/operations/parallel-track-fpe-status.md`.

**Risk 8 (NEW per ST2) — Anthropic Plugin spec + MCP changes during Stages 1-2 destabilise Stage 3 commitments.** Recommendation: AC1 governance task at next quarterly review (2026-07-06) covers Anthropic roadmap monitoring; fallback to bespoke C1-C7 documented at Stage 3 kickoff.

**Risk 9 (NEW per ST2) — A10 per-agent credentials surface may broaden R20a perimeter (AC5).** Each revocation API addition is Critical under PR6 + AC5. Recommendation: A10 kickoff includes R20a perimeter impact assessment.

---

## Cross-references

- `/adopted/standing-protocol-cache.md` — general session protocol
- `/adopted/build-sessions-protocol-cache.md` — build-arc-specific cache
- `/adopted/adr/2026-05-12-substrate-category-character-kernel.md` — J1 ADR (Substrate Category — Character Kernel; created at ST2 adoption)
- `/operations/parallel-track-fpe-status.md` — parallel pre-launch track status (NEW; created at ST2 adoption)
- `/operations/handoffs/founder/2026-05-10-substrate-plugin-architecture-close.md` — predecessor close (eight decisions)
- `/operations/handoffs/founder/2026-05-12-build-plan-stress-test-ST2-close.md` — ST2 close (57-item triage record)
- `/website/public/component-registry.json` — source of truth for K-category inventory
- `/users-guide-to-sagereasoning.md` + `/summary-tech-guide.md` + `/summary-tech-guide-addendum-context-and-memory.md` — manuals consulted for K-category scope
- `/archive/2026-05-09-stoic-agent-substrate-staging-plan-superseded.md` — predecessor staging plan (preserved; superseded)
- `/archive/2026-05-12-staging-plan-amendments-source-of-amendment.md` — ST2 source amendment draft (archived at adoption)
- `/manifest.md` — full manifest (incorporates ST2 amendments R17g/h/i; R18a; AC9-AC13; CR-### register)
- `/operations/decision-log.md` — append-only decision trail (parent triage entry `D-STRESS-TEST-STAGING-PLAN-AMENDMENTS-2026-05-12`; adoption entry `D-STAGING-PLAN-AMENDED-FROM-ST2-2026-05-12`)

---

*End of amended staging plan. Adopted 2026-05-10; amended 2026-05-12. Operative reference for every execution session in the substrate-as-plugin build arc and the parallel pre-launch founder-personal-exposure track.*
