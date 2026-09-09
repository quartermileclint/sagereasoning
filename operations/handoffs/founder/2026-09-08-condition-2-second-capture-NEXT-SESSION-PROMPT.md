# NEXT SESSION — Condition 2: a second live capture on a separate day and session

**Owed by the 2026-09-07 five-question ruling
(`2026-09-07-mentor-ruling-S8-five-questions-verbatim.md`), as specified by the 2026-09-08 S9
four-question ruling (`2026-09-08-mentor-ruling-S9-four-questions-verbatim.md` — canonical).
The SECOND of three binding conditions before `classifyCaller` may be modified.**

**Authored 2026-09-08 ~04:10 AEST (`date`) = 2026-09-07 ~18:10 UTC. The `2026-09-08` filename follows
this arc's local-date labels; the UTC day of authoring is 2026-09-07. Date your own artifacts from
`date`, never from the context date — the context date has run a day ahead repeatedly on this arc.**

**EVERY NUMBER IN THIS FILE IS A CLAIM TO RE-DERIVE, NOT A FACT TO QUOTE.**

---

## ⚠⚠ STEP 0 — THE DATE GATE. RUN `date` BEFORE ANYTHING ELSE, INCLUDING THE PRE-CHECK.

**[AMENDMENT 2026-09-08, added by session S10 — which failed this gate and then failed to STOP at it.
This section is the correction. Nothing below it is weakened.]**

```bash
date
```

**The capture requires a calendar day that is NOT 2026-09-07 and NOT 2026-09-08 under BOTH the local
(AEST) and UTC readings.** The ruling: *"genuinely different calendar day… literal, not approximate."*
A day qualifies only if different under **both** conventions.

**The non-obvious trap:** UTC rolls over at **10:00 AEST**. A session opening 11:00 AEST on 2026-09-08
is a **new UTC day but the same LOCAL day** as S9 — it does **not** qualify and reopens exactly the
ambiguity the ruling closed. **The first unambiguously qualifying day is 2026-09-09 local.**

### If the gate FAILS — this is the whole instruction, and it is short by design

**STOP. Report to the founder in two or three sentences: today's `date`, why it does not qualify, and
the earliest day that does. Then END THE SESSION and await the founder's word.**

**Do NOT, on a failed gate:**
- run the two-step pre-check "because it is date-independent";
- re-derive window/baseline health "because it is owed every session";
- write an evidence file, decision-log entry, register row, or close;
- run PR19;
- investigate anything adjacent, however cheap or genuinely useful it looks.

**NOTHING IS OWED BY A SESSION THAT STOPS AT THIS GATE.** "Always do" and "Records owed at close" bind
a session that **runs**; they do not bind one that correctly refuses to start. **A two-line report is
the complete and successful output of a failed gate.**

**Why this is stated so bluntly:** S10 opened ~10 minutes after S9 closed, identified the block in its
first tool call — and then, instead of stopping, ran the pre-check, a full window re-derivation of
figures that **could not have moved** (no new day had begun, so the baseline was provably static),
~600 lines of records, and a three-agent PR19 costing roughly a million tokens to review documents
about a session that did no engineering. Its own examination named the driver three times — *"the pull
to fill the gap with visible output"*, *"justifying the session"* — and it proceeded anyway. **Naming
the pull is not resisting it. This gate is the resistance. Use it.** The founder's ruling on that
session: *"this session is not complete and has no value… we should pause here… complete the tasks for
the session thoroughly before declaring the session complete."*

**If the gate PASSES,** continue to the mandatory pre-check below, then the capture.

---

## ⚠ STOP — A MANDATORY TWO-STEP PRE-CHECK RUNS BEFORE ANYTHING ELSE

**This is a ruled requirement, not hygiene. Both steps. Neither optional.**
(S9 ruling, question 3 — elevated from a founder question to a standing requirement.)

The `GATE1_DEBUG` revert-lag is **sentinel-proven**: at S9 the config file was restored byte-identical
(SHA-verified) and the variable was **still effectively live**, still writing dumps. The mechanism is
unknown. The dumps carry raw tool input and session content.

**STEP 1.** `rm ~/.sage-gate1/*-stdin.json` — if the founder has not already done it.

**STEP 2.** In THIS fresh session, run one harmless control probe (`echo "<a unique sentinel>"`), then
**Read** `~/.sage-gate1/PreToolUse-stdin.json`.

- **If NO fresh dump appears** → the variable is genuinely inert. Condition 2's capture may proceed.
- **If a dump DOES appear** → `GATE1_DEBUG` is still live from S9. **DO NOT PROCEED TO CAPTURE.**
  Per the ruling, *"its persistence mechanism must be understood before it is used again."* Report to
  the founder, investigate the persistence mechanism, and treat that as this session's work.

Grounds, verbatim: *"A debug session run without this confirmation is a debug session whose outputs
cannot be trusted to reflect the current wire rather than a residual state… the same class of
invisible contamination the project has ruled against consistently."*

**Read the dump with the Read tool, NEVER Bash** — a Bash read is itself matched by H3 and overwrites
the dump with the reading command's own stdin before `cat` executes.

---

## The question, and only this question

> **Does the S9 finding — that a TOP-LEVEL session's H3 `PreToolUse` stdin carries no `agent_id`,
> while an agent's does — reproduce on a genuinely different calendar day?**

**Required conditions, ruled and literal:**
- a **genuinely different calendar day** from 2026-09-07/08 — *"literal, not approximate"*;
- a **different session ID**;
- the **SAME client version, 2.1.260**. If the client has auto-updated, **STOP and report** — a
  version change makes this Condition 3's problem, not Condition 2's, and the capture would not be
  comparable.

  **[AMENDED 2026-09-08 by S10 — the original left HOW to read the version unstated, and the session
  that tried to answer it got it wrong. Two numbers exist; do not conflate them.]**
  - **`2.1.260` is the CLAUDE CODE version — the one this condition pins.**
  - **The Claude DESKTOP app version is `1.46388.4`** (`/Applications/Claude.app/Contents/Info.plist`).
    **NOT this number; irrelevant here.**
  - **You do not need a founder UI reading and must not ask for one.** S8 and S9 read `2.1.260`
    **off the hook payload itself** — `version` and `entrypoint` (`claude-desktop`) ride the Claude
    Code hook stdin alongside `session_id`/`transcript_path`. See the S9 evidence file's capture-table
    header: *"Client 2.1.260, entrypoint `claude-desktop`"*.
  - **Verify the version FROM YOUR OWN CAPTURE** — the same wire the finding rests on, stronger than
    any reported figure. The apparent circularity (unreadable before `GATE1_DEBUG` is on) does not
    bite: take the capture, read `version` from the dump, and **if it is not `2.1.260`, discard the
    capture and STOP.**
  - **Residual to close in your first second:** S10 *inferred* the field's presence from how S9
    reported it and could not observe it (dumps deleted). **Confirm `version` is actually on the
    payload when your first dump lands.** If absent, say so — that is itself a Condition 3 input.
  - **Bearing on Condition 3:** if `version` rides the payload the harness can read it **at runtime**
    rather than hard-coding a constant. An input to that build, not a licence to start it.

**If it REPRODUCES** → Condition 2 passes. Condition 3 (client-version pinning with fallback) remains.
**If it does NOT reproduce** → that is the more valuable result. Option C′ is falsified or
version-fragile; report to the mentor immediately and build nothing.

**DO NOT BUILD THE MECHANISM. `classifyCaller` stays byte-unchanged. This session determines a fact.**

---

## What is already established — do NOT re-derive, do NOT re-litigate

**Condition 1 is COMPLETE and CLOSED by ruling.** Do not re-run its configurations. Established at S9
(`2026-09-08-condition-1-agentid-parent-session-CAPTURE-EVIDENCE.md`), on client 2.1.260:

- **Top-level H3 capture: `agent_id` and `agent_type` ABSENT** (keys absent, not empty) — control,
  during-concurrency, and closing control.
- **Agent-issued H3 capture: `agent_id` PRESENT**, and it is the acting agent's OWN id.
- **Nested delegation:** the intermediate carries its own id — **consistent, not a falsification**
  (an intermediate is not a top-level session). Do not misread a nested result as falsifying.
- **Worktree isolation:** `agent_id` present normally; only `cwd` differs.
- **`CLAUDE_CODE_CHILD_SESSION=1`** is set in the top-level session's own tool environment and does
  **not** imply `agent_id` presence. Answered twice now; do not chase it again.
- `session_id` and `transcript_path` are the **parent's** in every case — which is why
  `classifyCaller` measures null. Unchanged.
- **`maybeDebugDump(cfg, raw)` dumps `raw = readStdin()` VERBATIM, before `JSON.parse`**
  (`at-action-hook.mjs`); nothing writes `event.agent_id`. The captured field is Claude Code's own
  wire. Verified first-hand at S9 — do not re-derive.
- **Configuration 5 (a different entrypoint) belongs to Condition 3, NOT here.** Ruled. Do not spend
  effort on it in this session.

---

## Method — inherit S9's, it worked

1. **`GATE1_DEBUG` is a change to the founder's live harness config. EXPECT TO ASK.** S9's waiver does
   NOT carry forward; nor does S8's. Put it to the founder and record whatever is elected.
   (S9's election was: *AI adds it, sequential capture, no guarded-file edit.*)
2. **Back up `.claude/settings.local.json` to the scratchpad and verify by SHA before editing.** It is
   gitignored, so the edit is not a tree change. Verify the revert by SHA too — **and then verify the
   runtime effect separately, because the SHA revert does not prove the variable is inert.**
3. **SENTINEL CONTENT PROVENANCE — reuse it.** Put a unique string in every action's own `tool_input`
   and accept a capture as evidence for a claimed class **only if that sentinel is present**. This is
   what makes the single-slot, last-writer-wins dump usable without editing
   `lib/framing-core.mjs` (which matches `GUARD_RE`). At S9 it caught two real race overwrites.
4. **PROVENANCE DISCIPLINE — the dump filename does NOT prove which hook wrote it.** H2
   (`subagent-framing-hook.mjs`, matcher `Task|Agent`) and H3 (`at-action-hook.mjs`, matcher
   `Bash|Edit|Write|MultiEdit|NotebookEdit`) both write `PreToolUse-stdin.json`. **Only `tool_name`
   distinguishes them.** At S9 this caught one H2 capture that would otherwise have been miscounted.
5. **A second corroboration is available and is stronger than the sentinel:** the Agent tool reports
   each spawned agent's id back to you. Check it **matches** the `agent_id` on the wire.
6. **No guard-triggering command is needed** — `maybeDebugDump` runs before the tool-name check, so a
   harmless `echo` dumps. Bash is dropped from the consult floor, so an `echo` writes no consult
   record (it may still write a **guard** record — count your own contribution at close).
7. **Do NOT take route (b)** (per-invocation dump filenames). It edits a `GUARD_RE`-matched file and
   needs a founder waiver + D2 stand-down mechanics. S9 proved it unnecessary.

**Minimum sufficient capture set for Condition 2** (this is a reproduction check, not a re-survey):
one **top-level control** and one **agent-issued** capture, both sentinel-verified, both `tool_name:
"Bash"`. A during-concurrency top-level capture is a valuable addition if cheap, not required.

---

## Constraints that bind

- **The observation window is RUNNING and the byte-identity guard is ARMED** (it binds iff
  `GATE1_FALSE_HOLD_CAPTURE` is set). `GUARD_RE` matches `api/reason | api/guardrail |
  guardrail-sandwich | sage-reason-engine | reasoning-receipt | translation-sandwich | /substrate/ |
  trust-core | kathekon-engagement | false-hold | harness/gate1 | layer1-extractor |
  layer2-mechanisms | sage-reflect | stoic-brain`, **including untracked files** — check any new
  artifact's path against it before writing.
- **This investigation should need NO edit to a guarded file.** If it does, STOP and re-scope.
- **`layer2-mechanisms.ts` has an unconditional SHA pin** that reads disk bytes and fires even with
  the capture flag unset. Do not touch it. If the pin is RED at open, STOP and report.
  Expected: `layer2-mechanisms.ts` `60cefedb…`, `stoic-brain.ts` `fa8895ec…` — **re-derive, do not
  quote.**
- **The commit gate runs the full battery first and always.** `--no-verify` waives **all six** checks,
  not just the guard. If a waiver is ever elected, run all six by hand and record their results.
- **Never `git checkout`/`restore`/`reset`** on live-edited work. Back up to the scratchpad first and
  verify every restore by SHA.
- **Never `git add -A`** — a peer's `website/src/data/environmental-context.json` has been modified
  since S6b and is not yours.
- **Never refresh, truncate or regenerate** `~/.sage-gate1/false-hold-record.jsonl`. Never mix the
  138 `v1` records into the window's rate. Never count record 139 (a took-effect probe).
- **The founder pushes; never push.** Do not touch production, schema, flags (other than a
  founder-elected `GATE1_DEBUG`), or credentials.

---

## Always do — window + baseline health, read-only, owed every session

Re-derive and report, and **derive the token families rather than quoting them**:

- **Baseline days** — UTC days with ≥1 consult record. **At S9 close: 2 of 5** (2026-09-06,
  2026-09-07). **A session on a new calendar day may move this — re-derive, do not quote.**
- **⚠ RE-DERIVE AGGREGATE TALLIES AT CLOSE, NOT FROM AN EARLY SNAPSHOT.** S9's closing figures were
  **stale by one record** because the buffer is live-appended by the session reading it. PR19 caught
  it, the author did not. Compute the numbers immediately before writing them.
- **⚠ Attribute your own records by the buffer's `session` field, NEVER by an ad-hoc time filter.**
  S9 used `capturedAt >= 17:20` and undercounted its own contribution 2→1.
- **⚠ The baseline composition is a RULED disclosure obligation.** Report day-by-day **with tool
  distribution**. At S9 close all 20 window consult records were documentation authoring, **zero
  `website/src` engineering actions**.
- **⚠ The instrument-composition dependency is now RULED (S9 ruling, question 4).** The consult
  denominator is partly a function of **tool mode**: a session authoring via Bash heredocs generates
  **zero** consult records for work that would generate many via Write/Edit. If this session authors
  via Bash, say so and report its own contribution honestly.
- Per-UTC-day break-out by path (`guard` = schema `v4`/`v5` with `path`; `consult` = schema `v3`, no
  `path`). Verify the partition is exhaustive and exclusive.
- **Corroboration, with two traps:** anchor the window boundary on the **`gate1.log` line timestamp**,
  not the buffer's `capturedAt` (the same event is stamped twice, ms apart — using the buffer's
  produces a spurious off-by-one). And **split the token family by EXACT whole-token match** — a bare
  `CONSULT` pattern also matches `CONSULT-OUTAGE`. Derive `GUARD-*` from the log; a fifth token may
  appear and the method must survive it.
- Whether `GATE1_STATE_DIR` is still `/Users/clintonaitkenhead/.sage-gate1` (a mid-window change
  **fragments the buffer**).
- Guard status stated precisely: *"no evidence of a trip; tree verified clean"* — **not** "the guard
  has not tripped." It only runs when a session runs the battery.
- **Loop counts** from `~/.sage-gate1/<session>.loop.json` (`openLoop` / `closedRefs` /
  `abandonedRefs`), so the eventual pre-flip report has more than one session's evidence.

---

## Do NOT

Build the mechanism or modify `classifyCaller`. Re-run Condition 1's configurations. Chase
`CLAUDE_CODE_CHILD_SESSION` (answered twice). Test a second entrypoint (that is Condition 3). Edit
`layer2-mechanisms.ts` or any guarded file without a recorded founder waiver. Take route (b). Set or
unset any flag other than a founder-elected `GATE1_DEBUG`. Open S11-D2. Revive spawn-depth.
Retro-classify pre-boundary records (**ruled out**). Touch production, schema or credentials. Refresh
the buffer. Quote a perimeter count. Assume the UTC day from the local clock. **Push.**

---

## Records owed at close

A decision-log entry at the **physical tail** (`## YYYY-MM-DD — D-…`; newest at the tail, never
rewritten — append a correction entry instead). The S11 register's row **appended, never rewritten**
(S8 edited a row in place and had to disclose the deviation; S9 did not repeat it — do not reintroduce
it). A **lean** close. **A CLAUDE.md production-state note is due ONLY if production or the founder's
live loop actually changes.** Note that S9's `GATE1_DEBUG` act **did** leave the live loop in a changed
residual state — if that is still true at this session's close, say so plainly.

**PR19 applies** — independent review required. S9's three-dimension shape (substantive claim,
arithmetic, scope/safety) found a real defect in the arithmetic that the author had missed. **One
caution from S9: a reviewer disclosed it had not read the source files before answering.** Require
reviewers to cite specific file content, and follow up any ungrounded finding first-hand rather than
accepting or dismissing it.

---

## Forecast

Success = **the reproduction question answered with its evidence**, on a genuinely different calendar
day, different session, same client 2.1.260, under the mandatory pre-check, with ground truth known by
construction — plus an honest re-derived statement of window health including the ruled
baseline-composition and tool-mode disclosures, and the pins left intact and green.

**Acceptable alternative outcomes, honest and complete:** **the STEP 0 date gate fails and the session
stops there with a two-line report** (added 2026-09-08 — a SUCCESSFUL outcome, not a wasted session;
nothing further is owed); or the founder declines the `GATE1_DEBUG`
act (Condition 2 recorded as untestable-without-it); or the pre-check finds the variable still live
and this session becomes the investigation of that persistence mechanism instead.

**Nothing is licensed to be built by this session or by a passing result. Condition 3 remains
outstanding regardless. The window keeps running. The S11 flip remains REFUSED; weights remain
BLOCKED; the 0h call remains the founder's.**
