# Substrate-as-Plugin Staging Plan

**Status:** Adopted 2026-05-10 under `D-STAGING-PLAN-ADOPTED-2026-05-10`. Founder approved with eight open questions answered (see decision-log entry). Governing for every execution session in the build arc.
**Predecessor on file:** `/archive/2026-05-09-stoic-agent-substrate-staging-plan-superseded.md` (moved from `/drafts/` 2026-05-10 under `D-STAGING-PLAN-ADOPTED-2026-05-10`) — preserved unchanged per preserve-prior-versions; superseded by this plan.
**Governing frame:** `/adopted/standing-protocol-cache.md` + `/adopted/build-sessions-protocol-cache.md`.
**Decision basis:** the eight decisions/directions in `/operations/handoffs/founder/2026-05-10-substrate-plugin-architecture-close.md`; Rule A (licensing gate) and Rule B (holistic second pass) embedded in the planning method.

---

## Executive summary

This plan stages the build of the Stoic Agent Substrate as a plugin (or plugin family) installable via plugin marketplaces, alongside the migration of every existing SageReasoning product currently using the bundled-prose method to the translation-sandwich method. The plan covers six stages (with a licensing gate sitting between Stage 3 and Stage 4), an estimated 38–62 build sessions, and a critical path running through backend foundations → product migration → Layer 1 hardening → plugin internals → licensing gate → first marketplace listing → public open-source release → ecosystem polish.

What is in scope: every aspect of taking the agreed substrate architecture from "agreed on paper" to "first plugin shipped in a marketplace, Layer 1 reference open-sourced under a permissive licence, every existing product on the new substrate."

What is out of scope: post-launch ecosystem growth (community moderation, conference talks, partner integrations) beyond the minimum needed for a first credible release; multi-marketplace expansion beyond the first; any Sage Ops activation that follows from P7 in the project priorities.

The plan is **not** a launch-readiness review. It does not certify completion. It is a staged map of work to be executed in subsequent sessions.

---

## Architecture recap (for orientation)

The Stoic Agent Substrate has three layers. Layer 1 (text → structured features) is **open-sourced** under permissive licensing. Layer 2 (deterministic mechanism application) and Layer 3 (prose generation) are **closed and server-side**. The R20a distress perimeter operates as a three-layer defence: in-plugin script (fast local), server-side gate guarding Layer 2 (compliance), and Layer 3 deterministic injection of the distress pass-through statement (final enforcement). Two front-ends share one substrate: `sagereasoning.com` for human practitioners, plugins for agent developers — both call the same Layer 2 + Layer 3 backend services. Once the substrate is finalised, every existing SageReasoning product currently on the bundled-prose method swaps to the translation-sandwich method (the K-category).

---

## Stage-by-stage breakdown

### Stage 1 — Backend foundations (closed Layer 2 + Layer 3 services)

**Why first:** The closed Layer 2 + Layer 3 services are the moat. Nothing else can land until they are authoritative, signed, R20a-gated, and instrumented for cost. K-category migration depends on them. Plugin work depends on them. The website front-end (already on translation-sandwich for `/api/reason`) depends on the substrate being mature enough to migrate the rest of its surface.

**Items in this stage:**

| # | Item | Description | Risk | Est. sessions |
|---|---|---|---|---|
| A1 | Layer 2 server-side authentication infrastructure | Accept plugin-originated calls; existing user-auth pattern extended for plugin-originated traffic; dual-auth (KG4) as the canonical pattern | Critical (auth) | 2-3 |
| A2 | Layer 2 input validation surface | Accept Layer1Schema; clear error responses; type-enforced via constraints.ts pattern | Elevated | 1-2 |
| A3 | Layer 2 signing | Every authoritative Layer2Assessment cryptographically signed; verifiers (plugins, downstream agents) check signatures | Critical (crypto) | 2-3 |
| A4 | Key management | Signing keys managed, rotated, protected; rotation procedure documented | Critical (crypto) | 1-2 |
| A5 | Layer 3 server-side service | Generates prose from Layer 2 output; injects R3 disclaimer + R19 limitations + R20a distress pass-through deterministically | Critical (R20a) | 2-3 |
| A6 | Layer 3 `prose_mode` parameter | Enum of supported modes (clinical / terse / standard / educational); SageReasoning-authored, not community-extensible | Standard | 1 |
| A7 | Server-side R20a gate | Layer 2 of the three-layer R20a defence; guards Layer 2 API regardless of plugin behaviour | Critical (R20a / PR6) | 2 |
| A8 | V3 endpoint relationship design | Decide how each existing /api/score-* endpoint becomes a plugin-internal tool wrapper after migration; produce the mapping document | Standard | 1 |
| A9 | Cost monitoring restoration on the new substrate path (R5) | Layer 1 cost shifts to plugin; Layer 2 cost near-zero; Layer 3 cost stays metered; R5 cost-as-health-metric alerts re-pointed | Elevated | 1-2 |
| K1 | Inventory of bundled-prose consumers from registry | Read /website/public/component-registry.json + manuals; produce an authoritative list of consumers needing migration with current statuses | Standard | 1 |
| J1 | ADR — Stoic Agent Substrate concept | Captures the three-layer architecture, moat boundaries, and the substrate's structural role | Standard | 1 |
| J6 | R5 cost-as-health-metric impact assessment | New cost shape under translation-sandwich + plugin paradigm; revenue:cost ratio implications; alert threshold updates | Standard | 1 |

**Stage 1 dependencies:** A2 depends on A1. A3 depends on A1 + A4. A5 depends on A2 + A7 (so Layer 3 only runs on validated, R20a-gated, Layer-2-signed input). A6 depends on A5. A8 depends on K1 (need consumer inventory before mapping). A9 depends on A1–A5 being at least Scaffolded so cost paths can be instrumented.

**Stage 1 success criteria:**
- Layer 2 accepts authenticated, validated plugin-originated calls
- Every Layer 2 response is cryptographically signed and verifiable
- Layer 3 generates prose with R3 + R19 + R20a injections deterministically; supports `prose_mode`
- Server-side R20a gate live (PR1 single-endpoint proof first)
- Cost monitoring restored; alerts re-pointed; R5 health-metric ratio tracked
- ADR for the substrate concept adopted; bundled-prose consumer inventory produced

**Stage 1 estimated total:** 16–24 sessions.

**Stage 1 risk profile:** Mostly Critical. PR1 (single-endpoint proof) applies — A1, A3, A5, A7 each get proven on one endpoint before any rollout. PR6 applies to A7. AC5 perimeter rules apply.

---

### Stage 2 — K-category migration (existing products from bundled-prose to translation-sandwich)

**Why second:** The substrate is now finalised at the API level. Every existing consumer can be migrated. Migration findings feed back into substrate refinement (Stage 1 may receive amendments). The website front-end gets onto the new substrate before the agent-facing plugin is built, which means the website is the proving ground for the substrate's stability under real load.

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

**Stage 2 dependencies:** K1 → K2/K3/K4 → K5 → K6. K7 and K8 run continuously as migrations land. Tier 2 was already in progress before this plan; per-tier gating: Tier 3 begins only after Tier 2 verified; Tier 4–6 may run partially in parallel after Tier 3 substantially complete. D24 audit findings (existing perimeter audit) feed K3 sequencing — endpoints with open Critical-class findings get migrated in a way that resolves those findings as part of the migration rather than shipping migrations that preserve the issues.

**Stage 2 success criteria:**
- Every consumer in tiers 2–6 migrated to translation-sandwich
- Each migration verified with the M1-CP6-pattern verification (URL test + expected output)
- Cost shift observed; R5 alerts adjusted for new cost shape
- Substrate refinements (K7) folded back into Stage 1 outputs; no migration left "swap and done"
- Component-registry.json updated for each migrated component
- Pre-migration snapshots stored for /api/reason and /api/mentor/private/reflect per D24 audit

**Stage 2 estimated total:** 21–32 sessions (the largest stage by session count).

**Stage 2 risk profile:** Mixed. Tier 2 is Critical (R17 surface). Tier 3 each-route is Critical (R20a perimeter, PR6). Tier 4–6 mostly Elevated. K1–K6 are governance / planning / methodology — Standard.

---

### Stage 3 — Layer 1 hardening + plugin internals (closed phase, before licensing gate)

**Why third:** With substrate finalised (Stages 1–2), Layer 1 reference can be hardened against actual production behaviour rather than projected behaviour. Plugin internals can be built against confirmed Layer 2 + Layer 3 contracts. The decision-path mechanisms (action scorer, verification, subagent handoff, concern-radius credential) become possible only when the substrate is reliable. This is the last stage before the licensing gate; everything in this stage is **closed** preparation for what becomes public in Stage 4.

**Items in this stage:**

| # | Item | Description | Risk | Est. sessions |
|---|---|---|---|---|
| B1 | Layer 1 reference hardening | Cleaning, commenting, examples, version contracts for external use | Elevated | 2 |
| B2 | Layer 1 R20a script | Layer 1 of the three-layer R20a defence; runs locally inside the plugin | Critical (R20a / PR6) | 2 |
| B3 | Layer 1 input/output contract documentation | What the open Layer 1 produces (Layer1Schema) and how it's consumed by the closed Layer 2 API | Standard | 1 |
| B4 | Repository structure decision | Single repo / monorepo / substrate-as-package; how the open Layer 1 is organised for external consumption | Standard | 1 |
| B5 | Code-level documentation, examples, contribution guidelines | For community contributions to Layer 1 once public | Standard | 1-2 |
| C1 | Plugin manifest / metadata | Capability declarations, dependencies, version contract | Standard | 1 |
| C2 | Plugin skills | The Stoic reasoning workflow skill(s) inside the plugin | Elevated | 2 |
| C3 | Plugin tools | Connectors to closed Layer 2 + Layer 3 APIs | Elevated | 1-2 |
| C4 | Plugin scripts | Deterministic checks (in-plugin R20a from B2; validation; schema-linter) | Standard | 1 |
| C5 | Plugin hooks | Where the plugin integrates with the agent's loop (impression-capture, action-space-generation, post-action verification, subagent-handoff) | Elevated | 2 |
| C6 | Plugin assets | Open Layer 1 reference (from B); wiki content reference; primary-source citations; starter examples | Standard | 1 |
| C7 | Plugin documentation | Install guide, getting-started, examples, trust questions, security review status | Standard | 1-2 |
| C8 | Plugin variant strategy decision | One plugin with mode parameter (evaluative / prescriptive / augmentative-combo) vs a family | Standard | 1 |
| D1 | Action-scorer interface | `score(judgement, candidate_action) → kathekon_assessment`; mirrors human action scorer per Decision 5 | Elevated | 2 |
| D2 | Verification interface | `verify(examined_judgement, response) → alignment_record` | Elevated | 1-2 |
| D3 | Subagent handoff payload | Signed serialisable examined-judgement that travels with delegated tasks | Elevated | 2 |
| D4 | Concern-radius credential | Living trail of proximity movement, emitted by the plugin during normal operation | Elevated | 2 |
| D5 | Acceptance/rejection audit trail | Record of substrate-suggested options accepted or rejected | Standard | 1 |
| E1-E4 | Three-mode access (within plugin) | Pure structured / hybrid / pure text; mode selection logic; developer-facing API surface | Elevated | 2-3 |
| F1-F5 | Translation pattern wiki (initial) | Structure, format, initial corpus, governance, code linkage, test corpus | Standard | 3-4 |
| J3 | ADR plugin-as-end-goal | Captures Decision 2 | Standard | 1 |
| J4 | ADR three-layer R20a defence | Captures Decision 3 | Standard | 1 |
| J7 | Manifest amendments | AC additions (e.g. AC9 for plugin distribution); new PR rules if needed; project-instructions updates | Elevated | 1-2 |
| J8 | Decision-log entries for the eight 2026-05-10 decisions | Backfill into the active decision log if not already present | Standard | 1 |

**Stage 3 dependencies:** B1 depends on Stage 1 + 2 substantially complete. B2 depends on B1 (the open Layer 1 reference is the input to the local R20a script). B3 depends on Stage 1 (Layer 2's accepted contract). C1–C5 depend on B1–B5 + Stage 1. C8 (variant strategy) gates whether subsequent stages plan for one plugin or a family. D1–D5 depend on C5 (hooks). E1–E4 depend on B1 + C1–C5. F1–F5 can run partially in parallel with C/D/E.

**Stage 3 success criteria:**
- Layer 1 reference hardened, documented, ready for external consumption
- In-plugin R20a script verified against the local-fast / server-canonical contract
- Plugin manifest, skills, tools, scripts, hooks, assets, documentation produced
- Variant strategy decided
- Decision-path mechanisms (D1–D5) implemented and tested against the hardened substrate
- Three-mode access surface tested (E1–E4)
- Initial translation-pattern wiki content produced (F1–F5; F6 publication deferred to post-gate)
- ADRs J3 + J4 adopted; manifest amendments adopted; decision-log backfill complete

**Stage 3 estimated total:** 28–37 sessions.

**Stage 3 risk profile:** Mixed. B2 is Critical (R20a perimeter, PR6). C2/C3/C5/D1–D4/E1–E4 are Elevated. The rest is Standard. PR1 (single-endpoint proof) applies to C5 hooks before they roll out to all integration points.

---

### LICENSING GATE (Rule A) — between Stage 3 and Stage 4

**Why this is a gate, not a stage:** Per Rule A, licensing is not a generic Stage 1 item distributed across the plan. It is the boundary that separates "all closed preparation" from "first public exposure." Until the gate is cleared, nothing in `/adopted/` of the open Layer 1 reference, no plugin in any marketplace, no public announcement, no public repository commit. The work in this gate is small in volume but consequential.

**Items at the gate:**

| # | Item | Description | Risk | Est. sessions |
|---|---|---|---|---|
| H1 | Licensing strategy decision (Layer 1 reference) | Permissive (MIT vs Apache vs other); the moat is on Layer 2 + Layer 3 services so permissive is defensible | Elevated | 1 |
| H2 | Plugin licensing | Separate from Layer 1 reference; can be proprietary with bundled open components | Elevated | 1 |
| H3 | Lawyer review | At the gate, before any public release. Covers H1, H2, brand and trademark posture, plugin economics legal posture | Critical (legal) | 2-3 (incl. lawyer turnaround) |
| H4 | Licence files committed; attribution preserved; trademark posture documented | Mechanical execution after H3 sign-off | Elevated | 1 |
| J2 | ADR — open-Layer-1-only / closed-Layer-3 decision | Captures Decision 1 with the licensing implications | Standard | 1 |
| J5 | ADR — licensing strategy | Captures H1–H4 decisions and reasoning | Standard | 1 |

**Gate-clearing criteria:**
- H1 + H2 decisions adopted by founder
- Lawyer (engaged at the start of the gate; cf. project priorities P3 budget) signs off on H1, H2, brand/trademark posture, plugin economics legal frame
- H4 mechanical work done: licence files committed to repos, attribution preserved, trademark notices consistent
- ADRs J2 and J5 adopted; cross-referenced from the staging plan

**Nothing public ships until all six gate-clearing criteria are true.** "Public" includes: open-sourced repository made public; plugin listed in any marketplace (even private/preview); any external announcement.

**Gate estimated total:** 5–7 sessions. Lawyer turnaround time may extend wall-clock duration; session count refers to founder-AI work.

**Gate risk profile:** Critical at H3 (legal sign-off has consequences). Elevated at H1–H4 (decisions affecting downstream legal posture).

---

### Stage 4 — First public release (plugin packaging + first marketplace listing)

**Why fourth:** With substrate finalised, Layer 1 hardened, plugin internals built, and licensing cleared, the plugin can be packaged for one marketplace and listed. Single marketplace first per PR1 (single-endpoint proof before rollout — extended to "single marketplace before multi-marketplace"). Cowork is the candidate first target per Decision 5.

**Items in this stage:**

| # | Item | Description | Risk | Est. sessions |
|---|---|---|---|---|
| G1 | First marketplace target decision | Cowork (most likely per Decision 5) / Claude Code / Codex / multi-simultaneous; this stage commits | Standard | 1 |
| G2 | Per-marketplace packaging | Plugin format conversions if needed; build pipeline for the chosen marketplace | Elevated | 2 |
| G3 | Marketplace listing design | Name, description, screenshots, trust signalling, brand presence | Standard | 1-2 |
| G4 | Marketplace review and approval | Plugin review process per marketplace; iteration on review feedback | Elevated | 2-4 (incl. review turnaround) |
| G5 | Plugin update mechanics and version compatibility | Backward compatibility, deprecation paths, update mechanisms | Standard | 1 |
| G6 | Plugin economics | Free-to-install with paid services via connectors; pricing strategy for Layer 2 + Layer 3 service usage; per-call vs subscription | Elevated | 2 |
| I5 | Plugin trust signalling in marketplaces | Verified badges, security review status, audit posture | Standard | 1 |

**Stage 4 dependencies:** G1 depends on Stage 3 substantially complete and the licensing gate cleared. G2 depends on G1. G3 depends on G2. G4 depends on G3. G5 + G6 + I5 can run in parallel with G3/G4. The K-category should be substantially complete by the start of Stage 4 — the website front-end on the substrate makes the live data visible to potential plugin reviewers and earns the trust signalling.

**Stage 4 success criteria:**
- First marketplace target committed; reasoning recorded in decision log
- Plugin packaged for that marketplace
- Listing approved and live
- Update mechanics, version compatibility, plugin economics documented and operational
- Trust signalling (badges, security review status) in place on the listing

**Stage 4 estimated total:** 10–15 sessions.

**Stage 4 risk profile:** Mostly Elevated. G2 (packaging changes) and G4 (review-driven changes) and G6 (economics) are the higher-risk items. PR1 (single-endpoint proof) applies — single marketplace first, rollout to others only after first listing has produced telemetry.

---

### Stage 5 — Public open-source release of Layer 1 + announcement

**Why fifth:** Plugin is in market. Telemetry is flowing. Now is the moment to release the Layer 1 reference publicly (separate repo or as the plugin's open component) with announcement and community engagement. Not before, because the plugin's behaviour in market validates the substrate; the open release lands on a substrate that has been observed, not projected.

**Items in this stage:**

| # | Item | Description | Risk | Est. sessions |
|---|---|---|---|---|
| I1 | Public announcement | When, where, with what framing; coordinated with marketplace listing visibility | Elevated | 1-2 |
| I2 | Community engagement | Anthropic developer ecosystem, MCP community, philosophy communities, agent-protocol communities | Standard | 2-3 |
| I4 | Brand and trademark protection | Distinguishing open SageReasoning Layer 1 from authoritative SageReasoning Layer 2 + Layer 3 services | Elevated | 1 |
| F6 | Wiki publication form | Embedded asset in plugin and/or freestanding public site | Standard | 1-2 |

**Stage 5 dependencies:** All items depend on the licensing gate cleared and Stage 4 completed. I1 depends on I4 (announcement makes brand/trademark assertions). I2 depends on I1.

**Stage 5 success criteria:**
- Layer 1 reference publicly available under the chosen permissive licence
- Public announcement landed
- Community engagement in motion (issues, PRs, discussions)
- Brand and trademark posture clear; wiki published

**Stage 5 estimated total:** 5–8 sessions.

**Stage 5 risk profile:** Elevated. I1 (announcement) is one-shot — once it lands, it lands. Drafting and review discipline matters.

---

### Stage 6 — Standards-formation + ecosystem polish

**Why sixth (and explicitly post-launch):** Standards-formation and ecosystem expansion are slower-tempo work that benefits from real adoption signal. Working on standards before adoption is speculative; working after is grounded in observed need. Multi-marketplace expansion follows the same logic.

**Items in this stage:**

| # | Item | Description | Risk | Est. sessions |
|---|---|---|---|---|
| I3 | Standards-formation engagement | Smaller scope under plugin paradigm but still relevant for credential interoperability and Layer 1 input contract | Standard | ongoing |
| Multi-marketplace expansion | Second/third marketplace listings; per-marketplace packaging | Elevated | 4-6 |
| D-extensions | Refinements of D1–D5 driven by production telemetry | Elevated | ongoing |
| E-extensions | Refinements of E1–E4 mode-access surface | Standard | ongoing |
| F-extensions | Wiki growth and pattern corpus expansion | Standard | ongoing |
| Post-launch refinements | Any items surfaced by Stages 4–5 telemetry | Variable | continuous |

**Stage 6 dependencies:** Depends on Stages 4–5 complete with telemetry flowing. Ongoing rather than time-bounded.

**Stage 6 success criteria:** open-ended. This stage runs continuously alongside Sage Ops (P7) and post-launch product evolution.

**Stage 6 estimated total:** ongoing. First three months of Stage 6 likely to be 6–10 sessions for the core ecosystem polish; thereafter steady-state.

---

## Dependency map (high-level)

```
Stage 1 (Backend foundations)
  ↓
Stage 2 (K-category migration) ← migration findings refine Stage 1 (K7 feedback loop)
  ↓
Stage 3 (Layer 1 hardening + plugin internals)
  ↓
LICENSING GATE (Rule A)
  ↓
Stage 4 (First marketplace listing)
  ↓
Stage 5 (Public open-source + announcement)
  ↓
Stage 6 (Standards-formation + ecosystem polish — ongoing)
```

**Within-stage critical chains:**

- **Stage 1:** A1 → A2 → A3 → A5 → A6; A7 lands in parallel after A1; A8 + A9 + K1 + J1 + J6 run partially in parallel
- **Stage 2:** K1 → K2/K3/K4/K5 → K6 → first migration → subsequent migrations; K7 and K8 are continuous loops
- **Stage 3:** B1 → B2 → B3; B4 → B5; B1 + B5 → C1–C7; C8 gates downstream variant work; D1–D5 depend on C5; E1–E4 depend on B + C; F1–F5 partially parallel with C/D/E
- **Gate:** H1 + H2 → H3 → H4; J2 + J5 land alongside
- **Stage 4:** G1 → G2 → G3 → G4; G5 + G6 + I5 partially parallel
- **Stage 5:** I4 → I1 → I2; F6 lands in parallel

---

## Critical path

The shortest end-to-end chain that determines overall arc length:

```
A1 → A3 → A5 → A7 → A9
  → K1 → K2 → K3 → K7
  → Tier 2 migrations → Tier 3 migrations
  → B1 → B2 → C1–C5 → D1
  → H1 → H2 → H3 → H4
  → G1 → G2 → G3 → G4
  → I4 → I1
```

**Critical-path session estimate:** roughly 38–50 sessions if pursued without parallelism. With parallel work (see next section), end-to-end is closer to 35–42 sessions.

---

## Parallel work opportunities

Items that can run concurrently with their stage's critical path:

- **Stage 1:** A8, A9, K1, J1, J6 can run in parallel with A1–A7 (any session in their path can pick them up when A-thread is between sessions)
- **Stage 2:** Tier 5 (skill wrappers) can run partially in parallel with Tier 3 once methodology (K2–K6) is settled; skills are largely "verify the wrapper handles new payload" so they don't block on the perimeter routes' R20a-perimeter work
- **Stage 3:** F1–F5 (wiki) runs partially in parallel with C/D/E; J3, J4, J7, J8 (governance) are session-fillers between code-heavy sessions
- **Stage 4:** G5, G6, I5 run in parallel with G2/G3/G4
- **Stage 5:** F6 runs in parallel with I1/I2
- **Stage 6:** Everything is parallel by definition; no critical path

---

## Open questions surfaced during planning (require founder decision before execution)

1. **Variant strategy (C8)** — single configurable plugin or a family? This decision shapes Stage 3's plugin internals work substantially. Recommendation: single plugin with mode parameter for the first marketplace listing; revisit family-strategy after first-listing telemetry. Decision required before Stage 3 begins.

2. **Repository structure (B4)** — single repo / monorepo / substrate-as-package? Affects how the open Layer 1 reference is consumed. Decision required before Stage 3 begins.

3. **First marketplace target (G1)** — Cowork is the candidate per Decision 5. Recommendation: confirm Cowork as the first target. Decision required before Stage 4 begins.

4. **Lawyer engagement timing** — project priorities specify "begin no later than P3"; this plan's licensing gate is between Stage 3 and Stage 4 (which is past where P3 sits). Recommendation: engage lawyer at the start of Stage 3 so review is queued in parallel with Stage 3 work, ready when Stage 3 closes. Decision required before Stage 3 begins.

5. **Migration sequencing within Tier 3 (R20a perimeter)** — D24 audit identified existing Critical-class issues (e.g., /api/reflect's user_id mismatch). Should those be resolved before migration begins, during migration, or as separate critical-fix sessions? Recommendation: per-route case-by-case during migration sequencing; the migration session for a route resolves any open Critical findings as part of the migration. Decision can be deferred to K3 sequencing.

6. **Cost shape for migrated website endpoints (K5)** — moving from bundled-Sonnet to translation-sandwich (Sonnet for L1 + Sonnet for L3) doubles per-call LLM cost on the website. R5 alert thresholds need adjustment; revenue-to-cost ratio sensitivity. Decision required before Stage 2 cuts over the first revenue-affecting endpoint.

7. **Plugin economics (G6)** — free-to-install with paid services via connectors is the standard pattern. Specific tariff (per-call / subscription / hybrid) is open. Decision required before Stage 4's G6 lands.

8. **Trust signalling (I5)** — the substrate makes ethical claims; trust signalling matters more than for utility plugins. What additional signalling does this plugin carry beyond standard marketplace verification? Recommendation: link to limitations page, security review status, R18 honest-certification language. Decision can be made during Stage 4.

---

## Recommended first three stages (with reasoning)

**Stage 1 — Backend foundations.** Highest priority because every other piece of work depends on this. The closed Layer 2 + Layer 3 services are the moat; until they are authoritative, signed, R20a-gated, and instrumented, no migration can land and no plugin can ship. Critical-risk work concentrates here (auth, signing, R20a perimeter), so PR1 (single-endpoint proof) and Critical Change Protocol discipline apply throughout.

**Stage 2 — K-category migration.** Second because the substrate is then exercised under real load by the website front-end before agent-developer-facing work begins. Migration findings refine the substrate — the K7 feedback loop is a feature, not a bug. The website becomes the proving ground; if the substrate cannot handle 191-component-registry's worth of consumer traffic, it cannot handle agent-developer traffic either. Tier 2 (private mentor reflect) was already in progress and continues here.

**Stage 3 — Layer 1 hardening + plugin internals.** Third because the substrate is now mature, production-tested, and ready for external consumption. The decision-path mechanisms (action scorer, verification, subagent handoff, concern-radius credential) become possible only when the substrate behaves predictably. The licensing gate sits at the end of Stage 3, immediately before any public exposure.

---

## Holistic second-pass review (Rule B)

This section is deliberately separate from the stage-by-stage breakdown above. Per Rule B, after the step-scoping is complete, a second pass examines the whole plan for cross-stage implications, efficiencies, time-bounded session repackaging, and minimal-mid-session-founder-input session design. The output of the second pass refines the staging plan; the original step-scoping is preserved for traceability.

### Cross-stage implications

**Implication 1 — Stage 1 + Stage 2 are coupled tighter than the linear sequence implies.** K7 (substrate refinements driven by migration findings) means Stage 2 reaches back into Stage 1 with amendments. Sessions that migrate a Tier 3 endpoint may discover that Layer 2's signature scheme has a gap, or Layer 3's prose_mode parameter needs an additional mode, or the server-side R20a gate needs an additional pattern. The plan must accept that "Stage 1 closed" is provisional — Stage 2 may re-open Stage 1 work, and that's expected. Practical implication: the staging plan does not require Stage 1 to be 100% Verified before Stage 2 begins; it requires Stage 1 to be Wired enough to support migration, with refinement loops planned in.

**Implication 2 — Stage 3 plugin internals depend on the K-category being substantially complete, not just methodologically ready.** The plugin's open Layer 1 must produce input that all migrated Layer 2 endpoints accept consistently. If migration is still discovering edge cases, the plugin's Layer 1 contract will be unstable. Practical implication: Stage 3 should not begin until Stage 2 Tier 3 (R20a perimeter routes) is substantially complete — at least 5 of the 7 perimeter routes Verified.

**Implication 3 — The licensing gate touches every artefact.** Once the gate is cleared and the licence is committed, retrospectively changing licensing on already-public material is hard. Therefore: anything that could plausibly be published needs licensing-clean status before the gate. Practical implication: Stage 3's wiki content (F1–F5), examples, documentation, and plugin assets all need to be original-or-attributed before the gate. A subtask should run during Stage 3 to attribute any third-party material in F-content.

**Implication 4 — D24 audit findings are pre-existing technical debt that intersects with K-category migration.** D24 found issues at /api/reflect (Critical PR6 issues) and /api/score-decision (Ops Hub malformed body, missing distress handling, partial R20a coverage) and /api/score (partial R20a input coverage) and /api/score-document (KG1 rule 2 candidates). The migration sessions for these routes carry the additional load of resolving open Critical findings. Practical implication: Tier 3 migration session estimates may be conservative; budget 1–2 extra sessions for D24-driven Critical fixes that surface during migration.

**Implication 5 — Founder verification capacity is the rate-limiting resource.** The founder cannot read TypeScript and verifies in plain language between sessions. Stage 1's Critical-risk sessions each require founder verification before next session can proceed. With ~15–25 Critical sessions in Stages 1–2, and founder verification adding ~10–15 minutes per Critical session, this is a non-trivial overhead. Practical implication: batch verification where possible — group small Critical changes into a single verifiable bundle when safety allows; provide verification scripts that produce a single pass/fail readout per change.

### Efficiencies (combinable / redundant / parallel)

**Efficiency 1 — Combine A8, J1, K1 into a single "inventory + ADR + endpoint mapping" session early in Stage 1.** All three are documentation work that benefits from being done together; A8 (V3 endpoint relationship) is informed by K1 (consumer inventory) and feeds J1 (substrate ADR). Estimated saving: 1–2 sessions.

**Efficiency 2 — Skill wrappers (K-category Tier 5) can be batched 3–4 per session rather than per-skill sessions.** The skill wrappers are factory wrappers around sage-reason; once the migration pattern is settled, they migrate similarly. Estimated saving: 3–4 sessions on Tier 5.

**Efficiency 3 — F1–F5 wiki content can be authored partially during Stage 2 migrations.** Each migration produces real translation-sandwich examples that become wiki test corpus (F5). Authoring the wiki structure during Stage 2 migrations rather than waiting for Stage 3 spreads the load. Estimated saving: 1–2 sessions.

**Efficiency 4 — J governance (J3, J4, J7, J8) is documentation work that fits into session edges.** Rather than dedicating sessions to ADRs and decision-log backfills, slot these into the closing 30–45 minutes of code-heavy sessions when the founder needs a lower-attention closing phase. Estimated saving: 2–3 sessions.

**Efficiency 5 — Lawyer engagement (H3) starts at the beginning of Stage 3, not at the gate.** Lawyer turnaround time runs in parallel with Stage 3's session work, so the lawyer review is ready by the time the gate is reached. Estimated saving: wall-clock time, not session count. Practical implication: founder schedules lawyer engagement at Stage 3 kickoff.

**Efficiency 6 — D-mechanisms (D1–D5) and E-mechanisms (E1–E4) can largely run in parallel.** D1–D5 are concerned with the agent's loop (action scorer, verification, subagent handoff, concern-radius credential, audit trail). E1–E4 are concerned with developer-facing access modes (pure structured / hybrid / pure text). They share infrastructure but don't block each other. Estimated saving: 3–5 sessions on Stage 3.

**Efficiency 7 — The component registry update is a routine afterwards.** Each migration that lands updates `/website/public/component-registry.json`. The update is part of the migration session, not a separate session. (This is already standard practice; calling it out here so the staging plan doesn't budget separate registry-update sessions.)

**Net efficiency saving:** approximately 10–17 sessions across the arc.

### Time-bounded session repackaging

The original step-scoping above is step-bounded ("session per item or per item-cluster"). Per Rule B, the plan packages work into time-bounded sessions instead. Recommended session length: **3–4 hours**, ending at the time budget or a natural pause (whichever comes first). A session may contain multiple steps; a step may span multiple sessions.

Indicative time-bounded packaging for the first 12 sessions (Stage 1 + start of Stage 2):

| # | Session focus | Items | Est. duration | Risk class |
|---|---|---|---|---|
| 1 | Stage 1 kickoff: Layer 2 auth scaffolding (PR1 single-endpoint proof) + ADR-substrate-concept | A1 (partial), J1 | 3 hr | Critical |
| 2 | Layer 2 auth Verified on first endpoint; begin A2 validation surface | A1 (complete), A2 (partial) | 3-4 hr | Critical → Elevated |
| 3 | A2 Verified; A3 signing scaffolding | A2 (complete), A3 (partial) | 3-4 hr | Elevated → Critical |
| 4 | A3 signing Verified; A4 key management | A3 (complete), A4 | 3-4 hr | Critical |
| 5 | A5 Layer 3 service scaffolding + A6 prose_mode + A8 endpoint mapping + K1 inventory | A5 (partial), A6, A8, K1 | 3-4 hr | Mixed |
| 6 | A5 Layer 3 Verified; A7 R20a gate scaffolding (PR1 single-endpoint proof) | A5 (complete), A7 (partial) | 3-4 hr | Critical |
| 7 | A7 R20a gate Verified; A9 cost monitoring restoration + J6 cost-impact ADR | A7 (complete), A9, J6 | 3-4 hr | Critical → Standard |
| 8 | Stage 1 close + Stage 2 kickoff: K2 migration plan template + K3 sequencing + K4 verification methodology | K2, K3, K4 | 3-4 hr | Standard |
| 9 | K5 cost impact assessment + K6 plugin-build interaction design + Tier 2 Phase-2 pass 1 continuation | K5, K6, Tier 2 work | 3-4 hr | Critical (Tier 2) |
| 10 | Tier 2 Phase-2 pass 1 continuation + Tier 2 Phase-2 pass 2 begin | Tier 2 work | 3-4 hr | Critical |
| 11 | Tier 2 Phase-2 pass 2 + first Tier 3 migration (recommend /api/score as the lowest-risk perimeter route) | Tier 2 work, Tier 3 first migration | 3-4 hr | Critical |
| 12 | Tier 3 second migration + K7 substrate refinement loop kickoff | Tier 3 work, K7 | 3-4 hr | Critical |

This is illustrative for the first 12 sessions; the same packaging discipline applies through to Stage 6. Sessions are budgeted at 3–4 hours; at the 4-hour mark, the session closes regardless of where the items stand (per the founder preference for fast bounded phases). The session-close handoff names what's complete, what's in-progress, and what's next — consistent with the lean session close template in the standing protocol cache.

### Minimal-mid-session-founder-input session design

Per Rule B, sessions should be designed so the founder elects scope at session-open and reviews/approves at session-close — and in between, the AI works without needing decisions or clarifications. The five mechanisms that make this possible:

1. **Pre-decided variant strategy and scope at session-open.** The session prompt should include any decisions the AI needs (Decision 5 marketplace target, C8 variant strategy, B4 repo structure, etc.) — already-decided or pre-decided this session. The eight "Open questions surfaced during planning" above are the candidates for founder decision before Stage 3 begins.

2. **Step-scoped mid-session checkpoints.** Within a 3–4 hour session, the AI runs 2–4 internal checkpoints where it pauses, takes stock, and decides the next half-session worth of work using already-stated decisions. The founder is not asked at these checkpoints unless something genuinely outside scope appears.

3. **Pre-loaded living-state references.** Session-open includes the build-arc cache + standing cache + predecessor close + relevant living-state references (component registry, manuals). The AI does not interrupt mid-session to ask "where is X?" because the references were loaded at open.

4. **Critical-change discipline.** For Critical-risk work, the AI completes the Critical Change Protocol (0c-ii) inline before deployment rather than asking permission mid-session. The founder has pre-approved the session at session-open; the Critical Change Protocol writeup is a verification artefact, not a real-time decision point.

5. **End-of-session founder verification block.** Each session close includes a Founder Verification block with exact paths, expected results, and copy-paste commands. The founder verifies between sessions, not during them.

### Risks visible only at the holistic level

**Risk 1 — Stage 3's plugin variant strategy decision (C8) gates a lot of work.** If C8 lands as "family of plugins" rather than "single plugin with mode parameter", Stage 3's session count grows by ~40%. Recommendation: founder makes C8 decision at the start of Stage 3 and does not revisit it; the plan budgets for the single-plugin interpretation by default.

**Risk 2 — D24 audit-driven Critical fixes during Tier 3 migrations may concentrate at the end of Tier 3 sequencing.** If sequencing places /api/reflect last (sensible, since R17 surface is most sensitive), the D24 issues there land late. Recommendation: pair D24-affected routes with non-D24 routes in sequencing so Critical fixes are spread across the migration arc rather than concentrated.

**Risk 3 — The licensing gate's lawyer turnaround risks blocking Stage 4.** If lawyer engagement starts at gate-open rather than Stage-3-open, the gate becomes a wall-clock blocker. Recommendation (per Efficiency 5): lawyer engagement starts at Stage 3 kickoff; review is queued in parallel.

**Risk 4 — Stage 5's public announcement (I1) is one-shot.** Drafting and review must precede the announcement; the announcement cannot be A/B-tested. Recommendation: Stage 5 includes a 1-session draft-and-review session for I1 before publication; founder explicit approval before publication.

**Risk 5 — Stage 6's "ongoing" framing risks indefinite drift.** Standards-formation and ecosystem polish without time-bounded checkpoints can absorb arbitrary session count. Recommendation: Stage 6 has explicit 3-month checkpoints where founder reviews substrate-platform health using R5 cost-as-health-metric and observed adoption; if either signal is weak, scope back rather than absorb more sessions.

**Risk 6 — Founder-AI collaboration knowledge gaps may surface mid-arc.** PR5 (knowledge-gap carry-forward) tracks concepts requiring re-explanation. If a concept recurs three times, it becomes a permanent KG entry. Stage 1's plugin-substrate work introduces several novel concepts (signing infrastructure, key rotation, prose_mode parameter, Layer1Schema contract, three-layer R20a defence) that may surface as KG candidates. Recommendation: every session in this arc explicitly logs PR5 carry-forward in the close, and the planning-session founder review flags any concept the founder wants pre-explained as a session-opening artefact.

### Holistic-pass-net effect on session count

| Estimate type | Sessions |
|---|---|
| Step-scoped raw total | 85–123 |
| After efficiencies (Efficiency 1–7) | 75–106 |
| After time-bounded repackaging (sessions cap at 4 hr; multi-step sessions become routine) | 60–85 |
| After parallel-work confirmation (Stage 6 truly post-launch / parallel) | 50–70 |
| After Stage 6 deferred to ongoing (out of arc-completion scope) | 38–62 |

**Final arc estimate:** 38–62 sessions to first marketplace listing + public Layer 1 release + initial ecosystem polish. Stage 6 continues thereafter.

---

## Build-sessions-protocol-cache validation outcome

**Outcome:** Approved as written. Founder validated between sessions with no edits required (per founder direction stated at the end of the planning-session prompt). The cache has been moved from `/drafts/build-sessions-protocol-cache.md` to `/adopted/build-sessions-protocol-cache.md` in this session. Status header updated to "Adopted 2026-05-10 under D-BUILD-SESSIONS-CACHE-ADOPTED-2026-05-10". Cross-references inside the cache updated to reference the `/adopted/` location. The `/drafts/` predecessor file remains in place for git-history preservation per the preserve-prior-versions principle.

**The cache is now the operative reference for every build-arc session** alongside `/adopted/standing-protocol-cache.md`. Future build-arc sessions read both caches at open plus the predecessor close plus the day's primary deliverable, and skip re-reading the architecture exploration transcripts and inbox research files.

---

## Cross-references

- `/adopted/standing-protocol-cache.md` — general session protocol
- `/adopted/build-sessions-protocol-cache.md` — build-arc-specific cache
- `/operations/handoffs/founder/2026-05-10-substrate-plugin-architecture-close.md` — predecessor close (eight decisions)
- `/operations/handoffs/founder/2026-05-10-plugin-build-staging-NEXT-SESSION-PROMPT.md` — this session's prompt
- `/website/public/component-registry.json` — source of truth for K-category inventory
- `/users-guide-to-sagereasoning.md` + `/summary-tech-guide.md` + `/summary-tech-guide-addendum-context-and-memory.md` — manuals consulted for K-category scope
- `/archive/2026-05-09-stoic-agent-substrate-staging-plan-superseded.md` — predecessor staging plan (preserved unchanged in archive, superseded by this plan; moved from `/drafts/` 2026-05-10 under `D-STAGING-PLAN-ADOPTED-2026-05-10`)
- `/manifest.md` — full manifest (R0–R20, AC1–AC8, KG1–KG7)
- `/operations/decision-log.md` — append-only decision trail

---

*End of staging plan. Pending founder review and approval. Once approved, moves to `/adopted/substrate-plugin-staging-plan.md` and becomes the operative reference for every execution session in the arc.*
