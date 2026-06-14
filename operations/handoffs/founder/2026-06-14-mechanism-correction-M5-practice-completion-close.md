# Session Close — 2026-06-14 — Mechanism-Correction M5: practice-completion (CI-4 reason-route half + CI-13 + CI-15)

**Stream:** founder.
**Governing frame:** `/adopted/standing-protocol-cache.md` + `/adopted/build-sessions-protocol-cache.md`.
**Tier:** `code-elevated` (CI-4 + CI-13 response-shape on Live routes; the observation-length validator) over `code-standard`/`governance` (CI-15 staged docs; the test conversions). Lean + Elevated additions.
**Date:** 2026-06-14.
**Predecessor close:** `operations/handoffs/founder/2026-06-13-mechanism-correction-M4-gate-quick-tier-close.md`.

## What this session did

The adopted Q1/Q3/Q4 methodology became **shipped (flag-gated/staged) contract** — M5 proper — plus two founder-elected adjacent fixes the work surfaced.

- **CI-4 (reason-route half)** — `/api/reason` gains the re-examination affordance: a `prior_feedback` input, an `examination_open` response field on redirections, the **same-depth rule** (the re-examination carries the original depth, not quick-by-default), and `examination.{ref, depth_tier, prior_feedback_ref}` markers placed **inside the signed assessment** so they compose with the M3 write-boundary gate. Flag-gated (`SUBSTRATE_REASON_LOOP_CLOSURE_ENABLED`, UNSET = byte-identical). No new DB write.
- **CI-13 (reflect default-on)** — consult + accreditation-write responses carry the structural `practice` reflect-at-close hint (points at the existing SR-13 reflect; no abbreviation). Flag-gated (`SUBSTRATE_PRACTICE_CYCLE_HINT_ENABLED`, UNSET = no field).
- **CI-15 (two-gate cadence)** — authored into a **staged** docs file (M1 precedent; nothing public changed on push — R18), verbatim-faithful to the Q1/Q3 record.
- **Founder-walked TEST legs A–C (PR17)** — CI-4 + CI-13 verified live on TEST (the same-depth carry, the `prior_feedback_ref` linkage, and the `practice` hint all confirmed). D/E optional, not run (E is assertion-proven).
- **Adjacent — test-suite unification:** the "two tests that wouldn't run" were root-caused to a **missing Jest runner** (not expired tokens); all **9** Jest stragglers converted to the tsx harness (438 assertions green). The suite is now fully `npx tsx`.
- **Adjacent — observation-length reconciliation:** the conversion surfaced a real latent bug (validator drifted to 1000 vs the binding DB `CHECK` at 500). **Verified directly** and aligned the validator to 500; the quarantined test re-enabled (106 passed). Benign on push.

## Decisions Made
- `D-MECHANISM-CORRECTION-M5-PRACTICE-COMPLETION-BUILT-TEST-VERIFIED-2026-06-14` appended.

## Status Changes
| Item | Old | New |
|---|---|---|
| CI-4 reason-route half | Scoped | **Verified (TEST)** — assertion-level + founder-walked A–C; production inert |
| CI-13 reflect default-on | Scoped | **Verified (TEST)** — assertion-level + founder-walked C; production inert |
| CI-15 two-gate cadence docs | Scoped | **Staged** (verbatim-faithful; applied at founder 0c-ii) |
| Test suite (9 Jest stragglers) | Un-runnable (no Jest) | **Converted to tsx — runnable, 438 green** |
| `validateMentorObservation` length cap | Drifted (1000 vs DB 500) | **Reconciled to 500 (DB-aligned)** |

## Next Session Should
Execute **M6 — trajectory persistence (CI-5)**, the arc's largest item, per `operations/handoffs/founder/2026-06-14-mechanism-correction-M6-trajectory-persistence-NEXT-SESSION-PROMPT.md`. Risk: schema (Standard, idempotent additive) + Elevated (engine behaviour change on a Live route); PR1-style, likely **split** M6 (schema + write) → M7 (read + activation). Pre-conditions: `tsc` green at open; TEST Supabase; the M5 commit pushed.

## Blocked On
**Files remaining uncommitted (the founder commits by name; suggested groupings):**
- *Commit 1 — M5 arc:* `reason-loop-closure.ts`, `practice-cycle-hint.ts`, `layer2-mechanisms.ts`, `parallel-run.ts`, `reason/route.ts`, `accreditation/[agent_id]/response-builders.ts`, `m5-docs-staged-for-activation.md`, the 3 new M5 tests, this close, the decision-log entry, the M6 prompt.
- *Commit 2 — test-suite unification + reconciliation:* the 9 converted Jest→tsx files + `mentor-observation-logger.ts`.
- **Exclude:** `website/tsconfig.tsbuildinfo`; never stage `.env*`.

**Production state at session close:** unchanged from M4/CI-10 except, on push: the mentor-observation validator now rejects >500 (matches the DB `CHECK`; stored data unchanged) and the test suite is fully tsx (dev-only). M5's CI-4/CI-13 ship flag-gated UNSET; CI-15 docs staged. No substrate/perimeter/schema/flag production change. The four R20a flags remain `true`; CI-10 remains Live.

## Open Questions
- **Pending founder-elected 0c-ii:** CI-4 + CI-13 flag activation + applying the CI-15/CI-13 staged docs (the only public-surface step).
- **Carried:** the M1 activation checklist; the M3 CI-11 migration + CI-4 write-boundary flags; the M4 CI-9 replay-ack; `/api/keys` 100/100/1 vs adopted 30/1/1; the leg-B seed-row disposition; **the 0h call**.
- **Optional doc refresh (offered):** CLAUDE.md's "Running the substrate test suite" note (the suite is now fully tsx; `mentor-observation-logger.test.ts` joins the `--env-file` list).
- The observation validator could later be tightened toward the 50–250 design target (risks false-rejects; left at 500 to match the DB).

## Founder Verification
```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/website"
npx tsc --noEmit
npx tsx src/lib/translation-sandwich/__tests__/reason-loop-closure.test.ts
npx tsx src/lib/__tests__/practice-cycle-hint.test.ts
npx tsx src/lib/__tests__/m5-docs-staged.test.ts
npx tsx --env-file=.env.local src/lib/logging/__tests__/mentor-observation-logger.test.ts
```
Expected: tsc silent; `33`, `13`, `22` pass / 0 fail; `106 passed, 0 failed`. Then commit by the groupings above and push via GitHub Desktop. **Vercel deploy is behaviourally inert except the observation-length validator alignment** (benign — the DB already enforced 500); both M5 flags remain UNSET.

## Cross-references
- `operations/handoffs/founder/2026-06-13-mechanism-correction-M5-practice-completion-NEXT-SESSION-PROMPT.md` (the prompt this close answers)
- `operations/handoffs/founder/2026-06-14-mechanism-correction-M6-trajectory-persistence-NEXT-SESSION-PROMPT.md` (next)
- `operations/p1-rebuild-2026-06/m5-docs-staged-for-activation.md` (the staged CI-15/CI-13 docs)
- `D-MECHANISM-CORRECTION-M5-PRACTICE-COMPLETION-BUILT-TEST-VERIFIED-2026-06-14`
- `operations/p1-rebuild-2026-06/mechanism-correction-build-plan.md` (CI-5 = M6)

*End of session close. M5's CI-4/CI-13/CI-15 are built, TEST-Verified (incl. founder-walked A–C), and production-inert; the suite is unified on tsx; a latent observation-length bug is reconciled. The arc continues at M6 (CI-5, trajectory persistence) — the remaining items are CI-5 (M6/M7), CI-14 (design, M8), and the parked CI-16.*
