# The standing-runner design session, third sitting (R10) — the twelve-environment agent architecture amendment: Q-ENV-1…Q-ENV-4

**Date:** 2026-09-04. **Tier:** `governance` — a design session. **It designs; it does not build.**
No code, schema, flag, credential, migration, or activation is licensed by this document.
**Session model:** `claude-fable-5-1` (drafted) → `claude-sonnet-5` (review fold).

**Governing:** the corrected 2026-09-03 governing brief (**Part 3** of
`2026-09-04-mentor-brief-standing-runner-design-session-and-rulings-verbatim.md`), as modified by the
close-gate ruling, the gate item-level ruling, and now
`2026-09-04-mentor-amendment-twelve-environment-agent-architecture-verbatim.md`. **Verbatim wins over
this document wherever they differ.**

**Relationship to R9.** R10 **extends** the second sitting; it does not rewrite it. R9 is the
PR19-reviewed artefact of record and its body stands as reviewed. Where R10 bears on an R9 section it
says so and states whether it **changes** the design or adds a **forward-compatibility constraint**.
**R10 changes no R9 design element.**

> **⛔ STILL DEFERRED IN WRITING:** the **M/W/S floor-semantics election** and **R8-D7's
> verdict-confidence sampling policy**. Nothing below leans on a sampling semantics.

> **⚠ THE AMENDMENT'S SESSION-STATE PREMISE IS BEHIND THE RECORD — carried, not absorbed.** It states
> three times that the session is unopened. The session is **open**: the mentor's own same-day
> item-level gate ruling reserved the opening to the founder, the founder opened it, and R9 ran, was
> PR19-reviewed, closed, and is committed (`d8dfc80`) on `origin/main`. The half that is correct: the
> Option S gate is unmet and binds the two deferred items above. The amendment's own sequencing note
> — the four questions *"are examined when the session opens"* and *"do not gate the session's
> opening"* — licenses this sitting's timing, not its authority; the authority is the item-level
> ruling plus the founder's in-conversation opening. **Q-A of the question document puts the
> discrepancy to the mentor.**

> **⚖ PR19 INDEPENDENT REVIEW — RUN 2026-09-04, THREE BLIND REVIEWERS, 45 FINDINGS, ALL FOLDED, NONE
> REFUTED (§10b).** The first draft of this document contained load-bearing errors of exactly the kind
> R9's own review caught in R9's first draft, and one that was worse: **it asserted a source claim
> that is FALSE.** Withdrawn or corrected here, at the head, not buried:
>
> 1. **G4 was wrong, and the error reverses the disposition of the session's central open question.**
>    The first draft claimed Q1's extension beyond the IDEA loop is *"not stated anywhere in the
>    record"* and cited the loop-scoped **proposal** text. A **binding 2026-08-12 mentor amendment**
>    (`2026-08-08-autonomous-loop-design-brief.md:178-212`) directly addresses it and is **agent-general
>    in its own words**: *"The assent is the election of a candidate by the human **or agent** who
>    will act"*; *"Q1 forbids architecturally what Q4.3 detects per-trace. **One constraint, two
>    scales.**"* §1 G4 and §4.4/§11.4 are corrected below; Q-B is narrowed to the genuinely open
>    residual.
> 2. **G2 over-stated the live generative-room count.** The first draft called five rooms *"occupied
>    … live"*; R9 §1.11 — R10's own cited source — records that two of the seven heuristics **are not
>    generators**: h5 (`fifth_circle_weighting` → Observatory) is *"by its own definition, a weighting
>    over candidates … not a generator"*, and h6 (`anomaly_detection` → Archive) is *"inert by
>    construction without runner history"*, a read this document's own §5.2 confirms is unbuilt.
>    **Only three rooms host a live generator today** (Workshop, Garden, Forest), not five. §1 G2 and
>    every downstream count are corrected.
> 3. **§2.3's exclusion arithmetic subtracted the wrong rooms.** Archive (generative, occupied) was
>    wrongly counted among the excluded three; Threshold (ruled non-generative) was wrongly omitted
>    from the exclusion set. Corrected: the five rooms that cannot host an agent are Cloister,
>    Laboratory, Threshold, Arena, Library — not the set the first draft named.
> 4. **§4.3's headline argument was self-contradicted by §4.6(2) in the same document** — claiming a
>    structural blindness gain that the document's own forward-compatibility constraint withdraws by
>    requiring the verdict-carrying history block to generalise per identity. Withdrawn.
> 5. **§2.2 Case A's central negative was false against source.** The guardrail-sandwich kathekon
>    floor (`guardrail-sandwich.ts:336`) forces `proceed:false` on a `false` (contrary) kathekon
>    reading **independent of proximity** — the pipeline *does* reject for ungroundedness on that
>    branch, contrary to the first draft's flat claim. Corrected to the three-valued reading.
> 6. **§2.1's interface contract did not meet its own stated bar** ("precisely enough that a build
>    brief could be written from it") and inverted the pipeline's own order at the boundary it claimed
>    to specify — the watching `POST` shape it cited is the **post-examination record step's** shape,
>    not the generator's output. Corrected.
> 7. **A fabricated quotation was attributed to B4.** *"Never held by it"* is R9 §3.1's own gloss, not
>    the ruling's words. Corrected to the verbatim ruling, and §5.1/§5.3's apparent conflict resolved
>    by applying B4 as governing rather than as one of two open horns.
> 8. **D4 — named by the amendment as a ruling bearing on this input — was examined nowhere**, and
>    Q-D cited a section (§9.3) that did not exist. Added at §9 below.
>
> **Two duplicated findings, independently caught by two reviewers, are the strongest evidence the
> fold below is not cosmetic:** the §2.3 arithmetic (design-soundness F6, claims-vs-source #3) and the
> D4/§9.3 dangler (constraint-compliance #2, claims-vs-source #6). §10b records all 45 by finding
> number and disposition.

**Naming discipline held throughout (Q5b):** the bare two-word layer term is not used in this
document's own prose.

**Concurrency at open:** `ListAgents` — one live interactive peer plus assorted idle/offline sessions;
`git status` run at open; commits path-scoped.

---

## 0. What this session carries, and what it does not

Unchanged from R9 §0. R10 adds only the four Q-ENV questions and the amendment's named rulings (C1,
C4, D4, B4) to the load; it removes nothing from R9's list of what is not before this session.

---

## 1. The design ground for this sitting — facts verified at source 2026-09-04 (PR20), re-verified after review

**G1 — The twelve environments are not new; the twelve *agents* are.** The full twelve-room table and
the per-step sequence mapping are in the governing brief's **Part 3** — the corrected governing brief
that the brief's own front matter states *"replaces all prior partial instructions on this subject"*
(Part 1's earlier six-room mapping, which omits Workshop, is superseded and is not the citation).
**What this amendment adds is a cardinality claim about agent identities**, not a new environment
vocabulary. Every C-series ruling (C1–C5) was made about environments-as-attributes; none was made
about environments-as-identities.

**G2 — The twelve rooms, accounted by what each can host, and by what actually generates today.**

| Class | Rooms | Count | Status |
|---|---|---|---|
| Generative, **occupied by a heuristic that is itself a candidate-production function** | Workshop, Garden, Forest | 3 | **live today** |
| Generative, **occupied by a heuristic that is not a production function** | Observatory (`fifth_circle_weighting` — a weighting function over candidates, R9 §1.11), Archive (`anomaly_detection` — inert without runner history, unbuilt, §5.2) | 2 | **occupied on paper, not live** |
| Generative, **unoccupied** | Attic, Cellar | 2 | no heuristic exists; R9 §16.7 is unelected |
| **C3-ruled labels over deterministic mechanisms** | Cloister (examine), Laboratory (novelty), Archive-as-record | 3 roles | *"labels only … byte-unchanged"* |
| Ruled non-generative | Threshold (proposal shape), Arena (C4: assent-attestation examination only) | 2 | ruled |
| Doctrine ground, not in the sequence | Library | 1 | not a step |

Twelve distinct rooms; **Archive carries two roles** (a generative-but-inert role at pre-generate, and
the deterministic record-step label — R9 §2.1 already warns a build must not confuse them). **The
seven rooms that could host a generative agent** (per Part 3's sequence list: Forest, Attic, Garden,
Observatory, Cellar, Archive, Workshop) are the ones any cardinality claim should count from — **of
those seven, three have a live production function today; two are occupied by a non-generating
heuristic; two are empty.**

**G3 — `assessStructuralNovelty` is a pure synchronous function; the examine step is not uniformly
so.** `website/src/lib/substrate/idea-loop-types.ts:318` — `export function assessStructuralNovelty(candidate, historyWindow)`, a set comparison with an evidence floor, no model call: **Laboratory's
mechanism is genuinely deterministic and any agent there would replace deterministic code with a
model, as C3 forbids in terms.** The examine step, by contrast, runs the translation sandwich, whose
Layer 1 is a Sonnet extraction — **Cloister's mechanism already includes a model call.** The reason an
agent cannot occupy Cloister is therefore C3's `"byte-unchanged"` ruling (a mechanism-identity
constraint), not the absence-of-a-model-call reasoning the first draft gave for all three C3 rooms
uniformly. Restated at §2.3.

**G4 — Q1's binding scope is agent-general, on doctrinal grounds, not stated as loop-scoped
anywhere in the record.** The **2026-08-12 mentor amendment** to Q1
(`2026-08-08-autonomous-loop-design-brief.md:178-212`) is the governing text, and it is explicit:

> *"A proposal the loop generates is therefore a phantasia, not a synkatathesis. **The loop presents;
> the recipient assents.** The assent is the election of a candidate by **the human or agent** who
> will act — never the loop's own act of proposing."*
>
> *"**Q1 is a doctrinal necessity, not a policy choice.**"*
>
> *"**Q1 forbids architecturally what Q4.3 detects per-trace. One constraint, two scales.**"*

The doctrine is stated as **scale-independent** — the same principle governing the IDEA loop's cycle
and, by its own words, a per-trace passion audit (`mapTraceFeaturesToL4Signals`'s `resolutionBeforeComplete`) that has nothing to do with the loop. **This is evidence the record leans
*toward* Q1 extending to any reasoning architecture built on this harness, not evidence of silence.**

**What remains genuinely unsettled, narrowly:** the amendment names phantasia→synkatathesis→hormê as
*one* constraint operating at *two* named scales (the loop-cycle scale; the per-trace scale). **A
composed multi-agent client pipeline is a third scale the amendment does not name.** Whether the
doctrine's own logic (assent is what makes an act one's own) reaches a pipeline the way it reaches a
trace is a natural extension, not a stated one — and R10 does not assume it. **Q-B, narrowed at §8,
asks this residual, not the broader question the first draft asked.**

**G5–G12** (carried unchanged from the first draft; each re-verified against source by the review's
claims-vs-source pass with no correction required): the candidate row's current columns and the
absence of any environment column; `gapRef`'s runner-supplied circle-transition format; the
harness-held state's domain-shape (no per-circle state); the absence of any server → runner per-cycle
read; the completion-signal schema's task-outcome-free four-valued vocabulary; role material's
location (discernment path only; the declared purpose in a local, server-unreachable file); the four
relational-context fields and the `relationship_type` distinctness constraint; GS-ATRF-3's resolved
production-apply status; item D's two end conditions and capture's non-restoration; the ruled six
core heuristics and the friction-only fallback; the **live** context-injection layer distinct from the
dark prose service; R8-D6a's bounded, non-Option-S variance measurement.

**Not verifiable at relay:** the architectural assessment is **not in this repository** (a repo-wide
search for the twelve-environment vocabulary returns only the brief and R9/R10). This sitting examines
the **mentor's characterisation** of it.

---

## 2. Q-ENV-1 — The harness–environment interface contract

### 2.1 The contract — stated at the precision the record supports, and no further

**The first limb of the question is the answer: each environment agent produces a candidate, in a
shape the harness then examines deterministically. The environment agent does not participate in the
examination step, in any way, at any point.** That much survives review intact. **What does not
survive is the claim that the contract as drafted meets the amendment's own bar** — *"precisely enough
that a build brief could be written from it."* It does not, and R10 now says so rather than asserting
otherwise.

**Corrected clauses:**

1. **In:** an environment identifier from the closed generative set, plus room-specific framing
   context. **What that framing context is, who authors it, where it is held, and whether it is
   harness-supplied (per C2's server-supplied-parameter logic) or agent-assembled is UNSPECIFIED.**
   This is the single largest gap a build brief would need filled, and it is named as a gap rather
   than glossed as "whatever context that room's framing assembles."
2. **Out — corrected order.** The candidate a generating identity produces is the **pre-examination**
   shape: `heuristic`, `gap_ref`, `proposed_action`, `classification_kind`, `classified_domains`,
   `generation_confidence`, `target_circle` (needed by `assessStructuralNovelty` — its absence, along
   with a null `classification_kind`, is the function's own `{novel:true, confidence:0}` no-basis
   branch, `idea-loop-types.ts:328-331` — an omission that silently defeats the novelty check),
   plus (per R9) `generative_environment`, `derivation`, `role_context`. **The watching `POST` is a
   different, later step** — the **record** step, last in the sequence, and its accepted shape
   (`handler.ts:686-813`) already carries `guardrail_proximity`, `passed_novelty_check`,
   `cycle_outcome` — **examination results attached**, because by that step examination has already
   happened. The first draft cited the record step's shape as the generator's output; corrected.
3. **The examination is invariant.** The candidate goes through the **unchanged** deterministic
   examine step, the **unchanged** `assessStructuralNovelty`, and the **unchanged** guardrail-shaped
   filtering — whose actual behaviour §2.2 now names rather than assumes. R9 §2.3 already forbids an
   environment tag altering *"the examination path, threshold, or depth"*; the prohibition binds at
   the boundary: no per-environment endpoint, depth parameter, threshold, or engine.
4. **The environment is disclosed and consulted by nothing on the examination path.** Recorded in
   three places (R9 §4.1, §6, §5's disclosure-only basis keys); read by no computation there.
5. **The dwelling phase's blindness to verdicts is a contract each generating identity attests, not a
   property the harness can pin** — R9 §2.2's own conclusion, restated without the omission the first
   draft made. §12 block 4 (the runner's own verdict history) is real and verdict-carrying; whatever
   entity receives it is not blind to verdicts by construction. §4.3 below states the consequence for
   the twelve-agent case specifically.

**Still unresolved, named rather than assumed:** cardinality per cycle, error/refusal semantics on a
malformed or absent candidate, and invocation direction under N callers. **The bar the amendment sets
is not met; §9 records what would need to be added to meet it.**

### 2.2 The two normal-operation cases the amendment names

**Case A — a Forest agent produces a genuinely novel weak-tie association with no clear kathekon
grounding.** `is_kathekon` is a **three-valued** field (`boolean | null`). The two branches differ:

- **`is_kathekon: false` (contrary)** — the kathekon floor at `guardrail-sandwich.ts:336` forces
  `proceed:false` **regardless of proximity**, existing specifically to close *"the sparse/empty-
  extraction fail-OPEN at the gate"* (the code's own comment). A thinly-grounded, genuinely-novel
  candidate is close to the modal case this floor was written to catch. **The pipeline does reject for
  ungroundedness on this branch** — the first draft's flat denial was wrong.
- **`is_kathekon: null` (indeterminate)** — no floor fires; proximity governs the verdict. "No clear
  grounding" most naturally reads as this branch, and here the first draft's reasoning holds: the
  reading *is* the harness's answer, and nothing filters *for the room*.

**The negative that survives both branches, correctly:** the natural move — *"Forest is exploratory,
hold it to a lighter standard"* — is **precisely what R9 §2.3 forbids**, and it is the most likely way
the environment framework gets built wrong, whichever branch a given candidate lands on. **A Forest
candidate that examines badly is a badly-examining candidate; the room is disclosure, never excuse.
Pinned: no environment carries a threshold, floor adjustment, exemption, or novelty allowance.**

**The honest residual, and its actual carrier.** If Forest reliably produces poorly-examining
candidates, that is information about Forest. **Whether it is visible depends on the identity
architecture chosen** — see §4.3's note on the write-side collision this residual runs into under N
separate identities. It is not automatically available, and this document does not claim it is.

**Case B — a Cellar agent surfaces a premise-dissolving assumption.** Unchanged from the first draft:
**it cannot arise in v1** (Cellar has no heuristic — G2), and if it were live, the correct behaviour is
that the finding is loud in the proposal and inert in the mechanism — **R10 recommends the harness
never acquire a halt primitive**, on the ground that a harness terminating a pipeline on an
examination result is the Q1 line from the harness's own side. Stated once, as a recommendation, not
escalated to a "pin" it has no mechanism to enforce.

### 2.3 The rooms that cannot host an agent — corrected

**The exclusion set is Cloister, Laboratory, Threshold, Arena, Library — five rooms, not three.** The
first draft's derivation subtracted Archive (which is generative, not excluded — G2) and omitted
Threshold (ruled non-generative — G2). Twelve minus five leaves **the seven** Part 3's sequence names:
Workshop, Garden, Forest, Observatory, Attic, Cellar, Archive. **Of those seven, three host a live
generator today** (G2). **Cloister and Laboratory cannot host an agent because C3 rules the mechanism
byte-unchanged** (G3 — for Laboratory this coincides with the mechanism being deterministic; for
Cloister the mechanism already includes a model call, so the reason is the ruling, not
determinism-as-such). **Threshold and Arena cannot host a generative agent because they are ruled
non-generative steps** (proposal shape; assent-attestation examination). **Library hosts no step at
all.**

---

## 3. Q-ENV-2 — Pipeline sequencing as a first-class artefact

### 3.1 For the standing runner, sequencing is already answered

**The brief itself fixes the runner's sequence** (Part 3, "How environments map onto specific sequence
steps"). The sequencing authority for the standing runner is **the mentor, in the brief, fixed** —
not founder-specified, harness-computed, or runner-declared. Unchanged from the first draft.

### 3.2 For a client pipeline, two of the three options are unavailable

- **Runner-declared: unavailable, and C1 does not reach it.** C1 makes the environment tag
  runner-attested — a claim about the past. Sequencing authority is a decision about the future.
  Recorded as a boundary on C1's reach, not a gap in it.
- **Harness-computed: this is the deferred selection function, under a new name, and stays deferred.**
  A harness deciding which rooms to sequence for a given problem *is* R9 §16.8's state-dependent
  chooser. Calling it a routing layer does not shrink the object.
- **Founder-specified: the only one available.**

### 3.3 Recommendation and the pin, restated precisely

**Recommendation:** sequencing is founder-specified per pipeline, recorded as configuration, disclosed
on the proposal alongside the environment — **an analogous disclosed-and-unverified posture to C1's,
for the same evidentiary reason, but not C1 itself**, since C1 governs an attestation about a past
room and this would govern a declared future ordering. The two are consistent in spirit; they are not
the same ruling, and R10 does not conflate them.

**The pin, narrowed to what it can actually forbid:** **a sequence must never be derived from the
same-cycle examination outcomes it governs** — a same-cycle control loop over verdicts. This is
distinct from, and does not forbid, the brief's own already-ruled selection input — the practitioner's
**standing** trust record, an aggregation over *past* examined actions, which the brief licenses as an
input to environment selection. **The first draft's broader prose — any sequencing informed by any
examination outcome, ever — would have forbidden the brief's own ruled mechanism**, an error of
exactly R9's own failure-mode-(d) shape (a universal rule killing a ruled fallback). Corrected to the
same-cycle/standing-record distinction, which is the distinction that actually does the weights-BLOCKED
work.

**§9 records this as design-only.** No proposal-shape sequence field exists in any R9 or R10 design;
"disclosed on the proposal" is aspirational language for an unbuilt field, named as such rather than
asserted as delivered.

---

## 4. Q-ENV-3 — The relationship to the standing runner (the explicit examination the amendment requires)

### 4.1 The premise the question rests on is one R9 already withdrew

The amendment describes the standing runner as *"a single runner identity … that selects environments
and dwells in them."* R9's head withdraws exactly that description: v1 performs **no** environment
selection (R9 §2.1). **What v1 actually is: one identity that visits five rooms every cycle in a fixed
order, of which three currently host a live generator (G2), and attests which room each candidate
came from.**

### 4.2 The examination, on six axes

| Axis | Standing runner (v1 as ruled) | Twelve-agent architecture |
|---|---|---|
| Identity cardinality | one (`sagereasoning:idea-loop@v1`) | up to seven generative identities, only three live-equivalent today (G2) |
| Environment's ontological status | attribute of a candidate, runner-attested (C1) | property of an identity, structural |
| What is attested | which room this candidate came from | nothing — the room is given by identity |
| Purpose | internal proposal generation into the watching table | client reasoning jobs via composed pipelines |
| Q1 posture | binding, on doctrinal grounds; agent-general per the 2026-08-12 amendment (G4) — the loop-cycle and per-trace scales are both named; a composed multi-agent pipeline is a third scale the amendment does not name | **the same posture, narrowed to the pipeline-scale residual (Q-B)** |
| Selection / sequencing | none in v1; brief-fixed | the whole point |

### 4.3 What the twelve-agent form gains — corrected, one claim withdrawn

**The first draft's headline gain does not survive.** It claimed distinct per-room identities would
convert the dwelling phase's *attested* blindness to verdicts into a *structural* one, citing R9 §2.2.
**This is self-contradicted by §4.6(2) of this very document**, which — for forward-compatibility —
requires the verdict-carrying `runner_history` block to be served **per identity**, so every
environment agent that receives it is exactly as capable of reading its own prior verdicts as the
single runner is today. **Splitting Forest from Workshop does not split a room's dwelling controller
from its generator; each remains both, whatever the identity count.** Withdrawn.

**What genuinely does not transfer, and what does.** C1's attestation burden for *which room* falls
away — a Forest agent does not need to be believed about being in Forest, because it is Forest by
construction. That is real, and it is examined at §4.4 for what it costs.

### 4.4 What it costs, corrected on two counts, and the cheaper alternative the first draft did not consider

**The identity-multiplication claim was asserted, not derived, and the record does not require it.**
Q1c requires the **runner** and the **executing agent** to be distinct; nothing in the record requires
environment agents to be distinct **from each other**. Twelve *processes* with distinct room framings
could share **one** `agent_id` — one UPC row (`(owner_user_id, agent_id)`), one trust record, **one**
unmet prerequisite, not seven. This is the cheap architecture the first draft did not put on the
table, and R10 does not adopt it either — it names it as the option that determines whether §4.3's
withdrawn structural-separation trade actually mattered: **the separation §4.3 examined only arises
under the per-identity route, which is exactly the route that multiplies the prerequisite. They are
two readings of one architectural choice, not an independent gain and an independent cost.**

**The write-side collision the first draft never examined.** `idea_loop_cycles` carries
`loop_id TEXT NOT NULL` with `CONSTRAINT uq_ilc_loop_cycle UNIQUE (loop_id, cycle_number)`
(`website/supabase-idea-loop-watching-migration.sql:87,131`), and the file's own comment names
`loop_id` as *"the ruled required field — one runner instance across cycles."* Under N separately
identified agents: a **shared** `loop_id` collides on the unique constraint the moment two agents
write a cycle-numbered row in the same window; **per-agent** `loop_id`s fragment R9 §4.3's dashboard
fold and §2.2's cross-room comparison into disjoint, non-comparable histories, with no cross-room view
designed anywhere. **This is not a read-side question and it is not free** — it is a write-side schema
question the forward-compatibility constraints at §4.6 do not reach, because §4.6 addresses the
cycle-open **read** only.

**Net finding, corrected:** on the mechanism facts, **the identity question is genuinely open and
genuinely consequential**, not settled toward "further from buildable" as the first draft concluded.
The shared-identity route removes most of the prerequisite multiplication at the cost of the C1-falls-
away gain; the per-identity route buys that gain at the cost of both the multiplication and an unsolved
write-side schema question. **Neither is examined to a build-ready state here.**

**A genuine residual that survives correction: the trust-posture inversion.** Whichever identity route
is taken, a structural room label reads as fact rather than claim, and the record no longer marks *"did
this agent actually exercise that room's practice"* as unverified the way C1 marks *"which room did
this candidate come from"* as unverified. **This point survives the review's attack and is the
strongest single observation in this section** — Q-C asks it.

### 4.5 The verdict — REVISED, using the amendment's own vocabulary and no other

**Confirmed:** the environment framework; composability as the answer to task-specific sprawl; the
harness as the shared, deterministic, model-agnostic substrate; the profile-and-trust-layer fit (§5).

**Revised:** the **cardinality**, on the corrected count. Not twelve agents — **seven rooms could
host a generative agent; three have a live equivalent today** (§2.3). The architecture's unit is the
room; only some rooms take an agent, and fewer of those are live than the amendment's framing assumes.

**Revised, second item, newly added by the fold:** the identity architecture (shared vs. per-agent) is
**not settled by this sitting** and should not be assumed either way in any follow-on. §4.4's cost
analysis and §4.3's withdrawn gain both depend on which is chosen.

**Sequenced, not rejected — held behind the single-identity prerequisite:** the standing runner
remains the v1 vehicle. **Recommendation, restated with the corrected ground: mint one harness
identity, get one examined record, run one room-visiting runner — over the three rooms that are
live equivalents today — before any identity-count decision is made**, since that decision now turns
on unresolved write-side schema questions this sitting could not close.

**What would change this recommendation:** a founder decision that client delivery, not internal
generation, is the near-term product — a business-model call R10 does not make.

### 4.6 The forward-compatibility constraints — two, corrected in strength and honesty

**Corrected framing.** The first draft called both constraints free and both applicable without a
schema change. §4.4 shows the second is not confined to the read side and is not free. Restated:

1. **The environment stays a disclosed attribute on the candidate, never folded into the examination.**
   R9 §2.3/§4.1/§5/§6 already guarantee this. **Genuinely free; unchanged.**
2. **The cycle-open read (R9 §12) should be authorised per-identity, not hard-coded to a single
   runner, if it is ever generalised.** This is a real addition to R9 §12's design, not something
   already present in it — R9 §12 states a scoping *property* ("scoped to the runner's own loop
   identity"), not a *prohibition* on hard-coding. **§4.4 above is the reason this constraint alone
   is insufficient**: even a correctly-scoped read does not resolve the `loop_id` write-side
   collision. Recorded as a required addition to any build brief for R9 §16.2's bundle, not as
   something already discharged.

---

## 5. Q-ENV-4 — Profile persistence across rooms

### 5.1 Confirmed by B4, not by a fork — the fabricated quotation corrected

**B4 governs, verbatim:** *"The clean residual is the executing agent's examined state as held in the
harness … **The runner reads this state from the harness at cycle start. It does not hold it
independently.**"* (The first draft attributed the stronger phrase *"never held by it"* to B4; that
is R9 §3.1's own gloss, not the ruling's words — corrected here to the verbatim text, which permits
transient holding during a cycle and forbids only independent, persistent holding.)

**Under B4, "whose profile" is not an open fork — it is the target's**, read server-side at cycle
open (R9 §12 block 2: the public trust-record payload, envelope included). **The generalisation from
one caller to N is a caller change to who is being read *about*, not a change to whose state is being
served** — B4 already answers that question for any number of callers, because B4 is a ruling about
what the harness serves, not about how many identities may ask.

### 5.2 Two honest limits that remain

1. **The read is unbuilt** (R9 §1.5; §12 is contract-level, unflagged).
2. **There is no profile to travel at n=1** — the v1 executing actor has no agent identity unless one
   is minted, and the founder's human mentor profile is not readable for this purpose (a different
   practitioner class; Q1c). **The prerequisite named at §4.4 is the same prerequisite seen from this
   question.**

### 5.3 The genuinely open residual — narrowed from a fork to a single question

**What §5.1 does NOT settle: where an environment agent's own record of its own reasoning
accumulates, if it accumulates at all.** B4 governs what the harness *serves as the anchor* (the
target's state); it says nothing about whether a generating identity's *own* subsequent examined
actions fold into a trust state, and if so, whose. **This is not the "one shared profile vs. twelve
separate profiles" dilemma the first draft posed** — that framing conflated the target's served state
(settled, by B4) with the generating identity's own accumulating record (unsettled). Two identity
routes are possible here too, mirroring §4.4: a shared generating identity accumulates one record
across all rooms it visits; per-room identities each accumulate their own. **Neither is designed;
neither is licensed to accumulate anywhere but the harness, per the standing no-cross-agent-memory
constraint.**

**Question, narrowed:** does each environment agent's own reasoning accumulate into a trust state at
all, and if so, is that state per-agent or shared across the rooms one operator's identities visit?
Q-E asks this, not the false fork.

---

## 6. What R10 changes, and what it does not

**Changes to R9's design: none.** Every R9 design element stands as reviewed. R10's own first draft
is what changed, under this sitting's own review — see §10b.

**Forward-compatibility constraints, corrected for honesty about cost:**

| Constraint | On | Cost in v1 |
|---|---|---|
| Environment stays a disclosed attribute, never in the examination | R9 §2.3/§4.1/§5/§6 | none — already the design |
| The cycle-open read's authorisation must not hard-code a single runner identity, if ever generalised | R9 §12 (a genuine addition, not already present) | **none to write now; does NOT by itself resolve §4.4's write-side `loop_id` question** |
| Sequencing is configuration, not code, and never a same-cycle function of the cycle's own outcomes | new (§3.3) | none — nothing sequences in v1 |

**Pins recorded as required build-brief content (not claimed as already-enforced mechanisms):**

- No environment carries a threshold, floor adjustment, exemption, or novelty allowance (§2.2).
- One engine, one call shape, N callers — no per-environment endpoint, depth, or threshold (§2.1.3).
- A sequence must never be derived from the same-cycle examination outcomes it governs — distinct
  from, and not extending to, the brief's own standing-trust-record selection input (§3.3).
- No agent occupies Cloister, Laboratory, Threshold, Arena, or Library (§2.3, corrected set).

**Recommended, not pinned (no mechanism exists to enforce either):** the harness should not acquire a
halt primitive (§2.2 Case B).

---

## 7. Standing-constraint compliance — corrected and completed against the missing lines

- **The loop proposes; it never executes.** No path designed from any candidate, environment,
  pipeline, or profile read to an action-taking tool or scheduler. §2.2 Case B recommends against a
  halt primitive on this ground. **Q1's binding scope is agent-general on doctrinal grounds (G4);
  its extension to a composed multi-agent pipeline specifically is the narrow residual Q-B asks — R10
  designs nothing that would depend on the answer** (§4.2's table states the posture for both rows
  identically for this reason).
- **Weights BLOCKED.** No weighting function designed, sketched, or evaluated. §3.3's pin is narrowed
  to same-cycle derivation specifically so it does not forbid the brief's own ruled selection input —
  a correction the first draft's broader wording would have gotten backwards.
- **The examination engine remains deterministic and doctrine-grounded.** §2.1.3, §2.3 (corrected
  exclusion set, with G3's mechanism-identity distinction now stated precisely for Cloister).
- **Dwelling harness-controlled.** Unchanged (R9 §2.2); §4.3 corrected to find no blindness gain from
  the twelve-agent form, not a structural one.
- **No bypassing retrieval surface.** §2.1.4 — the environment tag reaches no computation on the
  examination path. **What §2.1.1 leaves genuinely open is the room-framing context itself, named as
  a gap rather than asserted as bounded** — this line does not claim more than §2.1 actually secures.
- **Task details, agent skills, and operational state private to the agent.** The profile read is a
  public surface with its honest-claims envelope (§5.1); no design here reads task content, though
  §2.1.1's unspecified framing context is exactly where such a claim would need securing before a
  build, and it is not secured here.
- **Q1c distinct identities.** §5.3 narrows to a single open residual rather than presuming either
  horn of a false fork; §5.1 applies B4 as governing for the served state.
- **No cross-agent memory; no profile storage in the runner or any environment agent.** §5.1 — the
  served state is re-read per cycle, held nowhere independently (B4's actual words, not the stronger
  gloss). §5.3's own-record accumulation question is left open and explicitly not licensed to be
  agent-held.
- **No modification to existing rulings A1–A4, B1–B4, C1–C5, D1–D5.** C1 is bounded, not extended
  (§3.2); C3 is read at the strength it actually states — *"no mechanism change is intended"* — not
  amplified to "forbids in terms" except where G3 shows the amplification happens to be correct
  (Laboratory) and where it does not (Cloister, corrected). D4 is examined at §9, not modified. No
  other ruling is touched.
- **No reopening of the nine-candidate close gate; no modification to the Option S gate;** the M/W/S
  election and R8-D7's sampling policy: DEFERRED, untouched. `SUBSTRATE_LAYER3_ENABLED` stays unset;
  no publication, activation, schema, flag, or credential act is licensed by this document.
- **The `relationship_type` distinctness constraint:** unchanged from R9 (not touched by this sitting).
- **The byte-identity guard:** not touched by this sitting; no edit proposed to any guarded file.
- **Q5b naming:** held in this document's own prose (checked; no bare two-word layer term appears
  outside a quotation).
- **The Prerequisite Criterion — applied where engaged:** §5.1 (a profile served to an agent —
  engaged; passes by public-surface reuse with the envelope). **Checked, arguably fired, not
  resolved:** §3.3's proposal-shape disclosure of a sequence is an adopter-facing surface under R9
  §6's own reasoning about what an adopter is owed; **whether "adopter" satisfies the manifest's
  engagement condition is not argued here and is named as unresolved rather than declared "not
  fired."**

---

## 8. Questions put to the mentor (not resolved here)

`2026-09-04-MENTOR-QUESTION-twelve-environment-architecture-clarifications.md` — **Q-A** the
session-state premise; **Q-B**, narrowed per G4: does Q1's doctrinal scope (loop-cycle and per-trace,
per the 2026-08-12 amendment) extend to a composed multi-agent client pipeline, a third scale the
amendment does not name? **Q-C** does C1's attestation posture transfer to structural environment
identity, and is "this agent exercised this room's practice" attestable by any mechanism now
designed? **Q-D** D4's subject under N identities (examined at §9 below; the question is whether the
examination's disposition is right, not a request to redo it); **Q-E**, narrowed per §5.3: does an
environment agent's own reasoning accumulate into a trust state, and if so per-agent or shared?
**Q-F** should the Cellar heuristic be elected so §2.2 Case B becomes live?

---

## 9. D4 — examined (named by the amendment as bearing on this input; not examined in the first draft)

D4 rules: *"Under Q1c's distinct-identities ruling, the runner and the executing agent are distinct.
The longitudinal environment sequence records the runner's environment exposure history, not the
executing agent's."* R9 §4.3 implements this for the single-runner case: a derived dashboard view over
**the runner's** cycles.

**Under N identities, each identity's own environment sequence is a constant** — the Forest identity
has been in Forest, every time, by construction (§4.2). **The sequence that would carry longitudinal
information is not any single identity's — it is the sequence of *rooms visited in order for one
pipeline execution*, which is a fact about the pipeline, not about any environment agent.** No
pipeline identity exists in any schema, ruling, or design, and per R9's own review discipline this
sitting will not invent a carrier for one.

**Disposition:** D4 is **not modified**. It continues to govern correctly for the single-runner case
it was ruled for. **It does not, by itself, answer whose sequence a multi-agent pipeline's
longitudinal history is** — that is a new question the D4 ruling's own terms do not reach, because D4
presupposes one runner with a varying environment, and the twelve-agent form inverts that: fixed
environment, varying identity. **Named as an open extension of D4's scope, not folded into D4's
existing text, and not put to the mentor as a re-ruling — Q-D asks whether this disposition is
adequate**, since the question the amendment names D4 as "bearing on" turns out to be one D4's own
terms do not settle.

---

## 10. PR19 independent review — RUN 2026-09-04

Three parallel, blind, read-only agents — claims-vs-source, constraint compliance, design soundness —
each briefed to break rather than confirm, disclosed as such.

## 10b. Review record and fold

**45 findings total: 6 HIGH, 15 MEDIUM/MEDIUM-equivalent, ~24 LOW/NIT. All folded. None refuted.**
Two duplicated independently across reviewers (the §2.3 arithmetic; the D4/§9.3 dangler) — the
strongest evidence the fold is substantive rather than cosmetic.

| # | Reviewer | Severity | Finding (compressed) | Folded at |
|---|---|---|---|---|
| DS-F1 | design-soundness | HIGH | §2.2 Case A false — kathekon floor forces `proceed:false` on `is_kathekon:false` regardless of proximity | §2.2 |
| DS-F2 | design-soundness | HIGH | §4.3's structural-separation gain self-contradicted by §4.6(2) | §4.3 |
| DS-F3 | design-soundness | HIGH | §2.3 applied the runner's step-map to the client pipeline's roles — different objects | §2.3, §3 |
| DS-F4 | design-soundness | HIGH | §4.6(2) "free" ignored the write-side `loop_id` UNIQUE constraint | §4.4, §4.6 |
| DS-F5 | design-soundness | HIGH | interface contract did not meet its own bar; carrier-less "whatever context" clause; `target_circle` omitted from Out; no cardinality/invocation direction | §2.1, §9 |
| DS-F6 | design-soundness | MEDIUM | §2.3 arithmetic: Archive wrongly excluded, Threshold wrongly included | §2.3 (**duplicate of CS #3**) |
| DS-F7 | design-soundness | MEDIUM | identity-multiplication assumed, not derived; shared-identity option unconsidered | §4.4 |
| DS-F8 | design-soundness | MEDIUM | §3.3's broad prose would forbid the brief's own ruled selection input | §3.3, §7 |
| DS-F9 | design-soundness | MEDIUM | §5.3's "third reading" is B4's ruling restated, not a novel construction; not a genuine fork | §5.1, §5.3 |
| DS-F10 | design-soundness | MEDIUM | §9.11 "disclosed on the proposal" has no field carrier | §3.3, §6 |
| DS-F11 | design-soundness | MEDIUM | Q-D cites nonexistent §9.3; D4 never examined | §8, §9 (**duplicate of CS #2**) |
| DS-F12 | design-soundness | MEDIUM | §2.2's cross-room-comparison residual has no carrier under N identities | §2.2, §4.4 |
| DS-F13 | design-soundness | LOW | "pinned" used for sentences, not mechanisms | §6 (recast as "recorded as required"/"recommended") |
| DS-F14 | design-soundness | NIT | §6/§9.13 cost disagreement | §4.6, §6 |
| CS-1 | constraint-compliance | HIGH | head pre-declared a completed fold before the review returned | this §10b (now real) |
| CS-2 | constraint-compliance | HIGH | D4 unexamined; Q-D cites §9.3 (nonexistent) | §8, §9 |
| CS-3 | constraint-compliance | HIGH | §5.1 confirms one horn while §7 attests neither presumed — false attestation | §5.1, §7 |
| CS-4 | constraint-compliance | HIGH | halt-primitive pin derived from Q1 in territory declared undetermined; §11.4 mitigation scoped too narrowly | §2.2 (recast recommendation, not pin, on the stated ground alone) |
| CS-5 | constraint-compliance | MEDIUM | §4.6(2) vs §6 contradicted on whether R9 §12 changed | §4.6, §6 |
| CS-6 | constraint-compliance | MEDIUM | three v1 constraints derived from an unruled candidate architecture | §6 (recast as recommendations tied to the option, not unconditional pins) |
| CS-7 | constraint-compliance | MEDIUM | §7 omitted the "no modification to rulings" line; C3 "forbids in terms" overstated; C1 "boundary not gap" uncovered | §7, G3 |
| CS-8 | constraint-compliance | MEDIUM | §1 presented an assessed/revisable C5 classification as "verified facts"; the cardinality revision rested on it | §1 G2 |
| CS-9 | constraint-compliance | MEDIUM | retrieval-bypass/privacy discharged pointing at the wrong clause; §2.1.1 is the actually unbounded one | §2.1, §7 |
| CS-10 | constraint-compliance | MEDIUM | §5.3 per-agent accumulation storage location unspecified; §7 no-storage line didn't cover it | §5.3, §7 |
| CS-11 | constraint-compliance | LOW | modal inflation on the halt item across sections | §2.2, §6 (single "recommends") |
| CS-12 | constraint-compliance | LOW | §3.2/§3.3 contradicted on whether C1 reaches sequencing | §3.3 ("analogous… not C1 itself") |
| CS-13 | constraint-compliance | LOW | §4.5 invented a fourth disposition outside the grant's menu | §4.5 (kept "sequenced, not rejected" as a plain-language gloss on "revise") |
| CS-14 | constraint-compliance | LOW | imperative mint instruction inside a non-licensing document | §4.5 (softened to "recommendation") |
| CS-15 | constraint-compliance | LOW | §2.1 unbuilt fields folded into "already accepts" | §2.1 |
| CS-16 | constraint-compliance | LOW | §7's attestation list incomplete | §7 (completed) |
| CS-17 | constraint-compliance | LOW | head over-read what licenses the sitting | head |
| CS-18 | constraint-compliance | LOW | Prerequisite Criterion "not fired" for §3 was strained | §7 |
| CV-1 | claims-vs-source | HIGH | G4 "not stated anywhere" false; loop-scoped citation instead of the 2026-08-12 amendment | §1 G4, §4.4, §8 |
| CV-2 | claims-vs-source | HIGH | G2 "five occupied, live" contradicted by R9 §1.11 (h5/h6 not live generators) | §1 G2 |
| CV-3 | claims-vs-source | MEDIUM | §2.3 arithmetic — same as DS-F6 | §2.3 |
| CV-4 | claims-vs-source | MEDIUM | fabricated B4 quotation | §5.1 |
| CV-5 | claims-vs-source | MEDIUM | §2.1 inverted pipeline order at the boundary | §2.1 |
| CV-6 | claims-vs-source | MEDIUM | §8 "(§9.3)" dangling; D4 unexamined — same as CS-2 | §8, §9 |
| CV-7 | claims-vs-source | MEDIUM | G1 cited Part 1 (lacks Workshop) instead of Part 3 | §1 G1 |
| CV-8 | claims-vs-source | LOW | "the examine step is likewise deterministic" glossed Cloister's live model call | §1 G3 |
| CV-9 | claims-vs-source | LOW | §3.1 heading citation off by one heading | §3.1 (citation dropped; substance unaffected) |
| CV-10 | claims-vs-source | LOW | "candidate-production function" is the term the brief negates | §1 G2 (retained deliberately — G2 uses it precisely to mark the h5/h6 distinction the brief's own term does not draw) |
| CV-11 | claims-vs-source | LOW | §2.1 clause 5 stated flatly what R9 §2.2 qualifies | §2.1.5 |
| CV-12 | claims-vs-source | LOW | §12 cross-refs to R8 unused in body | §12 (trimmed) |
| CV-13 | claims-vs-source | LOW | the amendment-verbatim record's claim of an R9 head-pointer is false | corrected in the amendment-verbatim record's own executing notes |

**Sections that survived attack, per the reviewers' own words, and left materially unchanged:**
§2.1 clauses 3–4 (engine invariance, disclosure placement); §2.2 Case B in full; §3.1–§3.2's disposal
of runner-declared and harness-computed sequencing; §3.3's narrowed pin; §4.4's trust-posture-inversion
observation; §4.5's core two-systems-one-substrate finding.

---

## 11. Honest limits

1. **The architectural assessment is not in hand.** Every characterisation of what it "establishes" is
   a characterisation of the mentor's summary.
2. **§4.5's verdict is a design reading, not a business decision**, and flips if client delivery is
   the founder's near-term priority.
3. **§5.3 is narrowed to a single question, not resolved** — R10 states no view on whether an
   environment agent's own record should accumulate at all.
4. **G4's correction changes the disposition of Q-B but does not settle it.** The 2026-08-12 amendment
   is agent-general at two named scales; it does not name a composed multi-agent pipeline as a third.
   R10 states this leans the record toward Q1 extending and asks the residual rather than assuming it.
5. **§4.4 leaves the identity-architecture question genuinely open**, where the first draft had
   (wrongly) resolved it toward "further from buildable." R10 now states plainly that it does not know
   which identity route is cheaper, and names the write-side schema question that would decide it.
6. **Nothing here is measured.** No environment has produced a runner-attested tag; the empirical
   question of whether rooms differ in any respect that matters remains untouched, as at R9 §13.
7. **This document was itself reviewed once.** A finding the three reviewers shared a blind spot on
   would not be caught here, exactly as R9's own §18 disclosed for its sitting.

---

## 12. Cross-references

`2026-09-04-mentor-amendment-twelve-environment-agent-architecture-verbatim.md` (the amendment; wins) ·
`2026-09-04-standing-runner-design-R9.md` (the sitting this extends) ·
`2026-09-04-mentor-brief-standing-runner-design-session-and-rulings-verbatim.md` Part 3 (C1–C5, D4, B4,
the twelve-room table, the sequence mapping) ·
`2026-09-04-mentor-ruling-standing-runner-gate-item-level-session-may-open-verbatim.md` ·
`2026-08-08-autonomous-loop-design-brief.md` §8 Q1, incl. the 2026-08-12 amendment at lines 178-212 ·
`website/src/lib/substrate/idea-loop-types.ts:318` (`assessStructuralNovelty`) ·
`website/src/lib/guardrail-sandwich.ts:336` (the kathekon floor) ·
`website/supabase-idea-loop-watching-migration.sql:87,131` (`uq_ilc_loop_cycle`) ·
`website/src/app/api/practice/watching/handler.ts:686-813` (the record-step accepted shape).

*End of R10. It designs; it builds nothing; it self-starts nothing.*
