# SESSION PASTE — Session S5: D2 scope-for-ruling (the self-only dikaiosyne domain tag)

**Paste this whole file as the first message of a fresh session.** Standing queue row **S5** of the
single serial arc (standing opener, Version 2026-09-05 as re-planned 2026-09-06). The R20a ordering
arc closed at S3.4; **S9 landed 2026-09-06 and its E5 coupling is discharged**, so this row and S4
are what stand between the queue and the window start.

**Tier `governance`, AUTONOMOUS. This session writes a SCOPE DOCUMENT and a mentor question. It
changes NO code, NO schema, NO flag, NO credential — and it does not decide the question.** The
deliverable is a document the founder relays. Mirror the shape of
`operations/trust-layer-2026-07/2026-09-04-P1-decision-table-input-SCOPE-FOR-RULING.md`, which is
the precedent this row was written against.

**Never push. Never `git add -A`. Never stage a peer's files. Never edit
`layer2-mechanisms.ts`, `derive-trust-events.ts` or `trust-transition.ts` — reading them is the
whole job. Date every artifact from `date`/`git log`, never the context date.**

Written 2026-09-06 (`date`), HEAD after the S9 commit. Model at writing `claude-opus-5`.

---

## 0. Open under the standard protocol

1. `operations/handoffs/founder/STANDING-SESSION-OPENER-grounded-foundations.md` — Part A in full,
   the "⚠️ facts" (fact 4 is this row's context), the Standing queue. Its S5 row is this session.
2. `operations/trust-layer-2026-07/S11-FLIP-PREREQUISITES-REGISTER.md` — **the D2 row and the D4
   row in full.** D4's row is long and carries the evidence this session exists to act on; read it
   to its end, including the paragraph beginning "⚠ AND THE PROOF SURFACED A LIVE COUPLING".
3. **The two binding rulings this question sits between:**
   - `operations/trust-layer-2026-07/2026-07-19-mentor-consultation-dikaiosyne-self-circle-verbatim.md`
     (dikaiosyne is other-directed; the self circle standing alone is not a justice surface).
   - **M-1**, the 2026-08-16 correction that made D4's narrowing symmetric — find it via the D4 row's
     citation. Its operative sentence is that the evidence *"is not being dropped; it is being
     correctly attributed"*, and that preserving a mis-attribution *"is preserving a category error
     in the direction that hard-floors the wrong domain."*
4. The precedent for the deliverable's SHAPE: `2026-09-04-P1-decision-table-input-SCOPE-FOR-RULING.md`
   and the ruling it drew (`2026-09-04-mentor-ruling-P1-decision-table-input-verbatim.md`). Note how
   P1's scope doc separated **findings that correct the register** from **the question put**.
5. The close that raised this row's priority: `2026-09-05-post-D4-live-op-cluster-CLOSE.md` and
   `D-D4-TOOK-EFFECT-PROVEN-D1-WATCH-OPEN-RETRY-HELD-2026-09-05`.

## 1. Verify, don't trust this file

```bash
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
date && git fetch origin && git status && git log --oneline origin/main..HEAD && git log --oneline -3
grep -c GATE1_FALSE_HOLD_CAPTURE .claude/settings.local.json   # informational — this session touches no code either way
```
**Re-derive every line number below with `grep -n`.** They were read at HEAD on 2026-09-06 and this
file's own standing instruction is that a line number in prose goes stale.

## 2. What D2 actually is, as found at HEAD — verify each claim before using it

**The one-sentence form:** two different definitions of "dikaiosyne is engaged" live in
`website/src/lib/translation-sandwich/layer2-mechanisms.ts`, one was narrowed by the self-circle
ruling and the other was not, and the un-narrowed one is what reaches the live trust ledger.

**The narrowed definition** (`isDikaiosyneEngaged`, ~`:1688`, calling `dikaiosyneEngagedCircles`
~`:1676`) filters `self_preservation` out of the circle set when its flag is on, and its own
docstring calls itself *"THE ONE shared engagement predicate … so the two can never drift on what
'no circle' means."* It governs `computeDikaiosyneFloor` (the §4 proximity floor) and Q2's
first-circle routing.

**The un-narrowed definition** (`computeVirtueDomains`, ~`:1995`) pushes `'dikaiosyne'` on
`oik.relevant_circles.length >= 1 || kathekon.is_kathekon !== null`. **No circle-identity test at
all** — and the second disjunct tags dikaiosyne on ANY non-null kathekon assessment, including
`is_kathekon === false`. Its output is `virtue_domains_engaged` on the signed assessment.

**Why that reaches the ledger.** `derive-trust-events.ts` (~`:86–99`) emits one
`credential-completed` per domain in `virtue_domains_engaged`, **with no circle test**, and
`trust-transition.ts` (~`:41`) gives `credential-completed` the effect **`'increase'`**.

**The observed consequence** (D4's took-effect proof, 2026-09-05, on a real production consult with
a self-only circle set): the state row read `dikaiosyne: earned_level 'deliberate', profile_prior
'habitual', justice_floor_active false`. So M-1's correction reached the justice-surface
**emission** but not the domain **tagging** — and where the pre-D4 mis-attribution produced a *cap*,
the same mis-attribution now produces an *increase*.

**Confidence, carried verbatim from the register and NOT to be upgraded without measurement:** the
single-event state is **OBSERVED**; the multi-event rise past `deliberate` is **REASONED** from
`trust-transition.ts`, not measured. If this session wants to claim the rise, it must either measure
it or keep the label.

## 3. What this session must produce

**A scope document**, `operations/trust-layer-2026-07/2026-09-0N-D2-virtue-domain-tagging-SCOPE-FOR-RULING.md`,
and **a mentor question** for the founder to relay. Follow P1's shape:

1. **The mechanism, traced from source with line numbers**, so the mentor can check it. Include the
   two definitions side by side and the path from `virtue_domains_engaged` to an `increase`.
2. **Findings that correct the record.** P1's scope doc superseded the register's own "three
   readings" framing and that correction was accepted. Look for the same here — in particular,
   **the register says `computeVirtueDomains` has "no circle test", which is true, but does not say
   that a narrowed predicate already exists a few hundred lines above it in the same file.** That
   changes the remedy question from "invent a rule" to "why do two rules coexist, and which
   governs". State it as a finding, with the register's wording quoted and corrected.
3. **The question of principle, put and NOT answered.** Draft it so the mentor is deciding the
   principle, not approving an implementation. The candidate axes, none pre-elected:
   - Is domain TAGGING the same question as justice-surface EMISSION, or a different one? M-1 ruled
     on emission. Tagging feeds a different event type with the opposite direction of effect.
   - If a self-only action should not tag dikaiosyne, **where should it tag?** M-1's own carried
     note says the correct destination is `phronesis`/`sophrosyne` and that the reducer *"cannot
     route there"* — but Q2's first-circle routing already does exactly that routing, at Layer 2,
     for the un-engaged case. Does Q2 already answer this, or is it a different surface?
   - The `is_kathekon !== null` disjunct tags dikaiosyne even on `is_kathekon === false`. R11 already
     ruled the zero-circle tag is not a justice surface **for the predicate**. Does the same reasoning
     reach the domain tag?
   - **The remedy's location.** `computeVirtueDomains` is in the `/api/reason` scoring engine.
     Changing it moves scoring output, which is why D4's row deliberately EXCLUDED it (*"a
     scoring-engine change that would pull `/api/reason` determinism into a trust-ledger step"*).
     The alternative is to filter at the trust-core boundary instead. Set out both with their costs;
     do not choose.
4. **What is at stake for the flip**, stated plainly: the register's line is that dikaiosyne can rise
   past `deliberate` on evidence from actions with no other party at any circle. Say what that does
   and does not affect, and note that **weights remain BLOCKED and the S11 flip remains REFUSED
   regardless of the answer** — this question does not unblock either.
5. **Honest limits.** What you measured versus what you reasoned. Whether any live agent's ledger is
   actually affected today (check `sagereasoning:s9-loop@v1` if you can do so read-only, and if you
   cannot, say so rather than estimating).

## 4. Do NOT

Change any code. Decide the question. Elect a remedy. Touch `layer2-mechanisms.ts`,
`derive-trust-events.ts`, `trust-transition.ts`, or any flag. Re-open D4 (it is ruled, live and
proven). Treat the REASONED multi-event rise as measured. Quote a perimeter count. Push.

## 5. Records

The scope doc; the relay-ready mentor question; a decision-log entry at the physical tail
(`D-D2-VIRTUE-DOMAIN-TAGGING-SCOPED-FOR-RULING-2026-09-0N`); the register's D2 row annotated with
the finding and a pointer to the scope doc (append, do not rewrite); the opener's S5 row → done and
**S4 next**; a lean close. **No CLAUDE.md production-state block — nothing in production changes.**

## 6. Rollback

`git revert` the records commit. Documents only.

## 7. Forecast

Success = a scope document the mentor can rule from without reading the codebase, which states the
mechanism from source, corrects the register where the register is incomplete, puts the question of
principle without answering it, sets out both remedy locations with their costs, and marks every
claim as observed or reasoned. **The next row after this is S4** — window-start readiness, whose (a)
leg needs `gate1.log` data from ≥2026-09-08 UTC.

End of paste.
