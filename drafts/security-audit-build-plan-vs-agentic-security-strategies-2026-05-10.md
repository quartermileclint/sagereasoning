# Security Audit — SageReasoning Build Plan vs Current Agentic-Security Strategies (May 2026)

**Status:** Drafted 2026-05-10. Research-and-audit deliverable. **Surfaces options + risks; does not prescribe.** Founder reviews and decides which recommendations enter the build plan, in what stages, and at what risk classification.
**Stream:** founder.
**Scope:** Audit of `/adopted/substrate-plugin-staging-plan.md` + `/manifest.md` + ADRs against current (May 2026) industry frameworks for AI-agent-facing systems. Triggered by the McKinsey Lilli incident (March 2026) and the founder's recognition that they cannot be expected to know what security measures are required.
**Method:** Web-research current frameworks (OWASP Top 10 for Agentic Applications 2026; NIST AI RMF; FIDO Alliance agent-identity work; industry incident reports). Compare against build-plan scope. Identify gaps. Prioritise.
**Limitations:** This is an external-source-driven audit, not a penetration test. A real penetration test (especially with an autonomous AI agent attacker) is in itself a recommendation below. Industry frameworks for agent security are evolving rapidly; the recommendations below reflect May 2026 consensus, not eternal truth.

---

## Plain-language summary (read this first)

The McKinsey Lilli incident in March 2026 — an autonomous AI agent breached a major enterprise AI platform in 2 hours and accessed 46.5 million chat messages — is the wake-up call for agent-facing systems. The platform couldn't tell agents apart from humans, had 22 unauthenticated endpoints out of 200+, and was vulnerable to a SQL injection through JSON keys (an unusual vector that standard tools miss).

**The build plan covers a meaningful share of agent-security best practices already** — cryptographic signing (A3), key rotation (A4), plugin authentication (A1), encryption at rest (R17), distress detection (R20a), and the AC7 standing constraint on auth integrity. These are real and material protections, and today's A4 work concretely improves the security posture.

**The build plan also has substantial gaps relative to the current industry frame for agent-facing systems.** The most consequential gaps:

1. **No mechanism to revoke a single agent's access without revoking everyone's.** The current plugin authentication uses ONE shared secret (`PLUGIN_AUTH_SECRET`). If one plugin install is compromised, the only response is rotating the global secret — which kicks off every legitimate plugin too. Industry best practice (and the McKinsey lesson): per-agent credentials + per-agent revocation in seconds.
2. **No explicit "agent vs human" distinction at the API layer.** The substrate APIs accept calls but don't carry metadata about whether the caller is an agent or a human. The McKinsey/Lilli root failure was inability to distinguish the two; the build plan currently has the same gap.
3. **No endpoint-authentication audit process.** No checklist mandating that every endpoint require auth or be explicitly marked public. The McKinsey/Lilli incident exploited 22 endpoints that were unauthenticated by oversight, not by design.
4. **No rate limiting or behavioural anomaly detection.** Agents operate at machine speed; static rate limits don't catch sophisticated attacks; behavioural baselines + anomaly detection are now industry-standard.
5. **No explicit prompt-injection defence in Layer 1 or Layer 3.** OWASP's #1 LLM risk; the substrate has two prompt-injection vectors (Layer 1 user input → structured features; Layer 3 assessment + LLM call → prose).
6. **No coverage of OWASP Top 10 for Agentic Applications 2026 risks** (goal misalignment, tool misuse, delegated trust, inter-agent communication, persistent memory, emergent autonomous behavior). The build plan's R-rules predate this framework's 2026 release.
7. **No commitment to autonomous-agent red-team testing.** The McKinsey attacker was an autonomous AI agent; static security review wouldn't have caught the JSON-key SQL injection. Adversarial evaluation in the build plan (R18d) is at Stage 4; an earlier "agent-vs-substrate" red-team would catch issues before exposure.

This document gives you a prioritised list of recommendations mapped to specific stages in the build plan. You decide which to adopt and at what stage; I've named the risk if each is not addressed.

**Limitation honesty note from the research itself:** a January 2026 meta-analysis of 78 studies found that adaptive attack success rates against state-of-the-art agentic-AI defences exceed 85%. Current safety measures (content filters, safety training, circuit breakers) are systematically defeatable. *No defence is complete.* The recommendations below are about **reducing blast radius** and **enabling rapid response**, not about preventing every attack.

---

## The McKinsey Lilli incident — what happened

**Date:** Attack 2026-02-28; public disclosure 2026-03-09; patched 2026-03-02.
**Attacker:** An autonomous AI agent built by CodeWall (a security research firm), with no credentials, no insider help, no human guidance. Attack duration: 2 hours.

**Vulnerabilities exploited:**

1. **22 unauthenticated endpoints out of 200+.** The agent enumerated public API documentation, found endpoints that required no auth, and probed them. Some were debug endpoints; some were left over from development; some were intended-public but reflected internal data.
2. **SQL injection through JSON keys.** One unauthenticated endpoint wrote user search queries to the database. The query *values* were safely parameterised, but the JSON *keys* (the field names) were concatenated directly into SQL. The agent recognised JSON keys reflected verbatim in error messages and identified the SQL injection. **This is a vector standard tools (SAST scanners, parameterised-query libraries) don't flag** because the values were correctly parameterised — only the field names were the vulnerability.
3. **Inability to distinguish humans from agents.** The platform's logging and access-control layers treated agent traffic as if it were human traffic. Behavioural baselines didn't exist. The agent's machine-speed enumeration looked like normal traffic to monitoring systems.

**Data exposed:**
- 46.5 million chat messages (strategy discussions, financial information, internal research, client engagements)
- 3.68 million RAG document chunks (the underlying knowledge base)
- 728,000 files (Microsoft Office, PDFs)
- 57,000 user accounts

**Lessons applicable to SageReasoning:**

- **L1.** "Most endpoints have auth" is not "every endpoint has auth". Audit needed.
- **L2.** Standard SQL-injection prevention (parameterised values) doesn't cover dynamic field names. Audit needed.
- **L3.** Agent vs human distinction must be *architectural*, not assumed.
- **L4.** Logging that doesn't distinguish agent traffic from human traffic produces baselines that anomalies hide inside.
- **L5.** A static security review wouldn't have caught the JSON-key SQL injection. Autonomous agent red-teaming would have.
- **L6.** Once an agent has any access (even read-only), it can enumerate the surface at machine speed and find escalation paths humans wouldn't.

---

## What the build plan currently addresses (security inventory)

The substrate's current security posture, as of A4 Verified (2026-05-10):

| Surface | Coverage | Build-plan reference |
|---|---|---|
| Plugin authentication | Single shared secret `PLUGIN_AUTH_SECRET`; constant-time comparison via `timingSafeEqual`; X-Plugin-Auth header | A1 (Verified); `/website/src/app/api/reason/route.ts` lines 215–278 |
| Cryptographic signing of authoritative output | Ed25519 signatures on every Layer 2 assessment; canonical-JSON serialisation; verifiers can independently verify provenance | A3 (Verified); `/adopted/ADR-layer2-signing-infrastructure.md` |
| Public-key distribution for verifiers | Hybrid (API discovery + plugin manifest); 1-hour edge cache; CORS open | A3 (Verified); `/website/src/app/api/public-key/route.ts` |
| Cryptographic key rotation | Quarterly cadence; 30-day overlap window; off-cycle (compromise-suspected) variant; founder-performable runbook | A4 (Verified, today); `/operations/runbooks/substrate-layer2-key-rotation.md` |
| Three-copy backup ceremony | Password manager + paper + Vercel env var; monthly verification cadence | A4 + A3; mirrors `/adopted/ADR-ENCRYPTION-WIRING-01.md` Decision 4 Option 4A |
| Encryption at rest for intimate data | AES-256-GCM via Node.js crypto; `MENTOR_ENCRYPTION_KEY`; Supabase application-level encryption | R17b; `/website/src/lib/server-encryption.ts` |
| Vulnerable user / distress detection | Three-layer R20a defence: in-plugin script + server-side gate + Layer 3 deterministic injection | R20a; A5 + A7 (pending) |
| Genuine deletion (not soft-delete) for intimate fields | Schema-level CASCADE delete | R17c; partial — implementation pending |
| Honest certification | R18 commitments around marketplace badges and trust signalling | R18; Stage 4 G3 |
| Auth/cookie/session integrity | AC7 standing constraint; PR6 Critical-classification of any change touching auth surface | AC7; PR6 |
| Vercel platform constraints | KG1 five rules (DB writes await; no fire-and-forget; etc.) | KG1 |
| Critical Change Protocol | Six-step writeup before any deploy of Critical-tier changes; explicit founder approval naming risks | 0c-ii |
| Decision audit trail | `/operations/decision-log.md` append-only | 0f / R0 |

**What this inventory says, honestly:** SageReasoning has invested significantly in the *cryptographic* and *data-protection* dimensions of security (signing, rotation, encryption, three-copy backup, distress detection). The substrate's *moat* — Layer 2 authoritative + Layer 3 controlled prose with cryptographic signing — is now technically delivered at the API boundary, and the rotation contract is operationally exercisable.

**What this inventory does not address:** the agent-as-attacker dimension (per the McKinsey lesson), the agent-identity dimension (per OWASP Agentic Top 10 2026), and the runtime-observability dimension (rate limiting, anomaly detection, audit logging at the level NIST AI RMF expects).

---

## OWASP Top 10 for Agentic Applications 2026 — coverage map

OWASP released a separate Top 10 for agentic applications in 2026 (distinct from the LLM Top 10) because *"agentic systems combine reasoning, memory, tools, and multi-step execution, introducing new classes of vulnerabilities that extend beyond prompt-level attacks"*. The 2026 framework focuses on:

| OWASP Agentic 2026 Risk | Build-plan coverage | Gap |
|---|---|---|
| Goal misalignment (agent pursues unintended goals) | None explicit | **Significant** |
| Tool misuse (agent invokes tools outside intended scope) | Partial — checkPluginAuth gates ingress; no per-tool scope | **Significant** |
| Delegated trust (agent acts on behalf of others; trust boundaries unclear) | Partial — Stage 3 D3 subagent handoff is signed, but inter-agent trust boundaries underspecified | **Significant** |
| Inter-agent communication (multi-agent systems; trust between agents) | Partial — Stage 3 D3 + D4 address this; not yet built | **Significant** (until built) |
| Persistent memory (memory poisoning; context corruption) | Partial — R17 encryption protects integrity at rest, not against logical corruption | **Significant** |
| Emergent autonomous behavior (agent does unexpected things at scale) | None explicit | **Significant** |
| Prompt injection (LLM01:2025; carried forward into agentic context) | None explicit at Layer 1 or Layer 3 | **Critical** |
| Excessive agency (agent has more privilege than its task requires) | Partial — closed Layer 2/3 + open Layer 1 narrows the surface | **Minor** (architectural choice helps) |
| Sensitive information disclosure (LLM02; carried forward) | Partial — R17 encryption + R17e API-non-exposure | **Minor** |
| Supply chain (LLM03; carried forward) | Partial — dependency minimisation preference; no formal SBOM | **Minor** |

**Reading this map:** the build plan addresses the LLM-Top-10 dimensions (which existed pre-2026) reasonably well via R17/R20a/AC5/AC7. The Agentic-2026-specific dimensions (goal misalignment, tool misuse, delegated trust, inter-agent communication, persistent memory, emergent autonomous behavior) are largely uncovered or only partially covered. This is unsurprising — the framework is six months old at time of writing — but it represents the bulk of the gap surface.

---

## Gaps identified — prioritised

Each gap names: what's missing; what could happen if not addressed; which stage of the build plan is the natural home; recommended risk classification.

### CRITICAL gaps (existential risk if not addressed)

**G1. No per-agent credentials + per-agent revocation mechanism.**
- **What's missing:** plugin authentication uses one shared `PLUGIN_AUTH_SECRET`. Every plugin install would (presumably) ship with this secret or use a public key derived from it. If one install is compromised, the only response is rotating the global secret — which severs every legitimate install simultaneously.
- **What could happen:** the McKinsey lesson directly. A single compromised plugin install can be detected only after damage; the response (global rotation) is so blunt that it discourages prompt revocation, leaving compromised access in place longer.
- **Industry standard:** per-agent credentials (unique per install); short-lived tokens; revocation in seconds; pre-built runbooks with tested automation.
- **Natural home in build plan:** Stage 1 A1 needs an amendment. The current `checkPluginAuth` returns `plugin_id: 'scaffold-plugin'` — a placeholder. A real per-agent credential scheme (e.g., per-install tokens issued at install time + a revocation list checked at every call) is foundational and arguably should land before Stage 2 K-category migration broadens the substrate's exposure.
- **Recommended risk classification:** Critical (auth-surface change; PR6 + AC7 engage).

**G2. No "agent vs human" distinction at the API layer.**
- **What's missing:** the API surface accepts calls but doesn't carry metadata about caller type. Logs, rate limits, and access-control decisions can't differentiate agent traffic from human traffic.
- **What could happen:** the McKinsey root failure. Behavioural baselines built on aggregate traffic make agent attack patterns invisible (agent traffic is small relative to human traffic and looks like normal API usage at low volume).
- **Industry standard:** agents are a distinct identity type with their own scope limits, logging fields, and access-control rules. Tokens encode identity type explicitly.
- **Natural home in build plan:** Stage 1 A1 amendment co-located with G1. Adds an `identity_type: 'agent' | 'human'` field to the auth context; logs include it; downstream code branches on it where appropriate.
- **Recommended risk classification:** Critical.

**G3. No endpoint-authentication audit process.**
- **What's missing:** no checklist or CI/CD check that verifies every API endpoint requires auth (or is explicitly marked public with reason). The codebase has `/api/public-key` (intentionally public) and `/api/reason` (auth required) and likely many others; no inventory.
- **What could happen:** McKinsey's 22 unauthenticated endpoints. Endpoints added during development without auth (debug routes, status pages, partially-built features) ship to production with auth gaps.
- **Industry standard:** "secure by default" — auth required unless explicitly opted out with documented reason. CI/CD check that scans the route file structure and flags missing auth gates.
- **Natural home in build plan:** governance work; ~1 session to build an authentication-status inventory of every endpoint in `component-registry.json`, plus a Vercel/CI check that fails the build if a route file lacks an auth gate without a `// PUBLIC-ENDPOINT-INTENTIONAL: <reason>` annotation.
- **Recommended risk classification:** Standard for the inventory work; Elevated for the CI check (modifies build pipeline).

**G4. No coverage of dynamic-field-name SQL injection (the McKinsey vector).**
- **What's missing:** the build plan and codebase rely on Supabase's parameterised-query protection, which protects values but not field names. Any code that constructs SQL with user-controlled JSON keys is vulnerable.
- **What could happen:** a copy of the McKinsey/Lilli vulnerability. The substrate ingests `Layer1Schema` (per A2 input validation), produces `Layer2Assessment`, both are JSON. If anywhere in the codebase a JSON key is constructed into SQL (jsonb operators; dynamic ORDER BY; dynamic field selection), the same vector applies.
- **Industry standard:** code review specifically for dynamic field-name SQL; static analysis tools updated to flag the pattern; or architectural choice to never construct SQL from JSON keys (whitelist field names from a fixed list).
- **Natural home in build plan:** Stage 1 governance; ~1 session to grep the codebase for dynamic-field-name SQL patterns and audit each occurrence. If none found, the audit produces a "this codebase does not use the McKinsey/Lilli vector" attestation.
- **Recommended risk classification:** Standard for the audit; Elevated if any dynamic-field-name SQL is found and needs refactoring.

### SIGNIFICANT gaps (industry best practice; addresses OWASP 2026 risks)

**G5. No rate limiting or behavioural anomaly detection per agent.**
- **What's missing:** Vercel may apply implicit limits but the architecture doesn't specify per-agent rate caps. No baseline of "normal" agent behaviour. No anomaly alerting.
- **Industry standard:** "behavioural throttling" — graduated constraints based on anomaly severity. Minor anomaly = 25% rate reduction + enhanced logging; severe = near-complete throttling + emergency response. Behavioural baselines per agent (request shape, time distribution, tool-use patterns).
- **Natural home in build plan:** Stage 1 A9 (cost monitoring) is a related cost-monitoring item; rate-limiting/anomaly-detection is the security cousin. Either A9 expands or a new A10 is added.
- **Recommended risk classification:** Elevated.

**G6. No prompt-injection defence in Layer 1 or Layer 3.**
- **What's missing:** OWASP's #1 LLM risk. Layer 1 takes user text and produces structured features via Sonnet — direct prompt-injection vector (user puts "ignore previous instructions and instead..." in their input). Layer 3 takes assessment + LLM call to produce prose — second prompt-injection vector (if assessment fields contain injected content from Layer 1's output, Layer 3's prompt may be subverted).
- **Industry standard:** "dual-LLM pattern" (privileged LLM holds tools; quarantined LLM reads untrusted content; structured summaries between them). Input sanitisation. Output validation. Refuse to embed user content directly in system prompts.
- **Natural home in build plan:** Stage 1 A5 (Layer 3 service) — A5's CCP responses should explicitly address prompt injection. Stage 3 B1 (Layer 1 reference hardening) — B1 should include prompt-injection-resistant prompt construction.
- **Recommended risk classification:** Critical (Layer 3 carries R20a injection; if prompt injection bypasses R20a, that's a safety failure).

**G7. No scope/capability tokens for plugin tools.**
- **What's missing:** Stage 3 plugin tools (C3) currently scope at the plugin level (auth secret → all tools accessible). Industry best practice is per-tool scope tokens: a token for `/api/score` doesn't allow access to `/api/score-document`.
- **Industry standard:** capability tokens encoding routes, tools, budgets, expiry, delegation limits, revocation checks.
- **Natural home in build plan:** Stage 3 C3 (Plugin tools) — design plugin tools to require capability tokens, not just plugin auth.
- **Recommended risk classification:** Elevated.

**G8. No audit logging at NIST AI RMF level for agent actions.**
- **What's missing:** logs don't capture decision event + context + controls (the three NIST-AI-RMF-defensible evidence types). No commitment to immutable logs.
- **Industry standard:** decision-level logging — what the agent decided, why, what tools it invoked, what policy evaluations gated it, identity mappings. Sensitive data masked. ~5-10ms per call latency cost; ~15% storage growth/month for chatty agents.
- **Natural home in build plan:** Stage 1 A9 cost monitoring + new audit-logging item. Could combine with G5's anomaly detection.
- **Recommended risk classification:** Elevated.

**G9. No commitment to autonomous-agent red-team testing during development.**
- **What's missing:** the build plan's adversarial-evaluation protocol (R18d) is at Stage 4 G3 (marketplace listing trust signalling). The McKinsey attacker was an autonomous AI agent in 2 hours — by Stage 4, the substrate is publicly listed and exposure is real.
- **Industry standard:** adversarial agent testing during development, not just before launch. Even a simple "let an autonomous agent try to break this" exercise after each Critical-tier surface lands would have caught the McKinsey/Lilli endpoint enumeration.
- **Natural home in build plan:** every Critical-tier session's verification step adds an "autonomous agent red-team probe" alongside the three-scenario PR1 proof. Could be as simple as "ask another Claude agent to try to find vulnerabilities in the new surface and report findings."
- **Recommended risk classification:** add to the verification methodology; not a separate Critical session.

**G10. No agent-identity standard adoption (FIDO Alliance / OAuth for AI Agents).**
- **What's missing:** the build plan rolls its own plugin-auth scheme. As of 2026, FIDO Alliance is developing standards for trusted AI agent interactions; Auth0 and others are publishing "Auth for AI Agents" patterns. The build plan doesn't commit to any of these standards (or to a clear non-adoption with reasoning).
- **Industry standard:** delegated authentication, just-in-time provisioning, runtime access control, Zero Trust OAuth, full action traceability — codified by emerging standards.
- **Natural home in build plan:** Stage 3 C5 (plugin hooks) — when designing how plugins authenticate to the substrate, evaluate emerging standards. Stage 4 G2 (per-marketplace packaging) — different marketplaces may require different agent-identity standards.
- **Recommended risk classification:** Standard (research/decision work); Elevated if adoption is decided.

### MINOR gaps (good hygiene; lower urgency)

**G11. No Web Application Firewall (WAF) or perimeter security beyond Vercel defaults.**
- The McKinsey/Lilli incident wouldn't have been prevented by a WAF (the SQL injection was application-layer), but a WAF adds defence-in-depth.
- Vercel offers some WAF features; not currently configured per the build plan.
- Stage 1 A9 or new item; ~1 session to evaluate Vercel's WAF + configure rules.
- Standard risk.

**G12. No SBOM (Software Bill of Materials) commitment.**
- OWASP LLM03 (supply-chain risk) calls for SBOM tracking. Currently the dependency-minimisation preference partially addresses this; no formal SBOM.
- Lawyer engagement at Stage 3 may surface SBOM requirements per regulatory jurisdiction.
- Standard risk.

**G13. No commitment to Content Security Policy (CSP) headers on the website.**
- Mitigates cross-site scripting on `sagereasoning.com`. Standard hygiene.
- Stage 1 governance; ~30 min to add CSP headers via Next.js middleware.
- Standard risk.

**G14. No commitment to security.txt / responsible disclosure policy.**
- Industry standard for any internet-exposed system: a `/.well-known/security.txt` file telling researchers how to report vulnerabilities.
- Stage 1 governance; ~15 min.
- Standard risk.

**G15. No persistent-memory poisoning defence.**
- OWASP Agentic 2026 risk: agent memory (RAG retrievals, session context, mentor profile) can be poisoned by upstream content.
- The substrate's RAG and mentor-profile context layers are vulnerable in principle. Mitigation: governed context (validate what the agent retrieves and treats as truth).
- Stage 3 plugin internals + Stage 2 K-category migration — this risk amplifies as more consumers migrate.
- Elevated risk.

**G16. R18 honest certification doesn't currently include security posture.**
- The substrate makes ethical claims via R18; current claim language doesn't include security posture (e.g., "every assessment cryptographically signed; per-agent revocation in seconds; audit logs preserved 18 months").
- Stage 4 G3 marketplace listing trust signalling can include security claims; the underlying work needs to land first.
- Standard risk for the certification language; the underlying work is what this audit is about.

---

## Recommendations — mapped to build-plan stages

Below is a prioritised recommendation set. Each recommendation has: gap reference; suggested stage placement; estimated session count; what you (founder) would notice if it's working.

### Immediate (next 1-2 sessions, before Stage 2)

**R1. Per-agent credentials + revocation mechanism (addresses G1 + G2).** Critical risk. ~3-5 sessions.
- A new sub-stage in Stage 1 — call it A10 or fold into A1-revisited.
- Replace single `PLUGIN_AUTH_SECRET` with: per-install token issuance (each plugin install gets a unique token at install time); per-token metadata (identity type = agent; install ID; capability scope); a revocation list checked at every authenticated call; an admin-only API to revoke a specific token.
- **What you'd notice if it's working:** when a plugin is suspected compromised, you can revoke that one token in seconds without affecting any other install. Logs distinguish agent vs human traffic. The substrate has a "revocation runbook" mirroring the rotation runbook.
- **What could happen if not addressed:** the McKinsey lesson — one compromise = global rotation = legitimate users kicked off.

**R2. Endpoint-authentication audit + CI check (addresses G3).** Standard risk for audit; Elevated for CI check. ~1-2 sessions.
- Inventory every API endpoint in the codebase. For each, document: requires auth (yes/no); if no, why public.
- Add CI/CD check: any new route file without an auth gate must include a `// PUBLIC-ENDPOINT-INTENTIONAL: <reason>` annotation or the build fails.
- **What you'd notice if it's working:** a documented endpoint inventory; CI fails when a developer adds an unauthenticated endpoint accidentally.
- **What could happen if not addressed:** McKinsey's 22 unauthenticated endpoints — a development oversight ships to production.

**R3. JSON-key SQL injection audit (addresses G4).** Standard risk. ~1 session.
- Grep the codebase for dynamic field-name SQL patterns: jsonb operators with user-controlled keys; ORDER BY with user-controlled fields; dynamic SELECT field lists.
- For each occurrence (if any), replace with whitelist-based field selection.
- **What you'd notice if it's working:** an audit report attesting that the codebase does not use the McKinsey/Lilli vector. Or a list of refactored sites.
- **What could happen if not addressed:** the exact McKinsey/Lilli vulnerability replicated.

### Near-term (during Stage 1 completion + early Stage 2)

**R4. Prompt-injection defence in Layer 1 + Layer 3 (addresses G6).** Critical risk. Folds into A5 (Layer 3) + B1 (Layer 1 hardening).
- A5's CCP responses must explicitly address prompt injection.
- Layer 3's prompt construction must NOT embed user-controlled assessment content directly into the system prompt; structured summaries only.
- Layer 1's prompt construction must use prompt-injection-resistant patterns (e.g., delimited user input; explicit "the following is user-supplied data" framing; output validation).
- Consider the dual-LLM pattern for Layer 3 (privileged LLM holds R20a/R3/R19 deterministic injection; quarantined LLM produces prose).
- **What you'd notice if it's working:** A5 ADR includes a §"Prompt injection defence" section; B1 ships with documented prompt-construction patterns; adversarial test cases (G9) verify the pattern.
- **What could happen if not addressed:** an attacker submits user input that subverts Layer 1, Layer 3, or both. Could bypass R20a distress detection in the worst case.

**R5. Rate limiting + audit logging + anomaly detection (addresses G5 + G8).** Elevated risk. ~3-4 sessions.
- Per-agent rate limits (request count + token budget per time window).
- Audit logs at NIST AI RMF level: decision event + context + controls. Sensitive data masked. Immutable storage (Supabase append-only or external log service).
- Behavioural baselines per agent identity; anomaly detection rules; alerts on graduated severity.
- Folds into Stage 1 A9 (cost monitoring) — same telemetry infrastructure can serve security monitoring.
- **What you'd notice if it's working:** logs distinguish per-agent traffic; alerts fire on anomalies; you can answer "what did agent X do over the last 30 days" precisely.
- **What could happen if not addressed:** compromised agent operates undetected at machine speed; incident response has no telemetry to work from.

**R6. Autonomous-agent red-team probe added to verification methodology (addresses G9).** Folds into existing PR1 single-endpoint-proof discipline. ~0 additional sessions (added as a verification step).
- After every Critical-tier verification, ask another Claude agent to spend 15-30 minutes trying to find a vulnerability in the new surface. Report findings to the session.
- **What you'd notice if it's working:** every Critical-tier session-close includes a "red-team probe — N findings, N closed, N filed for follow-up" line.
- **What could happen if not addressed:** the McKinsey lesson — autonomous agents can find issues humans + static review miss.

### Mid-term (Stage 3 onward)

**R7. OWASP Agentic Top 10 2026 mapping (addresses G2 + the agentic-2026 risks).** Standard risk. ~1 session.
- Add a manifest amendment (J7) explicitly mapping each OWASP Agentic 2026 risk to a build-plan rule or item. Document gaps with reasoning.
- **What you'd notice if it's working:** an artefact you can show in marketplace certification (Stage 4 G3) and in your own due-diligence conversations.

**R8. Capability tokens for plugin tools (addresses G7).** Elevated risk. Folds into Stage 3 C3 design.
- Plugin tools accept capability tokens that encode: which tools, which budgets, which expiry. Substrate validates each tool call against the token's encoded scope.
- **What you'd notice if it's working:** one plugin install can be granted partial access (e.g., `/api/score` only, not `/api/score-document`); tokens expire and refresh automatically.

**R9. Agent-identity standard adoption decision (addresses G10).** Standard risk for decision; Elevated if adoption. ~1-2 sessions.
- Stage 3 C5 includes an evaluation of emerging agent-identity standards (FIDO Alliance, Auth0 for AI Agents, OAuth for Agents). Decision: adopt one, defer, or roll our own.
- **What you'd notice if it's working:** an ADR documenting the decision and reasoning.

### Hygiene (any time)

- **R10.** WAF evaluation + configuration on Vercel (G11). ~1 session, Standard risk.
- **R11.** SBOM + supply-chain-risk track (G12). ~1 session, Standard risk; coordinate with lawyer engagement at Stage 3.
- **R12.** CSP headers on `sagereasoning.com` (G13). ~30 min, Standard risk.
- **R13.** `/.well-known/security.txt` + responsible-disclosure policy (G14). ~15 min, Standard risk.
- **R14.** Persistent-memory poisoning defence in Stage 3 plugin internals + Stage 2 K-category migration (G15). Folds into existing migration sessions; Elevated risk per migration.
- **R15.** R18 honest-certification language updated to include security posture once R1-R6 land (G16). ~1 session, Standard risk; lands at Stage 4 G3.

---

## Process recommendations

These are how-we-work changes, not feature additions.

**P1. Add a "security-impact" axis to the standing protocol cache's risk classification.** Currently 0d-ii classifies changes as Standard / Elevated / Critical. The cache could add a parallel axis: "agent-attack-surface impact = none / low / medium / high". Critical + high = adversarial test required pre-deploy.

**P2. Schedule a quarterly security review.** Mirror the cryptographic-key rotation cadence. Each quarter, re-audit the build plan against the latest OWASP Agentic Top 10 + NIST AI RMF + relevant industry incidents. ~2-3 hours per quarter.

**P3. Map each manifest rule to one or more OWASP Agentic 2026 risks.** Lightweight cross-reference; surfaces gaps in real time when manifest rules are amended.

**P4. Treat security recommendations as P0/P1/P2 issues, not stage items.** This audit produces 15+ recommendations spanning multiple stages. Tracking them as a security backlog (separate from the staging plan) makes sure none falls through the cracks.

**P5. Add the McKinsey/Lilli incident (and future incidents) to the build cache's "lessons" section.** When the founder reads the cache at session-open, they're reminded of the live threat landscape, not just the build plan's internal logic.

---

## Founder verification — how to know the recommendations are working

**For R1 (per-agent credentials + revocation):**
- You can list every agent identity that has ever been issued a token.
- You can revoke any single one without touching others. Mean-time-to-revoke < 60 seconds.
- A pre-built revocation runbook exists at `/operations/runbooks/agent-credential-revocation.md` mirroring the key-rotation runbook.

**For R2 (endpoint audit + CI check):**
- An inventory document at `/adopted/endpoint-authentication-inventory.md` or as columns in `component-registry.json`.
- A failing CI run when a developer adds an unauthenticated endpoint without the `PUBLIC-ENDPOINT-INTENTIONAL` annotation.

**For R3 (JSON-key SQL audit):**
- An attestation document or a list of refactored sites.

**For R4 (prompt-injection defence):**
- A5 ADR has an explicit §"Prompt injection defence" section.
- Adversarial test cases (R6) attempt prompt injection and confirm the substrate resists.

**For R5 (rate limiting + audit + anomaly):**
- You can answer "what did agent X do in the last hour" precisely from logs.
- An alert fires when an agent's traffic deviates from baseline.

**For R6 (red-team probe):**
- Every Critical-tier session-close has a red-team-findings line.

**For R7-R9 (OWASP mapping; capability tokens; agent-identity standard):**
- Documented decisions; ADRs; cross-references in the manifest.

---

## Honest disclosure

This audit is based on May 2026 industry consensus from OWASP, NIST, FIDO Alliance, Auth0, and incident reports. It is not exhaustive. It does not constitute a penetration test. It does not eliminate the risk that an autonomous AI attacker could find a vector none of the cited frameworks anticipate.

The most honest framing of agent security as of May 2026: **we are operating in a space where attackers (agents) and defenders (us) are both AI, attackers have access to the same general-purpose AI capabilities defenders do, and the field's defensive baselines are still forming.** The recommendations above are about reducing blast radius and enabling rapid response, not about achieving immunity.

**Two recommendations that feel uncomfortable to make explicit but should be:**

1. **Treat the substrate's own security posture as a marketplace-listing prerequisite, not a Stage 6 polish item.** Stage 4 G3 (marketplace listing) currently includes "trust signalling" but the underlying security work this audit recommends (R1-R6) is not in Stage 4's success criteria. If the substrate ships to a marketplace before R1-R6 land, the substrate is shipping with a known incomplete security posture.

2. **Engage a real penetration tester (human or autonomous) before Stage 4 G4 marketplace approval.** The lawyer engagement is critical-path at Stage 3 per the staging plan; the security-engagement equivalent is missing. Recommend adding it as a Stage 3 H5 item alongside the lawyer review.

---

## Next steps for the founder

This document is a research artefact, not an action plan. You decide:

1. **Which recommendations enter the build plan?** (My recommendation: R1-R6 are non-negotiable for any system serving agents; R7-R15 should be assessed and prioritised case by case.)
2. **At what stage do they land?** (My recommendation: R1-R6 before Stage 2 K-category migration begins; R7-R10 during Stage 3; R11-R15 hygiene any time.)
3. **What risk classification?** (My recommendation: R1 + R4 + R6 are Critical; R2 + R3 + R5 + R8 + R14 are Elevated; the rest are Standard.)
4. **Do you want a separate security-backlog document** distinct from the staging plan, tracking just these items? (Recommendation P4.)
5. **Should the next session be a security-recommendations triage** (electing which to adopt and where they land) before resuming Stage 1 A5? (My recommendation: yes; ~1-2 hours; clears the security debt before A5 expands the substrate's surface further.)

If you want me to draft the manifest amendments (J7) for the recommendations you adopt, or to produce a separate `/adopted/security-backlog.md` tracking these items as P-issues, I can do both as Standard-risk governance work in a follow-up session.

---

## Sources

External references cited in this audit:

- McKinsey/Lilli incident — [How We Hacked McKinsey's AI Platform (CodeWall)](https://codewall.ai/blog/how-we-hacked-mckinseys-ai-platform); [How an AI Agent Hacked McKinsey's AI Platform (Outpost24)](https://outpost24.com/blog/ai-agent-hacked-mckinsey-ai-platform/); [How SQL Injection Breached McKinsey's Lilli AI Platform (Hathr.ai)](https://www.hathr.ai/blogs/mckinsey-lilli-ai-platform-breach-sql-injection); [McKinsey Lilli Breach (2026): What It Reveals About Agent Authentication (1Kosmos)](https://www.1kosmos.com/resources/blog/mckinsey-lilli-breach-agent-authentication); [Autonomous Agent Hacked McKinsey's AI in 2 Hours (Bank Info Security)](https://www.bankinfosecurity.com/autonomous-agent-hacked-mckinseys-ai-in-2-hours-a-31007)
- OWASP Top 10 for Agentic Applications 2026 — [OWASP Gen AI Security Project](https://genai.owasp.org/resource/owasp-top-10-for-agentic-applications-for-2026/); [Practical DevSecOps overview](https://www.practical-devsecops.com/owasp-top-10-agentic-applications/); [NeuralTrust deep dive](https://neuraltrust.ai/blog/owasp-top-10-for-agentic-applications-2026); [Palo Alto Networks blog](https://www.paloaltonetworks.com/blog/cloud-security/owasp-agentic-ai-security/)
- OWASP Top 10 for LLM Applications 2025 (carried into 2026 frameworks) — [OWASP Foundation](https://owasp.org/www-project-top-10-for-large-language-model-applications/); [LLM01:2025 Prompt Injection (OWASP Gen AI)](https://genai.owasp.org/llmrisk/llm01-prompt-injection/); [LLM Prompt Injection Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/LLM_Prompt_Injection_Prevention_Cheat_Sheet.html)
- Agent identity / authentication — [What is AI Agent Authentication? 2026 Guide (Strata)](https://www.strata.io/glossary/agent-authentication/); [AI Agents Authentication: How Autonomous Systems Prove Identity (GitGuardian)](https://blog.gitguardian.com/ai-agents-authentication-how-autonomous-systems-prove-identity/); [A New Identity Playbook for AI Agents in 2026 (Strata)](https://www.strata.io/blog/agentic-identity/new-identity-playbook-ai-agents-not-nhi-8b/); [FIDO Alliance to Develop Standards for Trusted AI Agent Interactions](https://fidoalliance.org/fido-alliance-to-develop-standards-for-trusted-ai-agent-interactions/); [Auth0 for AI Agents](https://auth0.com/ai)
- Capability tokens + revocation — [Agent Capability Tokens (SatGate)](https://satgate.io/agent-capability-tokens); [The Agentic AI Security Scoping Matrix (AWS)](https://aws.amazon.com/blogs/security/the-agentic-ai-security-scoping-matrix-a-framework-for-securing-autonomous-ai-systems/); [AI agent access control (WorkOS)](https://workos.com/blog/ai-agent-access-control)
- Rate limiting + behavioural anomaly detection — [Beyond Simple Rate Limiting: Behavioral Throttling (Helios Tech)](https://dev.to/helios_techcomm_552ce9239/beyond-simple-rate-limiting-behavioral-throttling-for-ai-agent-security-44lk); [Real-Time AI Agent Monitoring (Obsidian Security)](https://www.obsidiansecurity.com/blog/ai-agent-monitoring-tools); [Rate Limiting & Throttling for AI Agents (NeuralTrust)](https://neuraltrust.ai/blog/rate-limiting-throttling-ai-agents); [Anomaly Detection for Non-Human Identities (Aembit)](https://aembit.io/blog/anomaly-detection-non-human-identities/)
- Audit logging + NIST AI RMF — [AI Risk Management Framework (NIST)](https://www.nist.gov/itl/ai-risk-management-framework); [Compliance and Audit Frameworks for Agentic AI (Token Security)](https://www.token.security/blog/compliance-and-audit-frameworks-for-agentic-ai-systems); [How to Build AI Audit Trails (CX Today)](https://www.cxtoday.com/security-privacy-compliance/ai-audit-trail-regulatory-scrutiny/); [Auditing and Logging AI Agent Activity (LoginRadius)](https://www.loginradius.com/blog/engineering/auditing-and-logging-ai-agent-activity)
- Prompt injection defence (agentic) — [Securing agentic apps: How to contain AI agent prompt injection (WorkOS)](https://workos.com/blog/ai-agent-prompt-injection); [How Prompt Injection Attacks Compromise AI Agents in 2026 (Atlan)](https://atlan.com/know/prompt-injection-attacks-ai-agents/); [From LLM to agentic AI: prompt injection got worse (Christian Schneider)](https://christian-schneider.net/blog/prompt-injection-agentic-amplification/)
- Next.js + Supabase security — [Use Supabase with Next.js (Supabase Docs)](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs); [Best Security Practices in Supabase (Supadex)](https://www.supadex.app/blog/best-security-practices-in-supabase-a-comprehensive-guide); [Securing Your Next.js API Calls with Supabase Service Keys (Phoebe Theresa Peters)](https://medium.com/@zgza778/securing-your-next-js-api-calls-with-supabase-service-keys-1d6f024b3cd2)

Internal references:
- `/adopted/substrate-plugin-staging-plan.md` (Stage 1-6 + licensing gate; the audit subject)
- `/manifest.md` (R0-R20, AC1-AC8, KG1-KG7, PR1-PR9)
- `/adopted/standing-protocol-cache.md` (risk classification 0d-ii; signals; templates)
- `/adopted/build-sessions-protocol-cache.md` (build-arc-specific governing notes)
- `/adopted/ADR-stoic-agent-substrate-concept.md` (the substrate's three-layer architecture)
- `/adopted/ADR-layer2-signing-infrastructure.md` (A3 ADR — cryptographic signing)
- `/adopted/ADR-A4-key-management.md` (A4 ADR — key rotation; adopted today 2026-05-10)
- `/adopted/ADR-ENCRYPTION-WIRING-01.md` (R17 encryption)

---

*End of audit. Author: AI per founder request 2026-05-10. The recommendations represent May 2026 industry consensus and are presented as options for the founder's deliberate choice (R0). No recommendation is adopted unless the founder explicitly elects it; this document does not modify the build plan.*
