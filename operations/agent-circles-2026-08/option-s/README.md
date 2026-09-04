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
   and is not. **Now:** per-input floor count and `p_hat_floor`, the directional split, stratified
   by `decision_role`, plus `would_option_M_record` / `would_option_W_record`.
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

## Files

| File | What it is |
|---|---|
| `option-s-candidates.json` | Input set. **Empty by design**; carries five limits and an unset K. |
| `EXTRACTION.sql` | Founder-run, read-only. §0 scopes the run; §PRE settles the set size; §3 emits the JSON; §4 the L2 trace. |
| `option-s-runner.py` | Collector + summary. Imports D6a's classifiers; implements its own call path. |
| `runs/` | Empty. The series is the artifact; committed, never deleted. |

## The walk (founder-performed — none of it done here)

1. **Look for existing data first.** `guardrail/route.ts:99-101` records that the 2026-08-29 c11
   re-submission experiment wrote 10 metered rows — a K-repeat may already exist. Find it before
   spending quota re-deriving it.
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
