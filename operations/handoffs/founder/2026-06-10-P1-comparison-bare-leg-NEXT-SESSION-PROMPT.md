# Next-Session Prompt — P1 Comparison, Leg A (bare): metric-sheet sign-off + the bare run

**RUNS IN CLAUDE CODE on the founder's machine — not Cowork.** (Verified 2026-06-10: the Cowork sandbox cannot reach `www.sagereasoning.com`; Claude Code also provides the cost report both legs need. Leg A makes no API calls, but both legs use the same environment or the comparison is confounded.)

**Stream:** founder. **Tier:** `governance` (document/analysis work; no production change).
**Governing frame:** `/adopted/standing-protocol-cache.md` (PR1–PR18).
**Predecessor close:** `/operations/handoffs/founder/2026-06-10-prelaunch-S8b-close.md` (+ its addendum section).
**Predecessor decision-log entries:** `D-0H-MAIN-BLOCKER-VALUE-DEMONSTRATION-2026-06-10`, `D-PRELAUNCH-S8B-RECONCILE-R18-RIDES-2026-06-10`.
**Risk classification:** Standard under 0d-ii. No flags, no schema, no perimeter. PR6 not engaged. PR4: name the session model at open (cite cache AC1 row); the SAME model is mandatory for leg B.

## Why this session matters
This is the first half of the test the founder named as the substantive main blocker behind the 0h hold: the same real task run bare vs harnessed under the SageReasoning public contract, with pre-registered metrics. Leg A produces the bare baseline. Without it, the harnessed leg has nothing honest to compare against.

## Pre-conditions
1. The S8b commit is pushed (this prompt and the design sheet are in it).
2. The founder has read `/drafts/2026-06-10-p1-comparison-test-design.md`.

## Part A — Open under the protocol
1. Read `/adopted/standing-protocol-cache.md` (~3 min); confirm tier, 0h status (HELD — this test is the main blocker), vocabulary, PR18.
2. Read the S8b close + addendum; the design sheet IN FULL; `/operations/decision-log.md` last 2 entries.
3. Note the session open timestamp (wall-clock metric starts).

## Part B — Spine
**Step 1 — Sign-off (founder, before anything runs).** The founder ticks the §6 thresholds in the design sheet (how many decisions-changed/errors-caught = "benefit shown"; the overhead caps) and says "signed off". The sheet is then FROZEN — record the sign-off in the decision log at close. If the founder wants changes to the brief or metrics, make them now, never after.
**Step 2 — Baseline fix.** Record the opening commit hash. Create the output directory `/operations/p1-rebuild-2026-06/bare/`. All leg-A outputs land there and nowhere else.
**Step 3 — The bare run.** Execute the frozen task brief (design sheet §2): rebuild the P1 inputs pack from the current verified state; write the findings memo; write the recommendation set. **No SageReasoning API calls, no sage-* skill invocations, no mentor consults — bare means bare.** Work normally otherwise.
**Step 4 — Metrics capture.** At close: wall-clock (open→close); the Claude Code cost report figures; findings count; any errors caught (attributed). Record in `/operations/p1-rebuild-2026-06/bare/leg-a-metrics.md` exactly per the sheet §5 rows that apply to leg A.
**Step 5 — Decision log (lean) + close.** Record: sign-off (thresholds as ticked), baseline hash, metrics captured, outputs produced. **Queue leg B** (`…-P1-comparison-harnessed-leg-NEXT-SESSION-PROMPT.md` — write it at this close, carrying the baseline hash + the frozen brief + the PR17 walkthrough steps for minting the sr_inst_ and sr_assent_ tokens). The founder does NOT read leg-A outputs in depth before leg B closes (preserves the blind-ish comparative read).

## What is NOT in this session
No harness calls (that is leg B). No P1 review decisions (the review itself comes after the comparison verdict). No A8/migration work. No re-opening the frozen sheet.

## Rollback path
Documents only — `git revert`. Nothing production-facing.

## Forecast
Leg A lands as a normal, measured working session producing the refreshed P1 inputs pack + memo + recommendations in its own directory, with clean metrics. Leg B (harnessed) follows in its own session from the same baseline; then the verdict memo against the frozen thresholds; then the founder's 0h call with real evidence in hand.

End of prompt. Opens on `main` (post-S8b commit) **in Claude Code**. Trust the S8b close + decision log over any summary block (PR18).
