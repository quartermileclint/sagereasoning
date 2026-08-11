# Next session — S8: the generation-step dated amendment, the corrections note, and the GS-ATRF-2 shape

**Paste this as the first message of a new session, beneath the standing session opener.**

**Tier: `governance` / documents. Standard under 0d-ii.** No code, schema, flag, credential, migration,
or public-surface change. AC7 not engaged. PR6 not engaged.

**⚠ This session writes into TWO directories, and that is a change from every prior session in this
family.** Permitted paths: `operations/primal-substrate-2026-08/`,
`operations/agent-circles-2026-08/2026-08-09-generation-step-scope.md` (that **one file**, nothing else
in that directory), and `operations/decision-log.md`. Verify with `git diff --stat` before committing.

---

## 0. Before anything else

Open under `operations/handoffs/founder/STANDING-SESSION-OPENER-grounded-foundations.md` as normal.

**The IDEA-loop parallel-window check applies here in a way it did not for S4/S6.** This session amends
a document that governs the IDEA loop's generation step, while the bounded validation run is live. It
still touches no endpoint, no flag, no credential, and no run record — but read
`operations/handoffs/founder/2026-08-10-idea-loop-parallel-window-NEXT-SESSION-PROMPT.md` and confirm
no blocking spec has appeared in the scratch project before you start. **You do not write into the
run's records under any circumstance.**

---

## 1. What you are building — three deliverables

| # | Deliverable | Where |
| --- | --- | --- |
| **1** | **The B1 dated amendment** — the completion-signal *requirement* | `operations/agent-circles-2026-08/2026-08-09-generation-step-scope.md` |
| **2** | **The corrections note** | `operations/primal-substrate-2026-08/gs-atrf-corrections.md` (new) |
| **3** | **The GS-ATRF-2 shape specification** | `operations/primal-substrate-2026-08/gs-atrf-2-shape.md` (new), or folded into (2) — your call, stated either way |

All three are **fully ruled**. Your job is to write them to specifications that exist. If you find
yourself re-opening a decision, check first whether it has already been ruled — in this family, it
usually has.

---

## 2. Read these, in this order

1. `operations/primal-substrate-2026-08/00-PRIORITY-INDEX.md` — the family's shape and status.
2. `operations/primal-substrate-2026-08/S8-gs-atrf-corrections-and-ruling-request-scope.md` — **in
   full.** §2 is the mechanism evidence, §3 is your build spec, §5-RULED carries the answers.
3. **The verbatim ruling records — these win over every annotation, including annotations that quote
   them:**
   - `2026-08-11-mentor-ruling-scope-confirmation-verbatim.md` — **§B1** (the amendment's authorisation
     and its boundary), **§A2/§A3** (the corrections), **§C10** (the settled names), **§C11**, **§C16**.
   - `operations/agent-circles-2026-08/2026-08-09-mentor-review-six-stoic-items-and-gs-atrf-answers-verbatim.md`
     — the **08-09 GS-ATRF-1/2/3 answers**. The four-virtue blast-radius answer is here verbatim;
     transcribe from it, do not re-type from a summary.
4. `operations/agent-circles-2026-08/2026-08-09-generation-step-scope.md` — the amendment target. Read
   its **§2.9 amendment (line 175)** first: that is the exact dated-amendment pattern you follow.
5. `manifest.md` — the **ATRF section**, "Blast radius indicator" paragraph. It fixes two things the
   shape must inherit rather than choose.

---

## 3. Deliverable 1 — the B1 dated amendment

### What B1 authorises, exactly

> *"the generation-step document **states the requirement** — the completion signal must carry
> examination evidence, not a binary flag, and the reason is that the signal is the primary
> post-execution evidence of whether genuine examination occurred rather than simulation. The **return
> path** — how the agent sends it, what the harness does with it, schema — is **scoped in the ATRF
> session**. The Q1 hard constraint is preserved because the generation-step document is stating a
> requirement on a downstream artefact, not designing that artefact's implementation. **This is the
> same relationship the generation-step document has to the watching table: it specifies what must be
> carried, not how the table is built.**"*

### The test to apply, on every sentence you write

**What must be carried — yes. How it is built — no.** The mentor supplies the watching-table analogy
precisely so there is a decidable test rather than a judgement call. Apply it literally: if a sentence
would still be true were the return path implemented three different ways, it is a requirement. If it
constrains *which* implementation, it belongs to the ATRF session and must not appear.

**Concretely, this means: no field names, no schema, no endpoint, no transport, no payload shape, no
storage decision.** Those are the ATRF session's, and pre-empting them is exactly what the 08-09
deferral was protecting against.

### Placement

Follow the §2.9 pattern at line 175: a dated `> **AMENDED 2026-08-11 …**` block, **original prose kept
and marked superseded rather than deleted**, citing the verbatim record and the decision-log entry.

**Recommended placement: a new subsection after §2.11**, since §2.10 is *"What the generation step
deliberately does NOT do"* and this is a positive requirement rather than an exclusion. **But add a
cross-reference in §2.10** stating that carrying this requirement is not designing the return path —
§2.10 is where a future reader looks for the boundary, and the boundary just moved slightly.

**Also correct in the same amendment:** §2.9's existing amendment ends by noting *"GS-ATRF-1/2/3 are
carried into the runner scoping session's scope document as named inputs"* and names a post-run ATRF
scoping session. That remains true for GS-ATRF-1 and -2. **GS-ATRF-3's status has changed** — its
requirement now lives here, its return path in the ATRF session. Say so, so the two amendments do not
contradict each other for a reader who finds §2.9 first.

---

## 4. Deliverable 2 — the corrections note

Short, and its entire purpose is that the **ATRF scoping session inherits the corrected version** of
GS-ATRF-1/2 rather than the synthesis's. Three corrections, each quoted from its source:

**(a) GS-ATRF-1 was already ruled, and the ruled answer is larger.** The **four-virtue** proxy — circles
affected (dikaiosyne), reversibility (andreia), preferred indifferents at stake (phronesis), impulse
proportionality (sophrosyne). The synthesis's *"proxy for the oikeiosis circle most affected"* is the
**first of those four**; adopting it as written would narrow a ruled answer and drop the unity-thesis
grounding that made it *"the most honest answer."* Mentor's confirmation (A2): *"The synthesis's
oikeiosis-circle-only framing was a narrowing, not an extension."*

**(b) The vocabulary and the record count are already fixed in `manifest.md`, not open.** `high |
medium | low`, and **two records** — the loop's indicator **and** *"the agent's own assessment of blast
radius … recorded alongside the loop's indicator for longitudinal comparison."* **The comparison is the
signal**: divergence between what the loop assessed and what the agent assessed is the reasoning-quality
evidence. A single-field shape cannot represent it.

**(c) The watching table has no `target_circle` column.** Found false on 08-09, re-verified
column-by-column 2026-08-11 against `website/supabase-idea-loop-watching-migration.sql` §2. **Three
additive columns are needed, not one** (A3, confirmed).

---

## 5. Deliverable 3 — the GS-ATRF-2 shape specification

**Specify the shape. Do not build it.** The migration is parked — there is no reason to alter a live
table mid-validation-run for a field nothing yet produces, and it is a founder-walked 0c-ii step when
it opens.

**On the proposal shape:** the indicator, using the manifest's fixed three-value vocabulary; and the
**explicit proxy disclosure** B6/GS-ATRF-2 requires. Per **C11 the disclosure is persisted**, not
computed at read time — *"A `high` should remain auditable after the derivation changes."* Recommended
as a structured record of **which of the four ruled dimensions actually drove the reading**, since a
bare `isProxy: true` satisfies the letter and loses exactly the traceability this family's own §4
criterion asks for.

**Absent, not defaulted, when it cannot be computed.** A `friction_detection` candidate carries **no
`targetCircle`** by construction, so its dikaiosyne dimension has no input. Manufacturing an indicator
for it would be the "confident verdict from absence of evidence" pattern that `fresh`'s
`insufficient_history` basis exists to prevent.

**On the watching candidate row — one migration, three columns**, all additive and nullable: the loop's
indicator; the agent's own assessment; and the circle (or a ruled cycle-level resolution of it, without
which the dikaiosyne dimension is not recomputable from the row). Retention and data-rights are
inherited from the row.

### Two naming constraints, both binding

**C10 settled two names, and neither may be shortened to bare "blast radius":**
- **loop-level blast-radius proxy** — reasoning-level, computed at proposal time, no task details.
- **permission-layer blast-radius enrichment** — item 16's field, produced by item 14's three-step
  post-verdict analysis, on a separate permission-layer schema.

This shape specification is the **first**. Item 16's is a different quantity with a different method,
producer, and moment.

**⚠ A second conflation risk, not previously named — watch for it.** The proxy's **dikaiosyne
dimension** ("how many oikeiosis circles are affected") is **not** the same thing as the **dikaiosyne
floor** that fired three times in cycle 6 (`proximity_floors.dikaiosyne = reflexive`, the domain-level
proximity reading that floors the aggregate). Same virtue name, two mechanisms: one is an input to a
reach estimate, the other is a scoring floor in the live engine. Given C10 exists precisely because
this project has twice been bitten by two things sharing a name, **say which you mean wherever the word
appears** in the shape specification.

**C16 binds the design:** the indicator measures **reach across circles, not headcount** — *"consistent
with 'not by population count' by design, not by coincidence. The blast-radius design inherits this as
a constraint explicitly."* State it in the specification so the eventual build inherits it rather than
rediscovering it.

---

## 6. What is NOT this session

- **The migration.** Parked; founder-walked 0c-ii when it opens.
- **The completion signal's return path** — transport, schema, what the harness does with it. **The
  ATRF session's**, and pre-empting it defeats the B1 ruling you are implementing.
- **Q3-d** (eighth heuristic vs reshaped existing vs pre-generation step) — deliberately unruled, open
  for the ATRF session. If you touch it, note that an eighth heuristic is a **schema** change: the
  closed seven-value union is mirrored by a CHECK constraint on `idea_loop_candidates.heuristic`.
- **The C15 carried item** (the three-enumeration circle discrepancy: `manifest.md` R0 has four;
  `stoic-brain.ts:445` has five; the trust core's `OikeiosisCircle` five in another vocabulary). It is
  named, unscoped, blocking nothing. **Do not resolve it here** — but if the shape's circle handling
  brushes against it, say which enumeration you mean.

---

## 7. Verification before you close

1. `git diff --stat` — only the three permitted paths; **one file** touched in
   `operations/agent-circles-2026-08/`.
2. The amendment states a requirement and nothing else — apply the watching-table test to every
   sentence.
3. §2.9 and the new amendment do not contradict each other on GS-ATRF-3's status.
4. Every mentor quotation traced to a verbatim record, not to an annotation quoting one.
5. The four-virtue answer transcribed from the 08-09 record, not paraphrased.
6. `high | medium | low` and the two-record requirement traced to `manifest.md`, not to this family's
   restatement of it.
7. Neither settled name appears shortened to bare "blast radius"; every use of "dikaiosyne" says which
   mechanism it means.
8. Nothing written into `/Users/clintonaitkenhead/Claude-work/PROJECTS/idea-loop-validation-run/`.

**PR19:** independent adversarial review before this lands. Documents, so scale accordingly — a focused
review on (a) whether the amendment states only a requirement, (b) fidelity to the 08-09 ruled answers,
and (c) claims-vs-source on the manifest and migration facts is proportionate. **Note the standing
lesson that applies directly here** (memory `primary-data-beats-secondary-characterisation`): the
highest-risk claims in this session are counts and ordinals — *four* virtues, *three* columns, *two*
records, *three* values. Re-derive each from its primary source before writing it, not from this prompt.

---

## 8. Close with

- A decision-log entry following the house shape.
- `00-PRIORITY-INDEX.md` updated: S8's concurrent half **done**; what remains parked (the migration, on
  a founder-walked 0c-ii; GS-ATRF-3's return path, on the ATRF session).
- A note of anything the founder must carry — most likely nothing; this session ends in documents.

---

## 9. What follows

**S1 → S2 → S3** (the framing trilogy) — unblocked, `inbox/eleven traits research.rtf` is committed.
**Cite traits by name, never by number** — the source is unnumbered and the synthesis's positional
reference is off by two. **S5** — unblocked, wording approved; transcribe verbatim from
`2026-08-11-mentor-ruling-scope-confirmation-verbatim.md` §B6, one authoritative copy, no re-typing.
**S7** — the build; unblocked, and now an R20a perimeter change, so it deserves its own session.

Nothing here bears on the 0h call.
