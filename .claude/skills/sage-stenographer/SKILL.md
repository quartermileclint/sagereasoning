# sage-stenographer — Session Handoff Automation

**Trigger:** The founder says "close session", "session close", "wrap up", "handoff", "end session", or any variant indicating the working session is ending and context should be captured.

Also triggered at session open when the founder says "read the handoff", "catch up", "where were we", or "continue from last session".

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

### Step 4: Only then read reference documents

If the handoff note references specific files needed for the first task, read those. Don't read the entire project just because it exists.

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
