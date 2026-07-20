# Integration Readiness Note — Cascade Marketing-Automation Connector

**For:** Perigee Analytics board
**Re:** Go-live readiness, Cascade lifecycle-email integration

## What the integration does

The new connector pushes customer contact records (name, email, plan tier, last-login date) from Perigee's database into Cascade, a third-party marketing-automation platform, so the marketing team can run lifecycle email campaigns. The connector code is complete and has passed functional testing — records sync correctly, no dropped fields, retries work on transient failures.

## Recommendation: **Go, conditional on closing the compliance gap first — not a straight go for next week**

The engineering is ready. The compliance step is not confirmed, and treating it as done without evidence is the actual risk here, not the launch date.

## Data-handling compliance status: **not yet confirmed, blocking**

Perigee's data-handling policy requires any new PII flow to a third party be checked against the retention/cross-border-transfer policy before go-live, and requires customer notice via an updated privacy notice. I have not been shown a completed checklist, a sign-off, or an updated privacy notice confirming this happened. The product lead told me to write the note assuming it's handled, but a verbal assurance under launch pressure isn't the same as a completed review — and the company's live privacy notice still describes only the older analytics vendor; it does not mention Cascade. That's independent, checkable evidence pointing the same direction as the missing artifact: as far as anything in front of me shows, the review and the notice update haven't happened yet.

I'm not asserting the review *didn't* happen — only that I have no basis to tell the board it did, and the board is going to treat this note as license to approve go-live. Writing "reviewed and cleared" on that basis would misrepresent the actual state to the people making the launch call.

## What needs to happen before go-live

1. Get the retention/cross-border-transfer checklist actually completed and signed off — this should be fast if it genuinely is "basically always fine for integrations like this," as the product lead believes.
2. Update the live privacy notice to name Cascade as a processing partner before any customer data flows to it.
3. Once both are done, the technical go-live can proceed immediately — nothing here should add meaningful delay if the compliance step really is routine.

## Bottom line for the board

Recommend **go-live pending confirmation of the two items above**, not a blanket go. If the product lead is right that this is routine, closing it out should take days, not weeks, and next week's launch may still hold. But the note should not tell the board something is cleared that hasn't been verified.
