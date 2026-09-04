# Mentor ruling — P1: what the decision table reads when it fires (VERBATIM)

**Received 2026-09-04**, in answer to
`operations/trust-layer-2026-07/2026-09-04-P1-decision-table-input-SCOPE-FOR-RULING.md`.

**Status: BINDING on adoption per the project's mentor-verdict convention. The verbatim text below wins
over every summary of it**, including this file's own header, the register's P1 row, and the decision-log
entry. Adoption recorded at this session's close.

**What it discharges:** S11 register hard prerequisite **P1**.
**What it explicitly does NOT license:** the flip; any build, schema change, activation or publication;
re-opening Q2's staging or the four-part standard; deferring Finding B's fix.

---

## On the four findings

All four findings are accepted as stated. They are not rulings — they are mechanism facts and structural observations that the ruling lands on. Accepting them does not discharge P1; it establishes what P1 is actually asking.

Finding A is the most important reorientation. The register's three readings are not three wired paths. They are one wired path and two reconstructions. The question is not which implementation is correct but whether the wired seam is the right one given what Q3 specifies. That reframing is correct and the ruling proceeds on it.

Finding B is a MEASURE-mode honesty defect standing independently of how P1 is ruled. `taskHasJusticeSurface` defaults to false and no caller supplies it. The justice question is never asked. Reading 3 is reading 2 arrived at accidentally. This must be fixed regardless of the P1 ruling. It is not a P1 consequence — it is a standing defect that the P1 ruling does not license deferring.

Finding C is the real content of P1 and the document is right to name it plainly. The decision table's rows mix two idioms — per-action and longitudinal — because it was authored before anything forced the distinction. No amount of code reading settles which object the table ranges over. That is a question about what the table means, and it is mentor-shaped.

Finding D establishes the retroactive stakes correctly. Q2's staging premise — that the do-not-proceed class has a structural false-positive floor of zero on genuinely kathekon-free actions — is true under reading 2 and false under reading 1. The ruling does not merely configure a future flip. It retro-validates or invalidates a ruling already in force.

---

## Q1 — What does the decision table read when it fires?

**The at-action verdict is the table's input for the per-action rows, filtered by Q3's kathekon-engagement threshold before any justice surface is reported.**

The document's recommended resolution is correct, and the ground it gives is the right one. The ruling extends Q3's scope explicitly rather than leaving that extension assumed.

Q3's build specification for G6(a) contains the clause: *"consistent with the deliberate-proximity-without-justice-surface row of the decision table."* That clause does two things simultaneously. It resolves G6(a)'s non-binding case by mapping it onto a named table row. And in doing so, it discloses what the table row means — a verdict that found contrary to appropriate action with no kathekon factors detected reports `justiceSurface: 'none'`, not `'unevaluated'`. The table row's meaning is not left open by Q3. It is specified by the mapping.

The document correctly identifies that Q3 is written about G6(a), not about the decision table's input in general, and that reading its "consistent with" clause as settling the table's input for all rows is an extension of its stated scope. That extension is now ruled.

The reasoning is as follows. The decision table was authored before the at-action versus aggregate distinction was forced. Q3 is the first ruling that forces the distinction — it specifies "the verdict that opened the loop" as the relevant object for G6(a). If Q3's specification is correct for G6(a), and the table's per-action rows are the rows G6(a) reads, then Q3's specification is implicitly correct for those rows. The "consistent with" clause is not a coincidental reference. It is Q3 disclosing its own reading of what the table means for the per-action case.

Treating that disclosure as scoped only to G6(a) and leaving the table's input open for all other purposes would produce an incoherence: the same row would mean different things depending on whether it was being read by G6(a) or by some other consumer. That incoherence is not in the ruling. It is in a reading of the ruling that treats the "consistent with" clause as narrower than it is. The extension is therefore not an imposition on Q3. It is what Q3 requires for the table to be coherent.

---

## The three consequences the document names

All three follow from the ruling.

**First:** The table's per-action rows read the at-action verdict. A verdict meeting no kathekon-engagement condition reports `justiceSurface: 'none'`. Q2's zero-false-positive floor is restored. The staging premise stands. The 129-of-130 figure is what you get by feeding the at-action verdict in unfiltered — which is the composition Q3 exists to forbid. The 130-record reclassification re-runs under the filtered reading as evidence, not as readiness.

**Second:** The aggregate trust state is not the per-action table input. Its consumer is depth calibration — Q7's aggregate-keyed conservative form. That is already ruled and already aggregate-keyed. The ruling here does not disturb it.

**Third:** `interventionInputFromS3` is not wrong in itself. It is wired to the wrong consumer for the enforce path. It keeps serving the trust-record surface. A sibling seam — `interventionInputFromAtAction` — maps an at-action assessment plus its kathekon engagement into `InterventionInput` for the enforce path. The kathekon-engagement threshold is already implemented via `assessKathekonEngagement`. No new predicate is required.

---

## On Finding B's fix

Finding B's fix is owed regardless of this ruling and is not a P1 consequence. Supply `taskHasJusticeSurface` where it is known, or remove the parameter as unreachable if it cannot be supplied. The live harness advisory currently gives an answer to a question it did not put. That is a honesty defect in the MEASURE-mode sense — the instrument reports a result without having performed the relevant test. It should be corrected in the same build pass that implements the P1 consequences, but it is not gated on P1 being ruled. It is gated on the build being licensed, which this ruling does not do.

---

## What this ruling does and does not license

**Ruled:** The at-action verdict, filtered by Q3's kathekon-engagement threshold, is the decision table's input for the per-action rows. Q3's "consistent with" clause is read as disclosing the table's meaning for the per-action case, and that reading is extended to the table's per-action rows generally. Q2's staging premise stands. The aggregate trust state is not the per-action table input.

**Not licensed:** The flip. P4 fails independently. P5's denominator is unsourced. P6's window has not started. This ruling moves none of them.

**Not licensed:** Any build, schema change, activation, or publication. The build consequences named in §7 are correctly scoped as not built here. They are the design-level consequences of the ruling, to be built when the relevant gates are met.

**Not licensed:** Re-opening Q2's staging or the four-part standard. Both stand.

**Not licensed:** Treating Finding B's fix as deferred until P1's build consequences are implemented. It is a standing defect owed independently.

---

*End of verbatim record.*
