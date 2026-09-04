# Mentor ruling — should the P6 window measure the decision table's recommendation? (VERBATIM)

**Received:** 2026-09-05. **Status: BINDING. The verbatim text below wins over any restatement,
summary, or execution note anywhere in this repository, including the decision-log entry that adopts
it and the amendments it licenses.**

**On the question posed by:** `operations/trust-layer-2026-07/2026-09-05-P6-window-recommendation-SCOPE-FOR-RULING.md`
(authored 2026-09-05, `D-S11-P6-WINDOW-RECOMMENDATION-SCOPED-FOR-RULING-DEADLINE-PREMISE-WITHDRAWN-2026-09-05`).

**Reader's note on one item, added by the adopting session and NOT part of the mentor's text:** the
final bullet of "Owed independently of this ruling" names Finding B's fix from the P1 ruling (supply
`taskHasJusticeSurface` or remove the parameter as unreachable). **That fix was already made on
2026-09-04** — register D5 is CLOSED, the parameter is now REQUIRED (`taskHasJusticeSurface: boolean`,
not optional) at `harness-integration.ts:531`, all four call sites supply it explicitly, and the flag's
value is disclosed in the verdict `basis` and pinned by two assertions. Verified first-hand at HEAD
2026-09-05. The item is recorded as **already discharged**, not as outstanding. This note is placed
here rather than in the verbatim text below, which is reproduced unaltered.

---

## On the four findings

All four findings are accepted as stated. The mechanism facts are verified first-hand and the document argues against its own urgency claim at Finding B — which is the most important piece of intellectual honesty in the document. The deadline was the stated reason to decide this now, and the document establishes that the deadline's premise does not hold. That is the right posture.

Finding A stands: the gap is real. The window as scoped measures a proxy for part (3)'s object, not the object itself. The proxy is tight under the P1 ruling, but it is not the same thing, and the difference was never examined when P6 was scoped because the seam did not exist on 2026-08-15.

Finding B stands: the sequencing deadline dissolves. Report-time derivation requires no capture-layer edit, carries no contamination exposure, and is already demonstrated working over the frozen buffer. The choice is genuine — capture-time versus report-time — not forced.

Finding C stands with one precision added below: P8a's build discharges P5's blocking claim at the code level. The register correction is owed independently.

Finding D stands: the A8 escalation row cannot fire in either option because no re-examination counter exists. This is a bound on the measurement itself, not a discriminator between options, and must be printed on the rate.

---

## The incidental finding in §9

Accepted and recorded. The frozen evidence buffer is a prefix of the live buffer, and the difference is undisclosed. The 8 additional records were captured on 2026-07-17 after the freeze snapshot was taken. Every figure published "over the frozen 130" is over a prefix of the first window's capture.

The document is right that this does not change any conclusion — the buffer is not reusable for part (3), P4 and P5 fail for unrelated reasons, and the 8 records are the same tool class as the rest. But it is a discrepancy between a record and its description, found by checking rather than assuming.

The freeze directory should carry a note documenting the cut. That is a documents-only act and is owed. The reproduction check calibrated against 130 is not disturbed.

---

## The register correction

P5's row asserts as present fact that runGuard writes nothing. That was true on 2026-08-15 and false since 2026-08-17. Option C inherited the error. The correction is owed independently of this ruling — it is a record correction, not a status change. P5 remains open because activation is open. The changelog entry for the 2026-08-17 build should be added.

This is a documents-only act and does not require a ruling.

---

## Q1 — Should the window's stated purpose widen to cover the recommendation?

Yes. The window's stated purpose should widen to cover the recommendation.

Part (3) of the 2026-07-12 readiness standard names a false-hold rate. Under G6(a), a hold is what a do-not-proceed produces. The table's output — not the predicate's classification alone — is what part (3) names.

A report that shows classification alone leaves the reader to assume the mapping from classification to hold is total. The P1 ruling establishes that the mapping is not total — the filter is precisely where a kathekon-free verdict stops producing a do-not-proceed. Reporting classification without the recommendation makes the filter's effect invisible in live data.

That is not a minor gap. It is the gap between measuring a proxy and measuring the thing.

The widening is therefore not an expansion of scope beyond what part (3) requires. It is a correction of the original scoping to what part (3) actually names.

---

## Q2 — Capture-time or report-time derivation?

Report-time derivation. The recommendation is not stored in the capture record.

The reasoning follows §4's ground and the three disclosed contrary arguments are addressed directly.

**On audit-trail fidelity:** The document correctly identifies this as the strongest contrary argument. A figure derived by today's code over old records is a statement about today's table, not about what the instrument did at the time. For a frozen-classifier window, the document calls this a feature. The ruling agrees, and adds the specific reason: the table is under active ruling. P1 moved its input on 2026-09-04, mid-arc. A stored recommendation would freeze the table's reading at capture time and become stale evidence that looks authoritative. A derived column can be re-derived after a ruling. The audit-trail weakness is real but is outweighed by the risk of freezing a reading that the ruling process is actively refining. The printed bound on the rate — stating that the derivation reflects today's table, not the table at capture time — is the honest disclosure that rides the figure.

**On lift fidelity:** The round-trip check is non-vacuous and the projection is a pure field map. The document's "expect" is the honest word. A v3/v4 lift check must run before any figure is published from the window. This is a precondition of publication, not a precondition of the ruling. It is named here so it is carried explicitly.

**On the widening being the thing ruled on:** Acknowledged. The ruling widens the purpose. §7.1 is not wrong.

---

## Q3 — How does the widening interact with the two populations?

The recommendation is reported separately for the consult population and the guard population, with the A8 bound and the depth: "" bound for guard records printed on the rate.

Guard records carry guardOutcome but no table recommendation, and depth is "" — so a table row keyed on depth reads a default there. The two populations are not commensurable without separation. Reporting them together would produce a figure whose denominator mixes two different measurement conditions. The separation is not optional.

The A8 bound — that the escalation row cannot fire because no re-examination counter exists — is printed on the rate for both populations, not footnoted. Finding D establishes this is a bound on the measurement itself. A footnote would allow a reader to miss it. It belongs on the rate.

---

## What this ruling does and does not license

**Ruled:** The window's stated purpose widens to cover the recommendation. The recommendation is derived at report time from stored records, not stored in the capture record. The two populations are reported separately. The A8 bound and the depth: "" bound for guard records are printed on the rate. A v3/v4 lift check runs before any figure is published. The derivation carries an explicit disclosure that it reflects today's table, not the table at capture time.

**Not licensed:** Any build, schema change, activation, or publication. P6 is not discharged, scoped further, or ready to open. The window has not started. P8a's build does not discharge P5 — activation is open. Nothing here moves the flip. The four-part standard, Q2's staging, and the P1 ruling stand as given. R2's contents remain the founder's. The freeze file is not touched — the discrepancy is documented, not corrected by re-taking the freeze.

**Owed independently of this ruling:** The P5 register correction and changelog entry for the 2026-08-17 build. The freeze directory note documenting the cut between the 130-record snapshot and the 138-record live buffer. Finding B's fix from the P1 ruling — supply taskHasJusticeSurface or remove the parameter as unreachable.
