# Session Close — 2026-06-03 — A10 Critical Implementation (Per-Install Plugin-Auth Wiring + Revocation Surface)

**Stream:** founder.
**Governing frame:** `/adopted/standing-protocol-cache.md` + `/adopted/build-sessions-protocol-cache.md` ("no current users" holds).
**Tier:** `code-critical` — **Critical** under 0d-ii. AC7 ENGAGED. PR6 ENGAGED. Full Critical Change Protocol completed visibly before any founder-performed step.
**Date:** 2026-06-03. **Branch:** `main`.
**Predecessor close:** `/operations/handoffs/founder/2026-06-03-A10-token-format-scaffold-close.md`.

## What this session did

The Critical implementation following the same-day A10 kickoff. (1) Ran + Verified the `plugin_install` migration on the **TEST** project (7a–7e all pass). (2) Built a **new founder-only admin mint/revoke endpoint** (`/api/admin/plugin-install-credentials`) mirroring the accreditation admin route. (3) **Wired** the Surface-1 per-install credential check into **one** endpoint (`/api/reason`) behind a new **UNSET** flag `PLUGIN_INSTALL_AUTH_ENABLED` — production byte-identical until you flip it. (4) Wrote the **revocation runbook**. All code landed **inert**; nothing deployed with the path active; production byte-identical.

## Decisions Made
- `D-A10-CRITICAL-IMPL-WIRING-REVOCATION-2026-06-03` (Critical) appended. Design-lock elections (a) one-active-per-install unique index; (b) new admin route; (c) flag `PLUGIN_INSTALL_AUTH_ENABLED`; (d) audit `agent_id` reused for `install_id`. Full CCP + R20a-perimeter (Risk 9 / AC5 — no perimeter change) recorded.

## Status Changes
| Item | Old | New |
|---|---|---|
| `plugin_install` migration | Authored, not run | **Verified (TEST project)** |
| A10 admin mint/revoke endpoint | Not started | **Wired + Verified-in-sandbox** (validation 29/29; DB flow pending founder smoke tests) |
| A10 Surface-1 check on `/api/reason` | Verified (library code), unwired | **Wired (behind unset flag) + Verified-in-sandbox** |
| Revocation runbook | Not started | **Live (document)** |
| A10 (overall) | Format decided; one surface proven (library) | **Wired inert; pending TEST smoke tests + production flag-flip to reach Live** |

## Verification Method Used (0c Framework)
- **In-sandbox (this session):** `npx tsx src/lib/__tests__/plugin-install-auth.test.ts` → **22/22**; `npx tsx src/app/api/admin/plugin-install-credentials/__tests__/route.test.ts` → **29/29**; `npx tsc --noEmit` → **exit 0**; PR2 call-path grep → `validatePluginInstallToken` invoked inside the flag-gated branch (`route.ts` ~line 557), not just imported.
- **TEST project (founder-performed, this session):** migration run; VERIFY 7a (4 columns) / 7b (4 constraints) / 7c (2 indexes incl. the unique one) / 7d (purpose admits `plugin_install`) / 7e (0 bad rows) — all matched expected.
- **Pending:** the live mint→authenticate→revoke→401 round-trip in TEST (deferred — you elected commit-inert this session).

## Risk Classification Record (0d-ii)
- Migration edit (step 6b unique index) — additive/idempotent (Standard in isolation), folded into the Critical session.
- New admin mint/revoke endpoint — **Critical** (new auth surface; PR6 + AC7).
- `/api/reason` per-install wiring behind unset flag — **Critical** (auth-surface change; PR6 + AC7); byte-identical while the flag is off.
- Revocation runbook, `.env.example`, decision-log, this close — Standard (governance/docs).

## PR5 — Knowledge-Gap Carry-Forward
- No concept required re-explanation this session. One **process** observation worth noting (not a knowledge gap): the Supabase-target question ("my project or test project?") recurred — the answer is governed by the test-env checklist's "one rule" (TEST project, never production). If this recurs a third time, consider a one-line standing note in the build cache. Cumulative count: 1 (this session).

## Next Session Should
**Your election** — two natural next moves, both unblocked by A10's inert wiring:
- **A10 TEST smoke tests** (close the one pending verification) — stand up / confirm the TEST env per `data-room/04_test_brief/test-env-standup-checklist.md`, mint a per-install credential via the new admin endpoint, set `PLUGIN_INSTALL_AUTH_ENABLED=true` in TEST, and run mint→authenticate→revoke→401. This is the step that moves A10 from "Verified-in-sandbox" to "Verified-live." **Pre-conditions:** TEST project active; the migration is already on it (this session).
- **A11b — prompt-injection defence at Layer 1 + Layer 3** (Critical; ~2h) — the next Stage-1 build item behind A10. **Pre-conditions:** this session's files committed + pushed; Vercel green; A10 wiring confirmed inert.
- **A12 — OpenTelemetry GenAI instrumentation** (Elevated) is also available; F4 (AC10/AP2 alignment) folds in at A12 per the findings tracker.

Recommendation: do the **A10 TEST smoke tests** before A11b, so A10 is fully Verified-live before the next layer is built on it (PR1/PR2 discipline). But the call is yours.

## Blocked On
**Files remaining uncommitted (commit commands below):**
- `website/supabase-api-keys-plugin-install-migration.sql`
- `website/src/app/api/admin/plugin-install-credentials/route.ts`
- `website/src/app/api/admin/plugin-install-credentials/validation.ts`
- `website/src/app/api/admin/plugin-install-credentials/__tests__/route.test.ts`
- `website/src/app/api/reason/route.ts`
- `website/.env.example`
- `operations/runbooks/plugin-install-credential-revocation.md`
- `operations/decision-log.md`
- `operations/handoffs/founder/2026-06-03-A10-critical-implementation-close.md`

**Production state at session close:** **UNCHANGED / byte-identical.** No flag flipped, nothing deployed with the per-install path active. `PLUGIN_INSTALL_AUTH_ENABLED` UNSET; `PLUGIN_AUTH_ENABLED` UNSET; all four R20a flags `true`; `SUBSTRATE_LAYER3_ENABLED` UNSET (503); `SUBSTRATE_WRITE_PATH_ENABLED` `true` (untouched). The `plugin_install` migration is on **TEST only** — not on production (by design). AC7 engaged in code; not engaged in production behaviour (flag off).

## Open Questions
- Surface 2 (W3C-VC/AP2 portable envelope) — deferred under PR7 (unchanged).
- Production flag-flip + retiring `PLUGIN_AUTH_SECRET` — deferred; each its own future step (migration re-run on production + ≥1 minted credential + CCP).
- TEST smoke tests — the remaining verification before A10 is Live-ready.

## Founder Verification (Between Sessions)
You can re-run the in-sandbox checks on your machine (optional):
```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/website"
npx tsx src/lib/__tests__/plugin-install-auth.test.ts                                  # expect: 22 passed, 0 failed
npx tsx src/app/api/admin/plugin-install-credentials/__tests__/route.test.ts           # expect: 29 passed, 0 failed
npx tsc --noEmit                                                                        # expect: no output, exit 0
```
Then commit + push (no Vercel behaviour change — the per-install path is gated by an unset flag):
```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
git add "website/supabase-api-keys-plugin-install-migration.sql" \
        "website/src/app/api/admin/plugin-install-credentials/route.ts" \
        "website/src/app/api/admin/plugin-install-credentials/validation.ts" \
        "website/src/app/api/admin/plugin-install-credentials/__tests__/route.test.ts" \
        "website/src/app/api/reason/route.ts" \
        "website/.env.example" \
        "operations/runbooks/plugin-install-credential-revocation.md" \
        operations/decision-log.md \
        "operations/handoffs/founder/2026-06-03-A10-critical-implementation-close.md"
git commit -m "A10 Critical impl: per-install plugin-auth wired into /api/reason behind UNSET flag (PLUGIN_INSTALL_AUTH_ENABLED) + new admin mint/revoke endpoint + revocation runbook; plugin_install migration Verified on TEST. Inert; production byte-identical. (D-A10-CRITICAL-IMPL-WIRING-REVOCATION-2026-06-03)"
```
Then push via GitHub Desktop. Vercel rebuilds; behaviour is byte-identical (the per-install path is gated by an unset flag).

**Independent verification after push:** Vercel deploy goes green; `/api/reason` behaves exactly as before for web/API-key callers (the new flag is unset). No `/api/admin/plugin-install-credentials` calls are expected (no credentials minted; founder-only).

## Orchestration Reminder
A10's identity work is now built and inert. The one remaining verification is the **TEST live smoke test** (mint→authenticate→revoke→401) — do that before, or as the opening of, the next build session so A10 is Verified-live before A11b/A12 build on it. The production flag-flip is a separate, later, Critical step (migration re-run on production + a minted credential + CCP) — do not bundle it with anything. The shared-secret `PLUGIN_AUTH_SECRET` path stays as the fallback until the per-install path is Verified-live and you elect to retire it.

## Cross-references
- Decision log: `D-A10-CRITICAL-IMPL-WIRING-REVOCATION-2026-06-03`
- Predecessor close: `/operations/handoffs/founder/2026-06-03-A10-token-format-scaffold-close.md`
- ADR: `/adopted/adr/2026-06-03-a10-token-format.md` (Surface 1)
- Runbook: `/operations/runbooks/plugin-install-credential-revocation.md`
- Staging plan: `/adopted/substrate-plugin-staging-plan.md` §A10 + Risk 9
- Test-env checklist (for the smoke-test session): `/data-room/04_test_brief/test-env-standup-checklist.md`

*End of session close. Stabilised to a known-good state — production byte-identical to session open; the per-install path is wired but gated by an unset flag; the migration is Verified on TEST. A10 is one TEST smoke-test away from Verified-live.*
