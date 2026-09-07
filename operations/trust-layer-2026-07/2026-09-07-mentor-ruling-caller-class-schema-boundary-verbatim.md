# Mentor ruling — the `caller_class` schema boundary: POST-BOUNDARY ONLY, three-segment disclosure (VERBATIM)

**Received 2026-09-07 AEST (`date`) = 2026-09-07 UTC, in answer to
`operations/trust-layer-2026-07/2026-09-07-mentor-question-caller-class-schema-boundary-FOR-RULING.md`
(session S7).**
**Status: ADOPTED AS BINDING SPECIFICATION.**

**THIS RECORD IS CANONICAL. It wins over every summary of it — the decision-log entry, the S11
register, the standing opener, the session close, and the question document it answers.**
Reproduced exactly as relayed; nothing paraphrased, nothing elided.

**Binds:** the treatment of pre-boundary guard records; the shape of the published guard disclosure;
whether a retroactive classification pass is owed; and the posture of PR19 review fleets before the
boundary lands.

---

## The ruling (verbatim)

## `caller_class` schema boundary — retroactive classification or post-boundary only?

The document is the best-argued question this project has produced. Both sides are at full strength, the middle position is named honestly, and the document chooses neither. That discipline is correct and the ruling is given in the same spirit.

---

### The load-bearing question first

The D2 window-sequencing ruling established that read-side segmentation transfers to a write-side change under one condition: the boundary is dated, recorded, and the fields that change are distinguishable in the recorded data. The document's §5(a) identifies this as the strongest argument on either side, and it is right.

For the extraction-regime boundary, the distinguishing fields are present in every record and the boundary does not need to be inferred — it is legible in the data. Here the field is absent by construction and the boundary must be inferred from free text. The precedent's condition is not met in the same form.

But the condition's purpose must be examined, not only its surface form. The condition exists to ensure that a reader of the buffer can identify, for every record, which regime produced it, without guessing. For the extraction-regime boundary, that identification is made from fields present in the record. Here it cannot be made that way. §3's controlled experiment establishes this definitively — no tested heuristic is both complete and clean, and the most sensitive one misflags live-agent records in both directions.

The precedent does not transfer. Post-boundary only is ruled.

---

### The full ruling

**Pre-boundary records are reported as a separate, unclassified segment — size stated, composition declared unknown, no rate computed over them.**

This is the middle position the document names but does not advocate. It is ruled as the correct answer, not as a compromise between the two main readings.

The reasoning is as follows.

Post-boundary only, strictly applied, would discard the pre-boundary records entirely — treating them as unreported. The document correctly identifies that this is its own form of silence about data the instrument holds. Silence about data the instrument holds is not honest reporting. The pre-boundary records exist. Their size is known. Their composition is unknown in a specific and documentable way. Honest reporting names all three of those facts.

Retroactive classification is ruled out by §3's evidence. The heuristic fails under controlled conditions with ground truth available. §4(c)'s claim that the bias direction is controlled — that imperfect classification biased toward exclusion is the safe error — is answered by §5(d): the sensitive heuristic misflags live-agent records, removing exactly the observations the measurement exists to capture. That is not conservative. It is invisibly destructive in the direction that matters most.

The middle position is not an evasion. It is the honest answer to a situation where the data exists, the classification is unavailable, and both alternatives — discarding the data or classifying it by guess — are worse than naming the situation plainly.

**The published guard disclosure therefore has three segments:**

1. **Post-boundary records** — `caller_class` field present at capture; live-agent and review-fleet records distinguished at source; rate computed over live-agent records only; review-fleet count disclosed separately.

2. **Pre-boundary records** — no `caller_class` field; composition unknown; size stated; no rate computed; the reason for the absence stated explicitly: session ID is insufficient and no reliable heuristic exists, established under controlled conditions.

3. **Outage records** — excluded from both segments per the earlier ruling; count disclosed separately.

---

### On the four operational consequences

**1. Whether the guard disclosure reports one segment or two.**

Three segments, as above. The pre-boundary segment is reported as a disclosure of the instrument's state, not as a measurement.

**2. Whether the ~90 pre-boundary records enter any published guard figure.**

They enter the disclosure — size stated, composition unknown — but not any computed rate. A figure whose denominator includes records of unknown provenance is not a rate. It is a guess presented as a measurement. The project's governing rule forecloses it.

**3. Whether a retroactive classification pass is owed as work at all.**

No. §3's evidence closes this. The controlled experiment with ground truth establishes that no available heuristic is reliable enough to produce a classification that is better than silence. Performing a classification pass and discarding its output is wasted work. Performing a classification pass and publishing its output is the defect the ruling is designed to prevent. The pass is not owed.

**4. Whether PR19 review fleets must be run differently before the boundary lands.**

Yes. This is the sharpest operational consequence and the document is right to flag it. Every PR19 review conducted before `caller_class` lands adds to the pre-boundary pool whose composition is unknown. The project's own process is enlarging the problem.

The correct posture before the boundary lands is one of two options, and the founder elects which:

- **Option A:** PR19 reviews continue as currently structured, and the pre-boundary pool grows. The disclosure's pre-boundary segment grows with it. This is acceptable provided the disclosure is honest about the pool's size and unknown composition.

- **Option B:** PR19 review fleets are run under a distinct session ID before `caller_class` lands, so that session ID becomes sufficient to distinguish fleet records from live-agent records in the pre-boundary pool. This does not retroactively classify existing records, but it stops the pool from growing further in the unclassifiable form. It requires a process change to how PR19 reviews are initiated.

Option B is the cleaner posture if it is achievable without disrupting the review process. Option A is acceptable if it is not. The founder elects. The ruling does not require Option B — it names it as available.

The `caller_class` boundary should land as soon as the D2 correction's sequencing permits, and no later. Every day the boundary is deferred is another day the pre-boundary pool grows by the project's own process.
