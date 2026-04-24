# 0h Completion Session Prompt

Paste everything below the line into a new session.

---

## Context

Read these files first, in this order:

1. `operations/session-handoffs/2026-04-18-holdpoint-inventory-session-close.md` — the most recent session (capability inventory refresh)
2. `operations/holdpoint-assessment-4-updated.md` — the updated Assessment 4 showing where every component stands
3. `operations/holdpoint-assessment-3-5.md` — Assessments 3 and 5 (value demonstration + startup toolkit definition), specifically the "What remains before 0h exit" section at the bottom
4. `operations/knowledge-gaps.md` — check KG1–KG7 for relevance before beginning work
5. `operations/verification-framework.md` — the verification methods you'll use to confirm your work

## Where We Are

The P0 hold point (0h) has 7 exit criteria. Five are met. Two remain:

**Criterion 6 — Toolkit additions built with simplest interface:**
- Build sage-stenographer skill (automates session handoff capture). The manual pattern has been proven over 35+ handoff notes. Assessment 5 identifies this as the highest-priority toolkit item. See `operations/holdpoint-assessment-3-5.md` for the full toolkit definition.
- Create project instruction templates for the remaining 6 startup foundations tools (status vocabulary, verification framework, communication signals, file organisation, decision log, hold point assessment). These are low-effort text templates — not code.
- Package all 7 as a "startup foundations" bundle.
- Per 0h limitation 4: "the simplest possible interface that lets a regular person use these capabilities." Skills and templates only. No web interface, no dashboard, no platform.

**Criterion 7 — Founder has clear view of what P1 evaluates:**
- The founder needs to see, in plain language, what the business plan review (P1) will assess. The evidence base is: Assessments 1-5, the capability inventory (163 components), the gap analysis (2 blockers, 4 significant, 2 minor), and the decision log.
- Produce a short summary (1 page max) of what P1 evaluates and present it to me for confirmation.

## Separate Activities to Verify

I have other work running in parallel sessions. Before completing 0h, verify the current state of these items by checking the codebase — don't assume they're done just because a handoff note says so:

1. **Jest configuration for website directory** — check if `website/jest.config.ts` (or `jest.config.js`) now exists. If it does, run `npx jest` in the website directory and report the result. If it doesn't, note it as still outstanding.
2. **Haiku (Stage 2) Zone 2 verification** — check if any new test results exist in `operations/safety-signal-audits/` beyond the 18 April regex-only audit. If the Haiku stage has been tested, report the results. If not, note it as still outstanding.
3. **selectModelByDepth() integration into sage-reason-engine** — check `website/src/lib/sage-reason-engine.ts` for whether it now uses `selectModelByDepth()` from `constraints.ts` or still uses an inline ternary for model selection. Report whichever you find.
4. **RLS on cost tracking migration** — check `supabase/migrations/20260417_r20a_classifier_cost_tracking.sql` for whether RLS policies have been added. The test harness flagged this as a warning.

Report the status of all 4 items before proceeding to criterion 6 work.

## What to Build

### Task 1: Sage-Stenographer Skill

Build a skill that automates session handoff capture. The manual handoff format is:

```
# Session Close — [Date]
## [Brief description of what was done]

## Decisions Made
- [Decision]: [Reasoning] → [Impact on build]

## Status Changes
| Item | Old Status | New Status |
|---|---|---|
| [component] | [old] | [new] |

## What Was Completed
[Numbered list of what was done]

## What Was NOT Completed
[What was left undone and why]

## Next Session Should
1. [First thing to do]
2. [Second thing to do]

## Blocked On
- [What's waiting for what]

## Open Questions
- [Unresolved items needing founder input]
```

The skill should:
- Be invocable at session close (e.g., founder says "close session" or "session handoff")
- Produce the structured handoff note from conversation context
- Save it to `operations/session-handoffs/` with the date-based naming convention
- Include a "Knowledge Gap Flags" section if any concept was re-explained during the session

### Task 2: Startup Foundations Templates

Create project instruction templates for the 6 remaining toolkit items. Each template should be plain text that a founder can paste into their AI project instructions. Keep them short and practical — under 1 page each.

1. **Status vocabulary** — the Scoped → Designed → Scaffolded → Wired → Verified → Live definitions
2. **Verification framework** — verification methods by work type (simplified from our full framework)
3. **Communication signals** — founder signals + AI signals tables
4. **File organisation** — folder structure + INDEX.md convention
5. **Decision log** — format template + maintenance protocol
6. **Hold point assessment** — the 5-assessment framework (What works? What's missing? What value? Inventory? Toolkit?)

### Task 3: Bundle

Package sage-stenographer + the 6 templates as a "startup foundations" bundle. The simplest viable format — a single directory or a README that explains what each piece is and how to use it.

### Task 4: P1 Summary for Founder

Write a 1-page plain-language summary of what the business plan review (P1) evaluates. Reference the specific evidence from Assessments 1-5 and the capability inventory. Present this to me for confirmation — this is criterion 7.

## Rules

* Run pre-implementation verification before each task: check existing state, don't re-implement completed work.
* Use the 0a status vocabulary (Scoped → Designed → Scaffolded → Wired → Verified → Live).
* Signal confidence level per 0d protocol.
* Classify change risk per 0d-ii protocol before making changes.
* Run `tsc --noEmit` and `eslint src/` after any code changes to confirm no regressions.
* Produce a handoff note at session close.

## CRITICAL: Do Not Exit 0h

**Do not declare the hold point complete or suggest moving to P1 until I explicitly confirm.** Present the completed work, present the P1 summary, and wait for my confirmation. The hold point is not a gate the AI controls — the founder decides when the criteria are met and when to proceed to P1.
