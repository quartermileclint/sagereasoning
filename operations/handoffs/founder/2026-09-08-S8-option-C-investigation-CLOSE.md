# S8 CLOSE — Option C investigation: superseded, not settled; relayed to the mentor

**Session S8. Written 2026-09-07 ~19:15 AEST (`date`) = 2026-09-07 ~09:15 UTC (`date -u`).**
**Tier `code-elevated` with a recorded founder waiver on one non-repo config edit. Nothing committed
yet — decision-log entry, register row, and two new records staged; nothing pushed. The observation
window ran throughout, untouched. AC7 not engaged.**

---

## What was asked, and what came back

The bounded question (Option D ruling, item 3): *does `SubagentStart` supply a signal that
correlates to an H3 record via a key OTHER than session ID?*

**Neither YES nor NO on its own terms.** `SubagentStart` was never observed — a live capture of H3's
own `PreToolUse` stdin found it already carries `agent_id`/`agent_type` directly when fired inside a
subagent, and neither field at all when fired at the top level. No `SubagentStart` marker, no
correlation key, no `hooks.json` registration would be needed if this candidate holds. That
supersedes the question as framed rather than answering inside it.

**Not built. Relayed to the mentor**, per the task's own bound and the same discipline that falsified
Option B (spawn-depth) — the candidate has not yet been checked for the failure mode that killed
that one: could a top-level session ever legitimately carry an `agent_id`-shaped value.

## The founder act, and how it was handled

The founder directed the AI to set `GATE1_DEBUG=1` directly ("you add it for me"), reversing the
standing rule that reserves this to the founder — S7 had refused the symmetric request. This is
recorded as a **founder waiver**, not silently done: scope stated (one key, gitignored config, no
guarded file), backed up to the scratchpad first, SHA-verified before and after, restored the same
session via `cp` (never `git checkout`), SHA-verified identical to the pre-edit original. Two `.json`
dump files the toggle produced (`PreToolUse-stdin.json`, and an incidental `PostToolUse-stdin.json`
from H5/handback firing on the same probe) were both removed before close.

## What was found, precisely

Live diff, subagent-fired H3 vs top-level-fired H3, same session, same tool (`Bash echo`):

| field | subagent | top level |
|---|---|---|
| `session_id` | parent's | parent's (same) |
| `transcript_path` | parent's | parent's (same) |
| `agent_id` | present | **absent (no key)** |
| `agent_type` | present | **absent (no key)** |
| all other fields | identical shape | identical shape |

Both established findings (session id and transcript path do not discriminate) re-confirmed on the
current client (2.1.260). The `agent_id`/`agent_type` pair was **not** in the 2026-06-20 baseline
capture the project's standing memory records — the wire has changed since, without any harness edit.
The memory (`claude-code-subagent-hook-contract`) is corrected in place with this finding, dated and
scoped, not overwriting the prior verified facts.

## Deliverables

- Decision-log entry, physical tail: `D-S8-OPTION-C-INVESTIGATION-AGENTID-CANDIDATE-FOUND-2026-09-08`.
- S11 register row, appended (not rewritten): the same finding, one paragraph.
- Mentor question, verbatim evidence + three questions:
  `2026-09-07-mentor-question-caller-class-agentid-in-h3-FOR-RULING.md`.
- Scope record for a possible future build (not started):
  `2026-09-08-option-C-investigation-RESULT-agentid-candidate-found.md`.
- Memory `claude-code-subagent-hook-contract.md` updated with the new capture, dated and scoped.

## Window + baseline health — SUPERSEDED once by PR19, re-derived twice; final cutoff `2026-09-07T09:26:55Z`

**⚠ The first table this close carried (cutoff `09:07Z`) went stale before the session ended — see
`D-S8-CORRECTION-WINDOW-HEALTH-STALE-BASELINE-MOVED-2026-09-08` in the decision log for the full
account. PR19 (three independent dimensions, sonnet/low) found it, traced the cause precisely (this
session's own Write/Edit tool calls authoring its required governance documents — not review-fleet
noise, checked and ruled out), and one reviewer's collateral claim that the v3-schema records were
mislabelled "consult" was itself checked against the session paste's stated vocabulary and found
wrong (v3/no-path IS consult, by the project's own definition). Both corrections are folded below;
neither is hidden.**

| | |
|---|---|
| Corroboration | **AGREE** — guard **127 = 127**, consult **8 = 8**. Family derived from `gate1.log`, log-line timestamp boundary, exact-token match. |
| 2026-09-06 UTC | guard 77 · consult 3 |
| 2026-09-07 UTC | guard 50 · consult **5** |
| **BASELINE** | **2 of 5 — MOVED**, for the first time this window. Driven entirely by this session's own document-writing (Write/Edit sit inside the established consult floor), not by code or investigation work. Whether a day earned this way should count the same as one earned by engineering work is named for the founder, not decided here. |
| Buffer | 273 total, still growing during this close's own drafting. |
| `callerClass` distribution, post-boundary (30 v5 records) | `unknown` **30**, `subagent` **0** — the S7 invariant re-confirmed, unmoved across every re-derivation this session ran (27 → 28 → 30). |
| `GATE1_STATE_DIR` | unchanged. |
| Guard status | no evidence of a trip; tree verified clean; pin green throughout — `layer2-mechanisms.ts` at `60cefedb…`, unchanged. |

## Verified

Boundary **250/0**, report **105/0**, capture **48/0**, negative **256/0 RELEASE GATE PASS** — all
re-verified at open, unchanged (this session touched no guarded file). `git status` at close: the
peer's pre-existing `environmental-context.json` modification, untouched by this session; two new
non-guarded records; the decision-log and register edits above. Nothing committed yet.

## PR19 — three independent dimensions, sonnet/low, founder-authorized model drop

**2 of 3 folded, 1 rejected on source-checking.** Full account:
`D-S8-PR19-COMPLETE-TWO-FOLDED-ONE-REJECTED-2026-09-08` in the decision log.

- **Field-diff claim: CONFIRMED**, one documentation gap folded — the mentor-question document now
  states explicitly that H2 and H3 share `maybeDebugDump`'s event-name-keyed dump file, and that
  `tool_name:"Bash"` (not the filename) is what proves the two captures are H3's.
- **Window/corroboration arithmetic: genuinely stale**, folded as its own decision-log correction
  entry, `D-S8-CORRECTION-WINDOW-HEALTH-STALE-BASELINE-MOVED-2026-09-08` — baseline moved 1→2 of 5,
  caused by this session's own Write/Edit tool calls authoring its required governance documents. A
  collateral claim from the same reviewer (that v3-schema records are mislabelled "consult") was
  checked against the session paste's own vocabulary and **rejected** — the terminology was correct.
- **Scope/safety: 6/7 PASS.** The one FAIL — incomplete stdin-dump cleanup — was real: this session
  cleaned only the two dumps it deliberately read, missing two more silently written by hooks it
  never explicitly probed (`Stop-stdin.json`, `UserPromptSubmit-stdin.json`). All four confirmed
  removed before this entry was written.
- **A further finding, surfaced during cleanup rather than by any reviewer, and then itself corrected
  twice:** `GATE1_DEBUG` was removed from `.claude/settings.local.json` at file-mtime `19:06`, yet
  hook stdin dumps — the exact artifact that flag produces — were still being written at `20:52`:
  **~1 hour 45 minutes later, across at least two founder turn boundaries and a model switch.**
  Mechanism unconfirmed (no visibility into the app's env cache); recorded as a revert-lag finding in
  `claude-code-desktop-app-hook-env.md`. **Editing the config file back was necessary but was not
  observed to be sufficient for an immediate revert.**
  **Two corrections to this session's own first account of it, both in the decision log
  (`D-S8-CORRECTION-DUMP-MECHANISM-MISSTATED-H1-H4-ARE-THE-CAUSE-2026-09-08`):** (i) the first
  account claimed cleanup from inside the session was impossible because an `rm` would be captured
  and overwrite itself — **that is wrong.** `maybeDebugDump` runs before the tool executes, verified
  empirically (a block was made to print the dump's own `tool_input.command` and it held that block's
  command), so an `rm` inside a Bash block does leave it clean. (ii) The real reason dumps keep
  reappearing is that **H1 (`UserPromptSubmit`) and H4 (`Stop`) fire at turn boundaries**, outside
  any block the assistant controls — observed directly as `Stop-stdin.json` at `19:39` and
  `UserPromptSubmit-stdin.json` at `20:51`. The founder-facing advice is unchanged (a manual `rm
  ~/.sage-gate1/*-stdin.json` after the session, since H4 writes once more as the session closes) but
  the reason for it is now stated correctly.

## Rollback

Nothing built to roll back. The `GATE1_DEBUG` edit was itself reverted within the session, SHA-verified
(with the caveat above — the file edit and the artifact's actual cessation were not simultaneous).

## Corrections to method, worth carrying forward

1. **A single subagent turn that answers in text without a real tool call produces `tool_uses:0`** —
   the first probe attempt did exactly this; a diagnostic that depends on a hook firing must instruct
   the subagent unambiguously to invoke a tool, and the caller should check `tool_uses` in the result,
   not just that a response came back.
2. **The corroboration recipe has two traps that look like real discrepancies and are not:** the same
   event is timestamped twice, milliseconds apart, by `gate1.log` (verdict-log time) and the buffer
   (capture time) — anchor the boundary on the log line, not the buffer's `capturedAt`. And a bare
   token match over-counts a hyphenated sibling (`CONSULT` matches `CONSULT-OUTAGE`) — split the
   family by exact match, never prefix.
3. **`maybeDebugDump` keys its output file by event NAME, not by which hook wrote it** — `H3` and
   `H2` share the `PreToolUse` slot, and reading the dump with Bash is itself matched by H3's own
   matcher and overwrites the file before the read completes. Use the Read tool.

**STATE:** the investigation ran to its bound and stopped there — a candidate found, not built, not
ruled on. The window **RUNNING and untouched**; the guard **armed and green**; **baseline 1 of 5**.
**S11-D2 remains BLOCKED on the five-day threshold. The S11 flip remains REFUSED; weights remain
BLOCKED; the 0h call remains the founder's.**

---

## Carried for the founder

1. **The mentor question** — three questions, evidence attached, awaiting your relay + a ruling.
2. **S7's still-open items**, none this session's to take: `npx` fail-closed (precondition
   discharged, still yours to apply); closing peer sessions (six were open at S7); the tool-choice
   measurement-validity question (named, unresolved, unsteered).
3. **Commit**: the two decision-log/register edits and two new record files are staged in the working
   tree, uncommitted. None matches `GUARD_RE`. Say when you'd like them committed — the founder
   pushes, never this session.
