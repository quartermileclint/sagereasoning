# SageReasoning — AI Agent Integration Guide

**Version:** 2.0 | **Last updated:** 28 March 2026 | **Status:** Live

---

## Purpose

This guide tells any AI agent how to interface with the SageReasoning Stoic Brain for virtue-based reasoning. The full API is live at `https://www.sagereasoning.com`.

---

## Getting Started in 3 Steps

**Step 1 — Load the Stoic Brain (no key required):**
```
GET https://www.sagereasoning.com/api/stoic-brain
```
Returns the full virtue framework — 4 cardinal virtues, 16 sub-virtues, scoring weights, alignment tiers, and preferred indifferents. Load this into your context to reason as a Stoic advisor.

**Step 2 — Get an API key:**
Contact zeus@sagereasoning.com to request a free key. Keys are in the format `sr_live_<32 hex chars>`. Pass it as a header on all scoring calls:
```
Authorization: Bearer sr_live_<your-key>
```

**Step 3 — Score an action before executing:**
```
POST https://www.sagereasoning.com/api/guardrail
Authorization: Bearer sr_live_<your-key>
Content-Type: application/json

{ "action": "your proposed action", "threshold": 60, "agent_id": "my-agent-v1" }
```
Returns `proceed: true/false` based on whether the action meets the virtue threshold.

---

## Full Endpoint Reference

| Endpoint | Auth required | What it does |
|----------|--------------|-------------|
| `GET /api/stoic-brain` | No | Full Stoic reasoning framework — load into context |
| `POST /api/guardrail` | **Yes** | Virtue-gate before any action. Returns `proceed`, scores, `recommendation`, `improvement_hint` |
| `POST /api/score-iterate` | **Yes** | Start or continue a deliberation chain. Full iterative scoring with history |
| `GET /api/baseline/agent` | No | Returns 4 ethical scenarios to establish baseline |
| `POST /api/baseline/agent` | **Yes** | Submit responses to 4 scenarios → receive baseline Stoic score and alignment tier |
| `GET /api/deliberation-chain/{id}` | No | Retrieve chain summary — score trajectory and net improvement |
| `POST /api/deliberation-chain/{id}/conclude` | No | Mark a deliberation chain as concluded or abandoned |

---

## How to Load the Stoic Brain

### Option A — API (recommended)
```
GET https://www.sagereasoning.com/api/stoic-brain
```
The response is self-describing — a `_meta` field explains what every section contains. No key required.

### Option B — File-based
Load directly from the public GitHub repo:
- `stoic-brain/stoic-brain.json` — master index and foundations
- `stoic-brain/virtues.json` — 4 cardinal virtues, 16 sub-virtue names (conceptual overview)
- `stoic-brain/indifferents.json` — classification of externals (preferred/dispreferred/neutral)

Public repo: `https://github.com/quartermileclint/stoic-brain` (SageReasoning Proprietary Licence)
Detailed scoring weights and sub-virtue analysis are provided through the API.

---

## Deliberation Chain — Iterative Scoring

The deliberation chain is the recommended pattern for complex decisions. Rather than scoring once and acting, the agent scores an action, receives feedback, revises, and re-scores — building a tracked record of ethical reasoning.

**Start a new chain:**
```json
POST /api/score-iterate
Authorization: Bearer sr_live_<your-key>

{
  "action": "Recommend the cheapest supplier to cut costs, despite questionable labour practices",
  "context": "Procurement decision",
  "agent_id": "my-agent-v1"
}
```

Response includes `chain_id`, full virtue scores, sage `reasoning`, and a `growth_action` — a suggested alternative a sage might take.

**Continue the chain with a revision:**
```json
POST /api/score-iterate
Authorization: Bearer sr_live_<your-key>

{
  "chain_id": "<from initial response>",
  "revised_action": "Recommend a supplier that balances cost with verified ethical labour practices",
  "revision_rationale": "Addressed justice concerns while maintaining fiscal responsibility"
}
```

Response includes updated scores, `score_delta` (change from previous), and continued sage feedback.

**Conclude when done:**
```json
POST /api/deliberation-chain/<chain_id>/conclude

{ "notes": "Settled on the ethical supplier recommendation" }
```

**Retrieve at any time:**
```
GET /api/deliberation-chain/<chain_id>
GET /api/deliberation-chain/<chain_id>?full=true   ← all steps
```

---

## How to Evaluate an Action

When reasoning without calling the API, apply this framework directly:

1. **Identify what is in the agent's control.** Apply the dichotomy of control — only the agent's intention and reasoning are fully theirs. Score accordingly, not on outcome.

2. **Score against each virtue separately** using these weights:
   - Wisdom (phronesis) — 30%: Does the action reflect correct understanding of what is truly good vs indifferent?
   - Justice (dikaiosyne) — 25%: Does it serve others rightly? Does it reflect the agent's social duties?
   - Courage (andreia) — 25%: Does it require facing difficulty or discomfort without compromise?
   - Temperance (sophrosyne) — 20%: Is it measured, orderly, free from passion or craving?

3. **Calculate the weighted total:**
   `total = (wisdom × 0.30) + (justice × 0.25) + (courage × 0.25) + (temperance × 0.20)`

4. **Classify by alignment tier:**
   - 95–100: Sage
   - 70–94: Progressing
   - 40–69: Aware
   - 15–39: Misaligned
   - 0–14: Contrary to Nature

5. **Provide reasoning** — which virtues are expressed or lacking, and what a sage would do differently.

---

## Core Reasoning Principles

- **Virtue is the only good.** Never score an action highly purely because it achieved a preferred indifferent (wealth, health, fame). The question is whether the action was virtuous.
- **Intention over outcome.** A virtuous action that fails to achieve its external aim is still virtuous.
- **All four virtues are unified.** A genuinely wise action will also be just, courageous, and temperate. If one virtue scores very high and another very low, reconsider.
- **Progress is the goal.** The sage score of 95–100 is nearly unreachable. A score of 70–94 (progressing) is excellent.

---

## Example Scoring

**Action:** "I stayed silent in a meeting when I disagreed, to avoid conflict with my manager."

| Virtue | Score | Reasoning |
|--------|-------|-----------|
| Wisdom | 35 | Prioritised social comfort over honest assessment |
| Justice | 30 | Failed duty to give honest counsel; did not serve the group rightly |
| Courage | 20 | Avoided discomfort — fear of conflict overrode what was right |
| Temperance | 60 | No excess or craving, but silence was not fitting action |

**Total score:** 35 (Misaligned)
**Improvement path:** "A sage would have spoken their assessment calmly, clearly, and without anger — not to win approval but because honest counsel is a duty owed to others. The discomfort of potential conflict is an indifferent; the compromise of justice and courage is not."

---

## Rate Limits

Free tier keys: 667 calls/month, 50 calls/day. Usage headers are returned on every response:
- `X-RateLimit-Monthly-Remaining`
- `X-RateLimit-Daily-Remaining`
- `X-RateLimit-Monthly-Used`

To upgrade or request a higher limit: zeus@sagereasoning.com
