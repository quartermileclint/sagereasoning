# Next-Session Prompt — Stage 1 A4: Key Management (Critical risk)

**Stream:** founder.
**Tier:** code-critical. Full templates per the standing cache (Critical templates, not Lean).
**Governing frame:** /adopted/standing-protocol-cache.md + /adopted/build-sessions-protocol-cache.md.
**Predecessor session close:** /operations/handoffs/founder/2026-05-10-stage-1-a3-wired-verified-close.md
**Predecessor decision-log entries:** D-A3-LAYER2-SIGNING-WIRED-VERIFIED-2026-05-10, D-A3-LAYER2-SIGNING-ADR-ADOPTED-2026-05-10, D-A2-INPUT-VALIDATION-SURFACE-2026-05-10, D-A1-FLAG-FLIP-VERIFIED-2026-05-10
**Risk classification:** **Critical** under 0d-ii (cryptographic key management; PR6 + AC7 engage; co-resides with the signing surface that A3 made authoritative; `/api/public-key` modifications are verifier-facing). **Critical Change Protocol applies in full.** Per T-A3-NEW-1 (Critical Change Protocol pre-drafted in ADR; second observation), the AI drafts CCP responses ahead of time inside the A4 ADR section so the eventual scaffolding work inherits them rather than starting from scratch.

---

## Founder governing note (still in force for the duration of the build arc)

Per `/adopted/build-sessions-protocol-cache.md` §"Founder governing notes for the duration of the build arc": **No current users (affirmed 2026-05-10).** The only logins are the founder's and known test logins. The Critical Change Protocol's step 3 ("What happens to existing sessions?") may be answered "N/A — only founder + test logins exist; no third-party sessions to invalidate." All other Critical Change Protocol steps remain in full force. When the plugin ships and external users exist, this simplification ends.

---

## Why this session matters

A3 (Verified 2026-05-10) made every Layer 2 assessment authoritative — every response carries an Ed25519 signature; verifiers check against `/api/public-key`. A3 ADR §Decision 4 committed the rotation contract: single key with quarterly rotation and a 30-day overlap window. **A4 operationalises that contract.** Without A4, the rotation contract exists only on paper — the substrate has no env-var slots for a previous key, the `/api/public-key` endpoint always returns `previous: null`, and the rotation procedure has never been rehearsed. Each of those is a latent risk: a compromise event without an exercised rotation procedure is the failure mode `ADR-ENCRYPTION-WIRING-01` Decision 4 calls "the worst-case 'protection that has failed as a protection.'"

A4's deliverables:
- **Operationalise the 9-step rotation procedure** drafted in A3 ADR §Decision 4 — turn it into a founder-performable runbook with exact env-var-update steps and exact verification commands.
- **Extend `/api/public-key`** to support the overlap window: when a rotation is in progress, `previous` returns the prior key + `rotation_overlap_until` returns the retirement timestamp.
- **Add env-var slots** for the previous key during the 30-day overlap (`SUBSTRATE_LAYER2_PREVIOUS_PUBLIC_KEY`, `SUBSTRATE_LAYER2_PREVIOUS_KEY_ID`, `SUBSTRATE_LAYER2_PREVIOUS_KEY_RETIRES_AT`).
- **Set the first scheduled rotation date** (during 2026Q3 per the quarterly cadence; founder elects from a recommended window).
- **Optionally rehearse the rotation** as a dry-run on a test key before the first scheduled live rotation, depending on which dry-run posture the founder elects.
- **Document the off-cycle (compromise-suspected) rotation variant** as an incident-response runbook.

After A4 reaches Verified, the build arc proceeds to **A5 — Layer 3 server-side service** (Critical risk per AC5; the R20a deterministic injection sits inside Layer 3).

---

## Pre-conditions

1. The session-close commit from the predecessor session is on origin/main (run `git log --oneline -3 origin/main` and confirm both the A3 wiring commit and the A3-Verified session-close commit are present).
2. Production is in a known-good state: `SUBSTRATE_LAYER2_SIGNING_ENABLED='true'`, substrate is signing every assessment, `/api/public-key` returns the verification key with `key_id='substrate-layer2-2026Q2'`. The optional verification curls inside the predecessor close confirm this; if the founder did not run them, the session-open will run them as a 30-second governance check.
3. Founder's three-copy backup of `SUBSTRATE_LAYER2_SIGNING_KEY` is intact (password manager + paper + Vercel env var). The first monthly verification (per the calendar reminder created at A3) is due 2026-06-01; if A4 runs before that, the verification has not yet been exercised — the founder should rehearse it during this session as part of the rotation runbook walkthrough.
4. Founder is ready to participate in any rotation-rehearsal step the elected dry-run posture requires. The rehearsal generates a NEW Ed25519 keypair (separate from the production key) and exercises the rotation flow against it; no production data is at risk during the rehearsal. The rehearsal may consume 20-40 minutes of session time depending on which posture is elected.
5. Founder has skimmed the predecessor close end-to-end. The Open Questions block + Next-Session-Should block + the A3 ADR §Decision 4 (which A4 operationalises) are the inherited starting points.

---

## Part A — Open under the protocol

Read in order (Critical-tier session — read everything below in full, do not skim):

1. `/adopted/standing-protocol-cache.md` (~3 min — confirms tier, model selection, signals, Critical-risk template form)
2. `/adopted/build-sessions-protocol-cache.md` (~3 min — substrate architecture; "no current users" governing note; build-arc-specific session-open checklist)
3. `/operations/handoffs/founder/2026-05-10-stage-1-a3-wired-verified-close.md` (~10 min — predecessor close; Next-Session-Should block; PR5 + T-series + F-series carry-forward; Orchestration Reminder)
4. **`/adopted/ADR-layer2-signing-infrastructure.md` end-to-end** (~15 min — particularly §Decision 4 (rotation contract) and the §Open Questions parked for downstream ADRs items #5 (first-rotation timing — A4 resolves) and #6 (plugin-manifest `signing_keys` block schema details — partially A4, partially Stage 3 C1))
5. `/adopted/ADR-ENCRYPTION-WIRING-01.md` §Decision 4 + §Decision 5 (~5 min — the encryption-key-custody discipline whose pattern A4 mirrors for signing-key rotation)
6. `/adopted/substrate-plugin-staging-plan.md` §"Stage 1 — Backend foundations" — the A4 row + Stage 1 success criteria + dependencies
7. Last 2 decision-log entries (`D-A3-LAYER2-SIGNING-WIRED-VERIFIED-2026-05-10` + `D-A3-LAYER2-SIGNING-ADR-ADOPTED-2026-05-10`)
8. **The wiring sites the scaffolding will touch:**
   - `/website/src/app/api/public-key/route.ts` end-to-end — the verifier-facing endpoint A4 extends to support the overlap window
   - `/website/src/lib/translation-sandwich/layer2-signer.ts` end-to-end — the signing module that may need a `previous_signing_key` env-var slot if the founder elects to support overlap-window verification (see Step 1 Choice 2)
9. **Cryptographic + env-var precedents:**
    - `/website/src/lib/server-encryption.ts` end-to-end — the rotation-ready `version` field pattern
    - `/website/src/lib/translation-sandwich/tier1-token.ts` end-to-end — env-var-read-at-call-time discipline; secret-rotation-readiness
    - `/website/src/app/api/reason/route.ts` lines 215–278 (`checkPluginAuth`) — constant-time-comparison precedent (relevant if A4 adds key-id-based selection logic)

Confirm at session open: tier (`code-critical`); risk class (Critical under 0d-ii; PR6 + AC7 engage); hold-point status (P0 0h still active); model selection (cite cache row — N/A this session for the substrate-side work; no LLM call); status vocabulary (this session moves A4 from Scoped → Designed → Scaffolded → Wired → Verified, ideally in one session — follow the A3 precedent); Critical Change Protocol form (full templates).

---

## Part B — Procedure

### Step 1 — Founder elects four session-opening choices (~20 min)

Four named choices the AI surfaces with trade-offs at session-open. Recommendations come from the predecessor close's A4 scope block plus operational discipline considerations.

**Choice 1 — Dry-run posture (predecessor close A4 scope item).**
- **(a) Rehearse the rotation procedure now on a test key, before the first scheduled live rotation** (Recommendation). Generate a fresh Ed25519 keypair in the AI sandbox; walk through the full 9-step rotation procedure against it; confirm `/api/public-key` returns the new shape during overlap; retire the test key. Adds ~30 min to the session but exercises the procedure once before a live rotation matters. Reduces the chance that the first scheduled rotation surfaces an unexercised gap in the runbook.
- **(b) Treat the first scheduled rotation as the dry-run.** Defer rehearsal until 2026Q3. Saves session time now; trades it for the risk that the first live rotation surfaces a procedural gap.
- **(c) No dry-run; document the procedure and trust the runbook.** Saves session time; highest risk profile.

**Choice 2 — Previous-key env-var schema during the 30-day overlap window (predecessor close A4 scope item).**
- **(a) Two new env vars for the previous key only** (`SUBSTRATE_LAYER2_PREVIOUS_PUBLIC_KEY` + `SUBSTRATE_LAYER2_PREVIOUS_KEY_ID` + `SUBSTRATE_LAYER2_PREVIOUS_KEY_RETIRES_AT`). The substrate signs only with the current key; verifiers accept signatures from either key during the overlap by checking `key_id` against `/api/public-key`'s `previous` slot. Recommendation. Mirrors the symmetry of how the encryption-key `version` field works in `server-encryption.ts`.
- **(b) Three new env vars including a previous-private-key slot** (`SUBSTRATE_LAYER2_PREVIOUS_SIGNING_KEY` + the two above). The substrate could sign with either key during overlap. Adds operational complexity (two private keys live simultaneously); not architecturally needed because the substrate's signing role is single-current-key per A3 ADR §Decision 4. Rejected unless the founder identifies a specific reason.
- **(c) No previous-key slot; rotation is a hard cutover.** Verifiers refreshing during the 30-day window after rotation would silently fail until they refresh `/api/public-key`. Violates the A3 ADR §Decision 4 commitment to a 30-day overlap window. Not recommended; would require an A3 ADR amendment.

**Choice 3 — Rotation runbook delivery format.**
- **(a) Markdown runbook** at `/operations/runbooks/substrate-layer2-key-rotation.md` (Recommendation). Founder-performable step-by-step; copy-paste-ready commands; exact Vercel menu paths; verification queries. Mirrors the existing operational-runbook style for cryptographic keys (the A3 ADR's CCP responses inherited this format). New `/operations/runbooks/` directory (created this session).
- **(b) Inside the A4 ADR.** Rotation runbook lives inside `/adopted/ADR-A4-key-management.md`. Cross-references stay consistent; ADR is one document. Cost: the runbook is operational, not architectural — co-locating it with architectural decisions risks the ADR becoming an operations manual.
- **(c) Both** (ADR carries the rotation contract + a `/operations/runbooks/` file carries the operational steps). Doubles the maintenance surface; risks drift between the two.

**Choice 4 — First scheduled rotation date.**
- **(a) Sunday 2026-09-06** (Recommendation — early September; quiet weekend; well within 2026Q3). 119 days after A3 wired = comfortable lead-time for verifier ecosystem to mature.
- **(b) Sunday 2026-08-02** (early August; mid-quarter). Tighter lead-time.
- **(c) Sunday 2026-09-27** (late September; close to quarter boundary). Maximum lead-time but pushes against the next quarterly rotation.
- **(d) Defer to A5 close.** First rotation date set when A5 (Layer 3 service) lands. Trades certainty for flexibility.

The session does not proceed past Step 1 without the founder electing all four. AI surfaces trade-offs; founder elects.

### Step 2 — A4 ADR drafted in-session (~30 min)

Following the A3 precedent (drafting first, then scaffolding), but compressed because A4's architectural decisions are smaller and most are inherited from A3 ADR §Decision 4. The AI drafts `/drafts/ADR-A4-key-management.md` in this session covering:

- The four Choice elections from Step 1 with reasoning + alternatives considered.
- The rotation runbook format (per Choice 3).
- The first scheduled rotation date (per Choice 4).
- The overlap window's env-var schema (per Choice 2).
- The off-cycle (compromise-suspected) rotation variant — incident-response runbook structure.
- Critical Change Protocol responses pre-drafted for the eventual A4 scaffolding (per T-A3-NEW-1 pattern; second observation).
- Cross-references to A3 ADR §Decision 4 (the architectural anchor — A4 ADR does not re-decide the rotation contract; it operationalises the existing decision).
- AC7 compatibility posture.
- Approval gate (Path A — adopt this session).

The ADR is shorter than A3 ADR (~150-250 lines vs A3's ~440) because the architectural decisions are mostly inherited. Founder reviews; if Path A elected, the ADR moves from `/drafts/` to `/adopted/ADR-A4-key-management.md` and the wired+verified work proceeds.

### Step 3 — Critical Change Protocol responses confirmed (~10 min)

Per the A4 ADR's pre-drafted CCP section. The AI walks through each of the six steps in conversation:

1. **What is changing** (plain language; founder's perspective).
2. **What could break** — failure modes specific to A4: rotation procedure failure mid-rotation; verifier failing to refresh during overlap; previous-key env-var loss; canonical-JSON drift between current and previous canonicalisation.
3. **What happens to existing sessions** — N/A per build-arc cache governing note.
4. **Rollback plan** — three paths: Path A (revert env-var changes; rotation hasn't consumed signing key yet so rollback cleaner than mid-rotation); Path B (git revert); Path C (env-var loss — restore from backup).
5. **Verification step** (founder-performable, post-deploy) — drafted in detail at Step 7 below.
6. **Explicit approval required** — the founder types "OK" or "go ahead" specific to the named risks before deploy.

### Step 4 — Implement the previous-key env-var slots + extend `/api/public-key` (~30 min — code-critical)

Per Choice 2 from Step 1.

**If 2(a) elected (Recommended):**

Modify `/website/src/app/api/public-key/route.ts`:
- Read three new optional env vars at call time: `SUBSTRATE_LAYER2_PREVIOUS_PUBLIC_KEY`, `SUBSTRATE_LAYER2_PREVIOUS_KEY_ID`, `SUBSTRATE_LAYER2_PREVIOUS_KEY_RETIRES_AT`.
- When all three are set: populate the `previous` field of the response with `{key_id, public_key_pem, issued_at, retires_at}` and `rotation_overlap_until` with the retires_at value.
- When any are unset: `previous: null` and `rotation_overlap_until: null` (existing behaviour).
- Add doc-comment block citing the A4 ADR.
- Add unit test (`__tests__/public-key-route.test.ts` — ready-for-Jest pattern matching A3's test files): three scenarios: no rotation in progress (existing); rotation in progress (all three previous-key env vars set); partial rotation state (some env vars set; treated as no-rotation per fail-safe posture).

**If 2(b) elected:** also add a `previous_signing_key` slot in `/website/src/lib/translation-sandwich/layer2-signer.ts` and a verifier-side helper that selects between current and previous keys by `key_id`. Adds ~20 min to Step 4.

**If 2(c) elected:** Step 4 is skipped; the rotation runbook just instructs the founder to swap env vars cleanly. (Not recommended; would require A3 ADR amendment per the violation noted in Choice 2(c).)

### Step 5 — Write the rotation runbook (~30 min — operational documentation)

Per Choice 3 from Step 1.

**If 3(a) elected (Recommended):**

Create `/operations/runbooks/substrate-layer2-key-rotation.md`. Founder-performable runbook with:

- **Pre-rotation checklist** (1 week before rotation date): verify current backups intact; verify `SUBSTRATE_LAYER2_KEY_ID` value matches `/api/public-key` response; review the runbook end-to-end.
- **Rotation procedure** — 9 steps from A3 ADR §Decision 4, with exact founder-performable commands:
  1. Generate new keypair (AI-sandbox command from A3 Step 3, or founder-runs-locally with `node -e ...`).
  2. Assign new `key_id` (e.g., `substrate-layer2-2026Q3`).
  3. Three-copy backup of new private key (password manager + paper + Vercel env vars; mirrors A3 Step 4 ceremony).
  4. Add new public key to API discovery as "previous" slot — set `SUBSTRATE_LAYER2_PREVIOUS_PUBLIC_KEY`, `SUBSTRATE_LAYER2_PREVIOUS_KEY_ID`, `SUBSTRATE_LAYER2_PREVIOUS_KEY_RETIRES_AT` to the OLD current key's values. Wait — this is the **first** rotation; the conceptual "previous" is what's currently in `SUBSTRATE_LAYER2_PUBLIC_KEY` slot. The runbook handles the inversion explicitly.
  5. Wait 24 hours for verifier refresh.
  6. Promote new key to current — update `SUBSTRATE_LAYER2_SIGNING_KEY`, `SUBSTRATE_LAYER2_PUBLIC_KEY`, `SUBSTRATE_LAYER2_KEY_ID`, `SUBSTRATE_LAYER2_KEY_ISSUED_AT` to the new key's values. Demote old key to previous slot.
  7. Vercel redeploy. New signatures use new key.
  8. 30-day overlap: previous public key remains in API discovery. Verifiers can still verify old signatures.
  9. Day 30: retire previous key. Unset the three previous-key env vars. Vercel redeploy. Rotation complete.
- **Verification at each step**: exact curl + Python pass/fail check (mirrors A3 Step 12 patterns).
- **Off-cycle (compromise-suspected) rotation variant**: shorter timeline (no 24-hour wait if the threat is acute; 7-day overlap instead of 30-day; founder discretion on overlap shortening based on threat profile).
- **Rollback paths during a rotation**: Path A (un-promote — restore previous env-var values), Path B (revert deploy), Path C (full re-rotation if compromise confirmed).
- **Post-rotation reflection**: founder reviews what worked; updates the runbook based on observation (the runbook is a living document).

**If 3(b) elected:** runbook content lives inside the A4 ADR; same content, different file.

**If 3(c) elected:** both — same content duplicated; maintenance burden flagged.

### Step 6 — Optional dry-run rehearsal (~30 min if Choice 1(a) elected)

**If 1(a) elected (Recommended):**

Walk through the rotation runbook against a test keypair. The AI generates a fresh Ed25519 keypair in its sandbox (separate from production); the founder substitutes the test values for env vars in a Vercel preview environment (NOT production); the rotation procedure is exercised end-to-end; the test key is retired at the end of the dry-run.

The dry-run is the live test of the runbook. Any procedural gaps surface here, before they matter in a real rotation.

**If 1(b) or 1(c) elected:** Step 6 is skipped. The first scheduled rotation IS the dry-run. The runbook is unexercised until then.

### Step 7 — Type-check + run unit tests (~10 min)

Mirrors A3 Step 9.

```bash
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/website"
npx tsc --noEmit -p tsconfig.json   # type-check
```

Both must return exit code 0. The Jest tests for `public-key-route.test.ts` are ready-for-Jest pattern matching A3 (cannot execute until Jest is configured per the F-series stewardship finding from A3); the AI runs an `npx tsx` smoke test of the same invariants if the founder requests interim runtime verification.

### Step 8 — Critical Change Protocol — explicit founder approval (~5 min)

The AI surfaces the full CCP responses (confirmed at Step 3 + the implementation specifics from Steps 4–7) one more time. Founder types "OK" or "go ahead" specific to the named risks.

### Step 9 — Deploy via session-close commit (founder's own terminal)

The AI surfaces the exact commands. Single commit covering: A4 ADR move from `/drafts/` to `/adopted/`, code changes (route.ts modification + any signer.ts modifications), runbook file (`/operations/runbooks/substrate-layer2-key-rotation.md`), test file. Founder pushes via GitHub Desktop. Vercel redeploys.

### Step 10 — Three-scenario PR1 verification on `/api/public-key` (~15 min — Critical-tier verification)

**Scenario 1 — No rotation in progress (current state preserved).**
- Confirm three new env vars are unset in Vercel.
- Run canonical curl against `/api/public-key`.
- Expected: `previous: null`, `rotation_overlap_until: null`. Existing behaviour unchanged.

**Scenario 2 — Rotation in progress (overlap window active).**
- The founder sets the three new env vars to test values (a different test public key + key_id + a future ISO 8601 timestamp).
- Vercel redeploys.
- Run canonical curl against `/api/public-key`.
- Expected: `previous: {key_id, public_key_pem, issued_at, retires_at}`; `rotation_overlap_until` matches the retires_at value.

**Scenario 3 — Partial rotation state (defensive fallback).**
- Founder unsets one of the three previous-key env vars (simulating a config drift mid-rotation).
- Vercel redeploys.
- Run canonical curl.
- Expected: `previous: null`, `rotation_overlap_until: null` (the endpoint requires all three to be set; partial state defaults to no-rotation per fail-safe).

After verification: founder unsets the test env vars (Scenario 2's test public key was not the production previous key; it was a placeholder for the dry-run). The endpoint returns to Scenario 1's state for production.

If 1(a) dry-run was elected at Step 1, the dry-run rotation in Step 6 also exercises Scenario 2 against a real (test) keypair. The Step 10 Scenarios 1–3 are the discrete verification of the endpoint extension; Step 6 is the discrete verification of the rotation procedure.

### Step 11 — Append decision-log entry (full form per Critical session)

Pattern: full form per the standing cache. Entry ID: `D-A4-KEY-MANAGEMENT-WIRED-VERIFIED-2026-MM-DD` if all verification scenarios pass; `D-A4-KEY-MANAGEMENT-WIRED-2026-MM-DD` if Verified status is not reached this session. Records: the four Step 1 elections; CCP responses verbatim; the files touched (A4 ADR moved to /adopted/, route.ts modified, runbook created, test file created); risk classification (Critical); rollback paths; verification steps; PR5 carry-forward; T-series tacit-knowledge findings; F-series stewardship findings; full Rules-served list.

### Step 12 — Session close (full form per Critical session)

Pattern: full form per the standing cache. Includes the additional sections: Verification Method Used, Risk Classification Record, PR5 Knowledge-Gap Carry-Forward, Founder Verification (Between Sessions), Orchestration Reminder. Save to `/operations/handoffs/founder/2026-MM-DD-stage-1-a4-key-management-close.md`.

Next-Session-Should block: **A5 — Layer 3 server-side service** (Critical risk per AC5; the R20a deterministic injection sits inside Layer 3; A5 + A7 together complete the three-layer R20a defence's server-side portion).

---

## Part C — Anticipated session shape

| Phase | Estimate |
|---|---|
| Cache + predecessor close + A3 ADR re-read + code-path reads | 30-40 min |
| Step 1 — four session-opening elections | 20 min |
| Step 2 — A4 ADR drafted in-session | 30 min |
| Step 3 — CCP responses confirmed | 10 min |
| Step 4 — code: previous-key env-var slots + /api/public-key extension | 30 min |
| Step 5 — rotation runbook | 30 min |
| Step 6 — optional dry-run rehearsal (if 1(a) elected) | 30 min (or skipped) |
| Step 7 — type-check + tests | 10 min |
| Step 8 — explicit founder approval | 5 min |
| Step 9 — deploy via session-close commit | 5 min |
| Step 10 — three-scenario PR1 verification on /api/public-key | 15 min |
| Step 11 — decision-log entry (full form) | 30 min |
| Step 12 — session close (full form) | 25 min |
| **Total (with dry-run)** | **~4-5 hours** |
| **Total (without dry-run)** | **~3.5-4.5 hours** |

If the session reaches the 4.5-hour mark without Verified status, close at the most stable point per the founder's "I'm done for now" signal.

**Documented stable points if early closure is needed:**
- **After Step 2, before Step 3:** A4 ADR drafted but unadopted. Status: A4 Designed (ADR drafted; pending adoption). Decision-log entry captures the ADR; resume with Step 3 next session.
- **After Step 5, before Step 6:** code + runbook complete; nothing deployed. Status: A4 Scaffolded. Decision-log entry captures the scaffolding; resume with deploy + verification next session.
- **After Step 9, before Step 10:** deployed; verification not yet run. Status: A4 Wired (code on production; verification pending). Decision-log entry captures the wiring; resume with three-scenario verification next session.
- **After Step 10 (any failure):** rollback Path A engaged (un-set test env vars; production returns to no-rotation state). Status: A4 Wired but not Verified; the failed scenario is the open question for the next session.

---

## Rollback path

Three paths in order of preference:

- **Path A (preferred — within minutes of any failure):** un-set the three new previous-key env vars in Vercel + redeploy. The endpoint returns to no-rotation state (current behaviour). Recovery ≤30s via Vercel redeploy.
- **Path B (revert the deploy):** `git revert <a4-wiring-commit-hash>` and push via GitHub Desktop. Vercel redeploys prior code (the A3-Verified state). Recovery ≤5 min.
- **Path C (env var loss):** restore env vars from the founder's three-copy backup. Mirrors A3 Path C exactly. Already-issued signatures remain verifiable.

If all three rollback paths are exhausted: declare incident; engage the encryption-wiring incident-response pattern from `ADR-ENCRYPTION-WIRING-01`; report at session close. Mid-rotation rollback (if a real rotation is in progress) requires A4-specific runbook steps (the runbook covers this in Step 5).

---

## Forecast

**Most-likely path:** founder elects the four recommended Step 1 options (1(a) dry-run now; 2(a) two new env vars; 3(a) markdown runbook; 4(a) first rotation Sunday 2026-09-06). Steps 2–7 complete cleanly. Step 8 founder approval given specifically against the named risks. Step 9 deploys cleanly. Step 10 three-scenario verification passes on first run. Step 6 dry-run exercises the runbook with no procedural gaps. A4 reaches **Verified**. Decision-log + close at ~4-5 hours. Next session: A5 — Layer 3 server-side service.

**Possible variations:**
- **Step 1 elections diverge from recommendations.** If 1(b) or 1(c) (no dry-run): Step 6 is skipped; first scheduled rotation becomes the dry-run; saves 30 min now but trades it for risk later. If 2(b) (three env vars including previous-private-key): Step 4 grows by ~20 min. If 2(c) (no previous-key slot): A3 ADR amendment required; A4 may need to defer to a sub-session that drafts the amendment first.
- **Step 6 dry-run surfaces a procedural gap.** Most likely cause: env-var-update timing mismatch between `SUBSTRATE_LAYER2_SIGNING_KEY` and `SUBSTRATE_LAYER2_PREVIOUS_PUBLIC_KEY` during the rotation step (Vercel may not propagate both env-var updates in the same redeploy). Diagnosis: capture the env-var state at each redeploy step. Fix: update the runbook to specify per-env-var redeploys for the rotation step.
- **Step 10 Scenario 2 returns `previous: null` despite all three env vars being set.** Most likely cause: env-var name typo or scope mismatch. Diagnosis: check Vercel env var listing; confirm the three new vars are visible to the deploy. Time: 10-20 min if diagnosable.
- **Founder elects to defer the dry-run after seeing the time estimate.** Choice 1(b) or 1(c) is elected mid-session; AI proceeds without the rehearsal. The first scheduled rotation in 2026Q3 is the dry-run.

**What success looks like at session close:**
- A4 implementation status: Scoped → Designed → Scaffolded → Wired → **Verified** on `/api/public-key` (all five transitions in one session, by way of the three-scenario PR1 proof).
- 1 new code file (`__tests__/public-key-route.test.ts`); 1 modified code file (`/api/public-key/route.ts`); 1 new operational document (`/operations/runbooks/substrate-layer2-key-rotation.md` — assuming Choice 3(a)); 1 new ADR (`/adopted/ADR-A4-key-management.md`).
- Three new Vercel env-var slots provisioned (test values during Step 10; un-set after verification): `SUBSTRATE_LAYER2_PREVIOUS_PUBLIC_KEY`, `SUBSTRATE_LAYER2_PREVIOUS_KEY_ID`, `SUBSTRATE_LAYER2_PREVIOUS_KEY_RETIRES_AT`.
- First scheduled rotation calendar reminder set (Sunday 2026-09-06 or as elected at Step 1 Choice 4).
- Rotation runbook drafted, exercised (if 1(a) elected), and ready for first live rotation.
- Decision-log entry full form recording the four Step 1 elections, the CCP responses verbatim, the verification scenarios, the rules served.
- Session close full form with Founder Verification, Risk Classification Record, PR5 carry-forward, T-series + F-series findings, Orchestration Reminder.
- Next session named: **A5 — Layer 3 server-side service** (Critical risk per AC5; R20a deterministic injection lives inside Layer 3).

End of prompt.
