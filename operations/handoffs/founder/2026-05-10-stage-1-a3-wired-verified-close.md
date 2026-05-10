# Session Close — 2026-05-10 — Stage 1 A3 Wired + Verified: Layer 2 Signing Infrastructure on /api/reason

**Stream:** founder.
**Governing frame:** /adopted/standing-protocol-cache.md + /adopted/build-sessions-protocol-cache.md.
**Tier:** code-critical — **Critical** risk under PR6 + AC7. Full templates per the standing cache (NOT lean form).
**Date:** 2026-05-10.
**Predecessor close:** /operations/handoffs/founder/2026-05-10-stage-1-a3-adr-adopted-close.md
**Predecessor decision-log entries:** D-A3-LAYER2-SIGNING-ADR-ADOPTED-2026-05-10, D-A2-INPUT-VALIDATION-SURFACE-2026-05-10, D-A1-FLAG-FLIP-VERIFIED-2026-05-10, D-A1-INVOCATION-SITE-2026-05-10, D-A1-LAYER2-AUTH-SCAFFOLD-2026-05-10, D-STAGING-PLAN-ADOPTED-2026-05-10.
**Session prompt:** pasted in conversation by founder; not a stand-alone file.

---

## Decisions Made

- **D-A3-LAYER2-SIGNING-WIRED-VERIFIED-2026-05-10** appended (full-form per Critical session). Stage 1 item A3 (Layer 2 signing infrastructure) reaches **Verified** on `/api/reason`. The substrate now signs every authoritative `Layer2Assessment` with an Ed25519 signature when `SUBSTRATE_LAYER2_SIGNING_ENABLED='true'`. Three session-opening elections committed: Choice 1(a) feature-flag-gated rollout; Choice 2(a) in-house canonical-JSON; Choice 3(a) `/api/public-key` public read with edge cache. Three production verification scenarios passed. PR1 single-endpoint proof on `/api/reason` is COMPLETE for A3. A3 implementation status moves Designed → Scaffolded → Wired → Verified within this session.

---

## Status Changes

| Item | Old | New |
|---|---|---|
| Stage 1 item A3 (Layer 2 signing infrastructure) | Designed (per D-A3-LAYER2-SIGNING-ADR-ADOPTED-2026-05-10) | **Verified** on `/api/reason` |
| `/website/src/lib/translation-sandwich/layer2-canonical-json.ts` | did not exist | NEW (~135 lines); imports `Layer2Assessment` type; exports `canonicaliseLayer2Assessment` + `Layer2CanonicalisationError` |
| `/website/src/lib/translation-sandwich/layer2-signer.ts` | did not exist | NEW (~155 lines); exports `signLayer2Assessment` + `SubstrateSigningKeyMissingError` + `SignedLayer2Assessment` type |
| `/website/src/app/api/public-key/route.ts` | did not exist | NEW (~125 lines); GET-only; returns `{key_id, algorithm, public_key_pem, issued_at, rotation_overlap_until: null, previous: null}`; CORS *; 1-hour edge cache |
| `/website/src/lib/translation-sandwich/__tests__/layer2-canonical-json.test.ts` | did not exist | NEW (~155 lines); 9 Jest-style invariant tests; ready-to-run when Jest is configured |
| `/website/src/lib/translation-sandwich/__tests__/layer2-signer.test.ts` | did not exist | NEW (~210 lines); 9 Jest-style sign-and-verify tests; ready-to-run when Jest is configured |
| `/website/src/lib/translation-sandwich/parallel-run.ts` | A2-modified | A3-modified — imports + `SUBSTRATE_LAYER2_SIGNING_ENABLED` flag + `'signing_throw'` failure category + signing branch in `runSandwichInner` between Layer 2 production and composed-output construction |
| `/website/src/app/api/reason/route.ts` | A2-modified | A3-modified — Branch 1.5 added handling `signing_throw` → 503 `substrate_signing_unavailable` |
| Vercel env var `SUBSTRATE_LAYER2_SIGNING_KEY` | did not exist | provisioned (Ed25519 PEM PKCS#8 private key); three-copy backup ceremony complete |
| Vercel env var `SUBSTRATE_LAYER2_SIGNING_ENABLED` | did not exist | provisioned `false` then flipped to `true` mid-session for Scenarios 2 + 3; remains `true` post-session |
| Vercel env var `SUBSTRATE_LAYER2_KEY_ID` | did not exist | provisioned `substrate-layer2-2026Q2` |
| Vercel env var `SUBSTRATE_LAYER2_KEY_ISSUED_AT` | did not exist | provisioned `2026-05-10T04:45:15.516Z` |
| Vercel env var `SUBSTRATE_LAYER2_PUBLIC_KEY` | did not exist | provisioned (Ed25519 PEM SPKI public key) |
| Founder calendar | no signing-key reminder | monthly recurring "Verify SUBSTRATE_LAYER2_SIGNING_KEY backups match" added |
| Decision status: A3 Wired+Verified | did not exist | **Adopted** |
| Build arc | Stage 1 A3 Designed (ADR adopted; scaffolding session unblocked) | **Stage 1 A3 Verified** on `/api/reason`; **A4 — Key management** unblocked for next session (Critical risk; operationalises the rotation procedure drafted in the A3 ADR) |

---

## Verification Method Used (per 0c framework)

This session exercised three founder-performable verification methods, each appropriate to the artefact under test:

1. **TypeScript type-check on the whole project** (`npx tsc --noEmit -p tsconfig.json`) — exit code 0. Catches any structural type error introduced by the new modules + the modified parallel-run + the modified route file.

2. **Runtime smoke test via `npx tsx`** (`/tmp/a3-smoke-test.ts`, written this session). Exercised both new helpers (`canonicaliseLayer2Assessment` + `signLayer2Assessment`) against a fresh test keypair generated in the AI sandbox. 17 of 17 invariants PASS:
   - canonical-JSON: stable output across re-canonicalisation, order-invariance under top-level key reordering, array-order-preservation, NaN throws `Layer2CanonicalisationError`, Infinity (positive + negative) throws, undefined property throws, round-trip stability (canonicalise → JSON.parse → canonicalise = canonicalise).
   - signer: 88-character base64 signature, 64-byte Ed25519 signature after decode, key_id reflects env var, Ed25519 deterministic re-sign produces identical bytes, verify against matching public key succeeds, verify against different public key fails, **tampered assessment fails verification (perturbation test 7)**, **one-byte canonical mutation fails verification (perturbation test 7b)**, env-var-missing throws `SubstrateSigningKeyMissingError`, env-var-malformed throws `SubstrateSigningKeyMissingError`.

3. **Three production verification scenarios on `/api/reason`** (founder-executed via curl + Python + Node):
   - **Scenario 1** (`SUBSTRATE_LAYER2_SIGNING_ENABLED='false'`): bare `Layer2Assessment` shape returned; `assessment.version='layer2-assessment-v1'`; no `signature` or `key_id` fields. Zero regression confirmed; T-AT-LEAST-NEW-1 third application of the three-scenario methodology.
   - **Scenario 2** (flag flipped to `'true'` + Vercel redeploy): wrapped `{assessment, signature, key_id}` shape returned; signature is 88 base64 chars; signature verifies against `/api/public-key` (key_id `substrate-layer2-2026Q2`); Node verifier script reports `SCENARIO 2: PASS — signature verifies against /api/public-key`.
   - **Scenario 3** (perturbation): `ruling_faculty_state` mutated to `'TAMPERED'` and re-canonicalised; signature correctly fails verification; Node verifier reports `SCENARIO 3: PASS — tampered response correctly fails verification`. The substrate's signing discipline catches single-byte mutations at the production boundary.

The combination of (1) + (2) + (3) collectively satisfies AC4 (invocation testing for safety functions) at the production level. The two new Jest-style `.test.ts` files in `__tests__/` are ready-to-run when Jest is configured (see Open Questions); the smoke test serves as interim verification using `npx tsx`.

---

## Risk Classification Record (per 0d-ii)

Three sub-changes this session, each classified independently:

| Sub-change | Risk class | Rationale |
|---|---|---|
| Implementation of `layer2-canonical-json.ts` + `layer2-signer.ts` (new modules) | **Critical** | Cryptographic infrastructure; PR6 engaged; AC7-adjacent because the import-site is the auth surface route file |
| Wiring of signing into `runSandwichInner` (parallel-run.ts modification) | **Critical** | Adds a synchronous branch on the user-facing serving path; the response shape changes when the flag is on; PR6 + AC4 engaged |
| `/api/public-key` endpoint (new route file) | **Elevated** | New public endpoint; no auth/session surface; companion to safety-critical signing surface; not safety-critical itself (the public key is, by definition, public) |
| Branch 1.5 in `/api/reason/route.ts` (signing_throw → 503) | **Critical** | Modifies an existing user-facing serving path on a Critical-classified route file (PR6 + AC7) |
| Vercel env var provisioning (5 new env vars) | **Critical** | Deployment-configuration changes activating new auth-adjacent + cryptographic surfaces |

The session-as-a-whole is **Critical** under 0d-ii (the highest-risk sub-change governs). The full Critical Change Protocol was completed in chat at Step 2 (CCP responses confirmed, drafted ahead of time inside the A3 ADR per PR6 + AC7) and at Step 10 (explicit founder approval received naming the four risks: wire-format change, signing failure must fail-closed, canonicalisation bug, env-var loss).

The "no current users (affirmed 2026-05-10)" governing note from `/adopted/build-sessions-protocol-cache.md` §"Founder governing notes for the duration of the build arc" applied: CCP step 3 ("What happens to existing sessions?") was answered "N/A — only founder + test logins exist; no third-party sessions to invalidate." All other CCP steps remained in full force. The note will become re-engaged when the plugin ships and external users exist.

---

## PR5 — Knowledge-Gap Carry-Forward

Watch-status concepts from predecessor sessions, updated this session:

1. **Apex-domain-redirect-on-POST behaviour at sagereasoning.com.** Engaged at the verification step (founder used `https://www.sagereasoning.com` for all curls, avoiding the apex-domain redirect). Cumulative count remains at 2 (watch-status); founder's between-session verification curl (this session's verification block) continues the `www.` discipline. One more recurrence in any future session involving curl-to-production would promote this to a permanent KG entry per PR8.

2. **The substrate's three-layer architecture (open Layer 1 + closed Layer 2 + closed Layer 3) and the moat boundary.** Cited inside the new files' compliance comments and inside the A3 wiring decision-log entry, but **without re-explanation** — the canonical reference remains `/adopted/ADR-stoic-agent-substrate-concept.md` §"The moat boundary". This is the resolution-already-canonical pattern. Cumulative count not advanced this session because no re-explanation occurred.

3. **The no-current-users governing note's effect on Critical Change Protocol step 3.** Cited at Step 2 (CCP confirmation) of this session via the inherited CCP responses from the A3 ADR, again **without re-explanation** — the canonical reference is `/adopted/build-sessions-protocol-cache.md` §"Founder governing notes for the duration of the build arc". Cumulative count remains at 3 (third recurrence already promoted to resolution-already-canonical at the A3-ADR-Adopted close).

4. **PR1 single-endpoint proof discipline applied to feature-flag-gated functions.** Engaged in full this session — the `SUBSTRATE_LAYER2_SIGNING_ENABLED` flag was deployed `false`, then flipped `true` only after Scenario 1 confirmed zero regression on the flag-off path. Cumulative count = 3 (third application). Eligible for process-rule promotion per PR8 third-recurrence rule. Recommendation: do not promote within this session-arc per Rule B; promote at a separate routine governance session after a sleep cycle.

5. **Cryptographic-signing payload-vs-hash trade-off.** Re-engaged this session via the canonical-JSON discipline (the canonical bytes ARE the signed payload, not a hash of them; hash-of-canonical-JSON was rejected at the A3 ADR Decision 2 alternatives). Cumulative count = 2 (second observation). May recur in B2 (in-plugin Layer 1 R20a script signing decisions) and at Stage 3 D3 (subagent handoff payload signing).

6. **NEW finding — Jest is not configured in the codebase.** First observation this session at Step 9. The two new `.test.ts` files written for canonical-JSON + signer follow the existing co-located `__tests__/` convention; jest is not in `package.json` `dependencies` or `devDependencies` (only `@types/jest` is); no `jest.config.*`; no `test` script. Workaround used: `npx tsx /tmp/a3-smoke-test.ts` (17/17 invariants PASS) for runtime verification. Cumulative count = 1. **Recommended follow-up:** add Jest as a dev dependency + minimal config + test script in a Standard-risk governance session. Not blocking for A4 or any subsequent build-arc work.

7. **NEW finding — feature-flag-gated rollout pattern's relationship to Path A rollback.** Engaged this session: Choice 1(a) was elected explicitly because it makes Path A rollback "flip flag false" (~30s recovery via Vercel redeploy). Pattern: when a Critical-tier change adds a new wire-format or behaviour, the cheapest rollback is a feature flag deployed `false` then flipped after PR1 verification passes. Cumulative count = 1 (first observation as a named pattern). May recur in B2 (in-plugin Layer 1 R20a script), A7 (server-side R20a gate), A5 (Layer 3 service), and any subsequent Critical-tier wiring.

---

## Tacit-knowledge findings (T-series register, per PR8)

**T-AT-LEAST-NEW-1 — Three-scenario verification methodology.** Re-applied this session for the third confirmed time (A1 verification + A2 verification deferred per Rule B + A3 verification this session). The methodology — (1) flag-off-or-pre-state happy path returns expected shape; (2) flag-on-or-post-state happy path returns expected new shape; (3) perturbation/tamper/regression-check fails as expected — is now eligible for promotion to a process rule at the next routine governance session per PR8 third-recurrence rule. Recommended promotion text: *"Three-scenario production verification — every Verified-status migration of a Critical-or-Elevated surface uses (1) pre-state happy path returns the existing expected shape (zero regression); (2) post-state happy path returns the new expected shape; (3) tamper/perturbation/regression-check fails as expected (proving the discipline catches the kind of failure the surface exists to prevent)."* The promotion is logged here for visibility; the actual process-rule append happens at a routine governance session per Rule B (do not promote on third recurrence within the same session-arc; allow a sleep cycle for the founder to confirm).

**T-A2-NEW-1 — Validator-throw-to-400-with-preserved-fields.** Not exercised this session (no validation work). Cumulative count remains at 1.

**T-A3-NEW-1 — Critical Change Protocol drafted ahead of time inside the ADR.** Re-engaged this session — the CCP responses pre-drafted in the A3 ADR were inherited and confirmed at Step 2 with minimal updates (the Step 1 elections concretised Path A and Choice 2(a) without changing the four named risks). Cumulative count = 2 (second observation; the pattern is validating itself in production use). May recur in subsequent crypto/safety-surface ADRs (A4 key management, A7 server-side R20a gate, A5 Layer 3 service, B2 in-plugin R20a script).

**T-A3-NEW-2 — ADR commits Critical-classification of the eventual scaffolding session inside the document.** Re-engaged this session — the A3 ADR's AC7-compatibility-posture section explicitly classified this session as Critical before it began, and the scaffolding session inherited that classification rather than re-deriving it at session-open. Cumulative count = 2 (second observation). May recur in subsequent crypto/safety-surface ADRs.

**T-A3-NEW-3 — Feature-flag-gated rollout pattern's Path A rollback property.** New this session — see PR5 carry-forward item 7 above. The pattern is: when a Critical-tier change adds a new wire-format or behaviour, deploy with the feature flag `false`, run Scenario 1 to confirm zero regression, then flip the flag `true` and run Scenarios 2 + 3. Path A rollback (~30s) is concretely available throughout the verification. Cumulative count = 1 (first observation as a named pattern).

**T-A3-NEW-4 — Inline `npx tsx` smoke test as interim test runner when jest is unavailable.** New this session — see PR5 carry-forward item 6 above. The pattern is: when the codebase has Jest-style test files but Jest is not configured, write a self-contained `npx tsx` script that exercises the same invariants and report pass/fail counts to stdout. The script runs in the AI sandbox; the founder sees the count summary. Cumulative count = 1 (first observation as a named pattern). May recur in any future code-critical session until Jest is configured.

---

## Stewardship findings (F-series register, per PR9)

No catastrophic, long-term-regression, or efficiency-and-stewardship findings opened this session that require schedule slots. Two efficiency observations logged for the steady-state queue:

- **Jest configuration debt.** The `__tests__/` folders contain test files that cannot be run via `npm test` because Jest is not installed. Each new code-critical session writing tests adds to this debt (this session added two more `.test.ts` files, bringing the substrate test surface to a meaningful size). Tier: **Efficiency & stewardship** per PR9 — absorbed into ongoing steady-state maintenance; the next governance session that does a routine sweep of the codebase should clear this in batch (~30 min: add `jest` + `ts-jest` to devDependencies, add minimal `jest.config.ts`, add `test` script, run all existing tests to confirm they pass).
- **Founder calendar discipline now carries two cryptographic-key reminders** — the existing `MENTOR_ENCRYPTION_KEY` monthly verification (from `ADR-ENCRYPTION-WIRING-01` Decision 4) plus the new `SUBSTRATE_LAYER2_SIGNING_KEY` monthly verification (from this session). Tier: **Efficiency & stewardship**. Both reminders share the same first-of-month cadence; consider consolidating into a single recurring "Cryptographic key custody check" calendar item that walks the founder through both verifications when A4 lands (key management session).

---

## Open Questions

1. **Capability-matrix update for the new validation + signing + public-key surfaces at /api/reason.** Inherited from A1, A2, A3-ADR-Adopted closes; deferred to a routine governance session as part of K-category migration planning. Continues to accumulate; the upcoming K-category planning session(s) should clear this in batch.

2. **Whether the three-scenario verification methodology promotion to a process rule (PR8 third recurrence per T-AT-LEAST-NEW-1 above) should happen at A4 session-close or at a separate governance session.** Recommendation: separate governance session per Rule B's "do not promote on third recurrence within the same session-arc" guidance. If the founder prefers, the promotion can land in A4's session-close to keep momentum.

3. **Jest configuration in the codebase.** Logged as F-series efficiency-and-stewardship finding above. Not blocking; deferrable to any routine governance session.

4. **First scheduled rotation calendar date.** A4 (Key management) operationalises the quarterly rotation procedure drafted in the A3 ADR §Decision 4. The first scheduled rotation should be set during A4 — a date during 2026Q3 (any time between 1 July and 30 September 2026) is appropriate per the quarterly cadence.

5. **Capability-matrix `signing_keys` block placement.** Stage 3 C1 will define the plugin manifest's `signing_keys` block per A3 ADR Decision 3. The conceptual structure is committed (`{key_id, algorithm, public_key_pem, issued_at}` per key); per-marketplace JSON schema or YAML conventions are decided at C1.

---

## Founder Verification (Between Sessions)

Step-by-step in your own terminal (not in this Cowork session):

```bash
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"

# 1. Confirm session-close commit + A3 wiring commit are on origin/main
git log --oneline -5 origin/main
# Expected: most recent commit = the session-close commit (decision-log entry +
# this close); preceded by the A3 wiring commit (the seven files); preceded
# in turn by the A3-ADR-Adopted commit (8297711) and earlier history.

# 2. Confirm the new files exist
ls website/src/lib/translation-sandwich/layer2-canonical-json.ts
ls website/src/lib/translation-sandwich/layer2-signer.ts
ls website/src/app/api/public-key/route.ts
ls website/src/lib/translation-sandwich/__tests__/layer2-canonical-json.test.ts
ls website/src/lib/translation-sandwich/__tests__/layer2-signer.test.ts
# Expected: each command lists its file; no errors.

# 3. Confirm the decision-log entry was appended
grep -nE "^## 2026-05-10 — D-A3-LAYER2-SIGNING-WIRED-VERIFIED-2026-05-10" operations/decision-log.md
# Expected: one hit at the bottom of the active log.

# 4. Optional governance verification (re-runs Scenarios 2 + 3 against
#    production; confirms the deploy is stable post-session). Substitute
#    PLUGIN_AUTH_SECRET value from Vercel.

#    a. /api/public-key health
curl -s https://www.sagereasoning.com/api/public-key | python3 -c "
import json, sys
d = json.load(sys.stdin)
assert d.get('algorithm') == 'Ed25519' and d.get('public_key_pem'), 'public-key endpoint regression'
print('PASS — public-key endpoint live (key_id={})'.format(d['key_id']))
"

#    b. /api/reason wrapped-shape happy path (flag still 'true' post-session)
curl -s -X POST https://www.sagereasoning.com/api/reason \
  -H "Content-Type: application/json" \
  -H "X-Plugin-Auth: <PLUGIN_AUTH_SECRET-value-from-vercel>" \
  -d '{"input":"between-sessions verification","depth":"quick","layer1_schema":{"version":"layer1-schema-v1","passions_present":[],"control_filter_elements":[],"oikeiosis_circles_engaged":[],"value_categories_at_stake":[],"kathekon_factors":[],"urgency_indicators":[],"causal_stage_evidence":[],"eupatheia_candidates":[],"stated_concern_targets":[],"stated_equanimity_signals":[],"motivation_stated":false,"motivation_evidence":[],"element_fusion_detected":{"fused":false,"fused_concerns":null},"ambiguity_notes":[]}}' \
  | python3 -c "
import json, sys
d = json.load(sys.stdin)
a = d.get('assessment', {})
ok = isinstance(a, dict) and 'assessment' in a and 'signature' in a and 'key_id' in a
print('PASS — wrapped assessment shape preserved' if ok else 'FAIL — shape regression: ' + str(list(a.keys())[:6]))
"
```

Expected: both PASS lines. If either fails, A3 has regressed. Engage Path A rollback (Vercel → Settings → Environment Variables → set `SUBSTRATE_LAYER2_SIGNING_ENABLED='false'` → save → Deployments tab → Redeploy) and report at next session open.

**Session-close commit** — this is the second commit to push (the first was the A3 wiring commit at Step 11):

```bash
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
git add operations/decision-log.md operations/handoffs/founder/2026-05-10-stage-1-a3-wired-verified-close.md
git commit -m "Stage 1 A3 Verified: decision-log entry + close

D-A3-LAYER2-SIGNING-WIRED-VERIFIED-2026-05-10 appended (full-form per
Critical session). Stage 1 item A3 reaches Verified on /api/reason
with three production verification scenarios passed:
  - Scenario 1 (flag=false): bare assessment shape; zero regression.
  - Scenario 2 (flag=true): wrapped {assessment, signature, key_id};
    signature verifies against /api/public-key.
  - Scenario 3 (perturbation): tampered ruling_faculty_state correctly
    fails verification at the production boundary.

A3 implementation status: Designed -> Scaffolded -> Wired -> Verified
within one session.

Session close (full-form per Critical session) at
operations/handoffs/founder/2026-05-10-stage-1-a3-wired-verified-close.md.

Production state: SUBSTRATE_LAYER2_SIGNING_ENABLED='true' on Vercel;
substrate signs every Layer2Assessment; verifiers fetch public key at
/api/public-key (key_id substrate-layer2-2026Q2). Path A rollback
(flip flag false) remains available at <30s recovery via Vercel
redeploy.

Next session: A4 — Key management (Critical risk; operationalises
the quarterly rotation procedure drafted in the A3 ADR §Decision 4)."
```

Then push via GitHub Desktop. The session-close commit only touches `/operations/` paths; Vercel will not redeploy from this commit.

---

## Next Session Should

The next session is **Stage 1 item A4 — Key management** (Critical risk).

**Pre-conditions:**
1. Founder has staged + committed + pushed this session-close commit per the Founder Verification block above.
2. A3 implementation status remains Verified on `/api/reason` (between-session governance verification confirms — see Founder Verification above).
3. `SUBSTRATE_LAYER2_SIGNING_ENABLED='true'` remains in force; the substrate continues to sign every Layer2Assessment.
4. Founder's three-copy backup of `SUBSTRATE_LAYER2_SIGNING_KEY` is intact (verified by the new monthly calendar reminder; first verification due 2026-06-01).

**Scope of A4 (initial scoping; AI will surface design choices at A4 session-open):**

- Operationalise the rotation procedure drafted in the A3 ADR §Decision 4 (the 9-step procedure: generate → assign key_id → backup → add to API discovery as previous → wait for verifier refresh → promote to current → update env var → 30-day overlap → retire).
- Set the first scheduled rotation calendar date (any time during 2026Q3; recommended early-September so the rotation lands on a quiet Sunday).
- Document the off-cycle (compromise-suspected) rotation variant as an incident-response runbook.
- Decide on the rotation dry-run posture: should the founder rehearse the rotation procedure before the first scheduled rotation, or treat the first scheduled rotation as the dry-run? (A4 design choice.)
- Document the env-var-update mechanics for `SUBSTRATE_LAYER2_SIGNING_KEY`, `SUBSTRATE_LAYER2_PUBLIC_KEY`, `SUBSTRATE_LAYER2_KEY_ID`, `SUBSTRATE_LAYER2_KEY_ISSUED_AT` during rotation.
- Extend `/api/public-key` to return non-null `previous` and `rotation_overlap_until` during the overlap window. The endpoint scaffolding from this session needs the rotation-state extension; A4 wires it.
- Decide whether to add a `previous_signing_key` env var slot to support the 30-day overlap (the substrate continues signing with the new key, but verifiers continue accepting both).
- Add monitoring/alert hooks: should the substrate log when a verifier requests a key_id that does not match either current or previous? (Useful for detecting verifiers that have not refreshed; out-of-scope for A4 if it requires logging infrastructure not yet in place.)
- Per CCP discipline — A4 will be Critical risk; the full Critical Change Protocol applies; the AI drafts CCP responses ahead of time inside the A4 ADR (pattern T-A3-NEW-1).

**Estimated A4 duration:** 3-5 hours (Critical risk; operational ADR + rotation-rehearsal + endpoint scaffolding extension + Critical Change Protocol writeups + founder explicit approval + verification scenarios).

After A4 reaches Verified, the build arc proceeds to **A5 — Layer 3 server-side service** (the next critical-path item per the staging plan). A5 is Critical risk per AC5 (the R20a deterministic injection sits inside Layer 3); A5 + A7 (server-side R20a gate) together complete the three-layer R20a defence's server-side portion.

---

## Blocked On

**Founder action required before next session begins:**

1. Stage and commit the session-close commit per the Founder Verification block above. This appends the decision-log entry + this close.
2. Push via GitHub Desktop (one push for this single commit).
3. Optional: read the A3 ADR end-to-end one more time before the A4 session so the rotation procedure (drafted in §Decision 4) is pre-loaded.
4. Optional: between-sessions verification curls per the Founder Verification block. If both fail, engage Path A rollback and report at next session open.

**Files remaining uncommitted (after this session's wiring commit at Step 11):**
- `operations/decision-log.md` (D-A3-LAYER2-SIGNING-WIRED-VERIFIED-2026-05-10 appended)
- `operations/handoffs/founder/2026-05-10-stage-1-a3-wired-verified-close.md` (this file)

**Production state at session close:** A3 Verified and live at `/api/reason` with `SUBSTRATE_LAYER2_SIGNING_ENABLED='true'`. Substrate signs every authoritative `Layer2Assessment`. `/api/public-key` is live and returns the verification key with edge-cached 1-hour TTL. Vercel state: redeploy after wiring commit + env-var flag flip mid-session both completed; latest deploy is the post-flag-flip state. AC7 disposition: A1 plugin-auth + A2 input-validation + A3 signing surfaces all Verified and operational. The site is in a stable, known-good state with the moat now technically delivered at the API boundary.

---

## Orchestration Reminder

Per the standing cache and the build-arc cache: the next session's open block reads (1) the standing cache, (2) the build-arc cache, (3) this close, (4) the A3 ADR `/adopted/ADR-layer2-signing-infrastructure.md` §Decision 4 (the rotation procedure operationalised at A4), (5) the encryption-wiring ADR `/adopted/ADR-ENCRYPTION-WIRING-01.md` §Decision 4 (the key-custody discipline mirrored), (6) the last 2 decision-log entries (this session's `D-A3-LAYER2-SIGNING-WIRED-VERIFIED-2026-05-10` + the predecessor `D-A3-LAYER2-SIGNING-ADR-ADOPTED-2026-05-10`), (7) the new code files written this session (`layer2-canonical-json.ts`, `layer2-signer.ts`, the modified `parallel-run.ts` signing branch, the `/api/public-key` route file).

The next session is **Critical-tier** by default (cryptographic key management; PR6 + AC7 engage). Full Critical Change Protocol writeups apply to any code change. The AI should draft the CCP responses ahead of time inside the A4 ADR per the T-A3-NEW-1 pattern (Critical-Change-Protocol-pre-drafted-in-ADR), so that the eventual A4 scaffolding session inherits them rather than starting from scratch.

The PR8 third-recurrence eligibility for **T-AT-LEAST-NEW-1** (three-scenario verification methodology, third confirmed application this session) is recorded above in the T-series register. Recommendation per Rule B: do not promote within A4 itself; promote at a separate routine governance session after a sleep cycle.

The PR8 third-recurrence eligibility for **PR1-applied-to-feature-flag-gated-functions** (third application this session) is recorded above in the PR5 carry-forward register. Same Rule B recommendation.

The Critical Change Protocol pre-drafting pattern (T-A3-NEW-1 above; second observation this session) is offered as a recommended approach for A4. It is not yet promoted to a process rule on second observation per PR8 (third recurrence triggers promotion).

The feature-flag-gated rollout pattern's Path A rollback property (T-A3-NEW-3 above; first observation this session) is logged for re-application at A4 (rotation introduces a new key + verifier-refresh window; a flag could gate the use of the new key vs the old key during the rehearsal phase).

The inline `npx tsx` smoke-test pattern (T-A3-NEW-4 above; first observation this session) is logged for re-application at any future code-critical session until Jest is configured. Jest configuration debt is in the F-series stewardship register (efficiency tier; absorbed into steady-state maintenance).

---

## Cross-references

- Predecessor close: `/operations/handoffs/founder/2026-05-10-stage-1-a3-adr-adopted-close.md`
- This session's prompt: pasted in conversation by founder (not saved to disk by this session)
- A3 ADR (the architectural anchor): `/adopted/ADR-layer2-signing-infrastructure.md`
- Substrate ADR (architectural anchor for what signing protects): `/adopted/ADR-stoic-agent-substrate-concept.md` §"The moat boundary"
- Cryptographic-precedent ADR: `/adopted/ADR-ENCRYPTION-WIRING-01.md` (key-custody discipline mirrored)
- Adopted staging plan: `/adopted/substrate-plugin-staging-plan.md` Stage 1 item A3 (success criteria SATISFIED for `/api/reason`; A3 implementation status: Designed → Scaffolded → Wired → Verified within this session)
- Build-arc cache: `/adopted/build-sessions-protocol-cache.md`
- Standing protocol cache: `/adopted/standing-protocol-cache.md`
- Decision-log entry appended this session: `D-A3-LAYER2-SIGNING-WIRED-VERIFIED-2026-05-10`
- Companion canonical references:
  - `D-A3-LAYER2-SIGNING-ADR-ADOPTED-2026-05-10` (the ADR adopted; CCP responses pre-drafted)
  - `D-A2-INPUT-VALIDATION-SURFACE-2026-05-10` (A2 Verified — the validated input contract this signing surface signs)
  - `D-A1-FLAG-FLIP-VERIFIED-2026-05-10` (A1 plugin-auth ingress — the path this signing surface is reachable from)
  - `D-M1-CP6-CUTOVER-2026-05-08` (translation-sandwich substrate canonical at `/api/reason`)
- New code files this session:
  - `/website/src/lib/translation-sandwich/layer2-canonical-json.ts`
  - `/website/src/lib/translation-sandwich/layer2-signer.ts`
  - `/website/src/app/api/public-key/route.ts`
- Modified code files this session:
  - `/website/src/lib/translation-sandwich/parallel-run.ts` (signing branch + flag + FailureCategory)
  - `/website/src/app/api/reason/route.ts` (Branch 1.5 — signing_throw → 503)
- New test files this session:
  - `/website/src/lib/translation-sandwich/__tests__/layer2-canonical-json.test.ts`
  - `/website/src/lib/translation-sandwich/__tests__/layer2-signer.test.ts`
- Vercel state (founder action; not in git):
  - 5 new env vars provisioned (`SUBSTRATE_LAYER2_SIGNING_KEY`, `SUBSTRATE_LAYER2_SIGNING_ENABLED='true'` post-session, `SUBSTRATE_LAYER2_KEY_ID`, `SUBSTRATE_LAYER2_KEY_ISSUED_AT`, `SUBSTRATE_LAYER2_PUBLIC_KEY`)
  - Founder calendar: monthly recurring "Verify SUBSTRATE_LAYER2_SIGNING_KEY backups match" (first verification due 2026-06-01)
- Cryptographic-precedent files (read at session-open per Orchestration Reminder):
  - `/website/src/lib/translation-sandwich/tier1-token.ts` (HMAC-signed continuation-token discipline mirrored)
  - `/website/src/app/api/reason/route.ts` lines 215–278 (`checkPluginAuth` constant-time-comparison precedent)
  - `/website/src/lib/server-encryption.ts` (env-var-at-call-time + rotation-ready `version` field discipline mirrored)
- Layer 2 output (the payload signed):
  - `/website/src/lib/translation-sandwich/layer2-mechanisms.ts` lines 342–365 (`Layer2Assessment` interface)
- Wiring site (where signing inserts):
  - `/website/src/lib/translation-sandwich/parallel-run.ts` lines 480–530 (`runSandwichInner` — signing branch between Layer 2 production and composed-output construction)

*End of session close. The build arc has crossed the critical-path threshold from Stage 1 A3 Designed (ADR adopted) to Stage 1 A3 Verified (signing live in production). The substrate's moat — Layer 2 + Layer 3 with cryptographic signing — is now technically delivered at the API boundary. Every authoritative `Layer2Assessment` carries an Ed25519 signature; verifiers fetch the public key at `/api/public-key`. The four design choices committed in the A3 ADR (Ed25519 asymmetric signing, `Layer2Assessment`-only payload, hybrid public-key distribution, single key with quarterly rotation and 30-day overlap) translated cleanly into implementation; three production verification scenarios confirmed the discipline at the boundary. Next: A4 — Key management (Critical risk; operationalises the quarterly rotation procedure drafted in the A3 ADR §Decision 4).*
