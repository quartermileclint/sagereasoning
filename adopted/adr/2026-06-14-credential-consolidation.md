# ADR — Credential Consolidation Across the Practice (Unified Practice Credential)

**Status:** **Proposed** 2026-06-14 (Mechanism-Correction **M8**, design-only) — pending founder adoption at the M8 session close under `D-MECHANISM-CORRECTION-M8-CREDENTIAL-CONSOLIDATION-DESIGN-2026-06-14`. On the founder's commit this becomes **Accepted**. **Implementation is deferred to a separate Critical-track session(s)** (AC7 auth surface + PR6 — full 0c-ii); nothing in this ADR changes code, schema, or a flag.
**Decision ID:** CI-14 ADR (Credential Consolidation). Implements build-plan item **CI-14** (`operations/p1-rebuild-2026-06/mechanism-correction-build-plan.md:121`).
**Scope:** How SageReasoning's **three credential classes** — `sr_live_` (ecosystem API key), `sr_inst_` (per-install plugin auth, A10), `sr_assent_` (accreditation-write, A10) — are reconciled into **one credential an agent carries across its whole practice** (consult, local-L1 supply, accreditation-write, calling, reflect), realising SR-14's intent and closing the FX-3 regression class + FX-17 **by construction**. This ADR **builds on** the K1 composite-key ADR and the A10 token-format ADR; it supersedes neither — it generalises K1's `(operator_account, agent_identity)` key from the accreditation surface to *all* practice surfaces, and it reaffirms A10's bespoke opaque-bearer election.
**Authoritative cross-references:** `adopted/adr/2026-05-26-credential-scope-and-coverage-status.md` (**K1** — the identity model this respects); `adopted/adr/2026-06-03-a10-token-format.md` (**A10 token format** — opaque-bearer Surface-1; deferred portable Surface-2); `/manifest.md` §R18f (no false credential / provenance), §R17/§R17c/§R17i (data minimisation, genuine deletion, export), §R19 (honest positioning), §R3 (owner is the operator/developer, never an end-user), §R5 (economics), AC7 + PR6 (auth surface = Critical); `operations/p1-rebuild-2026-06/fresh-test-analysis.md` (FX-3 §:51, FX-17 §:81); `adopted/sage-reflect-product-design.md:307` (**SR-14**).

---

## Decision

Consolidate the three credential classes into a single **Unified Practice Credential (UPC)**: **one `public.api_keys` row, keyed by the K1 composite `(operator_account, agent_identity)`, carrying a multi-valued `capabilities` set that replaces the single-valued `purpose` discriminator**, validated through **one chokepoint** that the three legacy validators delegate to. The opaque-bearer primitive (random secret, SHA-256 `key_hash`, `is_active` universal-revocation flag) is **retained verbatim** — the consolidation is at the *identity + capability* layer, not the storage or token primitive (all three classes already share `public.api_keys`).

### 1. Identity key — the K1 composite, made first-class

A UPC is keyed by `(operator_account, agent_identity)`, mapped onto existing columns with **no new identity surface**:

- **`operator_account` := `api_keys.owner_user_id`** — the R3 operator (the running/monitoring developer's `profiles(id)`), **never an end-user**.
- **`agent_identity` := `api_keys.agent_id`** — upgraded from "self-reported, optional" to the K1 grammar `namespace:name@version`; legacy free-form ids are grandfathered (the CI-12 `agent-id-vocabulary.ts` `isAcceptedAgentId` already admits canonical **and** legacy ids on read+write — write boundary `accreditation/[agent_id]/route.ts:602`, store chokepoint `sage-assent-accreditation-store.ts:550-555`).

"One credential across the practice" (SR-14) is enforced **by construction** by a new partial-unique index:

```
api_keys_upc_owner_agent_active_uniq
  ON public.api_keys (owner_user_id, agent_id)
  WHERE is_active = true AND owner_user_id IS NOT NULL AND agent_id IS NOT NULL
```

The `agent_id IS NOT NULL` guard is load-bearing: the legacy admin `sr_live_` mint, the self-service `/api/keys` mint, **and the `plugin_install` mint** all leave the `api_keys.agent_id` column null (`admin/api-keys/route.ts:142` — `agent_id?.trim() || null`; the per-install row carries its identity in `install_id`, not `agent_id` — the "install_id stored in agent_id" note in the plugin-install route refers to the `credential_audit` row, not `api_keys`), so an unguarded predicate would either over-constrain or rely on Postgres NULL-distinctness implicitly. This index **generalises** the existing `sage_assent_write` owner/agent unique index (`supabase-api-keys-phase3-scope-rename-migration.sql:91-93`) by dropping `purpose` from the key.

### 2. Capability model — a set, not a purpose

Replace the single-valued `purpose` dispatch with a multi-valued **`capabilities TEXT[]`** drawn from the closed vocabulary `{consult, l1_supply, accreditation_write, calling, reflect}` (a CHECK enforces the subset). Each protected action checks *"does this credential grant capability X?"* instead of *"is `purpose == Y`?"*:

| Surface | Capability required |
|---|---|
| `POST /api/reason` (consult) | `consult` |
| `/api/reason` `layer1_schema` local-L1 supply (the CI-2 path) | `l1_supply` |
| `POST /api/accreditation/[agent_id]` | `accreditation_write` (+ `agent_id` binding + scope) |
| `POST /api/calling` | `calling` (+ `agent_id` binding) |
| `POST /api/practice/reflect` | `reflect` (+ `agent_id` binding) |

A single `validatePracticeCredential(rawToken, requiredCapability, scopeContext?)` is the chokepoint: one indexed `key_hash` lookup of the active row → check `is_active` (universal revocation, unchanged) → check `requiredCapability ∈ capabilities` else `403 insufficient_capability` → apply the capability-scoped scope. The three existing validators (`validateApiKey` `security.ts:328`, `validatePluginInstallToken` `plugin-install-auth.ts:155`, `validateSageAssentWriteToken` `security.ts:660`) become **thin capability-asserting wrappers** over it.

**Splitting `l1_supply` out as its own capability is the structural FX-3 fix** (see "The FX-3 regression class," below): it is granted on every consult-capable credential, so local-L1 supply is no longer confined to the per-install auth path.

**`capabilities` ≠ `coverage_status`.** The CI-11 `coverage_status` / `monitored_since` / `credential_basis` honesty fields (and K1's `agent_elected` vs `continuous`) are about *monitoring evidence* and remain orthogonal: "holds the `reflect` capability" must never be read as "earned a `continuous` credential." The ADR states this so a future reader does not conflate them.

### 3. The operator-vs-external split — a declared invariant (`owner_kind`)

Add **`owner_kind TEXT CHECK (owner_kind IN ('operator','external_consumer')) NOT NULL DEFAULT 'operator'`**, turning today's *ambiguous* null-`owner_user_id` signal into a *declared, auditable* one (the M6 migration itself only **infers** "null owner = external consumer" in a column comment, `20260614_m6_agent_assessment_history.sql:176-180` — this makes it a constraint):

- **`owner_kind = 'operator'`** ⇒ `owner_user_id` is a real `profiles` FK ⇒ the user-JWT data-rights paths (`/api/user/delete` R17c, `/api/user/export` R17i) and `ON DELETE CASCADE` reach the credential **and** its `agent_assessment_history` trajectory children.
- **`owner_kind = 'external_consumer'`** ⇒ a genuinely third-party API consumer with **no** `profiles` account (`owner_user_id` legitimately null; `owner_email` may carry contact). Their rows + trajectory children are governed by **`retain_until` + the trajectory-retention sweep** (the R17c path for un-accountable rows — see `operations/p1-rebuild-2026-06/trajectory-retention-sweep-scope.md`), never by a user-JWT.

This **subsumes the `sr_live_`-owner backfill** (M6/M7 follow-up (a) — see Migration §3) and feeds honest `credential_basis` (R18f/R19): "examined under operator `<id>`" vs "external consumer, unattributed operator" — matching K1 §1.

### 4. Provenance anchor (`credential_provenance`)

Add **`credential_provenance jsonb`** (`{minted_by, basis}`) as the explicit R18f no-false-credential anchor — making "what this credential earned, and at whose hand" legible on the row rather than implicit. This is what keeps the **portable creator credential** honest (§ "What stays separate").

### 5. Prefix disposition — unify forward, retain for back-compat

- **New** UPC mints issue **one** prefix (proposed `sr_prac_`; the founder may elect to reuse `sr_live_` as the canonical practice prefix — a copy decision, not a security one). Capability is a row attribute; the prefix is **cosmetic/diagnostic only** (`mint-credential-core.ts` `classFromPrefix:273-278` already treats the prefix as the honest *display* source, never the auth source).
- **All three legacy prefixes keep validating** — `extractRawKey`/the validators continue to recognise `sr_live_`/`sr_inst_`/`sr_assent_`; capabilities are read from the row regardless of prefix. **No issued integration token breaks.**
- **`purpose` is retained as a nullable, diagnostic/legacy column** (its CHECK widened, never dropped); `capabilities` becomes authoritative via `COALESCE(capabilities, preset_for(purpose))` so existing rows authorise byte-identically with **zero backfill** required.
- The **transport narrowing travels with the capability, not the prefix**: `sr_assent_` is Authorization-header-only today (`security.ts:542`) and `sr_inst_` Bearer-only (`plugin-install-auth.ts:37`) — preserved as per-capability transport constraints (`accreditation_write`/`calling`/`reflect` stay Authorization-only) so the consolidation does not silently widen the attack surface.
- **Prefix retirement is explicitly out of scope** — a separate future decision gated on "zero active legacy-prefix credentials in the wild."

### 6. Per-install binding — a column refinement, not a class

The per-install binding survives as the **one documented exception** to the K1 unique grain, kept as columns on the same row (NOT a child table): `install_id` (free-form, no global FK — unchanged), `identity_type`, `install_scope`, with the existing one-active-per-install partial-unique index re-anchored on the install capability rather than `purpose='plugin_install'` (transition predicate accepts BOTH; flip to capability-only post-cutover). A per-install UPC is simply "a credential whose capabilities include `{consult, l1_supply}` and whose row carries a non-null `install_id`." Per-install metering/quota stays **deferred** (trigger: first paid agent) — the UPC makes the metering capability *legible*, it does **not** enforce per-install quota; this ADR does not overclaim otherwise.

---

## Context

Three forces make this the right consolidation now (M1–M5 learnings + the M6/M7 trajectory work):

1. **The fragmentation is at the identity/capability layer, not storage.** All three classes already share `public.api_keys` and one opaque-bearer + SHA-256 + `is_active` primitive (verified). They differ only by **prefix + `purpose`** — three issuance surfaces with different mint routes, identity shapes, and capability semantics.
2. **SR-14 is already partially shipped.** `sage-reflect-product-design.md:307` locked the intent — reuse the A10 Sage Assent credential (named there by its pre-rename prefix `sr_atl_`, now shipped as `sr_assent_` after the Phase-3 `atl_write → sage_assent_write` rename), unscoped, as Sage Calling does — with the rationale "one credential across the agent's practice." That reuse is live for the **write + calling + reflect** surfaces (`api/calling/route.ts:20`, `api/practice/reflect/route.ts:18`). It is **not** extended to the **consult + l1-supply** surfaces — which is exactly the gap FX-17 exposed.
3. **The null-owner R17c boundary surfaced at M6.** The legacy `/api/admin/api-keys` mint sets `owner_email` but leaves `owner_user_id` null (`admin/api-keys/route.ts:141`, no `owner_user_id` in the insert), so external-consumer trajectory rows are unreachable by the user-JWT data-rights paths. The consolidation is the natural home to make that distinction declarative.

**The three classes today (verified path-check, 2026-06-14):**

| Class | Prefix | `purpose` | Mint | Sets `owner_user_id`? | Identity | Validator | Authorises |
|---|---|---|---|---|---|---|---|
| Ecosystem API key | `sr_live_` | `ecosystem` (the `NOT NULL DEFAULT`) | `POST /api/admin/api-keys` (legacy); `POST /api/keys` (self-service) | **No** (admin; sets `owner_email`) / **Yes** (self-service `keys/route.ts:131`) | `agent_id` opt. (null), `owner_email` | `validateApiKey` | consult (+ CI-2 L1) on `/api/reason`; Option-D metered |
| Per-install plugin | `sr_inst_` | `plugin_install` | `POST /api/admin/plugin-install-credentials` | Yes — the **admin's** profile (`route.ts:106`) | free-form `install_id` (no FK) | `validatePluginInstallToken` | consult on `/api/reason` (flag `PLUGIN_INSTALL_AUTH_ENABLED`); per-install metering deferred |
| Accreditation-write | `sr_assent_` | `sage_assent_write` (was `atl_write`) | `POST /api/admin/accreditation-credentials` | Yes — the admin's profile (`route.ts:97/116`); CHECK owner+agent NOT NULL; `UNIQUE(owner_user_id, agent_id, purpose)` | `(owner_user_id, agent_id)` + opt. scope | `validateSageAssentWriteToken` | writes to `/api/accreditation/[agent_id]` (flag `SUBSTRATE_WRITE_PATH_ENABLED`); **reused unscoped** for `/api/calling` + `/api/practice/reflect` |

The CI-7 mint CLI (`scripts/mint-credential.ts` → `mint-credential-core.ts`) already mints/revokes/lists all three classes over the admin routes — so a unified mint extends an existing, founder-known surface.

---

## The FX-3 regression class it closes (CI-14 founder-verification requirement)

**The class** (not just the instance): *a capability or piece of practice-state bound to one credential **class / auth-path**, silently lost when the agent switches credentials within a single practice.*

- **FX-3** (`fresh-test-analysis.md:51`, B1, certain): `layer1_schema` local-L1 supply was structurally confined to the plugin/per-install auth path and **not** accepted on the API-key path; when leg-B switched credentials mid-run it **silently lost the practice** — consults #3–12 cost ~13–34s each (~160s avoidable server time) plus double-L1 billing. **CI-2 (M1) already point-patched the direct symptom** by extending L1-supply to the API-key path. The consolidation removes the **class**: `l1_supply` is a capability on the *same* credential as `consult`, granted on every consult-capable credential — there is no second credential whose switch could drop it, and a missing capability **fails closed** (`403`), never silently.
- **FX-17** (`fresh-test-analysis.md:81`, B7/B8, certain): credential fragmentation contradicting SR-14 — leg-B needed **three** credentials (`sr_inst_` for reason, `sr_live_` mid-run, `sr_assent_` for the write), and the switch **caused** FX-3. The consolidation closes it because one UPC carries the full capability set for one `(operator, agent)`: **the entire practice runs on one credential, so there is no mid-run switch to make.** The leg-B three-credential sequence becomes *structurally unrepresentable.*

This is the literal realisation of SR-14 — "one credential across the agent's practice" — extended to the consult + l1-supply members that the existing unscoped `sr_assent_` reuse never reached.

---

## Migration path for existing credentials (CI-14 founder-verification requirement)

All steps are additive/reversible and flag-gated; the build is a **separate Critical track** (each step its own 0c-ii). The no-current-users simplification (only founder + test logins) means no third-party live session must be preserved — but **every already-issued credential keeps validating** throughout.

1. **Additive schema (Standard, idempotent; TEST → prod):** `ALTER TABLE api_keys ADD COLUMN capabilities TEXT[]` (CHECK members ⊆ the vocabulary), `ADD COLUMN owner_kind TEXT CHECK(...) NOT NULL DEFAULT 'operator'`, `ADD COLUMN credential_provenance jsonb`; **widen (never drop)** the `purpose` CHECK; make `purpose` nullable. No existing CHECK/index dropped. Existing rows read back as their derived legacy capability set (next step) — **no behaviour change.**
2. **Reversible backfill:** derive `capabilities` from `purpose` (which is `NOT NULL DEFAULT 'ecosystem'`, so every existing row carries one of three real values — no null/`(none)` case) — `'ecosystem' → {consult, l1_supply}`; `'plugin_install' → {consult, l1_supply}`; `'sage_assent_write' → {accreditation_write, calling, reflect}` (encoding the already-shipped unscoped calling/reflect reuse explicitly). **Ecosystem keys are backfilled with `l1_supply`, not bare `{consult}`** — bare `{consult}` would `403` their L1 supply and *restate* the FX-3 symptom; granting `l1_supply` matches the L1-supply CI-2 already gives the API-key path (today via the global `SUBSTRATE_L1_SCHEMA_KEY_PATH_ENABLED` flag, which the per-credential capability supersedes — the build verifies the flag-on population is not silently narrowed). This is what makes the §"FX-3 regression class" claim ("`l1_supply` granted on every consult-capable credential") true for the *backfilled* population, not only newly-minted credentials. Set `owner_kind`: legacy admin-minted `sr_live_` rows with null `owner_user_id` → `'external_consumer'` (the honest default — the admin mint genuinely never knew the operator); self-service `/api/keys` rows + admin install/assent rows → `'operator'`. **This subsumes the `sr_live_`-owner backfill (M6/M7 follow-up (a)):** going forward, change `/api/admin/api-keys` to set `owner_user_id` only when the supplied `owner_email` matches **exactly one** `profiles` row (case-normalised; `profiles.email` carries no UNIQUE constraint, so a 0-or-≥2 match leaves `owner_user_id` null = legitimately external — never an arbitrary match); the dry-run report lists every `owner_email` with >1 matching profile as a non-promotable conflict (R3 hazard — never mis-promote an external row to an operator).
3. **Generalised unique index:** add `api_keys_upc_owner_agent_active_uniq` (the §1 predicate, **with** the explicit `agent_id IS NOT NULL` guard), preceded by a zero-violator pre-check (mirroring the existing migrations' 7e safety pattern). The existing `sage_assent_write` unique index already proves the assent rows are clean; the null-`agent_id` ecosystem/self-service rows are exempt via the guard.
4. **Single validator, flag-gated (Critical — AC7/PR6):** build `validatePracticeCredential(token, requiredCapability)`; refactor the three validators to delegate to it **without changing their external signatures**. Ship behind `SUBSTRATE_UPC_CAPABILITY_AUTH_ENABLED` — **UNSET = byte-identical** (each validator keeps its current `purpose`-filter fallback). Widen extractors to accept all four prefixes. **Exhaustive assertion-parity** against all legacy paths (consult via `sr_live_` **and** `sr_inst_`; write + calling + reflect via `sr_assent_` unscoped) before any flip.
5. **Capability-aware mint:** extend `/api/admin/api-keys` + `/api/keys` + `mint-credential-core.ts` + the CI-7 CLI to accept a `capabilities[]` (default `{consult, l1_supply}` for a consult credential — `l1_supply` rides consult; the **write-class** capabilities `accreditation_write`/`calling`/`reflect` are opt-in, never defaulted on) + `owner_kind`; the three legacy admin routes become **thin shims** minting a UPC with the corresponding fixed capability subset (back-compat for any caller/script; preserve the CI-6 30/1/1 consult defaults).
6. **Founder-elected cutover:** flip the flag on TEST → run the assertion suites + a **leg-B replay** (the three-credential scenario re-run on **one** credential carrying `{consult, l1_supply, accreditation_write, calling, reflect}`) as the FX-3/FX-17 acceptance proof → then production, each its own 0c-ii. Re-anchor the install/assent invariant CHECK predicates from `purpose` to `capabilities` **only after** cutover is stable (transition predicate accepts BOTH meanwhile).
7. **Retention follow-up:** the **trajectory-retention sweep** (the M6-P2 gate; a **universal `retain_until < now()` purge** — see the sweep-scope doc §1; **`owner_kind` is NOT a sweep predicate/filter** — owner-narrowing would let owner-bearing rows accumulate past the 90-day limit) is the genuine-deletion *mechanism-of-record* for `owner_kind = 'external_consumer'` rows (their *only* deletion path), while `owner_kind = 'operator'` rows *also* ride the user-JWT data-rights + cascade with the sweep as their backstop; add an on-demand consumer-erasure-by-token path for the external case. This is what unblocks **M6-P2**.

---

## What stays separate, and why

- **The portable creator credential (K1 §3) stays on the deferred A10 Surface-2 (W3C-VC / AP2), NOT a UPC.** A downloaded/trialed agent may arrive carrying its creator's accreditation; per K1 it is shown **read-only as a reference** and **never** becomes the trialer's own credential — the trialer's runs fork a **separate** operator-scoped UPC. `credential_provenance` + R18f keep this honest (a downloaded credential can never be passed off as self-earned — the R18d defence). The opaque-bearer UPC correctly does **not** serve offline verifiability; that is the portable envelope's job and it stays deferred.
- **Per-install metering/quota** stays deferred (first paid agent). The UPC makes it legible, not enforced.
- **The R18f provenance gate on the write path is untouched** — capability checking is *additive* to it, not a replacement. Likewise the R20a perimeter, the distress classifier, the A5 wrapper, and the Layer-2 signing algorithm/keys are **out of scope** of the consolidation.

---

## PR15 — primitives considered; bespoke election reaffirmed

Anthropic-canonical credential primitives were reviewed: the **Plugin per-install auth model**, **MCP server auth** (OAuth 2.1 bearer **validation** — consumer-side), and **managed-agent credentials / Vault** (a consumer-side OAuth **store**). **None is an *issuer* SageReasoning can adopt** — they validate/store credentials a consumer presents; they do not mint the practice credential the substrate must own. The **A10 token-format ADR (2026-06-03) already made this election** for the same reason and it is **reaffirmed here**: the need is **instant revocation + per-key quota on the hot path**, which an opaque DB-backed token with an `is_active` flag serves and a self-contained JWT / W3C-VC cannot (a signed credential reintroduces the revocation-list problem A10 rejected). A primitive (W3C-VC / AP2) is appropriate **only** on the deferred portable creator-credential Surface-2 — explicitly out of UPC scope. The UPC is therefore a **product-internal bespoke** consolidation of existing bespoke credentials — justified per PR15 as product-internal code with no substituting primitive.

---

## Alternatives considered

A three-architect design panel (diverse lenses: SR-14-purist, backward-compat-pragmatist, security/R17-first) + a judge produced the synthesis above. All three **independently converged** on the UPC core (one K1-keyed row, capability set, single validator) — strong corroboration that this is the right architecture. The differences, and why this ADR resolves them as it does:

1. **Greenfield purist (rejected as the base; ideas grafted).** A new `sr_practice_` prefix as the end state with **legacy-prefix retirement by attrition** and a **synthetic external-operator record** + a **per-install child table**. Rejected as the base: the synthetic operator fights the R3 / `profiles`-FK invariant (the M6 trajectory FK is to `profiles(id)`; a synthetic operator needs a real row or breaks the FK — `owner_kind` keeps `owner_user_id` legitimately null instead); the child table adds an indexed read on the consult path it is meant to keep fast; near-term prefix teardown is riskier for no fidelity gain. **Grafted:** `credential_provenance`; the three-case owner/external/**portable** framing; and its candid **least-privilege counter-recommendation** (next item).
2. **Least-privilege hedge — "unify the validator + key only, keep three classes" (rejected; recorded honestly).** The strongest argument *against* unification is blast radius: one high-capability credential exposes the whole practice if leaked, vs a narrow `sr_inst_` exposing only consult. This ADR chooses SR-14 fidelity over that hedge, **mitigated** by: a consult credential's default is `{consult, l1_supply}` (`l1_supply` rides consult — it is the FX-3 closure, not a high-privilege grant) while the **write-class** capabilities (`accreditation_write`/`calling`/`reflect`) are opt-in and never defaulted on; capability-scoping at mint; and instant `is_active` revocation. The trade is recorded, not hidden (R19).
3. **`purpose`-rename / fourth credential class (rejected).** Adding another class or merely renaming `purpose` perpetuates the fragmentation FX-17 names — it does not make capability travel with one credential, so the mid-practice switch (and FX-3's class) survives.
4. **Self-contained JWT / W3C-VC for the hot path (rejected).** Per A10 — defeats instant revocation; reserved for the deferred portable Surface-2.

The base model (backward-compat UPC) was chosen because it alone wrote the migration to survive the **verified** data shape (the `COALESCE(capabilities, preset_for(purpose))` zero-backfill parity; the `agent_id IS NOT NULL`-guarded unique index; preserving the per-capability transport narrowing).

---

## Reasoning for adoption

1. **Closes FX-3's class + FX-17 by construction** (not by point-patch) — the whole practice on one credential; capability travels with identity, not auth-path.
2. **Realises SR-14 literally** — extends the already-shipped unscoped reuse to the consult + l1-supply members.
3. **High K1 fidelity** — adopts `(operator_account, agent_identity)` as the sole identity key (dropping `purpose` from the key is K1's own "the credential is the agent's; capabilities are facets"); preserves operator-scoping (R18d), coarse-version forking, trial→adopt forking.
4. **Advances honesty (R17/R18f/R19), not just preserves it** — `owner_kind` turns an ambiguous null into a declared invariant that routes data-rights correctly and makes `credential_basis` truthful; `credential_provenance` anchors R18f; folding three classes into one *reduces the credential class/issuance surface* (one validator chokepoint, one mint shape — the row gains three small columns and retains `purpose`, so this is minimisation at the issuance/auth-path level, not a net schema reduction).
5. **Backward-compatible** — every issued token keeps validating; dark-ship parity is byte-identical until a founder-elected flip.
6. **Reuses, does not reinvent** — the opaque-bearer primitive, the `api_keys` table, the CI-7 mint surface, and the CI-12 agent-id vocabulary all carry forward (PR15 product-internal bespoke).

---

## Consequences

**Positive.** One honest credential across the practice; FX-3 class + FX-17 closed by construction; the `sr_live_`-owner gap closed declaratively; a single validator chokepoint (less duplicated auth code); `owner_kind` unblocks the M6-P2 retention path cleanly.

**Negative / accepted trade-offs.**
- **Single-chokepoint blast radius** — one validator bug fails more Live routes at once (`/api/reason`, `/api/calling`, `/api/practice/reflect`, plugin-install). Mitigated by the dark-ship flag + exhaustive parity; a genuine **Critical-track** risk no design choice removes.
- **Leaked-credential blast radius** — recorded (Alternatives item 2); mitigated by least-privilege defaults for the write-class capabilities (never defaulted on) + instant `is_active` revocation.
- **`agent_identity` normalisation debt** — legacy free-form ids persist until natural re-mint (grandfathered); the unique index constrains **mint**, not auth, and write/calling/reflect already validate the `agent_id` binding (`evaluateSageAssentWriteRow`), so auth-time spoofing risk is unchanged.
- **Per-install metering remains unfixed** (deferred).
- **The build is Critical** (AC7 + PR6, full 0c-ii) — this ADR is design only.

---

## Build sequencing (the separate Critical track)

When the founder opens the credential build (its own session(s), not in the mechanism-correction arc): risk **Critical** (auth surface — AC7 + PR6, full 0c-ii per Critical session); flag `SUBSTRATE_UPC_CAPABILITY_AUTH_ENABLED` (UNSET = byte-identical); PR1 prove on one surface first; the **acceptance proof** is the leg-B three-credential→one-credential replay (FX-3 + FX-17 closed) plus mint→use-across-all-five-surfaces→revoke→401 with one credential live. The migration §1–§7 above **is** that session's spec. Keep `purpose` + all four prefixes validating; retirement is a separate later decision.

---

## Revisit conditions

1. **External users exist + a breaking-change window opens** — re-evaluate legacy-prefix / `purpose` retirement (out of scope today).
2. **Least-privilege pressure** — if blast radius proves to dominate in practice, revisit whether the full capability set should ever be minted on one credential, or whether capability bundles should be separate credentials under one key.
3. **Deterministic MCP invocation / managed-agent issuance emerges** — if an Anthropic primitive becomes an *issuer* with instant revocation, re-open the PR15 election.
4. **`agent_identity` granularity miscalibration** — per K1's own revisit (too many / too few version forks).
5. **Multi-tenant / org operator** — per K1 §3 (an org dimension on `operator_account`).

Each revisit produces a new ADR superseding this one; the original is preserved.

---

## Cross-references

- `adopted/adr/2026-05-26-credential-scope-and-coverage-status.md` (K1 — composite key + coverage_status; this ADR generalises its key to all practice surfaces)
- `adopted/adr/2026-06-03-a10-token-format.md` (A10 — opaque-bearer Surface-1 election; deferred portable Surface-2; reaffirmed here)
- `operations/p1-rebuild-2026-06/mechanism-correction-build-plan.md:121` (CI-14); `operations/p1-rebuild-2026-06/fresh-test-analysis.md` (FX-3 §:51, FX-17 §:81)
- `adopted/sage-reflect-product-design.md:307` (SR-14)
- `operations/p1-rebuild-2026-06/trajectory-retention-sweep-scope.md` (the M6-P2 gate; consumes `owner_kind`)
- `operations/handoffs/founder/2026-06-14-mechanism-correction-M8-credential-consolidation-NEXT-SESSION-PROMPT.md` (the session prompt)
- `/manifest.md` §R3, §R5, §R17/R17c/R17i, §R18d, §R18f, §R19, AC7, PR6, PR15
- Surfaces the build will touch (named, not changed): `website/src/lib/security.ts`, `website/src/lib/plugin-install-auth.ts`, `website/src/app/api/admin/{api-keys,plugin-install-credentials,accreditation-credentials}/route.ts`, `website/src/app/api/keys/route.ts`, `website/src/lib/admin-mint/mint-credential-core.ts`, `website/scripts/mint-credential.ts`, the `api_keys` schema + its A10/phase-3 migrations

---

*End of the Credential Consolidation ADR (CI-14). Proposed 2026-06-14 (M8, design-only); Accepted on the founder's commit. Implementation deferred to a separate Critical-track session(s) per AC7 + PR6; nothing here changes code, schema, or a flag. This is the last design item of the mechanism-correction arc — the build, the trajectory-retention sweep, and the parked CI-16 are the only remaining work.*
