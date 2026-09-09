# CLOSE — Condition 2: second live capture, S11

**Session opened under** `2026-09-08-condition-2-second-capture-NEXT-SESSION-PROMPT.md`.
**Result: CONDITION 2 PASSES.** `classifyCaller` byte-unchanged; nothing built, committed prior to
this close, or pushed.

## What ran

1. **STEP 0 date gate** — `date`/`date -u` both read 2026-09-09, distinct from 2026-09-07/08 under
   both conventions. PASSED; proceeded.
2. **Mandatory two-step `GATE1_DEBUG` pre-check** (S9-elevated standing requirement) — no stale dump
   at open; a fresh sentinel control probe produced none. Variable confirmed genuinely inert at
   session open. PASSED; capture licensed.
3. **Founder election** (`AskUserQuestion`): *"AI adds it, sequential capture (S9's shape)."*
   `.claude/settings.local.json` backed up + whole-file and per-key SHA-verified before/after; all 11
   pre-existing `env` values byte-identical; one key added.
4. **Two sentinel-verified H3 (`tool_name:"Bash"`) captures** — top-level control: `agent_id`/
   `agent_type` absent. Agent-issued (Explore subagent): both present, corroborated independently by
   the parent's own `PostToolUse` report of the spawn (`agentId` match). **The S9 finding
   reproduces.**
5. **Client-version condition satisfied**, but by a corrected route: `version`/`entrypoint` are
   **not** on the H3/H4 hook payload (both captures' full key lists confirm it) — verified instead
   from the session's own transcript (2.1.260, single-valued throughout). Flagged as a genuine input
   to Condition 3, not a licence to build it.
6. **`GATE1_DEBUG` reverted** — SHA-verified byte-identical to backup, key absent by grep. **The
   revert-lag reproduced** (a post-revert sentinel probe still produced a dump) — bounded, not
   resolved: this session's own pre-check showed the variable inert at a *fresh session's* open,
   while the *within-session* revert did not take effect, narrowing (not proving) the mechanism to
   "does not survive a session boundary."
7. **Window health re-derived**, including a genuine method fix found and corrected in-session (the
   log-anchor instruction initially over-counted by one event — the took-effect probe's own log
   line — corrected by 1:1 pairing every window `GUARD-*` log line to its buffer record). At the
   corrected anchor, log and buffer agree exactly (`GUARD-*` 203=203, `CONSULT` 27=27). This session
   contributed **zero** records to the window (Bash-heredoc authorship throughout, confirmed via
   `gate1.log`'s `AT-ACTION-SKIP-BASH` entries).
8. **PR19** (dropped to sonnet/low for the review, per standing founder permission; restored to
   opus/medium after) — **CLEAN**. One item explicitly flagged as not independently re-verifiable
   by a fresh reviewer session (the env before/after per-key SHA comparison) rather than accepted or
   rejected silently.
9. **Closing self-reflection** (Sage Reflect stop hook) — addressed directly, on request: the
   at-action guard's caution on the evidence-file write was initially read as a sparse-extraction
   default and given quick assent on the grounds the content was already fully verified; on review,
   that conflates content-correctness with action-reversibility — the guard was correctly flagging a
   genuinely irreversible write (a new artifact entering a binding evidence chain), independent of
   how well-checked its content was. No action taken differently; the observation is recorded for
   future sessions' own closing reviews.

## Records produced

- `operations/trust-layer-2026-07/2026-09-09-condition-2-reproduction-CAPTURE-EVIDENCE.md` — full
  evidence, including the PR19 addendum.
- `operations/decision-log.md` — `D-S11-CONDITION-2-REPRODUCTION-PASSES-2026-09-09`, appended at the
  physical tail.
- `operations/trust-layer-2026-07/S11-FLIP-PREREQUISITES-REGISTER.md` — row appended (append-only;
  no in-place edits, unlike S8's disclosed deviation).
- This close document.

## Verified at close

- SHA pins re-derived and green: `layer2-mechanisms.ts` `60cefedb…`, `stoic-brain.ts` `fa8895ec…`.
- `GATE1_DEBUG` absent from `.claude/settings.local.json` (grep count 0) — file-level revert holds;
  runtime-level lag is disclosed above and in the evidence file, not hidden.
- No `GUARD_RE`-matched file touched. No production, schema, flag (other than the elected
  `GATE1_DEBUG`), or credential change. Nothing committed by this session prior to this close;
  nothing pushed (the founder pushes).

## Carried forward, unchanged

- **Condition 3 (client-version pinning with fallback) remains OUTSTANDING** — sharpened by the
  version-location correction (§4 of the evidence file), not discharged by it.
- The three named pre-flip disclosure reports (baseline composition, loop-count-by-action-class,
  tool-mode composition per day) remain unbuilt — gated on a founder waiver since
  `false-hold-observation-report.ts` matches `GUARD_RE`.
- **Post-session housekeeping owed to the founder:** `rm ~/.sage-gate1/*-stdin.json` after this
  session fully ends, given the confirmed within-session revert-lag — standard hygiene, not urgent.
- The window ran throughout, untouched by anything but the licensed captures. The S11 flip remains
  REFUSED; weights remain BLOCKED; the 0h call remains the founder's.
