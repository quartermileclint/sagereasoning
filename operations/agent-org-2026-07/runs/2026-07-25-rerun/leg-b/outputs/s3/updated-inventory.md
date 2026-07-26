# Coldspur Relay — Platform Capability Inventory

**Prepared by:** Operations support (refresh of Dana Okafor's 2026-06-10 inventory)
**Date:** 2026-07-26
**Supersedes:** the 2026-06-10 inventory, which should no longer be forwarded
**Audience:** Internal — sales engineering, customer success, exec staff
**Purpose:** Single reference for what the Relay platform does today.

> **Two things to read before using this document.**
>
> **Internal only.** The June version carried "share freely inside the company" and was
> nonetheless forwarded to prospects. Nothing here is approved customer-facing language.
> Where wording matters to a customer or prospect, see the recommendation set.
>
> **Evidence horizon: 2026-07-22.** This refresh is built from the running status log, whose
> last dated entry is July 22. Where this document says "today" or "current," it means
> *as of the record through July 22*. Four days are unaccounted for, and several items below
> were moving when the record ends.

Coldspur Relay is a cold-chain telemetry and compliance platform for refrigerated freight:
sensors and gateways in the trailer, a real-time ingestion and alerting backbone, and a
reporting layer that shippers and carriers use to keep product inside its temperature envelope
from dock to dock.

The June inventory opened and closed with competitive superlatives — most freight monitored in
the mid-market, "the most dependable ingest pipeline in mid-market cold chain, full stop,"
"nobody in our segment matches this platform's depth." **Nothing in the operating record
supports or refutes those claims**, and they are not repeated here. That is not a judgement
that they are false; it is that an internal capability inventory should not be where
unsourced competitive claims enter circulation, particularly one that reaches prospects.

---

## Status at a glance

*(Not in the June document — added because the single most damaging error in that version was a
reader assuming "in the inventory" meant "available to customers.")*

| # | Capability | Available to customers today? |
|---|---|---|
| 1 | Telemetry ingestion & sensor fleet | Yes — availability figures restated below |
| 2 | Live Trip Dashboard | Yes — one open performance issue |
| 3 | Excursion Alerting (v1) | Yes |
| 4 | Setpoint Guard | Yes — **detects and alerts; does not prevent** |
| 5 | Predictive Excursion Alerts (PEA) | **No — zero production tenants, no date** |
| 6 | Carrier Scorecards v2 | **No — zero tenants; everyone on v1** |
| 7 | Data Export API v2 | **Unconfirmed — merged, not shown to be released** |
| 8 | Compliance report pack | Yes |
| 9 | Security & audit posture | SOC 2 Type II issued, unqualified, **two exceptions** |
| 10 | Gateway hardware | Yes — Mk II retirement date now unsettled |
| 11 | Data retention | Yes, 24 months — **approved for reduction, date TBD** |
| 12 | Customer momentum | Hartwell expansion **undecided** |

---

## 1. Telemetry ingestion & sensor fleet

Approximately **46,500 active sensor units across 64 customer fleets** as of 2026-07-01, up from
40,200 units and 61 fleets at the June inventory. Reporting through Mk II and Mk III trailer
gateways into the multi-region MQTT ingestion tier.

**Reading volume:** the last figure in the record is May's 1.1 billion readings. It has not been
refreshed. Quote it as a May number or not at all — with the fleet up roughly 16% since, it
understates current volume by an unknown margin.

**Availability — the June figures no longer stand.** On 2026-06-28 an expired TLS certificate on
the MQTT broker cluster caused a **3h01m ingest outage (14:02–17:03 UTC)**. June ingest
availability landed at **99.6% against a 99.9% internal target**. The June inventory's 99.95%
trailing-12-month figure predates that outage and has not been restated by anyone; **do not
quote 99.95%**. A three-hour outage consumes roughly 0.03 percentage points of a
365-day window, so the true trailing figure is likely near 99.92% — that is arithmetic on my
part, not a platform-team number, and the real figure should come from them before it is used
anywhere.

**Buffering and backfill worked, and that claim survives intact.** During the outage, readings
buffered on the gateways and backfilled after restore. No data was lost. **But "no data lost"
is not "no customer impact":** live dashboards and alerting were blind for the full three hours.
The June sentence "customers do not lose data to dead zones" is true and defensible for
connectivity dead zones; it should not be stretched to cover a platform-side outage.

**Postmortem status:** certificate issuance automation was completed and deployed 2026-07-02.
The broker failover drill was still open with **no owner assigned** as of that date, and no later
entry closes it.

## 2. Live Trip Dashboard

Real-time trip view: position, temperature traces per zone, door events, humidity where
equipped, and ETA against the delivery window. Generally available since 2024. Bellgrave Grocers
and Ashwood Produce Co-op run their daily ops standups off it (carried from the June inventory;
nothing in the record contradicts it).

**Open issue:** Bellgrave has an unresolved performance ticket on the trip-history view —
**p95 latency of 4.8 seconds against a 2-second target**. The entry is undated and cannot be
placed on the timeline; it is characterised internally as "not great, not urgent." It is open as
of the record. Worth knowing before walking into a Bellgrave conversation, given they are also
the tenant still waiting on Scorecards v2 (§6).

The dashboard was among the surfaces blind during the June 28 outage.

## 3. Excursion Alerting (v1)

Threshold-based alerting with configurable bands per commodity profile (frozen, chilled, produce,
pharma), delivered by SMS, email, and webhook. **Median alert latency under 60 seconds** from a
breach reading hitting ingest — carried from the June inventory; nothing in the record refreshes
or contradicts it. Roughly 9,000 alerts delivered in May; that figure has not been updated.

This remains the workhorse of the platform and the only production alerting path. Note that it
was down for the 3h01m of the June 28 outage — alerting has a demonstrated dependency on the
ingest tier, with no independent fallback described anywhere in the record.

## 4. Setpoint Guard

**This section is a correction, not an update. The June description was wrong about what the
product does.**

Setpoint Guard **monitors reefer setpoint changes and alerts operations when a setpoint moves
outside the commodity profile.** It does not block, prevent, or reverse a setpoint change.
Nothing in the product does. This is the explicit finding of the post-incident review described
below, and it is the opposite of what the June inventory said ("prevents unauthorized reefer
setpoint changes," "the change is caught and the shipper is protected").

**The incident that established this.** On 2026-06-16, a driver on Vantry Logistics trip
**VTR-8841** changed the reefer setpoint from -20°C to -4°C, outside the commodity profile.
Setpoint Guard detected the change and paged operations **40 minutes later** — which the
post-incident review found to be **inside the tool's design window**. By the time the carrier
reached the driver, the frozen seafood load had partially thawed. **Claim estimate ~$18,000.**

Two things follow that sales engineering needs to hold onto:

- **The tool performed as built.** This was not a failure of Setpoint Guard. It was a failure of
  the description of Setpoint Guard.
- **Its detection latency is not the sub-60-second latency of Excursion Alerting (§3).** The
  record establishes that the design window permits at least 40 minutes. The actual specification
  is not stated anywhere in the record — get it from product engineering before quoting any
  number.

**Coverage:** live on Vantry Logistics-hauled lanes since March. Carried from the June inventory
and partly corroborated — the tool did fire on a Vantry trip in June.

**Collateral status — open.** The post-incident review directed that the "prevents unauthorized
setpoint changes" line be removed from the sales one-pager. Ingrid owns the wording fix with
marketing. It was **still open as of mid-July** per the record, and no later entry closes it.
Assume the incorrect one-pager is still in circulation until someone confirms otherwise.

## 5. Predictive Excursion Alerts (PEA)

**Status: not available to any customer. There is no rollout date.**

PEA learns each trailer's thermal behaviour and flags slow drift toward a breach before the
threshold trips. The **code is complete and has been deployed to production since 2026-06-12**,
behind a per-tenant flag (`pea_enabled`) that is **OFF for every production tenant**. No customer
has ever seen a predictive alert.

**A correction you need to be aware of.** A July 3 status entry announced "PEA is ON for all
tenants." That was retracted on July 5 by its own author: the enablement was in the **staging**
environment only, the production flag remained off for every tenant, and nothing customer-facing
changed. Because the status log is not in chronological order, **it is entirely possible to read
the July 3 announcement without ever seeing the July 5 correction.** If anyone told a customer or
a prospect in early July that predictive alerts were live, that needs to be walked back.

**Staging soak results (written up 2026-07-19, details in the data review deck):**

- 78% of slow-drift excursions flagged 30+ minutes before threshold breach
- False-alert volume roughly **one per tenant per day** at pilot fleet sizes

These are real results against synthetic and replayed production-scale trips, and they are
genuinely encouraging on the detection side. They are **not** an internal consensus: operations
considers the false-alert rate livable, sales considers it high. That disagreement is unresolved.

**Enablement is Priya's decision**, and she has deliberately deferred it until after the Hartwell
go/no-go (§12) — which has now slipped twice and sits at "first week of August." **PEA therefore
has no date because the event gating it has no date.** The June framing — "production-ready now,"
"customers will see predictive alerts appearing in their dashboards over the coming weeks" —
should not be repeated in any form.

## 6. Carrier Scorecards v2

**Status: not live for any tenant. Every tenant is on v1.**

v2 rebuilds carrier and lane rollups on the multi-stop lane model: on-time percentage,
temperature-integrity score, and claim rate by carrier, lane, and commodity.

**What actually happened.** v2 was enabled on 2026-06-20 for a **three-tenant pilot group**
(Bellgrave Grocers, Ashwood Produce Co-op, Vantry Logistics) — never "across the customer base,"
which the June inventory claimed and which was not true even at v2's widest reach. All three
pilot tenants reported duplicated lanes in the carrier rollups with inflated on-time percentages.
**v2 was rolled back for all three on 2026-06-24.** Root cause: the multi-stop lane model
double-counts lanes on trips with more than one delivery stop, inflating both on-time and
temperature-integrity numbers. **v1 was never affected** and was re-enabled everywhere.

**Where it stands.** The lane-dedup fix (**RLY-2214**) was merged 2026-07-18. The re-pilot is
**explicitly not scheduled** — it requires a June/July rollup backfill re-run first, and the
record does not show that re-run as done. Bellgrave has asked when they get v2 back and was told
"when it's right."

**Data caution.** Any v2-derived carrier or lane figure generated during the June 20–24 pilot
window is inflated. Do not rely on it, re-send it, or use it in a QBR. Whether any such numbers
reached the three pilot tenants is not answered by the record — see the recommendation set.

## 7. Data Export API v2

**Status: unconfirmed. Do not promise it to a customer.**

The rework covers bulk historical export, cursor pagination, per-tenant keys, and parity between
dashboard and exported numbers (the v1 gap that cost credibility in two renewals).

The June inventory said general availability was on track for late June. That did not happen.
The code was **merged after final review on 2026-07-09**, and **documentation was still
outstanding** at that point. The record contains no GA announcement, no release note, and no
confirmation that any customer can call the endpoint.

**An open question the record never answers:** on 2026-07-17 sales asked whether a customer could
begin pulling from Export API v2 to service a **Hartwell** data request. No answer appears
anywhere in the log. Given that Hartwell is mid-decision on a 2,400-trailer expansion (§12), this
is the highest-value unanswered question in the record.

Treat customer access as unconfirmed until product engineering states otherwise. "Merged" is not
"released."

## 8. Compliance report pack

One-click trip records built for FSMA Sanitary Transportation requirements: continuous
temperature record, alert history, and corrective-action log per trip, exportable as PDF or CSV.
Used successfully in two customer audits this spring without a finding against the record itself.

**No change recorded since June 10.** Carried forward as written; the status log contains nothing
that bears on it either way.

## 9. Security & audit posture

**The SOC 2 Type II report has been issued. It is not a clean report.**

Sentia Assurance issued the final SOC 2 Type II report on **2026-07-15**. The **opinion is
unqualified**. The fieldwork period on the cover page reads **March 1 – June 6, 2026**.

**Two exceptions appear in the final text:**

1. Two departed-contractor accounts retained system access **more than 30 days past
   offboarding**.
2. **No automated expiry monitoring on broker TLS certificates** at the time of the June
   incident — i.e. the same control gap that produced the June 28 outage (§1).

Coldspur's **remediation plan is due to Sentia by 2026-09-15.** Certificate issuance automation
was deployed July 2 and addresses the underlying cause of exception 2, though the broker failover
drill from the same postmortem remains open and unowned. **The record shows no remediation
activity for exception 1** (the offboarding access gap).

**Language matters here more than anywhere else in this document.** The record is explicit:
*"SOC 2 Type II report issued" is right; "passed clean" is not — prospects will read the
exceptions.* The June inventory's "we expect a clean report in July" is now a live liability,
because SOC 2 was named by pharma prospects as their last gating requirement — and one of the two
exceptions is an access-control finding, which is exactly what a pharma security reviewer reads
first. Get ahead of it rather than being asked about it.

**A date discrepancy, resolved.** A June 30 internal note recorded fieldwork as wrapping June 9.
The auditor's draft and the issued final report both give **June 6**, and the issued report's
cover page is authoritative. Related and worth noticing: the June 10 inventory said fieldwork
"concludes this month" when it had in fact closed four days before that document was written.

## 10. Gateway hardware

Mk III gateways have shipped since January: LTE-M with satellite fallback, twice the buffer
memory, field-swappable in under ten minutes. Unchanged.

**Mk II retirement — the October 31 date is now unsettled.**

- **The last announced position is still October 31**, confirmed 2026-06-18, with customer
  communications scheduled to begin **August 1** and the migration playbook held by customer
  success. Nothing has replaced it.
- **But on 2026-07-20, Ingrid escalated.** Ashwood Produce Co-op alone has **~1,900 Mk II units**
  in the field and says there is no way it swaps hardware before its winter produce contracts.
  **Leadership is leaning toward extending Mk II support through Q1 2027.**
- **Nothing has been formally decided or announced.**

The June inventory's "migration program is on track" no longer describes the situation. The
practical problem is a calendar one: **customer comms are scheduled to start August 1 — within
days — announcing a date leadership may be about to change.** See the recommendation set; this
needs a decision before the comms go out, not after.

## 11. Data retention

**Today: 24 months of full-resolution telemetry, standard on every plan.** That is still what the
platform does and still what we sell. Nothing has changed for any customer.

**Pending:** product council has **approved shortening full-resolution retention from 24 months
to 12** to cut storage spend. The **effective date is TBD.** The contracts team is checking which
MSAs commit to 24 months — **Bellgrave's and Hartwell's do at minimum, possibly others.** This
entry is undated in the record and cannot be placed on the timeline, so I cannot say how far
along that contract review is.

Until it clears and someone announces it, 24 months stands. The June inventory called it "twice
the horizon offered anywhere else in the segment, and a recurring closer in competitive deals" —
accurate as a statement of the current product, but it is now a differentiator with an approved
expiry and no announced date, which is a bad thing to build a new multi-year deal on. See the
recommendation set.

## 12. Customer momentum

**The Hartwell Pharma pilot succeeded. The expansion has not been decided.**

**Pilot readout (2026-06-26; 120 trailers, 90 days) — solid and quotable:**

- Median excursion detection **11 minutes**, against the **43 minutes** their previous system
  averaged
- **Zero missed excursions** in the pilot window

A fleet-wide proposal covering **2,400 trailers** was drafted for their VP Quality.

**The decision has slipped twice.** The go/no-go was postponed to July 24 (per 2026-07-10), then
moved again to **"first week of August"** per Hartwell procurement (per 2026-07-22).

**No decision has been made on the expansion.** The record carries an explicit instruction on
this point: do not let anyone tell sales or the board that it is done. The June inventory's "we
anticipate fleet-wide expansion this summer" and "it will be the largest single deployment in
company history" should be dropped entirely until Hartwell says yes — not softened, dropped.
Note also that Hartwell is one of the two named accounts whose MSA commits to 24-month
retention (§11), and is the account behind the unanswered Export API v2 question (§7).

---

## Appendix — what this refresh could not resolve

*(Not in the June document. These are the questions a careful reading of the record cannot
settle. Each one is a place where someone must go and find out rather than infer.)*

1. **Current trailing-12-month ingest availability.** The 99.95% figure is stale; the true number
   needs the platform team's calculation, not mine.
2. **Setpoint Guard's actual design window.** The record proves it admits at least 40 minutes and
   never states the specification.
3. **Whether the Setpoint Guard one-pager has been corrected.** Last known state: open, mid-July.
4. **Whether Export API v2 is callable by customers**, and the status of its documentation.
5. **Whether inflated Scorecards v2 numbers reached the three pilot tenants** during June 20–24,
   and whether the June/July rollup backfill has been re-run.
6. **The Mk II retirement decision**, and whether the August 1 comms are still going out.
7. **The retention change's effective date**, and the full list of MSAs committing to 24 months
   beyond Bellgrave and Hartwell.
8. **Remediation status for SOC 2 exception 1** (contractor offboarding access) and the owner of
   the broker failover drill, unassigned as of July 2.
9. **Refreshed volume figures** — reading volume and alert counts are both May numbers.
10. **Anything between 2026-07-23 and 2026-07-26.** The record ends July 22.

Questions or corrections to Operations support. If you are about to send a number or a capability
claim from this document to anyone outside the company, check the recommendation set first.
