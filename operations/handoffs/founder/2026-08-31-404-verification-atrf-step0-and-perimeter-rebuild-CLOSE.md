# Session Close — 2026-08-31 — 404 verification · ATRF/EE Step 0 · the perimeter change built, reviewed and reverted

**Stream:** founder. **Tier:** spanned `governance` → `code-critical`; **Critical** sets the form.
**Model:** claude-opus-5, effort high. **Concurrency:** 21 peers (13 interactive) at open; every
commit path-scoped; `website/src/data/environmental-context.json` and all pre-existing strays left
alone except where the founder elected otherwise.

## What landed and is LIVE

| # | Commit | What |
|---|---|---|
| 1 | `cfc84b3` | 404-contract alignment **live-verified, 8/8 green** |
| 2 | `11463a6` | ATRF/EE **Step 0**: all four migration steps already applied on production |
| 3 | `4d230cd` | 32-file records backlog (08-10 → 08-26) + `supabase/.temp/` ignored |
| 4 | `a3e8d8d` | Environmental scan 07-20 → 08-24 |
| 5 | `16818dc` | **Next.js 16.3.0 → 16.3.3** — a CRITICAL advisory, three patches behind |
| 6 | `137bf7a` → `df31616` | Perimeter change, **built then reverted** |
| 7 | `cdb9624` | The PR19 findings register |
| 8 | `eb050ea`, `b630739` | The mentor correction; the corrected ruling adopted |

**Batteries at close:** invocation-guard **689/2 RED (correct — ruled)** · route-wiring **885/0** ·
S10 **198/0** · `tsc` 0 · build 0 on 16.3.3.

## The session's substance

**§1 verification worked exactly as designed** — all eight checks green, and the stop condition was
discharged by *reading the handler* rather than citing it, because a live `curl` cannot distinguish a
conditional clause from an unconditional one.

**Step 0 resolved the queue's most uncomfortable item.** All four ATRF/EE steps were already applied
on production, unrecorded — **the Q5c precedent, repeated exactly.** Twice now. Step 0 itself had two
defects, both fixed: Q1 alone cannot determine step 1 (it reads policies, not grants — Q5 added), and
its stated expectation (`roles = {service_role}`) is one the migration **can never produce**, which
nearly inverted the reading of a correct state into a security alarm.

**The perimeter change is the session's real lesson.** Built to a mentor ruling, self-verified green,
mutation-tested in two directions — and **shipped something worse than what it replaced.** The
redirect returned HTTP 200; the calling page reads 200 as success; a practitioner writing acute
distress into `emotional_state` got a silently unsaved record, the word "saved", and no crisis
resources. Six independent reviewers on isolated checkouts returned **5 CRITICAL · 12 HIGH · 9
MEDIUM**. Three converged independently on a battery never run. Ten mutations — five CRITICAL — left
every battery green.

**The self-review found none of it.** Third consecutive session where independent review caught what
first-hand review missed; second where the miss was the same shape — a pin proving something
*adjacent* to the written invariant.

**A false mechanism fact reached the mentor.** `/api/practice/completion-signal` was relayed as
"carries no human free-text field"; it requires a 5,000-char one. Cause: grepping `route.ts` only —
**the split-file blindness class this codebase had already found and fixed inside the R20a sweep
itself.** Corrected; the mentor re-ruled. The exclusion **stands on the corrected ground**, its
self-sealing trigger replaced, and the screened set **expanded** — enumeration from schema then caught
**two fields the ruling did not name**.

## Errors this session caused, recorded without mitigation

1. **DDL in a runnable block during a live SQL walk** — the founder pasted a `CREATE POLICY` into
   production. Harmless (`42710`) **only because the paired `DROP` was not quoted.**
2. **Committed on top of the founder's open editor** — `.git/MERGE_MSG` was present and was misread as
   benign because `REVERT_HEAD` was absent.
3. **Promised records would survive a revert without checking the commit's file list** — the mentor
   verbatim was staged for deletion; caught and undone before commit.
4. **Isolated reviewer checkouts but not their scratch** — two agents collided in a shared `/tmp/bak`.

## Status changes

| Item | Old | New |
|---|---|---|
| 404-contract alignment | Built, unpushed | **Live, verified** |
| ATRF/EE steps 1–4 | Unknown | **APPLIED (production); walk re-scoped to reconciliation** |
| Next.js | 16.3.0 | **16.3.3** |
| `/api/score/save` perimeter membership | Ruled | **Ruled, adopted, UNEXECUTED** |
| Screened-field scope | 7 (criterion) | **10 (enumerated from schema)** |
| completion-signal exclusion | Ruled on a false fact | **Ruled correct on corrected ground** |

## Next session

`operations/handoffs/founder/2026-08-31-score-save-perimeter-rebuild-NEXT-SESSION-PROMPT.md` —
the rebuild, `code-critical`, fully specified. **Write the functional test first.**

## Production state at close

`origin/main` at `b630739` once pushed. The perimeter change is **out** of production; Next 16.3.3 is
**in**; the ledger flag and C3 soak are untouched (~5 of 90 days). The invocation guard is **red at
689/2 by ruling**. Weights BLOCKED; Q1 holds; the 0h call remains the founder's.

## Founder verification

```
git log origin/main..HEAD --oneline                    # expect empty after push
git show origin/main:website/src/app/api/score/save/route.ts | grep -c enforceDistressCheck   # 0
git show origin/main:website/package.json | grep '"next"'                                     # 16.3.3
```

**Open, carried, none blocking:** TEST's ATRF/EE Step 0 undetermined · `npm audit` 9 vulns / 4 high ·
the `/limitations` ruling collision (two rulings conflict; recorded, not resolved) · CLAUDE.md
substantially stale.
