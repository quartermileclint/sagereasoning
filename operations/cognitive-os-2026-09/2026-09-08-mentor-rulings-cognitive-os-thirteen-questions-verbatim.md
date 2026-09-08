# MENTOR RULINGS — Cognitive OS integration, thirteen questions — VERBATIM RECORD

**CANONICAL. Where this file differs from any summary, decision-log entry, register row, gap analysis
or close, THIS FILE WINS.**

**Relayed by the founder 2026-09-08 AEST. Answers
`2026-09-08-MENTOR-QUESTIONS-cognitive-os-integration-FOR-RULING.md` (thirteen questions, three
tiers). ADOPTED AS BINDING SPECIFICATION.**

**One label note, recorded and NOT corrected in the text below:** the mentor's own heading reads
"S8 2026-09-08". That is the mentor's session numbering and it collides with this project's S8
(the 2026-09-07/08 Option C investigation). The heading is reproduced verbatim; the collision is
noted here so a future session does not conflate the two.

---

## Cognitive OS integration — pre-build rulings, S8 2026-09-08

Thirteen questions ruled in tier order. The sequencing question is ruled last because its answer depends on several of the others.

---

### TIER 1 — Blocking

**Q1. What does "initial environment integration" mean — wiring or standing up actors?**

Reading (a) is ruled. "Initial environment integration" means wiring the Cognitive OS's deterministic state services to those four names as read/write permission scopes — not standing them up as generative actors.

The rulings on Laboratory, Threshold, and Attic concern hosting a generative agent. Phase 1 builds state infrastructure. It does not instantiate actors. The two questions are separate and the actor rulings are not engaged by Phase 1.

This is confirmed explicitly because the distinction is not visible in the instruction and a future session would otherwise have to re-derive it.

For the window's duration and Phase 1's scope: Laboratory, Attic, Archive, and Threshold are permission scopes with defined read/write boundaries, not actors. Attic's founder-walked scoping session is not a prerequisite for Phase 1. It remains owed before Attic hosts a generative agent.

**Q2. Which track owns the environment definitions and the handoff shape?**

The recommendation is ruled correct. The Cognitive OS Phase 1 is state infrastructure. R9/R10 is actor architecture. They compose rather than compete.

On the three sub-questions:

The Cognitive OS HandoffEnvelope does not supersede R9's handoff design. The two must be reconciled, but reconciliation is not a Phase 1 prerequisite — Phase 1 builds the envelope schema and the state services it carries. Reconciliation with R9's handoff shape is Phase 2 work, when the actor architecture begins to consume the state services. Flag the reconciliation as owed before Phase 2 opens.

R9's unmet prerequisite — an executing actor with an examined record — does not gate the Cognitive OS Phase 1. Phase 1 builds no actor and requires no actor identity. The prerequisite gates the moment an environment agent acts, not the moment state infrastructure is built beneath it.

R11 is not redundant and is not superseded. R11 is the founder's to open. The Cognitive OS does not open it. When R11 opens, it will find Phase 1's state infrastructure already in place, which is the correct relationship.

**Q3. Does this instruction move component one into the build sequence, and does building Identity State engage the consciousness obligation?**

Yes, this instruction moves component one — accumulated memory of ideas, tasks, decisions, and reflections — into the build sequence.

A manifest amendment is owed. It is owed before Phase 3, not before Phase 1. Phase 1 builds the Event Store and Belief State, which are the foundation component one rests on, but they do not themselves constitute component one as the manifest describes it. Phase 3's Identity State is where component one becomes operational. The amendment is owed at Phase 3's opening, not now.

On the consciousness obligation: building a first-class Identity State for an agent does not engage the second component's philosophical obligation, provided the Identity State is scoped as record-keeping — a log of principles, commitments, narrative themes, and identity change events — and carries no claim of continuity of experience in a morally relevant sense. The distinction the manifest draws is between a queryable record and a deepening disposition. Phase 3 builds the record. It must not claim to build the disposition. The manifest amendment at Phase 3 must name this boundary explicitly.

On the asymmetry: the obligation's reasoning — designing against continuity when it matters costs something that cannot be recovered — argues for building the record now precisely so the question of whether it constitutes continuity can be examined with evidence rather than in the abstract. That is the correct reading of the asymmetry. The instruction is a deliberate advance, not an oversight.

**Q4. Where should the Cognitive OS be placed given the guard's path-based coverage?**

Reading (a) is ruled, for the reason the recommendation names and one additional reason.

Place the Cognitive OS outside `substrate/` — at `website/src/lib/cognitive-os/` — with a recorded note that the placement was constraint-driven by the observation window and may be revisited after the window closes. The note is not optional. It must be in the gap analysis document so a future session does not treat the location as architecturally settled.

The additional reason: (b) normalises waivers for routine build work, which is precisely what the D2 stand-down mechanics were designed to keep exceptional. A waiver for D2 was justified because D2 is a correction to a measured instrument with a specific sequencing ruling. A waiver for new file placement is not in that class. The discipline holds.

The gap analysis document in `operations/` is clean of the guard and may proceed while these questions are out. That is the correct call and it is confirmed.

---

### TIER 2 — Shaping

**Q5. Does the spec's harness layering describe the prospective pipeline or a repositioning of the live harness?**

Reading (a) is ruled. The spec's ordering describes the prospective twelve-environment pipeline. The live Gate-1 harness is untouched by Phase 1 and the two coexist.

This is confirmed explicitly because a wrong reading here is not cheaply reversible, and because repositioning the live harness to fire once at commitment rather than per action would be a material change to the instrument during a running observation window. That is foreclosed by the same principle that forecloses mid-window instrument edits.

The live harness fires per action. It continues to do so. The Cognitive OS pipeline sits alongside it, not in place of it.

**Q6. Should Phase 1's Claim schema exclude agent-supplied confidence scalars?**

Yes. Phase 1's Claim schema should derive confidence only from provenance the system can verify. An agent-supplied confidence scalar is structurally in the A2 self-report class — the same class the trust core addresses by requiring a re-verified Ed25519 artifact before any trust event is recorded. The Claim schema should follow the same discipline.

If an agent-supplied confidence is retained for any reason, it must be structurally distinguished from a system-derived one — separate field, never merged, never aggregated with system-derived confidence in any downstream computation. A consumer must not be able to mistake one for the other. The field names must make the distinction unambiguous at the schema level, not only in documentation.

**Q7. Should Phase 1's Claim confidence be cardinal or ordinal, and should there be a standing rule against combining Cognitive OS scalars with proximity ranks?**

The existing project discipline is ordinal and the lower_median ruling was made on explicit grounds: averaging ordinal ranks produces numbers that may not correspond to any actual rank on the scale. That discipline is extended to the Cognitive OS.

Phase 1's Claim confidence is ordinal, not cardinal [0,1]. The spec's instruction to "choose a coherent mathematical interpretation" is satisfied by choosing the project's existing ordinal discipline rather than introducing a new cardinal scale that would immediately create the combination problem.

The standing rule is established: no Cognitive OS scalar may be combined with a proximity rank in any derived figure. This includes epistemic_debt_score and identity_coherence_score. Both are management signals, as the spec states. Neither is ever aggregated with, averaged against, or used to modify a proximity rank. The HandoffEnvelope carries them as separate fields. They are never merged.

**Q8. Should identity_relevance and interpretive_context be present-but-unpopulated in Phase 1 or omitted until Phase 3?**

Omitted until Phase 3. The recommendation is correct and the caller_class lesson is exactly the right analogy.

A reserved-but-unpopulated `identity_relevance: 0.0` reads as "no identity relevance" to any consumer, not as "not yet measured." That is a false claim. The caller_class field measures null on every record and is honest only because it emits `unknown` rather than a value that would be misread as a finding. The same discipline applies here.

If the field is not yet measured, it must not be present in a form that reads as a measurement. Omit the fields until Phase 3. If a placeholder is required for schema forward-compatibility, the value is `null` with an explicit `not_yet_measured` status field alongside it, never `0.0`.

**Q9. Does the Prerequisite Criterion engage on epistemic_debt_score and identity_coherence_score?**

The criterion engages on practitioner-facing outputs. The sufficient answer is the one the question names: these scores never leave the system. They are never served on the public trust record, never carried in a handoff to a consumer outside the system, never published.

That boundary must be machine-enforced, not only documented. The permission model (Phase 1) must include an explicit prohibition on exporting these scores to any consumer-facing surface. If the permission model cannot enforce it, the schema must not produce the scores until it can.

The identity_coherence_score about an agent has the shape of a virtue assessment. The criterion's purpose is to prevent outputs that resemble wisdom without the prerequisite. Keeping the score internal is the correct answer, but internal means genuinely internal — not internal-by-convention while being accessible via an API route a consumer could call.

**Q10. Should the Phase 6 flag be raised now?**

Yes. The flag is raised now. This is the anticipated collision and naming it at Phase 1 is the correct time, precisely so the schema is designed against it rather than discovering the constraint when the schema is fixed.

Phase 6 selects environments dynamically from state — routing on epistemic_debt_score and siblings. If an agent can influence the score that routes it, that is a gameable scorer inside an optimisation loop. That is the GS-CYB-1 constraint arriving from the other end, as the question correctly identifies.

The Phase 1 schema must be designed so that the scores the routing mechanism would read are not writable by the agents being routed. The dependency graph and the permission model together enforce this: an agent's write permissions do not include the scores that govern its own routing. This is a Phase 1 design constraint, not a Phase 6 problem. It is carried into the gap analysis as a named constraint on the schema.

**Q11. Does "execution authorisation" mean producing an authorised proposal, not executing?**

Confirmed. "Execution authorisation" means Threshold produces an authorised proposal that something outside the loop executes. The Q1 hard constraint — the loop proposes, it never executes — is not violated. The two are compatible and the reading is correct. Proceed on it.

---

### TIER 3 — Corrections and sequencing

**Q12. Are reserved-unbuilt surface names equally protected?**

Confirmed. Reserved-unbuilt names carry the same protection as built names. `logos-on/logos-off` and `idea-on/idea-off` are governed surfaces. A session doing Step 1's inspection that finds nothing built should not conclude the list is stale — it should conclude the names are reserved.

The gap analysis should note which names are built and which are reserved-unbuilt, so the distinction is visible without re-derivation.

**Q13. Sequencing — does Phase 1 run now, concurrently with the window and the D2 gate?**

Phase 1 runs now, as a separate arc, with one condition and one disclosure.

The condition: the gap analysis is the first deliverable and it runs in `operations/`, clean of the guard. No code, no schema, no new surface names until the gap analysis is reviewed and the founder confirms. This is already the stated plan and it is confirmed as the correct sequencing.

The disclosure: the concurrency ruling stands and its reasoning applies here. More arcs means more surface area for errors to propagate undetected. The Cognitive OS arc is justified as a second arc because it is state infrastructure that does not touch the measured instrument, does not require guarded files in Phase 1, and does not interact with the D2 gate or the observation window's measured population. Those are the conditions that distinguish it from the kind of parallel work the concurrency ruling warned against. If any Phase 1 work begins to touch guarded files or the measured instrument, the arc pauses and routes.

The 0h sequencing — all current tasks complete before any 0h assessment — is not disturbed by Phase 1. Phase 1 is not a 0h assessment. It is infrastructure work that precedes the conditions the 0h assessment requires. Building it now is consistent with the sequencing, not in tension with it.

The eleven open sessions are a different matter. The concurrency ruling's concern was not about the number of questions in flight — it was about the number of arcs making consequential changes simultaneously. Questions routed for ruling are not arcs. The Cognitive OS gap analysis is one arc. The observation window work is one arc. Two arcs with clean separation between them is the correct posture. If additional arcs open that touch the same surfaces, the ruling applies.
