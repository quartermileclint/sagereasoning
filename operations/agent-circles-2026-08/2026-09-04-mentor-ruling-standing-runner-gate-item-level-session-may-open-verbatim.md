# Mentor ruling — the Option S gate is ITEM-LEVEL; the standing-runner design session MAY OPEN; Path A is the recommended route to satisfying the gate (verbatim)

**Relayed by the founder 2026-09-04**, in response to
`operations/agent-circles-2026-08/2026-09-04-MENTOR-QUESTION-standing-runner-gate-permission-to-proceed.md`
(committed `340b9e7`).

**Status: ADOPTED AS BINDING on relay, per project convention. This verbatim record wins over every
summary of it — including the decision-log entry, the annotations applied to the question document,
the register rows, `/CLAUDE.md`, and any successor prompt.**

**Recording entry:** `D-MENTOR-RULING-OPTION-S-GATE-ITEM-LEVEL-SESSION-MAY-OPEN-2026-09-04`.

**Headlines (the verbatim governs).** **Q1 — the gate is ITEM-LEVEL. Statement 1 (the 2026-08-30
source ruling) governs; A1 was "a correct answer to a question that was framed too broadly."** The
data condition attaches to **two items only** — the M/W/S floor-semantics election and R8-D7's
verdict-confidence sampling policy — which are **deferred explicitly and in writing** until the data
exists. **Everything else in the session's named-input load is not gated.** **The standing-runner
design session MAY OPEN.** **Q2 — the existing measurement (D6a n=100; c11 n=10) is informative but
NOT sufficient** for the two dependent items; **Path C is not adopted**, and the session was right
not to recommend it. **Q3 — Path A is acceptable and RECOMMENDED**: build Option S, exercise it
against the closed run's persisted candidates (29 decision-bearing — 20 winners + 9 rejections),
produce the per-input disagreement rate. **A precision the question did not name and the ruling adds:
Path A's output is the rate on a CLOSED RUN's candidate population, not on a live running loop — that
limit rides the data explicitly when the M/W/S election is made.**

**⚠ THE OPENING IS THE FOUNDER'S ACT, NOT THIS SESSION'S.** The ruling states it directly: *"Not
licensed: Activating the standing-runner design session before the founder confirms the
session-opening decision. The ruling removes the gate for the non-dependent items. **The founder opens
the session.**"* **No session opened on this ruling. This session did not open it.**

---

## The ruling, verbatim

> ## Q1 — Is the gate item-level or session-level?
>
> The gate is item-level. Statement 1 governs.
>
> The reasoning is the same principle applied in yesterday's close-gate ruling: when two statements conflict and one carries reasoning and the other does not, the one with reasoning governs. Statement 1 carries its reasoning explicitly — "That visibility is exactly what is needed before the doctrine question can be answered honestly." The doctrine question is the M/W/S floor-semantics election. The reasoning attaches the data requirement to that specific question, not to the session's opening as a whole.
>
> Statement 2 — ruling A1 — is a restatement, not an independent ruling. A1 answered the question as put: "is Option S still a precondition of opening?" The word "opening" was supplied by the question, not by Statement 1. A1 answered the question that was asked. It did not independently examine whether the gate should be session-level or item-level, because that question was not put.
>
> The document is correct that the widening is at least as likely to be the session's own drafting as the mentor's ruling, and it is right not to treat A1 as an error the mentor made. It is a correct answer to a question that was framed too broadly. The correction is therefore a correction of the question's framing, not of A1's answer.
>
> The gate as the source ruling establishes it is: Option S's disagreement-rate data must be in hand before the M/W/S floor-semantics election and R8-D7's verdict-confidence sampling policy are ruled. Those two items are deferred explicitly and in writing until the data exists. Everything else in the session's named-input load is not gated on Option S.
>
> **The standing-runner design session may open. The M/W/S election and R8-D7's sampling policy are explicitly deferred within the session until Option S's data is in hand.**
>
> ---
>
> ## Q2 — Does the existing measurement bear on the doctrine ruling at all?
>
> Partially, and not sufficiently to discharge the gate for the two dependent items.
>
> The honest read of Part 3's table is the document's own: the variance is no longer an open question in the way it was on 2026-08-30. D6a's n=100 with a published CI and c11's n=10 establish that the instrument has measurable variance, that the aggregate rate is approximately 12% on the guardrail path, and that the locked 10%→2.8%/→27% basis from c11 is consistent with D6a's later measurement. That is genuine progress.
>
> What the existing measurement does not supply is the live decision-bearing rate — the rate on real candidate texts produced by the loop in operation, not on frozen synthetic probes or a single repeated candidate. D6a's own metadata declines this generalisation explicitly: `measured_path: /api/guardrail`, consult path unmeasured; `membership_is_asserted_not_established`.
>
> The document is right not to recommend Path C. Adopting D6a as sufficient for the doctrine ruling would mean ruling on a rate the instrument's own authors marked as asserted, not established, for the relevant population.
>
> The doctrine question is not purely empirical — it is about what a floor means under sampling, and that question has a doctrinal component that data alone cannot settle. But the 2026-08-30 ruling was explicit that the visibility the data provides is what the doctrine question needs to be answered honestly. That framing treats the data as a necessary condition for honest ruling, not merely a useful input. Path C does not satisfy that condition.
>
> **The existing measurement is informative but not sufficient for the M/W/S election. The gate for those two items stands.**
>
> ---
>
> ## Q3 — What would actually satisfy the gate, and is Path A acceptable?
>
> Path A is acceptable and is the recommended path.
>
> The gate requires Option S's disagreement-rate data on decision-bearing verdicts. Path A produces exactly that: build Option S as ruled, exercise it against the closed run's persisted candidates (M8's 29 decision-bearing candidates — 20 cycle winners plus the 9 guardrail rejections), and produce a per-input disagreement rate on the real candidate population.
>
> The document's concern about circularity — that the gate requires data from a mechanism whose only natural home is the loop whose design the gate blocks — is real but dissolves under the item-level reading of Q1. The gate blocks the M/W/S election and R8-D7's sampling policy, not the session's opening. Path A requires no design session. It is a code-build plus a founder-walked run. It produces the data the gate requires. It does not depend on the standing runner being designed or the session being open.
>
> The cost estimate is credible and the approach is sound. The 29 decision-bearing candidates at K=3 produces approximately 87 calls at approximately $1.24. That is a low-cost, high-integrity path to satisfying the gate for the two dependent items.
>
> One precision the document does not name but the ruling should carry: Path A's output is the disagreement rate on the closed run's candidate population, not on a live running loop. That is a different population from what Option S would measure in steady-state operation. The ruling should carry that limit explicitly when the M/W/S election is made — the data is from a closed run's candidates, not from live decision-bearing verdicts in a running loop.
>
> That limit does not disqualify Path A. It is the honest disclosure that rides the data when it is used.
>
> **Path A is the recommended path to satisfying the gate. Build Option S, exercise it against the closed run's persisted candidates, produce the per-input disagreement rate, carry the population limit explicitly when the data is used for the M/W/S election.**
>
> ---
>
> ## What this ruling licenses and does not license
>
> **Licensed:** The standing-runner design session opening, with the M/W/S floor-semantics election and R8-D7's verdict-confidence sampling policy explicitly deferred in writing until Option S's data is in hand via Path A or live traffic. All other named inputs in the session's load proceed without that gate.
>
> **Licensed:** Path A — building Option S and exercising it against the closed run's persisted candidates — as the recommended path to satisfying the gate for the two deferred items. This is a code-build plus a founder-walked run. It is not a design act and does not require the session to be open.
>
> **Not licensed:** Activating the standing-runner design session before the founder confirms the session-opening decision. The ruling removes the gate for the non-dependent items. The founder opens the session.
>
> **Not licensed:** Using D6a's existing measurement as sufficient for the M/W/S election. Path C is not adopted.
>
> **Not licensed:** Any build, activation, schema change, or publication. The weights-BLOCKED constraint and GS-CYB-1's two conditions are untouched. The Q1 hard constraint is untouched.
>
> ---
>
> ## On the counter-case in Part 6
>
> The counter-case deserves a direct response, not just acknowledgement.
>
> The concern that design decisions taken without M/W/S settled may need revisiting when the ruling lands is real. The coupling between the generation-step design and the examination step's verdict confidence is real — the document names it honestly and does not understate it. The ruling's response is: that coupling is a reason to carry the deferral explicitly and in writing throughout the session, not a reason to block the session's opening. Design decisions made with an explicit open question named and deferred are revisable. Design decisions made without knowing the question exists are not. The session proceeds with M/W/S named as open, not resolved.
>
> The concern about re-approaching a gate hours after it was affirmed is also real and is taken seriously. The ruling's response is: the document brought new material — the mechanism facts in Part 2 — that was not before the mentor when A1 was given. A1 answered a question about whether the brief revises the gate. It did not examine whether the gate's own satisfiability had a traffic source. That examination is what Part 2 supplies. Re-approaching a gate with new mechanism facts is not the same as re-litigating a settled ruling. The document was right to bring it.
>
> The disclosure that the founder wants to proceed and the session wrote the document is the right posture. The observation history has been tracking a developing capacity to name stakes honestly rather than obscure them. This document does that. The ruling is not discounted because the session has a stake in the answer — it is assessed on the mechanism facts and the reasoning, which stand independently of the stake.

---

## Executing-session notes (not the mentor's text)

### A reading taken on the two licensing bullets, stated so it can be corrected

The ruling **licenses Path A** as *"a code-build plus a founder-walked run"* and, four lines later,
states **"Not licensed: Any build, activation, schema change, or publication."** Read literally these
collide. **The reading taken here — and it is a reading, not a ruling:** the mentor rules on
*approach and doctrine*, not on this project's own execution gating. Path A is approved **as the
route**; performing it remains a founder-elected `code-*` session under the project's own tier rules
(0d-ii, PR6, the Critical Change Protocol where it engages), which no mentor ruling substitutes for.
On that reading the two bullets are consistent: *the path is ruled acceptable; the build is still the
founder's to elect and walk.*

**This was deliberately NOT raised as a third same-week discrepancy question.** The prior two
(the close-gate contradiction; the gate's scope) were genuine because each had a substantive
consequence that turned on the reading. This one does not: under either reading, **nothing gets built
in this session**, and the founder's election is required either way. Naming it here is sufficient;
manufacturing a question from it would be pattern-following rather than examination.

### What was executed, documents-only, on relay

- This verbatim record (NEW).
- The permission question: a dated **RULED** banner carrying all three answers, the questions left
  legible beside them.
- The named-input register (`00-PRIORITY-INDEX.md`): the head-note's gate sentence — which read *"the
  gate is **unchanged** … the next design-capable session does not open until Option S is built"* —
  **corrected to the ruled item-level form**, with the superseded reading preserved and marked, and
  the receiving-session sentence at the table's head likewise corrected.
- `/CLAUDE.md`: the 2026-09-04 addendum's gate clause corrected the same way.
- `operations/decision-log.md`:
  `D-MENTOR-RULING-OPTION-S-GATE-ITEM-LEVEL-SESSION-MAY-OPEN-2026-09-04`, appended at the physical
  tail.

**Nothing else. In particular: the standing-runner design session was NOT opened**, no design element
was evaluated, Option S was not built, no candidate was re-submitted, and no code, schema, flag, or
credential was touched. **The opening is the founder's act by the ruling's own words.**

### The two elections this ruling puts to the founder (named, not pre-elected)

1. **Open the standing-runner design session**, with M/W/S and R8-D7's sampling policy carried as
   explicitly deferred in writing throughout. This needs a session prompt; none is authored yet.
2. **Path A** — a `code-*` build of Option S plus a founder-walked run against the 29 decision-bearing
   candidates of the closed run (≈87 calls at K=3, ≈$1.24 at D6a's measured mean). Independent of
   election 1: it needs no design session and can precede, follow, or run alongside it.

**Neither is pre-elected and neither is scheduled by this record.** Election 2 carries a standing
requirement from the ruling itself: **the closed-run population limit rides the data explicitly**
whenever it is used for the M/W/S election.

### What the ruling explicitly did not touch

The weights-BLOCKED constraint and GS-CYB-1's two conditions (unmet, untouched); the Q1 hard
constraint (the loop proposes, it never executes); the 2026-09-04 rulings A2–A4, B1–B4, C1–C5, D1–D5;
the nine-candidate close gate (discharged twice); the P0 0h hold, which bears on none of this and
remains the founder's.

### Cross-references

`2026-09-04-MENTOR-QUESTION-standing-runner-gate-permission-to-proceed.md` (the question this rules
on) · `2026-08-30-mentor-ruling-R8-producer-floor-semantics-verbatim.md` (Q3 — Statement 1, now
confirmed governing) ·
`2026-09-04-mentor-brief-standing-runner-design-session-and-rulings-verbatim.md` (A1 — the
restatement, now read as a correct answer to an over-broad question) ·
`2026-09-04-mentor-ruling-standing-runner-close-gate-discrepancy-verbatim.md` (the interpretive
principle this ruling applies a second time) · `2026-08-30-standing-runner-design-R8.md` §5.3
(Option S), §11 (follow-ons), §12.3 · `2026-08-16-idea-loop-S6-report.md` (the closed run) ·
`operations/agent-circles-2026-08/d6a/` (the n=100 measurement and its own disclosed limits).

*End of record. Verbatim wins.*
