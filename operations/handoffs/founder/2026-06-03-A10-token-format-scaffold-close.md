# Session Close — 2026-06-03 — A10 Stage-1 Kickoff (Token-Format ADR + Surface-1 Scaffold)

**Stream:** founder.
**Governing frame:** `/adopted/standing-protocol-cache.md` + `/adopted/build-sessions-protocol-cache.md` ("no current users" holds).
**Tier:** `code-critical` **by surface** (A10 is auth); **Standard by what actually changed this session** — design + ADR + an inert library scaffold. **No code wired into a route; nothing deployed; production byte-identical.** AC7 named, NOT engaged. PR6 not engaged.
**Date:** 2026-06-03. **Branch:** `main`.
**Predecessor close:** `/operations/handoffs/founder/2026-06-03-0h-criterion1-live-test-close.md`.

## What this session did

Opened A10 (per-install plugin-auth credentials), the identity keystone the rest of Stage 1 (A11/A12/A13/A15a/A19) depends on. (1) Recorded your call that 0h criterion 1 is MET for the Stage-1 dependency. (2) Reconciled A10 scope against live code — the 2026-05-21 foundation built the credential *mechanism* on the accreditation write path; the plugin-auth surface still uses the single shared `PLUGIN_AUTH_SECRET`. (3) Drafted the token-format ADR; you elected the **Hybrid**. (4) Built and Verified the Surface-1 credential logic as library code (PR1), proven without touching `/api/reason`.

## Decisions Made
- `D-0H-CRITERION1-MET-STAGE1-DEPENDENCY-2026-06-03` (Standard) — 0h criterion 1 founder-determined MET for the Stage-1 dependency.
- `D-A10-TOKEN-FORMAT-ADR-AND-SCAFFOLD-2026-06-03` (Standard) — scope reconciliation + token-format ADR adoption + Surface-1 scaffold Verified (library).
- ADR `adopted/adr/2026-06-03-a10-token-format.md` **Accepted** — hybrid: opaque bearer for internal plugin-auth now; W3C-VC/AP2-mandate envelope for the portable carried-profile deferred under PR7.

## Status Changes
| Item | Old | New |
|---|---|---|
| A10 token format | Open question (staging-plan Q1) | **Decided** (ADR Accepted) |
| A10 Surface-1 per-install credential logic | Not started | **Verified (library code)** — not wired, not deployed |
| A10 (overall) | Not started | **In progress** (format decided; one surface proven) |
| 0h exit criterion 1 (Stage-1 dependency) | advanced | **MET** (founder call) |

## Verification Method Used (0c Framework)
- **Library logic:** `npx tsx src/lib/__tests__/plugin-install-auth.test.ts` → **22 passed, 0 failed**; `npx tsc --noEmit` → **exit 0**; PR2 call-path grep → the functions are invoked by the test and **no route imports the module** (`/api/reason` untouched). Run in the session sandbox.
- **Migration:** authored, **not run** — founder runs it at the implementation session under CCP.

## Next Session Should
**A10 Critical implementation + revocation surface (staging-plan session 12).** Wire the Surface-1 credential check into one plugin-auth endpoint (replacing `PLUGIN_AUTH_SECRET` behind a new unset flag so production stays byte-identical until you flip it), build the admin revocation API + the revocation runbook, and run the migration. This is **code-critical (AC7 + PR6)** — the full Critical Change Protocol runs visibly before any deploy. **Pre-conditions:** this session's four files committed; the ADR + scope delta as the operative spec; `ADMIN_USER_ID` confirmed set; production state confirmed unchanged.

## Blocked On
**Files remaining uncommitted (commit commands below):**
- `adopted/adr/2026-06-03-a10-token-format.md`
- `website/src/lib/plugin-install-auth.ts`
- `website/supabase-api-keys-plugin-install-migration.sql`
- `website/src/lib/__tests__/plugin-install-auth.test.ts`
- `operations/decision-log.md`
- `operations/handoffs/founder/2026-06-03-A10-token-format-scaffold-close.md`

**Production state at session close:** **UNCHANGED.** No code wired to a route, no migration run, no env/flag change. All four R20a flags `true`; `SUBSTRATE_LAYER3_ENABLED` UNSET (503); `SUBSTRATE_WRITE_PATH_ENABLED` `true` (accreditation surface Live, untouched this session); `/api/reason` byte-identical. AC7 not engaged. The new module is imported by nothing.

## Open Questions
- Surface 2 (W3C-VC/AP2-mandate portable envelope) — deferred under PR7 until a real portable-agent consumer exists.
- Revocation **runbook** (mirroring the A4 rotation runbook) — Not started; A10 implementation-session item.
- `install_id` uniqueness policy + admin mint-endpoint extension vs new endpoint — deferred to the implementation-session design.

## Founder Verification (Between Sessions)
You can re-run the in-session checks on your machine (optional):
```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/website"
npx tsx src/lib/__tests__/plugin-install-auth.test.ts     # expect: 22 passed, 0 failed
npx tsc --noEmit                                           # expect: no output, exit 0
```
Then commit + push (no Vercel behaviour change — new files are imported by nothing):
```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
git add "adopted/adr/2026-06-03-a10-token-format.md" \
        "website/src/lib/plugin-install-auth.ts" \
        "website/supabase-api-keys-plugin-install-migration.sql" \
        "website/src/lib/__tests__/plugin-install-auth.test.ts" \
        operations/decision-log.md \
        "operations/handoffs/founder/2026-06-03-A10-token-format-scaffold-close.md"
git commit -m "A10 kickoff: token-format ADR (hybrid) + Surface-1 per-install credential scaffold (Verified, library-only; no route wired). 0h criterion 1 MET for Stage-1 dependency. (D-A10-TOKEN-FORMAT-ADR-AND-SCAFFOLD-2026-06-03)"
```
Then push via GitHub Desktop. Vercel rebuilds but behaviour is byte-identical (nothing imports the new module).

## Cross-references
- Decision log: `D-A10-TOKEN-FORMAT-ADR-AND-SCAFFOLD-2026-06-03`; `D-0H-CRITERION1-MET-STAGE1-DEPENDENCY-2026-06-03`
- ADR: `/adopted/adr/2026-06-03-a10-token-format.md`
- Foundation reused: `/operations/handoffs/founder/2026-05-21-A10-build-close.md`; `D-ATL-A10-BUILD-WIRED-VERIFIED-2026-05-21`
- K1 ADR: `/adopted/adr/2026-05-26-credential-scope-and-coverage-status.md`
- Staging plan: `/adopted/substrate-plugin-staging-plan.md` §A10 + Open-question 1 + Risk 9
- Kickoff prompt: `/operations/handoffs/founder/2026-06-03-A10-stage1-kickoff-NEXT-SESSION-PROMPT.md`

*End of session close. Stabilised to a known-good state — production byte-identical to session open; nothing deployed. Token format decided (hybrid); Surface-1 credential logic Verified as library code; the Critical route-wiring + revocation surface is the next session under the full Critical Change Protocol.*
