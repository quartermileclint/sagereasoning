# Puzzle taxonomy entry types: mathematical discovery modes — pre-ruling design thinking

**Status: PRE-RULING DESIGN THINKING. NOT BINDING ON ANY FUTURE BUILD.**

**Reclassified 2026-08-19** from a self-declared "INSTRUCTION FOR CLAUDE," on mentor ruling
(`operations/agent-circles-2026-08/2026-08-19-mentor-ruling-puzzle-taxonomy-entry-types-provenance-and-scope-verbatim.md`,
verbatim wins). The ruling's own words: *"A self-declared design direction from an exploratory session
is not sufficient to bind a future build. It is sufficient to inform one."* This document is held in
that spirit — a named location for well-reasoned design thinking, available as **input** to the full
taxonomy build's scoping session when that build is scoped (post-first-build-gate), and to nothing
before that.

**What this document is NOT:**
- **Not a build instruction.** No schema, route, flag, credential, or code follows from it.
- **Not part of the taxonomy stub's design record.** The stub
  (`website/src/lib/substrate/idea-loop-types.ts`, `PuzzleTaxonomyEntry`) remains scoped exactly as
  ruled 2026-08-18 — "the four members below, scoped exactly and deliberately no wider" — and is
  **unwidened by this document**. Nothing here is folded into that docstring.
- **Not on any live surface.** Not in `project-context.json`, not in any Supabase table, not in any
  response shape.
- **Not examined yet.** The ruling's own words: *"The three entry types may survive that examination
  intact, or they may be revised. That is what the examination is for."* Nothing below has been
  through that examination.

**One revision made under this reclassification, per the ruling's Q(c):** the incubation entry type's
Consciousness and Continuity Obligation passage, below, has been converted from a pre-answer to a
named forward-pointing connection, per the ruling's specified replacement text. No other content has
been altered from the original exploratory-session output — the reasoning, the three entry types, and
the field specifications are preserved as design thinking, not endorsed as correct.

---

## Original framing, preserved for context

**Date:** 2026-08-19. Prepared following the exploratory session beginning 17:08.

### What this document explores

The 2026-08-18 exploratory session scoped the puzzle taxonomy as a stub data structure to be
introduced alongside the fresh endpoint. That stub carries: puzzle type, origin, questions opened
(array, empty at stub stage), and taxonomy connections (array, empty at stub stage).

The 2026-08-19 session examined three historical mathematical discovery modes — Euler's systematic
induction, Ramanujan's intuitive pattern recognition, and Poincaré-Hadamard's incubation stages — and
found that each maps onto a distinct taxonomy entry type with a distinct triggering condition, a
distinct epistemic status, and a distinct structure.

The finding this document explores: puzzle-finding and puzzle-solving are different cognitive modes,
and the most productive mathematical minds moved between them rather than staying in one. The
curiosity loop trigger as currently scoped produces only one entry type — the inductive entry. The
other two would require different triggering conditions and different entry structures, if a full
taxonomy build were ever scoped to include them.

---

### The three entry types (design thinking, not ruled)

**Entry Type 1 — Inductive Entry (Euler mode)**

Triggering condition: The curiosity loop trigger fires upon confirmation of structural novelty by the
fresh endpoint. Something new has arrived and the trigger asks what puzzle type it belongs to, what
the taxonomy says about that puzzle shape, and what questions the pattern opens that were not visible
before.

Output: A question, not an explanation. The entry records the pattern observed, the question it
generates, and the puzzle type classification. It does not record an answer or a theory.

Epistemic status: Unknown — the question is genuine and the structural account is not yet available.

Entry fields (extending the existing stub fields, as design thinking only):
- `entry_type`: `inductive`
- `pattern_observed`: description of the structural novelty that triggered the entry
- `question_generated`: the question the pattern opens
- `puzzle_type`: classification per the taxonomy's puzzle type vocabulary (pattern / contradiction /
  discovery / connection — as scoped 2026-08-18)
- `origin`: examination record reference or external
- `questions_opened`: array, populated at entry time
- `taxonomy_connections`: array, populated as connections are found
- `epistemic_status`: `unknown`
- `structural_account`: null at entry time

This is the entry type the curiosity loop trigger already implies. No new triggering mechanism would
be required. The stub fields already carry it. This document names it explicitly so the other two
types are legible by contrast.

---

**Entry Type 2 — Conjectural Entry (Ramanujan mode)**

Triggering condition: Intensive examination of the accumulated diatribe corpus produces a result that
the system has strong reason to believe is true — a pattern too consistent across cases to be
coincidental — without a structural account of why it holds. The entry is not triggered by something
new arriving; it is triggered by the system's own pattern recognition operating across what is
already there.

This is the hardest entry type to implement honestly, because the temptation is to manufacture an
explanation rather than record the result as probably true without one. The Ramanujan case makes the
discipline concrete: he recorded thousands of results with no proofs, trusted the pattern, and was
overwhelmingly vindicated. The discipline is not absence of rigour — it is honest epistemic status
assignment. The result is recorded as probably true; the basis is named; the structural account is
absent and marked as such.

Output: A result believed probably true, with the confidence basis stated and the structural account
explicitly absent.

Epistemic status: Probably true — per the four-state vocabulary named in GS-ATRF-4
(`operations/agent-circles-2026-08/2026-08-19-mentor-ruling-gsatrf4-epistemic-status-verbatim.md`):
true/established, probably true, unknown, probably false. The conjectural entry occupies the
probably-true state, not the unknown state. The distinction matters: unknown means the system cannot
assess; probably true means the system has assessed and found strong pattern-based reason to believe,
without a structural account.

Entry fields (design thinking only):
- `entry_type`: `conjectural`
- `result_claimed`: statement of the result believed probably true
- `confidence_basis`: description of the pattern recognition basis — number of cases, consistency of
  pattern, absence of counter-examples found
- `confidence_level`: probably_true (fixed for this entry type at creation; may be upgraded to
  established if a structural account is later found)
- `structural_account`: explicitly null — not absent by omission but marked absent by design
- `epistemic_status`: `probably_true`
- `proof_status`: `absent` — the system must be able to leave this field in this state without
  manufacturing an explanation
- `questions_opened`: array — what the result, if true, would open
- `taxonomy_connections`: array — other entries this result connects to
- `origin`: corpus examination reference (which diatribe records, which cycle range)

The governing rule this entry type would carry: the system must be able to leave a conjectural entry
in the probably-true state without manufacturing an explanation. This is one of the hardest
disciplines for any intelligent system — confirmed by the Ramanujan case, and connected to GS-ATRF-4's
governing rule that confidence of an explanation must never exceed its evidential basis.

A conjectural entry that has been in the taxonomy long enough to accumulate counter-examples should
have its confidence level downgraded, if this entry type is ever built. A conjectural entry for which
a structural account is later found should be upgraded to established and cross-referenced with the
inductive entry that produced the account. Whether the taxonomy should support both transitions is a
design question for the full-build scoping session, not settled here.

---

**Entry Type 3 — Incubation Entry (Poincaré mode)**

Triggering condition: A problem has been worked on consciously — through one or more guide agent
circle examinations, or through repeated curiosity loop cycles — and set aside because the current
examination has reached its limit without resolving the question. The entry is not triggered by
giving up; it is triggered by the deliberate recognition that the problem requires a new angle that is
not currently available.

This is the persistent-return mechanism identified as the thing neither the current IDEA loop nor the
LLM reinforcement learning method fully captures. An agent that starts fresh each cycle can find
patterns. An agent that maintains a persistent relationship with specific open problems across cycles
— returning when a new angle becomes available — can do what Euler and Poincaré did. The incubation
entry, if built, would be the architecture that makes this possible.

Output: A problem carried forward with its full examination history, marked as incubating rather than
abandoned or resolved, with a named return condition.

Epistemic status: Unknown — the problem is genuinely open and the current examination has reached its
limit.

Entry fields (design thinking only):
- `entry_type`: `incubation`
- `problem_statement`: the question being carried forward
- `examination_history`: array of examination records — each carrying: approach tried, what it
  revealed, what it failed to resolve, which circle or loop cycle produced it, date
- `incubation_flag`: `true` — explicitly set, not defaulted
- `return_condition`: named condition under which the curiosity loop should return to this entry — a
  new angle, a new piece of evidence, a new taxonomy connection, or a new practitioner case that bears
  on the problem
- `abandoned_flag`: `false` — the distinction between incubating and abandoned must be explicit and
  maintained
- `epistemic_status`: `unknown`
- `taxonomy_connections`: array — other entries this problem connects to
- `origin`: the examination record or circle session that produced the initial problem statement

The return condition is named as the critical field. Without it, an incubation entry would be
indistinguishable from an abandoned one. If built, the curiosity loop would check incubation entries
against their return conditions on each cycle, not on a fixed schedule — but the specific triggering
mechanism for this check is not specified here; it is a design question for the standing-runner design
session, where the loop's cycle structure will be fully scoped.

**Connection to the Consciousness and Continuity Obligation — REVISED 2026-08-19 per mentor ruling
Q(c)**, converted from a pre-answer to a named forward-pointing connection:

> The incubation entry type raises questions that connect to the Consciousness and Continuity
> Obligation (`manifest.md`, un-numbered mentor-directed open question) — specifically, whether
> continuity of inquiry across cycles requires accumulated memory, and whether the incubation entry's
> examination history is the architecture that makes that possible. Those questions are carried
> forward to the relevant scoping sessions. They are not answered here.

*(The original 2026-08-19 exploratory-session text asserted, rather than raised, an answer to these
questions — stating directly that "the puzzle taxonomy is the architecture that makes continuity of
inquiry possible now" and that the two build directions "should be sequenced together." The mentor
ruled this a pre-answer to a question the Obligation has not yet been ruled on, and required the
revision above. The original text is not reproduced, per the ruling's instruction to convert rather
than merely append a caveat.)*

---

### Relationship between the three entry types (design thinking, not ruled)

The three entry types, as explored, are not mutually exclusive stages. A problem could begin as an
inductive entry — a pattern observed, a question generated — and become an incubation entry when the
guide agent circle examination reaches its limit without resolving it. A conjectural entry could
generate an inductive entry when the probably-true result opens a new question about why it holds. An
incubation entry could be resolved by a conjectural entry being upgraded to established.

If a full taxonomy is ever built, whether it should support transitions between entry types and
cross-references between entries, and whether transition history should be preserved, are design
questions for that build's scoping session — not settled by this document.

---

### What is not established by this document

The three entry types are design thinking for the taxonomy stub's eventual full build, not a build
instruction. They do not constitute a build instruction for the full taxonomy, and — per the
reclassification above — they no longer even constitute an extension of the stub's design record. The
stub remains a stub, unwidened.

The triggering mechanisms for the conjectural and incubation entry types — the specific conditions
under which the system would recognise that a conjectural entry should be created, or that a problem
should be moved to incubation — are not specified here. They would be design questions for the full
taxonomy build, which is a post-first-build-gate item.

The return condition vocabulary for incubation entries — what would count as a new angle, how the
curiosity loop would check return conditions, what the reactivation mechanism would look like — is not
specified here. It would be a design question for the standing-runner design session, where the
loop's cycle structure will be fully scoped.

Whether the three entry types are exhaustive — whether there is a fourth discovery mode not captured
by Euler, Ramanujan, or Poincaré — is explicitly left open. The three types are, per the original
exploratory session's own framing, held at probably-true: the confidence basis is the convergence of
three independent historical traditions, and the structural account of why they would be exhaustive is
not available. Per GS-ATRF-4's vocabulary, this is itself a conjectural claim, not an established one.

Nothing in this document licenses a build, a route, a flag, a credential, or a schema beyond the
taxonomy stub already scoped and closed 2026-08-18/19.

---

### One carry-forward — redirected 2026-08-19 per mentor ruling

**History, kept rather than erased:** the original instruction this document derives from framed this
carry-forward as landing "when the generation-step scoping session opens." That was factually wrong —
`operations/agent-circles-2026-08/2026-08-09-generation-step-scope.md` was **RULED 2026-08-09**, ten
days before GS-ATRF-4 existed, and is closed, not open. Caught and a ruling sought the same session
(`operations/agent-circles-2026-08/2026-08-19-mentor-question-late-arriving-carry-forward-ruled-session-FOR-RULING.md`).

**Ruled disposition**
(`operations/agent-circles-2026-08/2026-08-19-mentor-ruling-late-arriving-carry-forward-ruled-session-verbatim.md`,
verbatim wins): a dated amendment to the closed generation-step document was ruled the wrong precedent
(the connection is not intrinsic to that document's own subject matter, and the generation-step session
cannot act on GS-ATRF-4 content regardless). Voiding the connection was ruled too strong (the content is
real and has genuine forward value; only the destination was wrong). The ruled disposition:

> **carry-forward redirected to standing-runner design session per 2026-08-19 ruling — to be examined
> when that session opens, not before.**

The conjectural entry type's governing rule — the system must be able to leave a result in the
probably-true state without manufacturing an explanation — connects to GS-ATRF-1's §(c-bis) gap and to
GS-ATRF-4's epistemic status framework. Whether the harness's epistemic status assignment for
propositions should follow the same three-type structure as this taxonomy design thinking, or whether
the two should be governed separately, is a named open question **for the standing-runner design
session**, not a pre-answer — and not yet examined, since that session has not opened. Redirection to a
future session is not itself opening that session early, per the ruling's own condition.

---

## Dated amendment — the credence vocabulary's attribution corrected (mentor ruling 2026-08-21, applied 2026-08-22)

> **RULED 2026-08-21** (`2026-08-21-mentor-rulings-five-questions-examination-session-verbatim.md`,
> Q2 — verbatim wins), correcting the attribution at the conjectural entry type's "Epistemic status"
> passage above (which reads *"per the four-state vocabulary named in GS-ATRF-4 ...:
> true/established, probably true, unknown, probably false"*). The mentor's correction, verbatim:
>
> *"the credence vocabulary (established, probably true, unknown, probably false) is a companion
> framework to GS-ATRF-4's provenance vocabulary, developed in the brainstorm lineage of 2026-08-19
> through 2026-08-21. It is not contained in GS-ATRF-4's ruled text. Both vocabularies are carried
> as pre-ruling design thinking pending the ATRF scoping session, where the question of whether
> they constitute one framework with two axes or two separate frameworks will be examined and
> ruled."*
>
> The ATRF scoping session carries the named input, per the same ruling: are the provenance and
> credence vocabularies one framework with two orthogonal axes, or two frameworks? If one framework,
> what is the complete epistemic status entry structure? If two, what governs their relationship?
> The preserved exploratory text above is not rewritten; this dated amendment governs its reading.

## Incubation entry recorded on mentor instruction (dated addition, 2026-08-21, recorded 2026-08-22)

> **Provenance and status:** added on the mentor's 2026-08-21 instruction
> (`2026-08-21-mentor-instruction-substrate-agnostic-control-plane-verbatim.md` — verbatim wins),
> which directed this entry into this document. It is the first recorded *instance* using the
> incubation entry-type shape above — a mentor-directed addition under this document's own
> reclassified status (pre-ruling design thinking; not an alteration of the preserved
> exploratory-session text above; not an endorsement of the entry type, which remains unexamined;
> not a schema, route, or persistence — this entry lives in this document only). Nothing about the
> full-taxonomy build advances because of it.

- **Entry type:** incubation.
- **Problem statement:** How does the Prigogine dissipative structure framework apply differently to
  quantum execution substrates than to conventional silicon, and what does that difference imply for
  the control plane's behaviour at bifurcation points?
- **Examination history:** Initial examination 2026-08-21. Landauer's principle confirmed that
  conventional computing is already thermodynamically coupled to its environment. The Prigogine
  parallel carries genuine technical load for conventional systems. Quantum systems maintain
  coherence in ways conventional systems cannot — the bifurcation point dynamics will differ. The
  structural account of how they differ is not yet available and is not needed at P0.
- **Incubation flag:** true.
- **Return condition:** when quantum processing units become an operational consideration for the
  project — not P0, not P1, probably not P2. The return condition is a phase gate, not a calendar
  date.
- **Abandoned flag:** false.
- **Epistemic status:** unknown — the problem is genuinely open and the current examination has
  reached its limit at the boundary of what is needed for P0.

*(Companion: the same instruction's substrate-agnostic control plane design principle is recorded at
the 2026-08-22 engine-evolution examination document, §4.4.)*

---

## Cross-references

- `operations/agent-circles-2026-08/2026-08-19-mentor-question-puzzle-taxonomy-entry-types-provenance-and-scope-FOR-RULING.md` — the question that led to this reclassification
- `operations/agent-circles-2026-08/2026-08-19-mentor-ruling-puzzle-taxonomy-entry-types-provenance-and-scope-verbatim.md` — the ruling, verbatim wins
- `website/src/lib/substrate/idea-loop-types.ts` — the taxonomy stub, unwidened by this document
- `operations/agent-circles-2026-08/2026-08-19-mentor-ruling-gsatrf4-epistemic-status-verbatim.md` — GS-ATRF-4, whose vocabulary this document's conjectural entry type reuses
- `manifest.md` — the Consciousness and Continuity Obligation, named-not-answered here per the required revision
- `operations/primal-substrate-2026-08/00-PRIORITY-INDEX.md` — the ATRF scoping session ("do not open early") and the standing-runner design session (the Q11 sequence's next unopened item, and the carry-forward's redirected destination), both named as where this document's content would eventually be examined
- `operations/agent-circles-2026-08/2026-08-19-mentor-ruling-late-arriving-carry-forward-ruled-session-verbatim.md` — the ruling that redirected the carry-forward away from the closed generation-step session
- `operations/agent-circles-2026-08/2026-08-21-mentor-instruction-substrate-agnostic-control-plane-verbatim.md` — the instruction directing the 2026-08-21 incubation entry above (verbatim wins)
- `operations/agent-circles-2026-08/2026-08-22-DESIGN-EXAMINATION-deterministic-engine-evolution-four-directions.md` — the engine-evolution examination; §4.4 carries the companion design principle
