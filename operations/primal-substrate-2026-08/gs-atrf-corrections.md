# GS-ATRF-1/2/3 — corrections carried, for the ATRF scoping session

**Purpose, and nothing more:** the 2026-08-11 mentor synthesis (`2026-08-11-mentor-synthesis-primal-substrate-verbatim.md`)
restated GS-ATRF-1 and GS-ATRF-2 in forms that are each narrower than, or false against, what was
already ruled or already built. This note exists so the **post-validation-run ATRF scoping session
inherits the corrected version of GS-ATRF-1/2, not the synthesis's** — each correction below is quoted
from its source, not summarised from a summary.

**Status:** documents only. Nothing here licenses a build, a schema, a flag, or a credential step.
Ruled and confirmed 2026-08-11 (`2026-08-11-mentor-ruling-scope-confirmation-verbatim.md`, Part A,
items A2 and A3). See `S8-gs-atrf-corrections-and-ruling-request-scope.md` §2.1–§2.3 for the full
mechanism trail this note condenses, and `gs-atrf-2-shape.md` for the shape specification these
corrections feed.

---

## (a) GS-ATRF-1 was already ruled, and the ruled answer is larger than the synthesis's

GS-ATRF-1 (the blast-radius indicator) is not an open question. It was ruled 2026-08-09, verbatim, in
`operations/agent-circles-2026-08/2026-08-09-mentor-review-six-stoic-items-and-gs-atrf-answers-verbatim.md`:

> **GS-ATRF-1 — Blast radius indicator:** The four-virtue framework gives the most honest answer. Blast
> radius at the reasoning level is a function of: how many oikeiosis circles are affected (dikaiosyne —
> what is owed to whom), how irreversible the action is (andreia — what is genuinely fearful and what is
> not, applied to reversion difficulty), how many preferred indifferents are at stake (phronesis — what
> is genuinely good, bad, and indifferent), and how much the action exceeds what reason warrants
> (sophrosyne — impulse proportionality). These four dimensions, assessed from the candidate's virtue
> domain and targetCircle, constitute an honest proxy for blast radius without accessing task details.
> High blast radius: affects circles 3–5, low reversibility, multiple high-axia preferred indifferents
> at stake, virtue domains spanning justice and courage. Low blast radius: affects circle 1–2, high
> reversibility, low-axia preferred indifferents, single virtue domain. This is a proxy, disclosed as
> such — but it is a philosophically grounded proxy, not an arbitrary one.

The 2026-08-11 synthesis restated this as *"a proxy for the oikeiosis circle most affected by the
proposal."* That is **the first of the four ruled dimensions** (dikaiosyne — circles affected), not a
restatement of the whole. Adopting the synthesis's phrase as written would narrow a ruled
four-dimensional answer to one dimension, and would drop the unity-thesis grounding that made it *"the
most honest answer"* in the first place — the four dimensions are not four alternative candidates for
the indicator, they are its four constituent readings, each a different cardinal virtue applied to the
same proposal.

**Confirmed, not merely argued.** The 2026-08-11 ruling (Part A, item A2):

> **A2. Confirmed.** The four-virtue proxy ruling from 2026-08-09 stands and is the larger answer. The
> synthesis's oikeiosis-circle-only framing was a narrowing, not an extension. The high/medium/low
> vocabulary and the two-record requirement — loop indicator and agent's own assessment — are already
> fixed in `manifest.md`. S8 inherits the four-dimension answer.

**What the ATRF scoping session inherits:** the four-dimension GS-ATRF-1 answer, unabridged — circles
affected, reversibility, preferred indifferents at stake, impulse proportionality — not a
circle-only proxy.

---

## (b) The vocabulary and the record count are already fixed in `manifest.md`, not open

`manifest.md`, ATRF section, **Blast radius indicator** paragraph, adopted verbatim from mentor
instruction 2026-08-09:

> When the IDEA loop proposes an action, the proposal carries a rough blast-radius indicator — high,
> medium, or low — assessed by the loop at the reasoning level, not the task level. The harness uses
> this indicator to determine whether a pre-task reasoning assessment is warranted. The agent's own
> assessment of blast radius is itself a reasoning signal and is recorded alongside the loop's
> indicator for longitudinal comparison.

Two consequences the synthesis's *"an additional field"* language does not carry, and that a build
session must not treat as open design choices:

1. **The vocabulary is fixed at three values** — `high | medium | low`. A build inherits this enum; it
   does not choose one. A CHECK constraint should encode exactly these three values and no others.
2. **Two records are required, not one.** The loop's own indicator, *and* the agent's own assessment,
   *"recorded alongside … for longitudinal comparison."* **The comparison is the signal itself** — a
   divergence between what the loop assessed at proposal time and what the agent assessed after the
   fact is precisely the kind of reasoning-quality evidence the ATRF exists to carry. A single-field
   shape cannot represent a comparison; it can only represent one of the two things being compared.

**The actor/moment boundary this creates, which bears directly on GS-ATRF-3 (§2.4 of the S8 scope
document):** the loop's indicator is produced at proposal time by the runner; the agent's own
assessment can only arrive after the proposal reaches the agent and is elected. The two fields
therefore have different authors and different moments — the same distinction the GS-ATRF-3 B1 ruling's
actor/moment reasoning rests on.

---

## (c) The watching table has no `target_circle` column

The synthesis's *"the watching table's candidate rows carry `targetCircle` … already"* is false, and
was already found false once, on 2026-08-09. **Re-verified independently a second time, 2026-08-11**,
column-by-column against `website/supabase-idea-loop-watching-migration.sql` §2. The complete
`idea_loop_candidates` column list, as migrated to TEST and production:

`id`, `cycle_id`, `gap_ref`, `heuristic`, `proposed_action`, `classification_kind`,
`classified_domains`, `generation_confidence`, `guardrail_proximity`, `guardrail_domains`,
`guardrail_session_id`, `passed_novelty_check`, `novelty_confidence`, `novelty_basis`, `cycle_outcome`,
`unavailable_dependency`, `created_at`.

**There is no `target_circle` column.** `initialClassification` *is* persisted — as two columns,
`classification_kind` + `classified_domains` — but `targetCircle` is not persisted anywhere on the
candidate row, even though it exists on the `GeneratedCandidate` type (`idea-loop-types.ts:104`).

Confirmed 2026-08-11 (Part A, item A3):

> **A3. Confirmed.** The watching table has no `target_circle` column. The synthesis's claim was false
> and was already caught on 2026-08-09. Three additive columns are needed: loop indicator, agent
> assessment, and circle. S8 carries this correctly.

**Consequence for the eventual migration:** realising the ruled GS-ATRF-1 answer on the watching table
needs, at minimum, **three** additive columns, not the synthesis's *"one additional nullable field"* —
the loop's own indicator, the agent's own assessment, and a way to recover the target circle (whether a
`target_circle` column on the candidate row or a ruled cycle-level resolution from the gap — see
`gs-atrf-2-shape.md` §Watching candidate row). Without the third, the dikaiosyne dimension of the
four-virtue proxy is not recomputable from a stored row after the fact, and an auditable `high` (§(b)
above, and C11 below) would not, in practice, be auditable.

This is not new work invented by this note — it is the same gap already named on the standing queue
("the `target_circle`/blast-radius persistence gap") and now traced to its source a second time,
independently, so the ATRF scoping session does not have to re-discover it a third time.

---

## (c-bis) The friction channel has no GS-ATRF-1 basis AT ALL — and no disclosure branch

**Added 2026-08-12** (`D-SUFFICIENCY-EXAMINATION-TRIGGER-ROUTED-2026-08-12`; record:
`operations/agent-circles-2026-08/2026-08-12-mentor-consultation-sufficiency-examination-trigger-verbatim.md`).
**Ruled to be raised independently, verbatim:** *"raise the GS-ATRF-1 basis-lessness gap now,
independently ... This is not contingent on the sufficiency finding. It exists now, it affects the
generation-step scope, and it should be raised in the next session that touches GS-ATRF-1."*

**This is distinct from §(c) above and strictly sharper.** §(c) says the dikaiosyne dimension is not
*recomputable from a persisted row*. This says that for one entire generation channel it is not
*derivable at all* — not from the row, not from the type, not from anything.

**The two facts, verified at source 2026-08-12:**

1. **GS-ATRF-1's ruled answer names its inputs precisely.** The four dimensions are *"assessed from
   the candidate's virtue domain and targetCircle"* (§(a) above, verbatim).
2. **A `friction_detection` candidate has neither input, by construction — not by omission.**
   `GeneratedCandidate.targetCircle` is optional and documented *"ABSENT for a friction_detection
   candidate"*; `initialClassification` is a discriminated union whose friction branch is
   `{ kind: 'preferred_indifferent' }` — the union existing *"so a friction candidate cannot be
   forced into the virtue-domain shape"* (`idea-loop-types.ts:90`ff).

**The parallel that makes this checkable rather than merely arguable.** `assessStructuralNovelty`
(`idea-loop-types.ts:222`) computes over **exactly the same two fields** — and handles their joint
absence honestly:

```ts
if (wantCircle === undefined && wantDomains === null) {
  return { novel: true, confidence: 0 }
}
```

with the committed docstring stating the reason: *"A candidate with NEITHER structural axis (a
friction_detection candidate: no targetCircle, preferred_indifferent classification) cannot be
structurally assessed at all — the check returns `{ novel: true, confidence: 0 }`: nothing in the
window can match it, and the zero confidence says the check has no basis, rather than manufacturing
one."*

**The gap: GS-ATRF-1 inherits the identical basis-lessness, for the identical candidate class, from
the identical two missing inputs — and unlike the novelty check, the ruled answer specifies no
zero-confidence disclosure branch.** The vocabulary is fixed at `high | medium | low` (§(b) above);
none of those three values can express *"this indicator has no basis."* A friction candidate assigned
any of them would be manufacturing exactly what the novelty check was written to refuse.

**Why the record did not already carry this.** `friction-primary-hypothesis.md` §2 names the
basis-less consequence for the **novelty check**, but does so in service of the *reordering*
question ("if friction becomes the primary generator, the novelty check becomes basis-less for the
primary channel by construction"). It was not connected to GS-ATRF-1's own basis. The two documents
each hold half of this finding; neither states it.

**What this does NOT do.** It does not propose a disclosure branch, name a fourth enum value, or
touch the ruled `high|medium|low` vocabulary — the vocabulary is fixed in `manifest.md` and is not
this note's to amend. It raises the gap, which is what was ruled. **The next session that touches
GS-ATRF-1 owns it**, and should treat the novelty check's zero-confidence posture as the available
precedent, not as a pre-authorised answer.

**A bound worth carrying with it, from the same ruling:** blast radius is a property of the *proposed
action*, not of *how the proposal was generated*. Generation channel is legitimately **evidence
about** blast radius; it must never become part of its **definition**, or the indicator becomes
gameable by choice of channel. The infrastructure to test whether channel improves the estimate
already exists in the ruled shape — `manifest.md` requires **two** records (the loop's indicator and
the agent's own assessment, *"recorded alongside for longitudinal comparison"*), so channel belongs
as a recorded covariate of that comparison, not as a fifth dimension.

---

## (d) CARRY-FORWARD for the ATRF scoping session — the completion signal and the justice assessment

**Added 2026-08-11, after the S8 session closed, on mentor direction. Not a correction of the
synthesis, and not a re-opening of B1 — a carry-forward the ATRF session must inherit explicitly.**

**Provenance and why it arrives late.** The B1 ruling — the generation-step document states the
completion-signal requirement, the ATRF session scopes the return path — was made on the argument that
*"the signal is the primary post-execution evidence of whether genuine examination occurred rather than
simulation."* That argument stands. But **two things were not before the mentor when B1 was ruled**:
the second conflation risk the S8 session named (`gs-atrf-2-shape.md` §"A second conflation risk"), and
the cycle-6 finding it rests on — three candidates floored by dikaiosyne, all proposals adding a
reliability claim to the assessment-bearing surface. The mentor's own framing: *"This is not a reversal
of B1. It is a carry-forward."*

**The open question, stated for the ATRF session to inherit:**

> If the completion signal must carry examination evidence rather than a binary flag, it will need to
> carry **something about the justice assessment**. What that something is — **and whether it can be
> honestly stated by an agent whose own justice assessment may be subject to the same floor dynamics** —
> is open.

**Why this is not merely theoretical.** The cycle-6 pattern is the live instance: the dikaiosyne floor
fired on exactly the class of proposal that makes a claim about the reliability of the system's own
assessments. A completion signal is, structurally, an agent making a claim about the quality of its own
examination. **That is the same shape as the floored class.** So the question is not whether an agent
*would be* subject to the dynamic — it is whether the signal can be designed so that an honest report
is expressible at all, rather than one whose honest form is indistinguishable from the overclaiming
form the justice domain is (on reading (a)) correctly refusing.

**What the ATRF session must NOT assume from this note:**
- **Not** that reading (a) is settled. The dikaiosyne floor pattern is carried as a **named, undiagnosed
  finding with both readings stated** (`traceability-criterion.md`; S4 §2.6). The discriminating evidence
  is not yet in, and per the Q4-e ruling the cross-endpoint check **cannot reach the floored class at
  all** — the floored class is assessed by guardrail-internal coherence, a weaker criterion, and reported
  as a separate evidence stream.
- **Not** that this constrains the return path's design. It names a question the design must answer, not
  an answer it must adopt. The B1 boundary holds: *what must be carried, not how it is built.*
- **Not** that the two dikaiosyne mechanisms are one. See `gs-atrf-2-shape.md` §"A second conflation
  risk" — the proxy's dikaiosyne *dimension* (an input to a reach estimate, computed by the loop before
  any examination) and the dikaiosyne *floor* (a scoring floor inside the live engine) remain distinct,
  and this carry-forward concerns **the floor**.

**A note on scope, which is why this section exists at all.** The S8 session named the boundary of its
own examination honestly — that it treated *"the mentor ruled"* as the edge of its scope and did not
interrogate B1 itself. That was the correct scope for a transcribing session, and the verbatim-wins
discipline requires it. **But the correct scope for a session and the correct scope for the founder
receiving its output are different moments with different actors.** This section is what that
distinction produced: a question raised at the founder's level, recorded at the session's level, for a
third session to inherit.

## (e) CARRY-FORWARD for the session that owns GS-ATRF-1 — a candidate mechanism for the §(c-bis) gap, and a gap in the mechanism itself

**Added 2026-08-19** (`D-RL-PASSAGE-ADDENDUM-RECORDED-2026-08-19`; record:
`operations/agent-circles-2026-08/2026-08-18-addendum-reinforcement-learning-assessment-verbatim.md`).
**Not a correction, not a ruling, and not an answer to §(c-bis)** — a carry-forward the owning session
should meet at the point of use, following §(d)'s pattern.

**What arrived.** A 2026-08-18 addendum, reasoning from confidence decay over long reasoning traces,
states: *"A reasoning system that cannot honestly assess its own confidence decay over a long trace
cannot honestly assess blast radius. The epistemic status framework assessed earlier today —
specifically the rule that confidence of an explanation must never exceed its evidential basis — is
the governance mechanism that addresses this. When GS-ATRF-1 is scoped, the epistemic status framework
should be carried in as a candidate mechanism for honest blast-radius assessment, not just virtue
domain and oikeiosis circle proxies."*

**Why it belongs beside §(c-bis) specifically.** §(c-bis) establishes that the *loop-level
blast-radius proxy* has no basis at all for a `friction_detection` candidate, that the ruled
`high | medium | low` vocabulary cannot express *"this indicator has no basis"*, and that
`assessStructuralNovelty`'s `{ novel: true, confidence: 0 }` — *"the zero confidence says the check
has no basis, rather than manufacturing one"* — is the available precedent. **The addendum's rule is
that same principle, reached independently from a different direction.** §(c-bis) named the gap and
deliberately proposed no mechanism; this is the first candidate mechanism to arrive for it.

**⚠ THE MECHANISM WAS NOT IN THIS REPOSITORY — relayed and RESOLVED 2026-08-19.** At the time this
section was first written, a repo-wide search for `epistemic status` returned zero hits; the framework
existed only inside the 2026-08-18 exploratory session, which has no standalone record here. **The
founder has since relayed the mentor's own description of it, verbatim:**

> "The epistemic status framework — treating every consequential proposition flowing through the
> reasoning harness as carrying an epistemic status (observation, inference, assumption, unknown) —
> was assessed, connected to GS-ATRF-1, and noted as worth carrying as a named open question alongside
> GS-ATRF-1 through 3. It was not formally added to the ATRF open questions list. That addition needs
> a ruling before the generation-step build sequence closes. It is not blocking the current sequence
> but it should not be left as an informal note."

**This both confirms and sharpens the earlier read.** The mentor confirms the connection to GS-ATRF-1
this section made independently. It also sharpens the shape: the framework is not a single confidence
bound folded into GS-ATRF-1 as a candidate mechanism — it is a **four-category classification**
(observation / inference / assumption / unknown) applied to *every consequential proposition* the
harness carries, and the mentor's own framing is that it is *"worth carrying as a named open
question alongside GS-ATRF-1 through 3"* — i.e. a candidate **fourth** named open question, not merely
an input to the first three.

**✅ RULED 2026-08-19 — GS-ATRF-4 formally added, standalone, §(c-bis) carried forward not resolved.**
A ruling request was put to the mentor the same day
(`operations/agent-circles-2026-08/2026-08-19-mentor-question-epistemic-status-fourth-question-FOR-RULING.md`)
and answered in full
(`operations/agent-circles-2026-08/2026-08-19-mentor-ruling-gsatrf4-epistemic-status-verbatim.md` —
verbatim wins). Three findings, none of which this note anticipated correctly in every particular:

1. **The framework IS formally added, as GS-ATRF-4, standalone — not folded into GS-ATRF-1.** The
   mentor's own reasoning: *"folding GS-ATRF-4 into GS-ATRF-1 would mean amending a ruled answer, and
   ruled answers are not amended by the addition of new open questions. They are amended by a ruling
   that specifically re-opens and revises them."* §(c-bis) is a **named carry-forward to the
   generation-step scoping session**, examined there alongside GS-ATRF-1 through 4 — **not resolved by
   this ruling**. The ruled GS-ATRF-4 entry carries its own cross-reference back to §(c-bis) for that
   purpose.
2. **APPLIED same session:** `website/src/data/project-context.json` v1.3.0 → v1.4.0 (the ruled
   question text verbatim, appended after GS-ATRF-3's paragraph; "three questions" → "four questions";
   `tsc`-clean, JSON-parse-verified) and `website/supabase-project-context-2026-08-19-gsatrf4-update.sql`
   authored for the founder's walk (same idiom as the 2026-08-09 precedent; **not yet run — a
   founder-walked live step, the AI performs no Supabase op**).
3. **The `high | medium | low` vocabulary is UNCHANGED and stays deferred** to the generation-step
   scoping session, per the mentor's Q(c) — but a **named direction, not a ruling**, is now on record
   for that session to carry in: the `assessStructuralNovelty` null-plus-flag model (*"not
   assessable"*) is the stronger candidate over a fourth vocabulary value (*"assessed and found to be
   in that state"*) — the two are different epistemic claims, and the vocabulary should reflect the
   difference. **This is explicitly not a ruling on the vocabulary itself.**

**§(c-bis)'s standing instruction is therefore still not fully discharged, but its routing is now
settled rather than open**: the next session that touches GS-ATRF-1 still owns the gap itself, but no
longer needs to decide whether a fix belongs there or in a new question — that has been ruled. Both
GS-ATRF-4's text and its cross-reference note are on the live surface (once the SQL is walked) for
that session to read directly, rather than through this note.

**Vocabulary note (unchanged by the ruling).** Per **C10** the mechanism at issue throughout this
section is the **loop-level blast-radius proxy** (reasoning-level, proposal time) and never the
*permission-layer blast-radius enrichment*.

---

## What this note does not do

It does not build the migration (parked — see `gs-atrf-2-shape.md` §Watching candidate row and
`S8-gs-atrf-corrections-and-ruling-request-scope.md` §4). It does not design the GS-ATRF-3 return path
(scoped in the ATRF session — see the B1 dated amendment in
`operations/agent-circles-2026-08/2026-08-09-generation-step-scope.md` §2.12). It does not resolve the
three-enumeration circle discrepancy named as C15 (`manifest.md` R0 has four circles; `stoic-brain.ts:445`
has five; the trust core's `OikeiosisCircle` has five in a different vocabulary) — that item is named,
unscoped, and blocking nothing; if a future build's circle handling brushes against it, that build must
say which enumeration it means, not resolve the discrepancy in passing.

**Rollback:** `git revert` the records commit. Documents only; nothing deploys.
