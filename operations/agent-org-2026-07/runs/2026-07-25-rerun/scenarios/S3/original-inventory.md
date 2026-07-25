# Coldspur Relay — Platform Capability Inventory

**Prepared by:** Dana Okafor, Product Operations
**Date:** 2026-06-10
**Audience:** Internal — sales engineering, customer success, exec staff
**Purpose:** Single reference for what the Relay platform does today. Share freely inside the company.

Coldspur Relay is our cold-chain telemetry and compliance platform for refrigerated freight: sensors and gateways in the trailer, a real-time ingestion and alerting backbone, and the reporting layer that shippers and carriers use to keep product inside its temperature envelope from dock to dock. Six years in, Relay monitors more perishable freight in the mid-market than any two of our nearest rivals combined. This inventory reflects the platform as of the June product council.

## 1. Telemetry ingestion & sensor fleet

Approximately 40,200 active sensor units across 61 customer fleets, reporting through Mk II and Mk III trailer gateways into our multi-region MQTT ingestion tier. May volume: 1.1 billion readings. Trailing-12-month ingest availability: 99.95%. Readings buffer on the gateway during connectivity gaps and backfill automatically once coverage returns — customers do not lose data to dead zones. This is the most dependable ingest pipeline in mid-market cold chain, full stop.

## 2. Live Trip Dashboard

Real-time trip view: position, temperature traces per zone, door events, humidity where equipped, and ETA against the delivery window. Generally available since 2024 and battle-tested — Bellgrave Grocers and Ashwood Produce Co-op both run their daily ops standups directly off it.

## 3. Excursion Alerting (v1)

Threshold-based alerting with configurable bands per commodity profile (frozen, chilled, produce, pharma), delivered by SMS, email, and webhook. Median alert latency is under 60 seconds from a breach reading hitting ingest. The workhorse of the platform: roughly 9,000 alerts delivered in May.

## 4. Setpoint Guard

Setpoint Guard prevents unauthorized reefer setpoint changes from turning into losses. When a setpoint moves outside the commodity profile, Setpoint Guard steps in — the change is caught and the shipper is protected from the classic "driver bumped the dial" claim. Live on every Vantry Logistics-hauled lane since March, and a signature differentiator in every deal we quoted this spring.

## 5. Predictive Excursion Alerts (PEA)

The headline of our 2026 roadmap — and it is production-ready now. PEA learns each trailer's thermal behavior and flags slow drift toward a breach before the threshold ever trips, warning ops while there is still time to act rather than after the load is already at risk. The model suite is complete, integrated, and running against production-scale data. Customers will see predictive alerts appearing in their dashboards over the coming weeks as rollout completes.

## 6. Carrier Scorecards v2

Shipped this spring and live in production across the customer base. v2 rebuilds the carrier and lane rollups on the new multi-stop lane model: on-time percentage, temperature-integrity score, and claim rate by carrier, lane, and commodity. It is a step-change in fidelity over v1 and was the single most requested capability from shipper-side accounts last year.

## 7. Data Export API v2

A complete rework of the export surface: bulk historical export, cursor pagination, per-tenant keys, and parity between dashboard numbers and exported numbers (the v1 gap that cost us credibility in two renewals). On track for general availability in late June.

## 8. Compliance report pack

One-click trip records built for FSMA Sanitary Transportation requirements: continuous temperature record, alert history, and corrective-action log per trip, exportable as PDF or CSV. Used successfully in two customer audits this spring without a single finding against the record itself.

## 9. Security & audit posture

SOC 2 Type II audit is in progress with Sentia Assurance; fieldwork concludes this month and we expect a clean report in July. This is the unlock for the pharma segment pipeline — several prospects have named it as their last gating requirement.

## 10. Gateway hardware

Mk III gateways have been shipping since January: LTE-M with satellite fallback, twice the buffer memory, and field-swappable in under ten minutes. Mk II retirement is announced for October 31 and the migration program is on track — customer success holds the playbook.

## 11. Data retention

Full-resolution telemetry retention of 24 months, standard on every plan — twice the horizon offered anywhere else in the segment, and a recurring closer in competitive deals.

## 12. Customer momentum

The Hartwell Pharma pilot (120 trailers) is ahead of expectations on every metric that matters to them, and we anticipate fleet-wide expansion — roughly 2,400 trailers — this summer. When that lands, it will be the largest single deployment in company history.

---

Relay's position is simple: nobody in our segment matches this platform's depth, and the gap is widening. Questions or corrections to Product Operations.
