# SageReasoning × OpenBrain Integration Specification

**Version:** 1.0.0
**Date:** 2026-04-02
**Status:** Specification — implementation to follow
**Applicable Rules:** R3, R4, R5, R8d, R9, R11, R12, R13

---

## 1. Strategic Context

OpenBrain is an emerging architecture pattern for persistent, agent-readable memory layers. Its pipeline flows: Capture → Sort → Structure → Retrieve → Act. SageReasoning provides the reasoning quality layer that this pipeline lacks. Where OpenBrain answers "what do I know?", SageReasoning answers "how should I think about what I know?"

This specification defines four deliverables that position SageReasoning as the composable reasoning layer for any OpenBrain-style stack, without requiring those builders to change their existing architecture.

---

## 2. Deliverable 1 — MCP Skill Contracts

### 2.1 Purpose

Expose SageReasoning skills as MCP-compatible tool definitions so that any agent with an MCP client can discover and invoke them. This is the primary integration surface for the OpenBrain community.

### 2.2 Contract Format

Each MCP skill contract follows the MCP tool schema:

```json
{
  "name": "sage-reason",
  "description": "Stoic reasoning evaluation — applies structured philosophical frameworks to assess reasoning quality of any input. Returns qualitative proximity level, passion diagnosis, and improvement path. Not therapeutic, clinical, or prescriptive (R1, R9).",
  "inputSchema": {
    "type": "object",
    "properties": {
      "input": {
        "type": "string",
        "description": "The action, decision, or text to evaluate"
      },
      "context": {
        "type": "string",
        "description": "Optional situational context"
      },
      "depth": {
        "type": "string",
        "enum": ["quick", "standard", "deep"],
        "default": "quick",
        "description": "Analysis depth: quick (3 mechanisms, ~$0.025, ~2s), standard (5 mechanisms, ~$0.041, ~3s), deep (6 mechanisms, ~$0.055, ~4s)"
      }
    },
    "required": ["input"]
  }
}
```

### 2.3 Skills Exposed via MCP

The following existing skills will have MCP contract definitions:

| MCP Tool Name | Maps To | OpenBrain Use Case |
|---|---|---|
| `sage-reason` | `/api/reason` | Universal reasoning layer — evaluate any input |
| `sage-guard` | `/api/guardrail` | Pre-action gate for agent loops (step 9) |
| `sage-prioritise` | `/api/skill/sage-prioritise` | Task ranking for proactive agents |
| `sage-classify` | NEW — see Deliverable 3 | AI Sorter reasoning for capture pipeline |
| `sage-score` | `/api/score` | Post-action evaluation |
| `sage-decide` | `/api/score-decision` | Multi-option comparison |
| `sage-reflect` | `/api/reflect` | End-of-day pattern review |

### 2.4 Discovery

MCP tools are registered via an MCP server configuration. The server exposes:

- Tool listing (all available sage skills)
- Tool invocation (routes to existing API endpoints)
- Authentication pass-through (Bearer token from MCP client config)

### 2.5 Implementation Approach

Create `website/src/lib/mcp-contracts.ts` that:

1. Generates MCP tool schemas from the existing `SKILL_REGISTRY`
2. Maps MCP tool invocations to existing API endpoint calls
3. Wraps responses in MCP-compliant format while preserving the reasoning receipt (Deliverable 2)

This avoids duplicating skill definitions — the skill registry remains the single source of truth.

---

## 3. Deliverable 2 — Reasoning Receipt Format

### 3.1 Purpose

Extend the existing response envelope (`response-envelope.ts`) with a structured reasoning trace. This maps to OpenBrain's immutable log concept (step 5) but adds a dimension they don't have: not just what happened, but why.

### 3.2 Receipt Structure

```typescript
type ReasoningReceipt = {
  /** Unique receipt identifier */
  receipt_id: string

  /** ISO 8601 timestamp */
  timestamp: string

  /** Which sage skill produced this receipt */
  skill_id: string

  /** The input that was evaluated */
  input_summary: string

  /** Which Stoic mechanisms were applied */
  mechanisms_applied: string[]

  /** The reasoning trace — ordered steps showing the evaluation path */
  reasoning_trace: ReasoningStep[]

  /** Final proximity determination */
  proximity: KatorthomaProximityLevel

  /** Passions identified (if any) */
  passions_detected: PassionDetection[]

  /** Whether the reasoning was deemed appropriate action */
  is_kathekon: boolean | null

  /** What the sage would recommend next */
  recommended_next: string | null

  /** Chain reference if part of a deliberation */
  chain_id: string | null

  /** R3 disclaimer — always present */
  disclaimer: string
}

type ReasoningStep = {
  /** Which stage of the evaluation (1-4) */
  stage: number

  /** Stage name (prohairesis_filter, kathekon_assessment, passion_diagnosis, virtue_assessment) */
  stage_name: string

  /** What this stage determined */
  determination: string

  /** Which V3 data file(s) this traces to (R7) */
  source_files: string[]
}

type PassionDetection = {
  /** Root passion identifier */
  root_passion: 'epithumia' | 'hedone' | 'phobos' | 'lupe'

  /** Specific sub-species */
  sub_species: string

  /** The false judgement driving this passion */
  false_judgement: string

  /** Which stage caught it */
  detected_at_stage: number
}
```

### 3.3 Integration with Existing Envelope

The receipt extends `ApiResponseEnvelope` — it does NOT replace it. The existing `meta` block (cost, latency, composability, usage) remains unchanged. The receipt lives inside the `result` block as an optional `reasoning_receipt` field.

```typescript
type SageResult<T = unknown> = T & {
  reasoning_receipt?: ReasoningReceipt
}
```

### 3.4 When Receipts Are Generated

- **Always:** `sage-reason` (all depths), `sage-score`, `sage-guard`, `sage-decide`
- **Per-participant:** `sage-converse` (one receipt per participant)
- **Per-iteration:** `sage-iterate` (one receipt per deliberation step)
- **Never:** `sage-context` (deterministic, no reasoning involved)

### 3.5 OpenBrain Compatibility

Receipts are designed to be stored directly in an OpenBrain structured table. The `receipt_id` serves as a primary key, the `mechanisms_applied` array enables semantic search, and the `reasoning_trace` provides the audit trail that OpenBrain's immutable log pattern requires.

---

## 4. Deliverable 3 — Classification Reasoning Wrapper

### 4.1 Purpose

OpenBrain's AI Sorter (step 4) classifies inputs and routes them to structured tables. Currently this uses raw LLM calls with no principled evaluation framework. This wrapper adds Stoic reasoning to the classification decision.

### 4.2 The Problem It Solves

A raw LLM classifying "I should quit my job" might route it to a "career" table. A sage-reasoned classifier would additionally note: this is driven by a passion (phobos or lupe), the decision is outside prohairesis in key respects, and the appropriate action is to first evaluate the reasoning quality before acting on the content.

### 4.3 Skill Definition

```json
{
  "id": "sage-classify",
  "name": "sage-classify",
  "tier": "tier2_evaluation",
  "outcome": "Reasoned classification — routes input to a category with reasoning quality assessment and passion flags.",
  "cost_speed": "~$0.025, ~2s",
  "chains_to": ["sage-reason-standard", "sage-prioritise"],
  "endpoint": "/api/skill/sage-classify",
  "method": "POST",
  "auth_required": true,
  "mechanisms": ["control_filter", "passion_diagnosis", "oikeiosis"],
  "mechanism_count": 3
}
```

### 4.4 Input Schema

```typescript
type SageClassifyRequest = {
  /** The raw input to classify */
  input: string

  /** Available categories the input can be routed to */
  categories: ClassifyCategory[]

  /** Optional context about the user or system state */
  context?: string

  /** Confidence threshold — below this, input stays in inbox */
  confidence_threshold?: number
}

type ClassifyCategory = {
  /** Category identifier (maps to OpenBrain table name) */
  id: string

  /** Human-readable label */
  label: string

  /** What belongs in this category */
  description: string
}
```

### 4.5 Output Schema

```typescript
type SageClassifyResponse = {
  /** Assigned category (or null if below confidence threshold) */
  category: string | null

  /** Classification confidence (0.0 - 1.0) */
  confidence: number

  /** Why this category was chosen — Stoic reasoning applied */
  reasoning: string

  /** Reasoning quality of the input itself */
  input_proximity: KatorthomaProximityLevel

  /** Passions detected in the input content */
  passions_detected: PassionDetection[]

  /** Whether the input content describes appropriate action */
  is_kathekon: boolean | null

  /** Priority signal based on oikeiosis (which circle of concern) */
  oikeiosis_stage: number

  /** Suggested action: classify, hold_for_review, flag_urgent, defer */
  action: 'classify' | 'hold_for_review' | 'flag_urgent' | 'defer'

  /** Reasoning receipt (Deliverable 2) */
  reasoning_receipt: ReasoningReceipt

  /** R3 disclaimer */
  disclaimer: string
}
```

### 4.6 How It Fits OpenBrain

The wrapper replaces the raw LLM call in OpenBrain's step 4. The OpenBrain builder:

1. Sends input + their category definitions to `sage-classify`
2. Receives the classification PLUS reasoning quality assessment
3. Routes to the appropriate table as before
4. Stores the reasoning receipt in the immutable log (step 5)
5. The passion flags and oikeiosis stage become searchable metadata

This means their structured tables gain a reasoning quality dimension that pure classification doesn't provide.

---

## 5. Deliverable 4 — Prioritisation Framework

### 5.1 Purpose

Extend the existing `sage-prioritise` skill into a full prioritisation service that OpenBrain agents can call during their proactive loops (step 9). This is also the core engine for the Zeus use case.

### 5.2 Current State

`sage-prioritise` already exists in the skill registry with 3 mechanisms (control_filter, passion_diagnosis, oikeiosis). It evaluates whether prioritisation reasoning is passion-driven. What it lacks is the ability to actually rank items with reasoning traces.

### 5.3 Enhanced Input Schema

```typescript
type SagePrioritiseRequest = {
  /** Items to prioritise (2-20) */
  items: PriorityItem[]

  /** What the prioritisation serves (goal context) */
  objective?: string

  /** Who is affected by these priorities */
  stakeholders?: string

  /** Time horizon: immediate, today, this_week, this_month, this_quarter */
  horizon?: 'immediate' | 'today' | 'this_week' | 'this_month' | 'this_quarter'

  /** Agent or user identifier for tracking */
  agent_id?: string
}

type PriorityItem = {
  /** Unique item identifier */
  id: string

  /** Item description */
  description: string

  /** Optional: source project or category */
  source?: string

  /** Optional: current urgency signal from the source system */
  urgency_signal?: string
}
```

### 5.4 Enhanced Output Schema

```typescript
type SagePrioritiseResponse = {
  /** Items in priority order (highest first) */
  ranked_items: RankedItem[]

  /** Overall assessment of the priority list */
  overall_assessment: string

  /** Patterns detected across items (urgency addiction, avoidance, etc.) */
  patterns_detected: string[]

  /** Reasoning receipt */
  reasoning_receipt: ReasoningReceipt

  /** R3 disclaimer */
  disclaimer: string
}

type RankedItem = {
  /** Item ID from input */
  id: string

  /** Priority rank (1 = highest) */
  rank: number

  /** Why this item ranks here — Stoic reasoning */
  reasoning: string

  /** Is this item within prohairesis? */
  within_control: boolean

  /** Oikeiosis stage (1-5) — which circle of concern */
  oikeiosis_stage: number

  /** Passions that might be inflating/deflating this item's priority */
  passions_detected: PassionDetection[]

  /** Is pursuing this item an appropriate action? */
  is_kathekon: boolean

  /** Suggested action for this item */
  action: 'do_now' | 'schedule' | 'delegate' | 'defer' | 'reconsider'
}
```

### 5.5 Zeus Application

For the Zeus/CoLab use case, the prioritisation framework:

1. Pulls tasks from across all projects (read access)
2. Adds context about Clinton's stated goals and current focus
3. Calls `sage-prioritise` with the full list
4. Returns a reasoned daily briefing with ranked items
5. Items marked `do_now` get drafted/actioned where sage capabilities allow
6. Items marked `reconsider` get flagged with passion analysis

### 5.6 OpenBrain Application

For OpenBrain builders, this replaces ad-hoc urgency-based prioritisation in their proactive agent loops. The oikeiosis staging is particularly valuable — it prevents agents from spending all their cycles on self-referential tasks (stage 1) while ignoring community obligations (stage 3-4).

---

## 6. Architecture Summary

```
OpenBrain Pipeline          SageReasoning Layer
==================          ===================

[Capture/Inbox]
      │
      ▼
[AI Sorter] ──────────────► sage-classify (Deliverable 3)
      │                      Returns: category + reasoning quality + receipt
      ▼
[Structured Tables] ◄────── reasoning_receipt stored alongside data (Deliverable 2)
      │
      ▼
[Semantic Retrieval]
      │
      ▼
[Agent Proactive Loop] ───► sage-prioritise (Deliverable 4)
      │                      sage-guard (pre-action gate)
      │                      sage-reason (evaluate decisions)
      │                      sage-decide (compare options)
      ▼
[Actions/Output] ─────────► sage-score (post-action audit)
                             sage-iterate (if below threshold)

MCP Layer (Deliverable 1) wraps all of the above for tool discovery.
```

---

## 7. Implementation Plan

### Phase 1: Types and Contracts (no API changes)

1. `reasoning-receipt.ts` — Receipt type definitions and builder function
2. `mcp-contracts.ts` — MCP tool schema generator from SKILL_REGISTRY
3. `sage-classify.ts` — Classification wrapper types and prompt
4. Extend `sage-prioritise` input/output types in skill registry

### Phase 2: API Routes

5. `POST /api/skill/sage-classify` — Classification endpoint
6. Enhanced `POST /api/skill/sage-prioritise` — Full prioritisation endpoint
7. `GET /api/mcp/tools` — MCP tool discovery endpoint

### Phase 3: Integration Aids

8. Updated WRAPPER-TEMPLATE.md with OpenBrain-specific example
9. `openbrain-quickstart.md` in public/wrappers/ — setup guide for OpenBrain builders

---

## 8. Compliance Check

| Rule | Application |
|---|---|
| R1 | No therapeutic implication in any classification or prioritisation output |
| R3 | Disclaimer on all evaluative output including receipts |
| R4 | Receipts expose reasoning traces but not prompt templates or scoring logic |
| R5 | sage-classify and sage-prioritise consume 1 API call each against monthly allowance |
| R8d | MCP contracts use plain English, outcome-focused descriptions |
| R9 | Prioritisation evaluates reasoning quality, does not promise outcomes |
| R11 | Wrapper patterns remain open source; evaluation logic stays server-side |
| R12 | sage-classify uses 3 mechanisms (control_filter, passion_diagnosis, oikeiosis); sage-prioritise uses 3 mechanisms — both meet the ≥2 threshold |
| R13 | OpenBrain platforms embedding these must comply with R1, R2, R3, R9 |
