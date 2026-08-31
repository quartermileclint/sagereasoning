# Next-session prompt — rebuild the `/api/score/save` perimeter member (ruled, specified, not started)

**Founder: paste this file as the first message of a new session.**

Open under the standing opener first —
`operations/handoffs/founder/STANDING-SESSION-OPENER-grounded-foundations.md` (Version 2026-08-29).
**That opener predates this window. Where it conflicts with §0 below, this file wins.** Everything
else in it stands.

---

## §0 — Re-derive at open. Do not trust either document.

```
git log origin/main..HEAD --oneline      # expect EMPTY
git status --short
cd website && npx tsx src/lib/__tests__/r20a-invocation-guard.test.ts        # expect 689/2 RED
cd website && npx tsx src/lib/__tests__/r20a-gap-closure-route-wiring.test.ts # expect 885/0 GREEN
```

**The invocation guard is RED at 689/2 and that is CORRECT.** The mentor confirmed the sequencing:
*"the backstop remains red until the rebuild is complete, registered, and the count floors are
bumped."* **Do not make it green by any means other than completing the rebuild.** Making it green by
adding an exclusion is the ruling's own named failure mode.

### What happened 2026-08-31, in one paragraph

`/api/score/save` was ruled into the R20a perimeter, built, PR19-reviewed by six independent agents,
and **reverted**. PR19 returned **5 CRITICAL · 12 HIGH · 9 MEDIUM**. The dispositive defect was not a
test gap: the distress redirect returned **HTTP 200**, the calling page reads 200 as success, so a
practitioner writing acute distress into `emotional_state` got a **silently unsaved record, the word
"saved", and no crisis resources** — worse than the unscreened state it replaced. The mentor was then
sent a correction (a false mechanism fact had been relayed under PR20) and **re-ruled**, expanding the
scope. The rebuild is fully specified and **not started**.

### Binding documents — verbatim wins over every summary including this file

| Document | What it binds |
|---|---|
| `operations/agent-circles-2026-08/2026-08-31-mentor-ruling-corrected-questionB-and-A2b-verbatim.md` | **THE OPERATIVE RULING.** Read this first and in full. |
| `…/2026-08-31-mentor-consultation-r20a-two-unclassified-routes-verbatim.md` | The original ruling. Question A stands; **its Question B reasoning is superseded** by the above. |
| `…/2026-08-31-PR19-review-register-score-save-perimeter.md` | Every defect that must not recur. **Read before writing code, not after.** |
| `…/2026-08-31-CORRECTION-to-r20a-ruling-question-B-false-fact.md` | What was got wrong and how. |

Decision log, physical tail: `D-R20A-CORRECTED-RULING-ADOPTED-SCREENED-SET-ENUMERATED-FROM-SCHEMA`,
`D-R20A-SCORE-SAVE-PERIMETER-IMPLEMENTATION-REVERTED-PR19`.

---

## §1 — THE REBUILD. `code-critical` throughout (AC5 + PR6). AC7 engages at the push.

### 1a. The screened set is TEN fields, enumerated from schema

The ruling: *"all caller-supplied fields capable of carrying prose … The rebuild must enumerate these
from the route's actual schema, not from a criterion that the code does not enforce."*

Enumerated 2026-08-31 against the route's destructure + `supabase-v3-migration.sql`. **Re-derive it
yourself; do not copy this table on faith.**

| Screen (10) | Column | Why |
|---|---|---|
| `action`, `context`, `relationships`, `emotional_state` | TEXT | mentor-named |
| `philosophical_reflection`, `improvement_path`, `oikeiosis_context` | TEXT | mentor-named |
| `false_judgements` | **JSONB** | mentor-named; *"the field most likely to carry the material the perimeter exists to screen"* |
| **`passions_detected`** | **JSONB** | *not named by the ruling* — caught by enumeration: zero validation, no CHECK |
| **`ruling_faculty_state`** | **TEXT** | *not named by the ruling* — same |

| Exclude (3) | Ground |
|---|---|
| `katorthoma_proximity`, `kathekon_quality` | DB CHECK enum-constrained — prose cannot persist; it fails the insert |
| `is_kathekon` | BOOLEAN |

**The enumeration caught two fields the ruling did not name.** That is the instruction working. If
your re-derivation disagrees with this table, **trust your re-derivation and say so.**

### 1b. JSONB needs a collector, not a field list

Two of the ten are JSONB. `composeDistressSubject` accepts strings only and **silently skips
non-strings** — PR19 demonstrated `emotional_state: {note: "I want to kill myself"}` screening clean
and reaching the insert. Write a collector in the established `collect*Text` idiom (see
`collectAppendixAnswerText` in `r20a-gap-closure.ts`).

### 1c. The response MUST NOT be 200

Ruled: *"The HTTP response on a distress detection must be a status code the calling page treats as an
error, not a 200."* This is the direct fix for the defect that forced the revert.

### 1d. The calling page is IN SCOPE, and in PR19 scope

Ruled: *"The calling page's handling of that response is in scope for the PR19 review — the prior
implementation's failure was at the response-handling layer, and the review must verify that layer
explicitly, not only the detection layer."*

`src/app/score/page.tsx` — `saveRes.ok` at ~line 220 gates `setSaved(true)`; `distressRedirect`
(~line 97, rendered ~483) is currently wired **only** to the `/api/score` response. The save response
must reach it.

### 1e. Write the functional test FIRST

**Before the route change.** A test importing `POST` with a stubbed classifier, asserting **no insert
occurs on acute**. PR19 proved ten mutations — including five CRITICAL — leave every existing battery
green, because every route-side assertion in the invocation guard is a **presence-of-text grep**. That
single functional test kills seven of the ten. Writing it first means the thing that would have caught
the last failure exists before the failure can recur.

### 1f. The rest of the register's mandatory list

- The **`ROUTE_WIRING` config row** in `r20a-gap-closure-route-wiring.test.ts` — three reviewers found
  it independently; it delivers flag gating, subject pinning, the `hasScreenableSubject` gate, exactly
  one classifier call inside the gate, and the mild variant, **for one row**.
- `validateTextLength` on every screened field — establish **screened window ≥ persisted window**.
  Currently unbounded columns with a 5,000-char screen: a 6,339-char `action` screens `none` while the
  full text persists `acute`. **Do not raise the field cap instead** — and note the old comment's
  justification for the cap was *disproved by execution*; there is no downstream truncation to protect
  against.
- **Flag-gated floor → 31** (it is stale at `>= 30`; the newest entry is currently deletable green).
- Route-level floor → 43. **Ordinal is the 43rd, not "fifteenth"** — derive from the array.
- Pin the **assertion total** (it silently fell 715→708 under one mutation).
- The **rollback paragraph must name `git revert`, not the shared flag.** The shared flag covers
  **26** routes; unsetting it to mitigate an incident here also strips screening from
  `passion-log`, `passion-classify` and `view-from-above` — the most distress-likely tools.
  **The documented lever was safety-inverting.**
- Record the **corrected revisit trigger** on the completion-signal exclusion (the old entry was in the
  reverted commit): revisit if the auth model admits browser-session callers, or if the fields are
  amended to accept practitioner-typed input.
- `null` body guard (`!body || typeof body !== 'object'`) — the sibling has it, this route does not.

### 1g. The flag decision, to be made again

Last time: the shared `SUBSTRATE_R20A_GAP_CLOSURE_ENABLED` (already `true` ⇒ live on deploy). PR19
found this **defensible on readiness** (no unready dependency) but that it **bypasses the dark-deploy
discipline** every prior perimeter member followed, so the live distress smoke cannot precede
activation. **Name the choice and document the default either way** — the ruling requires it.

---

## §2 — Process corrections earned 2026-08-31. Read before acting.

- **NEVER put executable DDL or destructive commands in a runnable code block during a live SQL-editor
  walk.** A `CREATE POLICY` quoted as *evidence* was pasted into production. It failed harmlessly
  (`42710`) **only because the paired `DROP POLICY` on the preceding line was not quoted.** Quote such
  statements indented, as prose.
- **A live `.git/MERGE_MSG` means a commit is sitting in an editor. It is a stop sign on its own.**
  `REVERT_HEAD` appears only when a revert *conflicts*; a clean revert waiting at the editor shows
  `MERGE_MSG` and nothing else. A session checked for the rarer marker, read "no revert in progress",
  and committed on top of the founder's open editor.
- **`git revert` of a build commit also reverts its RECORDS.** A plain revert staged the mentor
  verbatim, the ruling request and 80 decision-log lines for deletion. **Check the commit's file list
  before promising records survive.** Records are governance history, not artifacts of the
  implementation that failed.
- **Isolate reviewer SCRATCH, not just checkouts.** One copy per agent was provisioned correctly, then
  two agents collided in a shared `/tmp/bak`. Give each agent its own scratch path explicitly.
- **Grep `handler.ts` as well as `route.ts`.** A PR20 mechanism fact relayed to the mentor was false
  because only `route.ts` was inspected — **the split-file blindness class this codebase had already
  found and fixed inside the R20a sweep itself.**
- **Derive mutations from the written invariant, not from the branches in front of you** — and note
  this failed *again* on 2026-08-31 even while being consciously applied: the composition invariant was
  pinned, the *ordering* invariant was not.

---

## §3 — Elsewhere, unchanged and not to be disturbed

- **The provenance-ledger C3 soak is the only remaining switch-on gate and it is a clock** — ~5 of 90
  days from 2026-08-26. **Slice 5 is late November. Do not open it.** Do not perturb
  `emission-hooks.ts`, `provenance-*.ts`, `/api/reason`'s write block, or the sweep handler.
- **ATRF/EE: steps 1–4 are APPLIED on production** (determined 2026-08-31, read-only). Steps 5–6 landed
  earlier through ordinary pushes. **That walk is a record reconciliation, not an execution — its file
  carries a STOP banner.** **TEST's state is still UNDETERMINED**; Step 0 there is unrun and safe.
- **Next.js is at 16.3.3** (critical advisory closed 2026-08-31). `npm audit --omit=dev` still reports
  **9 vulnerabilities, 4 high**, incl. `ws` — named, unaddressed.
- Weights **BLOCKED**. **Q1: the loop proposes, it never executes.** The §A boundary holds. **The 0h
  call remains the founder's.**

## §4 — The election

1. **The rebuild** (§1) — recommended; a ruling is adopted and unexecuted, and the perimeter gap it
   closes is real and currently open.
2. **Fold 08-17 → 08-31 into `CLAUDE.md`** — now further out of date, and today added materially to it.
3. TEST's ATRF/EE Step 0 · the R4 activation batch · the standing-runner design session (R8) · O-C
   Gate-3 · the RLS backlog incl. the escalated `vulnerability_flag_owner_view` · M-5(b) + the
   discernment 503-rate diagnosis.

**Held / do not open:** slice 5; IW-7 opening 2; Spec 4 dispersion; the hegemonikon uniformity family;
Prudence Stage-3; Layer 3 activation; Resend/ST7; the S11 flip; the 0h call; weights.

**End of prompt.**
