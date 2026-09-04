# Option C — where the at-action seam's first caller lives (SCOPE)

**Status:** Scope only. **Nothing is built, wired, activated, or licensed here.** No schema, flag,
credential, migration, deploy, live op, or public-doc change follows from this document.

**Written:** 2026-09-04, at founder instruction ("scope option C"), following
`D-S11-P1-AT-ACTION-SEAM-BUILT-D5-FLAG-SUPPLIED-2026-09-04` (which built the seam, dark) and
`D-S11-H3-ADVISORY-RECOMMENDATION-REMOVED-FROM-INJECTION-2026-09-04` (Option B).

**Binding context, unchanged by anything below:** the S11 flip is **REFUSED**
(`2026-07-12-mentor-consultation-s11-enforce-gate-verdict-verbatim.md`). Register **P4** (one evaluated
cardinal domain), **P5** (no denominator), **P6** (no window started) are all open. Wiring this seam
addresses **none** of them, and this document does not treat it as progress toward the flip.

---

## 1. The question, as the follow-on prompt states it

`interventionInputFromAtAction` exists and nothing calls it. Four sub-questions were named, none
answered anywhere:

1. Where would the seam's caller live?
2. What assessment does it receive?
3. Does it need the loop-closure state (the `kathekonEngagement` injection param exists for this)?
4. What does it do with the resulting `InterventionRecommendation` while S11 stays refused — log it,
   discard it, or surface it somewhere new?

Sub-question 4 is the one that decides the other three, and it is the one this document argues has a
wrong-looking obvious answer.

---

## 2. Finding A — the seam's inputs already exist at two live sites, computed by the same predicate

Verified at source, not inferred:

- **The accreditation write boundary.** `loop-fold.ts:608` already calls
  `assessKathekonEngagement(kathekonSignalsFromAssessment(assessment))` on **each element of the
  re-verified provenance chain**, already extracts the `examination.{ref,depth_tier,prior_feedback_ref}`
  markers, and already identifies **each loop's OPENING verdict** in order to run the three-way
  character / self_regarding / instrument_calibration split. Everything the seam needs is in hand there.
- **The live consult path.** `/api/reason/route.ts:193` imports `practiceSuggestionFor`, whose B1
  candidate (`practice-suggestion.ts:717`) runs the **same predicate on the consult's own assessment**,
  live today, behind `SUBSTRATE_PRACTICE_SUGGESTION_ENABLED` (set).

**Consequence:** the marginal cost of a caller at either site is small, and the "one shared reading"
discipline is already satisfied at both — the seam would consume an engagement that exists rather than
computing a second one. This is a reason to be *more* careful, not less: cheap wiring is how a MEASURE
mechanism acquires consumers it was never scoped for.

---

## 3. Finding B — G6(a) and the live loop-closure gate are different bindings, and conflating them mis-sites the caller

The prompt says wiring the seam "is the FIRST piece of the S11 write-boundary G6(a) qualification". The
phrase *write-boundary* invites the reading that the caller belongs in
`api/accreditation/[agent_id]/loop-closure-gate.ts`. **Those are two different bindings:**

- **The loop-closure gate** (live, DETECT mode; `SUBSTRATE_LOOP_CLOSURE_GATE_ENABLED=true`,
  `_REJECT` unset) asks *"did the examination loop close?"* Its enforcement act is **refusing a
  credential write** (422). It is retrospective: every action in the chain has already happened.
- **G6(a)** (mentor Q3) is a **decision-table rule about proceeding**: an unclosed correction loop ⇒
  do-not-proceed until closed, **qualified** so that a "contrary; no kathekon factors detected" verdict
  is log-and-continue plus a developmental flag, never a do-not-proceed. Its enforcement act is
  **holding an action**.

A caller in the loop-closure gate could only ever make the *credential* conditional on the seam's
reading. It could not hold anything. So "wire it at the write boundary" answers sub-question 1 with a
site that structurally cannot perform G6(a)'s act. **This is the first thing a build session would get
wrong, and it is why this scope exists before any code.**

---

## 4. Finding C — a consult-time caller covers the wrong population (P5, restated at this seam)

The genuinely dangerous actions are on the **guard** path. `runGuard` writes no record; capture fires
only inside `runConsult`. That is register **P5**, and it is why part (3) of the readiness standard was
unmeasurable on the first window.

> **⚠ STALE AS WRITTEN — annotated 2026-09-05 (grounding session); the body above is preserved unedited.** *"`runGuard` writes no record"* was inherited from register P5's then-current prose and was already false when this scope was drafted: the guard-path capture (P8a — `buildGuardHoldRecord`, schema `false-hold-record-v4`, `path: "guard"`) landed on 2026-08-17 (commit `3e8f231`, "R2b item 8") behind the same `GATE1_FALSE_HOLD_CAPTURE` flag. The register's P5 row was corrected in place on 2026-09-05 under the binding P6 ruling (`2026-09-05-mentor-ruling-P6-window-recommendation-verbatim.md`), which names this document's §4 as having inherited the stale text. **P5's STATUS is unchanged (OPEN) — activation is open, the flag is unset, and no guard record has ever been written — so this finding's conclusion (a consult-only caller covers the wrong population) still holds; only the mechanism sentence is stale.**

The same gap applies to the seam. A caller sited on the consult path would compute a per-action
recommendation for exactly the population that is **already** over-represented — ordinary file writes —
and none for the population the rule exists to govern. **Any siting decision that does not name P8a
(guard-path capture) as its precondition is measuring the easy half and calling it coverage.**

---

## 5. Finding D — sub-question 4 has a trap, and Option B is the reason it is visible

The obvious answer to "what does it do with the recommendation" is *surface it* — on the `loop_fold`
block (already a MEASURE annotation on the write 200) or on the consult response.

**Both re-create, at a new surface, what Option B removed hours earlier.** The H3 advisory's
recommendation was removed because a decision-table row injected next to an action reads as that
action's answer. A `do-not-proceed` on a public response while ENFORCE is refused is worse in one
respect: it is not merely mis-scoped, it is **claim-shaped**. `loop_fold` is documented publicly
(`loop-fold/v2`, `llms.txt`), so adding recommendations there is an R18 act requiring founder-signed
wording, and it would publish decision-table verdicts the project has explicitly refused to enforce.

The distinction that keeps this coherent, and which any build must state: Option B removed a
recommendation that was **wrongly scoped** (the standing aggregate, which P1 rules is not the
per-action input). The seam's output is **correctly scoped**. Adding the correct one is not a reversal
of removing the incorrect one — but the sequencing will *look* like churn in the log unless it is said
plainly, and "it looks like churn" is not a reason to skip saying it.

---

## 6. Finding E — the P6 window does not currently measure the recommendation, and that is an unexamined gap

`2026-08-15-false-hold-new-window-scoping-note.md` specifies what the new observation window captures:
v3 regime-stamped records, the narrowed predicate as the frozen classifier, guard-path records (P8a),
coverage accounting, printed bounds, representativeness break-out. **It never mentions the decision
table or the recommendation** — the window measures *hold classification*, not *what the table would
have recommended*.

That is a real gap, because part (3) of the readiness standard is about false **holds**, and under
G6(a) a hold is what a `do-not-proceed` produces. Measuring the classification without the
recommendation measures the predicate's input to the rule, not the rule's output.

**But P6's own contamination rule binds hard here:** every guard-bundle edit changes the measured
instrument, so the window must open on a stable instrument and must not span edits. Adding the seam to
the capture layer is exactly such an edit. **Therefore, if the seam is ever to serve the window, it
must land in R2 (dark, with P8a) — not after the window opens.** There is a real sequencing deadline on
this decision, and it is not far away.

---

## 7. The candidate resolution I would recommend, and its ground

**Site the seam's first caller in the capture layer, as MEASURE instrumentation for the P6 window —
not in the loop-closure gate, not on the consult response, not on `loop_fold`.**

Answering the four sub-questions on that siting:

1. **Where:** the false-hold capture path, alongside the P8a guard-path extension, landing in **R2**
   (dark build) so the window opens on one stable instrument. Not the write boundary (Finding B); not
   a response surface (Finding D).
2. **What assessment:** the at-action verdict for the captured action — the same object the capture
   record already projects its signals from. At the write boundary variant (if ever built) it would be
   the loop's **opening** verdict, which `loop-fold.ts` already isolates.
3. **Loop-closure state:** **yes, and the injection param should be used.** The capture path already
   has the engagement; passing it via `engagement` guarantees the seam and the eventual loop bound key
   on **one** reading rather than two computations that can drift. Recomputing would re-open, at a
   third site, the divergence class P1 exists to close.
4. **What it does with the output:** **records it in the capture record; surfaces it nowhere.** No
   agent-facing injection, no public response field, no trust-record entry. The window then measures
   what the table *would have* recommended per action, against the classification it already measures —
   which is what part (3) actually needs, and which costs no claim while ENFORCE is refused.

**Why this framing rather than "the first piece of G6(a)":** it is honest about what the work is. A
recommendation that is computed, recorded, and never read by anything is instrumentation. Calling it
the first piece of an enforcement path invites the next session to treat siting as settled and move on
to binding — which the 2026-07-12 verdict forbids unconditionally, and which P4/P5/P6 make premature
regardless.

---

## 8. What this scope does NOT claim, and what is genuinely open

- **It does not claim the recommendation should be measured at all.** Finding E identifies the gap;
  whether the window's purpose should widen to cover it is a **founder election, and plausibly a
  mentor question** — it changes what the window is for, and P6's design has already been ruled on
  once. I would not widen it on AI judgement.
- **It does not settle whether a write-boundary variant should also exist.** Finding B rules it out for
  *performing* G6(a); it does not rule out a retrospective MEASURE reading there. That is a separate,
  smaller question.
- **It does not license R2 to include this.** R2's contents are the founder's; this document argues
  only that *if* it is done, R2 is the deadline, because of P6's contamination rule.
- **It answers nothing about P4 or P5.** P8a addresses P5's denominator; nothing here addresses P4's
  single evaluated cardinal domain, which no amount of seam wiring can fix.
- **It is not S11 movement.** The flip remains **REFUSED**; the assent is re-confirmed at flip time
  (PR7); weights remain **BLOCKED**; the 0h call remains the founder's.

**The one thing a build session must not do:** treat "the seam has a caller" as evidence that the
enforce path is closer. The seam existing and the seam being called are both MEASURE facts. The
distance to the flip is P4, P5, P6 and a founder-walked Critical activation — none of which this
touches.
