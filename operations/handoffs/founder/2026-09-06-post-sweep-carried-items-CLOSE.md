# Session close — post-sweep carried items (§4A–§4D + a mentor question)

**2026-09-06.** Tier: `governance` + `code-elevated` (§4B). **Founder elected: §4A–§4D, plus a
mentor question on §3A instead of a decision.** §3B/§3C were not applied — they need sign-off.

## Production state at close

**Unchanged by this session.** No production read, migration, flag, credential, activation, deploy
or spend. `.claude/settings.local.json` untouched (read only). One route file was temporarily
mutated for a guard proof and **restored and verified pristine** in the same command.

Production itself is **not** byte-equivalent to the 2026-09-03 record — but that predates this
session: D4's flag activation and the `/api/score-conversation` `format` 400 both landed on
2026-09-05. This session **recorded** them; it did not cause them.

## What was done

**Three things resolved at open, rather than carried as assumptions.**
- **§5's hypothesis is now a finding.** `GATE1_TIMEOUT_MS` is `55000`. F1's raise has been applied;
  the predecessor's 55,000ms guard timeout was the configured value.
- **§3B upgraded from inference to observation.** An unauthenticated fetch confirms production
  genuinely serves the stale contract (`11 assessments`, `37 assessments`, the phantom `SO-01`), and
  the live figures were independently re-derived from `agent-assessment.ts` (14 / 55 / 8 phases, no
  `SO-*` prefix in existence). Closes the gap a PR19 reviewer raised.
- **Counts re-derived, never quoted:** perimeter 43 + 2 = 45; agent-card extensions 26.

**§3A — put to the mentor, and the question changed shape.**
`operations/count-discipline-2026-09/2026-09-06-mentor-question-r20a-length-guard-ordering-FOR-RULING.md`.
The prompt framed reachability as narrow — a >15,000-char *format* field. Reading the route and git
showed otherwise: the realistically-reachable field is **`conversation`**, the guard order was
**inherited on 2026-07-07 and never chosen**, and the `format` check did not create the property, it
made it visible. So the brief asks the question of principle — when the perimeter's duty to stop
distressed content reaching the engine conflicts with its duty to answer the person, which governs? —
rather than whether to move one line. Every fact carries a `[SOURCE]` / `[GIT]` / `[RECORDED]`
provenance marker.

**§4A — item E, the CLAUDE.md production-state refresh.** Written from the decision log per PR18.
Records D4's activation **with the two limits its own activation stated** (took-effect is not
verified and is not cheaply verifiable; D4 does not close D1's replay caveat), and the live `format`
400 with its non-flag-reversibility and its crisis-redirect tradeoff. Two annotations **appended, not
rewritten** — both bullets were accurate when written. The ~20 dated extension counts were not
touched. Commit `aa4e567`.

**§4B — the guard comment-stripping hole, closed and pinned.** The prompt described a
`loadRouteSource()` with a `codeOnly` view; no such function exists. The real split was stripped
*call* checks against raw *import* checks. **Mutation-proven in both directions:** commenting out
`api/journal/route.ts`'s `detectDistressTwoStage` import left the suite at **720/0** under the raw
read and **719/1** once stripped. Nothing went red on the switch, so no assertion had relied on
comment text. A self-scan now fails on any per-route source read bound without `stripComments`, with
a non-vacuity floor beneath it; **both asserts mutation-verified.** Guard 720 → 722. Commit
`b8da976`.

**§4C — the decision-log verification came back clean.** All cited files exist (8 entries dated
2026-09-05, 0 broken paths); the mentor ruling's four quoted fragments match its verbatim record
byte-for-byte; the remaining quotes are traceable to real project documents. Content is
substantively complete. Two form observations, not defects: two header conventions coexist
(`## YYYY-MM-DD — D-…` vs `## D-…`), and entries use prose lead-ins rather than the lean template's
labelled fields. **The prompt's "six" is itself an unverified count** — the predecessor's commits
added five.

**§4D — scoped, not run.** The decisive finding: **nothing writes `environmental_context`.** Six
crons are scheduled and none is the weekly scan; no route writes it either. Yet two live perimeter
routes (`/api/skill/sage-classify:184`, `/api/skill/sage-prioritise`) read it and append it straight
into the LLM user message. The loader is fail-safe (`if (!env.last_scanned) return null`), so
severity turns on one production query the founder can run.

## Honest session notes

- **The guard blocked me twice, and was right both times.** First on the mentor brief, which claimed
  *"Every mechanism fact below was read from source"* while three facts came from CLAUDE.md — I was
  writing an overclaim into the document whose purpose is preventing overclaims. Second on the §4D
  scope, which recommended **removing two live call sites** without grounding what the injection is
  for — textbook KG-EX1, and the archive suggests they may be deliberate P7 scaffolding. Both blocks
  changed the content, not the wording.
- **I wrote six miscalibrated checks and caught all six myself.** A regex returning 31 substrate-gate
  routes; an `SO-01` absence test whose pattern matched nothing at all; a perimeter-ordering sweep
  that counted a `/** */` block comment as a call site and missed local-constant bounds; a
  decision-log field scan calibrated to invented field names; a quote matcher assuming one cited
  record; and a battery path I cited without opening. **The pattern is consistent: I write checks
  calibrated to what I expect rather than to the specification.** The 20/10/13 perimeter split that
  the ordering sweep produced was discarded rather than reported — it is named as unsound in the
  mentor brief instead of quoted as a number.
- **Peers were active throughout** (4 interactive at open). HEAD moved under this session at least
  twice. Every commit was path-scoped; a peer's `d4-differential.scratch.ts` and their untracked
  close were left untouched.

## Owed, and who owns it

| # | Item | Owner |
|---|---|---|
| 1 | **§3A ruling** — relay the mentor brief | founder / mentor |
| 2 | **§3B** R18 assessment-contract edits — wording **and** assertion as ONE change | founder |
| 3 | **§3C** `api-docs/page.tsx` — documents a shape neither route accepts | founder |
| 4 | **§3D** Option S B1–B4 pre-run; Q1/Q2 are mentor questions | founder / mentor |
| 5 | **§2** the post-deploy `format` 400 smoke — still never run (needs a Bearer JWT) | founder |
| 6 | **§4D** the one `environmental_context` query, then the disposition question | founder |
| 7 | **`manifest.md` §AC5 contradiction** — bolds "does not hand-enumerate" then names all 43 | founder |

## Open questions

- **AC5's internal contradiction.** Counts are currently correct (43 + 2 = 45, re-derived today), so
  nothing is stale; the defect is the contradiction, in the section rewritten to remove exactly that
  risk. Annotated in CLAUDE.md, **not patched** — AC5 is a governing surface. The same false claim
  sits in `D-RA2-CLOSED-PERIMETER-COUNT-ENFORCED-NOT-WARNED-2026-09-04`.

## Founder verification

```bash
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
git log --oneline -4
cd website && npx tsx src/lib/__tests__/r20a-invocation-guard.test.ts | tail -1   # 722 passed, 0 failed
npx tsx src/app/api/score-conversation/__tests__/r20a-invocation.test.ts | tail -1 # 63/63
npx tsc --noEmit; echo "tsc exit: $?"                                             # 0
```

## Rollback

`git revert` any commit independently: `aa4e567` (item E + mentor brief, documents only),
`b8da976` (guard test only), and this close. No production surface is touched by any of them.
