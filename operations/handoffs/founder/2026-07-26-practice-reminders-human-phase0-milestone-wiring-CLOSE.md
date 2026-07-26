# Session Close — 2026-07-26 — Practice Reminders, Human Phase 0: Milestone Awarding Wired

**Stream:** founder (website build).
**Governing frame:** `/adopted/standing-protocol-cache.md`.
**Tier:** `code-elevated` — Elevated risk. AC7/PR6 not engaged; Critical Change Protocol not engaged.
**Date:** 2026-07-26. **Session model:** Opus 5. No LLM calls by the session's own product code.

## Decisions Made

- `D-PRACTICE-REMINDERS-HUMAN-PHASE0-MILESTONE-WIRING-BUILT` appended — milestone awarding wired end to end; **two** independent defects fixed (no caller, and a read path that never authenticated); one deliberate, stated deviation from the plan's item 3.

## Status Changes

| Item | Old | New |
|---|---|---|
| Human reminder plan Phase 0 | Scoped | **Built + Verified** (live on push) |
| `POST /api/milestones` | Built, never called by anything | **Wired** — 3 callers (score save, dashboard catch-up, MilestonesDisplay) |
| `GET /api/milestones` from the UI | Silently 401'd on every render (bare `fetch`) | **Authenticated** via `authFetch` |
| Journal milestones (5) + `journal_return` | Unreachable — check-data never populated | **Reachable** |
| Milestone test coverage | None of any kind | `milestone-check-data.test.ts` **60/0**, 9/9 mutation-verified |
| `milestones` table in data-rights | Absent, but table was empty for everyone | Absent and **now holds real data** — named follow-up |

## What was built

A new pure module `website/src/lib/milestone-check-data.ts` (I/O-free, type-only imports) holds the check-data arithmetic so it is directly testable rather than only source-grep-pinned. The route gained a fifth parallel query leg for `journal_entries`, routes assembly through that builder, uses `.maybeSingle()` so "no baseline yet" is distinguishable from a real error, and now **fails honest** — a source-query error returns `check_data_incomplete` and logs, instead of silently awarding from a partial picture. `MilestonesDisplay` awards then reads, in that order, so a freshly-earned milestone is visible immediately rather than after a refresh.

## Verification

All green: new suite **60/0** · `tsc --noEmit` 0 · `npm run build` 0 (`ƒ /api/milestones` registered) · all seven `human-practitioner-boundary` suites (232/466/466/466/527/327/451, 0 failed) — so the observation window's measured set is untouched. Dev-server probe: GET and POST both 401 unauthenticated (route alive, Bearer-only — empirically reproducing the original defect), `/dashboard` and `/score` 307 to `/auth`, no console or server errors.

**Adversarial review — honest account.** The independent Workflow (8 dimensions + per-finding refuters + completeness critic) **died whole; all 9 agents errored on the account monthly spend limit.** Per PR19's codified fallback it was completed **first-hand**, with the mutation-testing dimension run mechanically. Nine mutations applied → suite re-run → reverted. **One originally survived:** a "first gap instead of max" mutant passed all 53 assertions because every fixture happened to put the largest gap first. Closed with three new pins. A second real defect was then found by hand: `new Date(null).getTime()` is `0` and *finite*, so a null `created_at` (nullable on `action_evaluations_v3`) would fabricate a ~20,000-day gap and falsely award `returning_practitioner` — closed with a type guard and mutation-verified. Final 9/9 caught. **Honest limit: single-perspective. An independent re-run should follow the limit reset.**

## Next Session Should

**Phase 1 — the sequence trigger** (plan §6; `code-elevated`, ~1 session): the new `practice-sequence.ts` lib, `GET /api/mentor/practice-status`, the dashboard "Your practice" module rendered for *every* signed-in user (above the `evaluations.length > 0` gate), and the ordered `/welcome` path per election E2. It does not depend on Step M. **One hard constraint carried forward:** `/welcome` is a guarded `TARGET_FILES` entry of the logos boundary test, and `@/lib/milestones` / `@/lib/brand-display` both carry a `stoic-brain` specifier — so any practice component reaching `/welcome` must not import either, at one hop. Inline the strings or use a zero-import content module (the `logos-teaching.ts` precedent).

Step M (the mentor consultation vetting both mapping tables) can run in parallel at the founder's convenience.

## Blocked On

**Files to commit (this session's work):**
- `website/src/lib/milestone-check-data.ts` (new)
- `website/src/lib/__tests__/milestone-check-data.test.ts` (new)
- `website/src/app/api/milestones/route.ts`
- `website/src/components/MilestonesDisplay.tsx`
- `website/src/app/score/page.tsx`
- `website/src/app/dashboard/page.tsx`
- `website/.claude/launch.json` (new — dev-server config for the preview harness; no effect on the app or build output. Drop it from the commit if unwanted.)
- `operations/decision-log.md`, `operations/reminders-2026-07/…HUMAN-build-plan.md` (§5 status), this close, and the session prompt `…human-phase0-milestone-wiring-NEXT-SESSION-PROMPT.md`

**NOT this session's to stage:** `CLAUDE.md` and `operations/handoffs/founder/2026-07-26-corroboration-disclosure-live-verify-NEXT-SESSION-PROMPT.md` (other threads' carry-forwards).

**Production state at close (PR18):** byte-equivalent — nothing deployed, no schema, flag, credential or env change. On the founder's push this deploys as an ordinary Vercel build; the behaviour change is that milestones begin being awarded and displayed. S11 remains REFUSED; MEASURE throughout; weights BLOCKED; the 0h call remains the founder's — all unaffected.

## Open Questions

- **`action_evaluations_v3` column drift (determinative; settle first).** `score/page.tsx` inserts `action_description`, a column **no repo SQL declares on that table** (the migration declares `action TEXT NOT NULL`); `practice-calendar` reads `action_description` while `dashboard` reads `action`. If production lacks `action_description`, every human score save has been failing silently and the table is empty — in which case ~12 evaluation-driven milestones cannot fire regardless of this wiring, and an all-grey grid would be *that* bug, not this one. Settle with the read-only query in the Founder Verification block. Task chip spawned.
- **`milestones` is absent from all data-rights paths.** Harmless while the table was empty for everyone; Phase 0 makes it hold real per-user data. Zero exposure pre-0h (the `reflect-store owner-scoping` precedent), but data deletion is **Critical** under 0d-ii — its own founder-walked step, and it should gate external onboarding. Task chip spawned.
- Named, not built: `earned.add(id)` hardening in `checkNewMilestones`' `award()`; `oikeiosis_context` is never written so the two oikeiosis milestones stay unearnable (a write-side change, deliberately out of scope); the route's evaluations query has no `.limit()`.
- Whether Phase 0 should also have moved `MilestonesDisplay` above the `evaluations.length > 0` gate — deliberately left to Phase 1, which reworks that region anyway. The dashboard catch-up POST means zero-evaluation practitioners are still *awarded*; they simply cannot see the grid yet.

## Founder Verification

```bash
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/website"
npx tsx src/lib/__tests__/milestone-check-data.test.ts && npx tsc --noEmit && npm run build
```
Expected: `60 passed, 0 failed`; tsc exit 0; build exit 0.

```bash
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
git add \
  website/src/lib/milestone-check-data.ts \
  website/src/lib/__tests__/milestone-check-data.test.ts \
  website/src/app/api/milestones/route.ts \
  website/src/components/MilestonesDisplay.tsx \
  website/src/app/score/page.tsx \
  website/src/app/dashboard/page.tsx \
  website/.claude/launch.json \
  operations/decision-log.md \
  operations/reminders-2026-07 \
  operations/handoffs/founder/2026-07-26-practice-reminders-human-phase0-milestone-wiring-CLOSE.md \
  operations/handoffs/founder/2026-07-26-practice-reminders-human-phase0-milestone-wiring-NEXT-SESSION-PROMPT.md
git commit -m "Wire milestone awarding end to end (human reminders Phase 0)

POST /api/milestones had no caller anywhere in the app, so none of the 25
milestones had ever been awarded to anyone. A second, independent defect:
MilestonesDisplay called the GET with a bare fetch while the route accepts
Authorization: Bearer only, so it 401'd unconditionally. Either alone yields
an all-grey grid, and the broken state was indistinguishable from an honest
new-user state.

Adds three callers (score save, dashboard catch-up, MilestonesDisplay
award-then-read), the missing journal check-data, and a pure, unit-tested
milestone-check-data module. The route now fails honest on a source-query
error instead of silently under-awarding.

daysSinceLastAction is the MAX gap between consecutive evaluations, not the
plan's literal days-since-now -- which would have awarded Returning
Practitioner to someone who has not returned. Deviation recorded in the
decision-log entry.

Elevated: no schema, flag, auth-model or deploy-config change. Suite 60/0
(9/9 mutation-verified), tsc 0, build 0, all seven boundary suites green.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
git status --short
```
Expected after commit: only `CLAUDE.md` and the corroboration-disclosure prompt remain modified. Then push via GitHub Desktop — this deploys via Vercel as an ordinary build.

**After deploy, on the live site:** load `/dashboard`. Previously-earned-by-history milestones should appear in colour with an earned date. Score an action — the save must still confirm. If the grid stays entirely grey **and no evaluations are listed**, run the read-only drift query in the Supabase SQL editor against production:
```sql
select column_name, is_nullable from information_schema.columns
where table_name = 'action_evaluations_v3' order by ordinal_position;
select count(*) from public.action_evaluations_v3;
```

## Cross-references

- `operations/handoffs/founder/2026-07-26-practice-reminders-plans-CLOSE.md` (predecessor)
- `operations/reminders-2026-07/2026-07-26-practice-reminders-HUMAN-build-plan.md` §5 (Phase 0), §6 (Phase 1, next)
- `D-PRACTICE-REMINDERS-HUMAN-PHASE0-MILESTONE-WIRING-BUILT`
- `D-PRACTICE-REMINDERS-COUNSEL-ANALYSED-PLANS-AUTHORED`

*End of session close. The milestone system now actually works; two defects fixed, two surfaced and named, nothing deployed until the founder pushes.*
