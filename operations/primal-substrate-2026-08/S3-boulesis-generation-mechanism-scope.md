# S3 — Scope: simulated primal tension as a legitimate agent mechanism (boulesis)

**Mentor heading 3.** **Execution order: 6 of 8 — last of the framing trilogy (S1 → S2 → S3).**
See `00-PRIORITY-INDEX.md`.

---

> **RULED 2026-08-11 — the two tensions this document raised are both resolved.** Verbatim record,
> which wins over every annotation below:
> `2026-08-11-mentor-ruling-scope-confirmation-verbatim.md`. **The verification claim is reformulated
> as evidence, not proof** (C5). **The generation step's signal sources are bounded to the runner's own
> state — explicitly NOT `getProjectContext`** (C6). The mechanism half remains **parked on the ATRF
> scoping session**. Rulings folded inline below as **RULED** annotations; proposal prose kept, marked
> ruled rather than deleted.

## §0 Status, tier, gate

**Status: SCOPE. The framing half is documents only. The mechanism half is explicitly PARKED by the
mentor. Nothing here licenses a build, a prompt change, or a generation-step edit.**

- **Tier (framing half):** `governance` / documents.
- **Tier (parked mechanism half, when it opens):** generation-step design → a build with its own
  gates.
- **Depends on:** **S2** (the tension argument this mechanism answers) and **S1** (the reframe both
  stand on).
- **Parked half waits on:** the **ATRF scoping session / generation-step refinements**,
  post-validation-run. The mentor's words — *"The mechanism design is a generation-step build item —
  park until after the first build gate"* — read forward to the current gate (that gate closed
  2026-08-10; §7.4).

---

## §1 What the mentor said

The question answered:

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

The mechanism:

> the generation-step should include a prompt that asks the agent to identify, **from its available
> signals, where the current system's capacity to support examined assent is most constrained. Not
> where it is broken, but where it is most limited relative to the ideal.** That constraint
> identification is the functional analogue of hunger. The proposal generated from it is the
> functional analogue of tool use.

And a claim about verification:

> An agent that is genuinely asking where the gap is between current state and the examined ideal
> **cannot be performing that examination as a compliance check — the question itself requires genuine
> assessment.** A compliance-check agent would produce a formulaic answer. A genuinely examining agent
> would produce a specific, contextually grounded answer.

---

## §2 Mechanism facts (PR20)

### §2.1 `boulesis` is already committed, sourced, and defined exactly as the mentor uses it

`website/src/lib/stoic-brain.ts:379-385`, within `EUPATHEIAI` (the three rational good feelings,
sourced to DL 7.116 / Stobaeus Ecl. 2.90):

```
id: 'boulesis'
name: 'Rational Wish'
replaces: 'epithumia (craving)'
definition: 'Rational desire directed at what is genuinely good — wanting virtue and
             the welfare of others from correct understanding.'
sub_species: ['eunoia / goodwill', 'eumeneia / benevolence',
              'agapesis / love', 'aspasmos / affection']
```

**The mechanism therefore lands on existing, sourced vocabulary rather than introducing one** — and
the `replaces: 'epithumia (craving)'` relation is precisely the mentor's move: the rational
counterpart of the acquisitive drive, not its suppression. The framing document should cite this
directly; it is the strongest available evidence that the proposal is a recovery of the framework
rather than an accommodation to it.

Worth noting for honesty: the committed `sub_species` of boulesis are all **other-directed**
(goodwill, benevolence, love, affection). The mentor's usage — rational wish directed at closing a
capability gap — is a legitimate extension of the genus (*rational desire for what is genuinely
good*), but it is not one of the four listed species. **State it as an application of the genus**, not
as though "closing the gap" were a catalogued species. This is the kind of small overclaim that a
later reader turns into a citation.

### §2.2 The mechanism inherits `/sage-compass`'s binding constraint

S2 §2.3 establishes that the gap-measurement mechanism already exists in shipped form for humans
(`/sage-compass`, live since 2026-07-15), and that its binding rule is stated in the live route:

> ***NOT A VERDICT (mentor #14, binding).*** … Nothing in this route computes, scores, ranks, grades,
> or classifies it.

**The agent-side mechanism must inherit this.** A generation-step question that produces a "constraint
reading" which then *scores*, *ranks*, or *gates* anything would violate the same constraint in a
different medium. The mechanism's output is a **generation input** — it produces a candidate — and
must not become an assessment.

The existing types already model this correctly and should be reused rather than extended:
`GeneratedCandidate.generationConfidence` (`idea-loop-types.ts`) is documented as *"a generation-time
relevance signal only — NOT a probability, NOT a prediction of the examination outcome; ORTHOGONAL to
guardrailResult/passedNoveltyCheck."* That is exactly the register a boulesis-derived constraint
reading belongs in.

### §2.3 ⚠ Tension one: Heading 3's verification claim contradicts Heading 4's

This is the most important thing in this document.

- **Heading 4 (S4)** states the locust problem: you *cannot* distinguish genuine examination from
  simulation by inspecting outputs. It proposes a criterion built on **traceability, proportionality,
  and cross-input consistency** precisely because output quality alone is insufficient, and it names
  cycle 3 as a case where a *"confident, well-formed"* output was substantively wrong.
- **Heading 3** claims that for *this particular question*, the problem dissolves: *"the question
  itself requires genuine assessment. A compliance-check agent would produce a formulaic answer."*

**These cannot both be unqualified.** If output specificity reliably distinguished genuine from
simulated examination, S4's criterion would be unnecessary. And the run supplies direct evidence
against the optimistic reading: cycle 5's `/api/reason` produced a **confident, well-formed, fully
articulate** empty extraction — complete with an explicit justification (*"no Stoic features are
extractable from the input as presented"*) — on text a sibling endpoint extracted richly. Articulacy
was not the tell; **cross-endpoint comparison was.**

**The honest formulation available:** a specific, contextually grounded constraint reading is
**evidence of** genuine assessment, and a formulaic one is evidence against — but neither is
**proof**, and the mechanism should be paired with S4's traceability check rather than treated as
self-verifying. That preserves the mentor's insight (the question is a good one, and it is harder to
fake than a yes/no) without asserting a verification property the project's own live evidence
contradicts.

**Raised as Q3-a.** It is a genuine tension between two headings of the same synthesis, not an error
in either.

### §2.4 ⚠ Tension two: "from its available signals" collides with a standing ruling

The mechanism asks the agent to assess *"where the current system's capacity to support examined
assent is most constrained."* Answering that requires **knowledge of the system** — its architecture,
its current limitations, its recent history.

There is a standing mentor ruling in the opposite direction, made 2026-08-11 in the cycle-3 postscript:

> `projectContext` should be **removed from API-key-authenticated `/api/reason` calls entirely** (not
> merely labelled) — **an agent's pure examination should rest on the proposal, the Stoic Brain, and
> the practitioner profile, not the project's internal decision log**; that situational awareness
> belongs to Layer 3's human-mentor work, not an agent's examination call.

**These are not strictly contradictory** — generation and examination are different calls at different
moments, and the ruling is explicitly about the **examination** call. A generation step may
legitimately use project knowledge that an examination call must not.

**But the distinction is easy to lose at build time**, because both run inside the same cycle, in the
same runner, against the same service. A build session wiring "available signals" into the generation
prompt could reasonably reach for the same context mechanism the ruling is removing from the
examination path — and would be reintroducing, on the generation side, the exact source of the cycle-3
contamination.

**What the framing document must therefore state:**

1. The generation step's signal sources are **named explicitly** and are **not** `getProjectContext`.
   The runner's legitimate signals are its own: the shared task list, its own cycle history, its own
   prior candidates and outcomes, and the responses it received.
2. The **examination** call's inputs are unchanged and remain governed by the ruling above.
3. The two must never be wired to a shared context helper.

**Raised as Q3-b.**

### §2.5 What "constrained relative to the ideal" can actually read from

Named so the parked mechanism design does not start from zero:

| Signal | Available today | Note |
| --- | --- | --- |
| The shared task list | Yes — ruled shared state, readable by every collaborating agent | Already heuristic 7's input; reads **technical** friction |
| The runner's own cycle history | Yes — `idea_loop_cycles` / `idea_loop_candidates` (via the founder dashboard; the runner has its own record) | Outcome distribution, null-cycle rate, which heuristics produce |
| The runner's own examination history | Yes — `agent_assessment_history`, credential-scoped (`R17a`, never a cross-credential read) | The same window `fresh` and the trajectory delta read |
| Its own trust record | Yes — `GET /api/trust-record/{agent_id}`, public | Decayed per-domain levels, coverage gaps named, the honest-claims envelope |
| The project's decision log | **Via `getProjectContext` only** | **Do not wire** (§2.4) |

**The fourth row is the interesting one.** The public trust record is *designed* to state what is
**not** attested and where coverage is **absent** — its envelope and its coverage-gap naming are
exactly a machine-readable statement of "where this agent's examined-assent record is most
constrained." An agent asked where its capacity for examined assent is most limited has, in its own
trust record, a purpose-built, honestly-bounded answer. **That is the most promising signal source and
it requires no new mechanism.** Named for the parked design; not proposed here.

---

## §3 The concurrent half — the deliverable

**One document:** `operations/primal-substrate-2026-08/framing-03-boulesis-mechanism.md`.

**Required content:**

1. **The answer to the founder's question**, in the mentor's words: yes, agents may simulate the
   tension — as the examined recognition of scarcity, which is a rational assessment of a gap, not a
   passion.
2. **The corpus grounding** (§2.1): `boulesis` at `stoic-brain.ts:380`, sourced, defined as rational
   desire for what is genuinely good, explicitly replacing `epithumia` — **with the honest note** that
   the mentor's usage extends the genus rather than instancing one of the four committed species.
3. **The inherited constraint** (§2.2): a constraint reading is a **generation input**, never an
   assessment; `/sage-compass`'s not-a-verdict rule crosses over; `generationConfidence` is the
   correct register.
4. **Both tensions, stated openly** (§2.3, §2.4) — with the verification claim reformulated as
   *evidence, not proof*, and the signal-source boundary stated as a rule the parked design must
   follow.
5. **What is NOT authorised**: no generation-step prompt exists yet to modify; no endpoint; no field.
   The mechanism is parked by the mentor's own instruction.
6. **The `project-context` prohibition** (S1 §2.5) — which here is doubly load-bearing, since this is
   the one framing document whose subject could plausibly motivate wiring project knowledge into a
   live prompt.

---

## §4 The parked half — the mechanism design

**Parked on: the ATRF scoping session / generation-step refinements, post-validation-run.**

Named for whoever opens it, so it is not re-derived:

- **The question's wording is the mechanism.** *"Not where it is broken, but where it is most limited
  relative to the ideal"* is a normative question, distinct from heuristic 7's technical-friction
  question (S2 §2.4). If the wording collapses into "what's broken", the mechanism becomes a duplicate
  of heuristic 7 and adds nothing.
- **Where it sits.** Whether this is an eighth heuristic, a reshaping of an existing one, or a
  pre-generation step that conditions all of them is **not decided** and should not be assumed. Note
  that `GenerationHeuristic` is a **closed seven-value union** (`idea-loop-types.ts:81-88`) and the
  watching table's `heuristic` column carries a **CHECK constraint listing exactly those seven values**
  (`supabase-idea-loop-watching-migration.sql` §2) — so an eighth heuristic is a **schema change**, a
  founder-walked 0c-ii step, not a code-only edit. (This is the same class as the `watching_write`
  CHECK widening the runner-scoping session had to perform.)
- **The friction-candidate shape problem applies.** A boulesis-derived candidate is normative, so it
  may legitimately carry virtue domains — unlike a friction candidate, which carries
  `{ kind: 'preferred_indifferent' }` and no `targetCircle` by construction. Which shape it takes
  determines whether `fresh`'s novelty check has a basis for it (S6 §2.1 documents the same issue from
  the other side).
- **Signal sources are constrained** by §2.4 and should be fixed in the design, not left to the build.

---

## §5 Open questions for the mentor

**Q3-a — How should Heading 3's verification claim be reconciled with Heading 4's locust problem?**
(§2.3.) Recommendation: reformulate as **evidence, not proof** — a specific, grounded answer is
evidence of genuine assessment; a formulaic one is evidence against; neither settles it, and the
mechanism is paired with S4's traceability check. Cycle 5 is the direct counter-evidence: a confident,
articulate, fully justified empty extraction that only a cross-endpoint comparison caught.

**Q3-b — What are the generation step's legitimate signal sources?** (§2.4.) Recommendation: the
runner's **own** state — task list, cycle history, credential-scoped examination history, and its own
public trust record — and explicitly **not** `getProjectContext`, whose removal from the examination
path is already ruled. Confirm the boundary before the mechanism is designed, not after.

**Q3-c — Is the agent's own trust record the intended signal for "where capacity for examined assent
is most constrained"?** (§2.5.) It is purpose-built to state coverage gaps and non-attestation
honestly. Recommendation: **yes, as the primary source** — it requires no new mechanism and its
honesty bounds are already ruled and public.

**Q3-d — Eighth heuristic, reshaped existing one, or pre-generation step?** (§4.) Not decided.
Recommendation: **do not decide it here** — but note that the eighth-heuristic option is a schema
change and should be costed as one.

---

### §5-RULED — the 2026-08-11 rulings

> **RULED (Q3-a / C5) — evidence, not proof.** *"A specific, contextually grounded answer is evidence
> of genuine assessment. A formulaic answer is evidence against. **The mechanism is paired with S4's
> check rather than treated as self-verifying.** Cycle 5's confident articulate empty extraction is the
> direct counter-evidence that makes this reformulation necessary."*
>
> The tension between Heading 3 and Heading 4 is therefore resolved **in Heading 4's favour on the
> verification question**, while Heading 3's insight — that the gap question is harder to fake than a
> yes/no — survives as *evidence*. The framing document states it this way, not the stronger way.

> **RULED (Q3-b + Q3-c / C6) — the runner's own state only.** *"shared task list, cycle history,
> credential-scoped examination history, and its own public trust record. **Explicitly not
> `getProjectContext`.** Generation and examination are different calls — the ruling that removes
> `projectContext` from API-key-authenticated `/api/reason` calls does not touch the generation call,
> but the generation call's signal sources are bounded as stated."*
>
> This confirms **both** questions at once: the boundary is ruled (Q3-b), and **the agent's own public
> trust record is inside the permitted set** (Q3-c) — the §2.5 observation that it is purpose-built to
> state coverage gaps and non-attestation honestly stands as the reason it belongs there. The ruling
> also makes the generation/examination distinction explicit rather than leaving it to be inferred at
> build time, which was the risk §2.4 named.

> **Q3-d — NOT RULED, and deliberately so.** The ruling does not decide between an eighth heuristic, a
> reshaped existing one, or a pre-generation step. It stays open for the **ATRF scoping session**, with
> §4's costing note carried: an eighth heuristic is a **schema change** (the closed seven-value union is
> mirrored by a CHECK constraint on `idea_loop_candidates.heuristic`), not a code-only edit.

### §5-Q3-e — Is sufficiency-examination distinct from this mechanism? OPEN, and a build-blocker until examined

**Added 2026-08-12** (`D-SUFFICIENCY-EXAMINATION-TRIGGER-ROUTED-2026-08-12`; full record:
`operations/agent-circles-2026-08/2026-08-12-mentor-consultation-sufficiency-examination-trigger-verbatim.md`).

**Ruled, verbatim — and note that the ruling's operative half is a prohibition, not a routing:**

> *"hold the boulesis/normative-gap distinction as an open question, not a settled one. Claude named
> the uncertainty honestly: sufficiency-examination may be second-order relative to normative-gap's
> first-order question, but the distinction is fine enough to collapse under scrutiny. **Do not build
> on that distinction until it has been examined.**"*

**The question.** A separate 2026-08-12 finding proposed a *sufficiency-examination* trigger — firing
at apparent completion, asking whether it is genuine exhaustion or a paused examination. Is that
genuinely a different mechanism from this document's normative-gap (boulesis) mechanism, or a
re-description of it?

**The distinction offered, and its stated fragility.** The reading put to the mentor was that they
differ in **order**, not merely in wording:

- **This mechanism (normative-gap / boulesis) asks about the OBJECT** — *"where the current system's
  capacity to support examined assent is most constrained ... not where it is broken, but where it is
  most limited relative to the ideal"* (§1, verbatim). First-order: a question about the world.
- **Sufficiency-examination asks reflexively about the EXAMINATION ITSELF** — *did I stop looking too
  early?* Second-order: a question about the enquiry, not its object.

**Both fire when nothing is broken**, which is what makes them easy to conflate and what distinguishes
both from friction detection (h7), where something *is* wrong. That shared property is exactly why the
distinction was named as fragile rather than asserted: it is fine enough to collapse under scrutiny,
and if it does, the sufficiency finding is a re-description of this parked mechanism rather than a new
one.

**What this blocks, concretely.** §5's Q3-d (eighth heuristic vs. reshaped existing one vs.
pre-generation step) **cannot be answered while this is open**, because the answer differs depending
on whether there are one or two mechanisms here. Committing to an eighth heuristic for normative-gap
and later discovering that sufficiency-examination is the same mechanism would leave the loop with a
duplicated channel and a schema change (the closed seven-value union's CHECK constraint) spent on it.
The costing note in §4 therefore now carries this dependency as well.

**Not answered here, and explicitly not defaulted.** The ATRF scoping session inherits this question
**before** it inherits Q3-d, not alongside it. Nothing in this document, the sufficiency record, or
the generation-step scope's new §2.13 may be read as having settled it — and per the ruling's own
words, **no build may rest on the distinction holding until it has been examined.**

---

## §6 Build-success criteria

For the framing document:

1. `boulesis` cited with `file:line` and its source (DL 7.116 / Stobaeus Ecl. 2.90), with the
   genus/species honesty note.
2. Both tensions (§2.3, §2.4) stated in the document body, not only in this scope.
3. The not-a-verdict constraint stated as binding on the agent-side mechanism.
4. The signal-source rule stated as a rule, with `getProjectContext` named as excluded.
5. An explicit "not authorised" statement covering the parked mechanism.
6. The session's commit touches **no code**; `stoic-brain.ts` and `idea-loop-types.ts` are read and
   cited, never edited.

For the parked mechanism, when it opens: the four bullets in §4 answered before code; PR19 review; and
if it becomes an eighth heuristic, a founder-walked additive migration widening the `heuristic` CHECK
constraint, applied TEST → prod with a `§VERIFY` block.

---

## §7 Corrections carried

1. **Heading 3's verification claim is in tension with Heading 4's** and is contradicted by cycle 5's
   articulate-but-empty extraction (§2.3). Reformulate as evidence, not proof.
2. **"From its available signals" needs a boundary**, or a build session may wire in the very context
   source a standing ruling is removing from the examination path (§2.4).
3. **`boulesis`'s committed sub-species are all other-directed**; the mentor's usage extends the genus
   (§2.1). Cite it as an application, not as a catalogued species.
4. **"Park until after the first build gate" is stale** — that gate closed 2026-08-10; this parks on
   the ATRF scoping session / generation-step refinements.
5. **An eighth heuristic is a schema change**, not a code edit — the closed union is mirrored by a
   CHECK constraint (§4).

---

## §8 Rollback

`git revert` the records commit. Documents only; nothing deploys. The parked mechanism has no rollback
because it must not be built.
