# Close — the PostgREST 1,000-row cap on `/api/founder/hub`, fixed + swept

**Date:** 2026-09-02, written 2026-09-03. **Tier:** `code-critical` (a live founder-facing governance
surface; AC5-adjacent by the perimeter this route sits inside, PR6, PR19 required). **AC7:** not
engaged — nothing in this session pushed, deployed, or touched production; the fix ships on the
founder's next push and the un-archive is its own founder-walked step (§7). **Session model:**
`claude-opus-5` at open, switched to `claude-sonnet-5` mid-session by the founder's own `/model`
commands (both disclosed per PR22). **Effort:** high, dropping to default after the model switch.

**Decision-log entry:** `D-FOUNDER-HUB-POSTGREST-ROW-CAP-FIXED-AND-SWEPT-2026-09-03` (below, to be
appended). **Predecessor:** `D-FOUNDER-HUB-POSTGREST-ROW-CAP-FOUND-CONFIRMED-NOT-FIXED-2026-09-02`.

---

## 1. What this session did, in order

1. Re-derived the defect at open (§0 of the handoff prompt) — confirmed live in the two named
   call sites, confirmed HEAD, confirmed no peer had already fixed it.
2. Extracted both reads into a new module, `website/src/app/api/founder/hub/conversation-history.ts`:
   `loadRecentHistory` (the mentor's newest-N context window, explicit `.limit()` + exact count) and
   `loadConversationPage` (keyset pagination on `(created_at, id)`, robust even under a max-rows cap
   smaller than the requested page — the property that makes this a real fix, not a bigger band-aid).
3. Wired both into `route.ts` (POST `load_history`; GET `?conversation_id=`), fixed
   `message_count` to the exact prior count, and made a DB read error on POST throw instead of
   silently degrading the mentor's memory (matching the 2026-09-01 fail-loud precedent).
4. Added a **"Load earlier messages"** affordance + cursor state to both `private-mentor/page.tsx`
   and `founder-hub/page.tsx`, with scroll-suppression on prepend.
5. Wrote an EXECUTED regression test (`conversation-history-row-cap.test.ts`, 74 assertions) with a
   cap-modelling fake client: a negative control reproduces the exact production symptom against the
   pre-fix chain shape (rows 981-1000, the mentor pinned to row 1000) before any positive assertion
   runs; mutation-verified four ways in an isolated scratch copy (the fix reverted, the limit
   dropped, the order flipped, the cursor branch disabled — all four fail the test).
6. Built a codebase-wide sweep tool (`website/scripts/unbounded-select-sweep.ts`) and ran it: 441
   read chains, 85 unbounded-read candidates, 3 confirmed-bounded continuations. Classified every
   candidate first-hand against the code (a table-cardinality dossier from one surviving workflow
   agent fed the classification but did not substitute for it) —
   `2026-09-02-unbounded-select-sweep-REPORT.md`.
7. Launched a PR19 independent review of the fix itself (7 dimensions). It died on the account
   session limit **three separate times** across the session (14/15, then 11/12, then 34/40 agents
   errored). Per the review harness's own findings, 16 findings were raised, but the workflow's
   adjudication logic silently marked every finding with zero surviving refuter votes as REFUTED —
   which is **not the same as refuted**; it is unreviewed. §5 below re-does that adjudication
   first-hand, as PR19 §4 requires when the fallback is invoked.
8. Fixed two of the sixteen findings that were genuine on first-hand review (§5); the rest are
   nits/lows, named and left, or already covered by the executed test.
9. Wrote the mentor question on continuity-window size (deliberately NOT decided here, per the
   handoff prompt's explicit instruction) and the founder-walk document for deploying + un-archiving.

## 2. Verified, this session

- `conversation-history-row-cap.test.ts`: **74/0** (includes the negative control, the keyset walk
  across ties at every page boundary, the cap-smaller-than-page robustness case, cursor-param
  validation incl. injection attempts, and source pins confirming the route is wired to the helpers
  with zero remaining unbounded reads on `founder_conversation_messages`).
- `message-persistence.test.ts` (the 2026-09-01 sibling): **13/0**, unaffected.
- `tsc --noEmit`: exit 0. `npm run build`: exit 0, both routes/pages compile.
- `unbounded-select-sweep.ts` run against the full tree: 441 chains, 14 RPC calls (see the report for
  the full classification).

## 3. The sweep — headline (full report is the artifact of record)

12 sites on 4 tables can silently cross the cap **now or within weeks**, all feeding a number
someone reads as true: the A13 cost-health Slack alerts, the A19 abuse-detector identity
enumeration, the A14 SLO tracker, the monthly LLM-cost/revenue figures, and — sharpest — the
provenance-ledger C2 discharge tally that gates slice 5's ENFORCE switch-on (crosses the cap around
**2026-09-17**, inside the readiness window it measures). A governing-surface finding:
`sage-mentor/profile-store.ts:876` (`computeRollingWindow`, live via `updateProfileFromReflection`)
reads the ENTIRE `mentor_interactions` table with no filter at all — 485 rows in August, growing.
A second class, ~30 sites, is every data-rights export/access/delete-driving read: none over the cap
today, all structurally unbounded, so the day any per-user table passes 1,000 rows an Article
15/20 copy or a deletion silently under-delivers while reporting success. Full findings, severity
table, remediation order, and the honest "unknown cardinality" + "checked for misses" sections are
in the report. **Nothing in the sweep was fixed this session** except the two founder-hub sites
themselves — the report is a recommendation artifact, per the handoff prompt's own instruction to
record the sweep "whatever it returns" without building the remediation in the same session.

## 4. The governance question — deliberately not decided

`operations/founder-hub-2026-09/2026-09-02-mentor-question-continuity-window-FOR-RULING.md` states
the question (how much continuity should the mentor have) with the mechanism facts PR20 requires,
and names the 2026-08-31→09-02 contamination window's two open questions (the corrected ruling
generated without seeing its own prior version corrected; the 1 Sep exchange largely uncaptured)
as the founder's to settle, not this session's. **`MENTOR_HISTORY_WINDOW` stays 20**, test-pinned,
unchanged.

## 5. First-hand adjudication of the 16 raised findings (PR19 §4 fallback, invoked a third time)

**Confirmed and fixed (2 of 16):**

1. **`route.ts:1463` — `message_count` falls back to the window length if `total` is ever null.**
   Real, but a control-flow check shows `total` is guaranteed non-null on every path that reaches
   this line today (`if (historyRead.error) throw historyRead.error` runs first, and
   `loadRecentHistory` always requests `{ count: 'exact' }`). Documented in place rather than
   restructured, so a future change to the count request degrades honestly instead of silently.
2. **`founder-hub/page.tsx:203` — an in-flight "Load earlier" response is applied to whichever
   conversation is active when it lands, not the one it was requested for.** Real race (switch
   conversations mid-fetch → conversation A's history prepends onto conversation B). Fixed: the
   requested conversation id is captured at call time and the response is discarded if it no longer
   matches `activeConversation`. `private-mentor/page.tsx` has no conversation switcher, so the same
   class does not apply there.

**Confirmed and fixed, found by direct code-reading rather than the review (1, adjacent to #8/#10 in
the workflow's list):** `private-mentor/page.tsx` set `hasEarlier`/`earliestCursor` from a fetched
page BEFORE checking whether any messages survived the observer-role filter — so on the (currently
unreachable, since private-mentor never writes observer rows) edge case of an all-observer first
page, "Load earlier messages" would prepend real history above the `WELCOME_MESSAGE` card. Fixed:
pagination state is now set only inside the `loaded.length > 0` branch, and explicitly reset to
`false`/`null` on every fallback-to-welcome path.

**Real but left as named, low-priority follow-ups (not fixed this session):**
- The scroll-suppression on prepend stops the view jumping to the bottom; it does not restore the
  reader's exact scroll position, so inserted content can still shift what's on screen. A polish
  item (scroll-anchor restoration), not a correctness defect.
- No focus management / live-region announcement on the "Load earlier messages" button
  (accessibility nit).
- `conversation-history.ts:257`'s `.or()` cursor filter is the one code path the executed test
  cannot exercise against real PostgREST (the fake models the filter grammar, not the wire); the
  founder-walk's §5.3 live smoke is what actually proves it.
- A calendar-invalid-but-regex-valid timestamp (`2026-02-30T00:00:00Z`) 500s instead of 400ing —
  cosmetic status-code imprecision on a founder-only route.
- `route.ts:1459`'s rethrown DB error can render as `"Detail: [object Object]"` in the 500 body when
  the underlying postgrest-js error isn't wrapped in an `Error` subclass — same class the two
  pre-existing insert-throws already have; not a new leak, not shown to the founder (the
  private-mentor page never surfaces the body text).
- No composite index on `(conversation_id, created_at, id)` — a performance note for a conversation
  size this route has never seen and is unlikely to.
- The GET's `limit` param defaults silently on malformed input while the cursor 400s — intentional
  asymmetry (a bad limit has a safe fallback; a bad cursor does not).

**Disclosed limitation, stated three times now and meant this time:** the independent review died
on the account session limit on every one of its three launches. The `pagination-correctness`,
`route-wiring-and-behaviour-deltas`, `client-pages`, and `security` dimensions returned real,
first-hand-verifiable findings before dying on their own refuters; `fake-fidelity-and-test-adequacy`,
`sweep-tool-correctness`, and `claims-vs-code` never ran at all. **A genuinely independent re-run of
those three dead dimensions is a REQUIRED carried follow-up**, per PR19 §4, before this fix or the
sweep report is treated as fully verified — this close records that requirement rather than
substituting for it.

## 6. Rollback

`git revert` the commits carrying `conversation-history.ts`, the `route.ts`/page.tsx changes, the
test, and the sweep script — independently revertable from the sweep report and the mentor-question
document (documents only, no code dependency). No schema change; no flag; nothing to unset.

## 7. Carried (founder-walked, not done this session)

1. **Deploy + un-archive** — `2026-09-02-founder-hub-row-cap-FOUNDER-WALK.md`: push, then restore
   the 1,013-message thread to active (with the (a)/(b) choice about the interim conversation
   created since), then the two acceptance-criteria smokes.
2. **The mentor-continuity ruling** — relay `2026-09-02-mentor-question-continuity-window-FOR-RULING.md`
   once §1's contamination-window verbatim has been read (the prompt names this as the founder's
   own reading, not a session's).
3. **The independent re-review** of the three dead dimensions (§5), required before either artifact
   here is treated as fully verified for a downstream activation.
4. **The sweep's remediation** — §6 of the report, in the order it gives: cost-health/abuse/SLO
   aggregate-in-SQL fixes first (H2–H7), then the two SQL counts that resolve §3's unknowns, then
   the governing-surface fix (`computeRollingWindow`), then the data-rights paging helper, then the
   provenance-ledger tally (report-only/watched today), then the Stripe-activation precondition.

## 8. Rules served

PR6, PR15 (bespoke election: the sweep tool and cap-modelling fake have no Anthropic-primitive or
existing-repo equivalent — checked against the existing `fake-supabase.ts`/`fake-stoa-supabase.ts`
patterns, neither models the row cap), PR18, PR19 (three launches, three exhaustions, disclosed;
first-hand completion per §4; independent re-run named as required, not merely recommended), PR20
(the mentor-question document's mechanism facts, timestamp-checked at drafting), PR22 (both model
switches disclosed), PR23 (the memory `postgrest-row-cap-silent-truncation` written this session,
citing the sibling `missing-table-benign-guards-load-bearing-writes` and
`guard-needs-a-non-vacuity-floor` memories the negative-control/mutation-verification discipline
draws on).

**Status:** Fix built + executed-tested + typechecked + built; two additional first-hand-confirmed
defects fixed; sweep complete and recorded; governance question raised, not answered; independent
review incomplete, disclosed as a required follow-up, not papered over. **Nothing bears on the 0h
call.** Weights BLOCKED unchanged.

---

## Addendum — retroactive PR19 independent review (2026-09-03), the required carried follow-up

Per §5's disclosed requirement, the three dead review dimensions plus a sweep-report adjudication
were re-run independently as four SEPARATE small launches (≤1 agent each, no refuters — the
session-limit lesson at §2 of the successor handoff prompt), against the pushed diff (`git show
a70c467`). **No launch died this time. Zero UNREVIEWED.**

### `fake-fidelity-and-test-adequacy` (never ran before)
**1 HIGH, 1 MEDIUM, 2 LOW, 1 NIT confirmed; 3 sub-areas confirmed clean.**
- **HIGH (disclosed, not fixed this session):** the cap-modelling fake reimplements `.eq()`/`.or()`
  filter-combination semantics from scratch and is never checked against the real
  `@supabase/supabase-js` builder's actual URL/query-param construction. The specific property the
  fix depends on — that `.eq('conversation_id', id).or(cursorExpr)` combines with AND, never OR, so
  a cursor page can't leak another conversation's rows — rests entirely on the fake matching the
  real library's combination behavior, unverified against the real library. Mitigation already in
  the record: the founder-walk's §5.3 live smoke exercised this against real production and passed
  (founder-reported, see the LIVE decision-log entry above). **Fully closing this would mean
  integration-testing against the real postgrest-js builder — out of scope for this fix session;
  named as a carried follow-up, not silently dropped.**
- **MEDIUM (fixed):** `loadConversationPage` had no defensive validation of its own `before`
  parameter — the injection guard lived entirely in the sole caller (`parseConversationPageParams`),
  with only a comment noting the assumption. A future direct caller with a client-influenced cursor
  would reopen the filter-injection class. Fixed: `loadConversationPage` now re-validates
  `before.created_at`/`before.id` against the existing `ISO_TS_RE`/`UUID_RE` and throws before
  constructing the `.or()` string. New test §14 (3 assertions: malformed created_at throws,
  malformed id throws, a well-formed direct-caller cursor is still accepted), mutation-verified
  (reverting the guard fails exactly §14-1/§14-2 and nothing else).
- 2 LOW + 1 NIT: timestamp comparison is lexical in the fake (not a live risk, a coverage-fragility
  note for future fixture reuse); the §11 wiring pins are literal regex matches against route.ts
  source text, disclosed and intentional but brittle to a semantically-identical refactor. Not fixed
  (both named, not blocking).
- Confirmed clean: `.or()` value quoting matches PostgREST's grammar; `count`+`.limit()` combination
  correctly modeled; the cap boundary (`min(explicit limit, maxRows)`) correctly modeled and
  non-trivially exercised at §8.

### `sweep-tool-correctness` (never ran before)
**1 real false negative found and fixed; 4 theoretical-only gaps (no live instance), disclosed.**
- **Real (fixed):** the sweep's root list (`src`, `scripts`, `../sage-mentor`, `../sdk`) never walked
  `website/`'s own top level. `website/hub_id_check.mjs`, a tracked founder-scratch diagnostic
  script, contains two genuine unbounded reads (`mentor_profiles`, `mentor_interactions`) — exactly
  the "verified arithmetic on an unverified set" class this tool exists to catch. Fixed: a new
  non-recursive `walkTopLevel()` scans `website/`'s root only (no double-count of `src`/`scripts`,
  which are already walked recursively). Sweep re-run: candidate count 85→87, exactly the two new
  sites from `hub_id_check.mjs`, confirming the fix and nothing else moved.
- 4 theoretical gaps with no live instance (template-literal dynamic table names captured as false
  literals — misleading but not a missed-chain risk; `.range()` above the server cap trusted as
  bounded — no live site exceeds it; single-branch conditional bounds — none exist in the codebase;
  the 4,000-char continuation window — all 3 real bounded-continuation sites land well under it).
  Named, not built (no live risk today).
- 3 spot-checked classifications (M4's `get_event_counts` fallback, `reflections/route.ts:53`, M6's
  `user/delete` reads) all confirmed correct against source.
- **Verdict on the 85-candidate count:** trusted as a near-floor, not exact — every gap found (real
  or theoretical) pushes the true number UP, never down. Now 87 post-fix.

### `claims-vs-code` (never ran before)
**1 LOW confirmed and fixed; all checked present-tense claims otherwise VERIFIED.**
- The REPORT's §2.4 "NONE — structurally impossible" row for `milestones` cited a UNIQUE constraint
  as the bound, but the UNIQUE index only prevents duplicate `(user_id, milestone_id)` pairs — it
  does not bound the number of DISTINCT `milestone_id` values, which is enforced purely by
  application code (`milestones.ts`'s fixed 24-entry registry), not the schema. A future
  admin/backfill path minting programmatic milestone ids would defeat the "structural" framing with
  no DB signal. Not a current risk (today's registry is static and small) but conflated with a
  strictly stronger DB-CHECK-constrained row (`journal_entries`) in the same severity tier. Fixed:
  report wording corrected in place to name the distinction.
- All other checked claims (the 74/77-assertion count, the exact-count-independent-of-limit
  behavior, the `has_earlier` derivation never defaulting from `returned === limit` alone, the
  journal_entries/milestones/trust_core_store/baseline structural bounds) VERIFIED against source.
- "Mutation-verified four ways" — UNVERIFIABLE by this reviewer (describes a process step performed
  during the original session, not a present-tense code property re-derivable from source alone);
  not contradicted by anything found.

### `sweep-report-adjudication` (never ran before)
**All 9 HIGH rows (H1–H9) CONFIRMED — no downgrades, no unsound fixes.** All cardinality/order/filter
claims verified verbatim against the cited source; the proposed SQL-aggregate/RPC fixes are sound in
shape (no existing RPC does this today, but the report never claimed one does — it correctly
proposes new work). **§2.4 "NONE" rows:** `journal_entries` CONFIRMED genuinely impossible (swept
every later migration touching the table; none widens the CHECK/UNIQUE). `milestones` — same
bypass-scenario finding as `claims-vs-code` above (independently reached by a separate reviewer,
corroborating it): the UNIQUE constraint bounds duplicates, not distinct-value count. No other §2.4
row re-derived from source given this launch's scope.

### Net effect on the fix + sweep artifacts
Two code fixes landed (the `loadConversationPage` defensive guard + the sweep tool's `website/` root
gap), each with an executed, mutation-verified regression pin (test count 74→77; sweep candidate
count 85→87). One documentation fix (the report's milestones row). One finding (test-fidelity against
real postgrest-js) is disclosed and carried, not built — closing it fully is out of scope for a
row-cap bug fix and is mitigated by the founder-walk's live production smoke already having passed.

**Verified after this addendum's fixes:** `conversation-history-row-cap.test.ts` 77/0 (was 74/0);
`message-persistence.test.ts` 13/0 unaffected; `tsc --noEmit` exit 0; sweep re-run 87 candidates
(was 85, +2 from the newly-swept `hub_id_check.mjs`).

**PR19 disposition:** all four dimensions ran independently this time, zero deaths, zero
UNREVIEWED. This retroactive review is now COMPLETE — the fix and sweep report may be treated as
verified for downstream activation, with the one disclosed HIGH (test-fidelity against real
postgrest-js) carried as a named, not-fully-closed residual, mitigated by the live production smoke.
