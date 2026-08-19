# Mentor question — formally adding the epistemic status framework as a fourth ATRF open question

**Prepared 2026-08-19 for founder relay.** One question. **Not blocking the current build sequence**
— per your own words, relayed by the founder — but you also said it should not be left as an informal
note, so it is scoped rather than left indefinitely unscoped.

**PR20 compliance:** the question states, as one-sentence mechanism-level facts, the specific existing
behaviour a ruling would land on.

**Context you may not have.** Since you assessed the epistemic status framework and connected it to
GS-ATRF-1, the founder relayed your assessment to this session, and it has been recorded verbatim at
`operations/primal-substrate-2026-08/gs-atrf-corrections.md` §(e) and
`operations/agent-circles-2026-08/2026-08-18-addendum-reinforcement-learning-assessment-verbatim.md`.
Nothing has been added to any live surface. This question is the "needs a ruling" step you named.

---

## The question — should the epistemic status framework become GS-ATRF-4?

**Your words, as relayed:** *"The epistemic status framework — treating every consequential
proposition flowing through the reasoning harness as carrying an epistemic status (observation,
inference, assumption, unknown) — was assessed, connected to GS-ATRF-1, and noted as worth carrying
as a named open question alongside GS-ATRF-1 through 3. It was not formally added to the ATRF open
questions list. That addition needs a ruling before the generation-step build sequence closes."*

**Mechanism facts:**

1. The "ATRF open questions list" is a live Layer-3 project-context surface —
   `website/src/data/project-context.json`'s `"ATRF INTEGRATION — GENERATION-STEP OPEN QUESTIONS"`
   block, mirrored to the Supabase `project_context` row that the same block is served from at
   runtime. It is not a planning document; it is read by the harness.
2. GS-ATRF-1, GS-ATRF-2, and GS-ATRF-3 were added to that exact block on 2026-08-09
   (`D-ATRF-AND-CONSCIOUSNESS-CONTINUITY-ADDED-2026-08-09` /
   `D-PROJECT-CONTEXT-ATRF-AND-RULING-UPDATE-APPLIED-2026-08-09`), each as a named, numbered open
   question with its own "Open question:" prompt sentence — not as answered content. Formally adding
   a fourth question is the same class of edit: a static-file change plus an authored SQL `UPDATE` for
   the live row, founder-walked, `tsc`/import-verified.
3. GS-ATRF-1's own ruled answer (2026-08-09) is a **four-virtue proxy** — circles affected /
   irreversibility / preferred indifferents at stake / impulse proportionality — explicitly disclosed
   as *"a proxy, disclosed as such — but a philosophically grounded proxy."*
4. A gap in that ruled answer was found and recorded 2026-08-12
   (`operations/primal-substrate-2026-08/gs-atrf-corrections.md` §(c-bis), ruled to be raised
   independently): the four-virtue proxy has **no basis at all** for a `friction_detection` candidate
   — no `targetCircle`, no virtue-domain classification, by construction, not by omission — and the
   ruled `high | medium | low` vocabulary cannot express "this indicator has no basis." The parallel
   `assessStructuralNovelty` function, computing over the identical two missing inputs, returns
   `{ novel: true, confidence: 0 }` rather than manufacturing a rating; GS-ATRF-1's answer has no
   equivalent branch.
5. The epistemic status framework's own four-category vocabulary already contains the missing branch
   — **unknown** is one of its four categories, alongside observation, inference, and assumption. It
   is not merely a candidate mechanism for GS-ATRF-1's arithmetic; it independently supplies the exact
   disclosure category §(c-bis) found GS-ATRF-1's ruled vocabulary to be missing.

**The question, in three parts, so a partial ruling is still actionable:**

**(a) Should the framework be formally added** to `project-context.json`'s open-questions block as a
fourth question (working label GS-ATRF-4), alongside GS-ATRF-1 through 3, on the terms you already
named?

**(b) If yes, is it a standalone question, or an amendment to GS-ATRF-1's own text** — given fact 5
above, that its `unknown` category directly answers the basis-lessness gap §(c-bis) found in
GS-ATRF-1's *existing* ruled answer, rather than proposing something additional? We surface this
distinction rather than assume it, because the two shapes have different consequences: a standalone
GS-ATRF-4 leaves GS-ATRF-1's ruled answer as-is and adds a new, separately-scoped question; folding it
into GS-ATRF-1 would mean the ruled four-virtue-proxy answer itself gets a fifth, disclosure-only
category added to it, closing §(c-bis) directly rather than carrying it forward again.

**(c) Either way — should the `high | medium | low` vocabulary itself gain a fourth value** (or should
"unknown" be recorded some other way, e.g. a null/absent indicator with a separate flag, as
`assessStructuralNovelty` does)? Note that `manifest.md`'s vocabulary is currently fixed at three
values and is **not this question's to amend** — we ask only whether it is now in scope for you to
rule on, not what the answer should be.

---

## What we are NOT asking

We are not asking you to re-derive GS-ATRF-1's four-virtue proxy, re-open the 2026-08-09 ruling on its
own terms, or resolve §(c-bis) ourselves. The Q1 hard constraint (the loop proposes, never executes),
the Q11 sequence, the first build gate, and the post-validation-run "do not open early" gate on the
ATRF scoping session are all unchanged and untouched — this question does not ask to open that session
early; it asks only whether the open-questions list itself may gain a fourth entry (or an amendment to
its first entry) ahead of it, the way GS-ATRF-1/2/3 themselves were added ahead of the session that
will eventually answer them. The Consciousness and Continuity Obligation and the manifest pointer
added there 2026-08-19 are unrelated and untouched by this question.
