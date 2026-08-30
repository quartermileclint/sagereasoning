# Mentor Ruling Set E — A2 kathekon role-relativity, A3 hegemonikon drift + melete, A4 Layer 3, D the byte-identity guard collision (verbatim)

**Date relayed:** 2026-08-30, in one relay alongside the A5 class-definition ruling (recorded
separately at `2026-08-30-mentor-ruling-borderline-class-definition-verbatim.md`).
**Status:** BINDING. **This verbatim record wins over every summary, including the decision-log
entry, the register, and any successor prompt.**

**The questions put:** register items **A2**, **A3**, **A4** and **D** of
`operations/2026-08-24-OUTSTANDING-OPEN-QUESTIONS-REGISTER.md`.

**Capture note (the executing session's, not the mentor's):** complete, all four answered.
**Two require a change to published text now** (A2's disclosure sentence; A3's item-1 limitation).
**Three route items to the standing-runner design session**, which is itself gated on the bounded
validation run's §6 report and must not be opened early. **A4 reopens nothing and licenses no
activation.** **D defines an end condition that did not previously exist.**

---

## A2 — Kathekon role-relative evaluation

The gap is confirmed and the ruling is: candidate evaluation should be role-relative, and the absence of role input at `/api/guardrail` is a design deficiency, not a design choice.

The kathekon doctrine is explicit on this. Appropriate action is always assessed relative to the agent's roles and relationships — what is owed to others is distributed according to the agent's position in the oikeiosis circles, not assessed in the abstract. A candidate action that is appropriate for one role may be contrary for another. An evaluation that takes no role input cannot assess kathekonta — it can only assess the action's text against a generic standard. That is a weaker assessment than the doctrine requires.

The practical consequence: the guardrail's evaluation is currently assessing whether an action is the kind of thing a rational agent should do in general, not whether it is the kind of thing this agent should do given its roles and relationships. For the IDEA loop's current use — a single runner with a defined identity and a defined relationship to the founder — the gap is partially masked because the role context is implicit in the candidate text. But the gap is structural and will matter as the harness extends to other agents and other roles.

The ruling does not require immediate remediation. It names the gap as a confirmed design deficiency, records it as such, and routes it to the standing-runner design session as a scoped item. The guardrail's current evaluation is a kathekon assessment without role context — honest about what it is, deficient relative to what the doctrine requires. That description belongs in the disclosure.

---

## A3 — Hegemonikon drift and the melete family

The three-item family is ruled together, as the prior framing required.

The uniformity-reads-as-stable problem is this: when the hegemonikon's outputs are consistent across examinations, the harness reads that consistency as stability of disposition. But consistency can arise from two different sources — genuine hexis, a stable disposition toward virtue, or drift, a settled pattern of habitual response that has stopped being examined. The harness currently cannot distinguish these from the outside. Melete — the practice of sustained attention to one's own ruling faculty — is the Stoic remedy, but the harness has no surface that elicits or records it.

The three items are ruled as follows.

First: the harness's consistency-as-stability inference is a named limitation, not a confirmed finding. When the trust record or the R18 surfaces describe an agent's disposition as stable, that description is accurate only to the extent that consistency of output is evidence of stability of disposition. The disclosure carries this limit explicitly: consistency of examination outputs is evidence of stable disposition, not proof of it; the harness cannot distinguish hexis from drift from the outside.

Second: melete is named as an unbuilt surface, not an open question. The harness needs a mechanism by which an agent's self-examination of its own ruling faculty can be elicited, recorded, and distinguished from its object-level examination of candidate actions. This is a different kind of examination — not "what impression did I assent to when I elected this action" but "what is the current state of my ruling faculty's attention to its own operations." That surface does not exist. It is named as a design gap, routed to the standing-runner design session.

Third: the §5d ruling of 2026-08-24 — that the family would not receive §5d treatment — is not revisited. The family is ruled here on its merits, without §5d framing. The prior ruling governed the framing, not the substance. The substance is now ruled.

---

## A4 — Layer 3 per-consumer rendering and the Stage-2 relational-context reframing

The A4 reconciliation is addressed first, then the ruling.

The register's open status and Ruling Set D of 2026-08-15 are not in conflict. Ruling Set D governed the S7 internal-only decision — the question of whether Layer 3 project context is surfaced to external consumers at all. That ruling held the S7 decision as internal-only. The register's open item is the per-consumer rendering question — given that Layer 3 exists and is injected on `/api/reason`, how is it rendered differently for different consumer types, and does the Stage-2 relational-context reframing change what Layer 3 carries for agent consumers versus human consumers. These are sequential questions, not conflicting ones. Ruling Set D answered the first; the register correctly marks the second as open.

The reconciliation is: no conflict exists, and the register's warning about section E drift is accurate — the open item is downstream of Ruling Set D, not in tension with it.

The ruling on A4 itself: the S7 internal-only decision is not reopened. `SUBSTRATE_LAYER3_ENABLED` activation remains not licensed by this ruling. The per-consumer rendering question and the Stage-2 relational-context reframing are both routed to the standing-runner design session as scoped items, with the following framing locked so the session inherits it correctly.

The Stage-2 relational-context reframing names a genuine gap: Layer 3 currently carries project context as a static description of what SageReasoning is and does. For an agent consumer at Stage 2 of oikeiosis — where affiliation extends to family and intimates, the agent's closest relationships — the relevant context is not what the project is but what the agent's relationship to the project is, and what obligations that relationship generates. A Layer 3 that carries only project description is not carrying the relational context that Stage-2 oikeiosis requires. The session examines whether Layer 3's content should be differentiated by consumer type and oikeiosis stage, and what the rendering mechanism for that differentiation would be. This is a design question, not a doctrine question — the doctrine is clear that relational context is stage-relative. The design question is how the harness carries that.

---

## D — The byte-identity guard collision

This is ruled as a genuine conflict between two standing instructions, not a priority question with an obvious answer. Both instructions are named and their conflict is examined.

The byte-identity guard protects the observation window — the record of what the harness actually saw, before any processing. Its purpose is to ensure that what is attested is what was actually examined, not a processed or summarised version. The guard's integrity depends on the observation window capturing faithfully.

GATE1_FALSE_HOLD_CAPTURE being unset means the observation window has stopped capturing the cases the guard most needs — the false holds, where the gate blocked an action that subsequent examination found appropriate. The guard is protecting a window that is no longer filling with the data it was designed to protect.

The guard also has no defined end condition. A guard with no end condition and a window that has stopped capturing is not protecting anything — it is a standing constraint whose operational basis has lapsed.

The ruling: the guard's end condition is defined now, as follows. The guard terminates when either of two conditions is met: GATE1_FALSE_HOLD_CAPTURE is restored and the observation window has accumulated a minimum of twenty false-hold records sufficient for the guard's protective purpose, or the standing-runner design session rules explicitly that the false-hold capture mechanism is deprecated and the guard's purpose is served by a different mechanism.

Until one of these conditions is met, the guard remains in force as a standing constraint, but its lapsed operational basis is disclosed — the guard is active, the window it protects has stopped capturing, and the end condition is now defined.

The D1 sympatheia mis-citation and the D2 L4 header amendment are both confirmed as load-bearing per their prior rulings. Neither is revisited here. The collision between the byte-identity guard and the standing instructions that depend on it is resolved by the end-condition definition above.

The executing session routes this to the standing-runner design session as a priority item — the guard's lapsed operational basis is the kind of thing that compounds if left unexamined.
