# Product Testing Program — Non-Mentor Features

**Purpose:** AI-assisted testing of all non-mentor product features. The founder initiates a testing session using the prompt at the end of this document. The AI runs API calls, checks responses, and reports results. The founder reviews and makes judgement calls on quality.

**Why AI-assisted:** These features are API endpoints and developer-facing tools. Testing them requires constructing HTTP requests, reading JSON responses, and verifying field-level correctness — tasks that are faster and more reliable when the AI handles the mechanics while the founder evaluates the outputs.

**Relationship to mentor testing:** The mentor checklist (separate file) is founder-led because mentor features require subjective human judgement ("does this feel accurate?"). This program is AI-led because the tests are objective ("does this endpoint return the right fields?").

---

## Testing Phases

The program is split into 5 phases. Each phase can be run in a single session. Run them in order — later phases depend on earlier ones working.

---

### PHASE 1: Core Reasoning Engine

**What you're testing:** The universal reasoning engine that powers everything else. If this doesn't work, nothing works.

| ID | Feature | Endpoint | Test description | Pass criteria |
|----|---------|----------|-----------------|---------------|
| 1.1 | Quick-depth reasoning | POST /api/reason | Submit a real decision (e.g., "I'm considering leaving my job to start a business") at quick depth | Returns JSON with: katorthoma_proximity (one of 5 levels), passions_detected (array), mechanisms (3 for quick), reasoning_receipt. Response < 3s |
| 1.2 | Standard-depth reasoning | POST /api/reason | Same input at standard depth | Returns 5 mechanisms. More detailed analysis than quick. Response < 5s |
| 1.3 | Deep-depth reasoning | POST /api/reason | Same input at deep depth | Returns 6 mechanisms. Includes iterative refinement. Response < 10s |
| 1.4 | Depth quality comparison | Compare 1.1, 1.2, 1.3 | Review the three results side by side | Deep should be noticeably more nuanced than quick. Standard should be between the two. Proximity levels may differ if depth reveals more |
| 1.5 | Demo endpoint (no auth) | POST /api/evaluate | Same input, no authentication | Returns quick-depth evaluation. No auth required. Rate limited to 5/min |
| 1.6 | Per-stage scoring | POST /api/reason | Check meta.stage_scores in response | Should contain per-stage quality scores (recently added). Each stage rated individually |
| 1.7 | Urgency detection | POST /api/reason | Submit with urgency_context: "I need to decide by tonight" | Should return meta.hasty_assent_risk and meta.urgency_applied fields |
| 1.8 | Stoic Brain data | GET /api/stoic-brain | Fetch the conceptual framework | Returns JSON with Stoic philosophy structure. Should be comprehensive and well-organised |

---

### PHASE 2: Scoring & Decision Tools (Human-Facing)

**What you're testing:** The tools real users interact with on the website.

| ID | Feature | Page / Endpoint | Test description | Pass criteria |
|----|---------|----------------|-----------------|---------------|
| 2.1 | Score an action | /score page | Enter a real decision you're weighing. Submit | Page displays: proximity level with visual indicator, passions detected with false judgements, virtue domains engaged, improvement path |
| 2.2 | Score a document | /score-document page | Paste a real document (e.g., a business email, a policy draft, a letter) | Returns: proximity level, passion diagnosis (whose passions — writer's), kathekon quality, flagged sections |
| 2.3 | Score a policy | /score-policy page | Paste a real terms-of-service or policy document (even a short one) | Mode switches to policy. Returns: flagged clauses with severity, passions exploited by the policy, fairness assessment |
| 2.4 | Social media filter | /score-social page | Draft a social media post you'd actually consider publishing | Returns: publish recommendation (publish/revise/reconsider), poster_passions, reader_triggered_passions, platform-specific notes |
| 2.5 | Compare decisions | POST /api/score-decision | Submit 2-3 options for a real decision (e.g., "accept the offer" vs "negotiate" vs "decline") | Returns per-option evaluation + ranking. Best option should be the most principled, not just the most advantageous |
| 2.6 | Process evaluation | POST /api/score-decision | Include a process description of how you arrived at the options | Response should include process_quality (thorough/adequate/hasty) and process_described fields (recently added) |
| 2.7 | Ethical scenarios | /scenarios page | Select an audience (adult), generate a scenario, write your response | Returns: scenario + your response evaluated. Proximity level, passions, kathekon quality, educational feedback |
| 2.8 | Score a conversation | POST /api/score-conversation | Submit a real conversation transcript (a difficult meeting, a disagreement, a negotiation) | Returns: overall conversation evaluation + per-participant receipts. Uses deep depth (Sonnet) |

---

### PHASE 3: Guardrail, Deliberation & Agent-Facing Tools

**What you're testing:** The tools agent developers would use to integrate Stoic reasoning.

| ID | Feature | Endpoint | Test description | Pass criteria |
|----|---------|----------|-----------------|---------------|
| 3.1 | sage-guard (standard) | POST /api/guardrail | Submit an agent action: "Send a marketing email to all users about a flash sale" | Returns binary proceed/proceed_with_caution. Quick response (< 200ms). Includes reasoning |
| 3.2 | sage-guard (elevated) | POST /api/guardrail | Submit with risk_class: "elevated" and an ethically ambiguous action | Should use 5 mechanisms (standard depth). More thorough than 3.1 |
| 3.3 | sage-guard (critical) | POST /api/guardrail | Submit with risk_class: "critical", urgency_context, and no considered_alternatives | Should block (proceed: false) due to alternatives warning. Should include rollback_path and deliberation_quality fields (recently added) |
| 3.4 | Deliberation chain start | POST /api/deliberation-chain/{id} | Start a new chain with a complex decision | Returns chain_id and first step evaluation |
| 3.5 | Deliberation chain iterate | POST /api/score-iterate | Refine the decision from 3.4 with additional reasoning | Returns refined evaluation. Uses Cicero's 5 questions framework. Should build on previous step |
| 3.6 | Deliberation chain conclude | POST /api/deliberation-chain/{id}/conclude | Conclude the chain | Returns final synthesis and archived receipt |
| 3.7 | Skill execution | POST /api/execute | Execute sage-classify with a real classification task | Returns classification + reasoning quality + passion flags |
| 3.8 | Skill chaining | POST /api/compose | Chain sage-classify → sage-prioritise (classify items, then prioritise the classified results) | Returns sequential results. Second step should use first step's output as context |
| 3.9 | MCP tool discovery | GET /api/mcp/tools | Fetch available tools | Returns MCP-compatible tool schemas. Should include all Tier 1 and Tier 2 skills |

---

### PHASE 4: Assessment, Baseline & Progression

**What you're testing:** The assessment pipeline for both humans and agents.

| ID | Feature | Page / Endpoint | Test description | Pass criteria |
|----|---------|----------------|-----------------|---------------|
| 4.1 | Human baseline | /baseline page | Complete the full baseline assessment (5 core questions + optional Q6) honestly | Returns: Senecan grade, oikeiosis stage, dominant passion, 4 dimension levels. Should feel like a fair assessment |
| 4.2 | Baseline retake block | /baseline page | Try to retake immediately after completing 4.1 | Should block with message about 30-day cooldown |
| 4.3 | Foundational assessment (free) | GET /api/assessment/foundational | Fetch the 14 free-tier questions | Returns 14 questions across Phase 1 (Foundations) and Phase 2 (Architecture of Mind). No auth required for questions |
| 4.4 | Foundational scoring | POST /api/assessment/foundational | Submit answers to the 14 questions | Returns foundational alignment profile. Requires API key |
| 4.5 | Full assessment (paid) | GET /api/assessment/full | Fetch the 55-question assessment | Returns 55 questions across all 6 phases. Requires API key |
| 4.6 | Full assessment scoring | POST /api/assessment/full | Submit answers to all 55 questions | Returns comprehensive agent profile with Senecan grades, oikeiosis stages, passion analysis |
| 4.7 | User dashboard | /dashboard page | Sign in and view dashboard | Shows: baseline status, recent evaluations with proximity badges, practice calendar, milestones |
| 4.8 | Pattern detection | POST /api/patterns | After several evaluations, check for patterns | Returns: proximity trends, recurring passions, skill preferences, virtue gaps, passion clusters. Includes stage_score_trend and hasty_assent_frequency (recently added) |
| 4.9 | Reasoning receipts | GET /api/receipts | Query your stored receipts with date filters | Returns paginated list of reasoning receipts. Supports filtering by skill, proximity level, date range |
| 4.10 | Milestones | GET /api/milestones | Check earned milestones | Returns list of badges/milestones earned through evaluations |

---

### PHASE 5: Infrastructure, Marketplace & Discovery

**What you're testing:** The supporting infrastructure that makes everything discoverable and operational.

| ID | Feature | Page / Endpoint | Test description | Pass criteria |
|----|---------|----------------|-----------------|---------------|
| 5.1 | Skill marketplace | /marketplace page | Browse the marketplace | Shows Tier 2 skills organised by category. Each skill shows: outcome, cost, mechanism count |
| 5.2 | Skill detail | GET /api/marketplace/{id} | Fetch detail for a specific skill (e.g., sage-classify) | Returns full description, use cases, chains_to, example input/output |
| 5.3 | Skill discovery | GET /api/skills | List all available skills | Returns complete skill catalogue with metadata |
| 5.4 | Pricing page | /pricing page | Check the pricing page | Shows free-tier allowances, cost per call, skill groupings. Numbers should match actual API behaviour |
| 5.5 | API documentation | /api-docs page | Read the API docs | Should be comprehensive, with endpoint listing, auth requirements, example requests/responses |
| 5.6 | Data export | GET /api/user/export | Export your complete data | Returns JSON download of all your data: profile, evaluations, baselines, journal, deliberation chains |
| 5.7 | Data deletion | (DO NOT ACTUALLY DELETE) | Verify the endpoint exists at /api/user/delete | Should exist and require explicit { confirm: "DELETE" } token. **Do not run this test — just verify the endpoint responds to a GET or invalid POST with an appropriate error** |
| 5.8 | Usage summary | GET /api/billing/usage-summary | Check your API usage | Returns monthly usage by endpoint/skill, daily trends, remaining allowance |
| 5.9 | Admin metrics | /admin page | Navigate to admin dashboard | Shows: total users, actions scored, breakdown by event type and time period |
| 5.10 | Community map | /community page | View the community map | Interactive map loads. If you've set a location, your pin should appear |
| 5.11 | Home page | / (root) | Load the landing page | Hero section, three client types, feature overview, CTAs all render correctly |
| 5.12 | Methodology | /methodology page | Read the methodology page | Explains Stoic framework clearly for non-philosophers |
| 5.13 | Limitations | /limitations page | Read the limitations page | Honest about what the system can and cannot do. No overclaiming |
| 5.14 | Transparency | /transparency page | Read the transparency page | Compliance information present and readable |
| 5.15 | Privacy & terms | /privacy, /terms pages | Read both pages | Both present and contain substantive content (even if not yet lawyer-reviewed) |

---

### PHASE 6: Marketplace Skills (Individual Skill Testing)

**What you're testing:** Each Tier 2 skill produces useful, Stoic-informed output for its domain.

| ID | Skill | Test input | Pass criteria |
|----|-------|-----------|---------------|
| 6.1 | sage-classify | Classify 3 business emails into: urgent/important/routine | Returns classification per item + reasoning quality + passion flags + oikeiosis mapping |
| 6.2 | sage-prioritise | Prioritise 5 tasks on your current to-do list | Returns ranked list by principled reasoning (not urgency/fear). Per-item passion detection |
| 6.3 | sage-align | Describe a team decision-making scenario | Returns justice evaluation, oikeiosis analysis, virtue-based reasoning assessment |
| 6.4 | sage-coach | Describe a coaching situation (managing someone's performance) | Returns Stoic coaching guidance specific to the situation |
| 6.5 | sage-compliance | Describe a compliance question from your business | Returns compliance evaluation with ethical reasoning |
| 6.6 | sage-educate | Ask an educational question about Stoic philosophy | Returns teaching with appropriate depth for the audience |
| 6.7 | sage-govern | Describe a governance decision (policy change, rule setting) | Returns governance evaluation with justice analysis |
| 6.8 | sage-invest | Describe an investment decision (time, money, or attention) | Returns principled analysis of the investment |
| 6.9 | sage-moderate | Submit content for moderation assessment | Returns moderation recommendation with Stoic reasoning |
| 6.10 | sage-negotiate | Describe a negotiation scenario | Returns negotiation guidance focused on justice and appropriate action |
| 6.11 | sage-pivot | Describe a business pivot decision | Returns pivot analysis with principled reasoning |
| 6.12 | sage-premortem | Describe a planned initiative for premortem analysis | Returns potential failure modes with Stoic diagnosis |
| 6.13 | sage-resolve | Describe a conflict needing resolution | Returns resolution guidance with passion diagnosis for all parties |
| 6.14 | sage-retro | Describe a completed project for retrospective | Returns structured debrief with communication, process, and assumption analysis (recently enhanced) |

---

## Scoring Template

After each phase, fill in:

| Phase | Tests passed | Tests failed | Tests with warnings | Key finding |
|-------|-------------|-------------|-------------------|-------------|
| 1. Core Engine | /8 | | | |
| 2. Human-Facing Scoring | /8 | | | |
| 3. Guardrail & Agent Tools | /9 | | | |
| 4. Assessment & Progression | /10 | | | |
| 5. Infrastructure & Discovery | /15 | | | |
| 6. Marketplace Skills | /14 | | | |
| **TOTAL** | **/64** | | | |

---

## What This Produces

After all phases, you'll have:

1. **Capability inventory** (0h Assessment 4) — every component tested with honest status
2. **Gap list** (0h Assessment 2) — every failure and warning becomes a documented gap
3. **Value demonstration data** (0h Assessment 3) — real outputs from real inputs you can show to others
4. **Evidence for the business plan** (P1) — concrete proof of what the product does

---

*This testing program serves P0 hold point (0h) Assessments 1-4. Run in conjunction with the mentor testing checklist for complete coverage.*
