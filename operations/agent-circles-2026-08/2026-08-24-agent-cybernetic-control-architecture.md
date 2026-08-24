# Agent Cybernetic Control Architecture — conceptual frame, and the GS-CYB open questions

**Status: GOVERNING DOCUMENT. Created 2026-08-24.** Tier `governance`, documents only.

**Why this document exists rather than a new section in the generation-step scope.** The binding
instruction (`inbox/Mentor Cybernetics Instructions.rtf`, declared binding by the founder 2026-08-24)
directed its Task 1 content into *"the generation-step governing document."* **That document is closed**
— `2026-08-09-generation-step-scope.md`, RULED 2026-08-09 — and the mentor ruled on the routing
question the same day that amending it *"is the wrong shape"* while also ruling that *"a new
generation-step scoping session is not warranted"*
(`2026-08-24-mentor-ruling-cybernetics-instruction-four-questions-verbatim.md`, **binding; verbatim
wins**). The Q3 ruling then names *"the governing document"* as the home for the full design
specifications. **No such document existed** (verified repo-wide 2026-08-24). This document is that
home, created on the founder's naming. It **points at** the closed generation-step scope; it does not
amend it.

---

## 1. The frame

| Cybernetic component | SageReasoning equivalent |
|---|---|
| Goal state | The Stoic telos — virtue, eudaimonia, living in agreement with nature — encoded in the Stoic Brain corpus and the Layer 1/2/3 architecture |
| Sensor | The evaluative engine — receiving impressions, extracting verbatim evidence spans, classifying passion sub-species, oikeiosis circles, kathekon factors |
| Comparator | The Stoic Risk Gate guardrail and the ATRF's blast-radius and virtue-domain assessment |
| Effector | The elected idea — the action the loop proposes for execution |
| Memory | The watching table — holding cycle outcomes and making historical signal available to the generation step |
| Novelty filter | The `fresh` endpoint — preventing the effector from repeating actions already tried |

**Status of the frame.** This is a **conceptual frame, not a new design requirement.** It names what
the harness already is. It does not add components, change routes, or modify the existing
architecture. It provides vocabulary for reasoning about the harness's information-processing
structure in the receiving design session and beyond.

**The Q1 hard constraint is untouched and is not softened by the effector label.** The loop proposes;
it never executes. A proposal is a *phantasia*, not a *synkatathesis* — the loop presents, the
recipient assents. "Effector" names the elected idea as the frame's output slot, not an actor.

## 2. The design constraint

**The IDEA loop's single backward edge (watching table → generation step) is at or near the optimal
configuration for information integration. Design proposals that add additional within-cycle feedback
paths must be evaluated against this constraint before being adopted.** This is a **named constraint,
not a general caution.**

**Cited to:** Rajpal, H., Expert, P., and Vasiliauskaite, V. (2026). *Directed cycles as higher-order
units of information processing in complex networks.* Communications Physics. Article identifier:
s42005-026-02820-3.

> **⚠ UNVERIFIED-AT-RELAY (PR20 stale-fact discipline).** The session recording this constraint could
> not verify that the paper exists or that it supports the claim cited — past the assistant's
> knowledge cutoff, no verification channel used. **The marker stands until the founder confirms the
> paper and the claim.** Per the ruling: the constraint *"is independently supportable from the
> cybernetics foundations"* and **survives on the broader grounds** if the paper cannot be verified;
> in that case the citation is corrected or removed, and the constraint is not. **Not a blocker** for
> execution — a records-hygiene item to resolve before this document is finalised.

## 3. GS-CYB-1 — Proximity score as error signal and candidate weighting function

> **STANDING CONSTRAINT — weights BLOCKED (ADR-012, third rung).** *The gaming-robustness bar for the
> proximity scorer has not been cleared. A candidate weighting function that optimises against the
> proximity score places a gameable scorer inside an optimisation loop. This is the substance of what
> the third rung is blocked on, regardless of whether the optimisation operates on model weights or on
> a weighting function. GS-CYB-1 cannot be examined or built until the gaming-robustness bar is
> cleared or the question is reframed to operate outside the optimisation loop. This constraint is not
> a design consideration — it is a governing constraint that precedes examination.*
>
> Ruled verbatim 2026-08-24. *"The mechanism is different; the failure mode is the same."* The design
> proposals below are **held, not invalidated.**

**The frame's reading.** The proximity score is the harness's error signal — the measurement of
deviation between the agent's current reasoning state and the goal state (*katorthoma*). It is
currently measured and stored in the watching table (`guardrail_proximity`,
`website/supabase-idea-loop-watching-migration.sql:184`) but is not formally fed back into the
generation step as an explicit error signal shaping candidate generation.

**Open question:** does the generation step read the proximity score from the watching table as a
graded error signal, and if so, how does it use that signal to bias candidate generation toward
error-reducing actions?

**Four design components proposed for examination, not pre-answered:**

1. **Error signal extraction — AMENDED by the Q4 ruling.** *Let R(n) be the ordinal rank of the
   proximity score at cycle n, mapped via `PROXIMITY_RANK` to an integer in {0, 1, 2, 3, 4}. The
   directional error signal is the sign of R(n) − R(n−1): positive means movement toward katorthoma,
   negative means regression, zero means no change. The magnitude of the rank difference is recorded
   but the equal-spacing assumption is not made — the weighting function responds to direction and
   domain, not to cardinal distance between ranks. Whether the rank spacing is equal is a question
   the standing-runner session must examine rather than inherit as a given.*
   **This supersedes the instruction's `E(n) = P(n) − P(n−1)`**, which assumed subtraction over an
   ordinal scale. *"Tractable is not the same as justified."* The Senecan grades are not presented as
   equally spaced. **The equal-spacing question is a NAMED OPEN SUB-QUESTION within GS-CYB-1.**
2. **A candidate weighting function** biasing generation toward the virtue domains and oikeiosis
   circles where regression is most pronounced, using per-domain floor deltas from the watching table
   as inputs; monotonically increasing in virtue-domain match, oikeiosis-circle match, and the
   magnitude of the domain's regression signal.
3. **Epistemic status** of the weighting signal as `provenance: inference`, `credence: probably-true`,
   riding the proposal shape alongside the blast-radius indicator, consistent with GS-ATRF-4.
4. **Saturation and reset conditions** preventing integral windup — if the weighting function
   concentrates more than a threshold proportion of candidates in a single domain across N consecutive
   cycles, the weighting resets to uniform and the watching table records a saturation event. The
   threshold and N are build decisions; **the saturation condition is a design requirement.**

**None of these is a build decision.** The honest answer may be that the current architecture does not
implement this and that adding it requires a formal specification that is itself a scoping item.

**Home:** the **standing-runner design session**, as a named input (2026-08-19 forward-reservation
mechanism; routed 2026-08-24). **Cross-reference:** GS-ATRF-4 (epistemic status assignment);
GS-CYB-2 (whose update rule depends on the completion signal return path).

## 4. GS-CYB-2 — Controlled system model and completion signal return path

**Sequentially dependent on GS-ATRF-3.** The mentor ruled that this dependency *"does not make the
ATRF scoping session the right home for GS-CYB-2 — it makes GS-ATRF-3 a prerequisite that the
standing-runner session must inherit as a named dependency, not a reason to split the questions across
two sessions."* **GS-ATRF-3 first, GS-CYB-2 second.**

**The frame's reading.** The ATRF's post-task accuracy assessment is the harness's measurement of the
controlled system's response to the effector's action. The completion signal return path (GS-ATRF-3)
is the channel by which that measurement feeds back into the generation step.

**Open question:** does the completion signal return path constitute a formal model of the controlled
system, and if so, what is the update rule by which the post-completion proximity delta modifies the
generation step's candidate weighting function?

**Five design steps proposed for examination, not pre-answered:**

1. **Completion signal structure** carrying `loopId`, a success/failure indicator, and elapsed time —
   **task-agnostic**, consistent with the ATRF constraint that task details remain private to the agent.
2. **Post-completion proximity delta** — the difference between proximity at election time and
   proximity at the next cycle after completion. **Subject to the same ordinal treatment as GS-CYB-1
   component 1** (sign of rank difference; equal spacing not assumed).
3. **Weighting function update** — positive delta increases the weight of candidates in the same
   virtue domain and oikeiosis circle as the elected idea, negative decreases it, **bounded by a floor
   preventing any virtue domain or oikeiosis circle from being permanently excluded** from candidate
   generation.
4. **Epistemic status** of the post-completion delta as `provenance: inference`,
   `credence: probably-true` — the loop attributes the delta to the elected idea's execution on the
   basis of temporal proximity but **cannot verify causation**; the marker rides the completion record
   in the watching table.
5. **Timeout and missing-signal handling** — if the completion signal does not arrive within the
   maximum duration window, the generation step records a timeout event, treats the missing signal as
   `provenance: unknown`, `credence: unknown`, and **does not update the weighting function.**

**GS-CYB-1's standing constraint reaches here too:** step 3 updates the same weighting function, so
the weights-BLOCKED gate precedes examination of this step as well.

**Home:** the **standing-runner design session**, as a named input. **Cross-reference:** GS-ATRF-3
(the prerequisite); GS-CYB-1 (the weighting function this question's update rule addresses).

## 5. Changelog

**2026-08-24** — Agent Cybernetic Control Architecture frame incorporated as a named conceptual frame.
Mapping of harness components to cybernetic functions established. Design constraint recorded: the
IDEA loop's single backward edge is at or near the optimal configuration for information integration
per Rajpal, H., Expert, P., and Vasiliauskaite, V. (2026), Communications Physics,
s42005-026-02820-3 — **carried with an unverified-at-relay marker per the 2026-08-24 ruling**; design
proposals adding additional within-cycle feedback paths require evaluation against this constraint
before adoption. Source: brainstorm session 2026-08-24, incorporating Wiener (1948/1961) cybernetics
foundations and the Rajpal et al. (2026) paper. **Nothing in this entry licenses a build, a route, a
flag, a credential, or a schema.**

**2026-08-24** — **GS-CYB-1** — Proximity score as error signal and candidate weighting function —
added. Four design components for examination: error signal extraction (**amended to
sign-of-rank-difference; equal spacing NOT assumed; the spacing question inherited as a named open
sub-question**); candidate weighting function biasing generation toward regressing virtue domains;
epistemic status marking; saturation and reset conditions. **Carries the weights-BLOCKED standing
constraint (ADR-012, third rung) as a governing constraint that precedes examination.** Home: the
standing-runner design session. Cross-referenced to GS-ATRF-4 and GS-CYB-2. **Nothing in this entry
licenses a build, a route, a flag, a credential, or a schema.**

**2026-08-24** — **GS-CYB-2** — Controlled system model and completion signal return path — added.
Five design steps for examination: completion signal structure; post-completion proximity delta;
weighting function update rule with domain floor; epistemic status of the delta; timeout and
missing-signal handling. **Sequentially dependent on GS-ATRF-3, which the standing-runner session
inherits as a named dependency.** Home: the standing-runner design session. Cross-referenced to
GS-ATRF-3 and GS-CYB-1. **Nothing in this entry licenses a build, a route, a flag, a credential, or a
schema.**

**2026-08-24** — **Routing correction.** Both questions were originally addressed to the
generation-step scoping session, **which closed 2026-08-09.** Ruled to the standing-runner design
session as named inputs under the 2026-08-19 forward-reservation mechanism, joining §5d.
**GS-ATRF-4's identical stale pointer corrected in the same pass**, scoped to the ATRF Integration
register only — the phrase occurs in 12 other repo documents which the ruling does not scope in.

## 6. Rollback

`git revert` the records commit, and revert the `project-context.json` pointer entries independently
if only the register footprint is to be undone. Documents only; nothing deploys from this file. **The
register edit does reach a live surface** — it is injected into every `/api/reason` Layer-1 extraction
prompt — which is why the full specifications live here and only pointers live there.

## 7. Cross-references

- `inbox/Mentor Cybernetics Instructions.rtf` — the instruction, **binding on the founder's relay 2026-08-24**
- `2026-08-24-mentor-ruling-cybernetics-instruction-four-questions-verbatim.md` — **binding; verbatim wins**
- `2026-08-24-MENTOR-QUESTIONS-cybernetics-instruction-routing-and-weights.md` — the four questions
- `2026-08-19-mentor-ruling-late-arriving-carry-forward-ruled-session-verbatim.md` — the forward-reservation mechanism
- `2026-08-09-generation-step-scope.md` — the **closed** session this document points at and does not amend
- `2026-08-23-evaluative-engine-status-documentation-map.md` §5d — the standing-runner session's other named input
- `adopted/adr/2026-06-24-sage-practice-measurement-instrument-reframe.md` — ADR-012, the third rung
- `operations/benchmarks/sage-practice-v1/2026-06-27-gaming-robustness-bar-scope.md` — the bar GS-CYB-1 is gated on
- `website/supabase-idea-loop-watching-migration.sql:184` — `guardrail_proximity`
- `operations/primal-substrate-2026-08/00-PRIORITY-INDEX.md` — the gates table registering these named inputs

*End of governing document. Nothing here licenses a build, a route, a flag, a credential, or a schema.*
