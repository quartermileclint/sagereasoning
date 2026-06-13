# Plugin-Install Credential Revocation Runbook

**Status:** Active. Operationalises the revocation contract of the A10 Token-Format ADR (`/adopted/adr/2026-06-03-a10-token-format.md` — Surface 1) and the admin endpoint built at the A10 Critical implementation session (staging-plan session 12, 2026-06-03).
**Applies to:** per-install `sr_inst_` credentials (`api_keys` rows where `purpose = 'plugin_install'`). It does NOT apply to ecosystem API keys (`sr_live_`) or accreditation-write credentials (`sr_assent_`) — those have their own surfaces.
**Update discipline:** living document. After the first real revocation, the founder updates this runbook based on observation; the AI applies changes as Standard-risk governance work.

---

## Plain-language summary

A per-install credential is the token a plugin install uses to authenticate to `/api/reason`. Revoking one is the single most important safety lever in the per-install auth system: it is how you instantly cut off an install that is compromised, misbehaving, or no longer authorised.

Revocation is **instant and universal**. There is no waiting period, no cache to expire, and no propagation delay. The moment a credential is marked inactive, the very next call that presents that token is rejected with a 401. This is by design: every authenticated `/api/reason` call re-reads the credential's row and checks `is_active = true` before doing anything else. A revoked credential simply stops matching — the lookup returns nothing, and the call fails closed.

Revocation does **not** delete anything. The credential's row stays in the database as a permanent, inactive "tombstone" so the audit trail is preserved. You can re-issue a fresh credential for the same install later; the old dead one stays on file.

There are two ways to revoke: the **primary** way (the admin API, which also records the audit trail automatically) and the **emergency fallback** (a direct database flip, used only if the API is unavailable, which then needs a manual audit note). Use the primary way whenever possible.

> **Primary surface since 2026-06-13 (M2, CI-7):** the credential CLI wraps the admin API — `cd website && npx tsx scripts/mint-credential.ts revoke install --id <uuid>` (run `... help` for env setup). It lists ids (`list`), refuses cross-class revocations, and preserves the audit write because it calls this same endpoint. The console-fetch patterns below remain valid as the underlying mechanics and the emergency reference.

---

## Before you start: what you need

1. **The credential's `id`** (a UUID like `a1b2c3d4-...`). This is the value the mint endpoint returned in `credential.id` when the credential was created. If you did not save it, see **§Finding the credential id** below.
2. **Your admin sign-in.** The revocation endpoint is founder-only — it checks that the caller is signed in as the admin user (the `ADMIN_USER_ID`). This is the same gate the accreditation-credentials admin endpoint uses; revoke the same way you mint.
3. **Two minutes.** A single revocation is one request plus one verification check.

> You do **not** need `PLUGIN_INSTALL_AUTH_ENABLED` to be on to revoke. Revocation works regardless of the flag. (With the flag off, the credential was not authenticating anything anyway — but revoking it is still the correct, tidy action.)

---

## Procedure — primary (admin API)

### Step 1 — Find the credential id (skip if you already have it)

If you saved the `credential.id` from when the credential was minted, skip to Step 2.

Otherwise, in **Supabase Dashboard → SQL Editor → New Query**, run (replace the install_id with the one you want to revoke):

```sql
SELECT id, install_id, identity_type, install_scope, is_active, created_at, revoked_at
FROM public.api_keys
WHERE purpose = 'plugin_install'
  AND install_id = 'install_acme_001'
ORDER BY created_at DESC;
```

Expected: one row per credential ever issued for that install. The **active** one (the one to revoke) has `is_active = true` and `revoked_at = NULL`. Copy its `id`.

> There can be at most ONE active credential per `install_id` at a time (the partial unique index from the migration). Older rows for the same install will show `is_active = false` — those are already-revoked tombstones; leave them.

### Step 2 — Send the revoke request

Call the admin endpoint with the credential id. The exact mechanics (how your admin session is presented) are identical to how you mint credentials on the accreditation admin endpoint. The request is:

```
DELETE /api/admin/plugin-install-credentials?id=<credential_id>
```

Optionally include a reason in the JSON body (recorded in the audit trail):

```json
{ "reason": "compromised — rotating" }
```

Expected response — **HTTP 200**:

```json
{ "revoked": true, "credential_id": "<credential_id>", "revoked_at": "2026-06-03T...Z" }
```

Other responses and what they mean:

- **404** — no `plugin_install` credential with that id. Check the id (Step 1).
- **409** — the credential is already revoked. Nothing more to do.
- **401** — you are not signed in as the admin user. Sign in as admin and retry.
- **500** with `"revoked": true` and an audit-gap message — the credential **was** revoked (it is safely disabled) but the audit row failed to write. Record the revocation manually (see §Manual audit note) and report the gap.

### Step 3 — Verify the credential no longer authenticates

Confirm the row is now inactive. In **Supabase → SQL Editor**:

```sql
SELECT id, install_id, is_active, revoked_at, suspended_reason
FROM public.api_keys
WHERE id = '<credential_id>';
```

Expected: `is_active = false`, `revoked_at` set to the timestamp from Step 2, `suspended_reason` = your reason (or `admin_revocation`).

If `PLUGIN_INSTALL_AUTH_ENABLED` is on and you want positive proof the token is dead, present the revoked token to `/api/reason`:

```
POST /api/reason
Authorization: Bearer sr_inst_<the revoked token>
```

Expected: **HTTP 401** (`Plugin authentication failed`). Before revocation the same call would have proceeded. This is the universal revocation check doing its job.

### Step 4 — Confirm the audit trail

```sql
SELECT event_type, credential_id, agent_id AS install_id, details, created_at
FROM public.credential_audit
WHERE credential_id = '<credential_id>'
ORDER BY created_at;
```

Expected: an `issue` row (from when it was minted) and now a `revoke` row, both with `agent_id` holding the install_id and `details` carrying `surface = 'plugin_install'`, the reason, and the identity/scope. This is the permanent record that the credential existed and was deliberately revoked.

---

## Procedure — emergency fallback (direct database flip)

Use this **only** if the admin API is unavailable (e.g. the site is down) and you must cut off a credential immediately. It skips the automatic audit write, so it requires a manual audit note afterwards.

### Step 1 — Flip the credential inactive

In **Supabase Dashboard → SQL Editor → New Query** (replace the id):

```sql
UPDATE public.api_keys
SET is_active = false,
    revoked_at = now(),
    suspended_reason = 'emergency_revocation'
WHERE id = '<credential_id>'
  AND purpose = 'plugin_install'
  AND is_active = true;
```

Expected: `UPDATE 1`. (If `UPDATE 0`, the id was wrong or it was already revoked.)

The credential is now dead — the next `/api/reason` call presenting it gets 401, exactly as in the primary path. The universal revocation check reads this same `is_active` flag.

### Step 2 — Manual audit note

Because the direct flip bypassed the endpoint's automatic audit write, record the revocation by hand so the trail is complete:

```sql
INSERT INTO public.credential_audit (event_type, credential_id, actor_user_id, agent_id, details)
VALUES (
  'revoke',
  '<credential_id>',
  NULL,                     -- system/manual action; no actor profile resolved
  '<install_id>',           -- the install_id of the credential
  '{"surface":"plugin_install","reason":"emergency_revocation","note":"direct DB flip; API unavailable"}'::jsonb
);
```

Expected: `INSERT 0 1`. Then verify per primary-path Step 4.

---

## What revocation guarantees (and what it does not)

**Guarantees:**

- **Instant.** No cache, no TTL, no overlap window. The check is a live per-call database read of `is_active`.
- **Universal.** Every authenticated `/api/reason` call goes through the same check. There is no path that skips it for a per-install token.
- **Fail-closed.** A revoked (or unknown) token returns no row, which collapses to `invalid_token` → 401. The system never "fails open" to allow a revoked token.
- **Auditable.** The primary path records a `revoke` event automatically; the credential row survives as a tombstone forever.

**Does not:**

- It does **not** delete the row (intentionally — the tombstone is the audit record).
- It does **not** affect any other credential. Each install has its own credential; revoking one cuts off only that install.
- It does **not** touch the shared-secret `X-Plugin-Auth` / `PLUGIN_AUTH_SECRET` fallback path — that is a separate mechanism with its own (non-per-install) behaviour.
- It does **not** require the feature flag to be on.

---

## Re-issuing after revocation

A revoked credential cannot be reactivated — issue a fresh one. Mint a new credential for the same `install_id` via the admin POST endpoint; the partial unique index permits this because it only constrains **active** rows, and the revoked one is inactive. The install then uses the new `sr_inst_` token; the old tombstone stays on file.

---

## Compromise-suspected response (off-cycle)

If you suspect a per-install token has leaked or is being abused:

1. **Revoke immediately** via the primary path (or the emergency fallback if the API is down) with `reason: "compromise-suspected"`.
2. **Verify** the token now returns 401 (primary-path Step 3).
3. **Re-issue** a fresh credential for the install if it is still authorised (§Re-issuing).
4. **Record** a one-line note in the decision log if the compromise was real, so the event is on the governance record (not just the credential_audit table).

---

## Cross-references

- `/adopted/adr/2026-06-03-a10-token-format.md` — the Token-Format ADR (Surface 1; the universal revocation requirement this runbook operationalises).
- `/website/src/lib/plugin-install-auth.ts` — `validatePluginInstallToken` (the `is_active = true` lookup filter that IS the universal revocation check).
- `/website/src/app/api/admin/plugin-install-credentials/route.ts` — the admin mint (POST) + revoke (DELETE) endpoint this runbook drives.
- `/website/supabase-api-keys-plugin-install-migration.sql` — the schema (the `is_active` flag, the partial unique index, the identity columns).
- `/operations/runbooks/substrate-layer2-key-rotation.md` — the sibling key-rotation runbook this one mirrors in style.

---

*End of runbook. Revocation is instant, universal, fail-closed, and auditable. Primary path = admin DELETE (auto-audited); emergency fallback = direct DB flip + manual audit note.*
