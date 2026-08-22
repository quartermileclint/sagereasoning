# Session Close — 2026-08-22 — Item 4: the practice-family RLS lockdown walk (items 1–4 now complete)

**Stream:** founder.
**Governing frame:** /adopted/session-opening-protocol.md (cached via /adopted/standing-protocol-cache.md).
**Tier:** `code-critical` throughout — item 3's re-confirmation and item 4's ten-table production
migration are both auth/access-control changes per PR6 + AC7. Full Critical Change Protocol used, not
the lean form.
**Date:** 2026-08-22.
**Opened at HEAD `6e290cc`** (the item-3-activation-plus-item-4-prompt commit). Working tree at open
carried one pre-existing modified file (`website/src/data/environmental-context.json`) and many
untracked files from prior sessions, none touched this session.

## Decisions Made
- `D-CONCURRENT-ARC-C4-PRACTICE-FAMILY-RLS-FIX-LIVE-2026-08-22` appended (+~90 lines). The ten-table
  practice-family RLS lockdown is applied and live on both TEST and production; two mid-walk findings
  (a false plaintext-storage premise in the harness's `realtime_journal_entries` config; a blocked
  founder-UI path for `mentor_baseline_appendix`'s legit-path check) resolved at the root; PR19
  independent review completed first-hand across all four dimensions after all four launched review
  agents died on the account session limit.
- Item 3 (`agent_hold_observations` retention sweep activation) was already recorded in the
  predecessor session (`D-C1-AGENT-HOLD-OBSERVATIONS-SWEEP-ACTIVATION-LIVE-2026-08-22`) — this session
  re-confirmed it via the prompt's own note rather than re-doing it or re-recording it.

## Status Changes
| Item | Old | New |
|---|---|---|
| `impulse_entries` + these ten tables' route-vs-RLS gap | items 1 done, items 2–4 open | items 1–4 all closed |
| `sage_compass_entries`, `morning_preparation_entries`, `view_from_above_entries`, `reserve_clause_entries`, `circle_extension_entries`, `oikeiosis_reflections`, `premeditatio_entries`, `passion_events`, `realtime_journal_entries`, `mentor_baseline_appendix` | authenticated-session RLS bypass open (route + validation + rate-limit + R20a check all skippable via direct PostgREST) | service-role-only RLS shape live on production, matching the `impulse_entries` precedent exactly |
| `website/scripts/practice-family-rls-bypass-proof.ts` | ten-table harness, one table's `--legit` check silently broken by a false premise; `--legit` mode had no TEST-only safety rail | both fixed at the root; all ten tables' TEST verification (§PRE/§APPLY/§VERIFY V1–V5) genuinely green |

## Verification Method Used
Behavioural, on both environments, mirroring the `impulse_entries` precedent exactly:
- **TEST**: an authenticated throwaway session's direct anon-key INSERT against each of the ten tables
  (§PRE, expect OPEN/201 — confirmed on all ten) → founder-run §APPLY (all ten SQL sections) →
  re-run of the same INSERT (§VERIFY V4, expect DENIED/403·42501 — confirmed on all ten) → the
  legitimate route path re-proven for all ten (§VERIFY V5 — nine via the harness's `--legit` mode
  against a local dev server pointed at TEST, one via a direct real-route POST after the harness's
  by-design exception for that table met an unrelated blocking bug).
- **Production**: an unauthenticated (anon-key only, no session) GET against each table before §APPLY
  (expect `200 []` — permitted-but-filtered, the discriminator this proof rests on, identical in kind
  to the `founder_conversations`/`impulse_entries` precedent) → founder-run §APPLY → the same GET
  re-run twice (once immediately, once again fresh during the PR19 fallback review), both times
  flipping to `401/42501 permission denied` on all ten; a parallel service-role GET confirmed `200` on
  all ten throughout, proving the app's own path unaffected.
- SQL-side checks (policy-row counts, `relrowsecurity`, grant-table rows, row-count parity) were run by
  the founder via the Supabase SQL Editor on both environments and pasted back; the AI ran every
  read-only/behavioural check itself via direct `curl`/`tsx` against both projects.
- PR19: four dimension-scoped review agents (migration-fidelity, consumer-safety, independent
  production re-verification, harness-fix correctness) were launched via the Agent tool; all four died
  on the account session limit before completing (one partial, three zero-output). Completed
  first-hand per this project's own standing fallback: every claim re-derived directly from source
  (grepping each table's origin migration for its original policy names, re-counting `SECURITY
  DEFINER` functions, re-grepping all src consumers) and from fresh live production calls, not from
  re-reading the migration's own comments or the earlier session's summary.

## The three findings most worth the founder's attention
1. **A migration-header comment was wrong about the table it was describing, and it took running the
   code — not re-reading the comment — to find out.** The header claimed `realtime_journal_entries`
   "stores PLAINTEXT impression/assent/action columns"; the live route actually encrypts those fields
   at rest and never writes the plaintext columns. The harness's marker-column search for that table
   could therefore never have worked. Fixed at the root (an id-based fallback), but the standing lesson
   is sharper than the fix: a claim about a table's *current write shape* is a claim about live
   application code, never about a sibling comment describing it.
2. **`--legit` mode had no TEST-only safety rail at all**, unlike default mode — currently harmless
   only because production's env file happens to lack the credentials that mode needs, which is
   incidental protection, not designed protection. Found and closed during the PR19 review itself,
   before it could matter.
3. **No pre-migration row count was captured on production** before `§APPLY` ran there — only the
   read-only unauthenticated-GET check was taken as the "before" state. This is disclosed rather than
   silently treated as a verified diff; the mitigating fact is that none of the ten `§APPLY` statements
   can alter row counts by construction (no `DELETE`/`UPDATE`/`TRUNCATE` anywhere in the file), so the
   absence of a true before/after count diff carries essentially no residual risk here — but it's worth
   naming as a small procedural gap for the next such walk.

## Blocked On
**Files remaining uncommitted (this session's, plus the two carried from the predecessor commit that
were never actually staged there):**
- `website/scripts/practice-family-rls-bypass-proof.ts` (the two fixes)
- `operations/decision-log.md` (the append)
- `operations/handoffs/founder/2026-08-22-item4-practice-family-rls-CLOSE.md` (this file)
- `operations/handoffs/founder/2026-08-23-post-item4-housekeeping-NEXT-SESSION-PROMPT.md` (the
  successor prompt, written this session)

The working tree's many other untracked files (from `2026-08-10` through `2026-08-19` handoff prompts,
the `a3-developmental-streak.py` script, `brand/Brand_Guidelines_superseded.docx`, the inbox `.rtf`,
`sdk/typescript/package-lock.json`, `website/smoke_a_prod.json`) belong to prior sessions and were not
staged or touched, per the standing discipline. The one pre-existing modified file
(`website/src/data/environmental-context.json`) was likewise left untouched — its commit-or-discard
decision is named in mechanical item 6, not this session's to resolve.

**Production state at session close:** all ten practice-family tables (`sage_compass_entries`,
`morning_preparation_entries`, `view_from_above_entries`, `reserve_clause_entries`,
`circle_extension_entries`, `oikeiosis_reflections`, `premeditatio_entries`, `passion_events`,
`realtime_journal_entries`, `mentor_baseline_appendix`) are RLS-locked to service-role-only on
production, matching `impulse_entries`'s precedent exactly; row counts unchanged (`3/5/3/2/0/2/3/3/2/1`
respectively, confirmed post-apply). Item 3's sweep flag (`SUBSTRATE_HOLD_OBSERVATIONS_SWEEP_ENABLED`)
remains `true` from the predecessor session, unchanged this session. No other flag, schema, cron, or
credential touched. AC7 discharged twice this session (item 3's brief re-confirmation, and item 4's
full six-point disclosure before the production `§APPLY`). No mint/revoke/push performed by the AI.

## Next Session Should
Pick up `operations/handoffs/founder/2026-08-23-post-item4-housekeeping-NEXT-SESSION-PROMPT.md` —
mechanical item 6 (the housekeeping backlog: the stale-DARK-claim line-number re-check in
`watching/handler.ts`, the `idea-loop-types.ts` citation drift, and the `environmental-context.json`
commit-or-discard decision), plus the survey's next backlog rows (Class A 13–18, Class B, row 28, and
the disclosed non-`security_invoker` aggregate-view gap) as the founder elects to sequence them.

## Open Questions
- Should the disclosed non-`security_invoker` view gap (8 views over 4 of these ten tables) be closed
  next, ahead of the remaining Class A/B rows? Named in the migration's own header as its own Critical
  decision, not pre-scoped.
- Is `environmental-context.json`'s uncommitted modification (carried across six-plus sessions now)
  ready to commit, or should it be discarded? Revisit at mechanical item 6.

## Founder Verification

**By founder's own direction, this session did NOT run the commit** — it is deliberately deferred to
the successor session's Step 1
(`operations/handoffs/founder/2026-08-23-post-item4-housekeeping-NEXT-SESSION-PROMPT.md`), pasted in
fresh. The exact `git add`/`git commit` command lives there, not duplicated here, so there is only one
copy to keep in sync. Once that session's commit lands, push via GitHub Desktop as usual — no Vercel
deploy is expected (no application code changed; the harness script and decision-log entry are the
only diffs — the migration itself was applied via the Supabase SQL Editor this session, not via a code
deploy).

## Cross-references
- `operations/handoffs/founder/2026-08-22-item3-activation-and-item4-rls-walk-NEXT-SESSION-PROMPT.md` — this session's opening prompt
- `operations/handoffs/founder/2026-08-23-post-item4-housekeeping-NEXT-SESSION-PROMPT.md` — successor prompt
- `operations/decision-log.md` — `D-CONCURRENT-ARC-C4-PRACTICE-FAMILY-RLS-FIX-LIVE-2026-08-22`
- `website/supabase-practice-family-rls-lockdown-migration.sql` — the migration (authored predecessor session, applied this session)
- `website/scripts/practice-family-rls-bypass-proof.ts` — the harness (authored predecessor session, fixed this session)
- `operations/primal-substrate-2026-08/2026-08-16-rls-route-enforcement-survey.md` — the standing backlog this closes rows 2–11 of

## Orchestration Reminder
This session ran no Workflow (no ultracode opt-in in effect); the PR19 review used four parallel
Agent-tool calls, which is within the default Agent-tool policy and did not require the opt-in
Workflow orchestration gate. All four died on a genuine account-level session limit (not a bug in this
session's prompts) and were completed first-hand rather than re-launched or silently skipped.

*End of session close. Items 1–4 of the RLS-vs-route-enforcement survey backlog are now fully closed;
eleven practitioner-data tables across the app (impulse_entries plus these ten) have moved from an
authenticated-session RLS bypass to the proven service-role-only shape, live on production.*
