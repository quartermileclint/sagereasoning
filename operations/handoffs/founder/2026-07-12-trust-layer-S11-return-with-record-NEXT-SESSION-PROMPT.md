# Next-Session Prompt — Trust Layer S11: return with the 7-day record → re-examine the enforce assent

**For the founder. Paste as the first message of a fresh session** once the false-hold observation instrument has accumulated **≥7 days** of live MEASURE capture in your loop (the `false-hold-record.jsonl` buffer has a week+ of records). This is the session that closes the observation period and puts the S11 enforce assent back under examination against the mentor's four-part readiness standard.

**Stream:** founder. **Tier:** `governance` for the readiness assessment (documents + a read-only report run). **If the standard is met AND you elect to proceed, the S11 enforce flip itself is a SEPARATE `code-critical` founder-walked session** — this return-session assesses readiness and, if ready, re-confirms the assent and hands off to the flip; it does not flip.
**Governing frame:** the two caches. **Design-of-record:** ADR-013 §7/§11 (the 2026-07-12 readiness-standard amendment) + the build plan §S11 (DEFERRED-readiness-gated). **Binding verdict:** `operations/trust-layer-2026-07/2026-07-12-mentor-consultation-s11-enforce-gate-verdict-verbatim.md` (verbatim wins). **Predecessors:** the deferral close (`2026-07-12-trust-layer-S11-enforce-gate-mentor-deferral-CLOSE.md`) + the observation-instrument close (`2026-07-12-trust-layer-S11-observation-instrument-CLOSE.md`).

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
