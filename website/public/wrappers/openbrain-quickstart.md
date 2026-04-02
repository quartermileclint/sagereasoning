# SageReasoning × OpenBrain Quickstart

> Add principled reasoning evaluation to your OpenBrain stack in 10 minutes.
> No architecture changes required.

## What This Adds

OpenBrain gives you persistent, structured, searchable memory.
SageReasoning adds a reasoning quality layer on top:

| OpenBrain Step | Without Sage | With Sage |
|----------------|-------------|-----------|
| AI Sorter (4) | Raw LLM classification | Reasoned classification + passion flags |
| Immutable Log (5) | Records what happened | Records what happened AND why |
| Agent Loops (9) | Urgency-driven prioritisation | Principled prioritisation with audit trail |
| Actions (10) | Execute without evaluation | Pre/post reasoning quality gates |

## Prerequisites

- An OpenBrain stack (Supabase/Postgres + embeddings + capture pipeline)
- A SageReasoning API key (free: 100 calls/month)

Get your key at [sagereasoning.com](https://sagereasoning.com) or email
zeus@sagereasoning.com.

## Step 1: Discover Available Tools

```bash
# All available sage tools (MCP-compatible schemas)
curl https://www.sagereasoning.com/api/mcp/tools

# Just the OpenBrain-optimised toolset (6 skills)
curl https://www.sagereasoning.com/api/mcp/tools?preset=openbrain

# Full MCP server capabilities (auth, limits, compliance)
curl https://www.sagereasoning.com/api/mcp/tools?full=true
```

The response includes MCP-compatible `inputSchema` for each tool,
so any MCP client can auto-discover and invoke them.

## Step 2: Replace Your AI Sorter

Your current sorter probably looks like:

```
input → LLM("classify this") → route to table
```

Replace with sage-classify:

```bash
curl -X POST https://www.sagereasoning.com/api/skill/sage-classify \
  -H "Authorization: Bearer sr_live_YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "input": "I need to quit my job before I lose my mind",
    "categories": [
      {"id": "task", "label": "Task", "description": "Actionable item"},
      {"id": "thought", "label": "Thought", "description": "Reflection or idea"},
      {"id": "decision", "label": "Decision", "description": "Choice to be made"}
    ]
  }'
```

Response includes:

- `category`: Where to route it
- `confidence`: How sure the classification is
- `input_proximity`: Reasoning quality of the input itself
- `passions_detected`: What emotions might be distorting the content
- `oikeiosis_stage`: Which circle of concern this affects (1=self → 5=cosmos)
- `action`: What to do (`classify`, `hold_for_review`, `flag_urgent`, `defer`)
- `reasoning_receipt`: Full audit trail of the evaluation

If you omit `categories`, sage-classify uses default OpenBrain categories:
thought, task, person, project, idea, decision.

## Step 3: Add Reasoning to Your Agent Loops

When your proactive agent decides what to work on:

```bash
curl -X POST https://www.sagereasoning.com/api/skill/sage-prioritise \
  -H "Authorization: Bearer sr_live_YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {"id": "bug-fix", "description": "Fix critical production bug", "urgency_signal": "high"},
      {"id": "investor-email", "description": "Reply to investor update request"},
      {"id": "linkedin", "description": "Update LinkedIn profile", "urgency_signal": "overdue"}
    ],
    "objective": "Ship the product and close the funding round",
    "horizon": "today"
  }'
```

Response includes:

- `ranked_items`: Items in priority order with per-item reasoning
- Each item gets: `rank`, `reasoning`, `within_control`, `oikeiosis_stage`,
  `passions_detected`, `is_kathekon`, `action` (do_now/schedule/delegate/defer/reconsider)
- `patterns_detected`: Cross-list patterns (urgency addiction, avoidance, etc.)
- `reasoning_receipt`: Full audit trail

## Step 4: Gate Agent Actions

Before your agent executes anything:

```bash
curl -X POST https://www.sagereasoning.com/api/guardrail \
  -H "Authorization: Bearer sr_live_YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "Send an automated reply declining the partnership",
    "threshold": "deliberate"
  }'
```

If `proceed: false`, the agent pauses and flags for review.

## Step 5: Store Reasoning Receipts

Every sage response includes a `reasoning_receipt`. Store these in your
immutable log (OpenBrain step 5). They provide:

- `receipt_id`: Unique identifier (sortable)
- `mechanisms_applied`: Which reasoning frameworks were used
- `reasoning_trace`: Step-by-step evaluation path
- `passions_detected`: Emotional patterns over time
- `proximity`: Reasoning quality level

Over time, your receipt history becomes a reasoning quality dataset
that compounds the same way your memory data does.

## API Call Budget

Free tier: 100 calls/month.

| Operation | Calls Used |
|-----------|-----------|
| sage-classify (one input) | 1 |
| sage-prioritise (one list) | 1 |
| sage-guard (pre-action gate) | 1 |
| sage-reason (post-action eval) | 1 |
| Full wrapped action (guard + execute + score) | 2-3 |

100 calls ≈ 33-50 fully wrapped agent actions per month, or 100 standalone
classifications/prioritisations.

## What You're NOT Getting

SageReasoning evaluates reasoning quality. It does not:

- Predict outcomes
- Provide therapeutic or clinical advice
- Make hiring or HR decisions
- Replace your domain logic

All output includes a disclaimer per compliance rules.

## Next Steps

- Read the [full wrapper template](./WRAPPER-TEMPLATE.md) for custom integrations
- Browse all skills at `GET /api/skills`
- Try the interactive tools at [sagereasoning.com/score](https://sagereasoning.com/score)

## Disclaimer

Ancient reasoning, modern application. Does not consider legal, medical,
financial, or personal obligations.
