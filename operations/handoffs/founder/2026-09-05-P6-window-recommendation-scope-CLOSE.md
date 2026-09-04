# Close — P6 window / recommendation scope-for-ruling (Option D)

**Date:** 2026-09-05. **Stream:** founder. **Tier:** `governance` — documents only.
**AC7:** not engaged. **PR6:** not engaged. **PR19:** not triggered. **PR20:** engaged (§3).
**Production:** no schema, flag, credential, migration, deploy or live op. **Session model:** `claude-opus-5`.

**Decision-log entry:** `D-S11-P6-WINDOW-RECOMMENDATION-SCOPED-FOR-RULING-DEADLINE-PREMISE-WITHDRAWN-2026-09-05`.

## 1. Status in one paragraph

Option D was elected at open and is done. The scope-for-ruling is authored and routed to the mentor.
**Its headline result works against the reason the option was picked:** the R2 sequencing deadline
Option C attached to this question rests on a premise — that measuring the recommendation needs a
capture-layer edit — which does not hold. The recommendation is derivable at report time from stored
records, as this session's own green verification run demonstrates. The substantive gap is real and
unchanged. **P4 / P5 / P6 unmoved; the S11 flip remains REFUSED.**

## 2. What was produced

- `operations/trust-layer-2026-07/2026-09-05-P6-window-recommendation-SCOPE-FOR-RULING.md`
- the decision-log entry above.

Nothing else was written. No register row was edited (see §3).

## 3. The three findings that change the picture

1. **The deadline's premise is not established** (scope §4). `p1-frozen-buffer-reclassification.ts`
   already runs `interventionInputFromAtAction` + `recommendIntervention` offline over stored records,
   with a non-vacuous 130/130 lift check. Report-time derivation carries no R2 deadline, no
   contamination exposure, and no `recordHash` risk.
2. **P8a — guard-path capture — is BUILT** (commit `3e8f231`, 2026-08-17, "R2b item 8"), dark, behind
   the same capture flag. **Register P5's row and Option C's Finding C both still say the guard path
   writes nothing** — true 2026-08-15, false since 2026-08-17. P5's *status* (`OPEN`) is still right;
   activation is open. **Deliberately not corrected**, matching the prior session's restraint when the
   register and a prompt disagreed: a record correction is owed, and it is the founder's to instruct.
3. **The frozen evidence buffer is a prefix of the live one** — 130 frozen vs 138 live, all `v1`, the
   frozen file an exact prefix; the extra 8 were captured after the snapshot on 2026-07-17 and the cut
   is undisclosed. No conclusion changes. **Not fixed here** — editing a frozen evidence file is not a
   documents-only act.

## 4. The recommendation put to the mentor

Widen the window's purpose to cover the recommendation; derive it at report time; do not store it;
report consult and guard populations separately; print the A8 bound; surface it nowhere. Three
arguments against it are disclosed in the scope's §7 — the strongest being that a report-time figure
describes today's table, not what the instrument did at the time. If the mentor values capture-time
fidelity, the R2 deadline comes back and the recommendation flips.

## 5. Carried / open — the founder's

1. **The ruling itself.** Nothing proceeds on this until it lands.
2. **Register P5's stale prose + a missing changelog entry for the 2026-08-17 P8a build** — named,
   owed, not done.
3. **The frozen-buffer prefix discrepancy** — document the cut at the freeze, or re-take it. Note the
   register's reproduction check is calibrated against the 130.
4. **`529d778` was unpushed at open** (`main` ahead 1 after a real fetch), and this session's commit
   sits on top of it.
5. Untouched and unmoved: **Option E** (needs the ruling first, and R2's contents are yours),
   **Option F** (register D4's activation walk), P8a activation, and the standing queue.

## 6. Founder verification

```bash
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/website"
npx tsx scripts/p1-frozen-buffer-reclassification.ts | grep -E "reproduced|Q2 floor|round-trip"
npx tsx src/lib/substrate/trust-core/__tests__/at-action-seam.test.ts
cd .. && node harness/gate1-pre-decision/test/negative-battery.mjs | tail -2
git log --format='%h %ad %s' --date=short -- harness/gate1-pre-decision/claude-code/hooks/lib/false-hold-capture.mjs | head -1
```

Expected: `✓ all 130 records round-trip exactly`, `✓ reproduced (129)`, `Q2 floor … HOLDS`;
`59 passed, 0 failed`; `251 passed, 0 failed` + `RELEASE GATE: PASS ✓`; and the last line reads
`3e8f231 2026-08-17 R2b item 8 (P8a): guard-path capture…` — the finding in §3.2, in one command.

## 7. Session honesty notes (PR21)

- **The at-action guardrail check timed out (28s) on one action and the frame said so explicitly** —
  "proceeding WITHOUT that check… treat it as unguarded". The action was a documents-only heredoc
  write. I proceeded, which I think was right, but I am recording that I did not pause on it, because
  last session's finding was that this exact discounting is the ADVISE channel's measured behaviour and
  the honest thing is to log it rather than let it pass unremarked.
- **The session's own opening frame read `is_kathekon=false — quality=contrary`** on a request to read
  a prompt file — the sparse-extraction false-positive class, and a live instance of the thing the P6
  window exists to measure the rate of.
- **The chosen option's premise did not survive its own grounding check.** Option D was picked because
  it had a deadline; the first substantive finding was that the deadline is not established. The
  temptation to keep the urgency framing (it justifies the choice) was real and is named here.
- **Every load-bearing claim was re-verified at source, not cited from the code comment that stated
  it** — `recordHash`'s hashed fields, the `habitualCount` floor, and the zero-hit grep re-run without
  `head` masking the count. Two of the three had a correct comment; the check cost seconds and is what
  the "lesson cited, not tested" row asks for.
- **One claim was narrower than I first wrote it** (the A8 counter, checked only in `session-state.mjs`
  before being widened to the whole harness) and was corrected in place before the document was
  committed.

## 8. Cross-references

`2026-09-05-P6-window-recommendation-SCOPE-FOR-RULING.md` (the deliverable) ·
`2026-09-04-C-at-action-seam-caller-SCOPE.md` §6 (Finding E, the origin) ·
`2026-09-04-P1-decision-table-input-SCOPE-FOR-RULING.md` (the template) ·
`2026-08-15-false-hold-new-window-scoping-note.md` (P6) ·
`2026-07-12-mentor-consultation-s11-enforce-gate-verdict-verbatim.md` (Q3/G6(a); the refusal) ·
`S11-FLIP-PREREQUISITES-REGISTER.md` §A P4/P5/P6, §D D4.
