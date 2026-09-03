# MENTOR QUESTIONS — O-C Gate 3: per-consumer rendering design

**Date:** 2026-09-03. **Companion to:**
`2026-09-03-DESIGN-DOCUMENT-oc-per-consumer-rendering-FOR-RULING.md` — which governs where the two
differ. **Gate 3.** `SUBSTRATE_LAYER3_ENABLED` unset; nothing licensed.

**This document and the design were substantially rewritten after three independent blind adversarial
reviews. The design's original central proposition was withdrawn as refuted** — see Q2.

> ## ✅ ANSWERED 2026-09-03 — ALL SEVEN RULED
>
> Verbatim record, which wins over this document and every summary:
> `2026-09-03-mentor-rulings-oc-gate3-verbatim.md`
> (`D-MENTOR-RULINGS-OC-GATE3-ADOPTED-EXECUTED-2026-09-03`).
>
> **Q1** Gate 3 was properly before the session; the boundary is **the rendering surface and the floor
> constraint**, with Layer 3 injection and the Stage-2 reframing belonging to the standing-runner
> track's next design-capable session — anything bearing on them is **named in the handoff, not
> resolved**. **Q2** the floor is correct, and **applies to the verdict's conditions of production,
> not its content** — a condition on honesty, not form. **Q3** re-siting requires **its own
> surface-scoped vetting**; the "five need no new wording" claim is superseded. **Q4** the ruled
> delivery sentence **does not survive** the change of surface and referent — **new wording per
> surface**, and the **proxy basis must be disclosed**. **Q5** emit-and-annotate stands; the
> annotation **must disclose the proxy basis and its uncertainty**. **Q6** the pointer is **dropped**
> and the element's scope **conceded**; the ENV-1 extension is **not licensed**. **Q7** use the
> evidence **at the level it supports** — Reading B present *in this population*, not dominant,
> Reading A not excluded.
>
> **Nothing is licensed beyond the design work itself.** The exclusion list is unchanged: no
> activation, no code edit, no ENV-1 change, **no publication of any string, re-sited ones included**.

---

## PR20 — the mechanism facts a ruling will land on

Each verified first-hand against source.

1. **Per-consumer rendering is unbuilt below the flag.** With the flag on today, a human and an agent
   practitioner would receive **identical** renderings: the live call site hardcodes
   `consumer_context` and never reads the audience the route computes; `Layer3Consumer` is a
   single-member union; `prose_mode` is validated and echoed but routes to one template.
2. **The consult response already carries honest metadata** — `meta.layer1_source`,
   `meta.narrative_status`, `meta.previous_trigger`, and **`meta.trajectory`**, an additive
   record-descriptive block that surfaces evidence without moving the verdict. *(An earlier draft
   claimed `meta` was four fields; that was the library construction site, not the served response.)*
   What the response does **not** carry is how or whether the examination reached the practitioner,
   why a floor fired, or whether the extraction's self-reports were corroborated.
3. **The honest wording for the delivery gap exists, ruled and battery-locked, and is live** — on the
   **public trust record**, not on the consult response.
4. **`proximity_floors {…, basis}`** already names which domain floored a verdict — inside the signed
   assessment.
5. **The corroboration report** (`corroborated | uncorroborated | contradicted`) is computed per
   response and also rides inside the signed assessment.
6. **A2's role-blindness sentence is live** on `llms.txt` (L425), scoped to `/api/guardrail`.
7. **The live variance disclosure states its own scope limit:** *"No rate has been measured on
   `/api/reason`, and this one does not transfer to it."*
8. **The four relational-context fields are absent from `website/src`** (grep: 0). Role material does
   exist — a validated `role` on `CandidateProfile`, an A2A-card mapper, an `incompatible-role`
   exclusion — but on the discernment/collaboration path, not on `/api/reason`'s request.
9. **`classifyOrientationDelivery` has one production consumer**, on a credentialed path. A
   cookie-session human practitioner produces no delivery class.
10. **An inherited misattribution, corrected:** the Gate-2 document cites the B7 cross-endpoint
    scoping as *"Ruling Set D's B/R-6"*; Ruling Set D contains no such item. It is **Ruling Set B's
    R-6**, and its full wording ends with a clause the Gate-2 document drops — *"a served form needs
    its own scoping session"* — which bears on Q1's boundary question.
11. **`GET /api/trust-record/{agent_id}` 404s for an orientation-only agent** — its ENV-1 gate is
    `domains.some(hasEvidence) || provenance_gaps.length > 0`, and orientation readings seed no state
    row.

---

## Three corrections the ruling should see

**A. A load-bearing figure is inverted — and the error is narrower than an earlier draft claimed.**
Source: `elapsedMs <= 28000 ⇒ 'examined'`, `> 28000 ⇒ 'observed'`. **The correct figure is 19 of 22
(≈86%) landing outside the window, not 3 of 22 (14%).**

Where the error is, precisely: the Gate-2 scope document's **§2.2 states it correctly** (*"19 classed
`observed`, 3 classed `examined`"*, `~86%`); its **§3 mis-summarises its own evidence** as 14%; the
session prompt repeats §3's error **while citing §2.2** as its source. The mentor's Q2 ruling inherits
the figure — *"delivery-timeout gap at 14% of orientation events"*, which is the ruling's only
wording on it. *(An earlier draft of this companion presented "3/22, 14%, completed outside the bound"
as a quotation of what all three sources say. It is what one — the prompt — says; the composite is
withdrawn.)*

Q2's substance is untouched and strengthened. **But the correction is not uniformly favourable to the
design:** at 86% outside, a response-borne delivery notice reaches ~14% of readers, so the
circularity is the dominant case rather than a caveat. See Q6.

*The §6 data is a single credentialed loop identity's 20-cycle consult history — a verified instance,
not a survey of agent practitioners in general.*

**B. Q4's evidential premise has been overtaken.** Since the ruling: the nine-candidate classification
**ran to completion** (twice corrected, three blind reviewers); the **c11 experiment ran** (9/10
`deliberate`, 1/10 `reflexive`, divergence localised to one extraction field, four distinct states
across ten identical draws); and a pooled **n=100** disclosure is live. Reading B is demonstrated
present; Reading A is not excluded.

**C. A boundary tension the design cannot resolve itself.** Ruling Set E's **A4** (2026-08-30) routes
*"The per-consumer rendering question and the Stage-2 relational-context reframing are both routed
to the standing-runner design session as scoped items"* — one week after Gate 2 licensed Gate 3 for the same subject, and
addressing a register row that cites the same 2026-08-12 scoping record Gate 2 opens from. A4's stated
premise (*"Layer 3 exists and is injected on `/api/reason`"*) is **factually wrong today** — the call
is flag-gated and the flag is unset — though that phrase sits inside the mentor's restatement of the
*register's* item and may be inherited from it. The standing-runner session has already run, so on the
passed-moment reading A4 points at that track's next design-capable session. **The 2026-08-19
carry-forward precedent says such content is examined when the session opens, not before.** This
document proceeded anyway on Gate 2's explicit naming of Gate 3; that was a judgement, and Q1 puts it
first.

---

## The questions

**Q1 — the boundary, first because it conditions the rest.** **Are Gate 3 and Ruling Set E's A4 the
same question routed twice?** If so, the design's substance belongs to the standing-runner track and
this document should be received as an input, not as a design.

**Q2 — the disclosure floor.** The design's original claim — *"the per-consumer part of per-consumer
rendering is form, not content"* — is **withdrawn as refuted**, on three grounds: **L-2 rules the
opposite** (*"Human form names crisis resources and support paths. Agent form names endpoints,
structured next steps, and the operator's own escalation process"*); the crisis precedent the draft
cited as support **withholds content from the human by design** (`safety_signal` *"ignored for
human_user audience"*; `developer_note` agent-only); and the argument was **circular** — the block was
first restricted to server-act claims, then found to be audience-invariant.

**Its replacement: *content may differ by audience; the floor may not.* No audience may be told
something false, and no audience may have withheld from it a limit bearing on how it should treat the
verdict.** **Is that the right constraint?**

**Q3 — re-siting ruled text.** Five of nine proposed elements carry text already ruled and live
elsewhere. **Is re-siting within the ruling that authored it, or does each surface need its own
vetting?** The premise is less uniform than it looks: the *"one draw"* sentence is verbatim at
`llms.txt` L425, reduced at L868 and on agent-card, and **absent from api-docs**; A2's sentence has
its middle clause deleted on api-docs.

**Q4 — the delivery sentence's referent.** The ruled text says the reasoning *"was not returned to
**the agent** in time to be examined"* — *"an event the agent was not present to."* Re-sited onto a
response **addressed to that agent**, it addresses the reader as the one who reasoned, which the
design's own relay constraint forbids; carried in a relay sibling, it tells a **human end-user** about
the other party's examination state, which R20d declines. It is also a claim reaching the
practitioner's state, derived from a transport-level proxy. **Does the ruled sentence survive the
change of surface and referent?**

**Q5 — the refusal class.** L-5's third move licenses *refusing to answer* — *"rather than filling the
gap."* Faithfully inverted onto a response surface, that would license the server declining to emit a
floor it cannot determine on the occasion; the c11 result shows such a class exists. The design takes
the weaker "emit and annotate" form, because a refusal class changes **verdicts**, not renderings, and
belongs to the floor-semantics track where M-vs-W already sits deferred. **Is that the right
division?**

**Q6 — the pointer.** At ≈86% outside the window the response-borne delivery notice reaches a
minority; the durable trust record was the proposed remedy and **404s for orientation-only agents**.
**Should orientation readings participate in the ENV-1 gate — a scoped change with its own honesty
cost, for which slice 3's `provenance_gaps` is precedent — or should the pointer be dropped and the
element's scope conceded?**

**Q7 — dimension (d)'s evidential position.** Given correction B, **is using the completed
classification and the demonstrated Reading B the intended posture, or should Gate 3 have held to the
one-instance level Q4 named?**

---

## Two things the design now says that it did not before

**Dimension (d)'s affordance half is restored.** An earlier draft silently narrowed (d) to "what a
rejected practitioner is told about *why*" and never quoted L-2. Both halves are now designed: the
agent form names the re-examination path, the endpoint, and the operator's escalation process; the
human form names what to do with a floored verdict and whom to ask.

**The elements are classified by the project's own channel law, with a success criterion.** The
record-channel elements (delivery, corroboration, floor provenance, known absences, limits) are the
ones the channel law predicts will land — and are exactly those needing **no new wording**. The
ADVISE-channel elements (reading stability, cross-endpoint) need new wording and mentor vetting and
are, on this project's measured history, the most likely to be discounted. **Proposed sequencing:
record-channel first; ADVISE-channel second, gated on the first landing.** Proposed falsifiable
criterion: does the block change the **re-submission rate** on floor-class verdicts, measurable from
existing metering.

---

## What a ruling here does not license

Activation of `SUBSTRATE_LAYER3_ENABLED`; any edit to the Layer-3 files, `parallel-run.ts`, or
`/api/reason/route.ts`; any new delivery-class computation on the human path; any change to
`orientation-reading.ts` or to the trust record's ENV-1 gate; any schema change for the four
relational-context fields (F-b); any change to `question-bank.ts` (L-5); publication of any string,
**including the re-sited ones**; any change to the R18 surfaces; any movement of R8's gates or the
A2/A4 routings. Any eventual build is additionally gated on the byte-identity guard's end condition.

*End of mentor-question distillation.*
