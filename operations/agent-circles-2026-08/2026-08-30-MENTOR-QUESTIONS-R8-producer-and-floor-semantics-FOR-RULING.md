# Mentor questions — the completion signal's producer, the elector/attester tension, and floor semantics under sampling — FOR RULING

> **STATUS: RULED 2026-08-30, same day** — the ruling is captured verbatim at
> `2026-08-30-mentor-ruling-R8-producer-floor-semantics-verbatim.md` (binding on relay; verbatim
> wins) and applied as dated annotations to the R8 design
> (`D-MENTOR-RULING-R8-PRODUCER-FLOOR-SEMANTICS-ADOPTED-EXECUTED-2026-08-30`). Q1a/b/c ruled as
> R8 recommended; Q2 ruled reading (a) with Q-C2a's first question AMENDED; Q3 ruled Option S
> buildable now, M-vs-W deferred with the framing locked. This file is the question record only.

**Date authored:** 2026-08-30. **Source:** the R8 standing-runner design session
(`2026-08-30-standing-runner-design-R8.md`, PR19-folded;
`D-STANDING-RUNNER-DESIGN-R8-COMPLETE-C11-EXPERIMENT-RUN-PR19-FOLDED-2026-08-30`). **Relay:** the
founder relays this document; rulings are binding on relay per project convention, verbatim wins.
**PR20 discipline:** every present-tense mechanism fact below was verified at source or measured
during the R8 session itself (2026-08-29/30); the one fact that could not be verified is marked
contested, not asserted.

## Baseline correction, so this brief does not arrive on a stale frame

As of 2026-08-30: the bounded validation run **completed 2026-08-16** at 20 cycles by your own
stop ruling, and its §6 report was accepted in full the same day. The ATRF sixteen questions are
ruled (2026-08-23). The five-instruction family is ruled and adopted, and **your Q7 sequence is
complete at all five steps** — the adversarial review ran (PR19-folded), the nine-candidate
classification ran (corrected twice under review), and the standing-runner design session (R8)
has now run, producing a reviewed design that is a proposal awaiting the founder's elections.
Several prior responses from this channel were authored against a pre-run baseline; the three
questions below arise from the post-run, post-R8 state.

## New evidence these questions rest on (measured 2026-08-29/30, founder-elected)

Ten identical submissions of the byte-exact stored cycle-11 candidate text ("Publish the SDK to
a public package registry…", 130 chars) to the live guardrail at its default threshold returned
**9× `deliberate`/proceed and 1× `reflexive`/blocked**. The divergence is fully localized: the
Layer-1 extractor assigned the same irreversibility indicator four different ways across the ten
identical inputs (absent ×4, phantasia-stage ×2, synkatathesis-stage ×3, praxis-stage ×1), and
only the praxis-stage reading fires the ADR-010 §4 andreia floor. The dikaiosyne reading was
identical all ten times. So: a probabilistic extraction feeding a faithful deterministic engine
produces occasional multi-grade verdict flips on identical text — roughly 1-in-10 on this input,
on today's instrument. The mechanism is not a defect in any single reading (the conservative
reading is individually defensible); it is **inconsistency about a defensible caution**.

---

## Q1 — Who produces the completion signal? (the producer question)

**Mechanisms this ruling lands on (PR20):** (i) `POST /api/practice/completion-signal` is built
dark (flag unset, honest 503), POST-only — no read surface exists; its schema requires the
`loop_id` + `cycle_number` PAIR to identify the cycle, takes the three ruled examination
questions plus the required refuse-to-attest branch, and admits one signal per cycle. (ii) It
authenticates on a dedicated `completion_signal_write` capability, deliberately distinct from the
runner's `watching_write`, so the reporting actor and the runner are separated at mint. (iii)
Whether the `idea_loop_completion_signals` migration is applied to production is a **named
contested fact** (two prior records disagree; the founder's §PRE/§VERIFY walk resolves it before
any activation). (iv) The Q1 hard constraint stands: the loop proposes; it never executes;
nothing was ever executed in the 20-cycle run and no completion signal exists.

**The question.** Your Q-C1 ruling names the actor: "the agent, post-execution — the only actor
with access to post-execution evidence." Under the Q1 constraint, execution only ever happens
when a **recipient adopts** an elected proposal and acts on it outside the loop. R8 found the
producer side undesigned: nothing establishes who that actor is in a real deployment, and no
designed path hands them the cycle identity (`loop_id` + `cycle_number`) they must attest about.

**Q1a.** Who is the v1 producer? (a) The founder personally — or an agent session the founder
directs — executing an adopted proposal, holding a founder-minted `completion_signal_write`
credential; (b) any executing agent the founder authorizes case-by-case; (c) no producer yet —
the signal stays structurally dormant and the consumption phases wait. (R8's reading: (a) is the
only producer that exists today, and naming it honestly also names the signal's expected rate as
low and adoption-bounded — the balancing loop's only path runs through examined human adoption,
which R8 argued is Prerequisite-Criterion-aligned rather than a deficiency. Confirm or correct.)

**Q1b.** How does the executing actor learn the cycle identity — a designed handoff (the elected
proposal carries its own `loop_id`/`cycle_number` when surfaced for adoption, e.g. on the
founder dashboard), or manual founder relay? R8 recommends the designed handoff on the adoption
surface.

**Q1c.** May the runner and the executing agent share an `agent_id` across their two separate
credentials? The capability separation prevents one credential doing both; nothing prevents
identity coincidence, and coincidence degrades the Q-C2b signature (the runner's own ambient
calls would satisfy the preceding-examination window). R8 recommends: forbidden — distinct
identities required at mint.

## Q2 — The elector/attester tension inside Q-C2a's first question

**Mechanisms this ruling lands on (PR20):** (i) the election is runner-side — no election,
tie-break, or scoring logic exists server-side (grep-verified twice); (ii) the §6 report's ruled
h7 split: 4 of h7's 5 wins were resolved by the `r mod n` random draw, 0 by out-scoring a
contested field; (iii) the built signal's examination object asks your three ruled questions
verbatim (`impression_assented_to`, `assent_quality: examined|habitual`,
`threshold_reached: katorthoma|kathekon`).

**The question.** Q-C2a's first ruled question is: "What impression did the agent assent to
**when it elected this idea**?" But election is the RUNNER's act, and in the observed record it
was usually a random tie-break; the executing agent (Q1's producer) neither elected nor
tie-broke. For any tie-broken cycle, the only honest answer about assent-at-election is
`habitual` — or a refusal — no matter how thoroughly the executing agent examined the idea
before adopting it. Three readings, yours to rule: **(a)** re-scope the first question to the
producer's own assent — "what impression did you assent to when you adopted and executed this
idea"; **(b)** keep it as written, accepting that tie-broken cycles honestly report habitual
election-assent (arguably the truth about the election, and itself a finding); **(c)** split it
into two propositions — the runner's election-assent and the producer's adoption-assent, each
carried with its own provenance. R8 takes no position; the question touches ruled content and is
yours.

## Q3 — What does a floor mean under sampling? (the M/W/S election for R8-D7)

**Mechanisms this ruling lands on (PR20):** (i) the live guardrail's default band is
`threshold='deliberate'`, `risk_class='standard'`; a `reflexive` verdict blocks; (ii) ADR-010
§4's floors are deliberately worst-case operators — the andreia per-indicator conservative
reading was specifically locked (2026-06-25) after a review reverted a lenient bypass, and the
unity-thesis aggregate is a weakest-link minimum; (iii) the measured variance above: per-sample
floor rate ≈ 0.1 on the demonstrated input class.

**The question.** R8 designed a verdict-confidence policy for decision-bearing verdicts (the
would-be winner and any rejection): examine the identical text K=3 times. What is then recorded?

- **Option M (median-of-K):** the modal examination decides. Computed consequence on the
  measured class: recorded-floor probability falls 10% → 2.8% — **the gate becomes ~3.6× less
  likely to block a floor-borderline grave candidate.** Better estimate of the typical reading;
  a real loosening of the gate's behaviour.
- **Option W (worst-of-K):** any floor among the K stands — the sampling-layer analogue of the
  weakest-link doctrine. Recorded-floor probability rises to ≈ 27% on the same class: more
  variance-driven blocks, in the conservative direction.
- **Option S (sample-and-disclose):** all K verdicts recorded, the FIRST remains operative,
  nothing behavioural changes; the per-input disagreement rate becomes a measured property of
  the instrument.

Independent review found R8's first draft chose M on a symmetry argument that was wrong (it
claimed direction-neutrality; the effect direction follows the minority verdict, and floors are
the minority). **R8's corrected position: this is a doctrinal question about what a floor means
under sampling — per-examination (W) or per-judgement (M) — not a statistics choice, and it is
yours.** R8 recommends: **rule S buildable now** (pure measurement, safe ahead of the doctrine),
and rule M-vs-W before any verdict-changing policy is ever built. One further carried item for
whichever session adopts the policy: the would-be-winner half adds a bounded
gate→election→gate refinement path within a cycle; R8 evaluated it against the single-backward-
edge constraint (verdict: an examination-refinement loop, not an information-integration edge)
and carries that evaluation forward for confirmation rather than treating it as settled.

---

**Context notes, not questions (named so the rulings land with them visible):** the Q-C2b
signature's discriminating power approaches zero for harnessed identities unless the
qualifying-event set is narrowed (hook-ambient consults fire automatically) — R8 holds this as
build-session precision work under whatever Q1c rules; and the §6.2 uniform-favourable-reporting
flag's thresholds are bound to the first-N-signals trigger, with N a build-time founder
election.

**Nothing in this document executes, builds, or activates anything. The rulings' execution is
the next session's, under its own prompt.**
