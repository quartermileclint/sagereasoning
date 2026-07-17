# Next-Session Prompt — Trust Layer S11: return with the 7-day record → re-examine the enforce assent

**For the founder. Paste as the first message of a fresh session** once the false-hold observation instrument has accumulated **≥7 days** of live MEASURE capture in your loop (the `false-hold-record.jsonl` buffer has a week+ of records). This is the session that closes the observation period and puts the S11 enforce assent back under examination against the mentor's four-part readiness standard.

**Stream:** founder. **Tier:** `governance` for the readiness assessment (documents + a read-only report run). **If the standard is met AND you elect to proceed, the S11 enforce flip itself is a SEPARATE `code-critical` founder-walked session** — this return-session assesses readiness and, if ready, re-confirms the assent and hands off to the flip; it does not flip.
**Governing frame:** the two caches. **Design-of-record:** ADR-013 §7/§11 (the 2026-07-12 readiness-standard amendment) + the build plan §S11 (DEFERRED-readiness-gated). **Binding verdict:** `operations/trust-layer-2026-07/2026-07-12-mentor-consultation-s11-enforce-gate-verdict-verbatim.md` (verbatim wins). **Predecessors:** the deferral close (`2026-07-12-trust-layer-S11-enforce-gate-mentor-deferral-CLOSE.md`) + the observation-instrument close (`2026-07-12-trust-layer-S11-observation-instrument-CLOSE.md`).

---

> # 🛑 SUPERSEDED — DO NOT RUN THIS SESSION. (2026-07-17)
>
> **The mentor has ruled. The readiness standard is NOT met. The flip does not proceed.** This session's premise — *run the report, assess the four-part standard, and if met re-examine the assent* — is discharged: the report's part-(3) reading was put to the mentor and **ruled an artifact**, and the standard fails on parts (1) and (2) independently besides.
>
> **Binding verdict (verbatim wins):** `operations/trust-layer-2026-07/2026-07-17-mentor-consultation-F2-exclusion-clause-verdict-verbatim.md` · **adopted in full** under `D-TRUST-LAYER-S11-F2-MENTOR-RULING-EXCLUSION-CLAUSE-GOVERNS-ADOPTED`.
>
> **The ruling in one line:** the Q3 threshold's inclusion clause (the four arms) and **exclusion clause** (*"contrary to appropriate action with no kathekon factors detected"*) both fire on the same record; **THE EXCLUSION CLAUSE GOVERNS** (*"specific governs general"*); **Arm 1 requires narrowing**; **the flip does not proceed.**
>
> **➡ THE SUCCESSOR IS THE NARROWING SESSION (S11a):** `operations/handoffs/founder/2026-07-17-trust-layer-S11a-arm-narrowing-NEXT-SESSION-PROMPT.md` — the arm narrowing + the Layer-1 extraction review + the public trust-record cap, all three in scope per the ruling ("not deferred").
>
> **The clock is STOPPED** (founder election 2026-07-17); the buffer is frozen as evidence of record at `operations/trust-layer-2026-07/runs/2026-07-17/false-hold-record-FROZEN-2026-07-17.jsonl` (**130 records**). **Any future part-(3) measurement needs a NEW window** — the narrowed predicate + a representative distribution + a populated denominator (the guard path writes no record today, so the ratio's denominator has no source). **Do not resurrect this prompt; author a fresh one when a re-measurement is actually designed.**
>
> *The diagnostic content below is retained as the record of what the observation period found. The §33 VALIDITY CAVEAT called this on day one, on 4 records.*
>
> ---
>
> ## (superseded) ⛔ HELD — added 2026-07-17 (RA-1-F2), before the ruling
>
> **Part (3) is HELD pending a mentor ruling. Do not assess it from the report as it stands. Parts (1) and (2) FAIL independently — this session is very likely moot on the mentor's own conjunctive standard regardless of the ruling.**
>
> **Frozen snapshot (2026-07-17T11:24:03Z, 125 records; the buffer is live and growing — it was 117 when raised, 125 at snapshot):**
> - `dikaiosyne` tagged **125/125** · zero circles **124/125** · `subSpeciesPassions` empty **125/125** · `proximity: deliberate` **125/125** · `is_kathekon:false / "contrary"` **123/125** · tools **`Edit` 63 / `Write` 62 (all file writes)** · depth `standard` ×125 · loop `reopened` 111 / `opened` 13 / **`closed` 1**.
> - Report: **124 holds · 0 false positives · 124 correct holds · `false ≤ correct: MET`** — all 124 via the justice-surface arm alone.
>
> **The mechanism (verified at source).** `computeVirtueDomains` tags `dikaiosyne` on `circles ≥ 1 || is_kathekon !== null` — and `is_kathekon` is non-null when it is **`false`**. The same field *creates* the hold (`selectImprovementPath` priority 4). So `is_kathekon === false` — the engine's `"No kathekon factors detected; action is contrary to appropriate action."` — both creates the hold and satisfies the test for calling it correct. **The mentor's Q3 gave two clauses that both fire on this state:** the inclusion clause (four arms) and the exclusion clause (*"G6(a) does not bind when… a verdict that found contrary to appropriate action with no kathekon factors detected"*). **Which governs is the mentor's to say.**
>
> **⚠ THE BIGGEST ITEM IS NOT PART (3) — it is Q2's staging premise.** The mentor staged the **do-not-proceed class first** on the premise *"a benign action that engages no kathekon factors cannot trigger a do-not-proceed row. The do-not-proceed class therefore has a structural false-positive floor of zero."* The decision table contains `Deliberate + justice surface unevaluated → do not proceed + escalate`. Running the project's own `recommendIntervention` over the 125 records (first-hand, this session): **Arm 1's reading ⇒ 124 `do-not-proceed`, 1 pause; the §4 reading (`justiceSurface: 'none'`) ⇒ 125 `proceed`.** Same records, complete inversion. **Honest bound:** this is a *reconstruction* feeding the at-action verdict's signals into S4 — the live harness advisory reads the accumulated trust state and reports `proceed/log`; which input the flip would use is an open design question. It is **not** a claim that enforce would deny 124/125. It **is** that the same unresolved question decides the staging premise already adopted.
>
> **Four corrections to the finding of record** (each surfaced by re-verifying it, each against the AI's own interest): (1) the `false_positive` class is **not** "structurally unreachable" — it is reachable at exactly one kathekon factor (`marginal` ⇒ `is_kathekon: null`), and went unreached only because `marginal` occurred **0** times; it is unreachable *whenever the engine returns `contrary`*. (2) The §3 bridge precedent does **not** "mirror" a circle-requirement — the first build **tried** dropping the tag and it **UNDER-fired** on a circle-free calm injustice; the fix was a *broader* trigger, and the firing directions invert, so the precedent is **non-dispositive either way**. (3) "Parts (1), (2) and (4) are unaffected" is **false** — part (1) is 4.91/7 days on one action class; part (2) has **one** evaluated domain (`unevaluated_cardinal_domains: ["phronesis","andreia","sophrosyne"]`, `confidence_weight: 0.42`) against the mentor's own *"a trust record with one evaluated domain … is not a record that can tell you…"*. (4) ADR-010's U2 **had** a circle — it is not this case.
>
> **Two further reasons part (3) may be unmeasurable here regardless of the ruling:** (a) the ratio's **denominator cannot be populated** — the capture is CONSULT-path only (`at-action-hook.mjs:595` inside `runConsult`); the genuinely dangerous actions route to `runGuard` (no capture) and Bash is not consulted, so "correct holds on genuinely problematic actions" has no source; (b) the mentor's **tolerance condition is unavailable** — false holds are acceptable *"if … the correction loop closes quickly"*, and the loop closed **1 time in 125**.
>
> **Vacuity ≠ falsity.** If Arm 1 is faithful, these actions genuinely failed to exercise justice and holding them is correct — it is the *rate* that carries no signal, not the holds that are wrong. Do not slide from one to the other (the finding of record does).
>
> **Separate live finding (own disposition needed, not S11-gated):** the public trust-record surface publishes `"justice_capped": true` for `sagereasoning:s9-loop@v1` today, latched by `justice-surface-unevaluated` events from the same circle-free artifact; the latch **cannot clear** on this action class (clearing needs a circle carrying `status:'met'`). Verified live by unauthenticated GET; the cap's *ground* is inferred, not queried from the event ledger.
>
> **Status:** briefing authored (`operations/trust-layer-2026-07/2026-07-17-F2-mentor-briefing.md`); finding of record (`…/2026-07-17-RA1-F2-s11-observation-instrument-vacuity-finding.md`) — **read it with the four corrections above**. **Nothing implemented; no ingest run** (`--dry-run` only, so no structurally-zero rate is in `agent_hold_observations`). **Resume only after the mentor rules.**

---

## Why this session exists

The mentor deferred the S11 flip with a precise readiness standard, not "more time." The observation instrument (built 2026-07-12) has been capturing every at-action examination's kathekon-engagement signals to a durable record and classifying each hold via the canonical Q3 predicate. After ≥7 days, the record can answer the one question the batteries never could: **on the actual live distribution, do false holds on kathekon-free actions stay ≤ correct holds on genuinely problematic ones?** This session reads that record and decides whether the examination is complete enough to license the enforce assent.

## The four-part readiness standard (all four before the flip is re-examined)

1. **Duration** — ≥7 days live MEASURE over a **representative** action distribution.
2. **Record shape** — all four cardinal domains (dikaiosyne, sophrosyne, andreia, phronesis) evaluated ≥1×; aggregate confidence above conservative on ≥2.
3. **False-hold rate** — a measured rate: false holds on kathekon-free actions ≤ correct holds on problematic ones.
4. **Q3 encoded** — the G6(a) kathekon-engagement qualification (SATISFIED — `assessKathekonEngagement` in `website/src/lib/substrate/trust-core/kathekon-engagement.ts`, the shared function the flip binds on).

## Procedure

1. **Reads** — the two caches; the deferral close + the observation-instrument close; the verbatim verdict §1 (Q1 readiness + Q2/Q3/Q4/Q5/Q6/Q7 the binding shape); ADR-013 §7/§11.

2. **Run the readiness report** (read-only against production, service role; the AI guides, the founder runs any DB-touching command per PR17):
   ```
   cd website
   npx tsx --env-file=.env.local scripts/false-hold-observation-report.ts \
     --records "<the durable GATE1_STATE_DIR>/false-hold-record.jsonl" \
     --agent-id sagereasoning:s9-loop@v1
   ```
   This ingests the buffer into `agent_hold_observations` (idempotent), purges expired rows, reads the trust state, and prints the whole readiness standard in one view: the window/days, the total examinations, the holds, the false-positive vs. correct split + the `false ≤ correct` comparison, the four-domain coverage, and the aggregate confidence. (A `--dry-run` variant reports from the JSONL alone with no DB.)

3. **Assess against the standard** — honestly, part by part. Note the sample size (a rate over a handful of holds is not yet meaningful — the report flags small samples). Part 2's "confidence above conservative" is the founder's call against the surfaced per-domain trust state. Part 3 is the load-bearing measurement; interpret it with the mentor's target (false ≤ correct), not a bare ratio. **Representativeness matters:** if the 7 days were all one action class (e.g. all doc edits), the distribution is not representative — extend the window or note the caveat.
   - **THE VALIDITY CAVEAT surfaced by the first live data (2026-07-12, 4 records):** the classification swings on whether the Layer-1 extractor tags `dikaiosyne` on the action, and that tagging appears to track the action's SUBJECT MATTER, not whether the act genuinely engages a non-consenting party. The first four records — all trust-layer doc edits (writing the summary, the decision-log) — were tagged `dikaiosyne` with NO obligation evaluated ⇒ the "justice-surface-unevaluated" arm ⇒ `correct_hold` (4/4, 0 false positives); the SAME class of act in the build session was tagged `phronesis` ⇒ `false_positive`. The predicate is FAITHFUL (an unevaluated justice surface is a genuine do-not-proceed per the decision table — this is not a bug), but the input is noisy on routine internal acts. **Consequence:** `correct_hold`s can be INFLATED (understating the false-positive rate — the dangerous direction for a readiness gate) on justice-laden-content acts. **Do at the return:** (a) spot-check a sample of `correct_hold`s — are they GENUINELY justice-engaged, or `dikaiosyne`-over-tagged-and-unevaluated on an internal act? (b) confirm the window covered VARIED work (code, bash, docs), not just trust-layer docs; (c) weigh a candidate refinement/mentor question — should the "justice surface present" arm require an EVALUATED obligation (or a genuine non-consenting party in scope) rather than mere `dikaiosyne`-tagged-but-unevaluated? Do NOT change the predicate mid-observation (it is faithful + adversarially reviewed); decide at the return, on a representative sample.

4. **The fork:**
   - **If the standard is met** → the examination is complete enough to license re-examining the assent. **Consult the mentor** if the founder elects (the standing convention for the assent-hinge), then prepare the S11 enforce flip as a `code-critical` founder-walked session, encoding the binding shape from the verbatim verdict: **staged** (do-not-proceed class first, then the pause rows + G6 loop bound after a live calibration window); **G6(a) QUALIFIED** by the kathekon-engagement predicate (wire `assessKathekonEngagement` into the G6 write boundary so a "contrary; no kathekon" verdict is log-and-continue + a developmental flag + a recorded false-positive instance, NOT a do-not-proceed); PA-5 / PA-10 / the A2 decrease-dodge named as **enforcement-claim bounds** on the surface; the calling-gate enforce arm flips **with** the engine; aggregate-keyed depth binds at v1 (per-domain carve-out gated on the A5 recency-tier closures). **The assent is re-confirmed at flip time (PR7) — the 0h call remains the founder's.**
   - **If the standard is NOT met** → extend the observation window (keep the capture on), and/or diagnose *why* (e.g. the false-hold rate is high because the at-action false-positive class is intermittent-but-frequent — which is itself the data the mentor wanted; a high rate is a reason to NOT flip the pause rows, exactly as Q2's staging anticipates). Record the reading and set the next checkpoint.

5. **Records + close** — the readiness reading, the fork taken, and (if proceeding) the S11 flip prompt.

## What this session does NOT do

It does not flip any enforce flag. It reads the record and decides readiness. Even when ready, the flip is its own founder-walked Critical session with the assent re-confirmed at flip time.

## Rollback

Read-only (the report ingest is idempotent + additive; the table is the founder's own observation ledger, DROP-able). No production behaviour changes in this session.

## Forecast

Success = a clear, honest reading of whether the live distribution's false-hold rate clears the mentor's target, with the four-part standard laid out part by part, and either a prepared S11 flip (binding shape encoded) or a recorded reason to keep observing. When the flip finally runs, it will not be the first time the principle binds — it will be the first time the infrastructure makes visible what the practice has already been doing.

End of prompt.
