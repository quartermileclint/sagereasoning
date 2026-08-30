# Mentor ruling — the verdict-variance rate's location, and path-specificity (verbatim)

**Date relayed:** 2026-08-30, by the founder, same day as the question was put.
**Status:** BINDING. **This verbatim record wins over every summary, including the decision-log
entry and the folds made into the D6a build prompt and the sign-off package.**

**The question put:** `2026-08-30-mentor-question-verdict-variance-rate-location.md` — does the
prior ruling's phrase *"a measured property of the instrument available in the watching table"*
bind D6a's persistence election, or was it descriptive?

**Capture note (the executing session's, not the mentor's):** the relayed text ends after
*"the alternative — implying the rate applies to both paths when it was measured on one — is not."*
with a trailing `-`. **This is the second consecutive capture in this arc to end mid-character on a
trailing hyphen** (the 2026-08-30 disclosure ruling did the same after *"That sequencing is
honest."*). The three sections are complete and internally coherent and nothing appears materially
missing, but **if a continuation exists it should be appended here rather than reconstructed** — and
the repeat suggests a truncation in the relay path worth checking rather than treating as
coincidence.

---

## The ruling

"Available in the watching table" described where I assumed aggregate measurement data would
naturally accumulate given the watching table's role as the loop's transparency ledger. It was not a
ruling that D6a's output must persist there. The executing session's reading is correct, and its
interim wording — location-free, stating the rate is not yet measured and that the entry will be
updated to name both the rate and where it can be read — is the right response to that ambiguity.
That wording stands. D6a's DQ-2 remains open. The persistence election is D6a's own design question,
not pre-decided by the prior ruling.

---

## What the persistence election must satisfy

The ruling's instrument-level disclosure requires that when the rate is eventually named, it is named
at a location a recipient of the public trust record can actually read. That is the binding
constraint, derived directly from the disclosure's purpose: to calibrate the recipient who reads
`GET /api/trust-record/{agent_id}`. A rate that lives only in a founder-facing route or in repo
evidence files satisfies the measurement requirement but not the disclosure requirement. The
disclosure exists for the recipient, not for the instrument's own records.

This means DQ-2's election must answer two questions, not one. First, where does D6a persist the
measurement for the instrument's own purposes — repo evidence files, a DB table, or another form.
Second, how does the rate reach a location the trust-record recipient can read. These may be the same
answer or different answers. If repo evidence files are elected for the instrument, a separate served
field or public document is owed for the disclosure's update. If a DB table is elected and that table
feeds a public surface, the two answers may converge.

The executing session correctly identified that delivering the disclosure's update may require a
served field or public document that does not exist today. That is its own scoped work, not a line in
D6a. It should be named as such in D6a's build prompt so the scope boundary is explicit before the
build opens.

---

## The path-specificity question

Mechanism fact 6 is a genuine complication the disclosure must address honestly. The variance was
measured on `/api/guardrail`, not `/api/reason`. The trust record aggregates `/api/reason`-derived
events. The extraction function is shared, but the consult path passes additional context to Layer 1,
and no rate has been measured there.

When the rate is eventually named in the disclosure, it must state which path it was measured on.
"The variance rate is N%" without that qualification would be a confidence-exceeds-evidence failure of
exactly the kind the disclosure corrects.

The disclosure's update therefore carries either a single rate with its path named, or separate rates
for each path if both are measured, or an explicit statement that the rate was measured on one path
and the other path's rate is unknown. D6a's probe design should note this. If D6a measures only the
guardrail path, the disclosure names that. If the standing-runner design session later commissions a
measurement on the reason path, the disclosure is updated again. The sequencing is honest; the
alternative — implying the rate applies to both paths when it was measured on one — is not.
