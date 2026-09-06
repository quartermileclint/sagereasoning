# Option S — the Path A instrument

**Built 2026-09-04, `code-elevated`, repo-only. Rebuilt the same day after PR19 review.**
Nothing here is live: no call has been made, no credential minted or sized, no candidate text
obtained, no rate measured.

## What review changed — stated at the head, not buried

Three blind reviewers (claims-vs-source, constraint compliance, design soundness) returned findings
against the first version. **Six were HIGH, two were duplicated across reviewers, and none was
refuted.** The first version's own README claimed a reuse and a completeness it did not have. What
is withdrawn:

1. **It measured the wrong quantity.** It published an undirected binary "did any two of K differ"
   flag. M and W are functions of the **per-sample floor probability p**, and p is not recoverable
   from a binary flag — the map is non-monotone (p and 1−p are indistinguishable) and each input has
   its own p. A ruling made on that output would have been made on a number that reads like evidence
   and is not. **Now:** per-input floor count and `p_hat_floor`, the **per-probe distribution**,
   the **decision (block) rate** taken from the gate's own `proceed`, stratified by
   `decision_role`, plus `would_option_M_record` / `would_option_W_record`.
   *(The directional split this line used to name was **removed** by mentor ruling 2026-09-05 —
   see the 2026-09-06 changelog at the foot of this file.)*
2. **It counted engine outages as the gate disagreeing with itself.** One outage in a K=3 series
   flipped the whole input to "disagreeing". D6a's own round-3 correction states outages are
   *"infrastructure, not a gate judgement about the frozen text."* **Now:** non-verdict outcomes are
   counted and reported separately and never enter a disagreement identity. Proven by probe.
3. **There was no collector at all.** `run_series` exited before any network use and nothing wrote
   the `.jsonl` files `summary()` consumes — so *"the build is complete; the run is yours"* was
   false. **Now:** the call path is implemented here, with spacing, freeze stamping, abort-on-quota,
   and no retry.
4. **The reuse claim was untrue.** It said the live-gate call path was imported from D6a. D6a has no
   importable call primitive — its HTTP call is inline in its own `run_series`. **Now:** what is
   imported is `extract_fields`, `classify_outcome`, `classify_failure`, `wilson_interval`,
   `utc_now`, and those are called on every record.
5. **The freeze discipline was documented and not implemented** — `text_sha()` was defined and never
   called, and the byte guard *skipped itself* when `bytes` was absent, reintroducing an
   optional-field disarm vector D6a had closed. **Now:** both enforced; `bytes` mandatory.
6. **`summary()` reported a null rate as success** when records didn't parse. **Now:** it aborts.
7. **`sweep` ran only the first candidate.** All three reviewers found it. **Now:** it sweeps.
8. **The SQL would have silently returned the wrong set.** `cycle_outcome = 'selected'` is not a
   legal value — the CHECK admits `winner`; the filter returned **zero winners**. The §PRE
   arithmetic double-counted; nothing was scoped to a `loop_id`; §4 returned every session id in the
   table rather than the rejections' trace. All fixed.
9. **Two citations were wrong**: §8 → §9/§11 (and §9 is superseded by its own banner), and the claim
   that L2 was *"not previously connected to Path A"* — §11.4 had already called it *"still the
   first thing R8 should close."*

## The set-size discrepancy — unresolved, and not mine to resolve

The ruling says **29** decision-bearing candidates (20 winners + 9 rejections). The **S6 report's own
outcome table** says `winner` = **15**, across cycles 1, 2, 4, 7–14, 17–20 — five cycles produced no
winner (3, 5, 6 `dependency_unavailable`; 15, 16 `null_cycle`). That gives **24**.

A binding ruling and this project's own primary record disagree on a checkable arithmetic fact. The
first version asserted 20 winners and **attributed it to the S6 report**, which says 15. I have not
picked a side: `EXTRACTION.sql` §PRE settles it against production, and the founder carries both the
answer and the discrepancy. Cost scales with it (24 × K vs 29 × K).

## On the fixpoint — my reasoning was right for the wrong reason

The first version said R8's required fixpoint is *"moot on a closed run"* because the set is
historical. **The load-bearing reason is different and stronger:** under Option S the *first verdict
stays operative*, so the recorded verdict never changes and the election never moves — **the fixpoint
is a property of M and W, and is moot for S on a live run too.** Closure is incidental. The cost
contrast was also apples-to-oranges: R8's 240 is *extra* iteration calls across a 120-candidate field
under M/W, not a total.

## The Prerequisite Criterion — applied here, not inherited

The first version never applied it, despite this session having just added it to CLAUDE.md's reading
list. R8 §5.3 grants Option S a pass, but on a description of a *live in-gate recording policy* —
this artifact is a different object: a retrospective replay emitting a published-shaped rate.

**Applied: it passes, and here is the reasoning rather than the citation.** The criterion asks
whether a design produces outputs *resembling* wisdom without building the prerequisite. This
instrument produces no practitioner-facing score, recommendation, diagnosis, or virtue assessment: it
measures the *instrument's own* repeatability and publishes that measurement with its limits
attached. It changes no verdict, reaches no practitioner, and its consumer is a doctrine ruling. The
risk the criterion guards against would arise if the rate were published bare — a clean number
implying an examined gate — which is why the five limits ride every output and why the stratified
figure, not the pooled one, is the headline.

## The prior data exists — found 2026-09-04, before any quota was spent

`2026-08-30-c11-rerun-experiment-record.md` (with its run script) records **K=10 on the byte-exact
c11 text**, run 2026-08-29 against production on a **minimal payload** — `{"action": <the stored
proposed_action>}`, no wrapper, no `agent_id`, server default band.

**Result: 9/10 `deliberate`/proceed, 1/10 `reflexive`/blocked.** p̂_floor = **0.10**, Wilson 95%
≈ 2–40%. The record's own framing, which should be carried forward: *n=10 is "a rate demonstration,
not a rate measurement."*

**The mechanism is already localized, and it is not the deterministic layer.** On identical text the
Layer-1 extractor assigned the same grave-act indicator to **four different states** — absent ×4,
`phantasia` ×2, `synkatathesis` ×3, `praxis` ×1 — and **only the `praxis` reading fires** the
ADR-010 §4 andreia floor. Layer 2 computes faithfully from what it is given; what varies is what it
is given.

**What this changes for Path A:**

- **The mechanism question is answered.** Path A measures **prevalence across the decision-bearing
  population**, not mechanism. That is still worth having — c11 is one input — but the marginal
  value is narrower than "find out why the gate varies."
- **c11 must not be re-run at a lower K.** Carry the existing K=10 datum and mark it as a different
  K from the rest.
- **Cost is now measured, not estimated:** $0.014222/call. 24×3 ≈ $1.02; 29×3 ≈ $1.24 (which is
  where the ruling's figure comes from); **24×10 ≈ $3.41; 29×10 ≈ $4.12.** The cost argument for
  K=3 is weak at these magnitudes.

## The design, as elected: FORWARD-LOOKING (founder, 2026-09-04)

**The instrument measures today's gate on real candidate texts. It compares no resampled verdict
against any recorded historical verdict.** `recorded_proximity` is retained in the records as inert
sampling-frame provenance and is compared against nothing; the code says so at the field.

**This is compatible with the ruling, not a departure from it.** Path A asks for *"the per-input
disagreement rate"* on the closed run's **candidates**; it never required comparing to their
recorded verdicts.

**It also sharpens the fit, which I did not expect when I proposed it.** The ruling's own Q2 says
what the existing measurement lacks is *"the live decision-bearing rate — the rate on real candidate
texts produced by the loop in operation, not on frozen synthetic probes or a single repeated
candidate."* Real candidate texts, examined on the engine **any M or W policy would actually
operate**, is exactly that object — and it is precisely the marginal value over D6a, which measured
12% on *synthetic* probes. The historical comparison was never what the gate asked for.

### What this dissolves

- **L2 (submitted-payload fidelity) — dissolved.** It bit only on the comparison: if August's call
  was wrapped, a resampled-vs-recorded comparison crossed different inputs. No such comparison is
  made. What was sent in August is now irrelevant to every published quantity.
- **L6 (instrument drift) — dissolved.** `f7619d9` changed the deterministic Layer 2 after the run
  closed, so the comparison crossed an engine change. None is made. Measuring *today's* engine is
  the point, not a compromise.

### What it does NOT dissolve — stated because I proposed this change and have a stake in it

- ~~**L4 — the 24-vs-29 set size is still open**~~ **SETTLED 2026-09-06 against the populated
  candidate file: 24 candidates carry text (15 winner / 9 `guardrail_rejection`).** The runner's
  `summary()` now reads that file and reports the figure rather than restating the ruling's 29;
  before 2026-09-06 it never opened the file at all, so the artifact reaching the M/W/S election
  would have asserted an open question that population had already closed.
- **L5 — no counterfactual re-election is attempted.** `would_option_M/W_record` are intra-series
  (against *this* run's first verdict), never against history.
- **L7 — variance is multi-channel;** a floor count doesn't identify which floor fired.
- **L3's surviving half — the sample is not representative** of a future candidate stream, so no
  population-level claim follows. The rejection stratum is *enriched* for floor-prone texts: the
  right population for the floor-borderline question, the wrong one for a general rate.
- **The residual frame note:** these texts were produced by a loop running under the *older* engine,
  so they are that loop's candidate shapes even though they are examined by today's.

## What the c11 discovery added or changed

*(Superseded in part by the forward-looking election above — retained because the reasoning that
led to the election is what makes it legible. L2 and L6 below are the limits the election dissolved;
L7 and the cost/K findings stand.)*

**L2 was backwards in the first version.** The c11 experiment *postdates* the §11.4 statement that
version cited, and discharges the payload assumption for the forward-looking question. Under the
elected design the question no longer arises at all.

**L6 — instrument drift — was the sharper finding, and is what motivated the election.** The run
closed 2026-08-16; `f7619d9` (2026-08-24) replaced `ruling_faculty_state`'s deliberation proxy
inside `layer2-mechanisms.ts`, verified at source. Rather than caveat a comparison across an engine
change, the election removes the comparison.

**L7 stands:** the c11 record's divergent run floored through **andreia**, while the run-time
rejection recorded `phronesis`+`dikaiosyne`. Variance is not single-channel.

**Cost and K stand.** $0.014222/call measured. 24×3 ≈ $1.02; 29×3 ≈ $1.24; **24×10 ≈ $3.41;
29×10 ≈ $4.12.** K=3 is R8's *policy* parameter and was never ruled as the measurement K; the c11
record calls its own n=10 *"a rate demonstration, not a rate measurement."* The cost case for K=3 is
weak at these magnitudes.

## Files

| File | What it is |
|---|---|
| `option-s-candidates.json` | Input set. **Empty by design**; carries five limits and an unset K. |
| `EXTRACTION.sql` | Founder-run, read-only. §0 scopes the run; §PRE settles the set size; §3 emits the JSON; §4 the L2 trace. |
| `option-s-runner.py` | Collector + summary. Imports D6a's classifiers; implements its own call path. |
| `runs/` | Empty. The series is the artifact; committed, never deleted. |

## The walk (founder-performed — none of it done here)

1. ~~Look for existing data first.~~ **DONE 2026-09-04 — it exists**; see the section above.
   K=10 on c11, p̂_floor = 0.10, mechanism localized. Carry that datum; do not re-derive it.
2. **Resolve or accept L2** against the §4 trace and the runner's `RUN-LOG.md`.
3. **Run §0, then §PRE.** Settle 24 vs 29. If production gives neither, stop.
4. **Run §2, eyeball, then §3.** Paste into `candidates`, set `populated: true`.
5. **Choose K deliberately** and record why. K=3 is R8's *policy* parameter, not a ruled measurement
   K; D6a chose 10 with a power rationale. State the detectable effect size before treating a clean
   sweep as evidence of stability.
6. **Elect and size the credential.** Not assumed. A CI-6 default (30 monthly / **1 daily**) is
   blocked at the *first* call, not at the fifteenth.
7. **Sweep, then `summary runs/`.** Read strata, not the pooled figure.
8. **Carry all five limits** onto anything that reaches the M/W/S election.

## What it will not do

Invent or approximate a candidate text; report a rate it did not measure; run without an explicit
credential file; retry a failed call (a retry silently changes K); continue past a quota 429.


---

## Changelog — 2026-09-06: the pre-run blockers, fixed

The 2026-09-05 PR19 review (`operations/count-discipline-2026-09/2026-09-05-option-s-PR19-REVIEW-FINDINGS.md`)
recommended **do not run** until four pre-run blockers were resolved, because they change what the
*same* 240 calls yield — running first and fixing after would mean re-spending the whole sweep.
**Option S has still never made a call; `runs/` is still empty.** This changelog records the fixes,
not a run.

| Blocker | Disposition |
|---|---|
| **B1** — the two `direction` labels were inverted | **MOOT by removal.** Mentor ruling 2026-09-05 (Part 1 of `2026-09-05-mentor-rulings-five-relays-verbatim.md`): *"The decomposition is removed. Per-probe distributions replace it."* The field is gone, so it cannot be wrong. `option-s-runner.py`'s docstring assertion — the line the ruling named — is corrected. |
| **B2** — the floor set was narrower than the live block set | **FIXED, and not by widening the floor.** `/api/guardrail` defaults `threshold='deliberate'` and `meetsThreshold` is `rank >= rank(threshold)`, so `habitual` blocks; a `deliberate ×7 / habitual ×3` input published as `p_hat_floor 0.0`. The runner now also publishes `p_hat_block`, read from the gate's **own `proceed`** rather than re-derived from rank. `p_hat_floor` is retained unchanged — it is the ADR-010 §4 quantity M suppresses and W amplifies, and it is a different question. |
| **B3** — `would_option_M_record` was a mode, `would_option_W_record` was not worst-of-K | **FIXED.** `PROXIMITY_RANK` is transcribed from `guardrails.ts`; `ordinal_worst` takes the minimum rank and `ordinal_median` a true ordinal median. The mode's tie-break used `set()` iteration order, which CPython salts per process — the same data gave different answers across invocations. Determinism is now asserted across four `PYTHONHASHSEED` values. K is ruled **10**, which is even, so the median convention is **explicit**: `M_EVEN_K_CONVENTION = "lower_median"`, published on the output. **That is a convention, not a ruling** — it is a live input to the M/W/S election and the founder or mentor may set it otherwise. |
| **B4** — a `proceed` flip via `tier1_pause` was invisible and read as `stable_no_variance` | **FIXED by the same change as B2.** `proceed` is now read across the decision population (`verdict` + `tier1_pause`). `engine_unavailable` is deliberately **excluded**: D6a's round-3 correction holds an outage is *"infrastructure, not a gate judgement about the frozen text"*, so its conservative `proceed=false` would inflate the block rate with transport health. |

**Also fixed, from the same review's "not blockers" section:**

- **Idempotency.** Records carry a `series_id`; `--resume` skips a candidate that already holds a
  complete series. Before this, a sweep dying at candidate 12 could be recovered only by re-running
  from scratch and appending — **double-billing was the sole available recovery path.**
- **Series-aware pooling.** `summary()` groups by `series_id` and admits only a **complete** series;
  where two are complete the earliest is operative and the other is named. Previously an aborted
  sweep plus a re-run pooled two partial series into one input of n=15 taken hours apart.
- **The six D6a safeguards** that were not carried over when this file reimplemented the run loop:
  series ids, `fsync` after every paid call, first-call abort, per-call strict-field checks (every
  call, not only the first), raw-body retention, and per-call deploy identity with its caveat.
- **Spend gate.** A sweep now prints the dollar figure and requires `--yes` or a typed `PROCEED`;
  with no tty and no `--yes` it **aborts**. `sweep 25` is 600 calls ≈ $8.53 and previously started
  silently.
- **Redirect.** The comment claimed "No redirect handler" above a bare `urlopen`, which uses the
  default opener — and that opener follows redirects, carrying `Authorization` to the new host
  (CPython strips only `content-length` and `content-type`). This project runs an apex→www redirect.
  3xx is now **refused** and recorded.
- **L4** read from the candidates file rather than restated (see above).

**Tests.** `option-s-runner-test.py` — 34 assertions, no network calls, covering each blocker with
a case written to fail against the pre-fix behaviour. **Mutation-verified:** six reverts (worst-of-K
to `prox[0]`; median to a mode; `proceed` off verdicts only; outages readmitted; series-awareness
removed; the unranked-proximity filter removed) each turn the battery red — the last by a hard
`KeyError`, which is detection, not a miss.

**What is NOT resolved here** — these are the founder's or the mentor's, not the instrument's:

- **Q2 from the review** (the split is forced by the candidate set's composition) is *why* the
  decomposition was removed; the underlying selection-on-the-dependent-variable property remains and
  is stated as `LIMIT_3`.
- **The even-K median convention** is a stated choice, not a ruling.
- **Whether to run at all, and at what K,** is founder spend. Nothing here starts a sweep.
