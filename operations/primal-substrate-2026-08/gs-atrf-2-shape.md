# GS-ATRF-2 — shape specification (loop-level blast-radius proxy)

**Purpose:** specify the shape. **Do not build it.** The mentor's 2026-08-11 synthesis authorised
specifying the GS-ATRF-2 shape now, ahead of the ATRF scoping session, because it can be fully derived
from ground already ruled — the four-dimension GS-ATRF-1 answer (`gs-atrf-corrections.md` §(a)), the
manifest's fixed vocabulary and two-record requirement (`gs-atrf-corrections.md` §(b)), and the
verified watching-table column list (`gs-atrf-corrections.md` §(c)). It did not authorise building it.
The migration below is **parked** — a founder-walked 0c-ii Critical step when it opens, not before.
There is no reason to alter a live table mid-validation-run for a field nothing yet produces.

**Status:** documents only. Confirmed by the 2026-08-11 ruling (Part C, items C10, C11, C16; Part A,
items A2, A3). See `S8-gs-atrf-corrections-and-ruling-request-scope.md` §3.2 for the scoped proposal
this specification finalises, and `gs-atrf-corrections.md` for the corrected readings it is built on.

---

## Two names, settled, both binding on this document and every document after it

The 2026-08-11 ruling (Part C, item C10) settles two names that must never be shortened to bare "blast
radius" in any future scope or build document:

> **C10. Yes.** Named distinctly now. The loop's blast-radius indicator is the reasoning-level proxy
> computed at proposal time without task details. Item 16's `blast_radius` is the expensive enrichment
> produced by item 14's three-step post-verdict analysis on a separate permission-layer schema. Same
> vocabulary, different method, producer, and moment. The project has been bitten twice this window by
> two things sharing a name. They are named distinctly from this point: **loop-level blast-radius
> proxy** and **permission-layer blast-radius enrichment**.

| | **Loop-level blast-radius proxy** (this document) | **Permission-layer blast-radius enrichment** (item 16, ruled 2026-08-07) |
| --- | --- | --- |
| Producer | the loop, from the candidate's circle + virtue domains | item 14's three-step post-verdict analysis (structured elicitation + independent LLM search + value-stake extraction) |
| Moment | proposal time, no task details | post-verdict overlay — after the Layer-2 verdict is signed, never before, never feeds back into it |
| Method | cheap reasoning-level proxy, four virtue dimensions | expensive, deliberate enrichment |
| Home | the proposal shape (`GeneratedCandidate`) and the watching candidate row | a separate permission-layer schema |

**These are not the same quantity.** They share a name-root and a three-value vocabulary, and nothing
else. This specification is the **first** of the two. Item 16's is a different quantity with a
different method, producer, and moment, and belongs to its own workstream. Everywhere the word
"blast radius" or "dikaiosyne" appears below, this document says which mechanism it means — the second
naming risk (below) is exactly why.

### A second conflation risk, not previously named — the proxy's dikaiosyne dimension is not the dikaiosyne floor

The loop-level blast-radius proxy's **dikaiosyne dimension** — "how many oikeiosis circles are
affected" — is **not** the same thing as the **dikaiosyne floor** that fired three times in the
bounded validation run's cycle 6 (`proximity_floors.dikaiosyne = reflexive`, the domain-level proximity
reading that floors the aggregate score under ADR-010 §4). Same virtue name, two distinct mechanisms in
two distinct systems:

> **Endpoint attribution corrected 2026-08-11 (post-close).** This sentence originally attributed cycle
> 6's three floors to *"the live `/api/reason` domain-level proximity reading."* **They fired at the
> guardrail step**, not the reason step: the three rejected candidates were rejected at Step 2 filtering
> (`RUN-LOG.md`, cycle 6 §"Step 2 — Guardrail filtering … first genuine `rejected_by_guardrail` verdicts
> in this run"), and a `rejected_by_guardrail` candidate never reaches `/api/reason` at all — which is
> the very fact the Q4-e ruling turns on. The **mechanism** is correctly identified below and is
> genuinely shared: `computeProximity` (`layer2-mechanisms.ts`) runs natively on `/api/guardrail` since
> the §3-bridge retirement (2026-06-26), so ADR-010 §4 floors both surfaces. Only the instance's
> endpoint was wrong. Corrected rather than left, because this family's own standing lesson
> (`primary-data-beats-secondary-characterisation`) is that a claim reading correctly in isolation can
> still diverge from the record — and because Q4-e's whole force depends on knowing which endpoint saw
> the floored candidates.

- The proxy's dikaiosyne **dimension** is an **input to a reach estimate**, computed by the loop
  itself, before any candidate reaches `/api/guardrail` or `/api/reason`. It never scores anything; it
  estimates how far a proposal's effects reach.
- The dikaiosyne **floor** is a **scoring floor inside the live examination engine**
  (`computeProximity`, `layer2-mechanisms.ts`) — it is triggered by an unresolved or violated
  obligation found *during* examination of an action already taken (or about to be), and it lowers the
  examined proximity score.

C10 exists precisely because this project has already been bitten twice this window by two things
sharing a name and not a method (the C1c circle-5 naming collision; the "watching table carries
`targetCircle`" claim). This is a third instance of the same risk, caught before it was built rather
than after. **State which one is meant, every time, in every future document that uses either term.**

---

## The proposal shape (`GeneratedCandidate`, `idea-loop-types.ts`) — specification, not an edit

Two new optional fields, following the ruled discriminated-union / optional-field discipline the type
already uses (`targetCircle` is likewise optional and absent-for-friction by construction, per
`idea-loop-types.ts:104`):

- **`blastRadius?: 'high' | 'medium' | 'low'`** — the loop's indicator. Vocabulary fixed by the
  manifest (`gs-atrf-corrections.md` §(b)), not chosen by this specification or by any build session.
- **`blastRadiusBasis`** — the **explicit proxy disclosure** the synthesis requires and C11 rules
  persisted (below). **Recommended shape:** a structured record of the four ruled dimensions actually
  used to derive the reading — circles affected (dikaiosyne dimension, from `targetCircle` + the
  affected circle count), reversibility (andreia dimension, applied to reversion difficulty),
  preferred indifferents at stake (phronesis dimension), and impulse proportionality (sophrosyne
  dimension) — each paired with what it was derived from. Plus the standing disclosure that the whole
  indicator is a proxy assessed without task details, carried on every reading regardless of which
  dimensions drove it.

  **Why not a bare boolean.** A bare `isProxy: true` satisfies the letter of "explicit proxy
  disclosure" and loses exactly the traceability the mentor's own §4 build-success criterion in the S8
  scope document asks for — a `high` reading should be legible after the fact as *which* dimensions
  drove it, not merely flagged as approximate. C11 makes this a persistence requirement, not a
  read-time convenience (below).

- **Absent, not defaulted, when it cannot be computed.** This is the house evidence-floor discipline
  (the same discipline behind `fresh`'s `insufficient_history` basis), applied here explicitly. A
  `friction_detection` candidate carries **no `targetCircle`** by construction (`idea-loop-types.ts:104`
  — *"ABSENT for a friction_detection candidate"*), so its dikaiosyne dimension has no input to derive
  from. Manufacturing an indicator for such a candidate anyway — defaulting to `low`, or to any value —
  would be exactly the "confident verdict from absence of evidence" pattern the `fresh` endpoint's
  `insufficient_history` basis exists to prevent. When a friction candidate cannot support a
  dikaiosyne-dimension reading, `blastRadius` and `blastRadiusBasis` are both **absent** on that
  candidate, not present-and-wrong.

  **This is a real and immediate interaction with S6 (the friction-as-primary-hypothesis document),
  named here rather than left implicit:** if friction detection ever became the loop's primary
  generation channel (the hypothesis S6 tests and, per its B5 null-result freeze, does not currently
  expect to confirm), the primary channel would be the one channel structurally unable to carry a
  blast-radius indicator. That consequence is not resolved by this specification — it is disclosed so
  a future reader of S6's outcome does not have to re-derive it.

---

## The watching candidate row (`idea_loop_candidates`) — one migration, three columns, parked

Per the corrected reading (`gs-atrf-corrections.md` §(c) and the A3 confirmation), realising the ruled
GS-ATRF-1 answer on the persisted candidate row needs three additive, nullable columns, built as **one**
migration when it opens — not three separate steps, and not before it opens:

| Column | Type | Why |
| --- | --- | --- |
| `blast_radius` | `TEXT CHECK (blast_radius IN ('high','medium','low'))`, nullable | the loop's own indicator, at proposal time. Vocabulary from the manifest, not chosen here. |
| `agent_blast_radius` | `TEXT CHECK (agent_blast_radius IN ('high','medium','low'))`, nullable | the manifest's *"the agent's own assessment of blast radius … recorded alongside the loop's indicator for longitudinal comparison"* — the second of the two required records (`gs-atrf-corrections.md` §(b)). Populated after election and execution, by a different actor at a different moment than `blast_radius` — the same actor/moment distinction the GS-ATRF-3 B1 ruling rests on, and the reason a single-field shape was never adequate. |
| `target_circle` | nullable smallint (or a ruled cycle-level resolution from the gap — the alternative the original candidate-row design already named), non-defaulted | closes the verified gap (`gs-atrf-corrections.md` §(c)). Without it, the dikaiosyne dimension of a persisted `blast_radius` reading is not recomputable from the row after the fact — an auditable `high` (C11, below) needs its inputs recoverable, and this is the one the row currently lacks entirely. |

**A fourth, basis-carrying column is not required by C11 to make this table sufficient — see
"Persistence" below for why.** Whether the watching row *also* stores a copy of `blastRadiusBasis`
(structured, mirroring the proposal-shape field above) is a smaller, additional durability question —
SageReasoning's own database holding a copy versus the runner's own state being the sole durable copy —
left open to the build session that opens the migration, not settled by this specification or by C11
itself.

**All additive, all nullable, no default value on any of the three.** Retention and data-rights are
inherited from the row — the table's existing `retain_until` and sweep cover new columns with no extra
work, per the same posture every prior additive migration on this table has taken.

**Founder-walked 0c-ii Critical step when built. Not before.** There is no live consumer of these
columns today, and no reason to touch a live, in-validation-run table for fields nothing yet produces.

---

## Persistence: the disclosure is stored, not computed at read time

The 2026-08-11 ruling (Part C, item C11):

> **C11. Yes.** Persisted. A `high` should remain auditable after the derivation changes. Consistent
> with the traceability criterion this synthesis asks for.

Concretely: `blastRadiusBasis` (the four-dimension record) is written at the point the indicator is
first computed — proposal time for the loop's own reading — and stored on the `GeneratedCandidate`
itself, not re-derived on read. If the derivation logic changes later (e.g. a refinement to how
"affected circles" is counted), a `high` recorded before the change remains auditable as *what drove it
at the time*, rather than silently reinterpreted under the new logic. This is the same discipline
`traceability-criterion.md` (S4) asks of the run's own cross-endpoint comparison — a reading's basis
must be recoverable independent of whatever computes readings later.

**Where the persisted copy lives, and why the watching-row migration above needs only three columns to
satisfy C11.** The generation-step scope document's own architecture ruling (§1.7) already establishes
that the runner holds its `GeneratedCandidate` history — the full objects, `blastRadiusBasis` included —
**as its own external cycle state**, outside SageReasoning's database, by construction. That runner-held
history is where C11's "should remain auditable after the derivation changes" is satisfied by default,
because the basis is computed once, at proposal time, and never recomputed by the runner on a later
read of its own history. **SageReasoning's own watching-row copy is a narrower, additional question**:
whether the three-column migration above should be widened to a fourth column carrying a copy of the
basis in SageReasoning's own database, so a `high` remains auditable from the *server's* record even if
the runner's own state is later lost or rotated. C11 rules that the disclosure is persisted, not
computed at read time — it does not rule where the durable copy must live, and the two are not the same
question. The build session that opens the migration decides the second; this specification does not.

---

## The reach-not-headcount constraint (C16), inherited explicitly

The 2026-08-11 ruling (Part C, item C16):

> **C16. Yes.** State the connection. GS-ATRF-1's indicator measures reach across circles, not
> headcount — consistent with "not by population count" by design, not by coincidence. The blast-radius
> design inherits this as a constraint explicitly.

**Stated here so the eventual build inherits it rather than rediscovering it:** the loop-level
blast-radius proxy's dikaiosyne dimension counts **which oikeiosis circles are engaged** (circle 1
through circle 5, per the existing circle vocabulary — subject to the unresolved C15 enumeration
discrepancy named in `gs-atrf-corrections.md`, not resolved here), not **how many individuals** fall
within an engaged circle. A proposal that affects the whole of circle 5 (all rational beings) reads
high because it reaches the cosmopolitan circle, not because it affects a large number of beings; a
proposal affecting one person in circle 2 (household) reads lower because it stays within a near
circle, not because the count is small. This is the same design principle that governs the moral
community's own ordering (B6, S5 — *"not by species membership, not by population count"*) — it is not
a coincidence that both land on the same rule, and this document states the connection rather than
leaving it to be independently rediscovered when the proxy is finally built.

---

## What this specification does not do

It does not edit `idea-loop-types.ts`. It does not write or apply a migration. It does not choose
between a `target_circle` column and a cycle-level circle resolution — both remain live options for
the build session that opens the migration, named as alternatives, not decided. It does not specify
`blastRadiusBasis`'s exact JSON shape at the byte level — only that it is structured, persisted, names
which of the four dimensions drove the reading, and carries the standing proxy disclosure. It does not
resolve C15 (the three-enumeration circle discrepancy) or Q3-d (the eighth-heuristic-vs-reshaped-
existing question) — both are named, unscoped, and out of this document's remit.

**Rollback:** `git revert` the records commit. Documents only; nothing deploys; no migration to reverse
because none was applied.
