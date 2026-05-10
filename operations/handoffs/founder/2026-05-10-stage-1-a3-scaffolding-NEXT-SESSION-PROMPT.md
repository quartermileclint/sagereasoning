# Next-Session Prompt — Stage 1 A3 Scaffolding: Layer 2 Signing Infrastructure (Critical risk)

**Stream:** founder.
**Tier:** code-critical. Full templates per the standing cache (Critical templates, not Lean).
**Governing frame:** /adopted/standing-protocol-cache.md + /adopted/build-sessions-protocol-cache.md.
**Predecessor session close:** /operations/handoffs/founder/2026-05-10-stage-1-a3-adr-adopted-close.md
**Predecessor decision-log entries:** D-A3-LAYER2-SIGNING-ADR-ADOPTED-2026-05-10, D-A2-INPUT-VALIDATION-SURFACE-2026-05-10, D-A1-FLAG-FLIP-VERIFIED-2026-05-10, D-A1-INVOCATION-SITE-2026-05-10, D-A1-LAYER2-AUTH-SCAFFOLD-2026-05-10, D-STAGING-PLAN-ADOPTED-2026-05-10
**Risk classification:** **Critical** under 0d-ii (cryptographic signing infrastructure; PR6 + AC7 engage; co-resides with the auth surface on `/api/reason/route.ts`). **Critical Change Protocol applies in full.** The pre-drafted CCP responses inside `/adopted/ADR-layer2-signing-infrastructure.md` §"Critical Change Protocol responses" are the inherited starting point; the AI confirms or updates each at session-open before any code change.

---

## Founder governing note (still in force for the duration of the build arc)

Per `/adopted/build-sessions-protocol-cache.md` §"Founder governing notes for the duration of the build arc": **No current users (affirmed 2026-05-10).** The only logins are the founder's and known test logins. The Critical Change Protocol's step 3 ("What happens to existing sessions?") may be answered "N/A — only founder + test logins exist; no third-party sessions to invalidate." All other Critical Change Protocol steps remain in full force. When the plugin ships and external users exist, this simplification ends.

---

## Why this session matters

The A3 ADR (adopted 2026-05-10) committed four design choices for Layer 2 signing infrastructure: Ed25519 asymmetric signing; `Layer2Assessment`-only as the signed payload; hybrid public-key distribution (API discovery + plugin manifest); single key with quarterly rotation and 30-day overlap. This session **scaffolds those decisions** — implementing Ed25519 signing of every Layer 2 assessment in the `runSandwichInner` orchestrator, exposing the verification key via a new `/api/public-key` endpoint, and proving the surface on `/api/reason` per PR1 before any rollout.

Signing is the technical mechanism that distinguishes a Layer 2 assessment that is "validated" (passes structural checks) from one that is "authoritative" (cryptographically attested by the substrate). Per `/adopted/ADR-stoic-agent-substrate-concept.md` §"The moat boundary", the moat sits jointly on Layer 2 + Layer 3; signing is what makes Layer 2's contribution to the moat verifiable by third parties.

After A3 reaches Verified, the build arc proceeds to **A4 — Key management** (Critical risk), which operationalises the rotation procedure drafted in the A3 ADR.

---

## Pre-conditions

1. The session-close commit from the predecessor session is on origin/main (run `git log --oneline -3 origin/main` and confirm the A3-ADR-Adopted commit is present).
2. The adopted ADR is at `/adopted/ADR-layer2-signing-infrastructure.md` and the predecessor `/drafts/` copy has been removed (preserved in git history). The verification block in the predecessor close walks through this confirmation.
3. A2 input-validation surface is still Verified on production. The optional verification curl in the predecessor close confirms this; if the founder did not run it, the session-open step will run it as a 30-second governance check.
4. Founder is ready to participate in the key-generation + backup ceremony at the appropriate step. The ceremony requires: (a) access to a password manager (or equivalent secure note storage); (b) ability to print a paper copy or write the key by hand on paper for physical-secure-storage backup; (c) access to Vercel project settings to set `SUBSTRATE_LAYER2_SIGNING_KEY` and (recommendation) `SUBSTRATE_LAYER2_SIGNING_ENABLED`.
5. Founder has read or skimmed the adopted ADR end-to-end. The CCP responses inside the ADR are the inherited starting point; the founder is in a position to confirm or update them.

---

## Part A — Open under the protocol

Read in order (Critical-tier session — read everything below in full, do not skim):

1. `/adopted/standing-protocol-cache.md` (~3 min — confirms tier, model selection, signals, Critical-risk template form)
2. `/adopted/build-sessions-protocol-cache.md` (~3 min — substrate architecture; "no current users" governing note; build-arc-specific session-open checklist)
3. `/operations/handoffs/founder/2026-05-10-stage-1-a3-adr-adopted-close.md` (~7 min — predecessor close; Next-Session-Should block; PR5 + T-series carry-forward; Orchestration Reminder)
4. **`/adopted/ADR-layer2-signing-infrastructure.md` end-to-end** (~15 min — the deliverable-of-the-day; this is the architectural commitment the scaffolding session implements; pay special attention to Decisions 1–4, the Critical Change Protocol responses pre-drafted inside, and the Open Questions parked for downstream ADRs)
5. `/adopted/substrate-plugin-staging-plan.md` §"Stage 1 — Backend foundations" — the A3 row + A4 successor row + Stage 1 success criteria + dependencies
6. `/adopted/ADR-stoic-agent-substrate-concept.md` §"The three layers" + §"The moat boundary" + §"Risks accepted" — the architectural anchor for what signing protects
7. `/adopted/ADR-ENCRYPTION-WIRING-01.md` §Decision 4 (key custody) + §Decision 5 (rollback path) — the operational-discipline precedent the A3 scaffolding mirrors for signing-key custody and rollback
8. Last 2 decision-log entries (`D-A3-LAYER2-SIGNING-ADR-ADOPTED-2026-05-10` + `D-A2-INPUT-VALIDATION-SURFACE-2026-05-10`)
9. **The wiring sites the scaffolding will touch:**
   - `/website/src/app/api/reason/route.ts` end-to-end — the Critical surface; A1 plugin-auth at lines ~317–333; A2 doc-comment at ~285+; the validation branch in the POST handler; the Layer 3 response composition where signing wires in
   - `/website/src/lib/translation-sandwich/parallel-run.ts` lines 380–530 — `runSandwichInner` (where Layer 2 produces `Layer2Assessment` at line ~477; where the composed sandwich output is constructed at lines 511–522; where signing inserts between)
   - `/website/src/lib/translation-sandwich/layer2-mechanisms.ts` lines 1–365 — the full `Layer2Assessment` type tree (every nested interface that canonical-JSON serialisation must handle deterministically)
10. **Cryptographic precedents in the codebase** (these are the implementation-discipline references):
    - `/website/src/lib/translation-sandwich/tier1-token.ts` end-to-end — the codebase's existing HMAC-signed payload pattern (module-load discipline, secret-read-at-call-time, constant-time comparison via `timingSafeEqual`, fail-closed posture)
    - `/website/src/app/api/reason/route.ts` lines 215–278 (`checkPluginAuth`) — the codebase's constant-time comparison precedent
    - `/website/src/lib/server-encryption.ts` end-to-end (referenced inside ADR-ENCRYPTION-WIRING-01) — env-var-read-at-call-time pattern; rotation-ready `version` field; throws on missing/malformed key

Confirm at session open: tier (`code-critical`); risk class (Critical under 0d-ii; PR6 + AC7 engage); hold-point status (P0 0h still active); model selection (cite cache row — N/A this session for the substrate-side work; no LLM call); status vocabulary (this session moves A3 from Designed → Scaffolded → Wired → Verified); Critical Change Protocol form (full templates).

---

## Part B — Procedure

### Step 1 — Founder elects three session-opening choices (~15 min)

Three named choices the AI surfaces with trade-offs at session-open. The recommendations come from the ADR's Open Questions block.

**Choice 1 — Wire-format migration strategy (ADR Open Question 3).**
- **(a) Feature-flag-gated rollout** (`SUBSTRATE_LAYER2_SIGNING_ENABLED` env var; default false; flip true after the PR1 single-endpoint proof passes) — Recommendation. Allows safe rollback (rollback Path A is "flip the flag false"). Wire-format change becomes opt-in.
- **(b) Versioned response shape** (existing `assessment` field stays as bare `Layer2Assessment`; new `assessment_v2` field carries `{assessment, signature, key_id}`) — backwards-compatible with no rollback flag needed; wire format proliferates with version suffixes.
- **(c) Hard cutover** (no flag; the bare `assessment` field becomes `{assessment, signature, key_id}` everywhere on deploy) — simplest wire format; rollback is `git revert`.

**Choice 2 — Canonical-JSON implementation (ADR Open Question 4).**
- **(a) In-house implementation** — Recommendation. Small, controlled, bound to `Layer2Assessment` shape. Sorts keys lexicographically; rejects `NaN`/`Infinity`; consistent number formatting. No third-party dependency.
- **(b) Library** (`json-canon` or RFC 8785 implementation). Standard implementation; transfers maintenance burden. Dependency added.

**Choice 3 — `/api/public-key` authentication posture (ADR Open Question 1).**
- **(a) Public read with no auth, edge-cached aggressively** — Recommendation. The public key is by definition public; rate-limit at the Vercel edge. Lowest operational complexity.
- **(b) Public read with no auth, no cache** — straightforward but every request hits the origin.
- **(c) Rate-limited unauthenticated** — adds rate-limiting infrastructure; defensible if abuse becomes a concern.

The session does not proceed past Step 1 without the founder electing. AI surfaces trade-offs; founder elects.

### Step 2 — Critical Change Protocol responses confirmed (~10 min)

The ADR pre-drafted CCP responses ahead of time (per PR6 + AC7). The AI walks through each section in the conversation:

1. **What is changing** (plain language; founder's perspective) — confirm the ADR draft applies as-written, or update if the founder's elections in Step 1 changed the surface.
2. **What could break** — confirm the four named failure modes from the ADR (wire-format change, signing-failure-must-fail-closed, canonicalisation bug, env-var loss); add any session-opening considerations the AI surfaces.
3. **What happens to existing sessions** — "N/A — only founder + test logins exist" per the build-arc cache governing note; confirm still in force.
4. **Rollback plan** — confirm Paths A/B/C from the ADR; if Choice 1(a) feature-flag-gated rollout was elected in Step 1, Path A is "flip `SUBSTRATE_LAYER2_SIGNING_ENABLED=false`"; if Choice 1(b) or 1(c), Path A becomes a different surface.
5. **Verification step** (founder-performable, post-deploy) — drafted in detail at Step 8 below; confirm at this point that the verification approach is acceptable.
6. **Explicit approval required** — confirm the founder will type "OK" or "go ahead" specific to the named risks before deploy (Step 9).

### Step 3 — Generate the Ed25519 signing key (~5 min)

The AI runs the key-generation command in the AI's sandboxed shell (NOT in the founder's terminal — the AI does not need to see the founder's secrets):

```bash
node -e "
const { generateKeyPairSync } = require('node:crypto');
const { privateKey, publicKey } = generateKeyPairSync('ed25519');
console.log('--- PRIVATE KEY (copy ALL of this including BEGIN/END lines) ---');
console.log(privateKey.export({ type: 'pkcs8', format: 'pem' }));
console.log('--- PUBLIC KEY (copy ALL of this including BEGIN/END lines) ---');
console.log(publicKey.export({ type: 'spki', format: 'pem' }));
console.log('--- KEY_ID (suggested) ---');
console.log('substrate-layer2-2026Q2');
"
```

Output: a PEM-encoded Ed25519 private key, a PEM-encoded public key, and a suggested `key_id` (year + quarter encoded for human-readability per ADR Decision 4).

The AI surfaces the output in the chat. The founder copies it. The AI does not retain the key value past this session step.

### Step 4 — Founder backup ceremony (~10 min — founder works in their own environment)

Mirrors `/adopted/ADR-ENCRYPTION-WIRING-01.md` Decision 4 Option 4A. The founder executes:

1. **Password manager:** create a new entry tagged `SUBSTRATE_LAYER2_SIGNING_KEY`. Paste the full PEM private key (including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----` lines). Save the entry. Read-aloud-verify the first line and last line match the source.

2. **Paper backup:** print the PEM private key on paper, formatted in legible 4-character groups if hand-copying (use a printer if available; the PEM block is short enough to fit on one page). Store the paper in a physical secure location (safe / safety deposit box). Read-aloud-verify against the source.

3. **Vercel env var:** Click **Project → Settings → Environment Variables → Add New**. Set Name to `SUBSTRATE_LAYER2_SIGNING_KEY`. Set Value to the full PEM private key (Vercel accepts multi-line values; paste exactly as copied — the BEGIN/END lines and all line breaks must be preserved). Set environments to Production + Preview + Development (check all three). Click **Save**.

4. **(If Choice 1(a) elected in Step 1)** Add a second env var `SUBSTRATE_LAYER2_SIGNING_ENABLED` set to `false` (string). All three environments. Save.

5. **(For verifier-side)** The public key is published from the substrate, so it does not need backing up by the founder — but for cold-start recovery, store the public key in a `SUBSTRATE_LAYER2_PUBLIC_KEY` env var alongside the private key. Set value to the full PEM public key. All three environments. Save.

6. **Calendar reminder:** Add a Google Calendar reminder titled "Verify SUBSTRATE_LAYER2_SIGNING_KEY backups match" recurring on the first day of every month.

7. **Read-aloud verification:** founder reads the password-manager entry's first and last line aloud; AI confirms they match the source key shown in Step 3. (This is the only place the AI sees any portion of the key after Step 3 — and only the BEGIN/END marker lines, which are fixed text.)

The session does not proceed past Step 4 until the founder confirms all six sub-steps complete.

### Step 5 — Implement canonical-JSON helper for `Layer2Assessment` (~30 min — code-critical)

Per Choice 2 from Step 1.

**If 2(a) in-house (Recommendation):**

Create `/website/src/lib/translation-sandwich/layer2-canonical-json.ts`:
- Single export: `canonicaliseLayer2Assessment(assessment: Layer2Assessment): string`
- Implementation: deterministic JSON serialisation with object keys sorted lexicographically at every nesting level; arrays preserve order; numbers serialised via `Number.prototype.toString()` (deterministic for finite numbers); rejects `NaN` / `Infinity` / `-0` / non-finite values with a typed `Layer2CanonicalisationError` throw; rejects `undefined` properties (the assessment shape should not contain them; throw if seen).
- Unit tests in `__tests__/layer2-canonical-json.test.ts` covering: (i) empty fields produce stable canonical output; (ii) reordering input object keys produces identical canonical output; (iii) nested arrays preserve order; (iv) `NaN` throws; (v) `undefined` property throws; (vi) round-trip stability (canonicalise the canonical form again — must equal itself).
- Include at the module level: `// Compliance: AC8 (translation-sandwich substrate); KG1 (no DB writes); PR6 (safety-critical-adjacent — signing depends on this); PR3 (synchronous; no async)`.

**If 2(b) library:** install the chosen library; wrap with the same `canonicaliseLayer2Assessment` signature; same test coverage.

### Step 6 — Implement `signLayer2Assessment` helper (~25 min — code-critical)

Create `/website/src/lib/translation-sandwich/layer2-signer.ts`:
- Imports `canonicaliseLayer2Assessment` from Step 5.
- Imports `crypto` from `node:crypto`.
- Reads `SUBSTRATE_LAYER2_SIGNING_KEY` (PEM private) and a `SUBSTRATE_LAYER2_KEY_ID` (string identifier; defaults to `substrate-layer2-default` if unset, but production should always have it set explicitly) **at call time, not module load** (mirror the `tier1-token.ts` discipline; throws a typed `SubstrateSigningKeyMissingError` if unset or malformed).
- Single export: `signLayer2Assessment(assessment: Layer2Assessment): { assessment: Layer2Assessment, signature: string, key_id: string }`.
- Implementation: (a) canonicalise; (b) `crypto.sign(null, Buffer.from(canonical, 'utf8'), privateKey)` → signature bytes; (c) base64-encode signature (standard base64 unless URL-safety reason emerges this session — ADR doesn't bind this); (d) return `{ assessment, signature: signatureBase64, key_id }`.
- Unit tests in `__tests__/layer2-signer.test.ts` covering: (i) signing produces a 64-byte (88-base64-char) signature; (ii) signing the same assessment twice produces identical signatures (Ed25519 is deterministic); (iii) `crypto.verify` against the matching public key succeeds; (iv) `crypto.verify` against a different public key fails; (v) signing without env var throws `SubstrateSigningKeyMissingError`; (vi) tampered assessment after signing fails verification.
- Compliance comment: `// AC1: N/A — no LLM call. AC4: this module is imported by parallel-run.ts ONLY; called AFTER Layer 2 produces Layer2Assessment, BEFORE composed-output construction. AC5: R20a perimeter unaffected. AC6: N/A — no RAG context. AC7: NOT engaged at the function level; the import-site engages AC7-adjacent caution because route.ts is the auth surface. AC8: lives under /website/src/lib/translation-sandwich/. KG1: no DB writes. PR3: synchronous. PR4: N/A. PR6: this is the safety-critical surface; changes require Critical Change Protocol.`

### Step 7 — Wire signing into `runSandwichInner` (~25 min — code-critical)

In `/website/src/lib/translation-sandwich/parallel-run.ts`:

- Import `signLayer2Assessment` from Step 6.
- **Read `SUBSTRATE_LAYER2_SIGNING_ENABLED` once at module load** (mirror the existing `PARALLEL_RUN_ENABLED` pattern at line 78). Default false.
- After Layer 2 produces `layer2Assessment` (line 477) and BEFORE the composed-output construction (lines 511–522), branch:
  - If signing enabled: call `signLayer2Assessment(layer2Assessment)` → `signedAssessment`; set the composed-output `assessment` field to `signedAssessment` (the wrapped object).
  - If signing disabled: leave the composed-output `assessment` field as the bare `layer2Assessment` (existing behaviour; zero regression).
- Fail-closed posture: if `signLayer2Assessment` throws, the response is **never** an unsigned assessment when signing is enabled. Return a 503-equivalent error response (the route already handles thrown errors; the orchestrator surfaces the throw and the route translates it). Confirm with the founder at session-open whether 503 is the right error code or whether a more specific error category is preferred.
- Update the `SandwichRunResult.output` type to allow either bare or wrapped `assessment` field (TypeScript discriminated union).
- Add doc-comment block at the top of the wiring branch citing the ADR.

### Step 8 — Add `/api/public-key` endpoint (~20 min — code-critical)

Create `/website/src/app/api/public-key/route.ts`:
- Per Choice 3 from Step 1.
- Reads `SUBSTRATE_LAYER2_PUBLIC_KEY` and `SUBSTRATE_LAYER2_KEY_ID` env vars at call time.
- Returns: `{ "key_id": "<string>", "algorithm": "Ed25519", "public_key_pem": "<PEM string>", "issued_at": "<ISO 8601>", "rotation_overlap_until": null, "previous": null }` per ADR Decision 3 spec. The `issued_at` field is read from a `SUBSTRATE_LAYER2_KEY_ISSUED_AT` env var (founder sets this in the same Vercel ceremony as the key itself, with the current ISO timestamp); if unset, fall back to the deploy time (acceptable for first deploy).
- HTTP method: GET only. POST returns 405.
- CORS: `Access-Control-Allow-Origin: *` (the public key is public).
- Cache headers per Choice 3 election.
- Compliance comment at module top citing the ADR.

### Step 9 — Round-trip + perturbation tests (~15 min — code-critical)

Run the full test suite locally and confirm all new tests pass:

```bash
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/website"
npx tsc --noEmit -p tsconfig.json   # type-check
npm test -- layer2-canonical-json layer2-signer  # new unit tests
```

Both commands must return exit code 0. If anything fails, the AI fixes before Step 10.

Additional perturbation test: in `__tests__/layer2-signer.test.ts`, include a test that signs an assessment, mutates one byte of the canonical JSON, and confirms `crypto.verify` returns false. Confirms the canonical-JSON discipline catches tampering as expected.

### Step 10 — Critical Change Protocol — explicit founder approval (~5 min)

The AI surfaces the full CCP responses (confirmed at Step 2 + the implementation specifics from Steps 5–9) one more time in a single message. The AI explicitly asks: "Founder, do you approve deploying this change to production? The named risks are [recap from Step 2]. Reply with 'OK' or 'go ahead' specifically acknowledging these risks, or name a specific concern to revisit before deploy."

The AI does not proceed past Step 10 without an explicit approval that names the risks (not a general "yes proceed").

### Step 11 — Deploy via session-close commit (founder's own terminal)

The AI surfaces the exact commands. The founder executes in their own terminal:

```bash
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"

# Confirm new files exist
ls website/src/lib/translation-sandwich/layer2-canonical-json.ts
ls website/src/lib/translation-sandwich/layer2-signer.ts
ls website/src/app/api/public-key/route.ts

# Stage + commit (one wiring commit)
git add \
  website/src/lib/translation-sandwich/layer2-canonical-json.ts \
  website/src/lib/translation-sandwich/layer2-signer.ts \
  website/src/lib/translation-sandwich/parallel-run.ts \
  website/src/app/api/reason/route.ts \
  website/src/app/api/public-key/route.ts \
  website/src/lib/translation-sandwich/__tests__/layer2-canonical-json.test.ts \
  website/src/lib/translation-sandwich/__tests__/layer2-signer.test.ts

git commit -m "Stage 1 A3 wired: Layer 2 signing infrastructure on /api/reason

[the AI fills in the full commit message at session time, citing the ADR
and the Critical Change Protocol responses confirmed above]"
```

Then push via GitHub Desktop. Vercel redeploys; the new code goes live with `SUBSTRATE_LAYER2_SIGNING_ENABLED=false` (per Step 4 sub-step 4) so signing is dormant on first deploy.

### Step 12 — PR1 single-endpoint proof on `/api/reason` (~20 min — Critical-tier verification)

The AI walks the founder through the three production verification scenarios per the T-AT-LEAST-NEW-1 pattern:

**Scenario 1 — Signing disabled (existing behaviour, zero regression).**
- Confirm `SUBSTRATE_LAYER2_SIGNING_ENABLED=false` in Vercel.
- Run a canonical curl against `/api/reason` (the AI provides exact text per the predecessor close's optional-verification pattern).
- Expected: response shape unchanged from A2 close — `{"version":"translation-sandwich-v1","extraction":...,"assessment":{<bare Layer2Assessment>}, "prose":...}`. The `assessment` field is the bare Layer2Assessment, not wrapped.

**Scenario 2 — Signing enabled, valid request.**
- The founder flips `SUBSTRATE_LAYER2_SIGNING_ENABLED=true` in Vercel. Vercel redeploys.
- Run the same canonical curl.
- Expected: response shape now has wrapped assessment — `{"version":"translation-sandwich-v1","extraction":...,"assessment":{"assessment":{<bare Layer2Assessment>},"signature":"<88-char base64>","key_id":"<string>"}, "prose":...}`.
- AI walks the founder through verifying the signature against `/api/public-key`:
  ```bash
  # Fetch the public key
  curl https://www.sagereasoning.com/api/public-key
  # Expected: {"key_id":"...","algorithm":"Ed25519","public_key_pem":"-----BEGIN PUBLIC KEY-----\n...","issued_at":"...","rotation_overlap_until":null,"previous":null}
  ```
- AI provides a small Node.js verification script the founder runs locally to confirm the signature verifies:
  ```bash
  node -e "
  const { verify } = require('node:crypto');
  // [AI fills in the canonical-JSON re-derivation + verify call at session time]
  console.log('Verification:', verify(null, canonicalBuffer, publicKey, signatureBuffer) ? 'OK' : 'FAILED');
  "
  ```
- Expected output: `Verification: OK`.

**Scenario 3 — Signing enabled, tampered response.**
- Take the response from Scenario 2.
- Mutate one byte of the assessment (e.g., flip a single character in `ruling_faculty_state`).
- Re-run the verification script.
- Expected output: `Verification: FAILED`.

If all three scenarios pass: A3 reaches **Verified** on `/api/reason`. PR1 single-endpoint proof complete.

If any scenario fails: rollback Path A (flip `SUBSTRATE_LAYER2_SIGNING_ENABLED=false`) and report at session close; A3 remains at Wired status pending fix in a follow-up session.

### Step 13 — Append decision-log entry (full form per Critical session, ~30 min)

Pattern: the full decision-log template per the existing protocol (NOT the lean form — Critical sessions use full templates per the standing cache). Entry ID: `D-A3-LAYER2-SIGNING-WIRED-VERIFIED-2026-MM-DD` if all three scenarios pass; `D-A3-LAYER2-SIGNING-WIRED-2026-MM-DD` if Verified status is not reached this session. Records: Step 1 elections; CCP responses verbatim; the four files touched (canonical-JSON helper, signer, parallel-run wiring, public-key endpoint); risk classification (Critical); rollback path; verification step; PR5 carry-forward; T-series tacit-knowledge findings; F-series stewardship findings; full Rules-served list.

### Step 14 — Session close (full form per Critical session, ~25 min)

Pattern: the full session-close template per the existing protocol (NOT the lean form). Includes the additional sections required for Critical sessions per the predecessor encryption-wiring close: Verification Method Used, Risk Classification Record, PR5 Knowledge-Gap Carry-Forward, Founder Verification (Between Sessions), Orchestration Reminder. Save to `/operations/handoffs/founder/2026-MM-DD-stage-1-a3-wired-verified-close.md`.

Next-Session-Should block: **A4 — Key management** (Critical risk; operationalises the rotation procedure drafted in the A3 ADR; first scheduled rotation calendar date determined at A4 session).

---

## Part C — Anticipated session shape

| Phase | Estimate |
|---|---|
| Cache + predecessor close + ADR end-to-end + code-path reads | 35-45 min |
| Step 1 — three session-opening elections | 15 min |
| Step 2 — CCP responses confirmed | 10 min |
| Step 3 — generate Ed25519 key | 5 min |
| Step 4 — founder backup ceremony | 10 min |
| Step 5 — canonical-JSON helper + tests | 30 min |
| Step 6 — signLayer2Assessment helper + tests | 25 min |
| Step 7 — wire into runSandwichInner | 25 min |
| Step 8 — /api/public-key endpoint | 20 min |
| Step 9 — type-check + run unit tests | 15 min |
| Step 10 — explicit founder approval | 5 min |
| Step 11 — deploy via session-close commit | 5 min |
| Step 12 — three-scenario PR1 verification | 20 min |
| Step 13 — decision-log entry (full form) | 30 min |
| Step 14 — session close (full form) | 25 min |
| **Total** | **~4-5 hours** |

This is a longer session than the A1, A2, or A3-ADR-drafting sessions because it crosses the threshold from "design committed" to "Verified on production." If the session reaches the 4.5-hour mark without Verified status, close at the most stable point per the founder's "I'm done for now" signal.

**Documented stable points if early closure is needed:**

- **After Step 4, before Step 5:** key generated + backed up; no code change yet. Decision-log entry can capture the key-provisioning step; resume with Step 5 next session. Status: A3 still Designed; key custody discipline operational.
- **After Step 6, before Step 7:** helpers exist but are not wired. Status: A3 partial Scaffolded (helpers exist; wiring pending). Decision-log entry captures the helpers; resume with Step 7 next session.
- **After Step 9, before Step 10:** all code present, type-checks, unit tests pass; nothing deployed. Status: A3 Scaffolded. Decision-log entry captures the scaffolding; resume with deploy + verification next session.
- **After Step 11, before Step 12:** deployed with signing disabled. Status: A3 Wired (code on production but flag false; existing behaviour preserved). Decision-log entry captures the wiring; resume with three-scenario verification next session.
- **After Step 12 (any failure):** rollback Path A engaged. Status: A3 Wired but not Verified; the failed scenario is the open question for the next session.

---

## Rollback path

Three paths in order of preference (mirroring the ADR's Critical Change Protocol responses):

- **Path A (preferred — within minutes of deploy):** if Choice 1(a) elected at Step 1, flip `SUBSTRATE_LAYER2_SIGNING_ENABLED=false` in Vercel; Vercel redeploys in ~30 seconds; the substrate returns the bare `Layer2Assessment` shape exactly as today. No data loss, no code change to revert. If Choice 1(b) or 1(c), Path A becomes a different surface (versioned shape: consumers explicitly read `assessment` rather than `assessment_v2`; hard cutover: Path B is the only rollback).
- **Path B (revert the deploy):** `git revert <a3-wiring-commit-hash>` and push via GitHub Desktop. Vercel redeploys prior code. Recovery ≤5 min.
- **Path C (env var loss):** restore `SUBSTRATE_LAYER2_SIGNING_KEY` from the founder's three-copy backup (Step 4) into Vercel env vars. Application reads on next deploy. Already-issued signatures remain verifiable.

If all three rollback paths are exhausted and the application is broken: declare incident; engage the encryption-wiring incident-response pattern from `ADR-ENCRYPTION-WIRING-01`; report at session close.

---

## Forecast

**Most-likely path:** founder elects the three recommended Step 1 options (1(a) feature-flag-gated rollout; 2(a) in-house canonical-JSON; 3(a) public read with edge cache). Steps 2–4 complete cleanly. Steps 5–9 produce ~250 lines of new code across four files plus two test files; type-check + unit tests pass on first run. Step 10 founder approval is given specifically against the four named risks. Step 11 deploys cleanly with signing disabled. Step 12 three-scenario verification passes on first run. A3 reaches **Verified** on `/api/reason`. Decision-log entry + session close at ~4-5 hours. Next session: A4 — Key management.

**Possible variations:**

- **Step 1 elections diverge from recommendations.** If Choice 1(b) or 1(c) elected (versioned shape or hard cutover), Step 7 wiring shape changes; rollback Path A becomes different; verification scenarios adjust. Adds ~15-20 min to Step 7.
- **Step 9 type-check or unit tests fail.** AI fixes; if the failure is in the canonical-JSON helper (most likely place for a deterministic-serialisation bug), expect 20-40 min iteration; if the failure is in the signer (unlikely; `node:crypto` is well-understood), expect 10-15 min.
- **Step 12 Scenario 2 verification fails.** Most likely cause: canonical-JSON discipline divergence between server (the helper) and verifier (the script the AI provides for the founder to run). Diagnosis: capture the canonical bytes from both sides; diff. Fix: align the serialisation (likely a key-ordering or whitespace issue in the verifier-side script). Time: 20-40 min if diagnosable; 1-2 hours if a deeper helper bug emerges. Path A rollback engaged in the meantime.
- **Step 12 Scenario 3 perturbation test passes (i.e., tampered response verifies as OK).** Catastrophic — would mean signature is not actually checking what it should. Diagnosis: confirm the verifier-side script is canonicalising the assessment correctly before verifying; confirm the signature is over the canonical bytes, not the pre-canonical bytes. Path A rollback engaged immediately. This failure mode is unlikely with correct implementation; flagged here because it's the failure mode the perturbation test exists to catch.
- **Founder elects to defer the deploy.** Steps 1–9 complete (code present, tested locally); Steps 10–14 deferred to a follow-up session with an explicit "I'm done for now" signal at Step 9 close. Status: A3 Scaffolded; resume with Step 10+ next session.

**What success looks like at session close:**

- A3 implementation status: Designed → Scaffolded → Wired → **Verified** (all four transitions in one session, by way of the three-scenario PR1 proof on `/api/reason`).
- Four new code files on origin/main; two test files on origin/main.
- Two (or three, if `SUBSTRATE_LAYER2_PUBLIC_KEY` separately stored) new Vercel env vars provisioned: `SUBSTRATE_LAYER2_SIGNING_KEY`, `SUBSTRATE_LAYER2_SIGNING_ENABLED` (set to `true` after Scenario 2 passes), `SUBSTRATE_LAYER2_KEY_ID`, `SUBSTRATE_LAYER2_KEY_ISSUED_AT`, `SUBSTRATE_LAYER2_PUBLIC_KEY`.
- Founder has signing-key backups in three locations (password manager + paper + Vercel) per Step 4.
- Calendar reminder set for monthly verification of backups.
- Decision-log entry full form recording the four design choices realised, the CCP responses verbatim, the verification scenarios, the rules served.
- Session close full form with Founder Verification, Risk Classification Record, PR5 carry-forward, T-series + F-series findings, Orchestration Reminder.
- Next session named: **A4 — Key management** (Critical risk; first scheduled rotation date set; rotation procedure operationalised; Critical Change Protocol applies).

End of prompt.
