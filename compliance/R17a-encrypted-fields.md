# R17a — Encrypted Fields Classification

**Status:** [PLACEHOLDER — ops to set: Scoped / Designed / Scaffolded / Wired / Verified / Live]
**Last reviewed:** [PLACEHOLDER — ops to set: YYYY-MM-DD]
**Next review due:** [PLACEHOLDER — ops to set: YYYY-MM-DD]
**Owner:** [PLACEHOLDER — ops to assign]

---

## 1. Purpose

This document classifies every field in SageReasoning's data model that qualifies as intimate data, and specifies the encryption method and row-level security (RLS) policy for each.

The classification is derived from the founder's own answers to the question: *"Which categories of my own data would I feel violated to have disclosed without consent?"* The founder's boundaries — not an external industry benchmark — set the tier for each field. Where the founder's tier is stronger than industry typical, that is deliberate. Where it is lighter, the divergence is noted in §6.

R17a is part of the R17 family: protecting intimate data as a matter of the moral commitment owed to any rational agent who entrusts their judgements to SageReasoning.

---

## 2. Access Control Tiers

| Tier | Name | What it means | Operator can decrypt? |
|---|---|---|---|
| **A** | Only me (client-side) | Encrypted client-side before the server sees it. Key derived from user credential. Server stores opaque ciphertext only. | **No — ever.** |
| **B** | Only me + AI mentor in-session | Server-side encrypted at rest. Decrypted only during an active mentor session, in memory, never returned via generic API. | Only during an authenticated mentor session owned by the user. |
| **C** | Only me + support with audit log | Server-side encrypted at rest. Support-role decryption is gated by an explicit support request and logged to the audit trail with timestamp, reviewer, and reason. | Yes, with audit trail. |
| **D** | Never stored | Data is computed in memory during a session and discarded. No encryption is applied because no row is written. | N/A — no persistence. |

---

## 3. Encryption Method per Tier

| Tier | Encryption primitive | Key source | Library reference |
|---|---|---|---|
| A | AES-256-GCM client-side | Derived from user credential (never transmitted) | `website/src/lib/encryption.ts` (client-side) |
| B | AES-256-GCM server-side | `MENTOR_ENCRYPTION_KEY` env var (64 hex chars, 32 bytes) | `website/src/lib/server-encryption.ts` — `encryptProfileData` / `decryptProfileData` |
| C | AES-256-GCM server-side | `MENTOR_ENCRYPTION_KEY` env var | `website/src/lib/server-encryption.ts` |
| D | None (no persistence) | N/A | N/A — field held in memory only |

All server-side encryption uses AES-256-GCM with a fresh 12-byte random IV per call and a 16-byte authentication tag. Algorithm version is stored with the payload to support future key rotation.

---

## 4. Field Inventory

### Tier A — Only me (client-side; operator cannot decrypt)

| Field | Context | RLS rule |
|---|---|---|
| `causal_tendencies` | Mentor profile — pattern of typical misjudgements | `auth.uid() = user_id`. Field returned only as opaque ciphertext. No server-side decryption path. |
| `financial_status` | Profile — income / debt / account state | `auth.uid() = user_id`. Opaque ciphertext. No decrypt path. |
| `location_log` | Profile — historical location trace | `auth.uid() = user_id`. Opaque ciphertext. No decrypt path. |
| `routine_times` | Profile — daily routine and schedule pattern | `auth.uid() = user_id`. Opaque ciphertext. No decrypt path. |

**Note for review:** `causal_tendencies` is listed at Tier A because it was not named in the founder's revision that moved `passion_map`, `false_judgements`, and `virtue_profile` from A → B. It may have been intended to move with the group. Ops to confirm at next review whether `causal_tendencies` stays at A or consolidates to B with the rest of the passion-diagnosis set.

### Tier B — Only me + AI mentor in-session

| Field | Context | RLS rule |
|---|---|---|
| `relationship_notes` | Relationship context | `auth.uid() = user_id` AND session scope = `mentor_session`. Decrypt only inside mentor pipeline. |
| `family_context` | Relationship context | Same as above. |
| `partner_reflections` | Relationship context | Same as above. |
| `conflict_notes` | Relationship context — conflict with loved ones | Same as above. |
| `journal_entry_body` | Journaling — raw entry text | Same as above. |
| `daily_reflection` | Journaling — daily reflection text | Same as above. |
| `journal_entries` | Journaling — aggregate entries | Same as above. |
| `proximity_estimate` | Journaling — oikeiosis proximity assessment | Same as above. |
| `oikeiosis_map` | Journaling — full oikeiosis map | Same as above. |
| `value_hierarchy` | Journaling — hierarchy of values | Same as above. |
| `passion_map` | Journaling — passion diagnosis | Same as above. |
| `false_judgements` | Journaling — identified false judgements | Same as above. |
| `virtue_profile` | Journaling — virtue assessment | Same as above. |
| `self_doubt_notes` | Professional vulnerabilities | Same as above. |
| `capability_concerns` | Professional vulnerabilities | Same as above. |
| `confidential_decisions` | Professional vulnerabilities | Same as above. |

**Enforcement note:** API endpoints outside the mentor session pipeline must return these fields as ciphertext (never decrypted). The mentor session is the only code path authorised to call `decryptProfileData` on Tier B fields.

### Tier C — Only me + support with audit log

| Field | Context | RLS rule |
|---|---|---|
| `preferred_indifferents` | Journaling — preferred indifferents | `auth.uid() = user_id` for owner read. Support role read requires `support_decrypt_request` row with reason + reviewer; writes audit entry. |
| `health_conditions` | Health notes | Same as above. |
| `medication` | Health notes | Same as above. |
| `mental_health_notes` | Health notes | Same as above. |
| `home_address` | Profile | Same as above. |
| `name` | Profile | Same as above. |
| `age` | Profile | Same as above. |
| `work_schedule` | Profile | Same as above. |
| `family_status` | Profile | Same as above. |

**Audit requirement:** Every support-role decryption writes a row to `support_access_log` with `{user_id, field_name, reviewer_id, reason, timestamp, session_id}`. The user can view this log for their own account at any time.

### Tier D — Never stored

| Field | Context | Handling |
|---|---|---|
| `intimate_reflections` | Relationship context — reflections whose disclosure would rupture trust | Computed in memory during a mentor session. Not written to any persistent store. Not included in session export or backup. Garbage-collected at session end. |

---

## 5. RLS Policy Template

Every Tier A, B, and C field sits on a row owned by a single user. The baseline policy is:

```sql
-- Baseline: owner-only read/write
CREATE POLICY "owner_only_access" ON <table>
  FOR ALL USING (auth.uid() = user_id);
```

Tier B adds a session-scope check at the application layer (RLS cannot distinguish "mentor session" from other authenticated requests at the database level; the mentor pipeline is the only code path that calls `decryptProfileData`).

Tier C adds a support-role path:

```sql
-- Support-role read with audit requirement
CREATE POLICY "support_with_audit" ON <table>
  FOR SELECT USING (
    auth.uid() = user_id
    OR (
      auth.jwt() ->> 'role' = 'support'
      AND EXISTS (
        SELECT 1 FROM support_decrypt_request
        WHERE support_decrypt_request.user_id = <table>.user_id
          AND support_decrypt_request.field_name = '<field>'
          AND support_decrypt_request.approved_at IS NOT NULL
          AND support_decrypt_request.expires_at > now()
      )
    )
  );
```

Tier A has no decrypt path. The ciphertext is returned; the server has no key to decrypt it.

Tier D has no row.

---

## 6. Divergences from Industry Typical

The founder's classification departs from typical SaaS practice in both directions:

**Stronger than typical:**
- `intimate_reflections` at Tier D (never stored). Typical practice is Tier A or B with persistence.
- `passion_map`, `false_judgements`, `virtue_profile` at Tier B. Typical practice is Tier C.
- `conflict_notes` at Tier B. Typical practice is Tier C.

**Lighter than typical:**
- `home_address` at Tier C. Industry practice for intimate-data products increasingly places home address alongside location data at Tier A. This is the founder's explicit decision, recorded for transparency. Recommend re-evaluation at next review.

---

## 7. Placeholders for Ops

- [ ] Implementation status per tier (Scoped / Designed / Scaffolded / Wired / Verified / Live)
- [ ] Per-field implementation date
- [ ] Last review date
- [ ] Next review due date
- [ ] Owner name / role
- [ ] Key rotation schedule for `MENTOR_ENCRYPTION_KEY`
- [ ] Support-role approval workflow (who can approve `support_decrypt_request`, SLA for revocation)
- [ ] Resolution of `causal_tendencies` tier (A as written, or B with the passion group)
- [ ] Re-evaluation of `home_address` tier at next review

---

## 8. Change Control

Any change to this document's field tiers must follow Critical Change Protocol (project instructions §0c-ii). Tier downgrades (stronger → weaker) require founder approval in the decision log before implementation. Tier upgrades (weaker → stronger) may be adopted via normal review but must be logged.

---

*This classification is grounded in the founder's own answer to what would feel like a violation if disclosed. It is the intended canonical reference for all encryption wiring work under Priority 2c.*
