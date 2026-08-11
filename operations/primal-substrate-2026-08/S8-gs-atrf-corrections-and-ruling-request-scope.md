# S8 — Scope: GS-ATRF-1/2/3 — corrections carried, shape specified, and one reversal request

**Mentor heading 8.** **Execution order: 3 of 8.** See `00-PRIORITY-INDEX.md`.

---

## §0 Status, tier, gate

> **RULED 2026-08-11 — the relay ran and returned. All four open questions answered; corrections A2
> and A3 confirmed.** Verbatim record, which wins over every annotation below:
> `2026-08-11-mentor-ruling-scope-confirmation-verbatim.md`. **GS-ATRF-3: the MIDDLE option is adopted**
> (B1) — the generation-step document *states the requirement*; the return path is scoped in the ATRF
> session. **The 08-09 four-virtue GS-ATRF-1 answer stands.** **C10 settles two names that must never
> again be shortened to bare "blast radius":** *loop-level blast-radius proxy* and *permission-layer
> blast-radius enrichment*. Rulings folded inline below as **RULED** annotations; proposal prose kept,
> marked ruled rather than deleted.

**Status: SCOPE + a mentor relay — THE RELAY IS DISCHARGED. Nothing here licenses a build.** This item
ended in a brief to the mentor, not in code; the brief was put and answered on 2026-08-11.

- **Tier:** `governance` / documents + one PR20-compliant relay.
- **Deadline:** before the post-validation-run **ATRF scoping session** opens. Everything the ATRF
  session builds inherits GS-ATRF-1/2/3; if the corrections below are not carried first, that session
  starts from a weakened answer, a mechanism claim already found false, and a silently-reversed
  ruling.
- **Parked half waits on:** the **ATRF scoping session** (post-validation-run, explicitly *"do not
  open early"*). Not "the first build gate", which closed 2026-08-10 (§7.5).

**Why this is third, ahead of the framing trilogy.** It is the only item in the family that would
**overturn a standing mentor ruling** if adopted as written, and two of its three sub-items restate
things already ruled — one of them a claim already checked and found false on 2026-08-09. It is cheap,
and it protects everything downstream of it.

**This document does not argue that the mentor is wrong.** It argues that the synthesis was written
without the 2026-08-09 record in front of it, and that the reversal it proposes deserves to be
requested explicitly, against the reasoning that produced the original ruling, rather than absorbed.

---

## §1 What the mentor said

> The three ATRF open questions — GS-ATRF-1 through GS-ATRF-3 — look different after the brainstorming
> conversations.
>
> **GS-ATRF-1**, the blast-radius indicator, is now more clearly **a proxy for the oikeiosis circle
> most affected by the proposal**. A proposal that affects only the agent's immediate task (Stage 1
> oikeiosis) has low blast radius. A proposal that affects the rational cosmos (Stage 5) has high
> blast radius. The honest disclosure that this is a proxy, not a measurement, is consistent with the
> framework's commitment to traceability. **This can be ruled now.**
>
> **GS-ATRF-2**, the proposal shape extension, should carry the blast-radius indicator as an
> additional field with an explicit proxy disclosure flag. **The watching table's candidate row should
> carry the same field.** This is a build item but the shape can be specified now.
>
> **GS-ATRF-3**, the completion signal return path, is now **more clearly in scope for the
> generation-step document rather than deferred**. … That makes it a generation-step item, not a
> post-first-build-gate item. **This needs a ruling.**

---

## §2 Mechanism facts (PR20)

### §2.1 GS-ATRF-1 is already ruled — and the existing answer is richer

Ruled 2026-08-09, verbatim, in
`operations/agent-circles-2026-08/2026-08-09-mentor-review-six-stoic-items-and-gs-atrf-answers-verbatim.md`:

> **GS-ATRF-1 — Blast radius indicator:** The four-virtue framework gives the most honest answer.
> Blast radius at the reasoning level is a function of: **how many oikeiosis circles are affected**
> (dikaiosyne), **how irreversible the action is** (andreia, applied to reversion difficulty), **how
> many preferred indifferents are at stake** (phronesis), and **how much the action exceeds what
> reason warrants** (sophrosyne — impulse proportionality). These four dimensions, assessed from the
> candidate's virtue domain and targetCircle, constitute an honest proxy for blast radius without
> accessing task details. High blast radius: affects circles 3–5, low reversibility, multiple
> high-axia preferred indifferents at stake, virtue domains spanning justice and courage. Low blast
> radius: affects circle 1–2, high reversibility, low-axia preferred indifferents, single virtue
> domain. **This is a proxy, disclosed as such — but it is a philosophically grounded proxy, not an
> arbitrary one.**

The synthesis's formulation — *"a proxy for the oikeiosis circle most affected"* — is **the first of
those four dimensions**. Adopting it as written would narrow a ruled four-dimensional answer to one
dimension, and would drop the unity-thesis grounding that made it *"the most honest answer."*

**Both formulations agree on everything they share** (circle-derived, a proxy, honestly disclosed).
The difference is scope, and the ruled answer is strictly larger.

### §2.2 The manifest already fixes two facts the synthesis does not cite

`manifest.md`, ATRF section, **Blast radius indicator** paragraph — adopted verbatim from mentor
instruction 2026-08-09:

> When the IDEA loop proposes an action, the proposal carries a rough blast-radius indicator — **high,
> medium, or low** — assessed by the loop at the reasoning level, not the task level. The harness uses
> this indicator to determine whether a pre-task reasoning assessment is warranted. **The agent's own
> assessment of blast radius is itself a reasoning signal and is recorded alongside the loop's
> indicator for longitudinal comparison.**

Two consequences the synthesis's "an additional field" does not carry:

1. **The vocabulary is already fixed at three values** — `high | medium | low`. A build does not get to
   choose an enum; it inherits one, and a CHECK constraint should encode exactly these.
2. **Two records are required, not one.** The loop's indicator *and* the agent's own assessment,
   *"recorded alongside … for longitudinal comparison."* The comparison **is** the signal — a
   divergence between what the loop assessed and what the agent assessed is precisely the kind of
   reasoning-quality evidence the ATRF exists to carry. A single-field shape cannot represent it.

**Note the actor boundary this creates**, because it bears on GS-ATRF-3: the loop's indicator is
produced at proposal time by the runner; the agent's own assessment can only arrive *after* the
proposal reaches the agent. The two fields therefore have different authors and different moments —
the same distinction the GS-ATRF-3 deferral rests on (§2.4).

### §2.3 GS-ATRF-2's "the watching table's candidate row should carry the same field" repeats a claim already found false

This exact claim was checked first-hand on 2026-08-09 and **did not hold**. The 08-09 record states
it plainly:

> Item 5 states *"The watching table's candidate rows carry `targetCircle` per candidate"*, and
> GS-ATRF-2 states *"The watching table's candidate row carries `targetCircle` and
> `initialClassification` already."*
>
> **GS-ATRF-2's "one additional nullable field" is understated.** The blast-radius indicator's
> dikaiosyne dimension (*"how many oikeiosis circles are affected"*) cannot be computed from a
> persisted candidate row today, because **the circle is not on it**.

**Re-verified independently 2026-08-11** against
`website/supabase-idea-loop-watching-migration.sql` §2. The complete `idea_loop_candidates` column
list: `id`, `cycle_id`, `gap_ref`, `heuristic`, `proposed_action`, `classification_kind`,
`classified_domains`, `generation_confidence`, `guardrail_proximity`, `guardrail_domains`,
`guardrail_session_id`, `passed_novelty_check`, `novelty_confidence`, `novelty_basis`,
`cycle_outcome`, `unavailable_dependency`, `created_at`.

**There is no `target_circle` column.** `initialClassification` *is* persisted (as
`classification_kind` + `classified_domains`); `targetCircle` is not. This is already a named item on
the standing queue ("the `target_circle`/blast-radius persistence gap") awaiting a founder-walked
additive migration whenever the blast-radius indicator is first built.

**Consequence for the shape:** realising the ruled GS-ATRF-1 answer needs, at minimum, **three**
additive columns, not one — the loop's indicator, the agent's own assessment, and `target_circle` (or
a cycle-level resolution of the circle from the gap, which the ruled record names as the alternative).
They are one migration, not three, and they should be built together.

### §2.4 GS-ATRF-3 was ruled — and the reasoning matters

Ruled 2026-08-09, verbatim:

> **GS-ATRF-3 — Idea completion signal return path:** This is **a separate scope item after the first
> build gate**. The generation-step document is the runner-side half of a cycle; the completion signal
> is the agent-side return after election and execution, which is **a different actor** (the agent,
> not the runner) and **a different moment** (post-execution, not post-proposal). **Scoping it inside
> the generation-step document would blur the Q1 hard constraint** — the generation step produces
> proposals, and the completion signal is what happens after a proposal becomes an action. It belongs
> in its own scope item, after the first build gate, when the runner scoping session has established
> the agent identity and the watching table exists to receive the signal.

The later prioritised instruction placed it more precisely still — in the **post-validation-run ATRF
scoping session** — and the 08-09 record notes GS-ATRF-3's deferral is *"consistent with — and now
made more specific by"* that instruction.

**The Q1 hard constraint** — *the loop proposes; it never executes* — is carried in every document of
the IDEA-loop sequence by requirement. The deferral's argument is that the completion signal is
definitionally **post-execution**, so housing it in the document that defines proposal generation puts
execution-side machinery inside the proposal-side spec.

**The synthesis's counter-argument, stated fairly:** the completion signal *"is not just a technical
handshake — it is evidence about whether genuine examination occurred. It should be designed to carry
that evidence, not just a binary completion flag."* That is a real point, and it is new — it was not
before the mentor on 08-09. It argues the signal's **content** is examination-evidence rather than
task-telemetry.

**But it does not touch the deferral's actual reasoning**, which is about **actor and moment**, not
about content richness. A signal can be rich in examination-evidence *and* still be authored by a
different actor at a different moment. The ATRF scoping session is where an examination-evidence-
carrying return path would naturally be designed — it is the session that owns the pre-task record and
the post-task assessment, which have exactly the same actor and moment properties.

**This is the argument the relay must put.** Not "the mentor contradicted himself" — the two positions
were formed on different information — but "here is the reasoning the deferral rested on; here is the
new argument; does the new argument move it?"

### §2.5 A third home for `blast_radius` already exists — and nobody has reconciled the three

Dependency-graph **item 16** (governance permission field extension, SCOPED and APPROVED AS SUBMITTED
2026-08-07) names `blast_radius` as one of its ten fields, and it was **ruled 2026-08-07 to live on a
separate permission-layer schema, not the Layer-2 assessment schema.** Its value is the output of
**item 14** (second-order impact analysis — structured elicitation + independent LLM search +
value-stake extraction), whose structured elicitation is itself ruled *"a post-verdict overlay — it
runs after the Layer-2 verdict is signed, never before, and never feeds back into it."*

So `blast_radius` now has **three candidate homes** across three separately-ruled workstreams:

| Home | Source | Producer | Moment |
| --- | --- | --- | --- |
| The **proposal shape** | GS-ATRF-2 | the loop, from circle + virtue domains | proposal time |
| The **watching candidate row** | GS-ATRF-2 | persistence of the above | cycle record time |
| The **permission-layer schema** | item 16, ruled 2026-08-07 | item 14's three-step analysis | post-verdict overlay |

**These are not obviously the same quantity.** The GS-ATRF-1 proxy is computed *without accessing task
details*, from the candidate's circle and virtue domains. Item 14's is computed *with* structured
elicitation and an independent LLM search. One is a cheap reasoning-level proxy; the other is a
deliberate, expensive, post-verdict enrichment. **If they share a field name and a three-value
vocabulary but not a method, a later reader will conflate them** — and the project has already been
bitten twice this window by a claim that two things were the same when they were not (the C1c naming
collision; the "watching table carries targetCircle" claim).

**Nothing in this document resolves that.** It is raised as **Q8-d** because it is exactly the kind of
cross-workstream collision PR20 exists to surface *before* a ruling locks a shape in.

---

## §3 The concurrent half

Three deliverables, all documents.

### §3.1 A corrections note

`operations/primal-substrate-2026-08/gs-atrf-corrections.md`, recording §2.1–§2.3 with citations:
GS-ATRF-1 already ruled and richer; the manifest's fixed three-value vocabulary and two-record
requirement; the `target_circle` gap re-verified. Short, and its whole purpose is that the ATRF
scoping session inherits the corrected version rather than the synthesis's.

### §3.2 The GS-ATRF-2 shape specification

The synthesis authorises specifying the shape now. Specified against the **ruled** GS-ATRF-1, the
manifest's fixed vocabulary, and the verified column list:

**On the proposal shape (`GeneratedCandidate`, `idea-loop-types.ts`):**

- `blastRadius?: 'high' | 'medium' | 'low'` — the loop's indicator. Vocabulary fixed by the manifest,
  not chosen.
- `blastRadiusBasis` — the **explicit proxy disclosure** the synthesis requires. Recommended as a
  structured record of the four ruled dimensions actually used (circles affected; reversibility;
  indifferents at stake; impulse proportionality), each with what it was derived from, plus the
  standing disclosure that the whole indicator is a proxy assessed without task details. A bare
  boolean `isProxy: true` would satisfy the letter and lose the traceability the mentor's own §4
  criterion asks for — the reader should be able to see *which* dimensions drove a `high`.
- **Absent, not defaulted**, when it cannot be computed — the house evidence-floor discipline. A
  friction candidate carries **no `targetCircle`** by construction, so its dikaiosyne dimension has no
  input; an indicator manufactured for it would be exactly the "confident verdict from absence of
  evidence" pattern the `fresh` endpoint's `insufficient_history` basis was introduced to avoid.
  **This is a real and immediate interaction with S6:** if friction ever becomes the primary channel,
  the primary channel is the one that cannot carry a blast-radius indicator.

**On the watching candidate row (`idea_loop_candidates`) — one additive migration, three columns:**

| Column | Why |
| --- | --- |
| `blast_radius TEXT CHECK (... IN ('high','medium','low'))`, nullable | the loop's indicator; vocabulary from the manifest |
| `agent_blast_radius TEXT CHECK (same)`, nullable | the manifest's *"agent's own assessment … recorded alongside … for longitudinal comparison"* |
| `target_circle` (nullable smallint, or a ruled cycle-level resolution) | closes the verified gap; without it the dikaiosyne dimension is not recomputable from the row |

Plus a nullable basis column if Q8-c is answered in favour of persisting the disclosure. All additive,
all nullable, retention and data-rights inherited from the row (the table's existing `retain_until`
and sweep cover new columns with no extra work). **Founder-walked 0c-ii when built.**

### §3.3 The GS-ATRF-3 relay

A PR20-compliant brief that:

1. quotes the 08-09 deferral **in full**, including its actor/moment reasoning and the Q1 argument;
2. quotes the synthesis's counter-argument **in full**;
3. states plainly that this is a **reversal request**, not a clarification;
4. names what changes materially if it is granted (the generation-step document acquires
   execution-side scope; the ATRF scoping session loses its natural anchor) and what changes if it is
   refused (nothing is lost — the examination-evidence argument transfers intact to the ATRF session,
   which owns the pre/post-task records the signal would sit beside);
5. offers the middle position explicitly (§5, Q8-a).

---

## §4 The parked half

**GS-ATRF-3's build waits on the ATRF scoping session regardless of which way the ruling goes** — the
synthesis itself says so (*"the build waits for the first build gate"*, read forward to the current
gate). The GS-ATRF-2 **migration** is likewise parked: it is a founder-walked Critical step and there
is no reason to alter a live table mid-validation-run for a field nothing yet produces.

---

## §5 Open questions for the mentor

**Q8-a — GS-ATRF-3: reversal, refusal, or the middle position?** Three options, stated so the mentor
is choosing rather than confirming:

1. **Hold the 08-09 ruling.** The signal stays in the ATRF scoping session. The examination-evidence
   argument is recorded there as a design requirement, so nothing is lost but the location.
2. **Reverse it.** The generation-step document takes the completion signal. This puts post-execution
   machinery in the proposal-side spec; the Q1 constraint then needs an explicit statement of how the
   boundary is still held.
3. **Middle (AI's recommendation).** The **generation-step document states the requirement** — that
   the completion signal must carry examination evidence, not a binary flag, and why — while the
   **return path itself is scoped in the ATRF session**. The new argument is captured at the point it
   arose; the actor/moment boundary that produced the deferral is preserved.

**Q8-b — Does GS-ATRF-1's ruled four-dimension answer stand, or does the synthesis narrow it
deliberately?** Recommendation: **the four-dimension answer stands**; the synthesis's circle-based
formulation is its first dimension, and the unity-thesis grounding is the reason it was called the
most honest answer.

**Q8-c — Is the proxy disclosure persisted, or computed at read time?** Persisting the four dimensions
makes a `high` auditable after the fact; computing at read time keeps the row small but makes a past
indicator un-reconstructable once the derivation changes. Recommendation: **persist**, consistent with
the §4 traceability criterion this same synthesis asks for.

**Q8-d — Are the loop's blast-radius indicator and item 16's `blast_radius` the same field?** (§2.5.)
They share a name and a vocabulary but not a method, a producer, or a moment. Recommendation: **name
them distinctly now** — a cheap reasoning-level proxy and an expensive post-verdict enrichment are
different quantities, and the project has been bitten twice this window by two things sharing a name.
If they are meant to be one field with two population paths, that needs saying explicitly.

---

## §5-RULED — the 2026-08-11 rulings

> **RULED (Q8-a / B1) — the MIDDLE option, option 3, adopted.** Verbatim:
>
> *"The 2026-08-09 ruling rested on actor and moment … That reasoning survives. The synthesis's new
> argument — that the signal must carry examination evidence, not a binary flag — is real and was not
> before me on 2026-08-09. **It addresses content, not actor or moment.**
>
> Ruling: the generation-step document **states the requirement** — the completion signal must carry
> examination evidence, not a binary flag, and the reason is that the signal is the primary
> post-execution evidence of whether genuine examination occurred rather than simulation. The **return
> path** — how the agent sends it, what the harness does with it, schema — is **scoped in the ATRF
> session**. The Q1 hard constraint is preserved because the generation-step document is stating a
> requirement on a downstream artefact, not designing that artefact's implementation. **This is the
> same relationship the generation-step document has to the watching table: it specifies what must be
> carried, not how the table is built.**"*
>
> **What this authorises, precisely:** a dated amendment to
> `operations/agent-circles-2026-08/2026-08-09-generation-step-scope.md` adding the **requirement**
> (with its stated reason), under the house dated-amendment pattern — original prose kept, marked
> superseded rather than deleted, matching that document's own 2026-08-09 §2.9 amendment. **It does
> NOT authorise** any schema, field, endpoint, or return-path design; that is the ATRF session's.
> The watching-table analogy is the test to apply if a later reader is unsure whether something belongs
> in the generation-step document: *what must be carried*, yes; *how it is built*, no.

> **RULED (Q8-b / A2) — the four-dimension answer stands.** *"The four-virtue proxy ruling from
> 2026-08-09 stands and is the larger answer. The synthesis's oikeiosis-circle-only framing was a
> narrowing, not an extension … S8 inherits the four-dimension answer."* The `high | medium | low`
> vocabulary and the **two-record** requirement (loop indicator **and** agent's own assessment) are
> confirmed as already fixed in `manifest.md`.

> **RULED (Q8-c / C11) — persisted.** *"A `high` should remain auditable after the derivation changes.
> Consistent with the traceability criterion this synthesis asks for."*

> **RULED (Q8-d / C10) — named distinctly, from this point.** *"Same vocabulary, different method,
> producer, and moment. The project has been bitten twice this window by two things sharing a name.
> **They are named distinctly from this point: loop-level blast-radius proxy and permission-layer
> blast-radius enrichment.**"*
>
> **Binding naming rule:** neither name may be shortened to bare "blast radius" in any future scope or
> build document. The §3.2 shape below and the parked migration inherit the **loop-level blast-radius
> proxy** name; item 16's field keeps **permission-layer blast-radius enrichment**.

> **RULED (A3) — three columns, confirmed.** *"The watching table has no `target_circle` column. The
> synthesis's claim was false and was already caught on 2026-08-09. **Three additive columns are
> needed: loop indicator, agent assessment, and circle.** S8 carries this correctly."*

---

## §6 Build-success criteria

For the concurrent half:

1. The corrections note cites the 08-09 record and the manifest **by quotation**, not by summary.
2. The GS-ATRF-2 shape uses the manifest's fixed `high|medium|low` vocabulary and specifies **both**
   records (loop's and agent's), not one.
3. The shape states the absent-not-defaulted rule and names the friction-candidate case explicitly.
4. The GS-ATRF-3 relay presents it as a reversal request, quotes both positions in full, and offers
   the middle position.
5. No `idea-loop-types.ts` edit, no migration, no flag — documents only. (`git diff --stat` check.)

For the parked migration, when it opens: additive, nullable, idempotent, reversible, `§VERIFY` block,
TEST → prod founder-walked, byte-identical behaviour with the columns absent (test-asserted), PR19
review before the walk, and the three columns built as **one** migration.

---

## §7 Corrections carried

1. **GS-ATRF-1 is already ruled** (2026-08-09) with a **four-virtue** answer; the synthesis's version
   is one of its four dimensions.
2. **GS-ATRF-2's watching-table claim repeats a claim already checked and found false** — there is no
   `target_circle` column; re-verified 2026-08-11.
3. **"One additional nullable field" is understated three times over** — the manifest requires two
   records, and the circle must be recoverable, so the migration is three columns minimum.
4. **The blast-radius vocabulary is not open** — the manifest fixes `high | medium | low`.
5. **"Park until after the first build gate" is stale** — that gate closed 2026-08-10; GS-ATRF-3's
   build parks on the **ATRF scoping session**.
6. **GS-ATRF-3's proposed move is a reversal of a ruling whose stated reasoning the synthesis does not
   engage** — actor and moment, not content richness.
7. **A third `blast_radius` home exists** (item 16, ruled 2026-08-07, separate permission-layer schema,
   produced by item 14) and has not been reconciled with either of the other two.

---

## §8 Rollback

`git revert` the records commit. Documents and a relay only; nothing deploys. If the GS-ATRF-3 ruling
is granted and later regretted, the generation-step document's amendment is revertible in place under
the house dated-amendment pattern (proposal prose kept, marked superseded rather than deleted) — the
same pattern the 08-09 sequencing amendment already uses.
