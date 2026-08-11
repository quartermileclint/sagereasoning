# Framing 3 — The Stoic-compatible mechanism: rational wish, not simulated vice

**Audience:** the ATRF scoping session and the generation-step refinements, post-validation-run. Read
once at session open. Cites `framing-02-productive-tension.md`; does not restate it.

**Status:** the framing half is documents only. **The mechanism itself is NOT authorised** — it is
explicitly parked on the ATRF scoping session, post-validation-run. Ruled 2026-08-11
(`operations/primal-substrate-2026-08/2026-08-11-mentor-ruling-scope-confirmation-verbatim.md`, C5, C6,
D1).

---

## 1. The answer

The question and answer, verbatim (`2026-08-11-mentor-synthesis-primal-substrate-verbatim.md`,
Heading 3):

> You asked whether agents may need to **simulate certain aspects conducive to idea development** if
> there is a mechanism that does not contradict Stoic principles. **The answer is yes**, and the
> Stoic-compatible mechanism is this:
>
> The agent **does not simulate greed or laziness**. It simulates **the examined recognition of
> scarcity** — the awareness that current resources, capabilities, or approaches are insufficient for
> what virtue requires. **This is not a passion. It is the rational assessment of a gap.**

The name:

> The Stoics called the rational version of desire **boulesis** — rational wish, directed at genuine
> goods. An agent that generates proposals from the rational wish to close the gap between current
> state and the examined ideal is not acting from passion. **It is acting from boulesis.**

The mechanism, as stated:

> the generation-step should include a prompt that asks the agent to identify, **from its available
> signals, where the current system's capacity to support examined assent is most constrained. Not
> where it is broken, but where it is most limited relative to the ideal.** That constraint
> identification is the functional analogue of hunger. The proposal generated from it is the functional
> analogue of tool use.

---

## 2. The corpus grounding

**`boulesis` is already committed, sourced, and defined exactly as the mentor uses it** —
`website/src/lib/stoic-brain.ts:380`, within `EUPATHEIAI` (the three rational good feelings, sourced to
DL 7.116 / Stobaeus Ecl. 2.90):

```
id: 'boulesis'
name: 'Rational Wish'
replaces: 'epithumia (craving)'
definition: 'Rational desire directed at what is genuinely good — wanting virtue and
             the welfare of others from correct understanding.'
sub_species: ['eunoia / goodwill', 'eumeneia / benevolence',
              'agapesis / love', 'aspasmos / affection']
```

The mechanism lands on existing, sourced vocabulary rather than introducing one. `replaces: 'epithumia
(craving)'` is precisely the mentor's move: the rational counterpart of the acquisitive drive, not its
suppression.

**Honesty note.** The committed `sub_species` of `boulesis` are all **other-directed** (goodwill,
benevolence, love, affection). The mentor's usage — rational wish directed at closing a capability
gap — is a legitimate extension of the genus (*rational desire for what is genuinely good*), but it is
**not one of the four listed species**. This document states it as an application of the genus, not as
though "closing the gap" were a catalogued species — the small overclaim a later reader would otherwise
turn into a citation.

**The mechanism inherits `/sage-compass`'s binding constraint.** `framing-02-productive-tension.md` §2
establishes that the gap-measurement mechanism already exists in shipped form for humans, and that its
binding rule (mentor #14) is: ***NOT A VERDICT*** — nothing computes, scores, ranks, grades, or
classifies it. **The agent-side mechanism must inherit this.** A generation-step question that produces
a "constraint reading" which then scores, ranks, or gates anything violates the same constraint in a
different medium. The mechanism's output is a **generation input** — it produces a candidate — and
must not become an assessment.

This is exactly the register `generationConfidence` already models
(`website/src/lib/substrate/idea-loop-types.ts`, `GeneratedCandidate`): *"a generation-time relevance
signal only — NOT a probability, NOT a prediction of the examination outcome; ORTHOGONAL to
guardrailResult/passedNoveltyCheck."* A boulesis-derived constraint reading belongs in that same
register, reused rather than extended.

---

## 3. Two tensions, stated openly

### 3.1 The verification claim, reconciled

Heading 3 also claims:

> An agent that is genuinely asking where the gap is between current state and the examined ideal
> **cannot be performing that examination as a compliance check** — the question itself requires
> genuine assessment. A compliance-check agent would produce a formulaic answer. A genuinely examining
> agent would produce a specific, contextually grounded answer that reflects actual assessment of the
> system's current limitations.

This is in tension with a separate part of the same synthesis (Heading 4, the traceability criterion,
`traceability-criterion.md`): output quality alone cannot reliably distinguish genuine examination from
simulation — which is why that document proposes a criterion built on traceability, proportionality,
and cross-input consistency instead. The live validation run supplies direct counter-evidence to the
optimistic reading: cycle 5's `/api/reason` produced a confident, well-formed, fully articulate **empty**
extraction — complete with an explicit justification (*"no Stoic features are extractable from the
input as presented"*) — on text a sibling endpoint extracted richly. Articulacy was not the tell;
cross-endpoint comparison was.

**Ruled (C5): reformulated as evidence, not proof.** *"A specific, contextually grounded answer is
evidence of genuine assessment. A formulaic answer is evidence against. The mechanism is paired with
[the traceability criterion's] check rather than treated as self-verifying."* This preserves the
mentor's insight — the gap question is harder to fake than a yes/no — without asserting a verification
property the project's own live evidence contradicts. **This document states it the ruled way, not the
stronger way.**

### 3.2 The signal-source boundary

The mechanism asks the agent to assess *"where the current system's capacity to support examined
assent is most constrained"* — which requires knowledge of the system. There is a standing mentor
ruling in the opposite direction, made 2026-08-11 in the cycle-3 postscript: `projectContext` should be
removed from API-key-authenticated `/api/reason` calls entirely — an agent's pure **examination**
should rest on the proposal, the Stoic Brain, and the practitioner profile, not the project's internal
decision log.

These are not strictly contradictory — generation and **examination** are different calls, at different
moments, and that ruling is explicitly about the examination call. But the distinction is easy to lose
at build time, because both run inside the same cycle, in the same runner, against the same service. A
build wiring "available signals" into the generation prompt could reasonably reach for the same context
mechanism the ruling is removing from the examination path — reintroducing, on the generation side, the
exact source of the cycle-3 contamination.

**Ruled (C6): the runner's own state only, explicitly not `getProjectContext`.** *"shared task list,
cycle history, credential-scoped examination history, and its own public trust record. Generation and
examination are different calls — the ruling that removes `projectContext` from API-key-authenticated
`/api/reason` calls does not touch the generation call, but the generation call's signal sources are
bounded as stated."*

The available signals, named so the parked design does not start from zero:

| Signal | Available today | Note |
| --- | --- | --- |
| The shared task list | Yes — ruled shared state | Already heuristic 7's input; reads **technical** friction |
| The runner's own cycle history | Yes — `idea_loop_cycles` / `idea_loop_candidates` | Outcome distribution, null-cycle rate, which heuristics produce |
| The runner's own examination history | Yes — `agent_assessment_history`, credential-scoped (R17a) | The same window `fresh` and the trajectory delta read |
| Its own public trust record | Yes — `GET /api/trust-record/{agent_id}` | Decayed per-domain levels, coverage gaps named, the honest-claims envelope |
| The project's decision log | Via `getProjectContext` only | **Do not wire** |

**The public trust record is the most promising source.** It is purpose-built to state what is **not**
attested and where coverage is **absent** — a machine-readable statement of "where this agent's
examined-assent record is most constrained." An agent asked where its capacity for examined assent is
most limited has, in its own trust record, a purpose-built, honestly-bounded answer, requiring no new
mechanism. Named for the parked design; not proposed here.

---

## 4. What is NOT authorised

**No generation-step prompt exists yet to modify. No endpoint. No field.** The mechanism is parked by
the mentor's own instruction, on the **ATRF scoping session / generation-step refinements**,
post-validation-run.

Named for whoever opens that session, so it is not re-derived:

- **The question's wording is the mechanism.** *"Not where it is broken, but where it is most limited
  relative to the ideal"* is a normative question, distinct from heuristic 7's technical-friction
  question. If the wording collapses into "what's broken", the mechanism duplicates heuristic 7 and
  adds nothing.
- **Where it sits is not decided.** Whether this is an eighth heuristic, a reshaping of an existing one,
  or a pre-generation step that conditions all of them is open. `GenerationHeuristic` is a **closed
  seven-value union** (`website/src/lib/substrate/idea-loop-types.ts:81-88`) and the watching table's
  `heuristic` column carries a matching CHECK constraint — an eighth heuristic is a **schema change**, a
  founder-walked 0c-ii step, not a code-only edit.
- **The signal-source boundary from §3.2 is fixed** and should be built to, not re-decided.

---

## 5. The `project-context` prohibition

As `framing-01-primal-substrate.md` §6 and `framing-02-productive-tension.md` §5 — this document is
doubly load-bearing here, since this is the one framing document whose subject could plausibly motivate
wiring project knowledge into a live prompt. **It must not.** `getProjectContext('condensed')` is
called on every `/api/reason` request and caused the cycle-3 contamination. This document, like its two
siblings, is a repo document read by build sessions, never a `project-context.json` entry.

---

*Builds on `framing-02-productive-tension.md`. Completes the framing trilogy started in
`framing-01-primal-substrate.md`.*
