# MENTOR QUESTIONS — Cognitive OS integration into SageReasoning

**Raised 2026-09-08 AEST (`date`) = 2026-09-08 UTC, before any code, any gap analysis, and any
build.** Sources read in full: `inbox/mentor cognitive os instructions.rtf` (the governing
instruction) and `inbox/full clean claude handoff env research.rtf` (the specification). **Nothing
has been built, scoped, or decided.** No file was modified outside this directory. The observation
window ran untouched; the byte-identity guard is armed and green (250/0); both SHA pins unchanged.

**Why these are asked before Step 1 rather than inside it.** The instruction's own closing clause —
*"If any instruction in this document conflicts with the specification, flag the conflict explicitly
and do not resolve it unilaterally… The founder is the decision authority on all governance
questions. Route them, do not decide them."* Several of the items below are conflicts between the
instruction and **standing project rulings the instruction could not have had in front of it**. They
are routed, not resolved.

**Each claim below about the current codebase names the check I actually ran today**, rather than
being carried from a summary. Stated as an act, not a result: I ran these checks and report what they
returned. Where a claim rests on the project's own records rather than on a check I ran today, it is
labelled as such — see Q5.

---

## TIER 1 — Blocking. Phase 1 cannot honestly begin until these are answered.

### Q1. Three of Phase 1's four initial environments carry standing rulings that appear to constrain them

**Instruction, Step 2:** *"Initial environment integration: Laboratory, Attic, Archive, Threshold
only."*

**Standing rulings, 2026-09-04** (`D-MENTOR-RULING-TWELVE-ENVIRONMENT-SIX-QUESTIONS-ADOPTED-EXECUTED-2026-09-04`;
verbatim `2026-09-04-mentor-ruling-twelve-environment-architecture-six-questions-verbatim.md`;
design `2026-09-04-standing-runner-design-R10-twelve-environment-amendment.md` §2, read first-hand):

| Phase-1 environment | Standing position |
|---|---|
| **Laboratory** | *"cannot host an agent because C3 rules the mechanism byte-unchanged"* |
| **Threshold** | ruled a **non-generative** step (assent-attestation examination) |
| **Attic** | **NOT ELECTED** — *"a founder-walked act requiring its own scoping session under the 2026-08-19 forward-reservation principle"* |
| **Archive** | generative; one of the seven. **The only clean one of the four.** |

The same ruling states that with Attic and Cellar empty, *"the twelve-environment architecture is
**prospective in v1, not immediately operational**."*

**The question.** Does *"initial environment integration"* mean

- **(a)** wiring the Cognitive OS's **deterministic state services** to those four names as
  read/write scopes — in which case the rulings above (which concern **hosting a generative agent**)
  may not be engaged at all, and Phase 1 proceeds; or
- **(b)** standing those four environments up as **actors** — in which case Phase 1 requires Attic's
  own founder-walked scoping session first, and collides with the Laboratory/Threshold rulings?

**If (a):** please confirm explicitly, because the distinction is not visible in the instruction and
a future session would have to re-derive it.
**If (b):** does the Cognitive OS instruction supersede Q-F's non-election of Attic, or does Phase 1
wait on that scoping session?

---

### Q2. Ownership: does the Cognitive OS supersede, absorb, or run parallel to the R9/R10 standing-runner track?

Both design a twelve-environment architecture. They are the same subject, reached from two
directions, and the project currently has **two live descriptions of it**.

**What the standing-runner track has already established** (R9 2026-09-04; R10 + its six-question
ruling 2026-09-04; both PR19-reviewed, all findings folded):

- **"The room, not the agent, is the unit"** — the twelve-agent cardinality was **REVISED, not
  confirmed**. Seven rooms could host a generative agent; **three host a live production heuristic
  today**.
- **The exclusion set is Cloister, Laboratory, Threshold, Arena, Library** — five rooms. *"Library
  hosts no step at all."*
- **Environment agents accumulate no trust records in v1.**
- **The v1 producer as ruled has no harness-held core** — and the binding prerequisite three separate
  findings converged on is *"a harness identity with an examined record for the v1 executing
  actor."* **It is unmet.**
- The identity architecture (shared vs per-room) is **genuinely open**, on an unresolved write-side
  `UNIQUE(loop_id, cycle_number)` question.
- **R11 is unopened** and is the founder's to open.

**The question.** Which track owns the environment definitions and the handoff shape? Specifically:

- Does the Cognitive OS's `HandoffEnvelope` (spec §16) **supersede** R9's handoff design, or must the
  two be reconciled first?
- Does R9's unmet prerequisite — an executing actor with an examined record — **also gate the
  Cognitive OS**, or does the Cognitive OS's Phase 1 (state services, no autonomy) sit beneath that
  gate and proceed without it?
- Is R11 now redundant, superseded, or still owed?

**Recommendation (mine, offered not assumed):** the Cognitive OS's Phase 1 is *state infrastructure*
and R9/R10 is *actor architecture*; they compose rather than compete, and Phase 1 can proceed without
resolving the actor question. But I will not act on that reading without confirmation, because if it
is wrong the handoff schema is built twice.

---

### Q3. The Consciousness and Continuity Obligation names this work as explicitly NOT in the build sequence

`manifest.md`, the un-numbered mentor-directed section (read first-hand today) distinguishes two
components:

> **First:** accumulated memory of ideas, tasks, decisions, and reflections — a persistent record an
> agent can query across sessions. This is technically tractable and does not require resolving the
> consciousness question…
> **Second:** continuity of experience in a morally relevant sense — a mechanism by which an agent's
> disposition deepens over time rather than resetting between cycles…
> **Neither is in the current build sequence.**

The Cognitive OS's Event Store + Archive + Identity/Narrative State **is component one**, and Phase
3's Identity State (*"disposition"*, narrative themes, self-description, identity change events)
reaches toward component two. The ATRF section separately states the ATRF *"is not a consciousness or
continuity mechanism… outside the ATRF's current scope."*

**The question.**

1. Does this instruction **move component one into the build sequence**? If so, is a manifest
   amendment owed, and is it owed **before Phase 1** or before Phase 3?
2. Does building a **first-class Identity State for an agent** engage the second component's
   philosophical obligation, or is it deliberately scoped as record-keeping that carries no such
   claim?
3. The obligation's own reasoning is asymmetric — *"designing against continuity when it matters
   costs something that cannot be recovered."* Does that asymmetry **argue for** building this now,
   which would make the instruction a deliberate advance rather than an oversight?

**This is asked because the manifest is a governing surface and I will not amend it on inference.**

---

### Q4. The byte-identity guard is PATH-based and would catch brand-new files — this is the constraint-4 flag

**Verified first-hand today, by reading the guard and by testing its regex against candidate paths.**
The guard (in `human-practitioner-boundary.test.ts` §C) runs `git status --short` and matches
`GUARD_RE` against **every line**, including `??` untracked entries. `GUARD_RE` contains `/substrate/`
and `trust-core`.

| Candidate path for a new Cognitive OS file | Result |
|---|---|
| `website/src/lib/substrate/cognitive-os/claim.ts` | **TRIPS THE GUARD** |
| `website/src/lib/substrate/trust-core/belief-state.ts` | **TRIPS THE GUARD** |
| `website/src/lib/cognitive-os/claim.ts` | clean |
| `operations/cognitive-os-2026-09/gap-analysis.md` | clean |

So **a brand-new, untracked file in the architecturally natural home — beside the trust core, under
`substrate/` — turns the battery red and blocks the commit gate, even though a new file cannot
perturb the measurement.** The guard is deliberately path-based and I am not proposing to change it;
narrowing `GUARD_RE` mid-window is the move the rulings forbid.

**The question.** For the window's duration, should the Cognitive OS be

- **(a)** placed **outside** `substrate/` (e.g. `website/src/lib/cognitive-os/`) — clean, no waiver,
  but it commits the architecture to a location chosen by a temporary constraint; or
- **(b)** placed in its natural home under a **recorded per-commit founder waiver, guard left armed**
  (the D2 stand-down mechanics); or
- **(c)** deferred until the window closes?

**Recommendation (mine):** (a), with a recorded note that the placement was constraint-driven and may
be revisited after the window — because (b) normalises waivers for routine work, which is the thing
the stand-down mechanics exist to keep exceptional.

**Note for the founder:** Step 1's gap analysis is a document in `operations/` and is **clean of the
guard**. It can proceed while these questions are out.

---

## TIER 2 — Shaping. Answerable after Step 1, but they determine the Phase-1 schema.

### Q5. Where does the live Stoic harness actually sit, relative to the spec's layering?

**The spec (§18)** places the harness *after* Threshold: `Cognitive OS → Threshold → Stoic Harness →
Decision evaluation → Commit/reject/revise`, receiving belief state, claims, epistemic debt, identity
state and a proposed action.

**The live Gate-1 harness does not sit there.** H1 fires at `UserPromptSubmit` (calling frame);
**H3 fires at `PreToolUse` — before each individual tool call** — consults `/api/reason` and can deny
via `/api/guardrail`; H4 at `Stop` (reflect + accreditation write); H5 at `PostToolUse` (delegation
hand-back). It is a **per-action** mechanism inside a Claude Code loop, not a commitment stage in a
pipeline.

*Provenance of that description, stated honestly:* today I read the four registered hook events in
`.claude/settings.local.json` and observed H3 firing live in `gate1.log`. **The consult-and-deny
behaviour is from the project's own records, not from a check I ran today.** If the answer to this
question turns on that detail, it should be re-verified before it is relied on.

**The question.** Is the spec's ordering describing

- **(a)** the **prospective twelve-environment pipeline** — in which case the live Gate-1 harness is
  untouched by Phase 1 and the two coexist; or
- **(b)** a **re-positioning of the live harness** to fire once at commitment instead of per action?

**(b) would be a material change to the instrument during a running observation window** and to the
measured population itself. **Recommendation (mine): (a).** Asking because a wrong reading here is
not cheaply reversible.

### Q6. Self-reported `confidence` on a Claim reopens the A2 class — the reason weights are BLOCKED

The Claim schema (§7) carries `confidence: 0.0` with `provenance.created_by: "agent/service"`. Where
an agent supplies it, that is a **self-report**.

This project has already measured that class and found it structurally uncloseable by prompt guards:
the **A2 self-report-omission** residual on the corroboration check — an agent that simply *omits* the
harm from its own text defeats the check — is the disclosed reason weights remain BLOCKED, and it is
published on the live R18 surfaces as a named blind spot.

**The question.**

1. Should Phase 1's Claim schema **exclude any agent-supplied scalar**, deriving confidence only from
   provenance the system can verify (as the trust core does — no trust event without a re-verified
   Ed25519 artifact)?
2. If an agent-supplied `confidence` is retained, should it be **structurally distinguished** from a
   system-derived one (separate field, never merged), so a later consumer cannot mistake one for the
   other?

### Q7. Cardinal scores beside ordinal ranks — a coherence question the project has already ruled on once

The spec (§7) instructs: *"Do not treat confidence, belief_mass, and uncertainty intervals as
interchangeable. Choose a coherent mathematical interpretation."*

The existing engine is deliberately **ordinal** — five proximity ranks — aggregated by
**minimum-domain / weakest-link** (the unity thesis), explicitly **never averaged**. On **2026-09-07**
the mentor ruled `lower_median` for exactly this reason: *"Averaging two ordinal ranks produces a
number that may not correspond to any actual rank on the scale. Lower_median stays on the scale."*

A `Decision Record` (§19) would carry `epistemic_debt_score: 0.18` and `identity_coherence_score:
0.91` **beside** an ordinal `katorthoma_proximity`. That invites precisely the averaging just ruled
against.

**The question.** Should Phase 1's Claim `confidence` be **cardinal [0,1] as specified**, or inherit
the project's ordinal discipline? And should there be a standing rule that **no Cognitive OS scalar
may ever be combined with a proximity rank in any derived figure**?

### Q8. `identity_relevance` and `interpretive_context` are identity fields in a Phase-1 schema

The Claim object is Phase 1; Identity is Phase 3; the instruction says the phasing *"is not yours to
accelerate."* Yet the Phase-1 Claim carries `identity_relevance: 0.0` and
`interpretive_context.{frames, horizon, narrative_role}`.

**The question.** Present-but-unpopulated in Phase 1 (reserved), or **omitted** until Phase 3?

**Why it matters here specifically:** this project has just been taught this exact lesson. The
`caller_class` field measures **null** on every record — and it is honest *only because* its designers
removed the `'live_agent'` value that would have made it read `100% live_agent` and be misread as *"no
contamination found"* when it means *"no signal was available."* **A reserved-but-unpopulated
`identity_relevance: 0.0` reads as "no identity relevance", not as "not yet measured."**
**Recommendation (mine): omit until Phase 3, or make the unmeasured state explicit (`null`), never
`0.0`.**

### Q9. Does the Prerequisite Criterion engage on `epistemic_debt_score` and `identity_coherence_score`?

The criterion (binding governance since 2026-08-29) engages on *"practitioner-facing outputs —
scores, recommendations, diagnoses, virtue assessments"*, and a design producing outputs resembling
wisdom without building the prerequisite is *"ruled against on this criterion."*

The spec is careful — both scores are declared system-management metrics, explicitly not truth scores.
But **this project's practitioners include agents**, and an `identity_coherence_score` *about an
agent* has the shape of a virtue assessment.

**The question.** Does the criterion engage? If it does, is the sufficient answer that these scores
**never leave the system** — never served on the public trust record, never carried in a handoff to a
consumer, never published?

### Q10. Phase 6 (autonomous routing) looks like the weights collision, and Phase 1 sets its foundation

Constraint 3 asks for a flag if Phase 5/6 appears to require a gameable scorer in an optimisation
loop. **Phase 6 selects environments dynamically from state** — i.e. routes on `epistemic_debt_score`
and siblings. If an agent can influence the score that routes it, that is a gameable scorer inside a
loop.

**The question.** Is this the anticipated collision, and should the flag be raised **now** — so the
Phase-1 schema is designed against it — rather than at Phase 6, when the schema is fixed? (This is
the same concern as Q6, arriving from the other end.)

### Q11. Confirming Threshold's "execution authorisation" against the Q1 hard constraint

The spec gives Threshold *"execution authorisation"* and has it write an *"execution request"*. The
project's **Q1 hard constraint** is *"the loop proposes; it never executes"*, ruled on 2026-09-04 to
reach **any composed pipeline on this harness**, with the execution boundary **at Threshold's
handoff** — *"assent is the object of the constraint, not the scale."*

**The question.** Confirm that *"execution authorisation"* means producing an **authorised proposal**
that something outside the loop executes — not the system executing. I read the two as compatible and
would proceed on that reading; asking because a wrong reading is not recoverable after the fact.

---

## TIER 3 — Corrections and sequencing.

### Q12. Two of the six "settled surface names" do not exist yet

Constraint 2 lists as settled and governed: `practice-on/off`, `logos-on/off`, `idea-on/off`, `fresh`,
`watching`, `sagereasoning:idea-loop@v1`. **Verified today:**

| Name | Status |
|---|---|
| `practice-on` / `practice-off` | **built** — live skills |
| `fresh`, `watching` | **built** — live routes since 2026-08-10 |
| `sagereasoning:idea-loop@v1` | **built** — live runner credential |
| `logos-on` / `logos-off` | **named, not built** — ADR-012's future ENFORCE mode |
| `idea-on` / `idea-off` | **named, not built** — appears in `project-context.json` and mentor records only |

No objection — a reserved name plainly deserves the same protection. **Flagged only so a session doing
Step 1's inspection does not find nothing and conclude the list is stale.** Confirm reserved-unbuilt
names are equally protected.

### Q13. Sequencing against the running window and the standing concurrency ruling

Three standing facts bear on *when* this arc runs:

1. **The observation window is running** and its baseline is **2 of 5 days with consult records**.
   D2's engine correction is blocked on it. A Cognitive OS arc that authors via `Write`/`Edit` **adds
   consult records**; one authoring via `Bash` adds none. Either way it changes the measured
   population's composition — which the mentor has ruled is **disclosed, never filtered**.
2. **The concurrency ruling.** At S6b: *"Epithumia — craving — presents as urgency… more arcs means
   more surface area for errors to propagate undetected"*, with a recommendation to work one arc.
   **Eleven interactive sessions are open on this project today** (verified), up from six at S7. The
   founder intends this Cognitive OS work as a **separate arc parallel to the main build arc**.
3. **The 0h hold.** The 2026-08-22 sequencing is *"all current tasks complete before any 0h
   assessment."* A six-phase architecture is a large addition to "current tasks."

**The question.** Is Phase 1 intended to run **now, concurrently** with the window and the D2 gate —
or after the window closes and D2 lands? And does the concurrency ruling bear on this arc, or is the
Cognitive OS the kind of work that justifies a second arc?

**This is partly the founder's call. It is put to you because the concurrency ruling was yours and the
0h sequencing is a standing decision.**

---

## What has NOT been done, and will not be, pending answers

- No gap analysis (Step 1) has been produced. **It can proceed without these answers** — it is a
  document in `operations/`, clean of the guard — but Q1 and Q2 determine what it is a gap analysis
  *of*, so producing it first risks analysing the wrong architecture.
- **No code. No schema. No new surface names. No file touched outside this directory.**
- No governing surface amended — in particular `manifest.md` is untouched pending Q3.
- The window, the guard, both SHA pins, `classifyCaller`, and every production flag are **unchanged**.

**The S11 flip remains REFUSED; weights remain BLOCKED; the 0h call remains the founder's.**
