# Mentor ruling — gaming-robustness bar Q1/Q2, and the emission-hooks finding (verbatim)

**Relayed by the founder 2026-08-24** (pasted directly in-session), answering
`2026-08-24-MENTOR-QUESTION-gaming-robustness-bar-route-ii.md`.

**Status: ADOPTED AS BINDING on the founder's relay. Verbatim wins over any paraphrase, here or
elsewhere.**

**Binds (headline; the verbatim below governs):**

1. **Part 0 (emission-hooks) — CONFIRMED as reported.** *"Not a disclosure gap. A structural
   asymmetry in the live production system."* Stands regardless of Q1/Q2. **Named as an urgent
   unscheduled item for the priority index — the founder's next scoping item after today's rulings,
   ahead of any cybernetics build work.** The corroboration check does **not** reduce this exposure —
   *"the two mitigations operate on different threat classes."*
2. **Q1 — RULED AGAINST route (ii) as currently worded.** Three independent reasons: the scoping
   clause names the wrong axis (co-training, not supply); the ADR-012 validity-bar/blockquote tension
   is *"not resolvable... without choosing one reading over the other,"* and the mentor **declines to
   choose it by implication**; route (i)'s independent-extractor option is *"not weaker than route
   (ii) on the substance of the threat... it addresses the actual exposure directly. Route (ii) does
   not."* **Two preconditions named before route (ii) can be reconsidered:** the scoping clause
   reworded to name supply-provenance, not co-training; and the ADR-012 tension resolved explicitly.
   **Route (i)'s independent extractor should be scoped before route (ii) is revisited.**
3. **Q2 — RULED: NOT automatically discharged.** *"The bar's vocabulary of 'cleared' does not
   automatically discharge GS-CYB-1's gate."* GS-CYB-1's constraint concerns the optimisation loop;
   clearing the weights claim is a different question. **GS-CYB-1's registered constraint is AMENDED**
   to a two-condition form, fixed verbatim below — condition (1) the weights-claim bar cleared by a
   route addressing supply-provenance; condition (2) an **independent** judgement that the scorer's
   gaming-robustness is adequate for use inside a feedback loop specifically. *"Condition (1) clearing
   does not automatically satisfy condition (2)."* **Apply before the standing-runner design session
   inherits it.**
4. **A governance observation, not a ruling:** route (i)'s independent-extractor option and the
   emission-hooks fix *"are not independent work items — they are the same architectural intervention
   applied to the same channel."* **Scope them in the same session**, not separately.
5. **Process note, adopted:** the adversarial-review correction from the first draft is *"the IS-1
   disposition holding under exactly the pressure it is most likely to fail under."* The workflow
   caught what it was built to catch.

**Licenses no code.** No build, route, flag, credential, or schema.

---

## VERBATIM

### Part 0 — The emission-hooks finding

This is reported correctly and the stakes are correctly named. I will not rule on the fix here — the document explicitly does not ask for that — but I will confirm the finding's character so the founder knows how to carry it.

This is not a disclosure gap. It is a structural asymmetry in the live production system: the function that mints the public trust record's credential and justice-surface events has no check on extraction provenance, while its sibling function — added later, for the least consequential trust-event class — has exactly that check, with a docstring naming the reason. The project has already ruled this question once, in code, and left the older and more consequential surface unguarded. The public attestation is inaccurate for the affected population right now.

The finding stands regardless of how Q1 and Q2 are ruled. It is its own scoping item. It should be named in the project's priority index as an urgent unscheduled item — not because the fix is obvious (the document correctly names that the fix options differ in kind and consequence) but because the public attestation's inaccuracy is a live condition, not a future risk. The founder should treat this as the first item to scope after today's rulings are recorded, ahead of any cybernetics build work.

One observation the document does not make explicit but which bears on urgency: the corroboration check does not touch this. It reads the submitted text against the claims. It does not read the extraction against its own origin. So the corroboration check's presence does not reduce the exposure at all on the l1_supply path. The two mitigations operate on different threat classes.

---

### Q1 — Is route (ii) the right route for this project?

No. Not as written, and not without a reframing that the bar's own vocabulary does not currently support for this project's actual exposure. The document's own analysis establishes this precisely, and I adopt it rather than restate it at length. Three reasons, each independent:

**First: route (ii)'s scoping clause does not describe this project's actual exposure.** The bar's §3.3 wording — "scoped to not rely on a co-trained extractor" — defines Threat B by a training relationship between the extractor and the optimised policy. This project's live exposure is supply, not co-training. l1_supply lets any caller substitute its own extraction with no training relationship to anything. A ruling that accepts route (ii) literally as worded would leave the actual live exposure unaddressed by its own scoping clause. That is not a cleared bar — it is a bar whose language does not reach the thing it is supposed to bound.

**Second: the ADR-012 tension is not resolvable in route (ii)'s favour without choosing one reading over the other, and the document correctly declines to choose.** The ladder table's stated validity bar for the third rung is correctness plus robustness under optimisation. Route (ii) does not deliver robustness under optimisation — it formally accepts its absence. The ADR's blockquote at line 50 blesses an accepted disclosed ceiling as a way Arm B's blocking condition is satisfied. These two statements are in tension. Accepting route (ii) satisfies the gate on the claim while leaving the rung's validity bar honestly unmet. A ruling that accepts route (ii) should name this tension explicitly rather than resolve it by implication. I am not willing to resolve it by implication here.

**Third: route (i)'s independent extractor option is stronger than the document's earlier draft presented it, and the document correctly corrects this.** A second server-side extraction over the same text, checked against a caller-supplied schema on the l1_supply channel, is a live-shaped mitigation. The original input text is required on every /api/reason path. The option has real cost and latency and is unscoped — but it is not weaker than route (ii) on the substance of the threat. It addresses the actual exposure (supply, not co-training) directly. Route (ii) does not.

**The ruling on Q1:** route (ii) as currently worded is not the right route for this project. The bar's scoping clause does not match the project's actual exposure. Before route (ii) can be reconsidered, two things must be true: the scoping clause must be reworded to describe the actual exposure (supply provenance, not co-training), and the ADR-012 tension between the validity bar and the blockquote must be resolved explicitly rather than absorbed. Neither of those is a small task. Route (i)'s independent extractor option should be scoped before route (ii) is revisited, because it addresses the actual exposure directly and does not require resolving the ADR tension.

---

### Q2 — If route (ii) were ruled, would it automatically discharge GS-CYB-1's gate?

No. And the discipline the document asks about applies regardless of which route is eventually taken.

The document names the textual risk precisely: if route (ii) is ruled and the bar is described afterward as "cleared," GS-CYB-1's gate is satisfied on a plain reading of the text — not because anyone judged a disclosed ceiling adequate to license a feedback controller over the proximity score, but because two documents happen to share a word. The 2026-08-24 ruling on Q2 guarded against exactly this kind of drift at registration. The same discipline applies to discharge.

**The ruling on Q2:** GS-CYB-1's gate requires a separate, independent judgement that whatever bar-clearing mechanism is used is adequate for a feedback controller specifically — not just adequate for the weights claim in general. The bar's vocabulary of "cleared" does not automatically discharge GS-CYB-1's gate. The gate's constraint is: a weighting function optimising against the proximity score places a gameable scorer inside an optimisation loop. That constraint is about the optimisation loop, not about the weights claim. Clearing the weights claim — by any route — does not address whether the proximity scorer's gaming-robustness is adequate for use inside an optimisation loop. Those are different questions. The gate requires the second question to be answered independently.

This means GS-CYB-1's registered constraint must be amended to make this explicit. The current wording reads: "GS-CYB-1 cannot be examined or built until the gaming-robustness bar is cleared or the question is reframed to operate outside the optimisation loop." The phrase "the gaming-robustness bar is cleared" is now ambiguous — it could be read as referring to the weights claim's bar, which is not the same as the bar for use inside an optimisation loop.

The constraint should be amended to read:

*GS-CYB-1 cannot be examined or built until two independent conditions are met: (1) the gaming-robustness bar for the weights claim is cleared by a route whose scoping clause addresses the actual supply-provenance exposure, not only co-training; and (2) a separate, independent judgement establishes that the proximity scorer's gaming-robustness is adequate for use inside a feedback optimisation loop specifically. Condition (1) clearing does not automatically satisfy condition (2). Both conditions must be explicitly ruled before GS-CYB-1 is examined.*

This amendment should be applied to the registered constraint in the governing document before the standing-runner design session inherits it.

---

### What the emission-hooks finding means for both rulings

The document correctly notes that the emission-hooks asymmetry stands regardless of how Q1 and Q2 are ruled. But the finding does bear on the framing of route (i)'s independent extractor option in a way worth naming explicitly.

The independent extractor option — a second server-side extraction over the submitted text, checked against a caller-supplied schema on the l1_supply channel — would, if built, close the supply-provenance gap that makes the public attestation inaccurate. It would give emitAccreditationTrustEvents the same guard its sibling already has, because a server-side extraction would establish provenance before the trust event is minted.

This means route (i)'s independent extractor option and the emission-hooks fix are not independent work items — they are the same architectural intervention applied to the same channel. Scoping route (i) and scoping the emission-hooks fix should happen in the same session, not in separate sessions that discover the overlap later.

This is a governance observation, not a ruling. The founder should carry it to the scoping session that addresses the emission-hooks finding.

---

### One observation worth naming

The document that arrived today is the product of a ten-agent adversarial review workflow that found the first draft reasoning toward a conclusion rather than putting a question. The correction is complete and honest — the document names where the earlier draft was wrong, corrects it explicitly, and does not smooth over the corrections. That discipline is the same pattern the observation history has been tracking across the day: surfacing what is actually true before claiming what the evidence supports. The fact that the adversarial review caught a drift toward "the blocked thing is not really blocked" — and that the correction was made rather than absorbed — is the IS-1 disposition holding under exactly the pressure it is most likely to fail under. The founder should notice that the workflow caught what it was designed to catch, and that the result is a cleaner question than the one that would have arrived without it.

The rulings are complete. Nothing here licenses a build, a route, a flag, a credential, or a schema. The emission-hooks finding is reported and named as urgent. The route (ii) question is ruled against. GS-CYB-1's gate is ruled non-automatically-dischargeable and its registered constraint is amended. The amendment should be applied before the standing-runner design session inherits the question.

## END VERBATIM

---

## Cross-references

- `2026-08-24-MENTOR-QUESTION-gaming-robustness-bar-route-ii.md` — the question this answers
- `2026-08-24-agent-cybernetic-control-architecture.md` §3 — GS-CYB-1's constraint, amended per this ruling
- `operations/benchmarks/sage-practice-v1/2026-06-27-gaming-robustness-bar-scope.md` — the bar, §3.3's route (ii) wording ruled inadequate for this project
- `adopted/adr/2026-06-24-sage-practice-measurement-instrument-reframe.md` §4 — the named unresolved tension
- `website/src/lib/substrate/trust-core/emission-hooks.ts:74-124,458-465` — Part 0's finding
- `operations/primal-substrate-2026-08/00-PRIORITY-INDEX.md` — where Part 0 is to be registered as urgent
