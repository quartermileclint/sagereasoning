# Session Close — 2026-05-27 — Combination 2: No-Practice Disclaimer

**Stream:** founder.
**Governing frame:** `/adopted/standing-protocol-cache.md` + `/adopted/build-sessions-protocol-cache.md` ("no current users" holds).
**Tier:** `governance` — **Standard** risk. Additive copy on four surfaces + test scaffolding. **No production code path, schema, env, or deploy touched.** Critical Change Protocol NOT engaged. PR6 NOT engaged.
**Date:** 2026-05-27.
**Branch:** `main` (AI did no git operations).

## What this session did

Session 1 of the v2 sequence. Authored the **no-practice disclaimer** and placed it verbatim on all four offer/description surfaces, then built `run-comb2.ts` to assert it — completing **Combination 2**, the last negative-scenario coverage gap (the matrix's positive set L1–L7 + Combination 1 were already Verified).

Two founder decisions taken at open:

1. **Disclaimer home = P2 item 2e (honest positioning; R19c/d/e)**, not "Priority 4." P4 is Stripe; the "Priority 4" tag in test-brief A.3 / the scenario matrix was a stale label, now corrected in both.
2. **Wording approved as drafted** — placed verbatim across all four surfaces.

## Decisions Made

- `D-COMB2-NO-PRACTICE-DISCLAIMER-2026-05-27` appended. Disclaimer authored under R19e, aligned with the K1 ADR's "dated, scoped verdict" honesty principle, placed on developer docs / `llms.txt` / `agent-card.json` / limitations page, and asserted by `run-comb2.ts` (8/8 PASS). Resolves L7 assertion (b).

## Status Changes

| Item | Old | New |
|---|---|---|
| No-practice disclaimer (decision) | open / "Priority 4" | **Adopted** under R19e; home = **P2 2e** |
| Combination 2 (scenario-matrix / test-brief §A.2/A.3) | Designed; blocked on disclaimer text | **Verified 2026-05-27** (8/8) |
| `run-comb2.ts` + four surfaces | — | **Verified** (static-file assertion; no localhost dependency) |
| L7 assertion (b) (`run-l7.ts`) | PENDING Priority 4 | **RESOLVED** (asserted by `run-comb2.ts`) |

## Next Session Should

Proceed to **Session 2 of the v2 sequence — C2, the R20a distress perimeter** (`/operations/handoffs/founder/2026-05-26-sage-practice-sequence-v2-NEXT-SESSION-PROMPT.md`). **Tier: `code-critical`** — the full Critical Change Protocol (0c-ii) applies, visibly, before any deploy; PR6 throughout; PR1 one-route-first. It needs the **TEST env**: re-point `website/.env.local` per `data-room/04_test_brief/test-env-standup-checklist.md`, restart the dev server, confirm `key_id: substrate-layer2-test` before work. Build `run-c2.ts` submitting a distress input at each product entry; assert synchronous redirect/pass-through (PR3). Rollback = unset `SUBSTRATE_R20A_GATE_ENABLED` in TEST (production untouched). This session (1) needed no test env; Session 2 does.

## Blocked On

**Files remaining uncommitted (stage by name — do NOT `git add .`; never stage `website/.env.local*` or `website/tsconfig.tsbuildinfo`):**
- `website/src/app/api-docs/page.tsx`
- `website/public/llms.txt`
- `website/public/.well-known/agent-card.json`
- `website/src/app/limitations/page.tsx`
- `website/scripts/whole-system-harness/run-comb2.ts`
- `website/scripts/whole-system-harness/run-l7.ts`
- `data-room/04_test_brief/scenario-matrix.md`
- `data-room/04_test_brief/test-brief.md`
- `operations/decision-log.md`
- `operations/handoffs/founder/2026-05-27-comb2-no-practice-disclaimer-close.md`
- (optional) the `data-room/05_outputs/Comb2-build-only-*.json` + `.md` ledger this run wrote — regenerated on every run, so stage it only if you want this run's record on file.

**Production state at session close:** **UNCHANGED.** No code path, schema, env, or deploy touched. `/api/reason` byte-identical; provenance gate Live; local dev still on production (`.env.local` unchanged — Session 1 needed no test env).

## Open Questions

None for this row. (C2 distress perimeter — Critical-tier — is the next sequence item, handled in its own session.)

## Founder Verification

```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/website"
npx tsx scripts/whole-system-harness/run-comb2.ts   # expect: 8 passed, 0 failed; EXIT 0
npx tsc --noEmit                                     # expect: EXIT 0
```
Expected: `run-comb2` prints PASS for the canonical disclaimer on all four surfaces (developer docs, `llms.txt`, `agent-card.json`, limitations page) and writes a ledger to `data-room/05_outputs/`. Optionally open `/limitations` and `/api-docs` in the browser and confirm the wording reads as intended.

Sandbox-verified this session: `run-comb2` 8/8 PASS + EXIT 0; `npx tsc --noEmit` EXIT 0; `agent-card.json` parses (6 extensions). Run the commands one at a time (not as a pasted block).

**Commit (host-side, stage by name):**
```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
git add \
  website/src/app/api-docs/page.tsx \
  website/public/llms.txt \
  website/public/.well-known/agent-card.json \
  website/src/app/limitations/page.tsx \
  website/scripts/whole-system-harness/run-comb2.ts \
  website/scripts/whole-system-harness/run-l7.ts \
  data-room/04_test_brief/scenario-matrix.md \
  data-room/04_test_brief/test-brief.md \
  operations/decision-log.md \
  "operations/handoffs/founder/2026-05-27-comb2-no-practice-disclaimer-close.md"
git commit -m "Comb 2: no-practice disclaimer (R19e) on all four surfaces + run-comb2.ts assertion (8/8); resolves L7 (b); home = P2 2e not P4 (D-COMB2-NO-PRACTICE-DISCLAIMER). governance/Standard; no code/env/deploy."
```
Then push via GitHub Desktop. No Vercel behaviour change (additive copy + test scaffolding only); the new copy ships to the site on the next deploy.

## Cross-references

- `/operations/decision-log.md` — `D-COMB2-NO-PRACTICE-DISCLAIMER-2026-05-27`
- `/adopted/adr/2026-05-26-credential-scope-and-coverage-status.md` (K1 — the "dated, scoped verdict" honesty principle the wording aligns with)
- `data-room/04_test_brief/scenario-matrix.md` (Comb 2 row) + `data-room/04_test_brief/test-brief.md` (§A.2 / §A.3)
- `/operations/handoffs/founder/2026-05-26-sage-practice-sequence-v2-NEXT-SESSION-PROMPT.md` (the sequence; Session 2 = C2 next)
- `/operations/handoffs/founder/2026-05-26-sage-practice-exploration-close.md` (predecessor close)

*End of session close. Stabilised to a known-good state: the no-practice disclaimer is on all four surfaces, asserted (8/8) by `run-comb2.ts`, Combination 2 Verified, L7 assertion (b) resolved, production unchanged. Negative-scenario coverage is now complete. Next: Session 2 (C2, Critical).*
