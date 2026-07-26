# Session Close — 2026-07-27 — Practice Reminders, Human Phase 1: The Sequence Trigger

**Stream:** founder (website build).
**Governing frame:** `/adopted/standing-protocol-cache.md`.
**Tier:** `code-elevated` — Elevated risk. AC7/PR6 not engaged; Critical Change Protocol not engaged.
**Date:** 2026-07-27. **Session model:** Opus 5. No LLM calls by this session's product code (AC1 N/A row).

## Decisions Made

- `D-PRACTICE-REMINDERS-HUMAN-PHASE1-SEQUENCE-TRIGGER-BUILT` appended — the sequence trigger built end to end; twelve adversarial-review findings folded and each re-verified with the review's own mutation.

## Sequencing decision (founder, at open)

Put to the founder via AskUserQuestion: **Phase 1** vs the **R17 data-rights gap** on the `milestones` table. Founder elected **Phase 1**. R17 stays open as its own founder-walked Critical step and **gates external onboarding** — it is not closed by this session.

## Status Changes

| Item | Old | New |
|---|---|---|
| Human reminder plan Phase 1 | Scoped | **Built + Verified** (live on push) |
| `/welcome` "Where to start" | "There is no single right order" | Ordered default path, freedom note softened (election E2) |
| Dashboard "what to do next" | Did not exist | `PracticeSequenceModule`, rendered for **every** signed-in user |
| The seven practice tools on the dashboard | Never mentioned | Named, in the mentor's order, with doorbell lines |
| `/passion-log` in `/welcome` | Absent entirely | Present, in the sequence |
| `/stages/<slug>` pages | Reachable only by URL or a milestone | Linked from `/welcome`'s five Stage tiles |
| `PracticeSequenceModule.tsx` | — | Guarded by a boundary suite |

## What was built

A **zero-import** pure module `practice-sequence.ts` holds the mentor's order, the stage↔practice mapping, every user-visible string, and the pure helpers. `GET /api/mentor/practice-status` (user-JWT, read-only, no LLM) performs ten indexed per-user reads and folds them through that module. The dashboard module renders above the `evaluations.length > 0` gate — the gate that was the reason a brand-new practitioner saw nothing.

**Two honesty rules carry the feature, and both fail toward silence.** A practice whose read failed is `unavailable` with `met: null`, never `false`. And `next_in_sequence` is withheld as `indeterminate` when an unavailable step precedes any unmet one, rather than pointing one practice too far along. Both live in the pure fold, so they are unit-tested rather than reachable only through a live database.

## The zero-import decision — and a correction to the prompt

The session prompt asserted that importing `brand-display` into `/welcome` or its imports "fails the guard". **Mutation-verified: it does not** — 249 passed, 0 failed. `stoic-brain` is allowlisted rather than forbidden in the logos suite, and although that suite's allowlist *does* also run on one-hop helpers, it never fires here because the hop-one specifier is `brand-display`; the `brand-display → stoic-brain` edge is at hop two, past the traversal's reach. The design is unchanged — the module is zero-import — but it rests on plan §11, which binds regardless, not on a guard that would have waved it through. The new suite enforces §11 directly.

## Verification

All green: `practice-sequence` **211/0** · `practice-status` boundary **445/0** · six sibling boundary suites unchanged (466/466/327/451/527/466) · logos **249/0** (its repo-global git byte-identity guard passes, so the observation window's measured set is untouched) · `milestone-check-data` 60/0 · schema-drift 51/0 · `tsc` 0 · `npm run build` 0 (`ƒ /api/mentor/practice-status` registered).

Browser: `/welcome` renders the ordered sequence with the pairing shown as `·`; all five stage links and all seven sequence links resolve; console clean. Route 401s unauthenticated and with a bogus Bearer; `/dashboard` 307s signed out. **Not browser-verified:** the module's signed-in rendering — the dev server points at TEST and there are no TEST credentials. The founder's post-deploy check settles it.

**Mutation testing: 35 mutations, 34 caught, 1 designed survival** (the logos-guard finding, caught by this session's own suite). Every mutation was confirmed to have actually applied before its result was trusted.

## Adversarial review — honest account

An independent 6-dimension Workflow ran: **27 findings raised, 19 verified (7 CONFIRMED, all low/nit, and 12 refuted). 8 verifiers were killed by the account monthly spend limit.** Three of those duplicated confirmed findings; the remaining five were adjudicated **first-hand** per PR19's fallback and all five held. **All twelve surviving findings are folded**, each re-verified with the review's own mutation (9/9 caught).

The three worth carrying forward as lessons:

- **A vacuous pin — the Phase 0 lesson recurring exactly.** Every two-timestamp fixture put the later value second, so a "last wins" mutant passed all 193 assertions. Same shape as Phase 0's "first gap instead of max".
- **A pin that did not pin.** `/welcome`'s stage slugs carried a comment claiming the unit suite covered them. It did not — a slug mutation passed **783 assertions across three suites** — and this same diff had just made those slugs load-bearing by turning the tiles into links. A comment asserting "a test covers this" is load-bearing for a future maintainer's decision not to look.
- **A guard that had quietly stopped guarding.** Disabling the boundary suite's one-hop traversal dropped **152 of 341 assertions while still reporting 0 failed**.

**Honest limit:** five findings rest on a single (first-hand) perspective. An independent re-run after the limit resets remains worthwhile, as it does for Phase 0.

## Next Session Should

**Step M — the mentor consultation** (plan §10), which is founder-run and gates the *content* of Phases 2–3. It can run any time and does not depend on further build work.

Otherwise **Phase 4** (the daily rhythm strip) is buildable now — it depends only on Phase 1, and this session already built and exposed its read (`rhythm` on the status route). **Phase 2** (in-session suggestions) and **Phase 3** (the stage-crossing card) both wait on Step M for their mapping-table content, though Phase 3's substrate is ready since Phase 0.

## Blocked On

**Files to commit (this session's work):**
- `website/src/lib/practice-sequence.ts` (new)
- `website/src/lib/__tests__/practice-sequence.test.ts` (new)
- `website/src/app/api/mentor/practice-status/route.ts` (new)
- `website/src/app/api/mentor/practice-status/__tests__/human-practitioner-boundary.test.ts` (new)
- `website/src/components/PracticeSequenceModule.tsx` (new)
- `website/src/app/welcome/page.tsx`
- `website/src/app/dashboard/page.tsx`
- `operations/decision-log.md`, `operations/reminders-2026-07/…HUMAN-build-plan.md` (§6 status), this close, and the session prompt.

**Production state at close (PR18):** byte-equivalent — nothing deployed, no schema, flag, credential or env change. On the founder's push this deploys as an ordinary Vercel build; the behaviour change is that the dashboard gains a practice module and `/welcome` gains an ordered path. S11 remains REFUSED; MEASURE throughout; weights BLOCKED; the 0h call remains the founder's — all unaffected.

**Session honesty note:** the Gate-1 harness ran **unframed** for this entire session — every consult 401'd and the guardrail 429'd. That is the known transient fail-secure class, not a stale credential, and it blocked nothing; but this session's own actions were not examined by the practice.

## Open Questions

- **R17 (unchanged, and now the oldest open item in this arc):** the `milestones` table is absent from `/api/user/delete`, `/api/user/export` and `user-data-gathering.ts`. Critical under 0d-ii, founder-walked, gates external onboarding.
- **Rate-limit coupling to the measured surface:** `/api/milestones` and `/api/baseline` both use the `scoring` bucket that `/api/reason` uses, and both fire on a dashboard mount. This session moved its own route off it; the other two are pre-existing and were left alone deliberately.
- No behavioural test exists for the component or the route handler — the honest-state contract is pinned structurally, not behaviourally.
- Carried unchanged from Phase 0: `oikeiosis_context` is never written, so the two oikeiosis milestones stay unearnable; `earned.add(id)` hardening; the milestones route's unbounded `action_evaluations_v3` query.

## Founder Verification

```bash
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/website"
npx tsx src/lib/__tests__/practice-sequence.test.ts && npx tsx src/app/api/mentor/practice-status/__tests__/human-practitioner-boundary.test.ts && npx tsc --noEmit && npm run build
```
Expected: `211 passed, 0 failed`; `445 passed, 0 failed`; tsc exit 0; build exit 0.

```bash
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
git add \
  website/src/lib/practice-sequence.ts \
  website/src/lib/__tests__/practice-sequence.test.ts \
  website/src/app/api/mentor/practice-status \
  website/src/components/PracticeSequenceModule.tsx \
  website/src/app/welcome/page.tsx \
  website/src/app/dashboard/page.tsx \
  operations/decision-log.md \
  operations/reminders-2026-07 \
  operations/handoffs/founder/2026-07-27-practice-reminders-human-phase1-sequence-trigger-CLOSE.md \
  operations/handoffs/founder/2026-07-27-practice-reminders-human-phase1-sequence-trigger-NEXT-SESSION-PROMPT.md
git commit -m "Build the sequence trigger (human reminders Phase 1)

The dashboard had no what-to-do-next element and never named the seven
practice tools; /welcome explicitly disclaimed any order; and the whole
practice region sat behind an evaluations.length > 0 gate, so the
practitioner the sequence exists for saw nothing at all.

Adds a zero-import practice-sequence lib (the mentor's order, the stage
mapping, every string), a read-only GET /api/mentor/practice-status, a
dashboard module rendered above that gate for every signed-in user, and
the ordered /welcome path with the freedom note softened, not deleted.

Two honesty rules carry it, both failing toward silence: a practice whose
read failed is unavailable with met:null, never false; and the next step
is withheld as indeterminate rather than pointing one practice too far.

The lib is zero-import because the logos guard follows only one hop --
and, mutation-verified, would NOT have caught a brand-display import
here. What binds is plan section 11, not the guard.

Elevated: no schema, flag, auth-model or deploy-config change. Suites
211/0 and 445/0, all six siblings and logos green, tsc 0, build 0.
35 mutations, 34 caught. Twelve adversarial-review findings folded.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
git status --short
```
Expected after commit: a clean tree. Then push via GitHub Desktop — this deploys via Vercel as an ordinary build.

**After deploy, signed in:** load `/dashboard`. A "Your practice" module should render above the evaluations region — for every practitioner, including one with no evaluations — naming the next practice with its doorbell line. Then `/welcome`: "Where to start" should read as an ordered default with the freedom note intact, and the five Stage tiles should link through.

## Cross-references

- `operations/handoffs/founder/2026-07-26-practice-reminders-human-phase0-milestone-wiring-CLOSE.md` (predecessor)
- `operations/reminders-2026-07/2026-07-26-practice-reminders-HUMAN-build-plan.md` §6 (Phase 1), §10 (Step M, next)
- `D-PRACTICE-REMINDERS-HUMAN-PHASE1-SEQUENCE-TRIGGER-BUILT`

*End of session close. A practitioner who has just arrived is now told what to do first, in the mentor's order and in doorbell language; twelve review findings folded, and three pins that only looked like pins now genuinely pin.*
