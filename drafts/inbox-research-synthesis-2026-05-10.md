# Inbox Research Synthesis — Opportunities for the Build Plan (2026-05-10)

**Status:** Drafted 2026-05-10. Research synthesis; does not modify the build plan. Founder reviews; decides at the stress-test session which opportunities enter the plan.
**Method:** A delegated agent read all 20 files dated today in `/inbox/` (10 promptkit `.md` files; 8 substantial RTF articles; 2 RTFD bundles). Cross-referenced against `/adopted/substrate-plugin-staging-plan.md`, `/drafts/security-audit-build-plan-vs-agentic-security-strategies-2026-05-10.md`, and `/drafts/anthropic-features-survey-2026-05-10.md`. Total source material: ~500KB; synthesised report ~3,300 words.
**Limitations:** Read-only synthesis; agent did not modify any files. Some files (personal AI computer / buying rule) were less relevant and contributed minimally. The opportunities surfaced here are *options*, not recommendations — founder elects which to adopt.

---

## 1. Inventory of files read

**Promptkit markdown files (10):** Nate B. Jones's operationalisation tools (diagnostic prompts; audit prompts; design tools). Each is the companion to a substantive RTF article.

- `20260331-6yc-promptkit-1.md` — Agent architecture audit (12 infrastructure primitives)
- `20260405-2ro-promptkit-1.md` — Knowledge architecture (wiki vs database; schema-as-policy)
- `20260420-hpx-promptkit-1.md` — Opus 4.7 migration prep
- `20260421-ozj-promptkit-1.md` — Codex workflow audit; computer use; acquisition signals
- `20260421-y1o-promptkit-1.md` — Claude Design extractor; PM prototype sprint
- `20260427-8f2-promptkit-1.md` — Personal AI computer stack planner
- `20260428-3x9-promptkit-1.md` — Consumer-agent anticipation gap; trust ladder
- `20260428-cx5-promptkit-1.md` — Tool-as-substrate diagnostic (5 properties)
- `20260504-eqj-promptkit-1.md` — Access vs meaning; semantic moat
- `20260504-qbn-promptkit-1.md` — Codebase verification-readiness for Mythos

**RTF articles (8):**
- `271 bugs found in Firefox.rtf` — Mozilla Mythos experiment; AI adversarial review found 271 bugs vs 22 with general-purpose models
- `The next AI platform winner.rtf` — Access vs meaning; the moat is semantic control
- `ai agents are about to route around.rtf` — Issue trackers won; five properties of agent substrate
- `ai wiki.rtf` — Karpathy wiki (write-time compilation) vs Open Brain (query-time retrieval)
- `anticipation gap.rtf` — Four problems (context, reliability, permission, judgment); five-step trust ladder
- `automation strategy blindspot.rtf` — Codex computer use vs Anthropic MCP; ecosystem cooperation
- `buying rule.rtf` — Six-layer personal AI stack; less relevant
- `claude design.rtf` — Claude Design as third leg; SKILL.md emission

**RTFD bundles (2):**
- `agent plumbing.rtfd/TXT.rtf` — Claude Code source-code leak; 12 infrastructure primitives
- `opus 4-7.rtfd/TXT.rtf` — Opus 4.7 deep review; literal interpretation; tokenizer tax

---

## 2. Themes surfaced (one paragraph each — full detail in the agent's full report below)

**Theme A — The semantic substrate / meaning over access.** Whoever owns meaningful work primitives — typed objects, defined verbs, ownership, state machines, audit history, permissions — wins the agent economy. SageReasoning's three-layer architecture is exactly this. The substrate already aligns with the framing; what's needed is positioning + diagnostic confirmation.

**Theme B — Production agent infrastructure (the 12 primitives).** ~80% of a working agent is plumbing under the LLM call: tool registry; permission system; session persistence; workflow state; idempotency; token budget tracking; structured streaming; system event logging; basic verification harness. The Claude Code leak revealed how much. The autoCompact bug (3,272 silent retries from a missing 3-line constant) illustrates plumbing failures > model failures.

**Theme C — Anthropic platform shape and integration.** Anthropic bets on structured integration (MCP, plugins, skills, Plugin spec); OpenAI bets on computer use (no ecosystem cooperation). The build plan's Stage 3 plugin work should commit to Plugin spec + MCP — saves 5-8 sessions and aligns with where the ecosystem is going. Substrate hosting (Vercel vs Managed Agents) is a foundational decision still open.

**Theme D — Adversarial code review and the security inversion.** Mozilla's Mythos found 271 bugs in Firefox where general-purpose models found 22. "Comprehensibility is now a security property." Four-to-five month window before Mythos-class tools are widely available. Functional tests are 80% of most eval suites; code-quality evals should be 50%. Direct support for adopting `/security-review` now.

**Theme E — Knowledge architecture (wiki vs database; hybrid; compilation).** Karpathy wiki (write-time compilation) drifts; Open Brain (query-time retrieval) re-derives. Hybrid (database as source of truth + compiled wiki) is the mature answer. The schema is the editorial policy. SageReasoning's Stage 3 F-series wiki should be hybrid; F1 schema before content.

**Theme F — Consumer agent adoption gap.** No breakaway consumer agent has shipped because four problems must be solved simultaneously (context, reliability, permission, judgment). Five-step trust ladder. Prosumer-bridge adoption path is under-weighted. Substrate's first wins are at steps 1-3 (Read, Suggest, Draft), not 4-5. Cowork (where prosumers live) is the right first marketplace.

**Theme G — Opus 4.7 / model migration / cost / peer review.** Opus 4.7 is more literal; new tokenizer maps text to up to 1.47x more tokens; adaptive thinking burns more output tokens. Both Opus and GPT produce hallucinated audit trails ("reported fixed without running"). Cross-model peer review is the only reliable grader. R5 cost thresholds and K5 cost-impact-per-migration need recalculation.

**Theme H — Computer use; GUI as universal adapter.** Codex's computer-use means agents can drive any GUI without API/MCP cooperation. Substrate works for both integration paths (plugin-MCP and computer-use). Multi-marketplace strategy in Stage 6 should explicitly include computer-use-agent surfaces.

**Theme I — Personal AI computer; local vs cloud.** Minimally relevant — substrate is cloud-hosted not local. The "open interfaces" + "tools as permissions" principles reinforce existing decisions; nothing load-bearing for the next session.

---

## 3. Top 10 consequential opportunities (ranked)

| # | Opportunity | Affected stage/items | Risk if not addressed |
|---|---|---|---|
| 1 | Commit Stage 3 C1-C7 plugin work to Anthropic Plugin spec + MCP, not bespoke | Stage 3 C1, C2, C3, C4, C5; J3 ADR | Bespoke architecture diverges from ecosystem; ~5-8 sessions of work that would migrate later anyway |
| 2 | Adopt `/security-review` GitHub Action + slash command immediately | Stage 1 A5, A7, A9; verification methodology | Mythos-class tools become available ~Stage 4 timing; substrate ships with hidden vulnerabilities |
| 3 | Score build plan against 12 production-agent primitives | Stage 1 broadly; A9; new A10 candidate; D1-D5 | Plumbing failures (autoCompact-class) ship to marketplace; substrate fails in undiagnosable ways |
| 4 | Reframe substrate as semantic infrastructure, not Stoic-philosophy tool | J1 ADR; J3 ADR; Stage 4 G3; Stage 5 I1 | Substrate categorised as "philosophy tool"; competitors using Anthropic primitives ship lookalikes |
| 5 | Re-evaluate substrate hosting: Vercel+Supabase vs Managed Agents | Stage 1 A5, A7, A9; potential re-architecture | A5 commits to Vercel; future migration is major refactor; operational burden stays high |
| 6 | Add per-agent credentials + revocation + agent/human identity distinction | Stage 1 A1 (revisited); security audit R1 | The McKinsey scenario — one compromise = global rotation = legitimate users kicked off |
| 7 | Treat F-series wiki as hybrid (compiled from database, not edited directly) | Stage 3 F1, F2, F3, F4, F5, F6 | Wiki drift; confident prose hides errors; contradictions smoothed away; R18 honest-certification undercut |
| 8 | Implement cross-model peer review for Critical-tier verification | Verification methodology; security audit R6 | Hallucinated audit trails; founder approves work that wasn't done; trust in build process erodes |
| 9 | Update R5 cost-as-health-metric for Opus 4.7 tokenizer tax | Stage 1 A9; J6 cost-impact ADR; Stage 2 K5 | Cost over-runs surprise mid-arc; alerts mis-fire; revenue:cost ratio breaks silently |
| 10 | Audit codebase for endpoint authentication + JSON-key SQL injection patterns | Stage 1 governance (~1-2 sessions); security audit R2 + R3 | McKinsey vector replicates; 22 unauthenticated endpoints exist by oversight in any large codebase |

---

## 4. Challenges to existing decisions

Five places where the research material contradicts or significantly reframes existing decisions:

**Challenge 1 — Bespoke vs Plugin-spec plugin architecture.** Stage 3 currently plans bespoke C1-C7. The inbox material strongly suggests Plugin spec adoption; ~5-8 sessions of reduction implied. Founder should affirm before Stage 3 kickoff.

**Challenge 2 — "Compute as the product" reframes hosting.** Opus 4.7 review suggests Managed Agents is the path that scales with Anthropic's commercial trajectory. Vercel+Supabase keeps operational independence but stays off the natural growth path. Decision needed before A5.

**Challenge 3 — "Brilliant operator" risk.** Products that operate over other systems' interfaces lack durable control. If SageReasoning is positioned only as a "reasoning service other agents call," it risks becoming Open-Layer-1-as-feature-of-Cowork. The counter is to own the assessment primitive as semantic infrastructure — consistent with existing architecture but needs deliberate framing in J1/J3.

**Challenge 4 — Trust-ladder positioning.** The substrate serves steps 1-3 (Read, Suggest, Draft) and a constrained step 4 (Act with confirmation). Step 5 (act autonomously) is not credible for any substrate making ethical claims (R18). Stage 4/5 messaging should reflect this; not a contradiction, but a sharper framing.

**Challenge 5 — Wiki publication form (F6).** Currently planned as a published wiki in Stage 5. Should ship as compiled-from-database, with regeneration as a first-class operational concern. Not whether to publish; how to publish.

---

## 5. Less useful files (full transparency)

- `buying rule.rtf` + `20260427-8f2-promptkit-1.md` (personal AI computer) — minor architecture-principle takeaways; mostly about personal infrastructure
- `plugin summary.rtf` (2.8KB) — minimal; skipped
- `plugin transcript.rtf` (76KB) — already-read; informed prior decisions; nothing new
- `20260421-ozj-promptkit-1.md` + `automation strategy blindspot.rtf` (Codex computer use) — interesting context but substrate complements rather than competes with computer use

The other 13 files contributed material insights to the synthesis above.

---

*End of synthesis. Pairs with `/drafts/security-audit-build-plan-vs-agentic-security-strategies-2026-05-10.md` + `/drafts/anthropic-features-survey-2026-05-10.md` as the third prep document for tomorrow's Build-Plan Stress-Test session.*
