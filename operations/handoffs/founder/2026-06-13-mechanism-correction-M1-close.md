# Session Close — 2026-06-13 — Mechanism-Correction M1: consult-path levers (CI-1 + CI-17, CI-2 + CI-3 riding)

**Stream:** founder.
**Governing frame:** `/adopted/standing-protocol-cache.md` + `/adopted/build-sessions-protocol-cache.md` (PR1–PR18).
**Tier:** `code-elevated` — Elevated risk; Critical guards held throughout (no R20a/A5/zone/auth file modified — diff- and invocation-verified). Schema portion Standard (idempotent additive; TEST only).
**Environment:** Claude Code on the founder's machine; TEST Supabase (`iwdtrvuphogkwmovhnvz`) via `.env.development.local` (standing TEST-run process — deliberately used over the prompt's re-point-`.env.local` instruction; same isolation, production env file untouched). Model: Fable 5, maximum reasoning effort.
**Date:** 2026-06-13 (probes 2026-06-12 UTC evening).

## Decisions Made

- `D-MECHANISM-CORRECTION-M1-CONSULT-PATH-BUILT-VERIFIED-2026-06-13` appended (+36 lines). M1 built + TEST-Verified under the approved plan and the founder's five in-session design elections (approved in full, in-chat).

## What this session did

1. Opened under the M1 prompt (full Part A read order; pre-conditions verified; an adversarial verification workflow confirmed the platform facts, the distress boundary, and the R17b data-sensitivity evidence before elections).
2. **Step 1:** five design elections presented with what-could-break + rollback; founder approved in full.
3. **Step 2 (founder, walked):** `substrate_audit_narratives` migrated on TEST; structure + idempotence confirmed.
4. **Steps 3–6:** CI-1 + CI-17 + CI-2 built flag-gated; CI-3 docs staged (R18 — nothing public changed); `@vercel/functions` added.
5. **Step 7:** tsc clean; 45/45 new assertions + regression suites green; live TEST leg: deferred consult **4.3s vs 33.1s** raw baseline (deep 3.1s / quick 3.8s); **11/11 examinations retained** (7 inline / 3 deferred-via-waitUntil / 1 sweep-completed); distress probe → acute redirect 1.2s, deferral structurally ignored, no narrative row; malformed schema → A2 400; sweep 401s without secret; A12 rows carry `narrative_status`; deferred L3 cost on the narrative row, billing ledger untouched; TEST key minted → used → retired → negative-auth verified.

## Status Changes

| Item | Old | New |
|---|---|---|
| CI-1 (L3 deferral + retention) | Approved | **Verified (TEST)** — production inert, flag unset |
| CI-17 (narrative-existence guarantee) | Approved | **Verified (TEST)** — all three generation modes proved; manifest-rule candidate flagged, not authored |
| CI-2 (layer1_schema on API-key path) | Approved | **Verified (TEST)** — production inert, flag unset |
| CI-3 (depth as honest latency tier) | Approved | **Measured (TEST-labelled)** — envelopes staged for activation docs |
| `substrate_audit_narratives` | — | **Live (TEST only)**; production migration deferred to activation |
| `/api/cron/narrative-sweep` | — | **Wired** — deploys secret-gated + inert (flag unset; no vercel.json entry) |

## Next Session Should

**M2 — mint session (CI-6 + CI-7)** per the approved queue: prompt at `operations/handoffs/founder/2026-06-13-mechanism-correction-M2-mint-session-NEXT-SESSION-PROMPT.md`. Elevated (CI-6 billing-adjacent) + Standard (CI-7 admin surface); est. 2–3h. **Independently, the founder may elect the M1 activation step at any time** (0c-ii, its own session or walked block): production migration + both flags + vercel.json cron (hourly) + Fluid-compute dashboard check + staged-docs application + privacy-page sentence.

## Blocked On

**Files remaining uncommitted (stage BY NAME — never `.env*`, never `tsconfig.tsbuildinfo`):**
- `supabase/migrations/20260612_m1_substrate_audit_narratives.sql`
- `website/src/lib/substrate/narrative-retention.ts`
- `website/src/lib/substrate/__tests__/narrative-retention.test.ts`
- `website/src/lib/substrate/substrate-audit-writer.ts`
- `website/src/lib/translation-sandwich/parallel-run.ts`
- `website/src/lib/translation-sandwich/__tests__/prose-deferral.test.ts`
- `website/src/app/api/reason/route.ts`
- `website/src/app/api/cron/narrative-sweep/route.ts`
- `website/package.json`, `website/package-lock.json`
- `operations/p1-rebuild-2026-06/m1-docs-staged-for-activation.md`
- `operations/handoffs/founder/2026-06-13-mechanism-correction-M1-close.md` (this file)
- `operations/handoffs/founder/2026-06-13-mechanism-correction-M2-mint-session-NEXT-SESSION-PROMPT.md`
- `operations/decision-log.md`
- `CLAUDE.md`

**Production state at session close (2026-06-13):** per PR18 — production untouched this session: no flag set, no production migration, no public-doc change. Pushing the commit deploys code that is byte-identical with the flags unset (test-asserted); the new sweep route deploys CRON_SECRET-gated and reports `flag_enabled: false`. All previously-Live surfaces unchanged (R20a ×4 true; A10/A11b/A12/A13/A14/A19/GDPR Live; Layer 3 + R20b inert; Stripe `not_configured`). 0h: HELD — unchanged.

## Open Questions

- M1 activation (founder-elected 0c-ii): the six-item checklist in the decision-log entry.
- CI-17 manifest-rule candidate (R18f-parallel "no examination credential over verdict-only assessments") — separate governance election.
- `layer2-signer.test.ts` + `layer2-canonical-json.test.ts` are Jest-style (pre-existing; don't run under plain tsx) — test-ergonomics candidate alongside the `supabase-server.ts` eager-construction note from 2026-05-15.
- Retired-key wire shape on `/api/reason` is 401 not 403 (combined auth branch returns the user-auth error; pre-existing) — cosmetic; note for any future auth-UX pass.
- TEST teardown second half (founder): remove the M1 env block; test keys + 11 TEST narrative rows + retired key row may stay in the test project or be cleared at the next TEST session.
- Carried: transcript deletion (owed); accreditation seed-row disposition; the 0h call.

## Founder Verification

```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/website"
npx tsc --noEmit
npx tsx src/lib/substrate/__tests__/narrative-retention.test.ts
npx tsx src/lib/translation-sandwich/__tests__/prose-deferral.test.ts
```
Expected: tsc silent; `19 passed, 0 failed`; `26 passed, 0 failed`. (Both new tests run with plain `npx tsx` — no `--env-file` needed.)

Commit block: see the in-chat close walkthrough (stage by name; push via GitHub Desktop; Vercel deploys flag-unset inert code — expect green, byte-identical behaviour).

## Cross-references

- `operations/handoffs/founder/2026-06-12-mechanism-correction-M1-consult-path-build-NEXT-SESSION-PROMPT.md` (this session's operative prompt)
- `operations/handoffs/founder/2026-06-12-sage-practice-grounding-close.md` (+ both addenda) (predecessor)
- `operations/p1-rebuild-2026-06/mechanism-correction-build-plan.md` (approved plan; CI-1/2/3/17)
- `operations/p1-rebuild-2026-06/m1-docs-staged-for-activation.md` (staged docs + measured envelopes)
- Decision log: `D-MECHANISM-CORRECTION-M1-CONSULT-PATH-BUILT-VERIFIED-2026-06-13`
- M2 prompt: `operations/handoffs/founder/2026-06-13-mechanism-correction-M2-mint-session-NEXT-SESSION-PROMPT.md`

*End of session close. Stabilised: the practice's largest structural overhead is corrected and TEST-proven (deferred consults ~3–4s with the narrative guaranteed, retained, encrypted, and 90-day-bounded); production stays inert until the founder's own activation election.*
