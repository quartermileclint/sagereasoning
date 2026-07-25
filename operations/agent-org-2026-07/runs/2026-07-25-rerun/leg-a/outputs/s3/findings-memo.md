# Findings memo — what changed since the June 10 inventory, and why it matters

**Prepared by:** Operations support
**Date:** 2026-07-25
**For:** Priya Raghavan, VP Product & Operations
**Companion documents:** `updated-inventory.md`, `recommendations.md`

## Summary

Of the twelve entries in the June 10 inventory, four contained framings that the record now shows were misleading — two of them apparently misleading **at the time they were written**, not merely overtaken by events (Carrier Scorecards v2, Predictive Excursion Alerts). Three more entries have unsettled decisions behind them that the June document presents as settled (Mk II retirement, data retention, SOC 2 outcome). The remainder is ordinary drift: fleet growth, a missed GA date, an outage, and a stalled customer decision. Details below, ordered by severity.

## A. Framings the record makes actively misleading

### 1. Setpoint Guard "prevents unauthorized setpoint changes" — it does not, and a customer lost a load proving it

The June inventory says Setpoint Guard "prevents unauthorized reefer setpoint changes from turning into losses" and that "the change is caught and the shipper is protected." On June 16, a Vantry driver changed a setpoint from -20°C to -4°C; Setpoint Guard detected it and paged ops ~40 minutes later — inside its design window — but the frozen seafood load partially thawed before intervention. Claim estimate ~$18k. The post-incident review is unambiguous: **the tool watches and reports; it does not stop or reverse a setpoint change, and nothing in the product does.**

Why it matters: this language is in a document that has been forwarded to prospects, and the same "prevents" claim sits in the sales one-pager. That is a liability exposure, not just a stale fact — a customer who bought "prevention" and suffered a loss has a written company document to point at. The one-pager fix was assigned to Ingrid with marketing and, per a mid-July note, was still open. Confidence: high on the incident and the product's actual behavior (explicit post-incident review); moderate on whether the one-pager is still uncorrected today (the log's last word is "still open as of mid-July as far as I know").

### 2. PEA "is production-ready now... customers will see predictive alerts over the coming weeks" — no production customer has it, and no date exists

The June 10 inventory describes PEA as "complete, integrated, and running against production-scale data" with customer rollout "completing" over the coming weeks. The log shows code complete and deployed **June 12 — two days after the inventory was written** — behind a per-tenant flag that is OFF for every production tenant, and remains off today. Six weeks later, the staging soak has just been written up (78% of slow-drift excursions flagged 30+ minutes early; ~1 false alert per tenant per day — a rate ops accepts and sales does not), and production enablement is explicitly your call, deferred until after Hartwell.

Why it matters: PEA was "the headline of our 2026 roadmap." Anyone selling off the June document has been promising customers visible predictive alerts "in the coming weeks" since mid-June. Every week that passes makes that promise more damaging. Confidence: high — the flag state is confirmed twice in the log, including a same-week correction (July 5) of an erroneous "enabled for all tenants" post (July 3) that turned out to be staging only.

### 3. Carrier Scorecards v2 "live in production across the customer base" — it was never live beyond a 3-tenant pilot, and it shipped wrong numbers

The June inventory says v2 "shipped this spring and is live in production across the customer base." The log shows the **first** production enablement was June 20, for three pilot tenants only — ten days *after* the inventory claimed it was live everywhere — followed by a June 24 rollback of all three because the multi-stop lane model double-counts lanes, inflating on-time and temperature-integrity scores. Pilot tenants saw inflated numbers for about four days. The fix merged July 18; the re-pilot is unscheduled, gated on a backfill re-run.

Why it matters twice over: first, the June claim appears to have been untrue when written (the log's "enabled for the pilot group... everyone else stays on v1" phrasing is consistent only with v2 not having been broadly live before June 20 — inferred, but strongly supported). Second, the failure mode was **inflated performance metrics shown to customers** — the exact kind of number that ends up in a shipper's carrier negotiations. Bellgrave is already asking when v2 comes back.

### 4. SOC 2 "we expect a clean report in July" — the report is issued and unqualified, but carries two exceptions, and "clean" is now a word to ban

The final Type II report was issued July 15: unqualified opinion, fieldwork March 1 – June 6, two exceptions in the text (contractor access retained >30 days past offboarding; no automated TLS-cert expiry monitoring — the control gap behind the June 28 outage). Remediation plan due to Sentia September 15.

Why it matters: this is genuinely good news being one careless adjective away from a credibility problem. The June framing primed everyone to say "clean report." Pharma prospects — the segment this unlocks — will read the actual report, see the exceptions, and judge us on whether our sales language matched it. The log itself flags this: "'SOC 2 Type II report issued' is right; 'passed clean' is not." Confidence: high.

## B. Settled-sounding claims that are actually open decisions

### 5. Mk II retirement "October 31... on track" — leadership is leaning toward moving it to Q1 2027

June 18 confirmed October 31 with customer comms starting August 1. On July 20, Ingrid escalated: Ashwood has ~1,900 Mk II units and cannot swap before its winter produce contracts; leadership is leaning toward extending support through Q1 2027. Nothing is decided or announced; October 31 is still the last announced position. The August 1 comms start is now **seven days away** with the date in doubt. Confidence: high on the state of play; the outcome is genuinely open.

### 6. Data retention "24 months, standard on every plan... a recurring closer" — the product council has approved cutting it to 12

The platform still delivers 24 months, and until an effective date is set and announced, that remains what we sell. But an approved decision to halve the headline differentiator exists, with contracts review pending (Bellgrave and Hartwell have 24 months in their MSAs at minimum). Continuing to close deals on a 24-month promise the company has already voted to withdraw is a decision someone senior should make deliberately, not a default. Confidence: high on the approval (explicit log entry, though undated); unknown on timing.

### 7. Hartwell "ahead of expectations... we anticipate fleet-wide expansion this summer" — the decision has now slipped twice and is not made

The pilot results are real and strong (11-minute median detection vs. their prior 43; zero missed excursions). But the go/no-go moved from July 10 to July 24, and on July 22 moved again to "first week of August" per their procurement. The log explicitly warns against telling sales or the board this is done. Two consecutive postponements by the customer's side is a neutral-to-soft signal; the June framing ("anticipate... this summer") reads as a foregone conclusion. Confidence: high on the facts; the postponements' meaning is inference — could be routine procurement, could be cooling.

## C. Ordinary drift

- **Fleet growth:** ~46,500 sensors / 64 fleets as of July 1 (June doc: 40,200 / 61).
- **June 28 ingest outage:** 3h01m, expired TLS cert. No data lost (buffering/backfill worked as designed — a genuine validation of that claim), but dashboards and alerting were blind for the window. June availability 99.6% vs. the 99.9% internal target; the 99.95% TTM figure in the June doc predates the outage and shouldn't be quoted without recomputation. Cert automation deployed July 2; the failover drill is open with **no owner**.
- **Export API v2:** merged July 9 vs. the "late June GA" target. Docs unpublished, no GA declaration, and a sales question about customer use (for a Hartwell data request) went unanswered on July 17. Its customer-facing status is the one item careful reading of the log **cannot** resolve — "merged... out the door" is not the same as generally available.
- **Live Trip Dashboard:** open Bellgrave latency ticket (trip-history p95 4.8s vs 2s target); undated, marked not urgent.

## D. Log conflicts — resolved and unresolved

Resolved by careful reading:

- **PEA "ON for all tenants" (July 3)** — corrected July 5: staging only; production flags off. The correction is explicit and self-explanatory; I treated it as authoritative.
- **SOC 2 fieldwork end date** — June 30 note says June 9; July 8 note and the final report's cover page say June 6. I used June 6, since the issued report is the authoritative artifact. (Note the June 10 inventory said fieldwork "concludes this month" when it had already closed on June 6 — Dana's information was stale on this point when she wrote it.)
- **Undated Tomás note (duplicated lanes)** — placeable between June 20 and June 24 by content; consistent with the rollback narrative.

Not resolvable from the record:

- **Export API v2 GA status and whether customers may use it** (see above). Needs an owner's answer, not interpretation.
- **Whether the Setpoint Guard one-pager has been corrected.** Last word is secondhand ("still open as of mid-July as far as I know").
- **Retention change effective date** — explicitly TBD pending contracts review.
- **Current trailing-12-month ingest availability** — not recomputed anywhere in the log post-outage.
- **The undated retention and latency notes' exact timing** — content makes their substance clear, but their recency can't be established; both are treated as still-current because nothing later contradicts them.
