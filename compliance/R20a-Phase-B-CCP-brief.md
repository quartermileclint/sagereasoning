# R20a Phase B — Critical Change Protocol Brief

**Prepared:** 2026-04-16
**For:** Founder review before Phase B CCP session begins
**Status:** Prerequisites resolved (2026-04-16) — ready for CCP session

---

## Purpose of this document

Phase B creates the `vulnerability_flag` database table and its Row-Level Security policies. It is classified **Critical** because it creates a new access-control surface in the production database. This brief follows the Critical Change Protocol (project instructions 0c-ii) so the founder can review, question, and approve before any SQL runs.

This brief does NOT constitute build authorisation. Phase B execution happens in a dedicated CCP session after the two prerequisites below are resolved.

---

## Two prerequisites before the CCP session

### Prerequisite 1 — Outreach message templates per severity (R20a 8)

R20a 8 lists "Outreach message templates per severity" as an open ops placeholder. The `vulnerability_flag` table schema must enforce what the outreach process promises. Specifically:

- The `resolution` column accepts values: `no_action`, `passive`, `outreach`, `escalated`. These map directly to severity-driven SLA actions in R20a 4.
- If the outreach templates commit to specific wording (resource lists, tone, contact details), the schema should store an `outreach_template_version` or similar reference so the audit trail proves which template was sent for each flag.

**Founder decision (2026-04-16):** Audit-log-level tracking. No per-row `outreach_template_ref` column. Template versions are recorded in `/compliance/compliance_audit_log.json` when templates are adopted or amended. The `vulnerability_flag` schema stays as specified in R20a 5 — no additional column.

Outreach template content (the actual wording per severity) remains an open R20a 8 placeholder to be drafted before Phase E wires the pipeline. Phase B does not depend on template wording — only on the tracking decision, which is now resolved.

### Prerequisite 2 — Tier C RLS wiring is a separate CCP session

R17a 7 states that wiring Tier C field-level RLS policies on the intimate-data tables is "deferred to a second Critical Change Protocol session." Phase B creates the `vulnerability_flag` table with its own Tier C policies, but it does NOT touch the existing intimate-data tables (`health_conditions`, `mental_health_notes`, `home_address`, `name`, etc.).

**Founder decision (2026-04-16):** Confirmed. Tier C field-level RLS on existing tables happens in a separate CCP session after Phase B stabilises in production. Phase B's scope is limited to:

- Creating the `vulnerability_flag` table
- Applying RLS policies to that table only
- Confirming the table references `support_access_log` and `support_decrypt_request` (already live per CCP-R17a-01, verified 2026-04-16)

This is not the session where we retrofit RLS onto every Tier C field in the system. That work has its own risk profile and deserves its own protocol review.

---

## (a) What Phase B changes

**One new table.** `vulnerability_flag` in the production Supabase database with 10 columns as specified in R20a 5:

`flag_id`, `user_id`, `session_id`, `severity`, `triggered_rules`, `excerpt_ref`, `reviewer_id`, `reviewer_notes`, `outreach_sent_at`, `resolution`

Plus standard metadata columns (`created_at`, `updated_at`).

**Two RLS policies on that table:**

1. **Owner read** — `auth.uid() = user_id`. The user can see their own flag records.
2. **Support-with-audit read** — support role can read rows only when a corresponding `support_decrypt_request` row exists, is approved, and has not expired. Every support read is logged to `support_access_log`.

**One migration file** checked into the repo under the Supabase migrations directory.

**Server-side encryption** of `reviewer_notes` and `triggered_rules` using the existing `MENTOR_ENCRYPTION_KEY` pipeline (R17a 3, `server-encryption.ts`).

**What is NOT touched:**

- No existing tables are altered
- No existing RLS policies change
- No user data is read, moved, or modified
- No application code changes (the table exists but nothing writes to it until Phase E)
- No authentication or session management changes

---

## (b) What breaks if Phase B rolls back

**Very little.** Phase B creates an empty table. No application code writes to it yet (that's Phase E). No user-facing behaviour depends on it.

If we roll back:

- The `vulnerability_flag` table is dropped. Zero rows are lost because no rows have been written.
- Phases C and D (rule file and classifier module) can still be built and tested in isolation — they don't require the table to exist until Phase E wires them together.
- Phase A (the persistent footer) is completely unaffected. Users still see crisis contacts.
- All existing RLS policies on all existing tables remain unchanged.
- Authentication, sessions, and mentor pipeline are completely unaffected.

**The one thing rollback costs:** time. If Phase B is rolled back, it must be re-done before Phase E can proceed. But there is no data loss, no user impact, and no security regression.

---

## (c) Rollback plan

Exact command the founder can run independently in Supabase Studio SQL editor:

```sql
DROP TABLE IF EXISTS vulnerability_flag CASCADE;
```

This removes the table and its RLS policies. No other table references `vulnerability_flag` (no foreign keys point to it), so `CASCADE` is a safety net, not a risk.

If the migration file was committed to git, revert it:

```bash
git revert <commit-hash>
git push
```

The AI will provide the exact commit hash at deploy time.

**Rollback does not require the AI.** The founder can execute both steps independently using Studio and the terminal.

---

## (d) Verification step

After Phase B deploys, the founder runs three queries in Supabase Studio. The AI will provide exact copy-paste SQL at deploy time. Here is what they confirm:

**Query 1 — Table structure exists with correct columns:**

Expected result: a row for each of the 10+ columns with correct types (`uuid`, `integer`, `text`, `timestamptz`, etc.).

**Query 2 — RLS policies are active:**

Expected result: two policies listed — `owner_only_access` (or similar name) and `support_with_audit` (or similar name). Both should show `USING` expressions matching the templates in R17a 5.

**Query 3 — Unauthorised read fails:**

The AI provides a query that attempts to read from `vulnerability_flag` without matching `auth.uid()` or the support-role path. Expected result: zero rows returned (not an error — RLS silently filters, it doesn't throw).

**Pass criteria:** All three queries return expected results. If any query fails, Phase B is not verified and the CCP session stays open until the issue is resolved or the rollback is executed.

---

## (e) Explicit approval gate

Phase B requires the founder's explicit approval on two specific items before any SQL runs:

1. **The table schema** — column names, types, and the content-separation rule (the table stores `excerpt_ref`, not the mentor content itself).
2. **The RLS policy text** — the exact SQL for both policies. The founder reviews the policy expressions, not just a description of what they do.

Approval must be given in the CCP session conversation. "OK" or "go ahead" on the named items. General approval ("just do it") is not sufficient for Critical changes per 0c-ii.

---

## Data hygiene flag

Clinton's practitioner profile (mentor profile, journal entries, passion diagnostics) must NOT be loaded into the CCP session. Phase B is a schema-creation task. It requires no user data — real or synthetic. If the AI needs to demonstrate RLS behaviour, it uses synthetic test data created during the session. The founder's own intimate data stays in its Tier B encryption boundary and is irrelevant to this work.

---

## Summary for founder review

| Item | Status |
|---|---|
| Phase A (footer) | Verified, live on 9 routes |
| R19 /score framing | Locked (2026-04-16) |
| Prerequisite 1: outreach templates | Resolved — audit-log tracking, no extra column |
| Prerequisite 2: Tier C RLS is separate session | Resolved — confirmed separate |
| Phase B CCP session | **Verified and closed (2026-04-16)** |
| Tier C field-level RLS (R17a 7) | Separate CCP session, after Phase B stabilises |

**Next step:** Resolve the two prerequisites. Then open the Phase B CCP session with this brief as the reference document.

---

*This brief references: R20a 4, R20a 5, R20a 8, R17a 3, R17a 5, R17a 7, R20a implementation plan 4, project instructions 0c-ii and 0d-ii.*
