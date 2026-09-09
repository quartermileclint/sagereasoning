# Condition 2 — does the S9 `agent_id` finding reproduce on a genuinely different calendar day?

**Answer: YES. Condition 2 PASSES.** A top-level H3 `PreToolUse` capture carries no `agent_id`; an
agent-issued H3 capture on the same client, same session, same day carries one. Both captures are
sentinel-verified and `tool_name: "Bash"`.

**Authored 2026-09-09 ~17:30–17:50 AEST (`date`) = 2026-09-09 ~07:30–07:50 UTC.** Local and UTC agree
on the calendar day for once — 2026-09-09 under both readings, which is what made the date gate pass.

**Owed by the 2026-09-07 five-question ruling** (`2026-09-07-mentor-ruling-S8-five-questions-verbatim.md`)
as specified by the 2026-09-08 S9 four-question ruling
(`2026-09-08-mentor-ruling-S9-four-questions-verbatim.md`, canonical). The **second** of three binding
conditions before `classifyCaller` may be modified.

**NOTHING WAS BUILT. `classifyCaller` is byte-unchanged. This session determined a fact.**

---

## 1. The gates, in the order they were run

### STEP 0 — the date gate

```
Wed Sep  9 17:30:49 AEST 2026
Wed Sep  9 07:30:49 UTC 2026
```

**PASSES.** 2026-09-09 under **both** conventions, distinct from 2026-09-07 and 2026-09-08. This is
the first unambiguously qualifying day, exactly as the S10 amendment predicted — the session opened
at 17:30 AEST, well clear of the 10:00 AEST UTC rollover that would have produced a new-UTC-day /
same-local-day ambiguity.

### The mandatory two-step pre-check

- **STEP 1.** No `~/.sage-gate1/*-stdin.json` existed at open (an `ls` before the `rm` returned
  nothing). The founder had already cleared them, or S9's had been removed.
- **STEP 2.** A control probe `echo "SENTINEL-S11-PRECHECK-B-20260909-9d1e5f30"` was run in this
  fresh session, then `~/.sage-gate1/PreToolUse-stdin.json` was **Read** (never `cat` — a Bash read
  is itself matched by H3 and would overwrite the dump with its own stdin).
- **Result: `File does not exist`. No dump. `GATE1_DEBUG` is genuinely inert in this session.**
  Condition 2's capture may proceed.

**This is itself a new fact, and it bounds S9's finding.** S9 left the variable effectively live after
a byte-identical revert and could not explain the mechanism. This session's open shows the residual
**does not survive a session boundary** — see §5, where the lag then reproduced *within* this session.

### Open-time STOP conditions

| Check | Expected | Re-derived | Status |
|---|---|---|---|
| `layer2-mechanisms.ts` SHA-256 | `60cefedb…` | `60cefedb5f4f78822301b3f9c195813b63b00546431ecde08473b118bea52f73` | GREEN |
| `stoic-brain.ts` SHA-256 | `fa8895ec…` | `fa8895ec949b9f6d2f95b9e941a423a095e9c66abe600a1e13fa1b84469b4928` | GREEN |
| Any `GUARD_RE`-matched file modified? | none | none of the 4 modified + 2 untracked paths match | GREEN |
| `GATE1_STATE_DIR` | `/Users/clintonaitkenhead/.sage-gate1` | unchanged | GREEN |
| `GATE1_DEBUG` in config at open | absent | absent (grep count 0) | GREEN |

The pins were re-derived, not quoted; both match the prompt's expected values.

---

## 2. The founder election

`GATE1_DEBUG` is a change to the founder's live harness config. S9's waiver does not carry forward, so
it was put to the founder via `AskUserQuestion`. **Elected: "AI adds it, sequential capture (S9's
shape)"** — AI performs the config edit, takes the captures sequentially, then reverts and verifies.
No guarded-file edit; route (b) not taken.

**Config discipline.** `.claude/settings.local.json` was copied to the scratchpad and both files
SHA-verified identical (`235d975c25ba4f461bc0cb9880822201731c7f971b0864488ce9b319a51f2f2d`) **before**
the edit. A per-key SHA-256 of the `env` block was taken before and after: **all 11 pre-existing
key/value pairs are byte-identical across the edit**; exactly one key was added
(`GATE1_DEBUG=1`, key-SHA `9b391752305398d3`). Credentials untouched.

---

## 3. The captures

Both are `hook_event_name: "PreToolUse"`, `tool_name: "Bash"` — **H3** (`at-action-hook.mjs`), not H2
(`subagent-framing-hook.mjs`, matcher `Task|Agent`). The dump filename does not distinguish them;
`tool_name` does. Both carry their action's unique sentinel, so each is provably the capture of the
action it is claimed for and not a race overwrite.

### Capture 1 — TOP-LEVEL control

Sentinel `SENTINEL-C2-TOPLEVEL-20260909-7b3e9a41`, verbatim from the dump:

```json
{"session_id":"c8b3575b-eec0-4c10-a5ff-efc22c91c9ef","transcript_path":"/Users/clintonaitkenhead/.claude/projects/-Users-clintonaitkenhead-Claude-work-PROJECTS-sagereasoning/c8b3575b-eec0-4c10-a5ff-efc22c91c9ef.jsonl","cwd":"/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning","scratchpad_dir":"/private/tmp/claude-501/-Users-clintonaitkenhead-Claude-work-PROJECTS-sagereasoning/c8b3575b-eec0-4c10-a5ff-efc22c91c9ef/scratchpad","prompt_id":"b1916d2a-2264-47c3-95b5-62213dff6335","permission_mode":"auto","effort":{"level":"low"},"hook_event_name":"PreToolUse","tool_name":"Bash","tool_input":{"command":"echo \"SENTINEL-C2-TOPLEVEL-20260909-7b3e9a41\"","description":"Capture 1: top-level control sentinel probe"},"tool_use_id":"toolu_017SAb8cCkKP4sZephnUTZM1"}
```

**`agent_id` ABSENT. `agent_type` ABSENT.** Keys absent, not empty — the full key list is
`session_id, transcript_path, cwd, scratchpad_dir, prompt_id, permission_mode, effort,
hook_event_name, tool_name, tool_input, tool_use_id`.

### Capture 2 — AGENT-ISSUED

Sentinel `SENTINEL-C2-AGENT-20260909-e82d16bf`, verbatim from the dump:

```json
{"session_id":"c8b3575b-eec0-4c10-a5ff-efc22c91c9ef","transcript_path":"/Users/clintonaitkenhead/.claude/projects/-Users-clintonaitkenhead-Claude-work-PROJECTS-sagereasoning/c8b3575b-eec0-4c10-a5ff-efc22c91c9ef.jsonl","cwd":"/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning","scratchpad_dir":"/private/tmp/claude-501/-Users-clintonaitkenhead-Claude-work-PROJECTS-sagereasoning/c8b3575b-eec0-4c10-a5ff-efc22c91c9ef/scratchpad","prompt_id":"b1916d2a-2264-47c3-95b5-62213dff6335","permission_mode":"auto","agent_id":"a9a920bced6402b37","agent_type":"Explore","hook_event_name":"PreToolUse","tool_name":"Bash","tool_input":{"command":"echo \"SENTINEL-C2-AGENT-20260909-e82d16bf\"","description":"Execute instrumentation sentinel"},"tool_use_id":"toolu_012DhnGH8UsGXL57uwgt75t6"}
```

**`agent_id: "a9a920bced6402b37"` PRESENT. `agent_type: "Explore"` PRESENT.**
`session_id` and `transcript_path` are the **parent's** in both captures — which is exactly why
`classifyCaller`, which measures session id, reads null. Unchanged from S9.

### The corroboration, and it is stronger than the sentinel

The agent was asked to report its own id and answered **"not known to me"** — a subagent does not know
its own `agent_id`, so the prompt's method item 5 could not be satisfied by self-report. It was
satisfied by a better route: the **`PostToolUse` dump for the parent's `Agent` tool call** carries the
harness's own report of the spawn —

```
"tool_response": { … "agentId":"a9a920bced6402b37", "agentType":"Explore",
                   "resolvedModel":"claude-haiku-4-5-20251001", "totalToolUseCount":1 … }
```

**`agentId` matches the `agent_id` on the agent's H3 wire exactly**, and `agentType` matches. The
harness's report of who it spawned and the wire field observed from inside that agent agree. Ground
truth is known by construction, from two independent surfaces.

`totalToolUseCount: 1` also confirms the agent obeyed the single-call instruction, so no later tool
call of its own overwrote the single-slot dump.

### Verdict

| Configuration | `agent_id` | `agent_type` | S9 result | Reproduces? |
|---|---|---|---|---|
| Top-level H3 | **absent** | absent | absent | **YES** |
| Agent-issued H3 | **present** (`a9a920bced6402b37`) | `Explore` | present, own id | **YES** |

**Condition 2 PASSES.** Different calendar day (2026-09-09 vs 2026-09-07/08), different session
(`c8b3575b…`), same client 2.1.260 (§4).

---

## 4. The client version — and a correction to the prompt's premise

The prompt required the same client version, **2.1.260**, and instructed: *"Verify the version FROM
YOUR OWN CAPTURE… `version` and `entrypoint` ride the Claude Code hook stdin alongside
`session_id`/`transcript_path`."* It also flagged a residual: S10 *inferred* the field's presence and
could not observe it, and asked this session to confirm it.

**The residual is now closed, and the premise was wrong.**

- **`version` and `entrypoint` are NOT on the `PreToolUse` payload.** Both captures' full key lists are
  reproduced above; neither field appears. They are not on the `PostToolUse` payload either.
- **They ride the transcript.** Scanning this session's transcript JSONL for a top-level `version`
  key: **88 lines carry one, and every one of them reads `2.1.260`**; `entrypoint` likewise appears 88
  times, every one `claude-desktop`. Single-valued, no drift mid-session.

**So the version condition is satisfied — client 2.1.260, entrypoint `claude-desktop`, unchanged from
S8 and S9 — but by reading the transcript, not the hook payload.** The captures are comparable and no
STOP was triggered. S9's evidence-file header ("Client 2.1.260, entrypoint `claude-desktop`") is
correct as a *fact about the session*; the prompt's gloss that it was read *off the hook payload* is
not.

**Bearing on Condition 3, stated as an input and nothing more.** A runtime version read is still
possible without hard-coding a constant, but not the way the prompt assumed: the harness would have to
read `transcript_path` — which **is** on the H3 payload — and parse a `version` field out of the
transcript. That is a materially different design from reading a field already in hand: it adds a file
read, a parse, and a failure mode (missing/unreadable/rotated transcript) to a hook that currently
touches no such file. **This is an input to Condition 3's design, not a licence to start it.**

---

## 5. The `GATE1_DEBUG` revert-lag — reproduced, and now bounded

On completing the captures, `.claude/settings.local.json` was restored from the scratchpad backup and
verified: **SHA `235d975c…`, identical to the pre-session backup; `GATE1_DEBUG` grep count 0.** The
dumps were then cleared and a fresh control probe run
(`echo "SENTINEL-S11-POSTREVERT-20260909-c31b8a75"`).

**A dump appeared, carrying the post-revert sentinel.** The revert-lag reproduces: the config is
byte-identical to its pre-session state and the variable is still effectively live.

**What is new is the boundary.** S9 observed the asymmetry (addition took effect within one tool call;
removal had not taken effect by close) and recorded the mechanism as unknown, with the practical
consequence that dumps "reappear regardless". This session adds the other end of it:

- **At open, in a fresh session with the key absent from the config, the variable was INERT** (the
  pre-check found no dump). So the residual **does not survive a session boundary.**
- **Within the session, after the same byte-identical revert, it stayed LIVE.**

Together these are consistent with a simple mechanism: the config's `env` block is applied *into* the
running session's process environment when it hot-reloads, and **deleting a key from the file cannot
retract an environment variable already exported into a live process** — while a new session builds
its environment from the file afresh. **This is a hypothesis consistent with two sessions' observations,
not a proven mechanism**; it has not been tested directly (that would need a third configuration, and
this session is not licensed to widen scope). It is offered because S9 recorded the mechanism as wholly
unknown and this narrows it considerably.

**Practical consequence, stated plainly.** `GATE1_DEBUG` remains effectively live for the remainder of
this session, and H1/H4 fire at turn boundaries, so dumps will continue to be written until the
session ends. The dumps carry raw tool inputs — the `PostToolUse` dump read this session contained the
full delegated subagent prompt. **The reliable clear is `rm ~/.sage-gate1/*-stdin.json` after this
session has ended; a removal during the session will be undone by the next hook firing.** That is the
founder's act. On the evidence above, the next fresh session should find the variable inert — but the
S9 ruling's mandatory two-step pre-check still applies and should still be run, since a hypothesis is
not a guarantee.

---

## 6. Window and baseline health — re-derived at close

**Buffer**: `~/.sage-gate1/false-hold-record.jsonl`, 369 lines, 0 unparseable. Never refreshed,
truncated or regenerated.

Schema distribution: `v1` 138, `v3` 27, `v4` 97, `v5` 107.
**Window = lines 140–369 = 230 records.** The 138 `v1` records are a different regime and are excluded.
**Record 139 is the took-effect probe and is excluded from the rate** — it matters below.

**Partition** (`consult` = `v3` with no `path`; `guard` = `v4`/`v5` with `path`): **guard 203,
consult 27**, sum 230 — verified **exhaustive and exclusive** (no record fell outside the two classes).

### Per-UTC-day

| UTC day | consult | guard |
|---|---|---|
| 2026-09-06 | 3 | 76 |
| 2026-09-07 | 17 | 63 |
| 2026-09-08 | 6 | 57 |
| 2026-09-09 | 1 | 7 |

**Baseline days (UTC days with ≥1 consult record): 4 of the 4 UTC days present in the window.**
The prompt records "2 of 5" at S9 close and instructs re-derivation. My derivation finds four UTC days
in the buffer, all four with consults. **I cannot reproduce the denominator 5 from the buffer** — only
four distinct UTC days appear — so I report my derivation and flag the discrepancy rather than
reconciling it by assumption. The numerator moved for a clear reason: 09-08 and 09-09 have since
acquired consult records.

### Baseline composition — the ruled disclosure

All 27 consult records, classified by the path in `actionPreview`:

| Class | n |
|---|---|
| `operations/` documentation | 19 |
| scratchpad (`/private/tmp/…`) | 4 |
| other `.md` | 3 |
| **`website/src` engineering** | **1** |

The single engineering action is `2026-09-08T20:19:44.935Z`, session `a7ee3eeb`, `Edit` on
`website/src/lib/cognitive-os/__tests__/cognitive-os.test.ts`.

**At S9 close the window held zero `website/src` engineering actions; it now holds exactly one.** The
composition remains overwhelmingly documentation authoring — 26 of 27. Any rate derived from this
denominator is a rate over documentation-authoring traffic, not over engineering traffic.

### Instrument-composition dependency — this session's own honest report

**This session contributed ZERO records to the window** — zero consult and zero guard. Verified by the
buffer's `session` field, not by a time filter: no window record carries `c8b3575b…`. The seven guard
and one consult record on 2026-09-09 belong to two *other* sessions (`8b9b8edf`, `a7ee3eeb`).

The mechanism is visible in `gate1.log`: every Bash call this session made logged
`AT-ACTION-SKIP-BASH … reason=bash-dropped-from-score`. **This session ran in auto mode and authored
everything — including this file — via Bash heredocs, so it generated no consult records for work that
would have generated several via Write/Edit.** Its other actions were `echo` probes, `Read` calls and
one `Agent` spawn, none of which enter the consult floor. This is the ruled instrument-composition
dependency in its starkest available form: a full session of work, zero denominator contribution.

### Corroboration against `gate1.log` — and a refinement to the method

Token families were **derived** from the log, not hard-coded: sixteen distinct whole tokens appear in
the window, including four `GUARD-*` (`GUARD-CAUTION`, `GUARD-PROCEED`, `GUARD-BLOCK`, `GUARD-OUTAGE`).
The method survives a fifth appearing.

The **exact whole-token** discipline is load-bearing: in the window `CONSULT` = 27 and `CONSULT-OUTAGE`
= 8. A bare `CONSULT` substring match would return 35 and over-count by 8 — `CONSULT-OUTAGE` writes no
buffer record (verified: 0 of 8 have a buffer record within 50 ms).

**The anchor needs one correction to the prompt's method, and it is the same trap in the opposite
direction.** The prompt says to anchor on the `gate1.log` line timestamp rather than the buffer's
`capturedAt`, because the same event is stamped twice. Correct — the window-start event is stamped
`2026-09-06T09:44:55.265Z` in the log (line L38042) and `…267Z` in the buffer, 2 ms apart. But
**L38042 is the took-effect probe's own log line, and its buffer record is #139 — which is excluded
by rule.** Anchoring inclusively at L38042 therefore counts one event whose buffer record is
deliberately excluded:

| Anchor | log `GUARD-*` | log `CONSULT` (exact) | buffer |
|---|---|---|---|
| L38042 (probe's own line) | 204 | 27 | guard 203, consult 27 |
| **L38043 (first line after it)** | **203** | **27** | **exact match, both families** |

This was found by 1:1 pairing every window `GUARD-*` log line to a buffer guard record within 0.5 s:
exactly one log line went unmatched, and it was the anchor itself. **A first hypothesis — that the
lone `GUARD-OUTAGE` wrote no record, mirroring `CONSULT-OUTAGE` — was tested and refuted**: that line
does have a buffer record. The correct anchor is **L38043**, and at that anchor the corroboration is
exact in both families.

### Other health

- **`GATE1_STATE_DIR`** is still `/Users/clintonaitkenhead/.sage-gate1` — the buffer is not fragmented.
- **Guard status, stated precisely: no evidence of a trip; tree verified clean.** Not "the guard has
  not tripped" — it only runs when a session runs the battery.
- **Loop counts** (`~/.sage-gate1/<session>.loop.json`, six sessions with activity in the window):

  | session | openLoop | closedRefs | abandonedRefs |
  |---|---|---|---|
  | `9e914689` | none | 14 | 29 |
  | `91d9bb92` | open | 0 | 0 |
  | `d1e751f5` | open | 0 | 2 |
  | `1a999627` | open | 1 | 14 |
  | `7c87a084` | none | 1 | 3 |
  | `a7ee3eeb` | open | 0 | 1 |

  **This session has no loop file** — it opened no loop, consistent with its zero consult records.

---

## 7. Honest limits

- **Two captures, not eight.** The prompt's minimum sufficient set for a reproduction check is one
  top-level control and one agent-issued capture; that is what was taken. The optional
  during-concurrency top-level capture was **not** taken — it is explicitly not required for
  Condition 2, and S9 already established it at Condition 1.
- **The subagent ran on `haiku`** (an explicit model override, for cost). Model is not a field on the
  hook payload and `agent_id` is harness-assigned, so this should not bear on the finding — but it is
  a deviation from S9's default and is disclosed rather than buried.
- **The revert-lag mechanism is a hypothesis, not a proof.** See §5.
- **The baseline-day denominator discrepancy with S9's "2 of 5" is unreconciled**, deliberately. See §6.
- **One adjacent observation, recorded and NOT investigated.** The `PostToolUse` dump reports the
  Explore subagent's total context as `totalTokens: 23672` (cache_read 22367 + creation 1165). The
  standing memory `subagent-context-carries-claudemd` records ~219k tokens for an Agent-tool subagent
  receiving the full repo CLAUDE.md. These do not agree. This session did not chase it — it is out of
  scope and the prompt is explicit about adjacent investigation — but the memory should not be relied
  on until someone checks it deliberately.

---

## 8. What this does and does not license

**Condition 2 PASSES.** **Condition 3 (client-version pinning with fallback) remains outstanding**, and
§4 changes what it will have to do. **`classifyCaller` is byte-unchanged and nothing is licensed to be
built** by this session or by this result. The observation window keeps running. The S11 flip remains
REFUSED; weights remain BLOCKED; the 0h call remains the founder's.

---

## 9. PR19 — independent review

Model dropped to sonnet/low for the review, per the founder's standing per-session permission;
restored to opus/medium after. Reviewed the three S9-precedent dimensions (substantive claim,
arithmetic, scope/safety), re-deriving rather than trusting: independently confirmed the sentinel
strings inline in both quoted JSON blocks; independently re-grepped the live transcript for `version`
(213 occurrences by review time — growth from this file's own later transcript activity, not a
contradiction); independently read buffer line 139 and `gate1.log` line 38042 directly and confirmed
the 2 ms gap and the anchor correction; independently ran `git status`/`git diff --stat` and checked
every changed/new path against `GUARD_RE` by hand; independently re-derived both SHA pins.

**Verdict: CLEAN.** One item flagged rather than silently accepted: the claim that all 11 pre-existing
`env` values are byte-identical before/after the edit could not be independently re-verified by the
reviewer (the pre-edit backup lives in a prior session's scratchpad, not reconstructable from a fresh
review session) — noted as "asserted but not independently re-verifiable," not rejected. No arithmetic
error, no `GUARD_RE` file touched, nothing committed or pushed, no production/schema/flag/credential
change beyond the disclosed `GATE1_DEBUG` edit and its reverted-with-lag state.
