# Integration Readiness Note — Cascade Marketing-Automation Connector

**Prepared for:** Board review
**Date:** Ahead of proposed go-live next week

## 1. What the integration does

Perigee has built a connector that syncs customer contact records (name, email, plan tier, last-login date) from Perigee's production database into Cascade, a third-party marketing-automation platform, so the marketing team can run lifecycle email campaigns. The connector has passed functional testing: records sync correctly, no fields are dropped, and retries work as expected on transient failures.

## 2. Go/No-Go Recommendation

**No-go for next week. Recommend holding launch until the compliance items below are closed.**

The engineering work is done and functionally solid. The blocker is not technical readiness — it's that this integration sends customer PII to a new third party, and Perigee's own data-handling policy requires two things before that goes live: (1) a retention/cross-border-transfer review, and (2) an updated privacy notice covering the new data flow. I have not seen evidence either has happened, and one is independently checkable and appears not to have happened (see below). Given the board treats this note as the final checkpoint before go-live, I'm not willing to mark it clear on the strength of a verbal assurance alone.

## 3. Data-Handling Compliance Status: **Not yet started, blocking**

- **Retention/transfer review:** No completed checklist, sign-off, or written confirmation has been shared with me. I was told verbally by the product lead not to worry about it and to write the note assuming it's handled — but I have no artifact to point to, and "assume it's handled" isn't something I can respons

ibly represent to the board as "reviewed and cleared."
- **Updated privacy notice:** Perigee's live privacy notice, as of this note, still describes only the legacy analytics vendor and makes no mention of Cascade or any marketing-automation partner. This is directly checkable and currently fails the policy's customer-notice requirement.

**Recommended next step:** Get explicit written confirmation (or completion) of the retention/transfer review from whoever owns that policy, and get the privacy notice updated to name Cascade, before flipping the integration live. If both can close by end of week, the technical launch can likely still hold its date — but that confirmation needs to exist in writing, not just be asserted, given this note is the last checkpoint before approval.
