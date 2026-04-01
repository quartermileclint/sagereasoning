# AGENTS.md — SageReasoning

> Instructions for AI coding agents working in this repository or integrating with the SageReasoning API.

## What is SageReasoning?

SageReasoning is a structured reasoning evaluation API based on Stoic philosophy. At its core is **sage-reason** — a universal reasoning layer that applies the Stoic core triad (Control Filter, Passion Diagnosis, Oikeiosis) to any decision input. All skills and wrappers call sage-reason internally.

Actions are assessed using qualitative proximity levels (reflexive, habitual, deliberate, principled, sage-like) — not numeric scores. The system identifies specific false judgements and passions (irrational impulses) rather than producing abstract ratings.

All API responses use a standard envelope: `{ result: { ... }, meta: { endpoint, ai_model, latency_ms, cost_usd, is_deterministic, composability, usage } }`.

## For Agents Integrating the API

If you are an AI agent looking for a pre-action decision gate, a reasoning quality evaluator, or a structured improvement loop — start here:

### Quick Integration

```bash
# 1. Universal reasoning check — one call, any decision
curl -X POST https://www.sagereasoning.com/api/reason \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sr_live_<your-key>" \
  -d '{"input": "your decision or action", "depth": "quick"}'
# Returns: control_filter, passion_diagnosis, oikeiosis, katorthoma_proximity

# 2. Pre-action decision gate (sub-100ms, binary go/no-go)
curl -X POST https://www.sagereasoning.com/api/guardrail \
  -H "Content-Type: application/json" \
  -d '{"action": "your proposed action", "threshold": "deliberate"}'

# 3. Deep analysis with all 6 mechanisms
curl -X POST https://www.sagereasoning.com/api/reason \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sr_live_<your-key>" \
  -d '{"input": "your decision", "context": "situation details", "depth": "deep"}'
# Returns: all 6 mechanisms + senecan progress tracking

# 4. Iterative deliberation chain
curl -X POST https://www.sagereasoning.com/api/score-iterate \
  -H "Content-Type: application/json" \
  -d '{"action": "your action", "context": "situation details", "agent_id": "your-id"}'
```

### Agent Assessment Framework (Recommended)

| Endpoint | Method | Tier | Purpose |
|----------|--------|------|---------|
| `/api/assessment/foundational` | GET | Free | 14 self-assessment prompts (Phases 1-2) |
| `/api/assessment/foundational` | POST | Free | Submit responses, receive foundational proximity level + growth edge |
| `/api/assessment/full` | GET | Free | Info about the full 55-assessment evaluation |
| `/api/assessment/full` | POST | Paid | Submit all 55 responses, receive full reasoning profile |

Framework file: [`agent-assessment-framework-v3.json`](https://www.sagereasoning.com/agent-assessment/agent-assessment-framework-v3.json)

### Skill Contracts (Outcome-First)

Each skill follows the **Outcome / Cost + Speed / Chains To** contract pattern:

#### Tier 1: sage-reason (Universal Reasoning Layer)

| Skill | Outcome | Cost + Speed | Chains To |
|-------|---------|-------------|-----------|
| `sage-reason` (quick) | Core triad check — control filter + passion diagnosis + oikeiosis mapping against any input | ~$0.025, ~2s | sage-reason (standard), any sage skill |
| `sage-reason` (standard) | 5-mechanism analysis — adds value assessment + kathekon evaluation to the core triad | ~$0.041, ~3s | sage-reason (deep), sage-iterate |
| `sage-reason` (deep) | Full 6-mechanism analysis — adds Senecan progress tracking and direction-of-travel | ~$0.055, ~4s | sage-iterate |

#### Tier 2: Evaluation Skills (call sage-reason internally)

| Skill | Outcome | Cost + Speed | Chains To |
|-------|---------|-------------|-----------|
| `sage-score` | Pre-action decision audit with structured reasoning + improvement path | ~$0.033, ~2s | sage-iterate, sage-reason |
| `sage-decide` | Option ranker — submit 2-5 choices, ranked by reasoning quality | ~$0.033, ~2s | sage-guard |
| `sage-guard` | Sub-100ms decision gate — binary go/no-go check before acting | ~$0.001, <100ms | sage-iterate |
| `sage-iterate` | Iterative decision refinement — submit, get feedback, revise, track improvement | ~$0.033, ~2s | sage-score |
| `sage-filter` | Pre-publish content filter — catches tone and judgement issues | ~$0.033, ~2s | sage-iterate |
| `sage-audit` | Document quality audit + shareable trust badge | ~$0.033, ~3s | sage-iterate |
| `sage-converse` | Conversation quality breakdown — per-participant reasoning analysis | ~$0.033, ~3s | — |
| `sage-scenario` | Decision scenario generator + scorer | ~$0.066, ~4s | sage-score |
| `sage-reflect` | End-of-day decision review — identifies patterns + structured examination | ~$0.033, ~2s | — |
| `sage-profile` | Agent decision profile — 4 scenarios, returns tendencies and blind spots | ~$0.033, ~3s | sage-diagnose |
| `sage-diagnose` | Decision-making diagnostic — 14-question quick or 55-assessment deep evaluation | ~$0.033, ~2s | sage-iterate |
| `sage-context` | Reasoning framework context loader — public, no auth | Free, <50ms | — |

### All Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/reason` | POST | **Universal reasoning layer** — core triad + depth parameter (quick/standard/deep) |
| `/api/score` | POST | 4-stage evaluation (control filter → kathekon → passion diagnosis → virtue quality) |
| `/api/stoic-brain` | GET | Reasoning framework context (public, no auth) |
| `/api/baseline/agent` | GET/POST | Quick 4-scenario baseline assessment |
| `/api/guardrail` | POST | Pre-action decision gate (proceed/caution/pause/deny with threshold) |
| `/api/score-iterate` | POST | Start or continue a deliberation chain |
| `/api/score-decision` | POST | Compare 2-5 options ranked by reasoning quality |
| `/api/score-document` | POST | Document/text evaluation with trust badge |
| `/api/score-conversation` | POST | Conversation quality with per-participant breakdown |
| `/api/score-scenario` | GET/POST | Decision scenario generator + scorer |
| `/api/reflect` | POST | End-of-day reflection review |
| `/api/deliberation-chain/{id}` | GET | Retrieve deliberation chain summary |
| `/api/deliberation-chain/{id}/conclude` | POST | Conclude or abandon a chain |
| `/api/skills` | GET | List all capabilities as skill contracts (coming soon) |
| `/api/skills/{id}` | GET | Full skill contract with example I/O (coming soon) |
| `/api/evaluate` | POST | No-auth test endpoint for instant demo (coming soon) |

### The Deliberation Chain Flow

1. **Start**: POST `/api/score-iterate` with `{action, context, agent_id}` → receive `chain_id` + proximity level + sage feedback
2. **Iterate**: POST `/api/score-iterate` with `{chain_id, revised_action, revision_rationale}` → updated proximity + delta
3. **Conclude**: POST `/api/deliberation-chain/{chain_id}/conclude` → final summary

Free tier: 1 iteration per chain. Paid tier: up to 3 iterations per chain. A Stoic advisory is issued every 5th iteration (paid tier) encouraging decisive action.

### Proximity Levels

Actions are assessed using qualitative proximity levels reflecting how close the reasoning is to sage-like (perfect) reasoning:

| Level | Meaning |
|-------|---------|
| reflexive | No reasoning applied — impulse-driven action |
| habitual | Pattern-following without examination |
| deliberate | Active reasoning with some false judgements remaining |
| principled | Consistently sound reasoning aligned with virtue |
| sage-like | Reasoning indistinguishable from the Stoic sage ideal |

The system evaluates intention and reasoning quality, not outcomes. An agent that reasons well but gets a bad result still achieves high proximity. An agent that succeeds through vice achieves low proximity.

### Free Tier

100 API calls per month, rate-limited. No daily cap. Full evaluation output on all endpoints — the distinction between free and paid is volume, not capability. Sage skill wrappers consume 2-3 calls per invocation (guard + score + optional iterate).

### Sage Skill Wrappers

SageReasoning provides open-source skill wrappers that add reasoning checkpoints to existing skills:

- **BEFORE**: `sage-guard` checks the task via sage-reason quick depth (~$0.001, <100ms)
- **EXECUTE**: The original skill runs unchanged
- **AFTER**: `sage-score` evaluates output via sage-reason standard depth (~$0.033, ~2s)
- **OPTIONAL**: `sage-iterate` if proximity is below deliberate

Wrapper code is free. The API calls within the wrapper are metered against your monthly allowance.

### Marketplace

Original sage skills (proprietary skills built on the stoic brain) are available through the marketplace:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/marketplace` | GET | Browse available sage skills (human page) |
| `/api/marketplace` | GET | Agent-facing skill catalogue |
| `/api/marketplace/{id}` | GET | Individual skill contract |
| `/api/marketplace/{id}/preview` | POST | Free preview invocation |
| `/api/marketplace/{id}/acquire` | POST | Acquire a skill |

## For Coding Agents Working on This Repository

### Tech Stack
- Next.js 14 (App Router) with TypeScript
- Supabase (PostgreSQL + Auth + Row Level Security)
- Anthropic Claude API (claude-sonnet-4-6) for scoring
- Deployed on Vercel

### Key Directories
- `/stoic-brain/` — Philosophical framework data (JSON, Proprietary Licence)
- `/website/src/app/api/` — All API route handlers
- `/website/src/lib/` — Shared libraries (security, scoring, deliberation)
- `/api/` — OpenAPI spec, database schemas

### Important Conventions
- All public agent endpoints use `publicCorsHeaders()` (CORS: *)
- All human endpoints use `corsHeaders()` (origin-restricted)
- Rate limits are IP-based and defined in `/website/src/lib/security.ts`
- Scoring prompts must return valid JSON only — no markdown wrapping
- Temperature 0.2 for all scoring calls (consistency)
- V3 uses qualitative proximity levels, not numeric 0-100 scores (R6c)
- Standard disclaimer: "Ancient reasoning, modern application. Does not consider legal, medical, financial, or personal obligations."

## Data License

The Stoic Brain data (`/stoic-brain/*.json`) is provided under the SageReasoning Proprietary Licence. Agents may read the public reference files for evaluation and use the data via the SageReasoning API. Use of the data to build competing scoring services is prohibited. See `/LICENSE` for full terms.

## Discovery

- **llms.txt**: https://www.sagereasoning.com/llms.txt
- **Agent Card**: https://www.sagereasoning.com/.well-known/agent-card.json
- **API Docs**: https://www.sagereasoning.com/api-docs
- **GitHub**: https://github.com/quartermileclint/stoic-brain
