# The IDEA-loop bounded validation run — §6 report

**Compiled:** 2026-08-16, `sagereasoning`-side session (repo R1, per
`2026-08-15-concurrent-arc-plan.md`). **Loop instance:** `sagereasoning:idea-loop@v1#001`.
**Status:** closed by founder decision at 20 cycles, per mentor ruling
(`idea-loop-validation-run/MENTOR-RULING-cycle-20-stop-verbatim.md`, recorded
`D-MENTOR-RULING-IDEA-LOOP-STOP-AT-20-RECORDED-2026-08-16`) — the run reached the floor of its
ruled 20–40 range and was deliberately stopped there rather than continued, on the mentor's
judgement that the marginal cycles would replicate findings rather than sharpen them.

**Method.** Every number below is a **live re-derivation from production** (`idea_loop_cycles` +
`idea_loop_candidates`, service-role read, 2026-08-16), never reconstructed from the run log's own
narrative or from memory of this thread. Where the run log's prose is quoted, it is quoted, not
paraphrased as data. Per the standing plan's instruction, this report **folds in, rather than
overwrites**, the runner's own anomaly notes, ruled findings, and GS-ATRF-1/2 answer — the run log
(`idea-loop-validation-run/RUN-LOG.md`) remains the fuller record; this report is the ruled §6
shape distilled from it plus the independently-verified production numbers.

---

## 1. Cycles run

**20 completed cycles**, 2026-08-10T01:45 UTC → 2026-08-16T04:51 UTC (the run's full elapsed span:
just under six days, against a ruled minimum 4-hour inter-cycle gap).

**The run closed at the floor of its 20–40 target range, not the ceiling.** This is a mentor-ruled,
deliberate stop — not a technical limit, timeout, or exhaustion. See §9.

## 2. Outcome distribution

| Outcome | Count | % | Cycles |
|---|---|---|---|
| `winner` | 15 | **75%** | 1, 2, 4, 7, 8, 9, 10, 11, 12, 13, 14, 17, 18, 19, 20 |
| `dependency_unavailable` | 3 | 15% | 3, 5, 6 |
| `null_cycle` | 2 | 10% | 15, 16 |
| `terminated_by_timeout` | 0 | 0% | never reached |

**No cycle outcome was massaged or reclassified after the fact.** The three
`dependency_unavailable` cycles are three genuinely *distinct* `/api/reason`-side failure shapes,
not repeats of one class:
- **Cycle 3** — production contamination on `/api/reason` (a served-200 response, plausible and
  well-formed, but substantively wrong — not a failure signal of any kind). Discovered and
  mentor-ruled mid-run; fixed same-day (`D-REASON-INPUT-CAP-VS-PROJECTCONTEXT-CONTAMINATION-FIXED`,
  2026-08-11).
- **Cycle 5** — a second, distinct `/api/reason` anomaly: extraction blindness on legitimate input,
  reproduced on retry, stopped by direct analogy to cycle 3's discipline.
- **Cycle 6** — a third, distinct failure shape: an honest served fallback (`layer1_throw`), closer
  to the server-side guardrail failure class than to either prior `/api/reason` incident.

The two `null_cycle` outcomes (15, 16) are confirmed genuine empty-pool-at-selection events, not
runner errors — the distinction between an honest empty pool and a service failure was itself
checked at the cycles 10–18 mentor review and confirmed correctly applied.

## 3. Null-cycle rate

**10% (2/20).** Both `null_cycle` outcomes landed **back to back** (cycles 15, 16) — a pattern
raised by the runner and not yet ruled on by the mentor (carried, see §11).

## 4. Heuristic productivity

Cross-checked twice: against the run log's own per-cycle Step 4 record, and independently against
live `idea_loop_candidates` joined to `idea_loop_cycles.winner_candidate_id` — both agree exactly.

| Heuristic | Wins | Win cycles | Share of 15 winners |
|---|---|---|---|
| h1 `analogous_transfer` | 2 | 1, 7 | 13% |
| h2 `combinatorial_generation` | 2 | 9, 12 | 13% |
| h3 `synthesis_over_novelty` | 3 | 8, 10, 13 | 20% |
| h4 `context_transfer` | 3 | 4, 18, 19 | 20% |
| h5 `fifth_circle_weighting` | **0** | — | 0% |
| h6 `anomaly_detection` | **0** | — | 0% |
| h7 `friction_detection` | 5 | 2, 11, 14, 17, 20 | **33%** |

**Two named-zero results, both load-bearing:**

- **h5 never won in 20 cycles**, despite being the run's standing highest-reach candidate
  throughout (see §7, the reach-vs-irreversibility carried finding). It reached the guardrail step
  repeatedly but was consistently the decoupled high-reach/high-irreversibility outlier rather than
  a competitive winner.
- **h6 produced ZERO candidates across all 20 cycles — not zero wins, zero candidates at all.**
  Its ruled input is the runner's own examination history, and this run's session-boundary
  flattening (the M2 ruling) means that history never accumulated across sessions. This is the
  run's cleanest negative result: a limitation on **h6's productivity signal specifically**, not on
  the run's validity, and its standing-runner design implication is unambiguous — a standing runner
  must persist the runner's own history, or h6 is inert by construction.

### h7's win record — corrected, three-way split (mentor-ruled 2026-08-16)

The run log's own first accounting of h7's wins was wrong, caught by the runner while composing its
own close-out account, corrected, and re-ruled by the mentor same day. **Reported here in the
corrected, ruled form** (verbatim canonical: `idea-loop-validation-run/MENTOR-CORRECTION-h7-win-record.md`
+ the mentor's split ruling relayed to this session):

| Category | Count | Cycles |
|---|---|---|
| **Contested tie-break** | 4 | 2, 11, 14, 20 — h7 tied with one or more candidates, won by the `r mod n` phantasia draw |
| **Uncontested** | 1 | 17 — h7 was the sole survivor of both filters; no field existed to out-score or tie with |
| **Contested out-scoring** | **0** | h7 has never won by out-scoring a contested field on proximity alone |

**The surviving finding, mentor-stated:** *"h7 has never won by out-scoring a contested field on
proximity. Four of its five wins were ties broken by the phantasia draw; the fifth was uncontested
because the novelty gate had emptied the pool around it… The friction channel's competitiveness,
honestly stated, is zero on the dimension the discriminator was designed to measure."* The empty
`contested out-scoring` column is named explicitly per the mentor's own standing rule (an empty
column is a result to state, not omit) — a rule first issued on a false premise (a mistaken belief
the strict-win column was the empty one) and re-applied correctly here once the premise was
corrected. See §10 for the error's root cause, itself a named finding.

## 5. Cost per cycle

| Metric | Value |
|---|---|
| Total cost, 20 cycles | **$6.82** (682 cents) |
| Mean cost per cycle | **$0.341** (34.1 cents) |
| Range | 26¢ (cycle 19) – 46¢ (cycle 3) |

Every cycle carries a recorded cost; none is null or estimated.

**Elapsed time — honest gap, not filled.** Only **17 of 20 cycles** carry `started_at`/`ended_at`
timestamps; **cycles 5, 6, and 13 are null on both fields** (confirmed by direct query, not
inferred). Mean elapsed time over the 17 timestamped cycles: **~432,435 ms (~7.2 minutes)**. No
elapsed figure is reported for the full 20-cycle set, because doing so would either silently drop
three real cycles or silently impute a value neither the database nor the run log provides — this
gap is a naming item for the standing-runner design (timestamp-writing should not be
cycle-outcome-dependent), not a data point to paper over.

## 6. Anomalies

**Named and carried, none silently folded into the metrics above:**

1. **`X-Overage-Fired: true` recurred on multiple cycles' guardrail calls (cycles 7, 8, 10, 18, 19,
   20 among others) with no corresponding real billing** (a header artefact, not a real overage —
   confirmed harmless each time it fired). **`X-Overage-Fired` was conspicuously *absent* on three
   specific occasions** (cycles 10, 18, 19's h1 call) — raised by the runner as an open question,
   never ruled on. Three data points; no fourth arose in the closing cycles.
2. **A domain floored the aggregate proximity without appearing in `virtue_domains_engaged`**
   (cycle 20, reason-side `andreia`) — named as an anomaly, explicitly ruled **not** a fourth
   B7-signature instance.
3. **Cycle 19's extraction framed `reputation` as a good** (a value-error shape) — carried as a
   third distinct extraction-category finding shape, not yet ruled on generally (the specific
   instance's handling was confirmed correct at the cycles 19–20 review).
4. **Three whole-seed repeats of the run's own RNG draw** (cycles 5≈7's seed collision noted
   earlier in the run; cycle 14 and cycle 17 sharing `r=17` exactly) — disclosed each time as
   genuine RNG coincidence, not a repeated-draw bug; candidate content authored fresh each time.
5. **A fourth B7 cross-endpoint divergence signature was named and put in force from cycle 21 —
   which never ran.** Cycle 20 is on record as the first instance that *would* have flagged it, with
   explicit no-retroactive-escalation. **This mechanism is therefore designed but never exercised
   live** (see §9).
6. **Friction-only mode was entered exactly once (cycle 18) and exited within the same cycle** —
   also designed but effectively unvalidated at any sustained duration (see §9).
7. **Two reporting errors, same root cause, both caught before reaching this report** — see §10.

## 7. Carried findings, ruled where noted

**Reach vs. irreversibility (mentor-instructed tracking, every cycle).** Across every cycle where
it was assessed, h5 (`fifth_circle_weighting`) was consistently both the highest-reach and least-
reversible candidate present. The correlation held at the *selection* level throughout, but the
run's actual winners were repeatedly **decoupled** from it — the winning candidate was typically
low blast-radius and fully reversible (e.g. cycle 20: h5 sat at `deliberate` and failed novelty;
the winner, h7, was a CI contract test). Mentor's own framing, cycle 2: *"the friction channel may
be producing proposals that are both lower blast-radius AND higher proximity than the
virtue-domain heuristics."* **Explicitly marked beyond the run's designed measurements** — neither
GS-ATRF-1/2 nor this report's own ruled shape asks this question directly; it reaches the mentor
here as a flagged emergent finding, not folded silently into §4's counts.

**The guardrail calibration limit (ruled 2026-08-16).** A genuine `rejected_by_guardrail` on the
`analogous_transfer` channel (h1) scored a *described* defect as the *proposer's own* conduct — the
guardrail's harm-identification was correct, its attribution was not. Mentor's diagnosis, verbatim:
*"This is a phantasia-level failure — the impression presented to the extraction was distorted by
the framing of the text, and the extraction assented to it without examining whether the described
behaviour was the proposer's or the system's… the guardrail's floor may have been correct even if
the attribution was wrong."* **Named calibration limit for this report, verbatim:** *"the
guardrail's extraction cannot reliably distinguish between a proposal that exhibits a conduct and a
proposal that describes a conduct in order to remediate it."* h1's own rejection is **not**
reversed. **The hypothesis that this systematically depressed remediation-shaped candidates is
tested below, against the full candidate record, per the mentor's own instruction not to assert it
from one instance:**

Of the 120 candidates generated across the run, **9 were rejected by the guardrail** (proximity
`reflexive`, the floor class) and **37 failed the novelty check**; **74 passed both gates**. This
report does not have a mechanical, DB-derivable classifier for "remediation-shaped" — that judgement
requires reading each rejected candidate's proposed action, which the run log does for the single
instance already named (h1, cycle 20) but not systematically across all 9 guardrail rejections. **A
full test of the hypothesis is therefore NOT completed here** — doing so honestly requires either a
qualitative pass over all 9 rejected candidates' text (a follow-up task, not mechanically derivable
from this session's available data) or a mentor-guided reading. This gap is named rather than
silently closed with a plausible-sounding guess.

**The domain-pairing hypothesis — settled 2026-08-16, stronger wording.** *"The novelty gate
discriminates at the structural-combination level and reads combination density — a single prior
instance of a combination does not reduce confidence; the confidence reduction observed on
[phronesis, dikaiosyne] reflects the density of that combination in the window, not the window's
overall saturation."* Settles the run's earlier open cycle-13 question in favour of the
**discriminating-gate** reading over the depleted-pool reading — *"the pool is not depleted; the
gate is working."* **Standing-runner design input, ruled:** heuristic diversity **at the
combination level, not the domain level** is the variable that maintains novelty-pass rates over
longer runs.

**Credential-path stability, within a session as well as across sessions.** Two of five
credential-related blockers the runner counted are fully evidenced: one was closed by a genuine
mechanism change (Keychain read → founder-supplied token in the settings env block); one by a
genuine procedure change (self-verification moved out-of-session). **The fifth is categorically
different and unresolved:** the identical authenticated call, in the same session, under
(apparently) the same configuration, was refused once and then succeeded on retry — and the runner's
own account does not credit the settings change made in between with the fix. **The finding,
stated precisely by the runner and carried here unchanged:** *"genuinely non-deterministic blocking
of the tool's own intended use is not something a retry-and-proceed policy can be trusted to paper
over indefinitely."* Two of the five blockers (#3–4) were never detailed to the repo-side session at
all — named as a gap, not filled with invented detail.

**Early-run vs. signal-producing split (ruled at the cycles 10–18 review).** Cycles 1–10 operated on
thin or degenerate signal (an under-populated novelty window, per the run's own design); cycle 11
onward is the signal-producing period. **Any distribution reported across all 20 cycles in this
report should be read with that split in view** — §2's 75% win rate and §4's heuristic counts span
both periods without separating them, because the ruled §6 shape asks for the full-run distribution;
a period-split re-analysis is named here as a legitimate follow-up question, not performed in this
report.

## 8. GS-ATRF-1 and GS-ATRF-2 (folded from the run log's Part D, decided at open)

**GS-ATRF-1 — computed per candidate, reasoning and reporting only, never reordering selection
(M3):**

| Dimension | Virtue | Read from | Status |
|---|---|---|---|
| Circles affected | dikaiosyne | the gap's `targetCircle` | Inoperative within a cycle — gap-level, uniform by construction (M5) |
| Irreversibility | andreia | the runner's judgement of the `proposed_action` | Working |
| Preferred indifferents at stake | phronesis | `initialClassification` + the action's content | Working |
| Excess over what reason warrants | sophrosyne | the runner's judgement against the gap | Working |

**GS-ATRF-2 — this run log only; nothing persisted server-side.** No column exists for it. The
indicator was deliberately **not** written into `proposed_action` as free-text colour, even though
the runner's own prompt offered that option — `proposed_action` is the field the founder dashboard
renders under Q7 to judge guardrail calibration, and appending runner commentary there would
corrupt the exact field that ruling exists to keep clean, making the guardrail's verdict
non-reconstructable from the record.

## 9. Designed but never exercised, live

Two mechanisms were ruled into force during the run and never operated under real conditions before
the run closed:

- **The fourth B7 cross-endpoint divergence signature** — ruled in force from cycle 21, which never
  ran. Cycle 20 is the sole instance on record that *would* have triggered it (a per-domain floor
  contradiction of ≥3 ranks on a domain present in `virtue_domains_engaged` on both sides), with no
  retroactive escalation.
- **Friction-only mode's sustained operation** — entered once (cycle 18) and exited within the same
  cycle. Its behaviour under any longer duration is untested.

Both are carried to the standing-runner design session as **designed but unvalidated** — a status
this report names explicitly rather than allowing either to read, by omission, as proven.

## 10. Reconciliation — two reporting errors, one root cause

**Cycle 15's candidate-count inconsistency** was found and left unamended by an earlier mentor
ruling (recorded in the run log at the cycles-15/16 review; the ruling's own reasoning is preserved
there and not repeated here).

**Two runner tally errors surfaced at the run's close, same class, caught in sequence:** the run
log's own account (`MENTOR-CORRECTION-h7-win-record.md`) states it directly: *"The §4 finding was
itself presented as a correction — I had written 'third tie-break win,' checked it, and found four.
But I checked the tie-break count and never checked the win list I was counting over. A verified
arithmetic operating on an unverified set."* This class — a correctly-computed operation over an
incorrectly-remembered domain — is named here as the reconciliation section's own finding, because
it is more useful to the standing-runner design than either individual miscount: **any tally the
standing runner reports should be re-derived from the underlying set at report time, not carried
forward from a remembered prior count.**

## 11. Still un-ruled, carried forward unchanged

Per the run log's own accounting, unresolved by any mentor ruling as of run close: cycle 9's h2
two-rank guardrail-verdict gap and the T-07 dikaiosyne-floor question; the `X-Overage-Fired`
absence pattern (three data points, no fourth); cycle 11's three first-of-their-kind findings;
cycle 13's widest-novelty-rejection finding; cycle 14's widest-guardrail-floor finding; cycle 15's
first-`null_cycle` and first-passion-bearing-guardrail-rejection findings; cycle 16's
back-to-back-null-pair finding; the reach-vs-irreversibility decoupling pattern's full implication
(§7, named as beyond the run's designed measurements); the remediation-shaped-candidate hypothesis
(§7, named as untested against the full record); the early-run/signal-producing re-analysis (§7).
None of these gates R1's own close or the O-C scoping session; they are named so a future
standing-runner design session does not have to re-derive them from the raw log.

## 12. Named deviation from the ruled shape — the `ORIENTATION_DELIVERY_TIMEOUT_MS` divergence

Per the standing plan's own instruction to name whether this divergence showed up in the trust-event
data as expected: **it showed up, but not uniformly.** A direct query of `agent_trust_events` for
`orientation-reading-*` events on `agent_id = sagereasoning:idea-loop@v1` returns **22 events: 19
classed `observed`, 3 classed `examined`.** The scoping analysis that named this divergence
(`operations/agent-circles-2026-08/2026-08-10-runner-scoping.md` §3) predicted every winner consult
would classify `observed`, because the runner's own consults consistently exceed the 28,000 ms
`ORIENTATION_DELIVERY_TIMEOUT_MS` bound. **The predominant pattern (19/22, ~86%) matches that
prediction; the 3 `examined` instances do not, and no explanation for them was derived in this
report** — a genuine, named gap, not a confirmed-clean result glossed as one.

## 13. The `not_selected` gap and fix — named honestly, per the standing plan's own instruction

Cycle 1 found a missing `not_selected` candidate-outcome value that blocked the run until a
repo-side session fixed it live (`D-RUNNER-SCOPING-SESSION-COMPLETE-2026-08-10`; the migration
`supabase-idea-loop-candidate-outcome-not-selected-migration.sql`). Confirmed still live and wired:
`'not_selected'` is present in `website/src/app/api/practice/watching/handler.ts`'s accepted-values
list. This was the run's first and most consequential Mode-1 event, and it is named here exactly as
the standing plan's own report-shape instruction requires — an anomaly the format exists to
surface, not a footnote.

---

*End of report. Compiled per `2026-08-15-concurrent-arc-plan.md` R1. Ready for the mentor
consultation the plan's own R1 step requires before any standing-runner design session opens.*
