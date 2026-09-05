# Session close — R20a perimeter-ordering REMEDIATION, Group 2 (Session 3B)

**2026-09-06** (machine date; the session opened 2026-09-05 22:52 AEST and crossed midnight). Tier
`code-critical`; R20a perimeter, PR6 + AC5. Founder-walked: the founder pushes and runs the live
smokes; AC7 engages at the push. Model `claude-fable-5-1` throughout. Decision-log entry:
`D-R20A-PERIMETER-ORDERING-REMEDIATION-GROUP-2-BUILT-2026-09-06`.

## Production state at close

**UNCHANGED.** Nothing pushed, nothing deployed. The working tree carries one commit's worth of
change (path-scoped to `website/` + the refreshed sweep output + these records). When the founder
pushes, production becomes NOT byte-equivalent on eleven human-facing perimeter members
(`/api/reason` human path only). No migration, flag, or credential touched.
`.claude/settings.local.json` untouched (`GATE1_FALSE_HOLD_CAPTURE` absent — the window has not
started; `/api/reason` was therefore editable, per Election B).

## Elections at open

- **A — scope:** items 5–8 (eleven routes). **B — `/api/reason` item 10 + the R3 log:** fold into
  this session. **Mid-session:** the peer's adoption of the mentor's Part 5 (Group 2b) was put to
  the founder; elected for **its own sitting**. The founder's relay also places the Branch-2
  `route_errors` row under S9; it is built here on Election B — **S9 must not repeat it.**

## What was built

| Route | Guard(s) moved | Cap on the screened subject |
|---|---|---|
| `/api/reflect`, `/api/mentor/private/reflect` | `what_happened`, `how_i_responded` (M) | both fields `String(x).slice(0, medium)`, join unchanged |
| `/api/journal` | `reflection_text` (M) | `String(x).slice(0, medium)`; `__local__` skip unchanged |
| `/api/mentor/journal-feed` | `impression`, `assent`, `action` (M) | each sliced at `medium` before trim |
| `/api/score-conversation` | `conversation`, `context` (L) | composer cap pinned `=== TEXT_LIMITS.long`; no length guard precedes the block any more |
| `/api/score` · `/api/score-decision` | `action`/`decision` (S), `context` (M) | screened field sliced at `short` |
| `/api/score-social` | `text` (M) | `medium` |
| `/api/score-document` | `text` (D, 30,000) | `document` |
| `/api/score-scenario` | `scenario`, `response` (M) | `response` sliced at `medium` (`scenario` is not screened) |
| `/api/reason` (human path) | `input`, `context`, `domain_context`, flag-on `clarification_response` (M) | `screenedInput` + sliced answer into the existing continuation composer; agent path calls the same closure at the original site |

Plus: the sandwich result carries `error_cause`; `/api/reason` Branch 2 logs it via `logRouteError`
(status 200, `masked_fallback: true`); the route's own `layer3_throw` site sets a descriptive cause.

## Review

First three-reviewer fleet died on the account session limit (as Group 1's did). A fresh fleet after
the reset **completed all three** (the independent run). All three: **SOUND WITH FIXES**, every
finding folded at the root and mutation-verified — headline: two HIGH on the **batteries** (a decoy
guard in another form passed green on every route; a `validateTextLength` before score-conversation's
block passed) → a per-route class fence (NEG-1 / FV-8e / ORD-7); one MEDIUM (`/api/reason` audience
literals unpinned) → ORD-6; the array class on three untyped fields → `String()` before the slice.
Full list in the decision-log entry.

## Verification (all green at close)

`tsc` 0 · `next build` ✓ · guard battery 722/0 · reflect 17/17 · private/reflect 17/17 · journal
18/18 · journal-feed 18/18 · score-conversation 75/75 · score, score-decision, score-social,
score-document 12/12 · score-scenario 17/17 · reason 14/14 (+ audience-rendering 66/66) · sweep
window 0 on all 54 handlers, output refreshed. Mutation record: every route's before-check /
between-check-and-return / deleted / cap-removed / decoy-bare-guard RED on the named pin, hash-verified
restore, post-restore GREEN; the reviewers' three demonstrated false passes now fail.

## Honest limits

- No end-to-end HTTP smoke (needs a Bearer JWT — the founder's walk below).
- The sweep is per-handler: on `/api/reason` it still lists the closure's guards pre-check via the
  agent-path call; the human-path ordering is proven by the pins, not the sweep (disclosed in the
  route comment).
- The `/api/reason` `layer3_throw` row cannot classify an LLM outage (the generator swallows its
  cause); disclosed at the site.
- Residuals as recorded: distress past each cap unscreened; the stage-2 cost class; three
  `/api/reason` human-path message-precedence deltas; score-conversation's mild-then-400 path.
- A11b self-inflicted harness events for B4: 16 consult outages, 9 elicitation outages, 2 unframed,
  against 42 successful consults and 15 cautions. One caution was a genuine irreversible-class act
  (the mutation harness on live files; hash-verified restore).

## Owed, and who owns it

| # | Item | Owner |
|---|---|---|
| 1 | Push the Group 2 commit (GitHub Desktop); watch Vercel green | founder |
| 2 | Pre-push verify (below) | founder |
| 3 | Smokes (below); then the LIVE addendum + the audit rows' "live-smoked" note | founder, then a session |
| 4 | Group 2b (its own sitting: three P′ sites + O items with a design note first) | a Session 3C |
| 5 | Group 3 (the three proof routes) | a later sitting |
| 6 | S9 (harness-side A11b redaction) — the Branch-2 row is DONE here | S9 |

## Founder verification

```bash
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
git log --oneline -3
cd website && npx tsc --noEmit; echo "tsc exit: $?"
npx tsx src/lib/__tests__/r20a-invocation-guard.test.ts > /tmp/g.txt 2>&1; tail -1 /tmp/g.txt
for t in reflect mentor/private/reflect journal mentor/journal-feed score-conversation score score-decision score-social score-document score-scenario reason; do npx tsx src/app/api/$t/__tests__/r20a-invocation.test.ts > /tmp/b.txt 2>&1; echo "$t: $(tail -1 /tmp/b.txt)"; done
```
Expected: `tsc exit: 0`; `722 passed, 0 failed`; the per-route counts in the Verification section.

**Live smokes (Bearer JWT from the `sb-*-auth-token` localStorage key — memory
`human-routes-bearer-jwt-console-smoke`; the Group 1 `smoke()` helper works unchanged). Per moved
maximum: an oversized DISTRESSED body (`"I want to die."` in the first 2,000 chars, then benign
padding past the bound — avoid mild-severity wording) → HTTP 200 `distress_detected: true`; an
oversized BENIGN body → HTTP 400 `… exceeds maximum length …`. Only the two reflect routes write a
row (one `analytics_events` distress row each).**

```js
const sbKey = Object.keys(localStorage).find(k => k.startsWith('sb-') && k.includes('auth-token'));
const sbToken = JSON.parse(localStorage.getItem(sbKey))?.access_token;
const hdr = { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + sbToken };
const pad = (n) => ' The meeting ran long and we reviewed the roadmap.'.repeat(Math.ceil(n / 50));
const D = 'I want to die.' + pad(6000);      // oversized distressed (medium routes)
const B = 'Today was ordinary.' + pad(6000); // oversized benign
const smoke = (url, body) => fetch(url, { method:'POST', headers:hdr, body: JSON.stringify(body) }).then(async r => console.log(url, r.status, await r.text()));
smoke('/api/reflect', { what_happened: D });      smoke('/api/reflect', { what_happened: B });
smoke('/api/journal', { day_number: 1, reflection_text: D }); smoke('/api/journal', { day_number: 1, reflection_text: B });
smoke('/api/mentor/journal-feed', { impression: D, assent: 'x', action: 'y' }); smoke('/api/mentor/journal-feed', { impression: B, assent: 'x', action: 'y' });
smoke('/api/score', { action: 'I want to die.' + pad(2500) }); smoke('/api/score', { action: 'Ordinary day.' + pad(2500) });
smoke('/api/score-social', { text: D }); smoke('/api/score-social', { text: B });
smoke('/api/score-document', { text: 'I want to die.' + pad(31000) }); smoke('/api/score-document', { text: 'Ordinary day.' + pad(31000) });
smoke('/api/score-scenario', { scenario: 'A dilemma.', response: D }); smoke('/api/score-scenario', { scenario: 'A dilemma.', response: B });
smoke('/api/score-decision', { decision: 'I want to die.' + pad(2500), options: ['a','b'] }); smoke('/api/score-decision', { decision: 'Ordinary.' + pad(2500), options: ['a','b'] });
smoke('/api/score-conversation', { conversation: 'I want to die.' + pad(16000) }); smoke('/api/score-conversation', { conversation: 'Ordinary chat.' + pad(16000) });
smoke('/api/reason', { input: D }); smoke('/api/reason', { input: B });
// founder-only: smoke('/api/mentor/private/reflect', { what_happened: D }); smoke('/api/mentor/private/reflect', { what_happened: B });
```
Record each as observed (status + body fields), never as expected.

## Rollback

`git revert` the Group 2 commit; redeploy. Never a flag — these guards are unconditional.

## Cross-references

`D-R20A-PERIMETER-ORDERING-REMEDIATION-GROUP-2-BUILT-2026-09-06`; the audit
`operations/count-discipline-2026-09/2026-09-05-r20a-perimeter-ordering-AUDIT.md` (§2.1 rows 1–11
annotated MOVED); the remediation prompt (top line marked); the paste
`2026-09-05-SESSION-3B-r20a-remediation-group2-SESSION-PASTE.md` (executed);
`D-MENTOR-RULINGS-FIVE-RELAYS-ADOPTED-2026-09-05` (Parts 4 and 5).
