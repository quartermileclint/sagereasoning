# ADR — A10 Token Format (Per-Install Plugin-Auth Credentials)

**Status:** Accepted 2026-06-03 by founder election (token-format election, A10 Stage-1 kickoff). Builds on the K1 ADR (`/adopted/adr/2026-05-26-credential-scope-and-coverage-status.md`) and the A10 foundation (`D-ATL-A10-BUILD-WIRED-VERIFIED-2026-05-21`).
**Decision ID:** A10 Token-Format ADR.
**Scope:** The credential **format** for A10 per-install plugin-auth credentials — the surface that replaces the single `PLUGIN_AUTH_SECRET` with per-install token issuance, `identity_type` (human | agent) / `install_id` / `scope` discrimination, and a universal revocation check. This ADR decides format only; the build is a separate (Critical) implementation session.
**Authoritative cross-references:** `/manifest.md` §AC7 (auth surface; Critical), §AC10 (provenance + use-policy tags), §R18f (no false credential); the K1 ADR (composite identity key + `coverage_status`); `/adopted/substrate-plugin-staging-plan.md` §A10; `/operations/agentic-commerce-findings-downstream-order.md` §F4.

---

## Decision

A10 adopts a **hybrid, two-surface credential model**:

### Surface 1 — Internal plugin-auth (the A10 target): opaque bearer token, DB-backed

A per-install credential is an **opaque bearer token** (the proven `sr_atl_`-style primitive: random secret, stored as a hash in `api_keys`, looked up server-side at each call). It carries, as columns on its row:

- `identity_type` — `human` | `agent`
- `install_id` — the per-install identifier
- `scope` — `assessment-only` | `mentor-also` | `admin`
- `is_active` — the revocation flag (the **universal revocation check** = a single indexed row read filtered on `is_active = true`)

This is the credential that authenticates a plugin install to the substrate API. Revocation is **instant** (flip `is_active`), which is precisely what the universal-revocation requirement needs and what a self-contained token (JWT/VC) cannot give without a separate revocation list.

### Surface 2 — Portable carried-profile (deferred under PR7): W3C-VC / AP2-mandate envelope

The **portable** credential — a downloaded agent presenting its creator's accreditation (K1's "carried creator credential"; AC10 `provenance` + `use_policies`) — is to be expressed as a **W3C Verifiable Credential / AP2-style mandate** envelope. AP2 mandates *are* W3C VCs (Intent/Cart/Payment; v0.2 April 2026; donated to the FIDO Alliance), so this is one axis, not two. **This surface is deferred** — not built now — until a real portable/downloaded-agent consumer exists (K1's trial case). Recorded as a deferred decision per PR7.

**The split rationale:** internal install→substrate auth wants instant server-side revocation and a cheap per-call check (opaque bearer). Cross-party portable trust wants offline verifiability (VC/AP2). They are different surfaces with different needs; one format on both would be wrong on one of them.

---

## Context

A10 replaces the single shared `PLUGIN_AUTH_SECRET` (still live on `/api/reason`'s `checkPluginAuth`, constant-time compare, placeholder `plugin_id`) with per-install credentials. The 2026-05-21 A10 foundation already built the opaque-token *mechanism* (mint/revoke/`credential_audit`/scope/kill-switch/orphan auto-revocation) on the **accreditation write path** (`POST /api/accreditation/[agent_id]`, `purpose='sage_assent_write'`). A10's remaining work is to **generalise that mechanism to the plugin-auth surface** plus identity discrimination and a universal revocation check. The open question carried since ST2 (and named in the staging plan §A10 pre-conditions and Q1) was the token *format*.

PR15 consultation: no Anthropic-canonical primitive dictates a credential format (MCP server auth assumes bearer credentials and leaves issuance to the service); the credential surface stays bespoke, consistent with the closed-Layer-2/3 architecture. PR11/PR13 consultation confirmed AP2 = a W3C VC profile (collapsing two ADR candidates into one axis) and that AC10's tags are already AP2-mandate-shaped, making a future VC envelope low-friction.

---

## Alternatives considered (and reasons for rejection)

- **JWT (HMAC or asymmetric).** Rejected as the primary format. Self-contained tokens are hard to revoke; the universal-revocation requirement forces a revocation list anyway, which negates the statelessness that is JWT's main advantage, while adding a new signing/verify path. No offsetting benefit for internal auth.
- **W3C VC / AP2-mandate as the primary token (including internal auth).** Rejected *for the internal auth surface* — heavyweight on the hot per-call path; revocation via status-list VC is slower than a row flip; highest build cost. **Retained for the portable surface** (Surface 2), where its offline verifiability and AP2/FIDO trajectory are exactly the value.
- **Opaque-only (no VC envelope, even deferred).** Rejected as the *full* answer because it leaves K1's portable creator-credential case (and AC10 provenance interop) without a planned format. The hybrid keeps opaque-only for now but names the portable format so the later session is grounded, not speculative.

---

## Consequences

**Positive.**
- Lowest build cost from today — generalises a Verified primitive (PR1-friendly).
- Instant revocation satisfies the universal-check requirement directly.
- AP2/W3C-VC alignment preserved exactly where it matters (portable surface, AC10), off the hot auth path.
- Clean match to K1's two surfaces (operator-scoped internal record vs portable carried profile).

**Negative / accepted trade-offs.**
- The internal auth token is **not** independently third-party-verifiable — correct for install→substrate auth (server introspection is what makes revocation instant), but it means the portable need genuinely lives on Surface 2 and a later session.
- Two formats to maintain eventually (opaque + VC), justified by the two distinct surfaces.
- Building the per-install columns + universal check is **code-critical** (AC7) when wired into a route — its own session with the full Critical Change Protocol.

---

## Revisit conditions

1. **A portable/downloaded-agent consumer becomes real** → build Surface 2 (VC/AP2-mandate envelope); supersede the PR7 deferral.
2. **AP2 / W3C VC status-list revocation matures** to instant-equivalent → re-evaluate whether the two surfaces could converge on one format.
3. **An Anthropic-canonical credential primitive emerges** (e.g. a managed agent-identity issuer) → re-evaluate bespoke vs primitive per PR15.
4. **R18 certification-language drift** changes required disclosures → align the VC envelope's claim vocabulary.

Each revisit produces a new ADR superseding this one; the original is preserved.

---

## Cross-references

- `/operations/decision-log.md` — A10 token-format adoption entry (this session, 2026-06-03).
- `/adopted/adr/2026-05-26-credential-scope-and-coverage-status.md` — K1 ADR (composite identity key + `coverage_status`; the portable carried-profile this ADR's Surface 2 will carry).
- `/operations/handoffs/founder/2026-05-21-A10-build-close.md` + `D-ATL-A10-BUILD-WIRED-VERIFIED-2026-05-21` — the opaque-token mechanism Surface 1 extends.
- `/adopted/substrate-plugin-staging-plan.md` §A10; Open question 1 (token format) + Risk 9 (R20a-perimeter broadening).
- `/operations/agentic-commerce-findings-downstream-order.md` §F4 (AP2 mandate alignment).
- `/manifest.md` §AC7, §AC10, §R18f.
- Live source surfaces: `website/src/lib/security.ts` (`validateSageAssentWriteToken` / `generateSageAssentWriteToken` / `evaluateSageAssentWriteRow` — the pattern Surface 1 mirrors); `website/src/app/api/reason/route.ts` (`checkPluginAuth` — the `PLUGIN_AUTH_SECRET` this replaces).

---

*End of A10 Token-Format ADR. Hybrid two-surface model accepted 2026-06-03 by founder election. Surface 1 (opaque bearer, internal auth) is this arc's build; Surface 2 (W3C-VC/AP2-mandate, portable) is deferred under PR7. Revisit on the four conditions above.*
