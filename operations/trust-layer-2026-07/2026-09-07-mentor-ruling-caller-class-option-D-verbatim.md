# Mentor ruling — `caller_class`: OPTION D. Structurally unimplementable as wired; disclosed limit (VERBATIM)

**Received 2026-09-07 AEST, in answer to
`operations/trust-layer-2026-07/2026-09-07-mentor-question-caller-class-signal-null-FOR-RULING.md`
(session S7).**
**Status: ADOPTED AS BINDING SPECIFICATION.**

**THIS RECORD IS CANONICAL. It wins over every summary of it — the decision-log entry, the S11
register, the standing opener, the session close, and the question document it answers.**
Reproduced exactly as relayed; nothing paraphrased, nothing elided.

**⚠ THIS RULING AMENDS A CLAUSE PUBLISHED THE SAME DAY.** The segment-1 clause of
`2026-09-07-mentor-ruling-caller-class-schema-boundary-verbatim.md` is superseded by the amended
clause in §1 below. That earlier ruling otherwise stands in full (post-boundary only; no retroactive
classification; the three-segment disclosure).

---

## The ruling (verbatim)

## `caller_class` — the signal measures null; what follows?

The document is honest in the specific way that matters most: it reports a measurement that falsifies a premise of the ruling it implements, hours after that ruling landed, without softening the finding. That discipline is noted and the ruling is given in the same spirit.

---

### What the measurement establishes

The finding is precise and must be stated precisely before the ruling lands on it.

`caller_class` works. The mechanism is correct. The end-to-end test confirms it. What does not happen is the wire supplying the input — the PreToolUse hook, fired inside a subagent, receives a path with no `/subagents/` segment. The signal the mechanism was built to read is not present in the environment where it needs to be read.

This is not a build failure. It is a discovery about the environment.

The two-value asymmetry — emitting `unknown` rather than `live_agent` for a session-shaped path — did exactly what it was designed to do: it converted a false claim into an honest one. The field is present at capture. It distinguishes nothing. That is the truth, and the field reports it truthfully.

The segment-1 clause — "live-agent and review-fleet records distinguished at source" — is not currently achievable. That clause must be amended.

---

### The ruling on the four options

**Option D is ruled. The guard population is declared structurally unable to satisfy ruling 3's exclusion on the current harness as wired, and this is carried as a disclosed limit.**

The reasoning follows from the evidence and from the governing principle the prior ruling stated.

The prior ruling's §5(d) established the governing principle: a classifier that misflags live-agent records is invisibly destructive in the direction that matters most — it removes the very observations the measurement exists to capture. Option B has now been measured against ground truth and found to do exactly that. In one observed fleet window, a genuine live-agent action sits between two fleet records and a spawn-depth marker would have misclassified it. With concurrent fleets running up to 16 agents simultaneously, the parent is routinely acting inside the window. The misclassification is not a theoretical edge case. It is the normal operating condition.

Option A is honest but incomplete. An exclusion that never fires is honest — the document is correct about this. But Option A, continued indefinitely, accepts a guard population that demonstrably contains fleet records without any mechanism to remove them, and reports a rate over that population as though it were a live-agent rate. The disclosure can name this, but naming a contamination is not the same as resolving it.

Option C is a candidate requiring investigation, not a solution in hand. The SubagentStart hook may supply a correlatable identity. It may not — the correlation key is exactly the open problem, and H3 receives the parent's session ID. Investigation is owed, but the ruling cannot be conditioned on an unverified candidate.

Option D is the ruling because it is the only option that says the true thing and stops there. The exclusion is correct in principle. It is unimplementable on this harness as wired, with the signals currently available. Carrying that as a disclosed limit is consistent with the prior ruling's stated preference for naming the situation plainly over both discarding data and classifying it by guess.

---

### What Option D requires operationally

**1. The segment-1 clause is amended.**

The published segment-1 clause reads: "Post-boundary records — `caller_class` field present at capture; live-agent and review-fleet records distinguished at source; rate computed over live-agent records only; review-fleet count disclosed separately."

The amended clause reads: "Post-boundary records — `caller_class` field present at capture; distinction between live-agent and review-fleet records not currently achievable at source; `caller_class` reports `unknown` for all records on this harness as wired; no exclusion is applied; the structural reason is disclosed."

The rate is computed over all post-boundary records with the disclosure that the population includes an unknown proportion of review-fleet records. The exclusion count is disclosed as zero, with the reason stated: the signal the mechanism requires is not present in the hook environment.

**2. The structural reason is stated in the disclosure, not buried.**

The disclosure names: the PreToolUse hook fired inside a subagent receives a path with no `/subagents/` segment; the mechanism is correct and tested; the environment does not supply the input the mechanism requires; no reliable heuristic exists as an alternative, established under controlled conditions with ground truth.

This is not a failure of the build. It is a finding about the environment. The disclosure says so.

**3. Option C investigation is owed as a bounded work item.**

SubagentStart fires for subagents. Its command-hook stdin carries `agent_id` and `agent_type`. Whether a marker it writes can be correlated to an H3 record is unverified. This investigation is owed before the guard disclosure is published — not because the ruling depends on it, but because Option D's "unimplementable on this harness as wired" should be tested against the one remaining candidate before it becomes permanent.

The investigation has a clear success condition: does SubagentStart supply a signal that correlates to H3 records via a key other than session ID? If yes, Option C becomes viable and the ruling is revisited. If no, Option D is confirmed and the disclosure is final.

The investigation is bounded: one session, one question, a clear binary outcome. It does not delay publication if it runs in parallel with the window.

**4. PR19 review fleets continue as structured under the founder's Option A election.**

The pool grows. Every post-boundary record carries `caller_class: unknown`. The disclosure reports the pool's size, its known composition (unknown proportion of fleet records), and the structural reason the proportion cannot be measured.

This is honest. It is not clean. The distinction matters and the disclosure preserves it.

---

### On the asymmetry the document names

The document closes by naming the asymmetry between the previous question and this one: the previous question asked what to do about records already captured; this one asks what to do about records not yet captured, and the pool keeps growing.

The asymmetry is real and the ruling addresses it directly.

The previous question's answer — post-boundary only, no retroactive classification — was correct and stands. The current question's answer — Option D, disclosed limit — means the post-boundary records are not clean either, for a different reason.

The previous question's answer protected the measurement from a classification that could not be made reliably. The current question's answer names that the classification still cannot be made, even with the field present.

The two answers are consistent. Both rest on the same principle: do not claim a classification you cannot make. The pre-boundary records were unclassified because the field was absent. The post-boundary records are unclassified because the signal is absent. The field's presence does not change the epistemic situation. It makes the epistemic situation legible, which is what it was built to do.
