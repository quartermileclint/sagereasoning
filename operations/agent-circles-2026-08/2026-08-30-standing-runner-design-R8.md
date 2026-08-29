# The standing-runner design session (R8) — completion-signal consumption, the update rule, GS-CYB-1's observation apparatus, and Q-C2b's discriminating signature

**Date:** 2026-08-30. **Tier:** `governance` — a design session. **It designs; it does not
build.** No code, schema, flag, credential, or activation is licensed by this document. Every
proposal below that would touch code or production is named as a candidate follow-on `code-*`
session requiring its own founder election — nothing here pre-authorizes one. The one
tier-escalated act this session performed — the c11 re-submission experiment — was an explicit
founder election at open (its record: `2026-08-30-c11-rerun-experiment-record.md`), exactly as
the R8 prompt instructed for a step outside a `governance` licence.

Executes **step 5, the final step, of the mentor's ruled Q7 sequence**
(`2026-08-29-mentor-ruling-five-instruction-family-verbatim.md`, verbatim wins): *"open the
standing-runner design session with the four frames presented together per F5's instruction, plus
the adversarial review's findings as a named input."* Steps 1–4 are done and recorded
(`D-FIVE-INSTRUCTION-FAMILY-RULED-ADOPTED-EXECUTED-2026-08-29`;
`D-ADVERSARIAL-REVIEW-CYBERNETIC-SEVEN-PROBES-RUN-PR19-FOLDED-2026-08-29`;
`D-ATRF-REGISTER-ROW-COMPLETED-2026-08-29`; the three nine-candidate entries of 2026-08-29).

**Naming discipline held throughout (Q5b):** the bare two-word layer term is not used in this
document. Where the context-injection layer live on `/api/reason` is meant, it is named as such;
the per-consumer prose service (not live) does not arise here.

> **RULED 2026-08-30 — the design's routed questions are answered; these annotations are
> BINDING and win over the body wherever they differ**
> (`2026-08-30-mentor-ruling-R8-producer-floor-semantics-verbatim.md`, relayed same day;
> verbatim wins over this summary too):
> - **§4.0 (the producer question): RULED.** Q1a — the founder (or a founder-directed agent
>   session) on a founder-minted `completion_signal_write` credential is the ONLY v1 producer;
>   the low, adoption-bounded rate is "the correct design for this instrument at this stage…
>   not a deficiency to be engineered around." Q1b — the designed handoff is ruled: the elected
>   proposal carries its own `loop_id`/`cycle_number` on the founder-dashboard adoption surface
>   (a build-session precision item). Q1c — **distinct identities required at mint, not
>   convention**: the runner and the executing agent may not share an `agent_id`.
> - **§4.0's fourth item (the Q-C2a elector/attester tension): RULED, reading (a) — the first
>   examination question is AMENDED, binding on relay:** *"What impression did you assent to
>   when you adopted and executed this idea?"* Questions two and three unchanged. The runner's
>   election/tie-break behaviour stays where it is already recorded (the watching table's
>   candidate rows) and belongs to the election-mechanism analysis, not the signal.
>   **Consequence for the built surface, named as a build item:** the dark handler's header
>   comment and the migration's COMMENT text quote the pre-amendment first question, and the
>   `impression_assented_to` field's documented semantic is now the amended one — the wording
>   update rides the next code session touching that surface; the ruling governs the semantic
>   from relay regardless of the comments.
> - **§5.3 (the M/W/S election): PARTIALLY RULED.** Option S is **buildable now** (pure
>   measurement; first verdict operative). **M-vs-W is deferred** — with the doctrinal framing
>   locked exactly as §5.3 states it (per-examination vs per-judgement; the measured
>   10%→2.8% / →27% consequences as the empirical basis) — to the standing-runner track's next
>   design-capable session, once Option S has produced disagreement-rate data (see the
>   sequencing note in the verbatim capture: the ruling's "standing-runner design session"
>   names that future session, this one having already run).
> - **§4.9's R8-D7 single-backward-edge evaluation: carried as a named evaluation AWAITING
>   CONFIRMATION** by that same future session — "not treated as settled in any build or design
>   work before that confirmation."
> - **§11's follow-on 1 (the mentor brief): EXECUTED and answered same day.** The build brief's
>   producer-side gating is now open on the Q1 answers; the M-vs-W gate remains on R8-D7's
>   verdict-changing variants, with S unblocked.

---

## 1. The four frames, received together — and how they govern what follows

Per F5's own instruction the four frame components are one integrated frame, not four inputs to
apply separately: **cybernetics** (the architecture of regulation — feedback, internal models,
hierarchical control), **neural operators** (the computational stance — structure as inductive
bias, multi-scale function-space mappings), **Spinoza's scientia intuitiva** (the cognitive
destination — structural causal apprehension, reached only through the prerequisite of adequate
ideas built by examined assent), and **Stoic doctrine** (the structural priors that make outputs
interpretable and checkable). Each design element below is reasoned against all four; in
practice they bind as follows:

- Cybernetics names *what is missing*: the balancing loop (the completion signal's consumption)
  and the resolution at which the one graded signal is consumed. §§4–5 design for exactly these,
  as MEASURE-mode information flows, never as enforcement.
- Neural operators name *what must not be done*: no learned approximation replaces the
  pre-specified doctrine (the priors ARE the design), and no multi-scale operator architecture is
  proposed before the standing runner's own longitudinal data exists (Q9; §8).
- Spinoza names *the evaluative rule*: the Prerequisite Criterion, now binding manifest
  governance, applied explicitly to every proposal below (§10 indexes the applications).
- Stoic doctrine names *the content*: every signal designed here is an examination-quality
  signal, not a task-outcome signal — the ruled Q-C1/Q-C2a schema already made that election, and
  §4.2 treats it as the design's foundation rather than re-litigating it.

The F3 capture is read with its Q10-annotated standing-rules block and its Q4/Q5 corrections
applied, per the R8 prompt; the pre-run-research response's surviving multi-scale coherence
question is carried inside this frame (§8), subsumed rather than separate, per the register.

## 2. The design ground — facts verified at source this session

Per F3's standing rule (verify mechanisms at source before asserting them; authoritative sources
PR20/PR25 per the Q10 annotations), the load-bearing mechanism facts under this design were
re-verified first-hand rather than inherited:

1. **The completion-signal endpoint is POST-only.** `/api/practice/completion-signal` exports
   `POST` and `OPTIONS` only (`route.ts`, read in full); no `GET` handler exists on the route and
   no read function beyond data-rights export exists in the store
   (`idea-loop-watching-store.ts` — `insertCompletionSignal` is the only signal accessor outside
   `credential/erase`, `user/export`, `user/delete`). **The named-input register's row 509 says
   "its endpoint (`POST/GET /api/practice/completion-signal`) is built dark" — the GET half of
   that phrase is a drift**: nothing serves a read. Corrected in the register this session with a
   dated note. Consequence: **the consumption design in §4 starts from zero read surface — the
   read path is itself part of the design**, not an existing affordance to wire.
2. **The built schema is the ruled Q-C1/Q-C2a/Q-C3/Q-C4 schema, not the architecture document's
   step-1 sketch.** The stored signal carries `loop_id` + `cycle_number` (the pair, because
   `loop_id` alone is not a cycle identifier — a recorded build-session finding),
   `impression_assented_to` (free text ≤5000), `assent_quality` (`examined|habitual`),
   `threshold_reached` (`katorthoma|kathekon`, NULL exactly when refusing),
   `refuse_to_attest` (required boolean), `refusal_reason`, and four per-proposition
   provenance/credence columns — the VOCABULARIES enforced as DB CHECKs, the Q-C4
   per-proposition constraints (inference-only record; unknown-on-refuse) enforced at the route,
   and the one structural coherence rule (threshold NULL exactly when refusing) enforced at both
   *(precision corrected at PR19 review — the first draft said the Q-C4 constraints were
   DB-enforced, which the migration's own comment contradicts)*. Server-stamped identity (`agent_id`/`owner_user_id`/`credential_ref`) from the
   dedicated `completion_signal_write` capability — deliberately NOT the runner's
   `watching_write`, so the actor separation (agent reports on its own examination; the runner
   cannot) is enforceable at mint. One signal per cycle (unique on `cycle_id`; duplicate →
   honest no-write). FK `ON DELETE CASCADE` to `idea_loop_cycles` — retention and data rights
   ride the cycle, deliberately no `retain_until` of its own (PR24 not engaged, pinned in the
   migration). **There is no success/failure indicator and no elapsed-time field, and no
   justice-verdict field — by ruling** (§4.2 below).
3. **The `idea_loop_completion_signals` migration's production apply status is a named,
   unresolved contested fact** — two prior records disagree (the 2026-08-23 close's addendum
   claims the founder walk completed; the 2026-08-29 standing opener records "no apply record…
   presumed unapplied"), and a documents-only session cannot adjudicate it. **The design below
   proceeds on the design question, which is settled either way, and its activation phasing
   (§4.8, phase 1) begins with the founder resolving the apply status via the migration's own
   `§PRE`/`§VERIFY` blocks — neither answer is assumed here.** The same caveat covers
   `target_circle` and the other five ATRF/S4 columns (§5.2b).
4. **The examination path changed after the bounded run.** Four commits touched
   `guardrail-sandwich.ts` / `layer1-extractor.ts` / `layer2-mechanisms.ts` /
   `corroboration-check.ts` / the guardrail route since 2026-08-09; the substantive one is
   `f7619d9` (2026-08-24, D4-completion — the deliberation-proxy replacement). Today's
   instrument is the instrument the standing runner would live on; it is not the run-window
   instrument. Every use of run data below carries that scoping.
5. **The generation heuristics and the run's productivity distribution** (from the §6 report,
   cited not re-derived): h1 `analogous_transfer` (2 wins), h2 `combinatorial_generation` (2),
   h3 `synthesis_over_novelty` (3), h4 `context_transfer` (3), h5 `fifth_circle_weighting`
   (0 wins), h6 `anomaly_detection` (**zero candidates** — inert by construction: *"a standing
   runner must persist the runner's own history, or h6 is inert by construction"* — quoted
   verbatim; the first draft misquoted the subject as "the generation step," corrected at PR19
   claims-vs-source review),
   h7 `friction_detection` (5 wins: 4 by random tie-break, 1 uncontested, 0 by out-scoring).

## 3. The c11 re-submission experiment — the session's founder-elected evidence step

Full record: `2026-08-30-c11-rerun-experiment-record.md`. Result, in one line: **ten identical
minimal-payload submissions of the byte-exact stored c11 text to the live gate returned 9×
`deliberate`/proceed and 1× `reflexive`/blocked — with the divergence localized to a single
Layer-1 field** (the causal-stage assignment of the same `irreversibility_language` indicator:
absent ×4, `phantasia` ×2, `synkatathesis` ×3 → no floor; `praxis` + unexamined ×1 → the
ADR-010 §4 andreia floor; four distinct extraction states on ten identical inputs, only the
fourth flooring). The dikaiosyne reading was stable ten of ten (`cosmopolis` circle,
`indeterminate`-argued → capped `deliberate`).

**Engagement with the classification's Reading A / Reading B question — the stated position the
R8 prompt requires:**

- **Reading B is demonstrated present and is the operative design input.** A probabilistic
  Layer-1 extraction produces occasion-to-occasion variance on exactly the fields the
  unity-thesis floors key on, and the faithful deterministic Layer 2 converts that variance into
  multi-rank verdict swings. Floor-class rate on this input, today, minimal payload: 1/10
  (Wilson 95% ≈ 2–40%; a demonstration, not a measurement).
- **Reading A is reframed, not excluded.** No code defect is implicated — run 8's conservative
  reading of a near-irreversible act is individually defensible; what the data shows is
  *inconsistency about a defensible caution*. The calibration surface, if any, is the
  extraction-stage assignment — the disclosed, gameable/variance-prone `examined_before_acting`
  stage-link boundary ADR-010 §4's own activation record named — which is mentor/calibration
  territory, not a reproducibility bug fix.
- **The submitted-payload assumption is discharged for the forward question.** Divergence
  reproduces on bare stored text; the nine-candidate §3 finding no longer rests on the
  unverifiable historical payload.
- **Does this change GS-CYB-2's design? Position: it confirms the separation and adds one design
  element on the gate side, not the signal side.** The R8 prompt, glossing the classification's
  §5, put it that under Reading B "'closing the completion-signal loop' and 'improving extraction
  reproducibility' may be two different problems wearing one name" *(attribution corrected at
  PR19 review: that formulation is the prompt's, not §5's own text — §5's own words pose it as
  what confidence a single verdict carries and whether a floor-class verdict should be re-run)*.
  **They are two different problems.** The completion signal reports
  examination quality post-execution and cannot repair verdict variance; verdict variance is
  instrument-level and cannot be repaired by any return path. The consumption/update design
  (§4) therefore carries no verdict-repair duties, and the verdict-confidence question lands
  where it belongs — in the gate-consumption designs R8-D6a and R8-D7 (§5).

## 4. GS-CYB-2 — completion-signal consumption and the update rule (design-with-disclosed-absence, ruled shape (a))

**The disclosed absence, stated per Q8 before anything else: no completion-signal data exists.
The bounded run produced none; the endpoint postdates the run; the endpoint is dark and its
migration's apply status is contested (§2.3). Nothing below is calibrated against observed
signals, because there are none. Activation is phased on the standing runner's own first
observed signals (§4.8).** A design that cannot be activated until data exists is still a design
that can be made — this is that design.

**Ordering honoured: GS-ATRF-3 first, GS-CYB-2 second, within this session** (the ruled
dependency shape — a named dependency, not a re-split). §§2.2, 4.1 are the GS-ATRF-3 half
(the return path, recapped as ruled and built); §§4.3–4.8 are the GS-CYB-2 half built on it.

### 4.0 THE PRODUCER QUESTION — this design's own largest open item, named before anything is built on it

**Folded from PR19 independent review (both the constraint and soundness dimensions raised it;
the soundness reviewer rated it HIGH), and independently reached by this session's own close-turn
reflection before review returned. It is stated here, at the head of the design, rather than
buried in limits — because everything in §§4.3–4.8 consumes a signal whose producer this design
does not establish can exist.**

Q-C1 ruled the actor: *"The agent, post-execution. The agent is the only actor with access to
post-execution evidence of whether genuine examination occurred."* Q1 rules that **the loop
proposes; it never executes** — *"the loop presents, the recipient assents."* Put together, three
things are undesigned and are NOT resolved by this document:

1. **Who executes, in any real deployment?** The bounded validation run had no executing agent at
   all: elected ideas were proposals to the founder, and nothing was executed by any agent. A
   completion signal reports on an execution; if no agent ever executes an elected idea, no
   honest signal can ever be produced, and every consumption surface below has an empty input
   forever.
2. **How does an executing agent learn `loop_id` + `cycle_number`?** The built schema requires
   the pair (both, because `loop_id` alone does not identify a cycle). The only read surface this
   design proposes (R8-D1b) is scoped to *the runner's own loop identity*. **No designed path
   hands an external executing agent the cycle identity it is required to attest about.** That is
   a concrete, closable design gap — and it is not closed here.
3. **May the runner and the executing agent share an `agent_id`?** The mint-level capability
   separation (`completion_signal_write` ≠ `watching_write`) prevents one credential doing both;
   nothing observed prevents the same agent identity holding both credentials. Whether that is
   permitted materially changes §6's signature (the saturation mode at §6.6) and the actor
   separation Q-C1's reasoning rests on.

**A fourth item, which is a tension in the inherited rulings and therefore not this session's to
resolve:** Q-C2a's first ruled question asks *"What impression did the agent assent to **when it
elected this idea**?"* — but **election is runner-side**, and in the observed record 4 of h7's 5
wins were resolved by a `r mod n` random tie-break. For a tie-broken cycle the honest answer
about the assent *at election* is `habitual` or a refusal, for every such cycle, no matter how
carefully the executing agent later examined the idea itself. The ruled question presumes an
elector-attester identity the current architecture splits. **Named as a question for the mentor,
not answered here** (it touches ruled content; PR20 applies to whatever brief carries it).

**What this does to the design below, stated honestly rather than papered over:** §§4.3–4.8
remain a genuine design of consumption and the update rule — Q8's ruled shape requires that
design now, and a design for a signal that does not yet exist is exactly what
design-with-disclosed-absence means. But **the disclosed absence is deeper than "no data yet":
it includes "no designed producer yet."** §4.8's phase 3 therefore gains an explicit
precondition (the producer question answered) rather than gating on "first N signals" alone,
which would otherwise be a self-sealing condition — an activation gate on an event with no
designed cause. **This is the single most important item for the follow-on brief, and the
recommended next act on it is a mentor question, not a build.**

### 4.1 The return path, as ruled and built (recap — nothing re-opened)

Q-C1 ruled the actor (the agent, post-execution — the only actor with honest access), the
transport (direct credentialed POST, no relay), the schema (§2.2), the endpoint (new, its own),
and the persistence (immediate on receipt; **"Receipt does not trigger a flag, a dashboard
update, or any downstream action at this stage. The dashboard surfacing of the persisted signal
belongs to the standing-runner design session"** — that sentence is this section's licence).
Q-C3 ruled the refuse-to-attest branch required; there is deliberately no justice-verdict field.
Q-C4 ruled the per-proposition provenance/credence constraints, enforced at route and DB.

### 4.2 What the signal is, and is not — the design's foundation

**The architecture document's GS-CYB-2 step 1 ("completion signal structure carrying loopId, a
success/failure indicator, and elapsed time") is superseded by the ruled-and-built Q-C1 schema,
and this document names that supersession rather than absorbing it silently** (the
name-departures discipline): the signal that exists carries **examination-quality content** —
was the assent examined or habitual; did the examination reach the katorthoma threshold; or an
honest refusal — and carries **no task-outcome content** at all. No success/failure. No elapsed
time. This is not an implementation gap; it is the ruling's own doctrine made structural: the
harness measures the quality of examined assent, not task success (ADR-012's
measurement-instrument reframe; F5's prerequisite relationship).

**Design consequence, load-bearing for everything below:** the loop's balancing signal — the
thing Probe 2(b) confirmed absent — is, by ruling, a *practice-quality* signal, not an
*outcome-reward* signal. An update rule driven by it therefore cannot be an outcome-reinforcement
rule even in principle; what it can honestly drive is the loop's **examination posture**. §4.4
designs exactly that, and the convergence is worth stating plainly: the ruled schema already
refuses the reinforcement-learning shape that the Prerequisite Criterion and weights-BLOCKED
refuse on their own grounds. Three independent constraints point at the same design.

**The other half of GS-CYB-2's ruled open question, answered explicitly rather than silently
dropped (PR19, design dimension — the first draft designed the update rule and never addressed
the model half).** The architecture document's open question is two-part: *"does the completion
signal return path constitute a formal model of the controlled system, and if so, what is the
update rule…"* **Answer to the first part: NO — and the reason is structural, not a gap.** Under
Q1 the loop acts on nothing: it proposes, and the "controlled system" — the executing agent's
own reasoning practice, engaged only if a recipient adopts a proposal (§4.0) — is a system the
architecture *deliberately declines to model*, for the same reason the harness declines to trust
interior states (Q-C3) and refuses attestation beyond its measurement basis. What the return
path constitutes is a **measurement archive** of that system's self-reported examination
quality, one signal per cycle, provenance-marked — an observation record, not a model. A formal
controlled-system model would be a practitioner-model held by the instrument, and building one
is not proposed, not needed by v1's update rule, and would face the Prerequisite Criterion
directly if ever proposed. The "if so" clause of the ruled question therefore resolves to: the
update rule designed here consumes observations, not a model.

### 4.3 R8-D1 — Consumption: the read paths (none exist today; both designed here)

Two read surfaces, deliberately distinct in audience, content, and flag:

**(a) The founder-dashboard fold (observability first).** `GET /api/founder/watching` (live) and
the `/founder-watching` page gain a per-cycle completion-signal block: present/absent; if
present — `assent_quality`, `threshold_reached`, `refuse_to_attest` (+ `refusal_reason`), the
four provenance/credence values, received-at; if absent — an explicit `completion_signal:
'absent'` marker (never a default, never omitted-silently; the absence IS a datum — the honest
counterpart of the run's own no-data finding). The founder sees the full record including
`impression_assented_to` — the founder already owns the underlying table's data-rights surface.

**(b) The runner cycle-open read (the informational loop closure).** A credentialed GET serving
the runner, at cycle open, the completion-signal summary for **its own loop's** prior cycles:
per-cycle `{cycle_number, signal: present|absent, assent_quality?, threshold_reached?,
refuse_to_attest?}` — **structured fields only, deliberately excluding
`impression_assented_to`'s free text**. Two reasons, recorded with the alternative: (i) the
update rule (§4.4) consumes only the structured fields, so serving the text would be exposure
without function; (ii) the text is the agent's own composed practice content, and the runner is
a different actor by construction (Q-C1's actor separation) — data-minimization across that
boundary is the house posture. The alternative (serve the text to the runner too) is workable
and revisitable if a future ruled update rule needs it; it is not taken here. Auth: the read is
authorized by a **read-scoped capability** on the runner's credential (scope = the credential's
own loop identity; no cross-loop read) — *not* by `watching_write` itself, which the first draft
proposed and PR19 review flagged as inverting the mint-level capability-separation posture this
section celebrates on the write side (granting read scope through a write capability). Whether
that is a new capability value or an explicit read grant is a build/mint question; the design
constraint is only that read authorization is its own named scope. Transport and route naming
are build-session decisions; the flow is a **read of the cycle-anchored signal records via the
existing single backward edge** (§4.9, incl. the named persistence-target departure).

**Flag discipline (the per-flag lesson, F3's block item 3, honoured at design time):** each read
surface gates on its **own** flag (working names `SUBSTRATE_COMPLETION_SIGNAL_DASHBOARD_ENABLED`
and `SUBSTRATE_COMPLETION_SIGNAL_READ_ENABLED`), never on the write endpoint's
`SUBSTRATE_COMPLETION_SIGNAL_ENABLED` — activating receipt must not silently activate
consumption, and vice versa. Dark ⇒ the dashboard block is absent and the GET answers an honest
503; the write path is byte-identical in every flag state of the read flags.

### 4.4 R8-D2 — The update rule, v1: an examination-posture update, never a weight update (MEASURE)

**The rule, stated first in one sentence: a completion signal changes what the next cycle
examines and discloses; it never changes what the generation step generates.**

Per received signal, at the runner's next cycle open (via R8-D1b):

1. **`assent_quality: 'habitual'`** → the next cycle carries a **re-examination posture** for the
   affected class (same heuristic and, where populated, same `target_circle`): the prior cycle's
   habitual-assent report is presented into the runner's **own election deliberation**, and the
   cycle record marks an **open examination loop** on that class.

   **Where this is presented, and where it is NOT — folded from PR19 review, which found the
   first draft's mechanism had no endpoint.** The first draft called this "the live CI-4
   affordance transplanted" and cited `/api/reason`'s `prior_feedback` + `examination_open` +
   same-depth rule. **Verified at source this session: `prior_feedback` exists on `/api/reason`
   and does NOT exist on `/api/guardrail`** (grep: zero occurrences in `guardrail/route.ts` and
   `guardrail-sandwich.ts`) — and the runner's per-candidate examination surface is the gate, not
   `/api/reason`. So the CI-4 contract cannot receive this, and §4.7 independently forbids
   feeding either surface. **The honest mechanism is therefore narrower than the first draft
   implied: the report is runner-internal — presented into the runner's own deliberation about
   which candidate to elect, and recorded on the cycle row. It is NOT injected into the
   generation prompt** (that would change what the generation step produces, violating this
   section's own boundary) **and it is NOT sent to any examination engine.** CI-4 is cited now
   only as the precedent for the *shape* of an open-examination-loop marker, not as a contract
   being reused.

   **The closure predicate (the first draft left "addresses it" undefined — a defect: an
   undefined closure either never closes, accumulating obligations monotonically, or closes
   trivially at build time).** An open loop on a class closes when EITHER (a) a subsequent cycle
   elects a candidate of that class whose completion signal reports `assent_quality: 'examined'`,
   OR (b) the founder explicitly dispositions it on the dashboard. Nothing else closes it; an
   unclosed loop's age is itself surfaced (§4.3a), so a monotonically growing stock of open
   loops is visible as a finding rather than silently accumulating.

   **A disclosed category mapping, named because the design does not otherwise argue for it:**
   the *agent's* reported assent quality is mapped onto the *runner's* candidate class. Those are
   two actors' practices (§4.0). The mapping is the only available one — the class is what the
   runner controls — but it is a proxy, and it is disclosed as one.
2. **`refuse_to_attest: true`** → the cycle that received the refusal is marked, in the cycle
   record and on the dashboard fold, as **practice-incomplete** — an elected idea whose
   post-execution examination could not be attested. It is not counted, anywhere, as a completed
   practice instance. No penalty, no weight, no exclusion of the domain — a refusal is the
   honest branch working, and the record treats it as such (Q-C3's own doctrine).
3. **`threshold_reached: 'kathekon'`** (attested, threshold not reached) → recorded as a
   completed-but-not-katorthoma instance in the longitudinal record; surfaces in R8-D1a;
   contributes to the §8 longitudinal picture. Nothing else changes.
4. **`assent_quality: 'examined'` + `threshold_reached: 'katorthoma'`** → recorded; **nothing is
   boosted.** A good report changes no behaviour — deliberately. The rule is asymmetric by
   design: adverse and absent signals open examination; favourable signals only accrue to the
   record. (An update rule where favourable signals increase anything is a weighting function —
   the gated object.)
5. **Signal absent at next cycle open** → R8-D4 (§4.6).

**What v1 never does, stated as hard boundaries:** it never alters heuristic selection,
generation frequency, candidate weights, prompt emphasis toward higher-scoring
domains/circles, or the election. It reads the gate's and the signal's outputs and produces
*examination obligations and disclosures* only. It is MEASURE in ADR-012's sense; ENFORCE (any
binding consequence) is not designed here and would be its own founder-walked question.

**The weight-touching half — held, and why that resolves the review's central tension in
sequence.** The architecture document's step 3 (delta-driven weighting update, domain floor) and
any successor of it are **not designed here**: they update the same weighting function GS-CYB-1
names, so the weights-BLOCKED two-condition gate precedes their examination (the architecture
document says this itself). The seven-probe review's central structural finding — that the
highest-leverage stabilising change and the highest-risk reinforcing change are the same code
path — is, under this design, **held in sequence rather than resolved in code**: v1 builds the
*sensor-and-record half* (the signal arrives, persists, is read, and produces examination
pressure and disclosure) while leaving the *mechanical* generation bias unbuilt and gated.

**The claim this deserves, corrected from the first draft's overstatement (PR19 review, design
dimension, HIGH):** the first draft said the loop "stops being open-loop in the information
sense Probe 2(b) named." **That overstates it and the correction matters.** Probe 2(b)'s finding
is that the loop *cannot learn from the controlled system's response to its effectors* — and
under v1 the effector-selecting machinery still cannot: corrective influence on system output is
absent **by design** (§4.4's hard boundaries). What v1 changes is that the response becomes
*observable, recorded, and productive of examination obligations*; what it does not change is
that nothing corrects generation. **v1 deliberately leaves the balancing loop open.** That is
the intended posture given the gate, not a shortfall being glossed — but stating it as loop
closure would claim the very thing the weights-BLOCKED gate withholds. Whether the sequencing is
*adequate* to the review's central tension long-term is what the standing runner's accumulated
signals would show — which is the honest reason activation is phased, and why §4.0's producer
question bounds even that.

**A disclosed incentive gradient (PR19 review, design dimension, MEDIUM — the design did not ask
this question and should have).** The rule is consequence-asymmetric: `habitual` draws a
re-examination obligation and an open-loop mark; `refuse_to_attest` draws a practice-incomplete
mark; `examined`/`katorthoma` draws nothing. Whatever the doctrine says about a refusal being
the honest branch working, an obligation-plus-mark is *consequence-shaped* to a reporting agent,
so the consequence-minimising report is uniform `examined`/`katorthoma` — **precisely the
distribution §6.2 names as the apparent-completion pattern.** v1 therefore carries a mild
gradient toward the dishonest distribution, and §6.2 is its only counter-detector. This is
disclosed as a bound of v1, not solved by it; §6.2's threshold-setting is bound to a concrete
trigger (the same first-N-signals point as phase 3) rather than left indefinitely deferred, so
the detector cannot be perpetually postponed while the gradient operates.

### 4.5 R8-D3 — The post-completion delta: within-cycle pair primary; cross-candidate delta derived-not-load-bearing

The architecture document's step 2 defines the delta as "proximity at election time [minus]
proximity at the next cycle after completion." **Design finding: that quantity compares verdicts
about different objects** — the next cycle's candidates are different texts — and the c11
experiment now shows single-observation rank differences on even the *same* object carry
material sampling variance. Two deltas are therefore distinguished:

- **The within-cycle pair (primary):** the elected candidate's `guardrail_proximity` at election
  vs the same cycle's completion-signal reading (`assent_quality`, `threshold_reached`). Same
  object, two moments, two instruments — a genuinely interpretable practice observation ("elected
  at `deliberate`; post-execution examination attested `habitual`" is a meaningful sentence; a
  cross-candidate rank difference is not). This pair is what R8-D1's surfaces serve and what the
  longitudinal record accumulates. **Scoped by two inherited bounds (PR19, design dimension):**
  the sentence is fully meaningful only where the attester and the elector coincide — §4.0's
  actor split can make its two halves describe different actors' assents — and its election-time
  anchor rides the same timestamp surface §6.3b(3) names unreliable (3 of 20 run cycles null on
  both fields); a pair with a null anchor is recorded as such, never interpolated.
- **The cross-cycle rank delta (derived, not load-bearing):** retained as a derivable
  observation per the review's Q2c ruling, under GS-CYB-1 component 1's amended ordinal
  treatment — **stored, when persisted at all, as the raw rank pair (R(n−1), R(n)), never as a
  difference**, so no equal-spacing assumption enters the schema (the spacing question is
  GS-CYB-1's named open sub-question and stays open). Persistence itself is §5.2b.

Q-C4's epistemic statuses carry through unchanged: every delta-derived observation is
`provenance: inference` at best, and the record says which readings it was inferred from.

### 4.6 R8-D4 — Missing-signal handling (the architecture document's step 5, carried and sharpened)

The signal is voluntary and agent-posted; the runner cannot compel it, and the endpoint's 409
means a cycle whose runner-side write never landed can never carry one. Design: at the next
cycle open, a prior cycle without a signal is recorded `completion_signal: absent` with
provenance/credence `unknown` — an honest absence, never defaulted to success or failure, per
the architecture document's own step 5, which is carried verbatim in substance: **the absent
case updates nothing.** The dashboard shows the absence; the longitudinal record counts it; the
signal-rate itself (what fraction of cycles ever receive a signal) is named a first-class
longitudinal observable — the run's own rate was zero, and the standing runner's actual rate is
among the first things its operation will measure.

### 4.7 What consumption deliberately does NOT include

No trust events (the store's pinned §2.9 posture — any future event class is a new mentor
question). No public trust-record surfacing (the signal is a self-report; the public record's
honest-claims envelope is not extended by this design). No re-scoring of the elected candidate.
No feedback into `/api/reason` or the gate. No cross-loop or cross-agent aggregation.

### 4.8 R8-D5 — Phased activation (each phase its own founder-walked step; none licensed here)

- **Phase 0 (current):** everything dark. The write endpoint's code is deployed (independently
  HTTP-verified 503); its migration's apply status is contested (§2.3).
- **Phase 1 — receipt:** the founder resolves the migration apply status (`§PRE`/`§VERIFY`),
  then activates `SUBSTRATE_COMPLETION_SIGNAL_ENABLED` (migration-before-flag; a `code-critical`
  walk already anticipated by the ATRF build records). First real signals can now exist.
- **Phase 2 — observability:** build + activate R8-D1a (dashboard fold, own flag). Triggered by
  phase 1, buildable immediately after it; valuable from the first signal.
- **Phase 3 — consumption:** build + activate R8-D1b and the runner-side v1 update rule
  (R8-D2/D3/D4) as part of the standing runner's own build brief. **Activation is phased on the
  runner's first observed signals per the Q8 ruling** — concretely: phase 3's switch-on follows
  the first N genuine signals having been received and read on the dashboard (N is a build-time
  founder election; the design constraint is only that it is not zero — consumption logic should
  first run against at least one real signal the founder has seen).
- **Not a phase:** the weight-touching update rule. It has no activation slot on this path at
  all; it becomes designable only if GS-CYB-1's two conditions are both independently ruled, and
  buildable only after its own design session and election.

### 4.9 The single-backward-edge evaluation (the §2 constraint, applied as required)

The governing architecture document's design constraint — the IDEA loop's single backward edge
(watching table → generation step) is at or near optimal; additions must be evaluated against it
(cited to Rajpal et al., carried with its UNVERIFIED-AT-RELAY marker; surviving on the
cybernetics grounds regardless) — is applied to every flow this design adds, honestly per flow:

- **Completion-signal consumption (R8-D1b/D2):** the signal persists FK'd to the cycle row and
  the read occurs at the NEXT cycle's open — a between-cycle flow through the existing backward
  edge; no new within-cycle path. **A departure named here rather than absorbed** (PR19,
  constraint dimension): Q-C1's ruled persistence target was "the watching table — a new row
  type, or a new column set on the existing candidate row"; the build session elected a
  **separate FK'd table** (`idea_loop_completion_signals`), which is a third shape the ruling
  did not enumerate. This document's "watching-table complex" phrasing packages that departure;
  it is functionally faithful (the FK anchors retention, data rights, and the read to the cycle
  row exactly as a row-type would) but it IS a departure from the ruled enumeration, made at the
  2026-08-23 build, and it is named as one — this design inherits it, it did not make it.
- **R8-D6c telemetry:** a forward record (runner → table); not a backward edge.
- **R8-D8/§6 readings:** server-side derived, surfaced founder-side only in v1; enter generation
  nowhere.
- **R8-D7 — the evaluation the first draft skipped by mislabeling (PR19, design dimension,
  MEDIUM — the draft claimed "upstream of election, adding no edge," which is false for the
  would-be-winner half):** identifying the would-be winner requires a tentative election, whose
  outcome feeds further gate examination, whose result feeds re-election — **a genuine
  gate→election→gate path within a single cycle.** Evaluated against the constraint rather than
  exempted: the path is (i) bounded and terminating (each candidate's resampled verdict is
  computed once and is final; at most |field| rounds — §5.3's fixpoint), (ii) examination-side
  only (it changes which examinations run, never what generation produces — the backward edge
  into generation is untouched), and (iii) inert under Option S (first verdict stays operative).
  **Verdict: the added path is an examination refinement loop, not an information-integration
  feedback path of the kind the constraint guards** — but that verdict is this design's reading,
  and since the constraint requires evaluation before adoption, the follow-on brief must carry
  this evaluation to whatever session adopts R8-D7, alongside the M/W/S ruling need.

### 4.10 Prerequisite Criterion — applied (engaged)

R8-D1a/D2 produce practitioner-facing outputs (per-cycle practice readings surfaced to the
founder and re-examination prompts surfaced to the agent practitioner), so the criterion's ruled
engagement condition fires. The question asked: does this design build adequate ideas through
examined assent, or produce outputs resembling the destination without building the
prerequisite? **Answer: the entire content of the v1 rule is to convert signals into further
examination** — habitual assent opens a re-examination loop; refusal marks practice honestly
incomplete; nothing simulates progress, and favourable reports deliberately change nothing. The
design that WOULD fail this criterion — an auto-tuning rule that biases generation toward
higher-scoring output so the record *looks* like progress without any agent having examined
anything — is precisely the held weight-touching half. **Stated as a finding: the Prerequisite
Criterion and weights-BLOCKED converge on refusing the same mechanism from independent grounds
(one doctrinal, one adversarial), which is evidence the boundary is drawn in the right place.**

## 5. GS-CYB-1 — the examination surface, gate-respected

**The weights-BLOCKED two-condition gate precedes examination of GS-CYB-1, and this section
honours that by containing no weighting function, no weighting-function sketch, and no
evaluation of any weighting mechanism's merits.** What it lawfully contains, per the R8 prompt's
own scoping: (a) what would need to be true for the gate to open, restated from the rulings; and
(b) the measurement/observation apparatus — which the mentor's Q2c ruling itself routed here.

### 5.1 What would need to be true (restated, not advanced)

Condition (1): the gaming-robustness bar for the weights claim cleared by a route whose scoping
clause addresses the actual supply-provenance exposure — route (ii) is ruled against as worded;
route (i) (independent/ensemble extraction) is the ruled stronger candidate, **to be scoped in
the same session as the emission-hooks provenance finding** (the same architectural intervention
on the same channel, per the 2026-08-24 ruling) — a session that is not this one and is not
scheduled by this document. Condition (2): a separate, independent ruling that the proximity
scorer's **gaming-robustness** is adequate *for use inside a feedback optimisation loop
specifically*; condition (1) clearing does not satisfy it.

*(Corrected at PR19 review, constraint dimension — the first draft asserted condition (2)'s
eventual ruling "will need the scorer's repeatability characterised" and could not be made "on
any basis" without it. That quietly substituted statistical repeatability for the ruled subject,
which is adversarial gaming-robustness — a reasoning-around of the gate, withdrawn.)* **The
honest statement:** R8-D6a's repeatability characterisation is justified entirely on its own
grounds — Probe 3(c)'s sampling-variation-vs-movement gap and the c11 record's demonstrated
variance — independent of GS-CYB-1. Whether repeatability evidence also bears on condition (2)'s
subject is the mentor's to say if that ruling is ever sought; this design takes no position on
what that ruling requires. R8-D6a is *instrument calibration for the harness as a measurement
instrument*, not a step toward, or evidence demanded by, the gated object.

### 5.2 R8-D6 — The observation apparatus (three instruments, all MEASURE, none weighting)

**(a) The verdict-repeatability instrument.** The c11 experiment, generalized and made standing:
a small fixed probe set (3–5 texts spanning the grade range, frozen verbatim with length guards,
including at least one floor-class-borderline text of c11's kind), re-submitted K times per
probe on a periodic founder-elected cadence against the live gate, with per-probe verdict
distributions and per-run floor attributions (`proximity_floors` + the stage-assignment of grave
indicators) recorded over time. What it measures: the instrument's per-input verdict
distribution and its drift across deploys — the quantity Probe 3(c) named latent
(sampling-variation vs movement) and the c11 record now demonstrates is real. Operational
requirements named at design time: probe traffic runs on a dedicated, labelled credential so it
is excludable from every billing/usage/trajectory sample by `credential_ref`; each run's cost is
bounded and disclosed (~$0.15 per 10 calls at today's metering); activation is a founder
election with a stated cadence. **Boundary: the instrument characterises the scorer; nothing
consumes its output as a signal into generation or election.**

**(b) Persisted per-cycle proximity record + circle attribution (leverage item #7, addressed).**
Read-time derivation remains sufficient now (ruled Q2c) and remains the method until the
standing runner's own build. At that build, persistence bundles into the runner's migration
window (the Q-B2 one-window discipline) as: per cycle, the winner's rank **pair** (previous
winner's rank, this winner's rank — raw pair, never a difference; §4.5) plus the cycle's
per-grade verdict counts (the distribution, more informative than any single delta). Circle
attribution rides `target_circle`, which depends on the contested ATRF/S4 migration (§2.3) —
**for historical cycles it cannot be backfilled (confirmed structural finding, ruled A9), and
the design accepts that boundary permanently: circle-attributed observation starts when the
column starts being populated, and the record says so.**

**(c) Election-resolution telemetry (leverage item #5, addressed).** The §6 report's h7
three-way forensic split (uncontested / tie-break / out-scored) becomes a standing per-cycle
field the runner records at election time: `election_basis ∈ {uncontested, tie_break_random,
out_scored}` plus the tie-set size. What it measures: how much of the gate's graded emission the
election actually consumes — the resolution-loss finding (Probe 2(a)) as a longitudinal
observable instead of a one-off re-derivation. This is runner-side (no server election code
exists — grep-verified by the review and re-confirmed at §2.1's read); it lands in the runner's
build brief and its persistence bundles into the same migration window as (b). **Telemetry
records how elections happened; it does not change how they happen.** Changing them is R8-D7.

### 5.3 R8-D7 — The verdict-confidence policy for decision-bearing verdicts (Reading B's design consequence)

The c11 record makes one design question unavoidable: **what confidence does a single verdict
carry when it is load-bearing for a cycle outcome?** Today: a single sample decides — a 1-in-10
extraction event can reject a candidate that nine other examinations of the same text would
elect (and its inverse: a single lenient sample could pass what most examinations would floor).
Designed policy, for the standing runner's brief:

- **Scope: decision-bearing verdicts only** — the would-be winner's verdict and any
  guardrail rejection. Non-decisive candidates keep single examination (cost discipline).
- **Rule: K = 3 examinations of the byte-identical candidate text; the recorded verdict is the
  median rank of the three** (median of ordinal values is well-defined and assumes nothing about
  rank spacing — the equal-spacing sub-question stays open and untouched); all K per-sample
  verdicts and floor attributions persist alongside the recorded verdict (basis disclosure:
  `verdict_basis: median_of_3`, samples attached).
- **Procedural symmetry:** K-sampling applies to the decision-bearing set *regardless of
  direction* — a floor-class first sample and a top-class first sample are re-examined alike. A
  policy that re-runs only adverse verdicts is retry-shopping and is **ruled out by this design
  in advance**. The asymmetric shape is named here precisely so no build session drifts into it.

**⚠ THE DIRECTION-OF-EFFECT DISCLOSURE — folded from PR19 review, where BOTH independent
dimensions raised it (constraint HIGH; design-soundness HIGH). The first draft claimed symmetry
made the policy direction-neutral. That was wrong, and the disclosure now states the number the
first draft omitted.**

**Procedural symmetry does not produce symmetric effect.** Median-of-K suppresses whichever
verdict is the *minority* on a given input. On the only distribution ever measured — the c11
class, per-sample floor rate p̂ = 0.1 — the recorded floor probability under median-of-3 is
3p²(1−p) + p³ = **0.028**: a drop from 10% to 2.8%, i.e. **the live gate becomes ~3.6× less
likely to record a block on a floor-borderline grave candidate.** Applied to the run's own
numbers, had all 9 guardrail rejections been variance events of this class, roughly 2–3 would
have survived as rejections. **On the measured distribution this policy IS a net loosening of
the gate**, and the first draft's inverse case (a lenient sample passing what most examinations
would floor) describes the p > 0.5 regime, for which there is zero observed evidence.

**The doctrinal conflict, named because it is the real question (design-soundness review):**
ADR-010 §4's floors are deliberately **worst-case** operators — the andreia per-indicator
conservative reading was specifically locked at the 2026-06-25 activation-prep *after* a review
reverted a lenient bypass, and the unity-thesis aggregate is a weakest-link minimum. **Median-of-K
at the sampling layer outvotes exactly the conservative minority extraction state that the
doctrine one level down says should bind.** The c11 record itself calls run 8's reading
"individually defensible."

**Therefore R8-D7 is re-stated as a NAMED ELECTION, not a settled design:**

- **Option M — median-of-K** (the first draft's proposal): treats a floor as a sample of a
  distribution; better central estimate; **loosens the gate on the measured class as computed
  above**.
- **Option W — worst-of-K** (the doctrine-consistent alternative, which the first draft failed
  even to name): any floor among the K samples stands — the sampling-layer analogue of the
  weakest-link minimum the engine already applies across domains. Tightens rather than loosens;
  raises recorded-floor probability to 1−(1−p)³ ≈ 27% on the c11 class, i.e. surfaces *more*
  variance-driven rejections, at the cost of amplifying the same variance in the conservative
  direction.
- **Option S — sample and disclose, decide nothing** (the minimal option): record all K verdicts
  and the disagreement, keep the *first* verdict as the operative one, and let the disagreement
  rate itself be the finding. Changes no gate behaviour at all; pure measurement.

**This design does not choose between M, W, and S.** The choice re-litigates what a floor means
under sampling, which is doctrine, not statistics — **recommended as a mentor question rather
than a build-session election** (PR20 applies: the brief must name that the gate's live default
band, the ADR-010 §4 floor semantics, and the guardrail's blocking behaviour are the mechanisms
the ruling lands on). Option S is the only one of the three that is safe to build ahead of that
ruling, because it changes nothing operative.

- **What this is not, under any option:** not a weighting function (it changes the *estimate* of
  the gate's own verdict and adds no generation-side bias); not a change to the ordinal scale
  (ordinal→continuous stays not-recommended); not active until elected.
- **Iteration semantics (folded — the first draft's scope definition was circular).** The
  decision-bearing set is defined by an election over standing verdicts, but K-sampling changes
  verdicts, which changes the set: a rejection whose resampled verdict recovers re-enters the
  field; a winner whose verdict drops is dethroned, and the *new* would-be winner would then hold
  a single-sample verdict while the deposed one held three. **The procedure must therefore be a
  fixpoint: re-elect after each resampled change, K-sample any candidate that newly holds the
  winner slot, and repeat until the election is stable.** Termination is guaranteed (each
  candidate's resampled verdict is computed once and is final, so at most |field| rounds), but
  cost is then **worst-case ~2 extra calls per candidate that ever becomes decision-bearing**, not
  a fixed 48 — the first draft's "≈ 48 additional calls per 20 cycles ≈ $0.70" priced exactly one
  iteration and is corrected to: expected ≈ that figure, worst case ≈ 2 × 120 = 240 extra calls
  per 20 cycles (≈ $3.55) if every candidate is drawn in.
- **Prerequisite Criterion (engaged — the recorded verdict is a practitioner-facing score):**
  under Option S the policy is unambiguously measurement (it records the sampling basis and
  changes nothing), and **passes**. Under Options M and W it changes what the gate records as its
  verdict, so the criterion's question is live: M risks producing a record that *looks* better
  examined while blocking less (the resemblance-without-prerequisite shape) unless the lenience
  shift is disclosed on the record itself; W carries the opposite risk of recording examination
  friction that no additional examination produced. **Neither M nor W passes on the strength of
  the first draft's symmetry argument, which is withdrawn** — passage depends on the disclosure
  riding the record, which is a condition on whichever option a ruling elects, stated here rather
  than assumed.

### 5.4 What §5 deliberately does not contain

No weighting function or sketch of one. No assessment of GS-CYB-1's four proposed components
(held with the gate). No assessment of whether the saturation/reset conditions would break the
*Success to the Successful* archetype (named gap 8 of the review — assessing it is examination
of GS-CYB-1). No position on route (i)'s content beyond the ruling's own words. No claim that
the observation apparatus *moves* either gate condition — it produces evidence a future ruling
would need; the rulings themselves belong to the mentor and founder.

## 6. Q-C2b — the discriminating signature (the causal pattern distinguishing genuine examination from apparent completion)

**The F-Q43 precedent, carried as instructed and applied as the design's spine:** *"detecting
apparent completion is free and worthless; the Q4.3 precedent became useful only when narrowed
to causal order."* The Q4.3 fix that grounds the precedent: the trigger became *commitment
without a PRECEDING assent stage* — order, not presence.

**Scope claims, stated precisely (the first draft's were overstated, caught by PR19 review on
two dimensions):** the *primary* signature (§6.1) is an order test on server-observed records —
attestation with vs without a preceding observed examination — and it is honestly a **windowed
order test**, not full causal linkage: within the window, precedence-before-T is what is tested,
and whether the observed examination *grounded* this assent is beyond it (the §6.1 bound). The
*secondary* readings do more than read around the signal: §6.3 explicitly reads the
self-report's free text to check coherence against the cycle record — so the first draft's
"never scores the self-report's content" was false as a section-wide claim and is withdrawn;
what remains true is narrower and stated at each subsection. **Q-C2a is not re-opened** — the
three ruled questions stay exactly as built; nothing here alters what the signal asks.

### 6.1 R8-D8 — The signature: attestation with vs without observed preceding examination

**The discriminating pattern: a genuine examination leaves server-observed traces that PRECEDE
the attestation; apparent completion produces the attestation alone.** Concretely, for a
completion signal on cycle n received at time T, the server can derive — with no schema change,
no new agent obligation, and no self-supplied proof — whether the window
(cycle n's election time → T] contains any server-observed examination event for the SAME agent
identity (`agent_id` / `credential_ref` stamped on the signal): credential-bearing `/api/reason`
consults (`agent_assessment_history` rows), orientation-reading events, gate calls. The derived
classification is two-valued and deliberately modest:

- `attestation_with_observed_preceding_examination` — at least one such event precedes the
  attestation in the window; refs attached.
- `attestation_without_observed_examination` — none observed. **Stated exactly so, never as
  "unexamined" and never as "fabricated":** the agent may genuinely have examined off-instrument;
  the server can honestly attest only to what it observed. (The vocabulary guard is §6.4.)

Why server-derivation rather than agent-supplied refs: (i) it adds no departure from the ruled
Q-C1 schema (an agent-supplied `examination_refs` field was considered and set aside — it would
be a schema departure needing its own ruling, and a self-supplied proof re-introduces the
self-report reliance the whole design pattern exists to avoid: memory
`never-self-report-at-a-server-boundary`); (ii) it is the R18f discipline transplanted —
attestation backed by verifiable artifacts vs bare attestation — which is this project's proven
pattern for exactly this claim class (PR15).

**Causal-order honesty bound, named:** temporal precedence within the window is necessary but
not sufficient for the examination having *grounded* the assent (an agent could consult on an
unrelated matter in the window). The signature is therefore a *screen*, not a verdict — the
same epistemic class as the kathekon-engagement predicate's arms: it separates
"no observable basis exists" from "an observable basis exists," and stops there. Content-level
corroboration (was the consult ABOUT this idea) is §6.3's bounded reading.

### 6.2 The longitudinal distribution signal (flag-only)

The refusal asymmetry: honest examination under Q-C3's design sometimes refuses (the branch
exists because real examination hits unattestable states) and sometimes reports `habitual`. An
identity whose signal history is uniformly attested-examined-katorthoma — zero refusals, zero
habituals — draws, longitudinally, ONLY a flag: **stated in observability vocabulary as
`uniform_favourable_reporting_distribution`** — the recorded fact and nothing beyond it — a
`self-screen-absent`-class observation (the S9b suppression-watch precedent has exactly this
shape), never a verdict, never a trust event (§4.7's boundary holds here too), never public.
*(The first draft described the flagged distribution as "consistent with apparent completion" —
exactly the character-verdict vocabulary §6.4 prohibits, caught by PR19 review; the flag's
surfaced vocabulary is now specified and is the distribution fact alone.)* Threshold VALUES are
not set at design time — they would be numerology with zero observed signals — but
threshold-setting is bound to a concrete trigger rather than deferred indefinitely: **it occurs
at the same first-N-signals point that opens §4.8's phase 3**, because §4.4's disclosed
incentive gradient makes this flag the only counter-detector for the distribution v1 mildly
rewards, and a perpetually postponed detector would let the gradient operate unobserved.

**Prerequisite Criterion (engaged — a flag about an agent practitioner's reporting pattern):**
the flag records a distribution fact in the vocabulary above, prompts founder attention, and
diagnoses nothing — it builds the conditions for examination (a human looks) rather than
simulating a judgement. Passes under the stated vocabulary; a build that surfaced it as an
apparent-completion determination would fail and is ruled out at design time.

### 6.3 Within-signal coherence (bounded corroboration reading)

`impression_assented_to` and the cycle's stored `proposed_action` are both server-held; a
bounded, deterministic coherence reading (does the attested impression concern the elected
action — the corroboration-check pattern: cross-reference self-report against the record it
claims to be about, verbatim-span-based, no LLM) can mark a signal whose stated impression does
not correspond to the cycle's elected idea. Marked `incoherent_with_cycle_record` — again a
recorded observation, not a rejection: the write already landed (Q-C1: persist on receipt), and
the reading rides the derived layer. Design-not-build; the matching predicate's precision is a
build-session question with the corroboration-check's protective-context lessons carried
(memory `corroboration-tripwire-protective-context-guards`).

**Prerequisite Criterion (engaged — a mark about an agent practitioner's report):** the mark
states a comparison fact between two server-held texts ("does not correspond to the cycle's
elected idea"), attaches to the record for founder attention, and asserts nothing about the
agent's honesty or examination — the fabrication-shaped inference is deliberately left to the
human reader. Passes under that boundary; surfacing it as a deception finding would fail.

### 6.3b — Disclosed bounds of the whole signature family (folded from PR19 review, design dimension)

1. **Saturation for harnessed identities — the sharpest bound.** The population most likely to
   send signals is agents operating under the Gate-1 harness, whose hooks fire credential-bearing
   `/api/reason` consults automatically on prompts and tool actions. For such an identity the
   §6.1 window will contain qualifying examination events on essentially every cycle, regardless
   of whether anything examined the elected idea — ambient instrument traffic is not examination
   of *this* assent, and the two-valued test cannot tell them apart. **For harnessed identities
   the §6.1 signature's discriminating power approaches zero**, and the build must either narrow
   the qualifying-event set (exclude hook-ambient consults; require §6.3 coherence as a conjunct
   before the with-examination label) or disclose the bound on the surfaced reading. Neither
   narrowing is designed here — both alter what the label honestly means and belong with the
   build's precision questions.
2. **Runner/agent identity coincidence.** Nothing observed prevents the runner's and the
   executing agent's credentials sharing an `agent_id` (§4.0 item 3). If they do, the runner's
   own next-cycle gate calls fall inside the window and guarantee a qualifying event. The build
   must exclude the runner's own credential from the qualifying set at minimum.
3. **The window's anchor is a demonstrated-unreliable surface.** "Election time → receipt" uses
   cycle timestamps, and the run's own record has cycles 5, 6, 13 null on BOTH timestamp fields —
   a standing-runner item the §6 report already named ("timestamp-writing should not be
   cycle-outcome-dependent") and which this design now names as a **prerequisite for §6.1 and
   §4.5's within-cycle pair** rather than silently dropping: null-anchored windows are recorded
   `window_unanchored`, never defaulted. The timestamp-robustness fix itself is a runner
   build-brief item (§11).
4. **"Post-execution" is unverifiable.** Under Q1 no execution timestamp exists anywhere, so
   nothing can distinguish a signal sent after execution from one sent before or without it. The
   signature does not claim to; the attestation's post-execution character is itself part of the
   self-report.

### 6.4 The vocabulary guard — Prerequisite Criterion applied (engaged)

The signature produces a diagnosis-shaped output about an agent practitioner, so the criterion
fires. It passes only under a vocabulary discipline that is part of the design: the signature's
outputs are **observability claims** ("no preceding examination was *observed*"), never
character verdicts ("the agent did not examine", "apparent completion detected", "genuine"/
"fake") — the latter exceed the measurement basis and would be the instrument attesting beyond
what it can see (the M-4/Q-C3 refuse-beyond-basis pattern). Under that discipline the signature
*protects* the prerequisite — it keeps the record honest about whether examined assent is
observable — rather than manufacturing a wisdom-resembling output. A build that surfaced
"genuine examination: NO" would fail the criterion and is ruled out at design time.

### 6.5 Where the signature lives, and what consumes it

A derived, server-side reading over existing records (signals + consult history + cycle rows),
surfaced on the founder dashboard fold (R8-D1a) alongside the signal it annotates — **and NOT
included in the runner's structured read (R8-D1b) in v1.** *(Corrected at PR19 review: the first
draft served the observability field to the runner while nothing in v1 consumed it — the exact
exposure-without-function shape §4.3(b)'s own rationale rejects. It is removed; if a future
ruled mechanism needs it runner-side, adding it is that mechanism's design question.)* Consumed
by: the founder's judgement, the longitudinal record, and — if the mentor ever rules an
enforcement question — whatever that ruling licenses. Consumed by nothing mechanical in v1.

## 7. The three un-split Leverage Point Summary items — disposition (none silently dropped)

- **#5 Election-logic resolution — ADDRESSED**: R8-D7 (the gate's graded signal consumed at
  emitted resolution via median-of-K on decision-bearing verdicts) + R8-D6c (election-basis
  telemetry making the resolution loss longitudinally observable). The random tie-break itself
  is retained until the runner's build elects R8-D7 — with telemetry first, so the change's
  effect is measurable against a recorded baseline.
- **#6 Functional (not merely structural) novelty — RE-DEFERRED, with its unlock condition
  named and one structural strengthening designed now.** Functional novelty requires functional
  outcome data, which is completion-signal data, which does not exist (the review's own
  compounding finding: Probe 1(b) × Probe 2(b)); its richer standard becomes designable only
  after §4.8 phase 2–3 has accumulated real signals — sequenced behind GS-CYB-2, not dropped.
  **R8-D9, designable now:** `assessStructuralNovelty` gains a text-similarity dimension against
  the window (the PR19 reviewer's fuzzy-match method operationalized — pure function, no LLM, no
  schema): a candidate near-verbatim to a window member (the c11↔c13 class scored 0.944 against
  a <0.25 field) is structurally non-novel even when its `(targetCircle, domain-combination)`
  key differs. Honest scope: this is still *structural* novelty, strengthened; it is disclosed
  as such, and the function's own placeholder header stays true. Threshold selection is a
  build-session question seeded by the measured 0.944-vs-0.25 separation.

  **Two disclosed costs of R8-D9, folded from PR19 review (design dimension, MEDIUM) — the trade
  is being made knowingly, not discovered later:** (i) since v1 never alters generation (§4.4's
  boundary), a persistently-regenerated proposal — h5's publish-the-SDK shape appeared in most
  of the run's cycles — becomes a **self-renewing suppression loop**: each regeneration is
  similarity-rejected, enters the window, and refreshes its own suppression, while the fact of
  persistent regeneration is itself information the bare rejection would discard. **Design
  addition: a persistence counter** — when a near-verbatim candidate is suppressed ≥N times, the
  dashboard surfaces "this proposal keeps arising" as an observability line (a finding for the
  founder, not a mechanism). (ii) R8-D9 removes the loop's only *natural* repeat-examination
  channel — the c11↔c13 twin pair that grounded this whole session's variance evidence existed
  only because near-verbatim repeats were examined separately in vivo; under R8-D9, c13 would
  have been novelty-rejected and the phenomenon never surfaced by accident. **Mitigation named:
  R8-D6a's probe instrument makes repeat examination deliberate instead of accidental** — the
  trade is accidental discovery for controlled measurement, and it is only sound if R8-D6a
  actually gets built and run; adopting R8-D9 without R8-D6a would blind the system to exactly
  the variance class this session measured.
- **#7 Persisted per-cycle proximity delta + circle attribution — ADDRESSED**: R8-D6b
  (read-time derivation until the runner's build; then rank-pairs + per-grade counts bundled
  into one migration window; circle attribution starts at `target_circle` population, with the
  historical absence permanent and disclosed).

The register's granularity choice (not splitting these into rows) is **endorsed after
examination, not inherited silently**: each proved addressable inside the surfaces this session
already owned (the election inside GS-CYB-1's apparatus and the runner brief; novelty inside the
GS-CYB-2 sequencing; persistence inside the apparatus) — none needed an independent identity,
which is what the row-split would have asserted.

## 8. The multi-scale question and F5's long-horizon question — carried orientation (Q9 honoured)

**No multi-scale operator architecture is proposed, and none will be until the standing runner's
longitudinal operation has produced the trajectory data that would make such a claim honest —
twenty cycles is not that data** (Q9, verbatim re-anchor). What this design contributes is
strictly *instrumentational*: the apparatus of §§4–6 is what would make the multi-scale
coherence question — whether cycle, session, and longitudinal scales produce coherent signals or
are effectively decoupled — **measurable on the standing runner's own data**: per-cycle verdict
distributions and completion signals (cycle scale), the runner's persisted history — which is
also h6 `anomaly_detection`'s named unlock, *"a standing runner must persist the runner's own
history, or h6 is inert by construction"* (session scale), and the accumulated
signal/delta/telemetry record (longitudinal scale). The session-scale substrate (runner history
persistence) is named as a standing-runner build-brief item; its design is the runner's, not the
server's. F5's agent-side scientia-intuitiva question is carried exactly as ruled: named
orientation, never a design directive, indefinitely, until the data exists to engage it
honestly. Nothing in this document claims to implement, approximate, or schedule it.

## 9. Register-carried items deliberately not resolved here (with reasoning)

- **§5d (is oikeiosis-only the doctrinally right reading of a deliberating ruling faculty?)** —
  a doctrinal question whose resolution is ruled engine-class `code-critical` and mentor-owned.
  Checked for dependency: nothing in §§4–7 reads or alters the deliberation reading (the
  D4-completion proxy is consumed by the gate as-is; R8-D7 samples the gate's output without
  interpreting its internals). No dependency ⇒ carried untouched.
- **GS-ATRF-4's vocabulary direction** (held open, owned by no session, per the register) — this
  design *uses* the ruled four-value provenance/credence vocabulary exactly as built (§4.6,
  §6.1's `unknown` handling) and neither extends nor re-opens it.
- **The conjectural entry type ↔ GS-ATRF-4 worked case** — adjacent to §6's epistemic-status
  handling but not needed by it; carried.
- **The capacity axis** (held open, unowned) — untouched.
- **O-C Gate 3** — a parallel track; nothing here waits on it, assumes its outputs, or folds its
  scope in (its premise-shift from the nine-candidate classification — the class is not what the
  one instance suggested — is that track's own input, already recorded there).

## 10. Standing-constraint compliance — the summary index

- **Weights-BLOCKED:** no weighting function designed, sketched, or evaluated (§4.4's held
  half; §5.4's exclusions; R8-D7's non-weighting argument stated inline). No finding pre-answers
  either gate condition; §5.1's first-draft claim about what condition (2)'s ruling "will need"
  was itself flagged by PR19 review as reasoning-around and is withdrawn there — R8-D6a now
  stands on its own instrument-calibration grounds, taking no position on the gate.
- **Q1 (the loop proposes; it never executes):** no design adds any path from a candidate to an
  action-taking tool or scheduler; the completion signal, if it ever arrives, comes from an
  actor who adopted and executed a proposal outside the loop (§4.0 — the producer question), and
  consumption produces examination obligations, not actions.
- **The Prerequisite Criterion**, applied where engaged and shown where not — the full-proposal
  index (extended at PR19 review, which found the first draft's index incomplete): §4.10
  (R8-D1a/D2 — engaged, passes); §5.3 (R8-D7 — engaged; the first draft's symmetry-based pass is
  WITHDRAWN; passage is now conditional per option, with Option S passing unconditionally and
  M/W passing only with the lenience/tightening disclosure riding the record); §6.4 (R8-D8 —
  engaged, passes via the vocabulary guard); §6.2 (the distribution flag — engaged, passes under
  its stated observability vocabulary); §6.3 (the coherence mark — engaged, passes under its
  stated comparison-fact boundary); **checked and not fired:** R8-D1b (a structured read serving
  the runner's own mechanism — no practitioner-facing score/recommendation/diagnosis is
  produced; the practitioner-facing surfaces it feeds are indexed above), R8-D3 (a derived
  observation whose practitioner-facing surfacing is R8-D1a's, already indexed), R8-D4 (an
  honest-absence record; same), R8-D5 (a phasing structure, no outputs), R8-D6a/D6b/D6c
  (instrument calibration and runner telemetry), R8-D9 (a novelty predicate; its
  persistence-counter line is founder observability, not a practitioner assessment).
- **The single-backward-edge constraint:** evaluated per flow (§4.9) — including, corrected from
  the first draft, the genuine within-cycle examination-refinement path R8-D7 adds, which is
  evaluated rather than exempted.
- **Q5b naming:** held — the bare two-word layer term does not appear in this document at all
  (grep-verified after a PR19 NIT flagged even quoted mentions under a strict reading; both
  mention sites were reworded).
- **Flag discipline:** per-feature-per-flag on every proposed surface (§4.3).
- **Name-departures, the full list (extended at PR19 review — the first draft counted two and
  had absorbed a third):** (1) the architecture document's step-1 signal sketch, superseded by
  the ruled/built schema (§4.2); (2) the considered-and-set-aside agent-supplied
  `examination_refs` field (§6.1); (3) the built persistence target — a separate FK'd table —
  vs Q-C1's ruled "new row type, or a new column set on the existing candidate row," a
  2026-08-23 build-session departure this design inherits and names at §4.9 rather than
  packaging inside the "watching-table complex" phrase.

## 11. Proposed follow-ons (NOT authorized by this session; each a founder election)

1. **The producer-question mentor brief** (`governance`, and now the recommended FIRST follow-on
   — ahead of any build): §4.0's items, including the Q-C2a elector/attester tension that only
   the mentor can resolve, and §5.3's M/W/S floor-semantics election, which re-litigates what a
   floor means under sampling and is doctrine rather than statistics. PR20 applies to the brief
   in full (name the live mechanisms each ruling lands on; timestamp-check every present-tense
   fact).
2. **The standing-runner build brief** (`code-*`): R8-D1b + R8-D2/D3/D4 runner-side (with the
   closure predicate and the read-scope capability); R8-D6b/D6c persistence in one bundled
   migration window; R8-D7 in whichever of M/W/S the ruling elects (S buildable ahead of it);
   R8-D9's similarity dimension WITH its persistence counter, adopted only alongside R8-D6a;
   the runner-history substrate (h6's unlock); **the cycle-timestamp robustness fix** (the §6
   report's standing item, load-bearing for §6.3b(3) and §4.5 — carried here explicitly so it is
   no longer a silently-dropped standing-runner item); the cycle-identity handoff to an
   executing agent (§4.0 item 2), buildable only after follow-on 1 answers who that is.
   Server-side halves (the runner read GET; the dashboard fold R8-D1a) are separable smaller
   sessions if the founder prefers.
3. **Phase-1 activation** of the completion-signal write path (founder-walked `code-critical`;
   begins with resolving the contested migration apply status).
4. **The verdict-repeatability instrument** (R8-D6a) as a small standalone build + a founder
   cadence election (dedicated probe credential; excludable traffic).
5. **Records hygiene, no build:** the two incidental discrepancies this session surfaced — the
   dogfood credential's observed 7436/20000 usage meter vs the recorded 5000/200 limits
   (experiment record §6), and the register row's corrected POST/GET phrasing (§2.1, corrected
   in place this session).

## 11b. PR19 independent review — RUN 2026-08-30, findings folded

Three independent fresh-context reviewers ran in parallel, blind to each other, each instructed
to break the design rather than confirm it (parallel independent `Agent` calls — the validated
equivalent when the Workflow opt-in gate is not met, disclosed as such; a first launch of all
three died whole on the account session limit and was relaunched clean after the reset — the
codified PR19 outage class, waited out rather than substituted with first-hand review).
**Outcome: 3 HIGH, 8 MEDIUM, and a set of LOW/NIT findings across the three dimensions — every
confirmed finding folded above at its site, each marked at the point of correction; one finding
refuted with evidence.** The most consequential:

- **The producer question (design HIGH; independently raised by the constraint dimension and by
  this session's own close-turn reflection):** the design consumed a signal whose producer it
  never established can exist under Q1 → **§4.0 added at the head of §4**, phase 3 re-gated,
  and the producer-question mentor brief promoted to the first follow-on. The Q-C2a
  elector/attester tension is named for the mentor, not resolved.
- **R8-D7's direction of effect (raised independently by BOTH the constraint and design
  dimensions, HIGH):** median-of-K loosens the gate ~3.6× on the measured class; the first
  draft's symmetry argument claimed direction-neutrality and is withdrawn → **§5.3 rewritten as
  a named M/W/S election with the computed numbers, recommended to the mentor** (the
  floor-semantics question is doctrine, not statistics).
- **The v1 update rule's overstated loop-closure claim + missing mechanism endpoint + undefined
  closure predicate (design HIGH):** "stops being open-loop" corrected to
  sensor-and-record-half; the CI-4 "transplant" corrected after source verification showed
  `prior_feedback` does not exist on the gate (runner-internal presentation is the honest
  mechanism); a closure predicate defined; the incentive gradient toward uniform-favourable
  reporting disclosed and §6.2's threshold-setting bound to phase 3's trigger.
- Also folded: the §5.1 condition-(2) re-scope withdrawn (constraint MEDIUM — reasoning-around);
  §6's scope claims corrected and §6.3b's bounds added (saturation for harnessed identities;
  identity coincidence; null timestamp anchors; unverifiable post-execution); §6.2's prohibited
  vocabulary replaced and per-output criterion applications added; the §6.5 runner-read
  exposure-without-function removed; §4.9's R8-D7 edge evaluated instead of exempted; the
  persistence-target departure named as the third named departure; the controlled-system-model
  half of GS-CYB-2's question answered explicitly (NO — a measurement archive, not a model);
  R8-D9's self-renewing-suppression cost disclosed with the persistence counter added; the
  claims-vs-source corrections (the h6 quote's altered subject; the "two problems wearing one
  name" attribution; the Q-C4 DB-enforcement overstatement; the 2-rank correction, the exact
  metered cost, and the circle-set qualification in the experiment record).
- **Refuted, with evidence:** the constraint reviewer's finding 11 (the "ruled A9" citation
  "appears to be a citation error") — **A9 is real**: it is the per-item label in the mentor's
  F2-addendum-approval ruling (`2026-08-29-mentor-ruling-f2-addendum-approved-verbatim.md`,
  "A9 — The two data absences as confirmed structural findings"); the reviewer looked in the
  sixteen-questions ruling, where it indeed does not appear.
- **Author-caught during the review window, disclosed as such:** the experiment record's
  indicator tally ("absent ×7, synkatathesis ×2") was inferred from three inspected runs plus
  the floors table rather than observed across all ten — caught by this session's own close-turn
  reflection BEFORE review returned, corrected from direct inspection of every run (true
  distribution 4/2/3/1 across four states; the localization claim unchanged), and then
  independently confirmed exact by the claims-vs-source reviewer.

The claims-vs-source reviewer additionally **confirmed clean at source**: the POST-only endpoint
shape, the full built schema against migration and handler, every ruling quote checked, the
step-1 supersession, the CI-4 mechanism facts on `/api/reason`, all §6-report numbers, all ten
experiment JSONs re-parsed independently (verdict split, floors, indicator distribution,
latencies, timestamps), the c11 text byte-identity, the andreia-floor mechanism at
`layer2-mechanisms.ts` (praxis fires; explicit non-praxis stages do not), the register
correction's scope, the Wilson interval, and the cost arithmetic.

## 12. Honest limits

1. The c11 experiment is n=10, one input, one payload shape, today's instrument — a
   demonstration that grounds a design posture, not a measured rate (the rate instrument is
   R8-D6a, unbuilt).
2. No completion-signal data exists; every consumption design above is calibrated against the
   ruled schema and the run's structure, not against observed signals — which is why activation
   is phased on first real signals (Q8's shape, honoured not hedged).
3. The runner is not in this repo; every runner-side element (R8-D2's posture mechanics,
   R8-D6c, R8-D7's sampling loop) is designed at the contract level and lands in the runner's
   build brief, where the payload-shaping question (whether the runner's guardrail submissions
   carry context beyond the candidate text) must also be settled — the historical version of
   that question remains unverified from this repo.
4. This design was produced by a session inside the system it designs for (the Probe 6
   condition); PR19 independent review is run on it before it is treated as final, and the
   mentor's reception of it is the external check the architecture designates.
5. The §6-report-derived facts cited here are cited from the review and the report, not
   re-derived; the two confirmed structural data absences (completion signals; historical
   circles) bound what any of this can claim about the past permanently.

## 13. Cross-references

- `2026-08-29-mentor-ruling-five-instruction-family-verbatim.md` (Q7 step 5; Q8; Q9; Q11) — the ruling this executes
- `2026-08-30-c11-rerun-experiment-record.md` — this session's founder-elected evidence step
- `2026-08-29-ADVERSARIAL-REVIEW-cybernetic-seven-probes.md` — the named-input review (Probes 1–7; Leverage Point Summary #5/#6/#7; the central tension §4.4 resolves in sequence)
- `2026-08-29-nine-candidate-remediation-shape-classification.md` (+ §10/§11 corrections) — Reading A/B; the twin evidence
- `2026-08-24-agent-cybernetic-control-architecture.md` — GS-CYB-1 §3 / GS-CYB-2 §4; the single-backward-edge constraint
- `2026-08-23-mentor-rulings-atrf-sixteen-questions-verbatim.md` — Q-C1/Q-C2a/Q-C3/Q-C4 (the ruled return path this builds on); Q-B2 (the migration-window discipline)
- `2026-08-27-mentor-instruction-neural-control-anandkumar-verbatim.md` (F3, with ruled corrections), `2026-08-27-mentor-instruction-convergence-cybernetics-neural-operators-verbatim.md` (F4), `2026-08-29-mentor-instruction-structural-causal-apprehension-verbatim.md` (F5) — the frames, presented together
- `2026-08-29-mentor-response-pre-run-research-verbatim.md` — the subsumed multi-scale coherence question
- `operations/primal-substrate-2026-08/00-PRIORITY-INDEX.md` §"Named inputs held for not-yet-opened sessions" — the register (POST/GET drift corrected this session)
- `manifest.md` §"The Prerequisite Criterion" — the binding standing constraint applied throughout
- `website/src/app/api/practice/completion-signal/{route,handler}.ts`, `website/src/lib/substrate/idea-loop-watching-store.ts`, `website/supabase-idea-loop-completion-signals-migration.sql` — the built surfaces verified at source

*End of design. Nothing here licenses a build, a route, a flag, a credential, or a schema; no
open question is resolved beyond what the named evidence resolves; the weight-touching half of
the update rule remains gated and undesigned; the 0h call remains the founder's.*
