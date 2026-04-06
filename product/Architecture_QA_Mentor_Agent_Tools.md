# SageReasoning — Architecture Q&A: Mentor, Agent, Skills, Tools

**Date:** 4 April 2026
**Context:** Clarifying how the Sage ring, support agent, tools, skills, and persistent memory relate to each other — and how the markdown-first approach simplifies the operational stack.

---

## Q1: Is the gap filled with a support agent who has ten tools?

Yes. The four terms map like this:

- **Mentor** = the Sage ring. Permanent. Holds your profile, runs before/after reasoning checks, enforces R1–R14. Never does operational work itself. Evaluates and prescribes.
- **Agent** = the thing in the gap. A "support agent" whose job is handling all operational tasks for running SageReasoning as a business. Knows nothing about Stoicism. Just does work and reports back.
- **Tools** = what the support agent uses. The 10 operational capabilities (chat, ticketing, KB, workflows, email, etc.). The agent picks up a tool, uses it, puts it down. Tools don't reason.
- **Skills** = SageReasoning-specific. The sage-skills (sage-guard, sage-score, sage-reason, etc.) live in the ring, not in the gap. The support agent never calls a sage-skill directly. The ring calls them as part of its before/after checks.

**Flow example:** Customer emails a question → ring's BEFORE check evaluates governance implications → support agent creates a ticket and drafts a reply (using tools) → ring's AFTER check evaluates the draft against R1/R3/R9 → draft reaches Clinton for review.

The support agent needs API keys/logins for its tools. The mentor needs no credentials — it only reads the support agent's inputs and outputs.

---

## Q2: SageReasoning Component Layout + OpenBrain Integration

### Layer 0 — The Brain (static, read-only)
8 JSON data files (stoic-brain, psychology, passions, virtue, value, action, progress, scoring). Derived from 9 original-language translations. The ring reads them; nothing writes to them.

**OpenBrain equivalent:** None. Jones doesn't have a static knowledge core. Unique to SageReasoning.

### Layer 1 — The Ring (the mentor's logic)
8 built TypeScript modules: persona.ts, ring-wrapper.ts, journal-ingestion.ts, profile-store.ts, sanitise.ts, proactive-scheduler.ts, pattern-engine.ts, authority-manager.ts.

**OpenBrain equivalent:** AI Sorter (step 4) + Agency layer (step 9). The ring classifies, routes, and proactively revisits. But also evaluates reasoning quality — which Jones doesn't do.

### Layer 2 — The Memory (persistent, read-write)
Currently: 8 Supabase tables with RLS (mentor_profiles, mentor_passion_map, mentor_causal_tendencies, mentor_value_hierarchy, mentor_oikeiosis_map, mentor_virtue_profile, mentor_journal_refs, mentor_interactions). Rolling window: 50 interactions, 30 days.

**OpenBrain equivalent:** Persistent database (step 1) + embeddings (step 2) + immutable log (step 5).

**What's missing (to integrate OpenBrain):**
- `mentor_raw_inputs` table — append-only, every interaction logged verbatim (Jones's "receipt")
- `mentor_embeddings` table — vector column using Supabase pgvector (Jones's embeddings step)
- Semantic search function — "find similar past situations" across months of data

### Layer 3 — The Gap (support agent + tools)
The support agent and its 10 operational tools/capabilities. Receives tasks from the founder or automated triggers, uses tools to execute, everything passes through the ring.

**OpenBrain equivalent:** Applications on top (step 10). The brain isn't the product — the apps are.

### Layer 4 — The Interfaces (human + agent access)
Website (Next.js/Vercel), API endpoints (sage-skills), discovery files (llms.txt, agent-card.json, AGENTS.md), dashboard, knowledge base.

**OpenBrain equivalent:** Universal interface (step 7) + human dashboard (step 8).

---

## Q3: Can Mentor and Support Agent Stay Local? What Goes to Supabase?

### Stays local (your machine):
- Ring logic (all 8 TypeScript modules) — just code
- Support agent process
- 8 Stoic Brain JSON files — static data
- Proactive scheduler — cron jobs on your machine
- Pattern engine — batch processing

### Must be on Supabase (persistent remote):
- Longitudinal profile (passion map, causal tendencies, value hierarchy, oikeiosis map, virtue profile) — survives device failure, accessible from anywhere
- Interaction history (rolling window + immutable raw log)
- Journal reference index
- Accreditation records — public endpoint requires internet access
- User authentication (Supabase Auth + RLS)

### Optional (either way):
- Pattern engine summaries — local is faster, Supabase is more durable
- Token usage instrumentation — local for personal, Supabase for long-term analysis
- Support agent operational data — Supabase only if the mentor needs to reason about operational patterns over time

**Summary:** Brain and body are local, memory is in the cloud.

---

## Q4: What Is Missing?

### Memory layer (OpenBrain integration):
- Vector embeddings on interactions (pgvector)
- Immutable raw input log (append-only table)
- Semantic retrieval function for the ring

### Support agent:
- The agent process itself — no inner agent built or registered yet
- Tool connectors (glue code for each tool's API)
- Credential management (secure API key storage)

### Ring integration:
- Supabase tables for Agent Trust Layer (designed, not created)
- LLM wiring for before/after checks (prompt builders exist, not connected to live API)
- Website integration (modules exist as TypeScript, no UI)

### Operations:
- Stripe integration (designed, not connected)
- Knowledge base article content
- Email infrastructure setup (Resend account, domain, templates)

### Governance:
- Lawyer review of privacy policy (deadline: 10 Dec 2026)
- EU Art. 6 classification review (deadline: 2 Aug 2026)
- Professional indemnity insurance (pre-launch)

### Already built (not missing):
- Entire Stoic Brain (8 JSON files)
- All 8 sage-mentor modules
- Compliance pipeline (R14)
- Security hardening (11 fixes)
- Token efficiency architecture
- Governance manifest (R1–R14)

---

## Q5: Markdown Output Versions Instead of Open-Source Tools?

### The concept
Instead of deploying hosted tools (FreeScout, n8n, Tawk.to), the support agent reads and writes markdown files in a local folder. The mentor reads those same files through the ring. They share a filesystem, not APIs.

### How each task becomes a markdown operation

| # | Task | Markdown Approach |
|---|------|-------------------|
| 1 | Customer inquiries | `support/inbox/` — each inquiry is a .md file with frontmatter (date, channel, status, customer). Agent drafts reply in the file. |
| 2 | Ticketing | Same files. Status in frontmatter: `status: open / in-progress / resolved / escalated`. Folder IS the ticket system. |
| 3 | Knowledge base | `knowledge-base/` folder of .md articles. Agent searches these to draft answers. |
| 4 | Workflow automation | `workflows/` folder with .md playbooks (trigger + steps). Agent reads and follows them. Agent IS the automation engine. |
| 5 | Draft generation | Agent writes draft in the inbox file. Mentor evaluates. Founder approves/edits. All in same file. |
| 6 | Escalation | Agent changes frontmatter to `status: escalated` + adds note. Mentor's BEFORE check can trigger this for R1/R2/R10 topics. |
| 7 | Agent email | `notifications/` folder. Agent writes notification .md; simple script sends via Resend. Or founder sends manually. |
| 8 | Omnichannel | All channels → same `support/inbox/` structure. `channel:` frontmatter field distinguishes source. |
| 9 | Lead qualification | `leads/` folder. Each lead is a .md with frontmatter (company, source, score, status). Agent writes research in body. |
| 10 | QA monitoring | Mentor's AFTER check IS the QA. Every draft evaluated before founder sees it. No separate tool. |

### What this gives you
- Zero infrastructure cost
- Everything readable by both humans and agents
- Mentor and support agent share context via filesystem
- Full version history via Git (Git history = OpenBrain's immutable log)
- Review, edit, approve in any text editor or Cowork

### What this costs you
- No live chat widget (add Tawk.to later just for the widget if needed)
- No real-time notifications (agent processes inbox on schedule — every 15 min, hourly)
- Manual email send (or thin Resend script)

### Upgrade path
When volume grows, add hosted tools (Tawk.to, FreeScout) as faster interfaces into the same data. The markdown files remain the canonical record.
