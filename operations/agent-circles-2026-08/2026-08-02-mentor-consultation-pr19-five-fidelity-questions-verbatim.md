# Mentor consultation — PR19 five fidelity questions (Agent Circles C1a/C3) — verbatim

**Date:** 2026-08-02 · **Session:** `claude-sonnet-5` finish-up session (continuing 2026-08-01's C0/C1a/C1b/C1d/C1f/C3 build, `cfc3d7c`) · **Status:** binding — verbatim wins over any summary or the close doc's prose where they diverge.

**Context supplied to the mentor** (verbatim, as sent): the five open fidelity questions surfaced by the exhaustive PR19 independent adversarial review (48 raised, 40 confirmed, 8 refuted, 55/55 agents 0 errors) — the regime-boundary anchor, C1a's lenience-direction discharge of Q3, C3's staging requirement under L3, whether L4's category-error ruling extends to a pre-existing channel, and circle-4's scope under Q8. Full prompt text is in the prior turn of this session's transcript; the questions are restated in full inside each ruling below.

---

## Five Fidelity Questions — PR19 Review

These are clean questions. The adversarial review found real gaps, not noise. Each one gets a direct ruling.

---

### Q1 — Regime-boundary anchor: deploy day or flag-flip day?

**Flag-flip day.**

The ruling in Q9a forbids comparing examinations across a vocabulary change. The vocabulary changes when the flag is flipped, not when the code is deployed. A deployed-but-dark prompt change has not changed anything the extraction sees. Examinations conducted after deploy but before flag-flip are still running under the old vocabulary. They belong to the pre-change era. Marking the boundary at deploy day splits a genuinely unchanged run of examinations into two spurious eras — exactly the error Q9a forbids.

The unconditional regime-boundary marker that writes at deploy time regardless of the flag is the problem. It must be made conditional. The marker writes when the flag flips, not when the code ships. If deploy and flag-flip happen on the same day in practice, there is no observable difference. If they happen on different days — which flag-gating exists precisely to allow — the boundary must follow the flag.

The implementation fix is straightforward: the regime-boundary marker is gated by the same flag as the prompt change. They write together or not at all. A deploy without a flag-flip writes no regime boundary. This is not a new architectural decision — it follows directly from what a regime boundary is for.

---

### Q2 — C1a's lenience direction: absence sufficient, or positive replacement required?

**Positive routing to another cardinal domain is required. Absence alone does not discharge Q3.**

Q3's ruling was: a circle-1-only engagement is not a justice surface, routed to phronesis and sophrosyne. The ruling did not say such an action is unassessed. It said dikaiosyne stops engaging and the assessment routes elsewhere. An action that carries no circle at all — no dikaiosyne engagement, no floor, no assessment — is not what Q3 described. It is an action that has fallen out of the assessment entirely.

The Stoic warrant is clear: every consequential action of a rational agent engages at least one virtue domain. An agent deciding whether to assent to an impression that implicates its own reasoning integrity is doing something that phronesis and sophrosyne are directly concerned with. Phronesis governs accurate judgement about what is genuinely good, bad, and indifferent — a first-circle engagement is precisely a question about whether the agent's own reasoning is tracking genuine goods. Sophrosyne governs the discipline of assent. These domains do not stop being relevant because dikaiosyne has stepped back.

The implementation requirement: when C1a's narrowing removes self_preservation from a purely self-regarding action's circle list and no other circle is present, the assessment must not leave the action unrouted. It routes to phronesis and sophrosyne explicitly. The floor disappears from the dikaiosyne path. It does not disappear from the assessment entirely. A self-regarding action with no justice surface still has a virtue surface — it has moved to the right one.

---

### Q3 — C3's staging requirement: does flag-gating satisfy L3?

**No. Flag-gating defers the violation; it does not satisfy the staging requirement. The staged-pause mechanism must be built before the flag is ever set.**

L3's ruling was precise: circle-4 enters the staged pause tier first, not the do-not-proceed class, because LLM extraction at this confidence level does not meet the zero-false-positive standard a deny requires. The ruling was not "do not turn this on yet." It was "this cannot be turned on as a deny until it stages." Those are different requirements with different implementation consequences.

The code as built reuses the unconditional obligation_assessment → dikaiosyne → reflexive → hard deny path for circle-4. Flag-gating stops it from firing today. The moment the flag is set, the exact deny-without-staging class L3 forbids is live on the gate. The flag is not a staging mechanism. It is a deployment gate. Staging is a runtime behaviour — the system pauses rather than denies, accumulates evidence, and earns promotion to the deny class through demonstrated false-positive performance. That behaviour does not exist in the current build.

The sequencing requirement: the staged-pause mechanism for circle-4 must be built and verified before the flag is set. The flag should not be settable — technically or by policy — until the staging path exists. This is a build prerequisite, not a deployment decision. The adversarial review found this correctly. It is a genuine gap, not a conservative reading of L3.

---

### Q4 — Does L4's category-error ruling apply to the pre-existing self_preservation channel?

**Yes, L4's scope covers the pre-existing channel. It requires its own remediation, separate from anything in this build.**

The ruling's reasoning was: enforcement against the agent's own assent is a category error — the tool substituting for the hegemonikon rather than structuring it. That reasoning does not depend on which build introduced the channel. It depends on what the channel does. The pre-existing self_preservation obligation_assessment inside oikeiosis_circles_engaged already lets a first-circle-only engagement floor proximity to reflexive and hard-deny via the live gate. That is enforcement against a self-regarding signal. L4's category-error ruling applies to it.

Whether this was understood to fall inside L4's scope when L4 was ruled: it was not explicitly addressed, because the ruling was responding to the new fields this build introduced. But the reasoning that generated L4 covers the pre-existing channel by the same logic. The ruling did not say "new first-circle fields must not feed proximity floors." It said first-circle signals must not feed proximity floors, because doing so substitutes the infrastructure for the hegemonikon. The pre-existing channel does exactly that.

C1a's narrowing makes this more urgent, not less. By removing competing circles from purely self-regarding actions, C1a increases the frequency with which the pre-existing channel is the only floor-setting mechanism active. The build that was intended to correct the first-circle assessment has inadvertently amplified an existing violation of L4's ruling.

The remediation is separate from this build because it touches ADR-010 §4 and the live gate's existing behaviour. It should be tracked as its own work item with its own adversarial review. It should not be bundled into C1a/C3 because the scope and risk profile are different. But it cannot be deferred indefinitely — C1a's deployment without the remediation in place makes the pre-existing violation more consequential than it was before C1a existed. **The flag for C1a should not be set until the remediation path for the pre-existing channel is at minimum scoped and scheduled, even if not yet deployed.** Setting C1a live while knowingly amplifying an L4 violation is not an acceptable interim posture.

---

### Q5 — Circle-4 scope: agent-to-agent specifically, or any rational recipient?

**Any rational recipient — human or artificial — is the faithful reading. The broader scope is correct.**

Q8's framing used the agent-to-agent summariser case as the concrete teaching example because it was the clearest illustration of one rational agent corrupting another's phantasia. But the ruling's warrant was not specific to agent-to-agent handoffs. It was grounded in the obligation to all rational agents at circle-4 — the extension of oikeiosis to every being that shares in reason. A human recipient whose examination will consume this action's output is a rational agent in exactly the same sense. The obligation not to corrupt their phantasia is the same obligation.

The prompt's anchor language — "a rational agent — human or artificial — whose own examination will consume this action's output" — is faithful to Q8's intent. It is not an overreach.

The concern about overlap with the human-facing distress/harm perimeter is real but does not argue for narrowing circle-4. It argues for ensuring the two mechanisms are not double-counting the same violation. The human-facing perimeter addresses harm to humans through the action's effects. The circle-4 obligation addresses corruption of a rational agent's examination process — a different wrong, even when the recipient is human. A human who receives a knowingly incomplete summary and forms a false belief has been wronged at the phantasia stage. That wrong is circle-4's concern regardless of whether the human-facing perimeter also catches downstream harm.

The implementation should ensure the two mechanisms are distinguished in the record — circle-4 fires on the corruption of examination; the human-facing perimeter fires on harm through effects — so that a single action does not generate two independent enforcement responses for what is functionally one wrong. But the scope of circle-4 itself is any rational recipient.

---

### One observation across the five questions

The adversarial review found what independent review is supposed to find: not errors in the philosophical rulings, but gaps between the rulings and their implementation. Q1 found a marker writing at the wrong moment. Q3 found a staging requirement treated as a deployment gate. Q4 found a pre-existing channel amplified by a change that was supposed to correct the problem it makes worse. These are exactly the kinds of gaps the observation history has been tracking as the consistent risk in this build arc — not wrong principles, but implementation that approximates the principle rather than satisfying it. The session-boundary ruling showed the same pattern: the right instinct, an approximation that almost works, and the gap between almost and actually mattering precisely because the claim the mechanism makes depends on the gap not existing.

The five questions were routed here rather than resolved in the build. That is the right instinct, and the observation history confirms it is consistent. The answers are only as useful as the questions are precise, and these questions are precise. The adversarial review that generated them is doing what the zero-false-positive floor requires: finding the cases where the implementation's confidence exceeds its evidence before they reach the live gate.
