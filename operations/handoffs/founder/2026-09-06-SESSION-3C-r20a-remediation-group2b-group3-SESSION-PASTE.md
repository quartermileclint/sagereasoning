# SESSION PASTE — Session 3C: R20a perimeter-ordering REMEDIATION, Group 2b + Group 3

**Paste this whole file as the first message of a fresh session.** It is the third code sitting of the
R20a ordering arc and the **first session of the single serial arc** (standing opener, Version
2026-09-05 as re-planned 2026-09-06 — Standing queue B, row S3.3). **There is no parallel session:
open `ListAgents` at start and, if `sagereasoning-43` or any other interactive peer still shows,
tell the founder before writing anything (F-13).**

**Tier `code-critical`** — every candidate is a live R20a perimeter member (PR6 + AC5). **Founder-walked
(PR17): the AI edits, tests, reviews and guides; the founder pushes, watches Vercel, and runs every
live smoke. AC7 engages at the push. PR19 REQUIRED — three blind reviewers on the group's diff before
the push; if the account limit kills the fleet, complete first-hand and DO NOT PUSH until an
independent re-run has passed (PR19 §4). Never push. Never `git add -A`. Never stage a peer's files.
Never touch `injection-defence.ts`. Never read a token from `settings.local.json` (keys only). Date
every artifact from `date`/`git log`, never the context date.**

Written 2026-09-06 05:40 AEST (`date`), HEAD `0bc1e56` + this records commit. Model at writing
`claude-fable-5-1`.

---

## 0. Open under the standard protocol

1. Read `operations/handoffs/founder/STANDING-SESSION-OPENER-grounded-foundations.md` **Part A in
   full, then the "⚠️ facts" list, then the Standing queue (Part B's tail)**. Its S3.3 row is this
   session.
2. Read `operations/handoffs/founder/2026-09-05-r20a-perimeter-ordering-REMEDIATION-NEXT-SESSION-PROMPT.md`
   **in full** — §3 (design constraints) and §5 (procedure) govern every move here unchanged; §4's
   Groups 1–2 are done, its ruled-addition banner is Group 2b.
3. Read the two ruling verbatims: `operations/count-discipline-2026-09/2026-09-06-mentor-ruling-r20a-length-guard-ordering-verbatim.md`
   and **Part 5** of `2026-09-05-mentor-rulings-five-relays-verbatim.md`. Part 5's boundary binds this
   session: *"the route is open, the caller is the intended human user of that surface, and the
   screened text is present and readable in the submitted body"* — jointly. **J / A / F are outside
   the principle; no move is owed there.** If the screened text is itself the invalid field, the
   rejection may stand first.
4. Read the two prior closes for the shape you reproduce:
   `2026-09-06-r20a-perimeter-ordering-remediation-session3B-group2-CLOSE.md` (the pins, the class
   fence, the mutation harness, the smoke script) and `…-session3-CLOSE.md` (Group 1 — the shape for
   a presence/minimum move).
5. Read the precedent code: `website/src/lib/__tests__/r20a-ordering-pin-helpers.ts` (the helper
   module — `structuralBlock`, `BARE_LENGTH_GUARD_RE`, `readTextLimitsFromSource`, `POST_HANDLER_RE`)
   and one finished battery, e.g. `website/src/app/api/journal/__tests__/r20a-invocation.test.ts`
   (MIN/MAX/CAP/NEG-1 pins). Memories: `guard-scope-must-cover-the-class`,
   `human-routes-bearer-jwt-console-smoke`, `harness-blind-on-substrate-sessions-a11b-schema-tokens`
   (expect CONSULT-OUTAGE / ELICIT-OUTAGE on your own edits — count them for B4, do not chase them),
   `tsx-tests-setinterval-keepalive-hang` (redirect batteries to a file, then `tail`).

## 1. Verify, don't trust this file

```bash
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
date && git fetch origin && git status && git log --oneline origin/main..HEAD && git log --oneline -3
grep -c GATE1_FALSE_HOLD_CAPTURE .claude/settings.local.json   # expect 0 — the window has NOT started; if 1, STOP: /api/reason is frozen, drop the reason O items and tell the founder
node operations/count-discipline-2026-09/2026-09-05-r20a-ordering-sweep.js website > /tmp/sweep.txt; tail -3 /tmp/sweep.txt
cd website && npx tsc --noEmit; echo "tsc $?"
npx tsx src/lib/__tests__/r20a-invocation-guard.test.ts > /tmp/g.txt 2>&1; tail -1 /tmp/g.txt
for t in score-scenario journal mentor/journal-feed mentor/private/reflect reason; do npx tsx src/app/api/$t/__tests__/r20a-invocation.test.ts > /tmp/b.txt 2>&1; echo "$t: $(tail -1 /tmp/b.txt)"; done
```
Expected at writing: clean tree; sweep SUMMARY window 0; guard `722 passed, 0 failed`; score-scenario
17/17, journal 18/18, journal-feed 18/18, private/reflect 17/17, reason 14/14. **Re-derive every line
number below with `grep -n`** — the tilde is deliberate; these files move weekly.

## 2. The list — founder elects scope at open (AskUserQuestion: recommend BOTH groups, one PR19, one push)

### Group 2b — the ruled additions (Part 5)

**P′ — three presence-on-sibling-field sites, Group-1 shape** (split the check: TYPE of the screened
field may stay first if it is what makes the text readable; the SIBLING presence/range 400 moves after
the redirect return, still before any context/engine/store call):

| Route | Site (~line at `0bc1e56`) | Screened field | What moves |
|---|---|---|---|
| `/api/score-scenario` | `:293` `if (!scenario \|\| typeof scenario !== 'string')` | `response` | the whole `scenario` presence/type 400 (it is a sibling of the screened field) |
| `/api/mentor/journal-feed` | `:47` `if (!impression?.trim() \|\| !assent?.trim() \|\| !action?.trim())` | `impression` (the composed subject is all three) | **design note first**: the screened subject is the join of all three; if `impression` is present and readable the check runs even when `assent`/`action` are missing — compose the subject from whichever fields are present strings (`String(x ?? '')`), then the three-field presence 400 after the block |
| `/api/journal` | `:34` `if (!day_number \|\| !reflection_text)` and `:38` day range | `reflection_text` | the `day_number` presence half and the `1–56` range 400 move after the block; the `reflection_text` presence half stays (it is the screened text itself). The `'__local__'` sentinel skip is unchanged |

**O — non-text 400s where the screened text is present, case by case:**

| Route | Site (~line) | Disposition |
|---|---|---|
| `/api/mentor/private/reflect` | `:210–219` `bypass_pattern_cache must be a boolean`; also the `hub_id` enum 400 just above it (~`:160–166`) | both move after the redirect return (the screened text `what_happened` is present); values/messages byte-identical |
| `/api/reason` **human path only** | `:1140–1154` `session_marker` enum 400 (flag `SUBSTRATE_SESSION_DECLINE_SIGNAL_ENABLED`); `:1165–1172` `loop_id` 400 (flag `SUBSTRATE_LOOP_ID_FIELD_ENABLED`) | move after the redirect block on the human path exactly as Group 2 moved the length closure: keep each validation at its original site on the agent path (`r20aAudience !== 'human_user'`) and re-run it after the block on the human path (`=== 'human_user'`). The validated values (`validatedSessionMarker`, `validatedLoopId`) are consumed downstream — the human-path copy must assign them identically. **Agent path byte-identical (a PR19 dimension).** Disclose the added message-precedence delta in the existing route comment (it already names these two as pre-check on every caller). **This is the item that must land before the founder sets `GATE1_FALSE_HOLD_CAPTURE`.** |
| `/api/mentor/stoa` `visibility` enum | inside `parseDeclaration` | **NOT this session** — it is part of item 9's restructure (S3.4) |

Outside the principle (leave alone, and say so in the close): malformed-JSON 400s, founder-only 403s,
flag-off 503s, and any 400 where the screened text is itself the invalid field.

### Group 3 — the three founder-only proof routes (one human caller; A does not exclude the founder)

No per-route battery exists for any of the three — create one each (the FV-6 shape via the helper).

| Route | Check (~line) | Sites before it | Screening cap |
|---|---|---|---|
| `/api/founder/hub/ring-proof` | `:168` `detectDistressTwoStage(message)` | `persona` enum 400 `:147–151` (O — screened text present ⇒ moves); `message` type+`<5` minimum `:153` (type stays, minimum moves); `validateTextLength(message, 'message', medium)` `:160` (moves) | `String(messageInput).slice(0, TEXT_LIMITS.medium)` |
| `/api/mentor/ring/proof` | `:205` `detectDistressTwoStage(taskDescription)` | `task_description` presence/type/`<5` `:118` (type stays, minimum moves); max `:125` (moves); the two enum 400s at ~`:165` and ~`:200` (O — read each; if the screened text is present they move) | `medium` |
| `/api/support/agent/proof` | `:179` `detectDistressTwoStage(combinedInput)` | minima on `subject` `<3` `:141`, `customer` `<2` `:147`, `message` `<5` `:153`; `channel`/`priority` enums `:162`/`:168` (O); maxima `subject` short `:172`, `message` medium `:174` | compose `combinedInput` from `String(x).slice(0, bound)` per field before the check |

Each proof route's own comment already cites *"Distress check via website enforceDistressCheck (AC4
invocation)"* — update it in the Group 1/2 register (*placed after the R20a block under the
2026-09-05 ruling; order, not existence*).

## 3. Procedure — the remediation prompt §5, verbatim, with these session-specific points

1. **Design notes on paper, per route, put to the founder before editing** (five lines each: check
   line; the block it lives in; where each guard goes; whether/what cap; what the pin anchors on).
   The journal-feed composition and the `/api/reason` dual-site copy are the two that need a real
   note.
2. **Edit.** Guard text byte-identical where possible; comments in the established register.
3. **Pin + mutation-verify.** Per route: ORD/MIN/MAX pins after `structuralBlock`'s END and before
   the first context/engine/store call; CAP pins where a cap is added; **NEG-1 class fence on every
   battery** (`BARE_LENGTH_GUARD_RE` + `VALIDATE_TEXT_LENGTH_CALL_RE` between the handler open and the
   check, plus — new for this session — a fence on the moved **non-length** 400s: assert the moved
   `status: 400` returns' error-string literals do not occur before the check; strip comments and
   blank strings first, then match on the QUOTED key). Mutation harness: the Group 2 Python harness
   pattern — backup, mutate, run, `cp`-restore, SHA-256 check; **never `git checkout --`**. Record
   every RED in the close. `tsc`; `npm run build` from `website/` (route files change); the guard
   battery; every touched route battery; the sweep (window must stay 0; commit the refreshed
   `…-sweep-OUTPUT.txt`).
4. **PR19** — three blind reviewers in parallel, briefed to break: (a) execution order on the actual
   control flow incl. the two bypasses and a decoy re-add of each moved 400 before the check; (b)
   the classifier's bounded input on the three proof routes and journal-feed's composition; (c)
   byte-identity of `/api/reason`'s agent path, the conformant siblings, and every guard value. Fold
   at the root; withdraw over-claims at the head.
5. **Commit path-scoped** with `Model:`/`Effort:` trailers; the founder pushes; Vercel green.
6. **Smokes — founder-run, Bearer JWT (the Group 2 `smoke()` helper works unchanged):**
   - P′: a distressed `response` with NO `scenario` → 200 crisis redirect; benign with no `scenario`
     → 400 `scenario is required`. Journal: distressed `reflection_text` with no `day_number` → 200;
     benign → 400. Journal-feed: distressed `impression` alone → 200; benign alone → 400.
   - O: private/reflect (founder-only) distressed `what_happened` + `bypass_pattern_cache: "yes"` →
     200; benign + same → 400. `/api/reason` (session): distressed input + `session_marker: "bogus"`
     → 200; benign + same → 400 `session_marker must be one of`; same pair with `loop_id: ""`.
   - Group 3 (founder-only): per route, a distressed `message`/`task_description` with a bad enum
     and an undersized sibling → 200; benign → 400. Only the reflect routes write an
     `analytics_events` row; the proof routes call the engine only past the guards — a benign probe
     that passes every guard WILL spend, so make every benign probe fail a guard.
   Record each as observed, never as expected.
7. **Records:** decision-log entries at the physical tail
   (`D-R20A-PERIMETER-ORDERING-REMEDIATION-GROUP-2B-3-{BUILT,LIVE}-2026-09-0N`); the audit's §2.1
   rows for the proof routes + the 2b sites annotated MOVED (append); the remediation prompt's top
   line; the opener's S3.3 row → LIVE and **author S3.4's paste** (the Stoa restructure — design
   constraint §3.6; the `visibility` O case; both `parseDeclaration` call sites `:349`/`:400` POST and
   PATCH); the CLAUDE.md production-state block per PR18; a lean close carrying the A11b
   self-inflicted count for B4.

## 4. Do NOT

Change a guard's value or message. Move anything on `/api/reason`'s agent path. Edit `/api/reason`
if `GATE1_FALSE_HOLD_CAPTURE` is set. Touch the Stoa pair. Push without the PR19 pass. Anchor a pin
on a block's opening. Flip any flag. Quote a perimeter count. Re-do the Branch-2 `route_errors` row.
Stage a file you did not change.

## 5. Rollback

`git revert` the group's commit + redeploy. Never a flag. Each route's move is independent.

## 6. Forecast

Success = every 2b and Group 3 site sits after the check on its human path, pinned by block-end
anchors that go red under both bypasses and under a decoy re-add, three reviewers satisfied, the
founder's smokes showing a distressed body with a broken sibling field answered with the crisis
resource, and `/api/reason`'s human-path O items landed before the window starts. The session ends
with every guard value unchanged, the classifier's input bounded, and only the Stoa pair standing
between the arc and its close.

End of paste.
