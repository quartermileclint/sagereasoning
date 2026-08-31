# Ruling request — two routes outside the R20a exhaustiveness classification

**Date:** 2026-08-31. **Author:** Claude Code session (founder-relayed).
**Class:** `code-critical` if either route joins the perimeter (AC5 + PR6).
**Status:** awaiting ruling. Nothing has been built, registered, or excluded.

**PR20 compliance.** Every present-tense mechanism fact below was verified **first-hand against
source on 2026-08-31**, not carried from a summary. Where a fact is inferred rather than observed it
says so.

---

## 1. What happened, and why this is being asked now

The R20a exhaustiveness backstop — the filesystem sweep the mentor ruled a **prerequisite for any
perimeter coverage claim** — currently fails:

    689 passed, 2 failed
    FAIL: src/app/api/practice/completion-signal/route.ts is either a registered
          perimeter member or an explicitly reasoned exclusion
    FAIL: src/app/api/score/save/route.ts is either a registered perimeter member
          or an explicitly reasoned exclusion

Two routes are **neither registered members nor recorded exclusions**. The sweep is doing exactly
what it was built to do.

**It has been red since 2026-08-23** — the routes were added in `27b06bd` (ATRF/EE wave) and
`2277ec2` (Class-B route change). Verified pre-existing by reproducing the identical failure on a
pristine `git archive HEAD` checkout. **Eight days of perimeter coverage claims have rested on a
failing gate**, including the standing session opener's present-tense statement that the sweep is
GREEN.

The registry today is **42 route-level + 2 substrate-gate = 44** (re-derived by parsing the arrays,
not quoted from any document).

---

## 2. Route A — `/api/score/save`. The substantive question.

**Verified mechanism facts (2026-08-31):**

1. It accepts and **persists seven free-text fields**: `action`, `context`, `relationships`,
   **`emotional_state`**, `philosophical_reflection`, `improvement_path`, `oikeiosis_context`.
2. It runs **no distress check of any kind**.
3. Its caller `/api/score` **is** a registered perimeter member (line 79 of the registry) and
   screens **exactly one field** — `enforceDistressCheck(detectDistressTwoStage(action))`. The other
   six are screened by nothing, in either route.
4. **Nothing enforces call ordering.** No nonce, token, or evaluation id links the two. An
   authenticated practitioner can POST directly to `/api/score/save` and reach the database without
   `/api/score` ever executing.
5. It is auth-gated (`requireAuth`, Bearer-JWT) and rate-limited. Live check: unauthenticated POST
   returns **401**. There is no unauthenticated exposure.
6. The route replaced a browser-side insert that had **zero** screening on any field, so net
   exposure is unchanged or improved.
7. Its own header already discloses all of this, in the author's words: *"DISCLOSED, NOT INTRODUCED
   BY THIS ROUTE… named as its own follow-up, not silently absorbed into this refactor."*

**The precedent that appears to govern, stated so the mentor can reject it if it does not.**
`/api/mentor-appendix` is the same structural shape — a persister reachable independently of the
route whose check gates it. PR19 rated that bypass PLAUSIBLE-BUT-UNVERIFIED. It was **brought inside
the perimeter**: it is a registered member, flag-gated under `isR20aGapClosureEnabled`, and calls
`enforceDistressCheck(detectDistressTwoStage(subject))`.

**And the ruling of 2026-08-17, on the practice family:**

> *"The fact that they sat outside by recorded family precedent reflects the original scoping of B3
> to `/impulse` alone, not a considered judgement that the practice family is lower-risk. It is not
> lower-risk. It is the family where the material is most likely to surface acute distress."*

`emotional_state` is a field whose entire purpose is to capture what the practitioner was feeling.

**QUESTION A. Does `/api/score/save` join the R20a perimeter, or is it a reasoned exclusion?**

If it joins, a second question follows, because the two are not the same fix:

**QUESTION A2. What is the screened subject?** `/api/score` screens `action` alone. Composing all
seven fields at `/api/score/save` would make the persister screen *more* than the member route that
gates it — closing the bypass but leaving `/api/score` itself the weaker check. The alternative is
to fix `/api/score`'s field coverage instead, or as well. **`/api/score` is engine-adjacent and
measurement-neutrality-protected**, which is why the original author scoped it out; that constraint
is real and this session has not tried to work around it.

---

## 3. Route B — `/api/practice/completion-signal`. Probably the easy one.

**Verified mechanism facts (2026-08-31):** agent-facing, written for the ATRF/EE completion-signal
receipt; dark behind `SUBSTRATE_COMPLETION_SIGNAL_ENABLED` (unset ⇒ honest 503, confirmed live);
requires a `completion_signal_write` credential; carries no human free-text field.

The standing precedent is `/api/stoa/declare` (ST4) — an agent surface recorded as correctly
**outside** the perimeter, on the reasoning that agent-facing routes never carry human free text.

**QUESTION B. Is a recorded exclusion on that precedent the right disposition, or does an
agent-facing surface that will accept caller-supplied text need membership regardless?**

---

## 4. What this session deliberately did NOT do

- **Did not add either route to the exclusion list to make the battery green.** Adding an exclusion
  asserts "correctly outside the perimeter" — a safety judgement, not bookkeeping. Going green by
  asserting the thing under question is the failure mode the sweep exists to prevent.
- **Did not wire a check into either route.**
- **Did not touch `/api/score`.**

The red battery is being left red and visible until this is ruled.

## 5. Consequence of each answer

| Answer | Work it creates |
|---|---|
| A joins | `code-critical` + AC5: wire per the `r20a-gap-closure.ts` pattern (check before field validation and before any DB call), register, bump count floors in the same edit, decide shared-flag vs own flag, PR19 review |
| A excluded | Registry exclusion with the reason recorded; the seven-field gap stays open and should be named as a standing disclosed limitation rather than closed |
| A2 | Determines whether `/api/score` also changes — which reaches a measurement-neutrality-protected surface |
| B excluded | Registry exclusion on the ST4 precedent; small |
| B joins | Same shape as A, on a dark route |

**Either way the battery returns to green only after the ruling, not before it.**
