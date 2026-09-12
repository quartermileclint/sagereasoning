# Relay — Option S: the brief, two mentor questions, two founder items

**2026-09-13, for founder relay.** Option S **ran to completion 2026-09-12**: 240 calls, 24/24
series, ~$3.40, zero failures. Its three result questions were **ruled 2026-09-13**. This carries
what has happened since, and what remains open.

---

## The brief

**The figures, as ruled.** The rejection stratum is the election's **operative** figure; the pooled
rate is disclosed and explicitly not used.

| stratum | inputs | draws | floors | rate | Wilson 95% | variable | M/W divergent |
|---|---|---|---|---|---|---|---|
| **guardrail rejections** *(operative)* | 9 | 84 | 45 | **0.5357** | [0.430, 0.638] | 3 | **2** |
| winners | 15 | 144 | 0 | 0.0000 | [0.000, 0.026] | 0 | 0 |
| pooled *(disclosed, NOT used)* | 24 | 228 | 45 | 0.1974 | [0.151, 0.254] | 3 | 2 |

240 calls → **228 verdicts + 12 `engine_unavailable`**, zero `tier1_pause`. Outages excluded per
D6a's binding round-3 correction, 6 from each stratum.

**Variable fraction 3/24 = 0.125 [0.043, 0.310]** — ruled decision-relevant, directional not a
measurement.

**The election's practical content is two inputs.** c6 and c9, each blocked on 1 of 10 draws:
**W blocks both; M and S permit both.** As ruled — *"a values question, not a rate question."*

**c11 did not reproduce** (1/10 → 0/10, byte-identical, same K, `f7619d9` predating both). Ruled:
disclose as a limit, do not re-measure; the difference sits inside the noise envelope for p=0.1 at
K=10.

### Two defects were found in the instrument AFTER the ruling, and both were mine

**They do not disturb the ruling.** Every figure relayed for the ruling was recomputed from the 240
raw records, not taken from the instrument's summary — so the ruled numbers were sound before either
defect was found. Both are now fixed; 45/45 tests green.

1. **A mislabelled confidence interval.** A correctly-computed CI for the *per-input disagreement
   rate* was emitted as a bare `wilson_95` beside `pooled_p_hat_floor` — the headline quantity, which
   had **no interval of its own**. It printed the winner stratum as **p = 0.000 with [0.417, 0.848]**,
   an interval excluding its own point estimate. Pinned by brute-forcing which `(k,n)` reproduced each
   published interval. Now named for what it measures; the floor rate has its own CI.

2. **The M/W divergence counter compared ranks, not decisions** — reporting **6 divergent inputs in a
   stratum holding zero variable inputs.** Self-contradictory, and contrary to the very ruling it
   implemented (*"where the engine is deterministic... M, W and S are identical by construction"*). A
   winner drifting `sage_like`→`principled` counted as divergent though both permit. Now measured on
   block-or-permit with deterministic inputs excluded first, so the invariant holds structurally.

**The second surfaced only because fixing the first forced a re-read of the output.** Recorded
because an instrument feeding a ruled election should carry its own defect history.

---

## Q-S1 — The gate condition is discharged. Do the M/W/S election and R8-D7's sampling policy now proceed?

The 2026-08-30 gate deferred **two items** until Option S's disagreement-rate data was in hand: the
M/W/S floor-semantics election and R8-D7's verdict-confidence sampling policy. **The data now exists,
and has been ruled on.** Nothing else was ever gated on it.

**Recommendation: yes, and the election is now askable in a form it could not take before.** It is no
longer "what is the rate" but a concrete choice on two named inputs, each blocked on 1 of 10 draws:
**does the project prefer a policy that blocks on any adverse draw (W), or one that blocks only on a
majority of adverse draws (M/S)?**

**One distinction we recommend carrying into it.** The **doctrinal** question — what a floor *means*
under sampling — does not need a larger n; it is settled by reasoning about what a floor is for. The
**empirical** claim that consequential variance is rare (3 of 24) **does** need more than three
variable inputs before it bears weight. We recommend the election be made on the doctrine, with the
empirical fraction carried as directional context, not as its basis.

**We do not recommend a winner between M, W and S** — R8 named that re-litigation of what a floor
means under sampling, and reserved it as doctrine, not statistics.

---

## Q-S2 — Does this measurement fill the "near-boundary inputs" gap the live R18 disclosure names as unmeasured?

The live public disclosure (`llms.txt`, and the same text on the other two R18 surfaces) names two
populations and states plainly that only one has been measured:

> *"...near-boundary inputs, whose verdicts sit near the proceed/block boundary, which is the
> population a disagreement rate is properly computed about. ... **no rate has been measured on
> near-boundary inputs as a defined population.**"*

**Option S has now measured 24 real candidate texts on that gate, with per-input distributions**, and
its rejection stratum is closer to a near-boundary population than anything measured before.

**Recommendation: do NOT publish the 0.536 as "the near-boundary rate", and do not treat the gap as
closed.** The rejection stratum is **not a clean near-boundary set** — of its 9 inputs, **4 are
stably blocked and 2 are stably permitted across all ten draws**, and only 3 sit anywhere near a
boundary. Publishing 0.536 against that sentence would substitute a *provenance* category
(rejected-in-August) for a *behavioural* one (sits near the boundary today), which is the same
category error the disclosure's own two-population split exists to prevent.

**What we do recommend disclosing:** that a 24-input measurement on real candidate texts now exists,
with its strata and per-input distributions, and that its winner stratum showed **zero boundary
crossings in 144 draws** while **10 of 15 winners varied on proximity** — a clean demonstration of
the proximity-vs-decision distinction the disclosure already draws with its benign control.

**Asking rather than acting** because this touches three live public surfaces and is an R18 change
needing founder sign-off regardless of the answer.

---

## Founder items

**F-R1 — re-run c15?** *(carried; ruled "the founder's call, not a ruling", with the re-run
recommended.)* c15's `4/4 blocked` rests on 4 draws — the other 6 were outages — so it carries less
weight than its 8 siblings while counting equally in the rejection stratum.
**Recommendation: run it.** 10 calls, **≈$0.17**, credential live with ~520 units unused, `--resume`
skips all 23 others. Then recompute and revoke. **The election is not blocked on it** — if you prefer
accept-and-disclose, the disclosure states that c15 rests on 4 draws and the rejection-stratum Wilson
interval carries that limit.

**F-R2 — the credential.** `sagereasoning:option-s@v1`, live, ~520 quota units unused.
**Recommendation: keep until F-R1 is decided, then revoke immediately.** It has no further purpose
and every day it exists is exposure with no benefit.

---

## What is not being asked

The two instrument defects (fixed, ours). The three result questions (ruled 2026-09-13). The four
pre-run blockers (fixed before the run). The set-size discrepancy (settled at 24 against production).

**The four limits ride every figure above:** the sample is not representative of a future candidate
stream; the strata were selected on the variable being measured; variance is multi-channel; and the
texts were produced under the older engine though today's engine examined them.

*Nothing here licenses a build, activation, publication or spend.*
