# R20a — Vulnerable User Protections

**Status:** [PLACEHOLDER — ops to set: Scoped / Designed / Scaffolded / Wired / Verified / Live]
**Last reviewed:** [PLACEHOLDER — ops to set: YYYY-MM-DD]
**Next review due:** [PLACEHOLDER — quarterly from adoption date]
**Owner:** [PLACEHOLDER — ops to assign]

---

## 1. Purpose

Establish the boundary between philosophical practice and practitioner distress that requires human intervention. Per the ethical analysis, protections for vulnerable users are not optional. R20a defines when SageReasoning must step outside its role as a Stoic companion and route the user to human support.

This rule is grounded in a Stoic distinction: the passions (*lupe*, fear, and related affects) are the proper subject of philosophical practice. A practitioner experiencing *lupe* is not in crisis — they are in the exact state Stoic method is designed to address. Crisis begins when the faculty that does the examining is itself compromised. R20a's threshold is therefore not distress but the absence of capacity to reason about distress.

R20a sits alongside R17a (intimate data protection) and inherits R17a's Tier C access controls for any record that captures a flag event.

---

## 2. Detection threshold

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

- **Acute crisis gap.** The asynchronous model does not intervene during an acute crisis. If a user in imminent danger submits content, the mentor continues to respond in its normal philosophical register until a reviewer sees the flag. This is an accepted limitation of the current architecture and operating model (solo founder, declared support hours). It is disclosed to users via the limitations page (R19c) and the terms of service.
- **No always-visible resources in the current rule.** R20a as drafted does not mandate surfacing crisis resources in the mentor UI. A persistent footer link to 000 / 13 11 14 / lifeline.org.au would be compatible with the async model and would partly close the acute-crisis gap at very low operational cost. Flagged for founder review — decision deferred to first quarterly review or earlier.
- **Classifier false negatives and false positives.** No classifier is complete. Metrics are reviewed quarterly (§7).
- **Out-of-hours coverage.** Severity 3 signals outside declared support hours rely on the user reaching external services directly. The product does not send outreach itself outside support hours; it queues the outreach for the next support-hour window and the resource list is the user's immediate route.

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
- [ ] Declared support hours
- [ ] Queue reviewer role and name
- [ ] Classifier choice and version
- [ ] Severity thresholds — numeric cut-points, once classifier is chosen
- [ ] Outreach message templates per severity
- [ ] Support-hour escalation contact (founder, or nominated other)
- [ ] Quarterly review owner
- [ ] First review date (set on adoption)
- [ ] Decision on always-visible crisis resources (see §6, limitation 2)

---

## 9. Change control

Any change to the detection threshold in §2, the asynchronous architecture in §3, or the RLS tiering in §5 follows the Critical Change Protocol. Changes to the Australian resource list in §4 (numbers, URLs) follow standard review without escalation, logged to the audit trail.

---

*R20a sits alongside R17a as a safeguard for practitioners who entrust their self-examination to SageReasoning. The rule is designed to protect the philosophical relationship: ordinary distress stays within the practice; compromised capacity to reason is routed to humans. Both directions of the threshold matter equally.*
