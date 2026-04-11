# SageReasoning — Technical State
**Last updated:** 11 April 2026 · Session 11  
**Status vocabulary:** Scoped → Designed → Scaffolded → Wired → Verified → Live  
**Purpose:** Shared context layer for Tech, Growth, and Support agents. Authoritative reference for architectural state. Update after any endpoint, schema, or env-var change.

---

## 1. The `runSageReason()` Function

**File:** `website/src/lib/sage-reason-engine.ts`  
**Role:** Single source of truth for all Stoic 4-stage reasoning. All 9 core LLM-calling endpoints route through this function (or are refactored to do so). Changes to prompt logic, depth configuration, or context injection happen here and propagate everywhere.

**Shared Anthropic client:** Singleton instance (`getClient()`). Replaces the 24 separate `new Anthropic()` calls that existed before Session 6. Enables connection pooling.

**Depth levels and mechanisms:**

| Depth | Mechanisms (count) | Model |
|---|---|---|
| `quick` | control_filter, passion_diagnosis, oikeiosis (3) | `MODEL_FAST` (claude-haiku) |
| `standard` | + value_assessment, kathekon_assessment (5) | `MODEL_FAST` |
| `deep` | + iterative_refinement (6) | `MODEL_DEEP` (claude-sonnet) |

**Extended inputs (added 8 April):**
- `urgency_context` — triggers hasty assent (propeteia) scrutiny; adds `meta.hasty_assent_risk`
- `stoicBrainContext` — override Stoic Brain injection (set to `''` to disable)
- `practitionerContext` — Layer 2b: condensed profile prepended to user message
- `projectContext` — Layer 2: project state at appropriate detail level
- `agentBrainContext` — Layer 3: domain brain as third system block
- `environmentalContext` — Layer 4: weekly environmental scan data
- `mentorKnowledgeBase` — Layer 5: Stoic historical context + global state briefings
- `systemPromptOverride` — complete system prompt replacement (mentor endpoints only)

**Meta output fields:**
- `stage_scores` — per-stage quality ratings (`strong` / `adequate` / `weak` / `not_applied`)
- `hasty_assent_risk` — `high` / `moderate` / `low` / `none` when urgency_context provided
- `urgency_applied` — boolean flag

---

## 2. The 9 `runSageReason` Endpoints

These are the endpoints that call `runSageReason()` from `sage-reason-engine.ts`. All other LLM-calling endpoints (mentor, private mentor) use `systemPromptOverride` and are documented separately.

### 2.1 POST /api/score
**Purpose:** Evaluate a single past action through the Stoic virtue framework.  
**Auth:** Supabase JWT (required)  
**Rate limit:** 15 req/min (RATE_LIMITS.scoring)  
**Depth:** standard (5 mechanisms)  
**Model:** MODEL_FAST  
**Context layers:** L1 Stoic Brain (standard), L2b Practitioner (condensed)  
**Status:** Wired

**Input:**
```json
{
  "action_description": "string (required)",
  "context": "string (optional)",
  "intended_outcome": "string (optional)",
  "relationships": "string[] (optional)",
  "emotional_state": "string (optional)",
  "prior_feedback": "string (optional)"
}
```

**Output (normalised):**
```json
{
  "virtue_quality": {
    "katorthoma_proximity": "reflexive|habitual|deliberate|principled|sage_like",
    "ruling_faculty_state": "string",
    "virtue_domains_engaged": ["phronesis", "..."]
  },
  "control_filter": { "within_prohairesis": [], "outside_prohairesis": [] },
  "passion_diagnosis": { "passions_detected": [], "false_judgements": [], "causal_stage_affected": "..." },
  "oikeiosis": { "relevant_circles": [], "deliberation_notes": "..." },
  "value_assessment": { "indifferents_at_stake": [], "value_error": null },
  "kathekon_assessment": { "is_kathekon": true, "quality": "strong|moderate|marginal|contrary", "justification": "..." },
  "oikeiosis_context": "string",
  "philosophical_reflection": "string",
  "improvement_path": "string",
  "disclaimer": "Ancient reasoning, modern application..."
}
```

**Side effects:** None — does not insert to `analytics_events`. (Confirmed by code review, April 2026.)

---

### 2.2 POST /api/reason
**Purpose:** Universal reasoning layer — run the Stoic core triad (or more) against any decision input. The canonical "clean" endpoint. All sage skills call this or use the engine directly.  
**Auth:** Supabase JWT OR API key (both accepted)  
**Rate limit:** 15 req/min (RATE_LIMITS.scoring)  
**Depth:** Caller-specified (`quick` | `standard` | `deep`)  
**Model:** MODEL_FAST (quick/standard), MODEL_DEEP (deep)  
**Context layers:** L1 Stoic Brain (depth-matched), L2b Practitioner (when user-authenticated)  
**Status:** Wired

**Input:**
```json
{
  "input": "string (required)",
  "context": "string (optional)",
  "depth": "quick|standard|deep (default: standard)",
  "domain_context": "string (optional — injected by sage skills)",
  "urgency_context": "string (optional)"
}
```

**Output:** Full `ReasonResult` structure. `result` field shape varies by depth. All depths return `katorthoma_proximity`, `control_filter`, `passion_diagnosis`, `oikeiosis`, `philosophical_reflection`, `improvement_path`, `disclaimer`.

**Governance compliance:** R3 (disclaimer), R4 (server-side prompt), R6a–R6d (V3 qualitative only), R7, R8a.

---

### 2.3 POST /api/score-decision
**Purpose:** Score multiple options for a decision using V3 4-stage evaluation. Ranks options by Stoic alignment.  
**Auth:** Supabase JWT (required)  
**Rate limit:** 15 req/min  
**Depth:** standard  
**Model:** MODEL_FAST  
**Context layers:** L1 Stoic Brain (standard), L2b Practitioner (condensed)  
**Status:** Wired

**Input:**
```json
{
  "decision_context": "string (required)",
  "options": ["string", "..."] "(required, array of options to rank)",
  "process": "string (optional — description of how options were identified; triggers process quality assessment)"
}
```

**Output:** Array of option evaluations + process quality fields (when `process` provided):
```json
{
  "evaluations": [{ "option": "...", "katorthoma_proximity": "...", "kathekon": true, "passion_risks": [], "sage_framing": "..." }],
  "recommended_option": "string",
  "process_quality": "thorough|adequate|hasty (optional)",
  "process_described": true
}
```

**Side effects:** Inserts to `analytics_events` (event_type: `decision_score_v3`).

---

### 2.4 POST /api/score-social
**Purpose:** Evaluate social media posts, messages, or communications for Stoic alignment before publishing.  
**Auth:** Supabase JWT (required)  
**Rate limit:** 15 req/min  
**Depth:** standard  
**Model:** MODEL_FAST  
**Context layers:** L1 Stoic Brain (standard), L2b Practitioner (condensed)  
**Status:** Wired  

**Input:**
```json
{
  "content": "string (required — the post/message to evaluate)",
  "platform": "string (optional — context for tone appropriateness)",
  "intended_audience": "string (optional)"
}
```

**Output:** Stoic alignment evaluation of the communication including passion detection in language choices, kathekon assessment for the social context, and improvement suggestions.

---

### 2.5 POST /api/score-document
**Purpose:** Evaluate a document (plan, proposal, analysis) for Stoic reasoning quality.  
**Auth:** Supabase JWT (required)  
**Rate limit:** 15 req/min  
**Depth:** deep (6 mechanisms — documents warrant full analysis)  
**Model:** MODEL_DEEP  
**Context layers:** L1 Stoic Brain (deep), L2b Practitioner (condensed)  
**Status:** Wired  
**Note:** Cleaned in Session 9 — Tech Brain removed. Stoic Brain + Practitioner only.

**Input:**
```json
{
  "document": "string (required)",
  "document_type": "string (optional — plan|proposal|analysis|other)",
  "evaluation_focus": "string (optional)"
}
```

**Output:** Document-level evaluation including reasoning quality assessment, passion patterns in the document's logic, and structural improvement path.

**Persistence:** Document evaluations stored with associated `id`; retrievable via `GET /api/score-document/{id}`.

---

### 2.6 POST /api/score-scenario
**Purpose:** Evaluate a hypothetical scenario or future decision for Stoic alignment. Used for pre-mortem analysis.  
**Auth:** Supabase JWT OR API key  
**Rate limit:** 15 req/min  
**Depth:** quick (3 mechanisms — scenarios need speed)  
**Model:** MODEL_FAST  
**Context layers:** L1 Stoic Brain (quick), L2b Practitioner (condensed)  
**Status:** Wired  
**Note:** Cleaned in Session 9 — Growth Brain removed. Stoic Brain + Practitioner only.

**Input:**
```json
{
  "scenario": "string (required)",
  "context": "string (optional)"
}
```

**Output:** Scenario evaluation at quick depth — prohairesis filter, passion diagnosis, oikeiosis assessment, katorthoma proximity estimate.

---

### 2.7 POST /api/score-iterate (Deliberation Engine)
**Purpose:** Start or continue an iterative deliberation chain. Agents revise actions across multiple turns with full history awareness.  
**Auth:** API key (free tier: 1 initial + no iterations; paid tier: 1 initial + 3 iterations per chain)  
**Rate limit:** 30 req/min (RATE_LIMITS.publicAgent)  
**Depth:** standard  
**Model:** MODEL_FAST  
**Context layers:** L1 Stoic Brain (standard). No practitioner — agent-facing.  
**Status:** Wired  
**Note:** Stateful — chains persist in `deliberation_chains` table. Cleaned in Session 9 — Tech Brain removed.

**Input (start chain):**
```json
{
  "action": "string (required)",
  "context": "string (optional)",
  "intended_outcome": "string (optional)",
  "agent_id": "string (optional)"
}
```

**Input (continue chain):**
```json
{
  "chain_id": "uuid (required)",
  "revised_action": "string (required)"
}
```

**Output:**
```json
{
  "chain_id": "uuid",
  "step_number": 1,
  "evaluation": { "katorthoma_proximity": "...", "...": "..." },
  "sage_feedback": "string",
  "growth_action": "string"
}
```

**Related endpoints (non-LLM):**
- `GET /api/deliberation-chain/{id}` — retrieve chain summary
- `POST /api/deliberation-chain/{id}/conclude` — conclude or abandon chain

---

### 2.8 POST /api/guardrail
**Purpose:** Evaluate a proposed agent action before execution. The AI safety checkpoint.  
**Auth:** API key (any tier) OR Supabase JWT  
**Rate limit:** 30 req/min (RATE_LIMITS.publicAgent)  
**Depth:** Auto-selected by `risk_class` parameter (added 8 April):
  - `standard` → quick (3 mechanisms)
  - `elevated` → standard (5 mechanisms)  
  - `critical` → deep (6 mechanisms)  
**Model:** MODEL_FAST (standard/elevated), MODEL_DEEP (critical)  
**Context layers:** L1 Stoic Brain (depth-matched). No practitioner. No agent brains.  
**Status:** Wired  
**Note:** Extended 8 April with `risk_class`, `deliberation_quality`, `considered_alternatives`, `rollback_path` (Critical only). Cleaned Session 8 — Ops/Tech/Growth Brains removed.

**Input:**
```json
{
  "proposed_action": "string (required)",
  "context": "string (optional)",
  "risk_class": "standard|elevated|critical (default: standard)",
  "urgency_context": "string (optional)",
  "considered_alternatives": ["string"] "(optional — for Critical actions)"
}
```

**Output:**
```json
{
  "recommendation": "proceed|pause_for_review|do_not_proceed",
  "deliberation_quality": "thorough|adequate|hasty|impulsive",
  "katorthoma_proximity": "...",
  "passion_warnings": [],
  "alternatives_warning": "string (if Critical + no alternatives provided)",
  "rollback_path": "string (if Critical)",
  "disclaimer": "..."
}
```

**Side effects:** Inserts to `analytics_events` (event_type: `guardrail_check`) including `api_key_id` when called via API key.

---

### 2.9 POST /api/evaluate
**Purpose:** Free-tier agent evaluation using V3 4-stage sequence. Accepts structured self-assessment responses.  
**Auth:** API key (free tier accepted)  
**Rate limit:** 30 req/min  
**Depth:** quick  
**Model:** MODEL_FAST  
**Context layers:** L1 Stoic Brain (quick). No practitioner. No agent brains.  
**Status:** Wired  
**Note:** Cleaned Session 8 — all agent brains removed.

**Input:**
```json
{
  "responses": [{ "question_id": "string", "response": "string" }],
  "agent_id": "string (optional)"
}
```

**Output:** V3 foundational evaluation profile — Senecan grade estimate, katorthoma proximity summary, initial passions detected, personalised next-step CTA.

---

## 3. Non-`runSageReason` LLM Endpoints (Mentor Family)

These use `systemPromptOverride` rather than calling `runSageReason()` directly. They use their own Anthropic client calls or the engine with a full prompt override.

| Route | Auth | Depth | Context Layers | Status |
|---|---|---|---|---|
| POST /api/reflect | JWT (required) | deep | L1 Stoic Brain (deep), L2b Practitioner (full via private mentor) | Wired |
| POST /api/mentor-baseline | JWT (required) | deep | L1 Stoic Brain (deep), profile summary as input | Wired |
| POST /api/mentor-baseline-response | JWT (required) | deep | L1 Stoic Brain (deep), profile loaded from Supabase | Wired |
| POST /api/mentor-journal-week | JWT (required) | deep | L1 Stoic Brain (deep), profile summary as input | Wired |
| POST /api/mentor/private/reflect | JWT + FOUNDER_USER_ID | deep | L1+L2+L2b full+L5+observations+journal refs | Wired |
| POST /api/mentor/private/baseline | JWT + FOUNDER_USER_ID | deep | L1+L2+L2b full+L5 | Wired |
| POST /api/mentor/private/baseline-response | JWT + FOUNDER_USER_ID | deep | L1+L2+L2b full+L5 | Wired |
| POST /api/mentor/private/journal-week | JWT + FOUNDER_USER_ID | deep | L1+L2+L2b full+L5+journal refs | Wired |

**Private mentor accumulation features (added Session 10):**
- Full practitioner profile (~7,500 chars) vs condensed (~300-500 tokens) for public
- Mentor observation persistence (LLM outputs `mentor_observation` → `mentor_interactions` table)
- Journal reference recall (topic-tagged cross-references via `mentor_journal_refs` table)
- Temporal profile snapshots (`mentor_profile_snapshots` table)
- Baseline auto-save (baseline-response records interaction + creates snapshot automatically)

---

## 4. Agent Assessment Endpoints (non-runSageReason, agent-facing)

| Route | Method | Auth | Rate Limit | Status |
|---|---|---|---|---|
| /api/assessment/foundational | GET | None | — | Wired |
| /api/assessment/foundational | POST | API key (free) | 30/min | Wired |
| /api/assessment/full | GET | None | — | Wired |
| /api/assessment/full | POST | API key (paid only) | 30/min | Wired |
| /api/baseline/agent | GET | None | — | Wired |
| /api/baseline/agent | POST | API key (any) | 1 initial + 1 retake/month/agent_id | Wired |

---

## 5. Database Schema (Supabase — Production)

### Core Tables

#### `profiles`
Supabase Auth users extended profile. RLS: users access own row.

| Column | Type | Notes |
|---|---|---|
| id | UUID | FK → auth.users |
| email | TEXT | User email |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

#### `mentor_profiles`
Practitioner's Stoic profile — the core intimate data store. **Encrypted at application level (R17b — implementation pending).**  
RLS: enabled, users access own row.

| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| user_id | UUID | FK → auth.users, UNIQUE |
| proximity_level | TEXT | reflexive/habitual/deliberate/principled/sage_like |
| dominant_passions | JSONB | Array of passion ids |
| weakest_virtue | TEXT | phronesis/dikaiosyne/andreia/sophrosyne |
| causal_breakdown | JSONB | Distribution across phantasia/synkatathesis/horme/praxis |
| virtue_scores | JSONB | Per-virtue contextual assessment |
| passion_map | JSONB | Full passion occurrence map |
| profile_summary | TEXT | Condensed text (~300-500 tokens) for context injection |
| oikeiosis_map | JSONB | Circle-by-circle obligation assessment |
| rolling_window | JSONB | Recent interaction patterns for dynamic assessment |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

**Encryption status:** Wired (R17b). Server-side AES-256-GCM via `server-encryption.ts` + `mentor-profile-store.ts`. All profile reads/writes go through the encrypted pipeline when `MENTOR_ENCRYPTION_KEY` is set. Client-side encryption (`encryption.ts`) remains scaffolded for future journal entry protection.

#### `mentor_interactions`
Rolling log of mentor interactions — observation persistence added Session 10.  
RLS: enabled, users access own row.

| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| user_id | UUID | FK → auth.users |
| interaction_type | TEXT | reflection/baseline/journal_week/journal_day |
| mentor_observation | TEXT | LLM-generated observation (new — Session 10) |
| passions_detected | JSONB | Passions from this interaction |
| proximity_assessed | TEXT | Proximity level for this interaction |
| session_id | TEXT | Optional session grouping |
| journal_reference_id | TEXT | FK → mentor_journal_refs (optional) |
| created_at | TIMESTAMPTZ | |

#### `mentor_journal_refs`
Topic-tagged cross-references to journal entries — journal reference recall added Session 10.  
RLS: enabled, users access own row.

| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| user_id | UUID | FK → auth.users |
| topic_tags | TEXT[] | Topics for keyword search |
| journal_excerpt | TEXT | Relevant excerpt |
| source_date | DATE | Date of original journal entry |
| interaction_id | UUID | FK → mentor_interactions |
| created_at | TIMESTAMPTZ | |

#### `mentor_profile_snapshots`
Temporal snapshots of practitioner profile at key moments — added Session 10.  
RLS: enabled, users access own row.

| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| user_id | UUID | FK → auth.users |
| snapshot_reason | TEXT | baseline/journal_week/manual |
| profile_state | JSONB | Full profile at time of snapshot |
| proximity_at_snapshot | TEXT | Proximity level at snapshot time |
| created_at | TIMESTAMPTZ | |

#### `mentor_raw_inputs`
OpenBrain immutable receipt — append-only semantic memory store. pgvector enabled.  
RLS: enabled, users access own row.

| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| user_id | UUID | FK → auth.users |
| source | TEXT | support/journal/proactive/decision_gate/reflection/lead/notification/workflow |
| content | TEXT | Raw input content |
| content_hash | TEXT | Deduplication |
| embedding | vector(1536) | For semantic search via `search_mentor_memory()` |
| metadata | JSONB | Flexible metadata |
| created_at | TIMESTAMPTZ | Append-only, never updated |

**Index:** `ivfflat (embedding vector_cosine_ops)` with `lists = 100`.  
**Function:** `search_mentor_memory(query_embedding, match_threshold, match_count, user_id)` — returns similar past interactions by cosine similarity.

---

### API Key Tables

#### `api_keys`
Issued to agent developers. Key never stored in plaintext.  
RLS: enabled but admin-only (all access via service role server-side).

| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| key_hash | TEXT | SHA-256 hex hash of raw key |
| key_prefix | TEXT | First 14 chars shown to owner |
| label | TEXT | Human name (e.g. "My Agent v1") |
| agent_id | TEXT | Optional self-reported agent identifier |
| owner_email | TEXT | Contact when approaching limits |
| owner_user_id | UUID | FK → profiles.id (nullable) |
| tier | TEXT | free / paid |
| monthly_limit | INTEGER | Free: 30. Paid: 10,000 (configurable) |
| daily_limit | INTEGER | Free: 1. Paid: 500 (configurable) |
| max_chain_iterations | INTEGER | Free: 1. Paid: 3 |
| is_active | BOOLEAN | |
| suspended_reason | TEXT | Populated if manually suspended |
| created_at | TIMESTAMPTZ | |
| last_used_at | TIMESTAMPTZ | Updated on each use |
| notes | TEXT | Internal notes |

#### `api_key_usage`
Monthly usage buckets. One row per (api_key_id, year, month). Atomic increments.

| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| api_key_id | UUID | FK → api_keys |
| year | INTEGER | |
| month | INTEGER | 1–12 |
| total_calls | INTEGER | Monthly counter |
| guardrail_calls | INTEGER | Per-endpoint breakdown |
| score_iterate_calls | INTEGER | |
| agent_baseline_calls | INTEGER | |
| other_calls | INTEGER | |
| current_day | INTEGER | Day of month for daily reset |
| daily_calls | INTEGER | Calls on current_day |
| updated_at | TIMESTAMPTZ | |

**Unique constraint:** (api_key_id, year, month)  
**Function:** `increment_api_usage(p_api_key_id, p_year, p_month, p_day, p_endpoint)` — atomic increment, returns new monthly/daily totals and limits.  
**View:** `api_key_usage_current` — convenience view of current month usage per key.

---

### Session Bridge Tables

#### `session_decisions`
Strategic decision log from Cowork sessions. Ring evaluation results stored.  
RLS: enabled, users access own row.

| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| user_id | UUID | FK → auth.users |
| session_id | TEXT | |
| session_mode | TEXT | observer/consultant/companion |
| decision_type | TEXT | architecture/pricing/positioning/partnership/scope/compliance/risk/document_review/other |
| description | TEXT | |
| context_summary | TEXT | |
| proximity_assessed | TEXT | reflexive/.../sage_like |
| passions_detected | JSONB | |
| false_judgements | JSONB | |
| mechanisms_applied | TEXT[] | |
| mentor_observation | TEXT | |
| journal_reference_id | TEXT | |
| outcome_notes | TEXT | Filled in later |
| outcome_assessed_at | TIMESTAMPTZ | |
| created_at / updated_at | TIMESTAMPTZ | |

#### `session_context_snapshots`
Project context at time of decision.  
RLS: enabled, users access own row.

| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| user_id | UUID | FK → auth.users |
| session_decision_id | UUID | FK → session_decisions (CASCADE DELETE) |
| snapshot_type | TEXT | knowledge_context/v3_scope_status/business_plan/custom |
| content_hash | TEXT | |
| summary | TEXT | |
| created_at | TIMESTAMPTZ | |

---

### Support Agent Tables

#### `support_interactions`
Support agent operational log. Local markdown files are canonical; Supabase holds synced persistent record.  
RLS: enabled, users access own row.

| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| user_id | UUID | FK → auth.users |
| interaction_id | TEXT | UNIQUE — matches markdown file id |
| channel | TEXT | email/chat/api/social/form |
| status | TEXT | open/in_progress/resolved/escalated |
| customer_id | TEXT | |
| subject | TEXT | |
| raw_content | TEXT | |
| draft_response | TEXT | |
| ring_evaluation | JSONB | Ring AFTER check results |
| resolved_at | TIMESTAMPTZ | |
| created_at / updated_at | TIMESTAMPTZ | |

#### `support_token_usage`
Token usage per support interaction, per ring phase.  
RLS: enabled, users access own row.

| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| user_id | UUID | FK → auth.users |
| interaction_id | TEXT | FK → support_interactions |
| model | TEXT | |
| model_tier | TEXT | fast / deep |
| input_tokens | INTEGER | |
| output_tokens | INTEGER | |
| estimated_cost | NUMERIC(10,6) | |
| phase | TEXT | BEFORE / AFTER / draft |
| created_at | TIMESTAMPTZ | |

#### `support_pattern_summaries`
Pattern engine output — weekly/monthly/quarterly summaries.  
RLS: enabled, users access own row.

| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| user_id | UUID | FK → auth.users |
| summary_type | TEXT | weekly/monthly/quarterly |
| period_start / period_end | DATE | |
| total_interactions | INTEGER | |
| resolution_rate | NUMERIC(5,2) | |
| escalation_rate | NUMERIC(5,2) | |
| top_topics | JSONB | |
| ring_observations | JSONB | |
| created_at | TIMESTAMPTZ | |

---

### Analytics Table

#### `analytics_events`
Lightweight event tracking. Not a CRM — no personal data beyond user_id.

| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| event_type | TEXT | action_score / decision_score_v3 / daily_reflection / guardrail_check / deliberation_conclude / agent_baseline / ... |
| user_id | UUID | Nullable (anonymous events possible) |
| api_key_id | UUID | Nullable — FK → api_keys (added in api-keys-schema migration) |
| metadata | JSONB | Event-specific data (no personal content) |
| created_at | TIMESTAMPTZ | |

**Support agent category tracking:** The `event_type` field is used for 30-day rolling category tracking. The Support agent's 20% threshold trigger (flagging when any category exceeds 20% of interactions in a 30-day window) is computed by querying: `SELECT event_type, COUNT(*) as n FROM analytics_events WHERE created_at > NOW() - INTERVAL '30 days' GROUP BY event_type`. The `analytics_events` table structure **does support** this query. Threshold logic must be implemented in the Support agent's pattern engine — it is not currently wired.

---

### Deliberation Chain Tables

#### `deliberation_chains`
Persists iterative agent deliberation chains for score-iterate endpoint.

| Column | Type | Notes |
|---|---|---|
| id | UUID | PK (chain_id) |
| api_key_id | UUID | FK → api_keys (nullable for JWT auth) |
| agent_id | TEXT | Self-reported |
| status | TEXT | active / concluded / abandoned |
| step_count | INTEGER | Current iteration count |
| max_iterations | INTEGER | From API key tier |
| first_action | TEXT | Original submitted action |
| latest_proximity | TEXT | Most recent katorthoma_proximity |
| steps | JSONB | Array of all evaluation steps |
| created_at / updated_at | TIMESTAMPTZ | |

---

### RLS Status Summary

| Table | RLS Enabled | Policy |
|---|---|---|
| profiles | Yes | Own row |
| mentor_profiles | Yes | Own row |
| mentor_interactions | Yes | Own row |
| mentor_journal_refs | Yes | Own row |
| mentor_profile_snapshots | Yes | Own row |
| mentor_raw_inputs | Yes | Own row |
| api_keys | Yes | Admin-only (service role) |
| api_key_usage | Yes | Admin-only (service role) |
| session_decisions | Yes | Own row |
| session_context_snapshots | Yes | Own row |
| support_interactions | Yes | Own row |
| support_token_usage | Yes | Own row |
| support_pattern_summaries | Yes | Own row |
| analytics_events | Yes | Own row |
| deliberation_chains | Yes | Own row (or service role for API key access) |

---

## 6. Active Environment Variables

Variables in use across the production Vercel deployment. Never commit these. All required unless marked optional.

| Variable | Used By | Purpose |
|---|---|---|
| `ANTHROPIC_API_KEY` | sage-reason-engine.ts (singleton client) | All LLM calls |
| `NEXT_PUBLIC_SUPABASE_URL` | All Supabase clients | Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client-side Supabase | Public/anon access |
| `SUPABASE_SERVICE_ROLE_KEY` | supabase-server.ts (`supabaseAdmin`) | Server-side privileged access |
| `FOUNDER_USER_ID` | mentor/private/* routes | Restricts private mentor endpoints to founder only |
| `STRIPE_SECRET_KEY` | billing routes | Payment processing |
| `STRIPE_WEBHOOK_SECRET` | webhooks/stripe | Webhook signature verification |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Client billing UI | Stripe Elements |
| `RESEND_API_KEY` | notification scripts | Transactional email (manual trigger) |
| `MODEL_FAST` | model-config.ts | Fast model identifier (haiku tier) |
| `MODEL_DEEP` | model-config.ts | Deep model identifier (sonnet tier) |

**Optional / not yet active:**
| Variable | Purpose | Status |
|---|---|---|
| `PLAUSIBLE_API_KEY` | Privacy-first analytics | Not yet configured |
| `MENTOR_ENCRYPTION_KEY` | Server-side AES-256-GCM encryption for mentor_profiles (R17b) | Wired via mentor-profile-store.ts |

---

## 7. Architectural Decisions (Recent — Session 6–10)

### ADR-001: sage-reason-engine as shared singleton (6 April)
All 9 core LLM endpoints route through `runSageReason()`. No endpoint implements 4-stage logic independently. Singleton Anthropic client replaces 24 separate instances. **Rationale:** R4 (IP protection via centralisation), R5 (cost via connection pooling), R12 (2+ mechanisms from one source), R14 (receipts on all routes).

### ADR-002: Context layer separation — brains never in product endpoints (Sessions 8–10)
Agent brains (Ops, Tech, Growth, Support) are session-level context for their respective internal agents only. No product endpoint, mentor endpoint, or public API receives an agent brain. **Rationale:** Product endpoints must be portable for any customer's content; brains define internal agent identity, not scoring methodology.

### ADR-003: Private/public mentor split (Session 10)
Routes at `/api/mentor/private/*` are restricted to `FOUNDER_USER_ID`. They receive the full 5-layer context stack (L1+L2+L2b full+L5+observations+refs+snapshots). Public mentor routes receive L1+L2b condensed only. **Rationale:** R4 (project context not exposed to external users), R17 (intimate data — private routes founder-only).

### ADR-004: sage-orchestrator as standalone module (Session 10)
`/sage-orchestrator/` is a standalone module at project root, not inside the website. Exports `runAgentPipeline()`, preset factories, `createBrainLoader()`. Reasoning function injected (not imported). **Rationale:** Customer agents can import without pulling in website; orchestration IS the product; clean API boundary (R4).

### ADR-005: risk_class parameter on guardrail (8 April)
`risk_class: standard|elevated|critical` auto-selects evaluation depth. Critical responses include `rollback_path` field. This formalises the 0d-ii Change Risk Classification protocol into the product. **Rationale:** R17f (action category determines scrutiny level).

### ADR-006: Ring wrapper Critical category escalation (8 April)
`isCriticalActionCategory()` in ring-wrapper.ts checks task descriptions for Critical keywords (auth, delete, access control, deploy, etc.). When detected, BEFORE phase always selects MODEL_DEEP regardless of agent authority level. **Rationale:** R17f — urgency does not reduce classification; Critical actions always warrant deep scrutiny.

### ADR-007: Application-level encryption (8 April, adopted 10 April, updated 11 April)
**Server-side encryption is wired.** `server-encryption.ts` provides AES-256-GCM encrypt/decrypt using `MENTOR_ENCRYPTION_KEY`. `mentor-profile-store.ts` calls `encryptProfileData()` on every save and `decryptProfileData()` on every load. All profile reads (via `practitioner-context.ts`) go through this pipeline. Health endpoint correctly reports `mentor_encryption: "active"`. **Remaining:** Client-side `encryption.ts` (browser-side journal entry encryption via Web Crypto API) remains scaffolded — this is a separate P2 scope item for protecting data the server should never see.

### ADR-008: pgvector for semantic memory (Support Implementation Plan)
`mentor_raw_inputs` table uses `vector(1536)` column with `ivfflat` index. `search_mentor_memory()` function enables cosine similarity search. This provides the Support Brain's "compounding advantage" — every interaction makes future triage smarter. **Status:** Table and function scaffolded. Embedding pipeline not yet wired.

---

## 8. Module Status

| Module | Location | Status | Notes |
|---|---|---|---|
| sage-reason-engine | website/src/lib/ | Wired | Core LLM engine. Extended 8 April with stage scores, urgency context |
| stoic-brain-compiled | website/src/lib/context/ | Wired | Layer 1. 8 JSON sources compiled into depth-level strings |
| practitioner-context | website/src/lib/context/ | Wired | Layer 2b. Loads from mentor_profiles, returns condensed string |
| project-context | website/src/lib/context/ | Wired | Layer 2. Static JSON + Supabase dynamic. Private mentor only |
| mentor-context-private | website/src/lib/context/ | Wired | Full profile + observations + journal refs + snapshots. Session 10 |
| mentor-knowledge-base | website/src/lib/context/ | Wired | Layer 5. Historical + Global State briefings. Private mentor only |
| sage-orchestrator | sage-orchestrator/ (root) | Scaffolded | Standalone module. Types, pipeline, presets, index. Ready for P7 wiring |
| ring-wrapper | sage-mentor/ | Wired | Extended 8 April with Critical category escalation + side-effect detection |
| reasoning-receipt | website/src/lib/ | Wired | Receipt generation on all runSageReason routes |
| response-envelope | website/src/lib/ | Wired | Standardised API response wrapper |
| encryption | website/src/lib/ | Wired | Server-side AES-256-GCM via server-encryption.ts + mentor-profile-store.ts. Client-side encryption.ts remains scaffolded (P2 scope). |
| sage-mentor-bridge | sage-mentor/ | Wired | Dynamic import bridge for reflect→profile update loop |

---

*Update this document after any change to endpoints, schema, env vars, or architectural decisions. File lives at `/TECHNICAL_STATE.md` (project root).*
