# Decision Memo: Ferro Systems Vendor Escalation
**To:** Founder, Northline
**Re:** Response to Ferro's 10-day API shutdown notice
**Date:** Day 0 of 10

## Recommendation

Do **not** ship the in-house replacement inside the 10-day window. Buy time from Ferro first, then build the in-house job on a realistic schedule — with the retention decision made deliberately, not inherited as a side effect.

The finance framing ("get it live before day 10") is optimizing for the wrong constraint. The cost increase is real but survivable for a few weeks at 4x pricing. Shipping a data-handling change that silently converts a 30-day-deleted dataset into an indefinitely-retained one — for data your own ToS doesn't disclose being retained this way, without notifying users — is not survivable in the same sense. That's the actual deadline risk, and it's self-imposed.

## 1. Build in-house, negotiate with Ferro, or both?

**Both, sequenced.** This isn't build-vs-negotiate — it's negotiate-now, build-properly-after.

- **Negotiate/delay first.** Ten business days' notice for a 4x price change on a live dependency is an aggressive move by Ferro, and vendors expect pushback. Ask for a 30-60 day extension at current pricing to execute an orderly migration. You have leverage: you're a paying customer being asked to accept a large, sudden change, and "we need time to migrate compliantly" is a completely standard, credible ask. Even a partial win (20 extra days) turns this from a scramble into a normal project.
- **Build in-house — yes, eventually.** The finance lead is right that 4x is worth escaping, and an in-house batch job is the correct end state if it's cheaper and gives you more control. But "can be built and deployed within 10 days" and "should be built and deployed within 10 days" are different claims. The engineering lead's estimate covers the batch job itself; it doesn't cover the retention/consent work item 2 below requires, and that work has its own timeline.

Rejected: staying on Ferro at 4x indefinitely. No reason to accept that once you have negotiating room and a viable alternative in progress.

## 2. What to do about the indefinite-retention side effect

Stop and fix this before shipping anything. Three separate problems, not one:

- **You don't actually control Ferro's deletion today.** You "trust the vendor's stated policy" with no visibility. That's a pre-existing gap, not new — but it's about to become directly relevant, because you're proposing to replace a system with *some* deletion discipline (even if unverified) with a system that has *none* by default.
- **Your ToS doesn't cover this.** "Usage analytics data that may be shared with processing partners to improve product features" does not disclose screen-level, timestamped, per-user behavioral tracking, and it says nothing about retention period at all. Bringing this in-house doesn't change what you're allowed to do with data you already collect — it changes what you're now *doing* with it (keeping it forever instead of ~30 days), and your users were told neither the original nor the new state.
- **Indefinite retention of screen-level usage data is a decision, not a byproduct.** It should be made on its own merits — is there a real product/business reason to keep this data forever? — not adopted because it fell out of an infrastructure migration nobody was thinking about at the data-governance level. If there's no affirmative reason to retain it indefinitely, don't. Set an explicit retention period (30 days is a reasonable default — it's the status quo Ferro established, so nothing gets worse for users by matching it) and build deletion into the batch job from day one.

**Action items before/alongside build:**
1. Set an explicit internal retention policy for the in-house job (recommend: match or beat Ferro's 30 days, unless there's a specific, defensible reason for longer — "it was easy to keep" is not one).
2. Update the ToS language to accurately describe what's collected (screen-level, timestamped usage) and how long it's kept. This is a small, fast legal/copy edit, not a redesign.
3. If you go beyond 30 days for any real reason, that's a materially different data practice than what current users agreed to — it needs affirmative disclosure (email/in-app notice), not a buried ToS update. Don't ship that quietly.

This is legal exposure reduction, not idealism: shipping indefinite retention of granular behavioral data under a ToS that doesn't mention it is the kind of thing that turns into a regulator complaint or a bad press cycle the first time a user notices, and "we didn't mean to, it was a side effect of a vendor switch" is not a defense anyone wants to be making.

## 3. Implementation plan

**Days 0-2: Negotiate with Ferro in parallel with everything else.**
Send a formal request for a 30-day extension at current pricing, framed around orderly migration and data-handling diligence (true, and vendors respond well to compliance framing). Worst case they say no and you've lost nothing — the build track below doesn't depend on their answer.

**Days 0-3: Data governance fixes (blocking — do this before any production build decision).**
- Decide retention period for the in-house job (default: 30 days, matching current behavior, unless there's a real reason otherwise).
- Draft the ToS language update.
- Draft user notice if retention will exceed current practice.
Owner: founder + whoever handles legal/compliance. This is the critical path — the engineering build should not proceed to production until this is settled, because retrofitting deletion logic after data has already accumulated indefinitely is a much worse conversation than building it in from the start.

**Days 3-10 (or 3-30+ if Ferro grants an extension): Build the in-house batch job.**
- Engineering builds the batch job as scoped, with the retention/deletion policy from step above built in as a first-class requirement, not a follow-up ticket.
- Include a scheduled deletion job (cron/batch) enforcing the retention period — this is a small addition on top of the read job the engineering lead already scoped, not a second project.
- Test cutover against Ferro output for a sample period before fully decommissioning Ferro, to catch discrepancies in the cohort-trends numbers before customers see them.

**If Ferro refuses any extension and the hard 10-day cutoff holds:**
Then the honest fallback is a short-term stopgap, not a rushed permanent build: negotiate a bridge (even a manual export/reduced-feature mode for 2-3 weeks) rather than shipping a production data-retention change with no governance review behind it. A brief "cohort trends temporarily degraded" is a minor product hit. Quietly starting indefinite storage of granular per-user behavior data under a stale ToS is not a minor hit — it's the kind of decision you don't get to easily undo once it's shipped and users have been operating under it. If Ferro truly won't budge at all, that tradeoff — a few weeks of degraded functionality vs. rushing consent and retention — is the one worth taking to the founder explicitly, today, rather than letting the 10-day frame make the call by default.

## Bottom line

The cost problem is real and worth fixing, but it isn't the deadline that matters here. The data-handling problem is created by *how* you fix the cost problem, and it's currently being carried along by an internal clock nobody set for that purpose. Push back on Ferro's timeline, fix the retention/disclosure gap on its own schedule, then build. Don't let "day 10" become the day you quietly started keeping every user's screen-by-screen activity history forever.
