# F-3′ — the guard-availability threshold: a PROPOSAL for the founder's election

**Session S4 (window-start readiness), 2026-09-06 (`date`, AEST). Model `claude-opus-5`, adversarial
review under `claude-sonnet-5`. Documents only — no code, schema, flag or credential changed.
Nothing here is elected.**

**PR19 independent adversarial review ran and found ONE HIGH and TWO MEDIUM confirmed findings, all
fixed in place before this version:** Anchor 4 originally quoted a partial-day 60% outage figure
against a full-day attempt count (corrected to the day's actual close, 25.25%, with the empirical
dilution argument replaced by its structural ground); §4 overstated the lean-mode ruling as "closed"
rather than "held pending a founder election" (corrected against the decision-log record); and §4
cited an unsourced "17–18 distinct sessions" concurrency figure that the source document itself uses
to REFUTE concurrency as a cause (removed). Every fix is annotated in place rather than silently
folded, per this project's own append-and-annotate discipline. The review's central confirmation
survives unchanged: §6's guard-deny-population finding, the §1 population separation, and Anchor 2's
arithmetic all verified correct against source.

F-3′ makes a bounded guard-availability rate a **second** precondition on the false-hold
observation window, in the same class as P8a (binding ruling
`2026-09-05-mentor-ruling-part3-structural-unfailability-verbatim.md` **Q3**; routed to P6 by
`agent-circles-2026-08/2026-09-05-mentor-ruling-guard-availability-and-lean-mode-doctrine-verbatim.md`
**Q-G1(c)**). Q3 leaves the number open in terms: *"The threshold is a P6 design question."*
This document proposes one. **The founder elects; this proposes.**

---

## 1. The quantity being thresholded — stated exactly, because two are in play

**The threshold governs the guard OUTAGE RATE over guard ATTEMPTS:**

```
p  =  GUARD-OUTAGE  /  (GUARD-OUTAGE + GUARD-CAUTION + GUARD-PROCEED + GUARD-BLOCK)
```

measured per day from `~/.sage-gate1/gate1.log` by B4's own method, unchanged so the pre- and
post-remedy figures stay comparable.

**It is NOT the guard-deny count.** That is a different population with a different and much
larger problem, quantified in §6. Keeping the two apart matters: the threshold proposed here
protects the *rate's* denominator and does approximately nothing for part (3)'s *correct-holds*
denominator. Saying so is part of the proposal, not a caveat on it.

---

## 2. The proposal

> **Open the window when, over ≥3 consecutive ordinary days:**
> 1. the **aggregate** guard outage rate is **≤ 5%**; **and**
> 2. **no single ordinary day exceeds 10%**; where
> 3. an **ordinary day** is one with **≥ 20 guard attempts** — days below that are reported and
>    counted, but excluded from the rate.

Three parts because three different things can go wrong: a chronically degraded channel (1), a
single bad day hidden inside a good average (2), and a percentage computed on a denominator too
small to mean anything (3).

**An honest note on how this number was actually reached, stated here rather than left implicit.**
The 5% figure was formed by rough judgement first — clearly below the ruling's 11% ceiling, not so
tight as to be unachievable against measured latency — and the anchors below were assembled
afterward as a check on that judgement, not as the route that produced it. Anchors 1, 2 and 4 are
independent of that ordering (they hold regardless of what number they are checked against).
Anchor 3's factor is the one place the after-the-fact check could have been fitted to the
preformed number rather than derived from D6a's interval; §5 explains why the number is still
offered as a real test rather than withdrawn on that ground.

---

## 3. Derivation — four anchors, in decreasing order of hardness

### Anchor 1 — the ruling sets a ceiling of 11%. *(hard; from the ruling, not from data)*

The mentor named **11–32%** as the condition that is not a random sample — *"A denominator losing
a fifth to a third of its population to instrument outage is not a random sample of what was
attempted. The selection mechanism is not neutral."* A threshold set **at or inside** that band
would license the very condition the ruling identified as the problem. **So the threshold must sit
strictly below 11%.** This bound is derived from the ruling alone and holds whatever the data say.

### Anchor 2 — the outage rate *is* the width of the systematic bound. *(hard; arithmetic)*

For any rate `R` computed over the captured population, with the lost fraction `p` unknown:

```
R_true  ∈  [ R_obs·(1−p) ,  R_obs·(1−p) + p ]        width = p
```

The interval contains `R_obs`, and **its width is exactly `p`** — so the outage rate converts
directly into percentage points of irreducible uncertainty on every figure the window publishes.
At p = 5% the systematic bound is 5 points; at p = 32% it is 32.

This is the *worst-case* bound, which assumes nothing about the lost population. It is the honest
one to use **precisely because the ruling forecloses the alternative assumption**: the mentor states
the selection is not neutral — *"high-latency periods are both more likely to produce outages and
more likely to produce different examination results."* If the lost records could be assumed to
resemble the captured ones, the bound would collapse; the ruling says they cannot be.

### Anchor 3 — a systematic bound must be held tighter than a sampling bound. *(judgement, declared)*

This project already publishes a rate carrying a **~13-point sampling interval** (D6a: n=100, 12%,
Wilson 95% CI 7.0–19.8%) with the bound printed on it. That is the accepted precedent for how much
uncertainty a published figure here may carry.

A systematic bound of the same width is **worse than a sampling bound**, for two reasons:

- **It does not shrink with n.** Running the window 30 days instead of 7 narrows sampling error and
  leaves `p` untouched. This is the structural reason F-3′ is a **precondition on the start** and
  not a footnote on the result — it is the one source of uncertainty that duration cannot buy down,
  which is exactly the mentor's own placement: *"It belongs in the window's preconditions, not in a
  footnote on the published rate."*
- **Its direction is not neutral,** per Anchor 2, whereas sampling error is symmetric.

So the systematic bound should be materially tighter than the sampling bound already accepted.
**Holding it to a third-to-a-half of ~13 points gives ~4–6 points ⇒ 5%.** *The factor of 2–3 is a
judgement, not a derivation — it is the one number in this document that reasonable people could
set differently, and it is where the founder should push if they disagree with the result.*

### Anchor 4 — an aggregate alone hides the days that matter most. *(hard; from observed structure)*

**Correction applied at PR19 review (a HIGH finding, confirmed): an earlier draft of this anchor
quoted "~60% outage on 202 attempts" for 2026-09-04, conflating two different populations.** The
60% figure is a partial-day snapshot from `2026-09-04-gate2-guard-outage-diagnosis.md` (65 attempts,
39 outages, taken mid-day while that diagnosis was being written, and the same ruling that names it
explicitly says *"the 60% figure should not be quoted forward as the baseline"*). **The 202-attempt
figure is the full day's total, which closed at 51 outages — 25.25%,** after running substantially
worse in its first four active hours (06h–09h: 54 attempts, 34 outages, 63%) before the timeout
remedy landed that evening.

At the corrected 25.25%, the empirical dilution argument does not survive as originally stated:
**the aggregate rule alone already catches this day under any plausible week.** Diluting 51 outages
below a 5% aggregate needs ≥1,020 total attempts in the window — roughly 818 more across six other
days, i.e. 136/day against an observed median of 24.5. A real check confirms this: the aggregate
over 2026-09-02 → 2026-09-06 (the five most recent calendar days at this writing) is **14.72%**
(68/462) — still well above 5% with 09-04 folded in.

**The per-day cap is retained anyway, on the structural ground the anchor also states**, not the
now-corrected empirical one: a high-latency day is *precisely* the period the ruling identifies as
non-neutral, and a threshold that admits it only by drowning it in a large enough denominator is
still admitting exactly the contamination the precondition exists to exclude — a week with one very
bad day and six merely-good ones should not pass by averaging, whatever the arithmetic happens to
do on any particular five-day slice. **Hence the per-day cap (10%), argued on structure rather than
on this one day's numbers.**

And the minimum-n qualifier is forced by the observed volume: guard attempts per active day range
**1 to 267**, with a **median of 24.5**. On a 2-attempt day a single outage reads 50%. A percentage on n = 2 is
noise in both directions — it could fail a healthy window or pass a broken one. **≥20 attempts** is
the smallest denominator at which one outage moves the rate by ≤5 points. **30 of the 50 active
guard days in the log meet it** — but note the median sits at 24.5, so the qualifier excludes a
full 40% of active days. That is the intended trade (it discards the days on which the rate is
uninformative) and it is also the sharpest cost of part 3: it lengthens the calendar time needed to
accumulate three qualifying days.

---

## 4. Costs both ways — required, and neither is small

### If set too high (say 15%)

- Re-admits the lower half of the band the ruling named. The letter is met; the ground is not.
- The systematic bound (15 points) **exceeds** the sampling interval this project already treats as
  substantial, so the dominant uncertainty on part (3)'s figure would be the un-shrinkable kind.
- **The damage is unrecoverable after the fact.** A window run at 15% cannot be repaired by
  analysis, by running longer, or by a bound printed at the end; the records that would have
  disambiguated it were never written. The flip claim would then rest on a figure whose largest
  error term is both un-narrowable and directionally suspect.

### If set too low (say 1%)

- **The window may never open.** The endpoint genuinely takes 14.5–19.1 s against a 55 s budget,
  and Anthropic-side latency is outside this project's control. **Corrected at PR19 review (a
  MEDIUM finding, confirmed): a prior draft cited "17–18 distinct sessions" as a concurrency
  pressure, sourced imprecisely.** The 17-session figure comes from the outage-diagnosis document's
  08-30 count — but that document uses session count to REFUTE concurrency as the cause of guard
  outages (*"concurrency does not explain it — 17 sessions at 32%, 9 sessions at 60%; whatever
  changed, it is not session count"*), so citing it here as an argument FOR fragility repurposes a
  variable the project's own record found not to be the explanation. The genuine argument for "a
  single bad hour would fail a week" needs no concurrency claim at all: it follows directly from
  the observed volume distribution alone (a single low-attempt hour can dominate a day's rate; see
  Anchor 4's min-n qualifier).
- **A too-tight threshold does not fail safe — it fails into a corner**, and both exits are worse
  than plain deferral. **Corrected at PR19 review (a MEDIUM finding, confirmed): the prior draft
  said lean mode "is closed"; the decision-log record is plainer — Q-G1(b) rules lean mode
  DOCTRINAL and the founder's own recorded action is "raise the budget, hold lean," pending a
  founder election made with that framing explicit** (*"A shorter impression is a different
  impression"*; `D-…-mentor-ruling-guard-availability-and-lean-mode-doctrine-ADOPTED-2026-09-05`
  in the decision log, its named internal-discrepancy paragraph). Held is a real exit, not a closed
  door — but it is not a *cost-free* one: adopting lean mode as a latency remedy would be adopting
  it under exactly the framing the ruling warns against (a latency preference dressed as neutral),
  and a too-tight threshold creates pressure to make that election precisely because latency is
  bad, which is the wrong reason to elect it. The corner a too-tight threshold creates is therefore
  real even though the door is not welded shut: deferral of P6, or a doctrinal election made for an
  undoctrinal reason. The D2 ruling's warning about sequencing applies in spirit either way:
  *"not a reason to defer the correction indefinitely."*

### Why 5% rather than 10%

10% sits just under the ruling's named band — it avoids the letter while leaving the systematic
bound (10 points) close to the sampling bound already accepted, i.e. it concedes Anchor 3 entirely.
5% puts the systematic bound clearly below the accepted sampling bound and leaves headroom for an
ordinary bad hour without failing the week.

---

## 5. A disclosure the founder should weigh, because it bears on whether this threshold is a real test

**I already know the early post-remedy indication** — the standing opener records 83 guard events
with 1 outage since the 2026-09-04 raise, and this session independently confirmed that exactly one
`GUARD-OUTAGE` line falls after the remedy boundary. **So this threshold was not proposed blind.**

**The derivation above does not use that figure**, and it can be audited on that point: Anchor 1's
11% ceiling comes from the ruling; Anchor 2 is arithmetic; Anchor 3 is anchored on D6a's published
interval; Anchor 4 on the 09-04 outlier and the observed attempt-volume spread. Remove the early
indication entirely and every number in §2 is unchanged.

**The practical consequence, and the reason to elect now rather than after 09-08:** a threshold set
*before* B4's measurement is a genuine test the harness can fail. A threshold set *after* it is
vulnerable to being calibrated to the answer — the failure mode this project has on record from the
D4 activation (*"a non-regression check presented as a took-effect proof"*) and from the P6 report's
"target MET" arithmetic identity. **2026-09-08 is the last moment this can be elected as a real
test.** That is an argument for electing it in this sitting, in which leg (a) is date-blocked and
cannot contaminate it.

**The complete disclosure, added at PR19 review because "the derivation doesn't use the figure" is
true but incomplete: the known figure sits roughly TEN TIMES below the proposed threshold.** 83
events at 1 outage is ≈1.2%; this session's own isolated check (one `55000ms` guard outage in the
whole log after the remedy boundary, against 207 guard attempts counted the same way) gives ≈0.5%.
Both are isolated counts, not a rate this session computed or is licensed to compute before 09-08 —
but a threshold of 5% sitting an order of magnitude above either count is very likely to pass once
B4's measurement runs. **"A test the harness can fail" is true in the narrow sense that the
threshold was fixed before the measurement exists; it is not a strong test in the sense of being
likely to bind.** The founder should read the proposal with that qualification attached, not as an
open question this document leaves ambiguous.

---

## 6. What this threshold does NOT fix — and it is the larger problem

**F-3′ protects the guard *attempt* population. Part (3)'s "correct holds on genuinely problematic
actions" is populated by the guard *deny* population, and that population is very thin.**

Measured from the full log (2026-07-12 → 2026-09-06, **57** calendar days, 50 with guard activity):

| Quantity | Value |
|---|---|
| Guard attempts (all classes) | **2,161** |
| Genuine guard denies (`GUARD-BLOCK`) | **15** |
| Active guard days | **50** |
| Active guard days producing **zero** denies | **45 of 50** |
| Denies excluding the 2026-09-04 cluster | **5** (over 49 other active days) |
| Tool class of all 15 denies | **`Bash`, every one** |
| Proximity of all 15 denies | **`reflexive`, every one** |
| `depth` recorded on any guard record | **`""`** by construction (§7.4's own bound) |

The denies are genuine, not artefacts: `GATE1_GUARD_FAIL_MODE` is absent, so the default `open`
mode applies and an outage **allows** rather than blocks. The log count is a sound proxy for what
capture would have written — the `GUARD-BLOCK` log line (`at-action-hook.mjs:521`) and
`captureGuardObservation(…, denied: true)` (`:533`) sit in the same branch, with only the
`emitBlock` stdout write between them (`:522–532`), placed there *deliberately* so a capture fault
can never retract an already-emitted block — and it is an **upper bound**, since
`appendFalseHoldRecord` is fail-soft (capture is additionally gated on `GATE1_FALSE_HOLD_CAPTURE`,
which is currently unset, so the log is genuinely the only record that exists today).

**One more figure, offered because it is the single sharpest evidence that the §2 threshold is
genuinely binding rather than fitted to already-observed data (a PR19 review's recommended
addition, independently re-verified): of the 28 windows of three successive ordinary days found
anywhere in this 57-day log, ZERO would have passed both rules in §2.** Only 10 of the 30 ordinary
days individually meet the ≤10% per-day cap. This bears on calendar time as much as it bears on
rigor: on this log's own history, satisfying the window's two preconditions together would not have
been a matter of waiting a fixed number of days — it would have depended on which three ordinary
days happened to come up next.

**Three consequences, none of which the threshold in §2 touches:**

1. **Volume, not selection, is the binding constraint on part (3)'s denominator.** At **0.263**
   denies/calendar day (15 over 57) a 7-day window yields **≈ 1.8** guard holds — and excluding the
   09-04 cluster the rate is **0.089/day** (5 over 56), i.e. **≈ 0.6 in a week: a typical week would
   capture zero or one**. Losing 5% of guard
   attempts to outage costs ~0.1 of an event. **However F-3′ is set, it cannot rescue this.**
2. **P8a's activation moves the denominator from *structurally absent* to *present but very thin*,
   not to *populated*.** P5's blocking claim was *"the guard path writes no record"*; that is fixed.
   The claim that replaces it is that the guard path writes ~one hold a week.
3. **The guard-hold population reproduces, on its own side, the representativeness failure the
   first window died of.** §2.6 records part (1) failing on *"one tool class, one depth, one
   proximity."* Every one of the 15 denies is `Bash`, `reflexive`, and `depth: ""`.

**This is offered as a finding and a question for the founder, not as a recommendation.** It bears
on whether a 7-day window can measure part (3) at all, which is a scoping question the S4 paste
places squarely with the founder rather than with this session. **Nothing here licenses reordering
anything, and it is not a reason to delay the window** — the consult-side population is unaffected,
and starting the clock is what turns this estimate into a measurement.

---

## 7. What the founder elects

1. **The threshold** — §2 as proposed, or a different number (Anchor 3's factor is the honest place
   to disagree), or a decision to defer it. **Weigh §6's zero-of-28 figure both ways when deciding:**
   it shows the threshold genuinely binds on this log's history rather than being fitted to it, but
   it also means electing it does not guarantee the window opens promptly — on this log, satisfying
   both rules together has never yet happened.
2. **Whether to elect it before 2026-09-08**, per §5 — the last point at which it is a test the
   harness can fail rather than a description of what it achieved, tempered by §5's own disclosure
   that the known figures sit roughly an order of magnitude below the proposed threshold.
3. **What to do about §6** — including whether part (3) as specified is measurable in a 7-day
   window given a correct-holds denominator of ~1, and whether that warrants its own mentor question.

**Nothing in this document is a build, an activation, or a licence for either. The window has not
started. The S11 flip remains REFUSED; weights remain BLOCKED; the 0h call remains the founder's.**
