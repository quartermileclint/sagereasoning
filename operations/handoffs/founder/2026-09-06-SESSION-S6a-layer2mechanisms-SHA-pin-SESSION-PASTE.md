# SESSION PASTE — S6a: the `layer2-mechanisms.ts` SHA pin (owed NOW), + window/baseline health

**Paste this whole file as the first message of a fresh session.** Successor to **S5b**
(`2026-09-06-S5b-window-health-and-D2-scope-CLOSE.md`), which verified the window and got the
mid-window question ruled.

**Tier: `code-elevated`.** ONE small, reviewable code change is authorised: **adding a SHA-256
content pin** to a guard test. **Nothing else.** No schema, no flag, no credential, no migration, no
production change, no D2 engine correction. **PR19 independent review is REQUIRED and is not
optional** — the change is to the apparatus that protects a live measurement.

**Written 2026-09-06 (`date`), model `claude-opus-5`, on commit `7d24683` (pushed, Vercel green).
Every number below is a claim to RE-DERIVE, not a fact to quote.** The immediately preceding paste
asserted the window had run "roughly a day" when it had run 13 minutes; that is the fourth
context-date artifact in a week. **Run `date` first.**

---

## ⚠️ THE THINGS THAT CHANGE HOW YOU WORK — read before touching anything

**1. THE FALSE-HOLD OBSERVATION WINDOW IS RUNNING** (since `2026-09-06T09:44:55Z`) and therefore
**THE LOGOS BYTE-IDENTITY GUARD IS ARMED** (it binds iff `GATE1_FALSE_HOLD_CAPTURE` is set, per M1).
Its `GUARD_RE` (in `website/src/app/logos/__tests__/human-practitioner-boundary.test.ts`) matches:

```
api/reason | api/guardrail | guardrail-sandwich | sage-reason-engine | reasoning-receipt |
translation-sandwich | /substrate/ | trust-core | kathekon-engagement | false-hold |
harness/gate1 | layer1-extractor | layer2-mechanisms | sage-reflect | stoic-brain
```

against `git status --short`. **No file matching it may sit MODIFIED in the working tree.**

**The file you are editing is `…/logos/__tests__/human-practitioner-boundary.test.ts`. Its OWN path
does NOT match `GUARD_RE` — verified at S5b — so editing it does not trip the guard.** Verify that
yourself before you start, and run `git status --short` before and after every edit.

**2. YOU MUST NOT EDIT `layer2-mechanisms.ts`.** You are pinning its hash, not changing it. That
file's correction is **S11-D2**, which does **not** open until the baseline threshold is met (below).

**3. THREE ABSOLUTE PROHIBITIONS ON THE BUFFER.** Never "refresh", truncate or regenerate
`~/.sage-gate1/false-hold-record.jsonl` (append-only; the frozen 130-record file is an exact prefix
and is **evidence**). Never mix the **138 `v1`** records into the new window's rate (different
regime). Never count **record 139** (a deliberate took-effect probe).

**4. CHECK A PATH IS FREE BEFORE ANY TRUNCATING WRITE.** S5b made two `cat >` writes onto unverified
paths and got lucky. **An empty `git status` does NOT prove a path is free** — a tracked, committed
file shows nothing there and `cat >` would destroy it silently. `test -e` first. (S4 recorded this
lesson; S5b read it and still didn't apply it. Break the streak.)

**5. Never push** (the founder pushes). **Never `git add -A`.** Date every artifact from `date`/
`git log`, never the context date.

---

## 0. Open under the standard protocol

1. `operations/handoffs/founder/STANDING-SESSION-OPENER-grounded-foundations.md` — Part A, the
   "⚠️ facts", the Standing queue (**the S5b and S11-D2 rows are current**).
2. `/adopted/standing-protocol-cache.md` + `/adopted/project-instructions-snapshot.md` — **PR19
   (independent review REQUIRED)**, PR20, PR25.
3. **The binding ruling this session executes, VERBATIM — verbatim wins over every summary:**
   `operations/trust-layer-2026-07/2026-09-06-mentor-ruling-D2-window-sequencing-MID-WINDOW-verbatim.md`
   — read **§"What Reading A requires", item 3** in full. That is your specification.
4. `operations/handoffs/founder/2026-09-06-S5b-window-health-and-D2-scope-CLOSE.md` in full.
5. `operations/trust-layer-2026-07/2026-09-06-S5b-window-health-and-consult-availability-instrument.md`
   — §2.1 (the guard/consult split), §4 (the guard's honest scope), §6 (the instrument, named).
6. `website/src/app/logos/__tests__/human-practitioner-boundary.test.ts` **section C in full** —
   especially **§C2b**, which is the pattern you are copying.
7. The last 2 decision-log entries at the **physical tail**.
8. `git status` (whole), `git fetch origin && git log --oneline origin/main..HEAD`, `ListAgents`.

---

## 1. Verify, don't trust this file

```bash
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
date && date -u && git fetch origin && git status --short && git log --oneline -3
grep -c GATE1_FALSE_HOLD_CAPTURE .claude/settings.local.json    # expect 1 = window RUNNING
wc -l ~/.sage-gate1/false-hold-record.jsonl                     # expect > 157 and growing
shasum -a 256 website/src/lib/translation-sandwich/layer2-mechanisms.ts
```

**DRIFT ANCHOR — do not copy this into code; use it to detect change.** At S5b close the target
file hashed to:

```
60cefedb5f4f78822301b3f9c195813b63b00546431ecde08473b118bea52f73
```

**If your re-derived hash differs, STOP and report it** — under the armed guard that file should not
have moved, and a difference means either an unrecorded edit or a mid-window instrument change. **Pin
the hash YOU derive, never this one.**

---

## 2. What this session must produce

### (a) THE PIN — the deliverable, and it is owed NOW

The ruling, verbatim: *"A SHA-256 content pin on `layer2-mechanisms.ts` is owed under Reading A, for
the same reason §C2b pins `stoic-brain.ts`. The pin is added **before** the baseline threshold is
met, so that any uncommitted edit to the file during the baseline period trips the guard. After the
correction is committed, the pin is updated to the corrected file's hash."*

Build it **on the §C2b pattern**, in the same section C:
- Read the file's bytes, `createHash('sha256')`, compare to a named constant.
- **The failure message must say what it means** — that this is the deliberate-decision checkpoint,
  that a committed edit is still an edit, and that the pin is updated **only** as part of the ruled
  D2 correction (or a recorded founder waiver). Copy §C2b's tone; it gets this right.
- **Mutation-verify it, both directions, and record the evidence.** A pin that cannot fail is worse
  than no pin (this project's own `guard-needs-a-non-vacuity-floor` lesson, and §E of that very test
  exists because the #14 review found exactly that gap). Append a byte to the target, prove the pin
  fails and names the file, `git checkout --` it, prove green again, and confirm the tree is clean.
- The existing battery is **249/0**. Re-run it before and after.

**ONE GENUINE DESIGN QUESTION THE RULING DOES NOT SETTLE — decide it explicitly and record the
reasoning, or put it to the founder:**

> **Is the new pin UNCONDITIONAL (like §C2b) or window-conditional (like the `git status` binding)?**
>
> For unconditional: the ruling says *"for the same reason §C2b pins `stoic-brain.ts`"*, and §C2b is
> unconditional by the M1 ruling. A pin that lapses when the window stops does not close the
> committed-edit gap in general.
>
> For window-conditional: the pin's stated purpose is scoped to the baseline period, and an
> unconditional pin makes **every** future legitimate edit to a heavily-trafficked engine file a
> failing test until someone updates the constant — a materially higher standing cost than
> `stoic-brain.ts`, which is a near-frozen doctrinal source.
>
> **Do not split the difference silently.** Either choice is defensible; an unrecorded one is not.

### (b) WINDOW + BASELINE HEALTH — read-only, and the count now matters

The ruled threshold: **five ordinary days WITH CONSULT RECORDS.** Days producing **≥1** consult
record count; **days producing zero do NOT.**

Re-derive and report:
- **How many baseline days have accrued.** At S5b close: **1 of 5** (2026-09-06: 3 consult, 16
  guard). **Re-derive; do not quote.**
- The organic per-day break-out by **path** (`consult` vs `guard`), tool, depth, `captureBasis`.
- Whether `GATE1_STATE_DIR` is still `/Users/clintonaitkenhead/.sage-gate1` (**a mid-window change
  fragments the buffer**).
- Whether the guard has tripped at any point.

**AND FLAG, DO NOT ACT ON, THIS MEASUREMENT-VALIDITY QUESTION — S5b surfaced it and it is now
load-bearing because the threshold is denominated in consult days:**

> Consult records accrue **only** from `Write`/`Edit`/`MultiEdit`/`NotebookEdit`. Non-guard `Bash` is
> dropped from the consult floor (`GATE1_CONSULT_BASH` unset). S5b's own consult records appeared
> **only** once it switched from Bash heredocs to the `Edit` tool.
>
> **So the baseline clock advances or stalls according to how sessions happen to work.** That invites
> an obvious move — deliberately prefer `Edit` to accrue baseline days faster — and **that move would
> make the measured population less representative of actual work, which is precisely what part (1)
> requires of it.**
>
> **This is a question for the founder and possibly the mentor, not a decision for a build session.**
> Name it; do not resolve it; do not quietly start steering tool choice either way.

### (c) THE CONSULT-AVAILABILITY INSTRUMENT — still NAMED, still NOT BUILT

Owed **before publication**, not now. Its specification is complete in the S5b health document §6.3.
**Build it only if the founder elects it in-session.** If you do: the mentor's documents state the
**LOSS** rate, not availability — an instrument reporting availability where the ruling reads loss
**inverts every comparison**.

---

## 3. Do NOT

Edit `layer2-mechanisms.ts`. Open S11-D2 (the baseline threshold is not met). Build the D2 engine
correction. Set or unset any flag. Touch production, schema, or credentials. Refresh, truncate or
regenerate the buffer. Count record 139 or any `v1` record in a rate. **Compute B4's post-remedy
guard rate before `2026-09-08 UTC`** (no longer a gate, but the timing discipline stands — S4 and S5b
both honoured it). Quote a perimeter count. Push. Steer tool choice to inflate the baseline count.

---

## 4. Records

A decision-log entry at the **physical tail**; the register's **D2** row annotated (**append, never
rewrite** — that row already carries the ruling); the opener's **S11-D2** row updated with the pin's
status and the current baseline day count; a **lean** close.

**A CLAUDE.md production-state block is due ONLY if production or the founder's live loop actually
changes — it should not this session.**

---

## 5. Alternatives the founder may elect instead

Both **window-neutral** — verify that before starting:
- **S7** — item 2b, `l1_supply` out of the `ecosystem` preset (verify `active_with_l1_supply = 0` at
  open). `code-critical`, founder-walked, PR19.
- **S6** — Option S pre-run fixes (correct `option-s-runner.py:45` per the ruling; B2/B3/B4;
  resume/idempotency; the six D6a safeguards). `code-elevated` + PR19; the run itself is founder spend.

---

## 6. Forecast

Success = **the pin landed, mutation-verified in both directions, with the conditional-vs-unconditional
question decided on the record**; an honest re-derived statement of window health and the baseline day
count; the tool-choice measurement-validity question **named and left open**; and PR19 run with its
findings folded. **The window keeps running throughout. Stopping it is not this session's to decide,
and under the mid-window ruling it keeps running even after the D2 correction eventually lands.**

**S11-D2 opens only when five ordinary days with consult records have accrued. The S11 flip remains
REFUSED; weights remain BLOCKED; the 0h call remains the founder's.**
