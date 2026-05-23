# Sage Assent Wrapper — A10 Per-Agent Credentials Design (Rewrite)

**Status:** Adopted 2026-05-17 under `D-ATL-A10-DESIGN-LOCKED-REWRITE-2026-05-17`. **Supersedes** `D-ATL-A10-DESIGN-LOCKED-2026-05-16` (the original A10 design — preserved in git history; predecessor's decision-log entry marked `Superseded by D-ATL-A10-DESIGN-LOCKED-REWRITE-2026-05-17` in the same operation). **Implementation status:** Designed (per 0a vocabulary) — the nine decisions below are specified, not built; the A10 build session (session #6 of 6 in the post-6b arc tail) is the final sub-session in the arc.
**Stream:** founder.
**Governs:** The build spec for the A10 build session — `code-critical` risk classification expected (the build session replaces the pre-A10 env-flag stopgap with per-agent token verification; new admin endpoint; schema additions to `api_keys`; new `credential_audit` Supabase table; new typical_* + scope + loop_id columns on `agent_accreditation`; Critical Change Protocol engages at the build session). The nine decisions below MUST be implemented as specified; the build session has discretion on file paths, helper naming, and test structure within those constraints.
**Does not govern:** The write-path build (step 7 — already complete and Live; Decision E names the seam that A10 fills). The kathekon-aligned alternative build (step 6 — already complete). The items 1–3 build (steps 2–3 — already complete). The trajectory-enriched developer hand-back report (step 4 — already complete). The Option D billing model build (`D-BILLING-MODEL-BUILD-WIRED-VERIFIED-2026-05-17` — Live; A10 integrates per the new "Integration with adjacent surfaces" section). The pass-through fields build (`D-PASS-THROUGH-FIELDS-BUILD-WIRED-VERIFIED-2026-05-17` — Verified; A10 integrates per the new "Integration with adjacent surfaces" section). Any subsequent Sage Assent surface evolution (multi-agent ownership flows post-launch; agentic-commerce VC interop if it becomes load-bearing; MCP-server credential issuance — all are future-session work).
**Sequencing:** step 6 of 6 in the new post-6b arc tail per `/operations/handoffs/founder/2026-05-16-A10-design-pass-close.md` Part 2. Predecessor: pass-through fields build (`D-PASS-THROUGH-FIELDS-BUILD-WIRED-VERIFIED-2026-05-17`). Successor: the A10 build session, which closes the post-6b arc.

---

## What changed from the predecessor design

This rewrite Supersedes `D-ATL-A10-DESIGN-LOCKED-2026-05-16` to integrate three things that changed since the original A10 design was adopted:

1. **Finding 1 correction (the `owner_user_id` + `agent_id` correction).** The 2026-05-16 post-session brainstorm (Part 2 of `/operations/handoffs/founder/2026-05-16-A10-design-pass-close.md`) identified that the A10 design's Decision C said "Extend `api_keys` table with `agent_id`, `owner_user_id`, `purpose`, `revoked_at` columns" — but the first two columns **already exist in production**. Reading the production schema at `/api/api-keys-schema.sql` confirms: `agent_id TEXT` (NULL; self-reported / unverified on legacy ecosystem rows; line 75); `owner_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL` (line 77 — **references `public.profiles(id)`, not `auth.users(id)`** as the original design assumed); index `idx_api_keys_owner_user_id` already exists (line 105). The rewrite (a) narrows the migration to only `purpose` + `revoked_at` as NEW columns; (b) corrects every `auth.users(id)` reference to `public.profiles(id)`; (c) adds a Postgres CHECK constraint enforcing the new semantic invariant: `WHERE purpose='atl_write'` rows have NOT NULL `agent_id` + NOT NULL `owner_user_id`.

2. **Option D billing model integration.** Option D went Live on 2026-05-17 (`D-BILLING-MODEL-BUILD-WIRED-VERIFIED-2026-05-17`) with the `loop_billing_events` ledger. The rewrite adds an "Integration with adjacent surfaces" section naming A10's posture toward this ledger: **no direct integration**. Credential lifecycle events stay in `credential_audit` (per Decision H). The write-path POST `/api/accreditation/[agent_id]` is NOT separately metered — the wrapper's triggering `/api/reason` call already emitted the `loop_billing_events` row; the POST is a downstream effect. The build session adds a nullable `loop_id` column to `agent_accreditation` so downstream consumers can JOIN against `loop_billing_events.loop_id` for traceability.

3. **Pass-through fields integration** (`D-PASS-THROUGH-FIELDS-BUILD-WIRED-VERIFIED-2026-05-17` — Verified). Seven fields now exist in the substrate type system: 5 on `EvaluatedAction` (`operation_class`, `target_system_vendor`, `target_system_detail`, `outcome_verification`, `reversibility_signal`) and 2 on `CarriedProfile` (`downstream_identity_model`, `path_posture`). The rewrite locks three sub-decisions for A10's integration: (3a) the 2 `CarriedProfile` fields become **nullable per-credential scoping columns** on `api_keys` for `purpose='atl_write'` rows (NULL = no restriction); (3b) the 4 `EvaluatedAction`-derived aggregates become **typical_* columns on `agent_accreditation`** exposed on `AccreditationPayload` — matching the existing `typical_deliberation_breadth` + `typical_kathekon_quality` pattern; (3c) **raw `EvaluatedAction` history is NOT persisted** (the existing wrapper-computes-aggregates-then-POSTs pattern is preserved; raw history deferred under PR7).

The nine A–I decisions below are restated in full (not patched diffs) for the build session's clarity. Sections unchanged from the predecessor design are noted as such where it helps; sections updated by the rewrite are marked with "**Updated 2026-05-17**" at the head of the affected subsection.

---

## Scope

**In scope (this design):** Nine locked design decisions defining A10's surface. The write-path build (step 7) installed an A10-shaped seam — the `verifyAgentIdOwnership(request, agent_id)` function in `/website/src/app/api/accreditation/[agent_id]/route.ts` whose pre-A10 body is just an env-flag check (`SUBSTRATE_WRITE_PATH_ENABLED === 'true'`). Per Decision C of the write-path design (`D-ATL-WRITE-PATH-DESIGN-LOCKED-2026-05-16`), A10 replaces that body with per-agent token verification. A10 is the auth seam's filler; this design specifies *how*.

- **Decision A** — Token format (Q1)
- **Decision B** — Issuance authority + agent_id binding (Q1.5)
- **Decision C** — Credential storage (Q2) — *Updated 2026-05-17 (Finding 1 correction + per-credential scoping)*
- **Decision D** — Issuance flow + surface (Q3) — *Updated 2026-05-17 (admin endpoint accepts optional scope params)*
- **Decision E** — Verification placement (Q4) — *Updated 2026-05-17 (CarriedProfile-based scoping check)*
- **Decision F** — Revocation (Q5)
- **Decision G** — Rotation + expiry (Q6)
- **Decision H** — Audit trail + observability (Q7)
- **Decision I** — Pre-A10 stopgap retirement (Q8)
- **NEW: Integration with adjacent surfaces** — three subsections covering Option D billing, pass-through fields, and the A6/A7 R20a perimeter.

**Out of scope:** code (build session); schema migrations (build session executes the elected DDL); changes to the existing `verifyAgentIdOwnership` call site (the function signature stays the same; only the body changes); changes to the write-path library (`atl-accreditation-writer.ts`); changes to the existing GET endpoint at `/api/accreditation/[agent_id]` (extends to expose 4 new typical_* fields per Decision 3b — the change is additive and backward-compatible); changes to the persistence layer's four async functions (already Verified); changes to the proximity-driven grade engine, authority mapper, or dimension levels; changes to the Senecan grade ladder; changes to the J1 ADR's Character Kernel category framing; changes to the existing `validateApiKey` function's behaviour (A10 adds a sibling function; existing callers are byte-untouched); changes to the `loop_billing_events` schema, the `computeLoopBill` helper, or the metering layer's call sites at `/api/reason` and `/api/score-iterate` (Decision 2 of the rewrite locked "no integration"); raw `EvaluatedAction` history persistence (Decision 3c locked "aggregates only"); the substrate's existing reasoning paths (Layer 1, 2, 3 untouched); future multi-agent-ownership flows; future agentic-commerce VC interop (deferred under PR7); future MCP-server credential issuance (deferred under PR7); future Option C tiered-per-action billing (deferred under PR7 — depends on `operation_class` being populated AND a customer demand signal).

---

## The underlying motivation

After step 7, the substrate carries a write surface at `POST /api/accreditation/[agent_id]` that is **inert by default** (`SUBSTRATE_WRITE_PATH_ENABLED` UNSET in Vercel → every POST returns 503). The pre-A10 stopgap (option (1) — feature-flag gated) is a coarse-grained gate: if the flag is set to `"true"`, *any* caller can write *any* row; if it's unset, *no* caller can write *any* row. This is appropriate for the build phase ("no current users" governing note from the build-arc cache), but it is not the long-term auth model. Decision C of the write-path design names A10 as the eventual filler: **per-agent token verification**, the auth model that scales beyond the founder.

Without A10, the write surface stays inert indefinitely (because flipping the flag accepts writes from anywhere) or exposed-unsafely (because flipping the flag accepts writes from anywhere). A10 is the unblocking step that lets the write surface become operational without being unsafe.

A10 also closes the post-6b arc. After it lands, the substrate has read AND write public surfaces, both authenticated, both auditable. The architectural foundation is complete. Subsequent work moves from "build the substrate" to "iterate on the substrate" — the K-category migration (translation-sandwich consumer migration), the Stage 1 closure work (lawyer engagement, FPE-5 TOS + liability), and the wrapper-iteration patterns Q9 names as deferred.

A non-design note: the existing `/website/src/lib/security.ts` already carries a mature opaque-token system for the ecosystem API (`sr_live_<32 hex>` tokens with SHA-256 hashing, tier system, monthly/daily caps, atomic usage tracking, Stripe linkage). A10 is designed to reuse this infrastructure rather than duplicate it — see Decision C's rationale. The Finding 1 correction strengthens this PR15-leaning posture: the `owner_user_id` + `agent_id` columns A10 needs **already exist** in production, so the migration is narrower than the predecessor design said.

---

## Decision A — Token format

### Why

The pre-A10 stopgap (`SUBSTRATE_WRITE_PATH_ENABLED === 'true'`) is a single boolean. Post-A10 the gate must accept some kind of caller-presented credential and verify it. The credential's *format* — what bytes the caller sends — is the load-bearing question. The choice cascades through every subsequent decision (storage shape, issuance shape, verification mechanics, revocation semantics).

### Elected position

**Opaque random tokens with server-side lookup.** Each A10 credential is a 32-hex-character random string prefixed with a fixed namespace identifier (`sr_atl_<32 hex>` — distinct from the existing `sr_live_<32 hex>` ecosystem prefix). The token is SHA-256-hashed at issuance and stored in the database; verification re-hashes the presented token and looks up the row. No claims are carried in the token itself — the database row carries them.

### Why this and not the alternatives

The token-format question had four candidate answers:

- **(a) JWT (signed JSON Web Token).** Self-contained claims; stateless verification (verify signature, read claims, no DB lookup). Rejected as not the right tool for this gate's specific job: A10 tokens are agent-scoped write credentials, not session tokens; revocation (Decision F) is load-bearing and JWT revocation is the hardest part of JWT (revocation lists; short expiry + refresh — all add weight); the verification surface needs the DB anyway to look up `agent_id` ownership, so the JWT statelessness payoff is partial. Worth revisiting if A10 grows to issue tokens consumed by external verifiers that can't query our DB.
- **(b) W3C Verifiable Credential.** Richest interop; fulfils F4 (AC10/AP2 mandate alignment) at the token layer. Rejected as overkill for an internal write-auth gate: the credential format third parties consume is the `AccreditationPayload` returned by the GET endpoint, not the bytes used to authenticate the POST. The two layers are separable. The agentic-commerce interop story — AP2 mandates — applies to the *credential data* (R18a Character Kernel claims), not to the *write authentication*. If a future agentic-commerce integration needs VC-formatted write tokens, A10 can be extended to support a second credential type alongside opaque tokens; the auth gate can accept multiple formats. F4's downstream-order target is A12 (OpenTelemetry / AC10 provenance fields), not A10's token layer.
- **(c) Hybrid (VC envelope + JWT claims).** Both interop and statelessness. Compounds the cost of both (a) and (b); most surface area to defend; most complexity. Rejected for the same reasons as (a) and (b), with extra weight.
- **(d) Opaque random token + server-side lookup.** *Adopted.* Reuses the production-tested `sr_live_<key>` pattern in `/website/src/lib/security.ts` (`hashKey` + `extractRawKey` + the lookup-and-verify flow); the build session leans on hundreds of lines of production code rather than re-implementing standard cryptography; revocation (Decision F) is trivial (`is_active = false` on the row); R18c interoperability is preserved at the *payload* layer (the GET endpoint's `AccreditationPayload`), not at the *auth* layer. Lightest build; lowest risk surface.

### Structural constraint

The token shape is `sr_atl_<32 hex chars>` — exactly 40 characters total. The `sr_atl_` prefix distinguishes A10 tokens from `sr_live_` ecosystem tokens at a glance; both kinds share the SHA-256 hash + lookup flow but verify against different rows (filtered by `purpose` per Decision C). The build session reuses `createHash('sha256').update(rawKey).digest('hex')` from the existing `hashKey` function or re-exports it; new tokens are generated server-side via `crypto.randomBytes(16).toString('hex')`.

Tokens are sent as `Authorization: Bearer sr_atl_<key>` headers (matching the existing `sr_live_` convention in `extractRawKey`). The `X-Api-Key` header is *not* accepted for A10 tokens (the build session enforces this; ecosystem `sr_live_` keys remain dual-accepted via `X-Api-Key` for the existing endpoints). This narrows A10's attack surface and keeps the two systems distinct.

### R-rule engagement

R0 (the audit trail's authenticity rests on the credential's binding to a specific `agent_id` — the opaque-token pattern with DB-stored claims is what makes this binding queryable post-hoc); R4 (the token carries no claims that could leak engine internals; verification returns only the bound `agent_id`); R17 (the primary engagement — A10 enforces *the right caller writes the right row*; opaque-token pattern is the simplest way to bind without leaking); R18a (the Character Kernel credential's integrity is protected by the auth gate; the *format* of the auth token doesn't affect the credential's category framing); R18c (additive — the auth-token format is invisible to third-party readers of the GET endpoint; verifiers parsing `AccreditationPayload` are unaffected); AC7 (ENGAGED at build session — new auth surface internals; Critical Change Protocol applies).

### Layer 1 implication

None. Auth-token format is a Layer 4 (HTTP transport) concern, not a Layer 1 contract concern.

### Deferred under PR7

- **VC / AP2 mandate alignment at the token layer.** Revisit condition: a downstream agentic-commerce integration requires VC-formatted write tokens (e.g., the substrate becomes a credential issuer for a third-party AP2-consuming agent). The opaque-token pattern doesn't preclude later adding a VC issuance flow as a second credential type. *Standards-body signal recorded 2026-05-20 (from `/inbox/6 agent protocols.rtfd`): Google donated AP2 to the FIDO Alliance on April 28, 2026; Mastercard contributed companion standard "Verifiable Intent." The layer is settling but A10's auth tokens remain functionally distinct from AP2 commercial-transaction mandates — A10 protects substrate writes; AP2 mandates carry user-authorised purchase intent. Trigger condition unchanged; the signal is recorded for the next revisitor.*
- **JWT for external verifiers.** Revisit condition: A10 tokens need to be verifiable by parties that can't query our DB (e.g., distributed verification across multiple substrate instances or federated identity providers).

---

## Decision B — Issuance authority + agent_id binding

### Why

The pre-A10 stopgap doesn't bind any caller to any agent_id (the env flag is global). Post-A10 every credential must bind to a specific `agent_id` (the "right caller writes the right row" constraint) AND to a specific *owner* (the entity that's responsible for the agent — who can revoke its credential, who's billed if there's a billing tier). The choice cascades into the storage shape (Decision C) and the issuance flow's surface (Decision D).

### Elected position

**Per-owner-account model with founder-only issuance pre-launch.** An *owner* is a `public.profiles` record (which is downstream of `auth.users`; one profile per auth user). Each A10 credential row carries both `owner_user_id` (the profiles.id of the owner) and `agent_id` (the specific agent the credential authorises writes for). Pre-launch, the founder is the only owner; the founder mints credentials manually through the admin endpoint (Decision D). Post-launch the same shape supports self-service: a signed-in user claims an `agent_id` they want to own; the system mints a credential bound to their `profiles.id` + their chosen `agent_id`.

**Updated 2026-05-17 (Finding 1 correction):** The original design said `owner_user_id REFERENCES auth.users(id)`. The production schema at `/api/api-keys-schema.sql` line 77 actually references `public.profiles(id) ON DELETE SET NULL`. The rewrite corrects the reference target throughout — A10 owners are profile-tracked users (which they will be in practice — every existing api_key holder is profile-tracked; future self-service A10 users will be profile-tracked too). Migrating to `auth.users(id)` would require dropping an FK on a live production table for no operational gain (profiles is downstream of auth.users; the foreign-key chain is one level longer but functionally equivalent). The `ON DELETE SET NULL` behaviour on the existing column is preserved — if a profile is deleted, the orphaned credential's `owner_user_id` goes NULL; the CHECK constraint (per Decision C below) then makes that row's `purpose='atl_write'` status inconsistent; the build session adds an admin-detect-and-revoke cleanup job (deferred under PR7) OR an immediate auto-revocation rule (build-session discretion within the constraint that orphaned `purpose='atl_write'` rows cannot pass verification).

The relationship is many-to-many in principle: one owner can hold credentials for multiple `agent_id`s; one `agent_id` *could* have multiple credentials issued to it (e.g., one for a CI integration, one for an orchestrator dashboard). The build session enforces "one credential per (owner, agent_id, purpose) tuple" via a uniqueness constraint; future use cases (CI integrations, multi-token-per-agent) can lift this if needed.

### Why this and not the alternatives

The issuance-authority question had four candidate answers:

- **(a) Founder-only admin endpoint, no owner-account binding.** Founder mints credentials manually; nothing tracks who-owns-what. Rejected because forecloses self-service without a future schema migration; loses the ability to bind credentials to accountable parties; doesn't track who the credential's "operator" is for billing or for compliance purposes.
- **(b) Self-service after Supabase user-auth, skip pre-launch phase.** Anyone signed in can mint a credential for any unclaimed `agent_id`. Rejected as too permissive for the pre-launch / no-current-users phase: it would mean the build session ships a public mint endpoint with race-condition + squatting risk; better to land the shape and gate it behind founder-only first, then open later.
- **(c) Open self-service (anonymous mint).** Any caller posts a desired `agent_id`; system mints if not taken. Rejected as squatting + abuse risk pre-launch; no accountable owner; no path to billing or compliance.
- **(d) Per-owner-account model; founder-only mint pre-launch.** *Adopted.* Matches the existing `stripe_customers.user_id → auth.users.id` pattern (production-proven) and the existing `api_keys.owner_user_id → public.profiles(id)` pattern (production-proven, corrected from the predecessor design). Self-service evolution is a later-session change to the *endpoint's authorisation logic* (open the admin endpoint to non-founder Supabase-authenticated users; or add a sibling self-service endpoint), not a schema change — the row shape already accommodates non-founder owners. Lowest blast radius pre-launch; cleanest path to self-service.

### Structural constraint

Every A10 credential row (rows where `purpose='atl_write'`) carries:
- `owner_user_id: uuid` — references `public.profiles(id) ON DELETE SET NULL`. **Column already exists** on `api_keys` per `/api/api-keys-schema.sql` line 77; reused not recreated. For `purpose='atl_write'` rows specifically, the value is required NOT NULL — enforced via the CHECK constraint defined in Decision C below (Postgres CHECK constraints can reference multiple columns, so the constraint is `CHECK (purpose != 'atl_write' OR (agent_id IS NOT NULL AND owner_user_id IS NOT NULL))`).
- `agent_id: text` — the bound agent_id. **Column already exists** on `api_keys` per `/api/api-keys-schema.sql` line 75; reused not recreated. The existing column is self-reported / unverified on legacy `purpose='ecosystem'` rows; for `purpose='atl_write'` rows it becomes load-bearing for auth (enforced via the same CHECK constraint above).
- A unique constraint on `(owner_user_id, agent_id, purpose)` for `purpose='atl_write'` — see Decision C for the partial unique index definition.

For the pre-launch phase, the *only* `owner_user_id` value present is the founder's `public.profiles(id)`. The admin endpoint (Decision D) authorises the founder via the existing `requireAuth` helper in `/website/src/lib/security.ts` and matches against a founder-specific check (e.g., the founder's `user.email` against the env-supplied `ADMIN_USER_EMAIL`, or the founder's `user.id` against `ADMIN_USER_ID`).

Post-launch self-service:
- An authenticated user posts to the admin endpoint with `{ agent_id, purpose: 'atl_write' }`.
- The endpoint creates a credential bound to `user.id`'s corresponding `profiles.id` + the supplied `agent_id` (if not already claimed by another `owner_user_id`).
- The "if not already claimed" check is the unique constraint above.
- Future work: a separate self-service endpoint, a UI surface, ownership-transfer flows — all deferred under PR7.

### R-rule engagement

R0 (the audit trail's binding to an accountable owner is what makes the trail trustworthy as evidence — without an owner_user_id, "this agent_id wrote this row" doesn't trace to a responsible party); R17 (the owner_user_id is the principal whose authorisation is checked; tying credentials to `public.profiles` leans on the existing profile mechanism's reuse of Supabase Auth's intimate-data protections); R18a (no category-language change; the auth surface protects integrity without affecting framing); R18b (ownership becomes part of what the badge documentation describes — added at the badge-docs update post-launch, deferred under PR7); AC7 (ENGAGED at build session — new auth surface; Critical Change Protocol applies).

### Layer 1 implication

None. Ownership is a Layer 4 (auth) concern, not a Layer 1 contract concern.

### Deferred under PR7

- **Multi-owner / shared-credential flows.** Revisit condition: a real use case surfaces (e.g., an organisation wants multiple humans to share an agent_id's credentials).
- **Ownership-transfer flows.** Revisit condition: a customer needs to move an agent_id from one account to another (e.g., team restructure).
- **Self-service mint endpoint (open Supabase-auth-only).** Revisit condition: pre-launch period ends OR a partner needs self-service issuance before then.
- **Orphaned-credential auto-revocation cleanup job.** Build session implements either immediate auto-revocation on `owner_user_id IS NULL` (recommended) OR an admin-detect-and-revoke periodic job. Revisit condition: real profile-deletion scenarios surface OR audit reports an orphaned `purpose='atl_write'` row.

---

## Decision C — Credential storage

**Updated 2026-05-17 — substantially.** The Finding 1 correction narrows the migration (no agent_id/owner_user_id ADDs; reuse existing columns); the per-credential scoping (Decision 3a of the rewrite) adds 2 new nullable columns; the typical_* aggregates persistence (Decision 3b + 3c of the rewrite) adds 4 nullable columns + 1 loop_id column to `agent_accreditation`; the new CHECK constraint enforces the load-bearing NOT NULL invariant for `purpose='atl_write'` rows.

### Why

The credentials must live somewhere queryable. The pre-A10 stopgap has nothing to store (a single env var). Post-A10 every credential is a database row carrying its hash, its owner, its agent_id, its status, its optional scoping (per Decision 3a of the rewrite), and its audit timestamps. Where these rows live — in a brand-new table or in an existing one — determines how much code the build session writes versus reuses.

### Elected position

**Extend the existing `api_keys` table** with new columns. The Finding 1 correction means only the following are NEW columns added in the build session's migration:

- `purpose TEXT NOT NULL DEFAULT 'ecosystem' CHECK (purpose IN ('ecosystem', 'atl_write'))` — discriminator distinguishing legacy ecosystem keys from A10 write tokens. Application-layer expansion to other values (`'mcp_server'`, etc.) is supported by removing/relaxing the CHECK constraint as new purposes are introduced. Existing rows default to `'ecosystem'`.
- `revoked_at TIMESTAMPTZ` — the audit timestamp for revocation events (per Decision F). NULL for active credentials.
- `scope_downstream_identity_model TEXT` — **NEW per Decision 3a of the rewrite.** Per-credential scoping for the `CarriedProfile.downstream_identity_model` field. NULL = "no restriction"; specific value = credential only matches CarriedProfiles with that exact value. CHECK constraint allows enum membership: `CHECK (scope_downstream_identity_model IS NULL OR scope_downstream_identity_model IN ('delegated_user', 'service_account', 'vendor_framework', 'api_key', 'browser_session', 'mcp_server', 'unknown'))`.
- `scope_path_posture TEXT` — **NEW per Decision 3a of the rewrite.** Per-credential scoping for the `CarriedProfile.path_posture` field. NULL = "no restriction"; specific value = credential only matches CarriedProfiles with that exact value. CHECK constraint allows enum membership: `CHECK (scope_path_posture IS NULL OR scope_path_posture IN ('endorsed', 'open_api', 'ambiguous', 'unsanctioned'))`.

The existing `agent_id TEXT` and `owner_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL` columns are reused; the existing `idx_api_keys_owner_user_id` index is reused.

The NEW CHECK constraint enforcing the load-bearing semantic invariant for `purpose='atl_write'` rows:

```sql
ALTER TABLE public.api_keys
  ADD CONSTRAINT api_keys_atl_write_requires_owner_and_agent
  CHECK (purpose != 'atl_write' OR (agent_id IS NOT NULL AND owner_user_id IS NOT NULL));
```

A10 verification queries filter `WHERE purpose = 'atl_write' AND agent_id = $1 AND is_active = true`.

### Updated structural constraint — schema migration text

The build session's schema migration is additive and idempotent:

```sql
-- 1. Discriminator column
ALTER TABLE public.api_keys
  ADD COLUMN IF NOT EXISTS purpose TEXT NOT NULL DEFAULT 'ecosystem';
ALTER TABLE public.api_keys
  ADD CONSTRAINT api_keys_purpose_check
  CHECK (purpose IN ('ecosystem', 'atl_write'));

-- 2. Revocation audit timestamp
ALTER TABLE public.api_keys
  ADD COLUMN IF NOT EXISTS revoked_at TIMESTAMPTZ;

-- 3. Per-credential scoping columns (Decision 3a of the 2026-05-17 rewrite)
ALTER TABLE public.api_keys
  ADD COLUMN IF NOT EXISTS scope_downstream_identity_model TEXT;
ALTER TABLE public.api_keys
  ADD CONSTRAINT api_keys_scope_identity_check
  CHECK (scope_downstream_identity_model IS NULL OR
         scope_downstream_identity_model IN
         ('delegated_user', 'service_account', 'vendor_framework',
          'api_key', 'browser_session', 'mcp_server', 'unknown'));

ALTER TABLE public.api_keys
  ADD COLUMN IF NOT EXISTS scope_path_posture TEXT;
ALTER TABLE public.api_keys
  ADD CONSTRAINT api_keys_scope_path_check
  CHECK (scope_path_posture IS NULL OR
         scope_path_posture IN
         ('endorsed', 'open_api', 'ambiguous', 'unsanctioned'));

-- 4. Load-bearing NOT NULL invariant for purpose='atl_write' rows
--    (Finding 1 correction from the 2026-05-17 rewrite)
ALTER TABLE public.api_keys
  ADD CONSTRAINT api_keys_atl_write_requires_owner_and_agent
  CHECK (purpose != 'atl_write' OR (agent_id IS NOT NULL AND owner_user_id IS NOT NULL));

-- 5. Indexes for A10 lookup paths
CREATE UNIQUE INDEX IF NOT EXISTS api_keys_atl_write_owner_agent_unique
  ON public.api_keys (owner_user_id, agent_id, purpose)
  WHERE purpose = 'atl_write';

CREATE INDEX IF NOT EXISTS api_keys_purpose_agent_id_idx
  ON public.api_keys (purpose, agent_id)
  WHERE purpose = 'atl_write';
```

The migration is idempotent (`IF NOT EXISTS` clauses; constraint `ADD` operations use named constraints that can be checked for prior existence via the build session's migration runner; if the runner doesn't support `ADD CONSTRAINT IF NOT EXISTS` natively, the build session wraps each `ADD CONSTRAINT` in a `DO $$ BEGIN ... EXCEPTION WHEN duplicate_object THEN NULL; END $$` block).

Existing `sr_live_<key>` rows: `purpose` defaults to `'ecosystem'`; `agent_id` and `owner_user_id` remain NULL on rows that pre-date this migration where the developer didn't supply them at mint time (no backfill needed; existing callers don't query these columns).

### Updated structural constraint — agent_accreditation extensions

The build session ALSO adds columns to `agent_accreditation` to support Decisions 3b (AccreditationPayload typical-class exposure) + 3c (aggregates-only persistence) + Decision 2 of the rewrite (loop_id join-traceability):

```sql
-- agent_accreditation extensions (Decisions 2 + 3b + 3c of the 2026-05-17 rewrite)
ALTER TABLE public.agent_accreditation
  ADD COLUMN IF NOT EXISTS typical_operation_class TEXT;
ALTER TABLE public.agent_accreditation
  ADD CONSTRAINT agent_accreditation_typical_op_class_check
  CHECK (typical_operation_class IS NULL OR
         typical_operation_class IN
         ('read', 'search', 'summarize', 'draft', 'recommend',
          'write', 'approve', 'execute', 'delete', 'unknown'));

ALTER TABLE public.agent_accreditation
  ADD COLUMN IF NOT EXISTS typical_target_system_vendor TEXT;
ALTER TABLE public.agent_accreditation
  ADD CONSTRAINT agent_accreditation_typical_vendor_check
  CHECK (typical_target_system_vendor IS NULL OR
         typical_target_system_vendor IN
         ('salesforce', 'microsoft', 'servicenow', 'sap', 'workday',
          'zendesk', 'hubspot', 'atlassian', 'other', 'none'));

ALTER TABLE public.agent_accreditation
  ADD COLUMN IF NOT EXISTS typical_outcome_verification TEXT;
ALTER TABLE public.agent_accreditation
  ADD CONSTRAINT agent_accreditation_typical_outcome_check
  CHECK (typical_outcome_verification IS NULL OR
         typical_outcome_verification IN
         ('self_reported', 'system_confirmed', 'external_auditor', 'not_applicable'));

ALTER TABLE public.agent_accreditation
  ADD COLUMN IF NOT EXISTS typical_reversibility_signal TEXT;
ALTER TABLE public.agent_accreditation
  ADD CONSTRAINT agent_accreditation_typical_reversibility_check
  CHECK (typical_reversibility_signal IS NULL OR
         typical_reversibility_signal IN
         ('reversible', 'partially_reversible', 'irreversible', 'unknown'));

-- Nullable loop_id for downstream JOIN against loop_billing_events
-- (Decision 2 of the 2026-05-17 rewrite — A10 does not write loop_billing_events
--  itself; this column supports forensic JOIN-based traceability)
ALTER TABLE public.agent_accreditation
  ADD COLUMN IF NOT EXISTS loop_id UUID;

CREATE INDEX IF NOT EXISTS agent_accreditation_loop_id_idx
  ON public.agent_accreditation (loop_id) WHERE loop_id IS NOT NULL;
```

The build session verifies the `agent_accreditation` table's existing column set against the live schema before generating these ALTERs (the live schema may have evolved; the build session is responsible for not introducing duplicate-column errors).

### Why this and not the alternatives

The credential-storage question had three candidate answers:

- **(a) Brand-new `agent_credentials` table.** Greenfield; `api_keys` untouched. Rejected on PR15 grounds: `api_keys` already implements every primitive A10 needs — SHA-256 hashing, atomic usage RPC (`increment_api_usage`), `is_active` + `suspended_reason` suspension mechanics, Stripe tier integration, audit-friendly timestamps. Building a parallel table would re-implement all of this from scratch. The build session would be much larger and the new table's plumbing would have to mature in production over time before being trustworthy at the same level as `api_keys`.
- **(b) Extend the existing `api_keys` table.** *Adopted.* Maximum reuse of production-tested infrastructure. The Finding 1 correction strengthens this further — the columns A10 needs (`agent_id`, `owner_user_id`) already exist; the migration is even smaller than the predecessor design said. The downside (mixing concerns: ecosystem API keys + Sage Assent write tokens in one table) is mitigated by the `purpose` column. Every query that cares about purpose filters on it; the row count overhead of carrying scope_* columns as nullable on existing rows is trivial.
- **(c) Two tables (existing `api_keys` for ecosystem; new `agent_credentials` for A10).** Cleanest separation; both surfaces visible. Rejected because the *behaviour* of the two surfaces is so similar (SHA-256 hash + lookup + is_active + suspension) that the duplication outweighs the conceptual cleanliness. The build session would write the same code twice; future bug fixes would need to land in two places.

### R-rule engagement

R0 (the row is the persistent record; `created_at` + `revoked_at` are the audit trail's primary timestamps; the load-bearing CHECK constraint makes the "`purpose='atl_write'` rows are auth-bound" invariant schema-level — protects against any code path bypassing the admin endpoint); R3 (no disclaimer impact — credential rows are not user-facing); R4 (the `purpose` column + scope_* columns add no engine-internal field; rows carry only authentication-relevant + scoping data); R17 (intimate-data adjacency — credential rows reference `public.profiles(id)` but carry no R17e-protected fields directly; the SHA-256-hashed token is not the token itself, so a row leak doesn't compromise tokens unless the hash can be reversed; the scope_* columns carry no PII); R18a (no category-language change — the typical_* columns on `agent_accreditation` expose Character-Kernel-adjacent operational metadata, not category framing); R18c (additive — third-party verifiers parsing `AccreditationPayload` gain four richer typical_* fields; verifiers that don't parse them are byte-unaffected); AC7 (ENGAGED at build session — new schema columns + new auth-relevant rows; Critical Change Protocol applies).

### Layer 1 implication

None. Storage is a Layer 4 concern.

### Deferred under PR7

- **Migrating existing `sr_live_<key>` rows to populate `owner_user_id`.** Revisit condition: a use case surfaces requiring per-owner accountability for ecosystem keys (currently they're founder-only via the suspension flow). Not blocking for A10.
- **Per-credential scope columns for more than identity_model + path_posture.** Future use cases might want to scope by `typical_operation_class` or per-vendor. Current shape is two-column. Revisit condition: a real customer requests it.
- **Raw EvaluatedAction history persistence on a new evaluated_action_history table.** Revisit condition: forensic queries beyond what `typical_*` aggregates answer become a real use case (e.g., enterprise compliance review needs per-action detail).
- **Postgres CHECK constraint on a wider `purpose` value space.** Current shape allows only `'ecosystem'` and `'atl_write'`. Revisit condition: a new purpose (`'mcp_server'`, etc.) is introduced; the build session relaxing the CHECK is Standard-risk. *Adoption signal recorded 2026-05-20 (from `/inbox/6 agent protocols.rtfd`): 14,000+ MCP servers listed at pulsemcp.com; Claude Desktop, Sourcegraph, Square, and others shipping MCP servers as a first-class adoption pattern. The `'mcp_server'` purpose value is the most likely next addition to the CHECK constraint. Trigger condition unchanged but more imminent.*

---

## Decision D — Issuance flow + surface

**Updated 2026-05-17 (minor — admin endpoint accepts optional scope params per Decision 3a of the rewrite).**

### Why

Credentials must be minted somewhere. The pre-A10 stopgap has no mint (the env var is set in Vercel). Post-A10 minting is an HTTP operation: the founder (or, post-launch, a signed-in user) posts a request and receives a credential. The choice of *where* this endpoint lives shapes its auth posture and how third parties discover it.

### Elected position

**New admin endpoint at `POST /api/admin/accreditation-credentials`.** Founder-only via Supabase auth pre-launch (admin check on `user.email` against `ADMIN_USER_EMAIL` env var, OR `user.id` against `ADMIN_USER_ID` env var — build session elects between these two patterns; both produce equivalent behaviour). The endpoint mirrors the existing `/api/admin/api-keys/route.ts` pattern.

Request body:
```ts
{
  agent_id: string,                              // required
  purpose: 'atl_write',                          // required (only this value accepted)
  label?: string,                                // optional human label; defaults to agent_id
  scope_downstream_identity_model?: string,      // optional, per Decision 3a; CHECK-constrained enum
  scope_path_posture?: string,                   // optional, per Decision 3a; CHECK-constrained enum
}
```

The endpoint:
1. Verifies the request is authenticated (`requireAuth` from `security.ts`).
2. Verifies the authenticated user is the admin (env-var check above).
3. Resolves the authenticated user's `auth.users.id` to the corresponding `public.profiles.id` (via a single Supabase query OR by direct lookup if the existing `requireAuth` helper already returns the profile id — build-session discretion).
4. Generates a `sr_atl_<32 hex>` token via `crypto.randomBytes`.
5. Hashes it with SHA-256.
6. Inserts a row into `api_keys` with `owner_user_id = profiles.id`, `agent_id = <body>`, `purpose = 'atl_write'`, `key_hash = <hash>`, `label = <body.label ?? agent_id>`, `tier = 'free'`, `is_active = true`, `monthly_limit = 100` (default; mirrors existing free-tier), `daily_limit = 100`, `max_chain_iterations = 1`, optional `scope_downstream_identity_model` + `scope_path_posture` from the body.
7. Logs the issuance event to the `credential_audit` table (per Decision H).
8. Returns the *raw* token to the caller once (the only time the raw token is shown; the DB stores only the hash).

The endpoint also supports `DELETE /api/admin/accreditation-credentials/:credential_id` for revocation (sets `is_active = false`, `revoked_at = now()`, `suspended_reason = '<body or default>'`; logs to `credential_audit`).

### Why this and not the alternatives

The issuance-flow question had four candidate answers:

- **(a) `POST /api/accreditation/[agent_id]/credentials`** (RESTful sub-resource). Rejected because the Sage Assent `/api/accreditation/[agent_id]` route group is the *public* surface (read endpoint Live for public verification; write endpoint accepting agent-authenticated POSTs). Mixing admin operations (mint, revoke) into a public route group complicates the security posture — admin endpoints belong elsewhere by convention.
- **(b) `POST /api/admin/accreditation-credentials`.** *Adopted.* Mirrors the existing `/api/admin/api-keys` pattern; clear admin namespace; auth posture is unambiguous (founder-only via Supabase auth; admin check). The build session can copy the existing admin endpoint's auth scaffolding and adapt.
- **(c) `POST /api/atl/credentials`** (substrate-internal namespace). Future-proofs for other Sage Assent surfaces but introduces a namespace (`/api/atl/`) that doesn't yet have peers; awkward to anchor a new convention on one endpoint.
- **(d) Out-of-band entirely (no HTTP issuance pre-launch).** Founder mints via one-off script + Supabase row insert. Rejected because the A10 build then needs a follow-on session to add the HTTP issuance later; better to land the surface in the same build (PR1 single-build proof) and put it behind the admin gate.

### Structural constraint

The build session creates:

- `/website/src/app/api/admin/accreditation-credentials/route.ts` (NEW) — `POST` handler (mint) + `DELETE` handler (revoke); both auth-gated via `requireAuth` + admin check.
- The admin check is implemented as a new helper `requireAdmin(request)` in `security.ts` (or inline in the route — build-session discretion within the constraint that the check is a single function reused by both POST and DELETE).
- The token-generation helper `generateAtlWriteToken()` returns `{ raw: 'sr_atl_<...>', hash: 'sha256-hex' }`. Lives in `security.ts` (build-session discretion on location).
- The auth-user-id → profiles-id resolution helper (`resolveProfileId(user_id) -> profile_id`) is added to `security.ts` if not already present, OR the build session uses an existing helper if one exists.
- Response shape on successful mint:
  ```json
  {
    "credential": {
      "id": "<uuid>",
      "agent_id": "<agent_id>",
      "owner_user_id": "<profile_id>",
      "label": "<label>",
      "tier": "free",
      "scope_downstream_identity_model": "<value-or-null>",
      "scope_path_posture": "<value-or-null>",
      "created_at": "<timestamp>"
    },
    "token": "sr_atl_<32 hex>",
    "warning": "This token is shown once. Store it securely. It cannot be retrieved later — only revoked and reissued."
  }
  ```
- Response shape on revoke: `{ "revoked": true, "credential_id": "<id>", "revoked_at": "<timestamp>" }`.

The `ADMIN_USER_EMAIL` (or `ADMIN_USER_ID`) env var is added to the deployment surface as part of this build; pre-deploy value is the founder's. Documented in Vercel's environment-variables panel; not committed to the repo.

### R-rule engagement

R0 (issuance is a load-bearing audit event; `credential_audit` row written per Decision H); R3 (the response carries an explicit warning that the raw token is shown once — honest about the credential's lifecycle); R4 (the response carries no engine internals); R17 (the admin check protects against unauthorised issuance — primary R17 engagement at the admin surface); R18a (no category-language change); AC5 (NOT engaged — the admin endpoint is not on the R20a perimeter; no distress surface); AC7 (ENGAGED at build session — new auth surface; Critical Change Protocol applies).

### Layer 1 implication

None. Issuance is a Layer 4 concern.

### Deferred under PR7

- **Self-service mint endpoint open to any Supabase-authenticated user.** Revisit condition: pre-launch period ends OR a partner needs self-service issuance before then. The build session ships founder-only; self-service is a future session change to the auth check.
- **Multiple-tokens-per-agent_id** (relax the unique constraint). Revisit condition: a use case surfaces (CI + orchestrator + dashboard each wanting their own token for the same agent_id).
- **Token visibility / re-display.** Currently the raw token is shown once. Revisit condition: customers report they lose tokens and need a recovery flow (current path: revoke and reissue).
- **Bulk-issuance flow.** Future operator might want to mint N credentials in one call. Current shape is one-at-a-time. Revisit condition: real customer ops demand surfaces.

---

## Decision E — Verification placement

**Updated 2026-05-17 — CarriedProfile-based scoping check (Decision 3a of the rewrite).**

### Why

The pre-A10 stopgap's auth gate is a single env-var check in `route.ts`. Post-A10 verification is a SHA-256 hash + DB lookup + `is_active` check + `agent_id` match + (per Decision 3a of the rewrite) optional scope check against the supplied CarriedProfile — substantial logic that doesn't belong in the route file. The choice is where this logic lives.

### Elected position

**In `/website/src/lib/security.ts`** alongside `validateApiKey`. A new function `validateAtlWriteToken(rawToken: string, agent_id: string, carriedProfile?: { downstream_identity_model?: string, path_posture?: string }): Promise<AtlWriteValidationResult>` performs the lookup, ownership check, and (when CarriedProfile values are provided) scope check, returning a discriminated result. The route's `verifyAgentIdOwnership(request, agent_id)` function's signature is extended to accept the CarriedProfile from the request body and pass it through; its body is rewritten to:

1. Extract the `Authorization: Bearer sr_atl_<...>` token from the request headers (or return `unauthorized` if absent).
2. Check the `SUBSTRATE_WRITE_PATH_ENABLED` env var per Decision I (the kill-switch retains its role).
3. Extract the supplied CarriedProfile's `downstream_identity_model` + `path_posture` from the request body (if present; the wrapper supplies these on the write-path POST).
4. Delegate to `validateAtlWriteToken(rawToken, agent_id, carriedProfile)`.
5. Map the result to the existing `AuthGateResult` discriminated type (`{ ok: true, claims }` or `{ ok: false, reason }`).

### Why this and not the alternatives

The verification-placement question had three candidate answers (unchanged from the predecessor design):

- **(a) Inside `route.ts`** (matches the pre-A10 stopgap location). Rejected because post-A10 the auth logic is too heavy for `route.ts` — extracting the token, hashing it, looking up the row, checking active status, comparing agent_id, checking scope, handling the discriminated result. `route.ts` would balloon. The route's concern is routing + HTTP-shape, not auth-mechanism.
- **(b) `/website/src/lib/security.ts` alongside `validateApiKey`.** *Adopted.* `security.ts` is the existing home for auth-library functions. `validateApiKey` (the closest cousin — the same opaque-token-with-DB-lookup pattern, just for ecosystem keys) already lives there. The build session leans on `extractRawKey`-style + `hashKey`-style helpers (refactored as needed to handle both `sr_live_` and `sr_atl_` prefixes). PR15-leaning: less new surface area, more existing-pattern reuse.
- **(c) New substrate-internal `/website/src/lib/substrate/atl-credentials.ts` library.** Mirrors the `atl-accreditation-writer.ts` substrate-local-library pattern. Rejected because the verification logic is *generic auth-shaped work*, not substrate-domain work; placing it in the substrate subtree implies it's substrate-specific when really it's a credential-verification function that happens to be invoked by a substrate route. `security.ts` reflects the function's true nature.

### Updated structural constraint

The build session creates the following in `security.ts`:

```ts
export type AtlWriteValidationResult =
  | {
      valid: true
      credential_id: string
      owner_user_id: string
      agent_id: string
      // Echo of the credential's scope columns (may be null);
      // caller can log for forensic auditing
      scope_downstream_identity_model: string | null
      scope_path_posture: string | null
    }
  | {
      valid: false
      reason:
        | 'no_token'         // no Authorization header or wrong prefix
        | 'invalid_token'    // hash lookup returned no row, or row is_active=false
        | 'wrong_agent'      // credential exists but binds a different agent_id
        | 'wrong_scope'      // credential exists, agent_id matches, but the supplied
                             // CarriedProfile.downstream_identity_model or .path_posture
                             // doesn't match the credential's non-null scope columns
    }

export async function validateAtlWriteToken(
  rawToken: string,
  agent_id: string,
  carriedProfile?: {
    downstream_identity_model?: string
    path_posture?: string
  },
): Promise<AtlWriteValidationResult>
```

The implementation:
1. If `rawToken` doesn't start with `sr_atl_`, return `{ valid: false, reason: 'no_token' }`.
2. Compute `keyHash = createHash('sha256').update(rawToken).digest('hex')`.
3. Query `api_keys` filtering `key_hash = $1 AND purpose = 'atl_write' AND is_active = true`, selecting `id, agent_id, owner_user_id, scope_downstream_identity_model, scope_path_posture`.
4. If no row, return `{ valid: false, reason: 'invalid_token' }` (this collapses two failure modes — wrong token or revoked token — into one response to avoid leaking which one fired; the audit log captures the specific case).
5. If the row's `agent_id !== agent_id` argument, return `{ valid: false, reason: 'wrong_agent' }` (this *does* distinguish — the caller is authenticated but writing to the wrong row; this is a different attack profile).
6. **Updated 2026-05-17 (Decision 3a check):** If the row has a non-null `scope_downstream_identity_model` AND the supplied carriedProfile's `downstream_identity_model` doesn't match, return `{ valid: false, reason: 'wrong_scope' }`. Same for `scope_path_posture`. The check is permissive: if the credential's scope column is NULL, the credential is unscoped and any CarriedProfile value passes; if the credential's scope column is set, the CarriedProfile must match exactly. If the credential's scope is set but the CarriedProfile field is missing (the wrapper didn't supply it), the check fails closed (`wrong_scope`) — a scoped credential requires the caller to supply the scoping signal.
7. Otherwise return `{ valid: true, credential_id, owner_user_id, agent_id, scope_downstream_identity_model, scope_path_posture }`.

The route's `verifyAgentIdOwnership` is rewritten to:

```ts
async function verifyAgentIdOwnership(
  request: NextRequest,
  agent_id: string,
  body: { carried_profile?: { downstream_identity_model?: string; path_posture?: string } } | null,
): Promise<AuthGateResult> {
  // Decision I — kill-switch retains its role.
  if (process.env.SUBSTRATE_WRITE_PATH_ENABLED !== 'true') {
    return { ok: false, reason: 'not_enabled' };
  }
  // Extract token.
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer sr_atl_')) {
    return { ok: false, reason: 'unauthorized' };
  }
  const rawToken = authHeader.slice(7).trim();
  // Decision E — delegate to the new validateAtlWriteToken in security.ts.
  const carriedProfile = body?.carried_profile;
  const result = await validateAtlWriteToken(rawToken, agent_id, carriedProfile);
  if (!result.valid) {
    // Map fine-grained reasons to the route's AuthGateResult; the route
    // returns 401 for all failure modes (no information leak to attackers)
    // but the audit log (Decision H) captures the specific reason.
    return { ok: false, reason: 'unauthorized' };
  }
  return { ok: true, claims: { agent_id: result.agent_id } };
}
```

The function becomes `async` (was synchronous pre-A10); the call site at the route (`const auth = await verifyAgentIdOwnership(...)`) already supports this. The route's POST handler is responsible for parsing the body once and passing the relevant subset to `verifyAgentIdOwnership` — the build session ensures the body is parsed only once (no double-parse cost).

### R-rule engagement

R0 (verification is part of the audit trail's authenticity guarantee — every successful write event is now traceable to a specific credential row AND the credential's scope at the time of verification); R4 (the validation function returns only the bound agent_id + credential identifiers + scope echoes; no engine internals); R17 (primary R17 engagement at the verification point — the scope check is what makes per-credential scoping meaningful at runtime); R18a (no category-language change); AC7 (ENGAGED at build session — new auth surface internals; Critical Change Protocol applies); KG1 (engaged at build — await all DB reads; the new validation function's Supabase query is awaited).

### Layer 1 implication

None.

### Deferred under PR7

- **Caching successful validations.** Currently every POST does a DB lookup; for high-frequency callers this could be optimised. Revisit condition: a real performance issue surfaces (latency or DB load).
- **Token rate-limiting per credential** (separate from per-IP `checkRateLimit`). Revisit condition: an individual credential abuses the write endpoint.
- **Wider scope check** (e.g., scope by `target_system_vendor` or `typical_operation_class`). Current shape scopes by 2 CarriedProfile fields. Revisit condition: real customer demand for vendor-or-action scoping.
- **Scope check telemetry separately from auth-failure telemetry.** Currently both fail-modes log via `logAtlVerifyEvent`; a `wrong_scope` failure may warrant a separate alert signal (it indicates a customer integration mismatch, not an attack). Revisit condition: operational experience shows the two signals warrant different escalation.

---

## Decision F — Revocation

(Unchanged from the predecessor design except for the `revoked_at` column being created by the migration in Decision C above — the column was originally listed under Decision C; this is preserved.)

### Why

Credentials must be revocable — leaked tokens, compromised owners, end of a credential's intended lifecycle. The existing `api_keys` table already supports the pattern via `is_active: boolean` and `suspended_reason: text`. A10's choice is whether to reuse this or add a separate revocation list.

### Elected position

**Reuse the existing `is_active` column + add a `revoked_at` timestamp column.** Revocation is `UPDATE api_keys SET is_active = false, revoked_at = now(), suspended_reason = <reason> WHERE id = <credential_id>`. Verification already filters on `is_active = true` (per Decision E). The `revoked_at` column carries the *when* for audit purposes; the existing `suspended_reason` carries the *why*.

### Why this and not the alternatives

(Unchanged from the predecessor design; abbreviated here.) Reuse-`is_active` + add-`revoked_at` adopted over separate-revocation-table, no-revocation-time-bounded-only, and both-column-plus-audit-table-defensive. The `credential_audit` table from Decision H + the `revoked_at` column together approximate the defensive option at lower cost.

### Structural constraint

Per the migration text in Decision C above, `revoked_at TIMESTAMPTZ` is added in the same migration.

Revocation is performed by the `DELETE /api/admin/accreditation-credentials/:credential_id` handler (per Decision D). The handler:

1. Authenticates the caller (`requireAuth` + admin check).
2. Validates that the credential exists, belongs to an A10 credential row (`purpose = 'atl_write'`), and is currently active.
3. Sets `is_active = false`, `revoked_at = now()`, `suspended_reason = <body.reason ?? 'admin_revocation'>`.
4. Writes a `credential_audit` row (per Decision H).
5. Returns the response shape per Decision D.

Reactivation: not supported in the build session. Once revoked, a credential stays revoked; if the owner needs a fresh credential, they issue a new one. (Reactivation could be added later; see PR7.)

### R-rule engagement

R0 (revocation events are audit-trail-load-bearing); R17 (revocation enforcement is part of the auth posture — a revoked credential's verification fails closed); AC7 (ENGAGED at build session — new admin operation; Critical Change Protocol applies).

### Layer 1 implication

None.

### Deferred under PR7

- **Reactivation (unrevoke).** Revisit condition: a legitimate use case surfaces (e.g., revoked-in-error needs to be reversed without forcing the owner to re-onboard).
- **Per-credential revocation reasons (taxonomy).** Currently `suspended_reason` is free-text. Revisit condition: forensic analysis requires categorised reasons.

---

## Decision G — Rotation + expiry

(Unchanged from the predecessor design.)

### Why

Once issued, do credentials expire? Can they be rotated? Long-lived secrets carry leak risk; short-lived secrets carry operational overhead. The choice depends on the threat model and the production capacity to manage renewals.

### Elected position

**No expiry; only revocation.** Credentials live until explicitly revoked. The build session adds no `expires_at` column. This matches the existing `api_keys` pattern (production tokens have no expiry). Renewal is "issue a new credential, revoke the old one" — a flow the admin endpoint already supports (mint a new one; revoke the old one; the owner switches their stored credential).

### Why this and not the alternatives

(Unchanged from the predecessor design.) No-expiry-only-revocation adopted over long-expiry-plus-renewal, short-expiry-plus-refresh-flow, and configurable-per-credential-expires_at. The trade-off (a leaked credential remains valid until detected and revoked) is mitigated by Decision H's observability and Decision F's easy revocation.

### Structural constraint

No schema change for this decision. Verification per Decision E does not check expiry. The build session documents in `security.ts` the design intent ("A10 credentials have no expiry; renewal is revoke-and-reissue") so future changes are deliberate.

### R-rule engagement

R0; R17.

### Layer 1 implication

None.

### Deferred under PR7

- Per-credential `expires_at` column; refresh-token flow; automated rotation reminders (all unchanged from the predecessor design).

---

## Decision H — Audit trail + observability

(Unchanged from the predecessor design.)

### Why

Auth events are forensically important. The pre-A10 stopgap had nothing to audit (a single env var). Post-A10 there are three event classes: *verification* (every POST attempt), *issuance* (each new credential), *revocation* (each credential disabled). The event rates differ by orders of magnitude (verification ~ writes per second at peak; issuance ~ a few per day; revocation ~ rare). The audit strategy must match.

### Elected position

**Asymmetric audit: Vercel structured logs (verification path) + Supabase `credential_audit` table (issuance + revocation events).** Verification fires on every POST and emits a `console.log(JSON.stringify(event))` event in the same shape pattern as Decision G of the write-path design (`atl_write` events). Issuance and revocation each write a row to a new `credential_audit` Supabase table with structured fields (`event_type`, `credential_id`, `actor_user_id`, `agent_id`, `timestamp`, `details`).

### Why this and not the alternatives

(Unchanged from the predecessor design; abbreviated here.) Asymmetric (Vercel logs + Supabase table) adopted over Vercel-logs-only, Supabase-table-only, and minimal-no-app-logging. The asymmetric rates argue for the asymmetric surface.

### Structural constraint

**Vercel-logs event shape (verification path):**

```json
{
  "kind": "atl_verify",
  "agent_id": "<the agent_id>",
  "outcome": "ok" | "no_token" | "invalid_token" | "wrong_agent" | "wrong_scope" | "not_enabled",
  "credential_id": "<credential_id if ok, else null>",
  "scope_downstream_identity_model": "<credential's scope value, or null>",
  "scope_path_posture": "<credential's scope value, or null>",
  "supplied_downstream_identity_model": "<CarriedProfile value, or null>",
  "supplied_path_posture": "<CarriedProfile value, or null>",
  "ip": "<x-forwarded-for>",
  "elapsed_ms": <number>,
  "timestamp": "<ISO 8601>"
}
```

**Updated 2026-05-17:** The event shape includes `'wrong_scope'` in the outcome enum AND four new optional fields capturing the scope check's inputs (the credential's scope columns + the supplied CarriedProfile values). When `outcome='wrong_scope'`, all four fields are populated; when `outcome='ok'`, the credential's scope columns are populated and the supplied values that matched are populated.

Emitted once per `validateAtlWriteToken` call in `security.ts`. Build session adds a helper (e.g., `logAtlVerifyEvent`) inside `security.ts` for consistency.

**`credential_audit` Supabase table:**

```sql
CREATE TABLE IF NOT EXISTS credential_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL, -- 'issue' | 'revoke'
  credential_id uuid NOT NULL REFERENCES api_keys(id),
  actor_user_id uuid REFERENCES public.profiles(id), -- the admin or owner who triggered the event
  agent_id text NOT NULL,
  details jsonb, -- optional context: { reason?: string, label?: string, tier?: string, scope_downstream_identity_model?: string, scope_path_posture?: string, etc. }
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS credential_audit_credential_id_idx ON credential_audit (credential_id);
CREATE INDEX IF NOT EXISTS credential_audit_agent_id_idx ON credential_audit (agent_id);
CREATE INDEX IF NOT EXISTS credential_audit_actor_user_id_idx ON credential_audit (actor_user_id);
```

**Updated 2026-05-17:** `actor_user_id` references `public.profiles(id)` (matching the Decision 1 correction). The `details jsonb` column carries the credential's scope columns at the time of the event (so a future revocation has the scope-at-issuance for forensic comparison).

Writes:
- Issuance handler writes one `event_type = 'issue'` row per successful mint, capturing `actor_user_id` (the admin's profile id), `agent_id` (the bound id), `details` (the label, tier, scope_*).
- Revocation handler writes one `event_type = 'revoke'` row per successful revoke, capturing `actor_user_id` (the admin's profile id), `agent_id` (the bound id), `details` (the suspension reason, scope_* at the time).

Both writes are awaited (KG1 rule 2) inside the same transaction-shaped flow as the `api_keys` UPDATE / INSERT. If the audit-row write fails, the issuance/revocation fails closed: the error propagates back to the admin endpoint's caller. (This is intentional — auditless issuance is worse than failed issuance.)

### R-rule engagement

R0 (the audit table IS the audit trail for credential lifecycle events — load-bearing for R0; the rewrite's scope fields in the event shape make scope-related forensic queries possible); R3 (verification-event logs avoid PII; only the wrapper-supplied agent_id, the outcome, and operational fields are logged); R17 (the audit table makes credential-related compliance events queryable — supports R17e-style audit requests if they're ever extended to auth events); R18a (no category-language change); AC7 (ENGAGED at build session — new audit surface; Critical Change Protocol applies); AC10 (the credential_audit table is the start of a structured provenance surface — see PR7 below); KG1 (engaged at build — every audit write is awaited and throws on error; no fire-and-forget).

### Layer 1 implication

None.

### Deferred under PR7

- **AC10 provenance fields linking `agent_accreditation` writes to `credential_audit` issuance events.** Revisit condition: A12 (OpenTelemetry / AC10 implementation) — per F4 in `/operations/agentic-commerce-findings-downstream-order.md`, AC10 alignment with AP2 mandate output is named at A12; A10's `credential_audit` table is the upstream provenance surface that A12 builds on.
- **`credential_audit` row partitioning / retention policy.** Revisit condition: the table grows large enough to need archival (probably years out).
- **Failed-verification rate-limiting per IP.** Currently `checkRateLimit` handles per-IP for all routes; a per-IP per-failure-type rate limit could harden against credential-stuffing. Revisit condition: a real attack pattern surfaces.

---

## Decision I — Pre-A10 stopgap retirement

(Unchanged from the predecessor design.)

### Why

The pre-A10 stopgap (`SUBSTRATE_WRITE_PATH_ENABLED` env var) is currently load-bearing: it's the only gate. Post-A10 it becomes secondary — A10 verification is the primary gate. The choice is whether the env-flag check stays in the code or is removed.

### Elected position

**Keep `SUBSTRATE_WRITE_PATH_ENABLED` as a kill-switch.** The env-flag check remains at the top of the `verifyAgentIdOwnership` function. Pre-A10 semantics: "is the write surface enabled at all". Post-A10 semantics: "if unset, override A10 and block all writes globally". The check costs nearly nothing (one env-var read per request); it provides defence-in-depth.

### Why this and not the alternatives

(Unchanged from the predecessor design.) Keep-as-kill-switch adopted over remove-entirely and staged-rollout-mechanism. Defence-in-depth at near-zero cost.

### Structural constraint

The build session preserves the env-flag check at the top of `verifyAgentIdOwnership` (per Decision E's structural constraint). The check's behaviour:

- If `process.env.SUBSTRATE_WRITE_PATH_ENABLED !== 'true'`: return `{ ok: false, reason: 'not_enabled' }` → route returns 503 (per the existing write-path build).
- Otherwise: proceed to the A10 token verification path (per Decision E).

The Vercel env var:
- Stays UNSET by default. The build session does not change the deployment state.
- Founder explicitly sets it to `"true"` to enable A10-gated writes. Setting it to anything else (e.g., `"false"`, `"0"`, empty string) keeps the route inert.
- Documented in `security.ts` (next to `validateAtlWriteToken`) and in the build session's decision-log entry as a kill-switch with the dual-semantics history.

The build session updates the route file's header comments to describe the post-A10 behaviour:
- Pre-A10: the env flag was the only gate.
- Post-A10: the env flag is the kill-switch; A10 token verification is the primary gate. Both must succeed.

### R-rule engagement

R0 (the kill-switch is documented as part of the audit trail's recoverability — the operator can prove they had emergency-stop capability); R3 (the kill-switch's 503 response message is the same as pre-A10 — "writes not yet enabled" — non-leaking); R17 (defence-in-depth at the auth surface); AC7 (the env-flag check is part of the auth surface; AC7 ENGAGED at build session for the surface as a whole).

### Layer 1 implication

None.

### Deferred under PR7

- **Per-credential kill-switch (vs global).** Currently the env flag is global. Revisit condition: a per-credential disable need surfaces that revocation doesn't satisfy (unlikely — revocation already covers this).
- **Kill-switch dashboard.** Currently the founder flips the env var in Vercel's UI. Revisit condition: ops requires a faster + UI-driven flip path.

---

## Integration with adjacent surfaces (NEW 2026-05-17)

A10's credential surface integrates with three adjacent surfaces. This section names A10's posture for each; the build session implements per the structural constraints.

### §Option D billing (loop_billing_events)

**Posture: no direct integration.** The Option D metering layer (`D-BILLING-MODEL-BUILD-WIRED-VERIFIED-2026-05-17`; Live in production) writes one `loop_billing_events` row per billable wrapper invocation. A10 does NOT write `loop_billing_events` rows for any of its operations:

- **Issuance** (POST `/api/admin/accreditation-credentials`): writes to `credential_audit` only (per Decision H). Not billable.
- **Revocation** (DELETE `/api/admin/accreditation-credentials/:id`): writes to `credential_audit` only. Not billable (corrective action).
- **Write-path POST** (`/api/accreditation/[agent_id]`): NOT separately metered. The wrapper's triggering `/api/reason` call already emitted the `loop_billing_events` row; the write-path POST is a downstream effect of that loop. Billing it separately would double-bill the same logical loop.

**Structural constraint — agent_accreditation.loop_id column (Decision 2 of the rewrite).** The build session adds a nullable `loop_id UUID` column to `agent_accreditation` (per Decision C's migration text above) so downstream consumers can JOIN `loop_billing_events.loop_id` against `agent_accreditation.loop_id` for forensic traceability ("which loop triggered this accreditation update?"). The wrapper populates the column when it supplies `X-Loop-Id` on the write-path POST; if absent, the column is NULL. This is observability infrastructure, not billing.

**R-rule engagement:** R0 (the loop_id column extends the audit trail's traceability without changing the billing surface); R5 (no change to the prospective formula; Option D's R5-by-construction property is preserved); AC7 (engaged at build session via the new column on a live table — additive nullable column, idempotent migration).

**Deferred under PR7:**
- **Option C tiered-per-action billing.** When activated, the per-action `operation_class` becomes a billing-gate field. Implementation joins `loop_billing_events` against `agent_accreditation` to derive `dominant_operation_class` for the loop. Current shape supports the JOIN without separate billing-side changes.
- **Per-credential billing tiers.** A future credential could carry a `tier_override` column for negotiated rates. Current shape doesn't include this. Revisit condition: first enterprise contract negotiation.
- **Webhook on credential-driven billing events.** Real-time webhook when a credential's loops cross a threshold. Revisit condition: customer requests it.

### §Pass-through fields (the 7 fields landed 2026-05-17)

**Posture: integrated per Decisions 3a + 3b + 3c of the rewrite.** The seven fields (5 on `EvaluatedAction`, 2 on `CarriedProfile`) integrate as follows:

**Per-credential scoping (Decision 3a).** The 2 `CarriedProfile` fields (`downstream_identity_model`, `path_posture`) become **nullable scoping columns** on `api_keys` for `purpose='atl_write'` rows (`scope_downstream_identity_model`, `scope_path_posture`). NULL on a credential = "no restriction"; specific value = the credential only matches CarriedProfiles with that exact value. Enforcement at verification time per the updated Decision E. The admin endpoint (Decision D) accepts optional scope params on issuance.

**AccreditationPayload typical-class exposure (Decision 3b).** The 4 `EvaluatedAction`-derived aggregates (`typical_operation_class`, `typical_target_system_vendor`, `typical_outcome_verification`, `typical_reversibility_signal`) become **typical_* columns on `agent_accreditation`** (per Decision C's migration text above). The existing `buildAccreditationPayload` in `/website/src/lib/substrate/trust-layer/accreditation/accreditation-record.ts` extends to expose all four — matching the existing `typical_deliberation_breadth` + `typical_kathekon_quality` pattern. The exposure is additive on the `AccreditationPayload` shape; third-party verifiers that don't parse the new fields are byte-unaffected; verifiers that do parse them gain richer procurement signal.

**Persistence shape (Decision 3c).** Aggregates only — typical_* fields persist on `agent_accreditation`. Raw `EvaluatedAction` history is NOT persisted. The wrapper computes the typical_* aggregates from its in-memory `EvaluatedAction[]` history (using the existing window-aggregator + `computeWindowSnapshot` infrastructure) before each POST; the substrate persists the aggregates received in the POST body. This matches the existing wrapper-computes-aggregates-then-POSTs pattern; raw history persistence is deferred under PR7.

**Structural constraint — buildAccreditationPayload extension.** The build session extends `/website/src/lib/substrate/trust-layer/accreditation/accreditation-record.ts` to:

```ts
export function buildAccreditationPayload(
  record: AccreditationRecord
): AccreditationPayload {
  return {
    // ... existing fields ...
    typical_deliberation_breadth: record.typical_deliberation_breadth,
    typical_kathekon_quality: record.typical_kathekon_quality,
    // NEW per Decision 3b of the 2026-05-17 rewrite:
    typical_operation_class: record.typical_operation_class ?? null,
    typical_target_system_vendor: record.typical_target_system_vendor ?? null,
    typical_outcome_verification: record.typical_outcome_verification ?? null,
    typical_reversibility_signal: record.typical_reversibility_signal ?? null,
  }
}
```

The `AccreditationRecord` type (in `/website/src/lib/substrate/trust-layer/types/accreditation.ts`) extends with the four new optional fields (all defaulting to `undefined` for backward compatibility). The `AccreditationPayload` type extends with the same four nullable fields. The build session updates both type declarations + the port-mirror discipline (if the source-of-truth file `/trust-layer/types/accreditation.ts` is being maintained — per the predecessor close's open question, this file is currently drifted; the build session has discretion on whether to reconcile here or defer to the source-of-truth reconciliation session).

**R-rule engagement:** R0 (the typical_* exposure makes the agent's operational footprint honestly assessable by procurement reviewers); R3 (no PII in the typical_* fields — they're enum aggregates); R4 (engine internals stay closed); R9 (no outcome promises — typical_* fields describe attempted operations, not outcomes); R10 (marketplace compliance — the AccreditationPayload's enum vocabularies are consistent across marketplace + api-docs + this payload); R17 (the per-credential scoping enforces "this credential is bound to a specific identity-model + path-posture posture" — primary R17 engagement on the scoping side); R18a (no category-language change — typical_* fields are operational metadata, not Character Kernel category); R18c (additive — third-party verifiers gain richer signal without breaking existing parsers); AC7 (engaged at build session — new columns + extended payload + extended validation logic); KG1 (engaged at build — all new DB writes/reads awaited).

**Deferred under PR7:**
- **Raw EvaluatedAction history persistence.** A new `evaluated_action_history` table; one row per EvaluatedAction. Revisit condition: forensic queries beyond what typical_* aggregates answer become a real use case.
- **Per-vendor scoping** (scope_target_system_vendor on credentials). Current shape scopes by 2 CarriedProfile fields. Revisit condition: real customer demand for vendor-level scoping.
- **R20a risk_class derivation from pass-through fields.** A future session could elect to derive `risk_class` from `(operation_class, reversibility_signal, outcome_verification)`. Current shape keeps risk_class independently set. Revisit condition: real wrapper data shows the manual risk_class setting is mis-calibrated relative to these structural fields.

### §A6/A7 R20a perimeter

**Posture: A10 does not engage A6 or A7.** The A10 admin endpoint (`POST /api/admin/accreditation-credentials`) is not on the R20a perimeter — it's an admin operation accessible only to the founder via Supabase auth, not a public-facing reasoning surface that could surface distress. The write-path POST (`/api/accreditation/[agent_id]`) is similarly off-perimeter; it's a substrate write, not user-facing reasoning. The R20a perimeter remains exactly the eight routes defined under A6/A7 (per `D-ATL-R20A-GATE-VERIFIED-2026-05-13`); A10 adds no ninth route to the perimeter.

**R-rule engagement:** R20 (NOT engaged); AC5 (NOT engaged — no perimeter change); PR6 (NOT engaged — no R20a / distress-classifier surface).

**Deferred under PR7:**
- **Reversibility-signal-driven R20a derivation** (cross-referenced above). If a future session elects this, the R20a perimeter logic gains a new input source but the perimeter routes don't change.

### §Control-layer alignment — kill-switch posture + control-map rows (NEW 2026-05-20)

**Source:** `/inbox/20260512-v6e-promptkit-1.md` + `/inbox/AI Agent Shipping readiness.rtfd` ("Infrastructure as the Control Layer"), placed 2026-05-20. The essay names a seven-row control map and a five-layer kill switch that a production agent must satisfy. A10 is a control-layer surface; this subsection maps A10's existing decisions onto the two frameworks so the design's production-readiness is legible in the now-standard vocabulary. No new decisions; documentation only.

**Seven-row control-map position.** A10 is primarily the substrate's **Row 3 (identity / authorization — "who is the agent acting for?")** + **Row 7 (kill switch / revocation — "how do we stop it?")** surface. Decision B (per-owner-account binding) + Decision 3a (per-credential scoping) implement the essay's "delegated authority with constraints" (the WorkOS-scoped-credentials / Microsoft Entra-Agent-ID pattern the essay names). Decision H (credential_audit + verification logs) covers **Row 6 (observability / audit — "how do we know what happened?")**. Rows 1 (runtime/state), 2 (data governance), and 4 (tool access) are out of A10's remit; Row 5 (payments) is Option D's domain (see below).

**Five-layer kill-switch coverage.** A10 covers three of the five layers:

- **Layer 2 (Identity — credentials revoked mid-run): COVERED.** Decision F revocation (`is_active = false`) plus Decision E's no-caching posture (every POST re-queries the DB) means a revoked credential fails the very next verification — the "takes effect before the next action, not at the next token refresh" property the essay demands.
- **Layer 1 (Runtime — execution environment force-stop): COVERED (serverless-equivalent).** Decision I's `SUBSTRATE_WRITE_PATH_ENABLED` env flag is the runtime kill switch for a serverless deployment — there is no long-running process to terminate; flipping the config blocks all subsequent writes without a deploy.
- **Layer 3 (Gateway — tool calls blocked at a choke point): COVERED.** `verifyAgentIdOwnership` is the application-level gateway; the kill-switch flag is checked there before any write proceeds.
- **Layer 4 (Payment — spend frozen independently of agent logic): OUT OF A10's REMIT; currently a deferred gap.** This is Option D's domain. Per `/adopted/billing-model-design.md` (2026-05-20 control-layer annotations), the payment-layer kill switch (budget-cap enforcement + customer-side overage caps) is deferred under PR7. A10 does not address it.
- **Layer 5 (Framework — workflow interrupted before the next sensitive node): N/A.** A10 protects a single-write surface, not a multi-step workflow. The framework-layer kill switch is relevant to the purpose-discovery product — see `/drafts/purpose-discovery-product-design.md` Q-OPEN-14.

**R-rule engagement:** R0 (the layered kill-switch posture is part of the audit trail's recoverability — the operator can demonstrate emergency-stop capability at three independent layers); R17 (defence-in-depth at the auth surface). No build-session work change beyond the agent-card.json auth declaration already added 2026-05-20.

**Deferred under PR7:**
- **Layer 4 payment kill-switch coordination.** If a future session wants a unified kill switch spanning A10 (identity/runtime/gateway) + Option D (payment), the coordination point is named here. Revisit condition: a money-touching agent-abuse scenario surfaces that credential revocation alone doesn't contain.

---

## Build-session implementation summary (for the A10 build session)

**Updated 2026-05-17 — reflects the Finding 1 correction (narrower migration; no agent_id/owner_user_id ADDs; CHECK constraint), per-credential scoping (Decision 3a), and AccreditationPayload typical-class exposure (Decisions 3b + 3c).**

The build session implements all nine decisions A–I plus the three new integration sections. Expected risk classification: **Critical** under 0d-ii (the auth-gate swap engages AC7 + R17; new admin endpoint engages AC7; schema additions engage AC7; full Critical Change Protocol applies). PR1 single-build proof: schema migrations + library + admin endpoint + route auth-gate swap + AccreditationPayload extension + tests all land in one session.

| File | Change |
|---|---|
| `/website/supabase-api-keys-a10-migration.sql` (NEW) | Decisions B + C + F + 3a — additive idempotent migration: `purpose`, `revoked_at`, `scope_downstream_identity_model`, `scope_path_posture` columns on `api_keys`; CHECK constraint enforcing NOT NULL invariant for `purpose='atl_write'` rows; CHECK constraints for purpose + scope enum membership; unique index on `(owner_user_id, agent_id, purpose) WHERE purpose = 'atl_write'`; index on `(purpose, agent_id) WHERE purpose = 'atl_write'`. **Note: `agent_id` and `owner_user_id` columns are NOT added — they already exist per `/api/api-keys-schema.sql` lines 75 + 77.** |
| `/website/supabase-credential-audit-migration.sql` (NEW) | Decision H — `credential_audit` table with `actor_user_id` referencing `public.profiles(id)`; three indexes. |
| `/website/supabase-agent-accreditation-a10-migration.sql` (NEW) | Decisions 2 + 3b + 3c of the rewrite — additive idempotent migration on `agent_accreditation`: four `typical_*` columns (operation_class, target_system_vendor, outcome_verification, reversibility_signal) with CHECK constraints enforcing enum membership; nullable `loop_id UUID` column; index on `(loop_id) WHERE loop_id IS NOT NULL`. **Build session verifies the live `agent_accreditation` schema first; the migration is idempotent against existing columns.** |
| `/website/src/lib/security.ts` (MODIFIED) | Decisions A + B + D + E + F + H + 3a — add `AtlWriteValidationResult` type (with `'wrong_scope'` reason); add `validateAtlWriteToken(rawToken, agent_id, carriedProfile?)` async function (Decision E body with scope check); add `generateAtlWriteToken()` helper (Decision D); add `logAtlVerifyEvent(event)` helper (Decision H verification-path logger with new scope fields); add `requireAdmin(request)` helper (Decision D — admin check, OR inline in the route's handler; build-session discretion); add `resolveProfileId(user_id)` helper if not already present (Decision D — auth.users.id → profiles.id resolution); existing `validateApiKey` and `requireAuth` unchanged. |
| `/website/src/app/api/admin/accreditation-credentials/route.ts` (NEW) | Decisions B + D + F + H + 3a — `POST` handler (mint flow with optional scope params); `DELETE` handler (revoke flow); auth-gated via `requireAuth` + admin check; both write `credential_audit` rows with scope_* in details JSONB; response shapes per Decision D. |
| `/website/src/app/api/accreditation/[agent_id]/route.ts` (MODIFIED) | Decisions A + E + I + 3a — `verifyAgentIdOwnership` becomes `async`; signature extends with optional `body` param for CarriedProfile extraction; body rewritten: kill-switch check (Decision I) → token extraction → CarriedProfile extraction from body → `validateAtlWriteToken` delegation with scope check (Decision E); existing call site updated to `await` the function and pass body; header comments updated to describe post-A10 behaviour. The POST handler's outer try/catch already handles the async path. The body is parsed once and the relevant subset passed to `verifyAgentIdOwnership` (avoids double-parse cost). The handler also extracts the new typical_* + loop_id values from the body and persists them via the writer library. |
| `/website/public/.well-known/agent-card.json` (MODIFIED) | **A2A Agent Card alignment (added 2026-05-20 from `/inbox/6 agent protocols.rtfd` + `/inbox/20260512-0df-promptkit-1.md` placed 2026-05-19).** Declare the write-surface auth method so third-party agents discovering the substrate via A2A know to authenticate with `Bearer sr_atl_<...>` tokens. Specific JSON shape per build-session discretion: candidate patterns are (i) top-level `authentication` block naming the auth scheme; (ii) entry under `capabilities.extensions` named `atl-write-auth/v1` describing the Bearer-token scheme for the write surface (mirrors the existing `pass-through-metadata/v1` entry pattern). Validate as valid JSON. No runtime effect — purely a discovery-file update. |
| `/website/src/lib/substrate/atl-accreditation-writer.ts` (MODIFIED) | Decisions 3b + 3c — extend the writer to accept the four typical_* fields + the loop_id and persist them on the `agent_accreditation` row. Additive change; existing callers (which don't supply the new fields) get nullable defaults. |
| `/website/src/lib/substrate/trust-layer/accreditation/accreditation-record.ts` (MODIFIED) | Decision 3b — extend `buildAccreditationPayload` to expose the four new typical_* fields; extend `AccreditationRecord` + `AccreditationPayload` type declarations with the four new optional fields. **Note: source-of-truth port-mirror at `/trust-layer/accreditation/accreditation-record.ts` is currently drifted per the predecessor close; build session decides whether to reconcile (Standard-risk add to the same build) or defer (PR7 follow-up). Recommendation: defer; reconciliation is a separate session.** |
| `/website/src/lib/substrate/trust-layer/types/accreditation.ts` (MODIFIED) | Decision 3b — extend `AccreditationRecord` + `AccreditationPayload` types with the four new typical_* fields (all optional). Port-mirror discipline applies same as above. |
| `/website/src/lib/__tests__/security.test.ts` (MODIFIED or NEW) | Decisions A + E + F + 3a — tests for `validateAtlWriteToken`: token-prefix-rejection (no_token); unknown-hash (invalid_token); revoked credential (invalid_token — fails on `is_active = false` filter); wrong-agent (the credential is for agent_X but caller wrote to agent_Y); **wrong-scope (the credential is scoped to vendor_framework but the CarriedProfile says browser_session)**; successful validation with no scope; successful validation with matching scope. Uses a Supabase test fixture or mock per existing pattern. |
| `/website/src/app/api/accreditation/[agent_id]/__tests__/route.test.ts` (MODIFIED) | Decisions A + E + I + 3a — the POST tests' setup needs to mock or provision a valid credential; the auth-gate tests now exercise the A10 verification path; the `unauthorized` test verifies 401 for unknown / revoked / wrong-agent / wrong-scope tokens; the `not_enabled` test verifies 503 still fires when the kill-switch is off (Decision I); new tests for the new request body fields (typical_* + loop_id flow through to the writer). |
| `/website/src/app/api/admin/accreditation-credentials/__tests__/route.test.ts` (NEW) | Decisions B + D + F + H + 3a — mint + revoke tests: founder-only auth (401 for non-admin); successful mint returns raw token + structured response; mint writes `credential_audit` row with scope_* in details; mint enforces unique constraint (409 on duplicate); **mint with optional scope params succeeds; scope params persist on the row**; revoke sets `is_active = false`, `revoked_at`, `suspended_reason`; revoke writes `credential_audit` row. |
| `ADMIN_USER_EMAIL` (or `ADMIN_USER_ID`) Vercel env var (NEW) | Decision D — added to the deployment surface; founder's email/id pre-deploy. |

The build session executes the Critical Change Protocol per `/adopted/standing-protocol-cache.md` §"Critical-risk sessions": six CCP steps responded to visibly in the conversation before any code; explicit founder approval specific to the named risks; full template close (Verification Method Used + Risk Classification Record + PR5 + Founder Verification + Orchestration Reminder).

PR15 consult expected:
- `.claude/skills/anthropic/` — `claude-api` informational (SDK patterns); `mcp-builder` forward pointer (R18c — post-A10 the credential issuance could be exposed as an MCP tool for downstream agentic-commerce integrations).
- The bespoke election is justified for A10's substrate-internal auth surface: the existing `api_keys` infrastructure IS the load-bearing Anthropic-adjacent primitive being reused; the Finding 1 correction strengthens this further (even the columns already exist). The build session's PR15 consult records this — A10 is not a bespoke design, it's an extension of the production-tested ecosystem-API auth pattern.

**Expected build session shape:** ~3–4 hr; Critical risk; full Critical Change Protocol; PR1 single-build proof; PR2 build-to-wire verification immediate; PR6 NOT engaged (no R20a / distress surface).

---

## Cross-references

- `/operations/decision-log.md` — `D-ATL-A10-DESIGN-LOCKED-REWRITE-2026-05-17` (this rewrite's adoption record); `D-ATL-A10-DESIGN-LOCKED-2026-05-16` (predecessor — marked Superseded by this entry in the same operation).
- `/operations/handoffs/founder/2026-05-17-A10-design-rewrite-close.md` — this session's close (paired with the decision-log entry).
- `/operations/handoffs/founder/2026-05-17-pass-through-fields-build-close.md` — immediate predecessor session close (session #4 of the post-6b arc tail).
- `/operations/handoffs/founder/2026-05-16-A10-design-pass-close.md` — Part 2 brainstorm where Finding 1 was surfaced + the seven pass-through fields were scoped.
- `/adopted/pass-through-fields-design.md` — the pass-through fields design (`D-PASS-THROUGH-FIELDS-LOCKED-2026-05-17`); §Integration §A10 named the integration calls this rewrite makes.
- `/adopted/billing-model-design.md` — the Option D billing design (`D-BILLING-MODEL-LOCKED-2026-05-17`); Decision A's loop definition + the `loop_billing_events` schema are the integration surface this rewrite addresses (Decision 2 of the rewrite: no integration; `agent_accreditation.loop_id` added for JOIN traceability only).
- `/adopted/sage-assent-write-path-design.md` — Decision C names A10 as the auth-seam filler; A10's Decision E names the swap target (`verifyAgentIdOwnership`).
- `/adopted/sage-assent-kathekon-aligned-alternative-design.md` — structural template (seven-decision design-pass shape; this design extends to nine decisions + new integration section).
- `/adopted/adr/2026-05-12-substrate-category-character-kernel.md` — J1 ADR (Character Kernel category language; preserved by this design — typical_* fields are operational metadata, not category framing).
- `/adopted/build-sessions-protocol-cache.md` — open-questions parking lot Q4 (token-format ADR is now resolved by Decision A; opaque-token election supersedes the JWT / W3C VC / hybrid candidates listed there).
- `/operations/agentic-commerce-findings-downstream-order.md` — F4 (AC10 / AP2 alignment) — A10's `credential_audit` table is the upstream provenance surface that A12 builds on; the token format does NOT need to be VC-shaped to satisfy F4.
- `/api/api-keys-schema.sql` — line 75 (existing `agent_id TEXT`); line 77 (existing `owner_user_id UUID REFERENCES public.profiles(id)`); line 105 (existing `idx_api_keys_owner_user_id`). **The production schema that Finding 1 corrected the design against.**
- `/api/migrations/option-d-billing-schema.sql` — the `loop_billing_events` table; Decision 2 of the rewrite locks "no integration"; `agent_accreditation.loop_id` provides JOIN-based forensic traceability.
- `/website/src/lib/security.ts` — the existing `validateApiKey` + `hashKey` + `extractRawKey` + `requireAuth` precedents that A10 reuses (Decisions A + D + E).
- `/website/src/lib/supabase-server.ts` — the admin Supabase client; the persistence seam A10 uses (Decisions C + D + H).
- `/website/src/app/api/admin/api-keys/route.ts` — the existing admin endpoint A10's new admin endpoint mirrors (Decision D).
- `/website/src/app/api/accreditation/[agent_id]/route.ts` — the existing write surface; A10 swaps `verifyAgentIdOwnership`'s body + extends its signature (Decisions A + E + I + 3a) and extends the POST handler to extract the new typical_* + loop_id body fields and persist them.
- `/website/src/lib/substrate/atl-accreditation-writer.ts` — the write-path library; extended in this design (Decisions 3b + 3c) to accept four typical_* fields + loop_id.
- `/website/src/lib/substrate/trust-layer/accreditation/accreditation-record.ts` — `buildAccreditationPayload` lives here; extended in this design (Decision 3b) to expose four new typical_* fields.
- `/website/src/lib/substrate/trust-layer/types/accreditation.ts` — `AccreditationRecord` + `AccreditationPayload` types live here; extended in this design (Decision 3b).
- `/website/src/lib/substrate/trust-layer/types/evaluation.ts` — `EvaluatedAction` (5 pass-through fields landed) + `OperationClass` / `TargetSystemVendor` / `OutcomeVerification` / `ReversibilitySignal` enums; reused by the typical_* column CHECK constraints.
- `/website/src/lib/substrate/atl-wrapper.ts` — `CarriedProfile` (2 pass-through fields landed: `downstream_identity_model` + `path_posture`); reused by the scope_* column CHECK constraints + the verification path's scope check.
- `/manifest.md` — R0 (audit trail; load-bearing for Decisions B + F + H + 3a scope-check audit); R3 (disclaimer posture preserved; non-leaking error responses); R4 (IP boundary preserved; tokens + scope echoes carry no engine internals); R17 (primary engagement — Decisions A + B + E + F + H + 3a); R18a (Character Kernel credential's integrity protected; no category-language change); R18b (badge documentation update deferred under PR7); R18c (additive interoperability at the AccreditationPayload layer — typical_* fields land as additive optional fields); R18e (NOT engaged at credential level); R20 (NOT engaged — no distress surface, no R20a perimeter touch); AC5 (NOT engaged — no R20a perimeter change); AC7 (ENGAGED at build session — new auth surface; Critical Change Protocol applies; full template); AC8 (translation-sandwich substrate; A10 is auth-layer, not Layer 1 contract); AC10 (`credential_audit` is upstream provenance for A12's AC10 implementation; PR7 cross-reference); KG1 (engaged at build session — every DB write/read awaited; no self-calls between the admin endpoint and the auth endpoint; no fire-and-forget on audit writes); KG7 (NOT engaged — no JSONB writes at the credential layer; `details` column is JSONB but holds free-form context, not Layer 1 payload); PR1 (single-build proof — A10's schema + library + admin endpoint + route swap + AccreditationPayload extension + tests land in one session); PR2 (build-to-wire immediate at the build session — tests invoke the new code paths in the same session); PR4 (N/A — no LLM call); PR6 (NOT engaged — no R20a / distress-classifier surface); PR7 (deferred items named — multi-owner flows, ownership transfer, self-service mint, multiple-tokens-per-agent, token re-display, expires_at column, refresh-token flow, AC10 provenance linking, audit retention, per-IP failure rate-limiting, per-credential kill-switch, kill-switch dashboard, ecosystem-key `owner_user_id` backfill, wider `purpose` value space, reactivation, suspension-reason taxonomy, VC interop at the token layer, JWT for external verifiers, validation caching, per-credential rate-limiting, **raw EvaluatedAction history persistence, per-vendor scoping, R20a risk_class derivation from pass-through fields, orphaned-credential auto-revocation, source-of-truth accreditation-record port-mirror reconciliation, Option C tiered-per-action billing, per-credential billing tiers, webhook on credential-driven billing events, scope-check telemetry separation, wider scope check, bulk-issuance flow**); PR10 (Plan → Execute → Verify — this session is the **Plan** step; A10 build session is **Execute**; founder post-deploy verification is **Verify**); PR11 (inbox scan recorded — no new files since predecessor close; F4 named in the cross-references); PR15 (Anthropic-primitive consult — bespoke election justified for A10: the existing `api_keys` + `validateApiKey` infrastructure is the production-adjacent reusable primitive — Finding 1 correction strengthens this; `mcp-builder` is a forward pointer for R18c interoperability post-launch).

---

*End of design document (rewrite). Status: Adopted 2026-05-17 under `D-ATL-A10-DESIGN-LOCKED-REWRITE-2026-05-17`; Supersedes `D-ATL-A10-DESIGN-LOCKED-2026-05-16`. Implementation status: Designed. The A10 build session opens against this document as the spec. After the A10 build session lands, the post-6b arc closes — the substrate carries authenticated read AND write public surfaces, both auditable; every credential write traces to a specific agent_id whose identity has been verified at the route boundary AND whose operational scope (identity_model + path_posture) has been checked against the credential's scope columns; AccreditationPayload exposes the four new typical_* fields parallel to the existing pattern; the agent_accreditation surface gains forensic JOIN-traceability to loop_billing_events via the nullable loop_id column; the Option D metering layer remains untouched.*
