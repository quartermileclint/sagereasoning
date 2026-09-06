# Session close — the Stoa restructure, and the R20a perimeter-ordering ARC CLOSE (Session 3D)

**2026-09-06** (machine date; opened ~11:17 AEST, closed ~11:55 AEST). Tier `code-critical`; R20a
perimeter, PR6 + AC5. Founder-walked: the founder pushes and runs the live smokes; AC7 engages at
the push. Model `claude-opus-5` for the edits, pins, harness and folds; the three PR19 reviewers on
`claude-sonnet-5`. Decision-log entry:
`D-R20A-PERIMETER-ORDERING-REMEDIATION-STOA-BUILT-ARC-CLOSED-2026-09-06`.

## Production state at close

**UNCHANGED.** Nothing pushed, nothing deployed. Two local commits ahead of `origin/main`:
`6586713` (the build) and this records commit. On the founder's push, production becomes NOT
byte-equivalent on the two Stoa write surfaces, and the three R18 public surfaces change. No
migration, flag, credential or schema touched.

## Elections at open

The proposed restructure shape (a raw-body composer before the merge and gate on `/api/mentor/stoa`;
the whole of `parseDraft` after the gate on `draft-reflect`). **F-4 SIGNED — S2 rode this sitting**
and is landed in the same commit.

## What was built

**Part 1 — the Stoa restructure (the arc's last two members).**

| Route | Before | After |
|---|---|---|
| `/api/mentor/stoa` POST + PATCH | parse → merge → gate → write | **raw composer → merge → gate + redirect return → parse's 400s → write** |
| `/api/mentor/stoa/draft-reflect` | parse → compose from parsed → gate → LLM | **compose from raw → gate + redirect return → parse's 400s → LLM** |

The anti-assembly merge (the gate sees the entry as it will be served) is preserved key-for-key.
The store still writes `parsed.input` / `parsed.draft` only. Every 400's message, value and status
is unchanged; each screening cap equals its own guard's bound.

**Part 2 — S2, the R18 assessment-contract corrections.** `llms.txt` ×6, `agent-card.json` ×4
(extensions still 26), `skill-registry.ts` ×1, plus the source-derived drift assertion — one change,
per the package. **Still open, deliberately excluded by the package's own §D:** the
`api-docs/page.tsx` assessment-entry rewrite.

## Review

Three blind reviewers, all three completed. **Reviewer A (execution order): CLEAN.** **Reviewer C
(R18 docs + test adequacy): Part 1 clean; one HIGH on Part 2.** **Reviewer B (screening
equivalence): one HIGH, one LOW.** All folded at the root:

1. **HIGH — a screening bypass this session introduced.** The tag cap sliced by RAW length while the
   guard measures TRIMMED length. A whitespace-padded tag passed validation, saved and displayed in
   full, and screened as a single character. Confirmed by first-hand repro before folding; fixed by
   trimming before slicing (metric parity); pinned by RAW-1b plus a behavioural pin.
2. **HIGH — the class, not the instance.** The draft-reflect battery's NEG-2 lacked the raw
   field-name fence its sibling gained in-build, so a decoy pre-gate guard with a fresh error message
   stayed green at 63/0. The reviewer demonstrated it live. Ported; their exact repro now goes red.
3. **LOW** — a non-string field is now stringified and screened before its type 400. Disclosed.
4. Reviewer A's LOW (a throwing `toString` reaching `String()`) is **recorded as
   verified-unreachable** for JSON-parsed input rather than patched with an untestable branch.

## Verification (all green at close)

`tsc` 0 · `next build` ✓ · guard battery **722/0** · injection-defence **60/0** (untouched) · drift
assertion **13/0** · stoa **58/0** · draft-reflect **63/0** · the eight Group 1/2/2b/3 batteries green
· sweep window **0** on all 54 handlers, output refreshed. **Mutation record** (25 mutations, every
one RED on the named pin, every restore SHA-256-verified, both post-restore batteries GREEN):
`operations/count-discipline-2026-09/2026-09-06-session3D-mutation-record.txt`.

## Honest limits

- No end-to-end HTTP smoke (needs a Bearer JWT — the founder's walk below).
- **Two of the three in-build gaps were found by the mutation harness, not by review** — including a
  fence of mine that was vacuous under string blanking. Positional pins are not self-validating.
- Residuals as recorded: distress past each cap unscreened; the 13th tag onward unscreened; the
  stage-2 cost class on malformed bodies; the sweep is per-handler.
- **A genuine at-action guard BLOCK** (`do_not_proceed`, the session's only one): the first draft of
  the decision-log entry quoted the tags-bypass attack string verbatim and the engine read a
  technical security record as distress. Adjusted, not retried verbatim — the bypass is now
  described by its shape. A false-positive class worth expecting in the B4/P6 window.
- **A11b / harness count for B4 (this session, from open):** 15 guard cautions, 1 guard block,
  13 elicitations, 0 CONSULT-OUTAGE, 0 ELICIT-OUTAGE, 1 UNFRAMED (`no assessment in response`, on
  the S9 paste — which necessarily quotes the very schema tokens the defence rejects, a live
  instance of the problem S9 exists to fix). 72 AT-ACTION-SKIP-BASH by design.

## Owed, and who owns it

| # | Item | Owner |
|---|---|---|
| 1 | Push `6586713` + the records commit; watch Vercel green | founder |
| 2 | Pre-push verify (below) | founder |
| 3 | Smokes (below); then the LIVE addendum | founder, then a session |
| 4 | **S9 — the next row** (paste `2026-09-06-SESSION-S9-harness-a11b-redaction-SESSION-PASTE.md`) | a Session S9 |
| 5 | The `api-docs/page.tsx` assessment-entry rewrite (the package's §D) | its own R18 item |

## Founder verification

```bash
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
git log --oneline -3
cd website && npx tsc --noEmit; echo "tsc exit: $?"
npx tsx src/lib/__tests__/r20a-invocation-guard.test.ts 2>&1 | tail -1
npx tsx src/lib/__tests__/assessment-contract-drift.test.ts 2>&1 | tail -1
for t in mentor/stoa mentor/stoa/draft-reflect; do npx tsx src/app/api/$t/__tests__/r20a-invocation.test.ts > /tmp/b.txt 2>&1; echo "$t: $(tail -1 /tmp/b.txt)"; done
python3 -c "import json;d=json.load(open('public/.well-known/agent-card.json'));print('extensions',len(d['capabilities']['extensions']))"
```
Expected: `tsc exit: 0`; `722 passed, 0 failed`; `13 passed, 0 failed`; stoa 58/0; draft-reflect
63/0; extensions 26.

**Live smokes — founder-run, Bearer JWT, ON YOUR OWN LIVE STOA ENTRY. Read each expectation before
running it. The distressed probes must leave the entry UNCHANGED; run the benign ones LAST; run at
most ONE benign in-bound draft-reflect probe, because it calls the mirror-reading LLM and spends.**

```js
const sbKey = Object.keys(localStorage).find(k => k.startsWith('sb-') && k.includes('auth-token'));
const sbToken = JSON.parse(localStorage.getItem(sbKey))?.access_token;
const hdr = { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + sbToken };
const D = 'I want to die.', B = 'I bring ten years of operations experience.';
const go = (m,url,body) => fetch(url,{method:m,headers:hdr,body:JSON.stringify(body)}).then(async r=>console.log(m,url,r.status,(await r.text()).slice(0,200)));
// 1. BEFORE: snapshot your entry so you can prove the distressed probes wrote nothing
fetch('/api/mentor/stoa',{headers:hdr}).then(r=>r.json()).then(x=>console.log('BEFORE',JSON.stringify(x).slice(0,300)));
// 2. distressed + an invalid visibility -> expect 200 crisis redirect, NO write
go('PATCH','/api/mentor/stoa',{ what_i_bring: D, visibility: 'everyone' });
// 3. distressed + an oversized field -> expect 200 crisis redirect, NO write
go('PATCH','/api/mentor/stoa',{ what_i_bring: D + ' '.repeat(2200) });
// 4. distressed + 13 tags -> expect 200 crisis redirect, NO write
go('PATCH','/api/mentor/stoa',{ what_i_bring: D, tags: Array.from({length:13},(_,i)=>'t'+i) });
// 5. draft-reflect, distressed + oversized -> expect 200 crisis redirect, NO LLM spend
go('POST','/api/mentor/stoa/draft-reflect',{ what_i_bring: D + 'x'.repeat(2100) });
// 6. AFTER the distressed probes: re-read and confirm the entry is byte-unchanged from BEFORE
fetch('/api/mentor/stoa',{headers:hdr}).then(r=>r.json()).then(x=>console.log('AFTER',JSON.stringify(x).slice(0,300)));
// 7. benign guard-failing probes -> expect 400 on the named guard, still no write
go('PATCH','/api/mentor/stoa',{ what_i_bring: B, visibility: 'everyone' });   // Visibility must be...
go('PATCH','/api/mentor/stoa',{ what_i_bring: B + 'x'.repeat(2200) });        // over the 2,000-character limit
go('PATCH','/api/mentor/stoa',{ what_i_bring: B, tags: Array.from({length:13},(_,i)=>'t'+i) }); // At most 12 tags
go('POST','/api/mentor/stoa/draft-reflect',{ what_i_bring: B + 'x'.repeat(2100) });             // over the limit
// 8. the renewal path is unchanged -> expect 200 with renewedAt moved (this DOES write)
go('PATCH','/api/mentor/stoa',{});
```
Record each as observed (status + body fields), never as expected. **If any distressed probe shows a
changed entry between BEFORE and AFTER, stop and revert — that is the invariant the arc exists to
protect.**

## Rollback

`git revert 6586713`; redeploy. Never a flag — `SUBSTRATE_STOA_ENABLED` closes the whole surface,
which is not a rollback of an ordering.

## The arc

**CLOSED.** Sixteen non-conformant members, four sittings: Group 1 (four minima, `c679739`), Group 2
(eleven routes' maxima, `cbd93ae`), Groups 2b + 3 (`555502e`), the Stoa pair (`6586713`). Every
human-facing member of the R20a perimeter now reaches its distress check before any refusal on a
body whose screened text is present and readable. J, A and F remain outside the ruling by its own
terms, and no move is owed there.

## Cross-references

`D-R20A-PERIMETER-ORDERING-REMEDIATION-STOA-BUILT-ARC-CLOSED-2026-09-06`; the audit §2.1 rows 12–13;
the remediation prompt (marked SPENT); `D-MENTOR-RULINGS-FIVE-RELAYS-ADOPTED-2026-09-05` (Part 5);
`D-MENTOR-RULING-R20A-LENGTH-GUARD-ORDERING-ADOPTED-2026-09-06`; the S9 paste.
