# Next-Session Prompt v2 — Build-Plan Stress-Test (Governance / Elevated risk)

**Stream:** founder.
**Tier:** governance — primary work is decision-making + draft amendments. **NOT a code-critical session.** Risk classification at session level: Elevated (proposed amendments to staging plan + manifest are Elevated per the standing cache's risk table; the amendments themselves don't land until the founder explicitly adopts them).
**Governing frame:** /adopted/standing-protocol-cache.md + /adopted/build-sessions-protocol-cache.md.
**Predecessor close:** /operations/handoffs/founder/2026-05-10-full-day-close.md (the authoritative full-day session-end record; supersedes the A4-specific close for cross-cutting context).
**Predecessor decision-log entries:** D-A4-KEY-MANAGEMENT-WIRED-VERIFIED-2026-05-10, D-A3-LAYER2-SIGNING-WIRED-VERIFIED-2026-05-10, D-A3-LAYER2-SIGNING-ADR-ADOPTED-2026-05-10, D-STAGING-PLAN-ADOPTED-2026-05-10.
**Session type:** stress-test of the adopted staging plan against (a) security best practices; (b) Anthropic platform capabilities (including features released May 2026); (c) the founder's independently-sourced research (23 inbox files dated 2026-05-08 to 2026-05-12); (d) other domains an experienced founder would surface (regulatory, accessibility, privacy-by-design, observability, legal, insurance, marketplace economics, onboarding UX).
**Supersedes:** /operations/handoffs/founder/2026-05-10-build-plan-stress-test-NEXT-SESSION-PROMPT.md (v1; progressively amended across 2026-05-10; this v2 consolidates everything plus the latest three inbox files).

---

## Founder governing note (still in force for the duration of the build arc)

Per `/adopted/build-sessions-protocol-cache.md` §"Founder governing notes for the duration of the build arc": **No current users (affirmed 2026-05-10).** The substrate's exposure remains founder-only + test logins until a plugin ships. This means the stress-test can land amendments at Elevated risk without triggering the no-current-users-CCP-step-3 simplification reversal.

---

## Foundational positioning and ethos (governs every output of this session)

Four principles sharpened across 2026-05-10 are bound into this session's deliberation explicitly:

**1. Positioning foundation — SageReasoning is a Judgment + Continuity primitive ("Character Kernel") for production agent systems.** Per the inbox material "peers we have.txt" + "control layer for production agents.rtf": the substrate sits at the intersection of judgment (Layer 2 deterministic mechanism application; cryptographic signing; R20a perimeter) and continuity (decision log; standing-protocol-cache; mentor-profile context). Candidate category labels: "Normative Cognitive Middleware"; "Judgment Continuity Layer"; "Virtue Middleware"; "Assent Engine"; **"Character Kernel"** (source's favorite — captures "the layer that preserves who the agent is while reasoning"); "Practical Wisdom Layer / Phronesis Layer." Primary peer group per the source: ANCHOR; ResontoLogic/ARH (cognitive middleware / governed reasoning layers). Adjacent categories: constitutional/normative reasoning (Anthropic, SentientROUTER, SPQR/Aegis, TML); runtime governance kernels (VIGIL, ASK, Zylos); guardrail/judge layers (Guardrails AI, Patronus, Lakera, LLM-as-Judge); memory/continuity layers (MemGPT, LangGraph, Letta). **SageReasoning is unique in combining normative philosophy (Stoicism) + judgment-as-process (synkatathesis/assent) + continuity of character over time + production middleware.** Most peers do only 1-2 of these. The substrate is NOT orchestration (Cowork/OpenClaw own that); NOT coordination (Thrum/queues own that); NOT a generic LLM wrapper. Phase 3 triage explicitly elects a category label.

**2. The Judge Layer framework — four-outcome decision framing.** Per Nate B. Jones's "The Judge Layer Is The Product" article (2026-05-08) + the companion OpenBrain Judge Extender spec: production agent judgment converges on a four-outcome decision framework (**ALLOW / BLOCK / REVISE / ESCALATE**) with structured action proposals as input. This maps directly to SageReasoning's existing prescriptive/evaluative implementation system — refines it rather than replaces it. Prescriptive ≈ REVISE + ESCALATE; evaluative ≈ ALLOW + BLOCK. REVISE adds "directionally correct; needs specific change"; ESCALATE adds "ambiguous; route to human." Both match existing Stoic counsel patterns. **For this session: every Phase 3 triage decision is framed as ALLOW / REVISE / BLOCK / ESCALATE rather than Adopt / Defer / Reject — dogfoods the framework structurally.**

**3. Stoic-tools-for-Stoic-products — substrate-as-judge dogfooding.** SageReasoning uses its own products for operational intelligence (project instructions §My Role). For this session, dogfooding focus is **implementing the substrate as judge of build decisions, not Mentor consultation** (founder handles Mentor consultation separately). Today's substrate maturity allows partial dogfooding: Layer 2's mechanisms (passion diagnosis; control filter; oikeiosis; value assessment; kathekon assessment) can score build decisions via `/api/reason`; the four-outcome framework applies structurally. As the build matures (A5 → A7 → Stage 3 D-mechanisms), dogfooding deepens. The session's measure of "is our system reliable for an agent to consume?" is "can we ourselves rely on it to judge our own work?"

**4. Dogfood discipline applied to operational artefacts.** Every output produced in this session (Phase 2 gap analyses; Phase 3 triage decisions; Phase 4 draft amendments; Phase 5 session close) must itself be testable as a "judgment + continuity primitive" — clear, well-formed, versioned, signed (by decision-log entry), provenance-labelled (observed / inferred / user_confirmed / generated per OpenBrain Judge Extender), and consumable by future sessions. The session close is the first dogfood test of every amendment adopted.

---

## Standing requirements the AI states at session-open

Six commitments the founder has codified across 2026-05-10 in response to specific gaps observed. The AI states these aloud at session-open as part of the session-opening checklist; they are candidates for permanent inclusion in the project instructions / manifest at the end of the session.

**1. Authoritative-current-sources rule.** The AI consults the following at session-open before recommending any approach:
- (a) Anthropic developer documentation (https://docs.anthropic.com; https://docs.claude.com; https://platform.claude.com/docs; https://anthropic.com/news; https://anthropic.com/engineering)
- (b) Sources the founder has subscribed to (currently Nate B. Jones's Substack at https://natesnewsletter.substack.com and the linked promptkit pages at promptkit.natebjones.com)
- (c) The `/inbox/` folder for files dated since last session
- (d) Industry release-aggregators (e.g., https://releasebot.io/updates/anthropic)
The AI scans `/inbox/` automatically; reads files (or delegates) before substantive work begins.

**1a. Negative-finding discipline** (added 2026-05-10 after AI missed Anthropic's Dreams feature). When a search returns no results for a feature the founder mentions or that prior context suggests should exist, the AI MUST presume the search was inadequate before concluding the feature doesn't exist: (i) try at least three queries with different keywords; (ii) try official documentation URL patterns; (iii) try industry news venues without domain restriction; (iv) state "I couldn't find this with the queries I tried; the feature may still exist" rather than "I cannot find this feature in the documentation." Overconfident negative findings are a higher failure mode than transparent uncertainty.

**2. Consider-implications five-question assessment.** After any web-search or document-read produces material findings, the AI states explicitly:
1. Does this contradict any prior decision?
2. Does this refine or improve any prior decision?
3. Does this affect work currently in flight?
4. Does this affect work planned in future stages?
5. Does this affect operational discipline (caches; runbooks; session-open protocol)?
Even "no impact" is stated explicitly. The founder may overrule.

**3. Proactive surfacing of ten domains.** The AI raises the following at session-open and during Phase 2 gap-finding without waiting:
- Security (OWASP Agentic Top 10; NIST AI RMF; relevant industry incidents)
- Regulatory + compliance (GDPR; CCPA; AI Act; Australia AI policies; sectoral rules)
- Accessibility (WCAG 2.1 AA; EAA 2025)
- Privacy by design
- Observability + SRE
- Legal entity + tax structure
- Insurance
- Marketplace economics + dispute resolution
- Onboarding UX
- Anthropic-native capabilities
For each: "considered: X, Y, Z" or "not material because [reason]." The founder may overrule.

**4. Bias toward existing Anthropic infrastructure.** Before recommending bespoke build work, the AI explicitly evaluates whether existing infrastructure (Claude Code commands; sub-agents; skills; managed agents; MCP servers; SDK patterns; Plugin spec; Dreams; Outcomes; Multi-agent orchestration) would deliver the same outcome with less custom work. Existing infrastructure = default; bespoke = alternative requiring justification.

**5. Positioning + dogfood lens at every Phase 2 gap and every Phase 3 triage.** For each recommendation, the AI flags positioning impact (strengthens / weakens / neutral for "Character Kernel / Judgment + Continuity primitive" positioning) and dogfood relevance (whether substrate consultation via `/api/reason` Layer 2 mechanisms could validate the recommendation).

---

## On Anthropic's features at May 2026 (current state)

The AI's training cutoff is May 2025. The following features have been verified at May 2026:

**Memory features (three distinct):**
- **Claude.ai memory toggle** (Settings → Capabilities) — managed service for chat history. Founder's setting: OFF. Recommendation: keep OFF for the build; manual handoff + cache discipline is more structured.
- **Memory tool API** (developer feature; requires beta header `context-management-2025-06-27`) — programmatic `/memories` directory; 39% performance improvement with context editing. Candidate to replace some Supabase persistence.
- **Managed Agents Memory Stores** — structured memory stores; what Dreams operates on.

**The three Code-with-Claude-2026 features (announced 2026-05-06; in Managed Agents):**
- **Dreams** (research preview; https://platform.claude.com/docs/en/managed-agents/dreams) — async memory consolidation; reads memory store + up to 100 sessions; produces new reorganised store; founder reviews before adopting. Beta header `dreaming-2026-04-21`. Harvey saw 6x task completion increase.
- **Outcomes** (public beta) — rubric + separate grader agent (own context window; not influenced by actor's reasoning); +10 points task success; +10.1% PowerPoint; +8.4% Word. **Addresses the "hallucinated audit trail" failure mode** (Opus/GPT report "fixed" on corrections they didn't run).
- **Multi-agent orchestration** (public beta) — lead agent delegates to specialists with own models/prompts/tools; parallel work on shared filesystem; persistent events; Netflix using at scale.

**Other relevant features:**
- `/security-review` slash command + `anthropics/claude-code-security-review` GitHub Action — reasoning-based; catches data-flow vulnerabilities standard SAST misses (would have caught McKinsey/Lilli JSON-key SQL injection)
- Sub-Agents + Agent Teams + Hooks — production; parallel work; isolated context; hooks for pre-commit/post-test
- Claude Agent SDK (renamed from Claude Code SDK) — Python + TypeScript primitives
- Agent Skills marketplace (anthropics/skills) — distribution path beyond Cowork
- MCP (Model Context Protocol) — official registry at registry.modelcontextprotocol.io; standard for tool exposure
- Claude Code Plugins — slash commands + subagents + MCP + hooks composition
- CLAUDE.md special handling — Claude Code keeps it in context; can edit
- Models: Claude Opus 4.7 + Claude Sonnet 4.6 (current); note tokenizer tax 1.29-1.47x and adaptive-thinking burn per Opus 4.7 review

---

## The "claude on track" routine + hooks (5-MCP pattern; inbox 2026-05-12)

A pattern surfaced in `/inbox/claude on track.txt` that addresses the recurring concern "AI appears to understand but moves on." The pattern: **the model is the orchestrator; the MCP servers and the hooks are the system.** Five MCP servers loaded before any non-trivial coding:

1. **Memory MCP** — carries context across sessions. (Analogous to Dreams + Memory tool API; we have a manual version via cache + decision log.)
2. **Codebase-memory MCP** — knowledge graph of repo (functions, callers, dependencies, cycles); one tool call replaces dozens of file reads. **We do not have this.** Recommended adoption: before Stage 2 K-category migration broadens the codebase surface.
3. **Tavily web search MCP** — current-practice queries. (We've codified the rule; we don't yet have the MCP.)
4. **Context7 library docs MCP** — fetches current docs for whatever library is being touched. **We do not have this.** Recommended: high value because Anthropic SDK + Next.js + Prisma docs all evolve faster than the training cutoff allows.
5. **Then write code.**

Plus hooks:
- **Read-before-edit guard** — refuses any edit on a file the session hasn't read. Costs extra tokens up front; saves orders of magnitude on clean-up of blind edits.
- **Safety guard** — blocks destructive commands.
- **Re-index hook** — triggers after edits so the codebase-memory graph stays in sync.

The author reports "saved me hundreds of hours."

**This is candidate for project-instruction-level adoption at Phase 3 triage** — the standing requirements above are weaker without this infrastructure paired with them. Phase 2.5 will deep-dive whether this routine should be adopted, partially adopted, or deferred.

---

## On the vibe-coding architectural debugging problem (inbox 2026-05-12 + web research)

The Reddit-linked article was inaccessible without provenance; the topic was researched via web search. Documented findings:

- **"fix-one-break-ten" cycle** is the named failure mode of vibe coding
- **45% of AI-generated code has security vulnerabilities** (per multiple May 2026 sources)
- **Context window collapse** — AI that built a codebase cannot reliably refactor it once codebase exceeds effective context window
- **Architectural drift** — AI-generated code becomes internally inconsistent over time

**The agentic-engineering antidote (Karpathy, early 2026):** Plan → Execute → Verify (PEV) loop with structured human oversight. Cursor's "minimal disruption" pattern (isolate failing component; swap only what failed; preserve surrounding architecture). Windsurf's "diagnostic certainty" pattern (aggressively inspect failure states; isolate schema mismatches; test endpoints programmatically before concluding work).

**For SageReasoning specifically:** the founder is exactly the audience this problem targets — a non-coder running a complex build via AI. Current build plan has PR1 (single-endpoint proof) and Critical Change Protocol as partial PEV. Making PEV explicit as a process rule + adopting diagnostic-certainty patterns for verification + adopting codebase-memory MCP together address the architectural debugging gap. **Important to land before Stage 2 K-category migration scales the codebase surface.** Candidate for Phase 3 triage.

---

## Three structural amendment candidates from the Judge Layer framework

Surfaced at the 2026-05-10 session; carried forward for Phase 3 triage:

- **A. Layer 2 output shape evolves to `Layer2Decision`** with the four-outcome framework (ALLOW / BLOCK / REVISE / ESCALATE) plus criteria_evaluated (authorization / evidence / exposure_risk / policy / sensitivity / reversibility / quality) plus reasoning_summary plus revised_action_constraints (if REVISE) plus escalation_owner (if ESCALATE). Critical risk.
- **B. Decision log entries gain provenance labels + use policies** per OpenBrain Judge Extender. Provenance: observed/inferred/user_confirmed/imported/generated/superseded/disputed. Use policy: can_use_as_instruction/can_use_as_evidence/requires_confirmation/do_not_inject_automatically. Standing-cache distinguishes instruction-grade from evidence-grade entries. Standard risk (governance amendment).
- **C. Layer 1 extended to optionally produce Action Proposal Envelope** (intended_action / authorization / evidence / expected_consequence / sensitivity / rollback) when consumed by an actor agent. Makes substrate directly consumable by production agent runtimes using this contract. Elevated risk.

---

## Why this session matters

The build plan was adopted under `D-STAGING-PLAN-ADOPTED-2026-05-10` and ~8 sessions of Stage 1 work have completed since. The founder has correctly identified that the brainstorming missed several domains:
- Security implications (surfaced after McKinsey/Lilli)
- Regulatory-audit readiness
- Anthropic-native platform capabilities (including features released May 2026)
- Build-plan positioning + naming (Character Kernel framing)
- Architectural-debugging gap for a non-coder founder (PEV + diagnostic certainty)
- Operational AI discipline (5-MCP routine + hooks)
- Categories an experienced founder would have raised proactively

The build plan is at ~15-20% complete by work-units. **This is the optimal moment to stress-test** — before Stage 2 (the largest stage) compounds decisions, and before Stage 3 (plugin internals) commits architecture that depends on Stage 1's foundations.

The session does NOT redo the brainstorming. It stress-tests the existing plan against the gaps identified since the plan was adopted.

**Three categories of amendments may emerge:**
1. **Additions** to the build plan (new items in existing or new stages)
2. **Re-scopes** of existing items (e.g., Stage 3 C1-C7 → Plugin spec; substrate hosting → Managed Agents)
3. **Project-instruction / manifest amendments** (the six standing requirements; PR10 PEV; positioning principles; substrate category label; 5-MCP routine adoption)

Founder retains sole-signatory authority. No amendment lands without explicit founder adoption.

---

## Pre-conditions

1. The session-close commit from the 2026-05-10 full-day work is on origin/main.
2. Production in steady state: A4 Verified; all four `SUBSTRATE_LAYER2_PREVIOUS_*` env vars UNSET; `/api/public-key` returns `previous: null` + `rotation_overlap_until: null` with `key_id=substrate-layer2-2026Q2`.
3. Founder has reviewed the four prep documents (or accepts AI summary at Phase 1):
   - `/drafts/security-audit-build-plan-vs-agentic-security-strategies-2026-05-10.md`
   - `/drafts/anthropic-features-survey-2026-05-10.md` (with correction notice)
   - `/drafts/inbox-research-synthesis-2026-05-10.md`
   - This prompt end-to-end
4. Founder may have added more files to `/inbox/` (AI scans automatically per Standing Requirement 1).
5. Founder is open to either one-session stress-test (~5-6 hours; ambitious) or ST1/ST2 split (~3 hours + ~3-4 hours; recommended).

---

## Part A — Open under the protocol

Read in order:

1. `/adopted/standing-protocol-cache.md` (~3 min)
2. `/adopted/build-sessions-protocol-cache.md` (~3 min)
3. `/operations/handoffs/founder/2026-05-10-full-day-close.md` (~15 min — the authoritative full-day record)
4. The four prep documents in order (~50-70 min total):
   - `/drafts/security-audit-build-plan-vs-agentic-security-strategies-2026-05-10.md` (~25 min)
   - `/drafts/anthropic-features-survey-2026-05-10.md` (~15-20 min; note correction notice)
   - `/drafts/inbox-research-synthesis-2026-05-10.md` (~10-15 min)
   - This prompt end-to-end (you're reading it; ~15 min)
5. **Scan `/inbox/` for any files dated since 2026-05-10** (per Standing Requirement 1). Read or delegate.
6. `/adopted/substrate-plugin-staging-plan.md` (~15 min — re-read with gaps now in mind)
7. `/manifest.md` Process Rules section (~10 min — identify candidate new rules)
8. Optional founder pre-reads: any independently-sourced best-practice materials.

Confirm at session-open: tier (governance / Elevated); all six Standing Requirements (1, 1a, 2, 3, 4, 5) stated aloud; founder's appetite for one-session vs ST1/ST2 split; whether any prep document needs clarification before Phase 1.

---

## Part B — Procedure (six phases)

### Phase 1 — Inventory + framing (~25 min)

1. Founder shares (or hands paths to) any best-practice materials sourced independently.
2. AI summarises the four prep documents in 5-7 sentences each.
3. Agreement on the universe of domains to stress-test against. Default list per Standing Requirement 3; founder may add or remove.
4. Decision: one-session (~5-6 hours target) OR ST1/ST2 split (recommended). If domain list exceeds 10 or founder anticipates fatigue, default to split.

### Phase 1.5 — Action Surface Audit on SageReasoning (~20-25 min — first dogfood test)

Per Prompt 1 of the 2026-05-08 inbox "Judge Layer Is The Product Prompt Kit" — applied to SageReasoning itself.

Tiers per the framework:
- **Tier 1 — Read-only:** retrieve, summarise, classify, inspect, draft, compare, explain
- **Tier 2 — Reversible writes:** internal notes, drafts, local files, decision-log entries, standing-cache amendments
- **Tier 3 — External side effects:** calls to `/api/reason`; signed Layer2Assessment delivery; public-key endpoint serving; Vercel deploys
- **Tier 4 — High-risk:** Vercel env-var changes for cryptographic keys; mentor-profile deletion; rotation procedures

For each action: boundary crossed; who is affected if wrong; current judge placement (or gap); whether human review is in the path. Output: a prioritised list of action boundaries where judge layers are missing. Feeds Phase 2 as fixed input.

### Phase 2 — Domain-by-domain gap-finding (~60-90 min)

For each domain (Security; Regulatory; Accessibility; Privacy-by-design; Observability; Legal/tax; Insurance; Marketplace economics; Onboarding UX; Anthropic-native — plus any added at Phase 1):

- What's currently in the build plan addressing this domain (cite specific items: A1-A9; K1-K8; B1-B5; C1-C7; D1-D5; E1-E4; F1-F5; J1-J8; R0-R20; AC1-AC8; KG1-KG7; PR1-PR9)
- What's missing (specific named gaps)
- What the gap could cause (concrete failure mode, not abstract risk)
- Recommended addition / re-scope / amendment with proposed stage placement and risk classification
- **Positioning impact** — does closing this gap strengthen / weaken / neutral for "Character Kernel / Judgment + Continuity primitive" positioning?
- **Five-failure-modes diagnostic** — does the gap relate to correlated judgment / specification gaming / escalation drift / latency-cost / policy drift?
- **Dogfood relevance** — substrate-consultable via `/api/reason`?

Target ~5-15 min per domain. AI must NOT propose more than 3-4 amendments per domain; if larger, the domain becomes its own sub-session.

### Phase 2.5 — Anthropic-features + Judge Layer + 5-MCP routine deep-dive (~45-60 min)

For each candidate, produce a 5-point analysis: (1) what it does specifically (with docs reference); (2) which specific build problem it could solve; (3) which existing work it could improve; (4) where would it be wrong to apply; (5) what additional information is needed.

The 16 candidates for deep-dive (founder may de-scope to fit time):
- `/security-review` slash command + GitHub Action
- Sub-Agents + Agent Teams + Hooks
- Agent SDK
- Managed Agents (hosted REST API)
- **Dreams** (memory consolidation; research preview)
- **Outcomes** (rubric + separate grader; public beta; addresses hallucinated-audit-trail)
- **Multi-agent orchestration** (specialist agents; public beta; maps to Stage 3 D-mechanisms)
- Agent Skills marketplace (anthropics/skills)
- Memory tool API
- MCP + Plugin spec
- Claude Code Plugins
- CLAUDE.md special handling
- Opus 4.7 + Sonnet 4.6
- **OpenBrain Judge Extender contract** (action proposal + recall + decision + provenance + use policies)
- **5-MCP + hooks routine** (codebase-memory MCP; Context7; Tavily; read-before-edit hook; safety hook; re-index hook)
- **PEV loop + diagnostic-certainty patterns** (Cursor's minimal disruption; Windsurf's diagnostic certainty; Karpathy's agentic engineering)

Target ~3-4 min per candidate.

### Phase 3 — Triage in four-outcome framework + substrate-as-judge dogfooding (~60-90 min)

Founder reads Phase 2 + Phase 2.5 output and elects per recommendation using the four-outcome framework:
- **ALLOW** (adopt as-is) — enters the build plan as proposed
- **REVISE** — directionally correct but needs a specific change; AI produces revised version
- **BLOCK** (reject) — explicitly rejected with reasoning
- **ESCALATE** (defer) — logged in backlog with revisit condition

The AI does not advocate. Surfaces trade-offs and risks. Triage runs item by item. The AI maintains a triage decision-log in chat using four-outcome vocabulary.

**Substrate-as-judge dogfooding.** For recommendations the AI flags as Stoic-mechanism-relevant (impressions, judgments, value categories at stake, passion patterns, oikeiosis circles, control filter outcomes), the founder may invoke `/api/reason` with the decision framed as input. The Layer2Assessment outputs inform but do not replace the triage decision. AI flags which recommendations are candidates; founder elects.

Specific candidates already surfaced for triage (from 2026-05-10 work; not exhaustive):
- **Substrate category label** — Character Kernel / Judgment Continuity Layer / Normative Cognitive Middleware / Practical Wisdom Layer / Assent Engine / Virtue Middleware
- **Three Judge Layer structural amendments** — Layer 2 → Layer2Decision; decision-log provenance + use policies; Layer 1 Action Proposal Envelope
- **5-MCP routine adoption** — codebase-memory MCP; Context7; Tavily; read-before-edit hook; safety hook; re-index hook
- **PEV loop as PR10** — Plan → Execute → Verify; structured human oversight
- **Substrate hosting decision** — Vercel+Supabase vs Managed Agents (with Dreams + Outcomes + Multi-agent orchestration as platform features)
- **Stage 3 plugin re-scope** — bespoke C1-C7 → Claude Code Plugin spec + MCP
- **Per-agent credentials + revocation + agent/human identity distinction** (security audit R1, R2)
- **OWASP Agentic Top 10 + NIST AI RMF + GDPR readiness** (security audit + regulatory)
- **`/security-review` GitHub Action adoption**
- **Outcomes feature for verification** (replaces some R6 manual red-team)
- **CLAUDE.md special handling** (potentially simplifies standing-cache pattern)
- Plus all Phase 2 gap-finding recommendations

### Phase 4 — Draft amendments (~30-45 min)

For each ALLOW-or-REVISE recommendation:
- Staging-plan amendments drafted as text inserted at named stage
- Manifest amendments drafted (new PR rules, R-codes, AC items)
- Project-instruction amendments drafted at `/drafts/proposed-project-instruction-amendment-stress-test-2026-05-XX.md`

Amendments stay in `/drafts/` until founder explicitly moves to `/adopted/`. Session does not modify live manifest or staging plan.

### Phase 5 — Session close (~25-30 min)

Full form per Critical-tier template (justified by amendment scope). Save to `/operations/handoffs/founder/2026-05-XX-build-plan-stress-test-close.md`. Decision-log entry: `D-STRESS-TEST-STAGING-PLAN-AMENDMENTS-2026-05-XX`.

**Dogfood discipline check on the close itself** — does it pass the four-outcome judgment test? Does its memory carry appropriate provenance? Where it doesn't, that's a signal the discipline needs refinement before adoption.

---

## Part C — Anticipated session shape

| Phase | Estimate (one-session) | ST1 estimate | ST2 estimate |
|---|---|---|---|
| Cache + predecessor close + 4 prep documents | 50-70 min | 50-70 min | 20 min (re-read context) |
| Inbox scan + subscribed-source check | 10-15 min | 10-15 min | 5 min |
| Phase 1 — inventory + framing | 25 min | 25 min | 10 min |
| Phase 1.5 — Action Surface Audit | 20-25 min | 20-25 min | n/a |
| Phase 2 — gap-finding with five-failure-modes | 60-90 min | 90-120 min (more depth) | n/a |
| Phase 2.5 — 16-candidate deep-dive | 45-60 min | 45-60 min | n/a |
| Phase 3 — four-outcome triage + substrate-as-judge | 60-90 min | n/a | 90-120 min |
| Phase 4 — draft amendments | 30-45 min | n/a | 60-90 min |
| Phase 5 — session close with dogfood check | 25-30 min | 20-25 min | 30-40 min |
| **Total** | **~5-6 hours** | **~3.5-4 hours** | **~3.5-4 hours** |

**ST1/ST2 split is the default recommendation.** ST1 closes after Phase 2 (a clean natural break point); ST2 resumes with Phase 2.5 + Phase 3 + Phase 4 + Phase 5. The split gives the founder a sleep cycle between research/gap-finding and triage/amendments, which matters because (i) the Phase 3 triage benefits from rested judgment, (ii) the Mentor consultation (which the founder is handling separately) can land between sessions.

**Documented stable close points:**
- After Phase 1: framing complete; resume Phase 1.5 next session
- After Phase 1.5: dogfood-1 complete; resume Phase 2 next session
- After Phase 2 (natural ST1/ST2 split): gap-finding complete; resume Phase 2.5 next session
- After Phase 2.5: deep-dive complete; resume Phase 3 next session
- After Phase 3: triage complete; resume Phase 4 next session
- After Phase 4: amendments drafted; resume Phase 5 next session

---

## Rollback path

Session-level rollback complexity is minimal because the session produces drafts; nothing lands in `/adopted/` or the manifest without explicit founder move-to-adopted operations between sessions. If founder reads Phase 4 amendments and disagrees, amendments stay in `/drafts/` indefinitely or are deleted.

The only rollback-relevant scenario: founder elects an amendment during Phase 3; AI drafts it during Phase 4; between sessions founder changes mind. Solution: founder simply does not perform `/drafts/` to `/adopted/` move; amendment never lands.

---

## Forecast

**Most-likely path (ST1/ST2 split):** ST1 covers Part A + Phase 1 + Phase 1.5 + Phase 2 at ~3.5-4 hours; closes with gap analysis complete + Action Surface Audit complete. Founder reflects + (separately) consults Mentor. ST2 covers Phase 2.5 + Phase 3 + Phase 4 + Phase 5 at ~3.5-4 hours; closes with ~15-20 drafted amendments; triage decision-log; clear adoption checklist.

**Possible variations:**
- **Phase 2 surfaces > 15 substantial gaps** → multi-session split.
- **Founder elects one-session** despite recommendation → must reserve 5-6 uninterrupted hours.
- **Mid-Phase-3 the founder elects to apply substrate consultation to a triage decision** → adds ~5-10 min per consulted decision.
- **A specific recommendation reveals it requires its own ADR** (e.g., the Plugin spec re-scope of Stage 3) → amendment becomes "draft new ADR in dedicated session."
- **Regulatory domain reveals lawyer-engagement need** → flag for lawyer-engagement track (already critical-path at Stage 3); defer.

**What success looks like at session close:**
- Triage decisions on every Phase 2 + Phase 2.5 recommendation in four-outcome vocabulary
- ~15-20 drafted amendments in `/drafts/`
- Adoption checklist for moving amendments to `/adopted/` between sessions
- Six standing commitments confirmed and proposed for permanent inclusion
- Foundational positioning + Stoic-tools-for-Stoic-products ethos bound into specific session disciplines
- Substrate category label elected (Character Kernel / Judgment Continuity Layer / etc.)
- Three Judge Layer structural amendments triaged
- 5-MCP routine + hooks triaged
- PEV loop triaged
- Substrate hosting decision triaged
- Stage 3 plugin re-scope triaged
- Decision-log entry full form: `D-STRESS-TEST-STAGING-PLAN-AMENDMENTS-2026-05-XX`
- Session close full form passes dogfood discipline check
- Next-session prompt drafted for A5 — under the amended plan
- Production state unchanged (no code touched this session)

After the stress-test reaches Verified, the build arc resumes with **A5 — Layer 3 server-side service** under the amended build plan + amended manifest + amended project instructions.

---

## Source materials reference

Prep documents (in `/drafts/`):
- `/drafts/security-audit-build-plan-vs-agentic-security-strategies-2026-05-10.md`
- `/drafts/anthropic-features-survey-2026-05-10.md` (with correction notice)
- `/drafts/inbox-research-synthesis-2026-05-10.md`

Source files in `/inbox/` (dated 2026-05-08 to 2026-05-12):
- 10 promptkit `.md` files (Nate B. Jones operationalisation tools)
- 8 RTF articles (271 bugs found in Firefox; The next AI platform winner; ai agents are about to route around; ai wiki; anticipation gap; automation strategy blindspot; buying rule; claude design)
- 2 RTFD bundles (agent plumbing; opus 4-7)
- Judge Layer trio (control layer for production agents.rtf + 20260508-246-promptkit-1.md + 20260508-246-guide-main.md)
- Today's trio (claude on track.txt + peers we have.txt + vibe coding debugging problem link.txt)

Authoritative project documents:
- `/adopted/substrate-plugin-staging-plan.md` (the stress-test subject)
- `/manifest.md` (R-rules, AC-rules, KG-rules, PR-rules — candidates for amendment)
- `/adopted/standing-protocol-cache.md`
- `/adopted/build-sessions-protocol-cache.md`
- `/operations/handoffs/founder/2026-05-10-full-day-close.md` (the predecessor)

Previously-drafted A5 prompt (deferred until stress-test produces amended plan):
- `/operations/handoffs/founder/2026-05-10-stage-1-a5-layer-3-service-NEXT-SESSION-PROMPT.md`

End of prompt v2.
