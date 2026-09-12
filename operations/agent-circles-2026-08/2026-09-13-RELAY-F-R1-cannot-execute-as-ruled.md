# Relay — F-R1 cannot execute as ruled, and the reason is a defect worth ruling on

**2026-09-13, for founder relay.** One question. **No money was spent and no rule was changed**
pending the answer.

---

## What happened

F-R1 was ruled: *"Run c15. ... Ten calls at approximately $0.17 restores the intended K ... Run it,
recompute the rejection-stratum figures, then proceed to the election with the corrected numbers."*

**On pre-flight, before spending, the re-run was found to be inert. It would write ten fresh verdicts
and the instrument would then ignore them.**

## Why

Two of the instrument's own rules combine to block it:

1. **`complete_series()` counts RECORDS, not counted outcomes.** c15's existing series holds **10
   records against `intended_k = 10`** — but only **4 are verdicts**; the other 6 are
   `engine_unavailable`. It therefore registers as **complete**.

2. **The summary's selection rule is explicit:** *"where more than one is complete the EARLIEST is
   operative, consistent with this instrument's first-verdict-is-operative discipline."* A re-run
   produces a **later** series.

So the new series would be written, be complete, and lose to the old one. **c15's rejection-stratum
contribution would remain 4/4 on four draws.** The $0.17 would buy a record nothing reads.

Verified directly against the stored records, not inferred: series `1f3dfac2`, 10 records,
`intended_k` 10, `{verdict: 4, engine_unavailable: 6}`, `requested_at 2026-09-12T13:10:43`.

## The defect underneath

**A series in which most calls failed still registers as a complete measurement, and thereby blocks
its own repair.** This is general, not specific to c15 — any outage-riddled series behaves this way.
The ruling's own words were *"restores the intended K"*, and the intended K is **ten verdicts**, not
ten attempts. The instrument does not currently encode that.

## Why the executing session did not simply fix it

Changing "complete" from *records* to *counted outcomes* is the better rule on general grounds. But
it would be changed **after seeing which input it affects and which way the change cuts** — the
post-hoc move the D6a class-freeze discipline exists to forbid. The earliest-is-operative rule is
also a genuine anti-cherry-picking safeguard, and routing around it to obtain a preferred number is
precisely what it exists to prevent.

**So the change is put rather than taken.**

---

## The question

**Given that F-R1 cannot execute as ruled, which path?**

**Path 1 — accept and disclose. RECOMMENDED.** The ruling already named this defensible. Disclose
that c15's rejection-stratum contribution rests on **4 draws, not 10**, and that the
rejection-stratum Wilson interval carries that limit. **No spend, no rule change, no post-hoc
selection.** Given the re-run cannot move the figures under the present rules, this is the honest
resting point.

**Path 2 — rule the definition corrected, then re-run.** `complete_series()` counts *counted
outcomes*; c15's series is thereby demoted to incomplete; the re-run becomes operative under the
**unchanged** earliest-complete rule. Defensible, and arguably the rule that should always have
applied — but it is a **rule change made with knowledge of the input it affects**, and the executing
session recommends it be recorded as exactly that if taken.

**Path 3 — re-run and report c15's new series as a separate disclosed measurement**, leaving the
operative figures untouched. Costs $0.17, adds a data point, resolves nothing about weighting.

**The election is not blocked on any of this.** The rejection-stratum figure stands under every path
with the limit named, and the M/W/S election's practical content — c6 and c9, each blocked on 1 of 10
draws — is untouched, since neither is c15.

---

## One correction the executing session owes regardless

A test invariant written earlier today — *"no run file exceeds its intended K"* — is **file-level**,
but the data model is **series-level**: a legitimate second series would trip it. That is the
executing session's error, is unrelated to the ruling, and will be fixed to check per-series under
any path.

*Nothing here licenses a spend, a rule change or a publication. The credential remains live and
unrevoked pending this answer.*
