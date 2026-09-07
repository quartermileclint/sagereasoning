# S9 CLOSE — Condition 1 (parent-session `agent_id` false-positive check)

**Session date: 2026-09-08 AEST (`date`) = 2026-09-07 UTC.** The UTC day matters: this session's
records land on the **already-counted** baseline day 2026-09-07 and **add no baseline day**.
**Session type:** `code-elevated` — one env-flag act on the founder's own local harness config;
**no production, schema, credential, migration or repo-code change. AC7 not engaged.**

---

## Result

**Condition 1 PASSES and is now CLOSED by ruling.** A top-level (parent) session never carried
`agent_id` in H3's `PreToolUse` stdin, across eight captures spanning four configurations on client
**2.1.260** / `claude-desktop`.

`classifyCaller` is **byte-unchanged. NOTHING WAS BUILT. No build is licensed.**

Full evidence, every capture and every limitation:
`operations/trust-layer-2026-07/2026-09-08-condition-1-agentid-parent-session-CAPTURE-EVIDENCE.md`

Decision-log entries: `D-S9-CONDITION-1-AGENTID-PARENT-SESSION-PASSES-2026-09-08` and
`D-MENTOR-RULING-S9-FOUR-QUESTIONS-ADOPTED-2026-09-08`.

---

## What was found

- **Control + closing control (top-level, quiet):** no `agent_id`, no `agent_type` — keys absent, not
  empty. Reproduces S8 in a second session.
- **Configuration 1 (nested delegation):** the intermediate agent carries its **OWN** `agent_id`,
  never its parent's and never none. **Consistent, not a falsification** — an intermediate is a
  "parent" relative to its child but is not a top-level session, which is the ruling's own criterion.
- **Configurations 2+3 (background/concurrent — the case the ruling's reasoning turns on):** a
  top-level capture taken while two agents were **provably in flight** carries no `agent_id`.
  In-flight status corroborated three independent ways. The window contains, in sequence:
  agent → agent → **top-level (no `agent_id`)** → agent. That is the structure that falsified Option B;
  the discriminator held through it.
- **Configuration 4 (worktree-isolated, untested at S8):** `agent_id` present normally; only `cwd`
  differs, extending S8's finding.
- **Configuration 5 (different entrypoint): NOT attempted** — no `claude` CLI on this machine.
  **Ruled to belong to Condition 3, so this is no longer a Condition-1 gap.**
- **The `CLAUDE_CODE_CHILD_SESSION` question the ruling named as the first thing to examine is
  answered:** it reads `1` in the top-level session's own tool environment while that session's H3
  captures carry no `agent_id`. Reconfirmed in a second, fresh session.

**Method note worth carrying forward:** a **sentinel-content-provenance** method (a unique string in
every action's own `tool_input`, accepted as evidence only if the sentinel matches) made the
single-slot dump usable under genuine concurrent activity **without editing any `GUARD_RE`-matched
file**. Route (b) — per-invocation dump filenames — was not needed and not taken. The method caught
two real race overwrites in flight. A second, unplanned corroboration proved stronger: each spawned
agent's `agentId` as reported by the Agent tool **exactly matched** the `agent_id` on the wire.

**A source-level check S8 did not do:** `maybeDebugDump(cfg, raw)` is called on `raw = readStdin()`
**before** `JSON.parse`, and nothing anywhere writes `event.agent_id`. The captured field is Claude
Code's own wire, not a hook-synthesized value.

---

## Two genuine defects found in-session, both corrected, neither smoothed over

1. **`GATE1_DEBUG` revert-lag reproduced AND sharpened into an asymmetry.** Addition took effect
   within one tool call; **removal had not taken effect at all by close** — sentinel-proven, not
   inferred from timestamps. Config file is byte-identical to its pre-session backup (SHA verified);
   the **runtime effect is not.**
2. **The closing window-health figures were stale by one buffer record at write time** — found by
   PR19's independent re-derivation, not by the author. Guard 129→**130**, 2026-09-07 guard 53→**54**,
   "98 of 129" contrary → **98 of 130** (plus a previously-unnamed `null` third bucket of 2), and this
   session's own contribution 1→**2** records (an ad-hoc `>=17:20` time filter had excluded an earlier
   record from the same session). **Corrected by appended addendum, not in-place edit.**

**Standing lesson:** when reading a buffer that the running session is itself appending to, re-derive
aggregate tallies **at close**, immediately before writing them — and attribute records by the
buffer's own `session` field, never by an ad-hoc time filter.

---

## Window + baseline health at close (re-derived at close, not from an early snapshot)

- `GATE1_STATE_DIR` unchanged (`/Users/clintonaitkenhead/.sage-gate1`); buffer not fragmented.
- Buffer **289** records. 138 `v1` (never mixed in), record 139 the took-effect probe (**excluded**),
  window = 140→289 = **150** records.
- **Baseline days: 2** (2026-09-06, 2026-09-07 UTC). **This session added none** — same UTC day.

| UTC day | consult | guard | consult tool distribution |
|---|---|---|---|
| 2026-09-06 | 3 | 76 | Edit ×3 |
| 2026-09-07 | 17 | 54 | Edit ×12, Write ×5 |

- **Ruled composition disclosure:** all **20** consult records in the window are documentation
  authoring — 15 → `operations/`, 3 → `.claude/projects` memory, 2 with no path in preview.
  **Zero `website/src` engineering actions in the entire window.** (PR19 verified exhaustively, every
  record, not sampled.)
- Guard population reported separately, as ruled: **130** records; `isKathekon` = **98 false / 30 true
  / 2 null**.
- **Corroboration exact, both families, both days.** Anchor `2026-09-06T09:44:55.265Z` (buffer stamps
  the same event `…267Z`). Exact whole-token split: `CONSULT` = 20 (buffer 20 ✓), `CONSULT-OUTAGE` = 3
  correctly excluded; `GUARD-*` = four tokens totalling **130** (buffer 130 ✓).
- Both SHA pins **GREEN** at open and at close: `layer2-mechanisms.ts` `60cefedb…`,
  `stoic-brain.ts` `fa8895ec…`.
- Guard: **no evidence of a trip; tree verified clean** of guarded files.
- **This session contributed 2 records, both `guard`/`v5`/`Bash`, zero consult.**

**Instrument-composition finding (now a ruled pre-flip disclosure obligation):** this session authored
a 200+ line governance document and produced **zero consult records**, because it authors via Bash
heredocs and `Bash` is dropped from the consult floor. S8's 12 consult records came from `Write`/`Edit`
doing the same class of work. Per the ruling, the pre-flip report must state this as a **structural
dependency**: the measured population *"is not a random sample of all actions the agent takes — it is a
sample of actions taken with Write/Edit/MultiEdit/NotebookEdit tools."*

---

## PR19

Three dimensions, sonnet/low per founder authorization.
- **Dimension 1 (substantive claim):** the reviewer **disclosed it had not read the source files**
  before answering. Its structural questions were followed up **first-hand against source** rather
  than accepted as findings; one is closed with direct evidence (the `maybeDebugDump` check above).
- **Dimension 2 (arithmetic):** found the stale-figures defect. Real, confirmed independently by the
  author, corrected.
- **Dimension 3 (scope/safety): CLEAN** — no guarded file touched, both SHA pins held, `classifyCaller`
  byte-unchanged, nothing committed or pushed, peer's `environmental-context.json` untouched and
  unstaged, no stray worktree, no credential leaked, buffer append-only and intact.

---

## Mentor ruling adopted the same session

`2026-09-08-mentor-ruling-S9-four-questions-verbatim.md` (**canonical — wins over this close**).
All four recommendations upheld; two changed materially:

- **Condition 2 is NOT discharged by this capture.** Next capture must be a genuinely different
  **calendar day**, different **session ID**, **same client 2.1.260**. The day boundary is *"literal,
  not approximate."*
- **Condition 1 complete without Configuration 5** — entrypoint work belongs to Condition 3.
- **NEW BINDING OBLIGATION:** before **any** future `GATE1_DEBUG` session, **both** (i)
  `rm ~/.sage-gate1/*-stdin.json` and (ii) a **fresh-session control probe confirming no dumps
  appear**. Neither optional. **Neither was performed by this session.**
- **Instrument-composition finding** stays a disclosed caveat but is **enlarged** to a named
  structural dependency in the pre-flip report.

---

## State at close

**Condition 1 COMPLETE and closed. Conditions 2 and 3 OUTSTANDING.** Condition 2 now carries a
mandatory two-step pre-check and an explicit different-day / different-session / same-client spec.

**NO BUILD IS LICENSED.** `classifyCaller` byte-unchanged. The window keeps running; the guard is
armed and green; `layer2-mechanisms.ts` and `stoic-brain.ts` byte-unchanged. Nothing committed,
nothing pushed; HEAD still `546e590`.

**The S11 flip remains REFUSED; weights remain BLOCKED; the 0h call remains the founder's.**

## Owed to the founder

1. `rm ~/.sage-gate1/*-stdin.json` — **not done by this session** (scoped to the founder).
2. The commit of this session's four record files (the founder commits by name; **never pushed by AI**).
3. Condition 2's capture session, on a different calendar day — prompt:
   `2026-09-08-condition-2-second-capture-NEXT-SESSION-PROMPT.md`.
