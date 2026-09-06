# SESSION PASTE — Session 3D: R20a perimeter-ordering REMEDIATION, the Stoa restructure (item 9)

**Paste this whole file as the first message of a fresh session.** It is the fourth and LAST code
sitting of the R20a ordering arc (standing opener, Version 2026-09-05 as re-planned 2026-09-06 —
Standing queue B, row S3.4). **Closes the arc.** There is no parallel session: open `ListAgents` at
start and, if any interactive peer still shows, tell the founder before writing anything (F-13).

**Tier `code-critical`** — both candidates are live R20a perimeter members (PR6 + AC5), and both are
Stoa write surfaces (`SUBSTRATE_STOA_ENABLED=true`, real practitioner rows exist). **Founder-walked
(PR17): the AI edits, tests, reviews and guides; the founder pushes, watches Vercel, and runs every
live smoke. AC7 engages at the push. PR19 REQUIRED — three blind reviewers on the diff before the
push; if the account limit kills the fleet, complete first-hand and DO NOT PUSH until an independent
re-run has passed (PR19 §4). Never push. Never `git add -A`. Never stage a peer's files. Never touch
`injection-defence.ts`. Never read a token from `settings.local.json`. Date every artifact from
`date`/`git log`, never the context date.** S2 (the R18 assessment-contract corrections) may ride
this sitting ONLY if the founder signs F-4 at open — otherwise it stays queued.

Written 2026-09-06 10:45 AEST (`date`), HEAD `555502e` + this session's records commit. Model at
writing `claude-fable-5-1`.

---

## 0. Open under the standard protocol

1. `operations/handoffs/founder/STANDING-SESSION-OPENER-grounded-foundations.md` — Part A in full,
   the "⚠️ facts", the Standing queue. Its S3.4 row is this session.
2. `operations/handoffs/founder/2026-09-05-r20a-perimeter-ordering-REMEDIATION-NEXT-SESSION-PROMPT.md`
   in full — **§3 constraint 6 is this session's design constraint** ("a restructure, not a line
   move … design it on paper first"); §5 (procedure) governs every move.
3. The two rulings: `operations/count-discipline-2026-09/2026-09-06-mentor-ruling-r20a-length-guard-ordering-verbatim.md`
   and Part 5 of `2026-09-05-mentor-rulings-five-relays-verbatim.md`. The `visibility` enum is a
   Part 5 class-O case ("owed the crisis form before being told their `visibility` value is
   invalid"). J (the `readJsonBody` 400) and F (`stoaClosed()` 503) are OUTSIDE the principle and
   stay first.
4. The three prior closes for the shape: `…-session3-CLOSE.md` (Group 1), `…-session3B-group2-CLOSE.md`
   (Group 2 — the class fence, the harness), `…-session3C-group2b-3-CLOSE.md` (Group 2b+3 — the
   NEG-2 non-length fence, the falsy-presence PR19 fold, the empty-subject skip).
5. Precedent code: `website/src/lib/__tests__/r20a-ordering-pin-helpers.ts`; one finished battery
   with both fences, e.g. `website/src/app/api/support/agent/proof/__tests__/r20a-invocation.test.ts`.
   Memories: `guard-scope-must-cover-the-class`, `harness-blind-on-substrate-sessions-a11b-schema-tokens`,
   `tsx-tests-setinterval-keepalive-hang`, `shared-flag-dark-is-per-flag-not-per-feature`.

## 1. Verify, don't trust this file

```bash
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
date && git fetch origin && git status && git log --oneline origin/main..HEAD && git log --oneline -3
grep -c GATE1_FALSE_HOLD_CAPTURE .claude/settings.local.json   # informational — this session does not touch /api/reason
node operations/count-discipline-2026-09/2026-09-05-r20a-ordering-sweep.js website > /tmp/sweep.txt; tail -3 /tmp/sweep.txt
cd website && npx tsc --noEmit; echo "tsc $?"
npx tsx src/lib/__tests__/r20a-invocation-guard.test.ts > /tmp/g.txt 2>&1; tail -1 /tmp/g.txt
ls src/app/api/mentor/stoa/__tests__ src/app/api/mentor/stoa/draft-reflect/__tests__ 2>&1   # expect: no r20a-invocation battery on either — create both
grep -rn "export function composeStoaDistressSubject" src/lib
```
Expected at writing: Group 2b+3 LIVE (`555502e` on `origin/main` after the founder's push — if it is
NOT on `origin/main`, STOP and tell the founder: the S3.3 smokes have not run); clean tree; sweep
window 0; guard `722 passed, 0 failed`; no Stoa battery exists. **Re-derive every line number below
with `grep -n`.**

## 2. The two routes (at `555502e`)

**`/api/mentor/stoa` (`website/src/app/api/mentor/stoa/route.ts`) — POST + PATCH share one shape:**
`stoaClosed()` 503 (F) → rate limit → `requireAuth` → `readJsonBody` 400 (J) → **`parseDeclaration(body)`**
(~`:134–181`; its 400s: `must be text` type; `FIELD_MAX` 2,000 on `what_i_bring`/`what_i_seek`/
`contact_channel`; the **`visibility` enum** (O); `tags` list/count-12/each-text/`TAG_MAX` 40) →
`mergedDeclarationForGate(identity, parsed.input)` (a store READ over the practitioner's existing
entry — the PR19-folded anti-assembly merge) → `runStoaDistressGate(merged)` (~`:235`;
`composeStoaDistressSubject` → `''` skips; `enforceDistressCheck(detectDistressTwoStage(subject))`;
mild-escalation; `renderR20aRedirectResponse` human form) → the store WRITE. Call sites: POST
`:349`/`:356`, PATCH `:400`/`:408`.

**`/api/mentor/stoa/draft-reflect` (`…/draft-reflect/route.ts`) — POST:** both flags 503 (F) → rate
limit → auth → inline JSON 400 (J) → **`parseDraft(body)`** (~`:98–121`; its 400s: `must be text`;
`validateTextLength(v, …, TEXT_LIMITS.short)` on the three fields; the "Nothing to reflect on" 400)
→ the gate over the SUBMITTED draft (~`:152–170`) → `requestDraftMirrorReading` (the LLM).

**The problem the audit named (§2.1 rows 12–13; §3 constraint 6):** the gate consumes `parsed.input`
/ `parsed.draft`, so every parse 400 fires before the check. A distressed practitioner whose
`what_i_bring` is 2,001 characters, or who sent `visibility: "everyone"`, or whose `tags` has 13
entries, gets a bare 400. The screened text is present and readable in all three cases.

## 3. Design constraints — settled (remediation prompt §3; this session adds nothing to them)

1. Order, not existence — every parse 400 stays, byte-identical; each moves after the redirect
   return and still before the store WRITE (`declareStoaEntry`/`updateStoaEntry`) and the LLM.
2. **The screened subject must be composed from the RAW body BEFORE parsing** (and merged over the
   prior entry on POST-reactivation/PATCH exactly as today — the anti-assembly merge is a PR19 fold
   and must survive). A raw composer takes `body` and yields the same four-field shape
   `mergedDeclarationForGate` consumes, coercing each text field `String(x ?? '')` sliced at
   `FIELD_MAX` (the screening cap = the guard's bound), and `tags` only if it is an array — each
   element `String(t ?? '').slice(0, TAG_MAX)`, at most `TAGS_MAX_COUNT` elements screened (disclose:
   the 13th tag onward is not screened — the relocated residual, audit §4.3). A non-string field
   (an object, a number) contributes its `String()` form, exactly as the journal cap does — the
   TYPE 400 then fires after the check. On draft-reflect the cap is `TEXT_LIMITS.short`.
3. The empty-subject skip in `runStoaDistressGate` (`subject.length === 0`) is kept — it is the
   "no screened text present" boundary of Part 5, and it is what keeps a pure renewal (empty PATCH)
   off stage 2. **It is a `.length ===` form, not a `<>` comparison — NEG-1's `BARE_LENGTH_GUARD_RE`
   does not match it, by design (presence forms are excluded).** Do not rewrite it into a `<`.
4. The store READ (`readStoaEntryForIdentity` inside the merge) moves BEFORE the parse. That is a
   read, not a write; the ruling's "before any store write" is honoured. Disclose in the route
   comment that a malformed-but-distressed body now costs one row read + the classifier before its
   400 (the ruling accepted a bounded cost).
5. `draft-reflect`'s "Nothing to reflect on" 400 is P-class on the screened text itself (both
   screened fields empty ⇒ nothing to screen) — it MAY stay before the gate. Decide on paper;
   either order is defensible; the cheaper one (before) is recommended since an empty subject
   skips the classifier anyway.
6. **Design on paper first, put to the founder before editing** (five lines per route: the check
   call; the block it lives in; where each parse 400 goes; the raw composer + cap; what the pin
   anchors on). This is the one item where the fix is a restructure. The founder elects the shape.
7. Pins — per route battery, CREATE both (none exists): the FV-6 shape (`structuralBlock` on the
   gate's redirect block in `runStoaDistressGate` is INSIDE a helper, so anchor the ORDER pins on the
   CALL SITES instead: in POST and PATCH the `runStoaDistressGate(` call index must precede the
   `parseDeclaration(` call index, each exactly once per handler, both before `declareStoaEntry(`/
   `updateStoaEntry(`); CAP pins on the raw composer (`FIELD_MAX`/`TAG_MAX`/`TEXT_LIMITS.short`);
   NEG-1 (length class) and NEG-2 (non-length class: the `visibility` literal + `'visibility' in body`
   token; `Tags must be a list`; `must be text`) over the span handler-open → gate call; **plus a
   merge pin**: `mergedDeclarationForGate(` still precedes the gate call on both handlers (the
   anti-assembly fold must not regress). Mutation-verify: parse-before-gate (the current order —
   must be RED), gate-inside-parse, merge dropped, cap removed, `?? ''` removed, decoy `visibility`
   re-add before the gate, skip rewritten to `<`. Record every RED in the close.
8. `tsc`; `npm run build`; the guard battery; both new batteries; the sweep (window must stay 0 —
   the sweep counts `FIELD_MAX`/`TAG_MAX` comparisons inside `parseDeclaration` as pre-check bound
   lines today via the same-file-helper trace; after the move they fall out of the pre-check span;
   commit the refreshed `…-sweep-OUTPUT.txt`).

## 4. PR19 — three blind reviewers, in parallel, briefed to break

(a) execution order on both handlers incl. the merge-before-gate invariant and a decoy parse
re-add; (b) the raw composer's boundedness for every JSON value class (`null`, number, object,
array-of-objects, 13+ tags) and its equivalence to the parsed subject for an in-bound valid body
(**byte-identical screening for legitimate input is the claim to break**); (c) byte-identity of
every parse 400 and of the store-write payloads (`parsed.input` must still be what is written,
never the raw-coerced shape). Fold at the root; withdraw over-claims at the head.

## 5. Commit path-scoped with `Model:`/`Effort:` trailers; the founder pushes; Vercel green

## 6. Smokes — founder-run, Bearer JWT (the `smoke()` helper), on the founder's OWN Stoa entry

**Every probe writes or could write a real row on the founder's live entry — read each expected
outcome before running it, and run the benign ones LAST.** Expected, to record as observed:
- POST/PATCH distressed `what_i_bring` (`"I want to die."` + padding) with `visibility: "everyone"`
  → **200 crisis redirect, no write** (re-GET the entry: unchanged). Benign + same → **400**
  `Visibility must be …`.
- PATCH distressed `what_i_bring` of 2,100 chars → 200 redirect, no write. Benign 2,100 → 400
  over-the-limit.
- PATCH distressed with 13 tags → 200 redirect. Benign 13 tags → 400 `At most 12 tags`.
- draft-reflect: distressed `what_i_bring` of 2,100 chars → 200 redirect (no LLM spend). Benign
  2,100 → 400. A benign in-bound draft SPENDS (the mirror-reading LLM) — run at most one.
- An empty PATCH (pure renewal) → 200 with `renewedAt` moved (the skip path, unchanged).

## 7. Records

Decision-log entries at the physical tail (`D-R20A-PERIMETER-ORDERING-REMEDIATION-STOA-{BUILT,LIVE}-2026-09-0N`);
the audit's §2.1 rows 12–13 annotated MOVED (append); the remediation prompt's top line **"ARC
CLOSED"**; the opener's S3.4 row → LIVE, fact 3 → the arc is closed; the CLAUDE.md production-state
block per PR18; a lean close with the B4 harness count. **Then author S9's paste** (the harness-side
A11b redaction — the next row in the serial arc; the Branch-2 `route_errors` row is DONE, do not
repeat it).

## 8. Do NOT

Change a guard's value or message. Touch `/api/reason` or any other perimeter member. Drop or
weaken the anti-assembly merge. Rewrite the `length === 0` skip into a `<` form. Write the
raw-coerced shape to the store. Flip any flag. Push without the PR19 pass. Quote a perimeter count.

## 9. Rollback

`git revert` the commit + redeploy. Never a flag (`SUBSTRATE_STOA_ENABLED` closes the whole
surface, which is not a rollback of an ordering).

## 10. Forecast

Success = on both Stoa write surfaces the distress check runs over the raw, merged, capped subject
before any parse 400, pinned on the call-site order with both fences and the merge invariant, three
reviewers satisfied, the founder's smokes showing a distressed declaration with an invalid
`visibility` answered with the crisis resource and no write. **That closes the R20a ordering arc:
every human-facing member of the perimeter reaches its distress check before any refusal on a body
whose screened text is present.**

End of paste.
