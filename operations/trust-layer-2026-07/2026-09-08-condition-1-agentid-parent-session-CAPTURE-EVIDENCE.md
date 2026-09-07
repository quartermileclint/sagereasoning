# Condition 1 — can a PARENT session ever act with `agent_id` set at H3?

**Answer: NO, on this client and entrypoint, across eight live captures. Condition 1 PASSES.**

**Authored 2026-09-08 ~03:30–04:00 AEST (`date`) = 2026-09-07 ~17:30–18:00 UTC.** The filename follows
this arc's local-date labels; note the UTC day is **2026-09-07**, so this session's records land on an
already-counted baseline day and add none.

**Owed by the 2026-09-07 five-question ruling** (`2026-09-07-mentor-ruling-S8-five-questions-verbatim.md`),
the first of three binding conditions before `classifyCaller` may be modified.

**NOTHING WAS BUILT. `classifyCaller` is byte-unchanged. This session determined a fact.**

---

## 1. The question

> Does the harness's own review-fleet architecture ever have the PARENT session act with `agent_id`
> set in H3's `PreToolUse` stdin?

**If YES** — `agent_id` does not discriminate; Option C′ falsified. **If NO** — Condition 1 passes,
Conditions 2 and 3 remain outstanding, and no build is licensed.

**Result: NO.** Three top-level H3 captures — including one taken while two agents were provably in
flight — carry no `agent_id` key at all. Five agent-issued H3 captures all carry one.

---

## 2. Method

`GATE1_DEBUG=1` dumps each hook's raw stdin to `<stateDir>/<eventName>-stdin.json`
(`lib/framing-core.mjs`, `maybeDebugDump`).

**The `GATE1_DEBUG` act was put to the founder and elected**, S8's waiver not assumed to carry
forward. The founder elected: *"I add it; sequential capture"* — the AI sets the variable, drives
strictly sequential captures, and edits **no guarded file**. Recorded as a founder waiver.
The config file (`.claude/settings.local.json`) is gitignored, so setting it is not a tree change;
it was SHA-backed-up to the scratchpad before editing and the SHA verified.

**Two provenance disciplines were applied to EVERY capture, and both caught real errors:**

1. **The dump filename does not prove which hook wrote it.** H2 (`subagent-framing-hook.mjs`, matcher
   `Task|Agent`) and H3 (`at-action-hook.mjs`, matcher `Bash|Edit|Write|MultiEdit|NotebookEdit`) both
   call `loadConfig({ eventName: "PreToolUse" })` and both write `PreToolUse-stdin.json`. Only
   `tool_name` distinguishes them. **This caught one capture** (row H2 below) that would otherwise
   have been miscounted as an H3 top-level observation.
2. **Sentinel content provenance — this session's addition, and it is what made the single-slot dump
   usable without editing a guarded file.** Every action carried a unique sentinel string in its
   `tool_input`. A capture is accepted only if it contains the sentinel of the action whose class is
   being claimed. **This caught two overwrites** (rows R1, R2) where a fleet agent had clobbered the
   slot between my action and my read. Route (b) — per-invocation dump filenames — was therefore
   **not needed and not taken**; no guarded file was edited.
3. Dumps read with the **Read tool, never Bash** (a Bash read is itself matched by H3 and would
   overwrite the dump before `cat` ran).

**A third, unplanned corroboration became available and is stronger than the sentinel:** the Agent
tool reports each spawned agent's id back to the caller. In every agent capture the wire's `agent_id`
**exactly matched the independently-reported agentId**. Provenance is therefore established twice
over, by content and by identity.

---

## 3. The captures

Client **2.1.260**, entrypoint `claude-desktop`, session `1f043ed1-a8c5-4384-9c24-8c5f63fb1636`,
UTC day 2026-09-07. Ground truth known **by construction** in every row.

| # | Configuration | Ground truth | `tool_name` | Sentinel verified | `agent_id` | `agent_type` |
|---|---|---|---|---|---|---|
| C0 | Control | **TOP-LEVEL** | Bash | `7f3c2e91` | **ABSENT** | **ABSENT** |
| C1 | Nested delegation, intermediate | intermediate agent | Bash | `b41d8a72` | `accaa649018021ec3` | general-purpose |
| R1 | Race artifact (fleet alpha) | agent | Bash | `ALPHA-step9` | `af2d06a0d71e2405b` | general-purpose |
| R2 | Race artifact (fleet charlie) | agent | Bash | `CHARLIE-step7` | `ac580aafd4d256530` | general-purpose |
| **C3** | **Top-level WHILE agents in flight** | **TOP-LEVEL** | Bash | `4d61eab7` | **ABSENT** | **ABSENT** |
| C3b | Agent writing immediately after C3 | agent (delta) | Bash | `DELTA-f27a` | `a76a4cc4b322dc975` | general-purpose |
| H2 | *(excluded — H2's, not H3's)* | top-level | **Agent** | — | ABSENT | ABSENT |
| C4 | Worktree-isolated agent | worktree agent | Bash | `WORKTREE-step9` | `a9b4c1fb9766b1c9f` | general-purpose |
| C5 | Closing control, post-fleet | **TOP-LEVEL** | Bash | `e5920c73` | **ABSENT** | **ABSENT** |

In every row `session_id` and `transcript_path` were the **parent's** — both established findings hold
unchanged, and this is why `classifyCaller` measures null.

---

## 4. Configuration-by-configuration

**Configuration 1 — nested delegation (the sharpest case).** An intermediate agent spawned a child;
the child used **Read only** (not in H3's matcher, so it generated no H3 event), and the intermediate
then issued one final sentinel `echo` as its guaranteed last tool call. The intermediate carries its
**OWN** `agent_id`, not its parent's and not none.
**This is CONSISTENT with the mechanism, not a falsification** — the ruling's own distinction: an
intermediate is a "parent" relative to its child but is **not a top-level session**, and the failure
case is specifically a top-level session carrying `agent_id`. The distinction is kept sharp here
because it is exactly the result that is easy to misread as a falsification.

**Configurations 2 + 3 — background and concurrent agents (what the ruling's reasoning turns on).**
Two background agents ran a Read/Read/Read/echo cycle (Reads to stay genuinely in flight while
writing the H3 slot only sparsely). The top-level session acted in between. Capture **C3** is a
top-level action with **no `agent_id`**, taken while both were running.
**In-flight status is corroborated three ways, not asserted:** (i) neither agent's completion
notification had arrived at capture time; (ii) re-reading the same slot with **no intervening Bash of
my own** found it overwritten by delta — proving an agent was writing immediately after C3; (iii)
both agents subsequently reported **20 tool uses each**, confirming they were mid-cycle.
The window therefore contains, in sequence: **agent → agent → top-level (no `agent_id`) → agent.**
That is precisely the structure that falsified Option B — a genuine live action sitting between fleet
records — and here the discriminator holds through it.

**Configuration 4 — worktree isolation.** Untested at S8. The worktree agent's H3 stdin carries
`agent_id` normally, with `cwd` pointing into `.claude/worktrees/agent-…` — confirming S8's finding
that `cwd` differs only for these, and establishing that worktree isolation does **not** suppress
`agent_id`. (A first attempt returned **zero tool uses** — the agent answered without executing — and
was correctly discarded rather than counted; the retry required an output the agent could not produce
without running the command.)

**Configuration 5 — a different entrypoint. NOT TAKEN.** There is no `claude` CLI on this machine, so
producing one would have been at cost, which the prompt explicitly directed against. **This is a real
gap, not a discharged item.**

**`CLAUDE_CODE_CHILD_SESSION=1` — reconfirmed, still not implying `agent_id`.** It is set in the
top-level session's own tool environment while all three of that session's H3 captures carry no
`agent_id`. This reproduces S8's observation in a second session, and remains **one configuration,
not the class.**

---

## 5. Limitations — what this does NOT establish

Stated plainly, because a passing result is the more dangerous one to overstate.

1. **One client, and it is the SAME client as S8's** — `2.1.260`. This session **contributes nothing
   to Condition 3** (client-version pinning with fallback). The result is pinned to 2.1.260 and is
   silent on every other version.
2. **One entrypoint** (`claude-desktop`), one machine, one UTC day, one session.
3. **Three top-level H3 samples.** This is an absence of `agent_id` across the interleavings actually
   sampled — **not a proof of impossibility.** A sequential-plus-sentinel method cannot rule out that
   some interleaving never sampled behaves differently.
4. **The capture is not race-free.** Route (b) (per-invocation dump filenames) would have given true
   race capture; it was deliberately not taken because it edits a `GUARD_RE`-matching file. The
   sentinel method establishes ownership of each accepted capture, which is what ground truth
   requires — but it samples the race rather than recording it exhaustively.
5. **Only one level of nesting was exercised**, and the CHILD's own H3 was never captured (by design —
   it was Read-only so the intermediate's echo would be the last writer). What a grandchild carries is
   untested. This does not bear on the question, whose failure case is a top-level session.
6. **Agents were instructed to run Bash**, which is construction of the condition, not steering of the
   observable: `agent_id` presence is not a function of which command runs.

---

## 6. Disposition

**Condition 1 PASSES** on client 2.1.260 / `claude-desktop`, with the limitations in §5 binding.

**Conditions 2 (a second capture on a separate day and session) and 3 (client-version pinning with
fallback) remain OUTSTANDING. NO BUILD IS LICENSED.**

On **Condition 2**, one honest note offered for the founder's and mentor's judgement rather than
claimed: this session is a **different session** from S8's (`1f043ed1…` vs `d99ff2f9…`) and a
different **local** day, but the **same UTC day** (2026-09-07) and the same client. Whether that
satisfies "a separate day and session" is **not the AI's call to make**, and it is not recorded as
discharged here.

The window keeps running. The S11 flip remains REFUSED; weights remain BLOCKED; the 0h call remains
the founder's.

---

## 7. `GATE1_DEBUG` revert — NOT COMPLETE at close, and the S8 finding is sharpened

The config file was restored to a state **byte-identical** to its pre-session backup
(SHA-256 `235d975c25ba4f461bc0cb9880822201731c7f971b0864488ce9b319a51f2f2d`, verified both directions).

**That is not the same as the revert having taken effect, and it has not.** A post-revert probe
carrying a fresh sentinel (`c0ffee12`) was still written to `PreToolUse-stdin.json` after the removal.
`GATE1_DEBUG` remains effectively set in the hook environment. This **independently reproduces S8's
revert-lag finding in a second session**, and does so with a sentinel-proven capture rather than an
inference from file timestamps.

**It also sharpens the finding into an ASYMMETRY that S8 did not state.** In this session:
- the **addition** took effect within a single tool call — no dumps existed in the state dir before
  the variable was set, and the very next action produced one;
- the **removal** has not taken effect at all across several subsequent tool calls.

So it is not that hook env changes propagate slowly in general; **additions propagate immediately and
removals lag.** Mechanism still unexplained. The standing memory (`claude-code-desktop-app-hook-env`)
records hot-reload of hook config mid-conversation, which is confirmed here for the add direction only.

**Owed to the founder, and NOT done by this session:** H1 (`UserPromptSubmit`) and H4 (`Stop`) fire at
turn boundaries outside any Bash block, so dumps will keep reappearing regardless of what this session
does. A manual `rm ~/.sage-gate1/*-stdin.json` after the session is the founder's, and the variable
should be confirmed genuinely inert in a fresh session before that is treated as closed.

**No dump content is reproduced in this file beyond the fields at issue**; the raw dumps also carry a
local messaging token and are deliberately not committed.

---

## 8. An instrument-composition finding, incidental but material

This session authored this 163-line governance artifact and generated **one guard record and ZERO
consult records.** The cause is not the action class — it is the **authoring tool**. This session's
working convention writes files with Bash heredocs, and `Bash` is dropped from the consult floor;
S8's 12 consult records came from `Write`/`Edit` tool calls doing the *same class of work*.

**Consequence for the ruled baseline disclosure and for the pre-flip report's owed "loop count by
action class": the consult denominator is partly an artifact of how a session happens to edit files,
not only of what it does.** Two sessions doing identical documentation work can differ by 12 consult
records purely on tool convention. Nothing has been adjusted or corrected for this — it is recorded so
the eventual report does not read the denominator as a pure measure of action class.

---

## 9. PR19 correction — the §3 close-out window figures were stale at write time

**PR19 dimension 2 (arithmetic, independent re-derivation from primary data) found a genuine
measured-at-different-moments defect, not a false positive.** It is corrected here as an APPENDED
correction, not by editing the figures above in place — the buffer is append-only and this file
should be too, per the standing lesson (S8 edited a row in place and had to disclose the deviation;
this file does not repeat it).

**Root cause:** the window-health figures in the session-open report were computed once, early, from
a 288-record buffer snapshot. This session's own two Bash actions (§8's guard-record finding, and the
config-write action that drew a caution — see the Sage Reflect close-out) each appended a further
guard record to the SAME buffer this report cites, and the day-tallies were never re-derived after
the second one landed. The report's own claim about "records added by this session" was *also*
computed with an inconsistent, ad-hoc time filter (`capturedAt >= 17:20`) that excluded the earlier
of the two — an error independent of, but compounding, the staleness PR19 found.

**Corrected, current-at-this-write figures** (re-derived independently by the author before and after
reading the PR19 result, both agreeing):

| | reported in §3 above | **corrected** |
|---|---|---|
| Guard records, window total | 129 | **130** |
| Guard, 2026-09-07 | 53 | **54** |
| `isKathekon=false` (contrary) | "98 of 129" | **98 of 130** (2 further records read `isKathekon: null`, a third bucket the original framing did not name at all: 98 True-false + 30 True-true + 2 null = 130) |
| `GUARD-*` log-token total | 129 | **130** (`GUARD-CAUTION` 115, `GUARD-PROCEED` 12, `GUARD-BLOCK` 2, `GUARD-OUTAGE` 1) |
| Records this session added | 1 | **2** — both `guard`/`v5`/`Bash`, at `11:29:11.773Z` and `17:38:59.145Z`, zero consult |

**Nothing in §3's substantive per-configuration evidence (the agent_id captures themselves) is
affected** — those are per-capture, sentinel-verified, and independent of the buffer's overall guard
tally. Only the aggregate window-health arithmetic was stale. **This is exactly the class of bug the
prompt's own "always do" section exists to catch**, and it was caught by adversarial re-derivation
from source rather than by the author's own check — recorded as a genuine finding, not smoothed over.

**Standing lesson for any future session reading a live-appended buffer mid-session:** re-derive
aggregate tallies from the buffer's state AT CLOSE, immediately before writing them into a report,
not from an early-session snapshot — and never apply an ad-hoc time filter to attribute records to
"this session" when the buffer already carries an exact `session` field for that purpose.

**Dimension 1 (substantive claim) reviewer note:** that reviewer disclosed it had not read the source
files before answering, and its structural questions were followed up first-hand rather than trusted
as findings. One is now closed with source evidence: `maybeDebugDump(cfg, raw)` in `at-action-hook.mjs`
dumps `raw = readStdin()` **verbatim, before `JSON.parse`** (line 371, called immediately after
`readStdin()` on line 370), and no code path anywhere writes to `event.agent_id` — the captured
`agent_id` field is Claude Code's own PreToolUse stdin, not a hook-synthesized value. The evidence
answers the question the ruling actually asked.

**Dimension 3 (scope/safety):** CLEAN — no violation of any constraint in the session prompt. No
guarded file touched, both SHA pins held, `classifyCaller` byte-unchanged, nothing committed or
pushed, the config file restored byte-identical to its pre-session backup, no stray worktrees, no
credential leaked in this artifact, the buffer append-only and intact.
