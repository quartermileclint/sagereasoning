# Session 7h: Build Sage-Tech, Sage-Growth, and Sage-Support Brains

Read the handoff at `operations/handoffs/session-7g-ops-brain-wiring-env-context.md` first. It has the full context including architecture constraints and the pattern to follow.

## What happened in 7g

Session 7g wired the Sage-Ops Brain to sage-classify and sage-prioritise, built Layer 4 (Environmental Context) for all four agent domains, activated Supabase reads for Layers 3 and 4, and ran the first weekly environmental scan. All 19 endpoints have Stoic Brain context. The two operational endpoints now also have Ops Brain + environmental context. TypeScript compiles clean. Vercel green. Live verification confirmed Layer 1 and Layer 3 working on production.

## What this session builds

Three agent brains, following the exact Ops Brain pattern. Each brain needs two files:

1. **Compiled data file** (`website/src/data/[brain]-brain-compiled.ts`) — TypeScript constants organised into 6 domains + foundations section with Stoic virtue parallels
2. **Loader file** (`website/src/lib/context/[brain]-brain-loader.ts`) — Domain-specific loaders, composite builder with 3 depth levels (quick=2 domains, standard=4 domains, deep=6 domains), exports `get[Brain]Context(depth)` and `get[Brain]ContextForDomains(domains)`

Then wire each brain to its relevant endpoints as a new system message block (Block 3, after Stoic Brain in Block 2).

## CRITICAL CONSTRAINTS

1. **Stoic Brain is NEVER modified.** Ancient texts only. Do not touch any file in `stoic-brain-compiled.ts` or `stoic-brain-loader.ts`.
2. **Each brain gets its own system message block.** Never concatenate brains into one block. The injection pattern is: Block 1 (endpoint prompt, cached) → Block 2 (Stoic Brain) → Block 3 (agent brain).
3. **Environmental context stays in user message.** Already wired for the `ops` domain in sage-classify and sage-prioritise. For newly wired endpoints, add the appropriate environmental domain in the user message (not system blocks). Use `getEnvironmentalContext('tech')` / `getEnvironmentalContext('growth')` / `getEnvironmentalContext('support')` as appropriate.
4. **Follow the Ops Brain file structure exactly.** Reference files:
   - Data pattern: `website/src/data/ops-brain-compiled.ts` (246 lines)
   - Loader pattern: `website/src/lib/context/ops-brain-loader.ts` (237 lines)

## Brain 1: Sage-Tech Brain

**File:** `website/src/data/tech-brain-compiled.ts`
**Loader:** `website/src/lib/context/tech-brain-loader.ts`

Six domains for engineering, security, and infrastructure:

| Domain | Content | Depth |
|--------|---------|-------|
| `architecture` | Next.js App Router patterns, API route design, Supabase integration patterns, TypeScript conventions used in this project | quick |
| `security` | Auth patterns (Supabase Auth + API key validation), CORS configuration, rate limiting, input validation, encryption (AES-256-GCM for R17) | quick |
| `devops` | Vercel deployment, GitHub CI/CD, environment variables, build pipeline, monitoring | standard |
| `ai_ml_ops` | Anthropic API patterns, model selection (MODEL_FAST vs MODEL_DEEP), prompt versioning, context window management, token budget optimisation, caching strategy | standard |
| `code_quality` | TypeScript strict mode, linting, testing strategy, error handling patterns, logging conventions | deep |
| `tooling` | Package management, dev dependencies, build tools, local development setup | deep |

**Foundations:** Four technical virtues with Stoic parallels:
- Architectural Clarity ↔ Wisdom (knowing the right structure)
- Security Discipline ↔ Courage (protecting users even when inconvenient)
- Operational Reliability ↔ Justice (serving all users equally and honestly)
- Technical Restraint ↔ Temperance (building only what's needed, resisting premature optimisation)

**Operating principle:** "Sage-Tech provides technical options, trade-offs, and risk assessments. The founder makes architecture decisions. Code quality serves the mission — not the other way around."

**Wire to these endpoints** (agent-facing and engine endpoints that benefit from technical context):
- `/api/assessment/foundational` (POST) — add tech brain, standard depth
- `/api/assessment/full` (POST) — add tech brain, deep depth
- `/api/baseline/agent` (POST) — add tech brain, standard depth
- `/api/score-iterate` (POST) — add tech brain, quick depth

For each: import the loader, call `getTechBrainContext(depth)`, add as third system message block. Also add `getEnvironmentalContext('tech')` to the user message.

## Brain 2: Sage-Growth Brain

**File:** `website/src/data/growth-brain-compiled.ts`
**Loader:** `website/src/lib/context/growth-brain-loader.ts`

Six domains for marketing, community, and audience development:

| Domain | Content | Depth |
|--------|---------|-------|
| `positioning` | SageReasoning's unique position (Stoic virtue ethics + AI agent assessment), dual audience (human practitioners + agent developers), competitor differentiation, value proposition | quick |
| `audience` | Human practitioner personas, agent developer personas, enterprise buyer journey, community segmentation | quick |
| `content` | Content strategy principles, SEO fundamentals for philosophy + AI niche, blog/social/email channel guidance, tone of voice (authoritative but accessible, philosophical but practical) | standard |
| `developer_relations` | API documentation as marketing, SDK quality standards, developer community building, llms.txt and agent-card.json as discovery mechanisms, conference/community presence | standard |
| `community` | Community building principles, feedback loops, practitioner progression celebration, contributor pathways, open-source engagement strategy | deep |
| `metrics` | Growth metrics (acquisition, activation, retention, referral, revenue), conversion funnel definitions, channel attribution, content performance measurement | deep |

**Foundations:** Four growth virtues with Stoic parallels:
- Honest Positioning ↔ Wisdom (knowing what you truly are and communicating it clearly)
- Audience Empathy ↔ Justice (serving each audience's real needs, not manipulating)
- Patient Growth ↔ Temperance (growing sustainably, not chasing vanity metrics)
- Visible Courage ↔ Courage (standing for principled reasoning in a market that rewards hype)

**Operating principle:** "Sage-Growth builds awareness and trust through honest communication. Growth serves the mission of making principled reasoning accessible. No dark patterns, no manufactured urgency, no claims the product cannot support."

**Wire to these endpoints** (public-facing and human-facing endpoints that benefit from audience awareness):
- `/api/evaluate` (POST) — add growth brain, quick depth (this is the public demo — benefits from positioning awareness)
- `/api/score-scenario` (GET and POST) — add growth brain, quick depth (public-facing tool)
- `/api/score-document` (POST) — add growth brain, quick depth (human-facing tool)

For each: import the loader, call `getGrowthBrainContext(depth)`, add as third system message block. Also add `getEnvironmentalContext('growth')` to the user message.

## Brain 3: Sage-Support Brain

**File:** `website/src/data/support-brain-compiled.ts`
**Loader:** `website/src/lib/context/support-brain-loader.ts`

Six domains for user safety, philosophical sensitivity, and support operations:

| Domain | Content | Depth |
|--------|---------|-------|
| `triage` | Support request classification, severity levels, response time expectations, escalation criteria | quick |
| `vulnerable_users` | R20 requirements: language patterns indicating distress, redirection protocols to professional support, independence encouragement, what NOT to do (no diagnosis, no therapeutic claims) | quick |
| `philosophical_sensitivity` | Users may be in genuine moral distress. Stoic guidance vs professional counselling boundaries. When philosophical reflection helps vs when it could harm. The mirror principle (R19d). | standard |
| `escalation` | When to escalate to professional resources, crisis hotline information by region (AU, US, UK, EU), handoff language that maintains dignity, documentation requirements | standard |
| `knowledge_base` | Common user questions, FAQ patterns, tool usage guidance, API troubleshooting for developers, account and billing support patterns | deep |
| `feedback_loop` | How support interactions feed back into product improvement, pattern detection across support requests, feature request tracking, bug report triage | deep |

**Foundations:** Four support virtues with Stoic parallels:
- User Safety ↔ Justice (every user deserves protection and honest guidance)
- Philosophical Care ↔ Wisdom (knowing when philosophy helps and when professional support is needed)
- Emotional Steadiness ↔ Courage (staying calm and helpful in distressing interactions)
- Measured Response ↔ Temperance (giving enough support without overstepping into therapy)

**Operating principle:** "Sage-Support protects users first, serves them second. When in doubt, redirect to professional support. A philosophical reasoning tool is not a substitute for mental health care. The R20 vulnerable user protections are non-negotiable."

**Wire to these endpoints** (human-facing endpoints where user wellbeing matters most):
- `/api/reflect` (POST) — add support brain, standard depth (personalised reflection — most likely to encounter distressed users)
- `/api/mentor-baseline` (POST) — add support brain, quick depth
- `/api/mentor-baseline-response` (POST) — add support brain, quick depth
- `/api/mentor-journal-week` (POST) — add support brain, quick depth

For each: import the loader, call `getSupportBrainContext(depth)`, add as third system message block. Also add `getEnvironmentalContext('support')` to the user message.

## Build order

1. Sage-Tech Brain → compile check → wire to endpoints → compile check
2. Sage-Growth Brain → compile check → wire to endpoints → compile check
3. Sage-Support Brain → compile check → wire to endpoints → compile check
4. Final compile check across entire project
5. Single commit with all three brains + wiring
6. Push and verify Vercel green

## Verification

After all three are built and wired:
- `cd website && npx tsc --noEmit` must produce zero errors
- Confirm no changes to `stoic-brain-compiled.ts` or `stoic-brain-loader.ts` (Stoic Brain must be untouched)
- Confirm each new brain follows the exact same export pattern as the Ops Brain
- Confirm environmental context is in user message only, never in system blocks
- Update the context matrix in the handoff to show which endpoints have which brains

## Risk classification

Standard. All changes are additive — new files and additional system message blocks on existing endpoints. No changes to response format, auth, or existing functionality. The Stoic Brain is not touched.
