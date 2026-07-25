# Relay platform — running status log

> Export of the #relay-status channel plus notes carried over from the weekly ops doc. Entries are as people added them — order is not reliable, some notes were posted late or pasted under the wrong week. Kept verbatim.

---

**2026-07-18** — Scorecards v2 lane-dedup fix merged (RLY-2214). Re-pilot is NOT scheduled yet — needs the June/July rollup backfill re-run first. Bellgrave asked when they get v2 back; told them "when it's right."

**June 16** — Bad day. Vantry driver on trip VTR-8841 changed the reefer setpoint from -20°C to -4°C, outside the commodity profile. Setpoint Guard picked it up and paged ops 40 minutes later, inside its design window, but by the time the carrier reached the driver the frozen seafood load had partially thawed. Claim estimate ~$18k. For the record from the post-incident review: the tool watched and reported exactly as built — it does not stop or reverse a setpoint change, and nothing in the product does. The "prevents unauthorized setpoint changes" line in the sales one-pager needs to go; Ingrid owns the wording fix with marketing. (Still open as of mid-July as far as I know.)

(no date) — heads up: all three scorecards v2 pilot tenants are seeing duplicated lanes in the carrier rollups. on-time % looks inflated. digging in. — tomás

**2026-06-20** — Carrier Scorecards v2 enabled for the pilot group: Bellgrave Grocers, Ashwood Produce Co-op, Vantry Logistics. Everyone else stays on v1.

**2026-07-03** — PEA is ON for all tenants as of this morning. Big milestone.

**2026-06-24** — Scorecards v2 rolled back for all three pilot tenants. Root cause: the multi-stop lane model double-counts lanes on trips with more than one delivery stop, which inflates on-time and temperature-integrity numbers. v1 re-enabled everywhere; v1 was never affected. Fix targeted mid-July.

**2026-07-05** — Correction to the 7/3 note above: PEA was enabled for all tenants in the STAGING environment only. The production flag (`pea_enabled`, per-tenant) remains OFF for every production tenant. Nothing customer-facing changed on 7/3. Sorry for the confusion — my fault for posting before checking which console I was in. — Marcus

**2026-06-28** — Ingest outage 14:02–17:03 UTC (3h01m). Expired TLS cert on the MQTT broker cluster. Readings buffered on gateways and backfilled after restore, so no data was lost, but live dashboards and alerting were blind for the window. June ingest availability lands at 99.6% against the 99.9% internal target. Postmortem actions: cert issuance automation; broker failover drill.

**7/2** — cert automation is done and deployed. failover drill still open, no owner yet.

**2026-07-08** — Sentia sent the draft SOC 2 Type II report. Fieldwork closed June 6. Two exceptions noted: (1) two departed-contractor accounts kept system access more than 30 days past offboarding; (2) no automated expiry monitoring on broker TLS certs at the time of the June incident. Final report expected next week. Our remediation plan will be due to Sentia by Sept 15.

**2026-06-30** — SOC 2 Type II fieldwork wrapped up June 9. Auditors flagged our offboarding access reviews as a likely exception. Waiting on the draft to see how it gets written up.

**07/15** — Final SOC 2 Type II report issued by Sentia. Opinion is unqualified; the two exceptions from the draft are in the final text, with our remediation window noted (plan due Sept 15). Fieldwork period on the cover page reads March 1 – June 6, 2026. For anyone writing customer-facing words: "SOC 2 Type II report issued" is right; "passed clean" is not — prospects will read the exceptions.

**2026-06-12** — Predictive Excursion Alerts (PEA) code complete and deployed to production behind the per-tenant `pea_enabled` flag. Flag is OFF for all production tenants. Staging soak running against synthetic plus replayed trips.

**2026-07-19** — PEA staging soak written up (details in the data review deck): 78% of slow-drift excursions flagged 30+ minutes before threshold breach; false-alert volume roughly one per tenant per day at pilot fleet sizes — ops thinks that's livable, sales thinks it's high. Production enablement is Priya's call, and she wants to sit with it until after the Hartwell decision, whenever that lands.

**2026-06-18** — Mk II gateway retirement confirmed for Oct 31. Customer comms start Aug 1. Migration playbook is with customer success.

**2026-07-20** — Ingrid escalated Mk II retirement: Ashwood alone has ~1,900 Mk II units in the field and says there is no way they swap hardware before their winter produce contracts. Leadership is leaning toward extending Mk II support through Q1 2027. To be clear: nothing has been formally decided or announced, and the Oct 31 date from June is still the last announced position.

**2026-06-26** — Hartwell Pharma pilot readout (120 trailers, 90 days): median excursion detection 11 minutes, versus the 43 minutes their previous system averaged; zero missed excursions in the pilot window. Fleet-wide proposal (2,400 trailers) drafted for their VP Quality.

**2026-07-10** — Hartwell fleet-wide go/no-go review postponed; their VP Quality moved it to July 24.

**2026-07-22** — Hartwell review moved again, now "first week of August" per their procurement. No decision has been made on the 2,400-trailer expansion. Please do not let anyone tell sales or the board this is done — it is not.

**2026-07-01** — Active sensor count crossed 46,500 (was ~40,200 at the June inventory). 64 customer fleets.

(no date) — Product council approved shortening full-resolution telemetry retention from 24 months to 12 to cut storage spend. Effective date TBD — the contracts team is checking which MSAs promise 24 months (Bellgrave's and Hartwell's do at minimum, possibly others). Until that clears and someone announces it, 24 months is still what we sell and still what the platform does.

**2026-07-09** — Export API v2 merged after final review — out the door at last 🎉. Docs still to come.

(no date) — dashboard latency ticket from Bellgrave still open — p95 4.8s on the trip-history view, target is 2s. not great, not urgent per Marcus.

**7/17** — sales asked whether a customer can start pulling from Export API v2 for a Hartwell data request. Didn't see an answer in the channel.
