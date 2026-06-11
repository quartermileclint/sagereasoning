# Next-Session Prompt — P1 Comparison Verdict Memo: the result against the frozen boxes

**Stream:** founder. **Tier:** `governance` — Standard risk under 0d-ii (one document; no production touch).
**Governing frame:** `/adopted/standing-protocol-cache.md` (PR1–PR18).
**Predecessor closes:** `/operations/handoffs/founder/2026-06-11-P1-comparison-leg-A-close.md` + `/operations/handoffs/founder/2026-06-11-P1-comparison-leg-B-close.md`.
**Predecessor decision-log entries:** `D-P1-COMPARISON-LEG-A-BARE-2026-06-11`, `D-P1-COMPARISON-LEG-B-HARNESSED-2026-06-11`.
**Model:** any (no parity constraint — the comparison legs are done; this session only reads and judges).

## Why this session matters

This is the third and final session of the 0h main-blocker test. Both legs ran the same frozen brief from the same baseline on the same model. This session opens the frozen design sheet's §6 for the first time since sign-off, reads both packs, and states the result against the thresholds **exactly as ticked (2 / 50% / $5) — either outcome stands**. The founder's 0h call follows it.

## Hard discipline

1. **Now the sheet opens:** read `/drafts/2026-06-10-p1-comparison-test-design.md` §5 + §6 in full — first time since the freeze.
2. **The founder reads blind-ish first, before the AI compares:** founder reads `bare/` then `harnessed/` content outputs (or vice versa) and rates findings quality per the sheet's §5 row, *before* this session's AI produces any side-by-side. The founder's quality ratings are input, not output.
3. **No re-litigation:** the thresholds are as ticked. The memo may *note* measurement caveats (e.g. leg B's wall-clock includes the founder-performed credential phase; two consults + one gate were structurally unmeterable) but applies the boxes as written.
4. **Either outcome stands.** A "harness not demonstrated" result is recorded with the same care as a pass — it feeds the 0h call honestly either way.

## Part A — Open under the protocol

1. `/adopted/standing-protocol-cache.md`; confirm tier (governance/Standard); 0h HELD (this session produces the main-blocker evidence verdict).
2. Both leg closes + both decision-log entries.
3. The frozen sheet §5 + §6 (now permitted).
4. **Check both `/cost` rows are filled** (`bare/leg-a-metrics.md`, `harnessed/leg-b-metrics.md`) — if either is missing, it is gone; the memo records the gap honestly (KG5).

## Part B — Procedure

### Step 1 — Founder's blind-ish quality read (walked live, PR17)
Founder reads the three content outputs of each leg and rates findings quality (sheet §5 row). Capture the ratings verbatim in-session.

### Step 2 — Build the comparison table
All §5 rows side-by-side from the two metrics files: wall-clock (state both legs' conventions and the leg-B composition note), token cost, harness cost, findings count + founder quality ratings, decisions-changed (leg B's incorporation-log list — assess each of the 4 against "material"), errors caught (leg A: 2; leg B: 2 attributed + the write/read asymmetry — assess which the *other* leg missed, which is the §6 criterion's actual wording: "caught by the harness that the bare leg missed").
**The overlap question decides much:** F2-class errors (pre-pivot contradiction) were caught by BOTH legs → not creditable to the harness. F12 (mint-defaults drift) and the write/read asymmetry exist ONLY in leg B and were unreachable by a documents-only bare run → the memo must reason honestly about whether "unreachable by the bare leg's design" counts as "the bare leg missed" (the sheet's wording governs; founder adjudicates if ambiguous).

### Step 3 — Apply the three boxes as ticked
- **≥2 material decisions changed / errors caught that the bare leg missed** — from Step 2's honest accounting.
- **≤50% wall-clock overhead** — state the arithmetic plainly (leg A ~17 min deliverables; leg B 74m45s; note the composition caveat, apply the box as written).
- **≤$5 total harness cost** — measured 76¢ billed / ~$0.50 est. Anthropic-side; state plainly.
All three are AND'd per the sign-off. State PASS/FAIL per box, then the conjunction.

### Step 4 — Write the verdict memo
`/operations/p1-rebuild-2026-06/verdict-memo.md`: the table, the three box results, the conjunction, the founder's quality ratings verbatim, the measurement caveats, and a short "what the harness actually did" narrative (the incorporation log is the source). End with the decision the founder now makes (0h call) and what each branch implies. The memo recommends nothing about the thresholds themselves.

### Step 5 — Lean decision-log entry + lean close
Per the cache templates. Queue: the founder's 0h call; then A8 mapping or the supporting blockers per the founder's election.

## What is NOT in this session

No new comparison runs. No threshold re-litigation. No P1 review decisions (P1 reads the verdict memo first — recommendation R10 of the harnessed pack names the P1 decision list). No fixes to the product findings (F12 etc. are queued items, not this session).

## Rollback path

One document — `git revert`.

End of prompt. Both legs are committed history; the sheet's §6 governs; either outcome stands.
