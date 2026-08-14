# Next session — open on informed foundations, then receive the founder's instruction

**Paste this as the FIRST message of a new session.** This prompt has **no task of its own.** Its
entire job is to bring the session to a verified, current grounding and then **stop and wait** — the
founder will supply a detailed, complex instruction once grounding is confirmed. Do not guess at the
instruction, do not pick an item off the standing queue, do not self-start anything.

**Tier: not yet classifiable — classify when the instruction arrives** (per
`/adopted/standing-protocol-cache.md` 0d-ii, and state the classification before acting on it). The
grounding pass itself is read-only plus at most one `git` state check; nothing in it needs a tier
above `code-standard`.

---

## Step 1 — Read the standing opener, current version

`operations/handoffs/founder/STANDING-SESSION-OPENER-grounded-foundations.md` — **Version
2026-08-15** (confirm the version stamp at the top; if it reads 2026-08-12 or earlier you have a
stale checkout — `git pull` first). Read it in full, including:

- the **2026-08-15 amendment box** (the eight-point summary of the 08-12→08-15 window),
- the **⚠️ box** on the live IDEA-loop validation run (15 cycles as of the snapshot — **re-derive**),
- Part B's new section **"The window since 2026-08-12"** (C-1 live; twelve mentor rulings executed;
  the three OPEN scoping sessions; the byte-identity-guard collision; the two documentation records
  with their premise corrections; the n=1 harness data + survivorship warning),
- the **standing queue**, especially items 11 (RLS prompt authored and ready), 15 (the guard
  decision — six items blocked on one ~30-minute call), 23 (the three open sessions + the
  "who runs them" ambiguity), and 24 (housekeeping).

The opener is the primary grounding document. This prompt does not restate it; where they disagree,
re-derive from primary sources per the opener's own discipline.

## Step 2 — Run the parallel-window pre-flight, fresh

`operations/handoffs/founder/2026-08-10-idea-loop-parallel-window-NEXT-SESSION-PROMPT.md`, steps
1–3, exactly as written. **Do not inherit a mode or cycle count from the opener or from memory.**
Note specifically:

- The run was at **15 completed cycles** on 2026-08-14 (first `null_cycle` at 15). The Mode 3
  trigger range opens at **20 completed cycles** — this session may be the first to find the run
  in, or near, Mode 3 territory. If the pre-conditions query shows ≥20 AND the founder confirms the
  runner has reported back, say so explicitly before anything else: **Mode 3 (the §6 report) takes
  precedence over any queued item and feeds the mentor before any standing-runner design.**
- If a `*-CHANGE-SPEC.md` or `*-BLOCKED.md` file (other than the resolved
  `NOT-SELECTED-CHANGE-SPEC.md`) exists in the scratch project → **Mode 1**, read it in full first.
- Otherwise → Mode 2, ordinary work under the fences.

## Step 3 — Verify the working-tree and push state

```bash
git fetch origin && git log origin/main..HEAD --oneline && git status --short
```

At this prompt's writing, **`02b6643` and `0941a47` were unpushed** (this environment cannot
authenticate to GitHub — pushes are the founder's, from their own terminal). If they are still
unpushed, tell the founder before doing anything that builds on their content. Expected strays are
listed in the opener's Part A item 7; do not "clean up" the four live IDEA-loop handoff prompts.

## Step 4 — Confirm grounding with a short readback, then STOP

Post a readback of **no more than ~15 lines** stating:

1. Opener version read (2026-08-15) and the three facts most relevant to whatever the founder is
   likely to ask (your judgement — but the guard collision, the three OPEN sessions, and the run's
   current mode are strong candidates).
2. The parallel-window **mode** this session is in (1 / 2 / 3), from the fresh pre-flight, with the
   current completed-cycle count from the query, not from any document.
3. Push state (clean, or which commits await the founder's push).
4. Any **surprise** — anything found during grounding that contradicts the opener or CLAUDE.md
   (there is one known: CLAUDE.md's C15 Item 3 line is stale — "uncommitted/undeployed" is false
   since `3e26dc9`; confirm rather than re-litigate). A surprise beyond the known one is worth
   naming before the instruction arrives, not after.
5. **Then: "Grounded. Ready for the instruction."** — and wait.

## What NOT to do in this session's opening

- **Do not** start any queue item, however ready it looks (item 11's prompt is authored precisely so
  the founder can paste it into its *own* session when elected).
- **Do not** decide the byte-identity guard's scope — that is queue item 15, a founder/mentor call;
  this session flagged it twice and deliberately did not take it.
- **Do not** run any of the three OPEN scoping sessions — the "who runs them" ambiguity (queue item
  23) is unresolved, and they await the mentor.
- **Do not** touch the fenced surfaces (parallel-window prompt, Mode 2 list) for any reason short of
  a Mode 1 blocking spec.
- **Do not** treat the at-action frame's timeouts as anomalies to investigate — ~79% loss is the
  measured, disclosed state of the channel (opener Part D); proceed deliberately when frames fail
  open, per standing practice.

## Context the instruction will likely assume (one-paragraph orientation)

The project is in P0 Foundations, 0h held (the founder's call, unchanged). The trust layer S1–S10 is
live under MEASURE; weights are BLOCKED; ENFORCE is S11, readiness-gated. The IDEA-loop bounded
validation run is the most operationally live thread and its §6 report gates the ATRF scoping
session, the standing-runner design, S6's reordering decision, and the GS-ATRF-2 migration. Three
mentor-opened `governance` scoping sessions are OPEN and awaiting ruling. Twelve mentor rulings from
2026-08-12/13 are fully executed and recorded; two of their edicts (the L4 header amendment, the
sympatheia citation fix) are **blocked on the byte-identity guard**, whose scope is the sharpest
open decision. GS-ATRF-1/2/3 remain open; nothing pre-answers them. The Q1 hard constraint — **the
loop proposes; it never executes** — is binding and doctrinally grounded (a proposal is a
*phantasia*; the election is the *synkatathesis*; Q1 ≡ L4 Q4.3 at two scales).

---

**Forecast.** Success = the session reaches "Grounded. Ready for the instruction." within ~15
minutes, with a mode determination made from live data, the push state verified, and no work
started — so that the founder's complex instruction lands on a session that already knows what is
live, what is open, what is blocked, and why.

*End of prompt.*
