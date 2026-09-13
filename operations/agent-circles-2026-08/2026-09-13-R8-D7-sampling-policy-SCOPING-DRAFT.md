# R8-D7 — the verdict-confidence sampling policy: SCOPING DRAFT

> **⚖️ RULED 2026-09-13, same day, on the relay this draft fed** (verbatim, canonical:
> `operations/trust-layer-2026-07/2026-09-13-mentor-ruling-eight-questions-w2-work-s11d2-sequencing-r8d7-under-w-verbatim.md`; wins over this
> document). **Q-M5:** R8-D7's scope is AMENDED — worst-of-K applies to the would-be-winner
> population only; the rejection re-election fixpoint is removed; the winner dethronement path
> remains (§5 Q1 answered). **Q-M6:** K is a cost election; K=1 is W at its minimal expression
> (§5 Q4 answered; Option A is W at K=1). **Q-M7:** measure first on the live loop — Option E is the
> recommended next act before any build beyond K=1 disclosure (§5 Q6 answered). **Q-M8:** a sampled
> verdict discloses K, the floor count and the worst-draw rule, never a confidence scalar; the R18
> "one call as one draw" sentence is amended, under founder sign-off, only when K>1 is served
> (§5 Q7 answered). ~~§5 Q2, Q3, Q5 and Q8 remain unput.~~ **No build is licensed.**
>
> **⚖️ ALL EIGHT OF §5 ARE NOW ANSWERED — this block's last sentence was superseded within hours of
> being written, twice.** (i) **Q5 and Q8 were answered the same day by the R11 seven-question ruling**
> (`operations/agent-circles-2026-08/2026-09-13-mentor-ruling-R11-seven-questions-verbatim.md`):
> **Q-R11-A2** — *"Gate only. The sampling policy does not reach the consult path at this stage…
> If the consult path comes into scope in future, it is a separate design with its own measurement"*
> (§5 Q5); **Q-R11-A3** — *"The defect does not bind the new capture by construction"*, the `option-s/`
> fix remaining reserved for a session that has not read the Option S close (§5 Q8).
> (ii) **Q2 and Q3 were then relayed and ruled the same evening** (verbatim, canonical:
> `operations/trust-layer-2026-07/2026-09-13-mentor-ruling-consolidated-six-questions-w2-clock-window-membership-verbatim.md`):
> **§5 Q2 — NO, a provenance-triggered stratum is a CATEGORY ERROR.** *"It is a feedback loop that
> amplifies the initial classification regardless of whether the input's actual character has
> changed."* Q-R11-A1 does **not** settle the trigger class generally — *"a trigger is admissible only
> on a measured relation between the trigger signal and the latent floor. Provenance — prior rejection
> — is not a measured relation to a latent floor. It is a record of a prior classification"* — but this
> specific trigger is ruled out on the same grounds.
> **§5 Q3 — NO confidence signal before the near-boundary population is measured.** It fails on all
> three grounds simultaneously (Q-S2's unclosed gap; Q-M8's scalar prohibition; the Prerequisite
> Criterion). *"Option C is unavailable until Deliverable A's cross-tabulation exists and shows a
> measured relation between a first-draw signal and whether the input carried a latent floor. No
> first-draw signal is admissible on doctrine alone as a basis for a confidence output."*
> **Nothing in §5 is now unput. No build is licensed by any of it.**

**DRAFT — FOR FOUNDER ELECTION AND MENTOR QUESTIONS. This document proposes no build, licenses no
build, and elects nothing.** It sets out what R8-D7 asked for in its own words, what the Option S data
licenses and does not, the shapes a policy could take with what each would need to be true and cost,
how the elected floor semantics (W, worst-of-K) composes with each, the Prerequisite Criterion check,
and the questions of principle that must reach the mentor before any design is adopted.

**Authored 2026-09-13 (from `date`)** by an autonomous session (`sagereasoning-dd [856dc7]`), tier
`governance` / documents. **Standing facts this document rests on and does not move:** W is the
elected floor semantics under sampling, **as doctrine** (Exchange 5 of
`2026-09-13-mentor-rulings-option-s-result-and-F-R1-verbatim.md`); **no sampling layer exists on the
live gate**; *"any implementation of worst-of-K in a live path is its own `code-critical`
founder-walked step"*; weights remain BLOCKED; the near-boundary R18 gap is NOT closed (Q-S2).

**⛔ Disqualification, stated.** This session read the Option S close and the rulings. It is therefore
disqualified from touching `complete_series()` in `option-s-runner.py`, did not open that file, and
describes the instrument's record-vs-outcome counting below **only in the ruling's own words**.

**Sources (verbatim wins over every summary, including this one):** R8 §4.9, §5.3, §5.4, §7 #5, §11,
§11b, §12 (`2026-08-30-standing-runner-design-R8.md`); R9 §11 (R9-D10); the 2026-08-30 floor-semantics
ruling (`2026-08-30-mentor-ruling-R8-producer-floor-semantics-verbatim.md` Q3); the 2026-09-04
item-level gate ruling; the five Option S exchanges (2026-09-13 verbatim); the M/W/S election document;
the D6a rulings (`2026-08-30-mentor-ruling-pooled-sweep-n100-verbatim.md`;
`2026-08-31-mentor-ruling-directional-split-probe-composition-verbatim.md`); the verdict-variance
disclosure as published on `website/public/llms.txt` (the "What 'deterministic' scopes to" paragraph
and the trust-record "verdict determinism" item); `manifest.md` §"The Prerequisite Criterion".

---

## 1. What R8-D7 asked for, in its own words

R8 §5.3 opened the question: *"what confidence does a single verdict carry when it is load-bearing for
a cycle outcome? Today: a single sample decides — a 1-in-10 extraction event can reject a candidate
that nine other examinations of the same text would elect (and its inverse: a single lenient sample
could pass what most examinations would floor)."*

Its designed policy, before the PR19 fold, was:

- **Scope:** *"decision-bearing verdicts only — the would-be winner's verdict and any guardrail
  rejection. Non-decisive candidates keep single examination (cost discipline)."*
- **Rule:** *"K = 3 examinations of the byte-identical candidate text; the recorded verdict is the
  median rank of the three… all K per-sample verdicts and floor attributions persist alongside the
  recorded verdict (basis disclosure: `verdict_basis: median_of_3`, samples attached)."*
- **Procedural symmetry:** *"K-sampling applies to the decision-bearing set regardless of direction…
  A policy that re-runs only adverse verdicts is retry-shopping and is ruled out by this design in
  advance."*

The PR19 fold then withdrew the symmetry-makes-it-neutral claim — *"Procedural symmetry does not
produce symmetric effect. Median-of-K suppresses whichever verdict is the minority on a given input"*
— computed the direction of effect on the only measured class (p̂ = 0.1: median-of-3 → 0.028,
worst-of-3 → 0.27), named the doctrinal conflict (*"Median-of-K at the sampling layer outvotes exactly
the conservative minority extraction state that the doctrine one level down says should bind"*), and
**re-stated R8-D7 as a named election** between M, W and S, *"recommended as a mentor question rather
than a build-session election."*

R8-D7 also carries, in its own text:

- **Iteration semantics (the fixpoint):** *"a rejection whose resampled verdict recovers re-enters the
  field; a winner whose verdict drops is dethroned… The procedure must therefore be a fixpoint:
  re-elect after each resampled change, K-sample any candidate that newly holds the winner slot, and
  repeat until the election is stable"*; cost *"worst-case ~2 extra calls per candidate that ever
  becomes decision-bearing"*.
- **What it is not:** *"not a weighting function… not a change to the ordinal scale… not active until
  elected."*
- **The Prerequisite Criterion, applied in advance:** *"Under Option S the policy is unambiguously
  measurement… and passes. Under Options M and W it changes what the gate records as its verdict, so
  the criterion's question is live… W carries the… risk of recording examination friction that no
  additional examination produced. Neither M nor W passes on the strength of the first draft's
  symmetry argument, which is withdrawn — passage depends on the disclosure riding the record."*
- **The single-backward-edge evaluation** (R8 §4.9): the would-be-winner path is *"a genuine
  gate→election→gate path within a single cycle"*, evaluated as *"an examination refinement loop, not
  an information-integration feedback path"*; **confirmed at R9-D10** with one precision: *"under M or
  W the recorded verdict changes, and the recorded verdict is what flows on that existing edge — so a
  non-S policy changes what flows on the edge, not the number or topology of edges."*
- **Telemetry first** (R8 §7 #5): the random tie-break is retained *"until the runner's build elects
  R8-D7 — with telemetry first, so the change's effect is measurable against a recorded baseline."*

The 2026-08-30 ruling (Q3) locked the framing: *"a doctrinal question about what a floor means under
sampling, not a statistics choice… whether the floor doctrine — weakest-link, conservative… applies
per-examination or per-judgement."* The 2026-09-04 ruling made the gate item-level: Option S's data
attaches to *"two items only — the M/W/S floor-semantics election and R8-D7's verdict-confidence
sampling policy"*, and added that Path A's output is *"the rate on a CLOSED RUN's candidate population, not on a
live running loop."*

---

## 2. What the Option S data licenses, and what it does not

**The measurement** (240 calls, 24 inputs × K=10, 2026-09-12, `/api/guardrail` at the default band;
228 verdicts, 12 `engine_unavailable`, 0 `tier1_pause`):

| stratum | inputs | draws | floors | rate | Wilson 95% |
|---|---|---|---|---|---|
| guardrail rejections — **operative** (Q-R2) | 9 | 84 | 45 | **0.536** | [0.430, 0.638] |
| winners | 15 | 144 | **0** | 0.000 | [0.000, 0.026] |
| pooled — disclosed, **not used** | 24 | 228 | 45 | 0.197 | [0.151, 0.254] |

**What it licenses (ruled):**

- **The determinism finding is decision-relevant (Q-R1).** 21 of 24 inputs are deterministic — in the
  election document's words, *"every one of their ten draws returned the same block-or-permit
  decision"*; the ruling itself states the complement, *"that is 3 of 24 inputs."* *"Where the engine is deterministic, there is no
  uncertainty to handle — M, W, and S are identical by construction."* The variable fraction 3/24 =
  0.125 [0.043, 0.310] is *"directional, not precise, on a thin basis."*
- **The rejection-stratum rate is the operative figure (Q-R2)**; the pooled rate *"describes no
  actual input in the set."*
- **The election itself (Exchange 5): W.** *"A floor is a ceiling on permitted risk. It is not a
  majority signal about an input's character… W is the sampling-layer analogue of the weakest-link
  minimum the engine already applies."* And on the data: *"The engine is not producing floors
  randomly. On inputs where floors appear, they appear at a rate that reflects something real about
  the input."*
- **S is rejected on its own ground:** first-verdict-operative, *"a lottery whose outcome is the first
  sample"*; *"the absence of a policy, dressed as one."*
- **The proximity-versus-decision distinction is now empirically demonstrated on real texts** (Q-S2):
  10 of 15 winners varied on proximity; 0 of 144 winner draws blocked.

**What it does not license (ruled, and carried as limits on every figure):**

1. **It does not close the near-boundary gap (Q-S2).** *"The rejection stratum is not a clean
   near-boundary set. Four of its nine inputs are stably blocked across all ten draws; two are stably
   permitted. Only three sit anywhere near a boundary."* The strata are labelled *"by where the inputs
   came from, not by where their verdicts sit"* (the published disclosure's words). **No rate has been
   measured on near-boundary inputs as a defined population.**
2. **Not representative** of a future candidate stream; **selected on the measured variable**;
   **multi-channel variance** (a floor count does not say which floor fired); **engine era** (texts
   produced under an older build).
3. **Two thin inputs** rest on 4 verdicts rather than 10 (c15, a rejection; cycle 17, a winner) — the
   outages fell entirely on those two. *"The rejection-stratum interval carries this limit."*
4. **c11 did not reproduce** (1/10 → 0/10); *"within the noise envelope"*; *"No conclusion about drift
   is warranted."*
5. **The closed-run-population limit** (2026-09-04 Q3) rides the data: it is a rate on 24 frozen
   candidates, not on a live loop.
6. **It measures `/api/guardrail` only.** The published disclosure: *"No rate has been measured on
   `/api/reason`, and this one does not transfer to it."*
7. **The instrument counts records, not outcomes, when judging a series complete** — in the ruling's
   words: *"A series in which most calls failed registers as a complete measurement and thereby blocks
   its own repair… The correct fix is to count counted outcomes in `complete_series()`, but that fix
   should be made in a session that does not know which input it affects."* This session is
   disqualified from that fix (§0) and says nothing further about the mechanism.
8. **The election elects doctrine, not a build.** Nothing in the data or the ruling pre-approves a
   change to a live safety gate.

**A fact the data makes visible that a policy must respect:** the election's entire practical content
was three inputs (c6, c9, c16). On c6 and c9 a single draw in ten blocked; on c16 a single draw in ten
permitted. **A sampling policy is a policy about 3 of 24 inputs of this kind; on the other 21 it
changes nothing whatever K is.**

---

## 3. The shapes a policy could take — each with what it would need to be true and what it would cost

Cost figures use the ruling's own price for the Option S instrument (*"10 calls at approximately
$0.17"* ≈ $0.017 per call; the 240-call run ≈ $3.40 ≈ $0.014 per call). **That is the out-of-band
instrument's price on the gate. The live gate's own metering (`X-Loop-*` headers, CI-10) is the
authoritative per-call cost and was not read for this document.** Latency per gate call is not in
any source read here and is left unstated rather than guessed.

Under W the recorded decision is **the most conservative decision among the K draws**. For an input
whose per-draw floor probability is p, the recorded-floor probability under worst-of-K is 1 − (1−p)^K:

| p (per draw) | K=1 | K=3 | K=10 |
|---|---|---|---|
| 0 (every winner measured) | 0 | 0 | 0 |
| 0.1 (c6, c9) | 0.10 | 0.27 | 0.65 |
| 0.536 (the rejection stratum's pooled per-draw rate — a stratum figure, not any one input's) | 0.54 | 0.90 | 0.9995 |
| 0.9 (c16) | 0.90 | 0.999 | ≈1 |

Two consequences follow from the arithmetic alone, before any design: **under W, K only ever
tightens; and W makes any adverse first draw final, so re-examining an already-blocked verdict can
never change it.** That bears on Option B below.

### Option A — no sampling (the live gate as it is)

**What it is.** One draw per submission; the published disclosure already tells a recipient: *"If a
verdict is consequential to you, treat one call as one draw — re-submitting is a legitimate way to see
whether the reading is stable."*

**What would need to be true.** That the project accepts single-draw decisions on the ~1-in-8
variable inputs, with the disclosure carrying the variance. Note that K=1 is *consistent* with W as
doctrine (the worst of one draw is that draw) — **so "no sampling" is not a rejection of W; it is W at
K=1.** Whether the elected doctrine *obliges* K>1 anywhere is a question of principle (§5, Q4).

**Cost.** Nothing new. **Composition with W:** trivial.

**Prerequisite Criterion.** Not engaged — no new practitioner-facing output.

### Option B — sample only on the rejection stratum

Two readings of "rejection stratum" exist and they behave differently:

**B-i, verdict-triggered:** re-examine when the first draw blocks. **Under W this is inert** — an
adverse draw stands regardless of later draws, so the resampling can change nothing. It is also the
shape R8 *"ruled out… in advance"* as retry-shopping under M (where it would change outcomes). Under
W it is harmless and pointless; under any non-W semantics it is forbidden. **Not a candidate.**

**B-ii, provenance-triggered:** re-examine K times any input the gate has *previously* rejected (the
Option S stratum, made live). **What would need to be true:** a per-input (or per-credential)
rejection history readable at examination time — the trajectory overlay on `/api/reason` is
credential-scoped, not text-scoped, and the gate carries no such read today (unverified beyond the
sources read here); a definition of "previously rejected" that does not itself select on the measured
variable (limit 2 above is exactly this selection); and a reason why a stratum defined by provenance
rather than by verdict position deserves more examination — the Q-S2 ruling's point that provenance
is not a behavioural category cuts against it. **Cost:** K−1 extra calls on the rejection stratum
only (for 9 of 24 inputs at K=3: 18 calls ≈ $0.31; at K=10: 81 calls ≈ $1.38, on the instrument's
price). **Composition with W:** on the measured stratum, W at K=3 would record a floor on ≈90% of
rejection-stratum draws and at K=10 on ≈99.95% — **W applied only to previously-rejected inputs
converges on "once rejected, always rejected"** (the four stably-blocked inputs are already there;
the three variable ones would follow). Whether that is a floor or a ratchet is a question of principle
(§5, Q2). **Prerequisite Criterion:** the stratum label would be a practitioner-facing classification
("previously rejected") produced from history, not from examination of this submission — engaged, and
the question is live.

### Option C — sample on a confidence signal

**What it is.** Re-examine K times when some signal on the *first* draw says the verdict is uncertain.

**What would need to be true.** A signal exists on the gate's output that *predicts* per-input
variance. Candidates the record names: proximity distance to the band's threshold (the published
disclosure says *"the proximity score moves while the block-or-permit decision does not"*, which is
evidence a near-threshold proximity is the natural candidate — **and also exactly the near-boundary
population no measurement has characterised**); `is_kathekon: null` (a sparse extraction, which the
gate already floors conservatively); the corroboration report's `uncorroborated` findings;
`proximity_floors.basis`. **For any of these to be a confidence signal, a measured relation between
the signal and the per-input disagreement rate would have to exist. It does not.** Option S measured
disagreement per input and strata by provenance; it did not measure disagreement against any
first-draw signal. **Cost:** unknown until the trigger rate is known; bounded above by Option D.
**Composition with W:** W over the triggered set; the triggered set's membership is where the whole
question lives. **Prerequisite Criterion:** **engaged, and the sharpest case.** A policy that emits a
confidence-looking output — "this verdict is uncertain / confident" — computed from a signal whose
relation to variance has never been measured produces *"outputs that resemble the destination without
building the prerequisite"* and is **ruled against on this criterion, not noted as suboptimal.** The
only form of Option C that could pass is one that measures first (an Option-S-style instrument keyed on
the candidate signal, with the near-boundary population defined) and designs second.

### Option D — K everywhere on decision-bearing verdicts (R8-D7's own scope), under W

**What it is.** R8's scope with the elected semantics: the would-be winner and every rejection are
examined K times on byte-identical text; the recorded verdict is the worst of K; every draw and its
floor attribution persists; `verdict_basis: worst_of_K`.

**What would need to be true.** (i) A live path exists to perform K examinations of one candidate and
persist all K — none does; `/api/guardrail` is one call, one verdict, and the runner is not in this
repository (R8 §12.3). (ii) The runner's election is re-run to a fixpoint (R8's iteration semantics)
— **but under W the fixpoint is one-directional**: a resampled rejection can never recover, so *"a
rejection whose resampled verdict recovers re-enters the field"* cannot happen; only *"a winner whose
verdict drops is dethroned"* remains. The fixpoint terminates faster and the field can only shrink.
Whether R8's would-be-winner path survives that asymmetry unchanged is §5 Q1. (iii) The R9-D10
precision holds: the recorded verdict is what flows on the existing backward edge, so W changes what
flows there. (iv) A recorded baseline exists first (R8 §7 #5's telemetry-first).

**Cost.** Per decision-bearing verdict: +2 calls at K=3 (≈ $0.03), +9 at K=10 (≈ $0.15), on the
instrument's price. R8's own worst case for a 20-cycle run at K=3 was ≈240 extra calls (≈ $3.55 at
its price). On the measured population, **the spend buys a changed decision on ~3 of 24 inputs**; on
the other 21 it buys confirmation.

**Composition with W.** Direct — this is W. On the measured winners it changes nothing (0/144). On the
measured rejections it moves the recorded-floor rate from 0.54 to ≈0.90 (K=3) or ≈0.9995 (K=10).

**Prerequisite Criterion.** Engaged (the recorded verdict is practitioner-facing). R8's own condition
governs: *"passage depends on the disclosure riding the record"* — every draw attached, the basis
named, and (W's specific risk) no reading of the K−1 permitting draws as evidence of anything. **A
worst-of-K verdict that carries only the worst draw and a "confidence" scalar would fail; one that
carries all K draws, the basis, and no scalar is the shape R8 said could pass.**

### Option E — measure first (Option-S-shaped, on the live loop, before any policy)

Named because every option above that changes a decision rests on a population that has not been
measured (the near-boundary population; the live-loop population; `/api/reason`). This is not a
sampling policy; it is the prerequisite for one. **Cost:** the Option S price for whatever K and
population is chosen; a credential; a founder-walked run. **Prerequisite Criterion:** passes by
construction — it is measurement.

---

## 4. The Prerequisite Criterion check, stated explicitly

`manifest.md`: *"any design proposal that claims to produce practitioner-facing outputs — scores,
recommendations, diagnoses, virtue assessments — is evaluated against this criterion before adoption.
The question asked is: does this design build adequate ideas through examined assent, or does it
produce outputs that resemble the destination without building the prerequisite? If the latter, the
design is ruled against on this criterion, not merely noted as suboptimal."*

Applied to this scoping:

- **Any policy that emits a confidence value** (a scalar, a band, a label such as "uncertain") **for a
  verdict is ruled against unless the measurement that relates the value to observed variance exists
  and rides the record.** Today that measurement exists for one provenance-defined population on one
  endpoint, at K=10, on 24 frozen inputs, and for no first-draw signal at all. **So today no policy
  that outputs confidence can pass.**
- **A policy that emits the K draws, the basis (`worst_of_K`), and the floor attributions, and no
  confidence value, is measurement riding a decision** — the shape R8 §5.3 said could pass under W
  *"depending on the disclosure riding the record"*. It still changes what the gate records, so the
  criterion's question is live and is not settled by this document.
- **Option S-shaped measurement passes by construction and changes nothing.**

---

## 5. Questions of principle that must reach the mentor before any design is adopted

None is answered here. Each is stated so it can be put.

1. **Does R8-D7's scope survive W?** R8 scoped sampling to *"decision-bearing verdicts only"* with a
   symmetric fixpoint (rejections can recover; winners can be dethroned). Under worst-of-K a rejection
   can never recover. Is the would-be-winner refinement path still the design, now that it can only
   remove candidates from the field, or does W collapse R8-D7's scope to "K on the would-be winner
   only"? (R9-D10's precision — W changes what flows on the existing edge — bears on this.)
2. **Is a provenance-triggered stratum (Option B-ii) a legitimate live trigger?** Q-R2 accepted the
   pre-declared stratum for the *election* because the classes were declared before the run. A *live*
   policy that examines previously-rejected inputs harder selects on the measured variable (limit 2)
   and, under W, converges on a ratchet. Is that a floor (a ceiling on permitted risk, applied to an
   input with known adverse history) or a category error of the Q-S2 kind (provenance standing in for
   behaviour)?
3. **Can a confidence signal be designed before the near-boundary population is measured?** Q-S2
   ruled the gap not closed. Option C needs a measured signal-to-variance relation that does not exist.
   Is the mentor's ruling that Option C is unavailable until that measurement exists, or that some
   first-draw signal (proximity distance to the threshold; `is_kathekon: null`) is admissible on
   doctrine alone?
4. **Does W as doctrine oblige K>1 anywhere?** K=1 is W trivially. The election said what the floor
   *means* under sampling; it did not say sampling must occur. Is K a cost election for the founder,
   a doctrinal minimum, or — given 21 of 24 inputs are deterministic — is "no sampling, single draw,
   disclosure carried" (Option A) fully consistent with the elected doctrine?
5. **Scope of surface.** The measurement is on `/api/guardrail` and does not transfer to
   `/api/reason` (published). Does any sampling policy reach the consult path, which the trust ledger
   accumulates from, or only the gate? (PR20: the mechanisms a ruling would land on are the gate's
   default band, ADR-010 §4's floor semantics, the guardrail's blocking behaviour, and — if the consult
   path is in scope — `credential-completed` accumulation.)
6. **Telemetry first.** R8 §7 #5 retained the tie-break *"with telemetry first, so the change's
   effect is measurable against a recorded baseline."* Does the same discipline require an
   Option-S-shaped measurement **on the live loop** (Option E) before any W policy lands, given the
   closed-run-population limit the 2026-09-04 ruling attached to the existing data?
7. **The R18 boundary for a sampled verdict.** The published sentence *"treat one call as one draw"*
   would become false for a worst-of-K verdict. What must a sampled verdict disclose — every draw,
   the basis, the floor attributions — and what must it never carry (a confidence scalar)? This is
   the Prerequisite Criterion question put in R18 terms.
8. **The instrument defect.** Whether the reserved `complete_series()` fix must land before any
   further Option-S-shaped measurement is run — put here only so the sequencing is the mentor's; this
   session is disqualified from the fix and takes no position on its content.

---

## 6. What this document does not do

It does not propose a build. It does not choose among A–E. It does not re-open the election, the
operative figure, or any limit. It does not treat 3 variable inputs as a measurement. It does not
touch `option-s-runner.py`, `/api/guardrail`, or any `GUARD_RE` file. **Any implementation of any
option is its own `code-critical`, founder-walked, PR19-reviewed step, licensed by nothing here.**

**D2 remains blocked. The S11 flip remains REFUSED. Weights remain BLOCKED. The 0h call remains the
founder's.**
