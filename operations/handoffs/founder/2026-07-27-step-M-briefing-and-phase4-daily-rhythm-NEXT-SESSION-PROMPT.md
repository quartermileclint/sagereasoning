# Next-Session Prompt — Step M Briefing + Practice Reminders Phase 4: The Daily Rhythm

**Stream:** founder (website build).
**Tier:** `code-elevated` (Part 2); Part 1 is `governance`. The highest category sets the form — treat the session as `code-elevated`.
**Governing frame:** `/adopted/standing-protocol-cache.md` (full governance via the cache; deliverables named below).
**Predecessor session close:** `operations/handoffs/founder/2026-07-27-practice-reminders-human-phase1-sequence-trigger-CLOSE.md`.
**Predecessor decision-log entry:** `D-PRACTICE-REMINDERS-HUMAN-PHASE1-SEQUENCE-TRIGGER-BUILT`.
**Risk classification:** Elevated under 0d-ii (changes to existing user-facing functionality; one existing route extended). **Critical Change Protocol NOT engaged** — no schema, flag, auth-model or deploy-config change is in scope. AC7/PR6 not engaged. KG1 awareness only (the route stays read-only).

## Where the arc stands

Phases 0 and 1 are **built**. Phase 0 (milestone awarding) is deployed and live-verified. Phase 1 (the sequence trigger) is committed-ready but **check whether the founder has pushed it** — if `git log` does not show the Phase 1 commit, it is still local.

What exists now: milestone awarding fires; the dashboard carries a "Your practice" module for every signed-in practitioner; `/welcome` presents the mentor's ordered path; and `GET /api/mentor/practice-status` already returns per-practice `{status, met, last_used_at, count}` plus a `rhythm` block for the journal and action evaluations.

**Two phases are blocked on Step M's content, and Step M has no briefing yet.** That is Part 1. Phase 4 is the one phase that needs nothing. That is Part 2.

## Why this session matters

Part 1 unblocks Phases 2 and 3 — currently the only thing standing between the plan and its remaining three phases is a consultation nobody has drafted the questions for. Part 2 completes the mentor's daily-rhythm counsel: the school model's *daily* cadence (Seneca's evening examination, `De Ira`), rendered in-product as states rather than commands.

## Pre-conditions

1. Phase 1 is committed (and ideally pushed + Vercel-green). If unpushed, that is fine for building — but say so in the close, and do not assume the founder has seen it live.
2. `git status` is clean apart from any other thread's carry-forwards, which are **not this session's to stage**.
3. **Run all eight `human-practitioner-boundary` suites first.** The logos suite carries a repo-global git byte-identity guard, so a dirty file elsewhere in the measured set fails it — you want to know that before you start.
   ```bash
   cd website && for f in $(find src -name 'human-practitioner-boundary.test.ts' | sort); do printf "%-58s " "$f"; npx tsx "$f" 2>&1 | grep -oE '[0-9]+ passed, [0-9]+ failed'; done
   ```
   Expected at open: 466 / 466 / 327 / 445 / 451 / 527 / 466 / 249, all 0 failed.

## Part A — Open under the protocol

Read in order:
1. `/adopted/standing-protocol-cache.md` (~3 min — tier, model, risk class, signals; note the AI-failure-mode table).
2. `operations/reminders-2026-07/2026-07-26-practice-reminders-HUMAN-build-plan.md` — **§1 (the five binding constraints), §7 (Phase 2 mapping table), §8 (Phase 3), §9 (Phase 4), §10 (Step M), §11 (boundaries) in full.** §1's language rule governs every string this session writes.
3. `operations/reminders-2026-07/2026-07-26-practice-reminders-AGENT-build-plan.md` §5 — the agent mapping table, which is Step M item 2.
4. The predecessor close (above), especially "Next Session Should" and "Open Questions".
5. `/operations/decision-log.md` — the last two entries.

Confirm at open: tier; hold-point (P0 0h active — unaffected); model (no LLM calls in this session's product code — the AC1 N/A row); status vocabulary; signals.

## Part B — Procedure

### Step 0 — Constraints that shape the build (read before designing anything)

**A. The measurement boundary.** A 7-day false-hold observation window measures `/api/reason` and `/api/guardrail`. No file in either import graph may be edited — including `stoic-brain.ts` and **`website/src/lib/security.ts`**. Importing is fine; editing is not.

**B. The zero-import rule for `practice-sequence.ts`, and the accurate reason.** `/welcome` is a guarded `TARGET_FILES` entry of `src/app/logos/__tests__/human-practitioner-boundary.test.ts`, which follows exactly **one hop**. `practice-sequence.ts` is imported directly by `/welcome`, so anything *it* imports sits at hop two, outside that guard's reach.

> **Correction carried forward, because the Phase 1 prompt got this wrong and the Phase 1 build's first fix got it wrong in the other direction.** A `/welcome → practice-sequence → brand-display → stoic-brain` chain does **NOT** fail the logos guard — mutation-verified, 249 passed / 0 failed. `stoic-brain` is *allowlisted* there rather than forbidden. That suite's symbol allowlist **does** also run on one-hop helpers (`LOGOS-BT-6`), but it never fires, because the hop-one specifier is `brand-display`. What binds is **plan §11**, not the guard. Keep `practice-sequence.ts` at zero imports — the new boundary suite asserts it directly.

**C. Rate limits.** `checkRateLimit` keys buckets by IP **within a category store**, and `/api/reason` uses `RATE_LIMITS.scoring`. Any human route firing on page load must use `RATE_LIMITS.analytics`. **Do not add a new `RATE_LIMITS` category** — that means editing `security.ts`, which constraint A forbids.

### Step 1 — Ground first-hand

Read: `src/lib/practice-sequence.ts` (esp. `RHYTHM_TABLES`, `foldPracticeStatuses`, the copy constants); `src/app/api/mentor/practice-status/route.ts`; `src/components/PracticeSequenceModule.tsx`; `src/app/dashboard/page.tsx`; the two existing cadence banners at `src/app/premeditatio/page.tsx:258,334` (Monday) and `src/app/oikeiosis/page.tsx:233-242,759-778` (quarterly).

### Step 2 (Part 1) — Author the Step M briefing

Deliverable: `operations/reminders-2026-07/2026-07-27-step-M-mentor-briefing.md`, written **for the founder to send to the private mentor**. Cover all five §10 items:

1. **The §7 human mapping table** — restate the two mentor-given anchors verbatim, then present every `Proposed` row as an explicit question. Flag the two the plan itself marks low-confidence (`hedone → morning preparation`; `hupexairesis separates_action_from_outcome=false → view-from-above`).
2. **The agent mapping table** (companion plan §5).
3. **The §1 stage/sequence non-linearity reading** — the plan's stated interpretation is that *the stages are conditions, not a corridor*. This is currently the plan's reading, **not a mentor verdict**. It is now encoded in shipped code (`STAGE_PRACTICES`, and pin D13 asserts the non-linearity is preserved), so a correction here has a code consequence. Say so plainly in the briefing.
4. **The §9 returning-practitioner line and the §8 earn-moment copy** — draft text for both, presented as drafts.
5. **The named morning-gate limitation** (§7's closing paragraph): the mentor's second worked example needs an obligations-vs-externals signal the morning gate does not produce (`prepared|vague` only). Ask whether enriching that gate is wanted, noting it would need its own measurement-neutrality review.

**Tone rule:** the briefing asks; it does not lead. Where the plan proposed something, say it is proposed. Outputs are **binding** per the project's mentor-verdict convention, so do not smuggle in assumptions the mentor has not made.

**Note the ordering tension honestly.** §10 says Step M "does not gate Phase 4", yet item 4 covers the §9 returning-practitioner line, which is Phase 4 copy. The workable reading: Phase 4 may ship with that line as a **draft** the mentor may revise. State this in the briefing and in the close rather than smoothing it over.

### Step 3 (Part 2) — Extend the status route for the evening pole

**Confirmed gap, verified 2026-07-27:** Phase 4's evening review is "journal **or reflection**", but `RHYTHM_TABLES` reads only `journal_entries` and `action_evaluations_v3`. The reflection surface writes **`reflections`** (`src/app/api/reflections/route.ts:53`, `src/app/api/reflect/route.ts:182`), declared in `website/supabase-reflections-migration.sql` — so it will satisfy the existing C6 schema pin.

Add `reflections` to `RHYTHM_TABLES` in `practice-sequence.ts`. The route needs no other change — it derives its table list from that map. Update the `C6-COUNT` pin (10 → 11) and `C8`.

**Carry the Phase 0/Phase 1 lesson:** verify every column you select exists in that table's migration before running anything. Note that migrations live in **two** places — `website/supabase-*.sql` **and** `api/migrations/` — a search scoped to one is not evidence of absence.

### Step 4 (Part 2) — The rhythm strip

Per plan §9, on the dashboard and **nothing louder**:
- **Morning preparation** — done / not yet *today*.
- **Evening review** — done / not yet *today*, satisfied by a journal entry **or** a reflection.
- The doorbell line appears **only for the not-yet state** (the mentor's own sanctioned example: *"It is time for morning preparation"*).
- **Returning-after-absence:** when every practice surface is idle ≥ 14 days, one gentle line. Draft: *"It has been a while. The practice is here when you turn toward it — begin with whatever is nearest."* No guilt framing, no lapsed-streak framing.
- Fold the Monday and quarterly banners onto the same visual component. **Cadence logic unchanged** — restyle only.

**Design notes:**
- "Today" is a client-side derivation from `last_used_at`. It needs the practitioner's local day boundary, not UTC — a 9pm entry must read as *today* for them. Keep the comparison in the component, and keep the pure lib clock-free (its boundary suite bans `Date.now(`).
- The `unavailable` status must render as **no state**, never "not yet" — the Phase 1 honesty rule.
- All copy pre-authored and exported from `practice-sequence.ts`, **pinned as exported values** (a source-substring match is satisfied by a comment or an identifier).
- §11: no streaks, no percentages, no "N of M", no completion framing.

### Step 5 — Verify

- Extend `src/lib/__tests__/practice-sequence.test.ts`; extend the `practice-status` boundary suite if `TARGET_FILES` grows.
- **Re-run all eight boundary suites** — `/welcome` and the logos byte-identity guard are real gates.
- `npx tsc --noEmit` exit 0; `npm run build` exit 0 (**mandatory** — `tsc` alone does not validate route exports).
- Browser walkthrough on the dev server (`.claude/launch.json` exists). Note `npm run dev` targets **TEST**, so the founder's own history will not appear; the signed-in dashboard render is settled by the founder's post-deploy check, not here. Say so rather than implying otherwise.
- **Mutation-test every new pin, and verify each mutation actually applied before trusting the result.**

  Two specific traps, both of which have now bitten twice in this arc:
  - **One-sided fixtures.** Phase 1 wrote two timestamp fixtures that both put the later value second; a "last wins" mutant passed all 193 assertions. For anything order- or date-sensitive, write the mirror case deliberately.
  - **A pin that does not pin.** Phase 1 shipped a comment claiming a test covered `/welcome`'s stage slugs; nothing did, and a mutation passed 783 assertions across three suites. Treat every "this is pinned by X" comment as a claim to verify.

### Step 6 — Adversarial review

Independent Workflow per PR19. **Budget warning, learned the hard way:** the Phase 0 review died whole on the account monthly spend limit, and the Phase 1 review (6 dimensions × per-finding refuters, ~8.2M tokens) lost 8 of its verifiers to the same limit. **Scope tighter** — 4 dimensions with a single refuter pass is the right size for a change of this scale. Include a dimension that reads files the diff does *not* touch; that is how both prior sessions' determinative findings were found. If it dies anyway, complete it first-hand and **disclose the single-perspective limit in the records**.

### Step 7 — Records

Lean decision-log entry; session close with a ready-to-paste commit block; update the plan's §9 status line (and §10 if the briefing lands); name the successor. **Founder-facing verification must be bare SQL in a `sql`-tagged block, never a `psql` shell wrapper** — the founder works in the Supabase SQL editor.

## Part C — Anticipated session shape

| Phase | Estimate |
|---|---|
| Cache + plan §1/§7–§11 + close read | 25–30 min |
| Step 2 — Step M briefing | 45–60 min |
| Steps 3–4 — route extension + rhythm strip | 60–75 min |
| Step 5 — verify incl. mutation testing | 35–45 min |
| Step 6 — review | 25–35 min |
| Records + close | 25–30 min |
| **Total** | **~3.5–4.5 h** |

Part 1 and Part 2 are independently shippable. If time runs short, land the briefing and close — it unblocks two phases and is the plan's own next step.

## Rollback path

`git revert` the session commit — one documents-only deliverable, one added table name, one new component, one changed page, test updates. No schema, no flag, no migration.

## Open items carried (not this session's work)

- **R17 — the oldest open item in this arc.** The `milestones` table is absent from `/api/user/delete`, `/api/user/export` and `user-data-gathering.ts`, while every sibling practice table is present. It has held real per-user data since 2026-07-26. Exposure is zero pre-0h, but **data deletion is Critical under 0d-ii** — its own founder-walked session, and it **gates external onboarding**. A task chip exists.
- **Rate-limit coupling (pre-existing).** `/api/milestones` and `/api/baseline` both use the `scoring` bucket that `/api/reason` uses, and both fire on a dashboard mount. Phase 1 moved its own route off; these two remain. Task chip `task_94bc8e85` exists.
- **`oikeiosis_context` is never written** by the score insert, so `oikeiosis_community` / `oikeiosis_humanity` remain structurally unearnable. Confirmed live 2026-07-26. A write-side change; its own decision.
- No behavioural test exists for `PracticeSequenceModule` or the `practice-status` handler — the honest-state contract is pinned structurally, not behaviourally.
- `oikeiosis_reflections` is indexed `(user_id, year, quarter)`, not `created_at`, so that one read sorts rather than using the index. Negligible on a quarterly table; named, not fixed.
- `earned.add(id)` hardening in `checkNewMilestones`' `award()`; the milestones route's unbounded `action_evaluations_v3` query.
- Phase 1's review lost 8 verifiers to the spend limit; five findings rest on first-hand adjudication. An independent re-run remains worthwhile.

## Forecast

Success = the founder has a briefing they can send to the mentor today, and the dashboard carries a quiet daily rhythm — morning and evening, states not commands, with the doorbell appearing only where something has not yet been done. That leaves **Phase 2** (in-session suggestions) and **Phase 3** (the stage-crossing card) as the only unbuilt phases, both waiting solely on the mentor's answers.

End of prompt.
