# ADR-LAYER2-SIGNING-INFRASTRUCTURE-01: Cryptographic Signing of Layer 2 Authoritative Output

**Status:** Adopted 2026-05-10 under `D-A3-LAYER2-SIGNING-ADR-ADOPTED-2026-05-10` (Path A elected by founder at session-open). Moved from `/drafts/ADR-layer2-signing-infrastructure.md` to `/adopted/ADR-layer2-signing-infrastructure.md` 2026-05-10 (predecessor preserved in git history per the preserve-prior-versions principle).
**Date:** 2026-05-10.
**Stream:** founder.
**Governing frame:** `/adopted/standing-protocol-cache.md` + `/adopted/build-sessions-protocol-cache.md`.
**Deciders:** Founder (sole signatory).
**Implements / serves:** Stage 1 item A3 of `/adopted/substrate-plugin-staging-plan.md` (Layer 2 signing); the moat-boundary commitment in `/adopted/ADR-stoic-agent-substrate-concept.md` §"The moat boundary"; R18 (honest certification — signing is what makes "authoritative" defensible); AC7 (auth surface — signing infrastructure neighbours auth and shares its discipline); PR1 (single-endpoint proof discipline — A3 scaffolding will prove on `/api/reason` first); PR6 (safety-critical changes are Critical — the eventual scaffolding session is Critical).

**Cross-references:**
- `/adopted/substrate-plugin-staging-plan.md` — Stage 1 item A3 (this ADR's scope) + dependencies + Stage 1 success criteria
- `/adopted/build-sessions-protocol-cache.md` — build-arc session-opening reference; "no current users" governing note
- `/adopted/standing-protocol-cache.md` — general session protocol; risk classification; lean templates
- `/adopted/ADR-stoic-agent-substrate-concept.md` — the substrate's three-layer architecture; the moat-boundary anchor for what signing protects
- `/adopted/ADR-ENCRYPTION-WIRING-01.md` — closest cryptographic-ADR precedent; format mirrored here
- `/operations/handoffs/founder/2026-05-10-stage-1-a2-verified-close.md` — predecessor close (A2 Verified)
- `/operations/decision-log.md` entries `D-A2-INPUT-VALIDATION-SURFACE-2026-05-10`, `D-A1-FLAG-FLIP-VERIFIED-2026-05-10`, `D-A1-INVOCATION-SITE-2026-05-10`, `D-A1-LAYER2-AUTH-SCAFFOLD-2026-05-10`, `D-STAGING-PLAN-ADOPTED-2026-05-10`
- `/website/src/lib/translation-sandwich/tier1-token.ts` — existing HMAC-signed continuation-token mechanism (precedent for stateless signed payloads on this codebase)
- `/website/src/app/api/reason/route.ts` lines 215–278 — `checkPluginAuth`'s constant-time comparison via `node:crypto`'s `timingSafeEqual` (precedent for crypto-correctness discipline)
- `/website/src/lib/translation-sandwich/layer2-mechanisms.ts` lines 342–365 — `Layer2Assessment` interface (the payload to be signed)
- `/website/src/lib/translation-sandwich/parallel-run.ts` lines 480–523 — `runSandwichInner` Layer 2 + Layer 3 composition site (where signing wires in)
- `/manifest.md` — full manifest (R0–R20, AC1–AC8, KG1–KG7, PR1–PR9)

---

## Plain-language summary

This ADR captures the architectural decision for **cryptographically signing Layer 2's authoritative output** in the Stoic Agent Substrate. Signing is what distinguishes a Layer 2 assessment that is "validated" (passes structural and semantic checks) from one that is "authoritative" (cryptographically attested by the substrate as having been produced by Layer 2's deterministic mechanisms). Per the substrate ADR, the moat sits jointly on Layer 2 + Layer 3; signing is the technical mechanism that makes Layer 2's contribution to the moat verifiable by third parties.

The ADR commits four named design choices: the signing scheme (Ed25519), the payload to be signed (`Layer2Assessment` only), the verifier-side contract (public key distributed via both API discovery and the plugin manifest), and the key shape and rotation policy (single key with quarterly rotation and a 30-day overlap window). The ADR does not implement the signing — that's the eventual A3 scaffolding session, which is **Critical risk** under PR6 + AC7 and will engage the full Critical Change Protocol. This ADR is the architectural anchor that scaffolding cites.

The ADR drafting itself (this document) is **Standard risk** under 0d-ii — governance work, no live system touched, no production state change.

---

## Context

### Why this ADR now

A2 reached Verified at the predecessor session — plugin-authenticated callers now submit a validated `Layer1Schema` and the substrate has a stable validated input contract. A3 is the next critical-path item in Stage 1 of the staging plan: cryptographic signing of Layer 2's authoritative output. Per the substrate ADR §"The moat boundary", signing is what distinguishes "authoritative" from merely "validated" — every `Layer2Assessment` carries a cryptographic signature that downstream consumers (plugins, subagents, third-party verifiers) can check independently of the substrate's runtime.

A3 is staged as ADR drafting first (this session, governance/Standard) followed by scaffolding in a subsequent session (Critical risk; PR1 single-endpoint proof on `/api/reason` first). Splitting drafting from scaffolding reflects the size of the architectural commitment: four design choices with consequential downstream implications for A4 (key management), B2 (in-plugin Layer 1 signing in Stage 3), and G3 (marketplace listing trust signalling in Stage 4). Deciding deliberately in governance reduces the risk of having to revise mid-scaffolding.

### What already exists in the codebase

- **HMAC-SHA-256 precedent.** `/website/src/lib/translation-sandwich/tier1-token.ts` implements stateless HMAC-SHA-256 signed payloads for the AC-13 Tier 1 continuation-token mechanic. The token format is `<base64(payload_json)>.<hex(hmac_sha256(payload_json, secret))>`. The secret (`TRANSLATION_SANDWICH_TIER1_SECRET`) is read at call time, not module load. Validation uses `node:crypto`'s `timingSafeEqual` for constant-time comparison. This precedent informs the implementation discipline that A3 scaffolding will follow even though A3 is choosing a different scheme (Ed25519).
- **Constant-time-comparison precedent.** `/website/src/app/api/reason/route.ts` lines 215–278 (`checkPluginAuth`) uses `node:crypto`'s `timingSafeEqual` with explicit length-equality pre-check. This is the canonical crypto-correctness discipline for the codebase.
- **`node:crypto` Ed25519 support.** Node 16+ supports Ed25519 natively via `crypto.generateKeyPairSync('ed25519')`, `crypto.sign(null, data, privateKey)`, and `crypto.verify(null, data, publicKey, signature)`. No third-party dependency required. Vercel runtime is compatible.
- **The Layer 2 output.** `/website/src/lib/translation-sandwich/layer2-mechanisms.ts` defines `Layer2Assessment` (lines 342–365) — a fixed shape with `version: 'layer2-assessment-v1'`, `layer1_schema_version: 'layer1-schema-v1'`, plus all the mechanism outputs (passion diagnosis, control filter, oikeiosis, value assessment, kathekon assessment, iterative refinement, katorthoma proximity, etc.). This is the payload A3 will sign.
- **The Layer 2 + Layer 3 composition site.** `/website/src/lib/translation-sandwich/parallel-run.ts` lines 480–523 (`runSandwichInner`) shows where `Layer2Assessment` is produced (line 477) and where the composed sandwich output `{version, extraction, assessment, prose, meta}` is built (lines 511–522). Signing wires in between Layer 2 production and the composed-output construction.

### What does not yet exist

- **Ed25519 key pair** for the substrate (signing key + verification key). To be generated as part of A3 scaffolding's first step.
- **Signing function** — wraps Ed25519 sign over a canonical-JSON serialisation of `Layer2Assessment`.
- **Verifier-side helpers** — exposed as part of the open Layer 1 reference (Stage 3 B1) so plugin verification is straightforward; also exposed via `/api/agent-card.json` and a new `/api/public-key` endpoint for online verification.
- **Key storage and rotation infrastructure** — A4 (Key management) inherits the operational responsibility this ADR establishes architecturally.
- **Plugin-manifest convention** for embedding the verification key — defined in this ADR; implemented in Stage 3 (C1 — plugin manifest).

### The substrate ADR's anchor

Per `/adopted/ADR-stoic-agent-substrate-concept.md` §"The moat boundary":

> The moat sits jointly on **Layer 2 + Layer 3**, not on either alone. Layer 2 alone (deterministic mechanism outputs without prose) is too cryptic for direct consumer use; Layer 3 alone (prose generation without authoritative engine output) is just an LLM with a Stoic system prompt — the very thing the substrate exists to displace. The pair, working together with cryptographic signing, is the substrate's distinct contribution.

A3 implements the "with cryptographic signing" clause. This ADR anchors the implementation choices.

---

## Decisions

This ADR makes four named decisions, elected by the founder at session-open per the four design-choice questions in the predecessor session prompt. Each decision is presented with its concrete specification; alternatives considered are recorded in the §Alternatives section below.

### Decision 1 — Signing scheme: Ed25519 (asymmetric)

**Selected:** Ed25519 via `node:crypto`'s native support.

**Concrete specification:**

- **Algorithm:** Ed25519 (RFC 8032). 32-byte public key, 32-byte private key, 64-byte signature. Deterministic signatures (no nonce reuse risk).
- **Node primitives:** `crypto.generateKeyPairSync('ed25519')` for key generation. `crypto.sign(null, data, privateKey)` for signing — Ed25519 takes `null` as the algorithm parameter because the algorithm is determined by the key type. `crypto.verify(null, data, publicKey, signature)` for verification. All three primitives are available in Node 16+ and Vercel-compatible. No third-party dependency required.
- **Key format:** PEM-encoded for storage and distribution. The private signing key lives in a Vercel environment variable (`SUBSTRATE_LAYER2_SIGNING_KEY`) as a PEM string. The public verification key is published via the two distribution paths in Decision 3.
- **Signature wire format:** base64-encoded (URL-safe variant — `+/=` replaced with `-_` and trailing `=` stripped — to keep signatures URL-safe and JSON-friendly without escaping concerns). Standard base64 is acceptable as an alternative if URL-safety is not needed; the implementation may use either provided it is consistent. The scaffolding session decides between standard and URL-safe; this ADR does not bind that detail.

**Reasoning:** Ed25519 is the architecturally honest choice for a substrate whose value proposition includes third-party verifiability. Verifiers need only the public key — which can be distributed openly without compromising the substrate's signing capability. This matches the moat boundary: closed Layer 2 + Layer 3 hold the signing capability; the verification capability is open by design. Modern, fast, well-supported in `node:crypto` natively, no historical implementation pitfalls (unlike ECDSA's nonce-reuse risks), and small keys/signatures suit the wire format. The HMAC precedent on this codebase (`tier1-token.ts`) is acknowledged but explicitly rejected for A3 because HMAC requires every verifier to hold a credential equivalent to the signing key — incompatible with the substrate's third-party-verifiability goal.

### Decision 2 — Payload to sign: `Layer2Assessment` only

**Selected:** The signed payload is the `Layer2Assessment` interface as defined at `/website/src/lib/translation-sandwich/layer2-mechanisms.ts` lines 342–365.

**Concrete specification:**

- **Payload shape:** the full `Layer2Assessment` interface — `version`, `layer1_schema_version`, `passion_diagnosis`, `control_filter`, `oikeiosis`, `value_assessment`, `kathekon_assessment`, `iterative_refinement`, `katorthoma_proximity`, `ruling_faculty_state`, `virtue_domains_engaged`, `improvement_path_structured`, `stage_scores`, `hasty_assent_risk`, `intake_clarifications`, `layer1_ambiguity_notes`, `layer2_ambiguity_notes`. Every field included; nothing stripped.
- **Canonical JSON serialisation:** the payload is serialised to JSON with object keys sorted lexicographically before signing. This is required so that signing and verification produce the same byte sequence regardless of the JSON library's default key ordering. The scaffolding session implements canonicalisation via a small helper (`canonicaliseLayer2Assessment(assessment): string`) — sorted keys, no whitespace, consistent number formatting (`Number.prototype.toString()` is deterministic for finite numbers; the helper rejects `NaN` / `Infinity` if any sneak in, which they should not given Layer 2's deterministic mechanism implementation).
- **Wire shape:** the signed assessment is delivered to consumers as `{ assessment: Layer2Assessment, signature: string, key_id: string }`. The `key_id` lets verifiers select the correct public key during a rotation overlap window (Decision 4).
- **Where in the response:** the signed-assessment object replaces the bare `assessment` field in the composed sandwich output. The new top-level shape becomes `{ version, extraction, assessment: {assessment, signature, key_id}, prose, meta }`. Layer 3 prose remains unsigned by design (it is per-consumer adaptable per `prose_mode`; signing it would entangle signing with prose variation).

**Reasoning:** Smallest moat-aligned payload. Signing the `Layer2Assessment` makes Layer 2 authoritative — which is precisely the moat boundary the substrate ADR draws. Layer 3 prose is intentionally per-consumer-adaptable per `prose_mode`; signing prose would entangle the signing infrastructure with prose variation and would mean the signature changes whenever `prose_mode` changes (uninformative for a verifier asking "is this the substrate's assessment?"). Signing the composed output (Choice 2(b)) was rejected on this entanglement basis. Signing `Layer1Schema + Layer2Assessment` together (Choice 2(c)) was rejected because reproducibility-audit semantics belong in a separate (future) attestation mechanism, not in the per-call signing surface; verifiers who want reproducibility can request the schema separately and re-run Layer 2 themselves. Signing a hash of the canonical-JSON of the full output (Choice 2(d)) was rejected because it adds canonicalisation requirements without improving the verifier's ability to inspect the assessment (the canonical-JSON serialisation of `Layer2Assessment` already requires the same canonicalisation discipline at smaller scale).

### Decision 3 — Verifier-side contract: hybrid (API discovery + plugin manifest)

**Selected:** The Ed25519 public verification key is distributed via two channels: published in API discovery, and embedded in the plugin manifest.

**Concrete specification:**

- **API discovery channel:** a new endpoint `/api/public-key` returns the current canonical public key plus metadata. Response shape: `{ "key_id": "<string>", "algorithm": "Ed25519", "public_key_pem": "<PEM string>", "issued_at": "<ISO 8601>", "rotation_overlap_until": "<ISO 8601 or null>", "previous": { "key_id": "...", "public_key_pem": "...", "issued_at": "...", "retires_at": "..." } | null }`. The `previous` field is non-null during a rotation overlap window (Decision 4); otherwise null. Verifiers select the public key matching the `key_id` field on the signed-assessment object.
- **Plugin manifest channel:** the substrate's plugin (Stage 3 C1) ships a `signing_keys` block in its manifest containing `{ "key_id", "algorithm", "public_key_pem", "issued_at" }` for each known public key (current + most recent previous, when applicable). Plugins use the manifest key for offline verification; they refresh from API discovery when online.
- **Verifier resolution rule:** to verify a signed assessment, the verifier (a) reads `key_id` from the signed-assessment object; (b) selects the public key matching that `key_id` from its known-keys set (manifest + most-recent API-discovery refresh); (c) calls `crypto.verify(null, canonicalJSON(assessment), publicKey, signatureBytes)`; (d) accepts the assessment as authoritative if verification succeeds and the `key_id` is within trust scope (current key, or previous key during the rotation overlap window).
- **MITM mitigation:** the plugin manifest is the trust anchor for plugin-deployed verifiers; the manifest key is shipped with the plugin and not refreshed dynamically. API discovery refreshes are accepted when the new key arrives within the rotation overlap window of an existing trusted key (i.e., the new key is announced as "previous" before becoming "current"). Cold-start API discovery (no manifest) accepts the API-discovery key on HTTPS-validated transport; this is a documented trust assumption for third-party verifiers without the plugin.
- **`/api/agent-card.json` integration:** the existing or planned agent-discovery endpoint also includes a reference to `/api/public-key` so agent-card consumers can discover the substrate's verification key without a separate documentation lookup.

**Reasoning:** Hybrid distribution gives plugins offline verification (works without network; manifest key is the trust anchor; defence against MITM on key fetch); API discovery gives third-party verifiers and rotation support (rotation can publish a new key without forcing immediate plugin updates; verifiers refresh on cadence and during overlap windows). Single-channel options were rejected: API discovery only (Choice 3(α)) lacks offline support and exposes cold-start to MITM risk; plugin manifest only (Choice 3(β)) cannot rotate without redistributing every plugin; HMAC secret distribution via plugin-auth onboarding (Choice 3(γ)) is incompatible with the asymmetric scheme elected in Decision 1.

### Decision 4 — Key shape and rotation: single key, quarterly rotation, 30-day overlap

**Selected:** A single signing key pair (one private + one public) governs all `Layer2Assessment` signatures at any given time. Rotation cadence is quarterly. Each rotation has a 30-day overlap window during which both the new and previous keys verify successfully.

**Concrete specification:**

- **Cadence:** scheduled quarterly. The first rotation occurs on the calendar quarter-mark following the A4 (Key management) implementation session. Founder-initiated.
- **Rotation procedure (drafted here; operationalised in A4):**
  1. Generate new Ed25519 key pair (`crypto.generateKeyPairSync('ed25519')`).
  2. Assign new `key_id` (e.g., `substrate-layer2-2026Q3` — quarter-encoded for human-readability and version-traceability).
  3. Backup the new private key per the discipline established in `/adopted/ADR-ENCRYPTION-WIRING-01.md` Decision 4 Option 4A (founder-owned offline backup: password manager + paper + Vercel env var).
  4. Add the new public key to API discovery as a "previous" entry (so verifiers begin trusting it before any signatures use it).
  5. Wait long enough for verifier refresh (24 hours minimum; longer for high-traffic deployments).
  6. Promote the new key to "current" in API discovery; demote the previous key to the "previous" slot.
  7. Update Vercel env var `SUBSTRATE_LAYER2_SIGNING_KEY` to the new private key. Vercel redeploys; new signatures use the new key.
  8. The previous public key remains valid for verification for 30 days from the promotion event (30-day overlap window).
  9. After 30 days, retire the previous key from API discovery and update `signing_keys` block in the plugin manifest at the next plugin release.
- **Rotation triggers:** scheduled quarterly cadence is the default. Off-cycle rotation is required if the private key is suspected compromised (treated as an Elevated incident under 0d-ii; A4 will document the incident-response variant of the rotation procedure).
- **Key custody:** mirrors the encryption-key discipline from `ADR-ENCRYPTION-WIRING-01` Decision 4 Option 4A. The signing private key is the founder's responsibility to back up (password manager + paper + Vercel env var). Loss of the private key prevents future signing but does not invalidate already-issued signatures (verifiers continue to verify against the corresponding public key until rotation retires it).
- **Verifier obligations:** verifiers MUST accept signatures from any key in `{current, previous}` during the overlap window. Verifiers MAY reject signatures whose `key_id` does not match either; the substrate guarantees that `key_id` always identifies a key in `{current, previous}` for the overlap window (i.e., the substrate never signs with a key not in API discovery).

**Reasoning:** Single-key simplicity matches the founder's operational scale (one signer, no shard distribution, no quorum requirements). Quarterly rotation is standard cryptographic hygiene without imposing an excessive operational burden — four rotations per year is cadence the founder can maintain manually. The 30-day overlap window is conservative for the build-arc's scale (plugin verifiers may not refresh frequently) and tightens later if telemetry shows verifiers refresh faster. Per-Layer-2-version key shape (Choice 4(λ3)) was rejected because entangling cryptographic key management with substrate versioning complicates verifier logic without a corresponding security benefit at this scale; substrate-version semantics are carried by the `version` and `layer1_schema_version` fields inside the signed payload itself.

---

## Alternatives considered

The four design-choice questions surfaced sixteen options total (four per question). The unselected twelve are recorded here with the reasoning for rejection.

### Decision 1 alternatives

- **(i) HMAC-SHA-256 with shared secret.** Rejected because HMAC requires every verifier to hold a credential equivalent to the signing key. This is incompatible with the substrate's third-party-verifiability goal: a plugin shipped to a marketplace cannot ship its signing-equivalent secret to every install location without immediately compromising the secret. The codebase precedent in `tier1-token.ts` is appropriate for stateless server-issued continuation tokens (where the same server validates) but not for substrate signing (where third parties verify).
- **(iii) ECDSA P-256.** Rejected because Ed25519 is strictly preferable for new asymmetric crypto unless ecosystem compatibility forces ECDSA. ECDSA has more historical implementation pitfalls (nonce reuse compromises the private key; the substrate has no exposure to this with deterministic Ed25519). ECDSA signatures are larger (~64–72 bytes vs Ed25519's exact 64). Verification is slower. No ecosystem-compatibility argument applies — Node `node:crypto` supports both equally well, and modern verifier-side ecosystems (Python, Go, Rust, JavaScript libraries) all support Ed25519.
- **(iv) Hybrid — HMAC first, asymmetric later.** Rejected because the migration cost is high (every shipped plugin must update its verification logic to handle two schemes during transition) and the "we'll fix it later" pattern often doesn't result in fixing it later. Committing to asymmetric now means scaffolding once and shipping once; the founder pays slightly more complexity in A3 scaffolding to avoid paying significantly more complexity in a future migration session.

### Decision 2 alternatives

- **(b) Composed sandwich output.** Rejected because Layer 3 prose is per-consumer adaptable per `prose_mode`; signing the composed output entangles signing with prose variation. A signature over the composed output changes whenever `prose_mode` changes, which is uninformative for a verifier asking "is this the substrate's assessment?" — prose-mode variation is a feature, not a tampering risk.
- **(c) `Layer1Schema` + `Layer2Assessment` together.** Rejected because reproducibility-audit semantics ("given this input, the substrate produced this assessment") belong in a separate attestation mechanism (potentially in Stage 3 D-mechanisms or Stage 6 standards-formation work), not in the per-call signing surface. Verifiers who want reproducibility can request the `Layer1Schema` separately (it is already returned in the composed sandwich output's `extraction` field) and re-run Layer 2 themselves to verify reproducibility independently of the signature. Adding both to the signed payload would increase per-call signing cost without giving most verifiers (who do not run Layer 2 locally) a meaningful capability.
- **(d) Hash of canonical-JSON of full output.** Rejected because it adds canonicalisation requirements without removing them from the assessment-only path (the assessment-only signature also requires canonical-JSON discipline). Hashing the full output produces a smaller wire format but introduces operational fragility (every implementation must agree on JSON canonicalisation rules for the full composed output, including the prose Layer 3 produces — and prose is much harder to canonicalise reliably than the structured assessment).

### Decision 3 alternatives

- **(α) API discovery only.** Rejected because it lacks offline-verification capability for plugins and exposes cold-start verification to MITM risk on the initial key fetch (mitigated by HTTPS but not eliminated). Plugins running inside agents that may be offline (e.g., locally-run agents, intermittent-connectivity environments) cannot verify in this configuration.
- **(β) Plugin manifest only.** Rejected because rotation requires updating every distributed plugin to ship the new public key. With a quarterly rotation cadence (Decision 4), this would mean a quarterly forced plugin update — operationally heavy and unnecessary given that rotation can be handled gracefully via the API-discovery channel.
- **(γ) HMAC secret via plugin-auth onboarding.** Rejected because incompatible with the asymmetric signing scheme elected in Decision 1. This option was only viable if Decision 1 had selected HMAC.

### Decision 4 alternatives

- **(λ1) Single long-lived key, no scheduled rotation.** Rejected because rotation-readiness without a rotation procedure is illusory. A key compromise becomes catastrophic and irreversible without a documented rotation procedure. The cost of scheduling quarterly rotation is small (one founder operation per quarter); the safety benefit of having an exercised rotation procedure is large.
- **(λ3) Key per major Layer 2 version.** Rejected because entangling cryptographic key management with substrate versioning complicates verifier logic without a corresponding security benefit at this scale. Substrate-version semantics are already carried by the `version` and `layer1_schema_version` fields inside the signed payload itself; a verifier reading a signature sees the substrate version inside the assessment, with no key-management entanglement required.
- **(λ4) Defer Decision 4 to a separate ADR.** Rejected (i.e., not deferred) because the rotation contract is verifier-facing — verifiers must know whether to expect rotation and how to handle it. Deferring Decision 4 would mean A3 scaffolding ships a signing surface without a documented rotation contract, leaving verifiers in an indeterminate state. Better to commit the rotation contract now even if the first rotation does not occur for a quarter.

---

## Consequences

### What becomes easier

- **Substrate becomes verifiably authoritative.** Every `Layer2Assessment` carries a cryptographic signature that downstream consumers can verify with the public key. This is the technical foundation for honest certification claims (R18) on the eventual marketplace listing (Stage 4 G3).
- **Third-party verification without sharing signing capability.** Asymmetric Ed25519 means anyone can verify; only the substrate can sign. This unlocks ecosystem participation models where a third-party agent or auditor can confirm a substrate output's provenance without holding a credential equivalent to the substrate's signing key.
- **Plugin offline verification.** The hybrid distribution channel (Decision 3) means plugins can verify without network access, which expands the substrate's deployment envelope (locally-run agents, intermittent-connectivity environments, regulated environments where outbound network is restricted).
- **Rotation hygiene.** A documented quarterly rotation procedure with a 30-day overlap window means key compromise (if it ever occurs) has a contained recovery path rather than a catastrophic one.

### What this requires

- **A3 scaffolding session (Critical risk).** Implements signing in `runSandwichInner` between Layer 2 production and composed-output construction; adds canonicalisation helper; adds `/api/public-key` endpoint; provisions `SUBSTRATE_LAYER2_SIGNING_KEY` env var. PR1 single-endpoint proof on `/api/reason` first; full Critical Change Protocol applies. Risk classification: Critical under PR6 + AC7. The scaffolding session must address: backwards compatibility (existing consumers expecting bare `Layer2Assessment` see the wrapped `{assessment, signature, key_id}` shape — a breaking change to the response wire format that requires a coordinated cutover or a versioned response shape), failure modes (signing failure must fail-closed: no unsigned assessment returned), and verification telemetry (track signature verification successes and failures on consumer-side once plugin work begins in Stage 3).
- **A4 (Key management) session.** Inherits operational responsibility for key custody (Decision 4 specification): backup ceremony per `ADR-ENCRYPTION-WIRING-01` Decision 4 Option 4A pattern; rotation procedure operationalised; calendar reminder for first rotation. A4 risk classification: Critical (crypto key management).
- **B2 (in-plugin Layer 1 R20a script) and Stage 3 C1 (plugin manifest).** Plugin manifest gains a `signing_keys` block containing the substrate's public verification key(s). C1 implementation references this ADR for the manifest schema.
- **G3 (marketplace listing trust signalling) in Stage 4.** Trust signalling can claim "every assessment cryptographically signed by the substrate" with the technical backing this ADR provides.
- **R18 honest certification language.** The certification language on public-facing materials (R18) can claim signature-backed authoritativeness without overclaiming — the signing surface is real and verifier-checkable.

### What becomes harder

- **Wire format becomes more complex.** Consumers see `{assessment, signature, key_id}` instead of bare `Layer2Assessment`. The composed sandwich output's `assessment` field becomes an object instead of the bare assessment. Migration of existing consumers (Stage 2 K-category) must handle this shape change.
- **Founder operational responsibility expands.** In addition to the encryption-key custody discipline from `ADR-ENCRYPTION-WIRING-01`, the founder now custodies a signing-key pair (with quarterly rotation). The rotation procedure is manual and founder-initiated. Calendar discipline matters.
- **Per-call signing cost.** Ed25519 signing is fast (~50 microseconds for the canonicalisation + sign on a typical Vercel function instance) but non-zero. At scale, signing adds measurable latency to every Layer 2 response. Cost monitoring (A9 in Stage 1) should include signing latency in the per-call profile.
- **Canonicalisation discipline.** Signing requires canonical-JSON serialisation. Bugs in canonicalisation (key-ordering inconsistency, number-formatting drift, escape-sequence variation) produce signatures that fail to verify. The scaffolding session must include round-trip tests (sign then verify, with intentional perturbation tests that mutate one byte and confirm verification fails).

### What we'll need to revisit

- **At first compromise event (if ever):** the off-cycle rotation procedure operationalised in A4 engages. Decision 4's incident-response variant is exercised.
- **At first user-base extension beyond founder:** key custody discipline may need scaling beyond the founder's personal backup ceremony. Per-user signing keys, KMS integration, or multi-signer schemes become candidate revisits.
- **At Stage 3 B1 (Layer 1 reference hardening):** the verifier-side helpers exposed in the open Layer 1 reference become public infrastructure. The exact API shape of those helpers should be reviewed against this ADR's Decision 3 spec.
- **At Stage 4 G2 (per-marketplace packaging):** the plugin manifest's `signing_keys` block format may need adaptation per marketplace conventions. This ADR's spec is authoritative for the substrate side; per-marketplace adaptations are scoped to G2.
- **At first telemetry on rotation overlap usage:** if telemetry shows verifiers refresh API discovery faster than 30 days, the overlap window can tighten. If telemetry shows slower refresh (e.g., agents that cache aggressively), the window may need to extend. Revisit at first scheduled rotation (one calendar quarter after A4 lands).

### Risks accepted

- **Founder discipline around signing-key custody.** Mirrors the encryption-key custody risk from `ADR-ENCRYPTION-WIRING-01`. Loss of the private key prevents future signing but does not invalidate already-issued signatures. The mitigation is the three-copy backup discipline (password manager + paper + Vercel env var); the founder's execution of that discipline is what protects against catastrophic key loss.
- **Wire-format shape change for migration.** Stage 2 K-category migration of existing consumers must handle the `assessment` field becoming `{assessment, signature, key_id}`. Mitigation: the migration sequencing places the substrate-shape change inside the per-consumer cutover, so each consumer adapts its parsing during its migration session rather than via a global cutover.
- **Asymmetric signing's per-call cost.** ~50 microseconds per signature is small at low traffic, but at high traffic the cumulative cost is non-trivial. Mitigation: A9 cost monitoring tracks signing latency; if the cost shape changes meaningfully under traffic, the substrate could batch signatures or move to streaming-friendly schemes — but those are post-MVP optimisations.
- **Cold-start MITM exposure for verifiers without the plugin manifest.** Third-party verifiers fetching the public key from API discovery for the first time depend on HTTPS for trust. Mitigation: HTTPS is the standard trust assumption for this category; the plugin manifest channel exists precisely to give plugin-deployed verifiers a stronger trust anchor.

---

## Open questions parked for downstream ADRs

1. **`/api/public-key` endpoint authentication posture.** Public read with no auth (the public key is, by definition, public)? Rate-limited unauthenticated? Cached aggressively at the edge? Decided at A3 scaffolding session opening.
2. **`SUBSTRATE_LAYER2_SIGNING_KEY` env var format details.** PEM string is the spec; line-wrap handling, escape conventions for embedding in env vars, and dev/staging/production isolation specifics are A4 implementation detail.
3. **Wire-format migration strategy for the `assessment` field shape change.** Versioned response shape (`assessment_v2: {...}` alongside existing `assessment`) vs hard cutover vs feature-flag-gated rollout. Decided at A3 scaffolding session opening; depends on K-category migration sequencing decisions in Stage 2.
4. **Canonical-JSON library choice.** Implement in-house (small, controlled, bound to `Layer2Assessment` shape) or use a library (e.g., `json-canon` or RFC 8785 implementation)? Decided at A3 scaffolding session opening; in-house implementation is the default given the small payload shape and the dependency-minimisation preference on this codebase.
5. **First-rotation timing.** Quarterly cadence per Decision 4; exact first-rotation calendar date depends on when A4 lands. Decided at A4 session.
6. **Plugin-manifest `signing_keys` block schema details.** This ADR commits the conceptual structure (`{key_id, algorithm, public_key_pem, issued_at}`); per-marketplace JSON schema or YAML conventions decided at Stage 3 C1.
7. **Verifier-side helper API surface.** Conceptually exposed in the open Layer 1 reference (Stage 3 B1) but the function signatures (`verifyLayer2Assessment(signedAssessment, knownKeys): boolean` vs richer return types) decided at B1.
8. **Adversarial-evaluation protocol scope for the signing surface (R18d).** Should adversarial evaluation include attempts to forge signatures? Standard cryptographic-primitive trust (Ed25519 forgery requires breaking the algorithm) suggests no, but "did we implement the primitive correctly?" is a separate question. Decided at the adversarial-evaluation protocol design session in Stage 4.

---

## Critical Change Protocol responses (for the eventual A3 scaffolding session — drafted here per PR6 + AC7)

The scaffolding session will surface these verbatim before deployment. Drafted now so the founder sees them ahead of time and the scaffolding session has a starting point.

### What is changing (from the founder's perspective)

The substrate gains the ability to cryptographically sign every Layer 2 assessment it produces. Consumers of the substrate (currently `/api/reason`; later all migrated K-category endpoints; eventually plugins) receive responses where the `assessment` field carries a cryptographic signature alongside the assessment itself. A new endpoint `/api/public-key` is added to publish the verification key.

### What could break

- **Wire-format change.** The `assessment` field in the composed sandwich output changes from a bare `Layer2Assessment` to `{assessment, signature, key_id}`. Any consumer expecting the bare shape will fail to parse the response. Mitigation: the scaffolding session decides between versioned response shape, hard cutover, or feature-flag-gated rollout per Open Question 3 above; the chosen approach is named in the Critical Change Protocol response at scaffolding time.
- **Signing failure must fail-closed.** If `crypto.sign` throws (e.g., env var missing or malformed), the response must not return an unsigned assessment. The substrate either returns a 503 or returns a signed-error response, depending on the scaffolding session's chosen failure handling. Mitigation: the scaffolding session adds dedicated error handling around `signLayer2Assessment` and verifies the failure path in production scenario tests.
- **Canonicalisation bug.** A bug in the canonical-JSON helper produces signatures that cannot be verified (signer and verifier disagree on the canonical bytes). Mitigation: the scaffolding session includes round-trip tests (sign-then-verify on canonical seeds) plus perturbation tests (mutate one byte and confirm verification fails). The tests run before deployment.
- **Env var loss.** `SUBSTRATE_LAYER2_SIGNING_KEY` not set or malformed in production. Symptom: `crypto.sign` throws on every Layer 2 call. Mitigation: pre-deploy verification that the env var is set and produces a valid Ed25519 signature on a canonical seed.

### What happens to existing sessions

N/A — only founder + test logins exist per the build-arc cache's "no current users (affirmed 2026-05-10)" governing note. No third-party sessions to invalidate. When the plugin ships and external users exist, this section will require the full Critical Change Protocol step 3 response.

### Rollback plan

Three paths in order of preference:

- **Path A (preferred — within minutes of deploy):** flip a feature flag (e.g., `SUBSTRATE_LAYER2_SIGNING_ENABLED=false`) to disable signing. The substrate returns the bare `Layer2Assessment` shape exactly as today. Existing pipeline unaffected. Schema and env var remain.
- **Path B (revert the deploy):** `git revert <signing-wiring-commit-hash>`; push via GitHub Desktop; Vercel redeploys prior code. Recovery ≤5 min.
- **Path C (env var loss):** restore `SUBSTRATE_LAYER2_SIGNING_KEY` from the founder's three-copy backup (per Decision 4 Option 4A discipline mirrored from `ADR-ENCRYPTION-WIRING-01`) into Vercel env vars. Application reads on next deploy. Already-issued signatures remain verifiable.

### Verification step (post-deploy, founder-performable)

A canonical curl against `/api/reason` confirms the response has a signed assessment shape; a curl against `/api/public-key` confirms the public key is published. Specific commands and expected output drafted at the scaffolding session per the verification framework.

### Explicit approval required

The scaffolding session does not deploy without the founder typing "OK" or "go ahead" in the chat — and that approval must be specific to the named risks above (not a general "yes proceed").

---

## AC7 compatibility posture

This ADR drafting touches no AC7 surface. The scaffolding session that implements this ADR also touches no AC7 surface in the strict sense — the signing infrastructure does not change auth/cookie/session/redirect behaviour. However, the scaffolding session is **classified as Critical under PR6** because (a) the signing surface is cryptographic infrastructure where bugs have outsized consequences, and (b) the scaffolding session co-resides on the same route file as the auth surface (`/api/reason/route.ts`) so any change to the route invokes AC7-adjacent caution. The Critical Change Protocol applies in full at scaffolding time.

---

## Honest disclosure

This ADR drafts the architecture for Layer 2 signing infrastructure. It does not implement the signing — that's the A3 scaffolding session's work, executed under the Critical Change Protocol responses drafted above. The scaffolding session may revise specific implementation details (in-house vs library canonical-JSON; standard vs URL-safe base64 for the signature wire format; specific helper module location) without revisiting this ADR's four named decisions. Material changes to any of the four named decisions require a new ADR or an explicit ADR-LAYER2-SIGNING-INFRASTRUCTURE-02 supersession entry.

The single biggest operational risk this ADR cannot eliminate is **founder discipline around the signing-key custody and rotation cadence**. The ADR makes the discipline explicit; the founder's execution of that discipline is what protects the data from worst-case loss. Mirroring the encryption-key custody risk from `ADR-ENCRYPTION-WIRING-01` is not coincidental — the substrate now has two cryptographic key custody obligations (encryption + signing), and operational discipline scales with each.

---

## Approval gate

This deliverable is the architecture decision record for Stage 1 item A3. Approval pathway choice for the founder:

- **Path A — Adopt as drafted; move to `/adopted/` this session.** The ADR's four decisions become committed architecture; the scaffolding session executes against this commitment. Risk classification for the move: Elevated under 0d-ii (file move from `/drafts/` to `/adopted/`).
- **Path B — Adopt at separate session.** Drafting accepted; founder reviews offline; explicit Adopt at a follow-up session.
- **Path C — Hold for revision.** Specific revisions identified; ADR returns for next-iteration review.

If Path A: the ADR moves to `/adopted/ADR-layer2-signing-infrastructure.md` and the decision-log entry becomes `D-A3-LAYER2-SIGNING-ADR-ADOPTED-2026-05-10` (Elevated risk, archive note per the standing cache); A3 implementation status moves Scoped → Designed.

If Path B: the ADR remains in `/drafts/`; the decision-log entry is `D-A3-LAYER2-SIGNING-ADR-DRAFTED-2026-05-10` (Standard risk); revisit at the named follow-up session.

If Path C: revisions specified; founder calls.

---

*End of ADR-LAYER2-SIGNING-INFRASTRUCTURE-01. The eventual A3 scaffolding session is Critical risk; commencement awaits founder direction on this ADR's adoption and the scaffolding-session-prompt finalisation.*
