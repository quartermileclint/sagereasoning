# Session 7f — Deep Thought Mode Review & Follow-Up Items

## Part 1: Sage-Ops Brain Audit of Org Chart

Simulating a Sage-Ops persona (operations manager with startup operations fundamentals), here is the audit of the org chart against what SageReasoning actually needs at each priority phase.

---

### Missing Positions Identified

**1. Data / Analytics Lead — HIGH PRIORITY**
Not on the chart. SageReasoning collects deliberation chains, proximity scores, passion diagnoses, and journal data. Someone (or some brain) needs to own:
- Analytics pipeline design (what events to track, how to aggregate)
- Product metrics (DAU, feature adoption, chain completion rates)
- LLM cost-per-call tracking (R5 cost-as-health-metric)
- A/B testing for reasoning prompt effectiveness

This role bridges Product and Engineering. Recommend: **Analytics Brain** with fundamentals in event modelling, cohort analysis, LLM cost attribution, and product metrics. Needed by P4 (Stripe/metering) at latest.

**2. QA / Testing Lead — MEDIUM PRIORITY**
The org chart has no explicit quality assurance role. For a Stoic reasoning platform, output quality is existential — a bad evaluation erodes trust permanently. Recommend: **Quality Brain** with fundamentals in LLM output evaluation, regression testing for prompt changes, and adversarial input testing. Aligns with P3 (adversarial evaluation protocol, 3d).

**3. Compliance / Privacy Officer — MEDIUM-HIGH PRIORITY**
Legal Counsel is external. But ongoing compliance (maintaining the compliance register, running periodic audits, managing data subject requests) is an operational function. The current chart puts this under COO/Ops, but it warrants its own brain given R17's requirements. Recommend: **Compliance Brain** with fundamentals in data protection operations, audit scheduling, deletion verification, and consent management. Needed by P2.

### Expertise Gaps in Existing Roles

**4. CTO — Missing: AI/ML Ops**
The Tech Architecture Brain covers system design but not the specific challenges of running LLM-dependent infrastructure: prompt versioning, model migration (when Anthropic releases new models), context window management, token budget optimisation, caching strategy for LLM calls. Recommend adding an **AI/ML Ops** sub-brain or expanding the Tech Brain's fundamentals.

**5. CMO — Missing: Developer Relations**
SageReasoning has a dual audience (human practitioners + agent developers). The Growth Brain covers customer acquisition generically, but developer marketing is its own discipline: API documentation as marketing, SDK quality, developer community building, conference presence, wrapper ecosystem. Recommend: either split DevRel out as its own position or explicitly add it to the Growth Brain's fundamentals.

**6. Support Lead — Missing: Philosophical Sensitivity**
Acknowledged in the chart's detail panel but worth elevating: support for a philosophical reasoning platform requires understanding that users may be in genuine moral distress. This isn't standard "troubleshooting" — it intersects with R20 (vulnerable user protection). The Support Brain needs explicit training on when to escalate to professional resources vs. when to provide Stoic guidance.

### Structural Recommendations

**7. Advisory Board (not on chart)**
At pre-seed/seed stage, formal advisory roles matter for credibility and gap-filling. Recommend adding an advisory tier:
- Philosophy advisor (already on chart — good)
- Technical advisor (experienced CTO who has scaled AI products)
- Business/investor advisor (startup founder or early-stage investor)
- Ethics/AI safety advisor (aligns with R17-R20 commitments)

**8. Role Consolidation for Solo Founder Phase**
With one person and AI collaboration, the realistic working structure is:
- **Founder**: Vision, decisions, relationships, verification (Stoic Brain + Founder Brain)
- **AI Collaborator**: Engineering, operations, content (draws from multiple brains per task)
- **External**: Legal, accounting, security review (on retainer or per-engagement)

The org chart shows the target structure. For P0-P2, most of these brains would be activated as needed within AI sessions rather than running as separate persistent agents. The chart becomes a hiring roadmap from Series A onward.

### Brain Build Priority Order

Based on the priority sequence and what each phase needs:

| Priority | Brain Needed | Phase |
|----------|-------------|-------|
| 1 | Sage-Ops Brain (COO) | P0 onward — session operations, process |
| 2 | Finance Brain (CFO) | P1 — business plan review |
| 3 | Compliance Brain | P2 — ethical safeguards |
| 4 | Security Brain | P2-P3 — encryption, adversarial testing |
| 5 | Legal Brain | P2-P3 — privacy law, terms of service |
| 6 | Analytics Brain | P4 — Stripe metering, cost health |
| 7 | Tech Brain (expanded) | P3-P4 — architecture decisions |
| 8 | Growth Brain (CMO) | P5-P6 — launch preparation |
| 9 | Support Brain | P6 — launch |
| 10 | Content Brain | P6 — launch |

---

## Part 2: Follow-Up Items from Context Architecture

### Item 1: score-iterate Endpoint — FOUND, NEEDS CONTEXT WIRING

**Status:** The endpoint exists at `website/src/app/api/score-iterate/route.ts` (650 lines). It is a direct-call endpoint — it creates its own Anthropic client and calls `client.messages.create()` directly. It does NOT use `runSageReason`.

**Context layers currently:** None. It has a hardcoded `INITIAL_SYSTEM_PROMPT` with Stoic evaluation instructions but no Layer 1 (Stoic Brain), no Layer 2 (practitioner context), and no Layer 3 (project context).

**Why it was missed:** It wasn't in the 7d handoff (which covered the 9 `runSageReason` endpoints) and wasn't found during 7e's grep for direct-call endpoints. The handoff listed 18 total endpoints; this makes 19.

**Classification:** Agent-facing (uses API key validation, deliberation chains, agent_id). Per the context matrix:
- Layer 1 (Stoic Brain): YES — Standard depth. The hardcoded system prompt already contains Stoic content, but it should use the centralised Stoic Brain loader for consistency and to benefit from brain updates.
- Layer 2 (Practitioner): NO — agent-facing, no user auth
- Layer 3 (Project): NO — agent-facing

**Recommended action:** Wire Layer 1 (Stoic Brain, standard depth) into score-iterate, replacing or augmenting the hardcoded INITIAL_SYSTEM_PROMPT. This is the same pattern used for assessment/foundational and baseline/agent. Risk: Standard (additive, no breaking changes to API response format).

**Note:** The endpoint also has an iteration mode (Mode 2) that builds a separate `iterationPrompt` via `buildV3IterationPrompt()`. Both the initial and iteration system prompts should receive Stoic Brain injection.

---

### Item 2: Supabase Migration for Layer 3 Dynamic State

**Migration file:** `website/supabase-project-context-migration.sql`

**Steps to run (when ready):**
1. Open Supabase dashboard → SQL Editor
2. Paste contents of `supabase-project-context-migration.sql`
3. Run the migration
4. Verify the `project_context` table was created with the expected columns
5. In `website/src/lib/context/project-context.ts`, uncomment the Supabase read block (currently commented out with a note about uncommenting after migration)
6. Commit and deploy

**When to do it:** Not urgent. Static defaults in `project-context.json` are accurate for current phase. Becomes useful when:
- Project context needs to update without redeployment (e.g., phase transitions, new decisions)
- The sage-stenographer skill is built and needs to write session outcomes to project context
- Dynamic state changes frequently enough to warrant live reads

**Risk:** Standard. The loader already handles the Supabase-down case by falling back to static defaults.

---

### Item 3: Live Verification Steps for Context Layers

**Test 1: Personalised response (/api/reflect)**
```bash
curl -X POST https://www.sagereasoning.com/api/reflect \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  -d '{
    "reflection": "Today I noticed I was angry at a colleague for taking credit for my work. I wanted to confront them publicly but instead I waited and considered what was actually within my control.",
    "date": "2026-04-10"
  }'
```
**Expected:** Response should reference the practitioner's specific passions (from Layer 2 profile), show Stoic reasoning from Layer 1, and include project-aware framing from Layer 3. The philosophical guidance should feel personal, not generic.

**Test 2: Public/generic response (/api/evaluate)**
```bash
curl -X POST https://www.sagereasoning.com/api/evaluate \
  -H "Content-Type: application/json" \
  -d '{
    "action": "I decided to take credit for a team members work to advance my career."
  }'
```
**Expected:** Response should work without authentication. Should show Stoic reasoning (Layer 1) and minimal project context (Layer 3), but NO practitioner personalisation (no Layer 2). Compare against Test 1 — the /api/reflect response should be noticeably more personal and contextualised.

**Test 3: Agent-facing (no profile, no project)**
```bash
curl -X POST https://www.sagereasoning.com/api/assessment/foundational \
  -H "Content-Type: application/json" \
  -H "X-API-Key: YOUR_API_KEY" \
  -d '{
    "agent_id": "test-agent",
    "scenario": "An AI assistant is asked to help a user write a deceptive email."
  }'
```
**Expected:** Stoic Brain only. No practitioner context, no project context. Pure philosophical evaluation.

**What to compare:** The three responses should show clear differentiation — personalised > public > agent-facing in terms of contextual richness, but all grounded in the same Stoic framework.

---

## Summary

| Item | Status | Action Needed |
|------|--------|--------------|
| Org chart HTML | DONE | Open and review |
| Sage-Ops audit | DONE | Review recommendations |
| score-iterate endpoint | EXISTS — no context layers | Wire Layer 1 (Stoic Brain, standard) |
| Supabase migration | Ready to run | Run when dynamic updates needed |
| Live verification | Test commands provided | Run after next deployment |
| Total endpoints needing context | 19 (not 18) | score-iterate is the 19th |
