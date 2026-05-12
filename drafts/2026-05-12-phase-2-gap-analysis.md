# Phase 2 — Domain-by-Domain Gap Analysis (Build-Plan Stress-Test ST1)

**Status:** Drafted 2026-05-12 during ST1 of the Build-Plan Stress-Test session. Research-and-analysis artefact; **surfaces options + risks; does not prescribe**. ST2 triage decides which gaps enter the build plan, in what stages, and at what risk classification.
**Stream:** founder.
**Session input:** v2 prompt at `/operations/handoffs/founder/2026-05-10-build-plan-stress-test-NEXT-SESSION-PROMPT-v2.md`; Phase 1.5 Action Surface Audit (inline in ST1 chat; consolidated below as fixed input).
**Predecessor work:** three prep documents in `/drafts/` dated 2026-05-10; full-day close at `/operations/handoffs/founder/2026-05-10-full-day-close.md`; A4 Verified.
**Limitations:** Stress-test against May 2026 industry consensus; not exhaustive. Three of the 10 domains were heavily pre-covered by the prep documents; analyses below incorporate those findings rather than re-derive them. Web research per Standing Requirement 1 + 1a (multiple-query discipline; transparent uncertainty); Standing Requirement 2 consider-implications assessment applied compactly per material finding.

---

## Plain-language summary (read this first)

This Phase 2 output stress-tests the adopted staging plan against ten domains. The findings cluster into three groups:

**Group 1 — Critical security + safety gaps already substantially documented by the security audit, with Phase 1.5 adding seven Critical judge-layer gaps in the substrate's action surface.** The substrate is functionally a Judgment + Continuity primitive ("Character Kernel") with significant gaps where a real-world deployment would be vulnerable. Top items: no per-agent revocation; no agent/human identity distinction; no endpoint-auth inventory; McKinsey/Lilli JSON-key SQL vector untested; prompt-injection defence absent at Layer 1 + Layer 3; R17c deletion endpoint a 503 placeholder; A7 three-layer R20a middle layer scoped not built.

**Group 2 — Significant regulatory + accessibility + privacy obligations the build plan has not staged.** EAA enforcement live since June 2025 (~11 months ago at time of writing); EU AI Act GPAI obligations bite August 2027 (Article 50 transparency rules December 2026); Privacy by design under ISO/IEC 27701:2025 (October 2025; new AI-related controls). The build plan doesn't yet name compliance posture for any of these. Australia's regulatory environment is still voluntary (no mandatory guardrails legislated); GDPR exposure is the live binding obligation if any EU users are touched.

**Group 3 — Operational + business-foundation gaps that the founder, not the substrate, carries.** Legal entity structure (sole trader vs Pty Ltd), insurance (Tech E&O + Cyber + D&O), observability infrastructure (OpenTelemetry GenAI semantic conventions are now standard), onboarding UX patterns, and the marketplace economics question. These are not "the substrate's problem" in a code sense; they are the founder's-personal-exposure and operational-readiness problem.

**The headline finding:** the substrate is closer to where the founder's three-layer architecture intended than the staging plan's Stage 4 G3 trust signalling reflects. **Most of what's missing is foundational, not feature-level.** A substantial portion of Stage 1's remaining work + much of Stage 3's plugin-internals scope could be **simplified or replaced** by Anthropic-native infrastructure (Plugin spec; MCP; Agent Skills; Dreams; Outcomes; Multi-agent orchestration; CLAUDE.md; `/security-review`). And several non-product-scope items (legal entity, insurance, regulatory posture, observability) belong on the founder's pre-launch checklist before any marketplace listing.

The ten domain analyses below structure these findings into specific gaps with severity, stage placement, and risk classification. ST2 triage in the four-outcome framework (ALLOW / REVISE / BLOCK / ESCALATE) decides which enter the build plan.

---

## Phase 1.5 Action Surface Audit — consolidated input

For traceability, the Phase 1.5 audit produced 18 judge-layer-gap observations across the substrate's action surface. The 7 Critical ones — to be referenced repeatedly in Domain 1 (Security) — are:

1. **T3-9 / G1** — No per-agent revocation (single `PLUGIN_AUTH_SECRET`)
2. **T3-10 / G2** — No agent/human identity distinction at API layer
3. **T3-11 / G3** — No endpoint-auth inventory or CI check
4. **T3-12 / G4** — No JSON-key SQL injection audit
5. **T3-13 / T3-14 / G6** — No prompt-injection defence at Layer 1 or Layer 3
6. **T3-19** — A7 three-layer R20a middle layer scoped not built
7. **T4-4** — R17c genuine deletion endpoint returns 503 placeholder

The 7 Significant + 4 Minor are catalogued in the ST1 chat transcript and referenced by domain below.

---

## Domain 1 — Security

**What the build plan currently addresses:** A1 Layer 2 server-side authentication (Verified); A2 input validation surface (Verified); A3 Layer 2 signing (Verified); A4 key management (Verified); R17b encryption at rest; AC5 R20a perimeter (8 routes; AC4 invocation testing); AC7 auth-surface standing constraint; PR1 single-endpoint proof; PR6 safety-critical classification; Critical Change Protocol (0c-ii); three-copy backup ceremony; decision audit trail.

**What's missing (per security audit + Phase 1.5 audit):** the 7 Critical gaps catalogued above plus 8 Significant + 4 Minor. OWASP Agentic Top 10 2026 not mapped to manifest. No commitment to autonomous-agent red-team testing during development (R18d at Stage 4 only — too late). No agent-identity standard adoption decision (FIDO Alliance / Auth0 for AI Agents). No SBOM. No CSP headers. No security.txt / responsible-disclosure policy. No WAF beyond Vercel defaults.

**Concrete failure mode:** the McKinsey/Lilli replication — autonomous agent attacker probes the substrate's exposed surface in hours, finds unauthenticated endpoint(s) or JSON-key SQL vector, reads mentor-profile data and decision-log entries, exfiltrates before founder detects. With **no per-agent revocation**, the response is global rotation — every legitimate caller cut off — discouraging prompt revocation. Audit trail is reconstructable only at session-grain (decision log), not call-grain.

**Recommended amendments (3-4):**

| # | Amendment | Stage placement | Risk |
|---|---|---|---|
| S1 | **Per-agent credentials + revocation + identity discrimination.** New sub-stage A10 (or revisit A1). Per-install token issuance; per-token metadata (identity_type, install_id, scope); revocation list checked at every authenticated call; admin-only revocation API; revocation runbook mirroring rotation runbook. Closes G1 + G2 + T3-9 + T3-10. | Stage 1 (before Stage 2 K-category migration broadens exposure) | Critical |
| S2 | **Endpoint-auth inventory + CI check; JSON-key SQL audit; prompt-injection defence at Layer 1 + Layer 3.** Combined governance pass. Closes G3 + G4 + G6 + T3-11 + T3-12 + T3-13 + T3-14. Adopt `/security-review` GitHub Action + slash command as the recurring verification. | Stage 1 governance (1-2 sessions) + A5 ADR + B1 amendment | Standard (audit) → Critical (prompt-injection in safety surface) |
| S3 | **Autonomous-agent red-team probe added to verification methodology.** Folds into PR1 single-endpoint-proof discipline as part of Critical-tier verification. Closes R6/G9. | Verification framework amendment | Standard (process change) |
| S4 | **OWASP Agentic Top 10 2026 mapping (J7 manifest amendment).** Cross-references manifest rules to each OWASP Agentic 2026 risk; flags coverage gaps for future tracking. | Stage 3 J7 | Standard |

**Positioning impact:** **strengthens.** Character Kernel positioning requires the substrate to be securable in the manner agent-platform operators expect. Without S1-S2, the substrate's positioning as a "trust primitive" is undefended at the action boundary.

**Five-failure-modes diagnostic:** addresses **correlated judgment** (per-agent revocation prevents one-compromise-becomes-global-failure), **escalation drift** (audit logging differentiates agent-class behaviour from human-class), **policy drift** (endpoint inventory + CI check prevents oversight-driven auth gaps).

**Dogfood relevance:** **high.** A security-amendment decision is exactly the kind of consequential election that the substrate's Layer 2 mechanisms (control filter — what's in our power vs not; value assessment — does this serve the user's good?; kathekon assessment — does this action befit the role we claim?) can score via `/api/reason`. The audit's two-recommendations-that-feel-uncomfortable section (security as marketplace-listing prerequisite; engage penetration tester before Stage 4) is itself a substrate-consultable decision.

---

## Domain 2 — Regulatory + compliance

**What the build plan currently addresses:** R14 Regulatory Compliance Pipeline (named, scope ambiguous); manifest header carries `compliance_version: "CR-2026-Q2-v4"` + `applicable_jurisdictions: ["AU", "EU", "US"]` + 7 CR-### references with status (MONITORING / COMPLIANT / ALIGNED / PARTIAL); next regulatory review 2026-07-06; quarterly review cadence; change triggers named (EU AI Act classification guidance; Australia mandatory guardrails; Australian Privacy Act reform). No live binding-obligation register.

**What's missing:**
- **EU AI Act posture.** Substrate is plausibly a "GPAI deployer providing reasoning services." Article 50 transparency rules (e.g., "this output is AI-generated; this assessment is from an AI model") bite **2 December 2026** — 7 months from today. High-risk system rules (Annex III) pushed to December 2027 but apply if substrate is used in employment, credit, education, or law-enforcement settings via plugin integrations. **Not yet evaluated for posture.**
- **EAA (European Accessibility Act).** Enforcement live since **June 28, 2025** — already binding. Applies to non-EU businesses selling to EU customers. **sagereasoning.com is globally accessible; if any EU customer purchases the paid tier, EAA applies.** WCAG 2.1 AA + EN 301 549 v3.2.1 is the operative benchmark. Fines up to 4% global turnover.
- **GDPR.** Independent of AI Act; any EU user data triggers it. Mentor-profile encryption (R17b) is partial GDPR compliance; the R17c deletion endpoint as 503-placeholder is a **GDPR Article 17 (right to erasure) violation by design** if any EU user is in the mentor-profile pipeline.
- **CCPA / CPRA.** California users; similar deletion-right exposure.
- **Australia Privacy Act 1988** (live binding obligation for founder personally as a sole trader if any AU user data is touched). Reform legislation (mentioned in manifest as change trigger) has been progressing but not yet enacted.

**Concrete failure mode:** an EU user files a GDPR Article 17 deletion request; substrate cannot fulfil because R17c endpoint is a 503 placeholder. Regulatory fine + reputational damage + public-record GDPR complaint. Or: substrate listed in marketplace before EAA WCAG 2.1 AA work done; EU user with disability cannot use sagereasoning.com; EAA complaint filed; fine up to 4% global turnover.

**Recommended amendments (3-4):**

| # | Amendment | Stage placement | Risk |
|---|---|---|---|
| R1 | **R17c genuine deletion endpoint built (P0 priority 2d already names this as Critical).** Currently scoped at project priority P2 2d. Make it Stage 1 critical-path before Stage 2 K-category migration expands the surface; not after. Closes T4-4. | Stage 1 (insert before A5 if EU users plausible) | Critical |
| R2 | **EU AI Act Article 50 transparency posture decision.** Substrate's authoritative output is AI-generated; the cryptographic signing already establishes provenance. Adopt explicit Article 50 transparency language in R18 (honest certification) + add to manifest as new rule or AC item. Verify against Article 50 wording when text finalised. | Stage 1 governance (1 session) | Standard (decision); Elevated if it changes Layer 3 prose output | 
| R3 | **EAA + WCAG 2.1 AA compliance pass on sagereasoning.com.** Currently no accessibility audit. EN 301 549 v3.2.1 is the harmonised standard; WCAG 2.1 AA satisfies it. Either complete before any plugin shipping to EU markets, or geo-restrict EU customers explicitly until accessibility work lands. | Stage 1 / Stage 4 G2 packaging | Standard (audit) → Elevated (remediation) |
| R4 | **Manifest CR-### register populated with live binding obligations.** Currently empty (just status flags). Replace with: "GDPR Article 17 (deletion); EAA WCAG 2.1 AA (sagereasoning.com); Australia Privacy Act 1988; EU AI Act Article 50 (transparency); CCPA deletion rights." Each row with current posture + next-review date. R14 quarterly cadence operationalised. | Stage 1 governance + lawyer engagement (P3 critical-path) | Standard |

**Positioning impact:** **strengthens.** A substrate making honest-certification claims (R18) needs a live binding-obligation register; otherwise R18 is theatre. Character Kernel positioning is incompatible with "we have ethical claims but no GDPR posture."

**Five-failure-modes diagnostic:** **policy drift** is the dominant failure mode (regulatory obligations change; manifest must keep pace; quarterly review cadence already named in R14 but not operationalised).

**Dogfood relevance:** **medium.** Regulatory-posture decisions are largely founder + lawyer territory. Substrate can score "should we expand to EU now, or remain AU-focused until R17c lands" via control filter (what's in our power) + value assessment (does it serve the user's good or expose them to undelivered commitments).

---

## Domain 3 — Accessibility

**What the build plan currently addresses:** Nothing explicit. R18 honest certification, R20 vulnerable-user protection (R20a-d) — touches accessibility tangentially but no WCAG / EN 301 549 commitment.

**What's missing:**
- WCAG 2.1 AA conformance audit of `sagereasoning.com`
- EN 301 549 v3.2.1 specific requirements (e.g., AT compatibility for assessment tools; keyboard navigation; alternative input methods)
- Accessibility statement page (legally required in some jurisdictions)
- Cognitive accessibility considerations for the mentor surfaces (people in distress have impaired cognition; UX must be readable + navigable under stress)
- Plain-language version of philosophical content (Stoic terminology — *kathekon*, *philodoxia*, *penthos* — is jargon; accessibility = comprehensibility)

**Concrete failure mode:** EAA complaint from EU user with disability who cannot use sagereasoning.com (screen reader incompatible; insufficient colour contrast; no keyboard navigation through assessment flow). Fine + reputational damage. Or: founder ships plugin to Cowork marketplace; Cowork's accessibility review flags WCAG failures; listing rejected.

**Recommended amendments (2-3):**

| # | Amendment | Stage placement | Risk |
|---|---|---|---|
| A1 | **WCAG 2.1 AA audit + remediation pass.** Run accessibility tools (axe DevTools, Lighthouse, WAVE) on all sagereasoning.com pages; produce findings list; remediate. Estimated 2-4 sessions depending on findings. | Stage 1 governance / Stage 2 (parallel with K-category migration which touches the website front-end) | Standard (audit) → Elevated (remediation if substantial) |
| A2 | **Accessibility statement page + EAA disclosure.** Standard regulatory artefact; ~1 hour. | Stage 1 governance | Standard |
| A3 | **Cognitive-accessibility design pass on mentor + assessment surfaces.** Plain-language version of Stoic vocabulary; alternative entry paths for users in distress (smaller, clearer flow when R20a-zone-3 detected). Folds into Phase 1.5 T3-19 (A7 R20a middle layer). | Stage 1 A5 + A7 amendments | Elevated (UX change in safety surface) |

**Positioning impact:** **strengthens.** Accessibility = "every rational agent — human or artificial — willing to assess their judgments" includes users with disabilities. The substrate's stated end goal (project instructions §End Goal) is universalist; accessibility is structurally required for that universalism to be honest.

**Five-failure-modes diagnostic:** **specification gaming** — current substrate technically meets its stated requirements (mentor produces philosophical output) but fails the implicit requirement (output is usable by anyone) that the end-goal implies.

**Dogfood relevance:** **low.** Accessibility is largely deterministic compliance work, not judgment-laden decisions. Substrate could score "should we ship now and remediate, or hold until WCAG-clean" but that's a single decision, not a recurring one.

---

## Domain 4 — Privacy by design

**What the build plan currently addresses:** R17 Intimate Data Protection (R17a-f); R17b application-level encryption via `MENTOR_ENCRYPTION_KEY`; R17c genuine deletion (placeholder 503); R17d local-first storage (under-evaluated); R17e API non-exposure; R17f key custody discipline; R0 oikeiosis audit trail; decision-log discipline.

**What's missing:**
- **ISO/IEC 27701:2025 alignment.** Published October 14, 2025. Includes new AI-specific privacy controls. Currently no mapping of substrate against this standard. A formal PIMS (Privacy Information Management System) is a marketplace-listing prerequisite for serious agent-platform operators.
- **Data-flow mapping.** What PII flows where through the substrate (Layer 1 input → Layer 2 reasoning → Layer 3 prose → mentor profile → audit log)? No documented data-flow diagram.
- **DPIA (Data Protection Impact Assessment).** GDPR Article 35 requires DPIA for high-risk processing including profiling. Mentor-profile context architecture is profiling by GDPR's definition. **No DPIA produced.**
- **Subject access request (SAR) handling.** GDPR Article 15 right to access. No documented process. R17c deletion-only is incomplete; access + rectification rights also exist.
- **Data minimisation review.** R17b protects intimate fields; the question of whether the substrate is collecting more than it needs is unaddressed.
- **Vendor privacy risk evaluation.** Substrate depends on Anthropic (LLM provider) + Supabase (database) + Vercel (hosting). Each is a sub-processor under GDPR. No documented DPA (Data Processing Agreement) review.

**Concrete failure mode:** GDPR Article 15 SAR from EU user → substrate has no process; founder scrambles → regulatory complaint → ICO investigation → fine. Or: DPIA absent + regulator audit triggered by AI Act monitoring → finding of "high-risk profiling without DPIA" → fine. Or: a sub-processor (e.g., Supabase under unfavourable terms) breach exposes data → founder personally liable as PII controller because no DPA review documented.

**Recommended amendments (3-4):**

| # | Amendment | Stage placement | Risk |
|---|---|---|---|
| P1 | **Substrate data-flow diagram + DPIA produced.** Standard governance work; ~1-2 sessions. Maps PII flow from input through audit log; identifies retention, processing purpose, legal basis (consent? legitimate interest? contract?) for each flow. | Stage 1 governance / Stage 3 (lawyer engagement co-located) | Standard |
| P2 | **R17 expanded to cover SAR + rectification, not just deletion.** R17c is deletion only. Add R17g (access) + R17h (rectification) + R17i (portability per GDPR Article 20). All four need endpoint implementations. | Stage 1 (with R17c critical-path work) | Critical (R17 surface) |
| P3 | **ISO/IEC 27701:2025 informal alignment.** Not certification (cost + audit-burden too high pre-revenue) but mapping substrate's existing controls to the standard's 31 controller + 18 processor + 29 information-security controls. Surfaces gaps the next regulatory review consumes. | Stage 1 governance / Stage 3 J7 amendment | Standard |
| P4 | **Sub-processor DPA register.** Anthropic + Supabase + Vercel each as named sub-processors; founder-as-controller documented; user-facing privacy policy lists sub-processors. | Stage 1 governance + lawyer engagement | Elevated |

**Positioning impact:** **strengthens.** Character Kernel positioning ("preserves who the agent is while reasoning") presumes the substrate is itself a worthy steward of the data it processes. ISO 27701 informal alignment is the demonstrable form of that stewardship for agent-platform consumers.

**Five-failure-modes diagnostic:** **policy drift** + **escalation drift** — sub-processor changes (Vercel / Supabase) cascade upward to substrate's PII posture; without a sub-processor register, escalation paths are invisible.

**Dogfood relevance:** **medium.** DPIA = formal kathekon assessment ("does this action befit the role of PII controller?"). Substrate can score the assessment of "should we proceed with EU expansion before DPIA completes?" Layer 2 mechanisms are well-suited to this.

---

## Domain 5 — Observability + SRE

**What the build plan currently addresses:** R5 cost-as-health-metric (named; not operationalised); A9 cost monitoring (scoped not built); KG1 Vercel five rules; AC2 safety-system latency budget; PR3 synchronous safety; standing protocol cache verification methodology; PR1 single-endpoint proof.

**What's missing:**
- **OpenTelemetry GenAI semantic conventions.** Now the industry standard (May 2026); auto-instrumentation packages exist for Anthropic; <1ms overhead. Substrate currently has no distributed tracing instrumentation.
- **Decision-event audit logging at NIST AI RMF level.** Per security audit G8: structured logs with decision event + context + controls; sensitive data masked; immutable storage. Currently substrate has decision-log entries (session-grain) but not call-grain audit logs.
- **Latency SLOs per surface.** AC2 names the safety-system latency budget (~500ms); no SLOs for other surfaces. No alerting on SLO breach.
- **Error-budget discipline.** Standard SRE primitive; not in current substrate.
- **Behavioural baselines per identity.** Per security audit G5: without per-identity baseline, anomaly detection is impossible. **No baselines + no detection currently.**
- **Synthetic monitoring.** External probes confirming substrate is alive and producing correct outputs. Not configured.
- **Distributed-trace correlation across plugin → substrate boundary.** When the plugin ships, request traces should span plugin → substrate → LLM call → Supabase write. Without correlation IDs propagated through the chain, debugging incidents is hard.

**Concrete failure mode:** Substrate degrades silently — Anthropic API latency spikes; Layer 2 LLM call falls back to retry-storm; no alert; users see slow responses; founder discovers via thumbs-down feedback. Or: cost spike from a bug-loop hits R5 threshold; no alert because A9 not built; founder discovers via month-end invoice.

**Recommended amendments (3):**

| # | Amendment | Stage placement | Risk |
|---|---|---|---|
| O1 | **OpenTelemetry GenAI semantic conventions adopted.** Auto-instrumentation for Anthropic SDK; trace propagation through Layer 1 → Layer 2 → Layer 3 → Supabase write. Approx 1-2 sessions. Enables call-grain audit logging (P2 of Domain 4 — Privacy) + behavioural baselines (S1 of Domain 1 — Security) + cost telemetry (A9). | Stage 1 A9 expansion (or new A10) | Elevated |
| O2 | **R5 cost-as-health-metric alerts operationalised.** R5 names the principle; A9 is the building work. Specific thresholds: revenue-to-cost ratio <2x → alert; per-call cost >2x baseline → alert; daily total cost >budgeted-cap → alert. Implementation depends on O1 (telemetry to fire alerts off). | Stage 1 A9 | Elevated |
| O3 | **Latency SLOs + error-budget discipline.** Per-surface SLOs (e.g., /api/reason p95 latency <3s; /api/public-key p95 <100ms); error budgets (e.g., 99.5% success rate per surface = ~4 hours error budget per quarter). When error budget burns >50%, freeze new feature work until reliability restored. | Stage 1 governance + A9 | Standard (governance) → Elevated (implementation) |

**Positioning impact:** **strengthens.** Character Kernel positioning requires the substrate to be **legibly trustworthy** at runtime, not just architecturally trustworthy. Observability is the legibility mechanism.

**Five-failure-modes diagnostic:** **latency-cost** is the dominant failure mode addressed (cost spike + latency degradation both invisible without instrumentation).

**Dogfood relevance:** **high.** Substrate could consult itself on observability decisions ("should we adopt OpenTelemetry now or after Stage 2 K-category migration?") — but more usefully, OpenTelemetry instrumentation enables the substrate to **report on its own behaviour** through call-grain audit logs, which is itself a dogfood form (the substrate becomes its own observability target).

---

## Domain 6 — Legal entity + tax structure

**What the build plan currently addresses:** Nothing. Founder operates as sole trader (implied by project instructions §My Role: "As sole founder").

**What's missing:**
- **Legal entity decision: sole trader vs Pty Ltd.** Sole trader: personal liability for business debts; income at personal marginal rate (32.5% from $45K, 37% from $135K, 45% from $190K); simpler compliance ($0 setup; ABN only). Pty Ltd: limited liability; 25% base-rate-entity company tax (under $50M turnover); $576 ASIC setup + $310 annual + accounting overhead.
- **Personal-asset exposure.** Sole trader = founder's house, savings, etc. are at risk if substrate causes user harm (e.g., a user in distress receives wrong R20a-zone-3 response and self-harms; family sues). Pty Ltd shields personal assets from business liability.
- **Investor-readiness.** Per the insurance research: investors typically require D&O before closing a round; D&O requires a company structure (sole traders cannot purchase D&O). If P1 investment case affirms, Pty Ltd is essentially mandatory before any external capital.
- **GST registration.** Once turnover passes $75K AUD, GST registration is mandatory. Substrate with Stripe paid tier may approach this faster than expected.
- **R&D tax incentive eligibility.** AU R&D tax incentive offers ~43.5% tax credit for eligible R&D expenditure for companies under $20M turnover. Sole traders cannot claim. Significant lost-value for substrate's R&D-heavy phase if structure is sole trader.

**Concrete failure mode:** Substrate causes user harm (low probability but Critical impact); user's family sues founder personally as sole trader; family home is sold to pay damages. Or: founder seeks first investment (per P1 investment case); investor requires Pty Ltd + D&O; conversion mid-due-diligence stalls deal.

**Recommended amendments (2):**

| # | Amendment | Stage placement | Risk |
|---|---|---|---|
| L1 | **Legal entity decision: Pty Ltd before Stage 4 G4 marketplace approval.** Lawyer engagement (P3 critical-path) covers this. Pty Ltd structure + ASIC registration before any marketplace listing; D&O purchasable after that point. R&D tax incentive claim from incorporation date forward. | Stage 3 (lawyer engagement) → before Stage 4 | Critical (legal + financial) |
| L2 | **GST registration timing decision.** Voluntarily before $75K threshold to claim input credits on substrate's R&D expenditure (Anthropic API costs; hosting; tools). | Stage 1 governance + accountant engagement | Standard |

**Positioning impact:** **neutral** for substrate's positioning; **critical** for founder's personal-exposure posture and investor-readiness.

**Five-failure-modes diagnostic:** **escalation drift** — without entity structure, escalation from "substrate makes a mistake" to "founder loses personal assets" has no firebreak.

**Dogfood relevance:** **low.** This is largely founder + accountant + lawyer territory; substrate's mechanisms apply abstractly but the specific decisions are domain-expert work.

---

## Domain 7 — Insurance

**What the build plan currently addresses:** Nothing.

**What's missing:**
- **Technology Errors & Omissions (Tech E&O).** Specifically scoped for AI: responds when a customer sues because the substrate's output caused harm. Includes coverage for upstream model behaviour (Anthropic, Sonnet, Haiku). Critical for substrate-as-judge claims because the judge's wrong calls have downstream impact.
- **Cyber Liability.** Data breach protection. Covers regulatory fines under GDPR / CCPA / Australian Privacy Act; breach notification costs; forensics; PR. Cyber insurance market in AU is growing 17.5% CAGR — pricing is currently favourable for early-mover.
- **Directors & Officers (D&O).** Required by investors; protects founder personally from leadership-decision-related lawsuits. Cannot purchase as sole trader.
- **General Liability.** Standard business cover.
- **Coverage gap awareness.** Many cyber policies exclude "AI-specific" claims; need explicit AI E&O endorsement. Some E&O policies exclude open-source dependencies (substrate's Layer 1 ships open-source per Stage 3 strategy — gap if not addressed).

**Concrete failure mode:** User self-harms after a mishandled R20a-zone-3 response; family sues founder for $5M; substrate has no Tech E&O; founder pays from personal assets (after losing house — see Domain 6). Or: data breach exfiltrates mentor-profile data; GDPR fine + Australian Privacy Act fine + class action; cyber insurance absent; founder bankrupt.

**Recommended amendments (2):**

| # | Amendment | Stage placement | Risk |
|---|---|---|---|
| I1 | **Tech E&O + Cyber Liability + General Liability purchased before any first user pays for substrate access.** Pty Ltd structure (Domain 6 L1) → company purchases policies → D&O added at first investor engagement. Specific AI E&O endorsement; open-source dependency rider explicit. | Stage 4 (before G4 marketplace listing) | Critical (financial protection) |
| I2 | **Coverage gap audit for AI-specific exclusions.** Many policies exclude AI-specific claims. Explicit endorsement required. Lawyer engagement reviews. | Stage 4 (with H3 lawyer engagement) | Elevated |

**Positioning impact:** **strengthens** at marketplace-listing time. "Tech E&O + Cyber Liability in place" is signalling — particularly for B2B agent-platform operators who do supplier risk reviews.

**Five-failure-modes diagnostic:** **escalation drift** addressed (insurance is the firebreak between substrate-mistake → founder-personal-financial-ruin).

**Dogfood relevance:** **low** for the decision; insurance is broker + lawyer territory.

---

## Domain 8 — Marketplace economics + dispute resolution

**What the build plan currently addresses:** Stage 4 G1 first-marketplace-target decision; G3 marketplace listing design; G6 plugin economics (free-to-install + paid services via connectors; pricing strategy); I5 trust signalling; R18 honest certification; R10 marketplace operations rule.

**What's missing:**
- **Anthropic plugin marketplace revenue-share details unknown.** Per research: pay-per-token pricing dominates Anthropic's revenue ($30B annualised March 2026); plugin marketplace economics not publicly disclosed. Substrate's revenue model interacts with whatever Anthropic charges plugin operators (if any).
- **Stripe-or-equivalent integration timing.** P4 in project priorities. Currently not implemented. Without paid-tier revenue, R5 cost-as-health-metric ratio is undefined (no revenue = ratio of cost to zero).
- **Dispute resolution.** What happens when an agent operator uses the substrate's signed Layer 2 assessment, takes an action that causes harm, and the user complains to the substrate? Currently no escalation path; no terms of service governing this; no liability allocation document.
- **Refund policy.** Per-call metered pricing implies per-call refundability (or not). Position currently undefined.
- **Multi-marketplace strategy.** Stage 6 names this; not yet substantive. Cowork (Decision 5 candidate) + Anthropic Skills marketplace + Claude Code Plugins (Anthropic-managed) are three distinct paths each with different economics.
- **Abuse handling.** What happens when an agent uses the substrate at machine speed to extract content (e.g., reverse-engineer Layer 2 mechanisms via probing)? Current substrate has no rate limits (Domain 5 O2) and no abuse-detection.
- **Plugin-developer support burden.** When plugins integrate the substrate, developer questions arise. No support channel scoped.

**Concrete failure mode:** Plugin developer ships integration; their end-user reports harm; developer escalates to substrate; substrate has no triage process or terms allocating liability; legal exposure compounds because the substrate's R18 honest-certification claims set up an implied warranty of "this is sound reasoning." Or: probe-based reverse-engineering of Layer 2 mechanisms via /api/reason at machine speed; no abuse detection; competitor reconstructs the moat from observed behaviour.

**Recommended amendments (3-4):**

| # | Amendment | Stage placement | Risk |
|---|---|---|---|
| M1 | **Terms of service + liability allocation document.** Specifies: substrate provides reasoning support; final action responsibility lies with the human or agent operator; R20a is best-effort; Layer 2 assessment is advice, not directive. Lawyer-reviewed before Stage 4 G4. | Stage 3 (lawyer engagement) → before Stage 4 | Critical (legal) |
| M2 | **Stripe integration + paid-tier launch (P4 priority).** Operationalise revenue model so R5 health-metric ratio becomes computable. Per-call metered with monthly cap. Free-tier preserved. | Stage 1 / Stage 4 G6 (depending on sequencing) | Elevated |
| M3 | **First-marketplace-target decision (G1).** Decision pending. Cowork (prosumer; Decision 5 candidate); Anthropic Skills (developer-targeted); Claude Code Plugins (Anthropic-managed; coding-focused). Each has different economic terms. Multi-marketplace from start or single-first per PR1? | Stage 4 G1 | Standard (decision); Elevated (per-marketplace packaging) |
| M4 | **Abuse-detection + rate-limit operationalisation** (cross-cuts with Domain 5 O2 and Domain 1 S1). Per-identity rate limit; reverse-engineering probe detection (e.g., systematic prompt enumeration). | Stage 1 A10 (new sub-stage) | Elevated |

**Positioning impact:** **strengthens.** Character Kernel positioning is incomplete without a credible business model and a credible response to "what happens when something goes wrong?"

**Five-failure-modes diagnostic:** **specification gaming** (a competitor reverse-engineers via probing without engaging the substrate's stated mechanism); **policy drift** (marketplace terms evolve; substrate's posture must keep pace).

**Dogfood relevance:** **high.** Terms-of-service + liability-allocation decisions are exactly the kathekon-laden decisions the substrate's Layer 2 is built for ("does this action befit the role we claim as the substrate's operator?"). Dogfood the first-marketplace-target decision through `/api/reason`.

---

## Domain 9 — Onboarding UX

**What the build plan currently addresses:** Sagereasoning.com has assessment surfaces (/api/assessment/foundational, /api/assessment/full); mentor surfaces; score-* family; reflect surfaces. Stage 4 G3 marketplace listing design. R20a + R20b + R20c + R20d active-protection rules. R18 honest certification + limitations page (R19c, R19d).

**What's missing:**
- **First-run experience for sagereasoning.com.** What does a new user see, do, and conclude in their first 5 minutes? Not documented. The substrate's value proposition is dense (Stoic reasoning; passion taxonomy; oikeiosis sequence); onboarding has to translate this for users with zero prior context.
- **First-run experience for plugin developers.** When a developer installs the substrate plugin (Stage 4+), what's their first call, their first success signal, their first failure signal? `getting-started` is named in C7 plugin documentation but content scoped only.
- **Mentor surfaces' onboarding.** Mentor profile is built from journal ingestion + ongoing interactions. First-time user has no journal; mentor profile is empty; mentor surfaces' value is degraded. No first-run discovery path designed.
- **R20b independence-encouragement.** Manifest commits to mentor coaching users out of framework dependence. No usage-pattern detection rules; no coaching triggers; not built.
- **R19c limitations-page content.** Manifest commits; page scoped but not yet finalised. Without explicit limitations, new users assume universality (universalism claim = R19d).
- **Plain-language onboarding for vocabulary.** Cross-references Domain 3 cognitive accessibility. Stoic terms are jargon; first-run users need a glossary OR a vocabulary-light onboarding path.
- **Trust ladder positioning.** Per inbox synthesis Theme F: substrate currently serves steps 1-3 (Read, Suggest, Draft); not 4-5 (Act, Act autonomously). First-run UX should explicitly position at steps 1-3, not promise 4-5.

**Concrete failure mode:** New user lands on sagereasoning.com; reads philosophical content; doesn't understand what to do; bounces. Or: plugin developer installs; tries first call; gets opaque error; gives up; never returns. Or: user assumes universality from absence of limitations page; relies on substrate in scenarios it wasn't designed for; substrate produces wrong output; user concludes "this doesn't work" and leaves.

**Recommended amendments (3-4):**

| # | Amendment | Stage placement | Risk |
|---|---|---|---|
| U1 | **Sagereasoning.com first-run experience designed + built.** Includes: 30-second onboarding tour; "try a sample assessment" path; clear "what this is + what this isn't" framing; plain-language version of value proposition. | Stage 1 governance + Stage 2 (parallel with K-category migration of website) | Standard (design) → Elevated (build) |
| U2 | **R19c limitations page + R19d mirror principle live in mentor prompts (P2 priority 2e).** Currently scoped not built. Bring forward to Stage 1 if EU users plausible (mirror principle is GDPR-relevant for transparency). | Stage 1 (P2 2e bring-forward) | Standard |
| U3 | **R20b framework-dependence detection + coaching.** Usage-pattern thresholds (e.g., 7+ assessments/day for 14+ days; same problem rephrased 3+ times within session); mentor response: "You're ready to reason through this yourself." | Stage 1 A5 + A7 amendments | Elevated (mentor behaviour change) |
| U4 | **Plugin-developer first-call success path designed.** `getting-started` content with copy-paste working example; expected first-success time <10 minutes; failure-mode catalog. | Stage 3 C7 expansion | Standard |

**Positioning impact:** **strengthens.** Character Kernel that no one can onboard isn't a Character Kernel; it's a paper.

**Five-failure-modes diagnostic:** **specification gaming** (users use substrate without realising they're outside its competence; substrate's specification doesn't include UX of being-honest-about-competence).

**Dogfood relevance:** **medium.** Substrate could consult itself on "does this onboarding path serve the user's good?" via value assessment; the kathekon assessment ("does this onboarding befit the substrate's claims?") is also relevant.

---

## Domain 10 — Anthropic-native capabilities

**What the build plan currently addresses:** AC1 model selection (Sonnet for Layer 1+3 and mentor; Haiku for distress classifier); KG2 Haiku reliability boundary; current model strings (`claude-sonnet-4-6`).

**What the prep document (Anthropic features survey) already surfaced:** 10 features including `/security-review`, Sub-Agents + Agent Teams + Hooks, Claude Agent SDK, Managed Agents (hosted REST API), Agent Skills marketplace, Memory tool, MCP, Claude Code Plugins, CLAUDE.md special handling, Opus 4.7 + Sonnet 4.6. **Three corrections added** post-omission: **Dreams** (memory consolidation; research preview); **Outcomes** (rubric + separate grader; +10 points task success; +8.4-10.1% Word/PPT); **Multi-agent orchestration** (specialist agents; public beta; Netflix using at scale).

**What's missing from the staging plan (in addition to the features survey findings):**
- **5-MCP routine + hooks adoption** (claude on track inbox file 2026-05-12): codebase-memory MCP; Context7 library docs MCP; Tavily web search MCP; read-before-edit hook; safety hook; re-index hook. **High-value pairing with Standing Requirement infrastructure;** rules without paired infrastructure are theatre (per full-day close T-2026-05-10-NEW-3).
- **PEV (Plan → Execute → Verify) loop adoption as PR10.** Current PR1 (single-endpoint proof) + Critical Change Protocol cover part; explicit PEV codification + diagnostic-certainty patterns (Cursor's minimal disruption; Windsurf's diagnostic certainty) close the architectural-debugging-gap (per vibe coding debugging research).
- **Substrate hosting decision: Vercel+Supabase vs Managed Agents.** Surfaced in features survey; carried forward as ST2 Phase-2.5 decision. **Decision is foundational; should land before A5 commits.**
- **Stage 3 C1-C7 re-scope: bespoke vs Plugin spec + MCP.** Per features survey: Plugin spec covers C1 manifest, C2 skills, C3 tools, C4 hooks, C6 assets, C7 documentation. **Bespoke vs adoption decision required before Stage 3 begins.**
- **`/security-review` GitHub Action adoption.** Adoption is near-zero cost; closes security audit R6.
- **CLAUDE.md special handling adoption.** Simplifies governance overhead; potentially replaces some of the standing-cache pattern.

**Concrete failure mode:** Substrate ships in Stage 4 having built bespoke C1-C7 + bespoke D-mechanisms + bespoke verification framework + bespoke session-continuity pattern, while the Anthropic-native infrastructure delivers most of the same outcomes with less code, less migration debt, and ecosystem-compatible interfaces. The bespoke build is 5-8 sessions of waste plus future migration cost.

**Recommended amendments (3-4):**

| # | Amendment | Stage placement | Risk |
|---|---|---|---|
| AN1 | **Substrate hosting + Stage 3 plugin architecture decisions made before A5.** Two foundational decisions: (1) Vercel+Supabase vs Managed Agents; (2) Stage 3 C1-C7 bespoke vs Plugin spec + MCP. Both affect A5's commitment shape. | Stage 1 (before A5) | Elevated (decisions); Critical (if either changes Stage 1 hosting commit) |
| AN2 | **`/security-review` GitHub Action adopted; sub-agents for verification adopted; CLAUDE.md special handling evaluated.** Three near-zero-cost adoptions. Closes security audit R6; replaces Jest debt; simplifies governance pattern. | Stage 1 governance (~1 session) | Standard |
| AN3 | **5-MCP routine + hooks adopted as paired infrastructure for Standing Requirements 1, 1a, 2, 3, 4, 5.** Codebase-memory MCP; Context7 library docs; Tavily search; read-before-edit hook; safety hook; re-index hook. Before Stage 2 K-category migration broadens the codebase surface. | Stage 1 governance + project-instruction amendment | Standard (infrastructure setup); Elevated (project-instruction amendment) |
| AN4 | **PEV loop as PR10 + diagnostic-certainty patterns codified.** Plan → Execute → Verify with structured human oversight. Addresses architectural-debugging-gap (vibe coding research). Cursor's minimal-disruption + Windsurf's diagnostic-certainty + Karpathy's agentic engineering. | Project-instruction amendment | Elevated |

**Positioning impact:** **strengthens.** Character Kernel that's built on standard Anthropic primitives is more legible to the agent-platform ecosystem than one that reinvents primitives.

**Five-failure-modes diagnostic:** **specification gaming** (bespoke implementations technically meet spec but miss the implicit requirement of ecosystem-compatible interfaces); **escalation drift** (rules without paired infrastructure don't operationally apply).

**Dogfood relevance:** **very high.** This is the dogfood-discipline section. Every Anthropic-native adoption decision is exactly the kind of "does this serve us and the broader rational agent community?" question Layer 2 is built to score.

---

## Phase 2 summary — gap counts by domain and severity

| Domain | Critical gaps | Significant gaps | Minor gaps | Amendment count |
|---|---|---|---|---|
| 1. Security | 7 (Phase 1.5) + 16 (audit) | 7 | 4 | 4 |
| 2. Regulatory | 2 (R17c-GDPR; EAA-WCAG) | 2 (AI Act Article 50; manifest CR-register) | 0 | 4 |
| 3. Accessibility | 1 (EAA exposure if EU customer) | 1 (cognitive-accessibility for safety surfaces) | 1 (statement page) | 3 |
| 4. Privacy by design | 1 (DPIA absent for profiling) | 3 | 0 | 4 |
| 5. Observability + SRE | 0 | 3 (OTel; alerts; SLOs) | 0 | 3 |
| 6. Legal entity + tax | 1 (Pty Ltd before marketplace) | 1 (GST timing) | 0 | 2 |
| 7. Insurance | 1 (Tech E&O before paid tier) | 1 (AI-specific coverage gaps) | 0 | 2 |
| 8. Marketplace economics | 1 (TOS + liability) | 3 | 0 | 4 |
| 9. Onboarding UX | 0 | 4 | 0 | 4 |
| 10. Anthropic-native | 1 (substrate hosting + plugin architecture) | 3 | 0 | 4 |
| **Totals** | **15** | **28** | **5** | **34 amendments** |

**Reading this table:** 15 Critical gaps across the 10 domains. The substrate is currently shippable to a friendly internal test audience but **not shippable to a paying external customer base** without these gaps closed. The build plan's Stage 4 G4 marketplace approval criterion implicitly assumes the gaps are closed; making this explicit is itself an amendment candidate (per the security audit's recommendation 2).

---

## Cross-cutting observations (not amendment-shaped; flagged for ST2 awareness)

**Observation 1 — The build plan's stage-bounded structure may not match the gap structure.** The gaps cluster around "before paying customers" (security; privacy; legal; insurance) and "before any user at all" (R17c deletion; A7 R20a middle layer; prompt-injection defence). The current staging plan structures Stage 1 around backend foundations and Stage 4 around marketplace listing; **many Critical gaps want to land in Stage 1 because they're foundational, but Stage 1 is already 16-24 sessions and full**.

**Observation 2 — The K-category (Stage 2) migration depends on Stage 1 being substantively complete, but Stage 1 may now need ~10-15 more sessions of Critical-tier work added to it.** This pushes Stage 2 start materially. If Stage 1 expansion is accepted, the overall arc estimate (38-62 sessions per Rule B holistic pass) needs revisiting.

**Observation 3 — Several amendments cross-cut multiple domains.** For example, OpenTelemetry adoption (Domain 5 O1) enables call-grain audit logging (Domain 4 P1), behavioural baselines (Domain 1 S1's full-form), and cost telemetry (Domain 5 O2 / A9). Per Rule B Efficiency 6, these cross-cutting items should be bundled rather than scoped per-domain.

**Observation 4 — Lawyer engagement is critical-path for at least 6 amendments** (R4, P1, P4, L1, M1, regulatory + privacy + entity + terms-of-service review). Per project priorities P3 "Begin lawyer engagement during P2 or P3" — this is overdue if the gap-closure work is going to be lawyer-validated. Recommend bringing lawyer engagement forward.

**Observation 5 — The "no current users" governing note (D-BUILD-CACHE-DRIFT-RESOLVED-2026-05-10-NO-USERS) creates a narrow window where many of these gaps can be closed at lower-risk than they will be after first user.** Currently CCP step 3 is N/A (no third-party sessions to invalidate). When the plugin ships and external users exist, this simplification ends and amendments become Critical risk where they're now Elevated. **The window is operationally valuable; spend it on the right work.**

**Observation 6 — Domains 6, 7, 8 (legal entity, insurance, marketplace economics) are largely founder-personal-exposure work, not substrate-feature work.** These belong on a "pre-launch founder checklist" that runs in parallel with the build arc, not as substrate amendments. ST2 triage should consider whether to fold them into the build plan or maintain them as a separate parallel track.

---

## Recommendations for ST2 four-outcome triage

When ST2 triages these 34 amendments, the four outcomes apply as follows:

- **ALLOW** — clear adoption. Likely candidates: AN2 (`/security-review` adoption; near-zero cost); AN3 (5-MCP routine; foundational); S3 (red-team probe; process change); O3 (SLOs + error budgets).
- **REVISE** — directionally correct, needs specific change. Likely candidates: S1 (per-agent credentials — needs decision on token format, JWT vs W3C VC vs hybrid); S2 (combined governance pass — needs decomposition); P2 (R17 expansion — sequencing relative to R17c).
- **BLOCK** — explicit rejection. Candidates may emerge from ST2; none obvious to flag pre-triage.
- **ESCALATE** — defer with revisit condition. Likely candidates: AN1 (substrate hosting — needs Phase 2.5 deep-dive on Managed Agents); L1 (Pty Ltd timing — depends on P1 investment case); R3 (EAA pass — depends on whether EU users are plausible pre-Stage-4).

ST2 also considers **batch adoption** for cross-cutting items (Observation 3) and **lawyer-engagement bring-forward** (Observation 4).

---

## Cross-references

- v2 stress-test prompt: `/operations/handoffs/founder/2026-05-10-build-plan-stress-test-NEXT-SESSION-PROMPT-v2.md`
- Predecessor full-day close: `/operations/handoffs/founder/2026-05-10-full-day-close.md`
- Prep documents (in `/drafts/`):
  - `/drafts/security-audit-build-plan-vs-agentic-security-strategies-2026-05-10.md`
  - `/drafts/anthropic-features-survey-2026-05-10.md` (with correction notice)
  - `/drafts/inbox-research-synthesis-2026-05-10.md`
- Adopted staging plan: `/adopted/substrate-plugin-staging-plan.md`
- Standing protocol cache: `/adopted/standing-protocol-cache.md`
- Build-sessions protocol cache: `/adopted/build-sessions-protocol-cache.md`
- Manifest: `/manifest.md`
- Project instructions (system-side; PR1-PR9 etc.)
- Phase 1.5 Action Surface Audit (inline in ST1 chat; consolidated in this document §"Phase 1.5 Action Surface Audit — consolidated input")

### Web research sources (Standing Requirement 1 compliance)

EU regulatory:
- [Implementation Timeline (artificialintelligenceact.eu)](https://artificialintelligenceact.eu/implementation-timeline/)
- [EU agrees to delay key AI Act compliance deadlines (Travers Smith)](https://www.traverssmith.com/knowledge/knowledge-container/eu-agrees-to-delay-key-ai-act-compliance-deadlines/)
- [Artificial Intelligence: Council and Parliament agree to simplify and streamline rules (Consilium)](https://www.consilium.europa.eu/en/press/press-releases/2026/05/07/artificial-intelligence-council-and-parliament-agree-to-simplify-and-streamline-rules/)

EAA + WCAG:
- [European Accessibility Act (European Commission)](https://commission.europa.eu/strategy-and-policy/policies/justice-and-fundamental-rights/disability/european-accessibility-act-eaa_en)
- [EAA Compliance Guide 2026 (getwcag.com)](https://getwcag.com/en/what-is-european-accessibility-act-eaa)

Australia AI policy:
- [Australia's AI Regulation Landscape in 2026 (ValiDATA)](https://www.validata.ai/post/australia-s-ai-regulation-landscape-in-2026-what-every-business-needs-to-know)
- [Introducing mandatory guardrails for AI in high-risk settings (Australia Department of Industry)](https://consult.industry.gov.au/ai-mandatory-guardrails)

Observability:
- [AI Agent Observability: Evolving Standards and Best Practices (OpenTelemetry)](https://opentelemetry.io/blog/2025/ai-agent-observability/)
- [OpenTelemetry for AI Systems: LLM and Agent Observability 2026 (Uptrace)](https://uptrace.dev/blog/opentelemetry-ai-systems)

Legal entity:
- [Business structures - key tax obligations (ATO)](https://www.ato.gov.au/businesses-and-organisations/starting-registering-or-closing-a-business/starting-your-own-business/business-structures-key-tax-obligations)
- [Sole Trader vs Company (NAB)](https://www.nab.com.au/business/small-business/sole-trader-resource-centre/sole-trader-vs-company)

Insurance:
- [AI Startup Insurance (Corgi)](https://www.corgi.insure/ai)
- [Cyber Insurance Australia 2026 (Hyetech)](https://hyetech.com.au/cyber-insurance-australia-what-every-australian-business-needs-to-know/)

Privacy by design:
- [ISO/IEC 27701:2025 (ISO)](https://www.iso.org/standard/27701)
- [ISO/IEC 27701:2025 (TekClarion)](https://www.tekclarion.com/cyber-security/iso-iec-27701-2025-global-compliance-gdpr/)

Marketplace economics:
- [GitHub - anthropics/claude-plugins-official](https://github.com/anthropics/claude-plugins-official)
- [Anthropic Revenue and Statistics 2026 (Sacra)](https://sacra.com/c/anthropic/)

---

*End of Phase 2 gap analysis. ST1 deliverable; feeds ST2 triage. No amendments adopted by this document.*
