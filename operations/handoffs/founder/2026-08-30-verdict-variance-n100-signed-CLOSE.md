# Close — the disclosure went live, was superseded twice, and is signed again at n=100

**2026-08-30.** `code-elevated` + one founder-walked Critical step (the credential limit-raise).
Full record: `D-VERDICT-VARIANCE-APPLIED-THEN-SUPERSEDED-TWICE-N100-SIGNED-2026-08-30`.

## Live now

The four surfaces carry the **sweep-1 (n=50)** wording, applied today. It is **accurate for the
sample it describes** and smaller than what is now known. Nothing is wrong on any public surface.

## Signed and NOT applied

`2026-08-30-verdict-variance-n100-WORDING-FOR-SIGNATURE.md` — n=100, PR19-folded, founder-signed.
**Application is the successor's first task.** Seven places, four files.

## The three things worth carrying forward

**1. Every blocking defect this session was scope, never arithmetic.** Six independent review rounds.
Not one found a wrong number. All three wording drafts carried a blocking defect of coverage — a
falsified claim about which probes varied, a missed fifth surface, a false "one deployment", a
dropped pinned phrase. **When reviewing this arc's work, check what is covered before checking what
is computed.**

**2. A signed wording has now been overtaken by a measurement twice in two days.** The mentor ruled
the response is not to wait for the data to settle: *"'settled' is not a property the data acquires
at some future n — it is a property the disclosure acquires when it accurately represents the best
available evidence at the time of publication."* The disclosure is **designed for revision**. A third
sweep would supersede this one, and that is correct rather than a problem.

**3. The instrument now refuses things it used to assert.** Five review rounds turned it from a
script that would count any parseable HTTP 200 as a real outcome into one that suppresses its own
directional split when the baseline is arbitrary — which is what happened on live data at the sweep,
on the one probe that matters. The disclosure follows the instrument's refusal rather than overriding
it. That is the mentor's Q3 reasoning and it is now load-bearing on what gets published.

## Verification

Rate held **0.12 at both n=50 and n=100**; interval **7.0–19.8%**; design balanced at 20 counted
outcomes per borderline probe. `d6a-rate.json` verified **byte-identical to `350dd29`** throughout —
kept that way by an overwrite guard added this session, after `summary` was found to rewrite that
path unguarded. S10 battery 146/0 at the point of the surface application.

## Yours

1. **Push** (5 commits unpushed at close).
2. **Restore the quota**: `UPDATE api_keys SET daily_limit = 200 WHERE id = '4d96307f-2c19-4c82-a1fe-bd901c3bee4d';`
   — raised to 400 for the sweep, and the sweep is done.
3. **The date correction** — 17 commits and 4 documents are filed as 2026-08-31; today is 2026-08-30.
   Disclosed to the mentor as fact 9. Renaming four files is cheap; rewriting commit messages is not.
   **Recommend: rename the four documents, leave the commits, and note it in the successor.**

**Rollback:** `git revert 098a5ff` then `a2428b4`. Weights-BLOCKED, Q1 and the §A boundary unchanged.
Nothing bears on the 0h call.
