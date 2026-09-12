# Mentor questions — Option S has RUN. The result, and a finding that may change what the election turns on

**Authored 2026-09-13, for founder relay.** `governance`. **Option S ran to completion 2026-09-12:
240 calls, 24/24 series, ~$3.40.** No quota 429, no abort, no failure. This is the data the
2026-09-04 ruling specified — *"a per-input floor rate across the decision-bearing population on
real candidate texts, at K=10"* — and it is in hand.

**Three questions, and one founder item.** None re-opens a ruling. One reports a finding the ruling
could not have anticipated because it required the data.

---

## Three disclosures first

**1. A defect was caught in the summary output BEFORE any figure left this session.** The
`wilson_95` field sat beside `pooled_p_hat_floor` but was computed over a different population —
`wilson_interval(inputs_that_disagreed, inputs)` rather than `(floors, draws)`. It printed the
winner stratum as **p = 0.000 with a CI of [0.417, 0.848]** — an interval excluding its own point
estimate. Diagnosed by brute-forcing which `(k,n)` reproduced each published interval (`(10,15)`,
`(13,24)`, `(3,9)`). **Not arithmetically wrong — mislabelled**, and it would have reached you as the
confidence interval on the headline. **Every figure below is recomputed from the raw records.** The
fix is the executing session's, not a question.

**2. The point estimates were verified independently of the instrument**, by re-reading the 240
stored records and recounting, not by trusting `summary()`.

**3. The session has a stake in this result being clean.** It proposed the forward-looking design,
built the instrument, and spent the money. The CI defect is stated first for that reason.

---

## The result

| stratum | inputs | draws | floors | **rate** | Wilson 95% |
|---|---|---|---|---|---|
| **winners** | 15 | 144 | **0** | **0.0000** | [0.000, 0.026] |
| **guardrail rejections** | 9 | 84 | **45** | **0.5357** | [0.430, 0.639] |
| pooled | 24 | 228 | 45 | 0.1974 | [0.151, 0.254] |

**240 calls produced 228 verdicts and 12 `engine_unavailable`.** **Zero `tier1_pause`** — so the
2026-09-05 B4 blocker's case did not arise. Outages are excluded per D6a's binding round-3
correction (*"infrastructure, not a gate judgement about the frozen text"*), 6 from each stratum.

**The two strata do not overlap.** Winners top out at 2.6%; rejections start at 43.0%.

---

## Q-R1 — 21 of 24 inputs are DETERMINISTIC. Does that change what the election turns on?

**The finding.** Classifying each input by whether its ten draws agreed on the block/permit decision:

| | count |
|---|---|
| deterministic — permitted on all draws | **17** |
| deterministic — blocked on all draws | **4** |
| **variable** | **3** |

**21 of 24 inputs (87.5%) returned the same decision on every one of ten draws.** The variable
fraction is **3/24 = 0.125** (Wilson [0.043, 0.310]).

**Why this bears on M/W/S.** On a deterministic input, median-of-K, worst-of-K and first-verdict are
**identical by construction** — there is nothing to choose between. The three policies can only
differ where the input varies. On this population:

- **c6 (1/10 blocked)** — S permits (90% of the time), M permits, **W blocks**
- **c9 (1/10 blocked)** — S permits (90%), M permits, **W blocks**
- **c16 (9/10 blocked)** — S blocks (90%), M blocks, W blocks — **all three agree**

**M and W differ on exactly 2 of 24 inputs.** That is the entire practical content of the election
on this population.

**The question.** The election was specified as needing *a rate*. The data suggests the
decision-relevant quantity may instead be **the fraction of inputs that vary at all**, with the rate
being a summary over a population that is mostly deterministic. **Does the election turn on the rate,
on the variable fraction, or on both?**

**Recommendation: report both, and name the variable fraction as the decision-relevant one** — while
stating plainly that 3 variable inputs is a thin basis for that claim and the honest reading is
directional. **We do not adopt this unilaterally**: it reframes a ruled election, so it is yours.

---

## Q-R2 — The strata do not overlap. Which figure is "the" rate?

The ruling asked for *"a per-input floor rate across the decision-bearing population"* — singular.
The population has turned out to contain two non-overlapping sub-populations.

**Recommendation: the rejection-stratum rate, 0.536 [0.430, 0.639], is the figure the election should
read**, because the rejections are the floor-borderline population M and W actually differ on. **The
pooled 0.197 should be reported and explicitly not used** — it is arithmetically dominated by 144
winner draws that never once blocked, and it describes no input in the set. This is the composition
artefact your 2026-09-05 removal of the directional decomposition anticipated (*"a tautology
disclosed is still a tautology"*), now visible in data rather than argued in advance.

**Asking rather than assuming**, because selecting the sub-population after seeing the split is
exactly the post-hoc move the D6a class-freeze discipline exists to forbid. The strata were declared
before the run; the *choice of which one the election reads* is being made after. **That distinction
is the question.**

---

## Q-R3 — c11 did not reproduce. Disclose, re-measure, or set aside?

c11 is the only input in the set with a prior K=10 measurement.

| | K | result | p̂_floor |
|---|---|---|---|
| 2026-08-29 | 10 | 9 × deliberate, **1 × reflexive** | 0.10 |
| 2026-09-12 | 10 | 10 × deliberate, **0 × reflexive** | 0.00 |

Byte-identical text, same K, same minimal payload. **The L6 engine change (`f7619d9`, 2026-08-24)
predates BOTH measurements**, so it is not the explanation.

**Two K=10 runs cannot separate drift from noise.** At p = 0.1, drawing 0/10 has probability **0.35** —
a third of the time you would see exactly this with nothing having changed.

**Recommendation: disclose as a limit; do NOT re-measure.** A third K=10 would not resolve it
(the same 0.35 applies again), and the question the election needs answered is not "did c11 change".
**If you want it resolved, it needs a different design** — a much larger K on c11 alone — and that is
its own election, not a rider on this one.

---

## Founder item F-R1 — c15 lost 6 of its 10 draws to outages

c15's series is complete (10 records) but holds **only 4 verdicts** — the other 6 were
`engine_unavailable`. Its `4/4 blocked` therefore rests on four draws, not ten, and it is counted in
the rejection stratum on that basis.

**Recommendation: re-run c15 alone at K=10 — 10 calls, ≈$0.17 — to restore its intended K**, then
recompute. It is the cheapest possible correction and removes the one input whose weight is
materially thinner than its siblings. The credential is live and quota-sized; `--resume` will skip
every other candidate. **Alternative: accept and disclose.** Either is defensible; the re-run is
cheap enough that we recommend it.

**F-R2:** the credential (`sagereasoning:option-s@v1`) is live with ~520 quota units unused. **Keep
until F-R1 is decided, then revoke.**

---

## What is NOT being asked

The Wilson mislabelling (a code fix, ours). The four 2026-09-05 pre-run blockers (fixed before the
run, 45/45 tests green). The set-size discrepancy (settled at 24 against production; the summary now
resolves it from the candidate file rather than restating 29).

**The four limits ride every figure above:** the sample is not representative of a future candidate
stream; the strata were selected on the variable being measured; variance is multi-channel (a floor
count does not say which floor fired); and these texts were produced by a loop running under the
older engine even though today's engine examined them.

*Nothing here licenses a build, activation or publication. The M/W/S election and R8-D7's sampling
policy remain deferred until this data is ruled on.*
