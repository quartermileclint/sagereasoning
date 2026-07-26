# Recommendations — what to do with the corrected inventory

**To:** Priya Raghavan, VP Product & Operations; sales engineering, customer success, exec staff
**From:** Operations support
**Date:** 2026-07-26
**Companion to:** `updated-inventory.md`, `findings-memo.md`

This set is organised by what it asks of you. **Part 1** is time-critical. **Part 2** is what
anyone can act on today without asking permission. **Part 3** is the judgement calls that need a
named decision-maker and must not be stated as fact until someone makes them. **Part 4** is the
process change, which is the only thing here that prevents a repeat.

---

## Part 1 — This week

### 1.1 Decide the Mk II retirement date before August 1 — **six days**

Customer communications for the October 31 Mk II retirement are scheduled to begin **August 1**.
Leadership is simultaneously leaning toward extending support **through Q1 2027** after Ashwood's
escalation (~1,900 units, cannot swap before winter produce contracts). Nothing is decided.

If the comms go out on schedule and the extension follows, we announce a hard deadline and retract
it inside a quarter — to the exact customers whose objection caused the retraction. **The
sequencing is the risk, not the decision itself.** Three options, in the order I would take them:

1. **Decide the date this week and comm the decision.** Cleanest.
2. **Hold the August 1 comms** pending the decision, and tell customer success why. Costs a few
   weeks of migration runway.
3. **Send the comms on October 31 as planned** knowing they may be superseded. Not recommended.

Owner: you, with Ingrid and customer success. **Do not let this default into option 3 by nobody
deciding.**

### 1.2 Answer the July 17 Export API v2 question — **today**

Sales asked on July 17 whether a customer can begin pulling from Export API v2 to service a
**Hartwell** data request. **No answer appears anywhere in the record.** Hartwell is mid-decision
on 2,400 trailers, and their go/no-go is now "first week of August."

This is one question to product engineering: **is v2 callable by customers today, are the docs
published, and can Hartwell's request be served from it?** Whoever answers should reply in the
channel so the answer exists somewhere findable. Until then, nobody should promise Hartwell
anything about v2.

### 1.3 Pull the Setpoint Guard one-pager

The "prevents unauthorized setpoint changes" line was ordered removed at the June 16 post-incident
review, Ingrid owns the fix with marketing, and it was **still open as of mid-July**. Assume it is
still in circulation.

Do not wait for approved replacement wording to stop distributing the current version. Confirm
with Ingrid whether it has been fixed; if not, stop the distribution today and let the rewrite
follow. See **3.1** for the wider exposure question, which is a leadership call — but pulling a
document known to be inaccurate is not.

### 1.4 Re-brief anyone told that PEA is live

The July 3 "PEA is ON for all tenants" announcement was corrected on July 5, but **the correction
sits below the announcement in an out-of-order log and is easy to miss.** Anyone who saw the first
and not the second has believed for three weeks that predictive alerting shipped.

Post the correction again, at the top, dated today. Ask sales engineering and customer success
directly whether PEA came up with any customer or prospect between July 3 and now. **The people
who need re-briefing are exactly the people who do not know they were misinformed** — they will
not self-identify unless asked.

---

## Part 2 — Safe to act on and state as fact

No sign-off needed. These are stated directly in the record, and I would act on them without
further checking.

**Stop saying / start saying:**

| Stop saying | Start saying |
|---|---|
| "Setpoint Guard prevents unauthorised setpoint changes" | "Setpoint Guard detects out-of-profile setpoint changes and alerts operations." Nothing in the product blocks or reverses a change |
| "Carrier Scorecards v2 is live across the customer base" | v2 is not live for any tenant; all tenants are on v1. A fix merged July 18; the re-pilot is not yet scheduled |
| "PEA is production-ready / rolling out over the coming weeks" | PEA is code-complete and deployed behind a per-tenant flag that is off for every production tenant. There is no rollout date |
| "Export API v2 is GA / went GA in late June" | The code merged July 9. Customer availability is unconfirmed — ask before promising |
| "We passed SOC 2 clean" | "Our SOC 2 Type II report was issued July 15 with an unqualified opinion and two exceptions, with a remediation plan due September 15" |
| "99.95% ingest availability" | June availability was 99.6% after a three-hour outage. The current trailing-12-month figure has not been restated — do not quote one |
| "Hartwell is expanding to 2,400 trailers this summer" | The 120-trailer pilot succeeded. The expansion decision is pending, now expected first week of August |
| "Mk II retires October 31, migration on track" | October 31 is the last announced position and is under active review |

**Still true and still worth saying:**

- **~46,500 active sensors across 64 customer fleets** (July 1). Use these, not the June numbers.
- **Gateway buffering and backfill work under real failure.** During the June 28 outage, readings
  buffered on gateways and backfilled after restore with **no data lost**. This was tested in
  anger and it held. Pair it honestly: dashboards and alerting were blind for the window.
- **The Hartwell pilot results.** 11-minute median excursion detection against their previous
  system's 43; zero missed excursions across 120 trailers over 90 days. Real, quotable, and
  entirely separate from the undecided expansion.
- **The PEA soak results**, if framed as what they are — 78% of slow-drift excursions flagged 30+
  minutes early in staging. Not a customer-available capability.
- **SOC 2 Type II issued, unqualified opinion**, fieldwork March 1 – June 6, two exceptions,
  remediation due September 15. State the exceptions rather than waiting to be asked — a prospect
  choosing us on "they passed clean" has been handed a fact we did not earn. A pharma reviewer
  will go to the access-control exception first in any case.
- **Mk III specifications, Excursion Alerting v1, the compliance report pack, 24-month retention
  as it stands today, the Live Trip Dashboard.** Unchanged.

**Two handling rules:**

- **Label May figures as May.** Reading volume (1.1B) and alert count (~9,000) have not been
  refreshed and understate a fleet that has grown ~16% since.
- **Do not use any Scorecards v2 figure generated June 20–24.** The defect inflated on-time and
  temperature-integrity numbers in our favour. If one is already in a deck, take it out.

---

## Part 3 — Judgement calls needing a decision-maker

**None of these should be stated as fact to a customer, a prospect, or the board until the named
owner decides.** Each is listed with what I would recommend, so there is something to say yes or
no to rather than an open question.

### 3.1 How far the Setpoint Guard misstatement travelled, and what to do about it — **you, with Ingrid, marketing, and a legal read**

The June inventory describes Setpoint Guard as "a signature differentiator in **every deal we
quoted this spring**." If the preventive framing travelled with it, the exposure is not one
one-pager — it is a quarter of quoted deals, and one customer has already taken a **~$18,000 loss
in exactly the scenario the claim promised to prevent**.

Three questions only you can answer: **how many accounts received the preventive framing; whether
any of them are proactively re-briefed; and whether the Vantry claim's handling intersects with
what our collateral said.** I am flagging the third because a claim and a marketing statement
about the same failure mode are worth a lawyer's eyes — I am not qualified to assess it and am not
attempting to.

**My recommendation:** get the list of affected accounts from marketing this week, and route the
Vantry intersection to counsel before anyone corresponds further with Vantry about the claim.

**One thing this recommendation does not resolve, and should not be read as resolving.** Every
action above is internal — fix the collateral, list the accounts, brief counsel. **Vantry is a
party to this with its own interest**, and what is owed to them is a separate question from
whether our documents are now accurate. I am not in a position to say what that is, and it should
not be settled by default simply because the internal cleanup is complete.

### 3.2 Whether the three Scorecards pilot tenants are told their June 20–24 numbers were inflated — **you, with customer success**

The defect inflated on-time and temperature-integrity — the two numbers a shipper cares most about
— for Bellgrave, Ashwood, and Vantry over four days. **The record does not say whether any of
those figures reached them** in a rollup, a QBR, or simply the dashboard they were looking at.
They were told about the rollback but not, as far as the record shows, that what they saw was
wrong in our favour.

**My recommendation:** find out first, then disclose — and I would treat disclosure as the default
rather than as one of the options, because these tenants may have made carrier decisions on
numbers that were wrong in our own platform's favour. If figures did reach them, tell them before
the re-pilot rather than during it; the same three tenants are the ones being asked to trust v2
again. What genuinely needs your sign-off is the how, the when, and whether anyone beyond the
three pilot tenants is affected — not, in my view, the whether.

### 3.3 PEA production enablement, and whether it stays coupled to Hartwell — **you**

The record is clear this is your decision and that you want to sit with it until after Hartwell.
Two things worth naming: **the gate has slipped twice**, so coupling PEA to it means PEA inherits
an unbounded delay; and **the ops-versus-sales disagreement on the ~1/tenant/day false-alert rate
is unresolved** — that is a product judgement, not a fact anyone can look up.

**My recommendation:** treat "does PEA ship" and "does PEA ship *before* Hartwell decides" as two
decisions, and set a date for the second even if the first stays open. Meanwhile nobody quotes a
PEA rollout date, internally or externally, because there isn't one.

### 3.4 Whether reps may keep selling 24-month retention — **you, with contracts and product council**

Product council has approved 24 → 12 months with **no effective date**, while contracts is still
establishing which MSAs commit to 24 (**Bellgrave and Hartwell at minimum**). Meanwhile 24 months
is being used as a closer. **Every multi-year deal signed on it in the interim potentially adds to
the problem contracts is trying to size.**

**My recommendation:** an interim rule this week — reps may state 24 months as the current product
capability, and may not commit to it contractually beyond the current term without contracts
sign-off. That protects both truthfulness and the MSA position while the review finishes.

### 3.5 Whether the restated availability figure gets published — **platform team, with you**

The 99.95% number is stale and nobody has replaced it. **My estimate of roughly 99.92% is
arithmetic on a three-hour outage, not a platform-team figure, and should not be quoted.** Someone
needs to compute the real trailing-12-month number and decide whether it is quotable externally at
all given the 99.9% internal target was missed in June.

### 3.6 What the prospect-facing version of this document is — **you, with marketing**

The June inventory was internal, written in a sales register, and forwarded to prospects. The
corrected version is deliberately blunt and **should not follow the same path**. Somebody needs to
own the question of what sales engineering is allowed to send outward, because "forward the
internal inventory" is the current answer and it is how §A1 and §A4 of the findings memo reach a
customer.

**My recommendation:** the corrected inventory stays internal, and marketing produces a short
approved external capability summary derived from Part 2 above.

---

## Part 4 — The process change

Fixing twelve entries fixes this edition. It does not fix the next one, and there are two specific
mechanisms that produced these errors.

**4.1 The inventory needs a named owner and a review cadence.** The June document was written by
someone who **moved teams days later**, and then circulated uncorrected for six weeks while being
forwarded to prospects. No one owned it, so no one corrected it. Assign an owner and a monthly
refresh with a review against the status log.

**4.2 Corrections must replace the thing they correct.** The PEA case is the whole argument: a
July 3 announcement was corrected on July 5, and because the log is append-only and out of order,
**the correction is physically below the error and invisible to anyone who read the channel on
July 3.** Corrections should be edited into the original entry, or at minimum the original should
be struck through and annotated. This is a small change that would have prevented the most
avoidable misunderstanding in the record.

**4.3 Separate capability status from capability narrative.** Every material error in the June
document points the same way — pilot read as general availability, merged as shipped, code
complete as production-ready, expected as achieved, monitoring as prevention. That is a document
written in the register of a sales narrative. A capability inventory should carry a boring,
mandatory status field per entry — *available to customers / pilot / behind flag / merged not
released / decided but unannounced* — which makes the flattering reading structurally harder to
write.

**4.4 Two postmortem actions are still open and one is unowned.** The broker failover drill from
the June 28 outage has had **no owner since July 2**, and the record shows **no remediation
activity for the SOC 2 contractor-offboarding exception**. Both feed the September 15 remediation
plan due to Sentia. Seven weeks is less time than it sounds.

---

## What I could not settle

These need someone to find out. None should be closed by inference, including mine:

1. Current trailing-12-month ingest availability.
2. Setpoint Guard's actual design-window specification (proven to admit at least 40 minutes;
   never stated).
3. Whether the Setpoint Guard one-pager has been corrected, and how many accounts saw it.
4. Whether Export API v2 is callable by customers, and whether its documentation exists.
5. Whether inflated Scorecards v2 numbers reached the pilot tenants, and whether the June/July
   rollup backfill has been re-run.
6. The Mk II decision and the status of the August 1 comms.
7. The retention change's effective date and the full 24-month MSA list.
8. Remediation status for SOC 2 exception 1, and an owner for the failover drill.
9. Anything between **July 23 and July 26** — the status log ends July 22, and several of the
   items above were moving when it stopped.
