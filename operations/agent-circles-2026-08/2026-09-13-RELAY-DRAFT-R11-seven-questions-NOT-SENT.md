# RELAY DRAFT — NOT SENT — the seven questions from standing-runner sitting R11

**Drafted 2026-09-13 (from `date`)** by `sagereasoning-6b [802222]` at the founder's request, after
the R11 close (`operations/handoffs/founder/2026-09-13-standing-runner-R11-CLOSE.md`; commit
`0a4598b`). **This is a draft for the founder to carry to the mentor. The session did not send it and
cannot.** Every question is stated so it can be put verbatim; where a deliverable offered a
recommendation, the recommendation is included and marked as the session's, not a position the
mentor is asked to adopt. **Nothing is built, elected or licensed by any answer** — each ruling lands
on a design document; any build stays its own `code-critical` founder-walked step.

**What the mentor has already ruled and is not asked again:** W is elected as doctrine (Exchange 5);
R8-D7's scope is amended to would-be winners only (Q-M5); K is a cost election and K=1 is W (Q-M6);
measure first on the live loop (Q-M7); a sampled verdict discloses K, the floor count and the
worst-draw rule, never a confidence scalar (Q-M8); the near-boundary gap is not closed (Q-S2).

**The documents the questions arise from** (verbatim wins over this relay):
- Deliverable A — `2026-09-13-R11-live-loop-verdict-measurement-DESIGN.md` (Option E, designed)
- Deliverable B — `2026-09-13-R11-R8D7-worst-of-K-policy-DESIGN.md` (R8-D7 as amended, parameters open)
- Deliverable C — `2026-09-13-R11-manifest-ATRF-item3-amendment-DRAFT-FOR-RULING.md`

---

## The context the mentor needs before the questions (three facts)

1. **The live loop is not running.** The bounded validation run closed at cycle 20 on 2026-08-16 (its
   `RUN-LOG.md` last write; the S6 report: *"closes at 20 cycles, the floor of the ruled 20–40
   range"*). The standing runner R8/R9 designed is unbuilt (R9 §16.2 is its build brief, a founder
   election). Q-M7's "live loop" therefore names a stream that exists only when a loop next runs.
   Deliverable A is written to that fact (its §0) and rides whichever loop the founder next runs.
2. **Under the amended scope the runner's election is where the policy acts.** The runner elects the
   highest-proximity survivor of the guardrail and novelty gates, ties broken at random (h7's five
   wins: four tie-breaks, one uncontested). Deliverable B defines the would-be winner as *the
   candidate the election returns on the cycle's standing verdicts*, and R8 §5.3's two-directional
   fixpoint becomes a descending chain (rejections never resampled; only "the would-be winner leaves
   the field" can occur; termination trivial; rejections cost zero extra calls).
3. **Both reviews found nothing that moves a ruling.** Two blind Sonnet reviewers, read-only; every
   finding folded (A: 2 MEDIUM arithmetic/consistency, 1 LOW, 3 NIT; B: 4 LOW, 1 NIT; the hard
   dimensions — no parameter set, no scalar, no build language, fidelity to Q-M5–Q-M8 — clean).

---

## The seven questions

### Q-R11-B1 — the dethronement reading (Deliverable B §1.4) — the one genuine fork

**The question.** Q-M5 retains *"the dethronement path for winners"*. Q-M8 makes *"the operative
verdict… the worst draw"*, and a draw carries a proximity as well as a decision. The runner elects
by proximity. So under the amended scope, does the sampling layer dethrone a would-be winner **only
on a floor** (reading (i)), or does the recorded worst-of-K proximity **re-enter the election** and
allow a floor-free sampled winner to be dethroned by an unsampled survivor whose single draw happened
to read higher (reading (ii))?

**Why it is not settled by the rulings.** Under (ii) the election compares a minimum over K draws
against single draws on one ranking — two statistics on one axis — and the sampled candidate is
systematically disadvantaged; each successor is then sampled, deflated, and so on down the field.
Under (i) the recorded worst-draw proximity still flows on the existing backward edge (R9-D10) but
does not re-rank a floor-free winner.

**The session's recommendation (Deliverable B): reading (i).** Grounds: Q-M5 states the layer's
purpose as *"to catch winners that carry a latent floor"* — the floor, not the rank; and ranking a
K-draw minimum against single draws is the shape the D6a rulings removed when they struck pooled
figures that imply a regularity the data does not carry. The session decided nothing; the build brief
must carry both readings until ruled.

**What the ruling lands on (PR20):** the runner's election rule (runner-side, not in this
repository); what flows on the watching-table → generation edge (R9-D10); nothing on the gate.

### Q-R11-B2 — incomplete series under W (Deliverable B §2, §5)

**The question.** When the layer cannot obtain K verdicts for the would-be winner — an
`engine_unavailable` or `tier1_pause` outcome on one or more draws — is the conservative reading
(**hold: no verdict until K verdicts**) the doctrinal one, or does **the single operative draw stand
with the incompleteness disclosed**? Outages are not draws (they are neither floors nor permits);
the question is what the layer does with fewer than K.

**Context.** The Option S run lost 6 of 10 draws to outages on two inputs, and the ruled disposition
there was disclosure (Exchange 3). That was measurement; this is a policy that changes a recorded
verdict, so the disposition may differ.

**The session's position:** none; the conservative direction is named, not recommended.

**What the ruling lands on:** the gate's outage posture as published (*"on an engine outage it
returns a conservative pause — never a silent proceed"*) extended one level up to the sampling layer.

### Q-R11-A4 — the measurement's vehicle (Deliverable A §0, §9)

**The question.** Given that no live stream exists today, does Q-M7's *"measure on the live loop"*
admit **a bounded, founder-attended re-run** as the measurement's vehicle, or does the measurement
**wait for the standing runner** (R9 §16.2) to exist?

**Context.** A bounded re-run has the closed run's own limits (founder-attended, 20–40 cycles, the
early-run/signal-producing split) but could run soon; the standing runner's stream is the intended
population and does not exist. Deliverable A supports both. **The election is the founder's; the
reading of the ruling is the mentor's.**

**What the ruling lands on:** nothing live — a founder-walked run prompt, if elected.

### Q-R11-A1 — first-draw signals as triggers (carries scoping Q3; Deliverable A §5.5, B §5)

**The question.** After Deliverable A's cross-tabulation exists (first-draw `katorthoma_proximity`,
`is_kathekon`, `proximity_floors.basis`, corroboration findings, tabulated against whether the input
carried a latent floor): **may any first-draw signal serve as a trigger condition** for the sampling
layer, or is a trigger admissible **only on a measured relation** between the signal and the latent
floor? The scoping draft's Option C noted no such relation has ever been measured; Deliverable A
prints the table and takes no position.

**The Prerequisite Criterion bears directly:** a trigger computed from a signal whose relation to
variance is unmeasured would produce an output resembling confidence without the prerequisite, and the
scoping draft ruled that against itself in advance.

**What the ruling lands on:** the policy's trigger parameter (open); nothing live until built.

### Q-R11-A2 — surface scope (carries scoping Q5; Deliverable A §6 limit 7, B §5)

**The question.** Both the measurement and the policy are scoped to `/api/guardrail`, as Option S
measured and as the published disclosure scopes (*"No rate has been measured on `/api/reason`, and
this one does not transfer to it"*). **Does any sampling policy reach the consult path**, from which
the trust ledger accumulates (`credential-completed`), or only the gate? If the consult path is in
scope, it is a second population and a second credential shape, not an extension of this design.

**What the ruling lands on (PR20):** the gate's default band and blocking behaviour (gate only), or
additionally `/api/reason`'s signed assessment and the trust-core emission path (if extended).

### Q-R11-A3 — the reserved instrument defect's sequencing (carries scoping Q8; Deliverable A §4.2)

**The question.** Exchange 3 reserved the `complete_series()` correction (count counted outcomes, not
records) *"to a session that does not know which input it affects."* **Must that correction land in
the existing instrument before any further Option-S-shaped measurement runs**, or may Deliverable A's
measurement — a **new** capture, runner-side, with the verdict-count completeness requirement stated
in its own design (in the ruling's words only; `option-s/` was not opened) — proceed independently?

**The session's position:** the defect does not bind the new capture by construction; the sequencing
is the mentor's. R11 is itself disqualified from the fix (it read the Option S close and rulings).

**What the ruling lands on:** ordering only; no code.

### Q-R11-C1 — the ATRF item-3 wording (Deliverable C §3, §5)

**The question.** C4 (2026-09-04) ruled the completion signal *"does not reintroduce outcome
comparison"* and that correcting `manifest.md` ATRF item 3's *"how the outcome compared to the
proposal"* is *"a governing-document amendment for the session, not a ruling here."* Deliverable C
drafts two wordings. **Which is ruled, and is the phrase *"whether the idea was completed"* to be
removed with the outcome-comparison phrase, or retained in the "executed-at-all" sense?** (The ruled
Q-C1 schema carries *"no success/failure indicator"* — R8 §2 — so "completed" as *succeeded* is not
in the signal; as *executed at all* it is attested by the signal's existence.)

The two wordings, verbatim from Deliverable C §3:

> **(full)** *3. Idea completion signal.* When the IDEA loop proposes an action and an executing
> agent adopts and executes it, a thin task-agnostic completion signal returns to the harness carrying
> the executing agent's **examination of its own assent** — what impression it assented to when it
> adopted and executed the idea, whether that assent was examined or habitual, and whether the
> threshold reached was katorthoma or kathekon — with a refuse-to-attest branch and the cycle
> identity, under the producer's declared provenance. **It carries no task-outcome content and no
> comparison of outcome to proposal:** it closes the loop on each proposed idea as evidence about the
> quality of the assent, never about the result, and without exposing task details.

> **(minimal)** *3. Idea completion signal.* When the IDEA loop proposes an action and the agent
> elects and executes it, a thin task-agnostic completion signal returns to the harness: whether the
> idea was completed and ~~how the outcome compared to the proposal~~ **the executing agent's
> examination of its own assent (Q-C1/Q-C2a), with a refuse-to-attest branch; no task-outcome content
> and no comparison of outcome to proposal**. This closes the loop on each proposed idea without
> exposing task details.

**What the ruling lands on:** `manifest.md` (a governing surface; application is the founder's own
act after the ruling). No schema, endpoint or handler changes — the built signal already matches
either wording.

---

## What the relay asks the founder to decide, not the mentor

- **Q-R11-A4's election** (vehicle) once the mentor has read the ruling.
- Whether to commission a founder-walked run prompt for Deliverable A after A4 and A3 are answered.
- Whether to apply Deliverable C's ruled wording to `manifest.md`.

## Standing constraints this relay honours

Drafted, not sent. No build proposed or licensed. No R18 change (Deliverable B §9 remains staged).
No `GUARD_RE` file, code, schema, flag or credential touched. **D2 remains blocked. The S11 flip
remains REFUSED. Weights remain BLOCKED. The 0h call remains the founder's.**

*End of relay draft.*
