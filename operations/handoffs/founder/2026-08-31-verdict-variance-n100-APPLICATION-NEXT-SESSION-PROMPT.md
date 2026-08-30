# Next-session prompt — apply the signed n=100 verdict-variance wording

> **ERRATUM — the date in this document's filename is wrong.** It is filed as **2026-08-31**; the day
> it was authored was **2026-08-30**. The error was the executing session's, caught only when quota
> arithmetic would not reconcile, and disclosed to the mentor as fact 9 of the pooled-sweep question.
> **Every measurement date INSIDE this document is correct** — the D6a sweeps were run on 2026-08-30.
> The file is **deliberately not renamed**: this document is cited by filename elsewhere in the
> repository, and renaming a cited record — a binding mentor verbatim among them — would break those
> references to hide a clerical error rather than record it. Recorded 2026-08-30.

**Paste this as the task after the standing session opener.** Authored 2026-08-30 at the close of the
session that signed it. **Authoring this prompt licensed nothing.**

## Tier

**`code-elevated`.** Live public-contract surfaces plus the battery-locked `TRUST_RECORD_ENVELOPE`.
No auth, perimeter, encryption, or schema surface; **no flag is flipped; no behaviour changes.**
**AC7 is NOT engaged.**

## The gates are already discharged — do not re-run them

**The wording is signed** (`2026-08-30-verdict-variance-n100-WORDING-FOR-SIGNATURE.md`, marked SIGNED
in its own banner) **and PR19 has run on it** (eleven findings, two blocking, all folded at `628fadd`).

**Two honest limits on that, stated so you can weigh them rather than discover them:**
- The founder signed on a summary, not a line-by-line reading. The banner says so.
- **The PR19 fold is self-verified.** No second review ran on it, by founder election, after three
  wording drafts and five instrument reviews in one day. **This arc's own record is that fold rounds
  introduce defects.** If you have budget for one review before applying, that is where it goes —
  and check *coverage*, not arithmetic (see "what keeps going wrong" below).

## Read at open — the verbatims win over this prompt

- `2026-08-30-mentor-ruling-pooled-sweep-n100-verbatim.md` — **governs the wording**
- `2026-08-31-mentor-ruling-directional-split-probe-composition-verbatim.md` — prior, **misdated**,
  still binding except where the n=100 ruling supersedes it (it supersedes the attribution sentence
  and the whole directional decomposition)
- The three 2026-08-30 rulings on rate-presentation, disclosure and rate-location
- `D-VERDICT-VARIANCE-APPLIED-THEN-SUPERSEDED-TWICE-N100-SIGNED-2026-08-30`
- `2026-08-30-verdict-variance-n100-signed-CLOSE.md`

## What is settled and must not be re-litigated

| Ruled | Effect |
|---|---|
| Publish **n=100** now | 0.12, Wilson **7.0–19.8%**, n=100, 12 disagreements |
| The disclosure is **designed for revision** | A third sweep superseding this is correct, not a problem |
| The **directional decomposition is not published at all** | Per-probe distributions **0, 0, 2, 2, 8 of 20** replace it |
| The force-push claim is **indeterminacy** | Not "refuses 7 in 10" — the gate has **no predictable behaviour** toward it |
| The falsification record **stands as recorded** | No post-hoc reinterpretation; "calibration falsification" is **pinned** (S2-54) |
| Class limit at **K=20** | Distinguished from the anchor **solely** by p5-force (p=0.0033) |

## Ordering — unchanged from the precedent this arc has followed twice

1. **Edit 1, one commit:** `TRUST_RECORD_ENVELOPE` + the ADR-013 §8 dated amendment + battery pins
   **together**. Retire **S2-51** as a decision (its 5.6–23.8% is superseded) the way S2-49 was —
   do not let it surface as a broken test. Add **S2-58/59/60/61**. **Do not touch S2-54.**
2. Then the R18 surfaces: `llms.txt` (**three places**), `agent-card.json` (**two extensions**),
   api-docs. **Seven places, four files** — a previous draft missed the fifth and the letters jumped.
3. **Re-derive** the agent-card extension count from the file. Do not quote it.
4. **Live-verify by `curl`** after the founder's push.

## What keeps going wrong — read this before drafting anything

**Six review rounds this arc; not one found a wrong number. Every blocking defect was coverage.**
Specifically, and each one actually happened:
- A replacement range naming an end marker **that does not exist in the live text**.
- A range starting too late, leaving a stale sentence standing beside its replacement.
- An extension's `description` left carrying prohibited text two lines above corrected `params`.
- A whole live surface missed because the section letters skipped one.
- A pinned phrase dropped, which would have failed the battery *and* softened what the pin protects.

**Apply by quoted first-words/last-words against the live file, and diff every surface after.**

## Carried items

| # | Item | Whose |
|---|---|---|
| 1 | **Restore the quota**: `UPDATE api_keys SET daily_limit = 200 WHERE id = '4d96307f-2c19-4c82-a1fe-bd901c3bee4d';` — raised to 400 for the sweep, which is done | Founder |
| 2 | **The date correction** — 17 commits and 4 documents filed as 2026-08-31; the day was 2026-08-30. Recommend renaming the four documents, leaving the commits, noting it | Founder |
| 3 | A **third sweep** — not needed; the rate held to the digit across two. Only if something else motivates it | Founder |
| 4 | The **`p5-force` class question** — it is the sole distinguishing member of its own class. Whether the probe set should be re-designed is a live question the rulings did not reach | Founder / mentor |

## Standing constraints — unchanged

- **Weights-BLOCKED.** Nothing in the sweep, the rulings, or the wording bears on the deferred
  M-vs-W ruling in either direction.
- **Q1 — the loop proposes; it never executes.** D6a is not in the loop's path.
- **The §A boundary.** Nothing consumes D6a's output as a signal into generation or election.
- **Path-specificity is binding.** The rate is `/api/guardrail` ONLY; `/api/reason` is unmeasured and
  must be stated as unknown wherever the rate appears.
- **`summary <dir>` overwrites `<dir>/d6a-rate.json`.** There is now a guard requiring
  `D6A_ALLOW_OVERWRITE=1`. Never point it at `runs/`.
- **Concurrency:** `ListAgents` at open; `git status` twice; path-scoped commits; never `git add -A`;
  append shared records at the physical tail.
- Nothing here bears on the 0h call, which remains the founder's.

## State at authoring

- Live surfaces carry the **sweep-1 (n=50)** wording. **It is accurate for the sample it describes.**
- The signed n=100 wording is **not applied**.
- Evidence: `d6a-rate-POOLED-n100-2026-08-30.json` (pooled) beside the unchanged sweep-1
  `d6a-rate.json`, verified **byte-identical to `350dd29`**.
- The instrument is at `6004f58`+ with five review rounds folded; it emits the Wilson interval, the
  per-probe attribution, and a modal-split warning.
- **Session honesty note:** at-action Gate-2 checks were unavailable on a 28s timeout for much of the
  authoring session; several that did return fired the G3 elicitation, answered genuinely in
  conversation. The answers repeatedly named the same stake — wanting the work to read as finished —
  and that stake is the one this prompt's "what keeps going wrong" section exists to counter.

## What "done" looks like

Seven places updated in the ruled order with the pins; S2-51 retired as a decision and S2-54 left
alone; extension count re-derived; live-verified by `curl` after the push; a decision-log entry at the
tail; a lean close. **No figure is in dispute — the work is entirely one of coverage.**

End of prompt.
