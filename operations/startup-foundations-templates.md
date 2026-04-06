# Startup Foundations Toolkit — Templates

These templates encode the workflows proven during SageReasoning P0 (Oct 2025 – Apr 2026). They solve the practical problems a non-technical founder faces when building a startup with AI collaboration.

Each template can be adopted as project instructions, used as a skill prompt, or referenced as a standalone protocol.

---

## Template 1: Session Handoff Protocol

**Problem:** Every new AI session starts cold. Context is lost between sessions.

**Implementation:** Use the sage-stenographer skill (`.claude/skills/sage-stenographer/SKILL.md`) or follow this manual protocol.

### Session Close Format

```markdown
# Session Close — [Date]

## Decisions Made
- **[Decision]**: [What was decided]. Reasoning: [why]. -> [Impact]

## Status Changes
- [Component]: [Old status] -> **[New status]**

## Next Session Should
1. [First action]
2. [Second action]

## Blocked On
- **[Blocker]**: [What's waiting, who unblocks it]

## Open Questions
- [Unresolved items needing founder input]

## Key Files Modified
| File | Change |
|------|--------|
| [path] | [what changed] |
```

### Session Open Protocol
1. Read the most recent handoff note
2. Summarise to the founder: what happened last, what to do first
3. Only then read reference documents the first task requires

---

## Template 2: Shared Status Vocabulary

**Problem:** "Built" and "designed" mean different things to each party. Misalignment compounds across the project.

**Adopt by adding to project instructions:**

```
## Status Vocabulary

Every component, module, or deliverable uses exactly one of these statuses:

| Status | Meaning |
|---|---|
| **Scoped** | Requirements defined, no architecture or code yet |
| **Designed** | Architecture decided, schema/types may exist, no functional code |
| **Scaffolded** | Structural code exists (files, interfaces, placeholders) but doesn't do anything yet |
| **Wired** | Code connects to live systems (database, API, LLM) and functions end-to-end |
| **Verified** | Tested and confirmed working by both parties |
| **Live** | Deployed to production and serving real users/agents |

Never use ambiguous terms like "done", "built", "ready", or "complete" without specifying which status applies.
```

---

## Template 3: Verification Framework

**Problem:** The founder can't read code. The AI can't persist. Neither can confirm the other's work.

**Adopt by adding to project instructions:**

```
## Verification Methods

For each type of work, verification must be something the founder can perform:

| Work Type | How the Founder Verifies |
|---|---|
| Website page | Open the URL, check content matches specification |
| API endpoint | AI provides a test command + expected output; founder runs it |
| Database change | AI queries and shows result; founder confirms |
| Business document | Founder reads directly |
| Code change | AI runs automated tests and reports pass/fail; founder reviews summary |
| Configuration | AI shows before/after; founder confirms the change is correct |

The AI must:
- At session start, verify prior work rather than trusting previous output
- Provide verification evidence with every completed task
- Never mark something as "done" without showing the founder how to confirm it
```

### Test Harness Pattern

For projects with many components, create a test harness the founder can run:

```bash
node operations/test-harness.mjs
```

The harness should:
- Check every component's actual state (file exists, endpoint responds, function returns expected value)
- Report PASS / FAIL / WARN for each check
- Print a summary the founder can read without technical knowledge
- Be runnable with a single command

---

## Template 4: Communication Signals

**Problem:** "Build X" might mean explore, design, code, or deploy. The AI's recommendations don't signal confidence.

**Adopt by adding to project instructions:**

```
## Communication Signals

### Founder signals (use these exact phrases):
| Signal | Meaning |
|---|---|
| "Explore this" | Think about it, present options, don't build yet |
| "Design this" | Produce architecture/specification, don't write code yet |
| "Build this" | Write functional code, wire it up, make it work |
| "Ship this" | Deploy to production |
| "I've decided" | Decision is final, execute without re-debating |
| "I'm thinking out loud" | Don't act on this; I'm processing |

### AI signals (use these in responses):
| Signal | Meaning |
|---|---|
| "I'm confident" | Verified and reliable |
| "I'm making an assumption" | Proceeding on incomplete information — correct me if wrong |
| "I need your input" | Can't proceed without a decision from you |
| "I'd push back on this" | I think there's a better approach and want to explain why |
| "This is a limitation" | I can't do this / outside what I can verify |
```

---

## Template 5: File Organisation + INDEX

**Problem:** Documents multiply across directories. Neither party can reliably find the current version.

**Adopt this structure (adapt folder names to your project):**

```
/adopted/        — Current, governing documents
/drafts/         — Documents under review
/archive/        — Superseded versions (moved here, not deleted)
/business/       — Business plan, financials, investment case
/compliance/     — Register, audit log, reviews
/reference/      — Background research, analysis, interpretations
/operations/     — Session handoffs, decision log, test harness
/out/            — Generated outputs
```

**Create INDEX.md at project root:**

```markdown
# Project Index

Last updated: [date]

| Document | Location | Status | Last Modified |
|----------|----------|--------|---------------|
| [Name] | [/path/to/file] | [Adopted/Draft/Archived] | [date] |
```

**Rules:**
- Update INDEX.md at every session close
- When a document is superseded, move it to /archive/ and update INDEX.md
- Never delete documents — archive them with a note about what replaced them

---

## Template 6: Decision Log

**Problem:** Consequential decisions are scattered across conversations. Reconstructing reasoning requires searching multiple files.

**Create `operations/decision-log.md`:**

```markdown
# Decision Log

Append-only. Each entry records a decision, its reasoning, and its impact.

---

## [Date] — [Decision Title]

**Decision:** [What was decided]

**Reasoning:** [Why — including alternatives considered and why they were rejected]

**Rules/principles served:** [Which project rules or values this decision supports]

**Impact:** [What changes as a result — files modified, scope changed, timeline affected]

**Status:** Adopted / Under review / Superseded by [reference]
```

**Rules:**
- Every significant decision gets an entry (significant = affects architecture, scope, timeline, or principles)
- Entries are never edited after creation — if a decision changes, add a new entry that supersedes the old one
- Include alternatives considered, not just the choice made
- The decision log is reviewed at each hold point

---

## Template 7: Hold Point Assessment

**Problem:** Projects advance on assumptions rather than evidence. Nobody tests whether what's been built actually works until it's too late.

**When to use:** Before committing to a major phase transition (e.g., R&D to launch, MVP to scale, prototype to production).

**Create the assessment document:**

```markdown
# Hold Point Assessment — [Date]

## Assessment 1: What Works?

Test every component by using it yourself with real data — not test data.

For each component tested:
- What was tested
- How it was tested (real data, not synthetic)
- Founder verdict (accurate / inaccurate / partly right)
- Evidence for the verdict

## Assessment 2: What's Missing?

After testing, identify gaps — not from reading specs, but from trying to use the thing.

Categorise by severity:
- **Blocker** — Cannot proceed to next phase without resolving
- **Significant** — Should be resolved but doesn't prevent next phase
- **Minor** — Cosmetic or nice-to-have

## Assessment 3: What Value Can We Demonstrate?

For each audience:
- What can we show concretely, with real data, today?
- What can we NOT show today?
- What would it take to close the gap?

## Assessment 4: Capability Inventory

Catalogue every component with its true status (using the shared vocabulary) and readiness for each audience.

## Assessment 5: Toolkit / What Did We Learn?

What tools, workflows, or practices emerged during this phase that would be useful to others facing the same challenges?

## Exit Criteria

| Criterion | Status | Evidence |
|-----------|--------|----------|
| [From project plan] | Done / Pending | [How verified] |
```

**Rules:**
- The founder decides when exit criteria are met, not the AI
- The AI facilitates honestly, including surfacing findings the founder might not want to hear
- Testing uses real data from real use, not synthetic test cases
- Gaps are expected and useful — the point is to find them before committing

---

## How to Adopt These Templates

**Minimum viable adoption:** Copy Templates 1–4 into your project instructions. These four (handoffs, status vocabulary, verification, communication signals) solve the most urgent problems and require zero infrastructure.

**Full adoption:** Add Templates 5–7 and create the folder structure, INDEX.md, and decision log as files in your project.

**Skill-based adoption:** Install the sage-stenographer skill for automated session handoffs. The remaining templates work as project instructions without needing skills.
