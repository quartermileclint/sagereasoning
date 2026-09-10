# Guard POPULATION COUNT: gate1.log ↔ false-hold buffer — RECONCILED, exactly, 1:1

**Session Thu Sep 10 17:04:11 AEST 2026 (from `date`, not the conversation context).** Session
`8fe3a6ae-dcb1-4324-846d-631d51336dc4`. Tier: read-only diagnostic analysis. **AC7 not engaged.**
No code, schema, flag, credential, migration or production surface touched. No `GUARD_RE` file
modified. The buffer was **not** refreshed, truncated or written to.

**PR19 independent review COMPLETE — two blind reviewers, both folded. See §7.** One found a real
defect in this document's window anchor; it is corrected throughout and the numbers below are the
corrected ones.

## 0. What was open, and who handed it forward

- `2026-09-10-post-condition3-build-verification-CLOSE.md` §4b: *"A naive per-day `GUARD-CAUTION`
  log-line count did **not** reconcile 1:1 against the buffer's per-day guard count this session —
  log counts ran higher than buffer counts on every day, most sharply 09-06 (138 log lines vs 76
  buffer records)."* Explicitly *"named here for a future session rather than attempted partially
  and reported as complete."*
- The mentor's `2026-09-10-post-build-outcome-mentor-response-verbatim.md`, carried forward:
  *"The GUARD-CAUTION log-vs-buffer per-day non-reconciliation … is not addressed in this response
  and remains open."*

## 0b. PRIOR ART — this method was ESTABLISHED on 2026-09-09, not invented here

**Found by this session at close, while reading the S11 register — after PR19 had already run, and
not caught by either reviewer (neither was pointed at the register).** The 2026-09-09 Condition-2
session had **already performed this reconciliation and already got an exact tie**, recorded in its
own register row: *"the correct anchor is the line immediately after it, found by 1:1 pairing every
window `GUARD-*` log line to a buffer record, which left exactly one log line unmatched (the anchor
itself). At the corrected anchor, log and buffer agree exactly in both families (`GUARD-*` 203=203,
`CONSULT` exact-token 27=27)."*

The 09-10 verification session's §4b then failed to reproduce that with a per-day count and —
correctly and honestly — reported it as an open non-match, noting that *"the prior sessions'
established … method evidently resolves this for the windows they examined"* but that reproducing it
was out of its bounded scope.

**So the honest scoping of this document's contribution is narrower than "reconciled it":**

1. **Reproduced** the established 1:1 pairing method across all five window days (the 09-09 row
   reports 203=203 for its own window; this session gets 258=258 for the grown window).
2. **Diagnosed WHY the naive per-day method fails** — the three separable causes in §2, none of
   which was previously written down.
3. **TRAP-1 and TRAP-3**, both genuinely new and neither previously recorded anywhere.

The reconciliation itself is a **reproduction**, and the earlier session deserves the credit for the
method. That matters here specifically because a claim of novelty is the easiest kind of overclaim to
make by omission.

## 1. Verdict — scoped precisely

**What is closed: the guard POPULATION COUNT reconciles EXACTLY, 1:1.** This is a claim about
*how many guard events occurred and whether both records of them agree* — **not** about the
false-hold rate, the consult side, or any gated figure. §6 states the exclusions and governs.

As of **2026-09-10T07:04:11Z**:

- **258 window guard log lines ↔ 258 window guard buffer records.**
- **Zero sessions with a count mismatch** (paired per session, ordered).
- **Zero strict token→outcome failures** across all 258 pairs.
- **Maximum |Δt| between a log line and its buffer partner: 11 ms.**

**There was never a discrepancy in the data.** The apparent gap was entirely an artefact of three
compounding measurement errors in how the comparison was made.

## 2. The three causes, separately verified

**(a) The log was not clipped to the window start.** A whole-UTC-day log count on 09-06 includes
~9.8 hours of **pre-window** traffic — a different regime that must never enter the window. This
alone accounts for the sharpest case: 138 raw `GUARD-CAUTION` lines on 09-06 → **68** clipped.
*Affects 09-06 only; the other four days lie wholly inside the window.*

**(b) One token was compared against the whole family.** `GUARD-CAUTION` alone was counted against
a buffer population that also contains `GUARD-PROCEED`, `GUARD-BLOCK` and `GUARD-OUTAGE`. This
**deflates** every fully-in-window day — and is why the carried characterisation *"log counts ran
higher than buffer counts on every day"* is itself imprecise: on 09-07/08/09 the single-token log
count runs **lower** (56 vs 63, 54 vs 57, 37 vs 40). Only 09-06 ran higher, for cause (a).
*Independently re-derived by PR19 reviewer 2 from raw log: 138 / 56 / 54 / 37. Confirmed.*

**(c) A field-shape trap silently dropped a whole token.** See TRAP-1.

## 3. Three traps recorded

**TRAP-1 (NEW): `GUARD-OUTAGE` log lines carry no `tool=` field.**

```
<ts> GUARD-OUTAGE session=<id> mode=open reason="timeout after 55000ms"
```

against the other three, which are `<ts> <TOKEN> session=<id> tool=Bash rec=…` / `proximity=…`.
**Any regex keyed on `tool=` silently drops every `GUARD-OUTAGE` line** — no error, no warning.
This session hit it: a correctly-paired outage record (log `20:09:24.065Z` → buffer
`20:09:24.068Z`, 3 ms) presented as a genuine orphan until the raw line was read.

**PR19 reviewer 2 verified this is UNIVERSAL, not window-local: 0 of 687 `GUARD-OUTAGE` lines in
the entire log (2026-07-13 → now) carry `tool=`; 100% of 1,676 CAUTION / 47 PROCEED / 18 BLOCK
lines do.**

**Why it bites harder than it looks.** `GUARD-OUTAGE` records are **excluded from the rate
denominator by ruling**, and the outage rate is **reported separately on both sides**. A regex that
drops them makes that separately-reported rate read **zero** — a silent false negative in a
disclosure the pre-flip report is obliged to make. **Match on token + `session=`, never `tool=`.**

**TRAP-2 (the mirror of the documented prefix trap).** The standing opener records that `CONSULT`
matches `CONSULT-OUTAGE` by prefix, so families must be split by **exact token** or you
**over-count**. TRAP-1 is the same family in the opposite direction: keying on a non-universal field
makes you **under-count**. Same underlying error — assuming uniform line shape across a token
family. **Verify each token's shape before counting it.**

**TRAP-3 (NEW, and this document fell into it): "record N" in this project's records is 1-INDEXED.**
CLAUDE.md states *"the buffer moved 138 → 139 and record 139 is the first `false-hold-record-v4`."*
That is 1-indexed: the buffer grew from 138 rows to 139, so the appended row is **0-based index
138**. Verified directly — 0-based 138 is the first `v4`, `path:guard`,
`captureBasis:assessment`, `extractionRegime:at-action-v2-composed`, matching CLAUDE.md's
description of the took-effect probe exactly; 0-based 137 is the last `v1`, two months earlier.

**Therefore: probe = 0-based 138; the window is 0-based 139 onward.** This document's first draft
used 140 onward, silently dropping one genuine window guard record. **Two sessions have now read the
same sentence two different ways** — the Condition-3 verification close wrote *"index 139 onward"*
(correct); this document's draft placed the probe at 0-based 139 (wrong). **State the convention
explicitly wherever a window boundary is quoted.**

**The tell that was available and missed:** this session's own diagnostic printed a line labelled
`last v1 record (138)` whose data read `false-hold-record-v4`. The label and the payload
contradicted each other in the same line of output, and it was read past.

## 4. The reconciled table (corrected anchor, window-clipped, full guard family), as of 2026-09-10T07:04:11Z

| UTC day | log | buffer | family breakdown |
|---|---|---|---|
| 2026-09-06 | 76 | 76 | CAUTION 68 · PROCEED 5 · BLOCK 2 · OUTAGE 1 |
| 2026-09-07 | 63 | 63 | CAUTION 56 · PROCEED 7 |
| 2026-09-08 | 57 | 57 | CAUTION 54 · BLOCK 1 · PROCEED 2 |
| 2026-09-09 | 40 | 40 | CAUTION 37 · PROCEED 3 |
| 2026-09-10 | 22 | 22 | CAUTION 22 |

Token → outcome pairings (strict check, zero failures):
`GUARD-CAUTION`→`pause_for_review` | `proceed_with_caution` ·
`GUARD-PROCEED`→`proceed` · `GUARD-BLOCK`→`do_not_proceed` · `GUARD-OUTAGE`→`outage_open`.

**A lesser observation: the log token is lossier than the buffer.** `GUARD-CAUTION` maps to **two**
buffer outcomes. The mapping is deterministic, but caution *grade* is **not recoverable from the log
alone** — for any grade split, **the buffer is authoritative.**

**GUARD-OUTAGE in window = 1** (excluded from the rate denominator by ruling; reported separately
here, as required).

**⚠ These are live figures and WILL have moved.** The buffer is append-only and grew 423 → 447 lines
during this session's own analysis — a Bash-authored session generates guard records as it reads.
**Re-derive immediately before publishing; do not quote this table.**

## 5. Method, stated so it can be reproduced or refuted

1. Anchor the probe at **0-based index 138** (= 1-indexed record 139; TRAP-3). Buffer window = 139+.
2. Guard log lines = `GUARD-{CAUTION,PROCEED,BLOCK,OUTAGE}`, matched
   `^(\S+Z)\s+([A-Z-]+)\s+session=(\S+)` — **token + session only** (TRAP-1).
3. Clip log lines to `ts > probe.capturedAt`. The probe's own log line precedes its buffer write by
   ~2 ms, so this excludes it symmetrically — the documented double-count trap, handled.
4. Group both sides by `session`, sort each by timestamp, **zip in order**; report any session whose
   counts differ. Do **not** pair greedily across a session's whole pool.
5. Check token→outcome **strictly** per position, not by set membership.

**A method note, because it cost this session two false results.** Greedy nearest-neighbour pairing
produced a **false orphan** — an earlier record consumed a later one's log line and the error
cascaded (apparent max |Δt| 33,339 s ≈ 9.3 h; the truth is 11 ms). A second pass produced 24 phantom
"token disagreements" from an incomplete mapping table. **A pairing algorithm's own artefacts are
indistinguishable from data defects until you read the underlying line.** Both were this session's
own, and both were found only by reading raw log lines rather than trusting an aggregate.

## 6. What this closes, and what it does not

**Closes:** the §4b reconciliation gap and the mentor's carried item of the same name — both name the
same narrow comparison, and it is the one resolved here. The guard population is **verified 1:1
against the log**, which is what makes the guard-side **denominator** trustworthy for the F-3′
standing obligation to *"report the guard population separately with its rate."*

**Does NOT close, and is not touched here:** the false-hold **rate** itself; the consult-side bound
threshold; the guard-availability bound (F-3′, still unset — a P6 design question); the pre-flip
report (`Q-PREFLIP-REPORTS`, still unbuilt, still needs a founder waiver); the baseline day count;
anything on the consult side; and the mentor's **other** carried item — the *"51 guard records, 1
consult record, a full build session"* per-session characterisation, which remains **not re-derived
by anyone** and must not be quoted from the mentor's own response.

## 7. PR19 — independent review

Two blind reviewers, **Sonnet** (founder's standing permission to drop model for adversarial passes),
each given raw-data access and instructed to refute rather than confirm.

**Reviewer A — method and arithmetic. One finding, UPHELD and FOLDED.**
The window anchor was off by one (TRAP-3). Verified first-hand before folding, not accepted on the
reviewer's word. The reviewer also tested boundary sensitivity and found **both** anchors independently
reproduce an exact tie, so the headline survived — but the population count was one record short and
is now corrected. It additionally stress-tested the pairing beyond this session's own method (strict
per-position token check; 11 sessions mixing both caution grades, the highest-risk case for a hidden
mispairing) — **zero failures** — and confirmed no duplicate lines exist in the guard family
(87 verbatim duplicates in the log are **all** `AT-ACTION-SKIP-BASH`, none guard).

**Neither reviewer was pointed at the S11 register, and both therefore missed the prior art in §0b — an attribution overclaim this session caught itself, after review, by reading the register before appending to it. A review is only as wide as the sources it is handed.**

**Reviewer B — claims vs evidence, scope honesty. One LOW, FOLDED.**
Both quotations verified verbatim and correctly attributed. TRAP-1 verified universal across the whole
log. The six counts behind cause (b) independently re-derived. The reviewer re-ran the reconciliation
at a **later** moment and got 250 = 250 against this session's 243 = 243 — the method reproducing
under buffer growth is stronger evidence than any single snapshot. **LOW folded:** §1's verdict could
be skimmed as a broader claim than population-count reconciliation; §1 is now explicitly scoped and
points at §6.

**The S11 flip remains REFUSED. Weights remain BLOCKED. The 0h call remains the founder's.**

---

## 8. THE LICENSED RETROACTIVE CHECK (mentor ruling, Thu Sep 10 17:19:51 AEST 2026) — RUN, and it comes back CLEAN

The mentor ruled that TRAP-1 **does** create a retroactive obligation (the prior "no retroactive
classification pass" ruling does **not** extend, because *"a false negative in an obligated disclosure
is not the same as an absent signal"*). Scope, verbatim: *"verify whether any published figure was
computed with a `tool=`-keyed regex that would have silently excluded outage lines… This is not a
full recomputation of the window."* Verbatim: `2026-09-10-mentor-ruling-guard-reconciliation-three-questions-verbatim.md`.

**Finding: NO published figure was computed with a `tool=`-keyed regex — because no published figure
is computed from `gate1.log` at all.** Verified first-hand:

1. **`website/scripts/false-hold-observation-report.ts` — the sole producer of the published
   figures — never reads `gate1.log`.** Its only occurrence of that filename is inside a
   `console.log` string (line 1244) which itself *states* the limitation: *"the consult-side outage
   COUNT is derivable only from gate1.log (CONSULT-OUTAGE lines), which this report does not read."*
   It reads exactly one file — `false-hold-record.jsonl` — and derives outage exclusion from the
   buffer's own fields, not from log tokens.
2. **Every other file mentioning `gate1.log` is a WRITER or a comment, never a counter.**
   `framing-core.mjs:399` is `appendFileSync` — it writes the log; the other two are comments.
3. **No `tool=`-keyed parse exists anywhere in the codebase.** The single `tool=` hit across all
   `.ts`/`.mjs`/`.js`/`.py` is a test assertion on a *buffer record field*
   (`recOn.tool === "Write"`), not a log parse.

**So TRAP-1 is a trap for AD-HOC SESSION ANALYSES — including this one's — not for the report
pipeline.** The obligation is discharged with a negative finding, which is the honest outcome and
not a lesser one.

**One residual, named rather than closed by assumption.** The 2026-09-09 session published a
log↔buffer cross-check in its register row (`GUARD-*` 203=203, `CONSULT` 27=27) from an **ad-hoc
script that was not committed and cannot now be re-read**. Its own exactness is evidence against the
bug rather than for it: a `tool=`-keyed regex would have dropped the single in-window
`GUARD-OUTAGE` record and produced 202 against 203, and that session reported **exactly one**
unmatched *log line* (the anchor) and **no** unmatched buffer record. That is an inference from the
published result, **not** verification of the method, and is stated at that confidence.

## 9. A FIGURE IN THE RULING IS OFF BY ONE — surfaced, not corrected

The ruling names the schema distribution as **required** pre-flip content: *"the schema distribution
(v3=47, v4=96, v5=135, v6=6)"*.

**`v4=96` is wrong; the correct figure at that buffer state is `v4=97`** — provable by arithmetic
rather than by opinion. The buffer is append-only, so its first 423 rows *are* the state those
figures describe: v1=138 · v3=47 · **v4=97** · v5=135 · v6=6, **summing to exactly 423**. The
ruling's set sums to **422**, one short.

**Provenance of the error, traced:** the 09-10 verification session's own close (§4b) recorded
**v4=97** — correct. Its **register row** recorded **v4=96**. The ruling adopted the register row's
figure. So a single-digit transcription error propagated close → register → ruling, and — because the
ruling designates these figures as required pre-flip content — would have propagated into the
pre-flip report.

**This is the second off-by-one this session has found travelling through a records chain** (TRAP-3
was the first). It is surfaced for the founder and mentor, **not corrected in the ruling**, which is
recorded verbatim and is not this session's to edit.

**In any case all four counts are already stale** — the buffer stood at 450 lines at 2026-09-10T07:19:51Z
(v1=138 · v3=50 · v4=97 · v5=135 · v6=30). **The pre-flip report must re-derive them at the moment
it writes them**, per this document's own standing warning.
