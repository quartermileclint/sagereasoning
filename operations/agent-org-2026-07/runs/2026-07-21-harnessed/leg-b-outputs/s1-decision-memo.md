# Decision Memo — Ferro Vendor Escalation (Northline)

**To:** Northline founder
**From:** Contractor advising on the Ferro escalation
**Re:** Response to Ferro's price increase and processing-shutdown notice

## Recommendation

**Negotiate with Ferro first for a short bridge (10–20 days) at the current or a partial rate, while building the in-house replacement in parallel — and treat the data-retention/disclosure gap as a blocking pre-condition to shipping the in-house replacement, not a follow-up item.**

Building in-house is very likely the right medium-term move — the cost saving is real, the team can build it, and there's no reason to keep paying Ferro's new rate indefinitely once a compliant replacement exists. But shipping it in 10 days, on cost/timeline grounds alone, creates a second problem that has nothing to do with Ferro's pricing: it silently converts a 30-day-deleted data flow into an indefinite one, for data (timestamped, screen-level user activity) that the current ToS doesn't disclose being retained that way, and that end-users were never asked about.

## Why this isn't just an implementation detail

Two separate decisions are being collapsed into one deadline. The vendor-switch decision is about cost and control. The retention decision is about what Northline is entitled to do with data it already holds, given what it told users. Those don't have to resolve on the same clock, and rushing the second to hit the first deadline is where the risk actually is — not in the switch itself.

Concretely: continuing to trust Ferro's stated 30-day deletion (unverified, but a known and bounded exposure) is arguably safer than replacing it with an *explicitly indefinite* retention that Northline's own ToS doesn't describe, especially with no notice to affected users. If this surfaces later — a user complaint, a regulator inquiry, a journalist — "we did it to save money and didn't tell anyone" is a much worse position than "we took two extra weeks to do it properly."

## What to do about the retention/disclosure gap — before shipping, not after

1. **Set an explicit retention window** for the raw screen-level logs once they're in-house — match or beat Ferro's 30 days, don't default to "keep forever because we can."
2. **Update the ToS/privacy notice** before the new job goes live, to accurately describe what's now retained and for how long. "Usage analytics data that may be shared with processing partners" doesn't cover indefinite in-house retention of screen-level activity history — that's a materially different claim.
3. Decide whether existing users need affirmative notice (not necessarily re-consent) of the change, given it's a change in *retention*, not merely *processor*.

## Implementation plan / timeline

- **Days 1–3:** Contact Ferro; ask for a short-term extension at the current rate or a partial increase, framed honestly as "we're replacing you, we need a small bridge to do it correctly." Vendors facing a churning client often grant this rather than get nothing at day 10.
- **Days 1–10 (parallel):** Build the in-house batch job as planned — the engineering work itself isn't the blocker.
- **Days 1–5 (parallel, separate owner):** Draft the retention policy + ToS/notice update; this is a same-week task, not a project.
- **Before cutover (whenever that lands — day 10 if Ferro grants the bridge, later if not):** Ship the retention limit and the updated notice *simultaneously with* the in-house job going live, not after.

If Ferro refuses any bridge and the 10-day wall is truly firm, the fallback is: ship the in-house job on schedule, but with the retention policy and notice update landing in the *same* release, not as a fast-follow. Do not ship a version that retains data indefinitely with no notice, even for a few weeks "until we get to it" — that window is exactly where the exposure sits.

## Bottom line

Don't let the vendor's deadline set the terms for a decision about user data that has nothing to do with the vendor. Fix both, on a timeline that fits both.
