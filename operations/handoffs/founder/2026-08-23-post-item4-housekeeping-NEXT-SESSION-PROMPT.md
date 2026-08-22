# Next-Session Prompt — mechanical item 6 + the remaining survey backlog

**Paste as the first message of a new session, in the `sagereasoning` repo root.**

**Stream:** founder.
**Tier:** `governance`/`code-standard` for item 6's housekeeping; treat any of the survey backlog rows
as `code-critical` if this session goes on to touch them (auth/access-control changes are always
Critical per the standing-protocol table).
**Predecessor:** `2026-08-22-item4-practice-family-rls-CLOSE.md` — the ten-table practice-family RLS
lockdown (items 1–4 of the survey backlog) is **applied and live on both TEST and production, and
committed** at `208657f` (committed in the same session as the close, by explicit founder direction —
the close doc's own "did NOT run the commit" framing was superseded within the session; this prompt
reflects the corrected, final state). **Not yet pushed to origin** at the time this prompt was written
— check `git log origin/main -1` vs local HEAD to confirm whether that still holds.

---

## Step 0 — Open

1. Read `/adopted/standing-protocol-cache.md` in full.
2. Read this file in full.
3. Read `operations/handoffs/founder/2026-08-22-item4-practice-family-rls-CLOSE.md` in full — it is
   the predecessor close and carries the full record of what item 4 did, found, and fixed.
4. **Confirm concurrent-session status via `ListAgents`** before doing anything with file-edit intent.
5. **Check `git log -1` and `git status` — do not assume either.** Expected at open: HEAD includes
   commit `208657f` (item 4's commit); the only uncommitted item should be the pre-existing,
   unrelated `website/src/data/environmental-context.json` modification carried from prior sessions.
   If HEAD has moved further, or that file is no longer present, someone else has acted between
   sessions — verify, don't assume.
6. If `git log origin/main -1` does not yet show `208657f`, ask the founder to push via GitHub Desktop
   before or during this session — it has not been pushed as of this prompt's writing.
   applied via the Supabase SQL Editor in the predecessor session, not via a code deploy).

---

## Step 1 — Mechanical item 6 (housekeeping)

Carried across six-plus sessions now, per the predecessor close's "Open Questions" and the original
`2026-08-22-mechanical-items-234-and-routing-NEXT-SESSION-PROMPT.md`'s item 6:

1. `website/src/app/api/practice/watching/handler.ts:10-14` — re-verify the stale "DARK … unset
   everywhere" claim (same class as one corrected in `fresh` two sessions prior; same activation date
   makes it false the same way). **Re-derive the line number from source, don't assume it's still
   10-14** — this exact stream has hit stale-line-number citations more than once.
2. `idea-loop-types.ts` — check whether the `:222`→`:241` line-citation drift named in a prior
   session's close has been corrected everywhere, or whether committed references still cite the stale
   line.
3. `website/src/data/environmental-context.json` — **still requires a decision, not another
   observation.** It has been carried uncommitted across six-plus sessions (confirmed unrelated to any
   of that work by an independent PR19 review in a prior session). Commit it or discard it — the
   founder's call — and record which was chosen and why in a lean decision-log entry.

---

## Step 2 — The remaining survey backlog (founder's election on sequencing)

Named in `operations/primal-substrate-2026-08/2026-08-16-rls-route-enforcement-survey.md` and the
item-4 close, not pre-scoped for this session:

- **Class A rows 13–18** (lower-stakes; `progress_snapshots_v3` and `baseline_assessments` v1 are
  candidates for a disposal decision rather than a lockdown — check first whether they're dead tables
  before writing a migration for them).
- **Class B** (`action_evaluations_v3`, `journal_entries`, `reflections` SELECT) — each needs a
  route-change-first design, not a lockdown migration. `journal_entries` additionally needs a live-state
  SQL read before even that, since it has no migration file in the repo at all.
- **Row 28** (`environmental_context`) — an intent question (is public SELECT deliberate?), not a
  mechanics question.
- **The disclosed non-`security_invoker` aggregate-view gap** (8 views over 4 of the ten just-locked-down
  tables — `oikeiosis_stage_progression`, `premeditatio_engagement`, `passion_weekly_catch_rate`,
  `passion_classification_accuracy`, `passion_intensity_trends`, `realtime_journal_lag_stats` in
  `website/supabase-mentor-gaps-migration.sql`, plus `gap4_month3_review`/`gap4_month6_review` in
  `supabase/migrations/20260413_logging_refactor_gap4.sql`) — its own named Critical follow-up (REVOKE
  the views, rebuild `security_invoker`, or confirm dead and drop — founder sign-off needed on which),
  not pre-approved for this session either.

If this session opens any of these, scope it as its own question first (name the specific tables/views,
decide the mechanism, get founder sign-off) rather than folding it silently into the housekeeping pass.

---

## Constraints that bind regardless

- **PR6 + AC7** — any of the Step 2 items that touch auth/access-control on a live table need the full
  Critical Change Protocol, same as item 4 did. Step 1 (housekeeping/a disposal-vs-keep decision
  recorded in prose) is `governance`/`code-standard`, not Critical.
- **PR19** — independent adversarial review before any Step 2 item's migration is treated as verified.
  If the account session limit kills the review agents again, complete the review first-hand per the
  now-repeated precedent — don't wait it out or skip it.
- **PR20** — timestamp-check every present-tense mechanism fact in this document against the current
  codebase before acting on it, starting with whether item 4's commit has actually been pushed yet.
- **PR23** — consult the memory index before diagnosing or writing in a recurring problem class.
  `Supabase view default grants + auto-updatable` is directly relevant if Step 2 touches the view gap;
  `primary data beats secondary characterisation` is relevant to any row-count or policy-count claim in
  this document — re-derive it from source rather than trust this prompt's own numbers.
- The mentor-mandated backlog order (item 1, `impulse_entries`) governs only that item 1 came first —
  the order for the remaining Class A/B/row-28/view-gap items is the founder's election.

---

*End of prompt. Item 4's commit landed at `208657f` in the predecessor session (by explicit founder
direction, run in-session rather than deferred) — this session opens with item 6's housekeeping, not
a commit step.*
