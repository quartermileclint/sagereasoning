# Next-Session Prompt — commit item 4's work, then mechanical item 6 + the remaining survey backlog

**Paste as the first message of a new session, in the `sagereasoning` repo root.**

**Stream:** founder.
**Tier:** `governance`/`code-standard` for the commit step and item 6's housekeeping; treat any of the
survey backlog rows as `code-critical` if this session goes on to touch them (auth/access-control
changes are always Critical per the standing-protocol table).
**Predecessor:** `2026-08-22-item4-practice-family-rls-CLOSE.md` — the ten-table practice-family RLS
lockdown (items 1–4 of the survey backlog) is **applied and live on both TEST and production**, but
**the work is uncommitted**. This session's first job is the commit.

---

## Step 0 — Open

1. Read `/adopted/standing-protocol-cache.md` in full.
2. Read this file in full.
3. Read `operations/handoffs/founder/2026-08-22-item4-practice-family-rls-CLOSE.md` in full — it is
   the predecessor close and carries the full record of what item 4 did, found, and fixed.
4. **Confirm concurrent-session status via `ListAgents`** before doing anything with file-edit intent.
5. **Check `git log -1` and `git status` — do not assume either.** At close of the predecessor session,
   HEAD was `6e290cc` and four files were uncommitted (listed in Step 1 below). If HEAD has moved or
   those files are already committed, someone else closed this out between sessions — verify, don't
   assume, and skip Step 1 if so.

---

## Step 1 — Commit item 4's work (do this first, before anything else)

The predecessor session applied a live production RLS migration across ten tables and fixed two real
defects in the verification harness, but never ran `git commit` — that is this session's first
action, not something to hand back to the founder as a manual step.

1. Confirm the four files are present and match the predecessor close's description:
   - `website/scripts/practice-family-rls-bypass-proof.ts` (the id-fallback fix for
     `realtime_journal_entries`'s `--legit` check + the unified TEST-only safety rail)
   - `operations/decision-log.md` (the `D-CONCURRENT-ARC-C4-PRACTICE-FAMILY-RLS-FIX-LIVE-2026-08-22` append)
   - `operations/handoffs/founder/2026-08-22-item4-practice-family-rls-CLOSE.md`
   - `operations/handoffs/founder/2026-08-23-post-item4-housekeeping-NEXT-SESSION-PROMPT.md` (this file)
2. Run:
   ```bash
   cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
   git add website/scripts/practice-family-rls-bypass-proof.ts operations/decision-log.md operations/handoffs/founder/2026-08-22-item4-practice-family-rls-CLOSE.md operations/handoffs/founder/2026-08-23-post-item4-housekeeping-NEXT-SESSION-PROMPT.md
   git status
   ```
   Confirm ONLY these four files are staged — the working tree carries many unrelated untracked files
   and one unrelated modified file (`website/src/data/environmental-context.json`) from prior sessions;
   do not stage them (that decision belongs to item 6 below, not this commit).
3. Commit:
   ```bash
   git commit -m "$(cat <<'EOF'
   Item 4: practice-family RLS lockdown live on TEST + production (ten tables), harness fixes

   D-CONCURRENT-ARC-C4-PRACTICE-FAMILY-RLS-FIX-LIVE-2026-08-22: the ten-table
   practice-family RLS lockdown (sage_compass_entries, morning_preparation_entries,
   view_from_above_entries, reserve_clause_entries, circle_extension_entries,
   oikeiosis_reflections, premeditatio_entries, passion_events,
   realtime_journal_entries, mentor_baseline_appendix) is applied and live on
   production, matching the impulse_entries precedent exactly. Founder-walked
   every SQL step on both TEST and production; AI drove the behavioural
   verification and the PR19 review.

   Two mid-walk findings fixed at the root in
   website/scripts/practice-family-rls-bypass-proof.ts: the realtime_journal_entries
   --legit check was built on a false plaintext-storage premise inherited from
   the migration's own header (the live route actually encrypts those columns
   at rest) -- fixed with an id-based fallback, engaged only when the
   marker-column search finds nothing; and --legit mode had no TEST-only safety
   rail at all, unlike default mode -- fixed by unifying the rail across both
   modes.

   PR19: all four launched review agents died on the account session limit;
   completed first-hand across all four dimensions per this project's standing
   fallback -- zero findings above LOW severity.

   This closes items 1-4 of the RLS-vs-route-enforcement survey's recommended
   backlog order.

   Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
   EOF
   )"
   ```
4. Verify: `git log -1` shows the new commit; `git status` shows the four files no longer in the
   uncommitted list (the pre-existing unrelated untracked/modified files will still show — that's
   expected and correct).
5. Tell the founder the commit landed and ask them to push via GitHub Desktop (per this project's
   standing convention — the AI does not push). No Vercel deploy is expected (no application code
   changed; the harness script and decision-log entry are the only diffs — the migration itself was
   applied via the Supabase SQL Editor in the predecessor session, not via a code deploy).

---

## Step 2 — Mechanical item 6 (housekeeping, if time permits after Step 1)

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

## Step 3 — The remaining survey backlog (founder's election on sequencing)

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

- **PR6 + AC7** — any of the Step 3 items that touch auth/access-control on a live table need the full
  Critical Change Protocol, same as item 4 did. Step 1 (the commit) and Step 2 (housekeeping/a
  disposal-vs-keep decision recorded in prose) are `governance`/`code-standard`, not Critical.
- **PR19** — independent adversarial review before any Step 3 item's migration is treated as verified.
  If the account session limit kills the review agents again, complete the review first-hand per the
  now-repeated precedent — don't wait it out or skip it.
- **PR20** — timestamp-check every present-tense mechanism fact in this document against the current
  codebase before acting on it, starting with whether Step 1's commit is actually still needed.
- **PR23** — consult the memory index before diagnosing or writing in a recurring problem class.
  `Supabase view default grants + auto-updatable` is directly relevant if Step 3 touches the view gap;
  `primary data beats secondary characterisation` is relevant to any row-count or policy-count claim in
  this document — re-derive it from source rather than trust this prompt's own numbers.
- The mentor-mandated backlog order (item 1, `impulse_entries`) governs only that item 1 came first —
  the order for the remaining Class A/B/row-28/view-gap items is the founder's election.

---

*End of prompt. Item 4's commit is Step 1 and should be the very first thing this session does — the
predecessor session ran the entire live production walk and the PR19 review but never committed the
result.*
