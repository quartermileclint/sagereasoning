# Next-Session Prompt — the item-4 practice-family RLS walk (item 3 CLOSED)

> **UPDATE, same day as drafting (2026-08-22):** item 3 was activated in this
> stream's founder session, between this prompt's drafting and its use. Live
> smoke confirmed: `{"ok": true, "flag_enabled": true, "deleted":
> {"agent_hold_observations": 0}, "errors": []}`. Recorded at
> `D-C1-AGENT-HOLD-OBSERVATIONS-SWEEP-ACTIVATION-LIVE-2026-08-22`. **Skip the
> item-3 section below entirely — re-verify the flag is still `true` with one
> smoke call if you want the reassurance, but do not re-do the activation
> walk.** The section is left in place, struck by this note rather than
> deleted, so the procedure is preserved for the next similar activation this
> stream runs (the RLS walk below wants the exact same shape: flag-off no-op
> proof, then a live smoke confirming the flag-on shape).

**Paste as the first message of a new session, in the `sagereasoning` repo root.**

**Stream:** founder.
**Tier:** `code-critical` throughout — item 3's flag flip is a deployment-configuration
change (Critical per the standing table); item 4's migration is an
auth/session/access-control change (Critical per PR6 + AC7). Both require the
full Critical Change Protocol, not the lean form.
**Predecessor:** `2026-08-22-mechanical-items-234-and-routing-NEXT-SESSION-PROMPT.md`,
closed this session at commit `5cdf4b9` (pushed, Vercel green). **Do not assume
that HEAD — re-verify with `git log -1` before doing anything.**

---

## Step 0 — Open

1. Read `/adopted/standing-protocol-cache.md` in full.
2. Read this file in full.
3. **Confirm concurrent-session status** via `ListAgents` before doing anything
   with file-edit intent — this stream has had a second active session before.
4. **Check HEAD, do not assume it.** Confirm `git log -1` matches `5cdf4b9` (or
   later, if something landed since). Re-verify the byte-identity guard posture
   first-hand (`GATE1_FALSE_HOLD_CAPTURE` in the process env AND
   `.claude/settings.local.json`) — it has been OFF/absent across every session
   in this stream so far; confirm it still is, don't infer it from history.
5. **Re-derive every count and status claim in this document from source before
   acting on it.** This stream has now had four stale-carried-count incidents
   (the R20a perimeter count, "14 remaining routes," the runtime-invocation-test
   scope, and item 3's "sweep needs building" when it was already built dark).
   Treat every claim below the same way.

---

## What just closed (do not re-litigate)

- **Mechanical item 2** (per-route R20a runtime invocation tests) — closed.
  Two new batteries: `website/src/lib/__tests__/r20a-gap-closure.test.ts` (64/0,
  runtime, the shared module's real functions) and
  `website/src/lib/__tests__/r20a-gap-closure-route-wiring.test.ts` (885/0,
  structural, all 25 consumer routes via one parameterised config table with
  registry-equality against the filesystem). Committed and pushed at `5cdf4b9`.
  Nothing further to do here.
- **Mechanical item 5** (the standing-runner routing question) — resolved by
  the mentor's 2026-08-21 Q5 ruling before this stream even reached it; recorded
  as spent in the predecessor prompt. Not this session's concern.
- **The adversarial-review discipline held**: a 5-dimension/13-agent workflow
  found 7 confirmed findings (all LOW/nit) across items 2/3/4, all folded before
  commit — including catching a wrong count IN THE FIX FOR A PRIOR WRONG COUNT
  (the honesty-edit docstring said "25 call sites," the true figure is 29). This
  is now the fifth instance of this exact failure class in this project; treat
  it as confirmation the discipline is necessary, not evidence it can be relaxed.

---

## Confirmed order — item 3 (if not already activated), then item 4

### Item 3 — retention sweep activation (may already be DONE — check first)

**Check before doing anything:** did the predecessor session's founder-walked
activation happen between sessions? Look for a decision-log entry naming
`SUBSTRATE_HOLD_OBSERVATIONS_SWEEP_ENABLED` activation, or just run the smoke
curl below and read the result — `flag_enabled: true` means it's done.

If NOT yet activated:
1. Founder sets `SUBSTRATE_HOLD_OBSERVATIONS_SWEEP_ENABLED=true` in Vercel
   Production env vars, then redeploys (env var changes need a new deployment
   to take effect on an already-built deployment).
2. Founder runs the smoke (the AI does not have `CRON_SECRET` — it is
   correctly absent from every local env file):
   ```bash
   curl -s https://www.sagereasoning.com/api/cron/agent-hold-observations-retention-sweep \
     -H "Authorization: Bearer <CRON_SECRET>" | python3 -m json.tool
   ```
   Expect `{"ok": true, "flag_enabled": true, "deleted": {"agent_hold_observations": 0}, "errors": []}`.
   Zero deleted is honest — the table is five-plus weeks old at most, nothing
   is past `retain_until` yet.
3. Append a lean decision-log entry recording the activation (per
   `/adopted/standing-protocol-cache.md` §"Lean decision-log entry" — this is
   the founder-walked Critical step's own record, distinct from the build
   session's entry).

This closes the PR24 debt for `agent_hold_observations` entirely.

### Item 4 — the practice-family RLS lockdown walk (the main event this session)

**Deliverables from the predecessor session, ready to walk:**
- `website/supabase-practice-family-rls-lockdown-migration.sql` — locks down
  ten tables (survey Class A rows 2–11: `sage_compass_entries`,
  `morning_preparation_entries`, `view_from_above_entries`,
  `reserve_clause_entries`, `circle_extension_entries`,
  `oikeiosis_reflections`, `premeditatio_entries`, `passion_events`,
  `realtime_journal_entries`, `mentor_baseline_appendix`) to the proven
  service-role-only shape, following the `impulse_entries` precedent exactly.
- `website/scripts/practice-family-rls-bypass-proof.ts` — one generalised
  harness (table-configured, not ten bespoke scripts) with per-table
  bypass-attempt bodies satisfying every NOT NULL/CHECK constraint, and
  `--legit` route-level bodies for nine of the ten tables (`mentor_baseline_
  appendix` deliberately has no `--legit` config — its write path is the full
  appendix generation flow; verify that table's legitimate path via the
  founder UI instead, per the harness's own header note).

**Read the migration file's own header in full before starting** — it carries
the complete walk procedure (§PRE/§APPLY/§VERIFY/§INVERSE per table), the
safety reasoning (every consumer verified service-role, zero client-side
usage, the corrected SECURITY DEFINER cross-check), and **one disclosed,
pre-existing gap this migration deliberately does NOT close**: four of the ten
tables have non-`security_invoker` aggregate views built on them
(`oikeiosis_stage_progression`, `passion_weekly_catch_rate`, etc., in
`supabase-mentor-gaps-migration.sql` and `20260413_logging_refactor_gap4.sql`)
that this migration's table-level REVOKEs do not gate. Read that disclosure
block before deciding whether this session should also scope closing it (it is
named as its own Critical follow-up, not pre-approved for this session).

**Procedure (mirrors the `impulse_entries` walk exactly, batched over ten tables):**

1. **§PRE, TEST, ALL TEN TABLES FIRST** — before applying ANY `§APPLY` block,
   capture the "before" state for every table: `pg_policies` row counts (§PRE-P1
   per table — nine tables expect 5 rows, `mentor_baseline_appendix` expects 3,
   per the migration's own per-section notes), RLS-enabled confirmation
   (§PRE-P2), and the behavioural bypass proof via
   `npx tsx --env-file=.env.development.local scripts/practice-family-rls-bypass-proof.ts <table>`
   for each of the ten (or `--all` to run every table in one pass) — expect
   INSERT SUCCEEDS (bypass open) for all ten.
2. **§APPLY on TEST** — run the full migration (or per-section, if the founder
   wants to batch smaller).
3. **§VERIFY on TEST** — re-run the policy/RLS/grant checks (V1–V3) and the
   harness in default mode (V4, expect DENIED now) for every table, then
   `--legit <table>` (V5) for the nine tables that have a legit config, with a
   local dev server running (`npx next dev --env-file=.env.development.local`).
   Confirm `mentor_baseline_appendix`'s legitimate path separately via the
   founder UI (the appendix generation flow).
4. **Only after all ten show clean TEST verification**, repeat §APPLY + §VERIFY
   on production — **skip the harness's default-mode WRITE step on production**
   per its own safety rail (it refuses to run there without `--force-nontest`);
   run only the read-only confirmation shape, mirroring the
   `founder_conversations` precedent (an unauthenticated/bypass GET before, a
   `42501`/denied after — no write attempted on real practitioner data).
5. **PR19**: independently adversarially review the applied state (not just the
   file) — confirm via direct `pg_policies`/grant queries on production that
   the ten tables now match the target shape, and that the row counts are
   unchanged (no data lost).
6. **Decision-log entry + session close**, full Critical form per
   `/adopted/standing-protocol-cache.md` §"Critical-risk sessions" — this is a
   founder-walked live production auth-surface change; do not compress it to
   the lean template.

**This closes items 1–4 of the survey's recommended backlog order.** What
remains open afterward, named so it is not silently dropped:
- Class A rows 13–18 (lower-stakes; two are dead tables — `progress_snapshots_v3`,
  `baseline_assessments` v1 — candidates for a disposal decision, not a lockdown).
- Class B (`action_evaluations_v3`, `journal_entries`, `reflections` SELECT) —
  each needs a route-change-first design, not a lockdown migration; `journal_
  entries` additionally needs a live-state SQL read before even that, since it
  has no migration file in the repo at all.
- Row 28 (`environmental_context`) — an intent question (is public SELECT
  deliberate?), not a mechanics question.
- **The disclosed non-`security_invoker` aggregate-view gap** found by this
  session's own PR19 review (see the migration header) — its own Critical
  decision, not pre-scoped here.

---

## What does not move in this session

- **Class A rows 13–18, Class B, row 28** — named above, explicitly out of
  scope unless the founder redirects.
- **The non-`security_invoker` view gap** — disclosed, not pre-approved for a
  fix. If this session wants to take it on, treat it as its own scoping
  question first (name the eight views, decide REVOKE vs `security_invoker`
  rebuild vs drop-if-dead, get founder sign-off) rather than folding it into
  the ten-table walk.
- **Mechanical item 6 (housekeeping)** — the stale-DARK-claim line-number
  re-check in `watching/handler.ts`, the `idea-loop-types.ts` citation drift,
  and the `environmental-context.json` commit-or-discard decision (now carried
  across five-plus sessions). Pick up only if time permits after item 4 closes.
- **M-5(b)'s identity-threading follow-up**, **M-4's `KEEP IN SYNC` banner
  drift**, **GS-ATRF-1 §(c-bis)** — named, standing, separate. Not this session
  unless it independently ends up there.

---

## Constraints that bind regardless

- **PR6 + AC7** — the Critical Change Protocol applies to both item 3's flag
  flip and item 4's migration in full: what's changing, what could break, what
  happens to existing sessions, rollback plan, verification step, explicit
  founder approval naming the specific risks. Do not abbreviate to the lean form.
- **PR19** — independent adversarial review is required (not optional) before
  either item 3's activation or item 4's migration is treated as verified. Item
  4 in particular touches auth/access-control on ten live tables with real
  practitioner data (`oikeiosis_reflections` and `passion_events` in
  particular carry intimate content) — the review must include a live
  behavioural check on production, not just a read of the applied SQL.
- **PR20** — timestamp-check every present-tense mechanism fact in this
  document against the current codebase before relying on it (starting with
  whether item 3 is already activated).
- **PR23** — consult the memory index before diagnosing or writing in a
  recurring problem class. `Supabase view default grants + auto-updatable` is
  directly relevant to the disclosed aggregate-view gap if this session
  touches it; `primary data beats secondary characterisation` and `shared
  flag: dark is per-flag, not per-feature` are both directly relevant to this
  session's core work.
- **The mentor-mandated backlog order** (item 1, `impulse_entries`, done
  2026-08-16) governs only that item 1 came first — the order for items 2–11
  is the founder's election, already exercised (rows 2–11 batched together,
  per the founder's own choice this session).
- Every prior commit in this stream has been PR19-reviewed before committing,
  including mechanical/uniform changes across many files. Hold the same bar
  here — ten near-identical migration sections is exactly where a copy-paste
  policy-name typo hides (the migration-fidelity review dimension exists for
  precisely this).

---

*End of prompt. Commit `5cdf4b9` landed and pushed this session (Vercel green),
carrying items 2's tests + item 3's cron entry + item 4's migration and
harness. Item 3 was activated and live-smoked the same day, recorded at
`D-C1-AGENT-HOLD-OBSERVATIONS-SWEEP-ACTIVATION-LIVE-2026-08-22` — CLOSED, do
not re-do it (see the note at the top of this file). Item 4's migration is
authored but not yet applied to any environment. This session picks up
directly at the item-4 ten-table walk — re-deriving every carried claim from
source before acting on it, per this stream's own
standing discipline.*
