# S10 WORKING NOTES — SESSION IN PROGRESS, PAUSED. **NOT A CLOSE. NOT A RESULT.**

**⚠ THIS IS NOT A SESSION RECORD.** There is deliberately **no decision-log entry, no register row, no
close file, and no `D-` code** for S10 — the founder ruled that the session has **not begun in earnest**
and must not be declared complete. Do not cite this file as a finding. Do not treat S10 as closed.

**Why paused:** Condition 2 requires a *"genuinely different calendar day"* (S9 ruling, literal, not
approximate). This session opened **2026-09-08 04:24 AEST = 2026-09-07 18:24 UTC** — the same day as S9
under **both** conventions, ~10 minutes after S9 closed. The capture was **not attempted**.

**Resume on 2026-09-09 local or later** — unambiguous under both conventions. 11:00 AEST on 2026-09-08
would be a new UTC day but the same *local* day, reopening the ambiguity the ruling closed.
The prompt `2026-09-08-condition-2-second-capture-NEXT-SESSION-PROMPT.md` is **UNSPENT but AMENDED**
(2026-09-08, by this session, at the founder's direction): a **STEP 0 date gate** was added that
STOPS the session outright if the day does not qualify — explicitly forbidding the substitute work
this session did — and the **client-version instruction was corrected** (see item 3). **Read the
amended prompt; it now carries these findings, so this file is a supplement, not a prerequisite.**

---

## Perishable evidence — recorded because it cannot be re-derived later

**1. The mandatory pre-check PASSED in this session (2026-09-07 UTC).** No `*-stdin.json` existed at
open; sentinel `S10-PRECHECK-SENTINEL-7f3a91c4-inertness-probe` produced no dump;
`PreToolUse-stdin.json` absent (read with the Read tool, never Bash). **Positive control:** `gate1.log`
shows this session (`19075425-c4a9-84…`) emitting `AT-ACTION-SKIP-BASH` for every Bash call
18:24:43Z→18:26:33Z, so H3 ran and wrote nothing. Source-verified: `maybeDebugDump(cfg, raw)` is at
`at-action-hook.mjs:371` with **no early return before it**, ahead of the `AT-ACTION-SKIP-BASH` branch
(425–437) — so that log line is only reachable *after* `maybeDebugDump` ran. **The S9 `GATE1_DEBUG`
residual has cleared.**
**⚠ This does NOT discharge the pre-check for the resumed session — the ruling requires it run there.**

**2. Two candidate carriers of the revert-lag are ELIMINATED. This is the perishable part.**
- **App-process restart — RULED OUT.** `/Applications/Claude.app` PID **1205**, started
  **Sat Sep 5 22:09:31 2026**, elapsed **2d 06:34:45** as measured 2026-09-08 04:44 AEST — spanning
  S8, S9 and S10 continuously. **If the app restarts before the resumed session, this can never be
  re-derived.**
- **Pure elapsed-time TTL — RULED OUT BY CONTRADICTION.** S8 (memory `claude-code-desktop-app-hook-env`,
  primary source): removal `19:06`, dumps still written `20:52` ⇒ TTL **≥ 1h45m**. S10: removal
  ~18:15 UTC, inert by 18:24 UTC ⇒ **≤ ~9 min**. Robust to uncertainty in S9's exact removal time.
- **Session boundary SURVIVES** as the one differing variable (S8's lag crossed two turn boundaries and
  a model switch *within* a session and persisted; S10 crossed a *session* boundary and cleared).
- **The CARRIER is NOT identified and is not claimed.** A per-session env snapshot and a session-keyed
  hook-runner pool fit equally; `~/.claude/session-env/<id>/` is empty in every case inspected.
  Whether this satisfies the ruling's *"must be understood before it is used again"* is the
  **mentor's** call.

**3. Client version — CORRECTED. Two different numbers were being conflated; no founder UI reading is
needed.**
- **Claude Code ("client") = `2.1.260`** — the version Condition 2 requires and Condition 3 pins.
- **Claude Desktop app = `1.46388.4`** (`/Applications/Claude.app/Contents/Info.plist`, read
  2026-09-08). **This is NOT the number the ruling refers to.** Do not confuse them.
- **S8 and S9 never read `2.1.260` from a UI.** The S9 evidence file heads its capture table
  *"Client 2.1.260, entrypoint `claude-desktop`"* — `version` and `entrypoint` are fields on the
  **Claude Code hook stdin payload**, alongside `session_id`/`transcript_path`. They read it out of the
  `GATE1_DEBUG` dump itself.
- **Consequence: the resumed session verifies the client version FROM ITS OWN CAPTURE** — the same wire
  the finding rests on, which is stronger than a founder-reported figure. The apparent circularity
  (unreadable before `GATE1_DEBUG` is on) does not bite: take the capture, read `version` from the
  dump, and **if it is not `2.1.260`, discard the capture and STOP** — exactly what the commissioning
  prompt already directs.
- **Residual, stated honestly:** the dumps were deleted, so the field's presence is inferred from how
  S9 reported it, not observed here. **Confirm it in the first second of the next capture.**
- **Bearing on Condition 3** (version pinning with fallback to `unknown`): if `version` rides the
  payload, the harness can read it **at runtime** rather than carrying a hard-coded constant — a
  materially better shape for that build. Not a build instruction; an input to one.
- **An earlier draft of this file said the founder must read the version from the desktop app UI. That
  was wrong on both counts and is superseded by this item.**

**4. CLAUDE.md currently carries a claim that is FALSE but is deliberately left uncorrected.** Its S9
production-state block says the loop is *"still dumping every `PreToolUse` hook's raw stdin to disk"*
and that a manual `rm` is owed. Both are now false (item 1). **Not annotated, because the correction
belongs in the resumed session's own complete record rather than in a half-finished one.**

**5. Window health as observed 2026-09-07 UTC (re-derive; do not quote).** Buffer 297; window
population 158 (guard 138, consult 20) with the 138 pre-window `v1` and the took-effect probe excluded;
**baseline 2 of 5 — and it CANNOT move until a new calendar day begins, the same clock that gates the
capture.** This session contributed guard 4 / **consult 0** — it authored via Bash heredocs, which adds
**nothing** to the consult denominator (the ruled tool-mode dependency, confirming itself).

---

## State

**Nothing committed. Nothing pushed. HEAD `ff6b51d`. `classifyCaller` byte-unchanged. No flag set or
unset. No `GATE1_DEBUG` act performed. Both SHA pins green** (`layer2-mechanisms.ts` `60cefedb…`,
`stoic-brain.ts` `fa8895ec…`). Window running; byte-identity guard armed. The only other modified file
is the peer's `website/src/data/environmental-context.json`, untouched.

**The prior draft artifacts of this session (a close, a decision-log entry, a register row, a CLAUDE.md
annotation and a long evidence file) were written prematurely and have been REMOVED at the founder's
direction.** Backups: `scratchpad/s10-artifacts-backup/`. **Condition 2 is UNREACHED. Condition 3
outstanding. The S11 flip remains REFUSED; weights BLOCKED; the 0h call remains the founder's.**
