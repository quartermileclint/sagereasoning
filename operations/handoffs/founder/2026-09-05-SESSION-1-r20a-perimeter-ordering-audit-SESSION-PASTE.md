# SESSION PASTE — Session 1 of the 2026-09-05 plan: the R20a perimeter-ordering AUDIT

**Founder: paste this ENTIRE file as the first message of a new session. Nothing else is needed.**

**Stream:** founder. **Tier:** `governance` — documents and reads only. **Risk:** Standard under
0d-ii for this session; **any remediation the audit identifies is `code-critical`** (R20a perimeter,
PR6 + AC5) and belongs to Session 3, not to this one. **The Critical Change Protocol is NOT engaged;
AC7 is NOT engaged.** No route is changed. No migration, flag, credential, live operation, spend, or
public-surface edit. **This session is autonomous — it needs nothing from the founder until the close.**

**Authorised by** the binding mentor ruling on R20a length-guard ordering
(`operations/count-discipline-2026-09/2026-09-06-mentor-ruling-r20a-length-guard-ordering-verbatim.md`,
adopted `D-MENTOR-RULING-R20A-LENGTH-GUARD-ORDERING-ADOPTED-2026-09-06`; both authored 2026-09-05 AEST
despite the label): *"The follow-on is a properly scoped perimeter-wide audit — its own session — to
identify all human-facing members and confirm their execution order. The audit uses execution-order
analysis, not textual position."*

**Written 2026-09-05** (machine date; `date` and `git log`, not the context). HEAD at writing
`099b218`; the plan this executes is the Standing queue of the standing opener, Version 2026-09-05.

---

## PART 1 — Open under the standard protocol

This paste does not reproduce the standing opener; **the standing file wins and you read it in full
first.** In order:

1. **`operations/handoffs/founder/STANDING-SESSION-OPENER-grounded-foundations.md` — Version
   2026-09-05, in full.** Its ⚠️ facts box, Part A (the governance reads it names — the standing
   protocol cache; PR1–PR25 verified by enumeration; `/manifest.md` R0 + the four un-numbered
   sections + AC5 + AC7; `/CLAUDE.md`'s 2026-09-05 grounding note and item-E block; the decision
   log's physical tail), Part D (working inside the harness), and Part E (the confirmations). If the
   opener has been updated past 2026-09-05 since this paste was written, the newer version governs.
2. **`git status` (whole — never `| head`), `git fetch origin`, `git log --oneline origin/main..HEAD`,
   and `ListAgents`.** Expected at writing: a clean tree; HEAD at or after `099b218`; peers likely
   active (three interactive at the opener's writing). Never stage another session's files; commit
   path-scoped; never `git add -A`. **A peer's push publishes your commits — the commit is the point
   of no return.**
3. **Confirm at open, in one short paragraph:** tier `governance`; model (state it; disclose any
   switch); Standard risk, AC7/PR6 not engaged; PR19 noted as applying **to Session 3**, not here
   (the audit is a document — but see PART 3 on reviewing it); PR20 (every present-tense mechanism
   fact you write is timestamp-checked against source); PR22 trailers on the commit; PR23
   (memory-first: `human-routes-bearer-jwt-console-smoke`, `content-pins-assert-exported-values`,
   `guard-scope-must-cover-the-class`, `primary-data-beats-secondary-characterisation`); the
   concurrency convention; P0 0h hold active; status vocabulary; the date discipline.
4. **Narrate where we are in the arc** (the opener's queue, one paragraph): S1 is this session; S2
   waits on the founder's signature; S3 waits on this audit; S4 is not due before 2026-09-08 UTC.

---

## PART 2 — The task: the perimeter-wide execution-order audit

**Read next, in full, and let it govern the method:**
`operations/handoffs/founder/2026-09-07-r20a-perimeter-ordering-AUDIT-NEXT-SESSION-PROMPT.md`
(authored 2026-09-05; its §7 was corrected after the `format` move and the PR19 fold). Everything
below restates its load-bearing constraints so that this paste is self-sufficient; where the two
differ, **the ruling verbatim wins over both**.

### 2.1 Scope — re-derive, never quote

Membership is `HUMAN_FACING_POST_ROUTES` and `SUBSTRATE_GATE_ROUTES` in
`website/src/lib/__tests__/r20a-invocation-guard.test.ts`. At the opener's writing they derived to
43 route-level + 2 substrate-gate members, with 31 flag-pair entries across 30 flag-gated routes;
**treat every one of those numbers as stale and re-derive them at open.** The two substrate-gate
members use `enforceLayer2R20aGate`, a different pattern — say whether the ruling reaches them; do not
assume either way.

### 2.2 The two-axis classification the ruling mandates

| Axis | Values | How to decide |
|---|---|---|
| Audience | human-facing / agent-facing | **who the realistic caller is** — read the auth mode (cookie/JWT session vs credential/Bearer), not the directory |
| Rendering on distress | human crisis form / developer form | the `audience:` argument at the **actual** `renderR20aRedirectResponse(...)` call site — not a docstring, not a comment |

The mentor's explicit precision: classification is *"not always obvious from the route's name or
location … not on the basis of which directory the route lives in."* `/api/mentor/*` is not
automatically human-facing; `/api/skill/*` is not automatically agent-facing. Handler-split routes
(`route.ts` + `handler.ts`) are one member — follow the call.

### 2.3 Execution order — the part that must not be repeated wrongly

**A textual-position sweep was attempted on 2026-09-05 and produced an unsound 20/10/13 split.** It
counted an `enforceDistressCheck` mention inside a `/** */` block comment as the call site, and it
missed routes bounding input via a local constant (e.g. `FIELD_MAX` in `api/mentor/stoa/route.ts`)
rather than `TEXT_LIMITS`. It was **discarded, not published** — the mentor commended that. Do not
resurrect it.

**For each human-facing member, trace the control flow** and record whether any rejection path can
return **before** the `enforceDistressCheck(detectDistressTwoStage(...))` call is reached — following
early returns, helper indirection, conditional branches, shared validators, and imported modules.
**Establish the real set of bounding forms from source before scanning for it**; the known forms are
inline `.length > TEXT_LIMITS.*`, the `validateTextLength(...)` helper, local constants, schema/zod
validation, and any early `return` on a malformed body — **do not inherit that list; confirm it.**
Where a route's answer cannot be established by reading, **say so** rather than guessing.

**Provenance before characterisation:** use `git log -L` (or `-S`) on each pre-block guard before
describing it. The precedent: `/api/score-conversation`'s guards landed 2026-03-26 (`aeadbd1`) in a
general security pass, the R20a wiring was placed after them on 2026-07-07 (`3de9572`), and the
`format` guard followed that posture on 2026-09-05. *"Inherited properties are not examined
properties."* Report findings as accretion, not as anyone's error.

### 2.4 Already known — do not re-derive as discoveries

`/api/score-conversation` is **human-facing** (`requireAuth` cookie/JWT; `audience: 'human_user'` at
the real call site). Its `format` guard is **no longer open** — moved after the R20a block on
2026-09-05 (`0126645`, pinned FV-6a–d by a brace-matched block-end anchor, `97db750`); verify the
ordering still holds as part of your sweep (a fresh check costs nothing). Its **three remaining
pre-block guards** are non-conformant under the ruling: `conversation` max, `context` max (both
~lines 111/117), and the **`conversation` MINIMUM `<20` chars** (~line 129) — the ruling's sharpest
case, since *"I want to die."* is 14 characters. Prioritise it in the remediation ordering you
recommend. Re-derive line numbers; the file has moved twice.

### 2.5 Deliverable

**One committed document**, at
`operations/count-discipline-2026-09/2026-09-05-r20a-perimeter-ordering-AUDIT.md` (date it from
`date`), containing:

1. **Method**, stated so it can be checked: how membership was derived; how audience was decided; how
   the rendered form was located; how execution order was traced; the bounding-form set and how it
   was established; what the method cannot see (its limits, disclosed — the ruling commended
   *"check the thing, name what you find, do not publish an unsound result"*).
2. **A per-member table**: route; audience (with the deciding fact — auth mode); rendered form (with
   the call-site file:line); conformant / non-conformant / undeterminable; for non-conformant
   members, each pre-block guard with its form and its `git` provenance (first commit + date).
3. **The substrate-gate disposition** (does the ruling reach `/api/calling` and
   `/api/practice/reflect`?).
4. **A recommended remediation order for Session 3**, keyed to harm (short-genuine-input minimums
   first; then max-length guards on the most distress-likely surfaces; agent-facing members listed
   as *not to be changed*), with each item's tier stated (`code-critical`, PR19).
5. **Counts derived, not quoted**, stated once with the derivation command, and **a non-vacuity
   check on your own sweep** — at minimum, prove the sweep sees `score-conversation`'s three known
   guards and its moved `format` guard in the right order (if it cannot see the known case, it cannot
   be trusted on the unknown ones).

### 2.6 Do NOT

Change any route. Apply a migration or flip a flag. Mint or size a credential. Touch
`.claude/settings.local.json`. Quote a perimeter count from any document. Resurrect the 20/10/13
split. Publish a classification whose method you could not make sound — disclose the limit instead.
"Fix" an agent-facing member (purpose (a) governs there; a guard before the check is unobjectionable).
Fold in the standing-runner, S11, or Option S tracks even if their files appear in `git status`.
Touch `operations/agent-circles-2026-08/d6a/` or any file matching the byte-identity `GUARD_RE`.

---

## PART 3 — Review, records, and close

- **Review the audit before recording it.** PR19 does not literally bind a governance document, but
  the nine-candidate and R9/R10 precedent applies by analogy and it has paid every time: launch
  **three parallel, blind, read-only reviewers** (claims-vs-source on a sample of members;
  method soundness — can the sweep miss a bounding form?; the known-case non-vacuity), each briefed
  to break rather than confirm; fold confirmed findings at the root; withdraw over-claims at the
  head, not buried. If the account limit kills the fleet, complete first-hand across the dead
  dimensions and **disclose it as single-perspective** (PR19 §4) — the independent re-run then
  gates Session 3, not this session's close.
- **Decision-log entry** (lean form, appended at the **physical tail**): `## 2026-09-05 —
  D-R20A-PERIMETER-ORDERING-AUDIT-COMPLETE-…` with the counts derived, the non-conformant set, the
  substrate-gate disposition, the review record, and "changes no route" stated plainly.
- **Close** (lean form): `operations/handoffs/founder/2026-09-05-r20a-perimeter-ordering-audit-CLOSE.md`
  — decisions, status changes, the remediation list handed to Session 3, the honest limits, the PR21
  reflect-harvest notes, and a founder-verification block.
- **Session 3's prompt**: author `2026-09-05-r20a-perimeter-ordering-REMEDIATION-NEXT-SESSION-PROMPT.md`
  (`code-critical`, founder-walked, PR19 required; the walk carries F-6's two Bearer-JWT smokes; each
  move pinned by a block-end anchor of the FV-6 shape and mutation-verified against a guard placed
  *inside* the block).
- **Commit path-scoped** (the audit document, the decision-log hunk, the close, the new prompt), with
  `Model:` / `Effort:` trailers; **do not push** — the founder pushes.
- **Update the standing opener's queue line for S1** to "RUN — see the close" in the same commit
  (one line; do not rewrite the opener).

## PART 4 — Founder verification (between sessions)

```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
git log --oneline -4
ls operations/count-discipline-2026-09/ | grep -i "perimeter-ordering-AUDIT"
grep -c "non-conformant" operations/count-discipline-2026-09/2026-09-05-r20a-perimeter-ordering-AUDIT.md
git diff --stat HEAD~1 -- website/
```
Expected: the audit commit at the top; the audit file listed; a non-zero count; **no output** from
the last line (no code, schema or config was touched).

## PART 5 — Anticipated shape

| Phase | Estimate |
|---|---|
| Opener + governance reads + confirmations | 20–25 min |
| Membership derivation + bounding-form set from source | 20 min |
| Per-member classification + control-flow tracing (43+2 members) | 90–120 min |
| Provenance (`git log -L`) on the non-conformant guards | 20–30 min |
| Blind review fleet + fold | 30–40 min |
| Decision-log + close + Session 3 prompt + commit | 30 min |

**Rollback:** `git revert` the audit commit — documents only; nothing live is touched.

**Forecast:** success = a per-member classification whose method is stated and checkable, a
non-conformant set with provenance, a remediation order keyed to harm, and a Session 3 prompt the
founder can walk. **The session ends without changing a route, and that is the correct outcome.**

End of paste.
