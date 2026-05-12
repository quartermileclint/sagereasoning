# Anthropic Developer Platform Capabilities Survey (May 2026) — Prep for Build-Plan Stress-Test Session

> **CORRECTION NOTICE (added 2026-05-10 after drafting):** This survey **missed three major features** announced at "Code with Claude 2026" on 2026-05-06: **Dreams** (memory consolidation; research preview); **Outcomes** (rubric + separate grader; public beta); **Multi-agent orchestration** (specialist agents; public beta). The omission was caught by the founder via a simple Google search after the AI claimed not to find "dreaming." The cause was inadequate search discipline (narrow queries; overconfident negative findings; domain restrictions excluding announcement venues). The build-plan stress-test prompt at `/operations/handoffs/founder/2026-05-10-build-plan-stress-test-NEXT-SESSION-PROMPT.md` carries the corrected info in §"On Anthropic's Memory features + Dreams + Outcomes + Multi-agent orchestration" and includes a new Standing Requirement 1a mandating negative-finding discipline. Treat this survey as a starting-point inventory, not a finished one — material features may still be missing.

**Status:** Drafted 2026-05-10. Research artefact, not a build-plan amendment.
**Purpose:** Surface current (May 2026) Anthropic developer-platform features the SageReasoning build plan was scoped without explicit reference to. Founder reviews; decides at the stress-test session which features fold into the build plan and which Stage they affect.
**Limitations:** Web-research-based survey; not exhaustive; framework features evolve continuously. Founder will independently source best-practice materials; this document is intended to combine with those, not replace them.
**Method:** Web-searches on anthropic.com / docs.anthropic.com / docs.claude.com / modelcontextprotocol.io for current state of: security review automation, sub-agents, Agent SDK, Managed Agents, Skills marketplace, Memory tool, MCP, Plugins, GitHub Actions integration.

---

## Executive summary

**Ten Anthropic features were either unknown to me at brainstorming time (May 2025 knowledge cutoff) or under-utilised in the current build plan.** Three observations:

1. **The build plan treats Anthropic as a model provider** (Sonnet for Layer 1+3; Haiku for distress detection) **rather than as a platform provider**. Significant portions of Stage 3 (plugin internals; D-mechanisms; E-mechanisms) and some Stage 1 work could be replaced or substantially accelerated by using Anthropic's native primitives instead of bespoke implementations.

2. **The security-review feature you saw in the YouTube video is real and immediately usable.** `/security-review` is a built-in Claude Code slash command; `anthropics/claude-code-security-review` is a GitHub Action that runs automatically on every PR. Both use reasoning (not pattern-matching) and catch complex vulnerabilities including data-flow analysis. Adopting these closes my audit's R6 (autonomous-agent red-team probe) at near-zero ongoing cost.

3. **The most consequential finding for the build plan's structure is that the plugin work in Stage 3 (C1-C7) should likely be built on Anthropic's Plugin spec + marketplace standard, not as bespoke architecture.** The plugin spec already covers slash commands + subagents + MCP servers + hooks composition. Building bespoke would reinvent the wheel and create future migration debt.

The features below are presented as options + risks for the stress-test session's triage. No recommendation in this document obligates the build plan to change.

---

## Feature-by-feature survey

### 1. Claude Code `/security-review` + GitHub Action

**What it is:** Two delivery channels for the same capability:
- **`/security-review` slash command** — run from the terminal before committing code; Claude searches the codebase for vulnerabilities and provides detailed explanations
- **`anthropics/claude-code-security-review` GitHub Action** — runs automatically on every PR; diff-aware (analyses only changed files); posts findings as PR comments
- **Uses reasoning, not pattern-matching** — reads and reasons about code the way a human security researcher would; traces data flow; catches complex vulnerabilities standard SAST scanners miss (including the McKinsey/Lilli-class JSON-key SQL injection)
- **Released:** as research preview to Enterprise/Team customers; expedited access for OSS maintainers

**Relevance to SageReasoning build plan:**
- **Replaces:** my security audit's R6 (autonomous-agent red-team probe) — currently scoped as a manual addition to every Critical-tier session's verification step
- **Augments:** the Critical Change Protocol's verification step; closes the McKinsey-class gap (G3 + G4 in my audit)
- **Stage relevance:** could be adopted immediately (before A5); ongoing cost is per-PR Claude usage; would catch issues in A5 + A7 (the upcoming R20a-critical work)
- **What's currently scoped bespoke:** my audit's R6 was framed as "ask another Claude agent to spend 15-30 minutes trying to find a vulnerability" — `/security-review` is the productised version

**Risk if not adopted:** the McKinsey-class vector (JSON-key SQL injection or similar) shipping undetected. The build plan's adversarial-evaluation protocol (R18d) is at Stage 4; without `/security-review` integration, the substrate is exposed for ~30+ sessions before adversarial review catches anything.

**Recommended in the stress-test:** adopt the GitHub Action for automatic PR review; adopt the slash command for local pre-commit use; add to PR0 protocol as standing requirement for Critical-tier surfaces.

---

### 2. Claude Code Sub-Agents (production) + Agent Teams (research preview)

**What it is:**
- **Sub-agents** — delegate specialised tasks to purpose-built agents with their own context windows. Allows parallel work (e.g., spinning up a backend API while main agent builds frontend).
- **Agent teams** — research preview enabling multiple agents to work in parallel and coordinate autonomously. Best for tasks that split into independent, read-heavy work like codebase reviews.
- **Hooks system** — automatic triggers at specific points (pre-commit linting; post-test runs; etc.)
- **Background tasks** — long-running processes that don't block main agent's progress.

**Relevance to SageReasoning build plan:**
- **Replaces some Stage 3 D-mechanisms work:** D1 (action scorer), D2 (verification), D3 (subagent handoff) currently scoped as bespoke implementations. Anthropic's subagent infrastructure handles handoff payloads, parallelisation, and context isolation natively.
- **Replaces the Jest-configuration F-series stewardship debt:** a "test-runner subagent" could execute the `.test.ts` files that A3 + A4 wrote, removing the need for Jest configuration entirely.
- **Augments the verification framework:** session-end verification could spin up a "verifier subagent" that runs the three production scenarios independently and reports.
- **Relevant to your project-instructions:** Hooks system could automatically enforce the PR1 single-endpoint-proof discipline + the Critical Change Protocol gates.

**Risk if not adopted:** building bespoke versions of D-mechanisms when Anthropic primitives already exist; the test-execution debt continues to accumulate; the verification framework remains manual.

---

### 3. Claude Agent SDK (renamed from "Claude Code SDK")

**What it is:**
- The same primitives that power Claude Code, **programmable in Python and TypeScript**.
- Built-in tools: read files, run commands, search codebases, web search/fetch.
- **Subagents support by default.**
- **MCP integration** — connect to external services without writing OAuth or API code.
- **Context management** — automatic handling of context windows and token budgets.

**Relevance to SageReasoning build plan:**
- **Critical implication:** the substrate's three-layer architecture (open Layer 1 + closed Layer 2 + closed Layer 3) could be built on the Agent SDK rather than as a bespoke Next.js + Supabase + custom-orchestration stack. This is a foundational decision that wasn't surfaced at brainstorming.
- **What's currently scoped bespoke:** Stage 3 plugin work; Stage 2 K-category migration design; significant portions of A5 + A7 + A8 (Layer 3 service, R20a gate, V3 endpoint relationship design).
- **Apple's Xcode now supports the Claude Agent SDK** — signals that the SDK is becoming a standard substrate for agentic apps generally; aligns with where SageReasoning's plugin work is headed.

**Risk if not adopted:** SageReasoning's bespoke substrate diverges from where the ecosystem is going; future migration to standard Agent SDK becomes major refactor; competitive position weakens because every other agent-platform integrator can adopt SDK features automatically while SageReasoning is locked into custom code.

**Recommended in the stress-test:** evaluate whether the closed Layer 2 + Layer 3 services should be re-architected on the Agent SDK before Stage 3 plugin work begins. This is a potentially-major scope change; needs deliberate triage.

---

### 4. Managed Agents (hosted REST API)

**What it is:**
- Anthropic-hosted service that runs long-horizon agents on your behalf.
- Anthropic runs the agent and the sandbox; your application sends events and streams back results.
- **Session as durable context** — context stored in a session log outside Claude's context window; `getEvents()` API for context interrogation.
- Designed for "long-horizon agents" that may run hours or days.

**Relevance to SageReasoning build plan:**
- **Could replace the substrate's server-side hosting infrastructure entirely.** Currently substrate runs on Vercel + Supabase + bespoke orchestration. Managed Agents could host the Layer 2 + Layer 3 services, removing infrastructure burden.
- **Could simplify Stage 4 G6 (plugin economics):** Managed Agents handle the cost model directly; substrate's pricing becomes simpler.
- **Implication for R5 (cost-as-health-metric):** Managed Agents have their own cost shape; would need to re-instrument cost monitoring against the new substrate.

**Risk if not adopted:** ongoing infrastructure cost + complexity on Vercel + Supabase; the substrate's operational discipline (rotation runbooks; backup ceremonies; etc.) all need to be maintained by the founder when Managed Agents could handle much of it.

**Recommended in the stress-test:** evaluate Managed Agents as the hosting platform for closed Layer 2 + Layer 3. This is a Stage 1 decision (foundational); should land before A5 (Layer 3 service) commits to Vercel-based hosting.

---

### 5. Agent Skills (anthropics/skills marketplace)

**What it is:**
- Organised folders of instructions, scripts, and resources that agents discover and load dynamically.
- Marketplace at `github.com/anthropics/skills` with ready-made skills (docx, pdf, pptx, xlsx, brand-guidelines, internal-comms, skill-creator).
- Skills installed via plugins; Claude loads them automatically when relevant.
- Already available to Claude.ai paid plans by default.

**Relevance to SageReasoning build plan:**
- **Distribution channel for substrate:** the substrate's plugin work (Stage 4 G1) currently names Cowork as candidate first marketplace. `anthropics/skills` is another path — potentially a faster path to first listing.
- **Re-use of existing skills:** rather than building bespoke `sage-stenographer` (P0 0g candidate skill), evaluate whether existing skills in the marketplace cover similar workflows.
- **Stage 3 F-series wiki content:** could ship as skills rather than as bespoke documentation.

**Risk if not adopted:** SageReasoning ships to a single marketplace (Cowork) when ecosystem distribution via `anthropics/skills` is also available with lower per-marketplace packaging cost.

**Recommended in the stress-test:** evaluate `anthropics/skills` as a first or second marketplace target; review existing skills for overlap with substrate workflows.

---

### 6. Memory Tool (file-based persistent context)

**What it is:**
- Claude creates, reads, updates, deletes files in a `/memories` directory.
- Memory persists across conversations.
- **Client-side** — you control storage location and infrastructure.
- **Performance:** combining with context editing yields 39% performance improvement over baseline.

**Relevance to SageReasoning build plan:**
- **Could replace some mentor-profile persistence:** the mentor-profile pipeline (D14b; R17) currently uses Supabase application-level encryption (R17b). Memory tool's file-based storage is an alternative for some of this — though Supabase still wins for cross-instance state.
- **Could replace the standing-protocol-cache pattern:** the cache pattern (`/adopted/standing-protocol-cache.md` + `/adopted/build-sessions-protocol-cache.md`) is a manual implementation of the Memory tool's automatic capabilities. CLAUDE.md is special-cased by Claude Code already (kept in context; can be edited by Claude).
- **Could simplify Phase-2 alt-3 context architecture:** much of D14b's encryption + storage discipline assumes Supabase as the substrate; Memory tool changes the picture.

**Risk if not adopted:** the substrate continues to use a higher-friction encryption + storage pattern when a lower-friction alternative exists; performance gain of 39% is forgone.

**Recommended in the stress-test:** evaluate Memory tool for the context-architecture work in Stages 1 + 2; understand the trade-off between Memory tool (file-based; client-side) and Supabase (database; cross-instance).

---

### 7. Model Context Protocol (MCP)

**What it is:**
- Standardised integrations to external services.
- Official MCP registry at `registry.modelcontextprotocol.io`.
- Remote MCP servers supported via Claude API + Claude Desktop.
- **Code execution with MCP** — recommended pattern: agents use code to interact with MCP servers, loading tools on demand and filtering data before it reaches the model. More efficient context usage.

**Relevance to SageReasoning build plan:**
- **Stage 3 C3 (Plugin tools) should use MCP as the protocol**, not bespoke HTTP. This is already an Anthropic-standard; other plugins/agents would integrate naturally.
- **Stage 3 D-mechanisms could be implemented as MCP servers** — D1 (action scorer), D2 (verification), D3 (subagent handoff payload) all map naturally to MCP server contracts.
- **Code-execution-with-MCP pattern** matches the substrate's three-layer architecture: Layer 1 (open) becomes the agent's code-execution context; Layer 2 + Layer 3 become MCP servers the agent calls.

**Risk if not adopted:** SageReasoning's plugin tools don't interoperate with the broader MCP ecosystem; agents using SageReasoning need bespoke integration code.

**Recommended in the stress-test:** commit Stage 3 C3 to MCP. Update plugin architecture decision to reflect.

---

### 8. Claude Code Plugins (slash commands + subagents + MCP + hooks composition)

**What it is:**
- Lightweight packaging of: slash commands, subagents, MCP servers, hooks.
- Plugin marketplaces are git repos with `.claude-plugin/marketplace.json`.
- Plugin spec is standardised; toggleable on/off.
- Anthropic's `claude-plugins-official` directory exists; community-curated marketplaces exist (Dan Ávila's; Seth Hobson's 80+ specialised sub-agents).

**Relevance to SageReasoning build plan:**
- **Stage 3 plugin internals (C1-C7) should be built against the Claude Code Plugin spec**, not as bespoke architecture. This is a substantial scope change; potentially saves several sessions in Stage 3.
- **Plugin spec already covers:** plugin manifest (C1), skills (C2 — via Agent Skills system above), MCP tools (C3), hooks (C4), assets (C6), documentation (C7).
- **The Stoic Agent Substrate could ship as a plugin via** `anthropics/claude-plugins-official` (if approved) or as part of the SageReasoning marketplace.

**Risk if not adopted:** the build plan reinvents wheels Anthropic has already standardised; ecosystem distribution becomes harder; future updates to Plugin spec require migration work.

**Recommended in the stress-test:** Stage 3 plugin work re-scoped to "package on Anthropic Plugin spec" rather than "design bespoke plugin architecture."

---

### 9. CLAUDE.md and project-instruction special handling

**What it is:**
- Claude Code treats `CLAUDE.md` files specially: kept in context; referenced for overall plan; **Claude can edit CLAUDE.md as it works**, updating instructions for future work.
- Memory tool reinforces this — `/memories` directory checked at task start.

**Relevance to SageReasoning build plan:**
- **The project-instructions you currently maintain should likely be a CLAUDE.md at the repository root**, not surfaced through Cowork's project-instructions panel. This affects:
  - How project instructions are loaded at session-open
  - Whether amendments to project instructions are made via Claude Code's special handling or via your current `/adopted/standing-protocol-cache.md` approach
  - Whether the standing protocol cache pattern is necessary or whether Claude Code's CLAUDE.md handling makes it redundant
- **The `/adopted/standing-protocol-cache.md` pattern is a manual implementation of CLAUDE.md special-handling** — your governance discipline is sound; the implementation could be simpler.

**Risk if not adopted:** the build's governance overhead is higher than it needs to be; Claude Code's special handling of CLAUDE.md goes unused; the cache pattern requires more discipline than is necessary.

**Recommended in the stress-test:** evaluate whether `/adopted/standing-protocol-cache.md` should become `CLAUDE.md` at the repo root and use Claude Code's special handling.

---

### 10. Claude Opus 4.6 + Sonnet 4.5 (current models)

**What it is:**
- **Claude Opus 4.6** — newest flagship model (May 2026).
- **Claude Sonnet 4.5** — current Sonnet generation with built-in context awareness (tracks available tokens throughout conversations).
- The standing protocol cache currently references `claude-sonnet-4-6` per AC1 (Layer 1 alt-3 + mentor reflection).

**Relevance to SageReasoning build plan:**
- **Model selection per AC1** (Layer 1: Sonnet; Layer 3: Sonnet; safety-critical: Haiku) is already aligned with current models, but Opus 4.6 wasn't part of the brainstorming consideration. Opus could be relevant for the highest-stakes reasoning (Layer 2 mechanisms; R20a distress classifier) — though Sonnet's reliability boundary per KG2 is acceptable for current use.
- **Sonnet 4.5's built-in context awareness** matters for the long-running Layer 3 prose generation — substrate may benefit from explicit token-budget tracking that wasn't part of the original Layer 3 design.

**Risk if not adopted:** the model-selection table in the standing cache assumes current model behaviour; Opus 4.6's capability profile may shift the right model choices for some surfaces. No immediate risk; revisit at the quarterly governance cadence.

---

## Summary table — feature × build-plan stage impact

| Feature | Build-plan items potentially affected | Magnitude |
|---|---|---|
| `/security-review` + GitHub Action | A5, A7, A9; my audit's R6; the verification framework | **High** — replaces bespoke adversarial-evaluation work; closes McKinsey-class gap |
| Sub-agents + Agent Teams + Hooks | Stage 3 D1-D5; Jest configuration debt; verification framework | **High** — replaces several Stage 3 bespoke builds |
| Agent SDK | Stage 1 A5+A7 hosting; Stage 3 plugin foundation | **Highest** — potential re-architecture of substrate hosting |
| Managed Agents | Stage 1 A5+A7 hosting; cost monitoring (A9); founder operational burden | **Highest** — potential replacement of Vercel + Supabase as substrate host |
| Agent Skills marketplace | Stage 4 G1 (first marketplace); P0 0g (sage-stenographer); Stage 3 F-series wiki | **Medium** — additional distribution channel + skill re-use |
| Memory tool | Mentor profile encryption (R17); context architecture; standing cache pattern | **Medium** — performance + simplification opportunity |
| MCP | Stage 3 C3 (plugin tools); D-mechanisms; ecosystem interoperability | **High** — protocol commitment for plugin work |
| Plugin spec + marketplaces | Stage 3 C1-C7 (almost entire plugin work); Stage 4 G2 | **Highest** — re-scope Stage 3 plugin internals on standard spec |
| CLAUDE.md special handling | Project instructions; standing-protocol-cache; build-sessions-cache | **Medium** — implementation simplification |
| Opus 4.6 + Sonnet 4.5 | Model selection table (AC1); KG2 boundary | **Low** — no immediate change needed |

---

## What this implies for the stress-test session

The features above suggest several **structural decisions** that should be made before A5 (Layer 3 service) lands, because A5 commits substrate-hosting decisions that interact with several of these features.

**The three biggest "should we have decided this earlier?" items:**

1. **Substrate hosting platform: Vercel + Supabase (current) vs Managed Agents (Anthropic-hosted).** This is a Stage 1 foundational decision that wasn't surfaced at brainstorming. If Managed Agents are adopted, A5 + A7 + A9 all change significantly.

2. **Plugin architecture: bespoke (current Stage 3 scope) vs Claude Code Plugin spec.** This is a Stage 3 decision but the architectural framing should be locked in before Stage 1 closes. Currently Stage 3 plans bespoke C1-C7; this would mostly disappear if Plugin spec is adopted.

3. **Substrate ↔ plugin protocol: bespoke HTTP API (currently implied) vs MCP.** A Stage 3 C3 decision but affects how Layer 2 + Layer 3 expose themselves; should be decided alongside #1.

**The three biggest "we should adopt this now" items:**

1. **`/security-review` slash command + GitHub Action** — closes the McKinsey-class gap at near-zero cost; should be adopted before A5 begins.

2. **Sub-agents for verification** — replaces the Jest debt; speeds up every Critical-tier session's verification phase.

3. **CLAUDE.md special handling** — simplifies governance overhead; aligns with how Claude Code expects to work.

---

## Tomorrow's stress-test session — proposed pre-reads

Before the stress-test session, the founder reads:
1. This survey end-to-end (~20 min)
2. The security audit produced today (~30 min)
3. Founder's independently-sourced best-practice materials (founder's responsibility; topic + quantity at founder discretion)
4. Optional: the Anthropic-platform docs at `https://docs.claude.com` for the features above (the founder asked specifically about these; reading source material is the surest way to confirm what's available)

Session structure proposal:
- **Phase 1 (30 min):** founder shares the best-practice materials they sourced; AI summarises this survey; we agree on the universe of domains to stress-test against.
- **Phase 2 (60 min):** domain-by-domain gap-finding — for each of security, regulatory, accessibility, privacy-by-design, observability, legal entity, insurance, marketplace economics, onboarding UX, Anthropic-native capabilities, plus any additional domains the founder's materials surface, AI produces a concise gap analysis with recommendations.
- **Phase 3 (60 min):** triage — founder elects which gaps enter the build plan, at what stage, with what risk classification. Output: a list of staging-plan amendments + manifest amendments.
- **Phase 4 (45 min):** draft amendments in `/drafts/` for founder review. Session-close at ~3.5-4 hours.

If the gap-finding (Phase 2) produces more than ~10 gap-categories, the session may need to split into ST1 (gap discovery) + ST2 (triage + amendments) per my earlier recommendation.

---

## Sources

Anthropic platform docs + announcements:
- [Making frontier cybersecurity capabilities available (Anthropic)](https://www.anthropic.com/news/claude-code-security)
- [Automate security reviews with Claude Code (Anthropic)](https://www.anthropic.com/news/automate-security-reviews-with-claude-code)
- [anthropics/claude-code-security-review (GitHub Action)](https://github.com/anthropics/claude-code-security-review)
- [Enabling Claude Code to work more autonomously (Anthropic)](https://www.anthropic.com/news/enabling-claude-code-to-work-more-autonomously)
- [Create custom subagents (Claude Code Docs)](https://docs.claude.com/en/docs/claude-code/sub-agents)
- [Subagents in the SDK (Claude Docs)](https://docs.claude.com/en/docs/agent-sdk/subagents)
- [Building agents with the Claude Agent SDK (Anthropic Engineering)](https://www.anthropic.com/engineering/building-agents-with-the-claude-agent-sdk)
- [Scaling Managed Agents: Decoupling the brain from the body (Anthropic Engineering)](https://www.anthropic.com/engineering/managed-agents)
- [Agent SDK overview (Anthropic Docs)](https://docs.anthropic.com/en/docs/claude-code/sdk)
- [Introducing Agent Skills (Anthropic)](https://www.anthropic.com/news/skills)
- [Equipping agents for the real world with Agent Skills (Anthropic Engineering)](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills)
- [anthropics/skills (Skills marketplace repository)](https://github.com/anthropics/skills)
- [anthropics/claude-plugins-official (Anthropic-managed plugin directory)](https://github.com/anthropics/claude-plugins-official)
- [Customize Claude Code with plugins (Anthropic)](https://www.anthropic.com/news/claude-code-plugins)
- [Memory tool (Anthropic Docs)](https://docs.claude.com/en/docs/agents-and-tools/tool-use/memory-tool)
- [Managing context on the Claude Developer Platform (Anthropic)](https://www.anthropic.com/news/context-management)
- [Code execution with MCP (Anthropic Engineering)](https://www.anthropic.com/engineering/code-execution-with-mcp)
- [Connectors / MCP (Anthropic)](https://www.anthropic.com/partners/mcp)
- [Official MCP Registry](https://registry.modelcontextprotocol.io/)
- [Best practices for Claude Code (Anthropic Engineering)](https://www.anthropic.com/engineering/claude-code-best-practices)
- [Claude Code Action (Official PR review GitHub Action)](https://github.com/anthropics/claude-code-action)
- [How Claude remembers your project — CLAUDE.md (Claude Code Docs)](https://docs.anthropic.com/en/docs/claude-code/memory)
- [Apple's Xcode now supports the Claude Agent SDK](https://www.anthropic.com/news/apple-xcode-claude-agent-sdk)
- [Introducing Claude Opus 4.6](https://www.anthropic.com/news/claude-opus-4-6)
- [Effective context engineering for AI agents (Anthropic Engineering)](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)
- [Claude Code auto mode: a safer way to skip permissions](https://www.anthropic.com/engineering/claude-code-auto-mode)

---

*End of survey. This document is a research artefact. It does not modify the build plan unless the founder elects to incorporate findings at the stress-test session.*
