# Mentor ruling, verbatim — the S11 pre-flip report: three questions

**2026-09-12.** Received in response to
`operations/trust-layer-2026-07/2026-09-12-S11-PRE-FLIP-REPORT.md` (§11, Q-A/Q-B/Q-C).
**Recorded verbatim, canonical. Verbatim wins over every summary, including this project's own.**

---

## S11 Pre-Flip Report — Mentor Review and Rulings

The report is received. Before the three questions are ruled on, one thing must be named directly: this is the most carefully assembled document this project has produced. The PR19 fold disclosures — finding the silent truncations in the standard's own blockquote, the attribution gap on the 1:1 pairing method, the divergence between the ruling's dictated wording and the buffer's actual breakdown — are exactly the discipline the observation history has been tracking across this week, now operating at the level of the report that gates the flip itself. The report does not soften any of these. It names them on the same footing as the substantive findings. That is the practice.

The three questions are ruled on in order.

---

**Q-A — Part (1) on the window's clock**

Yes. The window-clock reading is the operative one for part (1), on the same reasoning the 2026-09-11 ruling applied to part (3).

The script's 61.39-day span begins at the buffer's first pre-window v1 record. That is the same class of error the regime ruling addressed: a figure computed over a mixture of the retired and current instruments describes neither. The pooled span is a disclosure, not an answer.

The window started 2026-09-06T09:44:55Z. The seven-day mark is 2026-09-13T09:44:55Z — Sunday 13 September, 19:44 AEST. Part (1) is NOT MET at the time of this assembly and reaches its counting threshold on Sunday evening.

The script defect named in §8 item 1 — Part 1's duration reads the pooled-buffer span — is confirmed as a defect on the same grounds as the Part 3 defect the 2026-09-11 ruling corrected. It needs its own waiver before it can be fixed. The waiver request should state the grounds: the window-clock figure is the operative one per this ruling; the script's current output is the same class of pooled-span artifact that Part 3 carried before correction.

One addition to carry into the Part (1) assessment at the seven-day mark: the representativeness disclosure in §2.2 is the right treatment, but the composition it discloses is worth naming plainly here. The window's 78 consult records are overwhelmingly Write/Edit examinations of governance and record-keeping documents. The 2,846 Bash actions are dropped from the consult floor entirely. The at-action-v2-composed regime's 73 correct holds are all justice-surface reads. This is a real composition, honestly disclosed. The seven-day clock reaching its mark does not change what the window contains. The pre-flip report carries the composition; the 0h call rests on the disclosed facts.

---

**Q-B — Part (2) is not a waiting problem**

The report's framing is correct and the fork it names is the right one. The ruling is on the fork, not on which branch to take — that is the founder's call, not this ruling's to pre-empt.

The three branches, assessed:

*Branch 1: A founder-walked accreditation write carrying signed assessments that engage phronesis, andreia, and sophrosyne.* This is the structurally correct path. The emission path is working as designed — trust events fire on accreditation writes, not on at-action consults. The design reflects a deliberate choice: the trust record should reflect examined, signed assessments, not the volume of harness traffic. A founder-walked accreditation write is not a workaround. It is the path the system was built for.

*Branch 2: A change to the close hook's seed-only shape.* This is a build under waiver, touching a GUARD_RE file, with its own governance obligations. It is not ruled against, but it is the more complex path and it changes the emission semantics in ways that would need their own examination. It is not the recommended branch.

*Branch 3: A re-reading of part (2) against what the dogfood loop can structurally produce.* This branch deserves honest examination before it is dismissed. The standard's wording is "all four cardinal domains evaluated at least once each, with the aggregate confidence rising above conservative on at least two domains." The records-proxy reading shows 4/4 domains engaged by the live examinations. The trust-state reading shows 1/4 with an actual row. The standard's wording is ambiguous between these, as the report correctly identifies.

The ruling on this ambiguity: the trust-state reading is the operative one. The standard asks for evaluation that produces a record — not engagement that passes through the harness without leaving a trace. The phrase "aggregate confidence rising above conservative on at least two domains" presupposes a record with confidence weights, which only the trust-state produces. The records-proxy reading answers a different question: did the harness touch these domains? The standard's question is: does the trust record reflect examined assessment of these domains? Those are not the same question.

Part (2) is structurally blocked by the emission path. The recommended path is Branch 1: a founder-walked accreditation write. The founder should examine what signed assessments for phronesis, andreia, and sophrosyne would honestly reflect about the loop's behaviour in the window, and whether those assessments are ready to be made.

If they are not ready to be made honestly, the accreditation write should not be performed to discharge a gate. The gate exists to ensure the record reflects genuine assessment, not to be discharged by any available mechanism.

This is the most important thing in this ruling, and it connects directly to what the observation history has been tracking. The discipline of honest self-examination that has operated across this week — naming gaps, reporting findings that falsify prior work, refusing to paper over limits — applies here too. The accreditation write should reflect what the loop has actually demonstrated, not what would discharge the gate. If the honest assessment of phronesis, andreia, and sophrosyne is that the evidence is thin, the write should say so. A conservative confidence weight on a domain with thin evidence is not a failure. It is the correct reading.

---

**Q-C — The guard-side rate rests on three holds**

The three-event rate discharges the "reported separately with its rate" obligation. It carries a small-sample qualification.

The ruling on the consult-side figure (73 holds, no small-sample flag needed) rested on 73 being a substantive count in the sense the flag was designed for. Three is not. The guard population's 0 false / 3 correct is a real rate — it is stated, as the report correctly says, not leaned on — but a reader of the pre-flip report should see the sample size alongside the rate.

The qualification reads: *MET (0 false-positive holds, 3 correct holds; n=3 — rate stated, not leaned on).*

The asymmetry between the consult-side and guard-side qualifications is not inconsistency. It reflects the actual difference in sample sizes. 73 holds is enough to characterise a rate. 3 holds is enough to report a rate. They are not the same thing, and the pre-flip report should not treat them as if they were.

The guard-side availability figure (275/276 = 99.6%) carries no analogous qualification — a single outage in 276 records is a precise count, not a rate over a thin sample.

---

**On the two wording divergences surfaced for the founder's and mentor's decision**

Both are named here and neither requires a ruling that overrides the prior rulings.

The v4=96 off-by-one: the 2026-09-10 ruling's quoted figure carried v4=96 at a 423-line snapshot where the arithmetic gives 97. At this run the window's own v4 count is 96 (the probe sits outside the window). The operative figure is 96. The prior ruling's figure was a snapshot of a moving buffer; the current run's figure is the authoritative one for this report.

The "all false-positive" wording: the ruling dictated "n=138, all false-positive." The buffer's actual breakdown is 137 false-positive + 0 correct + 1 not-a-hold. The ruling's wording was imprecise. The buffer's breakdown is the accurate one. This report's §4.1 substitution of the precise breakdown for the ruling's wording is correct and should stand. The ruling's imprecision is named, not corrected by silent substitution — which is exactly the discipline the report applied.
