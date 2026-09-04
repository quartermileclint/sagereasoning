# Session close — post-ruling autonomous work (items A–D)

**2026-09-05.** Tier: `code-elevated`. **Items A, B, C, D complete. Item E not started, correctly.**

## Production state at close

**Byte-equivalent to session open.** No production read, migration, flag, credential, activation,
deploy or spend. `.claude/settings.local.json` untouched. Option S has still **never made a call**;
`runs/` is empty. The S11 flip remains REFUSED; weights remain BLOCKED.

One always-on code change ships on deploy: the `format` length check on `/api/score-conversation`
(a new 400 path). It is **not** flag-reversible — see the corrected rollback note in the module.

## What was done

**A — count-discipline sweep.** The prompt said to prioritise the public R18 surfaces. That is where
it paid, and what is there is worse than a stale count: **three served surfaces document an assessment
contract that returns HTTP 400** (11/37/7 documented against a live 14/55/8, plus a published example
id, `SO-01`, that exists nowhere in the bank). Docs written 2026-03-29, code moved 2026-04-01, docs
never followed — **~5 months**. Exposure nil (pre-0h). **Drafted, not applied**; the accompanying
assertion was run **6/7 against live surfaces and 13/0 against scratch copies carrying the drafted
edits**, proving the diffs complete without touching a public surface.

Second finding, about the previous remedy: the 2026-09-04 assertion scanned only the file **header**,
and two stale counts sat in the **body**, beside assertions carrying the correct figure. Fifth
recurrence, in the file written to stop it. **The new lesson: a guard scoped to where the last
instance happened does not arrest the class — and is worse than none, because it looks like
coverage.**

**B — `format` length validation.** Landed, test-first (59/62 → 63/63). **The item was scoped to me
as "input validation, not safety" and that was wrong**: the composer truncates at 15,000 while the
route appended the full field to `domainContext`, so text past the cap reached the engine having
never reached the classifier. PR19's three reviewers found the fix sound and **my tests defective** —
two HIGH, each demonstrated at 62/62 with the defect fully restored. Folded, and all three defeating
mutations re-run and now caught.

**C — community-map 42703.** Already fixed, live since 2026-08-03; one line of route code, no
migration. **The carried cause was wrong** — not a missing column (production found all five
present) but a route filtering against a view that deliberately does not expose it.

**D — Option S PR19. Recommendation: do not run.** Four pre-run blockers that change what the same
240 calls yield, so fixing after the sweep means re-spending. Full account in
`operations/count-discipline-2026-09/2026-09-05-option-s-PR19-REVIEW-FINDINGS.md`.

## Owed, and who owns it

| # | Item | Owner |
|---|---|---|
| 1 | **R18 sign-off** on the eleven assessment-contract wording edits — **apply wording and assertion as ONE change** | founder |
| 2 | **`api-docs/page.tsx`** documents a request shape neither assessment route ever accepted — its own R18 item | founder |
| 3 | **Option S: B1–B4** before any spend; **Q1/Q2** are mentor questions | founder / mentor |
| 4 | **Perimeter-ordering** on `/api/score-conversation` — the oversized-`format` crisis-redirect tradeoff | founder |
| 5 | **CLAUDE.md community-map annotation** — drafted, goes to item E or the next opener | next session |
| 6 | **Item E** — CLAUDE.md production-state refresh (PR18 close-time artifact) | next session |
| 7 | The pre-existing INV-*/SRC-* comment-stripping weakness in `r20a-invocation-guard.test.ts` | next session |

## Honest session notes

- **Every one of my own errors this session was an overclaim, never an underclaim.** I described FV-2
  as a generalisable invariant before mutation-testing it and two reviewers demolished it; I wrote a
  safety justification that flattered my own placement while that placement created a different false
  negative; I cited a path I had not opened (the port mirror); and I headed a column "Live" for
  behaviour I had inferred from HEAD without reading production. **I spent the session finding places
  where prose had outrun code and introduced five of them.** All five were caught by review, not by
  me.
- **The guard blocked one commit outright** (`do_not_proceed`). Re-examining rather than retrying
  surfaced a real gap — a deferred CLAUDE.md correction with no tracked owner — which is now fixed.
  The guard was right to stop it.
- **A later guard call timed out at 55,000ms.** That suggests F1's `GATE1_TIMEOUT_MS` raise has been
  applied since the prompt was written. **Treat that as a hypothesis, not a finding** — I did not
  read `.claude/settings.local.json`, and §5 forbids changing it.
- **Peers were active throughout**, committing to `option-s`, the D4 prompt and
  `derive-trust-events.ts`. HEAD moved under this session repeatedly. Every commit was path-scoped;
  no peer file was touched. Item D was **held** while `option-s` was being committed to minute-by-minute
  and reopened only once it had been stable a quarter of an hour.
- **Item D's artifact is newer than the prompt describes** — the candidates were populated at
  `4cb2008`, 04:22 today. The review covers the current state.

## Commits

`1ecff99` guard widening · `3d4c075` sweep deliverables · `a83a807` decision log ·
`1513ffb` community-map diagnosis · `4c1cd94` format validation + PR19 folds ·
`936b2ab` findings PR19 folds · `9896e2b` decision log · `81de407` Option S review ·
`468fcf9` decision log.

## Next session

`operations/handoffs/founder/2026-09-06-post-sweep-carried-items-NEXT-SESSION-PROMPT.md`
