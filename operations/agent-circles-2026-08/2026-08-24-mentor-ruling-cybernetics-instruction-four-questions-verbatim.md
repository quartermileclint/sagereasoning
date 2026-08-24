# Mentor ruling — the cybernetics instruction: routing, weights, register footprint, ordinal scale (verbatim)

**Relayed by the founder 2026-08-24** (pasted directly in-session), answering
`2026-08-24-MENTOR-QUESTIONS-cybernetics-instruction-routing-and-weights.md`. **In the same relay the
founder declared `inbox/Mentor Cybernetics Instructions.rtf` BINDING.**

**Status: ADOPTED AS BINDING on the founder's relay. Verbatim wins over any paraphrase, here or
elsewhere.**

**Binds (headline; the verbatim below governs):**

1. **Q1 — routed to the STANDING-RUNNER DESIGN SESSION**, both questions, as named inputs under the
   2026-08-19 forward-reservation mechanism, joining §5d. Amending the closed generation-step document
   is *"the wrong shape."* A new generation-step session is *"not warranted."* The ATRF session is not
   the home for GS-CYB-2 despite the real dependency — **GS-ATRF-3 becomes a named dependency the
   standing-runner session inherits**, not a reason to split the questions across sessions.
   **GS-ATRF-4's stale pointer is corrected in the same pass** (records correction, no substance
   change), and any other ATRF-Integration-register entry carrying it.
2. **Q2 — YES, it collides, and the constraint must RIDE the question.** *"The mechanism is different;
   the failure mode is the same."* GS-CYB-1's registered form must carry the weights-BLOCKED
   constraint **verbatim** (text fixed by the ruling below). *"This constraint is not a design
   consideration — it is a governing constraint that precedes examination."* The design proposals are
   **held, not invalidated**.
3. **Q3 — Task 4 is AMENDED.** Full specifications live in the **governing document**; the ATRF
   Integration register carries **pointer entries only**, no longer than the shortest existing
   GS-ATRF entries. Pointer text for both questions is **fixed verbatim** by the ruling. The
   instruction's own no-build constraint *"is violated by a side effect that materially changes the
   live extraction prompt on every consult."*
4. **Q4 — the formula is AMENDED.** `E(n) = P(n) − P(n−1)` is replaced by a **sign-of-rank-difference**
   form; magnitude recorded but **equal spacing not assumed**; the equal-spacing question is inherited
   by the standing-runner session as a **named open sub-question within GS-CYB-1**. *"Tractable is not
   the same as justified."*
5. **The citation** carries the **unverified-at-relay marker** until the founder confirms it. The
   constraint *"survives on the broader grounds"* if the paper cannot be verified. **Not a blocker**
   for execution — a records-hygiene item to resolve before the governing document is finalised.

**Licenses no code.** *"Nothing in these rulings licenses a build, a route, a flag, a credential, or a
schema."*

---

## VERBATIM

### Q1 — Routing: both questions are addressed to a closed session

The 2026-08-19 principle applies, and the 2026-08-24 extension confirms it. The governing condition is the shape of the mismatch, not the origin of the carry-forward. The generation-step session is closed. Amending its governing document is the wrong shape. The questions need a home whose subject matter fits and which is not yet closed.

The three candidates:

**Standing-runner design** already holds §5d by today's ruling. §5d is an engine-class build target. GS-CYB-1 and GS-CYB-2 are also engine-class — the weighting function and the completion signal return path are both changes to the live scoring and loop architecture. Subject matter fits. The session is gated on the §6 report and is not yet open. This is the correct home for both questions under the 2026-08-19 principle.

**ATRF scoping session** holds GS-ATRF-1 through GS-ATRF-4. GS-CYB-2 is sequentially dependent on GS-ATRF-3. That dependency is real but it does not make the ATRF scoping session the right home for GS-CYB-2 — it makes GS-ATRF-3 a prerequisite that the standing-runner session must inherit as a named dependency, not a reason to split the questions across two sessions.

**A new generation-step scoping session** is not warranted. The cybernetic frame does not reopen the generation-step subject matter — it names what the existing architecture already is. Opening a new session to examine a conceptual frame would be the wrong shape for what the frame actually does.

**The ruling:** GS-CYB-1 and GS-CYB-2 are routed to the standing-runner design session as named inputs, under the 2026-08-19 forward reservation mechanism. They do not open that session early. They join §5d as the session's inherited named inputs.

**The secondary consequence:** GS-ATRF-4's stale pointer — "to be examined at the generation-step scoping session" — must be corrected in the same pass. The pointer should read: "to be examined at the standing-runner design session." This is a records correction, not a new ruling. It applies to GS-ATRF-4 and to any other entry in the ATRF Integration register that carries the same stale pointer. The correction does not change the substance of any question.

---

### Q2 — Does GS-CYB-1 collide with weights BLOCKED?

Yes, and the constraint must ride the question explicitly.

The brief's analysis is precise: GS-CYB-1 proposes a feedback controller optimising against the proximity score. It is not model weights. But it places a scorer whose gaming-robustness bar has not been cleared inside an optimisation loop — which is the substance of what ADR-012's third rung is blocked on.

The concern is not the frame; it is that a gameable virtue-scorer inside an optimisation loop trains fluent vice that scores as virtue, whether the optimisation operates on model weights or on a candidate weighting function. The mechanism is different; the failure mode is the same.

Registering GS-CYB-1 without this constraint attached would let the constraint go missing at the session that eventually examines it. That is not acceptable. The constraint is load-bearing, not decorative.

**The ruling:** GS-CYB-1 must carry the following constraint explicitly in its registered form:

*Standing constraint — weights BLOCKED (ADR-012, third rung): the gaming-robustness bar for the proximity scorer has not been cleared. A candidate weighting function that optimises against the proximity score places a gameable scorer inside an optimisation loop. This is the substance of what the third rung is blocked on, regardless of whether the optimisation operates on model weights or on a weighting function. GS-CYB-1 cannot be examined or built until the gaming-robustness bar is cleared or the question is reframed to operate outside the optimisation loop. This constraint is not a design consideration — it is a governing constraint that precedes examination.*

The design proposals in GS-CYB-1 (error signal extraction, weighting function, saturation conditions) are not invalidated by this constraint — they are held pending the bar being cleared. The standing-runner session inherits them as proposals, not as pre-answers, and inherits the constraint as the gate that precedes examination.

---

### Q3 — Task 4 grows the live extraction prompt

The instruction described itself as a documentation and conceptual incorporation task only. For Tasks 1 through 3 that was accurate. Task 4 is not — and the brief's verification is correct.

Adding GS-CYB-1 and GS-CYB-2 at full specification length to the ATRF Integration register would add approximately 2,000 characters to a 4,159-character payload injected verbatim into every `/api/reason` Layer-1 extraction prompt. That is a ~50% increase in project-context text the evaluative engine sees on every consult, on a mechanism whose architectural fix is ruled and unbuilt.

This is not what the instruction intended. The instruction's own constraint — "nothing in this output licenses a build, a route, a flag, a credential, or a schema" — is violated by a side effect that materially changes the live extraction prompt on every consult. The side effect is not a build decision; it is an unintended consequence of the register's injection architecture.

**The ruling:** the full design specifications for GS-CYB-1 and GS-CYB-2 live in the governing document (Task 1 of the instruction). The ATRF Integration register carries pointer entries only — one or two sentences naming the question, its governing constraint (for GS-CYB-1), its sequential dependency (for GS-CYB-2 on GS-ATRF-3), and a cross-reference to the governing document. The pointer entries should be no longer than the existing GS-ATRF entries in their shortest form.

The pointer form for GS-CYB-1:

*GS-CYB-1 — Proximity score as error signal and candidate weighting function. Open question: does the generation step read the proximity score from the watching table as a graded error signal, and if so, how does it use that signal to bias candidate generation toward error-reducing actions? Standing constraint: weights BLOCKED (ADR-012, third rung) — a weighting function optimising against the proximity score places a gameable scorer inside an optimisation loop; this question cannot be examined until the gaming-robustness bar is cleared. Full design specification in the Agent Cybernetic Control Architecture governing document. To be examined at the standing-runner design session.*

The pointer form for GS-CYB-2:

*GS-CYB-2 — Controlled system model and completion signal return path. Open question: does the completion signal return path constitute a formal model of the controlled system, and if so, what is the update rule by which the post-completion proximity delta modifies the generation step's candidate weighting function? Sequentially dependent on GS-ATRF-3. Full design specification in the Agent Cybernetic Control Architecture governing document. To be examined at the standing-runner design session.*

This keeps the register's injection footprint proportionate and preserves the full specification in the governing document where it belongs.

---

### Q4 — Precision: the proximity score is ordinal, not numeric

The brief is correct. The stored value is a five-value ordinal enum. The specification's formula E(n) = P(n) − P(n−1) assumes subtraction over an ordinal scale, which assumes equal spacing between ranks. That is a substantive claim about the scale, not an implementation detail.

The equal-spacing assumption may or may not be defensible. The Senecan progress grades are not presented as equally spaced — the distance between grade 3 and grade 2 is not claimed to be the same as the distance between grade 2 and grade 1. The PROXIMITY_RANK mapping makes rank-difference tractable computationally, but tractable is not the same as justified.

**The ruling:** the specification's formula is amended. Replace E(n) = P(n) − P(n−1) with:

*Error signal extraction: let R(n) be the ordinal rank of the proximity score at cycle n, mapped via PROXIMITY_RANK to an integer in {0, 1, 2, 3, 4}. The directional error signal is the sign of R(n) − R(n−1): positive means movement toward katorthoma, negative means regression, zero means no change. The magnitude of the rank difference is recorded but the equal-spacing assumption is not made — the weighting function responds to direction and domain, not to cardinal distance between ranks. Whether the rank spacing is equal is a question the standing-runner session must examine rather than inherit as a given.*

This preserves the error signal's directional utility while being honest about what the ordinal scale does and does not license. The standing-runner session inherits the equal-spacing question as a named open sub-question within GS-CYB-1, not as a resolved assumption.

---

### The unverified citation

The brief records the Rajpal et al. (2026) paper as unverified-at-relay per PR20's stale-fact discipline. This is the correct handling. The citation is load-bearing in the design constraint — it is not decorative.

The constraint as recorded in the governing document should carry the unverified-at-relay marker until the founder confirms the paper's existence and the claim it is cited for. The constraint itself — that the single backward edge is at or near the optimal configuration for information integration — is independently supportable from the cybernetics foundations in part 1 of the research. The paper is cited as the formal demonstration of a claim the broader field supports. If the paper cannot be verified, the constraint survives on the broader grounds; the citation is corrected or removed.

This is not a blocker for the instruction's execution — it is a records hygiene item to be resolved before the governing document is finalised.

---

### Summary of what the instruction now looks like after these rulings

Tasks 1 through 3 are executable as written, with one amendment: the design constraint citation carries an unverified-at-relay marker pending founder confirmation.

Task 4 is amended: full specifications live in the governing document (Task 1); the ATRF Integration register carries pointer entries only in the forms specified above; GS-CYB-1's pointer carries the weights BLOCKED constraint explicitly; GS-CYB-2's pointer carries the GS-ATRF-3 sequential dependency explicitly; both pointers name the standing-runner design session, not the generation-step scoping session; GS-ATRF-4's stale pointer is corrected to name the standing-runner design session in the same pass.

The ordinal scale amendment to GS-CYB-1's error signal formula applies in both the governing document and the pointer entry.

Nothing in these rulings licenses a build, a route, a flag, a credential, or a schema.

## END VERBATIM

---

## Two execution facts verified after the ruling, neither stated in it

1. **The "Agent Cybernetic Control Architecture governing document" DOES NOT EXIST.** Repo-wide, the
   only files mentioning "cybernetic" are this session's own question brief and register (verified
   `grep -rli cybernetic operations/ adopted/ website/src`). The instruction's Task 1 said *"add a new
   section to the generation-step governing document"*; Q1 rules that amending that closed document is
   the wrong shape; Q3 then refers to *"the governing document"* as the home for the full
   specifications. **Executing therefore requires CREATING a new governing document** — an implication
   of the rulings, not an instruction either document states. Flagged rather than assumed.
2. **The Q1 records correction is narrow and bounded.** The stale phrase *"generation-step scoping
   session"* occurs **exactly once** in the ATRF Integration register (`current_phase`), in
   GS-ATRF-4's closing line. It occurs in 12 other repo documents, **which the ruling does not scope
   in** — the correction applies to the register only, and over-reaching would rewrite closed records.

## Cross-references

- `inbox/Mentor Cybernetics Instructions.rtf` — the instruction, **declared BINDING by the founder 2026-08-24**
- `2026-08-24-MENTOR-QUESTIONS-cybernetics-instruction-routing-and-weights.md` — the four questions
- `2026-08-24-mentor-ruling-deliberation-reading-open-question-routing-verbatim.md` — §5d's routing, which this ruling builds on
- `2026-08-19-mentor-ruling-late-arriving-carry-forward-ruled-session-verbatim.md` — the forward-reservation mechanism
- `adopted/adr/2026-06-24-sage-practice-measurement-instrument-reframe.md` — ADR-012, the third rung (Q2)
- `website/src/data/project-context.json` · `website/src/app/api/reason/route.ts:1410` (Q3)
