# SageReasoning — Gap-Filling Tool Map

**Date:** 4 April 2026
**Purpose:** Map the 10 prioritised operational tasks to free-use tools that slot into "the gap" of the Sage ring architecture. Each tool handles the raw non-reasoning function; the Sage ring handles all reasoning (before/after evaluation, governance enforcement, passion diagnosis, accreditation tracking).

---

## How to Read This Document

For each of the 10 tasks:

- **In the gap** = the operational tool that does the raw work (chat, ticketing, routing, etc.)
- **In the ring** = what the Sage ring's before/after checks handle (reasoning quality, governance compliance, passion detection, accreditation impact)

The ring wraps whatever slots into the gap. The inner tool is oblivious to Stoicism. It just does its job. The ring evaluates whether that job was done with principled reasoning.

---

## Task 1: AI-Powered Customer Inquiry Resolution

### What goes in the gap
A tool that receives customer questions (via chat widget or form), matches them against stored answers, and auto-replies.

### Recommended tool: **Tawk.to**
- **URL:** https://www.tawk.to
- **Type:** Cloud-hosted, free forever
- **Limits:** Unlimited agents, unlimited chats, unlimited websites, no expiration. 100 AI credits/month for auto-replies
- **Why this one:** Zero cost, zero self-hosting burden, covers both live chat and basic ticketing. A solo founder doesn't need to maintain infrastructure for this

### Runner-up: **Chatwoot** (open-source, self-hosted)
- Full control, MIT licence, but requires server maintenance
- Better long-term if SageReasoning scales beyond what Tawk.to's free tier supports

### What the Sage ring does
- **BEFORE:** Checks whether the auto-reply aligns with R1 (no therapeutic implication), R3 (disclaimer present), R9 (no outcome promises). Flags passion-driven language in customer message for founder awareness
- **AFTER:** Evaluates response quality. Did the reply address the actual question or deflect? Logs interaction to rolling window for pattern detection (e.g., "40% of inquiries this week are about the same API endpoint — knowledge base gap detected")

---

## Task 2: Email Ticketing and Routing

### What goes in the gap
A tool that converts incoming emails into tickets, assigns/routes them, and tracks status.

### Recommended tool: **FreeScout**
- **URL:** https://freescout.net
- **Type:** Open-source (self-hosted), AGPL licence
- **Limits:** Unlimited agents, unlimited tickets, unlimited mailboxes. Optional paid modules for WhatsApp/Facebook/Telegram
- **Why this one:** Laravel/PHP — lightweight, runs on a $5/month VPS. Shared inbox model matches a solo founder's workflow. No per-agent pricing to worry about when adding help later

### Runner-up: **Zammad** (open-source, self-hosted)
- More features (multi-channel, REST API, auto-routing rules) but heavier infrastructure requirements
- Better if SageReasoning needs advanced routing logic for API vs. website vs. enterprise inquiries

### What the Sage ring does
- **BEFORE:** When a ticket arrives, the ring classifies it against governance rules — does this touch R1 (therapeutic), R2 (employment evaluation), R10 (marketplace compliance)? Routes accordingly: auto-reply for general, founder-escalation for regulated
- **AFTER:** Evaluates the founder's response before it sends. Catches R3 disclaimer omissions, R9 outcome promises, passion-driven language ("I'll definitely have this fixed by Friday" — is that a genuine commitment or appetite-driven people-pleasing?)

---

## Task 3: Knowledge Base-Driven Self-Service

### What goes in the gap
A tool that hosts a searchable help centre where users find answers before contacting support.

### Recommended tool: **Docusaurus**
- **URL:** https://docusaurus.io
- **Type:** Open-source static site generator (React/Meta-backed)
- **Limits:** None — deploys free to GitHub Pages, Vercel, or Netlify
- **Why this one:** SageReasoning already runs on Next.js/Vercel. Docusaurus deploys to the same infrastructure at zero cost. The 67-term glossary, 8 data file explanations, governance rules (R1–R14), API documentation, and FAQ content are all static — they don't need a database-backed KB tool. Versioning via Git. Search via Algolia DocSearch (free for open-source docs)

### Runner-up: **BookStack** (open-source, self-hosted)
- Better for non-technical content editors who need a WYSIWYG interface
- Overkill for a solo founder who already writes in Markdown

### What the Sage ring does
- **BEFORE:** When KB content is created or updated, the ring checks it against R7 (source fidelity — does this article trace to primary citations?), R8 (glossary enforcement — are terms used correctly at the right tier?), R4 (IP protection — does this expose scoring logic?)
- **AFTER:** Monitors which KB articles get the most traffic and correlates with support ticket volume. Surfaces pattern: "Users who read the 'passions taxonomy' article still submit tickets about passion diagnosis 60% of the time — article needs rewriting"

---

## Task 4: Multi-Step Workflow Automation

### What goes in the gap
A tool that executes automated sequences across multiple services (e.g., "Stripe payment fails → create ticket → email customer → log event").

### Recommended tool: **n8n**
- **URL:** https://n8n.io
- **Type:** Open-source (Fair Code), self-hosted free
- **Limits:** Unlimited executions when self-hosted. 1,100+ integrations. Full webhook support
- **Why this one:** Most integrations of any free option. Webhook support is critical — the Sage ring's event stream (Priority 6 in the build plan) can fire webhooks that n8n catches and routes. Visual workflow builder means a non-developer founder can modify flows without code

### Runner-up: **Activepieces** (open-source + free cloud tier)
- 5 free active workflows, unlimited tasks/month on cloud — no self-hosting needed
- Better if the founder wants zero infrastructure management, but 5-workflow limit may constrain

### Key workflows to automate
1. **Compliance pipeline trigger:** Quarterly audit reminder → pull regulatory changes → flag for founder review
2. **Stripe integration:** Payment received → update user tier → adjust API rate limits → send confirmation
3. **Agent Trust Layer:** Accreditation grade changes → update public endpoint → notify agent owner → log to audit trail
4. **Support escalation:** Ticket tagged "regulated" → create founder task → set SLA timer → follow up if unresolved

### What the Sage ring does
- **BEFORE:** When a workflow is created or modified, the ring evaluates the reasoning behind the change. Is this workflow being added because of a genuine operational need (kathekon) or because of anxiety about missing something (passion: phobos)?
- **AFTER:** Monitors workflow execution patterns. Detects when a workflow fires but the founder overrides its output repeatedly — signal that the workflow's logic doesn't match the founder's actual values

---

## Task 5: AI Draft Generation for Support Replies

### What goes in the gap
A tool that auto-generates draft replies to support messages based on context and knowledge base content.

### Recommended tool: **Claude API (already in stack) + FreeScout**
- **Type:** Already integrated — claude-sonnet-4-6 is the AI engine, FreeScout is the inbox
- **Limits:** Cost per draft (~$0.01–0.03 per reply at Haiku tier for routine drafts, Sonnet for complex)
- **Why this one:** No new tool needed. The Sage ring already has model routing (Haiku for routine, Sonnet for complex). A simple n8n workflow can trigger: new ticket arrives in FreeScout → extract context → call Claude API with KB context → generate draft → present to founder for review

### Runner-up: **Casibase** (open-source RAG platform)
- Self-hosted knowledge base with RAG, supports multiple LLM backends
- Better if SageReasoning wants to keep all support data on-premise

### What the Sage ring does
- **BEFORE:** Enriches the draft prompt with the customer's history, relevant governance rules, and any known patterns ("this customer asked about therapeutic applications last time — R1 language is critical")
- **AFTER:** Evaluates every draft against R1, R3, R9 before it reaches the founder's review queue. Catches: "This draft promises a resolution timeline — R9 violation." Rewrites or flags

---

## Task 6: Human Agent Escalation and Handoff

### What goes in the gap
A mechanism that routes conversations from automation to the human founder with context preserved.

### Recommended tool: **Built into FreeScout + Tawk.to (no separate tool needed)**
- FreeScout's workflow module can auto-tag tickets by keyword/category and assign to the founder
- Tawk.to's chat transfers let the AI widget hand off to a live agent (the founder) with full conversation history
- **Why this one:** Escalation is a routing rule, not a product. Adding a separate tool creates unnecessary complexity for a solo founder operation

### Fallback: **Botpress** (open-source chatbot with handoff)
- If SageReasoning builds a more sophisticated chatbot front-end, Botpress has native human handoff — but requires the Plus plan ($79/month) for this feature
- Only worth it when volume justifies a dedicated chatbot layer

### What the Sage ring does
- **BEFORE:** The ring IS the escalation logic for governance-sensitive inquiries. It detects when a conversation touches R1, R2, or R10 territory and forces escalation regardless of what the automation would have done
- **AFTER:** When the founder handles an escalated conversation, the ring evaluates whether the response maintained principled reasoning under pressure. Escalated conversations are inherently higher-stakes — the ring tracks whether the founder's reasoning quality drops during escalations (disposition stability under pressure)

---

## Task 7: Programmatic Email Infrastructure for AI Agents

### What goes in the gap
An API that lets AI agents send, receive, and parse emails programmatically (for accreditation notifications, billing alerts, trust-layer status changes).

### Recommended tool: **Resend**
- **URL:** https://resend.com
- **Type:** Cloud-hosted, free tier
- **Limits:** 3,000 emails/month (100/day cap), 1 domain, 1-day log retention
- **Why this one:** Developer-first API, excellent DX, built for transactional email. 3,000 emails/month is more than enough for early-stage agent notifications. SageReasoning already uses Vercel — Resend integrates natively

### Runner-up: **Mailgun** (free tier: 100 emails/day)
- Includes inbound email routing (Resend is outbound only)
- Better if agents need to RECEIVE emails (e.g., reply-to-accreditation-notification workflows)

### For inbound email (if needed later): **Postal** (open-source, self-hosted)
- Full mail delivery platform with inbound/outbound, multiple orgs/domains
- Only necessary when agent volume exceeds Mailgun's free tier

### What the Sage ring does
- **BEFORE:** Every automated email sent to an agent owner passes through the ring. The ring checks: does this notification accurately represent the agent's accreditation status? Is the language R3-compliant (disclaimer present)? Does it avoid R9 violations (no promises about what the accreditation "means" for the agent's capabilities)?
- **AFTER:** Tracks email engagement patterns. If an agent owner consistently ignores accreditation downgrade notifications, that's a signal the trust layer needs a different communication strategy

---

## Task 8: Omnichannel Conversation Management

### What goes in the gap
A unified view of messages from website chat, API support, email, and (eventually) social channels.

### Recommended tool: **Chatwoot** (open-source, self-hosted — for when scale demands it)
- **URL:** https://www.chatwoot.com
- **Type:** Open-source, MIT licence, self-hosted
- **Limits:** None when self-hosted. Supports live chat, email, Facebook, Instagram, Twitter, WhatsApp, Telegram, Line, SMS
- **Why this one:** Only tool that genuinely unifies all channels in a single open-source inbox. The free cloud tier is too limited for production (2 agents, 1 inbox), but self-hosted has no restrictions

### Phase strategy
- **Now (pre-launch):** Tawk.to (chat) + FreeScout (email) — two tools, two inboxes, zero cost
- **Post-launch (when volume justifies):** Migrate to Chatwoot self-hosted — single inbox, all channels, still zero licence cost

### What the Sage ring does
- **BEFORE:** Regardless of which channel a message arrives on, the ring applies the same governance evaluation. A question about therapeutic applications gets the same R1 treatment whether it comes via Twitter DM or the API support channel
- **AFTER:** Cross-channel pattern detection. "This user asked the same question on chat and email — are we giving consistent answers?" The ring ensures reasoning consistency across channels, not just within them

---

## Task 9: Automated Lead Qualification and Research

### What goes in the gap
A tool that scores incoming leads (enterprise inquiries, marketplace skill submissions, partnership requests) and surfaces the highest-value prospects.

### Recommended tool: **ERPNext CRM** (open-source, self-hosted)
- **URL:** https://erpnext.com
- **Type:** Open-source, self-hosted
- **Limits:** None — full CRM with lead management, multi-stage pipeline, auto-assignment rules, lead scoring
- **Why this one:** Full lead lifecycle (New → Contacted → Qualified → Proposal → Won/Lost) with customisable scoring rules. Auto-assignment rules handle routing when the team grows beyond one person

### Runner-up: **Twenty CRM** (open-source, GPL)
- Cleaner UI, REST/GraphQL APIs, lighter weight
- Better for a solo founder who just needs contact management + basic workflows without the full ERP overhead

### Phase strategy
- **Now (pre-launch):** A spreadsheet + n8n webhook that captures inbound interest and scores by simple rules (company size, use case, channel)
- **Post-launch (when pipeline justifies):** ERPNext or Twenty CRM

### What the Sage ring does
- **BEFORE:** When evaluating whether to pursue a lead, the ring checks the reasoning. Is this lead being pursued because it genuinely aligns with SageReasoning's mission (principled reasoning infrastructure) or because of appetite (philarguros — love of money) or fear of missing an opportunity?
- **AFTER:** Tracks lead pursuit patterns over time. Detects if the founder consistently pursues large enterprise deals while ignoring smaller agent developers — is that a strategic choice or an oikeiosis gap?

---

## Task 10: AI-Driven QA and Response Monitoring

### What goes in the gap
A system that reviews outgoing support responses, API documentation, and public communications for quality and compliance.

### Recommended tool: **Phoenix (Arize AI)**
- **URL:** https://phoenix.arize.com
- **Type:** Open-source (Elastic License 2.0), fully free
- **Limits:** All features included, no feature gating, no limits
- **Why this one:** Comprehensive LLM evaluation and monitoring. Can evaluate every Claude API call SageReasoning makes — both support drafts and sage-skill outputs. OpenTelemetry standard means it integrates with the existing token instrumentation already built into the ring-wrapper

### Runner-up: **Langfuse** (open-source + 50K events/month free cloud)
- Lighter weight, easier setup, good prompt management
- Evaluation features restricted on free tier — Phoenix is more capable at zero cost

### What the Sage ring does
- **BEFORE:** The ring IS the primary QA layer for reasoning quality. Phoenix monitors the operational metrics (latency, token usage, error rates). The ring monitors the philosophical metrics (R1/R3/R9 compliance, passion-free language, source fidelity)
- **AFTER:** Phoenix catches when an LLM output hallucinated or went off-topic. The ring catches when an LLM output was factually correct but philosophically unsound ("Your action scored 7/10" — R6d violation, numeric scoring is prohibited). Two layers, two concerns, zero overlap

---

## Summary: The Recommended Stack

| # | Task | Gap Tool | Cost | Self-Hosted? |
|---|------|----------|------|-------------|
| 1 | Customer inquiry resolution | **Tawk.to** | Free | No (cloud) |
| 2 | Email ticketing and routing | **FreeScout** | Free | Yes ($5/mo VPS) |
| 3 | Knowledge base self-service | **Docusaurus** | Free | No (Vercel/GH Pages) |
| 4 | Workflow automation | **n8n** | Free | Yes ($5/mo VPS) |
| 5 | AI draft generation | **Claude API** (already in stack) | ~$0.01–0.03/draft | No |
| 6 | Escalation and handoff | **Built into #1 + #2** | Free | — |
| 7 | Programmatic email for agents | **Resend** | Free (3K/mo) | No (cloud) |
| 8 | Omnichannel (future) | **Chatwoot** | Free | Yes (when needed) |
| 9 | Lead qualification | **Spreadsheet + n8n** → **ERPNext** | Free | Yes (when needed) |
| 10 | QA and response monitoring | **Phoenix (Arize)** | Free | Yes ($5/mo VPS) |

### Total infrastructure cost: ~$10–15/month
Two $5/month VPS instances (one for FreeScout + n8n, one for Phoenix) cover all self-hosted tools. Everything else runs on existing infrastructure (Vercel, Supabase) or free cloud tiers.

### What you do NOT need to buy
- No Intercom ($39–99/seat/month) — Tawk.to + FreeScout covers it
- No Zapier ($20–100/month) — n8n self-hosted covers it
- No Freshdesk ($15–79/agent/month) — FreeScout covers it
- No Front ($19–99/seat/month) — Chatwoot covers it when needed
- No AgentMail (unknown pricing) — Resend + Mailgun covers it
- No Help Scout ($22–65/user/month) — FreeScout + Docusaurus covers it
- No Tidio ($29–59/month) — Tawk.to covers it

### The Sage ring's unique contribution
None of these tools reason. They route, draft, score, monitor, and automate — but they don't evaluate whether the actions passing through them are principled. That's the gap the ring fills. Every operational tool listed above slots into the ring's inner gap. Every action they take passes through the ring's BEFORE and AFTER checks. The tools are commodities. The ring is the moat.
