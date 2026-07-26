# Next-Session Prompt — Practice Reminders, Human Plan Phase 0: Wire Milestone Awarding

**Stream:** founder (website build).
**Tier:** `code-elevated`.
**Governing frame:** `/adopted/standing-protocol-cache.md` (full governance via the cache; deliverable-of-the-day named below).
**Predecessor session closes:** `operations/handoffs/founder/2026-07-26-practice-reminders-plans-CLOSE.md` (the plans) and `operations/handoffs/founder/2026-07-26-brand-imagery-prominence-pass-CLOSE.md` (the same conversation's second task — relevant only because it also touched `score/page.tsx`).
**Predecessor decision-log entries:** `D-PRACTICE-REMINDERS-COUNSEL-ANALYSED-PLANS-AUTHORED`, `D-BRAND-IMAGERY-PROMINENCE-AND-COVERAGE-PASS-BUILT`.
**Risk classification:** Elevated under 0d-ii (changes to existing user-facing functionality; existing route). **Critical Change Protocol NOT engaged** — no schema, flag, auth-model, or deploy-config change is in scope. AC7/PR6 not engaged. No KG engages beyond KG1 awareness (the route writes to `milestones` via an existing upsert — no new write shape).

## Why this session matters

The milestone system is **built but never fires**: `POST /api/milestones` (the only award path) has no caller anywhere in the app — verified 2026-07-26 by repo grep (the only fetch is `MilestonesDisplay.tsx`'s GET). None of the 24 milestones, including the five `stage_*` milestones the brand build added, has ever been awarded to anyone. This session gives the award path its callers and closes three sub-gaps inside the route itself. It is **Phase 0 of the human practice-reminders plan** — the prerequisite for the stage-crossing trigger (Phase 3) — and an independently worthwhile latent-defect fix. It does **not** depend on Step M (the mentor consultation); Phases 0–1 carry no mapping-table content.

## Pre-conditions

1. The plans commit (`e232928`) is pushed — `operations/reminders-2026-07/2026-07-26-practice-reminders-HUMAN-build-plan.md` exists in the tree.
2. **The imagery-pass commit is committed** (it modified `score/page.tsx`, which this session also edits — do not work on a dirty copy of that file). If `git status` still shows `website/src/app/score/page.tsx` modified from the imagery pass, STOP and have the founder commit that work first (its close carries the ready-made commit block).
3. `CLAUDE.md` and `operations/handoffs/founder/2026-07-26-corroboration-disclosure-live-verify-NEXT-SESSION-PROMPT.md` may still be modified in the tree — **other threads' carry-forwards, not yours to stage.**

## Part A — Open under the protocol

Read in order:
1. `/adopted/standing-protocol-cache.md` (~3 min — confirm tier, model, risk class, signals; note the AI-failure-mode table).
2. `operations/reminders-2026-07/2026-07-26-practice-reminders-HUMAN-build-plan.md` — **§1, §2, §5 (Phase 0) in full**; skim the rest for shape.
3. `operations/handoffs/founder/2026-07-26-practice-reminders-plans-CLOSE.md` (~3 min).
4. `/operations/decision-log.md` — last 2 entries.
5. `git status` — verify pre-conditions 2–3.

Confirm at open: tier (`code-elevated`); hold-point (P0 0h active — unaffected); model (documentation/code session, no LLM calls of its own — N/A row); status vocabulary; signals.

## Part B — Procedure

### Step 1 — Ground first-hand (do not build from this prompt's claims alone)
Read in full: `website/src/app/api/milestones/route.ts` (~120 lines); `website/src/lib/milestones.ts` — `checkNewMilestones` + `V3MilestoneCheckData` (the evaluation function and its input shape); `website/src/components/MilestonesDisplay.tsx` (the GET consumer); the `action_evaluations_v3` insert site in `website/src/app/score/page.tsx` (grep for `action_evaluations_v3').insert` — line numbers have shifted since the imagery pass); the dashboard load path in `website/src/app/dashboard/page.tsx`. Confirm these session-verified facts still hold: the POST derives `userId` from `requireAuth` (never from the body — sound); the POST's check-data never populates `journalEntriesCompleted` / `journalPhase1Complete` / `daysSinceLastJournalEntry`; `daysSinceLastAction` is computed as the gap between the two most recent evaluations, not days-since-now.

### Step 2 — Named verification: does the GET actually authenticate?
`MilestonesDisplay.tsx` fetches `/api/milestones?user_id=…` with a **plain `fetch`, no Authorization header**, while the route requires `requireAuth` (the human routes are Bearer-JWT per the repo's standing pattern) and ignores the query param. Today's all-grey milestone grid is consistent with BOTH "never awarded" AND "the GET silently 401s and the component renders empty." Determine which, first-hand (dev server + network tab, or read `requireAuth`'s accepted credential sources). If the GET is broken too, fix it the same way the dashboard authenticates its other calls (match the local idiom — e.g. the `authFetch` helper the tool pages use). This is in scope: Phase 0's deliverable is "the milestone system actually works end-to-end."

### Step 3 — Build (per plan §5, scope-tight)
1. **Caller at score save:** after a successful `action_evaluations_v3` insert in `score/page.tsx`, fire-and-forget an authenticated `POST /api/milestones` (never block or fail the save on it).
2. **Caller at dashboard load:** one authenticated POST on load (idempotent — the route upserts on conflict `user_id,milestone_id`) so existing users are retro-awarded from their stored history. Retroactive `earned_at` = now (the award moment) is honest — the record already supports the milestone; awarding is what happens today.
3. **Journal check-data:** populate the three journal fields in the POST's parallel gather (query `journal_entries` for count / max `phase_number` coverage of phase 1 / days since latest `created_at`) so the five journal milestones + `journal_return` become reachable.
4. **`daysSinceLastAction` semantics fix:** days between the most recent evaluation and *now*.
5. **Newly-earned list:** ensure the POST response returns the newly-earned milestone ids/definitions (Phase 3's stage-crossing card consumes this later; if the route already returns it, verify and pin, don't rebuild).

**Scope guards:** no new milestones; no definition changes in `milestones.ts` beyond nothing (definitions untouched); no schema change (`milestones` table exists); no guarded page touched (the seven `human-practitioner-boundary` targets are not in this session's file set — keep it that way); no substrate imports anywhere; no new user-visible copy (if any error/empty-state string is needed, R1/R6c/R9 mirror-language rules apply).

### Step 4 — Verify
- Unit: a small `npx tsx` test for the check-data assembly (journal fields populated; days-since-now semantics; a fixture where a `stage_*` milestone triggers on exact level) — follow the repo's plain-assertion test idiom.
- `npx tsc --noEmit` exit 0; `npm run build` exit 0 (route files changed ⇒ the build gate is mandatory per the standing lesson — `tsc` alone does not validate route exports).
- Browser (dev server, founder's own account): load the dashboard → the POST fires → previously-earned-by-history milestones appear in `MilestonesDisplay` (colour, earned date); score an action → the save still succeeds with the fire-and-forget in place.
- Re-run the seven boundary suites only if any guarded file was touched (it should not be).

### Step 5 — Adversarial review
A review pass per the family precedent (independent Workflow if warranted by the diff size; this is a small, well-scoped change — a focused review of the route diff + callers is proportionate). Verify: the fire-and-forget cannot fail the save path; the dashboard POST cannot loop; idempotency holds on double-fire; the GET auth fix (if made) matches the repo's auth idiom.

### Step 6 — Records (lean forms per the cache)
Decision-log entry (`D-PRACTICE-REMINDERS-HUMAN-PHASE0-MILESTONE-WIRING-BUILT` or similar); session close with the founder commit block; update the human plan's §5 status line (Phase 0 → Built/Verified); name Phase 1 as the successor (its prompt can be authored in that close).

## Part C — Anticipated session shape

| Phase | Estimate |
|---|---|
| Cache + plan §5 + closes read | 15–20 min |
| Step 1–2 grounding + GET-auth determination | 30–40 min |
| Step 3 build | 45–60 min |
| Step 4 verify (tests + build + browser) | 30–40 min |
| Step 5 review | 20–30 min |
| Records + close | 20–30 min |
| **Total** | **~2.5–3.5 h (the plan's ~0.5 session)** |

## Rollback path

`git revert` the session's commit — callers + route edits only; no schema, no flag. The milestone rows awarded before a revert are data the record genuinely supports and may stand (founder's call; deleting them would be a founder-walked data step, not assumed).

## Forecast

Success = the founder loads the dashboard and sees their genuinely-earned milestones (including any `stage_*` their evaluation history supports) for the first time, and every new scored action checks for milestones at the moment it lands. That makes the stage-crossing trigger (Phase 3) buildable and the milestone grid honest. Next: Phase 1 (the sequence trigger — `/welcome` ordered path + the dashboard "Your practice" module), which also needs no Step M; Step M (the mentor consultation over the mapping tables) can be scheduled in parallel at the founder's convenience.

End of prompt.
