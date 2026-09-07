# NEXT SESSION — Option C: can `SubagentStart` supply a caller signal that correlates to an H3 record?

**Owed by the OPTION D ruling (2026-09-07), §"What Option D requires operationally", item 3.**
**Bounded by that ruling: ONE session, ONE question, a CLEAR BINARY OUTCOME.**
**It does NOT delay publication if it runs in parallel with the window.**

---

## The question, and only this question

> **Does `SubagentStart` supply a signal that correlates to an H3 (at-action) record via a key OTHER
> than session ID?**

**If YES** — Option C becomes viable and the Option D ruling is **revisited**.
**If NO** — Option D is **confirmed** and the guard disclosure is **final**.

Nothing else is in scope. Do not build the mechanism in this session; determine whether it is possible.

---

## Why this is owed even though Option D is already ruled

The ruling is explicit that the investigation is not a condition of the ruling: *"not because the
ruling depends on it, but because Option D's 'unimplementable on this harness as wired' should be
tested against the one remaining candidate before it becomes permanent."*

So: Option D is LIVE and the disclosure already says so. This session tests whether "unimplementable"
survives contact with the last candidate.

---

## What is already established — do NOT re-derive, but DO re-verify anything you build on

1. **Session ID cannot discriminate.** Subagent records carry the PARENT id. Established S6b,
   re-established S7 under controlled conditions (11 of 15 records under one session id were that
   session's own review fleet).
2. **`transcript_path` does not discriminate.** MEASURED, not assumed: 20+ post-boundary records, all
   `callerClass: 'unknown'`, including commands provably issued by a review-fleet subagent. The
   `PreToolUse` hook fired inside a subagent receives a path with **no `/subagents/` segment**.
3. **The mechanism is correct and tested.** `classifyCaller` yields `'subagent'` for a genuine
   `/subagents/`-shaped path; the negative battery drives the REAL hook end-to-end and proves it.
   Reverting the wiring turns that test red. **The build is not the problem; the environment is.**
4. **A spawn-depth marker (H2/H5) is RULED OUT.** Measured against ground truth: a genuine live-agent
   action sits between two fleet records in an observed window, so the marker would misflag it — the
   direction the mentor ruled *"invisibly destructive"*. Do not revive it.
5. **`SubagentStart` DOES fire for subagents**, and its command-hook stdin carries
   `{ session_id, transcript_path, cwd, agent_id, agent_type, hook_event_name }` — **verified by raw
   stdin capture 2026-06-20** (memory `claude-code-subagent-hook-contract`). It **cannot block**.
   It is **NOT registered** in this harness's `hooks.json`.

---

## The actual difficulty, stated so it is not rediscovered

`SubagentStart` carrying `agent_id` is **not sufficient on its own.** H3 (the at-action hook) records
under the PARENT session id. For a `SubagentStart` marker to be usable, there must be a key that
**both** hooks can see and that **distinguishes the subagent**. Candidates to test:

- Does `SubagentStart`'s `session_id` equal the parent's, or the subagent's? **Unverified.**
- Does `SubagentStart`'s `transcript_path` differ from what H3 receives inside the same subagent?
  If `SubagentStart` gets the subagent's own path while H3 gets the parent's, that is an
  **inconsistency worth recording** even though it does not by itself yield a correlation key.
- Is there any ordering/timing property that is sound? **Be sceptical** — this is spawn-depth in
  another costume, and spawn-depth is ruled out.
- `cwd` differs only for worktree-isolated agents; the review fleets are not worktree-isolated.

---

## Method — the ONLY reliable one, and it needs a founder act

**The wire shape must be OBSERVED, not inferred from SDK types.** This project's standing memory records
falling into that exact trap twice: *"a hook's SDK callback input type ≠ its command-hook stdin shape.
To know what a command hook actually receives, capture the raw stdin live."*

The harness has the facility: **`GATE1_DEBUG=1` dumps each hook's raw stdin** to
`<stateDir>/<eventName>-stdin.json` (`lib/framing-core.mjs`, `maybeDebugDump`).

**⚠ SETTING `GATE1_DEBUG` IS A FLAG CHANGE ON THE FOUNDER'S LIVE HARNESS CONFIG
(`.claude/settings.local.json`) AND IS THE FOUNDER'S ACT, NOT THE AI'S.** S7 explicitly refused to set
it for this reason. Expect to ask.

Suggested shape (founder elects):
1. Founder sets `GATE1_DEBUG=1` (and, if `SubagentStart` is to be observed at all, **registers it**
   in `hooks.json` — itself a harness change and its own decision).
2. Run ONE subagent that issues ONE guard-triggering command.
3. Read the dumped stdin for `SubagentStart` **and** for the `PreToolUse` fired inside that subagent.
4. Compare every field. Answer the binary question.
5. Founder unsets `GATE1_DEBUG` and reverts any registration if Option C fails.

**A cheaper first step that needs NO flag and NO harness change:** the dumps are written per event
name, so check whether any `*-stdin.json` already exists in `~/.sage-gate1/` from a prior session
before asking for anything. At S7 there were **none** — re-check, do not assume.

---

## Constraints that still bind

- **The observation window is RUNNING and the byte-identity guard is ARMED.** `false-hold-capture.mjs`
  and `at-action-hook.mjs` both match `GUARD_RE`; so do their test files. **Any edit needs a recorded
  founder waiver** (D2 stand-down shape (a) was elected at S7 and is the precedent).
- **This investigation should need NO edit to a guarded file.** If it does, stop and re-scope.
- Do not steer tool choice. Do not touch production, schema, flags (other than the founder-set
  `GATE1_DEBUG`), or credentials. **The founder pushes; never push.**
- Re-derive the baseline and window health per the standing `ALWAYS DO` section; derive the `GUARD-*`
  family from the log, never quote a token list.

---

## Deliverable

A decision-log entry recording the **binary answer with its evidence**, and either:
- **YES** → a scope document for Option C, and a note that the Option D ruling is to be revisited
  (relay to the mentor; do not revisit it unilaterally); or
- **NO** → a one-line confirmation appended to the S11 register that Option D is **final**, and the
  guard disclosure is closed to further mechanism work.

**Either outcome is a success.** A confirmed NO is worth as much as a YES — it converts
*"unimplementable as far as we tried"* into *"unimplementable, tested against the last candidate."*
