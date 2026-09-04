# Close — the P6 recommendation column: built, reviewed, folded

**Date:** 2026-09-04. **Stream:** founder. **Tier:** `code-elevated` — repo-only.
**AC7:** not engaged. **PR6:** not engaged. **PR19:** engaged and discharged. **PR15/PR20/PR25:** engaged.
**Production:** no schema, flag, credential, migration, deploy or live op. **Model:** `claude-opus-5`.
**Commit:** `dc100b4` (3 files). **Decision-log entry:** `D-S11-P6-RECOMMENDATION-COLUMN-BUILT-REVIEW-FOLDED-2026-09-04`.

## 1. Status in one paragraph

§7 of the scoping note is implemented and the carried register changelog is applied. The report now
prints, per record, both the hold classification and the decision table's recommendation, derived at
report time and stored nowhere. **The build was not clean on first pass and should not be read as
though it were:** five independent PR19 reviewers returned one HIGH that reproduced a defect class this
project had already taken to the mentor, five MEDIUMs, and — most usefully — a battery-adequacy review
that ran 29 mutations against my first draft and found **six that left it fully green**. All are folded
and re-verified. **P4/P5/P6 unmoved; the window has not started; the S11 flip remains REFUSED.**

## 2. What was built

Both columns per record; **derived at report time, stored nowhere** (capture layer, record shape and
`recordHash` untouched; `dbRows` pinned to a frozen 24-column allowlist). Populations split on `path`.
**Four** bounds printed on the rate — the three ruled (A8, guard `depth: ""`, as-of-table) plus one a
reviewer found undisclosed (`SUBSTRATE_JUSTICE_SELF_CIRCLE_NARROWING_ENABLED` is read at call time, so
the column depends on the environment the report ran in). A v3/v4 lift check runs on raw records
**before anything is derived and before ingest**, and aborts.

**Smoke:** over the frozen 130 the column reproduces the P1 re-run **exactly** — `130 proceed + log`,
the filter moving exactly one record. Two independently-written derivations, same numbers.

## 3. The HIGH, because it is the thing worth carrying forward

Under the P1 filter a `do-not-proceed` can only arise from a verdict that engaged the predicate. So the
"kathekon-free (FALSE hold)" cell **cannot be non-zero**, and my draft printed `target (false ≤
correct): MET` off it. That is an arithmetic identity wearing the clothes of a measurement — the mirror
image of **RA-1-F2 (2026-07-17)**, a HIGH finding on this same script headed *"an artifact, not a
measurement"*, which went to the mentor; and against the **D6a ruling (2026-08-30)** that an
arithmetically forced split be removed from publication, not footnoted.

Two reviewers found it independently (enumerating 46,080 and 335,160 seam inputs); I confirmed with a
third enumeration of my own before folding. **The target verdict is now removed from this column** and
the structural zero stated in terms, with the precedent cited in the output so a reader can check it.

## 4. What I got wrong, stated plainly

- **My mutation sweep was not adequate and I believed it was.** I ran 8 mutations, 7 died, I
  investigated the survivor and concluded the battery was sound. An independent sweep of 29 found six
  more survivors. Every one was the same family: I pinned that a *label* printed, not that the *claim*
  under it was true. A reviewer demonstrated this by inverting every ruled disclosure — "the A8 row
  FIRES NORMALLY", "It IS stored" — while the battery stayed at 40/0.
- **One of my own assertions was over-broad and failed honestly.** §8.1 asserted no
  "target (false ≤ correct)" appeared anywhere in the report; it matched the *classification* column's
  legitimate line — the one Part 3b defers to. Caught by the battery, scoped, and a companion pin added
  that the deferral target still exists.
- **The `--per-record` flag shipped with zero coverage** in the first draft, and the excluded-hold case
  I was proud of finding was itself under-pinned.

## 5. The carried item — Q-A, discharged

The prepared `scratchpad/chg.py` **no longer existed** (prior session's scratchpad), so there was
nothing to *attempt*, only something to author. I re-derived both entries from source — verifying
commit `3e8f231` (2026-08-17) first-hand — and **the write cleared on the first try**, after four
denies in the predecessor session. The content is equivalent; the composed action text differed. That
is data about the instrument, not vindication of the entry.

## 6. Observations worth keeping

- **The guardrail timed out (28s) on several actions, including the commit.** A peer session diagnosed
  this today as a **chronic 11–32% baseline outage rate** (`cc846a9`) — the guard's 28s budget against
  a measured 14.5–19.1s endpoint latency. It bears directly on this work: the default fail mode is
  `open`, so an outage writes a `no_assessment` record, which means **a fifth to a third of the guard
  population in a real window will be non-derivable exclusions.** The report counts and names them.
- **HEAD moved under this session.** A peer committed and pushed mid-work, which also published the six
  unlanded commits found at open. Path-scoped commits and the double `git status` held; no collision.
- **A concurrent reviewer mutated a file I was working on.** I had checksummed backups; the file was
  verified pristine afterwards. One reviewer's copy briefly contained a hardcoded `v34Checked = 2` —
  had that been committed it would have published a false coverage number permanently.

## 7. Session honesty notes (PR21)

- **The elicitation fired repeatedly and my honest answers stopped changing.** I said so once rather
  than restating them each time — the predecessor close named exactly this: restating an outage every
  turn performs scrupulousness where one decision was made.
- **I wanted the HIGH to be wrong.** It meant my build reproduced a defect this project had already
  been bitten by. I ran my own enumeration precisely because I noticed I wanted a particular answer.
- **The opening frame read `is_kathekon=false — quality=contrary`** on a request to read a prompt file,
  and the at-action guardrail read `contrary` on every heredoc edit all session — live instances of the
  false-positive class this very window exists to measure the rate of.
- **The build looked finished at 40/0 and was not.** If I had stopped at my own green battery, a report
  printing a tautology as a readiness figure would have gone into the record.

## 8. Carried — yours

1. **Push.** `dc100b4` is committed, not pushed. (Note: a peer's push publishes it too.)
2. **Register D4's activation walk** — founder-walked `code-critical`, its own session (your 2026-09-05 call).
3. **The v3/v4 lift check is unexercised on real v3/v4 data** and says so. Only a real window discharges it.
4. **Unreproducible observation:** one reviewer saw a single battery run at 38/2 with an abort on the
   publication path, not reproduced in 29 further runs. Recorded rather than dropped.

## 9. Cross-references

`2026-09-05-mentor-ruling-P6-window-recommendation-verbatim.md` (binding) ·
`2026-08-15-false-hold-new-window-scoping-note.md` §7 ·
`2026-07-17-RA1-F2-s11-observation-instrument-vacuity-finding.md` (the precedent the HIGH reproduced) ·
`S11-FLIP-PREREQUISITES-REGISTER.md` §A P4/P5/P6, §D D4 · `2026-09-05-P6-ruling-adoption-CLOSE.md` ·
commit `dc100b4`.

## 10. Date correction (applied after the close was first written)

**This close, its successor prompt, the decision-log entry and one register changelog line were
originally dated 2026-09-06. They are corrected to 2026-09-04.** The session's context reported
`currentDate: 2026-09-06`; the machine clock, git, and the harness log all read **2026-09-04**
(commits `dc100b4` 22:10 +1000 and `064285d` 22:14 +1000; the session opened ~22:10 and ran into the
early hours of 2026-09-05). The commit author dates are the anchor because they are the checkable fact.

**Why it mattered enough to fix.** A concurrent session landed four commits at 03:05–03:35 on
2026-09-05 (`20c1147`, `3401eb8`, `1c2695a`, `cc88291`) — genuinely **after** this session's work. Left
uncorrected, this session's documents would have read 2026-09-06 and appeared to be the *later* of the
two, inverting the real sequence between two tracks that touch the same register.

**This is not a one-session slip.** The predecessor session, whose own close is dated 2026-09-05,
authored `2026-09-06-P6-recommendation-column-BUILD-NEXT-SESSION-PROMPT.md` — the prompt this session
executed — with the same forward date, against a repo convention where a prompt carries the date of the
close that ships it (`2026-09-04-P1-followon-CLOSE.md` / `-NEXT-SESSION-PROMPT.md`;
`2026-09-03-OC-Gate3-…` likewise). **That file is another session's artifact and is deliberately NOT
renamed here** — it is flagged for the founder as a same-class instance. Any session whose context date
runs ahead of the machine clock will reproduce this; the durable fix is to date artifacts from `git log`
or `date`, not from the context.

*End of close. The instrument measures the thing rather than a proxy for it, and now says out loud
which of its own figures are structural rather than measured.*
