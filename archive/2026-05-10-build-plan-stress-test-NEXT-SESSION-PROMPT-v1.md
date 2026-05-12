# Next-Session Prompt — Build-Plan Stress-Test (Governance / Elevated risk)

**Stream:** founder.
**Tier:** governance — primary work is decision-making + draft amendments. **NOT a code-critical session.** Risk classification at session level: Elevated (proposed amendments to staging plan + manifest are Elevated per the standing cache's risk table; the amendments themselves don't land until the founder explicitly adopts them).
**Governing frame:** /adopted/standing-protocol-cache.md + /adopted/build-sessions-protocol-cache.md.
**Session type:** stress-test of the adopted staging plan against (a) security best practices, (b) Anthropic platform capabilities, (c) the founder's independently-sourced research, (d) other domains an experienced founder would surface (regulatory, accessibility, privacy-by-design, observability, legal, insurance, marketplace economics, onboarding UX).
**Predecessor session close:** /operations/handoffs/founder/2026-05-10-stage-1-a4-key-management-close.md
**Predecessor decision-log entries:** D-A4-KEY-MANAGEMENT-WIRED-VERIFIED-2026-05-10, D-A3-LAYER2-SIGNING-WIRED-VERIFIED-2026-05-10, D-A3-LAYER2-SIGNING-ADR-ADOPTED-2026-05-10, D-STAGING-PLAN-ADOPTED-2026-05-10.

---

## Founder governing note (still in force for the duration of the build arc)

Per `/adopted/build-sessions-protocol-cache.md` §"Founder governing notes for the duration of the build arc": **No current users (affirmed 2026-05-10).** The substrate's exposure remains founder-only + test logins until a plugin ships. This means the stress-test can land amendments at Elevated risk without triggering the no-current-users-CCP-step-3 simplification reversal.

---

## Foundational positioning and ethos (governs every output of this session)

Three principles established in the project instructions (§My Role; P0 0h Assessment 1) and sharpened by the 2026-05-08 inbox material on production agent judge layers are bound into this session's deliberation explicitly:

**1. Positioning foundation — SageReasoning is a Judgment + Continuity primitive for production agent systems.** The substrate sits at the intersection of judgment (Layer 2 deterministic mechanism application; cryptographic signing; R20a perimeter) and continuity (decision log; standing-protocol-cache; mentor-profile context). It is NOT orchestration (Cowork/OpenClaw/Gas Town own that). It is NOT coordination (Thrum/queues/handoffs own that). It is NOT a generic LLM wrapper. Per the production-agent stack separation surfaced in 2026-05-08 inbox material: orchestration ≠ coordination ≠ judgment ≠ continuity ≠ human review. SageReasoning is the judgment + continuity primitive specialised for Stoic reasoning. Every decision in this session is evaluated against the question: "Does this preserve, refine, or strengthen the substrate's identity as a producer of reliable judgment + continuity primitives?" Amendments that move SageReasoning toward "philosophy tool" or "general LLM wrapper" positioning are flagged as positioning risk; amendments that strengthen judgment + continuity identity are flagged as positioning gain. The principle is a lens for evaluation, not a filter for exclusion — regulatory, accessibility, and other amendments remain essential even when they don't directly serve the positioning narrative.

**2. The Judge Layer framework as the operational shape of judgment.** Per Nate B. Jones's 2026-05-08 article "The Judge Layer Is The Product" + the companion OpenBrain Judge Extender spec, production agent judgment converges on a four-outcome decision framework (**ALLOW / BLOCK / REVISE / ESCALATE**) with structured action proposals as input. This maps directly to SageReasoning's existing prescriptive/evaluative implementation system — refines it rather than replaces it. Prescriptive ≈ REVISE + ESCALATE outcomes; evaluative ≈ ALLOW + BLOCK outcomes. The four-outcome framing adds REVISE (directionally correct; needs specific change) and ESCALATE (ambiguous; route to human) — both of which Stoic counsel already does (e.g., "the assent is hasty" is REVISE, not BLOCK; "the prospect appears suicidal" is R20a ESCALATE, not autonomous response). For this session: every Phase 3 triage decision is framed as ALLOW / BLOCK / REVISE / ESCALATE rather than as Adopt / Defer / Reject; this is itself a dogfood test of the four-outcome shape.

**3. Stoic-tools-for-Stoic-products ethos — the substrate judges its own build.** SageReasoning uses its own products for operational intelligence (project instructions §My Role). For this session, dogfooding focus is **implementing our system as the judge of build decisions, not Mentor consultation** (founder will handle Mentor consultation separately). Today's substrate maturity allows partial dogfooding: Layer 2's existing mechanisms (passion diagnosis; control filter; oikeiosis; value assessment; kathekon assessment) can score build decisions via `/api/reason`; the four-outcome framework can be applied to triage decisions structurally. As the build matures (A5 Layer 3 → A7 R20a gate → Stage 3 D-mechanisms), dogfooding deepens until the substrate is judging build decisions automatically. The session's measure of "is our system reliable for an agent to consume?" is "can we ourselves rely on it to judge our own work?" — the strongest possible reliability claim.

**4. Dogfood discipline applied to operational artefacts.** Every output produced in this session (the Phase 2 gap analyses, the Phase 3 triage decisions, the Phase 4 draft amendments, the Phase 5 session close) must itself be testable as a "judgment + continuity primitive" — clear, well-formed, versioned, signed (by decision-log entry), provenance-labelled (observed / inferred / user_confirmed / generated; per OpenBrain Judge Extender labels), and consumable by future sessions. The session close is the first dogfood test of every amendment adopted: does the close pass the four-outcome judgment test? Does its memory carry appropriate provenance? Where it doesn't, that's a signal the discipline needs refinement before adoption.

---

## Why this session matters

The build plan was adopted under `D-STAGING-PLAN-ADOPTED-2026-05-10` and ~8 sessions of Stage 1 work have completed since. The founder has correctly identified that the brainstorming sessions that produced the staging plan **missed several domains**: security implications (only surfaced after the McKinsey/Lilli incident raised it); regulatory-audit readiness; Anthropic-native platform capabilities; and other categories an experienced founder/CISO/CTO would have raised proactively.

The build plan is at ~15-20% complete by work-units. **This is the optimal moment to stress-test** — before Stage 2 (the largest stage, K-category migration) begins compounding decisions, and before Stage 3 (plugin internals) commits architecture that depends on Stage 1's foundations.

The session does NOT redo the brainstorming. It stress-tests the existing plan against the gaps identified since the plan was adopted.

**Three categories of amendments may emerge:**
1. **Additions** to the build plan (new items in existing or new stages — e.g., per-agent credentials work)
2. **Re-scopes** of existing items (e.g., Stage 3 C1-C7 plugin work re-scoped to Plugin spec + MCP)
3. **Project-instruction / manifest amendments** that change how future sessions work (e.g., the proposed PR10 Security-by-Default discipline; the proposed Anthropic-capability-awareness rule).

The founder retains sole-signatory authority. The AI surfaces options + risks; the founder elects what enters the build plan and at what stage. No amendment lands without explicit founder adoption.

---

## Pre-conditions

1. The session-close commit from the predecessor session (A4) is on origin/main (run `git log --oneline -3 origin/main` and confirm).
2. Production is in steady state: `/api/public-key` returns `previous: null` + `rotation_overlap_until: null`; all four `SUBSTRATE_LAYER2_PREVIOUS_*` env vars UNSET. (Optional verification curl in the A4 session-close Founder Verification block.)
3. The founder has read the three prep documents:
   - `/drafts/security-audit-build-plan-vs-agentic-security-strategies-2026-05-10.md` (~30 min)
   - `/drafts/anthropic-features-survey-2026-05-10.md` (~20 min)
   - `/drafts/inbox-research-synthesis-2026-05-10.md` (~15 min — links to source files in `/inbox/` for deeper reads if needed)
4. The founder has reviewed any best-practice materials they independently sourced (founder's responsibility; quantity at founder discretion).
5. The founder is open to either a one-session stress-test (~3.5-4 hours) OR a two-session split (ST1 gap discovery + ST2 triage + amendments) if Phase 2 surfaces more than ~10 gap categories.

---

## Standing requirements the AI commits to at session-open

The founder has named five process gaps the AI must close at this session:

1. **The AI must consult authoritative current sources at session-open before recommending any approach.** Authoritative sources include:
   - (a) Anthropic developer documentation (https://docs.anthropic.com; https://docs.claude.com; https://platform.claude.com/docs; https://anthropic.com/news; https://anthropic.com/engineering)
   - (b) Sources the founder has subscribed to or identified as authoritative — currently Nate B. Jones's Substack at https://natesnewsletter.substack.com and the linked promptkit pages at promptkit.natebjones.com
   - (c) The `/inbox/` folder for any files dated since the last session
   - (d) Industry release-aggregators covering Anthropic (e.g., https://releasebot.io/updates/anthropic — a curated timeline of release notes from 120+ sources)
   The AI scans `/inbox/` automatically at every session-open; if files are present that haven't been integrated into prep documents or adopted materials, the AI reads them (or delegates the reading) and surfaces findings before substantive work begins. The AI may NOT assume its training-data knowledge of Anthropic features or industry best practice is current.

   **1a. Negative-finding discipline (added 2026-05-10 after I missed Anthropic's Dreams feature in my initial research):** when a search returns no results for a feature the founder mentions or that prior context suggests should exist, the AI MUST presume the search was inadequate before concluding the feature doesn't exist. Specifically: (i) try at least three queries with different keyword combinations; (ii) try the official documentation URL pattern (e.g., `https://platform.claude.com/docs/en/managed-agents/<name>`); (iii) try industry news venues without domain restriction; (iv) explicitly state to the founder "I couldn't find this with the queries I tried; the feature may still exist" rather than "I cannot find this feature in the documentation." Overconfident negative findings are a higher failure mode than transparent uncertainty.

2. **After any web-search or document-read produces material findings, the AI must explicitly assess at least these five questions, in this order, before proceeding:**
   1. **Does this contradict any prior decision** in the build plan, manifest, or adopted documents? (Surface contradictions; flag for triage.)
   2. **Does this refine or improve any prior decision?** (Surface refinements as opportunities.)
   3. **Does this affect work currently in flight in this session?** (Flag re-work risk before proceeding.)
   4. **Does this affect work planned in future stages?** (Flag scope changes for staging plan review.)
   5. **Does this affect operational discipline** (caches, runbooks, session-open protocol)? (Flag changes needed.)
   The AI states each answer explicitly — even "no impact" — rather than implicitly assuming. The founder may overrule any "no impact" assessment.

3. **The AI must surface the following domains proactively** at session-open and during Phase 2 gap-finding, NOT wait for the founder to ask:
   - Security (OWASP Agentic Top 10; NIST AI RMF; relevant industry incidents)
   - Regulatory + compliance (jurisdictions applicable to the work; GDPR; CCPA; AI Act; Australia's AI policies given founder timezone; sectoral rules)
   - Accessibility (WCAG 2.1 AA; EAA 2025 EU)
   - Privacy by design (data minimisation; purpose limitation; consent UX)
   - Observability + SRE (uptime; error budgets; SLO tracking; on-call)
   - Legal entity + tax structure (jurisdiction of incorporation; tax treatment of marketplace revenue)
   - Insurance (professional liability; cyber liability; E&O)
   - Marketplace economics + dispute resolution (refund policies; chargebacks)
   - Onboarding UX (plugin install; first-time-user experience)
   - Anthropic-native capabilities (current SDK; managed agents; skills; sub-agents; GitHub Actions; computer use; memory; MCP; Plugin spec)

For each domain, the AI states either "considered: X, Y, Z" or "not material to this session because [reason]". The founder may accept the "not material" framing or push back.

4. **The AI must bias toward existing Anthropic infrastructure as the default.** Before recommending bespoke build work, the AI must explicitly evaluate whether existing Anthropic infrastructure (Claude Code commands; sub-agents; skills; managed agents; MCP servers; SDK patterns; Plugin spec) would deliver the same outcome with less custom work. If yes, the AI recommends the existing-infrastructure path as default and bespoke as alternative requiring justification.

5. **The AI must apply the positioning + ethos lens (per §"Foundational positioning and ethos" above) at every Phase 2 gap analysis and every Phase 3 triage decision.** Specifically: for each recommendation, the AI flags positioning impact (strengthens / weakens / neutral for "reliable reasoning primitive" positioning) and dogfood relevance (whether SageReasoning's existing products — Mentor; substrate's `/api/reason` — can validate the recommendation). The founder may consult the Mentor for ethically-weighted decisions during triage; the AI surfaces which triage decisions are candidates for Mentor consultation.

These five commitments should be **stated aloud at session-open** as part of the AI's session-opening checklist. They are candidates for permanent inclusion in the project instructions / manifest at the end of the session (see Phase 3 below).

---

## The Judge Layer framework — parallels to SageReasoning's architecture (added 2026-05-10 after reading 3 new inbox files dated 2026-05-08)

Three new inbox files (added 2026-05-10): `control layer for production agents.rtf` (article), `20260508-246-promptkit-1.md` (5 operational prompts), `20260508-246-guide-main.md` (OpenBrain Judge Extender spec). Together they articulate a framework — **The Judge Layer Is The Product** — that maps closely to SageReasoning's existing architecture and refines several existing decisions. The parallels are structural, not loose. The framework is one of the most consequential findings for the build that we were NOT considering until today.

### Layer 1 / 2 / 3 ↔ Judge Layer framework mapping

| SageReasoning component | Judge Layer framework analogue | Implication |
|---|---|---|
| Layer 2 (deterministic mechanism application + signed Layer2Assessment) | The Judge Layer itself (validator + decision API + provenance) | Layer 2 IS already a judge layer; cryptographic signing is stronger than the article's provenance labels. Output shape could evolve to `Layer2Decision` with ALLOW / BLOCK / REVISE / ESCALATE plus criteria_evaluated + reasoning. |
| Prescriptive / evaluative implementation system | Four-outcome decision framework (ALLOW / BLOCK / REVISE / ESCALATE) | Four-outcome refines binary prescriptive/evaluative. REVISE = directionally correct; needs specific change. ESCALATE = ambiguous; route to human. Both match existing Stoic counsel patterns. |
| Layer 1 (text → structured features; produces `Layer1Schema`) | Action Proposal Envelope (intended_action; authorization; evidence; expected_consequence; sensitivity; rollback) | Layer 1 could be extended to also produce or map to the action proposal envelope when consumed by actor agents; makes substrate directly consumable by production agent runtimes. |
| Decision log + standing-protocol-cache | OpenBrain Judge Extender (recall before; write-back after; review queue; memory inspector; provenance labels; use policies) | Our manual session-continuity discipline is a hand-built version of the Judge Extender contract. Provenance labels (observed/inferred/user_confirmed/imported/generated/superseded/disputed) and use policies (can_use_as_instruction/can_use_as_evidence/requires_confirmation/do_not_inject_automatically) directly enrich our discipline. |
| R20a three-layer perimeter (in-plugin script + server-side gate + Layer 3 deterministic injection) | Specialist privacy/safety judge + ESCALATE outcome | R20a is our specialist judge for distress; the framework confirms this pattern. Article notes: "the first split is usually authorization or privacy, because those are the failures with the worst consequences when missed" — R20a is privacy-class specialist already. |
| Three-layer architecture (open Layer 1 / closed Layer 2 / closed Layer 3) | Orchestration / coordination / judgment / continuity / human-review separation | SageReasoning sits in judgment + continuity. NOT orchestration. NOT coordination. This sharpens the "reliable reasoning primitive" positioning from yesterday: "judgment + continuity primitive specialised for Stoic reasoning." |

### Five failure modes — diagnostic for SageReasoning right now

Per the article: judges have to be operated like production systems. Five failure modes to evaluate against our substrate at Phase 2 gap-finding:

1. **Correlated judgment** — Layer 1 (Sonnet) + Layer 3 (Sonnet) using same model + similar prompts = shared blind spots. Mitigation available: **Anthropic's new "Outcomes" feature** (separate grader in its own context window; addresses this directly).
2. **Specification gaming** — actor wins by writing more persuasive prose rather than producing better evidence. Less applicable to SageReasoning because Layer 2 is deterministic (mechanism-driven, not LLM-judged), but Layer 1's text-to-structured-features extraction IS LLM-judged and could be gamed.
3. **Escalation drift** — R20a calibration. Is human review real (someone actually reads) or fake (rubber-stamp)? Currently founder-only; future plugin-shipping makes this a real question.
4. **Latency / cost** — three LLM calls per substrate request (Layer 1 Sonnet + Layer 2 deterministic + Layer 3 Sonnet). With Opus 4.7 tokenizer tax (1.29-1.47x) + adaptive thinking burn (per inbox synthesis Theme G), cost shape needs recalculation.
5. **Policy drift** — who owns updates to mechanism logic? Manifest amendments (J7) cover this partially; provenance + versioning of mechanism rules needs explicit treatment.

### Three near-term candidate amendments derived from the Judge Layer framework

These should be considered in Phase 3 triage:

- **A. Layer 2 output shape evolves to `Layer2Decision`** with the four-outcome framework (ALLOW / BLOCK / REVISE / ESCALATE) plus criteria_evaluated array (authorization / evidence / exposure_risk / policy / sensitivity / reversibility / quality) plus reasoning_summary plus revised_action_constraints (if REVISE) plus escalation_owner (if ESCALATE). This is a structural change to Layer 2 — Critical risk.
- **B. Decision log entries gain provenance labels and use policies** per OpenBrain Judge Extender vocabulary. Every entry tagged: provenance (observed/inferred/user_confirmed/imported/generated/superseded/disputed); use_policy (can_use_as_instruction/can_use_as_evidence/requires_confirmation/do_not_inject_automatically); freshness (created_at; last_confirmed_at; stale_after). Standing-protocol-cache distinguishes instruction-grade entries from evidence-grade entries. Standard risk (governance amendment).
- **C. Layer 1 output extended to optionally produce the Action Proposal Envelope** when consumed by an actor agent (vs by `sagereasoning.com` for human practitioners). Makes substrate directly consumable by any production agent runtime using this contract. Elevated risk (Layer 1 schema change).

These three together are a significant scope addition. They are surfaced for Phase 3 triage; founder elects what to adopt and where it lands.

---

## On Anthropic's Memory features + Dreams + Outcomes + Multi-agent orchestration (corrected 2026-05-10 after initial omissions)

**HONEST CORRECTION:** my initial research (yesterday's `/drafts/anthropic-features-survey-2026-05-10.md`) MISSED three features announced at "Code with Claude 2026" on 2026-05-06 — four days ago. The founder caught this via a simple Google search after I claimed not to find "dreaming." The omission and the overconfident negative finding triggered Standing Requirement 1a above. The accurate picture as of 2026-05-10 follows.

### Memory features (two distinct things — do not conflate)

- **Claude.ai memory toggle** (Settings → Capabilities on Claude web/desktop) — managed service feature for the user-facing chat experience. Auto-generates memories from chat history across conversations. Founder's current setting: OFF. Recommendation for the build: keep OFF — manual handoff notes + standing-protocol-cache + decision-log already provide structured cross-session memory; auto-generated unstructured summaries would be additive noise. May be worth turning ON later for the Mentor's personal-development context.
- **Memory tool API** (developer feature; requires beta header `context-management-2025-06-27`) — programmatic memory for agents. Read/write/delete files in `/memories` directory; client-side storage; 39% performance improvement combined with context editing. Potential replacement for some Supabase persistence in the substrate.
- **Managed Agents Memory Stores** (separate from Memory tool API) — structured memory stores attached to a Managed Agents session; agents write incrementally. This is what Dreams operates on.

### Dreams (research preview; announced 2026-05-06; doc: https://platform.claude.com/docs/en/managed-agents/dreams)

A scheduled, asynchronous job that takes a Managed Agents memory store + up to 100 past session transcripts and produces a NEW reorganised memory store (input is never modified). Claude reads existing memory + past sessions, dedups, merges, replaces stale entries, and surfaces new insights. The output is a separate store the founder reviews before adopting in future sessions. Beta headers required: `managed-agents-2026-04-01` + `dreaming-2026-04-21`. Models: `claude-opus-4-7` or `claude-sonnet-4-6`. Costs scale roughly linearly with session count. Limit: 100 sessions per dream. Currently research preview; access by request at https://claude.com/form/claude-managed-agents.

**Directly relevant to SageReasoning because:** the build plan currently does cross-session memory consolidation manually via handoff notes + standing-protocol-cache + decision-log. Dreams could augment this — it would find patterns in our session history we miss, dedup our decision-log entries, surface contradictions in our cache. The founder-review-before-adoption pattern matches existing project-instruction discipline ("Never edit strategic or governing documents without my explicit approval"). Real-world adoption: legal AI firm Harvey saw task completion rates increase 6x after implementing dreaming.

### Outcomes (public beta; announced 2026-05-06)

Define a rubric describing what success looks like; the agent works toward it; a SEPARATE grader agent (own context window; not influenced by the agent's reasoning) evaluates output against the rubric; when something's off, the grader pinpoints what needs to change and the agent takes another pass. Anthropic reports +10 points task-success improvement; PowerPoint generation +10.1%; Word generation +8.4%.

**Directly relevant to SageReasoning because:** addresses the "hallucinated audit trail" problem from yesterday's inbox research (Theme G — Opus and GPT both report "fixed" on corrections they didn't actually run). A separate grader evaluating against a rubric is exactly the pattern that catches this failure mode. Could be applied to K-category migration verification, PR1 single-endpoint-proof verification, and potentially as a built-in replacement for the security-audit's R6 (autonomous-agent red-team probe). Wisedocs cut document review time by 50% using outcomes.

### Multi-agent orchestration (public beta; announced 2026-05-06)

A lead agent breaks a job into pieces and delegates each to a specialist with its own model, prompt, and tools. Specialists work in parallel on a shared filesystem and contribute to the lead agent's context. Lead agent can check back with specialists mid-workflow because events are persistent and every agent remembers what it's done.

**Directly relevant to SageReasoning because:** maps directly to Stage 3 D-mechanisms — D1 (action scorer), D2 (verification), D3 (subagent handoff), D5 (audit trail) are all specialist-agent patterns. Could replace bespoke orchestration code with Anthropic-managed orchestration. Netflix processing logs from hundreds of builds simultaneously is the production-tested adoption signal. Also addresses several OWASP Agentic Top 10 2026 risks (inter-agent communication; delegated trust; tool misuse) that the security audit flagged as significant gaps.

### Other 2026-05-06 features (less central but worth noting)

- **Claude Finance** — 10 pre-built finance-vertical agents (pitchbooks; KYC screening; book-closing). Pattern is relevant — Anthropic ships vertical agent templates; SageReasoning's Stoic-substrate plugin is the analogous vertical for ethical reasoning.
- **Microsoft 365 Add-ins** — Excel, PowerPoint, Word, Outlook integrations "coming soon." Plugin distribution channel beyond Cowork + claude-plugins-official + anthropics/skills.

### Implication of the omission

The fact that all three Managed Agents features (Dreams + Outcomes + Multi-agent orchestration) were missed in yesterday's survey means **the Anthropic-features survey is materially incomplete and the build-plan stress-test must treat it as a starting point, not a finished inventory**. Phase 2.5 deep-dive (below) is updated to include the three new features explicitly. The general principle: any "consult authoritative sources" rule needs the negative-finding discipline (Standing Requirement 1a above) to actually work.

---

## Part A — Open under the protocol

Read in order:

1. `/adopted/standing-protocol-cache.md` (~3 min — tier, model selection, risk classification, signals, lean templates)
2. `/adopted/build-sessions-protocol-cache.md` (~3 min — substrate architecture; "no current users" governing note)
3. `/operations/handoffs/founder/2026-05-10-stage-1-a4-key-management-close.md` (~10 min — predecessor close)
4. **The three prep documents in order:**
   - `/drafts/security-audit-build-plan-vs-agentic-security-strategies-2026-05-10.md` (~20-30 min — security gaps + 15 recommendations across 5 priority tiers)
   - `/drafts/anthropic-features-survey-2026-05-10.md` (~15-20 min — 10 Anthropic features mapped to build-plan stage impact)
   - `/drafts/inbox-research-synthesis-2026-05-10.md` (~10-15 min — top 10 opportunities across 9 themes; 5 challenges to existing decisions)
5. `/adopted/substrate-plugin-staging-plan.md` (~15 min — re-read end-to-end with the gaps now in mind; new reading lens)
6. `/manifest.md` Process Rules section (~10 min — PR1-PR9; identify candidate new rules)
7. Founder shares any best-practice materials they independently sourced (founder responsibility to summarise or to put paths in chat at Phase 1 open)

Confirm at session-open: tier (governance / Elevated); the three standing requirements above; founder's appetite for one-session vs two-session split; whether any of the three prep documents need clarification before Phase 1.

---

## Part B — Procedure (4 phases)

### Phase 1 — Inventory + framing (~30 min)

1. Founder summarises (or hands paths to) any best-practice materials they sourced independently. AI reads them or accepts founder's summary.
2. AI summarises the three prep documents in 5-7 sentences each so both parties have shared context.
3. Agreement on the **universe of domains to stress-test against**. Default list per standing requirement 2 above; founder may add or remove. Output: a finalised domain list for Phase 2.
4. Decision: one-session stress-test (~3.5-4 hours target) OR two-session split (ST1 + ST2). If the domain list exceeds 10 or if the founder anticipates fatigue, default to split.

### Phase 1.5 — Action Surface Audit on SageReasoning's own architecture (~20-25 min)

Per Prompt 1 of the 2026-05-08 inbox material's "Judge Layer Is The Product Prompt Kit" — applied to SageReasoning itself as the first dogfood test. Output: a four-tier action classification of every action SageReasoning's substrate can take, with judge placement recommendations.

The AI runs this exercise BEFORE Phase 2 because the gap-finding in Phase 2 benefits from a current map of action surfaces. Tiers per the framework:
- **Tier 1 — Read-only:** retrieve, summarise, classify, inspect, draft, compare, explain. No external side effects.
- **Tier 2 — Reversible writes:** internal notes, drafts, local files, decision-log entries, standing-cache amendments. Side effects contained; undo paths exist.
- **Tier 3 — External side effects:** calls to `/api/reason`; signed Layer2Assessment delivery; public-key endpoint serving; Vercel deploys; (future) marketplace plugin actions.
- **Tier 4 — High-risk:** Vercel env-var changes for cryptographic keys; mentor-profile deletion; rotation procedures; production deploys touching auth surface.

For each action: name the boundary it crosses; who is affected if wrong; whether a judge runs before/after/none; whether human review is in the path; current build-plan coverage of that judge. Produce a prioritised list of action boundaries where judge layers are missing or underspecified. This list feeds Phase 2 as a fixed input — the most consequential dogfood test of the day.

### Phase 2 — Domain-by-domain gap-finding (~60-90 min)

For each domain on the finalised list, the AI produces a concise gap analysis:
- **What's currently in the build plan addressing this domain** (cite specific items: A1-A9; K1-K8; B1-B5; C1-C7; D1-D5; E1-E4; F1-F5; J1-J8; R0-R20; AC1-AC8; KG1-KG7; PR1-PR9)
- **What's missing** (specific named gaps)
- **What the gap could cause** if unaddressed (concrete failure mode, not abstract risk)
- **Recommended addition / re-scope / amendment** with proposed stage placement and risk classification
- **Positioning impact** (per §"Foundational positioning and ethos"): does closing this gap strengthen, weaken, or remain neutral for the "judgment + continuity primitive" positioning? If positioning impact is negative, surface explicitly so the founder weighs the trade-off.
- **Five-failure-modes diagnostic** (per §"The Judge Layer framework"): does the gap relate to correlated judgment / specification gaming / escalation drift / latency-cost / policy drift? Naming the failure mode makes the recommendation more concrete.
- **Dogfood relevance**: is this decision a candidate for substrate consultation via `/api/reason` Layer 2 mechanisms? Flag at Phase 3 triage as substrate-consultable.

For each domain, target ~5-8 minutes if the gap is small; up to ~15 minutes if the domain has substantial gaps. The AI uses the three prep documents as primary inputs; founder's independently-sourced materials supplement; AI's own knowledge (with disclosure of cutoff limitations) supplements further.

The AI must NOT propose more than 3-4 amendments per domain. If the gap surface is larger, the AI flags it and proposes the domain be its own sub-session rather than rushing.

Output of Phase 2: a structured gap-and-recommendations document (drafted live in chat or in a working file at `/drafts/stress-test-phase-2-gaps-2026-05-XX.md`).

### Phase 2.5 — Anthropic-features deep-dive (~30-40 min)

A focused exercise that produces deep consideration (not just inventory) of the 10 Anthropic features surveyed in `/drafts/anthropic-features-survey-2026-05-10.md`. For each feature, the AI produces a 5-point analysis:

1. **What it does, specifically** — with reference to current Anthropic documentation read at session-open (per Standing Requirement 1). Not abstract; concrete behaviour and inputs/outputs.
2. **Which specific build problem could it solve?** — mapped to named staging-plan items (A1-A9; K1-K8; B1-B5; C1-C7; etc.). If it solves nothing in the build plan, say so.
3. **Which existing completed work could it improve or refine?** — A1 (auth), A2 (validation), A3 (signing), A4 (key management). If it would replace or augment any of these, name the specific change.
4. **Where would it be wrong to apply?** — the negative case. Many features are situationally helpful and situationally wrong. Naming the wrong-apply cases prevents over-reaching.
5. **What additional information is needed before deciding?** — if the answer requires further research, a Stage 3 ADR, lawyer review, or a different session, name it.

The features for deep-dive (14 candidates — 10 from yesterday's survey + 3 added 2026-05-10 after Anthropic-features omission + 1 framework added 2026-05-10 after Judge Layer inbox material; founder may de-scope to fit time):
- `/security-review` slash command + GitHub Action
- Sub-Agents + Agent Teams + Hooks
- Agent SDK (renamed from Claude Code SDK)
- Managed Agents (hosted REST API)
- **Dreams** (memory consolidation; research preview; per §"On Anthropic's Memory features" above)
- **Outcomes** (rubric + separate grader; public beta; addresses hallucinated-audit-trail failure mode)
- **Multi-agent orchestration** (specialist agents with own models/prompts/tools; public beta; maps to Stage 3 D-mechanisms)
- Agent Skills marketplace (`anthropics/skills` + custom marketplaces)
- Memory tool API (developer-facing /memories file system)
- MCP + Plugin spec composition
- Claude Code Plugins (slash commands + subagents + MCP + hooks)
- CLAUDE.md special handling
- Opus 4.7 + Sonnet 4.6 (current models; note tokenizer tax up to 1.47x per inbox synthesis Theme G)
- **OpenBrain Judge Extender contract** (added 2026-05-10 from Judge Layer inbox material; schemas for action_proposal, judge_recall, judge_decision; provenance labels; use policies; review queue; memory inspector — evaluated against SageReasoning's decision-log + standing-cache + Layer 1 schema)

Target ~3-4 minutes per feature.

Output of Phase 2.5: a focused deep-dive document at `/drafts/stress-test-phase-2-5-anthropic-deepdive-2026-05-XX.md`. This is the input to Phase 3 triage for any Anthropic-features-related recommendations.

### Phase 3 — Triage + adoption decisions (~60-90 min)

Founder reads the Phase 2 + Phase 2.5 output and elects, per recommendation, using the **four-outcome decision framework** (per §"Foundational positioning and ethos" Principle 2 — dogfooded structurally):
- **ALLOW** (adopt as-is) — the recommendation enters the build plan as proposed. Founder names: which stage; risk classification; whether it amends existing items or adds new ones.
- **REVISE** — the recommendation is directionally correct but needs a specific change before adoption. Founder names the change; AI produces the revised version; AI proceeds with the revised recommendation.
- **BLOCK** (reject) — the recommendation is explicitly rejected with reasoning recorded.
- **ESCALATE** (defer) — the recommendation is logged in a backlog for revisit at a later stage (e.g., requires lawyer engagement; requires Stage 3 capability not yet built; requires more research). Founder names the revisit condition.

The AI does not advocate during triage. Surfaces trade-offs and risks; the founder elects. Triage runs item by item. The AI maintains a triage decision-log in chat, framing each disposition in four-outcome vocabulary.

**Substrate-as-judge dogfooding (per §"Foundational positioning and ethos" Principle 3 + Standing Requirement 5).** Per founder direction 2026-05-10: Mentor consultation is handled separately by founder; this session's dogfooding focus is **using SageReasoning's substrate to evaluate build decisions**. Current substrate maturity (A4 Verified; Layer 2 mechanisms operational at `/api/reason`) supports partial dogfooding now:

- For decisions the AI flags as Stoic-mechanism-relevant (impressions, judgments, value categories at stake, passion patterns, oikeiosis circles, control filter outcomes), the founder may invoke `/api/reason` with the decision framed as input and read the signed Layer2Assessment. The Layer2Assessment outputs (passion_diagnosis, control_filter, oikeiosis, value_assessment, kathekon_assessment, etc.) inform but do not replace the founder's triage decision.
- The four-outcome framework is applied to every triage decision regardless of substrate consultation — this dogfoods the framework structurally even when substrate maturity doesn't yet support automated scoring.
- The AI flags which recommendations are candidates for substrate consultation; founder elects whether to invoke for any given recommendation.

As the build matures (A5 Layer 3 lands → A7 R20a gate lands → Stage 3 D-mechanisms land), dogfooding deepens. Eventually the substrate will judge build decisions automatically. Today's session is the first deliberate dogfood at scale.

Output of Phase 3: a triage decision-log naming every Phase 2 + Phase 2.5 recommendation's four-outcome disposition (ALLOW / REVISE / BLOCK / ESCALATE) with reasoning. Each substrate-consulted decision is annotated with the Layer2Assessment fields the founder considered, for traceability and as a dogfood-quality signal.

### Phase 4 — Draft amendments (~30-45 min)

For each Adopt-disposition item in Phase 3, the AI drafts the concrete amendment:
- **Staging-plan amendments** — draft text inserted at the named stage; sufficient detail to act on but not so detailed that it pre-empts the implementation session's design choices.
- **Manifest amendments** — new rules (PR10+, new R-codes, new AC items) drafted as the founder will eventually paste into the manifest.
- **Project-instruction amendments** — drafted at `/drafts/proposed-project-instruction-amendment-stress-test-2026-05-XX.md` for founder review and adoption.

Amendments stay in `/drafts/` until founder explicitly moves them to `/adopted/` and the manifest. The session does not modify the live manifest or staging plan without founder's explicit move.

Output of Phase 4: draft amendments ready for founder review between sessions; an adoption checklist naming the move-to-adopted operations.

### Phase 5 — Session close (~25-30 min)

Pattern: full form per the standing cache (this is an Elevated session, not Critical, but the amendment scope warrants the full template). Save to `/operations/handoffs/founder/2026-05-XX-build-plan-stress-test-close.md`.

**Dogfood discipline applied to the close itself (per §"Foundational positioning and ethos"):** the session close must be testable as a structured reasoning primitive — clear, well-formed, versioned (decision-log entry ID), signed (by founder adoption), and consumable by future sessions. The close is the first dogfood test of every amendment adopted in this session. If the close struggles to incorporate an amendment cleanly, that's a signal the amendment needs refinement before adoption. The AI flags such cases honestly rather than smoothing over.

The close includes:
- Decisions Made — one entry per Adopt-disposition recommendation; one summary entry per Defer; one entry per Reject with reasoning
- Status Changes — staging plan items reclassified; new items added; new manifest rules drafted
- Verification Method Used — the founder verification framework for the amendment drafting (founder reads drafted amendments; AI provides path links)
- Founder Verification — the move-to-adopted operations for each amendment (`git mv` from `/drafts/` to `/adopted/`; manifest patch; project-instruction update)
- Next Session Should — resumption of A5 (Layer 3 service) under the amended build plan
- Orchestration Reminder

The decision-log entry: `D-STRESS-TEST-STAGING-PLAN-AMENDMENTS-2026-05-XX` (full form per the Elevated session template, expanded for the amendment scope).

---

## Part C — Anticipated session shape

| Phase | Estimate (one-session) | Estimate (ST1 split) | Estimate (ST2 split) |
|---|---|---|---|
| Cache + predecessor close + prep document reads | 30-45 min | 30-45 min | 15 min (re-read context) |
| Inbox scan + subscribed-source check (per Standing Requirement 1) | 10-15 min | 10-15 min | 5 min |
| Phase 1 — inventory + framing | 30 min | 30 min | 10 min |
| Phase 1.5 — Action Surface Audit on SageReasoning (Judge Layer Prompt 1 dogfood) | 20-25 min | 20-25 min | n/a |
| Phase 2 — domain-by-domain gap-finding (with five-failure-modes diagnostic) | 60-90 min | 90-120 min (more depth) | n/a |
| Phase 2.5 — Anthropic-features + Judge Layer deep-dive (14 candidates) | 45-60 min | 45-60 min | n/a |
| Phase 3 — triage with four-outcome framework + substrate-as-judge dogfooding | 60-90 min | n/a | 90-120 min |
| Phase 4 — draft amendments | 30-45 min | n/a | 60-90 min |
| Phase 5 — session close (with dogfood discipline check) | 25-30 min | 20-25 min | 30-40 min |
| **Total** | **~5-6 hours** | **~3.5-4 hours** | **~3-4 hours** |

**One-session estimate increased from ~4-5h to ~5-6h** to absorb the Phase 1.5 Action Surface Audit + Phase 2.5 Judge Layer deep-dive + five-failure-modes diagnostic in Phase 2. **The ST1/ST2 split is now the default recommendation** unless the founder explicitly elects one-session and reserves a long block of uninterrupted time. With three substantive structural additions (Judge Layer framework; four-outcome triage; substrate-as-judge dogfooding) plus the original gap-finding scope, one session is plausible but ambitious.

**Documented stable points if early closure is needed (per "I'm done for now" signal):**
- **After Phase 1:** the universe of domains agreed; no gaps yet identified. Status: framing complete; resume Phase 1.5 next session.
- **After Phase 1.5 (Action Surface Audit complete):** SageReasoning's own action surface mapped + judge-placement-gaps identified; Phase 2 not yet started. Status: dogfood-1 complete; resume Phase 2 next session.
- **After Phase 2 (most likely natural break point):** gaps identified; no triage decisions made yet. Status: gap-finding complete; resume Phase 2.5 + Phase 3 next session. This IS the ST1/ST2 natural split.
- **After Phase 2.5, before Phase 3:** deep-dive complete; triage not started. Status: research complete; resume triage next session.
- **After Phase 3, before Phase 4:** triage complete; amendments not yet drafted. Status: decisions made; resume Phase 4 next session.
- **After Phase 4, before Phase 5:** amendments drafted; session-close not yet written. Status: amendments in `/drafts/`; resume Phase 5 next session.

---

## Forecast

**Most-likely path (split into ST1 + ST2, given the increased scope):** ST1 covers session-open + inbox scan + Phase 1 + Phase 2 + Phase 2.5 — closes after the deep-dive at ~3 hours with gap analysis + Anthropic deep-dive complete; ST2 resumes with Phase 3 triage + Phase 4 amendments + Phase 5 close at ~3-4 hours. The founder reflects between sessions and consults the Mentor on ethically-weighted recommendations before ST2's triage. This split is now recommended over one-session because the Phase 2.5 deep-dive + the dogfood discipline + Mentor consultations add depth that benefits from a sleep cycle between research and decision.

**One-session path (~4.5-5 hours, if the founder elects):** Phase 1 takes 25 min. Phase 2 takes 75 min covering ~10 domains. Phase 2.5 takes 35 min on the 10 Anthropic features. Phase 3 takes 75 min triaging ~30-35 recommendations (Phase 2 + Phase 2.5 combined). Phase 4 takes 40 min drafting ~12-18 adopted amendments. Phase 5 takes 30 min including dogfood discipline check. Session closes at ~4.5-5 hours.

**Possible variations:**
- **Phase 2 surfaces > 15 substantial gaps** → split into ST1 (close after Phase 2) + ST2 (resume at Phase 3). Recommended if the founder's independently-sourced materials add a domain that doubles the gap surface.
- **Founder fatigue mid-Phase-3** → close at the most stable point per the founder's signal; resume next session.
- **A specific recommendation reveals it requires its own ADR** (e.g., the Plugin spec re-scope of Stage 3 C1-C7) → the amendment is "draft a new ADR for X in a dedicated session" rather than line-edit the staging plan.
- **A regulatory domain reveals it needs lawyer engagement before the build plan can commit** → flag for the lawyer engagement track (already on the critical path at Stage 3 per the staging plan); defer to that engagement.

**What success looks like at session close (one-session OR ST2-close):**
- Triage decisions made on every Phase 2 + Phase 2.5 recommendation (Adopt / Defer / Reject with reasoning).
- ~12-18 drafted amendments to the staging plan + manifest + project instructions in `/drafts/`.
- An adoption checklist the founder runs between sessions to move adopted amendments to `/adopted/`.
- A clearer answer to "what does the build plan look like with the gaps closed" — usable as the basis for A5 (Layer 3 service) under the amended plan.
- Five standing commitments confirmed (and candidates for permanent inclusion in project instructions): (1) authoritative-current-sources rule including `/inbox/` scan; (2) consider-implications five-question assessment after any web-search; (3) ten-domain proactive surfacing; (4) bias toward existing Anthropic infrastructure; (5) positioning + dogfood lens at every gap analysis and triage decision.
- Foundational positioning + ethos bound into specific session disciplines (not just abstract project-instruction principle).
- Mentor consultation record (paraphrased) for each ethically-weighted decision.
- Decision-log entry full form: `D-STRESS-TEST-STAGING-PLAN-AMENDMENTS-2026-05-XX`.
- Session close full form at `/operations/handoffs/founder/2026-05-XX-build-plan-stress-test-close.md`. The close itself passes the dogfood discipline check — it is testable as a structured reasoning primitive.
- Next-session prompt drafted for A5 — under the amended plan.

**After the stress-test:** the build arc resumes with A5 (Layer 3 server-side service), now operating against the amended staging plan + amended manifest + amended project instructions. The stress-test session is a one-off; future sessions inherit its outputs.

---

## Rollback path

The stress-test session itself has minimal rollback complexity because:
- It does not modify production code or production infrastructure.
- It produces drafts in `/drafts/`; nothing lands in `/adopted/` or the manifest without the founder's explicit move-to-adopted operations between sessions.
- If the founder reads the Phase 4 amendments and disagrees, the amendments stay in `/drafts/` indefinitely or are deleted.

**The only rollback-relevant scenario:** the founder elects an amendment during Phase 3, the AI drafts it during Phase 4, then between sessions the founder changes their mind. In that case, the founder simply does not perform the `/drafts/` to `/adopted/` move and the amendment never lands.

---

## Source materials

Prep documents (in `/drafts/`):
- `/drafts/security-audit-build-plan-vs-agentic-security-strategies-2026-05-10.md` (security audit; 15 recommendations)
- `/drafts/anthropic-features-survey-2026-05-10.md` (10 Anthropic features; build-plan impact)
- `/drafts/inbox-research-synthesis-2026-05-10.md` (top 10 opportunities; 9 themes; 5 challenges)

Source files in `/inbox/` (dated 2026-05-10; referenced in the inbox synthesis):
- 10 promptkit `.md` files (Nate B. Jones operationalisation tools)
- 8 RTF articles (271 bugs found in Firefox; The next AI platform winner; ai agents are about to route around; ai wiki; anticipation gap; automation strategy blindspot; buying rule; claude design)
- 2 RTFD bundles (agent plumbing; opus 4-7)

Authoritative project documents:
- `/adopted/substrate-plugin-staging-plan.md` (the stress-test subject)
- `/manifest.md` (R-rules, AC-rules, KG-rules, PR-rules — candidates for amendment)
- `/adopted/standing-protocol-cache.md` (governs the session)
- `/adopted/build-sessions-protocol-cache.md` (build-arc-specific context)

Previously-drafted next-session prompt for A5 (currently superseded by this stress-test prompt):
- `/operations/handoffs/founder/2026-05-10-stage-1-a5-layer-3-service-NEXT-SESSION-PROMPT.md` — resume after the stress-test under the amended plan.

End of prompt.
