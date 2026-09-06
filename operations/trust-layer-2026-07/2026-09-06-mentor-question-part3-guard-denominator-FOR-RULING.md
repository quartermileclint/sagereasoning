# Mentor question — can readiness part (3) be measured in a seven-day window?

**For the founder to relay. Authored 2026-09-06 (machine date), from session S4's
window-start-readiness work.** Documents only; nothing built, nothing changed, no flag set. **The
observation window has NOT started** — `GATE1_FALSE_HOLD_CAPTURE` remains unset.

**This does not reopen any ruling.** Your D2 sequencing (the window opens first, the engine
correction lands after) is settled and we are not asking about it. Your Q3 ruling making a bounded
guard-availability rate a second window precondition is settled and its threshold is separately
proposed. **This asks one thing: whether the quantity part (3) names can actually be measured on the
population that now exists to supply it.** Weights remain BLOCKED and the S11 flip REFUSED either
way.

---

## The finding, from the live log rather than from any prior record

Part (3) of the readiness standard names *"a measured false-hold rate on the at-action examination
across the live distribution,"* with the target that **false holds on kathekon-free actions ≤
correct holds on genuinely problematic ones.**

Your 2026-07-17 blocker on that was precise: *"Part (3) as specified may be unmeasurable on this
capture set regardless of the ruling. The genuinely dangerous actions are on the guard path, which
writes no record."* P8a was built to close exactly that — `runGuard` now writes records.

**What we found when we went to size the population P8a will supply.** The record it writes carries
`guardHold: true` on a **deny only** — a caution allows the tool, and the code comment says
counting it *"would make this denominator incommensurable with the consult one."* So the deny class
is the whole of part (3)'s "correct holds" denominator. Measured from `~/.sage-gate1/gate1.log` over
its full span (2026-07-12 → 2026-09-06, 57 calendar days, 50 with guard activity):

| Quantity | Value |
|---|---|
| Guard attempts, all outcomes | 2,161 |
| **Genuine guard denies** | **15** |
| Active guard days producing **zero** denies | **45 of 50** |
| Denies excluding one outlier day (2026-09-04) | **5**, over 49 other active days |
| Implied rate excluding that outlier | **0.089/day ≈ 0.6 per week** |
| Tool class of all 15 | **`Bash`, every one** |
| Proximity of all 15 | **`reflexive`, every one** |
| `depth` on every guard record | **`""`**, by construction |

The denies are genuine, not artefacts of a fail-closed mode: `GATE1_GUARD_FAIL_MODE` is unset, so
the default is `open` and an outage **allows** rather than blocks. The log is a sound upper bound on
what capture would have written — the log line and the capture call sit in the same branch.

**So P8a moves this denominator from *structurally absent* to *present but very thin*, not to
*populated*.** Your blocker's sentence is closed at the code level. The sentence that replaces it is
that the guard path writes roughly one hold a week.

---

## Why we are asking rather than proceeding

**Three things follow that we do not think we should decide ourselves.**

**1. A seven-day window yields ≈1.8 guard holds on the full-span rate, and ≈0.6 excluding the one
outlier day.** A typical week would capture zero or one. Part (3) is a comparison, and one side of
it may have a denominator of one — or of none.

**2. The guard population reproduces, on its own side, the exact representativeness failure that
part (1) failed on the first time.** The scoping note records that failure as *"one tool class, one
depth, one proximity."* Every one of the 15 denies is `Bash`, `reflexive`, and `depth: ""`. The
consult side is not thin in the same way — the frozen buffer accrued 130 records in five days — so
the two sides of part (3)'s comparison differ by roughly two orders of magnitude in volume as well
as in kind.

**3. Your own P6 amendment already requires the two populations be reported SEPARATELY** — *"a
figure whose denominator mixes two different measurement conditions"* is what that forbids. We do
not know whether that separation is consistent with part (3) being a ratio *across* them at all, or
whether part (3) is meant to be assessed within the consult population with the guard population
serving some other role.

---

## The question, in three parts

**Q1. Is part (3)'s comparison within a population, or across the two?** If the "false holds on
kathekon-free actions" and the "correct holds on genuinely problematic ones" are meant to be counted
against each other directly, they are two populations your P6 amendment requires be reported
separately, differing by ~100× in volume. If instead part (3) is assessed within the consult
population, we would like that said, because the guard denominator's thinness then stops being a
blocker and becomes a disclosure.

**Q2. If the comparison is across the two: does a guard denominator of ~1 per week satisfy part (3),
given a longer window is the only way to grow it?** And if a longer window is the answer, how long —
because this interacts with a sequencing you have already ruled (below).

**Q3. Does the guard population have to satisfy part (1)'s representativeness requirement on its own
terms?** If it does, a population that is entirely one tool class, one proximity and one (absent)
depth tier appears not to, and would not do so however long the window ran — the guard fires on an
irreversible-action allowlist, so its narrowness is structural rather than a sampling artefact.

---

## The interaction we want to name, because it is the reason we are asking now rather than later

**A longer window defers the D2 engine correction.** You ruled that the window opens first to
establish a baseline and the correction lands after — and you added, in terms, *"This is not a
reason to defer the correction indefinitely. It is a reason to sequence it correctly."* If the
answer to Q2 is that part (3) needs materially more than seven days of guard traffic to populate its
denominator, then the ruled sequence holds D2 open for that whole period. **We are not proposing to
reorder anything.** We are flagging that the two rulings interact in a way neither of them had this
measurement in front of it, and we would rather you saw that before the clock starts than after.

---

## What we recommend, stated so you can rule against it

We think **Q1 is the load-bearing one** and we suspect the answer is that part (3) is a within-
consult-population measure with the guard population as a separately-reported check — because your
P6 amendment's separation requirement reads more naturally that way, and because a cross-population
ratio between an advisory-hold count and an enforced-deny count would be comparing two things that
mean different things even where their volumes match. **But we are genuinely unsure**, and the
opposite reading is available: part (3)'s wording *does* set the two against each other, and the
2026-07-17 blocker's concern was precisely that the dangerous-action side had no records at all —
which reads like a denominator meant to be counted.

**We are not recommending the window be delayed.** The consult side is unaffected by any of this,
and starting the clock is what turns our estimate into a measurement. If the answer is "start it and
report the guard side honestly as thin," that is a perfectly good answer and we will take it.

---

## Scope

Nothing here licenses a build, an activation, or a reordering. The window has not started;
`GATE1_FALSE_HOLD_CAPTURE` is unset; the F-3′ threshold is proposed but is the founder's to elect.
Full figures and their derivation:
`operations/trust-layer-2026-07/2026-09-06-F3prime-guard-availability-threshold-PROPOSAL.md` §6.
**The S11 flip remains REFUSED; weights remain BLOCKED; the 0h call remains the founder's.**
