# Close — M-5(b), M-4 obligations 1+4, and mechanical item 1 (empty-subject defect)

**Session date:** 2026-08-20 → 2026-08-22 (spanned the date rollover twice). **Stream:** founder.
**Tier:** `code-critical` (M-5(b), M-4) + `code-elevated` (mechanical item 1).
**Decisions:** `D-M5-VULNERABILITY-FLAG-WRITE-BUILT-UNCOMMITTED-REDIRECTED-TO-R20A-PERIMETER-GAP-2026-08-20`,
`D-M5B-VULNERABILITY-FLAG-WRITE-PATH-SETTLED-AND-FIXED-2026-08-20`,
`D-M4-OBLIGATIONS-1-AND-4-BUILT-DISCLOSURE-GATED-RETIREMENT-APPLIED-PR19-FOLDED`,
`D-EMPTY-SUBJECT-BILLED-CALL-DEFECT-CLOSED-22-ROUTES-PR19-CLEAN`.
**Prompt:** `2026-08-19-post-taxonomy-stubs-task-menu-NEXT-SESSION-PROMPT.md` — now **SPENT**.
**Opened at HEAD `12522e7`** (matching the named predecessor); **closes at HEAD `bbd89d1`**, three
commits ahead, all pushed, Vercel green after each push.

---

## Production state at session close

**All three commits are live on `origin/main` and deployed (Vercel confirmed green after each push).**

- `8b04e53` (M-5(b), the `vulnerability_flag` write path) — **the write path exists but is
  inert in production.** No caller of `detectDistressTwoStage` anywhere in the codebase currently
  passes a real `userId`, so `handleGenuineDetection` always resolves `flag_written: false` (honest,
  not the prior aspirational `true`). The real-time Slack/Discord alert path IS live-reachable on any
  genuine moderate/acute/mild detection today (it needs no identity), gated only on whether
  `ALERT_WEBHOOK_URL` is configured in Vercel — **not verified this session whether it is.** There is
  no feature flag gating this write path — unlike every prior R20a addition, activation has no single
  flip point; it activates per-route the moment a future session threads a real `userId` (and, for
  dedup to do anything, a `sessionId`) through that route's call site.
- `d6f5073` (M-4 obligations 1+4) — **live and user-visible.** The top rung (`principled → sage_like`)
  is now structurally unreachable for every agent (by design, per the binding ruling — no agent can
  reach `sage_like` until `disposition_stability` is restored with a perturbation-adjusted measure).
  The disclosure text is live on `llms.txt`, `agent-card.json`, and the trust-record envelope. The two
  display sites (`accreditation-card.ts`, `agent-hand-back-report.ts`) now omit `disposition_stability`
  for any agent at `principled` or `sage_like` proximity.
- `bbd89d1` (mechanical item 1, 22 routes) — **live.** Every route in the empty-subject-defect class
  now skips the billed Haiku call on an empty/whitespace-only composed subject. No behavioural change
  for any genuine input; only removes a cost-amplification vector on malformed/empty request bodies.

**Byte-identity guard posture, re-verified at session open and unchanged throughout:**
`GATE1_FALSE_HOLD_CAPTURE` was absent from both the process env and `.claude/settings.local.json` at
open (per the predecessor's own note) and nothing this session touched it.

**One pre-existing, unrelated file remains modified and uncommitted:** `website/src/data/environmental-
context.json` — flagged in a prior session as unrelated, deliberately excluded from all three of this
session's commits again. Still an open decision (commit or discard) — item 14 in the original task-menu
prompt, not touched this session.

---

## What was built, in the order it actually happened (including two redirects)

### 1. M-5 — started, redirected once on discovering a governing scope document mid-build

Began building the `vulnerability_flag` write path (the M-5 gap named second in the confirmed order)
without first searching for an existing scope document — a real process gap, named plainly in the
decision log rather than smoothed over. A first PR19 pass surfaced
`operations/trust-layer-2026-07/2026-08-17-M5b-vulnerability-flag-write-path-SCOPE.md`, a binding
mentor-ruling-governed document naming five open founder decisions (D1–D5) and a separate, apparently
more urgent R20a perimeter gap. The founder redirected: stop, leave the code uncommitted, pivot to the
perimeter gap.

### 2. The redirect target turned out to be moot — already closed and live

Tracing the perimeter gap first-hand (not trusting the three-day-old scope doc) found it had already
been built, activated, founder-smoked, and disclosed the day before this session opened (commit
`026ec0a`, 2026-08-19). The founder redirected a second time: back to M-5(b), settle D1–D5 properly.

### 3. M-5(b) settled and built (`8b04e53`)

D1/D3 confirmed as already-correct (no flag for agent-authenticated branches; abstain on `/api/calling`
and `/api/practice/reflect`'s operator identity). D2 (dedup) built new. A new encryption question
(discovered mid-build, not in the original D1–D5 list — `triggered_rules` cannot actually be encrypted
without a schema migration the table doesn't have) settled as "write an empty array for now." A first
PR19 pass confirmed four defects (plaintext write violating the table's own documented Tier-C posture,
an ordering bug, a regex-vs-Haiku severity asymmetry, the missing dedup) — all fixed at the root. A
second, independent PR19 pass confirmed the fixes hold and caught one real thing: the dedup mechanism
is correctly built but currently does nothing for its own motivating scenario, because the five routes
it targets pass no session id at all — corrected in the documentation rather than left overclaiming.
Committed, pushed, Vercel green.

### 4. M-4 obligations 1 and 4 (`d6f5073`)

Re-derived from source per the prompt's own instruction (not assumed). Obligation 4 (the disclosure)
applied FIRST per the ruling's own gate — drafted, founder-signed-off, applied to all three R18
surfaces, S10-battery-verified. Obligation 1 (the retirement) built second: the engine now excludes
`disposition_stability` from the top-rung transition only (never retuning the threshold — the ruling's
named dishonest option), verified by an exhaustive 256-combination enumeration proving the three lower
rungs are byte-behaviourally unchanged. Two display sites updated. A held, previously-reverted patch
implementing the REJECTED global version of this change was confirmed not restored. PR19 found and
fixed one real reuse defect (a duplicated predicate between the two display sites) and refuted one false
claim (that the disclosure hadn't shipped — it had, a line-wrap defeated the reviewer's own grep).
Committed, pushed, Vercel green. **A commit-message paste error was caught and corrected via `git
commit --amend` before push** (the first commit accidentally carried M-5's message text).

### 5. Mechanical item 1 — the empty-subject billed-call defect (`bbd89d1`)

The confirmed order named this "14 remaining routes." Direct re-derivation found the real count was
**22**, not 14 — corrected before any fix began, not discovered partway through. Founder elected to fix
all 22 in one pass. Applied identically at every site (25 call sites across 22 files, several carrying
the pattern twice). PR19 (three finder batches, mechanical-uniformity-aware) returned **zero findings**
across all three batches. Committed, pushed, Vercel green.

---

## PR19 — independent adversarial review, four separate passes this session

1. M-5(b), pre-fix: 8 findings reported (6 CONFIRMED, 2 PLAUSIBLE), including the process-governance
   finding that triggered the first redirect.
2. M-5(b), post-fix (independent, fresh finder agents): all four fixes CONFIRMED-FIXED; one important
   documentation-honesty correction (the dedup-is-inert-for-its-motivating-case finding).
3. M-4: 3 findings (1 CONFIRMED reuse defect fixed at the root, 2 PLAUSIBLE left as named-not-fixed).
4. Mechanical item 1: three batches, zero findings — reported honestly with an empty array rather than
   manufacturing something to report.

---

## Verified (cumulative, all green at session close)

`tsc --noEmit` clean throughout every edit this session. `npm run build` clean after each of the three
build phases. `r20a-invocation-guard.test.ts` **689/0** at every checkpoint (no regression across the
whole session). New test batteries: `r20a-vulnerability-write.test.ts` **28/0**,
`m4-disposition-stability-retirement.test.ts` **16/16** (exhaustive enumeration),
`m4-disposition-stability-display.test.ts` **19/19**. Regression suites re-run clean:
`sage-assent-accreditation-writer.test.ts` 57/57, `agent-hand-back-report.test.ts` 54/54, S10
trust-record battery 135/135, and 7 per-route boundary suites for mechanical item 1's touched files.

---

## Two process lessons worth carrying forward, named rather than absorbed

**1. Build without first searching for an existing scope document, on a P0-tier item, cost a real
redirect.** The M-5 false start (item 1 above) is the clearest instance this session of the standing
"method/test/frame before purpose" failure mode's near cousin — grounding before building. PR19 caught
it, which is the process working, but the AI's own pre-build search should have caught it first.

**2. Two of the three carried task-menu counts this session were stale, both by roughly the same
proportion (~35–60% low).** "14 remaining routes" was actually 22; the earlier-session "no per-route
runtime invocation tests for those 3 already-fixed routes" turned out, once the 22-route scope was
known, to actually cover 15 files. Neither discrepancy was caught by the sessions that wrote those
counts — both were caught this session only by re-deriving from source before acting, exactly the
discipline the opening prompt itself demanded for M-4. **Any future session inheriting a route-count or
file-count claim from a prior session's prose should re-derive it, not trust it — this is now three
occasions in this project's history (the R20a perimeter count, "14 remaining routes," and the
runtime-invocation-test scope) where a carried count was wrong.**

---

## What does not move — carried forward exactly as named in the confirmed order

- **Mechanical item 2** — per-route runtime invocation tests. Re-scoped this session (not built): 15
  files, not 3 (`mentor/passion-classify`, `mentor/oikeiosis/extension`, `mentor/private/founder-facts`,
  `mentor/private/journal-week`, `mentor/private/baseline`, `mentor/private/baseline-response`,
  `mentor/gap4`, `mentor-baseline`, `mentor-baseline-response`, `mentor-journal-week`, `compose`,
  `evaluate`, `execute`, `skill/sage-classify`, `skill/sage-prioritise`).
- **Mechanical item 3** — PR24 retention parity for `agent_hold_observations` (declares `retain_until`,
  nothing enforces it). Untouched.
- **Mechanical item 4** — the RLS survey remainder
  (`operations/primal-substrate-2026-08/2026-08-16-rls-route-enforcement-survey.md`). Untouched; verify
  the path first-hand before trusting its own contents, per this session's own lesson above.
- **The standing-runner gate question** — routing a scoped FOR-RULING question to the mentor about
  whether the bounded validation run's §6 report needs its own separate mentor review, or whether the
  cycle-20-stop ruling already discharges the gate. Not reached this session.
- **Housekeeping** (the stale-DARK-claim fix in `watching/handler.ts`, the line-citation drift in
  `idea-loop-types.ts`, the `environmental-context.json` commit-or-discard decision) — not reached.
- **GS-ATRF-1 §(c-bis)**, the puzzle-taxonomy entry-type design document — correctly not touched, per
  the predecessor's own explicit scope boundary.

---

## Founder Verification (between sessions)

```
cd website
npx tsc --noEmit                                                              # exit 0
npm run build                                                                 # exit 0
npx tsx --env-file=.env.local src/lib/__tests__/r20a-invocation-guard.test.ts # 689 passed, 0 failed
npx tsx src/lib/__tests__/r20a-vulnerability-write.test.ts                    # 28 passed, 0 failed
npx tsx src/lib/substrate/trust-layer/grade-engine/__tests__/m4-disposition-stability-retirement.test.ts  # 16 passed, 0 failed
npx tsx src/lib/substrate/trust-layer/card/__tests__/m4-disposition-stability-display.test.ts             # 19 passed, 0 failed
```

Live: confirm `https://www.sagereasoning.com/.well-known/agent-card.json` and `llms.txt` carry the new
disposition_stability disclosure sentence (search "corrected 2026-08-17").

---

## Orchestration reminder

Three separate `code-critical`/`code-elevated` builds landed in one session, each independently
PR19-reviewed and committed. None of the three depends on the others being reverted independently —
each commit is a clean, self-contained unit (`git revert <hash>` on any one is safe in isolation, per
each build's own rollback section in the decision log).

---

## Cross-references

- `operations/decision-log.md` — four entries this session, in order:
  `D-M5-VULNERABILITY-FLAG-WRITE-BUILT-UNCOMMITTED-REDIRECTED-TO-R20A-PERIMETER-GAP-2026-08-20`,
  `D-M5B-VULNERABILITY-FLAG-WRITE-PATH-SETTLED-AND-FIXED-2026-08-20`,
  `D-M4-OBLIGATIONS-1-AND-4-BUILT-DISCLOSURE-GATED-RETIREMENT-APPLIED-PR19-FOLDED`,
  `D-EMPTY-SUBJECT-BILLED-CALL-DEFECT-CLOSED-22-ROUTES-PR19-CLEAN`.
- `operations/trust-layer-2026-07/2026-08-17-M5b-vulnerability-flag-write-path-SCOPE.md` — the
  governing scope document, now fully settled.
- `operations/trust-layer-2026-07/2026-08-17-mentor-ruling-M4-return-verbatim.md` — the binding M-4
  ruling.
- `operations/handoffs/founder/2026-08-19-post-taxonomy-stubs-task-menu-NEXT-SESSION-PROMPT.md` — this
  session's opening prompt, now spent.
- `operations/handoffs/founder/2026-08-22-mechanical-items-234-and-routing-NEXT-SESSION-PROMPT.md` —
  the successor prompt.

*End of close. Three Critical/Elevated builds landed, reviewed, committed, pushed, and confirmed live.
Two carried counts were found stale and corrected rather than trusted. The confirmed order continues at
mechanical item 2.*
