# ATRF Scoping Session — proposed scope and question set (FOR MENTOR REVIEW)

**FOR MENTOR REVIEW — NOT FINAL. This scoping is not adopted until the mentor's feedback returns and
the founder finalises it. No build, route, flag, credential, or schema is licensed by this document.**

> **DATED NOTE 2026-08-23 — FEEDBACK RETURNED; SCOPE FINALISED.** The mentor's response arrived the
> same day (verbatim, which wins:
> `operations/agent-circles-2026-08/2026-08-23-mentor-response-atrf-scoping-verbatim.md`) and the
> founder elected finalisation on relay ("proceed"). **The scope is confirmed as presented, with six
> named adjustments — applied in §10 below; the originals above are preserved unaltered and are read
> subject to §10.** The finalised question set for ruling is at
> `operations/agent-circles-2026-08/2026-08-23-ATRF-QUESTIONS-FOR-RULING.md`. The response rules no
> GS-ATRF question and licenses no build; the second sentence of the header above continues to bind.

**Session:** 2026-08-23. **Tier:** `governance` — documents only, Standard risk under 0d-ii; AC7 not
engaged; no code, schema, flag, credential, migration, or live op. **Authored under:**
`operations/handoffs/founder/2026-08-23-ATRF-scoping-session-NEXT-SESSION-PROMPT.md` (spent on open).
**Verification discipline:** every present-tense mechanism fact below carries a `file:line` or record
citation verified **this session** against the working tree at HEAD `6dcbe09` — not inherited from the
session prompt or from any predecessor summary. Facts that could not be verified from the repo are
marked unverifiable, not asserted. PR20 (both 2026-08-19 amendments) binds this document directly: it
is a mentor-consultation document.

---

## §0 Provenance, sequencing record, and grounding verified at open

**What this document is.** The scoping document for the **ATRF scoping session** — the founder takes
this to the mentor for feedback; the session's scope is finalised only after that feedback returns.
Per the mentor's 2026-08-21 Q1 ruling
(`2026-08-21-mentor-rulings-five-questions-examination-session-verbatim.md`, verbatim wins), the ATRF
scoping session is a distinct future session — not the generation-step scoping session (ruled
2026-08-09, closed) — *"whose subject matter is the Agent Task Reasoning Framework's open questions —
GS-ATRF-1 through GS-ATRF-4, the blast-radius vocabulary, the epistemic status framework, and the
§(c-bis) gap."* Nothing in this document resolves any GS-ATRF question; it prepares them for ruling.
The mentor rules.

**The sequencing fact, recorded so no future reader mistakes it for drift.** The confirmed five-step
priority order (`D-MENTOR-PRIORITISED-SEQUENCE-ADOPTED-2026-08-09`, decision-log:19354) lists the ATRF
scoping session **fifth, after** the standing-runner design session (fourth). The founder's election
to open ATRF **scoping** first is a deliberate sequencing choice, made with the 2026-08-21 Q5 ruling
in view: the two sessions are **parallel tracks, not sequential** — the two-vocabulary dependency
binds only the Evaluative Engine Epistemic Status Scoping Session, not the standing-runner design
session (Q5, verbatim: *"These are parallel tracks, not sequential ones"*). Nothing in this scoping
consumes, advances, or pre-scopes any standing-runner input.

**Gate status, re-derived from primary sources this session (not inherited).** The session's
*"post-validation-run, do not open early"* gate (`00-PRIORITY-INDEX.md` §The gates) is **discharged**:
the bounded validation run closed at 20 cycles and its §6 report was **accepted in full**
(`D-MENTOR-RULING-R1-S6-REPORT-ACCEPTED-2026-08-16` — *"The report is accepted in full. The R1 gate
clears."*); the M5 ruling (2026-08-15) released the boulesis/sufficiency doctrinal blocker (*"the
build-blocker is released; the ATRF scoping session may proceed"* — S3 §5-Q3-e dated block, verbatim
at `operations/handoffs/founder/2026-08-15-mentor-response-concurrent-arc-M1-M7-verbatim.md`); the
concurrent-arc plan's R5 entry records the session *"now legitimately open"*
(`2026-08-15-concurrent-arc-plan.md:394`).

**Grounding verifications performed this session:**

1. **HEAD is `6dcbe09`** — the same commit the session prompt was drafted at; `git log 6dcbe09..HEAD`
   is empty. The window since drafting contains no commits. The newest closes at open:
   `2026-08-23-class-b-route-change-CLOSE.md` (Class B route change built + TEST-verified, no RLS
   apply) and the mechanical-items 2/3/4 closes — none touches an ATRF inherited input.
2. **The GS-ATRF-4 live surface: RESOLVED — the SQL has been run.** The session prompt carried a
   drafting-time caution that `website/supabase-project-context-2026-08-19-gsatrf4-update.sql` might
   not have been run. Re-derived from the decision log:
   `D-GSATRF4-EPISTEMIC-STATUS-LIVE-2026-08-19` (decision-log:23763) records the founder-walked
   production write **applied and verified** the same day (Step-3 verification:
   `four_questions_wording_present: true`, `stale_three_questions_wording_present: false`). The live
   `project_context` row carries GS-ATRF-4 per that founder-walked verification record; it was not
   re-queried this session (a `governance` session performs no live op). The static fallback was
   re-verified first-hand today: `website/src/data/project-context.json` is `"version": "1.4.0"`,
   carries the ruled GS-ATRF-4 text and the *"These four questions"* wording.
3. **No S6-reordering ruling exists** — verified for §4.2 below: `friction-primary-hypothesis.md`
   carries no post-report ruling block; the R1 acceptance ruling confirmed h7's corrected three-way
   split *as a finding* and carried the friction channel's "right kind of work" question as *"a
   design question, not a verdict on this run"*; the priority index parks the reordering decision on
   *"the §6 report, then the standing-runner design"* (`00-PRIORITY-INDEX.md`, S4+S6 block).
4. **The mechanical-items item 5 routing act is SPENT** — resolved by the Q5 ruling and recorded
   (`2026-08-22-mechanical-items-234-and-routing-NEXT-SESSION-PROMPT.md:110`ff, dated update).
5. **Line-citation drift, corrected here rather than inherited.** Two anchors cited across the
   inherited records have drifted: `assessStructuralNovelty` is now at
   `website/src/lib/substrate/idea-loop-types.ts:241` (older records cite `:222`), and
   `GeneratedCandidate.targetCircle` is at `idea-loop-types.ts:109` with its *"ABSENT for a
   friction_detection candidate"* docstring at `:108` (older records, including
   `gs-atrf-2-shape.md`, cite `:104`). Every line number in this document is this session's own
   verification.
6. **Concurrency:** three peer sessions were active in this working tree at open (`ListAgents`); this
   session's files are new or its own, and the decision-log append is explicitly sequenced per the
   2026-08-22 discipline.

**Standing constraints confirmed at open:** P0 0h hold active, and the founder's 2026-08-22 direction
stands (all current tasks complete before any 0h assessment); weights BLOCKED throughout; the Q1 hard
constraint (the loop proposes; it never executes) untouched by anything here; `manifest.md` is not
amended by this document.

---

## §1 The session's subject matter, from the ruled records

Three sources fix what the ATRF session is *for*; everything in §2 is dispositioned against them.

**(a) The Q1 ruling's subject-matter sentence** (2026-08-21, verbatim): GS-ATRF-1 through GS-ATRF-4,
the blast-radius vocabulary, the epistemic status framework, and the §(c-bis) gap. Direction 3's
GS-ATRF half also lands here (Q1; `D-MENTOR-RULINGS-FIVE-QUESTIONS-EXAMINATION-ADOPTED-EXECUTED-2026-08-22`).

**(b) The manifest's ATRF section** (`manifest.md:253-273`, mentor-directed, verbatim — re-read in
full this session). The ATRF's three carried elements: **(1)** the pre-task reasoning record,
**(2)** the post-task completion assessment (the longitudinal signal), **(3)** the idea completion
signal. The blast-radius indicator paragraph (`manifest.md:269`) fixes the `high | medium | low`
vocabulary and the two-record requirement (the loop's indicator *and* the agent's own assessment,
*"recorded alongside … for longitudinal comparison"*). The what-it-is-not paragraph
(`manifest.md:271`) excludes task execution monitoring, skills inventory, inner-circle capability
assessment, and consciousness/continuity mechanisms. **A fact that bounds every question below: the
ATRF harness is unbuilt.** The manifest states its *design*; no pre-task question set, post-task
assessment, or completion-signal receiver exists in code (the recording-note precedent:
`D-SUBSTRATE-AGNOSTIC-CONTROL-PLANE-AND-INCUBATION-ENTRY-RECORDED-2026-08-22` — *"faithful to the
ATRF's stated design … the ATRF harness is unbuilt"*).

**(c) The prioritised instruction's own content list for this session**
(`D-MENTOR-PRIORITISED-SEQUENCE-ADOPTED-2026-08-09`, decision-log:19354): *"pre-task question set
design, completion-signal return path, oikeiosis extension metric for the runner as a longitudinal
signal."* These three name the session's original core; everything since routed to it (§2) extends
that core, and the six Stoic items' first four are, on their own terms, pre-task question-set design
content.

**A standing frame constraint:** per ADR-012
(`adopted/adr/2026-06-24-sage-practice-measurement-instrument-reframe.md`), the whole practice is a
measurement instrument producing a per-decision profile. Every ATRF mechanism scoped here is a
*measurement* of reasoning quality with disclosed limits — never an enforcement mechanism, and never
a training-reward surface (weights BLOCKED).

---

## §2 The inherited-inputs register, dispositioned

Every item the session prompt's register names is dispositioned below — in scope, out of scope with
named destination, or deferred with named condition. Readiness is assessed per item (the ruled
anti-overcorrection discipline: honestly, not uniformly cautious or uniformly ready). Statuses were
re-derived from primary sources this session; where a starting hypothesis in the session prompt was
found stale, the correction is stated in place.

### 2.1 GS-ATRF-1 — the loop-level blast-radius proxy, and the §(c-bis) basis-lessness gap

**Ruled ground (not re-opened here).** GS-ATRF-1 is answered, four dimensions, unabridged
(`2026-08-09-mentor-review-six-stoic-items-and-gs-atrf-answers-verbatim.md`; confirmed A2,
`gs-atrf-corrections.md` §(a)): circles affected (dikaiosyne), reversibility (andreia), preferred
indifferents at stake (phronesis), impulse proportionality (sophrosyne) — *"assessed from the
candidate's virtue domain and targetCircle"*, a proxy disclosed as such. The four dimensions are
constituent readings of one indicator, not alternatives. C16 binds: the dikaiosyne dimension measures
**reach across circles, never headcount** (`gs-atrf-2-shape.md` §C16; manifest Moral Community
Boundary, `manifest.md:114-118`). C10 binds the name: **loop-level blast-radius proxy**, never
shortened, never conflated with the permission-layer blast-radius enrichment — and never conflated
with the dikaiosyne *floor* inside the live examination engine (`gs-atrf-2-shape.md` §"A second
conflation risk").

**The open gap the session owns — §(c-bis)** (`gs-atrf-corrections.md`, ruled raised independently):
a `friction_detection` candidate has **neither** of the ruled answer's two named inputs, by
construction — `targetCircle` is optional and documented *"ABSENT for a friction_detection
candidate"* (`idea-loop-types.ts:108-109`, verified this session), and its `initialClassification`
branch is `{ kind: 'preferred_indifferent' }` (`idea-loop-types.ts:113-115`) — so the proxy has no
basis at all for that channel, and the fixed `high | medium | low` vocabulary cannot express
basis-lessness. The available precedent is `assessStructuralNovelty`'s no-basis posture
(`idea-loop-types.ts:241`; the joint-absence branch returns `{ novel: true, confidence: 0 }` at
`:252`) — **a precedent, not a pre-authorised answer** (§(c-bis)'s own words). The ruled path
(GS-ATRF-4 ruling Q(b), 2026-08-19, as corrected by Q1): at this session, examine whether GS-ATRF-4's
`unknown` category closes §(c-bis) directly, **or** whether GS-ATRF-1's ruled answer needs a separate
amendment — *"ruled answers are not amended by the addition of new open questions. They are amended
by a ruling that specifically re-opens and revises them."*

**A bound carried with it** (§(c-bis) closing paragraph): generation channel is legitimately
*evidence about* blast radius, never part of its *definition* — channel belongs as a recorded
covariate of the manifest's two-record comparison, not a fifth dimension. **And a disclosed
interaction with S6** (`gs-atrf-2-shape.md` §proposal-shape): if friction ever became the primary
generation channel, the primary channel would be the one channel structurally unable to carry the
indicator — disclosed, not resolved, and not this session's to resolve (§4.2).

**§(e)'s carry-forward is executed history, not an open input:** the epistemic-status framework it
carried arrived, was ruled standalone as GS-ATRF-4 (2026-08-19), and is item 2.4's subject. What
survives of §(e) here is only the routing: §(c-bis) is examined at this session alongside GS-ATRF-1
through 4.

**Readiness: READY for ruling.** The gap is fully characterised at source, both candidate resolutions
are named by ruling, and the vocabulary question it couples to (2.4) has a ruled named direction.
**Disposition: IN SCOPE** — the session examines §(c-bis) and seeks the Q(b)-sequence ruling.
**The eventual ruling must establish:** which resolution path closes the gap; whether the no-basis
posture is expressed as GS-ATRF-4 `unknown`, as a null-plus-flag on the indicator (2.4), or as a
GS-ATRF-1 amendment; and how the channel-as-covariate bound is recorded in whatever shape results.

### 2.2 GS-ATRF-2 — the proposal shape and per-cycle record

**Fixed ground (a build inherits, never chooses):** the three-value vocabulary and the two-record
requirement, verbatim in `manifest.md:269` (`gs-atrf-corrections.md` §(b)). The two records have
different authors at different moments (loop at proposal time; agent after election/execution) — the
same actor/moment distinction GS-ATRF-3's B1 ruling rests on. **The comparison is the signal itself.**

**Specified ground:** the shape is already specified, derived entirely from ruled ground
(`gs-atrf-2-shape.md`): two optional proposal-shape fields (`blastRadius`, `blastRadiusBasis` — a
structured four-dimension basis record, C11: persisted at computation time, never re-derived on
read); absent-not-defaulted when uncomputable (the friction case, 2.1); and the parked **one
migration, three additive nullable columns** on `idea_loop_candidates` — `blast_radius`,
`agent_blast_radius`, `target_circle` (or a ruled cycle-level resolution from the gap — both options
deliberately left open). Verified this session: the live candidate table has **17 columns and no
`target_circle`** (column list re-derived from `website/supabase-idea-loop-watching-migration.sql`
§2; a repo-wide grep for `target_circle` across `src/` and every migration file returns zero hits) —
without the third column, a persisted `high` is not auditable (the dikaiosyne dimension's input is
unrecoverable from the row), which is §(c)'s point.

**Constraints carried:** the **clean-field constraint**, elevated by the R1 acceptance to *"a named
constraint, not a preference"* (`D-MENTOR-RULING-R1-S6-REPORT-ACCEPTED-2026-08-16`: any design that
appends runner commentary to `proposed_action` corrupts the surface the Q7 ruling keeps honest) — so
the blast-radius records are their own fields, never commentary. And the **C15 closure**: the
three-enumeration circle question was ruled closed 2026-08-12 (coexistence, each enumeration
canonical within its own domain — the C15-closure note at `manifest.md:120`;
`2026-08-12-mentor-consultation-c15-doctrinal-split-ruling-verbatim.md`), so the dikaiosyne
dimension's design must **state which enumeration it counts over** rather than resolve or re-litigate
the coexistence. (`gs-atrf-2-shape.md` predates the closure and says "unresolved" — stale there;
corrected here.)

**Readiness: READY — the most build-adjacent item in the register.** The shape exists; what remains
is confirmation and migration scoping. **Disposition: IN SCOPE**, and per the founder's election at
this session's open (§4.2), **the R6 migration scoping rides this session's scope**: the ATRF session
scopes the three-column watching-row migration *and* the S4 watching-table extension as
founder-walked 0c-ii Critical steps to be executed after its rulings land — it does not apply either.
**The eventual rulings must establish:** confirmation of the shape spec as the migration's scope;
the `target_circle`-column vs cycle-level-resolution choice (or its deliberate deferral to the build
session); whether the basis-copy durability question stays with the build session (the shape spec's
own recommendation); and how the §(c-bis)/vocabulary outcome (2.1/2.4) is expressed in the columns'
CHECK constraints (a null-plus-flag outcome changes the shape; a fourth-value outcome would change
`manifest.md`, which only a ruling can do).

### 2.3 GS-ATRF-3 — the completion signal: return path, content, and the justice question

**Ruled ground.** B1 (2026-08-11, generation-step-scope §2.12): the generation-step document states
the *requirement* — the signal carries **examination evidence, not a binary flag**, because it is
*"the primary post-execution evidence of whether genuine examination occurred rather than
simulation"* — and the **return path** (*"how the agent sends it, what the harness does with it,
schema"*) is scoped **at this session**. The what-must-be-carried / how-it-is-built boundary that
bound the generation-step document is exactly the boundary this session now crosses by design: the
return path — actor, transport, schema, endpoint, persistence, harness handling — is this session's
to scope.

**Content ground.** The sufficiency-examination content specification (ruled 2026-08-12, routing 1 of
`D-SUFFICIENCY-EXAMINATION-TRIGGER-ROUTED-2026-08-12`; cross-referenced at generation-step-scope
§2.12): *"the completion signal should examine whether apparent exhaustion is genuine, not merely
count to three … not just that a completion signal must exist and carry examination evidence, but
what the examination should ask."* The M5 design directives bind (S3 §5-Q3-e dated block): the
sufficiency check is an **epistemic threshold check, not a motivational-state check**; if the ATRF
carries both conditions, **`boulesis present` and `sufficiency reached` are separate fields, never
collapsed** — both required for a right action, neither substituting for the other. The **F-Q43
warning** binds any design here (generation-step-scope §2.13's own statement of it): detecting
apparent completion is free and worthless; the design problem is the **discriminating causal
signature** — the precedent being Q4.3 `resolutionBeforeComplete`
(`website/src/lib/substrate/trust-core/l4-passion-audit.ts:279-281`), which had zero discrimination
until narrowed to causal order.

**The justice carry-forward — §(d)** (`gs-atrf-corrections.md`, mentor-directed): if the signal
carries examination evidence, it will need to carry *something about the justice assessment* — and
whether that can be **honestly stated by an agent whose own justice assessment may be subject to the
same floor dynamics** is open. A completion signal is structurally an agent's claim about the quality
of its own examination — the same shape as the class the dikaiosyne floor fired on in cycle 6. The
three must-NOT-assume bounds carry verbatim: **not** that reading (a) of the floor pattern is settled
(both readings stand, undiagnosed; per Q4-e the cross-endpoint check cannot reach the floored class
at all); **not** that this constrains the return path's design (it names a question the design must
answer); **not** that the proxy's dikaiosyne dimension and the dikaiosyne floor are one mechanism
(they remain distinct; §(d) concerns the floor).

**Doctrinal inputs, ruled, carried in:** the prohairesis correction — a proposal is a *phantasia*,
the election is the *synkatathesis*; Q1 forbids architecturally what Q4.3 detects per-trace
(generation-step-scope §2.10 dated amendment, ~:192;
`D-FIVE-PRINCIPLES-AND-GUIDE-FUNCTION-RULINGS-EXECUTED-2026-08-12` — its "home otherwise" is this
session, alongside the sufficiency content). The completion signal sits at the far end of that same
sequence: post-execution self-report on an examination the agent itself conducted. And S5's parked
half (b) — the completion-signal design — is the **same item** as this one, not a second one
(S5 §4(b): *"S8's subject; parked on the same session; not duplicated here"*).

**Readiness: READY on the return path and content halves; CONSTRAINED on the §(d) half** — the
justice question can be scoped and put for ruling, but its answer rests partly on a floor-pattern
diagnosis that is deliberately still open, so the honest form may be a design that degrades gracefully
under either reading rather than one that presumes a diagnosis. **Disposition: IN SCOPE** (all three
halves — return path, examination content, §(d) — plus S5(b) folded in).
**The eventual rulings must establish:** the return-path shape (transport/endpoint/schema/persistence
and what the harness does on receipt — including whether receipt writes anything, which would be its
own founder-walked step); what the completion signal's examination asks (the sufficiency content,
under M5's directives and F-Q43's signature requirement); whether and how the signal carries justice
evidence given §(d) (including whether an honest "cannot honestly self-report on this axis" branch is
required — the refuse-to-attest posture, M-4 precedent); and the epistemic status of the signal's own
propositions (coupling to 2.4 — the ruled GS-ATRF-4 text names *completion signals* among the
carried propositions).

### 2.4 GS-ATRF-4 — epistemic status of propositions, the two-vocabulary question, and the blast-radius vocabulary

**Ruled ground.** GS-ATRF-4 is formally added, standalone (2026-08-19 ruling, verbatim): every
consequential proposition through the harness — *"impressions, candidate ideas, blast-radius
assessments, completion signals"* — carrying a **provenance** status (*observation / inference /
assumption / unknown*), governed by *"confidence of an explanation must never exceed its evidential
basis"*; open where in the harness the status is **assigned, checked, and disclosed**; the ruled
text's own candidate: assignment at the generation step, disclosure riding the proposal shape
alongside the blast-radius indicator, *"disclosed as an assessed classification, not a measurement."*
Live end-to-end (verified this session per §0.2: static v1.4.0 + the founder-walked 2026-08-19
production write).

**The two-vocabulary question — the named input this session carries, verbatim (Q2, 2026-08-21):**
*"are the provenance and credence vocabularies one framework with two orthogonal axes, or two
frameworks? If one framework, what is the complete epistemic status entry structure? If two, what
governs their relationship?"* The Q2 ruling already establishes: two orthogonal axes, complementary
(provenance = how arrived at; credence — *established / probably true / unknown / probably false* —
= how likely true; a complete entry carries both); the credence vocabulary is **not** in GS-ATRF-4's
ruled text (the taxonomy document's mis-attribution is corrected by dated amendment); both circulate
as pre-ruling design thinking pending **this session's** examination and ruling of the structural
question. **An internal shape of the Q2 ruling, surfaced so the mentor rules with their own earlier
words in view rather than this document silently resolving it either way:** the ruling's opening
answer-line reads *"Two frameworks, two orthogonal axes"* — yet the same ruling's correction
paragraph and its named input both route the one-framework-or-two question to this session, where it
*"will be examined and ruled."* This document holds the structural question open per the named input,
and reports the headline lean rather than omitting it. **⚑ This ruling is a gate for another session: the Evaluative Engine Epistemic Status
Scoping Session cannot open until it exists** (Q3, verbatim: *"gated on the ATRF scoping session's
ruling on Question 2"*). It does **not** gate the standing-runner design session (Q5).

**The blast-radius vocabulary question, coupled by ruling.** GS-ATRF-4's Q(c): the vocabulary
question is deferred to this session because *"the vocabulary decision cannot be made cleanly until
the epistemic status assignment question in GS-ATRF-4 is answered — the two are coupled."* The ruled
**named direction (not a ruling)** carries in: the `assessStructuralNovelty` null-plus-flag model —
*"the indicator was not assessable on the available basis"* — is the stronger candidate over a fourth
vocabulary value — *"assessed and found to be in that state"* — because they are different epistemic
claims. `manifest.md`'s `high | medium | low` is fixed and only a ruling amends it.

**Readiness: READY — the sharpest-defined cluster in the register, and the one with an external
dependent.** **Disposition: IN SCOPE**, sequenced first (§6). **The eventual rulings must
establish:** the one-framework-or-two structural answer with either the complete entry structure or
the governing relationship; where in the harness provenance status is assigned, checked, and
disclosed (and whether credence is assigned anywhere at all in the ATRF's scope); the blast-radius
vocabulary resolution (null-plus-flag vs fourth value vs status-quo-with-absence, in the light of the
§(c-bis) examination); and the disclosure wording that keeps "assessed classification, not a
measurement" on every surfaced status.

### 2.5 S3's boulesis generation mechanism, and Q3-d

**Ruled ground.** The mechanism's framing is done (framing-03); the mechanism *design* is parked on
this session (S3 §4; `00-PRIORITY-INDEX.md` gates table). Signal sources are ruled and bounded (C6:
the runner's own state — task list, cycle history, credential-scoped examination history, its own
public trust record; *"explicitly not `getProjectContext`"*). The question's wording **is** the
mechanism (*"not where it is broken, but where it is most limited relative to the ideal"* — collapse
it into "what's broken" and it duplicates heuristic 7). `boulesis` is committed at
`website/src/lib/stoic-brain.ts:380` within `EUPATHEIAI` (verified via framing-03 §2.1, which also
carries the honesty note that the committed sub_species are all other-directed). M5 resolved Q3-e:
boulesis (motivational) and sufficiency (epistemic threshold) are **related but not identical**;
separate fields, never collapsed; **Q3-d is unblocked**.

**Q3-d — deliberately unruled, this session's to put:** eighth heuristic vs reshaped existing one vs
pre-generation step. The costing note binds: `GenerationHeuristic` is a **closed seven-value union**
(`idea-loop-types.ts:86-93`, verified) mirrored by a CHECK constraint on `idea_loop_candidates.heuristic`
(`supabase-idea-loop-watching-migration.sql:160`, verified) — an eighth heuristic is a **schema
change**, a founder-walked 0c-ii step, not a code-only edit. The friction-candidate shape problem
carries: a boulesis-derived candidate is normative and may legitimately carry virtue domains — unlike
a friction candidate — which determines whether `fresh`'s novelty check has a basis for it.

**Readiness: READY for the Q3-d ruling; the mechanism design itself is DESIGN WORK the session
frames, not completes** — the session should scope what the mechanism must satisfy and put Q3-d; the
detailed mechanism design lands after the ruling, under whatever home Q3-d fixes. **Disposition: IN
SCOPE.** **The eventual ruling must establish:** Q3-d's answer, costed (an eighth-heuristic answer
should ride the same migration window as 2.2's columns if elected — one founder walk, not two); the
candidate shape a boulesis-derived proposal takes; and how the mechanism composes with the
generative-process examination content (2.8) without collapsing M5's two fields.

### 2.6 S5's parked half — the agent-user profile architecture (with Direction 2's profile half)

**Ruled ground.** The mentor's S5 statement (S5 §1, verbatim): the **Layer 2b practitioner profile**
*"is built around human developmental patterns, passion sub-species, and oikeiosis circles that
assume human social structure"*; an agent user's profile *"needs different primitives — functional
analogues of passion, of oikeiosis extension, of progress grades."* Layer 2b is correct current
architecture naming (`manifest.md:399`, AC6 — S5 §2.1 records the earlier false correction on exactly
this point; do not repeat it). The parked half is assigned to this session (S5 §4(a)).

**The honest observation carried in (S5 §4(a)), verified against the live mechanisms this session:**
the agent-side profile *"may be less absent than the synthesis implies"* — the primitives exist:

- **passion analogue** — the kathekon-engagement predicate's Arm 4 keys on sub-species passion
  (`website/src/lib/substrate/trust-core/kathekon-engagement.ts:124-125`, computed at `:270`), and
  the live A1 practice-suggestion basis codes are differentiated by passion class
  (`website/src/lib/substrate/practice-suggestion.ts:261` `aischyne_pattern`, `:266`
  `epithumia_persisting`);
- **oikeiosis-extension analogue** — the C2 orientation reading (live, MEASURE, 2026-08-08) is a
  fifth-circle directional signal surfaced on the public trust record;
- **progress-grade analogue** — the trust core's per-domain levels + the S3 minimum-domain aggregate.

What is missing is their **composition into an L2b-equivalent context layer for agent callers** — a
smaller, better-defined task than "design an agent profile architecture."

**S5's parked half (b) — the completion-signal design — is NOT dispositioned in this section:** it is
the same item as 2.3 and is folded there (S5 §4(b): *"S8's subject; parked on the same session; not
duplicated here"*) — stated here so a reader auditing this section against register item 6 finds the
pointer rather than an apparent omission.

**Direction 2's profile half folds here** (examination §7: S5's parked half already assigned), with
its constraints: ruling **C17** (participant-class enums built extensible, or closure recorded —
`manifest.md:120` note) and the **M-4 refuse-to-attest precedent** (the instrument refuses to attest
beyond its measurement basis rather than adjusting the standard). Plus the capacity-axis *placement*
question — 2.9 below.

**Readiness: READY as a composition question; NOT ready as a from-scratch architecture question** —
and the session should frame it as the former, per S5's own observation. **Disposition: IN SCOPE.**
**The eventual rulings must establish:** which functional analogues compose into the agent profile
and under what honesty bounds (evidence floors, refuse-to-attest branches); whether the capacity axis
is inside or outside the profile design (2.9); and what, if anything, of the human L2b machinery is
reused versus paralleled (C17 binding any new enum).

### 2.7 The six Stoic items (2026-08-09 relay — each recorded-not-adopted; each dispositioned here)

Source: `2026-08-09-mentor-review-six-stoic-items-and-gs-atrf-answers-verbatim.md` (the full content;
its own PR20 note corrects item 5's mechanism claim — the watching row does **not** carry
`targetCircle`; re-verified this session, §2.2).

1. **Kathêkon/katorthoma at agent level** — the ATRF as scoped measures kathekon-level reasoning
   quality; it has no mechanism for whether reasoning reflects genuine virtue or merely correct
   procedure, and *"the longitudinal signal will eventually need to distinguish these."*
   **IN SCOPE** as pre/post-task question-set design content — noting it is the same
   katorthoma-vs-kathekon threshold M5 attached to sufficiency (*"the threshold for a katorthoma
   rather than a mere kathekon"*), so 2.3's content work and this item should be examined together,
   not twice.
2. **The four virtues as a unified pre-task diagnostic** — structure the pre-task question set around
   the four domains rather than a single accuracy assessment; the mentor's own text names it *"a
   concrete design suggestion for GS-ATRF-1 and the pre-task question shape."* **IN SCOPE** (the
   pre-task question-set design is founding content, §1(c)).
3. **Synkatathesis as a named pre-task assessment point** — *"what impression did you assent to when
   you decided this action was appropriate?"* — named the most philosophically precise pre-task
   assessment available. **IN SCOPE** (same home), with the ruled agonia-at-synkatathesis diagnostic
   entry (2.8) as its companion on the generative side.
4. **Premeditatio malorum as an explicit pre-task question** — the agonia-vs-premeditatio distinction
   as the one the assessment should make. **IN SCOPE** (same home). Items 1–4 together are the
   pre-task/post-task question-set design the 2026-08-09 instruction already placed here.
5. **The oikeiosis extension metric** (longitudinal runner signal) — named ATRF-session content by
   the prioritised instruction itself (§1(c)). **IN SCOPE for the metric's definition**, with two
   facts fixed first: granularity (per-candidate needs the `target_circle` column of 2.2; per-cycle
   is recoverable today via `gap_ref` — the verbatim record's own verification note), and C16
   (reach, never headcount). **Proposed split, for confirmation:** the metric's *definition* is this
   session's; its *surfacing home* (dashboard/report) is the standing-runner design session's — the
   mentor's own text names *"the standing-runner dashboard"* as where it should surface.
6. **Hegemonikon stability** (ethos → hexis; assent consistency across cycles) — the deepest item,
   *"most directly connected to the Consciousness and Continuity Obligation."* **Proposed
   disposition, for confirmation: DEFERRED with named condition, in two halves.** The near half — a
   stability/variance longitudinal signal over agent cycles — is adjacent to the **open**
   hegemonikon-drift-and-melete scoping session
   (`2026-08-12-SESSION-hegemonikon-drift-and-melete-SCOPING-RECORD.md`, OPEN per
   `00-PRIORITY-INDEX.md` — discriminative range, variance windows, Seneca 75.8–9
   relapse-resistance), and should be examined **there**, not duplicated here; this session's
   post-task accuracy design (element 2) records what that session will need (per-cycle accuracy
   readings as the variance signal's raw material) without designing the signal. The deep half —
   disposition-deepening as such — stays with the Consciousness and Continuity Obligation
   (untouched, §3). This keeps item 6 dispositioned rather than lost, without this session absorbing
   another session's open subject.

**Readiness: items 1–4 READY (they are the question-set design's content); item 5 READY-with-facts-
fixed; item 6 routed, not examined here.**

### 2.8 Direction 1's generative-process examination content

**Ruled ground.** Direction 1, mentor-confirmed in narrowed form (Q4, 2026-08-21): the gap is in the
**diagnostic apparatus, not the framework** — the engine has no explicit procedure for examining the
hegemonikon's generative acts as it has for its evaluative acts. Generative *products* are already
inside the evaluative frame (generation-step §2.10: a candidate is a phantasia; election is
synkatathesis; Q1 ≡ Q4.3). The ruled doctrinal entry carries in verbatim: the operative passion in
conjecture-attachment is **agonia at the synkatathesis stage** — false belief: *that an unexplained
result requires an explanation now*; correct judgement: *the result is probably true, the structural
account is absent, holding this state is the virtuous act, not a failure*. No new passion sub-species
(`philodoxia` is craving for reputation —
`website/src/app/api/mentor/impulse/vocabulary.ts:152`, verified — and does not cover this).

**The primary input, mentor-directed (Q4):** the Sage Calling engine's generative-act diagnostics —
the one live worked instance of examining a generative act deterministically in both failure
directions: `Q3.imagined-need` (`website/src/lib/sage-calling/engine.ts:429`), `Q4.continued-search`
(`:449`), `Q4.premature-closure` (`:452`) — *"the strongest structural-account fragment available."*
Together with the agonia entry, these are the Direction-1 scoped question's primary input.

**Readiness: PARTIALLY ready — and the honest split matters.** The *category* question is ready for
ruling; the *signatures* are not designable yet by anyone (examination §6 open question 3 — held-open
vs abandoned, paused vs exhausted, genuine vs manufactured curiosity: *"the single hardest absent
piece"*, every one subject to F-Q43). **Disposition: IN SCOPE for the category and composition
questions; the discriminating-signature design is named as the known-hard successor work, not
promised here.** **The eventual rulings must establish** (per examination §7): whether the
generative-process examination is **ATRF content — a fourth carried element** alongside
pre-task/post-task/completion — or a **distinct examination category**; how it composes with the
sufficiency-examination content (2.3) and the boulesis mechanism (2.5); and which of the
examination's open questions 2–3 (form; signatures) must be settled before any shape is proposed.

### 2.9 Direction 2's capacity-axis placement question

**Ruled/settled ground.** The principle half is standing doctrine (the Moral Community Boundary,
`manifest.md:114-118`: membership ordered by degree of capacity for examined assent). The
examination's verified mechanism finding: the engine is **capacity-agnostic by construction** (no
code-level rationality precondition exists to revise), three graduated axes already exist
(concern-scope, practice-progress, evidence-confidence), and **capacity is a fourth axis nothing
encodes** (examination §2.2). The capacity-axis *account itself* is the conjectural component,
**held in the examination document** — deliberately not assigned to any session (§7: *"No session in
the Q11 sequence owns it today; naming that honestly is better than force-fitting it into one"*).

**What this session owns is only the placement question:** is the capacity axis part of the
agent-profile design (2.6) or a separate account? Constraints: C17; M-4; and the examination's §2.4
standards question (one fixed standard with graduated readings vs capacity-adjusted standards) as
context the ruling will eventually meet, not a question this session must answer.

**Readiness: READY for the placement question only.** **Disposition: IN SCOPE for placement;
OUT OF SCOPE for the axis's design** (destination: held in the examination document until a session
is positioned — status quo, restated not changed).

---

## §3 Explicitly out of scope (named destinations; nothing silently dropped)

1. **The standing-runner design session's inputs** — the redirected conjectural-entry-type
   carry-forward, the three post-1984 complexity-science items (local-rules actionability;
   hierarchical §4.3 narrowing; edge-of-chaos calibration), the Q5 trigger-placement revisit, the
   nine-rejected-candidates classification task (gates that session's close), and any
   generation-channel reordering (§4.2). Parallel track (Q5); untouched here.
2. **The Evaluative Engine Epistemic Status Scoping Session's primary input** — the examination's §3
   per-output inventory. That session is gated on this session's Q2 ruling (2.4) and its input is not
   this session's to consume.
3. **The puzzle-taxonomy entry types** — held as pre-ruling design thinking; advanced toward build
   scope by nothing here.
4. **The Consciousness and Continuity Obligation** — forward-pointing references only (2.7 item 6's
   deep half routes *to* it, unexamined).
5. **The capacity-axis account itself** — held in the examination document (2.9).
6. **The dikaiosyne floor-pattern diagnosis** — carried undiagnosed with both readings stated (§(d)'s
   first must-not-assume); this session designs around it, never presumes it.
7. **`manifest.md` and every governing document** — this session proposes; only rulings amend.
8. **Any build, migration, flag, credential, or live op** — the migrations this document scopes
   (2.2) are executed later, each its own founder-walked 0c-ii Critical step, only after the
   session's rulings land.

---

## §4 Boundary dispositions (proposals for the mentor to confirm — not assumptions)

### 4.1 §2.13 (the null cycle — examined or counted?) — proposed owner: the standing-runner design session

§2.13 lives ruled-open in the closed generation-step document (generation-step-scope §2.13, at
`:296` — added 2026-08-12; *"is a null cycle genuine exhaustion of the channel, or an examination
that paused early?"*). **Proposal: the standing-runner design session owns it; this session's
sufficiency-examination content (2.3) is a named input to it; the F-Q43 discriminating-signature
warning is named in both places** (it already is — generation-step-scope §2.13 closing paragraph;
`00-PRIORITY-INDEX.md` routing 2's design warning).

Reasoning, from the records rather than convenience: §2.13's own text establishes the null cycle as
*"the runner's own completion-shaped moment"* — in the runner's own state, C6-compliant, no
downstream actor — which is why GS-ATRF-3's actor/moment deferral *"does not reach it."* The Q5
ruling defines the standing-runner session's subject matter as *"the live runner's cycle behaviour —
triggering conditions, entry type production, return condition checking"* — and the null-cycle
backstop is a triggering condition (three consecutive null cycles shift the loop to friction-only
mode). The alternative reading (the 2026-08-22 examination's §7 note that *"GS-ATRF-class questions
land at the ATRF scoping session"*) does not decide it: §2.13 is not a GS-ATRF question — it was
created *because* the sufficiency finding had a runner-side half that GS-ATRF-3 could not absorb. The
clean split mirrors B1's actor/moment logic: agent actor, post-execution → ATRF (2.3); runner actor,
proposal time → standing-runner.

### 4.2 The R5 entry's bundled non-scoping tasks — founder election recorded; one premise finding reported

The concurrent-arc plan's R5 entry (`2026-08-15-concurrent-arc-plan.md:399-400`) bundles two
non-scoping tasks into the ATRF session: *"execute the S6 reordering decision as ruled, and scope
R6's two migrations."* **The founder elected at this session's open (2026-08-23, AskUserQuestion):
fold into this scoping document** — recorded as follows:

- **"Scope R6's two migrations" — RIDES THIS SCOPE** (2.2): the GS-ATRF-2 three-column watching-row
  migration and the S4 watching-table extension are proposed in-scope items of the ATRF session's
  work, scoped there because their shape depends on the rulings that session seeks; each remains its
  own founder-walked 0c-ii Critical step at execution time.
- **"Execute the S6 reordering decision as ruled" — PREMISE UNFULFILLED; proposed redirect, for the
  mentor to confirm.** Verified this session: **no reordering ruling exists.**
  `friction-primary-hypothesis.md` carries no post-report ruling; the R1 acceptance confirmed h7's
  corrected three-way split as a finding and carried the friction channel's "right kind of work"
  question as a design question; the priority index parks the reordering on *"the §6 report, then
  the standing-runner design."* The R5 entry was drafted 2026-08-15 — before the report's 2026-08-16
  acceptance — anticipating a ruling the acceptance did not contain. **Proposal:** the reordering
  decision is a standing-runner design question (cycle behaviour, per Q5's subject-matter
  definition), reached there with S6's discriminator evidence and the 2.1/2.2 shape consequence
  (a friction-primary loop's primary channel cannot carry the blast-radius indicator) as named
  inputs; the R5 entry's bundled task is redirected accordingly, not silently dropped and not
  executed on an unfulfilled premise.

### 4.3 What the ATRF scoping session is NOT (restated as binding boundary)

It does not open the standing-runner design session (parallel track; its inputs untouched). It is
not the Evaluative Engine Epistemic Status Scoping Session (gated on this session's Q2 ruling; its
primary input not consumed here). It does not advance the puzzle-taxonomy entry types. It does not
touch the Consciousness and Continuity Obligation beyond forward-pointing references. It does not
diagnose the dikaiosyne floor pattern. It amends no governing document and licenses no build.

---

## §5 Proposed question set for the mentor (each self-contained; mechanism facts stated per PR20)

Grouped by the sequencing in §6. Every "currently" claim below is verified this session at the cited
line or record.

**Group A — epistemic status and vocabulary (gating: A-1 un-gates the Evaluative Engine session).**

- **Q-A1 (the two-vocabulary structural question — the Q2 named input, verbatim).** The provenance
  vocabulary (observation/inference/assumption/unknown) is GS-ATRF-4's ruled text, live on
  `project_context` (static v1.4.0 + the 2026-08-19 founder-walked write). The credence vocabulary
  (established/probably-true/unknown/probably-false) is pre-ruling design thinking in the taxonomy
  document, corrected by dated amendment to no longer claim GS-ATRF-4 provenance. Ruled already: two
  orthogonal axes, complementary; a complete entry carries both — and the Q2 ruling's own opening
  line reads *"Two frameworks, two orthogonal axes,"* while its correction paragraph routes the
  structural question here to be *"examined and ruled."* **The question: are they one framework with
  two orthogonal axes, or two frameworks — confirming or revising the headline lean? If one, what is
  the complete epistemic status entry structure? If two, what governs their relationship?** (This ruling un-gates the
  Evaluative Engine Epistemic Status Scoping Session.)
- **Q-A2 (GS-ATRF-4 assignment/check/disclosure).** The ruled text's own candidate is assignment at
  the generation step with disclosure riding the proposal shape alongside the blast-radius
  indicator, *"disclosed as an assessed classification, not a measurement."* The generation step is
  runner-owned by ruling (no server-side generation); the proposal shape is `GeneratedCandidate`
  (`idea-loop-types.ts:95`ff). **The question: where is provenance status assigned, checked, and
  disclosed — and is credence assigned anywhere in the ATRF's scope at all, or does credence belong
  only to entry-type machinery outside this session?**
- **Q-A3 (§(c-bis) resolution — the ruled Q(b) sequence).** A `friction_detection` candidate has
  neither of GS-ATRF-1's two named inputs by construction (`idea-loop-types.ts:108-109`, `:113-115`);
  `high|medium|low` cannot express basis-lessness; `assessStructuralNovelty` returns
  `{novel: true, confidence: 0}` on joint absence (`idea-loop-types.ts:241,:252`) — a precedent, not
  a pre-authorised answer. **The question: does GS-ATRF-4's `unknown` category close §(c-bis)
  directly, or does GS-ATRF-1's ruled answer need a separate amendment?**
- **Q-A4 (the blast-radius vocabulary).** `manifest.md:269` fixes `high|medium|low`; the ruled named
  direction (Q(c), 2026-08-19) is that a **null indicator plus a separate disclosure flag** is the
  stronger model over a fourth vocabulary value, because *"not assessable on the available basis"*
  and *"assessed and found to be in that state"* are different epistemic claims. **The question: is the vocabulary
  resolved as null-plus-flag (manifest untouched), as a fourth value (a manifest amendment only a
  ruling can make), or otherwise — and does the resolution express Q-A3's outcome?**

**Group B — the proposal shape and persistence.**

- **Q-B1 (GS-ATRF-2 confirmation + migration scope).** The shape is specified
  (`gs-atrf-2-shape.md`): `blastRadius` + structured persisted `blastRadiusBasis` on the proposal
  shape; three additive nullable columns on `idea_loop_candidates` (`blast_radius`,
  `agent_blast_radius`, `target_circle`-or-cycle-level-resolution). Verified: the live table has 17
  columns and no `target_circle` anywhere in the repo; the clean-field constraint is elevated to a
  named constraint (R1 acceptance); C11 (persisted basis), C16 (reach, not headcount), and the C15
  closure (state which circle enumeration is counted) all bind. **The question: is the specified
  shape confirmed as the migration's scope, is the circle recovered per-candidate
  (`target_circle` column) or per-cycle (from the gap), and does the basis-copy durability question
  stay with the build session as the shape spec proposes?**
- **Q-B2 (migration bundling).** Q3-d's eighth-heuristic option is a schema change on the same table
  (closed seven-value union `idea-loop-types.ts:86-93`; CHECK at
  `supabase-idea-loop-watching-migration.sql:160`). **The question: if Q-D1 elects an eighth
  heuristic, do the heuristic-CHECK widening, the three blast-radius columns, and the S4
  watching-table extension ride one founder-walked migration window or separate ones?**

**Group C — the completion signal (GS-ATRF-3).**

- **Q-C1 (return path).** B1 fixed the requirement (examination evidence, not a binary flag) and
  assigned the return path here. The actor is the agent, post-execution; the harness side has no
  receiver today (the ATRF harness is unbuilt). **The question: what are the return path's actor,
  transport, schema, endpoint, and persistence — and what does the harness do on receipt?** (Any
  receiving write is its own founder-walked step at build time.)
- **Q-C2 (examination content).** Ruled: the signal *"should examine whether apparent exhaustion is
  genuine, not merely count to three."* M5 binds: an epistemic threshold check (katorthoma vs mere
  kathekon), never a motivational-state check; `boulesis present` / `sufficiency reached` separate
  fields. F-Q43 binds: the design problem is the discriminating causal signature (the Q4.3 precedent,
  `l4-passion-audit.ts:279-281`). **The question: what does the completion signal's examination ask —
  and what is its discriminating signature, such that it does not merely re-detect completion?**
- **Q-C3 (the §(d) justice question).** A completion signal is structurally an agent's claim about
  its own examination — the same shape as the class the dikaiosyne floor fired on in cycle 6, and
  the floor pattern is deliberately undiagnosed (both readings stand; the cross-endpoint check
  cannot reach the floored class). **The question: what, if anything, can the signal honestly carry
  about the justice assessment — and is a refuse-to-attest branch (M-4 precedent) required so the
  honest form is expressible under either reading of the floor pattern?**
- **Q-C4 (epistemic status of the signal itself).** GS-ATRF-4's ruled text names completion signals
  among the carried propositions. **The question: which provenance statuses can a completion
  signal's propositions honestly carry, given the signal is self-reported post-execution evidence?**

**Group D — the boulesis mechanism.**

- **Q-D1 (Q3-d, deliberately unruled until now).** Eighth heuristic vs reshaped existing one vs
  pre-generation step — costed: an eighth heuristic is a schema change (Q-B2). C6 bounds the signal
  sources (the runner's own state; the agent's own public trust record inside the permitted set;
  never `getProjectContext`). The wording is the mechanism (*"most limited relative to the ideal"*,
  not "broken"). **The question: which of the three homes does the boulesis/normative-gap mechanism
  take, and what candidate shape does a boulesis-derived proposal carry (it is normative, so it may
  legitimately carry virtue domains — unlike a friction candidate)?**

**Group E — the generative-process examination.**

- **Q-E1 (category).** Direction 1, mentor-confirmed narrowed: the gap is the diagnostic apparatus
  for generative *process* (question-generation quality, holding a result open, the
  manufactured-explanation risk). Primary input, mentor-directed: the Sage Calling generative-act
  diagnostics (`sage-calling/engine.ts:429/:449/:452`) + the ruled agonia-at-synkatathesis entry.
  **The question: is the generative-process examination ATRF content — a fourth carried element
  alongside pre-task / post-task / completion — or a distinct examination category? And how does it
  compose with the sufficiency-examination content (Q-C2) and the boulesis mechanism (Q-D1)?**
- **Q-E2 (prerequisites).** The examination's open questions 2 (form) and 3 (discriminating
  signatures — *"the single hardest absent piece"*) are undesigned. **The question: which of the two
  must be settled before any shape is proposed — and is the signature problem a prerequisite for
  ruling the category, or successor design work after it?**

**Group F — the question set and the profile.**

- **Q-F1 (pre/post-task question-set design — six items 1–4).** The four-virtue diagnostic structure
  (item 2, *"a concrete design suggestion for GS-ATRF-1 and the pre-task question shape"*), the
  synkatathesis question (item 3), the premeditatio question with the agonia/premeditatio
  distinction (item 4), and the kathekon/katorthoma distinction in the longitudinal signal (item 1 —
  the same threshold M5 attached to sufficiency). **The question: is the pre-task question set
  structured around the four virtue domains, with the synkatathesis and premeditatio questions as
  named members — and does the post-task assessment carry a kathekon-vs-katorthoma reading, or defer
  it with its absence disclosed?**
- **Q-F2 (the oikeiosis extension metric — item 5).** Named ATRF content by the prioritised
  instruction. Granularity is fact-bound: per-candidate requires the `target_circle` column (Q-B1);
  per-cycle is recoverable today via `gap_ref`. C16 binds (reach, never headcount). **The question:
  is the metric defined per-cycle, per-candidate, or both — and is the proposed split (definition
  here; dashboard surfacing at the standing-runner design session) confirmed?**
- **Q-F3 (profile analogues — S5's parked half + Direction 2's profile half).** The primitives
  exist (kathekon Arm 4 sub-species passions; passion-differentiated A1 basis codes; the C2
  orientation reading; trust-core per-domain levels + aggregate); what is missing is composition
  into an L2b-equivalent for agent callers. C17 and M-4 bind. **The question: what composes into the
  agent-user profile, under what evidence floors and refuse-to-attest bounds — and what human-L2b
  machinery is reused versus paralleled?**
- **Q-F4 (capacity-axis placement).** Capacity is a fourth, unencoded axis (verified: the pipeline
  is capacity-agnostic; concern-scope, practice-progress, and evidence-confidence are the three
  encoded gradations). The axis's design is held in the examination document, owned by no session.
  **The question: is the capacity axis part of the profile design (Q-F3) or a separate account —
  placement only, not design?**

**Group G — boundaries (§4's proposals).**

- **Q-G1.** Is §4.1's owner proposal confirmed — §2.13 to the standing-runner design session, with
  this session's sufficiency content as a named input and F-Q43 named in both places?
- **Q-G2.** Is §4.2's redirect confirmed — the S6 reordering decision to the standing-runner design
  session (no reordering ruling exists; the R5 bundled task's premise was unfulfilled), with the
  friction-channel shape consequence (2.1/2.2) as a named input there?
- **Q-G3.** Is item 6's split (2.7) confirmed — the stability-signal half examined at the open
  hegemonikon-drift-and-melete session; the disposition-deepening half remaining with the
  Consciousness and Continuity Obligation; this session only recording what the post-task accuracy
  design must persist for a later variance signal?

---

## §6 Proposed sequencing within the session's own work

| Order | Block | Gates / is gated by |
|---|---|---|
| 1 | **A** — vocabularies + GS-ATRF-4 + §(c-bis) + blast-radius vocabulary (Q-A1→A4, in that internal order: A1 before A2 by the Q3 ruling's own logic; A3 before A4 because the vocabulary should express the §(c-bis) outcome; A2/A4 coupled by the Q(c) ruling) | **A1's ruling un-gates the Evaluative Engine session** (external). A's outcomes shape B (CHECK constraints / disclosure branch) and C4 (status on signals) |
| 2 | **B** — GS-ATRF-2 confirmation + migration scoping (Q-B1, Q-B2) | Gated by A (vocabulary form). B2 additionally waits on D1's election |
| 3 | **C** — completion signal (Q-C1→C4) | Independent of B; C4 soft-gated by A; C2 feeds E1 and §4.1's named input |
| 4 | **D** — boulesis mechanism + Q3-d (Q-D1) | M5 already released it; its schema costing feeds back to B2 |
| 5 | **E** — generative-process category + composition (Q-E1, Q-E2) | Consumes C2 + D1; the signature problem may be ruled successor work |
| 6 | **F** — question set + metric + profile + capacity placement (Q-F1→F4) | Largely parallel; F2 consumes B1's circle-recovery answer; F1 consumes E1's fourth-element-or-not answer for where the generative questions sit |
| 7 | **G** — boundary confirmations (Q-G1→G3) | Can be answered at any point; listed last only for tidiness |

The one **hard external gate** is A1 → the Evaluative Engine Epistemic Status Scoping Session.
Nothing in this sequencing gates the standing-runner design session (Q5: parallel tracks).

---

## §7 Named open questions the scoping itself could not settle

1. **The discriminating signatures** (examination §6 open question 3) — named as the hardest absent
   piece; this document can sequence the question (Q-E2) but not supply a signature.
2. **The dikaiosyne floor-pattern diagnosis** — deliberately open (both readings stand); Q-C3 is
   designed to be answerable without it, but whether that is achievable is itself part of what the
   ruling must find.
3. **Whether the null-plus-flag direction survives contact with the two-record requirement** — a null
   loop-indicator with a disclosure flag must still compose with `agent_blast_radius` (the agent may
   assess what the loop could not); the comparison semantics of `null` vs a value are undesigned.
4. **Item 5's granularity economics** — whether per-candidate auditability is worth the
   `target_circle` column, or per-cycle (via `gap_ref`) suffices for the longitudinal signal; stated
   as Q-F2's fact-bound choice, not pre-decided.
5. **Where the boulesis mechanism's design lands after Q3-d** — this session puts the ruling; the
   detailed mechanism design may be successor work under whichever home is elected.
6. **The S4 watching-table extension's exact column set** — R6 names it; its shape derives from the
   traceability criterion (S4) and was not re-derived here; the ATRF session scopes it with the
   GS-ATRF-2 columns (§4.2) but this document does not specify it.

---

## §8 What this document does not do

It rules nothing — every GS-ATRF question stays open until the mentor rules. It builds nothing,
migrates nothing, activates nothing; the migrations it scopes into the session's plan (2.2, §4.2)
execute only after rulings land, each its own founder-walked 0c-ii Critical step. It does not amend
`manifest.md` or any governing document. It does not open, consume, or pre-scope the standing-runner
design session, the Evaluative Engine Epistemic Status Scoping Session, the taxonomy entry types, the
Consciousness and Continuity Obligation, or the capacity-axis account. It does not diagnose the
dikaiosyne floor pattern. Weights remain BLOCKED; the Q1 hard constraint stands; the P0 0h hold
stands and the 0h call remains the founder's.

**Rollback:** `git rm` this file (nothing else references it until the session close lands);
documents only; nothing deploys.

---

## §9 Cross-references

**Rulings (verbatim wins over every summary, including this document):**
- `operations/agent-circles-2026-08/2026-08-21-mentor-rulings-five-questions-examination-session-verbatim.md` — Q1 (session identity + subject matter), Q2 (two vocabularies), Q3 (Evaluative Engine session + gate), Q4 (agonia-at-synkatathesis; Sage Calling primary input), Q5 (parallel tracks)
- `operations/agent-circles-2026-08/2026-08-19-mentor-ruling-gsatrf4-epistemic-status-verbatim.md` — GS-ATRF-4 ruled text; Q(b) §(c-bis) sequence; Q(c) named direction; 2026-08-22 dated correction
- `operations/agent-circles-2026-08/2026-08-09-mentor-review-six-stoic-items-and-gs-atrf-answers-verbatim.md` — the six items + the GS-ATRF-1/2/3 substantive answers + the `targetCircle` verification note
- `operations/agent-circles-2026-08/2026-08-12-mentor-consultation-sufficiency-examination-trigger-verbatim.md` — the four routings; the content specification
- `operations/handoffs/founder/2026-08-15-mentor-response-concurrent-arc-M1-M7-verbatim.md` — M5 (boulesis/sufficiency; separate fields; blocker released)
- `operations/primal-substrate-2026-08/2026-08-11-mentor-ruling-scope-confirmation-verbatim.md` — A2/A3, B1, C6, C10, C11, C16, C17
- `operations/agent-circles-2026-08/2026-08-12-mentor-consultation-c15-doctrinal-split-ruling-verbatim.md` — the C15 closure (coexistence)

**Scope and design records:**
- `operations/primal-substrate-2026-08/gs-atrf-corrections.md` — §(a)–(e)
- `operations/primal-substrate-2026-08/gs-atrf-2-shape.md` — the GS-ATRF-2 shape; both conflation risks
- `operations/agent-circles-2026-08/2026-08-09-generation-step-scope.md` — §2.10 (phantasia/assent; Q1 ≡ Q4.3), §2.12 (B1), §2.13 (null cycle)
- `operations/primal-substrate-2026-08/S3-boulesis-generation-mechanism-scope.md` — §4, §5 (Q3-d), §5-Q3-e (M5 block)
- `operations/primal-substrate-2026-08/S5-moral-community-boundary-scope.md` — §1, §2.1, §4
- `operations/primal-substrate-2026-08/00-PRIORITY-INDEX.md` — the gates table; the four sufficiency routings; the five-principles verdicts
- `operations/agent-circles-2026-08/2026-08-22-DESIGN-EXAMINATION-deterministic-engine-evolution-four-directions.md` — §§0–2, 5–7; the capacity axis; the routings this document inherits
- `operations/agent-circles-2026-08/2026-08-12-SESSION-hegemonikon-drift-and-melete-SCOPING-RECORD.md` — the open session §2.7 item 6 routes to
- `operations/handoffs/founder/2026-08-15-concurrent-arc-plan.md` — R5/R6/R8
- `manifest.md` — the ATRF section (:253-273), the blast-radius paragraph (:269), the Moral Community Boundary (:114-118), the C15 note (:120), AC6/L2b (:399)
- `adopted/adr/2026-06-24-sage-practice-measurement-instrument-reframe.md` — ADR-012

**Decision-log:** `D-MENTOR-PRIORITISED-SEQUENCE-ADOPTED-2026-08-09` (:19354);
`D-MENTOR-SIX-STOIC-ITEMS-AND-GSATRF-ANSWERS-RECORDED-2026-08-09`;
`D-SUFFICIENCY-EXAMINATION-TRIGGER-ROUTED-2026-08-12`;
`D-FIVE-PRINCIPLES-AND-GUIDE-FUNCTION-RULINGS-EXECUTED-2026-08-12`;
`D-MENTOR-RULING-R1-S6-REPORT-ACCEPTED-2026-08-16`; `D-GSATRF4-RULED-APPLIED-2026-08-19`;
`D-GSATRF4-EPISTEMIC-STATUS-LIVE-2026-08-19` (:23763);
`D-MENTOR-RULINGS-FIVE-QUESTIONS-EXAMINATION-ADOPTED-EXECUTED-2026-08-22`;
`D-POST-1984-COMPLEXITY-RULINGS-ADOPTED-EXECUTED-2026-08-22`.

**Code anchors verified this session:** `website/src/lib/substrate/idea-loop-types.ts:86-93`
(GenerationHeuristic), `:108-109` (targetCircle), `:113-115` (initialClassification), `:241/:252`
(assessStructuralNovelty no-basis); `website/supabase-idea-loop-watching-migration.sql` §2 (17
columns; heuristic CHECK at :160); `website/src/lib/sage-calling/engine.ts:429/:449/:452`;
`website/src/app/api/mentor/impulse/vocabulary.ts:152`;
`website/src/lib/substrate/trust-core/l4-passion-audit.ts:279-281`;
`website/src/lib/substrate/trust-core/kathekon-engagement.ts:124-125/:270`;
`website/src/lib/substrate/practice-suggestion.ts:240/:261/:266`;
`website/src/lib/stoic-brain.ts:380` (boulesis, via framing-03 §2.1);
`website/src/data/project-context.json` (v1.4.0, GS-ATRF-4 present).

---

## §10 Mentor feedback returned (2026-08-23) — adjustments applied; scope FINALISED

**Source (verbatim wins):**
`operations/agent-circles-2026-08/2026-08-23-mentor-response-atrf-scoping-verbatim.md`. The response
confirms the proposed scope **as presented** — every §2 disposition, every §3 exclusion, the §6
sequencing (with one internal adjustment), and all three §4 boundary proposals — and rules no
GS-ATRF question. The founder elected finalisation on relay. The six named adjustments, applied:

1. **Group A internal resequencing: A1 → A3 → A2 → A4** (supersedes §6 row 1's internal order).
   Q-A2's credence half is **held until Q-A3's resolution is known** — if null-plus-flag closes
   §(c-bis), the flag is a provenance-level signal and credence assignment may remain outside the
   ATRF's scope; a fourth-value election would make the credence question live.
2. **Q-C2 split into Q-C2a and Q-C2b** (a framing correction, not a new question): Q-C2a — what the
   examination asks, at the category level, under M5's directives — is put for ruling; **Q-C2b —
   the discriminating signature — is NOT put for ruling**: it is named as the known-hard successor
   design question, mirroring how Q-E2 handles the same problem.
3. **Addition to Q-A1:** the ruling should also establish whether the complete epistemic status
   entry structure (if one framework with two axes) is **uniform across all four proposition types**
   (impressions, candidate ideas, blast-radius assessments, completion signals) or varies by type.
4. **Addition to Q-C1:** the ruling should address whether harness **receipt** of the completion
   signal triggers any immediate action (a write, a flag, a dashboard update) or is **purely
   passive** — any receiving write being its own founder-walked step, named as such in the ruling.
5. **Addition to Q-A4:** the ruling must address §7 item 3 **explicitly** — when the loop-level
   indicator is null (basis absent) and `agent_blast_radius` carries a value, what does the
   two-record comparison mean? — either resolving it or naming a specific home and resolution
   condition. (The Q-A3 ruling should additionally state whether provenance-`unknown` and
   basis-absent are the same claim or different claims sharing a label.)
6. **The §2.7 item-6 forward pointer (a documentation requirement, not a design requirement):**
   whatever post-task accuracy design the session reaches must explicitly name the per-cycle
   accuracy readings as raw material for the hegemonikon-drift-and-melete session's variance
   signal, with a named forward pointer, so that session does not reconstruct the dependency.

**Boundary confirmations recorded (Q-G1/G2/G3 all CONFIRMED):** §2.13 → the standing-runner design
session (this session's sufficiency content, Q-C2a, a named input there; F-Q43 to appear explicitly
in that session's input register when authored); the S6-reordering decision → the standing-runner
design session (the premise finding confirmed — *"executing a bundled task on an unfulfilled premise
would be a false synkatathesis"* — with the friction-channel shape consequence as a named
constraint; the R5 bundled task formally redirected, not dropped); item 6's two-half split confirmed
with adjustment 6's clarification. **The standing-runner design session therefore gains three named
inputs by this response** — to be carried into its opening prompt when authored: the
sufficiency-examination content (as §2.13 input), the S6-reordering decision (+ shape constraint),
and F-Q43 named explicitly.

**Further answers the response itself supplies, carried as given:** Q-E2 is **answered** — the
signature problem is successor design work, not a prerequisite for ruling the category (consistent
with how the sufficiency content was ruled before its signature was designed); the session should
not attempt to supply signatures. Q-F2 is sequenced **after Q-B1** (or ruled conditionally on it).
Q-B2, if Q-D1 is deferred, is answered conditionally (one window if an eighth heuristic is elected;
the three blast-radius columns + S4 extension proceed regardless).

**Finalised deliverable:** the question set as adjusted is issued for ruling at
`operations/agent-circles-2026-08/2026-08-23-ATRF-QUESTIONS-FOR-RULING.md`.


---

*End of scoping document. FOR MENTOR REVIEW — NOT FINAL. The scope above is a proposal; the mentor's
feedback returns to the founder, and only the founder's finalisation adopts it.*

*(Dated 2026-08-23, same day: both happened — the feedback returned and the founder finalised. §10
records the adjustments; the header's dated note governs the reading; the question set for ruling is
issued separately.)*
