# Session Close — 2026-05-31 — R20a Journal Distress Check (gap #4)

**Stream:** founder.
**Governing frame:** `/adopted/standing-protocol-cache.md` + `/adopted/build-sessions-protocol-cache.md` ("no current users" holds — founder + test logins only).
**Tier:** `code-critical` — **Critical** risk. Full Critical Change Protocol (0c-ii) completed in chat before code; founder approved "Go ahead" specific to the named risks. PR6 + AC5 + PR3 + PR17 engaged.
**Date:** 2026-05-31.
**Branch:** `main`.
**Predecessor close:** `/operations/handoffs/founder/2026-05-31-r17b-realtime-journal-encryption-close.md`.

## What this session did

Closed the gap-#4 deviation (`D-CAPABILITY-GAPS-4-5-ASSESSED-2026-05-30`): both journal routes now screen human free-text through the two-stage distress classifier **before storing**. `/api/mentor/journal-feed` screens the three fields (impression + assent + action) joined; `/api/journal` screens `reflection_text` with the `__local__` local-storage sentinel excluded. Each uses the canonical route-level pattern `await enforceDistressCheck(detectDistressTwoStage(...))`; on moderate/acute distress the route returns `{ distress_detected, severity, redirect_message }` at HTTP 200 and does not store the entry. Both routes added to the AC5 perimeter registry (ninth/tenth route-level members). Wired journal-feed first (single-route proof), then journal (PR1 nuance). Additive request-path change; **no schema change**. Statically Verified; live TEST run is the founder's optional next step.

## Decisions Made

- `D-R20A-JOURNAL-DISTRESS-CHECK-2026-05-31` appended (full Critical form) — CCP record, screened-fields election, `__local__` exclusion, gate-before-encryption ordering on journal-feed, registry addition, static verification, rollback.

## Status Changes

| Item | Old | New |
|---|---|---|
| `/api/mentor/journal-feed` distress coverage | none (significant gap, LC#10) | **screened before store** (Wired + statically Verified) |
| `/api/journal` distress coverage | none (significant gap, LC#10) | **screened before store** (Wired + statically Verified) |
| R20a perimeter (AC5) | 8 route-level + 2 substrate-gate | **10 route-level + 2 substrate-gate** |
| LC#10 for the journal | unmet | **closes on deploy** |

## Verification Method Used (0c Framework)

- **API endpoint / code:** `npx tsc --noEmit` in `website/` → **EXIT 0**. Per-route tests → **11/11 pass each** (`npx tsx src/app/api/mentor/journal-feed/__tests__/r20a-invocation.test.ts` and `.../journal/__tests__/r20a-invocation.test.ts`). PR2 call-path grep confirms `await enforceDistressCheck(detectDistressTwoStage(` on the POST path of both routes (not import-only).
- **Registry (AC5):** both routes present in `HUMAN_FACING_POST_ROUTES`; reminder assertion updated to `>= 10`.
- **Honest limitation:** the Jest-style `r20a-invocation-guard.test.ts` has no runner in this repo (pre-existing "Jest config" backlog gap; fails under `tsx` with `describe is not defined`). Registry is updated and `tsc` type-checks the file; the runnable invocation proof is the two per-route tsx tests.

## Risk Classification Record (0d-ii)

- R20a distress-perimeter addition to two existing routes — **Critical** (PR6 + AC5). CCP completed visibly before approval. PR3 engaged (synchronous, awaited). KG1 engaged (DB writes unchanged; the gate adds no write). No schema change. AC7 not engaged.

## PR5 — Knowledge-Gap Carry-Forward

- No concept required re-explanation this session. The R20a route-level pattern was applied directly from the `/api/score` precedent + cache AC1 row; KG2 (Haiku reliability boundary) applied from the cache. No recurrence logged.

## Next Session Should

Two carried-forward Critical follow-ups remain — **founder's pick** (each its own CCP session):

1. **First R20a production activation** — flip one R20a flag ON in Vercel (CCP + PR17; walked through live).
2. **Batch-encrypt the three lower-severity plaintext tables** (`mentor_interactions`, `mentor_observations_structured`, `mentor_journal_refs`) — now batchable since the single-table encryption proof landed (PR1).

Optionally first: the **journal distress live TEST run** for this session's change (submit a benign entry → stores; a distress-phrasing entry → redirects, not stored), walked through step by step per PR17.

## Blocked On

**Files remaining uncommitted (commit commands below):**
- `website/src/app/api/mentor/journal-feed/route.ts`
- `website/src/app/api/journal/route.ts`
- `website/src/lib/__tests__/r20a-invocation-guard.test.ts`
- `website/src/app/api/mentor/journal-feed/__tests__/r20a-invocation.test.ts`
- `website/src/app/api/journal/__tests__/r20a-invocation.test.ts`
- `operations/decision-log.md`
- `operations/handoffs/founder/2026-05-31-r20a-journal-distress-check-close.md`

**Production state at session close:** **UNCHANGED — nothing deployed.** Code is staged (uncommitted) in the working tree. No schema change. The four R20a flags remain UNSET (untouched); `/api/reason` byte-identical; `/api/substrate/layer3` → 503; `/api/public-key` steady-state. On deploy, the two journal routes begin screening immediately (always-on; flag-independent). AC7 not engaged.

## Open Questions

- None blocking. Carried forward: `/api/score` single-field coverage (minor — `action` only); the Jest-runner gap; the manifest R17c "503 stub" drift; `mentor_profiles` schema-drift (governance pass).

## Founder Verification (Between Sessions)

Static re-check (optional, in `website/` — run one line at a time):
```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/website"
npx tsc --noEmit
npx tsx src/app/api/mentor/journal-feed/__tests__/r20a-invocation.test.ts
npx tsx src/app/api/journal/__tests__/r20a-invocation.test.ts
grep -n "await enforceDistressCheck(detectDistressTwoStage(" src/app/api/journal/route.ts src/app/api/mentor/journal-feed/route.ts
```
Expected: `tsc` EXIT 0; each test `11/11 pass`; the grep shows one awaited gate call in each route.

Then commit + push:
```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
git add website/src/app/api/mentor/journal-feed/route.ts \
        website/src/app/api/journal/route.ts \
        website/src/lib/__tests__/r20a-invocation-guard.test.ts \
        website/src/app/api/mentor/journal-feed/__tests__/r20a-invocation.test.ts \
        website/src/app/api/journal/__tests__/r20a-invocation.test.ts \
        operations/decision-log.md \
        "operations/handoffs/founder/2026-05-31-r20a-journal-distress-check-close.md"
git commit -m "R20a: distress-screen both journal routes before store (gap #4). /api/mentor/journal-feed screens impression+assent+action joined (gate before encryption); /api/journal screens reflection_text (__local__ excluded); canonical enforceDistressCheck(detectDistressTwoStage(...)) pattern; AC5 ninth/tenth-route perimeter registry updated; per-route tsx tests 11/11 each; tsc EXIT 0. Additive, no schema change. (D-R20A-JOURNAL-DISTRESS-CHECK-2026-05-31)"
```
Then push via GitHub Desktop. **This is additive request-path code — pushing it makes the journal routes start screening immediately on the next Vercel deploy.** No migration. The change is reversible via `git revert <sha>` + push.

## Orchestration Reminder

No schema change this session — so unlike the R17b ship, there is no migrate-before-push ordering concern. Push when ready; the screening goes live on the next Vercel build. If you want to confirm behaviour first, do the TEST live run (live, step by step — PR17) before pushing to production.

## Cross-references

- Decision log: `D-R20A-JOURNAL-DISTRESS-CHECK-2026-05-31`
- Predecessor close: `/operations/handoffs/founder/2026-05-31-r17b-realtime-journal-encryption-close.md`
- Source assessment: `D-CAPABILITY-GAPS-4-5-ASSESSED-2026-05-30` (gap-#4 coverage map)
- Pattern precedent: `website/src/app/api/score/route.ts`; manifest §AC5 (ninth-route protocol)

*End of session close. Journal distress screening Wired + statically Verified (tsc EXIT 0; 22/22 across both per-route tests; PR2 call-path confirmed). Production UNCHANGED; nothing deployed. Next: deploy + optional live TEST, then an R20a production activation or the plaintext-table encryption batch — founder's pick.*
