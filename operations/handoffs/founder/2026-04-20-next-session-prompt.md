# Next Session Prompt — Paste into a new session

You are resuming work on SageReasoning. The previous session drafted a refreshed PROJECT_STATE.md and audited the four status HTML files. Nothing was written to live governing documents — everything downstream is gated on founder approval of the draft.

## First, orient yourself by reading these files in this order

1. `/operations/session-handoffs/2026-04-20-html-refresh-session-close.md` — full handoff from the previous session
2. `/drafts/2026-04-20_PROJECT_STATE_draft.md` — the drafted refresh awaiting my approval
3. `/PROJECT_STATE.md` — the current live version (for diff context)
4. `/operations/knowledge-gaps.md` — scan KG1–KG7 for concepts relevant to this session (PR5 protocol)
5. `/operations/verification-framework.md` — how I verify work

## Context summary

- Four HTML status files were flagged as stale: Capability Inventory, Ecosystem Map, Architecture Map (Flow Tracer), and startup_org_chart.
- **Ecosystem Map** is data-driven from `component-registry.json` (already v1.2.0, 163 components) — no update needed.
- **Capability Inventory** is data-driven from the same JSON, but has a hardcoded header text that is stale ("7 April 2026 | 148 components" → should be "18 April 2026 | 163 components").
- **Flow Tracer** and **Org Chart** are fully hardcoded and need rewrites.
- Before any HTML rewrite, the founder required the source-of-truth document (PROJECT_STATE.md) be brought up to date — it was 10 sessions behind.
- PROJECT_STATE draft is ready in `/drafts/`. Backups of all four HTML files are in `/backup/2026-04-20_*`.

## What I need from you in this session

### Step 1: Wait for my approval of the draft

Do not replace the live PROJECT_STATE.md until I explicitly say "approved" (or "approved with these edits: ..."). If I ask for changes, update the draft only, not the live file. User preference: "Never edit strategic or governing documents without my explicit approval."

### Step 2: Once approved, replace the live file

When I approve:
- Copy `/drafts/2026-04-20_PROJECT_STATE_draft.md` to `/PROJECT_STATE.md` (the backup at `/backup/2026-04-20_PROJECT_STATE.md` is already in place)
- Confirm the replacement with a file size comparison

### Step 3: Flow Tracer rewrite (`/SageReasoning_Architecture_Map.html`)

This is the biggest task. The file is ~1,291 lines of hardcoded JS with `nodes` and `flows` objects.

Required changes identified in the previous session:
- **Remove:** node `api-score-conversation` (orphaned endpoint `/score-conversation` does not exist in the codebase).
- **Add:** 11 missing endpoints — score-scenario, evaluate, baseline-agent, and the 7 mentor endpoints (private-mentor, public-mentor, reflect, baseline, baseline-response, journal-week, founder-hub).
- **Update existing flow descriptions:**
  - `sage-guard` flow: add note about ADR-006 (Ring wrapper Critical escalation)
  - `sage-decide` flow: add note about ADR-005 (risk_class parameter)
- **Remove or clarify:** node `senecan-grading` (unclear, not in current architecture)
- **Classify 23 current LLM endpoints** across Layers 1–5 and the 9 agent-native categories.

**Before starting the rewrite:** re-run an Explore subagent against `/website/src/app/api/**` to regenerate the endpoint inventory. Write the full subagent output to `/operations/2026-04-XX-flow-tracer-audit.md` before editing the HTML — per the KG8 lesson from last session, subagent findings must be persisted to disk, not held in context only.

After regenerating: show me the diff (summary of node/flow changes) before applying.

### Step 4: Org Chart update (`/startup_org_chart.html`)

Smaller file. Hardcoded. Changes needed:
- Footer: "Session 10 · Sole Founder + AI Agent Org Model · April 2026" → "Session 21 · ... · April 2026"
- Header counts: "4 named agents · 5 context layers · 19 LLM endpoints" → "23 LLM endpoints"
- Agent status badges (`<span class="status-live">LIVE</span>`) — check each against PROJECT_STATE and downgrade as needed. Per draft: Tech/Growth/Support brains are Scaffolded; Support agent is Designed; Sage-Ops is Scoped. None are Live. Ask me what the "LIVE" badge should represent in this context before changing.
- Bottom status table: "Stoic Brain (shared) - 19 endpoints - LIVE" → 23 endpoints

### Step 5: Capability Inventory header (`/SageReasoning_Capability_Inventory.html`)

One-line HTML change. The body renders from JSON and is already correct at 163 components. Only the hardcoded header text needs updating:
- "7 April 2026 | 148 components" → "18 April 2026 | 163 components"

### Step 6: Produce final verification package

After all edits:
- List every file changed with its full path
- For each file: what text/count changed, and what I should see when I open it
- Provide computer:// links to each updated file
- A short "how to keep these in sync going forward" note — which files are data-driven (update JSON only) vs hardcoded (edit HTML directly), and the recommended refresh cadence

## Behaviour expectations

- **Classify every change under 0d-ii.** These edits are Standard risk (documentation + HTML). No Critical changes expected. If anything touches code (not just docs/HTML), escalate to Elevated or Critical per the Critical Change Protocol.
- **Apply user preferences:** plain language, exact copy/paste text, specific menu paths. I do not read code — verify for me.
- **Backup before edit.** Backups are in place for the PROJECT_STATE refresh. For the HTML rewrites, the 18 April backups cover them.
- **Use TodoWrite** to track the six steps above.
- **Write subagent outputs to disk immediately** if you delegate any research — don't leave audit findings in context alone (KG8 from 20 April session).
- **Session close at the end:** produce a handoff note in `/operations/session-handoffs/` following the 0b format.

Start by reading the four orientation files above, then confirm the plan before acting.
