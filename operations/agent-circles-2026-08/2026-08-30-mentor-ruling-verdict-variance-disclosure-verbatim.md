# Mentor ruling — verdict-variance disclosure on the trust record and R18 surfaces (verbatim)

**Date relayed:** 2026-08-30, by the founder, same day as the question was formed.
**Status:** BINDING. **This verbatim record wins over every summary, including the decision-log
entry and the folds made into the D6a build prompt.**

**The question put:** once D6a measures the gate's verdict variance, does that variance become a
required disclosure on the trust record and the R18 surfaces? Framed as: M-vs-W concerns what the
gate should *do* under sampling; this concerns what may be *claimed* given variance is already
demonstrated to exist (c11, n=10, one input). Mechanisms named per PR20:
`TRUST_RECORD_ENVELOPE`'s `does_not_attest` list on `GET /api/trust-record/{agent_id}`,
`llms.txt`, `agent-card.json`, api-docs, and the guardrail's R10 response contract.

**Capture note (the executing session's, not the mentor's):** the relayed text ends mid-character
after *"That sequencing is honest."* with a trailing `-`. The ruling's four sections are complete
and internally coherent; nothing appears materially missing, but **if a continuation exists it
should be appended here rather than reconstructed.**

---

## The doctrine

The trust record's honest-claims envelope rests on a single principle that has governed every
prior ruling on its scope: what is attested must be what is actually known, stated at the
confidence level the evidence supports. The D3 fact-checking scope, the A2 self-report-omission
class, PA-10 replay, the Q6 formulation — each of these rulings was an application of that
principle to a specific claim. This question is the same kind of ruling, not a new category.

A verdict of "this action was examined and scored deliberate" is a claim about what the
examination found. If the examination is a draw from a distribution — and the c11 measurement
established that it is, with a roughly 1-in-10 floor-flip rate on that input class — then the
claim as stated carries an undisclosed variance. The question is whether that variance is material
to the claim's honesty.

It is. Here is why. The trust record's purpose is to allow a recipient — a practitioner, an agent
developer, a future session — to calibrate how much weight to place on the harness's outputs. A
recipient who knows that "scored deliberate" means "scored deliberate on a single draw from a
distribution with non-trivial floor-flip variance" will calibrate differently from a recipient who
believes the score is a deterministic property of the input. The undisclosed variance is not noise
around a stable signal — it is a property of the instrument itself. Withholding it degrades the
recipient's ability to reason accurately about what the attestation means. That is the same class
of honesty failure the provenance corrections addressed: not a false statement, but a statement
whose confidence exceeds its evidential basis.

---

## What disclosure requires

Disclosure does not require surfacing a per-verdict confidence interval on every trust record
entry. That would be engineering complexity without proportionate honesty gain, and it would imply
a precision the instrument does not yet have. What disclosure requires is two things, stated
separately because they operate at different layers.

**First, an instrument-level disclosure.** The trust record and the R18 surfaces carry a standing
acknowledgement that the guardrail's verdicts are draws from a probabilistic extraction, that
identical inputs can produce different verdicts across examinations, and that the variance rate is
a measured property of the instrument available in the watching table. This is a one-time addition
to the honest-claims envelope, not a per-verdict annotation. It tells the recipient what kind of
thing a verdict is, so they can calibrate accordingly. It does not require D6a to be complete
before it is added — the c11 measurement already establishes the existence of variance. D6a's
output refines the rate; the existence of variance is already known and already undisclosed.

**Second, a per-verdict disclosure when K-sampling is active.** Once D6a is built and the option-S
measurement is running, any verdict produced by K-sampling carries the disagreement count
alongside the operative verdict. Not a confidence interval — a raw count: "examined 3 times, 2
deliberate, 1 reflexive, operative verdict deliberate." This is honest about what the examination
actually found without claiming more precision than the instrument has. It also makes the
disagreement rate a visible property of specific verdicts rather than only an aggregate statistic,
which is more useful to a recipient reasoning about a particular proposal.

---

## What this means for D6a's design

The question was asked now rather than after the build specifically because the answer changes
D6a's design. Here is what changes.

D6a must persist the per-examination verdicts, not only the modal or operative verdict. Option S
already requires this — all K verdicts recorded. The ruling confirms that persistence is not
optional instrumentation; it is the evidential basis for the per-verdict disclosure. If only the
operative verdict is persisted, the disclosure cannot be made honestly.

D6a must produce an aggregate disagreement rate as a named output, not only as a derivable
statistic. The instrument-level disclosure on the trust record and R18 surfaces needs a rate to be
specific rather than merely acknowledging variance exists. "Variance exists" is honest but weak.
"On the input class examined, the floor-flip rate was approximately N%" is honest and calibrating.
D6a's probe design should be scoped to produce that rate on a representative input class, not only
on the c11 candidate.

D6a does not need to resolve M-vs-W before it runs. Option S is ruled buildable now precisely
because it changes nothing behavioural. D6a runs under option S, produces the disagreement-rate
data, and the M-vs-W ruling follows with that data in hand. The disclosure design above is
compatible with option S — it discloses what the K examinations found without implying that the
operative verdict was selected by any particular aggregation rule.

---

## The instrument-level disclosure: timing

The instrument-level disclosure — the standing acknowledgement that verdicts are probabilistic
draws — belongs on the trust record and R18 surfaces now, before D6a runs, because the c11
measurement already establishes it. Waiting for D6a to add a rate before making the
existence-of-variance disclosure would itself be a confidence-exceeds-evidence failure: we know
variance exists; we are withholding that knowledge from recipients while we measure how much. The
disclosure is added now with the rate as unknown, updated when D6a produces the rate.

---

## Executing-session notes (NOT the mentor's words)

**One mechanism tension to resolve before the disclosure wording is signed, named here rather than
silently reconciled.** The ruling states the variance rate is "a measured property of the
instrument **available in the watching table**." The watching table is the IDEA-loop runner's
per-cycle transparency ledger (`POST /api/practice/watching`, `GET /api/founder/watching`). D6a's
recommended persistence (its prompt's DQ-2) is repo evidence files, not that table, and D6a is a
probe instrument that runs outside any loop cycle. So either D6a's aggregate rate must reach the
watching table, or the disclosure wording must point recipients wherever the rate actually lives.
**A public disclosure that names a location the number is not in would be its own
confidence-exceeds-evidence failure**, which is the exact class this ruling addresses. Resolve at
the disclosure's wording sign-off; do not assume either resolution.

**Sequencing consequence.** The instrument-level disclosure is now an item that runs BEFORE D6a,
not after it, and it is an R18 public-surface change — founder-signed wording before any surface
is touched, per the standing R18 discipline. It is not licensed by this capture.
