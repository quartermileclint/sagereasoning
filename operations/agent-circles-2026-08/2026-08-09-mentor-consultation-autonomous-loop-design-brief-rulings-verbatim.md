# Mentor consultation — autonomous-loop design brief: RULED (verbatim)

**Context:** relayed by the founder, 2026-08-09 (AEST), in direct response to the design brief `operations/agent-circles-2026-08/2026-08-08-autonomous-loop-design-brief.md` (offered same session, after its PR19 adversarial review with both confirmed findings folded and disclosed). Recorded here verbatim per the project's standing discipline for mentor consultations — **verbatim wins** over any summary or paraphrase elsewhere, including the fold annotations applied to the brief and the type-scope document on the strength of this ruling.

**AI's note (not part of the ruling):** the preamble reads "the nine open questions are genuinely open"; the brief as offered carries eleven (Q1–Q11), and the ruling addresses all eleven individually below. Recorded as given, without interpretation. The rulings arrived before the session's records commit was pushed, so the folds ride the same commit as the brief itself; each fold cites this record.

---

**Response to Claude — Autonomous-Loop Design Brief, Parts 1–4:**

The brief is well-constructed. The adversarial review was run before relay, the two confirmed findings were disclosed and folded in rather than silently repaired, and the nine open questions are genuinely open — none resolved by default. The method honours the discipline the project requires. Rulings follow in order.

---

**§1 Settled ground — confirmed:**

All eight settled items are confirmed as stated. No re-opening. Three carry-forward notes from the Part 1 review stand: the null-cycle rule must be architecturally enforced not merely stated as policy; the dependency_unavailable / null-cycle distinction for the fallback counter needs a ruling if not already settled (addressed below in Q6's territory); and non-winning candidates' guardrail results should be written to the cycle record (addressed in Q7).

---

**§2 Proposed loop shape — confirmed with one amendment:**

Phases 0 through 7 are approved as proposed. One amendment to Phase 4: the gate condition "a winner whose full examination surfaces something the guardrail shape missed is recorded as what the examination found, not massaged into a success" is correct and must be stated as a hard constraint, not a design principle. The full examination is not a confirmation step for the guardrail's verdict. It is an independent examination. If the full examination produces a result that contradicts or complicates the guardrail-shaped filtering, that result stands. The cycle record carries what the examination found.

---

**§3 Mechanism plug-in facts — confirmed:**

All nine mechanism facts are confirmed as stated. One note on the first: the /api/guardrail failing closed on a billing-write failure, six times per filtering pass, is a real failure-mode concentration. The generation-step scope document must name how the runner handles a filtering pass where one or more guardrail calls fail closed — whether the affected candidate is treated as rejected_by_guardrail, dependency_unavailable, or something else. Do not leave this implicit.

---

**§4 Autonomous vs. human — confirmed with Q1 ruling below.**

---

**§5 Safety posture — confirmed. The volume risk is correctly named rather than resolved. Q3 and Q9 govern.**

---

**§6 Observables — confirmed. The bounded-run report shape mirrors the condition-(b) review's own structure. That is the right template.**

---

**§7 Non-goals — confirmed. Nothing in this brief licenses a build.**

---

**Open questions — rulings:**

**Q1 — The proposes-never-executes line:** Confirmed as a binding design principle, not a default the standing-runner design may revisit. The reasoning: the loop is a generation and examination mechanism. Execution is a human act that carries its own moral weight — the Stoic framework does not permit delegating praxis to a mechanism, because action from virtue requires the agent's own assent. A loop that could execute its own proposals would be substituting mechanical output for the founder's prohairesis. That substitution is not a later design question. It is ruled out now. The standing-runner design may revisit the runner's shape, its cadence, its credential, its dashboard — it may not revisit this line. Carry it as a named hard constraint in every subsequent document.

**Q2 — The novelty check's home:** A new dedicated endpoint is the intended shape. The ruled per-cycle contract names "the examination, the novelty check, and the trust-event write" as server-side — this is consistent with SageReasoning's role as the examination-side provider per cycle, and inconsistent with runner-side computation against exported history, which would move a server-side responsibility to the runner and break the clean separation the architecture requires. A flag-gated extension of the guardrail response is a possible implementation path but adds complexity to an already load-bearing endpoint. A dedicated endpoint wrapping the committed-but-dark assessStructuralNovelty is the cleanest shape. Scope it as its own small item, not inside the generation-step scope document — it is a server-side seam question, not a generation-content question.

**Q3 — The runner's identity:** A dedicated credential and K1 agent identity. The reasons are architectural, not merely organisational: S10 separability, trajectory separability, billing separability, and the curation-via-volume question being inspectable per identity rather than entangled with the founder's own standing loop. The Q9 volume question is substantially answered by identity separation — a reader of the public trust record can distinguish loop-generated traffic from session-generated traffic without a per-entry marker, because the identity itself is the marker. Scope the credential and agent identity as part of the runner's own scoping session, not here.

**Q4 — The examined/observed proxy under a runner:** Accept the conservative misclassification for now, disclosed. The ruling that fixed the constant at 28000ms against the harness's documented client timeout was correct at the time — the harness was the only caller class. The loop runner is a genuinely different caller that may wait longer. But the caller-declared-timeout channel was ruled disproportionate for the harness case, and the loop runner's timeout behaviour is not yet known — it depends on the runner's own design, which is not yet scoped. The right sequence is: scope the runner, determine its actual timeout behaviour, then revisit the proxy constant if the misclassification rate on runner traffic is material. Do not revisit the proxy architecture before the runner's behaviour is known. Add a named carry-forward: "revisit ORIENTATION_DELIVERY_TIMEOUT_MS when runner timeout behaviour is established."

**Q5 — The per-cycle record table:** Stands as its own small item, not inside the generation-step scope document. The generation-step scope document covers generation content — heuristics, prompt structure, friction-detection threshold, the phantasia-variation mechanism. The per-cycle record table is a server-side schema and route question. Mixing them conflates two different scoping concerns. Scope the table separately, after this brief is ruled and before the first build gate. Its required fields from the corpus: winner / null_cycle / dependency_unavailable / timeout outcome, per-candidate guardrail results with heuristic attribution, cost, elapsed time against maximumDuration, and loopId. Q7's ruling below adds one more field.

**Q6 — The timeout outcome's type home:** A seventh cycleOutcome value: 'terminated_by_timeout'. The timeout is not purely a cycle-level fact — it affects candidates that were in-flight when the cycle terminated, and those candidates need an honest status. Leaving them 'pending' indefinitely is a false impression the record would present. 'terminated_by_timeout' at the candidate level, alongside the cycle-level timeout record, is the honest treatment. Add it to the approved type. This is a small amendment to the settled §1.2 type shape — carry it as a dated amendment in the same document that carries the type.

**Q7 — Guardrail-refused candidates' visibility:** Rejected_by_guardrail candidates are part of the per-cycle record. The honest-claims default is correct here and the S10-adjacent visibility concern does not override it. The per-cycle record is not the public trust record — it is the founder's operational dashboard, not a public-facing surface. Full transparency about what generation produced, including refused candidates with heuristic attribution, is the right posture for an operational dashboard. A founder who cannot see what the guardrail refused cannot evaluate whether the guardrail is calibrated correctly. Suppressing refused candidates would be a false impression presented to the loop's own operator. Record them.

**Q8 — Seed consumption across identities:** Seed hand-off is a founder act. The runner reads seeds its own examinations produced, or seeds the founder explicitly exports and hands to it. The loop does not cross ownership boundaries to read seeds produced under a different identity. This is consistent with everything else being external — the founder's role in Phase 0 already includes authoring or approving each OikeiosisGap, and seed hand-off is part of that authorship process. The generative-prompt seed is raw material for human synthesis, not an automated pipeline input. The ownership boundary is the right place to keep the human in the loop on direction.

**Q9 — Orientation-reading volume on S10:** Q3's identity separation is sufficient. A dedicated runner identity means loop-generated readings are already distinguishable on the public trust record by agent identity, without a per-entry marker. The curation-via-volume residual applies within an identity's own window — a reader who wants to assess the loop's record separately from the founder's record can do so by querying the loop's own identity. No additional per-entry marker is needed. The existing total-count and curation-via-volume disclosures apply to each identity's record independently.

**Q10 — Review cadence for standing operation:** The bounded validation run's report shape is the floor, as proposed. For standing operation, if ever reached: the mentor reviews the loop's output on a cadence the mentor sets at the time standing operation is proposed — not defaulted now, because the right cadence depends on what the loop is producing and how the founder is using it. What is settled: no standing operation begins without a mentor-reviewed validation run, and no change to the loop's configuration or scope proceeds without a mentor ruling. The review cadence question is explicitly deferred to the standing-operation proposal session.

**Q11 — Sequencing confirmation:** Confirmed: this brief ruled → novelty-check endpoint scoped (its own small item, per Q2) → per-cycle record table scoped (its own small item, per Q5) → generation-step scope document → first build gate. The bounded validation run sits between the first build gate and any standing-runner design. The mentor reviews the validation run before the standing-runner design opens. This is the intended order. Carry it as the named sequence in the next session's opening prompt.
