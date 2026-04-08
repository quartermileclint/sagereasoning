# sage-stenographer — Session Handoff Automation

**Trigger:** The founder says "close session", "session close", "wrap up", "handoff", "end session", or any variant indicating the working session is ending and context should be captured.

Also triggered at session open when the founder says "read the handoff", "catch up", "where were we", or "continue from last session".

Also triggered for debriefs when the founder says "debrief this session", "run a debrief", "debrief [date]", or any variant indicating a structured retrospective is needed on a specific session.

---

## What This Skill Does

This skill automates the structured session handoff protocol (P0 item 0b). It captures the key information from a working session into a standardised handoff note, and reads previous handoff notes at the start of a new session.

**Why this matters:** Every new AI session starts cold. Without a structured handoff, the founder re-explains context and the AI re-reads thousands of lines. The handoff note is the bridge.

---

## When to Use

### Session Close (capture)
- The founder signals the session is ending
- A natural breakpoint has been reached
- The founder wants to save progress before switching contexts

### Session Open (resume)
- A new session starts and the founder wants to pick up where they left off
- The founder pastes a "next session prompt" into a new session

### Session Debrief (retrospective)
- A session involved a significant failure or extended troubleshooting
- Either party requests a structured retrospective
- The debrief is produced in a subsequent session, not the same session as the failure

---

## Session Close — How It Works

### Step 1: Review the session

Before writing anything, review what happened this session:
- What decisions were made and why?
- What changed status? (Use the shared vocabulary: Scoped / Designed / Scaffolded / Wired / Verified / Live)
- What was completed?
- What's blocked and on what?
- What questions remain unanswered?
- What should the next session do first?

### Step 2: Write the handoff note

Create a file at:
```
operations/session-handoffs/YYYY-MM-DD_session-close.md
```

If a file with that name already exists (multiple sessions in one day), append a letter suffix:
```
operations/session-handoffs/YYYY-MM-DD_session-close-b.md
operations/session-handoffs/YYYY-MM-DD_session-close-c.md
```

Use this exact format:

```markdown
# Session Close — [Date] (Session [letter if applicable])

## Decisions Made

- **[Decision title]**: [What was decided]. Reasoning: [why, including alternatives considered]. -> [Impact on build]

## Status Changes

- [Module/Component]: [Old status] -> **[New status]**

## Completed Work

[Numbered list of everything completed this session, grouped by category if helpful]

## Where We Are in [Current Priority]

[Brief narrative of where the project stands — what phase, what's done, what's next]

## Next Session Should

1. [First thing to do]
2. [Second thing to do]
3. [etc.]

## Blocked On

- **[Blocker]**: [What's waiting for what, and who can unblock it]

## Open Questions

- [Unresolved items needing founder input]

## Key Files Modified This Session

| File | Change |
|------|--------|
| [path] | [what changed] |
```

### Step 3: Write the next-session prompt

Create or overwrite:
```
operations/session-handoffs/next-session-prompt.md
```

This file contains a ready-to-paste prompt the founder can copy into a new session. Format:

```markdown
# Next Session Prompt

Copy everything below the line into a new session.

---

Read the session handoff note first: `/operations/session-handoffs/[latest handoff filename]`

This is a continuation of [project context]. We are in [current phase/priority].

**What's done:**
- [Key completed items — enough for the new session to orient]

**What's just happened:**
- [Most recent work from the closing session]

**What to do now:**
1. Read the handoff note
2. [Specific next actions]

**Important context:**
- [Any standing instructions the new session needs]
- [User preferences that affect how work is done]
- [Key file locations the new session will need]
- [If starting a new priority stage: "**REMINDER:** Check `operations/allowance-for-future.md` for stage-specific action items before beginning work on P[N]."]
```

### Step 4: Confirm with the founder

Present a brief summary of what was captured:
- Number of decisions logged
- Number of status changes
- What the next session prompt says to do first
- Ask if anything was missed

---

## Session Open — How It Works

### Step 1: Find the latest handoff

Look in `operations/session-handoffs/` for the most recent `session-close` file (by date and letter suffix).

### Step 2: Read it

Read the handoff note in full. Do NOT read other reference documents yet — the handoff note tells you what you need.

### Step 3: Orient the founder

Provide a brief summary:
- "Last session on [date], we [key accomplishment]."
- "Status changes: [list any]."
- "The handoff says to start with: [first item from Next Session Should]."
- "There are [N] blockers and [N] open questions."

### Step 4: Check for stage-relevant allowances

If the handoff note or founder's message indicates work is beginning on a **new priority stage** (P1, P2, P3, P4, P6, P7), read:
```
operations/allowance-for-future.md
```

Find the section for that priority stage and present the ACTION and MONITOR items to the founder before starting work. Format:

> **Allowances for [Stage Name]:** There are [N] action items and [N] monitoring checks from external research that apply to this stage. Here's what to review before we begin:
> - [Summary of each ACTION item]
> - [Summary of each MONITOR item — with instruction to check for updated information]

If the session is continuing work within the same priority stage (not starting a new one), skip this step.

### Step 5: Only then read reference documents

If the handoff note references specific files needed for the first task, read those. Don't read the entire project just because it exists.

---

## Session Debrief — How It Works

**When to use:** When a session involved a significant failure, extended troubleshooting that affected the founder's ability to use a live system, or when either party requests a structured retrospective. Per protocol 0b-ii, the debrief is always produced in a subsequent session — never in the same session as the failure.

### Step 1: Identify the session to debrief

The founder will specify which session to debrief, either by date or by describing the incident. Find the relevant:
- Session handoff note in `operations/session-handoffs/`
- Decision log entries from that date in `operations/decision-log.md`
- Any existing debrief files in `operations/session-debriefs/`

### Step 2: Analyse the session

Review the available records and assess the session against five dimensions:

1. **What happened** — Plain-language narrative of events. What was the goal? What went wrong? What was the actual impact on the founder's ability to use the system?

2. **Communication failures** — Where did the signals break down? Did the AI present uncertainty as confidence? Did it skip the verify-decide-execute sequence? Did the founder's intent get misunderstood? Reference the communication signals from 0d (e.g., "The AI should have signalled 'This has a known risk' but instead presented the change as routine").

3. **Process failures** — Which protocols were violated or missing? Map failures to specific P0 items (0a–0g) or manifest rules (R0–R20). Identify whether the failure was a protocol gap (no rule existed) or a compliance gap (rule existed but wasn't followed).

4. **What should change** — Specific, actionable proposals. For each proposal, state: what it changes, which governance layer it belongs to (About Me / Project Instructions / Manifest / Verification Framework), and what it prevents.

5. **Mentor observations** — Observations relevant to the founder's mentor profile. What passions were involved? What false judgements? What does this reveal about reasoning patterns? These observations should follow the Stoic framework: identify the impression, the assent (or hasty assent), and the resulting action.

### Step 3: Write the debrief document

Create a file at:
```
operations/session-debriefs/YYYY-MM-DD_debrief-[topic].md
```

Use this format:

```markdown
# Session Debrief — [Date]: [Brief Topic Description]

**Debrief produced:** [Date of this session]
**Session debriefed:** [Date of the session being analysed]
**Trigger:** [What prompted the debrief — failure type, founder request, etc.]

---

## What Happened

[Plain-language narrative. No jargon. Written so someone with no coding experience can understand what went wrong and what the impact was.]

## Communication Failures

- **[Failure]**: [What signal was missing or wrong]. Should have been: [correct signal per 0d]. Impact: [what happened because of the missing signal].

## Process Failures

- **[Failure]**: [Which protocol was violated or missing]. Reference: [P0 item or manifest rule]. Classification: [Protocol gap / Compliance gap].

## What Should Change

### [Proposal 1 Title]

**What it changes:** [Description]
**Governance layer:** [About Me / Project Instructions / Manifest / Verification Framework]
**What it prevents:** [Specific failure mode this addresses]
**Proposed text:** [Exact text to add or modify, if applicable]

### [Proposal 2 Title]
[Same format]

## Mentor Observations

- **Passion identified:** [Root passion and sub-species, if applicable]
- **False judgement:** [The specific false judgement involved]
- **Pattern:** [Does this connect to previously observed patterns?]
- **Stoic frame:** [Brief Stoic analysis — impression, assent quality, resulting action]

---

## Status

- [ ] Debrief reviewed by founder
- [ ] Proposals assessed (adopted / modified / rejected)
- [ ] Adopted changes applied to governance documents
- [ ] Decision log updated
```

### Step 4: Cross-reference with the decision log

Check if the debrief's findings connect to any existing decisions in `operations/decision-log.md`. Note connections in the debrief.

### Step 5: Present to the founder

Summarise the debrief:
- Number of communication failures identified
- Number of process failures identified
- Number of proposals
- Key mentor observation
- Ask the founder to review and decide which proposals to adopt

---

## Important Notes

- **Honesty over completeness.** If nothing was decided, say "No decisions made." If nothing is blocked, say "Nothing currently blocked." Don't pad the handoff with filler.
- **Use the shared status vocabulary.** Always: Scoped / Designed / Scaffolded / Wired / Verified / Live. Never use ambiguous terms like "done" or "built" without the formal status.
- **The founder can't read code.** Describe changes in terms of what they do, not how they're implemented. "Genuine deletion endpoint replacing placeholder" not "Replaced 503 response with cascading delete across 8 tables."
- **Capture reasoning, not just decisions.** The next session's AI has no memory. It needs to know *why* a decision was made, not just what it was.
- **File modifications table is essential.** The next session needs to know exactly which files were touched, so it can verify the state of the codebase without re-reading everything.
- **The next-session prompt is the founder's tool.** It should be written so the founder can copy-paste it without editing. Keep it self-contained.

---

## File Locations

| File | Purpose |
|------|---------|
| `operations/session-handoffs/` | Directory containing all handoff notes |
| `operations/session-handoffs/YYYY-MM-DD_session-close[-x].md` | Individual session handoff notes |
| `operations/session-handoffs/next-session-prompt.md` | Ready-to-paste prompt for the next session |
| `operations/session-debriefs/` | Directory containing all debrief documents |
| `operations/session-debriefs/YYYY-MM-DD_debrief-[topic].md` | Individual session debrief documents |
| `operations/allowance-for-future.md` | Stage-triggered checklists from external research (check when starting new priority stage) |

---

## Quality Checklist

Before finalising a session close, verify:

- [ ] Every decision includes reasoning (not just the decision itself)
- [ ] Status changes use the shared vocabulary
- [ ] "Next Session Should" has specific, actionable items (not vague "continue work")
- [ ] Blockers identify who/what can unblock them
- [ ] Key files table includes every file modified this session
- [ ] Next-session prompt is self-contained and copy-pasteable
- [ ] The founder has reviewed and confirmed nothing was missed
