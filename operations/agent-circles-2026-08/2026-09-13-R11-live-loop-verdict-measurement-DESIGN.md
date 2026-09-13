# R11 — Deliverable A: the live-loop verdict-variance measurement (Option E) — DESIGN

> **⚖️ RULED 2026-09-13, same day, on the relay this document fed** (verbatim, canonical:
> `2026-09-13-mentor-ruling-R11-seven-questions-verbatim.md`; wins over this document).
> **Q-R11-A4:** §0's vehicle question is settled — **a bounded, founder-attended re-run is admitted**
> as the measurement's vehicle; the standing runner is not a prerequisite; the election to commission
> one is the founder's. **Q-R11-A1:** §5.5's cross-tabulation is confirmed as the sole gate on any
> future trigger — **no first-draw signal may serve as a trigger before the table exists and shows a
> measured relation to the latent floor**, in either direction. **Q-R11-A2** (shared with
> Deliverable B): **gate only**; `/api/reason` needs its own measurement before any extension.
> **Q-R11-A3:** **the reserved `complete_series()` defect does NOT bind this design** — a new
> instrument that states its own verdict-count completeness rule from the outset does not inherit it;
> this measurement proceeds independently of that fix's sequencing. **No build is licensed by this
> ruling.**

**Authored 2026-09-13 (from `date`)** by the standing-runner design sitting R11
(`sagereasoning-6b [802222]`), tier `governance` / design documents, on the main checkout, under
`operations/handoffs/founder/2026-09-13-standing-runner-R11-R8D7-policy-and-live-measurement-design-NEXT-SESSION-PROMPT.md`.
**This document designs a measurement. It builds nothing, runs nothing, mints nothing, changes no
gate behaviour and touches no file under `website/`. A founder-walked run is its own later step;
nothing here runs it.** Every number in it is a claim to re-derive.

**What it answers.** Q-M7 (2026-09-13, binding): *"measure on the live loop before designing the
policy's parameters… K and any trigger conditions should be designed against live-loop telemetry, not
against the closed run's population. Option E — measure first on the live loop — is the recommended
next act before any R8-D7 build proceeds beyond K=1 disclosure."* This is the design of that
measurement.

**Sources (verbatim wins over every summary, including this one).** R8 §4.9, §5.2, §5.3, §5.4, §7 #5,
§11, §12 (`2026-08-30-standing-runner-design-R8.md`); R9 §11 (R9-D10), §16
(`2026-09-04-standing-runner-design-R9.md`); the five Option S exchanges
(`2026-09-13-mentor-rulings-option-s-result-and-F-R1-verbatim.md`) and the election document
(`2026-09-13-M-W-S-ELECTION-DOCUMENT.md`); the R8-D7 scoping draft
(`2026-09-13-R8-D7-sampling-policy-SCOPING-DRAFT.md`); Q-M5–Q-M8
(`operations/trust-layer-2026-07/2026-09-13-mentor-ruling-eight-questions-w2-work-s11d2-sequencing-r8d7-under-w-verbatim.md`);
the Q1c distinct-identities ruling (`2026-08-30-mentor-ruling-R8-producer-floor-semantics-verbatim.md`);
the two D6a rulings (`2026-08-30-mentor-ruling-pooled-sweep-n100-verbatim.md`;
`2026-08-31-mentor-ruling-directional-split-probe-composition-verbatim.md`); the c11 rerun experiment
record §Footprint (`2026-08-30-c11-rerun-experiment-record.md`); the S6 report
(`2026-08-16-idea-loop-S6-report.md`); the published disclosure (`website/public/llms.txt`, the
"What 'deterministic' scopes to" paragraph and the trust-record "verdict determinism" item);
`manifest.md` §"The Prerequisite Criterion"; the watching-table schema
(`website/supabase-idea-loop-watching-migration.sql`;
`website/supabase-idea-loop-candidate-outcome-not-selected-migration.sql`) and the watching handler's
ruled vocabularies (`website/src/app/api/practice/watching/handler.ts`, read only).

---

## 0. The fact this design must state first: the live loop is not running today

The bounded validation run **closed at cycle 20 on 2026-08-16** (its scratch project's `RUN-LOG.md`
carries that date as its last write, and the S6 report closes it *"at 20 cycles, the floor of the
ruled 20–40 range"*). The standing runner — the v1 vehicle R8/R9 designed — **is designed and not
built** (R9 §16.2 is its build brief, a founder election). **There is therefore no live candidate
stream at this writing.** Q-M7's "live loop" is the stream the standing runner will produce when it
runs, or a bounded re-run the founder elects in the meantime.

This design is written to that fact rather than around it: it specifies the measurement as a
**runner-side capture that rides whichever loop the founder next runs**, at the point in the cycle
§1 names, on the population §1 defines. It does not assume the standing runner exists, and it does
not license a run. Where the standing runner's own build brief (R9 §16.2) bundles migrations, the
persistence this design names is to be bundled there under the Q-B2 one-window discipline, not
applied separately.

---

## 1. The population — which candidates, at what point, and why

### 1.1 The point in the cycle

The closed run's cycle, as recorded by the watching table and the S6 report, is: generation (six
candidates per cycle in the closed run — 120 over 20 cycles) → **one `/api/guardrail` call per
candidate** (the single-draw examination; `rejected_by_guardrail` on a floor) → the novelty check
(`rejected_by_novelty`) → **election among the survivors** (the highest-proximity survivor wins; ties
broken at random — h7's five wins were four tie-breaks and one uncontested; every other survivor is
`not_selected`, *"the ORDINARY outcome for every non-winner candidate in a winner cycle"* per the
handler's own comment) → the winner recorded (`winner_candidate_id`, a route-computed FK pointing
at whichever candidate the runner already marked `winner` — the route performs no election; *"no
server election code exists — grep-verified"*, R8 §5.2(c)).

**The measurement's draws are taken AFTER the runner's single-draw examination and novelty check have
produced the standing verdict set for the cycle, and AFTER the runner has recorded its election on
those standing verdicts.** The runner acts on the first draw exactly as it does today. The extra
draws are out of band with respect to the cycle's decision — the Option S posture: *"pure measurement
— all K verdicts recorded, the first remains operative, nothing behavioural changes"* (2026-08-30 Q3,
verbatim). Nothing the measurement produces is read by the election, the novelty check, or
generation (R8 §5.2(a)'s boundary: *"nothing consumes its output as a signal into generation or
election"*).

### 1.2 The population

**Primary population: every candidate in the cycle whose single-draw verdict PERMITTED — i.e. every
candidate that did not carry `rejected_by_guardrail` after its first draw.** Concretely, on the
watching table's vocabulary: candidates whose `cycle_outcome` after the single draw is one of
`winner`, `not_selected`, or `rejected_by_novelty`.

Why this is the population, against Q-M5 verbatim: *"The amended scope: R8-D7 applies worst-of-K to
the would-be winner population only. A rejection that has already blocked does not enter the sampling
layer — it is already blocked. The sampling layer's purpose under W is to catch winners that carry a
latent floor the single-draw verdict missed. The scope is therefore: K-sampling of inputs that would
otherwise permit, with any floor among K draws blocking."* The policy's population is *inputs that
would otherwise permit*. The parameter the policy needs from data is: **on inputs the gate permits on
a first draw, how often does a further draw floor?** That is a question about the permit population,
and only the permit population can answer it.

**Why the whole permit population and not the would-be winner alone.** The policy acts on the
would-be winner, but the would-be winner is ~one candidate per cycle (15 winners in 20 cycles), while
the permit population is between ~3.7 per cycle (74 survivors of both gates in 20 cycles) and
~5.55 per cycle (111/20 — every candidate not rejected by the guardrail, which is the whole permit
population if every novelty reject's first draw permitted; the S6 report does not separate the two,
so 3.7 is the floor and 5.55 the ceiling). Measuring only the would-be winner would yield an n too thin to
set K against (the c11 record's lesson: *"n=10, one input… a demonstration that grounds a design
posture, not a measured rate"*). Measuring every first-draw permit gives the policy's own population
at three to four times the density, **and** lets the would-be-winner subpopulation be read out of it
by a pre-declared flag (§4) rather than by selection after the fact. Under the dethronement path
(Q-M5: *"the dethronement path for winners remains"*), any survivor can become the would-be winner
within a cycle, so the survivors are the policy's population in the exact sense R8 §5.3's fixpoint
made them decision-bearing.

**Novelty-rejected candidates are included in the primary population and flagged.** Their first
guardrail draw permitted; they are inputs that would otherwise permit at the gate; the novelty gate is
downstream and orthogonal to verdict variance. They are flagged `novelty_rejected: true` so the report
can print the survivor subpopulation separately (§5). Excluding them would select the population on a
non-verdict property with no bearing on the measured quantity.

**Guardrail rejections are NOT re-drawn.** Q-M5 removes them from the sampling layer by construction
(*"already blocked"*; *"the recovery path is closed by construction"*), so resampling them measures
nothing the policy can use, and spends calls the permit population needs. Their single-draw record is
retained in the capture as context (verdict, proximity, floor attribution — §4), so the cycle's full
verdict set is on the record and the permit population's boundary is visible.

### 1.3 Two limits this population choice creates, stated here rather than discovered

- **Selection on the measured variable, in a new form.** Option S's limit 2 was that its strata were
  selected on the measured variable (a provenance selection — "rejected in August"). This design
  selects on the *first draw's verdict position* (a behavioural selection — "permitted on draw 1").
  That is the selection Q-M5 itself makes, and it is the right population for the policy's parameter;
  but it is still a selection on the variable being measured, and every figure carries it. In
  particular the measured floor rate on this population is **conditional on a first permit** — it is
  the latent-floor rate the policy exists to catch, not an unconditional rate.
- **Still not the near-boundary population.** Q-S2 (binding) ruled that the near-boundary gap is not
  closed by a provenance-labelled stratum. This design's population is labelled by first-draw verdict,
  which is closer to a behavioural category than provenance, **but it is not "verdicts that sit near
  the proceed/block boundary"** — a first permit at `sage_like` and a first permit at `deliberate`
  are both in it. **This measurement does not close the published near-boundary gap and must not be
  published against that sentence.** What it could later contribute to defining that population is
  §5's per-input proximity distributions, which show where each input's draws sit; defining the
  population from them is a separate act, after the data exists, and is not this design's claim.

---

## 2. K per input, and the cost

### 2.1 K

**K = 10 draws per input (the first draw is the runner's own operative draw; the capture takes 9
more).** Reasons: (i) it is the K both prior measurements used (2026-08-30 at 20 = two series of 10;
2026-09-12 at 10), so per-input distributions are directly comparable across the three records; (ii)
at K=10 a per-draw floor probability of 0.1 — the c6/c9 class the election turned on — is caught with
probability 1 − 0.9¹⁰ ≈ 0.65, and 0.05 with ≈ 0.40, which is the resolution the K election needs (a
latent floor the policy would catch at K=3 has a per-draw probability the measurement must be able to
see); (iii) 0/10 on an input still leaves p ≤ 0.28 inside a Wilson 95% interval (upper bound
0.2775, re-derived; the first draft wrote 0.26 from memory — the reviewer and the author's own
re-derivation caught it), so the report must
print intervals, never a bare zero as "deterministic" (§5 — the published disclosure already uses the
per-input-distribution form for exactly this reason).

**K is a measurement parameter here, not the policy's K.** The policy's K is left OPEN (Deliverable B)
and is set from this data. A run at measurement K=10 characterises every candidate policy K ≤ 10 by
subsampling the recorded draws (§5.4), which is why the measurement K is set above any K the policy is
likely to elect.

### 2.2 The price, and which source it is re-derived from

Two sources exist; this design uses **CI-10's own metering** as authoritative and the Option S run as
corroboration, and says why.

- **CI-10 metering (authoritative).** Every `/api/guardrail` call writes a `loop_billing_events` row
  (`surface = 'api_guardrail'`, `anthropic_cost_cents`) and returns `X-Loop-Cost-Cents` and
  `X-Loop-Id` — the CI-10 visible meter, Live since 2026-06-13. The c11 rerun experiment record
  (2026-08-30, §Footprint) read it this way and recorded **$0.142215 metered for 10 calls, mean
  $0.014222 per call**, recomputed across all ten responses at PR19 review. R8 §5.2(a) carries the
  same figure with its correction history.
- **The Option S run (corroboration).** *"spent 240 calls ≈ $3.40"* (its close, line 41) ≈ $0.014 per
  call; the ruling's own figure *"10 calls at approximately $0.17"* ≈ $0.017. Consistent with CI-10's
  mean to within the rounding the ruling used.

**Cost of one measured cycle at K=10, on the CI-10 mean, using the closed run's population density
as the only estimate available:** at the floor density of ~3.7 first-draw permits per cycle
(74/20 survivors of both gates) × 9 extra draws × $0.0142 ≈ **$0.47 per cycle**, a 20-cycle run ≈
**$9.50**, and ≈ $4.20 at K=5; at the ceiling density of ~5.55 per cycle (111/20 — every candidate
the guardrail did not reject, §1.2) ≈ **$0.71 per cycle**, a 20-cycle run ≈ **$14.20**, and ≈ $6.30
at K=5. Every one of these is arithmetic on a density from a closed run and must be re-derived
against the live run's actual survivor count, cycle by cycle, from the capture itself (§4 records the
metered cents per draw so the run's cost is read, not estimated, at report time).

**A per-call price is coarse at the meter.** `loop_billing_events.anthropic_cost_cents` is an integer
(the loop-billing integer contract; `asInt` at the RPC boundary), so a single ~1.4¢ call rounds; the
c11 record derived its mean from the responses' `cost_usd`, not from the summed cents. The capture
records both (§4) and the report prints the metered total and the response-derived mean side by
side.

---

## 3. The credential — a dedicated measurement identity

**A dedicated measurement credential, minted founder-walked for the run, with a distinct `agent_id`
from every other identity in the loop, and revoked at the run's close.** This is three rulings applied
together:

- **Q1c (2026-08-30, binding):** *"Distinct identities required at mint. The runner and the executing
  agent may not share an `agent_id` across their two separate credentials… identity coincidence would
  degrade the Q-C2b signature by allowing the runner's own ambient calls to satisfy the
  preceding-examination window… distinct identities required, enforced at mint, not left to
  convention."* The measurement's draws are exactly the ambient-call class Q1c guards against — nine
  extra gate calls per permitted candidate would, on the runner's own identity, be indistinguishable
  from the runner's examination record. **The measurement identity must therefore be distinct from the
  runner's (`sagereasoning:idea-loop@v1` in the closed run) and from the executing agent's.** A
  suggested shape, not a decision: `sagereasoning:verdict-measurement@v1`.
- **R8 §5.2(a):** *"probe traffic runs on a dedicated, labelled credential so it is excludable from
  every billing/usage/trajectory sample by `credential_ref`."* The same requirement, for the same
  reason.
- **The Option S precedent:** `sagereasoning:option-s@v1` — minted for the run, `consult` capability,
  revoked on the ruling *"immediately… every day it exists beyond that point is exposure with no
  benefit."* The same lifecycle applies here: mint at run open, revoke at run close, both
  founder-walked.

**Capability:** `consult` only (the gate call). No `watching_write` — the capture must have no path to
the watching table (§1.1's boundary, made structural at the credential). **Quota:** sized from §2.2's
arithmetic for the elected cycle count, with the CI-6 default (30/1/1) raised by SQL as the S9 gen-2
record did — the practice mint drops `--daily`/`--monthly` silently, a recorded trap.

**Exclusion:** every sample this project draws (billing tuning, trajectory, the false-hold buffer's
rate, the Option S-style strata) excludes this `credential_ref`. The false-hold buffer is unaffected
by construction — it captures the founder harness's consult path, and the runner calls the gate
directly — but the exclusion is stated so it is never assumed.

---

## 4. What is recorded per draw, and where

### 4.1 Per draw

One record per draw, including the runner's own operative first draw (recorded from the runner's
response, not re-fetched), append-only:

| field | source | note |
|---|---|---|
| `loop_id`, `cycle_number` | runner | the cycle identity R8 §2 ruled (the pair, never `loop_id` alone) |
| `candidate_ordinal` | capture | **new to this design** (no such field exists in the watching schema or any ruling): the candidate's position within the cycle, needed to tie K draws to one candidate before any DB row exists |
| `input_hash` (SHA-256 of `proposed_action` bytes) | capture | byte-identity across the K draws is asserted on this, as Option S did; the text itself is NOT stored in the capture (it is on the watching table, founder-only) |
| `draw_index` (1 = operative) | capture | draw 1 is the runner's; 2..K the capture's |
| `verdict` (`proceed` boolean), `recommendation` | response | the block-or-permit decision — the quantity the floor rate is computed over |
| `katorthoma_proximity` | response | the proximity draw — the quantity the "proximity moves while the decision does not" finding is computed over |
| `proximity_floors {base, dikaiosyne, andreia, sophrosyne, aggregate, basis}` | `signed_assessment.assessment` | **floor attribution** — which domain floored, and the basis string; Option S's limit 3 ("a floor count does not identify which floor fired") is closed at the record level by storing this |
| `is_kathekon`, `kathekon_quality` | response | the sparse-extraction floor (`is_kathekon: null`) is distinguishable from a domain floor |
| `corroboration.any_contradiction` | `signed_assessment.assessment.corroboration` | whether a corroboration floor drove the draw |
| `assessment_status` / `engine_error`, `tier1_pause` | response | **engine outage and Tier-1 pause are recorded as their own outcome classes, never as verdicts** — the Option S thin-series lesson |
| `signature`, `key_id` | `signed_assessment` | traceability to the signed artifact; the draw is re-verifiable against `GET /api/public-key` |
| `x_loop_id`, `x_loop_cost_cents`, response `cost_usd` where present | headers/body | the CI-10 meter per draw (§2.2) |
| `http_status`, `latency_ms`, `captured_at` (UTC) | capture | |
| `deploy_proxy` | capture | the local-repository HEAD at capture — *"a local-repository proxy and attests nothing about production"* (the published disclosure's own words), carried so a mid-run deploy is at least visible |

Per input (once, at cycle close, from the runner's recorded election — read, never computed by the
capture): `first_draw_outcome` (`permit` / `rejected_by_guardrail` / `engine_unavailable`),
`novelty_rejected` (boolean), `would_be_winner` (boolean — the candidate the runner's election
recorded as `winner`), `election_basis` where the runner records it (R8-D6c's
`uncontested | tie_break_random | out_scored` — a runner-side field the standing runner's brief
carries; absent in the closed run's schema and recorded as absent, not inferred).

### 4.2 Where — the store, designed, not built

**v1 of the store is a local, append-only JSONL buffer on the runner's host**, one file per run,
one line per draw, never truncated, sealed at run close by a SHA-256 over the file recorded in the
close. This is the shape two live instruments already use (the false-hold buffer; the Option S series
files), and it keeps the capture free of any server write path — the measurement cannot reach the
watching table or any production table by construction.

**A durable server-side table is named for the standing runner's bundled migration window and is
NOT designed in detail here:** `idea_loop_verdict_draws`, FK'd to `idea_loop_candidates(id)`
`ON DELETE CASCADE` so retention and data rights ride the cycle via the candidate row's own cascade
to `idea_loop_cycles` — the same discipline `idea_loop_completion_signals` applies one level up, where
it is FK'd to the cycle directly (R8 §2 item 2 — no `retain_until` of its own; PR24 not engaged by inheritance, to be pinned in
the migration), RLS service-role-only, no route writing to it (a founder-run ingest, the
`false-hold-observation-report.ts` shape). **It is a founder-walked migration under the Q-B2
one-window discipline (bundle with R9 §16.2's window), and nothing here applies it.** Until it
exists, the report reads the JSONL directly, as the false-hold report's `--dry-run` does.

**Series completeness, stated as a design requirement of this instrument in the ruling's own words
and no further:** a series is complete when it holds the intended number of **verdicts**, with
outages counted separately — *"A series in which most calls failed registers as a complete
measurement and thereby blocks its own repair… The correct fix is to count counted outcomes"*
(Exchange 3). This is a requirement on a new instrument; it says nothing about, and this session did
not open, the reserved defect in the existing one (§8 of the scoping draft; the prompt's constraint).

---

## 5. What the report prints

The order is fixed by the D6a rulings and is the order the published disclosure uses.

### 5.1 Per-input distributions first, never a directional decomposition

For every input in the primary population: `floors / verdicts` (e.g. `0/10`, `1/10`), the proximity
sequence in draw order, the floor attribution per flooring draw (`dikaiosyne` / `andreia` /
`sophrosyne` / sparse-extraction / corroboration), outage count, and the flags (`would_be_winner`,
`novelty_rejected`). Grouped by cycle. **No directional decomposition is printed** — the 2026-08-30
Q3 ruling: *"The per-probe distributions replace it… they do not imply any symmetry at all — they
show exactly what happened on each probe."* On this population a decomposition is meaningless in any
case: every input's first draw permitted, so every crossing is in one direction by construction, and
printing that as a "direction" would be the composition artefact the rulings removed.

### 5.2 The three pre-declared strata, with intervals

Declared here, before any run, so the report applies *"the pre-declared structure to the data"*
(Q-R2) and never redefines a class after seeing it:

1. **First-draw permits, all** — the primary population. Latent-floor rate = flooring draws among
   draws 2..K, over all inputs, with a Wilson 95% interval; **and** the input-level figure that the
   policy actually needs: the number and fraction of inputs with ≥1 latent floor, with its interval.
2. **Would-be winners** — the subpopulation the policy acts on. The same two figures.
3. **Survivors of both gates** (permits minus novelty rejects) — the subpopulation the election is
   run over. The same two figures.

Guardrail rejections are printed as context only (their single draw; no rate).

**Two figures per stratum, always, and the input-level one first.** A per-draw rate pools draws across
inputs and is the composition artefact the Q-R2 ruling named (*"a weighted average over a
distribution that does not exist as a coherent population"*); the input-level fraction — how many
inputs carried a latent floor at all — is the quantity the policy's K trades against. Both are
printed because both are honest and they answer different questions.

### 5.3 The proximity-versus-decision reading

For each stratum: how many inputs varied on proximity across their draws, how many varied on the
decision — the distinction the published disclosure draws (*"the proximity score moves while the
block-or-permit decision does not"*) and Q-S2 named the measurement's most useful contribution.
Printed as counts per stratum, never as a ratio between the two.

### 5.4 The K-subsampling table (the report's contribution to the K election)

For each candidate K ∈ {1, 2, 3, 5, 10}: the fraction of would-be winners the worst-of-K rule would
have blocked, computed by reading the recorded draws **in draw order** (draws 1..K), never by
resampling with replacement and never by any permutation — draw order is the order the live policy
would have seen, and the election document's S finding is the warning that draw order is not
exchangeable in effect. **This table is descriptive of the recorded run. It is not a recommendation
of any K**, and the report says so in its header. It carries the same intervals and the same limits.

### 5.5 The first-draw-signal cross-tabulation (descriptive only)

Per input: first-draw `katorthoma_proximity`, `is_kathekon`, `proximity_floors.basis`, corroboration
findings — tabulated against whether the input carried a latent floor. This is the data the scoping
draft's Option C said does not exist (*"a measured relation between the signal and the per-input
disagreement rate would have to exist. It does not"*). **The report prints the cross-tabulation and
draws no relation from it.** Whether any first-draw signal may become a trigger is the mentor's
question (scoping draft §5 Q3, carried at §8 below), asked after the table exists, not answered by
it.

### 5.6 Thin series, outages, and the run's footprint

Every input whose operative series holds fewer verdicts than K, with its outage count — computed from
verdict counts, on every stratum, printed beside every rate. The run's metered cost (summed cents)
and the response-derived mean per call (§2.2). The deploy proxy at open and close, and whether it
moved.

---

## 6. Every limit that rides its figures

The four from Option S, restated for this population, and the ones this design adds:

1. **Not representative.** A measured run is a sample of one loop's stream over one window. It
   represents that stream at that time; it does not represent a future stream, a different runner
   build, or a different generation heuristic mix (the S6 report's early-run/signal-producing split
   is the closed run's own example of within-run non-stationarity).
2. **Selected on the measured variable** — in the first-draw-verdict form §1.3 states. Every figure
   is conditional on a first permit.
3. **Multi-channel variance.** A floor count pools domain floors, sparse-extraction floors and
   corroboration floors. §4.1 records the attribution per draw so the report can separate them;
   the headline figures do not.
4. **Engine era — now a within-run limit rather than a between-run one.** The texts and the
   verdicts are produced in the same window, which removes Option S's "older engine" limit; but a
   production deploy during the run changes the instrument mid-measurement, and the deploy proxy
   §4.1 records *"attests nothing about production."* A run that spans a deploy is two runs, and the
   report splits on the proxy where it moved.
5. **The loop is not running today (§0).** The population exists only when a loop runs. A bounded
   re-run has the closed run's own limits (a founder-attended run, 20–40 cycles); the standing
   runner's stream would be the intended population and does not yet exist.
6. **Operative = first draw.** The runner's decisions during the run are single-draw decisions, as
   today. The measurement observes what K-sampling *would* have done; it does not observe a loop
   running under the policy. A loop under worst-of-K would have a different candidate history
   (dethronements change subsequent windows and novelty density), so the K-subsampling table (§5.4)
   is a within-cycle counterfactual, not a run-level one.
7. **`/api/guardrail` only.** *"No rate has been measured on `/api/reason`, and this one does not
   transfer to it"* (published). The consult path is out of scope by construction (scoping draft §5
   Q5, carried).
8. **Does not close the near-boundary gap** (§1.3; Q-S2). Not to be published against that sentence.
9. **Role-blindness.** The gate *"takes no role input… a confirmed design deficiency, not a design
   choice"* (published). Every verdict here is role-blind; A2's engine change (R9 §16.3) is gated
   elsewhere.
10. **Thin series** (§5.6) — disclosed per input, computed, never hand-listed.
11. **Byte-identity and provider-side state.** The K draws are byte-identical submissions inside a
    short window. Whether provider-side caching of a shared prompt prefix affects the sampled
    extraction's variance is **unverified in any source this session read**; it is named so a run
    can record the draw spacing and the question can be put, not answered here.
12. **Cost figures** (§2.2) are arithmetic on a closed-run density; the run's own footprint is read
    from the meter.

---

## 7. What this design deliberately does not do

- **It changes no gate behaviour.** The runner acts on draw 1 as it does today; draws 2..K are out
  of band and reach nothing (§1.1). *"Inert under Option S (first verdict stays operative)"* — R8
  §4.9's own description of the measurement posture — is the posture here.
- **It feeds nothing into election or generation.** No capture output enters the watching table, the
  novelty window, or any heuristic (R8 §5.2(a)'s boundary; the measurement credential carries no
  `watching_write`).
- **It emits no confidence value, label or scalar for any verdict** — not on the record, not in the
  report (Q-M8's prohibition applied to the measurement as it applies to the policy).
- **It prints no directional decomposition** (§5.1).
- **It does not define the near-boundary population** and does not publish against the gap (§1.3).
- **It does not touch R18.** If the founder later elects to disclose that a live-loop measurement
  exists, that follows the D6a precedent (publish the per-input distributions; founder sign-off on
  three surfaces) as its own act. No wording is staged here because no data exists.
- **It does not touch the reserved instrument.** `option-s/` was not opened (prompt constraint); this
  design is for a new capture, at the contract level, runner-side (the runner is not in this
  repository — R8 §12, item 3), and states its completeness requirement only in the ruling's words (§4.2).
- **It does not run.** A founder-walked run — mint, provision, run, seal, revoke — is its own later
  step with its own prompt; nothing here starts it.

---

## 8. The Prerequisite Criterion — applied explicitly

`manifest.md`: *"any design proposal that claims to produce practitioner-facing outputs — scores,
recommendations, diagnoses, virtue assessments — is evaluated against this criterion before adoption.
The question asked is: does this design build adequate ideas through examined assent, or does it
produce outputs that resemble the destination without building the prerequisite?"*

**Engagement.** This design produces **no practitioner-facing output**. Its only outputs are (i) a
capture no practitioner or agent reads, and (ii) a founder-side report of distributions. It proposes
no score, recommendation, diagnosis or virtue assessment; it changes no verdict any agent receives.
The would-be-winner flag is read from the runner's own recorded election, not computed by the
measurement, so it introduces no new classification of any input.

**Verdict: passes by construction — it is measurement (the scoping draft's Option E reading:
*"Prerequisite Criterion: passes by construction — it is measurement"*).** The criterion is stated as
engaged-and-examined rather than skipped, because the design is the prerequisite for a design that
will engage it in earnest: Deliverable B's recorded verdict is practitioner-facing, and B's passage
depends on the disclosure riding the record (R8 §5.3), which in turn depends on K being set against
this data rather than against a resemblance of it.

**One resemblance this design guards against in itself.** §5.4's K-subsampling table and §5.5's
cross-tabulation are the two outputs a reader could mistake for a recommendation or a confidence
signal. Both are marked descriptive in the report's header, both carry every limit in §6, and neither
is permitted to print a "recommended K" or a "confidence" column. If a future session wants either,
that is a design act under this criterion, not a report format.

---

## 9. Questions drafted for the mentor (RULED 2026-09-13 — see the banner above; kept for the record)

The scoping draft's Q2, Q3, Q5 and Q8 (its Q1, Q4, Q6, Q7 were already answered by Q-M5–Q-M8) are
now all resolved by this round.

- **Q-R11-A1 (carried scoping Q3).** **RULED:** *"A trigger is admissible only on a measured
  relation between the signal and the latent floor… No first-draw signal — katorthoma proximity,
  is_kathekon, proximity_floors.basis, or any corroboration finding — may serve as a trigger
  condition until Deliverable A's cross-tabulation exists and shows a measured relation… If the
  table shows no relation, no trigger is admissible from that signal. If it shows a relation, the
  trigger is admissible on that signal with the relation disclosed."* §5.5's table remains the
  gate; it stays descriptive until built and read.
- **Q-R11-A2 (carried scoping Q5).** **RULED: gate only.** *"The sampling policy does not reach the
  consult path at this stage… a separate design with its own measurement, not an extension of this
  one."* Limit 7 stands; `/api/reason` is out of scope.
- **Q-R11-A3 (carried scoping Q8).** **RULED: the defect does not bind this design.** *"A new
  instrument that correctly defines completeness as counted outcomes from the start does not
  inherit the defect from the old instrument… Deliverable A proceeds independently."* §4.2's
  verdict-count requirement is confirmed sufficient; no dependency on the reserved fix.
- **Q-R11-A4.** **RULED: a bounded, founder-attended re-run is admitted.** *"Waiting for it to exist
  before measuring is waiting for the policy to be built before measuring what the policy should be
  designed against — the wrong sequence… A bounded re-run under the same conditions as the
  validation run… produces a live-loop population in the relevant sense."* Commissioning one remains
  the founder's election; nothing here starts it.

---

## 10. Standing constraints this design honours (the summary index)

No code, schema, flag, credential, migration, deploy or push. No `GUARD_RE` file touched. No R18
surface changed. No relay sent. `option-s/` not opened. Nothing written under `~/.sage-gate1/` or to
`agent_hold_observations`. The first verdict stays operative. No directional decomposition. No
confidence scalar. Weights BLOCKED; the near-boundary gap NOT closed; the S11 flip REFUSED; D2
blocked; the 0h call the founder's.

## 11. PR19 review record — one blind Sonnet reviewer, read-only, RUN 2026-09-13; all findings folded

**What the reviewer was given:** this document and the source paths listed in its header, with an
instruction not to open `option-s/`. **What it was not given:** Deliverable B, Deliverable C, the
session prompt, the close, or any account of the author's reasoning. It ran at model `sonnet` under
the founder's standing permission for adversarial reviews.

**Findings — 2 MEDIUM, 1 LOW, 3 NIT; six review dimensions reported clean (ruling fidelity,
overclaim, Prerequisite Criterion, K and cost arithmetic, CI-10 figures, population logic).** Each
verified first-hand before folding:

1. **MEDIUM — §2.1 Wilson bound.** 0/10 gives an upper bound of 0.2775, not 0.26. Verified by
   re-derivation (the author had independently re-derived it before the review returned and held the
   edit until the reviewer finished). **Folded** — corrected, with the error disclosed in place.
2. **MEDIUM — §1.2 density.** "~3.7 per cycle … plus the novelty rejects" attached the survivor-only
   density (74/20) to a population defined to include novelty rejects; the whole first-draw-permit
   population is 111/20 ≈ 5.55. Verified from the S6 report's counts. **Folded** — §1.2 now states
   floor and ceiling; §2.2's cost line now carries both densities.
3. **LOW — §4.1 `candidate_ordinal`** rode the R8 §2 citation for the `(loop_id, cycle_number)` pair;
   no ruling or schema names it. Verified by grep. **Folded** — split into its own row, marked new.
4. **NIT — "R8 §12.3"** cites a subsection R8 does not have. **Folded** — "R8 §12, item 3".
5. **NIT — §4.2 FK parity** overstated by one hop (completion signals FK the cycle directly; the
   proposed table FKs the candidate). **Folded** — reworded.
6. **NIT — §1.1 "derived by the route"** sat one sentence from "election" and could be misread as
   server-side election. Verified against the store's lookup and R8 §5.2(c). **Folded** — reworded.

**What the reviewer did not check (its own statement):** the D6a n=100 intervals; the option-s
implementation; git history for guarded-file touches. None bears on this design's claims.

*End of Deliverable A. Verbatim wins over every summary, including this one.*
