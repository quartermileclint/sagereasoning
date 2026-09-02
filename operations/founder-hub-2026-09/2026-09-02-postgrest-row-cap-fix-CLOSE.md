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
