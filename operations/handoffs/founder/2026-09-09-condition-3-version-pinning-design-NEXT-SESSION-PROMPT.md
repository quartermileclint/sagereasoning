# NEXT SESSION — Condition 3: design the client-version pin + fallback (do not build)

**Owed by the 2026-09-07 five-question ruling
(`2026-09-07-mentor-ruling-S8-five-questions-verbatim.md`), the THIRD and final of three binding
conditions before `classifyCaller` may be modified. Conditions 1 and 2 are now CLOSED — see §1.**

**Authored 2026-09-09 ~20:52 AEST (`date`) = 2026-09-09 ~10:52 UTC.** Date your own artifacts from
`date`, never the context date — this arc's context date has run ahead of the machine clock repeatedly.

**EVERY NUMBER IN THIS FILE IS A CLAIM TO RE-DERIVE, NOT A FACT TO QUOTE.**

---

## Read this first

There is **no date gate** for this session — unlike Condition 2, Condition 3 is not tied to a
calendar day. There is **no capture required** either, unless you find one is genuinely needed (see
§3). **The mandatory `GATE1_DEBUG` two-step pre-check still runs before ANY `GATE1_DEBUG` act, if you
end up needing one** (S9's standing requirement — elevated, not optional; see the prior session's
evidence file §1 for the exact two steps).

**Run `date` and `date -u` anyway, at open, for the record** — this project's own house rule.

---

## 1. What is already established — do NOT re-derive, do NOT re-litigate

**Condition 1 is CLOSED.** `2026-09-08-condition-1-agentid-parent-session-CAPTURE-EVIDENCE.md`
(S9): a top-level session's H3 `PreToolUse` stdin never carries `agent_id`, across every
configuration tested including concurrent background agents; `CLAUDE_CODE_CHILD_SESSION=1` being set
does not imply `agent_id` presence. Ruled complete without Configuration 5 (a second entrypoint) —
that work was reassigned to Condition 3 (S9 ruling, point 2).

**Condition 2 is CLOSED.** `2026-09-09-condition-2-reproduction-CAPTURE-EVIDENCE.md` (this session's
immediate predecessor): the finding reproduces on 2026-09-09, a genuinely different calendar day
(both AEST and UTC) from 2026-09-07/08, on a different session, same client `2.1.260`. PR19-reviewed
CLEAN.

**Condition 3's own text is not an investigation to run — it is a design constraint on the build
itself.** Verbatim (`2026-09-07-mentor-ruling-S8-five-questions-verbatim.md`):

> *"Condition 3 — Client version pinning in the disclosure. The Option D ruling's amended segment-1
> clause must note the client version (2.1.260) at which `agent_id` was first observed. If the
> mechanism is built and the client updates, the harness must detect the field's absence and fall
> back to `unknown` rather than silently misclassifying. This is not a build instruction — it is a
> condition on what the build must include when it lands."*

The S9 ruling adds: a second client entrypoint was explicitly assigned here, NOT to Condition 1 —
*"Condition 3 is explicitly about client-version pinning and version stability."*

**Two inputs from the Condition-2 session, carried forward, not yet acted on:**
- `version`/`entrypoint` are **absent from the H3/H4 hook `PreToolUse`/`PostToolUse` payload itself**
  — confirmed by direct key-list inspection of two live captures. They are observable only via
  `transcript_path` (which IS on the payload) — reading a live version at runtime would mean the hook
  opens and parses the transcript file, a materially heavier design than "a field already in hand."
  This changes what a runtime version-read implementation looks like; it does not remove the
  requirement.
- No `claude` CLI exists on this machine, so a second entrypoint (Configuration 5) has never been
  live-tested. This remains a genuine, disclosed gap.

---

## 2. The question, and only this question

> **What must the `classifyCaller`/Option C′ build actually carry to satisfy Condition 3 — and is the
> three-condition gate now fully discharged such that the build may be licensed?**

This session's job is to **design** the answer, not implement it. Two deliverables:

**(a) A written design** for the version-pin-with-fallback, addressing at minimum:
- How is `2.1.260` recorded/checked — a hard-coded constant compared against a runtime-read value, or
  something else? If a runtime read, where does it come from given `version` is not on the hook
  payload directly (see §1)? State the actual mechanism, not a placeholder.
- What happens on version mismatch or field absence: the ruling requires a fallback to `unknown`, not
  a crash, not a silent default to either `agent_id`-present or `agent_id`-absent behaviour. Spell out
  the exact conditional.
- Does the design need Configuration 5 (a second entrypoint) actually tested before it can be trusted,
  or can the fallback-to-`unknown` behaviour make that gap safe-by-construction (i.e., an unknown
  entrypoint's version field being absent or unrecognised triggers the same safe fallback as any other
  absence)? Argue this explicitly — don't assume it.
- What does the amended segment-1 disclosure clause need to say once the build lands, per the ruling's
  own requirement that the disclosure "note the client version… at which `agent_id` was first
  observed"?

**(b) A relay to the mentor** (or, if the founder elects, directly to the founder) asking explicitly:
*given Conditions 1 and 2 are closed and this design satisfies Condition 3's stated requirement, is
the three-condition gate discharged and is a build now licensed?* Every prior session in this arc has
treated "conditions met" as requiring an explicit confirming ruling before code changes — do not
assume the gate opens itself. Follow that precedent here: **do not build `classifyCaller`, `false-hold-observation-report.ts`, or any `GUARD_RE`-matched file in this session, licensed or not, without an
explicit founder go-ahead for THIS build in THIS session.**

**If, and only if, designing (a) genuinely requires a live capture** (e.g. to confirm exactly which
fields the harness would have available at the point a version check would run), follow the
established method from Conditions 1 and 2: sentinel-content provenance, the mandatory two-step
`GATE1_DEBUG` pre-check, founder election before any config edit, SHA-verified revert. Do not take
this as license to re-run Condition 1 or 2's configurations — this would be a NEW capture for a NEW,
narrow question about the design, not a repeat of either closed condition.

---

## 3. A carried item this session should also address — found, not yet fixed

**CLAUDE.md carries a claim that has been false since 2026-09-09's session (S11/Condition 2) and was
already known false at S10's pause.** The S9 production-state block in CLAUDE.md (dated 2026-09-08)
says the founder's harness loop is *"still dumping every `PreToolUse` hook's raw stdin to disk"* and
names a manual `rm` as owed. **That was true when S9 wrote it and became false the moment the S10
session's pre-check found the residual had cleared** (`2026-09-08-S10-WORKING-NOTES-session-paused-NOT-CLOSED.md`, item 4, which explicitly deferred the correction to "the resumed session's own complete
record" — and the S11/Condition-2 session that resumed did not make it either, an oversight worth
naming plainly rather than quietly repeating).

**Note that this is now doubly stale, not simply stale-then-corrected:** the S11/Condition-2 session
(2026-09-09) both confirmed the variable was inert at its own open AND found it live again after an
in-session revert — so the true current state is neither S9's claim nor a simple "it's fine now." If
you touch CLAUDE.md this session, state the CURRENT true state precisely (an inert-at-session-open,
live-again-after-in-session-revert residual, per the Condition 2 evidence file §5), not a stale
restatement of either prior claim. If you do not have capacity to do this correctly this session, name
it as still carried rather than silently dropping it a second time.

---

## Constraints that bind (unchanged from the Condition 2 prompt, restated because they are load-bearing)

- **The observation window is RUNNING and the byte-identity guard is ARMED.** `GUARD_RE` matches
  `api/reason | api/guardrail | guardrail-sandwich | sage-reason-engine | reasoning-receipt |
  translation-sandwich | /substrate/ | trust-core | kathekon-engagement | false-hold |
  harness/gate1 | layer1-extractor | layer2-mechanisms | sage-reflect | stoic-brain`, including
  untracked files. Check any new artifact's path against it before writing. **Re-derive, do not
  quote**, the SHA-256 pins for `layer2-mechanisms.ts` and `stoic-brain.ts` at open; if either is red,
  STOP and report.
- **This is a design session. `classifyCaller.ts` must remain byte-unchanged unless the founder
  explicitly licenses a build in this specific session, after this specific design is put to them.**
- **Never `git checkout`/`restore`/`reset`** on live-edited work.
- **Never `git add -A`** — check `git status` for peer files (e.g. `website/src/data/environmental-context.json`) not yours to stage.
- **The founder pushes; never push.** Do not touch production, schema, flags, or credentials without
  an explicit founder election for this session.

---

## Always do — window + baseline health, read-only, owed every session

Re-derive and report (do not quote figures from any prior session's record):
- Baseline days (UTC days with ≥1 consult record) — at the 2026-09-09/Condition-2 close: 4 distinct
  UTC days found in the buffer, all four with ≥1 consult, an unreconciled discrepancy against an
  earlier-carried "2 of 5." Re-derive and see whether this session's own additions clarify it — do not
  assume either figure.
- Per-UTC-day break-out with tool distribution (the ruled baseline-composition disclosure).
- The instrument-composition / tool-mode dependency, and this session's own honest contribution to it
  (if you author via Bash heredocs, you will very likely contribute zero records — say so plainly if
  true, as the last two sessions have).
- Corroboration against `gate1.log`: anchor on the log line, but **check the anchor's own buffer
  partner first** — the Condition 2 session found the naive anchor double-counted the took-effect
  probe's own line; verify by 1:1 pairing before trusting either family's count.
- `GATE1_STATE_DIR` unchanged; guard status stated precisely ("no evidence of a trip; tree verified
  clean," not "the guard has not tripped").
- Loop counts from `~/.sage-gate1/<session>.loop.json`.

---

## Do NOT

Build or modify `classifyCaller` without an explicit in-session founder go-ahead following this
design. Re-run Condition 1 or Condition 2's configurations. Chase `CLAUDE_CODE_CHILD_SESSION` again
(closed, twice). Edit `layer2-mechanisms.ts` or any guarded file without a recorded founder waiver.
Open S11-D2. Revive spawn-depth. Touch production, schema, or credentials. Refresh the buffer. Quote a
perimeter count. Assume the UTC day or version from the local clock or a prior session's prose. Push.

---

## Records owed at close

A decision-log entry at the physical tail (append, never rewrite). The S11 register's row appended
(never edited in place — see the S8 in-place-edit deviation this arc has twice now deliberately
avoided repeating). A close document. **PR19 applies** — independent review, same three-dimension
shape as Conditions 1 and 2 (substantive claim, arithmetic/internal-consistency, scope/safety), with
a fourth check specific to this session: **did it build anything without an explicit in-session
founder go-ahead?** That must be verifiable from `git diff --stat` against `classifyCaller.ts` and
every `GUARD_RE`-matched path, not merely asserted.

---

## Forecast

Success = a concrete, actionable design for the version-pin-with-fallback that a future session could
implement without re-deriving anything, an explicit relay to the mentor (or founder) asking whether
the three-condition gate is now discharged, and an honest re-derived window-health report — with, if
capacity allows, the carried CLAUDE.md correction from §3 made precisely rather than restated stale.

**Acceptable alternative outcome, honest and complete:** the design surfaces a genuine open question
(e.g. Configuration 5's absence turns out to be load-bearing after all, or the "read version from
`transcript_path`" mechanism turns out to have its own failure modes worth a mentor ruling before
design can complete) — report it plainly and stop there. **Nothing is licensed to be built by this
session or by a passing design. The S11 flip remains REFUSED; weights remain BLOCKED; the 0h call
remains the founder's.**
