# Option S — PR19 independent review. **Recommendation: do not run.**

**2026-09-05.** Item D of `2026-09-05-post-ruling-autonomous-work-NEXT-SESSION-PROMPT.md`.
Three parallel blind read-only reviewers on `operations/agent-circles-2026-08/option-s/`, dimensions
**statistical method** / **code failure modes** / **claims-vs-code**. **Nothing was executed** — the
reviewers were explicitly barred from running the instrument, which makes billable calls and has
deliberately never been run. `runs/` is still empty. **No quota was spent to produce this.**

## Recommendation

**Do not spend the ≈$3.41–4.12 until the four pre-run blockers below are resolved.** They change what
the *same* 240 calls yield, so running first and fixing after means re-spending the whole sweep. Two
further items are not code defects at all and are the founder's or the mentor's call.

**This is not a verdict on the instrument's design.** The estimand is right, the freeze discipline
works, the credential handling is clean, the cost arithmetic is exact, and no unproduced number is
stated anywhere in the directory. The defects are in the implementation of a correct choice, and in
documents that went stale under three commits landed after they were written.

---

## The four pre-run blockers

### B1 — The direction classifier's two labels are swapped
`option-s-runner.py:362-365`. **Verified first-hand by this session, not relayed.**

```python
"direction": (... "permits_what_it_usually_blocks" if floor_n * 2 < n_v else
                  "blocks_what_it_usually_permits"),
```

`floor_n * 2 < n_v` means the floor (`reflexive` = blocked) outcome is a **minority** — the input
*usually permits and occasionally blocks*. The code labels that `permits_what_it_usually_blocks`.
Both labels are inverted.

This is the output the 2026-08-30 ruling made mandatory, and it distinguishes those two cases
precisely because one is friction and the other is *the gate failing at its purpose*. **The
instrument would report the safety-relevant direction as the benign one, and the reverse.**

### B2 — The floor set is narrower than the live block set
`option-s-runner.py:86` (`FLOOR_PROXIMITY = "reflexive"`), `:329`. **Verified first-hand.**

`PROXIMITY_RANK` is `reflexive 0 · habitual 1 · deliberate 2 · principled 3 · sage_like 4`
(`guardrails.ts:80-86`); `meetsThreshold` is `rank >= rank(threshold)`; `/api/guardrail` defaults to
`threshold = 'deliberate'` (`route.ts:116`). **So `habitual` is blocked** — and `floor_count` does
not count it.

An input returning `deliberate ×7, habitual ×3` is a genuine **30% block rate on frozen text**. It
publishes as `floor_count: 0`, `p_hat_floor: 0.0` — and `pooled_p_hat_floor` is the declared headline
quantity. A reviewer also found the constant's justifying comment false at source: `obligationToProximity`
returns **`deliberate`** for an argued-`indeterminate` (the J2 cap), so a dikaiosyne floor firing as a
`sage_like → deliberate` cap scores zero.

### B3 — `would_option_M_record` is a mode, not a median; `would_option_W_record` is not worst-of-K
`option-s-runner.py:333-337`. **Confirmed independently by all three reviewers.**

The runner contains **no ordinal proximity scale at all** — `PROXIMITY_RANK` is never imported — so
neither an ordinal median nor an ordinal worst is computable in this file. `would_W` returns
`prox[0]`, the *first* verdict: for `[deliberate, habitual, deliberate]` the true worst-of-K is
`habitual` (blocked) and it reports `deliberate`, divergence zero. **It systematically understates
W**, and that figure is a published input to the M/W/S election.

`would_M`'s else-branch breaks ties by `set()` iteration order, which CPython salts per process. One
reviewer **ran the expression six times on a 3–3 split and got two different answers.** K=10 is even,
so a 5–5 split — exactly the boundary M turns on — lands in that branch. **`summary` is therefore not
reproducible across invocations on identical data, in an instrument whose entire subject is
reproducibility.**

### B4 — A `proceed` flip via `tier1_pause` is invisible and is labelled `stable_no_variance`
`option-s-runner.py:323, 327-328, 362`.

`prox` and `proceeds` are collected from `verdicts` only. An input returning `tier1_pause ×5`
(proceed=false) and `deliberate ×5` (proceed=true) reports `floor_count: 0`, `p_hat_floor: 0.0`,
`disagreed_proceed: false`, `direction: "stable_no_variance"`. **Every field says stable while the
gate flipped its decision half the time.**

This is D6a's own worst first-version defect, named in its docstring, reintroduced. The stated
justification ("only `verdict` outcomes carry a proximity") is true of proximity and **false of
`proceed`** — `classify_outcome` requires a boolean `proceed` before it can return `tier1_pause` at
all, so every pause record carries the flag this code discards.

---

## Two items that are NOT code fixes

**Q1 — the directional decomposition may be built against a superseded ruling.** The runner asserts
*"DIRECTIONAL DECOMPOSITION IS REQUIRED, NOT OPTIONAL"* citing the 2026-08-30 rate-presentation
ruling. Two reviewers independently report that ruling was **superseded the same day** by
`2026-08-30-mentor-ruling-pooled-sweep-n100-verbatim.md`, which states the directional decomposition
is *not* published, replaced by per-probe distributions — and CLAUDE.md's own 2026-09-03 block
records the same. If that reading holds, B1 is moot because the output should not exist.
**A mentor question, not a code change.**

**Q2 — the split is forced by the candidate set's composition.** The 9 rejections are **all**
`reflexive`; 13 of 15 winners are `principled`/`sage_like`. The strata were selected *on* the variable
being re-measured, and `direction` is a pure function of `floor_n*2` vs `n_v` — so the published split
tends toward the 15:9 role ratio **by construction**. This is the same class as D6a's round-5 finding
that a directional split was *"arithmetically forced by the probe composition, not a genuine
finding"*, whose ruled remedy was to remove the decomposition. Reported here rather than fixed,
because the remedy is a publication decision.

---

## Convergence across the three blind reviewers

| Defect | Method | Failure modes | Claims-vs-code |
|---|---|---|---|
| M is a mode / W is not worst-of-K | ✔ | ✔ | ✔ |
| Tie non-determinism across processes | ✔ | ✔ (executed) | — |
| Directional decomposition vs the superseded ruling | ✔ | ✔ (flagged cross-dim) | — |
| Partial/zero-verdict runs read as complete or stable | ✔ | ✔ | ✔ |
| No resume — re-running is the only recovery, and it double-bills | — | ✔ | ✔ |

Three reviewers reaching the same estimator defect by three different routes is the strongest signal
in this review.

## Also reported, not blockers

**Spend safety.** No idempotency or resume guard: a sweep dying at candidate 12 can only be recovered
by re-running from scratch and appending — **double-billing is the only available recovery path**.
A reviewer traces six safeguards D6a added under named PR19 rounds that were not carried over when
Option S reimplemented the run loop rather than importing it: series ids, `fsync`, first-call abort,
per-call strict-field checks, raw-body retention, deploy identity. There is also no confirmation gate
and no dollar figure in the pre-flight line: `sweep 25` would be 600 calls ≈ $8.53.

**Stale documents that reach the output.** Three commits landed after the README was written
(`8dfc978` K ruled 10, `13397ac` set size settled at 24, `4cb2008` candidates populated) and it
describes none of them — it still says *"no candidate text obtained"* and *"empty by design"*. Worse,
**`summary()` never reads `option-s-candidates.json`**, so it emits `LIMIT_4_set_size_discrepancy`
as **OPEN** and restates 29. The artifact reaching the election would assert a live open question
that production closed. `LIMIT_5` is named as surviving and is never published; the limit count is
given as five in three places where the JSON holds seven and the runner emits six.

**Header carryover on a 3xx.** A comment claims urllib's default opener protects the credential;
a reviewer confirmed against CPython source that `HTTPRedirectHandler` strips only `content-length`
and `content-type`, so `Authorization` **would** cross a redirect. Low likelihood (the endpoint is
already `www`), but this project does run an apex→www redirect.

## What is sound — stated so absence of a finding is not read as absence of a look

- **Cost arithmetic exact.** At the measured $0.014222/call: 24×10 = **$3.4133**; 29×3 = **$1.2373**,
  matching the ruling's verbatim *"approximately 87 calls at approximately $1.24"*. Quota units 480
  = 24×10×2, corroborated at source.
- **Candidate set verified.** 24 candidates, 15 winner / 9 rejection, proximity distribution an exact
  match to `_meta.STRATA_AT_POPULATION`, **all 24 byte guards pass**, no duplicate ids or texts.
- **No unproduced result is stated anywhere.** Every number is attributed and traceable; `summary()`
  structurally cannot emit a rate it did not measure. The Wilson figures reproduce exactly
  (Wilson(1,10) = 1.8–40.4%; Wilson(12,100) = 7.0–19.8%).
- **The forward-looking election is genuinely implemented** — `recorded_proximity` is surfaced for
  provenance and compared against nothing.
- **Credential handling clean** — file-or-env only, never logged or written into any artifact, and
  the credential file is currently **absent**, so an accidental invocation today aborts before any call.
- Freeze/byte guard, abort-on-quota, no-retry, abort-on-no-parse, and the D6a import discipline
  (abort if a primitive is missing rather than reimplement) are all present and correct.

## Provenance of the claims in this document

**Two findings were verified first-hand by this session and are not relayed:** B1 (the sign
inversion) and B2 (the floor-set/block-set mismatch), each read at source. **Everything else is
reviewer-reported.** Several are marked by their reviewer as confirmed by execution of pure-local
expressions; none required running the instrument. A founder acting on B3/B4 should expect to
re-confirm them, as I did for B1/B2.

## Disposition

**Not folded, deliberately.** Eleven-plus HIGH findings in a measurement instrument that gates a
mentor-ruled election, where several remedies are open methodological choices (whether `habitual`
joins the floor set; the even-K median convention; whether the directional decomposition should exist
at all) and one is a mentor question — unilateral repair under `code-elevated` at session end, on an
artifact a peer session was editing twenty minutes earlier, would be the wrong call. **The finding is
the deliverable.**

The prompt anticipated reviewing "the rebuilt runner". The artifact moved again while the prompt was
in flight — the candidates were populated at `4cb2008`, 04:22 today — so this review covers the
current state, which is newer than the one the prompt described.
