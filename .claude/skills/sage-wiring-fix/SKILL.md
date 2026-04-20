---
name: sage-wiring-fix
description: Run the SageReasoning agent wiring fix protocol for a named Sage agent (mentor, support, tech, growth, ops). Produces a Scoped + Designed handoff file and a new-session prompt file. Use when the founder says "wiring fix", "run the wiring fix for <agent>", "find the broken channels for <agent>", "<agent> wiring fix", or pastes a numbered prompt like "PROMPT N: <AGENT> CHANNEL WIRING FIX".
---

# sage-wiring-fix — Agent Channel Wiring Fix Protocol

**Trigger:** The founder says any of:

- `wiring fix` (with or without an agent name)
- `run the wiring fix for <agent>`
- `<agent> wiring fix` / `<AGENT> CHANNEL WIRING FIX`
- `find the broken channels for <agent>`
- Any numbered prompt matching `PROMPT N: <AGENT> CHANNEL WIRING FIX`

Also triggered when the founder describes channel gaps in a Sage agent and asks for the same method used on a previous agent.

**Valid agents:** `mentor` (the reference pattern, proven), `support`, `tech`, `growth`, `ops`.

---

## What This Skill Does

This skill runs the agent channel wiring fix protocol that was proven on
the private mentor and applied across support, tech, growth, and ops in
April 2026. It produces two output files per invocation:

- `operations/handoffs/<agent>-wiring-fix-handoff.md` — findings,
  channel design, risk classification, choice points, verification
  plan. Status: Scoped + Designed.
- `operations/handoffs/<agent>-wiring-fix-prompt.md` — a fenced
  paste-into-new-session prompt that makes the execution session
  self-starting.

The skill does **not** execute the wiring itself. That is the next
session's job. This skill's deliverable is the design + handoff pair,
nothing more.

**Why two files:**
- The handoff is the canonical record: findings, design, decisions.
- The prompt is the self-starting instruction set for the execution
  session, fenced so the founder can paste it verbatim.

---

## When to Use

### Starting a new agent wiring fix
- The founder has identified (or wants to identify) dark dynamic
  channels in a Sage agent.
- The founder pastes a PROMPT N style brief.
- The founder says "run the wiring fix for <agent>".

### Not when to use
- The execution session (scaffolding and wiring the designed channels)
  — that uses the prompt file this skill produces, not the skill itself.
- Post-Verified maintenance work on an already-wired channel.
- Architectural redesign of an agent. This skill designs channel
  wiring, not agent architecture.

---

## The Invariant Pattern

Every wiring fix produced by this skill follows the same seven-part
structure. Do not invent a new structure per agent. The repetition is
the point — the founder and future sessions should be able to navigate
any handoff+prompt pair using the same mental map.

1. **Exploration.** Read the target agent's current wiring: brain
   loader, persona prompt, injection point in the central hub, any
   existing data sources the channels could draw from.
2. **Diagnostic.** Confirm or elicit the channel-gap map. For agents
   that have **already been self-diagnosed** by the founder (mentor,
   support, tech, growth), the gap map comes from the founder's
   prompt. For agents that have **not** been self-diagnosed (e.g.,
   ops at first pass), insert a mandatory diagnostic step into the
   execution prompt — the next session must ask the agent directly
   before executing the design.
3. **Design.** For each confirmed broken channel, specify: data
   source, loader file path, types, failure modes, injection point,
   rolling-window policy if applicable.
4. **Risk classification (0d-ii).** Classify each sub-item (Standard /
   Elevated / Critical). PR6 applies — any channel touching the
   distress classifier or Zone 2/3 is Critical. Record per-item
   rollback paths.
5. **Choice points.** Open decisions the execution session needs the
   founder to resolve before scaffolding (data sources, seeding,
   window sizes, whether to extend the pattern to other agents).
6. **Verification plan.** A founder-runnable `.mjs` harness plus a
   verbatim live probe the founder pastes into the target agent.
7. **Handoff + prompt pair.** Both files produced in the same session.

---

## The Diagnostic Question

Use the founder's exact wording, verbatim, whenever the skill inserts
a diagnostic step:

> I need to know what is what your foundation info based on and which
> input channels you actively draw from and what triggers when you
> receive them.

Do not paraphrase. Do not "improve" the grammar. This exact string is
what produced the channel-gap maps for mentor, support, tech, and
growth.

---

## Execution — Step by Step

When the skill is triggered, execute these steps in order. Do not
skip any. Do not reorder.

### Step 1 — Identify the target agent

From the founder's message, extract the agent name. One of: `mentor`,
`support`, `tech`, `growth`, `ops`. If the agent is not one of these
five, stop and ask the founder to clarify — the skill is scoped to
the four Sage chat personas plus the mentor reference pattern.

### Step 2 — Read prior-session context

**Always read before designing:**

- `operations/handoffs/support-wiring-fix-handoff.md` — the pattern
  reference at the cleanest Critical level.
- `operations/handoffs/tech-wiring-fix-handoff.md` — Elevated
  example with drift detection.
- `operations/handoffs/growth-wiring-fix-handoff.md` — Standard
  example, file-only.
- `operations/handoffs/ops-wiring-fix-handoff.md` — Elevated example
  with mandatory diagnostic step.
- `operations/knowledge-gaps.md` — any KG touching context loaders,
  chat-persona composition, or the target agent specifically.
- `operations/decision-log.md` — the D-register entries for prior
  wiring fixes (D-Tech-*, D-Growth-*, D-Support-*, D-Ops-*).

**Read only if relevant to the target agent:**

- `website/src/lib/context/<agent>-brain-loader.ts`
- `website/src/app/api/founder/hub/route.ts` — the `case '<agent>'`
  branch (mentor uses a distinct architecture via the private-mentor
  path — if the target is mentor, read
  `website/src/app/api/mentor/private/reflect/route.ts` and
  `website/src/lib/context/mentor-context-private.ts` instead).

### Step 3 — Check whether the agent has been self-diagnosed

Three possibilities:

- **The founder's message contains a channel-gap map already.** This
  is the common case when the founder pastes a PROMPT N brief
  describing "Broken Channel 1 — X" and "Broken Channel 2 — Y". Use
  the founder's map as the design input. Still insert a
  confirmation diagnostic in the execution prompt (see Step 5) if
  the map is labelled "likely" rather than confirmed.
- **The founder is asking the skill to discover the channels.** In
  this case, insert a **mandatory diagnostic** into the execution
  prompt. The execution session must invoke the agent and paste the
  verbatim diagnostic question before scaffolding.
- **Mixed — some channels confirmed, others speculative.** Treat
  confirmed channels as design inputs; insert confirmatory
  diagnostics for the speculative ones.

### Step 4 — Explore the target agent's wiring

Read the files listed in Step 2 that are specific to the target
agent. Record the factual findings as §11 "Today's verified facts"
in the handoff file. These are the factual ground from which the
execution session proceeds. Do not invent facts — grep, Read,
Glob. If something cannot be verified in-session, say so.

Minimum findings to record:

- Path and exports of the agent's brain loader.
- Line range of the agent's branch in the central hub.
- The list of "REASONING UPGRADES" or equivalent persona-prompt
  bullets. Count them.
- For each proposed channel's data source: whether the source
  already exists (file / table / directory) and where.
- Any structural dependency the design will create (e.g., drift
  detection against a separate canonical file).

### Step 5 — Design each confirmed or confirmable channel

For each broken channel, design:

- **Data source(s).** File(s), Supabase table(s), or both. If the
  source does not yet exist, specify the shape and maintenance
  contract.
- **Loader file.** Path under `website/src/lib/context/`, naming
  convention `<agent>-<channel-name>.ts`, exported interface with
  all fields named, exported `getX(): Promise<XBlock>`.
- **Failure modes.** Missing file, Supabase read error, stale data,
  sparse data, token-budget overflow. Each failure mode returns a
  self-disclosing stub — never a silent fallback.
- **Injection point.** The agent's branch in the central hub, with
  the composition order restated: persona prompt → reasoning
  upgrades → new channel blocks → static brain context.
- **Rolling window** if applicable (mentor 4–8 weeks, growth
  90 / 120 days, etc.). Record the default and the tunable.

### Step 6 — Classify risk under 0d-ii

Classify each sub-item separately. Default classifications by
channel source:

- File-only, additive, non-safety-critical → Standard.
- Supabase read in live request path → Elevated.
- Multi-source synthesis (>2 sources) → Elevated.
- Drift detection / structural coupling to an external canonical
  file → Elevated.
- Any touch on distress classifier, Zone 2/3, SafetyGate → Critical
  (PR6, always).
- Any auth / session / cookie / encryption / deploy-config change →
  Critical (AC7, always).

Name rollback per sub-item. Elevated and Critical changes must
name specific failure modes; Standard changes require only the
rollback path.

### Step 7 — Identify choice points

Open decisions the execution session needs the founder to resolve.
Default categories (omit any not relevant):

- **Starting state** — empty stub vs seeded vs prefilled.
- **Data source breadth** — which sources to include on first pass.
- **Window size defaults** — rolling window lengths.
- **Scope of rollout** — single agent (default) vs extending pattern
  to siblings (PR1 violation, recommend against).
- **Deferrals** — which sources to defer to a later session and why.

Each choice point gets 2–3 options with reasoning. One is
recommended. The AI never decides the choice point; the founder
decides at execution-session open.

### Step 8 — Plan decision-log entries (PR7)

List the D-register entries the execution session will produce.
Naming: `D-<Agent>-0` for diagnostic outcome (only when a
mandatory diagnostic was inserted), `D-<Agent>-1` onward for
choice-point decisions. Each entry will record: decision,
reasoning, alternatives considered, what would trigger revisiting.

### Step 9 — Plan knowledge-gap observations (PR5 / PR8)

Identify:

- Recurring patterns that earn or approach PR8 third-observation
  promotion (e.g., file-based loader pattern, sparse-state
  disclosure, Supabase-read-path loader).
- First-observation patterns introduced by this wiring (e.g., a
  drift-detection harness is a Tech-first pattern).

Record the observation count per pattern in the handoff §10 so the
execution session can promote or log as appropriate.

### Step 10 — Write the handoff file

Path: `operations/handoffs/<agent>-wiring-fix-handoff.md`.

Structure — use the **exact section numbering** from the four
existing handoffs:

1. Purpose
2. Broken channels (current state)
3. Design (or Diagnostic step for ops-style unconfirmed cases)
4. Design (if §3 was diagnostic) / Files that will be touched
5. Choice points for the next session
6. Risk classification — 0d-ii
7. Verification steps (after wiring, before close)
8. Out-of-scope guardrails
9. Decision-log plan (PR7)
10. Knowledge-gap candidates (PR5 / PR8)
11. Today's verified facts

Keep headings and subheadings consistent with prior handoffs. The
founder and future sessions navigate by this numbering.

### Step 11 — Write the prompt file

Path: `operations/handoffs/<agent>-wiring-fix-prompt.md`.

Structure:

- Title and the "paste everything between the two fences" line.
- Opening fence.
- Self-starting prompt body with these sections in order:
  - "First action, before anything else" — read the handoff.
  - Knowledge-gap scan instruction.
  - Primary task for this session.
  - Step-by-step (A through G, matching the prior prompts):
    read → (diagnostic if applicable) → choice points → risk
    classification → scaffold/wire/verify → founder verifies →
    close session.
  - Working agreements (verbatim carryover from prior prompts,
    adjusted only where agent-specific).
  - Scope (bounded) — In scope / Out of scope.
  - Risk classification — 0d-ii restated.
  - Success criteria for the session.
- Closing fence.
- "Notes for the human reading this file" — prose notes outside
  the fenced block.

### Step 12 — Report back

Summarise to the founder:

- Both file paths, as `computer://` view links.
- Key findings from exploration that shaped the design (2–4 lines).
- Risk classification at the top level.
- Count of choice points queued.
- Any knowledge-gap candidates and their observation counts.

Do **not** restate the full design in chat — the handoff file is
the canonical record. Keep the report short.

---

## Working Agreements

Carry these forward into every prompt file produced by this skill.
They are the founder's stated preferences as of April 2026.

- Founder has zero coding experience. Use plain language. Exact
  paths, exact commands, exact copy-paste text. "Vercel Green" is
  the type-check — say "push and wait for Vercel Green".
- Founder decides scope. If wiring reveals a bigger structural
  problem mid-session, say so once clearly, then wait.
- Classify every code change under 0d-ii before execution. State
  the risk level, name rollback, get approval before deploy.
- Deferred decisions go in the decision log with reasoning (PR7).
- Manual verification method per work type (0c) — founder verifies
  by running the .mjs harness and reading its printed output, plus
  the live probe, not by reading TypeScript.
- Give the exact wording of the live-probe message. Do not
  paraphrase.
- If founder signals "I'm done for now", stabilise and close. No
  additional fixes proposed.

---

## Prior-Session Risk Classifications (reference, not prescription)

The execution session classifies its own work under 0d-ii. These are
recorded only so the designer has a prior-example baseline:

| Agent | Classification | Primary driver |
|---|---|---|
| Support | Critical | PR6 — distress classifier touch required |
| Tech | Elevated | Drift detection against TECHNICAL_STATE.md |
| Growth | Standard | File-only, additive, non-safety-critical |
| Ops | Elevated | Supabase read in request path + 5-source synthesis |
| Mentor | Reference pattern | Proven (PR1) — the method |

New wiring fixes may classify differently. The execution session
decides based on the actual design, not the table above.

---

## Out of Scope for This Skill

- Executing the wiring (scaffolding, writing loaders, modifying the
  hub, running the harness). That is the next session, using the
  prompt file this skill produces.
- Redesigning agent architecture. This skill designs channel wiring
  only.
- Safety-critical surfaces (distress classifier, Zone 2/3,
  SafetyGate) — if a wiring fix touches these, the Critical Change
  Protocol (0c-ii) applies and the execution prompt must carry it
  explicitly.
- Auth / session / cookie / deploy-config changes — AC7 territory.
  Route to a Critical change workflow, not this skill.
- Projects other than SageReasoning. A generic-project variant is a
  separate skill (not yet built).

---

## Reference: The Four Prior Wiring Fix Pairs

These are the canonical examples. Read them before designing a new
wiring fix.

- `operations/handoffs/support-wiring-fix-handoff.md` +
  `operations/handoffs/support-wiring-fix-prompt.md`
- `operations/handoffs/tech-wiring-fix-handoff.md` +
  `operations/handoffs/tech-wiring-fix-prompt.md`
- `operations/handoffs/growth-wiring-fix-handoff.md` +
  `operations/handoffs/growth-wiring-fix-prompt.md`
- `operations/handoffs/ops-wiring-fix-handoff.md` +
  `operations/handoffs/ops-wiring-fix-prompt.md`

The mentor reference pattern is not a handoff file — it is proven
in live code at `website/src/app/api/mentor/private/reflect/route.ts`
and `website/src/lib/context/mentor-context-private.ts`. Read those
when mentor is the target.

---

## Update Discipline

This skill encodes a pattern that may evolve. When it evolves:

- Update the four prior-session reference paths in §Reference if
  new wiring fixes are added.
- Update §Prior-Session Risk Classifications if a new agent enters
  the protocol.
- Update §The Diagnostic Question only if the founder changes the
  wording. Never paraphrase.
- Update §Execution — Step by Step only after a genuine pattern
  improvement from an execution session. Log the change reason.

Do not update this skill from memory. Always cite the source
session that motivated the change.
