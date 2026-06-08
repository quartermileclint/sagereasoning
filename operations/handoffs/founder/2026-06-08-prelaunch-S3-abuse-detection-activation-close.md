# Session Close — 2026-06-08 — Pre-Launch S3: A19 abuse-detection activation (production go-live) + 2 detectors built inert + CLAUDE.md refresh

**Stream:** founder.
**Governing frame:** `/adopted/standing-protocol-cache.md` §"Critical-risk sessions" (full Critical Change Protocol) + `/adopted/build-sessions-protocol-cache.md`. PR17 — founder-performed steps walked live, not handed off.
**Tier:** `code-critical` — **Critical** under 0d-ii (deployment-config env-flag + service-token activation on a live API surface + a production `schema` migration; spans code-elevated detector build + governance; highest category governs).
**Date:** 2026-06-08. **Branch:** `main`.
**Operative prompt:** Session 3 of `/operations/pre-launch-completion-plan-2026-06-07.md` (S3 next-session prompt).
**Predecessor closes:** `/operations/handoffs/founder/2026-06-07-prelaunch-S2-otel-activation-close.md` (S2; most recent), `/operations/handoffs/founder/2026-06-06-reconcile-A19-abuse-detection-close.md` (A19 build).

## What this session did

Session 3 of the pre-launch completion plan. **Spine (Critical):** turned A19 abuse-detection on in production — the per-identity request-burst detector that was built, Verified-live on TEST (2026-06-06), and deployed inert. Two founder-performed production changes, walked live (PR17): (1) created the `abuse_signals` table in the **production** Supabase project (`jdbefwkonfbhjquozgxr`); (2) minted a service token, set `SUBSTRATE_ABUSE_DETECTION_ENABLED=true` + `ABUSE_DETECTION_EVAL_TOKEN` for Vercel **Production**, and redeployed. Verified end-to-end against the canonical `www` host: authenticated call → `HTTP:200` with `signals_fired:0`; no-token call → `HTTP:401` (flipped from the pre-activation 503); `abuse_signals` empty (no false positives). A19 reads the `substrate_audit_events` data that S2 activated.

**Fill (AI-doable):** built the two remaining structural detectors — `systematic_enumeration` (breadth: an identity producing a near-unique input size every request) and `rapid_input_variation` (temporal churn: large successive input-size jumps in a burst) — pure, off the structural `masked_context.input_char_count` only (never raw text; R3/R17), behind a new rollout sub-flag (`SUBSTRATE_ABUSE_DETECTION_ROLLOUT_ENABLED`) that stays UNSET in production. Sandbox-verified (22/22 new + 17/17 velocity regression + `tsc` clean + PR2 invocation confirmed); production path byte-identical (sub-flag off → reads `occurred_at` only, runs velocity only). Refreshed the stale `CLAUDE.md` production-state block to current truth.

Two decisions settled at open (founder elected both recommendations): **(1)** dense packing — build the two new detectors inert this session; **(2)** detection-only — A19 records signals, never blocks/rate-limits/revokes. A third (optional) decision: the new detectors' **TEST pass deferred to S4**, bundled with their production rollout.

## Decisions Made
- `D-PRELAUNCH-S3-ABUSE-DETECTION-ACTIVATION-2026-06-08` (**Critical**) appended. Full Critical-Change-Protocol record (6 points), risk classification, rollback path, the canonical-host diagnostic finding, and the founder-performed verification result recorded. Closes the S3 spine.

## Status Changes
| Item | Old | New |
|---|---|---|
| `abuse_signals` (production) | absent | **Live (production)** |
| `SUBSTRATE_ABUSE_DETECTION_ENABLED` (Vercel Production) | UNSET | **set `true`** |
| `ABUSE_DETECTION_EVAL_TOKEN` (Vercel Production) | UNSET | **set** (founder-minted) |
| A19 `request_velocity_anomaly` | Verified-live (TEST); deployed inert (prod) | **Live (production)** |
| A19 `systematic_enumeration` + `rapid_input_variation` | not built | **Wired-inert** (sandbox-verified; behind rollout sub-flag) |
| `CLAUDE.md` production-state block | stale (2026-05-14) | **refreshed (2026-06-08)** |

## Verification Method Used (0c Framework)
- **Database change:** AI supplied the migration SQL + column-check + count queries; founder ran them in the **production** SQL editor (ref `jdbefwkonfbhjquozgxr`, confirmed before running) → "Success. No rows returned."; 12-column table confirmed; `count(*) = 0`. ✅
- **Deployment-configuration change:** AI supplied exact Vercel steps; founder minted the token (`openssl rand -hex 32`; AI never saw it), set both vars (Production only), redeployed → green. ✅
- **API endpoint (live):** authenticated `curl` to `https://www.sagereasoning.com/api/abuse/evaluate` → `HTTP:200`, `detectors_run:["request_velocity_anomaly"]`, `signals_fired:0`; no-token `curl` → `HTTP:401` (was 503 → gate live). `abuse_signals` `count(*)=0`. ✅
- **Detector build (sandbox):** new structural unit tests 22/22 PASS; velocity regression 17/17 PASS; `npx tsc --noEmit` exit 0; PR2 invocation confirmed (grep — both new detectors called on the path behind the rollout sub-flag). ✅ The live TEST data-path proof is deferred to S4 (founder election).

## Risk Classification Record (0d-ii)
- Env-flag + service-token activation on the live deployment: **Critical** (`code-critical`; deployment-configuration). Full Critical Change Protocol applied + walked live (PR17).
- Production migration (additive, idempotent): Elevated on its own; subsumed under Critical.
- Two new detectors (additive; inert behind UNSET sub-flag): Elevated on their own; subsumed under Critical.
- CLAUDE.md refresh + decision-log entry + this close: **Standard** (governance/docs).
- **PR6 not engaged** — A19 reads the substrate's already-produced `substrate_audit_events` rows (occurred_at + agent_id + structural masked_context); it never touches the R20a distress classifier, the A7 Zone-2 gate, or their wrappers (route + detector docstrings confirm the boundary). AC7 not engaged. No auth/session/encryption/access-control change.

## PR5 — Knowledge-Gap Carry-Forward
- No concept required re-explanation this session. Cumulative count: 0.
- New operational fact recorded for future sessions (not a knowledge gap): production is served at `www.sagereasoning.com`; the apex `sagereasoning.com` 307-redirects to `www`. Verification curls must target `www.` so a service-token header is not dropped on a cross-host redirect. Captured in the decision-log entry; the S7 scheduled caller must hit `www.` too.

## Next Session Should
**Session 4 — A11b injection-defence go-live** (per the completion plan). Spine (Critical, you — security): activate `SUBSTRATE_INJECTION_DEFENCE_ENABLED` + verify a benign + a probe input. Fill (AI-doable): the **2-minute production rollout of the two new A19 detectors** (set `SUBSTRATE_ABUSE_DETECTION_ROLLOUT_ENABLED` + verify; the deferred TEST pass folds in here first); draft the R19c limitations page; apply the R19d mirror-principle decision. Pre-conditions: `main` clean + Vercel green; this session's commit pushed.

## Blocked On
**Files remaining uncommitted (commit block in Founder Verification below):**
- `website/src/lib/abuse-detection/abuse-detector.ts`, `abuse-thresholds.ts`, `__tests__/abuse-detector-structural.test.ts` (NEW)
- `website/src/app/api/abuse/evaluate/route.ts`
- `CLAUDE.md`
- `operations/decision-log.md`
- this close + the S3 prompt + the completion plan + the S2 prompt (all docs)

**Production state at session close:** A19 `request_velocity_anomaly` **Live in production** (detection-only); `abuse_signals` **Live (production)** and empty; `SUBSTRATE_ABUSE_DETECTION_ENABLED=true` + `ABUSE_DETECTION_EVAL_TOKEN` set (Production). The two new detectors are **inert in production** (`SUBSTRATE_ABUSE_DETECTION_ROLLOUT_ENABLED` UNSET). `/api/reason` byte-identical; A12 OTel + `substrate_audit_events` Live (S2); GDPR data-rights tables Live (S1); A13 cost-health Live; all four R20a flags `true`; injection-defence / Layer3 / plugin-install-auth / R20a-rendering / R20a-gate flags UNSET. AC7 not engaged.

## Open Questions
- None new. The two new detectors' TEST pass + production rollout are queued for S4. Enforcement (rate-limit/revoke) remains a separate later decision (detection-only standing election).

## Founder Verification (Between Sessions)
First discard the build-cache artifact the type-check touched (not part of the work):
```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
git checkout -- website/tsconfig.tsbuildinfo
```
Then commit the code + docs and push:
```
rm -f .git/index.lock
git add website/src/lib/abuse-detection/abuse-detector.ts \
  website/src/lib/abuse-detection/abuse-thresholds.ts \
  website/src/lib/abuse-detection/__tests__/abuse-detector-structural.test.ts \
  website/src/app/api/abuse/evaluate/route.ts \
  CLAUDE.md \
  operations/decision-log.md \
  operations/handoffs/founder/2026-06-08-prelaunch-S3-abuse-detection-activation-close.md \
  operations/handoffs/founder/2026-06-07-prelaunch-S3-abuse-detection-activation-NEXT-SESSION-PROMPT.md \
  operations/handoffs/founder/2026-06-07-prelaunch-S2-otel-activation-NEXT-SESSION-PROMPT.md \
  operations/pre-launch-completion-plan-2026-06-07.md
git commit -m "Pre-Launch S3: A19 abuse-detection activation (production, detection-only) — created abuse_signals in production (jdbefwkonfbhjquozgxr) + set SUBSTRATE_ABUSE_DETECTION_ENABLED=true + ABUSE_DETECTION_EVAL_TOKEN (Production) + redeployed; authenticated /api/abuse/evaluate -> 200 (0 signals), no-token -> 401 (was 503), abuse_signals empty. request_velocity_anomaly -> Live (production). Built systematic_enumeration + rapid_input_variation inert behind SUBSTRATE_ABUSE_DETECTION_ROLLOUT_ENABLED (22/22 + 17/17 + tsc clean; Wired-inert; TEST pass deferred to S4). CLAUDE.md production-state refreshed. (D-PRELAUNCH-S3-ABUSE-DETECTION-ACTIVATION-2026-06-08)"
```
Then push via GitHub Desktop. **Vercel note:** the activation redeploy already happened in Step 3; pushing the new detector code triggers a Vercel rebuild, but it is a **production behavioural no-op** because the rollout sub-flag (`SUBSTRATE_ABUSE_DETECTION_ROLLOUT_ENABLED`) is UNSET in production — only `request_velocity_anomaly` runs.

**Independent re-verification (any time):**
```
curl -s -w "\nHTTP:%{http_code}\n" -H "x-abuse-detection-token: <TOKEN>" "https://www.sagereasoning.com/api/abuse/evaluate"   # expect HTTP:200, signals_fired 0
curl -s -w "\nHTTP:%{http_code}\n" "https://www.sagereasoning.com/api/abuse/evaluate"                                       # expect HTTP:401
```
And in the production Supabase SQL editor (ref `jdbefwkonfbhjquozgxr`): `select count(*) from public.abuse_signals;` → `0` until real agent traffic produces a burst.

## Orchestration Reminder
The AI has no persistent memory between sessions; these docs are its memory. At the next session open, read this close first, then the pre-launch completion plan, then the S4 predecessor context. The arc: completion plan — S1 (data-rights) ✅, S2 (A12 OTel) ✅, **S3 (A19 abuse-detection) ✅ this session**, S4 (A11b injection-defence + A19 rollout flip), S5 (A10 metering), S6 (R20a rendering), S7 (A14 + A13 delivery), S8 (end-to-end verification + capability inventory → the pre-lawyer readiness gate). Queued behind A19: the two new detectors' TEST pass + production rollout (S4); enforcement (separate later decision); automated signal delivery (S7 Vercel-Cron).

## Cross-references
- `/operations/handoffs/founder/2026-06-07-prelaunch-S2-otel-activation-close.md` (predecessor; S2)
- `/operations/handoffs/founder/2026-06-06-reconcile-A19-abuse-detection-close.md` (A19 build + velocity TEST proof)
- `/operations/pre-launch-completion-plan-2026-06-07.md` (this is its S3)
- Decision log: `D-PRELAUNCH-S3-ABUSE-DETECTION-ACTIVATION-2026-06-08` (+ predecessors `D-A19-ABUSE-DETECTION-VELOCITY-PROOF-2026-06-06`, `D-A19-VELOCITY-VERIFIED-LIVE-2026-06-06`, `D-PRELAUNCH-S2-OTEL-ACTIVATION-2026-06-07`)
- As-built: `website/src/lib/abuse-detection/abuse-detector.ts`, `abuse-thresholds.ts`, `__tests__/abuse-detector-structural.test.ts`, `website/src/app/api/abuse/evaluate/route.ts`; `supabase/migrations/20260606_a19_abuse_signals.sql`

*End of session close. Stabilised to known-good: A19 `request_velocity_anomaly` Live in production (detection-only); two new detectors sandbox-verified + inert behind an unset sub-flag; production `/api/reason` byte-identical; one-flag rollback available (delete `SUBSTRATE_ABUSE_DETECTION_ENABLED` + redeploy → 503); code + docs uncommitted awaiting the founder's commit.*
