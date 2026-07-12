# Next-Session Prompt — Trust Layer S11 observation period: the false-hold instrument + the 7-day live-MEASURE record

**For the founder. Paste as the first message of a fresh session** once you are ready to build the observation instrument (this is the gating work before the S11 enforce flip can be re-examined).

**Stream:** founder. **Tier:** `code-elevated` (a repo-only instrument + telemetry; no flag flip, no perimeter/auth/schema-of-live-tables change unless the labelling design needs a store — decide at open). **NOT `code-critical`** — nothing here binds any decision; it only *measures* the MEASURE record. The enforce flip is a later session, gated on this one's output.
**Governing frame:** the two caches. **Design-of-record:** ADR-013 §7 + §11 (the 2026-07-12 amendment — the readiness standard) + ADR-012 + the build plan §S11 (deferred). **Binding verdict:** `operations/trust-layer-2026-07/2026-07-12-mentor-consultation-s11-enforce-gate-verdict-verbatim.md` (verbatim wins). **Predecessor close:** `operations/handoffs/founder/2026-07-12-trust-layer-S11-enforce-gate-mentor-deferral-CLOSE.md`.

## Why this session exists

The S11 enforce flip was examined and **deferred on mentor counsel** (adopted in full). The mentor named a precise readiness standard rather than "more time." Every deterministic battery is green; what is missing is **live evidence on the observed action distribution**. This session builds the instrument that makes the missing evidence measurable, then the seven-day clock runs. Q1(c) — a *measured* false-hold rate — is unmeasurable until the labelling instrument exists, so the observation period cannot honestly start before it.

## The readiness standard this session serves (all four gate the eventual flip)

1. **Duration** — ≥7 days live MEASURE on the founder's loop over a **representative** action distribution.
2. **Record shape** — all four cardinal domains (dikaiosyne, sophrosyne, andreia, phronesis) evaluated ≥1×; aggregate confidence above conservative on ≥2.
3. **False-hold rate** — a **measured** rate on the at-action examination across the live distribution; target: false holds on kathekon-free actions ≤ correct holds on genuinely problematic actions. **This session builds the instrument that produces this number.**
4. **Q3 encoded** — the G6(a) kathekon-engagement qualification (already recorded in ADR-013 §11 + the build plan §S11 as binding spec; this session need not build it — it binds only at the flip — but the labelling instrument's "was this hold false?" classifier should reuse the same kathekon-engagement predicate so the two are consistent).

## Scope — the false-hold labelling instrument (the design decision is the first task)

The MEASURE record today logs at-action verdicts (the `agent_trust_events` ledger + the harness's own logs) but **does not label which holds were false positives**. The instrument must let the seven-day record answer: *of the at-action holds this instrument would have bound under enforce, how many were on kathekon-free actions vs. genuinely problematic ones?*

**Open design question to settle at open (AskUserQuestion):** how is a hold classified false vs. correct? Candidate mechanisms (the mentor's Q3 pointed at "recorded in the instrument-fidelity battery's live accumulation"):
- **(a) Structural proxy, no human label** — classify by the verdict that opened the loop: a hold opened by a "contrary; no kathekon factors detected" verdict (proximity deliberate+, no justice surface, no violated obligation, no sub-species passion) is a **candidate false positive**; a hold opened by a kathekon-engagement-threshold verdict is a **candidate correct hold**. This is exactly the Q3 predicate — cheap, fully automated, and self-consistent with the flip's binding rule. Its limit: it measures "would G6-as-qualified have bound?", which is close to but not identical to ground-truth false/correct.
- **(b) Structural proxy + a light human confirm** — (a) plus a per-hold one-tap founder label at the moment of the hold (or a retrospective daily review), to catch cases where the structural proxy and the founder's judgement diverge.
- **(c) Retrospective review only** — no live instrument; at day 7, review the accumulated ledger by hand and label each hold. Lightest to build, heaviest to run, and it forfeits the "live accumulation" the mentor named.

**Recommendation to weigh (not a decision):** (a) as the automated backbone — it is the honest realization of Q3 and needs no new human ritual — with the retrospective review (c) as a day-7 cross-check on a sample, so the rate has both an automated number and a human spot-check. (b)'s per-hold tap risks the one-line-operational-handoff failure mode (PR17) in reverse — a ritual the founder must sustain for seven days.

## Procedure

1. **Reads** (caches; this prompt's predecessor close; the verbatim verdict §1 Q1+Q3; ADR-013 §11 2026-07-12 amendment; the build plan §S11).
2. **Confirm the readiness standard + the deferral is adopted** (it is — `D-TRUST-LAYER-S11-ENFORCE-GATE-MENTOR-DEFERRED`).
3. **Election (AskUserQuestion): the labelling mechanism** (a / b / c above), and whether it needs a store (a small `agent_trust_events`-adjacent telemetry surface or a repo-local JSONL — decide by whether the record must survive across the founder's sessions; JSONL under the harness state dir is likely enough and avoids a schema step).
4. **Build the instrument** (`code-elevated`, repo-only): reuse the Q3 kathekon-engagement predicate (share the exact function the eventual G6(a) qualification will use — do NOT re-implement it); classify each at-action hold; accumulate the count + the rate; a small reader that reports the running tally + the four-domain-coverage state + the aggregate-confidence-above-conservative check (the whole readiness standard in one view). Instrument-fidelity-shaped (KG-EX1 — it measures, it never beats-bare). Battery-pin the classifier against the five live false-positive instances this session produced (they are in the S11 close + the verbatim record) + at least one genuine kathekon-engaged hold as the positive control.
5. **Adversarial review** (Workflow; refuters; route to `model:'opus'` if the Fable pool exhausts — the S10 precedent). The load-bearing claim to refute: *the classifier's false/correct split is faithful and non-vacuous* (the positive control genuinely separates from the false-positive class).
6. **Start the seven-day clock** — the founder confirms the instrument is live in the loop (a founder-walked install step, PR17 — scripted live, not handed off); the record accumulates over ≥7 days of ordinary work.
7. **Records + close.** The observation period runs across sessions; a later session returns with the record for the S11 assent to be re-examined against the four-part standard.

## What this session does NOT do

No enforce flip. No `GATE1_CALLING_GATE_MODE=enforce`. No decision binds. The intervention engine stays MEASURE. The instrument only labels and counts. The flip is re-examined in a future session, only after the standard is met — and even then, per PR7, the assent remains the founder's, re-confirmed at flip time.

## Rollback

`git revert` the instrument commit (repo-only; nothing live binds). If a telemetry store was added, drop it (it holds only hold-classification counts, no PII beyond what the trust ledger already holds).

## Forecast

Success = the readiness standard becomes *measurable and being measured*: a running false-hold rate, four-domain coverage tracking, and confidence-above-conservative tracking, all visible in one reader, accumulating over the founder's ordinary work. When the seven days are in and the rate clears the target (false holds on kathekon-free actions ≤ correct holds on problematic ones), the S11 flip is re-examined — staged, G6-qualified, with the enforcement-claim bounds named — per the binding verdict. Until then, the instrument makes visible what the practice has already been doing.

End of prompt.
