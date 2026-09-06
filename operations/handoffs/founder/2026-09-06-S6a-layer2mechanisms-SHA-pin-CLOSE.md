# S6a CLOSE — the `layer2-mechanisms.ts` SHA pin, built and mutation-verified

**Written 2026-09-06 (`date`; 22:0x AEST / 12:xxZ), model `claude-opus-5`, on commit `4645306`
(unpushed, pre-existing). Tier `code-elevated`. Decision code:
`D-S6A-LAYER2MECHANISMS-SHA-PIN-BUILT-UNCONDITIONAL-PR19-FOLDED-2026-09-06`.**

## What changed

**One file, purely additive.** `website/src/app/logos/__tests__/human-practitioner-boundary.test.ts`
gains **§C2c** — a SHA-256 content pin on `layer2-mechanisms.ts`, discharging the item the D2
window-sequencing ruling marked **owed NOW**.

**Nothing else.** No schema, flag, credential, migration, production change, or D2 engine correction.
`layer2-mechanisms.ts` is **byte-unchanged** (`60cefedb…`, re-verified at close). **Nothing committed;
nothing pushed.**

## Why it is not redundant with the existing guard

The §C2 `git status` binding sees **uncommitted** edits only — the ruling says so twice. The pin reads
**disk bytes**, so it catches **committed and uncommitted edits alike**. One pin discharges the whole
obligation.

## Verified four ways, not asserted

| Condition | Result |
|---|---|
| Uncommitted edit, window ON | **248/2** — tree binding + pin both fire |
| **Committed edit simulated, window ON** | **249/1** — **pin fires ALONE**; tree binding passes |
| Clean, window OFF | 249/0 |
| **Committed edit simulated, window OFF** | **248/1** — **pin still fires** |

Committed-edit condition simulated via `git update-index --assume-unchanged` (changed bytes, clean
status) rather than by committing — same discriminating condition, fully reversible. All mutations
reverted, hash re-verified byte-exact each time, **no index flag survived**, re-verified after the
PR19 fold. Battery **249/0 → 250/0**.

## The open design question — DECIDED UNCONDITIONAL

Decisive ground, and it was **tested rather than argued**: a window-conditional pin would share its
off-switch with the thing it polices — unsetting `GATE1_FALSE_HOLD_CAPTURE` would disarm the pin **and**
stop capture in one move, reopening the forbidden silent-commit route via a flag flip that erases the
evidence of its own use. Row 4 above is the proof. Supported by M1's own line (tree binding
conditional, content pin not), by operational identity wherever the ruling governs, and by a
**measured** standing cost: **15 commits in 12 months** (last 2026-08-24) vs `stoic-brain.ts`'s 6 —
which corrects the paste's "heavily-trafficked" characterisation. Reasoning and its strongest counter
are recorded in the code comment, where the next session will find them.

## PR19 — three independent reviewers, no HIGH, all folded

Each forbidden to modify anything and told not to trust the author. **Every finding re-verified at
source before folding.**

- **Ruling fidelity — FAITHFUL.** MEDIUM: a "verbatim" quotation was a **splice** of ruling:74+:86
  (`grep -c` = 0) → replaced with ruling:74 contiguous. LOW: the author's own counter-argument was an
  **incomplete reading that understated the author's case** → corrected, with the missed supporting
  text now cited. LOW: the ruling's **second** stand-down shape (scoped allowlist) was unnamed → added.
- **Blast radius — CLEAN, zero findings.**
- **Guard adequacy — SOUND.** Ruled **no self-test is owed**: a mistyped `GUARD_RE` fails silent-green,
  a mistyped 64-hex literal fails immediate-red — *"there is no typo that widens it."*

**Two reviewers found the quotation splice independently** — convergence, not taste.

## ⚠ FOR THE FOUNDER — one finding named and deliberately NOT acted on

`core.hooksPath` = `.husky/_`, and **`.husky/pre-commit` is an ACTIVE gate that blocks commits** on
five check classes (tsc; ESLint on R20a modules; ByteString headers; route-export; view-grants). **It
does not run this battery**; there is no CI and no npm test script. So *"genuinely enforceable rather
than nominal"* today rests on a session choosing to run the file — at exactly the moment (commit time)
where the committed-edit gap lives.

**Remedy is one line. Recommended. NOT applied** — the paste authorised this pin *"and nothing else"*,
and adding a blocking check changes your local commit behaviour. **Your election.** Shortfall is
inherited from §C2b, not introduced here.

## Window + baseline health (read-only, cutoff `2026-09-06T12:18Z`)

- Buffer **162** = 138 `v1` (frozen prefix, integrity verified) + 1 took-effect probe + **23 organic**.
- **20 guard** (`Bash`, depth `""`) + **3 consult** (`Edit`, depth `standard`, real loop closure).
  Corroborated in `gate1.log`: 17 CAUTION + 2 PROCEED + 1 BLOCK = 20; 3 CONSULT.
- **BASELINE: 1 of 5 days with consult records** — unchanged, and unchangeable on 2026-09-06 since that
  UTC day is already counted.
- `GATE1_STATE_DIR` unchanged; one buffer file; append-only, never refreshed.
- D2 defect, raw: **guard 12/20, consult 0/3** — S5b's concentration holds at larger n; still not a finding.
- **Guard: no evidence of a trip; tree verified clean.** (Stated precisely: an interim note in-session
  said "has not tripped", which over-claims — the guard only runs when a session runs the battery.)

## ⚠ FLAGGED, NOT RESOLVED — the tool-choice measurement-validity question

The baseline clock counts **consult days**, but consult records accrue only from
`Write`/`Edit`/`MultiEdit`/`NotebookEdit`. The window shows **139 `AT-ACTION-SKIP-BASH`** against 20
guard and 3 consult captures, and this session watched its own guard count move **17 → 19 → 20 while
consult stayed at 3**. Preferring `Edit` would accrue baseline days faster **and make the population
less representative of actual work** — the opposite of what part (1) requires. **Founder/mentor
question. Not resolved. Tool choice not steered either way.**

**Related (PR19):** 4 window guard records came from the **review session's own read-only calls** —
verification activity enters the measured population. Decide deliberately whether those belong in the
guard rate rather than inheriting them silently.

## Consult-availability instrument — still NAMED, not built

Not elected, so not built; spec complete at the S5b health doc §6.3; owed **before publication**. New
data point: **1 `CONSULT-OUTAGE`** against 3 successes. **The trap stands: the mentor's documents state
LOSS, not availability — reporting availability inverts every comparison.**

## Rollback

Discard the four uncommitted files. **Nothing else to undo** — no flag, schema, migration, production
surface, commit or push.

## Next

**S11-D2 opens only at five ordinary days with consult records — currently 1.** The pin must be updated
to the corrected hash as part of that correction, under a recorded founder waiver **or** a scoped
allowlist landed as its own reviewed change and removed after; **a silent commit is forbidden.**
Window-neutral alternatives remain S7 (item 2b) and S6 (Option S pre-run fixes).

**The window keeps running. The S11 flip remains REFUSED; weights remain BLOCKED; the 0h call remains
the founder's.**
