# R20a — Vulnerable User Protections

**Rule status:** Adopted (15 April 2026)
**Implementation status:** Phases A and B Verified (2026-04-16). Phase A: persistent footer live on 9 routes. Phase B: `vulnerability_flag` table, 3 RLS policies, and `vulnerability_flag_owner_view` deployed to production. Phases C–H remain Designed.
**Last reviewed:** 2026-04-16
**Next review due:** 2026-07-15 (quarterly cadence per §7)
**Owner:** Founder (Clinton Aitkenhead) — to reassign when support role is filled

---

## 1. Purpose

Establish the boundary between philosophical practice and practitioner distress that requires human intervention. Per the ethical analysis, protections for vulnerable users are not optional. R20a defines when SageReasoning must step outside its role as a Stoic companion and route the user to human support.

This rule is grounded in a Stoic distinction: the passions (*lupe*, fear, and related affects) are the proper subject of philosophical practice. A practitioner experiencing *lupe* is not in crisis — they are in the exact state Stoic method is designed to address. Crisis begins when the faculty that does the examining is itself compromised. R20a's threshold is therefore not distress but the absence of capacity to reason about distress.

R20a sits alongside R17a (intimate data protection) and inherits R17a's Tier C access controls for any record that captures a flag event.

---

## 2. Detection threshold

### The line in one sentence

**The threshold is incapacity to examine distress — acute panic, dissociation, suicidal ideation, and related states in which the reasoning faculty is itself compromised — not distress itself.** Practitioners experiencing grief, anxiety, fear, anger, shame, or any passion that remains open to examination are exactly who the mentor is designed to serve. They should engage the system, and the system should meet them without flagging. A flag is raised only when the faculty that would do the examining has been overtaken — when panic, dissociation, or ideation has closed the door on reasoning for the present moment. This distinction governs classifier training (Phase C of the implementation plan), reviewer judgement (R20a §4), and any future amendments to the signal set below. Any proposed rule change in Phase C that would flag ordinary passion rather than incapacity must be rejected as a threshold violation.

### Signals that trigger a flag

A mentor session input is flagged only if it exhibits at least one indicator that the user cannot, in that moment, engage in the examination their own entries invite:

| Indicator | Description |
|---|---|
| Concrete means, time, or method | User names a specific method, location, or time for ending their life or harming another |
| Explicit statement of intent | Direct statement of intent to end one's life or harm another, not framed reflectively |
| Loss of orientation | Dissociative markers — loss of person, time, or place orientation |
| Command experiences | Reports of voices or compulsions controlling action, in the present tense |
| Explicit refusal of reasoning | "I can't think", "nothing I work out will help", paired with present-tense despair |
| Sustained disengagement from counter-proposition | Across a session, each Socratic prompt returns content that does not engage the prompt — reasoning faculty is not responsive |

### Signals that do NOT trigger a flag

The following are within the proper subject matter of Stoic practice and are not treated as crisis signals:

- Grief, sorrow, loneliness, regret, shame, guilt, anger, disappointment, fear, worry
- Reports of therapy, medication, diagnoses, or past suicidal ideation discussed reflectively
- Philosophical despair about progress, frustration with the method, negative self-assessment expressed reflectively
- Expressions of passion (in the Stoic sense) that remain open to examination

The threshold protects both the user and the practice. Flagging ordinary distress would either over-refer (dissolving the philosophical relationship into risk management) or desensitise the system (blunting genuine escalation signals).

---

## 3. Detection architecture — asynchronous queue

Detection is asynchronous. Mentor responses are served normally and are not blocked by classifier evaluation.

### Flow

1. User submits mentor input. Mentor responds normally and immediately.
2. In parallel, the input and the mentor's response are passed to a classifier (rule-based detectors plus a small-model evaluation) that emits a risk score and category.
3. Inputs scoring at or above the flag threshold write a row to the `vulnerability_flag` table.
4. The moderation queue is reviewed at a declared cadence during declared support hours.
5. The queue reviewer decides: no action / passive nudge / direct outreach / escalation.

### Constraints this places on the rest of the system

**Mentor session design.** The mentor remains stateless with respect to the flag. It does not know a user was flagged in a previous turn. This is deliberate: it preserves the philosophical relationship and avoids the moralising tone shifts that flag-aware mentors exhibit. If the mentor is later given flag-awareness, that is a Critical change per §0c-ii.

**Rate limiting.** Standard rate limits apply regardless of flag state. There is no "paused session" state. The asynchronous model does not block submissions, so nothing in the mentor pipeline needs a session-resume gate.

**Latency budget.** Classifier runs in a separate worker and does not sit on the mentor response path. No user-facing latency is added.

**Cost model.** Classifier evaluation is a per-input small-model call, cheaper than mentor generation. Exact cost per session is to be observed during the P0 hold point (0h).

---

## 4. Redirection protocol

### Declared support hours

Support hours are **09:00–17:00 AEST, Monday–Friday** (excluding Australian public holidays). All SLAs below reference this window.

### Persistent UI resources

The mentor interface, journal interface, and founder-hub display a persistent footer with three crisis contacts, visible on every page where a user can interact with the mentor, journal, or reflective tools. The founder-hub is included as a precautionary measure ahead of its planned user-facing release; `/score` is excluded — assessment results are covered separately under R19 honest positioning (interpretive scaffolding). Exact wording is held in the UI component (`/website/src/components/SupportFooter.tsx`); the contacts are:

- **000** — emergency services
- **Lifeline 13 11 14** — 24/7 crisis support
- **lifeline.org.au** — web chat and resources

Presentation is muted: small type, neutral colour, below the main content. The goal is a visible exit without changing the register of the product. The footer is non-dismissible.

**Routes carrying the footer (as of 2026-04-16):** `/mentor-hub`, `/private-mentor`, `/journal`, `/journal-feed`, `/passion-log`, `/premeditatio`, `/oikeiosis`, `/scenarios`, `/founder-hub`. Each route has a per-route `layout.tsx` that imports the `SupportFooter` component. The root layout is not modified; non-listed routes do not display the footer.

**Routes explicitly excluded:** `/score`, `/score-document`, `/score-policy`, `/score-social`. Assessment result pages are not R20a surfaces; the vulnerability concern on `/score` (hasty assent to shame when reading passion diagnostics) is addressed under R19 honest positioning via interpretive scaffolding — see §8 open items.

This closes part of the acute-crisis gap at low operational cost: a user in immediate danger has a visible self-route at any time, independent of the async queue.

### Resources (Australia primary)

| Situation | Resource | Contact | Availability |
|---|---|---|---|
| Immediate threat to life | Emergency services | 000 | 24/7 |
| Suicidal thoughts, crisis | Lifeline | 13 11 14 / lifeline.org.au | 24/7 |
| Depression, anxiety | Beyond Blue | 1300 22 4636 / beyondblue.org.au | 24/7 |
| Aboriginal and Torres Strait Islander support | 13YARN | 13 92 76 / 13yarn.org.au | 24/7 |
| Young people (5–25) | Kids Helpline | 1800 55 1800 / kidshelpline.com.au | 24/7 |
| Men's support | MensLine Australia | 1300 78 99 78 / mensline.org.au | 24/7 |
| International fallback | Befrienders Worldwide | befrienders.org | Varies by region |

These contacts are included verbatim in any outreach template and are visible to the queue reviewer alongside each flagged row.

### Response SLAs

| Severity | Signal | SLA | Action |
|---|---|---|---|
| 3 | Explicit means, explicit intent, command experience, or loss of orientation | Within 2 hours during declared support hours; routed to external services outside those hours | Reviewer sends resource list with brief, non-moralising message. Severity 3 escalates to the founder during support hours. |
| 2 | Sustained incapacity-to-reason without explicit means | Within 1 support-hour business day | Reviewer sends a brief offer of resources and an invitation to return when ready. |
| 1 | Borderline signal, single indicator, otherwise reflective | Review within 3 support-hour business days | Queue-only review. No user-facing action unless a pattern recurs across sessions. |

### Decision tree

1. Does the content name a specific means, time, or method? **→ Severity 3 outreach.**
2. Does the content report a present-tense command experience or loss of orientation? **→ Severity 3 outreach.**
3. Does the content show sustained disengagement from reasoning across the session without concrete means? **→ Severity 2 outreach.**
4. Is the signal borderline — single indicator, otherwise reflective? **→ Severity 1 queue review, watch for recurrence.**
5. When a flagged user returns? **→ Mentor session resumes normally.** There is no gated resume. The flag stays in the audit record but does not alter mentor behaviour.

---

## 5. RLS and encryption alignment with R17a

The `vulnerability_flag` record is Tier C intimate data and inherits R17a Tier C controls.

| Field | Tier | RLS | Notes |
|---|---|---|---|
| `flag_id` | C | owner read; support with audit | Primary key |
| `user_id` | C | owner read; support with audit | Links to user |
| `session_id` | C | owner read; support with audit | Links to mentor session |
| `severity` | C | owner read; support with audit | 1 / 2 / 3 |
| `triggered_rules` | C | owner read; support with audit | Which detectors fired |
| `excerpt_ref` | C | owner read; support with audit | **Reference only** — not the content itself |
| `reviewer_id` | C | support only; owner sees role, not identity | |
| `reviewer_notes` | C | support with audit | |
| `outreach_sent_at` | C | owner read; support with audit | |
| `resolution` | C | owner read; support with audit | no action / passive / outreach / escalated |

### Content separation rule

The flag row does NOT store mentor session content. It stores a reference (`excerpt_ref`) pointing to the existing Tier B session record. A reviewer who needs to see the content must decrypt via the standard Tier B / Tier C support access flow (R17a §5), which writes a row to `support_access_log`. This means reviewing a flag is never a zero-log operation, and the user can see that their mentor content was accessed in service of the flag review.

Server-side encryption of `reviewer_notes` and `triggered_rules` uses the same `MENTOR_ENCRYPTION_KEY` pipeline defined in R17a §3.

---

## 6. Known limitations — documented per R19c honest positioning

- **Acute crisis gap — narrowed, not closed.** The asynchronous model does not intervene in real time during an acute crisis. The persistent footer (§4) gives the user a visible self-route at any moment, which narrows the gap but does not close it. A user who does not use the footer and submits content to the mentor will receive a normal philosophical response until the queue reviewer sees the flag. This is an accepted limitation of the current architecture and operating model (solo founder, declared support hours). Disclosed to users via the limitations page (R19c) and the terms of service.
- **Classifier false negatives and false positives.** No classifier is complete. Metrics are reviewed quarterly (§7).
- **Out-of-hours coverage.** Severity 3 signals outside declared support hours rely on the user reaching external services directly through the footer or outreach channel. The product does not send outreach itself outside support hours; it queues outreach for the next support-hour window.
- **Clinical and legal review pending (rolled into P3).** The detection criteria in §2 are principled on the Stoic framing but have not yet been reviewed by a registered clinician or a lawyer with Australian digital-mental-health experience. Clinical review and legal review are scoped into Priority 3 per project instructions. R20a may be adopted on the founder's reasoning ahead of review; any amendments arising from review will follow the Critical Change Protocol.

---

## 7. Quarterly review cadence

R20a is reviewed every three months. Review covers:

- Flag volume by severity
- False positive rate — flags closed with no action because the signal was ordinary distress
- False negative audit — a random sample of recent mentor sessions scored post-hoc
- SLA compliance
- Decision-tree edits suggested by reviewers
- Resource list currency (Australian services update)
- Any incidents — outreach delayed, missed, or mishandled

Review output is logged to `/compliance/compliance_audit_log.json`. Any threshold change in §2, architectural change in §3, or RLS change in §5 follows the Critical Change Protocol (§0c-ii).

---

## 8. Placeholders for Ops

- [ ] Implementation status (Scoped / Designed / Scaffolded / Wired / Verified / Live)
- [x] Declared support hours — **09:00–17:00 AEST, Monday–Friday** (excl. Australian public holidays)
- [x] Always-visible crisis resources — **persistent footer adopted and built** (see §4). Component: `/website/src/components/SupportFooter.tsx`. Nine routes wired as of 2026-04-16. Founder verification pending before status moves to Verified.
- [x] `/score` interpretive scaffolding — implemented under R19 honest positioning (2026-04-16). Framing B adopted: "Before you read" panel appears above results, positions passions as examinable judgements (not character flaws), reframes low proximity scores as less-examined actions (not less-worthy persons), uses mirror metaphor. No footer addition; no pre-display prompt. Founder verification pending.
- [ ] Queue reviewer role and name
- [ ] Classifier choice and version — **see ADR-R20a-01 (classifier pipeline)**
- [ ] Severity thresholds — numeric cut-points, once classifier is chosen
- [ ] Outreach message templates per severity
- [ ] Support-hour escalation contact (founder, or nominated other)
- [ ] Quarterly review owner
- [ ] First review date (set on adoption)
- [ ] Public holiday calendar source (to operationalise the "excl. public holidays" rule)
- [ ] Clinical review engagement (P3)
- [ ] Legal review engagement (P3)

---

## 9. Change control

Any change to the detection threshold in §2, the asynchronous architecture in §3, or the RLS tiering in §5 follows the Critical Change Protocol. Changes to the Australian resource list in §4 (numbers, URLs) follow standard review without escalation, logged to the audit trail.

---

*R20a sits alongside R17a as a safeguard for practitioners who entrust their self-examination to SageReasoning. The rule is designed to protect the philosophical relationship: ordinary distress stays within the practice; compromised capacity to reason is routed to humans. Both directions of the threshold matter equally.*
