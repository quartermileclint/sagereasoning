# Adversarial review of the SageReasoning reasoning harness — seven cybernetic probes

**Date:** 2026-08-29. **Tier:** `governance`, documents-only (ruled Q2d). **Instruction:**
`2026-08-25-mentor-instruction-adversarial-review-seven-probes-verbatim.md` (F2), **as corrected
by** `2026-08-29-F2-briefing-correction-addendum-FOR-RULING.md` — ruled approved
2026-08-29 (`2026-08-29-mentor-ruling-f2-addendum-approved-verbatim.md`), **the addendum wins
wherever it differs from the briefing.** Run condition discharged by the Q1/Q2 rulings
(`2026-08-29-mentor-ruling-five-instruction-family-verbatim.md`).

**Data basis (ruled Q2):** the 20-cycle bounded validation run's production record
(`idea_loop_cycles` + `idea_loop_candidates`, as re-derived in the §6 report), the §6 report
itself, current code at source, and the governing records. **Two absences are confirmed structural
findings, not deferrals** (ruled A9): completion-signal data does not exist (named in **Probe 2**);
per-candidate oikeiosis-circle data does not exist for the historical 20 cycles and cannot be
backfilled (named in **Probe 1**).

**Constraints honoured:** no open question pre-answered (GS-ATRF-1..4, GS-CYB-1, GS-CYB-2 named as
open where relevant, never resolved); no builds recommended — candidate interventions are named
with status only, never advocated; the Stoic goal state is given, not evaluated; ambiguity resolved
to the more conservative reading; **no finding rests on the Rajpal paper's empirical claim** (ruled
A4 — the single-backward-edge constraint stands on its merits regardless); **weights-BLOCKED is a
governing constraint, not reasoned around** — findings bearing on GS-CYB-1 are held pending both
independent conditions. Where the harness is sound, it is said briefly.

**Method note (honest):** this review is conducted by a session inside the system it reviews — the
reflexivity Probe 6 examines. Where that shapes a finding, it is named there rather than claimed
away.

---

## Probe 1 — Reinforcing loop audit

- **Cybernetic failure mode:** deviation from the goal state amplified rather than corrected, via
  loops that feed the scoring regime's own outputs back into what it will next score.
- **Harness surfaces examined:** the watching table → generation step backward edge; the `fresh`
  novelty filter (`assessStructuralNovelty`, `idea-loop-types.ts:318`); the five-value ordinal
  proximity scale; GS-CYB-1's proposed weighting function.
- **Finding: LATENT (weighting loop) / PRESENT-BUT-BOUNDED (novelty loop) / FLOOR EFFECT, NOT A
  LOOP (ordinal scale).** Three distinct results, deliberately not merged:

  **(a) The candidate-weighting reinforcing loop is LATENT, and the constraint blocking it is the
  thing preventing it.** The backward edge exists (watching table → generation step) but carries no
  weighting function: the generation step does not read the proximity score as a graded bias.
  GS-CYB-1 *would* formalise exactly the loop the probe describes — candidates scoring well under
  the current regime weighted up, reinforcing the regime's assumptions — and its own specification
  anticipates this with **saturation and reset conditions** (§3 component 4: reset to uniform if
  weighting concentrates beyond a threshold across N consecutive cycles, with a saturation event
  recorded). **Held pending both weights-BLOCKED conditions; neither is met; this review does not
  assess whether the saturation condition would be sufficient** — that assessment is part of the
  examination the constraint forbids until both conditions are ruled.

  **(b) The novelty filter's loop is PRESENT and bounded — and the harness already says so.**
  Novelty is defined **structurally, not functionally**: `assessStructuralNovelty` matches on
  `(targetCircle, sorted virtue-domain combination)` against the window, nothing about outcomes.
  Structurally-novel-but-functionally-identical candidates are therefore admissible by
  construction, and would accumulate in the watching table as apparent progress. **Two things bound
  this, both verified:** the function's own header names the standard "a PLACEHOLDER FOR A RICHER
  STANDARD… provisional-by-design rather than settled" (2026-08-19), and the run's own evidence
  cuts against the depletion reading — the mentor-settled domain-pairing finding ("the pool is not
  depleted; the gate is working") establishes the gate discriminates at combination density, with
  37 of 120 candidates novelty-rejected. **The severity is what the harness cannot see, not what it
  got wrong:** no functional-outcome signal exists to detect the failure mode if it did occur,
  because — the confirmed structural finding below — outcome data does not exist at all.

  **(c) The ordinal scale produces a FLOOR EFFECT, not a reinforcing loop, and the difference
  matters.** A five-value enum cannot represent within-grade variation, so an agent at `deliberate`
  generating `deliberate`-assessed candidates registers no movement. But nothing feeds that
  registration back into generation (see (a)), so there is no amplification path — the deviation is
  *invisible*, not *amplified*. **Implication for corrective capacity:** a floor effect degrades
  the comparator's ability to detect small real improvements; a reinforcing loop would actively
  drive away from the goal. The harness has the former. The distinction stops holding the moment
  GS-CYB-1's weighting function exists — at that point the floor effect and the reinforcing loop of
  (a) become the same mechanism.

  **CONFIRMED STRUCTURAL FINDING (ruled A9, named here):** **per-candidate oikeiosis-circle data
  does not exist for the 20 historical cycles and cannot be backfilled.** `target_circle` rides the
  authored-unapplied ATRF/S4 migration as a deliberately-optional insert key
  (`idea-loop-watching-store.ts:175-198`); every historical row is NULL on it. Consequence for this
  probe specifically: the reinforcing-loop question at the *circle* level — whether generation
  concentrates in circles that previously scored well — **cannot be assessed on this corpus at
  all**, in either direction. The §6 report's own GS-ATRF-1 table independently records the circles
  dimension as "**Inoperative within a cycle — gap-level, uniform by construction (M5)**," which is
  a second, different reason the signal is unavailable. Carried as a standing-runner design
  observation.
- **Diagnostic tool applied:** causal loop diagram reasoning over the single backward edge;
  definitional analysis of the novelty predicate (structural vs functional equivalence classes).
- **Severity: SIGNIFICANT** — not for a loop operating now, but because the one architectural
  addition most likely to be built next (GS-CYB-1) is precisely the loop-closing change, and the
  data that would let anyone verify its effect (functional outcomes, circle-level attribution) is
  the data the harness does not collect.
- **Interaction effects:** compounds with Probe 2 (no completion signal ⇒ no functional-outcome
  signal to distinguish structural from functional novelty) and Probe 7's *Success to the
  Successful*; mitigated by Probe 5's finding that the highest-leverage interventions are
  information-flow-level and currently blocked or unbuilt.

## Probe 2 — Balancing loop integrity

- **Cybernetic failure mode:** error correction weak, delayed, or structurally absent.
- **Harness surfaces examined:** the guardrail gate's emitted resolution vs what the **election
  logic** consumes (the ruled A6 question); the completion signal return path; the ATRF's pre-task
  contingency reasoning.
- **Finding: PRESENT — one confirmed absent balancing loop, and one confirmed resolution loss.**

  **(a) Resolution loss between the gate and the election step — the A6 question, answered.** The
  gate is **not** binary: it emits a graded five-value `katorthoma_proximity` plus a three-way
  recommendation (proceed / pause_for_review / deny), and the graded value is persisted per
  candidate (`idea_loop_candidates.guardrail_proximity`,
  `idea-loop-watching-store.ts:156-172`; the graded shape is confirmed at addendum A6). **What the
  loop consumes is narrower than what the gate emits, and
  the evidence is in the run's own record.** The election is runner-side (the server records
  `winner_candidate_id`; no election, tie-break, or scoring logic exists server-side — grep-verified),
  and the §6 report's ruled h7 three-way split shows the consumption pattern precisely: **4 of 5 h7
  wins were ties broken by the `r mod n` phantasia draw, 1 was uncontested, and 0 were won by
  out-scoring a contested field on proximity.** A graded signal whose ties are broken by a random
  draw is being consumed at a resolution coarser than it is emitted at — the ties exist *because*
  candidates share a coarse grade. **This is the finding: the gate's resolution loss is not at the
  gate, it is between the gate and the election.** Conservative reading applied: this is
  demonstrated for h7's win set (the only set with a ruled per-cycle breakdown), not asserted for
  all 15 winners.

  **(b) The completion-signal balancing loop is ABSENT — confirmed structural finding (ruled A9).**
  **No completion-signal data exists**: the run produced none, and `POST /api/practice/completion-signal`
  (built dark behind `SUBSTRATE_COMPLETION_SIGNAL_ENABLED`, ruled at ATRF Q-C1) postdates the run
  and is unconsumed. So the loop cannot learn from the controlled system's response to its
  effectors. **Stochastic consequence, stated conservatively:** without outcome feedback the
  trajectory is not a *corrected* walk. Whether it is an undirected random walk or a **biased walk
  in the direction of the generation step's own priors** cannot be distinguished from 20 cycles —
  but the run's own record shows a *stable non-uniform* heuristic productivity distribution (h7 5,
  h3/h4 3 each, h1/h2 2 each, h5 0, h6 0), which is what a prior-biased process looks like and is
  *also* what genuine heuristic quality differences look like. **The honest finding is that the
  harness has no mechanism that would tell these apart.** Note the mechanism's status precisely: an
  absent loop whose channel is designed and built-dark, not an unruled question (ruled A8).

  **(c) The ATRF's pre-task reasoning is FEEDFORWARD, not a balancing loop.** It anticipates
  deviation before execution from priors; it does not measure realised deviation and correct. The
  difference bites exactly where priors do not cover the task class — and feedforward alone has no
  mechanism to discover that its priors failed, because discovering that requires (b), which is
  absent. **The two findings are one gap seen from two sides.**
- **Diagnostic tool applied:** Wiener's feedback-integrity analysis; comparator resolution analysis
  against the actual consumer (not the emitter).
- **Severity: CRITICAL** — a control system whose only outcome-measuring loop does not exist is
  operating open-loop on its central claim; and the one graded signal it does have is being
  consumed at tie-break resolution.
- **Interaction effects:** (b) is the root of Probe 3's delay finding (a delay of *unbounded*
  length is indistinguishable from absence), Probe 4's stochastic characterisation, and Probe 5's
  ranking; (a) compounds Probe 1(c)'s floor effect — coarse grades cause the ties that the random
  draw then resolves.

## Probe 3 — Delay analysis

- **Cybernetic failure mode:** information delays producing oscillation, overshoot, or drift.
- **Harness surfaces examined:** the watching table as a delayed feedback path; project-context
  injection into Layer-1 extraction (**scoped to `/api/reason` only**, ruled A3); proximity update
  frequency.
- **Finding: DRIFT, NOT OSCILLATION — and one sensor-bias finding.**

  **(a) The watching-table path: drift, and for a structural reason.** Oscillation requires a
  signal that arrives *late*; the completion signal does not arrive *at all* (Probe 2b). The loop
  therefore cannot overcorrect on stale information — it cannot correct at all. **Conservative
  reading: this is not "no delay problem," it is a delay of unbounded length**, which presents as
  drift. The one measured latency the record does carry is unrelated to outcomes: mean ~7.2 minutes
  per cycle over the 17 timestamped cycles, with **cycles 5, 6, 13 null on both timestamp fields** —
  the §6 report names this as a standing-runner design item (timestamp-writing should not be
  cycle-outcome-dependent), and this review carries it forward unchanged rather than imputing.

  **(b) Sensor bias, not sensor noise — on `/api/reason` only.** `getProjectContext('condensed')`
  is injected into every `/api/reason` Layer-1 extraction (`route.ts:1413-1418,1454`); the **live
  guardrail sandwich branch injects none** (ruled A3, verified at source). The distinction the probe
  asks for is answerable and the answer is **bias**: the injected block is not random with respect
  to the impression — it is the project's own current-phase narrative, systematically shifting
  extraction toward the project's active concerns. The evidence is not theoretical: **cycle 3 of the
  run was a `dependency_unavailable` caused by exactly this** — an unlabelled `recent_decisions`
  block read by the model as the practitioner's own reasoning, served as a plausible, well-formed,
  substantively wrong 200 (fixed by labelling, 2026-08-11; the **architectural** fix — removing
  injection from API-key-authenticated calls — remains ruled and unbuilt). **Its current magnitude
  is 5,616 characters** (ruled A2), and that magnitude grows every time the register is extended.
  **Scoping consequence for the review's own claims:** because the gate is injection-free, the
  harness's *enforcement* surface is not exposed to this bias; its *assessment* surface is.

  **(c) Per-cycle update frequency vs a slowly-changing goal state: LATENT high-frequency noise on
  a low-frequency signal.** Virtue/eudaimonia change slowly; proximity is re-measured per cycle. A
  one-rank move between adjacent cycles is as consistent with sampling variation as with genuine
  movement, and **the harness has no mechanism that distinguishes them** — the same gap Probe 2(b)
  names. Two independently-recorded findings corroborate the sampling-variation reading rather than
  the movement reading: the standing 28-second at-action timeout class (a session-scoped
  measurement in the record delivered 8 of 39 consults, ~21%, with a survivorship warning that the
  delivered subset skews simple), and the `computeDispositionStability` mean-blindness already
  corrected under M-4. Conservative reading applied: this is a latent property of the measurement
  cadence, not a demonstrated false-correction event in the 20-cycle record.
- **Diagnostic tool applied:** Wiener's delay-and-oscillation analysis; signal-vs-noise frequency
  separation; bias-vs-noise decomposition of the sensor input.
- **Severity: SIGNIFICANT** — (b) has a demonstrated live failure instance and an unbuilt ruled
  fix; (a) and (c) are the same absent-loop root as Probe 2.
- **Interaction effects:** (b) compounds Probe 6's reflexivity finding (the system's own record is
  injected into the sensor that assesses the system's work) and Probe 7's *Tragedy of the Commons*;
  (a)/(c) inherit Probe 2(b)'s root.

## Probe 4 — Stochastic stability

- **Cybernetic failure mode:** goal-directed behaviour not maintained under noise; accumulation
  without mean reversion.
- **Harness surfaces examined:** the generation step's candidate distribution under prompt
  perturbation; the proximity trajectory over the run; the trust record as an accumulating stock
  under the emission-hooks provenance gap.
- **Finding: PRESENT (unstabilised variance) / UNDETERMINED-BY-CONSTRUCTION (trajectory) /
  BOUNDED-AND-NOW-INSTRUMENTED (trust record).**

  **(a) Candidate-distribution variance is not stabilised by the gate — and the run shows the
  mechanism.** The gate is per-candidate; it filters, it does not shape the distribution. The run's
  own numbers: 120 candidates, 9 guardrail-rejected, 37 novelty-failed, **74 passed both gates** —
  so the filters admit a wide field, and the *elected* candidate is then chosen runner-side, in 4
  of h7's 5 wins by random tie-break (Probe 2a). **A high-variance candidate distribution passes
  through as long as the elected candidate clears** — exactly the failure mode the probe names,
  demonstrated rather than inferred. No prompt-perturbation experiment exists in the record; that
  measurement is not available and is **named as a gap**, not inferred from general principles.

  **(b) The proximity trajectory's process type is UNDETERMINED — and that is the finding.** With
  no completion-signal loop (Probe 2b) and no formalised error signal (GS-CYB-1, blocked), the
  trajectory depends entirely on generation priors and the gate's floor. Twenty cycles, spanning a
  ruled early/signal-producing split (cycles 1–10 thin/degenerate signal; 11+ signal-producing), is
  **not enough to distinguish mean-reverting from biased-walk behaviour**, and the §6 report itself
  declines a period-split re-analysis. Conservative statement: **the harness cannot currently be
  shown to be mean-reverting around its goal state, and no mechanism in it would produce mean
  reversion** — mean reversion requires a restoring force proportional to deviation, which is
  precisely the absent balancing loop. Stated as absence of evidence *and* absence of mechanism,
  not as evidence of a random walk.

  **(c) The trust-record stock: the degradation is bounded below a measured ceiling for the
  stamped population, and unmeasured for 14.2% of it.** The
  probe's question — bounded or unbounded — has a determinate answer: **bounded by the l1_supply
  write proportion**, which is currently **zero** (ruled A1: both `l1_supply` credentials revoked
  2026-08-25, founder-verified `active_with_l1_supply = 0`; **zero supplied extractions across
  3,200 recorded consults**; 2,746 stamped `server`, **454 pre-stamp genuinely unknown — not inferred clean, per the ruled
  addendum wording**). **454 of 3,200 rows, 14.2% of the stock, have unmeasured provenance and no
  ledger can ever repair that** — the bound holds only for the 85.8% stamped population. The
  emission-hooks asymmetry itself is real and unenforced (`emitAccreditationTrustEvents` gates on
  Ed25519 SIGNATURE verification, not on EXTRACTION provenance — its sibling
  `emitOrientationReadingTrustEvent` has the extraction-provenance check this one lacks). For the
  stamped population, the *stock's* signal quality does not degrade without limit — it degrades in
  proportion to a quantity presently at zero. **The balancing loop is now built and running record-only**
  (provenance ledger slices 1–2 live 2026-08-26; enforcement is slice 5, gated on the two-week C2
  window). **Held, not resolved:** whether adding provenance verification retroactively changes the
  existing record or only gates future minting is answered by the ruled design — it gates future
  minting; the 454 remain unmarked (Probe 7's *Limits to Growth* item).
- **Diagnostic tool applied:** stochastic process classification (mean-reverting / random /
  biased); stock-and-flow analysis of the trust record with the contaminating flow measured.
- **Severity: SIGNIFICANT** — (a) and (b) are structural and unresolved; (c) is the one place the
  harness has recently *built* the balancing loop the probe looks for, and it is disclosed as
  phased rather than claimed complete.
- **Interaction effects:** (b) inherits Probe 2(b) entirely; (a) compounds Probe 1(b) (structural
  novelty admits functionally identical candidates into an already-wide field); (c) is the counter-
  example that shows the project closes these gaps when it can see them — relevant to Probe 6.

## Probe 5 — Leverage point analysis (Meadows)

- **Cybernetic failure mode:** intervening at low-leverage points while high-leverage structure
  goes unaddressed.
- **Finding: the harness's highest-leverage points are its most-blocked ones — a coherent picture,
  not a coincidence.**

| Meadows level | Intervention | Leverage assessment | Status |
|---|---|---|---|
| **Parameters** | Proximity ordinal → continuous | **Low.** Changes resolution, not structure. Would reduce Probe 1(c)'s floor and Probe 2(a)'s tie frequency, but a finer signal that nothing consumes changes no behaviour. **And the equal-spacing question is an open GS-CYB-1 sub-question** — a continuous scale would *assume* what is explicitly not settled | Open sub-question; not scoped |
| **Buffers** | The watching-table window (M7 / EVIDENCE_FLOOR) | **Low-medium.** Governs novelty sensitivity and the starved-window honest outcome; already ruled and functioning as designed | Ruled, working |
| **Feedback strengths** | The completion-signal return path | **HIGH — the highest currently-available.** Closes the absent balancing loop (Probe 2b). But note the honest bound: it adds a signal the generation step **may or may not use** — its leverage is realised only in combination with an update rule, which is GS-CYB-2, which is gated | Endpoint built dark; consumption + update rule are standing-runner design (GS-CYB-2, shape (a)) |
| **Information flows** | Removing project-context injection from API-key-authenticated `/api/reason` calls | **HIGH.** Changes what the sensor receives on **every** assessment call; the bias propagates to every downstream signal (Probe 3b), and it has a demonstrated live failure instance | **Ruled and unbuilt**, deliberately unscheduled |
| **Rules** | The gaming-robustness bar / GS-CYB-1's two-condition gate | **HIGH.** Its operative effect on this analysis is that the Probe 1(a) reinforcing loop is not currently permitted to close. Its merit is not assessed here — assessing it is examination of GS-CYB-1, which the gate itself forbids; the constraint is named and the finding held | **BLOCKED** — both conditions unmet; route (ii) ruled against; route (i) unscoped |
| **Goals** | The Stoic telos as encoded goal state | **Highest in principle — and the probe's own test is the sharp one.** Verdict: **partially operationalisable.** The sensor does extract goal-relevant features (verified: passions, circles, kathekon factors, virtue domains) and the comparator does measure deviation (graded proximity) — so the goal state is *not* merely a specification the harness cannot operationalise. **But the operationalisation is bounded in ways the project has itself published:** the deliberation reading is oikeiosis-only (a proxy, publicly disclosed with a scope note, doctrinally acknowledged as not the hegemonikon's full deliberative state); the kathekon reading defaults to `contrary` on sparse extraction; and the katorthoma the goal names is, by the doctrine's own account, not reachable by scaffolding | Live, bounded, disclosed |

*(The Paradigms level is the Goals row above, read at maximum abstraction — F2's own five-item list
does not name a distinct paradigm-level item, and this review does not add one: the mentor's
same-day Prerequisite Criterion ruling is the standing-runner's own governance apparatus, and
ranking it inside a probe that apparatus produced would be the reflexivity failure Probe 6 names,
not an independent finding.)*

- **Diagnostic tool applied:** Meadows' leverage hierarchy, applied lowest-to-highest with status.
- **Severity: SIGNIFICANT** — the two highest *available* interventions (completion-signal
  consumption; injection removal) are respectively gated and deliberately unscheduled, while the
  rules-level intervention that is blocked is blocked by ruling, not by oversight. **The finding:
  the highest-leverage items accumulate as a queue of ruled-and-unbuilt interventions whose
  collective absence defines the current control architecture — a structural fact independent of
  whether each individual ruling was correct, which this review does not assess.**
- **Interaction effects:** every row inherits Probe 2's absent loop; the rules row is the direct
  counterweight to Probe 1(a) and Probe 7's *Success to the Successful*.

## Probe 6 — Second-order cybernetics: observer effects and reflexivity

- **Cybernetic failure mode:** a system that observes and modifies itself lacking any signal
  independent of its own prior assessments.
- **Inherited records (ruled Q2b — cited, not re-derived):** the self-examination-moment
  investigation (`operations/future-directions/2026-08-15-self-examination-moment-investigation-and-response.md`,
  incl. the P-A1 two-guide convener ruling and its **correlated-blind-spots residual** — shared
  base-model priors survive the two-guide constraint) and the project-reflections examination
  (`operations/reflections-examination-2026-08/2026-08-23-project-reflections-findings-record.md`,
  105 close-turns, IS-1/IS-2/IW-2/IW-4/SC-2 findings).
- **Finding: PRESENT on all three sub-questions — the harness's deepest structural condition.**

  **(a) The evaluative engine assessing its own outputs: reflexivity PRESENT, with two partial
  breakers.** The engine assesses impressions; assessments feed the record; the record feeds
  generation; generation produces what the same engine assesses. **What breaks it, partially:** the
  practitioner's own examined experience is the correction signal the architecture designates
  (ADR-012's own framing — the harness is a scaffold for the practitioner's synkatathesis, not a
  physical simulator with ground truth), and the mentor consultation is a genuinely external
  ruling authority whose rulings have repeatedly overturned in-system conclusions (M-1 overturning
  a session's own committed decision; the M-4 return; route (ii) ruled against). **What does not
  break it:** for the *agent* practitioner, the loop is tighter — the runner's candidates are
  assessed by the engine whose priors shaped the context the candidates were generated from
  (Probe 3b), and **`project_context` injection makes this literal**: the system's own decision
  record is injected into the sensor assessing work on that record. **The correlated-blind-spots
  residual applies here too**: reviewer agents and reviewed agent share base-model priors, so
  independent review reduces but does not eliminate the shared-prior failure mode.

  **(b) The founder's triple role: observer effect PRESENT and structurally unavoidable.** Designer,
  primary practitioner, and governance authority are one person. **The reflexivity risk is real and
  the record shows it operating in both directions:** the project's own reflections examination
  found the founder's virtue trajectory shaping design (IS-1's verify-against-source discipline
  encoded as PR25 *because* the corpus showed it failing), and the mentor's own ruling on this
  addendum reads the project's governance as exhibiting the structure the harness asks of
  practitioners — an assessment of the founder's practice by the authority the founder consults.
  **The conservative statement: the governance layer's independence rests on the mentor relay, and
  the mentor's inputs reach the system through the founder.** No mechanism external to that chain
  exists. This is named, not solved; the two-guide convener ruling is the project's own partial
  answer, and its author flagged the residual.

  **(c) The trust record cannot attest to the quality of its own attestation — and this is now
  partially, honestly, disclosed.** The second-order failure is real: the emission-hooks provenance
  gap means some minted events carry no extraction-provenance check, and **the inaccuracy is not
  detectable from within the trust record** (provenance rides outside the signed bytes; a supplied
  extraction is byte-indistinguishable). **What has changed, and matters for this probe's severity:**
  the record now *says so* — `attests[1]` is scoped and a `does_not_attest` extraction-origin item
  is live (2026-08-25), with the coverage-gap commitment stated in the future tense because the
  mechanism is not yet enforcing. **This does not close the second-order gap — it discloses it.**
  The trust record still cannot attest to the quality of its own attestation from inside itself;
  what changed is that the LIMIT of that inability is now named on the public surface rather than
  silent. Enforcement is slice 5, gated; the 454 unmarked historical consults remain unmarked
  permanently — the disclosure does not repair the population, only the claim about it.
- **Diagnostic tool applied:** second-order cybernetics (von Foerster/Maturana/Varela — observer
  inside the observed system); independent-signal analysis (what, if anything, is not downstream of
  the engine's own priors).
- **Severity: CRITICAL** — irreducible: every correction channel the system has is either inside
  the system or reaches it through a single human. The asymmetry F2's own framing names applies here
  most sharply — a harness that fails to regulate toward virtue *while attesting that it does* is
  the serious failure, and (c) is exactly that class, now disclosed rather than hidden.
- **Interaction effects:** (a) compounds Probe 3(b) and Probe 1; (c) is Probe 4(c) and Probe 7's
  *Limits to Growth* seen from the observer's side; **this review is itself an instance of (a)** —
  conducted by a session inside the system, using the system's own records as evidence.

## Probe 7 — Archetype identification

- **Cybernetic failure mode:** recurring structural patterns predicting characteristic failures.

  **Fixes that Fail — LATENT.** The guardrail gate addresses individual candidate quality without
  addressing the generation step's structural priors. The run's own evidence: 9 of 120 candidates
  rejected, all at the `reflexive` floor, while the **generation priors that produced the field are
  untouched** — and the mentor-ruled calibration limit ("the guardrail's extraction cannot reliably
  distinguish between a proposal that exhibits a conduct and a proposal that describes a conduct in
  order to remediate it") means the fix can misfire against exactly the remediation-shaped
  candidates that would correct the priors. **The hypothesis that this systematically depressed
  remediation-shaped candidates is NOT tested** — the §6 report names the gap explicitly, and the
  nine-candidate classification that would test it is ruled a **separate governance act** from this
  review (Q7). Named, not asserted.

  **Shifting the Burden — PRESENT.** Project-context injection is the symptomatic solution to a
  sensor lacking information; the fundamental problem is the sensor's own signal adequacy. The
  archetype's prediction — the symptomatic fix reduces pressure to address the root — is
  **observably realised**: the architectural fix is *ruled* and remains *deliberately unscheduled*,
  while the injected register keeps growing (4,159 → 5,616 characters between 08-19 and 08-24, each
  growth a further increment of the symptomatic solution). Conservative note: the deferral is a
  ruled, disclosed founder election, not neglect — but the archetype describes the dynamic
  regardless of whether each step is deliberate.

  **Tragedy of the Commons — LATENT, and the commons is smaller than the probe assumes.** Generation,
  guardrail evaluation, and ATRF reasoning do draw on shared context, but the injection is
  **`/api/reason`-scoped** (ruled A3) — the gate does not draw on it. So the depletion, where it
  occurs, is on the assessment path. 5,616 characters against modern context windows is not
  scarcity-of-tokens; **the depleted resource is attention, not capacity** — the injected block
  competes with the impression for the extraction's attention, which is exactly the cycle-3 failure
  mode. The unbuilt architectural fix is the balancing loop that would prevent it.

  **Limits to Growth — PRESENT, with the balancing loop now installed and not yet enforcing.** The
  trust record accumulates events (reinforcing); provenance verification is the balancing loop that
  limits which are minted. **Without it the growth trajectory is unbounded in count and
  proportionally degraded in signal quality** — bounded, per Probe 4(c), by an l1_supply proportion
  currently zero. **The limit when the loop is added is ruled and known:** the ledger gates *future*
  minting only; **the 454 pre-stamp consults are permanently unmarked**, and the record says so.
  Retroactive change is not on the table — which is the honest shape, and also means the archetype's
  characteristic overshoot (growth past a limit discovered late) has already partly occurred and is
  disclosed rather than reversible.

  **Success to the Successful — LATENT, and specification-anticipated.** If GS-CYB-1's weighting
  function were built, virtue domains scoring well would draw more generation resource, producing
  more candidates there, reinforcing the weighting. **The specification anticipates the archetype
  with saturation and reset conditions** (§3 component 4) and a **floor preventing permanent
  exclusion** of any domain or circle (GS-CYB-2 step 3). **Whether those are sufficient to break the
  dynamic is NOT assessed here** — that is examination of GS-CYB-1, which the weights-BLOCKED
  two-condition gate forbids until both conditions are ruled. What this review states: the archetype
  is latent *in the specification*, the specification names the counter-mechanism, and the run
  already shows the raw material for the dynamic — a stable non-uniform heuristic productivity
  distribution, with h5's zero (competitive, undiagnosed direction) as the relevant instance; h6's
  zero is a conditional instrumentation gap (§6 report, session-boundary flattening), not a second
  instance of the same finding.
- **Diagnostic tool applied:** Meadows' system archetypes, each tested against a named harness
  surface and the run's own record rather than against the design's intentions.
- **Severity: SIGNIFICANT** — three archetypes present or observably realised; the two most
  dangerous (*Success to the Successful*, *Limits to Growth*) are respectively blocked by a ruled
  gate and instrumented by a phased build.
- **Interaction effects:** *Shifting the Burden* and *Tragedy of the Commons* share the injection
  surface (Probe 3b); *Limits to Growth* is Probe 4(c) and Probe 6(c) in archetype form; *Success to
  the Successful* is Probe 1(a) in archetype form.

---

## Leverage Point Summary (Meadows-ranked, highest first)

**Not ranked here, per Probe 5's own note:** the 2026-08-29 Prerequisite Criterion — a same-day
mentor ruling from the governance apparatus this review reports to; ranking the reviewing
authority's own output inside the review's ranked findings would be the reflexivity failure Probe 6
names, not an independent leverage-point finding.

| # | Leverage point | Level | Surfaced by | Harness surface | Status |
|---|---|---|---|---|---|
| 1 | **The weights-BLOCKED two-condition gate** — its operative effect held, its merit unassessed | Rules | Probes 1(a), 7 | GS-CYB-1's weighting function | **BLOCKED**; both conditions unmet; route (i) unscoped |
| 2 | **Removing project-context injection from API-key-authenticated `/api/reason`** | Information flows | Probes 3(b), 6(a), 7 | `route.ts:1413-1418` | **Ruled and unbuilt**, deliberately unscheduled |
| 3 | **Completion-signal consumption + update rule** | Feedback strengths | Probes 2(b), 3(a), 4(b) | `POST /api/practice/completion-signal` (dark); GS-CYB-2 | Endpoint built; consumption is standing-runner design, shape (a) |
| 4 | **Provenance enforcement (ledger slice 5)** — the trust record's balancing loop | Feedback strengths | Probes 4(c), 6(c), 7 | `emitAccreditationTrustEvents`; `agent_provenance_gaps` | Record-only live; each of slices 3 and 5 independently gated on the C2 window (no stated slice-3-before-slice-5 dependency) |
| 5 | **Election-logic resolution** — what the runner consumes of the gate's graded signal | Information flows | Probe 2(a) | Runner-side election; `guardrail_proximity` | **Unscoped** — surfaced by this review |
| 6 | **Functional (not merely structural) novelty** | Rules | Probe 1(b) | `assessStructuralNovelty` | Self-declared placeholder; richer standard undesigned |
| 7 | **Persisted per-cycle proximity delta + circle attribution** | Buffers/parameters | Probes 1, 3(a) | Watching table | Read-time derivation sufficient for now (ruled Q2c); persistence is standing-runner design |

**Unranked but named:** the ordinal→continuous parameter change is *low* leverage and would
prejudge GS-CYB-1's open equal-spacing sub-question; it is listed here only to record that this
review does not recommend it.

## Stochastic Stability Assessment

The harness, as it currently operates, most closely resembles a **filtered biased walk** — not a
random walk, because the guardrail gate imposes a hard floor that removes the worst-scoring
candidates and the novelty gate removes structural repeats, so the process is bounded below and
prevented from cycling; and not mean-reverting, because mean reversion requires a restoring force
proportional to measured deviation, and the harness has no such force: the completion-signal
balancing loop does not exist (confirmed structural finding), the proximity score is a point
estimate that no consumer reads as a graded error signal, and the one graded signal the gate does
emit is consumed at tie-break resolution by a runner-side election that resolved 4 of 5 observed h7
wins by random draw. The drift direction is set by the generation step's priors — which are
themselves shaped by an injected project-context block on every assessment call — and nothing in
the loop measures whether that drift moves toward or away from the goal state, because outcome data
does not exist. **The conditions under which it would transition:** it becomes a genuine random
walk if the gates' filtering were removed or their thresholds became non-binding; it becomes
Ornstein-Uhlenbeck-type mean-reverting only when a measured outcome signal feeds back into
generation under an update rule whose form is GS-CYB-2, open — this review does not specify what
that rule must be, only that its absence is why no correction currently occurs. **The single most
important structural change toward mean reversion is closing the completion-signal loop — building
the return path's consumption and GS-CYB-2's update rule.** That same change is the one this
review's own Probe 1(a) names as the reinforcing loop's precondition: an update rule that biases
generation using the harness's own score is structurally the same mechanism whether the direction
is corrective or self-reinforcing, and nothing in the harness as it stands distinguishes the two in
advance. **This tension — the highest-leverage stabilising change and the highest-risk reinforcing
change are the same code — is this review's central structural finding.** Whether the project's
current sequencing (route (i) before route (ii); both weights-BLOCKED conditions ruled
independently; design-with-disclosed-absence at the standing-runner session) is adequate to that
tension is not assessed here; it is named as the mechanism by which the tension is currently held.

---

## Named gaps (per F2's constraint: a named gap is an honest finding)

1. **Completion-signal data** — does not exist (ruled A9; Probe 2b).
2. **Per-candidate oikeiosis-circle data** for the 20 historical cycles — does not exist, cannot be
   backfilled (ruled A9; Probe 1).
3. **Prompt-perturbation measurement** of the generation step's candidate distribution — never run
   (Probe 4a).
4. **The nine-candidate remediation-shaped classification** — ruled a separate governance act
   (Q7); Probe 7's *Fixes that Fail* is named LATENT rather than PRESENT for want of it.
5. **A period-split (cycles 1–10 vs 11–20) re-analysis** — named in the §6 report, not performed
   there or here.
6. **Elapsed-time data for cycles 5, 6, 13** — null on both timestamp fields.
7. **The 3 `examined` orientation-reading classifications** (of 22) — unexplained in the §6 report
   and unexplained here.
8. **Whether GS-CYB-1's saturation/reset conditions would break *Success to the Successful*** — not
   assessed; assessing it is examination of GS-CYB-1, which the weights-BLOCKED gate forbids.

## Independent adversarial review of this review (run before it is finalised)

Per the F2 instruction's own governing constraints and the project's PR19 practice, two independent
fresh-context reviewers examined this document before it stands. **Every confirmed finding folded
above:**

- **Claims-vs-source:** 3 findings, all folded — h5/h6 zeros wrongly paired as equivalent evidence
  (h6's zero is a conditional instrumentation gap, not a permanent one; corrected in Probes 3(c) and
  7); "no provenance check" corrected to "no *extraction*-provenance check" (the function does gate
  on signature verification); the leverage-summary's slice-3-before-slice-5 dependency corrected to
  "independently gated" (unsourced in the record). All quoted numbers (120/9/37/74 candidates,
  15/3/2 outcomes, the h7 4/1/0 split, $6.82, 3,200/2,746/454, 5,616 chars, 22/19/3 orientation
  events), the election-logic-is-runner-side-only claim, the injection-scope claim, and the
  GS-CYB-1/2 mechanism cites were independently re-verified at source and CONFIRMED.
- **Constraint compliance:** 7 findings, all folded — the most severe being a **systematic
  charitable posture** (exculpatory clauses inside severity justifications, e.g. a CRITICAL rating
  opening with "not because the harness handles it badly"), which directly violated F2's "do not
  treat the harness charitably" / "find what is wrong, not confirm what is right" constraints; the
  trust-record bound stated as measured when 14.2% of the population (454/3,200) is genuinely
  unknown; the mentor's own same-day Prerequisite Criterion ruling placed as the #1 ranked leverage
  point with no adverse assessment (a reflexivity violation Probe 6 itself names); the weights-
  BLOCKED constraint's *merit* endorsed ("load-bearing," "protective") rather than its *effect*
  named and held; GS-CYB-2's update rule pre-specified as "bounded, non-self-reinforcing" (a partial
  pre-answer to an open question); Probe 1(b) treating a documentation-of-a-gap as a bound on the
  gap; and a self-sourced live observation duplicating the already-ruled addendum A6 citation.
  Confirmed clean: Probe 2 correctly asks the sharpened A6 question; both Q2a data absences are
  named as confirmed structural findings, never deferrals; no finding rests on the Rajpal paper's
  empirical claim.

No new independent pass was run after folding — the fixes are mechanical corrections to language
already flagged precisely by the reviewers, not new claims requiring fresh verification.

---

*End of review. Seven probes, leverage summary ranked, stochastic assessment written. Nothing here
licenses a build, a route, a flag, a credential, or a schema; no open question is resolved; no
intervention is advocated. Findings land as a named input to the standing-runner design session
(ruled Q2d).*
