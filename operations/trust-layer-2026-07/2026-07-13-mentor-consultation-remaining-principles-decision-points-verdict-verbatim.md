# Mentor consultation — remaining-principles build plan, the six decision-point verdicts (VERBATIM)

**Date:** 2026-07-13. **Status:** BINDING SPECIFICATION (verbatim wins over any paraphrase). **Adopted** into `2026-07-13-remaining-stoic-principles-build-plan.md` §6–§8.
**Context:** the founder relayed the build plan's six decision points (D1–D6, `2026-07-13-remaining-stoic-principles-build-plan.md` §7) to the private mentor. This is the verbatim response. It resolves all six forks and adds two refinements (the justice-arm narrowing lands WITH the enforce decision; Axis B splits into sub-phase A / sub-phase B).

---

Six decision points. I will answer each precisely, then name one thing the pattern across all six reveals.

---

**D1 — The pivotal fork: kathekon-predicate timing**

After the flip, not before. The answer follows directly from the Q1 standard: the enforce gate clears on a measured false-hold rate across a representative distribution, with the current battery-reviewed predicate. If #4 and #11 land before the flip, the predicate that clears the 7-day standard is not the predicate that enforce binds. The 7-day accumulation becomes evidence about a predicate that is then replaced before it binds. The measurement and the enforcement are decoupled — the observation period measured one thing and the enforce gate binds another.

This is not a conservative preference. It is the same principle that governed the Q1 standard itself: the examination must be complete on the thing being decided. Enriching the predicate mid-window and then treating the accumulated record as evidence of the enriched predicate's behaviour is the confirmation problem in a new form — the record was accumulated under different conditions than the predicate now specifies.

The sequencing is therefore: current predicate clears the 7-day standard, enforce flips on the current predicate, stage-1 do-not-proceed class stabilises, then #4 and #11 land as a paired predicate-mutation with a fresh 4-part readiness cycle. The governance cost is real — a second 7-day window after #4 and #11 land — and it is the right cost. The observation history shows a practitioner who has consistently chosen substantive readiness over procedural completion. D1 is that choice stated at the predicate level.

---

**D2 — The justice-arm refinement**

Fold it into the enforce decision, not into #4 and #11. The justice-arm refinement — requiring an evaluated obligation rather than mere dikaiosyne-tagging for the justice-surface arm to fire — is a predicate change, but it is a narrowing rather than an enrichment. It reduces the arm's false-positive rate. #4 and #11 are enrichments — they add new arm conditions that expand what the predicate catches. These are different directions of change and they should not travel together.

The reason to fold the refinement into the enforce decision rather than into #4/#11: the refinement affects the do-not-proceed class directly — the justice-surface-unevaluated row is the row where the refinement operates. The do-not-proceed class is stage-1 of the staged flip. If the refinement is not in place at stage-1, the stage-1 predicate fires on dikaiosyne-tagging alone, which is the over-broad condition the refinement is designed to correct. Correcting it after stage-1 has been live means the stage-1 record accumulated under the over-broad condition, which complicates the stage-2 readiness assessment.

The cleaner path: the refinement lands with the enforce decision — it is part of the predicate that stage-1 binds. The 7-day window accumulates evidence on the refined predicate. The return-with-record session confirms the refinement is in place before the flip is licensed. #4 and #11 then land after stage-2 stabilisation as a separate predicate-mutation cycle.

One practical note: the refinement is small enough that it does not require its own 7-day window — it is a narrowing of an existing arm, not a new arm. It should be implemented and battery-verified before the return-with-record session, so the session can confirm the refined predicate is what the 7-day record was accumulated against.

---

**D3 — "After the enforce gate clears" defined**

The build plan's definition is correct and should be held precisely: after the enforce gate clears means after S11 actually flips, not after the return-with-record readiness decision. The readiness decision licenses the flip. The flip is the gate clearing. These are distinct events and the distinction matters for predicate-change coordination.

The staged flip adds a further precision: G6(a) and the full predicate bind only at stage-2. Predicate-change coordination for #4, #11, #5, and the reserve clause agent field if extracted extends through stage-2 stabilisation, not only through stage-1. An item that is safe to deploy after stage-1 but before stage-2 is an item that does not touch the predicate and does not affect the stage-2 readiness assessment. The reserve clause agent field — if it remains Layer-2-assembly-only with no extraction — meets this condition. The others do not.

The practical implication: the post-flip build sequence on Axis B has two sub-phases. Sub-phase A is after stage-1 flips and before stage-2 flips — only items that do not touch the predicate and do not affect the stage-2 readiness assessment are eligible. Sub-phase B is after stage-2 flips and stabilises — predicate-touching items become eligible in the sequence Axis B specifies. The build plan's Axis B ordering is correct within sub-phase B. The sub-phase A / sub-phase B distinction should be made explicit in the plan so the eligibility boundary is unambiguous.

---

**D4 — Reflect sessions #2 and #3 disposition**

Confirm the flag state before building anything. The answer branches on it and the branch is consequential.

If SUBSTRATE_REFLECT_SCREENED_EXAM_ENABLED is ON: a mid-window prod deploy of #2 or #3 to the measured agent perturbs part-2 confidence during the observation window. The perturbation is not catastrophic — the reflect record is modulate-only and cannot raise a level — but it changes the decay modulation signal mid-window, which means the 7-day record's confidence readings are not stable across the window. The return-with-record session would need to account for the perturbation, which adds complexity to the readiness assessment. The cleaner path is to defer prod deploy of #2 and #3 until after the window, building repo-only on a branch and verifying against a test agent with no prod deploy.

If SUBSTRATE_REFLECT_SCREENED_EXAM_ENABLED is OFF: the sole reflect event is Q4-independent and there is no perturbation. Prod deploy during the window is safe on this dimension.

Confirm the flag state, then decide. The build-repo-only-on-branch option is available regardless of flag state and is the conservative choice if there is any uncertainty about the flag state or its downstream effects. The window's purpose is observation, not building — the observation history shows a practitioner who has consistently chosen to let the measurement run cleanly rather than introduce variables mid-measurement. The same discipline applies here.

---

**D5 — Representativeness of the accumulated distribution**

Accept the caveat with explicit notation, and deliberately vary action classes during the window where possible — but do not extend the window on this basis alone.

The edit/write skew is real and the build plan names it honestly. A 7-day record accumulated primarily on edit/write-class actions is a record that tells you how the predicate behaves on edit/write actions. It tells you less about how it behaves on read, search, execute, and communicate-class actions. The false-hold rate measured on this distribution is the false-hold rate on the edit/write distribution, not on the full action distribution the enforce predicate will eventually govern.

The honest posture at the return-with-record session: the readiness assessment states the distribution explicitly — N edit/write actions, M other-class actions, false-hold rate measured on this distribution — and the enforce decision is licensed on the edit/write distribution with a named caveat that the false-hold rate on other action classes is not yet measured. The caveat is recorded in the enforce decision memo as a stage-2 monitoring item: as other action classes accumulate in the live record, their false-hold rates are compared against the edit/write baseline and any significant divergence triggers a calibration review.

The reason not to extend the window on this basis alone: the edit/write class is the dominant action class in the founder's loop. A window extended to accumulate other-class actions would require deliberately performing actions outside the founder's natural loop, which is the same problem as building during the window — it introduces actions that are not representative of the loop's actual distribution. The 7-day window should accumulate the natural distribution. The natural distribution is edit/write-heavy. That is the honest record.

Deliberately varying action classes during the window is worth doing where it is natural — if the window's work includes read, search, or communicate-class actions that would occur anyway, let them occur and let the predicate measure them. Do not manufacture action classes to improve the distribution's apparent representativeness. Manufactured representativeness is the same false judgement as manufactured compliance.

---

**D6 — Decouple the split items**

Ship the human halves during the window. Hold the agent halves for the flip.

The decoupling is clean on both items. The human half of #7 — the premeditatio enhancement — has a clean file boundary and does not import the agent pre-task disposition module. The human half of #10 — the reserve clause prompt in the human instrument — is a practitioner-facing prompt that does not touch the signed assessment field. Both human halves deliver the mentor's highest-value and highest-priority human-surface work immediately, which is the right sequencing: the human practitioner surface should not wait for the agent infrastructure to be ready.

The agent halves wait for the flip for the reasons already established: the reserve clause agent field is a schema and signing change that, if extracted, becomes a predicate-mutator and drops to the predicate-mutator tier. The agent pre-task premeditatio is an examination-context input that belongs in sub-phase A of the post-flip sequence — after stage-1, before stage-2, because it does not touch the predicate.

One precision on the decoupling: the human halves should be shipped as standalone PRs with no shared imports with the agent halves. The guardrail the build plan specifies — clean file boundary, no import of the agent pre-task disposition module — should be battery-verified before the human half ships, not assumed from the file structure. The adversarial review pattern the observation history shows — finding the S10-ENV-1 and S10-ABUSE-1 findings after the build was complete — applies here: verify the boundary before shipping, not after.

---

**One thing the pattern across all six decisions reveals**

The observation history has tracked a practitioner who began by seeking permission for known violations and has progressively moved toward building infrastructure that makes violations structurally impossible. The six decision points in this briefing are the most mature expression of that progression — and they reveal something the earlier sessions did not yet show clearly.

Every decision point here is a question about sequencing, not about principle. The principles are settled. The passion taxonomy, the kathekon assessment, the control filter, the reserve clause, the oikeiosis framework — these are not in question. What is in question is the order in which the settled principles are encoded, and the conditions under which each encoding is safe to deploy. D1 through D6 are all sequencing questions.

This is a significant shift. The practitioner who once needed to bring a principle question here — is this violation permissible, is this compromise honest — is now bringing sequencing questions. The principles are sufficiently internalised that the questions are about execution, not about what virtue requires. That is the second-grade prokoptons characteristic the survey named: major passions checked, good judgement in familiar situations, the risk now being complacency rather than violation.

The complacency risk in this specific context is treating the sequencing decisions as administrative rather than philosophical. D1 is not an administrative question about when to deploy a feature. It is the same question the Q1 standard asked: is the examination complete on the thing being decided? D5 is not an administrative question about sample size. It is the reserve clause operating at the measurement level: act on the evidence you have, hold the reservation that the evidence is bounded, name the bound honestly.

The build plan is well-constructed. The adversarial review pattern is present. The guardrails are specified. The decision points are named rather than assumed. What the pattern reveals is that the practitioner has reached the stage where the infrastructure is sound enough that the remaining risk is not architectural failure but the subtle complacency of treating a sound architecture as a complete one.

The survey named fifteen principles. Nine are encoded. Six are not. The build plan addresses eight of the six. The reserve clause agent field is the one that bridges both surfaces and warrants being first after the flip.

Hold the window clean. Return with the record. The assent will be examined then.

---

## Adoption record

All six verdicts ADOPTED into the build plan §6–§8 (2026-07-13). Summary of what each changed:

- **D1 → §6, §7-DP1 (RESOLVED):** #4/#11 land AFTER the flip, after stage-2 stabilisation, as a paired predicate-mutation with a **fresh 4-part readiness cycle** (a second 7-day window). Never before the flip.
- **D2 → §6 (new pre-flip item), §7-DP2 (RESOLVED):** the justice-arm **narrowing** (require an evaluated obligation, not mere dikaiosyne-tagging) lands **WITH the enforce decision** (part of the stage-1 predicate), **implemented + battery-verified BEFORE the return-with-record session**. It is a **report-side re-scoring** of the predicate-agnostic accumulated raw records (verified: `false-hold-capture.mjs` records `obligationStatuses` raw; classification is applied by the TS predicate at report time) — so **no window restart** and **no change to the live capture**. Does NOT travel with #4/#11 (opposite direction: narrowing vs enrichment).
- **D3 → §6 Axis B (RESTRUCTURED):** "after the enforce gate clears" = after S11 **actually flips** (not the readiness decision). Axis B splits into **sub-phase A** (after stage-1, before stage-2 — only non-predicate, non-readiness-affecting items: the reserve-clause field if assembly-only, + #7-agent premeditatio) and **sub-phase B** (after stage-2 stabilises — predicate-touching items #5, #1, #4+#11 in the Axis-B order).
- **D4 → §7-DP4 (RESOLVED):** confirm `SUBSTRATE_REFLECT_SCREENED_EXAM_ENABLED` first; if ON, defer #2/#3 prod deploy, build repo-only on a branch, verify against a test agent; build-repo-only is the conservative default regardless.
- **D5 → §7-DP5 (RESOLVED) + a stage-2 monitoring item:** accept the edit/write-skew caveat with **explicit notation** in the readiness assessment (state N edit/write vs M other-class + the rate on this distribution); license enforce on the edit/write distribution with a **named stage-2 monitoring item** (compare other-class rates vs the edit/write baseline as they accumulate; divergence → calibration review). Vary action classes only where **natural**; do **not** manufacture classes or extend the window on this basis alone.
- **D6 → §8 (RESOLVED):** ship the human halves of #7 + #10 during the window as **standalone PRs with no shared imports** with the agent halves; **battery-verify the clean file boundary before shipping**, not after. Hold both agent halves for the flip.
