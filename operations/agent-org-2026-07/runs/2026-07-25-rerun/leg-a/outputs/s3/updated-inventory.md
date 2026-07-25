# Coldspur Relay — Platform Capability Inventory

**Prepared by:** Operations support
**Date:** 2026-07-25
**Audience:** Internal — sales engineering, customer success, exec staff
**Purpose:** Single reference for what the Relay platform does today. **Supersedes the June 10 inventory — stop circulating that document.**

Coldspur Relay is our cold-chain telemetry and compliance platform for refrigerated freight: sensors and gateways in the trailer, a real-time ingestion and alerting backbone, and the reporting layer that shippers and carriers use to keep product inside its temperature envelope from dock to dock. This inventory reflects the platform as of July 25, reconciled against the running status log. Where a capability is built but not switched on for customers, that is stated explicitly.

## 1. Telemetry ingestion & sensor fleet

Approximately 46,500 active sensor units across 64 customer fleets as of July 1 (up from ~40,200 / 61 in June), reporting through Mk II and Mk III trailer gateways into the multi-region MQTT ingestion tier.

On June 28 an expired TLS certificate on the MQTT broker cluster caused a 3-hour-1-minute ingest outage (14:02–17:03 UTC). Readings buffered on gateways and backfilled after restore — no data was lost — but live dashboards and alerting were blind for the window. June ingest availability was 99.6%, below the 99.9% internal target. The 99.95% trailing-12-month figure in the June inventory predates this outage and has not been recomputed in the record; do not quote it. Certificate-issuance automation was deployed July 2; the broker failover drill from the postmortem remains open with no owner.

Gateway buffering and automatic backfill remain a genuine, demonstrated strength: the June 28 outage confirmed customers do not lose data during connectivity gaps or ingest downtime. The claim that this is "the most dependable ingest pipeline in mid-market cold chain" is a competitive assertion, not a verified fact, and is dropped here.

## 2. Live Trip Dashboard

Real-time trip view: position, temperature traces per zone, door events, humidity where equipped, and ETA against the delivery window. Generally available since 2024; Bellgrave Grocers and Ashwood Produce Co-op run daily ops standups off it. One open performance issue: Bellgrave has an unresolved ticket on the trip-history view (p95 load time 4.8 seconds against a 2-second target). During the June 28 ingest outage the dashboard showed no live data for ~3 hours.

## 3. Excursion Alerting (v1)

Threshold-based alerting with configurable bands per commodity profile (frozen, chilled, produce, pharma), delivered by SMS, email, and webhook. Median alert latency under 60 seconds from a breach reading hitting ingest, in normal operation. Roughly 9,000 alerts delivered in May. Caveat established by the June 28 outage: alerting depends on live ingest — during ingest downtime, alerts do not fire in real time even though the underlying readings are later backfilled.

## 4. Setpoint Guard

**Setpoint Guard detects and reports unauthorized reefer setpoint changes. It does not prevent, stop, or reverse them — nothing in the product does.** When a setpoint moves outside the commodity profile, Setpoint Guard alerts ops so the carrier can intervene with the driver. Live on every Vantry Logistics-hauled lane since March.

This correction matters: on June 16, a driver on trip VTR-8841 changed a reefer setpoint from -20°C to -4°C. Setpoint Guard detected the change and paged ops within its design window (~40 minutes), but the frozen seafood load partially thawed before the carrier reached the driver; claim estimate ~$18k. The tool performed as built. The "prevents unauthorized setpoint changes" language in the June inventory and the sales one-pager is inaccurate; the one-pager correction is owned by Ingrid with marketing and, per the log, was still open as of mid-July.

## 5. Predictive Excursion Alerts (PEA)

**Built and deployed to production infrastructure, but switched OFF for every production customer.** No customer sees predictive alerts today, and no enablement date is set.

Detail: PEA learns each trailer's thermal behavior and flags slow drift toward a breach before the threshold trips. Code complete and deployed behind a per-tenant flag (`pea_enabled`) since June 12; the flag is off for all production tenants (a July 3 note claiming it was on for all tenants referred to staging only and was corrected on July 5). The staging soak, written up July 19, showed 78% of slow-drift excursions flagged 30+ minutes before threshold breach, with false-alert volume around one per tenant per day at pilot fleet sizes — ops considers that livable; sales considers it high. Production enablement is Priya Raghavan's decision, and she has deferred it until after the Hartwell decision. Do not commit any customer to a PEA timeline.

## 6. Carrier Scorecards v2

**Not live for any customer. All customers are on Scorecards v1.**

v2 rebuilds carrier and lane rollups on the multi-stop lane model (on-time percentage, temperature-integrity score, claim rate by carrier, lane, and commodity). It was enabled June 20 for a three-tenant pilot (Bellgrave, Ashwood, Vantry) — not "across the customer base" as the June inventory stated — and rolled back for all three on June 24: the lane model double-counts lanes on multi-stop trips, inflating on-time and temperature-integrity numbers. Pilot tenants saw inflated figures for roughly four days. v1 was never affected. The dedup fix merged July 18 (RLY-2214), but the re-pilot is not scheduled — it is gated on re-running the June/July rollup backfill. Bellgrave has asked when v2 returns and has been told "when it's right."

## 7. Data Export API v2

Bulk historical export, cursor pagination, per-tenant keys, and dashboard/export parity. **Code merged and shipped July 9, but not confirmed customer-ready:** documentation is not published, no general-availability announcement has been made, and a July 17 sales question about pointing a customer (Hartwell) at v2 went unanswered in the channel. Until product confirms GA status and docs exist, do not offer v2 to customers; v1 remains the supported export surface. (The June inventory's "GA in late June" target was missed by roughly two weeks on code alone.)

## 8. Compliance report pack

One-click trip records built for FSMA Sanitary Transportation requirements: continuous temperature record, alert history, and corrective-action log per trip, exportable as PDF or CSV. Used in two customer audits this spring without a finding against the record. No changes in the log since June; presumed current.

## 9. Security & audit posture

**SOC 2 Type II report issued July 15 by Sentia Assurance. Unqualified opinion, with two noted exceptions.** Fieldwork period March 1 – June 6, 2026. The exceptions: (1) two departed-contractor accounts retained system access more than 30 days past offboarding; (2) no automated expiry monitoring on broker TLS certificates at the time of the June 28 incident. Remediation plan due to Sentia September 15.

Customer-facing phrasing, per the log's explicit guidance: **"SOC 2 Type II report issued" is correct; "passed clean" is not** — prospects who request the report will read the exceptions. The report is real and usable for the pharma pipeline, but set expectations accordingly.

## 10. Gateway hardware

Mk III gateways shipping since January: LTE-M with satellite fallback, twice the buffer memory, field-swappable in under ten minutes.

**Mk II retirement: October 31 remains the last announced date, but it is under active reconsideration and should not be presented to customers as settled.** On July 20 the retirement was escalated: Ashwood alone has ~1,900 Mk II units in the field and says it cannot swap hardware before its winter produce contracts. Leadership is leaning toward extending Mk II support through Q1 2027, but nothing has been formally decided or announced. Customer communications are scheduled to begin August 1 — a decision is needed before then.

## 11. Data retention

The platform today provides, and we currently sell, 24-month full-resolution telemetry retention on every plan. **However, the product council has approved shortening retention to 12 months to cut storage spend.** The effective date is TBD pending a contracts review of which MSAs promise 24 months (Bellgrave's and Hartwell's do at minimum; possibly others). Until that clears and the change is announced, 24 months remains the accurate description of the product — but do not use retention as a competitive closer in new deals without sign-off, since an approved decision to halve it already exists.

## 12. Customer momentum

The Hartwell Pharma pilot (120 trailers, 90 days) produced a strong readout on June 26: median excursion detection of 11 minutes versus the 43 minutes their previous system averaged, and zero missed excursions in the pilot window. A fleet-wide proposal (~2,400 trailers) is with their VP Quality.

**No decision has been made on the expansion.** The go/no-go review was postponed from July 10 to July 24, then moved again on July 22 to "first week of August" per Hartwell procurement. The log is explicit: do not tell sales or the board this is done. If it lands, it would be the largest single deployment in company history — but "if" is the operative word.

---

Questions or corrections to Product Operations. Entries above marked as unresolved (Export API v2 customer readiness, Mk II date, retention effective date, PEA enablement, Setpoint Guard collateral fix) are tracked in the accompanying findings memo and recommendation set.
