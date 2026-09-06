# Session close — R20a perimeter-ordering REMEDIATION, Group 2b + Group 3 (Session 3C)

**2026-09-06** (machine date; opened 08:55 AEST, closed ~10:50 AEST). Tier `code-critical`; R20a
perimeter, PR6 + AC5. Founder-walked: the founder pushes and runs the live smokes; AC7 engages at
the push. Model `claude-fable-5-1` throughout except the three PR19 reviewers (`claude-sonnet-5`, the
founder's election — dropped for the review, restored after). Decision-log entry:
`D-R20A-PERIMETER-ORDERING-REMEDIATION-GROUP-2B-3-BUILT-2026-09-06`.

## Production state at close

**UNCHANGED.** Nothing pushed, nothing deployed. Two local commits ahead of `origin/main`: `555502e`
(the build, path-scoped to 16 files under `website/src/app/api/` + the sweep output) and this
records commit. When the founder pushes, production becomes NOT byte-equivalent on eight human-facing
perimeter members (`/api/reason` human path only). No migration, flag or credential touched.
`GATE1_FALSE_HOLD_CAPTURE` absent — `/api/reason` was editable; **its two O items are now landed,
discharging the window-start coupling on push.**

## Elections at open

Both groups, one PR19, one push. Journal-feed's two `event_timestamp` 400s (class O, absent from the
paste) moved in the same edit. F-13: both interactive peers checked via the session tools — idle,
completed turns, not awaiting input; nothing owed; reported before any write.

## What was built

| Route | Moved after the check | Cap |
|---|---|---|
| `/api/score-scenario` | `scenario` presence/type (P′) | unchanged (`scenario` unscreened) |
| `/api/mentor/journal-feed` | three-field presence (P′); two `event_timestamp` 400s (O) | `String(s ?? '')` per field at `medium`; check skipped on an all-empty subject |
| `/api/journal` | `day_number` presence half (split) + 1–56 range (O) | unchanged |
| `/api/mentor/private/reflect` | `bypass_pattern_cache` boolean (O), below the minimum | unchanged |
| `/api/reason` **human path** | `session_marker` enum + `loop_id` 400s (O) — dual-site closure; agent path at the original site | unchanged |
| `/api/founder/hub/ring-proof` | `persona` enum (O); `message` `<5`; maximum | `screenedMessage` at `medium` |
| `/api/mentor/ring/proof` | `<5`; maximum; `hub_id` enum + boolean (O) | `screenedTaskDescription` at `medium` |
| `/api/support/agent/proof` | three minima; `channel`/`priority` enums (O); two maxima | `subject` at `short`, `message` at `medium` |

Paste corrections: private/reflect has no `hub_id` enum (it is mentor/ring/proof's, Group 3); the
journal-feed timestamp O items were missing from the paste's O table.

## Review

Three blind reviewers, all three completed. **A (execution order) CLEAN. C (byte-identity / test
adequacy) CLEAN**, one LOW/NIT style note. **B (screening caps) — two CONFIRMED MEDIUM, folded at the
root:** the ring-proof `message` and support-proof `subject`/`message` retained presence halves were
typeof-only, so an empty string reached stage 2 (Haiku) where it used to 400 for free — and
inconsistent with mentor/ring/proof in the same diff. Now falsy checks, PRES-1 asserts the form,
mutation-verified ×3.

## Verification (all green at close)

`tsc` 0 · `next build` ✓ · guard 722/0 · score-scenario 21/21 · journal 22/22 · journal-feed 23/23 ·
private/reflect 21/21 · reason 19/19 · ring-proof 20/20 · mentor/ring/proof 20/20 · support/agent/
proof 20/20 · sweep window 0 (pre-check bound lines 34→29). **Mutation record** (59 mutations, every
one RED on the named pin, every restore SHA-256-verified, every post-restore battery GREEN):
`operations/count-discipline-2026-09/2026-09-06-session3C-mutation-record.txt`.

## Honest limits

- No end-to-end HTTP smoke (needs a Bearer JWT — the founder's walk below).
- The harness ran against the uncommitted working tree with an in-memory backup + hash restore; a
  crash mid-mutation would have had no git baseline. Next time: commit the built state first.
- The ring-proof redirect analytics row's `persona` is unvalidated at write (bounded to 64 chars or
  null); byte-identical for every valid persona; the invalid case was previously unreachable.
- Residuals as recorded: distress past each cap unscreened; the stage-2 cost class on short/empty-
  adjacent benign input on the founder-only proof routes; the sweep is per-handler on `/api/reason`.
- **A11b / harness count for B4 (this session, from open, `gate1.log`):** 28 guard cautions
  (3 of them engine-unavailable "fails safe" on the three battery-file writes), 20 elicitations,
  1 UNFRAMED (`no assessment in response` on the Agent-tool reviewer launch), 0 CONSULT-OUTAGE,
  0 ELICIT-OUTAGE, 153 AT-ACTION-SKIP-BASH (by design). Real irreversible-class acts under caution:
  the mutation harness (hash-verified restore) and the commit.

## Owed, and who owns it

| # | Item | Owner |
|---|---|---|
| 1 | Push `555502e` + the records commit (GitHub Desktop); watch Vercel green | founder |
| 2 | Pre-push verify (below) | founder |
| 3 | Smokes (below); then the LIVE addendum + the audit rows' "live-smoked" note | founder, then a session |
| 4 | S3.4 — the Stoa restructure (paste `2026-09-06-SESSION-3D-r20a-stoa-restructure-SESSION-PASTE.md`); closes the arc | a Session 3D |
| 5 | Close the two idle interactive sessions (F-13) | founder |

## Founder verification

```bash
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
git log --oneline -3
cd website && npx tsc --noEmit; echo "tsc exit: $?"
npx tsx src/lib/__tests__/r20a-invocation-guard.test.ts > /tmp/g.txt 2>&1; tail -1 /tmp/g.txt
for t in score-scenario journal mentor/journal-feed mentor/private/reflect reason founder/hub/ring-proof mentor/ring/proof support/agent/proof; do npx tsx src/app/api/$t/__tests__/r20a-invocation.test.ts > /tmp/b.txt 2>&1; echo "$t: $(tail -1 /tmp/b.txt)"; done
```
Expected: `tsc exit: 0`; `722 passed, 0 failed`; 21/22/23/21/19/20/20/20.

**Live smokes (Bearer JWT from the `sb-*-auth-token` localStorage key; the Group 2 `smoke()` helper).
Distressed = `"I want to die."` — avoid mild wording. Every benign proof-route probe below FAILS a
guard on purpose; a benign probe that passes every guard would call the engine and spend. Only the
private/reflect and proof routes write an `analytics_events` row on redirect.**

```js
const sbKey = Object.keys(localStorage).find(k => k.startsWith('sb-') && k.includes('auth-token'));
const sbToken = JSON.parse(localStorage.getItem(sbKey))?.access_token;
const hdr = { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + sbToken };
const D = 'I want to die.', B = 'Today was an ordinary day at work.';
const smoke = (url, body) => fetch(url, { method:'POST', headers:hdr, body: JSON.stringify(body) }).then(async r => console.log(url, r.status, (await r.text()).slice(0, 220)));
// P′ — expect 200 crisis / 400 `scenario is required`
smoke('/api/score-scenario', { response: D }); smoke('/api/score-scenario', { response: B });
// journal — expect 200 / 400 `day_number and reflection_text are required`
smoke('/api/journal', { reflection_text: D }); smoke('/api/journal', { reflection_text: B });
// journal-feed — expect 200 / 400 `All three fields are required`
smoke('/api/mentor/journal-feed', { impression: D }); smoke('/api/mentor/journal-feed', { impression: B });
// /api/reason session — expect 200 / 400 `session_marker must be one of`; then loop_id
smoke('/api/reason', { input: D, session_marker: 'bogus' }); smoke('/api/reason', { input: B, session_marker: 'bogus' });
smoke('/api/reason', { input: D, loop_id: '' }); smoke('/api/reason', { input: B, loop_id: '' });
// founder-only — expect 200 / 400 on the named guard
smoke('/api/mentor/private/reflect', { what_happened: D, bypass_pattern_cache: 'yes' }); smoke('/api/mentor/private/reflect', { what_happened: B, bypass_pattern_cache: 'yes' });
smoke('/api/founder/hub/ring-proof', { persona: 'bogus', message: D }); smoke('/api/founder/hub/ring-proof', { persona: 'bogus', message: B });
smoke('/api/mentor/ring/proof', { task_description: D, hub_id: 'bogus' }); smoke('/api/mentor/ring/proof', { task_description: B, hub_id: 'bogus' });
smoke('/api/support/agent/proof', { subject: D, customer: 'x', message: D, channel: 'bogus' }); smoke('/api/support/agent/proof', { subject: B, customer: 'x', message: B, channel: 'bogus' });
```
Record each as observed (status + body fields), never as expected. Note: `/api/reason`'s
`session_marker`/`loop_id` 400s are flag-gated (`SUBSTRATE_SESSION_DECLINE_SIGNAL_ENABLED`,
`SUBSTRATE_LOOP_ID_FIELD_ENABLED`, both live) — if a benign probe returns 200, the flag state is the
first thing to check, not the code.

## Rollback

`git revert 555502e`; redeploy. Never a flag — these guards are unconditional.

## Cross-references

`D-R20A-PERIMETER-ORDERING-REMEDIATION-GROUP-2B-3-BUILT-2026-09-06`; the audit §2.1 rows
4/6/8/9/10/14/15/16 (annotated); the remediation prompt (top line); the paste
`2026-09-06-SESSION-3C-…-SESSION-PASTE.md` (executed); `D-MENTOR-RULINGS-FIVE-RELAYS-ADOPTED-2026-09-05` (Part 5).
