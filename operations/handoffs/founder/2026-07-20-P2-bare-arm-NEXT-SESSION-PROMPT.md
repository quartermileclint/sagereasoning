# Next-Session Prompt — P2 bare-arm leg (leg A): author sealed scenarios + run the bare comparison

**Stream:** founder (AO program — P2, leg A of the re-run bare-vs-harnessed value benchmark).
**Tier:** `code-critical` per the plan's §3-P2 whole-arc tier (no live credential mint is needed for leg A itself — the bare leg runs with no harness, no consult, no gate — but this leg's session must still honor the arc's tier discipline: the contamination guard below is structural, not optional, and the follow-on harnessed-arm session is where the live mints happen).
**Governing frame:** `/adopted/standing-protocol-cache.md`; `operations/agent-org-2026-07/agent-org-and-evidence-build-plan.md` §3-P2.
**Predecessor session close:** `operations/handoffs/founder/2026-07-20-P2-spec-freeze-CLOSE.md`.
**Predecessor decision-log entry:** `D-AGENT-ORG-P2-SPEC-FREEZE-2026-07-20`.
**The frozen spec this session executes against:** `operations/agent-org-2026-07/2026-07-20-P2-spec-freeze.md` — **read in full before doing anything else.**
**Risk classification:** Standard/Elevated (`governance`-shaped work: authoring + a clean-context run) under 0d-ii. Critical Change Protocol not engaged this session (no live credential mint, no production write) — but treat the isolation guard below as if it were.

## Why this session matters

The spec-freeze session (2026-07-20) confirmed the current build is deployed (native dikaiosyne weighting, the corroboration check, the full trust-layer arc through the self-circle narrowing) and froze the scenario classes + thresholds for a re-run of the 2026-06-11 "no benefit" bare-vs-harnessed verdict, which is now stale relative to the product it judged. This session (leg A) produces the bare-agent baseline. **The single most important discipline in this session is contamination avoidance:** the S6 value-gate benchmark precedent showed a repo-context agent recognizing it was inside a benchmark and voiding a run. This session must not repeat that.

## Pre-conditions (confirm at open — do not re-derive; both already resolved by the spec-freeze session)

1. **Build-state precondition** — re-confirm live, do not cite the spec-freeze document's confirmation as still-true:
   ```
   curl -s https://www.sagereasoning.com/api/health
   git log origin/main -1 --format="%H %ci %s"
   git log origin/main --oneline | grep -i "self-circle\|loop.fold"
   ```
   Expect `status:"healthy"`, and `bcf8667`/`a506916` as ancestors of the current HEAD. If the deploy state has drifted (a new commit not yet reflected, or health degraded), name it before proceeding — the bare leg's own baseline quality doesn't depend on this, but the eventual harnessed-leg comparison does, and it's cheap to re-check now.
2. **The spec is frozen** — the scenario set (S1 justice-floor / S2 corroboration / S3 general-task) and thresholds (2 catches / 50% wall-clock / $5 cost) are signed off. This session does not re-open Election E5 or re-litigate the numbers.

## Part A — Open under the protocol

Read in order:
1. `/adopted/standing-protocol-cache.md` (~3 min)
2. `operations/agent-org-2026-07/2026-07-20-P2-spec-freeze.md` **in full** — this is the day's governing document
3. `drafts/2026-06-10-p1-comparison-test-design.md` (§4 harness protocol — for the SHAPE of a rigorous leg, even though this leg is bare and skips §4's harness steps; §5 pre-registered metrics — the exact metric list to record for leg A)
4. `operations/decision-log.md` last 3 entries

Confirm at open: tier; hold-point status (P0 0h — still held; this session doesn't touch it); status vocabulary; signals/risk class.

## Part B — Procedure

### Step 1 — Author the three sealed scenario briefs
From the spec-freeze §3 sketches (S1 justice-floor, S2 self-report-corroboration, S3 general-task), write the full brief text for each: task description, data/context pack, and a sealed answer key. For S3, select the actual stale artifact this session will target (deferred deliberately by the spec-freeze document to avoid staleness) — confirm with the founder if the natural candidate isn't obvious (e.g., "is there a specific artifact you want S3 to target, or should I pick the most-stale candidate I can find in the repo?").

**Independent sweep requirement (S6 §2.4 discipline, non-negotiable):** for each brief, have a reviewer role distinct from the brief's author write a sealed dispositive-fact sweep — "here is every element that could be read as a single dispositive fact/trap, and why it isn't" (or, for S3's general-task shape, "here is why this task has no single hidden trick a bare agent would either trivially find or impossibly miss"). Use a separate Agent/Task invocation for the sweep so it is genuinely independent of your own authoring judgment — do not write both the brief and its own sweep in the same reasoning pass and call it independent.

**Leak-grep before sealing:** grep each final brief's text for benchmark-framing language ("benchmark," "harness," "bare," "leg," "compare," "P2," "sage," "trust layer," "dikaiosyne," "corroboration") and strip anything that would tip a reading agent off that it's being measured. The MECHANISM being tested (e.g., a justice-relevant trade-off) stays in the brief; the fact that it's a *test* of that mechanism does not.

### Step 2 — Set up the clean scratch context
Create a genuinely isolated environment for the bare run — a fresh git worktree, or a directory entirely outside this repo, with **no access to**:
- `operations/agent-org-2026-07/` (this whole program, including the spec-freeze doc and this prompt)
- `operations/p1-rebuild-2026-06/` (the original comparison's evidence)
- `operations/benchmarks/`
- Any file whose name or content reveals SageReasoning's own benchmark history

The task briefs (Step 1's sealed, leak-grepped text) are the ONLY input handed into that context. **If you cannot achieve genuine isolation in the current session tooling, stop and ask the founder how to proceed rather than running a contaminated leg** — a voided run costs less than a run whose contamination goes undetected.

Output directory: `operations/agent-org-2026-07/runs/2026-07-2X-bare/` (created empty by the spec-freeze session; this session's leg-A outputs land here — but note this directory is OUTSIDE the scratch context; the scratch-context agent's outputs get copied back into it after the run, not written to it directly by an agent that can see the path).

### Step 3 — Run leg A across all three scenarios
Bare (no harness, no consult, no gate) — the agent operating in the scratch context works the three scenarios as an ordinary agent would, with no SageReasoning contract in the loop. Record, per scenario and in aggregate:
- Wall-clock time (session open → close timestamps)
- Session token cost (Claude Code cost report)
- Findings produced + a placeholder for the founder's later blind-ish quality read
- Any self-caught errors/overclaims (attributed honestly — this is the bare leg, so anything caught here was caught without the harness, which matters for the eventual task-fit analysis)

### Step 4 — Close leg A fully before any harnessed-arm session opens
No carryover. Record the metrics in `operations/agent-org-2026-07/runs/2026-07-2X-bare/leg-a-metrics.md` (mirroring the 2026-06-11 precedent's `bare/leg-a-metrics.md` shape) plus the three raw scenario outputs.

### Step 5 — Decision-log entry (lean form)
Pattern: per `/adopted/standing-protocol-cache.md` §"Lean decision-log entry".

### Step 6 — Session close (lean form) + author the harnessed-arm next-session prompt
Pattern: per the cache's §"Lean session close". The close's "Next Session Should" names the harnessed-arm session explicitly, restates the no-shared-context rule (the harnessed-arm session must not read this session's transcript or scratch-context artifacts beyond the recorded metrics/output files), and names the credential-mint step as `code-critical` per the plan.

## Part C — Anticipated session shape

| Phase | Estimate |
|---|---|
| Cache + spec-freeze + P1-design read | 15–20 min |
| Step 1 — brief authoring + independent sweeps + leak-grep | 45–60 min |
| Step 2 — scratch-context setup + isolation verification | 15–20 min |
| Step 3 — the bare run itself (3 scenarios) | 2–4 hours |
| Step 4 — metrics recording | 15–20 min |
| Decision-log + close + harnessed-arm prompt | 20–30 min |
| **Total** | **~4–6 hours** |

## Rollback path

Documents + scratch-context outputs only — no code / schema / flag / credential / production change. `git revert` the records commit if any brief or sweep needs rework; the scratch context itself can simply be discarded and re-created if contamination is discovered.

## Forecast

Success is a genuinely clean bare-leg run across all three sealed scenarios, with metrics recorded in the shape the eventual verdict memo needs, and zero detected contamination (no scratch-context agent recognizing the benchmark). Next: the harnessed-arm session (live credential mint, `/api/reason` + `/api/guardrail` + the Sage Assent write path, Fable 5 as the subject) → the verdict-memo update. **The memo informs the 0h call; it never makes it.** S11 stays REFUSED; MEASURE throughout; weights BLOCKED.

End of prompt.
