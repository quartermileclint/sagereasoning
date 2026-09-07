# NEXT SESSION — Condition 1: can a PARENT session ever act with `agent_id` set?

**Owed by the 2026-09-07 five-question ruling
(`operations/trust-layer-2026-07/2026-09-07-mentor-ruling-S8-five-questions-verbatim.md`), the first
of three binding conditions before `classifyCaller` may be modified.**
**Authored 2026-09-07 ~21:30 AEST (`date`) = 2026-09-07 ~11:30 UTC. The `2026-09-08` filename follows
this arc's existing labels; the true authoring date is the one above. Date your own artifacts from
`date`, never from the context date.**

**EVERY NUMBER IN THIS FILE IS A CLAIM TO RE-DERIVE, NOT A FACT TO QUOTE.**

---

## The question, and only this question

> **Does the harness's own review-fleet architecture ever have the PARENT session act with `agent_id`
> set in H3's `PreToolUse` stdin?**

**If YES** — `agent_id` presence does not discriminate. Option C′ is falsified, and the ruling names
the reason: *"it would be the spawn-depth failure mode in a different form."* Report to the mentor;
Option D's disclosure becomes final again.
**If NO** — Condition 1 passes. Conditions 2 (a second capture on a separate day and session) and 3
(client-version pinning with fallback) remain outstanding, and **no build is licensed until all three
are met.**

**Both outcomes are a success.** A confirmed YES is worth more than a NO — it stops a defective
mechanism before it is built, which is exactly what happened to Option B.

**DO NOT BUILD THE MECHANISM.** `classifyCaller` stays byte-unchanged. This session determines a fact.

---

## What is already established — re-verify anything you build on

From S8 (`D-S8-OPTION-C-INVESTIGATION-AGENTID-CANDIDATE-FOUND-2026-09-08`), live-captured on client
**2.1.260**, both payloads diffed field-by-field:

- **H3 fired inside a subagent carries `agent_id` + `agent_type`.** H3 fired at the top level carries
  **neither key at all** (absent, not empty).
- `session_id` and `transcript_path` are **identical** in both — both the parent's. Both established
  findings hold.
- **Provenance discipline, and you must repeat it:** the dump filename does NOT prove which hook
  wrote a capture. H2 (`subagent-framing-hook.mjs`, matcher `Task|Agent`) and H3
  (`at-action-hook.mjs`, matcher `Bash|Edit|Write|MultiEdit|NotebookEdit`) **both** call
  `loadConfig({ eventName: "PreToolUse" })`, so both write `PreToolUse-stdin.json`. What proved S8's
  captures were H3's is the **content**: `tool_name: "Bash"`, which H2's matcher structurally cannot
  see. Re-apply that check on every capture.

**⚠ ONE PART OF CONDITION 1 IS ALREADY PARTIALLY ANSWERED — do not re-derive it, but do not
over-read it either.** The mentor named `CLAUDE_CODE_CHILD_SESSION=1` as the first thing to examine.
S8 observed that variable **set to `1` in the top-level session's own tool environment**, and that
same top-level session's H3 capture carried **no `agent_id`**. So for *this* configuration
(desktop app, `CLAUDE_CODE_ENTRYPOINT=claude-desktop`, a single non-nested top-level session),
`CLAUDE_CODE_CHILD_SESSION=1` does **not** imply `agent_id` presence. **That is one configuration,
not the class.** The open work is the configurations below.

---

## The configurations that must be tested

Each is a candidate for a parent-acting-with-`agent_id`. Ground truth must be known **by
construction** for every capture — i.e. you must know, independently of the capture, whether the
action was issued by a top-level session or by a delegated agent.

1. **Nested delegation — the sharpest case.** An agent spawns an agent. When the *intermediate* agent
   issues a tool call, does its H3 stdin carry its OWN `agent_id`, its parent's, or none? If an
   intermediate agent — which is a "parent" relative to its own child — carries `agent_id`, that is
   still consistent with the mechanism (it is not a top-level session). **The failure case is
   specifically a TOP-LEVEL session carrying `agent_id`.** Keep that distinction sharp; it is easy to
   record a nested result and misread it as a falsification.
2. **Background agents** (`run_in_background: true`) — does the top-level session's own subsequent
   tool call carry `agent_id` while a background agent is in flight?
3. **Concurrent agents** — several agents running at once, with the top-level session acting in
   between. This is the closest analogue to what falsified Option B (a genuine live-agent action
   sitting between two fleet records).
4. **Worktree-isolated agents** (`isolation: "worktree"`) — S8 established `cwd` differs only for
   these; whether `agent_id` behaves differently is untested.
5. **A different entrypoint, if cheaply available** — S8's capture was `claude-desktop`. If the
   founder can produce a capture from another entrypoint without effort, take it; do not construct
   one at cost.

**Configuration 3 is the one the ruling's reasoning actually turns on.** If time is short, do 1 and 3.

---

## Method — and the collision that makes it harder than S8's

**The wire must be OBSERVED. Do not infer from SDK types.** Standing memory records this project
falling into that exact trap twice.

`GATE1_DEBUG=1` dumps each hook's raw stdin to `<stateDir>/<eventName>-stdin.json`
(`lib/framing-core.mjs`, `maybeDebugDump`).

> **⚠ SETTING `GATE1_DEBUG` IS A CHANGE TO THE FOUNDER'S LIVE HARNESS CONFIG. S7 refused to set it;
> at S8 the founder explicitly directed the AI to do it ("you add it for me") and that was recorded
> as a waiver. EXPECT TO ASK, and record whatever the founder elects — do not assume S8's waiver
> carries forward.**

**Four method facts from S8, each of which cost something to learn:**

1. **No guard-triggering command is needed.** `maybeDebugDump` runs at `at-action-hook.mjs:371`,
   *before* the tool-name check and before the guard logic — so a harmless `echo` dumps. **This keeps
   the session window-neutral: `Bash` is dropped from the consult floor, so a non-guard `echo` writes
   NO buffer record.**
2. **Read the dump with the Read tool, NEVER Bash.** A Bash read is itself matched by H3, so the hook
   overwrites the dump with the reading command's own stdin before `cat` executes. Read is not in
   H3's matcher.
3. **⚠ THE DUMP IS A SINGLE SLOT, AND THIS SESSION NEEDS MORE FROM IT THAN S8 DID.** One file per
   event name, last writer wins. S8 needed two captures and took them sequentially. **Configurations
   2 and 3 above involve concurrent activity, where two H3 invocations can overwrite each other
   between reads.** Two ways forward, and the choice is the founder's:
   - **(a) Strictly sequential capture — RECOMMENDED.** Drive one action at a time, Read the dump
     after each, never let two tool calls overlap. Slower, but needs no code change and no waiver.
     Note this genuinely limits configuration 3: you can observe a top-level action *while agents are
     in flight*, but you cannot capture both endpoints of a true race.
   - **(b) Make the dump per-invocation** (timestamp or `tool_use_id` in the filename). This is an
     edit to `lib/framing-core.mjs`, which **matches `GUARD_RE`** — it needs a recorded founder
     waiver and the D2 stand-down mechanics, and it changes the founder's live loop. **Do not take
     this route without an explicit founder election.**
4. **⚠ `GATE1_DEBUG` DOES NOT REVERT CLEANLY WITHIN THE SESSION.** S8 removed it from the config file
   (mtime `19:06`) and dumps were **still being written at `20:52`** — ~1h45m and two founder-turn
   boundaries later. Mechanism unconfirmed (memory `claude-code-desktop-app-hook-env`, revert-lag
   finding). **Consequences:** do not report the revert as complete on the strength of the file edit
   alone; verify by checking whether fresh dumps still appear. And **H1 (`UserPromptSubmit`) and H4
   (`Stop`) fire at turn boundaries, outside any Bash block** — so dumps reappear no matter what, and
   a final manual `rm ~/.sage-gate1/*-stdin.json` after the session is the founder's.

---

## Constraints that bind

- **The observation window is RUNNING and the byte-identity guard is ARMED** (it binds iff
  `GATE1_FALSE_HOLD_CAPTURE` is set). `GUARD_RE` matches `api/reason | api/guardrail |
  guardrail-sandwich | sage-reason-engine | reasoning-receipt | translation-sandwich | /substrate/ |
  trust-core | kathekon-engagement | false-hold | harness/gate1 | layer1-extractor |
  layer2-mechanisms | sage-reflect | stoic-brain`, **including untracked files** — name new artifacts
  accordingly.
- **This investigation should need NO edit to a guarded file.** If it does (route (b) above), STOP and
  re-scope with the founder.
- **`layer2-mechanisms.ts` has an unconditional SHA pin** that reads disk bytes and fires even with
  the capture flag unset. Do not touch it. If the pin is RED at open, STOP and report.
- **The commit gate runs the full battery first and always.** A modified guarded file ⇒ the gate
  refuses. That is the checkpoint working; do not route around it. `--no-verify` waives **all six**
  checks, not just the guard — if a waiver is ever elected, run all six by hand and record their
  results in the commit message.
- **Never `git checkout`/`restore`/`reset` on live-edited work.** Back up to the scratchpad first and
  verify every restore by SHA. S7 wiped its own work this way.
- **Never `git add -A`** — a peer's `website/src/data/environmental-context.json` has been modified
  since S6b and is not yours.
- **Never refresh, truncate or regenerate** `~/.sage-gate1/false-hold-record.jsonl`. Never mix the
  138 `v1` records into the window's rate. Never count record 139 (a took-effect probe).
- **The founder pushes; never push.** Do not touch production, schema, flags (other than a
  founder-elected `GATE1_DEBUG`), or credentials.

---

## Always do — window + baseline health, read-only, owed every session

Re-derive and report, and **derive the token families rather than quoting them**:

- **Baseline days** — UTC days with ≥1 consult record. **At S8 close: 2 of 5** (2026-09-06 and
  2026-09-07). **Re-derive; do not quote.**
- **⚠ The baseline composition is now a RULED disclosure obligation**, not an optional nicety. The
  2026-09-07 day is composed of **12 consult records, every one a `Write`/`Edit` from S8's own
  governance-document authoring, zero engineering actions.** The mentor ruled the day counts *and*
  that *"the disclosure for the baseline reports composition alongside the count."* Report day-by-day
  with the tool distribution.
- Per-UTC-day break-out by path (`guard` = schema `v4`/`v5` with `path`; `consult` = schema `v3`,
  no `path` — this vocabulary is the session paste's own; a reviewer once challenged it and was wrong).
- **Corroboration, with two traps S8 hit:** anchor the window boundary on the **`gate1.log` line
  timestamp**, not the buffer's `capturedAt` — the same event is stamped twice, milliseconds apart
  (`…55.265Z` vs `…55.267Z`), and using the buffer's produces a spurious off-by-one. And **split the
  token family by exact match** — a bare `CONSULT` pattern also matches `CONSULT-OUTAGE`, which
  produced a false 5-vs-3 disagreement. Derive `GUARD-*` from the log; a fifth token may appear and
  the method must survive it.
- Whether `GATE1_STATE_DIR` is still `/Users/clintonaitkenhead/.sage-gate1` (a mid-window change
  **fragments the buffer**).
- Guard status stated precisely: *"no evidence of a trip; tree verified clean"* — **not** "the guard
  has not tripped." It only runs when a session runs the battery.

**Also owed, and new:** the ruling requires a **loop count by action class** in the pre-flip report
(product actions vs. protocol-required documentation). That report is not built and
`false-hold-observation-report.ts` matches `GUARD_RE`, so **do not build it here** — but if this
session generates loop data, record the counts from `~/.sage-gate1/<session>.loop.json`
(`openLoop` / `closedRefs` / `abandonedRefs`) so the eventual report has more than one session's
worth of evidence. S8's own figures: **12 opened, 11 abandoned, 1 closed.**

---

## Do NOT

Build the mechanism or modify `classifyCaller`. Edit `layer2-mechanisms.ts`. Edit any guarded file
without a recorded founder waiver. Set or unset any flag other than a founder-elected `GATE1_DEBUG`.
Open S11-D2 (baseline not met). Revive spawn-depth. Retro-classify pre-boundary records (**ruled
out**). Touch production, schema or credentials. Refresh the buffer. Quote a perimeter count. Steer
tool choice. Assume the UTC day from the local clock. **Push.**

---

## Records owed at close

A decision-log entry at the **physical tail** (entries are `## YYYY-MM-DD — D-…`; newest at the tail,
never rewritten — append a correction entry instead). The S11 register's row **appended, never
rewritten** — S8 edited a row in place and had to disclose the deviation in an append; do not repeat
it. A **lean** close. **A CLAUDE.md production-state block is due ONLY if production or the founder's
live loop actually changes** — under this scope it should not, **unless** the founder elects route
(b), which edits the harness and hot-reloads the live loop. Say so plainly if it does.

**PR19 applies** — independent review required. S8's three-dimension shape (the substantive claim,
the arithmetic, scope/safety) worked and found real defects in all three, including one the author
had missed twice.

---

## Forecast

Success = **the binary question answered with its evidence**, under controlled conditions with ground
truth known by construction, and recorded — plus an honest re-derived statement of window health
including the ruled baseline-composition disclosure, and the pin left intact and green.

**Acceptable alternative outcome:** the founder declines the `GATE1_DEBUG` act, and Condition 1 is
recorded as untestable-without-it. That is honest and complete; Option C′ simply stays unbuilt, which
is where the ruling already leaves it.

**Nothing is licensed to be built by this session or by a passing result. Conditions 2 and 3 remain
outstanding regardless of the outcome here. The window keeps running. The S11 flip remains REFUSED;
weights remain BLOCKED; the 0h call remains the founder's.**
