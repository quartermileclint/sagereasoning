# PR19 independent review — `/api/score/save` perimeter change — FINDINGS REGISTER

**Date:** 2026-08-31. **Subject:** commit `137bf7a` (pushed, LIVE).
**Method:** six independent adversarial reviewers, **one isolated `git archive HEAD` checkout each**,
each instructed explicitly not to trust the author (who wrote the code, its tests, its decision-log
entry and its commit message). ~1.88M subagent tokens; 0 agent errors.

## VERDICT: NOT CLEAN. The change should not stand as written.

**5 CRITICAL · 12 HIGH · 9 MEDIUM.** Ten mutations leave every battery green, six of which let acute
distress reach the database. Two written justifications are disproved by execution. One PR20
mechanism fact relayed to the mentor is false, and the mentor ruled on it.

**The author's self-review found none of this.** It ran the batteries, mutation-tested in two
directions, and reported green. This is the third consecutive session in which independent review
caught what first-hand review missed, and the second in which the specific miss was *a pin set that
proved something adjacent to the written invariant.*

---

## Three independent convergences (the strongest signal in the set)

1. **The route-wiring battery is RED and was never run** — found separately by dimensions 1, 2 and 4.
   `r20a-gap-closure-route-wiring.test.ts` → **885 passed, 1 failed**: `score/save` imports
   `r20a-gap-closure` but has **no `ROUTE_WIRING` config row**. Causality proven by substituting the
   HEAD~1 route file (885/0) and restoring (885/1). That one row is the pin for nearly everything
   else in this register: it asserts the flag-gated block, the pinned subject expression, the
   `hasScreenableSubject` gate, exactly one classifier call inside the gate and none outside, and the
   mild variant.
2. **The pin proves the spelling, not the ruling** — dimensions 3, 5, and a note from 6.
3. **No behavioural coverage** — the route's own test is 33/0 with literally zero R20a assertions, so
   the invocation guard is the sole protection for the ruling.

---

## CRITICAL — mutations that leave the battery at 715/0 (dimension 3)

| # | Mutation | Effect |
|---|---|---|
| C1 | `].filter(() => false))` | Empty subject ⇒ the classifier **never executes**, for any input |
| C2 | Move the block after `.insert(` | Distress content **written, then screened** |
| C3 | Delete the `return` in the non-mild branch | Acute response built, discarded, falls through to insert |
| C4 | `severity !== 'mild'` → `=== 'mild'` | **Acute and moderate persist**; mild blocks |
| C5 | `if (false && isR20aGapClosureEnabled())` | Whole block dead — *the SS3 gap the battery's own header says it prevents* |

---

## HIGH

| # | Finding | Dim |
|---|---|---|
| H1 | **The redirect never reaches the practitioner.** `score/page.tsx:220` treats the 200 as `ok` ⇒ `setSaved(true)` on a record that was NOT written; `distressRedirect` is bound only to the `/api/score` response, so `redirect_message` is never rendered. **Net: data loss + false success + no crisis resources — for the exact population the perimeter protects.** | 1 |
| H2 | **PR20 FALSE FACT.** The brief told the mentor `/api/practice/completion-signal` "carries no human free-text field." Its `handler.ts` **requires** `examination.impression_assented_to` (non-empty, 5000 chars) + optional `refusal_reason` (2000). The author grepped `route.ts` only — **the split-file blindness class this codebase already found and fixed inside the R20a sweep.** The mentor ruled on the false fact, and the recorded revisit trigger ("if the design changes to carry caller-supplied human text") **can never fire.** | 6 |
| H3 | **Screened window < persisted window.** No length validation; columns unbounded `TEXT`. Proven: a 6,339-char `action` composes to 5,000 — stage-1 fires `acute` on the full text, `none` on the screened text. Unscreened distress persists. | 2 |
| H4 | **The flag-gated floor was never bumped** — 31 entries against a `>= 30` floor. Deleting the new entry leaves **712/0 green**. Aggravated by the author's own new comment asserting the floor *was* bumped in the same edit: true of the route-level floor, **false of the flag-gated floor they also touched**. | 5 |
| H5 | **The ruled ordering is unpinned** — moving the check after the insert leaves 715/0. | 1,3 |
| H6 | **Three pin false-passes**: `.slice(0,1)` after the literal; `.filter(()=>false)`; and a **dead decoy call placed first**, which defeats the non-global `.match()`. | 3,5 |
| H7 | **Flag-off identity is TRUE but pinned by nothing** — hoisting an unconditional classifier call above the flag guard (destroying identity, billing Haiku on every request) passes all three batteries. | 4 |
| H8 | **Reclassify-to-exclusion + drop the floor to 42 ⇒ 708/0 green** — *the ruling's own named failure mode*, stopped only by a hand-maintained integer with a recorded history of drifting. The assertion total silently fell 715→708 and nothing pins it. | 3 |

---

## MEDIUM

- **M1 — the cap justification names a mechanism that is not operative.** The comment says the 5,000
  cap "stops one oversized field pushing later fields out of the classifier window." Traced:
  `evaluateBorderlineDistress` performs **no truncation** before the Haiku call, and
  `DISTRESS_SUBJECT_MAX_FIELDS` (20) is non-binding at 7. Worst case 35,042 chars, sent whole. What
  the cap does here is the **unsafe** direction its own docstring names. *(Dim 6 marked this claim ✓
  on a different mechanism — fields aren't dropped from composition. Both verified something true;
  dim 2's point stands: the reason given is not the reason that holds.)* — dim 2
- **M2 — the rollback lever the doc names is SAFETY-INVERTING.** The shared flag covers **26** routes.
  Unsetting it to mitigate an incident on this route also strips screening from `/api/mentor/passion-log`,
  `/api/mentor/passion-classify` and `/api/mentor/view-from-above` — the grief and passion tools that
  are the *most* distress-likely. The granular lever (`git revert`, 2 code files) exists and the
  doc-comment never names it. — dim 4
- **M3 — the "engine outputs echoed back" criterion does not partition.** Three of the seven SCREENED
  fields (`philosophical_reflection`, `improvement_path`, `oikeiosis_context`) are *also*
  `evalResult.*`, by exactly the test used to exclude the other six. As written the comment licenses
  a maintainer dropping three fields the ruling requires. It is also unenforceable under the header's
  own bypass premise. — dim 2,6
- **M4 — distress in the three unscreened fields reaches the DB.** `ruling_faculty_state` (unbounded
  TEXT), `false_judgements` / `passions_detected` (JSONB), zero validation. In Stoic practice
  `false_judgements` is where a practitioner records catastrophic self-statements. — dim 2
- **M5 — non-string values skip screening but persist.** `emotional_state: {note: "I want to kill
  myself"}` composes away, screens clean, reaches the insert. — dim 2
- **M6 — no dark-deploy window.** Deploy == activation. Every prior perimeter member took a dedicated
  flag, deployed dark, was smoke-verified, then flipped in a founder-walked AC7 step. Here the live
  distress smoke cannot precede activation. — dim 4

---

## LOW / NIT

- Ordinal wrong: "FIFTEENTH route-level member" — it is the **43rd**; taken from CLAUDE.md's stale
  narrative instead of the array (dim 5).
- "eight days" red — it was **nine** (from 2026-08-22, `2277ec2`); verified by reconstructing the tree
  and running the sweep at that commit (dim 6).
- PR25: "already `true` in production" is a live-environment claim in a code comment with no citation —
  same shape as the stale "sweep is GREEN" claim this session caught (dim 6).
- `null` body ⇒ uncaught TypeError ⇒ 500; the reviewed sibling guards, this route does not (dim 2).
- `userId` in scope but not passed to the classifier ⇒ unattributed `vulnerability_flag` (perimeter-wide,
  34 sites; not introduced here) (dim 2).
- `r20a-gap-closure.ts` header still claims the flag "governs EXACTLY these six routes" — now 26 (dims 1,4).
- "byte-identical" is behaviourally true, not literally: import chain 66–78ms → 147–218ms, plus a new
  always-on `[stripe.ts]` stderr line at module load via the classifier chain (dim 4).

---

## WHAT HELD — reproduced by reviewers, not accepted

689/2 before · 715/0 after · 707/0 pre-pin · the 7-failure and 1-failure mutations exactly · 42→43 ·
"before validation and before any DB call" (in code) · `/api/score` genuinely untouched · 33/0 with
zero R20a coverage · no nonce/token/evaluation-id enforces ordering · direct POST bypass real ·
redirect genuinely prevents the insert · redirect shape matches the reviewed sibling exactly ·
empty-subject is **not** a bypass (6 body shapes) · **flag-off identity TRUE across 13 scenarios**
with a harness proven non-vacuous by 3 caught mutations · no assertion weakened (label multiset
691→715, one retired and replaced) · exhaustiveness walk sees all **127** route files, exact ·
tsc 0 · Next 16.3.3 · S10 198/0.

**The flag election has one genuine strength** (dim 4, Q4c): no unready dependency. The `'practice'`
mild variant is founder-signed, 7-field composition is not novel, no new table/env/migration. "Flag
true" is an already-proven-ready state for this code path. The election is defensible on readiness
and wrong on the documented rollback lever (M2).

---

## THE TWO ACTIONS ONLY THE FOUNDER CAN TAKE

1. **Disposition of the live change.** Recommended: `git revert 137bf7a && git push origin main`.
   Restores a known state and removes active harm (H1). The guard returns to red 689/2 — which is the
   posture the mentor explicitly endorsed. The ruling, verbatim and this register stay committed.
2. **A correction to the mentor on Question B** (H2). They ruled on a false fact. **Note for that
   correction:** dim 6 also asserts `/api/stoa/declare` "accepts no prose field at all" — that is
   **wrong**; ST4 carries `what_i_bring`/`what_i_seek`/`contact_channel`/`tags`, its header calling
   them "AGENT-authored text." So the precedent is *agent-authored text is outside*, not *no text
   exists* — under which the exclusion may well survive a corrected brief. **That is the mentor's
   call, not this project's.**

## WHAT A CORRECT REBUILD REQUIRES

- The `ROUTE_WIRING` config row (kills C1–C5, H5, H6, H7 largely in one row).
- A **functional test** importing `POST` with a stubbed classifier, asserting no insert on acute —
  the structural fix for the whole textual-pin class.
- Caller handling in `score/page.tsx` for the save-response redirect (H1).
- `validateTextLength` on all seven screened fields, establishing **screened window ≥ persisted
  window** (H3).
- Flag-gated floor → 31 (H4); assertion-total pin (H8); ordinal corrected to 43.
- Rewrite the rollback paragraph to name `git revert`, not the shared flag (M2).
- Resolve M3/M4 — either screen the three unscreened fields or state a criterion that actually
  partitions; the ruling's seven-field scope was drawn on a premise the code does not enforce.

**Standing lesson for the register:** a presence-of-text grep over comment-stripped source proves
identifiers appear. It proves nothing about ordering, dataflow, or whether a verdict binds. Every
route-side assertion in the invocation guard is of that kind — including the one added here.
