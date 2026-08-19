# Mentor question — puzzle taxonomy entry-type instruction: provenance and scope

**Prepared 2026-08-19 for founder relay.** One question, three parts. **Not blocking any current build**
— nothing has been touched in code or schema on the strength of the instruction this question concerns.

**Context.** An "INSTRUCTION FOR CLAUDE — Puzzle Taxonomy Entry Types: Mathematical Discovery Modes,"
dated 2026-08-19, following an exploratory session beginning 17:08, was relayed by the founder. It
proposes extending the puzzle-taxonomy stub's design record with three named entry types (inductive,
conjectural, incubation), each with ~7-9 fields, transition semantics between them, and explicit ties
to GS-ATRF-4 and the Consciousness and Continuity Obligation. It self-labels "Status: Design direction
established" and states it licenses no build beyond the taxonomy stub already scoped 2026-08-18.

**PR20 compliance:** mechanism facts below are stated as one-sentence facts about current, verified
repository state — each checked first-hand this session, not assumed from the instruction's own text.

**Note on timing:** a concurrent session was found this session to have formally added GS-ATRF-4 to
the ATRF open-questions block between 16:55–17:02 today, through this project's ordinary
FOR-RULING/verbatim-ruling process (`2026-08-19-mentor-question-epistemic-status-fourth-question-FOR-RULING.md`
/ `2026-08-19-mentor-ruling-gsatrf4-epistemic-status-verbatim.md`). GS-ATRF-4 is therefore real and
ruled by the time this question is asked — this question is not disputing that. It concerns the
puzzle-taxonomy instruction specifically, which arrived by a different path.

---

## Mechanism facts

1. The puzzle-taxonomy stub (`PuzzleTaxonomyEntry`, `website/src/lib/substrate/idea-loop-types.ts`) was
   scoped 2026-08-18 (immediate-scope item 1 of that day's relay), built and closed 2026-08-19
   (`D-CURIOSITY-TAXONOMY-STUBS-BUILT-GUIDE-CIRCLE-RECORDED-2026-08-19`), and independently
   PR19-reviewed (25 agents, 0 errors) before close. Its own docstring states the four members are
   "scoped exactly and deliberately no wider."
2. Every other binding addition found in this repository's history — including today's GS-ATRF-4
   addition — reached the codebase through a scoped question, PR20 mechanism facts, a founder relay,
   and a verbatim-recorded ruling. The document under question here is not in that form: it is
   self-titled an instruction, self-declares its own status as established, and was not preceded by a
   scoped question this session or any other prepared.
3. The ATRF scoping session is recorded as gated "post-validation-run, explicitly 'do not open early'"
   (`operations/primal-substrate-2026-08/00-PRIORITY-INDEX.md:296`). The instruction's conjectural
   entry type is stated to connect directly to GS-ATRF-4's vocabulary and GS-ATRF-1's §(c-bis) gap; its
   incubation entry type states "the Consciousness and Continuity Obligation is directly implicated
   here" and names the two as needing to "be sequenced together when the Consciousness and Continuity
   Obligation moves from open question to active build scope."
4. The instruction itself states, in its own closing section, that it establishes no build beyond the
   already-scoped stub, that the triggering mechanisms for two of the three entry types are unspecified
   design questions for a later session, and that whether the three types are exhaustive is "itself a
   conjectural entry" — explicitly held at probably-true, not established.

---

## The question, in three parts

**(a) Provenance — is a self-declared "design direction" from an exploratory session sufficient to
bind a future build, or does it need the same scoped-question/ruling form as every other binding
addition this project has made?** We are not asking whether the content is good; we are asking what
process converts it from a proposal into something the next session that touches the taxonomy is bound
by. If the form itself is sufficient once relayed, we would rather be told so than default to treating
every relayed document as equally binding going forward.

**(b) Scope — should the taxonomy stub's design record (docstrings, comments, no schema/route/behaviour
change) be extended now with the three entry types, or held as a separate design document until the
taxonomy moves from stub to full build?** The stub itself is closed and PR19-verified at its current,
minimal shape. Extending its design record is not a schema or behaviour change, but it is a substantial
rewrite of something just closed, on the strength of a document that has not itself been through this
project's ruling process.

**(c) The "do not open early" gate — does connecting the conjectural and incubation entry types to
GS-ATRF-4 and the Consciousness and Continuity Obligation, as the instruction does, constitute opening
the ATRF scoping session's territory early, or is it the same kind of forward-pointing note the ATRF
open-questions block itself already carries (GS-ATRF-1 through 4 are all open questions sitting ahead
of that session, not answers to it)?** We surface the distinction rather than assume it, because the
instruction reads more like reasoning INTO that territory (proposing specific field structures tied to
specific ATRF questions) than pointing AT it.

---

## What we are NOT asking

We are not asking whether Euler/Ramanujan/Poincaré is the right taxonomy of discovery modes, whether
three types are correct or exhaustive, or whether the field structures proposed are well-designed — the
instruction's own content is not in question. We are asking only what should happen to it now: build,
hold as a document, or return for a proper ruling first. The Q1 hard constraint, the Q11 sequence, the
first build gate, GS-ATRF-1/2/3/4, and the generation-step and ATRF scoping sessions are unchanged and
untouched by this question.
