# SESSION PASTE — Session S4: window-start readiness (the false-hold observation window)

**Paste this whole file as the first message of a fresh session.** Standing queue row **S4** of the
single serial arc (standing opener, Version 2026-09-05, as re-planned 2026-09-06). **S5 ran and was
RULED on 2026-09-06; its ruling is what makes this row unambiguously next, and it changed this row's
leg (c) — read §2 before anything else.**

**Tier: a read-only autonomous half, then ONE founder act.** The autonomous half changes NO code, NO
schema, NO flag, NO credential. **The founder act — setting `GATE1_FALSE_HOLD_CAPTURE` — is
`code-critical` in consequence** (it is P8a's activation, the observation window's start, the
standing-runner track's "item D restoration", and the byte-identity guard re-arming, **all in one
act**), and it is the founder's alone.

**⚠ THERE IS A HARD DATE GATE. Do not run leg (a) before 2026-09-08 UTC.** B4's follow-up
measurement needs ≥3 days of ordinary traffic after the 2026-09-04 ~19:00 UTC timeout raise. If
`date -u` is before 2026-09-08, **say so and stop leg (a)** — legs (b)/(c) can still be done.

**Never push. Never `git add -A`. Never stage a peer's files. Date every artifact from
`date`/`git log`, never the context date.**

Written 2026-09-06 (`date`), HEAD `55a29c6` plus the S5 ruling records. Model at writing
`claude-opus-5`.

---

## 0. Open under the standard protocol

1. `operations/handoffs/founder/STANDING-SESSION-OPENER-grounded-foundations.md` — Part A in full,
   the "⚠️ facts", the Standing queue. **Its S4 row now carries an amended leg (c) — that amendment
   is this session's most important inherited fact.**
2. `operations/trust-layer-2026-07/S11-FLIP-PREREQUISITES-REGISTER.md` — **P8a, B4, F-3′, D1 and D2
   in full.** D2's row is long and was annotated twice on 2026-09-06; read it to the end.
3. `operations/trust-layer-2026-07/2026-09-06-mentor-ruling-D2-virtue-domain-tagging-verbatim.md`
   — **binding; verbatim wins.** Its Q4 answer contains the sequencing constraint that governs this
   session's relationship to the next one.
4. `operations/trust-layer-2026-07/2026-08-15-false-hold-new-window-scoping-note.md` §2.4 / §3 / §7 —
   the window's two preconditions and the recommendation column.
5. `operations/handoffs/founder/2026-09-06-S5-D2-scope-for-ruling-CLOSE.md` **including its
   addendum** (the addendum corrects the body — read both, and note which way).
6. The last 3 decision-log entries at the **physical tail**.
7. `git status` (whole), `git fetch origin && git log --oneline origin/main..HEAD`, and `ListAgents`.

## 1. Verify, don't trust this file

```bash
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
date && date -u && git fetch origin && git status && git log --oneline origin/main..HEAD
grep -c GATE1_FALSE_HOLD_CAPTURE .claude/settings.local.json   # expect 0 = window not started
wc -l ~/.sage-gate1/false-hold-record.jsonl                    # expect 138 (frozen file is a 130 prefix)
```
**Re-derive every number below.** Every count in this file is a claim to check, not a fact to quote.

## 2. What S5's ruling changed here — read this before planning the session

The opener's S4 row used to read *"confirm both preconditions + S5 needs no engine edit."* That
framing is **superseded**, and in the opposite direction to the one anticipated:

- **D2 IS ruled to need an engine edit** (`computeVirtueDomains`, at source, with the over-broad
  `is_kathekon !== null` trigger corrected in the same pass).
- **But the mentor also fixed the order:** *"the observation window opens first, establishing a
  baseline; the engine correction lands after the baseline is established, so the correction's
  effect on the proximity score is observable against a known prior state."* And explicitly: *"This
  is not a reason to defer the correction indefinitely. It is a reason to sequence it correctly."*

**So D2 does not gate S4. S4 gates D2.** Leg (c) is discharged by ruling: **no engine edit precedes
the window.** Do not re-open it, and do not treat the D2 build as a competing candidate for this
sitting.

**A consequence the ruling creates and does NOT resolve — carry it, do not act on it here.** Landing
the correction after the window opens means the window's records span **two tagging regimes**. The
precedent for handling that is AE-1's read-side S11b boundary segmentation (segment on the boundary
date, exclude a one-day uncertainty band, count the exclusions). **If, while doing leg (b) or (c),
you find that the readiness standard's part (3) cannot tolerate a mid-window regime boundary, that is
a NEW question for the founder — not a licence to reorder a ruled sequence.** Say so and stop.

## 3. What this session must produce

**(a) B4's follow-up measurement — ONLY if `date -u` ≥ 2026-09-08.** Guard availability was 11–32%
on ordinary days before the 2026-09-04 timeout raise (`GATE1_TIMEOUT_MS=55000`, hook timeouts 60 s).
Measure it again from `gate1.log`. **Method discipline, learned the hard way on this project:**
`gate1.log` is UTC-stamped and **shared by concurrent sessions** — verify your own session id before
attributing any event. Report the rate with its denominator and its window, and distinguish an
**outage** from a **deny** (an outage is not a deny). The opener records an early indication of 83
guard events with 1 outage since the raise; **that is explicitly NOT B4's measurement** — do not
quote it as one.

**(b) Propose F-3′'s threshold.** F-3′ makes a bounded guard-availability rate a **second** window
precondition and its threshold is **unset**. It is a **P6 design question**. Propose a threshold
*with its reasoning and its cost both ways* (too high: the window never opens; too low: the window
measures a harness that was mostly unavailable). **Propose — the founder elects.**

**(c) Confirm the window's preconditions.** Precondition 1 is P8a's activation (the founder act).
Precondition 2 is F-3′'s rate. State plainly whether each is met, and **do not certify a
precondition on an argument that reads the same whether or not it holds** — that exact failure
(a non-regression check presented as a took-effect proof) is on record from the D4 activation.

**(c′) Confirm S9 landed.** `D-S9-HARNESS-A11B-REDACTION-BUILT-2026-09-06`. E5's coupling is already
recorded as discharged; verify rather than inherit.

**(d) THE FOUNDER ACT — `GATE1_FALSE_HOLD_CAPTURE` in `.claude/settings.local.json`.** Only if
(a)–(c′) support it. **The AI does not perform this and does not decide it.** Also confirm
`GATE1_STATE_DIR` is the durable path (`/Users/clintonaitkenhead/.sage-gate1`), **not** `/tmp`.
State, before the act: what starts (the window; P8a; item D; the byte-identity guard re-arming),
what the first honest read of the buffer will be, and **what the rollback is** (unset the flag; the
buffer is append-only and the frozen 130-record prefix is evidence — never "refresh" it).

## 4. Do NOT

Build the D2 engine correction (it is ruled to land AFTER the window opens — that is a separate
`code-critical` founder-walked session, row **S11-D2**). Re-open D2's disposition or its location.
Reorder the ruled sequence. Set any flag yourself. Quote a perimeter count. Quote the 83/1 guard
figure as B4's measurement. "Refresh" the frozen 130-record buffer. Push.

## 5. Records

A decision-log entry at the physical tail; the register's P8a / B4 / F-3′ rows annotated (append,
do not rewrite); the opener's S4 row → done and **S11-D2 next** (or S7/S6, which are window-neutral,
if the founder defers the act); a lean close. **A CLAUDE.md production-state block IS due if and
only if the founder performs (d)** — that is a real standing change to the founder's live loop.

## 6. Rollback

Autonomous half: `git revert` the records commit (documents only). The founder act: unset
`GATE1_FALSE_HOLD_CAPTURE` and redeploy nothing — it is local harness config, not production.

## 7. Forecast

Success = an honest availability number with its denominator (or an honest "the date gate is not
met"), a threshold **proposed** with its costs both ways, the two preconditions stated as met or
not, and — if and only if the founder elects it — the window started, with the mid-window
regime-boundary consequence of the D2 ruling recorded for the S11-D2 session rather than discovered
by it. **The next row after this is S11-D2**, whose one unruled axis is the scope doc's **Q-D2-4**
(`\|\| hasNaturalRelationship` on a credit surface) — **never relayed, so unruled; settle it or
re-relay it, and do not let it look like the mentor declined it.**

End of paste.
