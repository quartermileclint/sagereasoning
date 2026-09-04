# Mentor ruling — guard availability bears on ENFORCE; lean mode is doctrinal; Q-X1 confirmed (verbatim)

**Relayed by the founder 2026-09-05**, in response to
`2026-09-05-BRIEF-AND-MENTOR-QUESTIONS-session-outstanding-items.md`.

**Status: ADOPTED AS BINDING on relay. This verbatim record wins over every summary of it** —
including the decision-log entry, the Gate-2 diagnosis, the S11 register's new bound, and any
successor prompt.

**Recording entry:** `D-MENTOR-RULING-GUARD-AVAILABILITY-AND-LEAN-MODE-DOCTRINE-2026-09-05`.

**Headlines (the verbatim governs).** **Q-X1 CONFIRMED** — the v3/v4 item is dropped from Path A's
owed list, leaving **the production extraction as its single precondition**; the A8 bound was
*"correctly accepted"*; the cross-track contamination is *"noted as a mechanism fact worth carrying"*
and the correction must **name its source**. **Q-G1(a): YES, and the bearing is NOT captured by the
four-part readiness standard** — *"The false-hold rate and the presence rate are orthogonal
quantities"*; a channel absent a fifth to a third of the time *"is not failing its examination. It is
not conducting one."* **This is NOT a new gate and the four-part standard is NOT reopened** — it is a
disclosure that must be named before any flip is considered. **Q-G1(b): YES, doctrinal** — *"A
shorter impression is a different impression"*; lean mode is **not** a fidelity-vs-availability
tradeoff in the engineering sense but **examination completeness vs examination frequency**, and a
lean examination that misses what would trigger a hold *"is failing to see what it would need to see
to hold — a different failure mode from a false hold, and not measured by the false-hold rate."*
**Q-G1(c): YES — the availability covariate is "not optional for honest reporting."** **All six
founder recommendations confirmed correct**, with one addition to F2.

---

## The ruling, verbatim

> ## Q-X1 — Confirmation: drop the v3/v4 item from Path A's "owed before the run" list
>
> Confirmed. The v3/v4 lift check is a P6 condition, not an Option S condition. The Path A ruling's "owed before the run" list is corrected to a single precondition: the production extraction via EXTRACTION.sql.
>
> The A8 bound was correctly accepted as independently verified and cheap to carry. The executing session's reading was right and it proceeded correctly.
>
> The cross-track contamination is noted as a mechanism fact worth carrying: two rulings issued to two tracks on the same day shared a condition that belonged to only one of them. The record should carry a note in the Path A ruling's correction entry naming the source — P6 ruling, same day — so a future reader understands why the item appeared and why it was dropped.
>
> ---
>
> ## Q-G1 — The guard is chronically unavailable. Does that bear on what ENFORCE can mean at S11?
>
> **(a) Does the availability profile bear on what the S11 ENFORCE flip could honestly claim?**
>
> Yes. It bears directly and the bearing is not captured by the four-part readiness standard.
>
> The standard's part (3) measures a false-hold rate — the rate at which the guard incorrectly holds a kathekon-free action. It presupposes the guard was present. A channel absent for a fifth to a third of the occasions it is asked is not failing its examination. It is not conducting one. The false-hold rate and the presence rate are orthogonal quantities, and a flip that satisfies part (3) while leaving the presence rate unmeasured would be making a claim the evidence does not support.
>
> The Stoic framing is precise here. The guard is the mechanism by which the harness enacts eulabeia — rational caution — at the action boundary. A caution that is structurally absent on 20–60% of occasions is not rational caution. It is intermittent caution, which is a different thing. The S11 flip's claim is that the harness can reliably hold irreversible actions that warrant holding. A channel with the observed availability profile cannot honestly ground that claim, regardless of its false-hold rate when present.
>
> This is not a new gate on the flip. It is a disclosure that the existing gates do not measure this quantity, and that the flip's honest claim must account for it. The four-part standard is not reopened. The observation is that the standard is incomplete with respect to availability, and that incompleteness should be named explicitly before any flip is considered.
>
> **(b) Is reducing the examined input to make the examination complete more often a doctrinal question?**
>
> Yes, and the document frames it correctly. This is not purely an operational election.
>
> The examination the guard conducts is an impression-to-assent sequence — the harness presents the action text to the examination engine, which assesses whether the impression warrants a hold. Reducing the action text sent to the examination engine changes what impression the engine receives. A shorter impression is a different impression. An examination that completes on a truncated impression is not the same examination as one that completes on the full text, and the difference is not merely a fidelity tradeoff. It is a question about whether the examination is examining the thing it claims to examine.
>
> The Stoic parallel is direct. Epictetus's core discipline is the discipline of impression — examining what is actually presented before assenting to it. An examination engine that receives a lean impression and assents or withholds assent is examining the lean impression, not the action. If the lean impression systematically omits the features that would trigger a hold, the examination is not failing to hold — it is failing to see what it would need to see to hold. That is a different failure mode from a false hold, and it is not measured by the false-hold rate.
>
> The ruling on F1 below addresses the remedy. The doctrinal point here is: lean mode is not a fidelity-vs-availability tradeoff in the ordinary engineering sense. It is a tradeoff between examination completeness and examination frequency. Both matter. Neither dominates the other on purely operational grounds. The founder's call on lean mode should be made with that framing explicit, not treated as a latency preference.
>
> **(c) Should the new false-hold observation window measure guard availability as a covariate?**
>
> Yes. Routed to P6 as the document recommends. A window run at a 20–30% outage rate captures whatever succeeded, which is not a random sample of what was attempted. Any rate published from the window without an availability covariate is a rate over a selected sample, and the selection mechanism is correlated with the examination conditions — high-latency periods are both more likely to produce outages and more likely to produce different examination results. The covariate is not optional for honest reporting.
>
> ---
>
> ## Founder open questions — commentary on recommendations
>
> **F1 — Gate-2 remedy.** The recommendation is correct. Raise the budget first, alone, and hold lean mode until Q-G1(b) is answered. The reasoning in the document is sound: raising only the inner budget past the hook timeout converts a logged fail-open into a killed hook, which loses the honest log line. The 30s ceiling is not a platform constraint — another PreToolUse hook in the same file runs at 120s. The fix is raise both together: hook timeout to 60s and GATE1_TIMEOUT_MS to approximately 55000ms.
>
> The doctrinal point from Q-G1(b) reinforces this: lean mode trades examination completeness for examination frequency. Until Q-G1(b) is ruled, lean mode should not be adopted, because adopting it before the ruling would be assenting to a tradeoff whose doctrinal dimension has not been examined. The latency cost of the timeout raise is real and acceptable. The fidelity cost of lean mode is real and not yet assessed.
>
> **F2 — Path A production run.** The recommendation is correct. Nothing blocks it but the founder. The obligation on the SQL — if production returns 24, the ruling's "20 cycle winners" gets a correction note naming the discrepancy — is recorded and should be executed regardless of which number production returns. One addition: the correction note, if owed, should name the source of the discrepancy — the ruling's figure appears to have been a reconstruction that did not account for the five no-winner cycles — so a future reader understands the mechanism, not just the correction.
>
> **F3 — agent_hold_observations sweep.** Hold confirmed, and the reasoning is now firmer than when first recommended. The P6 finding that the live buffer is 138 records against the frozen 130 means the buffer is live evidence in an active measurement arc. A 90-day sweep against that table during an active arc would destroy evidence the arc needs. Do not touch until P6 says the buffer is finished with.
>
> **F4 — stoic-brain.json citations.** Hold confirmed. The byte-identity guard is the right sequencing constraint. The citations are a low-severity internal-corpus defect. Racing a peer over a guarded file for a low-severity fix is the wrong tradeoff. Re-raise once P6 lands.
>
> **F5 — Should the count-discipline become PR26?** The recommendation is correct. One enforced instance is not a pattern needing a rule. The standing cache correctly prefers convention until convention demonstrably slips. The RA-2 closure is a good outcome — the assertion is the right mechanism — but generalising it to a named principle before a second instance appears is premature formalisation. Revisit if a fourth surface drifts.
>
> **F6 — Publication semantics on this checkout.** The recommendation is correct and the reframing matters. The commit is the point of no return. Describing work as "committed but not published" as though that were enforceable has been a recurring framing error. The observation that a peer's push publishes local commits is the mechanism that makes this concrete. Adopt the corrected framing as practice. No rule needed — the understanding is the thing, not the rule.

---

## Executing-session notes (not the mentor's text)

### ⚠ One internal discrepancy, NAMED and not resolved — and deliberately NOT raised as a question

**Q-G1(b) is answered in this same ruling**, in its own section, with extensive reasoning: *"Yes, and
the document frames it correctly… The founder's call on lean mode should be made with that framing
explicit."* **F1 nonetheless says: "Until Q-G1(b) is ruled, lean mode should not be adopted."**

Read literally these collide — F1 treats as pending a question the ruling has just answered.

**Two readings.** (i) Q-G1(b) is ruled; the framing is established and the founder may now make the
lean call *with that framing explicit*; F1's clause is a drafting slip. (ii) Q-G1(b) answered only
the **meta-question put** — *is this doctrinal?* — and the substantive question, *given that it is
doctrinal, should lean mode be adopted?*, was never asked and is not answered.

**Reading (ii) is the more careful one and matches what was actually asked.** The brief's Q-G1(b)
asked whether the tradeoff *has* a doctrinal dimension; it did not ask for a ruling on the tradeoff.

**No question is raised, deliberately, because nothing turns on it now.** Under **both** readings the
action is identical: **raise the budget first and alone; do not adopt lean mode.** F1's primary
recommendation is unambiguous and confirmed correct. Manufacturing a third same-week discrepancy
question where the two readings converge on one action would be pattern-following rather than
examination — the precedent set by the 2026-09-04 gate-permission record, which named a licensing
collision and declined to escalate it on exactly this ground.

**It becomes live the moment the founder wants lean mode.** At that point the narrow question is:
*given that lean mode is ruled doctrinal, does doctrine permit adopting it, and under what
disclosure?* Recorded here so that question is asked rather than assumed.

### What was executed, documents-only, on relay

- This verbatim record (NEW).
- **Path A's owed-list corrected** in
  `2026-09-04-mentor-ruling-path-A-set-size-K-forward-looking-and-run-verbatim.md`: the v3/v4 item
  dropped, **with a note naming its source (the P6 ruling, same day)** exactly as required, so a
  future reader understands why it appeared and why it went.
- **`EXTRACTION.sql`**: the correction obligation now names the **mechanism** of the discrepancy
  (F2's addition) — a reconstruction that did not account for the five no-winner cycles — not only
  the correction.
- **The S11 register gains bound `B4`** (Section B, *"named bounds that must be stated ON the
  enforcement claim at the flip"* — the mentor's own framing, and NOT Section A, since the ruling is
  explicit that this is **not a new gate** and the four-part standard is **not reopened**).
- The Gate-2 diagnosis gains the ruling's findings.

**Nothing else.** No harness config changed; `.claude/settings.local.json` untouched; F1's remedy is
the founder's to apply. No production, migration, credential, flag or spend.

### Routed to P6, not executed here

Q-G1(c) — the availability covariate. The mentor: *"not optional for honest reporting."* The P6 row
already carries three printed bounds; this is a fourth input to that design. **Not written into the
P6 row by this session** — that row is the peer's active work, and its A8/`depth:""`/as-of bounds
came from the P6 ruling itself. Routed, not appropriated.

### Cross-references

`2026-09-05-BRIEF-AND-MENTOR-QUESTIONS-session-outstanding-items.md` (the brief this rules on) ·
`2026-09-04-mentor-ruling-path-A-set-size-K-forward-looking-and-run-verbatim.md` (the owed-list
corrected here) · `2026-09-05-mentor-ruling-P6-window-recommendation-verbatim.md` (the source of both
cross-track conditions) · `operations/harness-2026-09/2026-09-04-gate2-guard-outage-diagnosis.md` ·
`operations/trust-layer-2026-07/S11-FLIP-PREREQUISITES-REGISTER.md` (B4) ·
`harness/gate1-pre-decision/claude-code/hooks/lib/framing-core.mjs:100,147`.

*End of record. Verbatim wins.*
