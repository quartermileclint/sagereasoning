# Session Close — 2026-06-09 — Pre-Launch S5: A10 per-install plugin-auth activation (production go-live) + A19 two-detector rollout + code hygiene

**Stream:** founder.
**Governing frame:** `/adopted/standing-protocol-cache.md` §"Critical-risk sessions" (full Critical Change Protocol) + `/adopted/build-sessions-protocol-cache.md` ("no current users" holds). PR17 — founder-performed steps walked live, not handed off.
**Tier:** `code-critical` — **Critical** under 0d-ii (deployment-config env-flag activation on the live `/api/reason` auth path). **AC7 ENGAGED** (authentication-surface change; Session-7b-compatible — additive path). **PR6 NOT engaged** (A10 does not touch the R20a distress classifier / A7 Zone-2 gate / wrappers). Production `api_keys` migration run (Elevated, additive/idempotent).
**Date:** 2026-06-09. **Branch:** `main`.
**Operative prompt:** Session 5 of `/operations/pre-launch-completion-plan-2026-06-07.md` (S5 next-session prompt: `2026-06-08-prelaunch-S5-a10-metering-NEXT-SESSION-PROMPT.md`).
**Predecessor closes:** `/operations/handoffs/founder/2026-06-08-prelaunch-S4-injection-defence-activation-close.md` (S4; most recent), `/operations/handoffs/founder/2026-06-03-A10-critical-implementation-close.md` (the authoritative A10 build + revocation reference).

## What this session did

Session 5 of the pre-launch completion plan. **Spine (Critical):** opened the agent front door — turned on A10 per-install plugin-auth in production. Because the A10 `api_keys` migration was **absent in production** at open (confirmed by the Step-0 column query returning 0 rows), it was run on production first as a clearly-separated **Elevated** step (additive + idempotent), then `PLUGIN_INSTALL_AUTH_ENABLED=true` was set for the Vercel **Production** environment and redeployed. `/api/reason` now accepts a per-install `sr_inst_` bearer credential as an **additive** auth path — tried last, after Supabase-JWT, API-key, and the shared-secret plugin path — with instant universal revocation. The order was deliberately safe: a credential was minted **while the flag was still OFF** (proving the mint endpoint's live insert with nothing exposed) before the flip.

**Material scope correction (surfaced at open under PR12/PR13):** A10 as wired delivers **per-install identity + authentication + instant revocation** — it does **not** meter per-install usage on `/api/reason` (the `increment_api_usage` billing path runs only for the `sr_live_` API-key path; the install path's `monthly_limit`/`daily_limit` columns are unread). "Metering" in the A10 label is aspirational. Decision 2 was re-scoped accordingly with explicit founder approval, and per-install usage metering/quota enforcement was recorded as a deferred item (PR7).

**Second activation (clean separate step):** rolled out the two A19 structural detectors (`systematic_enumeration`, `rapid_input_variation`) — `SUBSTRATE_ABUSE_DETECTION_ROLLOUT_ENABLED=true` (Production) + redeploy; `/api/abuse/evaluate` now runs all three detectors, detection-only, no false positives.

**Fill (low-risk):** deleted the dead `V3_SOCIAL_MEDIA_PROMPT` (`document-scorer.ts`; `tsc` clean); verified the agent-discovery surface (`llms.txt`, `.well-known/agent-card.json`, `openapi.yaml`) is served + consistent with the live contract. The `/api/user/export` → shared-helper consolidation was **deferred** (it would change a live GDPR endpoint's decrypted Art-20 output — earns its own focused step).

Three decisions settled at open (founder elected all recommendations): **(1)** A10 is the S5 spine; **(2)** activate now (re-scoped to auth/identity/revocation); **(3)** run the A19 two-detector rollout as a clean separate step after A10 reached verified-disposition.

## Decisions Made
- `D-PRELAUNCH-S5-A10-METERING-ACTIVATION-2026-06-09` (**Critical**) appended. Full Critical-Change-Protocol record (6 points incl. the existing-caller-regression result), the metering scope correction, the migration disposition, the two Diagnostic-certain TEST findings, the A19 rollout result, the deferred decisions, and the founder-performed verification result. Closes the S5 spine.

## Status Changes
| Item | Old | New |
|---|---|---|
| A10 per-install plugin-auth | Verified-live (TEST); deployed inert (prod) | **Live (production)** — identity + auth + revocation (metering deferred) |
| `PLUGIN_INSTALL_AUTH_ENABLED` (Vercel Production) | UNSET | **set `true`** |
| `api_keys` plugin-install migration (production) | absent | **Live (production)** (additive columns + constraints + indexes) |
| A19 `systematic_enumeration` + `rapid_input_variation` | Wired-inert (sandbox-verified) | **Live (production)** (detection-only) |
| `SUBSTRATE_ABUSE_DETECTION_ROLLOUT_ENABLED` (Vercel Production) | UNSET | **set `true`** |
| `V3_SOCIAL_MEDIA_PROMPT` (`document-scorer.ts`) | dead export | **deleted** (`tsc` clean) |

## Verification Method Used (0c Framework)
- **Database change (production migration, walked live):** AI supplied the SQL; founder confirmed the production ref (`jdbefwkonfbhjquozgxr`), ran it ("Success. No rows returned."), then re-ran the Step-0 column query → the three columns now present (were 0). ✅
- **API endpoint / auth surface (production, walked live):** mint (flag OFF) → **201** + `sr_inst_` token; after flag flip + redeploy, the token on `/api/reason` → **400** `layer1_schema is required` (past the gate, was 401); `/admin/test-reason` benign → normal assessment (existing-caller regression); revoke → **200**; same token re-presented → **401**. ✅
- **API endpoint (A19, production, walked live):** `GET /api/abuse/evaluate` with the service token → **200**, `detectors_run` = all three, `signals_fired: 0`, `signals_persisted: 0`; `abuse_signals` empty. ✅
- **Website static (discovery surface):** `llms.txt` + `.well-known/agent-card.json` + `openapi.yaml` fetched from production → all served; AI read confirmed consistency with the live `sr_live_` / `sr_assent_` contract and no overclaim (A10 `sr_inst_` correctly not surfaced as a public path). ✅
- **Code (hygiene):** `npx tsc --noEmit` → exit 0 after the `V3_SOCIAL_MEDIA_PROMPT` deletion; grep confirmed zero remaining references. ✅

## Risk Classification Record (0d-ii)
- Env-flag activation on the live `/api/reason` auth path: **Critical** (`code-critical`; deployment-configuration). Full Critical Change Protocol applied + walked live (PR17).
- **AC7 ENGAGED** — authentication-surface change; Session-7b-compatibility posture stated and met (additive path tried last; no cookie scope / session validation / domain-redirect change; existing JWT callers byte-identical flag-ON).
- **PR6 NOT engaged** — A10 does not touch the R20a distress classifier, the A7 Zone-2 gate, or their wrappers; the R20a distress decision runs on the raw `input` for all auth paths (confirmed by read).
- Production migration: additive/idempotent (Elevated alone). A19 rollout flag: deployment-config flip on a standalone endpoint off the `/api/reason` path, detection-only (lowest-stakes; PR6 not engaged). V3 deletion + decision-log + this close: Standard. Highest category governs → Critical.

## PR5 — Knowledge-Gap Carry-Forward
- One minor clarification: "sign in as admin" = the founder's own SageReasoning account (the one whose id is `ADMIN_USER_ID`); there is no separate admin login. Cumulative count: 1.
- **Candidate knowledge-gap (TEST-env readiness):** the admin endpoints do not work on the TEST clone out of the box — `ADMIN_USER_ID` is unset and there is no `profiles` row for the founder's TEST account (so `requireAdmin` 401s, then the mint 500s). This is the second time the TEST clone's incompleteness has bitten an admin-surface test (cf. the 2026-06-03 raw-SQL mint workaround). **Proposed resolution (Standard governance, a future session):** amend `/data-room/04_test_brief/test-env-standup-checklist.md` to add — for admin-endpoint testing — set `ADMIN_USER_ID` to the TEST account id and ensure a `profiles` row exists for it. Logged here; promote to a register entry on a third recurrence (PR5/PR8).

## Next Session Should
**Session 6 — R20a audience-correct safety rendering go-live** (per the completion plan). Spine (Critical, **PR6 ENGAGED — its own clean spine, extra care**): activate `SUBSTRATE_R20A_AUDIENCE_RENDERING_ENABLED` (and confirm the `SUBSTRATE_R20A_GATE_ENABLED` disposition) so a distressed agent-path caller gets an agent-correct response and a human gets the human crisis message; verify both audience branches and that the R20a distress invariant is preserved. Fill (off-perimeter only): build R20b framework-dependence detection inert; draft the accessibility statement. **Pre-conditions:** `main` clean + Vercel green; this session's commit pushed. Keep the PR6 spine clean — do not bundle non-safety activations.

## Blocked On
**Files remaining uncommitted (commit block in Founder Verification below):**
- `website/src/lib/document-scorer.ts` (V3 deletion)
- `operations/decision-log.md`
- `operations/handoffs/founder/2026-06-09-prelaunch-S5-a10-metering-activation-close.md` (this close)
- `operations/handoffs/founder/2026-06-08-prelaunch-S5-a10-metering-NEXT-SESSION-PROMPT.md` (the S5 prompt — untracked; commit if you keep prompts in-repo)

(`website/tsconfig.tsbuildinfo` shows as modified — a build-cache artifact; leave it out of the commit.)

**Production state at session close:** A10 per-install plugin-auth **Live in production** (`PLUGIN_INSTALL_AUTH_ENABLED=true`) — identity + authentication + instant revocation; **not** metered (deferred). `/api/reason` benign + existing-JWT behaviour byte-identical to flag-OFF; per-install `sr_inst_` tokens authenticate; revoked tokens 401. Also Live: A19 all three abuse detectors (`SUBSTRATE_ABUSE_DETECTION_ROLLOUT_ENABLED=true`, detection-only); A11b injection defence (S4); A19 velocity (S3); A12 OTel + `substrate_audit_events` (S2); GDPR data-rights endpoints + logs (S1); A13 cost-health detection; all four R20a core safety flags `true`. Still UNSET (inert): `SUBSTRATE_LAYER3_ENABLED` (→ 503), `SUBSTRATE_R20A_AUDIENCE_RENDERING_ENABLED`, `SUBSTRATE_R20A_GATE_ENABLED`. One revoked verification tombstone in production `api_keys` (`install_s5_prodverify`; harmless audit record).

## Open Questions
- None new. Carried (deferred): per-install usage metering/quota enforcement (PR7 — trigger: first paid agent onboard); the full TEST round-trip of the A10 admin mint endpoint (blocked by TEST-clone data gaps); the `/api/user/export` → shared-helper consolidation (its own focused Elevated step); the `component-registry.json` full reconcile (S8); the `/api/reason` + `/api/guardrail` mirror-exclusion (flagged open question).

## Founder Verification (Between Sessions)
The live verification is complete (you ran it this session). To persist the record, commit + push the docs + the one code change — **no Vercel behaviour change (the activations' redeploys already happened; this commit is docs + a dead-code deletion):**
```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
rm -f .git/index.lock
git add website/src/lib/document-scorer.ts \
        operations/decision-log.md \
        "operations/handoffs/founder/2026-06-09-prelaunch-S5-a10-metering-activation-close.md" \
        "operations/handoffs/founder/2026-06-08-prelaunch-S5-a10-metering-NEXT-SESSION-PROMPT.md"
git commit -m "Pre-Launch S5: A10 per-install plugin-auth activation (production) — ran the api_keys plugin-install migration on production + set PLUGIN_INSTALL_AUTH_ENABLED=true (Vercel Production) + redeployed; verified live mint->authenticate(400, past gate)->existing-JWT regression(unchanged)->revoke->401. A10 -> Live (identity + auth + revocation; per-install metering deferred). A19 two structural detectors rolled out (SUBSTRATE_ABUSE_DETECTION_ROLLOUT_ENABLED=true) + verified (3 detectors, 0 false positives, detection-only). Code hygiene: deleted dead V3_SOCIAL_MEDIA_PROMPT (tsc clean); discovery surface verified. (D-PRELAUNCH-S5-A10-METERING-ACTIVATION-2026-06-09)"
```
Then push via GitHub Desktop. (If you don't keep next-session prompts in-repo, drop that fourth path from the `git add`.)

**Independent re-verification (any time), signed in as admin on `www.sagereasoning.com` (browser console):** mint via `POST /api/admin/plugin-install-credentials` → 201 + `sr_inst_` token; `POST /api/reason` with `Authorization: Bearer sr_inst_<token>` + body `{}` → 400 (past gate, not 401); `DELETE /api/admin/plugin-install-credentials?id=<id>` → 200; re-POST with the same token → 401. And `GET /api/abuse/evaluate` with the `x-abuse-detection-token` → 200 with all three detectors, `signals_fired: 0`.

**One-step rollback (if ever needed):** in Vercel, delete `PLUGIN_INSTALL_AUTH_ENABLED` (or set ≠ `true`) + redeploy → `/api/reason` auth byte-identical to flag-OFF; revoke any test credential per `/operations/runbooks/plugin-install-credential-revocation.md`. For A19: delete `SUBSTRATE_ABUSE_DETECTION_ROLLOUT_ENABLED` + redeploy → velocity-only. No data or migration to undo.

## Orchestration Reminder
The AI has no persistent memory between sessions; these docs are its memory. At the next session open, read this close first, then the pre-launch completion plan, then the S6 predecessor context. The arc: completion plan — S1 (data-rights) ✅, S2 (A12 OTel) ✅, S3 (A19 velocity) ✅, S4 (A11b injection-defence) ✅, **S5 (A10 metering + A19 two-detector rollout) ✅ this session**, S6 (R20a audience-correct safety rendering — PR6, its own clean spine), S7 (A14 + A13 alert delivery), S8 (end-to-end verification + capability inventory → the pre-lawyer readiness gate; the deferred `component-registry.json` reconcile lands here). The agent path is now authenticated + injection-hardened + observable + abuse-detected. The remaining dark capabilities are per-install **metering** (deferred), Layer 3 per-consumer rendering, and the R20a rendering/gate refinements (S6).

## Cross-references
- `/operations/handoffs/founder/2026-06-08-prelaunch-S4-injection-defence-activation-close.md` (predecessor; S4)
- `/operations/handoffs/founder/2026-06-03-A10-critical-implementation-close.md` (the A10 build + revocation reference)
- `/operations/pre-launch-completion-plan-2026-06-07.md` (this is its S5)
- Decision log: `D-PRELAUNCH-S5-A10-METERING-ACTIVATION-2026-06-09` (+ predecessors `D-A10-SMOKE-TEST-VERIFIED-LIVE-2026-06-03`, `D-A10-CRITICAL-IMPL-WIRING-REVOCATION-2026-06-03`, `D-PRELAUNCH-S4-INJECTION-DEFENCE-ACTIVATION-2026-06-08`)
- ADR: `/adopted/adr/2026-06-03-a10-token-format.md` (Surface 1 — opaque bearer, DB-backed, instant revocation)
- Runbook: `/operations/runbooks/plugin-install-credential-revocation.md`
- As-built: `website/src/app/api/reason/route.ts` (the `PLUGIN_INSTALL_AUTH_ENABLED` gate, ~line 556); `website/src/app/api/admin/plugin-install-credentials/route.ts` (mint/revoke); `website/src/lib/plugin-install-auth.ts` (the universal revocation check)

*End of session close. Stabilised to a known-good state: A10 per-install plugin-auth Live in production (identity + authentication + instant revocation; metering deferred); existing JWT/session callers byte-identical flag-ON; A19 all three abuse detectors Live (detection-only); one-flag rollback available for each activation; docs + the dead-code deletion uncommitted awaiting the founder's commit + push.*
