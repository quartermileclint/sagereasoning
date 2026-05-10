# ADR-A4-KEY-MANAGEMENT-01: Operationalising the Layer 2 Signing Key Rotation Procedure

**Status:** Adopted 2026-05-10 under `D-A4-KEY-MANAGEMENT-WIRED-VERIFIED-2026-05-10` (Path A elected by founder at session Step 8 with explicit approval naming the four risks). Moved from `/drafts/ADR-A4-key-management.md` to `/adopted/ADR-A4-key-management.md` 2026-05-10; predecessor preserved in git history per the preserve-prior-versions principle.
**Date:** 2026-05-10.
**Stream:** founder.
**Governing frame:** `/adopted/standing-protocol-cache.md` + `/adopted/build-sessions-protocol-cache.md`.
**Deciders:** Founder (sole signatory).
**Implements / serves:** Stage 1 item A4 of `/adopted/substrate-plugin-staging-plan.md` (Key management); the rotation contract committed in `/adopted/ADR-layer2-signing-infrastructure.md` §Decision 4 (which A4 operationalises but does not re-decide); R17f (key-custody discipline mirrored from `ADR-ENCRYPTION-WIRING-01.md` Decision 4 Option 4A); R18 (honest certification — a documented, exercised rotation procedure is what makes the rotation contract defensible); AC7 (auth-surface adjacent — the previous-key env-var slots co-reside with the signing surface that A3 made authoritative); PR1 (single-endpoint proof discipline — A4 wiring proven on `/api/public-key` first); PR6 (safety-critical changes are Critical — this scaffolding session is Critical).

**Cross-references:**
- `/adopted/ADR-layer2-signing-infrastructure.md` (the architectural anchor — A4 ADR does not re-decide the rotation contract; it operationalises §Decision 4)
- `/adopted/ADR-ENCRYPTION-WIRING-01.md` Decision 4 Option 4A + Decision 5 (the key-custody and rollback discipline mirrored)
- `/adopted/substrate-plugin-staging-plan.md` Stage 1 item A4 + Stage 1 success criteria
- `/adopted/build-sessions-protocol-cache.md` — build-arc cache; "no current users (affirmed 2026-05-10)" governing note
- `/adopted/standing-protocol-cache.md` — general session protocol; risk classification; lean templates (NOT used here — full templates per Critical session)
- `/operations/handoffs/founder/2026-05-10-stage-1-a3-wired-verified-close.md` — predecessor close (A3 Verified)
- `/operations/decision-log.md` entries `D-A3-LAYER2-SIGNING-WIRED-VERIFIED-2026-05-10`, `D-A3-LAYER2-SIGNING-ADR-ADOPTED-2026-05-10`, `D-A2-INPUT-VALIDATION-SURFACE-2026-05-10`, `D-A1-FLAG-FLIP-VERIFIED-2026-05-10`, `D-STAGING-PLAN-ADOPTED-2026-05-10`
- `/website/src/app/api/public-key/route.ts` — verifier-facing endpoint A4 extends with the previous-key slot
- `/website/src/lib/translation-sandwich/layer2-signer.ts` — signing module (unchanged this session per Choice 2(a))
- `/website/src/lib/server-encryption.ts` — rotation-ready `version` field pattern mirrored
- `/website/src/lib/translation-sandwich/tier1-token.ts` — env-var-read-at-call-time discipline mirrored
- `/manifest.md` — full manifest (R0–R20, AC1–AC8, KG1–KG7, PR1–PR9)

---

## Plain-language summary

A3 (Verified 2026-05-10) made every Layer 2 assessment authoritative by signing it with an Ed25519 signature. A3 ADR §Decision 4 committed the substrate to a quarterly rotation cadence with a 30-day overlap window during which both the new and previous keys verify successfully. **This ADR operationalises that rotation contract** — it does not re-decide it.

A4 commits four operational decisions, all elected by the founder at session-open: (1) **rehearse the rotation procedure now on a test keypair** before the first scheduled live rotation; (2) **add three new optional env vars** to support the 30-day overlap window (previous public key + key_id + retires_at); (3) **deliver the rotation runbook as a markdown file** at `/operations/runbooks/substrate-layer2-key-rotation.md`; (4) **schedule the first live rotation for Sunday 2026-09-06**.

The A4 scaffolding session (this session) is **Critical risk** under PR6 + AC7 and engages the full Critical Change Protocol. The CCP responses are pre-drafted below per the T-A3-NEW-1 pattern (drafted ahead of time inside the ADR so the eventual scaffolding work inherits them rather than starting from scratch — this is the second observation of the pattern; promotion to a process rule is eligible at the third recurrence).

---

## Context

### Why this ADR now

A3 reaches Verified at the predecessor session (D-A3-LAYER2-SIGNING-WIRED-VERIFIED-2026-05-10). The substrate signs every authoritative `Layer2Assessment`; verifiers fetch the public key at `/api/public-key`. A3 ADR §Decision 4 drafted a 9-step rotation procedure but it has never been exercised: the substrate has no env-var slots for a previous key, the `/api/public-key` endpoint always returns `previous: null`, no calendar reminder for the first scheduled rotation exists, and no founder-performable runbook exists.

Each gap is a latent risk. Per A3 ADR §Decision 4: *"rotation-readiness without a rotation procedure is illusory. A key compromise becomes catastrophic and irreversible without a documented rotation procedure."* And per `ADR-ENCRYPTION-WIRING-01.md`'s framing of R17f: *"a protection that has failed as a protection."* A4 closes those gaps.

### What A3 already established (inherited; not re-decided)

- **Cadence:** quarterly. First rotation on a 2026Q3 calendar date.
- **Procedure (9 steps):** generate new keypair → assign new key_id → backup → add new public key to API discovery as previous slot → wait 24 hours for verifier refresh → promote new key to current → update env var → 30-day overlap window → retire previous key.
- **Overlap window:** 30 days during which both the new and previous keys verify successfully.
- **Rotation triggers:** scheduled quarterly cadence is the default; off-cycle if private key suspected compromised.
- **Key custody:** mirrors `ADR-ENCRYPTION-WIRING-01` Decision 4 Option 4A — three-copy backup ceremony (password manager + paper + Vercel env var).
- **Verifier obligations:** verifiers MUST accept signatures from any key in `{current, previous}` during the overlap window; the substrate guarantees `key_id` always identifies a key in `{current, previous}` for the overlap window.

### What A4 adds (this ADR)

- **Four new optional env-var slots** for the previous key during overlap (Decision 2 of this ADR).
- **Extension of `/api/public-key`** to populate the `previous` field and `rotation_overlap_until` when those env vars are set (Decision 2 of this ADR).
- **A founder-performable rotation runbook** with exact commands and verification queries (Decision 3 of this ADR).
- **A first scheduled rotation date** committed to the calendar (Decision 4 of this ADR).
- **An off-cycle (compromise-suspected) rotation variant** documented as an incident-response runbook (Decision 3 of this ADR; same file as the scheduled-rotation runbook, separate section).
- **A rotation-procedure dry-run rehearsal** against a test keypair (Decision 1 of this ADR), so the runbook is exercised before it matters in earnest.

### What A4 deliberately does NOT change

The signing module (`layer2-signer.ts`) is unchanged this session — Choice 2(a) commits the substrate to a single-current-key signing role; the previous-key slot exists only on the verifier-facing `/api/public-key` endpoint to support overlap-window verification. Adding a previous-private-key slot to enable dual-signing was rejected (see Choice 2 alternatives below).

---

## Decisions

This ADR makes four named decisions, elected by the founder at session-open. Each decision's selected option is presented with concrete specification; alternatives considered are recorded in the §Alternatives section.

### Decision 1 — Dry-run posture: rehearse the rotation procedure now on a test key

**Selected:** Choice 1(a) — generate a fresh Ed25519 keypair in the AI sandbox; walk the full rotation procedure against it; confirm `/api/public-key` returns the expected `previous`/`rotation_overlap_until` shape during the simulated overlap; retire the test key.

**Concrete specification:**
- The dry-run is a Vercel preview-environment exercise. Production env vars are NOT modified during the dry-run.
- The AI generates the test keypair in its sandbox using `node:crypto.generateKeyPairSync('ed25519')`.
- The founder substitutes test values for the three new previous-key env vars (per Decision 2) in a Vercel preview deploy (NOT production). The substitution exercises the env-var-update mechanics that the runbook documents.
- Verification queries (curl + Python) confirm `/api/public-key` returns the expected shape.
- The test keypair is retired at the end of the dry-run; the test env vars are unset; the preview deploy returns to its no-rotation state.

**Reasoning:** The first scheduled rotation lands ~119 days after A4. If the runbook has a procedural gap (e.g., env-var-update timing mismatch, unclear naming convention, missing step), the gap surfaces in earnest during the first live rotation — when there is no margin for procedure adjustment without delaying the cadence. The 30-minute investment in a dry-run during this session is the cheapest insurance against a first-live-rotation gap. The dry-run also exercises the founder backup-ceremony muscle memory before it matters operationally.

### Decision 2 — Previous-key env-var schema during the 30-day overlap window: four new env vars (no previous-private-key)

**Selected:** Choice 2(a) — add four new optional env vars (`SUBSTRATE_LAYER2_PREVIOUS_PUBLIC_KEY`, `SUBSTRATE_LAYER2_PREVIOUS_KEY_ID`, `SUBSTRATE_LAYER2_PREVIOUS_KEY_ISSUED_AT`, `SUBSTRATE_LAYER2_PREVIOUS_KEY_RETIRES_AT`) for the previous key only; the substrate continues to sign with only the current key.

**Refinement note (in-session 2026-05-10):** The session prompt's Choice 2(a) named three env vars (public key + key_id + retires_at). Implementation surfaced the need for a fourth env var `SUBSTRATE_LAYER2_PREVIOUS_KEY_ISSUED_AT` to populate the `issued_at` field of the `previous` block per the A3 ADR §Decision 3 response shape contract. The architectural intent of Choice 2(a) is preserved: previous-key env vars only; no previous-private-key slot; substrate's signing role remains single-current-key. The change is purely operational — one additional env var of the same character as the others, with the same fail-safe rule ("all four set or none set"). Founder elected refinement (A) at session-open's Step 4 deliberation, with alternatives (B) omit issued_at and (C) derive from key_id parsing rejected.

**Concrete specification:**
- Four new optional env vars in Vercel project settings:
  - `SUBSTRATE_LAYER2_PREVIOUS_PUBLIC_KEY` — PEM SPKI public key of the previous key
  - `SUBSTRATE_LAYER2_PREVIOUS_KEY_ID` — quarter-encoded identifier (e.g., `substrate-layer2-2026Q2`)
  - `SUBSTRATE_LAYER2_PREVIOUS_KEY_ISSUED_AT` — ISO 8601 timestamp captured from `SUBSTRATE_LAYER2_KEY_ISSUED_AT` at the moment of demotion (i.e., the previous key's original issued_at value when it was the current key)
  - `SUBSTRATE_LAYER2_PREVIOUS_KEY_RETIRES_AT` — ISO 8601 timestamp marking the end of the overlap window
- The `/api/public-key` route reads all four env vars at call time. When **all four** are set: the response populates `previous: {key_id, public_key_pem, issued_at, retires_at}` and `rotation_overlap_until: <retires_at value>`. When **any are unset** (the post-rotation steady-state and the pre-first-rotation state): `previous: null` and `rotation_overlap_until: null` per existing behaviour. Partial state (some set, some unset) defaults to no-rotation per the fail-safe posture.
- The signing module (`layer2-signer.ts`) is **not modified**. The substrate signs with only `SUBSTRATE_LAYER2_SIGNING_KEY` (the current key) at all times.
- Verifiers select the public key matching the `key_id` field on a signed-assessment object: if it matches the API discovery's `key_id` (current), use that; if it matches `previous.key_id`, use the previous key; otherwise reject.
- The runbook captures the issued_at value during Step 6 of the rotation procedure — at the moment the founder demotes the current key to previous, the founder reads `SUBSTRATE_LAYER2_KEY_ISSUED_AT` from Vercel (the value before overwrite) and stores it in `SUBSTRATE_LAYER2_PREVIOUS_KEY_ISSUED_AT`.

**Reasoning:** Mirrors the symmetry of how the encryption-key `version` field works in `server-encryption.ts` — a single current value plus a known-previous value, with the substrate operating on the current and the verifier-facing surface bridging both. Avoids the operational complexity of two private signing keys live simultaneously (Choice 2(b)). Honours the A3 ADR §Decision 4 commitment to a 30-day overlap window without requiring an ADR amendment (which Choice 2(c) would have required).

### Decision 3 — Rotation runbook delivery format: markdown file at /operations/runbooks/

**Selected:** Choice 3(a) — create `/operations/runbooks/substrate-layer2-key-rotation.md` with the founder-performable rotation procedure.

**Concrete specification:**
- New directory `/operations/runbooks/` created this session (first occupant).
- File `/operations/runbooks/substrate-layer2-key-rotation.md` contains:
  - Pre-rotation checklist (1 week before rotation date): backup verification; current key_id verification; runbook re-read.
  - Rotation procedure (9 steps with exact founder-performable commands).
  - Verification at each step (curl + Python pass/fail check; mirrors A3 Step 12 patterns).
  - Off-cycle (compromise-suspected) rotation variant — shorter timeline; founder discretion on overlap shortening based on threat profile.
  - Rollback paths during a rotation (Path A: un-promote / restore previous env-var values; Path B: revert deploy; Path C: full re-rotation if compromise confirmed).
  - Post-rotation reflection: founder reviews what worked; updates the runbook based on observation.
- The runbook is a **living document**. Each rotation may produce updates based on observed friction. The runbook's update discipline: founder edits in-session at the next session after the rotation; AI applies as Standard-risk governance change.

**Reasoning:** Co-locates operational steps with other operational documents (decision log, handoffs); keeps the architectural ADR focused on architecture rather than operations. The `/operations/runbooks/` directory is a new operational pattern that may serve future runbook needs (off-cycle key compromise; encryption-key rotation when that comes; future deployment runbooks).

### Decision 4 — First scheduled rotation date: Sunday 2026-09-06

**Selected:** Choice 4(a) — Sunday 2026-09-06.

**Concrete specification:**
- 119 days after A3 wired (2026-05-10).
- Within 2026Q3 per the A3 ADR §Decision 4 commitment.
- Quiet weekend (early September; pre-fall-conference season).
- Calendar reminder added to founder's calendar this session: "Substrate Layer 2 key rotation — first scheduled rotation per ADR-A4 Decision 4. Run /operations/runbooks/substrate-layer2-key-rotation.md."
- Subsequent quarterly cadence: 2026-12-06 (or first Sunday of December within ~2 weeks); 2027-03-07 (or first Sunday of March); etc. The runbook references the cadence; calendar entries land at each rotation's session-close.

**Reasoning:** Comfortable verifier-ecosystem lead-time without pushing against the next quarterly rotation. Sunday is the standard low-traffic deploy window for the codebase (no scheduled jobs; founder availability typical). Early September avoids the late-summer holiday season and the late-September quarter-end pressure.

---

## Alternatives considered

### Decision 1 alternatives
- **Choice 1(b) — Treat first scheduled rotation as the dry-run.** Rejected because the safety value of an exercised runbook before the live rotation matters more than the 30-minute session-time saving. The first live rotation is the moment when procedural gaps have the highest cost to discover.
- **Choice 1(c) — No dry-run; document and trust the runbook.** Rejected because the runbook has never been exercised; trust without exercise is the failure mode A3 ADR §Decision 4 explicitly names.

### Decision 2 alternatives
- **Choice 2(b) — Three env vars including a previous-private-key slot.** Rejected because the substrate's signing role is single-current-key per A3 ADR §Decision 4; adding a previous-private-key slot would enable dual-signing without architectural justification, and it would double the founder's key-custody discipline (two private keys live simultaneously means two backup ceremonies and two rotation-related failure modes).
- **Choice 2(c) — No previous-key slot; rotation is a hard cutover.** Rejected because it violates the A3 ADR §Decision 4 commitment to a 30-day overlap window. Verifiers refreshing during the 30-day window after rotation would silently fail until they refresh `/api/public-key`. Adopting this option would require an A3 ADR amendment first.

### Decision 3 alternatives
- **Choice 3(b) — Inside the A4 ADR.** Rejected because the runbook is operational, not architectural; co-locating it with architectural decisions risks the ADR becoming an operations manual that must be maintained on every operational change. ADRs are decision records, not operational documents.
- **Choice 3(c) — Both (ADR + runbook file).** Rejected because doubling the maintenance surface introduces drift risk between the two; if the runbook in the ADR diverges from the runbook in the file, a future rotation may consult the wrong one.

### Decision 4 alternatives
- **Choice 4(b) — Sunday 2026-08-02.** Rejected because tighter verifier-ecosystem lead-time without a corresponding benefit.
- **Choice 4(c) — Sunday 2026-09-27.** Rejected because it pushes against the next quarterly rotation (2026-12-06 would be only 70 days later, compressing the second-rotation lead-time).
- **Choice 4(d) — Defer to A5 close.** Rejected because A4's purpose is to commit the rotation contract operationally; deferring the first-rotation date defers a load-bearing operational commitment without good reason.

---

## Consequences

### What becomes easier
- **The rotation contract is operational, not just architectural.** A documented runbook + scheduled first-rotation date + exercised dry-run together close the gap A3 ADR §Decision 4 left between architecture and operations.
- **Compromise-event response has a known path.** The off-cycle (compromise-suspected) rotation variant in the runbook means a key compromise has a contained recovery path rather than an emergency-discovery path.
- **Verifier ecosystem can refresh on a known cadence.** Verifiers know the substrate rotates quarterly; they can budget refresh cadence around it.
- **Future rotation runbooks can mirror this pattern.** The encryption-key rotation runbook (a deferred F-series stewardship item) can use the same `/operations/runbooks/` shape.

### What this requires
- **A4 scaffolding session (this session, Critical risk).** Implements the previous-key env-var slots in `/api/public-key/route.ts`; writes the runbook; rehearses the dry-run; sets the calendar reminder. PR1 single-endpoint proof on `/api/public-key` first; full Critical Change Protocol applies.
- **Founder operational discipline expands.** The founder now custodies a rotation cadence in addition to the existing monthly backup-verification cadence. The runbook reduces the per-rotation cognitive load but the calendar discipline matters.
- **First scheduled rotation will land on 2026-09-06.** A founder-AI session at that date executes the runbook; the AI participates in rotation steps that benefit from the AI's runtime (canonical command generation, verification curl construction, post-rotation observation logging).

### What becomes harder
- **/api/public-key gains a new response shape variant.** Verifiers must handle the case where `previous` is non-null and `rotation_overlap_until` is set. The ADR commits the substrate to this shape; downstream verifier code must accommodate it. The plugin manifest's `signing_keys` block schema (Stage 3 C1) must support multiple keys.
- **Four new env vars in Vercel.** The founder's env-var inventory grows. The runbook documents which env vars are set when (steady state vs rotation-in-progress).
- **Partial-state env-var defaults to no-rotation.** If a rotation is mid-process and one of the four env vars is accidentally unset, the endpoint defaults to no-rotation rather than producing an inconsistent state. This is a deliberate fail-safe but it means the runbook must include a check-all-four step.

### What we'll need to revisit
- **At the first scheduled rotation (2026-09-06):** the runbook is exercised in earnest. The post-rotation reflection step generates updates to the runbook based on observation.
- **At the first off-cycle rotation (compromise-suspected, if ever):** the off-cycle variant is exercised. Updates flow back to the runbook.
- **At Stage 3 C1 (plugin manifest):** the `signing_keys` block schema needs to support multiple keys (current + previous). The current/previous distinction in the plugin manifest may differ in shape from the API discovery response; reconciliation happens at C1.
- **At first user-base extension beyond founder:** the calendar-discipline assumption may need to scale. KMS migration becomes a candidate revisit.

### Risks accepted
- **Founder discipline around rotation cadence.** Mirrors the encryption-key custody risk from `ADR-ENCRYPTION-WIRING-01`. The mitigation is the calendar reminder + the runbook + the quarterly cadence; the founder's execution is what protects against drift.
- **Mid-rotation rollback complexity.** A failed rotation mid-procedure is more complex to roll back than a single-deploy failure. The runbook covers the three rollback paths explicitly; the dry-run exercises them.
- **Test-env-var pollution risk.** The dry-run uses test env vars. If the founder forgets to unset them, the production endpoint serves the test previous-key as if a rotation were in progress. Mitigation: the dry-run procedure includes an explicit "unset test env vars" step at the end; the post-dry-run verification re-confirms the endpoint returns to no-rotation state.

---

## Open questions parked for downstream sessions

1. **Plugin-manifest `signing_keys` block schema for the multi-key case.** A4 commits the substrate to publishing both current and previous keys via API discovery during overlap; the plugin manifest's matching schema is decided at Stage 3 C1.
2. **Verifier-side helper API surface for multi-key verification.** The open Layer 1 reference (Stage 3 B1) will expose a `verifyLayer2Assessment(signedAssessment, knownKeys[]): boolean` helper; the function signature decided at B1.
3. **Telemetry for `previous` slot usage.** Whether to log when a verifier requests verification with a `key_id` matching the previous slot vs the current slot. Useful for tightening or extending the 30-day overlap window based on observation. Out of scope for A4; revisit at first scheduled rotation post-event.
4. **Encryption-key rotation runbook.** The `MENTOR_ENCRYPTION_KEY` (per `ADR-ENCRYPTION-WIRING-01`) does not yet have a documented rotation procedure. The pattern A4 establishes is reusable. F-series stewardship item; a future Standard-risk governance session can produce `/operations/runbooks/mentor-encryption-key-rotation.md` mirroring this ADR's structure.
5. **Calendar consolidation.** The founder now carries two cryptographic-key reminders (monthly backup verification per `ADR-ENCRYPTION-WIRING-01`; quarterly rotation per this ADR). Consolidating into a single recurring "Cryptographic key custody check" item is an F-series efficiency item flagged in the predecessor close. Decided at a routine governance session.

---

## Critical Change Protocol responses (drafted ahead of time per T-A3-NEW-1)

Per PR6 + AC7 and the A3 ADR's pattern (T-A3-NEW-1; second observation this session, eligible for promotion to a process rule at the third recurrence). The scaffolding session surfaces these verbatim before deployment; founder confirms specific to the named risks.

### What is changing (from the founder's perspective)

The substrate's verification-key endpoint (`/api/public-key`) gains the ability to publish a "previous" key during a rotation overlap window. Four new optional environment variables in Vercel control whether the endpoint reports a rotation as in progress (per Decision 2's refinement note above). When the variables are unset (the steady state), the endpoint behaves exactly as today. When all four are set (during a rotation), the endpoint reports the previous key alongside the current key so verifiers can verify signatures from either key during the overlap window. A founder-performable runbook is added at `/operations/runbooks/substrate-layer2-key-rotation.md` covering the 9-step rotation procedure, the off-cycle (compromise-suspected) variant, verification at each step, and rollback paths.

### What could break

- **Env-var-update timing mismatch during rotation.** Vercel may not propagate all four env-var updates atomically in a single redeploy. Symptom: partial state during deploy; the endpoint defaults to no-rotation per the fail-safe posture, meaning verifiers temporarily lose visibility of the previous key. Mitigation: the runbook specifies per-env-var verification after each Vercel save; the fail-safe posture (partial state → no-rotation) means worst case is a temporary loss of overlap-window verification, not silent acceptance of bad state.
- **Verifier failing to refresh `/api/public-key` during overlap.** A verifier that caches the public key indefinitely may reject signatures from the new current key (because its cached `key_id` is the previous key's). Mitigation: the endpoint's `Cache-Control: public, max-age=3600, s-maxage=3600` header (already present from A3) means standards-compliant verifiers refresh hourly; any verifier that violates this does so at its own risk.
- **Previous-key env-var loss.** If the founder accidentally deletes `SUBSTRATE_LAYER2_PREVIOUS_PUBLIC_KEY` mid-overlap, verifiers that haven't refreshed lose verification capability for previous-key signatures. Mitigation: the rotation runbook includes a backup capture of the demoted key's PEM as part of Step 6; the founder retains the demoted key's PEM in a password manager entry through the 30-day window before retiring.
- **Canonical-JSON drift between current and previous canonicalisation.** This session does NOT modify `layer2-canonical-json.ts`; canonicalisation discipline is unchanged. If a future session modifies canonicalisation in a way that breaks backward compatibility, signatures issued before the change become unverifiable. Mitigation: out of A4 scope; flagged for any future session touching canonical-JSON.
- **Test-env-var pollution after dry-run.** If the founder forgets to unset the dry-run's test env vars, the production endpoint reports a fake "rotation in progress" state. Mitigation: the dry-run procedure includes an explicit "unset test env vars" step + post-dry-run verification confirming the endpoint returns to Scenario 1 state.

### What happens to existing sessions

N/A — only founder + test logins exist per the build-arc cache's "no current users (affirmed 2026-05-10)" governing note. No third-party sessions to invalidate. Verifier ecosystem is currently the AI sandbox + the founder's manual curls; no production verifier is currently caching the key. When the plugin ships and external users + verifiers exist, this section will require the full Critical Change Protocol step 3 response.

### Rollback plan

Three paths in order of preference:
- **Path A (preferred — within 30 seconds of any failure):** un-set the four new previous-key env vars in Vercel; redeploy. The endpoint returns to no-rotation state (current behaviour). Recovery ≤30s via Vercel redeploy.
- **Path B (revert the deploy):** `git revert <a4-wiring-commit-hash>` and push via GitHub Desktop. Vercel redeploys prior code (the A3-Verified state). Recovery ≤5 min.
- **Path C (env var loss):** restore env vars from the founder's three-copy backup. Mirrors A3 Path C exactly. Already-issued signatures remain verifiable.

If a real rotation is in progress and Path A is engaged: the rotation is paused at whichever step it was at; the runbook documents how to resume at the next session (or how to fully un-rotate back to the prior current key if the rotation should not proceed).

If all three rollback paths are exhausted: declare incident; engage the encryption-wiring incident-response pattern from `ADR-ENCRYPTION-WIRING-01`; report at session close.

### Verification step (post-deploy, founder-performable)

Three production scenarios, run in order:
1. **Scenario 1 (no rotation):** confirm four new env vars are unset; canonical curl against `/api/public-key`; expected `previous: null` + `rotation_overlap_until: null`.
2. **Scenario 2 (rotation in progress):** founder sets the four new env vars to test values + Vercel redeploys; canonical curl; expected `previous: {key_id, public_key_pem, issued_at, retires_at}` + `rotation_overlap_until` matches the retires_at value.
3. **Scenario 3 (partial state):** founder unsets one of the four; redeploys; canonical curl; expected `previous: null` + `rotation_overlap_until: null` (fail-safe).

After verification: founder unsets the test env vars; Vercel redeploys; the endpoint returns to Scenario 1 state for production.

Exact commands and expected output drafted at the scaffolding session per the verification framework (see Step 10 of the next-session prompt).

### Explicit approval required

The scaffolding session does not deploy without the founder typing "OK" or "go ahead" in the chat — and that approval must be specific to the named risks above (not a general "yes proceed").

---

## AC7 compatibility posture

This ADR drafting touches no AC7 surface. The scaffolding session that implements this ADR also touches no AC7 surface in the strict sense — the previous-key env-var slots and the `/api/public-key` extension do not change auth/cookie/session/redirect behaviour. However, the scaffolding session is **classified as Critical under PR6** because (a) cryptographic key management is safety-critical infrastructure where bugs have outsized consequences (the 30-day overlap window is what protects verifiers from a hard cutover), and (b) the scaffolding co-resides with the signing surface that A3 made authoritative — modifications to `/api/public-key` must preserve the verification contract that A3 established. The Critical Change Protocol applies in full at scaffolding time.

---

## Honest disclosure

This ADR operationalises the rotation contract from A3 ADR §Decision 4. It does not re-decide the contract; the four named decisions in this ADR are operational decisions, not architectural ones. The architectural decision (single key with quarterly rotation and 30-day overlap) was committed at A3 ADR adoption and is honored unchanged here.

The single biggest operational risk this ADR cannot eliminate is **founder discipline around the rotation cadence and the rotation runbook execution**. The ADR makes the discipline explicit; the founder's execution of the rotation procedure (with the AI's collaboration) is what protects the substrate from a degenerate compromise scenario. Mirroring the encryption-key custody risk from `ADR-ENCRYPTION-WIRING-01` is not coincidental — every cryptographic-key obligation scales with founder discipline. This ADR adds a third such obligation (rotation cadence) on top of the two existing ones (encryption-key backup verification monthly; signing-key backup verification monthly).

The dry-run rehearsal (Decision 1) is the discipline-supporting mechanism that distinguishes A4 from a pure documentation exercise. By exercising the runbook against a test keypair before the first live rotation matters, the founder + AI together convert the runbook from a checklist into a memory. This is the "exercised protection" that R17f and ADR-ENCRYPTION-WIRING-01 §Honest disclosure both name as load-bearing.

---

## Approval gate

This deliverable is the architecture decision record for Stage 1 item A4. Approval pathway choice for the founder:

- **Path A — Adopt as drafted; move to `/adopted/` this session.** The ADR's four decisions become committed; the scaffolding session executes against this commitment. Risk classification for the move: Elevated under 0d-ii (file move from `/drafts/` to `/adopted/`); the scaffolding work that follows is Critical.
- **Path B — Adopt at separate session.** Drafting accepted; founder reviews offline; explicit Adopt at a follow-up session.
- **Path C — Hold for revision.** Specific revisions identified; ADR returns for next-iteration review.

If Path A: the ADR moves to `/adopted/ADR-A4-key-management.md` and the decision-log entry becomes `D-A4-KEY-MANAGEMENT-WIRED-VERIFIED-2026-05-10` (Critical risk; full form per the standing cache); A4 implementation status moves Scoped → Designed → Scaffolded → Wired → Verified within this session.

If Path B: the ADR remains in `/drafts/`; the decision-log entry is `D-A4-KEY-MANAGEMENT-ADR-DRAFTED-2026-05-10` (Standard risk); revisit at the named follow-up session.

If Path C: revisions specified; founder calls.

---

*End of ADR-A4-KEY-MANAGEMENT-01. The eventual A4 scaffolding work is Critical risk; commencement awaits founder direction on this ADR's adoption and the Step 3 CCP confirmation.*
