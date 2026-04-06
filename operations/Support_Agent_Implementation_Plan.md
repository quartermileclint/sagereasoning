# SageReasoning — Support Agent Implementation Plan

**Date:** 4 April 2026
**Purpose:** Step-by-step plan to build and register the support agent, create markdown-based "sage versions" of its 10 operational tools, integrate the OpenBrain persistent memory layer into Supabase, and wire everything through the Sage ring.

**Design decisions confirmed by founder:**
- Pattern engine summaries, token usage instrumentation, and support agent operational data all live on Supabase
- Live chat widget, real-time notifications, and automated email send are not needed
- All operational tools use local markdown files as their interface
- Mentor and support agent run locally; Supabase holds the persistent memory

---

## Part A: Build and Register the Support Agent

The support agent is a single inner agent that slots into the ring's gap. The ring-wrapper already has the registration infrastructure — the agent needs to be defined, registered, and given a run loop.

### Step 1: Create the agent definition file

**File:** `sage-mentor/support-agent.ts`

This file defines the support agent's identity and its connection to the 10 markdown tools.

```typescript
// What to build:
// - A SupportAgent type extending InnerAgent concepts
// - A TOOL_REGISTRY constant listing all 10 markdown tool paths
// - An initialise function that:
//     1. Calls registerInnerAgent('sage-support', 'SageReasoning Support Agent', 'assistant')
//     2. Calls initAgentPerformance() from authority-manager.ts
//     3. Returns the registered agent
```

**Registration call** (uses the existing function in ring-wrapper.ts):
```typescript
import { registerInnerAgent } from './ring-wrapper'
import { initAgentPerformance } from './authority-manager'

const agent = registerInnerAgent(
  'sage-support',                    // id: alphanumeric + hyphens
  'SageReasoning Support Agent',     // name: sanitised automatically
  'assistant'                        // type: from the InnerAgent union
)
// agent starts at authority_level: 'supervised' (every action checked)

initAgentPerformance('sage-support')
// Creates the performance tracking record for authority promotion
```

**What "supervised" means practically:** Every action the support agent takes passes through both BEFORE and AFTER ring checks. As the agent demonstrates principled reasoning across 10+ actions with 80%+ at "deliberate" or above and no persisting passions, the authority-manager promotes it to "guided" (80% check rate), then "spot_checked" (40%), then "autonomous" (15%). This is already built — no new code needed for the promotion logic.

### Step 2: Create the agent's run loop

**File:** `sage-mentor/support-agent.ts` (continued)

The run loop is the support agent's heartbeat. It checks the markdown inbox for new work, processes it, and reports results through the ring.

```
// The run loop pattern:
//
// 1. Scan support/inbox/ for files with status: open
// 2. For each open item:
//    a. Build a RingTask:
//       { task_id, inner_agent_id: 'sage-support', task_description, timestamp }
//    b. Call executeBefore(task, profile) → BeforeResult
//       - Ring checks governance, passion patterns, journal memory
//       - Ring may enrich the task with context ("this customer asked about
//         therapeutic applications before — R1 language critical")
//    c. Support agent processes the task:
//       - Reads relevant knowledge-base/ articles
//       - Drafts a response in the inbox file
//       - Updates frontmatter status
//    d. Call executeAfter(task, agentOutput, profile) → AfterResult
//       - Ring evaluates the draft against R1/R3/R9
//       - Ring records to rolling window
//       - Ring updates accreditation card
//       - Ring surfaces journal insight if relevant
//    e. Write the AfterResult evaluation into the file as a ring-review block
//    f. Record the action via recordAgentAction() for authority tracking
// 3. Repeat on schedule (every 15 minutes, or on manual trigger)
```

### Step 3: Create the Supabase tables for support agent operational data

**File:** `api/migrations/support-agent-schema.sql`

Three new tables (all with RLS, user-scoped):

```sql
-- SUPPORT AGENT OPERATIONAL TABLES
-- All operational data persists on Supabase per founder's decision

-- 1. Support interactions log (OpenBrain immutable receipt)
CREATE TABLE IF NOT EXISTS support_interactions (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  interaction_id  TEXT NOT NULL UNIQUE,
  channel         TEXT NOT NULL DEFAULT 'email'
    CHECK (channel IN ('email', 'chat', 'api', 'social', 'form')),
  status          TEXT NOT NULL DEFAULT 'open'
    CHECK (status IN ('open', 'in_progress', 'resolved', 'escalated')),
  customer_id     TEXT,
  subject         TEXT,
  raw_content     TEXT NOT NULL,
  draft_response  TEXT,
  ring_evaluation JSONB,
  resolved_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Support agent token usage (extends ring instrumentation)
CREATE TABLE IF NOT EXISTS support_token_usage (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  interaction_id  TEXT REFERENCES support_interactions(interaction_id),
  model           TEXT NOT NULL,
  model_tier      TEXT NOT NULL CHECK (model_tier IN ('fast', 'deep')),
  input_tokens    INTEGER NOT NULL,
  output_tokens   INTEGER NOT NULL,
  estimated_cost  NUMERIC(10, 6) NOT NULL,
  phase           TEXT NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Support pattern summaries (pattern engine output)
CREATE TABLE IF NOT EXISTS support_pattern_summaries (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  summary_type    TEXT NOT NULL
    CHECK (summary_type IN ('weekly', 'monthly', 'quarterly')),
  period_start    DATE NOT NULL,
  period_end      DATE NOT NULL,
  total_interactions INTEGER NOT NULL DEFAULT 0,
  resolution_rate NUMERIC(5, 2),
  escalation_rate NUMERIC(5, 2),
  top_topics      JSONB,
  ring_observations JSONB,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS policies (same pattern as mentor_profiles)
ALTER TABLE support_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_token_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_pattern_summaries ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "own_data" ON support_interactions
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own_data" ON support_token_usage
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own_data" ON support_pattern_summaries
  FOR ALL USING (auth.uid() = user_id);
```

### Step 4: Wire the sync between local markdown and Supabase

The support agent works on local markdown files (fast, visible, editable). A sync function pushes completed interactions to Supabase for persistent memory.

```
// sync-to-supabase.ts
//
// Runs after each interaction is resolved:
// 1. Read the markdown file
// 2. Parse frontmatter + body + ring-review block
// 3. Upsert into support_interactions table
// 4. Record token usage from the ring session
// 5. Mark the local file as synced (add synced_at to frontmatter)
//
// Also runs as a batch at end of day:
// 1. Scan all resolved files from today
// 2. Verify each has been synced
// 3. Push any missed items
// 4. Generate daily pattern summary → support_pattern_summaries
```

---

## Part B: Markdown Sage Tool Specifications

Each "tool" is a folder structure with markdown files. The support agent reads and writes these files. The mentor reads them through the ring. You read them in any editor or in Cowork. No hosted services, no APIs, no infrastructure.

### Tool 1: Customer Inquiry Resolution — `support/inbox/`

**Folder structure:**
```
support/
  inbox/
    2026-04-05-api-key-question.md
    2026-04-05-passion-taxonomy-help.md
    ...
  resolved/
    2026-04-04-pricing-question.md
    ...
```

**File template** (`support/inbox/YYYY-MM-DD-slug.md`):
```markdown
---
id: support-20260405-001
status: open
channel: email
customer: jane@example.com
subject: "How does the passion taxonomy work?"
received: 2026-04-05T09:15:00+10:00
priority: normal
governance_flags: []
synced_at:
---

## Customer Message

[Paste or auto-capture the customer's message here]

## Draft Response

[Support agent writes its draft here]

## Ring Review

[Ring's AFTER evaluation appears here automatically]
- R1 compliance: pass/fail
- R3 disclaimer: present/missing
- R9 outcome promises: none detected / [flagged text]
- Passion detection: none / [identified passion in draft]
- Recommendation: send / revise / escalate

## Founder Decision

[You write: approved / edited / escalated + any notes]
```

**How it works:** New inquiry arrives (you paste it, or a simple email-to-file script drops it). Support agent picks it up, reads knowledge base articles, drafts a response, writes the draft into the file. Ring evaluates the draft and writes the Ring Review section. You open the file, read the review, approve or edit, and move the file to `resolved/` when done.

### Tool 2: Ticketing — Built into Tool 1

No separate tool. The frontmatter IS the ticket system:

- `status: open` → new ticket
- `status: in_progress` → support agent is drafting
- `status: resolved` → founder approved, response sent
- `status: escalated` → needs founder attention (governance, complexity)

**Tracking commands** (the support agent can run these):
```
# List open tickets:     find support/inbox/ -name "*.md" (frontmatter status: open)
# List escalated:        grep -l "status: escalated" support/inbox/*.md
# Count today's resolved: ls support/resolved/2026-04-05-*.md | wc -l
```

### Tool 3: Knowledge Base — `knowledge-base/`

**Folder structure:**
```
knowledge-base/
  getting-started/
    what-is-sagereasoning.md
    how-scoring-works.md
    free-tier-limits.md
  glossary/
    controlled-terms.md         (derived from the 67-term glossary)
    passions-taxonomy.md        (human-readable version of passions.json)
  api/
    authentication.md
    sage-reason-endpoint.md
    sage-guard-endpoint.md
    rate-limits.md
  governance/
    what-r1-means.md
    disclaimers-explained.md
    source-fidelity.md
  trust-layer/
    what-is-accreditation.md
    how-agents-earn-trust.md
    authority-levels.md
  faq/
    common-questions.md
```

**File template:**
```markdown
---
title: "How the Passion Taxonomy Works"
category: glossary
last_updated: 2026-04-05
source_files: [passions.json]
governance_rules: [R7, R8]
---

[Article content — human-readable explanation derived from the data files]
```

**How it works:** The support agent searches this folder when drafting replies. It matches the customer's question against article titles and content, pulls relevant sections, and weaves them into the draft. The ring's BEFORE check can also suggest: "The knowledge base article on this topic was last updated 3 months ago — verify accuracy before citing."

### Tool 4: Workflow Playbooks — `workflows/`

**Folder structure:**
```
workflows/
  stripe-payment-failed.md
  new-enterprise-inquiry.md
  accreditation-grade-change.md
  quarterly-compliance-review.md
  agent-trust-layer-onboarding.md
  weekly-pattern-summary.md
```

**File template:**
```markdown
---
workflow: stripe-payment-failed
trigger: "Stripe webhook: payment_intent.payment_failed"
last_run: 2026-04-04
next_scheduled:
---

## Steps

1. Log the failure in `support/inbox/` with `priority: high` and `channel: billing`
2. Draft a customer notification email explaining:
   - What happened (payment failed)
   - What to do (update payment method at [URL])
   - What happens next (account remains active for 7 days)
3. Check if this customer has failed before:
   - If yes: escalate to founder
   - If no: standard notification
4. Update the customer's lead file in `leads/` with a note

## Ring Governance

- R3: Include disclaimer that this is an automated notification
- R9: Do not promise when the issue will be resolved
- R1: Not applicable (billing, not philosophical)
```

**How it works:** These are written playbooks the support agent follows. No automation engine — the agent IS the engine. It reads the playbook, executes each step by writing to the appropriate markdown files, and the ring evaluates each step. When you need a new workflow, you write a new markdown file describing the steps.

### Tool 5: Draft Generation — Built into Tool 1

No separate tool. The support agent's core function IS draft generation. It reads the customer message, reads the knowledge base, and writes a draft in the inbox file. The Claude API call (already in the stack) powers the draft. The ring wraps it.

### Tool 6: Escalation — Built into Tools 1 and 4

No separate tool. Escalation is a frontmatter status change:

```yaml
status: escalated
escalation_reason: "Customer asked about using SageReasoning for employee performance reviews — touches R2 (no employment evaluation)"
escalated_at: 2026-04-05T10:30:00+10:00
```

The ring's BEFORE check triggers escalation automatically when it detects R1, R2, or R10 governance flags. The support agent can also escalate manually by changing the status and adding a reason.

### Tool 7: Agent Email Notifications — `notifications/`

**Folder structure:**
```
notifications/
  outbox/
    2026-04-05-accreditation-downgrade-agent123.md
    2026-04-05-billing-reminder-jane.md
  sent/
    2026-04-04-welcome-agent456.md
```

**File template:**
```markdown
---
id: notif-20260405-001
type: accreditation_change
recipient: agent-owner@example.com
subject: "Agent trust-layer update: reasoning quality change detected"
status: draft
created: 2026-04-05T11:00:00+10:00
sent_at:
---

## Email Body

[Support agent drafts the notification here]

## Ring Review

[Ring evaluates: R3 disclaimer present? R9 no promises? Accurate representation of accreditation status?]

## Send Decision

[Founder: approved / edited. Then manually send via Resend dashboard, or trigger a simple send script]
```

**How it works:** Support agent creates notification files. Ring reviews them. You approve and send (manually via the Resend dashboard, or a one-line script: `node send-notification.js notifications/outbox/filename.md`). When sent, move to `sent/`. No automated sending — you control every outbound message.

### Tool 8: Omnichannel — Built into Tool 1

No separate tool. The `channel:` frontmatter field tracks where the inquiry came from. All channels land in the same `support/inbox/` folder. The ring doesn't care which channel — it applies the same governance checks regardless.

### Tool 9: Lead Qualification — `leads/`

**Folder structure:**
```
leads/
  active/
    acme-corp.md
    indie-agent-dev-jane.md
  qualified/
    enterprise-client-bigco.md
  closed/
    not-a-fit-startup.md
```

**File template:**
```markdown
---
id: lead-20260405-001
company: "Acme Corp"
contact: cto@acme.com
source: website_inquiry
score: medium
status: active
use_case: "Agent trust layer for their autonomous customer service bots"
first_contact: 2026-04-05
last_contact: 2026-04-05
---

## Notes

[Support agent writes research notes here — what the company does, why they're interested, what tier they'd likely need]

## Ring Observations

[Ring's evaluation: Is pursuing this lead aligned with SageReasoning's mission? Is the score driven by genuine strategic fit or by appetite (philarguros)?]

## Next Steps

- [ ] Send introductory information
- [ ] Schedule discovery call
- [ ] Prepare enterprise tier proposal
```

### Tool 10: QA Monitoring — Built into the Ring

No separate tool. The ring's AFTER check IS the QA layer. Every draft, notification, and response the support agent writes gets evaluated for R1/R3/R9 compliance, passion-free language, and source fidelity. The Ring Review section in every file IS the QA report.

**Summary:** Of the 10 tasks, only 5 need their own folder/file structure (inbox, knowledge-base, workflows, notifications, leads). The other 5 are built into those structures via frontmatter fields (ticketing), the agent's core function (drafting), status changes (escalation), frontmatter tags (omnichannel), and the ring itself (QA).

---

## Part C: OpenBrain Persistent Memory Integration

Three additions to Supabase that give the mentor semantic search across all history.

### Addition 1: Enable pgvector

```sql
-- Run once in Supabase SQL editor
CREATE EXTENSION IF NOT EXISTS vector;
```

### Addition 2: Immutable raw input log

```sql
-- OpenBrain "receipt" — append-only, never deleted
CREATE TABLE IF NOT EXISTS mentor_raw_inputs (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source          TEXT NOT NULL
    CHECK (source IN ('support', 'journal', 'proactive', 'decision_gate',
                      'reflection', 'lead', 'notification', 'workflow')),
  content         TEXT NOT NULL,
  content_hash    TEXT NOT NULL,
  embedding       vector(1536),
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for semantic search
CREATE INDEX ON mentor_raw_inputs
  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- RLS
ALTER TABLE mentor_raw_inputs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_data" ON mentor_raw_inputs
  FOR ALL USING (auth.uid() = user_id);
```

### Addition 3: Semantic search function

```sql
-- Find similar past interactions by meaning
CREATE OR REPLACE FUNCTION search_mentor_memory(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 5,
  p_user_id uuid DEFAULT auth.uid()
)
RETURNS TABLE (
  id uuid,
  source text,
  content text,
  metadata jsonb,
  similarity float,
  created_at timestamptz
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    mri.id,
    mri.source,
    mri.content,
    mri.metadata,
    1 - (mri.embedding <=> query_embedding) AS similarity,
    mri.created_at
  FROM mentor_raw_inputs mri
  WHERE mri.user_id = p_user_id
    AND 1 - (mri.embedding <=> query_embedding) > match_threshold
  ORDER BY mri.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
```

### How this connects to the ring

The ring's `findRelevantJournalPassage()` function (already in ring-wrapper.ts) currently searches the `mentor_journal_refs` table by keyword. With the semantic search function, it upgrades:

1. When a new support interaction arrives, embed it (via Claude/OpenAI embedding API)
2. Store in `mentor_raw_inputs`
3. When the ring's BEFORE check runs, call `search_mentor_memory()` with the current task's embedding
4. If matches found: surface the most relevant past interaction ("You dealt with a similar question 3 weeks ago — here's how you handled it and what the ring observed")

This is Jones's "compounding advantage" — every interaction makes the next one smarter.

---

## Part D: Prioritised Implementation Steps

Ordered by dependency (each step enables the next) and by immediate value to the founder.

### Phase 1: Foundation (do first — enables everything else)

**Step 1.1: Create the folder structure**
```
sagereasoning/
  support/
    inbox/
    resolved/
  knowledge-base/
    getting-started/
    glossary/
    api/
    governance/
    trust-layer/
    faq/
  workflows/
  notifications/
    outbox/
    sent/
  leads/
    active/
    qualified/
    closed/
```
**Effort:** 5 minutes. Just create the folders.
**Value:** Immediate — you can start manually filing support inquiries today.

**Step 1.2: Write the file templates**
Create a `_templates/` folder with one blank template for each file type (inbox item, KB article, workflow playbook, notification, lead). Copy-paste when you need a new file.
**Effort:** 30 minutes.
**Value:** Consistency from day one.

**Step 1.3: Write the first 10 knowledge base articles**
Start with: what-is-sagereasoning, how-scoring-works, free-tier-limits, controlled-terms, passions-taxonomy, authentication, sage-reason-endpoint, what-r1-means, disclaimers-explained, common-questions.
**Effort:** 2–3 hours (most content already exists in your documentation).
**Value:** The support agent can't draft good replies without a knowledge base to draw from.

### Phase 2: Supabase Memory Layer (do second — gives the ring long-term memory)

**Step 2.1: Run the support agent operational tables migration**
Copy the SQL from Part A Step 3 into the Supabase SQL editor and run it.
**Effort:** 5 minutes.

**Step 2.2: Enable pgvector and create the raw inputs table**
Copy the SQL from Part C Additions 1–3 into the Supabase SQL editor and run it.
**Effort:** 5 minutes.

**Step 2.3: Create the semantic search function**
Copy the SQL from Part C Addition 3. Test with a dummy embedding.
**Effort:** 15 minutes.

### Phase 3: Build the Support Agent (do third — brings the system to life)

**Step 3.1: Create `sage-mentor/support-agent.ts`**
Define the agent, the tool registry (paths to each markdown folder), and the initialisation function that calls `registerInnerAgent()` and `initAgentPerformance()`.
**Effort:** 1–2 hours.

**Step 3.2: Build the run loop**
The inbox scanner, the task builder, the before/after ring integration, and the file writer. This is the core of the support agent.
**Effort:** 4–6 hours.

**Step 3.3: Build the sync-to-supabase function**
The bridge between local markdown files and Supabase persistent memory. Reads resolved files, parses frontmatter, upserts to `support_interactions`, records token usage.
**Effort:** 2–3 hours.

**Step 3.4: Build the embedding pipeline**
When an interaction is synced, generate an embedding (via Claude or OpenAI embedding API) and store in `mentor_raw_inputs`. This enables semantic search across all support history.
**Effort:** 1–2 hours.

### Phase 4: Wire the Ring (do fourth — connects mentor reasoning to support operations)

**Step 4.1: Connect executeBefore() and executeAfter() to live Claude API calls**
The prompt builders exist. The model routing exists. What's missing is the actual `fetch()` call to Anthropic's API with the built prompts. This is the LLM wiring noted as missing in the knowledge context summary.
**Effort:** 3–4 hours.

**Step 4.2: Wire the proactive scheduler to the support agent**
Morning check-in asks: "Any open tickets from yesterday? Any patterns in this week's inquiries?" Evening reflection asks: "How did you handle today's escalation? Was the reasoning principled?"
**Effort:** 2–3 hours.

**Step 4.3: Wire the pattern engine to support data**
Run pattern analysis on support interactions (what topics recur? which types get escalated? is the knowledge base covering the right questions?). Store summaries in `support_pattern_summaries`.
**Effort:** 2–3 hours.

### Phase 5: Write the Workflow Playbooks (do fifth — gives the agent operational instructions)

**Step 5.1: Write the core playbooks**
- New customer inquiry (standard response flow)
- Enterprise inquiry (research + escalate)
- API support request (check logs + draft technical response)
- Billing issue (Stripe integration flow)
- Governance-flagged inquiry (R1/R2/R10 escalation)
- Quarterly compliance review trigger
**Effort:** 2–3 hours.

**Step 5.2: Write the Resend notification script**
A single Node.js script that reads a notification markdown file and sends it via Resend's API. One script, reusable for all notification types.
**Effort:** 1 hour.

### Phase 6: Validation and Iteration (ongoing)

**Step 6.1: Run 10 test interactions through the full pipeline**
Create 10 sample support inquiries covering different scenarios (general question, API help, governance-flagged, enterprise lead, billing). Run each through the support agent → ring → review cycle. Verify the ring's evaluations are accurate and the Supabase sync works.
**Effort:** 2–3 hours.

**Step 6.2: Review authority promotion progression**
After 10+ test interactions, check whether the authority-manager's evaluation of the support agent is progressing sensibly. Is it earning promotion from supervised → guided? If not, why?
**Effort:** 30 minutes.

**Step 6.3: Run the first semantic search test**
After 10+ interactions are stored with embeddings, test `search_mentor_memory()` with a new inquiry that's similar to a past one. Verify the ring surfaces the relevant history.
**Effort:** 30 minutes.

---

## Total Estimated Effort

| Phase | Effort | Calendar Time |
|-------|--------|---------------|
| 1. Foundation | ~3.5 hours | Day 1 |
| 2. Supabase memory | ~25 minutes | Day 1 |
| 3. Build support agent | ~10 hours | Days 2–3 |
| 4. Wire the ring | ~9 hours | Days 4–5 |
| 5. Workflow playbooks | ~4 hours | Day 6 |
| 6. Validation | ~3 hours | Day 7 |
| **Total** | **~30 hours** | **~7 working days** |

---

## What This Gives You When Complete

1. **A working support agent** registered in the ring, starting at supervised authority, earning promotion through demonstrated quality
2. **10 operational capabilities** as readable, editable markdown files — no hosted services, no monthly costs, no infrastructure management
3. **Persistent memory in Supabase** — every interaction logged, every pattern tracked, semantic search across your full history
4. **The ring wrapping everything** — governance enforcement, passion detection, journal memory surfacing, and accreditation tracking on every support action
5. **An upgrade path** — when volume grows, add Tawk.to (chat widget → writes to inbox/), FreeScout (email → writes to inbox/), or n8n (webhooks → triggers workflows). The markdown files remain the canonical record; tools just become faster interfaces into the same data

The support agent is the first inner agent. The architecture supports adding more (a content agent, a development agent, a research agent) — each registered in the ring, each starting supervised, each earning authority independently. The mentor wraps them all.
