# AGENTS.md — SageReasoning

> Instructions for AI coding agents working in this repository or integrating with the SageReasoning API.

## What is SageReasoning?

SageReasoning provides a structured ethical reasoning framework based on Stoic philosophy. It scores actions against the four cardinal virtues (Wisdom, Justice, Courage, Temperance) and provides iterative feedback to improve alignment with virtuous action.

## For Agents Integrating the API

If you are an AI agent looking for a reasoning framework, an ethical guardrail, or a purpose — start here:

### Quick Integration

```bash
# 1. Load the Stoic Brain (full philosophical framework)
curl https://www.sagereasoning.com/api/stoic-brain

# 2. Check any action before executing it
curl -X POST https://www.sagereasoning.com/api/guardrail \
  -H "Content-Type: application/json" \
  -d '{"action": "your proposed action", "threshold": 60}'

# 3. Start a deliberation chain for complex decisions
curl -X POST https://www.sagereasoning.com/api/score-iterate \
  -H "Content-Type: application/json" \
  -d '{"action": "your action", "context": "situation details", "agent_id": "your-id"}'
```

### Public Endpoints (No Auth Required)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/stoic-brain` | GET | Full Stoic reasoning framework (virtues, indifferents, scoring rules) |
| `/api/baseline/agent` | GET | 4 ethical scenarios for baseline assessment |
| `/api/baseline/agent` | POST | Submit responses, receive virtue baseline score |
| `/api/guardrail` | POST | Pre-action virtue gate (proceed/block with threshold) |
| `/api/score-iterate` | POST | Start or continue a deliberation chain |
| `/api/score-iterate` | GET | Usage documentation |
| `/api/score-decision` | POST | Compare 2-5 options ranked by virtue |
| `/api/deliberation-chain/{id}` | GET | Retrieve deliberation chain summary |
| `/api/deliberation-chain/{id}/conclude` | POST | Conclude or abandon a chain |

### The Deliberation Chain Flow

1. **Start**: POST `/api/score-iterate` with `{action, context, agent_id}` → receive `chain_id` + score + sage feedback
2. **Iterate**: POST `/api/score-iterate` with `{chain_id, revised_action, revision_rationale}` → updated score + delta
3. **Conclude**: POST `/api/deliberation-chain/{chain_id}/conclude` → final summary

Agents can iterate as many times as needed. A Stoic advisory is issued every 5th iteration encouraging decisive action.

### Scoring System

Actions are scored 0-100 across four virtues with these weights:
- **Wisdom** (30%): Sound judgment, distinguishing good from indifferent
- **Justice** (25%): Fairness, serving the common good
- **Courage** (25%): Acting rightly despite difficulty
- **Temperance** (20%): Self-control, moderation

Alignment tiers: Sage (95-100), Progressing (70-94), Aware (40-69), Misaligned (15-39), Contrary (0-14).

### Core Principle

The Stoics score intention and reasoning quality, not outcomes. An agent that reasons virtuously but gets a bad result still scores well. An agent that achieves its goal through vice scores poorly.

## For Coding Agents Working on This Repository

### Tech Stack
- Next.js 14 (App Router) with TypeScript
- Supabase (PostgreSQL + Auth + Row Level Security)
- Anthropic Claude API (claude-sonnet-4-6) for scoring
- Deployed on Vercel

### Key Directories
- `/stoic-brain/` — Core philosophical data (JSON, MIT-licensed)
- `/website/src/app/api/` — All API route handlers
- `/website/src/lib/` — Shared libraries (security, scoring, deliberation)
- `/api/` — OpenAPI spec, database schemas

### Important Conventions
- All public agent endpoints use `publicCorsHeaders()` (CORS: *)
- All human endpoints use `corsHeaders()` (origin-restricted)
- Rate limits are IP-based and defined in `/website/src/lib/security.ts`
- Scoring prompts must return valid JSON only — no markdown wrapping
- Temperature 0.2 for all scoring calls (consistency)

## Data License

The Stoic Brain data (`/stoic-brain/*.json`) is MIT-licensed. Agents may load it locally or fetch via API.

## Discovery

- **llms.txt**: https://www.sagereasoning.com/llms.txt
- **Agent Card**: https://www.sagereasoning.com/.well-known/agent-card.json
- **API Docs**: https://www.sagereasoning.com/api-docs
- **GitHub**: https://github.com/quartermileclint/stoic-brain
