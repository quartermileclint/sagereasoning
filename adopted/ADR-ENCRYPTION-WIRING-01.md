# ADR-ENCRYPTION-WIRING-01: Application-Level Encryption Wiring for Phase-2 Pass-1 Tables (P2 task 2c)

**Status:** Adopted (founder approval per Path A on 2026-05-02; D-ENCRYPTION-WIRING-ADR-ADOPTED-2026-05-02). Moved from `/drafts/` to `/adopted/` 2026-05-02.
**Date:** 2026-05-02.
**Stream:** founder.
**Governing frame:** `/adopted/session-opening-protocol.md`.
**Deciders:** Founder (sole signatory).
**Implements:** R17b (application-level encryption for intimate data); R17c (genuine deletion); R17d (local-first consideration); R17e (passion profiling not exposed via API); R17f (Critical Change Protocol obligation for encryption changes); AC4 (invocation testing for safety functions — adapted to encryption); AC7 (Session-7b standing constraint — checked but not engaged); PR1 (single-endpoint proof discipline — the existing mentor-profile-store wiring is the proof endpoint); PR6 (safety-critical changes are Critical); KG1 (Vercel five rules — rule 2 applies); KG7 (JSONB storage format).

**Cross-references:**
- `/manifest.md` R17a–R17f, AC4, AC5, AC7, KG1, KG7
- `/adopted/rag-mentor-alt3/migration-plan.md` (D21 — Phase-2 Precondition 4 names this work)
- `/adopted/rag-mentor-alt3/reflect-endpoint-14b-deferral-resolution.md` (D14b — the consumer surface; specifies which fields need encryption)
- `/adopted/rag-mentor-alt3/operationalised-rules.md` (D8 — defines the engine output that produces the intimate diagnostics)
- `/website/src/lib/server-encryption.ts` (the existing server-side encryption module)
- `/website/src/lib/encryption.ts` (the existing client-side encryption module — informs R17d posture)
- `/website/src/lib/mentor-profile-store.ts` (the canonical wiring precedent — `encrypted_profile` + `encryption_meta` pattern)
- `/operations/SageReasoning_Priority5_Local_Storage_Strategy.docx` (R17d local-first philosophy — March 2026)
- `/operations/decision-log.md` D-D2-AMENDMENT-2026-05-02 (related Phase-1 governance; same calendar day)
- Project instructions Priority 2 §2c ("Wire application-level encryption for intimate data — Connect encryption.ts to mentor profile storage pipeline")

---

## Plain-language summary

This ADR is the architecture decision for wiring the existing encryption modules into the two new database tables that Phase-2 pass 1 will create (`open_deferrals` and `deferral_resolutions` per D14b). The encryption modules already exist (`server-encryption.ts` for server-side, `encryption.ts` for client-side), are already wired into the mentor profile pipeline (`mentor-profile-store.ts`), and use the well-established AES-256-GCM standard with the `MENTOR_ENCRYPTION_KEY` environment variable.

This ADR addresses the architectural choices (which fields encrypted, which key, which storage shape, key rotation posture), records the Critical Change Protocol obligations for the eventual implementation session, and specifies the action items the implementation session will execute. The implementation itself is **Critical risk** per R17f and PR6 and will be a separate session under the Critical Change Protocol.

The ADR drafting itself (this document) is **Standard risk** — design only, no live system touched.

---

## Context

### What's already in place

The codebase has two encryption modules:

1. **`server-encryption.ts` (server-side)** — Node.js `crypto` AES-256-GCM. Uses `MENTOR_ENCRYPTION_KEY` env var (64-hex 32-byte key). Designed for "data the server processes but shouldn't store in plaintext (profile data needed for LLM calls)." Returns `ServerEncryptedPayload` = `{ ciphertext, iv, authTag, algorithm: 'AES-256-GCM', version: 1 }`. Has rotation-ready `version` field. Throws on missing/malformed key.

2. **`encryption.ts` (client-side)** — Web Crypto API AES-256-GCM. Uses PBKDF2 key derivation from user password + salt (100,000 iterations, SHA-256). Designed for "data the server should never see (journal entries)." Future-aligned with iOS Keychain for native app continuity.

Server-side encryption is **already wired** into the mentor profile pipeline:

- **`mentor-profile-store.ts`** uses the canonical pattern: column `encrypted_profile` (TEXT — ciphertext base64) + column `encryption_meta` (JSONB — `{ iv, authTag, algorithm, version }`). Has timing telemetry (`db_ms`, `decrypt_ms`, `parse_ms`, `dispatch`, `adapt_ms`, `summary_ms`, `total_ms`). The pattern is **proven** and **load-bearing** for the existing mentor-profile dispatch path.

- **Many call sites already consume the pattern**: `/api/founder/hub`, `/api/mentor/private/reflect`, `/api/mentor/private/baseline-response`, `/api/mentor-appendix/*`, `/api/mentor-profile`, `/api/mentor-baseline-response`, `/api/mentor/ring/proof`, `/api/health`, plus several context loaders.

### What D14b requires

D14b §"Schema additions" specifies the two new tables with their encrypted-at-rest fields:

- `open_deferrals` table:
  - `encrypted_payload BYTEA` — application-level encryption per R17b

- `deferral_resolutions` table:
  - `reflection_content TEXT` — encrypted at the application layer per R17b
  - `engine_diagnostics JSONB` — encrypted (engine output references the practitioner's specific reasoning)
  - `encrypted_payload BYTEA` — application-level encryption per R17b

D14b §"R17 intimate data protection conformance" §R17d explicitly notes: "*Trigger maps and contradiction maps may need to be local-only per R17d. This deliverable's tables (`open_deferrals`, `deferral_resolutions`) are server-side because the architectural function (cross-instance retrospective score update) requires server-side state.*"

### What R17 demands

- **R17b**: application-level encryption beyond database-level encryption. Stronger than Supabase's at-rest encryption.
- **R17c**: genuine deletion (not soft-delete) for the most intimate fields. Means cascade behaviour must work on the schema, not just in app logic.
- **R17d**: local-first for the highest sensitivity *where architecturally feasible*. D14b's tables are not local-first because they require cross-instance state (per D14b above).
- **R17e**: passion profiling results never exposed via API. The new tables persist intimate diagnostics; their content must never leak through any API endpoint.
- **R17f**: changes to encryption follow the Critical Change Protocol (0c-ii). The urgency does not reduce the classification. **A protection that locks the data owner out of their own system has failed as a protection.** This is the load-bearing constraint on key management and rollback design.

### Forces at play

| Force | Pressure |
|---|---|
| Reuse the existing pattern | Strong — `mentor-profile-store.ts` is proven; the team knows the call sites; the env var is configured; introducing a parallel pattern increases attack surface and operational load. |
| Don't lock the founder out | Strong (R17f) — single env var means single point of failure. Loss of the env var loses *all* mentor-profile data plus all new D14b data. |
| Key rotation readiness | Medium — the existing `version: 1` field in `encryption_meta` is a placeholder; no rotation harness exists. The new wiring should preserve rotation-readiness without requiring rotation right now. |
| Vercel KG1 rule 2 (await all DB writes) | Strong — encryption is async-friendly but writes to the encrypted columns must be awaited, not fire-and-forget. |
| KG7 (JSONB storage format) | Strong — `encryption_meta` is JSONB; per KG7 the writer must pass the object directly to Supabase, not `JSON.stringify` it. The existing `mentor-profile-store.ts` does this correctly; the new wiring must match. |
| AC7 (Session-7b standing constraint) | **Not engaged at the encryption layer**, but engineering must not let the encryption wiring break session behaviour (the founder's existing JWT session must remain valid through the deploy; no auth/cookie/session/redirect surface touched by this wiring). |
| Founder is non-coder | Strong — every implementation step must be founder-verifiable. Plain-language explanation of every key management decision. |
| Phase-2 pass-1 timing | Medium — the encryption wiring is Phase-2 pass-1's Precondition 4. D21 recommends "P2 task 2c lands first; pass 1 builds against the wired module." This ADR drafts the design now; the implementation session lands before pass 1. |

---

## Decisions

This ADR makes five named decisions. Each has options considered and trade-off reasoning. The implementation session executes the **Selected** option for each.

### Decision 1 — Encryption module reuse vs new module

**Question:** Use `server-encryption.ts` for the new D14b tables, or build a new module?

#### Option 1A — Reuse `server-encryption.ts` as-is (Recommended)

| Dimension | Assessment |
|---|---|
| Complexity | Low — module exists, is proven, is documented |
| Cost | Zero new infrastructure |
| Scalability | Same as today (Vercel-compatible Node.js crypto) |
| Founder familiarity | Already wired; pattern is visible at `mentor-profile-store.ts` |
| Rotation-readiness | `version` field present (currently always `1`) |
| AC7 risk | None — no auth/session surface touched |

**Pros:** Minimum new surface; preserves the canonical pattern; no new attack surface; existing tests and telemetry transfer.
**Cons:** Couples the new tables to the same key as mentor-profile data — a single env-var loss blast-radius covers more data.

#### Option 1B — New parallel module (`deferral-encryption.ts` with separate key)

| Dimension | Assessment |
|---|---|
| Complexity | Higher — new module, new tests, new env var, new key-management runbook |
| Cost | Zero new infrastructure but multiplied operational load |
| Scalability | Same as today |
| Founder familiarity | New surface; another thing to verify |
| Rotation-readiness | Greenfield design opportunity but no working precedent |
| AC7 risk | None |

**Pros:** Smaller blast radius if one key is lost; cryptographic isolation between data domains.
**Cons:** New code surface to maintain; doubles the env-var management discipline; introduces drift risk between two parallel patterns. Two modules using the same algorithm is operational waste.

**Selected: Option 1A.** Reuse `server-encryption.ts`. Reasoning: the founder's R17f-driven "must not lock the owner out" concern is better addressed by **key backup discipline** (Decision 4) than by domain partitioning. The pattern is proven; the call sites know the contract; introducing a parallel module is operational waste.

---

### Decision 2 — Single key vs key-per-domain

**Question:** Use the existing `MENTOR_ENCRYPTION_KEY` for D14b's tables, or introduce a new env var (e.g., `DEFERRAL_ENCRYPTION_KEY`)?

#### Option 2A — Reuse `MENTOR_ENCRYPTION_KEY` (Recommended)

| Dimension | Assessment |
|---|---|
| Operational load | Single key to manage, back up, rotate |
| Blast radius (key loss) | All server-side intimate data unrecoverable |
| Blast radius (key compromise) | All server-side intimate data exposed |
| Founder simplicity | One env var, one runbook |

**Pros:** One key; one runbook; no env-var proliferation. Aligns with the existing precedent.
**Cons:** Single point of failure for all server-side intimate data.

#### Option 2B — New `DEFERRAL_ENCRYPTION_KEY` (separate env var)

| Dimension | Assessment |
|---|---|
| Operational load | Two keys to manage, back up, rotate |
| Blast radius (one key loss) | Only that domain's data unrecoverable |
| Blast radius (one key compromise) | Only that domain's data exposed |
| Founder simplicity | Two env vars; two runbooks; need to track which key encrypts which table |

**Pros:** Domain isolation; smaller per-key blast radius.
**Cons:** Doubled operational load; doubled rotation discipline; if the founder loses *either* key, the impact is the same severity (a portion of intimate data lost). Real-world R17f obligation is about not losing the key in the first place, not about partitioning the loss.

**Selected: Option 2A.** Reuse `MENTOR_ENCRYPTION_KEY`. Reasoning: the R17f obligation is met by Decision 4 (key backup discipline) and Decision 5 (rollback path). Domain partitioning adds operational burden without proportionate safety benefit for a single-founder system.

**Open for revisit:** if the user base extends to non-founder practitioners and per-user keys become viable (Option 2C — per-user keys derived from password, like `encryption.ts`'s pattern), the architecture should be re-examined. Logged in §"Open questions" below.

---

### Decision 3 — Field-level encryption shape

**Question:** Encrypt each field separately (per-column ciphertext + per-column meta) or pack multiple fields into a single encrypted JSON blob?

#### Option 3A — Per-column shape, matching the existing pattern (Recommended)

For each encrypted field:
- A column holding the ciphertext (TEXT for text/JSON; BYTEA for binary)
- A companion column holding the encryption metadata (JSONB: `{ iv, authTag, algorithm, version }`)

Per D14b's schema:
- `open_deferrals.encrypted_payload BYTEA` + `open_deferrals.encryption_meta JSONB`
- `deferral_resolutions.reflection_content TEXT` + `deferral_resolutions.reflection_content_meta JSONB`
- `deferral_resolutions.engine_diagnostics JSONB` (where the JSONB contains `{ ciphertext, iv, authTag, algorithm, version }` directly — encryption metadata folded into the field's JSONB shape since `engine_diagnostics` is already JSONB-typed)
- `deferral_resolutions.encrypted_payload BYTEA` + `deferral_resolutions.encryption_meta JSONB`

**Pros:** Matches the established pattern; per-field decryption is possible without decrypting unrelated data; KG7-aware (the JSONB metadata is passed as object, not stringified). Selective field updates are possible without re-encrypting the whole row.
**Cons:** Schema cardinality — multiple columns per "encrypted unit"; slightly more verbose schema migrations.

#### Option 3B — Single packed encrypted blob per row

Pack all encrypted fields per row into one ciphertext column + one encryption_meta column. Decrypt the whole packed JSON to read any field.

**Pros:** Schema simplicity (two columns total per row regardless of how many fields are encrypted); cryptographic atomicity (all-or-nothing).
**Cons:** Selective updates require full re-encrypt; reads always pay the full decrypt cost; diverges from the established `mentor-profile-store.ts` pattern; harder to audit "which fields are encrypted" by looking at the schema.

**Selected: Option 3A.** Per-column shape matching the existing pattern. Reasoning: consistency with the canonical precedent; selective decryption matches D14b's read patterns; schema is more self-documenting.

**Schema concretion (for the implementation session):**

```sql
-- open_deferrals
CREATE TABLE open_deferrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trigger_code TEXT NOT NULL,
  encrypted_payload TEXT NOT NULL,          -- ciphertext of the deferral payload (was BYTEA in D14b draft; TEXT base64 matches pattern)
  encryption_meta JSONB NOT NULL,           -- { iv, authTag, algorithm: 'AES-256-GCM', version: 1 }
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

-- deferral_resolutions
CREATE TABLE deferral_resolutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  open_deferral_id UUID NOT NULL REFERENCES open_deferrals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reflection_content TEXT NOT NULL,         -- ciphertext of the reflection
  reflection_content_meta JSONB NOT NULL,   -- { iv, authTag, algorithm, version }
  engine_diagnostics_ciphertext TEXT NOT NULL,  -- ciphertext of the engine diagnostics JSON
  engine_diagnostics_meta JSONB NOT NULL,   -- { iv, authTag, algorithm, version }
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

(Note: D14b's draft schema used `BYTEA` for `encrypted_payload` and `JSONB` for `engine_diagnostics`. This ADR proposes `TEXT` (base64 ciphertext) + companion `JSONB` (meta) per the established pattern. The implementation session may choose `BYTEA` if profiling shows base64 overhead is meaningful; both are R17b-compliant.)

---

### Decision 4 — Key backup discipline (the R17f load-bearing decision)

**Question:** How is `MENTOR_ENCRYPTION_KEY` backed up to prevent the "owner locked out of own data" failure that R17f names as the worst-case "protection that has failed as a protection"?

#### Option 4A — Founder-owned offline backup (Recommended)

The founder maintains an offline copy of the encryption key in:
1. A password-manager entry tagged `MENTOR_ENCRYPTION_KEY` (encrypted at rest by the password manager).
2. A printed copy stored in a physical secure location (safe / safety deposit box) — paper survives ransomware.
3. A Vercel project env var (the operational copy — the actual key the production deploy reads).

**Verification cadence:** monthly — the founder confirms the copies match by printing the Vercel env-var value and comparing to the password-manager entry. Mismatches are runbooks in their own right (which copy is canonical?).

**Pros:** Three independent copies; matches industry practice for KMS keys; founder-controllable without third-party dependency; survives Vercel account loss, password-manager loss, or paper loss (any one).
**Cons:** Discipline-dependent — the founder must actually do the backup steps. Cadence violations are silent until the worst case.

#### Option 4B — KMS service (AWS KMS, GCP KMS, HashiCorp Vault)

Move key custody to a managed KMS. The application calls KMS to wrap/unwrap data encryption keys (DEK) per request.

**Pros:** Industry-standard; rotation built in; access audit trail; reduces founder operational responsibility.
**Cons:** Vendor lock-in; per-call cost (~$0.03 per 10K KMS calls); changes the runtime architecture (network call per encrypt/decrypt — Vercel-compatible but adds latency); introduces a dependency that R0 oikeiosis review hasn't covered yet (does using a vendor KMS serve Circle 3/4 better than Circle 1?). Out of scope for Phase 2 commencement; revisit at scale.

**Selected: Option 4A.** Founder-owned offline backup with monthly verification. Reasoning: Phase-2 pass 1 commences with a single founder; KMS overhead is not justified at this scale; the discipline burden is acceptable; revisit when user base extends beyond the founder.

**Plain-language for the founder (from this ADR's "non-coder" obligation):**

When the implementation session generates the production encryption key, the founder receives:
1. The 64-character hex string (the actual key).
2. A pre-written password-manager entry to paste into.
3. A printable PDF with the key formatted in 4-character groups for legibility.
4. A monthly calendar reminder (Google Calendar item) to verify the backups match.

The founder pastes the env var into Vercel (the implementation session walks through this step-by-step). The password-manager and paper copies are the founder's safety net.

If the founder loses Vercel access: restore the key from the password manager into a fresh Vercel project. Application reads the key on next deploy.

If the founder loses the password manager: print a fresh paper backup from the existing Vercel env var (read it off the Vercel dashboard before the loss propagates).

If the founder loses both Vercel access and the password manager: the paper backup is the recovery source.

If the founder loses all three copies simultaneously: the data is irretrievable. This is the worst case R17f names. The mitigation is the three-copy discipline, not a fourth copy.

---

### Decision 5 — Rollback path for the implementation session

**Question:** What's the implementation session's rollback path if encryption wiring fails post-deploy?

#### Selected: Schema-reversible rollback with env-flag gating

The Critical Change Protocol for the implementation session will require:

1. **Pre-deploy backup of the production database** (Supabase point-in-time backup confirmed within 24 hours).
2. **Schema migrations applied to a deployment-flagged path** — `MENTOR_RAG_V1=false` (the existing flag) means the new tables exist but the new route doesn't write to them.
3. **Initial dry-run encrypt-then-decrypt test** against canonical seed data before `MENTOR_RAG_V1=true` flips.
4. **Verification after first real write** — read back the just-written row; decrypt; confirm plaintext matches input.
5. **Rollback path A (within minutes — preferred):** flip `MENTOR_RAG_V1=false`; the new route stops engaging the new tables; existing pipeline unaffected.
6. **Rollback path B (if data corruption suspected):** `DROP TABLE deferral_resolutions; DROP TABLE open_deferrals;` — reversible because no data exists pre-build (Phase-2 pass 1 is the proof endpoint per PR1; no migration of existing data). The fact that the tables are brand-new (no historical data) is the rollback-safety load-bearing premise.
7. **Rollback path C (env var loss):** key restoration per Decision 4.

The implementation session's Critical Change Protocol will name all five paths explicitly, plus the verification step the founder runs post-deploy.

---

## Trade-off Analysis

The five decisions form a coherent architecture: reuse the proven module + reuse the proven key + match the proven schema pattern + own the key backup discipline + design the rollback path around the env flag and the no-historical-data property. The trade-offs are mostly about whether to introduce new surface or rely on the existing one, and the consistent answer is **rely on the existing**.

The one place where the architecture meaningfully changes from the mentor-profile precedent is **operational discipline around key backup** (Decision 4). The mentor-profile data has been encrypted under `MENTOR_ENCRYPTION_KEY` for some time without an explicit backup runbook — that's a latent risk the founder has accepted implicitly. This ADR makes the backup discipline explicit and mandatory before Phase-2 pass 1 commences. The implementation session will not deploy without the founder confirming the three-copy backup is in place.

**Risk decisions deferred to the implementation session (PR7):**

- The exact schema choice (BYTEA vs TEXT for ciphertext columns) — both are R17b-compliant; profile after first writes if needed.
- Key rotation cadence and triggers — the `version` field is rotation-ready; no rotation needed at Phase-2 pass-1 commencement; first rotation should happen on an event basis (suspected compromise; founder discretion) until a calendar-cadence justifies itself.
- KG7 verification post-write — the implementation session will run `SELECT jsonb_typeof(encryption_meta) FROM open_deferrals ORDER BY created_at DESC LIMIT 1;` and confirm `'object'` per KG7 discipline.

---

## Consequences

### What becomes easier

- Phase-2 pass-1 wiring is a small extension of the existing `mentor-profile-store.ts` pattern, not greenfield engineering.
- The founder's verification protocol is a familiar shape (decrypt-test against canonical seed; KG7 typeof check; founder-performable SQL queries).
- R17b conformance is met by default once the wiring lands.
- R17c genuine deletion is met by `ON DELETE CASCADE` on the schema (per D14b's existing design); no app-logic deletion code needed.
- R17e (passion profiling not exposed via API) is met by the route's founder-only auth gate plus the encrypted-at-rest storage — neither path exposes the diagnostics externally.

### What becomes harder

- Key custody discipline becomes a permanent ongoing obligation. The monthly verification cadence is non-negotiable per R17f. The implementation session adds a calendar reminder; the founder must execute it.
- Future user-base extension (beyond the founder) re-opens Decision 2 — single key vs per-user keys derived from password (the `encryption.ts` pattern). Out-of-scope for Phase 2 pass 1.
- KMS migration (if the user base scales) is a future architecture refresh, not a small change.

### What we'll need to revisit

- **At extension-beyond-founder:** Decisions 2 and 4 — per-user keys (Option 2C in §Decision 2) become viable; KMS becomes worth its overhead.
- **At first key rotation event (compromise suspected):** the rotation harness needs to handle multiple `version` values; readers must accept both old and new keys during the rotation window. No implementation needed at Phase-2 pass-1 commencement; revisit on event basis.
- **At any future R17b enrichment:** if R17b adds new field types to the protected set, the same per-column-shape pattern applies; new tables follow the same schema convention; no architectural rework needed.

---

## Action Items (for the eventual Critical-risk implementation session)

The implementation session — when scheduled — executes these steps in order:

1. **[ ] Generate production encryption key.** Run `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` locally. Capture the 64-character hex string.

2. **[ ] Founder backup ceremony (Decision 4 Option 4A).**
   - Founder pastes the key into a password-manager entry tagged `MENTOR_ENCRYPTION_KEY`.
   - Founder prints the key on paper formatted in 4-character groups.
   - Founder confirms both copies match the source (read-aloud verification).
   - Calendar reminder added: monthly verification check.
   - **Implementation session does not proceed past this step until the founder confirms all three steps executed.**

3. **[ ] Production env var set in Vercel.** Founder pastes the key into Vercel project env vars under `MENTOR_ENCRYPTION_KEY`. Vercel auto-deploys; `isServerEncryptionConfigured()` returns `true` post-deploy. (Note: if `MENTOR_ENCRYPTION_KEY` is *already* set in Vercel — likely, since `mentor-profile-store.ts` already reads from it — Steps 1–3 are *verification-only*: confirm the existing key matches the founder's backups; if no backup exists for the existing key, Step 2's ceremony executes against the existing key as the source of truth.)

4. **[ ] Schema migrations against staging.** Apply the SQL from §Decision 3 to the staging Supabase project. Verify table creation, RLS policies, indexes, foreign-key cascades.

5. **[ ] Encrypt-then-decrypt dry-run test against canonical seed data.** Run a unit test that:
   - Encrypts a canonical `OPEN_DEFERRAL` payload using `encryptProfileData()`.
   - Inserts into `open_deferrals` (staging).
   - Reads back the row.
   - Decrypts the payload using `decryptProfileData()`.
   - Asserts plaintext matches input byte-for-byte.
   - Confirms `jsonb_typeof(encryption_meta) = 'object'` per KG7.
   - Confirms `encryption_meta.algorithm = 'AES-256-GCM'` and `version = 1`.

6. **[ ] Schema migrations against production.** Same SQL applied to production Supabase. `MENTOR_RAG_V1=false` (default) means the new tables exist but the new route doesn't write to them.

7. **[ ] Wire `lib/encryption-helpers.ts` (or extend the existing pattern in `mentor-profile-store.ts`).** Provide `encryptDeferralPayload()` + `decryptDeferralPayload()` helpers that wrap `encryptProfileData()` + `decryptProfileData()` with the D14b-specific shape conventions. Add to `__tests__/`.

8. **[ ] AC4 invocation testing.** Unit-test that the new helpers are imported and called by the new route source (`/api/mentor/private/deferral-resolve/route.ts`). Confirm via grep, not just runtime hope.

9. **[ ] Critical Change Protocol for the deploy.** Per R17f and 0c-ii, the implementation session deploys *only after* the founder has reviewed: what's changing, what could break, what happens to existing sessions (none — additive change, existing JWT sessions unaffected; AC7 not engaged), the rollback paths (A/B/C per §Decision 5), the verification step the founder runs post-deploy. Founder explicit approval required.

10. **[ ] Post-deploy verification.** Founder runs the decrypt-test against the first real write; confirms plaintext readable; confirms KG7 typeof check passes; confirms the route writes to the new tables as expected.

11. **[ ] Decision-log entry.** `D-ENCRYPTION-WIRING-IMPLEMENTED-YYYY-MM-DD` appended. Cross-references this ADR + D14b + D21 + the Critical Change Protocol responses verbatim.

12. **[ ] Phase-2 pass-1 readiness inventory: 7 of 7 preconditions complete.** The encryption wiring precondition closes; pass 1 commencement awaits only founder approval per the pass-1 Critical Change Protocol.

---

## Critical Change Protocol responses (for the implementation session — drafted here per R17f)

The implementation session will surface these verbatim in the conversation before the deploy step. Drafted now so the founder sees them ahead of time.

### What is changing

The application gains the ability to write encrypted intimate-data rows to two new database tables (`open_deferrals` and `deferral_resolutions`). The encryption is the same algorithm and same key the application already uses for mentor profiles. No existing data is touched. No existing route is changed (the new route consuming these tables is built separately under Phase-2 pass 1).

### What could break

- **Wrong env var (most likely):** `MENTOR_ENCRYPTION_KEY` not set or malformed in production. Symptom: `getEncryptionKey()` throws; the new route returns 500. Mitigation: pre-deploy verification that `isServerEncryptionConfigured()` returns `true`; the dry-run encrypt-decrypt test runs in staging first.
- **Schema mismatch:** the migration applies to staging but production has divergent state. Mitigation: schema validated against fresh production state pre-migration; staging mirrors production.
- **Decrypt failure (key mismatch):** the encrypted row was written with one key but the read uses a different key. Symptom: `decryptProfileData()` throws "unsupported state or unable to authenticate data." Mitigation: the dry-run encrypt-then-decrypt test verifies round-trip with the production key value before any real writes.
- **JSONB double-stringification (KG7):** the writer accidentally `JSON.stringify`'s the `encryption_meta` object. Symptom: `jsonb_typeof` returns `'string'` not `'object'`; future readers fail. Mitigation: the helpers pass the meta object directly to Supabase; KG7 typeof check runs as part of post-deploy verification.
- **AC7 surface accidentally engaged:** the wiring touches auth/cookie/session/redirect behaviour. Mitigation: the wiring is module-level (lib helpers + route file); zero edits to middleware, auth handlers, or cookie config. Confirmed pre-deploy by grep for any auth/session imports in the new files.

### What happens to existing sessions

Nothing. The change is additive — new tables, new route, new helpers. The founder's existing JWT session remains valid through the deploy. No cookie scope or session-validation behaviour is touched. AC7 standing constraint not engaged.

### Rollback plan

Three paths in order of preference:

**Path A (preferred — within minutes of deploy):** Flip `MENTOR_RAG_V1=false`. The new route exists but does not write to the new tables. Existing pipeline unaffected. Schema remains; no data loss.

**Path B (if data corruption suspected):** `DROP TABLE deferral_resolutions; DROP TABLE open_deferrals;` from a Supabase admin session. Reversible because no historical data exists pre-build (Phase-2 pass 1 is the proof endpoint per PR1).

**Path C (env var loss):** Restore `MENTOR_ENCRYPTION_KEY` from the founder's three-copy backup (Decision 4 Option 4A) into a fresh Vercel project. Application reads the key on next deploy. The existing encrypted data in `mentor_profiles` and the new tables remains decryptable.

If all three rollback paths are exhausted (catastrophic key loss + data corruption + env-var loss): the data is unrecoverable. R17f names this as the worst-case "protection that has failed as a protection." The mitigation is the three-copy backup discipline (Decision 4), not a fourth recovery path.

### Verification step (post-deploy, founder-performable)

```
# 1. Confirm the encryption is configured
curl -s https://www.sagereasoning.com/api/health | grep -i encryption

# Expected: a line indicating server encryption is configured

# 2. Confirm the new route returns 200 on a canonical test (founder-only auth required)
# (the test command is provided by the implementation session; uses founder auth)

# 3. Read back a written row in Supabase SQL editor:
SELECT id, encryption_meta, jsonb_typeof(encryption_meta) AS meta_type, length(encrypted_payload) AS payload_len
FROM open_deferrals
ORDER BY created_at DESC
LIMIT 1;

# Expected: meta_type = 'object'; payload_len > 0; encryption_meta.algorithm = 'AES-256-GCM'; encryption_meta.version = 1
```

### Explicit approval required

The implementation session does not proceed past Step 9 (the deploy) without the founder typing "OK" or "go ahead" in the chat — and that approval must be specific to the named risks above (not a general "yes proceed").

---

## Open questions (logged for the implementation session)

1. **`MENTOR_ENCRYPTION_KEY` already set in production?** Likely yes (since `mentor-profile-store.ts` reads from it and that pipeline is operational). Verify before generating a new key. If the existing key is in production but the founder has no backup, Step 2's ceremony runs against the existing key as the source of truth (read it from Vercel; back it up; never generate a new key when an existing one is in active use).

2. **BYTEA vs TEXT for ciphertext columns?** Both R17b-compliant. Default to TEXT (base64 ciphertext) for pattern consistency with `mentor_profiles.encrypted_profile`. Implementation session may switch to BYTEA if profiling shows base64 overhead is meaningful (~33% storage overhead for binary data).

3. **Per-user keys (Option 2C) for non-founder extension?** Out of scope for Phase 2 pass 1 (single-founder). Logged for re-examination at user-base extension.

4. **KMS migration?** Out of scope for Phase 2. Logged for future architecture refresh at scale (≥100 active users or first compliance trigger).

5. **Key rotation cadence?** The `version` field in `encryption_meta` is rotation-ready; no rotation needed at commencement. First rotation should be event-based (suspected compromise; founder discretion). Calendar cadence revisit at one-year anniversary of Phase-2 pass-1 commencement.

6. **Whether `engine_diagnostics` deserves separate columns or folded into the encrypted blob?** Per Decision 3 it gets its own ciphertext + meta columns. Implementation session may revisit if the row count or column cardinality becomes operationally awkward.

---

## AC7 compatibility posture (per the prompt's instruction)

This ADR drafting exercise touches no AC7 surface. The encryption wiring's implementation session likewise touches no AC7 surface — no auth/cookie/session/redirect behaviour changes. The session's Critical Change Protocol response §"What happens to existing sessions" names this explicitly: "Nothing. The change is additive — new tables, new route, new helpers. The founder's existing JWT session remains valid through the deploy. No cookie scope or session-validation behaviour is touched. AC7 standing constraint not engaged."

The only place AC7 *could* engage during the implementation session is if the new route's auth gate code is written defectively (e.g., the founder-only guard accidentally invalidates the JWT). Mitigation: the new route's auth gate is a standard `requireAuth(request)` pattern (per D14b §"Founder-only auth"), identical in shape to `/api/mentor/private/reflect`'s existing gate; no novel session/cookie code.

---

## Honest disclosure

This ADR drafts the architecture for the encryption wiring. It does not implement the wiring — that's the Critical-risk implementation session's work, executed under the Critical Change Protocol responses drafted above. The implementation session may revise specific details (BYTEA vs TEXT; helper module location; specific test naming) without revisiting this ADR's five named decisions. Material changes to any of the five named decisions require a new ADR or an explicit ADR-ENCRYPTION-WIRING-02 supersession entry.

The single biggest operational risk this ADR cannot eliminate is **founder discipline around the key backup ceremony** (Decision 4). The ADR makes the discipline explicit; the founder's execution of the discipline is what protects the data from worst-case loss. R17f names this honestly: a protection that locks the owner out has failed as a protection — but a protection that *requires the owner's ongoing custody discipline* is still a real protection, and that's what we have here.

---

## Approval gate

This deliverable is the architecture decision record for Phase-2 pass-1's Precondition 4. Approval pathway choice for the founder:

- **Path A — Adopt as drafted; move to `/adopted/` this session.** The ADR's five decisions become committed architecture; the implementation session executes against this commitment.
- **Path B — Adopt at separate session.** Drafting accepted; founder reviews offline; explicit Adopt at a follow-up session.
- **Path C — Hold for revision.** Specific revisions identified; ADR returns for next-iteration review.

If Path A: the ADR moves to `/adopted/` and the next-session prompt's "Phase-2 pass-1 readiness inventory" updates to "7 of 7 preconditions complete" (subject only to the encryption wiring's *implementation* session landing first per this ADR's specification).

If Path B: the ADR remains in `/drafts/`; revisit at the named follow-up session.

If Path C: revisions specified; founder calls.

---

*End of ADR-ENCRYPTION-WIRING-01. Implementation session is Critical risk; commencement awaits founder direction.*
