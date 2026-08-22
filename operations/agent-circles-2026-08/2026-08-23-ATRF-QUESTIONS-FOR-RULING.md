# ATRF Scoping Session — finalised question set (FOR RULING)

> **✅ ANSWERED 2026-08-23 — all sixteen questions RULED, same day.** Verbatim record, which wins
> over this document and every summary:
> `operations/agent-circles-2026-08/2026-08-23-mentor-rulings-atrf-sixteen-questions-verbatim.md`
> (`D-MENTOR-RULINGS-ATRF-SIXTEEN-ADOPTED-EXECUTED-2026-08-23`). Headlines: Q-A1 one framework,
> two orthogonal axes — **the Evaluative Engine Epistemic Status Scoping Session is un-gated**;
> Q-A3 `unknown` closes §(c-bis); Q-A4 null-plus-flag; Q-B1 `target_circle` elected; Q-D1
> pre-generation step; Q-E1 distinct category, home = the Sage Calling engine's apparatus, manifest
> unamended; Q-C3 refuse-to-attest REQUIRED; Q-F4 capacity axis outside the profile. No build is
> licensed by the rulings; every migration remains founder-walked 0c-ii.

**FOR RULING.** This is the ATRF scoping session's finalised question set — the scope confirmed by
the mentor's 2026-08-23 response
(`2026-08-23-mentor-response-atrf-scoping-verbatim.md`, verbatim wins) with all six named
adjustments applied, finalised by the founder the same day. **Sixteen questions are put for ruling,
in the finalised order. The mentor rules; nothing here pre-answers.** No build, migration, flag,
credential, or schema is licensed by this document or by the rulings it requests — every eventual
migration remains its own founder-walked 0c-ii Critical step after the rulings land.

**PR20:** every mechanism fact below was verified 2026-08-23 at HEAD `6dcbe09` (full citations and
context in the scoping document,
`2026-08-23-ATRF-SCOPING-DOCUMENT-FOR-MENTOR-REVIEW.md`, §2 and §9 — which the mentor has read;
facts are restated here compactly, not re-argued). Drafted and issued the same day as verification;
if relay is delayed, the relaying session re-timestamp-checks per the PR20 amendment.

**Standing constraints:** weights BLOCKED; the Q1 hard constraint (the loop proposes; it never
executes); the P0 0h hold; ADR-012 (measurement, never enforcement); the dikaiosyne floor-pattern
diagnosis deliberately open — no question below presumes it.

---

## Group A — Epistemic status and vocabulary (order per the 2026-08-23 adjustment: A1 → A3 → A2 → A4)

**Q-A1 — The two-vocabulary structural question.** The provenance vocabulary
(observation/inference/assumption/unknown) is GS-ATRF-4's ruled text, live end-to-end
(`project-context.json` v1.4.0 + the 2026-08-19 founder-walked production write). The credence
vocabulary (established/probably-true/unknown/probably-false) is pre-ruling design thinking in the
taxonomy document, corrected by dated amendment to no longer claim GS-ATRF-4 provenance. The Q2
ruling (2026-08-21) establishes two orthogonal, complementary axes — its opening line reads *"Two
frameworks, two orthogonal axes"* — while routing the structural question here to be *"examined and
ruled."*
**For ruling:** are the provenance and credence vocabularies one framework with two orthogonal axes,
or two frameworks — confirming or revising the headline lean? If one framework, what is the complete
epistemic status entry structure — **and is that structure uniform across all four proposition types
GS-ATRF-4's ruled text names (impressions, candidate ideas, blast-radius assessments, completion
signals), or do different proposition types carry different axis combinations?** If two frameworks,
what governs their relationship?
*(This ruling un-gates the Evaluative Engine Epistemic Status Scoping Session — the one hard
external gate in this set.)*

**Q-A3 — The §(c-bis) resolution (the ruled Q(b) sequence).** A `friction_detection` candidate has
neither of GS-ATRF-1's two named inputs by construction (`idea-loop-types.ts:108-109` — targetCircle
ABSENT; `:113-115` — `{ kind: 'preferred_indifferent' }`); the fixed `high|medium|low` vocabulary
cannot express basis-lessness; `assessStructuralNovelty` returns `{ novel: true, confidence: 0 }` on
joint absence (`idea-loop-types.ts:241/:252`) — a precedent, not a pre-authorised answer.
**For ruling:** does GS-ATRF-4's `unknown` category close §(c-bis) directly, or does GS-ATRF-1's
ruled answer need a separate amendment? **The ruling should also state whether `unknown` in the
provenance vocabulary means the same thing as basis-absent in the blast-radius context, or whether
they are different claims sharing a label** — aware of (though not required to resolve) the
null-vs-value comparison question Q-A4 carries.

**Q-A2 — GS-ATRF-4 assignment, check, disclosure.** The ruled text's own candidate: assignment at
the generation step (runner-owned by ruling — no server-side generation), disclosure riding the
proposal shape (`GeneratedCandidate`, `idea-loop-types.ts:95`) alongside the blast-radius indicator,
*"disclosed as an assessed classification, not a measurement."*
**For ruling:** where in the harness is provenance status assigned, checked, and disclosed? **The
credence half — whether credence is assigned anywhere in the ATRF's scope at all, or belongs only
to entry-type machinery outside this session's scope — is held until Q-A3's resolution is known** (per the 2026-08-23 adjustment: a null-plus-flag outcome is a
provenance-level signal and credence may remain outside the ATRF's scope; a fourth-value election
makes the credence question live).

**Q-A4 — The blast-radius vocabulary.** `manifest.md:269` fixes `high|medium|low` (only a ruling
amends it). The ruled named direction (Q(c), 2026-08-19): a **null indicator plus a separate
disclosure flag** is the stronger model over a fourth vocabulary value — *"not assessable on the
available basis"* and *"assessed and found to be in that state"* are different epistemic claims.
**For ruling:** is the vocabulary resolved as null-plus-flag (manifest untouched), as a fourth value
(a manifest amendment by ruling), or otherwise — expressing Q-A3's outcome? **The ruling must
explicitly address the composition question: when the loop-level indicator is null (basis absent)
and `agent_blast_radius` carries a value — the agent may assess what the loop could not — what does
the two-record comparison mean?** The comparison is the longitudinal signal itself
(`manifest.md:269`); if one record is null and the other a value, the comparison semantics must be
defined before the signal has meaning. Resolve it, or name a specific home and a specific condition
for its resolution.

## Group B — Proposal shape and persistence

**Q-B1 — GS-ATRF-2 confirmation + migration scope.** The shape is specified (`gs-atrf-2-shape.md`):
`blastRadius` + structured persisted `blastRadiusBasis` on the proposal shape (C11 — persisted at
computation time, never re-derived); three additive nullable columns on `idea_loop_candidates`
(`blast_radius`, `agent_blast_radius`, circle recovery). Verified: the live table has 17 columns and
no `target_circle` anywhere in the repo. The clean-field constraint is elevated to *"a named
constraint, not a preference"* (R1 acceptance); C16 (reach, never headcount) and the C15 closure
(state which circle enumeration is counted) bind.
**For ruling:** is the specified shape confirmed as the migration's scope? **The circle-recovery
question — a `target_circle` column versus per-cycle recovery via `gap_ref` — is a named choice with
its auditability consequence to be treated as a design constraint, not a preference:** without
`target_circle`, a persisted `high` is not auditable, because the dikaiosyne dimension's input is
unrecoverable from the row. And does the basis-copy durability question stay with the build session,
as the shape specification proposes?

**Q-B2 — Migration bundling.** Q3-d's eighth-heuristic option is a schema change on the same table
(closed seven-value union `idea-loop-types.ts:86-93`; CHECK at
`supabase-idea-loop-watching-migration.sql:160`).
**For ruling:** do the heuristic-CHECK widening (if Q-D1 elects an eighth heuristic), the three
blast-radius columns, and the S4 watching-table extension ride one founder-walked migration window
or separate ones? Per the 2026-08-23 feedback, this may be answered **conditionally on Q-D1's
election**: one window if an eighth heuristic is elected; the three blast-radius columns and the S4
extension proceed regardless. The S4 extension is named as a bundled migration item **without
specifying its column set** — that specification belongs to the build session, where the
traceability criterion applies to the shape these rulings produce.

## Group C — The completion signal (GS-ATRF-3)

**Q-C1 — The return path.** B1 (2026-08-11) fixed the requirement — examination evidence, never a
binary flag (*"the primary post-execution evidence of whether genuine examination occurred rather
than simulation"*) — and assigned the return path to this session. The actor is the agent,
post-execution; no harness receiver exists today (the ATRF harness is unbuilt).
**For ruling:** the return path's actor, transport, schema, endpoint, and persistence, established
at the level of **named components** (implementation detail belongs to the build session) — **and
whether harness receipt triggers any immediate action (a write, a flag, a dashboard update) or is
purely passive (logged and available for longitudinal comparison).** Any receiving write is its own
founder-walked step and should be named as such in the ruling.

**Q-C2a — The examination content (category level).** Ruled content (2026-08-12): the signal
*"should examine whether apparent exhaustion is genuine, not merely count to three."* The M5
directives bind and should be explicitly confirmed in the ruling: an **epistemic threshold check,
not a motivational-state check** (katorthoma vs mere kathekon); if both conditions are carried,
**`boulesis present` and `sufficiency reached` are separate fields, never collapsed.**
**For ruling:** what does the completion signal's examination ask, at the category level, under
M5's directives? **The discriminating signature (Q-C2b) is NOT put for ruling** — it is the
known-hard successor design work (the F-Q43 lesson: detecting apparent completion is free and
worthless; the Q4.3 precedent, `l4-passion-audit.ts:279-281`, became useful only when narrowed to
causal order). The ruling should name Q-C2b's specific home.

**Q-C3 — The §(d) justice question.** A completion signal is structurally an agent's claim about the
quality of its own examination — the same shape as the class the dikaiosyne floor fired on in cycle
6, and the floor pattern is deliberately undiagnosed (both readings stand; per Q4-e the
cross-endpoint check cannot reach the floored class). The ruling should be achievable **without**
diagnosing the floor pattern.
**For ruling:** what, if anything, can the signal honestly carry about the justice assessment —
**and is the refuse-to-attest branch (M-4 precedent) REQUIRED (a design constraint, named in the
completion signal's schema) or optional (a design choice)?** If required, it is named now, not left
to the build session to discover.

**Q-C4 — Epistemic status of the signal's own propositions.** GS-ATRF-4's ruled text names
completion signals among the carried propositions; the signal is self-reported post-execution
evidence.
**For ruling (after Q-A1, per the finalised order):** which provenance statuses can a completion
signal's propositions honestly carry?

## Group D — The boulesis mechanism

**Q-D1 — Q3-d, deliberately unruled until now.** Costed: an eighth heuristic is a schema change
(the closed union + CHECK above), a founder-walked 0c-ii step. C6 bounds the signal sources (the
runner's own state — task list, cycle history, credential-scoped examination history, its own public
trust record; *"explicitly not `getProjectContext`"*). The question's wording is the mechanism
(*"most limited relative to the ideal"*, never "broken" — else it duplicates heuristic 7).
**For ruling:** eighth heuristic, reshaped existing one, or pre-generation step — **with all three
options' consequences named** (eighth heuristic: schema change, one migration window, candidate
carries virtue domains; reshaped: which heuristic, what reshaping, what the candidate carries;
pre-generation step: what it means architecturally, how it composes with the generation step's
structure). **The ruling should explicitly confirm the normative-candidate distinction** — a
boulesis-derived candidate may legitimately carry virtue domains, unlike a friction candidate —
because it has downstream consequences for the blast-radius proxy's basis.

## Group E — The generative-process examination

**Q-E1 — Category and composition.** Direction 1, mentor-confirmed narrowed (Q4, 2026-08-21): the
gap is the diagnostic apparatus for the generative *process*. Primary inputs, mentor-directed: the
Sage Calling generative-act diagnostics (`sage-calling/engine.ts:429/:449/:452` —
imagined-need / continued-search / premature-closure) and the ruled agonia-at-synkatathesis
diagnostic entry.
**For ruling:** is the generative-process examination **ATRF content — a fourth carried element**
alongside pre-task / post-task / completion signal (in which case the manifest's ATRF section would
need amendment **by ruling**) — or a **distinct examination category** (in which case its home is
named and its relationship to the ATRF characterised)? **Neither option left implicit.** And how
does it compose with the sufficiency-examination content (Q-C2a) and the boulesis mechanism (Q-D1)?
*(Q-E2 — whether the signature problem gates this ruling — is already answered by the 2026-08-23
feedback: signatures are successor design work, not a prerequisite; the category is ruled at the
level of what the examination is for and where it lives. Carried as given; no ruling requested.)*

## Group F — The question set, the metric, the profile, the capacity placement

**Q-F1 — The pre/post-task question-set design (six items 1–4).** The four-virtue diagnostic
structure (item 2 — *"a concrete design suggestion for GS-ATRF-1 and the pre-task question
shape"*); the synkatathesis question (item 3 — *"what impression did you assent to…"*); the
premeditatio question with the agonia/premeditatio distinction (item 4); the kathekon/katorthoma
distinction in the longitudinal signal (item 1).
**For ruling:** is the pre-task question set structured around the four virtue domains, with the
synkatathesis and premeditatio questions as named members and the agonia/premeditatio distinction as
the one the assessment makes? **The kathekon/katorthoma question for the post-task assessment is
ruled explicitly** — either the post-task assessment carries a kathekon-vs-katorthoma reading, or it
defers with the absence disclosed. The M5 separate-fields directive is confirmed as applying to the
post-task assessment's structure. **Documentation requirement carried (2026-08-23 adjustment 6):**
whatever post-task accuracy design results must explicitly name the per-cycle accuracy readings as
raw material for the hegemonikon-drift-and-melete session's variance signal, with a named forward
pointer.

**Q-F2 — The oikeiosis extension metric (item 5; sequenced after Q-B1 per the feedback).** Named
ATRF content by the 2026-08-09 prioritised instruction. Granularity is fact-bound: per-candidate
requires the `target_circle` column (Q-B1's choice); per-cycle is recoverable today via `gap_ref`.
C16 binds (reach, never headcount).
**For ruling (conditional on Q-B1's outcome):** is the metric defined per-cycle, per-candidate, or
both? The split — definition here; dashboard surfacing at the standing-runner design session — is
already confirmed.

**Q-F3 — The agent-user profile composition (S5's parked half + Direction 2's profile half).** The
primitives exist (kathekon Arm 4 sub-species passions, `kathekon-engagement.ts:124-125/:270`;
passion-differentiated A1 basis codes, `practice-suggestion.ts:261/:266`; the C2 orientation
reading, live; trust-core per-domain levels + aggregate); what is missing is their **composition
into an L2b-equivalent context layer** for agent callers (S5 §4(a)'s honest observation).
**For ruling:** which primitives compose, and under what honesty bounds (evidence floors,
refuse-to-attest branches) — and, at scope level, what human-L2b machinery is reused versus
paralleled — **with C17 (extensible participant-class enums) and M-4 (refuse-to-attest) explicitly
confirmed as binding constraints. The ruling establishes the scope of what composes and the
governing constraints; it does not design the composition — that is build work.**

**Q-F4 — The capacity-axis placement (binary; no design content).** Capacity is a fourth, unencoded
axis (the pipeline is capacity-agnostic; concern-scope, practice-progress, and evidence-confidence
are the three encoded gradations); the axis's design is held in the examination document, owned by
no session.
**For ruling:** is the capacity axis inside the profile design (Q-F3 carries it as a named axis) or
outside (it remains held in the examination document, status unchanged)?

---

## Already confirmed — not re-put

The three boundary proposals (Q-G1: §2.13 → the standing-runner design session; Q-G2: the
S6-reordering redirect; Q-G3: item 6's two-half split with the forward-pointer clarification) and
every §3 exclusion were **confirmed in the 2026-08-23 response** and are recorded in the scoping
document's §10. The standing-runner design session's three named inputs from that response (the
sufficiency content as §2.13 input; the S6-reordering decision with the friction-channel shape
constraint; F-Q43 named explicitly) are carried there for its opening prompt.

## What these rulings do not license

No build, migration, flag, credential, schema, or live op — each eventual migration (the
three-column watching-row migration, the S4 extension, any eighth-heuristic CHECK widening) is its
own founder-walked 0c-ii Critical step after the rulings land. No governing document changes except
where a ruling itself elects one (Q-A4's fourth-value branch; Q-E1's fourth-element branch — both
named as ruling-only). Weights BLOCKED; the Q1 hard constraint stands; the 0h call remains the
founder's.

---

*End of question set. Sixteen questions for ruling, in the finalised order A1 → A3 → A2 → A4 → B1 → B2
→ C1 → C2a → C3 → C4 → D1 → E1 → F1 → F2 → F3 → F4; Q-C2b and the signature problem named as
successor design work; Q-E2 answered by the feedback; Group G confirmed. Verbatim wins over every
summary; the mentor rules.*
