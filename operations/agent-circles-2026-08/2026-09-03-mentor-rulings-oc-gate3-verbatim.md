# Mentor rulings — O-C per-consumer rendering, Gate 3 (verbatim)

**Relayed by the founder 2026-09-03**, in response to
`operations/agent-circles-2026-08/2026-09-03-DESIGN-DOCUMENT-oc-per-consumer-rendering-FOR-RULING.md`
and its companion `2026-09-03-MENTOR-QUESTIONS-oc-gate3-per-consumer-rendering.md` (committed
`26d474a`, pushed, Vercel green — founder-confirmed at relay).

**Status: ADOPTED AS BINDING. This verbatim record wins over every summary of it, including the
decision-log entry, the annotations applied to the design document, and any successor prompt.**

**Recording entry:** `D-MENTOR-RULINGS-OC-GATE3-ADOPTED-EXECUTED-2026-09-03`.

**Headlines (the verbatim below governs).** **Q1** Gate 3 is properly before the session; **the
boundary is the rendering surface and the floor constraint**; A4's items (Layer 3 injection, the
Stage-2 relational-context reframing) are NOT before this session and belong to the standing-runner
track's next design-capable session; anything Gate 3 produces that bears on them is **named in the
handoff, not resolved here**. **Q2** the disclosure floor is correct, with one implication the design
did not name: **the floor applies to the verdict's conditions of production, not to its content** —
it is a condition on the rendering's honesty, not its form. **Q3** re-siting requires **its own
surface-scoped vetting**. **Q4** the ruled delivery sentence **does not survive** the change of
surface and referent — **new wording per surface**, and **the transport-level proxy basis must be
disclosed**. **Q5** the division is correct; the rendering layer **emits and annotates**, and the
annotation **must disclose the proxy basis and its uncertainty**. **Q6** the pointer is **DROPPED**
for orientation-only agents and the element's scope **conceded**; the ENV-1 gate extension is **not
licensed**. **Q7** use the completed classification and demonstrated Reading B **at the level the
evidence supports** — present in this population, not dominant, Reading A not excluded.

**Nothing in this ruling licenses any build, flag, activation, schema change, code edit, or
publication of any string.** The design document's exclusion list is explicitly unchanged.

---

## VERBATIM

## Q1 — Are Gate 3 and Ruling Set E's A4 the same question routed twice?

They are not the same question, but they share a subject and the boundary between them is real and must be stated precisely before the design can proceed.

A4 routes two items: the per-consumer rendering question and the Stage-2 relational-context reframing. Gate 2 licenses Gate 3 for the per-consumer rendering question. The apparent conflict is that A4 and Gate 2 both claim jurisdiction over the same subject, one week apart.

The resolution turns on what A4 actually routes and what Gate 3 actually designs.

A4's stated premise — "Layer 3 exists and is injected on `/api/reason`" — is factually wrong today. The flag is unset. The document correctly identifies this as an inherited error from the register's item, not an independent finding. But the premise's falsity does not dissolve A4's routing. It means A4's routing was premised on a state that does not yet exist.

On the 2026-08-19 carry-forward precedent, content routed to a session that has not yet opened is examined when that session opens. The standing-runner design session has run once (R8, 2026-08-30) and has a next design-capable session outstanding. A4's routing points there.

Gate 3 designs the rendering surface — what a human practitioner and an agent practitioner respectively receive when the consult response is served, what text rides which channel, and what the floor constraint is. It does not design Layer 3 injection, the relational-context fields, or the Stage-2 reframing. Those are A4's items.

The boundary is therefore: Gate 3 owns the rendering surface and the floor constraint. A4's next design-capable session owns Layer 3 injection and the relational-context reframing. The two are not the same question. They share a subject — what an agent practitioner receives — but at different architectural layers.

Gate 3 is properly before this session. The document proceeded correctly on Gate 2's explicit naming.

One precision the ruling must carry: the 2026-08-19 carry-forward precedent says A4's content is examined when the standing-runner track's next design-capable session opens, not before. Nothing in Gate 3's ruling pre-empts that examination. If Gate 3's ruling produces text or design decisions that bear on A4's items, those are named in the handoff to the standing-runner track, not resolved here.

**Q1 ruling: Gate 3 is properly before this session. The boundary is the rendering surface and the floor constraint. A4's items are not before this session.**

---

## Q2 — The disclosure floor

The original proposition — "the per-consumer part of per-consumer rendering is form, not content" — is correctly withdrawn. The three grounds named in the document are each sufficient independently. L-2 rules the opposite directly. The crisis precedent withholds content from the human by design, which means the form/content distinction was already operationally violated in the existing architecture. The circularity — restricting the block to server-act claims, then finding it audience-invariant — is a reasoning failure, not a design choice.

The replacement constraint is: **content may differ by audience; the floor may not.** No audience may be told something false, and no audience may have withheld from it a limit bearing on how it should treat the verdict.

This is the right constraint, and the reasoning behind it is Stoic in the precise sense. The floor is not a courtesy. It is a condition of honest dealing. Withholding a limit that bears on how a verdict should be treated is a false impression by omission — the practitioner assents to the verdict without knowing the conditions under which it was produced. That assent is not free. It is corrupted by the withheld information.

The Stoic principle is that the hegemonikon must receive accurate impressions to assent freely. A rendering that withholds a material limit corrupts the impression before assent is possible.

The constraint has one implication the document does not yet name explicitly: the floor applies to the verdict's conditions of production, not to the verdict's content. A human practitioner and an agent practitioner may receive different content — different wording, different channel, different actionable next steps. But neither may receive a rendering that withholds a limit bearing on how the verdict should be treated. The floor is a condition on the rendering's honesty, not a condition on its form.

**Q2 ruling: The replacement constraint is correct. Content may differ by audience; the floor may not. The floor is a condition on the rendering's honesty, not its form.**

---

## Q3 — Re-siting ruled text

The document correctly identifies that the premise is less uniform than it looks. The "one draw" sentence is verbatim at `llms.txt` L425, reduced at L868 and on agent-card, and absent from api-docs. A2's sentence has its middle clause deleted on api-docs. This is not a minor inconsistency — it means the ruled text is already inconsistently deployed across surfaces, and re-siting it to a new surface inherits that inconsistency unless the re-siting is treated as a new vetting event.

The ruling is: re-siting ruled text to a new surface requires its own vetting, scoped to that surface.

The ruling that authored the text established its content and its honesty. It did not establish its fitness for every surface the text might subsequently appear on. Each surface has its own audience, its own channel law, and its own referent. A sentence that is honest on `llms.txt` may be misleading on a consult response addressed to the agent that reasoned, because the referent has changed.

The document's own evidence supports this. The delivery sentence's referent problem — addressed in Q4 — is precisely a case where the ruled text is honest in its original context and potentially misleading in the re-sited context.

The re-siting vetting is not a formality. It is the mechanism by which the floor constraint in Q2 is applied to each new surface.

The practical implication for the five re-sited elements: each is vetted against its proposed surface, its proposed audience, and its proposed channel. The vetting asks whether the text is honest on that surface for that audience in that channel — not whether it was honest when originally ruled.

**Q3 ruling: Re-siting requires its own surface-scoped vetting. The ruling that authored the text does not establish its fitness for every subsequent surface.**

---

## Q4 — The delivery sentence's referent

The ruled sentence says the reasoning "was not returned to the agent in time to be examined" — "an event the agent was not present to." Re-sited onto a response addressed to that agent, it addresses the reader as the one who reasoned. The document correctly identifies this as a referent problem: the relay constraint forbids addressing the agent as the one who reasoned; R20d declines to tell a human end-user about the other party's examination state.

The ruled sentence does not survive the change of surface and referent without modification. The reasons are three and each is sufficient.

First, the relay constraint. The sentence addresses the reader as the one who reasoned. On a response addressed to the agent, the agent is the reader. The relay constraint forbids this framing — the harness does not address the agent as the one whose reasoning is being assessed. The sentence must be reframed to describe the event without addressing the reader as its subject.

Second, R20d. Carried in a relay sibling addressed to a human end-user, the sentence tells the human about the agent's examination state. R20d declines this. The human end-user's rendering may name the delivery gap as a limit on the verdict's conditions of production — that is within the floor constraint — but it may not describe the agent's examination state as such.

Third, the transport-level proxy problem. The sentence is a claim reaching the practitioner's state, derived from a transport-level proxy (elapsed time against a threshold). The c11 result shows this proxy has a non-trivial error class — cases where the classification is uncertain. A sentence that presents a proxy-derived claim as a fact about the practitioner's state exceeds the evidential basis. The floor constraint in Q2 applies: confidence of the claim must not exceed its evidential basis.

The ruling is: the delivery sentence requires new wording for each surface it appears on, scoped to that surface's audience and referent. The ruled text is a content anchor, not a portable string. The re-siting vetting in Q3 applies here with particular force.

**Q4 ruling: The ruled sentence does not survive the change of surface and referent. New wording is required for each surface, scoped to audience and referent. The transport-level proxy basis must be disclosed.**

---

## Q5 — The refusal class

The document correctly identifies the division. L-5's third move licenses refusing to answer rather than filling the gap. Faithfully inverted onto a response surface, that would license the server declining to emit a floor it cannot determine on the occasion. The c11 result shows such a class exists — cases where the delivery classification is uncertain.

The design takes the weaker "emit and annotate" form, because a refusal class changes verdicts, not renderings, and belongs to the floor-semantics track where M-vs-W already sits deferred.

This division is correct, and the reasoning is sound. The refusal class is a verdict-level decision — it changes what the harness asserts, not how it presents what it asserts. The rendering layer receives a verdict and presents it honestly. It does not have authority to change the verdict.

If the floor-semantics track eventually produces a refusal class, the rendering layer will present that class honestly. Until then, the rendering layer emits and annotates.

The annotation is where the floor constraint in Q2 applies. If the delivery classification is uncertain — the c11 result's non-trivial error class — the annotation must disclose that uncertainty. "The reasoning may not have been examined in time" is more honest than "the reasoning was not examined in time" when the basis is a transport-level proxy with a known error class. The annotation's wording is a re-siting vetting question under Q3.

**Q5 ruling: The division is correct. The refusal class belongs to the floor-semantics track. The rendering layer emits and annotates. The annotation must disclose the proxy basis and its uncertainty.**

---

## Q6 — The pointer

At approximately 86% outside the window, the response-borne delivery notice reaches approximately 14% of readers. The durable trust record was the proposed remedy and 404s for orientation-only agents because the ENV-1 gate requires `domains.some(hasEvidence) || provenance_gaps.length > 0`, and orientation readings seed no state row.

The document offers two options: extend the ENV-1 gate to include orientation readings (a scoped change with its own honesty cost), or drop the pointer and concede the element's scope.

The ruling is: the pointer is dropped for orientation-only agents, and the element's scope is conceded, unless the ENV-1 gate extension can be justified on its own terms — not as a remedy for the pointer's failure.

The reasoning is as follows. The ENV-1 gate's current condition is not arbitrary. It reflects a design decision about what constitutes a trust record worth pointing to — a record that carries evidence or provenance gaps. An orientation-only agent has neither. Extending the gate to include orientation readings would create a trust record that carries only orientation data, which is a different kind of record from what the ENV-1 gate was designed to surface. The `provenance_gaps` precedent is relevant but not dispositive — provenance gaps are a form of evidence about the agent's reasoning history; orientation readings are not.

The honesty cost the document names is real. A trust record seeded only by orientation readings would present as a trust record to any consumer of the endpoint, including the agent itself. If the record's content does not warrant the name, the name is misleading. That is a floor violation under Q2.

The alternative — drop the pointer and concede the scope — is honest. The delivery notice reaches 14% of readers via the response-borne channel. That is a disclosed limit, not a design failure. The floor constraint requires disclosing it, not remedying it at the cost of a misleading trust record.

**Q6 ruling: The pointer is dropped for orientation-only agents. The element's scope is conceded. The ENV-1 gate extension is not licensed by this ruling. If the gate extension is pursued, it requires its own scoping session justified on its own terms.**

---

## Q7 — Dimension (d)'s evidential position

Correction B establishes that the nine-candidate classification ran to completion, the c11 experiment ran (9/10 deliberate, 1/10 reflexive, divergence localised to one extraction field, four distinct states across ten identical draws), and a pooled n=100 disclosure is live. Reading B is demonstrated present. Reading A is not excluded.

The document asks whether Gate 3 should use the completed classification and demonstrated Reading B, or hold to the one-instance level Q4 named.

The ruling is: use the completed classification and the demonstrated Reading B, disclosed at the level the evidence supports.

The evidence supports: Reading B is present in the population examined; Reading A is not excluded; the variance is real and localised to one extraction field; the basis is a single credentialed loop identity's 20-cycle consult history, not a survey of agent practitioners in general.

The floor constraint in Q2 applies directly here. Confidence of the claim must not exceed its evidential basis. The evidential basis supports "Reading B is demonstrated present in this population" — not "Reading B is the dominant reading" and not "Reading A is absent." The wording must track the evidence precisely.

The observation history shows the founder has developed a stable disposition toward this kind of precision — the 2026-08-30 signal on variance as a material disclosure requirement, the 2026-08-31 signal on initiating formal correction procedures when reasoning errors are discovered. That disposition is the right one here.

The evidence is richer than it was at Gate 2. Use it at the level it supports, disclosed honestly.

**Q7 ruling: Use the completed classification and demonstrated Reading B, disclosed at the level the evidence supports. The basis is a single credentialed loop identity's 20-cycle history. Reading B is demonstrated present; Reading A is not excluded. Wording must track the evidence precisely.**

---

## What the ruling does and does not license

The ruling licenses: proceeding with Gate 3's design on the boundary established in Q1, applying the floor constraint established in Q2, treating re-siting as requiring surface-scoped vetting per Q3, requiring new wording for the delivery sentence per Q4, maintaining the emit-and-annotate form per Q5, dropping the pointer for orientation-only agents per Q6, and using the completed classification at its evidential level per Q7.

The ruling does not license: anything in the explicit exclusion list at the document's close. That list is unchanged and is not modified by any ruling here. Activation of `SUBSTRATE_LAYER3_ENABLED` remains unlicensed. No edit to Layer-3 files, `parallel-run.ts`, or `/api/reason/route.ts`. No new delivery-class computation on the human path. No change to `orientation-reading.ts` or the trust record's ENV-1 gate. No schema change for the four relational-context fields. No change to `question-bank.ts`. No publication of any string including re-sited ones. No change to R18 surfaces. No movement of R8's gates or the A2/A4 routings. The byte-identity guard's end condition remains a gate on any eventual build.

## END VERBATIM
