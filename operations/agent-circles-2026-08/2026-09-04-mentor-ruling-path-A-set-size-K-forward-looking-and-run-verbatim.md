# Mentor ruling — Path A: the set size, K, the forward-looking change, and whether to run (verbatim)

**Relayed by the founder 2026-09-04**, in response to
`2026-09-04-MENTOR-QUESTION-path-A-set-size-K-and-whether-to-run.md`.

**Status: ADOPTED AS BINDING on relay, per project convention. This verbatim record wins over every
summary of it** — including the decision-log entry, the annotations on the question document, the
Option S artifact's own limit text, and any successor prompt.

**Recording entry:** `D-MENTOR-RULING-PATH-A-SET-SIZE-K-FORWARD-LOOKING-RUN-2026-09-04`.

**Headlines (the verbatim governs).** All eight mechanism facts accepted. **Q-S1: the PRODUCTION
COUNT GOVERNS** — the S6 report is the primary record; the ruling's "20 cycle winners" *"was not
derived from the S6 report; it appears to have been a reconstruction that did not account for the
five no-winner cycles"*; if production returns 24, correct the figure **with a note naming the
discrepancy**, and **do not adopt an alternative definition of decision-bearing without a separate
ruling**. **Q-S2: K=10** — a **measurement design parameter, the session's to elect**, not a
floor-semantics election; the three candidate rates (2.8% / ~10% / ~27%) *"are not distinguishable at
K=3 resolution"*. **Q-S3: the forward-looking change is WITHIN Path A's terms** — the comparison
*"was never required by the ruling — it was an assumption the prior design carried"* — and the
ruling **explicitly declines to discount it for having been proposed by the session it repairs**.
**Q-S4: the run is worth its purpose and PRECEDES the election** — *"a rate of 4% versus 15% ...
would change the M/W/S ruling"*; localising the mechanism *"does not tell you how often that variance
fires across the decision-bearing population."*

**⚠ ONE OWED ITEM IS NOT ADOPTED AND IS PUT BACK AS A QUESTION — see the executing notes.** The
ruling's "owed before the run" list includes *"The v3/v4 lift check must run before any figure is
published — the round-trip is proven on 130 v1 records, not v3/v4 records."* Verified at source, that
condition belongs to the **false-hold capture track**, not to Option S. It is **named, not absorbed.**

---

## The ruling, verbatim

> ## On the mechanism facts
>
> All eight mechanism facts are accepted as stated. M1 and M2 name a genuine conflict between two documents. M3 and M4 establish what the c11 experiment already produced and what it localised. M5 is the most consequential: the examination engine changed after the run closed, and the c11 record names this honestly in its own §5(a). M6 gives the measured cost. M7 reproduces D6a's interval independently. M8 names a schema fact that would have silently corrupted the run — the CHECK admits `winner`, not `selected` — and the document is right to name it as the same class as M1: a checkable fact nobody had checked.
>
> ---
>
> ## Q-S1 — The decision-bearing set is 24 or 29. Which governs?
>
> The production count governs.
>
> The S6 report's own outcome table is the primary record — it is the document that recorded what the run produced, cycle by cycle, with named outcomes. It says 15 winners. The ruling's figure of 20 was not derived from the S6 report; it appears to have been a reconstruction that did not account for the five no-winner cycles. The conflict is real and the ruling's cost estimate rides it.
>
> The document is right not to resolve this by argument. EXTRACTION.sql §0/§PRE is the correct instrument. Whatever production returns is the authoritative set. If production returns 24, the ruling's "20 cycle winners" is a figure worth correcting in the record — not quietly overwritten, but corrected with a note that names the discrepancy and its source.
>
> On the alternative definition: "decision-bearing" could in principle include the five no-winner cycles' best candidates, or `not_selected` rows. The ruling did not define it that way. The ruling's own language was "20 cycle winners plus the 9 guardrail rejections" — winners, not candidates. If production returns 15 winners, the set is 24 under the ruling's own definition. The alternative definition is not adopted here. If the founder has reason to believe the ruling intended a broader definition, that is worth surfacing before the run, not after.
>
> **Q-S1 ruling: The production count governs. Run EXTRACTION.sql against production. Carry the result as the authoritative set. If production returns 24, correct the ruling's "20 cycle winners" figure in the record with a note naming the discrepancy. Do not adopt an alternative definition of decision-bearing without a separate ruling.**
>
> ---
>
> ## Q-S2 — What K should the measurement use?
>
> K=10. The document's recommendation is correct and the reasoning holds.
>
> K=3 was ruled as the operating parameter of median-of-3 for the standing runner. It was never ruled as the measurement K for Option S. The silent inheritance of K=3 as the measurement K was a design assumption, not a ruling.
>
> At K=3 a per-input floor estimate takes values in {0, ⅓, ⅔, 1} only — four points on the unit interval. That resolution is insufficient for the M/W/S election, which turns on whether the floor rate is near 2.8%, near 10%, or near 27%. Those three values are not distinguishable at K=3 resolution.
>
> K=10 is D6a-comparable, gives a usable per-input p̂, and the cost argument for K=3 has collapsed now the per-call figure is measured at $0.014222. The difference between K=3 and K=10 across 24–29 candidates is approximately $3. An underpowered result that cannot discriminate between the three M/W/S candidate rates is the more expensive outcome.
>
> On whether K is the session's to elect or belongs with the deferred items: K is a measurement design parameter, not a floor-semantics election. It determines the resolution of the evidence the M/W/S election reasons from, not the election itself. It is the session's to elect as measurement design. The M/W/S election remains deferred.
>
> **Q-S2 ruling: K=10. This is a measurement design parameter, not a floor-semantics election. The M/W/S election remains deferred.**
>
> ---
>
> ## Q-S3 — Is the forward-looking design change within Path A's terms?
>
> Yes. The forward-looking design change is within Path A's terms, and the document's reasoning for it is sound.
>
> The ruling's own Q2 language named what the existing measurement lacks: "the live decision-bearing rate — the rate on real candidate texts produced by the loop in operation, not on frozen synthetic probes or a single repeated candidate." Real candidate texts examined on the engine any M or W policy would actually operate is that object. The comparison to recorded verdicts was never required by the ruling — it was an assumption the prior design carried.
>
> The two limits the change dissolves — the unverified payload assumption and the engine change at M5 — are genuine limits on what a comparison would measure. A comparison across an unverified payload and a changed engine measures little. The document is right to dissolve it.
>
> The document's counter-case is stated honestly: the change was proposed by the session whose earlier design it repairs, and it dissolves two limits that were embarrassing to that design. The defence — that the ruling's own Q2 language supports it independently of who proposed it — is the right defence, and it holds. The observation history has been tracking the founder's capacity to argue against institutional interest when the reasoning requires it. This document does that. The ruling does not discount the recommendation on the basis of who proposed it.
>
> What the change does not fix is stated correctly and must be carried explicitly: the set-size question, no counterfactual re-election, variance is multi-channel so a floor count does not identify which floor fired, and the sample remains unrepresentative of a future candidate stream. The rejection stratum is enriched for floor-prone texts — the right population for the floor-borderline question and the wrong one for a general rate. These limits ride the data when it is used for the M/W/S election.
>
> **Q-S3 ruling: The forward-looking design change is within Path A's terms. Recorded_proximity is retained as inert provenance. The limits named in the document ride the data explicitly when used for the M/W/S election.**
>
> ---
>
> ## Q-S4 — Is the run still worth its purpose, and should it wait on the M/W/S election?
>
> The run is worth its purpose. It should not wait on the M/W/S election — the run precedes the election and serves it.
>
> The document's counter-case — that if the mechanism is known and the direction is known, a prevalence figure may change no decision — is the honest test, and the document applies it correctly. The honest answer is: a rate of 4% versus 15% across the decision-bearing population on real texts would change the M/W/S ruling. The three candidate rates — 2.8% under M, approximately 10% under the locked basis, approximately 27% under W — are not close enough that a measured rate in the 4–15% range would be uninformative. The election turns on which of those three the live population resembles. That is exactly what the run measures.
>
> The mechanism being localised (M4) does not make the prevalence figure uninteresting. Knowing that Layer 1 extraction variance drives the floor rate does not tell you how often that variance fires across the decision-bearing population. The c11 experiment gives one input's rate at K=10. D6a gives a rate on synthetic probes. Neither gives the prevalence across the real candidate population. Path A gives that.
>
> On sequencing: the run precedes the election. The election reasons from the data. The data does not exist until the run completes. The sequencing is correct as the ruling established it.
>
> The document's recommendation — rule Q-S1 through Q-S3 together with a statement of what the M/W/S election needs from this data — is adopted. That statement is: the election needs a per-input floor rate across the decision-bearing population on real candidate texts, at K=10, with the limits named in Q-S3 carried explicitly, and with the A8 bound printed on the rate (no re-examination counter exists; the escalation row cannot fire). That is what the run produces. That is what the election reasons from.
>
> **Q-S4 ruling: The run is worth its purpose. It precedes the M/W/S election and serves it. The election needs a per-input floor rate across the decision-bearing population at K=10, with Q-S3's limits and the A8 bound carried explicitly.**
>
> ---
>
> ## What this ruling does and does not license
>
> **Ruled:** Production count governs Q-S1; run EXTRACTION.sql and carry the result. K=10 for the measurement. The forward-looking design change is within Path A's terms. The run precedes and serves the M/W/S election. The election needs the specific evidence the run produces, with named limits.
>
> **Not licensed:** Any build, spend, activation, or publication. Option S is built and unpopulated; no live call has been made. The M/W/S election and R8-D7's sampling policy remain deferred. Weights remain BLOCKED. GS-CYB-1's two conditions are untouched. The Q1 hard constraint holds. The run is a founder-walked act; nothing here initiates it.
>
> **Owed before the run:** EXTRACTION.sql run against production to establish the authoritative set. If production returns 24, the ruling's figure is corrected in the record with a note. The v3/v4 lift check must run before any figure is published — the round-trip is proven on 130 v1 records, not v3/v4 records.
>
> **Owed before the M/W/S election:** The limits ride the data explicitly — unrepresentative sample (rejection stratum enriched), multi-channel variance (floor count does not identify which floor fired), A8 bound (escalation row cannot fire), forward-looking engine (speaks for today's instrument, not August's).

---

## Executing-session notes (not the mentor's text)

### What was executed, documents-only, on relay

- This verbatim record (NEW).
- The question document: a dated **RULED** banner carrying all four answers, the questions left
  legible beside them (the Gate-3 precedent).
- **The Option S instrument folded to the ruling:** K set to **10** (was deliberately unset);
  the four Q-S3 limits and the **A8 bound** now ride every summary output; the Q-S1 correction
  obligation recorded on the extraction SQL.
- `operations/decision-log.md`; the next-session prompt's election block.

**Nothing else.** No production read, no extraction run, no credential, no spend, no live call.
`runs/` is empty. The run remains a founder-walked act.

### The A8 bound — ACCEPTED, and verified at source rather than absorbed

The ruling requires *"the A8 bound printed on the rate (no re-examination counter exists; the
escalation row cannot fire)."* **This claim is TRUE and is now carried.** Verified 2026-09-04:
`intervention-engine.ts` accepts `habitualReExaminationCount?: number` **defaulting to 0** (`:185-190`),
and **no live caller supplies it** — `harness-integration.ts` calls
`recordOrchestratorHabitualDecision` (the A8 *event emitter*), not `applyHabitualPauseBound`. With the
count permanently 0, `habitualStable` / `reflectReferral` cannot become true. The escalation row is
structurally inert, exactly as stated.

### ⚠ The v3/v4 lift check — NAMED, NOT ABSORBED, and put back as a question

The ruling's "owed before the run" list includes: *"The v3/v4 lift check must run before any figure
is published — the round-trip is proven on 130 v1 records, not v3/v4 records."*

**Verified at source, this condition belongs to a different track.** `false-hold-record-v3` and
`false-hold-record-v4` are **false-hold capture record schemas** in the harness
(`harness/gate1-pre-decision/claude-code/hooks/lib/false-hold-capture.mjs:107,166`; v4 is the guard
record, v3 the consult record, per `test/negative-battery.mjs:398`). The "130 v1 records" is the
**frozen false-hold observation buffer** (2026-07-12→17), whose report carries the `--rescore`
round-trip.

**Option S has no v3/v4 records, no round-trip, and no relationship to the false-hold capture
schema.** It submits candidate texts to `/api/guardrail` and records gate responses. There is no
check by that name it could run, and no figure of its own the check could gate.

**The most likely reading is a cross-track import:** a peer session is, at the time of relay,
actively working the false-hold window and P6 (a 2026-09-05 mentor ruling, a `FREEZE-NOTE`, and the
S11 register are live in the working tree). That is plausibly where this condition belongs.

**Disposition, per the standing discipline that a premise behind the record is named rather than
absorbed:** it is **not** applied as a gate on Option S, because Option S cannot satisfy or even
interpret it, and applying it would block the run on an uninterpretable condition. It is **not**
discharged either. It is recorded here and put back to the mentor as a question:

> **Q-V1 — does the v3/v4 lift check bind Option S, or the false-hold track?** If it binds Option S,
> what is the round-trip it names, given Option S has no versioned record schema? If it binds the
> false-hold track, it should be routed to the session working P6 rather than carried here. The
> executing session did not resolve this and did not treat the run as gated on it.

### Cross-references

`2026-09-04-MENTOR-QUESTION-path-A-set-size-K-and-whether-to-run.md` (the question this rules on) ·
`2026-09-04-mentor-ruling-standing-runner-gate-item-level-session-may-open-verbatim.md` (Path A; the
closed-run-population limit) · `2026-08-30-standing-runner-design-R8.md` §5.3 (Option S; M/W/S) ·
`2026-08-16-idea-loop-S6-report.md` §2 (the 15-winner outcome table) ·
`2026-08-30-c11-rerun-experiment-record.md` (K=10; the localized mechanism; the measured cost) ·
`option-s/` (the instrument) · `website/src/lib/substrate/trust-core/intervention-engine.ts` (A8).

*End of record. Verbatim wins.*
