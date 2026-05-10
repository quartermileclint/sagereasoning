# ADR-stoic-agent-substrate-concept: The Three-Layer Stoic Agent Substrate

**Status:** Adopted 2026-05-10 under `D-A1-LAYER2-AUTH-SCAFFOLD-2026-05-10` (companion entry capturing this ADR's adoption alongside the first execution-session work). Drafted in the Stage 1 kickoff session per Stage 1 item J1 of `/adopted/substrate-plugin-staging-plan.md`.
**Date:** 2026-05-10.
**Stream:** founder.
**Governing frame:** `/adopted/standing-protocol-cache.md` + `/adopted/build-sessions-protocol-cache.md`.
**Deciders:** Founder (sole signatory).
**Implements / serves:** the substrate concept underlying P0 0h hold-point capability work; the seven build-arc decisions in `/operations/handoffs/founder/2026-05-10-substrate-plugin-architecture-close.md`; the eight 2026-05-10 founder decisions captured in `D-STAGING-PLAN-ADOPTED-2026-05-10`. R20a (vulnerable user detection — three-layer defence); R3 (evaluative disclaimer — Layer 3 deterministic injection); R19 (limitations — Layer 3 deterministic injection); R17 (intimate data — Layer 2 + Layer 3 closed and server-side, never exposed); AC5 (R20a perimeter); AC7 (auth surface); AC8 (translation-sandwich substrate, already canonical at `/api/reason` per M1-CP6 cutover); PR1 (single-endpoint proof discipline); PR6 (safety-critical changes are Critical).

**Cross-references:**
- `/adopted/substrate-plugin-staging-plan.md` — the staged build plan governing this work
- `/adopted/build-sessions-protocol-cache.md` — build-arc-specific session-opening reference
- `/operations/handoffs/founder/2026-05-10-substrate-plugin-architecture-close.md` — the agreed architecture and seven decisions
- `/operations/handoffs/founder/2026-05-10-substrate-plugin-staging-close.md` — predecessor close (planning-session output)
- `/operations/handoffs/founder/2026-05-10-stage-1-kickoff-NEXT-SESSION-PROMPT.md` — this session's prompt
- `/adopted/ADR-RAG-MENTOR-ALT3-01-translation-sandwich-deterministic-engine.md` — the Phase-1 translation-sandwich architecture, of which this substrate is the operational continuation
- `/adopted/ADR-ENCRYPTION-WIRING-01.md` — encryption-wiring ADR (R17 protections that the closed Layer 2 + Layer 3 inherit)
- `/website/src/app/api/reason/route.ts` — the canonical translation-sandwich consumer (M1-CP6 cutover 2026-05-08); the substrate's first proven endpoint
- `/website/src/lib/translation-sandwich/parallel-run.ts` — `runSandwich` orchestrator (Layer 1 + Layer 3 wiring; Layer 2 deterministic engine in between)
- `/website/public/component-registry.json` — source of truth for K-category migration scope (191 components)
- `/manifest.md` — full manifest (R0–R20, AC1–AC8, KG1–KG7)

---

## Plain-language summary

This ADR captures, at the architectural level, **what the Stoic Agent Substrate is** — the system underneath both `sagereasoning.com` (for human practitioners) and the forthcoming plugin (for agent developers). It does not specify implementation details; those live in subsequent ADRs (signing infrastructure, key management, plugin packaging, marketplace targeting). It is the anchor document that every subsequent build-arc session can cite without re-explaining the architecture.

The substrate has three layers. **Layer 1** turns natural-language input into structured features. **Layer 2** applies deterministic Stoic mechanisms (the engine — control filter, passion diagnosis, oikeiosis, value assessment, appropriate action, iterative refinement). **Layer 3** turns Layer 2's structured assessment back into natural-language prose for the consumer (human practitioner or agent developer). Layer 1 is **open** under permissive licensing (specific licence to be determined at the licensing gate per Rule A); Layers 2 and 3 are **closed and server-side**.

The substrate's structural role is to deliver consistent, auditable, R20a-protected reasoning across multiple front-ends — the website for humans, the plugin for agent developers — so a human's reasoning and an agent's reasoning are produced by the same authoritative engine.

---

## Context

### Why this ADR now

The substrate has been finalised at the conceptual level across two prior sessions:

1. The 2026-05-10 architecture session produced eight decisions (`D-BUILD-SESSIONS-CACHE-ADOPTED-2026-05-10` records the cache that captures them).
2. The 2026-05-10 staging session drafted the six-stage build plan with the licensing gate and migration scope (`D-BUILD-PLUGIN-STAGING-PLAN-DRAFTED-2026-05-10`).
3. The founder approved the staging plan with eight open questions answered between sessions; the plan moved to `/adopted/` in this session (`D-STAGING-PLAN-ADOPTED-2026-05-10`).

Stage 1 of the staging plan names J1 — this ADR — as the architectural anchor for every subsequent build-arc session. Without this ADR, every later session would have to re-establish what the substrate is before doing the work in front of it. With this ADR adopted, later sessions cite it.

### What already exists in the codebase

- **The translation-sandwich substrate is already wired and canonical at `/api/reason`** per the M1-CP6 cutover (2026-05-08, `D-M1-CP6-CUTOVER-2026-05-08`). The bundled engine has been retired from this route. `runSandwich` (Layer 1 → Layer 2 → Layer 3) is the sole user-facing path.
- **Layer 1 module** at `/website/src/lib/translation-sandwich/` produces structured features from text input via Sonnet (per AC1 model selection — multi-step structured extraction).
- **Layer 2 deterministic engine** at `/website/src/lib/translation-sandwich/` applies the Stoic mechanisms deterministically (no LLM in the engine itself; LLM-supplemented sub-steps where named).
- **Layer 3 prose service** at `/website/src/lib/translation-sandwich/layer3-prose.ts` generates per-consumer prose via Sonnet, with deterministic R3 evaluative-disclaimer injection.
- **R20a perimeter** is operational at `/api/reason` (line 177) via the two-stage distress classifier (`detectDistressTwoStage`) wrapped by `enforceDistressCheck`. The wrapper enforces compile-time proof that the classifier has been awaited before any reasoning proceeds (per AC4 + PR6).
- **Authentication** at `/api/reason` already uses a dual-pattern: Supabase JWT for user sessions (`requireAuth`) plus API-key for agent traffic (`validateApiKey`). The plugin-originated auth this ADR anticipates extends this dual-pattern with a third path.
- **Encryption** for intimate data uses AES-256-GCM via `server-encryption.ts` per `ADR-ENCRYPTION-WIRING-01`.

### What does not yet exist

- **Layer 2 signing infrastructure** — every authoritative `Layer2Assessment` cryptographically signed; verifiers (plugins, downstream agents) check signatures. This is Stage 1 item A3.
- **Key management** for signing keys — rotation procedure documented; keys protected. This is Stage 1 item A4.
- **Server-side R20a gate** specifically for plugin-originated traffic at the Layer 2 ingress (the website front-end's R20a is at the route handler; the substrate-level gate must protect Layer 2 regardless of caller). This is Stage 1 item A7.
- **Plugin-auth check** on Layer 2 endpoints (in addition to existing user-auth and API-key auth). This is Stage 1 item A1, scaffolded in this session as the PR1 single-endpoint proof on `/api/reason` behind a feature flag set to off.
- **K-category migration** — every existing bundled-prose consumer (per `/website/public/component-registry.json`) migrated to translation-sandwich. This is Stage 2.
- **Plugin packaging** for marketplace listing. This is Stage 4 (after the licensing gate).

### Why the architectural choice matters now

Stage 1's first execution session (this session) scaffolds Layer 2 plugin authentication. Without this ADR, the plugin-auth scaffolding has no anchor explaining *why* Layer 2 is the surface that needs plugin-auth (vs Layer 1, which is open and runs in the plugin). This ADR provides that anchor. It also establishes the boundary that R17 + R20a + signing infrastructure all sit on the closed side — clarity about the open/closed boundary is load-bearing for every Stage 1 item.

---

## Decision

**The Stoic Agent Substrate is a three-layer system with one open layer and two closed layers, serving two front-ends from one server-side substrate.**

### The three layers

**Layer 1 — Text → structured features (open).**
Input: natural-language text describing a decision, action, situation, or judgement.
Output: a structured `Layer1Schema` capturing the input's relevant features (the decision-frame, the candidate actions, the agent's stated values, the proximate stakeholders, etc.) in a form Layer 2 can consume.
Implementation: LLM-mediated extraction (currently Sonnet per AC1; the open Layer 1 reference distributed in the plugin will document the prompt schema and the expected output contract).
Posture: **open-sourced** under permissive licensing (specific licence to be determined at the licensing gate per Rule A).
Why open: the substrate's value is in the closed Layer 2 mechanism application and Layer 3 trustworthy prose — not in extracting features from text. Open-sourcing Layer 1 enables ecosystem participation (alternative implementations, schema extensions, community-contributed examples) without exposing the moat.

**Layer 2 — Deterministic mechanism application (closed, server-side).**
Input: a validated `Layer1Schema` (signed by Layer 1 if Layer 1 ran in a plugin; signed by the substrate if Layer 1 ran on the substrate).
Output: a `Layer2Assessment` containing the mechanism outputs (control filter result, passion diagnosis, oikeiosis proximity, value assessment, appropriate-action surfacing, optional iterative-refinement output) plus a cryptographic signature establishing authenticity.
Implementation: deterministic application of the Stoic mechanisms encoded in `/adopted/rag-mentor-alt3/operationalised-rules.md` (the 10 operationalised rules) and the canonical framework (the 9+1 mechanism taxonomy in `/adopted/rag-mentor-alt3/canonical-framework.md`). LLM-supplemented sub-steps where named (per AC1 — Sonnet for multi-mechanism reasoning; Haiku for single-mechanism quick-depth where appropriate).
Posture: **closed and server-side.** The mechanisms are the moat.

**Layer 3 — Structured assessment → prose (closed, server-side).**
Input: a validated, signed `Layer2Assessment` plus a `prose_mode` parameter (clinical / terse / standard / educational).
Output: a per-consumer prose deliverable (`{philosophical_reflection, improvement_guidance, summary}` plus deterministically-injected R3 evaluative disclaimer, R19 limitations statement, and R20a distress pass-through statement when applicable).
Implementation: LLM-mediated generation (currently Sonnet per AC1) with deterministic injection of the R3/R19/R20a statements (these statements never come from the LLM; they are injected by the Layer 3 service code per R3, R19c, R20a).
Posture: **closed and server-side.** The deliverable is the controlled output; trustworthy prose with the right disclaimers is part of the moat.

### The three-layer R20a defence

**Layer A — In-plugin script (fast local).**
A deterministic script bundled with the plugin that performs the first-pass distress check on the input text before any network call leaves the plugin. Catches the highest-confidence cases at the lowest latency and cost. Open-source per Layer 1's licensing posture (the script is part of what the plugin ships).
Implementation status: scaffolded in Stage 3 (build item B2).

**Layer B — Server-side gate at Layer 2 ingress (compliance).**
A deterministic gate sitting in front of Layer 2 on the substrate. Runs the two-stage distress classifier on every incoming `Layer1Schema` regardless of caller. Catches anything Layer A missed; catches anything where the plugin script has been bypassed, removed, or subverted.
Implementation status: scaffolded in Stage 1 (build item A7); operational at `/api/reason` already (the `enforceDistressCheck` wrapper at line 177 is the canonical reference).

**Layer C — Layer 3 deterministic injection (final enforcement).**
When a distress signal fires at any layer, the Layer 3 service code deterministically injects the R20a distress pass-through statement into the prose output regardless of what the LLM produced. The pass-through statement is a fixed-text deliverable that directs the user to appropriate professional support resources. This is the final guarantee that the user receives the redirection.
Implementation status: deterministic injection scaffold exists at `/api/reason` (the `distress_detected` branch returns the redirect message before any LLM call). The Layer 3 service-level injection (when a distress signal arises mid-pipeline rather than at perimeter) is scaffolded in Stage 1 (build item A5).

The three-layer R20a defence is **belt-and-braces**. Each layer is sufficient on its own; together they provide depth-in-defence against script bypass, network failure, and LLM hallucination.

### Two front-ends, one substrate

**Front-end 1 — `sagereasoning.com` for human practitioners.**
The website calls Layer 1 + Layer 2 + Layer 3 on the substrate (currently bundled at `/api/reason` post-M1-CP6; the rest of the surface is migrated as part of the K-category in Stage 2 of the staging plan). The website does not ship a plugin; Layer 1 runs on the substrate too for website calls. Cost shape: Sonnet (Layer 1) + deterministic engine (Layer 2) + Sonnet (Layer 3) per call. The cost-shape implications for migrated routes are an open question deferred to the cost-and-pricing session immediately before Stage 4 (founder decisions #6 and #7 from `D-STAGING-PLAN-ADOPTED-2026-05-10`).

**Front-end 2 — Plugin for agent developers.**
The plugin runs Layer 1 locally (open Layer 1 reference distributed with the plugin) and calls Layer 2 + Layer 3 on the substrate. The plugin handles the agent's loop integration (impression-capture, action-space-generation, post-action verification, subagent-handoff). Cost shape: deterministic engine (Layer 2) + Sonnet (Layer 3) per call from the substrate's perspective; the agent's host environment bears the Layer 1 cost. The plugin is licensed separately from Layer 1 (per Stage 3 / Gate item H2).

**One substrate.** Both front-ends call the same Layer 2 + Layer 3 backend services. The same authoritative reasoning engine. The same R20a defence. The same prose injection. The same signed assessments. Consistency across audiences is structural, not policy.

### The moat boundary

The moat sits jointly on **Layer 2 + Layer 3**, not on either alone. Layer 2 alone (deterministic mechanism outputs without prose) is too cryptic for direct consumer use; Layer 3 alone (prose generation without authoritative engine output) is just an LLM with a Stoic system prompt — the very thing the substrate exists to displace. The pair, working together with cryptographic signing, is the substrate's distinct contribution.

Layer 1 is **outside the moat** — it is open infrastructure. Anyone may build alternative Layer 1 implementations against the open contract; the substrate accepts any `Layer1Schema` that validates against the documented contract regardless of which Layer 1 produced it (subject to plugin-auth and signing requirements at Layer 2 ingress).

---

## Consequences

### What this enables

1. **Consistent reasoning across audiences.** A human practitioner using `sagereasoning.com` and an agent developer using the plugin both invoke the same Layer 2 + Layer 3. The reasoning is the same; the prose adaptation differs by `prose_mode`.
2. **Trust-signalable certification (R18).** The substrate's authoritative outputs can be cryptographically signed and verified by downstream agents. The plugin's marketplace listing (Stage 4) can carry honest claims about the substrate's R20a, R17, R19 protections backed by the closed-source service guarantees.
3. **Standards-formation potential for the Layer 1 input contract (Stage 6).** With the open Layer 1 reference public (Stage 5), the input contract becomes a candidate for ecosystem-wide adoption. Other agent frameworks could produce `Layer1Schema` compatible with the substrate.
4. **Per-consumer prose adaptation without per-consumer engine variants.** `prose_mode` is the single parameter controlling output style; the engine itself never branches on consumer identity. This keeps Layer 2 deterministic and auditable.
5. **K-category migration path (Stage 2).** Every existing SageReasoning product currently using bundled prose can migrate to translation-sandwich without changing the user-visible product behaviour. The substrate's structural consistency replaces the bundled engine's per-route variation.

### What this requires

1. **Signing infrastructure (Stage 1 A3 + A4).** Every authoritative `Layer2Assessment` needs a cryptographic signature. Verifiers need a key distribution mechanism. Keys need rotation. Critical Change Protocol applies (PR6).
2. **Plugin-auth on Layer 2 ingress (Stage 1 A1).** In addition to user-auth and API-key, the substrate needs to authenticate plugin-originated traffic. This session scaffolds the auth check behind a feature flag. Critical Change Protocol applies (PR6, AC7).
3. **Server-side R20a gate at Layer 2 ingress (Stage 1 A7).** Substrate-level R20a gate independent of caller. Critical Change Protocol applies (PR6, AC5).
4. **Cost monitoring on the new substrate path (Stage 1 A9).** Layer 1 cost shifts to plugin for agent traffic; Layer 2 cost is near-zero (deterministic); Layer 3 cost stays metered. R5 cost-as-health-metric alerts re-pointed.
5. **Per-consumer migration (Stage 2 K-category).** Each existing bundled-prose consumer migrated to translation-sandwich. Per-consumer cost shape (Sonnet + Sonnet for website calls) examined immediately before Stage 4 (deferred per founder decisions #6 and #7).
6. **Layer 1 hardening for external consumption (Stage 3).** Cleaning, commenting, examples, version contracts, repository structure (substrate-as-package per founder decision #2 from `D-STAGING-PLAN-ADOPTED-2026-05-10`).
7. **Licensing for Layer 1 (Stage 3 → Gate per Rule A).** Lawyer review at the gate. Specific permissive licence determined.
8. **Plugin packaging for first marketplace (Stage 4).** Cowork marketplace per founder decision #3 from `D-STAGING-PLAN-ADOPTED-2026-05-10`.

### What this rules out

1. **Per-consumer engine variants in Layer 2.** Layer 2 must remain deterministic and consumer-agnostic. Per-consumer adaptation lives entirely in Layer 3's `prose_mode` parameter or in Layer 1's input shaping (which the consumer controls).
2. **Closed Layer 1.** Closing Layer 1 would foreclose ecosystem participation and lock out alternative implementations. The substrate's structural choice is to open the input contract and protect the mechanism + deliverable.
3. **Prose generation in Layer 2.** Layer 2 outputs structured assessments only; prose lives in Layer 3. This separation enables per-consumer prose adaptation without engine variation, and enables auditability of the structured assessment independently of the prose deliverable.
4. **R20a as a single layer.** A single-layer R20a defence (whether the in-plugin script alone or the server-side gate alone) is brittle. The three-layer defence is the architectural commitment.
5. **Bypassing Layer 2 with direct Layer 3 calls.** Layer 3 only generates prose from a validated, signed `Layer2Assessment`. There is no direct text-in/text-out path through the substrate.

### Risks accepted

1. **Layer 1 open-source enables substrate-bypass attempts.** A hostile actor could build a Layer 1 implementation that produces deceptive `Layer1Schema` to manipulate Layer 2's output. Mitigations: input validation at Layer 2 ingress (AC validates structure but cannot validate content honesty); Layer 2's deterministic mechanisms are robust against adversarial inputs by design (the mechanisms ask "what is your judgement, what is the action, where is the proximity?" — adversarial inputs receive adversarial-input reasoning). Adversarial evaluation (R18d / Stage 4 / Priority 3 P3.3d) tests this.
2. **Cost shape on website front-end doubles per-call LLM cost.** Per-call cost increases from bundled-Sonnet to Sonnet+Sonnet on every migrated website route. Founder decisions #6 and #7 defer the cost-and-pricing examination to immediately before Stage 4. Stage 2 migrations proceed without per-route cost-acceptance gating.
3. **Three-layer R20a defence has triple operational surface.** Each layer is a maintenance and verification target. PR6 + AC4 + AC5 disciplines apply to each. Accepted because R20a protection is non-optional and depth-in-defence is the only credible posture.
4. **Plugin-auth surface is a new auth layer.** AC7 standing constraint (auth surface) applies. Critical Change Protocol applies to every change. PR6 applies. Accepted because the plugin paradigm requires it; the alternative (no plugin-originated traffic) precludes the agent-facing audience entirely.

---

## Open questions parked for downstream ADRs

1. **Specific permissive licence for Layer 1** — deferred to lawyer review at the licensing gate per Rule A. Tracked in `/adopted/build-sessions-protocol-cache.md` open-questions parking lot (Q7).
2. **Plugin variant strategy (single configurable plugin vs family)** — founder decision #1 from `D-STAGING-PLAN-ADOPTED-2026-05-10` is "single configurable plugin with mode parameter for the first marketplace listing; revisit family-strategy after first-listing telemetry." Applied at Stage 3.
3. **Repository structure (substrate-as-package)** — founder decision #2 from `D-STAGING-PLAN-ADOPTED-2026-05-10`. Each future endpoint is consumable as a package import. Applied at Stage 3.
4. **Signing key distribution mechanism** — JWT, W3C Verifiable Credentials, or hybrid (open-questions parking lot Q4). Decided at Stage 1 A3 ADR.
5. **Plugin governance model** — minimum-viable on day one; longer-term posture parked. Decided at Stage 3.
6. **Standards-formation engagement** — smaller scope under plugin paradigm; specific standards bodies and timing parked to Stage 6. Decided at Stage 6 outset.
7. **First marketplace target — Cowork.** Founder decision #3 from `D-STAGING-PLAN-ADOPTED-2026-05-10`. Applied at Stage 4.
8. **Lawyer engagement timing — Stage 3 start.** Founder decision #4 from `D-STAGING-PLAN-ADOPTED-2026-05-10`. Action item for the founder later in the arc.

---

## Status of this ADR's adoption

This ADR is **Adopted** as of 2026-05-10. It is the architectural anchor for every subsequent build-arc session. Subsequent ADRs (signing infrastructure, key management, plugin packaging, R20a layer-A in-plugin script, R20a layer-B server-side gate, R20a layer-C deterministic injection, K-category migration methodology, plugin-auth concrete design, etc.) cite this ADR as their architectural premise.

This ADR's adoption is recorded as a **Standard-risk** change under 0d-ii (documentation; no code touched in this ADR-drafting itself; the companion A1 scaffolding work in this session is Critical-risk and recorded separately under `D-A1-LAYER2-AUTH-SCAFFOLD-2026-05-10`).

If the substrate concept itself changes (e.g., Layer 1 becomes closed; the moat boundary shifts; the three-layer R20a defence is revised; the two-front-ends architecture changes), this ADR is amended in-place with an amendment record at the top, and the change is logged via a `D-STOIC-AGENT-SUBSTRATE-CONCEPT-AMENDED-YYYY-MM-DD` decision-log entry. Cross-references throughout the build-arc cache and staging plan are updated in the same session.

*End of ADR.*
