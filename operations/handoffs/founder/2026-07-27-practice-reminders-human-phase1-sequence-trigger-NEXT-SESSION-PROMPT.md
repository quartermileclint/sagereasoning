# Next-Session Prompt — Practice Reminders, Human Plan Phase 1: The Sequence Trigger

**Stream:** founder (website build).
**Tier:** `code-elevated`.
**Governing frame:** `/adopted/standing-protocol-cache.md` (full governance via the cache; deliverable-of-the-day named below).
**Predecessor session close:** `operations/handoffs/founder/2026-07-26-practice-reminders-human-phase0-milestone-wiring-CLOSE.md`.
**Predecessor decision-log entries:** `D-PRACTICE-REMINDERS-HUMAN-PHASE0-MILESTONE-WIRING-BUILT`, `D-ACTION-EVALUATIONS-V3-SCHEMA-DRIFT-FIXED`, `D-PHASE0-AND-SCHEMA-DRIFT-LIVE-VERIFIED`.
**Risk classification:** Elevated under 0d-ii (changes to existing user-facing functionality; one new route). **Critical Change Protocol NOT engaged** — no schema, flag, auth-model, or deploy-config change is in scope. AC7/PR6 not engaged. KG1 awareness only (the new route is read-only; it writes nothing).

## Where the arc stands

Phase 0 is **BUILT, DEPLOYED and LIVE-VERIFIED** (2026-07-26). Milestone awarding fires; the dashboard renders earned milestones. Along the way two live defects were fixed and one was found by the review: `action_evaluations_v3` had **never** persisted a single human evaluation since 2026-03-21 (the score page wrote two columns that exist on no schema for that table, and the error was discarded) — now fixed, conformed to the migration, with a schema-drift guard test. Live confirmation: 1 evaluation saved, 8 milestones awarded, dashboard rendering both.

Phase 1 is the plan's next step and needs no Step M.

## Sequencing decision to make at open (surface it, don't assume)

There is one competing candidate, and the founder should choose:

- **Phase 1 (recommended, and the plan's own order).** The sequence trigger, below.
- **The R17 data-rights gap.** The `milestones` table appears in **none** of `/api/user/delete`, `/api/user/export`, or `user-data-gathering.ts`, while every sibling practice table does. This was harmless while the table was empty for everyone; as of 2026-07-26 it holds real per-user data. Exposure is still **zero pre-0h**, and the project's established handling of this exact class (`reflect-store owner-scoping`) is to record it and treat it as gating external onboarding rather than blocking build work. But **data deletion is Critical under 0d-ii**, so it is a founder-walked session of a different shape, not an item to fold into a build session. A task chip exists for it.

Recommendation: Phase 1 now; schedule the R17 step before any external onboarding.

## Why this session matters

The mentor's counsel names three trigger points. Phase 1 builds the third — **sequence**, "the default path before enough practitioner context exists to personalise it." Today the dashboard has no "what to do next" element and never mentions the seven practice tools; `/welcome` explicitly disclaims any order; and a brand-new user with zero evaluations sees essentially nothing, because the whole practice region sits behind an `evaluations.length > 0` gate. Phase 1 gives every signed-in practitioner — including one who has just arrived — a named next step in the mentor's own order, in doorbell language.

## Pre-conditions

1. Phase 0 and the schema-drift fix are committed, pushed, and Vercel-green (all confirmed 2026-07-26).
2. `git status` is clean apart from `CLAUDE.md` and `operations/handoffs/founder/2026-07-26-corroboration-disclosure-live-verify-NEXT-SESSION-PROMPT.md` — **other threads' carry-forwards, not this session's to stage.**
3. The seven `human-practitioner-boundary` suites pass at open. **Run them first** — the logos suite carries a repo-global git byte-identity guard, so a dirty file elsewhere in the measured set fails it and you want to know that before you start, not after.

## Part A — Open under the protocol

Read in order:
1. `/adopted/standing-protocol-cache.md` (~3 min — tier, model, risk class, signals; note the AI-failure-mode table).
2. `operations/reminders-2026-07/2026-07-26-practice-reminders-HUMAN-build-plan.md` — **§1 (the five binding constraints), §6 (Phase 1), §11 (boundaries) in full.** §1's language rule governs every string this session writes.
3. The predecessor close (above), especially its "Next Session Should" block.
4. `/operations/decision-log.md` — the last three entries.

Confirm at open: tier (`code-elevated`); hold-point (P0 0h active — unaffected); model (no LLM calls in this session's product code — N/A row); status vocabulary; signals.

## Part B — Procedure

### Step 0 — THE CONSTRAINT THAT SHAPES THE WHOLE BUILD (read before designing anything)

`website/src/app/welcome/page.tsx` **is a guarded `TARGET_FILES` entry** of `src/app/logos/__tests__/human-practitioner-boundary.test.ts`. Both `@/lib/milestones` and `@/lib/brand-display` carry a `stoic-brain` specifier, so importing either into `/welcome` — or into anything `/welcome` imports directly — fails the guard. Prior sessions left in-source warnings at `welcome/page.tsx:100`, `morning/page.tsx:181`, `sage-compass/page.tsx:250`, `oikeiosis/page.tsx:386`, `premeditatio/page.tsx:294`.

**And a trap the plan does not name.** The guard follows exactly **one hop**. If `practice-sequence.ts` imports `./brand-display` (for the proximity-level type, as plan §6 suggests), then `/welcome → practice-sequence → brand-display → stoic-brain` is two hops and **the guard would pass while the import chain still reaches `stoic-brain`.** That is an accidental circumvention of the measurement-neutrality guard, not a clever workaround.

**Therefore: `practice-sequence.ts` must be ZERO-IMPORT.** Define the proximity-level union locally, exactly as `/sage-compass` defines its virtue vocabulary locally rather than importing the engine's. Assert the zero-import property in the new boundary test. If you find yourself wanting the type from `brand-display`, that is the moment to stop and define it locally instead.

### Step 1 — Ground first-hand
Read in full: `welcome/page.tsx` (note its current "no single right order" copy at ~:138-141 and the "Start with why" card that already sends new users to `/logos`); `dashboard/page.tsx` (the `evaluations.length === 0 ? … : …` ternary that gates the whole practice region — Phase 1 places the new module **above** it); one existing tool route (`api/mentor/morning/route.ts`) for the auth + query idiom; one existing `human-practitioner-boundary.test.ts` for the test idiom; `src/lib/logos-teaching.ts` as the zero-import content-module precedent.

Confirm which tables back each of the seven tools and their exact `(user_id, created_at)` shapes before writing the status query.

### Step 2 — `website/src/lib/practice-sequence.ts` (new, pure, ZERO-IMPORT)
- `PRACTICE_SEQUENCE` — the canonical ordered steps from plan §1 constraint 4: step 0 `/logos` (the prerequisite orientation, already fronted by `/welcome`'s "Start with why"), then `/morning` → `/passion-log` → `/view-from-above` + `/oikeiosis` (paired) → `/premeditatio` → `/hupexairesis` → `/sage-compass`. Each step `{id, name, href, doorbell}`, where `doorbell` is one pre-authored line inviting a beginning and **nothing more** — constraint 1, *"the alarm is a doorbell, not a door."*
- `STAGE_PRACTICES` — the §1 stage↔tools mapping keyed by proximity level, with The Inner Fire mapping to **no** tools plus the mentor's "no longer needs the scaffolding in the same way" line.
- Every user-visible string is pre-authored and exported, and **test-pinned as an exported value, not by source substring** (the standing `content pins assert exported values` lesson — a source-text match is satisfied by a comment or an identifier).

### Step 3 — `GET /api/mentor/practice-status` (new)
User-JWT auth matching the sibling tool routes. Returns per-tool `{last_used_at, count}` (one indexed `LIMIT 1` read per practice table + journal + evaluations) and `next_in_sequence` (the first sequence step with no rows). Read-only; writes nothing; no substrate imports. Ships with its own `__tests__/human-practitioner-boundary.test.ts` per the family pattern.

**Carry the Phase 0 lesson:** verify every column you select actually exists in that table's migration before you run anything. The pattern is `src/lib/__tests__/action-evaluations-v3-schema-drift.test.ts` — a four-month silent outage came from exactly this.

### Step 4 — The dashboard "Your practice" module
Renders for **every** signed-in user including zero-evaluation ones — placed **above** the `evaluations.length > 0` gate. Shows the sequence with used/unused state and names the next practice with its doorbell line. For a brand-new practitioner it reads: begin with *why* (`/logos`), take your baseline, then morning preparation. **No percentages, no completion framing, no streaks** (§11).

### Step 5 — `/welcome`, per election E2
"Where to start" becomes the ordered default path — Start with why (`/logos`, unchanged, first) → baseline → the daily mirror → the practice tools in sequence — with the freedom note **softened, not deleted**: the order is a default, not a rule; nothing is locked. Add `/passion-log` (currently absent from `MORE_TO_EXPLORE`); reference `/glossary` and the Stage pages where natural. **Re-read Step 0 before touching this file.**

### Step 6 — Verify
- New unit suite for `practice-sequence.ts` (assert on exported values) + the new route's boundary suite.
- **Re-run all seven existing boundary suites** — `/welcome` is guarded, so the logos suite is a real gate this session, not a formality.
- `npx tsc --noEmit` exit 0; `npm run build` exit 0 (new route + changed pages ⇒ the build gate is mandatory; `tsc` alone does not validate route exports).
- Browser: signed-out → new-user → returning-user walkthrough on the dev server (`.claude/launch.json` exists; `npm run dev` targets the TEST project, so the founder's own history will not appear there — the real check is post-deploy).
- **Mutation-test the new pins** before believing them. Phase 0's suite passed a mutation that should have failed it, because every fixture happened to share a property. And verify each mutation actually applied — one Phase 0 mutation silently landed on the wrong occurrence and reported a false clean.

### Step 7 — Adversarial review
Independent Workflow per PR19 and the family precedent. **If it dies on the spend limit** (it did in Phase 0 — all 9 agents), complete it first-hand across every dimension and **disclose the single-perspective limit in the records**; do not silently drop it. Include a dimension that reads files the diff does *not* touch — that is how Phase 0's determinative defect was found.

### Step 8 — Records
Lean decision-log entry; session close with a ready-to-paste commit block; update the plan's §6 status line; name the successor. **Founder-facing verification steps must be bare SQL in a `sql`-tagged block, not a `psql` shell wrapper** — the founder works in the Supabase SQL editor.

## Part C — Anticipated session shape

| Phase | Estimate |
|---|---|
| Cache + plan §1/§6/§11 + close read | 20–25 min |
| Step 0–1 grounding | 30–40 min |
| Steps 2–3 lib + route | 60–75 min |
| Steps 4–5 dashboard + welcome | 45–60 min |
| Step 6 verify (incl. mutation testing) | 40–50 min |
| Step 7 review | 30–40 min |
| Records + close | 25–30 min |
| **Total** | **~4–5 h (the plan's ~1 session)** |

## Rollback path

`git revert` the session's commit — one new pure lib, one new read-only route, two changed pages, tests. No schema, no flag, no migration, nothing to un-award.

## Open items carried (not this session's work)

- **R17:** the `milestones` table is absent from all data-rights paths — Critical, founder-walked, gates external onboarding. Task chip exists.
- **`oikeiosis_context` is never written** by the score insert, so `oikeiosis_community` / `oikeiosis_humanity` remain structurally unearnable. Confirmed live 2026-07-26. A write-side change; its own decision.
- `earned.add(id)` hardening in `checkNewMilestones`' `award()` — no duplicate is producible today.
- The milestones route's `action_evaluations_v3` query has no `.limit()` — an unbounded per-user scan on every dashboard mount.
- Phase 0's adversarial review was completed first-hand after the Workflow died on the spend limit. An independent re-run remains worthwhile.

## Forecast

Success = a practitioner who has just signed up lands on the dashboard and is told, in the mentor's own order and in doorbell language, exactly what to do first — and one who has been practising for months sees which tools they have not yet met. That closes the sequence trigger. Next: **Step M** (the mentor consultation vetting both DRAFT mapping tables, which gates Phase 2/3 *content*), then Phase 2 (in-session suggestions), Phase 3 (the stage-crossing card, which Phase 0 has now made buildable), and Phase 4 (the daily rhythm strip).

End of prompt.
