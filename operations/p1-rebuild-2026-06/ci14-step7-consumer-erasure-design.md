# CI-14 Step 7 — On-demand consumer-erasure-by-token: design

**Status:** Designed 2026-06-15 (CI-14 completion session; the build follows in-session). Spec: `adopted/adr/2026-06-14-credential-consolidation.md` Migration §7 + the session prompt Part B. **Risk: Critical** (data deletion; 0d-ii). PR15 (reuse before bespoke) applied below.

## 1. The problem (ADR Migration §7)

`owner_kind='external_consumer'` credentials (a genuinely third-party API consumer — `owner_user_id` legitimately NULL, no `profiles` account, no user-JWT) are today deletable **only** by the time-based retention sweep (`retain_until < now()` + `GET /api/cron/trajectory-retention-sweep`, which purges their `agent_assessment_history` trajectory). The ADR promises an **on-demand** R17c "genuine deletion on request" path for them — the analogue of `/api/user/delete` (R17c) for the consumer who has no user account, only their credential.

## 2. The FK reality (path-check finding — it reshapes the design)

What references `api_keys(id)`, and with what `ON DELETE`:

| Child table | Column | `ON DELETE` | Effect of a hard-DELETE of the `api_keys` row |
|---|---|---|---|
| `credential_audit` | `credential_id NOT NULL` | **NO ACTION (RESTRICT)** | the DELETE **fails** if any audit row exists |
| `loop_billing_events` | `api_key_id NOT NULL` | **CASCADE** | **destroys retained-by-law billing** |
| `api_key_usage` | `api_key_id NOT NULL` | **CASCADE** | destroys usage counts |
| `analytics_events` | `api_key_id` | SET NULL | de-links (harmless) |
| (`agent_assessment_history`) | `credential_ref TEXT='api_key:<id>'` | **no FK** | NOT cascaded — must be deleted explicitly |

**Conclusion: a literal hard-DELETE of the `api_keys` row is the wrong primitive.** It would cascade-destroy the retained-by-law `loop_billing_events` ledger and can be *blocked* by the `credential_audit` RESTRICT. And `agent_assessment_history` is **not** an FK child (it's keyed by the `credential_ref` TEXT handle), so it is not cascaded regardless — it must be deleted by hand.

**Decisive precedent:** the **existing** `/api/user/delete` (R17c, for operators) **does not hard-delete `api_keys` either**. Deleting the operator's `profiles` row `SET NULL`s `api_keys.owner_user_id` (the FK is `ON DELETE SET NULL`) and the phase-3 trigger *revokes* their `sage_assent_write` creds; `loop_billing_events` / `api_key_usage` / `credential_audit` **survive** (now linked to an owner-nulled key). So the codebase's R17c posture is already **anonymize/de-link + revoke the credential, retain the billing/audit ledger** — never hard-delete the credential row or its financial children.

## 3. The decision — erase the data, anonymize the husk, retain the ledger

Step 7 mirrors the existing operator posture for the external-consumer case:

1. **Hard-DELETE the trajectory children** — `agent_assessment_history WHERE credential_ref = 'api_key:'||<id>` (the consumer's per-consult practice/assessment data; the bulk of what R17c protects). New store fn `deleteAssessmentHistoryForCredential(credentialRef)`.
2. **Anonymize + revoke the credential husk** — `UPDATE api_keys SET owner_email=NULL, label='[erased]', notes=NULL, agent_id=NULL, is_active=false, revoked_at=now(), suspended_reason='consumer_erasure', credential_provenance = COALESCE(credential_provenance,'{}'::jsonb) || jsonb_build_object('erased_at', now(), 'erased_basis', 'consumer_erasure_by_token')`. This removes the consumer's identifying data (`owner_email` is the contact PII; `label`/`notes` may carry their name; `agent_id` is their agent identifier) while keeping the row husk alive to anchor the **retained-by-law** billing/audit/usage rows. `key_hash` is **kept** (it is not PII — a SHA-256 of a random secret) so a re-presented token resolves the row → an idempotent "already erased" response; `is_active=false` denies auth regardless.
3. **De-personalize the retained ledger** — `UPDATE loop_billing_events SET agent_id=NULL WHERE api_key_id=<id>` (the only consumer-identifier on the retained billing rows is the nullable wrapper-supplied `agent_id`; null it to keep the **financial facts** — costs, counts, tokens — while stripping the identifier).

**Net:** the personal/practice data is genuinely gone (trajectory hard-deleted; PII nulled); the credential can no longer authenticate (revoked); the financial/audit ledger is retained-by-law but de-personalized. This is the standard "erase the subject, keep the invoices" R17c pattern and it matches the existing operator path exactly.

> **Why not "hard-DELETE if childless, else anonymize"?** Considered and rejected for a Critical data-deletion route: a uniform path is safer and predictable than conditional logic with two code paths to test, and the anonymized husk carries no PII. (External-consumer ecosystem keys minted-then-barely-used would in fact be childless, but the uniform anonymize path is correct for them too — the husk is inert.)

## 4. The scope guard — key off `owner_user_id IS NULL`, not `owner_kind`

**Erase only if `owner_user_id IS NULL`; refuse (4xx, "use /api/user/delete") if `owner_user_id IS NOT NULL`.**

This is the honest discriminator: `owner_user_id IS NULL` ⇔ "no `profiles`-backed operator" ⇔ "no user-JWT erasure path exists" ⇔ "the token path is the *only* erasure route." It is **robust to the `owner_kind` legacy-mint drift** (6e §D): a new legacy `sr_live_` mint produces `owner_kind='operator'` + null owner — guarding on `owner_kind` would wrongly refuse that genuinely-external row, leaving it un-erasable by either path. Guarding on `owner_user_id IS NULL` erases it correctly. Every `owner_user_id`-NULL row is genuinely external (verified: only the legacy admin ecosystem mint and a 0-or-≥2-email-match UPC mint leave it null; every operator path sets it). `owner_kind` is reported in the response for transparency but is **not** the gate.

**Hard scope guard against operator data:** an operator credential always has `owner_user_id` non-null (a real `profiles` FK) → refused by this path → routed to `/api/user/delete` (the user-JWT + cascade). The token path can never become a second deletion path for operator data.

## 5. Auth — two modes (the prompt's "token-or-id-authenticated")

- **Token mode (primary — the literal "consumer-erasure-by-token").** The consumer presents their own raw `sr_*` credential as `Authorization: Bearer <token>` + a confirmation body `{ "confirm": "ERASE" }`. The route SHA-256s the token, looks up the row (no `is_active` filter — a lapsed/revoked credential is still erasable), scope-guards `owner_user_id IS NULL`, then erases **that one credential**. A consumer can only erase the credential they hold.
- **Admin/id mode (secondary).** If the caller is the founder admin (`getAuthenticatedUser` → `ADMIN_USER_ID`) and supplies `{ "credential_id": "<uuid>", "confirm": "ERASE" }`, erase that external-consumer credential on the consumer's behalf (handles an emailed erasure request where the consumer no longer holds the token). Same scope guard.

Both modes converge on one `eraseExternalConsumerCredential(row)` core after auth + scope-guard.

## 6. Flag, route shape, store fn

- **Flag `SUBSTRATE_CONSUMER_ERASURE_ENABLED`** — UNSET ⇒ the route returns `503 { error: 'consumer erasure not enabled' }` (dark; functionally inert; activate per a founder-elected 0c-ii). Read at call time (mirrors the substrate flags).
- **Route `POST /api/credential/erase`** — a **handler.ts + route.ts split** (route.ts is a thin POST wrapper; handler.ts holds the testable impl + an injectable deps seam). This avoids the Next.js route-export-validation build failure (`route.ts` may export only HTTP handlers — memory `nextjs-route-export-validation`, the trajectory-B1 incident, the cutover PR5 carry-forward) and lets the unit test exercise the flag-on/scope-guard/honest-negative branches with no DB.
- **Store fn `deleteAssessmentHistoryForCredential(credentialRef, client?)`** in `agent-assessment-history-store.ts` — mirrors `deleteAssessmentHistoryForOwner` but scopes by `credential_ref` (hard DELETE, returns count, `isMissingTableError`-benign). Plus a small erasure helper for the `api_keys` anonymize + `loop_billing_events` de-personalize (kept in the handler or a thin store fn; KG1 — all awaited, errors surfaced).

## 7. Honesty (R17 / R18f)

The response states exactly what happened — no false "deleted":

- **Erased (200):** `{ status: 'erased', credential_ref, owner_kind, trajectory_rows_deleted: N, billing_rows_depersonalised: M, credential: 'anonymised_and_revoked', retained_by_law: ['loop_billing_events (financial)','credential_audit (if any)','api_key_usage (counts)'] }`.
- **Already erased (200, idempotent):** `{ status: 'already_erased', credential_ref }`.
- **Refused — operator (409):** `{ status: 'refused', reason: 'operator_credential', message: 'This credential belongs to an operator account; erase via /api/user/delete.' }`.
- **Unknown/unowned token (404):** `{ status: 'not_found', message: 'No erasable consumer credential matches the presented token.' }` — honest negative, no info leak, no false "deleted."
- **Missing confirmation (400):** `{ "confirm": "ERASE" }` required (mirrors `/api/user/delete`'s `{ "confirm": "DELETE" }`).
- **Compliance log:** one `compliance_deletion_log` row (no PII) — `{ event: 'consumer_credential_erased', credential_ref, trajectory_rows_deleted, retained: [...] }`.

## 8. Paired mint-hardening fixes (land with Step 7; close the gaps 6e surfaced)

Two small, additive credential-mint fixes that make `owner_kind`/the write-class invariants honest going forward (the adversarial review's medium + low findings):

1. **Legacy ecosystem mint sets `owner_kind:'external_consumer'`** — `admin/api-keys/route.ts` non-UPC branch currently sets neither `owner_user_id` nor `owner_kind`, yielding `owner_kind='operator'` + null owner (contradicts the Step-2 invariant; un-erasable-by-`owner_kind`). The honest default — the admin ecosystem mint genuinely never knows the operator. After this, no mint path produces a null-owner `'operator'` row, so 6e §D's optional CHECK becomes safe to add.
2. **UPC mode pre-validates the write-class** — when `capabilities` includes any of `{accreditation_write, calling, reflect}`, require a non-null `agent_id` and a resolvable `owner_user_id`, returning a clear `400` instead of letting the insert hit the (6e-broadened) `api_keys_sage_assent_write_requires_owner_and_agent` CHECK as an opaque `500`. (Belt: a `23514` branch on the insert-error handler surfaces "UPC with a write capability requires owner+agent.")

These are auth-surface code (Critical) but additive and behaviour-preserving for every valid existing call.

## 9. Acceptance (Step 7)

- **TEST leg (founder-walked, PR17):** mint an `external_consumer` UPC (`sr_prac_`, no owner_email match) → drive a consult so an `agent_assessment_history` row writes (credential_ref `api_key:<id>`, null owner) → `POST /api/credential/erase` (token mode, `{confirm:ERASE}`) → confirm the trajectory rows are gone (0) + the `api_keys` row is anonymised+revoked (`owner_email` NULL, `is_active=false`) + the token now 401s on `/api/reason` → re-erase is idempotent (`already_erased`).
- An **operator** credential (owner_user_id non-null) → `409 refused`.
- An **unknown/unowned** token → `404 not_found` (honest negative).
- `/api/user/delete` + `/api/user/export` + the retention sweep are **unaffected** (re-run their tests).
- **prod leg** (founder-elected 0c-ii): apply nothing schema-side (Step 7 adds a path, not a table — verify), set the flag, smoke-test on a throwaway external-consumer `sr_prac_`, revoke/erase at teardown.

## 10. PR15 — reuse, not bespoke

Reuses: the `/api/user/delete` request shape (`{confirm}` + service-role admin + compliance log), the cron-sweep `handler.ts`/`route.ts` split (route-export-validation safety), the `agent-assessment-history-store` deletion idiom (`deleteAssessmentHistoryForOwner` → `…ForCredential`), the opaque-bearer SHA-256 lookup (`validatePracticeCredential`'s primitive), and the existing R17c anonymize-and-retain posture. The only new surface is the `POST /api/credential/erase` route + the by-credential_ref store fn — a product-internal bespoke erasure path with no substituting Anthropic primitive (the data + FK graph are SageReasoning's own).
