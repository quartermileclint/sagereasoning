# S7 CLOSE — mentor rulings 2 and 3 executed under a recorded founder waiver

**Session S7. Written 2026-09-07 ~18:15 AEST (`date`) = 2026-09-07 ~08:15 UTC (`date -u`).**
**Model: opened `claude-opus-5`, switched to `claude-sonnet-5` mid-session by the founder.**
**Tier `code-elevated` + a recorded founder waiver. ONE commit, `97320a0`, NOT pushed.**

**NO production, schema, flag, credential or migration change. No push. The observation window ran
throughout. AC7 not engaged.** One deliberate exception, disclosed: **the founder's live harness
changed** — ruling 3 edits `at-action-hook.mjs` and `false-hold-capture.mjs`, the loop hot-reloaded
mid-session, and v5 records were observed being written. That was expected (paste §8) and is stated
plainly rather than inferred.

---

## What was asked, and what was done

Both owed rulings **EXECUTED**. The founder elected the waiver shape (a) and "land it now"; the
mentor's new question was drafted, relayed, and **ruled the same day**, and that third ruling is
executed in the same commit.

Adversarial reviews ran on **sonnet / effort low** under the founder's explicit permission.

---

## Four corrections to the session paste, each verified rather than assumed

1. **The five S6b commits were already pushed.** `origin/main` moved 16:19:04 +1000, four minutes
   before this session opened. The paste's §2.5 went stale minutes before it was read.
2. **The guarded set is SIX files, not two.** PR19 requires tests, and every test file for this work
   also matches `GUARD_RE` — plus `at-action-hook.mjs`, which the wiring requires. (I first told the
   founder five; corrected to six once the battery named them.)
3. **`--no-verify` waives ALL SIX pre-commit checks, not only the guard.** The paste calls shape (a)
   "cheapest"; it is cheapest in machinery, not in coverage. Mitigated by running all six by hand and
   recording their results in the commit message.
4. **The founder's Decision-1 precondition is DISCHARGED.** `npx` is at `/usr/local/bin`, first in
   `/etc/paths`, and `launchctl getenv PATH` is unset — GitHub Desktop will find it, so the mentor's
   fail-closed change carries no risk of blocking commits. (Inferred from PATH construction, not
   directly observed in that app's environment.)

---

## Ruling 2 — GUARD-OUTAGE records leave the rate denominator

**Not already satisfied, and the defect was worse than a denominator error.** The exclusion existed in
Part 3b but not Part 3 — the rate part (3) of the readiness standard actually names. A strict-mode
guard outage carries `denied:true` ⇒ `guardHold:true` ⇒ classified a HOLD with no engaged arm ⇒ a
manufactured **FALSE POSITIVE**. A single such record could flip the readiness verdict. Reproduced on a
synthetic buffer before fixing, not reasoned about.

**The symmetry premise was verified two independent ways.** A consult outage returns at
`at-action-hook.mjs:704`, *before* the capture at `:747`, so the consult side is outage-free **by
construction** — then observed live: a genuine `CONSULT-OUTAGE` fired on this session's own `Write` and
the consult count did not move. Consequence disclosed on the rate rather than papered over: the
consult-side outage count lives only in `gate1.log`, which this report does not read, so it is stated
as not-reported rather than estimated.

**Four docstrings** claimed these records were "excluded from the rate" (false until now); three added
"never a hold either way" (false at **both** times). All corrected; the second claim deleted, not
re-dated.

---

## Ruling 3 — `caller_class` at a dated v4→v5 boundary

Session id cannot discriminate — re-established here under **controlled conditions**: of 15 records
under this session's id, 11 were its own review fleet.

`classifyCaller` reads `transcript_path`, whose shape is live-verified (a subagent's transcript lives
at `<parent-session>/subagents/agent-*.jsonl`, confirmed 2026-06-21). **TWO values only** —
`'subagent'` on a positive structural observation, `'unknown'` for everything else **including a
session-shaped path**. No `'live_agent'` value, because a session-shaped path cannot distinguish "the
live agent acted" from "the wire hands a subagent the parent's path".

Top-level (nesting in `signals` would re-hash the frozen 138-record buffer); **not** in `recordHash`,
so no existing hash moves; **not** ingested — the DB ingest maps an explicit column list and already
omits every post-v2 field, so **no migration is involved** (verified at source before building).

---

## The mentor's third ruling, same day — executed in the same commit

The `caller_class` schema-boundary question was drafted, relayed, and **RULED**: *"Post-boundary only
is ruled"*, with a **three-segment** guard disclosure — post-boundary (review-fleet excluded and
counted), pre-boundary (size stated, composition declared unknown, **no rate computed**, reason stated
explicitly), outage (excluded from both). **A retroactive classification pass is NOT owed** and was not
performed. Verbatim: `2026-09-07-mentor-ruling-caller-class-schema-boundary-verbatim.md`.

The founder elected **Option A** (fleets continue as structured) after this session verified **Option B
is not achievable with subagent fleets** — all 12 fleet records carried the parent session id, and the
hook has no session-id override.

---

## ⚠ THE MEASURED FINDING — the signal does not discriminate

**Pre-committed to reporting this outcome before the data came in, and it came in negative.**

This diff's own PR19 fleets produced **19 post-boundary v5 records** while under review, including at
least one unambiguously fleet-generated command this session never ran
(`git diff -- harness/ website/scripts/ > /tmp/fh_diff_full.txt`). **Every one reads `'unknown'`.**

So: on this machine, under this harness, **as currently wired, the transcript-path signal does NOT
discriminate a subagent caller from a parent one.** The E2E test proves the *wiring* is sound under a
synthetic subagent-shaped path; the live measurement proves the *real wire* never supplies that shape.
Both are true and both are now in the code's own disclosure, upgraded from a stated premise to a
measured finding.

**This does not invalidate the design — it is the reason for it.** Had `'live_agent'` existed as a
value (as this session's own first draft had it), the field would now read **100% `live_agent`** and be
read as *"no contamination found"* when it means *"no signal was ever available"*. Because it reads
`'unknown'`, the exclusion is an honest **lower bound of zero**.

**⚠ A HARNESS-LEVEL QUESTION IS NOW OPEN, named not resolved:** the mentor's segment-1 clause assumes
*"live-agent and review-fleet records distinguished at source"*. On this evidence that is not currently
achievable. Whether another field can do it — the SDK-callback `SubagentStartHookInput` shape is a
documented candidate, **a different hook layer** from the command-hook `PreToolUse` this file reads —
is for the founder/mentor.

---

## PR19 — six blind dimensions, 14 agents, 0 errors. 8 of 9 upheld, **0 refuted**

**Two HIGH, one root.** Ruling 3's population exclusion existed ONLY as a Part-3b disclosure string —
Part 3's own headline denominator/numerator and the READINESS SUMMARY counted a subagent record **while
the report simultaneously printed that it had been excluded**. Fixed: `rated` now excludes
`callerClass:'subagent'`; the three segments derive from the derivable subset only, so they partition
the guard population with no overlap (a post-boundary outage had been double-counted into Segments 1
*and* 3). **One MEDIUM:** an E2E test now drives the REAL hook with a genuine `/subagents/`-shaped
path. **Two LOW:** a stale segment-2 count, and an explicit sum-to-n partition assertion.

**Ten mutations verified red across the session.** One initially read as a *passing* (vacuous) pin and
was a **false negative — the mutation had never applied**, due to shell escaping; re-applied properly
it turned the battery red. **Standing method: a mutation test that passes may mean the mutation didn't
land — assert the file actually changed.**

---

## ⚠ INCIDENT — a destructive git command on unbacked-up work

During mutation verification, a restore-check fallback ran **`git checkout --` on
`at-action-hook.mjs`**, which had no backup at that point, wiping this session's three-edit wiring
change back to HEAD. Caught within the same command block (`git diff` empty, `classifyCaller` absent);
reconstructed from the exact diffs verified minutes earlier; checked — not merely assumed — by an exact
`+8/-2` diff-stat match and every battery re-passing.

**The lapse was mine and it was structural in the sense that mattered:** this session's own standing
rule (back up before any truncating write) was applied to five files and skipped for exactly the one
that needed it, and a shell *fallback* was allowed to run a destructive git command instead of stopping
to diagnose. All subsequent restores are **SHA-checked**, not assumed.

---

## Window + baseline health — read-only, re-derived, cutoff `2026-09-07T08:12Z`

| | |
|---|---|
| Corroboration | **AGREE** — guard log **116 = 116** buffer; consult **3 = 3**. Family DERIVED (four tokens), never quoted. |
| 2026-09-06 UTC | guard 77 · consult 3 |
| 2026-09-07 UTC | guard 39 · consult **0** |
| **BASELINE** | **1 of 5 — UNCHANGED.** And not for want of eligible work: this session's one consult-eligible action (a `Write`) was **lost to a `CONSULT-OUTAGE`**, observed live. Sharper than the paste's §4 illustration — not "no consult work happened" but "it happened and the outage erased it". 2 consult outages this window. |
| `GATE1_STATE_DIR` | `/Users/clintonaitkenhead/.sage-gate1` — **unchanged** |
| Guard status | **No evidence of a trip; tree verified clean and the battery green at open (250/0) and again after the commit (250/0).** It was RED only while the waived edits sat in the tree, naming exactly the six files — the guard doing its job. |

---

## Verified

Boundary **250/0** post-commit (**249/1** pre-commit, the one failure being the waived guard);
report **74 → 99/0**; capture **37 → 48/0**; negative **251 → 256/0 RELEASE GATE PASS**; logic
**173/0**; Option S **45/0**. `tsc` exit 0; all six manual pre-commit checks recorded in the commit
message. `layer2-mechanisms.ts` byte-unchanged at `60cefedb…`; `stoic-brain.ts` unmodified.

## Rollback

`git revert 97320a0`. No flag, no schema, no migration, no production surface, nothing pushed. The
window keeps running; the guard stays armed.

**STATE:** rulings 2 and 3 **EXECUTED**; the third (disclosure-shape) ruling **EXECUTED**; the window
**RUNNING and untouched**; the guard **armed and green**; **baseline 1 of 5**; Option S fixed and still
never run. **S11-D2 remains BLOCKED on the five-day threshold. The S11 flip remains REFUSED; weights
remain BLOCKED; the 0h call remains the founder's.**

---

## Carried for the founder

1. **PUSH `97320a0`** (the founder pushes; this session never does).
2. **The harness-level question above** — can any field distinguish a subagent caller at the
   command-hook `PreToolUse` layer? Until answered, ruling 3's exclusion is a correct mechanism with
   no live population to exclude.
3. **Decision 1 (`npx` fail-closed)** — recommended by the mentor, precondition now discharged, still
   the founder's to apply.
4. **Decision 2 (close peers)** — **SIX interactive peers were open at this session's `ListAgents`, up
   from the five the mentor addressed.** Five distinct session ids are feeding the window.
5. **The tool-choice measurement-validity question** remains open and unsteered.
