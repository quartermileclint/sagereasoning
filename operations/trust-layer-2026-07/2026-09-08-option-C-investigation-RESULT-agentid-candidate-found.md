# S8 result — Option C investigation: NO on the literal question, YES on a superseding candidate found in the course of testing it

**Bounded question (Option D ruling, item 3):** *"Does `SubagentStart` supply a signal that correlates
to an H3 record via a key OTHER than session ID?"*

**Answer, precisely:** `SubagentStart` was never observed this session — it did not need to be. H3's
own `PreToolUse` stdin was found, on live capture, to already carry a discriminating field
(`agent_id`) when fired inside a subagent, and to omit it entirely when fired at the top level. No
correlation with any second hook's marker is required. This supersedes the literal question rather
than answering it inside its own frame — see the mentor question authored the same session,
`2026-09-07-mentor-question-caller-class-agentid-in-h3-FOR-RULING.md`, for the full evidence and the
three questions put to the mentor.

**Status: NOT BUILT. Relayed to the mentor. Awaiting ruling.** This document is the scope record for
if and when the mentor licenses a build — it is authored now, while the evidence is fresh, but the
build itself is out of this session's bound (*"Do NOT build the mechanism this session. Determine
whether it is possible."*).

---

## What a build would need to change, IF licensed

1. **`classifyCaller` in `harness/gate1-pre-decision/claude-code/hooks/lib/false-hold-capture.mjs`**
   — currently reads `transcriptPath` and tests for a `/subagents/` path segment. Would change to
   read `agentId` (a new parameter) and test `typeof agentId === "string" && agentId !== ""`.
2. **The call site in `at-action-hook.mjs`** (`describeAction`, around line 311) — currently passes
   `transcriptPath` to `classifyCaller`. Would pass `event.agent_id` instead (or in addition, as a
   disjunction — see the false-positive question below before deciding which).
3. **NO change to `hooks.json`.** `SubagentStart` need not be registered. This is the single largest
   difference from the mechanism the ruling's "Option C" phrase named — Option C as originally framed
   assumed a second hook was necessary; this candidate does not need one.
4. **NO change to the buffer schema** (`false-hold-record-v5` already carries `callerClass` as a
   top-level field, added under ruling 3; the value space `'subagent' | 'unknown'` is unchanged, only
   the derivation changes).

## ⚠ RULED 2026-09-07 — THREE BINDING CONDITIONS BEFORE `classifyCaller` MAY BE MODIFIED

**Superseding the informal list below, which was written before the ruling arrived. The list below is
retained because it is substantially the same ground and shows the conditions were anticipated, but
the AUTHORITY is the ruling. Verbatim, canonical:
`2026-09-07-mentor-ruling-S8-five-questions-verbatim.md`. Adopted:
`D-MENTOR-RULING-S8-FIVE-QUESTIONS-ADOPTED-2026-09-08`.**

**Option D is CONDITIONALLY REOPENED. The candidate is named Option C′ (H3 self-discrimination via
`agent_id` presence). All three conditions are required — not any one of them.**

**Condition 1 — False-positive check under controlled conditions with ground truth.** The discipline
that falsified Option B, applied here. *"The first thing the false-positive check must examine"* is
the `CLAUDE_CODE_CHILD_SESSION` question this investigation deliberately left unchased: **does the
PR19 review-fleet architecture ever have the PARENT session act with `agent_id` set?** *"A parent
session acting with `agent_id` set would mean `agent_id` presence does not discriminate — it would be
the spawn-depth failure mode in a different form."* Nested delegation is named alongside it. **The
investigation is explicitly NOT complete until this is answered.**

**Condition 2 — A second live capture, separate day AND separate session.** *"One capture on one
client version on one machine is a candidate… The June capture established that the field was absent.
This capture establishes it is now present. A third capture establishes it is stable. That is the
minimum for a wire contract that a build can rest on."*

**Condition 3 — Client-version pinning, with a fallback the build must carry.** The disclosure must
note the client version (**2.1.260**) at which `agent_id` was first observed, and **the harness must
detect the field's absence and fall back to `unknown` rather than silently misclassifying** if the
client updates. Stated by the ruling as *"a condition on what the build must include when it lands."*

**Until all three are met, nothing changes on the live surface.** *"The amended segment-1 clause
stands exactly as the Option D ruling left it until a build actually lands. A candidate mechanism,
however promising, does not change what the disclosure may currently claim."*

---

## What is NOT yet known, and must be closed before any of the above is built
*(Written pre-ruling. Superseded in authority by the three conditions above; retained as the
contemporaneous record.)*

- **Whether `agent_id`'s presence is a stable client-command-hook contract or an artifact of one
  client version (2.1.260) on one machine.** The June 2026-06-20 capture did not have this field. The
  wire has already changed once without any harness edit; it can change again.
- **Whether the parent session can ever legitimately carry `agent_id`** — a false-positive check
  parallel to what falsified Option B (spawn-depth). `CLAUDE_CODE_CHILD_SESSION=1` was observed as
  set in this session's own top-level tool environment (a fact surfaced but not chased down, per the
  session's own scope bound) — if that or an analogous field means a "child" top-level session can
  itself carry an `agent_id`-shaped identity under some configuration (nested harness invocation,
  host/child session split, etc.), the candidate could misflag the exact class Option B was ruled out
  for misflagging. This is the single most important open question and the reason nothing is built
  yet.
- **Whether this needs a second independent capture, on a separate day/session,** to rule out a
  session-specific artifact of this one probe (a stronger discipline than the single-session capture
  this document rests on).

## Method note, for whoever builds this if licensed

The capture method used this session (spawn a probe subagent whose sole tool use is a harmless
`echo`; read the `GATE1_DEBUG` dump with the **Read** tool, never Bash — a Bash read of
`<stateDir>/PreToolUse-stdin.json` is itself matched by H3's own matcher and overwrites the file with
its own invocation before the read completes) is reusable and window-neutral: it wrote zero buffer
records (Bash is dropped from the consult floor; no guard-triggering command was issued). It needs a
founder-elected `GATE1_DEBUG=1` waiver exactly as this session took, reverted the same session via a
SHA-verified restore from a scratchpad backup (never `git checkout` on the live settings file).
