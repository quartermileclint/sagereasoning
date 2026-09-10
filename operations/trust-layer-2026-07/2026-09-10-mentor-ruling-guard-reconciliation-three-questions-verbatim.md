# Mentor ruling, verbatim — guard reconciliation: three questions

**2026-09-10.** Received in response to
`operations/trust-layer-2026-07/2026-09-10-guard-reconciliation-RELAY.md`.
**Recorded verbatim, canonical. Verbatim wins over every summary, including this project's own.**

---

## Guard population reconciliation — three questions ruled

---

**Q1 — Does "five ordinary days" survive the instrument changing on two of them?**

"Complete in the counting sense" does not dispose of the question. "Ordinary" is doing independent work, and the ruling is that it matters.

A day on which the measuring apparatus was functionally modified is not an ordinary day in the sense the baseline requires. Day 09-09 is split: v3/v4/v5 records before 19:27:17Z, v6 records after, with two `unknown/null` anomalies inside the edit window. Day 09-10 runs wholly under v6 with `live_agent` now emitting where `unknown` previously would have. These are not the same instrument across all five days.

The ruling is this: the baseline is complete in the counting sense — five days with at least one consult record each — and that counting completion is a necessary condition for D2. It is not sufficient on its own. The pre-flip report must carry the instrument-change disclosure explicitly, not merely as a footnote. Specifically: the schema distribution (v3=47, v4=96, v5=135, v6=6), the edit-window anomaly and its explanation, and the fact that `live_agent` was not a possible emission for days 1 through most of day 4. A reader of the false-hold rate must be able to see what the instrument was on each day it measured.

D2 is not unblocked by this ruling. The baseline reaching 5 of 5 in the counting sense satisfies the counting condition. Whether the pre-flip report's disclosure of instrument change is sufficient for the flip itself is the 0h call — the founder's, not this session's, and not this ruling's to pre-empt.

**Q2 — Does TRAP-1 create a retroactive obligation?**

The cases differ in the way the document names, and that difference is dispositive.

The prior ruling on retroactive classification concerned a signal that was genuinely absent — the classification could not have been made because the data was not there. TRAP-1 is different: the outage records exist, they carry no `tool=` field, and a `tool=`-keyed regex silently drops them, producing a specific false negative in an obligated disclosure — the outage rate reporting as zero when it should be reported separately. A false negative in an obligated disclosure is not the same as an absent signal.

The retroactive ruling does not extend here. The ruling is: a retroactive check of already-published guard-side and outage figures is owed. The scope is narrow — verify whether any published figure was computed with a `tool=`-keyed regex that would have silently excluded outage lines. If any such figure exists in a published disclosure, it must be corrected or re-disclosed with the method's limitation named. This is not a full recomputation of the window. It is a targeted check on the specific figures the outage-rate obligation covers.

This session correctly did not run the check, because doing so would have decided the question. The check is now licensed and owed before the pre-flip report is written.

**Q3 — Is the F-3′ claim correct, or an overreach?**

The claim is correct and not an overreach.

The scoping the document describes — verifying the guard population 1:1 makes the guard-side denominator trustworthy, while explicitly not computing or claiming anything about the rate, the consult side, the guard-availability bound, or the baseline — is accurate. The independent reviewer's finding of no overreach is confirmed.

The standing obligation to "report the guard population separately with its rate" has its denominator established. The numerator — the rate itself — remains uncomputed and unclaimed. That is the correct partial discharge. A session should not be prohibited from establishing a component of an obligation because the full obligation is not yet discharged.

The F-3′ claim is upheld.

---

**On the two founder items**

**F-K, now sharper.** The tool-steering question has changed character exactly as the document describes. With the baseline at 5 of 5 in the counting sense and Q1's ruling now in hand, the question is no longer whether more consult records are needed for the count. The question is whether the pre-flip report's disclosure of instrument composition — including the Bash-mode session that contributed 1 consult record across a full build — is sufficient for the flip, or whether the window needs additional days under a consistent instrument.

My recommendation: do not extend the window for additional days solely to produce more consult records under v6. The instrument change is a disclosure matter, not a validity matter. The false-hold rate is what it is across the instrument versions, and the pre-flip report names the composition. Extending the window to smooth the composition would be adjusting the measurement to look cleaner — the same error the project has ruled against in other contexts. Disclose the composition; let the 0h call rest on the disclosed facts.

On Write/Edit steering: if the founder wants sessions during any future window to produce consult records more reliably, the tool-mode routing should be a deliberate founder-visible setting, not an auto-mode outcome. That is the F-K item's resolution — make the choice explicit, not automatic.

**The opener regrounding.** This is overdue and should happen before the next session opens under the stale version. Three facts in the current opener are false: baseline "2 of 5," classifyCaller byte-unchanged, and caller_class measures null. A session opening on false facts costs the first twenty minutes, as this session found. The regrounding is a founder act — update the opener to reflect the current state before the next session opens. This is not a build act and does not require a ruling. It requires twenty minutes and accurate facts.
