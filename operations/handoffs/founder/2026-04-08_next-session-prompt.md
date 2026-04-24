# Next Session Prompt — Paste This Into a New Session

---

## Context

This session continues work from 8 April 2026. That session produced two analysis documents that now need to be implemented. Read the handoff note first, then the two source documents.

**Read these files in this order:**

1. `/operations/session-handoffs/2026-04-08_session-close.md` — what happened, what changed, what's next
2. `/operations/session-debriefs/2026-04-08_product-line-applications.md` — 7 collaboration learnings mapped to specific product components (sage-guard, sage-decide, sage-reason, Sage Mentor, Agent Trust Layer, sage-stenographer, ring wrapper)
3. `/operations/session-debriefs/2026-04-08_research-gap-analysis.md` — 7 capability gaps identified by cross-referencing external research against our 29 active sage-* skills

## What I Need

These two documents describe overlapping improvements to the SageReasoning product line. I need you to:

### Step 1: Reconcile into a single prioritised implementation list

The product line applications document maps 7 debrief learnings to component improvements. The gap analysis identifies 7 capability gaps. Some overlap — for example, sage-guard improvements appear in both. Merge them into one list, removing duplicates and grouping by component.

### Step 2: Classify each item

For each item on the merged list, classify it as:

- **Wiring** — connecting existing components that aren't currently linked (e.g., sage-reflect → Mentor profile → ring BEFORE)
- **Extension** — adding a field, parameter, or mode to an existing skill/engine (e.g., adding `deliberation_quality` to sage-guard)
- **New build** — a new skill or service that doesn't exist yet (e.g., sage-challenge, sage-curriculum)

### Step 3: Prioritise using two criteria

1. **Does it serve our own development now?** Items that improve how we work during P0 come first (per the R0 oikeiosis sequence — Circle 1 before Circle 3).
2. **Is it wiring, extension, or new build?** Wiring existing components is highest priority because it unlocks value from what we already have. Extensions come next. New builds come last.

### Step 4: Propose the first implementation batch

Based on the prioritised list, propose which items to implement first. For each item in the first batch:

- Name the component being changed
- Describe what changes (specific fields, parameters, connections)
- Identify the files that need to be modified
- Classify the risk level (Standard / Elevated / Critical per project instructions 0d-ii)
- State what "verified" looks like for the founder (per the verification framework)

**Important:** Follow the project's task protocol — read the manifest, quote applicable rules, flag conflicts, classify risk, propose, wait for my OK, then execute. Do not implement anything until I approve the batch.

### Step 5: Update the decision log

After I approve and we implement, add a decision log entry documenting what was implemented and why.

## Ground Rules

- Read the project instructions carefully — they contain collaboration protocols (communication signals, risk classification, critical change protocol) that were adopted during the session that produced these documents.
- The founder has zero coding experience. Explain what you're doing in plain language. Provide exact file paths and menu paths for anything I need to do.
- Use the shared status vocabulary: Scoped → Designed → Scaffolded → Wired → Verified → Live.
- Signal your confidence level. If you're making an assumption, say so.

---
