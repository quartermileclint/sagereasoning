# Mentor question — the verdict-variance rate: sequencing, presentation, and what may be claimed

**Status:** DRAFT for the founder to relay. Nothing here is licensed by its own authoring.
**Date authored:** 2026-08-30, at the close of the first D6a live sweep.
**Prior binding rulings this builds on (both win over this document):**
`2026-08-30-mentor-ruling-verdict-variance-disclosure-verbatim.md`,
`2026-08-30-mentor-ruling-verdict-variance-rate-location-verbatim.md`.

---

## Why this is being asked now

The 2026-08-30 disclosure ruling set a sequence: the existence-of-variance disclosure is applied
**first** (with the rate stated as unknown), and the rate updates it later. The stated rationale was
that withholding known information while measuring it would itself be a confidence-exceeds-evidence
failure.

**That sequence has been overtaken by events, and the executing session caused it.** The D6a
instrument was built, the founder elected the first live sweep, and the sweep ran on 2026-08-30 —
while the layer-1 disclosure was still unapplied, blocked on its own PR19 review. **The rate now
exists and the disclosure does not.** The signed wording says, in four places and deliberately, that
the rate has not been measured. Applying it unchanged would publish a false statement.

The mechanical fix is obvious and is the founder's. **The four questions below are not mechanical**
— they are about what may honestly be claimed from the measurement now in hand, which is the same
question the original ruling answered for the existence of variance.

---

## Mechanism facts (PR20; each verified first-hand 2026-08-30 against the codebase or the run evidence, not carried from a prior document)

1. **The signed-but-unapplied wording asserts the rate is unmeasured** — `TRUST_RECORD_ENVELOPE`
   §3 (*"Its rate has not been measured"*), `llms.txt` §6(a), `agent-card.json`
   (`"rate": "not measured"`, `"rate_location": "not yet determined"`), api-docs (*"rate not yet
   measured"*). The sign-off package explicitly argues the `agent-card` param is a positive
   machine-read claim rather than an absence. *(Verified by reading the package, 2026-08-30.)*
2. **None of it is live.** No verdict-variance language appears on `llms.txt`, `agent-card.json`,
   api-docs, or `TRUST_RECORD_ENVELOPE`; every apparent match is the unrelated 2026-08-17
   discriminative-range disclosure. *(Grep-verified 2026-08-30.)*
3. **The measured result:** `aggregate_disagreement_rate` **0.12** on `/api/guardrail`, 6
   disagreements over **50** counted outcomes across five borderline probes at K=10, zero transport
   failures, all series complete. Wilson 95% ≈ **5.6–23.8%**. *(Run evidence committed at
   `operations/agent-circles-2026-08/d6a/runs/2026-08-30/d6a-rate.json`.)*
4. **The variance is bidirectional.** Of six flips: three toward blocking (a gate that usually
   proceeds occasionally blocks) and three toward proceeding — the latter all on one probe, a
   force-push text the gate refuses 7 times in 10 and **permits 3 times in 10**. The single named
   rate does not distinguish these. *(Computed from the run records, 2026-08-30.)*
5. **The clean anchor also varied.** A deliberately benign action ("add a unit test before merging")
   returned `principled` once in ten instead of `deliberate` — but `proceed` held on all ten. The
   floor anchor was perfectly stable. So **variance appears across the scale; what distinguishes the
   borderline class is that its variance crosses the `proceed` boundary.** This fired the
   instrument's own calibration warning, which is recorded as a falsification rather than resolved
   by re-partitioning. *(Run evidence, 2026-08-30.)*
6. **`llms.txt:118` currently reads "identical inputs produce identical assessments"**, using
   `input` — the actual request-field name on `/api/reason`. It is defensible as scoped to the
   deterministic Layer-2 pass, and the three sibling determinism claims (`:148`, `:321`, `:399`) are
   each explicitly scoped to "from the signed assessment" / "from `extraction`". *(Read 2026-08-30.)*
7. **The rate is path-specific.** Measured on `/api/guardrail` only; the trust record aggregates
   `/api/reason`-derived events and no rate has been measured there. Unchanged from the prior ruling.

---

## The questions

### Q1 — Sequencing, now that the order has inverted

The ruling's two-step (publish "variance exists, rate unknown", then update with the rate) rested on
the reasoning that withholding known information is dishonest. The rate is now known **before** the
first step has been taken.

**Does the disclosure now go up once, already carrying the measured rate? Or is the two-step
preserved — publish the interim "not measured" wording, then immediately update it?**

The executing session sees no honesty argument for publishing a statement known to be false at the
moment of publication, but the ruling's sequencing was explicit and this session is not entitled to
collapse it unilaterally.

### Q2 — Whether a single rate may be published when the variance is bidirectional

Mechanism fact 4. "12%" pools two behaviourally opposite phenomena: a gate that occasionally blocks
what it would usually allow (cost: friction) and a gate that occasionally allows what it would
usually block (cost: the gate fails at its purpose). The disclosure's stated function is to let a
recipient calibrate how much weight to place on a verdict.

**Does honest disclosure require the rate be decomposed by direction — or is a single aggregate rate
sufficient, with the asymmetry left to the evidence records?**

Bearing on it: n is three events per direction. Enough to establish that both occur; not enough to
characterise their relative frequency. A decomposed figure risks implying precision that is absent;
an aggregate risks implying symmetry that is also absent.

### Q3 — Point estimate versus interval

The 95% interval is **5.6–23.8%** — the upper bound is roughly four times the lower. The prior ruling
approved the form *"the floor-flip rate was approximately N%"* as honest and calibrating, but that
was written before any interval existed.

**May a point estimate ("approximately 12%") be published on the public surfaces, or must the
interval ride it?** The general doctrine — what is attested must be stated at the confidence level
the evidence supports — appears to the executing session to bear directly on this, but the
executing session also notes that an interval is harder for a recipient to use.

### Q4 — What the rate is *about*, after the anchor falsification

Mechanism fact 5. The probe set asserted a "borderline class" and the rate is scoped to it. The clean
anchor was supposed to be the fixed point that boundary is measured against, and it moved — on
proximity, though not on `proceed`. The class labels were frozen in code before the run precisely so
this could not be repaired after the fact, and it has not been.

**Two parts.** (a) May the published rate be described as a rate *for an input class*, given the
class's own anchor did not hold on the dimension the rate is computed over? (b) The sharper finding
is that variance is **not** a borderline-class property — it appears on benign inputs too — and what
distinguishes the borderline class is that its variance **crosses the decision boundary**. Should the
disclosure say that, rather than the simpler "verdicts vary"? The executing session believes the
second formulation is both more accurate and more calibrating, but it is a change to what the
disclosure claims, not a rewording.

---

## What is NOT being asked

- **No weighting question.** Weights remain BLOCKED. No aggregation rule over the distribution is
  proposed, sketched, or implied here, and `modal_outcome` is used in the instrument solely as a
  dispersion reference. Nothing in this document bears on the deferred M-vs-W ruling in either
  direction.
- **No change to what the gate does.** D6a is MEASURE-only and outside the loop's path (Q1 holds:
  the loop proposes, it never executes). Nothing consumes the rate as a signal.
- **Not the `llms.txt:118` fix.** Mechanism fact 6 is a defect for the founder and the R18 pass, not
  a question of doctrine. It is named here only because it means the disclosure work is not purely
  additive.

---

*Authored by the executing session at the close of the first D6a sweep. The two prior verbatim
rulings remain binding and win over anything stated here.*
