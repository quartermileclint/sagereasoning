# Startup Foundations Bundle

A toolkit for non-technical founders building startups with AI collaboration. Proven during SageReasoning P0 (Oct 2025 – Apr 2026).

---

## What's in the bundle

| # | Tool | What it solves | Type |
|---|------|---------------|------|
| 1 | **Session Handoff Protocol** | Context lost between AI sessions | Skill + Template |
| 2 | **Shared Status Vocabulary** | "Built" means different things to each party | Template (project instructions) |
| 3 | **Verification Framework** | Founder can't read code, AI can't persist | Template (project instructions) |
| 4 | **Communication Signals** | "Build X" is ambiguous | Template (project instructions) |
| 5 | **File Organisation + INDEX** | Can't find current version of documents | Template (folder structure) |
| 6 | **Decision Log** | Reasoning scattered across conversations | Template (append-only file) |
| 7 | **Hold Point Assessment** | Moving forward on assumptions, not evidence | Template (assessment framework) |

---

## Quick start (5 minutes)

### Step 1: Copy Templates 1–4 into your project instructions

Open: `operations/startup-foundations-templates.md`

Copy the content from Templates 1–4 (Session Handoff, Status Vocabulary, Verification Framework, Communication Signals) into your project's Claude instructions or system prompt.

These four solve the most common problems immediately and require no infrastructure.

### Step 2: Install the sage-stenographer skill

The skill lives at: `.claude/skills/sage-stenographer/SKILL.md`

Once installed, say "close session" at the end of any working session to get a structured handoff note. Say "where were we" at the start of a new session to resume.

### Step 3: Create the folder structure (when ready)

Follow Template 5 to organise your project files. Create `INDEX.md` at the project root.

### Step 4: Start the decision log (when you make your first significant decision)

Follow Template 6. Create `operations/decision-log.md`.

### Step 5: Use the hold point assessment (before any major phase transition)

Follow Template 7. The key principle: test on yourself with real data before committing to the next phase.

---

## File locations

| File | Purpose |
|------|---------|
| `.claude/skills/sage-stenographer/SKILL.md` | Automated session handoff skill |
| `operations/startup-foundations-templates.md` | All 7 templates in one reference document |
| `operations/startup-foundations-bundle.md` | This file — overview and quick start guide |

---

## Origin

These tools emerged from necessity during a real startup build by a non-technical founder collaborating with AI. They were not designed in advance — they were created to solve problems as they appeared, refined through daily use, and formalised only after proving their value.

The session handoff protocol alone was tested across 10+ sessions before being automated as a skill. The shared status vocabulary resolved misalignment that was causing compounding confusion across 20+ rules and dozens of modules. The hold point assessment caught gaps that would have been invisible without real-data testing.

---

## What this is NOT

- Not a platform or web application
- Not a dashboard
- Not a course or methodology to study
- Not a replacement for domain expertise

It's a set of practical tools that make AI collaboration work better for founders who can't read code. Nothing more.
