# Phase B — First-Principles RLS Design

**Prepared:** 2026-04-16
**Status:** Draft for founder review — no SQL until approved
**Data hygiene:** Zero individual profiles loaded. All inputs are abstract role definitions, data sensitivity tiers, and the R20a/R17a rule text.
**Governance decision:** Founder chose Option 1 (recuse from schema visibility). Recorded in compliance_audit_log.json.

---

## 1. Roles (derived from system architecture, not from who exists today)

These are the roles that will ever need to interact with the `vulnerability_flag` table. They are derived from the R20a pipeline architecture (§3) and the R17a support access model (§5), not from any current user list.

### Role 1: End user (owner)

**Who they are.** Any authenticated user of SageReasoning — human practitioner or API agent — whose mentor session triggered a flag.

**What they need.** Read access to their own flag records. They should be able to see that they were flagged, what severity was assigned, what resolution was reached, and when outreach occurred. They should never see another user's flag records.

**What they must not see.** The `reviewer_id` field exposes who reviewed their flag. Per R20a §5, the owner sees the reviewer's role but not their identity. This requires either a view that masks the field or a policy-level restriction. Design decision needed (see §4 below).

**Access pattern.** Occasional. A user checking their own history. Not a high-frequency query.

### Role 2: Queue reviewer (support agent)

**Who they are.** A person authorised to review the vulnerability flag queue during declared support hours (R20a §4). Currently the founder; eventually a dedicated support role.

**What they need.** Read access to all unresolved flag rows across all users. Write access to `reviewer_id`, `reviewer_notes`, `outreach_sent_at`, and `resolution`. Read access must be audited — every read writes a row to `support_access_log`.

**What they must not see.** The mentor session content itself. The flag row contains `excerpt_ref` (a pointer), not the content. To see content, the reviewer must follow the standard Tier B/C decrypt flow (R17a §5), which has its own audit trail.

**Access pattern.** Daily during support hours. Queries the queue sorted by severity descending. Updates resolution fields.

### Role 3: Classifier service (system/service role)

**Who they are.** The Edge Function worker (Phase E) that runs the classifier and writes flag rows.

**What they need.** Insert-only access. The service writes new rows when the classifier fires. It never reads existing rows (it doesn't need to know whether a user was previously flagged — each flag is independent per R20a §3).

**What they must not have.** Read access. Update access. Delete access. The service is a write-only pipe.

**Access pattern.** Per-mentor-session. One potential insert per mentor interaction.

### Role 4: Unauthenticated / anonymous

**What they need.** Nothing. Zero access. The table should not even be queryable — RLS returns zero rows, not an error.

### Role 5: Database administrator (Supabase service role)

**Who they are.** The service_role key used for migrations and emergency access.

**What they need.** Full access, bypassing RLS. This is Supabase's default for service_role. We don't write a policy for this — it's the absence of restriction. But we document it: service_role access to this table is reserved for migrations and emergency incident response, not routine operations.

---

## 2. Data sensitivity classification (per R17a tiering)

Each column is classified independently. The classification determines encryption and RLS behaviour.

| Column | Type | Sensitivity | Encryption | RLS | Rationale |
|---|---|---|---|---|---|
| `flag_id` | uuid | Operational (A) | None | Filtered by role | Primary key — no intimate content |
| `user_id` | uuid | Identifier (B) | None | Filtered: owner sees own; support sees via audit | Links to user identity |
| `session_id` | uuid | Identifier (B) | None | Same as user_id | Links to mentor session |
| `severity` | integer | Operational (A) | None | Filtered by role | Numeric score, no intimate content |
| `triggered_rules` | text[] | Intimate (C) | Server-side (MENTOR_ENCRYPTION_KEY) | Filtered by role | Reveals what distress signals were detected — intimate |
| `excerpt_ref` | uuid | Reference (A→C) | None | Filtered by role | Pointer only, not content. The referenced content is Tier C elsewhere |
| `reviewer_id` | uuid | Operational (A) | None | Owner sees role not identity; support sees full | Staff identity, not user data |
| `reviewer_notes` | text | Intimate (C) | Server-side (MENTOR_ENCRYPTION_KEY) | Support-with-audit only | Clinical/ethical observations about a user |
| `outreach_sent_at` | timestamptz | Operational (A) | None | Filtered by role | Timestamp only |
| `resolution` | text | Operational (A) | None | Filtered by role | Enum value (no_action/passive/outreach/escalated) |
| `created_at` | timestamptz | Metadata | None | Filtered by role | Standard |
| `updated_at` | timestamptz | Metadata | None | Filtered by role | Standard |

**Key design observations from this classification:**

1. Only two columns require server-side encryption: `triggered_rules` and `reviewer_notes`. Both contain intimate content about the user's psychological state.
2. The `excerpt_ref` is deliberately a pointer, not content. This is the content-separation rule from R20a §5. The table never stores mentor session text.
3. The `reviewer_id` has a split visibility rule: support sees the UUID, the owner sees a masked value (role label only). This needs an implementation decision (see §4).

---

## 3. RLS policies (derived from roles × sensitivity, not from observed data)

### Policy 1: Owner read

**Purpose.** An authenticated user can read rows where they are the flagged user.

**Rule.** `auth.uid() = user_id`

**Applies to.** SELECT only.

**What this gives the owner.** All columns except `reviewer_id` (masked — see §4) and `reviewer_notes` (excluded from owner view entirely). The owner can see: their flag_id, severity, triggered_rules (decrypted client-side if we go that route, or decrypted in a server function), excerpt_ref, outreach_sent_at, resolution, timestamps.

**What this prevents.** Owner cannot see any other user's rows. Owner cannot update or delete their own rows. Owner cannot insert rows (only the classifier service inserts).

**Universal by construction.** This policy uses `auth.uid()`, which is identity-agnostic. It works for any authenticated user regardless of whether they have a mentor profile, journal history, passion diagnostics, or none of the above. A user who was flagged on their very first session and has no other data in the system still matches this policy correctly.

### Policy 2: Support-with-audit read

**Purpose.** A queue reviewer can read flag rows for the purpose of triage and resolution, but only through an audited access path.

**Rule.** The requesting role is `support_agent` AND a corresponding row exists in `support_decrypt_request` where: the request is approved, the request has not expired, and the request's `target_user_id` matches the flag row's `user_id`.

**Applies to.** SELECT only (updates to resolution fields go through a separate server function that enforces its own audit, not through direct table UPDATE).

**What this gives the reviewer.** All columns including `reviewer_notes` (they wrote them) and `reviewer_id` (visible to support).

**What this prevents.** A support agent cannot read any flag row without an approved, unexpired decrypt request. Browsing the full table is not possible — each user's flags require a separate access request. Every read is logged to `support_access_log`.

**Universal by construction.** This policy does not reference any property of the flagged user's profile. It references the access-request chain. A user with no profile, a user with a full profile, a user who deleted their account and has orphaned rows — the policy works identically for all cases.

### Policy 3: Classifier insert-only

**Purpose.** The Edge Function service writes new flag rows.

**Rule.** The requesting role is `service_role` or a dedicated `classifier` Postgres role (to be decided — see §4). INSERT only.

**Applies to.** INSERT only. No SELECT, UPDATE, DELETE.

**What this prevents.** The classifier cannot read back what it wrote. It cannot modify or delete existing flags. It is a one-way pipe.

### Policy 4: Default deny

**Purpose.** Any request that does not match policies 1–3 gets zero rows.

**Rule.** Supabase RLS default behaviour: if no policy matches, the row is invisible. No error, no information leakage.

---

## 4. Open design decisions (founder input needed before SQL)

### 4a. Reviewer identity masking for owner view

R20a §5 says the owner sees the reviewer's role, not identity. Two implementation options:

**Option A: Database view.** Create a view `vulnerability_flag_owner_view` that replaces `reviewer_id` with a static string like `'support_reviewer'` and excludes `reviewer_notes` entirely. The owner-read RLS policy applies to this view. Pro: clean separation. Con: one more database object to maintain.

**Option B: Application-level masking.** The API endpoint that serves flag data to owners strips `reviewer_id` and `reviewer_notes` before returning. The RLS policy is on the table directly. Pro: simpler schema. Con: if a new endpoint is added without the masking logic, the data leaks.

**Founder decision (2026-04-16): Option A — database view.** Structural protection. The owner queries `vulnerability_flag_owner_view`, which replaces `reviewer_id` with `'support_reviewer'` and excludes `reviewer_notes`. The RLS owner-read policy applies to this view.

### 4b. Classifier role: service_role or dedicated Postgres role?

**Founder decision (2026-04-16): Option A — use existing service_role.** The Edge Function runs as `service_role`. Insert-only constraint is enforced at the function code level, not the database level. Documented limitation: `service_role` bypasses RLS, so the code must be reviewed (Phase E code review) to confirm it only performs INSERTs on this table.

### 4c. Account deletion cascade (R17c)

**Founder decision (2026-04-16): Option A — CASCADE delete.** Flag rows are deleted when the user exercises genuine deletion under R17c. Trade-off accepted: aggregate audit data for quarterly review (§7) is lost for deleted users. This is the simplest and most GDPR-aligned option. Noted for P3 legal review — if legal counsel recommends a different approach, the change follows the Critical Change Protocol.

---

## 5. Archetype validation plan

After the schema and policies are written (and before the CCP approval gate), I'll test each policy against these nine synthetic archetypes. Each test uses fabricated UUIDs and data — no real profiles.

| # | Archetype | Tests | Expected result |
|---|---|---|---|
| 1 | New user, no journal, no flags | SELECT from vulnerability_flag as this user | Zero rows (not error) |
| 2 | Active user with 3 flags at severity 1, 2, 3 | SELECT as this user | Exactly 3 rows, all belonging to this user |
| 3 | User flagged but has no mentor profile | SELECT as this user | Their flag rows visible; no join failure on missing profile |
| 4 | Two users — User A queries, User B has flags | SELECT as User A | Zero of User B's rows visible |
| 5 | Support agent with approved decrypt request for User B | SELECT as support agent | User B's flag rows visible; support_access_log row created |
| 6 | Support agent WITHOUT approved decrypt request | SELECT as support agent | Zero rows |
| 7 | Support agent with EXPIRED decrypt request | SELECT as support agent | Zero rows |
| 8 | API-only agent user (no human profile) flagged | SELECT as this agent-user | Their flag rows visible; schema doesn't assume human profile exists |
| 9 | Unauthenticated request | SELECT without auth context | Zero rows, no error, no table-existence leakage |

**Additional tests:**

| # | Test | Expected result |
|---|---|---|
| 10 | Classifier INSERT a new flag row | Row created successfully |
| 11 | Classifier SELECT after inserting | Zero rows (insert-only, no read-back) — if using dedicated role (4b Option B) |
| 12 | Owner attempts UPDATE on their own flag | Fails (no UPDATE policy) |
| 13 | Owner attempts DELETE on their own flag | Fails (no DELETE policy) |

---

## 6. What this document does NOT contain

- **No SQL.** SQL is written after you approve this design.
- **No real data references.** Every example uses synthetic UUIDs and fabricated scenarios.
- **No profile-shaped assumptions.** The roles, tiers, and policies were derived from R20a/R17a rule text and system architecture, not from any individual's data.
- **No severity threshold calibration.** That's Phase C/D work with the rule file and classifier. This document covers the container (table + policies), not the content (what triggers a flag).

---

## 7. Next steps (pending your review)

1. You review this document and the three open decisions (4a, 4b, 4c).
2. Once you've decided on those, I write the SQL for the table schema and RLS policies.
3. You review the exact SQL in the CCP session per the approval gate (CCP brief §e).
4. I run the archetype validation tests from §5 against the SQL.
5. You verify in Supabase Studio per the CCP brief verification step (§d).

Nothing proceeds past step 1 until you say so.

---

*This document was produced under the data hygiene protocol adopted 2026-04-16. No individual practitioner profiles were loaded or referenced during its creation. Design inputs: R20a §§2–5, R17a §§3–5, R20a implementation plan §4, Phase B CCP brief, and the project instructions §0a–0d.*
