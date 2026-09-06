# Mentor question — does F-3′ still gate the window, now that part (3) is a within-consult measure?

**For the founder to relay. Authored 2026-09-06 (machine date), after your part-(3) ruling of the
same day.** Documents only; nothing built, nothing changed, no flag set. **The window has NOT
started** — `GATE1_FALSE_HOLD_CAPTURE` remains unset.

**This does not reopen your part-(3) ruling, and does not reopen the D2 sequencing.** Both are
settled and we are proceeding on them. It asks one question your ruling did not reach, and which we
do not think we should answer ourselves — because answering it either way changes whether the
founder may start the clock today.

---

## The question in one sentence

Your ruling closed *"Start the clock."* **F-3′ — a bounded guard-availability rate — was made a
window precondition by your own earlier ruling and is not named anywhere in the new one.** Does
"start the clock" discharge it, or does it stand?

---

## Why it is genuinely ambiguous rather than merely unstated

**F-3′'s standing.** Your 2026-09-05 Q3 ruling: *"A bounded guard-outage rate is a further
precondition on the window, in the same class as P8a. The window's preconditions are amended to
include it."* Its ground was stated in denominator terms: *"A denominator losing a fifth to a third
of its population to instrument outage is not a random sample of what was attempted. The selection
mechanism is not neutral."* And on placement: *"It belongs in the window's preconditions, not in a
footnote on the published rate."*

**What the new ruling changes.** Part (3) is now a within-consult-population measure, and the guard
population is *"a separately-reported check, not the denominator of a cross-population ratio."*

**So the two readings are:**

**(a) F-3′ lapses.** Its ground was that a *denominator* losing a fifth to a third is not a random
sample. Under the new ruling the guard population is no longer part (3)'s denominator, so the ground
no longer applies to part (3). What survives is Q-G1(c)'s separate requirement that the availability
covariate is *"not optional for honest reporting"* — which now attaches to the **honesty of the
guard disclosure** rather than to a gate on the window's start. On this reading the founder may set
the flag today, and B4's measurement is still owed but as a disclosure input, not a gate.

**(b) F-3′ stands.** It was made a precondition by a binding ruling, in terms, and the new ruling
does not mention it. Preconditions are not discharged by implication. On this reading the founder
waits for B4's measurement (due ≥2026-09-08 UTC) before starting.

---

## The fact that we think reframes the question, and which neither ruling had in front of it

**We measured the CONSULT path's own outage rate — the population part (3) now measures — and it is
worse than the guard path's, by a wide margin.**

Method: `~/.sage-gate1/gate1.log`, full-file counts, successes = `CONSULT session=` lines, outages =
`CONSULT-OUTAGE` lines.

| Population | Attempts | Outages | Rate |
|---|---|---|---|
| **Guard** path, whole log span | 2,161 | 685 | **31.7%** |
| **Consult** path, whole log span | 4,636 | 3,261 | **70.3%** |

Per-day consult rates on recent active days run **25.6%, 35.6%, 50%, 61.2%, 67.9%, 76.9%, 90.1%,
100%**. (The two most recent days post-date the 2026-09-04 timeout remedy and read 25.6% and 50%;
we are **not** presenting those as a post-remedy measurement — the equivalent guard measurement is
under a ≥3-ordinary-days discipline and is not due until 2026-09-08 UTC. They are isolated
observations, offered only to show the remedy has not obviously eliminated the class.)

**Why this matters for the question.** The capture that populates part (3) is written inside
`runConsult`. **An outage means no examination happened and no record exists.** So the population
part (3) now measures is losing — on this evidence — a substantially larger fraction of its attempts
than the guard population ever did, and losing it for the same reason: latency. Your own words about
why this is not neutral apply with more force here than they did to the guard path: *"high-latency
periods are both more likely to produce outages and more likely to produce different examination
results."*

**The structural asymmetry this produces.** The window's scoping note (§2.4) requires consult losses
be **counted** (attempted vs framed vs captured, timeouts, transient 401s). F-3′ requires the guard
rate be **bounded**. After your ruling, the **bounded** population is the one that is now only a
disclosure, and the **measured** population has a counting requirement but no bound.

**One first-hand observation, recorded because it happened while this document was being written
and it would be dishonest to omit it.** The at-action guardrail went unavailable on the very write
that produced this file — `2026-09-06T08:03:20Z`, `reason="timeout after 55000ms"`, fail-open with
the honest log line, in this session (`d99ff2f9…`). It is **only the second guard outage in the
whole log since the 2026-09-04 remedy**, so we are emphatically **not** presenting it as a rate or
as evidence the remedy failed — n=1 is not a measurement, and B4's is not due until 2026-09-08 UTC.
Two narrow things it does establish: the residual failure mode reports **`55000ms`**, i.e. it is the
*visible* kind rather than a silently killed hook, so the timeout invariant is holding; and the
class is not extinct. Offered as an instance, not a figure.

---

## The question, in three parts

**Q1. Does "Start the clock" discharge F-3′, or does F-3′ stand until separately discharged?**

**Q2. If F-3′ lapses as a gate on the guard population — does an equivalent bound now attach to the
CONSULT population, which is what part (3) actually measures?** We are not proposing one; we are
asking whether the reasoning that made a bounded rate a precondition transfers to the population the
precondition now protects nothing of.

**Q3. If a consult-side bound is owed, does the window wait for it?** We ask because the honest
answer may be that it should not — a bound the harness cannot currently meet would defer the window
indefinitely, and your ruling's plain instruction was to start.

---

## What we recommend, stated so you can rule against it

We think **(a)** is right on F-3′ itself — its stated ground genuinely does not survive the guard
population ceasing to be a denominator, and reading a precondition as surviving its own rationale
would be formalism.

**But we think Q2 is the real question, and we are uneasy recommending on it.** The argument that a
70%-losing consult population is *"not a random sample of what was attempted"* is your argument,
applied to the population your ruling just made central. If it holds, part (3)'s measurement has a
selection problem larger than the one F-3′ was created to prevent — and it has had it all along,
unnamed, because the precondition was pointed at the other path.

**We are not recommending the window be delayed.** If the answer is "start it, count the losses per
§2.4, and print the consult availability on the rate as a bound," that is a coherent answer and we
will take it. We would rather have it said than assume it.

---

## Scope

Nothing here licenses a build, an activation, or a reordering. `GATE1_FALSE_HOLD_CAPTURE` is unset;
the F-3′ threshold (≤5% aggregate, ≤10% any single ordinary day, ≥20 attempts) was elected by the
founder on 2026-09-06 and is unaffected as a number by this question. **The S11 flip remains
REFUSED; weights remain BLOCKED; the 0h call remains the founder's.**
