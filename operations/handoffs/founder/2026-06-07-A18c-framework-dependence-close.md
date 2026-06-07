# Session Close — 2026-06-07 — A18c: R20b framework-dependence detection + independence coaching

**Stream:** founder.
**Governing frame:** `/adopted/standing-protocol-cache.md` + `/adopted/build-sessions-protocol-cache.md` ("no current users" holds → Critical Change Protocol step 3 = N/A; all other steps in full force).
**Tier:** `code-critical` — **Critical** under PR6 (mentor-behaviour change adjacent to the distress perimeter). Model selection **N/A** — deterministic detection, no LLM call added.
**Date:** 2026-06-07. **Branch:** `main`.
**Operative prompt:** the A18c next-session prompt (last A18 build). You elected **Design-then-build** and, at ADR review, **deterministic detection**.
**Predecessor close:** `/operations/handoffs/founder/2026-06-07-A18-mirror-propagation-close.md` (confirmed pushed + Vercel green at this session's open).

## What this session did

Built R20b ("Independence, not dependence", manifest line 227) end-to-end on the single founder-only surface `/api/mentor/private/reflect` (PR1 single-endpoint proof), in two deliberately separate halves:

1. **Detection** — a new pure, deterministic function `detectFrameworkDependence` (`website/src/lib/r20b-dependence.ts`) reads the practitioner's recent `mentor_interactions` and decides whether an over-reliance pattern is present: high frequency **and** trivial inputs (short median length, or a high share of reflexive/habitual evaluations). Conservative double-gate to avoid false positives. No LLM, no new schema, read-only.
2. **Coaching** — when (and only when) the pattern is present, a context block is injected into the mentor's user message asking it to affirm, once and in its own voice, that the user "is ready to reason through this yourself" — framed as progress, never a limit.

The whole feature is behind `R20B_INDEPENDENCE_COACHING_ENABLED` (UNSET by default). With the flag off, the LLM prompt is byte-identical to pre-A18c. **A18 is complete after this build.**

## Decisions Made

- `D-A18C-FRAMEWORK-DEPENDENCE-2026-06-07` (Critical) — appended to the decision log (full form).
- ADR `drafts/adr/2026-06-07-r20b-framework-dependence-detection.md` produced and approved at review (deterministic mechanism elected). On your approval it moves `/drafts/adr/` → `/adopted/adr/`.

## Status Changes

| Item | Old | New |
|---|---|---|
| R20b framework-dependence detection | Scoped | **Wired** (built + tsc exit 0 + AC4 invocation grep) → Verified on your tsx test |
| R20b independence coaching (private/reflect) | Scoped | **Wired** (flag-gated; injected only when present) → Verified on your check |
| A18 (overall) | A18a/b/d/e + mirror done | **Complete** (A18c was the last build) |

## Verification Method Used (0c framework)

- **AI-side (Diagnostic-certain — PR10 Verify step):** `cd website && node_modules/.bin/tsc --noEmit` → **exit 0, 0 errors**. AC4 invocation test: `detectFrameworkDependence` is **imported (line 60) and called (line 513)** — not merely defined. R20a distress block byte-identical (`grep -c "await enforceDistressCheck(detectDistressTwoStage(combinedInput))"` = 1). `/api/reason` carries **0** R20b text. The `tsx` unit test was **not** run AI-side — documented sandbox esbuild native-binary mismatch (your macOS-arm64 `node_modules` in a linux-arm64 sandbox). It runs on your machine.
- **Founder-side (0c):** run the typecheck + the tsx unit test below; optional live behaviour check.

## Risk Classification Record (0d-ii)

- R20b detector + coaching injection, `/api/mentor/private/reflect` — **Critical** under PR6 (mentor-behaviour change adjacent to the distress perimeter). One unit. AC7 not engaged. **PR6 boundary respected in writing:** distress classifier / Zone 2-3 / `enforceDistressCheck` wrapper untouched; detection runs after the distress gate, read-only, synchronous (PR3).

## Critical Change Protocol (0c-ii) — completed visibly this session

1. **What changes:** private-mentor-only gentle independence nudge when usage looks over-reliant; nothing changes with the flag off.
2. **What could break:** code error (mitigated — try/catch, non-blocking); false positive (mitigated — conservative double-gate; invitation not a gate); distress check / `/api/reason` (mitigated — untouched, byte-identical, grep-proven).
3. **Existing sessions:** N/A — no third-party users.
4. **Rollback:** unset the flag → today's behaviour; per-file restore from the backup; no schema to reverse.
5. **Verification:** tsc exit 0 + AC4 grep + founder tsx test.
6. **Explicit approval specific to named risks:** requested below before you deploy.

## Blocked On

**Files uncommitted (commit command below):**
- `website/src/lib/r20b-dependence.ts` (new)
- `website/src/app/api/mentor/private/reflect/route.ts` (wired)
- `website/src/lib/__tests__/r20b-dependence.test.ts` (new)
- `archive/private-reflect-route.ts.backup-pre-A18c-2026-06-07` (new backup)
- `drafts/adr/2026-06-07-r20b-framework-dependence-detection.md` (new ADR)
- `operations/decision-log.md` (this entry)
- `operations/handoffs/founder/2026-06-07-A18c-framework-dependence-close.md` (this close)

**Production state at session close:** **UNCHANGED from pre-session.** Nothing deployed; `R20B_INDEPENDENCE_COACHING_ENABLED` UNSET (the new code is inert in production until you set it); `/api/reason` + every R20a/distress block byte-identical; A13 cost-health Live; all four R20a flags `true`; OTel / injection-defence / Layer3 / plugin-install-auth / abuse-detection flags UNSET. The two pending production migrations (`compliance_access_log`, `compliance_rectification_log`) remain pending (untouched).

## Founder Verification (Between Sessions)

Run one command at a time (per CLAUDE.md). I can walk any step live (PR17).

1. Typecheck (proves the edits compile):
```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/website" && node_modules/.bin/tsc --noEmit
```
Expected: no output, exit 0 (already run this session).

2. Unit test (proves the detection threshold logic with synthetic data — Supabase-free):
```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/website" && npx tsx src/lib/__tests__/r20b-dependence.test.ts
```
Expected: each line `✓`, final line "… passed, 0 failed", exit 0.

3. Optional live check (TEST env only — never production; per the build cache): set `R20B_INDEPENDENCE_COACHING_ENABLED=true` in `website/.env.development.local`, drive ≥25 short reflexive interactions for the test profile, confirm the mentor surfaces the nudge; unset → behaviour unchanged. Remove the flag at teardown.

### Then commit + push
```
rm -f "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/.git/index.lock"
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
git add website/src/lib/r20b-dependence.ts \
  website/src/app/api/mentor/private/reflect/route.ts \
  website/src/lib/__tests__/r20b-dependence.test.ts \
  archive/private-reflect-route.ts.backup-pre-A18c-2026-06-07 \
  drafts/adr/2026-06-07-r20b-framework-dependence-detection.md \
  operations/decision-log.md \
  operations/handoffs/founder/2026-06-07-A18c-framework-dependence-close.md
git commit -m "A18c (R20b): deterministic framework-dependence detection + independence coaching on /api/mentor/private/reflect (PR1 single-endpoint proof). Flag-gated R20B_INDEPENDENCE_COACHING_ENABLED (UNSET). Distress block + /api/reason byte-identical; PR6 perimeter untouched. (D-A18C-FRAMEWORK-DEPENDENCE-2026-06-07)"
```
Then push via GitHub Desktop. Additive + flag-gated UNSET — Vercel should build green with no config or env change; production behaviour is unchanged until you deliberately set the flag.

**Explicit approval requested (Critical Change Protocol step 6):** before you push, confirm "go ahead" specific to the named risks (false positive; the non-blocking try/catch; the perimeter staying untouched). Nothing I did deploys until you commit + push.

## Next Session Should

You elect. With A18 complete, the picture is:

- **A16 / A17** — privacy + regulatory governance passes — **lawyer-coupled**; the FPE/legal track is now the sole long-pole gating Stage-1 close. Highest-leverage next move.
- **A14 tracker** — deferred SLO/error-budget tracker; founder-performed; small.
- **R19d "all tools" follow-up** — extend the mirror principle to the 6 scoring/skill surfaces (Elevated; optional).
- **Deferred (PR7) from this session** — promote the dependence detector into the shared `analysePatterns` engine + roll out to the other 7 mentor surfaces (trigger: this proof Verified). LLM-classifier upgrade only if the triviality proxy proves inadequate.
- **Governance housekeeping** (7 pending doc edits incl. the §A18 staging-plan annotation — now "A18 complete") + the **two production migrations** — small founder-performed items; walk live per PR17.

## Open Questions / Deferred (documented, not lost)

- Threshold tuning: `DEPENDENCE_DEFAULTS` (25 / 7d; 120 chars; 0.6 shallow share) are conservative starting values — revisit against real usage once the flag is on.
- Shared-engine promotion + 7-surface rollout (PR7) — deferred to its own session once this proof is Verified.
- Carried from A18: R19d "all tools" reach (6 scoring/skill surfaces); the two practice-name H1 renames (R8c); F10 `private-mentor` design-system alignment.

## Cross-references

- Decision log: `D-A18C-FRAMEWORK-DEPENDENCE-2026-06-07`; predecessor `D-A18-MIRROR-PROPAGATION-2026-06-07`.
- ADR: `drafts/adr/2026-06-07-r20b-framework-dependence-detection.md`.
- Rules: `manifest.md` R20b (line 227) / R20 / R6d / R19 / R19d / AC3 / AC4. Staging: `adopted/substrate-plugin-staging-plan.md` §A18.
- Backup: `archive/private-reflect-route.ts.backup-pre-A18c-2026-06-07`.

*End of session close. Stabilised to known-good: production UNCHANGED and undeployed; the new code is inert (flag UNSET); LLM prompt byte-identical with the flag off; tsc exit 0; AC4 invocation confirmed; R20a distress block + /api/reason byte-identical; route backed up; ADR drafted; decision-log entry appended; uncommitted, awaiting your typecheck + unit test + explicit go-ahead, then commit. No flags activated, no schema, no deploy, no distress-perimeter surface touched.*
