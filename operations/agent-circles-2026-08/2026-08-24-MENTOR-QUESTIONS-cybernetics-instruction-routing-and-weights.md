# Mentor questions — the cybernetics instruction: routing, weights, and the live-prompt payload

**Authored 2026-08-24** on the founder's reading of `inbox/Mentor Cybernetics Instructions.rtf`
(the Agent Cybernetic Control Architecture frame + GS-CYB-1 + GS-CYB-2 + changelog, four tasks).

**Status: NOT EXECUTED.** No task in that instruction has been applied. Four questions arise that
would change how — or whether — it is applied, and three of them were not visible from the
instruction itself. **Nothing here disputes the frame or the two questions on their merits.**

---

## Mechanism facts the ruling lands on (PR20) — each verified first-hand 2026-08-24

1. **The generation-step scoping session is CLOSED** — ruled 2026-08-09
   (`2026-08-09-generation-step-scope.md`; close at
   `operations/handoffs/founder/2026-08-09-generation-step-scoping-CLOSE.md`).
2. **The proximity score IS stored in the watching table** — `guardrail_proximity`,
   `website/supabase-idea-loop-watching-migration.sql:184`. It is a **five-value ordinal enum**
   (`reflexive | habitual | deliberate | principled | sage_like`), **not a number.**
3. **The ATRF Integration register is injected into the live evaluative engine.** It lives in
   `dynamic_defaults.current_phase` in `website/src/data/project-context.json` — **4,159 characters** —
   and `buildCondensedContext` renders it verbatim as `PROJECT CONTEXT: ${current_phase}` into every
   `/api/reason` Layer-1 extraction prompt (`website/src/app/api/reason/route.ts:1410`,
   `getProjectContext('condensed')`).
4. **A mentor-ruled architectural fix to that injection exists and is deliberately unbuilt** —
   removing `projectContext` from API-key-authenticated `/api/reason` calls, following the
   four-month-latent unlabelled-`recent_decisions` contamination defect found 2026-08-11. The narrow
   labelling fix shipped; the architectural fix is not scheduled.
5. **"Weights BLOCKED" is a standing constraint** carried on every session close, and ADR-012's third
   rung (model-creator / weights) is blocked pending the gaming-robustness bar — on the ground that a
   gameable virtue-scorer inside an optimisation loop trains fluent vice that scores as virtue.
6. **GS-ATRF-4's existing register entry already points at the closed session** — it ends *"To be
   examined at the generation-step scoping session."*

---

## Q1 — Routing: both questions are addressed to a closed session

The instruction addresses GS-CYB-1 and GS-CYB-2 to *"the generation-step scoping session"* and directs
a new section plus a changelog entry into that session's governing document. **That session closed
2026-08-09.** This is the class the 2026-08-19 ruling governs (a question pointed at a closed session
is redirected to the next unopened session whose subject matter fits, held as a named input) and which
the 2026-08-24 ruling extended (*"the governing condition is not the origin of the carry-forward — it
is the shape of the mismatch"*), explicitly rejecting the dated-amendment-to-the-closed-document shape.

**The question:** does that principle apply here, and which session receives GS-CYB-1 and GS-CYB-2?
Candidates: the **standing-runner design** (gated on the §6 report; already holds §5d), the **ATRF
scoping session** (already holds GS-ATRF-1..4 as named inputs), or a **new generation-step scoping
session** if the frame warrants re-opening that subject matter under a fresh session.

**A secondary consequence either way:** GS-ATRF-4's entry carries the same stale pointer (fact 6).
If the principle applies, that pointer is wrong too and should be corrected in the same pass rather
than left to be rediscovered.

## Q2 — Does GS-CYB-1 collide with weights BLOCKED?

GS-CYB-1 proposes a **candidate weighting function that biases generation toward the virtue domains
and oikeiosis circles where regression is most pronounced**, updated by a proximity delta, with
saturation and reset conditions. That is a feedback controller **optimising against the proximity
score.** It is not model weights — but it places a scorer whose gaming-robustness bar has not been
cleared inside an optimisation loop, which is the substance of what ADR-012's third rung is blocked on.

The instruction does not mention weights BLOCKED, and the question would be registered as an open
design proposal without that constraint attached.

**The question:** is registering GS-CYB-1 as written compatible with weights BLOCKED — or must the
question carry that constraint explicitly, or be reframed, before it is registered anywhere? **The
concern is not the frame; it is that registering a proposal without its governing constraint attached
lets the constraint go missing at the session that eventually examines it.**

## Q3 — Task 4 grows the live extraction prompt

The instruction describes itself as *"a documentation and conceptual incorporation task only."* For
Tasks 1–3 that is accurate. **Task 4 is not:** the register it targets is injected verbatim into every
`/api/reason` Layer-1 extraction prompt (fact 3), and GS-CYB-1 and GS-CYB-2 as specified would add
roughly 2,000 characters to a 4,159-character payload — a ~50% increase in the project-context text
the evaluative engine sees on every consult, on a mechanism whose architectural fix is ruled and
unbuilt (fact 4).

**The question:** is that intended? If the register is to carry the two questions, should it carry a
**condensed form** rather than the full design specifications — or should the specifications live in
the governing document (Task 1) with only a pointer in the register?

## Q4 — Precision: the proximity score is ordinal, not numeric

GS-CYB-1 specifies error extraction as `E(n) = P(n) − P(n−1)`. The stored value is a five-value
ordinal enum (fact 2). The engine has a `PROXIMITY_RANK` mapping, so a rank-difference is tractable —
but *"positive E means movement toward katorthoma"* over an ordinal scale assumes equal spacing
between ranks, which is a substantive claim about the scale, not an implementation detail.

**The question:** is the rank mapping intended, and is the equal-spacing assumption something the
receiving session must examine rather than inherit?

---

## One thing that cannot be verified here

The design constraint is to be cited as a **named constraint** with full bibliography: Rajpal, H.,
Expert, P., and Vasiliauskaite, V. (2026), *Directed cycles as higher-order units of information
processing in complex networks*, Communications Physics, s42005-026-02820-3. **This session could not
verify that the paper exists or that it supports the stated claim** — it is past the assistant's
knowledge cutoff and no verification channel was used. Recorded as
**unverified-at-relay**, per PR20's stale-fact discipline, because the instruction makes its accuracy
load-bearing rather than decorative.

---

## What is not being asked

Not asked: to dispute the cybernetic frame, which reads as a genuine and well-formed mapping onto
existing components; to pre-answer GS-CYB-1 or GS-CYB-2; or to defer the instruction. **Tasks 1–3
look executable as soon as Q1 is settled.** Q2 and Q3 bear on Task 4 and on what the registered
questions carry with them.

## Cross-references

- `inbox/Mentor Cybernetics Instructions.rtf` — the instruction (unexecuted)
- `2026-08-19-mentor-ruling-late-arriving-carry-forward-ruled-session-verbatim.md` — the closed-target principle (Q1)
- `2026-08-24-mentor-ruling-deliberation-reading-open-question-routing-verbatim.md` — its extension (Q1)
- `2026-08-09-generation-step-scope.md` — the closed session both questions address
- `adopted/adr/2026-06-24-sage-practice-measurement-instrument-reframe.md` — ADR-012, the three-rung ladder (Q2)
- `website/src/data/project-context.json` / `website/src/app/api/reason/route.ts:1410` (Q3)
- `website/supabase-idea-loop-watching-migration.sql:184` (Q4)

*End of questions. Nothing executed; nothing registered; no code, flag, schema, or public surface.*
