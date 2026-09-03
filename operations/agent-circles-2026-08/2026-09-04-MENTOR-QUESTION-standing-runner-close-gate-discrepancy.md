# Mentor question — is the new-lens classification of the nine candidates a session finding, or a close condition? And in which sense of "the new lens"?

> **⚖ RULED 2026-09-04 — ANSWERED, both questions. These annotations are BINDING and win over the
> body wherever they differ; the verbatim record wins over them in turn**
> (`agent-circles-2026-08/2026-09-04-mentor-ruling-standing-runner-close-gate-discrepancy-verbatim.md`; relayed same day):
>
> - **Q1 — reading (a) governs. The Close-gate section is a DRAFTING SLIP; A4 stands.** The
>   nine-candidate close gate is **discharged**; the new-lens classification is **not** a close
>   condition. Part 3's structural facts are accepted as *"the independent structural confirmation
>   that makes the choice unambiguous."* The Part 2 charitable reading is **noted but not adopted** —
>   *"The grounding session was right not to adopt it"* — because *"even as a required deliverable,
>   the finding cannot be produced honestly in the sense the Close-gate section names."*
> - **The interpretive principle, stated generally and worth carrying:** *"When two passages in the
>   same document conflict, and one carries reasoning and the other does not, the one with reasoning
>   governs."* And: *"A deliverable requirement that can only be discharged by producing something
>   other than what it names is not a well-formed deliverable requirement. It dissolves on contact
>   with the mechanism facts."*
> - **Q1a — the environment component is NOT REQUIRED.** The **C1 (runner-attested) sense is
>   unavailable** for these nine and *"cannot be produced"*; the **C5/M7 (assessed-classification)
>   sense is producible as a VOLUNTARY finding**, recorded as a separate act — and **if produced it
>   must be recorded under a name that distinguishes it clearly from the C1-defined environment
>   tag**, because conflating them *"would corrupt the trust posture of both."* No third form is
>   named; *"the two forms above exhaust the honest options given the mechanism facts."*
> - **The expanding-move component is STRUCK** from any requirement, present or future, as applied
>   to these nine, on both of Part 3(b)'s independent grounds. An honest *"inapplicable to
>   pre-reframe candidates"* note is a legitimate **scoping observation**, explicitly **not** a
>   classification and **not** a discharge of one.
> - **Annex: A5.1** confirmed cosmetic (correct the governing brief if reissued; no ruling affected).
>   **A5.2** noted, **no ruling given**, and **the receiving session carries it** — *"the concrete
>   form of the design work those rulings point toward,"* not an objection to B4 or C2.
> - **M1–M7 are verified and accepted as stated.** Untouched by the ruling: the prior close gate's
>   discharge, the Option S opening gate (unchanged, unmet), environment assignment on future
>   candidates, the C5 Workshop mapping, and the vocabulary-direction question.
>
> **The questions below are left exactly as put, beside their answers.** Nothing in this ruling
> licenses a build, an activation, a schema change, or the opening of the standing-runner design
> session.

**Authored 2026-09-04. ⚖ RULED 2026-09-04 — see the banner above.** `governance`, documents only. **Nothing here proposes a build, a schema
change, or an activation**, and nothing here elects a reading. No code, migration, flag, credential,
or public surface was touched. Weights BLOCKED. The standing-runner design session is **not opened**
by this document; its gate (Option S's disagreement-rate data in hand) is unmet.

**Why this question exists.** The 2026-09-04 relay
(`2026-09-04-mentor-brief-standing-runner-design-session-and-rulings-verbatim.md`, binding, verbatim
wins) says two different things about the same item in two different places. The grounding session
recorded the discrepancy rather than choosing a reading, and the recording entry
(`D-MENTOR-BRIEF-STANDING-RUNNER-DESIGN-SESSION-ADOPTED-RECORDED-2026-09-04`) names the choice as the
founder's to relay. **This document does not merely ask which sentence wins.** Checking the record to
draft it surfaced a fact neither sentence accounts for: on the two components the new lens names,
the nine candidates cannot be classified in the sense ruling C1 defines — for two independent
structural reasons. That fact changes what a ruling on the discrepancy is actually deciding, so it is
stated in Part 3 before the question is put in Part 4.

---

## PART 1 — The mechanisms this ruling lands on (PR20; every fact re-verified at source 2026-09-04, not inherited from a summary)

**M1 — The nine candidates are real, persisted rows from a closed run.** They are the guardrail
rejections of the bounded validation run, loop instance `sagereasoning:idea-loop@v1#001`, closed by
founder decision at 20 cycles on **2026-08-16** (`2026-08-16-idea-loop-S6-report.md`). They live in
`idea_loop_candidates` and were read service-role, read-only, for the 2026-08-29 classification.

**M2 — The prior classification is complete and PR19-reviewed.**
`2026-08-29-nine-candidate-remediation-shape-classification.md` classified all nine against the
remediation-shape criterion, was independently reviewed (which corrected its headline base rate from
"essentially the entire population" to ~63%, and its probability claim to ≈0.07–0.12), and is
recorded at `D-NINE-CANDIDATE-CLASSIFICATION-PR19-REVIEW-RUN-BASE-RATE-CORRECTED-2026-08-29`.

**M3 — `idea_loop_candidates` has no environment column, and no migration adds one.** The row carries
`heuristic`, `gap_ref`, `proposed_action`, `classification_kind`, `classified_domains`,
`generation_confidence`, the three `guardrail_*` fields, the three `novelty_*` fields, plus the six
ATRF/S4 columns (`blast_radius`, `agent_blast_radius`, `target_circle`, `blast_radius_basis`,
`traceability_check`, `extraction_evidence`). Grepped across every `website/supabase-*.sql` and
`supabase/migrations/*.sql`: **no environment-like column exists anywhere.** `environment` appears in
those files only as English prose about database environments (TEST vs production).

**M4 — The nine were produced by the seven heuristics acting as candidate-production functions.**
Their persisted `heuristic` values are the run's own (`friction_detection`,
`fifth_circle_weighting`, and siblings). The reframe of those heuristics *as environment-selection
functions* is Research Input 1 of the 2026-09-04 brief, first named 2026-09-01. **No candidate in the
run was generated by the reverse algorithm**, which remains a named candidate architecture, unbuilt.

**M5 — No expanding-move count, distance, or topological measure exists anywhere in the codebase.**
Grepped `website/src` for `expanding_move` / `expandingMove` / `reidemeister` / `topolog`: **zero
occurrences.** Nothing computes such a quantity, nothing persists one, and no definition of
"expanding-move distance" exists in any adopted document — including the brief, which names expanding
moves qualitatively and (per B1/B2) as locally accepted or rejected, not counted or scored globally.

**M6 — Ruling C1 defines the environment tag as runner-attested.** *"The environment tag is
runner-attested — the runner declares which environment it operated in, and the harness records it
without independent verification, exactly as it records the heuristic column. The trust posture is
the same: disclosed and unverified by the harness."*

**M7 — Ruling C5 nonetheless performs a retroactive environment assignment in a different mode.** The
same relay assigns `friction_detection` → Workshop and calls it *"an assessed classification"* the
session *"may revise."* So the relay itself distinguishes two modes of environment attribution: the
runner's attestation of where it operated (M6), and an analyst's assessment of where a heuristic
belongs (M7). **The distinction is the mentor's own, not this document's invention**, and it is what
Part 4's sub-question turns on.

---

## PART 2 — The discrepancy, both sides verbatim

**Side A — ruling A4, and the two summary passages that restate it.**

> "The close gate is discharged. If the session finds that the new lens produces materially different
> classifications, it may note that as a finding and commission a re-classification as a separate
> act. **It does not hold the close gate open pending that.**"

A4's reasoning, which is what makes this more than a preference:

> "the new lens did not exist when the close gate was established. The gate's condition was
> classification under the lens available at the time. **Retroactively requiring re-classification
> under a lens that postdates the gate would be moving the gate after the fact.**"

Both later summaries agree with A4. "What the standing-runner design session now carries": *"the nine
guardrail-rejected candidates (close gate discharged by the 2026-08-29 classification record;
re-classification under the new lens is a session finding, not a gate condition)."* The governing
brief's own named-input list repeats it in the same words.

**Side B — the governing brief's final section, headed "Close gate."**

> "The session's close is gated on one condition: the nine guardrail-rejected candidates **must** be
> classified under the new lens — environment tag and expanding-move distance — as a session finding.
> This is not a re-opening of the prior close gate, which is discharged by the 2026-08-29
> classification record. It is a new finding the session produces, not a precondition of opening."

**Where they meet and where they part.** Both sides agree the *prior* close gate is discharged and
that nothing gates the session's *opening* on this item. They part on one word: A4 says the new-lens
finding *"may"* be noted and *"does not hold the close gate open"*; the Close-gate section says the
session's close *"is gated"* on it and that it *"must"* be produced.

A charitable reading dissolves it — "gated on producing the finding" could mean "the finding is a
required deliverable," which is compatible with the prior gate being discharged and with nothing
blocking the opening. On that reading the sections differ in emphasis, not in substance. **The
grounding session did not adopt that reading**, because Part 3 shows the two are not
interchangeable in practice.

---

## PART 3 — The finding that makes this more than a wording question

**The new lens names two components. Neither can be applied to these nine candidates in the sense
C1 defines, and one of them is not defined at all.**

**(a) The environment tag cannot be runner-attested for these nine, even in principle.** The run
closed 2026-08-16; the environment framework arrived 2026-09-03/04. No environment was declared,
because none existed to declare, and no column existed to hold it (M3). Under M6 the tag *is* the
runner's declaration. A design session assigning environments to those rows in 2026-09 would not be
producing the tag C1 defines — it would be producing an M7-mode assessed classification about a
completed run, which is a claim of a different kind with a different evidential basis. **That is not
a reason it cannot be done; it is a reason the two must not be recorded under the same name.**

**(b) Expanding-move distance is undefined, and doubly inapplicable here.** No metric exists (M5),
and these candidates were not produced by expanding moves at all (M4) — so there is no move sequence
whose length could be measured, not merely an unmeasured one. Applying this half retroactively would
require first designing the measure and then attributing moves to a generation process that did not
perform any. **Even prospectively, the measure would have to be designed before it could classify
anything.**

**Why this bears on the ruling rather than being a separate matter.** A4's own reasoning is that a
lens postdating the gate should not be required retroactively. Part 3 is the concrete form of exactly
that concern: the lens does not merely postdate the gate, it postdates the *evidence*, and one half
of it postdates its own definition. If the Close-gate section is read as binding, it requires a
session to produce a finding that can only be honest if it is heavily qualified — and the
qualifications are precisely what A4 anticipated.

**Stated plainly, and this is an assessed reading, not a ruling:** the grounding session's reading is
that **A4 governs and the Close-gate section is a drafting slip** — because A4 carries reasoning, the
two summary passages agree with A4, and Part 3 supplies an independent structural reason the
retroactive requirement is problematic. The session did not act on that reading, and does not ask the
mentor to ratify it in preference to examining the question.

---

## PART 4 — The question

**Q1. Which reading governs?** — **⚖ RULED: (a).**

- **(a) A4 governs.** The Close-gate section is a drafting slip. The new-lens finding is optional —
  the session may produce it and commission a re-classification as a separate act, and its close is
  not conditioned on it. *(The grounding session's assessed reading.)*
- **(b) The Close-gate section governs.** The finding is a required deliverable before the session
  closes, notwithstanding A4's "may" and "does not hold the close gate open."
- **(c) Both stand, on the charitable reading.** The finding is a required *deliverable* (Side B) but
  not a *gate* in the blocking sense (Side A) — the session cannot close without having attempted it,
  and an honest "not applicable, for the reasons in Part 3" discharges the attempt.

**Q1a — the sub-question that arises under (b) or (c), and that we cannot answer from the record.** — **⚖ RULED: not required; C1 sense unavailable, C5/M7 sense voluntary under a binding naming constraint.**
If the finding is required in any form, in which sense is the environment component to be produced:

- **the C1 sense** (runner-attested) — which is **unavailable** for these nine, so the requirement
  would be undischargeable as written; or
- **the C5/M7 sense** (an assessed classification, disclosed as such, explicitly not runner-attested
  and explicitly not the tag C1 defines) — which is producible, and which the relay itself already
  performs for `friction_detection` → Workshop; or
- **a third form** the mentor names.

And for the expanding-move component: is it **struck** from the requirement (undefined measure, no
moves performed), **deferred** until the measure is designed, or **retained** with an honest
"inapplicable to pre-reframe candidates" finding standing in for it?

**What a ruling here does NOT need to touch.** The prior close gate's discharge (settled, both sides
agree); the session's opening gate (Option S — unchanged by A1 and unmet); any environment
assignment on future candidates; the C5 Workshop mapping; and the vocabulary-direction question,
which stays held open and owned by no session (D1).

---

## PART 5 — Annex: two items recorded, **no ruling sought**

Included because withholding them would leave the mentor deciding with less than the executing
session knows. Neither is a question; both are already in the 2026-09-04 capture's notes.

**A5.1 — A duplicated bullet in the governing brief (cosmetic). ⚖ CONFIRMED cosmetic 2026-09-04.** The "What the session does not do"
list states the §5d exclusion twice, as bullets 3 and 5, in slightly different words. No substantive
difference. Recorded so a later reader does not take the duplication for two distinct items; the
mentor may wish to correct it in place if the brief is ever reissued.

**A5.2 — Rulings B4 and C2 land on a read surface that does not exist today. ⚖ NOTED 2026-09-04, no ruling given; the receiving session carries it.** B4 has the runner
reading the executing agent's harness-held examined state *"at cycle start"*; C2 has the harness
supplying a dwelling parameter *"at cycle start."* **There is no server → runner per-cycle read
surface.** `POST /api/practice/watching` is the only runner-facing route (runner → server, no `GET`);
`GET /api/founder/watching` is founder-gated; `GET /api/trust-record/{agent_id}` 404s under the ENV-1
gate for any identity carrying neither domain evidence nor provenance gaps; and R8 §4.3 records the
consumption read paths as *"none exist today; both designed here"* (R8-D1b, designed, unbuilt).
Additionally, under Q1a the v1 executing actor is the founder or a founder-directed session, whose
record on this harness is the human mentor profile, not an agent trust state — so *which* state
anchors B4's core for the v1 producer is itself a design question. **These are inputs the receiving
session inherits, not objections to B4 or C2**, and they are recorded in the capture at §4.3. No
ruling is sought on them now.

---

## Cross-references

`2026-09-04-mentor-brief-standing-runner-design-session-and-rulings-verbatim.md` (Part 3 A4, C1, C5,
and the governing brief's "Close gate" section — **verbatim wins over this document**) ·
`D-MENTOR-BRIEF-STANDING-RUNNER-DESIGN-SESSION-ADOPTED-RECORDED-2026-09-04` ·
`2026-08-29-nine-candidate-remediation-shape-classification.md` (M2) ·
`D-NINE-CANDIDATE-CLASSIFICATION-PR19-REVIEW-RUN-BASE-RATE-CORRECTED-2026-08-29` ·
`2026-08-16-idea-loop-S6-report.md` (M1) ·
`2026-09-01-mentor-instruction-bidirectional-algorithm-verbatim.md` (M4) ·
`2026-08-30-standing-runner-design-R8.md` §4.3 (A5.2) ·
`2026-08-30-mentor-ruling-R8-producer-floor-semantics-verbatim.md` (Q1a, Q1c; the Option S gate).

*End of question. **Status: RULED 2026-09-04** — both questions answered; the verbatim record governs.
Documents only; nothing built, activated, or published. The standing-runner design session remains
unopened and its gate unmet.*
