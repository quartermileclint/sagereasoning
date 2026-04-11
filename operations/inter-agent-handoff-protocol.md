# Inter-Agent Handoff Protocol
**Date:** 11 April 2026 · Session 11  
**Status:** Designed  
**Purpose:** Simple structured format for agents (Tech, Growth, Support) to flag items for each other. Enables asynchronous coordination without requiring a shared session.

---

## Why This Exists

The Tech, Growth, and Support agents work independently but their domains overlap. A Support agent handling a "how does the API rate limit work?" inquiry may surface an API-change that Growth should know about. A Growth agent researching competitor language may uncover a support pattern. A Tech agent modifying an endpoint needs to tell Support what changed.

Without a handoff protocol, these signals evaporate between sessions. The protocol captures them.

---

## Protocol Design Principles

1. **Additive only** — agents add handoff items; they never delete or modify another agent's item. Resolution is a status update, not deletion.
2. **Lightweight** — a handoff item is 4 required fields plus one optional note. It takes under 2 minutes to write.
3. **Asynchronous** — items are read at the start of the receiving agent's session, not in real time.
4. **Markdown-first** — items live as markdown files for human readability and founder oversight. Supabase provides queryable persistence and the 30-day rolling window.
5. **Low volume expectation** — this is not a ticketing system. 1-5 handoff items per session is the expected range.

---

## The Four Categories

| Category | When to use |
|---|---|
| `content-opportunity` | Growth → Tech or Growth → Support. A content angle, case study, or positioning update triggered by an interaction. Example: "Customer asked if SageReasoning handles group decisions — this is a gap worth addressing in the FAQ and possibly the API." |
| `api-change` | Tech → Growth and Tech → Support. Any change to an endpoint, schema, rate limit, or env var that affects what agents say about the product. Example: "score-document now stores results at /api/score-document/{id} — Support and Growth KB articles need updating." |
| `support-pattern` | Support → Tech and Support → Growth. A recurring inquiry theme, escalation type, or friction point that signals a product or content gap. Example: "Three inquiries this week about whether the guardrail endpoint works for non-English text — Tech should evaluate, Growth should address in docs." |
| `messaging-update` | Growth → Support and Growth → Tech. Approved positioning language changes, new approved phrases, phrases to retire. Example: "Retiring 'AI therapist' as a comparison point in all messaging. Use 'reasoning infrastructure' instead." |

---

## Markdown Format (Local Files)

**Location:** `operations/handoffs/`  
**Filename pattern:** `YYYY-MM-DD-{source}-to-{target}-{slug}.md`  
**Example:** `2026-04-11-tech-to-support-score-document-persistence.md`

**Template:**

```markdown
---
id: handoff-20260411-001
source_agent: tech
target_agent: support
category: api-change
priority: normal
status: open
created: 2026-04-11T10:00:00+10:00
resolved_at:
---

## What Changed

[Plain-language description of the change — what it is, why it happened, what it affects]

## What the Receiving Agent Should Do

[Specific action: update KB article / adjust response template / investigate / no action needed]

## Context (optional)

[Any background helpful for the receiving agent. Reference to PR, ADR, decision log entry, or session handoff note.]
```

**Status values:**
- `open` — item not yet read by target agent
- `read` — target agent has read it; action may or may not be complete
- `actioned` — target agent has taken the specified action
- `no-action-needed` — target agent reviewed and determined no action required
- `escalated` — item needs founder decision; target agent cannot resolve independently

---

## Supabase Table (Queryable Persistence)

The markdown files are canonical. The Supabase table enables cross-agent querying, the rolling category window for Support (30-day), and reporting without parsing files.

**Migration file:** `supabase/migrations/20260411_agent_handoffs.sql`

```sql
-- ═══════════════════════════════════════════════════════════════
-- agent_handoffs — Inter-agent coordination log
-- Markdown files are canonical; this table provides queryability.
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.agent_handoffs (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Routing
  source_agent    TEXT NOT NULL
    CHECK (source_agent IN ('tech', 'growth', 'support', 'ops', 'founder')),
  target_agent    TEXT NOT NULL
    CHECK (target_agent IN ('tech', 'growth', 'support', 'ops', 'founder')),
  category        TEXT NOT NULL
    CHECK (category IN ('content-opportunity', 'api-change', 'support-pattern', 'messaging-update')),

  -- Content
  description     TEXT NOT NULL,
  action_required TEXT,             -- What the target agent should do
  context_ref     TEXT,             -- Reference to session, ADR, decision log entry, file path

  -- Priority and status
  priority        TEXT NOT NULL DEFAULT 'normal'
    CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  status          TEXT NOT NULL DEFAULT 'open'
    CHECK (status IN ('open', 'read', 'actioned', 'no-action-needed', 'escalated')),

  -- Lifecycle
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  read_at         TIMESTAMPTZ,
  resolved_at     TIMESTAMPTZ,
  resolution_note TEXT          -- Optional note when status changes to actioned/no-action-needed
);

-- RLS: service role only (all access via server-side agent sessions)
ALTER TABLE public.agent_handoffs ENABLE ROW LEVEL SECURITY;
-- No user-facing RLS policies — internal agent use only via service role

-- Indexes
CREATE INDEX IF NOT EXISTS idx_handoffs_target_status
  ON public.agent_handoffs (target_agent, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_handoffs_category_window
  ON public.agent_handoffs (category, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_handoffs_source_target
  ON public.agent_handoffs (source_agent, target_agent, created_at DESC);
```

---

## Session Protocol

### At session START (any agent):
1. Query open handoffs addressed to this agent:
   ```sql
   SELECT * FROM agent_handoffs
   WHERE target_agent = '{this_agent}'
     AND status = 'open'
   ORDER BY priority DESC, created_at ASC;
   ```
2. Read each item. Mark as `read`.
3. If action is clear: take it and mark `actioned`. Note what was done in `resolution_note`.
4. If no action needed: mark `no-action-needed` with a one-line reason.
5. If escalation needed: mark `escalated` and surface to founder.

### During session (any agent):
6. When a signal emerges that another agent should know about: write a handoff item. Both the markdown file and the Supabase row.

### At session CLOSE (any agent):
7. Confirm any handoffs created this session are written to both markdown and Supabase.
8. The session handoff note (sage-stenographer) should mention if any inter-agent handoffs were created or resolved.

---

## Priority Guidelines

| Priority | Use when |
|---|---|
| `urgent` | A change is live that will cause incorrect Support responses or broken agent integrations **right now** |
| `high` | Something the target agent needs to act on before their next substantive work session |
| `normal` | Something worth knowing and acting on in the next 1-2 sessions |
| `low` | FYI item, no time pressure, act when convenient |

**Default to `normal`.** Most handoffs are not urgent.

---

## Example Handoffs

**Tech → Support (api-change, high):**
```
id: handoff-20260411-001
source: tech → target: support
category: api-change
priority: high
description: The score-document endpoint now persists results and returns an id field. 
  Results retrievable via GET /api/score-document/{id}. Rate limit unchanged (15/min).
action_required: Update knowledge-base/api/sage-reason-endpoint.md to document the id field 
  and retrieval endpoint. Also update common-questions.md FAQ if there's a question about 
  storing evaluation results.
context_ref: operations/decision-log.md — 6 April 2026 entry on sage-reason-engine refactoring
```

**Support → Growth (support-pattern, normal):**
```
id: handoff-20260411-002
source: support → target: growth
category: support-pattern
priority: normal
description: Three inquiries in the past two weeks asked whether SageReasoning works for 
  group decisions (teams, partnerships, collective deliberation). Current tooling is individual-
  facing. These users seem to want a shared deliberation tool, not just a personal practice tool.
action_required: Assess whether this is worth addressing in positioning — either acknowledging 
  the gap or noting it as a future direction. Don't create false expectations.
context_ref: support/resolved/2026-04-09-group-decisions.md, 2026-04-07-team-use.md
```

**Growth → Support (messaging-update, high):**
```
id: handoff-20260411-003
source: growth → target: support
category: messaging-update
priority: high
description: "AI therapist" is now retired as a comparison point in all messaging. R19 review 
  found it creates false expectations about psychological treatment. Use "reasoning infrastructure" 
  or "Stoic evaluation framework" instead. Also retiring "wellbeing tool."
action_required: Review all knowledge-base articles for "AI therapist" or "wellbeing tool" 
  and replace with approved alternatives. Check common-questions.md in particular.
context_ref: R19 — honest positioning; forthcoming limitations page (P2 item 2e)
```

---

## What This Is Not

- Not a real-time communication channel — items are read at session start, not pushed
- Not a ticketing system — don't create handoffs for every minor observation
- Not a decision log — significant decisions go in `operations/decision-log.md`, not here
- Not a session handoff note — session notes are for the founder↔AI pair; handoffs are for agent↔agent coordination

---

*Folder: `operations/handoffs/` for markdown files. Supabase table: `agent_handoffs`. Migration: `supabase/migrations/20260411_agent_handoffs.sql`.*
