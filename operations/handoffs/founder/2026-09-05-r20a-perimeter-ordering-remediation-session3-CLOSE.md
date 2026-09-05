# Session close — R20a perimeter-ordering REMEDIATION, Group 1 (Session 3)

**2026-09-05** (machine date). Tier `code-critical`; R20a perimeter, PR6 + AC5. Founder-walked:
the founder pushes and runs the live smokes; AC7 not engaged. Model started `claude-fable-5-1`,
**switched mid-session to `claude-sonnet-5`** via the founder's `/model` command after three
parallel review agents died on the account's Fable session limit. Decision-log entry:
`D-R20A-PERIMETER-ORDERING-REMEDIATION-GROUP-1-BUILT-2026-09-05`.

## Production state at close — UPDATED after the founder's push and smokes

**LIVE.** `c679739` is on `origin/main`, Vercel green (founder-confirmed). All eight Bearer-JWT
smokes ran from a signed-in console and returned as expected — recorded probe-by-probe in
`D-R20A-PERIMETER-ORDERING-REMEDIATION-GROUP-1-LIVE-2026-09-05`. Production is deliberately NOT
byte-equivalent to the audit's HEAD on four human-facing perimeter members. No migration, flag, or
credential touched. `.claude/settings.local.json` untouched. **Correction to the earlier draft of
this close:** the reflect routes' redirect path writes one `analytics_events` row each (pre-existing
safety monitoring, severity + indicators only) — two rows from this walk, on the founder's own id;
nothing else wrote.

## What was built

Four routes' minimum-length distress guards moved to run after the crisis check, per the audit's
§6 Group 1 and the binding ruling:

| Route | Field / bound | Moved to |
|---|---|---|
| `/api/score-conversation` | `conversation` `<20` | after the R20a flag block |
| `/api/reflect` | `what_happened` `<10` | after the redirect-return block |
| `/api/mentor/private/reflect` | `what_happened` `<10` | after the redirect-return block |
| `/api/score-scenario` | `response` `<5` | after the redirect-return block |

Each guard was split (presence/type stays; only the minimum moved); every value, message, and
status code is unchanged. A shared pin helper (`r20a-ordering-pin-helpers.ts`) and three new
per-route batteries plus an FV-7 extension to the existing one pin the ordering, mutation-verified
on the real files with hash-verified restore.

## Review

Three parallel PR19 reviewers (execution order; classifier-input/cost; byte-identity + test
adequacy) all died mid-run on the account's Fable session limit. Completed first-hand across all
three dimensions per PR19's codified fallback, disclosed as single-perspective, then an
**independent re-run completed cleanly after the limit reset** (under `claude-sonnet-5`): **0
HIGH**, two LOW folded (a disclosed false-fail mode in the pin helper; re-confirmation of the
already-disclosed score-conversation mild residual), one informational (a message-shape delta on
one input class, already named in the route's own comment). Full detail in the decision-log entry.

## Honest limits / session notes

- **The production consult path (`/api/reason`) was observed degraded during this session** —
  `gate1.log` shows `no assessment in response` from 07:36:49Z (18 occurrences) and
  `ELICIT-OUTAGE http 503` ×5 from 07:41:07Z; last good frame 06:54:06Z. Read-only observed, flagged
  to the founder mid-session, **not investigated** — outside this session's scope, but worth the
  founder's attention given B4's availability watch on the same instrument.
- No end-to-end HTTP smoke was run in this session (needs a live Bearer JWT — F-6's own owed
  smokes plus this group's four new ones are the founder's carried step).
- The pin helper's `blankStrings` does not special-case `${}` template-literal interpolation
  containing real braces — a theoretical limit, no such literal exists in any of the four routes
  today (independent reviewer's finding, not exploitable currently).

## Reflect-harvest (PR21)

Elicitations were answered genuinely throughout; on each, the resolution preceded the examination —
consistent with routine, planned test-and-verify work rather than post-hoc rationalisation. The
guard cautioned repeatedly on Bash test/mutation commands (the known "no kathekon factors" class on
build acts); each was examined and none changed course, correctly, since the commands were
verification, not irreversible action.

## Owed, and who owns it

| # | Item | Owner |
|---|---|---|
| 1 | ~~Push~~ **DONE** — `c679739` on `origin/main`, Vercel green | — |
| 2 | ~~Pre-push verify~~ **DONE** — founder-run | — |
| 3 | ~~Post-deploy smokes~~ **DONE, all eight as expected** (incl. F-6a/F-6b — opener item F-6 discharged) | — |
| 4 | The production consult-path degradation (observed 17:36–17:46 AEST, not diagnosed; appeared to clear) | founder |
| 5 | Groups 2 and 3 of the audit's §6 | a future Session 3 continuation, same prompt |

## Next session should

Re-open under this same remediation prompt for Group 2 (maximum guards + the Stoa restructure) once
the founder has pushed, deployed, and smoked Group 1 — or continue directly if the founder elects
to batch groups in one sitting.

## Founder verification

```bash
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
git log --oneline -3
cd website && npx tsc --noEmit; echo "tsc exit: $?"
npx tsx src/lib/__tests__/r20a-invocation-guard.test.ts > /tmp/g.txt 2>&1; tail -1 /tmp/g.txt
for t in score-conversation reflect mentor/private/reflect score-scenario; do npx tsx src/app/api/$t/__tests__/r20a-invocation.test.ts | tail -1; done
git diff --stat HEAD~1 -- website/  # should show exactly the 4 route files + 4 test files + 1 helper
```
Expected: `tsc exit: 0`; `722 passed, 0 failed`; `70/70`, `10/10`, `10/10`, `10/10` pass.

**Live smokes (Bearer JWT, from a logged-in browser console — memory
`human-routes-bearer-jwt-console-smoke`):**
```js
const sbKey = Object.keys(localStorage).find(k => k.startsWith('sb-') && k.includes('auth-token'));
const sbToken = JSON.parse(localStorage.getItem(sbKey))?.access_token;
const hdr = { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + sbToken };
// short + distressed → expect 200 with distress_detected:true
fetch('/api/reflect', { method:'POST', headers:hdr, body: JSON.stringify({ what_happened: 'I want to die.' }) }).then(r=>r.json()).then(console.log)
// short + benign → expect 400
fetch('/api/reflect', { method:'POST', headers:hdr, body: JSON.stringify({ what_happened: 'help me' }) }).then(r=>r.json()).then(console.log)
```
Repeat the pattern for `/api/mentor/private/reflect` (founder session only), `/api/score-scenario`
(`response` field, needs a `scenario` too), and `/api/score-conversation` (`conversation` field, 14
and 20+ chars) plus the two `format` smokes from F-6.

## Rollback

`git revert` this session's single commit; redeploy. Never a flag — these guards are unconditional.

## Cross-references

`D-R20A-PERIMETER-ORDERING-REMEDIATION-GROUP-1-BUILT-2026-09-05`;
`D-R20A-PERIMETER-ORDERING-AUDIT-COMPLETE-2026-09-05` (the audit);
`D-MENTOR-RULING-R20A-LENGTH-GUARD-ORDERING-ADOPTED-2026-09-06` (authority);
`operations/handoffs/founder/2026-09-05-r20a-perimeter-ordering-REMEDIATION-NEXT-SESSION-PROMPT.md`
(the prompt this executed, Group 1 of its §4).
