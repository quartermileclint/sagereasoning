# R20a — Implementation Plan

**Status:** Proposed — founder approval required before any build begins
**Date:** 2026-04-15
**Related:** R20a (rule), ADR-R20a-01 (architecture), R17a (intimate data tiering)
**Execution window:** Priority 2 (Ethical Safeguards), item 2a

---

## 1. Purpose

This plan sequences the seven build artefacts named in ADR-R20a-01 §6 into phases the founder can review, verify, and approve one step at a time. It names the risk classification of each phase per project instructions §0d-ii, the verification method per §0c, and the rollback shape for Critical changes per §0c-ii.

This plan does not itself constitute approval to build. Each phase requires separate founder sign-off before execution. Phases marked Critical trigger the Critical Change Protocol in full each time.

---

## 2. Sequence overview

| Phase | Artefact | Risk | Approx. build time | Founder-verifiable output |
|---|---|---|---|---|
| A | Persistent footer (R20a §4) | Standard | Half a day | Open mentor page; confirm footer visible with 000 / Lifeline 13 11 14 / lifeline.org.au |
| B | `vulnerability_flag` Supabase table + RLS | **Critical** | Half a day | AI provides SQL query; founder runs it in Studio and confirms expected columns and policies |
| C | `/website/src/lib/r20a-rules.yml` initial rule set | Standard | One day | Founder reads the rule file; confirms each rule traces to a §2 indicator |
| D | `/website/src/lib/r20a-classifier.ts` two-stage evaluator | Elevated | One to two days | AI provides test inputs with expected risk scores; founder runs locally or via deployed endpoint |
| E | Worker process (Supabase Edge Function) | Elevated | One day | AI provides a test mentor input; founder submits it in staging and confirms a flag row appears in Studio |
| F | Studio saved query for reviewer queue | Standard | Two hours | Founder opens the saved query; sees pending flags, resolution buttons available |
| G | Classifier-down alert hook | Standard | Two hours | AI triggers a simulated failure; founder confirms the alert arrives |
| H | Compliance audit log entry | Standard | 15 minutes | Founder reads the entry in `/compliance/compliance_audit_log.json` |

Total working time: roughly five to six working days of focused build, spread over the P2 window. No phase assumes more than one working day of founder attention.

---

## 3. Phase A — Persistent footer

**What gets built.** A React component added to the mentor UI and journal UI shells that displays the three crisis contacts as specified in R20a §4. Non-dismissible. Muted styling, below main content. No logic beyond static display.

**Risk classification.** Standard. Additive UI change with no effect on authentication, data, or existing behaviour.

**Why this phase first.** The footer delivers the acute-crisis narrowing immediately with no dependency on any other artefact. If the build stalls later, this alone provides meaningful safety value. It is the lowest-risk, highest-immediate-value step.

**Dependencies.** None.

**Verification method.** Founder opens the mentor page and the journal page in a browser. Confirms the footer is visible on both. Confirms the three contacts match R20a §4 exactly. Confirms the footer cannot be closed or dismissed.

**Rollback.** If the footer causes layout issues, remove the component import. No data implications.

---

## 4. Phase B — Database table and RLS policy

**What gets built.** A new Supabase table `vulnerability_flag` with the columns listed in R20a §5. Row-Level Security policies matching R17a Tier C (owner read, support-role read with audit log). A migration file checked into the repo.

**Risk classification. Critical.** This creates new access control surface. The Critical Change Protocol applies in full before execution.

**Why this phase second.** Every downstream artefact writes to or reads from this table. Nothing else can be tested without it.

**Dependencies.** R17a Tier C support-role audit table (`support_access_log`) must already exist. If it does not, it is a prerequisite.

**Critical Change Protocol (to be completed in session before deploy):**

- What is changing: adding a new table and RLS policies to the production database.
- What could break: an incorrect RLS policy could expose Tier C data to unauthorised roles. An incorrect migration could lock the database temporarily during deploy.
- What happens to existing sessions: no existing user data is touched. Signed-in users are unaffected.
- Rollback plan: drop the table (`DROP TABLE vulnerability_flag CASCADE;`). No data loss because no rows have been written. AI provides the exact rollback command at deploy time.
- Verification step: founder runs a Studio query showing the table structure and the policy list; confirms owner-only read and support-with-audit read are both in place.
- Explicit approval: required on the RLS policy text specifically, not just the table structure.

**Verification method.** AI provides three Studio queries: one that lists the columns and types, one that lists the RLS policies, one that attempts an unauthorised read and fails. Founder runs each and confirms results.

---

## 5. Phase C — Rule set (YAML file)

**What gets built.** `/website/src/lib/r20a-rules.yml` containing the initial rule set. Rules correspond to the six indicators in R20a §2. Each rule has an identifier, a pattern (regex or phrase list), a severity assignment, and a human-readable description tracing back to the §2 indicator.

**Risk classification.** Standard. No effect on production until the classifier reads the file (Phase D).

**Why this phase third.** The classifier needs the rule file to function. Drafting the rules separately from the classifier code keeps the review scope small — the founder reads rules without reading TypeScript.

**Dependencies.** R20a §2 (already adopted).

**Verification method.** Founder reads the YAML file directly. Each rule must trace to a §2 indicator. Any rule that does not trace is either rewritten or removed before merge.

**Rollback.** Standard git revert if rules turn out badly calibrated. Revert does not affect existing flag rows.

---

## 6. Phase D — Classifier module

**What gets built.** `/website/src/lib/r20a-classifier.ts`. A function that takes a mentor input (and the mentor's response), runs the rule set from Phase C, and for any borderline case calls Anthropic Haiku with a prompt derived from R20a §2. Returns a structured result: severity (0–3), triggered rules, and a reference to the session row.

**Risk classification.** Elevated. Introduces a new external dependency (Anthropic API call for the classifier use case). Changes the data handling surface: mentor content is now passed to a model for evaluation.

**Why this phase fourth.** The classifier is where the detection quality lives. Building it in isolation, before wiring to the production pipeline, lets us test it on synthetic inputs without touching user data.

**Dependencies.** Phases B and C complete. Anthropic API key with separate billing identifier for classifier calls (so R5 cost tracking can distinguish classifier from mentor spend).

**Verification method.** AI provides a test harness: twelve synthetic inputs covering the six §2 indicators plus six clearly-non-crisis examples. Each has an expected severity. Founder runs the harness locally or in a staging endpoint. Pass criterion: at least 11 of 12 match expected severity exactly; any mismatch is documented before merge.

**Rollback.** Phase D is not yet in the production pipeline, so "rollback" means removing the module. No user impact.

---

## 7. Phase E — Worker process

**What gets built.** A Supabase Edge Function (or equivalent server-side worker) that is invoked on every mentor session write. The worker runs the classifier from Phase D and writes a flag row to the table from Phase B if severity exceeds threshold. The mentor response path is not touched — the worker runs in parallel, off-path.

**Risk classification.** Elevated. First live integration. Error handling here determines whether R20a actually protects users.

**Why this phase fifth.** The worker is where the pipeline becomes real. Everything before this can be tested in isolation; the worker is the first artefact that runs on real mentor traffic.

**Dependencies.** Phases B, C, D complete. Staging environment available for end-to-end testing before production deploy.

**Verification method.** Two-part. First, AI provides three synthetic mentor-session inserts in staging. Founder confirms each produces the correct severity flag row in Studio. Second, founder submits three innocuous real mentor inputs in staging. Founder confirms no flag rows appear. Production deploy is gated on both parts passing.

**Rollback.** Disable the Edge Function trigger (one-line config change). Mentor pipeline continues to work; classifier simply stops running. No data implications.

---

## 8. Phase F — Reviewer queue (Studio saved query)

**What gets built.** A saved SQL query in Supabase Studio that selects all unresolved rows from `vulnerability_flag`, sorted by severity descending then creation time. Reviewer opens the query during support hours, clicks into each row to view details, uses a second saved query or a Studio edit to mark rows resolved.

**Risk classification.** Standard. Configuration only, no code.

**Why this phase sixth.** The queue is where the founder's daily R20a responsibility lives. It comes after the worker so there are real rows to review against.

**Dependencies.** Phase E running in production with at least one real flag row (may be a test flag deliberately inserted during Phase E verification).

**Verification method.** Founder opens the saved query, confirms the test flag row is visible, confirms the severity and excerpt_ref fields are readable, confirms the resolution field can be updated.

**Rollback.** Delete the saved query. Reviewer can query the table directly by hand in the interim.

---

## 9. Phase G — Classifier-down alert hook

**What gets built.** A notification hook that fires when the classifier fails (Anthropic API unavailable, rate limit, worker error). Alert goes to the founder's preferred channel (email or SMS — to be chosen). Writes a marker row with timestamp and error reason. Once the classifier recovers, the marker row's end timestamp is written.

**Risk classification.** Standard. Additive alerting, no production impact.

**Why this phase seventh.** Alerting is not urgent in the first days of R20a being live (you'll know if it breaks because you'll be checking), but it is required before R20a can be considered "Wired" per the shared vocabulary.

**Dependencies.** Phase E running in production. Alert channel chosen.

**Verification method.** AI triggers a simulated classifier failure by forcing an API error in staging. Founder confirms an alert is received on the chosen channel. Founder confirms a marker row appears in the database with the correct timestamp.

**Rollback.** Disable the alert. Classifier outages become silent again; Phase D-E still function.

---

## 10. Phase H — Compliance audit log entry

**What gets built.** A single entry in `/compliance/compliance_audit_log.json` recording that R20a is now live in production, with date, phase completions, verification outcomes, and the declared first-review date (three months out per R20a §7).

**Risk classification.** Standard.

**Why this phase last.** Closes the loop. R20a is live once this entry is written.

**Dependencies.** Phases A–G complete and verified.

**Verification method.** Founder reads the entry. Confirms all verification outcomes from prior phases are recorded accurately. Confirms the next-review date is set to three months from today.

---

## 11. What changes when the pipeline is live

- R20a's implementation status in `/compliance/R20a-vulnerable-user-protections.md` moves from "Designed" to "Wired" (per §0a vocabulary).
- The R20a quarterly review clock starts. First review due three months from the date of Phase H.
- The R5 cost tracker gains a new line item for classifier spend. If it exceeds 20% of mentor-turn cost in any month, ADR-R20a-01 is reopened per the ADR §7 compliance note.
- The mentor pipeline is otherwise unchanged. No existing user-facing behaviour alters. The only user-visible addition is the persistent footer from Phase A.

---

## 12. Prerequisites before any phase begins

These are checks to run once, before Phase A:

- [ ] Confirm Anthropic API access is provisioned with a separate billing tag for the classifier use case
- [ ] Confirm staging environment exists and mirrors production schema
- [ ] Confirm `support_access_log` table from R17a is in place (prerequisite for Phase B RLS)
- [ ] Confirm the Australian public holiday calendar source for §4 support-hours SLA is chosen
- [ ] Confirm alert channel for Phase G (email, SMS, or other)
- [ ] Confirm the founder has Supabase Studio access with sufficient role to create tables, policies, and saved queries

If any prerequisite is missing, the plan does not start until it is resolved.

---

## 13. Open items flagged by this plan

- **Phase F will become inadequate when a second reviewer joins.** Studio is fine for one person; two or more reviewers need resolution-state locking and reviewer assignment, which is a Phase F v2.
- **Severity threshold numeric cut-points are not yet set.** The classifier in Phase D needs numeric thresholds before it can categorise inputs into severity 1/2/3. Founder input required during Phase D — AI will propose defaults derived from R20a §2 language, founder approves.
- **Outreach message templates are not yet drafted.** R20a §8 ops placeholder. Needed before the first real flag is actioned. Recommend drafting in parallel with Phase E.
- **Clinical and legal review (P3) may recommend threshold amendments.** Any amendment arriving after Phase H is live follows the Critical Change Protocol.

---

*This plan stays in `/compliance/` alongside R20a and ADR-R20a-01 as the reference for the P2 2a build. It is not itself a build authorisation. Each phase requires founder sign-off before execution.*
