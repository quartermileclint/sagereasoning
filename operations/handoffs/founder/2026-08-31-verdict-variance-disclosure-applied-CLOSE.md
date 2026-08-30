# Close — the verdict-variance disclosure applied, carrying the measured rate

> **ERRATUM — the date in this document's filename is wrong.** It is filed as **2026-08-31**; the day
> it was authored was **2026-08-30**. The error was the executing session's, caught only when quota
> arithmetic would not reconcile, and disclosed to the mentor as fact 9 of the pooled-sweep question.
> **Every measurement date INSIDE this document is correct** — the D6a sweeps were run on 2026-08-30.
> The file is **deliberately not renamed**: this document is cited by filename elsewhere in the
> repository, and renaming a cited record — a binding mentor verbatim among them — would break those
> references to hide a clerical error rather than record it. Recorded 2026-08-30.

**2026-08-31.** `code-elevated`. **AC7 not engaged; no flag flipped; no behaviour changed.**
Full record: `D-VERDICT-VARIANCE-DISCLOSURE-APPLIED-CARRYING-MEASURED-RATE-2026-08-31`.

## Commits (4, unpushed)

| Commit | What |
|---|---|
| `0105423` | PR19 findings folded into the draft; supersession widened to §4/§7/§8 + pin S2-49 |
| `a2428b4` | **Edit 1** — `TRUST_RECORD_ENVELOPE` + ADR-013 §8 amendment + pins, one commit |
| `098a5ff` | **Edit 2** — `llms.txt` (×4 incl. :118), `agent-card.json` (24→25), api-docs |
| `62d82b2` | Decision-log entry |

## The one thing worth carrying forward

PR19 found **zero numeric defects** — every figure reproduced — and a disqualifying **scope** defect:
the draft superseded 4 of 11 sections of the signed package and called it "four false assertions".
Three more sections were still governing with falsified rate claims, and pin **S2-49 pinned the exact
string the revision deletes**. True count: **fourteen strings, seven sections, one pin**. The
undercount *was* the defect — the audit swept only what it had already decided to rewrite.

**The review earned its place by running before the signature.** Run after, it would have caught
nothing.

## Verification done

tsc 0 · `npm run build` passes · S10 battery **146/0** · agent-card parses at 25 extensions · all six
pins mutation-verified · cross-surface sweep clean (no residual "rate not measured", no inter-surface
contradiction, `/api/reason` stated unmeasured everywhere).

**A vacuous-verification catch:** the first mutation harness (`perl -CSD`) silently failed to
substitute on non-ASCII dashes, so two "pass under mutation" results tested an unmodified file.
Re-run under Python; all pins fail correctly. *A guard that stops guarding still prints pass.*

## Yours, next

1. **Push**, then **live-verify by `curl`** — the session cannot verify a surface it has not deployed.
   Check: the trust-record envelope carries the interval; `llms.txt` guardrail + epistemic-map
   paragraphs; agent-card `verdict-variance/v1`; `llms.txt:118` no longer says "identical inputs".
2. **Carried, untouched:** balanced second sweep (p4–p7 only); the calibration balance check and
   directional split (each needs its own PR19); the supersession banner on the signed package
   (`git checkout` that one file reverts it); `runs/` archiving.

**Rollback:** `git revert 098a5ff` then `a2428b4` — surfaces must not outlive the envelope item they
describe.

Weights-BLOCKED, Q1, and the §A boundary unchanged. Nothing here bears on the 0h call.
