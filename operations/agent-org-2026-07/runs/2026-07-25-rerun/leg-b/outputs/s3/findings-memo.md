# Findings — what changed since June 10, and what the June inventory now gets wrong

**To:** Priya Raghavan, VP Product & Operations
**From:** Operations support
**Date:** 2026-07-26
**Re:** Inventory refresh — findings
**Sources:** the 2026-06-10 capability inventory; the running status log (last dated entry
2026-07-22). No other sources were consulted and nothing here is independently verified against
the systems themselves.

---

## Bottom line

Six weeks of drift is the smaller problem. The larger one is that **four claims in the June
inventory are not stale — they are wrong in a direction that flatters us**, and three of those
four are about capabilities customers cannot actually use. A reader who trusts the June document
will tell a prospect that Setpoint Guard prevents unauthorised setpoint changes (it does not),
that Carrier Scorecards v2 is live across the customer base (it is live nowhere), that predictive
alerting is arriving in dashboards within weeks (it is off for every production tenant with no
date), and that our SOC 2 came back clean (it came back with two exceptions).

Every one of those errors points the same way. That pattern is worth more of your attention than
any individual item, because it is the thing that will recur in the next inventory unless
something changes about how the document is produced.

Two items are also **time-critical this week**: the Mk II customer communications are scheduled to
go out on **August 1** carrying a retirement date leadership may be about to change, and an
**unanswered question from July 17** about Export API v2 access is blocking a Hartwell data
request while Hartwell is mid-decision on a 2,400-trailer expansion.

---

## Part A — Framings that are actively misleading if left uncorrected

Ordered by how much damage they do before someone catches them.

### A1. Setpoint Guard "prevents unauthorized setpoint changes" — false, and a customer has already been harmed in exactly that scenario

**June said:** "Setpoint Guard prevents unauthorized reefer setpoint changes from turning into
losses… the change is caught and the shipper is protected from the classic 'driver bumped the
dial' claim."

**The record shows:** On June 16 a Vantry driver on trip VTR-8841 moved the setpoint from -20°C to
-4°C. Setpoint Guard detected it and paged ops 40 minutes later — *inside its design window*. The
frozen seafood load partially thawed. Claim estimate **~$18,000**. The post-incident review states
plainly that the tool watches and reports, that **it does not stop or reverse a setpoint change,
and that nothing in the product does.**

**Why it matters:** This is not a roadmap item described optimistically. It is a **protective
claim in customer-facing collateral that the product does not deliver**, and the failure mode it
promises to prevent has now occurred and produced a loss. Two aggravating details:

- The correction was ordered at the post-incident review, Ingrid owns it with marketing, and it
  was **still open as of mid-July**. The bad one-pager should be assumed to still be in
  circulation.
- The June inventory itself describes Setpoint Guard as **"a signature differentiator in every
  deal we quoted this spring."** If the preventive framing travelled with it, the exposure is not
  one document — it is a spring's worth of quoted deals.

**Confidence:** High on the capability and the incident (both stated directly in the record).
The scope of collateral exposure is my **inference** from the June document's own "every deal we
quoted this spring" line; someone should confirm it rather than take my word for it.

**A related fact worth surfacing on its own:** Setpoint Guard's detection latency has nothing to
do with the sub-60-second Excursion Alerting latency. The record proves the design window admits
**at least 40 minutes** and never states the spec. If anyone has been carrying "under a minute"
across from §3 to §4 in their head, that needs correcting too.

### A2. Carrier Scorecards v2 "live in production across the customer base" — it is live nowhere, and was never across the customer base

**June said:** "Shipped this spring and live in production across the customer base."

**The record shows:** enabled June 20 for a **three-tenant pilot** (Bellgrave, Ashwood, Vantry) —
"everyone else stays on v1." Rolled back for all three on **June 24** after the multi-stop lane
model was found to double-count lanes on multi-stop trips, **inflating on-time percentage and
temperature-integrity score**. The dedup fix (RLY-2214) merged July 18, but the re-pilot is
**explicitly not scheduled** pending a June/July rollup backfill re-run. Today: zero tenants on
v2.

**Why it matters:** The June sentence was **never true at any point** — not before the pilot, not
during it, and not after the rollback. Anyone repeating it is telling a customer they have a
capability that does not exist for them. Bellgrave has already asked when they get v2 back and
been told "when it's right," so at least one account knows the claim is wrong.

**There is also a data-integrity tail here**, which is the part I would not want to see dropped:
the defect inflated the two numbers a shipper cares most about. **Any v2-derived figure produced
during June 20–24 is wrong in our favour.** The record does not say whether any of those numbers
reached the three pilot tenants — in a QBR deck, an emailed rollup, or the dashboard they were
looking at during those four days. It should be assumed they saw them until someone checks.

**Confidence:** High on status and root cause. **Whether inflated numbers left the building is
genuinely unknown** — I am flagging a question, not reporting an incident.

### A3. Predictive Excursion Alerts "production-ready now… customers will see them over the coming weeks" — off for every production tenant, with no date

**June said:** "The headline of our 2026 roadmap — and it is production-ready now… Customers will
see predictive alerts appearing in their dashboards over the coming weeks as rollout completes."

**The record shows:** code complete and deployed to production **June 12, behind a per-tenant
`pea_enabled` flag that is OFF for every production tenant.** Six weeks later that is still true.
Production enablement is **your call**, deliberately held until after the Hartwell go/no-go — which
has slipped twice and now sits at "first week of August."

**Why it matters, beyond the status error:** the gating event has no firm date, so **PEA has no
date either**. "Coming weeks" was six weeks ago and the item has not moved a step closer to a
customer.

**And there is a specific trap in the record itself.** A July 3 entry announced "PEA is ON for all
tenants — big milestone." It was corrected on July 5 by its own author: staging only, nothing
customer-facing changed. **The log is not in chronological order, so the correction sits below the
announcement it corrects and is easy to miss entirely.** Anyone who saw the July 3 line in the
channel and not the July 5 line has been walking around for three weeks believing PEA shipped.
If any customer or prospect was told that in early July, it needs walking back — and the person
who told them may not know they need to.

**Confidence:** High on all of the above; it is stated explicitly and corroborated by the July 19
soak write-up treating enablement as still pending.

**Worth saying clearly, because the rest of this section is negative:** the soak results are good.
78% of slow-drift excursions flagged 30+ minutes before breach is a real result against
production-scale data. The open question is the false-alert rate — roughly one per tenant per day
at pilot fleet sizes, which ops calls livable and sales calls high. That disagreement is a product
judgement, not a fact, and it is unresolved.

### A4. SOC 2 "we expect a clean report in July" — the report issued with two exceptions

**June said:** "Fieldwork concludes this month and we expect a clean report in July. This is the
unlock for the pharma segment pipeline — several prospects have named it as their last gating
requirement."

**The record shows:** the final report issued **July 15**. The opinion is **unqualified** — which
is the good outcome and should be said plainly — but **two exceptions appear in the final text**:
(1) two departed-contractor accounts kept system access more than 30 days past offboarding;
(2) no automated expiry monitoring on broker TLS certificates at the time of the June incident.
Remediation plan due to Sentia by **September 15**. The record's own guidance: *"SOC 2 Type II
report issued" is right; "passed clean" is not — prospects will read the exceptions.*

**Why it matters:** "clean" and "unqualified with two exceptions" are different facts, and the
difference is material to exactly the buyers who named SOC 2 as their gate. A pharma prospect
choosing us on the strength of "they passed clean" is deciding on something we did not achieve.
That is the reason to correct it, independent of what happens when they read the report
themselves — and they will read it. **A pharma security reviewer goes to the access-control
exception first**, and exception 2 is the same control gap that produced the June 28 outage, so a
diligent reviewer can connect the audit finding to a three-hour service interruption. Both should
come from us, early and in our own words.

**Confidence:** High. **One discrepancy resolved:** a June 30 note recorded fieldwork closing
June 9; the draft and the issued report both say **June 6**, and the issued report's cover page
(March 1 – June 6, 2026) is authoritative. I went with June 6.

**A small thing that says something larger:** the June 10 inventory said fieldwork "concludes this
month." It had already closed on June 6 — four days before that document was written. The June
inventory was not fully checked against the record even on the day it was published.

### A5. "The most dependable ingest pipeline… full stop" and 99.95% availability — the availability claim did not survive June

**June said:** trailing-12-month ingest availability 99.95%; "customers do not lose data to dead
zones"; "the most dependable ingest pipeline in mid-market cold chain, full stop."

**The record shows:** a **3h01m ingest outage on June 28** from an expired broker TLS cert. **June
availability: 99.6% against a 99.9% internal target.** Readings buffered and backfilled — **no
data was lost** — but live dashboards and alerting were **blind for the full window**.

**Why it matters:** the buffering claim is the one to keep; it was tested in anger and it held.
The **99.95% figure is stale and nobody has restated it** — it must not keep circulating as a
current number. And the "no data lost" framing needs care: it is true about connectivity dead
zones and it is *not* a general statement that the outage was harmless. For three hours, a
customer relying on Relay for excursion alerting had no excursion alerting. That is the honest
version, and a customer who noticed the gap will know it.

**Confidence:** High on the outage and the June figure. **The current trailing-12-month number is
not in the record** — my rough arithmetic puts a three-hour outage at about 0.03 points of a
year, so somewhere near 99.92%, but that is an estimate and the platform team should publish the
real one before anyone quotes it.

### A6. "We anticipate fleet-wide expansion this summer… the largest single deployment in company history"

**The record shows:** the Hartwell pilot readout was genuinely strong — 11-minute median excursion
detection against their previous system's 43, zero missed excursions across 120 trailers over 90
days. The 2,400-trailer proposal was drafted. Then the go/no-go was **postponed to July 24**, then
**moved again to "first week of August"** by Hartwell procurement. **No decision has been made**,
and the record carries an unusually direct instruction: *do not let anyone tell sales or the board
this is done.*

**Why it matters:** a pending decision described as an expected one propagates — into a board
deck, a forecast, a hiring plan — and every place it lands treats it as settled. Two slips in
twelve days is a pattern, not a scheduling accident, and the second slip
came from *their procurement* rather than their VP Quality — which is a different and less
comfortable signal. The pilot metrics are real and should keep being used; the expansion should
disappear from forecasts until Hartwell says yes.

**Confidence:** High. This is the clearest instruction in the record.

### A7. Export API v2 "on track for general availability in late June"

**The record shows:** merged **July 9** after final review, **documentation still outstanding** at
that point, and **no GA announcement, release note, or confirmation of customer access anywhere**.
On **July 17 sales asked whether a customer could start pulling from Export API v2 for a Hartwell
data request. The question was never answered.**

**Why it matters:** "merged" is being read as "shipped," and the gap between them is exactly where
a promise to a customer gets made. The unanswered July 17 question is the sharpest single item in
this memo: **the account we are most exposed on is waiting for data, mid-decision, and nobody
knows whether we can serve it from v2.**

**Confidence:** High that the record shows no GA. **I cannot say the API is unavailable** — only
that nothing in the record establishes that it is available. That distinction matters; the fix is
one question to product engineering.

### A8. 24-month retention as a durable differentiator — true today, approved for reduction

**The record shows:** product council has **approved cutting full-resolution retention from 24
months to 12**. Effective date TBD; contracts is checking which MSAs commit to 24 months —
**Bellgrave's and Hartwell's do at minimum, possibly others.** Until that clears and is announced,
**24 months is still what the platform does and still what we sell.**

**Why it matters:** the capability statement is fine. The *sales posture* is the problem. June
called this "a recurring closer in competitive deals," which means we are actively winning
business on a term that has been approved for reduction with no announced date. Every new
multi-year contract signed on 24 months in the interim potentially adds to the MSA problem
contracts is currently trying to size.

**Confidence:** High on the approval and the current state. **This entry is undated**, so I cannot
say how far along the contract review is or how imminent the change is.

### A9. The document's own framing and distribution

Two things about the June document as an artefact rather than its contents:

- **Unsourced competitive superlatives.** "More perishable freight than any two of our nearest
  rivals combined," "the most dependable ingest pipeline in mid-market cold chain, full stop,"
  "nobody in our segment matches this platform's depth, and the gap is widening." **Nothing in the
  operating record supports or refutes any of these.** I am not calling them false. I am saying an
  internal capability inventory is the wrong place for claims nobody can source — especially the
  dependability one, which June's numbers now actively undercut.
- **It is marked "share freely inside the company" and it is reaching prospects.** An internal
  document written in confident marketing register, forwarded outward, is how §A1 and §A4 turn
  into a customer conversation. The distribution problem and the accuracy problem compound each
  other.

---

## Part B — Changed, but not misleading

Ordinary drift. Update the numbers and move on.

- **Fleet growth.** ~40,200 sensors / 61 fleets → **~46,500 sensors / 64 fleets** as of July 1.
  Good news, and roughly 16% unit growth in three weeks.
- **Volume and alert counts are stale, not wrong.** 1.1B readings and ~9,000 alerts are **May**
  figures. Nobody refreshed them. Label them as May or drop them.
- **Postmortem follow-through is partial.** Certificate issuance automation shipped July 2. The
  **broker failover drill is still open and still has no owner** — and it is a named postmortem
  action against an incident that also became an audit exception.
- **Bellgrave dashboard latency.** Open ticket, **p95 4.8s on the trip-history view against a 2s
  target**, characterised as "not great, not urgent." Undated. Notable mainly because it is the
  *second* open irritant at Bellgrave, alongside their unanswered Scorecards v2 question.
- **Live Trip Dashboard, Excursion Alerting v1, Compliance report pack, Mk III hardware.** No
  contradicting entries. Carried forward as written.

---

## Part C — What the record settles, and what it does not

**The log is a working record and it is messy.** Its own header warns that ordering is unreliable
and that some notes were posted late or under the wrong week. Three direct self-contradictions
appear in it. Here is how I resolved them, so you can disagree with the reasoning rather than just
the answer:

| Conflict | Resolution | Basis |
|---|---|---|
| SOC 2 fieldwork closed June 9 (Jun 30 note) vs June 6 (Jul 8 and Jul 15 notes) | **June 6** | The issued report's cover page beats a contemporaneous internal recollection written before anyone had seen the draft |
| PEA "ON for all tenants" (Jul 3) vs "staging only, production OFF" (Jul 5) | **OFF in production** | An explicit self-correction by the same author, corroborated by the Jul 19 entry treating enablement as still pending |
| Scorecards v2 "live across the customer base" (June inventory) vs pilot-only then rolled back | **Zero tenants on v2** | Sequence is unambiguous: enabled Jun 20 for three tenants, rolled back Jun 24, re-pilot not scheduled as of Jul 18 |

Two entries are **undated** and cannot be placed on the timeline: the retention approval and the
Bellgrave latency ticket. Both assert their own current state, so I have taken that state at face
value while noting I cannot say when it was written or what has happened since. A third undated
entry (tomás on duplicated lanes) is placeable by content — it sits between June 20 and June 24.

**Where absence of news is not good news.** Several items' last recorded state is "open," "not
scheduled," or "no owner yet." I have treated those as current rather than assuming they closed
quietly: the Setpoint Guard collateral fix, the broker failover drill, the Scorecards v2 re-pilot
and backfill re-run, the Bellgrave latency ticket, and the July 17 Export API question.

**What careful reading cannot resolve** — these need someone to go and find out:

1. Current trailing-12-month ingest availability (the 99.95% is stale; the real figure is not in
   the record).
2. Setpoint Guard's actual design-window specification — proven to admit at least 40 minutes,
   never stated.
3. Whether the Setpoint Guard one-pager has actually been corrected.
4. Whether Export API v2 is callable by customers, and whether its docs exist.
5. Whether inflated Scorecards v2 numbers reached the three pilot tenants during June 20–24, and
   whether the June/July rollup backfill has been re-run.
6. The Mk II decision, and whether the August 1 comms are still going out as drafted.
7. The retention change's effective date and the full MSA list beyond Bellgrave and Hartwell.
8. Remediation status for the contractor-offboarding exception, and an owner for the failover
   drill.
9. Anything at all between **July 23 and July 26** — the record ends July 22.

---

## Part D — On confidence

Everything in Part A marked "high confidence" is stated directly in the status log, usually more
than once, and I would act on it without further checking. Where I have inferred — the scope of
Setpoint Guard collateral exposure, the estimated availability figure, the possibility that
inflated scorecard numbers reached pilot tenants — I have said so at the point of the claim rather
than in a blanket caveat, because the whole value of this memo is that you can tell the two apart
without re-reading the source.

What I have **not** done: verified any of this against the platform itself, spoken to Ingrid,
Marcus, tomás, or customer success, or looked at the sales one-pager, the data review deck, or the
SOC 2 report. This memo is a careful reading of two documents. Every item in the "cannot resolve"
list above is a place where that method runs out, and none of them should be closed by inference.

One last observation, offered as a pattern rather than a finding. Every material error in the June
document points the same way: pilot read as general availability, merged read as shipped, code
complete read as production-ready, expected read as achieved, monitoring read as prevention. That
is not a series of unrelated mistakes — it is a document written in the register of a sales
narrative rather than a capability record. Correcting the twelve entries fixes this edition. It
does not fix the next one.
