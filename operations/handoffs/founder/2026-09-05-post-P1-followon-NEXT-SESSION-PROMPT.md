# Next session — after the P1 follow-on (choose one; nothing here pre-decides the choice)

**Read first, in this order:** `/adopted/standing-protocol-cache.md` →
`operations/handoffs/founder/2026-09-04-P1-followon-CLOSE.md` **including its §8** (PR21 — the reflect
turn's findings are recorded there and are meant to be read at the next session's open, not skimmed) →
`CLAUDE.md`'s "Production state" header (confirms nothing changed underneath) → then this file in full
before doing anything.

## What the prior session did (commits `d74aea0`, `87cc90b`, `ab388e9`, `df97b59`)

All three options the P1 follow-on left open are **closed out**. None of them moved the flip.

- **Option A — the frozen-130 re-run** under the P1-ruled filtered reading. Result, stated against the
  interest of the work: **Q2's floor was already restored by the S11b reducer narrowing of 2026-07-18,
  not by the P1 filter**, which changes exactly **one record of 130**. Evidence at
  `operations/trust-layer-2026-07/runs/2026-09-04/`; script at
  `website/scripts/p1-frozen-buffer-reclassification.ts`.
- **Register D5 — CLOSED.** The row's *Item* cell is deliberately preserved in the present tense with
  a ⚠ marker saying every claim in it is false of current code and its line numbers are pre-fix. Read
  the **Status** cell, not the Item cell.
- **Option B — the H3 advisory no longer injects the S4 recommendation** (founder election). The
  grounding finding: the P1 build's re-label went into `basis`, which the harness never renders, so
  "keep re-labelled" disclosed nothing at that surface. Q7 depth calibration is untouched; the
  recommendation is still in the honest log and the API response.
- **Option C — scoped, not built.** `operations/trust-layer-2026-07/2026-09-04-C-at-action-seam-caller-SCOPE.md`.

**Nothing was activated.** No schema, flag, credential, migration, deploy, or public-doc change.
**P4/P5/P6 are unmoved. The S11 flip remains REFUSED.**

## First move: verify the record, don't trust this file

```bash
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
git fetch origin && git status -sb | head -2
git log --oneline -5
```
Expected: in sync with `origin/main`, HEAD at or after `df97b59`. **Run the real `fetch`** — the last
session opened believing a push had landed when it had not, and found it only by fetching.

```bash
cd website
npx tsx scripts/p1-frozen-buffer-reclassification.ts | grep -E "reproduced|Q2 floor|round-trip"
npx tsx src/lib/substrate/trust-core/__tests__/at-action-seam.test.ts
cd .. && node harness/gate1-pre-decision/test/negative-battery.mjs | tail -2
```
Expected: `✓ all 130 records round-trip exactly`, `✓ reproduced (129)`, `Q2 floor … HOLDS`;
`59 passed, 0 failed`; `251 passed, 0 failed` + `RELEASE GATE: PASS ✓`.

## What is genuinely open — pick ONE, or ask the founder which

None is pre-selected. The first is the only one with a deadline attached.

### Option D — put Finding E to the mentor: should the P6 window measure the recommendation?

The Option C scope found that `2026-08-15-false-hold-new-window-scoping-note.md` **never mentions the
decision table**: the new observation window measures hold *classification* — the rule's input — not
what the table *would have recommended*, which is its output. Part (3) of the readiness standard is
about false **holds**, and under G6(a) a hold is what a `do-not-proceed` produces.

This changes what the window is **for**, and P6's design has already been ruled on once, so the prior
session judged it a **mentor question rather than an AI election** and deliberately did not decide it.
**It has a sequencing deadline:** P6's contamination rule means the window must open on a stable
instrument, so if the seam is ever to serve it, the capture change must land in **R2**, dark, alongside
P8a — not after the window opens.

Work shape: a scope-for-ruling document mirroring
`2026-09-04-P1-decision-table-input-SCOPE-FOR-RULING.md`, **under PR20** (name the specific existing
mechanisms the ruling will land on, and timestamp-check every present-tense mechanism fact in it —
several facts in this area moved twice in the last two days). `governance`, documents only.

### Option E — build the Option C recommendation (needs the founder to license R2's contents first)

Wire `interventionInputFromAtAction` into the capture layer as MEASURE instrumentation, per the scope's
§7: it uses the `engagement` injection param so the seam and the loop bound key on **one** reading;
it records the recommendation and **surfaces it nowhere**; **P8a is its precondition**. Do NOT site it
in `loop-closure-gate.ts` — the scope's Finding B explains why that site structurally cannot perform
G6(a)'s act. **R2's contents are the founder's**, so ask before building; and this is probably
downstream of Option D, since D decides whether the window wants it at all.

### Option F — register D4's activation walk (founder-walked `code-critical`)

Built dark 2026-08-17, activation still open, and it has an ordering the register states explicitly:
(1) re-read D1's `justice_floor_active` for `sagereasoning:s9-loop@v1`/dikaiosyne — the harness is live
and writing, so it may have **re-latched** since the 2026-07-18 clear; (2) deploy + verify the narrowed
reducer on `origin/main` **first**; (3) only then the flag, with any SQL correction's rollback
pre-written. Carries its own R18 decision. **AC7 engages; the founder runs every live step.**

## Standing constraints that apply regardless of which option

- **The S11 flip is refused and stays refused.** Nothing in D, E or F licenses it. If a move starts to
  feel like it is building toward the flip, **stop and name that explicitly** — it needs its own
  founder-walked Critical activation per the 2026-07-12 verdict, unconditionally.
- **Neither Option A's result nor Option C's scope is progress toward the flip.** P4 (one evaluated
  cardinal domain), P5 (no denominator — the guard path writes no record) and P6 (no window started)
  are all open and untouched. A seam that exists, and a seam that is called, are both MEASURE facts.
- **D5's two `false` call sites are load-bearing.** Passing `taskHasJusticeSurface: true` without S3
  obligation routing routes to `'unevaluated'` ⇒ do-not-proceed for every agent. A genuine task-scoped
  read is a **different call site**; do not flip the existing ones.
- **Verify against source, not against this file, the close, or the decision log's prose.** The last
  two sessions each corrected themselves twice, and every correction came from running or reading the
  actual code — including one case where **the register was right and the prompt was wrong**, and one
  where this project's own recorded figure was misread as being over the wrong population.
- **Assertions: check non-vacuity by mutation.** Two assertions in one session would have passed
  vacuously — one comparing against a mistyped action literal, one asserting on a substring of a line
  being deleted. If a check is load-bearing, break the thing it guards and confirm it fails.
- **Guardrail cautions: read the grounds, don't classify by default.** The sparse-extraction
  false-positive class is real, but membership in it is a judgement. One caution last session was a
  genuine engaged reading (`kathekon quality: moderate`, role obligation engaged) and was nearly filed
  with the others.
- **Concurrency.** A standing-runner peer session has been committing to this repo on the same days.
  Commit path-scoped, run `git status` twice, and leave files this session did not author alone.

## Not in scope

- **The standing-runner design track** (`operations/agent-circles-2026-08/`) — a separate, parallel
  stream with its own open prompt
  (`2026-09-04-standing-runner-post-R10-grounding-and-await-NEXT-SESSION-PROMPT.md`). Do not fold it in
  even if its files appear in `git status`.
- **`2026-09-01-score-save-perimeter-activation-NEXT-SESSION-PROMPT.md`**, still untracked in the repo
  — it predates this stream and is not this session's responsibility unless the founder redirects.
- **The O-C Gate-3 design session** remains explicitly excluded per the founder's standing instruction.
