# M-4 follow-up — two mechanism facts the ruling was not shown

**For mentor ruling. Authored 2026-08-17.**
**Predecessor ruling (binding):** `2026-08-16-mentor-rulings-M1-M5-r2b-verbatim.md` §M-4.
**Status:** the M-4 build is **HELD** pending this ruling, by founder election 2026-08-17. Nothing
has been changed in `computeDispositionStability`.

---

## 0. Why this comes back rather than proceeding

M-4 ruled that `computeDispositionStability` must be **corrected if tractable, otherwise retired
from agent-facing surfaces**, and that carrying a defective graded signal beside an honest ungraded
one is not a safe interim posture. That ruling is accepted and is not being reopened.

The founder elected to execute it. On grounding the execution, two facts about the live mechanism
surfaced that **the original brief did not put in front of the ruling.** Both change what
"correct or retire" costs, and one of them means the defect is not the one the ruling describes.

**PR20 is written for pre-ruling briefs, not this situation** — it requires a mentor brief to name
the specific existing mechanisms a ruling will land on *before* the ruling is given. This is a
post-ruling correction: the ruling already landed, and a consequence surfaced only during execution.
We are applying PR20's underlying principle one step later than it is written for, not invoking it
literally — a mentor should not decide on an incomplete picture, whether that picture is offered
before or after the first ruling. §4 below is honest about which facts actually change the answer and
which do not, so this does not become a way to relitigate a ruling that already resolved cleanly.

---

## 1. Mechanism fact one — this dimension is a **hard gate on grade upgrade**, not a reported reading

The original brief presented `disposition_stability` as a dimension *reported* on agent-facing
surfaces. It is also a **gate on the Senecan grade ladder**, and therefore on published authority.

**Verified first-hand:**

- `grade-transition-engine.ts:300` — `if (!dimensionsMeetFloor(snapshot.dimension_levels, threshold.min_dimension_level)) return null`
- `grade-transition-engine.ts:301-305` — `if (!dimensionsMeetElevated(levels, elevated_dimension_count, elevated_dimension_level)) return null`
- `dimensionsMeetFloor` (`:466-475`) uses **`.every()`** — *every* dimension must meet the floor.
- `dimensionsMeetElevated` (`:476-486`) counts dimensions at or above the elevated level.
- There are exactly **four** dimensions (`types/accreditation.ts:200-205`): `passion_reduction`,
  `judgement_quality`, `disposition_stability`, `oikeiosis_extension`.
- The upgrade thresholds (`:129-169`) escalate to `elevated_dimension_level: 'advanced'` with
  `elevated_dimension_count: 3` for `deliberate → principled`, and for
  `principled → sage_like` set **`min_dimension_level: 'advanced'` with count 4** — i.e. all four.
- The path is **live**: `sage-assent-feed.ts:280` calls `evaluateGradeTransition` and `:283` upserts
  the resulting record, on the Sage Reflect completion path. The grade sets `authority_level` and is
  published on the public accreditation card.

**The consequence for the ruling's own preference order.** Retiring the dimension — or capping it
below `advanced`, which is what "remove the false `advanced` certification" amounts to — does not
merely remove a misleading reading. **It makes `principled → sage_like` structurally unreachable**,
because that rung requires all four dimensions at `advanced` and this one could no longer get there.
`deliberate → principled` would then require the other three all at `advanced`.

We are not asking the mentor to accept or reject that outcome as a design preference. We are
reporting that the ruled remedy has a consequence on the grade ladder that the ruling was not shown,
and that a defensible reading of the ruling's own logic *endorses* it — if the certification cannot
honestly be made, the grade that depends on it should not be reachable until it can be. We would
rather have that said than assumed.

---

## 2. Mechanism fact two — the signal is **mean-blind**, which is a different defect from the one ruled on

M-4's grievance is that low variance *in the absence of perturbation* is certified as stability
*under* perturbation — an inversion of the Stoic account of progress (Seneca 75.8–9).

The function has a second, independent defect that the brief did not surface: **it ignores the level
of what is consistent.** `computeDispositionStability` (`window-aggregator.ts:535-575`) computes
`mean` at `:541` and uses it **only** inside the variance calculation. The level is set from `stddev`
alone (`:557-570`).

**Demonstrated, not asserted** — driving the live `computeWindowSnapshot` with thirty identical
readings, varying only the proximity level:

```
30x reflexive   -> disposition_stability = advanced
30x habitual    -> disposition_stability = advanced
30x deliberate  -> disposition_stability = advanced
30x principled  -> disposition_stability = advanced
30x sage_like   -> disposition_stability = advanced
```

Thirty consecutive **`reflexive`** readings — the worst available reasoning, perfectly consistent —
certify as `advanced` with the indicators *"Highly consistent proximity across actions"* and
*"Disposition approaching hexis"*, at maximum confidence (`confidence = 1 - stddev/2`, `:572`,
maximised at zero variance).

**Two honest bounds on that finding, so it is not read as more than it is.** First, this alone does
not upgrade a poor agent: the same gate checks `proximityRate` against the threshold
(`:293-297`), which thirty `reflexive` readings fail outright. The real exposure is narrower — an
agent who *does* clear the proximity bar receives a free `advanced` toward `elevated_dimension_count`
without having earned it on this dimension's own terms. Second, and more importantly for the ruling:
**mean-blindness is not M-4's defect.** Thirty identical `sage_like` readings in a never-perturbed
environment would still certify `advanced`. Fixing mean-blindness leaves the perturbation defect
entirely intact.

---

## 3. What this does to the tractability question the ruling turned on

M-4's preference order was: correct with *"a perturbation-adjusted measure that distinguishes low
variance under perturbation from low variance in the absence of perturbation"* if tractable;
otherwise retire.

Grounding this honestly, in both directions:

- **The claim that no independent channel exists is false**, and we should say so rather than lean on
  it. An adversarial review of our own first investigation found that `evaluated_at` (a server clock
  value) is already mapped onto every element handed to the aggregator and is never read; `surface`
  is persisted but simply not selected; `candidates_considered` is wrapper-supplied. Channels exist.
- **But none of them distinguishes perturbation.** Temporal spread measures persistence over time,
  not having been tested. Consultation-surface variety measures where the agent was used. Neither
  separates "held steady under varied and adversarial conditions" from "was never varied."
- A further obstacle applies to *any* corrected measure, not only to a perturbation one: the delta's
  own disclosed `DISPERSION_DELIVERY_BOUND` (`trajectory-delta.ts:823-826`) records that rows include
  examinations whose framing was never delivered to the agent, and carry no delivery marker. That is
  a survivorship problem in the population itself.

So our honest position is: **the ruled correction is not available on the ruling's own terms**, but
not for the reason our first pass gave, and a *partial* correction (gate `advanced` on an adequate
mean as well as low variance) is cheaply available and fixes the sharper defect while discharging
none of M-4.

---

## 4. Where this actually leaves the ruling — and what is genuinely still open

**We should be honest about what §3 already settles.** M-4's own conditional reads: *"if that
correction is not tractable in the current build, the signal should be retired from agent-facing
surfaces until it is."* §3 above concludes the correction is not available on the ruling's terms. On
a literal reading, **the ruling already resolves this to retire — we are not short a ruling, we are
short a decision to execute one already given.** We did not execute it and are bringing this back
instead, and we want to be direct about why, rather than dress up an unresolved case as three open
questions when one of them isn't.

**The reason is fact one, not fact two.** Mean-blindness (§2) does not change the tractability
conclusion and does not by itself justify holding the ruling — it is a separate, correctable defect
that could be fixed on its own merits regardless of what the mentor says here. **The grade-gate
coupling (§1) is the fact that might change what "retire" should mean**, because "retire" here is not
a quiet field removal — it is a live change to which authority levels an agent can reach, and the
ruling was not shown that consequence. That is squarely the kind of thing PR20 exists to surface
before, not after, a ruling is acted on, even though PR20's stated occasion is a pre-ruling brief and
this is a post-ruling correction — the same principle, applied one step later than it is written for,
because the fact surfaced only during execution.

So the honest questions are narrower than a first draft of this section had them:

1. **Given retire is already licensed, does the grade-gate coupling change what should be retired, or
   just confirm the ruling as given?** Two readings are both available on the ruling's own words: (a)
   retire the dimension from every agent-facing surface as originally ruled, and let
   `principled → sage_like` sit structurally unreachable as an honest record that the measure is
   missing — the ruling never promised every rung would stay reachable, only that no dishonest
   certification would be carried; or (b) the ladder itself needs re-tuning as part of the retirement
   (dropping to a three-dimension elevated-count for the top rung, or an equivalent), because an
   unreachable top rung is a different kind of dishonesty than the one M-4 named. **If the mentor's
   answer is (a), no further ruling is needed and we will execute retirement on this brief alone —
   name that explicitly if so, and we will not return a third time on the same question.**

2. **Does mean-blindness (§2) warrant its own correction, independently of whichever answer (1)
   gets?** It is correctable now with no new channel and does not touch the perturbation question
   either way. Named separately so it is not mistaken for something the mentor's answer to (1)
   resolves.

---

## 5. What is on hold pending this ruling

- **Spec 4's activation** (`SUBSTRATE_TRAJECTORY_DISPERSION_ENABLED`) remains **BLOCKED**; the block
  is stated on the flag helper itself (`agent-assessment-history-store.ts:137-153`).
- No change has been made to `computeDispositionStability`, to the grade engine, or to any
  agent-facing surface carrying the dimension.
- The retirement blast radius, if it comes to that, is recorded and larger than first thought: six
  agent-facing surfaces, plus published claims on `llms.txt` (three placements) and
  `agent-card.json:312`, plus a `does_not_attest` sentence in `trust-record-payload.ts` pinned
  object-identical by the S10 battery — so retirement is also an R18 wording change requiring
  founder sign-off, and three further producers of a same-named field exist (one of them
  agent-facing, `/api/baseline/agent`).

**A note on the disclosure already shipped.** The M-A disclosure published 2026-08-16 states that
the dimension *"cannot distinguish a stable disposition that has been tested under varied conditions
from one that has not been tested at all."* That sentence is true, remains true, and is not affected
by anything above — but it does not disclose the mean-blindness, and an agent reading it would not
learn that consistent poor reasoning also certifies as `advanced`.
