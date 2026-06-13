# Session Close — 2026-06-13 — Mechanism-Correction M2: mint session (CI-6 + CI-7)

**Stream:** founder.
**Governing frame:** `/adopted/standing-protocol-cache.md` + `/adopted/build-sessions-protocol-cache.md` (PR1–PR18).
**Tier:** `code-elevated` (CI-6 — existing route behaviour, billing-adjacent) + `code-standard` (CI-7 — new admin-gated module). Critical guards held throughout (no auth-surface/R20a/A5/zone change — adversarially diff-verified; the founder-JWT gate REUSED, not modified).
**Environment:** Claude Code on the founder's machine; TEST Supabase (`iwdtrvuphogkwmovhnvz`) via `.env.development.local`; production touched only by founder-performed SQL-editor actions (the key review). Model: Fable 5, maximum reasoning effort.
**Date:** 2026-06-13.

## Decisions Made

- `D-MECHANISM-CORRECTION-M2-MINT-SESSION-BUILT-VERIFIED-2026-06-13` appended. CI-6 + CI-7 built and Verified under the approved plan and two in-session founder elections (CI-7 CLI form; key-review verdicts retire ×2 / tombstone ×1).

## What this session did

1. Opened under the M2 prompt (full Part A read order; pre-conditions verified: M1 commit `6abbb2f` pushed, tsc clean, TEST env standing).
2. **CI-6:** route defaults 667/50/20 → `API_KEY_FREE_TIER_DEFAULTS` (30/1/1, matched to `api/api-keys-schema.sql` — note: the prompt's `website/` path was wrong); drift-proof test (schema-parity + no-667, 8/8).
3. **CI-7 (founder-elected CLI):** `scripts/mint-credential.ts` + pure core; all three credential classes; `purpose` baked + route-validator pre-validation; per-surface revocation verbs; key shown once. PF-1 prompt-pack defects amended at source.
4. **Adversarial verification workflow** (4 reviewers) pre-founder: caught one real blocker (list read fields the `api_key_usage_current` view doesn't serve) → fixed (prefix-derived class, `api_key_id` mapping, revoke class-guard, target-origin echo) → independently re-verified fixed. Blast-radius riders: harness drift triple retired; `ai-agent-guide`/`README`/`STATUS-REVENUE-MODEL` corrected; runbook points at the CLI.
5. **Founder legs (PR17, walked live):** production key review — Query A: 1 row (leg-B guardrail, inactive → tombstone annotated); Query B: 2 active M1-CP6 cutover test rows at 100/100/1 → retired; verify query: **zero active over-provisioned ecosystem keys**. TEST live leg — list → mint (**record showed 30/1/1**) → `/api/reason` 200 → CLI revoke (class-guard exercised) → negative-auth **401**. Zero browser-console use; the only failure was an env-file password typo, diagnosed structurally and fixed (no mint/revoke call ever failed or retried).

## Status Changes

| Item | Old | New |
|---|---|---|
| CI-6 (mint-defaults drift fix) | Approved | **Verified** (TEST live + production key review complete; goes Live on push) |
| CI-7 (mint UX — CLI form) | Approved | **Verified** (TEST walkthrough; repo script, nothing deploys) |
| Over-provisioned-keys review | Open (M2 prompt Step 1) | **Complete** (2 retired, 1 tombstone, zero active remain) |
| PF-1 prompt-pack defects | Open (leg-B close) | **Corrected** (dated amendments + CLI supersedes hand-composed bodies) |
| F12 fix-vehicle open question (leg-B close) | Open | **Resolved** (this session was the vehicle) |
| `api_key_usage_current` list contract | — | CLI maps the real view shape (`api_key_id`; class from `key_prefix`) — view unchanged |

## Next Session Should

**M3 — accreditation session (CI-11 + CI-12, + the CI-4 write-boundary half if elected)** per the approved queue: prompt at `operations/handoffs/founder/2026-06-13-mechanism-correction-M3-accreditation-NEXT-SESSION-PROMPT.md`. Schema (Standard additive) + Elevated on a Live trust surface; **Critical-check at the R18f seam**. Est. 2.5–3.5h. **Independently, the founder may elect the M1 activation step at any time** (0c-ii checklist in the M1 decision-log entry).

## Blocked On

**Files remaining uncommitted (stage BY NAME — never `.env*`, never `tsconfig.tsbuildinfo`):**
- `website/src/lib/api-key-defaults.ts`
- `website/src/lib/__tests__/api-key-defaults.test.ts`
- `website/src/lib/admin-mint/mint-credential-core.ts`
- `website/src/lib/admin-mint/__tests__/mint-credential-core.test.ts`
- `website/scripts/mint-credential.ts`
- `website/src/app/api/admin/api-keys/route.ts`
- `website/scripts/whole-system-harness/mint-test-credentials.ts`
- `docs/ai-agent-guide.md`
- `README.md`
- `business/STATUS-REVENUE-MODEL.md`
- `operations/runbooks/plugin-install-credential-revocation.md`
- `operations/handoffs/founder/2026-06-11-P1-comparison-harnessed-leg-NEXT-SESSION-PROMPT.md`
- `operations/handoffs/founder/2026-06-13-mechanism-correction-M2-mint-close.md` (this file)
- `operations/handoffs/founder/2026-06-13-mechanism-correction-M3-accreditation-NEXT-SESSION-PROMPT.md`
- `operations/decision-log.md`
- `CLAUDE.md`

**Production state at session close (2026-06-13):** per PR18 — two production changes this session, both founder-approved: (1) data only, founder-performed in the SQL editor — two M1-CP6 cutover test keys retired (`is_active=false` + reason), the leg-B guardrail tombstone annotated; zero active over-provisioned ecosystem keys remain; no schema change. (2) **Pushing this commit changes admin-mint behaviour: newly minted `sr_live_` keys default 30/1/1 (the approved CI-6 fix; admin-gated, founder-only caller). Everything else byte-identical** — no flag, no migration, no public-served-materials change (the corrected docs are repo files, not served pages). All previously-Live surfaces unchanged (R20a ×4 true; A10/A11b/A12/A13/A14/A19/GDPR Live; M1 levers inert, flags unset; Layer 3 + R20b inert; Stripe `not_configured`). 0h: HELD — unchanged.

## Open Questions

- `/api/keys` self-service mints 100/100/1; terms page says "100 calls per month" vs adopted 30/1/1 + llms.txt "30 loops/month" — founder decision (fold or record as intentional). Surfaced by the M2 blast-radius review; pre-existing.
- api-keys PATCH: no `credential_audit` write, no purpose filter (CLI class-guard mitigates client-side) — M3 candidate for route-side audit symmetry.
- `.env.example` census (S7b) stale by four CLI-local `MINT_CLI_*` vars.
- TEST teardown: remove `MINT_CLI_ADMIN_EMAIL`/`MINT_CLI_ADMIN_PASSWORD` per the standing process (founder election; the new TEST admin user + `ADMIN_USER_ID` may stay as standing TEST contents).
- Carried from M1: activation election (0c-ii checklist); CI-17 manifest-rule candidate; Jest-style signer tests ergonomics; 401-vs-403 wire shape; transcript deletion (owed); accreditation seed-row disposition; the 0h call.

## Founder Verification

```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/website"
npx tsc --noEmit
npx tsx src/lib/__tests__/api-key-defaults.test.ts
npx tsx src/lib/admin-mint/__tests__/mint-credential-core.test.ts
```
Expected: tsc silent; `8 passed, 0 failed`; `44 passed, 0 failed`. (Both new tests run with plain `npx tsx` — no `--env-file` needed.)

Commit: stage the files above by name; push via GitHub Desktop. Vercel deploys the CI-6 defaults change (intended) — everything else behaviourally identical; expect green.

## Cross-references

- `operations/handoffs/founder/2026-06-13-mechanism-correction-M2-mint-session-NEXT-SESSION-PROMPT.md` (this session's operative prompt)
- `operations/handoffs/founder/2026-06-13-mechanism-correction-M1-close.md` (predecessor)
- `operations/p1-rebuild-2026-06/mechanism-correction-build-plan.md` (approved plan; CI-6/CI-7)
- Decision log: `D-MECHANISM-CORRECTION-M2-MINT-SESSION-BUILT-VERIFIED-2026-06-13`
- M3 prompt: `operations/handoffs/founder/2026-06-13-mechanism-correction-M3-accreditation-NEXT-SESSION-PROMPT.md`

*End of session close. Stabilised: every newly minted key carries the adopted 30/1/1; no active over-provisioned production key remains; the founder mints, lists, and revokes through a real surface with zero console paste-work; the onboarding funnel's demonstrated error class is gone before any P1 re-engagement.*
