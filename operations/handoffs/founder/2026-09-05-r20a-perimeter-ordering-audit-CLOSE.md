# Session close — the R20a perimeter-ordering AUDIT (Session 1 of the 2026-09-05 plan)

**2026-09-05** (machine date). Tier `governance`; Standard under 0d-ii. Model `claude-fable-5-1`,
effort max, no switch. Ran across **two context windows**: the first authored the audit body
(§0–§7, the sweep, its output) and hit its limit at ~11:54 AEST; the second (this close) opened
under the same paste, ran the review fleet, folded it, and recorded. Decision-log entry:
`D-R20A-PERIMETER-ORDERING-AUDIT-COMPLETE-2026-09-05`.

## Production state at close

**Unchanged by this session.** No route changed; no migration, flag, credential, live operation,
deploy, or spend. `git diff -- website/` empty throughout. `.claude/settings.local.json` untouched.
A scratch copy of `website/src` was mutated under the session scratchpad for the sweep's
non-vacuity proof and deleted; the real tree was never modified (`git status` clean of `website/`).
**The session ends without changing a route, and that is the correct outcome.**

## Decisions made

- **The audit is complete and reviewed.** 45 members classified on both axes; execution order
  traced per handler; **16 non-conformant / 27 conformant / 2 substrate-gate not reached**; 39
  guard sites, 9 minimum-length on 7 routes. Counts derived (audit §1.1, §5), never quoted.
- **The ruling does not reach the substrate-gate members** (`/api/calling`, `/api/practice/reflect`
  — agent-facing, developer form); no length guard exists on them anyway.
- **The review ran as three blind reviewers and returned 0 HIGH.** All confirmed findings folded;
  the sweep's three defects fixed at the root (rev 2) and mutation-verified.
- **Session 3's remediation order** is the audit §6: minima first (score-conversation `<20`,
  reflect + private/reflect `<10`, score-scenario `<5`), then maxima on the most distress-likely
  surfaces, the Stoa restructure, `/api/reason`'s human path (window-sequenced), then the three
  founder-only proofs. Agent-facing members and paths: **not to be changed.**

## Status changes

| Item | Was | Now |
|---|---|---|
| S1 (this session) | queued | **RUN** |
| S3 remediation | waiting on S1 | **unblocked** — prompt authored (`…-REMEDIATION-NEXT-SESSION-PROMPT.md`) |
| The sweep script | rev 1 (three review-found defects) | rev 2, mutation-verified |
| §4.4 non-length pre-check rejections | not named | named as a mentor question, not decided |

## What the review found, and what it did not

Three reviewers (claims-vs-source; method soundness; known-case non-vacuity), run in parallel,
each briefed to break. **None moved a headline figure.** What they did move:

- **The method's self-description.** "No `middleware.ts`" was a mis-aimed check on Next 16, where
  the file is `proxy.ts` (exists; passes `/api/` through). "No deeper indirection" missed
  `validateLoopId` (an id cap, class O). "No text exists to screen" is false when the presence
  check is on a *different* field than the screened one (three routes). The first fold's own
  reconciliation ("27 … = 41, subtract two") was wrong in a way that landed on the right total.
- **The sweep.** A string literal containing a check name counted as a call — the discarded
  textual sweep's defect class, surviving in a new form. Helper following was gated to
  `parse*`/`validate*` names, so a helper called anything else was silently unfollowed. The window
  between the check and the redirect return — the second bypass three PR19 reviewers demonstrated
  on the `format` move — was not scanned. All three fixed in rev 2; the scan reports 0 bounds in
  all 54 windows.

## Honest limits (carried into the audit §1.8)

- Flag values are [RECORDED] from activation entries, never observed — a repo session cannot read
  Vercel. The classification is of flag-on execution order.
- No runtime probe was made. **F-6's two Bearer-JWT smokes remain owed** and ride Session 3.
- The sweep is a check on the trace, not the method; it follows helpers one level, reads no imported
  body (it prints the names), and its KNOWN-CASE line is a single boolean on the end anchor.
- The review was PR19 *by analogy* on a governance document — three independent dimensions, no
  first-hand substitution needed (no fleet failure). Session 3's own PR19 pass is separate.

## Reflect-harvest (PR21)

The reflect turn fired **mid-session**, because the successor window ended a turn to wait for
background reviewers and the harness read the idle turn as a close. The reflection given there:

- The at-action guard cautioned on the Bash command that re-ran the sweep and batteries; examined
  at the time through the elicitation. Honest description: I wanted confirmation in hand before the
  reviewers reported — a stake in appearing thorough, not an independent method. I would run it
  again; I would describe it differently.
- I assented to the prior window's audit as substantially complete without re-tracing 45 members,
  on the ground that PR19 routes verification through blind reviewers. The right division of
  labour, and it means my confidence in 16/27/2 was borrowed until they reported. It is now
  earned: three reviewers left it standing.
- I wrote the Session 3 prompt before the fold. The fold moved no count it carried; had it, the
  prompt would have been wrong, and I said so at the time.
- Every elicitation this session answered "the resolution preceded the examination". That is true
  each time and is the capture-and-execute convention doing the deciding, as the opener's Part D
  names. Recorded once here rather than restated.
- One examination timed out at 55,000 ms (an outage under B4's watch, not a deny); proceeded
  deliberately. Three cautions were the known "no kathekon factors" class on build acts.

## Owed, and who owns it

| # | Item | Owner |
|---|---|---|
| 1 | **Session 3** — Group 1 + F-6's smokes first (`code-critical`, founder-walked, PR19) | founder + session |
| 2 | **§4.4** — does the principle extend to non-length pre-check rejections? | founder → mentor |
| 3 | The score-conversation comment's wrong provenance claim (`route.ts:265–268`) | Session 3 |
| 4 | Push this session's commit (F-1) — nothing deploys | founder |

## Next session should

Open under the standing opener (its S1 line now reads RUN), then Session 2 (the R18 corrections,
on the founder's signature) or Session 3 (this audit's remediation), whichever the founder elects.
**Do not start the S4 window before 2026-09-08 UTC.**

## Founder verification

```bash
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
git log --oneline -3
ls operations/count-discipline-2026-09/ | grep -i "perimeter-ordering-AUDIT"
grep -c "non-conformant\|NON-CONFORMANT" operations/count-discipline-2026-09/2026-09-05-r20a-perimeter-ordering-AUDIT.md
node operations/count-discipline-2026-09/2026-09-05-r20a-ordering-sweep.js website | diff - operations/count-discipline-2026-09/2026-09-05-r20a-ordering-sweep-OUTPUT.txt && echo IDENTICAL
git diff --stat HEAD~1 -- website/
```
Expected: the audit commit at the top; the audit file listed; a non-zero count; `IDENTICAL`;
**no output** from the last line.

## Rollback

`git revert` this session's single commit — documents and an operations script only. Nothing live
is touched. The rev-1 sweep is recoverable from the commit's parent if the rewrite is unwanted.

## Cross-references

`D-R20A-PERIMETER-ORDERING-AUDIT-COMPLETE-2026-09-05`;
`D-MENTOR-RULING-R20A-LENGTH-GUARD-ORDERING-ADOPTED-2026-09-06` (authority; verbatim in
`operations/count-discipline-2026-09/2026-09-06-mentor-ruling-r20a-length-guard-ordering-verbatim.md`);
`2026-09-05-SESSION-1-r20a-perimeter-ordering-audit-SESSION-PASTE.md` (the paste this executed);
`2026-09-07-r20a-perimeter-ordering-AUDIT-NEXT-SESSION-PROMPT.md` (the method prompt);
`2026-09-05-r20a-perimeter-ordering-REMEDIATION-NEXT-SESSION-PROMPT.md` (Session 3).
