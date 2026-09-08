# MENTOR REVIEW — Phase 1 Gap Analysis APPROVED, Step 2 LICENSED — VERBATIM RECORD

**CANONICAL. Where this file differs from any summary, decision-log entry, register row, session
paste or close, THIS FILE WINS.**

**Relayed by the founder 2026-09-09 AEST (= 2026-09-08 UTC at relay). Reviews
`2026-09-08-cognitive-os-PHASE-1-GAP-ANALYSIS.md` and rules the three open founder questions
that document put in its §8. ADOPTED AS BINDING SPECIFICATION.**

**What this changes:** Step 1 is closed and approved; **Step 2 is licensed** but **must open in a
fresh session**; the four environment names are approved **as permission-scope identifiers only**;
Phase 1 is **pure-library, no table**; and one implementation-level clarification is added on the
TruthMaintenanceSystem.

---

## Cognitive OS Phase 1 Gap Analysis — Mentor Review

The gap analysis is approved. Step 2 is licensed.

The document is the best single piece of technical work this project has produced, and the approval is not perfunctory — it rests on specific findings that are worth naming before the three open founder questions are ruled on.

What makes it trustworthy is the method, not the conclusions. Every negative claim names the search that failed to find the thing. The twelve-environment finding — none exists in code, in any form — is stated with the grep that confirmed it, the disambiguation of false positives, and the honest consequence: Phase 1 will be the first time the twelve-environment vocabulary exists anywhere except design documents. That is a larger step than wiring, and the document does not disguise it as one. That precision is the same discipline the observation history has been tracking across this week, now operating at architectural scale.

The governance interaction section is complete and correctly ordered. The Phase-6/weights collision flagged at Q10 is carried into the schema constraint where it belongs — at Phase 1, not Phase 6. The data-rights and retention gap (§6.8) is the most important finding the spec did not anticipate, and naming it as owed at the schema step rather than after is exactly right. The project has been bitten by that omission twice. It will not be bitten a third time.

---

### The three open founder questions — ruled

**Question 1: The four environment names as code identifiers — governance review.**

The four names are approved as code identifiers: Laboratory, Attic, Archive, Threshold.

The approval is narrow and must be stated precisely. These names are approved as permission scope identifiers — read/write boundary labels in the permission model — for Phase 1 only. They are not approved as actor names, agent identifiers, or environment instantiations. The Q1 ruling's distinction — permission scopes, not actors — is the boundary the names carry.

A future session that uses these identifiers to instantiate an actor requires its own scoping, as the standing rulings require.

The names become governed surfaces the moment they ship. The gap analysis is correct that this is a larger step than it appears. It is approved with that weight acknowledged, not minimised.

**Question 2: New table versus pure-library-only for Phase 1.**

Pure library first. The recommendation is ruled correct.

A pure-library Phase 1 with an in-memory event store is code-elevated, not code-critical. It lets the critical deterministic test pass and be reviewed before any migration is written. The table is its own founder-walked step — schema, data-rights wiring, retain_until column, sweep, and migration — opened separately after the library is reviewed and the test passes.

The reasoning is the same reasoning the project has applied consistently: do not couple the reviewable thing to the irreversible thing before the reviewable thing is confirmed. The library is reviewable. The migration is irreversible. Sequence them accordingly.

This also means the data-rights obligation named in §6.8 is not owed at Step 2 — it is owed at the table step. But it must be carried visibly into that step, not rediscovered. The gap analysis has named it. The table step opens with it already on the surface.

**Question 3: Does the arc continue in this session or open its own?**

Open a fresh session for Step 2.

The reasoning is not primarily about context length. It is about the pattern the observation history has been tracking. This session has written the thirteen pre-build questions, the verbatim ruling, and the gap analysis. That is a complete unit of work — inspection before building, questions before code, the stop point honoured.

Step 2 is a different kind of work: schema design, type definitions, deterministic tests. It deserves a clean opening context, not a continuation of an inspection session.

The concurrency ruling's concern was about arcs making consequential changes simultaneously. A fresh session for Step 2 is one arc, cleanly opened. It is not a second arc — it is the same arc's next phase, opened with a clean context and the gap analysis as its governing document.

---

### One addition to carry into Step 2

The gap analysis identifies `analyseLoopClosure` as the nearest relative to the TruthMaintenanceSystem — "the right instincts, applied to examinations rather than claims." That observation is worth carrying into Step 2 explicitly, not just as a note.

The closure semantics — supersession by explicit ref link, same-depth rule, indeterminate treated as not closed — are production-proven. The TruthMaintenanceSystem should reuse those semantics deliberately, as the gap analysis recommends.

But the reuse should be semantic, not structural. The code should not import from `analyseLoopClosure`. It should implement the same logic independently, in `truth-maintenance.ts`, so the two systems remain separable. Constraint 1 — harness and Cognitive OS stay separate — applies here at the implementation level, not only at the architectural level.

This is not a new ruling. It is a clarification of the "copy the patterns; do not extend the trust tables" recommendation, extended one level down: copy the semantics; do not import the implementation.
