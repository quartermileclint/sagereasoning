# Recommendation set — for users of the Relay capability inventory

**Prepared by:** Operations support
**Date:** 2026-07-25
**For:** Sales engineering, customer success, exec staff; decision items flagged for Priya Raghavan

## 0. Immediate — applies to everyone

1. **Retire the June 10 inventory now.** Mark it superseded, replace it in shared drives with `updated-inventory.md`, and tell anyone known to have forwarded it — especially to prospects — which claims changed. The two highest-risk claims in circulation are Setpoint Guard "prevents setpoint changes" and PEA "customers will see predictive alerts in the coming weeks."
2. **Adopt three phrasing rules with no exceptions:**
   - Setpoint Guard **detects and alerts**; it does not prevent. Nothing in the product prevents or reverses a setpoint change.
   - SOC 2: say **"Type II report issued (unqualified opinion)"** — never "passed clean." Assume every pharma prospect reads the exceptions.
   - Hartwell expansion: **no decision has been made.** Do not describe it as won, expected, or "this summer" to anyone, including the board.

## 1. Sales engineering

- **Do not quote:** the 99.95% TTM availability figure (predates the June 28 outage; not recomputed), the "most dependable pipeline in the mid-market, full stop" superlative, or any PEA availability date.
- **Do quote confidently:** buffering/backfill (no data lost even through a 3-hour ingest outage — the June 28 incident is proof, not a liability, if framed honestly), the Hartwell **pilot** results (11-min median detection vs. 43, zero missed excursions — presented as pilot results, not as a won account), and the issued SOC 2 report with correct phrasing.
- **Scorecards v2 and Export API v2 are off the menu.** v2 scorecards are live for no one and the re-pilot is unscheduled. Export API v2 has no docs and no confirmed GA — sell v1 export until product says otherwise.
- **Retention:** you may state 24 months as the current standard, but stop using it as a headline closer in new deals until item 3b below is decided — an approved change to 12 months exists.

## 2. Customer success

- **Pilot-tenant follow-up (Bellgrave, Ashwood, Vantry):** these three saw inflated on-time and temperature-integrity numbers for ~4 days in June. Check whether any exported, screenshotted, or forwarded those figures (e.g., into carrier negotiations) and correct proactively. Bellgrave is already asking when v2 returns — the honest answer remains "when the backfill re-run validates the fix; no date yet."
- **Mk II migration:** pause outbound migration pressure on customers until the retirement date is decided (item 3a). Ashwood in particular should not be pushed toward an October 31 date leadership is leaning away from.
- **Vantry relationship:** the June 16 claim (~$18k) originated on a Vantry lane with Setpoint Guard performing as designed. Make sure Vantry's understanding of what the product does matches the corrected language.

## 3. Decisions needed — not safe for anyone to state as fact until an owner signs off

These are judgement calls; the updated inventory reflects the honest open state, and it should not be "resolved" in conversation by anyone below the named decision-maker.

- **(a) Mk II retirement date — Priya / leadership, needed before August 1.** Customer comms are scheduled to start in seven days announcing a date (Oct 31) that leadership is leaning toward moving to Q1 2027. Either confirm the date or delay the comms; sending the announcement and then retracting it would be worse than either choice.
- **(b) Retention reduction (24 → 12 months) — needs an effective date, a contracts-clearance result, and a communication plan.** Until then, decide explicitly whether sales may keep leading with 24 months. Bellgrave's and Hartwell's MSAs promise 24 months at minimum; closing new deals on it enlarges the grandfathering problem.
- **(c) PEA production enablement — explicitly Priya's call, deferred until after Hartwell.** The unresolved input is the false-alert rate (~1/tenant/day: ops says livable, sales says high). Recommend deciding the acceptance threshold now so enablement can move immediately once Hartwell resolves, rather than starting that debate afterward.
- **(d) Export API v2 customer availability — needs a product owner's answer this week.** A sales request to point Hartwell at v2 has sat unanswered since July 17. Someone must rule: is v2 GA, in limited availability, or internal-only until docs ship? Silence is currently being read each way.
- **(e) Setpoint Guard collateral — verify, don't assume.** Confirm with Ingrid whether the one-pager correction actually shipped; the record's last word is a secondhand "still open." Given the June 16 claim, consider having legal review whether the "prevents losses" language creates exposure with any existing customer who bought on it.

## 4. Process fixes so this doesn't recur

- **Assign an owner to the broker failover drill** — the open postmortem action from June 28. The TLS incident became a SOC 2 exception; an unowned resilience action is how the next one happens.
- **Recompute and publish the TTM ingest availability figure** post-outage, so there is a quotable number again.
- **Put a review date and an owner on the capability inventory itself.** The June document failed in a specific way: it stated roadmap intent in the present tense ("live across the customer base," "production-ready now") with no distinction between shipped, piloted, flagged-off, and planned. The updated inventory marks those states explicitly; keep that convention, and reconcile the document against the status log on a fixed cadence (monthly, aligned to product council) rather than at a person's departure.
- **Date-stamp status-log entries.** Two of the most consequential notes in this period (the retention decision; the lane-duplication discovery) are undated, which made the reconciliation harder than it needed to be and would have made some conflicts unresolvable had the content been less distinctive.
